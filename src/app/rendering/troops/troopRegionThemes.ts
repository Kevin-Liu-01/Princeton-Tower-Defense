import type { MapTheme } from "../../types";

const TAU = Math.PI * 2;

// ── Region accent palettes ───────────────────────────────────────────────────
// Subtle color accents per region -- used for tiny trim details, not large overlays.

export interface RegionAccentPalette {
  trimColor: string;
  trimGlow: string;
  gemColor: string;
  particleRgb: string;
}

const REGION_ACCENTS: Record<MapTheme, RegionAccentPalette> = {
  grassland: {
    trimColor: "rgba(0,0,0,0)",
    trimGlow: "rgba(0,0,0,0)",
    gemColor: "rgba(0,0,0,0)",
    particleRgb: "0,0,0",
  },
  desert: {
    trimColor: "rgba(200,170,100,0.35)",
    trimGlow: "rgba(240,210,120,0.18)",
    gemColor: "#d4a030",
    particleRgb: "210,190,140",
  },
  winter: {
    trimColor: "rgba(160,200,240,0.3)",
    trimGlow: "rgba(180,220,255,0.15)",
    gemColor: "#60b8e8",
    particleRgb: "200,220,255",
  },
  volcanic: {
    trimColor: "rgba(255,90,30,0.25)",
    trimGlow: "rgba(255,120,40,0.15)",
    gemColor: "#e05020",
    particleRgb: "255,100,40",
  },
  swamp: {
    trimColor: "rgba(80,130,50,0.28)",
    trimGlow: "rgba(100,160,60,0.14)",
    gemColor: "#5a9a30",
    particleRgb: "100,150,60",
  },
};

function getAccent(region: MapTheme): RegionAccentPalette {
  return REGION_ACCENTS[region];
}

export function getRegionArmorPalette(region: MapTheme): RegionAccentPalette {
  return REGION_ACCENTS[region];
}

// ── Micro particle helpers (2-3 particles max) ──────────────────────────────

function drawDriftParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  rgb: string, count: number, speed: number,
): void {
  for (let i = 0; i < count; i++) {
    const phase = (time * speed + i * 0.37) % 1;
    const drift = Math.sin(time * 1.2 + i * 2.1) * size * 0.15;
    const px = x + drift;
    const py = y + size * 0.2 - phase * size * 0.6;
    const alpha = Math.sin(phase * Math.PI) * 0.2;
    const r = (0.8 + Math.sin(i * 1.7) * 0.3) * zoom;
    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, TAU);
    ctx.fill();
  }
}

// ── Subtle accent helpers ────────────────────────────────────────────────────

function drawTrimLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawGemDot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  color: string, glowColor: string, time: number,
): void {
  const pulse = 0.6 + Math.sin(time * 2.5) * 0.15;
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.6, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFurTrim(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number,
  zoom: number, time: number,
): void {
  const tufts = 4;
  const sway = Math.sin(time * 2) * width * 0.01;
  ctx.fillStyle = "rgba(210,215,225,0.35)";
  for (let i = 0; i < tufts; i++) {
    const fx = x - width * 0.4 + (i / (tufts - 1)) * width * 0.8 + sway;
    ctx.beginPath();
    ctx.ellipse(fx, y, width * 0.08, width * 0.03, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(200,210,230,0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.42 + sway, y);
  ctx.lineTo(x + width * 0.42 + sway, y);
  ctx.stroke();
}

function drawThinVine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, len: number, side: number,
  zoom: number, time: number,
): void {
  const wave = Math.sin(time * 1.4 + side) * len * 0.06;
  ctx.strokeStyle = "rgba(60,95,35,0.3)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + side * len * 0.15 + wave, y + len * 0.5, x + side * len * 0.05, y + len);
  ctx.stroke();

  ctx.fillStyle = "rgba(80,130,45,0.25)";
  const lx = x + side * len * 0.1 + wave * 0.5;
  const ly = y + len * 0.45;
  ctx.beginPath();
  ctx.ellipse(lx, ly, len * 0.06, len * 0.03, side * 0.4, 0, TAU);
  ctx.fill();
}

function drawEmberGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, time: number,
): void {
  const pulse = 0.12 + Math.sin(time * 3.5) * 0.06;
  ctx.fillStyle = `rgba(255,80,20,${pulse})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function drawCrackLine(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  zoom: number, time: number,
): void {
  if (points.length < 2) return;
  const glow = 0.15 + Math.sin(time * 2.8) * 0.08;
  ctx.strokeStyle = `rgba(255,80,20,${glow})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
}

function drawSandTrim(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number,
  zoom: number, time: number,
): void {
  const shimmer = 0.25 + Math.sin(time * 3) * 0.08;
  ctx.strokeStyle = `rgba(200,170,100,${shimmer})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.5, y);
  ctx.quadraticCurveTo(x, y - width * 0.04, x + width * 0.5, y);
  ctx.stroke();
}

// ── Per-troop region overlay functions ───────────────────────────────────────

function drawSoldierRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawSandTrim(ctx, x, y + size * 0.25, size * 0.24, zoom, time);
      drawGemDot(ctx, x, y + size * 0.06, size * 0.012, p.gemColor, p.trimGlow, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.1, size * 0.36, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.35);
      break;
    }
    case "volcanic": {
      drawCrackLine(ctx, [
        [x - size * 0.08, y + size * 0.04],
        [x + size * 0.02, y + size * 0.12],
        [x + size * 0.1, y + size * 0.06],
      ], zoom, time);
      drawEmberGlow(ctx, x, y + size * 0.08, size * 0.015, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x + size * 0.12, y + size * 0.05, size * 0.12, 1, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

function drawArmoredRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawSandTrim(ctx, x, y - size * 0.14, size * 0.32, zoom, time);
      drawSandTrim(ctx, x, y + size * 0.28, size * 0.18, zoom, time);
      drawGemDot(ctx, x, y + size * 0.08, size * 0.014, p.gemColor, p.trimGlow, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.12, size * 0.42, zoom, time);
      drawTrimLine(ctx, x - size * 0.12, y + size * 0.28, x + size * 0.12, y + size * 0.28, p.trimColor, 0.5 * zoom);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.35);
      break;
    }
    case "volcanic": {
      drawCrackLine(ctx, [
        [x - size * 0.1, y + size * 0.02],
        [x - size * 0.02, y + size * 0.1],
        [x + size * 0.06, y + size * 0.04],
        [x + size * 0.12, y + size * 0.12],
      ], zoom, time);
      drawEmberGlow(ctx, x + size * 0.06, y + size * 0.04, size * 0.012, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x + size * 0.14, y + size * 0.02, size * 0.14, 1, zoom, time);
      drawThinVine(ctx, x - size * 0.14, y + size * 0.06, size * 0.1, -1, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

function drawEliteRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawSandTrim(ctx, x, y - size * 0.12, size * 0.28, zoom, time);
      drawGemDot(ctx, x, y + size * 0.06, size * 0.016, p.gemColor, p.trimGlow, time);
      drawTrimLine(ctx, x - size * 0.1, y + size * 0.24, x + size * 0.1, y + size * 0.24, p.trimColor, 0.5 * zoom);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.1, size * 0.44, zoom, time);
      drawGemDot(ctx, x, y - size * 0.32, size * 0.012, p.gemColor, p.trimGlow, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.35);
      break;
    }
    case "volcanic": {
      drawCrackLine(ctx, [
        [x - size * 0.12, y + size * 0.0],
        [x - size * 0.02, y + size * 0.08],
        [x + size * 0.08, y + size * 0.02],
      ], zoom, time);
      drawCrackLine(ctx, [
        [x + size * 0.04, y - size * 0.08],
        [x - size * 0.02, y + size * 0.02],
      ], zoom, time);
      drawEmberGlow(ctx, x, y + size * 0.06, size * 0.018, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x + size * 0.15, y + size * 0.0, size * 0.15, 1, zoom, time);
      drawThinVine(ctx, x - size * 0.15, y + size * 0.04, size * 0.12, -1, zoom, time);
      drawGemDot(ctx, x, y + size * 0.06, size * 0.012, p.gemColor, p.trimGlow, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

function drawKnightRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawSandTrim(ctx, x, y + size * 0.3, size * 0.28, zoom, time);
      drawGemDot(ctx, x, y + size * 0.12, size * 0.013, p.gemColor, p.trimGlow, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.14, size * 0.4, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.35);
      break;
    }
    case "volcanic": {
      drawCrackLine(ctx, [
        [x - size * 0.1, y + size * 0.06],
        [x + size * 0.02, y + size * 0.14],
        [x + size * 0.1, y + size * 0.08],
      ], zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x + size * 0.13, y + size * 0.06, size * 0.12, 1, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

function drawCavalryRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawSandTrim(ctx, x, y - size * 0.18, size * 0.3, zoom, time);
      drawTrimLine(ctx, x - size * 0.18, y + size * 0.22, x + size * 0.18, y + size * 0.22, p.trimColor, 0.5 * zoom);
      drawDriftParticles(ctx, x, y + size * 0.15, size, time, zoom, p.particleRgb, 3, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.26, size * 0.3, zoom, time);
      drawTrimLine(ctx, x - size * 0.22, y + size * 0.02, x + size * 0.22, y + size * 0.02, p.trimColor, 0.4 * zoom);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.35);
      break;
    }
    case "volcanic": {
      drawCrackLine(ctx, [
        [x - size * 0.15, y + size * 0.02],
        [x - size * 0.04, y + size * 0.1],
        [x + size * 0.08, y + size * 0.04],
        [x + size * 0.16, y + size * 0.1],
      ], zoom, time);
      drawEmberGlow(ctx, x - size * 0.04, y + size * 0.1, size * 0.014, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x - size * 0.16, y - size * 0.05, size * 0.12, -1, zoom, time);
      drawThinVine(ctx, x + size * 0.16, y - size * 0.02, size * 0.1, 1, zoom, time);
      drawDriftParticles(ctx, x, y + size * 0.1, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

function drawCentaurRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawSandTrim(ctx, x, y - size * 0.2, size * 0.26, zoom, time);
      drawGemDot(ctx, x - size * 0.12, y - size * 0.24, size * 0.01, p.gemColor, p.trimGlow, time);
      drawDriftParticles(ctx, x, y + size * 0.12, size, time, zoom, p.particleRgb, 2, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.28, size * 0.28, zoom, time);
      drawTrimLine(ctx, x - size * 0.2, y + size * 0.02, x + size * 0.2, y + size * 0.02, p.trimColor, 0.4 * zoom);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.35);
      break;
    }
    case "volcanic": {
      drawCrackLine(ctx, [
        [x - size * 0.12, y + size * 0.04],
        [x, y + size * 0.1],
        [x + size * 0.14, y + size * 0.06],
      ], zoom, time);
      drawEmberGlow(ctx, x, y + size * 0.1, size * 0.014, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 3, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x + size * 0.14, y + size * 0.0, size * 0.14, 1, zoom, time);
      drawDriftParticles(ctx, x, y + size * 0.1, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

function drawThesisRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawTrimLine(ctx, x - size * 0.08, y + size * 0.26, x + size * 0.08, y + size * 0.26, p.trimColor, 0.5 * zoom);
      const orbPhase = time * 1.2;
      const orbX = x + Math.cos(orbPhase) * size * 0.1;
      const orbY = y - size * 0.18 + Math.sin(orbPhase * 1.3) * size * 0.03;
      ctx.fillStyle = `rgba(240,200,100,${0.15 + Math.sin(time * 3) * 0.08})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, size * 0.012, 0, TAU);
      ctx.fill();
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.08, size * 0.24, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.35);
      break;
    }
    case "volcanic": {
      drawCrackLine(ctx, [
        [x - size * 0.06, y + size * 0.04],
        [x + size * 0.04, y + size * 0.1],
      ], zoom, time);
      drawEmberGlow(ctx, x, y + size * 0.08, size * 0.014, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x + size * 0.1, y + size * 0.02, size * 0.1, 1, zoom, time);
      const sporeGlow = 0.1 + Math.sin(time * 2.5) * 0.05;
      ctx.fillStyle = `rgba(100,180,60,${sporeGlow})`;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.25, size * 0.014, 0, TAU);
      ctx.fill();
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

function drawRowingRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  const p = getAccent(region);

  switch (region) {
    case "desert": {
      drawTrimLine(ctx, x - size * 0.08, y + size * 0.26, x + size * 0.08, y + size * 0.26, p.trimColor, 0.5 * zoom);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.5);
      break;
    }
    case "winter": {
      drawFurTrim(ctx, x, y - size * 0.08, size * 0.22, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.35);
      break;
    }
    case "volcanic": {
      drawEmberGlow(ctx, x - size * 0.08, y + size * 0.04, size * 0.012, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.9);
      break;
    }
    case "swamp": {
      drawThinVine(ctx, x + size * 0.1, y + size * 0.02, size * 0.08, 1, zoom, time);
      drawDriftParticles(ctx, x, y, size, time, zoom, p.particleRgb, 2, 0.4);
      break;
    }
  }
}

// ── Main dispatcher ──────────────────────────────────────────────────────────

const REGION_OVERLAY_MAP: Record<string, (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
) => void> = {
  footsoldier: drawSoldierRegionOverlay,
  soldier: drawSoldierRegionOverlay,
  armored: drawArmoredRegionOverlay,
  elite: drawEliteRegionOverlay,
  knight: drawKnightRegionOverlay,
  cavalry: drawCavalryRegionOverlay,
  centaur: drawCentaurRegionOverlay,
  thesis: drawThesisRegionOverlay,
  rowing: drawRowingRegionOverlay,
};

export function drawTroopRegionOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  troopType: string, region: MapTheme,
  time: number, zoom: number,
): void {
  if (region === "grassland") return;

  const drawFn = REGION_OVERLAY_MAP[troopType];
  if (!drawFn) return;

  ctx.save();
  drawFn(ctx, x, y, size, region, time, zoom);
  ctx.restore();
}
