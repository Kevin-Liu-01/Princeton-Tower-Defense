import type { MapTheme } from "../../types";
import { createSeededRandom } from "../../utils/seededRandom";
import { hexToRgba } from "../../utils";
import { TERRAIN_PALETTES, type TerrainPalette } from "./terrainConstants";

interface BiomeDetailParams {
  ctx: CanvasRenderingContext2D;
  cssWidth: number;
  cssHeight: number;
  mapSeed: number;
  palette: TerrainPalette;
}

// ---------------------------------------------------------------------------
// Grassland
// ---------------------------------------------------------------------------

function drawGrassTufts(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9001);
  const greens = palette.biomeFeature.slice(0, 4);

  const tufts = 350;
  for (let i = 0; i < tufts; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const bladeCount = 2 + Math.floor(rng() * 4);
    const baseAngle = -Math.PI / 2 + (rng() - 0.5) * 0.6;
    const size = 2 + rng() * 5;

    ctx.globalAlpha = 0.12 + rng() * 0.15;
    for (let b = 0; b < bladeCount; b++) {
      const angle = baseAngle + (rng() - 0.5) * 0.8;
      const len = size * (0.6 + rng() * 0.4);
      ctx.strokeStyle = greens[Math.floor(rng() * greens.length)];
      ctx.lineWidth = 0.5 + rng() * 1;
      ctx.beginPath();
      const bx = x + (b - bladeCount / 2) * 1.5;
      const cpx = bx + Math.cos(angle) * len * 0.7 + (rng() - 0.5) * 2;
      const cpy = y + Math.sin(angle) * len * 0.7;
      ctx.moveTo(bx, y);
      ctx.quadraticCurveTo(cpx, cpy, bx + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function drawWildflowers(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9002);
  const flowerColors = palette.biomeFeature.slice(4);

  const flowers = 90;
  for (let i = 0; i < flowers; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const color = flowerColors[Math.floor(rng() * flowerColors.length)];
    const size = 1 + rng() * 2;

    ctx.globalAlpha = 0.2 + rng() * 0.25;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    if (rng() > 0.5) {
      ctx.strokeStyle = palette.biomeFeature[0];
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.lineTo(x + (rng() - 0.5) * 1.5, y + size + 2 + rng() * 3);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function drawGrassWaves(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9015);

  const waveCount = 40;
  for (let i = 0; i < waveCount; i++) {
    const startX = rng() * cssWidth;
    const startY = rng() * cssHeight;
    const length = 30 + rng() * 60;
    const amplitude = 2 + rng() * 4;

    ctx.globalAlpha = 0.03 + rng() * 0.04;
    ctx.strokeStyle = palette.highlight;
    ctx.lineWidth = 8 + rng() * 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const segments = 4 + Math.floor(rng() * 3);
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const sx = startX + t * length;
      const sy = startY + Math.sin(t * Math.PI * 2) * amplitude;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap = "butt";
}

// ---------------------------------------------------------------------------
// Desert
// ---------------------------------------------------------------------------

function drawSandRipples(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9003);

  const windAngle = 0.3 + (rng() - 0.5) * 0.4;
  const rippleCount = 140;

  for (let i = 0; i < rippleCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const length = 15 + rng() * 50;
    const curve = (rng() - 0.5) * 12;

    ctx.globalAlpha = 0.04 + rng() * 0.07;
    ctx.strokeStyle = rng() > 0.5 ? palette.highlight : palette.biomeFeature[1];
    ctx.lineWidth = 0.5 + rng() * 1.2;

    const dx = Math.cos(windAngle) * length;
    const dy = Math.sin(windAngle) * length;
    ctx.beginPath();
    ctx.moveTo(cx - dx / 2, cy - dy / 2);
    ctx.quadraticCurveTo(cx + curve, cy + curve * 0.5, cx + dx / 2, cy + dy / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawCrackedEarth(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9004);

  const clusterCount = 18;
  for (let c = 0; c < clusterCount; c++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const crackCount = 3 + Math.floor(rng() * 5);

    ctx.globalAlpha = 0.06 + rng() * 0.07;
    ctx.strokeStyle = palette.shadow;
    ctx.lineWidth = 0.5 + rng() * 0.5;

    for (let i = 0; i < crackCount; i++) {
      const angle = (i / crackCount) * Math.PI * 2 + rng() * 0.5;
      const len = 5 + rng() * 18;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      let px = cx;
      let py = cy;
      const segments = 2 + Math.floor(rng() * 3);
      for (let s = 0; s < segments; s++) {
        const segAngle = angle + (rng() - 0.5) * 1.2;
        const segLen = len / segments;
        px += Math.cos(segAngle) * segLen;
        py += Math.sin(segAngle) * segLen;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function drawScatteredStones(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9005);

  const stoneCount = 50;
  for (let i = 0; i < stoneCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const size = 1 + rng() * 3.5;

    ctx.globalAlpha = 0.08 + rng() * 0.12;
    ctx.fillStyle = palette.biomeFeature[3 + Math.floor(rng() * 2)];
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * (0.5 + rng() * 0.3), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawDuneShading(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9016);

  const duneCount = 20;
  for (let i = 0; i < duneCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const rx = 30 + rng() * 80;
    const ry = rx * (0.15 + rng() * 0.15);

    const grad = ctx.createRadialGradient(cx, cy - ry, 0, cx, cy, rx);
    grad.addColorStop(0, hexToRgba(palette.highlight, 0.08));
    grad.addColorStop(0.4, hexToRgba(palette.highlight, 0.03));
    grad.addColorStop(0.7, hexToRgba(palette.shadow, 0.04));
    grad.addColorStop(1, hexToRgba(palette.shadow, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0.2 + rng() * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Winter
// ---------------------------------------------------------------------------

function drawSnowDrifts(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9006);

  const driftCount = 45;
  for (let i = 0; i < driftCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const rx = 12 + rng() * 35;
    const ry = rx * (0.25 + rng() * 0.3);

    const grad = ctx.createRadialGradient(cx, cy - ry * 0.3, 0, cx, cy, rx);
    grad.addColorStop(0, hexToRgba(palette.biomeFeature[1], 0.16));
    grad.addColorStop(0.5, hexToRgba(palette.biomeFeature[0], 0.08));
    grad.addColorStop(1, hexToRgba(palette.biomeFeature[0], 0));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rng() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIcePatches(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9007);

  const patchCount = 22;
  for (let i = 0; i < patchCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const r = 5 + rng() * 14;

    ctx.globalAlpha = 0.06 + rng() * 0.08;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, palette.biomeFeature[3]);
    grad.addColorStop(0.7, hexToRgba(palette.biomeFeature[2], 0.5));
    grad.addColorStop(1, hexToRgba(palette.biomeFeature[2], 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * (0.5 + rng() * 0.3), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFrostSparkles(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9008);

  ctx.fillStyle = palette.biomeFeature[1];
  const sparkleCount = 180;
  for (let i = 0; i < sparkleCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const size = 0.5 + rng() * 1.5;
    ctx.globalAlpha = 0.12 + rng() * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawExposedRock(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9017);

  const rockCount = 15;
  for (let i = 0; i < rockCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const rx = 5 + rng() * 15;
    const ry = rx * (0.5 + rng() * 0.3);

    ctx.globalAlpha = 0.06 + rng() * 0.06;
    ctx.fillStyle = palette.biomeFeature[4];
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Volcanic
// ---------------------------------------------------------------------------

function drawLavaCracks(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9009);

  const networkCount = 10;
  for (let n = 0; n < networkCount; n++) {
    let px = rng() * cssWidth;
    let py = rng() * cssHeight;
    const segments = 5 + Math.floor(rng() * 12);

    for (let s = 0; s < segments; s++) {
      const angle = rng() * Math.PI * 2;
      const len = 5 + rng() * 18;
      const nx = px + Math.cos(angle) * len;
      const ny = py + Math.sin(angle) * len;

      ctx.globalAlpha = 0.08 + rng() * 0.12;
      ctx.strokeStyle = palette.biomeFeature[0];
      ctx.lineWidth = 2 + rng() * 2.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      ctx.globalAlpha = 0.15 + rng() * 0.18;
      ctx.strokeStyle = palette.biomeFeature[3];
      ctx.lineWidth = 0.5 + rng() * 0.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      if (rng() > 0.55) {
        const bAngle = angle + (rng() - 0.5) * 2;
        const bLen = 3 + rng() * 10;
        ctx.globalAlpha = 0.06 + rng() * 0.08;
        ctx.strokeStyle = palette.biomeFeature[1];
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(
          nx + Math.cos(bAngle) * bLen,
          ny + Math.sin(bAngle) * bLen,
        );
        ctx.stroke();
      }

      px = nx;
      py = ny;
    }
  }
  ctx.globalAlpha = 1;
}

function drawEmberGlow(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9010);

  const emberCount = 30;
  for (let i = 0; i < emberCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const r = 3 + rng() * 10;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, hexToRgba(palette.biomeFeature[0], 0.14));
    grad.addColorStop(0.5, hexToRgba(palette.biomeFeature[1], 0.06));
    grad.addColorStop(1, hexToRgba(palette.biomeFeature[0], 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAshDeposits(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9018);

  const ashCount = 35;
  for (let i = 0; i < ashCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const rx = 6 + rng() * 20;
    const ry = rx * (0.4 + rng() * 0.3);

    ctx.globalAlpha = 0.04 + rng() * 0.06;
    ctx.fillStyle = palette.biomeFeature[5];
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Swamp
// ---------------------------------------------------------------------------

function drawMurkyPuddles(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9011);

  const puddleCount = 28;
  for (let i = 0; i < puddleCount; i++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const rx = 6 + rng() * 20;
    const ry = rx * (0.4 + rng() * 0.3);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, hexToRgba(palette.biomeFeature[1], 0.16));
    grad.addColorStop(0.6, hexToRgba(palette.biomeFeature[0], 0.09));
    grad.addColorStop(1, hexToRgba(palette.biomeFeature[0], 0));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.06;
    ctx.fillStyle = palette.highlight;
    ctx.beginPath();
    ctx.ellipse(
      cx - rx * 0.2, cy - ry * 0.2,
      rx * 0.3, ry * 0.3,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawAlgaeStreaks(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9012);

  const streakCount = 70;
  ctx.lineCap = "round";
  for (let i = 0; i < streakCount; i++) {
    const x = rng() * cssWidth;
    const y = rng() * cssHeight;
    const len = 8 + rng() * 25;
    const angle = rng() * Math.PI * 2;

    ctx.globalAlpha = 0.06 + rng() * 0.09;
    ctx.strokeStyle = palette.biomeFeature[2];
    ctx.lineWidth = 1 + rng() * 2.5;

    const midX = x + Math.cos(angle) * len * 0.5 + (rng() - 0.5) * 6;
    const midY = y + Math.sin(angle) * len * 0.5 + (rng() - 0.5) * 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      midX, midY,
      x + Math.cos(angle) * len,
      y + Math.sin(angle) * len,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap = "butt";
}

function drawSwampBubbles(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9013);

  const clusterCount = 25;
  for (let c = 0; c < clusterCount; c++) {
    const cx = rng() * cssWidth;
    const cy = rng() * cssHeight;
    const bubbles = 2 + Math.floor(rng() * 5);

    for (let b = 0; b < bubbles; b++) {
      const bx = cx + (rng() - 0.5) * 10;
      const by = cy + (rng() - 0.5) * 10;
      const r = 0.5 + rng() * 2.5;

      ctx.globalAlpha = 0.08 + rng() * 0.12;
      ctx.strokeStyle = palette.biomeFeature[3];
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.06;
      ctx.fillStyle = palette.highlight;
      ctx.beginPath();
      ctx.arc(bx - r * 0.3, by - r * 0.3, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawRootPatterns(p: BiomeDetailParams): void {
  const { ctx, cssWidth, cssHeight, mapSeed, palette } = p;
  const rng = createSeededRandom(mapSeed + 9019);

  const rootCount = 12;
  for (let r = 0; r < rootCount; r++) {
    let px = rng() * cssWidth;
    let py = rng() * cssHeight;
    const segments = 4 + Math.floor(rng() * 6);

    ctx.globalAlpha = 0.04 + rng() * 0.05;
    ctx.strokeStyle = palette.soilSpots[Math.floor(rng() * palette.soilSpots.length)];
    ctx.lineWidth = 0.5 + rng() * 1.5;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < segments; s++) {
      const angle = rng() * Math.PI * 2;
      const len = 4 + rng() * 12;
      px += Math.cos(angle) * len;
      py += Math.sin(angle) * len;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap = "butt";
}

// ---------------------------------------------------------------------------
// Public dispatcher
// ---------------------------------------------------------------------------

export function drawBiomeDetails(
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  themeName: MapTheme,
  mapSeed: number,
): void {
  const palette = TERRAIN_PALETTES[themeName];
  const params: BiomeDetailParams = { ctx, cssWidth, cssHeight, mapSeed, palette };

  switch (themeName) {
    case "grassland":
      drawGrassTufts(params);
      drawWildflowers(params);
      drawGrassWaves(params);
      break;
    case "desert":
      drawSandRipples(params);
      drawCrackedEarth(params);
      drawScatteredStones(params);
      drawDuneShading(params);
      break;
    case "winter":
      drawSnowDrifts(params);
      drawIcePatches(params);
      drawFrostSparkles(params);
      drawExposedRock(params);
      break;
    case "volcanic":
      drawLavaCracks(params);
      drawEmberGlow(params);
      drawAshDeposits(params);
      break;
    case "swamp":
      drawMurkyPuddles(params);
      drawAlgaeStreaks(params);
      drawSwampBubbles(params);
      drawRootPatterns(params);
      break;
  }
}
