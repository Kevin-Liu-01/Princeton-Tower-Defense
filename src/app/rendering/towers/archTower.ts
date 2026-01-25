// Princeton Tower Defense - Arch Tower Rendering
// Sonic/musical attack tower

import type { Tower, Position, TowerColors } from "../../types";
import { drawIsometricPrism, lightenColor, darkenColor } from "../helpers";

export function renderArchTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  ctx.save();
  const level = tower.level;
  const baseWidth = 36 + level * 4;
  const pillarHeight = (35 + level * 8) * zoom;

  // Foundation platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    8,
    {
      top: darkenColor(colors.base, 15),
      left: darkenColor(colors.base, 35),
      right: darkenColor(colors.base, 25),
    },
    zoom
  );

  // Left pillar
  drawIsometricPrism(
    ctx,
    screenPos.x - 12 * zoom,
    screenPos.y + 2 * zoom,
    8,
    8,
    pillarHeight / zoom,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
    },
    zoom
  );

  // Right pillar
  drawIsometricPrism(
    ctx,
    screenPos.x + 12 * zoom,
    screenPos.y + 2 * zoom,
    8,
    8,
    pillarHeight / zoom,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
    },
    zoom
  );

  // Arch top
  const archTopY = screenPos.y - pillarHeight;
  ctx.fillStyle = colors.light;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, archTopY, 16 * zoom, 10 * zoom, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Inner arch (portal)
  const portalPulse = 0.5 + Math.sin(time * 3) * 0.3;
  const portalGrad = ctx.createRadialGradient(
    screenPos.x,
    archTopY + 8 * zoom,
    0,
    screenPos.x,
    archTopY + 8 * zoom,
    12 * zoom
  );

  if (tower.level === 4 && tower.upgrade === "A") {
    // Shockwave - red portal
    portalGrad.addColorStop(0, `rgba(255, 100, 100, ${portalPulse})`);
    portalGrad.addColorStop(0.5, `rgba(200, 50, 50, ${portalPulse * 0.7})`);
    portalGrad.addColorStop(1, "rgba(100, 0, 0, 0)");
  } else if (tower.level === 4 && tower.upgrade === "B") {
    // Symphony - blue portal
    portalGrad.addColorStop(0, `rgba(100, 200, 255, ${portalPulse})`);
    portalGrad.addColorStop(0.5, `rgba(50, 150, 200, ${portalPulse * 0.7})`);
    portalGrad.addColorStop(1, "rgba(0, 100, 150, 0)");
  } else {
    // Default - green portal
    portalGrad.addColorStop(0, `rgba(50, 200, 100, ${portalPulse})`);
    portalGrad.addColorStop(0.5, `rgba(30, 150, 70, ${portalPulse * 0.7})`);
    portalGrad.addColorStop(1, "rgba(0, 100, 50, 0)");
  }

  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, archTopY + 8 * zoom, 12 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Musical notes animation
  ctx.fillStyle = "#32c864";
  ctx.font = `${10 * zoom}px Arial`;
  ctx.textAlign = "center";
  const symbols = ["♪", "♫", "♬", "♩"];
  for (let i = 0; i < 3; i++) {
    const notePhase = (time * 2 + i * 0.5) % 2;
    if (notePhase < 1.5) {
      const noteY = archTopY + 8 * zoom - notePhase * 30 * zoom;
      const noteX = screenPos.x + Math.sin(time * 4 + i) * 10 * zoom;
      const noteAlpha = 1 - notePhase / 1.5;
      ctx.fillStyle = `rgba(50, 200, 100, ${noteAlpha})`;
      ctx.fillText(symbols[i % 4], noteX, noteY);
    }
  }

  // Pillar decorations
  if (level >= 2) {
    // Carved patterns
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 3; i++) {
      const patternY = screenPos.y - i * 15 * zoom - 10 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 15 * zoom, patternY);
      ctx.lineTo(screenPos.x - 9 * zoom, patternY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 9 * zoom, patternY);
      ctx.lineTo(screenPos.x + 15 * zoom, patternY);
      ctx.stroke();
    }
  }

  // Sound wave effect when attacking
  const timeSinceAttack = Date.now() - tower.lastAttack;
  if (timeSinceAttack < 400) {
    const waveProgress = timeSinceAttack / 400;
    const waveAlpha = 1 - waveProgress;
    ctx.strokeStyle = `rgba(50, 200, 100, ${waveAlpha * 0.5})`;
    ctx.lineWidth = 2 * zoom;

    for (let ring = 0; ring < 3; ring++) {
      const ringProgress = waveProgress + ring * 0.15;
      if (ringProgress < 1) {
        const ringRadius = ringProgress * 50 * zoom;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, archTopY + 8 * zoom, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}
