import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Chip from "@/components/Chip";
import ElementChip from "@/components/ElementChip";
import Section from "@/components/Section";
import { Bullets, ElementTag, SlotKey, Swatch } from "@/components/wiki/bits";
import { coreLoop } from "@/lib/content";
import { abilities, abilityHref, getAbility, GIF_H, GIF_W, mediaSrc, SLOTS, SLOT_INFO, titleCase, wikiClasses, wikiRaces } from "@/lib/wiki";
import {
  elementStatuses,
  growthTiers,
  interactions,
  milestones,
  statusOrder,
  weaponRules,
  wikiRoadmap,
  type Reaction,
  type RoadState,
} from "@/lib/wiki-content";

export const metadata: Metadata = {
  title: "Wiki / Kepler",
  description:
    "How Kepler plays: races, classes, the seven skill slots, elements and combos, skill growth from Common to Mythic, characters, and the roadmap.",
};

const HERO_SKILLS = ["class.pyromancer.t", "race.frostvein.q", "class.warden.r", "race.galeward.q"];

const REACTION: Record<Reaction, { cell: string; label: string }> = {
  break: { cell: "bg-accent-3 text-accent-ink", label: "break" },
  fuse: { cell: "bg-accent-2 text-white", label: "fuse" },
  weak: { cell: "bg-panel", label: "weak" },
  same: { cell: "bg-bg", label: "same" },
};

const ROAD: Record<RoadState, { head: string; mark: string }> = {
  done: { head: "bg-accent-2 text-white", mark: "✓" },
  now: { head: "bg-accent text-accent-ink", mark: "●" },
  next: { head: "bg-accent-3 text-accent-ink", mark: "→" },
  later: { head: "bg-panel", mark: "·" },
};

const HOTBAR_FILL: Record<string, string> = {
  Race: "bg-accent text-accent-ink",
  Class: "bg-accent-3 text-accent-ink",
  Weapon: "bg-panel",
};

const GESTURE: Record<string, string> = {
  Q: "Drop key",
  E: "Sneak + drop",
  R: "Sneak + swap-hands",
  T: "Sneak + left click",
  Z: "Right click",
  X: "Sneak + right click",
  C: "Swap-hands key",
};

function H3({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`display text-2xl ${className}`}>{children}</h3>;
}

export default function WikiHome() {
  const heroSkills = HERO_SKILLS.map((id) => getAbility(id)).filter((a) => !!a);
  const gifCount = abilities.length * 5;

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-14 sm:px-8 sm:pt-16 sm:pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="inline-block slab bg-accent-2 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-white">
              The Kepler wiki
            </p>
            <h1 className="display mt-6 text-5xl sm:text-6xl lg:text-7xl">Race. Class. Gear. Seven keys.</h1>
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed sm:text-xl">
              How Kepler plays, from the first character you make to a Mythic skill at level 100: the ten biome races, the fifteen
              classes, elements that combine into combos, and skills that grow only by being used.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/wiki/abilities/" className="slab slab-press bg-accent px-6 py-3 font-semibold uppercase tracking-wide text-accent-ink">
                Browse {abilities.length} abilities
              </Link>
              <a href="#how" className="slab slab-press bg-panel px-6 py-3 font-semibold uppercase tracking-wide">
                How it plays
              </a>
              <a href="#roadmap" className="slab slab-press bg-panel px-6 py-3 font-semibold uppercase tracking-wide">
                Roadmap
              </a>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-4" aria-label="Four Mythic skills">
            {heroSkills.map((a, i) => (
              <li key={a.id} className={i % 2 === 1 ? "translate-y-4" : ""}>
                <Link href={abilityHref(a.id)} className="slab slab-press block overflow-hidden">
                  <span className="block bg-ink">
                    <Image
                      src={mediaSrc(a.stages[4].gif)}
                      alt={`${a.stages[4].name}, the Mythic form of ${a.name}: animated preview`}
                      width={GIF_W}
                      height={GIF_H}
                      unoptimized
                      priority={i < 2}
                      className="block h-auto w-full"
                    />
                  </span>
                  <span className="flex items-center gap-2 border-t-[length:var(--bw)] border-ink px-2.5 py-2">
                    <SlotKey slot={a.slot} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{a.stages[4].name}</span>
                      <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">{a.ownerName}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["10", "biome races"],
            ["15", "classes"],
            ["7", "skill slots"],
            [String(abilities.length), "race & class skills"],
            ["100", "levels per skill"],
            [String(gifCount), "stage previews"],
          ].map(([n, l]) => (
            <div key={l} className="slab p-3">
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="display block text-3xl sm:text-4xl">{n}</span>
                <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 01 How Kepler plays ──────────────────────────────────────────── */}
      <Section
        id="how"
        kicker="01 / How Kepler plays"
        title="Gear first, then who you are"
        tagline="Kepler is a sandbox: what you wear is what you are, everything worn was crafted by a player, and in red and black ground it can all be lost."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4 text-lg leading-relaxed">
            <p>
              Power comes from gear. Item power and the Destiny Board are the long grind; a full tier step of gear is worth far more
              than anything your race or class gives. Race and class are flavour with trade-offs: they decide <em>how</em> you fight,
              not whether you can.
            </p>
            <p>
              When you make a character you pick a <strong>race</strong>, then a <strong>class</strong>. Both are permanent for that
              character, every pairing is allowed, and a different combination is simply another character on the same account.
            </p>
            <p className="text-base opacity-80">
              Race gives the two keys you have from minute one, your elemental identity. Class gives the two highest-impact keys.
              The weapon in your hand gives the other three.
            </p>
          </div>
          <ol className="grid gap-3">
            {coreLoop.map((s, i) => (
              <li key={s.step} className="slab flex items-baseline gap-4 p-3">
                <span className="font-mono text-xs opacity-60">0{i + 1}</span>
                <span className="display text-lg">{s.step}</span>
                <span className="text-sm opacity-80">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* A character = race + class + weapon, each feeding its slots. */}
        <div className="mt-12 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          {[
            { src: "Race", fill: "bg-accent text-accent-ink", slots: ["Q", "E"] as const, text: "10 biome races. Two skills in the race's two elements, four passives, one knack." },
            { src: "Class", fill: "bg-accent-3 text-accent-ink", slots: ["R", "T"] as const, text: "15 classes. A signature skill, an ultimate, a stat profile, weapon rules and talents." },
            { src: "Weapon", fill: "bg-panel", slots: ["Z", "X", "C"] as const, text: "Whatever you hold. A strike, the weapon's signature, and one technique or armour skill." },
          ].map((b, i) => (
            <div key={b.src} className="contents">
              {i > 0 && (
                <span aria-hidden="true" className="display hidden self-center text-4xl md:block">
                  +
                </span>
              )}
              <div className={`slab p-5 ${b.fill}`}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-80">{b.src}</p>
                <div className="mt-3 flex gap-2">
                  {b.slots.map((s) => (
                    <SlotKey key={s} slot={s} />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-snug">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 02 Seven slots ───────────────────────────────────────────────── */}
      <Section
        id="slots"
        kicker="02 / The skill bar"
        title="Seven slots: Q E R T Z X C"
        tagline="A Paper server never sees the keyboard, so skill mode turns the hotbar into the skill bar: keys 1 to 7 cast, the weapon stays in slot 9."
      >
        <figure>
          <div className="slab bg-ink p-3 sm:p-4">
            <ol className="grid grid-cols-3 gap-2 sm:grid-cols-9 sm:gap-2.5" aria-label="Skill-mode hotbar">
              {SLOTS.map((s) => {
                const info = SLOT_INFO[s];
                return (
                  <li key={s} className={`relative border-[length:var(--bw)] border-bg p-2 ${HOTBAR_FILL[info.source]}`}>
                    <span className="absolute right-1.5 top-1 font-mono text-[10px] opacity-70">{info.hotbar}</span>
                    <span className="display block text-4xl leading-none">{s}</span>
                    <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em]">{info.source}</span>
                    <span className="mt-0.5 block text-[11px] leading-tight">{info.long}</span>
                  </li>
                );
              })}
              <li className="relative border-[length:var(--bw)] border-dashed border-bg p-2 text-bg">
                <span className="absolute right-1.5 top-1 font-mono text-[10px] opacity-70">8</span>
                <span className="display block text-2xl leading-none">Pot</span>
                <span className="mt-2 block text-[11px] leading-tight opacity-80">First potion; sneak + 8 eats food</span>
              </li>
              <li className="relative border-[length:var(--bw)] border-dashed border-bg p-2 text-bg">
                <span className="absolute right-1.5 top-1 font-mono text-[10px] opacity-70">9</span>
                <span className="display block text-2xl leading-none">Wpn</span>
                <span className="mt-2 block text-[11px] leading-tight opacity-80">Your weapon, always selected; left click attacks</span>
              </li>
            </ol>
          </div>
          <figcaption className="mt-3 text-sm opacity-80">
            Skill mode toggles with the swap-hands key. Race slots in yellow, class slots in red, weapon slots in white. T fires
            only at 100 ultimate charge.
          </figcaption>
        </figure>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="slab p-5">
            <H3>What goes in each slot</H3>
            <Bullets
              className="mt-4"
              items={[
                <>
                  <strong>Q</strong> race skill in the primary element, cooldown 8–12 s; <strong>E</strong> race utility in the secondary
                  element, 20–30 s. Both work with any item or an empty hand.
                </>,
                <>
                  <strong>R</strong> the class signature, 12–18 s, from class level 1. <strong>T</strong> the ultimate, from class level
                  20, needs 100 charge.
                </>,
                <>
                  <strong>Z</strong> a strike (pick 1 of the family&rsquo;s 3), <strong>X</strong> the held weapon&rsquo;s fixed signature,{" "}
                  <strong>C</strong> one pick from your worn armour skills and the family&rsquo;s techniques. Class weapons fix Z and X.
                </>,
              ]}
            />
          </div>
          <div className="slab p-5">
            <H3>Gesture mode</H3>
            <p className="mt-2 text-sm opacity-80">No hotbar takeover: the same casts from mouse and keys, with the weapon held.</p>
            <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
              {SLOTS.map((s) => (
                <div key={s} className="contents">
                  <dt>
                    <SlotKey slot={s} size="sm" />
                  </dt>
                  <dd className="self-center font-medium">{GESTURE[s]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] opacity-70">Fallback: /cast q|e|r|t|z|x|c</p>
          </div>
        </div>
      </Section>

      {/* ── 03 Races ─────────────────────────────────────────────────────── */}
      <Section
        id="races"
        kicker="03 / Races"
        title="Ten races, one per biome"
        tagline="A race is an element pair and a homeland. No race is strictly better: each has one combat passive, one defensive or utility passive and two economy or travel passives."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="slab bg-accent p-5 text-accent-ink lg:col-span-2">
            <H3>Home ground</H3>
            <Bullets
              className="mt-4 text-base"
              items={[
                "Standing in a tile of your home biome, your passives use their home value (about 1.5× the base) and Q and E cooldowns are 10 % shorter.",
                "The home bonus switches off in arenas and duels, inside dungeons, and on any tile at Blight level 2 or higher: to get it back, cleanse your homeland.",
                "The racial track (0 to 50) raises passives by up to 50 %; track XP is ×1.5 when earned at home.",
                "Race skills are openers and utilities, not nukes: a Q deals 70–130 coef. The 20 race skills split evenly: 5 Water, 5 Fire, 5 Air, 5 Earth.",
              ]}
            />
          </div>
          <div className="slab p-5">
            <H3>The knack</H3>
            <p className="mt-3 text-sm leading-relaxed">
              Every race also has one out-of-combat helper, cast with <code className="font-mono">/race knack</code>. It takes no slot,
              has no element and does not level: a pack ox for the Galeward, for example.
            </p>
          </div>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {wikiRaces.map((r) => {
            const [q, e] = r.abilities.map((id) => getAbility(id));
            return (
              <li key={r.id}>
                <Link href={`/wiki/races/${r.id}/`} className="slab slab-press flex h-full flex-col overflow-hidden">
                  <span aria-hidden="true" className="block h-2.5 border-b-[length:var(--bw)] border-ink" style={{ background: r.color }} />
                  <span className="flex flex-1 flex-col p-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">{titleCase(r.homeBiome)}</span>
                    <span className="display mt-1.5 text-lg">{r.name}</span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      <ElementTag element={r.primary} />
                      <ElementTag element={r.secondary} />
                    </span>
                    <span className="mt-3 block text-xs leading-snug opacity-80">{r.niche}</span>
                    <span className="mt-auto block space-y-1 pt-3 text-xs">
                      <span className="block">
                        <strong className="font-mono">Q</strong> {q?.name}
                      </span>
                      <span className="block">
                        <strong className="font-mono">E</strong> {e?.name}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ── 04 Classes ───────────────────────────────────────────────────── */}
      <Section
        id="classes"
        kicker="04 / Classes"
        title="Fifteen permanent classes"
        tagline="A class is an order with a hall in one of the cities. It brings a stat profile, rules for every weapon family, two or three exclusive weapons, an R signature skill, a T ultimate and a talent tree."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="slab p-5">
            <H3>The stat profile</H3>
            <p className="mt-3 leading-relaxed">
              Every class has buffs worth about <strong>+30 points</strong> and debuffs worth about <strong>−18</strong> on a shared price
              list, so each is roughly +6 % stronger in its niche and weaker outside it. The profile multiplies on top of gear, so a
              debuff costs exactly what it says.
            </p>
            <p className="mt-3 text-sm opacity-80">
              Buffs scale from 70 % at class level 1 to 100 % at level 21; debuffs are always 100 %. Race + class + talents are capped
              at +35 % on any one core stat (the synergy ceiling, not built yet).
            </p>
          </div>
          <div className="slab p-5">
            <H3>Levels 1 to 60, then Paragon</H3>
            <ol className="mt-4 grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              {[
                ["L1", "Class weapon, R signature skill, stat profile at 70 %"],
                ["L10", "Second weapon (quest), talent tree opens"],
                ["L20", "T ultimate unlocked (Trial quest), buffs at 100 %"],
                ["L40", "A free evolution roll for T"],
                ["L60", "Another free roll for T, class Paragon unlocked"],
                ["P", "Every 4,000 XP a Paragon rank; every 3 ranks a talent point (max +10)"],
              ].map(([l, t]) => (
                <div key={l} className="contents">
                  <span className="display text-lg">{l}</span>
                  <span className="self-center">{t}</span>
                </div>
              ))}
            </ol>
          </div>
        </div>

        <H3 className="mt-12">Weapon families: four rules</H3>
        <p className="mt-3 max-w-[64ch] opacity-80">
          Each class sorts the 15 general weapon families (swords to cursed staffs) into Allowed, Penalized and Forbidden. Another
          class&rsquo;s exclusive weapon is always Forbidden.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weaponRules.map((w) => (
            <li key={w.rule} className="slab overflow-hidden">
              <p className={`display border-b-[length:var(--bw)] border-ink px-4 py-2 text-lg ${w.tone}`}>{w.rule}</p>
              <p className="p-4 text-sm leading-snug">{w.text}</p>
            </li>
          ))}
        </ul>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wikiClasses.map((c) => {
            const r = getAbility(`class.${c.id}.r`);
            const t = getAbility(`class.${c.id}.t`);
            return (
              <li key={c.id}>
                <Link href={`/wiki/classes/${c.id}/`} className="slab slab-press flex h-full overflow-hidden">
                  <span aria-hidden="true" className="block w-3 shrink-0 border-r-[length:var(--bw)] border-ink" style={{ background: c.color }} />
                  <span className="block flex-1 p-4">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="display text-xl">{c.name}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{c.role}</span>
                    </span>
                    <span className="mt-3 block space-y-1.5 text-sm">
                      {[r, t].map((a) =>
                        a ? (
                          <span key={a.id} className="flex flex-wrap items-center gap-2">
                            <SlotKey slot={a.slot} size="sm" /> {a.name} <ElementTag element={a.element} />
                          </span>
                        ) : null,
                      )}
                    </span>
                    <span className="mt-3 block text-xs opacity-70">{c.weapons.map((w) => w.name).join(" · ")}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ── 05 Elements ──────────────────────────────────────────────────── */}
      <Section
        id="elements"
        kicker="05 / Elements"
        title="Four Currents, four statuses"
        tagline="Every Q, E, R and T has exactly one element. Elements leave statuses, and the next hit reacts to what is already there, including another player's hit."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {elementStatuses.map((e) => (
            <li key={e.element} className="slab p-4">
              <div className="flex items-center justify-between gap-2">
                <ElementChip element={e.element} />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">leaves</span>
              </div>
              <p className="display mt-3 text-2xl">{e.status}</p>
              <p className="mt-2 text-sm leading-snug">{e.does}</p>
              <p className="mt-3 border-t-2 border-ink pt-2 text-xs">
                Breaks <strong>{e.breaks}</strong> · fuses with <strong>{e.fuses}</strong>
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 slab bg-ink p-4 text-bg sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">The wheel</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
            {(["Water", "Fire", "Earth", "Air", "Water"] as const).map((el, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="font-mono text-sm text-accent">
                    breaks →
                  </span>
                )}
                <ElementChip element={el} />
              </span>
            ))}
          </p>
          <p className="mt-3 text-sm opacity-90">
            Opposites fuse into combos: Water + Earth and Fire + Air. One named combo can hit the same target once every 6 s.
          </p>
        </div>

        <H3 className="mt-12">The interaction table</H3>
        <p className="mt-3 max-w-[64ch] opacity-80">
          Rows: the element of the skill that hits. Columns: the status already on the target. At most one reaction per hit, by
          priority break, fuse, weak, same.
        </p>
        <div className="mt-6 -mx-5 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[46rem] border-separate border-spacing-2 text-left">
            <caption className="sr-only">Element reactions: skill element against the status on the target</caption>
            <thead>
              <tr>
                <th scope="col" className="p-2 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">
                  Hit ↓ / On target →
                </th>
                {statusOrder.map((s) => (
                  <th key={s} scope="col" className="border-[length:var(--bw)] border-ink bg-ink p-2 text-bg">
                    <span className="display text-base">{s}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["Water", "Fire", "Earth", "Air"] as const).map((el) => (
                <tr key={el}>
                  <th scope="row" className="p-2 align-middle">
                    <ElementChip element={el} />
                  </th>
                  {interactions[el].map((x, i) => (
                    <td key={i} className={`border-[length:var(--bw)] border-ink p-3 align-top ${REACTION[x.type].cell}`}>
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="display text-base">{x.name}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-80">{REACTION[x.type].label}</span>
                      </span>
                      <span className="mt-1 block text-xs leading-snug">{x.text}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 flex flex-wrap gap-3 text-xs" aria-label="Legend">
          {(Object.keys(REACTION) as Reaction[]).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span aria-hidden="true" className={`inline-block h-3.5 w-5 border-2 border-ink ${REACTION[k].cell}`} />
              <span>
                <strong className="uppercase">{k}</strong>
                {k === "break" && ": the hitting element wins, bonus and the status is removed"}
                {k === "fuse" && ": opposite elements combine"}
                {k === "weak" && ": the hitting element is the one that breaks, the hit is reduced"}
                {k === "same" && ": refresh only"}
              </span>
            </li>
          ))}
        </ul>
        <Bullets
          className="mt-6 max-w-[80ch]"
          items={[
            "Friendly use cleanses: a friendly Water effect removes Burning, Fire removes Rooted, Earth ends Airborne, Air removes Soaked.",
            "Combos work between players: one player's Soaked plus another player's Air skill is a Stormshock. That is the group-play hook.",
            "Most weapon skills are Neutral and never react; the Fire, Frost and Nature staffs and the Pyromancer, Cryomancer and Druid class weapons carry their element.",
            "Calamity aspects bend the table: Ashen Hollowborn are Burning-immune, Drowned ones are permanently Soaked, Thorned ones cannot be Rooted.",
          ]}
        />
      </Section>

      {/* ── 06 Skill growth ──────────────────────────────────────────────── */}
      <Section
        id="growth"
        kicker="06 / Skill growth"
        title="Skills grow by being used"
        tagline="Every skill, all seven slots, has its own level from 1 to 100 and a tier from Common to Mythic, per character. It levels only from real use in a real fight."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="slab p-5">
            <H3>Skill XP</H3>
            <p className="mt-3 slab bg-ink px-3 py-2 font-mono text-sm text-bg">
              XP = 10 × cooldown × target × repeat × cap × blight
            </p>
            <Bullets
              className="mt-4"
              items={[
                "Long-cooldown skills earn more per cast (√(cooldown / 10), 0.5–3; ultimates 4), so every skill levels at a similar pace.",
                "Only targets that can fight back count: no training dummies, passive or spawner mobs, nothing in a city or your own town.",
                "Hitting the same target again gives 100, 70, 40, 20, then 0 %. A daily soft cap per skill halves XP after 4,000.",
                "Blighted land trains faster: +10 % per Blight level from level 2.",
                "Level 100 takes 199,485 XP, about 55–60 hours of active use of that one skill.",
              ]}
            />
          </div>
          <div className="slab bg-accent p-5 text-accent-ink">
            <H3>What a level gives</H3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">Per level</dt>
                <dd className="display text-2xl">+0.25 % effect</dd>
                <dd className="text-sm">damage, healing, shields, buffs: +24.75 % at 100</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">Per level</dt>
                <dd className="display text-2xl">−0.1 % cooldown</dd>
                <dd className="text-sm">−9.9 % at 100; energy cost never changes</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">Never</dt>
                <dd className="text-sm">CC durations do not scale. Against players, level and tier bonuses count 50 %.</dd>
              </div>
            </dl>
          </div>
        </div>

        <H3 className="mt-12">Five tiers, Common to Mythic</H3>
        <p className="mt-3 max-w-[64ch] opacity-80">
          From its gate level on, a skill rolls to evolve into the next tier, four rolls per level. Every level above the gate and
          every failed roll raise the chance; the 60th roll always succeeds. A skill never drops a tier.
        </p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {growthTiers.map((t, i) => (
            <li key={t.name} className="slab flex flex-col overflow-hidden">
              <div className="border-b-[length:var(--bw)] border-ink px-4 py-3" style={{ background: t.color }}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                  {i === 0 ? "from level 1" : `rolls from level ${t.gate}`}
                </p>
                <p className="display mt-1 text-2xl text-ink">{t.name}</p>
              </div>
              <dl className="grid grid-cols-2 gap-2 border-b-2 border-ink p-4 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">Effect</dt>
                  <dd className="font-mono font-semibold">{t.mult}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">Cooldown</dt>
                  <dd className="font-mono font-semibold">{t.cd}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">Chance per roll at the gate</dt>
                  <dd className="font-mono font-semibold">{t.chance}</dd>
                </div>
              </dl>
              <p className="p-4 pb-2 text-sm leading-snug">{t.adds}</p>
              <p className="mt-auto px-4 pb-4 text-xs leading-snug">
                <span className="mr-1 inline-block h-2.5 w-2.5 border-2 border-ink align-middle" style={{ background: t.color }} aria-hidden="true" />
                {t.visual}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-5 slab inline-flex max-w-full flex-wrap gap-x-2 bg-ink px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-bg">
          <span>chance = base × (1 + 0.05 × levels past gate) × (1 + 0.10 × failed rolls)</span>
          <span className="text-accent">· Mythic L100 = ×1.52 of base effect in PvE</span>
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="slab p-5">
            <H3>Epic and Mythic forms</H3>
            <p className="mt-3 text-sm leading-relaxed">
              At Epic a skill takes a new name and one extra mechanic; at Mythic a second one. Race skills and class R skills have
              their own forms, ultimates use their &ldquo;rank 2&rdquo; numbers at Epic and a shorter lockout after, and weapon skills
              take a generic form by kind (a damage strike gains 20 % splash at Epic and a guaranteed crit every third cast at Mythic).
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              <strong>Visuals grow too.</strong> Every cast carries a visual power from its level and tier: more and denser particles,
              more and bigger moving blocks, element rings at levels 25, 50 and 75. Tiers add their layer: Rare a{" "}
              <span className="bg-[#4aa3ff] px-1 text-ink">blue</span> glowing outline, Epic a{" "}
              <span className="bg-[#b45cff] px-1 text-ink">purple</span> helix, Legendary an{" "}
              <span className="bg-[#ffa024] px-1 text-ink">orange</span> double shockwave, Mythic a{" "}
              <span className="bg-[#ff3d5a] px-1 text-ink">crimson</span> aura. Only visuals scale; hitboxes do not.
            </p>
            <Link href="/wiki/abilities/" className="mt-4 inline-block ul-link font-semibold">
              See every skill at all five stages →
            </Link>
          </div>
          <div className="slab p-5">
            <H3>Milestone modifiers</H3>
            <p className="mt-2 text-sm opacity-80">
              At four levels you pick one of two. At Legendary an extra slot lets you hold both choices of one milestone.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className="py-1.5 pr-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">
                      Level
                    </th>
                    <th scope="col" className="py-1.5 pr-3 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">
                      Choice A
                    </th>
                    <th scope="col" className="py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">
                      Choice B
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m) => (
                    <tr key={m.level} className="border-b border-ink/30 align-top">
                      <th scope="row" className="display py-2 pr-3 text-lg">
                        {m.level}
                      </th>
                      <td className="py-2 pr-3">{m.a}</td>
                      <td className="py-2">{m.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 07 Ultimates and characters ──────────────────────────────────── */}
      <Section
        id="characters"
        kicker="07 / Ultimates & characters"
        title="Charge the T, play many lives"
        tagline="The ultimate is earned in the fight; the character is a whole second life on the same account."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="slab p-5">
            <div className="flex items-center gap-3">
              <SlotKey slot="T" />
              <H3>Ultimate charge</H3>
            </div>
            <div className="mt-5" aria-hidden="true">
              <div className="h-5 border-[length:var(--bw)] border-ink bg-panel">
                <div className="h-full w-[74%] bg-accent-3" />
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">ULT 74 %</p>
            </div>
            <Bullets
              className="mt-4"
              items={[
                "Charge runs 0 to 100. Each class charges from its own job: damage dealt, damage taken, healing, crowd control or buffs on allies.",
                "Tuned for one ultimate per ~90 s of continuous fighting, with a hard lockout of 60 s (Legendary 55 s, Mythic 50 s).",
                "Charge decays 2 per second after 15 s out of combat and resets on death. PvP charge gain ×0.75; weak mobs give none.",
              ]}
            />
          </div>
          <div className="slab p-5">
            <H3>Several characters per account</H3>
            <div className="mt-4 flex gap-2" aria-hidden="true">
              {["Free", "Free", "Free", "1M", "5M"].map((s, i) => (
                <span
                  key={i}
                  className={`flex h-14 flex-1 items-center justify-center border-[length:var(--bw)] border-ink font-mono text-xs font-semibold ${
                    i < 3 ? "bg-accent text-accent-ink" : "border-dashed bg-panel"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm">
              Three free slots; a fourth for 1,000,000 silver and a fifth for 5,000,000. Each character has its own name, race, class,
              inventory, skill levels and quests.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Per character</p>
                <Bullets className="mt-2" items={["Race, class, talents", "Inventory, bank, silver", "Skill levels and tiers", "Quests, guild, town"]} />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-60">Per account</p>
                <Bullets className="mt-2" items={["Focus and daily bonus", "Account Vault per city", "Cosmetics and titles", "One vote in elections"]} />
              </div>
            </div>
            <p className="mt-4 text-xs opacity-75">
              Switching is allowed in a city, your own town or an inn, out of combat, with a 10 s channel and a 5 minute cooldown, so
              characters cannot scout or dodge a fight.
            </p>
          </div>
        </div>
      </Section>

      {/* ── 08 Roadmap ───────────────────────────────────────────────────── */}
      <Section
        id="roadmap"
        kicker="08 / Roadmap"
        title="What is built, and what is not"
        tagline="Kepler is not playable yet. Only the first column is built; everything else is designed and waiting."
      >
        <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {wikiRoadmap.map((col, ci) => (
            <li key={col.state} className="relative">
              {ci < wikiRoadmap.length - 1 && (
                <span aria-hidden="true" className="display absolute -right-5 top-3 z-10 hidden text-2xl xl:block">
                  →
                </span>
              )}
              <section aria-labelledby={`road-${col.state}`} className="slab flex h-full flex-col overflow-hidden">
                <div className={`border-b-[length:var(--bw)] border-ink px-4 py-3 ${ROAD[col.state].head}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 id={`road-${col.state}`} className="display text-xl">
                      <span aria-hidden="true">{ROAD[col.state].mark} </span>
                      {col.title}
                    </h3>
                    <span className="font-mono text-xs">{col.items.length}</span>
                  </div>
                  <p className="mt-1 text-xs">{col.blurb}</p>
                </div>
                <ol className="flex-1 divide-y-2 divide-ink/15 p-4">
                  {col.items.map((it) => (
                    <li key={it.name} className="py-2.5 first:pt-0 last:pb-0">
                      <p className="font-semibold leading-tight">{it.name}</p>
                      <p className="mt-0.5 text-sm leading-snug opacity-80">{it.text}</p>
                    </li>
                  ))}
                </ol>
              </section>
            </li>
          ))}
        </ol>
        <p className="mt-8 flex flex-wrap items-center gap-2 text-sm opacity-80">
          <Chip tone="accent2">✓ done</Chip> means built and run on the local demo server with the bot test. Nothing has met real players
          yet.
        </p>
      </Section>

      {/* ── jump-off ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 rule">
        <div className="slab bg-accent-2 p-6 text-white sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">Go deeper</p>
          <p className="display mt-3 text-3xl sm:text-4xl">Every skill at every stage</p>
          <p className="mt-3 max-w-[56ch]">
            Filter all {abilities.length} abilities by class, race, slot and element, and watch each one grow from Common to Mythic.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/wiki/abilities/" className="slab slab-press bg-accent px-6 py-3 font-semibold uppercase tracking-wide text-accent-ink">
              Open the abilities
            </Link>
            {wikiClasses.slice(0, 3).map((c) => (
              <Link key={c.id} href={`/wiki/classes/${c.id}/`} className="slab slab-press inline-flex items-center gap-2 bg-panel px-4 py-3 font-semibold text-ink">
                <Swatch color={c.color} /> {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
