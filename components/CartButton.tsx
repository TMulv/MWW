"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartButton() {
  const { count, openCart } = useCart();
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative grid h-10 w-10 place-items-center hover:bg-frame"
    >
      <ShoppingBag size={20} strokeWidth={1.75} aria-hidden />
      {count > 0 && (
        <span className="tabular absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[11px] font-medium leading-none text-white">
          {count}
        </span>
      )}
    </button>
  );
}
