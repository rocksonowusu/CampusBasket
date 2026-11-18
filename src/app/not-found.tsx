import Link from "next/link";
import { ProductArt } from "@/components/ProductArt";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <ProductArt art="onion" category="veg" alt="" className="mx-auto h-28 w-28 rounded-full" />
      <h1 className="mt-6 font-display text-3xl font-bold text-forest">We couldn&apos;t find that</h1>
      <p className="mt-2 text-muted">Double-check your order code, or head back to the shop.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/track" className="rounded-full border-2 border-forest px-5 py-2.5 font-semibold text-forest">Try another code</Link>
        <Link href="/" className="rounded-full bg-forest px-5 py-3 font-semibold text-paper">Shop</Link>
      </div>
    </div>
  );
}
