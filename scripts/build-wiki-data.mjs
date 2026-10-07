#!/usr/bin/env node
/**
 * Builds the wiki's data from the Kepler plugin YAML (the private Keplah repo), so the site never needs that repo at
 * build time:
 *
 *   <KEPLAH_DIR>/plugins/kepler-classes/src/main/resources/classes/*.yml   15 classes (R, T, class weapons Z / X / C)
 *   <KEPLAH_DIR>/plugins/kepler-races/src/main/resources/races.yml        10 races (Q, E, passives, knack)
 *
 * Output: data/wiki.generated.json (classes, races, 149 abilities with their five stages). The stage maths mirrors
 * Keplah tools/gen_ability_wiki.py and core SkillTier / SkillMath (REWORK §5.3, §5.5, §9.7).
 *
 * With --media it also copies the stage preview GIFs (docs/wiki/abilities/media/<abilityId>__<tier>.gif, 745 files)
 * into public/wiki/media/, keeping their names.
 *
 * Usage: KEPLAH_DIR=../Keplah node scripts/build-wiki-data.mjs [--media]     (npm run wiki:data / npm run wiki:media)
 * Commit both outputs: the GitHub Pages build has no access to the Keplah repo.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEPLAH = resolve(ROOT, process.env.KEPLAH_DIR ?? "../Keplah");
const CLASS_DIR = join(KEPLAH, "plugins/kepler-classes/src/main/resources/classes");
const RACES = join(KEPLAH, "plugins/kepler-races/src/main/resources/races.yml");
const MEDIA_SRC = join(KEPLAH, "docs/wiki/abilities/media");
const MEDIA_OUT = join(ROOT, "public/wiki/media");
const OUT = join(ROOT, "data/wiki.generated.json");

if (!existsSync(CLASS_DIR) || !existsSync(RACES)) {
  console.error(`Keplah repo not found at ${KEPLAH} (set KEPLAH_DIR).`);
  process.exit(1);
}

// core SkillTier: key, label, gate level, effect multiplier, cooldown factor. Wiki stages sit at levels 1/25/50/75/100.
const TIERS = [
  { key: "common", label: "Common", gate: 1, mult: 1.0, cdf: 1.0, color: "#9aa0a6" },
  { key: "rare", label: "Rare", gate: 20, mult: 1.05, cdf: 1.0, color: "#4aa3ff" },
  { key: "epic", label: "Epic", gate: 40, mult: 1.1, cdf: 1.0, color: "#b45cff" },
  { key: "legendary", label: "Legendary", gate: 60, mult: 1.16, cdf: 0.95, color: "#ffa024" },
  { key: "mythic", label: "Mythic", gate: 80, mult: 1.22, cdf: 0.9, color: "#ff3d5a" },
];
const STAGE_LEVELS = [1, 25, 50, 75, 100];
const VISUAL_LAYERS = {
  common: "Base visuals of the skill (element colours, moving blocks as designed).",
  rare: "Blue glowing outline on every moving block, a blue ring and sparks at your feet, denser particles, a level-25 element ring.",
  epic: "Purple tier helix, an extra helix strand, an extra spinning blade, more and bigger blocks, two level rings.",
  legendary: "Orange double shockwave and an end-rod sphere, three level rings, longer-lasting effects.",
  mythic:
    "Crimson orbiting aura, totem sparkle, fireworks and a resonance sound; the most blocks, the tallest pillars and the densest particles.",
};
// core SkillKind: the generic Epic / Mythic forms of weapon skills (REWORK §5.5), keyed by the skill's first kind.
const GENERIC_FORM = {
  DAMAGE: ["20 % splash to one nearby enemy.", "Every third cast is a guaranteed crit."],
  HEAL: ["20 % of overheal becomes a shield.", "Also removes one debuff."],
  MOBILITY: ["+2 blocks.", "Cooldown -15 %."],
  DEFENCE: ["+0.5 s.", "+10 % move speed while active."],
  CONTROL: ["+1 block radius.", "Targets hit take +5 % damage from you for 3 s."],
};

const plain = (s) => String(s ?? "").replace(/<[^>]+>/g, "");
const hex = (c) => {
  const m = String(c ?? "").match(/#[0-9a-fA-F]{6}/);
  return m ? m[0].toLowerCase() : "#9aa0a6";
};
const lines = (v) => (v == null ? [] : Array.isArray(v) ? v.map(String) : [String(v)]);
const upper = (v) => (v == null ? null : String(v).toUpperCase());
const round = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
const fmt = (n) => n.toFixed(3);

function nameAt(a, ti) {
  const keys = [null, "rareName", "epicName", "legendaryName", "mythicName"];
  let name = a.name;
  for (let i = 1; i <= ti; i++) if (a[keys[i]]) name = a[keys[i]];
  return name;
}

/** Number changes at one stage, as MiniMessage-lite lines (<white> = emphasis). Mirrors gen_ability_wiki.stage_changes. */
function stageChanges(ab, ti, level) {
  const t = TIERS[ti];
  const levelEff = 1 + 0.0025 * (level - 1);
  const levelCd = 1 - 0.001 * (level - 1);
  const out = [];
  if (ab.slot === "T") {
    out.push(`Damage, healing and shields <white>×${fmt(levelEff)}</white> from level ${level} (durations never scale).`);
    out.push(
      [
        "The ultimate as written. Lockout <white>60 s</white>.",
        "Soaked / Burning it applies last <white>20 %</white> longer; if it applies neither, <white>+5 %</white> on its numbers.",
        'Epic form: the ultimate\'s "Rank 2" numbers.',
        "Epic numbers, lockout <white>55 s</white>, an extra milestone-modifier slot.",
        "Epic numbers, lockout <white>50 s</white>, unique visuals.",
      ][ti],
    );
  } else {
    out.push(
      `Effect <white>×${fmt(levelEff * t.mult)}</white> (level ×${fmt(levelEff)}, tier ×${t.mult.toFixed(2)}): damage, healing, shields, buffs.`,
    );
    out.push(
      `Cooldown <white>×${fmt(levelCd * t.cdf)}</white>` +
        (ti >= 1 ? " (−3 % more if it applies neither Soaked nor Burning)" : "") +
        ". CC durations never scale.",
    );
    if (ti === 1 && (ab.applies === "SOAKED" || ab.applies === "BURNING")) {
      out.push(`${ab.applies[0]}${ab.applies.slice(1).toLowerCase()} lasts <white>20 %</white> longer.`);
    }
  }
  const generic = ["Z", "X", "C"].includes(ab.slot) && ab.epicText.length === 0 ? GENERIC_FORM[ab.kind] : null;
  if (ti >= 2) {
    if (generic) out.push(`Generic Epic form (${ab.kind.toLowerCase()}): <white>${generic[0]}</white>`);
    out.push(...ab.epicText);
  }
  if (ti >= 4) {
    if (generic && ab.mythicText.length === 0) out.push(`Generic Mythic form (${ab.kind.toLowerCase()}): <white>${generic[1]}</white>`);
    out.push(...ab.mythicText);
  }
  return out;
}

function ability(base, a) {
  const ab = {
    ...base,
    name: plain(a.name),
    rareName: a["rare-name"] ? plain(a["rare-name"]) : null,
    epicName: a["epic-name"] ? plain(a["epic-name"]) : null,
    legendaryName: a["legendary-name"] ? plain(a["legendary-name"]) : null,
    mythicName: a["mythic-name"] ? plain(a["mythic-name"]) : null,
    element: upper(a.element) ?? "NEUTRAL",
    kind: (upper(String(a.kind ?? "DAMAGE").split(/[\s,|/]+/)[0]) ?? "DAMAGE").replace("DEFENSE", "DEFENCE"),
    applies: upper(a.applies),
    cooldown: base.slot === "T" ? null : (a.cooldown ?? a["cooldown-seconds"] ?? null),
    energy: a.energy ?? null,
    range: a.range ?? null,
    cast: a.cast ?? null,
    target: a.target ?? null,
    text: a.text,
    epicText: a.epicText,
    mythicText: a.mythicText,
  };
  ab.stages = STAGE_LEVELS.map((level, ti) => ({
    tier: TIERS[ti].key,
    label: TIERS[ti].label,
    level,
    color: TIERS[ti].color,
    name: nameAt(ab, ti),
    cooldown:
      ab.cooldown == null ? null : round(ab.cooldown * (1 - 0.001 * (level - 1)) * TIERS[ti].cdf, 2),
    lockout: ab.slot === "T" ? (ti >= 4 ? 50 : ti >= 3 ? 55 : 60) : null,
    changes: stageChanges(ab, ti, level),
    visual: VISUAL_LAYERS[TIERS[ti].key],
    gif: `${ab.id}__${TIERS[ti].key}.gif`,
  }));
  return ab;
}

// ------------------------------------------------------------------------------------------------ classes
const classes = [];
const abilities = [];
const FAMILIES = ["sword", "axe", "mace", "hammer", "spear", "dagger", "quarterstaff", "bow", "crossbow", "fire", "frost", "arcane", "holy", "nature", "cursed"];

for (const f of readdirSync(CLASS_DIR).filter((n) => n.endsWith(".yml")).sort()) {
  const c = parse(readFileSync(join(CLASS_DIR, f), "utf8"));
  const color = hex(c.color);
  const base = { ownerKind: "class", ownerId: c.id, ownerName: plain(c.name), ownerColor: color };
  const cls = (a) => ({
    ...a,
    text: lines(a.text),
    epicText: lines(a["epic-text"]),
    mythicText: lines(a["mythic-text"]),
  });
  const own = [];
  const add = (ab) => {
    abilities.push(ab);
    own.push(ab.id);
  };
  add(ability({ ...base, id: `class.${c.id}.r`, slot: "R", weapon: null, weaponId: null }, cls(c.r)));
  const weapons = [];
  for (const [wid, w] of Object.entries(c.weapons ?? {})) {
    const ids = [];
    for (const s of ["z", "x", "c"]) {
      if (!w[s]) continue;
      const ab = ability({ ...base, id: `class.${c.id}.${wid}.${s}`, slot: s.toUpperCase(), weapon: plain(w.name), weaponId: wid }, cls(w[s]));
      add(ab);
      ids.push(ab.id);
    }
    weapons.push({
      id: wid,
      name: plain(w.name),
      hands: w.hands ?? 1,
      city: w.city ?? null,
      auto: w.auto ?? null,
      lore: lines(w.lore),
      passive: w.passive ? { name: plain(w.passive.name), text: lines(w.passive.text) } : null,
      abilities: ids,
    });
  }
  add(ability({ ...base, id: `class.${c.id}.t`, slot: "T", weapon: null, weaponId: null }, cls(c.t)));
  const allowed = c.families?.allowed ?? [];
  const penalized = c.families?.penalized ?? [];
  classes.push({
    id: c.id,
    name: plain(c.name),
    color,
    order: c.order ?? 100,
    role: c.role ?? "",
    archetype: c.archetype ?? "",
    homeCity: c["home-city"] ?? null,
    skillKind: c["skill-kind"] ?? null,
    summary: lines(c.summary),
    buffs: c.profile?.buffs ?? {},
    debuffs: c.profile?.debuffs ?? {},
    families: { allowed, penalized, forbidden: FAMILIES.filter((x) => !allowed.includes(x) && !penalized.includes(x)) },
    resonantRaces: c["resonant-races"] ?? [],
    charge: c.charge ?? [],
    weapons,
    talents: Object.entries(c.talents ?? {}).map(([id, t]) => ({ id, tier: t.tier ?? 1, name: plain(t.name), text: plain(t.text) })),
    abilities: own,
  });
}
classes.sort((a, b) => a.order - b.order);
// Ability order follows the class order (R, weapons Z / X / C, T), then the races (Q, E).
const order = new Map(classes.map((c, i) => [c.id, i]));
abilities.sort((a, b) => (order.get(a.ownerId) ?? 0) - (order.get(b.ownerId) ?? 0));

// ------------------------------------------------------------------------------------------------ races
const racesYml = parse(readFileSync(RACES, "utf8")).races;
const races = [];
for (const [rid, r] of Object.entries(racesYml)) {
  const color = hex(r.color);
  const base = { ownerKind: "race", ownerId: rid, ownerName: plain(r.name), ownerColor: color, weapon: null, weaponId: null };
  const own = [];
  for (const key of ["q", "e"]) {
    const sk = r.skills[key];
    const desc = lines(sk.description);
    const a = {
      ...sk,
      element: sk.element ?? (key === "q" ? r.primary : r.secondary),
      text: desc.filter((d) => !d.includes("Epic:") && !d.includes("Mythic:")),
      epicText: desc.filter((d) => d.includes("Epic:")),
      mythicText: desc.filter((d) => d.includes("Mythic:")),
    };
    const ab = ability({ ...base, id: `race.${rid}.${key}`, slot: key.toUpperCase() }, a);
    abilities.push(ab);
    own.push(ab.id);
  }
  races.push({
    id: rid,
    name: plain(r.name),
    niche: r.niche ?? "",
    homeBiome: r["home-biome"] ?? "",
    primary: upper(r.primary),
    secondary: upper(r.secondary),
    color,
    description: lines(r.description),
    passives: Object.entries(r.passives ?? {}).map(([id, p]) => ({
      id,
      name: plain(p.name),
      stat: p.stat ?? (p.stats ? p.stats.join(", ") : ""),
      base: p.base ?? null,
      home: p.home ?? null,
      format: p.format ?? "number",
      condition: p.condition ?? null,
    })),
    knack: r.knack ? { name: plain(r.knack.name), description: lines(r.knack.description) } : null,
    abilities: own,
  });
}

const data = {
  source: "Keplah plugin YAML (kepler-classes classes/*.yml, kepler-races races.yml)",
  tiers: TIERS,
  stageLevels: STAGE_LEVELS,
  classes,
  races,
  abilities,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, 1) + "\n");
console.log(`wrote ${OUT}: ${classes.length} classes, ${races.length} races, ${abilities.length} abilities`);

if (process.argv.includes("--media")) {
  mkdirSync(MEDIA_OUT, { recursive: true });
  let copied = 0;
  let missing = 0;
  for (const ab of abilities) {
    for (const st of ab.stages) {
      const src = join(MEDIA_SRC, st.gif);
      if (existsSync(src)) {
        copyFileSync(src, join(MEDIA_OUT, st.gif));
        copied++;
      } else missing++;
    }
  }
  console.log(`copied ${copied} preview GIFs to ${MEDIA_OUT}` + (missing ? ` (${missing} missing)` : ""));
}
