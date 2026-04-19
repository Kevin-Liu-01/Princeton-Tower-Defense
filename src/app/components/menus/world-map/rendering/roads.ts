import { MAP_WIDTH } from "../worldMapData";
import { seededRandom } from "../worldMapUtils";
import type { WorldMapDrawContext } from "./drawContext";

const ROAD_TENSION = 0.35;
const ROAD_HW = 4.5;
// Distance (in road-half-widths) from centerline to each wheel rut.
const RUT_OFFSET = 2.4;
// How far each interior waypoint may drift perpendicular to the local
// road direction. Bigger = more meandering. End-points are never moved so
// connector segments still join cleanly.
const WOBBLE_AMP = 7;

function traceRoadPath(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  ox: number,
  oy: number
) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy);
  if (pts.length === 2) {
    ctx.lineTo(pts[1][0] + ox, pts[1][1] + oy);
  } else {
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(pts.length - 1, i + 1)];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      ctx.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) * ROAD_TENSION + ox,
        p1[1] + (p2[1] - p0[1]) * ROAD_TENSION + oy,
        p2[0] - (p3[0] - p1[0]) * ROAD_TENSION + ox,
        p2[1] - (p3[1] - p1[1]) * ROAD_TENSION + oy,
        p2[0] + ox,
        p2[1] + oy
      );
    }
  }
}

interface RoadPalette {
  /** Wide soft outer wash that feathers the road into the surrounding terrain. */
  shoulder: string;
  /** Darkest band, just outside the dirt body. */
  dirtDark: string;
  /** Main dirt surface colour. */
  dirtMid: string;
  /** Slightly lighter wash used for the worn centerline. */
  dirtLight: string;
  /** Soft lighter splotches scattered along the road. */
  patchLight: string;
  /** Soft darker splotches scattered along the road. */
  patchDark: string;
  /** Cart wheel rut colour (paired darker grooves running along the road). */
  rut: string;
  stoneBody: string[];
  stoneHighlight: string;
  stoneShadow: string;
  /** Region-flavoured flecks scattered just past the road shoulders
   *  (grass blades on grassland, snow flecks on winter, embers on volcanic, etc). */
  edgeTuft: string;
  /** Soft halo behind each edge tuft so it feels like it sits on the ground. */
  edgeTuftShadow: string;
}

function getRoadPalette(avgX: number): RoadPalette {
  if (avgX < 380) {
    // Grassland — warm beaten earth with grass tufts at the verge.
    return {
      shoulder: "rgba(70, 55, 30, 0.18)",
      dirtDark: "rgba(55, 45, 25, 0.42)",
      dirtMid: "rgba(95, 75, 42, 0.4)",
      dirtLight: "rgba(135, 110, 70, 0.35)",
      patchLight: "rgba(160, 130, 80, 0.18)",
      patchDark: "rgba(40, 30, 14, 0.22)",
      rut: "rgba(28, 18, 6, 0.38)",
      stoneBody: ["#7a6a4a", "#6a5a38", "#5a4a28", "#8a7a58"],
      stoneHighlight: "#c8b888",
      stoneShadow: "#2a1c08",
      edgeTuft: "#3c5c28",
      edgeTuftShadow: "#1a2810",
    };
  } else if (avgX < 720) {
    // Swamp — dark wet mud, mossy verge.
    return {
      shoulder: "rgba(40, 45, 28, 0.18)",
      dirtDark: "rgba(28, 32, 20, 0.45)",
      dirtMid: "rgba(60, 60, 40, 0.42)",
      dirtLight: "rgba(95, 95, 70, 0.32)",
      patchLight: "rgba(100, 100, 70, 0.16)",
      patchDark: "rgba(18, 22, 14, 0.28)",
      rut: "rgba(12, 18, 8, 0.45)",
      stoneBody: ["#5a6050", "#4a5040", "#3a4030", "#6a7058"],
      stoneHighlight: "#a0b090",
      stoneShadow: "#0e1408",
      edgeTuft: "#2c3e22",
      edgeTuftShadow: "#0a1208",
    };
  } else if (avgX < 1080) {
    // Desert — pale sandy track, lighter sand grain spillover.
    return {
      shoulder: "rgba(150, 120, 75, 0.16)",
      dirtDark: "rgba(80, 60, 30, 0.4)",
      dirtMid: "rgba(125, 95, 55, 0.4)",
      dirtLight: "rgba(170, 140, 90, 0.32)",
      patchLight: "rgba(200, 170, 110, 0.18)",
      patchDark: "rgba(70, 50, 22, 0.22)",
      rut: "rgba(60, 40, 14, 0.35)",
      stoneBody: ["#b09860", "#a08848", "#c0a870", "#907838"],
      stoneHighlight: "#f0dca8",
      stoneShadow: "#48320c",
      edgeTuft: "#dcc090",
      edgeTuftShadow: "#7a5828",
    };
  } else if (avgX < 1440) {
    // Winter — packed snow over dark stone, snow flecks at edges.
    return {
      shoulder: "rgba(150, 160, 175, 0.16)",
      dirtDark: "rgba(45, 50, 60, 0.42)",
      dirtMid: "rgba(85, 95, 110, 0.4)",
      dirtLight: "rgba(180, 195, 215, 0.35)",
      patchLight: "rgba(225, 235, 245, 0.22)",
      patchDark: "rgba(35, 42, 55, 0.28)",
      rut: "rgba(20, 28, 40, 0.4)",
      stoneBody: ["#7888a0", "#687890", "#586878", "#889ab0"],
      stoneHighlight: "#dde6f2",
      stoneShadow: "#1c2838",
      edgeTuft: "#e8efff",
      edgeTuftShadow: "#3c4a64",
    };
  }
  // Volcanic — charred ash with glowing ember flecks.
  return {
    shoulder: "rgba(50, 22, 12, 0.18)",
    dirtDark: "rgba(28, 14, 8, 0.45)",
    dirtMid: "rgba(60, 32, 20, 0.42)",
    dirtLight: "rgba(105, 60, 38, 0.32)",
    patchLight: "rgba(140, 70, 38, 0.18)",
    patchDark: "rgba(18, 8, 4, 0.28)",
    rut: "rgba(10, 4, 2, 0.45)",
    stoneBody: ["#6a3525", "#5a2518", "#7a4535", "#4a1508"],
    stoneHighlight: "#c87a52",
    stoneShadow: "#180600",
    edgeTuft: "#ff8a3c",
    edgeTuftShadow: "#3a1004",
  };
}

/**
 * Perturb interior waypoints perpendicular to their local direction (with a
 * small along-tangent jitter for spacing variation) so the resulting spline
 * meanders instead of arcing as a tidy parabola through evenly-spaced
 * anchors.
 *
 * The first and last points are returned unchanged so connector roads that
 * share endpoints (e.g. challenge spurs) still meet cleanly.
 *
 * The jitter is seeded from the path itself, so a given road wobbles the
 * same way on every render.
 */
function wobblePath(pts: number[][], amp: number): number[][] {
  if (pts.length < 3) {
    return pts;
  }
  // Stable seed derived from the start + end so the same road always wobbles
  // the same way, but different roads diverge.
  const seed = Math.round(
    pts[0][0] * 31 + pts[0][1] * 17 + pts.at(-1)![0] * 7 + pts.at(-1)![1] * 3
  );
  const out: number[][] = [pts[0]];

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const tdx = next[0] - prev[0];
    const tdy = next[1] - prev[1];
    const tLen = Math.hypot(tdx, tdy) || 1;
    const tx = tdx / tLen;
    const ty = tdy / tLen;
    const px = -ty;
    const py = tx;

    // Lateral wobble — main meander signal.
    const lateral = (seededRandom(seed + i * 137) - 0.5) * 2 * amp;

    // Small along-tangent jitter so the points aren't perfectly equidistant.
    const longitudinal = (seededRandom(seed + i * 251) - 0.5) * amp * 0.5;

    // Layer in a slow sinusoidal sway so consecutive points don't all jump
    // in opposite directions (which can read as zigzag instead of curve).
    const sway =
      Math.sin(i * 1.7 + seededRandom(seed + 11) * Math.PI) * amp * 0.4;

    out.push([
      curr[0] + px * (lateral + sway) + tx * longitudinal,
      curr[1] + py * (lateral + sway) + ty * longitudinal,
    ]);
  }

  out.push(pts.at(-1)!);
  return out;
}

/**
 * Walks pts as a Catmull-Rom spline and yields densely-sampled (x, y, tangent)
 * triples. Used by the rut, patch, and tuft helpers — each one was open-coding
 * its own copy of bezier sampling, which made the file three times longer than
 * it needed to be and meant tweaks had to be applied N times.
 */
function sampleAlongPath(
  pts: number[][],
  density: number,
  visit: (x: number, y: number, tx: number, ty: number, sIdx: number) => void
): void {
  let sIdx = 0;
  const visitSegment = (
    p1: number[],
    c1: number[],
    c2: number[],
    p2: number[]
  ) => {
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const count = Math.max(2, Math.ceil(segLen / density));
    for (let s = 0; s <= count; s++) {
      const t = s / count;
      const mt = 1 - t;
      const bx =
        mt * mt * mt * p1[0] +
        3 * mt * mt * t * c1[0] +
        3 * mt * t * t * c2[0] +
        t * t * t * p2[0];
      const by =
        mt * mt * mt * p1[1] +
        3 * mt * mt * t * c1[1] +
        3 * mt * t * t * c2[1] +
        t * t * t * p2[1];
      const tdx =
        3 * mt * mt * (c1[0] - p1[0]) +
        6 * mt * t * (c2[0] - c1[0]) +
        3 * t * t * (p2[0] - c2[0]);
      const tdy =
        3 * mt * mt * (c1[1] - p1[1]) +
        6 * mt * t * (c2[1] - c1[1]) +
        3 * t * t * (p2[1] - c2[1]);
      const tLen = Math.hypot(tdx, tdy) || 1;
      visit(bx, by, tdx / tLen, tdy / tLen, sIdx);
      sIdx++;
    }
  };

  if (pts.length === 2) {
    visitSegment(pts[0], pts[0], pts[1], pts[1]);
    return;
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[Math.min(pts.length - 1, i + 1)];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    visitSegment(
      p1,
      [
        p1[0] + (p2[0] - p0[0]) * ROAD_TENSION,
        p1[1] + (p2[1] - p0[1]) * ROAD_TENSION,
      ],
      [
        p2[0] - (p3[0] - p1[0]) * ROAD_TENSION,
        p2[1] - (p3[1] - p1[1]) * ROAD_TENSION,
      ],
      p2
    );
  }
}

/**
 * Two parallel cart-wheel ruts running along the road. Drawn as a continuous
 * polyline traced by sampling the spline at high density and offsetting each
 * sample perpendicularly by ±RUT_OFFSET. Subtle but immediately reads as a
 * "well-used" path.
 */
function drawWheelRuts(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  palette: RoadPalette
): void {
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  sampleAlongPath(pts, 4, (bx, by, tx, ty) => {
    const px = -ty;
    const py = tx;
    left.push([bx - px * RUT_OFFSET, by - py * RUT_OFFSET]);
    right.push([bx + px * RUT_OFFSET, by + py * RUT_OFFSET]);
  });

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = palette.rut;
  ctx.lineWidth = 1.4;
  for (const line of [left, right]) {
    if (line.length < 2) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i][0], line[i][1]);
    }
    ctx.stroke();
  }

  // Tiny highlight on the inside lip of each rut so the groove reads as
  // recessed rather than just a dark line.
  ctx.strokeStyle = palette.dirtLight;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 0.6;
  for (const line of [left, right]) {
    if (line.length < 2) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i][0], line[i][1]);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Soft random splotches of slightly lighter / darker dirt scattered along the
 * surface. Breaks up the otherwise uniform dirtMid stroke and makes the road
 * read as worn and patchy.
 */
function drawDirtPatches(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  palette: RoadPalette
): void {
  ctx.save();
  sampleAlongPath(pts, 12, (bx, by, tx, ty, sIdx) => {
    const px = -ty;
    const py = tx;
    const seed = sIdx * 661;
    if (seededRandom(seed) > 0.55) {
      return;
    }
    const lat = (seededRandom(seed + 17) - 0.5) * ROAD_HW * 1.7;
    const lon = (seededRandom(seed + 23) - 0.5) * 5;
    const cx = bx + px * lat + tx * lon;
    const cy = by + py * lat + ty * lon;
    const r = 2 + seededRandom(seed + 31) * 3.5;
    const isLight = seededRandom(seed + 43) > 0.5;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = isLight ? palette.patchLight : palette.patchDark;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      r,
      r * 0.55,
      seededRandom(seed + 53) * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawCobblestones(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  palette: RoadPalette
): void {
  ctx.save();
  sampleAlongPath(pts, 14, (bx, by, tx, ty, sIdx) => {
    const px = -ty;
    const py = tx;
    const baseSeed = sIdx * 997 + Math.round(bx * 7.3);
    const nStones = 1 + Math.floor(seededRandom(baseSeed) * 2);

    for (let j = 0; j < nStones; j++) {
      const lat = (seededRandom(baseSeed + j * 37) - 0.5) * ROAD_HW * 1.8;
      const lon = (seededRandom(baseSeed + j * 53) - 0.5) * 3.5;
      const sx = bx + px * lat + tx * lon;
      const sy = by + py * lat + ty * lon;
      // Bigger stones than before — the old 0.7-2.1px were basically
      // invisible. New range 1.1-2.8px reads as proper paving stones.
      const sw = 1.1 + seededRandom(baseSeed + j * 71) * 1.7;
      const sh = sw * (0.45 + seededRandom(baseSeed + j * 79) * 0.3);
      const rot = seededRandom(baseSeed + j * 89) * Math.PI;
      const cIdx = Math.floor(
        seededRandom(baseSeed + j * 97) * palette.stoneBody.length
      );

      // Drop shadow
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = palette.stoneShadow;
      ctx.beginPath();
      ctx.ellipse(
        sx + 0.45,
        sy + 0.55,
        sw * 1.15,
        sh * 1.2,
        rot,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Stone body
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = palette.stoneBody[cIdx];
      ctx.beginPath();
      ctx.ellipse(sx, sy, sw, sh, rot, 0, Math.PI * 2);
      ctx.fill();

      // Sun-side highlight
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = palette.stoneHighlight;
      ctx.beginPath();
      ctx.ellipse(
        sx - 0.35,
        sy - 0.4,
        sw * 0.55,
        sh * 0.45,
        rot,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawEdgePebbles(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  palette: RoadPalette
): void {
  ctx.save();
  sampleAlongPath(pts, 28, (bx, by, tx, ty, sIdx) => {
    const px = -ty;
    const py = tx;
    for (let side = -1; side <= 1; side += 2) {
      const eSeed = (sIdx + 5000) * 773 + side * 500;
      const offset = ROAD_HW + 1.5 + seededRandom(eSeed) * 2.5;
      const ex = bx + px * offset * side;
      const ey = by + py * offset * side;
      const ew = 0.5 + seededRandom(eSeed + 11) * 1;
      const eh = ew * (0.4 + seededRandom(eSeed + 23) * 0.2);
      const eRot = seededRandom(eSeed + 31) * Math.PI;

      ctx.globalAlpha = 0.3;
      ctx.fillStyle =
        palette.stoneBody[
          Math.floor(seededRandom(eSeed + 41) * palette.stoneBody.length)
        ];
      ctx.beginPath();
      ctx.ellipse(ex, ey, ew, eh, eRot, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Region-specific accents scattered just past the road shoulders — grass blades
 * for grassland, snow flecks for winter, sand grains for desert, mossy bumps
 * for swamp, ember motes for volcanic. They sell each region's character much
 * more than another generic pebble would.
 */
function drawEdgeTufts(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  palette: RoadPalette
): void {
  ctx.save();
  sampleAlongPath(pts, 22, (bx, by, tx, ty, sIdx) => {
    const px = -ty;
    const py = tx;
    for (let side = -1; side <= 1; side += 2) {
      const tSeed = (sIdx + 9000) * 419 + side * 313;
      // Skip ~half the candidate slots so tufts look organic, not striped.
      if (seededRandom(tSeed) > 0.55) {
        continue;
      }
      const offset = ROAD_HW + 2.4 + seededRandom(tSeed + 7) * 3.5;
      const ex =
        bx + px * offset * side + (seededRandom(tSeed + 13) - 0.5) * 1.5;
      const ey =
        by + py * offset * side + (seededRandom(tSeed + 19) - 0.5) * 1.5;
      const r = 0.7 + seededRandom(tSeed + 29) * 0.9;

      // Soft ground halo
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = palette.edgeTuftShadow;
      ctx.beginPath();
      ctx.arc(ex + 0.25, ey + 0.3, r * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Tuft body
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = palette.edgeTuft;
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawRoadSegment(
  ctx: CanvasRenderingContext2D,
  getLevelY: (pct: number) => number,
  points: [number, number][]
) {
  if (points.length < 2) {
    return;
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Convert y-percentages to pixel coords first, *then* wobble. Doing it in
  // pixel space keeps the wobble amplitude visually consistent regardless of
  // map height. End-points stay locked so adjacent road segments still
  // meet at their shared anchor.
  const pixelPts = points.map((p) => [p[0], getLevelY(p[1])]);
  const pts = wobblePath(pixelPts, WOBBLE_AMP);
  const avgX = points.reduce((s, p) => s + p[0], 0) / points.length;
  const palette = getRoadPalette(avgX);

  // 1. Wide soft shoulder — feathers the road into the surrounding terrain
  //    instead of leaving a hard edge against the grass/sand/snow underneath.
  traceRoadPath(ctx, pts, 0, 0);
  ctx.strokeStyle = palette.shoulder;
  ctx.lineWidth = 19;
  ctx.stroke();

  // 2. Sharper drop shadow under the road
  traceRoadPath(ctx, pts, 1.5, 2.5);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
  ctx.lineWidth = 14;
  ctx.stroke();

  // 3. Dark dirt bed (the silhouette / outer rim of the road body)
  traceRoadPath(ctx, pts, 0, 0);
  ctx.strokeStyle = palette.dirtDark;
  ctx.lineWidth = 13;
  ctx.stroke();

  // 4. Main dirt surface
  traceRoadPath(ctx, pts, 0, 0);
  ctx.strokeStyle = palette.dirtMid;
  ctx.lineWidth = 10;
  ctx.stroke();

  // 5. Soft random patches of lighter / darker dirt — kills the uniformity
  //    of the dirtMid stroke
  drawDirtPatches(ctx, pts, palette);

  // 6. Two parallel cart-wheel ruts — the single most "road-like" detail
  drawWheelRuts(ctx, pts, palette);

  // 7. Cobblestones scattered across the surface
  drawCobblestones(ctx, pts, palette);

  // 8. Pebbles & gravel just outside the road edge
  drawEdgePebbles(ctx, pts, palette);

  // 9. Region-flavoured tufts at the verge (grass / snow / sand / moss / embers)
  drawEdgeTufts(ctx, pts, palette);

  // 10. Thin worn centerline between the two ruts — where boots have flattened
  //     the dirt smooth. Narrower than before so the ruts stay visible.
  traceRoadPath(ctx, pts, 0, 0);
  ctx.strokeStyle = palette.dirtLight;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

export function drawRoads(dc: WorldMapDrawContext) {
  const { ctx, getLevelY } = dc;
  const draw = (points: [number, number][]) =>
    drawRoadSegment(ctx, getLevelY, points);

  // Grassland
  draw([
    [70, 50],
    [95, 47],
    [125, 42],
    [160, 38],
    [195, 40],
    [230, 46],
    [260, 53],
    [285, 58],
    [310, 62],
    [340, 60],
    [375, 58],
  ]);
  // Swamp
  draw([
    [425, 57],
    [450, 60],
    [475, 65],
    [500, 62],
    [525, 55],
    [555, 48],
    [580, 42],
    [610, 40],
    [640, 44],
    [670, 48],
    [715, 48],
  ]);
  // Desert
  draw([
    [760, 49],
    [790, 45],
    [815, 40],
    [845, 38],
    [875, 42],
    [910, 50],
    [940, 58],
    [965, 62],
    [995, 58],
    [1030, 52],
    [1075, 55],
  ]);
  // Winter
  draw([
    [1125, 55],
    [1155, 50],
    [1180, 44],
    [1210, 40],
    [1240, 44],
    [1270, 52],
    [1300, 58],
    [1330, 62],
    [1360, 58],
    [1395, 52],
    [1445, 52],
  ]);
  // Volcanic
  draw([
    [1493, 52],
    [1515, 48],
    [1540, 42],
    [1565, 38],
    [1590, 42],
    [1620, 50],
    [1650, 55],
    [1680, 52],
    [1710, 46],
    [1740, 48],
    [MAP_WIDTH - 70, 50],
  ]);

  // Challenge-level connector roads
  draw([
    [320, 58],
    [328, 50],
    [338, 43],
    [348, 37],
    [360, 32],
    [370, 30],
  ]);
  draw([
    [370, 30],
    [335, 28],
    [295, 24],
    [255, 23],
    [215, 24],
    [175, 26],
  ]);
  draw([
    [650, 56],
    [625, 60],
    [600, 65],
    [575, 68],
    [555, 70],
    [540, 70],
  ]);
  draw([
    [650, 56],
    [658, 48],
    [665, 40],
    [672, 34],
    [678, 30],
    [680, 28],
  ]);
  draw([
    [910, 38],
    [913, 34],
    [912, 30],
    [910, 27],
    [910, 25],
  ]);
  draw([
    [968, 53],
    [976, 57],
    [985, 61],
    [993, 64],
    [998, 66],
    [1000, 67],
  ]);
  draw([
    [1365, 48],
    [1338, 42],
    [1305, 37],
    [1270, 34],
    [1240, 32],
    [1210, 32],
  ]);
  draw([
    [1210, 32],
    [1240, 31],
    [1270, 30],
    [1300, 29],
    [1332, 28],
  ]);
  draw([
    [1592, 37],
    [1575, 33],
    [1558, 30],
    [1544, 28],
    [1530, 28],
  ]);
  draw([
    [1702, 59],
    [1678, 63],
    [1655, 67],
    [1635, 70],
    [1620, 72],
    [1612, 72],
  ]);
}
