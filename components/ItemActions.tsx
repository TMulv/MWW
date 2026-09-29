"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import QtyStepper from "./QtyStepper";

export default function ItemActions({ id, name, custom }: { id: string; name: string; custom?: boolean }) {
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => { e.preventDefault(); add(id, qty, note); setQty(1); setNote(""); openCart(); }}
    >
      {custom && (
        <div>
          <label htmlFor="note" className="mb-1.5 block text-[14px] font-medium">
            Personalization <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Names, dates, colors or wording, spelled exactly"
            className="h-12 w-full border border-[#cfcbc4] bg-white px-3.5 outline-none transition-colors placeholder:text-[#8a8782] hover:border-ink focus:border-ink focus:ring-1 focus:ring-ink" />
        </div>
      )}
      <div className="flex gap-3">
        <QtyStepper value={qty} onChange={setQty} label={name} size="lg" />
        <button type="submit"
          className="h-13 flex-1 bg-ink py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a]">
          Add to cart
        </button>
      </div>
    </form>
  );
}
