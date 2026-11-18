import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByCode } from "@/lib/db";
import { drop, paymentMethods, pickupPoints } from "@/lib/config";
import { money } from "@/lib/format";
import { CancelOrder } from "./CancelOrder";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const steps: { id: OrderStatus; label: string; note: string }[] = [
  { id: "received", label: "Order received", note: "You're in this week's bulk order" },
  { id: "confirmed", label: "Bought from the farm", note: "The team has bought your share" },
  { id: "packed", label: "Packed", note: "Bagged and labelled with your code" },
  { id: "ready", label: "Ready for pickup", note: "Come say hi at the table" },
  { id: "collected", label: "Collected", note: "Enjoy! See you next week" },
];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { code } = await params;
  const { new: isNew } = await searchParams;
  const order = await getOrderByCode(code);
  if (!order) notFound();

  const pickup = pickupPoints.find((p) => p.id === order.pickupPoint);
  const payment = paymentMethods.find((p) => p.id === order.payment);
  const current = steps.findIndex((s) => s.id === order.status);
  const cancelled = order.status === "cancelled";
  const pickupDay = new Date(`${order.dropDate}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const firstName = order.customer.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {isNew && (
        <div className="mb-8 rounded-2xl bg-leaf px-6 py-5 text-white">
          <p className="font-hand text-3xl text-yolk">You&apos;re in, {firstName}!</p>
          <p className="mt-1 text-white/85">
            Screenshot your code below. You&apos;ll show it at the pickup table.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        {/* Pickup ticket */}
        <div className="h-fit overflow-hidden rounded-2xl border-2 border-dashed border-forest/30 bg-white">
          <div className="bg-forest px-6 py-5 text-center text-paper">
            <p className="text-xs uppercase tracking-[0.25em] text-sprout/80">Pickup code</p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-widest">{order.code}</p>
          </div>
          <dl className="space-y-3 px-6 py-5 text-sm">
            <Item label="When">{pickupDay} · {drop.pickupWindow}</Item>
            <Item label="Where">
              {pickup?.name}
              <span className="block text-xs text-muted">{pickup?.hint}</span>
            </Item>
            <Item label="Pay">{payment?.name}</Item>
            <Item label="Total">
              <span className="font-display text-xl font-bold text-forest">{money(order.total)}</span>
              {order.marketTotal > order.total && (
                <span className="ml-2 text-xs text-leaf">saved {money(order.marketTotal - order.total)}</span>
              )}
            </Item>
          </dl>
        </div>

        {/* Status */}
        <div className="rounded-2xl bg-white shadow-soft p-6">
          <h2 className="font-display text-xl font-bold">Status</h2>
          {cancelled ? (
            <p className="mt-4 rounded-xl bg-[#fbe4e1] px-4 py-3 text-sm text-tomato">
              This order was cancelled. Nothing to pay.
            </p>
          ) : (
            <ol className="mt-4">
              {steps.map((s, i) => {
                const done = i <= current;
                return (
                  <li key={s.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < steps.length - 1 && (
                      <span className={`absolute left-[11px] top-6 h-full w-0.5 ${i < current ? "bg-leaf" : "bg-line"}`} />
                    )}
                    <span
                      className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                        done ? "border-leaf bg-leaf text-white" : "border-line bg-white"
                      } ${i === current ? "ring-4 ring-sprout" : ""}`}
                    >
                      {done && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                          <path d="M2.5 6.5l2.2 2L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p className={`font-semibold ${done ? "text-ink" : "text-muted"}`}>{s.label}</p>
                      <p className="text-xs text-muted">{s.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white shadow-soft p-6">
        <h2 className="font-display text-xl font-bold">What&apos;s in your bag</h2>
        <ul className="mt-3 divide-y divide-hair text-sm">
          {order.lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-4 py-2.5">
              <span>
                <span className="font-semibold">{l.qty} ×</span> {l.name} <span className="text-muted">({l.unit})</span>
              </span>
              <span className="tabular-nums">{money(l.qty * l.price)}</span>
            </li>
          ))}
        </ul>
        {order.notes && <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm text-muted">Note: {order.notes}</p>}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold text-leaf hover:underline">← Back to the shop</Link>
        {order.status === "received" && <CancelOrder code={order.code} />}
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
