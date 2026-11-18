import Link from "next/link";
import { drop, store } from "@/lib/config";
import { ProductArt } from "@/components/ProductArt";
import type { Product } from "@/lib/types";

// Content sections shared by the homepage and the /how-it-works, /farms pages.

export function FarmsSection({ products, className = "pt-16 sm:pt-24", head = <SectionHead kicker="Who grows it" title="The people behind your groceries" /> }: { products: Product[]; className?: string; head?: React.ReactNode }) {
  const farms = groupFarms(products);
  return (
        <section id="farms" className={`wrap ${className}`}>
          {head}
          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)]">
            <figure className="relative min-h-[320px] overflow-hidden rounded-3xl bg-kraft sm:min-h-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/farm-field.jpg" alt="A vegetable farm in Ghana" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <figcaption className="absolute inset-x-4 bottom-4 rounded-2xl bg-paper p-4 text-forest shadow-sm">
                <p className="font-hand text-2xl leading-tight">Every cedi saved goes to students, and farmers get paid fairly, on time.</p>
              </figcaption>
            </figure>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:content-start sm:gap-4 sm:overflow-visible sm:px-0">
            {farms.map((f, i) => (
              <div
                key={f.name}
                className={`relative w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl bg-kraft p-5 sm:w-auto ${i % 2 ? "sm:rotate-[0.4deg]" : "sm:-rotate-[0.4deg]"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-forest">{f.name}</h3>
                    <p className="text-sm text-ink/70">{f.items.length} product{f.items.length > 1 ? "s" : ""} this week</p>
                  </div>
                  <div className="flex -space-x-3">
                    {f.items.slice(0, 3).map((p) => (
                      <ProductArt key={p.id} art={p.art} category={p.category} image={p.image} alt="" className="h-11 w-11 rounded-full border-2 border-kraft" />
                    ))}
                  </div>
                </div>
                <p className="mt-4 font-hand text-xl leading-snug text-forest">
                  {f.items.map((p) => p.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
          </div>
        </section>
  );
}

/** Full-bleed photo band: image is the whole background, one flat light overlay. */
export function PhotoBand() {
  return (
        <section className="relative mt-16 overflow-hidden bg-forest sm:mt-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/cta.jpg" alt="Tomato sellers at a market in Ghana" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="wrap relative py-20 text-center text-white sm:py-36">
            <p className="font-hand text-2xl text-yolk sm:text-3xl">Orders close {drop.cutoffLabel}</p>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.35)] sm:text-6xl">
              Stop paying campus-shop prices for tomatoes.
            </h2>
            <Link
              href="/shop"
              className="mt-9 inline-block rounded-full bg-paper px-8 py-4 font-semibold text-forest transition hover:bg-yolk"
            >
              Fill my basket
            </Link>
          </div>
        </section>
  );
}

/** Slim full-bleed photo header for inner pages (flat overlay, no gradient). */
export function PageHeader({ kicker, title, sub, image, focus = "center" }: { kicker: string; title: string; sub?: string; image: string; focus?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-forest">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" style={{ objectPosition: focus }} />
      <div className="absolute inset-0 -z-10 bg-black/45" />
      <div className="wrap py-10 text-white sm:py-14">
        <p className="font-hand text-2xl text-yolk sm:text-[1.7rem]">{kicker}</p>
        <h1 className="mt-1 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">{sub}</p>}
      </div>
    </section>
  );
}

export function SectionHead({ kicker, title, aside }: { kicker: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="font-hand text-2xl text-leaf">{kicker}</p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export function StayInLoop() {
  return (
    <section className="wrap mt-12 sm:mt-16">
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-kraft/60 px-6 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-leaf sm:grid">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
              <path d="M9 10h.01M12 10h.01M15 10h.01" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Stay in the loop</h2>
            <p className="mt-1 max-w-md text-sm text-ink/70">
              Get each week&apos;s drop, price changes and pickup reminders on WhatsApp. One message a week, no spam.
            </p>
          </div>
        </div>
        <a
          href={store.supportWhatsApp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-forest"
        >
          Join on WhatsApp <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}

export function HowItWorks({ flush = false }: { flush?: boolean }) {
  const steps = [
    {
      title: "Order by Thursday",
      body: `Fill your basket before ${drop.cutoffLabel}. No payment yet. You're reserving your share of the bulk order.`,
      photo: "/photos/step-order.jpg",
    },
    {
      title: "We buy from the farm",
      body: "Friday morning the team adds up everyone's orders and buys wholesale, straight from the farms.",
      photo: "/photos/step-farm.jpg",
    },
    {
      title: "Collect on Saturday",
      body: `Show your order code at your pickup point, ${drop.pickupWindow}. Pay with MoMo or cash and walk off.`,
      photo: "/photos/step-pickup.jpg",
    },
  ];
  return (
    <section id="how" className={`scroll-mt-16 bg-forest py-14 text-paper sm:py-20 ${flush ? "" : "mt-16 sm:mt-24"}`}>
      <div className="wrap">
        {flush ? (
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Three steps, every week</h2>
        ) : (
          <>
            <p className="font-hand text-2xl text-yolk">How it works</p>
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              One big order for the whole campus. Your share, at bulk prices.
            </h2>
          </>
        )}
        <ol className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:mt-12 sm:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {steps.map((s, i) => (
            <li key={s.title} className="w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl bg-forest-2 sm:w-[46%] md:w-auto">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.photo} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <span className="absolute -bottom-6 left-5 grid h-14 w-14 place-items-center rounded-full bg-yolk font-display text-2xl font-extrabold text-forest ring-4 ring-forest-2">
                  {i + 1}
                </span>
              </div>
              <div className="p-6 pt-9">
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function WhyCheaper() {
  const usual = ["Farmer", "Aggregator", "Wholesaler", "Retailer", "You"];
  const ours = ["Farmer", store.name, "You"];
  return (
    <section className="wrap pt-16 sm:pt-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-10">
        <div>
          <p className="font-hand text-2xl text-leaf">Why it&apos;s cheaper</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Fewer hands between the farm and your pot.
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-ink/75">
            Every hand food passes through adds a markup. We skip most of them by buying in bulk for hundreds of
            students at once. Our margin only covers transport, packing bags and a little float for next week.
          </p>
        </div>
        <div className="space-y-5 rounded-3xl bg-white shadow-soft p-5 sm:p-8">
          <Chain label="The usual way" steps={usual} strike />
          <Chain label={`With ${store.name}`} steps={ours} />
        </div>
      </div>
    </section>
  );
}

function Chain({ label, steps, strike = false }: { label: string; steps: string[]; strike?: boolean }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {steps.map((s, i) => {
          const middle = strike && i > 0 && i < steps.length - 1;
          const brand = !strike && i === 1;
          return (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  middle
                    ? "bg-[#fbe4e1] text-tomato line-through decoration-2"
                    : brand
                      ? "bg-leaf text-white"
                      : "bg-mint text-forest"
                }`}
              >
                {s}
                {middle && <span className="ml-1 text-[11px] no-underline">+markup</span>}
              </span>
              {i < steps.length - 1 && <span className="text-muted">→</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function Faq() {
  const qs = [
    {
      q: "Do I pay online?",
      a: `Not yet. You reserve online and pay when you collect, by Mobile Money or cash. If you can't make it, cancel from your order page before we start buying.`,
    },
    {
      q: "What if something's bruised or missing?",
      a: "Tell us at the pickup table or on WhatsApp the same day and we'll refund that item or swap it next week. No arguments.",
    },
    {
      q: "Why only once a week?",
      a: "Bulk buying is how prices stay low. One big order beats twenty small ones, and it keeps transport cheap.",
    },
    {
      q: "How do you know the market price?",
      a: "Before each drop the team checks prices at the main open market and the campus shops for the same item and size. We show the typical price we found.",
    },
    {
      q: "Can I help out?",
      a: "Yes! Packing volunteers on Saturday morning get a free box. Message the team on WhatsApp.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pt-16 sm:px-6 sm:pt-24">
      <p className="text-center font-hand text-2xl text-leaf">Good questions</p>
      <h2 className="text-center font-display text-3xl font-bold tracking-tight text-forest sm:text-4xl">Before you order</h2>
      <div className="mt-8 divide-y divide-hair rounded-2xl bg-white shadow-soft">
        {qs.map((x) => (
          <details key={x.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
              {x.q}
              <span className="chev grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint text-leaf transition-transform">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">{x.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function groupFarms(products: Product[]) {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    if (/campus basket|wholesale/i.test(p.farm)) continue;
    map.set(p.farm, [...(map.get(p.farm) ?? []), p]);
  }
  return [...map.entries()].map(([name, items]) => ({ name, items }));
}
