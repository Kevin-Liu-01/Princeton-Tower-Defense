// Princeton Tower Defense - Library Tower Rendering
// Arcane library with slowing and freezing effects

import type { Tower, Position, TowerColors } from "../../types";
import { drawIsometricPrism, lightenColor, darkenColor } from "../helpers";

export function renderLibraryTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  ctx.save();
  const level = tower.level;
  const baseWidth = 38 + level * 4;
  const baseHeight = 32 + level * 8;

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

  // Level-specific features
  if (tower.level >= 2) {
    // Arcane windows
    const glowAlpha = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(100, 150, 255, ${glowAlpha})`;
    ctx.fillRect(screenPos.x - 8 * zoom, screenPos.y - baseHeight * zoom * 0.5, 6 * zoom, 10 * zoom);
    ctx.fillRect(screenPos.x + 2 * zoom, screenPos.y - baseHeight * zoom * 0.5, 6 * zoom, 10 * zoom);
  }

  if (tower.level >= 3) {
    // Magical orb on top
    const orbPulse = 0.7 + Math.sin(time * 3) * 0.3;
    ctx.shadowColor = "#6495ed";
    ctx.shadowBlur = 15 * zoom;
    ctx.fillStyle = `rgba(100, 149, 237, ${orbPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y - baseHeight * zoom - 10 * zoom, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Level 4 upgrades
  if (tower.level === 4) {
    if (tower.upgrade === "A") {
      // Earthquake - seismic rings
      const ringPhase = (time * 2) % 1;
      ctx.strokeStyle = `rgba(139, 69, 19, ${(1 - ringPhase) * 0.5})`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 5 * zoom,
        (30 + ringPhase * 40) * zoom,
        (15 + ringPhase * 20) * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else if (tower.upgrade === "B") {
      // Blizzard - ice crystals
      const iceAlpha = 0.6 + Math.sin(time * 4) * 0.2;
      ctx.fillStyle = `rgba(200, 230, 255, ${iceAlpha})`;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + time * 0.5;
        const cx = screenPos.x + Math.cos(angle) * 15 * zoom;
        const cy = screenPos.y - baseHeight * zoom - 5 * zoom + Math.sin(angle * 2) * 5 * zoom;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5 * zoom);
        ctx.lineTo(cx + 3 * zoom, cy);
        ctx.lineTo(cx, cy + 5 * zoom);
        ctx.lineTo(cx - 3 * zoom, cy);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Roof
  const roofY = screenPos.y - baseHeight * zoom;
  ctx.fillStyle = colors.dark;
  ctx.beginPath();
  ctx.moveTo(screenPos.x, roofY - 15 * zoom);
  ctx.lineTo(screenPos.x - baseWidth * 0.4 * zoom, roofY);
  ctx.lineTo(screenPos.x, roofY + baseWidth * 0.2 * zoom);
  ctx.lineTo(screenPos.x + baseWidth * 0.4 * zoom, roofY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
