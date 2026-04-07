import { TROOP_DATA, ISO_Y_RATIO } from "../../constants";
import type { MapTheme } from "../../constants/maps";
import type { Troop, Position, TroopOwnerType } from "../../types";
import { worldToScreen, worldToScreenRounded } from "../../utils";
import { getPerformanceSettings, getScenePressure } from "../performance";
import { drawArmoredTroop } from "./armored";
import { drawCavalryTroop } from "./cavalry";
import { drawCentaurTroop } from "./centaur";
import { drawEliteTroop } from "./elite";
import { drawHexlingTroop } from "./hexling";
import { drawHexseerTroop } from "./hexseer";
import { drawKnightTroop } from "./knight";
import { drawReinforcementTroop } from "./reinforcement";
import { drawRowingTroop } from "./rowing";
import { drawSoldierTroop } from "./soldier";
import { drawThesisTroop } from "./thesis";
import { drawTroopRegionOverlay } from "./troopRegionThemes";
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
  mapTheme?: MapTheme
) {
  const screenPos = worldToScreenRounded(
    troop.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const troopType = troop.type || "footsoldier";
  const tData = TROOP_DATA[troopType];
  const time = Date.now() / 1000;
  const pressure = getScenePressure();
  const lowDetail = pressure.skipDecorativeEffects;
  const minDetail = pressure.skipNonEssentialParticles;

  const ghostRemainingRatio =
    troop.isHexGhost && troop.hexGhostExpireTime
      ? Math.max(0, Math.min(1, (troop.hexGhostExpireTime - Date.now()) / 8000))
      : 1;
  const ghostAlpha = troop.isHexGhost
    ? 0.42 +
      ghostRemainingRatio * 0.5 +
      (minDetail ? 0 : Math.sin(time * 7.5) * 0.04)
    : 1;

  ctx.save();
  if (troop.isHexGhost) {
    ctx.globalAlpha = Math.max(0.22, Math.min(0.95, ghostAlpha));
  }

  if (troop.isHexGhost && !minDetail) {
    const ghostPulse = 0.72 + Math.sin(time * 4.5) * 0.2;
    const ghostAura = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y - 3 * zoom,
      0,
      screenPos.x,
      screenPos.y - 3 * zoom,
      30 * zoom
    );
    ghostAura.addColorStop(0, `rgba(244, 114, 182, ${0.22 * ghostPulse})`);
    ghostAura.addColorStop(1, "rgba(76, 29, 149, 0)");
    ctx.fillStyle = ghostAura;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - 4 * zoom,
      24 * zoom,
      18 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (!lowDetail) {
      for (let i = 0; i < 3; i++) {
        const wispAngle = time * (1.2 + i * 0.35) + i * 2.1;
        const wispX = screenPos.x + Math.cos(wispAngle) * 13 * zoom;
        const wispY =
          screenPos.y -
          16 * zoom +
          Math.sin(wispAngle * 1.4) * 8 * zoom -
          i * 4 * zoom;
        ctx.fillStyle = `rgba(251, 113, 133, ${0.18 + ghostRemainingRatio * 0.16})`;
        ctx.beginPath();
        ctx.arc(wispX, wispY, (2.2 + i * 0.8) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

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
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom,
    (troop.isHexGhost ? 11 : 15) * zoom,
    (troop.isHexGhost ? 4.5 : 7) * zoom,
    0,
    0,
    Math.PI * 2
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

  let targetScreenPos;
  if (targetPos) {
    targetScreenPos = worldToScreen(
      targetPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
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

  // Healing aura ground layer - circle renders behind troop sprite
  const troopHealActive =
    !minDetail &&
    troop.healFlash &&
    (Date.now() - troop.healFlash < 500 || troop.hp < troop.maxHp);
  if (troopHealActive) {
    const pulseAlpha = 0.85 + Math.sin(time * 3) * 0.15;

    const outerGlow = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y,
      size * 0.1,
      screenPos.x,
      screenPos.y,
      size * 1
    );
    outerGlow.addColorStop(0, `rgba(134, 239, 172, ${0.5 * pulseAlpha})`);
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
      Math.PI * 2
    );
    ctx.fill();
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
    troop.id,
    troop.knightVariant
  );

  ctx.restore();

  // Healing aura overlay - glow and sparkles render on top of troop sprite
  if (troopHealActive) {
    const pulseAlpha = 0.85 + Math.sin(time * 3) * 0.15;

    const innerGlow = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y - size * 0.08,
      0,
      screenPos.x,
      screenPos.y,
      size * 0.45
    );
    innerGlow.addColorStop(0, `rgba(187, 247, 208, ${0.65 * pulseAlpha})`);
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
      Math.PI * 2
    );
    ctx.fill();

    if (!lowDetail) {
      const sparkleCount = pressure.forceSimplifiedGradients ? 3 : 6;
      for (let i = 0; i < sparkleCount; i++) {
        const sparklePhase = (time * 0.7 + i * 0.17) % 1;
        const sparkleX =
          screenPos.x + Math.sin(time * 1.8 + i * 1.2) * size * 0.38;
        const sparkleY = screenPos.y + size * 0.15 - sparklePhase * size * 0.9;
        const sparkleAlpha = Math.sin(sparklePhase * Math.PI) * pulseAlpha;
        const sparkleSize = (2 + Math.sin(i * 1.2) * 0.6) * zoom;

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
        const shimmerAngle = time * 1 + i * ((Math.PI * 2) / 3);
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
  }

  if (getPerformanceSettings().showHealthBars && troop.hp < troop.maxHp) {
    const TROOP_HP_BAR_HEIGHT: Record<string, number> = {
      armored: 1.72,
      cavalry: 2.4,
      centaur: 2,
      elite: 1.75,
      footsoldier: 1.1,
      hexling: 1.28,
      hexseer: 1.42,
      knight: 1.92,
      reinforcement: 1.72,
      rowing: 1.1,
      soldier: 1.2,
      thesis: 1.4,
      turret: 1.75,
    };
    const hpBarHeightMul = TROOP_HP_BAR_HEIGHT[troopType] ?? 1;
    const barWidth = 32 * zoom;
    const barHeight = 5 * zoom;
    const barY = screenPos.y - size * hpBarHeightMul - 10 * zoom;
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
      cornerRadius
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
      if (lowDetail) {
        ctx.fillStyle =
          hpPercent > 0.5
            ? "#4ade80"
            : hpPercent > 0.25
              ? "#facc15"
              : "#f87171";
      } else {
        const hpGradient = ctx.createLinearGradient(
          barX,
          barY,
          barX,
          barY + barHeight
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
      }
      ctx.beginPath();
      ctx.roundRect(barX, barY, hpWidth, barHeight, [
        cornerRadius - 1,
        hpPercent > 0.9 ? cornerRadius - 1 : 0,
        hpPercent > 0.9 ? cornerRadius - 1 : 0,
        cornerRadius - 1,
      ]);
      ctx.fill();

      if (!lowDetail) {
        const shineGrad = ctx.createLinearGradient(
          barX,
          barY,
          barX,
          barY + barHeight * 0.45
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
    }

    if (!lowDetail) {
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
        cornerRadius
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawTroopSprite(
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
  troopId?: string,
  knightVariant?: number
) {
  const TROOP_SPRITE_SCALES: Record<string, number> = {
    armored: 1.65,
    cavalry: 1.6,
    centaur: 1.6,
    elite: 1.7,
    footsoldier: 1.15,
    hexling: 1.2,
    hexseer: 1.28,
    knight: 1.55,
    reinforcement: 1.55,
    rowing: 1.15,
    soldier: 1.25,
    thesis: 1.35,
    turret: 1.7,
  };

  const scale = TROOP_SPRITE_SCALES[type] ?? 1;
  const scaledSize = size * scale;
  const scaledY = y - size * (scale - 1) * 0.5;

  switch (type) {
    case "soldier":
    case "footsoldier": {
      drawSoldierTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "cavalry": {
      drawCavalryTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "centaur": {
      drawCentaurTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "elite": {
      drawEliteTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "armored": {
      drawArmoredTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "thesis": {
      drawThesisTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "hexling": {
      drawHexlingTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "reinforcement": {
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
        troopId
      );
      break;
    }
    case "rowing": {
      drawRowingTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "hexseer": {
      drawHexseerTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    case "knight": {
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
        knightVariant
      );
      break;
    }
    case "turret": {
      drawTurretTroop(
        ctx,
        x,
        scaledY,
        scaledSize,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    }
    default: {
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
        mapTheme
      );
    }
  }

  if (mapTheme && mapTheme !== "grassland") {
    drawTroopRegionOverlay(
      ctx,
      x,
      scaledY,
      scaledSize,
      type,
      mapTheme,
      time,
      zoom
    );
  }
}
