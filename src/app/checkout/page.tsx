"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { ProductArt } from "@/components/ProductArt";
import { PickupText } from "@/components/DropCountdown";
import { drop, paymentMethods, pickupPoints } from "@/lib/config";
import { money } from "@/lib/format";
import { Busy } from "@/components/Spinner";

export default function CheckoutPage() {
  const { items, total, marketTotal, clear } = useCart();
  const router = useRouter();
  const [pickup, setPickup] = useState<string>(pickupPoints[0].id);
  const [payment, setPayment] = useState<string>(paymentMethods[0].id);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          studentId: f.get("studentId"),
          notes: f.get("notes"),
          pickupPoint: pickup,
          payment,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      try {
        localStorage.setItem("campus-basket-last-phone", String(data.phone));
      } catch {}
      clear();
      router.push(`/order/${data.code}?new=1`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (items.length === 0 && !busy) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ProductArt art="box" category="boxes" alt="" className="mx-auto h-32 w-32 rounded-full" />
        <h1 className="mt-6 font-display text-3xl font-bold text-forest">Nothing to check out yet</h1>
        <p className="mt-2 text-muted">Add a few things from this week&apos;s drop first.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-forest px-6 py-3 font-semibold text-paper">
          Go shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap pb-32 pt-6 sm:py-10 lg:pb-10">
      <Link href="/shop" className="text-sm text-muted hover:text-leaf">← Keep shopping</Link>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">Reserve your groceries</h1>
      <p className="mt-1 text-muted">
        For pickup on <strong className="text-ink"><PickupText long /></strong>, {drop.pickupWindow}. You pay when you collect.
      </p>

      <form id="checkout" onSubmit={submit} className="mt-6 grid gap-8 sm:mt-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Fieldset step="1" title="Who's collecting?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" required autoComplete="name" placeholder="Ama Mensah" />
              <Field label="Phone (MoMo)" name="phone" required type="tel" autoComplete="tel" placeholder="024 123 4567" />
              <Field label="Student ID" name="studentId" optional placeholder="10234567" />
            </div>
          </Fieldset>

          <Fieldset step="2" title="Where will you pick up?">
            <div className="grid gap-3 sm:grid-cols-3">
              {pickupPoints.map((p) => (
                <Choice key={p.id} name="pickup" checked={pickup === p.id} onChange={() => setPickup(p.id)} title={p.name} hint={p.hint} />
              ))}
            </div>
          </Fieldset>

          <Fieldset step="3" title="How will you pay?">
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((p) => (
                <Choice key={p.id} name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} title={p.name} hint={p.hint} />
              ))}
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-semibold">Anything we should know? <span className="font-normal text-muted">(optional)</span></span>
              <textarea
                name="notes"
                rows={2}
                maxLength={500}
                placeholder="e.g. riper plantain please, my friend Kofi may collect for me"
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 outline-none focus:border-leaf focus:ring-2 focus:ring-sprout"
              />
            </label>
          </Fieldset>
        </div>

        <aside className="h-fit rounded-2xl bg-white shadow-soft p-5 lg:sticky lg:top-32">
          <h2 className="font-display text-lg font-bold">Your basket</h2>
          <ul className="mt-3 max-h-72 divide-y divide-hair overflow-y-auto">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2.5">
                <ProductArt art={i.art} image={i.image} alt="" className="h-11 w-11 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <p className="text-xs text-muted">{i.qty} × {i.unit}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{money(i.qty * i.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1.5 border-t border-dashed border-hair pt-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>At the market</span>
              <span className="line-through tabular-nums">{money(marketTotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Delivery & fees</span>
              <span>{money(0)}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-semibold">You pay at pickup</span>
              <span className="font-display text-2xl font-bold text-forest tabular-nums">{money(total)}</span>
            </div>
          </div>
          {marketTotal > total && (
            <p className="mt-3 rounded-lg bg-mint px-3 py-2 text-center font-hand text-xl text-leaf">
              That&apos;s {money(marketTotal - total)} back in your pocket
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-[#fbe4e1] px-3 py-2 text-sm text-tomato">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="mt-4 hidden w-full rounded-full bg-forest py-3.5 font-semibold text-paper transition hover:bg-forest-2 disabled:opacity-60 lg:block"
          >
            {busy ? <Busy text="Reserving…" /> : "Place my order"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">Free to cancel until the team starts buying.</p>
        </aside>
      </form>

      {/* Phones: order button always within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hair bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        {error && <p role="alert" className="mb-2 text-sm text-tomato">{error}</p>}
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-xs text-muted">Pay at pickup</p>
            <p className="font-display text-xl font-bold text-forest tabular-nums">{money(total)}</p>
          </div>
          <button
            type="submit"
            form="checkout"
            disabled={busy}
            className="rounded-full bg-forest px-6 py-3.5 font-semibold text-paper transition hover:bg-forest-2 disabled:opacity-60"
          >
            {busy ? <Busy text="Reserving…" /> : "Place my order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Fieldset({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-4 flex items-center gap-3 font-display text-xl font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-yolk text-sm text-forest">{step}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, optional, ...rest }: { label: string; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </span>
      <input
        {...rest}
        className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 outline-none focus:border-leaf focus:ring-2 focus:ring-sprout"
      />
    </label>
  );
}

function Choice({ name, checked, onChange, title, hint }: { name: string; checked: boolean; onChange: () => void; title: string; hint: string }) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col rounded-xl border-2 bg-white p-4 transition ${
        checked ? "border-leaf bg-mint" : "border-line hover:border-leaf/50"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border-2 ${checked ? "border-leaf bg-leaf" : "border-line"}`}>
        {checked && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span className="pr-6 font-semibold">{title}</span>
      <span className="mt-0.5 text-xs text-muted">{hint}</span>
    </label>
  );
}
