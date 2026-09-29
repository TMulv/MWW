"use client";

import { useState } from "react";
import Link from "next/link";
import { CONTACT_EMAIL, ITEMS, ORDER_ENDPOINT, WEB3FORMS_KEY } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

function isoDate(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const field =
  "h-12 w-full border border-[#cfcbc4] bg-white px-3.5 outline-none transition-colors placeholder:text-[#8a8782] hover:border-ink focus:border-ink focus:ring-1 focus:ring-ink";
const label = "mb-1.5 block text-[14px] font-medium";
const opt = <span className="font-normal text-muted"> (optional)</span>;

export default function Checkout() {
  const { cart, total, clear } = useCart();
  const [needBy, setNeedBy] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "manual">("idle");
  const [fallback, setFallback] = useState({ subject: "", body: "" });
  const [copied, setCopied] = useState(false);

  const rows = cart.flatMap((line) => {
    const item = ITEMS.find((i) => i.id === line.id);
    return item ? [{ line, item }] : [];
  });
  const custom = rows.length === 0;

  const today = isoDate(new Date());
  const daysOut = needBy ? Math.round((new Date(needBy).getTime() - new Date(today).getTime()) / 86400000) : null;
  const rushed = daysOut !== null && daysOut < 14;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("botcheck")) return;
    const v = (k: string) => String(fd.get(k) ?? "").trim();

    const order = {
      name: v("name"), email: v("email"), phone: v("phone"),
      needed_by: v("need_by"), rushed, delivery: v("delivery"),
      details: v("details"), budget: v("budget"),
      items: rows.map(({ line, item }) => ({ id: item.id, name: item.name, qty: line.qty, from_price: item.price, personalization: line.note })),
      starting_total: total,
    };
    const pieces = custom
      ? "Something custom (see details)"
      : order.items.map((i, n) => `${n + 1}. ${i.name} x${i.qty} (from $${i.from_price} each)${i.personalization ? `\n   Personalization: ${i.personalization}` : ""}`).join("\n");
    const body = [
      `Name: ${order.name}`, `Email: ${order.email}`, `Phone: ${order.phone || "n/a"}`,
      `Needed by: ${order.needed_by}${rushed ? "  (under 2 weeks out)" : ""}`,
      `Pickup / delivery: ${order.delivery}`, `Budget: ${order.budget || "not given"}`,
      "", "Pieces:", pieces, ...(custom ? [] : ["", `Starting total: $${total}`]),
      "", "Details:", order.details || "(none)",
    ].join("\n");
    const what = custom ? "custom piece" : rows.length === 1 ? rows[0].item.name : `${rows.length} pieces`;
    const subject = `Order request: ${what} for ${order.name} (by ${order.needed_by})`;

    const done = () => { setStatus("sent"); clear(); window.scrollTo({ top: 0 }); };
    // If the order can't be filed automatically, never pretend it went through:
    // show the full request so the customer can copy it and email it.
    const manual = () => { setFallback({ subject, body }); setStatus("manual"); window.scrollTo({ top: 0 }); };

    if (!ORDER_ENDPOINT && !WEB3FORMS_KEY) { manual(); return; }

    setStatus("sending");
    try {
      const sends: Promise<boolean>[] = [];
      if (ORDER_ENDPOINT) {
        sends.push(fetch(ORDER_ENDPOINT, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order),
        }).then((r) => r.ok).catch(() => false));
      }
      if (WEB3FORMS_KEY) {
        sends.push(fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY, subject, from_name: "Mulvey's Woodworking website",
            replyto: order.email, message: body,
          }),
        }).then((r) => r.json()).then((j) => !!j.success).catch(() => false));
      }
      const results = await Promise.all(sends);
      if (results.some(Boolean)) done(); else manual();
    } catch {
      manual();
    }
  }

  if (status === "manual") {
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(fallback.subject)}&body=${encodeURIComponent(fallback.body)}`;
    return (
      <main className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
        <div role="alert" className="max-w-2xl">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-[-0.03em]">One more step</h1>
          <p className="mt-5 text-[17px] leading-relaxed">
            Your request didn&rsquo;t go through automatically. Copy it below and email it to{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, and I&rsquo;ll
            email you back to confirm the details, final price and timing.
          </p>
          <textarea readOnly value={fallback.body} rows={12} aria-label="Your request"
            className="mt-6 w-full border border-[#cfcbc4] bg-frame p-4 font-mono text-[13px] leading-relaxed" />
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button type="button"
              onClick={() => { navigator.clipboard?.writeText(`${fallback.subject}\n\n${fallback.body}`).then(() => setCopied(true)).catch(() => {}); }}
              className="h-12 bg-ink px-8 text-[15px] font-medium text-white hover:bg-[#3a3a3a]">
              {copied ? "Copied" : "Copy my request"}
            </button>
            <a href={mailto} className="text-[15px] underline">Open in my email app</a>
            <button type="button" onClick={() => setStatus("idle")} className="text-[15px] text-muted underline">Back to checkout</button>
          </div>
        </div>
      </main>
    );
  }

  if (status === "sent") {
    return (
      <main className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8">
        <div role="status" className="max-w-xl">
          <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">Thanks, request sent!</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">
            I&rsquo;ll email you to confirm the details, final price and timing. Check your spam folder
            if you don&rsquo;t see it in a day or two.
          </p>
          <Link href="/#work" className="mt-8 inline-flex h-12 items-center bg-ink px-8 text-[15px] font-medium text-white hover:bg-[#3a3a3a]">
            Back to the work
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-8">
      <h1 className="pb-8 pt-10 text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1] tracking-[-0.03em]">
        {custom ? "Request a custom build" : "Checkout"}
      </h1>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <form id="checkout" onSubmit={submit} className="grid content-start gap-x-5 gap-y-6 sm:grid-cols-2">
          <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

          <h2 className="text-[18px] font-bold sm:col-span-2">Your details</h2>
          <div>
            <label className={label} htmlFor="c-name">Name</label>
            <input id="c-name" name="name" required className={field} autoComplete="name" />
          </div>
          <div>
            <label className={label} htmlFor="c-email">Email</label>
            <input id="c-email" name="email" type="email" required className={field} autoComplete="email" />
          </div>
          <div>
            <label className={label} htmlFor="c-phone">Phone{opt}</label>
            <input id="c-phone" name="phone" type="tel" className={field} autoComplete="tel" />
          </div>
          <div>
            <label className={label} htmlFor="c-need">Date needed by</label>
            <input id="c-need" name="need_by" type="date" required min={today}
              value={needBy} onChange={(e) => setNeedBy(e.target.value)} className={field} />
          </div>
          {rushed && (
            <p className="-mt-2 text-[14px] text-[#9a3b2f] sm:col-span-2">
              That&rsquo;s less than two weeks away. Send it anyway and I&rsquo;ll tell you if I can make it.
            </p>
          )}

          <h2 className="mt-4 text-[18px] font-bold sm:col-span-2">Pickup or delivery</h2>
          <div className="sm:col-span-2">
            <label className="sr-only" htmlFor="c-delivery">Pickup or delivery</label>
            <select id="c-delivery" name="delivery" className={field} defaultValue="Not sure yet">
              <option>Not sure yet</option>
              <option>Local pickup</option>
              <option>Local delivery</option>
              <option>Shipping (ask for a quote)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={label} htmlFor="c-details">
              {custom ? "What would you like?" : <>Notes for me{opt}</>}
            </label>
            <textarea id="c-details" name="details" rows={4} required={custom} className={`${field} h-auto py-3`}
              placeholder={custom
                ? "Describe the piece: size, wood, colors, the occasion, a link to a photo"
                : "The occasion, size, your pet's breed, a link to a photo"} />
          </div>
          {custom && (
            <div className="sm:col-span-2">
              <label className={label} htmlFor="c-budget">Budget{opt}</label>
              <input id="c-budget" name="budget" className={`${field} sm:max-w-[calc(50%-0.625rem)]`} placeholder="Around $50" />
            </div>
          )}
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-frame p-5 sm:p-7">
            <h2 className="text-[18px] font-bold">{custom ? "Your request" : "Order summary"}</h2>
            {custom ? (
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Your cart is empty, so this goes out as a custom request.{" "}
                <Link href="/#work" className="text-ink underline">Browse the work</Link> to add pieces instead.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {rows.map(({ line, item }) => (
                  <li key={line.key} className="grid grid-cols-[3.5rem_1fr_auto] gap-3 py-3">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.photos[0].thumb} alt="" className="aspect-[4/5] w-full bg-white object-cover" />
                      <span className="tabular absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-medium text-white">{line.qty}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium leading-snug">{item.name}</p>
                      {line.note && <p className="mt-0.5 text-[13px] text-muted">&ldquo;{line.note}&rdquo;</p>}
                    </div>
                    <p className="tabular text-[15px]">${item.price * line.qty}</p>
                  </li>
                ))}
              </ul>
            )}
            {!custom && (
              <p className="tabular mt-3 flex justify-between border-t border-line pt-4 text-[17px] font-medium">
                <span>Starting total</span><span>${total}</span>
              </p>
            )}
            <p className="mt-4 text-[13px] leading-relaxed text-muted">
              Nothing is charged online. After you submit, I&rsquo;ll email you to confirm the
              details, final price and timing. Prices are starting points and depend on size, wood and finish.
            </p>
            <button type="submit" form="checkout" disabled={status === "sending"}
              className="mt-5 h-13 w-full bg-ink text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a] disabled:cursor-wait disabled:opacity-60">
              {status === "sending" ? "Sending…" : "Submit request"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
