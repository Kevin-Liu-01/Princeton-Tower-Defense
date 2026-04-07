import { ISO_TAN } from "../../constants";
import type { Position } from "../../types";
import { drawBrickFace, drawOrganicBlobAt } from "../helpers";

const T = ISO_TAN;

const STONE = "#8a9aaa";
const STONE_DARK = "#6a7a8a";
const STONE_LIGHT = "#aabaca";
const STONE_TOP = "#b0c0d0";
const STONE_INNER = "#7a8a9a";
const MORTAR = "rgba(30,40,50,0.3)";
const MORTAR_DARK = "rgba(20,30,40,0.35)";
const ICE_COLOR = "#c5e3f6";
const SNOW_COLOR = "#f5f9fc";

const RUBBLE_PALETTE = [
  { left: "#6a7a8a", right: "#8a9aaa", top: "#a0b0c0" },
  { left: "#5a6a7a", right: "#7a8a9a", top: "#90a0b0" },
  { left: "#7a8a9a", right: "#9aaaba", top: "#b0c0d0" },
  { left: "#5a6a7a", right: "#8090a0", top: "#8898a8" },
];

// ---------------------------------------------------------------------------
// Regional wall theme configuration
// ---------------------------------------------------------------------------

export interface WallRegionTheme {
  stone: {
    front: string;
    side: string;
    top: string;
    mortar: string;
    inner: string;
  };
  baseColor: string;
  blockColors: { top: string; left: string; right: string }[];
}

const WALL_REGION_THEMES: Record<string, WallRegionTheme> = {
  desert: {
    baseColor: "#d4c4a0",
    blockColors: [
      { left: "#8a7a60", right: "#a09070", top: "#c0b090" },
      { left: "#7a6a50", right: "#908060", top: "#b0a080" },
    ],
    stone: {
      front: "#b0a080",
      inner: "#a09070",
      mortar: "rgba(60,50,30,0.3)",
      side: "#c0b090",
      top: "#d0c0a0",
    },
  },
  grassland: {
    baseColor: "#8bac6b",
    blockColors: [
      { left: "#6a7268", right: "#8a9280", top: "#a0a090" },
      { left: "#5a6258", right: "#7a8270", top: "#909880" },
    ],
    stone: {
      front: "#8a8a7a",
      inner: "#7a7a6a",
      mortar: "rgba(40,40,30,0.3)",
      side: "#a0a090",
      top: "#b0b0a0",
    },
  },
  swamp: {
    baseColor: "#5a6a48",
    blockColors: [
      { left: "#4a5a40", right: "#6a7a60", top: "#7a8a70" },
      { left: "#3a4a30", right: "#5a6a50", top: "#6a7a60" },
    ],
    stone: {
      front: "#6a7a68",
      inner: "#5a6a58",
      mortar: "rgba(30,50,30,0.35)",
      side: "#7a8a78",
      top: "#8a9a88",
    },
  },
  volcanic: {
    baseColor: "#3a3232",
    blockColors: [
      { left: "#3a2a2a", right: "#5a4a4a", top: "#6a5a5a" },
      { left: "#2a1a1a", right: "#4a3a3a", top: "#5a4a4a" },
    ],
    stone: {
      front: "#5a4a4a",
      inner: "#4a3a3a",
      mortar: "rgba(40,20,20,0.35)",
      side: "#6a5a5a",
      top: "#7a6a6a",
    },
  },
  winter: {
    baseColor: SNOW_COLOR,
    blockColors: [
      { left: "#6a7a8a", right: "#8a9aaa", top: "#a0b0c0" },
      { left: "#5a6a7a", right: "#7a8a9a", top: "#90a0b0" },
    ],
    stone: {
      front: STONE,
      inner: STONE_INNER,
      mortar: MORTAR,
      side: STONE_LIGHT,
      top: STONE_TOP,
    },
  },
};

function getWallTheme(theme: string): WallRegionTheme {
  return WALL_REGION_THEMES[theme] ?? WALL_REGION_THEMES.winter;
}

// ---------------------------------------------------------------------------
// Low-level isometric block
// ---------------------------------------------------------------------------

function drawIsoBlock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  hd: number,
  h: number,
  topColor: string,
  leftColor: string,
  rightColor: string
): void {
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hd);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hd - h);
  ctx.lineTo(cx + hw, cy - h);
  ctx.lineTo(cx, cy + hd - h);
  ctx.lineTo(cx - hw, cy - h);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Front face clipped to a jagged profile
// ---------------------------------------------------------------------------

function drawJaggedBrickFace(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  maxH: number,
  profile: number[],
  baseColor: string,
  mortarColor: string,
  s: number,
  brickRows: number,
  brickCols: number
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  for (let i = n - 1; i >= 0; i--) {
    const t = i / (n - 1);
    ctx.lineTo(x1 + t * dx, y1 + t * dy - profile[i]);
  }
  ctx.closePath();
  ctx.clip();
  drawBrickFace(
    ctx,
    x1,
    y1,
    x2,
    y2,
    maxH,
    baseColor,
    mortarColor,
    s,
    brickRows,
    brickCols
  );
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Top-surface diamond strips following the jagged profile
// ---------------------------------------------------------------------------

function drawJaggedTopSurface(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  topColor: string,
  minH: number
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;

  ctx.fillStyle = topColor;
  for (let i = 0; i < n - 1; i++) {
    if (profile[i] >= minH && profile[i + 1] >= minH) {
      const t1 = i / (n - 1);
      const t2 = (i + 1) / (n - 1);
      const fx1 = x1 + t1 * dx;
      const fy1 = y1 + t1 * dy - profile[i];
      const fx2 = x1 + t2 * dx;
      const fy2 = y1 + t2 * dy - profile[i + 1];

      ctx.beginPath();
      ctx.moveTo(fx1, fy1);
      ctx.lineTo(fx2, fy2);
      ctx.lineTo(fx2 + ddx, fy2 + ddy);
      ctx.lineTo(fx1 + ddx, fy1 + ddy);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Exposed inner faces at height transitions (the "broken edge" cross-sections)
// ---------------------------------------------------------------------------

function drawBreakFaces(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  breakColor: string,
  s: number
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;

  ctx.fillStyle = breakColor;
  for (let i = 0; i < n - 1; i++) {
    const diff = Math.abs(profile[i] - profile[i + 1]);
    if (diff > 3 * s) {
      const tBreak = (i + 0.5) / (n - 1);
      const px = x1 + tBreak * dx;
      const py = y1 + tBreak * dy;
      const lo = Math.min(profile[i], profile[i + 1]);
      const hi = Math.max(profile[i], profile[i + 1]);

      ctx.beginPath();
      ctx.moveTo(px, py - lo);
      ctx.lineTo(px, py - hi);
      ctx.lineTo(px + ddx, py + ddy - hi);
      ctx.lineTo(px + ddx, py + ddy - lo);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Snow caps on flat wall-top sections
// ---------------------------------------------------------------------------

function drawSnowOnWall(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  s: number,
  thickness: number = 2
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const th = thickness * s;

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < n - 1; i++) {
    if (profile[i] > 6 * s && profile[i + 1] > 6 * s) {
      const t1 = i / (n - 1);
      const t2 = (i + 1) / (n - 1);
      const fx1 = x1 + t1 * dx;
      const fy1 = y1 + t1 * dy - profile[i];
      const fx2 = x1 + t2 * dx;
      const fy2 = y1 + t2 * dy - profile[i + 1];

      ctx.beginPath();
      ctx.moveTo(fx1 - 0.5 * s, fy1 - th);
      ctx.quadraticCurveTo(
        (fx1 + fx2) / 2,
        (fy1 + fy2) / 2 - th * 1.3,
        fx2 + 0.5 * s,
        fy2 - th
      );
      ctx.lineTo(fx2 + ddx + 0.3 * s, fy2 + ddy - th * 0.3);
      ctx.lineTo(fx1 + ddx - 0.3 * s, fy1 + ddy - th * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Icicles hanging from break points
// ---------------------------------------------------------------------------

function drawWallIcicles(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  profile: number[],
  s: number,
  iceColor: string = ICE_COLOR
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;

  for (let i = 1; i < n; i++) {
    const drop = profile[i - 1] - profile[i];
    if (drop > 5 * s) {
      const t = i / (n - 1);
      const px = x1 + t * dx;
      const py = y1 + t * dy;
      const hangH = Math.min(drop * 0.45, 8 * s);

      ctx.fillStyle = iceColor;
      ctx.beginPath();
      ctx.moveTo(px - 1.5 * s, py - profile[i]);
      ctx.lineTo(px, py - profile[i] + hangH);
      ctx.lineTo(px + 1.5 * s, py - profile[i]);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(px - 0.4 * s, py - profile[i] + 1 * s);
      ctx.lineTo(px, py - profile[i] + hangH * 0.6);
      ctx.lineTo(px + 0.3 * s, py - profile[i] + 1 * s);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Stone crack detail lines
// ---------------------------------------------------------------------------

function drawCracks(
  ctx: CanvasRenderingContext2D,
  segments: { x1: number; y1: number; x2: number; y2: number }[],
  s: number,
  color: string = "rgba(0,0,0,0.12)"
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.7 * s;
  segments.forEach((seg) => {
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();
  });
}

// ---------------------------------------------------------------------------
// Ice/frost patch on wall face
// ---------------------------------------------------------------------------

function drawFrostPatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
  s: number
): void {
  ctx.fillStyle = ICE_COLOR;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * s, ry * s, angle, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Regional overlay helpers
// ---------------------------------------------------------------------------

function drawMossOnWall(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  s: number,
  intensity: number = 1
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;
  ctx.fillStyle = `rgba(60,90,40,${0.25 * intensity})`;
  for (let i = 0; i < n - 1; i++) {
    const t = i / (n - 1);
    const t2 = (i + 1) / (n - 1);
    if (profile[i] < 4 * s) {
      continue;
    }
    const px = x1 + t * dx;
    const py = y1 + t * dy - profile[i];
    const px2 = x1 + t2 * dx;
    const py2 = y1 + t2 * dy - profile[i + 1];
    ctx.beginPath();
    ctx.moveTo(px + ddx, py + ddy - 1 * s);
    ctx.lineTo(px2 + ddx, py2 + ddy - 1 * s);
    ctx.lineTo(px2, py2 - 0.5 * s);
    ctx.lineTo(px, py - 0.5 * s);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHangingVines(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  profile: number[],
  s: number
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;
  ctx.strokeStyle = "rgba(50,80,30,0.5)";
  ctx.lineWidth = 1.2 * s;
  for (let i = 1; i < n - 1; i += 2) {
    const t = i / (n - 1);
    if (profile[i] < 8 * s) {
      continue;
    }
    const px = x1 + t * dx;
    const py = y1 + t * dy - profile[i];
    const vineLen = (3 + (i % 3) * 2) * s;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(
      px + 1.5 * s,
      py + vineLen * 0.5,
      px + 0.5 * s,
      py + vineLen
    );
    ctx.stroke();
  }
}

function drawSandDrift(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  s: number
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;
  ctx.fillStyle = "rgba(210,190,150,0.4)";
  for (let i = 0; i < n - 1; i++) {
    const t = i / (n - 1);
    const t2 = (i + 1) / (n - 1);
    if (profile[i] < 4 * s) {
      continue;
    }
    const px = x1 + t * dx;
    const py = y1 + t * dy - profile[i];
    const px2 = x1 + t2 * dx;
    const py2 = y1 + t2 * dy - profile[i + 1];
    ctx.beginPath();
    ctx.moveTo(px + ddx * 0.6, py + ddy * 0.6 - 0.5 * s);
    ctx.lineTo(px2 + ddx * 0.6, py2 + ddy * 0.6 - 0.5 * s);
    ctx.lineTo(px2, py2);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(200,180,140,0.3)";
  ctx.beginPath();
  ctx.ellipse(
    (x1 + x2) * 0.5,
    (y1 + y2) * 0.5 + 4 * s,
    12 * s,
    4 * s,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawAshLayer(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  s: number
): void {
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;
  ctx.fillStyle = "rgba(50,40,40,0.3)";
  for (let i = 0; i < n - 1; i++) {
    const t = i / (n - 1);
    const t2 = (i + 1) / (n - 1);
    if (profile[i] < 4 * s) {
      continue;
    }
    const px = x1 + t * dx;
    const py = y1 + t * dy - profile[i];
    const px2 = x1 + t2 * dx;
    const py2 = y1 + t2 * dy - profile[i + 1];
    ctx.beginPath();
    ctx.moveTo(px + ddx, py + ddy - 1 * s);
    ctx.lineTo(px2 + ddx, py2 + ddy - 1 * s);
    ctx.lineTo(px2, py2 - 0.5 * s);
    ctx.lineTo(px, py - 0.5 * s);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,120,40,0.25)";
  for (let i = 2; i < n - 2; i += 3) {
    const t = i / (n - 1);
    if (profile[i] < 6 * s) {
      continue;
    }
    const px = x1 + t * dx;
    const py = y1 + t * dy - profile[i];
    ctx.beginPath();
    ctx.arc(px, py - 1 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Unified theme overlay dispatcher
// ---------------------------------------------------------------------------

function applyWallOverlays(
  ctx: CanvasRenderingContext2D,
  theme: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  s: number,
  snowThickness?: number
): void {
  switch (theme) {
    case "winter": {
      drawSnowOnWall(
        ctx,
        x1,
        y1,
        x2,
        y2,
        ddx,
        ddy,
        profile,
        s,
        snowThickness ?? 2.5
      );
      drawWallIcicles(ctx, x1, y1, x2, y2, profile, s);
      break;
    }
    case "grassland": {
      drawMossOnWall(ctx, x1, y1, x2, y2, ddx, ddy, profile, s, 0.7);
      break;
    }
    case "swamp": {
      drawMossOnWall(ctx, x1, y1, x2, y2, ddx, ddy, profile, s, 1.2);
      drawHangingVines(ctx, x1, y1, x2, y2, profile, s);
      break;
    }
    case "desert": {
      drawSandDrift(ctx, x1, y1, x2, y2, ddx, ddy, profile, s);
      break;
    }
    case "volcanic": {
      drawAshLayer(ctx, x1, y1, x2, y2, ddx, ddy, profile, s);
      break;
    }
    default: {
      drawMossOnWall(ctx, x1, y1, x2, y2, ddx, ddy, profile, s, 0.5);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Theme-conditional spot overlays (replaces frost patches for non-winter)
// ---------------------------------------------------------------------------

function applySpotOverlay(
  ctx: CanvasRenderingContext2D,
  theme: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
  s: number
): void {
  switch (theme) {
    case "winter": {
      drawFrostPatch(ctx, cx, cy, rx, ry, angle, s);
      break;
    }
    case "grassland": {
      ctx.fillStyle = "rgba(80,120,50,0.25)";
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * s, ry * s, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "swamp": {
      ctx.fillStyle = "rgba(40,70,30,0.3)";
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * s * 1.2, ry * s * 1.2, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "desert": {
      ctx.fillStyle = "rgba(200,180,130,0.25)";
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * s, ry * s, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "volcanic": {
      ctx.fillStyle = "rgba(255,100,30,0.2)";
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * s * 0.8, ry * s * 0.8, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    default: {
      ctx.fillStyle = "rgba(80,120,50,0.2)";
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * s, ry * s, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Theme-conditional block snow/covering (replaces snow ellipses on fallen blocks)
// ---------------------------------------------------------------------------

function drawBlockCovering(
  ctx: CanvasRenderingContext2D,
  theme: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
  s: number
): void {
  const cfg = getWallTheme(theme);
  switch (theme) {
    case "winter": {
      ctx.fillStyle = "#ffffff";
      break;
    }
    case "grassland": {
      ctx.fillStyle = "rgba(100,140,60,0.4)";
      break;
    }
    case "swamp": {
      ctx.fillStyle = "rgba(60,90,40,0.45)";
      break;
    }
    case "desert": {
      ctx.fillStyle = "rgba(210,190,150,0.35)";
      break;
    }
    case "volcanic": {
      ctx.fillStyle = "rgba(60,50,50,0.35)";
      break;
    }
    default: {
      ctx.fillStyle = cfg.baseColor;
      break;
    }
  }
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2);
  ctx.fill();
}

// ===========================================================================
// PUBLIC: Complete isometric wall segment with jagged broken top
// ===========================================================================

export function drawIsoJaggedWall(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  ddx: number,
  ddy: number,
  profile: number[],
  colors: {
    front: string;
    side: string;
    top: string;
    mortar: string;
    inner?: string;
  },
  s: number,
  brickRows: number,
  brickCols: number
): void {
  const maxH = Math.max(...profile);
  const n = profile.length;
  const dx = x2 - x1;
  const dy = y2 - y1;

  // 1. Side face (end cap at x1)
  if (profile[0] > 2 * s) {
    const sideH = profile[0];
    drawBrickFace(
      ctx,
      x1 + ddx,
      y1 + ddy,
      x1,
      y1,
      sideH,
      colors.side,
      colors.mortar,
      s,
      Math.max(2, Math.ceil(sideH / (5 * s))),
      2
    );
  }

  // 2. Break faces (exposed cross-sections at height drops)
  drawBreakFaces(
    ctx,
    x1,
    y1,
    x2,
    y2,
    ddx,
    ddy,
    profile,
    colors.inner ?? colors.side,
    s
  );

  // 3. Top surface
  drawJaggedTopSurface(
    ctx,
    x1,
    y1,
    x2,
    y2,
    ddx,
    ddy,
    profile,
    colors.top,
    3 * s
  );

  // 4. Front face (clipped to jagged profile)
  drawJaggedBrickFace(
    ctx,
    x1,
    y1,
    x2,
    y2,
    maxH,
    profile,
    colors.front,
    colors.mortar,
    s,
    brickRows,
    brickCols
  );

  // 5. Jagged top-edge highlight
  ctx.strokeStyle = "rgba(200,220,240,0.2)";
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const px = x1 + t * dx;
    const py = y1 + t * dy - profile[i];
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  // 6. Bottom-edge ground shadow
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(x1, y1 + 0.5 * s);
  ctx.lineTo(x2, y2 + 0.5 * s);
  ctx.stroke();
}

// ===========================================================================
// PUBLIC: Scattered isometric rubble blocks
// ===========================================================================

export function drawRubblePile(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  blocks: { dx: number; dy: number; w: number; h: number }[],
  s: number,
  palette?: { top: string; left: string; right: string }[]
): void {
  const pal = palette ?? RUBBLE_PALETTE;
  blocks.forEach((b, i) => {
    const hw = b.w * s;
    const hd = hw * T;
    const p = pal[i % pal.length];
    drawIsoBlock(
      ctx,
      cx + b.dx * s,
      cy + b.dy * s,
      hw,
      hd,
      b.h * s,
      p.top,
      p.left,
      p.right
    );
  });
}

// ===========================================================================
// Variant helpers (each is a top-level function, not nested)
// ===========================================================================

function drawCornerRuin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  theme: string
): void {
  const cfg = getWallTheme(theme);
  const cornerX = cx - 2 * s;
  const cornerY = cy + 2 * s;
  const depth = 5 * s;
  const frontColors = {
    front: cfg.stone.front,
    inner: cfg.stone.inner,
    mortar: cfg.stone.mortar,
    side: cfg.stone.side,
    top: cfg.stone.top,
  };
  const sideColors = {
    front: cfg.stone.inner,
    inner: cfg.stone.inner,
    mortar: MORTAR_DARK,
    side: cfg.stone.front,
    top: cfg.stone.top,
  };

  // Left arm (along left-axis, drawn first for correct occlusion)
  const lLen = 24 * s;
  const lx1 = cornerX;
  const ly1 = cornerY;
  const lx2 = cornerX - lLen;
  const ly2 = cornerY - lLen * T;
  const lProfile = [36, 38, 34, 28, 20, 12, 6, 0].map((h) => h * s);

  drawIsoJaggedWall(
    ctx,
    lx1,
    ly1,
    lx2,
    ly2,
    depth,
    -depth * T,
    lProfile,
    sideColors,
    s,
    9,
    5
  );

  // Right arm (along right-axis, drawn second — front face overlaps corner)
  const rLen = 30 * s;
  const rx1 = cornerX;
  const ry1 = cornerY;
  const rx2 = cornerX + rLen;
  const ry2 = cornerY - rLen * T;
  const rProfile = [40, 42, 38, 34, 26, 18, 10, 4, 0].map((h) => h * s);

  drawIsoJaggedWall(
    ctx,
    rx1,
    ry1,
    rx2,
    ry2,
    -depth,
    -depth * T,
    rProfile,
    frontColors,
    s,
    10,
    7
  );

  // Rubble at corner base
  drawRubblePile(
    ctx,
    cornerX + 6 * s,
    cornerY + 2 * s,
    [
      { dx: 2, dy: 2, h: 2.5, w: 3 },
      { dx: 8, dy: 0, h: 2, w: 2.5 },
      { dx: 14, dy: -2, h: 3, w: 2 },
      { dx: -6, dy: 1, h: 1.5, w: 2.5 },
      { dx: -12, dy: -1, h: 2, w: 2 },
      { dx: 4, dy: 4, h: 1.8, w: 1.8 },
      { dx: 18, dy: -3, h: 2.5, w: 1.5 },
      { dx: -4, dy: -3, h: 1.5, w: 2 },
      { dx: 10, dy: 3, h: 1.2, w: 1.5 },
    ],
    s,
    cfg.blockColors
  );

  // Theme overlays on wall tops
  applyWallOverlays(
    ctx,
    theme,
    rx1,
    ry1,
    rx2,
    ry2,
    -depth,
    -depth * T,
    rProfile,
    s,
    2.5
  );
  applyWallOverlays(
    ctx,
    theme,
    lx1,
    ly1,
    lx2,
    ly2,
    depth,
    -depth * T,
    lProfile,
    s,
    2
  );

  // Theme spot overlay at corner junction
  applySpotOverlay(ctx, theme, cornerX, cornerY - 26 * s, 4, 12, -0.1, s);

  // Crack details
  drawCracks(
    ctx,
    [
      {
        x1: cornerX + 8 * s,
        x2: cornerX + 12 * s,
        y1: cornerY - 28 * s,
        y2: cornerY - 25 * s,
      },
      {
        x1: cornerX + 12 * s,
        x2: cornerX + 10 * s,
        y1: cornerY - 25 * s,
        y2: cornerY - 20 * s,
      },
      {
        x1: cornerX - 8 * s,
        x2: cornerX - 12 * s,
        y1: cornerY - 22 * s,
        y2: cornerY - 18 * s,
      },
    ],
    s
  );
}

function drawBreachedWall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  theme: string
): void {
  const cfg = getWallTheme(theme);
  const wallLen = 50 * s;
  const depth = 5 * s;
  const x1 = cx - wallLen * 0.5;
  const y1 = cy + wallLen * 0.25;
  const x2 = cx + wallLen * 0.5;
  const y2 = cy - wallLen * 0.25;

  const profile = [26, 32, 38, 36, 22, 8, 0, 0, 6, 18, 30, 34, 28].map(
    (h) => h * s
  );

  const colors = {
    front: cfg.stone.front,
    inner: cfg.stone.inner,
    mortar: cfg.stone.mortar,
    side: cfg.stone.side,
    top: cfg.stone.top,
  };

  drawIsoJaggedWall(
    ctx,
    x1,
    y1,
    x2,
    y2,
    -depth,
    -depth * T,
    profile,
    colors,
    s,
    10,
    9
  );

  // Large fallen blocks in the breach
  const bc0 = cfg.blockColors[0];
  const bc1 = cfg.blockColors[1];
  drawIsoBlock(
    ctx,
    cx - 2 * s,
    cy + 3 * s,
    5 * s,
    2.5 * s,
    4 * s,
    bc0.top,
    bc0.left,
    bc0.right
  );
  drawIsoBlock(
    ctx,
    cx + 6 * s,
    cy + 1 * s,
    4 * s,
    2 * s,
    3 * s,
    bc1.top,
    bc1.left,
    bc1.right
  );

  // Scattered rubble around breach
  drawRubblePile(
    ctx,
    cx,
    cy,
    [
      { dx: -5, dy: 6, h: 2, w: 2.5 },
      { dx: 3, dy: 7, h: 1.5, w: 2 },
      { dx: 10, dy: 4, h: 2.5, w: 2.5 },
      { dx: -9, dy: 4, h: 1.8, w: 1.8 },
      { dx: 0, dy: 2, h: 1.2, w: 1.5 },
      { dx: -2, dy: -2, h: 2, w: 2 },
      { dx: 7, dy: -1, h: 1.5, w: 1.5 },
      { dx: -6, dy: 8, h: 1, w: 1.2 },
    ],
    s,
    cfg.blockColors
  );

  // Theme overlays on wall tops
  applyWallOverlays(
    ctx,
    theme,
    x1,
    y1,
    x2,
    y2,
    -depth,
    -depth * T,
    profile,
    s,
    2.5
  );

  // Spot overlays on taller sections
  applySpotOverlay(
    ctx,
    theme,
    x1 + 8 * s,
    y1 + (y2 - y1) * 0.12 - 22 * s,
    4,
    10,
    -0.15,
    s
  );
  applySpotOverlay(
    ctx,
    theme,
    x2 - 6 * s,
    y2 + (y1 - y2) * 0.12 - 20 * s,
    3,
    8,
    0.1,
    s
  );

  // Crack details on both sections
  drawCracks(
    ctx,
    [
      {
        x1: x1 + 6 * s,
        x2: x1 + 10 * s,
        y1: y1 - 12 * s - 20 * s,
        y2: y1 - 12 * s - 16 * s,
      },
      {
        x1: x2 - 10 * s,
        x2: x2 - 6 * s,
        y1: y2 + 5 * s - 22 * s,
        y2: y2 + 5 * s - 18 * s,
      },
      {
        x1: x2 - 8 * s,
        x2: x2 - 12 * s,
        y1: y2 + 4 * s - 14 * s,
        y2: y2 + 6 * s - 10 * s,
      },
    ],
    s
  );

  // Covering on large fallen block
  drawBlockCovering(
    ctx,
    theme,
    cx - 1 * s,
    cy - 1.5 * s,
    4 * s,
    2 * s,
    -0.2,
    s
  );
}

function drawBrokenColumns(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  theme: string
): void {
  const cfg = getWallTheme(theme);
  const columns: {
    dx: number;
    dy: number;
    w: number;
    d: number;
    heights: number[];
  }[] = [
    { d: 7, dx: -14, dy: 5, heights: [42, 46, 44, 38, 40], w: 8 },
    { d: 6, dx: 3, dy: 1, heights: [28, 32, 30, 26], w: 7 },
    { d: 6, dx: 18, dy: -4, heights: [16, 20, 18, 14], w: 7 },
  ];

  const colors = {
    front: cfg.stone.front,
    inner: cfg.stone.inner,
    mortar: cfg.stone.mortar,
    side: cfg.stone.side,
    top: cfg.stone.top,
  };

  columns.forEach((col) => {
    const colX = cx + col.dx * s;
    const colY = cy + col.dy * s;
    const halfW = col.w * 0.5 * s;
    const px1 = colX - halfW;
    const py1 = colY + halfW * T;
    const px2 = colX + halfW;
    const py2 = colY - halfW * T;
    const colDepth = col.d * s;
    const profile = col.heights.map((h) => h * s);

    drawIsoJaggedWall(
      ctx,
      px1,
      py1,
      px2,
      py2,
      -colDepth,
      -colDepth * T,
      profile,
      colors,
      s,
      Math.max(3, Math.ceil(Math.max(...col.heights) / 5)),
      2
    );

    applyWallOverlays(
      ctx,
      theme,
      px1,
      py1,
      px2,
      py2,
      -colDepth,
      -colDepth * T,
      profile,
      s,
      2.5
    );
  });

  // Rubble between and around columns
  drawRubblePile(
    ctx,
    cx,
    cy,
    [
      { dx: -5, dy: 5, h: 2, w: 2.5 },
      { dx: -1, dy: 7, h: 1.5, w: 2 },
      { dx: 10, dy: 2, h: 2.5, w: 2.5 },
      { dx: 12, dy: 0, h: 1.8, w: 1.8 },
      { dx: -9, dy: 7, h: 2, w: 2 },
      { dx: 5, dy: 4, h: 1.2, w: 1.5 },
      { dx: 16, dy: -1, h: 1.5, w: 2 },
      { dx: -3, dy: 3, h: 1, w: 1.3 },
      { dx: 8, dy: 5, h: 2, w: 1.5 },
    ],
    s,
    cfg.blockColors
  );

  // Spot overlay on tall column
  const tallCol = columns[0];
  const tallX = cx + tallCol.dx * s;
  applySpotOverlay(
    ctx,
    theme,
    tallX - 2 * s,
    cy + tallCol.dy * s - 30 * s,
    3,
    8,
    -0.1,
    s
  );

  // Crack details
  drawCracks(
    ctx,
    [
      {
        x1: tallX - 2 * s,
        x2: tallX + 1 * s,
        y1: cy + tallCol.dy * s - 20 * s,
        y2: cy + tallCol.dy * s - 16 * s,
      },
      {
        x1: cx + columns[1].dx * s,
        x2: cx + columns[1].dx * s + 3 * s,
        y1: cy + columns[1].dy * s - 18 * s,
        y2: cy + columns[1].dy * s - 14 * s,
      },
    ],
    s
  );
}

function drawCrumblingWall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  theme: string
): void {
  const cfg = getWallTheme(theme);
  const wallLen = 46 * s;
  const depth = 5 * s;
  const x1 = cx - wallLen * 0.5;
  const y1 = cy + wallLen * 0.25;
  const x2 = cx + wallLen * 0.5;
  const y2 = cy - wallLen * 0.25;

  const profile = [0, 0, 4, 10, 16, 22, 24, 24, 22, 24, 24, 20, 16].map(
    (h) => h * s
  );

  const colors = {
    front: cfg.stone.front,
    inner: cfg.stone.inner,
    mortar: cfg.stone.mortar,
    side: cfg.stone.side,
    top: cfg.stone.top,
  };

  drawIsoJaggedWall(
    ctx,
    x1,
    y1,
    x2,
    y2,
    -depth,
    -depth * T,
    profile,
    colors,
    s,
    6,
    9
  );

  // Tilted fallen block near the collapsed left end
  const bc0 = cfg.blockColors[0];
  const bc1 = cfg.blockColors[1];
  drawIsoBlock(
    ctx,
    x1 + 6 * s,
    y1 - 3 * s + 3 * s,
    5 * s,
    3 * s,
    3.5 * s,
    bc1.top,
    bc1.left,
    bc1.right
  );
  drawIsoBlock(
    ctx,
    x1 + 2 * s,
    y1 - 1 * s + 5 * s,
    4 * s,
    2.5 * s,
    2.5 * s,
    bc0.top,
    bc0.left,
    bc0.right
  );

  // Rubble at collapsed end
  drawRubblePile(
    ctx,
    x1 + 4 * s,
    y1 - 2 * s,
    [
      { dx: -4, dy: 4, h: 2, w: 2.5 },
      { dx: 2, dy: 6, h: 1.5, w: 2 },
      { dx: -6, dy: 2, h: 2.5, w: 3 },
      { dx: 4, dy: 3, h: 1, w: 1.5 },
      { dx: -2, dy: 5, h: 2, w: 2 },
      { dx: 6, dy: 1, h: 1.5, w: 1.5 },
    ],
    s,
    cfg.blockColors
  );

  // Theme overlays on standing wall sections
  applyWallOverlays(
    ctx,
    theme,
    x1,
    y1,
    x2,
    y2,
    -depth,
    -depth * T,
    profile,
    s,
    3
  );

  // Spot overlay on the standing wall
  applySpotOverlay(ctx, theme, cx + 8 * s, cy - 16 * s, 5, 8, -0.15, s);

  // Crack details
  drawCracks(
    ctx,
    [
      {
        x1: cx + 4 * s,
        x2: cx + 8 * s,
        y1: cy - 2 * s - 14 * s,
        y2: cy - 2 * s - 10 * s,
      },
      {
        x1: cx + 8 * s,
        x2: cx + 6 * s,
        y1: cy - 2 * s - 10 * s,
        y2: cy - 2 * s - 6 * s,
      },
      {
        x1: cx - 6 * s,
        x2: cx - 2 * s,
        y1: cy + 3 * s - 6 * s,
        y2: cy + 3 * s - 4 * s,
      },
    ],
    s
  );

  // Covering on fallen blocks
  drawBlockCovering(
    ctx,
    theme,
    x1 + 5 * s,
    y1 - 3 * s - 0.5 * s,
    4 * s,
    1.8 * s,
    -0.15,
    s
  );
}

// ===========================================================================
// PUBLIC: Main entry point — broken wall decoration with 4 variants
// ===========================================================================

export function drawBrokenWallDecoration(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
  theme: string = "winter"
): void {
  const cfg = getWallTheme(theme);
  const cx = screenPos.x;
  const cy = screenPos.y;
  const v = variant % 4;

  // Ground shadow
  ctx.fillStyle = "rgba(0,30,50,0.2)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2 * s, 30 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Organic base blob (themed)
  ctx.fillStyle = cfg.baseColor;
  drawOrganicBlobAt(ctx, cx, cy, 28 * s, 8 * s, decorX * 7.1 + decorY * 5.3);
  ctx.fill();

  if (v === 0) {
    drawCornerRuin(ctx, cx, cy, s, theme);
  } else if (v === 1) {
    drawBreachedWall(ctx, cx, cy, s, theme);
  } else if (v === 2) {
    drawBrokenColumns(ctx, cx, cy, s, theme);
  } else {
    drawCrumblingWall(ctx, cx, cy, s, theme);
  }
}
