import { store } from "@/lib/config";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#2e7d4a" />
      <path d="M20 6c-3 3-4 7-2 11 3-2 5-6 2-11z" fill="#d6ebcf" />
      <path d="M13 15c3-5 11-5 14 0" stroke="#fbf8f1" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M8 18h24l-3 14c-.3 1.4-1.4 2-2.8 2H13.8c-1.4 0-2.5-.6-2.8-2z" fill="#fbf8f1" />
      <path d="M14 23v6M20 23v6M26 23v6" stroke="#2e7d4a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-paper" : "text-forest"}`}>
        {store.name}
      </span>
    </span>
  );
}
