"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Busy } from "@/components/Spinner";

export function CancelOrder({ code }: { code: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setPhone(localStorage.getItem("campus-basket-last-phone") ?? "");
    } catch {}
  }, []);

  async function cancel() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${code}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Couldn't cancel.");
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-muted underline-offset-2 hover:text-tomato hover:underline">
        Need to cancel?
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-soft">
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone used to order"
        className="rounded-lg border border-line px-3 py-2 text-base outline-none focus:border-tomato sm:text-sm"
      />
      <button
        onClick={cancel}
        disabled={busy}
        className="rounded-lg bg-tomato px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? <Busy text="Cancelling…" /> : "Cancel order"}
      </button>
      <button onClick={() => setOpen(false)} className="px-2 text-sm text-muted">Keep it</button>
      {error && <p className="w-full text-sm text-tomato">{error}</p>}
    </div>
  );
}
