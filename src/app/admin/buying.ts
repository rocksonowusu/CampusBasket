import type { ArtKind, Order, Product } from "@/lib/types";

export interface BuyNeed {
  productId: string;
  name: string;
  unit: string;
  farm: string;
  supplierId?: string;
  art: ArtKind;
  category?: string;
  image?: string;
  direct: number; // ordered on its own
  viaBoxes: number; // needed to pack boxes
  total: number;
  buy: number; // whole units to buy (rounded up)
}

/**
 * Turn a drop's orders into what the team needs to buy. Boxes with contents set are broken down
 * into their component products (qty × boxes ordered); boxes without contents are listed separately.
 */
export function computeBuying(orders: Order[], products: Product[]) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const needs = new Map<string, BuyNeed>();
  const boxesWithoutContents = new Map<string, { id: string; name: string; qty: number }>();

  const add = (productId: string, qty: number, kind: "direct" | "viaBoxes", fallback?: { name: string; unit: string }) => {
    const p = byId.get(productId);
    const cur =
      needs.get(productId) ??
      ({
        productId,
        name: p?.name ?? fallback?.name ?? productId,
        unit: p?.unit ?? fallback?.unit ?? "",
        farm: p?.farm ?? "Unknown supplier",
        supplierId: p?.supplierId,
        art: p?.art ?? "box",
        category: p?.category,
        image: p?.image,
        direct: 0,
        viaBoxes: 0,
        total: 0,
        buy: 0,
      } satisfies BuyNeed);
    cur[kind] += qty;
    cur.total = Math.round((cur.direct + cur.viaBoxes) * 100) / 100;
    cur.buy = Math.ceil(cur.total - 1e-9);
    needs.set(productId, cur);
  };

  for (const o of orders) {
    for (const l of o.lines) {
      const p = byId.get(l.productId);
      if (p?.bundle?.length) {
        for (const c of p.bundle) add(c.productId, c.qty * l.qty, "viaBoxes");
      } else if (p?.category === "boxes") {
        const cur = boxesWithoutContents.get(l.productId) ?? { id: l.productId, name: l.name, qty: 0 };
        cur.qty += l.qty;
        boxesWithoutContents.set(l.productId, cur);
      } else {
        add(l.productId, l.qty, "direct", { name: l.name, unit: l.unit });
      }
    }
  }

  const list = [...needs.values()].sort((a, b) => a.farm.localeCompare(b.farm) || a.name.localeCompare(b.name));
  const groups = new Map<string, { key: string; farm: string; supplierId?: string; items: BuyNeed[] }>();
  for (const n of list) {
    const key = n.supplierId ?? `farm:${n.farm}`;
    const g = groups.get(key) ?? { key, farm: n.farm, supplierId: n.supplierId, items: [] };
    g.items.push(n);
    groups.set(key, g);
  }
  return { needs: list, groups: [...groups.values()], boxesWithoutContents: [...boxesWithoutContents.values()] };
}

/** 2.4 -> "2.4", 3 -> "3" */
export const qtyLabel = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""));
