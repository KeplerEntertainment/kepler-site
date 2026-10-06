import { worldMap } from "@/lib/world-map.generated";

/**
 * Kepler's zones on the Aldara map (WORLD_ALDARA v2). The zone layer, public/world/aldara-zones.svg, is traced by
 * scripts/build-world-map.mjs from Kepler's own 64-block zone mask; it is not a render of the map. Roads, cities,
 * Ward Posts and labels are drawn here on top, in the same units (1 unit = 32 blocks).
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const { width: W, height: H, origin, blocksPerUnit } = worldMap;

/** Block coordinates to map units. */
const at = (x: number, z: number): [number, number] => [(x - origin.x) / blocksPerUnit, (z - origin.z) / blocksPerUnit];

// The map's own bounds (x 1,265 … 21,265, z −15,430 … 4,570) with a little sea around them.
const VIEW = { x: 4, y: 8, w: 632, h: 632 };

type Stretch = "warded" | "red" | "black";

/** Warded stretches are solid; red ones dashed on ink; black ones dashed on a red casing. */
const ROAD: Record<Stretch, { casing: string; core: string; dash?: string }> = {
  warded: { casing: "var(--ink)", core: "var(--panel)" },
  red: { casing: "var(--ink)", core: "var(--panel)", dash: "4 3.5" },
  black: { casing: "var(--accent-3)", core: "var(--ink)", dash: "4 3.5" },
};

/** Where each city label sits relative to its marker, clear of the roads. */
const CITY_LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  forgecross: { dx: -12, dy: -12, anchor: "end" },
  timberwatch: { dx: 12, dy: -12, anchor: "start" },
  quarrystone: { dx: 14, dy: 22, anchor: "start" },
  weavemere: { dx: -12, dy: 20, anchor: "end" },
  hidegate: { dx: 14, dy: 22, anchor: "start" },
};

/** Region names, placed by block coordinates (WORLD_ALDARA §4.5–4.6). */
const REGIONS: { name: string; x: number; z: number }[] = [
  { name: "The Ice Cap", x: 11600, z: -14250 },
  { name: "The Glassmere", x: 17600, z: -6650 },
  { name: "The Bayou", x: 8800, z: -950 },
  { name: "Deserts & canyon", x: 16900, z: -1700 },
  { name: "Jungle Isles", x: 14700, z: 4250 },
];

/** A few of the named black stretches, labelled sparingly (WORLD_ALDARA §5.3). */
const STRETCH_LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  "The Crownfall": { dx: 0, dy: -12, anchor: "middle" },
  "The Mere Gap": { dx: -14, dy: 6, anchor: "end" },
  "The Ochre Narrows": { dx: -12, dy: 4, anchor: "end" },
};

/** Land colours, matching the generated zone layer. */
const LEGEND_ZONES: { fill: string; label: string }[] = [
  { fill: "#2a66dc", label: "Hearth core (blue), T1–T3" },
  { fill: "#6e95e6", label: "Hearth (blue), T3–T4" },
  { fill: "#ffd400", label: "The Marches (yellow), T4–T5" },
  { fill: "#ff9b7d", label: "Red fringe, T5–T6" },
  { fill: "#e8431f", label: "Deep red, T5–T7" },
  { fill: "#121212", label: "Black seam between two cities, T6–T8" },
  { fill: "#3d3d3d", label: "Black wilds, T6–T8" },
  { fill: "#4b3566", label: "The Rim: black frontier, T7–T8" },
];
/** Water samples from the zone layer: harbour, red coast, black seam water, the open Deep. */
const SEA_SAMPLE = ["#e6dc8f", "#dda59a", "#8c9295", "#c5cdd2"];

const LEGEND_ROADS: { stretch: Stretch; ground: string; label: string }[] = [
  { stretch: "warded", ground: "#ffd400", label: "Road in blue/yellow: protected" },
  { stretch: "red", ground: "#e8431f", label: "Road in red: open PvP, full loot" },
  { stretch: "black", ground: "#3d3d3d", label: "Road in black: free-for-all" },
];

function Swatch({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x={0.75} y={0.75} width={12.5} height={12.5} fill={fill} stroke="var(--ink)" strokeWidth={1.5} />
    </svg>
  );
}

function SeaSwatch() {
  return (
    <svg viewBox="0 0 28 14" className="h-3.5 w-7 shrink-0" aria-hidden="true">
      {SEA_SAMPLE.map((fill, i) => (
        <rect key={fill} x={0.75 + i * 6.625} y={0.75} width={6.625} height={12.5} fill={fill} />
      ))}
      <rect x={0.75} y={0.75} width={26.5} height={12.5} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
    </svg>
  );
}

function RoadSwatch({ stretch, ground }: { stretch: Stretch; ground: string }) {
  const s = ROAD[stretch];
  return (
    <svg viewBox="0 0 28 14" className="h-3.5 w-7 shrink-0" aria-hidden="true">
      <rect x={0.75} y={0.75} width={26.5} height={12.5} fill={ground} stroke="var(--ink)" strokeWidth={1.5} />
      <line x1={1.5} y1={7} x2={26.5} y2={7} stroke={s.casing} strokeWidth={5} />
      <line x1={1.5} y1={7} x2={26.5} y2={7} stroke={s.core} strokeWidth={2} strokeDasharray={s.dash ? "3 3" : undefined} />
    </svg>
  );
}

function WardSwatch() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x={3} y={3} width={8} height={8} transform="rotate(45 7 7)" fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.8} />
    </svg>
  );
}

/** Halo text: light letters on an ink outline read on every zone colour. */
function Label({
  x,
  y,
  size,
  anchor = "middle",
  italic = false,
  children,
}: {
  x: number;
  y: number;
  size: number;
  anchor?: "start" | "middle" | "end";
  italic?: boolean;
  children: React.ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily={italic ? "var(--body)" : "var(--display)"}
      fontSize={size}
      fontStyle={italic ? "italic" : undefined}
      fontWeight={italic ? 700 : undefined}
      fill="var(--panel)"
      stroke="var(--ink)"
      strokeWidth={size * 0.3}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={italic ? undefined : { textTransform: "uppercase" }}
    >
      {children}
    </text>
  );
}

export default function ZoneMap() {
  const { roads, shares } = worldMap;
  return (
    <div>
      <svg
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-labelledby="zonemap-title zonemap-desc"
        className="block h-auto w-full"
      >
        <title id="zonemap-title">
          Kepler zones on the Aldara map: about 20,000 by 20,000 blocks and five city pockets (v2 draft)
        </title>
        <desc id="zonemap-desc">
          {`A draft drawn from Kepler's own zone mask of 64-block cells; coordinates are still being verified in game.
          Zone borders follow the land: coastlines, ridges, rivers and biome edges. Aldara is a continent in an open
          sea. Its north is an ice cap, black Rim. Forgecross sits in a pine valley under the snowy peaks of the
          north-west and Timberwatch in the northern pine wood. Quarrystone is in the centre at the foot of the central
          ridge, with the Glassmere bay opening east beyond it. Weavemere is on the bayou shore of the south-west and
          Hidegate in the south-east, where savanna meets the red deserts and the canyon. Each city has a safe pocket
          of blue Hearth and yellow Marches; red ground rings every pocket, and black seams run between neighbouring
          cities, so every road between two cities crosses red and black. The outer coasts, the southern jungle isles
          and the Shattered Isles in the south-west are black frontier. Land splits about ${Math.round(shares.safe)}
          percent safe, ${Math.round(shares.red)} percent red and ${Math.round(shares.black)} percent black. Water
          keeps the zone of its coast and is drawn paler. Eight roads join the cities: four spokes from Quarrystone
          and four ring roads. Roads are protected only on blue and yellow ground, drawn solid, up to the Ward Posts;
          on red and black ground they are unprotected and drawn dashed. The Crownfall, the Mere Gap and the Ochre
          Narrows are three of the named black stretches the roads cross.`.replace(/\s+/g, " ")}
        </desc>

        <image href={`${BASE}/world/aldara-zones.svg`} x={0} y={0} width={W} height={H} />

        {/* Roads: a casing under a core. Solid where warded, dashed where not. */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {roads.map((r, i) => (
            <path key={`c${i}`} d={r.d} stroke={ROAD[r.stretch].casing} strokeWidth={5.5} />
          ))}
          {roads.map((r, i) => (
            <path
              key={`r${i}`}
              d={r.d}
              stroke={ROAD[r.stretch].core}
              strokeWidth={2.2}
              strokeDasharray={ROAD[r.stretch].dash}
              strokeLinecap={ROAD[r.stretch].dash ? "butt" : "round"}
            />
          ))}
        </g>

        {worldMap.wardPosts.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x - 3.5}
            y={y - 3.5}
            width={7}
            height={7}
            transform={`rotate(45 ${x} ${y})`}
            fill="var(--accent)"
            stroke="var(--ink)"
            strokeWidth={1.8}
          />
        ))}

        {REGIONS.map((r) => {
          const [x, y] = at(r.x, r.z);
          return (
            <Label key={r.name} x={x} y={y} size={14} italic>
              {r.name}
            </Label>
          );
        })}

        {worldMap.blackStretches
          .filter((s) => s.name in STRETCH_LABEL)
          .map((s) => {
            const l = STRETCH_LABEL[s.name];
            return (
              <Label key={s.name} x={s.at[0] + l.dx} y={s.at[1] + l.dy} size={11} anchor={l.anchor} italic>
                {s.name.replace(/^The /, "")}
              </Label>
            );
          })}

        {worldMap.cities.map((c) => {
          const [cx, cy] = c.at;
          const l = CITY_LABEL[c.id];
          return (
            <g key={c.id}>
              <rect x={cx - 7} y={cy - 7} width={14} height={14} fill="var(--panel)" stroke="var(--ink)" strokeWidth={3.2} />
              <Label x={cx + l.dx} y={cy + l.dy} size={17} anchor={l.anchor}>
                {c.name}
              </Label>
            </g>
          );
        })}

        <rect x={VIEW.x + 1} y={VIEW.y + 1} width={VIEW.w - 2} height={VIEW.h - 2} fill="none" stroke="var(--ink)" strokeWidth={5} />
      </svg>

      <ul className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2" aria-label="Map legend">
        {LEGEND_ZONES.map((t) => (
          <li key={t.label} className="flex items-center gap-2">
            <Swatch fill={t.fill} />
            <span>{t.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <SeaSwatch />
          <span>Water keeps the zone of its coast, drawn paler; palest is the open Deep (black)</span>
        </li>
        {LEGEND_ROADS.map((r) => (
          <li key={r.stretch} className="flex items-center gap-2">
            <RoadSwatch stretch={r.stretch} ground={r.ground} />
            <span>{r.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <WardSwatch />
          <span>Ward Post: road protection ends here</span>
        </li>
      </ul>
    </div>
  );
}
