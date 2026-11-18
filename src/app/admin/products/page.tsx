import type { Metadata } from "next";
import { renderAdmin } from "../render";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products · Campus Basket team", robots: { index: false } };

export default function AdminProductsPage({ searchParams }: { searchParams: Promise<{ drop?: string }> }) {
  return renderAdmin("products", searchParams);
}
