"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ITEMS } from "@/lib/catalog";

// One line per piece + personalization combo, like a normal store cart.
export type Line = { key: string; id: string; qty: number; note: string };

type Ctx = {
  cart: Line[];
  count: number;
  total: number;
  add: (id: string, qty?: number, note?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  drawer: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "mww-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Line[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      // Reading localStorage has to wait until after hydration, so this setState is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setCart(saved.filter((l: Line) => ITEMS.some((i) => i.id === l.id)));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
  }, [cart, loaded]);

  const add = useCallback((id: string, qty = 1, note = "") => {
    const key = `${id}::${note.trim().toLowerCase()}`;
    setCart((c) => (c.some((l) => l.key === key)
      ? c.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
      : [...c, { key, id, qty, note: note.trim() }]));
  }, []);
  const setQty = useCallback((key: string, qty: number) =>
    setCart((c) => c.map((l) => (l.key === key ? { ...l, qty: Math.max(1, qty) } : l))), []);
  const remove = useCallback((key: string) => setCart((c) => c.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setCart([]), []);

  const total = cart.reduce((s, l) => s + (ITEMS.find((i) => i.id === l.id)?.price ?? 0) * l.qty, 0);

  return (
    <CartCtx.Provider value={{
      cart, count: cart.reduce((n, l) => n + l.qty, 0), total,
      add, setQty, remove, clear,
      drawer, openCart: () => setDrawer(true), closeCart: () => setDrawer(false),
    }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
