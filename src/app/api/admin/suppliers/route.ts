import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { insertSupplier } from "@/lib/db";
import { parseSupplier } from "@/lib/productInput";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { data, error } = parseSupplier((await req.json().catch(() => ({}))) as Record<string, unknown>, true);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const supplier = await insertSupplier(`${slug(data.name!)}-${Date.now().toString(36).slice(-4)}`, data);
    return NextResponse.json({ ok: true, supplier });
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return NextResponse.json({ error: "A supplier with that name already exists." }, { status: 409 });
    throw e;
  }
}
