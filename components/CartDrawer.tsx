"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ITEMS } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import QtyStepper from "./QtyStepper";

export default function CartDrawer() {
  const { cart, total, setQty, remove, drawer, closeCart } = useCart();
  const ref = useRef<HTMLDialogElement>(null);

  // Native dialog gives us the focus trap and Esc to close; lock page scroll while open.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (drawer && !d.open) d.showModal();
    if (!drawer && d.open) d.close();
    document.documentElement.style.overflow = drawer ? "hidden" : "";
  }, [drawer]);

  const rows = cart.flatMap((line) => {
    const item = ITEMS.find((i) => i.id === line.id);
    return item ? [{ line, item }] : [];
  });

  return (
    <dialog
      ref={ref}
      onClose={closeCart}
      onClick={(e) => { if (e.target === e.currentTarget) closeCart(); }}
      aria-labelledby="cart-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-[28rem] bg-white p-0 text-ink backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 id="cart-title" className="text-[20px] font-bold tracking-[-0.02em]">Your cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart" className="grid h-10 w-10 place-items-center hover:bg-frame">
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="flex-1 px-5 py-10 sm:px-6">
            <p className="text-[17px]">Your cart is empty.</p>
            <Link href="/#work" onClick={closeCart} className="mt-4 inline-block text-[15px] underline">Browse the work</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5 sm:px-6">
              {rows.map(({ line, item }) => (
                <li key={line.key} className="grid grid-cols-[5rem_1fr] gap-4 py-5">
                  <Link href={`/work/${item.id}`} onClick={closeCart}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.photos[0].thumb} alt="" className="aspect-[4/5] w-full bg-frame object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link href={`/work/${item.id}`} onClick={closeCart} className="font-medium leading-snug hover:underline">{item.name}</Link>
                      <p className="tabular shrink-0 text-[15px]">${item.price * line.qty}</p>
                    </div>
                    <p className="tabular mt-0.5 text-[13px] text-muted">From ${item.price} each</p>
                    {line.note && <p className="mt-1.5 text-[14px] text-muted">&ldquo;{line.note}&rdquo;</p>}
                    <div className="mt-3 flex items-center gap-4">
                      <QtyStepper value={line.qty} onChange={(n) => setQty(line.key, n)} label={item.name} />
                      <button type="button" onClick={() => remove(line.key)} className="text-[14px] text-muted underline hover:text-ink">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-5 sm:px-6">
              <p className="tabular flex justify-between text-[17px] font-medium">
                <span>Starting total</span><span>${total}</span>
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Nothing is charged online. After you check out, I&rsquo;ll email you to confirm the
                details, final price and timing.
              </p>
              <Link href="/checkout" onClick={closeCart}
                className="mt-4 flex h-13 items-center justify-center bg-ink text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a]">
                Checkout
              </Link>
              <button type="button" onClick={closeCart} className="mt-3 w-full text-center text-[15px] underline">
                Keep browsing
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
