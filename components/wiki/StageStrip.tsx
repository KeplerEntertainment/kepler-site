import Image from "next/image";
import { MiniText, TierChip } from "@/components/wiki/bits";
import { GIF_H, GIF_W, mediaSrc, type Ability } from "@/lib/wiki-shared";

/**
 * The five stages of a skill, Common L1 to Mythic L100: name at that tier, the preview, the number changes and the
 * visual layer the tier adds. On small screens the strip scrolls sideways with snap; from xl it is a five-column row.
 */
export default function StageStrip({ ability }: { ability: Ability }) {
  return (
    <div>
      {/* The track: five gates on one line, so the progression reads before the cards do. */}
      <ol aria-hidden="true" className="mb-5 hidden grid-cols-5 items-center sm:grid">
        {ability.stages.map((s, i) => (
          <li key={s.tier} className="relative flex items-center">
            <span
              className="relative z-10 inline-flex h-9 min-w-9 items-center justify-center border-[length:var(--bw)] border-ink px-1.5 font-mono text-xs font-semibold text-ink"
              style={{ background: s.color }}
            >
              L{s.level}
            </span>
            {i < ability.stages.length - 1 && <span className="h-[var(--bw)] flex-1 bg-ink" />}
          </li>
        ))}
      </ol>

      <ol
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-5 sm:-mx-8 sm:px-8 xl:mx-0 xl:grid xl:grid-cols-5 xl:gap-4 xl:overflow-visible xl:px-0"
        aria-label={`${ability.name}: five stages from Common to Mythic`}
      >
        {ability.stages.map((s) => (
          <li
            key={s.tier}
            className="slab flex w-[min(80vw,320px)] shrink-0 snap-start flex-col overflow-hidden xl:w-auto"
          >
            <div className="flex items-center justify-between gap-2 border-b-[length:var(--bw)] border-ink px-3 py-2" style={{ background: s.color }}>
              <span className="display text-lg text-ink">{s.label}</span>
              <span className="font-mono text-xs font-semibold text-ink">Level {s.level}</span>
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="display text-base leading-tight">{s.name}</p>
              <div className="mt-2 border-2 border-ink bg-ink">
                <Image
                  src={mediaSrc(s.gif)}
                  alt={`${s.name} (${ability.name} at ${s.label}, level ${s.level}): animated preview of its visuals`}
                  width={GIF_W}
                  height={GIF_H}
                  loading="lazy"
                  unoptimized
                  className="block h-auto w-full"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <TierChip label={s.label} color={s.color} />
                {s.cooldown != null && (
                  <span className="inline-block border-2 border-ink bg-panel px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em]">
                    CD {s.cooldown} s
                  </span>
                )}
                {s.lockout != null && (
                  <span className="inline-block border-2 border-ink bg-panel px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em]">
                    Lockout {s.lockout} s
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-1.5 text-xs leading-snug">
                {s.changes.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 shrink-0 bg-ink" />
                    <span>
                      <MiniText text={c} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-3">
                <p className="border-t-2 border-ink pt-2 text-xs leading-snug">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">Visuals </span>
                  {s.visual}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
