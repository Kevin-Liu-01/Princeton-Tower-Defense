import type { Troop, Position, TroopOwnerType } from "../../types";
import type { MapTheme } from "../../constants/maps";
import { TROOP_DATA, ISO_Y_RATIO } from "../../constants";
import { worldToScreen, worldToScreenRounded } from "../../utils";
import { getPerformanceSettings } from "../performance";

import { drawSoldierTroop } from "./soldier";
import { drawCavalryTroop } from "./cavalry";
import { drawCentaurTroop } from "./centaur";
import { drawEliteTroop } from "./elite";
import { drawArmoredTroop } from "./armored";
import { drawThesisTroop } from "./thesis";
import { drawRowingTroop } from "./rowing";
import { drawReinforcementTroop } from "./reinforcement";
import { drawKnightTroop } from "./knight";
import { drawTurretTroop } from "./turret";

export type { KnightTheme } from "./knightThemes";
export { getKnightTheme } from "./knightThemes";

export function renderTroop(
  ctx: CanvasRenderingContext2D,
  troop: Troop,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  targetPos?: Position,
  mapTheme?: MapTheme,
) {
  const screenPos = worldToScreenRounded(
    troop.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;
  const troopType = troop.type || "footsoldier";
  const tData = TROOP_DATA[troopType];
  const time = Date.now() / 1000;

  if (troop.selected) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 2 * zoom,
      28 * zoom,
      14 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom,
    15 * zoom,
    7 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const size = 22 * zoom;
  const attackPhase =
    troop.attackAnim && troop.attackAnim > 0 ? troop.attackAnim / 300 : 0;
  const attackScale = attackPhase > 0 ? 1 + attackPhase * 0.15 : 1;
  const facingRight =
    troop.facingRight ??
    (typeof troop.rotation === "number"
      ? Math.cos(troop.rotation + Math.PI / 4) >= 0
      : true);

  let targetScreenPos: Position | undefined = undefined;
  if (targetPos) {
    targetScreenPos = worldToScreen(
      targetPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
  }

  // Cavalry and centaur sprites are drawn facing LEFT by default (horse head
  // on the negative-x side), opposite to every other troop sprite.  Invert
  // the flip so the horse body visually matches the logical facing direction.
  const spriteReversed = troopType === "cavalry" || troopType === "centaur";
  const effectiveFacingRight = spriteReversed ? !facingRight : facingRight;

  const localTargetPos = targetScreenPos
    ? {
        x: targetScreenPos.x - screenPos.x,
        y: targetScreenPos.y - (screenPos.y - size / 2),
      }
    : undefined;
  if (!effectiveFacingRight && localTargetPos) {
    localTargetPos.x *= -1;
  }

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(effectiveFacingRight ? attackScale : -attackScale, attackScale);

  drawTroopSprite(
    ctx,
    0,
    0,
    size,
    troopType,
    tData.color,
    time,
    zoom,
    attackPhase,
    localTargetPos,
    troop.ownerType,
    troop.visualTier,
    mapTheme,
  );

  ctx.restore();

  const healAuraActive =
    troop.healFlash &&
    (Date.now() - troop.healFlash < 500 || troop.hp < troop.maxHp);
  if (healAuraActive) {
    const pulseAlpha = 0.85 + Math.sin(time * 3) * 0.15;

    const outerGlow = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y,
      size * 0.1,
      screenPos.x,
      screenPos.y,
      size * 1.0,
    );
    outerGlow.addColorStop(0, `rgba(134, 239, 172, ${0.5 * pulseAlpha})`);
    outerGlow.addColorStop(0.4, `rgba(74, 222, 128, ${0.3 * pulseAlpha})`);
    outerGlow.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      size * 0.9,
      size * 0.9 * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    const innerGlow = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y - size * 0.08,
      0,
      screenPos.x,
      screenPos.y,
      size * 0.45,
    );
    innerGlow.addColorStop(0, `rgba(187, 247, 208, ${0.65 * pulseAlpha})`);
    innerGlow.addColorStop(0.5, `rgba(134, 239, 172, ${0.3 * pulseAlpha})`);
    innerGlow.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - size * 0.04,
      size * 0.45,
      size * 0.45 * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const sparklePhase = (time * 0.7 + i * 0.17) % 1;
      const sparkleX =
        screenPos.x + Math.sin(time * 1.8 + i * 1.2) * size * 0.38;
      const sparkleY = screenPos.y + size * 0.15 - sparklePhase * size * 0.9;
      const sparkleAlpha = Math.sin(sparklePhase * Math.PI) * pulseAlpha;
      const sparkleSize = (2.0 + Math.sin(i * 1.2) * 0.6) * zoom;

      ctx.fillStyle = `rgba(220, 252, 231, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.moveTo(sparkleX, sparkleY - sparkleSize);
      ctx.lineTo(sparkleX + sparkleSize * 0.5, sparkleY);
      ctx.lineTo(sparkleX, sparkleY + sparkleSize);
      ctx.lineTo(sparkleX - sparkleSize * 0.5, sparkleY);
      ctx.closePath();
      ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
      const shimmerAngle = time * 1.0 + i * ((Math.PI * 2) / 3);
      const shimmerDist = size * 0.35;
      const shimmerX = screenPos.x + Math.cos(shimmerAngle) * shimmerDist;
      const shimmerY =
        screenPos.y + Math.sin(shimmerAngle) * shimmerDist * ISO_Y_RATIO;
      const shimmerAlpha =
        (0.7 + Math.sin(time * 4 + i * 2) * 0.2) * pulseAlpha;

      ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(shimmerX, shimmerY, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (getPerformanceSettings().showHealthBars && troop.hp < troop.maxHp) {
    const barWidth = 32 * zoom;
    const barHeight = 5 * zoom;
    const barY = screenPos.y - size - 10 * zoom;
    const barX = screenPos.x - barWidth / 2;
    const cornerRadius = 2.5 * zoom;

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 3 * zoom;
    ctx.shadowOffsetY = 1 * zoom;

    ctx.fillStyle = "rgba(10, 10, 15, 0.9)";
    ctx.beginPath();
    ctx.roundRect(
      barX - 1,
      barY - 1,
      barWidth + 2,
      barHeight + 2,
      cornerRadius,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius - 1);
    ctx.fill();

    const hpPercent = troop.hp / troop.maxHp;
    const hpWidth = barWidth * hpPercent;

    if (hpWidth > 0) {
      const hpGradient = ctx.createLinearGradient(
        barX,
        barY,
        barX,
        barY + barHeight,
      );
      if (hpPercent > 0.5) {
        hpGradient.addColorStop(0, "#86efac");
        hpGradient.addColorStop(0.5, "#4ade80");
        hpGradient.addColorStop(1, "#22c55e");
      } else if (hpPercent > 0.25) {
        hpGradient.addColorStop(0, "#fde047");
        hpGradient.addColorStop(0.5, "#facc15");
        hpGradient.addColorStop(1, "#eab308");
      } else {
        hpGradient.addColorStop(0, "#fca5a5");
        hpGradient.addColorStop(0.5, "#f87171");
        hpGradient.addColorStop(1, "#ef4444");
      }
      ctx.fillStyle = hpGradient;
      ctx.beginPath();
      ctx.roundRect(barX, barY, hpWidth, barHeight, [
        cornerRadius - 1,
        hpPercent > 0.9 ? cornerRadius - 1 : 0,
        hpPercent > 0.9 ? cornerRadius - 1 : 0,
        cornerRadius - 1,
      ]);
      ctx.fill();

      const shineGrad = ctx.createLinearGradient(
        barX,
        barY,
        barX,
        barY + barHeight * 0.45,
      );
      shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, hpWidth, barHeight * 0.45, [
        cornerRadius - 1,
        hpPercent > 0.9 ? cornerRadius - 1 : 0,
        0,
        0,
      ]);
      ctx.fill();
    }

    const glowColor =
      hpPercent > 0.5
        ? "rgba(74, 222, 128, 0.3)"
        : hpPercent > 0.25
          ? "rgba(250, 204, 21, 0.3)"
          : "rgba(248, 113, 113, 0.3)";
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(
      barX - 1,
      barY - 1,
      barWidth + 2,
      barHeight + 2,
      cornerRadius,
    );
    ctx.stroke();
  }
}

function drawTroopSprite(
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
  ownerType?: TroopOwnerType,
  visualTier?: number,
  mapTheme?: MapTheme,
) {
  const TROOP_SPRITE_SCALES: Record<string, number> = {
    footsoldier: 1.0,
    soldier: 1.15,
    rowing: 1.15,
    armored: 1.3,
    elite: 1.5,
    thesis: 1.35,
    reinforcement: 1.5,
    cavalry: 1.5,
    centaur: 1.5,
    knight: 1.6,
    turret: 1.7,
  };

  const scale = TROOP_SPRITE_SCALES[type] ?? 1.0;
  const scaledSize = size * scale;
  const scaledY = y - size * (scale - 1) * 0.5;

  switch (type) {
    case "soldier":
    case "footsoldier":
      drawSoldierTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "cavalry":
      drawCavalryTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "centaur":
      drawCentaurTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "elite":
      drawEliteTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "armored":
      drawArmoredTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "thesis":
      drawThesisTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "reinforcement":
      drawReinforcementTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        time,
        zoom,
        attackPhase,
        visualTier,
        targetPos,
      );
      break;
    case "rowing":
      drawRowingTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    case "knight":
      drawKnightTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        ownerType,
        targetPos,
        mapTheme,
      );
      break;
    case "turret":
      drawTurretTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos,
      );
      break;
    default:
      drawKnightTroop(
        ctx,
        x,
        y,
        size,
        color,
        time,
        zoom,
        attackPhase,
        undefined,
        targetPos,
        mapTheme,
      );
  }
}
