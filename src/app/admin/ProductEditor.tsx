"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtKind, Product, Supplier } from "@/lib/types";
import { categories, store } from "@/lib/config";
import { money, percentOff } from "@/lib/format";
import { artKinds } from "@/lib/productInput";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { api, uploadPhoto } from "./api";
import { Busy, Spinner } from "@/components/Spinner";

type Draft = {
  name: string;
  unit: string;
  category: Product["category"];
  farm: string;
  description: string;
  price: string;
  marketPrice: string;
  stock: string;
  art: ArtKind;
  image: string;
  active: boolean;
  supplierId: string; // "" = not linked (use free-text farm)
  bundle: { productId: string; qty: string }[];
};

const empty: Draft = {
  name: "",
  unit: "",
  category: "veg",
  farm: "",
  description: "",
  price: "",
  marketPrice: "",
  stock: "",
  art: "box",
  image: "",
  active: true,
  supplierId: "",
  bundle: [],
};

function toDraft(p: Product): Draft {
  return {
    name: p.name,
    unit: p.unit,
    category: p.category,
    farm: p.farm,
    description: p.description ?? "",
    price: String(p.price),
    marketPrice: String(p.marketPrice),
    stock: String(p.stock),
    art: p.art,
    image: p.image ?? "",
    active: p.active,
    supplierId: p.supplierId ?? "",
    bundle: (p.bundle ?? []).map((b) => ({ productId: b.productId, qty: String(b.qty) })),
  };
}

/** Slide-over editor for creating or editing a shop item. `product` null = new item. */
export function ProductEditor({
  product,
  products,
  suppliers,
  onClose,
}: {
  product: Product | null;
  products: Product[];
  suppliers: Supplier[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(product ? toDraft(product) : empty);
  const [busy, setBusy] = useState<"save" | "delete" | "upload" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const price = Number(d.price) || 0;
  const market = Number(d.marketPrice) || 0;
  const off = percentOff(price, market);

  const preview: Product = {
    id: product?.id ?? "preview",
    name: d.name || "Product name",
    unit: d.unit || "unit",
    category: d.category,
    price,
    marketPrice: market || price,
    stock: Number(d.stock) || 0,
    farm: suppliers.find((x) => x.id === d.supplierId)?.name || d.farm || "Supplier",
    art: d.art,
    image: d.image || undefined,
    description: d.description || undefined,
    active: d.active,
  };

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      set("image", await uploadPhoto(file));
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    setError(null);
    const body = {
      name: d.name,
      unit: d.unit,
      category: d.category,
      farm: d.farm,
      description: d.description,
      price: Number(d.price),
      marketPrice: d.marketPrice === "" ? Number(d.price) : Number(d.marketPrice),
      stock: d.stock === "" ? 0 : Number(d.stock),
      art: d.art,
      image: d.image || null,
      active: d.active,
      supplierId: d.supplierId || null,
      bundle:
        d.category === "boxes"
          ? d.bundle.filter((b) => b.productId).map((b) => ({ productId: b.productId, qty: Number(b.qty) }))
          : null,
    };
    try {
      if (product) await api(`/api/admin/products/${product.id}`, "PATCH", body);
      else await api("/api/admin/products", "POST", body);
      router.refresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  async function remove() {
    if (!product) return;
    if (!confirm(`Delete “${product.name}” from the shop? Past orders keep their copy, but this can't be undone.`)) return;
    setBusy("delete");
    try {
      await api(`/api/admin/products/${product.id}`, "DELETE");
      router.refresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  const field = "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base outline-none focus:border-leaf focus:ring-2 focus:ring-sprout sm:text-sm";

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <form
        onSubmit={save}
        className="absolute inset-y-0 right-0 flex w-full max-w-[880px] flex-col bg-[#f3f4f0] shadow-2xl"
        role="dialog"
        aria-label={product ? `Edit ${product.name}` : "New product"}
      >
        <header className="flex items-center justify-between border-b border-hair bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{product ? "Edit item" : "New item"}</p>
            <h2 className="font-display text-xl font-bold text-ink">{d.name || "Untitled product"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full hover:bg-line">
            <svg viewBox="0 0 20 20" className="h-5 w-5" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_250px]">
            <div className="space-y-6">
              {/* Photo */}
              <section className="rounded-2xl bg-white p-4 shadow-soft">
                <h3 className="text-sm font-semibold text-ink">Photo</h3>
                <div className="mt-3 flex gap-4">
                  <div className="relative h-28 w-28 shrink-0">
                    <ProductArt art={d.art} category={d.category} image={d.image || undefined} alt="" className="h-28 w-28 rounded-xl" />
                    {busy === "upload" && (
                      <div className="absolute inset-0 grid place-items-center rounded-xl bg-white/75">
                        <Spinner size={36} label="Uploading photo" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-2">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={busy === "upload"}
                      className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-forest disabled:opacity-60"
                    >
                      {busy === "upload" ? <Busy text="Uploading…" /> : d.image ? "Replace photo" : "Upload photo"}
                    </button>
                    {d.image && (
                      <button type="button" onClick={() => set("image", "")} className="text-left text-sm text-muted hover:text-tomato">
                        Remove photo (use illustration)
                      </button>
                    )}
                    <p className="text-xs text-muted">JPG, PNG or WebP, up to 5 MB. Square photos look best.</p>
                  </div>
                </div>
                {!d.image && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-muted">No photo yet? Pick an illustration</p>
                    <div className="flex flex-wrap gap-1.5">
                      {artKinds.map((a) => (
                        <button
                          type="button"
                          key={a}
                          onClick={() => set("art", a)}
                          className={`rounded-lg p-0.5 ${d.art === a ? "ring-2 ring-leaf" : "ring-1 ring-transparent hover:ring-line"}`}
                          aria-label={a}
                        >
                          <ProductArt art={a} alt="" className="h-10 w-10 rounded-md" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Details */}
              <section className="space-y-4 rounded-2xl bg-white p-4 shadow-soft">
                <h3 className="text-sm font-semibold text-ink">Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Label text="Name">
                    <input className={field} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Garden Eggs" required />
                  </Label>
                  <Label text="Unit / size">
                    <input className={field} value={d.unit} onChange={(e) => set("unit", e.target.value)} placeholder="1 kg, bunch of 4…" required />
                  </Label>
                  <Label text="Aisle">
                    <select className={field} value={d.category} onChange={(e) => set("category", e.target.value as Draft["category"])}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </Label>
                  <Label text="Supplier">
                    <select className={field} value={d.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
                      <option value="">{d.category === "boxes" ? "Packed by our team (no supplier)" : "Not listed: type a name"}</option>
                      {suppliers.map((x) => (
                        <option key={x.id} value={x.id}>{x.name}</option>
                      ))}
                    </select>
                    {!d.supplierId && (
                      <input
                        className={`${field} mt-2`}
                        value={d.farm}
                        onChange={(e) => set("farm", e.target.value)}
                        placeholder={d.category === "boxes" ? "Packed by the Campus Basket team" : "Farm or seller name"}
                      />
                    )}
                    <a href="/admin/suppliers" className="mt-1.5 inline-block text-xs font-semibold text-forest hover:underline">Manage suppliers →</a>
                  </Label>
                </div>
                <Label text="Description (optional, shows on boxes)">
                  <textarea className={field} rows={2} maxLength={300} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="What's in it, how fresh it is…" />
                </Label>
              </section>

              {d.category === "boxes" && (
                <BundleEditor
                  rows={d.bundle}
                  onChange={(rows) => set("bundle", rows)}
                  options={products.filter((p) => p.category !== "boxes" && p.id !== product?.id)}
                  boxPrice={price}
                  field={field}
                />
              )}

              {/* Price & stock */}
              <section className="space-y-4 rounded-2xl bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Price & stock</h3>
                  {off > 0 && (
                    <span className="rounded-md bg-mint px-2 py-0.5 text-xs font-semibold text-leaf">
                      −{off}% · students save {money(market - price)}
                    </span>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Label text={`Our price (${store.currency})`}>
                    <input className={field} type="number" inputMode="decimal" min="0" step="0.5" value={d.price} onChange={(e) => set("price", e.target.value)} required />
                  </Label>
                  <Label text={`Market price (${store.currency})`}>
                    <input className={field} type="number" inputMode="decimal" min="0" step="0.5" value={d.marketPrice} onChange={(e) => set("marketPrice", e.target.value)} placeholder="From the market check" />
                  </Label>
                  <Label text="Stock this drop">
                    <input className={field} type="number" inputMode="numeric" min="0" value={d.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" />
                  </Label>
                </div>
                {market > 0 && price > market && (
                  <p className="text-sm text-tomato">Heads up: our price is higher than the market price.</p>
                )}
                <label className="flex cursor-pointer items-center justify-between rounded-xl bg-paper px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-ink">Show in the shop</span>
                    <span className="text-xs text-muted">Turn off to hide it without deleting</span>
                  </span>
                  <Switch on={d.active} onChange={(v) => set("active", v)} />
                </label>
              </section>
            </div>

            {/* Live preview */}
            <aside className="md:sticky md:top-0 md:self-start">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">How students see it</p>
              <div className="pointer-events-none select-none" aria-hidden>
                <ProductCard product={preview} />
              </div>
              {!d.active && <p className="mt-2 text-xs font-semibold text-tomato">Hidden from the shop</p>}
            </aside>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hair bg-white px-5 py-4 sm:px-7">
          {product ? (
            <button type="button" onClick={remove} disabled={!!busy} className="text-sm font-semibold text-tomato hover:underline disabled:opacity-50">
              {busy === "delete" ? <Busy text="Deleting…" tone="current" /> : "Delete item"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {error && <p role="alert" className="mr-2 max-w-[260px] text-sm text-tomato">{error}</p>}
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-line">
              Cancel
            </button>
            <button disabled={!!busy} className="rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-white hover:bg-forest disabled:opacity-60">
              {busy === "save" ? <Busy text="Saving…" /> : product ? "Save changes" : "Add to shop"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{text}</span>
      {children}
    </label>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        onChange(!on);
      }}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-leaf" : "bg-[#cfd3cb]"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

/** "What's in the box": component products and how much of each goes in ONE box. */
function BundleEditor({
  rows,
  onChange,
  options,
  boxPrice,
  field,
}: {
  rows: { productId: string; qty: string }[];
  onChange: (rows: { productId: string; qty: string }[]) => void;
  options: Product[];
  boxPrice: number;
  field: string;
}) {
  const byId = new Map(options.map((p) => [p.id, p]));
  const update = (i: number, patch: Partial<{ productId: string; qty: string }>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const worth = rows.reduce((sum, r) => sum + (byId.get(r.productId)?.price ?? 0) * (Number(r.qty) || 0), 0);

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">What&apos;s in the box</h3>
          <p className="text-xs text-muted">Amounts are per box, in each item&apos;s own unit (0.4 of a 5 kg bag = 2 kg). The buying list uses this.</p>
        </div>
        {worth > 0 && (
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${boxPrice && boxPrice < worth ? "bg-mint text-leaf" : "bg-yolk/25 text-[#7a5600]"}`}>
            Items cost {money(Math.round(worth * 100) / 100)} separately
          </span>
        )}
      </div>
      {rows.length === 0 && <p className="rounded-xl bg-paper px-3 py-3 text-sm text-muted">No items yet. Add what goes in one box.</p>}
      <ul className="space-y-2">
        {rows.map((r, i) => {
          const p = byId.get(r.productId);
          return (
            <li key={i} className="flex items-center gap-2">
              <ProductArt art={p?.art ?? "box"} category={p?.category} image={p?.image} alt="" className="hidden h-9 w-9 shrink-0 rounded-lg sm:grid" />
              <select className={`${field} min-w-0 flex-1`} value={r.productId} onChange={(e) => update(i, { productId: e.target.value })} aria-label="Item">
                <option value="">Choose an item…</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.unit})</option>
                ))}
              </select>
              <input
                className={`${field} w-20 shrink-0`}
                type="number"
                inputMode="decimal"
                min="0.05"
                step="0.05"
                value={r.qty}
                onChange={(e) => update(i, { qty: e.target.value })}
                aria-label="Quantity per box"
              />
              <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label="Remove item" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-[#fbe4e1] hover:text-tomato">
                <svg viewBox="0 0 20 20" className="h-4 w-4" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" /></svg>
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => onChange([...rows, { productId: "", qty: "1" }])} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-ink hover:border-leaf hover:text-leaf">
        + Add item
      </button>
    </section>
  );
}
