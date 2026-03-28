import type { EnemyCategory } from "../../types";
import { ISO_Y_RATIO } from "../../constants/isometric";

const TAU = Math.PI * 2;

// ============================================================================
// INSECTOID — faint web pattern on the ground
// ============================================================================

function renderInsectoidAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  ctx.save();

  // Radial web lines
  ctx.strokeStyle = `rgba(200, 195, 180, 0.08)`;
  ctx.lineWidth = 0.6 * zoom;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * s * 1.3,
      y + Math.sin(angle) * s * 0.65,
    );
    ctx.stroke();
  }

  // Concentric silk rings
  for (let r = 0.4; r <= 1.2; r += 0.4) {
    ctx.strokeStyle = `rgba(210, 205, 190, ${0.06 * (1.3 - r)})`;
    ctx.beginPath();
    ctx.ellipse(x, y, s * r, s * r * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================================
// FOREST — subtle root tendrils
// ============================================================================

function renderForestAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  ctx.save();

  ctx.strokeStyle = `rgba(40, 100, 35, 0.1)`;
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * TAU + time * 0.0002;
    const len = s * (0.8 + Math.sin(i * 2.3) * 0.3);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle + 0.5) * len * 0.5,
      y + Math.sin(angle + 0.5) * len * 0.25,
      x + Math.cos(angle) * len,
      y + Math.sin(angle) * len * ISO_Y_RATIO,
    );
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(40, 120, 40, 0.03)";
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.6, s * 0.6 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// SWAMP — bubbling puddle
// ============================================================================

function renderSwampAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  ctx.save();

  ctx.fillStyle = "rgba(55, 50, 28, 0.05)";
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.8, s * 0.8 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Occasional bubbles
  for (let i = 0; i < 3; i++) {
    const seed = (time * 0.001 + i * 1.7) % 1;
    if (seed > 0.6) continue;
    const bx = x + Math.sin(i * 2.5 + time * 0.0005) * s * 0.4;
    const by = y + Math.cos(i * 1.8) * s * 0.2 * ISO_Y_RATIO - seed * s * 0.15;
    ctx.fillStyle = `rgba(80, 75, 40, ${0.12 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(bx, by, (1.5 + i * 0.3) * zoom, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// DESERT — heat shimmer and sand particles
// ============================================================================

function renderDesertAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  ctx.save();

  const shimmer = Math.sin(time * 0.005) * 0.03 + 0.05;
  ctx.fillStyle = `rgba(255, 200, 100, ${shimmer * 0.4})`;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.3, s, 0, TAU);
  ctx.fill();

  // Drifting sand grains
  for (let i = 0; i < 4; i++) {
    const seed = (time * 0.001 + i * 0.9) % 1;
    const sx = x + Math.sin(time * 0.002 + i * 1.7) * s * 0.7;
    const sy = y + Math.cos(i * 2.3) * s * 0.3 * ISO_Y_RATIO;
    ctx.fillStyle = `rgba(200, 180, 130, ${0.1 * (1 - seed * 0.5)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 * zoom, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// WINTER — frost crystal pattern
// ============================================================================

function renderWinterAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  ctx.save();

  // Frost ring on ground
  ctx.strokeStyle = `rgba(180, 215, 255, 0.08)`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.7, s * 0.7 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();

  // Ice crystal branches
  ctx.strokeStyle = `rgba(160, 200, 245, 0.07)`;
  ctx.lineWidth = 0.6 * zoom;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * TAU;
    const len = s * 0.6;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len * ISO_Y_RATIO;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // Sparkles
  for (let i = 0; i < 3; i++) {
    const sparkle = Math.sin(time * 0.006 + i * 2.0) * 0.5 + 0.5;
    if (sparkle < 0.3) continue;
    const sx = x + Math.cos(i * 2.1 + time * 0.0003) * s * 0.5;
    const sy = y + Math.sin(i * 1.7) * s * 0.25 * ISO_Y_RATIO;
    ctx.fillStyle = `rgba(200, 230, 255, ${0.1 * sparkle})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 * zoom, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// VOLCANIC — glowing ground cracks
// ============================================================================

function renderVolcanicAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  const flicker = Math.sin(time * 0.008) * 0.04 + 0.08;
  ctx.save();

  ctx.fillStyle = `rgba(255, 80, 20, ${flicker * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.7, s * 0.7 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Crack lines
  ctx.strokeStyle = `rgba(255, 120, 30, ${flicker * 1.2})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * TAU + 0.4;
    const len = s * (0.3 + Math.sin(i * 1.9) * 0.15);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * len,
      y + Math.sin(angle) * len * ISO_Y_RATIO,
    );
    ctx.stroke();
  }

  // Rising ember
  const emberSeed = (time * 0.002) % 1;
  if (emberSeed < 0.5) {
    const ex = x + Math.sin(time * 0.003) * s * 0.3;
    const ey = y - emberSeed * s * 0.8;
    ctx.fillStyle = `rgba(255, 160, 40, ${0.15 * (1 - emberSeed * 2)})`;
    ctx.beginPath();
    ctx.arc(ex, ey, 1 * zoom, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// DARK FANTASY — shadowy pool and skull wisps
// ============================================================================

function renderDarkFantasyAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  ctx.save();

  ctx.fillStyle = "rgba(35, 12, 50, 0.05)";
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.8, s * 0.8 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Faint soul wisps
  for (let i = 0; i < 2; i++) {
    const seed = (time * 0.001 + i * 1.4) % 1;
    if (seed > 0.5) continue;
    const wx = x + Math.sin(time * 0.002 + i * 2.3) * s * 0.5;
    const wy = y - seed * s * 0.6;
    ctx.fillStyle = `rgba(120, 60, 180, ${0.1 * (1 - seed * 2)})`;
    ctx.beginPath();
    ctx.arc(wx, wy, 1.5 * zoom, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// REGION BOSS — intense multi-layered aura
// ============================================================================

function renderRegionBossAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const s = size * zoom;
  const pulse = Math.sin(time * 0.003) * 0.03 + 0.09;
  ctx.save();

  ctx.fillStyle = `rgba(200, 30, 30, ${pulse * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 1.4, s * 1.4 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Pulsing ring
  const ringAlpha = Math.sin(time * 0.004) * 0.04 + 0.06;
  ctx.strokeStyle = `rgba(255, 60, 60, ${ringAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 1.1, s * 1.1 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

// ============================================================================
// DISPATCH
// ============================================================================

const AURA_CATEGORIES = new Set<EnemyCategory>([
  "insectoid", "forest", "swamp", "desert", "winter", "volcanic", "dark_fantasy", "region_boss",
]);

const AURA_RENDERERS: Record<string, (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, time: number, zoom: number,
) => void> = {
  insectoid: renderInsectoidAura,
  forest: renderForestAura,
  swamp: renderSwampAura,
  desert: renderDesertAura,
  winter: renderWinterAura,
  volcanic: renderVolcanicAura,
  dark_fantasy: renderDarkFantasyAura,
  region_boss: renderRegionBossAura,
};

export function hasEnemyAura(category?: EnemyCategory): boolean {
  return !!category && AURA_CATEGORIES.has(category);
}

export function renderEnemyAura(
  ctx: CanvasRenderingContext2D,
  category: EnemyCategory,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
): void {
  const renderer = AURA_RENDERERS[category];
  if (renderer) {
    renderer(ctx, x, y, size, time, zoom);
  }
}
