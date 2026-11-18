"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductArt } from "@/components/ProductArt";

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
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <ProductArt art="sack" category="grains" alt="" className="mx-auto h-28 w-28 rounded-full" />
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-forest">Track your order</h1>
      <p className="mt-2 text-muted">Enter the pickup code from your confirmation, like CB-7K3Q.</p>
      <form onSubmit={go} className="mt-8 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CB-XXXX"
          autoCapitalize="characters"
          className="flex-1 rounded-full border-2 border-line bg-white px-5 py-3 text-center font-mono text-lg uppercase tracking-widest outline-none focus:border-leaf"
        />
        <button className="rounded-full bg-forest px-6 font-semibold text-paper hover:bg-forest-2">Go</button>
      </form>
    </div>
  );
}
