import Image from "next/image";
import Link from "next/link";
import { INSTAGRAM } from "@/lib/catalog";
import InstagramIcon from "./InstagramIcon";

const NAV = [
  { href: "/#work", label: "The work" },
  { href: "/#how", label: "How it works" },
  { href: "/#about", label: "About" },
];

export default function SiteHeader() {
  return (
    <>
      <p className="bg-ink px-4 py-2 text-center text-[13px] text-white">
        Everything is made to order. Send a request and I&rsquo;ll email you back.
      </p>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
          <nav className="hidden items-center gap-7 text-[15px] md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:underline">{n.label}</Link>
            ))}
          </nav>
          <Link
            href="/"
            className="col-start-1 flex items-center gap-2.5 justify-self-start md:col-start-2 md:justify-self-center"
          >
            <Image src="/brand/logo.png" alt="" width={48} height={41} className="h-10 w-auto" priority />
            <span className="whitespace-nowrap text-[15px] font-bold uppercase tracking-[-0.01em] sm:text-[18px]">
              Mulvey&rsquo;s Woodworking
            </span>
          </Link>
          <div className="col-start-3 flex items-center gap-1 justify-self-end sm:gap-3">
            <a href={INSTAGRAM} aria-label="Instagram" className="grid h-10 w-10 place-items-center hover:bg-frame">
              <InstagramIcon size={20} />
            </a>
            <Link
              href="/#request"
              className="hidden h-10 items-center whitespace-nowrap bg-ink px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#3a3a3a] sm:inline-flex"
            >
              Request a build
            </Link>
          </div>
        </div>
        <nav className="flex gap-5 overflow-x-auto border-t border-line px-4 py-2.5 text-[14px] md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap">{n.label}</Link>
          ))}
          <Link href="/#request" className="whitespace-nowrap font-medium underline">Request a build</Link>
        </nav>
      </header>
    </>
  );
}
