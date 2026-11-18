"use client";

import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";

/** Phone-only floating bar: appears once the basket has something in it. */
export function MobileBasketBar() {
  const { count, total, marketTotal, open, setOpen } = useCart();
  const path = usePathname();
  const hidden = count === 0 || open || path.startsWith("/checkout") || path.startsWith("/admin") || path.startsWith("/order");
  if (hidden) return null;

  return (
    <>
      {/* spacer so the bar never covers the end of the page */}
      <div className="h-24 md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-forest px-4 py-3 text-left text-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-9 min-w-9 place-items-center rounded-full bg-yolk px-2 text-sm font-bold text-forest tabular-nums">{count}</span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold">View basket</span>
              {marketTotal > total && <span className="block text-xs text-sprout">Saving {money(marketTotal - total)}</span>}
            </span>
          </span>
          <span className="font-display text-lg font-bold tabular-nums">{money(total)}</span>
        </button>
      </div>
    </>
  );
}
