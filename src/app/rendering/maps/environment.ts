// Princeton Tower Defense – Enhanced Environmental Effects
// Creates living, breathing map atmospheres for each region.
//
// Optimizations over the previous version:
//   – Swap-and-pop particle removal (O(1) vs O(n) splice)
//   – Performance-module integration (shouldSpawnParticle, getAdjustedParticleCount)
//   – Reduced save/restore calls for simple circle particles
//   – Shared atmospheric effects extracted to effects/atmospheric.ts
//
// Visual enhancements:
//   – God rays (grassland / desert)
//   – Animated aurora bands (winter)
//   – Rolling fog banks (swamp)
//   – New particle types: leaves, sand streaks, wind gusts, moss
//   – Screen glows for atmospheric depth

import { ISO_Y_RATIO } from "../../constants";
import {
  renderGodRays,
  renderFogBanks,
  renderAuroraEffect,
  renderScreenGlow,
  renderDappledLight,
  renderLightShafts,
  renderFrostVignette,
  renderMagmaCracks,
  renderCloudShadows,
  renderColorGrade,
} from "../effects/atmospheric";
import { colorWithAlpha } from "../helpers";
import {
  shouldRenderEnvironment,
  shouldSpawnParticle,
  getAdjustedParticleCount,
  getPerformanceSettings,
} from "../performance";

// ============================================================================
// ENVIRONMENTAL PARTICLE SYSTEMS
// ============================================================================

export interface EnvironmentParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  type: string;
}

const particlePools = new Map<string, EnvironmentParticle[]>();

function getParticlePool(
  poolId: string,
  maxSize: number
): EnvironmentParticle[] {
  if (!particlePools.has(poolId)) {
    particlePools.set(poolId, []);
  }
  const pool = particlePools.get(poolId)!;
  if (pool.length > maxSize) {
    pool.length = maxSize;
  }
  return pool;
}

// ============================================================================
// PARTICLE GLOW TEMPLATES – Pre-rendered radial glows for GPU-friendly drawImage
// ============================================================================

let _glowTemplates: Map<string, HTMLCanvasElement> | null = null;
const GLOW_SIZE = 64;

function createSoftGlow(
  size: number,
  r: number,
  g: number,
  b: number
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const half = size / 2;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(0.18, `rgba(${r},${g},${b},0.65)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.22)`);
  grad.addColorStop(0.65, `rgba(${r},${g},${b},0.06)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

function getGlowTemplates(): Map<string, HTMLCanvasElement> {
  if (_glowTemplates) {
    return _glowTemplates;
  }
  if (typeof document === "undefined") {
    return new Map();
  }
  const s = GLOW_SIZE;
  _glowTemplates = new Map([
    ["white", createSoftGlow(s, 255, 255, 255)],
    ["warm", createSoftGlow(s, 255, 245, 210)],
    ["ember_orange", createSoftGlow(s, 255, 130, 30)],
    ["ember_yellow", createSoftGlow(s, 255, 210, 50)],
    ["firefly", createSoftGlow(s, 160, 255, 160)],
    ["sparkle", createSoftGlow(s, 170, 220, 255)],
    ["spore", createSoftGlow(s, 136, 204, 136)],
    ["sand", createSoftGlow(s, 212, 168, 118)],
    ["petal_pink", createSoftGlow(s, 255, 180, 200)],
    ["petal_white", createSoftGlow(s, 255, 250, 240)],
    ["dandelion", createSoftGlow(s, 255, 255, 220)],
    ["dust_mote", createSoftGlow(s, 255, 240, 180)],
    ["wisp_blue", createSoftGlow(s, 100, 180, 255)],
    ["wisp_green", createSoftGlow(s, 80, 255, 120)],
    ["lava_red", createSoftGlow(s, 255, 60, 20)],
    ["ash_hot", createSoftGlow(s, 200, 100, 60)],
    ["ice_prism", createSoftGlow(s, 200, 220, 255)],
    ["toxic", createSoftGlow(s, 120, 200, 60)],
    ["biolum", createSoftGlow(s, 60, 220, 160)],
  ]);
  return _glowTemplates;
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  tmpl: HTMLCanvasElement,
  x: number,
  y: number,
  diameter: number,
  alpha: number
): void {
  if (alpha < 0.008) {
    return;
  }
  const half = diameter * 0.5;
  ctx.globalAlpha = alpha;
  ctx.drawImage(tmpl, x - half, y - half, diameter, diameter);
  ctx.globalAlpha = 1;
}

// ============================================================================
// BLACK VIGNETTE – Dark edge effect for all environments
// ============================================================================

function renderBlackVignette(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  intensity: number = 0.6
): void {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const diagonal = Math.sqrt(
    canvasWidth * canvasWidth + canvasHeight * canvasHeight
  );
  const innerRadius = Math.min(canvasWidth, canvasHeight) * 0.25;
  const outerRadius = diagonal * 0.58;

  const grad = ctx.createRadialGradient(
    centerX,
    centerY,
    innerRadius,
    centerX,
    centerY,
    outerRadius
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.3, `rgba(0,0,0,${(intensity * 0.15).toFixed(3)})`);
  grad.addColorStop(0.55, `rgba(0,0,0,${(intensity * 0.35).toFixed(3)})`);
  grad.addColorStop(0.75, `rgba(0,0,0,${(intensity * 0.6).toFixed(3)})`);
  grad.addColorStop(0.9, `rgba(0,0,0,${(intensity * 0.85).toFixed(3)})`);
  grad.addColorStop(1, `rgba(0,0,0,${intensity.toFixed(3)})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// ============================================================================
// EDGE FOG – Colored circular vignette
// ============================================================================

function renderEdgeFog(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  r: number,
  g: number,
  b: number,
  baseAlpha: number = 0.5
): void {
  const pulse = 1 + Math.sin(time * 0.5) * 0.06;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const diagonal = Math.sqrt(
    canvasWidth * canvasWidth + canvasHeight * canvasHeight
  );
  const innerRadius = Math.min(canvasWidth, canvasHeight) * 0.12 * pulse;
  const outerRadius = diagonal * 0.55;

  const grad = ctx.createRadialGradient(
    centerX,
    centerY,
    innerRadius,
    centerX,
    centerY,
    outerRadius
  );
  grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
  grad.addColorStop(
    0.25,
    `rgba(${r},${g},${b},${(baseAlpha * 0.2).toFixed(3)})`
  );
  grad.addColorStop(
    0.5,
    `rgba(${r},${g},${b},${(baseAlpha * 0.5).toFixed(3)})`
  );
  grad.addColorStop(
    0.75,
    `rgba(${r},${g},${b},${(baseAlpha * 0.8).toFixed(3)})`
  );
  grad.addColorStop(1, `rgba(${r},${g},${b},${baseAlpha.toFixed(3)})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// ============================================================================
// EDGE SPAWN HELPER
// ============================================================================

function spawnFromRandomEdge(
  canvasWidth: number,
  canvasHeight: number
): {
  x: number;
  y: number;
  vx: number;
  vy: number;
  edge: "top" | "bottom" | "left" | "right";
} {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: {
      return {
        edge: "top",
        vx: (Math.random() - 0.5) * 30,
        vy: 20 + Math.random() * 30,
        x: Math.random() * canvasWidth,
        y: -10,
      };
    }
    case 1: {
      return {
        edge: "bottom",
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 30,
        x: Math.random() * canvasWidth,
        y: canvasHeight + 10,
      };
    }
    case 2: {
      return {
        edge: "left",
        vx: 20 + Math.random() * 30,
        vy: (Math.random() - 0.5) * 30,
        x: -10,
        y: Math.random() * canvasHeight,
      };
    }
    case 3:
    default: {
      return {
        edge: "right",
        vx: -20 - Math.random() * 30,
        vy: (Math.random() - 0.5) * 30,
        x: canvasWidth + 10,
        y: Math.random() * canvasHeight,
      };
    }
  }
}

// ============================================================================
// GRASSLAND – Dappled sunlight, pollen, petals, butterflies, leaves, motes
// ============================================================================

const LEAF_COLORS = ["#5a8a4a", "#4a7a3a", "#6a9a5a", "#8aaa6a"];
const BUTTERFLY_COLORS = ["#ff88cc", "#88ccff", "#ffcc44", "#ff8844"];
const PETAL_COLORS = ["#ffb8cc", "#ffc8d8", "#ffe0e8", "#ffffff"];

export function renderGrasslandEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool("grassland", getAdjustedParticleCount(280));

  // Dappled sunlight – shifting pools of golden light through canopy
  if (!settings.reducedParticles) {
    renderDappledLight(
      ctx,
      canvasWidth,
      canvasHeight,
      time,
      255,
      240,
      180,
      0.045,
      14
    );
  }

  // Cloud shadows drifting across the ground
  if (!settings.reducedParticles) {
    renderCloudShadows(ctx, canvasWidth, canvasHeight, time, 0.055, 4);
  }

  // God rays from upper-left – warm golden beams across the screen
  if (!settings.reducedParticles) {
    renderGodRays(
      ctx,
      canvasWidth,
      canvasHeight,
      time,
      -canvasWidth * 0.05,
      -canvasHeight * 0.05,
      255,
      230,
      170,
      0.05,
      9
    );
  }

  // Secondary cooler fill-light from opposite side for depth
  if (!settings.reducedParticles) {
    renderGodRays(
      ctx,
      canvasWidth,
      canvasHeight,
      time,
      canvasWidth * 1.1,
      canvasHeight * 0.3,
      180,
      220,
      255,
      0.015,
      4
    );
  }

  // Pollen / seeds from edges
  if (shouldSpawnParticle(0.14)) {
    const spawnY = Math.random() * canvasHeight;
    const spawnX = Math.random() > 0.5 ? -10 : canvasWidth + 10;
    const windDir = spawnX < 0 ? 1 : -1;
    pool.push({
      alpha: 0.08 + Math.random() * 0.12,
      color: Math.random() > 0.5 ? "#ffffff" : "#ffffcc",
      life: 1,
      maxLife: 1,
      size: 2 + Math.random() * 3,
      type: "pollen",
      vx: windDir * (35 + Math.random() * 45),
      vy: (Math.random() - 0.5) * 25,
      x: spawnX,
      y: spawnY,
    });
  }

  // Dandelion seeds – float gently upward with slow horizontal drift
  if (shouldSpawnParticle(0.04)) {
    pool.push({
      alpha: 0.15 + Math.random() * 0.15,
      color: "#fffff0",
      life: 1,
      maxLife: 1,
      size: 2 + Math.random() * 2.5,
      type: "dandelion",
      vx: (Math.random() - 0.3) * 12,
      vy: -8 - Math.random() * 12,
      x: Math.random() * canvasWidth,
      y: canvasHeight * (0.5 + Math.random() * 0.5),
    });
  }

  // Flower petals – slow spiral drift from top
  if (shouldSpawnParticle(0.05)) {
    pool.push({
      alpha: 0.12 + Math.random() * 0.1,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      life: 1,
      maxLife: 1,
      size: 2.5 + Math.random() * 3,
      type: "petal",
      vx: 8 + Math.random() * 18,
      vy: 10 + Math.random() * 15,
      x: Math.random() * canvasWidth,
      y: -10,
    });
  }

  // Dust motes caught in sunbeams
  if (shouldSpawnParticle(0.1)) {
    pool.push({
      alpha: 0.06 + Math.random() * 0.08,
      color: "#ffeedd",
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 1.5,
      type: "mote",
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 5,
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight * 0.6,
    });
  }

  // Drifting leaves
  if (shouldSpawnParticle(0.06)) {
    pool.push({
      alpha: 0.06 + Math.random() * 0.08,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      life: 1,
      maxLife: 1,
      size: 3 + Math.random() * 3,
      type: "leaf",
      vx: 15 + Math.random() * 25,
      vy: 12 + Math.random() * 20,
      x: Math.random() * canvasWidth,
      y: -10,
    });
  }

  // Butterflies (rare)
  if (shouldSpawnParticle(0.007)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      alpha: 0.5,
      color:
        BUTTERFLY_COLORS[Math.floor(Math.random() * BUTTERFLY_COLORS.length)],
      life: 1,
      maxLife: 1,
      size: 8 + Math.random() * 4,
      type: "butterfly",
      vx: spawn.vx * 1.2,
      vy: spawn.vy * 0.5,
      x: spawn.x,
      y: spawn.y,
    });
  }

  // --- Update & render (swap-and-pop removal) ---
  const grassTmpls = getGlowTemplates();
  const pollenGlow = grassTmpls.get("warm");
  const dandelionGlow = grassTmpls.get("dandelion");
  const moteGlow = grassTmpls.get("dust_mote");
  const petalPink = grassTmpls.get("petal_pink");
  const petalWhite = grassTmpls.get("petal_white");

  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "pollen") {
      p.x += Math.sin(time * 2.5 + i * 0.3 + p.y * 0.01) * 0.8;
      p.y += Math.sin(time * 1.5 + i * 0.5) * 0.4;
    } else if (p.type === "butterfly") {
      p.y += Math.sin(time * 8 + i * 3) * 2;
      p.x += Math.sin(time * 3 + i) * 0.3;
    } else if (p.type === "leaf") {
      p.x += Math.sin(time * 1.2 + i * 0.6) * 1.2;
      p.y += Math.cos(time * 0.8 + i * 0.4) * 0.6;
      p.alpha *= 0.999;
    } else if (p.type === "dandelion") {
      p.x += Math.sin(time * 0.8 + i * 1.3) * 1.5;
      p.y += Math.cos(time * 0.6 + i * 0.9) * 0.8;
      p.alpha *= 0.998;
    } else if (p.type === "petal") {
      const spiral = time * 2.5 + i * 1.8;
      p.x += Math.sin(spiral) * 1.8;
      p.y += Math.cos(spiral * 0.7) * 0.5;
      p.alpha *= 0.998;
    } else if (p.type === "mote") {
      p.x += Math.sin(time * 1.8 + i * 2.1) * 0.3;
      p.y += Math.sin(time * 1.2 + i * 0.7) * 0.2;
      p.alpha *= 0.997;
    }

    if (
      p.y < -30 ||
      p.y > canvasHeight + 30 ||
      p.x > canvasWidth + 30 ||
      p.x < -30 ||
      p.alpha < 0.02
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "butterfly") {
      const wingFlap = Math.sin(time * 15 + i * 5);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.7);
      ctx.beginPath();
      ctx.ellipse(
        -p.size * 0.5,
        0,
        p.size * 0.4,
        p.size * (0.3 + wingFlap * 0.2),
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        p.size * 0.5,
        0,
        p.size * 0.4,
        p.size * (0.3 + wingFlap * 0.2),
        0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "rgba(51,51,51,0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.1, p.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === "leaf") {
      const leafAngle = time * 0.8 + i * 2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(leafAngle);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * 0.5);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-p.size * 0.7, 0);
      ctx.lineTo(p.size * 0.7, 0);
      ctx.stroke();
      ctx.restore();
    } else if (p.type === "petal") {
      const petalAngle = time * 1.5 + i * 2.4;
      const tmpl = p.color === "#ffffff" ? petalWhite : petalPink;
      if (tmpl) {
        drawGlow(ctx, tmpl, p.x, p.y, p.size * 3, p.alpha * 0.4);
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(petalAngle);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI);
      ctx.fill();
      ctx.restore();
    } else if (p.type === "dandelion") {
      if (dandelionGlow) {
        drawGlow(ctx, dandelionGlow, p.x, p.y, p.size * 6, p.alpha * 0.35);
      }
      ctx.strokeStyle = colorWithAlpha("#fffff0", p.alpha * 0.6);
      ctx.lineWidth = 0.6;
      const armCount = 5;
      for (let a = 0; a < armCount; a++) {
        const angle = (a / armCount) * Math.PI * 2 + time * 0.2 + i;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(
          p.x + Math.cos(angle) * p.size * 1.5,
          p.y + Math.sin(angle) * p.size * 1.5
        );
        ctx.stroke();
      }
      ctx.fillStyle = colorWithAlpha("#fffff0", p.alpha * 0.8);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "mote" && moteGlow) {
      const flicker = 0.5 + Math.sin(time * 6 + i * 3.7) * 0.5;
      drawGlow(ctx, moteGlow, p.x, p.y, p.size * 5, p.alpha * flicker);
    } else if (pollenGlow) {
      drawGlow(ctx, pollenGlow, p.x, p.y, p.size * 4.5, p.alpha * 0.55);
    }
  }

  // Warm center glow
  const glowAlpha = 0.03 + Math.sin(time * 0.4) * 0.012;
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    canvasHeight * 0.35,
    255,
    240,
    200,
    glowAlpha,
    Math.min(canvasWidth, canvasHeight) * 0.5
  );

  // Secondary warm glow from sun direction (upper-left)
  renderScreenGlow(
    ctx,
    canvasWidth * 0.15,
    canvasHeight * 0.1,
    255,
    220,
    150,
    0.02 + Math.sin(time * 0.3) * 0.008,
    Math.min(canvasWidth, canvasHeight) * 0.4
  );

  // Color grading – warm golden highlights, cool green shadows
  renderColorGrade(
    ctx,
    canvasWidth,
    canvasHeight,
    40,
    60,
    30,
    0.03,
    255,
    240,
    200,
    0.02
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 50, 70, 40, 0.65);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.5);
}

// ============================================================================
// DESERT – Scorching sun, sand storms, dust devils, mirage, tumbleweeds
// ============================================================================

export function renderDesertEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool("desert", getAdjustedParticleCount(300));

  // Sun corona with pulsing halo from above
  const coronaAlpha = 0.07 + Math.sin(time * 0.5) * 0.025;
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    -canvasHeight * 0.08,
    255,
    240,
    200,
    coronaAlpha,
    canvasWidth * 0.55
  );

  // Secondary sun halo ring – simulates atmospheric scattering
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    -canvasHeight * 0.05,
    255,
    200,
    120,
    0.02 + Math.sin(time * 0.7) * 0.008,
    canvasWidth * 0.7
  );

  // God rays from upper-center – harsh desert sun, more rays
  if (!settings.reducedParticles) {
    renderGodRays(
      ctx,
      canvasWidth,
      canvasHeight,
      time,
      canvasWidth * 0.5,
      -canvasHeight * 0.1,
      255,
      220,
      160,
      0.04,
      8
    );
  }

  // Sand particles blown by wind – full screen coverage
  if (shouldSpawnParticle(0.2)) {
    const spawnY = Math.random() * canvasHeight;
    pool.push({
      alpha: 0.45 + Math.random() * 0.3,
      color: Math.random() > 0.3 ? "#d4a574" : "#c4956a",
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 2.5,
      type: "sand",
      vx: 50 + Math.random() * 70,
      vy: (Math.random() - 0.5) * 35,
      x: -10,
      y: spawnY,
    });
  }

  // Sand from top/bottom for vertical spread
  if (shouldSpawnParticle(0.1)) {
    const fromTop = Math.random() > 0.5;
    pool.push({
      alpha: 0.35 + Math.random() * 0.25,
      color: "#d4a574",
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 2,
      type: "sand",
      vx: 30 + Math.random() * 40,
      vy: fromTop ? 20 + Math.random() * 30 : -20 - Math.random() * 30,
      x: Math.random() * canvasWidth,
      y: fromTop ? -10 : canvasHeight + 10,
    });
  }

  // Sand streaks – thin elongated particles for wind lines
  if (shouldSpawnParticle(0.09)) {
    pool.push({
      alpha: 0.15 + Math.random() * 0.12,
      color: "#c4a080",
      life: 1,
      maxLife: 1,
      size: 1.5 + Math.random() * 2,
      type: "streak",
      vx: 90 + Math.random() * 60,
      vy: (Math.random() - 0.5) * 15,
      x: -20,
      y: Math.random() * canvasHeight,
    });
  }

  // Tumbleweed (rare) – large, slow-rolling silhouettes
  if (shouldSpawnParticle(0.003)) {
    pool.push({
      alpha: 0.15 + Math.random() * 0.1,
      color: "#8b7355",
      life: 1,
      maxLife: 1,
      size: 10 + Math.random() * 8,
      type: "tumbleweed",
      vx: 30 + Math.random() * 40,
      vy: (Math.random() - 0.5) * 8,
      x: -30,
      y: canvasHeight * (0.5 + Math.random() * 0.4),
    });
  }

  // Dust devils (rare)
  if (shouldSpawnParticle(0.005)) {
    const devilX = Math.random() * canvasWidth;
    const devilY = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.5;
    const burstCount = settings.reducedParticles ? 12 : 28;
    for (let j = 0; j < burstCount; j++) {
      pool.push({
        alpha: 0.5,
        color: "#c4a080",
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 5,
        type: "dustdevil",
        vx: (Math.random() - 0.5) * 50,
        vy: -40 - Math.random() * 60,
        x: devilX + (Math.random() - 0.5) * 40,
        y: devilY - j * 4,
      });
    }
  }

  // Distant dust plumes on horizon
  if (shouldSpawnParticle(0.02)) {
    pool.push({
      alpha: 0.04 + Math.random() * 0.03,
      color: "#d4b896",
      life: 1,
      maxLife: 1,
      size: 15 + Math.random() * 25,
      type: "dustcloud",
      vx: 5 + Math.random() * 15,
      vy: -2 - Math.random() * 4,
      x: Math.random() * canvasWidth,
      y: canvasHeight * (0.55 + Math.random() * 0.15),
    });
  }

  // --- Update & render ---
  const desertTmpls = getGlowTemplates();
  const sandGlow = desertTmpls.get("sand");

  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;
    p.alpha *= 0.996;

    if (p.type === "dustdevil") {
      p.x += Math.sin(time * 10 + i * 0.5) * 4;
      p.vy -= 0.6;
    } else if (p.type === "streak") {
      p.alpha *= 0.992;
    } else if (p.type === "tumbleweed") {
      p.y += Math.sin(time * 2 + i * 3) * 0.8;
    } else if (p.type === "dustcloud") {
      p.size += 0.15;
      p.alpha *= 0.994;
    } else {
      p.y += Math.sin(time * 3 + i * 0.3 + p.x * 0.01) * 0.5;
    }

    if (
      p.x > canvasWidth + 40 ||
      p.x < -40 ||
      p.y < -40 ||
      p.y > canvasHeight + 40 ||
      p.alpha < 0.02
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "streak") {
      const streakAngle = Math.atan2(p.vy, p.vx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(streakAngle);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 6, p.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colorWithAlpha("#e8c89a", p.alpha * 0.4);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 3, p.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === "tumbleweed") {
      const roll = time * 3 + i * 5;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(roll);
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.stroke();
      for (let b = 0; b < 5; b++) {
        const bAngle = (b / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const bx = Math.cos(bAngle) * p.size * 0.8;
        const by = Math.sin(bAngle) * p.size * 0.8;
        ctx.quadraticCurveTo(
          Math.cos(bAngle + 0.3) * p.size * 0.5,
          Math.sin(bAngle + 0.3) * p.size * 0.5,
          bx,
          by
        );
        ctx.stroke();
      }
      ctx.restore();
    } else if (p.type === "dustcloud") {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, colorWithAlpha(p.color, p.alpha));
      grad.addColorStop(0.5, colorWithAlpha(p.color, p.alpha * 0.4));
      grad.addColorStop(1, colorWithAlpha(p.color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "dustdevil" && sandGlow) {
      drawGlow(ctx, sandGlow, p.x, p.y, p.size * 4, p.alpha * 0.6);
    } else if (sandGlow) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const stretch = Math.min(speed * 0.02, 2.5);
      if (stretch > 0.3) {
        const sandAngle = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(sandAngle);
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.drawImage(
          sandGlow,
          -p.size * (1.5 + stretch),
          -p.size * 1.2,
          p.size * (3 + stretch * 2),
          p.size * 2.4
        );
        ctx.globalAlpha = 1;
        ctx.restore();
      } else {
        drawGlow(ctx, sandGlow, p.x, p.y, p.size * 3.5, p.alpha * 0.7);
      }
    }
  }

  // Heat shimmer gradient – stronger layered effect
  const shimmerGrad = ctx.createLinearGradient(
    0,
    canvasHeight * 0.2,
    0,
    canvasHeight
  );
  shimmerGrad.addColorStop(0, "rgba(255,200,150,0)");
  shimmerGrad.addColorStop(
    0.3,
    `rgba(255,220,180,${(0.03 + Math.sin(time * 1.8) * 0.012).toFixed(4)})`
  );
  shimmerGrad.addColorStop(
    0.6,
    `rgba(255,210,170,${(0.05 + Math.sin(time * 2.2) * 0.018).toFixed(4)})`
  );
  shimmerGrad.addColorStop(1, "rgba(255,200,150,0)");
  ctx.fillStyle = shimmerGrad;
  ctx.fillRect(0, canvasHeight * 0.2, canvasWidth, canvasHeight * 0.8);

  // Heat wave lines across full screen – thicker, more animated
  const waveCount = settings.reducedParticles ? 6 : 10;
  for (let i = 0; i < waveCount; i++) {
    const waveY = canvasHeight * (0.1 + i * 0.08);
    const waveAlpha = 0.04 + Math.sin(time * 0.5 + i * 0.7) * 0.02;
    ctx.strokeStyle = `rgba(255,220,180,${waveAlpha.toFixed(4)})`;
    ctx.lineWidth = 1.5 + Math.sin(time * 0.3 + i) * 0.5;
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x += 12) {
      const y =
        waveY +
        Math.sin(x * 0.015 + time * 3 + i * 1.5) * 10 +
        Math.sin(x * 0.008 + time * 1.8 + i * 0.8) * 5;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Mirage shimmer at horizon – more convincing with layered ellipses
  const mirageBase = canvasHeight * 0.68;
  for (let layer = 0; layer < 3; layer++) {
    const mirageAlpha =
      (0.05 + Math.sin(time * 1.5 + layer * 0.5) * 0.02) * (1 - layer * 0.3);
    ctx.fillStyle = `rgba(135,206,250,${mirageAlpha.toFixed(4)})`;
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x += 30) {
      const y =
        mirageBase + layer * 8 + Math.sin(x * 0.025 + time * 2 + layer) * 6;
      ctx.ellipse(x, y, 55, 5 + layer * 2, 0, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  // Sun dogs (parhelion) – bright spots flanking the sun
  if (!settings.reducedParticles) {
    const sunDogAlpha = 0.025 + Math.sin(time * 0.4) * 0.01;
    renderScreenGlow(
      ctx,
      canvasWidth * 0.25,
      canvasHeight * 0.05,
      255,
      200,
      130,
      sunDogAlpha,
      60
    );
    renderScreenGlow(
      ctx,
      canvasWidth * 0.75,
      canvasHeight * 0.05,
      255,
      200,
      130,
      sunDogAlpha,
      60
    );
  }

  // Sand haze – full-screen low-alpha overlay
  ctx.fillStyle = `rgba(210,180,140,${(0.025 + Math.sin(time * 0.6) * 0.01).toFixed(4)})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Color grading – warm amber highlights, deep brown shadows
  renderColorGrade(
    ctx,
    canvasWidth,
    canvasHeight,
    100,
    60,
    20,
    0.04,
    255,
    220,
    160,
    0.025
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 120, 90, 50, 0.7);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.5);
}

// ============================================================================
// WINTER – Blizzard layers, prismatic ice, aurora, frost, moonlight
// ============================================================================

export function renderWinterEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool("winter", getAdjustedParticleCount(300));

  // Moonlight glow from upper-right with halo
  renderScreenGlow(
    ctx,
    canvasWidth * 0.8,
    canvasHeight * 0.05,
    200,
    220,
    255,
    0.04 + Math.sin(time * 0.25) * 0.012,
    Math.min(canvasWidth, canvasHeight) * 0.35
  );

  // Moon halo ring
  if (!settings.reducedParticles) {
    renderScreenGlow(
      ctx,
      canvasWidth * 0.8,
      canvasHeight * 0.05,
      180,
      200,
      240,
      0.02 + Math.sin(time * 0.3) * 0.008,
      Math.min(canvasWidth, canvasHeight) * 0.55
    );
  }

  // Light shafts from moonlight
  if (!settings.reducedParticles) {
    renderLightShafts(
      ctx,
      canvasWidth,
      canvasHeight,
      time,
      180,
      210,
      255,
      0.012,
      3
    );
  }

  // Snowflakes with wind – heavier snowfall
  if (shouldSpawnParticle(0.32)) {
    pool.push({
      alpha: 0.3 + Math.random() * 0.25,
      color: "#ffffff",
      life: 1,
      maxLife: 1,
      size: 2 + Math.random() * 4,
      type: Math.random() > 0.85 ? "crystal" : "snow",
      vx: -20 + Math.random() * 15,
      vy: 35 + Math.random() * 45,
      x: Math.random() * (canvasWidth + 150) - 75,
      y: -10,
    });
  }

  // Prismatic ice sparkles – catch moonlight with rainbow refraction
  if (shouldSpawnParticle(0.08)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    const prismColors = ["#aaddff", "#ccaaff", "#aaffcc", "#ffccaa", "#ffaacc"];
    pool.push({
      alpha: 0.5,
      color: prismColors[Math.floor(Math.random() * prismColors.length)],
      life: 1,
      maxLife: 1,
      size: 1.5 + Math.random() * 3,
      type: "prism",
      vx: spawn.vx * 0.6,
      vy: spawn.vy * 0.6,
      x: spawn.x,
      y: spawn.y,
    });
  }

  // Ice sparkles from edges
  if (shouldSpawnParticle(0.06)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      alpha: 0.45,
      color: "#aaddff",
      life: 1,
      maxLife: 1,
      size: 1.5 + Math.random() * 2.5,
      type: "sparkle",
      vx: spawn.vx * 0.7,
      vy: spawn.vy * 0.7,
      x: spawn.x,
      y: spawn.y,
    });
  }

  // Blizzard wind gusts – more dramatic
  const gustPhase = Math.sin(time * 0.4);
  if (gustPhase > 0.88 && shouldSpawnParticle(0.6)) {
    const burstCount = settings.reducedParticles ? 4 : 8;
    for (let j = 0; j < burstCount; j++) {
      pool.push({
        alpha: 0.25 + Math.random() * 0.15,
        color: "#ffffff",
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 3,
        type: "gust",
        vx: 100 + Math.random() * 80,
        vy: (Math.random() - 0.5) * 25,
        x: -10,
        y: Math.random() * canvasHeight,
      });
    }
  }

  // Ice dust – very fine particles that catch light
  if (shouldSpawnParticle(0.12)) {
    pool.push({
      alpha: 0.08 + Math.random() * 0.1,
      color: "#ddeeff",
      life: 1,
      maxLife: 1,
      size: 0.8 + Math.random() * 1.2,
      type: "icedust",
      vx: -5 + Math.random() * 3,
      vy: 1 + Math.random() * 3,
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight * 0.8,
    });
  }

  // --- Update & render ---
  const winterTmpls = getGlowTemplates();
  const snowGlow = winterTmpls.get("white");
  const sparkleGlow = winterTmpls.get("sparkle");
  const prismGlow = winterTmpls.get("ice_prism");

  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "snow" || p.type === "crystal") {
      p.x += Math.sin(time * 2 + i * 0.3 + p.y * 0.008) * 1;
    } else if (p.type === "sparkle" || p.type === "prism") {
      p.alpha *= 0.97;
    } else if (p.type === "gust") {
      p.alpha *= 0.985;
      p.y += Math.sin(time * 4 + i * 0.5) * 0.8;
    } else if (p.type === "icedust") {
      p.x += Math.sin(time * 1.5 + i * 2.3) * 0.3;
      p.alpha *= 0.996;
    }

    if (
      p.y > canvasHeight + 10 ||
      p.y < -20 ||
      p.x < -30 ||
      p.x > canvasWidth + 30 ||
      p.alpha < 0.03
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "crystal") {
      if (sparkleGlow) {
        drawGlow(ctx, sparkleGlow, p.x, p.y, p.size * 5, p.alpha * 0.25);
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 0.3 + i);
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * 0.7);
      ctx.lineWidth = 1.2;
      for (let j = 0; j < 6; j++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -p.size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.55);
        ctx.lineTo(p.size * 0.22, -p.size * 0.78);
        ctx.moveTo(0, -p.size * 0.55);
        ctx.lineTo(-p.size * 0.22, -p.size * 0.78);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
      ctx.restore();
    } else if (p.type === "prism") {
      if (prismGlow) {
        drawGlow(ctx, prismGlow, p.x, p.y, p.size * 7, p.alpha * 0.3);
      }
      const flicker = 0.5 + Math.sin(time * 12 + i * 7) * 0.5;
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * flicker * 0.8);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * flicker * 0.5);
      ctx.lineWidth = 0.6;
      const armLen = p.size * 2.5;
      ctx.beginPath();
      ctx.moveTo(p.x - armLen, p.y);
      ctx.lineTo(p.x + armLen, p.y);
      ctx.moveTo(p.x, p.y - armLen);
      ctx.lineTo(p.x, p.y + armLen);
      ctx.moveTo(p.x - armLen * 0.7, p.y - armLen * 0.7);
      ctx.lineTo(p.x + armLen * 0.7, p.y + armLen * 0.7);
      ctx.moveTo(p.x + armLen * 0.7, p.y - armLen * 0.7);
      ctx.lineTo(p.x - armLen * 0.7, p.y + armLen * 0.7);
      ctx.stroke();
    } else if (p.type === "sparkle") {
      if (sparkleGlow) {
        drawGlow(ctx, sparkleGlow, p.x, p.y, p.size * 6, p.alpha * 0.45);
      }
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * 0.6);
      ctx.lineWidth = 0.8;
      const arm = p.size * 1.8;
      ctx.beginPath();
      ctx.moveTo(p.x - arm, p.y);
      ctx.lineTo(p.x + arm, p.y);
      ctx.moveTo(p.x, p.y - arm);
      ctx.lineTo(p.x, p.y + arm);
      ctx.stroke();
    } else if (p.type === "gust") {
      if (snowGlow) {
        const trailX = p.x - p.vx * 0.01;
        const trailY = p.y - p.vy * 0.01;
        drawGlow(ctx, snowGlow, trailX, trailY, p.size * 3.5, p.alpha * 0.2);
        drawGlow(ctx, snowGlow, p.x, p.y, p.size * 4, p.alpha * 0.5);
      }
    } else if (p.type === "icedust" && sparkleGlow) {
      const flicker = 0.3 + Math.sin(time * 8 + i * 4.3) * 0.7;
      drawGlow(ctx, sparkleGlow, p.x, p.y, p.size * 4, p.alpha * flicker);
    } else if (snowGlow) {
      drawGlow(ctx, snowGlow, p.x, p.y, p.size * 4, p.alpha * 0.55);
    }
  }

  // Cold mist at bottom – deeper, more layered
  const mistGrad = ctx.createLinearGradient(
    0,
    canvasHeight * 0.5,
    0,
    canvasHeight
  );
  mistGrad.addColorStop(0, "rgba(200,220,255,0)");
  mistGrad.addColorStop(
    0.3,
    `rgba(200,220,255,${(0.06 + Math.sin(time * 0.6) * 0.02).toFixed(4)})`
  );
  mistGrad.addColorStop(
    0.6,
    `rgba(190,210,250,${(0.12 + Math.sin(time * 0.8) * 0.03).toFixed(4)})`
  );
  mistGrad.addColorStop(1, "rgba(180,200,240,0.18)");
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, canvasHeight * 0.45, canvasWidth, canvasHeight * 0.55);

  // Breath-like fog patches – more numerous
  const fogPatchCount = settings.reducedParticles ? 5 : 8;
  for (let i = 0; i < fogPatchCount; i++) {
    const fogX =
      ((canvasWidth * 0.14 * i + time * 10 + Math.sin(time + i) * 55) %
        (canvasWidth + 250)) -
      125;
    const fogY = canvasHeight * (0.65 + Math.sin(time * 0.5 + i) * 0.1);
    const fogSize = 80 + Math.sin(time * 2 + i) * 30;

    const fogGrad = ctx.createRadialGradient(
      fogX,
      fogY,
      0,
      fogX,
      fogY,
      fogSize
    );
    fogGrad.addColorStop(0, "rgba(220,235,255,0.16)");
    fogGrad.addColorStop(0.5, "rgba(200,220,250,0.08)");
    fogGrad.addColorStop(1, "rgba(180,200,240,0)");
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.ellipse(fogX, fogY, fogSize, fogSize * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Animated aurora bands
  if (!settings.reducedParticles) {
    renderAuroraEffect(ctx, canvasWidth, canvasHeight, time, 0.065);
  } else {
    const auroraAlpha = 0.035 + Math.sin(time * 0.3) * 0.012;
    const auroraGrad = ctx.createLinearGradient(
      0,
      0,
      canvasWidth,
      canvasHeight * 0.35
    );
    auroraGrad.addColorStop(0, `rgba(100,255,200,${auroraAlpha.toFixed(4)})`);
    auroraGrad.addColorStop(
      0.3,
      `rgba(100,200,255,${(auroraAlpha * 0.75).toFixed(4)})`
    );
    auroraGrad.addColorStop(
      0.6,
      `rgba(150,100,255,${(auroraAlpha * 0.55).toFixed(4)})`
    );
    auroraGrad.addColorStop(1, "rgba(100,150,255,0)");
    ctx.fillStyle = auroraGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.45);
  }

  // Frost vignette – icy crystals creeping from edges
  if (!settings.reducedParticles) {
    renderFrostVignette(ctx, canvasWidth, canvasHeight, time, 0.12);
  }

  // Cold blue glow at top
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    0,
    180,
    220,
    255,
    0.035 + Math.sin(time * 0.35) * 0.012,
    canvasHeight * 0.4
  );

  // Color grading – cold blue highlights, deep indigo shadows
  renderColorGrade(
    ctx,
    canvasWidth,
    canvasHeight,
    30,
    40,
    80,
    0.04,
    180,
    210,
    255,
    0.02
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 120, 140, 180, 0.7);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.5);
}

// ============================================================================
// VOLCANIC – Magma cracks, pyroclastic smoke, ash lightning, ember storms
// ============================================================================

export function renderVolcanicEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool("volcanic", getAdjustedParticleCount(300));

  // Magma cracks glowing through the ground
  if (!settings.reducedParticles) {
    renderMagmaCracks(ctx, canvasWidth, canvasHeight, time, 0.15);
  }

  // Rising embers – denser, with varied colors
  if (shouldSpawnParticle(0.2)) {
    const colorRoll = Math.random();
    const emberColor =
      colorRoll > 0.6 ? "#ff6600" : colorRoll > 0.3 ? "#ffcc00" : "#ff3300";
    pool.push({
      alpha: 0.6 + Math.random() * 0.3,
      color: emberColor,
      life: 1,
      maxLife: 1,
      size: 2 + Math.random() * 4,
      type: "ember",
      vx: (Math.random() - 0.5) * 12,
      vy: -50 - Math.random() * 70,
      x: Math.random() * canvasWidth,
      y: canvasHeight + 10,
    });
  }

  // Cinder rain – hot ash falling from eruption plumes
  if (shouldSpawnParticle(0.08)) {
    pool.push({
      alpha: 0.3 + Math.random() * 0.2,
      color: Math.random() > 0.5 ? "#8b4513" : "#6b3410",
      life: 1,
      maxLife: 1,
      size: 1.5 + Math.random() * 2.5,
      type: "cinder",
      vx: (Math.random() - 0.5) * 15,
      vy: 25 + Math.random() * 35,
      x: Math.random() * canvasWidth,
      y: -10,
    });
  }

  // Falling ash – more varied
  if (shouldSpawnParticle(0.15)) {
    pool.push({
      alpha: 0.35 + Math.random() * 0.2,
      color: Math.random() > 0.5 ? "#555" : "#444",
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 2,
      type: "ash",
      vx: (Math.random() - 0.5) * 8,
      vy: 18 + Math.random() * 25,
      x: Math.random() * canvasWidth,
      y: -10,
    });
  }

  // Smoke particles rising from ground
  if (shouldSpawnParticle(0.06)) {
    pool.push({
      alpha: 0.08 + Math.random() * 0.06,
      color: "#3a3a3a",
      life: 1,
      maxLife: 1,
      size: 8 + Math.random() * 15,
      type: "smoke",
      vx: (Math.random() - 0.5) * 6,
      vy: -15 - Math.random() * 20,
      x: Math.random() * canvasWidth,
      y: canvasHeight * (0.6 + Math.random() * 0.4),
    });
  }

  // Lava sparks (small, fast, short-lived)
  if (shouldSpawnParticle(0.1)) {
    const sparkX = Math.random() * canvasWidth;
    pool.push({
      alpha: 0.7 + Math.random() * 0.3,
      color: "#ffdd44",
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 1.5,
      type: "spark",
      vx: (Math.random() - 0.5) * 40,
      vy: -30 - Math.random() * 50,
      x: sparkX,
      y: canvasHeight * (0.7 + Math.random() * 0.3),
    });
  }

  // --- Update & render ---
  const volcanicTmpls = getGlowTemplates();
  const emberOrange = volcanicTmpls.get("ember_orange");
  const emberYellow = volcanicTmpls.get("ember_yellow");
  const lavaRedGlow = volcanicTmpls.get("lava_red");
  const ashHotGlow = volcanicTmpls.get("ash_hot");

  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "ember") {
      p.alpha *= 0.993;
      p.size *= 0.997;
      p.x += Math.sin(time * 3 + i * 1.7) * 0.8;
    } else if (p.type === "spark") {
      p.alpha *= 0.97;
      p.vy += 2;
    } else if (p.type === "smoke") {
      p.size += 0.3;
      p.alpha *= 0.992;
      p.x += Math.sin(time * 0.5 + i * 1.3) * 0.5;
    } else if (p.type === "cinder") {
      p.alpha *= 0.995;
      p.x += Math.sin(time * 2 + i * 2.1) * 0.4;
    }

    if (
      p.y < -30 ||
      p.y > canvasHeight + 30 ||
      p.x < -30 ||
      p.x > canvasWidth + 30 ||
      p.alpha < 0.02
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "ember") {
      const tmpl =
        p.color === "#ffcc00"
          ? emberYellow
          : p.color === "#ff3300"
            ? lavaRedGlow
            : emberOrange;
      if (tmpl) {
        const trailX = p.x - p.vx * 0.015;
        const trailY = p.y - p.vy * 0.015;
        const trail2X = p.x - p.vx * 0.03;
        const trail2Y = p.y - p.vy * 0.03;
        drawGlow(ctx, tmpl, trail2X, trail2Y, p.size * 3, p.alpha * 0.1);
        drawGlow(ctx, tmpl, trailX, trailY, p.size * 4, p.alpha * 0.2);
        drawGlow(ctx, tmpl, p.x, p.y, p.size * 5, p.alpha * 0.75);
      }
    } else if (p.type === "spark") {
      if (emberYellow) {
        drawGlow(ctx, emberYellow, p.x, p.y, p.size * 4, p.alpha * 0.6);
      }
    } else if (p.type === "cinder" && ashHotGlow) {
      const hotFade = Math.max(0, p.alpha - 0.2) * 2;
      if (hotFade > 0) {
        drawGlow(ctx, ashHotGlow, p.x, p.y, p.size * 3, hotFade * 0.3);
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 2 + i * 3);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === "smoke") {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, colorWithAlpha(p.color, p.alpha));
      grad.addColorStop(0.5, colorWithAlpha(p.color, p.alpha * 0.4));
      grad.addColorStop(1, colorWithAlpha(p.color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 2.2 + i * 3.7);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Pulsing lava underglow – stronger, layered
  const lavaGlow = ctx.createLinearGradient(
    0,
    canvasHeight * 0.4,
    0,
    canvasHeight
  );
  const glowPulse = 0.18 + Math.sin(time * 3) * 0.06;
  const deepPulse = glowPulse + Math.sin(time * 1.7) * 0.04;
  lavaGlow.addColorStop(0, "rgba(255,100,0,0)");
  lavaGlow.addColorStop(0.3, `rgba(255,80,0,${(glowPulse * 0.3).toFixed(4)})`);
  lavaGlow.addColorStop(0.6, `rgba(255,60,0,${(glowPulse * 0.5).toFixed(4)})`);
  lavaGlow.addColorStop(1, `rgba(255,40,0,${deepPulse.toFixed(4)})`);
  ctx.fillStyle = lavaGlow;
  ctx.fillRect(0, canvasHeight * 0.35, canvasWidth, canvasHeight * 0.65);

  // Red underglow screen glow (pulsing) – multiple sources
  const underglowAlpha = 0.05 + Math.sin(time * 2.5) * 0.02;
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    canvasHeight * 1.1,
    255,
    60,
    20,
    underglowAlpha,
    canvasHeight * 0.7
  );
  renderScreenGlow(
    ctx,
    canvasWidth * 0.2,
    canvasHeight * 0.9,
    255,
    80,
    10,
    underglowAlpha * 0.6,
    canvasHeight * 0.35
  );
  renderScreenGlow(
    ctx,
    canvasWidth * 0.8,
    canvasHeight * 0.85,
    255,
    80,
    10,
    underglowAlpha * 0.6,
    canvasHeight * 0.35
  );

  // Heat distortion waves – stronger, more varied
  const distortionCount = settings.reducedParticles ? 6 : 10;
  for (let i = 0; i < distortionCount; i++) {
    const waveY = canvasHeight * (0.15 + i * 0.08);
    const waveAlpha = 0.04 + Math.sin(time * 0.8 + i * 0.6) * 0.02;
    ctx.strokeStyle = `rgba(255,150,50,${waveAlpha.toFixed(4)})`;
    ctx.lineWidth = 2 + Math.sin(time + i) * 1;
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x += 10) {
      const y =
        waveY +
        Math.sin(x * 0.012 + time * 4 + i * 2) * 14 +
        Math.sin(x * 0.006 + time * 2.5 + i) * 8;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Pyroclastic smoke plumes – more dramatic billowing clouds
  const plumeCount = settings.reducedParticles ? 3 : 5;
  for (let i = 0; i < plumeCount; i++) {
    const smokeX =
      canvasWidth * (0.1 + i * (0.8 / Math.max(1, plumeCount - 1)));
    const smokeBaseY = canvasHeight * 0.3;
    for (let layer = 0; layer < 3; layer++) {
      const smokeY =
        smokeBaseY - layer * 35 - Math.sin(time * 0.5 + i + layer * 0.5) * 25;
      const smokeSize = 100 + layer * 30 + Math.sin(time + i + layer) * 20;
      const smokeAlpha =
        (0.12 - layer * 0.03) * (0.7 + Math.sin(time * 0.3 + i * 1.5) * 0.3);
      const smokeGrad = ctx.createRadialGradient(
        smokeX,
        smokeY,
        0,
        smokeX,
        smokeY,
        smokeSize
      );
      smokeGrad.addColorStop(0, `rgba(70,60,55,${smokeAlpha.toFixed(4)})`);
      smokeGrad.addColorStop(
        0.4,
        `rgba(60,50,45,${(smokeAlpha * 0.6).toFixed(4)})`
      );
      smokeGrad.addColorStop(1, "rgba(40,35,30,0)");
      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.ellipse(
        smokeX,
        smokeY,
        smokeSize,
        smokeSize * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Ash-cloud lightning (rare, dramatic flash)
  const lightningPhase =
    Math.sin(time * 11.3) * Math.sin(time * 7.7) * Math.sin(time * 4.1);
  if (lightningPhase > 0.95 && !settings.reducedParticles) {
    const lx = canvasWidth * (0.2 + Math.random() * 0.6);
    const ly = canvasHeight * 0.15;
    const flash = (lightningPhase - 0.95) * 15;
    ctx.strokeStyle = `rgba(255,220,180,${Math.min(0.6, flash).toFixed(4)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    let cx = lx;
    let cy = ly;
    for (let seg = 0; seg < 5; seg++) {
      cx += (Math.random() - 0.5) * 40;
      cy += 15 + Math.random() * 25;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.fillStyle = `rgba(255,200,100,${(flash * 0.05).toFixed(4)})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Red-tinted atmosphere
  ctx.fillStyle = "rgba(255,50,0,0.035)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Rare volcanic flash
  const flashPhase = Math.sin(time * 7.3) * Math.sin(time * 3.1);
  if (flashPhase > 0.97) {
    ctx.fillStyle = `rgba(255,200,100,${((flashPhase - 0.97) * 1.5).toFixed(4)})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Color grading – deep crimson shadows, hot orange highlights
  renderColorGrade(
    ctx,
    canvasWidth,
    canvasHeight,
    80,
    15,
    5,
    0.05,
    255,
    120,
    40,
    0.03
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 70, 20, 5, 0.75);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.6);
}

// ============================================================================
// SWAMP – Will-o-wisps, bioluminescence, toxic gas, water ripples, deep fog
// ============================================================================

export function renderSwampEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool("swamp", getAdjustedParticleCount(280));

  // Rolling fog banks – more dramatic, denser
  if (!settings.reducedParticles) {
    renderFogBanks(ctx, canvasWidth, canvasHeight, time, 60, 90, 60, 0.1, 6);
  }

  // Bioluminescent ground glow patches – eerie pulsing light
  if (!settings.reducedParticles) {
    renderDappledLight(
      ctx,
      canvasWidth,
      canvasHeight,
      time,
      40,
      180,
      80,
      0.02,
      7
    );
  }

  // Fireflies from edges – more numerous
  if (shouldSpawnParticle(0.09)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      alpha: 0,
      color: "#aaffaa",
      life: 1,
      maxLife: 1,
      size: 2.5 + Math.random() * 2.5,
      type: "firefly",
      vx: spawn.vx * 0.5,
      vy: spawn.vy * 0.35,
      x: spawn.x,
      y: spawn.y,
    });
  }

  // Will-o-wisps – larger ghostly lights that drift with trailing glow
  if (shouldSpawnParticle(0.012)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    const wispColors = ["#66ffaa", "#44ccff", "#aaffcc"];
    pool.push({
      alpha: 0.35 + Math.random() * 0.2,
      color: wispColors[Math.floor(Math.random() * wispColors.length)],
      life: 1,
      maxLife: 1,
      size: 5 + Math.random() * 5,
      type: "wisp",
      vx: spawn.vx * 0.3,
      vy: spawn.vy * 0.2,
      x: spawn.x,
      y: spawn.y,
    });
  }

  // Bubbles (favor bottom)
  if (shouldSpawnParticle(0.1)) {
    const fromBottom = Math.random() > 0.4;
    if (fromBottom) {
      pool.push({
        alpha: 0.45,
        color: "#4a7055",
        life: 1,
        maxLife: 1,
        size: 2.5 + Math.random() * 5,
        type: "bubble",
        vx: (Math.random() - 0.5) * 12,
        vy: -18 - Math.random() * 25,
        x: Math.random() * canvasWidth,
        y: canvasHeight + 10,
      });
    } else {
      const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
      pool.push({
        alpha: 0.35,
        color: "#4a7055",
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 4,
        type: "bubble",
        vx: spawn.vx * 0.35,
        vy: spawn.vy * 0.55,
        x: spawn.x,
        y: spawn.y,
      });
    }
  }

  // Toxic gas puffs – slowly rising green clouds
  if (shouldSpawnParticle(0.04)) {
    pool.push({
      alpha: 0.06 + Math.random() * 0.04,
      color: "#5a8a40",
      life: 1,
      maxLife: 1,
      size: 10 + Math.random() * 20,
      type: "toxicgas",
      vx: (Math.random() - 0.5) * 4,
      vy: -5 - Math.random() * 8,
      x: Math.random() * canvasWidth,
      y: canvasHeight * (0.6 + Math.random() * 0.4),
    });
  }

  // Spores from edges
  if (shouldSpawnParticle(0.09)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      alpha: 0.5,
      color: "#88cc88",
      life: 1,
      maxLife: 1,
      size: 1.5 + Math.random() * 2.5,
      type: "spore",
      vx: spawn.vx * 0.45,
      vy: spawn.vy * 0.45,
      x: spawn.x,
      y: spawn.y,
    });
  }

  // Water ripple rings – expand and fade at random bottom-half positions
  if (shouldSpawnParticle(0.03)) {
    pool.push({
      alpha: 0.2 + Math.random() * 0.1,
      color: "#6a9a7a",
      life: 1,
      maxLife: 1,
      size: 2,
      type: "ripple",
      vx: 0,
      vy: 0,
      x: Math.random() * canvasWidth,
      y: canvasHeight * (0.5 + Math.random() * 0.45),
    });
  }

  // Hanging moss particles – drift down from top
  if (shouldSpawnParticle(0.05)) {
    pool.push({
      alpha: 0.08 + Math.random() * 0.06,
      color: "#5a7a5a",
      life: 1,
      maxLife: 1,
      size: 1.5 + Math.random() * 2,
      type: "moss",
      vx: (Math.random() - 0.5) * 8,
      vy: 8 + Math.random() * 12,
      x: Math.random() * canvasWidth,
      y: -10,
    });
  }

  // Dripping particles – small drops falling from above
  if (shouldSpawnParticle(0.06)) {
    pool.push({
      alpha: 0.2 + Math.random() * 0.15,
      color: "#7aaa8a",
      life: 1,
      maxLife: 1,
      size: 1 + Math.random() * 1.5,
      type: "drip",
      vx: (Math.random() - 0.5) * 2,
      vy: 40 + Math.random() * 50,
      x: Math.random() * canvasWidth,
      y: -5,
    });
  }

  // --- Update & render ---
  const swampTmpls = getGlowTemplates();
  const fireflyGlow = swampTmpls.get("firefly");
  const sporeGlow = swampTmpls.get("spore");
  const wispGreenGlow = swampTmpls.get("wisp_green");
  const wispBlueGlow = swampTmpls.get("wisp_blue");
  const toxicGlow = swampTmpls.get("toxic");
  const biolumGlow = swampTmpls.get("biolum");

  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "firefly") {
      p.alpha = 0.2 + Math.sin(time * 5 + i * 3) * 0.3;
      p.vx += (Math.random() - 0.5) * 6;
      p.vy += (Math.random() - 0.5) * 6;
      p.vx *= 0.94;
      p.vy *= 0.94;
    } else if (p.type === "wisp") {
      const wispPhase = time * 0.8 + i * 2.7;
      p.vx += Math.sin(wispPhase) * 0.8;
      p.vy += Math.cos(wispPhase * 0.7) * 0.5;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.alpha *= 0.998;
    } else if (p.type === "bubble") {
      p.x += Math.sin(time * 3 + i) * 0.6;
      p.alpha *= 0.992;
    } else if (p.type === "spore") {
      p.x += Math.sin(time * 2 + i * 0.7) * 1.2;
      p.alpha *= 0.994;
    } else if (p.type === "moss") {
      p.x += Math.sin(time * 0.8 + i * 1.1) * 0.5;
      p.alpha *= 0.998;
    } else if (p.type === "toxicgas") {
      p.size += 0.2;
      p.alpha *= 0.993;
      p.x += Math.sin(time * 0.4 + i * 1.5) * 0.4;
    } else if (p.type === "ripple") {
      p.size += 0.6;
      p.alpha *= 0.98;
    } else if (p.type === "drip") {
      p.alpha *= 0.99;
    }

    if (
      p.y < -20 ||
      p.y > canvasHeight + 20 ||
      p.alpha < 0.02 ||
      p.x < -20 ||
      p.x > canvasWidth + 20
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "firefly") {
      if (p.alpha > 0.1 && fireflyGlow) {
        drawGlow(ctx, fireflyGlow, p.x, p.y, p.size * 8, p.alpha * 0.6);
      }
    } else if (p.type === "wisp") {
      const tmpl = p.color === "#44ccff" ? wispBlueGlow : wispGreenGlow;
      if (tmpl) {
        const trail1X = p.x - p.vx * 0.08;
        const trail1Y = p.y - p.vy * 0.08;
        const trail2X = p.x - p.vx * 0.18;
        const trail2Y = p.y - p.vy * 0.18;
        drawGlow(ctx, tmpl, trail2X, trail2Y, p.size * 6, p.alpha * 0.1);
        drawGlow(ctx, tmpl, trail1X, trail1Y, p.size * 8, p.alpha * 0.2);
        drawGlow(ctx, tmpl, p.x, p.y, p.size * 10, p.alpha * 0.5);
      }
      const pulse = 0.5 + Math.sin(time * 3 + i * 2.1) * 0.5;
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * pulse * 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "bubble") {
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * 0.8);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.12);
      ctx.fill();
      ctx.fillStyle = colorWithAlpha("#ffffff", p.alpha * 0.5);
      ctx.beginPath();
      ctx.ellipse(
        p.x - p.size * 0.28,
        p.y - p.size * 0.28,
        p.size * 0.3,
        p.size * 0.2,
        -0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (p.type === "toxicgas") {
      if (toxicGlow) {
        drawGlow(ctx, toxicGlow, p.x, p.y, p.size * 2, p.alpha * 0.4);
      }
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, colorWithAlpha(p.color, p.alpha));
      grad.addColorStop(0.5, colorWithAlpha(p.color, p.alpha * 0.4));
      grad.addColorStop(1, colorWithAlpha(p.color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "ripple") {
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * ISO_Y_RATIO, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (p.size > 8) {
        ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * 0.5);
        ctx.beginPath();
        ctx.ellipse(
          p.x,
          p.y,
          p.size * 0.6,
          p.size * 0.6 * ISO_Y_RATIO,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    } else if (p.type === "drip") {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * 0.5, p.size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "spore" && sporeGlow) {
      drawGlow(ctx, sporeGlow, p.x, p.y, p.size * 4, p.alpha * 0.55);
    } else if (p.type === "moss") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 0.3 + i * 1.4);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.4, p.size * 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Bioluminescent ground glow spots
  if (!settings.reducedParticles && biolumGlow) {
    const bioCount = 5;
    for (let i = 0; i < bioCount; i++) {
      const bx =
        (canvasWidth * 0.15 +
          i * canvasWidth * 0.17 +
          Math.sin(time * 0.2 + i * 1.9) * 30) %
        canvasWidth;
      const by = canvasHeight * (0.55 + Math.sin(time * 0.15 + i * 2.3) * 0.15);
      const pulse = 0.3 + Math.sin(time * 0.6 + i * 1.7) * 0.7;
      drawGlow(ctx, biolumGlow, bx, by, 50 + pulse * 30, 0.04 * pulse);
    }
  }

  // Layered fog – more layers, better depth
  const fogLayerCount = settings.reducedParticles ? 4 : 7;
  for (let layer = 0; layer < fogLayerCount; layer++) {
    const fogY = canvasHeight * (0.35 + layer * 0.09);
    const fogAlpha = 0.1 - layer * 0.012;
    const drift = Math.sin(time * 0.3 + layer * 0.8) * 40;

    const fogGrad = ctx.createLinearGradient(0, fogY - 100, 0, fogY + 100);
    fogGrad.addColorStop(0, "rgba(60,80,60,0)");
    fogGrad.addColorStop(0.5, `rgba(70,100,70,${fogAlpha.toFixed(4)})`);
    fogGrad.addColorStop(1, "rgba(60,80,60,0)");
    ctx.fillStyle = fogGrad;

    ctx.beginPath();
    ctx.moveTo(-50, fogY + 100);
    for (let x = 0; x <= canvasWidth + 50; x += 30) {
      const y =
        fogY +
        Math.sin(x * 0.012 + time * 0.5 + layer * 2 + drift * 0.01) * 35 +
        Math.sin(x * 0.006 + time * 0.3 + layer * 1.3) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvasWidth + 50, fogY + 100);
    ctx.closePath();
    ctx.fill();
  }

  // Eerie green tint
  ctx.fillStyle = "rgba(50,100,50,0.05)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Mist patches – larger, more numerous
  const mistCount = settings.reducedParticles ? 5 : 9;
  for (let i = 0; i < mistCount; i++) {
    const mistX =
      ((canvasWidth * 0.12 * i + time * 5 + Math.sin(time * 0.3 + i) * 50) %
        (canvasWidth + 300)) -
      150;
    const mistY = canvasHeight * (0.45 + Math.sin(time * 0.4 + i * 0.7) * 0.15);
    const mistSize = 85 + Math.sin(time + i * 2) * 30;

    const mistGrad = ctx.createRadialGradient(
      mistX,
      mistY,
      0,
      mistX,
      mistY,
      mistSize
    );
    mistGrad.addColorStop(0, "rgba(100,150,100,0.2)");
    mistGrad.addColorStop(0.4, "rgba(80,130,80,0.1)");
    mistGrad.addColorStop(0.7, "rgba(70,120,70,0.04)");
    mistGrad.addColorStop(1, "rgba(60,100,60,0)");
    ctx.fillStyle = mistGrad;
    ctx.beginPath();
    ctx.ellipse(
      mistX,
      mistY,
      mistSize,
      mistSize * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Eerie green underglow – pulsing
  const swampGlowAlpha = 0.04 + Math.sin(time * 0.3) * 0.015;
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    canvasHeight * 1.05,
    50,
    120,
    50,
    swampGlowAlpha,
    canvasHeight * 0.55
  );

  // Secondary glow spots from "below the water"
  renderScreenGlow(
    ctx,
    canvasWidth * 0.25,
    canvasHeight * 0.8,
    40,
    150,
    60,
    0.015 + Math.sin(time * 0.5 + 1) * 0.008,
    canvasHeight * 0.25
  );
  renderScreenGlow(
    ctx,
    canvasWidth * 0.75,
    canvasHeight * 0.75,
    40,
    150,
    60,
    0.015 + Math.sin(time * 0.5 + 2.5) * 0.008,
    canvasHeight * 0.25
  );

  // Color grading – murky green shadows, sickly yellow-green highlights
  renderColorGrade(
    ctx,
    canvasWidth,
    canvasHeight,
    20,
    40,
    20,
    0.05,
    100,
    130,
    60,
    0.02
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 30, 50, 30, 0.75);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.6);
}

// ============================================================================
// MAIN ENVIRONMENT RENDERER
// ============================================================================

export function renderEnvironment(
  ctx: CanvasRenderingContext2D,
  theme: string,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  if (!shouldRenderEnvironment()) {
    return;
  }

  ctx.save();

  switch (theme) {
    case "grassland": {
      renderGrasslandEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    }
    case "desert": {
      renderDesertEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    }
    case "winter": {
      renderWinterEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    }
    case "volcanic": {
      renderVolcanicEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    }
    case "swamp": {
      renderSwampEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    }
    default: {
      renderGrasslandEnvironment(ctx, canvasWidth, canvasHeight, time);
    }
  }

  ctx.restore();
}

// ============================================================================
// AMBIENT SOUND VISUALIZATION (Visual representation of atmosphere)
// ============================================================================

export function renderAmbientVisuals(
  ctx: CanvasRenderingContext2D,
  theme: string,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  ctx.save();

  // Circular vignette
  const diagonal = Math.sqrt(
    canvasWidth * canvasWidth + canvasHeight * canvasHeight
  );
  const vignetteGrad = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    Math.min(canvasWidth, canvasHeight) * 0.08,
    canvasWidth / 2,
    canvasHeight / 2,
    diagonal * 0.55
  );
  vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
  vignetteGrad.addColorStop(0.35, "rgba(0,0,0,0.04)");
  vignetteGrad.addColorStop(0.6, "rgba(0,0,0,0.12)");
  vignetteGrad.addColorStop(0.8, "rgba(0,0,0,0.22)");
  vignetteGrad.addColorStop(1, "rgba(0,0,0,0.32)");
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Theme-specific color wash
  let washColor = "rgba(0,0,0,0)";
  switch (theme) {
    case "grassland": {
      washColor = `rgba(80,130,60,${(0.03 + Math.sin(time * 0.5) * 0.012).toFixed(4)})`;
      break;
    }
    case "desert": {
      washColor = `rgba(200,150,100,${(0.04 + Math.sin(time * 0.3) * 0.015).toFixed(4)})`;
      break;
    }
    case "winter": {
      washColor = `rgba(150,180,220,${(0.045 + Math.sin(time * 0.4) * 0.018).toFixed(4)})`;
      break;
    }
    case "volcanic": {
      washColor = `rgba(200,80,50,${(0.05 + Math.sin(time * 0.6) * 0.02).toFixed(4)})`;
      break;
    }
    case "swamp": {
      washColor = `rgba(60,100,60,${(0.055 + Math.sin(time * 0.35) * 0.02).toFixed(4)})`;
      break;
    }
  }
  ctx.fillStyle = washColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.restore();
}
