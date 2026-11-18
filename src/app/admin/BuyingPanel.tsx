"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductArt } from "@/components/ProductArt";
import type { Order, Product, Supplier } from "@/lib/types";
import { computeBuying, qtyLabel, type BuyNeed } from "./buying";
import { ViewToggle, useViewMode } from "./ViewToggle";
import { api } from "./api";

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** What to buy for a drop: box orders broken into contents, grouped by supplier, with shared "Got it" ticks. */
export function BuyingPanel({
  orders,
  products,
  suppliers,
  drop,
  initialChecks,
}: {
  orders: Order[];
  products: Product[];
  suppliers: Supplier[];
  drop: string;
  initialChecks: string[];
}) {
  const [view, setView] = useViewMode("buying");
  const [checked, setChecked] = useState<Set<string>>(new Set(initialChecks));
  useEffect(() => setChecked(new Set(initialChecks)), [initialChecks]);
  const { needs, groups, boxesWithoutContents } = useMemo(() => computeBuying(orders, products), [orders, products]);
  const supplierById = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  const done = needs.filter((n) => checked.has(n.productId)).length;

  async function toggle(productId: string, value: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (value) next.add(productId);
      else next.delete(productId);
      return next;
    });
    try {
      await api("/api/admin/buying", "POST", { drop, productId, checked: value });
    } catch (e) {
      setChecked((prev) => {
        const next = new Set(prev);
        if (value) next.delete(productId);
        else next.add(productId);
        return next;
      });
      alert((e as Error).message);
    }
  }

  if (orders.length === 0) {
    return <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No orders for this drop yet. The list builds itself as orders come in.</div>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="min-w-0">
          <p className="text-sm text-muted">
            {needs.length} item{needs.length === 1 ? "" : "s"} from {groups.length} supplier{groups.length === 1 ? "" : "s"}, for {orders.length} order{orders.length === 1 ? "" : "s"}. Boxes are broken down into what goes in them.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 w-48 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${needs.length ? (done / needs.length) * 100 : 0}%` }} />
            </div>
            <span className="text-sm font-semibold text-ink tabular-nums">{done} of {needs.length} bought</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle mode={view} onChange={setView} />
          <button onClick={() => window.print()} className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-forest">
            Print list
          </button>
        </div>
      </div>
      <h2 className="mb-4 hidden font-display text-2xl font-bold print:block">Buying list · {dayLabel(drop)}</h2>

      {boxesWithoutContents.length > 0 && (
        <p className="mb-4 rounded-xl border border-yolk bg-yolk/15 px-4 py-3 text-sm print:hidden">
          <strong>Box contents not set:</strong> {boxesWithoutContents.map((b) => `${b.qty}× ${b.name}`).join(", ")}. Open the box under{" "}
          <Link href="/admin/products" className="font-semibold text-forest underline">Products</Link> and fill in “What’s in the box” so its items show up here.
        </p>
      )}

      {view === "table" ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[#f7f8f5] text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-3 py-3">Item</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3 text-right">Needed</th>
                <th className="px-3 py-3 text-right">Buy</th>
                <th className="w-20 whitespace-nowrap px-4 py-3 text-center">Got it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {groups.map((g) =>
                g.items.map((n, idx) => (
                  <tr key={n.productId} className={`${idx === 0 ? "border-t border-hair" : ""} ${checked.has(n.productId) ? "bg-mint/50" : ""}`}>
                    <td className="px-4 py-2.5 align-top">{idx === 0 && <SupplierLabel name={g.farm} supplier={g.supplierId ? supplierById.get(g.supplierId) : undefined} />}</td>
                    <td className="px-3 py-2.5">
                      <span className={`flex items-center gap-2.5 ${checked.has(n.productId) ? "text-muted line-through" : ""}`}>
                        <ProductArt art={n.art} category={n.category} image={n.image} alt="" className="h-8 w-8 shrink-0 rounded-md print:hidden" />
                        {n.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted">{n.unit}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-muted">
                      <NeedBreakdown n={n} />
                    </td>
                    <td className="px-3 py-2.5 text-right font-display text-base font-bold tabular-nums text-forest">×{n.buy}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={checked.has(n.productId)}
                        onChange={(e) => toggle(n.productId, e.target.checked)}
                        className="h-5 w-5 cursor-pointer accent-[#2f9a57]"
                        aria-label={`Bought ${n.name}`}
                      />
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <div key={g.key} className="break-inside-avoid rounded-2xl bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <SupplierLabel name={g.farm} supplier={g.supplierId ? supplierById.get(g.supplierId) : undefined} />
                <span className="shrink-0 text-xs text-muted">
                  {g.items.filter((n) => checked.has(n.productId)).length}/{g.items.length} bought
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {g.items.map((n) => {
                  const on = checked.has(n.productId);
                  return (
                    <li key={n.productId}>
                      <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition ${on ? "bg-mint" : "bg-[#f3f4f0]"}`}>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={(e) => toggle(n.productId, e.target.checked)}
                          className="h-5 w-5 shrink-0 accent-[#2f9a57]"
                          aria-label={`Bought ${n.name}`}
                        />
                        <ProductArt art={n.art} category={n.category} image={n.image} alt="" className="h-9 w-9 shrink-0 rounded-lg print:hidden" />
                        <span className={`min-w-0 flex-1 text-sm ${on ? "text-muted line-through" : ""}`}>
                          <span className="block truncate">{n.name} <span className="text-muted">· {n.unit}</span></span>
                          <span className="block text-[11px] text-muted"><NeedBreakdown n={n} /></span>
                        </span>
                        <span className="font-display font-bold tabular-nums text-forest">×{n.buy}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NeedBreakdown({ n }: { n: BuyNeed }) {
  if (!n.viaBoxes) return <>{qtyLabel(n.total)} ordered</>;
  if (!n.direct) return <>{qtyLabel(n.viaBoxes)} for boxes</>;
  return (
    <>
      {qtyLabel(n.direct)} ordered + {qtyLabel(n.viaBoxes)} for boxes
    </>
  );
}

function SupplierLabel({ name, supplier }: { name: string; supplier?: Supplier }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold text-ink">{name}</p>
      {supplier && (supplier.contactName || supplier.phone || supplier.location) && (
        <p className="mt-0.5 text-xs text-muted">
          {[supplier.contactName, supplier.location].filter(Boolean).join(" · ")}
          {supplier.phone && (
            <>
              {(supplier.contactName || supplier.location) && " · "}
              <a href={`tel:${supplier.phone}`} className="font-semibold text-leaf hover:underline">{supplier.phone}</a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
