import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteSupplier, updateSupplier } from "@/lib/db";
import { parseSupplier } from "@/lib/productInput";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const { data, error } = parseSupplier((await req.json().catch(() => ({}))) as Record<string, unknown>, false);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    if (!(await updateSupplier(id, data))) return NextResponse.json({ error: "Supplier not found." }, { status: 404 });
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return NextResponse.json({ error: "A supplier with that name already exists." }, { status: 409 });
    throw e;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  if (!(await deleteSupplier(id))) return NextResponse.json({ error: "Supplier not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
