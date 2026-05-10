export default function Hero() {
  return (
    <section className="flex min-h-screen items-center px-[6vw]">
      <div className="flex flex-col gap-10">

        {/* Decorative category labels */}
        <ul className="flex flex-wrap gap-3 list-none" aria-label="Categories">
          <li className="tag text-sky   border-sky">Heirloom Toys</li>
          <li className="tag text-terra border-terra">Custom Decor</li>
          <li className="tag text-bark  border-bark">Small Batch</li>
        </ul>

        {/* Scroll cue */}
        <div className="flex flex-col gap-1 select-none pointer-events-none">
          <span className="text-[0.65rem] font-medium tracking-[0.18em] uppercase text-bark/50">
            Scroll to explore
          </span>
          <span className="text-lg text-bark/40 animate-bob" aria-hidden="true">↓</span>
        </div>

      </div>
    </section>
  );
}
