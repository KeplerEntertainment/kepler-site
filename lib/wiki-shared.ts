/**
 * Wiki types and pure helpers, with no data import, so client components can use them without shipping
 * data/wiki.generated.json to the browser. The data itself is read in lib/wiki.ts.
 */
import type { Element } from "@/lib/content";

export type Slot = "Q" | "E" | "R" | "T" | "Z" | "X" | "C";
export type ElementId = "WATER" | "FIRE" | "AIR" | "EARTH" | "NEUTRAL";
export type TierKey = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface Stage {
  tier: TierKey;
  label: string;
  level: number;
  color: string;
  name: string;
  cooldown: number | null;
  lockout: number | null;
  changes: string[];
  visual: string;
  gif: string;
}

export interface Ability {
  id: string;
  slot: Slot;
  ownerKind: "class" | "race";
  ownerId: string;
  ownerName: string;
  ownerColor: string;
  weapon: string | null;
  weaponId: string | null;
  name: string;
  rareName: string | null;
  epicName: string | null;
  legendaryName: string | null;
  mythicName: string | null;
  element: ElementId;
  kind: string;
  applies: string | null;
  cooldown: number | null;
  energy: number | null;
  range: number | null;
  cast: number | null;
  target: string | null;
  text: string[];
  epicText: string[];
  mythicText: string[];
  stages: Stage[];
}

export interface Weapon {
  id: string;
  name: string;
  hands: number;
  city: string | null;
  auto: { base?: number; range?: number; speed?: number } | null;
  lore: string[];
  passive: { name: string; text: string[] } | null;
  abilities: string[];
}

export interface GameClassData {
  id: string;
  name: string;
  color: string;
  order: number;
  role: string;
  archetype: string;
  homeCity: string | null;
  skillKind: string | null;
  summary: string[];
  buffs: Record<string, number>;
  debuffs: Record<string, number>;
  families: { allowed: string[]; penalized: string[]; forbidden: string[] };
  resonantRaces: string[];
  charge: string[];
  weapons: Weapon[];
  talents: { id: string; tier: number; name: string; text: string }[];
  abilities: string[];
}

export interface RaceData {
  id: string;
  name: string;
  niche: string;
  homeBiome: string;
  primary: ElementId;
  secondary: ElementId;
  color: string;
  description: string[];
  passives: {
    id: string;
    name: string;
    stat: string;
    base: number | null;
    home: number | null;
    format: string;
    condition: string | null;
  }[];
  knack: { name: string; description: string[] } | null;
  abilities: string[];
}

/** Static asset URL under the site's basePath (next/image does not prefix string sources). */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const mediaSrc = (gif: string) => `${BASE}/wiki/media/${gif}`;
/** Preview GIF size (rendered at 360 × 225). */
export const GIF_W = 360;
export const GIF_H = 225;

export const ownerHref = (a: Pick<Ability, "ownerKind" | "ownerId">) =>
  `/wiki/${a.ownerKind === "class" ? "classes" : "races"}/${a.ownerId}/`;
/**
 * URL segment of an ability: its id with dots turned into dashes. A dotted segment ("class.warden.r") looks like a
 * file name, so Next drops the trailing slash from links to it and the static export's directory index is missed.
 */
export const abilitySlug = (id: string) => id.replace(/\./g, "-");
export const abilityHref = (id: string) => `/wiki/abilities/${abilitySlug(id)}/`;

/** YAML element id to the site's Element name (ElementChip); null for Neutral. */
export function elementName(el: ElementId): Element | null {
  if (el === "NEUTRAL") return null;
  return (el[0] + el.slice(1).toLowerCase()) as Element;
}

export const titleCase = (s: string | null | undefined) =>
  s ? s.toLowerCase().replace(/(^|[\s_-])([a-z])/g, (_, p: string, c: string) => (p === "_" || p === "-" ? " " : p) + c.toUpperCase()) : "";

export const SLOT_INFO: Record<Slot, { source: string; long: string; hotbar: number }> = {
  Q: { source: "Race", long: "race skill, primary element", hotbar: 1 },
  E: { source: "Race", long: "race skill, secondary element", hotbar: 2 },
  R: { source: "Class", long: "class signature skill", hotbar: 3 },
  T: { source: "Class", long: "class ultimate", hotbar: 4 },
  Z: { source: "Weapon", long: "weapon strike", hotbar: 5 },
  X: { source: "Weapon", long: "weapon signature", hotbar: 6 },
  C: { source: "Weapon", long: "weapon technique (C option)", hotbar: 7 },
};
export const SLOTS: Slot[] = ["Q", "E", "R", "T", "Z", "X", "C"];

/** Stats added as flat percentage points rather than a percentage (CLASSES §3.1). */
const POINT_STATS = new Set([
  "crit_chance",
  "dodge_chance",
  "block_chance",
  "lifesteal_pct",
  "dot_lifesteal_pct",
  "armor_pen_pct",
  "cooldown_reduction_pct",
  "cast_time_pct",
  "cc_reduction_pct",
  "cc_power_pct",
]);

export function statLabel(stat: string) {
  return stat
    .replace(/_pct$/, "")
    .replace(/_pp$/, "")
    .replace(/^max_hp$/, "max HP")
    .replace(/_/g, " ")
    .replace(/\bhp\b/, "HP")
    .replace(/\bcc\b/, "CC")
    .replace(/\bdot\b/, "DoT")
    .replace(/\baoe\b/, "AoE");
}

const num = (n: number) => String(Math.round(n * 1000) / 1000);

export function statValue(stat: string, v: number) {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  const abs = Math.abs(v) * 100;
  return `${sign}${num(abs)} ${POINT_STATS.has(stat) ? "pp" : "%"}`;
}

export function passiveValue(v: number | null, format: string) {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  const abs = Math.abs(v);
  if (format === "percent") return `${sign}${num(abs * 100)} %`;
  if (format === "pp") return `${sign}${num(abs)} pp`;
  return `${sign}${num(abs)}`;
}
