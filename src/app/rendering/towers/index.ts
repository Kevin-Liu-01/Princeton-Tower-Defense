import {
  TOWER_COLORS,
  ISO_PRISM_W_FACTOR,
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import { getGameSettings } from "../../hooks/useSettings";
import type {
  Tower,
  TowerType,
  TowerUpgrade,
  Enemy,
  Position,
} from "../../types";
import {
  gridToWorld,
  worldToScreenRounded,
  isoTileDiamondHalfH,
} from "../../utils";
import { getScenePressure } from "../performance";
import { renderArchTower } from "./arch";
import { drawStar, renderCannonTower } from "./cannon";
import { renderClubTower } from "./club";
import { renderLabTower } from "./lab";
import { renderLibraryTower } from "./library";
import { renderMortarTower } from "./mortar";
import { renderStationTower } from "./station";
import {
  drawTowerPassiveEffects,
  getTowerFoundationSize,
  getTowerVisualMetrics,
} from "./towerHelpers";
import {
  drawCachedTowerSprite,
  isCacheableTowerType,
} from "./towerSpriteCache";

export {
  getTowerFoundationSize,
  getTowerParticleWorldPos,
  getTowerYShift,
  getTowerVisualMetrics,
} from "./towerHelpers";
export {
  renderStationRange,
  renderTowerRange,
  renderTowerPreview,
  renderTowerGroundTransition,
} from "./towerRange";

const TOWER_SPRITE_SCALE: Record<TowerType, number> = {
  arch: 0.95,
  cannon: 0.84,
  club: 0.7,
  lab: 1,
  library: 0.94,
  mortar: 0.9,
  station: 0.95,
};

const TOWER_SPRITE_ROTATION: Partial<Record<TowerType, number>> = {
  cannon: Math.PI * 0.75,
  mortar: -Math.PI * 0.5,
};

const TOWER_SPRITE_FOOT_MULT: Partial<Record<TowerType, number>> = {
  arch: 0.22,
  cannon: 0.4,
  club: 0.78,
  lab: 0.38,
  library: 0.4,
  mortar: 0.45,
  station: 0.23,
};

export function drawTowerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: TowerType,
  level: 1 | 2 | 3 | 4 = 1,
  upgrade?: TowerUpgrade,
  time: number = 0
): void {
  const tower: Tower = {
    id: "__sprite__",
    lastAttack: 0,
    level,
    pos: { col: 0, row: 0 },
    rotation: TOWER_SPRITE_ROTATION[type] ?? 0,
    type,
    upgrade,
  };

  const colors = TOWER_COLORS[type];
  const metrics = getTowerVisualMetrics(tower);
  const baseVisualH = metrics.visualHeight;
  const targetFit = size * 0.85;
  const typeScale = TOWER_SPRITE_SCALE[type] ?? 1;
  const lvl4Scale = level === 4 ? 1.05 : 1;
  const zoom =
    Math.max(0.1, Math.min(targetFit / baseVisualH, size / 80)) *
    typeScale *
    lvl4Scale;

  const footMult = TOWER_SPRITE_FOOT_MULT[type] ?? 0.25;
  const footY = y + baseVisualH * zoom * footMult;
  const screenPos: Position = { x, y: footY };

  ctx.save();
  switch (type) {
    case "cannon": {
      renderCannonTower(
        ctx,
        screenPos,
        tower,
        zoom,
        time,
        colors,
        [],
        "",
        0,
        0,
        1
      );
      break;
    }
    case "library": {
      renderLibraryTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    }
    case "lab": {
      renderLabTower(
        ctx,
        screenPos,
        tower,
        zoom,
        time,
        colors,
        [],
        "",
        0,
        0,
        1
      );
      break;
    }
    case "arch": {
      renderArchTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    }
    case "club": {
      renderClubTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    }
    case "station": {
      renderStationTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    }
    case "mortar": {
      renderMortarTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    }
  }
  ctx.restore();
}

export function renderTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  hoveredTower: string | null,
  selectedTower: string | null,
  enemies: Enemy[],
  selectedMap: string,
  frameNowMs: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreenRounded(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  screenPos.y -= isoTileDiamondHalfH(zoom);
  const time = frameNowMs / 1000;
  const isHovered = hoveredTower === tower.id;
  const isSelected = selectedTower === tower.id;
  const colors = TOWER_COLORS[tower.type];
  const gameSettings = getGameSettings();

  drawTowerPassiveEffects(ctx, screenPos, tower, zoom, time, colors);

  if (tower.capstone) {
    const masterworkTime = gameSettings.animation.towerAnimations ? time : 0;
    const masterworkPulse = 0.72 + Math.sin(masterworkTime * 2.4) * 0.16;
    ctx.save();
    ctx.strokeStyle = `rgba(251, 191, 36, ${masterworkPulse})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([3 * zoom, 7 * zoom]);
    ctx.lineDashOffset = -masterworkTime * 12 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 4 * zoom,
      34 * zoom,
      16 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255, 145, 35, ${masterworkPulse})`;
    for (let sparkIndex = 0; sparkIndex < 3; sparkIndex++) {
      const sparkAngle =
        masterworkTime * 0.8 + sparkIndex * ((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(
        screenPos.x + Math.cos(sparkAngle) * 30 * zoom,
        screenPos.y - 18 * zoom + Math.sin(sparkAngle) * 9 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }

  const glowShadowY = screenPos.y + 6 * zoom;

  if (isSelected || isHovered) {
    const glowFnd = getTowerFoundationSize(tower);
    const glowRx = glowFnd.w * zoom * ISO_PRISM_W_FACTOR * 1.15;
    const glowRy = glowFnd.d * zoom * ISO_PRISM_D_FACTOR * 1.15;
    const innerRx = glowRx * 0.9;
    const innerRy = glowRy * 0.9;

    ctx.save();
    ctx.shadowColor = isSelected ? "#c9a227" : "#ffffff";
    ctx.shadowBlur = 16 * zoom;

    ctx.beginPath();
    ctx.ellipse(screenPos.x, glowShadowY, glowRx, glowRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = isSelected
      ? "rgba(255, 215, 0, 0.15)"
      : "rgba(255,255,255,0.1)";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(screenPos.x, glowShadowY, innerRx, innerRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = isSelected
      ? "rgba(255, 215, 0, 0.25)"
      : "rgba(255,255,255,0.2)";
    ctx.fill();

    if (isSelected) {
      const ringPulse = 1 + Math.sin(time * 4) * 0.05;
      const ringRx = glowRx * 1.05 * ringPulse;
      const ringRy = glowRy * 1.05 * ringPulse;
      ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([8 * zoom, 4 * zoom]);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, glowShadowY, ringRx, ringRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  const shadowFnd = getTowerFoundationSize(tower);
  const shadowW = shadowFnd.w * zoom * ISO_PRISM_W_FACTOR * 1.1;
  const shadowH = shadowFnd.d * zoom * ISO_PRISM_D_FACTOR * 1.1;
  const shadowGrad = ctx.createRadialGradient(
    screenPos.x,
    glowShadowY,
    0,
    screenPos.x,
    glowShadowY,
    shadowW
  );
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.2)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, glowShadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
  ctx.fill();

  const drawTowerBody = (
    targetCtx: CanvasRenderingContext2D,
    targetX: number,
    targetY: number
  ): void => {
    const targetPosition = { x: targetX, y: targetY };

    switch (tower.type) {
      case "cannon": {
        renderCannonTower(
          targetCtx,
          targetPosition,
          tower,
          zoom,
          time,
          colors,
          enemies,
          selectedMap,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );
        break;
      }
      case "library": {
        renderLibraryTower(
          targetCtx,
          targetPosition,
          tower,
          zoom,
          time,
          colors
        );
        break;
      }
      case "lab": {
        renderLabTower(
          targetCtx,
          targetPosition,
          tower,
          zoom,
          time,
          colors,
          enemies,
          selectedMap,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );
        break;
      }
      case "arch": {
        renderArchTower(targetCtx, targetPosition, tower, zoom, time, colors);
        break;
      }
      case "club": {
        renderClubTower(targetCtx, targetPosition, tower, zoom, time, colors);
        break;
      }
      case "station": {
        renderStationTower(
          targetCtx,
          targetPosition,
          tower,
          zoom,
          time,
          colors
        );
        break;
      }
      case "mortar": {
        renderMortarTower(targetCtx, targetPosition, tower, zoom, time, colors);
        break;
      }
    }
  };

  if (isCacheableTowerType(tower.type)) {
    const cacheTime =
      getScenePressure().skipDecorativeEffects ||
      !gameSettings.animation.towerAnimations
        ? 0
        : time;
    drawCachedTowerSprite(
      ctx,
      screenPos.x,
      screenPos.y,
      tower.type,
      tower.level,
      tower.upgrade,
      tower.rotation ?? 0,
      zoom,
      cacheTime,
      drawTowerBody
    );
  } else {
    drawTowerBody(ctx, screenPos.x, screenPos.y);
  }

  if (gameSettings.ui.showTowerBadges) {
    if (tower.level > 1) {
      const starY = screenPos.y + 20 * zoom - tower.level * 8 * zoom;
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 6 * zoom;
      drawStar(ctx, screenPos.x, starY, 8 * zoom, 4 * zoom, "#c9a227");
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#8b6914";
      ctx.font = `bold ${8 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tower.level.toString(), screenPos.x, starY + 1 * zoom);
    }

    if (tower.level === 4 && tower.upgrade) {
      const badgeY = screenPos.y + 35 * zoom - tower.level * 8 * zoom;
      ctx.fillStyle = tower.upgrade === "A" ? "#ff6b6b" : "#4ecdc4";
      ctx.beginPath();
      ctx.arc(screenPos.x, badgeY, 6 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${8 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tower.upgrade, screenPos.x, badgeY);

      if (tower.capstone) {
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.arc(screenPos.x, badgeY, 9 * zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}
