"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";
import { CountdownText, PickupText } from "./DropCountdown";

function Ticker() {
  const items = [
    <>Orders close in <CountdownText /></>,
    <>Next pickup: <PickupText /></>,
    <>No delivery fees, ever</>,
    <>Bought straight from the farm</>,
    <>Not happy with something? We refund it</>,
  ];
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap">
          <span>{it}</span>
          <span aria-hidden className="text-forest/40">✺</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden bg-yolk py-2 text-[13px] font-semibold text-forest">
      <div className="marquee flex w-max">
        {row}
        <div aria-hidden className="flex">{row}</div>
      </div>
    </div>
  );
}

const links = [
  { href: "/shop", label: "Shop this week" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/farms", label: "Our farms" },
  { href: "/track", label: "Track order" },
];

export function Header() {
  const { count, setOpen } = useCart();
  const path = usePathname();
  const [menu, setMenu] = useState(false);

  useEffect(() => setMenu(false), [path]);

  if (path.startsWith("/admin")) return null;

  return (
    <>
      {/* Ticker scrolls away; only the nav bar sticks, so phones keep more screen */}
      <Ticker />
      <header className="sticky top-0 z-30 border-b border-hair bg-paper/95 backdrop-blur">
        <nav className="wrap flex items-center justify-between gap-3 py-3">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <div className="hidden items-center gap-7 text-[15px] font-medium text-ink/80 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} className={path === l.href ? "font-semibold text-leaf" : "hover:text-leaf"}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              aria-label={`Open basket, ${count} items`}
              className="group flex items-center gap-2 rounded-full bg-forest py-2 pl-3.5 pr-2 text-sm font-semibold text-paper transition hover:bg-forest-2 sm:pl-4"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 9h18l-2 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" strokeLinejoin="round" />
                <path d="M8 9l3-6M16 9l-3-6" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Basket</span>
              <span className="grid h-7 min-w-7 place-items-center rounded-full bg-yolk px-1.5 text-xs font-bold text-forest tabular-nums">
                {count}
              </span>
            </button>
            <button
              onClick={() => setMenu((v) => !v)}
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-forest md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menu && (
          <div className="border-t border-hair bg-paper md:hidden">
            <ul className="wrap divide-y divide-hair py-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setMenu(false)} aria-current={path === l.href ? "page" : undefined} className={`flex items-center justify-between py-3.5 text-base font-semibold ${path === l.href ? "text-leaf" : "text-ink"}`}>
                    {l.label}
                    <span aria-hidden className="text-muted">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
