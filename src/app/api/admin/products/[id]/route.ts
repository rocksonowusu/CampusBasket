import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteProduct, updateProduct } from "@/lib/db";
import { parseProductPatch } from "@/lib/productInput";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { patch, error } = parseProductPatch(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  let found: boolean;
  try {
    found = await updateProduct(id, {
      ...patch,
      // explicit clears: removing a photo or emptying the description stores NULL
      image: body.image === null || body.image === "" ? null : patch.image,
      description: body.description === "" ? null : patch.description,
    });
  } catch (e) {
    if ((e as { code?: string }).code === "23503") return NextResponse.json({ error: "That supplier no longer exists. Refresh and pick again." }, { status: 400 });
    throw e;
  }
  if (!found) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  if (!(await deleteProduct(id))) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
