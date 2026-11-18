import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { setOrderStatus } from "@/lib/db";
import { orderStatuses, type OrderStatus } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await params;
  const { status } = (await req.json().catch(() => ({}))) as { status?: OrderStatus };
  if (!status || !orderStatuses.includes(status)) return NextResponse.json({ error: "Bad status." }, { status: 400 });

  // Cancelling restocks the items in the same transaction.
  const { error } = await setOrderStatus(id, status);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
