#!/usr/bin/env node
/**
 * Builds the world map from Kepler's own zone data (never from the map author's renders):
 *
 *   data/world/aldara-zonemask-v2.png  320 × 320 indexed PNG, one pixel per 64-block cell, value = zone class
 *   data/world/aldara-zones-v2.yml     cities, roads, Ward Posts, named black stretches
 *
 * Outputs:
 *   public/world/aldara-zones.svg      the zone layer: one smoothed polygon set per class, plus the coastline
 *   lib/world-map.generated.ts         overlay data for components/ZoneMap.tsx (roads split by zone, cities, …)
 *
 * The cell borders are traced into a shared boundary graph; each border chain between two junctions is smoothed
 * and simplified once and reused by both classes on its two sides, so neighbouring zones never gap or overlap.
 *
 * Usage: node scripts/build-world-map.mjs   (copies of the mask and YAML live in data/world/; refresh them from
 * KeplerServer docs/world/ when the layout changes, then re-run and commit the outputs)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MASK = join(ROOT, "data/world/aldara-zonemask-v2.png");
const YAML = join(ROOT, "data/world/aldara-zones-v2.yml");
const OUT_SVG = join(ROOT, "public/world/aldara-zones.svg");
const OUT_TS = join(ROOT, "lib/world-map.generated.ts");

/** Output units per cell. 2 keeps the half-cell smoothing points on integers (1 unit = 32 blocks). */
const U = 2;
/** Douglas–Peucker tolerance in cells. */
const TOLERANCE = 0.45;
/** Smallest island or lake kept, in cells (single stray cells vanish into their neighbours). */
const MIN_AREA = 1.5;

// ---------------------------------------------------------------- PNG (8-bit indexed, non-interlaced)

function decodePng(buf) {
  let pos = 8;
  let w = 0;
  let h = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = body.readUInt32BE(0);
      h = body.readUInt32BE(4);
      const depth = body[8];
      const colorType = body[9];
      if (depth !== 8 || (colorType !== 3 && colorType !== 0) || body[12] !== 0) {
        throw new Error(`zone mask must be an 8-bit indexed, non-interlaced PNG (depth ${depth}, type ${colorType})`);
      }
    } else if (type === "IDAT") idat.push(body);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(w * h);
  let prev = new Uint8Array(w);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (w + 1)];
    const line = raw.subarray(y * (w + 1) + 1, (y + 1) * (w + 1));
    const cur = new Uint8Array(w);
    for (let x = 0; x < w; x++) {
      const a = x > 0 ? cur[x - 1] : 0;
      const b = prev[x];
      const c = x > 0 ? prev[x - 1] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 255;
    }
    out.set(cur, y * w);
    prev = cur;
  }
  return { w, h, data: out };
}

// ---------------------------------------------------------------- the few YAML fields we need

const yaml = readFileSync(YAML, "utf8");
const num = (re) => Number(re.exec(yaml)[1]);
const CELL = num(/cell-size:\s*(\d+)/);
const ORIGIN_X = num(/raster:[\s\S]*?origin:\s*\{\s*x:\s*(-?\d+)/);
const ORIGIN_Z = num(/raster:[\s\S]*?origin:\s*\{\s*x:\s*-?\d+,\s*z:\s*(-?\d+)/);

function section(name) {
  const m = new RegExp(`^${name}:.*\\n((?:[ #].*\\n|\\n)*)`, "m").exec(yaml);
  if (!m) throw new Error(`no ${name}: section`);
  return m[1];
}

const cities = [...section("cities").matchAll(/^ {2}(\w+): \{ name: ([^,]+), x: (-?\d+), z: (-?\d+)/gm)].map((m) => ({
  id: m[1],
  name: m[2].trim(),
  x: Number(m[3]),
  z: Number(m[4]),
}));

const pairs = (s) => [...s.matchAll(/\[(-?\d+),\s*(-?\d+)\]/g)].map((m) => [Number(m[1]), Number(m[2])]);
const roads = section("roads")
  .split(/^ {2}(?=\w+:\s*$)/m)
  .filter((b) => b.trim())
  .map((block) => ({
    id: /^(\w+):/.exec(block)[1],
    name: /name: "([^"]+)"/.exec(block)[1],
    points: pairs(/points: (\[\[.*\]\])/.exec(block)[1]),
    blackStretches: [...block.matchAll(/\{ name: "([^"]+)", from: (\[[^\]]+\]), to: (\[[^\]]+\])/g)].map((m) => ({
      name: m[1],
      from: pairs(m[2])[0],
      to: pairs(m[3])[0],
    })),
    wardPosts: [...block.matchAll(/\{ city: \w+, x: (-?\d+), z: (-?\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]),
  }));
const shares = {
  safe: num(/safe-share:\s*([\d.]+)/),
  red: num(/red-share:\s*([\d.]+)/),
  black: num(/black-share:\s*([\d.]+)/),
};

// ---------------------------------------------------------------- the mask, padded with a ring of open sea

const OPEN_SEA = 15; // black wilds on water: the Deep, and everything outside the raster
const png = decodePng(readFileSync(MASK));
const W = png.w + 2;
const H = png.h + 2;
const grid = new Uint8Array(W * H).fill(OPEN_SEA);
for (let y = 0; y < png.h; y++) for (let x = 0; x < png.w; x++) grid[(y + 1) * W + x + 1] = png.data[y * png.w + x] || OPEN_SEA;
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? OPEN_SEA : grid[y * W + x]);

/** Fold specks (connected areas under MIN_AREA cells) into their most common neighbour. */
function despeckle() {
  const seen = new Uint8Array(W * H);
  for (let s = 0; s < W * H; s++) {
    if (seen[s]) continue;
    const code = grid[s];
    const cells = [s];
    seen[s] = 1;
    for (let k = 0; k < cells.length; k++) {
      const c = cells[k];
      const cx = c % W;
      const cy = (c - cx) / W;
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const n = ny * W + nx;
        if (!seen[n] && grid[n] === code) {
          seen[n] = 1;
          cells.push(n);
        }
      }
    }
    if (cells.length >= MIN_AREA) continue;
    const votes = new Map();
    for (const c of cells) {
      const cx = c % W;
      const cy = (c - cx) / W;
      for (const n of [at(cx + 1, cy), at(cx - 1, cy), at(cx, cy + 1), at(cx, cy - 1)]) {
        if (n !== code) votes.set(n, (votes.get(n) ?? 0) + 1);
      }
    }
    const best = [...votes].sort((a, b) => b[1] - a[1])[0];
    if (best) for (const c of cells) grid[c] = best[0];
  }
}
despeckle();

// ---------------------------------------------------------------- boundary graph

// Edges between differing cells. Vertex (x, y) is a grid corner; key = y * (W + 1) + x.
const VW = W + 1;
const vkey = (x, y) => y * VW + x;
const adj = new Map(); // vertex -> list of edge ids
const edges = []; // { a, b, used }
function addEdge(ax, ay, bx, by) {
  const id = edges.length;
  const a = vkey(ax, ay);
  const b = vkey(bx, by);
  edges.push({ a, b, used: false });
  for (const v of [a, b]) {
    if (!adj.has(v)) adj.set(v, []);
    adj.get(v).push(id);
  }
}
for (let y = 0; y <= H; y++) for (let x = 0; x < W; x++) if (at(x, y - 1) !== at(x, y)) addEdge(x, y, x + 1, y);
for (let y = 0; y < H; y++) for (let x = 0; x <= W; x++) if (at(x - 1, y) !== at(x, y)) addEdge(x, y, x, y + 1);

const vx = (v) => v % VW;
const vy = (v) => Math.floor(v / VW);
const isJunction = (v) => adj.get(v).length !== 2;

/** Cells to the left and right of a unit step from vertex a to vertex b (screen coordinates, y down). */
function sides(a, b) {
  const ax = vx(a);
  const ay = vy(a);
  const dx = vx(b) - ax;
  const dy = vy(b) - ay;
  if (dx === 1) return [at(ax, ay - 1), at(ax, ay)];
  if (dx === -1) return [at(ax - 1, ay), at(ax - 1, ay - 1)];
  if (dy === 1) return [at(ax, ay), at(ax - 1, ay)];
  return [at(ax - 1, ay - 1), at(ax, ay - 1)];
}

function walk(start, firstEdge) {
  const pts = [start];
  let v = start;
  let e = firstEdge;
  for (;;) {
    edges[e].used = true;
    const next = edges[e].a === v ? edges[e].b : edges[e].a;
    pts.push(next);
    v = next;
    if (isJunction(v) || v === start) break;
    e = adj.get(v).find((id) => !edges[id].used);
    if (e === undefined) break;
  }
  return pts;
}

const chains = [];
for (const [v, list] of adj) {
  if (!isJunction(v)) continue;
  for (const e of list) if (!edges[e].used) chains.push({ pts: walk(v, e), closed: false });
}
for (const [v, list] of adj) {
  for (const e of list) if (!edges[e].used) chains.push({ pts: walk(v, e), closed: true });
}

// ---------------------------------------------------------------- smoothing and simplification

/** Corners only (drop vertices in the middle of straight runs), in cell units. */
function corners(pts, closed) {
  const p = pts.map((v) => [vx(v), vy(v)]);
  const out = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    if (closed && i === n - 1) break; // last == first
    const prev = p[i - 1] ?? (closed ? p[n - 2] : null);
    const next = p[i + 1] ?? null;
    if (!prev || !next) {
      out.push(p[i]);
      continue;
    }
    const straight = (prev[0] === p[i][0] && p[i][0] === next[0]) || (prev[1] === p[i][1] && p[i][1] === next[1]);
    if (!straight) out.push(p[i]);
  }
  if (!closed) out.push(p[n - 1]);
  return out;
}

/** Cut every interior corner by half a cell, so unit staircases become diagonals and long runs stay straight. */
function cut(p, closed) {
  const out = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const cur = p[i];
    const prev = closed ? p[(i - 1 + n) % n] : p[i - 1];
    const next = closed ? p[(i + 1) % n] : p[i + 1];
    if (!prev || !next) {
      out.push(cur);
      continue;
    }
    const toward = (q) => {
      const dx = q[0] - cur[0];
      const dy = q[1] - cur[1];
      const len = Math.hypot(dx, dy);
      const d = Math.min(0.5, len / 2);
      return [cur[0] + (dx / len) * d, cur[1] + (dy / len) * d];
    };
    out.push(toward(prev), toward(next));
  }
  // drop duplicates (two cuts meeting at a segment midpoint)
  return out.filter((q, i) => {
    const r = out[i - 1];
    return !r || r[0] !== q[0] || r[1] !== q[1];
  });
}

function dp(p, tol) {
  if (p.length < 3) return p;
  const keep = new Uint8Array(p.length);
  keep[0] = keep[p.length - 1] = 1;
  const stack = [[0, p.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = p[a];
    const [bx, by] = p[b];
    const len = Math.hypot(bx - ax, by - ay);
    let best = -1;
    let bi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = len === 0 ? Math.hypot(p[i][0] - ax, p[i][1] - ay) : Math.abs((bx - ax) * (ay - p[i][1]) - (ax - p[i][0]) * (by - ay)) / len;
      if (d > best) {
        best = d;
        bi = i;
      }
    }
    if (best > tol) {
      keep[bi] = 1;
      stack.push([a, bi], [bi, b]);
    }
  }
  return p.filter((_, i) => keep[i]);
}

for (const c of chains) {
  [c.left, c.right] = sides(c.pts[0], c.pts[1]);
  let p = corners(c.pts, c.closed);
  if (c.closed) {
    p = cut(p, true);
    // split the loop at its first point and the point farthest from it, simplify both halves
    let far = 0;
    let fd = -1;
    p.forEach((q, i) => {
      const d = Math.hypot(q[0] - p[0][0], q[1] - p[0][1]);
      if (d > fd) {
        fd = d;
        far = i;
      }
    });
    const a = dp(p.slice(0, far + 1), TOLERANCE);
    const b = dp([...p.slice(far), p[0]], TOLERANCE);
    c.poly = [...a, ...b.slice(1)]; // closed: last == first
  } else {
    c.poly = dp(cut(p, false), TOLERANCE);
  }
}

// ---------------------------------------------------------------- polygons per class

const q = (v) => Math.round(v * U);
const ptKey = (p) => `${q(p[0])},${q(p[1])}`;

/** Relative path data: "M x y l dx dy …z", shortest number spelling, no redundant separators. */
function pathData(loops) {
  let d = "";
  for (const loop of loops) {
    const p = loop.map((pt) => [q(pt[0]) - U, q(pt[1]) - U]); // drop the padding ring
    let s = `M${p[0][0]} ${p[0][1]}l`;
    let last = p[0];
    let first = true;
    for (let i = 1; i < p.length - 1; i++) {
      const dx = p[i][0] - last[0];
      const dy = p[i][1] - last[1];
      if (dx === 0 && dy === 0) continue;
      s += (first || dx < 0 ? "" : " ") + dx + (dy < 0 ? "" : " ") + dy;
      first = false;
      last = p[i];
    }
    d += s + "z";
  }
  return d;
}

function loopsFor(test) {
  // directed chains with a matching class on the left, not on the right
  const parts = [];
  for (const c of chains) {
    const l = test(c.left);
    const r = test(c.right);
    if (l && !r) parts.push(c.poly);
    else if (r && !l) parts.push([...c.poly].reverse());
  }
  const byStart = new Map();
  for (const p of parts) {
    const k = ptKey(p[0]);
    if (!byStart.has(k)) byStart.set(k, []);
    byStart.get(k).push(p);
  }
  const used = new Set();
  const loops = [];
  for (const p of parts) {
    if (used.has(p)) continue;
    used.add(p);
    const loop = [...p];
    const startKey = ptKey(p[0]);
    let guard = 0;
    while (ptKey(loop[loop.length - 1]) !== startKey && guard++ < 1e6) {
      const next = (byStart.get(ptKey(loop[loop.length - 1])) ?? []).find((x) => !used.has(x));
      if (!next) throw new Error("open boundary loop");
      used.add(next);
      loop.push(...next.slice(1));
    }
    loops.push(loop);
  }
  return loops;
}

/** Palette: the site's own blue, yellow, red and ink; water is the same zone, paler. */
const LAND = {
  1: "#2a66dc", // Hearth core
  2: "#6e95e6", // Hearth
  3: "#ffd400", // Marches
  4: "#ff9b7d", // red fringe
  5: "#e8431f", // deep red
  6: "#121212", // black seam
  7: "#3d3d3d", // black wilds
  8: "#4b3566", // the Rim
};
const SEA_TINT = "#d7e1e6";
const mix = (a, b, t) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const FILL = { ...LAND };
for (let c = 1; c <= 8; c++) FILL[c + 8] = mix(LAND[c], SEA_TINT, c === 7 ? 0.8 : c === 8 ? 0.78 : 0.62);
FILL[15] = mix(LAND[7], SEA_TINT, 0.88); // the Deep

const VW_UNITS = png.w * U;
const VH_UNITS = png.h * U;
const layers = [];
for (const code of [16, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]) {
  const loops = loopsFor((c) => c === code);
  if (loops.length) layers.push(`<path fill="${FILL[code]}" d="${pathData(loops)}"/>`);
}
const coast = pathData(loopsFor((c) => c <= 8));

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW_UNITS} ${VH_UNITS}" width="${VW_UNITS}" height="${VH_UNITS}">` +
  `<!-- Kepler zones on the Aldara map (v2 draft). Built by scripts/build-world-map.mjs from Kepler's zone mask; ` +
  `1 unit = ${CELL / U} blocks. Map: Paralon Continent #1 - Aldara by Terralon. -->` +
  `<rect width="${VW_UNITS}" height="${VH_UNITS}" fill="${FILL[15]}"/>` +
  `<g stroke-linejoin="round">${layers.join("")}</g>` +
  `<path fill="none" stroke="#121212" stroke-width="1.6" stroke-linejoin="round" d="${coast}"/>` +
  `</svg>\n`;
mkdirSync(dirname(OUT_SVG), { recursive: true });
writeFileSync(OUT_SVG, svg);

// ---------------------------------------------------------------- overlay data

const toUnits = (x, z) => [((x - ORIGIN_X) / CELL) * U, ((z - ORIGIN_Z) / CELL) * U];
const round1 = (v) => Math.round(v * 10) / 10;
const codeAtBlock = (x, z) => {
  const cx = Math.floor((x - ORIGIN_X) / CELL);
  const cz = Math.floor((z - ORIGIN_Z) / CELL);
  return cx < 0 || cz < 0 || cx >= png.w || cz >= png.h ? OPEN_SEA : png.data[cz * png.w + cx] || OPEN_SEA;
};
const stretchOf = (code) => {
  const k = ((code - 1) % 8) + 1;
  return k <= 3 ? "warded" : k <= 5 ? "red" : "black";
};

/** Each road is sampled every 16 blocks and cut wherever the ground under it changes protection. */
const roadRuns = [];
for (const r of roads) {
  const samples = [];
  for (let i = 0; i < r.points.length - 1; i++) {
    const [ax, az] = r.points[i];
    const [bx, bz] = r.points[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 16));
    for (let k = 0; k < n; k++) samples.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  samples.push(r.points[r.points.length - 1]);
  let run = null;
  for (let i = 0; i < samples.length; i++) {
    const s = i < samples.length - 1 ? stretchOf(codeAtBlock(...samples[i])) : run.stretch;
    const p = toUnits(...samples[i]).map(round1);
    if (!run || run.stretch !== s) {
      if (run) {
        run.pts.push(p);
        roadRuns.push(run);
      }
      run = { road: r.name, stretch: s, pts: [p] };
    } else if (i === samples.length - 1 || isVertex(r.points, samples[i])) run.pts.push(p);
  }
  roadRuns.push(run);
}
function isVertex(points, [x, z]) {
  return points.some(([px, pz]) => px === x && pz === z);
}

const overlay = {
  width: VW_UNITS,
  height: VH_UNITS,
  blocksPerUnit: CELL / U,
  origin: { x: ORIGIN_X, z: ORIGIN_Z },
  shares,
  cities: cities.map((c) => ({ id: c.id, name: c.name, x: c.x, z: c.z, at: toUnits(c.x, c.z).map(round1) })),
  roads: roadRuns.map((r) => ({ road: r.road, stretch: r.stretch, d: "M" + r.pts.map((p) => p.join(" ")).join("L") })),
  wardPosts: roads.flatMap((r) => r.wardPosts.map(([x, z]) => toUnits(x, z).map(round1))),
  blackStretches: roads.flatMap((r) =>
    r.blackStretches.map((s) => {
      const [ax, ay] = toUnits(...s.from);
      const [bx, by] = toUnits(...s.to);
      return { name: s.name, road: r.name, at: [round1((ax + bx) / 2), round1((ay + by) / 2)] };
    }),
  ),
};

writeFileSync(
  OUT_TS,
  `// GENERATED by scripts/build-world-map.mjs from data/world/aldara-zones-v2.yml and the zone mask. Do not edit.\n` +
    `export const worldMap = ${JSON.stringify(overlay)} as const;\n`,
);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1);
console.log(`zones svg: ${kb(svg)} KB (${layers.length} layers, ${chains.length} border chains)`);
console.log(`overlay:   ${kb(readFileSync(OUT_TS, "utf8"))} KB, ${roadRuns.length} road runs`);
