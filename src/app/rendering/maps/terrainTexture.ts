import type { MapTheme } from "../../types";
import { createSeededRandom } from "../../utils/seededRandom";
import { hexToRgba } from "../../utils";

// ============================================================================
// TERRAIN TEXTURE – Multi-pass procedural ground detail
// ============================================================================

export interface TerrainTextureParams {
  ctx: CanvasRenderingContext2D;
  cssWidth: number;
  cssHeight: number;
  themeName: MapTheme;
  mapSeed: number;
}

const THEME_PALETTES: Record<
  MapTheme,
  {
    basePatches: string[];
    soilSpots: string[];
    mossCover: string[];
    highlight: string;
    shadow: string;
  }
> = {
  grassland: {
    basePatches: ["#2a4420", "#34522a", "#243d1a", "#3a5c2e", "#1e3516"],
    soilSpots: ["#3a2e1a", "#4a3c24", "#2e2210", "#564832"],
    mossCover: ["#3e6828", "#4a7a30", "#2e5a1e", "#56883a"],
    highlight: "#5a9a3a",
    shadow: "#0e1a08",
  },
  swamp: {
    basePatches: ["#162a14", "#1e3418", "#10220e", "#243c1e", "#0c1a0a"],
    soilSpots: ["#1a2a18", "#22341e", "#0e1a0c", "#2a3e22"],
    mossCover: ["#1a4a1a", "#225a22", "#143e14", "#2a6428"],
    highlight: "#3a8a3a",
    shadow: "#040a04",
  },
  desert: {
    basePatches: ["#8a7454", "#9a845e", "#7a6444", "#a89468", "#6a543a"],
    soilSpots: ["#6a5438", "#7a6448", "#5a442e", "#8a7452"],
    mossCover: ["#5a6a3a", "#4a5a2e", "#3a4a22", "#6a7a44"],
    highlight: "#c8b488",
    shadow: "#3a2a18",
  },
  winter: {
    basePatches: ["#4a5a6a", "#546474", "#3e4e5e", "#5e6e7e", "#344454"],
    soilSpots: ["#5a6878", "#4a5868", "#3a4858", "#6a7888"],
    mossCover: ["#3a5a4a", "#2a4a3a", "#1a3a2a", "#4a6a5a"],
    highlight: "#8a9aaa",
    shadow: "#1a2a3a",
  },
  volcanic: {
    basePatches: ["#2a1414", "#341a1a", "#1e0e0e", "#3e2020", "#180a0a"],
    soilSpots: ["#3a2020", "#442828", "#2e1616", "#4a3030"],
    mossCover: ["#3a2a1a", "#2a1a0a", "#4a3a2a", "#1a1008"],
    highlight: "#6a3a2a",
    shadow: "#0a0404",
  },
};

function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const sfx = fx * fx * (3 - 2 * fx);
  const sfy = fy * fy * (3 - 2 * fy);

  const hash = (px: number, py: number) => {
    let h = (px * 374761393 + py * 668265263 + seed * 1013904223) | 0;
    h = ((h ^ (h >> 13)) * 1274126177) | 0;
    return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
  };

  const v00 = hash(ix, iy);
  const v10 = hash(ix + 1, iy);
  const v01 = hash(ix, iy + 1);
  const v11 = hash(ix + 1, iy + 1);

  return (
    v00 * (1 - sfx) * (1 - sfy) +
    v10 * sfx * (1 - sfy) +
    v01 * (1 - sfx) * sfy +
    v11 * sfx * sfy
  );
}

function fbmNoise(
  x: number,
  y: number,
  seed: number,
  octaves: number,
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let totalAmp = 0;
  for (let i = 0; i < octaves; i++) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 31) * amplitude;
    totalAmp += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / totalAmp;
}

function drawLargeTerrainPatches(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = THEME_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 7777);

  const patchCount = 35;
  for (let i = 0; i < patchCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const rx = 40 + rng() * 120;
    const ry = rx * (0.3 + rng() * 0.4);
    const rotation = rng() * Math.PI;
    const color = palette.basePatches[Math.floor(rng() * palette.basePatches.length)];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.08 + rng() * 0.10;

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0, color);
    grad.addColorStop(0.6, hexToRgba(color, 0.5));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawNoiseOverlay(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = THEME_PALETTES[themeName];

  const step = 16;
  const cols = Math.ceil(cssWidth / step);
  const rows = Math.ceil(cssHeight / step);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * step;
      const y = row * step;

      const n = fbmNoise(col * 0.12, row * 0.12, mapSeed, 4);

      if (n > 0.55) {
        const alpha = (n - 0.55) * 0.35;
        ctx.globalAlpha = Math.min(alpha, 0.12);
        ctx.fillStyle = palette.highlight;
        ctx.fillRect(x, y, step, step);
      } else if (n < 0.4) {
        const alpha = (0.4 - n) * 0.4;
        ctx.globalAlpha = Math.min(alpha, 0.10);
        ctx.fillStyle = palette.shadow;
        ctx.fillRect(x, y, step, step);
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawSoilVariation(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = THEME_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 5555);

  const spotCount = 80;
  for (let i = 0; i < spotCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const size = 4 + rng() * 14;
    const color = palette.soilSpots[Math.floor(rng() * palette.soilSpots.length)];

    ctx.globalAlpha = 0.06 + rng() * 0.08;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * (0.4 + rng() * 0.3), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMossAndGround(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = THEME_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 3333);

  const clumpCount = 50;
  for (let i = 0; i < clumpCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const r = 8 + rng() * 25;
    const color = palette.mossCover[Math.floor(rng() * palette.mossCover.length)];

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, hexToRgba(color, 0.15));
    grad.addColorStop(0.5, hexToRgba(color, 0.06));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * (0.5 + rng() * 0.3), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMicroDetail(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = THEME_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 1111);

  ctx.globalAlpha = 0.05;
  const speckCount = 200;
  for (let i = 0; i < speckCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const s = 1 + rng() * 3;
    ctx.fillStyle = rng() > 0.5 ? palette.highlight : palette.shadow;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSubtleVignette(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName } = params;
  const palette = THEME_PALETTES[themeName];

  const vig = ctx.createRadialGradient(
    cssWidth / 2,
    cssHeight / 2,
    Math.min(cssWidth, cssHeight) * 0.15,
    cssWidth / 2,
    cssHeight / 2,
    Math.max(cssWidth, cssHeight) * 0.7,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(0.5, hexToRgba(palette.shadow, 0.04));
  vig.addColorStop(1, hexToRgba(palette.shadow, 0.15));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
}

export function renderTerrainTexture(params: TerrainTextureParams): void {
  drawLargeTerrainPatches(params);
  drawNoiseOverlay(params);
  drawSoilVariation(params);
  drawMossAndGround(params);
  drawMicroDetail(params);
  drawSubtleVignette(params);
}
