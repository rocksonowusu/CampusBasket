"use client";

import { useEffect, useState } from "react";
import { dayLabel, nextCutoff, nextPickup, shortDay } from "@/lib/format";
import { drop } from "@/lib/config";

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function split(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60_000));
  return { d: Math.floor(mins / 1440), h: Math.floor((mins % 1440) / 60), m: mins % 60 };
}

/** Compact "closes in 2d 4h" text for the ticker. */
export function CountdownText() {
  const now = useNow();
  if (!now) return <span>this week</span>;
  const { d, h, m } = split(nextCutoff(now).getTime() - now.getTime());
  return <span>{d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`}</span>;
}

export function PickupText({ long = false }: { long?: boolean }) {
  const now = useNow();
  if (!now) return <span>Saturday</span>;
  const p = nextPickup(now);
  return <span>{long ? dayLabel(p) : shortDay(p)}</span>;
}

/** Big flip-board style countdown used in the hero. */
export function CountdownBoard({ onDark = false }: { onDark?: boolean }) {
  const now = useNow(1000 * 20);
  const parts = now ? split(nextCutoff(now).getTime() - now.getTime()) : { d: 0, h: 0, m: 0 };
  const cells: [number, string][] = [
    [parts.d, "days"],
    [parts.h, "hrs"],
    [parts.m, "mins"],
  ];
  return (
    <div>
      <div className="flex gap-2">
        {cells.map(([v, label]) => (
          <div
            key={label}
            className={`min-w-[64px] rounded-lg px-3 py-2 text-center ${onDark ? "bg-paper text-forest" : "bg-forest text-paper"}`}
          >
            <div className="font-display text-2xl font-bold tabular-nums">{now ? String(v).padStart(2, "0") : "--"}</div>
            <div className={`text-[11px] uppercase tracking-widest ${onDark ? "text-leaf" : "text-sprout/80"}`}>{label}</div>
          </div>
        ))}
      </div>
      <p className={`mt-2 text-sm ${onDark ? "text-white/85" : "text-muted"}`}>
        until orders close · pickup <strong className={onDark ? "text-white" : "text-ink"}><PickupText long /></strong>, {drop.pickupWindow}
      </p>
    </div>
  );
}
