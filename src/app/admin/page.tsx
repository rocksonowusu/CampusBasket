import type { Metadata } from "next";
import { renderAdmin } from "./render";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Overview · Campus Basket team", robots: { index: false } };

export default function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ drop?: string }> }) {
  return renderAdmin("overview", searchParams);
}
