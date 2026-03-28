import type { MapTheme } from "../../types";

const TAU = Math.PI * 2;

// ── Per-region material color palettes ──────────────────────────────────────
// Each region defines what common materials (cloth, leather, metal, wood, magic)
// look like. Enemy draw functions import these and use them to replace their
// hardcoded grassland colors when rendered on non-grassland maps.

export interface RegionMaterials {
  cloth:   { base: string; dark: string; light: string; trim: string };
  leather: { base: string; dark: string; light: string; strap: string };
  metal:   { base: string; dark: string; bright: string; accent: string };
  wood:    { base: string; dark: string; light: string };
  bone:    { base: string; dark: string; glow: string };
  magic:   { primary: string; secondary: string; glow: string; dark: string };
  rope:    { base: string; dark: string };
  paper:   { base: string; ink: string };
}

const REGION_MATERIALS: Record<MapTheme, RegionMaterials> = {
  grassland: {
    cloth:   { base: "#4a4a6a", dark: "#2a2a4a", light: "#6a6a8a", trim: "#8a7a3a" },
    leather: { base: "#5a3a1a", dark: "#3a2510", light: "#7a5a30", strap: "#4a3018" },
    metal:   { base: "#8a8a9a", dark: "#5a5a6a", bright: "#c0c0d0", accent: "#c0a040" },
    wood:    { base: "#6a4a2a", dark: "#3a2a15", light: "#8a6a3a" },
    bone:    { base: "#d4c8a0", dark: "#a09070", glow: "rgba(220,210,180,0.3)" },
    magic:   { primary: "#7a5aff", secondary: "#aa7aff", glow: "rgba(120,80,255,0.4)", dark: "#3a2a8a" },
    rope:    { base: "#8a7a5a", dark: "#5a4a30" },
    paper:   { base: "#f0e8d0", ink: "#1a1a2a" },
  },
  swamp: {
    cloth:   { base: "#3a4a3a", dark: "#1a2a1a", light: "#5a6a4a", trim: "#5a6a2a" },
    leather: { base: "#3a4a28", dark: "#1a2a10", light: "#5a6a3a", strap: "#2a3a18" },
    metal:   { base: "#5a6a4a", dark: "#2a3a2a", bright: "#7a8a6a", accent: "#6a7a3a" },
    wood:    { base: "#3a3a1a", dark: "#1a2008", light: "#5a5a2a" },
    bone:    { base: "#a0a880", dark: "#707a50", glow: "rgba(140,200,80,0.3)" },
    magic:   { primary: "#4a8a2a", secondary: "#6aaa4a", glow: "rgba(80,160,40,0.4)", dark: "#1a4a0a" },
    rope:    { base: "#5a6a3a", dark: "#3a4a1a" },
    paper:   { base: "#c8d0a8", ink: "#1a2a0a" },
  },
  desert: {
    cloth:   { base: "#b0986a", dark: "#7a6a40", light: "#d8c8a0", trim: "#c0a040" },
    leather: { base: "#7a5a30", dark: "#5a3a18", light: "#a08050", strap: "#6a4a28" },
    metal:   { base: "#a09060", dark: "#6a5a30", bright: "#c8b880", accent: "#d0a030" },
    wood:    { base: "#8a6a3a", dark: "#5a4020", light: "#b09050" },
    bone:    { base: "#e8dcc0", dark: "#b0a080", glow: "rgba(240,220,160,0.3)" },
    magic:   { primary: "#e0a030", secondary: "#ffc850", glow: "rgba(240,180,40,0.4)", dark: "#8a6020" },
    rope:    { base: "#a08a5a", dark: "#7a6a3a" },
    paper:   { base: "#f8f0d8", ink: "#3a2a10" },
  },
  winter: {
    cloth:   { base: "#5a6a7a", dark: "#3a4a5a", light: "#8a9aaa", trim: "#8aa0b8" },
    leather: { base: "#5a5a68", dark: "#3a3a48", light: "#7a7a88", strap: "#4a4a58" },
    metal:   { base: "#9098a8", dark: "#606878", bright: "#c0c8d8", accent: "#7090b0" },
    wood:    { base: "#5a5a5a", dark: "#3a3a3a", light: "#7a7a7a" },
    bone:    { base: "#d8d8e8", dark: "#a0a0b8", glow: "rgba(180,200,240,0.3)" },
    magic:   { primary: "#40a0e0", secondary: "#70c0ff", glow: "rgba(80,180,255,0.4)", dark: "#1a5a8a" },
    rope:    { base: "#7a7a8a", dark: "#5a5a6a" },
    paper:   { base: "#e8e8f0", ink: "#1a1a3a" },
  },
  volcanic: {
    cloth:   { base: "#4a2a1a", dark: "#2a1208", light: "#6a3a28", trim: "#8a3a18" },
    leather: { base: "#3a1a10", dark: "#1a0a08", light: "#5a2a18", strap: "#2a1208" },
    metal:   { base: "#4a3838", dark: "#2a1818", bright: "#6a4a48", accent: "#aa4020" },
    wood:    { base: "#3a2a1a", dark: "#1a1208", light: "#5a3a2a" },
    bone:    { base: "#b0a090", dark: "#807060", glow: "rgba(255,120,40,0.3)" },
    magic:   { primary: "#e04020", secondary: "#ff6030", glow: "rgba(255,80,20,0.5)", dark: "#801808" },
    rope:    { base: "#5a3a2a", dark: "#3a1a10" },
    paper:   { base: "#d0c0a8", ink: "#2a0a08" },
  },
};

export function getRegionMaterials(region: MapTheme): RegionMaterials {
  return REGION_MATERIALS[region];
}

// ── Small ambient decoration helpers ────────────────────────────────────────
// Reusable per-region decorative accents that enemy draw functions can call
// to add region-specific visual flair (moss, sand, frost, embers).
// All use flat fills/strokes only — no gradients or shadow blur.

export function drawSwampAccent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, zoom: number,
): void {
  for (let i = 0; i < 4; i++) {
    const mx = x + (i - 1.5) * w * 0.28 + Math.sin(i * 2.3) * w * 0.06;
    const my = y + Math.sin(i * 1.7) * h * 0.2;
    const alpha = 0.22 + Math.sin(time * 0.8 + i) * 0.06;
    ctx.fillStyle = `rgba(50,80,28,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(mx, my, w * 0.12, h * 0.08, i * 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(60,90,30,0.15)";
  ctx.lineWidth = 0.6 * zoom;
  for (let v = 0; v < 2; v++) {
    const vx = x + (v - 0.5) * w * 0.3;
    const vy = y + h * 0.1;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.quadraticCurveTo(vx + Math.sin(time + v) * w * 0.04, vy + h * 0.25, vx + Math.sin(time * 0.7 + v) * w * 0.06, vy + h * 0.4);
    ctx.stroke();
  }
}

export function drawDesertAccent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, zoom: number,
): void {
  for (let i = 0; i < 5; i++) {
    const sx = x + (i - 2) * w * 0.22 + Math.sin(i * 1.9) * w * 0.05;
    const sy = y + Math.sin(i * 2.1) * h * 0.15;
    ctx.fillStyle = `rgba(200,180,140,${0.12 + Math.sin(time * 0.5 + i) * 0.04})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, w * 0.1 + Math.sin(i) * w * 0.03, h * 0.05, i * 0.3, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(180,160,120,0.12)";
  ctx.lineWidth = 0.5 * zoom;
  for (let s = 0; s < 2; s++) {
    const sx2 = x + (s - 0.5) * w * 0.4;
    ctx.beginPath();
    ctx.moveTo(sx2 - w * 0.08, y + h * 0.15);
    ctx.lineTo(sx2 + w * 0.08, y + h * 0.12);
    ctx.stroke();
  }
}

export function drawFrostAccent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, zoom: number,
): void {
  for (let i = 0; i < 4; i++) {
    const fx = x + (i - 1.5) * w * 0.25 + Math.sin(i * 2.5) * w * 0.04;
    const fy = y + Math.sin(i * 1.8) * h * 0.18;
    const alpha = 0.25 + Math.sin(time * 1.2 + i) * 0.08;
    ctx.fillStyle = `rgba(200,220,255,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(fx, fy - h * 0.06);
    ctx.lineTo(fx + w * 0.04, fy);
    ctx.lineTo(fx, fy + h * 0.06);
    ctx.lineTo(fx - w * 0.04, fy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = `rgba(220,235,255,${0.15 + Math.sin(time * 0.8) * 0.05})`;
  ctx.beginPath();
  ctx.ellipse(x, y - h * 0.15, w * 0.2, h * 0.04, 0, 0, TAU);
  ctx.fill();
}

export function drawEmberAccent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  time: number, zoom: number,
): void {
  for (let i = 0; i < 3; i++) {
    const ex = x + (i - 1) * w * 0.3 + Math.sin(i * 2.1) * w * 0.04;
    const ey = y + Math.sin(i * 1.7) * h * 0.12;
    ctx.strokeStyle = "rgba(20,10,5,0.35)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(ex - w * 0.07, ey);
    ctx.quadraticCurveTo(ex, ey + h * 0.04, ex + w * 0.07, ey - h * 0.02);
    ctx.stroke();
    const glowAlpha = 0.18 + Math.sin(time * 2.5 + i * 1.3) * 0.12;
    ctx.fillStyle = `rgba(255,100,20,${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, w * 0.025, 0, TAU);
    ctx.fill();
  }
  for (let p = 0; p < 2; p++) {
    const pPhase = (time * 1.5 + p * 0.7) % 1;
    const px = x + (p - 0.5) * w * 0.25 + Math.sin(time + p * 3) * w * 0.05;
    const py = y - pPhase * h * 0.4;
    const pAlpha = (1 - pPhase) * 0.35;
    ctx.fillStyle = `rgba(255,${80 + p * 40},20,${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, w * 0.015 * (1 - pPhase * 0.5), 0, TAU);
    ctx.fill();
  }
}

export function drawRegionBodyAccent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  if (region === "grassland") return;
  const w = size * 0.3;
  const h = size * 0.4;
  switch (region) {
    case "swamp":    drawSwampAccent(ctx, x, y, w, h, time, zoom); break;
    case "desert":   drawDesertAccent(ctx, x, y, w, h, time, zoom); break;
    case "winter":   drawFrostAccent(ctx, x, y, w, h, time, zoom); break;
    case "volcanic": drawEmberAccent(ctx, x, y, w, h, time, zoom); break;
  }
}

export function drawRegionWeaponAccent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  region: MapTheme, time: number, zoom: number,
): void {
  if (region === "grassland") return;
  const w = size * 0.15;
  const h = size * 0.25;
  switch (region) {
    case "swamp": {
      ctx.strokeStyle = "rgba(50,80,30,0.25)";
      ctx.lineWidth = 0.5 * zoom;
      for (let v = 0; v < 2; v++) {
        ctx.beginPath();
        ctx.moveTo(x + (v - 0.5) * w * 0.4, y - h * 0.2);
        ctx.quadraticCurveTo(x + Math.sin(time + v) * w * 0.15, y, x + (v - 0.5) * w * 0.3, y + h * 0.2);
        ctx.stroke();
      }
      break;
    }
    case "desert": {
      ctx.fillStyle = "rgba(200,180,140,0.12)";
      ctx.beginPath();
      ctx.ellipse(x, y, w * 0.5, h * 0.15, 0.3, 0, TAU);
      ctx.fill();
      break;
    }
    case "winter": {
      ctx.fillStyle = `rgba(200,220,255,${0.2 + Math.sin(time * 1.5) * 0.06})`;
      ctx.beginPath();
      ctx.ellipse(x, y - h * 0.1, w * 0.3, h * 0.06, 0, 0, TAU);
      ctx.fill();
      break;
    }
    case "volcanic": {
      const glow = 0.15 + Math.sin(time * 3) * 0.1;
      ctx.strokeStyle = `rgba(255,80,20,${glow})`;
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.3, y - h * 0.1);
      ctx.lineTo(x + w * 0.3, y + h * 0.05);
      ctx.stroke();
      break;
    }
  }
}
