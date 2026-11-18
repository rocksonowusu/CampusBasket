"use client";

import { useState } from "react";

export interface SellThroughRow {
  label: string;
  ordered: number;
  left: number;
}

// Two series, validated (scripts/validate_palette.js) against the card surface #f4f3ef:
// lightness band, chroma floor, CVD separation and normal-vision floor all pass. Orange is
// under 3:1 contrast, so every bar carries a visible value label and the legend is always on.
const ORDERED = "#2f8f52";
const LEFT = "#d9932b";

/**
 * 100% stacked bars per aisle: share of this drop's stock already ordered (bottom) vs still
 * in stock (top). Equal heights make sell-through comparable across aisles of very different size;
 * the exact unit counts live in the tooltip.
 */
export function SellThroughChart({ rows }: { rows: SellThroughRow[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const H = 150;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-ink/70">
        <Legend color={ORDERED} label="Ordered" />
        <Legend color={LEFT} label="Still in stock" />
        <span className="text-ink/50">% = share of stock sold</span>
      </div>

      <div className="relative flex items-end gap-2 sm:gap-3" style={{ height: H + 22 }} role="img" aria-label="Units ordered versus still in stock, per aisle">
        {rows.map((r, i) => {
          const total = r.ordered + r.left;
          const share = total ? r.ordered / total : 0;
          const hOrdered = r.ordered ? Math.max(share * H, 3) : 0;
          const hLeft = r.left ? H - hOrdered - (r.ordered ? 2 : 0) : 0;
          const pct = Math.round(share * 100);
          return (
            <div
              key={r.label}
              className="relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
            >
              {/* value label sits on the free end of the bar */}
              <span className="mb-1 text-[11px] font-semibold tabular-nums text-ink">{!total ? "–" : r.ordered > 0 && pct === 0 ? "<1%" : `${pct}%`}</span>
              <div className="flex w-full max-w-[44px] flex-col items-stretch" style={{ gap: r.ordered && r.left ? 2 : 0 }}>
                {r.left > 0 && <div style={{ height: Math.max(hLeft, 2), background: LEFT }} className="rounded-t-[4px]" />}
                {r.ordered > 0 && (
                  <div style={{ height: Math.max(hOrdered, 2), background: ORDERED }} className={r.left > 0 ? "" : "rounded-t-[4px]"} />
                )}
                {total === 0 && <div className="h-[2px] bg-line" />}
              </div>

              {hover === i && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-max -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs text-white shadow-lg">
                  <p className="font-semibold">{r.label}</p>
                  <p className="mt-0.5 flex items-center gap-1.5"><Dot color={ORDERED} /> {r.ordered} ordered</p>
                  <p className="flex items-center gap-1.5"><Dot color={LEFT} /> {r.left} in stock</p>
                  <p className="mt-0.5 text-white/70">{pct}% sold through</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-hair pt-2 sm:gap-3">
        {rows.map((r) => (
          <span key={r.label} className="flex-1 truncate text-center text-[11px] text-ink/60">
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Dot color={color} /> {label}
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />;
}
