import { hexToRgb, hexToRgba } from "../../utils";
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
  const last = pts.at(-1);
  if (last) {
    ctx.lineTo(last.x, last.y);
  }
}

function lerpColor(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

function drawMistBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  thickness: number,
  color: string,
  alpha: number,
  seed: number
): void {
  const transparent = hexToRgba(color, 0);
  const rand = createSeededRandom(seed);

  const grad = ctx.createLinearGradient(0, y - thickness, 0, y + thickness);
  grad.addColorStop(0, transparent);
  grad.addColorStop(0.2, hexToRgba(color, alpha * 0.15));
  grad.addColorStop(0.4, hexToRgba(color, alpha * 0.7));
  grad.addColorStop(0.5, hexToRgba(color, alpha));
  grad.addColorStop(0.6, hexToRgba(color, alpha * 0.7));
  grad.addColorStop(0.8, hexToRgba(color, alpha * 0.15));
  grad.addColorStop(1, transparent);
  ctx.fillStyle = grad;
  ctx.fillRect(-20, y - thickness, width + 40, thickness * 2);

  ctx.save();
  const puffCount = 6 + Math.floor(rand() * 5);
  for (let i = 0; i < puffCount; i++) {
    const px = rand() * width;
    const py = y + (rand() - 0.5) * thickness * 0.8;
    const pw = 30 + rand() * 60;
    const ph = thickness * (0.3 + rand() * 0.4);
    const pAlpha = alpha * (0.15 + rand() * 0.25);

    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pw);
    pGrad.addColorStop(0, hexToRgba(color, pAlpha));
    pGrad.addColorStop(0.5, hexToRgba(color, pAlpha * 0.4));
    pGrad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWindStreaks(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  thickness: number,
  color: string,
  alpha: number,
  seed: number
): void {
  const rand = createSeededRandom(seed);
  ctx.save();
  const streakCount = 3 + Math.floor(rand() * 4);

  for (let i = 0; i < streakCount; i++) {
    const sx = rand() * width * 0.8;
    const sy = y + (rand() - 0.5) * thickness;
    const len = width * (0.08 + rand() * 0.18);
    const streakAlpha = alpha * (0.3 + rand() * 0.4);

    const grad = ctx.createLinearGradient(sx, sy, sx + len, sy);
    grad.addColorStop(0, hexToRgba(color, 0));
    grad.addColorStop(0.2, hexToRgba(color, streakAlpha));
    grad.addColorStop(0.5, hexToRgba(color, streakAlpha * 0.7));
    grad.addColorStop(1, hexToRgba(color, 0));

    ctx.fillStyle = grad;
    const h = 1.5 + rand() * 3;
    ctx.fillRect(sx, sy - h / 2, len, h);
  }
  ctx.restore();
}

function drawAtmosphericHaze(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pal: BackdropPalette,
  intensity: number,
  seed: number
): void {
  ctx.save();

  const hazeGrad = ctx.createLinearGradient(0, height * 0.05, 0, height * 0.65);
  hazeGrad.addColorStop(0, hexToRgba(pal.skyBottom, intensity * 0.7));
  hazeGrad.addColorStop(0.15, hexToRgba(pal.skyBottom, intensity * 0.5));
  hazeGrad.addColorStop(0.35, hexToRgba(pal.skyBottom, intensity * 0.3));
  hazeGrad.addColorStop(0.6, hexToRgba(pal.skyBottom, intensity * 0.12));
  hazeGrad.addColorStop(1, hexToRgba(pal.skyBottom, 0));
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, height * 0.05, width, height * 0.6);

  const rand = createSeededRandom(seed);
  const patchCount = 5;
  for (let i = 0; i < patchCount; i++) {
    const px = rand() * width;
    const py = height * (0.1 + rand() * 0.25);
    const pr = 60 + rand() * 100;
    const pAlpha = intensity * (0.08 + rand() * 0.1);
    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pr);
    pGrad.addColorStop(0, hexToRgba(pal.skyBottom, pAlpha));
    pGrad.addColorStop(0.6, hexToRgba(pal.skyBottom, pAlpha * 0.3));
    pGrad.addColorStop(1, hexToRgba(pal.skyBottom, 0));
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, pr, pr * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

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
  segments: number = 80
): { x: number; y: number }[] {
  const rand = createSeededRandom(seed);

  const octaves = 6;
  const freqs: number[] = [];
  const phases: number[] = [];
  const amps: number[] = [];
  for (let o = 0; o < octaves; o++) {
    freqs.push(0.6 + rand() * 0.5 + o * (1.4 + rand() * 0.8));
    phases.push(rand() * Math.PI * 2);
    amps.push(o === 0 ? 1 : amps[o - 1] * (0.35 + rand() * 0.15));
  }

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -40 + t * (width + 80);
    let yOff = 0;
    for (let o = 0; o < octaves; o++) {
      yOff += Math.sin(t * Math.PI * freqs[o] + phases[o]) * amps[o];
    }
    const jitter = (rand() - 0.5) * amplitude * 0.06;
    pts.push({ x, y: baseY - yOff * amplitude + jitter });
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
  const subF1 = 5 + rand() * 5;
  const subF2 = 10 + rand() * 8;
  const subP1 = rand() * Math.PI * 2;
  const subP2 = rand() * Math.PI * 2;
  const envelopePhase = rand() * Math.PI * 2;

  for (let i = 0; i <= peakCount * 3; i++) {
    const t = i / (peakCount * 3);
    const x = -50 + t * (width + 100);
    const phase = i % 3;
    const envelope = 0.7 + 0.3 * Math.sin(t * Math.PI * 1.5 + envelopePhase);
    let peakH: number;
    if (phase === 1) {
      peakH = amplitude * (0.5 + rand() * 0.5) * envelope;
    } else if (phase === 2) {
      peakH = amplitude * (0.1 + rand() * 0.3) * envelope;
    } else {
      peakH = amplitude * (0.02 + rand() * 0.12);
    }
    const subDetail =
      Math.sin(t * Math.PI * subF1 + subP1) * amplitude * 0.06 +
      Math.sin(t * Math.PI * subF2 + subP2) * amplitude * 0.025;
    const jitter = (rand() - 0.5) * amplitude * 0.15 * jaggedness;
    pts.push({
      x: x + (rand() - 0.5) * 10 * jaggedness,
      y: baseY - peakH + jitter - subDetail,
    });
  }
  return pts;
}

function drawRidgeFill(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  width: number,
  height: number,
  color: string,
  hazeColor: string,
  hazeFade: number
): void {
  let minY = height;
  for (const p of pts) {
    if (p.y < minY) {
      minY = p.y;
    }
  }

  if (hazeFade > 0.01) {
    const gradFill = ctx.createLinearGradient(0, minY, 0, height);
    gradFill.addColorStop(0, lerpColor(color, hazeColor, hazeFade));
    gradFill.addColorStop(0.4, lerpColor(color, hazeColor, hazeFade * 0.3));
    gradFill.addColorStop(1, color);
    ctx.fillStyle = gradFill;
  } else {
    ctx.fillStyle = color;
  }
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
  darkColor: string,
  seed: number,
  density: number,
  maxH: number
): void {
  const rand = createSeededRandom(seed);

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
      ctx.fillStyle = rand() > 0.4 ? color : darkColor;
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
  darkColor: string,
  seed: number,
  density: number,
  maxH: number
): void {
  const rand = createSeededRandom(seed);

  for (let i = 1; i < ridgePts.length - 1; i++) {
    if (rand() > density) {
      continue;
    }
    const p = ridgePts[i];
    const h = maxH * (0.4 + rand() * 0.6);
    const r = h * (0.4 + rand() * 0.25);
    const ox = (rand() - 0.5) * 4;
    ctx.fillStyle = rand() > 0.4 ? color : darkColor;
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
  _darkColor: string,
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
  _darkColor: string,
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

function darkenHex(hex: string, amount: number): string {
  const c = hexToRgb(hex);
  const r = Math.max(0, Math.round(c.r * (1 - amount)));
  const g = Math.max(0, Math.round(c.g * (1 - amount)));
  const b = Math.max(0, Math.round(c.b * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

function renderLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  pal: BackdropPalette,
  layers: FirewatchLayer[]
): void {
  drawAtmosphericHaze(ctx, width, height, pal, 0.25, seed + 9000);

  const layerRand = createSeededRandom(seed + 8888);
  const totalLayers = layers.length;
  for (let i = 0; i < totalLayers; i++) {
    const l = layers[i];
    const yJitter = (layerRand() - 0.5) * height * 0.02;
    const baseY = height * l.baseY + yJitter;
    const amp = height * l.amplitude;
    const depthT = i / Math.max(1, totalLayers - 1);
    const hazeFade = Math.max(0, 0.55 - depthT * 0.65);

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

    drawRidgeFill(ctx, pts, width, height, l.color, pal.skyBottom, hazeFade);

    const treeH = height * l.treeHeight;
    const darkTreeColor = darkenHex(l.color, 0.15);
    switch (l.treeType) {
      case "conifer": {
        drawConiferSilhouettes(
          ctx,
          pts,
          l.color,
          darkTreeColor,
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
          darkTreeColor,
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
          darkTreeColor,
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
          darkTreeColor,
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
      const mistThickness = height * (0.03 + i * 0.006);
      drawMistBand(
        ctx,
        width,
        baseY,
        mistThickness,
        pal.skyBottom,
        l.mistAlpha,
        seed + i * 431
      );
    }

    if (i > 0 && i < totalLayers - 1 && hazeFade > 0.05) {
      drawWindStreaks(
        ctx,
        width,
        baseY - amp * 0.3,
        height * 0.02,
        pal.skyBottom,
        hazeFade * 0.3,
        seed + i * 617
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
      baseY: 0.15,
      amplitude: 0.04,
      color: "#9AB492",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.2,
      amplitude: 0.055,
      color: "#84A676",
      treeType: "conifer",
      treeDensity: 0.08,
      treeHeight: 0.014,
      ridge: "smooth",
      mistAlpha: 0.12,
    },
    {
      baseY: 0.26,
      amplitude: 0.065,
      color: "#6E9660",
      treeType: "conifer",
      treeDensity: 0.14,
      treeHeight: 0.02,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.31,
      amplitude: 0.07,
      color: "#58864C",
      treeType: "deciduous",
      treeDensity: 0.12,
      treeHeight: 0.024,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.36,
      amplitude: 0.075,
      color: "#467838",
      treeType: "conifer",
      treeDensity: 0.2,
      treeHeight: 0.03,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.41,
      amplitude: 0.07,
      color: "#346828",
      treeType: "conifer",
      treeDensity: 0.28,
      treeHeight: 0.036,
      ridge: "smooth",
      mistAlpha: 0.06,
    },
    {
      baseY: 0.46,
      amplitude: 0.06,
      color: "#245820",
      treeType: "conifer",
      treeDensity: 0.34,
      treeHeight: 0.042,
      ridge: "smooth",
      mistAlpha: 0.04,
    },
    {
      baseY: 0.51,
      amplitude: 0.05,
      color: "#184418",
      treeType: "conifer",
      treeDensity: 0.38,
      treeHeight: 0.048,
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
      baseY: 0.16,
      amplitude: 0.03,
      color: "#D0A878",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.21,
      amplitude: 0.04,
      color: "#C49060",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.26,
      amplitude: 0.05,
      color: "#B07848",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.31,
      amplitude: 0.055,
      color: "#8C5E38",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.36,
      amplitude: 0.06,
      color: "#704828",
      treeType: "cactus",
      treeDensity: 0.04,
      treeHeight: 0.016,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.41,
      amplitude: 0.06,
      color: "#5E3A1C",
      treeType: "cactus",
      treeDensity: 0.06,
      treeHeight: 0.02,
      ridge: "smooth",
      mistAlpha: 0.07,
    },
    {
      baseY: 0.46,
      amplitude: 0.055,
      color: "#483010",
      treeType: "dead",
      treeDensity: 0.05,
      treeHeight: 0.018,
      ridge: "smooth",
      mistAlpha: 0.06,
    },
    {
      baseY: 0.51,
      amplitude: 0.045,
      color: "#301E08",
      treeType: "dead",
      treeDensity: 0.04,
      treeHeight: 0.014,
      ridge: "smooth",
    },
  ];

  renderLayers(ctx, width, height, seed + 4000, pal, layers);

  const rand = createSeededRandom(seed + 4500);
  const mesaHaze1 = lerpColor("#B08050", pal.skyBottom, 0.35);
  drawMesaSilhouettes(
    ctx,
    [{ x: width * (0.15 + rand() * 0.2), y: height * 0.32 }],
    hexToRgba(mesaHaze1, 0.55),
    seed + 4510,
    1,
    height * 0.04,
    50
  );
  const mesaHaze2 = lerpColor("#8C5E38", pal.skyBottom, 0.25);
  drawMesaSilhouettes(
    ctx,
    [{ x: width * (0.6 + rand() * 0.2), y: height * 0.34 }],
    hexToRgba(mesaHaze2, 0.5),
    seed + 4520,
    1,
    height * 0.05,
    60
  );

  ctx.save();
  for (let i = 0; i < 6; i++) {
    const shimmerAlpha = 0.008 + (i % 2) * 0.004;
    ctx.globalAlpha = shimmerAlpha;
    ctx.fillStyle = pal.landHighlight;
    ctx.fillRect(-10, height * (0.2 + i * 0.05), width + 20, 1.5);
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
      baseY: 0.14,
      amplitude: 0.025,
      color: "#7E9CB4",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "jagged",
      jaggedness: 0.5,
      peakCount: 11,
      mistAlpha: 0.1,
    },
    {
      baseY: 0.18,
      amplitude: 0.04,
      color: "#6C8CA2",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "jagged",
      jaggedness: 0.7,
      peakCount: 10,
      mistAlpha: 0.12,
    },
    {
      baseY: 0.23,
      amplitude: 0.06,
      color: "#5A7C92",
      treeType: "conifer",
      treeDensity: 0.06,
      treeHeight: 0.012,
      ridge: "jagged",
      jaggedness: 0.9,
      peakCount: 9,
      mistAlpha: 0.12,
    },
    {
      baseY: 0.29,
      amplitude: 0.08,
      color: "#486C82",
      treeType: "conifer",
      treeDensity: 0.1,
      treeHeight: 0.016,
      ridge: "jagged",
      jaggedness: 1.1,
      peakCount: 8,
      mistAlpha: 0.1,
    },
    {
      baseY: 0.35,
      amplitude: 0.09,
      color: "#385C72",
      treeType: "conifer",
      treeDensity: 0.16,
      treeHeight: 0.022,
      ridge: "jagged",
      jaggedness: 1.2,
      peakCount: 7,
      mistAlpha: 0.1,
    },
    {
      baseY: 0.4,
      amplitude: 0.07,
      color: "#2A4C62",
      treeType: "conifer",
      treeDensity: 0.24,
      treeHeight: 0.03,
      ridge: "jagged",
      jaggedness: 0.9,
      peakCount: 8,
      mistAlpha: 0.08,
    },
    {
      baseY: 0.45,
      amplitude: 0.055,
      color: "#1E3C52",
      treeType: "conifer",
      treeDensity: 0.32,
      treeHeight: 0.036,
      ridge: "jagged",
      jaggedness: 0.6,
      peakCount: 10,
      mistAlpha: 0.06,
    },
    {
      baseY: 0.5,
      amplitude: 0.04,
      color: "#142E42",
      treeType: "conifer",
      treeDensity: 0.38,
      treeHeight: 0.042,
      ridge: "jagged",
      jaggedness: 0.4,
      peakCount: 12,
    },
  ];

  renderLayers(ctx, width, height, seed + 5000, pal, layers);

  const snowColor = pal.mountainSnow ?? "#D8E8F4";
  ctx.save();
  for (let li = 1; li <= 5; li++) {
    const l = layers[li];
    const depthT = li / (layers.length - 1);
    const snowAlpha = 0.22 - depthT * 0.08;
    ctx.fillStyle = snowColor;
    ctx.globalAlpha = snowAlpha;

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
        const snowH = height * l.amplitude * (0.12 + depthT * 0.06);
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

  ctx.save();
  const snowRand = createSeededRandom(seed + 5500);
  for (let i = 0; i < 60; i++) {
    const sx = snowRand() * width;
    const sy = height * (0.08 + snowRand() * 0.48);
    const size = 0.5 + snowRand() * 2;
    ctx.globalAlpha = 0.03 + snowRand() * 0.07;
    ctx.fillStyle =
      snowRand() > 0.3 ? "rgba(255,255,255,1)" : "rgba(220,235,255,1)";
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
      baseY: 0.16,
      amplitude: 0.025,
      color: "#526E58",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "smooth",
      mistAlpha: 0.12,
    },
    {
      baseY: 0.21,
      amplitude: 0.035,
      color: "#48644E",
      treeType: "deciduous",
      treeDensity: 0.06,
      treeHeight: 0.012,
      ridge: "smooth",
      mistAlpha: 0.15,
    },
    {
      baseY: 0.26,
      amplitude: 0.045,
      color: "#3E5A44",
      treeType: "deciduous",
      treeDensity: 0.1,
      treeHeight: 0.016,
      ridge: "smooth",
      mistAlpha: 0.16,
    },
    {
      baseY: 0.31,
      amplitude: 0.05,
      color: "#344E3A",
      treeType: "deciduous",
      treeDensity: 0.16,
      treeHeight: 0.022,
      ridge: "smooth",
      mistAlpha: 0.14,
    },
    {
      baseY: 0.36,
      amplitude: 0.055,
      color: "#2A4430",
      treeType: "deciduous",
      treeDensity: 0.22,
      treeHeight: 0.028,
      ridge: "smooth",
      mistAlpha: 0.12,
    },
    {
      baseY: 0.41,
      amplitude: 0.055,
      color: "#203828",
      treeType: "deciduous",
      treeDensity: 0.28,
      treeHeight: 0.032,
      ridge: "smooth",
      mistAlpha: 0.1,
    },
    {
      baseY: 0.46,
      amplitude: 0.045,
      color: "#182E20",
      treeType: "conifer",
      treeDensity: 0.2,
      treeHeight: 0.03,
      ridge: "smooth",
      mistAlpha: 0.08,
    },
    {
      baseY: 0.51,
      amplitude: 0.035,
      color: "#102418",
      treeType: "conifer",
      treeDensity: 0.26,
      treeHeight: 0.036,
      ridge: "smooth",
    },
  ];

  renderLayers(ctx, width, height, seed + 3000, pal, layers);

  ctx.save();
  const ffRand = createSeededRandom(seed + 3500);
  for (let i = 0; i < 40; i++) {
    const fx = ffRand() * width;
    const fy = height * (0.16 + ffRand() * 0.36);
    ctx.globalAlpha = 0.03 + ffRand() * 0.06;
    const glowR = 2 + ffRand() * 4;
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowR);
    glow.addColorStop(0, hexToRgba(pal.landHighlight, 0.4));
    glow.addColorStop(0.4, hexToRgba(pal.landHighlight, 0.12));
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
  ctx.save();
  const skyGlow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.55,
    height * 0.08,
    width * 0.5,
    height * 0.55,
    height * 0.65
  );
  skyGlow.addColorStop(0, "rgba(255,50,10,0.08)");
  skyGlow.addColorStop(0.3, "rgba(255,35,8,0.04)");
  skyGlow.addColorStop(0.6, "rgba(255,25,5,0.02)");
  skyGlow.addColorStop(1, "rgba(200,20,0,0)");
  ctx.fillStyle = skyGlow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  const layers: FirewatchLayer[] = [
    {
      baseY: 0.14,
      amplitude: 0.02,
      color: "#6A3422",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "jagged",
      jaggedness: 0.6,
      peakCount: 11,
      mistAlpha: 0.08,
    },
    {
      baseY: 0.18,
      amplitude: 0.035,
      color: "#5A2A1A",
      treeType: "none",
      treeDensity: 0,
      treeHeight: 0,
      ridge: "jagged",
      jaggedness: 0.8,
      peakCount: 10,
      mistAlpha: 0.08,
    },
    {
      baseY: 0.23,
      amplitude: 0.05,
      color: "#4C201A",
      treeType: "dead",
      treeDensity: 0.03,
      treeHeight: 0.008,
      ridge: "jagged",
      jaggedness: 1,
      peakCount: 9,
      mistAlpha: 0.07,
    },
    {
      baseY: 0.28,
      amplitude: 0.065,
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
      baseY: 0.34,
      amplitude: 0.08,
      color: "#301010",
      treeType: "dead",
      treeDensity: 0.06,
      treeHeight: 0.016,
      ridge: "jagged",
      jaggedness: 1.5,
      peakCount: 7,
      mistAlpha: 0.06,
    },
    {
      baseY: 0.39,
      amplitude: 0.065,
      color: "#260C0C",
      treeType: "dead",
      treeDensity: 0.08,
      treeHeight: 0.02,
      ridge: "jagged",
      jaggedness: 1.2,
      peakCount: 8,
      mistAlpha: 0.05,
    },
    {
      baseY: 0.44,
      amplitude: 0.05,
      color: "#1C0808",
      treeType: "dead",
      treeDensity: 0.06,
      treeHeight: 0.016,
      ridge: "jagged",
      jaggedness: 0.8,
      peakCount: 10,
      mistAlpha: 0.04,
    },
    {
      baseY: 0.5,
      amplitude: 0.035,
      color: "#140404",
      treeType: "dead",
      treeDensity: 0.04,
      treeHeight: 0.012,
      ridge: "jagged",
      jaggedness: 0.5,
      peakCount: 12,
    },
  ];

  renderLayers(ctx, width, height, seed + 6000, pal, layers);

  ctx.save();
  const lavaReflect = ctx.createLinearGradient(
    0,
    height * 0.4,
    0,
    height * 0.56
  );
  lavaReflect.addColorStop(0, "rgba(255,60,10,0)");
  lavaReflect.addColorStop(0.3, "rgba(255,50,10,0.05)");
  lavaReflect.addColorStop(0.6, "rgba(255,40,5,0.07)");
  lavaReflect.addColorStop(1, "rgba(255,30,0,0)");
  ctx.fillStyle = lavaReflect;
  ctx.fillRect(0, height * 0.4, width, height * 0.16);
  ctx.restore();

  ctx.save();
  const emberRand = createSeededRandom(seed + 6500);
  for (let i = 0; i < 35; i++) {
    const ex = emberRand() * width;
    const ey = height * (0.08 + emberRand() * 0.45);
    const emberR = 0.3 + emberRand() * 1.5;
    ctx.globalAlpha = 0.03 + emberRand() * 0.06;
    const emberGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, emberR * 2.5);
    emberGlow.addColorStop(0, "rgba(255,130,40,0.7)");
    emberGlow.addColorStop(0.3, "rgba(255,90,20,0.25)");
    emberGlow.addColorStop(0.7, "rgba(255,50,10,0.06)");
    emberGlow.addColorStop(1, "rgba(255,40,0,0)");
    ctx.fillStyle = emberGlow;
    ctx.beginPath();
    ctx.arc(ex, ey, emberR * 2.5, 0, Math.PI * 2);
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
