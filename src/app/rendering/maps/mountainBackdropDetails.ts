import { hexToRgba } from "../../utils";
import { createSeededRandom } from "../../utils/seededRandom";

type ChallengeThemeKey =
  | "grassland"
  | "swamp"
  | "desert"
  | "winter"
  | "volcanic";

interface BackdropPalette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  haze: string;
  farRidge: string;
  midRidge: string;
  nearRidge: string;
  mountainTop: string;
  mountainLeft: string;
  mountainRight: string;
  mountainFacetA: string;
  mountainFacetB: string;
  mountainShadow: string;
  landHighlight: string;
  skyAccent: string;
  skyDecor: string;
  mountainSnow?: string;
}

// ─── shared helpers ──────────────────────────────────────────────

function smoothFill(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[]
): void {
  if (pts.length < 2) {
    return;
  }
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2;
    const cpy = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
  }
  ctx.lineTo(pts.at(-1).x, pts.at(-1).y);
}

function drawMistBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  thickness: number,
  color: string,
  alpha: number
): void {
  const transparent = hexToRgba(color, 0);
  const grad = ctx.createLinearGradient(0, y - thickness, 0, y + thickness);
  grad.addColorStop(0, transparent);
  grad.addColorStop(0.25, hexToRgba(color, alpha * 0.3));
  grad.addColorStop(0.45, hexToRgba(color, alpha * 0.8));
  grad.addColorStop(0.5, hexToRgba(color, alpha));
  grad.addColorStop(0.55, hexToRgba(color, alpha * 0.8));
  grad.addColorStop(0.75, hexToRgba(color, alpha * 0.3));
  grad.addColorStop(1, transparent);
  ctx.fillStyle = grad;
  ctx.fillRect(-20, y - thickness, width + 40, thickness * 2);
}

function drawAtmosphericHaze(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pal: BackdropPalette,
  intensity: number
): void {
  ctx.save();
  const hazeGrad = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.6);
  hazeGrad.addColorStop(0, hexToRgba(pal.skyBottom, intensity * 0.6));
  hazeGrad.addColorStop(0.3, hexToRgba(pal.skyBottom, intensity * 0.35));
  hazeGrad.addColorStop(0.6, hexToRgba(pal.skyBottom, intensity * 0.15));
  hazeGrad.addColorStop(1, hexToRgba(pal.skyBottom, 0));
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, height * 0.1, width, height * 0.5);
  ctx.restore();
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Firewatch ridge generation ─────────────────────────────────

function generateSmoothRidge(
  width: number,
  baseY: number,
  amplitude: number,
  seed: number,
  segments: number = 50
): { x: number; y: number }[] {
  const rand = createSeededRandom(seed);
  const f1 = 0.7 + rand() * 0.6;
  const f2 = 2 + rand() * 1;
  const f3 = 4.5 + rand() * 2;
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const p3 = rand() * Math.PI * 2;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -30 + t * (width + 60);
    const y =
      baseY -
      Math.sin(t * Math.PI * f1 + p1) * amplitude -
      Math.sin(t * Math.PI * f2 + p2) * amplitude * 0.25 -
      Math.sin(t * Math.PI * f3 + p3) * amplitude * 0.06;
    pts.push({ x, y });
  }
  return pts;
}

function generateJaggedRidge(
  width: number,
  baseY: number,
  amplitude: number,
  seed: number,
  peakCount: number = 8,
  jaggedness: number = 1
): { x: number; y: number }[] {
  const rand = createSeededRandom(seed);
  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i <= peakCount * 3; i++) {
    const t = i / (peakCount * 3);
    const x = -50 + t * (width + 100);
    const phase = i % 3;
    let peakH: number;
    if (phase === 1) {
      peakH = amplitude * (0.55 + rand() * 0.45);
    } else if (phase === 2) {
      peakH = amplitude * (0.15 + rand() * 0.25);
    } else {
      peakH = amplitude * (0.02 + rand() * 0.1);
    }
    const jitter = (rand() - 0.5) * amplitude * 0.1 * jaggedness;
    pts.push({
      x: x + (rand() - 0.5) * 6 * jaggedness,
      y: baseY - peakH + jitter,
    });
  }
  return pts;
}

function drawRidgeFill(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  width: number,
  height: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  smoothFill(ctx, pts);
  ctx.lineTo(width + 30, height + 20);
  ctx.lineTo(-30, height + 20);
  ctx.closePath();
  ctx.fill();
}

// ─── tree silhouette rendering ──────────────────────────────────

function drawConiferSilhouettes(
  ctx: CanvasRenderingContext2D,
  ridgePts: { x: number; y: number }[],
  color: string,
  seed: number,
  density: number,
  maxH: number
): void {
  const rand = createSeededRandom(seed);
  ctx.fillStyle = color;

  for (let i = 1; i < ridgePts.length - 1; i++) {
    if (rand() > density) {
      continue;
    }
    const p = ridgePts[i];
    const next = ridgePts[i + 1];
    const count = 1 + Math.floor(rand() * 3);
    for (let t = 0; t < count; t++) {
      const tx = lerp(p.x, next.x, rand());
      const ty = lerp(p.y, next.y, rand());
      const h = maxH * (0.3 + rand() * 0.7);
      const w = h * (0.18 + rand() * 0.14);
      ctx.beginPath();
      ctx.moveTo(tx, ty - h);
      ctx.lineTo(tx + w, ty + 1);
      ctx.lineTo(tx - w, ty + 1);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawRoundTreeSilhouettes(
  ctx: CanvasRenderingContext2D,
  ridgePts: { x: number; y: number }[],
  color: string,
  seed: number,
  density: number,
  maxH: number
): void {
  const rand = createSeededRandom(seed);
  ctx.fillStyle = color;

  for (let i = 1; i < ridgePts.length - 1; i++) {
    if (rand() > density) {
      continue;
    }
    const p = ridgePts[i];
    const h = maxH * (0.4 + rand() * 0.6);
    const r = h * (0.4 + rand() * 0.25);
    const ox = (rand() - 0.5) * 4;
    ctx.beginPath();
    ctx.arc(p.x + ox, p.y - h * 0.35, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(p.x - h * 0.04, p.y - h * 0.35 + r * 0.5, h * 0.08, h * 0.35);
  }
}

function drawDeadTreeSilhouettes(
  ctx: CanvasRenderingContext2D,
  ridgePts: { x: number; y: number }[],
  color: string,
  seed: number,
  density: number,
  maxH: number
): void {
  const rand = createSeededRandom(seed);
  ctx.fillStyle = color;

  for (let i = 1; i < ridgePts.length - 1; i++) {
    if (rand() > density) {
      continue;
    }
    const p = ridgePts[i];
    const h = maxH * (0.3 + rand() * 0.7);
    const w = Math.max(1, h * 0.06);

    ctx.beginPath();
    ctx.moveTo(p.x, p.y - h);
    ctx.lineTo(p.x + w, p.y + 1);
    ctx.lineTo(p.x - w, p.y + 1);
    ctx.closePath();
    ctx.fill();

    if (rand() > 0.5) {
      const by = p.y - h * (0.3 + rand() * 0.4);
      const side = rand() > 0.5 ? 1 : -1;
      const blen = h * (0.12 + rand() * 0.15);
      ctx.beginPath();
      ctx.moveTo(p.x, by);
      ctx.lineTo(p.x + side * blen, by - blen * 0.3);
      ctx.lineTo(p.x + side * blen * 0.3, by + w);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawCactusSilhouettes(
  ctx: CanvasRenderingContext2D,
  ridgePts: { x: number; y: number }[],
  color: string,
  seed: number,
  density: number,
  maxH: number
): void {
  const rand = createSeededRandom(seed);
  ctx.fillStyle = color;

  for (let i = 1; i < ridgePts.length - 1; i++) {
    if (rand() > density) {
      continue;
    }
    const p = ridgePts[i];
    const h = maxH * (0.3 + rand() * 0.7);
    const w = Math.max(1, h * 0.12);

    ctx.fillRect(p.x - w / 2, p.y - h, w, h + 1);

    const arms = 1 + Math.floor(rand() * 2);
    for (let a = 0; a < arms; a++) {
      const ay = p.y - h * (0.3 + rand() * 0.35);
      const side = a === 0 ? (rand() > 0.5 ? 1 : -1) : -(rand() > 0.5 ? 1 : -1);
      const armLen = h * (0.15 + rand() * 0.15);
      const armW = w * 0.8;
      const armX = side > 0 ? p.x + w / 2 : p.x - w / 2 - armLen;
      ctx.fillRect(armX, ay - armW / 2, armLen, armW);
      const upH = h * (0.1 + rand() * 0.15);
      const vertX =
        side > 0 ? p.x + w / 2 + armLen - armW : p.x - w / 2 - armLen;
      ctx.fillRect(vertX, ay - armW / 2 - upH, armW, upH + armW / 2);
    }
  }
}

function drawMesaSilhouettes(
  ctx: CanvasRenderingContext2D,
  ridgePts: { x: number; y: number }[],
  color: string,
  seed: number,
  count: number,
  maxH: number,
  maxW: number
): void {
  const rand = createSeededRandom(seed);
  ctx.fillStyle = color;

  for (let i = 0; i < count; i++) {
    const idx = Math.min(
      ridgePts.length - 1,
      Math.floor(rand() * ridgePts.length)
    );
    const p = ridgePts[idx];
    const w = maxW * (0.5 + rand() * 0.5);
    const h = maxH * (0.4 + rand() * 0.6);
    const topW = w * (0.4 + rand() * 0.3);

    ctx.beginPath();
    ctx.moveTo(p.x - w / 2, p.y + 2);
    ctx.lineTo(p.x - topW / 2, p.y - h);
    ctx.lineTo(p.x + topW / 2, p.y - h);
    ctx.lineTo(p.x + w / 2, p.y + 2);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── layer type definitions ─────────────────────────────────────

type TreeStyle = "conifer" | "deciduous" | "dead" | "cactus" | "none";
type RidgeStyle = "smooth" | "jagged";

interface FirewatchLayer {
  baseY: number;
  amplitude: number;
  color: string;
  treeType: TreeStyle;
  treeDensity: number;
  treeHeight: number;
  ridge: RidgeStyle;
  jaggedness?: number;
  peakCount?: number;
  mistAlpha?: number;
}

function renderLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
  layers: FirewatchLayer[]
): void {
  drawAtmosphericHaze(ctx, width, height, pal, 0.2);

  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const baseY = height * l.baseY;
    const amp = height * l.amplitude;

    const pts =
      l.ridge === "jagged"
        ? generateJaggedRidge(
            width,
            baseY,
            amp,
            seed + i * 137,
            l.peakCount ?? 8,
            l.jaggedness ?? 1
          )
        : generateSmoothRidge(width, baseY, amp, seed + i * 137);

    drawRidgeFill(ctx, pts, width, height, l.color);

    const treeH = height * l.treeHeight;
    switch (l.treeType) {
      case "conifer": {
        drawConiferSilhouettes(
          ctx,
          pts,
          l.color,
          seed + i * 251,
          l.treeDensity,
          treeH
        );
        break;
      }
      case "deciduous": {
        drawRoundTreeSilhouettes(
          ctx,
          pts,
          l.color,
          seed + i * 251,
          l.treeDensity,
          treeH
        );
        break;
      }
      case "dead": {
        drawDeadTreeSilhouettes(
          ctx,
          pts,
          l.color,
          seed + i * 251,
          l.treeDensity,
          treeH
        );
        break;
      }
      case "cactus": {
        drawCactusSilhouettes(
          ctx,
          pts,
          l.color,
          seed + i * 251,
          l.treeDensity,
          treeH
        );
        break;
      }
      case "none": {
        break;
      }
    }

    if (l.mistAlpha) {
      const mistThickness = height * (0.03 + i * 0.005);
      drawMistBand(
        ctx,
        width,
        baseY,
        mistThickness,
        pal.skyBottom,
        l.mistAlpha
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// GRASSLAND — warm golden-hour Firewatch layers
// ═══════════════════════════════════════════════════════════════════

function renderGrasslandBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette
): void {
  const layers: FirewatchLayer[] = [
    {
      baseY: 0.16,
      amplitude: 0.012,
      color: "#98AF8C",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.06,
    },
    {
      baseY: 0.2,
      amplitude: 0.02,
      color: "#82A070",
      treeType: "conifer",
      treeDensity: 0.1,
      treeHeight: 0.014,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.26,
      amplitude: 0.028,
      color: "#6B8E58",
      treeType: "conifer",
      treeDensity: 0.16,
      treeHeight: 0.02,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.32,
      amplitude: 0.035,
      color: "#4E7840",
      treeType: "deciduous",
      treeDensity: 0.12,
      treeHeight: 0.024,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.38,
      amplitude: 0.04,
      color: "#3A6430",
      treeType: "conifer",
      treeDensity: 0.22,
      treeHeight: 0.03,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.44,
      amplitude: 0.045,
      color: "#265020",
      treeType: "conifer",
      treeDensity: 0.3,
      treeHeight: 0.038,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.5,
      amplitude: 0.035,
      color: "#183C14",
      treeType: "conifer",
      treeDensity: 0.38,
      treeHeight: 0.045,
      ridge: "smooth",
    },
  ];

  renderLayers(ctx, width, height, seed + 7000, pal, layers);
}

// ═══════════════════════════════════════════════════════════════════
// DESERT — blazing sunset Firewatch dunes with mesas
// ═══════════════════════════════════════════════════════════════════

function renderDesertBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette
): void {
  const layers: FirewatchLayer[] = [
    {
      baseY: 0.18,
      amplitude: 0.01,
      color: "#C4956A",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.05,
    },
    {
      baseY: 0.22,
      amplitude: 0.016,
      color: "#B08050",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.07,
    },
    {
      baseY: 0.28,
      amplitude: 0.022,
      color: "#8C5E38",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.34,
      amplitude: 0.028,
      color: "#704828",
      treeType: "cactus",
      treeDensity: 0.04,
      treeHeight: 0.014,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.4,
      amplitude: 0.034,
      color: "#543618",
      treeType: "cactus",
      treeDensity: 0.06,
      treeHeight: 0.018,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.46,
      amplitude: 0.038,
      color: "#3C2610",
      treeType: "dead",
      treeDensity: 0.05,
      treeHeight: 0.016,
      ridge: "smooth",
      mistAlpha: 0.07,
    },
    {
      baseY: 0.5,
      amplitude: 0.03,
      color: "#281808",
      treeType: "dead",
      treeDensity: 0.04,
      treeHeight: 0.012,
      ridge: "smooth",
    },
  ];

  renderLayers(ctx, width, height, seed + 4000, pal, layers);

  // mesa silhouettes on far layers
  const rand = createSeededRandom(seed + 4500);
  drawMesaSilhouettes(
    ctx,
    [{ x: width * (0.15 + rand() * 0.2), y: height * 0.2 }],
    "#B0805088",
    seed + 4510,
    1,
    height * 0.03,
    40
  );
  drawMesaSilhouettes(
    ctx,
    [{ x: width * (0.6 + rand() * 0.2), y: height * 0.22 }],
    "#8C5E3888",
    seed + 4520,
    1,
    height * 0.04,
    50
  );

  // heat shimmer
  ctx.save();
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = 0.012;
    ctx.fillStyle = pal.landHighlight;
    ctx.fillRect(-10, height * (0.22 + i * 0.06), width + 20, 2);
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// WINTER — arctic dawn Firewatch with jagged peaks and conifers
// ═══════════════════════════════════════════════════════════════════

function renderWinterBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette
): void {
  const layers: FirewatchLayer[] = [
    {
      baseY: 0.16,
      amplitude: 0.03,
      color: "#7090A8",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "jagged",
      jaggedness: 0.6,
      peakCount: 10,
      mistAlpha: 0.07,
    },
    {
      baseY: 0.2,
      amplitude: 0.05,
      color: "#5E7E96",
      treeType: "conifer",
      treeDensity: 0.06,
      treeHeight: 0.01,
      ridge: "jagged",
      jaggedness: 0.8,
      peakCount: 9,
      mistAlpha: 0.09,
    },
    {
      baseY: 0.26,
      amplitude: 0.07,
      color: "#4C6C84",
      treeType: "conifer",
      treeDensity: 0.1,
      treeHeight: 0.015,
      ridge: "jagged",
      jaggedness: 1,
      peakCount: 8,
      mistAlpha: 0.1,
    },
    {
      baseY: 0.32,
      amplitude: 0.09,
      color: "#3A5A72",
      treeType: "conifer",
      treeDensity: 0.14,
      treeHeight: 0.02,
      ridge: "jagged",
      jaggedness: 1.2,
      peakCount: 7,
      mistAlpha: 0.1,
    },
    {
      baseY: 0.38,
      amplitude: 0.08,
      color: "#2A4A60",
      treeType: "conifer",
      treeDensity: 0.22,
      treeHeight: 0.028,
      ridge: "jagged",
      jaggedness: 1,
      peakCount: 8,
      mistAlpha: 0.1,
    },
    {
      baseY: 0.44,
      amplitude: 0.06,
      color: "#1C3A50",
      treeType: "conifer",
      treeDensity: 0.3,
      treeHeight: 0.035,
      ridge: "jagged",
      jaggedness: 0.7,
      peakCount: 10,
      mistAlpha: 0.08,
    },
    {
      baseY: 0.5,
      amplitude: 0.04,
      color: "#102838",
      treeType: "conifer",
      treeDensity: 0.36,
      treeHeight: 0.04,
      ridge: "jagged",
      jaggedness: 0.5,
      peakCount: 12,
    },
  ];

  renderLayers(ctx, width, height, seed + 5000, pal, layers);

  // snow accent on peaks of layers 2-4 (the tall jagged ones)
  const snowColor = pal.mountainSnow ?? "#D8E8F4";
  ctx.save();
  ctx.fillStyle = snowColor;
  ctx.globalAlpha = 0.18;
  for (let li = 2; li <= 4; li++) {
    const l = layers[li];
    const pts = generateJaggedRidge(
      width,
      height * l.baseY,
      height * l.amplitude,
      seed + 5000 + li * 137,
      l.peakCount ?? 8,
      l.jaggedness ?? 1
    );

    for (let i = 1; i < pts.length - 1; i += 3) {
      const p = pts[i];
      const prev = pts[i - 1];
      const next = pts[Math.min(i + 1, pts.length - 1)];
      if (p.y < prev.y && p.y < next.y) {
        const snowH = height * l.amplitude * 0.15;
        ctx.beginPath();
        ctx.moveTo(prev.x * 0.6 + p.x * 0.4, prev.y * 0.6 + p.y * 0.4);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(next.x * 0.6 + p.x * 0.4, next.y * 0.6 + p.y * 0.4);
        ctx.lineTo(next.x * 0.5 + p.x * 0.5, p.y + snowH);
        ctx.lineTo(prev.x * 0.5 + p.x * 0.5, p.y + snowH);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // falling snow particles
  ctx.save();
  const snowRand = createSeededRandom(seed + 5500);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 40; i++) {
    const sx = snowRand() * width;
    const sy = height * (0.1 + snowRand() * 0.45);
    const size = 0.6 + snowRand() * 1.8;
    ctx.globalAlpha = 0.04 + snowRand() * 0.08;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// SWAMP — twilight Firewatch fog layers with dense canopy
// ═══════════════════════════════════════════════════════════════════

function renderSwampBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette
): void {
  const layers: FirewatchLayer[] = [
    {
      baseY: 0.18,
      amplitude: 0.01,
      color: "#4A6C52",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.22,
      amplitude: 0.018,
      color: "#3E5E46",
      treeType: "deciduous",
      treeDensity: 0.08,
      treeHeight: 0.012,
      ridge: "smooth",
      mistAlpha: 0.12,
    },
    {
      baseY: 0.28,
      amplitude: 0.025,
      color: "#324E3A",
      treeType: "deciduous",
      treeDensity: 0.14,
      treeHeight: 0.018,
      ridge: "smooth",
      mistAlpha: 0.14,
    },
    {
      baseY: 0.34,
      amplitude: 0.03,
      color: "#264230",
      treeType: "deciduous",
      treeDensity: 0.2,
      treeHeight: 0.024,
      ridge: "smooth",
      mistAlpha: 0.14,
    },
    {
      baseY: 0.4,
      amplitude: 0.032,
      color: "#1C3626",
      treeType: "deciduous",
      treeDensity: 0.26,
      treeHeight: 0.03,
      ridge: "smooth",
      mistAlpha: 0.12,
    },
    {
      baseY: 0.46,
      amplitude: 0.028,
      color: "#142C1E",
      treeType: "conifer",
      treeDensity: 0.18,
      treeHeight: 0.028,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.5,
      amplitude: 0.022,
      color: "#0C2016",
      treeType: "conifer",
      treeDensity: 0.25,
      treeHeight: 0.032,
      ridge: "smooth",
    },
  ];

  renderLayers(ctx, width, height, seed + 3000, pal, layers);

  // firefly specks
  ctx.save();
  const ffRand = createSeededRandom(seed + 3500);
  for (let i = 0; i < 30; i++) {
    const fx = ffRand() * width;
    const fy = height * (0.18 + ffRand() * 0.32);
    ctx.globalAlpha = 0.03 + ffRand() * 0.05;
    const glowR = 2 + ffRand() * 3;
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
    glow.addColorStop(0, hexToRgba(pal.landHighlight, 0.35));
    glow.addColorStop(0.5, hexToRgba(pal.landHighlight, 0.1));
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy, glowR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// VOLCANIC — infernal Firewatch hellscape with ember glow
// ═══════════════════════════════════════════════════════════════════

function renderVolcanicBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette
): void {
  // under-glow from lava below
  ctx.save();
  const skyGlow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    height * 0.1,
    width * 0.5,
    height * 0.5,
    height * 0.6
  );
  skyGlow.addColorStop(0, "rgba(255,50,10,0.06)");
  skyGlow.addColorStop(0.5, "rgba(255,30,5,0.03)");
  skyGlow.addColorStop(1, "rgba(200,20,0,0)");
  ctx.fillStyle = skyGlow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  const layers: FirewatchLayer[] = [
    {
      baseY: 0.16,
      amplitude: 0.025,
      color: "#5A2A1A",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "jagged",
      jaggedness: 0.8,
      peakCount: 10,
      mistAlpha: 0.05,
    },
    {
      baseY: 0.2,
      amplitude: 0.04,
      color: "#4C201A",
      treeType: "dead",
      treeDensity: 0.03,
      treeHeight: 0.008,
      ridge: "jagged",
      jaggedness: 1,
      peakCount: 9,
      mistAlpha: 0.06,
    },
    {
      baseY: 0.26,
      amplitude: 0.06,
      color: "#3E1614",
      treeType: "dead",
      treeDensity: 0.05,
      treeHeight: 0.012,
      ridge: "jagged",
      jaggedness: 1.3,
      peakCount: 8,
      mistAlpha: 0.07,
    },
    {
      baseY: 0.32,
      amplitude: 0.075,
      color: "#301010",
      treeType: "dead",
      treeDensity: 0.06,
      treeHeight: 0.016,
      ridge: "jagged",
      jaggedness: 1.5,
      peakCount: 7,
      mistAlpha: 0.07,
    },
    {
      baseY: 0.38,
      amplitude: 0.065,
      color: "#240A0A",
      treeType: "dead",
      treeDensity: 0.08,
      treeHeight: 0.02,
      ridge: "jagged",
      jaggedness: 1.2,
      peakCount: 8,
      mistAlpha: 0.06,
    },
    {
      baseY: 0.44,
      amplitude: 0.05,
      color: "#1A0606",
      treeType: "dead",
      treeDensity: 0.06,
      treeHeight: 0.016,
      ridge: "jagged",
      jaggedness: 0.8,
      peakCount: 10,
      mistAlpha: 0.05,
    },
    {
      baseY: 0.5,
      amplitude: 0.035,
      color: "#120404",
      treeType: "dead",
      treeDensity: 0.04,
      treeHeight: 0.012,
      ridge: "jagged",
      jaggedness: 0.5,
      peakCount: 12,
    },
  ];

  renderLayers(ctx, width, height, seed + 6000, pal, layers);

  // lava glow reflection
  ctx.save();
  const lavaReflect = ctx.createLinearGradient(
    0,
    height * 0.44,
    0,
    height * 0.55
  );
  lavaReflect.addColorStop(0, "rgba(255,60,10,0)");
  lavaReflect.addColorStop(0.4, "rgba(255,50,10,0.04)");
  lavaReflect.addColorStop(0.7, "rgba(255,40,5,0.06)");
  lavaReflect.addColorStop(1, "rgba(255,30,0,0)");
  ctx.fillStyle = lavaReflect;
  ctx.fillRect(0, height * 0.44, width, height * 0.12);
  ctx.restore();

  // ember particles
  ctx.save();
  const emberRand = createSeededRandom(seed + 6500);
  for (let i = 0; i < 25; i++) {
    const ex = emberRand() * width;
    const ey = height * (0.1 + emberRand() * 0.42);
    const emberR = 0.4 + emberRand() * 1.3;
    ctx.globalAlpha = 0.03 + emberRand() * 0.05;
    const emberGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, emberR * 2);
    emberGlow.addColorStop(0, "rgba(255,120,30,0.6)");
    emberGlow.addColorStop(0.5, "rgba(255,80,15,0.2)");
    emberGlow.addColorStop(1, "rgba(255,40,0,0)");
    ctx.fillStyle = emberGlow;
    ctx.beginPath();
    ctx.arc(ex, ey, emberR * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC — main dispatcher
// ═══════════════════════════════════════════════════════════════════

export function renderThemedBackdropSilhouettes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  themeKey: ChallengeThemeKey,
  palette: BackdropPalette
): void {
  const verticalShift = height * 0.12;
  ctx.save();
  ctx.translate(0, verticalShift);

  switch (themeKey) {
    case "swamp": {
      renderSwampBackdrop(ctx, width, height, seed, palette);
      break;
    }
    case "desert": {
      renderDesertBackdrop(ctx, width, height, seed, palette);
      break;
    }
    case "winter": {
      renderWinterBackdrop(ctx, width, height, seed, palette);
      break;
    }
    case "volcanic": {
      renderVolcanicBackdrop(ctx, width, height, seed, palette);
      break;
    }
    case "grassland":
    default: {
      renderGrasslandBackdrop(ctx, width, height, seed, palette);
      break;
    }
  }

  ctx.restore();
}
