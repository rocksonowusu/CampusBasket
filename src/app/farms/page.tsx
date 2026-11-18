import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/db";
import { FarmsSection, PageHeader } from "@/components/Sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Our farms · Campus Basket" };

export default async function FarmsPage() {
  const products = (await getProducts()).filter((p) => p.active);
  return (
    <>
      <PageHeader
        image="/photos/farms-header.jpg"
        focus="center 60%"
        kicker="Who grows it"
        title="The people behind your groceries"
        sub="Every week we buy straight from these farms and makers. No middlemen, fair prices, paid on time."
      />
      <FarmsSection products={products} className="pt-10 sm:pt-14" head={null} />
      <div className="wrap mt-12 text-center">
        <Link href="/shop" className="inline-block rounded-full bg-forest px-7 py-3.5 font-semibold text-paper hover:bg-forest-2">
          Shop their produce →
        </Link>
      </div>
    </>
  );
}
