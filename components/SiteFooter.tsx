import Image from "next/image";
import Link from "next/link";
import { Download, Mail } from "lucide-react";
import InstagramIcon from "./InstagramIcon";
import { CATALOG_LABEL, CATALOG_PDF, CATEGORIES, CONTACT_EMAIL, INSTAGRAM, INSTAGRAM_HANDLE } from "@/lib/catalog";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-8 md:grid-cols-[auto_1fr_1fr]">
        <Image src="/brand/logo.png" alt="Mulvey's Woodworking logo" width={220} height={189} className="h-auto w-[180px]" />
        <div>
          <p className="text-[13px] font-medium text-muted">The work</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/?c=${c.id}#work`} className="hover:underline">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[13px] font-medium text-muted">Say hi</p>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 hover:underline">
                <Mail size={16} strokeWidth={1.75} aria-hidden /> {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a href={INSTAGRAM} className="inline-flex items-center gap-2 hover:underline">
                <InstagramIcon /> {INSTAGRAM_HANDLE}
              </a>
            </li>
            <li>
              <a href={CATALOG_PDF} download className="inline-flex items-center gap-2 hover:underline">
                <Download size={16} strokeWidth={1.75} aria-hidden /> {CATALOG_LABEL} (PDF)
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-[1440px] border-t border-line px-4 py-6 text-[13px] text-muted sm:px-8">
        Handmade in small batches in Northern NJ.
      </p>
    </footer>
  );
}
