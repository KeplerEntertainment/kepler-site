import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Chip from "@/components/Chip";
import StageStrip from "@/components/wiki/StageStrip";
import { ElementTag, Facts, MiniText, SlotKey, Swatch } from "@/components/wiki/bits";
import {
  abilities,
  abilityHref,
  abilitiesOf,
  abilitySlug,
  getAbilityBySlug,
  getClass,
  getRace,
  ownerHref,
  SLOT_INFO,
  titleCase,
} from "@/lib/wiki";

export const dynamicParams = false;

export function generateStaticParams() {
  return abilities.map((a) => ({ id: abilitySlug(a.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = getAbilityBySlug(id);
  if (!a) return {};
  return {
    title: `${a.name} (${a.slot}, ${a.ownerName}) / Kepler wiki`,
    description: `${a.name}, the ${SLOT_INFO[a.slot].long} of the ${a.ownerName} ${a.ownerKind}: stats and its five stages from Common to Mythic (${a.stages[4].name}).`,
  };
}

export default async function AbilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = getAbilityBySlug(id);
  if (!a) notFound();

  const ownerIds = a.ownerKind === "class" ? getClass(a.ownerId)?.abilities : getRace(a.ownerId)?.abilities;
  const siblings = abilitiesOf(ownerIds ?? []);
  const i = siblings.findIndex((s) => s.id === a.id);
  const prev = i > 0 ? siblings[i - 1] : null;
  const next = i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null;
  const isUlt = a.slot === "T";

  const stats: { label: string; value: React.ReactNode }[] = [
    { label: "Slot", value: `${a.slot}: ${SLOT_INFO[a.slot].long} (skill-mode key ${SLOT_INFO[a.slot].hotbar})` },
  ];
  if (a.weapon) stats.push({ label: "Weapon", value: a.weapon });
  if (isUlt) {
    stats.push({ label: "Cost", value: "100 ultimate charge" });
    stats.push({ label: "Lockout", value: "60 s (Legendary 55 s, Mythic 50 s)" });
  } else if (a.cooldown != null) {
    stats.push({ label: "Cooldown", value: `${a.cooldown} s` });
  }
  if (a.energy != null && !isUlt) stats.push({ label: "Energy", value: String(a.energy) });
  if (a.cast) stats.push({ label: "Cast time", value: `${a.cast} s` });
  if (a.range != null) stats.push({ label: "Range", value: `${a.range} blocks` });
  if (a.target) stats.push({ label: "Target", value: titleCase(a.target) });

  return (
    <article>
      {/* ── header ─────────────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-6xl px-5 pt-10 pb-10 sm:px-8 sm:pt-14">
        <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-[0.14em]">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/wiki/" className="ul-link">
                Wiki
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/wiki/abilities/" className="ul-link">
                Abilities
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={ownerHref(a)} className="ul-link">
                {a.ownerName}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="opacity-70">
              {a.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 flex flex-wrap items-start gap-5">
          <SlotKey slot={a.slot} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-2">
              {SLOT_INFO[a.slot].source} / {SLOT_INFO[a.slot].long}
            </p>
            <h1 className="display mt-2 text-4xl sm:text-5xl lg:text-6xl">{a.name}</h1>
            <p className="mt-3 text-lg">
              Evolves into{" "}
              <strong className="font-bold">
                {a.stages
                  .map((s) => s.name)
                  .filter((n, k, all) => k === 0 || n !== all[k - 1])
                  .slice(1)
                  .join(" → ") || `${a.name} (same name at every tier)`}
              </strong>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            href={ownerHref(a)}
            className="inline-flex items-center gap-2 border-2 border-ink bg-panel px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-accent"
          >
            <Swatch color={a.ownerColor} />
            {a.ownerName} {a.ownerKind}
          </Link>
          <ElementTag element={a.element} />
          <Chip>{titleCase(a.kind)}</Chip>
          {a.applies && <Chip tone="ink">Applies {titleCase(a.applies)}</Chip>}
          {a.weapon && <Chip>{a.weapon}</Chip>}
        </div>
      </header>

      {/* ── overview ───────────────────────────────────────────────────────── */}
      <section aria-labelledby="overview-h" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 rule">
        <h2 id="overview-h" className="sr-only">
          Overview
        </h2>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="slab p-5 sm:p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">What it does (Common, level 1)</p>
            <div className="mt-3 space-y-2 text-lg leading-relaxed">
              {a.text.map((t, k) => (
                <p key={k}>
                  <MiniText text={t} />
                </p>
              ))}
            </div>
            {(a.epicText.length > 0 || a.mythicText.length > 0) && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {a.epicText.length > 0 && (
                  <div className="border-2 border-ink p-3" style={{ boxShadow: "4px 4px 0 0 #b45cff" }}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em]">Epic form · {a.stages[2].name}</p>
                    {a.epicText.map((t, k) => (
                      <p key={k} className="mt-1 text-sm">
                        <MiniText text={t} />
                      </p>
                    ))}
                  </div>
                )}
                {a.mythicText.length > 0 && (
                  <div className="border-2 border-ink p-3" style={{ boxShadow: "4px 4px 0 0 #ff3d5a" }}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em]">Mythic form · {a.stages[4].name}</p>
                    {a.mythicText.map((t, k) => (
                      <p key={k} className="mt-1 text-sm">
                        <MiniText text={t} />
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="slab bg-accent p-5 text-accent-ink sm:p-6">
            <p className="display text-xl">Stats</p>
            <div className="mt-4">
              <Facts rows={stats} />
            </div>
            <p className="mt-5 border-t-2 border-ink pt-3 text-xs leading-relaxed">
              Numbers are config defaults from the plugin YAML. Against players, level and tier bonuses count 50 %. Crowd-control
              durations never scale.
            </p>
          </div>
        </div>
      </section>

      {/* ── stages ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="stages-h" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 rule">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-2">Skill growth</p>
        <h2 id="stages-h" className="display text-3xl sm:text-4xl">
          Five stages, Common to Mythic
        </h2>
        <p className="mt-3 mb-8 max-w-[64ch] text-lg leading-relaxed opacity-80">
          The skill levels from 1 to 100 by real use and evolves through five tiers.{" "}
          <Link href="/wiki/#growth" className="ul-link">
            How growth works
          </Link>
          .
        </p>
        <StageStrip ability={a} />
        <p className="mt-4 max-w-[80ch] text-xs leading-relaxed opacity-70">
          Previews are rendered from recordings of the live server&rsquo;s skill visuals (moving blocks, particles, caster and
          training dummies); stylised, not in-game screenshots.
        </p>
      </section>

      {/* ── prev / next within the owner ───────────────────────────────────── */}
      <nav aria-label={`More ${a.ownerName} skills`} className="mx-auto max-w-6xl px-5 py-10 sm:px-8 rule">
        <div className="grid gap-4 sm:grid-cols-3">
          {prev ? (
            <Link href={abilityHref(prev.id)} className="slab slab-press flex items-center gap-3 p-4">
              <span aria-hidden="true" className="display text-2xl">
                ←
              </span>
              <SlotKey slot={prev.slot} size="sm" />
              <span className="min-w-0">
                <span className="block font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Previous</span>
                <span className="block font-semibold">{prev.name}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link href={ownerHref(a)} className="slab slab-press flex items-center justify-center gap-2 bg-accent p-4 text-center font-semibold uppercase tracking-wide text-accent-ink">
            <Swatch color={a.ownerColor} />
            All {a.ownerName} skills
          </Link>
          {next ? (
            <Link href={abilityHref(next.id)} className="slab slab-press flex items-center justify-end gap-3 p-4 text-right">
              <span className="min-w-0">
                <span className="block font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Next</span>
                <span className="block font-semibold">{next.name}</span>
              </span>
              <SlotKey slot={next.slot} size="sm" />
              <span aria-hidden="true" className="display text-2xl">
                →
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </article>
  );
}
