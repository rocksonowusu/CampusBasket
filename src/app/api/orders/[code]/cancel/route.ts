import { NextResponse } from "next/server";
import { cancelOrderByCustomer } from "@/lib/db";

const digits = (s: string) => s.replace(/\D/g, "").slice(-9);

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { phone } = (await req.json().catch(() => ({}))) as { phone?: string };
  if (!phone) return NextResponse.json({ error: "Enter the phone number you ordered with." }, { status: 400 });

  // Locks the order, checks phone + status, cancels and restocks in one transaction.
  const { error } = await cancelOrderByCustomer(code, (stored) => digits(phone) === digits(stored));
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
