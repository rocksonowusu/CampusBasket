import "server-only";
import { parseEnv } from "@neon/env";
import pg from "pg";
import config from "../../neon";
import type { BundleItem, Order, OrderLine, OrderStatus, Product, Supplier } from "./types";

// Neon Postgres via node-postgres. This app runs as a long-lived Node server (next start), so one
// shared Pool on the POOLED connection string is the right fit (per the Neon postgres skill).
// Migrations use the direct URL instead: see scripts/migrate.mjs.

// numeric -> number, date -> 'YYYY-MM-DD' string (no timezone shifting)
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v)));
pg.types.setTypeParser(1082, (v) => v);

/** pg treats sslmode=require as verify-full already; say so explicitly to keep strict TLS and silence its warning. */
const strictTls = (url: string) => url.replace(/sslmode=require\b/, "sslmode=verify-full");

const globalForDb = globalThis as unknown as { cbPool?: pg.Pool };
function pool() {
  if (!globalForDb.cbPool) {
    const { postgres } = parseEnv(config, ["DATABASE_URL"]);
    globalForDb.cbPool = new pg.Pool({ connectionString: strictTls(postgres.databaseUrl), max: 10, idleTimeoutMillis: 30_000 });
  }
  return globalForDb.cbPool;
}

async function tx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query("BEGIN");
    const out = await fn(c);
    await c.query("COMMIT");
    return out;
  } catch (err) {
    await c.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    c.release();
  }
}

/* ---------- mapping ---------- */

// farm shows the linked supplier's name when there is one (falls back to the free-text farm)
const PRODUCT_COLS =
  "p.id, p.name, p.unit, p.category, p.price, p.market_price, p.stock, COALESCE(s.name, p.farm) AS farm, p.art, p.image, p.description, p.active, p.supplier_id, p.bundle";
const PRODUCT_FROM = "products p LEFT JOIN suppliers s ON s.id = p.supplier_id";
type ProductRow = {
  id: string; name: string; unit: string; category: Product["category"]; price: number; market_price: number;
  stock: number; farm: string; art: Product["art"]; image: string | null; description: string | null; active: boolean;
  supplier_id: string | null; bundle: BundleItem[] | null;
};
const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  unit: r.unit,
  category: r.category,
  price: r.price,
  marketPrice: r.market_price,
  stock: r.stock,
  farm: r.farm,
  art: r.art,
  image: r.image ?? undefined,
  description: r.description ?? undefined,
  active: r.active,
  supplierId: r.supplier_id ?? undefined,
  bundle: r.bundle ?? undefined,
});

const ORDER_COLS =
  "id, code, created_at, drop_date, customer_name, customer_phone, student_id, pickup_point, payment, notes, lines, total, market_total, status";
type OrderRow = {
  id: string; code: string; created_at: Date; drop_date: string; customer_name: string; customer_phone: string;
  student_id: string | null; pickup_point: Order["pickupPoint"]; payment: Order["payment"]; notes: string | null;
  lines: OrderLine[]; total: number; market_total: number; status: OrderStatus;
};
const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  code: r.code,
  createdAt: r.created_at.toISOString(),
  dropDate: r.drop_date,
  customer: { name: r.customer_name, phone: r.customer_phone, studentId: r.student_id ?? undefined },
  pickupPoint: r.pickup_point,
  payment: r.payment,
  notes: r.notes ?? undefined,
  lines: r.lines,
  total: r.total,
  marketTotal: r.market_total,
  status: r.status,
});

/* ---------- products ---------- */

export async function getProducts(): Promise<Product[]> {
  const { rows } = await pool().query<ProductRow>(`SELECT ${PRODUCT_COLS} FROM ${PRODUCT_FROM} ORDER BY p.sort_order`);
  return rows.map(toProduct);
}

export async function insertProduct(p: Product) {
  await pool().query(
    `INSERT INTO products (id, name, unit, category, price, market_price, stock, farm, art, image, description, active, supplier_id, bundle)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      p.id, p.name, p.unit, p.category, p.price, p.marketPrice, p.stock, p.farm, p.art, p.image ?? null, p.description ?? null, p.active,
      p.supplierId ?? null, p.bundle ? JSON.stringify(p.bundle) : null,
    ],
  );
}

const PATCHABLE: Record<string, string> = {
  name: "name", unit: "unit", category: "category", price: "price", marketPrice: "market_price", stock: "stock",
  farm: "farm", art: "art", image: "image", description: "description", active: "active",
  supplierId: "supplier_id", bundle: "bundle",
};

/** Update the given fields. `null` clears image/description. Returns false if the product doesn't exist. */
export async function updateProduct(id: string, patch: Partial<Record<keyof Product, unknown>>): Promise<boolean> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    const col = PATCHABLE[k];
    if (!col || v === undefined) continue;
    vals.push(col === "bundle" && v !== null ? JSON.stringify(v) : v);
    sets.push(`${col} = $${vals.length}`);
  }
  if (sets.length === 0) {
    const { rowCount } = await pool().query("SELECT 1 FROM products WHERE id = $1", [id]);
    return !!rowCount;
  }
  vals.push(id);
  const { rowCount } = await pool().query(
    `UPDATE products SET ${sets.join(", ")}, updated_at = now() WHERE id = $${vals.length}`,
    vals,
  );
  return !!rowCount;
}

export async function deleteProduct(id: string): Promise<boolean> {
  // Past orders keep their own snapshot of name/price (orders.lines), so history is unaffected.
  const { rowCount } = await pool().query("DELETE FROM products WHERE id = $1", [id]);
  return !!rowCount;
}

/* ---------- orders ---------- */

export async function getOrders(): Promise<Order[]> {
  const { rows } = await pool().query<OrderRow>(`SELECT ${ORDER_COLS} FROM orders ORDER BY created_at DESC`);
  return rows.map(toOrder);
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const { rows } = await pool().query<OrderRow>(`SELECT ${ORDER_COLS} FROM orders WHERE upper(code) = upper($1)`, [code]);
  return rows[0] ? toOrder(rows[0]) : null;
}

/**
 * Atomically check stock, decrement it and save the order. Product rows are locked
 * (SELECT … FOR UPDATE), so two students can't both buy the last item.
 */
export function placeOrder(
  productIds: string[],
  build: (products: Product[]) => Order | { error: string },
): Promise<Order | { error: string }> {
  return tx(async (c) => {
    const { rows } = await c.query<ProductRow>(
      `SELECT ${PRODUCT_COLS} FROM ${PRODUCT_FROM} WHERE p.id = ANY($1::text[]) ORDER BY p.id FOR UPDATE OF p`,
      [productIds],
    );
    const result = build(rows.map(toProduct));
    if ("error" in result) return result;
    for (const l of result.lines) {
      await c.query("UPDATE products SET stock = stock - $1, updated_at = now() WHERE id = $2", [l.qty, l.productId]);
    }
    await c.query(
      `INSERT INTO orders (${ORDER_COLS}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        result.id, result.code, result.createdAt, result.dropDate, result.customer.name, result.customer.phone,
        result.customer.studentId ?? null, result.pickupPoint, result.payment, result.notes ?? null,
        JSON.stringify(result.lines), result.total, result.marketTotal, result.status,
      ],
    );
    return result;
  });
}

async function restock(c: pg.PoolClient, lines: OrderLine[]) {
  for (const l of lines) {
    // a product may have been deleted since; restocking it is then a no-op
    await c.query("UPDATE products SET stock = stock + $1, updated_at = now() WHERE id = $2", [l.qty, l.productId]);
  }
}

/** Team dashboard status change. Cancelling puts the items back in stock. */
export function setOrderStatus(id: string, status: OrderStatus): Promise<{ error?: string }> {
  return tx(async (c) => {
    const { rows } = await c.query<OrderRow>(`SELECT ${ORDER_COLS} FROM orders WHERE id = $1 FOR UPDATE`, [id]);
    const o = rows[0];
    if (!o) return { error: "Order not found." };
    if (o.status === "cancelled") return { error: "Cancelled orders can't be reopened. Ask the student to order again." };
    await c.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
    if (status === "cancelled") await restock(c, o.lines);
    return {};
  });
}

/** Student self-cancel from the order page: phone must match and the team mustn't have started. */
export function cancelOrderByCustomer(code: string, phoneMatches: (stored: string) => boolean): Promise<{ error?: string }> {
  return tx(async (c) => {
    const { rows } = await c.query<OrderRow>(`SELECT ${ORDER_COLS} FROM orders WHERE upper(code) = upper($1) FOR UPDATE`, [code]);
    const o = rows[0];
    if (!o) return { error: "Order not found." };
    if (!phoneMatches(o.customer_phone)) return { error: "That phone number doesn't match this order." };
    if (o.status !== "received") return { error: "This order is already being packed. Message the team on WhatsApp." };
    await c.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [o.id]);
    await restock(c, o.lines);
    return {};
  });
}

/* ---------- uploaded photos ---------- */

export async function saveUpload(name: string, contentType: string, data: Buffer) {
  await pool().query("INSERT INTO uploads (name, content_type, data) VALUES ($1, $2, $3)", [name, contentType, data]);
}

/* ---------- suppliers ---------- */

type SupplierRow = { id: string; name: string; contact_name: string | null; phone: string | null; location: string | null; notes: string | null };
const toSupplier = (r: SupplierRow): Supplier => ({
  id: r.id,
  name: r.name,
  contactName: r.contact_name ?? undefined,
  phone: r.phone ?? undefined,
  location: r.location ?? undefined,
  notes: r.notes ?? undefined,
});
const SUPPLIER_FIELDS: Record<string, string> = { name: "name", contactName: "contact_name", phone: "phone", location: "location", notes: "notes" };

export async function getSuppliers(): Promise<Supplier[]> {
  const { rows } = await pool().query<SupplierRow>("SELECT id, name, contact_name, phone, location, notes FROM suppliers ORDER BY name");
  return rows.map(toSupplier);
}

export async function insertSupplier(id: string, data: Record<string, string | null>): Promise<Supplier> {
  const { rows } = await pool().query<SupplierRow>(
    `INSERT INTO suppliers (id, name, contact_name, phone, location, notes) VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, name, contact_name, phone, location, notes`,
    [id, data.name, data.contactName ?? null, data.phone ?? null, data.location ?? null, data.notes ?? null],
  );
  return toSupplier(rows[0]);
}

export async function updateSupplier(id: string, data: Record<string, string | null>): Promise<boolean> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(data)) {
    const col = SUPPLIER_FIELDS[k];
    if (!col) continue;
    vals.push(v);
    sets.push(`${col} = $${vals.length}`);
  }
  vals.push(id);
  const sql = sets.length
    ? `UPDATE suppliers SET ${sets.join(", ")} WHERE id = $${vals.length}`
    : `SELECT 1 FROM suppliers WHERE id = $${vals.length}`;
  const { rowCount } = await pool().query(sql, vals);
  return !!rowCount;
}

/** Delete a supplier; its products keep the supplier's name as their farm label and become unlinked. */
export function deleteSupplier(id: string): Promise<boolean> {
  return tx(async (c) => {
    await c.query("UPDATE products p SET farm = s.name FROM suppliers s WHERE s.id = $1 AND p.supplier_id = s.id", [id]);
    const { rowCount } = await c.query("DELETE FROM suppliers WHERE id = $1", [id]);
    return !!rowCount;
  });
}

/* ---------- buying list ticks (shared by the whole team) ---------- */

export async function getBuyingChecks(dropDate: string): Promise<string[]> {
  const { rows } = await pool().query<{ product_id: string }>("SELECT product_id FROM buying_checks WHERE drop_date = $1", [dropDate]);
  return rows.map((r) => r.product_id);
}

export async function setBuyingCheck(dropDate: string, productId: string, checked: boolean) {
  if (checked) {
    await pool().query("INSERT INTO buying_checks (drop_date, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [dropDate, productId]);
  } else {
    await pool().query("DELETE FROM buying_checks WHERE drop_date = $1 AND product_id = $2", [dropDate, productId]);
  }
}

export async function getUpload(name: string): Promise<{ contentType: string; data: Buffer } | null> {
  const { rows } = await pool().query<{ content_type: string; data: Buffer }>(
    "SELECT content_type, data FROM uploads WHERE name = $1",
    [name],
  );
  return rows[0] ? { contentType: rows[0].content_type, data: rows[0].data } : null;
}
