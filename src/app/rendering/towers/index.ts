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
  getTowerYShift,
  getTowerVisualMetrics,
} from "./towerHelpers";

export {
  getTowerFoundationSize,
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
  mortar: 0.35,
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
  const lvl4Scale = level === 4 ? 0.82 : 1;
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
  const time = Date.now() / 1000;
  const isHovered = hoveredTower === tower.id;
  const isSelected = selectedTower === tower.id;
  const colors = TOWER_COLORS[tower.type];

  drawTowerPassiveEffects(ctx, screenPos, tower, zoom, time, colors);

  const towerShift = getTowerYShift(tower) * zoom;
  const glowShadowY = screenPos.y - towerShift + 8 * zoom;

  if (isSelected || isHovered) {
    const glowFnd = getTowerFoundationSize(tower);
    const glowRx = glowFnd.w * zoom * ISO_PRISM_W_FACTOR * 1.7;
    const glowRy = glowFnd.d * zoom * ISO_PRISM_D_FACTOR * 1.7;
    const innerRx = glowRx * 0.9;
    const innerRy = glowRy * 0.9;

    ctx.save();
    ctx.shadowColor = isSelected ? "#c9a227" : "#ffffff";
    ctx.shadowBlur = 30 * zoom;

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

  switch (tower.type) {
    case "cannon": {
      renderCannonTower(
        ctx,
        screenPos,
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

  if (getGameSettings().ui.showTowerBadges) {
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
    }
  }
}
