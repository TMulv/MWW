import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CATEGORIES, ITEMS } from "@/lib/catalog";
import Gallery from "@/components/Gallery";
import ItemCard from "@/components/ItemCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return ITEMS.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = ITEMS.find((i) => i.id === id);
  return item ? { title: item.name, description: item.description } : {};
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = ITEMS.find((i) => i.id === id);
  if (!item) notFound();
  const cat = CATEGORIES.find((c) => c.id === item.category)!;
  const more = ITEMS.filter((i) => i.category === item.category && i.id !== item.id).slice(0, 4);

  return (
    <main className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <nav className="flex items-center gap-2 py-5 text-[14px] text-muted">
        <Link href="/#work" className="inline-flex items-center gap-1.5 hover:text-ink hover:underline">
          <ArrowLeft size={15} strokeWidth={1.75} aria-hidden /> The work
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/?c=${cat.id}#work`} className="hover:text-ink hover:underline">{cat.label}</Link>
      </nav>

      <div className="grid gap-8 pb-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <Gallery name={item.name} photos={item.photos} model={item.model} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.02] tracking-[-0.03em] text-balance">
            {item.name}
          </h1>
          <p className="tabular mt-3 text-[20px]">From ${item.price}</p>

          <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed">{item.description}</p>

          <Link
            href={`/?piece=${item.id}#request`}
            className="mt-8 flex h-13 w-full items-center justify-center bg-ink py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a3a]"
          >
            Request this piece
          </Link>

          <dl className="mt-8 border-t border-line text-[15px]">
            <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-4">
              <dt className="font-medium">Made to order</dt>
              <dd className="text-muted">I make it after we agree on the details. Nothing is charged online.</dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-4">
              <dt className="font-medium">Price</dt>
              <dd className="text-muted">The final price depends on size, wood and finish. I&rsquo;ll confirm it by email.</dd>
            </div>
            {item.custom && (
              <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-line py-4">
                <dt className="font-medium">Personalize it</dt>
                <dd className="text-muted">Names, dates, colors or wording. Add them to your request.</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {more.length > 0 && (
        <section className="border-t border-line pb-24 pt-14">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-[clamp(1.6rem,2.6vw,2.25rem)] font-bold tracking-[-0.025em]">More {cat.label.toLowerCase()}</h2>
            <Link href={`/?c=${cat.id}#work`} className="text-[15px] underline">See all</Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4">
            {more.map((m) => (
              <li key={m.id}><ItemCard item={m} /></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
