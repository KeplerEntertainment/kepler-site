import { aldaraTiles, cities, regions, roads, tileXY } from "@/lib/content";

/**
 * A schematic of the Aldara continent drawn from Kepler's own zone sheet (one square per 512-block tile).
 * It is not a render of the map: land and sea come from the sheet's sea flag, colours from the zone classes.
 */

const COLS = aldaraTiles[0].length; // 42 (A … AP)
const ROWS = aldaraTiles.length; // 44
const CELL = 10; // svg units per tile
const W = COLS * CELL;
const H = ROWS * CELL;

type ZoneClass = "city" | "blue" | "yellow" | "fringe" | "deep" | "seam" | "wilds" | "rim";
interface Tile {
  cls: ZoneClass;
  sea: boolean;
}

const LAND: Record<string, ZoneClass> = {
  C: "city",
  b: "blue",
  y: "yellow",
  r: "fringe",
  R: "deep",
  x: "seam",
  X: "wilds",
  "#": "rim",
};
const SEA: Record<string, ZoneClass> = {
  B: "blue",
  Y: "yellow",
  f: "fringe",
  d: "deep",
  s: "seam",
  w: "wilds",
  ".": "rim",
};

function tileAt(x: number, y: number): Tile {
  const ch = aldaraTiles[y]?.[x] ?? ".";
  if (ch in LAND) return { cls: LAND[ch], sea: false };
  return { cls: SEA[ch] ?? "rim", sea: true };
}

/** The palette's own colours double as zone colours: blue, yellow, red, ink. */
const FILL: Record<ZoneClass, string> = {
  city: "var(--accent-2)",
  blue: "var(--accent-2)",
  yellow: "var(--accent)",
  fringe: "var(--accent-3)",
  deep: "var(--accent-3)",
  seam: "var(--ink)",
  wilds: "var(--ink)",
  rim: "var(--ink)",
};

/** Land is solid; the red fringe is a lighter red so the band reads fringe then deep. Sea is the same zone, paler. */
function opacityOf(t: Tile): number {
  if (!t.sea) return t.cls === "fringe" ? 0.55 : 1;
  switch (t.cls) {
    case "blue":
    case "yellow":
      return 0.4;
    case "fringe":
      return 0.2;
    case "deep":
      return 0.32;
    case "seam":
    case "wilds":
      return 0.24;
    default:
      return 0.09; // the Deep
  }
}

/** Black seams carry a dot pattern, the Rim a red hatch, so the three blacks stay apart. */
const PATTERN: Partial<Record<ZoneClass, string>> = {
  seam: "url(#zonemap-seam)",
  rim: "url(#zonemap-rim)",
};

/** A road is protected only on city, blue and yellow tiles (WORLD_LAYOUT §5, unchanged on Aldara). */
type Stretch = "warded" | "red" | "black";
function stretchOf(t: Tile): Stretch {
  if (t.cls === "city" || t.cls === "blue" || t.cls === "yellow") return "warded";
  if (t.cls === "fringe" || t.cls === "deep") return "red";
  return "black";
}

interface Run {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stretch: Stretch;
}

const centre = (i: number) => i * CELL + CELL / 2;

/**
 * Each road leg runs straight from tile centre to tile centre. It is sampled finely and cut into runs
 * wherever the ground under it changes protection, so the dashes start at the ward line.
 */
function roadRuns(): Run[] {
  const runs: Run[] = [];
  for (const road of roads) {
    const pts = road.via.map(tileXY);
    for (let leg = 0; leg < pts.length - 1; leg++) {
      const [ax, ay] = pts[leg];
      const [bx, by] = pts[leg + 1];
      const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 8;
      const at = (i: number): [number, number] => [ax + ((bx - ax) * i) / steps, ay + ((by - ay) * i) / steps];
      let start = 0;
      let current: Stretch | null = null;
      for (let i = 0; i < steps; i++) {
        const [mx, my] = at(i + 0.5);
        const s = stretchOf(tileAt(Math.round(mx), Math.round(my)));
        if (current === null) current = s;
        if (s !== current) {
          const [x1, y1] = at(start);
          const [x2, y2] = at(i);
          runs.push({ key: `${road.name}-${leg}-${start}`, x1, y1, x2, y2, stretch: current });
          start = i;
          current = s;
        }
      }
      const [x1, y1] = at(start);
      runs.push({ key: `${road.name}-${leg}-${start}`, x1, y1, x2: bx, y2: by, stretch: current ?? "warded" });
    }
  }
  return runs.map((r) => ({ ...r, x1: centre(r.x1), y1: centre(r.y1), x2: centre(r.x2), y2: centre(r.y2) }));
}

/** Coastline: every edge between a land tile and a sea tile, as one path. */
function coastPath(): string {
  const d: string[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (tileAt(x, y).sea) continue;
      const px = x * CELL;
      const py = y * CELL;
      if (y === 0 || tileAt(x, y - 1).sea) d.push(`M${px} ${py}h${CELL}`);
      if (y === ROWS - 1 || tileAt(x, y + 1).sea) d.push(`M${px} ${py + CELL}h${CELL}`);
      if (x === 0 || tileAt(x - 1, y).sea) d.push(`M${px} ${py}v${CELL}`);
      if (x === COLS - 1 || tileAt(x + 1, y).sea) d.push(`M${px + CELL} ${py}v${CELL}`);
    }
  }
  return d.join("");
}

/** Road styling: warded stretches are solid, unwarded ones dashed; the casing keeps each readable on its ground. */
const ROAD: Record<Stretch, { casing: string; core: string; dash?: string }> = {
  warded: { casing: "var(--ink)", core: "var(--panel)" },
  red: { casing: "var(--ink)", core: "var(--panel)", dash: "2.5 2.5" },
  black: { casing: "var(--accent-3)", core: "var(--panel)", dash: "2.5 2.5" },
};

// Where each city label sits relative to its marker, so none sits on a road.
const LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  forgecross: { dx: -9, dy: -9, anchor: "end" },
  timberwatch: { dx: 9, dy: -9, anchor: "start" },
  quarrystone: { dx: 11, dy: 4, anchor: "start" },
  weavemere: { dx: -10, dy: 4, anchor: "end" },
  hidegate: { dx: 0, dy: 21, anchor: "middle" },
};

const LEGEND_LAND: { cls: ZoneClass; label: string }[] = [
  { cls: "blue", label: "City and its Hearth (blue)" },
  { cls: "yellow", label: "The Marches (yellow)" },
  { cls: "fringe", label: "Red fringe, T5–T6" },
  { cls: "deep", label: "Deep red, T5–T7" },
  { cls: "seam", label: "Black seam between two cities, T6–T8" },
  { cls: "wilds", label: "Black wilds, T6–T8" },
  { cls: "rim", label: "The Rim: black frontier, T7–T8" },
];

const SEA_SAMPLE: Tile[] = [
  { cls: "yellow", sea: true },
  { cls: "deep", sea: true },
  { cls: "wilds", sea: true },
  { cls: "rim", sea: true },
];

const LEGEND_ROADS: { stretch: Stretch; ground: Tile; label: string }[] = [
  { stretch: "warded", ground: { cls: "yellow", sea: false }, label: "Road in blue/yellow: protected" },
  { stretch: "red", ground: { cls: "deep", sea: false }, label: "Road in red: open PvP, full loot" },
  { stretch: "black", ground: { cls: "wilds", sea: false }, label: "Road in black: free-for-all" },
];

function Square({ t, x = 0.75, size = 12.5 }: { t: Tile; x?: number; size?: number }) {
  const pattern = PATTERN[t.cls];
  return (
    <>
      <rect x={x} y={0.75} width={size} height={12.5} fill="var(--panel)" />
      <rect x={x} y={0.75} width={size} height={12.5} fill={FILL[t.cls]} fillOpacity={opacityOf(t)} />
      {pattern && !t.sea && <rect x={x} y={0.75} width={size} height={12.5} fill={pattern} />}
    </>
  );
}

function TileSwatch({ cls }: { cls: ZoneClass }) {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <Square t={{ cls, sea: false }} />
      <rect x={0.75} y={0.75} width={12.5} height={12.5} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
    </svg>
  );
}

/** Four paler sea samples side by side: harbour, red, black and the open Deep. */
function SeaSwatch() {
  return (
    <svg viewBox="0 0 28 14" className="h-3.5 w-7 shrink-0" aria-hidden="true">
      {SEA_SAMPLE.map((t, i) => (
        <Square key={t.cls} t={t} x={0.75 + i * 6.625} size={6.625} />
      ))}
      <rect x={0.75} y={0.75} width={26.5} height={12.5} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
    </svg>
  );
}

function RoadSwatch({ stretch, ground }: { stretch: Stretch; ground: Tile }) {
  const s = ROAD[stretch];
  return (
    <svg viewBox="0 0 28 14" className="h-3.5 w-7 shrink-0" aria-hidden="true">
      <rect x={0.75} y={0.75} width={26.5} height={12.5} fill={FILL[ground.cls]} stroke="var(--ink)" strokeWidth={1.5} />
      <line x1={1.5} y1={7} x2={26.5} y2={7} stroke={s.casing} strokeWidth={5} />
      <line x1={1.5} y1={7} x2={26.5} y2={7} stroke={s.core} strokeWidth={2} strokeDasharray={s.dash ? "3 3" : undefined} />
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
      strokeWidth={italic ? 2.6 : 3.4}
      strokeLinejoin="round"
      paintOrder="stroke"
      style={italic ? undefined : { textTransform: "uppercase" }}
    >
      {children}
    </text>
  );
}

export default function ZoneMap() {
  const tiles = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = tileAt(x, y);
      if (t.sea && t.cls === "rim") continue; // the open Deep is the background
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={FILL[t.cls]}
          fillOpacity={opacityOf(t)}
        />,
      );
      const pattern = PATTERN[t.cls];
      if (pattern && !t.sea) {
        tiles.push(<rect key={`${x}-${y}-p`} x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill={pattern} />);
      }
    }
  }

  const runs = roadRuns();

  return (
    <div>
      <svg
        viewBox={`-4 -4 ${W + 8} ${H + 8}`}
        role="img"
        aria-labelledby="zonemap-title zonemap-desc"
        className="block h-auto w-full"
      >
        <title id="zonemap-title">
          Schematic of the Aldara continent with Kepler&apos;s zones: 42 by 44 tiles of 512 blocks and five city
          pockets (draft)
        </title>
        <desc id="zonemap-desc">
          A draft schematic drawn from Kepler&apos;s tile sheet, one square per 512-block tile; coordinates are still
          being verified in game. Aldara is a continent in an open sea, a little taller than it is wide. Its north is an
          ice cap, all black Rim. Forgecross sits in the snowy mountains of the north-west at tile O13 and Timberwatch
          in the northern pine wood at Z13. Quarrystone is in the centre at X22, under the central ridge, with the
          Glassmere inland sea to its north-east. Weavemere is on the bayou shore of the south coast at S30 and
          Hidegate in the south-east at AB33, where savanna meets the red deserts and the canyon. Each city has a small
          safe pocket of blue and yellow tiles; red ground surrounds every pocket, and black seams run between
          neighbouring cities, so every road between two cities crosses red and black. The Western Wilds, the outer
          deserts, the southern jungle isles and the Shattered Isles in the south-west are black frontier. Sea tiles
          carry the zone of the nearest ground and are drawn paler. Eight roads join the cities: four spokes from
          Quarrystone and four ring roads. Roads are protected only on blue and yellow tiles, drawn solid; on red and
          black tiles they are unprotected and drawn dashed.
        </desc>

        <defs>
          <pattern id="zonemap-rim" width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={4} stroke="var(--accent-3)" strokeWidth={1} strokeOpacity={0.55} />
          </pattern>
          <pattern id="zonemap-seam" width={3.5} height={3.5} patternUnits="userSpaceOnUse">
            <circle cx={1.75} cy={1.75} r={0.75} fill="var(--accent)" fillOpacity={0.75} />
          </pattern>
        </defs>

        <rect x={-2} y={-2} width={W + 4} height={H + 4} fill="var(--panel)" />
        <rect x={-2} y={-2} width={W + 4} height={H + 4} fill="var(--ink)" fillOpacity={0.09} />
        <g shapeRendering="crispEdges">{tiles}</g>

        {/* Coastline at tile resolution */}
        <path d={coastPath()} fill="none" stroke="var(--ink)" strokeWidth={1.4} strokeLinecap="square" />

        {/* Roads: a casing under a light core. Solid where warded, dashed where not. */}
        <g strokeLinecap="round">
          {runs.map((p) => (
            <line
              key={`${p.key}-case`}
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              stroke={ROAD[p.stretch].casing}
              strokeWidth={4}
            />
          ))}
        </g>
        <g>
          {runs.map((p) => (
            <line
              key={p.key}
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              stroke={ROAD[p.stretch].core}
              strokeWidth={1.6}
              strokeDasharray={ROAD[p.stretch].dash}
            />
          ))}
        </g>

        {regions.map((r) => (
          <Label key={r.name} x={r.x * CELL} y={r.y * CELL} size={10} italic>
            {r.name}
          </Label>
        ))}

        {cities.map((c) => {
          const [x, y] = tileXY(c.tile);
          const l = LABEL[c.id];
          const cx = centre(x);
          const cy = centre(y);
          return (
            <g key={c.id}>
              <rect x={cx - 5.5} y={cy - 5.5} width={11} height={11} fill="var(--panel)" stroke="var(--ink)" strokeWidth={2.5} />
              <Label x={cx + l.dx} y={cy + l.dy} size={12} anchor={l.anchor}>
                {c.name}
              </Label>
            </g>
          );
        })}

        <rect x={-2} y={-2} width={W + 4} height={H + 4} fill="none" stroke="var(--ink)" strokeWidth={4} />
      </svg>

      <ul className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2" aria-label="Map legend">
        {LEGEND_LAND.map((t) => (
          <li key={t.cls} className="flex items-center gap-2">
            <TileSwatch cls={t.cls} />
            <span>{t.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <SeaSwatch />
          <span>Sea keeps the zone of its coast, drawn paler; palest is the open Deep (black)</span>
        </li>
        {LEGEND_ROADS.map((r) => (
          <li key={r.stretch} className="flex items-center gap-2">
            <RoadSwatch stretch={r.stretch} ground={r.ground} />
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
