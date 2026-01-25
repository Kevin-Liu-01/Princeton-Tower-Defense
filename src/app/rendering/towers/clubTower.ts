// Princeton Tower Defense - Club Tower Rendering
// Income-generating building

import type { Tower, Position, TowerColors } from "../../types";
import { drawIsometricPrism, lightenColor, darkenColor } from "../helpers";

export function renderClubTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  ctx.save();
  const level = tower.level;
  const baseWidth = 40 + level * 4;
  const baseHeight = 30 + level * 6;

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

  // Roof
  const roofY = screenPos.y - baseHeight * zoom;
  drawIsometricPrism(
    ctx,
    screenPos.x,
    roofY,
    baseWidth + 4,
    baseWidth + 4,
    4,
    {
      top: darkenColor(colors.dark, 10),
      left: darkenColor(colors.dark, 20),
      right: darkenColor(colors.dark, 30),
    },
    zoom
  );

  // Windows with warm glow
  const windowGlow = 0.5 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = `rgba(255, 200, 100, ${windowGlow})`;
  
  // Left face windows
  ctx.fillRect(screenPos.x - 12 * zoom, screenPos.y - baseHeight * zoom * 0.6, 5 * zoom, 8 * zoom);
  ctx.fillRect(screenPos.x - 4 * zoom, screenPos.y - baseHeight * zoom * 0.6, 5 * zoom, 8 * zoom);
  
  // Right face windows
  ctx.fillRect(screenPos.x + 4 * zoom, screenPos.y - baseHeight * zoom * 0.6, 5 * zoom, 8 * zoom);
  ctx.fillRect(screenPos.x + 12 * zoom, screenPos.y - baseHeight * zoom * 0.6, 5 * zoom, 8 * zoom);

  // Door
  ctx.fillStyle = colors.dark;
  ctx.fillRect(screenPos.x - 5 * zoom, screenPos.y - 2 * zoom, 10 * zoom, 12 * zoom);
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(screenPos.x + 3 * zoom, screenPos.y + 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Gold coin animation
  const coinPhase = (time * 1.5) % 2;
  if (coinPhase < 1) {
    const coinY = roofY - 10 * zoom - coinPhase * 20 * zoom;
    const coinAlpha = 1 - coinPhase;
    const coinScale = 1 - coinPhase * 0.3;

    ctx.fillStyle = `rgba(201, 162, 39, ${coinAlpha})`;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 8 * zoom * coinAlpha;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, coinY, 6 * zoom * coinScale, 3 * zoom * coinScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // $ symbol
    ctx.fillStyle = `rgba(255, 255, 255, ${coinAlpha})`;
    ctx.font = `bold ${8 * zoom * coinScale}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", screenPos.x, coinY);
    ctx.shadowBlur = 0;
  }

  // Level-specific features
  if (level >= 2) {
    // Chimney with smoke
    ctx.fillStyle = colors.dark;
    ctx.fillRect(screenPos.x + 10 * zoom, roofY - 15 * zoom, 6 * zoom, 15 * zoom);

    // Smoke puffs
    const smokeAlpha = 0.3 + Math.sin(time * 2) * 0.1;
    ctx.fillStyle = `rgba(150, 150, 150, ${smokeAlpha})`;
    const smokeOffset = Math.sin(time) * 3;
    ctx.beginPath();
    ctx.arc(screenPos.x + 13 * zoom + smokeOffset, roofY - 20 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screenPos.x + 15 * zoom + smokeOffset * 1.2, roofY - 28 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  if (level >= 3) {
    // Gold trim
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(
      screenPos.x - baseWidth * 0.35 * zoom,
      screenPos.y - baseHeight * zoom + 5 * zoom,
      baseWidth * 0.7 * zoom,
      baseHeight * zoom - 10 * zoom
    );
  }

  // Level 4 upgrades
  if (tower.level === 4) {
    if (tower.upgrade === "A") {
      // Investment Bank - vault symbol
      ctx.fillStyle = colors.accent;
      ctx.font = `bold ${16 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("$", screenPos.x, roofY - 20 * zoom);

      // Gold aura
      const auraAlpha = 0.2 + Math.sin(time * 3) * 0.1;
      ctx.strokeStyle = `rgba(201, 162, 39, ${auraAlpha})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 35 * zoom, 17 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tower.upgrade === "B") {
      // Recruitment Center - buff indicator
      const buffPulse = 0.5 + Math.sin(time * 4) * 0.3;
      ctx.fillStyle = `rgba(255, 100, 100, ${buffPulse})`;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, roofY - 25 * zoom);
      ctx.lineTo(screenPos.x - 8 * zoom, roofY - 15 * zoom);
      ctx.lineTo(screenPos.x + 8 * zoom, roofY - 15 * zoom);
      ctx.closePath();
      ctx.fill();

      // Buff range indicator
      ctx.strokeStyle = `rgba(255, 100, 100, ${buffPulse * 0.3})`;
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, 100 * zoom, 50 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Sign
  ctx.fillStyle = colors.dark;
  ctx.fillRect(screenPos.x - 15 * zoom, screenPos.y - baseHeight * zoom * 0.85, 30 * zoom, 8 * zoom);
  ctx.fillStyle = colors.accent;
  ctx.font = `bold ${6 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("CLUB", screenPos.x, screenPos.y - baseHeight * zoom * 0.8);

  ctx.restore();
}
