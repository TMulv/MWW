"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { ITEMS } from "@/lib/catalog";
import QtyStepper from "./QtyStepper";

export default function ItemActions({ id, name, custom }: { id: string; name: string; custom?: boolean }) {
  const { add, openCart } = useCart();
  const item = ITEMS.find((i) => i.id === id);
  const [variant, setVariant] = useState(item?.variants?.[0]?.id ?? "");
  const engraved = id === "turkeys" && variant === "engraved";
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => { e.preventDefault(); add(id, qty, note, variant); setQty(1); setNote(""); openCart(); }}
    >
      {item?.variants && (
        <div>
          <label htmlFor="variant" className="mb-1.5 block text-[14px] font-medium">{id === "angels" ? "Size" : "Finish"}</label>
          <select id="variant" value={variant} onChange={(e) => { setVariant(e.target.value); setNote(""); }} className="h-12 w-full border border-[#cfcbc4] bg-white px-3.5">
            {item.variants.map((v) => <option key={v.id} value={v.id}>{v.label} — ${v.price} each</option>)}
          </select>
        </div>
      )}
      {custom && (id !== "turkeys" || engraved) && (
        <div>
          <label htmlFor="note" className="mb-1.5 block text-[14px] font-medium">
            {engraved ? "Name to laser engrave" : "Personalization"} <span className="font-normal text-muted">{engraved ? "(required)" : "(optional)"}</span>
          </label>
          <input required={engraved} id="note" value={note} onChange={(e) => setNote(e.target.value)}
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
