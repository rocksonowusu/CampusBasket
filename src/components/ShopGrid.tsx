"use client";

import { useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { categories, type CategoryId } from "@/lib/config";
import { money, percentOff } from "@/lib/format";
import { BoxCard, ProductCard } from "./ProductCard";

type Sort = "featured" | "price" | "savings";
type View = "aisles" | "deals" | CategoryId;

function sortList(list: Product[], sort: Sort) {
  if (sort === "price") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "savings") return [...list].sort((a, b) => percentOff(b.price, b.marketPrice) - percentOff(a.price, a.marketPrice));
  return list;
}

export function ShopGrid({ products }: { products: Product[] }) {
  const [view, setView] = useState<View>("aisles");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const topRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => products.filter((p) => p.active), [products]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    active.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [active]);

  const search = q.trim().toLowerCase();
  const results = useMemo(() => {
    let list = active;
    if (view === "deals") list = sortList(list.filter((p) => p.category !== "boxes"), "savings").slice(0, 12);
    else if (view !== "aisles") list = list.filter((p) => p.category === view);
    if (search) list = list.filter((p) => `${p.name} ${p.farm} ${p.description ?? ""}`.toLowerCase().includes(search));
    return view === "deals" ? list : sortList(list, sort);
  }, [active, view, search, sort]);

  const showAisles = view === "aisles" && !search;

  function go(v: View) {
    setView(v);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const title = search
    ? `Results for “${q.trim()}”`
    : view === "deals"
      ? "Biggest savings this week"
      : categories.find((c) => c.id === view)?.name;

  return (
    <div>
      <PromoTiles products={active} onDeals={() => go("deals")} onVeg={() => go("veg")} onBoxes={() => go("boxes")} />

      <div ref={topRef} className="scroll-mt-32 pt-12">
        {/* Controls */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <Chip active={view === "aisles"} onClick={() => go("aisles")}>All aisles</Chip>
            {categories.map((c) => (
              <Chip key={c.id} active={view === c.id} onClick={() => go(c.id)}>
                {c.name}
                <span className="ml-1.5 opacity-50">{counts[c.id] ?? 0}</span>
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">Search groceries</span>
              <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tomatoes, gari, eggs…"
                className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-base outline-none sm:text-sm focus:border-leaf focus:ring-2 focus:ring-sprout"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-leaf sm:text-sm"
              aria-label="Sort"
            >
              <option value="featured">Featured</option>
              <option value="price">Lowest price</option>
              <option value="savings">Biggest saving</option>
            </select>
          </div>
        </div>

        {showAisles ? (
          <div className="mt-10 space-y-12">
            {categories.map((c, i) => {
              const items = sortList(active.filter((p) => p.category === c.id), sort);
              if (items.length === 0) return null;
              const boxes = c.id === "boxes";
              return (
                <div key={c.id} className="space-y-12">
                  <Aisle title={c.name} blurb={c.blurb} count={items.length} onSeeAll={() => go(c.id)}>
                    {items.map((p) => (
                      <div key={p.id} className={`shrink-0 snap-start ${boxes ? "w-[300px] sm:w-[360px]" : "w-[172px] sm:w-[196px] lg:w-[212px]"}`}>
                        {boxes ? <BoxCard product={p} /> : <ProductCard product={p} />}
                      </div>
                    ))}
                  </Aisle>
                  {i === 1 && <TrustStrip />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h3 className="font-display text-2xl font-bold text-forest">
                {title}
                <span className="ml-2 text-base font-normal text-muted">{results.length}</span>
              </h3>
              <button onClick={() => { setQ(""); go("aisles"); }} className="text-sm font-semibold text-leaf hover:underline">
                ← All aisles
              </button>
            </div>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((p) =>
                  p.category === "boxes" ? (
                    <div key={p.id} className="col-span-2">
                      <BoxCard product={p} />
                    </div>
                  ) : (
                    <ProductCard key={p.id} product={p} />
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-10 text-center">
                <p className="font-hand text-3xl text-forest">Nothing here this week</p>
                <p className="mt-1 text-sm text-muted">Try another search, or tell us what to source for the next drop.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Promo tiles ---------- */

function PromoTiles({
  products,
  onDeals,
  onVeg,
  onBoxes,
}: {
  products: Product[];
  onDeals: () => void;
  onVeg: () => void;
  onBoxes: () => void;
}) {
  const produce = products.filter((p) => p.category !== "boxes");
  const best = sortList(produce, "savings")[0];
  const maxOff = best ? percentOff(best.price, best.marketPrice) : 0;
  const veg = products.find((p) => p.id === "tomatoes") ?? products.find((p) => p.category === "veg");
  const box = products.find((p) => p.id === "box-exam") ?? products.find((p) => p.category === "boxes");

  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
      <Tile
        tone="bg-kraft"
        eyebrow="Deal of the week"
        eyebrowTone="text-tomato"
        title={`Up to ${maxOff}% off`}
        sub="Market prices, beaten. On this week's produce"
        cta="Shop deals"
        onClick={onDeals}
        image={best?.image}
      />
      <Tile
        tone="bg-mint"
        eyebrow="Fresh this week"
        eyebrowTone="text-leaf"
        title="Ghana-grown veg"
        sub={veg ? `Tomatoes from ${money(veg.price)} a kilo` : "Picked this week"}
        cta="Explore veg"
        onClick={onVeg}
        image={veg?.image}
      />
      <Tile
        tone="bg-forest text-white"
        eyebrow="Exam season"
        eyebrowTone="text-yolk"
        title={box ? box.name : "Ready-made boxes"}
        sub={box ? `Two weeks of brain food for ${money(box.price)}` : "Pre-packed weekly bundles"}
        cta="Shop boxes"
        onClick={onBoxes}
        image={box?.image}
        dark
      />
    </div>
  );
}

function Tile({
  tone,
  eyebrow,
  eyebrowTone,
  title,
  sub,
  cta,
  onClick,
  image,
  dark = false,
}: {
  tone: string;
  eyebrow: string;
  eyebrowTone: string;
  title: string;
  sub: string;
  cta: string;
  onClick: () => void;
  image?: string;
  dark?: boolean;
}) {
  return (
    <button onClick={onClick} className={`group flex min-h-[176px] w-[86%] shrink-0 snap-start items-stretch gap-4 overflow-hidden rounded-2xl p-5 text-left transition hover:-translate-y-0.5 md:w-auto ${tone}`}>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className={`text-[12px] font-semibold uppercase tracking-wider ${eyebrowTone}`}>{eyebrow}</p>
        <h3 className="mt-1.5 font-display text-2xl font-bold leading-tight">{title}</h3>
        <p className={`mt-1 text-sm ${dark ? "text-white/75" : "text-ink/65"}`}>{sub}</p>
        <span className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold ${dark ? "text-white" : "text-forest"}`}>
          {cta}
          <span className="transition group-hover:translate-x-1">→</span>
        </span>
      </div>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" className="w-[38%] shrink-0 rounded-xl object-cover transition duration-300 group-hover:scale-[1.03]" />
      )}
    </button>
  );
}

/* ---------- Trust strip ---------- */

function TrustStrip() {
  const items = [
    { title: "No delivery fees", sub: "Collect on campus, Saturdays", icon: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /> },
    { title: "Freshness promise", sub: "Bruised or missing? We refund it", icon: <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4M9 12l2 2 4-4" /> },
    { title: "Pay at pickup", sub: "Mobile Money or cash", icon: <path d="M3 7h18v12H3zM3 11h18M7 15h3" /> },
    { title: "Real people on WhatsApp", sub: "Students running it, fast replies", icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM9 10h.01M12 10h.01M15 10h.01" /> },
  ];
  return (
    <div className="grid gap-x-4 gap-y-4 rounded-2xl bg-kraft/60 px-5 py-5 sm:grid-cols-2 sm:py-6 lg:grid-cols-4 lg:px-8">
      {items.map((it) => (
        <div key={it.title} className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-forest">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {it.icon}
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{it.title}</p>
            <p className="text-[13px] text-muted">{it.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Aisle row ---------- */

function Aisle({
  title,
  blurb,
  count,
  onSeeAll,
  children,
}: {
  title: string;
  blurb: string;
  count: number;
  onSeeAll: () => void;
  children: React.ReactNode;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const nudge = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h3>
          <p className="text-sm text-muted">{blurb}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button onClick={onSeeAll} className="mr-2 inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-leaf">
            View all {count} <span aria-hidden>→</span>
          </button>
          <ArrowButton dir={-1} onClick={() => nudge(-1)} />
          <ArrowButton dir={1} onClick={() => nudge(1)} />
        </div>
      </div>
      <div ref={rail} className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:gap-4 sm:px-0">
        {children}
      </div>
    </section>
  );
}

function ArrowButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 1 ? "Scroll right" : "Scroll left"}
      className="hidden h-8 w-8 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-leaf hover:text-leaf sm:grid"
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <path d={dir === 1 ? "M8 4l6 6-6 6" : "M12 4l-6 6 6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active ? "border-forest bg-forest text-paper" : "border-line bg-white text-ink/80 hover:border-leaf hover:text-leaf"
      }`}
    >
      {children}
    </button>
  );
}
