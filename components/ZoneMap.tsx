import { cities, roads, worldTiles } from "@/lib/content";

const N = worldTiles.length; // 23 tiles per side on the default map
const CELL = 20; // svg units per tile
const SIZE = N * CELL;

/** Map characters (WORLD_LAYOUT §3.1) grouped into the classes the map draws. */
type TileClass = "city" | "blue" | "yellow" | "fringe" | "deep" | "wedge" | "rim";

const CLASS: Record<string, TileClass> = {
  Q: "city",
  F: "city",
  T: "city",
  W: "city",
  H: "city",
  b: "blue",
  y: "yellow",
  r: "fringe",
  R: "deep",
  X: "wedge",
  "#": "rim",
};

/** The palette's own colours double as zone colours: blue, yellow, red, ink. */
const FILL: Record<TileClass, string> = {
  city: "var(--accent-2)",
  blue: "var(--accent-2)",
  yellow: "var(--accent)",
  fringe: "var(--accent-3)",
  deep: "var(--accent-3)",
  wedge: "var(--ink)",
  rim: "var(--ink)",
};

/** The red fringe is the same red, lighter, so the band reads as fringe then deep. */
const opacityOf = (cls: TileClass) => (cls === "fringe" ? 0.55 : 1);

const classAt = (x: number, y: number): TileClass => CLASS[worldTiles[y][x]];

/** A road is protected only on city, blue and yellow tiles (WORLD_LAYOUT §5). */
type Stretch = "warded" | "red" | "black";
function stretchAt(x: number, y: number): Stretch {
  const c = classAt(x, y);
  if (c === "city" || c === "blue" || c === "yellow") return "warded";
  if (c === "fringe" || c === "deep") return "red";
  return "black";
}

const mid = (i: number) => i * CELL + CELL / 2;

/** One piece of road per tile it crosses, from the half-way point before the tile to the half-way point after. */
interface Piece {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stretch: Stretch;
}

function roadPieces(): Piece[] {
  const pieces: Piece[] = [];
  for (const r of roads) {
    const [ax, ay] = r.from;
    const [bx, by] = r.to;
    const sx = Math.sign(bx - ax);
    const sy = Math.sign(by - ay);
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let i = 0; i <= steps; i++) {
      const x = ax + sx * i;
      const y = ay + sy * i;
      const back = i === 0 ? 0 : 0.5;
      const fwd = i === steps ? 0 : 0.5;
      pieces.push({
        key: `${r.name}-${i}`,
        x1: mid(x) - sx * back * CELL,
        y1: mid(y) - sy * back * CELL,
        x2: mid(x) + sx * fwd * CELL,
        y2: mid(y) + sy * fwd * CELL,
        stretch: stretchAt(x, y),
      });
    }
  }
  return pieces;
}

/** Road styling: warded stretches are solid, unwarded ones dashed; the casing keeps each readable on its ground. */
const ROAD: Record<Stretch, { casing: string; core: string; dash?: string }> = {
  warded: { casing: "var(--ink)", core: "var(--panel)" },
  red: { casing: "var(--ink)", core: "var(--panel)", dash: "3 3" },
  black: { casing: "var(--accent-3)", core: "var(--panel)", dash: "3 3" },
};

// Where each label sits relative to its city marker, so none sits on a road.
const LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  forgecross: { dx: 0, dy: -15, anchor: "middle" },
  timberwatch: { dx: 0, dy: -15, anchor: "middle" },
  quarrystone: { dx: 32, dy: 18, anchor: "start" },
  weavemere: { dx: 0, dy: 26, anchor: "middle" },
  hidegate: { dx: 0, dy: 26, anchor: "middle" },
};

const LEGEND_TILES: { cls: TileClass; label: string }[] = [
  { cls: "blue", label: "City and its Hearth (blue)" },
  { cls: "yellow", label: "The Marches (yellow)" },
  { cls: "fringe", label: "Red fringe, T5–T6" },
  { cls: "deep", label: "Deep red, T5–T7" },
  { cls: "wedge", label: "Black wedge, T6–T8" },
  { cls: "rim", label: "The Rim (black), T7–T8" },
];

const LEGEND_ROADS: { stretch: Stretch; ground: TileClass; label: string }[] = [
  { stretch: "warded", ground: "yellow", label: "Road in blue/yellow: protected" },
  { stretch: "red", ground: "deep", label: "Road in red: open PvP, full loot" },
  { stretch: "black", ground: "wedge", label: "Road in black: free-for-all" },
];

function TileSwatch({ cls }: { cls: TileClass }) {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x={0.75} y={0.75} width={12.5} height={12.5} fill="var(--panel)" />
      <rect x={0.75} y={0.75} width={12.5} height={12.5} fill={FILL[cls]} fillOpacity={opacityOf(cls)} />
      {cls === "rim" && <rect x={0.75} y={0.75} width={12.5} height={12.5} fill="url(#zonemap-rim)" />}
      <rect x={0.75} y={0.75} width={12.5} height={12.5} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
    </svg>
  );
}

function RoadSwatch({ stretch, ground }: { stretch: Stretch; ground: TileClass }) {
  const s = ROAD[stretch];
  return (
    <svg viewBox="0 0 28 14" className="h-3.5 w-7 shrink-0" aria-hidden="true">
      <rect x={0.75} y={0.75} width={26.5} height={12.5} fill={FILL[ground]} stroke="var(--ink)" strokeWidth={1.5} />
      <line x1={1.5} y1={7} x2={26.5} y2={7} stroke={s.casing} strokeWidth={5} />
      <line x1={1.5} y1={7} x2={26.5} y2={7} stroke={s.core} strokeWidth={2} strokeDasharray={s.dash} />
    </svg>
  );
}

export default function ZoneMap() {
  const tiles = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const cls = classAt(x, y);
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={FILL[cls]}
          fillOpacity={opacityOf(cls)}
          stroke="var(--bg)"
          strokeOpacity={0.35}
          strokeWidth={0.75}
        />,
      );
      if (cls === "rim") {
        tiles.push(
          <rect key={`${x}-${y}-rim`} x={x * CELL} y={y * CELL} width={CELL} height={CELL} fill="url(#zonemap-rim)" />,
        );
      }
    }
  }

  const pieces = roadPieces();

  return (
    <div>
      <svg
        viewBox={`-4 -4 ${SIZE + 8} ${SIZE + 8}`}
        role="img"
        aria-labelledby="zonemap-title zonemap-desc"
        className="block h-auto w-full"
      >
        <title id="zonemap-title">The default Kepler map: a 23 by 23 grid of zone tiles with five city pockets</title>
        <desc id="zonemap-desc">
          Each of the five server cities sits in its own safe pocket: the city tile, a ring of blue tiles, then a ring
          of yellow tiles. Quarrystone is in the centre at L12, Forgecross in the north-west at E5, Timberwatch in the
          north-east at S5, Weavemere in the south-west at E19 and Hidegate in the south-east at S19. Red bands
          separate the pockets, a lighter red fringe next to each pocket and deep red beyond it. Black wedges lie
          between neighbouring outer cities to the north, east, south and west, and a black Rim runs along the whole
          edge of the map. Charter Roads run diagonally from Quarrystone to each outer city across two red tiles; the
          Old Ring joins the outer cities through red and black; Crown Roads run from Quarrystone along both axes out
          to the Rim. Roads are protected only where they cross blue and yellow tiles; on red and black tiles they are
          unprotected and drawn dashed.
        </desc>

        <defs>
          <pattern id="zonemap-rim" width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={5} stroke="var(--accent-3)" strokeWidth={1.25} strokeOpacity={0.55} />
          </pattern>
        </defs>

        <rect x={-2} y={-2} width={SIZE + 4} height={SIZE + 4} fill="var(--panel)" stroke="var(--ink)" strokeWidth={4} />
        {tiles}

        {/* Roads: a casing under a light core. Solid where warded, dashed where not. */}
        <g strokeLinecap="square">
          {pieces.map((p) => (
            <line
              key={`${p.key}-case`}
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              stroke={ROAD[p.stretch].casing}
              strokeWidth={5}
            />
          ))}
        </g>
        <g>
          {pieces.map((p) => (
            <line
              key={p.key}
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              stroke={ROAD[p.stretch].core}
              strokeWidth={2}
              strokeDasharray={ROAD[p.stretch].dash}
            />
          ))}
        </g>

        {cities.map((c) => {
          const l = LABEL[c.id];
          const cx = mid(c.x);
          const cy = mid(c.y);
          return (
            <g key={c.id}>
              <rect x={cx - 7} y={cy - 7} width={14} height={14} fill="var(--panel)" stroke="var(--ink)" strokeWidth={3} />
              <text
                x={cx + l.dx}
                y={cy + l.dy}
                textAnchor={l.anchor}
                fontFamily="var(--display)"
                fontSize={12}
                fill="var(--panel)"
                stroke="var(--ink)"
                strokeWidth={4}
                paintOrder="stroke"
                style={{ textTransform: "uppercase" }}
              >
                {c.name}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2" aria-label="Map legend">
        {LEGEND_TILES.map((t) => (
          <li key={t.cls} className="flex items-center gap-2">
            <TileSwatch cls={t.cls} />
            <span>{t.label}</span>
          </li>
        ))}
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
