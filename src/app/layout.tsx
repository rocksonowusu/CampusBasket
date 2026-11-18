import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Figtree } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBasketBar } from "@/components/MobileBasketBar";
import { store } from "@/lib/config";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["600", "700"] });

export const metadata: Metadata = {
  title: `${store.name} — ${store.tagline}`,
  description:
    "We buy wholesale straight from farmers and sell to students at near farm-gate prices. Order by Thursday, pick up on campus Saturday.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} ${caveat.variable}`}>
      <body className="min-h-screen">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <MobileBasketBar />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
