"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const stages = ["Received", "Bought", "Packed", "Ready"];

export default function TrackPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    let c = code.trim().toUpperCase().replace(/\s/g, "");
    if (!c) return;
    if (!c.startsWith("CB-")) c = `CB-${c.replace(/^CB/, "")}`;
    router.push(`/order/${c}`);
  }

  return (
    <section className="relative isolate flex items-center overflow-hidden bg-forest lg:min-h-[calc(100svh-104px)]">
      {/* Full-bleed photo, one flat overlay (no gradient) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/photos/track-bg.jpg"
        alt="A tricycle loaded with sacks of produce on a road in Accra"
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[35%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-black/45" />

      <div className="wrap grid w-full grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_440px]">
        <div className="text-white">
          <p className="font-hand text-[1.8rem] leading-none text-yolk">Where&apos;s my basket?</p>
          <h1 className="mt-3 max-w-xl font-display text-[2.6rem] font-extrabold leading-[1.03] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] sm:text-6xl">
            From the farm, to the road, to campus.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
            Pop in your pickup code to see exactly where your order is, from the bulk buy to the pickup table.
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-6 text-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] sm:p-8">
          <h2 className="font-display text-2xl font-bold text-forest">Track your order</h2>
          <p className="mt-1 text-sm text-muted">Enter the code from your confirmation, like <span className="whitespace-nowrap">CB-7K3Q</span>.</p>
          <form onSubmit={go} className="mt-6 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CB-XXXX"
              aria-label="Pickup code"
              autoCapitalize="characters"
              className="w-full min-w-0 flex-1 rounded-full border border-line bg-paper px-5 py-3 text-center font-mono text-lg uppercase tracking-widest outline-none transition focus:border-leaf focus:bg-white focus:ring-2 focus:ring-sprout"
            />
            <button className="rounded-full bg-forest px-6 font-semibold text-paper transition hover:bg-forest-2">Track</button>
          </form>

          {/* What they'll see next */}
          <ol className="mt-7 flex items-center">
            {stages.map((s, i) => (
              <li key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`h-3 w-3 rounded-full ${i === 0 ? "bg-leaf ring-4 ring-sprout" : "bg-line"}`} />
                  <span className="text-[11px] font-semibold text-muted">{s}</span>
                </div>
                {i < stages.length - 1 && <span className="mx-1 mb-5 h-0.5 flex-1 rounded bg-hair" />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
