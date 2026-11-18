import type { Metadata } from "next";
import { renderAdmin } from "../render";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Suppliers · Campus Basket team", robots: { index: false } };

export default function AdminSuppliersPage({ searchParams }: { searchParams: Promise<{ drop?: string }> }) {
  return renderAdmin("suppliers", searchParams);
}
