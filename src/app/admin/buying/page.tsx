import type { Metadata } from "next";
import { renderAdmin } from "../render";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Buying list · Campus Basket team", robots: { index: false } };

export default function AdminBuyingPage({ searchParams }: { searchParams: Promise<{ drop?: string }> }) {
  return renderAdmin("buying", searchParams);
}
