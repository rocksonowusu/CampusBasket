"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/types";
import { orderStatuses } from "@/lib/types";
import { pickupPoints } from "@/lib/config";
import { money } from "@/lib/format";
import { api } from "./api";
import { Pill } from "./ProductsPanel";
import { ViewToggle, useViewMode } from "./ViewToggle";
import { Busy, Spinner } from "@/components/Spinner";

export const statusLabel: Record<OrderStatus, string> = {
  received: "Received",
  confirmed: "Bought",
  packed: "Packed",
  ready: "Ready",
  collected: "Collected",
  cancelled: "Cancelled",
};

export const statusStyle: Record<OrderStatus, string> = {
  received: "bg-yolk/25 text-[#7a5600]",
  confirmed: "bg-sprout text-forest",
  packed: "bg-[#dbe8f7] text-[#1d4b7a]",
  ready: "bg-leaf text-white",
  collected: "bg-line text-muted",
  cancelled: "bg-[#fbe4e1] text-tomato",
};

const next: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  received: { to: "confirmed", label: "Mark bought" },
  confirmed: { to: "packed", label: "Mark packed" },
  packed: { to: "ready", label: "Mark ready" },
  ready: { to: "collected", label: "Collected" },
};

function useSetStatus() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  async function setStatus(o: Order, status: OrderStatus) {
    if (status === "cancelled" && !confirm(`Cancel ${o.code}? Items go back into stock.`)) return;
    setBusy(o.id);
    try {
      await api(`/api/admin/orders/${o.id}`, "PATCH", { status });
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    }
    setBusy(null);
  }
  return { busy, setStatus };
}

/** Horizontal rail of orders that still need work (overview tab). */
export function OrdersRail({ orders }: { orders: Order[] }) {
  const { busy, setStatus } = useSetStatus();
  const [view, setView] = useViewMode("overview-orders");
  const [filter, setFilter] = useState<OrderStatus | "open">("open");
  const rail = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  const list = orders.filter((o) => (filter === "open" ? ["received", "confirmed", "packed", "ready"].includes(o.status) : o.status === filter));
  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
    setTimeout(() => setPage(Math.round(el.scrollLeft / Math.max(1, el.clientWidth * 0.9)) + 1), 400);
  };
  const pages = Math.max(1, Math.ceil(list.length / 4));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <Pill active={filter === "open"} onClick={() => setFilter("open")}>Needs action</Pill>
          {(["received", "confirmed", "packed", "ready"] as OrderStatus[]).map((s) => (
            <Pill key={s} active={filter === s} onClick={() => setFilter(s)}>
              {statusLabel[s]} <span className="opacity-50">{orders.filter((o) => o.status === s).length}</span>
            </Pill>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {view === "cards" && (
            <div className="hidden items-center gap-2 sm:flex">
              <RoundBtn dir={-1} onClick={() => nudge(-1)} />
              <span className="min-w-14 text-center text-sm font-semibold tabular-nums text-ink">
                {String(Math.min(page, pages)).padStart(2, "0")} <span className="font-normal text-muted">/ {String(pages).padStart(2, "0")}</span>
              </span>
              <RoundBtn dir={1} onClick={() => nudge(1)} />
            </div>
          )}
          <ViewToggle mode={view} onChange={setView} />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-10 text-center text-muted">Nothing waiting here. Nice.</div>
      ) : view === "table" ? (
        <OrderTableView list={list} busy={busy} setStatus={setStatus} />
      ) : (
        <div ref={rail} className="no-scrollbar -mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-1 sm:mx-0 sm:scroll-px-0 sm:px-0">
          {list.map((o) => (
            <div key={o.id} className="w-[86%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] 2xl:w-[calc(25%-12px)]">
              <OrderCard o={o} busy={busy === o.id} onStatus={(s) => setStatus(o, s)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ o, busy, onStatus }: { o: Order; busy: boolean; onStatus: (s: OrderStatus) => void }) {
  const pickup = pickupPoints.find((p) => p.id === o.pickupPoint)?.name ?? o.pickupPoint;
  const items = o.lines.reduce((s, l) => s + l.qty, 0);
  const step = next[o.status];
  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-white">
          {o.customer.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-ink">{o.customer.name}</h3>
          <p className="truncate text-xs text-muted">
            <span className="font-mono font-semibold text-forest">{o.code}</span> · {pickup}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[o.status]}`}>{statusLabel[o.status]}</span>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f3f4f0] px-3 py-2.5">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Items</dt>
          <dd className="text-sm font-semibold tabular-nums text-ink">{items}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Total</dt>
          <dd className="text-sm font-semibold tabular-nums text-leaf">{money(o.total)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Pay</dt>
          <dd className="text-sm text-ink">{o.payment === "momo" ? "MoMo" : "Cash"}</dd>
        </div>
      </dl>
      <p className="mt-3 line-clamp-2 text-xs text-muted">{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <a href={`tel:${o.customer.phone}`} className="text-xs font-semibold text-ink hover:text-leaf">{o.customer.phone}</a>
        {step && (
          <button
            onClick={() => onStatus(step.to)}
            disabled={busy}
            className="rounded-full bg-leaf px-4 py-1.5 text-sm font-semibold text-white hover:bg-forest disabled:opacity-60"
          >
            {busy ? <Busy text="Saving…" /> : step.label}
          </button>
        )}
      </div>
    </article>
  );
}

/** Full order list with filters (orders tab). */
export function OrdersTable({ orders }: { orders: Order[] }) {
  const { busy, setStatus } = useSetStatus();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [pickup, setPickup] = useState<string>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useViewMode("orders", "table");

  const list = useMemo(
    () =>
      orders.filter(
        (o) =>
          (filter === "all" || o.status === filter) &&
          (pickup === "all" || o.pickupPoint === pickup) &&
          (!q || `${o.code} ${o.customer.name} ${o.customer.phone}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [orders, filter, pickup, q],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          <Pill active={filter === "all"} onClick={() => setFilter("all")}>All <span className="opacity-50">{orders.length}</span></Pill>
          {orderStatuses.map((s) => (
            <Pill key={s} active={filter === s} onClick={() => setFilter(s)}>
              {statusLabel[s]} <span className="opacity-50">{orders.filter((o) => o.status === s).length}</span>
            </Pill>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={pickup} onChange={(e) => setPickup(e.target.value)} className="rounded-full border border-line bg-white px-3.5 py-2 text-base outline-none sm:text-sm" aria-label="Pickup point">
            <option value="all">All pickup points</option>
            {pickupPoints.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Code, name, phone" className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-2 text-base outline-none focus:border-leaf sm:w-52 sm:flex-none sm:text-sm" />
          <ViewToggle mode={view} onChange={setView} />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-muted">No orders match.</div>
      ) : (
        view === "table" ? (
          <OrderTableView list={list} busy={busy} setStatus={setStatus} />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {list.map((o) => (
              <OrderCard key={o.id} o={o} busy={busy === o.id} onStatus={(st) => setStatus(o, st)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function RoundBtn({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={dir === 1 ? "Next" : "Previous"} className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-soft hover:ring-ink/40">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d={dir === 1 ? "M4 10h12M11 5l5 5-5 5" : "M16 10H4M9 5l-5 5 5 5"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ---------- Table view shared by Overview and Orders ---------- */

function OrderTableView({
  list,
  busy,
  setStatus,
}: {
  list: Order[];
  busy: string | null;
  setStatus: (o: Order, s: OrderStatus) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-soft">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-[#f7f8f5] text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">Code</th>
            <th className="px-3 py-3">Student</th>
            <th className="px-3 py-3">Pickup</th>
            <th className="px-3 py-3 text-right">Items</th>
            <th className="px-3 py-3 text-right">Total</th>
            <th className="px-3 py-3">Pay</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-4 py-3 text-right">Next step</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hair">
          {list.map((o) => {
            const pickupName = pickupPoints.find((p) => p.id === o.pickupPoint)?.name ?? o.pickupPoint;
            const items = o.lines.reduce((s, l) => s + l.qty, 0);
            const step = next[o.status];
            const open = openId === o.id;
            return (
              <Fragment key={o.id}>
                <tr className="hover:bg-[#fafbf8]">
                  <td className="px-4 py-2.5">
                    <button onClick={() => setOpenId(open ? null : o.id)} className="flex items-center gap-1.5 font-mono font-bold text-forest" aria-expanded={open}>
                      <svg viewBox="0 0 20 20" className={`h-3 w-3 transition ${open ? "rotate-90" : ""}`} fill="currentColor" aria-hidden>
                        <path d="M7 4l7 6-7 6z" />
                      </svg>
                      {o.code}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="max-w-[180px] truncate font-semibold">{o.customer.name}</p>
                    <a href={`tel:${o.customer.phone}`} className="text-xs text-leaf hover:underline">{o.customer.phone}</a>
                  </td>
                  <td className="max-w-[170px] truncate px-3 py-2.5 text-muted">{pickupName}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{items}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{money(o.total)}</td>
                  <td className="px-3 py-2.5 text-muted">{o.payment === "momo" ? "MoMo" : "Cash"}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={o.status}
                      disabled={busy === o.id || o.status === "cancelled"}
                      onChange={(e) => setStatus(o, e.target.value as OrderStatus)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold outline-none ${statusStyle[o.status]}`}
                      aria-label={`Status for ${o.code}`}
                    >
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                    {busy === o.id && <Spinner size={16} className="ml-2 align-middle" label="Saving status" />}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    {step ? (
                      <button
                        onClick={() => setStatus(o, step.to)}
                        disabled={busy === o.id}
                        className="rounded-full bg-leaf px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest disabled:opacity-60"
                      >
                        {busy === o.id ? <Busy text="Saving…" /> : step.label}
                      </button>
                    ) : (
                      <span className="text-xs text-muted">–</span>
                    )}
                  </td>
                </tr>
                {open && (
                  <tr className="bg-[#f7f8f5]">
                    <td colSpan={8} className="px-4 py-3">
                      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                        {o.lines.map((l) => (
                          <li key={l.productId}>
                            <strong>{l.qty}×</strong> {l.name} <span className="text-muted">({l.unit})</span>
                          </li>
                        ))}
                      </ul>
                      {o.notes && <p className="mt-2 text-muted">Note: {o.notes}</p>}
                      {o.customer.studentId && <p className="mt-1 text-xs text-muted">Student ID: {o.customer.studentId}</p>}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
