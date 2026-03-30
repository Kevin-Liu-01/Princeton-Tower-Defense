import { ISO_COS, ISO_SIN } from "../../constants";
import { drawOrganicBlobAt } from "../helpers";

// Structural anchor points for each variant, all in units of `s` relative to screenPos.
// These describe where key surfaces (ledges, walls, columns, bases) are located.
interface LedgeAnchor {
  x: number;
  y: number;
  w: number; // half-width of ledge
}
interface WallAnchor {
  x: number;
  topY: number;
  botY: number;
  width: number;
}
interface ColumnAnchor {
  x: number;
  y: number;
  r: number;
  h: number;
}
interface BaseAnchor {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

interface VariantAnchors {
  ledges: LedgeAnchor[];
  walls: WallAnchor[];
  columns: ColumnAnchor[];
  bases: BaseAnchor[];
  rubbleY: number;
  extent: { minX: number; maxX: number; minY: number; maxY: number };
}

const VARIANT_ANCHORS: VariantAnchors[] = [
  // V0: Broken column ruins
  {
    ledges: [
      { x: 0, y: 2, w: 24 },       // hex base top
      { x: -10, y: -34, w: 12 },    // wall top
      { x: 2, y: -38, w: 5 },       // main column cap
      { x: 22, y: -16, w: 4 },      // short column cap
    ],
    walls: [
      { x: -24, topY: -36, botY: -2, width: 28 },
    ],
    columns: [
      { x: 2, y: 0, r: 7, h: 48 },
      { x: 22, y: 0, r: 5, h: 22 },
    ],
    bases: [{ x: 0, y: 2, rx: 24, ry: 12 }],
    rubbleY: 8,
    extent: { minX: -48, maxX: 42, minY: -38, maxY: 19 },
  },
  // V1: Grand crumbling archway
  {
    ledges: [
      { x: -18, y: -36, w: 6 },     // left pillar cap
      { x: 18, y: -20, w: 5 },      // right pillar cap (shorter)
      { x: 0, y: -42, w: 8 },       // arch top
    ],
    walls: [],
    columns: [
      { x: -18, y: 0, r: 7, h: 46 },
      { x: 18, y: 0, r: 7, h: 28 },
    ],
    bases: [{ x: 0, y: 4, rx: 28, ry: 12 }],
    rubbleY: 8,
    extent: { minX: -28, maxX: 28, minY: -42, maxY: 19 },
  },
  // V2: L-shaped collapsed wall
  {
    ledges: [
      { x: -10, y: -34, w: 16 },    // back wall top
      { x: 20, y: -24, w: 10 },     // perp wall top
      { x: -6, y: -6, w: 4 },       // column stump cap
    ],
    walls: [
      { x: -28, topY: -34, botY: -2, width: 36 },
      { x: 10, topY: -24, botY: -2, width: 22 },
    ],
    columns: [
      { x: -6, y: 0, r: 5, h: 12 },
    ],
    bases: [{ x: 0, y: 4, rx: 30, ry: 12 }],
    rubbleY: 8,
    extent: { minX: -33, maxX: 38, minY: -34, maxY: 19 },
  },
  // V3: Ruined tower base
  {
    ledges: [
      { x: -4, y: -38, w: 8 },      // curved wall crest
      { x: -16, y: -36, w: 3 },     // parapet block
      { x: -6, y: -36, w: 3 },      // parapet block
      { x: 4, y: -36, w: 3 },       // parapet block
      { x: 22, y: -10, w: 3 },      // column remnant cap
    ],
    walls: [
      { x: -22, topY: -42, botY: 3, width: 36 },
    ],
    columns: [
      { x: 22, y: 0, r: 4, h: 16 },
    ],
    bases: [{ x: 0, y: 3, rx: 26, ry: 14 }],
    rubbleY: 8,
    extent: { minX: -36, maxX: 30, minY: -42, maxY: 18 },
  },
  // V4: Sunken temple (isometric 3D)
  {
    ledges: [
      { x: -28, y: -32, w: 6 },     // left wall top
      { x: 15, y: -26, w: 7 },      // right wall top
      { x: 0, y: -27, w: 5 },       // central column cap
      { x: -10, y: -2, w: 4 },      // slab tops
      { x: 12, y: -1, w: 4 },       // slab tops
    ],
    walls: [
      { x: -28, topY: -38, botY: 5, width: 14 },
      { x: 15, topY: -32, botY: 5, width: 16 },
    ],
    columns: [
      { x: 0, y: 0, r: 7, h: 42 },
    ],
    bases: [{ x: 0, y: 8, rx: 46, ry: 22 }],
    rubbleY: 10,
    extent: { minX: -42, maxX: 44, minY: -38, maxY: 21 },
  },
  // V5: Fortress ruins
  {
    ledges: [
      { x: 0, y: 2, w: 26 },        // hex base top
      { x: -9, y: -38, w: 13 },     // back wall top
      { x: 2, y: -42, w: 5 },       // main column cap
      { x: 22, y: -18, w: 4 },      // column 2 cap
      { x: -18, y: -8, w: 3 },      // column 3 stub cap
    ],
    walls: [
      { x: -24, topY: -38, botY: -2, width: 30 },
    ],
    columns: [
      { x: 2, y: 0, r: 7, h: 52 },
      { x: 22, y: 0, r: 5, h: 24 },
      { x: -18, y: 0, r: 4, h: 14 },
    ],
    bases: [{ x: 0, y: 2, rx: 26, ry: 13 }],
    rubbleY: 8,
    extent: { minX: -48, maxX: 42, minY: -42, maxY: 20 },
  },
  // V6: Grand ruined temple complex
  {
    ledges: [
      { x: -34, y: -52, w: 30 },    // back facade top
      { x: -28, y: -28, w: 4 },     // col 0 cap
      { x: -14, y: -40, w: 4 },     // col 1 cap (tallest)
      { x: 0, y: -34, w: 5 },       // col 2 cap
      { x: 14, y: -18, w: 4 },      // col 3 cap (broken short)
      { x: -10, y: -38, w: 5 },     // niche arch top
    ],
    walls: [
      { x: -34, topY: -52, botY: -2, width: 68 },
    ],
    columns: [
      { x: -28, y: 0, r: 5, h: 34 },
      { x: -14, y: 0, r: 5.5, h: 46 },
      { x: 0, y: 0, r: 6, h: 40 },
      { x: 14, y: 0, r: 5.5, h: 24 },
      { x: 28, y: 0, r: 5, h: 11 },
    ],
    bases: [{ x: 0, y: 8, rx: 52, ry: 26 }],
    rubbleY: 10,
    extent: { minX: -48, maxX: 46, minY: -52, maxY: 21 },
  },
];

// ============================================================================
// Isometric helpers for placing overlays on surfaces
// ============================================================================

// Seed-driven snow cap with 5 distinct shape variants using layered organic blobs
function isoSnowCap(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  s: number,
  seed: number = 0,
): void {
  const iW = w * ISO_COS;
  const iD = w * ISO_SIN;
  const shape = Math.floor(seed) % 5;
  const th = (1.5 + (seed % 7) * 0.12) * s;
  const windOff = ((seed % 9) - 4) * s * 0.4;
  const baseBump = 0.16 + (shape % 3) * 0.02;
  const capCY = cy + iD * 0.45;

  if (shape === 0) {
    // Lumpy asymmetric — thicker on the left
    drawOrganicBlobAt(ctx, cx + windOff - iW * 0.08, capCY - th * 0.25, iW * 0.95, (iD + th * 0.5) * 0.7, seed, baseBump + 0.04, 20);
    ctx.fill();
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * 0.6;
    drawOrganicBlobAt(ctx, cx - iW * 0.3 + windOff, capCY - th * 0.4, iW * 0.45, iD * 0.55, seed * 3.1, baseBump + 0.06, 14);
    ctx.fill();
    ctx.restore();
  } else if (shape === 1) {
    // Wind-sculpted — offset to one side with overhang
    const ovhOff = iW * (0.12 + (seed % 6) * 0.02);
    drawOrganicBlobAt(ctx, cx + ovhOff, capCY - th * 0.2, iW * 1.05, (iD + th * 0.4) * 0.65, seed, baseBump, 20);
    ctx.fill();
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#b0c0d8";
    drawOrganicBlobAt(ctx, cx + iW * 0.6 + ovhOff, capCY + iD * 0.3, iW * 0.3, iD * 0.25, seed * 2.1, 0.22, 10);
    ctx.fill();
    ctx.restore();
  } else if (shape === 2) {
    // Double-humped — two overlapping organic mounds
    drawOrganicBlobAt(ctx, cx - iW * 0.2 + windOff, capCY - th * 0.3, iW * 0.65, (iD + th * 0.4) * 0.6, seed, baseBump + 0.03, 16);
    ctx.fill();
    drawOrganicBlobAt(ctx, cx + iW * 0.22 + windOff, capCY - th * 0.25, iW * 0.6, (iD + th * 0.35) * 0.55, seed * 2.3, baseBump + 0.02, 16);
    ctx.fill();
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * 0.25;
    ctx.fillStyle = "#ffffff";
    drawOrganicBlobAt(ctx, cx + iW * 0.15 + windOff, capCY - th * 0.4, iW * 0.25, iD * 0.2, seed * 4.7, 0.2, 10);
    ctx.fill();
    ctx.restore();
  } else if (shape === 3) {
    // Thin crescent — partial coverage
    const coverage = 0.65 + (seed % 8) * 0.03;
    drawOrganicBlobAt(ctx, cx + iW * 0.1 + windOff, capCY - th * 0.15, iW * coverage, (iD + th * 0.3) * 0.5, seed, baseBump + 0.04, 16);
    ctx.fill();
  } else {
    // Classic even mound
    drawOrganicBlobAt(ctx, cx + windOff, capCY - th * 0.25, iW * 0.9, (iD + th * 0.5) * 0.65, seed, baseBump, 18);
    ctx.fill();
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * 0.2;
    ctx.fillStyle = "#ffffff";
    drawOrganicBlobAt(ctx, cx + windOff * 0.5, capCY - th * 0.4, iW * 0.4, iD * 0.22, seed * 2.3, 0.22, 10);
    ctx.fill();
    ctx.restore();
  }
}

// Crescent-shaped snow wrap on a cylindrical column
function isoColumnSnow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  capY: number,
  r: number,
  s: number,
  seed: number,
): void {
  const iR = r * ISO_COS * s;
  const iD = r * ISO_SIN * s;
  const th = (1.5 + (seed % 5) * 0.2) * s;
  const drift = ((seed % 3) - 1) * iR * 0.15;

  // Snow sitting on top of column cap
  ctx.save();
  ctx.fillStyle = "#e6eef8";
  ctx.globalAlpha = 0.85;
  drawOrganicBlobAt(ctx, cx + drift, capY, iR * 1.05, iD * 1.05, seed, 0.18, 14);
  ctx.fill();

  // Thicker ridge on the windward side
  ctx.fillStyle = "#eef4fc";
  ctx.globalAlpha = 0.7;
  drawOrganicBlobAt(ctx, cx + drift - iR * 0.2, capY - th * 0.3, iR * 0.6, iD * 0.5, seed * 1.7, 0.2, 12);
  ctx.fill();

  // Snow draping down the front face of the column
  ctx.fillStyle = "#dce6f2";
  ctx.globalAlpha = 0.5;
  const drapLen = (2 + (seed % 4)) * s;
  ctx.beginPath();
  ctx.moveTo(cx + drift - iR * 0.4, capY + iD * 0.8);
  ctx.quadraticCurveTo(cx + drift, capY + iD + drapLen * 0.6, cx + drift + iR * 0.3, capY + iD + drapLen);
  ctx.lineTo(cx + drift + iR * 0.5, capY + iD * 0.6);
  ctx.quadraticCurveTo(cx + drift, capY + iD * 0.4, cx + drift - iR * 0.4, capY + iD * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Irregular snow drift on the ground plane with organic, non-diamond edges
function isoSnowDrift(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  d: number,
  s: number,
  seed: number,
): void {
  const iW = w * ISO_COS * s;
  const iD = d * ISO_SIN * s;
  const pts = 8;
  const angles: number[] = [];
  const radii: number[] = [];
  for (let i = 0; i < pts; i++) {
    angles.push((i / pts) * Math.PI * 2);
    const wobble = 0.7 + ((seed + i * 37) % 10) * 0.05;
    radii.push(wobble);
  }

  const driftG = ctx.createRadialGradient(cx, cy, 1 * s, cx, cy, Math.max(iW, iD));
  driftG.addColorStop(0, "rgba(235,242,252,0.5)");
  driftG.addColorStop(0.4, "rgba(225,234,248,0.35)");
  driftG.addColorStop(0.8, "rgba(215,225,242,0.15)");
  driftG.addColorStop(1, "rgba(210,220,240,0)");
  ctx.fillStyle = driftG;

  ctx.beginPath();
  const firstX = cx + Math.cos(angles[0]) * iW * radii[0];
  const firstY = cy + Math.sin(angles[0]) * iD * radii[0];
  ctx.moveTo(firstX, firstY);
  for (let i = 1; i <= pts; i++) {
    const cur = i % pts;
    const prev = (i - 1) % pts;
    const cpAngle = (angles[prev] + angles[cur]) * 0.5;
    const cpR = (radii[prev] + radii[cur]) * 0.5 * (1 + ((seed + i * 13) % 6) * 0.02);
    const cpx = cx + Math.cos(cpAngle) * iW * cpR;
    const cpy = cy + Math.sin(cpAngle) * iD * cpR;
    const px = cx + Math.cos(angles[cur]) * iW * radii[cur];
    const py = cy + Math.sin(angles[cur]) * iD * radii[cur];
    ctx.quadraticCurveTo(cpx, cpy, px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function isoIcicle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  width: number,
  s: number,
): void {
  const iceG = ctx.createLinearGradient(x, y, x, y + len);
  iceG.addColorStop(0, "rgba(190,220,245,0.65)");
  iceG.addColorStop(0.4, "rgba(175,210,240,0.45)");
  iceG.addColorStop(1, "rgba(160,200,240,0.05)");
  ctx.fillStyle = iceG;
  ctx.beginPath();
  ctx.moveTo(x - width, y);
  ctx.quadraticCurveTo(x - width * 0.3, y + len * 0.7, x, y + len);
  ctx.quadraticCurveTo(x + width * 0.3, y + len * 0.7, x + width, y);
  ctx.closePath();
  ctx.fill();

  // Inner highlight
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(x - width * 0.2, y + 0.5 * s);
  ctx.quadraticCurveTo(x, y + len * 0.5, x + width * 0.1, y + len * 0.65);
  ctx.lineTo(x + width * 0.15, y + 0.5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function isoVine(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  len: number,
  sway: number,
  s: number,
  seed: number,
  stemColor: string,
  leafColor: string,
  leafHighlight: string,
): void {
  const cp1x = ax + sway * 0.6;
  const cp1y = ay + len * 0.3;
  const cp2x = ax - sway * 0.4;
  const cp2y = ay + len * 0.65;
  const endX = ax + sway * 0.3;
  const endY = ay + len;

  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#1a3518";
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.stroke();

  ctx.strokeStyle = stemColor;
  ctx.lineWidth = 0.7 * s;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.stroke();

  const leafCount = 2 + (Math.floor(seed) % 3);
  for (let lf = 0; lf < leafCount; lf++) {
    const t = (lf + 0.4) / (leafCount + 0.5);
    const omt = 1 - t;
    const lx =
      omt * omt * omt * ax +
      3 * omt * omt * t * cp1x +
      3 * omt * t * t * cp2x +
      t * t * t * endX;
    const ly =
      omt * omt * omt * ay +
      3 * omt * omt * t * cp1y +
      3 * omt * t * t * cp2y +
      t * t * t * endY;
    const leafSide = (lf + Math.floor(seed)) % 2 === 0 ? -1 : 1;
    const leafSz = (1.6 + (Math.floor(seed + lf * 17) % 10) * 0.12) * s;

    ctx.globalAlpha = 0.65;
    ctx.fillStyle = leafColor;
    ctx.beginPath();
    ctx.ellipse(lx + leafSide * 2 * s, ly, leafSz, leafSz * 0.4, leafSide * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = leafHighlight;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(lx + leafSide * 2 * s, ly - 0.3 * s, leafSz * 0.6, leafSz * 0.25, leafSide * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function isoMossOnSurface(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  s: number,
  color: string,
  alpha: number,
  seed: number = 0,
): void {
  const iW = w * ISO_COS;
  const iD = w * ISO_SIN;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  drawOrganicBlobAt(ctx, cx, cy + iD * 0.45, iW * 0.8, iD * 0.75, seed, 0.22, 14);
  ctx.fill();
  ctx.restore();
}

function isoSandDrift(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  d: number,
  s: number,
  seed: number = 0,
): void {
  const iW = w * ISO_COS;
  const iD = d * ISO_SIN;
  const driftG = ctx.createLinearGradient(cx - iW, cy, cx + iW, cy + iD);
  driftG.addColorStop(0, "rgba(180,160,120,0)");
  driftG.addColorStop(0.25, "rgba(195,175,135,0.35)");
  driftG.addColorStop(0.6, "rgba(200,180,140,0.4)");
  driftG.addColorStop(1, "rgba(180,160,120,0)");
  ctx.fillStyle = driftG;
  drawOrganicBlobAt(ctx, cx, cy, iW, iD, seed, 0.2, 16);
  ctx.fill();
}

function isoFrostCrystal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  armLen: number,
): void {
  for (let a = 0; a < 6; a++) {
    const angle = (a * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle) * armLen,
      cy + Math.sin(angle) * armLen * ISO_SIN / ISO_COS,
    );
    ctx.stroke();
  }
}

function lavaCrackSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  s: number,
): void {
  // Wide glow bloom
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#ff8040";
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Core crack
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#e85a20";
  ctx.lineWidth = 0.9 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Hot center
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#ffaa50";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// Main entry point
// ============================================================================

export function drawRuinsRegionalOverlay(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  ruinVariant: number,
  mapTheme: string,
  vineColor: string,
  decorX: number,
  decorY: number,
): void {
  const v = Math.min(ruinVariant, 6);
  const anchors = VARIANT_ANCHORS[v];
  const seed = Math.abs(decorX * 73.1 + decorY * 137.3);

  if (mapTheme === "swamp") {
    drawSwampOverlay(ctx, ox, oy, s, anchors, seed, vineColor, v);
  } else if (mapTheme === "desert") {
    drawDesertOverlay(ctx, ox, oy, s, anchors, seed, v);
  } else if (mapTheme === "winter") {
    drawWinterOverlay(ctx, ox, oy, s, anchors, seed, v);
  } else if (mapTheme === "volcanic") {
    drawVolcanicOverlay(ctx, ox, oy, s, anchors, seed, v);
  } else if (mapTheme === "grassland") {
    drawGrasslandOverlay(ctx, ox, oy, s, anchors, seed, v);
  }
}

// ============================================================================
// SWAMP OVERLAY
// ============================================================================

function drawSwampOverlay(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  a: VariantAnchors,
  seed: number,
  vineColor: string,
  v: number,
): void {
  // Isometric moss on each ledge surface
  for (let li = 0; li < a.ledges.length; li++) {
    const ledge = a.ledges[li];
    const lx = ox + ledge.x * s;
    const ly = oy + ledge.y * s;
    const mossW = ledge.w * 0.6;
    const colors = ["#1a3a18", "#2a4a20", "#3a5a2a"];
    for (let layer = 0; layer < 2; layer++) {
      const offX = ((seed + li * 47 + layer * 31) % 6 - 3) * s;
      const offY = ((seed + li * 23 + layer * 17) % 4 - 2) * s * ISO_SIN;
      isoMossOnSurface(
        ctx,
        lx + offX,
        ly + offY,
        (mossW + layer * 1.5) * s,
        s,
        colors[(li + layer) % 3],
        0.35 + layer * 0.1,
        seed + li * 47 + layer * 31,
      );
    }
  }

  // Vines hanging from walls — anchor to actual wall tops
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    const wallMidX = ox + (wall.x + wall.width * 0.5) * s;
    const vineCount = Math.min(4, Math.max(2, Math.floor(wall.width / 10)));
    for (let vi = 0; vi < vineCount; vi++) {
      const vx = ox + (wall.x + ((vi + 0.5) / vineCount) * wall.width) * s;
      const vy = oy + wall.topY * s;
      const vLen = (8 + ((seed + wi * 37 + vi * 19) % 12)) * s;
      const sway = ((seed + vi * 43 + wi * 61) % 8 - 4) * s;
      isoVine(ctx, vx, vy, vLen, sway, s, seed + vi * 7 + wi * 13, vineColor, "#1e4420", "#2a6030");
    }
  }

  // Vines hanging from column caps
  for (let ci = 0; ci < a.columns.length; ci++) {
    const col = a.columns[ci];
    const cx = ox + col.x * s;
    const cy = oy + (col.y - col.h) * s;
    const vLen = (6 + ((seed + ci * 29) % 10)) * s;
    const sway = ((seed + ci * 53) % 6 - 3) * s;
    isoVine(ctx, cx + col.r * 0.5 * s, cy + 2 * s, vLen, sway, s, seed + ci * 11, vineColor, "#1e4420", "#2a6030");
  }

  // Fungal growths at column/wall bases
  ctx.save();
  ctx.globalAlpha = 0.6;
  const fungalAnchors = [
    ...a.columns.map((c) => ({ x: c.x + c.r * 0.8, y: c.y })),
    ...a.walls.map((w) => ({ x: w.x + 3, y: w.botY })),
  ];
  for (let i = 0; i < Math.min(fungalAnchors.length, 4); i++) {
    const fa = fungalAnchors[i];
    const fx = ox + fa.x * s;
    const fy = oy + fa.y * s;
    const fSz = (1.2 + ((seed + i * 29) % 3) * 0.4) * s;
    ctx.fillStyle = "#4a4a3a";
    ctx.fillRect(fx - 0.3 * s, fy - fSz * 1.8, 0.6 * s, fSz * 1.8);
    ctx.fillStyle = i % 2 === 0 ? "#5a3a28" : "#3a5a2a";
    ctx.beginPath();
    ctx.ellipse(fx, fy - fSz * 1.8, fSz, fSz * 0.5, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(fx, fy - fSz * 1.6, fSz * 0.7, fSz * 0.2, 0, 0, Math.PI);
    ctx.fill();
  }
  ctx.restore();

  // Damp ground pool at the base — isometric diamond shape
  for (let bi = 0; bi < a.bases.length; bi++) {
    const base = a.bases[bi];
    const bx = ox + base.x * s;
    const by = oy + (base.y + 4) * s;
    const dampW = base.rx * 0.7;
    const dampD = base.ry * 0.7;
    const iW = dampW * ISO_COS * s;
    const iD = dampD * ISO_SIN * s;
    const dampG = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(iW, iD));
    dampG.addColorStop(0, "rgba(30,60,40,0.2)");
    dampG.addColorStop(0.6, "rgba(30,60,40,0.08)");
    dampG.addColorStop(1, "rgba(30,60,40,0)");
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = dampG;
    drawOrganicBlobAt(ctx, bx, by, iW, iD, seed + bi * 67, 0.2, 16);
    ctx.fill();
    ctx.restore();
  }

  // Water stains on wall faces
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#1a3a2a";
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    for (let i = 0; i < 3; i++) {
      const sx = ox + (wall.x + ((seed + i * 89 + wi * 53) % Math.max(1, wall.width))) * s;
      const sy = oy + (wall.topY + ((seed + i * 43 + wi * 31) % Math.max(1, Math.abs(wall.botY - wall.topY)))) * s;
      const stainH = (3 + ((seed + i * 31) % 5)) * s;
      drawOrganicBlobAt(ctx, sx, sy + stainH * 0.5, 0.8 * s, stainH, seed + i * 89 + wi * 53, 0.2, 10);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ============================================================================
// DESERT OVERLAY
// ============================================================================

function drawDesertOverlay(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  a: VariantAnchors,
  seed: number,
  v: number,
): void {
  // Isometric sand drifts banked against base structures
  for (let bi = 0; bi < a.bases.length; bi++) {
    const base = a.bases[bi];
    const bx = ox + (base.x + 4) * s;
    const by = oy + (base.y + 3) * s;
    isoSandDrift(ctx, bx, by, base.rx * 0.9, base.ry * 0.8, s, seed + bi * 31);
  }

  // Smaller drifts against walls and columns (lee side — offset right/down in iso)
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    const wx = ox + (wall.x + wall.width * 0.7) * s;
    const wy = oy + wall.botY * s;
    isoSandDrift(ctx, wx, wy + 2 * s, wall.width * 0.3, 6, s, seed + wi * 47);
  }
  for (let ci = 0; ci < a.columns.length; ci++) {
    const col = a.columns[ci];
    const cx = ox + (col.x + col.r * 1.2) * s;
    const cy = oy + col.y * s;
    isoSandDrift(ctx, cx, cy + 2 * s, col.r * 1.8, col.r, s, seed + ci * 59);
  }

  // Sand-eroded patches on wall faces
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#a89068";
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    for (let i = 0; i < 3; i++) {
      const ex = ox + (wall.x + ((seed + i * 73 + wi * 41) % Math.max(1, wall.width))) * s;
      const ey = oy + (wall.topY + ((seed + i * 59) % Math.max(1, Math.abs(wall.botY - wall.topY))) * 0.6) * s;
      const ew = (2.5 + ((seed + i * 31) % 3)) * s;
      drawOrganicBlobAt(ctx, ex, ey, ew, ew * 0.6, seed + i * 19 + wi * 37, 0.25, 10);
      ctx.fill();
    }
  }
  ctx.restore();

  // Wind-blown sand streaks — oriented along isometric wind direction
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#c0a878";
  ctx.lineWidth = 0.6 * s;
  const { minX, maxX, minY, maxY } = a.extent;
  for (let i = 0; i < 6; i++) {
    const sx = ox + (minX + ((seed + i * 53) % Math.max(1, maxX - minX))) * s;
    const sy = oy + (((seed + i * 29) % Math.max(1, Math.abs(maxY - minY))) + minY) * s;
    const sLen = (5 + ((seed + i * 17) % 7)) * s;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + sLen * ISO_COS * 0.5, sy + sLen * ISO_SIN * 0.3,
      sx + sLen * ISO_COS, sy + sLen * ISO_SIN * 0.5,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Sand ripple lines near the base — properly isometric
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#b0986a";
  ctx.lineWidth = 0.4 * s;
  for (let bi = 0; bi < a.bases.length; bi++) {
    const base = a.bases[bi];
    const bx = ox + base.x * s;
    const by = oy + (base.y + 5) * s;
    for (let i = 0; i < 5; i++) {
      const rOff = (i - 2) * 2.5 * s;
      const rW = (base.rx * 0.5 + ((seed + i * 37) % 6)) * s;
      const iW = rW * ISO_COS;
      const iD = rW * ISO_SIN;
      ctx.beginPath();
      ctx.moveTo(bx - iW, by + rOff + iD);
      ctx.quadraticCurveTo(bx, by + rOff - 0.5 * s, bx + iW, by + rOff + iD);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Sand piles against column bases — isometric ellipses
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let ci = 0; ci < a.columns.length; ci++) {
    const col = a.columns[ci];
    const px = ox + (col.x + col.r * 0.5) * s;
    const py = oy + (col.y + 1) * s;
    const pr = (col.r * 0.6 + 1) * s;
    ctx.fillStyle = ci % 2 === 0 ? "#b8a078" : "#c4aa80";
    drawOrganicBlobAt(ctx, px, py, pr * ISO_COS, pr * ISO_SIN, seed + ci * 41, 0.22, 12);
    ctx.fill();
  }
  ctx.restore();
}

// ============================================================================
// WINTER OVERLAY
// ============================================================================

function drawWinterOverlay(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  a: VariantAnchors,
  seed: number,
  v: number,
): void {
  // --- Varied snow caps on each ledge (each gets a different shape variant) ---
  ctx.save();
  ctx.fillStyle = "#e4ecf6";
  ctx.globalAlpha = 0.8;
  for (let li = 0; li < a.ledges.length; li++) {
    const ledge = a.ledges[li];
    const lx = ox + ledge.x * s;
    const ly = oy + ledge.y * s;
    const capSeed = seed + li * 71 + v * 37;
    isoSnowCap(ctx, lx, ly, ledge.w * s, s, capSeed);
  }
  ctx.restore();

  // --- Snow wrapping column caps with crescent drape ---
  for (let ci = 0; ci < a.columns.length; ci++) {
    const col = a.columns[ci];
    const cx = ox + col.x * s;
    const capY = oy + (col.y - col.h) * s;
    isoColumnSnow(ctx, cx, capY, col.r, s, seed + ci * 53 + v * 19);
  }

  // --- Irregular organic snow drifts at the base ---
  for (let bi = 0; bi < a.bases.length; bi++) {
    const base = a.bases[bi];
    const bx = ox + (base.x + 3) * s;
    const by = oy + (base.y + 3) * s;
    isoSnowDrift(ctx, bx, by, base.rx * 0.8, base.ry * 0.8, s, seed + bi * 43 + v * 23);
  }

  // --- Smaller secondary drifts blown against walls ---
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    const driftCount = Math.min(3, Math.max(1, Math.floor(wall.width / 14)));
    for (let di = 0; di < driftCount; di++) {
      const dx = ox + (wall.x + ((di + 0.5) / driftCount) * wall.width) * s;
      const dy = oy + (wall.botY + 2) * s;
      isoSnowDrift(ctx, dx, dy, 5 + (seed + di * 29) % 4, 3 + (seed + di * 17) % 2, s, seed + wi * 61 + di * 47);
    }
  }

  // --- Icicle clusters from ledge edges and column caps ---
  // Each ledge spawns a cluster of 2-4 icicles at slightly different offsets
  ctx.save();
  ctx.globalAlpha = 0.6;
  for (let li = 0; li < a.ledges.length; li++) {
    const ledge = a.ledges[li];
    const iW = ledge.w * ISO_COS;
    const clusterSeed = seed + li * 71;
    const clusterSize = 2 + (clusterSeed % 3);
    const baseX = ledge.x - iW * 0.4 + ((clusterSeed % 5) - 2) * 0.1 * iW;
    const baseY = ledge.y + ledge.w * ISO_SIN * 0.6;
    for (let ic = 0; ic < clusterSize; ic++) {
      const icSeed = clusterSeed + ic * 31;
      const offX = ((icSeed % 7) - 3) * 1.5;
      const offY = ((icSeed % 5) - 2) * 0.5;
      const ix = ox + (baseX + offX) * s;
      const iy = oy + (baseY + offY) * s;
      const iLen = (2.5 + (icSeed % 8) * 0.7) * s;
      const iWidth = (0.5 + (icSeed % 4) * 0.2) * s;
      isoIcicle(ctx, ix, iy, iLen, iWidth, s);
    }
  }
  // Icicles from column caps
  for (let ci = 0; ci < a.columns.length; ci++) {
    const col = a.columns[ci];
    const colSeed = seed + ci * 59;
    const count = 1 + (colSeed % 3);
    for (let ic = 0; ic < count; ic++) {
      const icSeed = colSeed + ic * 23;
      const angle = (ic / count) * Math.PI * 0.8 + 0.3;
      const ix = ox + (col.x + Math.cos(angle) * col.r * 0.6) * s;
      const iy = oy + (col.y - col.h + Math.sin(angle) * col.r * 0.3 + col.r * 0.3) * s;
      const iLen = (2 + (icSeed % 7) * 0.6) * s;
      const iWidth = (0.5 + (icSeed % 3) * 0.25) * s;
      isoIcicle(ctx, ix, iy, iLen, iWidth, s);
    }
  }
  ctx.restore();

  // --- Snow powder dusting on wall faces ---
  ctx.save();
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    const dustCount = Math.min(5, Math.max(2, Math.floor(wall.width / 8)));
    for (let i = 0; i < dustCount; i++) {
      const dustSeed = seed + wi * 67 + i * 41;
      const dx = ox + (wall.x + ((i + 0.4) / dustCount) * wall.width) * s;
      const wallH = Math.abs(wall.botY - wall.topY);
      const dy = oy + (wall.topY + ((dustSeed % Math.max(1, Math.floor(wallH))) * 0.7)) * s;
      const dw = (2 + (dustSeed % 4)) * s;
      const dh = (0.8 + (dustSeed % 3) * 0.3) * s;
      ctx.globalAlpha = 0.2 + (dustSeed % 5) * 0.04;
      ctx.fillStyle = (dustSeed % 2 === 0) ? "#dde8f4" : "#e8f0fc";
      drawOrganicBlobAt(ctx, dx, dy, dw * ISO_COS, dh, dustSeed * 1.7, 0.2, 10);
      ctx.fill();
    }
  }
  ctx.restore();

  // --- Frost crystal patterns on wall faces (varied arm counts and sizes) ---
  ctx.save();
  ctx.strokeStyle = "#c8daf0";
  ctx.lineWidth = 0.5 * s;
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    const crystalCount = Math.min(4, Math.max(2, Math.floor(wall.width / 12)));
    for (let i = 0; i < crystalCount; i++) {
      const crSeed = seed + i * 41 + wi * 7;
      const fcx = ox + (wall.x + ((i + 0.5) / crystalCount) * wall.width) * s;
      const fcy = oy + ((wall.topY + wall.botY) * 0.5 + ((crSeed) % 6 - 3)) * s;
      const armLen = (1.5 + (crSeed % 5) * 0.5) * s;
      ctx.globalAlpha = 0.15 + (crSeed % 4) * 0.03;
      const armCount = 4 + (crSeed % 3);
      for (let ac = 0; ac < armCount; ac++) {
        const angle = (ac * Math.PI * 2) / armCount + (crSeed % 10) * 0.05;
        ctx.beginPath();
        ctx.moveTo(fcx, fcy);
        const tipX = fcx + Math.cos(angle) * armLen;
        const tipY = fcy + Math.sin(angle) * armLen * ISO_SIN / ISO_COS;
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        // Small branch on longer arms
        if (armLen > 2.5 * s && ac % 2 === 0) {
          const midX = (fcx + tipX) * 0.6 + fcx * 0.4;
          const midY = (fcy + tipY) * 0.6 + fcy * 0.4;
          const branchAngle = angle + ((ac % 2 === 0) ? 0.5 : -0.5);
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(
            midX + Math.cos(branchAngle) * armLen * 0.35,
            midY + Math.sin(branchAngle) * armLen * 0.35 * ISO_SIN / ISO_COS,
          );
          ctx.stroke();
        }
      }
    }
  }
  // Frost on column shafts — varied placement along the height
  for (let ci = 0; ci < a.columns.length; ci++) {
    const col = a.columns[ci];
    const frostCount = 1 + (Math.floor(seed + ci * 17) % 2);
    for (let fi = 0; fi < frostCount; fi++) {
      const fSeed = seed + ci * 17 + fi * 29;
      const heightFrac = 0.3 + (fSeed % 5) * 0.1;
      const fcx = ox + (col.x + col.r * (0.2 + (fSeed % 3) * 0.1)) * s;
      const fcy = oy + (col.y - col.h * heightFrac) * s;
      const armLen = (1.2 + (fSeed % 3) * 0.4) * s;
      ctx.globalAlpha = 0.18;
      isoFrostCrystal(ctx, fcx, fcy, armLen);
    }
  }
  ctx.restore();

  // --- Frost sparkle specks with varied sizes (star-shaped for larger ones) ---
  ctx.save();
  const { minX, maxX, minY, maxY } = a.extent;
  for (let i = 0; i < 12; i++) {
    const spSeed = seed + i * 83;
    const fsx = ox + (minX + (spSeed % Math.max(1, maxX - minX))) * s;
    const fsy = oy + (minY + ((spSeed + i * 47) % Math.max(1, maxY - minY))) * s;
    const sparkR = (0.3 + (spSeed % 6) * 0.15) * s;
    ctx.globalAlpha = 0.5 + (spSeed % 4) * 0.1;

    if (sparkR > 0.7 * s) {
      // Star-shaped sparkle for bigger ones
      ctx.fillStyle = "#f0f6ff";
      ctx.beginPath();
      for (let p = 0; p < 4; p++) {
        const sAngle = (p * Math.PI) / 2 + (spSeed % 8) * 0.1;
        ctx.moveTo(fsx, fsy);
        ctx.ellipse(
          fsx + Math.cos(sAngle) * sparkR * 0.3,
          fsy + Math.sin(sAngle) * sparkR * 0.3,
          sparkR, sparkR * 0.2,
          sAngle, 0, Math.PI * 2,
        );
      }
      ctx.fill();
    } else {
      // Simple dot for smaller ones
      ctx.fillStyle = "#e8f0ff";
      ctx.beginPath();
      ctx.arc(fsx, fsy, sparkR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ============================================================================
// VOLCANIC OVERLAY
// ============================================================================

function drawVolcanicOverlay(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  a: VariantAnchors,
  seed: number,
  v: number,
): void {
  // Ash accumulation on ledges — isometric diamond shapes
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let li = 0; li < a.ledges.length; li++) {
    const ledge = a.ledges[li];
    const lx = ox + ledge.x * s;
    const ly = oy + ledge.y * s;
    const ashW = ledge.w * 0.7;
    const iW = ashW * ISO_COS * s;
    const iD = ashW * ISO_SIN * s;
    ctx.fillStyle = li % 2 === 0 ? "rgba(55,48,42,0.4)" : "rgba(65,55,48,0.35)";
    drawOrganicBlobAt(ctx, lx, ly, iW, iD, seed + li * 29, 0.2, 14);
    ctx.fill();
  }
  ctx.restore();

  // Ash streaks on wall faces
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#3a3230";
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    for (let i = 0; i < 4; i++) {
      const ax = ox + (wall.x + ((seed + i * 71 + wi * 37) % Math.max(1, wall.width))) * s;
      const ay = oy + (wall.topY + ((seed + i * 37) % Math.max(1, Math.abs(wall.botY - wall.topY))) * 0.5) * s;
      const aH = (4 + ((seed + i * 23) % 7)) * s;
      drawOrganicBlobAt(ctx, ax, ay + aH * 0.5, 0.8 * s, aH, seed + i * 71 + wi * 37, 0.18, 10);
      ctx.fill();
    }
  }
  ctx.restore();

  // Scorched patches on column shafts and walls
  ctx.save();
  ctx.globalAlpha = 0.2;
  const burnTargets = [
    ...a.columns.map((c) => ({ x: c.x, y: c.y - c.h * 0.3, r: c.r * 0.8 })),
    ...a.walls.map((w) => ({
      x: w.x + w.width * 0.5,
      y: (w.topY + w.botY) * 0.5,
      r: 3,
    })),
  ];
  for (let i = 0; i < Math.min(burnTargets.length, 5); i++) {
    const bt = burnTargets[i];
    const bx = ox + bt.x * s;
    const by = oy + bt.y * s;
    const bR = bt.r * s;
    const burnG = ctx.createRadialGradient(bx, by, 0, bx, by, bR);
    burnG.addColorStop(0, "rgba(30,20,15,0.4)");
    burnG.addColorStop(0.6, "rgba(50,30,20,0.2)");
    burnG.addColorStop(1, "rgba(60,40,30,0)");
    ctx.fillStyle = burnG;
    ctx.beginPath();
    ctx.arc(bx, by, bR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Branching lava cracks on the base — follow isometric ground plane
  for (let bi = 0; bi < a.bases.length; bi++) {
    const base = a.bases[bi];
    const crackCount = 3 + (v % 3);
    for (let i = 0; i < crackCount; i++) {
      const startAngle = ((seed + i * 79) % 360) * (Math.PI / 180);
      const startR = ((seed + i * 41) % Math.max(1, Math.floor(base.rx * 0.4))) * s;
      let cx0 = ox + (base.x * s) + Math.cos(startAngle) * startR * ISO_COS;
      let cy0 = oy + (base.y * s) + Math.sin(startAngle) * startR * ISO_SIN;
      const segments = 2 + ((seed + i * 17) % 3);
      for (let seg = 0; seg < segments; seg++) {
        const segAngle = startAngle + ((seed + i * 13 + seg * 31) % 60 - 30) * (Math.PI / 180);
        const segLen = (3 + ((seed + i * 7 + seg * 23) % 5)) * s;
        const nx = cx0 + Math.cos(segAngle) * segLen * ISO_COS;
        const ny = cy0 + Math.sin(segAngle) * segLen * ISO_SIN;
        lavaCrackSegment(ctx, cx0, cy0, nx, ny, s);
        cx0 = nx;
        cy0 = ny;
      }
    }
  }

  // Glowing embers near column bases and rubble
  ctx.save();
  ctx.globalAlpha = 0.7;
  const emberAnchors = [
    ...a.columns.map((c) => ({ x: c.x + c.r * 0.5, y: c.y + 1 })),
    ...a.bases.map((b) => ({ x: b.x + 5, y: b.y + 2 })),
    ...a.bases.map((b) => ({ x: b.x - 6, y: b.y + 1 })),
  ];
  for (let i = 0; i < Math.min(emberAnchors.length, 6); i++) {
    const ea = emberAnchors[i];
    const ex = ox + ea.x * s;
    const ey = oy + ea.y * s;
    const er = (1 + ((seed + i * 23) % 2)) * s;
    const emberG = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 2.5);
    emberG.addColorStop(0, "rgba(255,140,40,0.7)");
    emberG.addColorStop(0.3, "rgba(230,80,15,0.4)");
    emberG.addColorStop(0.7, "rgba(180,50,10,0.15)");
    emberG.addColorStop(1, "rgba(100,30,5,0)");
    ctx.fillStyle = emberG;
    ctx.beginPath();
    ctx.arc(ex, ey, er * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Heat shimmer haze
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#ff6020";
  const hx = ox + a.extent.minX * 0.15 * s;
  const hy = oy + a.extent.minY * 0.5 * s;
  const hW = (a.extent.maxX - a.extent.minX) * 0.35 * s;
  const hH = (a.extent.maxY - a.extent.minY) * 0.4 * s;
  drawOrganicBlobAt(ctx, hx, hy, hW * ISO_COS, hH, seed + 91, 0.15, 16);
  ctx.fill();
  ctx.restore();
}

// ============================================================================
// GRASSLAND OVERLAY
// ============================================================================

function drawGrasslandOverlay(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: number,
  a: VariantAnchors,
  seed: number,
  v: number,
): void {
  // Isometric lichen/moss patches on ledges
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let li = 0; li < a.ledges.length; li++) {
    const ledge = a.ledges[li];
    const lx = ox + ledge.x * s;
    const ly = oy + ledge.y * s;
    const colors = ["#6a8a5a", "#5a7a4a", "#7a9a6a"];
    const mossW = ledge.w * 0.4;
    isoMossOnSurface(ctx, lx, ly, mossW * s, s, colors[li % 3], 0.3, seed + li * 53);
  }
  ctx.restore();

  // Grass/weeds growing from wall cracks
  ctx.save();
  ctx.globalAlpha = 0.5;
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    const weedCount = Math.min(4, Math.max(2, Math.floor(wall.width / 10)));
    for (let i = 0; i < weedCount; i++) {
      const wx = ox + (wall.x + ((i + 0.5) / weedCount) * wall.width) * s;
      const wy = oy + (wall.topY + ((seed + i * 47 + wi * 31) % Math.max(1, Math.abs(wall.botY - wall.topY))) * 0.5) * s;
      const bladeCount = 2 + ((seed + i * 19 + wi * 13) % 3);
      for (let b = 0; b < bladeCount; b++) {
        const bAngle = -Math.PI / 2 + (b - bladeCount / 2) * 0.35;
        const bLen = (2.5 + ((seed + i * 13 + b * 7) % 3)) * s;
        ctx.strokeStyle = b % 2 === 0 ? "#4a7a3a" : "#3a6a2a";
        ctx.lineWidth = 0.6 * s;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(
          wx + Math.cos(bAngle) * bLen * 0.6,
          wy + Math.sin(bAngle) * bLen * 0.6,
          wx + Math.cos(bAngle + 0.15) * bLen,
          wy + Math.sin(bAngle + 0.15) * bLen,
        );
        ctx.stroke();
      }
    }
  }
  // Grass from column bases
  for (let ci = 0; ci < a.columns.length; ci++) {
    const col = a.columns[ci];
    const wx = ox + (col.x + col.r * 0.8) * s;
    const wy = oy + col.y * s;
    for (let b = 0; b < 3; b++) {
      const bAngle = -Math.PI / 2 + (b - 1) * 0.4;
      const bLen = (2 + ((seed + ci * 11 + b * 5) % 3)) * s;
      ctx.strokeStyle = b % 2 === 0 ? "#4a7a3a" : "#3a6a2a";
      ctx.lineWidth = 0.6 * s;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(
        wx + Math.cos(bAngle) * bLen * 0.6,
        wy + Math.sin(bAngle) * bLen * 0.6,
        wx + Math.cos(bAngle + 0.1) * bLen,
        wy + Math.sin(bAngle + 0.1) * bLen,
      );
      ctx.stroke();
    }
  }
  ctx.restore();

  // Isometric grass tufts at the base
  ctx.save();
  ctx.globalAlpha = 0.4;
  for (let bi = 0; bi < a.bases.length; bi++) {
    const base = a.bases[bi];
    const tuffCount = Math.min(6, Math.max(3, Math.floor(base.rx / 5)));
    for (let i = 0; i < tuffCount; i++) {
      const angle = ((i / tuffCount) * Math.PI * 2) + ((seed + i * 17) % 10) * 0.1;
      const dist = (base.rx * 0.7 + ((seed + i * 29) % 4)) * s;
      const gx = ox + base.x * s + Math.cos(angle) * dist * ISO_COS;
      const gy = oy + base.y * s + Math.sin(angle) * dist * ISO_SIN;
      const gw = (1.5 + ((seed + i * 23) % 2)) * s;
      ctx.fillStyle = i % 2 === 0 ? "#5a8a3a" : "#4a7a30";
      ctx.beginPath();
      ctx.moveTo(gx - gw * ISO_COS, gy + gw * ISO_SIN);
      ctx.quadraticCurveTo(gx, gy - gw * 1.2, gx + gw * ISO_COS, gy + gw * ISO_SIN);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();

  // Subtle weathering stains on walls
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#5a6a4a";
  for (let wi = 0; wi < a.walls.length; wi++) {
    const wall = a.walls[wi];
    for (let i = 0; i < 2; i++) {
      const sx = ox + (wall.x + ((seed + i * 67 + wi * 41) % Math.max(1, wall.width))) * s;
      const sy = oy + (wall.topY + ((seed + i * 41) % Math.max(1, Math.abs(wall.botY - wall.topY))) * 0.4) * s;
      drawOrganicBlobAt(ctx, sx, sy, 2.5 * s, 5 * s, seed + i * 67 + wi * 41, 0.2, 10);
      ctx.fill();
    }
  }
  ctx.restore();
}
