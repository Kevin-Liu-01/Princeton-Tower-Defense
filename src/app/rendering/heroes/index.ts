// Princeton Tower Defense - Hero Rendering Module
// Renders all hero types with unique visual designs

import type { Hero, Position } from "../../types";
import { HERO_DATA, ISO_Y_RATIO } from "../../constants";
import {
  worldToScreenRounded,
  lightenColor,
  darkenColor,
  worldToScreen,
} from "../../utils";
import { drawTigerHero } from "./tiger";
import { drawTenorHero } from "./tenor";
import { drawMatheyKnightHero } from "./mathey";
import { drawRockyHero } from "./rocky";
import { drawFScottHero } from "./scott";
import { drawCaptainHero } from "./captain";
import { drawEngineerHero } from "./engineer";
import { getPerformanceSettings } from "../performance";

const HERO_SIZE_OVERRIDES: Record<string, number> = {
  rocky: 1.15,
};

const HERO_BAR_OFFSET: Record<string, number> = {
  rocky: -15,
  scott: -3,
  captain: -10,
  tiger: -8,
  tenor: -5,
  mathey: -8,
  engineer: -2,
};

export function renderHero(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  targetPos?: Position,
) {
  const screenPos = worldToScreenRounded(
    hero.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;
  const hData = HERO_DATA[hero.type];
  const time = Date.now() / 1000;

  // Selection glow - uses hero's theme color
  if (hero.selected) {
    ctx.strokeStyle = hData.color;
    ctx.lineWidth = 3 * zoom;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 3 * zoom,
      40 * zoom,
      40 * ISO_Y_RATIO * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 1 * zoom,
    22 * zoom,
    22 * ISO_Y_RATIO * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const heroScale = HERO_SIZE_OVERRIDES[hero.type] ?? 1;
  const size = 32 * zoom * heroScale;
  const attackPhase = hero.attackAnim > 0 ? hero.attackAnim / 300 : 0;
  const attackScale = attackPhase > 0 ? 1 + attackPhase * 0.2 : 1;
  const facingRight =
    hero.facingRight ??
    (typeof hero.rotation === "number"
      ? Math.cos(hero.rotation + Math.PI / 4) >= 0
      : true);
  const targetScreenPos = targetPos
    ? worldToScreen(
        targetPos,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom,
      )
    : undefined;
  const localTargetPos = targetScreenPos
    ? {
        x: targetScreenPos.x - screenPos.x,
        y: targetScreenPos.y - (screenPos.y - size / 2),
      }
    : undefined;
  if (facingRight && localTargetPos) {
    localTargetPos.x *= -1;
  }

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(facingRight ? -attackScale : attackScale, attackScale);

  // Draw specific hero type with attack animation
  drawHeroSprite(
    ctx,
    0,
    0,
    size,
    hero.type,
    hData.color,
    time,
    zoom,
    attackPhase,
    localTargetPos,
  );

  ctx.restore();

  // HEALING AURA EFFECT - Soft, elegant healing visualization for heroes
  if (hero.healFlash && hero.hp < hero.maxHp) {
    const pulseAlpha = 0.9 + Math.sin(time * 3) * 0.1; // Stronger breathing effect

    // Soft outer glow - larger diffuse emerald light for heroes
    const outerGlow = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y,
      size * 0.15,
      screenPos.x,
      screenPos.y,
      size * 1.2,
    );
    outerGlow.addColorStop(0, `rgba(134, 239, 172, ${0.55 * pulseAlpha})`);
    outerGlow.addColorStop(0.4, `rgba(74, 222, 128, ${0.35 * pulseAlpha})`);
    outerGlow.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      size * 1.1,
      size * 0.65,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Inner warm core - brighter for heroes
    const innerGlow = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y - size * 0.1,
      0,
      screenPos.x,
      screenPos.y,
      size * 0.55,
    );
    innerGlow.addColorStop(0, `rgba(187, 247, 208, ${0.7 * pulseAlpha})`);
    innerGlow.addColorStop(0.45, `rgba(134, 239, 172, ${0.35 * pulseAlpha})`);
    innerGlow.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - size * 0.05,
      size * 0.55,
      size * 0.33,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Floating sparkle particles - more for heroes
    for (let i = 0; i < 8; i++) {
      const sparklePhase = (time * 0.65 + i * 0.125) % 1;
      const sparkleX =
        screenPos.x + Math.sin(time * 1.6 + i * 1.0) * size * 0.45;
      const sparkleY = screenPos.y + size * 0.2 - sparklePhase * size * 1.1;
      const sparkleAlpha = Math.sin(sparklePhase * Math.PI) * pulseAlpha;
      const sparkleSize = (2.2 + Math.sin(i * 1.1) * 0.7) * zoom;

      // Diamond-shaped sparkle
      ctx.fillStyle = `rgba(220, 252, 231, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.moveTo(sparkleX, sparkleY - sparkleSize);
      ctx.lineTo(sparkleX + sparkleSize * 0.5, sparkleY);
      ctx.lineTo(sparkleX, sparkleY + sparkleSize);
      ctx.lineTo(sparkleX - sparkleSize * 0.5, sparkleY);
      ctx.closePath();
      ctx.fill();
    }

    // Orbiting shimmer highlights - more for heroes
    for (let i = 0; i < 4; i++) {
      const shimmerAngle = time * 0.9 + i * ((Math.PI * 2) / 4);
      const shimmerDist = size * 0.42;
      const shimmerX = screenPos.x + Math.cos(shimmerAngle) * shimmerDist;
      const shimmerY =
        screenPos.y + Math.sin(shimmerAngle) * shimmerDist * 0.55;
      const shimmerAlpha =
        (0.75 + Math.sin(time * 4.5 + i * 1.5) * 0.2) * pulseAlpha;

      ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(shimmerX, shimmerY, 2.0 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gentle healing ring - soft glow
    const ringAlpha = 0.4 + Math.sin(time * 2.5) * 0.15;
    ctx.strokeStyle = `rgba(134, 239, 172, ${ringAlpha * pulseAlpha})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      size * 0.8,
      size * 0.48,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  if (!getPerformanceSettings().showHealthBars) return;

  // HP Bar - Premium hero style
  const barWidth = 48 * zoom;
  const barHeight = 7 * zoom;
  const barExtraOffset = (HERO_BAR_OFFSET[hero.type] ?? 0) * zoom;
  const barY = screenPos.y - size - 20 * zoom + barExtraOffset;
  const barX = screenPos.x - barWidth / 2;
  const cornerRadius = 3.5 * zoom;

  // Outer glow/shadow for premium feel
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 5 * zoom;
  ctx.shadowOffsetY = 1.5 * zoom;

  // Background with gold trim effect
  ctx.fillStyle = "rgba(8, 8, 12, 0.95)";
  ctx.beginPath();
  ctx.roundRect(
    barX - 2,
    barY - 2,
    barWidth + 4,
    barHeight + 4,
    cornerRadius + 1,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Gold border (hero distinction)
  const goldGrad = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
  goldGrad.addColorStop(0, "#fbbf24");
  goldGrad.addColorStop(0.5, "#f59e0b");
  goldGrad.addColorStop(1, "#d97706");
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, cornerRadius);
  ctx.stroke();

  // Inner dark background
  ctx.fillStyle = "#0f0f12";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius - 1);
  ctx.fill();

  const hpPercent = hero.hp / hero.maxHp;
  const hpWidth = barWidth * hpPercent;

  // Health gradient fill with vibrant colors
  if (hpWidth > 0) {
    const hpGradient = ctx.createLinearGradient(
      barX,
      barY,
      barX,
      barY + barHeight,
    );
    if (hpPercent > 0.5) {
      // Bright green - healthy hero
      hpGradient.addColorStop(0, "#a7f3d0");
      hpGradient.addColorStop(0.3, "#6ee7b7");
      hpGradient.addColorStop(0.7, "#34d399");
      hpGradient.addColorStop(1, "#10b981");
    } else if (hpPercent > 0.25) {
      // Amber - hero in danger
      hpGradient.addColorStop(0, "#fef08a");
      hpGradient.addColorStop(0.3, "#fde047");
      hpGradient.addColorStop(0.7, "#facc15");
      hpGradient.addColorStop(1, "#eab308");
    } else {
      // Red - critical hero health
      hpGradient.addColorStop(0, "#fecaca");
      hpGradient.addColorStop(0.3, "#fca5a5");
      hpGradient.addColorStop(0.7, "#f87171");
      hpGradient.addColorStop(1, "#ef4444");
    }
    ctx.fillStyle = hpGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY, hpWidth, barHeight, [
      cornerRadius - 1,
      hpPercent > 0.92 ? cornerRadius - 1 : 0,
      hpPercent > 0.92 ? cornerRadius - 1 : 0,
      cornerRadius - 1,
    ]);
    ctx.fill();

    // Premium shine highlight
    const shineGrad = ctx.createLinearGradient(
      barX,
      barY,
      barX,
      barY + barHeight * 0.5,
    );
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    shineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, hpWidth, barHeight * 0.5, [
      cornerRadius - 1,
      hpPercent > 0.92 ? cornerRadius - 1 : 0,
      0,
      0,
    ]);
    ctx.fill();

    // Pulsing edge glow when low health
    if (hpPercent <= 0.25) {
      const pulseAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
      ctx.shadowColor = `rgba(239, 68, 68, ${pulseAlpha})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.strokeStyle = `rgba(239, 68, 68, ${pulseAlpha})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.roundRect(
        barX - 1,
        barY - 1,
        barWidth + 2,
        barHeight + 2,
        cornerRadius,
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Name tag with enhanced glow
  ctx.shadowColor = hData.color;
  ctx.shadowBlur = 6 * zoom;
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${11 * zoom}px bc-novatica-cyr`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(hData.name, screenPos.x, barY - 4 * zoom);
  ctx.shadowBlur = 0;
}

function drawHeroSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  switch (type) {
    case "tiger":
      drawTigerHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "tenor":
      drawTenorHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "mathey":
      drawMatheyKnightHero(
        ctx,
        x,
        y,
        size,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "rocky":
      drawRockyHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "scott":
    case "fscott":
      drawFScottHero(
        ctx,
        x,
        y,
        size,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "captain":
      drawCaptainHero(
        ctx,
        x,
        y,
        size,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "engineer":
      drawEngineerHero(
        ctx,
        x,
        y,
        size,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    default:
      drawDefaultHero(ctx, x, y, size, color, time, zoom, attackPhase);
  }
}

function drawDefaultHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  void attackPhase;

  // Default hero fallback
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6);
  bodyGrad.addColorStop(0, lightenColor(color, 30));
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, darkenColor(color, 40));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.45, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ffdbac";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.25, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.27, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.27, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
}
