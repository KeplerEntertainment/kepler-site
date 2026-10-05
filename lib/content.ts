/**
 * Everything the page says about Kepler, as data. Sources: the project's design
 * documents (DESIGN, REWORK, CLASSES, CALAMITY) and the lore bible (LORE and
 * docs/lore/**). Mechanics documents win on rules and numbers; lore supplies names.
 */

export type Element = "Water" | "Fire" | "Air" | "Earth";
export type Zone = "blue" | "yellow" | "red" | "black";

// ── The world ────────────────────────────────────────────────────────────────

export const premise = [
  "The world is Ormere, a vessel for four living Currents: Water, Fire, Air and Earth. Long ago the Ashlar dug too deep and cracked it. Through that crack, the Maw, an emptiness called the Hollow breathes in, again and again.",
  "Each breath is a Calamity Wave. Breach Scars tear open across the map and the Hollowborn pour through. Where a Scar is not sealed, the land's Currents drain and invert into Blight, and Blight spreads.",
  "The waves used to come once a generation. Now they come every week. Players are the Tollbound: volunteers who swore on a Tollstone to answer the call, and who come back from death to answer it again.",
];

export interface ZoneInfo {
  key: Zone;
  name: string;
  tiers: string;
  pvp: string;
  death: string;
  reward: string;
}

/** DESIGN §8.2 and WORLD_LAYOUT §3. Rewards multiply as risk rises. */
export const zones: ZoneInfo[] = [
  { key: "blue", name: "Blue", tiers: "T1–T4", pvp: "Off, duels only", death: "Durability loss, nothing dropped", reward: "x1.0" },
  { key: "yellow", name: "Yellow", tiers: "T4–T5", pvp: "Only when flagged; knockdown, no kill", death: "Durability loss, nothing dropped", reward: "x1.2 resources / x1.5 fame" },
  { key: "red", name: "Red", tiers: "T5–T7", pvp: "Always on; knockdown, then execute", death: "Full loot in a loot bag", reward: "x1.5 resources / x2.25 fame" },
  { key: "black", name: "Black", tiers: "T6–T8", pvp: "Always on; everyone outside your guild or alliance is an enemy", death: "Full loot, instant death", reward: "x2.0 resources / x3.0 fame" },
];

export interface City {
  id: string;
  name: string;
  epithet: string;
  /** City tile on the Aldara grid (WORLD_ALDARA §3). */
  tile: string;
  ground: string;
  trade: string;
  proverb: string;
}

/** DESIGN §14 for function, WORLD_ALDARA §3 for tiles and terrain, LORE §6 and docs/lore/cities for names and voice. */
export const cities: City[] = [
  {
    id: "forgecross",
    name: "Forgecross",
    epithet: "the Anvil of the Charter",
    tile: "O13",
    ground: "North-west, snowy peaks and calderas",
    trade: "Ore into metal bars. Plate armour, swords, maces, hammers, pickaxes.",
    proverb: "Steel does not fail. People do.",
  },
  {
    id: "timberwatch",
    name: "Timberwatch",
    epithet: "the Green Wall",
    tile: "Z13",
    ground: "North, the great pine wood",
    trade: "Wood into planks. Bows, crossbows, spears, staves, furniture.",
    proverb: "Grow nothing you cannot tend.",
  },
  {
    id: "quarrystone",
    name: "Quarrystone",
    epithet: "the Crossroads Crown",
    tile: "X22",
    ground: "Centre, under the central ridge",
    trade: "Stone into blocks. Tools, food, potions, facility kits, mounts. Home of the black market.",
    proverb: "Write it down, so we fail differently next time.",
  },
  {
    id: "weavemere",
    name: "Weavemere",
    epithet: "the Loom of Lakes",
    tile: "S30",
    ground: "South-west, the bayou shore",
    trade: "Fibre into cloth. Cloth armour, every staff, capes, tomes.",
    proverb: "Ask quietly. The water carries.",
  },
  {
    id: "hidegate",
    name: "Hidegate",
    epithet: "the Banner Gate",
    tile: "AB33",
    ground: "South-east, savanna and red desert",
    trade: "Hide into leather. Leather armour, daggers, axes, bags, saddles.",
    proverb: "A road shared is half as long.",
  },
];

/** Tile id ("A1" … "AP44") to a 0-based [column, row]: A1 is [0, 0], AB33 is [27, 32]. */
export function tileXY(id: string): [number, number] {
  const m = /^([A-Z]+)(\d+)$/.exec(id);
  if (!m) throw new Error(`bad tile id ${id}`);
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return [col - 1, Number(m[2]) - 1];
}

/**
 * WORLD_ALDARA §4 and docs/world/aldara-tiles-draft.yml: the Aldara zone sheet, 42 columns (A … AP) by
 * 44 rows of 512-block tiles, one character per tile, row 1 first. A draft: the calibration is still
 * being checked in game.
 *
 * Land:  C city · b blue Hearth · y yellow Marches · r red fringe · R deep red ·
 *        x black seam · X black wilds · # black Rim.
 * Sea:   B blue · Y yellow (harbour water) · f red fringe · d deep red · s black seam ·
 *        w black wilds · . the Deep (Rim).
 */
export const aldaraTiles = [
  "..........................................",
  "...........#####........#.......###.......",
  ".......###########..######.#...#####......",
  "......###############################.....",
  "......###############################.....",
  "......###########xxxxxx#################..",
  "......############xxxx###################.",
  "...wwwwdRRRRRRRRRRRxxRRRRRRRRRRRRXXXX#####",
  "...wwwwdRRRRRRRRRRRxxRRRRRRRRRRRRXXXX#.###",
  "...wwwwdRRRrrrrrrrRxxRrrrrrrrRRRRXXXw.....",
  "...wwwXRRRRryyyyyrRxxRryyyyyrRRRRXXXX###..",
  "...wwXXRRRRrybbbyrRxxRrybbbyrRRRRXwXX###..",
  "...wwwwddRRrybCbyrRxxRrybCbyrRRRRwwww.....",
  "...wwwwddRRrybbbyrRxxRrybbbyrRRRRwwww.....",
  "...wwwwddRRryyyyyrRxxRryyyyyrRRRRwwww.....",
  "...wwwwdRRRrrrrrrrRxxRrrrrrrrRRRRwwww.....",
  "...wwwwdRRRRRRRRRRxssxxxxxxxxRRRRXXww.....",
  "...wwwwdRRRRRRRRRxxxsxxxxxxxsxRRRXXww.....",
  "...wwwwRdRRRRRRRxxxRrrrrrrrRsssRRwwww.....",
  "...wwwwRRRRRRRRxxxRRryyyyyrRdsxxRXXXw.....",
  "...wwwXXXXXXXXXXxRRRrybbbyrRRdsXXXXXw.....",
  "...wwwwXXXXXXXXXxRRRrybCbyrRRRRXXXXwwww...",
  "...wXXwXXwXRRRRxxxRRrybbbyrRRRRXXXXwwXw...",
  "...wXXXXwXwRRRRRxxxRryyyyyrRRRRXXXXXwww...",
  ".......wXXXRRRRRRxxxrrrrrrrRRRxXXXXXwww...",
  ".......wwXXRRRRRRRxxxxxxRRRRRxxxRRRXXXw...",
  ".......wwwwddddfrrrrrrxxxxxxxxxRRRRXXXw...",
  ".......wwwwddddfYyyyyrxxxxxxxxRRRRRXXXw...",
  "............dddfYbbbyrxxRRRRRRRRRRRXXXw...",
  "............dddfybCbYrxxrrrrrrrRRRRXXXw...",
  "............dddfYBBBYrxxryyyyyrRRRRXXXw...",
  "....#.#.....dddfYYYYYfxxrybbbyrRRRRXXXw...",
  "....##......dddfffffffssfybCbyrRRRRXXXw...",
  "....###.....ddddddddddssfYbbbyrRRRRXXXw...",
  ".....#......dddddddddsssfYyyyyrRRRRXXww...",
  ".........###ddddddddsssdffrrrrrRRRRXXww...",
  "............dddddddsssdddRRRRRRRRRRXXww##.",
  ".....#.#....wwwwwwwwxwwXXXXXXXXXXXXXwXw#..",
  ".....###....wwwwwwXXXXXXXXXXXXXXwXXXXww...",
  "......##....wwwwwXXXXXXXXXXXwwXwXXXXwww...",
  "............wwwwwwwwwwXXwwXXXXXXXXwwwww...",
  "................wwwXXwXXXXXXXXwwXwwwwww...",
  "................wwwwwwwXXXXXXXwwwwwwwww...",
  "................wwwwwwwwwwwwwwwwwwwwwww...",
];

export interface Road {
  name: string;
  /** Tiles the road runs through, in order (WORLD_ALDARA §5.1). The exact line is drawn in game. */
  via: string[];
}

/**
 * WORLD_ALDARA §5.1: the eight roads. Four spokes run from Quarrystone to the outer cities, four ring roads
 * join the outer cities. Every tile a road crosses keeps that tile's rules: warded in blue and yellow, open
 * PvP and full loot in red and black.
 */
export const roads: Road[] = [
  { name: "The Lakeway", via: ["X22", "V20", "S18", "Q16", "O13"] },
  { name: "The Pinewalk", via: ["X22", "Y20", "Z17", "Z13"] },
  { name: "The Mound Road", via: ["X22", "W24", "U26", "T28", "S30"] },
  { name: "The Painted Road", via: ["X22", "Z24", "AB26", "AC28", "AD30", "AB33"] },
  { name: "The Frostline", via: ["O13", "R12", "U11", "X12", "Z13"] },
  { name: "The Old Forest Road", via: ["O13", "N16", "O19", "P21", "Q25", "R27", "S30"] },
  { name: "The Red Road", via: ["S30", "U30", "W30", "Y31", "AA32", "AB33"] },
  { name: "The Long East Road", via: ["Z13", "AB16", "AA19", "AC23", "AE26", "AF29", "AE31", "AB33"] },
];

/** A few of Aldara's regions to name on the schematic (WORLD_ALDARA §4.4–4.5). Positions are tile coordinates. */
export const regions: { name: string; x: number; y: number }[] = [
  { name: "The Ice Cap", x: 30, y: 3.4 },
  { name: "The Glassmere", x: 32.2, y: 17.6 },
  { name: "Western Wilds", x: 8.6, y: 21.8 },
  { name: "The Bayou", x: 12.3, y: 26.7 },
  { name: "Deserts & canyon", x: 36.2, y: 32.5 },
  { name: "Jungle Isles", x: 25, y: 41 },
  { name: "Shattered Isles", x: 6.5, y: 41.6 },
];

/** The credited source of the world map (WORLD_ALDARA §1.1 and §9). */
export const mapCredit = {
  title: "Paralon Continent #1 – Aldara",
  author: "Terralon",
  url: "https://www.planetminecraft.com/project/paralon-continent-1-aldara/",
} as const;

/** WORLD_LAYOUT §6–8: the three safer ways to move between cities. All three are designed, not yet built. */
export const travel = [
  {
    name: "Stonewalk",
    kind: "Paid fast travel",
    body: "A Tollwarden sends you along the thread between Tollstones, from one server city to another. It carries you and what you wear, nothing else.",
    points: [
      "No cargo: resources, loose gear and trade goods stay behind",
      "Price rises with distance and the tier of your gear",
      "Not while in combat, just after a PvP fight, or as an Outlaw",
    ],
    saying: "The stone takes you, not your trade.",
  },
  {
    name: "Road Bonds",
    kind: "Player haul & escort contracts",
    body: "Contracts sealed at the Ledger Court. Hire a Bondcarrier to haul your goods, or hire Outriders to ride beside you through the bands.",
    points: [
      "Carriers post collateral, so a robbed haul still pays the owner",
      "Goods ride in Bonded Crates that can be looted on the road",
      "A Bond Ledger rating decides how much a carrier may take",
    ],
    saying: "Quarrystone believes in contracts.",
  },
  {
    name: "Charter Freight",
    kind: "Insured NPC shipping",
    body: "The Court's wagon trains carry goods along the spoke roads, always through Quarrystone, for a premium. Slow, taxed and capped, so players still haul most trade.",
    points: [
      "Hours on the road, with fees on both ends",
      "Insured against everything except the calamity",
      "A Breach Scar opening near the route can still destroy the load",
    ],
    saying: "The Roadless leave the wagons alone. The Hollow does not.",
  },
];

// ── Systems ──────────────────────────────────────────────────────────────────

export const coreLoop = [
  { step: "Gather", text: "Ore, wood, fibre, hide, stone and fish, with tiered tools. Richer nodes sit in riskier tiles." },
  { step: "Refine", text: "Bars, planks, cloth, leather and blocks at city stations. Each city refines one thing best." },
  { step: "Craft", text: "Gear, tools, food and potions, with a quality roll from Normal to Masterpiece." },
  { step: "Trade", text: "Order-book markets in every city. Prices differ, so hauling goods pays." },
  { step: "Risk", text: "Wear it into yellow, red and black tiles, dungeons and sieges. Win and loot. Lose and replace." },
];

export interface System {
  title: string;
  tag: string;
  body: string;
  points: string[];
}

export const systems: System[] = [
  {
    title: "Economy & markets",
    tag: "player-made",
    body: "Almost every usable item is gathered, refined and crafted by players and sold to players. No premium currency, nothing to buy with real money.",
    points: [
      "Gear in tiers T1–T8, enchanted .0–.4, with five quality grades",
      "Buy and sell orders that fill while you are offline",
      "Banks per city, a black market in Quarrystone, roadside stalls",
      "Full loot, durability and the black market keep removing items, so crafters always have demand",
    ],
  },
  {
    title: "Zones & full loot",
    tag: "risk = reward",
    body: "One open world: the Aldara continent, about 20,000 × 22,000 blocks, cut into a 42 × 44 grid of 512-block tiles. Each city sits in a small safe pocket of blue and yellow; bands of red and black lie between the pockets, and the ice cap, the far coasts and the isles are a black frontier. Tile names, tiers and danger show on entry.",
    points: [
      "Flagging in yellow, knockdown and execute in red, free-for-all in black",
      "Loot bags drop everything you wore; some of it is destroyed",
      "Reputation and outlaw status for players who prey on the weak",
      "Roads are the fastest way everywhere, but protected only inside a city's ward",
    ],
  },
  {
    title: "Kingdoms, guilds & sieges",
    tag: "player power",
    body: "Players found towns, claim land, grow them into kingdoms and build their own stations and markets. Guilds fight over everything, including the server cities.",
    points: [
      "Towny-style claims, plots, ranks and town levels",
      "Guilds, alliances, parties, a guild bank and guild buffs",
      "War declarations, raids and scheduled sieges with siege equipment",
      "Guilds that capture a server city collect its taxes",
    ],
  },
  {
    title: "Dungeons & POIs",
    tag: "PvE",
    body: "Owner-built dungeons, from solo runs to ten-player expeditions, plus small points of interest scattered across every tile.",
    points: [
      "Solo, group and large dungeons, instanced or in the open world",
      "Hellgates and invasion dungeons for PvP in red and black",
      "Random mist portals with a rare jackpot",
      "Quest rooms and quest bosses that appear only for players on that step",
    ],
  },
  {
    title: "Calamity waves",
    tag: "the weekly event",
    body: "Tollstones in every city count down to the next wave and forecast where it will hit. Then Scars open, and the server has to close them.",
    points: [
      "Tremors three times a week, a Wave every Saturday, a Great Calamity every fourth",
      "Scars run Rupture, Tide, Herald, Seal. If Pressure hits 100 %, the tile is lost to Blight",
      "Blight spreads hour by hour; cleansing takes Censers, Stakes and people",
      "Riftglass, the wave currency, buys recipes and unlocks, never finished gear",
    ],
  },
  {
    title: "Quests & conversations",
    tag: "~2,000 lines planned",
    body: "Quest lines start in the five cities, about 400 per city, each one to twenty tasks long. Givers talk through branching conversations written to carry voice lines.",
    points: [
      "Fourteen quest-giver roles per city, from steward to explorer",
      "Gathering, crafting, combat, dungeon, trade, racial and realm lines",
      "City Favor ladders with recipes, titles and cosmetics",
      "Daily and weekly contracts, bounties and a season ladder",
    ],
  },
  {
    title: "BlueMap integration",
    tag: "live web map",
    body: "The world's structure is drawn on BlueMap, so the web map is a planning tool, not just a picture.",
    points: [
      "Zone tiles in their colours, with tile and area names",
      "Server cities, roads, towns and kingdom borders",
      "Dungeon entrances, POIs and siege status",
      "Calamity layers: forecasts, Scars and Blight levels",
    ],
  },
  {
    title: "Custom items & mobs",
    tag: "content engine",
    body: "Items, recipes, mobs, dungeons and quests are YAML, so content can be written without code. A generated resource pack carries the models, sounds and voice files.",
    points: [
      "In-house custom item system with resource pack build and hosting",
      "A roster of 48 custom mobs in families, plus champions",
      "Ten bosses with phases, and world events",
      "Ten Hollowborn and four Heralds for the calamity",
    ],
  },
];

export const aspects = [
  { name: "Ashen", current: "Fire", herald: "Cinderjaw", prep: "Fire-resist draughts, healers, plate" },
  { name: "Drowned", current: "Water", herald: "the Tidewidow", prep: "Cleanse potions, mobility, CC-reduction food" },
  { name: "Hollow", current: "Air", herald: "the Hushking", prep: "Energy potions, cloth and magic resist" },
  { name: "Thorned", current: "Earth", herald: "the Bramblemother", prep: "Area weapons, armour food, bleed cures" },
] as const;

export const blightLevels = ["Clean", "Tainted", "Blighted", "Festering", "Withered", "Hollowed"];

// ── Races and classes ────────────────────────────────────────────────────────

export interface Race {
  name: string;
  home: string;
  /** Where that ground lies on Aldara (WORLD_ALDARA §6). */
  land: string;
  primary: Element;
  secondary: Element;
  nudge: string;
  q: string;
  e: string;
}

/** REWORK §1.2 and §2.2 (approved 2026-10-01). */
export const races: Race[] = [
  { name: "Galeward", land: "Hidegate’s savanna, the Wheat Fields", home: "Plains", primary: "Air", secondary: "Fire", nudge: "Rider, trader, hit-and-run skirmisher", q: "Gust Lance", e: "Grassfire Run" },
  { name: "Rootkin", land: "The Western Wilds, the pines, the Elder Wood", home: "Forest", primary: "Earth", secondary: "Water", nudge: "Gatherer, sustain fighter, off-healer", q: "Bramble Snare", e: "Sapwell" },
  { name: "Dunestrider", land: "The Red, Painted and Dune deserts", home: "Desert", primary: "Fire", secondary: "Air", nudge: "Mobile skirmisher, opener", q: "Scorch Dart", e: "Dust Step" },
  { name: "Frostvein", land: "The ice cap", home: "Snow", primary: "Water", secondary: "Air", nudge: "Control caster, energy-rich mage", q: "Rime Spike", e: "Whiteout" },
  { name: "Cragborn", land: "Forgecross’s peaks, the central ridge, the Batholith", home: "Mountains", primary: "Earth", secondary: "Fire", nudge: "Tank, front line, miner", q: "Stonefist", e: "Forge Heart" },
  { name: "Mirefolk", land: "The Bayou around Weavemere", home: "Swamp", primary: "Water", secondary: "Earth", nudge: "Damage over time, alchemist, area denial", q: "Bog Spit", e: "Sinkhole" },
  { name: "Vinereach", land: "The southern jungle isles", home: "Jungle", primary: "Air", secondary: "Water", nudge: "Ambusher, assassin, hunter", q: "Canopy Leap", e: "Mist Veil" },
  { name: "Tidesworn", land: "Every coast, the Glassmere, the isles", home: "Ocean", primary: "Water", secondary: "Air", nudge: "Healer, support, sea trader", q: "Tide Lash", e: "Squall Call" },
  { name: "Ochrehide", land: "Giant Canyon and the badlands", home: "Badlands", primary: "Earth", secondary: "Fire", nudge: "Crafter, durable bruiser", q: "Mesa Slam", e: "Kiln Skin" },
  { name: "Cinderborn", land: "The Calderas and the Hot Springs", home: "Volcanic / Nether", primary: "Fire", secondary: "Earth", nudge: "Aggressive caster, burst damage", q: "Cinder Burst", e: "Obsidian Shell" },
];

export interface GameClass {
  name: string;
  order: string;
  role: string;
  r: string;
  rEl: Element;
  t: string;
  tEl: Element;
}

/** CLASSES §7 and §7.1; order names from LORE §9.3. */
export const classes: GameClass[] = [
  { name: "Warden", order: "The Keepstone Order", role: "Tank, anchor", r: "Bulwark Stone", rEl: "Earth", t: "Citadel", tEl: "Earth" },
  { name: "Berserker", order: "The Red Hearth", role: "Melee bruiser, lifesteal", r: "Blood Boil", rEl: "Fire", t: "Red Mist", tEl: "Fire" },
  { name: "Duelist", order: "The Crosswind Salle", role: "Single-target skirmisher", r: "Zephyr Feint", rEl: "Air", t: "Thousand Cuts", tEl: "Air" },
  { name: "Shadowblade", order: "The Quiet Hand", role: "Assassin, stealth burst", r: "Smoke Slip", rEl: "Air", t: "Nightfall", tEl: "Water" },
  { name: "Ranger", order: "The Long Watch", role: "Sustained ranged damage", r: "Gale Arrow", rEl: "Air", t: "Rain of the Hunt", tEl: "Water" },
  { name: "Arbalist", order: "The Boltwrights' Company", role: "Ranged burst, siege", r: "Stonepiercer", rEl: "Earth", t: "Bombardment", tEl: "Fire" },
  { name: "Pyromancer", order: "The School of the Kept Flame", role: "Area magic damage", r: "Flame Lash", rEl: "Fire", t: "Cataclysm", tEl: "Fire" },
  { name: "Cryomancer", order: "The Stillwater Cloister", role: "Control mage", r: "Frost Bind", rEl: "Water", t: "Deep Winter", tEl: "Water" },
  { name: "Hexer", order: "The Black Tide Chapter", role: "Damage over time, anti-heal", r: "Black Tide", rEl: "Water", t: "Blight Field", tEl: "Earth" },
  { name: "Cleric", order: "The Lantern Rite", role: "Burst healer", r: "Clear Spring", rEl: "Water", t: "Ascension", tEl: "Fire" },
  { name: "Druid", order: "The Rootbound Circle", role: "Healing over time, off-tank", r: "Root Lattice", rEl: "Earth", t: "Grove Awakening", tEl: "Earth" },
  { name: "Warcaller", order: "The Banner-Singers", role: "Group support", r: "Gale Chorus", rEl: "Air", t: "Anthem of War", tEl: "Air" },
  { name: "Spellblade", order: "The Sunsteel Lodge", role: "Melee-magic hybrid", r: "Brand Edge", rEl: "Fire", t: "Arcane Ascendance", tEl: "Air" },
  { name: "Vanguard", order: "The First-Through", role: "Engage tank, diver", r: "Ram Quake", rEl: "Earth", t: "Juggernaut Rush", tEl: "Earth" },
  { name: "Monk", order: "The Order of the Turning River", role: "Evasive skirmisher", r: "Flowing Palm", rEl: "Water", t: "Enlightenment", tEl: "Air" },
];

export const skillBar = [
  { key: "Q", hotbar: 1, source: "Race", text: "Race skill in the race's primary element" },
  { key: "E", hotbar: 2, source: "Race", text: "Race utility in the secondary element" },
  { key: "R", hotbar: 3, source: "Class", text: "Class signature skill" },
  { key: "T", hotbar: 4, source: "Class", text: "Class ultimate, built on charge" },
  { key: "Z", hotbar: 5, source: "Weapon", text: "Weapon strike, one of three" },
  { key: "X", hotbar: 6, source: "Weapon", text: "Signature of the exact weapon held" },
  { key: "C", hotbar: 7, source: "Armour", text: "One armour skill or weapon technique" },
] as const;

/** REWORK §5.5: gate level, effect multiplier and what the tier adds. */
export const tiers = [
  { name: "Common", gate: 1, mult: "x1.00", adds: "The skill as written" },
  { name: "Rare", gate: 20, mult: "x1.05", adds: "Its elemental status lasts longer" },
  { name: "Epic", gate: 40, mult: "x1.10", adds: "A new name and one extra mechanic" },
  { name: "Legendary", gate: 60, mult: "x1.16", adds: "Shorter cooldown, an extra modifier slot" },
  { name: "Mythic", gate: 80, mult: "x1.22", adds: "A second extra mechanic and unique visuals" },
];

// ── Architecture ─────────────────────────────────────────────────────────────

export interface Module {
  id: string;
  name: string;
  does: string;
  status: "drafted" | "in progress" | "next";
}

export const coreServices = [
  "Player data & SQLite",
  "Silver, fame & mastery",
  "Tiered item API",
  "Zones API",
  "GUI framework",
  "Map marker service",
  "Activity & quest events",
  "Calamity service hooks",
];

export const moduleGroups: { name: string; modules: Module[] }[] = [
  {
    name: "Character",
    modules: [
      { id: "kepler-combat", name: "KeplerCombat", does: "Health, energy, weapon skills, CC, food and potions, mounts, duels", status: "drafted" },
      { id: "kepler-progression", name: "KeplerProgression", does: "Destiny board, titles, collection log, leaderboards", status: "drafted" },
      { id: "kepler-races", name: "KeplerRaces", does: "The ten races, passives, race skills, racial track", status: "in progress" },
      { id: "kepler-classes", name: "KeplerClasses", does: "The fifteen classes, class skills, talents", status: "in progress" },
    ],
  },
  {
    name: "Economy",
    modules: [
      { id: "kepler-items", name: "KeplerItems", does: "Custom items, resource pack build and hosting, sounds", status: "drafted" },
      { id: "kepler-gathering", name: "KeplerGathering", does: "Resource nodes, tools, fishing, farming", status: "drafted" },
      { id: "kepler-crafting", name: "KeplerCrafting", does: "Refining, crafting, stations, focus, quality, repair", status: "drafted" },
      { id: "kepler-market", name: "KeplerMarket", does: "Order-book markets, banks, black market, travel, stalls", status: "drafted" },
    ],
  },
  {
    name: "World & power",
    modules: [
      { id: "kepler-zones", name: "KeplerZones", does: "Tile grid, zone colours, roads, cities, flagging, death rules", status: "drafted" },
      { id: "kepler-map", name: "KeplerMap", does: "BlueMap layers for tiles, cities, roads, towns, dungeons", status: "drafted" },
      { id: "kepler-towns", name: "KeplerTowns", does: "Towns, claims, kingdoms, player-built facilities", status: "drafted" },
      { id: "kepler-guilds", name: "KeplerGuilds", does: "Guilds, alliances, parties, guild bank, season ranking", status: "drafted" },
      { id: "kepler-war", name: "KeplerWar", does: "War declarations, sieges, city control, siege equipment", status: "drafted" },
    ],
  },
  {
    name: "Adventure",
    modules: [
      { id: "kepler-mobs", name: "KeplerMobs", does: "Custom mob engine, skills, bosses, world events", status: "next" },
      { id: "kepler-dungeons", name: "KeplerDungeons", does: "Dungeons, quest rooms, POIs, hellgates", status: "drafted" },
      { id: "kepler-dialogue", name: "KeplerDialogue", does: "NPCs, branching conversations, voice lines", status: "drafted" },
      { id: "kepler-quests", name: "KeplerQuests", does: "Quest engine, boards, journal, validator", status: "drafted" },
      { id: "kepler-contracts", name: "KeplerContracts", does: "Contracts, bounties, achievements, season ladder", status: "drafted" },
      { id: "kepler-calamity", name: "KeplerCalamity", does: "Waves, Scars, Blight, cleansing, Riftglass", status: "next" },
    ],
  },
];

// ── Roadmap ──────────────────────────────────────────────────────────────────

export type PhaseState = "done" | "now" | "next" | "later";

export const roadmap: { phase: string; state: PhaseState; text: string }[] = [
  {
    phase: "Game design",
    state: "done",
    text: "Full specifications for every system, the calamity and the classes. The races, skills and characters rework was approved in October 2026.",
  },
  {
    phase: "KeplerCore",
    state: "done",
    text: "The shared API every addon builds on, reviewed and patched after its QA pass.",
  },
  {
    phase: "Addon drafts",
    state: "now",
    text: "Most addons have a first draft. Races and classes are being rebuilt to the approved rework; mobs and calamity are next.",
  },
  {
    phase: "Review & QA",
    state: "now",
    text: "Code reviews per addon, then tester passes that hunt for item dupes, broken menus and edge cases.",
  },
  {
    phase: "Lore",
    state: "done",
    text: "The lore bible plus pages for the five cities, ten kindreds, fifteen orders, the factions and the calamity.",
  },
  {
    phase: "Quest content",
    state: "next",
    text: "The engine is drafted. Writing the quest lines and conversations, city by city, comes after the lore.",
  },
  {
    phase: "Integration & live test",
    state: "later",
    text: "All plugins on one server, the cities built, a closed test with real players and real loot.",
  },
  {
    phase: "Launch",
    state: "later",
    text: "No date yet. It opens when the test says it is ready, not before.",
  },
];
