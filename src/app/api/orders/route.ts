import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import { placeOrder } from "@/lib/db";
import { paymentMethods, pickupPoints } from "@/lib/config";
import { nextPickup, toISODate } from "@/lib/format";
import type { Order, OrderLine } from "@/lib/types";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion at the pickup table

function makeCode() {
  const bytes = randomBytes(4);
  return "CB-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

interface Body {
  name?: string;
  phone?: string;
  studentId?: string;
  pickupPoint?: string;
  payment?: string;
  notes?: string;
  items?: { id: string; qty: number }[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.replace(/[^\d+]/g, "") ?? "";
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (phone.length < 9) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  const pickup = pickupPoints.find((p) => p.id === body.pickupPoint);
  if (!pickup) return NextResponse.json({ error: "Choose a pickup point." }, { status: 400 });
  const payment = paymentMethods.find((p) => p.id === body.payment);
  if (!payment) return NextResponse.json({ error: "Choose how you'll pay." }, { status: 400 });
  const items = (body.items ?? []).filter((i) => Number.isInteger(i.qty) && i.qty > 0);
  if (items.length === 0) return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });

  const result = await placeOrder(items.map((i) => i.id), (products) => {
    const lines: OrderLine[] = [];
    for (const item of items) {
      const p = products.find((x) => x.id === item.id && x.active);
      if (!p) return { error: "Something in your basket is no longer available. Please refresh." };
      if (p.stock < item.qty) {
        return { error: p.stock > 0 ? `Only ${p.stock} × ${p.name} (${p.unit}) left.` : `${p.name} just sold out.` };
      }
      // Prices always come from the server, never the browser.
      lines.push({ productId: p.id, name: p.name, unit: p.unit, price: p.price, marketPrice: p.marketPrice, qty: item.qty });
    }
    const order: Order = {
      id: randomUUID(),
      code: makeCode(),
      createdAt: new Date().toISOString(),
      dropDate: toISODate(nextPickup()),
      customer: { name, phone, studentId: body.studentId?.trim() || undefined },
      pickupPoint: pickup.id,
      payment: payment.id,
      notes: body.notes?.trim().slice(0, 500) || undefined,
      lines,
      total: lines.reduce((s, l) => s + l.price * l.qty, 0),
      marketTotal: lines.reduce((s, l) => s + l.marketPrice * l.qty, 0),
      status: "received",
    };
    return order;
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ code: result.code, phone: result.customer.phone });
}
