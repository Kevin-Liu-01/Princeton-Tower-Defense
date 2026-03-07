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

import { colorWithAlpha } from "../helpers";
import { ISO_Y_RATIO } from "../../constants";
import {
  setShadowBlur,
  clearShadow,
  shouldRenderEnvironment,
  shouldSpawnParticle,
  getAdjustedParticleCount,
  getPerformanceSettings,
} from "../performance";
import {
  renderGodRays,
  renderFogBanks,
  renderAuroraEffect,
  renderScreenGlow,
} from "../effects/atmospheric";

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

const particlePools: Map<string, EnvironmentParticle[]> = new Map();

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
  grad.addColorStop(
    1,
    `rgba(${r},${g},${b},${baseAlpha.toFixed(3)})`
  );

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
    case 0:
      return {
        x: Math.random() * canvasWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 30,
        vy: 20 + Math.random() * 30,
        edge: "top",
      };
    case 1:
      return {
        x: Math.random() * canvasWidth,
        y: canvasHeight + 10,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 30,
        edge: "bottom",
      };
    case 2:
      return {
        x: -10,
        y: Math.random() * canvasHeight,
        vx: 20 + Math.random() * 30,
        vy: (Math.random() - 0.5) * 30,
        edge: "left",
      };
    case 3:
    default:
      return {
        x: canvasWidth + 10,
        y: Math.random() * canvasHeight,
        vx: -20 - Math.random() * 30,
        vy: (Math.random() - 0.5) * 30,
        edge: "right",
      };
  }
}

// ============================================================================
// GRASSLAND – Gentle wind, floating pollen, butterflies, god rays, leaves
// ============================================================================

const LEAF_COLORS = ["#5a8a4a", "#4a7a3a", "#6a9a5a", "#8aaa6a"];
const BUTTERFLY_COLORS = ["#ff88cc", "#88ccff", "#ffcc44", "#ff8844"];

export function renderGrasslandEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool(
    "grassland",
    getAdjustedParticleCount(180)
  );

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
      0.035,
      5
    );
  }

  // Pollen / seeds from edges
  if (shouldSpawnParticle(0.12)) {
    const spawnY = Math.random() * canvasHeight;
    const spawnX = Math.random() > 0.5 ? -10 : canvasWidth + 10;
    const windDir = spawnX < 0 ? 1 : -1;
    pool.push({
      x: spawnX,
      y: spawnY,
      vx: windDir * (35 + Math.random() * 45),
      vy: (Math.random() - 0.5) * 25,
      size: 2 + Math.random() * 3,
      alpha: 0.08 + Math.random() * 0.12,
      life: 1,
      maxLife: 1,
      color: Math.random() > 0.5 ? "#ffffff" : "#ffffcc",
      type: "pollen",
    });
  }

  // Drifting leaves
  if (shouldSpawnParticle(0.06)) {
    pool.push({
      x: Math.random() * canvasWidth,
      y: -10,
      vx: 15 + Math.random() * 25,
      vy: 12 + Math.random() * 20,
      size: 3 + Math.random() * 3,
      alpha: 0.06 + Math.random() * 0.08,
      life: 1,
      maxLife: 1,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      type: "leaf",
    });
  }

  // Butterflies (rare)
  if (shouldSpawnParticle(0.005)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 1.2,
      vy: spawn.vy * 0.5,
      size: 8 + Math.random() * 4,
      alpha: 0.5,
      life: 1,
      maxLife: 1,
      color:
        BUTTERFLY_COLORS[
          Math.floor(Math.random() * BUTTERFLY_COLORS.length)
        ],
      type: "butterfly",
    });
  }

  // --- Update & render (swap-and-pop removal) ---
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
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 0.5 + i * 2);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.3);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Warm center glow
  const glowAlpha = 0.025 + Math.sin(time * 0.4) * 0.01;
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    canvasHeight * 0.4,
    255,
    240,
    200,
    glowAlpha,
    Math.min(canvasWidth, canvasHeight) * 0.45
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 50, 70, 40, 0.65);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.55);
}

// ============================================================================
// DESERT – Heat shimmer, sand particles, dust devils, sun corona, streaks
// ============================================================================

export function renderDesertEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool(
    "desert",
    getAdjustedParticleCount(220)
  );

  // Sun corona glow from above
  const coronaAlpha = 0.06 + Math.sin(time * 0.5) * 0.02;
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    -canvasHeight * 0.08,
    255,
    240,
    200,
    coronaAlpha,
    canvasWidth * 0.5
  );

  // God rays from upper-center – harsh desert sun
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
      0.03,
      6
    );
  }

  // Sand particles blown by wind – full screen coverage
  if (shouldSpawnParticle(0.18)) {
    const spawnY = Math.random() * canvasHeight;
    pool.push({
      x: -10,
      y: spawnY,
      vx: 50 + Math.random() * 70,
      vy: (Math.random() - 0.5) * 35,
      size: 1 + Math.random() * 2.5,
      alpha: 0.45 + Math.random() * 0.3,
      life: 1,
      maxLife: 1,
      color: Math.random() > 0.3 ? "#d4a574" : "#c4956a",
      type: "sand",
    });
  }

  // Sand from top/bottom for vertical spread
  if (shouldSpawnParticle(0.08)) {
    const fromTop = Math.random() > 0.5;
    pool.push({
      x: Math.random() * canvasWidth,
      y: fromTop ? -10 : canvasHeight + 10,
      vx: 30 + Math.random() * 40,
      vy: fromTop
        ? 20 + Math.random() * 30
        : -20 - Math.random() * 30,
      size: 1 + Math.random() * 2,
      alpha: 0.35 + Math.random() * 0.25,
      life: 1,
      maxLife: 1,
      color: "#d4a574",
      type: "sand",
    });
  }

  // Sand streaks – thin elongated particles for wind lines
  if (shouldSpawnParticle(0.07)) {
    pool.push({
      x: -20,
      y: Math.random() * canvasHeight,
      vx: 90 + Math.random() * 60,
      vy: (Math.random() - 0.5) * 15,
      size: 1.5 + Math.random() * 2,
      alpha: 0.15 + Math.random() * 0.12,
      life: 1,
      maxLife: 1,
      color: "#c4a080",
      type: "streak",
    });
  }

  // Dust devils (rare)
  if (shouldSpawnParticle(0.004)) {
    const devilX = Math.random() * canvasWidth;
    const devilY =
      canvasHeight * 0.5 + Math.random() * canvasHeight * 0.5;
    const burstCount = settings.reducedParticles ? 12 : 25;
    for (let j = 0; j < burstCount; j++) {
      pool.push({
        x: devilX + (Math.random() - 0.5) * 40,
        y: devilY - j * 4,
        vx: (Math.random() - 0.5) * 50,
        vy: -40 - Math.random() * 60,
        size: 2 + Math.random() * 5,
        alpha: 0.5,
        life: 1,
        maxLife: 1,
        color: "#c4a080",
        type: "dustdevil",
      });
    }
  }

  // --- Update & render ---
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
    } else {
      p.y += Math.sin(time * 3 + i * 0.3 + p.x * 0.01) * 0.5;
    }

    if (
      p.x > canvasWidth + 20 ||
      p.x < -20 ||
      p.y < -20 ||
      p.y > canvasHeight + 20 ||
      p.alpha < 0.05
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "streak") {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.ellipse(
        p.x,
        p.y,
        p.size * 5,
        p.size * 0.25,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Heat shimmer gradient
  const shimmerGrad = ctx.createLinearGradient(
    0,
    canvasHeight * 0.3,
    0,
    canvasHeight
  );
  shimmerGrad.addColorStop(0, "rgba(255,200,150,0)");
  shimmerGrad.addColorStop(
    0.4,
    `rgba(255,220,180,${(0.04 + Math.sin(time * 2) * 0.015).toFixed(4)})`
  );
  shimmerGrad.addColorStop(1, "rgba(255,200,150,0)");
  ctx.fillStyle = shimmerGrad;
  ctx.fillRect(0, canvasHeight * 0.3, canvasWidth, canvasHeight * 0.7);

  // Heat wave lines across full screen
  ctx.strokeStyle = "rgba(255,220,180,0.06)";
  ctx.lineWidth = 2;
  const waveCount = settings.reducedParticles ? 5 : 8;
  for (let i = 0; i < waveCount; i++) {
    const waveY = canvasHeight * (0.15 + i * 0.1);
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x += 15) {
      const y =
        waveY + Math.sin(x * 0.015 + time * 3 + i * 1.5) * 10;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Mirage shimmer at horizon
  const mirageAlpha = 0.08 + Math.sin(time * 1.5) * 0.03;
  ctx.fillStyle = `rgba(135,206,250,${mirageAlpha.toFixed(4)})`;
  ctx.beginPath();
  for (let x = 0; x < canvasWidth; x += 25) {
    const y = canvasHeight * 0.7 + Math.sin(x * 0.025 + time * 2) * 6;
    ctx.ellipse(x, y, 50, 6, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Sand haze – full-screen low-alpha overlay for atmosphere
  ctx.fillStyle = `rgba(210,180,140,${(0.02 + Math.sin(time * 0.6) * 0.008).toFixed(4)})`;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 120, 90, 50, 0.65);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.55);
}

// ============================================================================
// WINTER – Falling snow, ice sparkles, cold mist, animated aurora, gusts
// ============================================================================

export function renderWinterEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool(
    "winter",
    getAdjustedParticleCount(220)
  );

  // Snowflakes with wind
  if (shouldSpawnParticle(0.28)) {
    pool.push({
      x: Math.random() * (canvasWidth + 150) - 75,
      y: -10,
      vx: -20 + Math.random() * 15,
      vy: 35 + Math.random() * 45,
      size: 2 + Math.random() * 4,
      alpha: 0.3 + Math.random() * 0.25,
      life: 1,
      maxLife: 1,
      color: "#ffffff",
      type: Math.random() > 0.88 ? "crystal" : "snow",
    });
  }

  // Ice sparkles from edges
  if (shouldSpawnParticle(0.06)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 0.7,
      vy: spawn.vy * 0.7,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.45,
      life: 1,
      maxLife: 1,
      color: "#aaddff",
      type: "sparkle",
    });
  }

  // Periodic wind gusts – horizontal snow bursts
  const gustPhase = Math.sin(time * 0.4);
  if (gustPhase > 0.92 && shouldSpawnParticle(0.5)) {
    const burstCount = settings.reducedParticles ? 3 : 5;
    for (let j = 0; j < burstCount; j++) {
      pool.push({
        x: -10,
        y: Math.random() * canvasHeight,
        vx: 100 + Math.random() * 80,
        vy: (Math.random() - 0.5) * 20,
        size: 2 + Math.random() * 3,
        alpha: 0.25 + Math.random() * 0.15,
        life: 1,
        maxLife: 1,
        color: "#ffffff",
        type: "gust",
      });
    }
  }

  // --- Update & render ---
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "snow" || p.type === "crystal") {
      p.x += Math.sin(time * 2 + i * 0.3 + p.y * 0.008) * 1.0;
    } else if (p.type === "sparkle") {
      p.alpha *= 0.97;
    } else if (p.type === "gust") {
      p.alpha *= 0.985;
      p.y += Math.sin(time * 4 + i * 0.5) * 0.8;
    }

    if (
      p.y > canvasHeight + 10 ||
      p.y < -20 ||
      p.x < -30 ||
      p.x > canvasWidth + 30 ||
      p.alpha < 0.05
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "crystal") {
      ctx.save();
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * 0.6);
      ctx.lineWidth = 1.5;
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 0.5 + i);
      for (let j = 0; j < 6; j++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -p.size);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
      ctx.restore();
    } else if (p.type === "sparkle") {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.55);
      setShadowBlur(ctx, 4, p.color);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      clearShadow(ctx);
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cold mist at bottom
  const mistGrad = ctx.createLinearGradient(
    0,
    canvasHeight * 0.6,
    0,
    canvasHeight
  );
  mistGrad.addColorStop(0, "rgba(200,220,255,0)");
  mistGrad.addColorStop(
    0.5,
    `rgba(200,220,255,${(0.1 + Math.sin(time * 0.8) * 0.03).toFixed(4)})`
  );
  mistGrad.addColorStop(1, "rgba(180,200,240,0.15)");
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, canvasHeight * 0.5, canvasWidth, canvasHeight * 0.5);

  // Breath-like fog patches
  const fogPatchCount = settings.reducedParticles ? 4 : 6;
  for (let i = 0; i < fogPatchCount; i++) {
    const fogX =
      (canvasWidth * 0.18 * i +
        time * 12 +
        Math.sin(time + i) * 60) %
        (canvasWidth + 250) -
      125;
    const fogY =
      canvasHeight * (0.7 + Math.sin(time * 0.5 + i) * 0.08);
    const fogSize = 90 + Math.sin(time * 2 + i) * 25;

    const fogGrad = ctx.createRadialGradient(
      fogX,
      fogY,
      0,
      fogX,
      fogY,
      fogSize
    );
    fogGrad.addColorStop(0, "rgba(220,235,255,0.14)");
    fogGrad.addColorStop(0.5, "rgba(200,220,250,0.07)");
    fogGrad.addColorStop(1, "rgba(180,200,240,0)");
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.ellipse(fogX, fogY, fogSize, fogSize * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Animated aurora bands (replaces old simple gradient)
  if (!settings.reducedParticles) {
    renderAuroraEffect(ctx, canvasWidth, canvasHeight, time, 0.055);
  } else {
    // Fallback: simple aurora gradient
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

  // Cold blue glow at top
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    0,
    180,
    220,
    255,
    0.03 + Math.sin(time * 0.35) * 0.01,
    canvasHeight * 0.35
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 120, 140, 180, 0.65);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.55);
}

// ============================================================================
// VOLCANIC – Embers, ash, heat distortion, lava glow, pulsing underglow
// ============================================================================

export function renderVolcanicEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool(
    "volcanic",
    getAdjustedParticleCount(200)
  );

  // Rising embers
  if (shouldSpawnParticle(0.15)) {
    pool.push({
      x: Math.random() * canvasWidth,
      y: canvasHeight + 10,
      vx: (Math.random() - 0.5) * 8,
      vy: -50 - Math.random() * 60,
      size: 2 + Math.random() * 4,
      alpha: 0.6 + Math.random() * 0.25,
      life: 1,
      maxLife: 1,
      color: Math.random() > 0.3 ? "#ff6600" : "#ffcc00",
      type: "ember",
    });
  }

  // Falling ash
  if (shouldSpawnParticle(0.12)) {
    pool.push({
      x: Math.random() * canvasWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 5,
      vy: 18 + Math.random() * 25,
      size: 1 + Math.random() * 2,
      alpha: 0.35 + Math.random() * 0.2,
      life: 1,
      maxLife: 1,
      color: "#555",
      type: "ash",
    });
  }

  // --- Update & render ---
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "ember") {
      p.alpha *= 0.994;
      p.size *= 0.997;
    }

    if (
      p.y < -20 ||
      p.y > canvasHeight + 20 ||
      p.x < -20 ||
      p.x > canvasWidth + 20 ||
      p.alpha < 0.05
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "ember") {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      setShadowBlur(ctx, 10, p.color);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      clearShadow(ctx);
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Pulsing lava underglow
  const lavaGlow = ctx.createLinearGradient(
    0,
    canvasHeight * 0.5,
    0,
    canvasHeight
  );
  const glowPulse = 0.15 + Math.sin(time * 3) * 0.05;
  const deepPulse =
    glowPulse + Math.sin(time * 1.7) * 0.03;
  lavaGlow.addColorStop(0, "rgba(255,100,0,0)");
  lavaGlow.addColorStop(
    0.4,
    `rgba(255,80,0,${(glowPulse * 0.4).toFixed(4)})`
  );
  lavaGlow.addColorStop(
    1,
    `rgba(255,50,0,${deepPulse.toFixed(4)})`
  );
  ctx.fillStyle = lavaGlow;
  ctx.fillRect(0, canvasHeight * 0.4, canvasWidth, canvasHeight * 0.6);

  // Red underglow screen glow (pulsing)
  const underglowAlpha = 0.04 + Math.sin(time * 2.5) * 0.02;
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

  // Heat distortion waves
  ctx.strokeStyle = "rgba(255,150,50,0.055)";
  ctx.lineWidth = 3;
  const distortionCount = settings.reducedParticles ? 5 : 8;
  for (let i = 0; i < distortionCount; i++) {
    const waveY = canvasHeight * (0.2 + i * 0.1);
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x += 12) {
      const y =
        waveY + Math.sin(x * 0.012 + time * 4 + i * 2) * 14;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Smoke plumes
  const plumeCount = settings.reducedParticles ? 2 : 4;
  for (let i = 0; i < plumeCount; i++) {
    const smokeX = canvasWidth * (0.15 + i * (0.7 / Math.max(1, plumeCount - 1)));
    const smokeY =
      canvasHeight * 0.35 - Math.sin(time * 0.5 + i) * 35;
    const smokeGrad = ctx.createRadialGradient(
      smokeX,
      smokeY,
      0,
      smokeX,
      smokeY,
      120
    );
    smokeGrad.addColorStop(0, "rgba(80,80,80,0.14)");
    smokeGrad.addColorStop(0.5, "rgba(60,60,60,0.07)");
    smokeGrad.addColorStop(1, "rgba(40,40,40,0)");
    ctx.fillStyle = smokeGrad;
    ctx.beginPath();
    ctx.ellipse(
      smokeX,
      smokeY,
      120 + Math.sin(time + i) * 25,
      70,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Red-tinted atmosphere
  ctx.fillStyle = "rgba(255,50,0,0.03)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Rare volcanic flash (brief bright flicker)
  const flashPhase = Math.sin(time * 7.3) * Math.sin(time * 3.1);
  if (flashPhase > 0.97) {
    ctx.fillStyle = `rgba(255,200,100,${((flashPhase - 0.97) * 1.5).toFixed(4)})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 70, 20, 5, 0.7);
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.6);
}

// ============================================================================
// SWAMP – Fog layers, fireflies, bubbles, mist, fog banks, moss
// ============================================================================

export function renderSwampEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const settings = getPerformanceSettings();
  const pool = getParticlePool(
    "swamp",
    getAdjustedParticleCount(180)
  );

  // Rolling fog banks – large slow-drifting formations
  if (!settings.reducedParticles) {
    renderFogBanks(
      ctx,
      canvasWidth,
      canvasHeight,
      time,
      60,
      90,
      60,
      0.08,
      4
    );
  }

  // Fireflies from edges
  if (shouldSpawnParticle(0.07)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 0.5,
      vy: spawn.vy * 0.35,
      size: 2.5 + Math.random() * 2.5,
      alpha: 0,
      life: 1,
      maxLife: 1,
      color: "#aaffaa",
      type: "firefly",
    });
  }

  // Bubbles (favor bottom)
  if (shouldSpawnParticle(0.09)) {
    const fromBottom = Math.random() > 0.4;
    if (fromBottom) {
      pool.push({
        x: Math.random() * canvasWidth,
        y: canvasHeight + 10,
        vx: (Math.random() - 0.5) * 12,
        vy: -18 - Math.random() * 25,
        size: 2.5 + Math.random() * 5,
        alpha: 0.45,
        life: 1,
        maxLife: 1,
        color: "#4a7055",
        type: "bubble",
      });
    } else {
      const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
      pool.push({
        x: spawn.x,
        y: spawn.y,
        vx: spawn.vx * 0.35,
        vy: spawn.vy * 0.55,
        size: 2 + Math.random() * 4,
        alpha: 0.35,
        life: 1,
        maxLife: 1,
        color: "#4a7055",
        type: "bubble",
      });
    }
  }

  // Spores from edges
  if (shouldSpawnParticle(0.08)) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 0.45,
      vy: spawn.vy * 0.45,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.5,
      life: 1,
      maxLife: 1,
      color: "#88cc88",
      type: "spore",
    });
  }

  // Hanging moss particles – drift down from top
  if (shouldSpawnParticle(0.04)) {
    pool.push({
      x: Math.random() * canvasWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: 8 + Math.random() * 12,
      size: 1.5 + Math.random() * 2,
      alpha: 0.08 + Math.random() * 0.06,
      life: 1,
      maxLife: 1,
      color: "#5a7a5a",
      type: "moss",
    });
  }

  // --- Update & render ---
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
    } else if (p.type === "bubble") {
      p.x += Math.sin(time * 3 + i) * 0.6;
      p.alpha *= 0.992;
    } else if (p.type === "spore") {
      p.x += Math.sin(time * 2 + i * 0.7) * 1.2;
      p.alpha *= 0.994;
    } else if (p.type === "moss") {
      p.x += Math.sin(time * 0.8 + i * 1.1) * 0.5;
      p.alpha *= 0.998;
    }

    if (
      p.y < -20 ||
      p.y > canvasHeight + 20 ||
      p.alpha < 0.05 ||
      p.x < -20 ||
      p.x > canvasWidth + 20
    ) {
      pool[i] = pool[pool.length - 1];
      pool.pop();
      continue;
    }

    if (p.type === "firefly") {
      if (p.alpha > 0.15) {
        ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.7);
        setShadowBlur(ctx, 10, p.color);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        clearShadow(ctx);
      }
    } else if (p.type === "bubble") {
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = colorWithAlpha("#ffffff", p.alpha * 0.45);
      ctx.beginPath();
      ctx.arc(
        p.x - p.size * 0.3,
        p.y - p.size * 0.3,
        p.size * 0.35,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Layered fog
  const fogLayerCount = settings.reducedParticles ? 3 : 5;
  for (let layer = 0; layer < fogLayerCount; layer++) {
    const fogY = canvasHeight * (0.4 + layer * 0.12);
    const fogAlpha = 0.09 - layer * 0.015;
    const drift = Math.sin(time * 0.3 + layer) * 35;

    const fogGrad = ctx.createLinearGradient(
      0,
      fogY - 90,
      0,
      fogY + 90
    );
    fogGrad.addColorStop(0, "rgba(60,80,60,0)");
    fogGrad.addColorStop(
      0.5,
      `rgba(70,100,70,${fogAlpha.toFixed(4)})`
    );
    fogGrad.addColorStop(1, "rgba(60,80,60,0)");
    ctx.fillStyle = fogGrad;

    ctx.beginPath();
    ctx.moveTo(-50, fogY + 90);
    for (let x = 0; x <= canvasWidth + 50; x += 40) {
      const y =
        fogY +
        Math.sin(
          x * 0.012 + time * 0.5 + layer * 2 + drift * 0.01
        ) *
          35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvasWidth + 50, fogY + 90);
    ctx.closePath();
    ctx.fill();
  }

  // Eerie green tint
  ctx.fillStyle = "rgba(50,100,50,0.045)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Mist patches
  const mistCount = settings.reducedParticles ? 4 : 7;
  for (let i = 0; i < mistCount; i++) {
    const mistX =
      (canvasWidth * 0.14 * i +
        time * 6 +
        Math.sin(time * 0.3 + i) * 50) %
        (canvasWidth + 250) -
      125;
    const mistY =
      canvasHeight * (0.5 + Math.sin(time * 0.4 + i * 0.7) * 0.12);
    const mistSize = 75 + Math.sin(time + i * 2) * 25;

    const mistGrad = ctx.createRadialGradient(
      mistX,
      mistY,
      0,
      mistX,
      mistY,
      mistSize
    );
    mistGrad.addColorStop(0, "rgba(100,150,100,0.18)");
    mistGrad.addColorStop(0.6, "rgba(80,120,80,0.09)");
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

  // Eerie green underglow
  renderScreenGlow(
    ctx,
    canvasWidth * 0.5,
    canvasHeight * 1.05,
    50,
    120,
    50,
    0.03 + Math.sin(time * 0.3) * 0.01,
    canvasHeight * 0.5
  );

  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 30, 50, 30, 0.7);
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
    case "grassland":
      renderGrasslandEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "desert":
      renderDesertEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "winter":
      renderWinterEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "volcanic":
      renderVolcanicEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "swamp":
      renderSwampEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    default:
      renderGrasslandEnvironment(ctx, canvasWidth, canvasHeight, time);
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
    Math.min(canvasWidth, canvasHeight) * 0.1,
    canvasWidth / 2,
    canvasHeight / 2,
    diagonal * 0.55
  );
  vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
  vignetteGrad.addColorStop(0.4, "rgba(0,0,0,0.06)");
  vignetteGrad.addColorStop(0.7, "rgba(0,0,0,0.15)");
  vignetteGrad.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Theme-specific color wash
  let washColor = "rgba(0,0,0,0)";
  switch (theme) {
    case "grassland":
      washColor = `rgba(100,150,80,${(0.025 + Math.sin(time * 0.5) * 0.01).toFixed(4)})`;
      break;
    case "desert":
      washColor = `rgba(200,150,100,${(0.035 + Math.sin(time * 0.3) * 0.012).toFixed(4)})`;
      break;
    case "winter":
      washColor = `rgba(150,180,220,${(0.04 + Math.sin(time * 0.4) * 0.015).toFixed(4)})`;
      break;
    case "volcanic":
      washColor = `rgba(200,80,50,${(0.045 + Math.sin(time * 0.6) * 0.018).toFixed(4)})`;
      break;
    case "swamp":
      washColor = `rgba(80,120,80,${(0.05 + Math.sin(time * 0.35) * 0.018).toFixed(4)})`;
      break;
  }
  ctx.fillStyle = washColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.restore();
}
