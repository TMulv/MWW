"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CATEGORIES, ITEMS, type CategoryId } from "@/lib/catalog";
import ItemCard from "./ItemCard";

export default function WorkGrid() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("c");
  const cat = CATEGORIES.some((c) => c.id === raw) ? (raw as CategoryId) : null;
  const [sort, setSort] = useState("featured");
  const filtered = cat ? ITEMS.filter((i) => i.category === cat) : ITEMS;
  const shown =
    sort === "featured"
      ? filtered
      : [...filtered].sort((a, b) =>
          sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : a.name.localeCompare(b.name),
        );
  const current = CATEGORIES.find((c) => c.id === cat);

  const pick = (id: CategoryId | null) =>
    router.replace(id ? `/?c=${id}#work` : "/#work", { scroll: false });

  return (
    <section id="work" className="mx-auto max-w-[1440px] px-4 pb-24 pt-20 sm:px-8 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
        <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold leading-none tracking-[-0.03em]">
          {current ? current.label : "The work"}
        </h2>
        <p className="max-w-md text-[15px] text-muted">
          {current
            ? current.blurb
            : "Some of what I've made. I can make any of these again or change them for you."}
        </p>
      </div>

      <div className="sticky top-[6.5rem] z-30 -mx-4 mt-8 border-y border-line bg-white px-4 sm:-mx-8 sm:px-8 md:top-16">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div role="tablist" aria-label="Categories" className="flex w-max gap-1 py-2">
              {[{ id: null, label: "Everything", dot: "#141414" }, ...CATEGORIES].map((c) => {
                const active = cat === c.id;
                return (
                  <button
                    key={c.label}
                    role="tab"
                    aria-selected={active}
                    onClick={() => pick(c.id as CategoryId | null)}
                    className={`flex h-10 items-center gap-2 whitespace-nowrap px-3 text-[15px] transition-colors ${
                      active ? "bg-ink text-white" : "hover:bg-frame"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-white/40"
                      style={{ background: c.dot }}
                      aria-hidden
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[13px] text-muted">
            <span className="tabular hidden xl:inline">{shown.length} pieces</span>
            <label className="flex items-center gap-2">
                            <select
                aria-label="Sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 border border-line bg-white px-2 text-[14px] text-ink"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((item, i) => (
          <li key={item.id}>
            <ItemCard item={item} priority={i < 4} />
          </li>
        ))}
      </ul>
    </section>
  );
}
