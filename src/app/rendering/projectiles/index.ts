import type { Projectile, Position } from "../../types";
import { worldToScreen } from "../../utils";

// ============================================================================
// PROJECTILE RENDERING - Fixed to come from correct positions
// ============================================================================
export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
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

  const projSize = proj.type === "cannon" ? 7 : proj.type === "hero" ? 6 : 5;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);
  // Calculate rotation from from->to positions if not explicitly set, or use provided rotation
  const effectiveRotation = proj.rotation !== undefined ? proj.rotation : 
    Math.atan2(proj.to.y - proj.from.y, proj.to.x - proj.from.x);
  ctx.rotate(effectiveRotation);

  if (proj.type === "flame") {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 15 * zoom;
    for (let i = 0; i < 4; i++) {
      const flameOffset = (Math.random() - 0.5) * 6 * zoom;
      const flameSize = (4 + Math.random() * 4) * zoom;
      const flameGrad = ctx.createRadialGradient(
        flameOffset,
        flameOffset * 0.5,
        0,
        flameOffset,
        flameOffset * 0.5,
        flameSize
      );
      flameGrad.addColorStop(0, "rgba(255, 255, 100, 0.9)");
      flameGrad.addColorStop(0.4, "rgba(200, 120, 0, 0.7)");
      flameGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(flameOffset, flameOffset * 0.5, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (proj.type === "bullet") {
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 8 * zoom;
    ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
    ctx.fillRect(-8 * zoom, -1.5 * zoom, 16 * zoom, 3 * zoom);
    ctx.fillStyle = "#ffdd44";
    ctx.beginPath();
    ctx.arc(4 * zoom, 0, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (proj.type === "lab" || proj.type === "lightning") {
    // Lightning bolt projectile
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 12 * zoom;

    // Electric core
    const boltGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8 * zoom);
    boltGrad.addColorStop(0, "#ffffff");
    boltGrad.addColorStop(0.3, "#ccffff");
    boltGrad.addColorStop(0.6, "#00ffff");
    boltGrad.addColorStop(1, "#0088ff");

    ctx.fillStyle = boltGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Electric sparks
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      const sparkAngle = (i / 4) * Math.PI * 2 + Date.now() / 100;
      const sparkLen = 8 + Math.random() * 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(sparkAngle) * sparkLen * zoom,
        Math.sin(sparkAngle) * sparkLen * zoom
      );
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  if (proj.type === "arch") {
    // Music note beam projectile
    const time = Date.now() / 1000;
    ctx.shadowColor = "#32c864";
    ctx.shadowBlur = 15 * zoom;

    // Glowing green core
    const noteGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * zoom);
    noteGrad.addColorStop(0, "#ffffff");
    noteGrad.addColorStop(0.3, "#aaffaa");
    noteGrad.addColorStop(0.6, "#32c864");
    noteGrad.addColorStop(1, "#228844");

    ctx.fillStyle = noteGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Music notes orbiting the projectile
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${12 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const symbols = ["♪", "♫", "♬", "♩"];
    for (let i = 0; i < 4; i++) {
      const noteAngle = (i / 4) * Math.PI * 2 + time * 8;
      const noteRadius = 14 * zoom;
      const nx = Math.cos(noteAngle) * noteRadius;
      const ny = Math.sin(noteAngle) * noteRadius * 0.5;
      ctx.fillText(symbols[i], nx, ny);
    }

    // Musical wave rings
    ctx.strokeStyle = "rgba(50, 200, 100, 0.5)";
    ctx.lineWidth = 2 * zoom;
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (time * 4 + ring * 0.3) % 1;
      const ringSize = 5 + ringPhase * 20;
      const ringAlpha = 0.6 * (1 - ringPhase);
      ctx.strokeStyle = `rgba(50, 200, 100, ${ringAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        ringSize * zoom,
        ringSize * zoom * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Trailing music notes behind projectile
    ctx.fillStyle = "rgba(50, 200, 100, 0.7)";
    for (let i = 1; i <= 3; i++) {
      const trailOffset = -i * 12 * zoom;
      const wobble = Math.sin(time * 10 + i * 2) * 4 * zoom;
      ctx.font = `${(10 - i) * zoom}px Arial`;
      ctx.fillText(symbols[i % 4], trailOffset, wobble);
    }

    ctx.restore();
    return;
  }

  if (proj.type === "spear") {
    // Compact golden arrow for centaurs - optimized for performance
    // Scale factor to make arrow smaller
    const s = 0.6;
    
    // Simple glow (no shadow blur for performance)
    ctx.fillStyle = "rgba(255, 200, 50, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * zoom * s, 4 * zoom * s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Arrow shaft
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(-8 * zoom * s, -1.2 * zoom * s, 16 * zoom * s, 2.4 * zoom * s);
    
    // Gold band
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(0, -1.5 * zoom * s, 1.5 * zoom * s, 3 * zoom * s);
    
    // Orange fletching
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(-6 * zoom * s, 0);
    ctx.lineTo(-10 * zoom * s, -3.5 * zoom * s);
    ctx.lineTo(-7 * zoom * s, 0);
    ctx.lineTo(-10 * zoom * s, 3.5 * zoom * s);
    ctx.closePath();
    ctx.fill();
    
    // Silver arrowhead
    ctx.fillStyle = "#e0e0e0";
    ctx.beginPath();
    ctx.moveTo(12 * zoom * s, 0);
    ctx.lineTo(6 * zoom * s, -3.5 * zoom * s);
    ctx.lineTo(7 * zoom * s, 0);
    ctx.lineTo(6 * zoom * s, 3.5 * zoom * s);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    return;
  }

  // Default projectile
  ctx.shadowColor =
    proj.type === "cannon"
      ? "#ff6b35"
      : proj.type === "hero"
      ? "#c9a227"
      : "#c9a227";
  ctx.shadowBlur = 12 * zoom;

  const projGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, projSize * zoom);
  if (proj.type === "cannon") {
    projGradient.addColorStop(0, "#ffff00");
    projGradient.addColorStop(0.5, "#ff6600");
    projGradient.addColorStop(1, "#cc3300");
  } else {
    projGradient.addColorStop(0, "#ffffff");
    projGradient.addColorStop(0.5, "#c9a227");
    projGradient.addColorStop(1, "#ff8800");
  }

  ctx.fillStyle = projGradient;
  ctx.beginPath();
  ctx.arc(0, 0, projSize * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
