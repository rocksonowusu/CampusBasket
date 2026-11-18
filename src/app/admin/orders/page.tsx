import type { Metadata } from "next";
import { renderAdmin } from "../render";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders · Campus Basket team", robots: { index: false } };

export default function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ drop?: string }> }) {
  return renderAdmin("orders", searchParams);
}
