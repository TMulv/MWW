const items = [
  {
    title: "Wooden Flags",
    description:
      "Hand-torched and painted wooden flags — available in classic American and Thin Blue Line styles.",
  },
  {
    title: "Umbrella Planters",
    description:
      "Cedar planter boxes with built-in umbrella pole slot — perfect for patio tables and outdoor spaces.",
  },
  {
    title: "Picnic Tables",
    description:
      "Solid, compact picnic tables built for backyards, patios, and kids who love to be outside.",
  },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function OnTheTable() {
  return (
    <section className="px-[6vw] py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-6xl font-semibold leading-[0.95] text-bark md:text-7xl">
          On The
          <br />
          Table
        </h2>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <p className="max-w-xs text-sm text-bark/70 md:text-right">
            A sample of what I&apos;ve been working on. Products rotate based
            on what I make each week.
          </p>
          <a
            href="https://instagram.com/mulveys_woodworkingcreations"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-bark px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-bark transition-colors hover:bg-bark hover:text-cream"
          >
            <InstagramIcon />
            See Latest Builds
          </a>
        </div>
      </div>

      <ul className="mt-16 grid grid-cols-1 gap-8 list-none md:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.title} className="border border-bark/80 p-4">
            {/* Placeholder — swap for a real product photo */}
            <div className="flex aspect-square items-center justify-center border border-bark/20 bg-white/60">
              <span className="px-4 text-center text-xs uppercase tracking-[0.1em] text-bark/30">
                Photo coming soon
              </span>
            </div>

            <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.15em] text-terra">
              Item {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-1 text-2xl font-semibold italic text-bark">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-bark/70">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
