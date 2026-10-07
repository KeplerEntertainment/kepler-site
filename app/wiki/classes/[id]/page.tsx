import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Chip from "@/components/Chip";
import AbilityCard, { toCard } from "@/components/wiki/AbilityCard";
import { MiniText, Swatch } from "@/components/wiki/bits";
import { abilitiesOf, getAbility, getClass, getRace, statLabel, statValue, titleCase, wikiClasses } from "@/lib/wiki";

export const dynamicParams = false;

export function generateStaticParams() {
  return wikiClasses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getClass(id);
  if (!c) return {};
  return {
    title: `${c.name} (class) / Kepler wiki`,
    description: `${c.name}, ${c.role}: stat profile, weapon families, class weapons, skills and talents.`,
  };
}

const CHARGE: Record<string, string> = {
  DAMAGE_DEALT: "damage dealt",
  DAMAGE_TAKEN: "damage taken / mitigated",
  HEALING_DONE: "healing done",
  CC_APPLIED: "crowd control applied",
  BUFF_UPTIME: "buff uptime on allies",
  DODGE: "dodges",
  STRUCTURE: "structure damage",
};

function ProfileBars({ stats, tone }: { stats: Record<string, number>; tone: "buff" | "debuff" }) {
  const max = 0.3;
  return (
    <ul className="space-y-2">
      {Object.entries(stats).map(([k, v]) => (
        <li key={k} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm">
          <span className="truncate font-medium" title={k}>
            {statLabel(k)}
          </span>
          <span aria-hidden="true" className="h-3 border-2 border-ink bg-panel">
            <span
              className={`block h-full ${tone === "buff" ? "bg-accent-2" : "bg-accent-3"}`}
              style={{ width: `${Math.min(100, (Math.abs(v) / max) * 100)}%` }}
            />
          </span>
          <span className="text-right font-mono text-xs font-semibold">{statValue(k, v)}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getClass(id);
  if (!c) notFound();
  const r = getAbility(`class.${c.id}.r`);
  const t = getAbility(`class.${c.id}.t`);
  const i = wikiClasses.findIndex((x) => x.id === c.id);
  const prev = wikiClasses[(i - 1 + wikiClasses.length) % wikiClasses.length];
  const next = wikiClasses[(i + 1) % wikiClasses.length];
  const tiers = [1, 2, 3, 4, 5].map((n) => c.talents.filter((x) => x.tier === n));

  return (
    <article>
      <header className="mx-auto max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14">
        <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-[0.14em]">
          <Link href="/wiki/" className="ul-link">
            Wiki
          </Link>{" "}
          /{" "}
          <Link href="/wiki/#classes" className="ul-link">
            Classes
          </Link>{" "}
          / <span className="opacity-70">{c.name}</span>
        </nav>
        <div className="mt-8 slab overflow-hidden">
          <div aria-hidden="true" className="h-4 border-b-[length:var(--bw)] border-ink" style={{ background: c.color }} />
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-2">
                Class {String(c.order).padStart(2, "0")} of {wikiClasses.length}
              </p>
              <h1 className="display mt-2 text-5xl sm:text-6xl">{c.name}</h1>
              <p className="mt-2 text-xl font-semibold">{c.role}</p>
              <div className="mt-4 space-y-1 text-lg">
                {c.summary.map((s, k) => (
                  <p key={k}>
                    <MiniText text={s} />
                  </p>
                ))}
              </div>
            </div>
            <dl className="grid content-start gap-3 text-sm">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Class hall</dt>
                <dd className="font-semibold">{titleCase(c.homeCity)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">R / T damage type</dt>
                <dd className="font-semibold">{titleCase(c.skillKind)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Ultimate charge from</dt>
                <dd className="font-semibold">{c.charge.map((x) => CHARGE[x] ?? titleCase(x)).join(", ")}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Resonant races</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {c.resonantRaces.map((rid) => {
                    const race = getRace(rid);
                    return race ? (
                      <Link
                        key={rid}
                        href={`/wiki/races/${rid}/`}
                        className="inline-flex items-center gap-1.5 border-2 border-ink bg-panel px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] hover:bg-accent"
                      >
                        <Swatch color={race.color} className="h-2.5 w-2.5" />
                        {race.name}
                      </Link>
                    ) : null;
                  })}
                </dd>
                <dd className="mt-1 text-xs opacity-70">Race primary element = class R element: +10 % class XP and a cosmetic trail.</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section aria-labelledby="profile-h" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 rule">
        <h2 id="profile-h" className="display text-3xl">
          Stat profile and weapon rules
        </h2>
        <p className="mt-3 max-w-[64ch] opacity-80">
          The profile multiplies on top of gear. Buffs scale from 70 % at class level 1 to 100 % at level 21; debuffs are always
          100 %.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="slab p-5">
            <p className="display text-lg">Buffs</p>
            <div className="mt-4">
              <ProfileBars stats={c.buffs} tone="buff" />
            </div>
          </div>
          <div className="slab p-5">
            <p className="display text-lg">Debuffs</p>
            <div className="mt-4">
              <ProfileBars stats={c.debuffs} tone="debuff" />
            </div>
          </div>
          <div className="slab p-5">
            <p className="display text-lg">Weapon families</p>
            {(
              [
                ["Allowed", c.families.allowed, "accent2"],
                ["Penalized", c.families.penalized, "accent"],
                ["Forbidden", c.families.forbidden, "panel"],
              ] as const
            ).map(([label, list, tone]) => (
              <div key={label} className="mt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">{label}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {list.length ? list.map((f) => <Chip key={f} tone={tone}>{f}</Chip>) : <span className="text-sm opacity-60">none</span>}
                </div>
              </div>
            ))}
            <p className="mt-4 text-xs opacity-70">Own class weapons are Exclusive: full kit, class passive, class IP.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="skills-h" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 rule">
        <h2 id="skills-h" className="display text-3xl">
          Class skills
        </h2>
        <p className="mt-3 max-w-[64ch] opacity-80">R is the signature skill from level 1; T is the ultimate, unlocked at class level 20.</p>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[r, t].map((a) =>
            a ? (
              <li key={a.id}>
                <AbilityCard card={toCard(a)} />
              </li>
            ) : null,
          )}
        </ul>

        {c.weapons.map((w) => (
          <div key={w.id} className="mt-12">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="display text-2xl">{w.name}</h3>
              <Chip>{w.hands === 2 ? "two-handed" : "one-handed"}</Chip>
              {w.city && <Chip tone="accent2">{titleCase(w.city)}</Chip>}
            </div>
            {w.lore.length > 0 && (
              <p className="mt-2 text-sm italic opacity-80">
                <MiniText text={w.lore.join(" ")} />
              </p>
            )}
            <div className="mt-5 grid gap-5 lg:grid-cols-4">
              {w.passive && (
                <div className="slab bg-ink p-4 text-bg lg:order-last">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Passive</p>
                  <p className="display mt-1 text-lg">{w.passive.name}</p>
                  {w.passive.text.map((x, k) => (
                    <p key={k} className="mt-2 text-sm">
                      <MiniText text={x} />
                    </p>
                  ))}
                </div>
              )}
              {abilitiesOf(w.abilities).map((a) => (
                <AbilityCard key={a.id} card={toCard(a)} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="talents-h" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 rule">
        <h2 id="talents-h" className="display text-3xl">
          Talents
        </h2>
        <p className="mt-3 max-w-[64ch] opacity-80">
          Twelve nodes in five tiers; the tree opens at class level 10, and only one of the two capstones can be active.
        </p>
        <ol className="mt-6 grid gap-4 lg:grid-cols-5">
          {tiers.map((nodes, k) => (
            <li key={k} className={`slab p-4 ${k === 4 ? "bg-accent text-accent-ink" : ""}`}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">{k === 4 ? "Capstone" : `Tier ${k + 1}`}</p>
              <ul className="mt-3 space-y-3">
                {nodes.map((n) => (
                  <li key={n.id}>
                    <p className="font-semibold">{n.name}</p>
                    <p className="text-sm leading-snug opacity-80">{n.text}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <nav aria-label="Other classes" className="mx-auto max-w-6xl px-5 py-10 sm:px-8 rule">
        <div className="flex flex-wrap justify-between gap-4">
          <Link href={`/wiki/classes/${prev.id}/`} className="slab slab-press inline-flex items-center gap-2 px-4 py-3 font-semibold">
            <span aria-hidden="true">←</span> <Swatch color={prev.color} /> {prev.name}
          </Link>
          <Link href={`/wiki/classes/${next.id}/`} className="slab slab-press inline-flex items-center gap-2 px-4 py-3 font-semibold">
            {next.name} <Swatch color={next.color} /> <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
    </article>
  );
}
