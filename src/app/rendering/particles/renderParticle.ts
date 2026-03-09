import type { Particle, Position } from "../../types";
import { worldToScreen } from "../../utils";
import { setShadowBlur, clearShadow, getPerformanceSettings, getScenePressure } from "../performance";

// ============================================================================
// PARTICLE RENDERER - Optimized to eliminate per-particle overhead
//
// Key optimizations vs the original:
// 1. No ctx.save()/restore() per particle (manual globalAlpha reset)
// 2. Uses performance-aware setShadowBlur instead of raw ctx.shadowBlur
// 3. Density-based simplification: under heavy load, expensive types
//    (fire, magic, glow) fall back to simple circles
// 4. Gradient creation guarded by a density threshold
// ============================================================================

export function renderParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  particleDensityHint: number = 0,
): void {
  const screenPos = worldToScreen(
    particle.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );

  if (
    screenPos.x < -20 || screenPos.x > canvasWidth + 20 ||
    screenPos.y < -20 || screenPos.y > canvasHeight + 20
  ) return;

  const zoom = cameraZoom || 1;
  const lifeRatio = particle.life / particle.maxLife;
  const alpha = lifeRatio;
  const size = particle.size * zoom * lifeRatio;
  if (size < 0.3) return;

  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha;

  const pressure = getScenePressure();
  const simplified = particleDensityHint > 160
    || getPerformanceSettings().reducedParticles
    || pressure.skipDecorativeEffects;

  switch (particle.type) {
    case "fire":
      renderFire(ctx, screenPos, size, particle.color, simplified);
      break;
    case "ice":
      renderIce(ctx, screenPos, size, zoom);
      break;
    case "spark":
      renderSpark(ctx, screenPos, size, zoom, particle.color);
      break;
    case "smoke":
      renderSmoke(ctx, screenPos, size, alpha);
      break;
    case "gold":
      renderGold(ctx, screenPos, size, zoom, particle.color);
      break;
    case "magic":
      renderMagic(ctx, screenPos, size, particle.color, simplified);
      break;
    case "glow":
    case "light":
      renderGlow(ctx, screenPos, size, particle.color, simplified);
      break;
    case "poison":
      renderPoison(ctx, screenPos, size, particle.color, alpha, simplified);
      break;
    case "water":
      renderWater(ctx, screenPos, size, particle.color, alpha, simplified);
      break;
    case "heal":
      renderHeal(ctx, screenPos, size, zoom, particle.color, simplified);
      break;
    case "sand":
      renderSand(ctx, screenPos, size, particle.color, alpha);
      break;
    case "summon":
      renderSummon(ctx, screenPos, size, particle.color, simplified);
      break;
    case "storm":
      renderStorm(ctx, screenPos, size, zoom, particle.color, simplified);
      break;
    case "explosion":
    default:
      renderDefault(ctx, screenPos, size, particle.color);
      break;
  }

  ctx.globalAlpha = prevAlpha;
}

function renderFire(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 1.5);
  grad.addColorStop(0, "rgba(255, 255, 180, 0.9)");
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, "rgba(200, 40, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y - size * 1.8);
  ctx.quadraticCurveTo(pos.x + size, pos.y - size * 0.2, pos.x, pos.y + size * 0.5);
  ctx.quadraticCurveTo(pos.x - size, pos.y - size * 0.2, pos.x, pos.y - size * 1.8);
  ctx.fill();
}

function renderIce(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  zoom: number,
): void {
  ctx.fillStyle = "rgba(200, 235, 255, 0.7)";
  ctx.strokeStyle = "rgba(160, 210, 255, 0.5)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y - size * 1.2);
  ctx.lineTo(pos.x + size * 0.8, pos.y);
  ctx.lineTo(pos.x, pos.y + size * 1.2);
  ctx.lineTo(pos.x - size * 0.8, pos.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function renderSpark(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  zoom: number,
  color: string,
): void {
  setShadowBlur(ctx, 4 * zoom, color);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

function renderSmoke(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  alpha: number,
): void {
  ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
  ctx.globalAlpha = alpha * 0.5;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function renderGold(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  zoom: number,
  color: string,
): void {
  setShadowBlur(ctx, 5 * zoom, "#c9a227");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

function renderMagic(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 2.2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.5, "rgba(139, 92, 246, 0.3)");
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function renderGlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 2);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

function renderPoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
  alpha: number,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const outerSize = size * 1.8;
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, outerSize);
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, "rgba(68, 204, 68, 0.5)");
  grad.addColorStop(1, "rgba(34, 136, 34, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, outerSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function renderWater(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
  alpha: number,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y, size * 1.2, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = alpha * 0.9;
  ctx.fillStyle = "rgba(140, 200, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(pos.x - size * 0.2, pos.y - size * 0.15, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function renderHeal(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  zoom: number,
  color: string,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const outerSize = size * 2;
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, outerSize);
  grad.addColorStop(0, "rgba(170, 255, 221, 0.9)");
  grad.addColorStop(0.4, color);
  grad.addColorStop(1, "rgba(68, 238, 136, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, outerSize, 0, Math.PI * 2);
  ctx.fill();

  setShadowBlur(ctx, 3 * zoom, "#88ffaa");
  ctx.fillStyle = "#ccffdd";
  const arm = size * 0.35;
  const thick = size * 0.18;
  ctx.beginPath();
  ctx.rect(pos.x - thick, pos.y - arm, thick * 2, arm * 2);
  ctx.rect(pos.x - arm, pos.y - thick, arm * 2, thick * 2);
  ctx.fill();
  clearShadow(ctx);
}

function renderSand(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
  alpha: number,
): void {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha * 0.6;

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = alpha * 0.4;
  ctx.beginPath();
  ctx.arc(pos.x + size * 0.5, pos.y + size * 0.3, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function renderSummon(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const outerSize = size * 2.2;
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, outerSize);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, "rgba(119, 34, 204, 0.4)");
  grad.addColorStop(1, "rgba(85, 0, 170, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, outerSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(200, 160, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function renderStorm(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  zoom: number,
  color: string,
  simplified: boolean,
): void {
  if (simplified) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  setShadowBlur(ctx, 6 * zoom, "#88aaff");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y - size * 1.4);
  ctx.lineTo(pos.x + size * 0.5, pos.y - size * 0.2);
  ctx.lineTo(pos.x - size * 0.2, pos.y + size * 0.1);
  ctx.lineTo(pos.x + size * 0.2, pos.y + size * 1.4);
  ctx.fill();
  clearShadow(ctx);
}

function renderDefault(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
  ctx.fill();
}
