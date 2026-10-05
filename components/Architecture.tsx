import Chip from "@/components/Chip";
import { coreServices, moduleGroups, type Module } from "@/lib/content";

const STATUS_TONE: Record<Module["status"], "panel" | "accent" | "accent3"> = {
  drafted: "panel",
  "in progress": "accent",
  next: "accent3",
};

/**
 * One core, many addons. Drawn as slabs: the core across the top, a connector
 * bus, and the addon groups hanging off it. Every addon points at the core only.
 */
export default function Architecture() {
  const count = moduleGroups.reduce((n, g) => n + g.modules.length, 0);

  return (
    <figure aria-labelledby="arch-caption">
      <div className="slab bg-ink text-bg p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="display text-2xl sm:text-3xl text-accent">KeplerCore</p>
          <p className="font-mono text-xs uppercase tracking-[0.14em] opacity-80">kepler-core.jar / shared API</p>
        </div>
        <ul className="mt-5 flex flex-wrap gap-2">
          {coreServices.map((s) => (
            <li
              key={s}
              className="border-2 border-bg px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* The bus: a stem down from the core and a rail the groups hang from. */}
      <div aria-hidden="true" className="relative h-10">
        <div className="absolute left-1/2 top-0 h-5 -translate-x-1/2 border-l-[length:var(--bw)] border-ink" />
        <div className="absolute left-[12%] right-[12%] top-5 hidden border-t-[length:var(--bw)] border-ink lg:block" />
        <div className="absolute left-1/2 top-5 h-5 -translate-x-1/2 border-l-[length:var(--bw)] border-ink lg:hidden" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {moduleGroups.map((group) => (
          <section key={group.name} aria-label={`${group.name} addons`} className="slab p-4 sm:p-5">
            <h3 className="display text-lg">{group.name}</h3>
            <ul className="mt-4 space-y-4">
              {group.modules.map((m) => (
                <li key={m.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    <Chip tone={STATUS_TONE[m.status]}>{m.status}</Chip>
                  </div>
                  <p className="mt-1 text-sm leading-snug opacity-75">{m.does}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <figcaption id="arch-caption" className="mt-6 max-w-[64ch] text-sm leading-relaxed opacity-80">
        One core plugin and {count} addons, each its own jar and its own repository. Addons talk to the core API and
        to each other only through its services and events, so any addon can be built, tested and shipped on its own.
      </figcaption>
    </figure>
  );
}
