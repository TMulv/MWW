import Link from "next/link";
import { CATEGORIES, type CatalogItem } from "@/lib/catalog";

export default function ItemCard({ item, priority = false }: { item: CatalogItem; priority?: boolean }) {
  const cat = CATEGORIES.find((c) => c.id === item.category)!;
  const [a, b] = item.photos;
  return (
    <Link href={`/work/${item.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={a.thumb}
          alt={item.name}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
        {b && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={b.thumb}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {item.model && (
          <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[12px] font-medium">3D</span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-medium leading-snug group-hover:underline">{item.name}</h3>
        <p className="tabular shrink-0 text-[15px]">From ${item.price}</p>
      </div>
      <p className="mt-1 flex items-center gap-2 text-[13px] text-muted">
        <span className="h-2 w-2 rounded-full" style={{ background: cat.dot }} aria-hidden />
        {cat.label}
      </p>
    </Link>
  );
}
