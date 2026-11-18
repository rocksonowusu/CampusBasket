import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { setBuyingCheck } from "@/lib/db";

/** Tick / untick an item on the buying list for a drop. Shared by the whole team. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { drop, productId, checked } = (await req.json().catch(() => ({}))) as { drop?: string; productId?: string; checked?: boolean };
  if (!drop || !/^\d{4}-\d{2}-\d{2}$/.test(drop) || !productId || typeof checked !== "boolean") {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  await setBuyingCheck(drop, productId, checked);
  return NextResponse.json({ ok: true });
}
