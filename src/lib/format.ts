import { drop, store } from "./config";

export function money(n: number) {
  return `${store.currency}${n.toFixed(2).replace(/\.00$/, "")}`;
}

export function percentOff(price: number, market: number) {
  if (market <= 0 || price >= market) return 0;
  return Math.round((1 - price / market) * 100);
}

/** Next order cutoff at or after `now`. */
export function nextCutoff(now = new Date()) {
  const d = new Date(now);
  d.setHours(drop.cutoffHour, 0, 0, 0);
  const diff = (drop.cutoffWeekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  if (d <= now) d.setDate(d.getDate() + 7);
  return d;
}

/** Pickup day that belongs to the next cutoff. */
export function nextPickup(now = new Date()) {
  const cutoff = nextCutoff(now);
  const d = new Date(cutoff);
  const diff = (drop.pickupWeekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dayLabel(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

export function shortDay(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
