"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function ItemActions({ id }: { id: string }) {
  const { add, open, count } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => open({ kind: "single", id })}
          className="h-13 bg-ink py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a]"
        >
          Request this piece
        </button>
        <button
          type="button"
          onClick={() => { add(id); setAdded(true); }}
          className="inline-flex h-13 items-center justify-center gap-2 border border-ink py-4 text-[16px] font-medium transition-colors hover:bg-frame"
        >
          {added ? <><Check size={18} strokeWidth={2} aria-hidden /> Added to cart</> : "Add to cart"}
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-[1.5em] text-[14px] text-muted">
        {added && (
          <>
            Want more than one piece? Keep browsing, then{" "}
            <button type="button" onClick={() => open({ kind: "cart" })} className="text-ink underline">
              view your cart ({count})
            </button>
            .
          </>
        )}
      </p>
    </div>
  );
}
