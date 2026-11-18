import Link from "next/link";
import { getProducts } from "@/lib/db";
import { money, percentOff } from "@/lib/format";
import { pickupPoints, store } from "@/lib/config";
import { ShopGrid } from "@/components/ShopGrid";
import { CountdownBoard } from "@/components/DropCountdown";
import type { Product } from "@/lib/types";
import { CampusSection, PhotoBand, SectionHead, StayInLoop, groupFarms } from "@/components/Sections";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = (await getProducts()).filter((p) => p.active);

  const receiptIds = ["rice", "tomatoes", "eggs-half", "plantain", "oil", "onions"];
  const receipt = receiptIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];

  const avgOff = Math.round(
    products.reduce((s, p) => s + percentOff(p.price, p.marketPrice), 0) / Math.max(1, products.length),
  );
  const farms = groupFarms(products);

  return (
    <>
      <Hero receipt={receipt} />

      {/* Stats strip — computed from live catalogue */}
      <section className="border-y border-hair bg-white">
        <div className="wrap grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
          <Stat value={`${avgOff}%`} label="cheaper than the market, on average" />
          <Stat value={String(farms.length)} label="farms & makers we buy from" />
          <Stat value={String(pickupPoints.length)} label="pickup points on campus" />
          <Stat value={`${store.currency}0`} label="delivery or service fees" />
        </div>
      </section>

      <section id="shop" className="wrap scroll-mt-20 pt-12 sm:pt-20">
        <SectionHead
          kicker="This week's drop"
          title="Fresh in from the farms"
          aside={
            <p className="max-w-sm text-sm text-muted">
              Stock is what we&apos;re buying this week. When it&apos;s gone, it&apos;s gone until the next drop.
            </p>
          }
        />
        <div className="mt-8">
          <ShopGrid products={products} />
        </div>
      </section>

      <CampusSection />

      <StayInLoop />

      <PhotoBand />
    </>
  );
}

function Hero({ receipt }: { receipt: Product[] }) {
  const ours = receipt.reduce((s, p) => s + p.price, 0);
  const market = receipt.reduce((s, p) => s + p.marketPrice, 0);

  return (
    <section className="relative isolate overflow-hidden bg-forest">
      {/* Full-bleed background photo with one flat overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/photos/hero-bg.jpg"
        alt="Tomato sellers at a market in Ghana"
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-black/40" />

      <div className="wrap grid items-center gap-10 py-12 sm:py-16 md:py-20 lg:min-h-[calc(100svh-104px)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="text-white">
          <p className="font-hand text-[1.8rem] leading-none text-yolk">A student grocery co-op</p>
          <h1 className="mt-3 font-display text-[2.7rem] font-extrabold leading-[1.02] tracking-tight [text-shadow:0_2px_18px_rgba(0,0,0,0.3)] sm:text-6xl lg:text-7xl">
            Farm-gate prices,
            <br />
            picked up on{" "}
            <span className="relative inline-block whitespace-nowrap">
              campus.
              <svg viewBox="0 0 300 14" className="absolute -bottom-2 left-0 w-full" preserveAspectRatio="none" aria-hidden>
                <path d="M2 10c60-8 140-10 296-4" stroke="#f6b92b" strokeWidth="6" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg">
            We pool everyone&apos;s order, buy in bulk straight from Ghanaian farmers, and hand it over on campus every
            Saturday. No middlemen, no delivery fees. Just cheaper food.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <Link href="/shop" className="rounded-full bg-yolk px-5 py-3.5 text-center font-semibold text-forest transition hover:bg-paper sm:px-6">
              <span className="sm:hidden">Shop now</span>
              <span className="hidden sm:inline">Shop this week&apos;s drop</span>
            </Link>
            <Link href="/how-it-works" className="rounded-full border-2 border-white px-5 py-3 text-center font-semibold text-white transition hover:bg-white hover:text-forest sm:px-6">
              How it works
            </Link>
          </div>
          <div className="mt-8 sm:mt-10">
            <CountdownBoard onDark />
          </div>
        </div>

        {/* Compact savings card (phones) */}
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 text-ink shadow-lg sm:hidden">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">A typical student week</p>
            <p className="mt-1 text-sm">
              Market <span className="text-muted line-through">{money(market)}</span>{" "}
              <span className="font-display text-lg font-bold text-forest">→ {money(ours)}</span>
            </p>
          </div>
          <span className="shrink-0 -rotate-6 rounded-md border-[3px] border-tomato px-2 py-0.5 font-display text-sm font-extrabold uppercase text-tomato">
            Saved {money(market - ours)}
          </span>
        </div>

        {/* Receipt comparison */}
        <div className="mx-auto hidden w-full min-w-0 max-w-[360px] sm:block lg:mr-0">
          <div className="rotate-[1.5deg] drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]">
            <div className="receipt-edge bg-white px-6 pb-10 pt-6 font-mono text-[13px] text-ink">
              <div className="text-center">
                <p className="font-display text-base font-bold tracking-wide text-forest">{store.name.toUpperCase()}</p>
                <p className="text-[11px] text-muted">A typical student week · same items</p>
              </div>
              <div className="my-4 border-t border-dashed border-ink/30" />
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 gap-y-1.5 sm:gap-x-4">
                <span className="text-[11px] text-muted">ITEM</span>
                <span className="text-right text-[11px] text-muted">MARKET</span>
                <span className="text-right text-[11px] text-muted">US</span>
                {receipt.map((p) => (
                  <Row key={p.id} p={p} />
                ))}
              </div>
              <div className="my-4 border-t border-dashed border-ink/30" />
              <div className="flex justify-between">
                <span>MARKET TOTAL</span>
                <span className="line-through decoration-tomato">{money(market)}</span>
              </div>
              <div className="mt-1 flex justify-between text-base font-bold text-forest">
                <span>YOU PAY</span>
                <span>{money(ours)}</span>
              </div>
              <div className="mt-5 flex items-center justify-center">
                <span className="-rotate-6 rounded-md border-[3px] border-tomato px-3 py-1 font-display text-lg font-extrabold uppercase tracking-wide text-tomato">
                  Saved {money(market - ours)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ p }: { p: Product }) {
  return (
    <>
      <span className="truncate">
        {p.name} <span className="hidden text-muted sm:inline">({p.unit})</span>
      </span>
      <span className="text-right text-muted">{money(p.marketPrice)}</span>
      <span className="text-right font-semibold">{money(p.price)}</span>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-1 py-4 sm:px-2 sm:py-6 md:px-6">
      <div className="font-display text-2xl font-extrabold text-leaf sm:text-4xl">{value}</div>
      <div className="mt-0.5 text-[13px] leading-snug text-muted sm:mt-1 sm:text-sm">{label}</div>
    </div>
  );
}

