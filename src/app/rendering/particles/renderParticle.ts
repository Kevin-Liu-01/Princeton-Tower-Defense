import type { Particle, Position } from "../../types";
import { worldToScreen } from "../../utils";
import { setShadowBlur, clearShadow, getPerformanceSettings } from "../performance";

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

  // Under heavy particle load, simplify expensive render types
  const simplified = particleDensityHint > 160 || getPerformanceSettings().reducedParticles;

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
