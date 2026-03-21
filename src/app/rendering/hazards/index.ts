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
      angle:
        (i / 22) * Math.PI * 2 + (seededNoise(seed + i * 17.3) - 0.5) * 0.45,
      dist: 0.78 + seededNoise(seed + i * 6.6) * 0.32,
      width: seededNoise(seed + i * 2.7),
      height: seededNoise(seed + i * 3.9),
    });
  }

  const crackAngles: number[] = [];
  for (let i = 0; i < 12; i++) {
    crackAngles.push(
      (i / 12) * Math.PI * 2 + (seededNoise(seed + i * 4.2) - 0.5) * 0.45,
    );
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

function getIceSpikesCycleState(
  seed: number,
  timeSeconds: number,
): IceSpikesCycleState {
  const cycleDuration = 2.6;
  const phaseOffset =
    (((seed * 0.071) % cycleDuration) + cycleDuration) % cycleDuration;
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

function dispatchHazardDraw(
  ctx: CanvasRenderingContext2D,
  type: string,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  zoom: number,
): void {
  switch (type) {
    case "poison_fog":
      drawPoisonFogHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "lava_geyser":
    case "eruption_zone":
      drawLavaGeyserHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "ice_sheet":
    case "slippery_ice":
      drawIceSheetHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "quicksand":
      drawQuicksandHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "deep_water":
      drawDeepWaterHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "maelstrom":
      drawMaelstromHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "storm_field":
      drawStormFieldHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "volcano":
      drawVolcanoHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "lava":
      drawLavaPoolHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "swamp":
      drawSwampHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "ice":
      drawIceHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "poison":
      drawPoisonPoolHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "fire":
      drawHellfireHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "lightning":
      drawLightningFieldHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "void":
      drawVoidRiftHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    case "ice_spikes":
    case "spikes":
      drawIceSpikesHazard(ctx, sRad, time, pos, isoRatio, zoom);
      break;
    default:
      drawGenericHazard(ctx, sRad, time, zoom);
  }
}

export function drawHazardSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  time: number,
): void {
  const sRad = size * 0.42;
  const isoRatio = ISO_Y_RATIO;
  const pos: Position = { x: 5, y: 5 };
  ctx.save();
  ctx.translate(x, y);
  dispatchHazardDraw(ctx, type, sRad, time, pos, isoRatio, 1);
  ctx.restore();
}

export function renderHazard(
  ctx: CanvasRenderingContext2D,
  hazard: MapHazard,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
): void {
  if (!hazard.pos) return;

  const zoom = cameraZoom || 1;
  const screenPos = worldToScreen(
    gridToWorld(hazard.pos),
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const sRad = (hazard.radius || 2) * TILE_SIZE * zoom;
  const time = Date.now() / 1000;
  const isoRatio = ISO_Y_RATIO;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);
  dispatchHazardDraw(ctx, hazard.type, sRad, time, hazard.pos, isoRatio, zoom);
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
  cameraZoom: number,
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
      Math.sin(angle) * len * isoRatio,
    );
    ctx.stroke();
  }
  ctx.restore();

  // 2. Bubbling toxic pools
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

    for (let b = 0; b < 3; b++) {
      const bubblePhase = (time * 1.5 + pool + b * 0.3) % 1;
      const bubbleSize = (3 + b) * cameraZoom * (1 - bubblePhase * 0.5);
      const bubbleY = poolY - bubblePhase * 25 * cameraZoom;
      const bubbleX =
        poolX + Math.sin(time * 3 + b + poolSeed) * 5 * cameraZoom;

      ctx.fillStyle = `rgba(150, 255, 150, ${0.6 * (1 - bubblePhase)})`;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Soft volumetric fog layers
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
    drawOrganicBlob(
      ctx,
      sRad * layerScale,
      sRad * layerScale * isoRatio * 0.8,
      hazSeed + layer * 7,
      0.18,
    );
    ctx.fill();
    ctx.restore();
  }

  // 4. Toxic spore particles
  for (let j = 0; j < 12; j++) {
    const seed = j * 0.618;
    const particleLife = (time + seed * 2) % 2.5;
    const px =
      Math.sin(seed * 17.3 + hazSeed) * sRad * 0.7 +
      Math.sin(time + j) * 10 * cameraZoom;
    const py =
      -particleLife * 35 * cameraZoom +
      Math.cos(seed * 23.7 + hazSeed) * sRad * 0.3 * isoRatio;
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
  backRocks: {
    angle: number;
    offset: number;
    h: number;
    w: number;
    taper: number;
  }[];
  frontRocks: {
    angle: number;
    offset: number;
    h: number;
    w: number;
    taper: number;
  }[];
  lavaFlows: {
    angle: number;
    length: number;
    width: number;
    curvature: number;
  }[];
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
    crackAngles.push(
      (i / 16) * Math.PI * 2 + (seededNoise(seed + i * 3.7) - 0.5) * 0.35,
    );
    crackLengths.push(0.35 + seededNoise(seed + i * 5.1) * 0.55);
    crackJitter.push(seededNoise(seed + i * 8.3) - 0.5);
  }

  const backRocks: LavaGeyserLayout["backRocks"] = [];
  for (let r = 0; r < 7; r++) {
    backRocks.push({
      angle:
        Math.PI + (r / 7) * Math.PI + (seededNoise(seed + r * 4.1) - 0.5) * 0.2,
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
    crackAngles,
    crackLengths,
    crackJitter,
    backRocks,
    frontRocks,
    lavaFlows,
    secondaryPools,
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

function getLavaGeyserCycleState(
  seed: number,
  time: number,
): LavaGeyserCycleState {
  const cycleDuration = 5;
  const phaseOffset =
    (((seed * 0.037) % cycleDuration) + cycleDuration) % cycleDuration;
  const cycleTime = (time + phaseOffset) % cycleDuration;
  const isErupting = cycleTime < 1.4;
  const buildUp = cycleTime > 3.8;
  const eruptionIntensity = isErupting
    ? Math.sin((cycleTime / 1.4) * Math.PI)
    : 0;
  const dormantGlow =
    !isErupting && !buildUp ? 0.3 + Math.sin(time * 1.5 + seed * 0.1) * 0.1 : 0;
  return { cycleTime, isErupting, buildUp, eruptionIntensity, dormantGlow };
}

function drawLavaGeyserHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 13.7 + (pos.y || 0) * 29.3;
  const layout = getLavaGeyserLayout(pos);
  const cycle = getLavaGeyserCycleState(hazSeed, time);
  const lavaIso = ISO_Y_RATIO;
  const ventWidth = sRad * 0.8;

  drawLavaGeyserScorchedEarth(ctx, sRad, lavaIso, hazSeed, cycle, cameraZoom);
  drawLavaGeyserCracks(ctx, sRad, lavaIso, layout, time, cycle, cameraZoom);
  drawLavaGeyserFlows(ctx, sRad, lavaIso, layout, time, cycle, cameraZoom);
  drawLavaGeyserSecondaryPools(
    ctx,
    sRad,
    lavaIso,
    layout,
    time,
    cycle,
  );
  drawLavaGeyserVentRim(ctx, ventWidth, lavaIso, hazSeed, cycle, cameraZoom);
  drawLavaGeyserBackRocks(ctx, ventWidth, lavaIso, layout, cycle, cameraZoom);
  drawLavaGeyserMagmaPool(
    ctx,
    ventWidth,
    lavaIso,
    hazSeed,
    time,
    cycle,
    cameraZoom,
  );
  drawLavaGeyserFrontRocks(ctx, ventWidth, lavaIso, layout, cycle, cameraZoom);
  drawLavaGeyserEruption(
    ctx,
    sRad,
    ventWidth,
    lavaIso,
    time,
    cycle,
    cameraZoom,
  );
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
  const heatStain = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.6,
    0,
    0,
    sRad * 1.6,
  );
  heatStain.addColorStop(0, `rgba(80, 30, 10, ${0.35 + glowBoost})`);
  heatStain.addColorStop(0.5, `rgba(50, 18, 6, ${0.22 + glowBoost * 0.5})`);
  heatStain.addColorStop(1, "transparent");
  ctx.fillStyle = heatStain;
  drawOrganicBlob(ctx, sRad * 1.55, sRad * 1.45 * lavaIso, hazSeed + 200, 0.24);
  ctx.fill();

  // Core scorched earth
  const scorchGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.2,
    0,
    0,
    sRad * 1.3,
  );
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
    drawOrganicBlobAt(
      ctx,
      sx,
      sy,
      spotR,
      spotR * lavaIso,
      hazSeed + i * 17,
      0.2,
    );
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
  const glowPulse =
    0.35 +
    Math.sin(time * 2.2) * 0.1 +
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
  const flowPulse =
    0.6 + Math.sin(time * 1.8) * 0.15 + cycle.eruptionIntensity * 0.25;

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
    const midY =
      Math.sin(midAngle) * (startR + endR) * 0.5 * lavaIso + animOffset;
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
): void {
  const poolGlow =
    0.7 + Math.sin(time * 1.4) * 0.1 + cycle.eruptionIntensity * 0.2;

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
  const iso = ISO_Y_RATIO;
  const hw = rockW;
  const hd = hw * iso * 0.7;
  const topHw = hw * taper;
  const topHd = topHw * iso * 0.7;
  const topY = rockY - rockH;
  const base = isFront ? 42 : 30;

  // Left face (lit - brighter, facing upper-left light)
  const lR = base + 16;
  ctx.fillStyle = `rgb(${lR}, ${Math.floor(lR * 0.63)}, ${Math.floor(lR * 0.38)})`;
  ctx.beginPath();
  ctx.moveTo(rockX - hw, rockY);
  ctx.lineTo(rockX, rockY + hd);
  ctx.lineTo(rockX, topY + topHd);
  ctx.lineTo(rockX - topHw, topY);
  ctx.closePath();
  ctx.fill();

  // Right face (shadow - darker)
  const rR = Math.max(0, base - 2);
  ctx.fillStyle = `rgb(${rR}, ${Math.floor(rR * 0.58)}, ${Math.floor(rR * 0.33)})`;
  ctx.beginPath();
  ctx.moveTo(rockX, rockY + hd);
  ctx.lineTo(rockX + hw, rockY);
  ctx.lineTo(rockX + topHw, topY);
  ctx.lineTo(rockX, topY + topHd);
  ctx.closePath();
  ctx.fill();

  // Top face (brightest - catches overhead light)
  const tR = base + 26;
  ctx.fillStyle = `rgb(${tR}, ${Math.floor(tR * 0.58)}, ${Math.floor(tR * 0.33)})`;
  ctx.beginPath();
  ctx.moveTo(rockX - topHw, topY);
  ctx.lineTo(rockX, topY + topHd);
  ctx.lineTo(rockX + topHw, topY);
  ctx.lineTo(rockX, topY - topHd);
  ctx.closePath();
  ctx.fill();

  // Inner edge glow from magma heat
  if (glowAlpha > 0.01) {
    ctx.strokeStyle = `rgba(255, 80, 10, ${glowAlpha})`;
    ctx.lineWidth = 1.8 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(rockX - topHw, topY);
    ctx.lineTo(rockX - hw, rockY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 140, 40, ${glowAlpha * 0.6})`;
    ctx.lineWidth = 1.2 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(rockX - topHw, topY);
    ctx.lineTo(rockX, topY - topHd);
    ctx.lineTo(rockX + topHw, topY);
    ctx.stroke();
  }
}

function drawLavaGeyserVentRim(
  ctx: CanvasRenderingContext2D,
  ventWidth: number,
  lavaIso: number,
  hazSeed: number,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const outerRx = ventWidth * 0.56;
  const outerRy = outerRx * lavaIso;
  const innerRx = ventWidth * 0.42;
  const innerRy = innerRx * lavaIso;
  const rimH = 6 * cameraZoom;
  const rimBaseY = -2 * cameraZoom;
  const rimTopY = rimBaseY - rimH;
  const segs = 16;
  const glowBoost = cycle.eruptionIntensity * 0.12 + (cycle.buildUp ? 0.08 : 0);

  for (let pass = 0; pass < 2; pass++) {
    const startI = pass === 0 ? segs / 2 : 0;
    const endI = pass === 0 ? segs : segs / 2;

    for (let i = startI; i < endI; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = ((i + 1) / segs) * Math.PI * 2;
      const midA = (a0 + a1) / 2;
      const isFront = Math.sin(midA) > 0;

      const ox0 = Math.cos(a0) * outerRx;
      const oy0b = rimBaseY + Math.sin(a0) * outerRy;
      const oy0t = rimTopY + Math.sin(a0) * outerRy;
      const ox1 = Math.cos(a1) * outerRx;
      const oy1b = rimBaseY + Math.sin(a1) * outerRy;
      const oy1t = rimTopY + Math.sin(a1) * outerRy;

      const ix0 = Math.cos(a0) * innerRx;
      const iy0t = rimTopY + Math.sin(a0) * innerRy;
      const ix1 = Math.cos(a1) * innerRx;
      const iy1t = rimTopY + Math.sin(a1) * innerRy;

      const lr = -Math.cos(midA);
      const light = 0.5 + lr * 0.3;

      if (isFront) {
        const oR = Math.floor(38 * light + 14);
        const oG = Math.floor(24 * light + 8);
        const oB = Math.floor(14 * light + 4);
        ctx.fillStyle = `rgb(${oR}, ${oG}, ${oB})`;
        ctx.beginPath();
        ctx.moveTo(ox0, oy0b);
        ctx.lineTo(ox1, oy1b);
        ctx.lineTo(ox1, oy1t);
        ctx.lineTo(ox0, oy0t);
        ctx.closePath();
        ctx.fill();
      }

      const tR = Math.floor(48 * light + 18);
      const tG = Math.floor(30 * light + 10);
      const tB = Math.floor(18 * light + 5);
      ctx.fillStyle = `rgb(${tR}, ${tG}, ${tB})`;
      ctx.beginPath();
      ctx.moveTo(ox0, oy0t);
      ctx.lineTo(ox1, oy1t);
      ctx.lineTo(ix1, iy1t);
      ctx.lineTo(ix0, iy0t);
      ctx.closePath();
      ctx.fill();

      if (isFront && glowBoost > 0.01) {
        const glowH = rimH * 0.5;
        ctx.fillStyle = `rgba(255, 100, 20, ${glowBoost * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(ix0, iy0t);
        ctx.lineTo(ix1, iy1t);
        ctx.lineTo(ix1, iy1t + glowH);
        ctx.lineTo(ix0, iy0t + glowH);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

function drawLavaGeyserBackRocks(
  ctx: CanvasRenderingContext2D,
  ventWidth: number,
  lavaIso: number,
  layout: LavaGeyserLayout,
  cycle: LavaGeyserCycleState,
  cameraZoom: number,
): void {
  const glowAlpha =
    0.25 +
    cycle.eruptionIntensity * 0.4 +
    (cycle.buildUp ? 0.15 : 0) +
    cycle.dormantGlow * 0.1;

  for (const rock of layout.backRocks) {
    const rd = 0.52 + rock.offset;
    const rx = Math.cos(rock.angle) * ventWidth * rd;
    const ry = Math.sin(rock.angle) * ventWidth * rd * lavaIso;
    drawLavaGeyserVentRock(
      ctx,
      rx,
      ry,
      rock.w * cameraZoom,
      rock.h * cameraZoom,
      rock.taper,
      glowAlpha,
      cameraZoom,
      false,
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
  const intensity = cycle.buildUp ? 1.35 : cycle.isErupting ? 1.5 : 1;
  const whiteHot = cycle.buildUp ? 220 : cycle.isErupting ? 250 : 120;

  ctx.save();
  ctx.translate(0, poolY);

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
    drawOrganicBlobAt(
      ctx,
      cx,
      cy,
      crustSize,
      crustSize * lavaIso,
      hazSeed + crust * 19,
      0.25,
    );
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
      0,
      Math.PI * 1.4,
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
  const glowAlpha =
    0.3 +
    cycle.eruptionIntensity * 0.45 +
    (cycle.buildUp ? 0.2 : 0) +
    cycle.dormantGlow * 0.15;

  for (const rock of layout.frontRocks) {
    const rd = 0.52 + rock.offset;
    const rx = Math.cos(rock.angle) * ventWidth * rd;
    const ry = Math.sin(rock.angle) * ventWidth * rd * lavaIso;
    drawLavaGeyserVentRock(
      ctx,
      rx,
      ry,
      rock.w * cameraZoom,
      rock.h * cameraZoom,
      rock.taper,
      glowAlpha,
      cameraZoom,
      true,
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
    const pulsePhase = (cycle.cycleTime - 3.8) / 1.2;
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
  const columnGrad = ctx.createLinearGradient(
    0,
    -8 * cameraZoom,
    0,
    -columnHeight,
  );
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
    -columnBaseWidth * 0.8 + wobble1,
    -columnHeight * 0.3,
    -columnBaseWidth * 0.3 + wobble3,
    -columnHeight * 0.65,
    wobble1 * 0.3,
    -columnHeight,
  );
  ctx.bezierCurveTo(
    columnBaseWidth * 0.3 + wobble2,
    -columnHeight * 0.65,
    columnBaseWidth * 0.8 + wobble2,
    -columnHeight * 0.3,
    columnBaseWidth,
    -8 * cameraZoom,
  );
  ctx.closePath();
  ctx.fill();

  // Inner bright core of column
  ctx.shadowBlur = 0;
  const coreGrad = ctx.createLinearGradient(
    0,
    -8 * cameraZoom,
    0,
    -columnHeight * 0.7,
  );
  coreGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
  coreGrad.addColorStop(0.3, "rgba(255, 220, 100, 0.5)");
  coreGrad.addColorStop(1, "transparent");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(-columnBaseWidth * 0.35, -8 * cameraZoom);
  ctx.quadraticCurveTo(
    wobble3 * 0.3,
    -columnHeight * 0.4,
    wobble1 * 0.15,
    -columnHeight * 0.7,
  );
  ctx.quadraticCurveTo(
    wobble2 * 0.3,
    -columnHeight * 0.4,
    columnBaseWidth * 0.35,
    -8 * cameraZoom,
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
    const bombHeight =
      Math.sin((bombPhase / 1.2) * Math.PI) * 95 * cameraZoom -
      bombGravity * 0.3;
    const bombX = Math.cos(bombAngle) * bombDist;
    const bombY = Math.sin(bombAngle) * bombDist * lavaIso - bombHeight;
    const bombSize = (5.5 - bombPhase * 2.5) * cameraZoom;
    const bombAlpha = 1 - bombPhase / 1.2;

    // Bomb trail
    ctx.strokeStyle = `rgba(255, 140, 20, ${bombAlpha * 0.35})`;
    ctx.lineWidth = bombSize * 0.6;
    ctx.beginPath();
    const prevPhase = Math.max(0, bombPhase - 0.08);
    const prevDist = prevPhase * sRad * 1.6;
    const prevHeight =
      Math.sin((prevPhase / 1.2) * Math.PI) * 95 * cameraZoom -
      prevPhase * prevPhase * 50 * cameraZoom * 0.3;
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
    const bGrad = ctx.createRadialGradient(
      bombX,
      bombY,
      0,
      bombX,
      bombY,
      bombSize,
    );
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
      const sparkHeight =
        (1 - sparkPhase) * 60 * cameraZoom * ei + 10 * cameraZoom;
      const sx = Math.cos(sparkAngle) * sparkDist;
      const sy = Math.sin(sparkAngle) * sparkDist * lavaIso - sparkHeight;
      const sparkSize =
        (1.2 + (spark % 3) * 0.4) * cameraZoom * (1 - sparkPhase);

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
    const smokePhase =
      (time * 0.4 + s * 0.45 + seededNoise(hazSeed + s * 3) * 2) % 3.5;
    const smokeAngle = s * 1.1 + hazSeed * 0.02;
    const driftX = Math.sin(time * 0.3 + s) * sRad * 0.15;
    const smokeX = Math.cos(smokeAngle) * sRad * 0.12 + driftX;
    const smokeY = -smokePhase * 45 * cameraZoom - 10 * cameraZoom;
    const smokeSize = (4 + smokePhase * 6 + s * 1.5) * cameraZoom;
    const smokeAlpha =
      (0.22 + cycle.eruptionIntensity * 0.15) * (1 - smokePhase / 3.5);

    const smokeGrad = ctx.createRadialGradient(
      smokeX,
      smokeY,
      0,
      smokeX,
      smokeY,
      smokeSize,
    );
    smokeGrad.addColorStop(0, `rgba(60, 48, 38, ${smokeAlpha})`);
    smokeGrad.addColorStop(0.6, `rgba(45, 35, 28, ${smokeAlpha * 0.6})`);
    smokeGrad.addColorStop(1, "transparent");
    ctx.fillStyle = smokeGrad;
    drawOrganicBlobAt(
      ctx,
      smokeX,
      smokeY,
      smokeSize,
      smokeSize * lavaIso,
      hazSeed + s * 31.7,
      0.18,
    );
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
    const emberPhase =
      (time * 0.6 + ember * 0.32 + seededNoise(emberSeed) * 2) % 2.5;
    const emberAngle = ember * 0.81 + hazSeed * 0.01;
    const drift = Math.sin(time * 0.8 + ember * 1.3) * sRad * 0.12;
    const emberX = Math.cos(emberAngle) * sRad * 0.2 + drift;
    const emberY = -emberPhase * 50 * cameraZoom - 5 * cameraZoom;
    const emberSize =
      (1.5 + (ember % 3) * 0.7) * cameraZoom * (1 - emberPhase / 2.5);
    const fadeAlpha = 1 - emberPhase / 2.5;

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
  const shimmerAlpha =
    0.06 +
    (cycle.buildUp ? 0.08 : 0) +
    cycle.eruptionIntensity * 0.1 +
    cycle.dormantGlow * 0.04;

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
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 41.3 + (pos.y || 0) * 23.7;
  const iso = ISO_Y_RATIO;

  const cycleTime = (time + seededNoise(hazSeed) * 7) % 7;
  const isSummoning = cycleTime < 2.0;
  const buildUp = cycleTime > 5.5;
  const summonIntensity = isSummoning
    ? Math.sin((cycleTime / 2.0) * Math.PI)
    : 0;

  const baseRx = sRad * 0.72;
  const baseRy = baseRx * iso;
  const rimRx = sRad * 0.28;
  const rimRy = rimRx * iso;
  const coneHeight = 38 * cameraZoom;
  const baseY = 5 * cameraZoom;
  const rimY = baseY - coneHeight;

  drawVolcanoScorchedBase(
    ctx,
    sRad,
    iso,
    hazSeed,
    time,
    buildUp,
    summonIntensity,
  );
  drawVolcanoLavaVeins(
    ctx,
    sRad,
    iso,
    hazSeed,
    time,
    buildUp,
    summonIntensity,
    cameraZoom,
  );
  drawVolcanoRubble(ctx, baseRx, baseY, iso, hazSeed, cameraZoom);
  drawVolcanoConeBody(
    ctx,
    baseRx,
    baseRy,
    rimRx,
    rimRy,
    baseY,
    rimY,
    cameraZoom,
    buildUp,
    isSummoning,
    summonIntensity,
  );
  drawVolcanoGlowingFissures(
    ctx,
    baseRx,
    rimRx,
    baseY,
    rimY,
    iso,
    hazSeed,
    time,
    cameraZoom,
    buildUp,
    summonIntensity,
  );
  drawVolcanoStrata(ctx, baseRx, rimRx, baseY, rimY, iso, hazSeed, cameraZoom);
  drawVolcanoLavaFlows(
    ctx,
    baseRx,
    baseY,
    rimRx,
    rimY,
    iso,
    hazSeed,
    time,
    cameraZoom,
    buildUp,
    summonIntensity,
  );
  drawVolcanoRockOutcrops(
    ctx,
    baseRx,
    rimRx,
    baseY,
    rimY,
    iso,
    hazSeed,
    cameraZoom,
  );
  drawVolcanoCrater(
    ctx,
    rimRx,
    rimRy,
    rimY,
    iso,
    cameraZoom,
    time,
    hazSeed,
    buildUp,
    isSummoning,
    summonIntensity,
  );
  drawVolcanoFireball(
    ctx,
    sRad,
    rimY,
    hazSeed,
    cycleTime,
    cameraZoom,
    isSummoning,
    summonIntensity,
  );
  drawVolcanoEmbers(
    ctx,
    sRad,
    rimY,
    hazSeed,
    time,
    cameraZoom,
    isSummoning,
    summonIntensity,
  );
  drawVolcanoAshCloud(
    ctx,
    sRad,
    rimY,
    hazSeed,
    time,
    cameraZoom,
    isSummoning,
    summonIntensity,
  );
  drawVolcanoHeatShimmer(
    ctx,
    sRad,
    iso,
    time,
    hazSeed,
    buildUp,
    isSummoning,
    summonIntensity,
    cameraZoom,
  );
}

function drawVolcanoScorchedBase(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  iso: number,
  hazSeed: number,
  time: number,
  buildUp: boolean,
  summonIntensity: number,
): void {
  const heatBoost = buildUp ? 0.08 : summonIntensity * 0.1;
  const baseGrad = ctx.createRadialGradient(0, 0, sRad * 0.1, 0, 0, sRad * 1.4);
  baseGrad.addColorStop(
    0,
    `rgba(${90 + Math.floor(heatBoost * 100)}, 38, 12, 0.96)`,
  );
  baseGrad.addColorStop(0.25, "rgba(65, 28, 10, 0.92)");
  baseGrad.addColorStop(0.5, "rgba(45, 20, 7, 0.75)");
  baseGrad.addColorStop(0.75, "rgba(30, 14, 4, 0.4)");
  baseGrad.addColorStop(1, "transparent");
  ctx.fillStyle = baseGrad;
  drawOrganicBlob(ctx, sRad * 1.4, sRad * 1.3 * iso, hazSeed, 0.24);
  ctx.fill();

  for (let soot = 0; soot < 8; soot++) {
    const sSeed = hazSeed + soot * 13.7;
    const sAngle = seededNoise(sSeed) * Math.PI * 2;
    const sDist = sRad * (0.6 + seededNoise(sSeed + 1) * 0.5);
    const sx = Math.cos(sAngle) * sDist;
    const sy = Math.sin(sAngle) * sDist * iso;
    const sSize = sRad * (0.04 + seededNoise(sSeed + 2) * 0.05);
    ctx.fillStyle = `rgba(20, 10, 4, ${0.2 + seededNoise(sSeed + 3) * 0.15})`;
    drawOrganicBlobAt(ctx, sx, sy, sSize * 1.3, sSize * iso, sSeed + 10, 0.3);
    ctx.fill();
  }
}

function drawVolcanoLavaVeins(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  iso: number,
  hazSeed: number,
  time: number,
  buildUp: boolean,
  summonIntensity: number,
  cameraZoom: number,
): void {
  for (let vein = 0; vein < 10; vein++) {
    const vSeed = hazSeed + vein * 7;
    const veinAngle =
      (vein / 10) * Math.PI * 2 + Math.sin(hazSeed + vein * 3) * 0.25;
    const veinLen = sRad * (0.5 + seededNoise(vSeed) * 0.45);
    const pulse = 0.3 + Math.sin(time * 2.5 + vein * 0.9) * 0.18;
    const intensity = pulse + (buildUp ? 0.25 : 0) + summonIntensity * 0.35;

    ctx.save();
    ctx.shadowColor = `rgba(255, 80, 0, ${intensity * 0.3})`;
    ctx.shadowBlur = 4 * cameraZoom;

    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle =
        pass === 0
          ? `rgba(200, 60, 0, ${intensity * 0.4})`
          : `rgba(255, 120, 10, ${intensity})`;
      ctx.lineWidth =
        (pass === 0 ? 3.5 : 1.8 + Math.sin(hazSeed + vein) * 0.6) * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);

      let cx = 0;
      let cy = 0;
      const segs = 4;
      for (let seg = 1; seg <= segs; seg++) {
        const t = seg / segs;
        const jit = (seededNoise(vSeed + seg * 5) - 0.5) * 0.2;
        cx = Math.cos(veinAngle + jit) * veinLen * t;
        cy = Math.sin(veinAngle + jit) * veinLen * t * iso;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawVolcanoRubble(
  ctx: CanvasRenderingContext2D,
  baseRx: number,
  baseY: number,
  iso: number,
  hazSeed: number,
  cameraZoom: number,
): void {
  for (let rub = 0; rub < 14; rub++) {
    const rubAngle =
      (rub / 14) * Math.PI * 2 + seededNoise(hazSeed + rub * 7.3) * 0.3;
    const rubDist = baseRx * (0.88 + seededNoise(hazSeed + rub * 4.1) * 0.4);
    const rx = Math.cos(rubAngle) * rubDist;
    const ry = baseY + Math.sin(rubAngle) * rubDist * iso;
    const rubSize = (2.5 + seededNoise(hazSeed + rub * 9) * 4) * cameraZoom;
    const rubIso = rubSize * iso;
    const rubLr = -Math.cos(rubAngle);
    const rubLight = 0.5 + rubLr * 0.3;
    const rr = Math.floor(45 * rubLight + 20);
    const rg = Math.floor(28 * rubLight + 12);
    const rb = Math.floor(16 * rubLight + 6);

    ctx.fillStyle = `rgb(${rr}, ${rg}, ${rb})`;
    ctx.beginPath();
    ctx.moveTo(rx - rubSize, ry);
    ctx.lineTo(rx, ry + rubIso);
    ctx.lineTo(rx + rubSize, ry);
    ctx.lineTo(rx, ry - rubIso);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(${rr - 10}, ${rg - 5}, ${rb - 3}, 0.3)`;
    ctx.lineWidth = 0.5 * cameraZoom;
    ctx.stroke();
  }
}

function drawVolcanoConeBody(
  ctx: CanvasRenderingContext2D,
  baseRx: number,
  baseRy: number,
  rimRx: number,
  rimRy: number,
  baseY: number,
  rimY: number,
  cameraZoom: number,
  buildUp: boolean,
  isSummoning: boolean,
  summonIntensity: number,
): void {
  const CONE_SEGS = 24;

  for (let pass = 0; pass < 2; pass++) {
    const startI = pass === 0 ? CONE_SEGS / 2 : 0;
    const endI = pass === 0 ? CONE_SEGS : CONE_SEGS / 2;

    for (let i = startI; i < endI; i++) {
      const a0 = (i / CONE_SEGS) * Math.PI * 2;
      const a1 = ((i + 1) / CONE_SEGS) * Math.PI * 2;
      const midA = (a0 + a1) / 2;

      const bx0 = Math.cos(a0) * baseRx;
      const by0 = baseY + Math.sin(a0) * baseRy;
      const bx1 = Math.cos(a1) * baseRx;
      const by1 = baseY + Math.sin(a1) * baseRy;

      const tx0 = Math.cos(a0) * rimRx;
      const ty0 = rimY + Math.sin(a0) * rimRy;
      const tx1 = Math.cos(a1) * rimRx;
      const ty1 = rimY + Math.sin(a1) * rimRy;

      const lr = -Math.cos(midA);
      const fb = Math.sin(midA);
      const lightness = 0.5 + lr * 0.34 + fb * 0.08;

      const cr = Math.floor(55 * lightness + 18);
      const cg = Math.floor(34 * lightness + 10);
      const cb = Math.floor(20 * lightness + 5);
      const heatR = Math.floor(
        buildUp ? 30 : isSummoning ? 40 * summonIntensity : 0,
      );
      const heatG = Math.floor(
        buildUp ? 8 : isSummoning ? 12 * summonIntensity : 0,
      );

      ctx.fillStyle = `rgb(${Math.min(255, cr + heatR)}, ${cg + heatG}, ${cb})`;
      ctx.beginPath();
      ctx.moveTo(bx0, by0);
      ctx.lineTo(bx1, by1);
      ctx.lineTo(tx1, ty1);
      ctx.lineTo(tx0, ty0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 0, 0, ${0.05 + Math.abs(lr) * 0.06})`;
      ctx.lineWidth = 0.4 * cameraZoom;
      ctx.stroke();
    }
  }
}

function drawVolcanoGlowingFissures(
  ctx: CanvasRenderingContext2D,
  baseRx: number,
  rimRx: number,
  baseY: number,
  rimY: number,
  iso: number,
  hazSeed: number,
  time: number,
  cameraZoom: number,
  buildUp: boolean,
  summonIntensity: number,
): void {
  const fissureGlow = 0.3 + (buildUp ? 0.3 : summonIntensity * 0.4);

  for (let fis = 0; fis < 6; fis++) {
    const fSeed = hazSeed + fis * 19.7;
    const fAngle = (fis / 6) * Math.PI + seededNoise(fSeed) * 0.4;
    const startT = 0.1 + seededNoise(fSeed + 1) * 0.2;
    const endT = 0.7 + seededNoise(fSeed + 2) * 0.25;
    const pulse = Math.sin(time * 2 + fis * 1.3) * 0.15;
    const alpha = fissureGlow + pulse;

    ctx.save();
    ctx.shadowColor = `rgba(255, 100, 0, ${alpha * 0.6})`;
    ctx.shadowBlur = 6 * cameraZoom;

    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle =
        pass === 0
          ? `rgba(255, 60, 0, ${alpha * 0.4})`
          : `rgba(255, 160, 40, ${alpha})`;
      ctx.lineWidth = (pass === 0 ? 3 : 1.2) * cameraZoom;
      ctx.beginPath();

      for (let seg = 0; seg <= 6; seg++) {
        const t = startT + (endT - startT) * (seg / 6);
        const interpRx = baseRx + (rimRx - baseRx) * t;
        const interpY = baseY + (rimY - baseY) * t;
        const jit = (seededNoise(fSeed + seg * 7) - 0.5) * 3 * cameraZoom;
        const x = Math.cos(fAngle) * interpRx * 1.01 + jit;
        const y = interpY + Math.sin(fAngle) * interpRx * iso * 1.01;
        if (seg === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawVolcanoStrata(
  ctx: CanvasRenderingContext2D,
  baseRx: number,
  rimRx: number,
  baseY: number,
  rimY: number,
  iso: number,
  hazSeed: number,
  cameraZoom: number,
): void {
  for (let stratum = 0; stratum < 5; stratum++) {
    const t = 0.15 + stratum * 0.17;
    const stratRx = baseRx + (rimRx - baseRx) * t;
    const stratRy = stratRx * iso;
    const stratY = baseY + (rimY - baseY) * t;
    const jitter = (seededNoise(hazSeed + stratum * 17) * 2 - 1) * cameraZoom;

    ctx.strokeStyle = `rgba(20, 8, 3, ${0.18 + stratum * 0.04})`;
    ctx.lineWidth =
      (0.7 + seededNoise(hazSeed + stratum * 17) * 0.5) * cameraZoom;
    ctx.beginPath();
    for (let j = 0; j <= 12; j++) {
      const a = (j / 12) * Math.PI;
      const sx = Math.cos(a) * stratRx;
      const sy = stratY + Math.sin(a) * stratRy + jitter;
      if (j === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }
}

function drawVolcanoLavaFlows(
  ctx: CanvasRenderingContext2D,
  baseRx: number,
  baseY: number,
  rimRx: number,
  rimY: number,
  iso: number,
  hazSeed: number,
  time: number,
  cameraZoom: number,
  buildUp: boolean,
  summonIntensity: number,
): void {
  const flowIntensity = 0.4 + (buildUp ? 0.3 : summonIntensity * 0.5);

  for (let flow = 0; flow < 4; flow++) {
    const fSeed = hazSeed + flow * 31.7;
    const fAngle = (flow / 4) * Math.PI + 0.3 + seededNoise(fSeed) * 0.4;
    const flowWidth = (3 + seededNoise(fSeed + 1) * 2) * cameraZoom;
    const flowLen = 0.5 + seededNoise(fSeed + 2) * 0.35;
    const flowPulse = Math.sin(time * 1.5 + flow * 1.7) * 0.1;

    ctx.save();
    ctx.shadowColor = `rgba(255, 80, 0, ${(flowIntensity + flowPulse) * 0.4})`;
    ctx.shadowBlur = 5 * cameraZoom;

    const segs = 8;
    const points: { x: number; y: number }[] = [];
    for (let seg = 0; seg <= segs; seg++) {
      const t = seg / segs;
      const lerpT = t * flowLen;
      const interpRx = rimRx + (baseRx - rimRx) * lerpT;
      const interpY = rimY + (baseY - rimY) * lerpT;
      const jit = (seededNoise(fSeed + seg * 5) - 0.5) * 4 * cameraZoom * t;
      points.push({
        x: Math.cos(fAngle) * interpRx * 1.02 + jit,
        y: interpY + Math.sin(fAngle) * interpRx * iso * 1.02,
      });
    }

    for (let pass = 0; pass < 2; pass++) {
      const w = pass === 0 ? flowWidth * 1.8 : flowWidth;
      const alpha = flowIntensity + flowPulse;
      ctx.strokeStyle =
        pass === 0
          ? `rgba(200, 50, 0, ${alpha * 0.35})`
          : `rgba(255, 150, 30, ${alpha * 0.8})`;
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let p = 1; p < points.length; p++) {
        ctx.lineTo(points[p].x, points[p].y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(255, 230, 100, ${(flowIntensity + flowPulse) * 0.4})`;
    ctx.lineWidth = flowWidth * 0.4;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let p = 1; p < points.length - 1; p++) {
      ctx.lineTo(points[p].x, points[p].y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function drawVolcanoRockOutcrops(
  ctx: CanvasRenderingContext2D,
  baseRx: number,
  rimRx: number,
  baseY: number,
  rimY: number,
  iso: number,
  hazSeed: number,
  cameraZoom: number,
): void {
  for (let rock = 0; rock < 10; rock++) {
    const rockAngle =
      (rock / 10) * Math.PI + seededNoise(hazSeed + rock * 5.3) * 0.3;
    const rockT = 0.15 + seededNoise(hazSeed + rock * 8.7) * 0.55;
    const interpRx = baseRx + (rimRx - baseRx) * rockT;
    const interpY = baseY + (rimY - baseY) * rockT;
    const rcx = Math.cos(rockAngle) * interpRx * 1.04;
    const rcy = interpY + Math.sin(rockAngle) * interpRx * iso * 1.04;
    const rockSize =
      (2.5 + seededNoise(hazSeed + rock * 3.1) * 3.5) * cameraZoom;

    const lr = -Math.cos(rockAngle);
    const rockLight = 0.5 + lr * 0.3;
    const crr = Math.floor(58 * rockLight + 16);
    const crg = Math.floor(36 * rockLight + 9);
    const crb = Math.floor(22 * rockLight + 5);

    ctx.fillStyle = `rgb(${crr}, ${crg}, ${crb})`;
    ctx.beginPath();
    const rSegs = 5 + Math.floor(seededNoise(hazSeed + rock * 2.1) * 3);
    for (let seg = 0; seg < rSegs; seg++) {
      const a = (seg / rSegs) * Math.PI * 2;
      const r =
        rockSize * (0.7 + seededNoise(hazSeed + rock * 7 + seg * 3) * 0.3);
      const px = rcx + Math.cos(a) * r;
      const py = rcy + Math.sin(a) * r * iso;
      if (seg === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(${crr - 15}, ${crg - 8}, ${crb - 3}, 0.25)`;
    ctx.lineWidth = 0.5 * cameraZoom;
    ctx.stroke();
  }
}

function drawVolcanoCrater(
  ctx: CanvasRenderingContext2D,
  rimRx: number,
  rimRy: number,
  rimY: number,
  iso: number,
  cameraZoom: number,
  time: number,
  hazSeed: number,
  buildUp: boolean,
  isSummoning: boolean,
  summonIntensity: number,
): void {
  const craterDepth = 6 * cameraZoom;

  const innerGrad = ctx.createLinearGradient(
    0,
    rimY - 2 * cameraZoom,
    0,
    rimY + craterDepth,
  );
  innerGrad.addColorStop(0, "rgba(45, 20, 7, 0.92)");
  innerGrad.addColorStop(0.4, "rgba(90, 32, 10, 0.88)");
  innerGrad.addColorStop(0.7, "rgba(160, 60, 12, 0.9)");
  innerGrad.addColorStop(1, "rgba(200, 80, 18, 0.92)");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.ellipse(0, rimY, rimRx, rimRy, 0, 0, Math.PI * 2);
  ctx.fill();

  const glowIntensity = buildUp ? 1.5 : isSummoning ? 1.7 : 1;
  const magmaRx = rimRx * 0.72;
  const magmaRy = magmaRx * iso;

  ctx.save();
  const glowAlpha = 0.3 + (buildUp ? 0.3 : summonIntensity * 0.4);
  ctx.shadowColor = `rgba(255, 80, 0, ${glowAlpha})`;
  ctx.shadowBlur = (18 + summonIntensity * 30) * cameraZoom;

  const craterGrad = ctx.createRadialGradient(
    0,
    rimY + craterDepth * 0.3,
    0,
    0,
    rimY + craterDepth * 0.3,
    magmaRx,
  );
  craterGrad.addColorStop(
    0,
    `rgba(255, 230, ${buildUp ? 120 : 70}, ${glowIntensity})`,
  );
  craterGrad.addColorStop(0.3, "rgba(255, 150, 10, 0.92)");
  craterGrad.addColorStop(0.55, "rgba(230, 80, 0, 0.8)");
  craterGrad.addColorStop(0.8, "rgba(180, 45, 0, 0.5)");
  craterGrad.addColorStop(1, "rgba(100, 25, 0, 0.15)");
  ctx.fillStyle = craterGrad;
  ctx.beginPath();
  ctx.ellipse(0, rimY + craterDepth * 0.3, magmaRx, magmaRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let bubble = 0; bubble < 5; bubble++) {
    const bSeed = hazSeed + bubble * 7.3;
    const bPhase = (time * 0.8 + seededNoise(bSeed) * 2) % 2;
    if (bPhase > 0.6) continue;
    const bAngle = seededNoise(bSeed + 1) * Math.PI * 2;
    const bDist = magmaRx * 0.4 * seededNoise(bSeed + 2);
    const bx = Math.cos(bAngle) * bDist;
    const by = rimY + craterDepth * 0.3 + Math.sin(bAngle) * bDist * iso;
    const bLife = Math.sin((bPhase / 0.6) * Math.PI);
    const bSize = (2 + seededNoise(bSeed + 3) * 2) * cameraZoom * bLife;

    ctx.fillStyle = `rgba(255, 220, 80, ${0.6 * bLife})`;
    ctx.beginPath();
    ctx.arc(bx, by - bPhase * 4 * cameraZoom, bSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(85, 45, 18, 0.55)";
  ctx.lineWidth = 1.8 * cameraZoom;
  ctx.beginPath();
  ctx.ellipse(0, rimY, rimRx * 1.02, rimRy * 1.02, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawVolcanoFireball(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  rimY: number,
  hazSeed: number,
  cycleTime: number,
  cameraZoom: number,
  isSummoning: boolean,
  summonIntensity: number,
): void {
  if (!isSummoning) return;

  const fireballPhase = cycleTime / 2.0;
  const risePhase = Math.min(1, fireballPhase * 2);
  const arcHeight = 95 * cameraZoom * Math.sin(risePhase * Math.PI);
  const fireballY = rimY - arcHeight;
  const driftX =
    Math.sin(fireballPhase * Math.PI * 3) * sRad * 0.3 * fireballPhase;
  const fireballSize = (9 + summonIntensity * 7) * cameraZoom;

  ctx.save();
  for (let trail = 6; trail >= 0; trail--) {
    const trailT = Math.max(0, risePhase - trail * 0.04);
    const trailArc = 95 * cameraZoom * Math.sin(trailT * Math.PI);
    const trailYPos = rimY - trailArc;
    const trailX = Math.sin(trailT * Math.PI * 3) * sRad * 0.3 * trailT;
    const trailAlpha = (1 - trail * 0.14) * summonIntensity * 0.45;
    const trailSize = fireballSize * (1 - trail * 0.12);

    ctx.fillStyle = `rgba(255, ${80 + trail * 25}, 0, ${trailAlpha})`;
    ctx.beginPath();
    ctx.arc(trailX, trailYPos, trailSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowColor = "#ff5500";
  ctx.shadowBlur = 25 * cameraZoom;
  const fbGrad = ctx.createRadialGradient(
    driftX,
    fireballY,
    0,
    driftX,
    fireballY,
    fireballSize,
  );
  fbGrad.addColorStop(0, "rgba(255, 255, 210, 1)");
  fbGrad.addColorStop(0.2, "rgba(255, 220, 80, 0.96)");
  fbGrad.addColorStop(0.45, "rgba(255, 140, 20, 0.85)");
  fbGrad.addColorStop(0.7, "rgba(230, 70, 0, 0.6)");
  fbGrad.addColorStop(1, "rgba(180, 40, 0, 0.15)");
  ctx.fillStyle = fbGrad;
  ctx.beginPath();
  ctx.arc(driftX, fireballY, fireballSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let smoke = 0; smoke < 6; smoke++) {
    const smokeX =
      driftX + (seededNoise(hazSeed + smoke * 3) - 0.5) * 18 * cameraZoom;
    const smokeY = fireballY + smoke * 7 * cameraZoom;
    const smokeAlpha = (0.35 - smoke * 0.05) * summonIntensity;
    const smokeSize = (3 + smoke * 1.8) * cameraZoom;

    ctx.fillStyle = `rgba(70, 55, 40, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      smokeX,
      smokeY,
      smokeSize * 1.2,
      smokeSize * 0.8,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawVolcanoEmbers(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  rimY: number,
  hazSeed: number,
  time: number,
  cameraZoom: number,
  isSummoning: boolean,
  summonIntensity: number,
): void {
  const emberCount = isSummoning ? 18 : 12;
  for (let ember = 0; ember < emberCount; ember++) {
    const eSeed = hazSeed + ember * 3.7;
    const emberPhase = (time * 0.6 + ember * 0.3 + seededNoise(eSeed) * 2) % 3;
    const emberAngle =
      ember * 0.5 + hazSeed * 0.01 + seededNoise(eSeed + 1) * 0.5;
    const baseDist = sRad * 0.12 + seededNoise(eSeed + 2) * sRad * 0.25;
    const spreadFactor = isSummoning ? 1.3 + summonIntensity * 0.5 : 1;
    const emberDist = baseDist * spreadFactor;
    const emberX =
      Math.cos(emberAngle) * emberDist +
      (seededNoise(eSeed + 3) - 0.5) * 12 * cameraZoom;
    const riseSpeed = (35 + seededNoise(eSeed + 4) * 15) * cameraZoom;
    const emberYPos = rimY - emberPhase * riseSpeed;
    const emberSize =
      (1.5 + (ember % 4) * 0.5) * cameraZoom * (1 - emberPhase / 3);
    const emberAlpha = 1 - emberPhase / 3;

    if (ember < emberCount * 0.6) {
      ctx.save();
      ctx.shadowColor = `rgba(255, 150, 0, ${emberAlpha * 0.4})`;
      ctx.shadowBlur = 3 * cameraZoom;
      ctx.fillStyle = `rgba(255, ${150 + ember * 8}, ${40 - (ember % 5) * 8}, ${0.75 * emberAlpha})`;
      ctx.beginPath();
      ctx.arc(emberX, emberYPos, emberSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = `rgba(55, 45, 35, ${0.3 * emberAlpha})`;
      ctx.beginPath();
      ctx.arc(emberX, emberYPos, emberSize * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawVolcanoAshCloud(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  rimY: number,
  hazSeed: number,
  time: number,
  cameraZoom: number,
  isSummoning: boolean,
  summonIntensity: number,
): void {
  if (!isSummoning || summonIntensity < 0.3) return;

  const cloudAlpha = (summonIntensity - 0.3) * 0.5;
  for (let puff = 0; puff < 5; puff++) {
    const pSeed = hazSeed + puff * 11.3;
    const pPhase = (time * 0.4 + seededNoise(pSeed) * 3) % 3;
    const px =
      (seededNoise(pSeed + 1) - 0.5) * sRad * 0.6 +
      Math.sin(time * 0.3 + puff) * 8 * cameraZoom;
    const py = rimY - 50 * cameraZoom - pPhase * 25 * cameraZoom;
    const pSize = sRad * (0.1 + pPhase * 0.05 + seededNoise(pSeed + 2) * 0.06);
    const pAlpha = cloudAlpha * (1 - pPhase / 3);

    ctx.fillStyle = `rgba(60, 50, 45, ${pAlpha})`;
    ctx.beginPath();
    ctx.ellipse(px, py, pSize * 1.4, pSize * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVolcanoHeatShimmer(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  iso: number,
  time: number,
  hazSeed: number,
  buildUp: boolean,
  isSummoning: boolean,
  summonIntensity: number,
  cameraZoom: number,
): void {
  const baseAlpha =
    0.04 + (buildUp ? 0.1 : isSummoning ? summonIntensity * 0.12 : 0);

  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.5 + ring * 0.9 + hazSeed * 0.01) % 2.5;
    const ringR = sRad * (0.4 + ringPhase * 0.25);
    const ringAlpha = baseAlpha * (1 - ringPhase / 2.5);

    ctx.strokeStyle = `rgba(255, 160, 60, ${ringAlpha})`;
    ctx.lineWidth = (2 - ringPhase * 0.5) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringR, ringR * iso, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (buildUp || isSummoning) {
    const glowAlpha = buildUp ? 0.08 : summonIntensity * 0.1;
    const glowGrad = ctx.createRadialGradient(
      0,
      -10 * cameraZoom,
      0,
      0,
      -10 * cameraZoom,
      sRad * 0.7,
    );
    glowGrad.addColorStop(0, `rgba(255, 120, 30, ${glowAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 80, 10, ${glowAlpha * 0.4})`);
    glowGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -10 * cameraZoom,
      sRad * 0.7,
      sRad * 0.5 * iso,
      0,
      0,
      Math.PI * 2,
    );
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
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 19.3 + (pos.y || 0) * 37.1;

  // 1. Snow/frost accumulation around edges (organic)
  const frostGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.7,
    0,
    0,
    sRad * 1.2,
  );
  frostGrad.addColorStop(0, "transparent");
  frostGrad.addColorStop(0.5, "rgba(240, 248, 255, 0.4)");
  frostGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");
  ctx.fillStyle = frostGrad;
  drawOrganicBlob(ctx, sRad * 1.2, sRad * 1.2 * isoRatio, hazSeed, 0.2);
  ctx.fill();

  // Snow mounds at edges (irregular placement)
  ctx.fillStyle = "rgba(250, 250, 255, 0.7)";
  for (let mound = 0; mound < 10; mound++) {
    const moundAngle =
      (mound / 10) * Math.PI * 2 + Math.sin(hazSeed + mound) * 0.3;
    const moundDist = sRad * (0.85 + Math.sin(hazSeed + mound * 2) * 0.15);
    const moundX = Math.cos(moundAngle) * moundDist;
    const moundY = Math.sin(moundAngle) * moundDist * isoRatio;
    const moundSize = (6 + Math.sin(hazSeed + mound * 3) * 4) * cameraZoom;

    ctx.beginPath();
    ctx.ellipse(
      moundX,
      moundY,
      moundSize,
      moundSize * 0.4,
      moundAngle + Math.sin(hazSeed + mound) * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // 2. Multi-layer ice surface with depth (organic shape)
  const iceDeepGrad = ctx.createRadialGradient(
    0,
    5 * cameraZoom,
    0,
    0,
    5 * cameraZoom,
    sRad,
  );
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
    -sRad * 0.3,
    -sRad * 0.15 * isoRatio,
    0,
    0,
    0,
    sRad,
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
    const crackAngle =
      (crack / 6) * Math.PI * 2 + Math.sin(hazSeed + crack) * 0.4;
    const crackLen = sRad * (0.4 + Math.sin(crack * 2 + hazSeed) * 0.3);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    const segments = 4;
    for (let s = 1; s <= segments; s++) {
      const progress = s / segments;
      const baseX = Math.cos(crackAngle) * crackLen * progress;
      const baseY = Math.sin(crackAngle) * crackLen * progress * isoRatio;
      const jitter = Math.sin(crack * 5 + s * 3 + hazSeed) * 8 * cameraZoom;
      ctx.lineTo(
        baseX + Math.cos(crackAngle + Math.PI / 2) * jitter,
        baseY + Math.sin(crackAngle + Math.PI / 2) * jitter * isoRatio,
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
    const cy =
      Math.sin(crystal.angle + hazSeed * 0.1) * sRad * crystal.dist * isoRatio;
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
    const py =
      Math.sin(pAngle + time * 0.2) * pDist * isoRatio -
      pPhase * 15 * cameraZoom;
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

    const mistGrad = ctx.createRadialGradient(
      mistX,
      mistY,
      0,
      mistX,
      mistY,
      mistSize,
    );
    mistGrad.addColorStop(
      0,
      `rgba(200, 230, 255, ${0.15 * (1 - mistPhase / 2)})`,
    );
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
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 47.3 + (pos.y || 0) * 21.9;
  const cycle = getIceSpikesCycleState(hazSeed, time);
  const layout = getIceSpikesLayout(pos);
  const spikeIsoRatio = isoRatio * 0.95;

  // 1. Frostbite field and displaced snow
  const frostHalo = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.35,
    0,
    0,
    sRad * 1.5,
  );
  const burstBoost = cycle.burst ? 0.16 : cycle.active ? 0.08 : 0;
  frostHalo.addColorStop(0, `rgba(185, 225, 255, ${0.28 + burstBoost})`);
  frostHalo.addColorStop(
    0.5,
    `rgba(145, 195, 255, ${0.24 + burstBoost * 0.8})`,
  );
  frostHalo.addColorStop(
    0.85,
    `rgba(215, 240, 255, ${0.12 + burstBoost * 0.5})`,
  );
  frostHalo.addColorStop(1, "transparent");
  ctx.fillStyle = frostHalo;
  drawOrganicBlob(ctx, sRad * 1.35, sRad * 1.2 * spikeIsoRatio, hazSeed, 0.24);
  ctx.fill();

  // Chilled plate below spikes
  const plateShadow = ctx.createRadialGradient(
    0,
    8 * cameraZoom,
    0,
    0,
    8 * cameraZoom,
    sRad * 1.05,
  );
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
    sRad * 1.05,
  );
  plateTop.addColorStop(0, `rgba(230, 248, 255, ${0.9 + cycle.extend * 0.08})`);
  plateTop.addColorStop(
    0.35,
    `rgba(170, 214, 248, ${0.76 + cycle.extend * 0.1})`,
  );
  plateTop.addColorStop(0.7, "rgba(110, 170, 230, 0.68)");
  plateTop.addColorStop(1, "rgba(75, 130, 195, 0.46)");
  ctx.fillStyle = plateTop;
  drawOrganicBlob(
    ctx,
    sRad * 0.92,
    sRad * 0.68 * spikeIsoRatio,
    hazSeed + 31,
    0.16,
  );
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
      const jag =
        (seededNoise(hazSeed + crack * 11.3 + segment * 3.1) - 0.5) *
        10 *
        cameraZoom;
      ctx.lineTo(
        baseX + Math.cos(crackAngle + Math.PI / 2) * jag,
        baseY + Math.sin(crackAngle + Math.PI / 2) * jag * spikeIsoRatio,
      );
    }
    ctx.stroke();
  }

  // 2. Chaotic spike field with depth sorting for stronger 3D read.
  // Dynamic detail level keeps cost stable on lower zooms.
  const detailScalar = cameraZoom >= 0.95 ? 1 : cameraZoom >= 0.7 ? 0.8 : 0.62;
  const spikeCount = Math.max(
    10,
    Math.floor(layout.spikes.length * detailScalar),
  );
  const spikes = layout.spikes.slice(0, spikeCount);
  spikes.sort(
    (a, b) => Math.sin(a.angle) * a.dist - Math.sin(b.angle) * b.dist,
  );
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
    const lean =
      (spike.lean - 0.5) * 14 * cameraZoom * (0.55 + cycle.extend * 0.45);
    const shimmer =
      0.94 +
      Math.sin(time * 1.9 + spike.phase * Math.PI * 2 + hazSeed * 0.1) * 0.08;

    const tipX = x + lean;
    const tipY = y - height;
    const baseBackX = x + lean * 0.25;
    const baseBackY = y - width * 0.75;

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
    ctx.ellipse(
      x,
      y + 1.5 * cameraZoom,
      width * 0.95,
      width * 0.34,
      0,
      0,
      Math.PI * 2,
    );
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
  const shardCount = Math.max(
    10,
    Math.floor(layout.rimShards.length * detailScalar),
  );
  for (let i = 0; i < shardCount; i++) {
    const shard = layout.rimShards[i];
    const shardDist = sRad * shard.dist;
    const sx = Math.cos(shard.angle) * shardDist;
    const sy = Math.sin(shard.angle) * shardDist * spikeIsoRatio;
    const sw = (2.8 + shard.width * 3.2) * cameraZoom;
    const sh =
      (8 + shard.height * 11) * cameraZoom * (0.25 + cycle.extend * 0.75);
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
    const dist =
      sRad * (0.12 + (mote % 5) * 0.16) + Math.sin(time + mote) * sRad * 0.05;
    const mx = Math.cos(angle + time * 0.26) * dist;
    const my =
      Math.sin(angle + time * 0.26) * dist * spikeIsoRatio -
      phase * 22 * cameraZoom;
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
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 23.1 + (pos.y || 0) * 41.9;

  // 1. Disturbed ground ring (organic)
  const disturbedGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.5,
    0,
    0,
    sRad * 1.3,
  );
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
    const crackAngle =
      (crack / 12) * Math.PI * 2 + Math.sin(hazSeed + crack) * 0.25;
    const crackStart = sRad * (0.8 + Math.sin(hazSeed + crack * 2) * 0.1);
    const crackEnd = sRad * (1.1 + Math.sin(hazSeed + crack * 3) * 0.1);
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(crackAngle) * crackStart,
      Math.sin(crackAngle) * crackStart * isoRatio,
    );
    ctx.lineTo(
      Math.cos(crackAngle + 0.1) * crackEnd,
      Math.sin(crackAngle + 0.1) * crackEnd * isoRatio,
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
      const spiralAngle = t * 4.5 + spiralSpeed + arm * ((Math.PI * 2) / 5);
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
      const spiralAngle = t * 4.5 + spiralSpeed + arm * ((Math.PI * 2) / 5);
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
    const spiralAngle = t * 4.5 + spiralSpeed + armIdx * ((Math.PI * 2) / 5);
    const gx = Math.cos(spiralAngle) * spiralR;
    const gy = Math.sin(spiralAngle) * spiralR * isoRatio;
    const sz =
      (1.5 + seededNoise(grainSeed + 3) * 2) * cameraZoom * (0.4 + t * 0.6);
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
    drawOrganicBlob(
      ctx,
      rippleR,
      rippleR * isoRatio,
      hazSeed + ripple * 20,
      0.1,
    );
    ctx.stroke();
  }

  // 5. Debris being pulled in
  const debrisItems = [
    { type: "bone", angle: 0.5 + hazSeed * 0.01, dist: 0.6 },
    { type: "stick", angle: 2.1 + hazSeed * 0.01, dist: 0.7 },
    { type: "rock", angle: 3.8 + hazSeed * 0.01, dist: 0.5 },
    { type: "skull", angle: 5.2 + hazSeed * 0.01, dist: 0.4 },
  ];

  for (const debris of debrisItems) {
    const sinkProgress = (time * 0.15 + debris.angle) % 1;
    const debrisDist = debris.dist * sRad * (1 - sinkProgress * 0.5);
    const debrisX = Math.cos(debris.angle + sinkProgress * 0.5) * debrisDist;
    const debrisY =
      Math.sin(debris.angle + sinkProgress * 0.5) * debrisDist * isoRatio;
    const debrisSink = sinkProgress * 8 * cameraZoom;

    ctx.save();
    ctx.translate(debrisX, debrisY + debrisSink);
    ctx.rotate(sinkProgress * 0.5);
    ctx.globalAlpha = 1 - sinkProgress * 0.7;

    if (debris.type === "bone") {
      ctx.fillStyle = "#e8dcc8";
      ctx.beginPath();
      ctx.ellipse(0, 0, 12 * cameraZoom, 3 * cameraZoom, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (debris.type === "rock") {
      ctx.fillStyle = "#7a7a7a";
      ctx.beginPath();
      ctx.moveTo(-8 * cameraZoom, 5 * cameraZoom);
      ctx.lineTo(-5 * cameraZoom, -6 * cameraZoom);
      ctx.lineTo(7 * cameraZoom, -4 * cameraZoom);
      ctx.lineTo(9 * cameraZoom, 4 * cameraZoom);
      ctx.closePath();
      ctx.fill();
    } else if (debris.type === "skull") {
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
    const bubbleAngle =
      bubble * 0.785 + Math.sin(time + bubble + hazSeed) * 0.3;
    const bubbleDist = sRad * 0.3 + Math.sin(bubble * 2 + hazSeed) * sRad * 0.2;
    const bubbleX = Math.cos(bubbleAngle) * bubbleDist;
    const bubbleY = Math.sin(bubbleAngle) * bubbleDist * isoRatio;

    if (bubblePhase < 0.5) {
      const bubbleSize =
        (4 + (bubble % 3)) * cameraZoom * Math.sin(bubblePhase * Math.PI);
      ctx.fillStyle = `rgba(200, 170, 130, ${0.6 * (1 - bubblePhase * 2)})`;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 7. Warning sign
  ctx.save();
  const signAngle = hazSeed * 0.1;
  ctx.translate(
    Math.cos(signAngle) * sRad * 0.9,
    Math.sin(signAngle) * sRad * 0.4 * isoRatio - sRad * 0.3 * isoRatio,
  );

  ctx.fillStyle = "#5d4e37";
  ctx.fillRect(
    -3 * cameraZoom,
    -25 * cameraZoom,
    6 * cameraZoom,
    30 * cameraZoom,
  );

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
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 31.7 + (pos.y || 0) * 43.1;
  const tide = Math.sin(time * 0.85 + hazSeed * 0.03) * 0.5 + 0.5;

  // 1. Damp shoreline footprint
  const wetGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.45,
    0,
    0,
    sRad * 1.35,
  );
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
    sRad,
  );
  waterGrad.addColorStop(0, "rgba(82, 164, 202, 0.92)");
  waterGrad.addColorStop(0.33, "rgba(44, 116, 162, 0.9)");
  waterGrad.addColorStop(0.7, "rgba(20, 72, 118, 0.92)");
  waterGrad.addColorStop(1, "rgba(8, 30, 64, 0.96)");
  ctx.fillStyle = waterGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 70, 0.18);
  ctx.fill();

  // 3. Deeper center
  const depthGrad = ctx.createRadialGradient(
    0,
    3 * cameraZoom,
    0,
    0,
    3 * cameraZoom,
    sRad * 0.52,
  );
  depthGrad.addColorStop(0, "rgba(4, 18, 48, 0.95)");
  depthGrad.addColorStop(1, "rgba(8, 34, 64, 0.15)");
  ctx.fillStyle = depthGrad;
  drawOrganicBlob(ctx, sRad * 0.48, sRad * 0.4 * isoRatio, hazSeed + 120, 0.12);
  ctx.fill();

  // 3b. Submerged shelves and rock shadows to sell depth
  for (let shelf = 0; shelf < 3; shelf++) {
    const sSeed = hazSeed + shelf * 21.3;
    const shelfAngle = seededNoise(sSeed) * Math.PI * 2;
    const shelfDist = sRad * (0.22 + seededNoise(sSeed + 1) * 0.42);
    const sx = Math.cos(shelfAngle) * shelfDist;
    const sy = Math.sin(shelfAngle) * shelfDist * isoRatio;
    const shelfSize = sRad * (0.12 + seededNoise(sSeed + 2) * 0.12);
    const shelfGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, shelfSize);
    shelfGrad.addColorStop(0, "rgba(18, 60, 88, 0.18)");
    shelfGrad.addColorStop(0.7, "rgba(10, 34, 58, 0.22)");
    shelfGrad.addColorStop(1, "rgba(8, 18, 32, 0)");
    ctx.fillStyle = shelfGrad;
    ctx.beginPath();
    ctx.ellipse(
      sx,
      sy,
      shelfSize * 1.2,
      shelfSize * isoRatio * 0.9,
      seededNoise(sSeed + 3) * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // 4. Surface caustics and moving wave bands
  for (let band = 0; band < 5; band++) {
    const phase = time * 0.9 + band * 0.95 + hazSeed * 0.02;
    const r = sRad * (0.2 + band * 0.13) * (0.95 + tide * 0.05);
    const wobble = 1 + Math.sin(phase) * 0.06;
    ctx.strokeStyle = `rgba(170, 230, 255, ${0.14 + (4 - band) * 0.03})`;
    ctx.lineWidth = (2.2 - band * 0.22) * cameraZoom;
    drawOrganicBlob(
      ctx,
      r * wobble,
      r * isoRatio * wobble,
      hazSeed + band * 31,
      0.09,
    );
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

  // 5b. Underwater reeds and kelp fronds around the edge
  for (let reed = 0; reed < 8; reed++) {
    const rSeed = hazSeed + reed * 17.9;
    const angle = seededNoise(rSeed) * Math.PI * 2;
    const dist = sRad * (0.58 + seededNoise(rSeed + 1) * 0.3);
    const rx = Math.cos(angle) * dist;
    const ry = Math.sin(angle) * dist * isoRatio;
    const height = (16 + seededNoise(rSeed + 2) * 16) * cameraZoom;
    const sway = Math.sin(time * 0.9 + reed * 1.4) * 5 * cameraZoom;
    ctx.strokeStyle = `rgba(50, 115, 92, ${0.18 + seededNoise(rSeed + 3) * 0.12})`;
    ctx.lineWidth = (1 + seededNoise(rSeed + 4) * 0.8) * cameraZoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rx, ry + 2 * cameraZoom);
    ctx.quadraticCurveTo(
      rx + sway * 0.4,
      ry - height * 0.45,
      rx + sway,
      ry - height,
    );
    ctx.stroke();
  }

  // 5c. Slow drifting highlights and tiny floating debris
  for (let drift = 0; drift < 6; drift++) {
    const dSeed = hazSeed + drift * 13.1;
    const angle = seededNoise(dSeed) * Math.PI * 2 + time * 0.08;
    const dist = sRad * (0.12 + seededNoise(dSeed + 1) * 0.5);
    const dx = Math.cos(angle) * dist + Math.sin(time * 0.35 + drift) * 5 * cameraZoom;
    const dy = Math.sin(angle) * dist * isoRatio;
    const size = sRad * (0.03 + seededNoise(dSeed + 2) * 0.04);

    ctx.fillStyle = `rgba(180, 210, 190, ${0.12 + seededNoise(dSeed + 3) * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(
      dx,
      dy,
      size * 1.4,
      size * isoRatio * 0.75,
      seededNoise(dSeed + 4) * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // 6. Specular reflection
  const glintGrad = ctx.createRadialGradient(
    -sRad * 0.32,
    -sRad * 0.2 * isoRatio,
    0,
    -sRad * 0.32,
    -sRad * 0.2 * isoRatio,
    sRad * 0.42,
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
    Math.PI * 2,
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
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 59.9 + (pos.y || 0) * 19.7;
  const spin = time * 1.8;

  // 1. Turbulent water bed
  const basinGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.2,
    0,
    0,
    sRad * 1.2,
  );
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
  cameraZoom: number,
): void {
  // Two independent lightning slots, each with its own cycle
  for (let slot = 0; slot < 2; slot++) {
    const slotSeed = hazSeed + slot * 137.3;
    const cyclePeriod = 2.8 + seededNoise(slotSeed + 10) * 1.4;
    const cyclePhase =
      (time + seededNoise(slotSeed) * cyclePeriod) % cyclePeriod;
    const flashDuration = 0.18;

    if (cyclePhase > flashDuration) continue;

    const flashAlpha = 1 - cyclePhase / flashDuration;
    const boltAngle =
      seededNoise(slotSeed + Math.floor(time / cyclePeriod) * 7.1) *
      Math.PI *
      2;
    const boltDist =
      sRad *
      (0.15 +
        seededNoise(slotSeed + Math.floor(time / cyclePeriod) * 3.3) * 0.55);
    const startX = Math.cos(boltAngle) * boltDist * 0.3;
    const startY =
      Math.sin(boltAngle) * boltDist * 0.3 * isoRatio - sRad * 0.5 * cameraZoom;
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
      const jx =
        baseX +
        (seededNoise(slotSeed + s * 11.1 + Math.floor(time / cyclePeriod)) -
          0.5) *
          jitter;
      const jy =
        baseY +
        (seededNoise(slotSeed + s * 17.7 + Math.floor(time / cyclePeriod)) -
          0.5) *
          jitter *
          isoRatio;
      ctx.lineTo(jx, jy);
    }
    ctx.stroke();

    // Bright core
    ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha * 0.7})`;
    ctx.lineWidth = 1.2 * cameraZoom;
    ctx.stroke();

    // Impact flash at endpoint
    const impactGrad = ctx.createRadialGradient(
      endX,
      endY,
      0,
      endX,
      endY,
      8 * cameraZoom,
    );
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
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 27.1 + (pos.y || 0) * 61.3;
  const pulse = Math.sin(time * 3.4 + hazSeed * 0.03) * 0.5 + 0.5;
  const flashCycle = (time * 1.1 + hazSeed * 0.01) % 4;
  const flashActive = flashCycle < 0.12;
  const flashAlpha = flashActive ? 1 - flashCycle / 0.12 : 0;

  // 1. Wet ground — rain-darkened earth with reflective puddles
  const wetGrad = ctx.createRadialGradient(
    0,
    4 * cameraZoom,
    0,
    0,
    4 * cameraZoom,
    sRad * 1.2,
  );
  wetGrad.addColorStop(0, "rgba(18, 24, 42, 0.82)");
  wetGrad.addColorStop(0.4, "rgba(22, 30, 52, 0.7)");
  wetGrad.addColorStop(0.75, "rgba(16, 20, 38, 0.4)");
  wetGrad.addColorStop(1, "transparent");
  ctx.fillStyle = wetGrad;
  drawOrganicBlob(ctx, sRad * 1.15, sRad * 1.05 * isoRatio, hazSeed, 0.18);
  ctx.fill();

  // Reflective rain puddles scattered on ground
  for (let puddle = 0; puddle < 5; puddle++) {
    const pSeed = hazSeed + puddle * 19.3;
    const pAngle = seededNoise(pSeed) * Math.PI * 2;
    const pDist = sRad * (0.2 + seededNoise(pSeed + 1) * 0.5);
    const px = Math.cos(pAngle) * pDist;
    const py = Math.sin(pAngle) * pDist * isoRatio + 4 * cameraZoom;
    const pSize = sRad * (0.06 + seededNoise(pSeed + 2) * 0.06);
    const shimmer =
      0.18 + Math.sin(time * 4 + puddle * 1.7) * 0.08 + flashAlpha * 0.3;
    ctx.fillStyle = `rgba(100, 140, 200, ${shimmer})`;
    ctx.beginPath();
    ctx.ellipse(px, py, pSize * 1.3, pSize * 0.6 * isoRatio, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Swirling wind vortex rings on the ground
  for (let ring = 0; ring < 3; ring++) {
    const ringR = sRad * (0.35 + ring * 0.2);
    const spin = time * (1.2 - ring * 0.3) + ring * 2.1;
    const ringAlpha = 0.12 - ring * 0.03;
    ctx.save();
    ctx.strokeStyle = `rgba(120, 160, 220, ${ringAlpha})`;
    ctx.lineWidth = (2.5 - ring * 0.5) * cameraZoom;
    ctx.setLineDash([4 * cameraZoom, 6 * cameraZoom]);
    ctx.beginPath();
    for (let seg = 0; seg <= 24; seg++) {
      const t = seg / 24;
      const angle = t * Math.PI * 2 + spin;
      const wobble = 1 + Math.sin(angle * 3 + hazSeed) * 0.08;
      const x = Math.cos(angle) * ringR * wobble;
      const y = Math.sin(angle) * ringR * isoRatio * wobble + 2 * cameraZoom;
      if (seg === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 3. Towering cloud columns — stacked ellipses rising high
  const cloudCols = [
    { angle: 0.3, dist: 0.15, width: 0.55, layers: 7, height: 85 },
    { angle: 2.3, dist: 0.25, width: 0.4, layers: 6, height: 70 },
    { angle: 4.1, dist: 0.2, width: 0.45, layers: 6, height: 75 },
    { angle: 1.2, dist: 0.35, width: 0.3, layers: 5, height: 55 },
    { angle: 3.7, dist: 0.32, width: 0.32, layers: 5, height: 60 },
  ];
  for (let col = 0; col < cloudCols.length; col++) {
    const c = cloudCols[col];
    const baseX = Math.cos(c.angle + hazSeed * 0.01) * sRad * c.dist;
    const baseY = Math.sin(c.angle + hazSeed * 0.01) * sRad * c.dist * isoRatio;
    const drift = Math.sin(time * 0.4 + col * 1.7 + hazSeed) * 8 * cameraZoom;

    for (let layer = 0; layer < c.layers; layer++) {
      const t = layer / c.layers;
      const layerY = baseY - t * c.height * cameraZoom;
      const layerX = baseX + drift * t;
      const expand = 1 + Math.sin(t * Math.PI) * 0.3;
      const w = sRad * c.width * expand * (0.7 + (1 - t) * 0.3);
      const h = w * isoRatio * 0.7;
      const alpha = 0.35 - t * 0.04 + flashAlpha * 0.15;
      const r = Math.floor(35 + t * 40 + flashAlpha * 60);
      const g = Math.floor(40 + t * 50 + flashAlpha * 70);
      const b = Math.floor(65 + t * 80 + flashAlpha * 100);

      ctx.save();
      ctx.translate(layerX, layerY);
      const cGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
      cGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      cGrad.addColorStop(
        0.6,
        `rgba(${r - 15}, ${g - 15}, ${b - 10}, ${alpha * 0.6})`,
      );
      cGrad.addColorStop(1, "transparent");
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Anvil-top flat spread at the peak
    const anvilY = baseY - c.height * cameraZoom;
    const anvilX = baseX + drift;
    const anvilW = sRad * c.width * 1.4;
    ctx.save();
    ctx.translate(anvilX, anvilY);
    const anvilGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, anvilW);
    anvilGrad.addColorStop(0, `rgba(50, 55, 85, ${0.2 + flashAlpha * 0.12})`);
    anvilGrad.addColorStop(
      0.5,
      `rgba(40, 45, 72, ${0.12 + flashAlpha * 0.08})`,
    );
    anvilGrad.addColorStop(1, "transparent");
    ctx.fillStyle = anvilGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, anvilW, anvilW * isoRatio * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Lightning bolts — jagged vertical strikes from clouds to ground
  const boltCount = 3;
  for (let bolt = 0; bolt < boltCount; bolt++) {
    const bSeed = hazSeed + bolt * 37.1;
    const boltPhase = (time * 0.7 + seededNoise(bSeed) * 5) % 5;
    if (boltPhase > 0.25) continue;
    const boltLife = boltPhase / 0.25;
    const boltAlpha = (1 - boltLife) * 0.95;

    const bAngle = seededNoise(bSeed + 1) * Math.PI * 2;
    const bDist = sRad * (0.1 + seededNoise(bSeed + 2) * 0.35);
    const startX =
      Math.cos(bAngle) * bDist + Math.sin(time * 2 + bolt) * 6 * cameraZoom;
    const startY = Math.sin(bAngle) * bDist * isoRatio - 75 * cameraZoom;
    const endX = Math.cos(bAngle) * bDist * 0.8;
    const endY = Math.sin(bAngle) * bDist * 0.8 * isoRatio + 4 * cameraZoom;

    // Multi-pass glow bolt
    const passes = [
      { width: 8, color: `rgba(80, 120, 220, ${boltAlpha * 0.2})` },
      { width: 4, color: `rgba(150, 190, 255, ${boltAlpha * 0.5})` },
      { width: 1.5, color: `rgba(230, 240, 255, ${boltAlpha})` },
    ];
    for (const pass of passes) {
      ctx.save();
      ctx.shadowColor = `rgba(140, 180, 255, ${boltAlpha * 0.6})`;
      ctx.shadowBlur = 16 * cameraZoom;
      ctx.strokeStyle = pass.color;
      ctx.lineWidth = pass.width * cameraZoom;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const segs = 8;
      for (let seg = 1; seg <= segs; seg++) {
        const t = seg / segs;
        const mx = startX + (endX - startX) * t;
        const my = startY + (endY - startY) * t;
        const jag =
          (seededNoise(bSeed + seg * 3.7 + Math.floor(time * 4)) - 0.5) *
          18 *
          cameraZoom;
        ctx.lineTo(mx + jag, my);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Impact flash on ground
    ctx.save();
    ctx.shadowColor = `rgba(160, 200, 255, ${boltAlpha * 0.7})`;
    ctx.shadowBlur = 20 * cameraZoom;
    const impactGrad = ctx.createRadialGradient(
      endX,
      endY,
      0,
      endX,
      endY,
      sRad * 0.2,
    );
    impactGrad.addColorStop(0, `rgba(200, 230, 255, ${boltAlpha * 0.6})`);
    impactGrad.addColorStop(0.5, `rgba(100, 150, 255, ${boltAlpha * 0.2})`);
    impactGrad.addColorStop(1, "transparent");
    ctx.fillStyle = impactGrad;
    ctx.beginPath();
    ctx.ellipse(
      endX,
      endY,
      sRad * 0.2,
      sRad * 0.2 * isoRatio,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  // 5. Rain streaks — diagonal lines falling through the storm
  for (let rain = 0; rain < 28; rain++) {
    const rSeed = hazSeed + rain * 7.3;
    const rx = (seededNoise(rSeed) - 0.5) * sRad * 2;
    const rainSpeed = 1.2 + seededNoise(rSeed + 1) * 0.8;
    const ry =
      ((time * rainSpeed * 60 + seededNoise(rSeed + 2) * 200) %
        (100 * cameraZoom)) -
      80 * cameraZoom;
    const rLen = (8 + seededNoise(rSeed + 3) * 6) * cameraZoom;
    const rAlpha = 0.12 + seededNoise(rSeed + 4) * 0.1;
    const windSlant = 4 * cameraZoom;

    ctx.strokeStyle = `rgba(160, 190, 230, ${rAlpha})`;
    ctx.lineWidth = 0.8 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + windSlant, ry + rLen);
    ctx.stroke();
  }

  // 6. Crackling horizontal arcs between cloud masses
  ctx.strokeStyle = `rgba(175, 220, 255, ${0.2 + pulse * 0.25})`;
  ctx.lineWidth = 1.5 * cameraZoom;
  for (let arc = 0; arc < 4; arc++) {
    const arcPhase = (time * 1.5 + arc * 1.3 + hazSeed * 0.02) % 3;
    if (arcPhase > 0.4) continue;
    const arcAlpha = (1 - arcPhase / 0.4) * 0.6;
    const a1 = arc * 1.57 + hazSeed * 0.01;
    const a2 = a1 + 1.2 + Math.sin(hazSeed + arc) * 0.5;
    const r1 = sRad * 0.3;
    const r2 = sRad * 0.35;
    const h1 = -45 * cameraZoom - arc * 8 * cameraZoom;
    const h2 = -50 * cameraZoom - arc * 6 * cameraZoom;

    ctx.save();
    ctx.shadowColor = `rgba(140, 180, 255, ${arcAlpha * 0.5})`;
    ctx.shadowBlur = 8 * cameraZoom;
    ctx.strokeStyle = `rgba(200, 230, 255, ${arcAlpha})`;
    ctx.lineWidth = 1.2 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1 * isoRatio + h1);
    for (let seg = 1; seg <= 5; seg++) {
      const t = seg / 5;
      const angle = a1 + (a2 - a1) * t;
      const r = r1 + (r2 - r1) * t;
      const h = h1 + (h2 - h1) * t;
      const jag =
        (seededNoise(hazSeed + arc * 11 + seg * 3 + Math.floor(time * 6)) -
          0.5) *
        10 *
        cameraZoom;
      ctx.lineTo(Math.cos(angle) * r + jag, Math.sin(angle) * r * isoRatio + h);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 7. Charged motes spiraling upward through the storm column
  for (let mote = 0; mote < 18; mote++) {
    const phase = (time * 0.6 + mote * 0.31) % 2;
    const t = phase / 2;
    const angle = mote * 0.73 + hazSeed * 0.01 + time * 0.8;
    const radius = sRad * (0.1 + (mote % 5) * 0.07) * (1 + t * 0.3);
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius * isoRatio - t * 80 * cameraZoom;
    const size = (1 + (mote % 3) * 0.5) * cameraZoom * (1 - t * 0.6);

    ctx.save();
    ctx.shadowColor = "rgba(145, 210, 255, 0.7)";
    ctx.shadowBlur = 6 * cameraZoom;
    ctx.fillStyle = `rgba(195, 235, 255, ${0.35 + (1 - t) * 0.35})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 8. Global lightning flash overlay
  if (flashAlpha > 0.3) {
    const flashGrad = ctx.createRadialGradient(
      0,
      -30 * cameraZoom,
      0,
      0,
      -30 * cameraZoom,
      sRad * 1.5,
    );
    flashGrad.addColorStop(0, `rgba(200, 220, 255, ${flashAlpha * 0.15})`);
    flashGrad.addColorStop(0.5, `rgba(150, 180, 240, ${flashAlpha * 0.06})`);
    flashGrad.addColorStop(1, "transparent");
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -30 * cameraZoom,
      sRad * 1.5,
      sRad * 1.2 * isoRatio,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// ============================================================================
// THEMED HAZARD TYPES
// ============================================================================

function drawLavaPoolHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 37.3 + (pos.y || 0) * 53.7;
  const pulse = Math.sin(time * 2.2 + hazSeed) * 0.5 + 0.5;

  // 1. Scorched earth transition ring
  const scorchGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.55,
    0,
    0,
    sRad * 1.35,
  );
  scorchGrad.addColorStop(0, "rgba(50, 22, 8, 0.55)");
  scorchGrad.addColorStop(0.4, "rgba(60, 30, 10, 0.4)");
  scorchGrad.addColorStop(0.75, "rgba(40, 20, 5, 0.22)");
  scorchGrad.addColorStop(1, "transparent");
  ctx.fillStyle = scorchGrad;
  drawOrganicBlob(ctx, sRad * 1.3, sRad * 1.25 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  // Radial scorch cracks in ground
  ctx.strokeStyle = "rgba(90, 40, 15, 0.35)";
  ctx.lineWidth = 1.2 * cameraZoom;
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 + seededNoise(hazSeed + i * 2.3) * 0.4;
    const len = sRad * (0.75 + seededNoise(hazSeed + i * 4.1) * 0.5);
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * sRad * 0.6,
      Math.sin(angle) * sRad * 0.6 * isoRatio,
    );
    ctx.quadraticCurveTo(
      Math.cos(angle + 0.1) * len * 0.8,
      Math.sin(angle + 0.1) * len * 0.8 * isoRatio,
      Math.cos(angle - 0.05) * len,
      Math.sin(angle - 0.05) * len * isoRatio,
    );
    ctx.stroke();
  }

  // 2. Main lava body with depth gradient
  const lavaGrad = ctx.createRadialGradient(
    -sRad * 0.15,
    -sRad * 0.1 * isoRatio,
    0,
    0,
    0,
    sRad,
  );
  lavaGrad.addColorStop(0, "rgba(255, 210, 60, 0.96)");
  lavaGrad.addColorStop(0.2, "rgba(255, 140, 25, 0.94)");
  lavaGrad.addColorStop(0.45, "rgba(220, 70, 12, 0.92)");
  lavaGrad.addColorStop(0.72, "rgba(160, 35, 5, 0.94)");
  lavaGrad.addColorStop(1, "rgba(80, 15, 0, 0.9)");
  ctx.fillStyle = lavaGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 40, 0.16);
  ctx.fill();

  // 3. Cooling crust patches (dark organic blobs drifting on surface)
  for (let crust = 0; crust < 6; crust++) {
    const crustSeed = hazSeed + crust * 19.3;
    const cAngle = seededNoise(crustSeed) * Math.PI * 2 + time * 0.06;
    const cDist = sRad * (0.2 + seededNoise(crustSeed + 1) * 0.4);
    const cx = Math.cos(cAngle) * cDist;
    const cy = Math.sin(cAngle) * cDist * isoRatio;
    const cSize = sRad * (0.08 + seededNoise(crustSeed + 2) * 0.08);
    ctx.fillStyle = `rgba(40, 15, 5, ${0.55 + seededNoise(crustSeed + 3) * 0.25})`;
    drawOrganicBlobAt(
      ctx,
      cx,
      cy,
      cSize,
      cSize * isoRatio,
      crustSeed + 10,
      0.3,
    );
    ctx.fill();
  }

  // 4. Glowing veins between crust plates
  for (let vein = 0; vein < 8; vein++) {
    const vAngle = (vein / 8) * Math.PI * 2 + hazSeed * 0.1;
    const vDrift = time * 0.4 + vein * 1.1;
    const glowAlpha = 0.35 + pulse * 0.3 + Math.sin(vDrift + hazSeed) * 0.1;
    ctx.strokeStyle = `rgba(255, 180, 40, ${glowAlpha})`;
    ctx.lineWidth = (2.2 + Math.sin(vDrift) * 1) * cameraZoom;
    ctx.beginPath();
    const vR = sRad * (0.15 + Math.sin(vDrift + 1) * 0.1);
    const vEndR = sRad * (0.55 + Math.sin(vDrift + 2) * 0.15);
    ctx.moveTo(Math.cos(vAngle) * vR, Math.sin(vAngle) * vR * isoRatio);
    const midAngle = vAngle + 0.2 + Math.sin(vDrift * 0.5) * 0.1;
    ctx.quadraticCurveTo(
      Math.cos(midAngle) * (vR + vEndR) * 0.55,
      Math.sin(midAngle) * (vR + vEndR) * 0.55 * isoRatio,
      Math.cos(vAngle + 0.4) * vEndR,
      Math.sin(vAngle + 0.4) * vEndR * isoRatio,
    );
    ctx.stroke();
  }

  // 5. Bubbling surface
  for (let bubble = 0; bubble < 6; bubble++) {
    const bSeed = hazSeed + bubble * 7.3;
    const bPhase = (time * 0.8 + seededNoise(bSeed) * 3) % 3;
    if (bPhase > 1.8) continue;
    const bAngle = seededNoise(bSeed + 1) * Math.PI * 2;
    const bDist = sRad * (0.1 + seededNoise(bSeed + 2) * 0.5);
    const bx = Math.cos(bAngle) * bDist;
    const by = Math.sin(bAngle) * bDist * isoRatio;
    const bSize =
      (3 + (bubble % 3) * 1.2) *
      cameraZoom *
      Math.sin((bPhase / 1.8) * Math.PI);
    ctx.fillStyle = `rgba(255, 200, 60, ${0.5 * Math.sin((bPhase / 1.8) * Math.PI)})`;
    ctx.beginPath();
    ctx.arc(bx, by - bPhase * 5 * cameraZoom, bSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Rising embers and heat
  for (let ember = 0; ember < 12; ember++) {
    const ePhase = (time * 0.7 + seededNoise(hazSeed + ember * 3.7) * 2) % 2;
    const eAngle = seededNoise(hazSeed + ember * 5.1) * Math.PI * 2;
    const eDist = sRad * (0.1 + seededNoise(hazSeed + ember * 8.3) * 0.55);
    const ex =
      Math.cos(eAngle) * eDist + Math.sin(time * 2 + ember) * 2 * cameraZoom;
    const ey = Math.sin(eAngle) * eDist * isoRatio - ePhase * 22 * cameraZoom;
    const eSize = (1.5 + (ember % 3) * 0.8) * cameraZoom * (1 - ePhase / 2);
    ctx.fillStyle = `rgba(255, ${150 + (ember % 3) * 40}, 20, ${0.85 * (1 - ePhase / 2)})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Center heat shimmer
  const shimmerPhase = time * 1.8 + hazSeed;
  const shimmerR = sRad * (0.28 + Math.sin(shimmerPhase) * 0.04);
  ctx.fillStyle = `rgba(255, 220, 120, ${0.08 + Math.sin(shimmerPhase * 1.3) * 0.04})`;
  ctx.beginPath();
  ctx.ellipse(
    0,
    -4 * cameraZoom,
    shimmerR,
    shimmerR * 0.5 * isoRatio,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // 8. Specular glow at hottest point
  const glowGrad = ctx.createRadialGradient(
    -sRad * 0.12,
    -sRad * 0.08 * isoRatio,
    0,
    -sRad * 0.12,
    -sRad * 0.08 * isoRatio,
    sRad * 0.38,
  );
  glowGrad.addColorStop(0, `rgba(255, 245, 200, ${0.32 + pulse * 0.22})`);
  glowGrad.addColorStop(0.5, "rgba(255, 200, 100, 0.08)");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(
    -sRad * 0.1,
    -sRad * 0.06 * isoRatio,
    sRad * 0.4,
    sRad * 0.22 * isoRatio,
    -0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawSwampHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 29.3 + (pos.y || 0) * 47.1;

  // 1. Wide damp earth/mud transition with organic edges
  const wetGrad = ctx.createRadialGradient(0, 0, sRad * 0.4, 0, 0, sRad * 1.4);
  wetGrad.addColorStop(0, "rgba(28, 40, 12, 0.55)");
  wetGrad.addColorStop(0.3, "rgba(38, 52, 18, 0.42)");
  wetGrad.addColorStop(0.55, "rgba(32, 44, 16, 0.28)");
  wetGrad.addColorStop(0.8, "rgba(22, 32, 10, 0.12)");
  wetGrad.addColorStop(1, "transparent");
  ctx.fillStyle = wetGrad;
  drawOrganicBlob(ctx, sRad * 1.38, sRad * 1.32 * isoRatio, hazSeed, 0.26);
  ctx.fill();

  // Mud cracks in transition zone
  for (let i = 0; i < 10; i++) {
    const cSeed = hazSeed + i * 3.1;
    const angle = (i / 10) * Math.PI * 2 + seededNoise(cSeed) * 0.35;
    const start = sRad * (0.7 + seededNoise(cSeed + 1) * 0.2);
    const end = sRad * (1.0 + seededNoise(cSeed + 2) * 0.3);
    ctx.strokeStyle = `rgba(55, 75, 28, ${0.25 + seededNoise(cSeed + 3) * 0.12})`;
    ctx.lineWidth = (0.8 + seededNoise(cSeed + 4) * 0.5) * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * start, Math.sin(angle) * start * isoRatio);
    const midR = (start + end) * 0.5;
    const midAngle = angle + (seededNoise(cSeed + 5) - 0.5) * 0.15;
    ctx.quadraticCurveTo(
      Math.cos(midAngle) * midR,
      Math.sin(midAngle) * midR * isoRatio,
      Math.cos(angle + 0.06) * end,
      Math.sin(angle + 0.06) * end * isoRatio,
    );
    ctx.stroke();
  }

  // 2. Main murky water body with rich depth
  const swampGrad = ctx.createRadialGradient(
    -sRad * 0.1,
    -sRad * 0.06 * isoRatio,
    0,
    0,
    0,
    sRad * 1.05,
  );
  swampGrad.addColorStop(0, "rgba(48, 68, 25, 0.95)");
  swampGrad.addColorStop(0.2, "rgba(40, 58, 20, 0.94)");
  swampGrad.addColorStop(0.45, "rgba(30, 48, 14, 0.95)");
  swampGrad.addColorStop(0.7, "rgba(22, 38, 10, 0.95)");
  swampGrad.addColorStop(1, "rgba(15, 25, 6, 0.92)");
  ctx.fillStyle = swampGrad;
  drawOrganicBlob(ctx, sRad * 1.02, sRad * isoRatio, hazSeed + 30, 0.18);
  ctx.fill();

  // 3. Deep murky center pool
  const depthGrad = ctx.createRadialGradient(
    0,
    2 * cameraZoom,
    0,
    0,
    2 * cameraZoom,
    sRad * 0.42,
  );
  depthGrad.addColorStop(0, "rgba(8, 15, 3, 0.92)");
  depthGrad.addColorStop(0.6, "rgba(15, 25, 8, 0.5)");
  depthGrad.addColorStop(1, "rgba(22, 35, 12, 0.05)");
  ctx.fillStyle = depthGrad;
  drawOrganicBlob(ctx, sRad * 0.4, sRad * 0.32 * isoRatio, hazSeed + 80, 0.14);
  ctx.fill();

  // 4. Bioluminescent glow spots beneath surface
  for (let glow = 0; glow < 8; glow++) {
    const gSeed = hazSeed + glow * 11.7;
    const gAngle =
      seededNoise(gSeed) * Math.PI * 2 +
      Math.sin(time * 0.3 + glow * 0.8) * 0.15;
    const gDist = sRad * (0.12 + seededNoise(gSeed + 1) * 0.5);
    const gx = Math.cos(gAngle) * gDist;
    const gy = Math.sin(gAngle) * gDist * isoRatio;
    const glowSize = sRad * (0.04 + seededNoise(gSeed + 2) * 0.05);
    const glowPulse = Math.sin(time * 2 + glow * 1.5 + hazSeed) * 0.5 + 0.5;
    const glowAlpha = 0.08 + glowPulse * 0.14;

    const bioGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowSize);
    bioGrad.addColorStop(0, `rgba(80, 220, 60, ${glowAlpha})`);
    bioGrad.addColorStop(0.4, `rgba(60, 180, 40, ${glowAlpha * 0.5})`);
    bioGrad.addColorStop(1, "rgba(40, 140, 20, 0)");
    ctx.fillStyle = bioGrad;
    ctx.beginPath();
    ctx.ellipse(gx, gy, glowSize, glowSize * isoRatio * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Iridescent oil-slick surface film
  const iridShift = time * 0.5;
  for (let film = 0; film < 4; film++) {
    const fSeed = hazSeed + film * 23.1;
    const fAngle = seededNoise(fSeed) * Math.PI * 2;
    const fDist = sRad * (0.1 + seededNoise(fSeed + 1) * 0.4);
    const fx =
      Math.cos(fAngle) * fDist + Math.sin(time * 0.2 + film) * 3 * cameraZoom;
    const fy = Math.sin(fAngle) * fDist * isoRatio;
    const filmSize = sRad * (0.12 + seededNoise(fSeed + 2) * 0.15);
    const hue =
      (film * 60 + iridShift * 40 + seededNoise(fSeed + 3) * 80) % 360;

    ctx.fillStyle = `hsla(${hue}, 50%, 45%, ${0.06 + Math.sin(time * 0.8 + film * 1.3) * 0.03})`;
    drawOrganicBlobAt(
      ctx,
      fx,
      fy,
      filmSize,
      filmSize * isoRatio * 0.7,
      fSeed + 10,
      0.2,
    );
    ctx.fill();
  }

  // 6. Lily pad-like toxic flora
  for (let pad = 0; pad < 6; pad++) {
    const pSeed = hazSeed + pad * 19.7;
    const pAngle = seededNoise(pSeed) * Math.PI * 2;
    const pDist = sRad * (0.2 + seededNoise(pSeed + 1) * 0.45);
    const drift = Math.sin(time * 0.2 + pad * 1.4) * 3 * cameraZoom;
    const px = Math.cos(pAngle) * pDist + drift;
    const py = Math.sin(pAngle) * pDist * isoRatio;
    const padSize = sRad * (0.06 + seededNoise(pSeed + 2) * 0.08);
    const padRot = seededNoise(pSeed + 3) * Math.PI * 2 + time * 0.05;

    const darkFactor = 0.8 + seededNoise(pSeed + 4) * 0.2;
    const padR = Math.floor(45 * darkFactor + 10);
    const padG = Math.floor(75 * darkFactor + 15);
    const padB = Math.floor(22 * darkFactor + 5);

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(1, isoRatio * 0.85);
    ctx.rotate(padRot);

    ctx.fillStyle = `rgba(${padR}, ${padG}, ${padB}, ${0.7 + seededNoise(pSeed + 5) * 0.2})`;
    ctx.beginPath();
    ctx.arc(0, 0, padSize, 0.15, Math.PI * 2 - 0.15);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(${padR - 10}, ${padG + 10}, ${padB}, 0.3)`;
    ctx.lineWidth = 0.6 * cameraZoom;
    for (let vein = 0; vein < 4; vein++) {
      const vAngle = 0.15 + (vein / 4) * (Math.PI * 2 - 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(vAngle) * padSize * 0.85,
        Math.sin(vAngle) * padSize * 0.85,
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Floating algae patches
  for (let patch = 0; patch < 5; patch++) {
    const aSeed = hazSeed + patch * 27.3;
    const aAngle = seededNoise(aSeed) * Math.PI * 2;
    const aDist = sRad * (0.15 + seededNoise(aSeed + 1) * 0.5);
    const drift = Math.sin(time * 0.3 + patch * 1.1) * 4 * cameraZoom;
    const ax = Math.cos(aAngle) * aDist + drift;
    const ay = Math.sin(aAngle) * aDist * isoRatio;
    const aSize = sRad * (0.04 + seededNoise(aSeed + 2) * 0.07);
    ctx.fillStyle = `rgba(${50 + (patch % 3) * 15}, ${80 + (patch % 4) * 12}, ${22 + (patch % 2) * 8}, ${0.45 + seededNoise(aSeed + 3) * 0.3})`;
    drawOrganicBlobAt(
      ctx,
      ax,
      ay,
      aSize,
      aSize * isoRatio * 0.75,
      aSeed + 10,
      0.3,
    );
    ctx.fill();
  }

  // 8. Dead tree/reed silhouettes at edges
  for (let twig = 0; twig < 7; twig++) {
    const twigSeed = hazSeed + twig * 13.3;
    const tAngle = seededNoise(twigSeed) * Math.PI * 2;
    const tDist = sRad * (0.6 + seededNoise(twigSeed + 1) * 0.3);
    const tx = Math.cos(tAngle) * tDist;
    const ty = Math.sin(tAngle) * tDist * isoRatio;
    const tHeight = (8 + seededNoise(twigSeed + 2) * 10) * cameraZoom;
    const lean = (seededNoise(twigSeed + 5) - 0.5) * 6 * cameraZoom;
    const sway = Math.sin(time * 0.6 + twig * 1.2) * 1.5 * cameraZoom;

    ctx.strokeStyle = `rgba(30, 45, 15, ${0.5 + seededNoise(twigSeed + 3) * 0.25})`;
    ctx.lineWidth = (1.2 + seededNoise(twigSeed + 4) * 1) * cameraZoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + lean * 0.5 + sway,
      ty - tHeight * 0.5,
      tx + lean + sway,
      ty - tHeight,
    );
    ctx.stroke();

    if (seededNoise(twigSeed + 6) > 0.35) {
      const branchH = tHeight * (0.5 + seededNoise(twigSeed + 7) * 0.3);
      const branchX =
        tx + lean * (branchH / tHeight) + sway * (branchH / tHeight);
      const branchY = ty - branchH;
      const branchDir = seededNoise(twigSeed + 8) > 0.5 ? 1 : -1;
      ctx.lineWidth = 0.8 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(branchX, branchY);
      ctx.lineTo(
        branchX + branchDir * 5 * cameraZoom,
        branchY - 4 * cameraZoom,
      );
      ctx.stroke();
    }

    if (seededNoise(twigSeed + 9) > 0.5) {
      const branchH2 = tHeight * (0.3 + seededNoise(twigSeed + 10) * 0.2);
      const branchX2 =
        tx + lean * (branchH2 / tHeight) + sway * (branchH2 / tHeight);
      const branchY2 = ty - branchH2;
      ctx.lineWidth = 0.7 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(branchX2, branchY2);
      ctx.lineTo(branchX2 - 4 * cameraZoom, branchY2 - 3 * cameraZoom);
      ctx.stroke();
    }
  }

  // 8b. Extra overgrown swamp clumps: cattails, reeds, and bulb growths
  for (let cluster = 0; cluster < 6; cluster++) {
    const cSeed = hazSeed + cluster * 29.1;
    const baseAngle = seededNoise(cSeed) * Math.PI * 2;
    const baseDist = sRad * (0.45 + seededNoise(cSeed + 1) * 0.42);
    const cx = Math.cos(baseAngle) * baseDist;
    const cy = Math.sin(baseAngle) * baseDist * isoRatio;
    const stalkCount = 3 + (cluster % 3);

    for (let stalk = 0; stalk < stalkCount; stalk++) {
      const offset = (stalk - (stalkCount - 1) / 2) * 3.2 * cameraZoom;
      const height = (16 + seededNoise(cSeed + stalk * 3.3) * 18) * cameraZoom;
      const lean = (seededNoise(cSeed + stalk * 5.1) - 0.5) * 8 * cameraZoom;
      ctx.strokeStyle = `rgba(58, 92, 24, ${0.45 + seededNoise(cSeed + stalk * 7.7) * 0.2})`;
      ctx.lineWidth = (1.1 + seededNoise(cSeed + stalk * 9.1) * 0.9) * cameraZoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx + offset, cy + 1 * cameraZoom);
      ctx.quadraticCurveTo(
        cx + offset + lean * 0.4,
        cy - height * 0.45,
        cx + offset + lean,
        cy - height,
      );
      ctx.stroke();

      if (stalk % 2 === 0) {
        ctx.fillStyle = `rgba(85, 68, 24, ${0.65 + seededNoise(cSeed + stalk * 11.3) * 0.18})`;
        ctx.beginPath();
        ctx.ellipse(
          cx + offset + lean,
          cy - height,
          2.4 * cameraZoom,
          4.2 * cameraZoom,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    const bulbSize = sRad * (0.045 + seededNoise(cSeed + 40) * 0.03);
    ctx.fillStyle = `rgba(64, 96, 26, ${0.4 + seededNoise(cSeed + 41) * 0.15})`;
    drawOrganicBlobAt(
      ctx,
      cx - 2 * cameraZoom,
      cy + 3 * cameraZoom,
      bulbSize * 1.4,
      bulbSize * isoRatio,
      cSeed + 42,
      0.25,
    );
    ctx.fill();
  }

  // 9. Toxic bubbles with pop effect
  for (let bubble = 0; bubble < 12; bubble++) {
    const bSeed = hazSeed + bubble * 2.1;
    const bPhase = (time * 0.7 + seededNoise(bSeed) * 3) % 3;
    if (bPhase > 1.6) continue;
    const bAngle = seededNoise(bSeed + 1) * Math.PI * 2;
    const bDist = sRad * (0.08 + seededNoise(bSeed + 2) * 0.55);
    const bx = Math.cos(bAngle) * bDist;
    const by = Math.sin(bAngle) * bDist * isoRatio - bPhase * 16 * cameraZoom;
    const bLife = Math.sin((bPhase / 1.6) * Math.PI);
    const bSize = (2 + (bubble % 4) * 1.2) * cameraZoom * bLife;

    ctx.save();
    ctx.shadowColor = `rgba(80, 180, 40, ${bLife * 0.2})`;
    ctx.shadowBlur = 3 * cameraZoom;

    const bubbleGrad = ctx.createRadialGradient(
      bx - bSize * 0.3,
      by - bSize * 0.3,
      0,
      bx,
      by,
      bSize,
    );
    bubbleGrad.addColorStop(0, `rgba(120, 200, 80, ${0.15 * bLife})`);
    bubbleGrad.addColorStop(0.5, `rgba(80, 150, 45, ${0.4 * bLife})`);
    bubbleGrad.addColorStop(0.85, `rgba(60, 120, 30, ${0.35 * bLife})`);
    bubbleGrad.addColorStop(1, `rgba(40, 90, 20, ${0.1 * bLife})`);
    ctx.fillStyle = bubbleGrad;
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(130, 200, 70, ${0.3 * bLife})`;
    ctx.lineWidth = 0.5 * cameraZoom;
    ctx.beginPath();
    ctx.arc(bx - bSize * 0.25, by - bSize * 0.25, bSize * 0.3, -0.5, 0.8);
    ctx.stroke();
    ctx.restore();

    if (bPhase > 1.4) {
      const popAlpha = (bPhase - 1.4) / 0.2;
      const popR = bSize * (1.5 + popAlpha * 2);
      ctx.strokeStyle = `rgba(100, 180, 50, ${0.2 * (1 - popAlpha)})`;
      ctx.lineWidth = 0.8 * cameraZoom;
      ctx.beginPath();
      ctx.arc(bx, by, popR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 10. Toxic mist/fog layer above surface
  for (let fog = 0; fog < 5; fog++) {
    const fSeed = hazSeed + fog * 9.7;
    const fogAngle = seededNoise(fSeed) * Math.PI * 2;
    const fogDist = sRad * (0.1 + seededNoise(fSeed + 1) * 0.45);
    const fogDrift = Math.sin(time * 0.3 + fog * 1.3) * 8 * cameraZoom;
    const fx = Math.cos(fogAngle) * fogDist + fogDrift;
    const fy = Math.sin(fogAngle) * fogDist * isoRatio - 6 * cameraZoom;
    const fogSize = sRad * (0.15 + seededNoise(fSeed + 2) * 0.15);
    const fogAlpha = 0.06 + Math.sin(time * 0.5 + fog * 1.7) * 0.03;

    const fogGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fogSize);
    fogGrad.addColorStop(0, `rgba(60, 140, 30, ${fogAlpha})`);
    fogGrad.addColorStop(0.6, `rgba(50, 120, 25, ${fogAlpha * 0.5})`);
    fogGrad.addColorStop(1, "rgba(40, 100, 20, 0)");
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.ellipse(
      fx,
      fy,
      fogSize,
      fogSize * 0.5 * isoRatio,
      fogDrift * 0.01,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // 11. Toxic wisps rising with S-curve paths
  for (let wisp = 0; wisp < 7; wisp++) {
    const wSeed = hazSeed + wisp * 4.1;
    const wPhase = (time * 0.35 + seededNoise(wSeed) * 4) % 4;
    if (wPhase > 3) continue;
    const wAngle = seededNoise(wSeed + 1) * Math.PI * 2;
    const wDist = sRad * (0.12 + seededNoise(wSeed + 2) * 0.4);
    const wAlpha = 0.12 * (1 - wPhase / 3);

    ctx.strokeStyle = `rgba(70, 160, 35, ${wAlpha})`;
    ctx.lineWidth = (2 - wPhase * 0.4) * cameraZoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let seg = 0; seg <= 8; seg++) {
      const t = seg / 8;
      const rise = t * wPhase * 20 * cameraZoom;
      const sCurve =
        Math.sin(t * Math.PI * 2 + time * 1.5 + wisp) * 5 * cameraZoom * t;
      const x = Math.cos(wAngle) * wDist + sCurve;
      const y = Math.sin(wAngle) * wDist * isoRatio - rise;
      if (seg === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 12. Surface caustic ripple bands
  for (let band = 0; band < 4; band++) {
    const bR = sRad * (0.2 + band * 0.16);
    const wobble =
      1 + Math.sin(time * 0.7 + band * 1.2 + hazSeed * 0.02) * 0.06;
    ctx.strokeStyle = `rgba(90, 155, 50, ${0.1 + (3 - band) * 0.025})`;
    ctx.lineWidth = (1.6 - band * 0.25) * cameraZoom;
    drawOrganicBlob(
      ctx,
      bR * wobble,
      bR * isoRatio * wobble,
      hazSeed + band * 25,
      0.1,
    );
    ctx.stroke();
  }

  // 13. Iridescent toxic sheen highlight
  const sheenGrad = ctx.createRadialGradient(
    -sRad * 0.25,
    -sRad * 0.14 * isoRatio,
    0,
    -sRad * 0.25,
    -sRad * 0.14 * isoRatio,
    sRad * 0.45,
  );
  const sheenAlpha = 0.16 + Math.sin(time * 1.5 + hazSeed) * 0.08;
  const sheenHue = (time * 15 + hazSeed * 3) % 60;
  sheenGrad.addColorStop(0, `hsla(${90 + sheenHue}, 60%, 55%, ${sheenAlpha})`);
  sheenGrad.addColorStop(
    0.4,
    `hsla(${120 + sheenHue}, 50%, 45%, ${sheenAlpha * 0.4})`,
  );
  sheenGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.ellipse(
    -sRad * 0.2,
    -sRad * 0.1 * isoRatio,
    sRad * 0.45,
    sRad * 0.24 * isoRatio,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // 14. Subtle water surface ripples
  for (let ripple = 0; ripple < 3; ripple++) {
    const rPhase =
      (time * 0.4 + ripple * 1.1 + seededNoise(hazSeed + ripple * 7) * 3) % 3;
    const rAngle = seededNoise(hazSeed + ripple * 11) * Math.PI * 2;
    const rDist = sRad * seededNoise(hazSeed + ripple * 13) * 0.4;
    const rx = Math.cos(rAngle) * rDist;
    const ry = Math.sin(rAngle) * rDist * isoRatio;
    const rSize = sRad * (0.03 + rPhase * 0.04);
    const rAlpha = 0.1 * (1 - rPhase / 3);

    ctx.strokeStyle = `rgba(80, 140, 45, ${rAlpha})`;
    ctx.lineWidth = 0.8 * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(rx, ry, rSize, rSize * isoRatio * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawIceHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 33.7 + (pos.y || 0) * 51.3;

  // 1. Frost spread ring into surrounding terrain
  const frostGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.5,
    0,
    0,
    sRad * 1.35,
  );
  frostGrad.addColorStop(0, "rgba(210, 235, 255, 0.35)");
  frostGrad.addColorStop(0.35, "rgba(190, 222, 250, 0.25)");
  frostGrad.addColorStop(0.7, "rgba(175, 210, 240, 0.12)");
  frostGrad.addColorStop(1, "transparent");
  ctx.fillStyle = frostGrad;
  drawOrganicBlob(ctx, sRad * 1.3, sRad * 1.25 * isoRatio, hazSeed, 0.24);
  ctx.fill();

  // Frost crystal patterns at edges
  ctx.strokeStyle = "rgba(220, 240, 255, 0.2)";
  ctx.lineWidth = 0.8 * cameraZoom;
  for (let crystal = 0; crystal < 10; crystal++) {
    const cSeed = hazSeed + crystal * 6.7;
    const cAngle = seededNoise(cSeed) * Math.PI * 2;
    const cStart = sRad * (0.8 + seededNoise(cSeed + 1) * 0.2);
    const cLen = sRad * (0.15 + seededNoise(cSeed + 2) * 0.2);
    const cx = Math.cos(cAngle) * cStart;
    const cy = Math.sin(cAngle) * cStart * isoRatio;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let branch = 0; branch < 3; branch++) {
      const bAngle = cAngle + (branch - 1) * 0.35;
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(bAngle) * cLen,
        cy + Math.sin(bAngle) * cLen * isoRatio,
      );
    }
    ctx.stroke();
  }

  // 2. Main ice body with depth gradient (translucent center)
  const iceGrad = ctx.createRadialGradient(
    -sRad * 0.2,
    -sRad * 0.12 * isoRatio,
    0,
    0,
    0,
    sRad,
  );
  iceGrad.addColorStop(0, "rgba(235, 248, 255, 0.95)");
  iceGrad.addColorStop(0.25, "rgba(195, 228, 255, 0.92)");
  iceGrad.addColorStop(0.55, "rgba(155, 205, 245, 0.94)");
  iceGrad.addColorStop(0.82, "rgba(115, 180, 230, 0.92)");
  iceGrad.addColorStop(1, "rgba(80, 155, 210, 0.88)");
  ctx.fillStyle = iceGrad;
  drawOrganicBlob(ctx, sRad, sRad * isoRatio, hazSeed + 50, 0.16);
  ctx.fill();

  // 3. Deeper center pool (darker ice showing depth)
  const depthGrad = ctx.createRadialGradient(
    0,
    2 * cameraZoom,
    0,
    0,
    2 * cameraZoom,
    sRad * 0.35,
  );
  depthGrad.addColorStop(0, "rgba(40, 80, 140, 0.45)");
  depthGrad.addColorStop(1, "rgba(60, 110, 170, 0.05)");
  ctx.fillStyle = depthGrad;
  drawOrganicBlob(ctx, sRad * 0.32, sRad * 0.25 * isoRatio, hazSeed + 90, 0.12);
  ctx.fill();

  // 4. Crack patterns radiating from center (with branching)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.3 * cameraZoom;
  for (let crack = 0; crack < 10; crack++) {
    const cAngle = seededNoise(hazSeed + crack * 3.3) * Math.PI * 2;
    const cLen = sRad * (0.25 + seededNoise(hazSeed + crack * 5.7) * 0.45);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const seg1X = Math.cos(cAngle + 0.12) * cLen * 0.35;
    const seg1Y = Math.sin(cAngle + 0.12) * cLen * 0.35 * isoRatio;
    const seg2X = Math.cos(cAngle - 0.06) * cLen * 0.65;
    const seg2Y = Math.sin(cAngle - 0.06) * cLen * 0.65 * isoRatio;
    const endX = Math.cos(cAngle + 0.04) * cLen;
    const endY = Math.sin(cAngle + 0.04) * cLen * isoRatio;
    ctx.lineTo(seg1X, seg1Y);
    ctx.lineTo(seg2X, seg2Y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    // Primary branch
    if (seededNoise(hazSeed + crack * 11) > 0.35) {
      const branchAngle =
        cAngle + (seededNoise(hazSeed + crack * 13) - 0.5) * 1.1;
      const branchLen = cLen * 0.45;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(seg2X, seg2Y);
      ctx.lineTo(
        seg2X + Math.cos(branchAngle) * branchLen,
        seg2Y + Math.sin(branchAngle) * branchLen * isoRatio,
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.3 * cameraZoom;
    }
    // Secondary branch
    if (seededNoise(hazSeed + crack * 15) > 0.55) {
      const b2Angle = cAngle - (seededNoise(hazSeed + crack * 17) - 0.5) * 0.9;
      const b2Len = cLen * 0.3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 0.8 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(seg1X, seg1Y);
      ctx.lineTo(
        seg1X + Math.cos(b2Angle) * b2Len,
        seg1Y + Math.sin(b2Angle) * b2Len * isoRatio,
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.3 * cameraZoom;
    }
  }

  // 5. Trapped air bubbles under the ice surface
  for (let trapped = 0; trapped < 8; trapped++) {
    const tSeed = hazSeed + trapped * 9.3;
    const tAngle = seededNoise(tSeed) * Math.PI * 2;
    const tDist = sRad * (0.15 + seededNoise(tSeed + 1) * 0.45);
    const tx = Math.cos(tAngle) * tDist;
    const ty = Math.sin(tAngle) * tDist * isoRatio;
    const tSize = (2 + seededNoise(tSeed + 2) * 3) * cameraZoom;
    ctx.fillStyle = `rgba(230, 245, 255, ${0.2 + seededNoise(tSeed + 3) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      tx,
      ty,
      tSize,
      tSize * 0.7,
      seededNoise(tSeed + 4) * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // 6. Snow dust at edges
  for (let mote = 0; mote < 10; mote++) {
    const mPhase = (time * 0.5 + seededNoise(hazSeed + mote * 2.3) * 3) % 3;
    const mAngle = seededNoise(hazSeed + mote * 4.1) * Math.PI * 2;
    const mDist = sRad * (0.3 + seededNoise(hazSeed + mote * 6.7) * 0.55);
    const windDrift = Math.sin(time * 0.8 + mote * 0.7) * 3 * cameraZoom;
    const mx = Math.cos(mAngle) * mDist + windDrift;
    const my = Math.sin(mAngle) * mDist * isoRatio - mPhase * 12 * cameraZoom;
    const mSize = (1.4 + (mote % 3) * 0.5) * cameraZoom * (1 - mPhase / 3);
    ctx.fillStyle = `rgba(230, 245, 255, ${0.65 * (1 - mPhase / 3)})`;
    ctx.beginPath();
    ctx.arc(mx, my, mSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Edge frost rim (light outline band)
  const rimR = sRad * (0.88 + Math.sin(time * 0.6 + hazSeed * 0.02) * 0.03);
  ctx.strokeStyle = "rgba(230, 245, 255, 0.22)";
  ctx.lineWidth = 2.5 * cameraZoom;
  drawOrganicBlob(ctx, rimR, rimR * isoRatio, hazSeed + 60, 0.12);
  ctx.stroke();

  // 8. Specular highlight
  const shimmer = Math.sin(time * 1.8 + hazSeed) * 0.5 + 0.5;
  const specGrad = ctx.createRadialGradient(
    -sRad * 0.3,
    -sRad * 0.18 * isoRatio,
    0,
    -sRad * 0.3,
    -sRad * 0.18 * isoRatio,
    sRad * 0.42,
  );
  specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.25 + shimmer * 0.2})`);
  specGrad.addColorStop(0.45, "rgba(235, 248, 255, 0.06)");
  specGrad.addColorStop(1, "transparent");
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(
    -sRad * 0.25,
    -sRad * 0.14 * isoRatio,
    sRad * 0.42,
    sRad * 0.22 * isoRatio,
    -0.35,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawPoisonPoolHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 41.3 + (pos.y || 0) * 29.7;
  const bubbleCycle = Math.sin(time * 2.5 + hazSeed) * 0.5 + 0.5;

  // 1. Corroded earth ring with dead vegetation patches
  const deadGrad = ctx.createRadialGradient(
    0,
    3 * cameraZoom,
    sRad * 0.4,
    0,
    3 * cameraZoom,
    sRad * 1.35,
  );
  deadGrad.addColorStop(0, "rgba(35, 42, 12, 0.65)");
  deadGrad.addColorStop(0.3, "rgba(45, 50, 15, 0.45)");
  deadGrad.addColorStop(0.6, "rgba(30, 38, 10, 0.25)");
  deadGrad.addColorStop(1, "transparent");
  ctx.fillStyle = deadGrad;
  drawOrganicBlob(ctx, sRad * 1.3, sRad * 1.2 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  // Dead root tendrils spreading outward
  for (let root = 0; root < 10; root++) {
    const rSeed = hazSeed + root * 8.3;
    const rAngle = (root / 10) * Math.PI * 2 + seededNoise(rSeed) * 0.3;
    const rLen = sRad * (0.6 + seededNoise(rSeed + 1) * 0.5);
    ctx.save();
    ctx.strokeStyle = `rgba(60, 45, 20, ${0.2 + seededNoise(rSeed + 2) * 0.1})`;
    ctx.lineWidth = (1 + seededNoise(rSeed + 3) * 1.5) * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(rAngle) * sRad * 0.5,
      Math.sin(rAngle) * sRad * 0.5 * isoRatio,
    );
    for (let seg = 1; seg <= 5; seg++) {
      const t = seg / 5;
      const jag = (seededNoise(rSeed + seg * 2.1) - 0.5) * 8 * cameraZoom;
      ctx.lineTo(
        Math.cos(rAngle + jag * 0.02) * rLen * t,
        Math.sin(rAngle + jag * 0.02) * rLen * t * isoRatio,
      );
    }
    ctx.stroke();
    ctx.restore();
  }

  // 2. Main toxic pool — thick, viscous, bubbling liquid
  const poolGrad = ctx.createRadialGradient(
    -sRad * 0.1,
    -sRad * 0.06 * isoRatio,
    0,
    0,
    0,
    sRad,
  );
  poolGrad.addColorStop(0, "rgba(110, 240, 70, 0.92)");
  poolGrad.addColorStop(0.2, "rgba(80, 200, 45, 0.9)");
  poolGrad.addColorStop(0.45, "rgba(50, 155, 28, 0.92)");
  poolGrad.addColorStop(0.7, "rgba(28, 100, 15, 0.9)");
  poolGrad.addColorStop(1, "rgba(15, 55, 8, 0.85)");
  ctx.fillStyle = poolGrad;
  drawOrganicBlob(ctx, sRad * 0.95, sRad * 0.88 * isoRatio, hazSeed + 35, 0.2);
  ctx.fill();

  // Viscous surface ripples
  for (let ripple = 0; ripple < 4; ripple++) {
    const rr = sRad * (0.25 + ripple * 0.15);
    const wobble =
      1 + Math.sin(time * 0.8 + ripple * 1.3 + hazSeed * 0.02) * 0.06;
    ctx.strokeStyle = `rgba(140, 255, 80, ${0.1 - ripple * 0.02})`;
    ctx.lineWidth = (1.5 - ripple * 0.3) * cameraZoom;
    drawOrganicBlob(
      ctx,
      rr * wobble,
      rr * isoRatio * wobble * 0.9,
      hazSeed + ripple * 22,
      0.12,
    );
    ctx.stroke();
  }

  // 2b. Corrosive veins and ooze channels around the pool
  ctx.strokeStyle = "rgba(120, 235, 70, 0.2)";
  ctx.lineWidth = 1.2 * cameraZoom;
  for (let vein = 0; vein < 8; vein++) {
    const vSeed = hazSeed + vein * 8.1;
    const vAngle = (vein / 8) * Math.PI * 2 + seededNoise(vSeed) * 0.25;
    const vStartR = sRad * (0.18 + seededNoise(vSeed + 1) * 0.12);
    const vEndR = sRad * (0.55 + seededNoise(vSeed + 2) * 0.22);
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(vAngle) * vStartR,
      Math.sin(vAngle) * vStartR * isoRatio,
    );
    const midAngle = vAngle + (seededNoise(vSeed + 3) - 0.5) * 0.28;
    ctx.quadraticCurveTo(
      Math.cos(midAngle) * (vStartR + vEndR) * 0.55,
      Math.sin(midAngle) * (vStartR + vEndR) * 0.55 * isoRatio,
      Math.cos(vAngle + 0.08) * vEndR,
      Math.sin(vAngle + 0.08) * vEndR * isoRatio,
    );
    ctx.stroke();
  }

  // 2c. Secondary bubbling sub-pools around the edge
  for (let subPool = 0; subPool < 3; subPool++) {
    const spSeed = hazSeed + subPool * 17.7;
    const spAngle = seededNoise(spSeed) * Math.PI * 2;
    const spDist = sRad * (0.42 + seededNoise(spSeed + 1) * 0.18);
    const sx = Math.cos(spAngle) * spDist;
    const sy = Math.sin(spAngle) * spDist * isoRatio;
    const spSize = sRad * (0.1 + seededNoise(spSeed + 2) * 0.05);

    const subGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, spSize);
    subGrad.addColorStop(0, "rgba(145, 255, 95, 0.65)");
    subGrad.addColorStop(0.6, "rgba(75, 195, 42, 0.52)");
    subGrad.addColorStop(1, "rgba(40, 120, 25, 0)");
    ctx.fillStyle = subGrad;
    drawOrganicBlobAt(ctx, sx, sy, spSize, spSize * isoRatio, spSeed + 10, 0.26);
    ctx.fill();
  }

  // 3. Erupting toxic bubbles — large, slow, popping
  for (let bubble = 0; bubble < 8; bubble++) {
    const bSeed = hazSeed + bubble * 11.7;
    const bPhase = (time * 0.6 + seededNoise(bSeed) * 3) % 3;
    const bAngle = seededNoise(bSeed + 1) * Math.PI * 2;
    const bDist = sRad * (0.05 + seededNoise(bSeed + 2) * 0.5);
    const bx = Math.cos(bAngle) * bDist;
    const by = Math.sin(bAngle) * bDist * isoRatio;

    if (bPhase < 1.8) {
      // Growing bubble dome rising above the surface
      const grow = Math.sin((bPhase / 1.8) * Math.PI);
      const bSize = (4 + (bubble % 4) * 2.5) * cameraZoom * grow;
      const bHeight = -bPhase * 8 * cameraZoom;

      ctx.save();
      ctx.translate(bx, by + bHeight);
      // Bubble membrane
      const memGrad = ctx.createRadialGradient(
        -bSize * 0.3,
        -bSize * 0.3,
        0,
        0,
        0,
        bSize,
      );
      memGrad.addColorStop(0, `rgba(180, 255, 140, ${grow * 0.5})`);
      memGrad.addColorStop(0.5, `rgba(100, 220, 60, ${grow * 0.35})`);
      memGrad.addColorStop(0.8, `rgba(60, 160, 30, ${grow * 0.2})`);
      memGrad.addColorStop(1, `rgba(40, 120, 20, ${grow * 0.05})`);
      ctx.fillStyle = memGrad;
      ctx.beginPath();
      ctx.arc(0, 0, bSize, 0, Math.PI * 2);
      ctx.fill();
      // Specular highlight
      ctx.fillStyle = `rgba(220, 255, 200, ${grow * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(
        -bSize * 0.25,
        -bSize * 0.3,
        bSize * 0.25,
        bSize * 0.15,
        -0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    } else {
      // Pop splash particles
      const popAge = (bPhase - 1.8) / 1.2;
      for (let sp = 0; sp < 5; sp++) {
        const spAngle = (sp / 5) * Math.PI * 2 + bSeed;
        const spDist = popAge * 12 * cameraZoom;
        const spAlpha = (1 - popAge) * 0.6;
        ctx.fillStyle = `rgba(150, 255, 80, ${spAlpha})`;
        ctx.beginPath();
        ctx.arc(
          bx + Math.cos(spAngle) * spDist,
          by + Math.sin(spAngle) * spDist * isoRatio - popAge * 6 * cameraZoom,
          (1.5 - popAge) * cameraZoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  // 4. Tall fungal growths sprouting from the pool edges
  const fungi = [
    { angle: 0.5, dist: 0.7, capW: 12, stemH: 32, capH: 10, lean: 2 },
    { angle: 1.8, dist: 0.8, capW: 9, stemH: 25, capH: 8, lean: -1.5 },
    { angle: 2.9, dist: 0.65, capW: 14, stemH: 38, capH: 12, lean: 3 },
    { angle: 4.2, dist: 0.75, capW: 8, stemH: 20, capH: 7, lean: -2 },
    { angle: 5.3, dist: 0.6, capW: 11, stemH: 28, capH: 9, lean: 1 },
    { angle: 3.6, dist: 0.85, capW: 7, stemH: 18, capH: 6, lean: -1 },
  ];
  for (let f = 0; f < fungi.length; f++) {
    const fg = fungi[f];
    const fSeed = hazSeed + f * 23.1;
    const baseX = Math.cos(fg.angle + fSeed * 0.002) * sRad * fg.dist;
    const baseY =
      Math.sin(fg.angle + fSeed * 0.002) * sRad * fg.dist * isoRatio;
    const sway = Math.sin(time * 0.8 + f * 1.3) * 2 * cameraZoom;
    const stemH = fg.stemH * cameraZoom;
    const capW = fg.capW * cameraZoom;
    const capH = fg.capH * cameraZoom;
    const lean = fg.lean * cameraZoom + sway;

    // Stem — slightly curved, thicker at base
    ctx.save();
    ctx.translate(baseX, baseY);
    const stemGrad = ctx.createLinearGradient(0, 0, lean, -stemH);
    stemGrad.addColorStop(0, "rgba(55, 85, 30, 0.9)");
    stemGrad.addColorStop(0.5, "rgba(70, 110, 40, 0.85)");
    stemGrad.addColorStop(1, "rgba(85, 130, 50, 0.8)");
    ctx.fillStyle = stemGrad;

    const baseW = capW * 0.25;
    const topW = capW * 0.15;
    ctx.beginPath();
    ctx.moveTo(-baseW, 0);
    ctx.quadraticCurveTo(
      -topW + lean * 0.3,
      -stemH * 0.5,
      -topW + lean,
      -stemH,
    );
    ctx.lineTo(topW + lean, -stemH);
    ctx.quadraticCurveTo(topW + lean * 0.3, -stemH * 0.5, baseW, 0);
    ctx.closePath();
    ctx.fill();

    // Glowing spots on stem
    for (let dot = 0; dot < 3; dot++) {
      const dotY = -(0.2 + dot * 0.25) * stemH;
      const dotX =
        lean * (0.2 + dot * 0.25) + (seededNoise(fSeed + dot) - 0.5) * baseW;
      const dotGlow = Math.sin(time * 2 + f + dot * 1.5) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(160, 255, 80, ${dotGlow * 0.6})`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.5 * cameraZoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cap — mushroom dome with glowing underside
    const capX = lean;
    const capY = -stemH;

    // Cap underside gills (visible as lines)
    ctx.strokeStyle = "rgba(140, 220, 60, 0.3)";
    ctx.lineWidth = 0.7 * cameraZoom;
    for (let gill = 0; gill < 6; gill++) {
      const gAngle = (gill / 6) * Math.PI - Math.PI * 0.5;
      ctx.beginPath();
      ctx.moveTo(capX, capY + capH * 0.2);
      ctx.lineTo(
        capX + Math.cos(gAngle) * capW * 0.8,
        capY + capH * 0.4 + Math.abs(Math.sin(gAngle)) * capH * 0.3,
      );
      ctx.stroke();
    }

    // Cap dome
    const capGrad = ctx.createRadialGradient(
      capX - capW * 0.2,
      capY - capH * 0.3,
      0,
      capX,
      capY,
      capW,
    );
    capGrad.addColorStop(0, "rgba(100, 180, 50, 0.92)");
    capGrad.addColorStop(0.3, "rgba(75, 150, 35, 0.88)");
    capGrad.addColorStop(0.6, "rgba(55, 120, 25, 0.85)");
    capGrad.addColorStop(1, "rgba(35, 80, 15, 0.7)");
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.ellipse(capX, capY, capW, capW * isoRatio, 0, Math.PI, Math.PI * 2);
    ctx.ellipse(capX, capY, capW, capW * isoRatio * 0.4, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    // Toxic spots on cap
    for (let spot = 0; spot < 4; spot++) {
      const spotSeed = fSeed + spot * 5.3;
      const spotAngle = seededNoise(spotSeed) * Math.PI - Math.PI * 0.5;
      const spotDist = capW * (0.3 + seededNoise(spotSeed + 1) * 0.4);
      const spotSize = (1.5 + seededNoise(spotSeed + 2) * 2) * cameraZoom;
      const sx = capX + Math.cos(spotAngle) * spotDist;
      const sy = capY - Math.abs(Math.sin(spotAngle)) * capH * 0.35;
      const spotGlow = Math.sin(time * 1.5 + f + spot) * 0.2 + 0.5;
      ctx.fillStyle = `rgba(180, 255, 100, ${spotGlow * 0.7})`;
      ctx.beginPath();
      ctx.arc(sx, sy, spotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spore release from cap
    for (let spore = 0; spore < 3; spore++) {
      const sPhase = (time * 0.4 + f * 0.7 + spore * 0.9) % 2.5;
      if (sPhase > 1.8) continue;
      const sAlpha = (1 - sPhase / 1.8) * 0.5;
      const sDrift = Math.sin(time + f + spore) * 6 * cameraZoom;
      ctx.fillStyle = `rgba(160, 255, 80, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(
        capX + sDrift + (seededNoise(fSeed + spore * 3) - 0.5) * capW,
        capY - capH * 0.3 - sPhase * 18 * cameraZoom,
        (1 + spore * 0.3) * cameraZoom * (1 - sPhase / 2.5),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.restore();
  }

  // 5. Thick miasma plumes — dense vertical columns of toxic gas
  for (let plume = 0; plume < 4; plume++) {
    const pSeed = hazSeed + plume * 31.7;
    const pAngle = seededNoise(pSeed) * Math.PI * 2;
    const pDist = sRad * (0.15 + seededNoise(pSeed + 1) * 0.35);
    const pBaseX = Math.cos(pAngle) * pDist;
    const pBaseY = Math.sin(pAngle) * pDist * isoRatio;
    const plumeH = (50 + seededNoise(pSeed + 2) * 30) * cameraZoom;
    const plumeW = sRad * (0.15 + seededNoise(pSeed + 3) * 0.1);

    for (let layer = 0; layer < 8; layer++) {
      const t = layer / 8;
      const drift =
        Math.sin(time * 0.5 + plume * 1.5 + t * 2) * 10 * cameraZoom * t;
      const spread = 1 + t * 1.2;
      const ly = pBaseY - t * plumeH;
      const lx = pBaseX + drift;
      const lw = plumeW * spread;
      const lh = lw * isoRatio * 0.7;
      const alpha = (0.2 - t * 0.02) * (0.8 + bubbleCycle * 0.2);

      ctx.fillStyle = `rgba(80, 160, 40, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(lx, ly, lw, lh, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Plume top — dissipating cloud
    const topY = pBaseY - plumeH;
    const topDrift = Math.sin(time * 0.5 + plume * 1.5 + 2) * 10 * cameraZoom;
    const topGrad = ctx.createRadialGradient(
      pBaseX + topDrift,
      topY,
      0,
      pBaseX + topDrift,
      topY,
      plumeW * 2,
    );
    topGrad.addColorStop(0, "rgba(100, 200, 50, 0.12)");
    topGrad.addColorStop(0.5, "rgba(70, 150, 30, 0.06)");
    topGrad.addColorStop(1, "transparent");
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.ellipse(
      pBaseX + topDrift,
      topY,
      plumeW * 2,
      plumeW * 2 * isoRatio * 0.6,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // 5b. Toxic tendrils and wisps curling upward from the surface
  for (let tendril = 0; tendril < 7; tendril++) {
    const tSeed = hazSeed + tendril * 4.1;
    const tPhase = (time * 0.35 + seededNoise(tSeed) * 4) % 4;
    if (tPhase > 3) continue;
    const tAngle = seededNoise(tSeed + 1) * Math.PI * 2;
    const tDist = sRad * (0.14 + seededNoise(tSeed + 2) * 0.42);
    const tAlpha = 0.12 * (1 - tPhase / 3);

    ctx.strokeStyle = `rgba(90, 185, 45, ${tAlpha})`;
    ctx.lineWidth = (2.2 - tPhase * 0.35) * cameraZoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let seg = 0; seg <= 8; seg++) {
      const progress = seg / 8;
      const rise = progress * tPhase * 22 * cameraZoom;
      const sCurve =
        Math.sin(progress * Math.PI * 2 + time * 1.4 + tendril) *
        5 *
        cameraZoom *
        progress;
      const x = Math.cos(tAngle) * tDist + sCurve;
      const y = Math.sin(tAngle) * tDist * isoRatio - rise;
      if (seg === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 6. Dripping toxic stalactites — floating goo drops falling back
  for (let drip = 0; drip < 10; drip++) {
    const dSeed = hazSeed + drip * 13.9;
    const dAngle = seededNoise(dSeed) * Math.PI * 2;
    const dDist = sRad * (0.1 + seededNoise(dSeed + 1) * 0.55);
    const dx = Math.cos(dAngle) * dDist;
    const dPhase = (time * 0.5 + seededNoise(dSeed + 2) * 4) % 4;

    if (dPhase < 2.5) {
      // Rising drip strand
      const riseT = dPhase / 2.5;
      const dripH = 22 * cameraZoom * riseT;
      const dBaseY = Math.sin(dAngle) * dDist * isoRatio;
      const alpha = 0.5 + riseT * 0.3;

      // Stretching strand
      ctx.save();
      ctx.strokeStyle = `rgba(120, 230, 60, ${alpha * 0.6})`;
      ctx.lineWidth = (2 - riseT * 0.8) * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(dx, dBaseY);
      ctx.lineTo(dx + Math.sin(time + drip) * 2 * cameraZoom, dBaseY - dripH);
      ctx.stroke();

      // Droplet at top
      const dropSize = (2.5 + riseT * 1.5) * cameraZoom;
      ctx.fillStyle = `rgba(140, 255, 70, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        dx + Math.sin(time + drip) * 2 * cameraZoom,
        dBaseY - dripH,
        dropSize,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Highlight
      ctx.fillStyle = `rgba(200, 255, 160, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        dx + Math.sin(time + drip) * 2 * cameraZoom - dropSize * 0.3,
        dBaseY - dripH - dropSize * 0.3,
        dropSize * 0.35,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    } else {
      // Falling drip
      const fallT = (dPhase - 2.5) / 1.5;
      const fallY =
        Math.sin(dAngle) * dDist * isoRatio -
        22 * cameraZoom * (1 - fallT * fallT);
      const fallAlpha = (1 - fallT) * 0.7;
      ctx.fillStyle = `rgba(140, 255, 70, ${fallAlpha})`;
      ctx.beginPath();
      ctx.arc(dx, fallY, (2 - fallT) * cameraZoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 7. Floating bioluminescent spores drifting upward
  for (let spore = 0; spore < 14; spore++) {
    const sSeed = hazSeed + spore * 5.7;
    const sPhase = (time * 0.35 + seededNoise(sSeed) * 5) % 5;
    const t = sPhase / 5;
    const sAngle = seededNoise(sSeed + 1) * Math.PI * 2 + time * 0.15;
    const sDist = sRad * (0.1 + seededNoise(sSeed + 2) * 0.6);
    const drift = Math.sin(time * 0.6 + spore * 1.1) * 8 * cameraZoom * t;
    const sx = Math.cos(sAngle) * sDist + drift;
    const sy = Math.sin(sAngle) * sDist * isoRatio - t * 70 * cameraZoom;
    const sSize = (1 + (spore % 3) * 0.5) * cameraZoom * (1 - t * 0.5);
    const sAlpha = (1 - t) * 0.6;

    ctx.save();
    ctx.shadowColor = `rgba(130, 255, 60, ${sAlpha * 0.5})`;
    ctx.shadowBlur = 6 * cameraZoom;
    ctx.fillStyle = `rgba(160, 255, 90, ${sAlpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 8. Toxic glow at the pool center
  const glow = Math.sin(time * 2 + hazSeed) * 0.5 + 0.5;
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.45);
  glowGrad.addColorStop(0, `rgba(130, 255, 60, ${0.15 + glow * 0.12})`);
  glowGrad.addColorStop(0.5, "rgba(90, 200, 35, 0.04)");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, sRad * 0.45, sRad * 0.32 * isoRatio, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHellfireHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 43.1 + (pos.y || 0) * 31.7;
  const emberGlow = Math.sin(time * 3 + hazSeed) * 0.5 + 0.5;
  const infernalPulse = Math.sin(time * 1.5 + hazSeed * 0.5) * 0.5 + 0.5;

  // 1. Wide scorched/blackened earth with heat distortion edge
  const scorchGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.2,
    0,
    0,
    sRad * 1.4,
  );
  scorchGrad.addColorStop(0, `rgba(65, 30, 10, ${0.9 + infernalPulse * 0.08})`);
  scorchGrad.addColorStop(0.3, "rgba(50, 25, 8, 0.78)");
  scorchGrad.addColorStop(0.55, "rgba(35, 18, 5, 0.5)");
  scorchGrad.addColorStop(0.8, "rgba(25, 10, 3, 0.22)");
  scorchGrad.addColorStop(1, "transparent");
  ctx.fillStyle = scorchGrad;
  drawOrganicBlob(ctx, sRad * 1.35, sRad * 1.3 * isoRatio, hazSeed, 0.24);
  ctx.fill();

  // Charred crack network with branching
  for (let i = 0; i < 12; i++) {
    const cSeed = hazSeed + i * 3.7;
    const angle = (i / 12) * Math.PI * 2 + seededNoise(cSeed) * 0.3;
    const len = sRad * (0.55 + seededNoise(cSeed + 1) * 0.6);

    ctx.strokeStyle = `rgba(90, 40, 12, ${0.3 + seededNoise(cSeed + 2) * 0.15})`;
    ctx.lineWidth = (1 + seededNoise(cSeed + 3) * 0.6) * cameraZoom;
    ctx.beginPath();
    let cx = Math.cos(angle) * sRad * 0.35;
    let cy = Math.sin(angle) * sRad * 0.35 * isoRatio;
    ctx.moveTo(cx, cy);
    for (let seg = 1; seg <= 4; seg++) {
      const t = seg / 4;
      const jitter = (seededNoise(cSeed + seg * 5) - 0.5) * 0.2;
      cx =
        Math.cos(angle + jitter) * len * t +
        Math.cos(angle) * sRad * 0.35 * (1 - t);
      cy =
        (Math.sin(angle + jitter) * len * t +
          Math.sin(angle) * sRad * 0.35 * (1 - t)) *
        isoRatio;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // 2. Molten lava pools between cracks
  for (let pool = 0; pool < 5; pool++) {
    const pSeed = hazSeed + pool * 17.3;
    const pAngle = seededNoise(pSeed) * Math.PI * 2;
    const pDist = sRad * (0.2 + seededNoise(pSeed + 1) * 0.35);
    const px = Math.cos(pAngle) * pDist;
    const py = Math.sin(pAngle) * pDist * isoRatio;
    const poolSize = sRad * (0.06 + seededNoise(pSeed + 2) * 0.06);
    const poolPulse = Math.sin(time * 2 + pool * 1.7 + hazSeed) * 0.5 + 0.5;

    ctx.save();
    ctx.shadowColor = `rgba(255, 100, 0, ${0.3 + poolPulse * 0.3})`;
    ctx.shadowBlur = 8 * cameraZoom;
    const poolGrad = ctx.createRadialGradient(px, py, 0, px, py, poolSize);
    poolGrad.addColorStop(0, `rgba(255, 220, 80, ${0.85 + poolPulse * 0.15})`);
    poolGrad.addColorStop(
      0.3,
      `rgba(255, 140, 20, ${0.75 + poolPulse * 0.15})`,
    );
    poolGrad.addColorStop(0.6, `rgba(220, 60, 0, ${0.6 + poolPulse * 0.1})`);
    poolGrad.addColorStop(1, "rgba(120, 25, 0, 0.2)");
    ctx.fillStyle = poolGrad;
    drawOrganicBlobAt(
      ctx,
      px,
      py,
      poolSize,
      poolSize * isoRatio * 0.8,
      pSeed + 10,
      0.25,
    );
    ctx.fill();
    ctx.restore();
  }

  // 3. Ember bed with glowing cracks and heat veins
  const emberGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.95);
  emberGrad.addColorStop(0, `rgba(220, 80, 15, ${0.58 + emberGlow * 0.22})`);
  emberGrad.addColorStop(0.3, `rgba(170, 50, 10, ${0.45 + emberGlow * 0.18})`);
  emberGrad.addColorStop(0.6, `rgba(100, 30, 5, ${0.32 + emberGlow * 0.12})`);
  emberGrad.addColorStop(0.85, `rgba(60, 18, 2, ${0.18 + emberGlow * 0.06})`);
  emberGrad.addColorStop(1, "rgba(40, 10, 0, 0.05)");
  ctx.fillStyle = emberGrad;
  drawOrganicBlob(ctx, sRad * 0.95, sRad * 0.88 * isoRatio, hazSeed + 25, 0.16);
  ctx.fill();

  // Glowing heat veins/cracks with pulsing
  for (let crack = 0; crack < 10; crack++) {
    const cSeed = hazSeed + crack * 7.3;
    const cAngle = seededNoise(cSeed) * Math.PI * 2;
    const cLen = sRad * (0.2 + seededNoise(cSeed + 1) * 0.45);
    const crackGlow =
      0.35 + emberGlow * 0.35 + Math.sin(time * 2.5 + crack * 1.3) * 0.15;

    ctx.save();
    ctx.shadowColor = `rgba(255, 120, 20, ${crackGlow * 0.7})`;
    ctx.shadowBlur = 8 * cameraZoom;

    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle =
        pass === 0
          ? `rgba(255, 80, 10, ${crackGlow * 0.5})`
          : `rgba(255, 180, 60, ${crackGlow})`;
      ctx.lineWidth =
        (pass === 0 ? 3 : 1.5 + seededNoise(cSeed + 2) * 0.8) * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      let cx = 0;
      let cy = 0;
      for (let seg = 1; seg <= 3; seg++) {
        const t = seg / 3;
        const jit = (seededNoise(cSeed + seg * 4.7) - 0.5) * 0.3;
        cx = Math.cos(cAngle + jit) * cLen * t;
        cy = Math.sin(cAngle + jit) * cLen * t * isoRatio;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Infernal rune/sigil pattern on the ground
  ctx.save();
  const runeAlpha = 0.12 + infernalPulse * 0.18;
  ctx.shadowColor = `rgba(255, 80, 0, ${runeAlpha * 0.8})`;
  ctx.shadowBlur = 10 * cameraZoom;
  ctx.strokeStyle = `rgba(255, 120, 30, ${runeAlpha})`;
  ctx.lineWidth = 1.5 * cameraZoom;

  const runeR = sRad * 0.55;
  ctx.beginPath();
  ctx.ellipse(0, 0, runeR, runeR * isoRatio, 0, 0, Math.PI * 2);
  ctx.stroke();

  const innerRuneR = sRad * 0.35;
  ctx.beginPath();
  ctx.ellipse(0, 0, innerRuneR, innerRuneR * isoRatio, 0, 0, Math.PI * 2);
  ctx.stroke();

  for (let sym = 0; sym < 6; sym++) {
    const symAngle = (sym / 6) * Math.PI * 2 + time * 0.15;
    const ox = Math.cos(symAngle) * runeR;
    const oy = Math.sin(symAngle) * runeR * isoRatio;
    const ix = Math.cos(symAngle) * innerRuneR;
    const iy = Math.sin(symAngle) * innerRuneR * isoRatio;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ix, iy);
    ctx.stroke();

    const crossAngle = symAngle + Math.PI / 6;
    const cx1 = Math.cos(crossAngle) * runeR * 0.85;
    const cy1 = Math.sin(crossAngle) * runeR * 0.85 * isoRatio;
    const crossAngle2 = symAngle - Math.PI / 6;
    const cx2 = Math.cos(crossAngle2) * runeR * 0.85;
    const cy2 = Math.sin(crossAngle2) * runeR * 0.85 * isoRatio;
    ctx.beginPath();
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(ix, iy);
    ctx.lineTo(cx2, cy2);
    ctx.stroke();
  }
  ctx.restore();

  // 5. Multi-layered flame plumes with inner/outer color and corona
  for (let flame = 0; flame < 12; flame++) {
    const fSeed = hazSeed + flame * 11.3;
    const fAngle = seededNoise(fSeed) * Math.PI * 2;
    const fDist = sRad * (0.08 + seededNoise(fSeed + 1) * 0.55);
    const fx = Math.cos(fAngle) * fDist;
    const fy = Math.sin(fAngle) * fDist * isoRatio;
    const baseHeight = (12 + seededNoise(fSeed + 2) * 20) * cameraZoom;
    const fHeight =
      baseHeight + Math.sin(time * 6 + flame * 1.3) * 6 * cameraZoom;
    const fWidth = (3 + seededNoise(fSeed + 3) * 4) * cameraZoom;
    const sway = Math.sin(time * 8 + flame * 1.9 + hazSeed) * 3 * cameraZoom;

    ctx.save();
    ctx.shadowColor = `rgba(255, 100, 0, ${0.2 + Math.sin(time * 4 + flame) * 0.1})`;
    ctx.shadowBlur = 6 * cameraZoom;

    const outerGrad = ctx.createLinearGradient(fx, fy, fx + sway, fy - fHeight);
    outerGrad.addColorStop(0, "rgba(200, 30, 0, 0.85)");
    outerGrad.addColorStop(0.2, "rgba(255, 60, 0, 0.75)");
    outerGrad.addColorStop(0.45, "rgba(255, 130, 0, 0.55)");
    outerGrad.addColorStop(0.7, "rgba(255, 200, 30, 0.3)");
    outerGrad.addColorStop(0.9, "rgba(255, 240, 120, 0.1)");
    outerGrad.addColorStop(1, "transparent");
    ctx.fillStyle = outerGrad;

    ctx.beginPath();
    ctx.moveTo(fx - fWidth * 1.3, fy);
    ctx.bezierCurveTo(
      fx - fWidth + sway * 0.3,
      fy - fHeight * 0.35,
      fx - fWidth * 0.4 + sway * 0.6,
      fy - fHeight * 0.7,
      fx + sway,
      fy - fHeight,
    );
    ctx.bezierCurveTo(
      fx + fWidth * 0.4 + sway * 0.6,
      fy - fHeight * 0.7,
      fx + fWidth + sway * 0.3,
      fy - fHeight * 0.35,
      fx + fWidth * 1.3,
      fy,
    );
    ctx.fill();

    const innerGrad = ctx.createLinearGradient(
      fx,
      fy,
      fx + sway * 0.8,
      fy - fHeight * 0.75,
    );
    innerGrad.addColorStop(0, "rgba(255, 200, 50, 0.7)");
    innerGrad.addColorStop(0.3, "rgba(255, 255, 120, 0.5)");
    innerGrad.addColorStop(0.6, "rgba(255, 255, 200, 0.25)");
    innerGrad.addColorStop(1, "transparent");
    ctx.fillStyle = innerGrad;

    ctx.beginPath();
    ctx.moveTo(fx - fWidth * 0.5, fy);
    ctx.bezierCurveTo(
      fx - fWidth * 0.3 + sway * 0.4,
      fy - fHeight * 0.3,
      fx - fWidth * 0.1 + sway * 0.7,
      fy - fHeight * 0.55,
      fx + sway * 0.8,
      fy - fHeight * 0.75,
    );
    ctx.bezierCurveTo(
      fx + fWidth * 0.1 + sway * 0.7,
      fy - fHeight * 0.55,
      fx + fWidth * 0.3 + sway * 0.4,
      fy - fHeight * 0.3,
      fx + fWidth * 0.5,
      fy,
    );
    ctx.fill();
    ctx.restore();
  }

  // 6. Smoke columns rising with volumetric feel
  for (let smoke = 0; smoke < 6; smoke++) {
    const smSeed = hazSeed + smoke * 5.1;
    const smPhase = (time * 0.3 + seededNoise(smSeed) * 4) % 4;
    if (smPhase > 3.2) continue;
    const smAngle = seededNoise(smSeed + 1) * Math.PI * 2;
    const smDist = sRad * (0.1 + seededNoise(smSeed + 2) * 0.35);
    const windDrift = Math.sin(time * 0.4 + smoke * 0.7) * 8 * cameraZoom;
    const smx = Math.cos(smAngle) * smDist + windDrift * (smPhase / 3);
    const smy =
      Math.sin(smAngle) * smDist * isoRatio -
      22 * cameraZoom -
      smPhase * 16 * cameraZoom;
    const smSize = sRad * (0.04 + smPhase * 0.025) * (1 - smPhase / 4);
    const smAlpha = 0.18 * (1 - smPhase / 3.2);

    ctx.fillStyle = `rgba(60, 45, 35, ${smAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      smx,
      smy,
      smSize * 1.5,
      smSize,
      windDrift * 0.02,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = `rgba(100, 70, 50, ${smAlpha * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(
      smx + 2 * cameraZoom,
      smy + 1 * cameraZoom,
      smSize * 1.2,
      smSize * 0.7,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // 7. Floating ash and cinder particles
  for (let ash = 0; ash < 14; ash++) {
    const aSeed = hazSeed + ash * 2.3;
    const aPhase = (time * 0.8 + seededNoise(aSeed) * 3) % 3;
    const aAngle = seededNoise(aSeed + 1) * Math.PI * 2;
    const aDist = sRad * (0.05 + seededNoise(aSeed + 2) * 0.55);
    const drift = Math.sin(time * 1.5 + ash * 0.7) * 5 * cameraZoom;
    const ax = Math.cos(aAngle) * aDist + drift;
    const ay = Math.sin(aAngle) * aDist * isoRatio - aPhase * 28 * cameraZoom;
    const aSize = (0.8 + (ash % 4) * 0.4) * cameraZoom * (1 - aPhase / 3);
    const aAlpha = 1 - aPhase / 3;

    if (ash < 8) {
      ctx.save();
      ctx.shadowColor = `rgba(255, ${140 + ash * 10}, 30, ${aAlpha * 0.4})`;
      ctx.shadowBlur = 3 * cameraZoom;
      ctx.fillStyle = `rgba(255, ${180 - ash * 12}, 40, ${0.7 * aAlpha})`;
      ctx.beginPath();
      ctx.arc(ax, ay, aSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = `rgba(80, 65, 55, ${0.35 * aAlpha})`;
      ctx.beginPath();
      ctx.arc(ax, ay, aSize * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 8. Heat wave distortion ripples
  for (let ripple = 0; ripple < 3; ripple++) {
    const ripplePhase = (time * 0.5 + ripple * 1.0 + hazSeed * 0.01) % 2.5;
    const rippleR = sRad * (0.3 + ripplePhase * 0.3);
    const rippleY = -12 * cameraZoom - ripplePhase * 10 * cameraZoom;
    const rippleAlpha = 0.08 * (1 - ripplePhase / 2.5);

    ctx.strokeStyle = `rgba(255, 180, 80, ${rippleAlpha})`;
    ctx.lineWidth = (2.5 - ripplePhase * 0.6) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      0,
      rippleY,
      rippleR,
      rippleR * 0.3 * isoRatio,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // 9. Central hellfire glow
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.4);
  const coreAlpha = 0.15 + emberGlow * 0.15 + infernalPulse * 0.08;
  coreGrad.addColorStop(0, `rgba(255, 180, 60, ${coreAlpha})`);
  coreGrad.addColorStop(0.5, `rgba(255, 100, 20, ${coreAlpha * 0.4})`);
  coreGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(
    0,
    -5 * cameraZoom,
    sRad * 0.4,
    sRad * 0.25 * isoRatio,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function drawLightningFieldHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 47.7 + (pos.y || 0) * 23.3;
  const pulse = Math.sin(time * 3.4 + hazSeed) * 0.5 + 0.5;
  const stormPulse = Math.sin(time * 1.2 + hazSeed * 0.3) * 0.5 + 0.5;

  // 1. Wide ionized atmosphere glow
  const atmoGrad = ctx.createRadialGradient(
    0,
    0,
    sRad * 0.1,
    0,
    0,
    sRad * 1.45,
  );
  atmoGrad.addColorStop(0, `rgba(60, 100, 200, ${0.65 + stormPulse * 0.2})`);
  atmoGrad.addColorStop(0.25, `rgba(40, 70, 160, ${0.55 + stormPulse * 0.12})`);
  atmoGrad.addColorStop(0.5, "rgba(25, 45, 110, 0.4)");
  atmoGrad.addColorStop(0.75, "rgba(15, 25, 65, 0.2)");
  atmoGrad.addColorStop(1, "transparent");
  ctx.fillStyle = atmoGrad;
  drawOrganicBlob(ctx, sRad * 1.35, sRad * 1.3 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  // 2. Lichtenberg fractal burn patterns on ground
  for (let branch = 0; branch < 6; branch++) {
    const bSeed = hazSeed + branch * 19.3;
    const bAngle = (branch / 6) * Math.PI * 2 + seededNoise(bSeed) * 0.5;
    const bLen = sRad * (0.45 + seededNoise(bSeed + 1) * 0.45);
    const glowPhase = Math.sin(time * 2.2 + branch * 1.1 + hazSeed) * 0.5 + 0.5;

    ctx.save();
    ctx.shadowColor = `rgba(80, 160, 255, ${glowPhase * 0.3})`;
    ctx.shadowBlur = 4 * cameraZoom;
    ctx.strokeStyle = `rgba(30, 20, 50, ${0.3 + glowPhase * 0.15})`;
    ctx.lineWidth = (1.8 + seededNoise(bSeed + 2) * 0.8) * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);

    let cx = 0;
    let cy = 0;
    const segs = 6;
    for (let seg = 1; seg <= segs; seg++) {
      const jitter = (seededNoise(bSeed + seg * 5.7) - 0.5) * 0.4;
      const segAngle = bAngle + jitter;
      cx += Math.cos(segAngle) * (bLen / segs);
      cy += Math.sin(segAngle) * (bLen / segs) * isoRatio;
      ctx.lineTo(cx, cy);

      if (seg >= 2 && seededNoise(bSeed + seg * 11.3) > 0.45) {
        const subAngle = segAngle + (seededNoise(bSeed + seg * 13) - 0.5) * 1.4;
        const subLen = bLen * (0.15 + seededNoise(bSeed + seg * 15) * 0.2);
        ctx.moveTo(cx, cy);
        let scx = cx;
        let scy = cy;
        for (let sub = 1; sub <= 3; sub++) {
          const subJit = (seededNoise(bSeed + seg * 20 + sub * 3) - 0.5) * 0.3;
          scx += Math.cos(subAngle + subJit) * (subLen / 3);
          scy += Math.sin(subAngle + subJit) * (subLen / 3) * isoRatio;
          ctx.lineTo(scx, scy);
        }
        ctx.moveTo(cx, cy);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // 3. Charged field inner body with plasma effect
  const fieldGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.95);
  fieldGrad.addColorStop(0, `rgba(70, 110, 210, ${0.55 + pulse * 0.2})`);
  fieldGrad.addColorStop(0.3, `rgba(45, 75, 170, ${0.4 + pulse * 0.12})`);
  fieldGrad.addColorStop(0.65, `rgba(28, 48, 120, ${0.25 + pulse * 0.08})`);
  fieldGrad.addColorStop(1, "rgba(15, 25, 60, 0.05)");
  ctx.fillStyle = fieldGrad;
  drawOrganicBlob(ctx, sRad * 0.92, sRad * 0.85 * isoRatio, hazSeed + 30, 0.15);
  ctx.fill();

  // 4. Conductor nodes (glowing tesla orbs at fixed positions)
  const nodeCount = 5;
  const nodePositions: { x: number; y: number }[] = [];
  for (let n = 0; n < nodeCount; n++) {
    const nSeed = hazSeed + n * 31.7;
    const nAngle = (n / nodeCount) * Math.PI * 2 + seededNoise(nSeed) * 0.6;
    const nDist = sRad * (0.4 + seededNoise(nSeed + 1) * 0.3);
    const nx = Math.cos(nAngle) * nDist;
    const ny = Math.sin(nAngle) * nDist * isoRatio;
    nodePositions.push({ x: nx, y: ny });

    const nodePulse = Math.sin(time * 4 + n * 1.7 + hazSeed) * 0.5 + 0.5;
    const nodeSize = (3 + nodePulse * 2.5) * cameraZoom;

    ctx.save();
    ctx.shadowColor = `rgba(130, 200, 255, ${0.6 + nodePulse * 0.4})`;
    ctx.shadowBlur = (10 + nodePulse * 8) * cameraZoom;

    const nodeGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeSize);
    nodeGrad.addColorStop(0, `rgba(220, 245, 255, ${0.9 + nodePulse * 0.1})`);
    nodeGrad.addColorStop(0.4, `rgba(140, 210, 255, ${0.7 + nodePulse * 0.2})`);
    nodeGrad.addColorStop(0.7, `rgba(80, 150, 255, ${0.3 + nodePulse * 0.15})`);
    nodeGrad.addColorStop(1, "rgba(40, 100, 255, 0)");
    ctx.fillStyle = nodeGrad;
    ctx.beginPath();
    ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
    ctx.fill();

    const coronaSize = nodeSize * (1.8 + nodePulse * 0.6);
    const coronaGrad = ctx.createRadialGradient(
      nx,
      ny,
      nodeSize * 0.5,
      nx,
      ny,
      coronaSize,
    );
    coronaGrad.addColorStop(
      0,
      `rgba(100, 180, 255, ${0.15 + nodePulse * 0.1})`,
    );
    coronaGrad.addColorStop(1, "rgba(60, 130, 255, 0)");
    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(nx, ny, coronaSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Tesla arcs between conductor nodes
  for (let i = 0; i < nodeCount; i++) {
    const j = (i + 1) % nodeCount;
    const arcSeed = hazSeed + i * 47.1 + j * 23.3;
    const arcPhase = (time * 3.5 + seededNoise(arcSeed) * 3) % 3;
    if (arcPhase > 0.55) continue;

    const arcAlpha = Math.sin((arcPhase / 0.55) * Math.PI);
    const n1 = nodePositions[i];
    const n2 = nodePositions[j];
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const arcTimeSeed = arcSeed + Math.floor((time * 3.5) / 3) * 11.1;

    ctx.save();
    ctx.shadowColor = `rgba(120, 200, 255, ${arcAlpha * 0.7})`;
    ctx.shadowBlur = 12 * cameraZoom;

    for (let pass = 0; pass < 3; pass++) {
      const widths = [3.5, 1.8, 0.7];
      const colors = [
        `rgba(80, 150, 255, ${arcAlpha * 0.35})`,
        `rgba(160, 220, 255, ${arcAlpha * 0.7})`,
        `rgba(230, 248, 255, ${arcAlpha * 0.55})`,
      ];
      ctx.strokeStyle = colors[pass];
      ctx.lineWidth = widths[pass] * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      const arcSegs = 8;
      for (let seg = 1; seg < arcSegs; seg++) {
        const t = seg / arcSegs;
        const baseX = n1.x + dx * t;
        const baseY = n1.y + dy * t;
        const jitScale = Math.sin(t * Math.PI) * sRad * 0.1;
        const jx =
          (seededNoise(arcTimeSeed + seg * 7 + pass * 0.1) - 0.5) * jitScale;
        const jy =
          (seededNoise(arcTimeSeed + seg * 13 + pass * 0.1) - 0.5) * jitScale;
        ctx.lineTo(baseX + jx, baseY + jy);
      }
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Pulsing energy rings with electric shimmer
  for (let ring = 0; ring < 3; ring++) {
    const ringR = sRad * (0.3 + ring * 0.2 + pulse * 0.06);
    const ringAlpha = (0.18 + pulse * 0.12) * (1 - ring * 0.25);
    ctx.save();
    ctx.shadowColor = `rgba(100, 180, 255, ${ringAlpha * 0.5})`;
    ctx.shadowBlur = 6 * cameraZoom;
    ctx.strokeStyle = `rgba(140, 210, 255, ${ringAlpha})`;
    ctx.lineWidth = (2.2 - ring * 0.4) * cameraZoom;
    ctx.setLineDash([4 * cameraZoom, 3 * cameraZoom]);
    ctx.lineDashOffset = time * 30 * (ring % 2 === 0 ? 1 : -1);
    drawOrganicBlob(
      ctx,
      ringR,
      ringR * isoRatio,
      hazSeed + 40 + ring * 15,
      0.1,
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 7. Ground-level arc crawlers with forked paths
  for (let arc = 0; arc < 6; arc++) {
    const arcSeed = hazSeed + arc * 23.1;
    const arcPhase = (time * 2.5 + seededNoise(arcSeed) * 2) % 2;
    if (arcPhase > 0.4) continue;
    const arcAlpha = Math.sin((arcPhase / 0.4) * Math.PI);
    const arcAngle =
      seededNoise(arcSeed + Math.floor(time * 2.5) * 3.1) * Math.PI * 2;
    const arcR = sRad * (0.25 + seededNoise(arcSeed + 2) * 0.4);

    ctx.save();
    ctx.shadowColor = `rgba(130, 200, 255, ${arcAlpha * 0.6})`;
    ctx.shadowBlur = 10 * cameraZoom;

    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle =
        pass === 0
          ? `rgba(80, 160, 255, ${arcAlpha * 0.4})`
          : `rgba(200, 235, 255, ${arcAlpha * 0.7})`;
      ctx.lineWidth = (pass === 0 ? 2.8 : 1.2) * cameraZoom;
      ctx.beginPath();
      for (let seg = 0; seg <= 7; seg++) {
        const t = seg / 7;
        const theta = arcAngle + t * 1.5;
        const r = arcR * (0.5 + t * 0.5);
        const jit =
          (seededNoise(arcSeed + seg * 7.7 + Math.floor(time * 6) * 2) - 0.5) *
          sRad *
          0.08;
        const x = Math.cos(theta) * r + jit;
        const y = Math.sin(theta) * r * isoRatio + jit * isoRatio;
        if (seg === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 8. Lightning bolt flashes with multi-branch forking
  for (let slot = 0; slot < 4; slot++) {
    const slotSeed = hazSeed + slot * 97.3;
    const cyclePeriod = 1.4 + seededNoise(slotSeed + 10) * 1.0;
    const cyclePhase =
      (time + seededNoise(slotSeed) * cyclePeriod) % cyclePeriod;
    const flashDuration = 0.32;
    if (cyclePhase > flashDuration) continue;

    const flashAlpha = Math.pow(1 - cyclePhase / flashDuration, 1.5);
    const boltTimeSeed = slotSeed + Math.floor(time / cyclePeriod) * 7.1;
    const boltAngle = seededNoise(boltTimeSeed) * Math.PI * 2;
    const boltLen = sRad * (0.35 + seededNoise(boltTimeSeed + 1) * 0.55);
    const startX = Math.cos(boltAngle) * boltLen * 0.08;
    const startY = Math.sin(boltAngle) * boltLen * 0.08 * isoRatio;
    const endX = Math.cos(boltAngle) * boltLen;
    const endY = Math.sin(boltAngle) * boltLen * isoRatio;

    ctx.save();
    ctx.shadowColor = `rgba(120, 200, 255, ${flashAlpha * 0.9})`;
    ctx.shadowBlur = 20 * cameraZoom;

    const boltSegs = 8;
    const boltPoints: { x: number; y: number }[] = [{ x: startX, y: startY }];
    for (let seg = 1; seg <= boltSegs; seg++) {
      const t = seg / boltSegs;
      const baseX = startX + (endX - startX) * t;
      const baseY = startY + (endY - startY) * t;
      const jitter = Math.sin(t * Math.PI) * sRad * 0.16;
      boltPoints.push({
        x: baseX + (seededNoise(boltTimeSeed + seg * 11) - 0.5) * jitter,
        y:
          baseY +
          (seededNoise(boltTimeSeed + seg * 17) - 0.5) * jitter * isoRatio,
      });
    }

    const layers = [
      { width: 5, color: `rgba(60, 120, 255, ${flashAlpha * 0.3})` },
      { width: 3, color: `rgba(140, 200, 255, ${flashAlpha * 0.6})` },
      { width: 1.5, color: `rgba(220, 245, 255, ${flashAlpha * 0.85})` },
      { width: 0.6, color: `rgba(255, 255, 255, ${flashAlpha * 0.7})` },
    ];

    for (const layer of layers) {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.width * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(boltPoints[0].x, boltPoints[0].y);
      for (let p = 1; p < boltPoints.length; p++) {
        ctx.lineTo(boltPoints[p].x, boltPoints[p].y);
      }
      ctx.stroke();
    }

    for (let b = 0; b < 3; b++) {
      if (seededNoise(boltTimeSeed + 30 + b * 7) > 0.35) {
        const branchIdx =
          2 +
          Math.floor(seededNoise(boltTimeSeed + 31 + b * 7) * (boltSegs - 3));
        const bp = boltPoints[branchIdx];
        const branchAngle =
          boltAngle + (seededNoise(boltTimeSeed + 32 + b * 7) - 0.5) * 1.6;
        const branchLen =
          boltLen * (0.2 + seededNoise(boltTimeSeed + 33 + b * 7) * 0.2);

        ctx.strokeStyle = `rgba(140, 210, 255, ${flashAlpha * 0.5})`;
        ctx.lineWidth = 1.5 * cameraZoom;
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y);
        let bx = bp.x;
        let by = bp.y;
        for (let seg = 1; seg <= 4; seg++) {
          const subJit =
            (seededNoise(boltTimeSeed + 40 + b * 20 + seg * 5) - 0.5) *
            branchLen *
            0.2;
          bx += Math.cos(branchAngle) * (branchLen / 4) + subJit;
          by +=
            Math.sin(branchAngle) * (branchLen / 4) * isoRatio +
            subJit * isoRatio * 0.5;
          ctx.lineTo(bx, by);
        }
        ctx.stroke();

        ctx.strokeStyle = `rgba(230, 248, 255, ${flashAlpha * 0.35})`;
        ctx.lineWidth = 0.6 * cameraZoom;
        ctx.stroke();
      }
    }

    if (cyclePhase < 0.08) {
      const impactAlpha = (1 - cyclePhase / 0.08) * 0.35;
      const impactGrad = ctx.createRadialGradient(
        endX,
        endY,
        0,
        endX,
        endY,
        sRad * 0.25,
      );
      impactGrad.addColorStop(0, `rgba(200, 230, 255, ${impactAlpha})`);
      impactGrad.addColorStop(0.5, `rgba(100, 170, 255, ${impactAlpha * 0.4})`);
      impactGrad.addColorStop(1, "rgba(60, 120, 255, 0)");
      ctx.fillStyle = impactGrad;
      ctx.beginPath();
      ctx.ellipse(
        endX,
        endY,
        sRad * 0.25,
        sRad * 0.15 * isoRatio,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.restore();
  }

  // 9. Electric ripple waves emanating from center
  for (let ripple = 0; ripple < 3; ripple++) {
    const ripplePhase = (time * 0.8 + ripple * 1.1 + hazSeed * 0.01) % 3;
    const rippleR = sRad * (0.15 + ripplePhase * 0.35);
    const rippleAlpha = 0.2 * (1 - ripplePhase / 3);
    ctx.strokeStyle = `rgba(120, 190, 255, ${rippleAlpha})`;
    ctx.lineWidth = (2 - ripplePhase * 0.5) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, rippleR, rippleR * isoRatio, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 10. Floating charged particles with trails
  for (let mote = 0; mote < 16; mote++) {
    const mPhase = (time * 1.1 + seededNoise(hazSeed + mote * 2.1) * 2) % 2;
    const mAngle = seededNoise(hazSeed + mote * 4.3) * Math.PI * 2 + time * 0.5;
    const mDist = sRad * (0.1 + seededNoise(hazSeed + mote * 6.7) * 0.65);
    const mx = Math.cos(mAngle) * mDist;
    const my = Math.sin(mAngle) * mDist * isoRatio - mPhase * 18 * cameraZoom;
    const mSize = (1.5 + (mote % 4) * 0.5) * cameraZoom * (1 - mPhase / 2);
    const mAlpha = 0.65 * (1 - mPhase / 2);

    ctx.save();
    ctx.shadowColor = `rgba(130, 200, 255, ${mAlpha * 0.8})`;
    ctx.shadowBlur = 6 * cameraZoom;
    ctx.fillStyle = `rgba(190, 235, 255, ${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, mSize, 0, Math.PI * 2);
    ctx.fill();

    const trailLen = 8 * cameraZoom * (1 - mPhase / 2);
    ctx.strokeStyle = `rgba(140, 210, 255, ${mAlpha * 0.3})`;
    ctx.lineWidth = mSize * 0.6;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx, my + trailLen);
    ctx.stroke();
    ctx.restore();
  }

  // 11. Central corona discharge glow
  const coronaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.3);
  const coronaPulse = 0.12 + stormPulse * 0.1 + pulse * 0.06;
  coronaGrad.addColorStop(0, `rgba(180, 220, 255, ${coronaPulse})`);
  coronaGrad.addColorStop(0.5, `rgba(100, 170, 255, ${coronaPulse * 0.4})`);
  coronaGrad.addColorStop(1, "rgba(60, 120, 255, 0)");
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, sRad * 0.3, sRad * 0.2 * isoRatio, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawVoidRiftHazard(
  ctx: CanvasRenderingContext2D,
  sRad: number,
  time: number,
  pos: Position,
  isoRatio: number,
  cameraZoom: number,
): void {
  const hazSeed = (pos.x || 0) * 53.3 + (pos.y || 0) * 37.7;
  const voidPulse = Math.sin(time * 0.8 + hazSeed) * 0.5 + 0.5;
  const pillarH = 90 * cameraZoom;

  // 1. Ground-level reality distortion — cracked terrain radiating outward
  const distortGrad = ctx.createRadialGradient(
    0,
    4 * cameraZoom,
    sRad * 0.2,
    0,
    4 * cameraZoom,
    sRad * 1.3,
  );
  distortGrad.addColorStop(0, `rgba(45, 12, 80, ${0.6 + voidPulse * 0.1})`);
  distortGrad.addColorStop(0.3, "rgba(35, 8, 60, 0.4)");
  distortGrad.addColorStop(0.6, "rgba(20, 4, 35, 0.2)");
  distortGrad.addColorStop(1, "transparent");
  ctx.fillStyle = distortGrad;
  drawOrganicBlob(ctx, sRad * 1.25, sRad * 1.15 * isoRatio, hazSeed, 0.22);
  ctx.fill();

  // Reality fracture cracks on ground
  for (let crack = 0; crack < 10; crack++) {
    const cSeed = hazSeed + crack * 5.7;
    const cAngle = (crack / 10) * Math.PI * 2 + seededNoise(cSeed) * 0.4;
    const cLen = sRad * (0.5 + seededNoise(cSeed + 1) * 0.6);
    const glowPulse = Math.sin(time * 2 + crack * 1.1 + hazSeed) * 0.15 + 0.15;

    ctx.save();
    ctx.shadowColor = `rgba(140, 60, 220, ${glowPulse})`;
    ctx.shadowBlur = 6 * cameraZoom;
    ctx.strokeStyle = `rgba(120, 50, 200, ${glowPulse + 0.08})`;
    ctx.lineWidth = (1.2 + seededNoise(cSeed + 2) * 0.8) * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let seg = 1; seg <= 5; seg++) {
      const t = seg / 5;
      const jag = (seededNoise(cSeed + seg * 3.1) - 0.5) * 12 * cameraZoom;
      ctx.lineTo(
        Math.cos(cAngle) * cLen * t + Math.cos(cAngle + Math.PI / 2) * jag,
        Math.sin(cAngle) * cLen * t * isoRatio +
          Math.sin(cAngle + Math.PI / 2) * jag * isoRatio,
      );
    }
    ctx.stroke();
    ctx.restore();
  }

  // 2. Central abyss — deep black hole on the ground
  const abyssGrad = ctx.createRadialGradient(
    0,
    2 * cameraZoom,
    0,
    0,
    2 * cameraZoom,
    sRad * 0.55,
  );
  abyssGrad.addColorStop(0, "rgba(0, 0, 0, 0.98)");
  abyssGrad.addColorStop(0.3, "rgba(5, 0, 12, 0.95)");
  abyssGrad.addColorStop(0.6, "rgba(15, 5, 30, 0.85)");
  abyssGrad.addColorStop(0.85, "rgba(35, 12, 60, 0.6)");
  abyssGrad.addColorStop(1, "rgba(50, 20, 80, 0.15)");
  ctx.fillStyle = abyssGrad;
  ctx.beginPath();
  ctx.ellipse(
    0,
    2 * cameraZoom,
    sRad * 0.55,
    sRad * 0.55 * isoRatio,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Event horizon rings on ground
  for (let ring = 0; ring < 3; ring++) {
    const ringR =
      sRad * (0.4 + ring * 0.08 + Math.sin(time * 1.5 + ring * 0.8) * 0.03);
    const ringAlpha =
      0.35 - ring * 0.08 + Math.sin(time * 2.5 + ring * 1.3 + hazSeed) * 0.1;
    ctx.save();
    ctx.shadowColor = `rgba(160, 80, 255, ${ringAlpha * 0.5})`;
    ctx.shadowBlur = (10 - ring * 2) * cameraZoom;
    ctx.strokeStyle = `rgba(${160 + ring * 25}, ${70 + ring * 30}, 255, ${ringAlpha})`;
    ctx.lineWidth = (2.5 - ring * 0.5) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(0, 2 * cameraZoom, ringR, ringR * isoRatio, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Vertical vortex pillar — dark energy column rising upward
  for (let layer = 0; layer < 12; layer++) {
    const t = layer / 12;
    const layerY = -t * pillarH;
    const spin = time * 1.2 + t * 3;
    const narrowing = 1 - t * 0.6;
    const w = sRad * 0.4 * narrowing;
    const h = w * isoRatio;
    const wobX = Math.sin(spin + layer * 0.5) * 4 * cameraZoom * t;
    const alpha = 0.35 - t * 0.025;

    // Dark inner vortex
    ctx.save();
    ctx.translate(wobX, layerY);
    const vGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
    vGrad.addColorStop(0, `rgba(8, 0, 18, ${alpha})`);
    vGrad.addColorStop(0.4, `rgba(25, 8, 50, ${alpha * 0.7})`);
    vGrad.addColorStop(0.8, `rgba(55, 20, 90, ${alpha * 0.3})`);
    vGrad.addColorStop(1, "transparent");
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bright energy rim at each layer
    if (layer % 2 === 0) {
      ctx.save();
      ctx.translate(wobX, layerY);
      const rimAlpha = 0.25 - t * 0.15 + voidPulse * 0.08;
      ctx.shadowColor = `rgba(160, 80, 255, ${rimAlpha * 0.5})`;
      ctx.shadowBlur = 6 * cameraZoom;
      ctx.strokeStyle = `rgba(170, 100, 255, ${rimAlpha})`;
      ctx.lineWidth = (1.5 - t * 0.8) * cameraZoom;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.95, h * 0.95, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Vertical energy streaks along the pillar
  for (let streak = 0; streak < 6; streak++) {
    const sAngle = (streak / 6) * Math.PI * 2 + time * 0.8;
    const sPhase = (time * 0.9 + streak * 0.7) % 2;
    const sAlpha = (1 - sPhase / 2) * 0.25;
    const bottomR = sRad * 0.38;
    const topR = sRad * 0.15;
    const sx1 = Math.cos(sAngle) * bottomR;
    const sy1 = Math.sin(sAngle) * bottomR * isoRatio;
    const sx2 = Math.cos(sAngle + 0.5) * topR;
    const sy2 =
      Math.sin(sAngle + 0.5) * topR * isoRatio -
      pillarH * (0.3 + sPhase * 0.35);

    ctx.save();
    ctx.shadowColor = `rgba(180, 120, 255, ${sAlpha * 0.4})`;
    ctx.shadowBlur = 4 * cameraZoom;
    ctx.strokeStyle = `rgba(200, 150, 255, ${sAlpha})`;
    ctx.lineWidth = 1.5 * cameraZoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.quadraticCurveTo(
      (sx1 + sx2) * 0.5 + Math.sin(time * 3 + streak) * 6 * cameraZoom,
      (sy1 + sy2) * 0.5,
      sx2,
      sy2,
    );
    ctx.stroke();
    ctx.restore();
  }

  // 4. Floating geometric shards being pulled upward
  const shardData = [
    { seed: 1, orbitR: 0.5, size: 6, speed: 0.7, hOff: 0.2 },
    { seed: 2, orbitR: 0.4, size: 5, speed: 0.9, hOff: 0.35 },
    { seed: 3, orbitR: 0.6, size: 7, speed: 0.6, hOff: 0.5 },
    { seed: 4, orbitR: 0.35, size: 4, speed: 1.1, hOff: 0.15 },
    { seed: 5, orbitR: 0.55, size: 5, speed: 0.8, hOff: 0.65 },
    { seed: 6, orbitR: 0.3, size: 4, speed: 1.0, hOff: 0.4 },
    { seed: 7, orbitR: 0.45, size: 6, speed: 0.75, hOff: 0.55 },
    { seed: 8, orbitR: 0.5, size: 3, speed: 1.2, hOff: 0.3 },
  ];
  for (let s = 0; s < shardData.length; s++) {
    const sd = shardData[s];
    const sAngle = (s / shardData.length) * Math.PI * 2 + time * sd.speed;
    const sOrbit = sRad * sd.orbitR;
    const bobY = Math.sin(time * 1.5 + s * 1.7) * 6 * cameraZoom;
    const sx = Math.cos(sAngle) * sOrbit;
    const sy = Math.sin(sAngle) * sOrbit * isoRatio - pillarH * sd.hOff + bobY;
    const sSize = sd.size * cameraZoom;
    const rot = time * 1.5 + s * 2.1;
    const hue = (260 + s * 15 + time * 10) % 310;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rot);
    ctx.shadowColor = `hsla(${hue}, 70%, 55%, 0.5)`;
    ctx.shadowBlur = 8 * cameraZoom;

    // Diamond shard shape
    ctx.fillStyle = `hsla(${hue}, 65%, 50%, ${0.6 + Math.sin(time * 2 + s) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(0, -sSize);
    ctx.lineTo(sSize * 0.5, 0);
    ctx.lineTo(0, sSize * 0.6);
    ctx.lineTo(-sSize * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    // Bright highlight edge
    ctx.strokeStyle = `hsla(${hue}, 80%, 75%, 0.5)`;
    ctx.lineWidth = 0.8 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(0, -sSize);
    ctx.lineTo(sSize * 0.5, 0);
    ctx.stroke();
    ctx.restore();

    // Trailing energy strand downward
    ctx.save();
    ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.12)`;
    ctx.lineWidth = 1 * cameraZoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx * 0.6, sy + pillarH * sd.hOff * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Dimensional tear — tall vertical rip in space hovering above
  const tearH = 40 * cameraZoom;
  const tearCenterY = -pillarH * 0.45;
  const tearWobble = Math.sin(time * 1.2 + hazSeed * 0.01) * 3 * cameraZoom;

  for (let pass = 0; pass < 3; pass++) {
    const widths = [10, 5, 1.8];
    const colors = [
      `rgba(80, 30, 150, ${0.2 + voidPulse * 0.1})`,
      `rgba(150, 80, 240, ${0.35 + voidPulse * 0.15})`,
      `rgba(230, 190, 255, ${0.45 + voidPulse * 0.15})`,
    ];
    ctx.save();
    ctx.shadowColor = `rgba(180, 100, 255, ${pass === 2 ? 0.6 : 0.2})`;
    ctx.shadowBlur = (pass === 2 ? 18 : 8) * cameraZoom;
    ctx.strokeStyle = colors[pass];
    ctx.lineWidth = widths[pass] * cameraZoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tearWobble * 0.5, tearCenterY - tearH * 0.5);
    ctx.quadraticCurveTo(
      tearWobble + Math.sin(time * 2.5) * 4 * cameraZoom,
      tearCenterY,
      -tearWobble * 0.3,
      tearCenterY + tearH * 0.5,
    );
    ctx.stroke();
    ctx.restore();
  }

  // Energy bleed from the vertical tear
  const bleedGrad = ctx.createRadialGradient(
    0,
    tearCenterY,
    0,
    0,
    tearCenterY,
    tearH * 0.8,
  );
  bleedGrad.addColorStop(0, `rgba(160, 80, 255, ${0.12 + voidPulse * 0.06})`);
  bleedGrad.addColorStop(0.5, "rgba(100, 40, 200, 0.04)");
  bleedGrad.addColorStop(1, "transparent");
  ctx.fillStyle = bleedGrad;
  ctx.beginPath();
  ctx.ellipse(0, tearCenterY, tearH * 0.6, tearH * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 6. Debris being sucked upward along the pillar
  for (let p = 0; p < 16; p++) {
    const pSeed = hazSeed + p * 7.1;
    const pPhase = (time * 0.5 + seededNoise(pSeed) * 4) % 4;
    const t = pPhase / 4;
    const orbitAngle =
      (p / 16) * Math.PI * 2 + time * (0.6 + seededNoise(pSeed + 1) * 0.4);
    const spiralR = sRad * (0.5 * (1 - t) + 0.05);
    const px = Math.cos(orbitAngle) * spiralR;
    const py = Math.sin(orbitAngle) * spiralR * isoRatio - t * pillarH;
    const pSize = (1 + (p % 4) * 0.5) * cameraZoom * (1 - t * 0.4);
    const hue = (260 + p * 12 + time * 15) % 310;

    ctx.save();
    ctx.shadowColor = `hsla(${hue}, 70%, 55%, 0.35)`;
    ctx.shadowBlur = 3 * cameraZoom;
    ctx.fillStyle = `hsla(${hue}, 75%, 60%, ${(1 - t) * 0.55 + 0.15})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 7. Star field visible inside the abyss
  for (let star = 0; star < 12; star++) {
    const sSeed = hazSeed + star * 3.7;
    const sAngle = seededNoise(sSeed) * Math.PI * 2 + time * 0.1;
    const sDist = sRad * seededNoise(sSeed + 1) * 0.35;
    const sx = Math.cos(sAngle) * sDist;
    const sy = Math.sin(sAngle) * sDist * isoRatio + 2 * cameraZoom;
    const twinkle = Math.sin(time * 5 + star * 2.1 + hazSeed) * 0.5 + 0.5;
    const starSize = (0.5 + twinkle * 0.8) * cameraZoom;

    ctx.fillStyle = `rgba(220, 200, 255, ${0.15 + twinkle * 0.45})`;
    ctx.beginPath();
    ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
    ctx.fill();

    if (twinkle > 0.75) {
      ctx.strokeStyle = `rgba(240, 220, 255, ${(twinkle - 0.75) * 1.2})`;
      ctx.lineWidth = 0.4 * cameraZoom;
      ctx.beginPath();
      ctx.moveTo(sx - starSize * 1.8, sy);
      ctx.lineTo(sx + starSize * 1.8, sy);
      ctx.moveTo(sx, sy - starSize * 1.8);
      ctx.lineTo(sx, sy + starSize * 1.8);
      ctx.stroke();
    }
  }

  // 8. Floating singularity eye above the pillar
  const eyeY = -pillarH * 0.8;
  const eyeSize = sRad * 0.12;
  const eyeGrad = ctx.createRadialGradient(0, eyeY, 0, 0, eyeY, eyeSize * 2.5);
  eyeGrad.addColorStop(0, `rgba(200, 140, 255, ${0.3 + voidPulse * 0.2})`);
  eyeGrad.addColorStop(0.3, `rgba(140, 70, 220, ${0.2 + voidPulse * 0.1})`);
  eyeGrad.addColorStop(0.6, "rgba(80, 30, 160, 0.06)");
  eyeGrad.addColorStop(1, "transparent");
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.ellipse(0, eyeY, eyeSize * 2.5, eyeSize * 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = `rgba(220, 160, 255, ${0.5 + voidPulse * 0.3})`;
  ctx.shadowBlur = 14 * cameraZoom;
  ctx.fillStyle = `rgba(240, 210, 255, ${0.4 + voidPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, eyeY, eyeSize * (0.8 + voidPulse * 0.2), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Inner dark pupil
  ctx.fillStyle = `rgba(10, 0, 25, ${0.85 + voidPulse * 0.1})`;
  ctx.beginPath();
  ctx.arc(0, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawGenericHazard(
  ctx: CanvasRenderingContext2D,
  size: number,
  time: number,
  zoom: number,
): void {
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
