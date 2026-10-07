import Image from "next/image";
import Link from "next/link";
import { abilities, abilityHref, getAbility, GIF_H, GIF_W, mediaSrc } from "@/lib/wiki";

const PREVIEWS = ["class.spellblade.r", "race.cinderborn.q", "class.cryomancer.t"];

/** The home page's way into the wiki: a blue slab with three Mythic previews. */
export default function WikiCallout() {
  const shown = PREVIEWS.map((id) => getAbility(id)).filter((a) => !!a);
  return (
    <section aria-labelledby="wiki-cta-h" className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-16">
      <div className="slab grid gap-6 bg-accent-2 p-5 text-white sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em]">New / The wiki</p>
          <h2 id="wiki-cta-h" className="display mt-3 text-3xl sm:text-4xl">
            How Kepler plays, in depth
          </h2>
          <p className="mt-3 max-w-[48ch] leading-relaxed">
            Races, classes, the seven skill slots, element combos and skill growth, plus all {abilities.length} abilities with an
            animated preview of every stage from Common to Mythic.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/wiki/" className="slab slab-press bg-accent px-6 py-3 font-semibold uppercase tracking-wide text-accent-ink">
              Open the wiki
            </Link>
            <Link href="/wiki/abilities/" className="slab slab-press bg-panel px-6 py-3 font-semibold uppercase tracking-wide text-ink">
              Abilities
            </Link>
          </div>
        </div>
        <ul className="grid grid-cols-3 gap-3" aria-label="Mythic skill previews">
          {shown.map((a) => (
            <li key={a.id}>
              <Link href={abilityHref(a.id)} className="slab slab-press block overflow-hidden bg-ink">
                <Image
                  src={mediaSrc(a.stages[4].gif)}
                  alt={`${a.stages[4].name}, the Mythic form of ${a.name}: animated preview`}
                  width={GIF_W}
                  height={GIF_H}
                  unoptimized
                  loading="lazy"
                  className="block h-auto w-full"
                />
                <span className="block truncate border-t-[length:var(--bw)] border-ink bg-panel px-2 py-1.5 text-xs font-semibold text-ink">
                  {a.stages[4].name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
