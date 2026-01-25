// Princeton Tower Defense - Fog Effects Module
// Renders beautiful region-themed fog clouds at path endpoints

import type { Position } from "../../types";

// ============================================================================
// FOG PALETTES BY THEME
// ============================================================================

interface FogPalette {
  base: number[];
  mid: number[];
  light: number[];
  accent: number[];
  glow?: number[];
}

const FOG_PALETTES: Record<string, FogPalette> = {
  grassland: {
    base: [45, 38, 28],
    mid: [65, 55, 40],
    light: [85, 72, 55],
    accent: [75, 62, 45],
    glow: [100, 85, 65],
  },
  desert: {
    base: [60, 45, 30],
    mid: [85, 65, 45],
    light: [100, 80, 55],
    accent: [120, 90, 50],
    glow: [140, 110, 70],
  },
  winter: {
    base: [35, 45, 55],
    mid: [50, 65, 80],
    light: [70, 85, 100],
    accent: [55, 75, 95],
    glow: [90, 110, 130],
  },
  volcanic: {
    base: [20, 10, 10],
    mid: [40, 20, 15],
    light: [60, 35, 25],
    accent: [180, 60, 20],
    glow: [200, 100, 40],
  },
  swamp: {
    base: [15, 25, 15],
    mid: [25, 45, 25],
    light: [40, 60, 35],
    accent: [50, 90, 50],
    glow: [70, 120, 60],
  },
};

// ============================================================================
// MAIN FOG RENDERING
// ============================================================================

export function renderRoadEndFog(
  ctx: CanvasRenderingContext2D,
  endPos: Position,
  towardsPos: Position,
  size: number,
  cameraZoom: number,
  theme: string = "grassland"
): void {
  const time = Date.now() / 1000;
  const slowTime = time * 0.25;

  // Calculate direction from visible road towards the fog-obscured end
  const dx = endPos.x - towardsPos.x;
  const dy = endPos.y - towardsPos.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const dirX = len > 0 ? dx / len : 1;
  const dirY = len > 0 ? dy / len : 0;

  const palette = FOG_PALETTES[theme] || FOG_PALETTES.grassland;

  ctx.save();

  // ============================
  // LAYER 1: Soft mist base - transparent atmospheric fog
  // ============================
  for (let layer = 0; layer < 6; layer++) {
    const layerDist = (layer - 1) * size * 0.22;
    const baseX = towardsPos.x + dirX * layerDist;
    const baseY = towardsPos.y + dirY * layerDist * 0.5;
    const animX = Math.sin(slowTime * 0.8 + layer * 0.7) * 5 * cameraZoom;
    const animY = Math.cos(slowTime * 0.5 + layer * 0.5) * 2.5 * cameraZoom;
    const layerSize = size * (1.05 + layer * 0.12) * cameraZoom;
    const layerAlpha = Math.min(0.55, 0.12 + layer * 0.07);

    const shadowGrad = ctx.createRadialGradient(
      baseX + animX, baseY + animY, 0,
      baseX + animX, baseY + animY, layerSize
    );
    shadowGrad.addColorStop(0, `rgba(${palette.base[0]}, ${palette.base[1]}, ${palette.base[2]}, ${layerAlpha})`);
    shadowGrad.addColorStop(0.35, `rgba(${palette.base[0]}, ${palette.base[1]}, ${palette.base[2]}, ${layerAlpha * 0.7})`);
    shadowGrad.addColorStop(0.6, `rgba(${palette.mid[0]}, ${palette.mid[1]}, ${palette.mid[2]}, ${layerAlpha * 0.4})`);
    shadowGrad.addColorStop(0.85, `rgba(${palette.mid[0]}, ${palette.mid[1]}, ${palette.mid[2]}, ${layerAlpha * 0.15})`);
    shadowGrad.addColorStop(1, `rgba(${palette.mid[0]}, ${palette.mid[1]}, ${palette.mid[2]}, 0)`);

    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(baseX + animX, baseY + animY, layerSize, layerSize * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============================
  // LAYER 2: Soft cloud puffs - billowing transparent shapes
  // ============================
  const puffCount = 12;
  for (let i = 0; i < puffCount; i++) {
    const phase = (i / puffCount) * Math.PI * 2;
    const radiusVariation = 0.35 + Math.sin(slowTime * 0.6 + i * 1.3) * 0.18;
    const dist = size * radiusVariation;
    const spiralAngle = phase + slowTime * 0.12 + Math.sin(slowTime * 0.3 + i) * 0.25;

    const puffX = endPos.x + Math.cos(spiralAngle) * dist * 0.65 * cameraZoom;
    const puffY = endPos.y + Math.sin(spiralAngle) * dist * 0.32 * cameraZoom;
    const puffSize = (size * (0.28 + Math.sin(slowTime + i * 0.8) * 0.1)) * cameraZoom;
    const puffAlpha = 0.28 + Math.sin(slowTime * 0.7 + i * 1.1) * 0.1;

    const puffGrad = ctx.createRadialGradient(puffX, puffY, 0, puffX, puffY, puffSize);
    puffGrad.addColorStop(0, `rgba(${palette.mid[0]}, ${palette.mid[1]}, ${palette.mid[2]}, ${puffAlpha})`);
    puffGrad.addColorStop(0.4, `rgba(${palette.mid[0]}, ${palette.mid[1]}, ${palette.mid[2]}, ${puffAlpha * 0.6})`);
    puffGrad.addColorStop(0.75, `rgba(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]}, ${puffAlpha * 0.2})`);
    puffGrad.addColorStop(1, `rgba(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]}, 0)`);

    ctx.fillStyle = puffGrad;
    ctx.beginPath();
    // Create organic blob shape
    const blobPoints = 8;
    for (let j = 0; j <= blobPoints; j++) {
      const blobAngle = (j / blobPoints) * Math.PI * 2;
      const blobNoise = 1 + Math.sin(blobAngle * 3 + i + slowTime * 0.5) * 0.15;
      const blobR = puffSize * blobNoise;
      const bx = puffX + Math.cos(blobAngle) * blobR;
      const by = puffY + Math.sin(blobAngle) * blobR * 0.5;
      if (j === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ============================
  // LAYER 3: Wispy tendrils - soft ethereal wisps
  // ============================
  for (let i = 0; i < 6; i++) {
    const tendrilPhase = (i / 6) * Math.PI * 2 + slowTime * 0.15;
    const tendrilDist = size * (0.25 + i * 0.08);
    const startX = endPos.x + Math.cos(tendrilPhase) * tendrilDist * 0.35 * cameraZoom;
    const startY = endPos.y + Math.sin(tendrilPhase) * tendrilDist * 0.18 * cameraZoom;

    const tendrilGrad = ctx.createRadialGradient(
      startX, startY, 0,
      startX, startY, size * 0.35 * cameraZoom
    );
    const tendrilAlpha = 0.15 + Math.sin(slowTime + i) * 0.05;
    tendrilGrad.addColorStop(0, `rgba(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]}, ${tendrilAlpha})`);
    tendrilGrad.addColorStop(0.5, `rgba(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]}, ${tendrilAlpha * 0.3})`);
    tendrilGrad.addColorStop(1, `rgba(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]}, 0)`);

    ctx.fillStyle = tendrilGrad;
    ctx.beginPath();
    // Elongated wisp shape
    const wispAngle = tendrilPhase + Math.PI * 0.5;
    const wispLength = size * 0.45 * cameraZoom;
    const wispWidth = size * 0.12 * cameraZoom;
    ctx.ellipse(startX, startY, wispLength, wispWidth, wispAngle, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============================
  // LAYER 4: Region-specific particles and effects
  // ============================
  renderThemeSpecificFogEffects(ctx, endPos, size, cameraZoom, theme, time);

  // ============================
  // LAYER 5: Soft highlight rim - subtle edge definition
  // ============================
  const rimGrad = ctx.createRadialGradient(
    endPos.x, endPos.y - size * 0.1 * cameraZoom, size * 0.2 * cameraZoom,
    endPos.x, endPos.y, size * 0.9 * cameraZoom
  );
  const rimAlpha = 0.05 + Math.sin(slowTime * 0.8) * 0.02;
  const glow = palette.glow || palette.light;
  rimGrad.addColorStop(0, `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, ${rimAlpha})`);
  rimGrad.addColorStop(0.5, `rgba(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]}, ${rimAlpha * 0.25})`);
  rimGrad.addColorStop(1, `rgba(${palette.light[0]}, ${palette.light[1]}, ${palette.light[2]}, 0)`);
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(endPos.x, endPos.y, size * 0.9 * cameraZoom, size * 0.4 * cameraZoom, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// THEME-SPECIFIC FOG EFFECTS
// ============================================================================

function renderThemeSpecificFogEffects(
  ctx: CanvasRenderingContext2D,
  endPos: Position,
  size: number,
  cameraZoom: number,
  theme: string,
  time: number
): void {
  if (theme === "grassland") {
    renderGrasslandFogEffects(ctx, endPos, size, cameraZoom, time);
  } else if (theme === "desert") {
    renderDesertFogEffects(ctx, endPos, size, cameraZoom, time);
  } else if (theme === "winter") {
    renderWinterFogEffects(ctx, endPos, size, cameraZoom, time);
  } else if (theme === "volcanic") {
    renderVolcanicFogEffects(ctx, endPos, size, cameraZoom, time);
  } else if (theme === "swamp") {
    renderSwampFogEffects(ctx, endPos, size, cameraZoom, time);
  }
}

function renderGrasslandFogEffects(
  ctx: CanvasRenderingContext2D,
  endPos: Position,
  size: number,
  cameraZoom: number,
  time: number
): void {
  // Dark floating dust/debris
  for (let i = 0; i < 5; i++) {
    const leafTime = time * 0.4 + i * 2.1;
    const leafX = endPos.x + Math.sin(leafTime * 0.7 + i) * size * 0.5 * cameraZoom;
    const leafY = endPos.y + Math.cos(leafTime * 0.4 + i * 1.5) * size * 0.22 * cameraZoom;
    const leafSize = (2.5 + Math.sin(leafTime) * 1.2) * cameraZoom;
    const leafAlpha = 0.25 + Math.sin(leafTime * 0.8) * 0.1;
    const leafRotation = leafTime * 0.6;

    ctx.save();
    ctx.translate(leafX, leafY);
    ctx.rotate(leafRotation);
    ctx.fillStyle = `rgba(${60 + i * 5}, ${50 + i * 4}, ${35 + i * 3}, ${leafAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, leafSize * 1.5, leafSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Dark dust specks
  for (let i = 0; i < 4; i++) {
    const sparkTime = time + i * 1.7;
    const sparkX = endPos.x + Math.sin(sparkTime * 0.4 + i * 2) * size * 0.45 * cameraZoom;
    const sparkY = endPos.y + Math.cos(sparkTime * 0.3 + i) * size * 0.18 * cameraZoom;
    const sparkAlpha = Math.max(0, Math.sin(sparkTime * 2 + i * 3) * 0.3);
    if (sparkAlpha > 0.05) {
      ctx.fillStyle = `rgba(90, 75, 55, ${sparkAlpha})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 1.5 * cameraZoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderDesertFogEffects(
  ctx: CanvasRenderingContext2D,
  endPos: Position,
  size: number,
  cameraZoom: number,
  time: number
): void {
  // Soft swirling dust particles
  for (let i = 0; i < 10; i++) {
    const sandTime = time * 0.7 + i * 0.9;
    const sandAngle = sandTime * 0.25 + i * 0.5;
    const sandDist = size * (0.18 + Math.sin(sandTime * 0.5) * 0.25);
    const sandX = endPos.x + Math.cos(sandAngle) * sandDist * cameraZoom;
    const sandY = endPos.y + Math.sin(sandAngle) * sandDist * 0.4 * cameraZoom;
    const sandSize = (1.5 + Math.random() * 1.5) * cameraZoom;
    const sandAlpha = 0.2 + Math.sin(sandTime) * 0.1;

    ctx.fillStyle = `rgba(${160 + i * 3}, ${130 + i * 3}, ${90}, ${sandAlpha})`;
    ctx.beginPath();
    ctx.arc(sandX, sandY, sandSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Soft warm undertone glow
  const shimmerGrad = ctx.createRadialGradient(endPos.x, endPos.y, 0, endPos.x, endPos.y, size * 0.7 * cameraZoom);
  const shimmerPulse = 0.04 + Math.sin(time * 2) * 0.02;
  shimmerGrad.addColorStop(0, `rgba(180, 150, 100, ${shimmerPulse})`);
  shimmerGrad.addColorStop(0.5, `rgba(160, 130, 90, ${shimmerPulse * 0.5})`);
  shimmerGrad.addColorStop(1, `rgba(140, 110, 80, 0)`);
  ctx.fillStyle = shimmerGrad;
  ctx.beginPath();
  ctx.ellipse(endPos.x, endPos.y, size * 0.7 * cameraZoom, size * 0.3 * cameraZoom, 0, 0, Math.PI * 2);
  ctx.fill();
}

function renderWinterFogEffects(
  ctx: CanvasRenderingContext2D,
  endPos: Position,
  size: number,
  cameraZoom: number,
  time: number
): void {
  // Soft snowflakes
  for (let i = 0; i < 8; i++) {
    const snowTime = time * 0.25 + i * 1.2;
    const snowDrift = Math.sin(snowTime * 0.5 + i) * size * 0.35;
    const snowFall = ((snowTime * 18 + i * 30) % (size * 1.1)) - size * 0.35;
    const snowX = endPos.x + snowDrift * cameraZoom;
    const snowY = endPos.y + snowFall * 0.28 * cameraZoom;
    const snowSize = (1.8 + Math.sin(i) * 1.2) * cameraZoom;
    const snowAlpha = 0.25 + Math.sin(snowTime) * 0.1;

    ctx.fillStyle = `rgba(180, 200, 220, ${snowAlpha})`;
    ctx.beginPath();
    ctx.arc(snowX, snowY, snowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Soft sparkle
    if (Math.sin(snowTime * 3 + i) > 0.8) {
      ctx.fillStyle = `rgba(220, 235, 250, 0.3)`;
      ctx.beginPath();
      ctx.arc(snowX, snowY, snowSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Soft icy undertone
  const iceGrad = ctx.createRadialGradient(endPos.x, endPos.y - 8 * cameraZoom, 0, endPos.x, endPos.y, size * 0.65 * cameraZoom);
  const icePulse = 0.05 + Math.sin(time * 1.5) * 0.02;
  iceGrad.addColorStop(0, `rgba(140, 170, 200, ${icePulse})`);
  iceGrad.addColorStop(0.6, `rgba(120, 150, 180, ${icePulse * 0.4})`);
  iceGrad.addColorStop(1, `rgba(100, 130, 160, 0)`);
  ctx.fillStyle = iceGrad;
  ctx.beginPath();
  ctx.ellipse(endPos.x, endPos.y, size * 0.65 * cameraZoom, size * 0.28 * cameraZoom, 0, 0, Math.PI * 2);
  ctx.fill();
}

function renderVolcanicFogEffects(
  ctx: CanvasRenderingContext2D,
  endPos: Position,
  size: number,
  cameraZoom: number,
  time: number
): void {
  // Embers and ash with glow effect
  for (let i = 0; i < 6; i++) {
    const emberTime = time * 1.0 + i * 0.8;
    const emberRise = ((emberTime * 22 + i * 20) % (size * 1.4)) - size * 0.25;
    const emberDrift = Math.sin(emberTime * 0.8 + i * 2) * size * 0.25;
    const emberX = endPos.x + emberDrift * cameraZoom;
    const emberY = endPos.y - emberRise * 0.35 * cameraZoom;
    const emberSize = (1.8 + Math.sin(emberTime + i) * 1.0) * cameraZoom;
    const emberFlicker = 0.4 + Math.sin(emberTime * 8 + i * 5) * 0.25;

    // Ember glow
    const emberGlow = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, emberSize * 2.5);
    emberGlow.addColorStop(0, `rgba(220, ${90 + Math.sin(emberTime) * 40}, 40, ${emberFlicker * 0.6})`);
    emberGlow.addColorStop(0.3, `rgba(180, 70, 30, ${emberFlicker * 0.3})`);
    emberGlow.addColorStop(1, `rgba(120, 50, 20, 0)`);
    ctx.fillStyle = emberGlow;
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Ember core
    ctx.fillStyle = `rgba(240, ${180 + Math.sin(emberTime * 3) * 40}, ${100 + Math.sin(emberTime * 5) * 40}, ${emberFlicker * 0.6})`;
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Soft ash particles
  for (let i = 0; i < 8; i++) {
    const ashTime = time * 0.45 + i * 1.5;
    const ashX = endPos.x + Math.sin(ashTime * 0.4 + i * 2) * size * 0.45 * cameraZoom;
    const ashY = endPos.y + Math.cos(ashTime * 0.3 + i) * size * 0.18 * cameraZoom;
    const ashAlpha = 0.2 + Math.sin(ashTime) * 0.08;
    ctx.fillStyle = `rgba(80, 65, 60, ${ashAlpha})`;
    ctx.beginPath();
    ctx.arc(ashX, ashY, 1.8 * cameraZoom, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Soft fiery undertone
  const fireGrad = ctx.createRadialGradient(endPos.x, endPos.y + 12 * cameraZoom, 0, endPos.x, endPos.y, size * 0.8 * cameraZoom);
  const firePulse = 0.05 + Math.sin(time * 3) * 0.025;
  fireGrad.addColorStop(0, `rgba(200, 100, 50, ${firePulse})`);
  fireGrad.addColorStop(0.4, `rgba(160, 80, 40, ${firePulse * 0.5})`);
  fireGrad.addColorStop(1, `rgba(120, 60, 30, 0)`);
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.ellipse(endPos.x, endPos.y, size * 0.8 * cameraZoom, size * 0.35 * cameraZoom, 0, 0, Math.PI * 2);
  ctx.fill();
}

function renderSwampFogEffects(
  ctx: CanvasRenderingContext2D,
  endPos: Position,
  size: number,
  cameraZoom: number,
  time: number
): void {
  // Soft bubbles rising
  for (let i = 0; i < 5; i++) {
    const bubbleTime = time * 0.6 + i * 1.3;
    const bubbleRise = ((bubbleTime * 12 + i * 25) % (size * 1.1)) - size * 0.28;
    const bubbleWobble = Math.sin(bubbleTime * 2 + i) * size * 0.12;
    const bubbleX = endPos.x + bubbleWobble * cameraZoom;
    const bubbleY = endPos.y - bubbleRise * 0.32 * cameraZoom;
    const bubbleSize = (2.5 + Math.sin(i + bubbleTime * 0.5) * 1.5) * cameraZoom;
    const bubbleAlpha = 0.18 + Math.sin(bubbleTime) * 0.08;

    // Soft bubble outline
    ctx.strokeStyle = `rgba(80, 130, 85, ${bubbleAlpha})`;
    ctx.lineWidth = 1.2 * cameraZoom;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.stroke();
    
    // Soft highlight
    ctx.fillStyle = `rgba(100, 150, 100, ${bubbleAlpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(bubbleX - bubbleSize * 0.3, bubbleY - bubbleSize * 0.3, bubbleSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Soft spores/particles
  for (let i = 0; i < 4; i++) {
    const sporeTime = time * 0.35 + i * 1.8;
    const sporeX = endPos.x + Math.sin(sporeTime * 0.5 + i * 2.5) * size * 0.35 * cameraZoom;
    const sporeY = endPos.y + Math.cos(sporeTime * 0.3 + i * 1.7) * size * 0.15 * cameraZoom;
    const sporeAlpha = 0.2 + Math.sin(sporeTime * 1.5) * 0.08;

    const sporeGrad = ctx.createRadialGradient(sporeX, sporeY, 0, sporeX, sporeY, 5 * cameraZoom);
    sporeGrad.addColorStop(0, `rgba(90, 150, 90, ${sporeAlpha})`);
    sporeGrad.addColorStop(0.5, `rgba(70, 120, 70, ${sporeAlpha * 0.5})`);
    sporeGrad.addColorStop(1, `rgba(50, 90, 50, 0)`);
    ctx.fillStyle = sporeGrad;
    ctx.beginPath();
    ctx.arc(sporeX, sporeY, 5 * cameraZoom, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Soft miasma undertone
  const miasmaGrad = ctx.createRadialGradient(endPos.x, endPos.y, 0, endPos.x, endPos.y, size * 0.7 * cameraZoom);
  const miasmaPulse = 0.06 + Math.sin(time * 1.2) * 0.025;
  miasmaGrad.addColorStop(0, `rgba(80, 130, 85, ${miasmaPulse})`);
  miasmaGrad.addColorStop(0.5, `rgba(65, 110, 70, ${miasmaPulse * 0.5})`);
  miasmaGrad.addColorStop(1, `rgba(50, 90, 55, 0)`);
  ctx.fillStyle = miasmaGrad;
  ctx.beginPath();
  ctx.ellipse(endPos.x, endPos.y, size * 0.7 * cameraZoom, size * 0.32 * cameraZoom, 0, 0, Math.PI * 2);
  ctx.fill();
}
