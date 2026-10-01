import { Suspense } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import WorkGrid from "@/components/WorkGrid";
import { CATALOG_LABEL, CATALOG_PDF, CONTACT_EMAIL, INSTAGRAM, INSTAGRAM_HANDLE } from "@/lib/catalog";

const STEPS = [
  { t: "Browse", d: "Look through what I've made for ideas." },
  { t: "Request", d: "Add pieces to your cart and check out with your details and date. You don't pay anything yet." },
  { t: "Confirm", d: "I'll email you to go over the details, price and timing. Once you say yes, I start." },
  { t: "Pick up", d: "I'll let you know when it's done. You can pick it up, or we can talk about delivery or shipping." },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-[1440px] items-stretch gap-8 px-4 pt-6 sm:px-8 md:min-h-[calc(100svh-6.5rem)] md:grid-cols-2 md:gap-5 md:pb-6">
        <div className="flex flex-col justify-end pb-2 pt-8 md:pb-10 md:pt-0">
          <h1 className="reveal max-w-[13ch] text-[clamp(3rem,7.4vw,6rem)] font-bold leading-[0.9] tracking-[-0.035em] text-balance">
            Heirloom toys for modern times.
          </h1>
          <p className="mt-7 max-w-[34rem] text-[18px] leading-relaxed text-muted">
            I make wooden toys, puzzles, engraved gifts and kids&rsquo; furniture in my basement
            workshop in Northern NJ. Everything is made to order.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/checkout" className="inline-flex h-12 items-center bg-ink px-7 text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a]">
              Request a build
            </Link>
            <Link href="#work" className="inline-flex items-center gap-2 text-[16px] underline">
              See the work <ArrowDown size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
        <div className="relative grid min-h-[340px] place-items-center overflow-hidden bg-catbg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/cat-working.gif"
            alt="The shop cat, in ear defenders, planing a board at the workbench"
            width={360}
            height={338}
            className="w-[78%] max-w-[560px] [image-rendering:auto]"
          />
        </div>
      </section>

      <Suspense fallback={<div id="work" className="min-h-screen" />}>
        <WorkGrid />
      </Suspense>

      {/* How it works */}
      <section id="how" className="border-t border-line">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
              How ordering works
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
              I make each piece after someone asks for it, so there&rsquo;s no stock to buy from.
            </p>
          </div>
          <ol className="border-t border-ink">
            {STEPS.map((s) => (
              <li key={s.t} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
                <h3 className="text-[20px] font-bold tracking-[-0.01em]">{s.t}</h3>
                <p className="max-w-[60ch] text-[16px] leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto grid max-w-[1440px] gap-5 px-4 pb-20 sm:px-8 md:grid-cols-2 md:pb-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/market-stand.jpg" alt="My booth at a Northern NJ farmers market" loading="lazy" className="aspect-[4/5] w-full bg-frame object-cover" />
        <div className="flex flex-col gap-8 bg-frame p-6 sm:p-10">
          <h2 className="max-w-[14ch] text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
            About the shop
          </h2>
          <div className="max-w-[36rem] space-y-4 text-[17px] leading-relaxed">
            <p>
              I cut, sand, paint and engrave everything myself in my basement workshop.
            </p>
            <p>
              On weekends you can find me at farmers markets around Northern NJ. I post new
              pieces on Instagram.
            </p>
            <p>
              <a href={INSTAGRAM} className="underline">{INSTAGRAM_HANDLE}</a>
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/workshop.jpg" alt="A rocking horse in progress on the workbench" loading="lazy" className="mt-auto aspect-[16/10] w-full object-cover" />
        </div>
      </section>

      <section id="request" className="border-t border-line bg-frame">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-20 sm:px-8 md:flex-row md:items-end md:justify-between md:py-28">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1] tracking-[-0.03em]">
              Request a build
            </h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed">
              Add pieces to your cart and check out, or describe something custom. Nothing is charged here.
              I&rsquo;ll email you to confirm the details, the price and whether I can make your date.
            </p>
            <p className="mt-6 text-[15px] text-muted">
              Rather just email?{" "}
              <a className="text-ink underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
            <p className="mt-2 text-[15px] text-muted">
              Want to browse offline?{" "}
              <a className="text-ink underline" href={CATALOG_PDF} download>Download the {CATALOG_LABEL} (PDF)</a>
            </p>
          </div>
          <Link href="/checkout" className="h-13 shrink-0 bg-ink px-10 py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a]">
            Start a request
          </Link>
        </div>
      </section>
    </main>
  );
}
