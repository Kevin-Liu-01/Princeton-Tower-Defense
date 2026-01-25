// Princeton Tower Defense - Lab Tower Rendering
// Tesla coil with electric attacks

import type { Tower, Enemy, Position, TowerColors } from "../../types";
import { drawIsometricPrism, lightenColor, darkenColor } from "../helpers";

export function renderLabTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  ctx.save();
  const level = tower.level;
  const baseWidth = 34 + level * 4;
  const baseHeight = 25 + level * 8;

  // Foundation
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 8,
    baseWidth + 8,
    6,
    {
      top: darkenColor(colors.base, 20),
      left: darkenColor(colors.base, 40),
      right: darkenColor(colors.base, 30),
    },
    zoom
  );

  // Main building
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 2 * zoom,
    baseWidth,
    baseWidth,
    baseHeight,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
    },
    zoom
  );

  // Tesla coil
  const coilHeight = (35 + level * 8) * zoom;
  const topY = screenPos.y - baseHeight * zoom;
  const orbY = topY - coilHeight + 5 * zoom;

  // Coil base
  ctx.fillStyle = "#3a5a6a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Coil body (spiral)
  ctx.strokeStyle = "#5a7a8a";
  ctx.lineWidth = 3 * zoom;
  const spiralTurns = 6 + level * 2;
  for (let i = 0; i < spiralTurns; i++) {
    const t = i / spiralTurns;
    const y = topY - t * coilHeight;
    const radius = (6 - t * 2) * zoom;
    const phase = time * 2 + i * 0.5;
    const xOffset = Math.sin(phase) * 2 * zoom;

    ctx.beginPath();
    ctx.ellipse(screenPos.x + xOffset, y, radius, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Energy orb at top
  const pulse = 0.6 + Math.sin(time * 4) * 0.4;
  const orbRadius = (6 + level * 2) * zoom;

  // Orb glow
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20 * zoom * pulse;

  // Orb gradient
  const orbGrad = ctx.createRadialGradient(
    screenPos.x,
    orbY,
    0,
    screenPos.x,
    orbY,
    orbRadius
  );
  orbGrad.addColorStop(0, "#ffffff");
  orbGrad.addColorStop(0.3, "#ccffff");
  orbGrad.addColorStop(0.7, "#00ffff");
  orbGrad.addColorStop(1, "#0088ff");

  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbRadius, 0, Math.PI * 2);
  ctx.fill();

  // Electric arcs
  ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const arcAngle = (i / 4) * Math.PI * 2 + time * 5;
    const arcLength = (15 + Math.sin(time * 8 + i) * 5) * zoom;
    const endX = screenPos.x + Math.cos(arcAngle) * arcLength;
    const endY = orbY + Math.sin(arcAngle) * arcLength * 0.5;

    ctx.beginPath();
    ctx.moveTo(screenPos.x, orbY);
    // Jagged lightning path
    const segments = 4;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const x = screenPos.x + (endX - screenPos.x) * t + (Math.random() - 0.5) * 6 * zoom;
      const y = orbY + (endY - orbY) * t + (Math.random() - 0.5) * 3 * zoom;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Level 4 upgrades
  if (tower.level === 4) {
    if (tower.upgrade === "A") {
      // Focused beam - laser sight
      ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(time * 6) * 0.2})`;
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(screenPos.x, orbY);
      ctx.lineTo(screenPos.x + Math.cos(tower.rotation) * 100 * zoom, orbY + Math.sin(tower.rotation) * 50 * zoom);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (tower.upgrade === "B") {
      // Chain lightning - multiple orbs
      for (let i = 0; i < 3; i++) {
        const subOrbAngle = (i / 3) * Math.PI * 2 + time * 2;
        const subOrbDist = 12 * zoom;
        const subX = screenPos.x + Math.cos(subOrbAngle) * subOrbDist;
        const subY = orbY + Math.sin(subOrbAngle) * subOrbDist * 0.5;

        ctx.fillStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(time * 5 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(subX, subY, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
