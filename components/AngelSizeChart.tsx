import { ITEMS } from "@/lib/catalog";

export default function AngelSizeChart() {
  const all = ITEMS.find((item) => item.id === "angels")!.variants!;
  const sizes = all.filter((v) => v.height);
  const bundle = all.find((v) => !v.height);
  const separately = sizes.reduce((sum, v) => sum + v.price, 0);
  return (
    <section aria-labelledby="angel-sizes" className="mt-8 border-t border-line pt-6">
      <h2 id="angel-sizes" className="text-[20px] font-bold">Angel size guide</h2>
      <p className="mt-2 text-[14px] text-muted">Approximate heights. Compare each size with a 12-inch ruler below.</p>
      <div className="mt-5 flex h-56 items-end justify-around gap-3 border-b border-ink pb-0" role="img" aria-label="Height comparison: small angel 6 inches, medium angel 15 and a half inches, large angel 18 and three quarter inches, ruler 12 inches.">
        {sizes.map((size) => (
          <div key={size.id} className="flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-2 text-[12px] tabular">{size.height === 6 ? '6″' : size.height === 15.5 ? '15½″' : '18¾″'}</span>
            <svg viewBox="0 0 100 150" aria-hidden="true" className="max-w-full text-muted" style={{ height: `${size.height! / 18.75 * 175}px`, width: `${size.height! / 18.75 * 117}px` }}>
              <circle cx="50" cy="17" r="14" fill="currentColor" />
              <path d="M38 39 C10 20 0 43 5 78 L12 110 L30 91 L22 145 Q50 153 78 145 L70 91 L88 110 L95 78 C100 43 90 20 62 39 L70 91 L30 91 Z" fill="currentColor" />
            </svg>
          </div>
        ))}
        <div className="flex h-full flex-1 flex-col items-center justify-end">
          <span className="mb-2 text-[12px]">12″</span>
          <div aria-hidden="true" className="w-7 border border-ink bg-frame" style={{ height: `${12 / 18.75 * 175}px`, backgroundImage: 'repeating-linear-gradient(to top, transparent 0, transparent calc(100% / 12 - 1px), #5f5d59 calc(100% / 12 - 1px), #5f5d59 calc(100% / 12))', backgroundSize: '45% 100%', backgroundRepeat: 'no-repeat' }} />
        </div>
      </div>
      <div aria-hidden="true" className="mt-2 grid grid-cols-4 text-center text-[12px] text-muted"><span>Small</span><span>Medium</span><span>Large</span><span>Ruler</span></div>
      <table className="mt-5 w-full text-left text-[14px]">
        <caption className="sr-only">Angel sizes, approximate heights and individual prices</caption>
        <thead><tr className="border-b border-line"><th className="py-2 font-medium" scope="col">Size</th><th scope="col" className="font-medium">Approx. height</th><th scope="col" className="text-right font-medium">Price each</th></tr></thead>
        <tbody>{sizes.map((size) => <tr key={size.id} className="border-b border-line"><th scope="row" className="py-3 font-normal capitalize">{size.id}</th><td>{size.height === 6 ? '6″' : size.height === 15.5 ? '15½″' : '18¾″'}</td><td className="text-right tabular">${size.price}</td></tr>)}</tbody>
      </table>
      {bundle && (
        <p className="mt-4 text-[14px]">
          All three together: <span className="tabular font-medium">${bundle.price}</span>{" "}
          <span className="text-muted">(${separately} if bought separately)</span>
        </p>
      )}
      <p className="mt-3 text-[12px] text-muted">Illustration shows relative height; shapes are for reference. See the photo for the finished angels.</p>
    </section>
  );
}
