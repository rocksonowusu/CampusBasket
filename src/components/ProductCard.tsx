"use client";

import type { Product } from "@/lib/types";
import { money, percentOff } from "@/lib/format";
import { ProductArt } from "./ProductArt";
import { useCart } from "./CartProvider";

function BasketIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9h18l-2 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" strokeLinejoin="round" />
      <path d="M8 9l3-6M16 9l-3-6M9 13v4M15 13v4" strokeLinecap="round" />
    </svg>
  );
}

/** Square outlined basket button; becomes a compact stepper once added. */
function AddControl({ p }: { p: Product }) {
  const { add, qtyOf, setQty } = useCart();
  const qty = qtyOf(p.id);

  if (p.stock <= 0) return <span className="text-xs font-semibold text-muted">Sold out</span>;

  if (qty === 0) {
    return (
      <button
        onClick={() => add(p)}
        aria-label={`Add ${p.name} to basket`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-forest transition hover:border-leaf hover:bg-leaf hover:text-white active:scale-90"
      >
        <BasketIcon />
      </button>
    );
  }
  return (
    <div className="flex h-9 shrink-0 items-center rounded-lg bg-leaf text-white">
      <button onClick={() => setQty(p.id, qty - 1)} aria-label="Remove one" className="grid h-9 w-7 place-items-center rounded-lg font-bold hover:bg-forest">
        −
      </button>
      <span className="min-w-4 text-center text-sm font-bold tabular-nums" aria-live="polite">{qty}</span>
      <button
        onClick={() => setQty(p.id, qty + 1)}
        disabled={qty >= p.stock}
        aria-label="Add one"
        className="grid h-9 w-7 place-items-center rounded-lg font-bold hover:bg-forest disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

function Price({ p, big = false }: { p: Product; big?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={`font-display font-bold leading-none text-ink tabular-nums ${big ? "text-xl" : "text-lg"}`}>{money(p.price)}</div>
      {p.marketPrice > p.price && (
        <div className="mt-1 truncate text-[12px] text-muted">
          <span className="hidden sm:inline">Market </span>
          <span className="line-through">{money(p.marketPrice)}</span>
        </div>
      )}
    </div>
  );
}

/** Store-style card: white box, inset photo, name + subtitle, price row with basket button. */
export function ProductCard({ product: p }: { product: Product }) {
  const off = percentOff(p.price, p.marketPrice);
  const low = p.stock > 0 && p.stock <= 10;

  return (
    <article className="group flex h-full flex-col rounded-2xl bg-white p-2 shadow-soft transition hover:shadow-[0_12px_28px_-16px_rgba(23,63,42,0.35)]">
      <div className="relative overflow-hidden rounded-xl">
        <ProductArt
          art={p.art}
          category={p.category}
          image={p.image}
          alt={p.name}
          className="aspect-square w-full transition duration-300 group-hover:scale-[1.04]"
        />
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-tomato px-1.5 py-0.5 text-[11px] font-bold text-white">−{off}%</span>
        )}
        {low && (
          <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-semibold text-tomato">
            Only {p.stock} left
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <h3 className="line-clamp-1 text-[15px] font-semibold text-ink">{p.name}</h3>
        <p className="truncate text-[13px] text-muted">
          {p.unit} · {p.farm}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <Price p={p} />
          <AddControl p={p} />
        </div>
      </div>
    </article>
  );
}

/** Wider card for pre-packed boxes. */
export function BoxCard({ product: p }: { product: Product }) {
  const off = percentOff(p.price, p.marketPrice);
  const save = p.marketPrice - p.price;
  return (
    <article className="group flex h-full flex-col rounded-2xl bg-white p-2 shadow-soft transition hover:shadow-[0_12px_28px_-16px_rgba(23,63,42,0.35)]">
      <div className="relative overflow-hidden rounded-xl">
        <ProductArt art={p.art} category={p.category} image={p.image} alt={p.name} className="aspect-[16/10] w-full transition duration-300 group-hover:scale-[1.03]" />
        {off > 0 && <span className="absolute left-2 top-2 rounded-md bg-tomato px-1.5 py-0.5 text-[12px] font-bold text-white">−{off}%</span>}
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <h3 className="text-base font-semibold text-ink">{p.name}</h3>
        <p className="text-[13px] text-muted">{p.unit}</p>
        {p.description && <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink/70">{p.description}</p>}
        {save > 0 && <p className="mt-2 text-[12px] font-semibold text-leaf">You save {money(save)}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price p={p} big />
          <AddControl p={p} />
        </div>
      </div>
    </article>
  );
}
