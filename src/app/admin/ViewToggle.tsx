"use client";

import { useEffect, useState } from "react";

export type ViewMode = "cards" | "table";

/** Remembers the chosen view per section in this browser (falls back gracefully if storage is blocked). */
export function useViewMode(key: string, initial: ViewMode = "cards") {
  const storageKey = `cb-admin-view:${key}`;
  const [mode, setMode] = useState<ViewMode>(initial);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "cards" || saved === "table") setMode(saved);
    } catch {}
  }, [storageKey]);
  const update = (m: ViewMode) => {
    setMode(m);
    try {
      localStorage.setItem(storageKey, m);
    } catch {}
  };
  return [mode, update] as const;
}

export function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const opt = (m: ViewMode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => onChange(m)}
      aria-pressed={mode === m}
      title={`${label} view`}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
        mode === m ? "bg-ink text-white" : "text-ink/70 hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        {icon}
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
  return (
    <div className="inline-flex shrink-0 rounded-full border border-line bg-white p-0.5" role="group" aria-label="Choose view">
      {opt("cards", "Cards", <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" strokeLinejoin="round" />)}
      {opt("table", "Table", <path d="M3 4h14M3 8h14M3 12h14M3 16h14" strokeLinecap="round" />)}
    </div>
  );
}
