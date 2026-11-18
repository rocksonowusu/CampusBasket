import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { insertProduct } from "@/lib/db";
import { parseProductPatch } from "@/lib/productInput";
import type { Product } from "@/lib/types";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { patch, error } = parseProductPatch(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (!patch.name || !patch.unit || !patch.category || patch.price === undefined) {
    return NextResponse.json({ error: "Name, unit, aisle and price are required." }, { status: 400 });
  }

  const product: Product = {
    id: `${slug(patch.name)}-${Date.now().toString(36)}`,
    name: patch.name,
    unit: patch.unit,
    category: patch.category,
    price: patch.price,
    marketPrice: patch.marketPrice ?? patch.price,
    stock: patch.stock ?? 0,
    farm: patch.farm || "Wholesale partner",
    art: patch.art ?? "box",
    image: patch.image,
    description: patch.description,
    active: patch.active ?? true,
    supplierId: patch.supplierId ?? undefined,
    bundle: patch.bundle ?? undefined,
  };
  try {
    await insertProduct(product);
  } catch (e) {
    if ((e as { code?: string }).code === "23503") return NextResponse.json({ error: "That supplier no longer exists. Refresh and pick again." }, { status: 400 });
    throw e;
  }
  return NextResponse.json({ ok: true, product });
}
