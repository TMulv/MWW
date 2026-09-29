"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { CONTACT_EMAIL, ITEMS, WEB3FORMS_KEY } from "@/lib/catalog";
import { useCart, type Line } from "@/lib/cart";

function isoDate(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const field =
  "h-12 w-full border border-[#cfcbc4] bg-white px-3.5 outline-none transition-colors placeholder:text-[#8a8782] hover:border-ink focus:border-ink focus:ring-1 focus:ring-ink";
const label = "mb-1.5 block text-[14px] font-medium";
const opt = <span className="font-normal text-muted"> (optional)</span>;

export default function RequestModal() {
  const { mode, close, cart, update, remove, clear } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const [single, setSingle] = useState<Line | null>(null);
  const [needBy, setNeedBy] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Open/close the native dialog (handles focus trap + Esc) and lock page scroll.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (mode && !d.open) {
      setStatus("idle");
      setSingle(mode.kind === "single" ? { id: mode.id, qty: 1, note: "" } : null);
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!mode && d.open) {
      d.close();
    }
    if (!mode) document.documentElement.style.overflow = "";
  }, [mode]);

  const isCart = mode?.kind === "cart";
  const isCustom = mode?.kind === "custom";
  const lines: Line[] = isCart ? cart : single ? [single] : [];
  const setLine = (id: string, patch: Partial<Line>) =>
    isCart ? update(id, patch) : setSingle((l) => (l ? { ...l, ...patch } : l));

  const rows = lines
    .map((l) => ({ line: l, item: ITEMS.find((i) => i.id === l.id) }))
    .filter((r): r is { line: Line; item: (typeof ITEMS)[number] } => !!r.item);
  const total = rows.reduce((s, r) => s + r.item.price * r.line.qty, 0);

  const today = isoDate(new Date());
  const daysOut = needBy ? Math.round((new Date(needBy).getTime() - new Date(today).getTime()) / 86400000) : null;
  const rushed = daysOut !== null && daysOut < 14;

  const title = isCart ? "Your cart" : isCustom ? "Request a build" : "Request this piece";
  const emptyCart = isCart && rows.length === 0;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("botcheck")) return;
    const v = (k: string) => String(fd.get(k) ?? "").trim();

    const pieces = rows.length
      ? rows.map((r, n) =>
          `${n + 1}. ${r.item.name} x${r.line.qty} (from $${r.item.price} each)` +
          (r.line.note.trim() ? `\n   Personalization: ${r.line.note.trim()}` : "")).join("\n")
      : "Something custom (see details)";
    const lines = [
      `Name: ${v("name")}`,
      `Email: ${v("email")}`,
      `Phone: ${v("phone") || "n/a"}`,
      `Needed by: ${v("need_by")}${rushed ? "  (under 2 weeks out)" : ""}`,
      `Pickup / delivery: ${v("delivery")}`,
      `Budget: ${v("budget") || "not given"}`,
      "",
      "Pieces:",
      pieces,
      ...(rows.length ? ["", `Starting total: $${total}`] : []),
      "",
      "Details:",
      v("details") || "(none)",
    ];
    const what = rows.length === 1 ? rows[0].item.name : rows.length ? `${rows.length} pieces` : "custom piece";
    const subject = `Build request: ${what} for ${v("name")} (by ${v("need_by")})`;

    const done = () => { setStatus("sent"); if (isCart) clear(); };

    if (!WEB3FORMS_KEY) {
      window.location.assign(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`);
      done();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject,
          from_name: "Mulvey's Woodworking website",
          replyto: v("email"),
          name: v("name"),
          email: v("email"),
          phone: v("phone"),
          needed_by: v("need_by"),
          delivery: v("delivery"),
          pieces,
          starting_total: rows.length ? `$${total}` : "",
          budget: v("budget"),
          details: v("details"),
        }),
      });
      const json = await res.json();
      if (json.success) done(); else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      aria-labelledby="req-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-[40rem] bg-white p-0 text-ink backdrop:bg-black/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-8">
          <h2 id="req-title" className="text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
          <button type="button" onClick={close} aria-label="Close" className="grid h-10 w-10 place-items-center hover:bg-frame">
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {status === "sent" ? (
            <div role="status" className="py-10">
              <p className="text-[28px] font-bold tracking-[-0.02em]">Thanks!</p>
              <p className="mt-3 max-w-md leading-relaxed text-muted">
                {WEB3FORMS_KEY
                  ? "I got your request. I'll email you to confirm the details, price and timing. Check your spam folder if you don't see it."
                  : "Your email app should have opened with the request filled in. Send it from there and I'll email you back to confirm the details, price and timing."}
              </p>
              <button type="button" onClick={close} className="mt-8 h-12 bg-ink px-8 text-[15px] font-medium text-white hover:bg-[#3a3a3a]">
                Back to the site
              </button>
            </div>
          ) : emptyCart ? (
            <div className="py-10">
              <p className="text-[17px]">Your cart is empty.</p>
              <p className="mt-2 text-muted">Add a few pieces, then send them all as one request.</p>
              <Link href="/#work" onClick={close} className="mt-6 inline-block text-[15px] underline">Browse the work</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

              <p className="bg-frame px-4 py-3 text-[14px] leading-relaxed sm:col-span-2">
                Nothing is charged here. After you send this, I&rsquo;ll email you to confirm the
                details, price and timing.
              </p>

              {rows.length > 0 && (
                <ul className="divide-y divide-line border-y border-line sm:col-span-2">
                  {rows.map(({ line, item }) => (
                    <li key={line.id} className="grid grid-cols-[4.5rem_1fr] gap-4 py-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.photos[0].thumb} alt="" className="aspect-[4/5] w-full bg-frame object-cover" />
                      <div className="min-w-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="font-medium leading-snug">{item.name}</p>
                          <p className="tabular shrink-0 text-[15px] text-muted">From ${item.price}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="inline-flex items-center border border-[#cfcbc4]">
                            <button type="button" aria-label={`Fewer ${item.name}`} disabled={line.qty <= 1}
                              onClick={() => setLine(line.id, { qty: line.qty - 1 })}
                              className="grid h-9 w-9 place-items-center hover:bg-frame disabled:opacity-30">
                              <Minus size={15} strokeWidth={1.75} aria-hidden />
                            </button>
                            <span className="tabular w-8 text-center text-[15px]" aria-label="Quantity">{line.qty}</span>
                            <button type="button" aria-label={`More ${item.name}`}
                              onClick={() => setLine(line.id, { qty: line.qty + 1 })}
                              className="grid h-9 w-9 place-items-center hover:bg-frame">
                              <Plus size={15} strokeWidth={1.75} aria-hidden />
                            </button>
                          </div>
                          {isCart && (
                            <button type="button" onClick={() => remove(line.id)} className="text-[14px] text-muted underline hover:text-ink">
                              Remove
                            </button>
                          )}
                        </div>
                        <label className="sr-only" htmlFor={`note-${line.id}`}>Personalization for {item.name}</label>
                        <input id={`note-${line.id}`} value={line.note}
                          onChange={(e) => setLine(line.id, { note: e.target.value })}
                          placeholder="Names, dates or colors (optional)"
                          className={`${field} mt-3 h-10 text-[14px]`} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {rows.length > 1 && (
                <p className="tabular -mt-2 flex justify-between text-[15px] sm:col-span-2">
                  <span className="text-muted">Starting total</span><span>${total}</span>
                </p>
              )}

              <div>
                <label className={label} htmlFor="r-name">Your name</label>
                <input id="r-name" name="name" required className={field} autoComplete="name" />
              </div>
              <div>
                <label className={label} htmlFor="r-email">Email</label>
                <input id="r-email" name="email" type="email" required className={field} autoComplete="email" />
              </div>
              <div>
                <label className={label} htmlFor="r-need">Date needed by</label>
                <input id="r-need" name="need_by" type="date" required min={today}
                  value={needBy} onChange={(e) => setNeedBy(e.target.value)} className={field} />
              </div>
              <div>
                <label className={label} htmlFor="r-phone">Phone{opt}</label>
                <input id="r-phone" name="phone" type="tel" className={field} autoComplete="tel" />
              </div>
              {rushed && (
                <p className="-mt-2 text-[14px] text-[#9a3b2f] sm:col-span-2">
                  That&rsquo;s less than two weeks away. Send it anyway and I&rsquo;ll tell you if I can make it.
                </p>
              )}
              <div className="sm:col-span-2">
                <label className={label} htmlFor="r-delivery">Pickup or delivery</label>
                <select id="r-delivery" name="delivery" className={field} defaultValue="Not sure yet">
                  <option>Not sure yet</option>
                  <option>Local pickup</option>
                  <option>Local delivery</option>
                  <option>Shipping (ask for a quote)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={label} htmlFor="r-details">
                  {isCustom ? "What would you like?" : <>Anything else{opt}</>}
                </label>
                <textarea id="r-details" name="details" rows={4} required={isCustom}
                  className={`${field} h-auto py-3`}
                  placeholder={isCustom
                    ? "Describe the piece: size, wood, colors, the occasion, a link to a photo"
                    : "Size, the occasion, your pet's breed, a link to a photo"} />
              </div>
              {isCustom && (
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="r-budget">Budget{opt}</label>
                  <input id="r-budget" name="budget" className={`${field} sm:max-w-[calc(50%-0.625rem)]`} placeholder="Around $50" />
                </div>
              )}

              <div className="flex flex-col gap-3 pb-2 sm:col-span-2">
                <button type="submit" disabled={status === "sending"}
                  className="h-13 w-full bg-ink px-6 py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a] disabled:cursor-wait disabled:opacity-60">
                  {status === "sending" ? "Sending…" : isCart ? "Submit cart" : "Send request"}
                </button>
                {status === "error" && (
                  <p role="alert" className="text-[14px] text-[#9a3b2f]">
                    That didn&rsquo;t send. Try again, or email {CONTACT_EMAIL} directly.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
