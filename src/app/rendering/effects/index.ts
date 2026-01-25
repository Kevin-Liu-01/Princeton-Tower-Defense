// Princeton Tower Defense - Effects Rendering Module
// Renders visual effects, projectiles, and particles

import type { Effect, Projectile, Particle, Position, Tower, Enemy } from "../../types";
import { worldToScreen, gridToWorld, distance } from "../../utils";
import { drawLightningBolt, drawExplosion, lightenColor, darkenColor } from "../helpers";

// Re-export fog effects
export { renderRoadEndFog } from "./fog";

// ============================================================================
// EFFECT RENDERING
// ============================================================================

export function renderEffect(
  ctx: CanvasRenderingContext2D,
  effect: Effect,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  enemies: Enemy[],
  towers: Tower[],
  selectedMap: string,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    effect.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const progress = effect.progress;
  const alpha = 1 - progress;

  ctx.save();

  switch (effect.type) {
    case "explosion":
      drawExplosion(ctx, screenPos.x, screenPos.y, effect.size, progress, zoom);
      break;

    case "lightning":
    case "zap":
    case "beam":
    case "chain":
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const intensity = effect.intensity || 1;
        drawLightningBolt(ctx, screenPos.x, screenPos.y, targetScreen.x, targetScreen.y, intensity, zoom, alpha);

        // Impact spark
        ctx.fillStyle = `rgba(150, 255, 255, ${alpha * intensity})`;
        ctx.beginPath();
        ctx.arc(targetScreen.x, targetScreen.y, 8 * zoom * intensity, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "sonic":
      // Sound wave rings
      ctx.strokeStyle = `rgba(50, 200, 100, ${alpha * 0.6})`;
      ctx.lineWidth = 2 * zoom;
      for (let ring = 0; ring < 3; ring++) {
        const ringProgress = progress + ring * 0.15;
        if (ringProgress < 1) {
          const ringRadius = ringProgress * effect.size * zoom * 0.5;
          const ringAlpha = (1 - ringProgress) * 0.6;
          ctx.strokeStyle = `rgba(50, 200, 100, ${ringAlpha})`;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      break;

    case "slowField":
    case "freezeField":
      const fieldColor = effect.type === "freezeField" ? "100, 200, 255" : "100, 150, 200";
      const fieldRadius = effect.size * zoom * 0.5;
      ctx.fillStyle = `rgba(${fieldColor}, ${alpha * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, fieldRadius, fieldRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${fieldColor}, ${alpha * 0.5})`;
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();
      break;

    case "arcaneField":
      const arcaneRadius = effect.size * zoom * 0.5;
      const arcaneGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, arcaneRadius
      );
      arcaneGrad.addColorStop(0, `rgba(150, 100, 255, ${alpha * 0.3})`);
      arcaneGrad.addColorStop(0.7, `rgba(100, 50, 200, ${alpha * 0.2})`);
      arcaneGrad.addColorStop(1, "rgba(50, 0, 100, 0)");
      ctx.fillStyle = arcaneGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, arcaneRadius, arcaneRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "music_notes":
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const noteIndex = effect.noteIndex || 0;
        const symbols = ["♪", "♫", "♬", "♩", "𝄞"];

        const dx = targetScreen.x - screenPos.x;
        const dy = targetScreen.y - screenPos.y;
        const noteX = screenPos.x + dx * progress;
        const noteY = screenPos.y + dy * progress + Math.sin(Date.now() / 100 + noteIndex) * 5 * zoom;

        ctx.fillStyle = `rgba(50, 200, 100, ${alpha})`;
        ctx.font = `${14 * zoom}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbols[noteIndex % 5], noteX, noteY);
      }
      break;

    case "cannon_shot":
    case "bullet_stream":
    case "flame_burst":
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );

        if (effect.type === "flame_burst") {
          // Flame effect
          const flameGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y, 0,
            screenPos.x, screenPos.y, 30 * zoom
          );
          flameGrad.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
          flameGrad.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`);
          flameGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, 30 * zoom * (1 - progress * 0.5), 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Tracer line
          ctx.strokeStyle = effect.type === "bullet_stream" 
            ? `rgba(255, 200, 0, ${alpha})` 
            : `rgba(255, 150, 50, ${alpha})`;
          ctx.lineWidth = 3 * zoom;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y);
          ctx.lineTo(
            screenPos.x + (targetScreen.x - screenPos.x) * (1 - progress),
            screenPos.y + (targetScreen.y - screenPos.y) * (1 - progress)
          );
          ctx.stroke();
        }
      }
      break;

    case "roar_wave":
      // Circular expanding wave
      const waveRadius = progress * 150 * zoom;
      ctx.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.6})`;
      ctx.lineWidth = 4 * zoom * (1 - progress);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, waveRadius, waveRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "meteor_strike":
    case "meteor_incoming":
    case "meteor_impact":
      if (effect.type === "meteor_incoming") {
        // Incoming indicator
        ctx.strokeStyle = `rgba(255, 100, 50, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
        ctx.lineWidth = 2 * zoom;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, 30 * zoom, 15 * zoom, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Impact explosion
        const impactRadius = effect.size * zoom * (0.5 + progress * 0.5);
        const impactGrad = ctx.createRadialGradient(
          screenPos.x, screenPos.y, 0,
          screenPos.x, screenPos.y, impactRadius
        );
        impactGrad.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
        impactGrad.addColorStop(0.3, `rgba(255, 100, 0, ${alpha * 0.8})`);
        impactGrad.addColorStop(0.7, `rgba(200, 50, 0, ${alpha * 0.5})`);
        impactGrad.addColorStop(1, "rgba(100, 0, 0, 0)");
        ctx.fillStyle = impactGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, impactRadius, impactRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "freeze_wave":
      const freezeRadius = progress * 120 * zoom;
      ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.7})`;
      ctx.lineWidth = 3 * zoom * (1 - progress);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, freezeRadius, freezeRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Ice crystals
      ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.5})`;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Date.now() / 500;
        const cx = screenPos.x + Math.cos(angle) * freezeRadius * 0.8;
        const cy = screenPos.y + Math.sin(angle) * freezeRadius * 0.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5 * zoom);
        ctx.lineTo(cx + 3 * zoom, cy);
        ctx.lineTo(cx, cy + 5 * zoom);
        ctx.lineTo(cx - 3 * zoom, cy);
        ctx.closePath();
        ctx.fill();
      }
      break;

    case "inspiration":
      // Buff aura
      const inspireRadius = effect.size * zoom;
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, inspireRadius, inspireRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rising sparkles
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      for (let i = 0; i < 5; i++) {
        const sparkleX = screenPos.x + (Math.random() - 0.5) * inspireRadius * 2;
        const sparkleY = screenPos.y - progress * 50 * zoom + (Math.random() - 0.5) * 20 * zoom;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    default:
      // Generic effect
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, effect.size * zoom * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// PROJECTILE RENDERING
// ============================================================================

export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const zoom = cameraZoom || 1;
  const t = proj.progress;

  let currentX = proj.from.x + (proj.to.x - proj.from.x) * t;
  let currentY = proj.from.y + (proj.to.y - proj.from.y) * t;

  let arcOffset = 0;
  if (proj.arcHeight) {
    arcOffset = Math.sin(t * Math.PI) * proj.arcHeight;
  }

  const elevationFade = proj.elevation ? proj.elevation * (1 - t) : 0;
  const currentPos = { x: currentX, y: currentY - arcOffset - elevationFade };
  const screenPos = worldToScreen(
    currentPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );

  ctx.save();

  // Trail
  const trailLength = 5;
  for (let i = 1; i <= trailLength; i++) {
    const trailT = Math.max(0, t - i * 0.06);
    const trailX = proj.from.x + (proj.to.x - proj.from.x) * trailT;
    const trailY = proj.from.y + (proj.to.y - proj.from.y) * trailT;
    let trailArc = 0;
    if (proj.arcHeight) {
      trailArc = Math.sin(trailT * Math.PI) * proj.arcHeight;
    }
    const trailElevation = proj.elevation ? proj.elevation * (1 - trailT) : 0;
    const trailPos = worldToScreen(
      { x: trailX, y: trailY - trailArc - trailElevation },
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
    );

    const alpha = 0.35 * (1 - i / trailLength);
    ctx.fillStyle = proj.isFlamethrower
      ? `rgba(200, 80, 0, ${alpha})`
      : proj.type === "lab" || proj.type === "lightning"
      ? `rgba(0, 255, 255, ${alpha})`
      : proj.type === "arch"
      ? `rgba(50, 200, 100, ${alpha})`
      : `rgba(255, 150, 50, ${alpha})`;
    ctx.beginPath();
    ctx.arc(trailPos.x, trailPos.y, (5 - i * 0.7) * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(screenPos.x, screenPos.y);
  ctx.rotate(proj.rotation);

  const projSize = proj.type === "cannon" ? 7 : proj.type === "hero" ? 6 : 5;

  if (proj.type === "flame") {
    // Flame projectile
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 15 * zoom;
    for (let i = 0; i < 4; i++) {
      const flameOffset = (Math.random() - 0.5) * 6 * zoom;
      const flameSize = (4 + Math.random() * 4) * zoom;
      const flameGrad = ctx.createRadialGradient(flameOffset, flameOffset * 0.5, 0, flameOffset, flameOffset * 0.5, flameSize);
      flameGrad.addColorStop(0, "rgba(255, 255, 100, 0.9)");
      flameGrad.addColorStop(0.4, "rgba(200, 120, 0, 0.7)");
      flameGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(flameOffset, flameOffset * 0.5, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (proj.type === "bullet") {
    // Bullet tracer
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 8 * zoom;
    ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
    ctx.fillRect(-8 * zoom, -1.5 * zoom, 16 * zoom, 3 * zoom);
    ctx.fillStyle = "#ffdd44";
    ctx.beginPath();
    ctx.arc(4 * zoom, 0, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === "lab" || proj.type === "lightning") {
    // Lightning bolt
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 12 * zoom;
    const boltGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8 * zoom);
    boltGrad.addColorStop(0, "#ffffff");
    boltGrad.addColorStop(0.3, "#ccffff");
    boltGrad.addColorStop(0.6, "#00ffff");
    boltGrad.addColorStop(1, "#0088ff");
    ctx.fillStyle = boltGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === "arch") {
    // Music note
    ctx.shadowColor = "#32c864";
    ctx.shadowBlur = 15 * zoom;
    const noteGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * zoom);
    noteGrad.addColorStop(0, "#ffffff");
    noteGrad.addColorStop(0.3, "#aaffaa");
    noteGrad.addColorStop(0.6, "#32c864");
    noteGrad.addColorStop(1, "#228844");
    ctx.fillStyle = noteGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Default projectile
    ctx.shadowColor = proj.type === "cannon" ? "#ff6b35" : "#c9a227";
    ctx.shadowBlur = 12 * zoom;
    const projGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, projSize * zoom);
    if (proj.type === "cannon") {
      projGrad.addColorStop(0, "#ffff00");
      projGrad.addColorStop(0.5, "#ff6600");
      projGrad.addColorStop(1, "#cc3300");
    } else {
      projGrad.addColorStop(0, "#ffffff");
      projGrad.addColorStop(0.5, "#c9a227");
      projGrad.addColorStop(1, "#ff8800");
    }
    ctx.fillStyle = projGrad;
    ctx.beginPath();
    ctx.arc(0, 0, projSize * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// PARTICLE RENDERING
// ============================================================================

export function renderParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    particle.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const lifeRatio = particle.life / particle.maxLife;
  const alpha = lifeRatio;
  const size = particle.size * zoom * lifeRatio;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = particle.color;

  switch (particle.type) {
    case "spark":
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "smoke":
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "fire":
      const fireGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, size);
      fireGrad.addColorStop(0, "#ffff00");
      fireGrad.addColorStop(0.5, particle.color);
      fireGrad.addColorStop(1, "rgba(200, 0, 0, 0)");
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "ice":
      ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - size);
      ctx.lineTo(screenPos.x + size * 0.7, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + size);
      ctx.lineTo(screenPos.x - size * 0.7, screenPos.y);
      ctx.closePath();
      ctx.fill();
      break;

    case "gold":
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "magic":
      ctx.fillStyle = "#8b5cf6";
      ctx.shadowColor = "#8b5cf6";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.restore();
}
