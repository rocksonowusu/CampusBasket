import type { Metadata } from "next";
import Link from "next/link";
import { Faq, HowItWorks, PageHeader, WhyCheaper } from "@/components/Sections";

export const metadata: Metadata = { title: "How it works · Campus Basket" };

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        image="/photos/step-farm.jpg"
        kicker="How it works"
        title="One big order for the whole campus."
        sub="We pool everyone's basket, buy in bulk straight from Ghanaian farmers, and hand it over on campus every Saturday."
      />
      <HowItWorks flush />
      <WhyCheaper />
      <Faq />
      <div className="wrap mt-12 text-center">
        <Link href="/shop" className="inline-block rounded-full bg-forest px-7 py-3.5 font-semibold text-paper hover:bg-forest-2">
          Start my basket →
        </Link>
      </div>
    </>
  );
}
