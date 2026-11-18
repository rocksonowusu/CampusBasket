// One-time import of the existing JSON data into Postgres. Safe to re-run: rows that already
// exist are left untouched (ON CONFLICT DO NOTHING), so it never overwrites edits made in the dashboard.
//   data/products.json  -> products
//   data/orders.json    -> orders        (if present)
//   data/uploads/*      -> uploads       (if present)
// Run: npm run db:seed
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

// pg already treats sslmode=require as verify-full; say so explicitly (strict TLS, no warning)
const url = (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "").replace("sslmode=require", "sslmode=verify-full");
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set. Run `neon env pull` (or `neon deploy`) first.");
  process.exit(1);
}

const readJSON = async (file) => {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", file), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
};

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query("BEGIN");

  const products = await readJSON("products.json");
  let p = 0;
  for (const x of products) {
    const r = await client.query(
      `INSERT INTO products (id, name, unit, category, price, market_price, stock, farm, art, image, description, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
      [x.id, x.name, x.unit, x.category, x.price, x.marketPrice, x.stock, x.farm, x.art, x.image ?? null, x.description ?? null, x.active],
    );
    p += r.rowCount;
  }

  const orders = await readJSON("orders.json");
  let o = 0;
  for (const x of orders) {
    const r = await client.query(
      `INSERT INTO orders (id, code, created_at, drop_date, customer_name, customer_phone, student_id, pickup_point, payment, notes, lines, total, market_total, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (id) DO NOTHING`,
      [x.id, x.code, x.createdAt, x.dropDate, x.customer.name, x.customer.phone, x.customer.studentId ?? null, x.pickupPoint, x.payment,
       x.notes ?? null, JSON.stringify(x.lines), x.total, x.marketTotal, x.status],
    );
    o += r.rowCount;
  }

  let u = 0;
  const types = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
  const updir = path.join(process.cwd(), "data", "uploads");
  const files = await readdir(updir).catch(() => []);
  for (const f of files) {
    const ext = f.split(".").pop();
    if (!types[ext]) continue;
    const r = await client.query(
      "INSERT INTO uploads (name, content_type, data) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING",
      [f, types[ext], await readFile(path.join(updir, f))],
    );
    u += r.rowCount;
  }

  await client.query("COMMIT");
  console.log(`seeded: ${p}/${products.length} products, ${o}/${orders.length} orders, ${u}/${files.length} uploads (existing rows skipped)`);
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  await client.end();
}
