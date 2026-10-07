import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AbilityCard, { toCard } from "@/components/wiki/AbilityCard";
import { ElementTag, MiniText, Swatch } from "@/components/wiki/bits";
import { abilitiesOf, getRace, passiveValue, titleCase, wikiClasses, wikiRaces } from "@/lib/wiki";

export const dynamicParams = false;

export function generateStaticParams() {
  return wikiRaces.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = getRace(id);
  if (!r) return {};
  return {
    title: `${r.name} (race) / Kepler wiki`,
    description: `${r.name}, the ${r.homeBiome} race: home biome passives, elements, Q and E skills and knack.`,
  };
}

export default async function RacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getRace(id);
  if (!r) notFound();
  const i = wikiRaces.findIndex((x) => x.id === r.id);
  const prev = wikiRaces[(i - 1 + wikiRaces.length) % wikiRaces.length];
  const next = wikiRaces[(i + 1) % wikiRaces.length];
  const resonant = wikiClasses.filter((c) => c.resonantRaces.includes(r.id));

  return (
    <article>
      <header className="mx-auto max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14">
        <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-[0.14em]">
          <Link href="/wiki/" className="ul-link">
            Wiki
          </Link>{" "}
          /{" "}
          <Link href="/wiki/#races" className="ul-link">
            Races
          </Link>{" "}
          / <span className="opacity-70">{r.name}</span>
        </nav>
        <div className="mt-8 slab overflow-hidden">
          <div aria-hidden="true" className="h-4 border-b-[length:var(--bw)] border-ink" style={{ background: r.color }} />
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-2">Home biome: {titleCase(r.homeBiome)}</p>
              <h1 className="display mt-2 text-5xl sm:text-6xl">{r.name}</h1>
              <p className="mt-2 text-xl font-semibold">{r.niche}</p>
              <div className="mt-4 space-y-1 text-lg">
                {r.description.map((s, k) => (
                  <p key={k}>
                    <MiniText text={s} />
                  </p>
                ))}
              </div>
            </div>
            <dl className="grid content-start gap-3 text-sm">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Elements</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs">Q</span> <ElementTag element={r.primary} />
                  <span className="ml-2 text-xs">E</span> <ElementTag element={r.secondary} />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">At home</dt>
                <dd>
                  Passives use their home value and Q / E cooldowns are 10 % shorter. Off in arenas, duels, dungeons and on tiles at
                  Blight level 2 or higher.
                </dd>
              </div>
              {resonant.length > 0 && (
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Resonant classes</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {resonant.map((c) => (
                      <Link
                        key={c.id}
                        href={`/wiki/classes/${c.id}/`}
                        className="inline-flex items-center gap-1.5 border-2 border-ink bg-panel px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] hover:bg-accent"
                      >
                        <Swatch color={c.color} className="h-2.5 w-2.5" />
                        {c.name}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </header>

      <section aria-labelledby="passives-h" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 rule">
        <h2 id="passives-h" className="display text-3xl">
          Passives
        </h2>
        <p className="mt-3 max-w-[64ch] opacity-80">
          Base value everywhere, home value in the {r.homeBiome} biome. The racial track (0 to 50) raises both by up to 50 %.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="slab w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead className="bg-ink text-bg">
              <tr>
                <th scope="col" className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                  Passive
                </th>
                <th scope="col" className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                  Base
                </th>
                <th scope="col" className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                  Home
                </th>
              </tr>
            </thead>
            <tbody>
              {r.passives.map((p) => (
                <tr key={p.id} className="border-t-2 border-ink">
                  <th scope="row" className="px-4 py-2.5 font-semibold">
                    {p.name}
                    {p.condition && <span className="ml-2 text-xs font-normal opacity-70">({p.condition.replace(/_/g, " ")})</span>}
                  </th>
                  <td className="px-4 py-2.5 font-mono">{passiveValue(p.base, p.format)}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold">
                    <span className="bg-accent px-1">{passiveValue(p.home, p.format)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="rskills-h" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 rule">
        <h2 id="rskills-h" className="display text-3xl">
          Race skills
        </h2>
        <p className="mt-3 max-w-[64ch] opacity-80">Q in the primary element, E in the secondary. Both work with any item or an empty hand.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {abilitiesOf(r.abilities).map((a) => (
            <AbilityCard key={a.id} card={toCard(a)} />
          ))}
          {r.knack && (
            <div className="slab bg-ink p-4 text-bg">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Knack · /race knack</p>
              <p className="display mt-1 text-lg">{r.knack.name}</p>
              {r.knack.description.map((x, k) => (
                <p key={k} className="mt-2 text-sm">
                  <MiniText text={x} />
                </p>
              ))}
              <p className="mt-3 text-xs opacity-70">Out of combat. No slot, no element, no level.</p>
            </div>
          )}
        </div>
      </section>

      <nav aria-label="Other races" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 rule">
        <div className="flex flex-wrap justify-between gap-4">
          <Link href={`/wiki/races/${prev.id}/`} className="slab slab-press inline-flex items-center gap-2 px-4 py-3 font-semibold">
            <span aria-hidden="true">←</span> <Swatch color={prev.color} /> {prev.name}
          </Link>
          <Link href={`/wiki/races/${next.id}/`} className="slab slab-press inline-flex items-center gap-2 px-4 py-3 font-semibold">
            {next.name} <Swatch color={next.color} /> <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
