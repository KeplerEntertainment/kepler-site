/**
 * Copy and tables for the wiki home, sourced from the Kepler design docs (Keplah docs/REWORK.md, docs/CLASSES.md,
 * docs/DEMO.md). Section numbers are kept next to each block so a doc change is easy to trace here.
 */
import type { Element } from "@/lib/content";

export type Reaction = "break" | "fuse" | "weak" | "same";

/** REWORK §2.4: the four elements and the status each leaves. */
export const elementStatuses: {
  element: Element;
  status: string;
  does: string;
  breaks: Element;
  fuses: Element;
}[] = [
  { element: "Water", status: "Soaked", does: "6 s. −10 % move speed. A Soaked target cannot gain Burning.", breaks: "Fire", fuses: "Earth" },
  {
    element: "Fire",
    status: "Burning",
    does: "4 s. 30 coef per second, −15 % healing received. Refreshed, not stacked (Pyromancer stacks to 3).",
    breaks: "Earth",
    fuses: "Air",
  },
  { element: "Earth", status: "Rooted", does: "Cannot move, can still attack and cast. Duration per skill. Hard CC.", breaks: "Air", fuses: "Water" },
  { element: "Air", status: "Airborne", does: "Lifted off the ground, cannot act. 0.5–0.8 s per skill. Hard CC.", breaks: "Water", fuses: "Fire" },
];

export const statusOrder = ["Soaked", "Burning", "Rooted", "Airborne"] as const;

/** REWORK §2.5: rows = element of the skill that hits, columns = status already on the target. */
export const interactions: Record<Element, { name: string; type: Reaction; text: string }[]> = {
  Water: [
    { name: "Refresh", type: "same", text: "Soaked duration is refreshed." },
    { name: "Douse", type: "break", text: "Burning is removed. On an ally or yourself this is a cleanse." },
    { name: "Overgrowth", type: "fuse", text: "Rooted lasts +0.5 s (once per root)." },
    { name: "Scattered", type: "weak", text: "−20 % damage, no Soaked applied." },
  ],
  Fire: [
    { name: "Quench", type: "weak", text: "−25 % damage, no Burning. Soaked is consumed." },
    { name: "Refresh", type: "same", text: "Burning duration is refreshed." },
    { name: "Brushfire", type: "break", text: "+20 % damage. The roots burn away: Rooted ends." },
    { name: "Skyfire", type: "fuse", text: "+15 % damage; the Burning it applies lasts +2 s." },
  ],
  Earth: [
    { name: "Mire", type: "fuse", text: "Slowed 40 % for 2 s. Soaked is consumed." },
    { name: "Baked", type: "weak", text: "−20 % damage. Burning stays." },
    { name: "Refresh", type: "same", text: "No extension; normal CC diminishing returns." },
    { name: "Slam", type: "break", text: "+25 % damage. Airborne ends, knocked down 0.5 s." },
  ],
  Air: [
    { name: "Stormshock", type: "break", text: "+20 % damage and a 0.4 s stun. Soaked is consumed." },
    { name: "Wildfire", type: "fuse", text: "Burning spreads to enemies within 3 blocks, refreshed on all." },
    { name: "Anchored", type: "weak", text: "−20 % damage; cannot lift or knock back." },
    { name: "Juggle", type: "same", text: "No new lift. +10 % damage." },
  ],
};

/** REWORK §5.5 + core SkillTier (cooldown factor) + DEMO §3 (tier visuals). */
export const growthTiers = [
  { name: "Common", gate: 1, mult: "×1.00", cd: "×1.00", chance: "—", color: "#9aa0a6", adds: "The skill as written.", visual: "Base visuals as designed." },
  {
    name: "Rare",
    gate: 20,
    mult: "×1.05",
    cd: "×1.00",
    chance: "5 %",
    color: "#4aa3ff",
    adds: "Its Soaked or Burning lasts 20 % longer.",
    visual: "Blue glowing outline on every moving block, a ring of sparks.",
  },
  {
    name: "Epic",
    gate: 40,
    mult: "×1.10",
    cd: "×1.00",
    chance: "3 %",
    color: "#b45cff",
    adds: "Epic form: a new name and one extra mechanic.",
    visual: "A purple tier helix, more and bigger blocks.",
  },
  {
    name: "Legendary",
    gate: 60,
    mult: "×1.16",
    cd: "×0.95",
    chance: "2 %",
    color: "#ffa024",
    adds: "−5 % cooldown, an extra milestone-modifier slot.",
    visual: "An orange double shockwave and an end-rod sphere.",
  },
  {
    name: "Mythic",
    gate: 80,
    mult: "×1.22",
    cd: "×0.90",
    chance: "1.2 %",
    color: "#ff3d5a",
    adds: "−10 % cooldown, Mythic form: a second extra mechanic.",
    visual: "A crimson orbiting aura, totem sparkle and fireworks.",
  },
];

/** REWORK §5.4. */
export const milestones = [
  { level: 10, a: "Reach: +15 % range or radius", b: "Thrift: −20 % energy cost" },
  { level: 25, a: "Haste: −8 % cooldown", b: "Force: +6 % effect" },
  { level: 50, a: "Depth: its status lasts +1 s, combos +5 pp", b: "Echo: 15 % chance a cast refunds 30 % of its cooldown" },
  { level: 75, a: "Resolve: cannot be interrupted or lifted while casting it", b: "Surge: +10 % move speed for 3 s after it triggers a combo" },
];

/** CLASSES §1.3: the four weapon rules. */
export const weaponRules = [
  {
    rule: "Exclusive",
    tone: "bg-ink text-bg",
    text: "The class's own weapons: full kit, class passive on, class item-power bonus, 100 % class XP.",
  },
  { rule: "Allowed", tone: "bg-accent-2 text-white", text: "No penalty; +0.2 IP per class level (max +12); 100 % class XP; profile fully active." },
  {
    rule: "Penalized",
    tone: "bg-accent text-accent-ink",
    text: "−15 % damage and healing, +15 % cooldowns on its Z, X and C, 50 % class XP, profile buffs at 50 %.",
  },
  {
    rule: "Forbidden",
    tone: "bg-accent-3 text-accent-ink",
    text: "Can be held, but its Z, X and C cannot be cast, nor R and T while it is held; auto-attack −50 %, no XP, no charge.",
  },
];

export type RoadState = "done" | "now" | "next" | "later";

/** The build's honest state, as of October 2026. Only the "done" column is built and tested. */
export const wikiRoadmap: { state: RoadState; title: string; blurb: string; items: { name: string; text: string }[] }[] = [
  {
    state: "done",
    title: "Done",
    blurb: "Built, and exercised on the local demo server.",
    items: [
      { name: "KeplerCore", text: "Characters, the skill framework, elements and statuses, the shared Fx visual library and the recorder." },
      { name: "kepler-races rework", text: "10 biome races, 20 race skills, knacks and racial talents." },
      {
        name: "kepler-classes",
        text: "15 classes, 129 skills, talents, class levels 1–60 plus Paragon, ultimate charge, weapon-family rules and the GUIs.",
      },
      { name: "Skill growth", text: "Levels, tiers and evolution rolls, in the core." },
      { name: "Skill visuals", text: "Moving blocks, particles, and visuals that scale with level and tier." },
      { name: "Demo tooling and bot test", text: "Showcase commands and an automated bot: 149 skills cast, 0 errors." },
      { name: "Ability wiki", text: "This wiki: 149 abilities with 745 stage previews." },
    ],
  },
  {
    state: "now",
    title: "In progress",
    blurb: "The rest of the approved rework (REWORK §7), addon by addon.",
    items: [
      { name: "kepler-combat", text: "The C picker for class weapon techniques in /kc spells." },
      { name: "kepler-zones", text: "A biome type per tile and the homeBiome query that turns on home passives." },
      { name: "kepler-calamity", text: "Home bonus off in Blight, skill XP bonus in Blight, racial hooks, aspect immunities." },
      { name: "kepler-mobs", text: "Flags for valid training targets, tier exposure for the XP rule, status immunities." },
      { name: "kepler-progression", text: "Fame, Destiny Board and Learning Points per character." },
      { name: "kepler-items", text: "Ghost-item models for the seven slots, element and tier glyphs." },
      { name: "Quests and dialogue", text: "Quest and dialogue state per character; racial lines re-keyed to the 10 races." },
      { name: "Guilds, war, towns, market", text: "Membership, residency and orders per character; votes and slots per account." },
    ],
  },
  {
    state: "next",
    title: "Next",
    blurb: "The class content around the skills, then real players.",
    items: [
      { name: "Class quest lines", text: "Class I to V for all fifteen classes." },
      { name: "Class Halls and trainers", text: "Hall areas and trainer NPCs in the five cities." },
      { name: "Class weapon recipes", text: "Crafting recipes for the 33 class weapons." },
      { name: "Destiny Board nodes", text: "Tier chain, Family Mastery and spec nodes for every class weapon." },
      { name: "Synergy ceiling", text: "Race + class + talents capped at +35 % on any one core stat." },
      { name: "First live playtest", text: "Every plugin on one server with real players." },
    ],
  },
  {
    state: "later",
    title: "Later",
    blurb: "Polish and comfort, after the playtest.",
    items: [
      { name: "Resource pack art", text: "Class weapon models and skill icons." },
      { name: "Optional client mod", text: "Real Q E R T Z X C keybinds; comfort only, no advantage." },
      { name: "Seasons", text: "Season pass and per-character seasonal leaderboards." },
    ],
  },
];
