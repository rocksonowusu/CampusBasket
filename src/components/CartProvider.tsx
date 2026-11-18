"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ArtKind, Product } from "@/lib/types";

export interface CartItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  marketPrice: number;
  art: ArtKind;
  image?: string;
  stock: number;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  marketTotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  qtyOf: (id: string) => number;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "campus-basket-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* storage unavailable — start empty */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, loaded]);

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) {
        return prev.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i));
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          unit: p.unit,
          price: p.price,
          marketPrice: p.marketPrice,
          art: p.art,
          image: p.image,
          stock: p.stock,
          qty: 1,
        },
      ];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i)),
    );
  }, []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    const marketTotal = items.reduce((s, i) => s + i.qty * i.marketPrice, 0);
    return {
      items,
      count,
      total,
      marketTotal,
      open,
      setOpen,
      add,
      setQty,
      qtyOf: (id) => items.find((i) => i.id === id)?.qty ?? 0,
      clear: () => setItems([]),
    };
  }, [items, open, add, setQty]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
