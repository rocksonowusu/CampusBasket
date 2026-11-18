"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { store } from "@/lib/config";
import { Busy } from "@/components/Spinner";

export function AdminLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) return router.refresh();
    setBusy(false);
    setError("That passcode didn't work. Ask whoever runs the team chat.");
  }

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-forest">
      {/* Full-bleed photo, one flat overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/photos/admin-login.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-black/35" />

      <div className="mx-auto grid min-h-svh max-w-[1280px] items-center gap-10 px-5 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="text-white">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="font-display text-xl font-bold">{store.name}</span>
          </Link>
          <h1 className="mt-10 max-w-lg font-display text-4xl font-extrabold leading-[1.05] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] sm:text-6xl lg:mt-0 lg:pt-24">
            Every big order starts with one basket.
          </h1>
          <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">
            Sign in to manage this week&apos;s drop: products, prices, stock and orders.
          </p>
        </div>

        <form onSubmit={submit} className="w-full max-w-md justify-self-center rounded-3xl bg-paper p-7 shadow-2xl sm:p-9 lg:justify-self-end">
          <h2 className="text-center font-display text-2xl font-bold text-ink">Team sign in</h2>
          <p className="mt-1 text-center text-sm text-muted">For the people packing the bags</p>

          <label className="mt-8 block">
            <span className="text-sm font-semibold text-ink">Team passcode</span>
            <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 focus-within:border-leaf focus-within:ring-2 focus-within:ring-sprout">
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <rect x="4" y="9" width="12" height="8" rx="2" />
                <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
              </svg>
              <input
                type={show ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter the team passcode"
                autoFocus
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="text-xs font-semibold text-muted hover:text-ink">
                {show ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          {error && <p role="alert" className="mt-3 text-sm text-tomato">{error}</p>}

          <button
            disabled={busy || !passcode}
            className="mt-6 w-full rounded-xl bg-leaf py-3.5 font-semibold text-white transition hover:bg-forest disabled:opacity-60"
          >
            {busy ? <Busy text="Signing in…" /> : "Sign in"}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
          <Link href="/" className="block w-full rounded-xl border border-line bg-white py-3 text-center text-sm font-semibold text-ink hover:border-leaf">
            Back to the shop
          </Link>
          <p className="mt-6 text-center text-xs text-muted">
            Lost the passcode? It&apos;s set in <code className="rounded bg-white px-1">ADMIN_PASSCODE</code> on the server.
          </p>
        </form>
      </div>
    </div>
  );
}
