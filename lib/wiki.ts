/**
 * The wiki's data: data/wiki.generated.json, written by scripts/build-wiki-data.mjs from the Kepler plugin YAML
 * (Keplah repo, private). Regenerate with `npm run wiki:data` (and `npm run wiki:media` for the GIFs), then commit.
 */
import raw from "@/data/wiki.generated.json";
import { abilitySlug, type Ability, type GameClassData, type RaceData, type TierKey } from "@/lib/wiki-shared";

export * from "@/lib/wiki-shared";

interface WikiData {
  tiers: { key: TierKey; label: string; gate: number; mult: number; cdf: number; color: string }[];
  stageLevels: number[];
  classes: GameClassData[];
  races: RaceData[];
  abilities: Ability[];
}

const data = raw as unknown as WikiData;

export const wikiTiers = data.tiers;
export const wikiClasses = data.classes;
export const wikiRaces = data.races;
export const abilities = data.abilities;

const byId = new Map(abilities.map((a) => [a.id, a]));
export const getAbility = (id: string) => byId.get(id);
const bySlug = new Map(abilities.map((a) => [abilitySlug(a.id), a]));
export const getAbilityBySlug = (slug: string) => bySlug.get(slug);
export const getClass = (id: string) => wikiClasses.find((c) => c.id === id);
export const getRace = (id: string) => wikiRaces.find((r) => r.id === id);
export const abilitiesOf = (ids: string[]) => ids.map((id) => byId.get(id)).filter((a): a is Ability => !!a);

