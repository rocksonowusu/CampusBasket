"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { ProductArt } from "@/components/ProductArt";
import { categories } from "@/lib/config";
import { money } from "@/lib/format";
import type { ArtKind, Order, Product, Supplier } from "@/lib/types";
import { SellThroughChart } from "./SellThroughChart";
import { ProductsPanel } from "./ProductsPanel";
import { OrdersRail, OrdersTable } from "./OrdersPanel";
import { BuyingPanel } from "./BuyingPanel";
import { SuppliersPanel } from "./SuppliersPanel";

export type Tab = "overview" | "orders" | "products" | "buying" | "suppliers";
const tabs: { id: Tab; label: string; short: string; href: string }[] = [
  { id: "overview", label: "Overview", short: "Overview", href: "/admin" },
  { id: "orders", label: "Orders", short: "Orders", href: "/admin/orders" },
  { id: "products", label: "Products", short: "Products", href: "/admin/products" },
  { id: "buying", label: "Buying list", short: "Buying", href: "/admin/buying" },
  { id: "suppliers", label: "Suppliers", short: "Farms", href: "/admin/suppliers" },
];

// Solid surfaces on the photo header (no frosted glass).
const solid = "rounded-2xl bg-white text-ink shadow-[0_10px_30px_-18px_rgba(0,0,0,0.5)]";
const accentCard = "rounded-2xl bg-forest text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.5)]";

export const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export function AdminDashboard({
  tab,
  drop,
  drops,
  upcoming,
  orders,
  products,
  suppliers,
  checks,
  usingDefaultPasscode,
}: {
  tab: Tab;
  drop: string;
  drops: string[];
  upcoming: string;
  orders: Order[];
  products: Product[];
  suppliers: Supplier[];
  checks: string[];
  usingDefaultPasscode: boolean;
}) {
  const router = useRouter();
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })), []);

  const dropOrders = useMemo(() => orders.filter((o) => o.dropDate === drop), [orders, drop]);
  const live = useMemo(() => dropOrders.filter((o) => o.status !== "cancelled"), [dropOrders]);
  const orderedById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of live) for (const l of o.lines) m[l.productId] = (m[l.productId] ?? 0) + l.qty;
    return m;
  }, [live]);

  const withDrop = (href: string) => (drop === upcoming ? href : `${href}?drop=${drop}`);
  const current = tabs.find((t) => t.id === tab)!;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  const dropPicker = (
    <label className={`flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1 text-xs font-medium ${solid}`}>
      Drop
      <select
        value={drop}
        onChange={(e) => router.push(e.target.value === upcoming ? current.href : `${current.href}?drop=${e.target.value}`)}
        className="rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-ink outline-none"
      >
        {drops.map((d) => (
          <option key={d} value={d}>
            {dayLabel(d)}
            {d === upcoming ? " (next)" : ""}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="min-h-svh bg-[#f3f4f0] print:bg-white">
      {/* ---------- Photo header ---------- */}
      <section className="relative isolate overflow-hidden print:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/admin-hero.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-black/40" />

        <div className="mx-auto max-w-[1680px] px-4 py-4 sm:px-7 sm:py-5 lg:px-10">
          {/* top bar: each tab is its own page */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" aria-label="View shop" className="shrink-0">
              <LogoMark className="h-10 w-10 sm:h-11 sm:w-11" />
            </Link>
            <nav className={`no-scrollbar flex min-w-0 gap-1 overflow-x-auto rounded-full p-1 ${solid}`}>
              {tabs.map((t) => (
                <Link
                  key={t.id}
                  href={withDrop(t.href)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={`shrink-0 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                    tab === t.id ? "bg-forest text-white" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  <span className="sm:hidden">{t.short}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </Link>
              ))}
            </nav>
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <Link href="/" target="_blank" className={`grid h-11 w-11 place-items-center rounded-full ${solid}`} aria-label="Open the shop" title="Open the shop">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <button onClick={logout} className={`grid h-11 w-11 place-items-center rounded-full ${solid}`} aria-label="Sign out" title="Sign out">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M8 4H4v12h4M13 6l4 4-4 4M17 10H8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {tab === "overview" ? (
            <OverviewHero
              today={today}
              dropPicker={dropPicker}
              drop={drop}
              live={live}
              products={products}
              orderedById={orderedById}
              productsHref={withDrop("/admin/products")}
              buyingHref={withDrop("/admin/buying")}
            />
          ) : (
            /* slim header on working pages: content starts right below, no scrolling past a big photo */
            <div className="mt-5 flex flex-wrap items-end justify-between gap-3 pb-1 sm:mt-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{current.label}</h1>
                <p className="text-sm text-white/80">
                  {tab === "orders" && `${dropOrders.length} order${dropOrders.length === 1 ? "" : "s"} for the ${dayLabel(drop)} drop`}
                  {tab === "products" && `${products.filter((p) => p.active).length} of ${products.length} items showing in the shop`}
                  {tab === "buying" && `What to buy for the ${dayLabel(drop)} drop, by supplier`}
                  {tab === "suppliers" && `${suppliers.length} farms and makers you buy from`}
                </p>
              </div>
              {tab !== "products" && dropPicker}
            </div>
          )}

          <div className="mt-4 flex gap-2 sm:hidden">
            <Link href="/" className={`flex-1 rounded-full py-2 text-center text-sm font-medium ${solid}`}>Open shop</Link>
            <button onClick={logout} className={`flex-1 rounded-full py-2 text-sm font-medium ${solid}`}>Sign out</button>
          </div>
        </div>
      </section>

      {/* ---------- Page content ---------- */}
      <main className="mx-auto max-w-[1680px] px-5 py-6 sm:px-7 lg:px-10">
        {usingDefaultPasscode && (
          <p className="mb-5 rounded-xl border border-yolk bg-yolk/15 px-4 py-3 text-sm print:hidden">
            <strong>Heads up:</strong> you&apos;re using the default passcode. Set <code className="rounded bg-white px-1">ADMIN_PASSCODE</code> in{" "}
            <code className="rounded bg-white px-1">.env.local</code> before sharing the site.
          </p>
        )}

        {tab === "overview" && (
          <>
            <h2 className="mb-4 font-display text-2xl font-bold text-ink">Orders that need you</h2>
            <OrdersRail orders={dropOrders} />
          </>
        )}
        {tab === "orders" && <OrdersTable orders={dropOrders} />}
        {tab === "products" && <ProductsPanel products={products} suppliers={suppliers} orderedById={orderedById} />}
        {tab === "buying" && <BuyingPanel orders={live} products={products} suppliers={suppliers} drop={drop} initialChecks={checks} />}
        {tab === "suppliers" && <SuppliersPanel suppliers={suppliers} products={products} orders={live} />}
      </main>
    </div>
  );
}

/* ---------- Overview header: welcome, chart, cards ---------- */

function OverviewHero({
  today,
  dropPicker,
  drop,
  live,
  products,
  orderedById,
  productsHref,
  buyingHref,
}: {
  today: string;
  dropPicker: React.ReactNode;
  drop: string;
  live: Order[];
  products: Product[];
  orderedById: Record<string, number>;
  productsHref: string;
  buyingHref: string;
}) {
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const saved = live.reduce((s, o) => s + (o.marketTotal - o.total), 0);
  const chartRows = categories.map((c) => {
    const inCat = products.filter((p) => p.category === c.id);
    return {
      label: c.name.replace(" & Staples", "").replace("Eggs & ", ""),
      ordered: inCat.reduce((s, p) => s + (orderedById[p.id] ?? 0), 0),
      left: inCat.filter((p) => p.active).reduce((s, p) => s + p.stock, 0),
    };
  });
  const top = Object.entries(orderedById)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      const line = live.flatMap((o) => o.lines).find((l) => l.productId === id);
      return { id, qty, name: p?.name ?? line?.name ?? id, art: (p?.art ?? "box") as ArtKind, image: p?.image, category: p?.category, revenue: qty * (line?.price ?? 0) };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);
  const lowStock = products.filter((p) => p.active && p.stock <= 10).length;

  return (
    <div className="mt-6 grid gap-4 pb-2 lg:mt-8 lg:grid-cols-[1.25fr_1fr] lg:gap-6">
      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl">Welcome back, team!</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {today && <span className={`rounded-full px-3 py-1 text-xs font-medium ${solid}`}>{today}</span>}
            {dropPicker}
          </div>
        </div>
        <div className={`p-4 sm:p-5 ${solid}`}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Sell-through by aisle</h2>
              <p className="text-xs text-ink/60">Ordered vs still in stock for the {dayLabel(drop)} drop</p>
            </div>
            <Link href={productsHref} className="shrink-0 whitespace-nowrap text-xs font-semibold text-forest hover:underline">
              Restock →
            </Link>
          </div>
          <SellThroughChart rows={chartRows} />
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Kpi label="To collect" value={money(revenue)} sub={`${live.length} order${live.length === 1 ? "" : "s"} this drop`} icon="cash" />
          <Kpi label="Students saved" value={money(saved)} sub="vs market prices" icon="leaf" accent />
        </div>
        <div className={`p-4 sm:p-5 ${solid}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Top items this drop</h2>
            <Link href={buyingHref} className="text-xs font-semibold text-forest hover:underline">Buying list →</Link>
          </div>
          {top.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet for this drop. Share the link in the hall WhatsApp groups!</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {top.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <ProductArt art={t.art} category={t.category} image={t.image} alt="" className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted">{t.qty} ordered</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{money(t.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Link href={productsHref} className={`p-4 ${solid} transition hover:ring-2 hover:ring-leaf/40`}>
            <p className="text-xs text-muted">Items in the shop</p>
            <p className="mt-1 font-display text-2xl font-bold">{products.filter((p) => p.active).length}</p>
          </Link>
          <Link href={productsHref} className={`p-4 ${solid} transition hover:ring-2 hover:ring-leaf/40`}>
            <p className="text-xs text-muted">Low stock (≤10)</p>
            <p className={`mt-1 font-display text-2xl font-bold ${lowStock ? "text-tomato" : ""}`}>{lowStock}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon, accent }: { label: string; value: string; sub: string; icon: "cash" | "leaf"; accent?: boolean }) {
  return (
    <div className={`p-4 sm:p-5 ${accent ? accentCard : solid}`}>
      <div className={`flex items-center justify-between text-xs ${accent ? "text-white/80" : "text-muted"}`}>
        {label}
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          {icon === "cash" ? <path d="M3 6h14v9H3zM3 9h14M7 12h2" strokeLinejoin="round" /> : <path d="M16 3C8 3 4 7 4 12c0 1.5.4 2.7 1 3.6M16 3c0 8-4 12-9 12M9 10l-5 7" strokeLinecap="round" />}
        </svg>
      </div>
      <p className="mt-2 truncate font-display text-2xl font-bold sm:text-3xl">{value}</p>
      <p className={`mt-1 text-xs ${accent ? "text-sprout" : "text-muted"}`}>{sub}</p>
    </div>
  );
}
