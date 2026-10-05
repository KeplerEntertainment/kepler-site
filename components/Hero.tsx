import { site } from "@/lib/site";

/** The opening block: statement, pitch, honest status and two ways in. */
export default function Hero({ actions }: { actions: { href: string; label: string }[] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-12 pb-14 sm:pt-20 sm:pb-20">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="inline-block slab bg-accent text-accent-ink px-3 py-1 font-mono text-xs uppercase tracking-[0.2em]">
          {site.role}
        </p>
        <p className="inline-flex items-center gap-2 border-2 border-ink bg-panel px-2.5 py-1 font-mono text-xs uppercase tracking-[0.14em]">
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 border-2 border-ink bg-accent-3" />
          In development
        </p>
      </div>

      <h1 className="display text-5xl sm:text-6xl lg:text-7xl max-w-[18ch]">{site.headline}</h1>

      <p className="mt-7 max-w-[58ch] text-lg sm:text-xl leading-relaxed">{site.intro}</p>

      <p className="mt-6 slab bg-accent-3 text-accent-ink inline-flex max-w-[52ch] px-4 py-3 text-sm font-semibold">
        {site.status}
      </p>

      <div className="mt-9 flex flex-wrap gap-4">
        {actions.map((action, i) => (
          <a
            key={action.href}
            href={action.href}
            className={`slab slab-press px-6 py-3 font-semibold uppercase tracking-wide ${
              i === 0 ? "bg-accent text-accent-ink" : "bg-panel"
            }`}
          >
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}
