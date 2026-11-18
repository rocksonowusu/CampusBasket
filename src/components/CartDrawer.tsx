"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { QtyStepper } from "./QtyStepper";
import { money } from "@/lib/format";
import { PickupText } from "./DropCountdown";

export function CartDrawer() {
  const { items, open, setOpen, setQty, total, marketTotal, count } = useCart();
  const saved = marketTotal - total;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-forest/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Your basket"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-hair px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-bold">Your basket</h2>
            <p className="text-xs text-muted">
              {count} item{count === 1 ? "" : "s"} · for pickup <PickupText />
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-line"
            aria-label="Close basket"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ProductArt art="box" alt="" className="h-36 w-36 rounded-full" category="boxes" />
            <p className="mt-5 font-hand text-3xl text-forest">Your basket&apos;s empty</p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Grab a Week-One Box if you don&apos;t know where to start. It covers most of a week.
            </p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="mt-5 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest"
            >
              Browse this week&apos;s drop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-hair overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 py-4">
                  <ProductArt art={i.art} image={i.image} alt={i.name} className="h-16 w-16 shrink-0 rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="truncate font-semibold">{i.name}</p>
                      <p className="font-semibold tabular-nums">{money(i.price * i.qty)}</p>
                    </div>
                    <p className="text-xs text-muted">{i.unit}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper size="sm" qty={i.qty} max={i.stock} onChange={(q) => setQty(i.id, q)} />
                      <button onClick={() => setQty(i.id, 0)} className="text-xs text-muted underline-offset-2 hover:text-tomato hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-hair bg-white px-5 py-5">
              {saved > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-mint px-4 py-3">
                  <span className="text-sm text-forest">
                    You&apos;re saving vs. the market
                  </span>
                  <span className="font-hand text-2xl font-bold text-leaf">{money(saved)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-muted">Total</span>
                <span className="font-display text-2xl font-bold tabular-nums">{money(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Pay with MoMo or cash when you collect. No fees.</p>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="mt-4 block rounded-full bg-forest py-3.5 text-center font-semibold text-paper transition hover:bg-forest-2"
              >
                Reserve my groceries →
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
