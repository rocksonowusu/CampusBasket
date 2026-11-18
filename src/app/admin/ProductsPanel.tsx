"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, Supplier } from "@/lib/types";
import { categories, type CategoryId } from "@/lib/config";
import { money, percentOff } from "@/lib/format";
import { ProductArt } from "@/components/ProductArt";
import { ProductEditor, Switch } from "./ProductEditor";
import { api } from "./api";
import { ViewToggle, useViewMode } from "./ViewToggle";
import { Busy } from "@/components/Spinner";

type Show = "all" | "live" | "hidden" | "low";

export function ProductsPanel({
  products,
  suppliers,
  orderedById,
}: {
  products: Product[];
  suppliers: Supplier[];
  orderedById: Record<string, number>;
}) {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [show, setShow] = useState<Show>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [view, setView] = useViewMode("products");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (show === "all" || (show === "live" && p.active) || (show === "hidden" && !p.active) || (show === "low" && p.stock <= 10)) &&
        (!s || `${p.name} ${p.farm} ${p.unit}`.toLowerCase().includes(s)),
    );
  }, [products, cat, show, q]);

  const counts = {
    live: products.filter((p) => p.active).length,
    hidden: products.filter((p) => !p.active).length,
    low: products.filter((p) => p.stock <= 10).length,
  };

  return (
    <div>
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <Pill active={cat === "all"} onClick={() => setCat("all")}>All aisles</Pill>
          {categories.map((c) => (
            <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.name}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={show}
            onChange={(e) => setShow(e.target.value as Show)}
            className="rounded-full border border-line bg-white px-3.5 py-2 text-base outline-none focus:border-leaf sm:text-sm"
            aria-label="Filter by visibility"
          >
            <option value="all">All items ({products.length})</option>
            <option value="live">In the shop ({counts.live})</option>
            <option value="hidden">Hidden ({counts.hidden})</option>
            <option value="low">Low stock ({counts.low})</option>
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items"
            className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2 text-base outline-none focus:border-leaf sm:w-48 sm:flex-none sm:text-sm"
          />
          <ViewToggle mode={view} onChange={setView} />
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-forest">
            <span className="text-base leading-none">+</span> New product
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-muted">No items match. Try another filter.</div>
      ) : view === "table" ? (
        <ProductsTable list={list} orderedById={orderedById} onEdit={setEditing} />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((p) => (
            <ItemCard key={p.id} p={p} ordered={orderedById[p.id] ?? 0} onEdit={() => setEditing(p)} />
          ))}
        </div>
      )}

      {editing && (
        <ProductEditor product={editing === "new" ? null : editing} products={products} suppliers={suppliers} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function ItemCard({ p, ordered, onEdit }: { p: Product; ordered: number; onEdit: () => void }) {
  const router = useRouter();
  const [active, setActive] = useState(p.active);
  useEffect(() => setActive(p.active), [p.active]);
  const off = percentOff(p.price, p.marketPrice);
  const low = p.stock <= 10;
  const aisle = categories.find((c) => c.id === p.category)?.name;

  async function toggle(v: boolean) {
    setActive(v);
    try {
      await api(`/api/admin/products/${p.id}`, "PATCH", { active: v });
      router.refresh();
    } catch (e) {
      setActive(!v);
      alert((e as Error).message);
    }
  }

  return (
    <article className={`flex flex-col rounded-2xl bg-white p-4 shadow-soft transition hover:-translate-y-0.5 ${active ? "" : "opacity-70"}`}>
      <div className="flex items-start gap-3">
        <ProductArt art={p.art} category={p.category} image={p.image} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-ink">{p.name}</h3>
          <p className="truncate text-xs text-muted">
            {p.unit} · {aisle}
          </p>
        </div>
        <button onClick={onEdit} aria-label={`Edit ${p.name}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 14L14 6M8 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f3f4f0] px-3 py-2.5">
        <Stat label="Price" value={money(p.price)} strong />
        <Stat label="Market" value={money(p.marketPrice)} />
        <Stat label="Stock" value={String(p.stock)} warn={low} />
      </dl>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {off > 0 && <span className="rounded-md bg-mint px-1.5 py-0.5 text-[11px] font-semibold text-leaf">−{off}%</span>}
          <span className="truncate text-xs text-muted">{ordered} ordered this drop</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Switch on={active} onChange={toggle} label={active ? "Hide from shop" : "Show in shop"} />
          <button onClick={onEdit} className="rounded-full bg-leaf px-4 py-1.5 text-sm font-semibold text-white hover:bg-forest">
            Edit
          </button>
        </div>
      </div>
      {!active && <p className="mt-2 text-xs font-semibold text-tomato">Hidden from the shop</p>}
    </article>
  );
}

function Stat({ label, value, strong, warn }: { label: string; value: string; strong?: boolean; warn?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className={`truncate text-sm tabular-nums ${warn ? "font-semibold text-tomato" : strong ? "font-semibold text-leaf" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

export function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/80 hover:border-ink/40"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Table view: quick inline edits for the weekly price/stock update ---------- */

function ProductsTable({
  list,
  orderedById,
  onEdit,
}: {
  list: Product[];
  orderedById: Record<string, number>;
  onEdit: (p: Product) => void;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="bg-[#f7f8f5] text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-3 py-3">Aisle</th>
            <th className="px-3 py-3">Farm / supplier</th>
            <th className="px-3 py-3">Our price</th>
            <th className="px-3 py-3">Market</th>
            <th className="px-3 py-3 text-right">Off</th>
            <th className="px-3 py-3">Stock</th>
            <th className="px-3 py-3 text-right">Ordered</th>
            <th className="px-3 py-3">In shop</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-hair">
          {list.map((p) => (
            <ProductRow key={p.id} p={p} ordered={orderedById[p.id] ?? 0} onEdit={() => onEdit(p)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductRow({ p, ordered, onEdit }: { p: Product; ordered: number; onEdit: () => void }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(p.price));
  const [market, setMarket] = useState(String(p.marketPrice));
  const [stock, setStock] = useState(String(p.stock));
  const [active, setActive] = useState(p.active);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  // keep in sync when the server data changes (e.g. after an edit in the side panel)
  useEffect(() => {
    setPrice(String(p.price));
    setMarket(String(p.marketPrice));
    setStock(String(p.stock));
    setActive(p.active);
  }, [p.price, p.marketPrice, p.stock, p.active]);

  const dirty = price !== String(p.price) || market !== String(p.marketPrice) || stock !== String(p.stock);
  const off = percentOff(Number(price) || 0, Number(market) || 0);
  const aisle = categories.find((c) => c.id === p.category)?.name;

  async function save() {
    setState("saving");
    try {
      await api(`/api/admin/products/${p.id}`, "PATCH", { price: Number(price), marketPrice: Number(market), stock: Number(stock) });
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 1500);
    } catch (e) {
      setState("idle");
      alert((e as Error).message);
    }
  }

  async function toggle(v: boolean) {
    setActive(v);
    try {
      await api(`/api/admin/products/${p.id}`, "PATCH", { active: v });
      router.refresh();
    } catch (e) {
      setActive(!v);
      alert((e as Error).message);
    }
  }

  // borderless until focused, so a full table of inputs doesn't look like a grid of boxes
  const input =
    "w-20 rounded-lg border border-transparent bg-[#f5f3ee] px-2 py-1.5 text-sm tabular-nums outline-none transition hover:bg-[#efebe3] focus:border-leaf focus:bg-white focus:ring-2 focus:ring-sprout";

  return (
    <tr className={`${active ? "" : "bg-[#fafaf8] text-ink/60"} ${dirty ? "bg-yolk/10" : ""}`}>
      <td className="px-4 py-2.5">
        <button onClick={onEdit} className="flex items-center gap-3 text-left">
          <ProductArt art={p.art} category={p.category} image={p.image} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
          <span className="min-w-0">
            <span className="block max-w-[200px] truncate font-semibold text-ink hover:text-leaf">{p.name}</span>
            <span className="block text-xs text-muted">{p.unit}</span>
          </span>
        </button>
      </td>
      <td className="px-3 py-2.5 text-muted">{aisle}</td>
      <td className="max-w-[160px] truncate px-3 py-2.5 text-muted">{p.farm}</td>
      <td className="px-3 py-2.5">
        <input className={input} type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} aria-label={`Price of ${p.name}`} />
      </td>
      <td className="px-3 py-2.5">
        <input className={input} type="number" min="0" step="0.5" value={market} onChange={(e) => setMarket(e.target.value)} aria-label={`Market price of ${p.name}`} />
      </td>
      <td className="px-3 py-2.5 text-right">
        {off > 0 ? <span className="rounded-md bg-mint px-1.5 py-0.5 text-xs font-semibold text-leaf">−{off}%</span> : <span className="text-xs text-muted">–</span>}
      </td>
      <td className="px-3 py-2.5">
        <input
          className={`${input} ${Number(stock) <= 10 ? "font-semibold text-tomato" : ""}`}
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          aria-label={`Stock of ${p.name}`}
        />
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">{ordered}</td>
      <td className="px-3 py-2.5">
        <Switch on={active} onChange={toggle} label={active ? `Hide ${p.name}` : `Show ${p.name}`} />
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-right">
        {dirty || state !== "idle" ? (
          <button
            onClick={save}
            disabled={state === "saving" || !dirty}
            className="rounded-full bg-leaf px-4 py-1.5 text-xs font-semibold text-white hover:bg-forest disabled:opacity-70"
          >
            {state === "saving" ? <Busy text="Saving…" /> : state === "saved" ? "Saved ✓" : "Save"}
          </button>
        ) : (
          <button onClick={onEdit} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink hover:border-leaf hover:text-leaf">
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}
