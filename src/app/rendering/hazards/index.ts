// Princeton Tower Defense - Hazards Rendering Module
// Renders map hazards like poison fog, lava geysers, ice sheets, quicksand

import type { Position, MapHazard } from "../../types";
import { worldToScreen, gridToWorld } from "../../utils";
import { TILE_SIZE, ISO_Y_RATIO } from "../../constants";
import { drawOrganicBlobAt } from "../helpers";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Draws an organic blob at the current context origin (hazards use ctx.translate before calling). */
function drawOrganicBlob(
  ctx: CanvasRenderingContext2D,
  radiusX: number,
  radiusY: number,
  seed: number,
  bumpiness: number = 0.15,
): void {
  drawOrganicBlobAt(ctx, 0, 0, radiusX, radiusY, seed, bumpiness);
}

function seededNoise(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

interface IceSpikeProfile {
  angle: number;
  dist: number;
  width: number;
  height: number;
  lean: number;
  phase: number;
}

interface IceRimShardProfile {
  angle: number;
  dist: number;
  width: number;
  height: number;
}

interface IceSpikesLayout {
  spikes: IceSpikeProfile[];
  rimShards: IceRimShardProfile[];
  crackAngles: number[];
}

interface IceSpikesCycleState {
  extend: number;
  active: boolean;
  burst: boolean;
}

const iceSpikesLayoutCache = new Map<string, IceSpikesLayout>();

function getIceSpikesLayout(pos: Position): IceSpikesLayout {
  const cacheKey = `${(pos.x || 0).toFixed(2)}:${(pos.y || 0).toFixed(2)}`;
  const cached = iceSpikesLayoutCache.get(cacheKey);
  if (cached) return cached;

  const seed = (pos.x || 0) * 47.3 + (pos.y || 0) * 21.9;

  const spikes: IceSpikeProfile[] = [];
  const spikeCount = 18;
  for (let i = 0; i < spikeCount; i++) {
    spikes.push({
      angle: seededNoise(seed + i * 4.13) * Math.PI * 2,
      dist: 0.08 + seededNoise(seed + i * 7.41 + 1.4) * 0.78,
      width: seededNoise(seed + i * 9.87 + 2.9),
      height: seededNoise(seed + i * 12.31 + 0.7),
      lean: seededNoise(seed + i * 15.73 + 3.6),
      phase: seededNoise(seed + i * 5.21 + 0.4),
    });
  }

  const rimShards: IceRimShardProfile[] = [];
  for (let i = 0; i < 22; i++) {
    rimShards.push({
      angle: (i / 22) * Math.PI * 2 + (seededNoise(seed + i * 17.3) - 0.5) * 0.45,
      dist: 0.78 + seededNoise(seed + i * 6.6) * 0.32,
      width: seededNoise(seed + i * 2.7),
      height: seededNoise(seed + i * 3.9),
    });
  }

  const crackAngles: number[] = [];
  for (let i = 0; i < 12; i++) {
    crackAngles.push((i / 12) * Math.PI * 2 + (seededNoise(seed + i * 4.2) - 0.5) * 0.45);
  }

  const layout: IceSpikesLayout = { spikes, rimShards, crackAngles };
  iceSpikesLayoutCache.set(cacheKey, layout);

  // Keep cache bounded for long sessions with many custom levels.
  if (iceSpikesLayoutCache.size > 160) {
    const oldestKey = iceSpikesLayoutCache.keys().next().value;
    if (oldestKey) iceSpikesLayoutCache.delete(oldestKey);
  }

  return layout;
}

function getIceSpikesCycleState(seed: number, timeSeconds: number): IceSpikesCycleState {
  const cycleDuration = 2.6;
  const phaseOffset = ((seed * 0.071) % cycleDuration + cycleDuration) % cycleDuration;
  const phase = (timeSeconds + phaseOffset) % cycleDuration;

  // Telegraph -> shoot-up -> active -> retract -> dormant
  if (phase < 0.45) {
    const wobble = 0.08 + Math.sin((phase / 0.45) * Math.PI * 2) * 0.03;
    return { extend: Math.max(0.04, wobble), active: false, burst: false };
  }
  if (phase < 0.68) {
    const p = (phase - 0.45) / 0.23;
    return { extend: 0.14 + p * 0.86, active: true, burst: true };
  }
  if (phase < 1.25) {
    const p = (phase - 0.68) / 0.57;
    return {
      extend: 0.94 + Math.sin(p * Math.PI * 2) * 0.06,
      active: true,
      burst: false,
    };
  }
  if (phase < 1.55) {
    const p = (phase - 1.25) / 0.3;
    return { extend: 1 - p * 0.92, active: true, burst: false };
  }
  return { extend: 0.05, active: false, burst: false };
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
  const isoRatio = ISO_Y_RATIO;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);

  switch (hazard.type) {
    case "poison_fog":
      drawPoisonFogHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "lava_geyser":
    // Legacy alias: kept for old custom level data.
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
    case "deep_water":
      drawDeepWaterHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "maelstrom":
      drawMaelstromHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "storm_field":
      drawStormFieldHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "volcano":
      drawVolcanoHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "lava":
      drawSimpleLavaHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "swamp":
      drawSimpleSwampHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "ice":
      drawSimpleIceHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "poison":
      drawSimplePoisonHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "fire":
      drawSimpleFireHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "lightning":
      drawSimpleLightningHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "void":
      drawSimpleVoidHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
      break;
    case "ice_spikes":
    case "spikes":
      drawIceSpikesHazard(ctx, sRad, time, hazard.pos, isoRatio, zoom);
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

interface LavaGeyserLayout {
  crackAngles: number[];
  crackLengths: number[];
  crackJitter: number[];
  backRocks: { angle: number; offset: number; h: number; w: number; taper: number }[];
  frontRocks: { angle: number; offset: number; h: number; w: number; taper: number }[];
  lavaFlows: { angle: number; length: number; width: number; curvature: number }[];
  secondaryPools: { angle: number; dist: number; size: number }[];
}

const lavaGeyserLayoutCache = new Map<string, LavaGeyserLayout>();

function getLavaGeyserLayout(pos: Position): LavaGeyserLayout {
  const cacheKey = `lg:${(pos.x || 0).toFixed(2)}:${(pos.y || 0).toFixed(2)}`;
  const cached = lavaGeyserLayoutCache.get(cacheKey);
  if (cached) return cached;

  const seed = (pos.x || 0) * 13.7 + (pos.y || 0) * 29.3;

  const crackAngles: number[] = [];
  const crackLengths: number[] = [];
  const crackJitter: number[] = [];
  for (let i = 0; i < 16; i++) {
    crackAngles.push((i / 16) * Math.PI * 2 + (seededNoise(seed + i * 3.7) - 0.5) * 0.35);
    crackLengths.push(0.35 + seededNoise(seed + i * 5.1) * 0.55);
    crackJitter.push(seededNoise(seed + i * 8.3) - 0.5);
  }

  const backRocks: LavaGeyserLayout["backRocks"] = [];
  for (let r = 0; r < 7; r++) {
    backRocks.push({
      angle: Math.PI + (r / 7) * Math.PI + (seededNoise(seed + r * 4.1) - 0.5) * 0.2,
      offset: seededNoise(seed + r * 3.0) * 0.18,
      h: 14 + seededNoise(seed + r * 6.2) * 18,
      w: 5 + seededNoise(seed + r * 2.1) * 5,
      taper: 0.55 + seededNoise(seed + r * 9.3) * 0.2,
    });
  }

  const frontRocks: LavaGeyserLayout["frontRocks"] = [];
  for (let r = 0; r < 7; r++) {
    frontRocks.push({
      angle: (r / 7) * Math.PI + (seededNoise(seed + r * 5.5) - 0.5) * 0.15,
      offset: seededNoise(seed + r * 7.1) * 0.18,
      h: 10 + seededNoise(seed + r * 4.7) * 14,
      w: 4 + seededNoise(seed + r * 3.3) * 4,
      taper: 0.5 + seededNoise(seed + r * 11.1) * 0.25,
    });
  }

  const lavaFlows: LavaGeyserLayout["lavaFlows"] = [];
  for (let f = 0; f < 4; f++) {
    lavaFlows.push({
      angle: (f / 4) * Math.PI * 2 + seededNoise(seed + f * 12.7) * 0.6,
      length: 0.4 + seededNoise(seed + f * 7.9) * 0.5,
      width: 0.03 + seededNoise(seed + f * 14.3) * 0.04,
      curvature: (seededNoise(seed + f * 19.1) - 0.5) * 0.4,
    });
  }

  const secondaryPools: LavaGeyserLayout["secondaryPools"] = [];
  for (let p = 0; p < 3; p++) {
    secondaryPools.push({
      angle: (p / 3) * Math.PI * 2 + seededNoise(seed + p * 21.3) * 0.8,
      dist: 0.55 + seededNoise(seed + p * 16.7) * 0.35,
      size: 0.08 + seededNoise(seed + p * 23.1) * 0.07,
    });
  }

  const layout: LavaGeyserLayout = {
    crackAngles, crackLengths, crackJitter,
    backRocks, frontRocks, lavaFlows, secondaryPools,
  };
  lavaGeyserLayoutCache.set(cacheKey, layout);

  if (lavaGeyserLayoutCache.size > 120) {
    const oldestKey = lavaGeyserLayoutCache.keys().next().value;
    if (oldestKey) lavaGeyserLayoutCache.delete(oldestKey);
  }

  return layout;
}

interface LavaGeyserCycleState {
  cycleTime: number;
  isErupting: boolean;
  buildUp: boolean;
  eruptionIntensity: number;
  dormantGlow: number;
}

function getLavaGeyserCycleState(seed: number, time: number): LavaGeyserCycleState {
  const cycleDuration = 5;
  const phaseOffset = ((seed * 0.037) % cycleDuration + cycleDuration) % cycleDuration;
  const cycleTime = (time + phaseOffset) % cycleDuration;
  const isErupting = cycleTime < 1.4;
  const buildUp = cycleTime > 3.8;
  const eruptionIntensity = isErupting ? Math.sin((cycleTime / 1.4) * Math.PI) : 0;
  const dormantGlow = (!isErupting && !buildUp)
    ? 0.3 + Math.sin(time * 1.5 + seed * 0.1) * 0.1
    : 0;
  return { cycleTime, isErupting, buildUp, eruptionIntensity, dormantGlow };
}

function drawLavaGeyserHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 13.7 + (pos.y || 0) * 29.3;
  const layout = getLavaGeyserLayout(pos);
  const cycle = getLavaGeyserCycleState(hazSeed, time);
  const lavaIso = ISO_Y_RATIO;
  const ventWidth = sRad * 0.8;

  drawLavaGeyserScorchedEarth(ctx, sRad, lavaIso, hazSeed, cycle, cameraZoom);
  drawLavaGeyserCracks(ctx, sRad, lavaIso, layout, time, cycle, cameraZoom);
  drawLavaGeyserFlows(ctx, sRad, lavaIso, layout, time, cycle, cameraZoom);
  drawLavaGeyserSecondaryPools(ctx, sRad, lavaIso, layout, time, cycle, cameraZoom);
  drawLavaGeyserBackRocks(ctx, ventWidth, lavaIso, layout, cycle, cameraZoom);
  drawLavaGeyserMagmaPool(ctx, ventWidth, lavaIso, hazSeed, time, cycle, cameraZoom);
  drawLavaGeyserFrontRocks(ctx, ventWidth, lavaIso, layout, cycle, cameraZoom);
  drawLavaGeyserEruption(ctx, sRad, ventWidth, lavaIso, time, cycle, cameraZoom);
  drawLavaGeyserSmoke(ctx, sRad, lavaIso, hazSeed, time, cycle, cameraZoom);
  drawLavaGeyserEmbers(ctx, sRad, hazSeed, time, cycle, cameraZoom);
  drawLavaGeyserHeatShimmer(ctx, sRad, lavaIso, time, cycle, cameraZoom);
}

function drawLavaGeyserScorchedEarth(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  lavaIso: number,
  hazSeed: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const glowBoost = cycle.buildUp ? 0.12 : cycle.eruptionIntensity * 0.15;

  // Outer heat stain
  const heatStain = ctx.createRadialGradient(0, 0, sRad * 0.6, 0, 0, sRad * 1.6);
  heatStain.addColorStop(0, `rgba(80, 30, 10, ${0.35 + glowBoost})`);
  heatStain.addColorStop(0.5, `rgba(50, 18, 6, ${0.22 + glowBoost * 0.5})`);
  heatStain.addColorStop(1, "transparent");
  ctx.fillStyle = heatStain;
  drawOrganicBlob(ctx, sRad * 1.55, sRad * 1.45 * lavaIso, hazSeed + 200, 0.24);
  ctx.fill();

  // Core scorched earth
  const scorchGrad = ctx.createRadialGradient(0, 0, sRad * 0.2, 0, 0, sRad * 1.3);
  scorchGrad.addColorStop(0, `rgba(70, 32, 12, ${0.95 + glowBoost})`);
  scorchGrad.addColorStop(0.3, "rgba(55, 25, 10, 0.88)");
  scorchGrad.addColorStop(0.6, "rgba(40, 18, 8, 0.65)");
  scorchGrad.addColorStop(0.85, "rgba(28, 12, 5, 0.35)");
  scorchGrad.addColorStop(1, "transparent");
  ctx.fillStyle = scorchGrad;
  drawOrganicBlob(ctx, sRad * 1.35, sRad * 1.3 * lavaIso, hazSeed, 0.2);
  ctx.fill();

  // Charred texture spots
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + seededNoise(hazSeed + i * 11) * 0.4;
    const dist = sRad * (0.5 + seededNoise(hazSeed + i * 7) * 0.5);
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist * lavaIso;
    const spotR = (4 + seededNoise(hazSeed + i * 13) * 6) * cameraZoom;

    ctx.fillStyle = `rgba(25, 10, 4, ${0.3 + seededNoise(hazSeed + i * 9) * 0.25})`;
    drawOrganicBlobAt(ctx, sx, sy, spotR, spotR * lavaIso, hazSeed + i * 17, 0.2);
    ctx.fill();
  }
}

function drawLavaGeyserCracks(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  lavaIso: number,
  layout: LavaGeyserLayout,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const glowPulse = 0.35 + Math.sin(time * 2.2) * 0.1 +
    cycle.eruptionIntensity * 0.35 +
    (cycle.buildUp ? 0.2 : 0) +
    cycle.dormantGlow * 0.15;

  for (let c = 0; c < layout.crackAngles.length; c++) {
    const angle = layout.crackAngles[c];
    const len = sRad * layout.crackLengths[c];
    const jitter = layout.crackJitter[c];

    // Dark crack line
    ctx.strokeStyle = `rgba(30, 8, 2, 0.55)`;
    ctx.lineWidth = 2.5 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * sRad * 0.3,
      Math.sin(angle) * sRad * 0.3 * lavaIso,
    );
    const midAngle = angle + jitter * 0.2;
    ctx.quadraticCurveTo(
      Math.cos(midAngle) * len * 0.55,
      Math.sin(midAngle) * len * 0.55 * lavaIso,
      Math.cos(angle + jitter * 0.08) * len,
      Math.sin(angle + jitter * 0.08) * len * lavaIso,
    );
    ctx.stroke();

    // Inner lava glow
    ctx.strokeStyle = `rgba(255, 120, 20, ${glowPulse})`;
    ctx.lineWidth = 1.4 * cameraZoom;
    ctx.stroke();
  }
}

function drawLavaGeyserFlows(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  lavaIso: number,
  layout: LavaGeyserLayout,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const flowPulse = 0.6 + Math.sin(time * 1.8) * 0.15 + cycle.eruptionIntensity * 0.25;

  for (const flow of layout.lavaFlows) {
    const startR = sRad * 0.32;
    const endR = sRad * flow.length;
    const angle = flow.angle;
    const midAngle = angle + flow.curvature;
    const flowWidth = sRad * flow.width;
    const animOffset = Math.sin(time * 1.2 + flow.angle * 3) * 2 * cameraZoom;

    const sx = Math.cos(angle) * startR;
    const sy = Math.sin(angle) * startR * lavaIso;
    const midX = Math.cos(midAngle) * (startR + endR) * 0.5;
    const midY = Math.sin(midAngle) * (startR + endR) * 0.5 * lavaIso + animOffset;
    const ex = Math.cos(angle + flow.curvature * 0.5) * endR;
    const ey = Math.sin(angle + flow.curvature * 0.5) * endR * lavaIso;

    // Dark channel beneath
    ctx.strokeStyle = `rgba(35, 12, 4, 0.6)`;
    ctx.lineWidth = (flowWidth * 2 + 3) * cameraZoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(midX, midY, ex, ey);
    ctx.stroke();

    // Bright lava stream
    const flowGrad = ctx.createLinearGradient(sx, sy, ex, ey);
    flowGrad.addColorStop(0, `rgba(255, 180, 40, ${flowPulse})`);
    flowGrad.addColorStop(0.4, `rgba(255, 110, 15, ${flowPulse * 0.9})`);
    flowGrad.addColorStop(1, `rgba(180, 50, 5, ${flowPulse * 0.5})`);
    ctx.strokeStyle = flowGrad;
    ctx.lineWidth = flowWidth * 2 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(midX, midY, ex, ey);
    ctx.stroke();

    // Hot centerline
    ctx.strokeStyle = `rgba(255, 240, 140, ${flowPulse * 0.55})`;
    ctx.lineWidth = flowWidth * 0.7 * cameraZoom;
    ctx.stroke();
    ctx.lineCap = "butt";
  }
}

function drawLavaGeyserSecondaryPools(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  lavaIso: number,
  layout: LavaGeyserLayout,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const poolGlow = 0.7 + Math.sin(time * 1.4) * 0.1 + cycle.eruptionIntensity * 0.2;

  for (const pool of layout.secondaryPools) {
    const px = Math.cos(pool.angle) * sRad * pool.dist;
    const py = Math.sin(pool.angle) * sRad * pool.dist * lavaIso;
    const pr = sRad * pool.size;

    ctx.save();
    ctx.translate(px, py);

    // Dark rim
    ctx.fillStyle = "rgba(30, 12, 4, 0.7)";
    drawOrganicBlob(ctx, pr * 1.3, pr * 1.3 * lavaIso, pool.angle * 100, 0.2);
    ctx.fill();

    // Molten pool
    const poolGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, pr);
    poolGrad.addColorStop(0, `rgba(255, 200, 60, ${poolGlow})`);
    poolGrad.addColorStop(0.5, `rgba(255, 120, 20, ${poolGlow * 0.85})`);
    poolGrad.addColorStop(1, `rgba(160, 40, 5, ${poolGlow * 0.5})`);
    ctx.fillStyle = poolGrad;
    drawOrganicBlob(ctx, pr, pr * lavaIso, pool.angle * 50, 0.15);
    ctx.fill();

    // Bubble
    const bubblePhase = (time * 1.5 + pool.angle) % 1.8;
    if (bubblePhase < 0.4) {
      const bSize = pr * 0.3 * Math.sin((bubblePhase / 0.4) * Math.PI);
      ctx.fillStyle = `rgba(255, 240, 150, ${0.6 * (1 - bubblePhase / 0.4)})`;
      ctx.beginPath();
      ctx.arc(pr * 0.2, -pr * 0.1, bSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function drawLavaGeyserVentRock(
  ctx: CanvasRenderingContext2D,
  rockX: number,
  rockY: number,
  rockW: number,
  rockH: number,
  taper: number,
  glowAlpha: number,
  cameraZoom: number,
  isFront: boolean,
): void {
  const baseColor = isFront ? 28 : 22;
  const highlightColor = isFront ? 42 : 36;

  // Main body
  ctx.fillStyle = `rgb(${baseColor}, ${baseColor - 4}, ${baseColor - 8})`;
  ctx.beginPath();
  ctx.moveTo(rockX - rockW, rockY);
  ctx.lineTo(rockX - rockW * taper, rockY - rockH);
  ctx.lineTo(rockX + rockW * taper, rockY - rockH);
  ctx.lineTo(rockX + rockW, rockY);
  ctx.closePath();
  ctx.fill();

  // Lit face (right side highlight)
  ctx.fillStyle = `rgb(${highlightColor}, ${highlightColor - 6}, ${highlightColor - 12})`;
  ctx.beginPath();
  ctx.moveTo(rockX + rockW * 0.2, rockY - 2 * cameraZoom);
  ctx.lineTo(rockX + rockW * taper * 0.5, rockY - rockH + 1 * cameraZoom);
  ctx.lineTo(rockX + rockW * taper, rockY - rockH);
  ctx.lineTo(rockX + rockW, rockY);
  ctx.closePath();
  ctx.fill();

  // Inner edge glow from magma heat
  ctx.strokeStyle = `rgba(255, 80, 10, ${glowAlpha})`;
  ctx.lineWidth = 1.8 * cameraZoom;
  ctx.beginPath();
  ctx.moveTo(rockX - rockW, rockY);
  ctx.lineTo(rockX - rockW * taper, rockY - rockH);
  ctx.stroke();

  // Top edge hot rim
  ctx.strokeStyle = `rgba(255, 140, 40, ${glowAlpha * 0.6})`;
  ctx.lineWidth = 1.2 * cameraZoom;
  ctx.beginPath();
  ctx.moveTo(rockX - rockW * taper, rockY - rockH);
  ctx.lineTo(rockX + rockW * taper, rockY - rockH);
  ctx.stroke();
}

function drawLavaGeyserBackRocks(
  ctx: CanvasRenderingContext2D,
  ventWidth: number,
  lavaIso: number,
  layout: LavaGeyserLayout,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const glowAlpha = 0.25 + cycle.eruptionIntensity * 0.4 + (cycle.buildUp ? 0.15 : 0) + cycle.dormantGlow * 0.1;

  for (const rock of layout.backRocks) {
    const rx = Math.cos(rock.angle) * ventWidth * (0.5 + rock.offset);
    const ry = Math.sin(rock.angle) * ventWidth * (0.3 + rock.offset * 0.5) * lavaIso;
    drawLavaGeyserVentRock(
      ctx, rx, ry,
      rock.w * cameraZoom, rock.h * cameraZoom,
      rock.taper, glowAlpha, cameraZoom, false,
    );
  }
}

function drawLavaGeyserMagmaPool(
  ctx: CanvasRenderingContext2D,
  ventWidth: number,
  lavaIso: number,
  hazSeed: number,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const poolY = -6 * cameraZoom;
  const poolRx = ventWidth * 0.48;
  const poolRy = ventWidth * 0.27 * lavaIso;
  const intensity = cycle.buildUp ? 1.35 : (cycle.isErupting ? 1.5 : 1);
  const whiteHot = cycle.buildUp ? 220 : (cycle.isErupting ? 250 : 120);

  ctx.save();
  ctx.translate(0, poolY);

  // Depth shadow beneath magma
  ctx.fillStyle = "rgba(20, 5, 0, 0.6)";
  drawOrganicBlobAt(ctx, 0, 4 * cameraZoom, poolRx * 1.05, poolRy * 0.9, hazSeed + 110, 0.08);
  ctx.fill();

  // Main magma body
  if (cycle.buildUp || cycle.isErupting) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = (22 + cycle.eruptionIntensity * 35) * cameraZoom;
  }
  const magmaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, poolRx);
  magmaGrad.addColorStop(0, `rgba(255, 255, ${whiteHot}, ${intensity})`);
  magmaGrad.addColorStop(0.25, `rgba(255, 180, 40, ${intensity * 0.95})`);
  magmaGrad.addColorStop(0.55, "#ee5500");
  magmaGrad.addColorStop(0.8, "#aa2800");
  magmaGrad.addColorStop(1, "#661100");
  ctx.fillStyle = magmaGrad;
  drawOrganicBlob(ctx, poolRx, poolRy, hazSeed + 100, 0.1);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Cooling crust patches that drift
  for (let crust = 0; crust < 5; crust++) {
    const crustAngle = time * 0.25 + crust * 1.26 + hazSeed * 0.01;
    const crustDist = poolRx * (0.2 + crust * 0.1);
    const cx = Math.cos(crustAngle) * crustDist * 0.7;
    const cy = Math.sin(crustAngle) * crustDist * 0.35 * lavaIso;
    const crustSize = (3 + seededNoise(hazSeed + crust * 5) * 4) * cameraZoom;

    ctx.fillStyle = `rgba(50, 20, 8, ${0.35 + Math.sin(time + crust) * 0.1})`;
    drawOrganicBlobAt(ctx, cx, cy, crustSize, crustSize * lavaIso, hazSeed + crust * 19, 0.25);
    ctx.fill();
  }

  // Convection current lines
  ctx.lineWidth = 1.5 * cameraZoom;
  for (let conv = 0; conv < 4; conv++) {
    const convAngle = time * 0.4 + conv * 1.57;
    const convR = poolRx * (0.15 + conv * 0.08);
    const convAlpha = 0.45 + Math.sin(time * 2 + conv) * 0.15;
    ctx.strokeStyle = `rgba(255, 210, 70, ${convAlpha})`;
    ctx.beginPath();
    ctx.arc(
      Math.cos(convAngle) * convR * 0.35,
      Math.sin(convAngle) * convR * 0.18 * lavaIso,
      convR * 0.28,
      0, Math.PI * 1.4,
    );
    ctx.stroke();
  }

  // Magma bubbles
  for (let b = 0; b < 4; b++) {
    const bPhase = (time * 2.0 + b * 0.55 + hazSeed * 0.01) % 1.2;
    if (bPhase < 0.5) {
      const bProgress = bPhase / 0.5;
      const bAngle = b * 1.6 + hazSeed * 0.05;
      const bx = Math.cos(bAngle) * poolRx * 0.35;
      const by = Math.sin(bAngle) * poolRy * 0.35;
      const bSize = (2.5 + b) * cameraZoom * Math.sin(bProgress * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 160, ${0.65 * (1 - bProgress)})`;
      ctx.beginPath();
      ctx.arc(bx, by - bProgress * 4 * cameraZoom, bSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawLavaGeyserFrontRocks(
  ctx: CanvasRenderingContext2D,
  ventWidth: number,
  lavaIso: number,
  layout: LavaGeyserLayout,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const glowAlpha = 0.3 + cycle.eruptionIntensity * 0.45 + (cycle.buildUp ? 0.2 : 0) + cycle.dormantGlow * 0.15;

  for (const rock of layout.frontRocks) {
    const rx = Math.cos(rock.angle) * ventWidth * (0.5 + rock.offset);
    const ry = Math.sin(rock.angle) * ventWidth * (0.3 + rock.offset * 0.5) * lavaIso;
    drawLavaGeyserVentRock(
      ctx, rx, ry,
      rock.w * cameraZoom, rock.h * cameraZoom,
      rock.taper, glowAlpha, cameraZoom, true,
    );
  }
}

function drawLavaGeyserEruption(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  ventWidth: number,
  lavaIso: number,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  // Build-up ground pulse
  if (cycle.buildUp) {
    const pulsePhase = ((cycle.cycleTime - 3.8) / 1.2);
    const pulseAlpha = 0.08 + pulsePhase * 0.12;
    const pulseRx = sRad * (1 + pulsePhase * 0.15);
    ctx.fillStyle = `rgba(255, 100, 20, ${pulseAlpha})`;
    drawOrganicBlob(ctx, pulseRx, pulseRx * lavaIso, 307, 0.15);
    ctx.fill();
  }

  if (!cycle.isErupting) return;

  const ei = cycle.eruptionIntensity;
  const columnHeight = ei * 140 * cameraZoom;
  const columnBaseWidth = 18 * cameraZoom * ei;

  // Eruption glow on ground
  ctx.save();
  ctx.fillStyle = `rgba(255, 140, 30, ${ei * 0.2})`;
  drawOrganicBlob(ctx, sRad * 1.2, sRad * 1.2 * lavaIso, 419, 0.12);
  ctx.fill();

  // Main lava column (wider, more organic)
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 35 * cameraZoom;
  const columnGrad = ctx.createLinearGradient(0, -8 * cameraZoom, 0, -columnHeight);
  columnGrad.addColorStop(0, "rgba(255, 240, 120, 1)");
  columnGrad.addColorStop(0.12, "#ffaa00");
  columnGrad.addColorStop(0.3, "#ff6600");
  columnGrad.addColorStop(0.55, "#ee3300");
  columnGrad.addColorStop(0.8, "rgba(200, 40, 0, 0.45)");
  columnGrad.addColorStop(1, "transparent");
  ctx.fillStyle = columnGrad;

  const wobble1 = Math.sin(time * 18) * 6 * cameraZoom;
  const wobble2 = Math.sin(time * 18 + 1.5) * 6 * cameraZoom;
  const wobble3 = Math.sin(time * 22 + 0.7) * 4 * cameraZoom;

  ctx.beginPath();
  ctx.moveTo(-columnBaseWidth, -8 * cameraZoom);
  ctx.bezierCurveTo(
    -columnBaseWidth * 0.8 + wobble1, -columnHeight * 0.3,
    -columnBaseWidth * 0.3 + wobble3, -columnHeight * 0.65,
    wobble1 * 0.3, -columnHeight,
  );
  ctx.bezierCurveTo(
    columnBaseWidth * 0.3 + wobble2, -columnHeight * 0.65,
    columnBaseWidth * 0.8 + wobble2, -columnHeight * 0.3,
    columnBaseWidth, -8 * cameraZoom,
  );
  ctx.closePath();
  ctx.fill();

  // Inner bright core of column
  ctx.shadowBlur = 0;
  const coreGrad = ctx.createLinearGradient(0, -8 * cameraZoom, 0, -columnHeight * 0.7);
  coreGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
  coreGrad.addColorStop(0.3, "rgba(255, 220, 100, 0.5)");
  coreGrad.addColorStop(1, "transparent");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(-columnBaseWidth * 0.35, -8 * cameraZoom);
  ctx.quadraticCurveTo(
    wobble3 * 0.3, -columnHeight * 0.4,
    wobble1 * 0.15, -columnHeight * 0.7,
  );
  ctx.quadraticCurveTo(
    wobble2 * 0.3, -columnHeight * 0.4,
    columnBaseWidth * 0.35, -8 * cameraZoom,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Lava bombs with trails
  for (let bomb = 0; bomb < 12; bomb++) {
    const bombPhase = (cycle.cycleTime + bomb * 0.09) % 1.4;
    if (bombPhase >= 1.2) continue;
    const bombAngle = (bomb / 12) * Math.PI * 2 + time * 0.5 + bomb * 0.37;
    const bombDist = bombPhase * sRad * 1.6;
    const bombGravity = bombPhase * bombPhase * 50 * cameraZoom;
    const bombHeight = Math.sin(bombPhase / 1.2 * Math.PI) * 95 * cameraZoom - bombGravity * 0.3;
    const bombX = Math.cos(bombAngle) * bombDist;
    const bombY = Math.sin(bombAngle) * bombDist * lavaIso - bombHeight;
    const bombSize = (5.5 - bombPhase * 2.5) * cameraZoom;
    const bombAlpha = 1 - (bombPhase / 1.2);

    // Bomb trail
    ctx.strokeStyle = `rgba(255, 140, 20, ${bombAlpha * 0.35})`;
    ctx.lineWidth = bombSize * 0.6;
    ctx.beginPath();
    const prevPhase = Math.max(0, bombPhase - 0.08);
    const prevDist = prevPhase * sRad * 1.6;
    const prevHeight = Math.sin(prevPhase / 1.2 * Math.PI) * 95 * cameraZoom - prevPhase * prevPhase * 50 * cameraZoom * 0.3;
    ctx.moveTo(
      Math.cos(bombAngle) * prevDist,
      Math.sin(bombAngle) * prevDist * lavaIso - prevHeight,
    );
    ctx.lineTo(bombX, bombY);
    ctx.stroke();

    // Bomb body
    ctx.save();
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 8 * cameraZoom;
    const bGrad = ctx.createRadialGradient(bombX, bombY, 0, bombX, bombY, bombSize);
    bGrad.addColorStop(0, `rgba(255, 240, 120, ${bombAlpha})`);
    bGrad.addColorStop(0.4, `rgba(255, 140, 20, ${bombAlpha * 0.9})`);
    bGrad.addColorStop(1, `rgba(180, 40, 0, ${bombAlpha * 0.5})`);
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(bombX, bombY, bombSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Sparks shower at eruption peak
  if (ei > 0.4) {
    for (let spark = 0; spark < 16; spark++) {
      const sparkPhase = (cycle.cycleTime * 3 + spark * 0.17) % 1;
      const sparkAngle = spark * 0.94 + time * 8;
      const sparkDist = sparkPhase * sRad * 0.9;
      const sparkHeight = (1 - sparkPhase) * 60 * cameraZoom * ei + 10 * cameraZoom;
      const sx = Math.cos(sparkAngle) * sparkDist;
      const sy = Math.sin(sparkAngle) * sparkDist * lavaIso - sparkHeight;
      const sparkSize = (1.2 + (spark % 3) * 0.4) * cameraZoom * (1 - sparkPhase);

      ctx.fillStyle = `rgba(255, ${200 + spark * 3}, ${80 + spark * 8}, ${(1 - sparkPhase) * ei * 0.8})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLavaGeyserSmoke(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  lavaIso: number,
  hazSeed: number,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const smokeCount = cycle.isErupting ? 8 : 4;
  for (let s = 0; s < smokeCount; s++) {
    const smokePhase = (time * 0.4 + s * 0.45 + seededNoise(hazSeed + s * 3) * 2) % 3.5;
    const smokeAngle = s * 1.1 + hazSeed * 0.02;
    const driftX = Math.sin(time * 0.3 + s) * sRad * 0.15;
    const smokeX = Math.cos(smokeAngle) * sRad * 0.12 + driftX;
    const smokeY = -smokePhase * 45 * cameraZoom - 10 * cameraZoom;
    const smokeSize = (4 + smokePhase * 6 + s * 1.5) * cameraZoom;
    const smokeAlpha = (0.22 + cycle.eruptionIntensity * 0.15) * (1 - smokePhase / 3.5);

    const smokeGrad = ctx.createRadialGradient(smokeX, smokeY, 0, smokeX, smokeY, smokeSize);
    smokeGrad.addColorStop(0, `rgba(60, 48, 38, ${smokeAlpha})`);
    smokeGrad.addColorStop(0.6, `rgba(45, 35, 28, ${smokeAlpha * 0.6})`);
    smokeGrad.addColorStop(1, "transparent");
    ctx.fillStyle = smokeGrad;
    drawOrganicBlobAt(ctx, smokeX, smokeY, smokeSize, smokeSize * lavaIso, hazSeed + s * 31.7, 0.18);
    ctx.fill();
  }
}

function drawLavaGeyserEmbers(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  hazSeed: number,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const emberCount = cycle.isErupting ? 14 : 8;
  for (let ember = 0; ember < emberCount; ember++) {
    const emberSeed = hazSeed + ember * 4.7;
    const emberPhase = (time * 0.6 + ember * 0.32 + seededNoise(emberSeed) * 2) % 2.5;
    const emberAngle = ember * 0.81 + hazSeed * 0.01;
    const drift = Math.sin(time * 0.8 + ember * 1.3) * sRad * 0.12;
    const emberX = Math.cos(emberAngle) * sRad * 0.2 + drift;
    const emberY = -emberPhase * 50 * cameraZoom - 5 * cameraZoom;
    const emberSize = (1.5 + (ember % 3) * 0.7) * cameraZoom * (1 - emberPhase / 2.5);
    const fadeAlpha = (1 - emberPhase / 2.5);

    const r = 255;
    const g = 140 + Math.floor(seededNoise(emberSeed + 1) * 80);
    const b = Math.floor(seededNoise(emberSeed + 2) * 40);

    ctx.save();
    ctx.shadowColor = `rgba(${r}, ${g}, 0, 0.7)`;
    ctx.shadowBlur = 5 * cameraZoom;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fadeAlpha * 0.85})`;
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawLavaGeyserHeatShimmer(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  lavaIso: number,
  time: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const shimmerAlpha = 0.06 + (cycle.buildUp ? 0.08 : 0) + cycle.eruptionIntensity * 0.1 + cycle.dormantGlow * 0.04;

  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.6 + ring * 0.8) % 2.4;
    const ringProgress = ringPhase / 2.4;
    const ringR = sRad * (0.5 + ringProgress * 0.7);
    const ringAlpha = shimmerAlpha * (1 - ringProgress);

    ctx.strokeStyle = `rgba(255, 160, 50, ${ringAlpha})`;
    ctx.lineWidth = (2.5 - ringProgress * 1.5) * cameraZoom;
    drawOrganicBlob(ctx, ringR, ringR * lavaIso, ring * 41.3, 0.1);
    ctx.stroke();
  }
}

// ============================================================================
// VOLCANO HAZARD
// ============================================================================

function drawVolcanoHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 41.3 + (pos.y || 0) * 23.7;
  const lavaIsoRatio = ISO_Y_RATIO * 0.95;

  // Fireball summon cycle: 7s period, fireball appears at 0-2s
  const cycleTime = (time + seededNoise(hazSeed) * 7) % 7;
  const isSummoning = cycleTime < 2.0;
  const buildUp = cycleTime > 5.5;
  const summonIntensity = isSummoning ? Math.sin((cycleTime / 2.0) * Math.PI) : 0;

  // 1. Volcanic base - dark scorched crater
  const baseGrad = ctx.createRadialGradient(0, 0, sRad * 0.15, 0, 0, sRad * 1.3);
  baseGrad.addColorStop(0, "rgba(80, 35, 10, 0.95)");
  baseGrad.addColorStop(0.35, "rgba(50, 22, 8, 0.88)");
  baseGrad.addColorStop(0.7, "rgba(35, 15, 5, 0.6)");
  baseGrad.addColorStop(1, "transparent");
  ctx.fillStyle = baseGrad;
  drawOrganicBlob(ctx, sRad * 1.3, sRad * 1.2 * lavaIsoRatio, hazSeed, 0.22);
  ctx.fill();

  // 2. Lava veins radiating outward
  for (let vein = 0; vein < 8; vein++) {
    const veinAngle = (vein / 8) * Math.PI * 2 + Math.sin(hazSeed + vein * 3) * 0.25;
    const veinLen = sRad * (0.5 + seededNoise(hazSeed + vein * 7) * 0.4);
    const pulse = 0.3 + Math.sin(time * 2 + vein * 0.9) * 0.15;
    ctx.strokeStyle = `rgba(255, 100, 0, ${pulse + (buildUp ? 0.2 : 0) + summonIntensity * 0.3})`;
    ctx.lineWidth = (2 + Math.sin(hazSeed + vein) * 0.8) * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const midR = veinLen * 0.5;
    const midAngle = veinAngle + (seededNoise(hazSeed + vein * 11) - 0.5) * 0.3;
    ctx.quadraticCurveTo(
      Math.cos(midAngle) * midR,
      Math.sin(midAngle) * midR * lavaIsoRatio,
      Math.cos(veinAngle) * veinLen,
      Math.sin(veinAngle) * veinLen * lavaIsoRatio
    );
    ctx.stroke();
  }

  // 3. Volcanic cone structure (layered trapezoids for 3D effect)
  const coneBase = sRad * 0.7;
  const coneTop = sRad * 0.3;
  const coneHeight = 35 * cameraZoom;

  // Back face of cone
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(-coneBase, 5 * cameraZoom * lavaIsoRatio);
  ctx.lineTo(-coneTop, -coneHeight);
  ctx.lineTo(coneTop, -coneHeight);
  ctx.lineTo(coneBase, 5 * cameraZoom * lavaIsoRatio);
  ctx.closePath();
  ctx.fill();

  // Rocky texture on cone
  for (let rock = 0; rock < 6; rock++) {
    const rx = (seededNoise(hazSeed + rock * 5) - 0.5) * coneBase * 1.2;
    const ry = -seededNoise(hazSeed + rock * 8) * coneHeight * 0.7;
    ctx.fillStyle = `rgba(${40 + rock * 5}, ${25 + rock * 3}, ${10 + rock * 2}, 0.6)`;
    ctx.beginPath();
    ctx.arc(rx, ry, (4 + rock % 3) * cameraZoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cone highlight edge
  ctx.strokeStyle = "rgba(90, 50, 20, 0.5)";
  ctx.lineWidth = 1.5 * cameraZoom;
  ctx.beginPath();
  ctx.moveTo(coneBase, 5 * cameraZoom * lavaIsoRatio);
  ctx.lineTo(coneTop, -coneHeight);
  ctx.stroke();

  // 4. Crater opening with glowing magma
  const craterGrad = ctx.createRadialGradient(0, -coneHeight, 0, 0, -coneHeight, coneTop);
  const glowIntensity = buildUp ? 1.4 : (isSummoning ? 1.6 : 1);
  craterGrad.addColorStop(0, `rgba(255, 220, ${buildUp ? 100 : 60}, ${glowIntensity})`);
  craterGrad.addColorStop(0.4, "rgba(255, 120, 0, 0.9)");
  craterGrad.addColorStop(0.7, "rgba(200, 60, 0, 0.7)");
  craterGrad.addColorStop(1, "rgba(100, 30, 0, 0.3)");

  ctx.save();
  if (buildUp || isSummoning) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = (15 + summonIntensity * 25) * cameraZoom;
  }
  ctx.fillStyle = craterGrad;
  ctx.beginPath();
  ctx.ellipse(0, -coneHeight, coneTop, coneTop * 0.4 * lavaIsoRatio, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Fireball summon effect
  if (isSummoning) {
    const fireballPhase = cycleTime / 2.0;
    // Fireball rises from crater, arcs upward, then plummets down
    const risePhase = Math.min(1, fireballPhase * 2);
    const arcHeight = 90 * cameraZoom * Math.sin(risePhase * Math.PI);
    const fireballY = -coneHeight - arcHeight;
    const driftX = Math.sin(fireballPhase * Math.PI * 3) * sRad * 0.3 * fireballPhase;
    const fireballSize = (8 + summonIntensity * 6) * cameraZoom;

    // Fireball trail
    ctx.save();
    for (let trail = 4; trail >= 0; trail--) {
      const trailT = Math.max(0, risePhase - trail * 0.05);
      const trailArc = 90 * cameraZoom * Math.sin(trailT * Math.PI);
      const trailY = -coneHeight - trailArc;
      const trailX = Math.sin(trailT * Math.PI * 3) * sRad * 0.3 * trailT;
      const trailAlpha = (1 - trail * 0.2) * summonIntensity * 0.5;
      const trailSize = fireballSize * (1 - trail * 0.15);

      ctx.fillStyle = `rgba(255, ${100 + trail * 30}, 0, ${trailAlpha})`;
      ctx.beginPath();
      ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main fireball
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 20 * cameraZoom;
    const fbGrad = ctx.createRadialGradient(driftX, fireballY, 0, driftX, fireballY, fireballSize);
    fbGrad.addColorStop(0, "rgba(255, 255, 200, 1)");
    fbGrad.addColorStop(0.3, "rgba(255, 180, 50, 0.95)");
    fbGrad.addColorStop(0.6, "rgba(255, 100, 0, 0.8)");
    fbGrad.addColorStop(1, "rgba(200, 50, 0, 0.3)");
    ctx.fillStyle = fbGrad;
    ctx.beginPath();
    ctx.arc(driftX, fireballY, fireballSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Smoke trail from fireball
    for (let smoke = 0; smoke < 5; smoke++) {
      const smokeT = Math.max(0, fireballPhase - smoke * 0.06);
      const smokeX = driftX + (seededNoise(hazSeed + smoke * 3) - 0.5) * 15 * cameraZoom;
      const smokeY = fireballY + smoke * 8 * cameraZoom;
      const smokeAlpha = (0.4 - smoke * 0.07) * summonIntensity;

      ctx.fillStyle = `rgba(80, 60, 40, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, (3 + smoke * 1.5) * cameraZoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. Ambient smoke and embers
  for (let ember = 0; ember < 10; ember++) {
    const emberPhase = (time * 0.5 + ember * 0.35 + seededNoise(hazSeed + ember) * 2) % 3;
    const emberAngle = ember * 0.63 + hazSeed * 0.01;
    const emberDist = sRad * 0.15 + seededNoise(hazSeed + ember * 5) * sRad * 0.2;
    const emberX = Math.cos(emberAngle) * emberDist + (seededNoise(hazSeed + ember * 9) - 0.5) * 10 * cameraZoom;
    const emberY = -coneHeight - emberPhase * 35 * cameraZoom;
    const emberSize = (1.8 + (ember % 3) * 0.6) * cameraZoom * (1 - emberPhase / 3);

    if (ember < 5) {
      // Embers
      ctx.fillStyle = `rgba(255, ${160 + ember * 15}, ${50 - ember * 8}, ${0.7 * (1 - emberPhase / 3)})`;
    } else {
      // Smoke
      ctx.fillStyle = `rgba(60, 50, 40, ${0.3 * (1 - emberPhase / 3)})`;
    }
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Heat shimmer around base
  if (buildUp || isSummoning) {
    const shimmerAlpha = buildUp ? 0.12 : summonIntensity * 0.15;
    ctx.fillStyle = `rgba(255, 150, 50, ${shimmerAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, sRad * 0.9, sRad * 0.5 * lavaIsoRatio, 0, 0, Math.PI * 2);
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
// ICE SPIKES HAZARD
// ============================================================================

function drawIceSpikesHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 47.3 + (pos.y || 0) * 21.9;
  const cycle = getIceSpikesCycleState(hazSeed, time);
  const layout = getIceSpikesLayout(pos);
  const spikeIsoRatio = isoRatio * 0.95;

  // 1. Frostbite field and displaced snow
  const frostHalo = ctx.createRadialGradient(0, 0, sRad * 0.35, 0, 0, sRad * 1.5);
  const burstBoost = cycle.burst ? 0.16 : cycle.active ? 0.08 : 0;
  frostHalo.addColorStop(0, `rgba(185, 225, 255, ${0.28 + burstBoost})`);
  frostHalo.addColorStop(0.5, `rgba(145, 195, 255, ${0.24 + burstBoost * 0.8})`);
  frostHalo.addColorStop(0.85, `rgba(215, 240, 255, ${0.12 + burstBoost * 0.5})`);
  frostHalo.addColorStop(1, "transparent");
  ctx.fillStyle = frostHalo;
  drawOrganicBlob(ctx, sRad * 1.35, sRad * 1.2 * spikeIsoRatio, hazSeed, 0.24);
  ctx.fill();

  // Chilled plate below spikes
  const plateShadow = ctx.createRadialGradient(0, 8 * cameraZoom, 0, 0, 8 * cameraZoom, sRad * 1.05);
  plateShadow.addColorStop(0, "rgba(45, 82, 124, 0.65)");
  plateShadow.addColorStop(0.5, "rgba(35, 64, 102, 0.55)");
  plateShadow.addColorStop(1, "rgba(20, 38, 62, 0.2)");
  ctx.fillStyle = plateShadow;
  ctx.save();
  ctx.translate(0, 8 * cameraZoom);
  drawOrganicBlob(ctx, sRad, sRad * 0.74 * spikeIsoRatio, hazSeed + 13, 0.18);
  ctx.fill();
  ctx.restore();

  const plateTop = ctx.createRadialGradient(
    -sRad * 0.25,
    -sRad * 0.25 * spikeIsoRatio,
    0,
    0,
    0,
    sRad * 1.05
  );
  plateTop.addColorStop(0, `rgba(230, 248, 255, ${0.9 + cycle.extend * 0.08})`);
  plateTop.addColorStop(0.35, `rgba(170, 214, 248, ${0.76 + cycle.extend * 0.1})`);
  plateTop.addColorStop(0.7, "rgba(110, 170, 230, 0.68)");
  plateTop.addColorStop(1, "rgba(75, 130, 195, 0.46)");
  ctx.fillStyle = plateTop;
  drawOrganicBlob(ctx, sRad * 0.92, sRad * 0.68 * spikeIsoRatio, hazSeed + 31, 0.16);
  ctx.fill();

  // Fracture network around spike roots
  ctx.strokeStyle = "rgba(222, 245, 255, 0.58)";
  ctx.lineWidth = 1.2 * cameraZoom;
  for (let crack = 0; crack < layout.crackAngles.length; crack++) {
    const crackAngle = layout.crackAngles[crack];
    const crackLen = sRad * (0.22 + seededNoise(hazSeed + crack * 7.9) * 0.55);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let segment = 1; segment <= 4; segment++) {
      const progress = segment / 4;
      const baseX = Math.cos(crackAngle) * crackLen * progress;
      const baseY = Math.sin(crackAngle) * crackLen * progress * spikeIsoRatio;
      const jag = (seededNoise(hazSeed + crack * 11.3 + segment * 3.1) - 0.5) * 10 * cameraZoom;
      ctx.lineTo(
        baseX + Math.cos(crackAngle + Math.PI / 2) * jag,
        baseY + Math.sin(crackAngle + Math.PI / 2) * jag * spikeIsoRatio
      );
    }
    ctx.stroke();
  }

  // 2. Chaotic spike field with depth sorting for stronger 3D read.
  // Dynamic detail level keeps cost stable on lower zooms.
  const detailScalar = cameraZoom >= 0.95 ? 1 : cameraZoom >= 0.7 ? 0.8 : 0.62;
  const spikeCount = Math.max(10, Math.floor(layout.spikes.length * detailScalar));
  const spikes = layout.spikes.slice(0, spikeCount);
  spikes.sort((a, b) => Math.sin(a.angle) * a.dist - Math.sin(b.angle) * b.dist);
  const extensionMultiplier = 0.14 + cycle.extend * 0.86;
  const drawFacetLines = cameraZoom > 0.72 && cycle.extend > 0.2;

  for (let i = 0; i < spikes.length; i++) {
    const spike = spikes[i];
    const dist = sRad * spike.dist;
    const x = Math.cos(spike.angle) * dist;
    const y = Math.sin(spike.angle) * dist * spikeIsoRatio;
    const radialFalloff = 1 - Math.min(0.75, dist / (sRad * 1.05)) * 0.55;
    const width = (5 + spike.width * 9) * cameraZoom;
    const baseHeight = (28 + spike.height * 72) * cameraZoom * radialFalloff;
    const height = baseHeight * extensionMultiplier;
    const lean = (spike.lean - 0.5) * 14 * cameraZoom * (0.55 + cycle.extend * 0.45);
    const shimmer = 0.94 + Math.sin(time * 1.9 + spike.phase * Math.PI * 2 + hazSeed * 0.1) * 0.08;

    const tipX = x + lean;
    const tipY = y - height;
    const baseBackX = x + lean * 0.25;
    const baseBackY = y - width * 0.75;

    // Ground shadow for depth anchoring
    ctx.fillStyle = "rgba(24, 44, 72, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      x + lean * 0.4,
      y + 8 * cameraZoom,
      width * 1.3,
      width * 0.5,
      lean * 0.01,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Rear face
    ctx.fillStyle = `rgba(95, 150, 215, ${0.7 * shimmer})`;
    ctx.beginPath();
    ctx.moveTo(baseBackX, baseBackY);
    ctx.lineTo(x - width, y);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fill();

    // Left/front darker face
    ctx.fillStyle = `rgba(120, 178, 235, ${0.78 * shimmer})`;
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.lineTo(x - width * 0.45, y + width * 0.24);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fill();

    // Right/front brighter face
    ctx.fillStyle = `rgba(220, 246, 255, ${0.84 * shimmer})`;
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width * 0.4, y + width * 0.28);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fill();

    // Base cap ties spike into plate
    ctx.fillStyle = "rgba(170, 220, 248, 0.65)";
    ctx.beginPath();
    ctx.ellipse(x, y + 1.5 * cameraZoom, width * 0.95, width * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    if (drawFacetLines) {
      // Internal facet and edge shimmer
      ctx.strokeStyle = "rgba(235, 250, 255, 0.55)";
      ctx.lineWidth = 1.05 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(x + width * 0.15, y - width * 0.08);
      ctx.lineTo(tipX - lean * 0.12, tipY + height * 0.2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(120, 170, 225, 0.35)";
      ctx.lineWidth = 0.9 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(x - width * 0.2, y);
      ctx.lineTo(tipX - width * 0.12, tipY + height * 0.34);
      ctx.stroke();
    }
  }

  // 3. Jagged perimeter shards (lower profile, chaotic rim)
  const shardCount = Math.max(10, Math.floor(layout.rimShards.length * detailScalar));
  for (let i = 0; i < shardCount; i++) {
    const shard = layout.rimShards[i];
    const shardDist = sRad * shard.dist;
    const sx = Math.cos(shard.angle) * shardDist;
    const sy = Math.sin(shard.angle) * shardDist * spikeIsoRatio;
    const sw = (2.8 + shard.width * 3.2) * cameraZoom;
    const sh = (8 + shard.height * 11) * cameraZoom * (0.25 + cycle.extend * 0.75);
    const tipX = sx + Math.cos(shard.angle) * sw * 0.8;
    const tipY = sy - sh;

    ctx.fillStyle = "rgba(190, 235, 255, 0.72)";
    ctx.beginPath();
    ctx.moveTo(sx - sw, sy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(sx + sw, sy);
    ctx.closePath();
    ctx.fill();
  }

  // 4. Frost motes and glints for ambient motion
  const moteCount = cameraZoom >= 0.95 ? 12 : cameraZoom >= 0.7 ? 8 : 5;
  for (let mote = 0; mote < moteCount; mote++) {
    const life = (time * 0.8 + mote * 0.37) % 2.2;
    const phase = life / 2.2;
    const angle = mote * 1.31 + hazSeed * 0.02;
    const dist = sRad * (0.12 + (mote % 5) * 0.16) + Math.sin(time + mote) * sRad * 0.05;
    const mx = Math.cos(angle + time * 0.26) * dist;
    const my = Math.sin(angle + time * 0.26) * dist * spikeIsoRatio - phase * 22 * cameraZoom;
    const size = (1.5 + (mote % 3)) * cameraZoom * (1 - phase * 0.65);

    ctx.save();
    ctx.shadowColor = "rgba(220, 245, 255, 0.9)";
    ctx.shadowBlur = 8 * cameraZoom;
    ctx.fillStyle = `rgba(225, 246, 255, ${0.72 * (1 - phase)})`;
    ctx.beginPath();
    ctx.arc(mx, my, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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

  // 3. Organic spiral suction pattern (multiple layers with depth)
  ctx.save();
  const spiralSpeed = time * 0.5;
  for (let arm = 0; arm < 5; arm++) {
    const armSeed = hazSeed + arm * 17.3;
    const armAlpha = 0.12 + arm * 0.06;

    // Outer soft glow spiral
    ctx.strokeStyle = `rgba(120, 95, 65, ${armAlpha * 0.5})`;
    ctx.lineWidth = (5 - arm * 0.6) * cameraZoom;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.02) {
      const spiralR = sRad * (0.08 + t * 0.72);
      const wobble = Math.sin(t * 6 + armSeed) * sRad * 0.03;
      const spiralAngle = t * 4.5 + spiralSpeed + arm * (Math.PI * 2 / 5);
      const sx = Math.cos(spiralAngle) * (spiralR + wobble);
      const sy = Math.sin(spiralAngle) * (spiralR + wobble) * isoRatio;
      if (t === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Inner crisp spiral line
    ctx.strokeStyle = `rgba(70, 50, 32, ${armAlpha})`;
    ctx.lineWidth = (2.2 - arm * 0.2) * cameraZoom;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.02) {
      const spiralR = sRad * (0.06 + t * 0.7);
      const wobble = Math.sin(t * 6 + armSeed) * sRad * 0.025;
      const spiralAngle = t * 4.5 + spiralSpeed + arm * (Math.PI * 2 / 5);
      const sx = Math.cos(spiralAngle) * (spiralR + wobble);
      const sy = Math.sin(spiralAngle) * (spiralR + wobble) * isoRatio;
      if (t === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Sand grain particles drifting along spiral paths
  for (let grain = 0; grain < 14; grain++) {
    const grainSeed = hazSeed + grain * 7.31;
    const cycle = (time * 0.35 + seededNoise(grainSeed) * 3) % 3;
    const t = cycle / 3;
    const armIdx = grain % 5;
    const spiralR = sRad * (0.08 + t * 0.72);
    const spiralAngle = t * 4.5 + spiralSpeed + armIdx * (Math.PI * 2 / 5);
    const gx = Math.cos(spiralAngle) * spiralR;
    const gy = Math.sin(spiralAngle) * spiralR * isoRatio;
    const sz = (1.5 + seededNoise(grainSeed + 3) * 2) * cameraZoom * (0.4 + t * 0.6);
    const alpha = 0.5 * (1 - t * 0.6);

    ctx.fillStyle = `rgba(160, 130, 90, ${alpha})`;
    ctx.beginPath();
    ctx.arc(gx, gy, sz, 0, Math.PI * 2);
    ctx.fill();
  }

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
// DEEP WATER HAZARD
// ============================================================================

function drawDeepWaterHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 31.7 + (pos.y || 0) * 43.1;
  const tide = Math.sin(time * 0.85 + hazSeed * 0.03) * 0.5 + 0.5;

  // 1. Damp shoreline footprint
  const wetGrad = ctx.createRadialGradient(0, 0, sRad * 0.45, 0, 0, sRad * 1.35);
  wetGrad.addColorStop(0, "rgba(10, 40, 70, 0.25)");
  wetGrad.addColorStop(0.55, "rgba(25, 60, 85, 0.2)");
  wetGrad.addColorStop(1, "transparent");
  ctx.fillStyle = wetGrad;
  drawOrganicBlob(ctx, sRad * 1.3, sRad * 1.25 * isoRatio, hazSeed, 0.24);
  ctx.fill();

  // 2. Water body with depth gradient
  const waterGrad = ctx.createRadialGradient(
    -sRad * 0.25,
    -sRad * 0.16 * isoRatio,
    0,
    0,
    0,
    sRad
  );
  waterGrad.addColorStop(0, "rgba(82, 164, 202, 0.92)");
  waterGrad.addColorStop(0.33, "rgba(44, 116, 162, 0.9)");
  waterGrad.addColorStop(0.7, "rgba(20, 72, 118, 0.92)");
  waterGrad.addColorStop(1, "rgba(8, 30, 64, 0.96)");
  ctx.fillStyle = waterGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 70, 0.18);
  ctx.fill();

  // 3. Deeper center
  const depthGrad = ctx.createRadialGradient(0, 3 * cameraZoom, 0, 0, 3 * cameraZoom, sRad * 0.52);
  depthGrad.addColorStop(0, "rgba(4, 18, 48, 0.95)");
  depthGrad.addColorStop(1, "rgba(8, 34, 64, 0.15)");
  ctx.fillStyle = depthGrad;
  drawOrganicBlob(ctx, sRad * 0.48, sRad * 0.4 * isoRatio, hazSeed + 120, 0.12);
  ctx.fill();

  // 4. Surface caustics and moving wave bands
  for (let band = 0; band < 5; band++) {
    const phase = time * 0.9 + band * 0.95 + hazSeed * 0.02;
    const r = sRad * (0.2 + band * 0.13) * (0.95 + tide * 0.05);
    const wobble = 1 + Math.sin(phase) * 0.06;
    ctx.strokeStyle = `rgba(170, 230, 255, ${0.14 + (4 - band) * 0.03})`;
    ctx.lineWidth = (2.2 - band * 0.22) * cameraZoom;
    drawOrganicBlob(ctx, r * wobble, r * isoRatio * wobble, hazSeed + band * 31, 0.09);
    ctx.stroke();
  }

  // 5. Edge foam
  const foamCount = 16;
  for (let i = 0; i < foamCount; i++) {
    const angle = (i / foamCount) * Math.PI * 2 + Math.sin(hazSeed + i) * 0.18;
    const edgeR = sRad * (0.8 + Math.sin(time * 0.8 + i) * 0.08);
    const fx = Math.cos(angle) * edgeR;
    const fy = Math.sin(angle) * edgeR * isoRatio;
    const pulse = 0.35 + (Math.sin(time * 2 + i * 1.8) * 0.5 + 0.5) * 0.65;
    const bubbleSize = (2.2 + (i % 3)) * cameraZoom * pulse;

    ctx.fillStyle = `rgba(225, 245, 255, ${0.35 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(fx, fy, bubbleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Specular reflection
  const glintGrad = ctx.createRadialGradient(
    -sRad * 0.32,
    -sRad * 0.2 * isoRatio,
    0,
    -sRad * 0.32,
    -sRad * 0.2 * isoRatio,
    sRad * 0.42
  );
  glintGrad.addColorStop(0, `rgba(230, 248, 255, ${0.25 + tide * 0.18})`);
  glintGrad.addColorStop(0.5, "rgba(190, 235, 255, 0.08)");
  glintGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glintGrad;
  ctx.beginPath();
  ctx.ellipse(
    -sRad * 0.25,
    -sRad * 0.18 * isoRatio,
    sRad * 0.45,
    sRad * 0.23 * isoRatio,
    -0.35,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// ============================================================================
// MAELSTROM HAZARD
// ============================================================================

function drawMaelstromHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 59.9 + (pos.y || 0) * 19.7;
  const spin = time * 1.8;

  // 1. Turbulent water bed
  const basinGrad = ctx.createRadialGradient(0, 0, sRad * 0.2, 0, 0, sRad * 1.2);
  basinGrad.addColorStop(0, "rgba(12, 32, 58, 0.95)");
  basinGrad.addColorStop(0.5, "rgba(18, 64, 98, 0.82)");
  basinGrad.addColorStop(1, "rgba(6, 18, 36, 0.86)");
  ctx.fillStyle = basinGrad;
  drawOrganicBlob(ctx, sRad * 1.05, sRad * 0.95 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  // 2. Rotating spiral currents
  for (let arm = 0; arm < 7; arm++) {
    ctx.strokeStyle = `rgba(130, 220, 255, ${0.24 - arm * 0.02})`;
    ctx.lineWidth = (2.8 - arm * 0.22) * cameraZoom;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.035) {
      const radius = sRad * (0.12 + t * 0.82);
      const theta = spin + arm * 0.9 + t * 8.8 + Math.sin(hazSeed + arm) * 0.2;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius * isoRatio;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 3. Foam vortex ring
  const foamR = sRad * (0.62 + Math.sin(time * 1.3 + hazSeed * 0.02) * 0.04);
  ctx.strokeStyle = "rgba(225, 245, 255, 0.58)";
  ctx.lineWidth = 3 * cameraZoom;
  drawOrganicBlob(ctx, foamR, foamR * isoRatio, hazSeed + 90, 0.14);
  ctx.stroke();

  // 4. Vortex eye
  const eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.22);
  eyeGrad.addColorStop(0, "rgba(2, 8, 18, 0.98)");
  eyeGrad.addColorStop(1, "rgba(8, 22, 44, 0.24)");
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, sRad * 0.2, sRad * 0.12 * isoRatio, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. Flung spray particles
  for (let spray = 0; spray < 20; spray++) {
    const phase = (time * 0.9 + spray * 0.17) % 1;
    const angle = spin * 1.25 + spray * 0.55 + hazSeed * 0.02;
    const radius = sRad * (0.25 + phase * 0.85);
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius * isoRatio - phase * 16 * cameraZoom;
    const size = (1.3 + (spray % 4) * 0.65) * cameraZoom * (1 - phase * 0.6);

    ctx.fillStyle = `rgba(210, 245, 255, ${0.35 + (1 - phase) * 0.45})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Occasional lightning bolts inside the maelstrom
  drawMaelstromLightning(ctx, sRad, time, hazSeed, isoRatio, cameraZoom);
}

function drawMaelstromLightning(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  hazSeed: number,
  isoRatio: number,
  cameraZoom: number
): void {
  // Two independent lightning slots, each with its own cycle
  for (let slot = 0; slot < 2; slot++) {
    const slotSeed = hazSeed + slot * 137.3;
    const cyclePeriod = 2.8 + seededNoise(slotSeed + 10) * 1.4;
    const cyclePhase = (time + seededNoise(slotSeed) * cyclePeriod) % cyclePeriod;
    const flashDuration = 0.18;

    if (cyclePhase > flashDuration) continue;

    const flashAlpha = 1 - cyclePhase / flashDuration;
    const boltAngle = seededNoise(slotSeed + Math.floor(time / cyclePeriod) * 7.1) * Math.PI * 2;
    const boltDist = sRad * (0.15 + seededNoise(slotSeed + Math.floor(time / cyclePeriod) * 3.3) * 0.55);
    const startX = Math.cos(boltAngle) * boltDist * 0.3;
    const startY = Math.sin(boltAngle) * boltDist * 0.3 * isoRatio - sRad * 0.5 * cameraZoom;
    const endX = Math.cos(boltAngle) * boltDist;
    const endY = Math.sin(boltAngle) * boltDist * isoRatio;

    ctx.save();
    ctx.shadowColor = `rgba(120, 200, 255, ${flashAlpha * 0.9})`;
    ctx.shadowBlur = 18 * cameraZoom;

    // Main bolt with jagged segments
    ctx.strokeStyle = `rgba(200, 240, 255, ${flashAlpha * 0.95})`;
    ctx.lineWidth = (2.5 + slot * 0.5) * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const segments = 5;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const baseX = startX + (endX - startX) * t;
      const baseY = startY + (endY - startY) * t;
      const jitter = (1 - Math.abs(t - 0.5) * 2) * sRad * 0.15;
      const jx = baseX + (seededNoise(slotSeed + s * 11.1 + Math.floor(time / cyclePeriod)) - 0.5) * jitter;
      const jy = baseY + (seededNoise(slotSeed + s * 17.7 + Math.floor(time / cyclePeriod)) - 0.5) * jitter * isoRatio;
      ctx.lineTo(jx, jy);
    }
    ctx.stroke();

    // Bright core
    ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha * 0.7})`;
    ctx.lineWidth = 1.2 * cameraZoom;
    ctx.stroke();

    // Impact flash at endpoint
    const impactGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, 8 * cameraZoom);
    impactGrad.addColorStop(0, `rgba(200, 240, 255, ${flashAlpha * 0.8})`);
    impactGrad.addColorStop(1, "transparent");
    ctx.fillStyle = impactGrad;
    ctx.beginPath();
    ctx.arc(endX, endY, 8 * cameraZoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================================
// STORM FIELD HAZARD
// ============================================================================

function drawStormFieldHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 27.1 + (pos.y || 0) * 61.3;
  const pulse = Math.sin(time * 3.4 + hazSeed * 0.03) * 0.5 + 0.5;

  // 1. Ionized ground
  const fieldGrad = ctx.createRadialGradient(0, 0, sRad * 0.25, 0, 0, sRad * 1.15);
  fieldGrad.addColorStop(0, "rgba(36, 56, 112, 0.78)");
  fieldGrad.addColorStop(0.5, "rgba(26, 34, 72, 0.65)");
  fieldGrad.addColorStop(1, "rgba(10, 12, 24, 0.45)");
  ctx.fillStyle = fieldGrad;
  drawOrganicBlob(ctx, sRad * 1.08, sRad * 0.98 * isoRatio, hazSeed, 0.2);
  ctx.fill();

  // 2. Rolling storm deck
  for (let layer = 0; layer < 3; layer++) {
    const drift = Math.sin(time * (0.6 + layer * 0.2) + layer + hazSeed) * 13 * cameraZoom;
    const layerAlpha = 0.2 - layer * 0.05 + pulse * 0.07;
    const r = sRad * (1 - layer * 0.12);
    ctx.save();
    ctx.translate(drift, -layer * 6 * cameraZoom);
    const cloudGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    cloudGrad.addColorStop(0, `rgba(120, 150, 255, ${layerAlpha})`);
    cloudGrad.addColorStop(0.55, `rgba(75, 96, 190, ${layerAlpha * 0.65})`);
    cloudGrad.addColorStop(1, "transparent");
    ctx.fillStyle = cloudGrad;
    drawOrganicBlob(ctx, r, r * 0.72 * isoRatio, hazSeed + layer * 23, 0.16);
    ctx.fill();
    ctx.restore();
  }

  // 3. Crackling arcs
  ctx.strokeStyle = `rgba(175, 220, 255, ${0.45 + pulse * 0.35})`;
  ctx.lineWidth = 2.4 * cameraZoom;
  for (let arc = 0; arc < 5; arc++) {
    const angle = (arc / 5) * Math.PI * 2 + time * 0.9;
    const startR = sRad * (0.2 + (arc % 2) * 0.1);
    const endR = sRad * (0.65 + (arc % 3) * 0.1);
    let x = Math.cos(angle) * startR;
    let y = Math.sin(angle) * startR * isoRatio;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let seg = 0; seg < 4; seg++) {
      const t = (seg + 1) / 4;
      const segR = startR + (endR - startR) * t;
      const segA = angle + t * 0.6 + Math.sin(time * 5 + seg + arc) * 0.2;
      x = Math.cos(segA) * segR;
      y = Math.sin(segA) * segR * isoRatio - t * 6 * cameraZoom;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 4. Charged motes
  for (let mote = 0; mote < 16; mote++) {
    const phase = (time * 0.8 + mote * 0.21) % 1;
    const angle = mote * 0.73 + hazSeed * 0.01;
    const radius = sRad * (0.18 + (mote % 5) * 0.15);
    const px = Math.cos(angle + time * 0.4) * radius;
    const py = Math.sin(angle + time * 0.4) * radius * isoRatio - phase * 24 * cameraZoom;
    const size = (1.5 + (mote % 3)) * cameraZoom * (1 - phase * 0.55);

    ctx.save();
    ctx.shadowColor = "rgba(145, 210, 255, 0.8)";
    ctx.shadowBlur = 10 * cameraZoom;
    ctx.fillStyle = `rgba(195, 235, 255, ${0.4 + (1 - phase) * 0.4})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================================
// THEMED HAZARD TYPES
// ============================================================================

function drawSimpleLavaHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 37.3 + (pos.y || 0) * 53.7;
  const pulse = Math.sin(time * 2.2 + hazSeed) * 0.5 + 0.5;

  const scorchGrad = ctx.createRadialGradient(0, 0, sRad * 0.4, 0, 0, sRad * 1.25);
  scorchGrad.addColorStop(0, "transparent");
  scorchGrad.addColorStop(0.5, "rgba(60, 30, 10, 0.4)");
  scorchGrad.addColorStop(0.8, "rgba(40, 20, 5, 0.25)");
  scorchGrad.addColorStop(1, "transparent");
  ctx.fillStyle = scorchGrad;
  drawOrganicBlob(ctx, sRad * 1.2, sRad * 1.15 * isoRatio, hazSeed, 0.2);
  ctx.fill();

  const lavaGrad = ctx.createRadialGradient(-sRad * 0.15, -sRad * 0.1 * isoRatio, 0, 0, 0, sRad);
  lavaGrad.addColorStop(0, "rgba(255, 200, 50, 0.95)");
  lavaGrad.addColorStop(0.25, "rgba(255, 120, 20, 0.92)");
  lavaGrad.addColorStop(0.55, "rgba(200, 60, 10, 0.9)");
  lavaGrad.addColorStop(0.8, "rgba(140, 30, 5, 0.92)");
  lavaGrad.addColorStop(1, "rgba(80, 15, 0, 0.88)");
  ctx.fillStyle = lavaGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 40, 0.16);
  ctx.fill();

  for (let vein = 0; vein < 6; vein++) {
    const vAngle = (vein / 6) * Math.PI * 2 + hazSeed * 0.1;
    const vDrift = time * 0.4 + vein * 1.1;
    ctx.strokeStyle = `rgba(255, 180, 40, ${0.3 + pulse * 0.25})`;
    ctx.lineWidth = (2 + Math.sin(vDrift) * 0.8) * cameraZoom;
    ctx.beginPath();
    const vR = sRad * (0.2 + Math.sin(vDrift + 1) * 0.15);
    const vEndR = sRad * (0.6 + Math.sin(vDrift + 2) * 0.15);
    ctx.moveTo(Math.cos(vAngle) * vR, Math.sin(vAngle) * vR * isoRatio);
    ctx.quadraticCurveTo(
      Math.cos(vAngle + 0.25) * (vR + vEndR) * 0.6,
      Math.sin(vAngle + 0.25) * (vR + vEndR) * 0.6 * isoRatio,
      Math.cos(vAngle + 0.5) * vEndR,
      Math.sin(vAngle + 0.5) * vEndR * isoRatio
    );
    ctx.stroke();
  }

  for (let ember = 0; ember < 10; ember++) {
    const ePhase = (time * 0.7 + seededNoise(hazSeed + ember * 3.7) * 2) % 2;
    const eAngle = seededNoise(hazSeed + ember * 5.1) * Math.PI * 2;
    const eDist = sRad * (0.15 + seededNoise(hazSeed + ember * 8.3) * 0.5);
    const ex = Math.cos(eAngle) * eDist;
    const ey = Math.sin(eAngle) * eDist * isoRatio - ePhase * 18 * cameraZoom;
    const eSize = (1.5 + (ember % 3) * 0.8) * cameraZoom * (1 - ePhase / 2);
    ctx.fillStyle = `rgba(255, ${150 + (ember % 3) * 40}, 20, ${0.8 * (1 - ePhase / 2)})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
    ctx.fill();
  }

  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.35);
  glowGrad.addColorStop(0, `rgba(255, 240, 180, ${0.3 + pulse * 0.2})`);
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, sRad * 0.35, sRad * 0.25 * isoRatio, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSimpleSwampHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 29.3 + (pos.y || 0) * 47.1;

  const wetGrad = ctx.createRadialGradient(0, 0, sRad * 0.3, 0, 0, sRad * 1.3);
  wetGrad.addColorStop(0, "transparent");
  wetGrad.addColorStop(0.4, "rgba(35, 50, 20, 0.35)");
  wetGrad.addColorStop(0.8, "rgba(25, 40, 15, 0.2)");
  wetGrad.addColorStop(1, "transparent");
  ctx.fillStyle = wetGrad;
  drawOrganicBlob(ctx, sRad * 1.25, sRad * 1.2 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  const swampGrad = ctx.createRadialGradient(-sRad * 0.1, -sRad * 0.08 * isoRatio, 0, 0, 0, sRad);
  swampGrad.addColorStop(0, "rgba(55, 75, 30, 0.92)");
  swampGrad.addColorStop(0.35, "rgba(45, 62, 25, 0.9)");
  swampGrad.addColorStop(0.7, "rgba(35, 50, 18, 0.92)");
  swampGrad.addColorStop(1, "rgba(20, 32, 10, 0.88)");
  ctx.fillStyle = swampGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 30, 0.18);
  ctx.fill();

  for (let patch = 0; patch < 5; patch++) {
    const pAngle = seededNoise(hazSeed + patch * 4.7) * Math.PI * 2;
    const pDist = sRad * (0.2 + seededNoise(hazSeed + patch * 6.3) * 0.45);
    const drift = Math.sin(time * 0.3 + patch * 1.4) * 4 * cameraZoom;
    const px = Math.cos(pAngle) * pDist + drift;
    const py = Math.sin(pAngle) * pDist * isoRatio;
    const pSize = sRad * (0.08 + seededNoise(hazSeed + patch * 9.1) * 0.1);
    ctx.fillStyle = `rgba(70, 100, 35, ${0.5 + seededNoise(hazSeed + patch) * 0.3})`;
    drawOrganicBlobAt(ctx, px, py, pSize, pSize * isoRatio, hazSeed + patch * 20, 0.25);
    ctx.fill();
  }

  for (let bubble = 0; bubble < 8; bubble++) {
    const bPhase = (time * 0.6 + seededNoise(hazSeed + bubble * 2.1) * 3) % 3;
    if (bPhase > 1) continue;
    const bAngle = seededNoise(hazSeed + bubble * 3.7) * Math.PI * 2;
    const bDist = sRad * (0.15 + seededNoise(hazSeed + bubble * 5.3) * 0.5);
    const bx = Math.cos(bAngle) * bDist;
    const by = Math.sin(bAngle) * bDist * isoRatio - bPhase * 12 * cameraZoom;
    const bSize = (2.5 + (bubble % 3)) * cameraZoom * Math.sin(bPhase * Math.PI);
    ctx.fillStyle = `rgba(90, 120, 50, ${0.5 * (1 - bPhase)})`;
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();
  }

  const sheenGrad = ctx.createRadialGradient(
    -sRad * 0.25, -sRad * 0.15 * isoRatio, 0,
    -sRad * 0.25, -sRad * 0.15 * isoRatio, sRad * 0.4
  );
  const sheenAlpha = 0.12 + Math.sin(time * 1.5 + hazSeed) * 0.06;
  sheenGrad.addColorStop(0, `rgba(130, 180, 60, ${sheenAlpha})`);
  sheenGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.ellipse(-sRad * 0.2, -sRad * 0.12 * isoRatio, sRad * 0.4, sRad * 0.2 * isoRatio, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSimpleIceHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 33.7 + (pos.y || 0) * 51.3;

  const frostGrad = ctx.createRadialGradient(0, 0, sRad * 0.5, 0, 0, sRad * 1.25);
  frostGrad.addColorStop(0, "transparent");
  frostGrad.addColorStop(0.4, "rgba(200, 230, 255, 0.25)");
  frostGrad.addColorStop(0.8, "rgba(180, 215, 245, 0.15)");
  frostGrad.addColorStop(1, "transparent");
  ctx.fillStyle = frostGrad;
  drawOrganicBlob(ctx, sRad * 1.2, sRad * 1.15 * isoRatio, hazSeed, 0.2);
  ctx.fill();

  const iceGrad = ctx.createRadialGradient(-sRad * 0.2, -sRad * 0.12 * isoRatio, 0, 0, 0, sRad);
  iceGrad.addColorStop(0, "rgba(230, 245, 255, 0.94)");
  iceGrad.addColorStop(0.3, "rgba(180, 220, 255, 0.9)");
  iceGrad.addColorStop(0.65, "rgba(140, 195, 240, 0.92)");
  iceGrad.addColorStop(1, "rgba(100, 170, 220, 0.88)");
  ctx.fillStyle = iceGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 50, 0.16);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 1.2 * cameraZoom;
  for (let crack = 0; crack < 8; crack++) {
    const cAngle = seededNoise(hazSeed + crack * 3.3) * Math.PI * 2;
    const cLen = sRad * (0.3 + seededNoise(hazSeed + crack * 5.7) * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const midX = Math.cos(cAngle + 0.15) * cLen * 0.5;
    const midY = Math.sin(cAngle + 0.15) * cLen * 0.5 * isoRatio;
    ctx.lineTo(midX, midY);
    ctx.lineTo(Math.cos(cAngle) * cLen, Math.sin(cAngle) * cLen * isoRatio);
    ctx.stroke();
    if (seededNoise(hazSeed + crack * 11) > 0.4) {
      const branchAngle = cAngle + (seededNoise(hazSeed + crack * 13) - 0.5) * 1.2;
      const branchLen = cLen * 0.4;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX + Math.cos(branchAngle) * branchLen,
        midY + Math.sin(branchAngle) * branchLen * isoRatio
      );
      ctx.stroke();
    }
  }

  for (let mote = 0; mote < 8; mote++) {
    const mPhase = (time * 0.5 + seededNoise(hazSeed + mote * 2.3) * 3) % 3;
    const mAngle = seededNoise(hazSeed + mote * 4.1) * Math.PI * 2;
    const mDist = sRad * (0.2 + seededNoise(hazSeed + mote * 6.7) * 0.55);
    const mx = Math.cos(mAngle) * mDist;
    const my = Math.sin(mAngle) * mDist * isoRatio - mPhase * 10 * cameraZoom;
    const mSize = (1.5 + (mote % 3) * 0.5) * cameraZoom * (1 - mPhase / 3);
    ctx.fillStyle = `rgba(220, 240, 255, ${0.6 * (1 - mPhase / 3)})`;
    ctx.beginPath();
    ctx.arc(mx, my, mSize, 0, Math.PI * 2);
    ctx.fill();
  }

  const shimmer = Math.sin(time * 1.8 + hazSeed) * 0.5 + 0.5;
  const specGrad = ctx.createRadialGradient(
    -sRad * 0.3, -sRad * 0.18 * isoRatio, 0,
    -sRad * 0.3, -sRad * 0.18 * isoRatio, sRad * 0.38
  );
  specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.22 + shimmer * 0.18})`);
  specGrad.addColorStop(0.5, "rgba(230, 245, 255, 0.06)");
  specGrad.addColorStop(1, "transparent");
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(-sRad * 0.25, -sRad * 0.14 * isoRatio, sRad * 0.38, sRad * 0.2 * isoRatio, -0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawSimplePoisonHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 41.3 + (pos.y || 0) * 29.7;

  const deadGrad = ctx.createRadialGradient(0, 0, sRad * 0.4, 0, 0, sRad * 1.3);
  deadGrad.addColorStop(0, "transparent");
  deadGrad.addColorStop(0.45, "rgba(50, 60, 20, 0.3)");
  deadGrad.addColorStop(0.8, "rgba(35, 45, 15, 0.18)");
  deadGrad.addColorStop(1, "transparent");
  ctx.fillStyle = deadGrad;
  drawOrganicBlob(ctx, sRad * 1.25, sRad * 1.2 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  const poisonGrad = ctx.createRadialGradient(-sRad * 0.12, -sRad * 0.08 * isoRatio, 0, 0, 0, sRad);
  poisonGrad.addColorStop(0, "rgba(120, 255, 80, 0.92)");
  poisonGrad.addColorStop(0.3, "rgba(80, 210, 50, 0.9)");
  poisonGrad.addColorStop(0.6, "rgba(50, 160, 30, 0.92)");
  poisonGrad.addColorStop(1, "rgba(25, 90, 15, 0.88)");
  ctx.fillStyle = poisonGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 35, 0.17);
  ctx.fill();

  for (let bubble = 0; bubble < 10; bubble++) {
    const bPhase = (time * 0.9 + seededNoise(hazSeed + bubble * 2.7) * 2.5) % 2.5;
    if (bPhase > 1.5) continue;
    const bAngle = seededNoise(hazSeed + bubble * 4.3) * Math.PI * 2;
    const bDist = sRad * (0.1 + seededNoise(hazSeed + bubble * 6.1) * 0.6);
    const bx = Math.cos(bAngle) * bDist;
    const by = Math.sin(bAngle) * bDist * isoRatio;
    const bSize = (2 + (bubble % 4) * 0.8) * cameraZoom * Math.sin((bPhase / 1.5) * Math.PI);
    ctx.fillStyle = `rgba(160, 255, 80, ${0.55 * Math.sin((bPhase / 1.5) * Math.PI)})`;
    ctx.beginPath();
    ctx.arc(bx, by - bPhase * 8 * cameraZoom, bSize, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let wisp = 0; wisp < 6; wisp++) {
    const wPhase = (time * 0.4 + seededNoise(hazSeed + wisp * 3.9) * 3) % 3;
    const wAngle = seededNoise(hazSeed + wisp * 5.3) * Math.PI * 2;
    const wDist = sRad * (0.15 + seededNoise(hazSeed + wisp * 7.7) * 0.4);
    const wx = Math.cos(wAngle) * wDist + Math.sin(time * 0.5 + wisp) * 3 * cameraZoom;
    const wy = Math.sin(wAngle) * wDist * isoRatio - wPhase * 20 * cameraZoom;
    const wSize = sRad * (0.06 + (wisp % 3) * 0.02) * (1 - wPhase / 3);
    ctx.fillStyle = `rgba(100, 200, 50, ${0.18 * (1 - wPhase / 3)})`;
    ctx.beginPath();
    ctx.ellipse(wx, wy, wSize, wSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const glow = Math.sin(time * 2.5 + hazSeed) * 0.5 + 0.5;
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.4);
  glowGrad.addColorStop(0, `rgba(140, 255, 60, ${0.15 + glow * 0.12})`);
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, sRad * 0.4, sRad * 0.28 * isoRatio, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSimpleFireHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 43.1 + (pos.y || 0) * 31.7;
  const emberGlow = Math.sin(time * 3 + hazSeed) * 0.5 + 0.5;

  const scorchGrad = ctx.createRadialGradient(0, 0, sRad * 0.2, 0, 0, sRad * 1.2);
  scorchGrad.addColorStop(0, "rgba(50, 25, 10, 0.85)");
  scorchGrad.addColorStop(0.5, "rgba(40, 20, 8, 0.7)");
  scorchGrad.addColorStop(0.8, "rgba(30, 15, 5, 0.4)");
  scorchGrad.addColorStop(1, "transparent");
  ctx.fillStyle = scorchGrad;
  drawOrganicBlob(ctx, sRad * 1.15, sRad * 1.1 * isoRatio, hazSeed, 0.2);
  ctx.fill();

  const emberGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.85);
  emberGrad.addColorStop(0, `rgba(180, 60, 10, ${0.5 + emberGlow * 0.2})`);
  emberGrad.addColorStop(0.5, `rgba(120, 35, 5, ${0.35 + emberGlow * 0.15})`);
  emberGrad.addColorStop(1, "rgba(60, 15, 0, 0.15)");
  ctx.fillStyle = emberGrad;
  drawOrganicBlob(ctx, sRad * 0.85, sRad * 0.8 * isoRatio, hazSeed + 25, 0.15);
  ctx.fill();

  for (let flame = 0; flame < 7; flame++) {
    const fAngle = seededNoise(hazSeed + flame * 3.1) * Math.PI * 2;
    const fDist = sRad * (0.15 + seededNoise(hazSeed + flame * 5.7) * 0.45);
    const fx = Math.cos(fAngle) * fDist;
    const fy = Math.sin(fAngle) * fDist * isoRatio;
    const fHeight = (12 + seededNoise(hazSeed + flame * 7.3) * 12 + Math.sin(time * 5 + flame * 1.3) * 4) * cameraZoom;
    const fWidth = (3 + seededNoise(hazSeed + flame * 9.1) * 3) * cameraZoom;

    const flameGrad = ctx.createLinearGradient(fx, fy, fx, fy - fHeight);
    flameGrad.addColorStop(0, "rgba(255, 68, 0, 0.9)");
    flameGrad.addColorStop(0.3, "rgba(255, 136, 0, 0.75)");
    flameGrad.addColorStop(0.65, "rgba(255, 204, 0, 0.5)");
    flameGrad.addColorStop(1, "rgba(255, 255, 200, 0)");
    ctx.fillStyle = flameGrad;

    const sway = Math.sin(time * 8 + flame * 1.7 + hazSeed) * 2 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(fx - fWidth, fy);
    ctx.quadraticCurveTo(fx - fWidth * 0.6 + sway * 0.5, fy - fHeight * 0.5, fx + sway, fy - fHeight);
    ctx.quadraticCurveTo(fx + fWidth * 0.6 + sway * 0.5, fy - fHeight * 0.5, fx + fWidth, fy);
    ctx.fill();
  }

  for (let spark = 0; spark < 8; spark++) {
    const sPhase = (time * 1.2 + seededNoise(hazSeed + spark * 2.3) * 2) % 2;
    const sAngle = seededNoise(hazSeed + spark * 4.7) * Math.PI * 2;
    const sDist = sRad * (0.1 + seededNoise(hazSeed + spark * 6.1) * 0.4);
    const sx = Math.cos(sAngle) * sDist + Math.sin(time * 3 + spark) * 2 * cameraZoom;
    const sy = Math.sin(sAngle) * sDist * isoRatio - sPhase * 22 * cameraZoom;
    const sSize = (1 + (spark % 3) * 0.5) * cameraZoom * (1 - sPhase / 2);
    ctx.fillStyle = `rgba(255, ${200 - spark * 15}, 50, ${0.7 * (1 - sPhase / 2)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSimpleLightningHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 47.7 + (pos.y || 0) * 23.3;
  const pulse = Math.sin(time * 3.4 + hazSeed) * 0.5 + 0.5;

  const chargeGrad = ctx.createRadialGradient(0, 0, sRad * 0.15, 0, 0, sRad * 1.15);
  chargeGrad.addColorStop(0, "rgba(50, 80, 160, 0.82)");
  chargeGrad.addColorStop(0.45, "rgba(35, 55, 120, 0.65)");
  chargeGrad.addColorStop(0.8, "rgba(20, 30, 70, 0.45)");
  chargeGrad.addColorStop(1, "rgba(10, 15, 35, 0.2)");
  ctx.fillStyle = chargeGrad;
  drawOrganicBlob(ctx, sRad * 1.08, sRad * isoRatio, hazSeed, 0.2);
  ctx.fill();

  const fieldR = sRad * (0.7 + pulse * 0.15);
  ctx.strokeStyle = `rgba(130, 200, 255, ${0.2 + pulse * 0.15})`;
  ctx.lineWidth = 2 * cameraZoom;
  drawOrganicBlob(ctx, fieldR, fieldR * isoRatio, hazSeed + 40, 0.12);
  ctx.stroke();

  for (let slot = 0; slot < 3; slot++) {
    const slotSeed = hazSeed + slot * 97.3;
    const cyclePeriod = 1.8 + seededNoise(slotSeed + 10) * 1.2;
    const cyclePhase = (time + seededNoise(slotSeed) * cyclePeriod) % cyclePeriod;
    const flashDuration = 0.22;
    if (cyclePhase > flashDuration) continue;

    const flashAlpha = 1 - cyclePhase / flashDuration;
    const boltSeed = slotSeed + Math.floor(time / cyclePeriod) * 7.1;
    const boltAngle = seededNoise(boltSeed) * Math.PI * 2;
    const boltLen = sRad * (0.3 + seededNoise(boltSeed + 1) * 0.5);
    const startX = Math.cos(boltAngle) * boltLen * 0.15;
    const startY = Math.sin(boltAngle) * boltLen * 0.15 * isoRatio;
    const endX = Math.cos(boltAngle) * boltLen;
    const endY = Math.sin(boltAngle) * boltLen * isoRatio;

    ctx.save();
    ctx.shadowColor = `rgba(120, 200, 255, ${flashAlpha * 0.8})`;
    ctx.shadowBlur = 14 * cameraZoom;
    ctx.strokeStyle = `rgba(180, 230, 255, ${flashAlpha * 0.9})`;
    ctx.lineWidth = (2 + slot * 0.4) * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let seg = 1; seg <= 4; seg++) {
      const t = seg / 4;
      const baseX = startX + (endX - startX) * t;
      const baseY = startY + (endY - startY) * t;
      const jitter = (1 - Math.abs(t - 0.5) * 2) * sRad * 0.12;
      ctx.lineTo(
        baseX + (seededNoise(boltSeed + seg * 11) - 0.5) * jitter,
        baseY + (seededNoise(boltSeed + seg * 17) - 0.5) * jitter * isoRatio
      );
    }
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha * 0.6})`;
    ctx.lineWidth = 1 * cameraZoom;
    ctx.stroke();
    ctx.restore();
  }

  for (let mote = 0; mote < 10; mote++) {
    const mPhase = (time * 0.9 + seededNoise(hazSeed + mote * 2.1) * 2) % 2;
    const mAngle = seededNoise(hazSeed + mote * 4.3) * Math.PI * 2 + time * 0.4;
    const mDist = sRad * (0.15 + seededNoise(hazSeed + mote * 6.7) * 0.55);
    const mx = Math.cos(mAngle) * mDist;
    const my = Math.sin(mAngle) * mDist * isoRatio - mPhase * 16 * cameraZoom;
    const mSize = (1.2 + (mote % 3) * 0.6) * cameraZoom * (1 - mPhase / 2);
    ctx.save();
    ctx.shadowColor = "rgba(130, 200, 255, 0.7)";
    ctx.shadowBlur = 6 * cameraZoom;
    ctx.fillStyle = `rgba(180, 230, 255, ${0.5 * (1 - mPhase / 2)})`;
    ctx.beginPath();
    ctx.arc(mx, my, mSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawSimpleVoidHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number
): void {
  const hazSeed = (pos.x || 0) * 53.3 + (pos.y || 0) * 37.7;

  const distortGrad = ctx.createRadialGradient(0, 0, sRad * 0.35, 0, 0, sRad * 1.25);
  distortGrad.addColorStop(0, "transparent");
  distortGrad.addColorStop(0.4, "rgba(60, 30, 100, 0.35)");
  distortGrad.addColorStop(0.75, "rgba(40, 15, 70, 0.2)");
  distortGrad.addColorStop(1, "transparent");
  ctx.fillStyle = distortGrad;
  drawOrganicBlob(ctx, sRad * 1.2, sRad * 1.15 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad);
  voidGrad.addColorStop(0, "rgba(0, 0, 0, 0.97)");
  voidGrad.addColorStop(0.3, "rgba(15, 5, 30, 0.94)");
  voidGrad.addColorStop(0.6, "rgba(35, 15, 60, 0.9)");
  voidGrad.addColorStop(1, "rgba(50, 25, 80, 0.82)");
  ctx.fillStyle = voidGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 45, 0.18);
  ctx.fill();

  const horizonR = sRad * (0.55 + Math.sin(time * 1.2 + hazSeed) * 0.04);
  ctx.strokeStyle = `rgba(160, 80, 255, ${0.35 + Math.sin(time * 2 + hazSeed) * 0.15})`;
  ctx.lineWidth = 2.5 * cameraZoom;
  drawOrganicBlob(ctx, horizonR, horizonR * isoRatio, hazSeed + 80, 0.12);
  ctx.stroke();

  for (let p = 0; p < 14; p++) {
    const pAngle = (p / 14) * Math.PI * 2 + time * 1.5;
    const pDist = sRad * (0.4 + Math.sin(time * 0.8 + p * 1.3 + hazSeed) * 0.12);
    const px = Math.cos(pAngle) * pDist;
    const py = Math.sin(pAngle) * pDist * isoRatio;
    const pSize = (1.5 + (p % 4) * 0.5) * cameraZoom;
    const hue = (p * 25 + time * 30) % 360;
    ctx.fillStyle = `hsla(${270 + (hue % 60) - 30}, 80%, 60%, ${0.45 + Math.sin(time * 3 + p) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let star = 0; star < 8; star++) {
    const sAngle = seededNoise(hazSeed + star * 3.7) * Math.PI * 2 + time * 0.3;
    const sDist = sRad * seededNoise(hazSeed + star * 5.1) * 0.4;
    const sx = Math.cos(sAngle) * sDist;
    const sy = Math.sin(sAngle) * sDist * isoRatio;
    const twinkle = Math.sin(time * 4 + star * 2.1 + hazSeed) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(220, 180, 255, ${0.3 + twinkle * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx, sy, (0.8 + twinkle * 0.8) * cameraZoom, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let tear = 0; tear < 3; tear++) {
    const tPhase = (time * 0.3 + seededNoise(hazSeed + tear * 4.7) * 4) % 4;
    if (tPhase > 1.5) continue;
    const tAngle = seededNoise(hazSeed + tear * 6.3) * Math.PI * 2;
    const tDist = sRad * (0.2 + seededNoise(hazSeed + tear * 8.1) * 0.4);
    const tx = Math.cos(tAngle) * tDist;
    const ty = Math.sin(tAngle) * tDist * isoRatio;
    const tLen = sRad * 0.2 * Math.sin((tPhase / 1.5) * Math.PI);
    const tRot = seededNoise(hazSeed + tear * 10.3) * Math.PI;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tRot);
    ctx.strokeStyle = `rgba(200, 120, 255, ${0.6 * Math.sin((tPhase / 1.5) * Math.PI)})`;
    ctx.lineWidth = 2 * cameraZoom;
    ctx.shadowColor = "rgba(180, 100, 255, 0.6)";
    ctx.shadowBlur = 8 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(-tLen, 0);
    ctx.lineTo(tLen, 0);
    ctx.stroke();
    ctx.restore();
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
