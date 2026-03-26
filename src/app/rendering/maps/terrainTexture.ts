import type { MapTheme } from "../../types";
import { createSeededRandom } from "../../utils/seededRandom";
import { hexToRgba } from "../../utils";
import { TERRAIN_PALETTES } from "./terrainConstants";
import { fbmNoise, domainWarpedNoise, ridgedNoise } from "./terrainNoise";
import { drawBiomeDetails } from "./terrainBiomeDetails";

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

// ---------------------------------------------------------------------------
// Pass 1 – Domain-warped color field
// Produces large-scale organic color variation across the whole terrain.
// ---------------------------------------------------------------------------

function drawDomainWarpedField(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];

  const step = 10;
  const cols = Math.ceil(cssWidth / step);
  const rows = Math.ceil(cssHeight / step);
  const colorCount = palette.basePatches.length;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const n = domainWarpedNoise(
        col * 0.08, row * 0.08, mapSeed + 42, 4, 1.8,
      );
      const colorIdx = Math.floor(n * colorCount) % colorCount;
      const color = palette.basePatches[Math.abs(colorIdx)];

      ctx.globalAlpha = 0.06 + n * 0.09;
      ctx.fillStyle = color;
      ctx.fillRect(col * step, row * step, step, step);
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Pass 2 – Large terrain patches (enhanced)
// Bigger, more visible organic color blobs across the terrain.
// ---------------------------------------------------------------------------

function drawLargeTerrainPatches(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 7777);

  const patchCount = 50;
  for (let i = 0; i < patchCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const rx = 50 + rng() * 150;
    const ry = rx * (0.25 + rng() * 0.45);
    const rotation = rng() * Math.PI;
    const color =
      palette.basePatches[Math.floor(rng() * palette.basePatches.length)];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = 0.10 + rng() * 0.12;

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0, color);
    grad.addColorStop(0.5, hexToRgba(color, 0.6));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Pass 3 – Multi-color noise overlay (enhanced)
// FBM noise at a fine grid with smooth color blending rather than
// binary highlight/shadow.
// ---------------------------------------------------------------------------

function drawNoiseOverlay(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];

  const step = 12;
  const cols = Math.ceil(cssWidth / step);
  const rows = Math.ceil(cssHeight / step);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * step;
      const y = row * step;
      const n = fbmNoise(col * 0.14, row * 0.14, mapSeed, 5);

      if (n > 0.58) {
        const alpha = (n - 0.58) * 0.5;
        ctx.globalAlpha = Math.min(alpha, 0.14);
        ctx.fillStyle = palette.highlight;
        ctx.fillRect(x, y, step, step);
      } else if (n > 0.48) {
        const color =
          palette.mossCover[Math.floor(((n - 0.48) * 10) % palette.mossCover.length)];
        ctx.globalAlpha = 0.03 + (n - 0.48) * 0.2;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, step, step);
      } else if (n < 0.35) {
        const alpha = (0.35 - n) * 0.5;
        ctx.globalAlpha = Math.min(alpha, 0.12);
        ctx.fillStyle = palette.shadow;
        ctx.fillRect(x, y, step, step);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Pass 4 – Soil variation (enhanced)
// More spots with better size distribution.
// ---------------------------------------------------------------------------

function drawSoilVariation(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 5555);

  const spotCount = 120;
  for (let i = 0; i < spotCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const size = 4 + rng() * 16;
    const color =
      palette.soilSpots[Math.floor(rng() * palette.soilSpots.length)];

    ctx.globalAlpha = 0.07 + rng() * 0.09;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(
      x, y,
      size, size * (0.35 + rng() * 0.35),
      rng() * Math.PI, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Pass 5 – Moss and ground cover (enhanced)
// Larger organic clumps with softer edges.
// ---------------------------------------------------------------------------

function drawMossAndGround(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 3333);

  const clumpCount = 70;
  for (let i = 0; i < clumpCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const r = 8 + rng() * 30;
    const color =
      palette.mossCover[Math.floor(rng() * palette.mossCover.length)];

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, hexToRgba(color, 0.16));
    grad.addColorStop(0.4, hexToRgba(color, 0.08));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      cx, cy,
      r, r * (0.4 + rng() * 0.35),
      rng() * Math.PI, 0, Math.PI * 2,
    );
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Pass 6 – Terrain grain
// Fine directional texture that gives the ground a material feel.
// ---------------------------------------------------------------------------

function drawTerrainGrain(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 4444);

  const grainCount = 600;
  for (let i = 0; i < grainCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const angle = rng() * Math.PI;
    const len = 2 + rng() * 6;
    const color = palette.grain[Math.floor(rng() * palette.grain.length)];

    ctx.globalAlpha = 0.03 + rng() * 0.05;
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5 + rng() * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Pass 7 – Terrain contours
// Subtle lines following noise contour levels suggesting slight elevation.
// ---------------------------------------------------------------------------

function drawTerrainContours(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];

  const step = 6;
  const cols = Math.ceil(cssWidth / step);
  const rows = Math.ceil(cssHeight / step);
  const contourLevels = [0.3, 0.5, 0.7];

  ctx.strokeStyle = hexToRgba(palette.contour, 0.5);
  ctx.lineWidth = 0.5;

  for (const level of contourLevels) {
    ctx.globalAlpha = 0.025;
    ctx.beginPath();
    for (let row = 1; row < rows - 1; row++) {
      for (let col = 1; col < cols - 1; col++) {
        const n = ridgedNoise(col * 0.06, row * 0.06, mapSeed + 300, 3);
        if (Math.abs(n - level) < 0.02) {
          ctx.moveTo(col * step, row * step);
          ctx.lineTo(col * step + step, row * step);
        }
      }
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Pass 8 – Micro detail (enhanced)
// More specks with slightly higher visibility.
// ---------------------------------------------------------------------------

function drawMicroDetail(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName, mapSeed } = params;
  const palette = TERRAIN_PALETTES[themeName];
  const rng = createSeededRandom(mapSeed + 1111);

  const speckCount = 400;
  for (let i = 0; i < speckCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const s = 0.5 + rng() * 3;
    ctx.globalAlpha = 0.04 + rng() * 0.06;
    ctx.fillStyle = rng() > 0.5 ? palette.highlight : palette.shadow;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Pass 9 – Atmospheric vignette (enhanced)
// Directional light impression plus edge darkening.
// ---------------------------------------------------------------------------

function drawAtmosphere(params: TerrainTextureParams): void {
  const { ctx, cssWidth, cssHeight, themeName } = params;
  const palette = TERRAIN_PALETTES[themeName];

  const vig = ctx.createRadialGradient(
    cssWidth * 0.4,
    cssHeight * 0.35,
    Math.min(cssWidth, cssHeight) * 0.12,
    cssWidth * 0.5,
    cssHeight * 0.5,
    Math.max(cssWidth, cssHeight) * 0.65,
  );
  vig.addColorStop(0, hexToRgba(palette.highlight, 0.03));
  vig.addColorStop(0.3, "rgba(0,0,0,0)");
  vig.addColorStop(0.6, hexToRgba(palette.shadow, 0.04));
  vig.addColorStop(1, hexToRgba(palette.shadow, 0.16));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function renderTerrainTexture(params: TerrainTextureParams): void {
  drawDomainWarpedField(params);
  drawLargeTerrainPatches(params);
  drawNoiseOverlay(params);
  drawSoilVariation(params);
  drawMossAndGround(params);
  drawTerrainGrain(params);
  drawBiomeDetails(
    params.ctx,
    params.cssWidth,
    params.cssHeight,
    params.themeName,
    params.mapSeed,
  );
  drawTerrainContours(params);
  drawMicroDetail(params);
  drawAtmosphere(params);
}
