"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, CONTACT_EMAIL, ITEMS, WEB3FORMS_KEY } from "@/lib/catalog";

const CUSTOM = "Something custom (describe below)";

function isoDate(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export default function RequestForm() {
  const pieceId = useSearchParams().get("piece");
  const preset = ITEMS.find((i) => i.id === pieceId)?.name ?? CUSTOM;
  const [picked, setItem] = useState<string | null>(null);
  const item = picked ?? preset;
  const [needBy, setNeedBy] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const today = isoDate(new Date());
  const daysOut = needBy ? Math.round((new Date(needBy).getTime() - new Date(today).getTime()) / 86400000) : null;
  const rushed = daysOut !== null && daysOut < 14;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("botcheck")) return;
    const v = (k: string) => String(fd.get(k) ?? "").trim();

    const lines = [
      `Name: ${v("name")}`,
      `Email: ${v("email")}`,
      `Phone: ${v("phone") || "n/a"}`,
      `Piece: ${v("item")}`,
      `Quantity: ${v("quantity")}`,
      `Needed by: ${v("need_by")}${rushed ? "  (under 2 weeks out)" : ""}`,
      `Pickup / delivery: ${v("delivery")}`,
      `Personalization: ${v("personalization") || "none"}`,
      `Budget: ${v("budget") || "not given"}`,
      "",
      "Details:",
      v("details") || "(none)",
    ];
    const subject = `Build request: ${v("item")} for ${v("name")} (by ${v("need_by")})`;

    if (!WEB3FORMS_KEY) {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      setStatus("sent");
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
          piece: v("item"),
          quantity: v("quantity"),
          needed_by: v("need_by"),
          delivery: v("delivery"),
          personalization: v("personalization"),
          budget: v("budget"),
          details: v("details"),
        }),
      });
      const json = await res.json();
      setStatus(json.success ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "h-12 w-full border border-[#cfcbc4] bg-white px-3.5 outline-none transition-colors placeholder:text-[#8a8782] hover:border-ink focus:border-ink focus:ring-1 focus:ring-ink";
  const label = "mb-1.5 block text-[14px] font-medium";
  const opt = <span className="font-normal text-muted"> (optional)</span>;

  return (
    <section id="request" className="border-t border-line bg-frame">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
            Request a build
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed">
            Tell me what you want and when you need it. This is only a request, and nothing is
            charged here. I&rsquo;ll email you to confirm the details, the price and whether I can
            make your date.
          </p>
          <p className="mt-6 text-[15px] text-muted">
            Rather just email?{" "}
            <a className="text-ink underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>

        {status === "sent" ? (
          <div role="status" className="reveal self-start border border-line bg-white p-8 sm:p-10">
            <p className="text-[28px] font-bold tracking-[-0.02em]">Thanks!</p>
            <p className="mt-3 max-w-lg leading-relaxed text-muted">
              {WEB3FORMS_KEY
                ? "I got your request. I'll reply by email, so check your spam folder if you don't see it."
                : "Your email app should have opened with the request filled in. Send it from there and I'll reply."}
            </p>
            <button onClick={() => setStatus("idle")} className="mt-6 text-[15px] underline">
              Send another request
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
            <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="sm:col-span-2">
              <label className={label} htmlFor="item">What would you like?</label>
              <select id="item" name="item" required value={item} onChange={(e) => setItem(e.target.value)} className={field}>
                <option>{CUSTOM}</option>
                {CATEGORIES.map((c) => (
                  <optgroup key={c.id} label={c.label}>
                    {ITEMS.filter((i) => i.category === c.id).map((i) => (
                      <option key={i.id} value={i.name}>{i.name}, from ${i.price}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className={label} htmlFor="name">Your name</label>
              <input id="name" name="name" required className={field} autoComplete="name" />
            </div>
            <div>
              <label className={label} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className={field} autoComplete="email" />
            </div>
            <div>
              <label className={label} htmlFor="need_by">Date needed by</label>
              <input id="need_by" name="need_by" type="date" required min={today}
                value={needBy} onChange={(e) => setNeedBy(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="phone">Phone{opt}</label>
              <input id="phone" name="phone" type="tel" className={field} autoComplete="tel" />
            </div>
            {rushed && (
              <p className="-mt-2 text-[14px] text-[#9a3b2f] sm:col-span-2">
                That&rsquo;s less than two weeks away. Send it anyway and I&rsquo;ll tell you if I can make it.
              </p>
            )}
            <div>
              <label className={label} htmlFor="quantity">Quantity</label>
              <input id="quantity" name="quantity" type="number" min={1} defaultValue={1} className={`${field} tabular`} />
            </div>
            <div>
              <label className={label} htmlFor="delivery">Pickup or delivery</label>
              <select id="delivery" name="delivery" className={field} defaultValue="Not sure yet">
                <option>Not sure yet</option>
                <option>Local pickup</option>
                <option>Local delivery</option>
                <option>Shipping (ask for a quote)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="personalization">Personalization{opt}</label>
              <input id="personalization" name="personalization" className={field}
                placeholder="Names, dates, colors or wording, spelled exactly how you want it" />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="details">Anything else{opt}</label>
              <textarea id="details" name="details" rows={4} className={`${field} h-auto py-3`}
                placeholder="Size, the occasion, your pet's breed, a link to a photo" />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="budget">Budget{opt}</label>
              <input id="budget" name="budget" className={`${field} sm:max-w-[calc(50%-0.625rem)]`} placeholder="Around $50" />
            </div>

            <div className="flex flex-col gap-3 sm:col-span-2">
              <button type="submit" disabled={status === "sending"}
                className="h-13 w-full bg-ink px-6 py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a] disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:self-start sm:px-10">
                {status === "sending" ? "Sending…" : "Send request"}
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
    </section>
  );
}
