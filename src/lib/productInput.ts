import { categories } from "./config";
import type { ArtKind, BundleItem, Product } from "./types";

export const artKinds: ArtKind[] = [
  "box", "tomato", "onion", "pepper", "carrot", "cabbage", "leaf", "plantain", "banana",
  "orange", "pineapple", "sack", "beans", "bread", "egg", "chicken", "bottle", "jar",
];

const num = (v: unknown) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : undefined;
};
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

/** Images may be bundled photos, uploads served by our API, or empty (fall back to illustration). */
function cleanImage(v: unknown): string | null | undefined {
  if (v === null || v === "") return null;
  if (typeof v !== "string") return undefined;
  return /^\/(photos|api\/uploads)\/[\w.\-]+$/.test(v) ? v : undefined;
}

/** Validate a partial product update coming from the dashboard. */
export function parseProductPatch(body: Record<string, unknown>): { patch: Partial<Product>; error?: string } {
  const patch: Partial<Product> = {};
  const name = str(body.name, 80);
  if (name !== undefined) {
    if (name.length < 2) return { patch, error: "Name is too short." };
    patch.name = name;
  }
  const unit = str(body.unit, 40);
  if (unit !== undefined) {
    if (!unit) return { patch, error: "Unit is required (e.g. 1 kg)." };
    patch.unit = unit;
  }
  if (body.category !== undefined) {
    if (!categories.some((c) => c.id === body.category)) return { patch, error: "Pick a valid aisle." };
    patch.category = body.category as Product["category"];
  }
  const farm = str(body.farm, 80);
  if (farm !== undefined) patch.farm = farm || "Wholesale partner";
  if (body.description !== undefined) patch.description = str(body.description, 300) || undefined;
  if (body.art !== undefined) {
    if (!artKinds.includes(body.art as ArtKind)) return { patch, error: "Unknown illustration." };
    patch.art = body.art as ArtKind;
  }
  const image = cleanImage(body.image);
  if (image !== undefined) patch.image = image ?? undefined;
  const price = num(body.price);
  if (body.price !== undefined) {
    if (price === undefined || price <= 0) return { patch, error: "Price must be more than 0." };
    patch.price = price;
  }
  const marketPrice = num(body.marketPrice);
  if (body.marketPrice !== undefined) {
    if (marketPrice === undefined) return { patch, error: "Market price must be a number." };
    patch.marketPrice = marketPrice;
  }
  const stock = num(body.stock);
  if (body.stock !== undefined) {
    if (stock === undefined) return { patch, error: "Stock must be 0 or more." };
    patch.stock = Math.floor(stock);
  }
  if (typeof body.active === "boolean") patch.active = body.active;

  if (body.supplierId !== undefined) {
    if (body.supplierId !== null && (typeof body.supplierId !== "string" || !/^[\w-]{1,80}$/.test(body.supplierId))) {
      return { patch, error: "Pick a valid supplier." };
    }
    (patch as Record<string, unknown>).supplierId = body.supplierId; // null clears the link
  }

  if (body.bundle !== undefined) {
    if (body.bundle === null) (patch as Record<string, unknown>).bundle = null;
    else if (!Array.isArray(body.bundle) || body.bundle.length > 30) return { patch, error: "Box contents look wrong." };
    else {
      const items: BundleItem[] = [];
      for (const raw of body.bundle as unknown[]) {
        const it = raw as { productId?: unknown; qty?: unknown };
        const qty = typeof it.qty === "string" ? Number(it.qty) : it.qty;
        if (typeof it.productId !== "string" || !it.productId) continue; // skip empty rows
        if (typeof qty !== "number" || !Number.isFinite(qty) || qty <= 0 || qty > 100) {
          return { patch, error: "Each item in the box needs a quantity above 0." };
        }
        items.push({ productId: it.productId, qty: Math.round(qty * 100) / 100 });
      }
      (patch as Record<string, unknown>).bundle = items.length ? items : null;
    }
  }
  return { patch };
}

/** Validate supplier fields from the dashboard. */
export function parseSupplier(body: Record<string, unknown>, requireName: boolean): { data: Record<string, string | null>; error?: string } {
  const data: Record<string, string | null> = {};
  const name = str(body.name, 80);
  if (name !== undefined) {
    if (name.length < 2) return { data, error: "Supplier name is too short." };
    data.name = name;
  } else if (requireName) return { data, error: "Supplier name is required." };
  for (const [k, max] of [["contactName", 80], ["phone", 30], ["location", 120], ["notes", 500]] as const) {
    const v = str(body[k], max);
    if (v !== undefined) data[k] = v || null;
  }
  return { data };
}
