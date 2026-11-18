import type { Metadata } from "next";
import { getProducts } from "@/lib/db";
import { drop } from "@/lib/config";
import { ShopGrid } from "@/components/ShopGrid";
import { CountdownText, PickupText } from "@/components/DropCountdown";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop this week · Campus Basket" };

export default async function ShopPage() {
  const products = (await getProducts()).filter((p) => p.active);
  return (
    <div className="wrap pb-6 pt-6 sm:pt-10">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 md:flex-row md:items-end">
        <div>
          <p className="font-hand text-2xl text-leaf">This week&apos;s drop</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">Shop fresh from the farms</h1>
        </div>
        <p className="text-sm text-muted">
          Orders close in <strong className="text-ink"><CountdownText /></strong> · pickup{" "}
          <strong className="text-ink"><PickupText long /></strong>, {drop.pickupWindow}
        </p>
      </div>
      <ShopGrid products={products} />
    </div>
  );
}
