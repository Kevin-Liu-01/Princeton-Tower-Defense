// Princeton Tower Defense - Hazards Rendering Module
// Renders map hazards like poison fog, lava geysers, ice sheets, quicksand

import type { Position, MapHazard } from "../../types";
import { worldToScreen, gridToWorld } from "../../utils";
import { TILE_SIZE } from "../../constants";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Draws an organic blob shape instead of a perfect ellipse
 * Creates natural-looking edges for hazards
 */
function drawOrganicBlob(
  ctx: CanvasRenderingContext2D,
  radiusX: number,
  radiusY: number,
  seed: number,
  bumpiness: number = 0.15
): void {
  ctx.beginPath();
  const points = 24;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    // Use seed to create consistent organic variation
    const noise1 = Math.sin(angle * 3 + seed) * bumpiness;
    const noise2 = Math.sin(angle * 5 + seed * 2.3) * bumpiness * 0.5;
    const noise3 = Math.sin(angle * 7 + seed * 4.1) * bumpiness * 0.25;
    const variation = 1 + noise1 + noise2 + noise3;

    const x = Math.cos(angle) * radiusX * variation;
    const y = Math.sin(angle) * radiusY * variation;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

// ============================================================================
// MAIN HAZARD RENDER FUNCTION
// ============================================================================

export function renderHazard(
  ctx: CanvasRenderingContext2D,
  hazard: MapHazard,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  if (!hazard.pos) return;
  
  const zoom = cameraZoom || 1;
  const screenPos = worldToScreen(
    gridToWorld(hazard.pos),
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const sRad = (hazard.radius || 2) * TILE_SIZE * zoom;
  const time = Date.now() / 1000;
  const isoRatio = 0.5; // Standard isometric Y compression

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);

  switch (hazard.type) {
    case "poison_fog":
      drawPoisonFogHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "lava_geyser":
    case "eruption_zone":
      drawLavaGeyserHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "ice_sheet":
    case "slippery_ice":
      drawIceSheetHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "quicksand":
      drawQuicksandHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "lava":
      drawSimpleLavaHazard(ctx, sRad, time, zoom);
      break;
    case "swamp":
      drawSimpleSwampHazard(ctx, sRad, time, zoom);
      break;
    case "ice":
      drawSimpleIceHazard(ctx, sRad, time, zoom);
      break;
    case "poison":
      drawSimplePoisonHazard(ctx, sRad, time, zoom);
      break;
    case "fire":
      drawSimpleFireHazard(ctx, sRad, time, zoom);
      break;
    case "lightning":
      drawSimpleLightningHazard(ctx, sRad, time, zoom);
      break;
    case "void":
      drawSimpleVoidHazard(ctx, sRad, time, zoom);
      break;
    case "spikes":
      drawSimpleSpikesHazard(ctx, sRad, time, zoom);
      break;
    default:
      drawGenericHazard(ctx, sRad, time, zoom);
  }

  ctx.restore();
}

// ============================================================================
// POISON FOG HAZARD
// ============================================================================

function drawPoisonFogHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 17.3 + (pos.y || 0) * 31.7;

  // 1. Ground contamination layer - corroded earth with organic edges
  ctx.save();
  const soilGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 1.1);
  soilGrad.addColorStop(0, "rgba(25, 45, 25, 0.85)");
  soilGrad.addColorStop(0.4, "rgba(35, 55, 30, 0.7)");
  soilGrad.addColorStop(0.7, "rgba(45, 65, 35, 0.4)");
  soilGrad.addColorStop(1, "transparent");
  ctx.fillStyle = soilGrad;
  drawOrganicBlob(ctx, sRad * 1.1, sRad * 1.1 * isoRatio, hazSeed, 0.2);
  ctx.fill();

  // Corrupted veins/cracks in ground
  ctx.strokeStyle = "rgba(80, 200, 80, 0.4)";
  ctx.lineWidth = 1.5 * cameraZoom;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.sin(hazSeed + i) * 0.3;
    const len = sRad * (0.5 + Math.sin(time * 0.3 + i) * 0.2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const midX = Math.cos(angle) * len * 0.5;
    const midY = Math.sin(angle) * len * 0.5 * isoRatio;
    ctx.quadraticCurveTo(
      midX + Math.sin(i * 2 + hazSeed) * 12 * cameraZoom,
      midY + Math.cos(i * 2 + hazSeed) * 6 * cameraZoom,
      Math.cos(angle) * len,
      Math.sin(angle) * len * isoRatio
    );
    ctx.stroke();
  }
  ctx.restore();

  // 2. Bubbling toxic pools (multiple small pools with organic shapes)
  for (let pool = 0; pool < 4; pool++) {
    const poolSeed = hazSeed + pool * 23.7;
    const poolAngle = (pool / 4) * Math.PI * 2 + Math.sin(poolSeed) * 0.5;
    const poolDist = sRad * (0.4 + Math.sin(poolSeed * 1.3) * 0.15);
    const poolX = Math.cos(poolAngle) * poolDist;
    const poolY = Math.sin(poolAngle) * poolDist * isoRatio;
    const poolSize = sRad * (0.15 + Math.sin(poolSeed * 2.1) * 0.05);

    ctx.save();
    ctx.translate(poolX, poolY);
    const poolGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, poolSize);
    poolGrad.addColorStop(0, "rgba(100, 220, 100, 0.8)");
    poolGrad.addColorStop(0.6, "rgba(60, 180, 60, 0.6)");
    poolGrad.addColorStop(1, "rgba(40, 100, 40, 0.3)");
    ctx.fillStyle = poolGrad;
    drawOrganicBlob(ctx, poolSize, poolSize * isoRatio, poolSeed, 0.25);
    ctx.fill();
    ctx.restore();

    // Bubbles rising from pools
    for (let b = 0; b < 3; b++) {
      const bubblePhase = (time * 1.5 + pool + b * 0.3) % 1;
      const bubbleSize = (3 + b) * cameraZoom * (1 - bubblePhase * 0.5);
      const bubbleY = poolY - bubblePhase * 25 * cameraZoom;
      const bubbleX = poolX + Math.sin(time * 3 + b + poolSeed) * 5 * cameraZoom;

      ctx.fillStyle = `rgba(150, 255, 150, ${0.6 * (1 - bubblePhase)})`;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Volumetric fog layers with organic shapes
  for (let layer = 0; layer < 5; layer++) {
    const layerHeight = -layer * 12 * cameraZoom;
    const layerScale = 1 - layer * 0.1;
    const layerAlpha = 0.25 - layer * 0.04;
    const drift = Math.sin(time * 0.5 + layer) * 15 * cameraZoom;

    ctx.save();
    ctx.translate(drift, layerHeight);

    const fogGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * layerScale);
    fogGrad.addColorStop(0, `rgba(120, 40, 180, ${layerAlpha})`);
    fogGrad.addColorStop(0.3, `rgba(80, 180, 80, ${layerAlpha * 0.8})`);
    fogGrad.addColorStop(0.6, `rgba(60, 140, 60, ${layerAlpha * 0.5})`);
    fogGrad.addColorStop(1, "transparent");

    ctx.fillStyle = fogGrad;
    drawOrganicBlob(ctx, sRad * layerScale, sRad * layerScale * isoRatio * 0.8, hazSeed + layer * 7, 0.18);
    ctx.fill();
    ctx.restore();
  }

  // 4. Toxic spore particles
  for (let j = 0; j < 12; j++) {
    const seed = j * 0.618;
    const particleLife = (time + seed * 2) % 2.5;
    const px = Math.sin(seed * 17.3 + hazSeed) * sRad * 0.7 + Math.sin(time + j) * 10 * cameraZoom;
    const py = -particleLife * 35 * cameraZoom + Math.cos(seed * 23.7 + hazSeed) * sRad * 0.3 * isoRatio;
    const pSize = (1 - particleLife / 2.5) * (3 + (j % 3)) * cameraZoom;

    ctx.save();
    ctx.shadowColor = "rgba(100, 255, 100, 0.8)";
    ctx.shadowBlur = 8 * cameraZoom;
    ctx.fillStyle = `rgba(150, 255, 150, ${(1 - particleLife / 2.5) * 0.8})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================================
// LAVA GEYSER HAZARD
// ============================================================================

function drawLavaGeyserHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 13.7 + (pos.y || 0) * 29.3;
  const cycleTime = time % 5;
  const isErupting = cycleTime < 1.2;
  const buildUp = cycleTime > 4.0;
  const eruptionIntensity = isErupting ? Math.sin((cycleTime / 1.2) * Math.PI) : 0;

  // Stretched isometric ratio for proper volcanic appearance
  const lavaIsoRatio = 0.55;

  // 1. Scorched earth ring around vent (organic shape)
  const scorchGrad = ctx.createRadialGradient(0, 0, sRad * 0.3, 0, 0, sRad * 1.4);
  scorchGrad.addColorStop(0, "rgba(60, 30, 15, 0.9)");
  scorchGrad.addColorStop(0.4, "rgba(40, 20, 10, 0.7)");
  scorchGrad.addColorStop(0.7, "rgba(30, 15, 8, 0.4)");
  scorchGrad.addColorStop(1, "transparent");
  ctx.fillStyle = scorchGrad;
  drawOrganicBlob(ctx, sRad * 1.4, sRad * 1.4 * lavaIsoRatio, hazSeed, 0.2);
  ctx.fill();

  // Radial cracks in scorched ground
  ctx.strokeStyle = "rgba(255, 100, 0, 0.4)";
  ctx.lineWidth = 2 * cameraZoom;
  for (let c = 0; c < 12; c++) {
    const crackAngle = (c / 12) * Math.PI * 2 + Math.sin(hazSeed + c * 2) * 0.2;
    const crackLen = sRad * (0.4 + Math.sin(c * 3 + hazSeed) * 0.3);
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(crackAngle) * sRad * 0.35,
      Math.sin(crackAngle) * sRad * 0.35 * lavaIsoRatio
    );
    // Jagged crack path
    const midAngle = crackAngle + Math.sin(hazSeed + c) * 0.15;
    ctx.quadraticCurveTo(
      Math.cos(midAngle) * crackLen * 0.6,
      Math.sin(midAngle) * crackLen * 0.6 * lavaIsoRatio,
      Math.cos(crackAngle) * crackLen,
      Math.sin(crackAngle) * crackLen * lavaIsoRatio
    );
    ctx.stroke();
  }

  // 2. Isometric rock vent structure
  const ventWidth = sRad * 0.8;

  // Back rocks (behind magma)
  ctx.fillStyle = "#1a1a1a";
  for (let r = 0; r < 5; r++) {
    const rockAngle = Math.PI + (r / 5) * Math.PI;
    const rockOffset = Math.sin(hazSeed + r * 3) * 0.15;
    const rockX = Math.cos(rockAngle) * ventWidth * (0.5 + rockOffset);
    const rockY = Math.sin(rockAngle) * ventWidth * (0.3 + rockOffset * 0.5) * lavaIsoRatio;
    const rockH = (12 + r * 4 + Math.sin(hazSeed + r) * 5) * cameraZoom;
    const rockW = (6 + Math.sin(hazSeed + r * 2) * 2) * cameraZoom;

    ctx.beginPath();
    ctx.moveTo(rockX - rockW, rockY);
    ctx.lineTo(rockX - rockW * 0.7, rockY - rockH);
    ctx.lineTo(rockX + rockW * 0.7, rockY - rockH);
    ctx.lineTo(rockX + rockW, rockY);
    ctx.closePath();
    ctx.fill();

    // Rock highlight
    ctx.fillStyle = "#2d2d2d";
    ctx.beginPath();
    ctx.moveTo(rockX + rockW * 0.3, rockY - 2 * cameraZoom);
    ctx.lineTo(rockX + rockW * 0.5, rockY - rockH + 2 * cameraZoom);
    ctx.lineTo(rockX + rockW * 0.7, rockY - rockH);
    ctx.lineTo(rockX + rockW, rockY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
  }

  // 3. Magma pool in center (organic shape with proper stretching)
  const magmaGrad = ctx.createRadialGradient(0, -5 * cameraZoom, 0, 0, -5 * cameraZoom, ventWidth * 0.5);
  const magmaIntensity = buildUp ? 1.3 : (isErupting ? 1.5 : 1);
  magmaGrad.addColorStop(0, `rgba(255, 255, ${buildUp ? 200 : 100}, ${magmaIntensity})`);
  magmaGrad.addColorStop(0.3, "#ff6600");
  magmaGrad.addColorStop(0.6, "#cc3300");
  magmaGrad.addColorStop(1, "#661100");

  ctx.save();
  ctx.translate(0, -5 * cameraZoom);
  if (buildUp || isErupting) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = (20 + eruptionIntensity * 30) * cameraZoom;
  }
  ctx.fillStyle = magmaGrad;
  drawOrganicBlob(ctx, ventWidth * 0.45, ventWidth * 0.25 * lavaIsoRatio, hazSeed + 100, 0.12);
  ctx.fill();
  ctx.restore();

  // Magma surface animation (convection currents)
  ctx.strokeStyle = "rgba(255, 200, 50, 0.6)";
  ctx.lineWidth = 2 * cameraZoom;
  for (let conv = 0; conv < 3; conv++) {
    const convAngle = time * 0.5 + conv * 2;
    const convR = ventWidth * 0.2 * (1 + conv * 0.2);
    ctx.beginPath();
    ctx.arc(
      Math.cos(convAngle) * convR * 0.3,
      -5 * cameraZoom + Math.sin(convAngle) * convR * 0.15 * lavaIsoRatio,
      convR * 0.3,
      0, Math.PI * 1.5
    );
    ctx.stroke();
  }

  // 4. Front rocks (in front of magma)
  for (let r = 0; r < 5; r++) {
    const rockAngle = (r / 5) * Math.PI;
    const rockOffset = Math.sin(hazSeed + r * 5) * 0.15;
    const rockX = Math.cos(rockAngle) * ventWidth * (0.5 + rockOffset);
    const rockY = Math.sin(rockAngle) * ventWidth * (0.3 + rockOffset * 0.5) * lavaIsoRatio;
    const rockH = (10 + (r % 2) * 6 + Math.sin(hazSeed + r * 3) * 4) * cameraZoom;
    const rockW = (5 + Math.sin(hazSeed + r * 4) * 2) * cameraZoom;

    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.moveTo(rockX - rockW, rockY);
    ctx.lineTo(rockX - rockW * 0.6, rockY - rockH);
    ctx.lineTo(rockX + rockW * 0.6, rockY - rockH);
    ctx.lineTo(rockX + rockW, rockY);
    ctx.closePath();
    ctx.fill();

    // Hot edge glow from magma
    ctx.strokeStyle = `rgba(255, 100, 0, ${0.3 + eruptionIntensity * 0.4})`;
    ctx.lineWidth = 2 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(rockX - rockW, rockY);
    ctx.lineTo(rockX - rockW * 0.6, rockY - rockH);
    ctx.stroke();
  }

  // 5. Eruption effects
  if (isErupting) {
    const columnHeight = eruptionIntensity * 120 * cameraZoom;
    const columnGrad = ctx.createLinearGradient(0, 0, 0, -columnHeight);
    columnGrad.addColorStop(0, "#ffcc00");
    columnGrad.addColorStop(0.2, "#ff8800");
    columnGrad.addColorStop(0.5, "#ff4400");
    columnGrad.addColorStop(0.8, "rgba(255, 68, 0, 0.5)");
    columnGrad.addColorStop(1, "transparent");

    ctx.save();
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 30 * cameraZoom;
    ctx.fillStyle = columnGrad;
    ctx.beginPath();
    ctx.moveTo(-15 * cameraZoom * eruptionIntensity, -10 * cameraZoom);
    ctx.quadraticCurveTo(
      -5 * cameraZoom + Math.sin(time * 20) * 8 * cameraZoom,
      -columnHeight * 0.5,
      0,
      -columnHeight
    );
    ctx.quadraticCurveTo(
      5 * cameraZoom + Math.sin(time * 20 + 1) * 8 * cameraZoom,
      -columnHeight * 0.5,
      15 * cameraZoom * eruptionIntensity,
      -10 * cameraZoom
    );
    ctx.fill();
    ctx.restore();

    // Lava bombs
    for (let bomb = 0; bomb < 8; bomb++) {
      const bombPhase = (cycleTime + bomb * 0.1) % 1.2;
      const bombAngle = (bomb / 8) * Math.PI * 2 + time;
      const bombDist = bombPhase * sRad * 1.5;
      const bombHeight = Math.sin(bombPhase * Math.PI) * 80 * cameraZoom;
      const bombX = Math.cos(bombAngle) * bombDist;
      const bombY = Math.sin(bombAngle) * bombDist * lavaIsoRatio - bombHeight;
      const bombSize = (6 - bombPhase * 3) * cameraZoom;

      if (bombPhase < 1) {
        ctx.save();
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 10 * cameraZoom;
        const bombGrad = ctx.createRadialGradient(bombX, bombY, 0, bombX, bombY, bombSize);
        bombGrad.addColorStop(0, "#ffcc00");
        bombGrad.addColorStop(0.5, "#ff6600");
        bombGrad.addColorStop(1, "#cc3300");
        ctx.fillStyle = bombGrad;
        ctx.beginPath();
        ctx.arc(bombX, bombY, bombSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // 6. Ambient embers
  for (let ember = 0; ember < 6; ember++) {
    const emberPhase = (time * 0.7 + ember * 0.4) % 2;
    const emberX = Math.sin(ember * 2.3 + time * 0.5) * sRad * 0.4;
    const emberY = -emberPhase * 40 * cameraZoom;
    const emberSize = (2 + Math.sin(ember)) * cameraZoom * (1 - emberPhase / 2);

    ctx.fillStyle = `rgba(255, ${150 + ember * 10}, 0, ${0.8 * (1 - emberPhase / 2)})`;
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// ICE SHEET HAZARD
// ============================================================================

function drawIceSheetHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 19.3 + (pos.y || 0) * 37.1;

  // 1. Snow/frost accumulation around edges (organic)
  const frostGrad = ctx.createRadialGradient(0, 0, sRad * 0.7, 0, 0, sRad * 1.2);
  frostGrad.addColorStop(0, "transparent");
  frostGrad.addColorStop(0.5, "rgba(240, 248, 255, 0.4)");
  frostGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");
  ctx.fillStyle = frostGrad;
  drawOrganicBlob(ctx, sRad * 1.2, sRad * 1.2 * isoRatio, hazSeed, 0.2);
  ctx.fill();

  // Snow mounds at edges (irregular placement)
  ctx.fillStyle = "rgba(250, 250, 255, 0.7)";
  for (let mound = 0; mound < 10; mound++) {
    const moundAngle = (mound / 10) * Math.PI * 2 + Math.sin(hazSeed + mound) * 0.3;
    const moundDist = sRad * (0.85 + Math.sin(hazSeed + mound * 2) * 0.15);
    const moundX = Math.cos(moundAngle) * moundDist;
    const moundY = Math.sin(moundAngle) * moundDist * isoRatio;
    const moundSize = (6 + Math.sin(hazSeed + mound * 3) * 4) * cameraZoom;

    ctx.beginPath();
    ctx.ellipse(moundX, moundY, moundSize, moundSize * 0.4, moundAngle + Math.sin(hazSeed + mound) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Multi-layer ice surface with depth (organic shape)
  const iceDeepGrad = ctx.createRadialGradient(0, 5 * cameraZoom, 0, 0, 5 * cameraZoom, sRad);
  iceDeepGrad.addColorStop(0, "rgba(100, 150, 180, 0.9)");
  iceDeepGrad.addColorStop(0.5, "rgba(80, 130, 170, 0.8)");
  iceDeepGrad.addColorStop(1, "rgba(60, 110, 150, 0.6)");
  ctx.fillStyle = iceDeepGrad;
  ctx.save();
  ctx.translate(0, 5 * cameraZoom);
  drawOrganicBlob(ctx, sRad * 0.95, sRad * 0.95 * isoRatio, hazSeed + 50, 0.15);
  ctx.fill();
  ctx.restore();

  // Surface layer
  const iceSurfGrad = ctx.createRadialGradient(
    -sRad * 0.3, -sRad * 0.15 * isoRatio, 0,
    0, 0, sRad
  );
  iceSurfGrad.addColorStop(0, "rgba(220, 240, 255, 0.9)");
  iceSurfGrad.addColorStop(0.3, "rgba(180, 210, 240, 0.7)");
  iceSurfGrad.addColorStop(0.7, "rgba(140, 180, 220, 0.5)");
  iceSurfGrad.addColorStop(1, "rgba(100, 150, 200, 0.3)");
  ctx.fillStyle = iceSurfGrad;
  drawOrganicBlob(ctx, sRad * 0.9, sRad * 0.9 * isoRatio, hazSeed + 100, 0.15);
  ctx.fill();

  // 3. Crack network in ice
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1 * cameraZoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = (crack / 6) * Math.PI * 2 + Math.sin(hazSeed + crack) * 0.4;
    const crackLen = sRad * (0.4 + Math.sin(crack * 2 + hazSeed) * 0.3);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    const segments = 4;
    for (let s = 1; s <= segments; s++) {
      const progress = s / segments;
      const baseX = Math.cos(crackAngle) * crackLen * progress;
      const baseY = Math.sin(crackAngle) * crackLen * progress * isoRatio;
      const jitter = (Math.sin(crack * 5 + s * 3 + hazSeed) * 8) * cameraZoom;
      ctx.lineTo(
        baseX + Math.cos(crackAngle + Math.PI / 2) * jitter,
        baseY + Math.sin(crackAngle + Math.PI / 2) * jitter * isoRatio
      );
    }
    ctx.stroke();
  }

  // 4. Ice crystals
  const crystalPositions = [
    { angle: 0.5, dist: 0.4, h: 35, w: 8 },
    { angle: 2.3, dist: 0.35, h: 28, w: 7 },
    { angle: 4.1, dist: 0.45, h: 22, w: 6 },
    { angle: 5.5, dist: 0.3, h: 18, w: 5 },
    { angle: 1.2, dist: 0.25, h: 40, w: 10 },
  ];

  for (let i = 0; i < crystalPositions.length; i++) {
    const crystal = crystalPositions[i];
    const cx = Math.cos(crystal.angle + hazSeed * 0.1) * sRad * crystal.dist;
    const cy = Math.sin(crystal.angle + hazSeed * 0.1) * sRad * crystal.dist * isoRatio;
    const ch = crystal.h * cameraZoom;
    const cw = crystal.w * cameraZoom;

    // Crystal body
    ctx.fillStyle = "rgba(150, 200, 240, 0.8)";
    ctx.beginPath();
    ctx.moveTo(cx, cy - ch);
    ctx.lineTo(cx - cw, cy - ch * 0.3);
    ctx.lineTo(cx - cw * 0.5, cy);
    ctx.lineTo(cx + cw * 0.5, cy);
    ctx.lineTo(cx + cw, cy - ch * 0.3);
    ctx.closePath();
    ctx.fill();

    // Front-right face (highlight)
    ctx.fillStyle = "rgba(220, 240, 255, 0.95)";
    ctx.beginPath();
    ctx.moveTo(cx, cy - ch);
    ctx.lineTo(cx + cw, cy - ch * 0.3);
    ctx.lineTo(cx + cw * 0.5, cy);
    ctx.lineTo(cx, cy - ch * 0.15);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Floating ice particles
  for (let p = 0; p < 10; p++) {
    const pPhase = (time + p * 0.7) % 3;
    const pAngle = p * 0.618 * Math.PI * 2 + hazSeed;
    const pDist = sRad * 0.3 + pPhase * sRad * 0.2;
    const px = Math.cos(pAngle + time * 0.2) * pDist;
    const py = Math.sin(pAngle + time * 0.2) * pDist * isoRatio - pPhase * 15 * cameraZoom;
    const pSize = (2 + Math.sin(p * 2) * 1) * cameraZoom * (1 - pPhase / 3);

    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * (1 - pPhase / 3)})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Cold mist
  for (let mist = 0; mist < 4; mist++) {
    const mistPhase = (time * 0.5 + mist) % 2;
    const mistX = Math.sin(time * 0.3 + mist * 2 + hazSeed) * sRad * 0.6;
    const mistY = sRad * 0.2 * isoRatio;
    const mistSize = sRad * 0.4 * (0.5 + mistPhase * 0.3);

    const mistGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, mistSize);
    mistGrad.addColorStop(0, `rgba(200, 230, 255, ${0.15 * (1 - mistPhase / 2)})`);
    mistGrad.addColorStop(1, "transparent");
    ctx.fillStyle = mistGrad;
    ctx.beginPath();
    ctx.ellipse(mistX, mistY, mistSize, mistSize * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// QUICKSAND HAZARD
// ============================================================================

function drawQuicksandHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 23.1 + (pos.y || 0) * 41.9;

  // 1. Disturbed ground ring (organic)
  const disturbedGrad = ctx.createRadialGradient(0, 0, sRad * 0.5, 0, 0, sRad * 1.3);
  disturbedGrad.addColorStop(0, "transparent");
  disturbedGrad.addColorStop(0.5, "rgba(139, 119, 101, 0.5)");
  disturbedGrad.addColorStop(0.8, "rgba(160, 140, 120, 0.3)");
  disturbedGrad.addColorStop(1, "transparent");
  ctx.fillStyle = disturbedGrad;
  drawOrganicBlob(ctx, sRad * 1.3, sRad * 1.3 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  // Cracked dry earth at edges
  ctx.strokeStyle = "rgba(100, 80, 60, 0.5)";
  ctx.lineWidth = 1.5 * cameraZoom;
  for (let crack = 0; crack < 12; crack++) {
    const crackAngle = (crack / 12) * Math.PI * 2 + Math.sin(hazSeed + crack) * 0.25;
    const crackStart = sRad * (0.8 + Math.sin(hazSeed + crack * 2) * 0.1);
    const crackEnd = sRad * (1.1 + Math.sin(hazSeed + crack * 3) * 0.1);
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(crackAngle) * crackStart,
      Math.sin(crackAngle) * crackStart * isoRatio
    );
    ctx.lineTo(
      Math.cos(crackAngle + 0.1) * crackEnd,
      Math.sin(crackAngle + 0.1) * crackEnd * isoRatio
    );
    ctx.stroke();
  }

  // 2. Multi-layer sand pit (organic shapes)
  // Deep center
  const deepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.4);
  deepGrad.addColorStop(0, "rgba(50, 35, 25, 0.95)");
  deepGrad.addColorStop(0.7, "rgba(70, 50, 35, 0.9)");
  deepGrad.addColorStop(1, "rgba(90, 65, 45, 0.8)");
  ctx.fillStyle = deepGrad;
  drawOrganicBlob(ctx, sRad * 0.4, sRad * 0.4 * isoRatio, hazSeed + 50, 0.18);
  ctx.fill();

  // Middle layer
  const midGrad = ctx.createRadialGradient(0, 0, sRad * 0.3, 0, 0, sRad * 0.7);
  midGrad.addColorStop(0, "rgba(100, 75, 55, 0.85)");
  midGrad.addColorStop(1, "rgba(140, 110, 80, 0.7)");
  ctx.fillStyle = midGrad;
  drawOrganicBlob(ctx, sRad * 0.7, sRad * 0.7 * isoRatio, hazSeed + 100, 0.16);
  ctx.fill();

  // Surface layer
  const surfGrad = ctx.createRadialGradient(0, 0, sRad * 0.5, 0, 0, sRad);
  surfGrad.addColorStop(0, "rgba(180, 150, 120, 0.6)");
  surfGrad.addColorStop(0.5, "rgba(200, 170, 130, 0.75)");
  surfGrad.addColorStop(1, "rgba(180, 150, 110, 0.65)");
  ctx.fillStyle = surfGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 150, 0.18);
  ctx.fill();

  // 3. Animated spiral suction pattern
  ctx.save();
  const spiralSpeed = time * 0.8;
  for (let arm = 0; arm < 4; arm++) {
    ctx.strokeStyle = `rgba(90, 70, 50, ${0.3 + arm * 0.1})`;
    ctx.lineWidth = (3 - arm * 0.5) * cameraZoom;
    ctx.beginPath();
    for (let t = 0; t < 3; t += 0.05) {
      const spiralR = sRad * 0.1 + t * sRad * 0.25;
      const spiralAngle = t * 3 + spiralSpeed + arm * (Math.PI / 2);
      const sx = Math.cos(spiralAngle) * spiralR;
      const sy = Math.sin(spiralAngle) * spiralR * isoRatio;
      if (t === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 4. Sand ripples moving inward
  for (let ripple = 0; ripple < 4; ripple++) {
    const ripplePhase = (time * 0.5 + ripple * 0.25) % 1;
    const rippleR = sRad * (1 - ripplePhase * 0.6);
    ctx.strokeStyle = `rgba(160, 130, 100, ${0.4 * (1 - ripplePhase)})`;
    ctx.lineWidth = 2 * cameraZoom * (1 - ripplePhase * 0.5);
    drawOrganicBlob(ctx, rippleR, rippleR * isoRatio, hazSeed + ripple * 20, 0.1);
    ctx.stroke();
  }

  // 5. Debris being pulled in
  const debrisItems = [
    { type: 'bone', angle: 0.5 + hazSeed * 0.01, dist: 0.6 },
    { type: 'stick', angle: 2.1 + hazSeed * 0.01, dist: 0.7 },
    { type: 'rock', angle: 3.8 + hazSeed * 0.01, dist: 0.5 },
    { type: 'skull', angle: 5.2 + hazSeed * 0.01, dist: 0.4 },
  ];

  for (const debris of debrisItems) {
    const sinkProgress = (time * 0.15 + debris.angle) % 1;
    const debrisDist = debris.dist * sRad * (1 - sinkProgress * 0.5);
    const debrisX = Math.cos(debris.angle + sinkProgress * 0.5) * debrisDist;
    const debrisY = Math.sin(debris.angle + sinkProgress * 0.5) * debrisDist * isoRatio;
    const debrisSink = sinkProgress * 8 * cameraZoom;

    ctx.save();
    ctx.translate(debrisX, debrisY + debrisSink);
    ctx.rotate(sinkProgress * 0.5);
    ctx.globalAlpha = 1 - sinkProgress * 0.7;

    if (debris.type === 'bone') {
      ctx.fillStyle = "#e8dcc8";
      ctx.beginPath();
      ctx.ellipse(0, 0, 12 * cameraZoom, 3 * cameraZoom, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (debris.type === 'rock') {
      ctx.fillStyle = "#7a7a7a";
      ctx.beginPath();
      ctx.moveTo(-8 * cameraZoom, 5 * cameraZoom);
      ctx.lineTo(-5 * cameraZoom, -6 * cameraZoom);
      ctx.lineTo(7 * cameraZoom, -4 * cameraZoom);
      ctx.lineTo(9 * cameraZoom, 4 * cameraZoom);
      ctx.closePath();
      ctx.fill();
    } else if (debris.type === 'skull') {
      ctx.fillStyle = "#d4c8b8";
      ctx.beginPath();
      ctx.arc(0, -3 * cameraZoom, 8 * cameraZoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3d3d3d";
      ctx.beginPath();
      ctx.arc(-3 * cameraZoom, -4 * cameraZoom, 2 * cameraZoom, 0, Math.PI * 2);
      ctx.arc(3 * cameraZoom, -4 * cameraZoom, 2 * cameraZoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 6. Bubbling sand effect
  for (let bubble = 0; bubble < 8; bubble++) {
    const bubblePhase = (time * 1.2 + bubble * 0.4) % 1;
    const bubbleAngle = bubble * 0.785 + Math.sin(time + bubble + hazSeed) * 0.3;
    const bubbleDist = sRad * 0.3 + Math.sin(bubble * 2 + hazSeed) * sRad * 0.2;
    const bubbleX = Math.cos(bubbleAngle) * bubbleDist;
    const bubbleY = Math.sin(bubbleAngle) * bubbleDist * isoRatio;

    if (bubblePhase < 0.5) {
      const bubbleSize = (4 + bubble % 3) * cameraZoom * Math.sin(bubblePhase * Math.PI);
      ctx.fillStyle = `rgba(200, 170, 130, ${0.6 * (1 - bubblePhase * 2)})`;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 7. Warning sign
  ctx.save();
  const signAngle = hazSeed * 0.1;
  ctx.translate(Math.cos(signAngle) * sRad * 0.9, Math.sin(signAngle) * sRad * 0.4 * isoRatio - sRad * 0.3 * isoRatio);

  ctx.fillStyle = "#5d4e37";
  ctx.fillRect(-3 * cameraZoom, -25 * cameraZoom, 6 * cameraZoom, 30 * cameraZoom);

  ctx.fillStyle = "#c4a35a";
  ctx.beginPath();
  ctx.moveTo(0, -35 * cameraZoom);
  ctx.lineTo(-12 * cameraZoom, -20 * cameraZoom);
  ctx.lineTo(12 * cameraZoom, -20 * cameraZoom);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#8b0000";
  ctx.font = `bold ${12 * cameraZoom}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("!", 0, -23 * cameraZoom);
  ctx.restore();
}

// ============================================================================
// SIMPLE HAZARD TYPES (for backwards compatibility)
// ============================================================================

function drawSimpleLavaHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  const lavaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  lavaGrad.addColorStop(0, "#ff6600");
  lavaGrad.addColorStop(0.3, "#ff4400");
  lavaGrad.addColorStop(0.7, "#cc2200");
  lavaGrad.addColorStop(1, "#880000");

  ctx.fillStyle = lavaGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bubbles
  ctx.fillStyle = "#ffaa00";
  for (let i = 0; i < 5; i++) {
    const bubblePhase = (time + i * 0.7) % 2;
    const bubbleSize = (3 + Math.sin(time * 3 + i) * 2) * zoom * (1 - bubblePhase * 0.5);
    const bubbleX = Math.cos(i * 1.3) * size * 0.5;
    const bubbleY = Math.sin(i * 1.7) * size * 0.25 - bubblePhase * 5 * zoom;

    if (bubblePhase < 1.5) {
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSimpleSwampHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  const swampGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  swampGrad.addColorStop(0, "#4a5d23");
  swampGrad.addColorStop(0.5, "#3d4d1f");
  swampGrad.addColorStop(1, "#2d3d15");

  ctx.fillStyle = swampGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bubbles
  ctx.fillStyle = "rgba(100, 130, 60, 0.6)";
  for (let i = 0; i < 4; i++) {
    const bubbleTime = (time * 0.8 + i * 0.5) % 2;
    if (bubbleTime < 0.3) {
      const bubbleX = Math.cos(i * 2.5) * size * 0.4;
      const bubbleY = Math.sin(i * 2.5) * size * 0.2;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY - bubbleTime * 10 * zoom, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSimpleIceHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  const iceGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  iceGrad.addColorStop(0, "#e0f0ff");
  iceGrad.addColorStop(0.5, "#a0d0ff");
  iceGrad.addColorStop(1, "#70b0e0");

  ctx.fillStyle = iceGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cracks
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * size * 0.7, Math.sin(angle) * size * 0.35);
    ctx.stroke();
  }

  // Shimmer
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.15, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

function drawSimplePoisonHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  const poisonGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  poisonGrad.addColorStop(0, "#80ff80");
  poisonGrad.addColorStop(0.4, "#40cc40");
  poisonGrad.addColorStop(0.8, "#208820");
  poisonGrad.addColorStop(1, "#105510");

  ctx.fillStyle = poisonGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Toxic bubbles
  ctx.fillStyle = "#aaff00";
  for (let i = 0; i < 6; i++) {
    const bubblePhase = (time * 1.2 + i * 0.4) % 1.5;
    const bubbleX = Math.cos(i * 1.1) * size * 0.5;
    const bubbleY = Math.sin(i * 1.1) * size * 0.25 - bubblePhase * 15 * zoom;
    const bubbleSize = 3 * zoom * (1 - bubblePhase / 1.5);

    if (bubblePhase < 1.2) {
      ctx.globalAlpha = 1 - bubblePhase / 1.5;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawSimpleFireHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  // Scorched ground
  ctx.fillStyle = "#3d2817";
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flames
  for (let i = 0; i < 5; i++) {
    const flameX = Math.cos(i * 1.3) * size * 0.4;
    const flameY = Math.sin(i * 1.3) * size * 0.2;
    const flameHeight = (15 + Math.sin(time * 5 + i) * 5) * zoom;

    const flameGrad = ctx.createLinearGradient(flameX, flameY, flameX, flameY - flameHeight);
    flameGrad.addColorStop(0, "#ff4400");
    flameGrad.addColorStop(0.3, "#ff8800");
    flameGrad.addColorStop(0.7, "#ffcc00");
    flameGrad.addColorStop(1, "rgba(255, 255, 200, 0)");

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(flameX - 5 * zoom, flameY);
    ctx.quadraticCurveTo(
      flameX - 3 * zoom + Math.sin(time * 8 + i) * 2 * zoom,
      flameY - flameHeight * 0.5,
      flameX + Math.sin(time * 10 + i) * 3 * zoom,
      flameY - flameHeight
    );
    ctx.quadraticCurveTo(
      flameX + 3 * zoom + Math.sin(time * 8 + i) * 2 * zoom,
      flameY - flameHeight * 0.5,
      flameX + 5 * zoom,
      flameY
    );
    ctx.fill();
  }
}

function drawSimpleLightningHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  const chargedGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  chargedGrad.addColorStop(0, "#4080c0");
  chargedGrad.addColorStop(0.5, "#305090");
  chargedGrad.addColorStop(1, "#203060");

  ctx.fillStyle = chargedGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Electric arcs
  if (Math.sin(time * 20) > 0.9) {
    ctx.strokeStyle = "#88ccff";
    ctx.lineWidth = 2 * zoom;
    ctx.shadowColor = "#00aaff";
    ctx.shadowBlur = 10;

    for (let i = 0; i < 2; i++) {
      const startX = (Math.random() - 0.5) * size;
      const startY = (Math.random() - 0.5) * size * 0.5;
      const endX = (Math.random() - 0.5) * size;
      const endY = (Math.random() - 0.5) * size * 0.5;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 10 * zoom;
      const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 5 * zoom;
      ctx.lineTo(midX, midY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }
}

function drawSimpleVoidHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  voidGrad.addColorStop(0, "#000000");
  voidGrad.addColorStop(0.4, "#1a0a2e");
  voidGrad.addColorStop(0.7, "#2d1b4e");
  voidGrad.addColorStop(1, "#3d2b5e");

  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling particles
  ctx.fillStyle = "#8844cc";
  for (let i = 0; i < 8; i++) {
    const angle = time + (i / 8) * Math.PI * 2;
    const radius = size * 0.3 + Math.sin(time * 2 + i) * size * 0.1;
    const particleX = Math.cos(angle) * radius;
    const particleY = Math.sin(angle) * radius * 0.5;

    ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
    ctx.beginPath();
    ctx.arc(particleX, particleY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSimpleSpikesHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  // Base platform
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spikes
  const spikeExtend = (Math.sin(time * 3) + 1) * 0.5;
  const spikeHeight = 15 * zoom * spikeExtend;

  ctx.fillStyle = "#808080";
  for (let i = 0; i < 7; i++) {
    const spikeX = (i - 3) * size * 0.25;
    const spikeY = -spikeHeight;

    if (spikeExtend > 0.1) {
      ctx.beginPath();
      ctx.moveTo(spikeX - 3 * zoom, 0);
      ctx.lineTo(spikeX, spikeY);
      ctx.lineTo(spikeX + 3 * zoom, 0);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawGenericHazard(ctx: CanvasRenderingContext2D, size: number, time: number, zoom: number): void {
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;

  ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 0, 0, ${pulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Warning symbol
  ctx.fillStyle = "#ff4444";
  ctx.font = `${size * 0.4}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⚠", 0, 0);
}
