import "server-only";
import { isAdmin } from "@/lib/auth";
import { getBuyingChecks, getOrders, getProducts, getSuppliers } from "@/lib/db";
import { nextPickup, toISODate } from "@/lib/format";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard, type Tab } from "./AdminDashboard";

/** Shared server loader for every /admin page: auth check, data, and which drop is selected (?drop=YYYY-MM-DD). */
export async function renderAdmin(tab: Tab, searchParams: Promise<{ drop?: string }>) {
  if (!(await isAdmin())) return <AdminLogin />;
  const [orders, products, suppliers, sp] = await Promise.all([getOrders(), getProducts(), getSuppliers(), searchParams]);
  const upcoming = toISODate(nextPickup());
  const drops = [...new Set([upcoming, ...orders.map((o) => o.dropDate)])].sort().reverse();
  const drop = sp.drop && drops.includes(sp.drop) ? sp.drop : upcoming;
  const checks = tab === "buying" ? await getBuyingChecks(drop) : [];

  return (
    <AdminDashboard
      tab={tab}
      drop={drop}
      drops={drops}
      upcoming={upcoming}
      orders={orders}
      products={products}
      suppliers={suppliers}
      checks={checks}
      usingDefaultPasscode={!process.env.ADMIN_PASSCODE}
    />
  );
}
