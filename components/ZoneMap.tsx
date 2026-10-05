import { cities, roads, type Zone } from "@/lib/content";

const N = 20; // tiles per side on the default map
const CELL = 20; // svg units per tile
const CENTER = 10; // K11, the centre tile, as a 0-based index

/** The palette's own colours double as zone colours: blue, yellow, red, ink. */
const FILL: Record<Zone, string> = {
  blue: "var(--accent-2)",
  yellow: "var(--accent)",
  red: "var(--accent-3)",
  black: "var(--ink)",
};

/** DESIGN §8.1: rings by Chebyshev distance from the centre tile. */
function zoneAt(x: number, y: number): Zone {
  const d = Math.max(Math.abs(x - CENTER), Math.abs(y - CENTER));
  if (d <= 2) return "blue";
  if (d <= 4) return "yellow";
  if (d <= 7) return "red";
  return "black";
}

const mid = (i: number) => i * CELL + CELL / 2;
const byId = Object.fromEntries(cities.map((c) => [c.id, c]));

// Where each label sits relative to its city marker, so none overlap.
const LABEL: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  forgecross: { dx: -14, dy: -14, anchor: "end" },
  timberwatch: { dx: 14, dy: -14, anchor: "start" },
  quarrystone: { dx: 0, dy: 30, anchor: "middle" },
  weavemere: { dx: -14, dy: 24, anchor: "end" },
  hidegate: { dx: 14, dy: 24, anchor: "start" },
};

export default function ZoneMap() {
  const tiles = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      tiles.push(
        <rect
          key={`${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={FILL[zoneAt(x, y)]}
          stroke="var(--bg)"
          strokeOpacity={0.35}
          strokeWidth={0.75}
        />,
      );
    }
  }

  return (
    <svg
      viewBox={`-4 -4 ${N * CELL + 8} ${N * CELL + 8}`}
      role="img"
      aria-labelledby="zonemap-title zonemap-desc"
      className="block h-auto w-full"
    >
      <title id="zonemap-title">The default Kepler map: a 20 by 20 grid of zone tiles</title>
      <desc id="zonemap-desc">
        Concentric rings around the centre tile K11: blue near the centre, then yellow, red, and black at the edges. The
        five server cities sit in the blue ring: Forgecross north-west, Timberwatch north-east, Quarrystone in the
        centre, Weavemere south-west and Hidegate south-east, joined by four spoke roads from Quarrystone and a ring road.
      </desc>

      <rect x={-2} y={-2} width={N * CELL + 4} height={N * CELL + 4} fill="none" stroke="var(--ink)" strokeWidth={4} />
      {tiles}

      {/* Roads: an ink casing under a light core, like a drawn road on a paper map. */}
      <g strokeLinecap="square">
        {roads.map(([a, b]) => (
          <line
            key={`${a}-${b}-case`}
            x1={mid(byId[a].x)}
            y1={mid(byId[a].y)}
            x2={mid(byId[b].x)}
            y2={mid(byId[b].y)}
            stroke="var(--ink)"
            strokeWidth={6}
          />
        ))}
        {roads.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={mid(byId[a].x)}
            y1={mid(byId[a].y)}
            x2={mid(byId[b].x)}
            y2={mid(byId[b].y)}
            stroke="var(--bg)"
            strokeWidth={2.5}
            strokeDasharray="5 3"
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
  );
}
