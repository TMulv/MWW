"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ITEMS } from "@/lib/catalog";

export type Line = { id: string; qty: number; note: string };
export type Mode = { kind: "cart" } | { kind: "single"; id: string } | { kind: "custom" };

type Ctx = {
  cart: Line[];
  count: number;
  add: (id: string) => void;
  update: (id: string, patch: Partial<Line>) => void;
  remove: (id: string) => void;
  clear: () => void;
  mode: Mode | null;
  open: (m: Mode) => void;
  close: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "mww-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Line[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);

  // Restore the cart, and support old "/?piece=id" links by opening that piece's request.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      // Reading localStorage has to wait until after hydration, so this setState is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(saved)) setCart(saved.filter((l: Line) => ITEMS.some((i) => i.id === l.id)));
    } catch {}
    setLoaded(true);
    const piece = new URLSearchParams(window.location.search).get("piece");
    if (piece && ITEMS.some((i) => i.id === piece)) setMode({ kind: "single", id: piece });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
  }, [cart, loaded]);

  const add = useCallback((id: string) => {
    setCart((c) => (c.some((l) => l.id === id)
      ? c.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
      : [...c, { id, qty: 1, note: "" }]));
  }, []);
  const update = useCallback((id: string, patch: Partial<Line>) => {
    setCart((c) => c.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);
  const remove = useCallback((id: string) => setCart((c) => c.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setCart([]), []);

  return (
    <CartCtx.Provider value={{
      cart, count: cart.reduce((n, l) => n + l.qty, 0),
      add, update, remove, clear,
      mode, open: setMode, close: () => setMode(null),
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
