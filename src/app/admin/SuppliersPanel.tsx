"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductArt } from "@/components/ProductArt";
import { Busy } from "@/components/Spinner";
import type { Order, Product, Supplier } from "@/lib/types";
import { computeBuying, qtyLabel } from "./buying";
import { ViewToggle, useViewMode } from "./ViewToggle";
import { api } from "./api";

export function SuppliersPanel({ suppliers, products, orders }: { suppliers: Supplier[]; products: Product[]; orders: Order[] }) {
  const [view, setView] = useViewMode("suppliers");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Supplier | "new" | null>(null);

  const { needs } = useMemo(() => computeBuying(orders, products), [orders, products]);
  const stats = useMemo(() => {
    const m = new Map<string, { items: Product[]; units: number }>();
    for (const s of suppliers) m.set(s.id, { items: products.filter((p) => p.supplierId === s.id), units: 0 });
    for (const n of needs) if (n.supplierId && m.has(n.supplierId)) m.get(n.supplierId)!.units += n.buy;
    return m;
  }, [suppliers, products, needs]);
  const unlinked = products.filter((p) => !p.supplierId && p.category !== "boxes");

  const list = suppliers.filter((s) => !q || `${s.name} ${s.contactName ?? ""} ${s.location ?? ""} ${s.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">The farms and makers you buy from. Link products to them under Products → Edit.</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search suppliers"
            className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2 text-base outline-none focus:border-leaf sm:w-52 sm:flex-none sm:text-sm"
          />
          <ViewToggle mode={view} onChange={setView} />
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-forest">
            <span className="text-base leading-none">+</span> New supplier
          </button>
        </div>
      </div>

      {unlinked.length > 0 && (
        <p className="mt-4 rounded-xl border border-yolk bg-yolk/15 px-4 py-3 text-sm">
          <strong>{unlinked.length} product{unlinked.length === 1 ? " isn't" : "s aren't"} linked to a supplier:</strong>{" "}
          {unlinked.map((p) => p.name).join(", ")}.
        </p>
      )}

      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-muted">No suppliers yet. Add the farms you buy from.</div>
      ) : view === "table" ? (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-[#f7f8f5] text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Supplies</th>
                <th className="px-3 py-3 text-right">To buy this drop</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {list.map((s) => {
                const st = stats.get(s.id);
                return (
                  <tr key={s.id} className="hover:bg-[#fafbf8]">
                    <td className="px-4 py-2.5 font-semibold text-ink">{s.name}</td>
                    <td className="px-3 py-2.5 text-muted">{s.contactName || "–"}</td>
                    <td className="px-3 py-2.5">{s.phone ? <a href={`tel:${s.phone}`} className="font-semibold text-leaf hover:underline">{s.phone}</a> : <span className="text-muted">–</span>}</td>
                    <td className="max-w-[180px] truncate px-3 py-2.5 text-muted">{s.location || "–"}</td>
                    <td className="max-w-[240px] truncate px-3 py-2.5 text-muted">{st?.items.map((p) => p.name).join(", ") || "–"}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{st?.units ? `${qtyLabel(st.units)} unit${st.units === 1 ? "" : "s"}` : "–"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => setEditing(s)} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink hover:border-leaf hover:text-leaf">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {list.map((s) => {
            const st = stats.get(s.id);
            return (
              <article key={s.id} className="flex flex-col rounded-2xl bg-white p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-ink">{s.name}</h3>
                    <p className="truncate text-xs text-muted">{[s.contactName, s.location].filter(Boolean).join(" · ") || "No contact details yet"}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {st?.items.slice(0, 3).map((p) => (
                      <ProductArt key={p.id} art={p.art} category={p.category} image={p.image} alt="" className="h-8 w-8 rounded-full border-2 border-white" />
                    ))}
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f3f4f0] px-3 py-2.5">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Products</dt>
                    <dd className="text-sm font-semibold text-ink">{st?.items.length ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">To buy this drop</dt>
                    <dd className="text-sm font-semibold text-leaf">{st?.units ? `${qtyLabel(st.units)} unit${st.units === 1 ? "" : "s"}` : "–"}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between gap-2">
                  {s.phone ? (
                    <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf hover:underline">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M5 3h3l1.5 4-2 1.2a9 9 0 0 0 4.3 4.3L13 10.5l4 1.5v3a2 2 0 0 1-2 2A13 13 0 0 1 3 5a2 2 0 0 1 2-2z" strokeLinejoin="round" />
                      </svg>
                      {s.phone}
                    </a>
                  ) : (
                    <span className="text-xs text-muted">No phone yet</span>
                  )}
                  <button onClick={() => setEditing(s)} className="rounded-full bg-leaf px-4 py-1.5 text-sm font-semibold text-white hover:bg-forest">Edit</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && <SupplierEditor supplier={editing === "new" ? null : editing} linked={editing !== "new" ? stats.get(editing.id)?.items ?? [] : []} onClose={() => setEditing(null)} />}
    </div>
  );
}

function SupplierEditor({ supplier, linked, onClose }: { supplier: Supplier | null; linked: Product[]; onClose: () => void }) {
  const router = useRouter();
  const [d, setD] = useState({
    name: supplier?.name ?? "",
    contactName: supplier?.contactName ?? "",
    phone: supplier?.phone ?? "",
    location: supplier?.location ?? "",
    notes: supplier?.notes ?? "",
  });
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof d, v: string) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    setError(null);
    try {
      if (supplier) await api(`/api/admin/suppliers/${supplier.id}`, "PATCH", d);
      else await api("/api/admin/suppliers", "POST", d);
      router.refresh();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  async function remove() {
    if (!supplier) return;
    if (!confirm(`Delete ${supplier.name}? Its ${linked.length} product(s) stay in the shop, just unlinked.`)) return;
    setBusy("delete");
    try {
      await api(`/api/admin/suppliers/${supplier.id}`, "DELETE");
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
      <form onSubmit={save} role="dialog" aria-label={supplier ? `Edit ${supplier.name}` : "New supplier"} className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-[#f3f4f0] shadow-2xl">
        <header className="flex items-center justify-between border-b border-hair bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{supplier ? "Edit supplier" : "New supplier"}</p>
            <h2 className="font-display text-xl font-bold text-ink">{d.name || "Untitled supplier"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full hover:bg-line">
            <svg viewBox="0 0 20 20" className="h-5 w-5" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" /></svg>
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
          <section className="space-y-4 rounded-2xl bg-white p-4 shadow-soft">
            <L text="Farm / business name"><input className={field} value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Bright Acre Farm" required /></L>
            <div className="grid gap-4 sm:grid-cols-2">
              <L text="Contact person"><input className={field} value={d.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Auntie Akos" /></L>
              <L text="Phone / WhatsApp"><input className={field} type="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="024 123 4567" /></L>
            </div>
            <L text="Location"><input className={field} value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="Ejura, Ashanti Region" /></L>
            <L text="Notes (prices agreed, pickup times, payment…)"><textarea className={field} rows={3} maxLength={500} value={d.notes} onChange={(e) => set("notes", e.target.value)} /></L>
          </section>
          {supplier && (
            <section className="rounded-2xl bg-white p-4 shadow-soft">
              <h3 className="text-sm font-semibold text-ink">Products from {supplier.name}</h3>
              {linked.length ? (
                <ul className="mt-3 space-y-2">
                  {linked.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 text-sm">
                      <ProductArt art={p.art} category={p.category} image={p.image} alt="" className="h-8 w-8 rounded-md" />
                      {p.name} <span className="text-muted">· {p.unit}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">None yet. Link products under Products → Edit → Supplier.</p>
              )}
            </section>
          )}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hair bg-white px-5 py-4 sm:px-7">
          {supplier ? (
            <button type="button" onClick={remove} disabled={!!busy} className="text-sm font-semibold text-tomato hover:underline disabled:opacity-50">
              {busy === "delete" ? <Busy text="Deleting…" tone="current" /> : "Delete supplier"}
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            {error && <p role="alert" className="mr-2 max-w-[220px] text-sm text-tomato">{error}</p>}
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink hover:bg-line">Cancel</button>
            <button disabled={!!busy} className="rounded-full bg-leaf px-6 py-2.5 text-sm font-semibold text-white hover:bg-forest disabled:opacity-60">
              {busy === "save" ? <Busy text="Saving…" /> : supplier ? "Save changes" : "Add supplier"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function L({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{text}</span>
      {children}
    </label>
  );
}
