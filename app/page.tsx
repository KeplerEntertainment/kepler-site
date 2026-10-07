import Link from "next/link";
import Architecture from "@/components/Architecture";
import Chip from "@/components/Chip";
import ElementChip from "@/components/ElementChip";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import WikiCallout from "@/components/WikiCallout";
import ZoneMap from "@/components/ZoneMap";
import {
  aspects,
  blightLevels,
  cities,
  classes,
  mapCredit,
  coreLoop,
  premise,
  races,
  roadmap,
  skillBar,
  systems,
  tiers,
  travel,
  zones,
  type PhaseState,
  type Zone,
} from "@/lib/content";

const ZONE_SWATCH: Record<Zone, string> = {
  blue: "bg-accent-2",
  yellow: "bg-accent",
  red: "bg-accent-3",
  black: "bg-ink",
};

const SLOT_TONE: Record<string, string> = {
  Race: "bg-accent text-accent-ink",
  Class: "bg-accent-3 text-accent-ink",
  Weapon: "bg-panel",
  Armour: "bg-panel",
};

const PHASE: Record<PhaseState, { label: string; tone: "accent" | "accent2" | "accent3" | "panel"; mark: string }> = {
  done: { label: "done", tone: "accent2", mark: "✓" },
  now: { label: "in progress", tone: "accent", mark: "●" },
  next: { label: "next", tone: "accent3", mark: "→" },
  later: { label: "later", tone: "panel", mark: "·" },
};

export default function HomePage() {
  return (
    <>
      <Hero
        actions={[
          { href: "#world", label: "Enter the world" },
          { href: "#roadmap", label: "Where it stands" },
        ]}
      />

      <WikiCallout />

      {/* ── 01 The world ─────────────────────────────────────────────────── */}
      <Section
        id="world"
        kicker="01 / The world"
        title="Ormere, and the waves"
        tagline="A world that is struck again and again, and the people who walk into the damage to fix it."
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-5 text-lg leading-relaxed">
            {premise.map((p) => (
              <p key={p.slice(0, 24)} className="max-w-[60ch]">
                {p}
              </p>
            ))}
            <p className="slab bg-accent text-accent-ink max-w-[60ch] px-4 py-3 text-base font-semibold">
              The known land is Aldara, a continent about 20,000 by 20,000 blocks: a snowy north under an ice cap,
              a temperate heartland of forests, lakes and ridges, red deserts and canyons in the south-east, and a
              bayou and jungle isles along the south. Each city’s Tollstone wards only a pocket around it. Between
              the pockets lie bands of red and black ground, and the zones follow the land itself: coastlines,
              ridges, rivers and biome edges. Of the land, about 32% is safe, 34% red and 34% black, and the further
              from a Tollstone you go, the richer and deadlier it gets.
            </p>
            <p className="max-w-[60ch] text-base opacity-80">
              Every one of the ten races has a homeland somewhere on it: the Frostvein on the ice cap, the Cinderborn
              by the calderas outside Forgecross, the Mirefolk in the bayou, the Vinereach on the jungle isles. Most
              of that ground is red or black, so holding it takes a fight.
            </p>
          </div>

          <div className="slab p-3 sm:p-4">
            <ZoneMap />
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
              Kepler zones on the Aldara map (v2 draft, coordinates being verified)
            </p>
            <p className="mt-2 text-xs leading-relaxed">
              World map:{" "}
              <a href={mapCredit.url} className="ul-link font-semibold" target="_blank" rel="noopener noreferrer">
                {mapCredit.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              by {mapCredit.author}. The zone map above is drawn by Kepler from its own zone data; it is not the
              author’s render.
            </p>
          </div>
        </div>

        <h3 className="display mt-14 text-2xl">Four kinds of ground</h3>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((z) => (
            <li key={z.key} className="slab overflow-hidden">
              <div className={`h-3 border-b-[length:var(--bw)] border-ink ${ZONE_SWATCH[z.key]}`} aria-hidden="true" />
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="display text-xl">{z.name}</h4>
                  <span className="font-mono text-xs opacity-70">{z.tiers}</span>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">PvP</dt>
                    <dd>{z.pvp}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">On death</dt>
                    <dd>{z.death}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Rewards</dt>
                    <dd>{z.reward}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="display mt-14 text-2xl">The five cities of the Charter</h3>
        <p className="mt-3 max-w-[60ch] opacity-80">
          Each city is built around a Tollstone that counts down to the next wave, inside its own safe pocket. Each
          refines one resource best, so trade between them is worth the road, and every road between them crosses red
          ground.
        </p>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <li key={c.id} className="slab p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="accent2">{c.tile}</Chip>
                <span className="font-mono text-xs uppercase tracking-[0.12em] opacity-70">{c.ground}</span>
              </div>
              <h4 className="display mt-4 text-2xl">{c.name}</h4>
              <p className="mt-1 font-semibold">{c.epithet}</p>
              <p className="mt-3 text-sm leading-relaxed opacity-80">{c.trade}</p>
              <p className="mt-4 border-l-[length:var(--bw)] border-accent-3 pl-3 text-sm italic">“{c.proverb}”</p>
            </li>
          ))}
        </ul>

        <h3 className="display mt-14 text-2xl">Roads, and the ways around them</h3>
        <p className="mt-3 max-w-[60ch] opacity-80">
          Roads stay the fastest way to travel, but they are protected only inside the wards. Past the Ward Posts a
          road is ordinary red or black ground: open PvP, full loot, and everyone knows the route. Three services are
          designed for people who would rather not risk it. None of them is built yet.
        </p>
        <ul className="mt-6 grid gap-5 lg:grid-cols-3">
          {travel.map((t) => (
            <li key={t.name} className="slab p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="accent">{t.kind}</Chip>
                <Chip>designed</Chip>
              </div>
              <h4 className="display mt-4 text-2xl">{t.name}</h4>
              <p className="mt-3 text-sm leading-relaxed opacity-80">{t.body}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {t.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden="true" className="mt-1.5 inline-block h-2 w-2 shrink-0 bg-ink" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-l-[length:var(--bw)] border-accent-3 pl-3 text-sm italic">“{t.saying}”</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 02 Systems ───────────────────────────────────────────────────── */}
      <Section
        id="systems"
        kicker="02 / Systems"
        title="Everything is player-made"
        tagline="A full sandbox loop: what you wear is what you are, what you wear can be lost, and someone else crafted it."
      >
        <h3 className="display text-2xl">The core loop</h3>
        <ol className="mt-6 grid gap-4 md:grid-cols-5">
          {coreLoop.map((s, i) => (
            <li key={s.step} className="slab relative p-4">
              <span className="font-mono text-xs opacity-60">0{i + 1}</span>
              <p className="display mt-1 text-xl">{s.step}</p>
              <p className="mt-2 text-sm leading-snug opacity-80">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 slab bg-ink text-bg inline-flex max-w-full px-4 py-3 font-mono text-xs uppercase tracking-[0.12em]">
          Loot or lose ↺ the demand for new gear starts the loop again
        </p>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {systems.map((s) => (
            <li key={s.title} className="slab p-5 sm:p-6">
              <Chip tone="accent">{s.tag}</Chip>
              <h3 className="display mt-4 text-2xl">{s.title}</h3>
              <p className="mt-3 leading-relaxed opacity-80">{s.body}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden="true" className="mt-1.5 inline-block h-2 w-2 shrink-0 bg-ink" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="slab p-5 sm:p-6">
            <h3 className="display text-2xl">Four Aspects of the Hollow</h3>
            <p className="mt-2 text-sm opacity-80">
              Each wave is forecast with one Aspect, a Current turned inside out. The forecast tells crafters what to
              make and fighters what to wear.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {aspects.map((a) => (
                <li key={a.name} className="border-2 border-ink p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="display text-lg">{a.name}</span>
                    <ElementChip element={a.current} />
                  </div>
                  <p className="mt-1 text-sm">
                    Herald: <span className="font-semibold">{a.herald}</span>
                  </p>
                  <p className="mt-1 text-xs opacity-70">{a.prep}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="slab p-5 sm:p-6">
            <h3 className="display text-2xl">Blight, tile by tile</h3>
            <p className="mt-2 text-sm opacity-80">
              A lost Scar leaves Blight. It spreads to neighbouring tiles every hour. The deeper it goes, the more
              dangerous and rewarding the tile, and the less the land gives back.
            </p>
            <ol className="mt-5 space-y-2">
              {blightLevels.map((name, i) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="font-mono text-xs w-6 opacity-70">L{i}</span>
                  <span
                    aria-hidden="true"
                    className="h-4 border-2 border-ink bg-ink"
                    style={{ width: `${12 + i * 14}%`, opacity: 0.15 + i * 0.17 }}
                  />
                  <span className="text-sm font-semibold">{name}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ── 03 Races & classes ───────────────────────────────────────────── */}
      <Section
        id="races"
        kicker="03 / Races & classes"
        title="Ten kindreds, fifteen orders"
        tagline="Pick a race and a class when you create a character. Both are permanent. Every pairing is allowed, and each account can hold several characters."
      >
        <h3 className="display text-2xl">The seven-slot skill bar</h3>
        <p className="mt-3 max-w-[64ch] opacity-80">
          In skill mode, hotbar keys 1 to 7 become seven skills. Race and class give four elemental skills; weapon and
          armour give the other three.
        </p>
        <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {skillBar.map((s) => (
            <li key={s.key} className={`slab p-3 ${SLOT_TONE[s.source]}`}>
              <div className="flex items-baseline justify-between">
                <span className="display text-4xl">{s.key}</span>
                <span className="font-mono text-[11px] opacity-70">key {s.hotbar}</span>
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em]">{s.source}</p>
              <p className="mt-1 text-xs leading-snug">{s.text}</p>
            </li>
          ))}
        </ol>

        <h3 className="display mt-14 text-2xl">The ten biome races</h3>
        <p className="mt-3 max-w-[64ch] opacity-80">
          One race per kind of land, each with a primary and a secondary Current. Passives grow stronger on home
          ground, and switch off when that ground is Blighted, so every race has a reason to cleanse its homeland.
        </p>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {races.map((r) => (
            <li key={r.name} className="slab p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">{r.home}</p>
              <h4 className="display mt-2 text-lg">{r.name}</h4>
              <p className="mt-1 text-xs opacity-70">On Aldara: {r.land}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <ElementChip element={r.primary} />
                <ElementChip element={r.secondary} />
              </div>
              <p className="mt-3 text-sm leading-snug opacity-80">{r.nudge}</p>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="font-mono font-semibold">Q</dt>
                  <dd>{r.q}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-mono font-semibold">E</dt>
                  <dd>{r.e}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <h3 className="display mt-14 text-2xl">The fifteen classes</h3>
        <p className="mt-3 max-w-[64ch] opacity-80">
          Each class is an order with a creed and a hall in one of the cities. It brings exclusive weapons, a
          signature skill on R and an ultimate on T.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <li key={c.name} className="slab p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="display text-xl">{c.name}</h4>
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{c.role}</span>
              </div>
              <p className="mt-1 text-sm italic opacity-80">{c.order}</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="font-mono font-semibold w-4">R</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    {c.r} <ElementChip element={c.rEl} />
                  </dd>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="font-mono font-semibold w-4">T</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    {c.t} <ElementChip element={c.tEl} />
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <h3 className="display mt-14 text-2xl">Skills that grow with use</h3>
        <p className="mt-3 max-w-[64ch] opacity-80">
          Every skill levels from 1 to 100, and only from real use. Past each gate level it rolls to evolve into the
          next tier, with pity that guarantees it eventually. A skill never drops a tier.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-5">
          {tiers.map((t, i) => (
            <li
              key={t.name}
              className={`slab p-4 ${i === tiers.length - 1 ? "bg-ink text-bg" : i === tiers.length - 2 ? "bg-accent text-accent-ink" : ""}`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">from level {t.gate}</p>
              <p className="display mt-2 text-xl">{t.name}</p>
              <p className="mt-1 font-mono text-sm">{t.mult}</p>
              <p className="mt-2 text-xs leading-snug">{t.adds}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <Link href="/wiki/abilities/" className="ul-link font-semibold">
            See all 149 skills at every stage in the wiki →
          </Link>
        </p>
      </Section>

      {/* ── 04 Architecture ──────────────────────────────────────────────── */}
      <Section
        id="architecture"
        kicker="04 / Architecture"
        title="One core, many jars"
        tagline="Kepler is a suite of Paper 1.21.4 plugins in Java 21. A single core owns shared data and services; every feature is an addon on top of it."
      >
        <Architecture />
      </Section>

      {/* ── 05 Roadmap ───────────────────────────────────────────────────── */}
      <Section
        id="roadmap"
        kicker="05 / Roadmap"
        title="Where it stands"
        tagline="Kepler is not playable yet. This is the honest state of the build."
      >
        <ol className="grid gap-4">
          {roadmap.map((r, i) => {
            const p = PHASE[r.state];
            return (
              <li
                key={r.phase}
                className="slab grid gap-2 p-4 sm:grid-cols-[3rem_220px_minmax(0,1fr)] sm:items-baseline sm:gap-6 sm:p-5"
              >
                <span className="font-mono text-xs opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="display text-lg">{r.phase}</span>
                  <Chip tone={p.tone}>
                    <span aria-hidden="true">{p.mark} </span>
                    {p.label}
                  </Chip>
                </div>
                <p className="leading-relaxed opacity-80">{r.text}</p>
              </li>
            );
          })}
        </ol>
      </Section>
    </>
  );
}
