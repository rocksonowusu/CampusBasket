"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { pickupPoints, store, drop } from "@/lib/config";

export function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer
      className={`bg-forest text-paper/80 ${path === "/" ? "" : "mt-16 sm:mt-24"} ${path.startsWith("/checkout") ? "hidden lg:block" : ""}`}
    >
      <div className="wrap grid grid-cols-2 gap-x-6 gap-y-9 py-12 sm:py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Run by students, for students. We pool everyone&apos;s orders, buy wholesale from farmers and pass the
            savings straight on.
          </p>
        </div>
        <div>
          <h3 className="font-display font-semibold text-paper">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-yolk">This week&apos;s drop</Link></li>
            <li><Link href="/track" className="hover:text-yolk">Track an order</Link></li>
            <li><Link href="/how-it-works" className="hover:text-yolk">How it works &amp; FAQ</Link></li>
            <li><Link href="/farms" className="hover:text-yolk">Our farms</Link></li>
            <li><Link href="/credits" className="hover:text-yolk">Photo credits</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display font-semibold text-paper">Pickup points</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {pickupPoints.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
            <li className="text-paper/60">Saturdays · {drop.pickupWindow}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-display font-semibold text-paper">Talk to us</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{store.supportPhone}</li>
            <li>
              <a href={store.supportWhatsApp} className="hover:text-yolk" target="_blank" rel="noreferrer">
                WhatsApp the team
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-5 text-xs text-paper/50">
          © {new Date().getFullYear()} {store.name}. Market prices are what we found at the open market and campus shops
          the week before each drop.
        </p>
      </div>
    </footer>
  );
}
