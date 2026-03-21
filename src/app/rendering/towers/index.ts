import type {
  Tower,
  TowerType,
  TowerUpgrade,
  Enemy,
  Position,
} from "../../types";
import {
  TOWER_COLORS,
  ISO_PRISM_W_FACTOR,
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import { gridToWorld, worldToScreenRounded } from "../../utils";
import { getGameSettings } from "../../hooks/useSettings";
import {
  drawTowerPassiveEffects,
  getTowerFoundationSize,
  getTowerVisualMetrics,
} from "./towerHelpers";
import { drawStar, renderCannonTower } from "./cannon";
import { renderMortarTower } from "./mortar";
import { renderLibraryTower } from "./library";
import { renderLabTower } from "./lab";
import { renderArchTower } from "./arch";
import { renderClubTower } from "./club";
import { renderStationTower } from "./station";

export { getTowerFoundationSize, getTowerVisualMetrics } from "./towerHelpers";
export {
  renderStationRange,
  renderTowerRange,
  renderTowerPreview,
  renderTowerGroundTransition,
} from "./towerRange";

const TOWER_SPRITE_SCALE: Record<TowerType, number> = {
  cannon: 0.9,
  library: 1.05,
  lab: 1.12,
  arch: 1.0,
  club: 0.75,
  station: 0.95,
  mortar: 0.88,
};

const TOWER_SPRITE_ROTATION: Partial<Record<TowerType, number>> = {
  cannon: Math.PI * 0.75,
};

const TOWER_SPRITE_FOOT_MULT: Partial<Record<TowerType, number>> = {
  club: 0.65,
  mortar: 0.35,
  library: 0.32,
  lab: 0.28,
  cannon: 0.28,
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
  time: number = 0,
): void {
  const tower: Tower = {
    id: "__sprite__",
    type,
    pos: { row: 0, col: 0 },
    level,
    upgrade,
    lastAttack: 0,
    rotation: TOWER_SPRITE_ROTATION[type] ?? 0,
  };

  const colors = TOWER_COLORS[type];
  const metrics = getTowerVisualMetrics(tower);
  const baseVisualH = metrics.visualHeight;
  const targetFit = size * 0.85;
  const typeScale = TOWER_SPRITE_SCALE[type] ?? 1.0;
  const lvl4Scale = level === 4 ? 0.82 : 1.0;
  const zoom =
    Math.max(0.1, Math.min(targetFit / baseVisualH, size / 80)) *
    typeScale *
    lvl4Scale;

  const footMult = TOWER_SPRITE_FOOT_MULT[type] ?? 0.25;
  const footY = y + baseVisualH * zoom * footMult;
  const screenPos: Position = { x, y: footY };

  ctx.save();
  switch (type) {
    case "cannon":
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
        1,
      );
      break;
    case "library":
      renderLibraryTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "lab":
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
        1,
      );
      break;
    case "arch":
      renderArchTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "club":
      renderClubTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "station":
      renderStationTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "mortar":
      renderMortarTower(ctx, screenPos, tower, zoom, time, colors);
      break;
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
  cameraZoom?: number,
) {
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreenRounded(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const isHovered = hoveredTower === tower.id;
  const isSelected = selectedTower === tower.id;
  const colors = TOWER_COLORS[tower.type];

  drawTowerPassiveEffects(ctx, screenPos, tower, zoom, time, colors);

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
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 8 * zoom,
      glowRx,
      glowRy,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = isSelected
      ? "rgba(255, 215, 0, 0.15)"
      : "rgba(255,255,255,0.1)";
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 8 * zoom,
      innerRx,
      innerRy,
      0,
      0,
      Math.PI * 2,
    );
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
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 8 * zoom,
        ringRx,
        ringRy,
        0,
        0,
        Math.PI * 2,
      );
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
    screenPos.y + 8 * zoom,
    0,
    screenPos.x,
    screenPos.y + 8 * zoom,
    shadowW,
  );
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.2)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    shadowW,
    shadowH,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  switch (tower.type) {
    case "cannon":
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
        cameraZoom,
      );
      break;
    case "library":
      renderLibraryTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "lab":
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
        cameraZoom,
      );
      break;
    case "arch":
      renderArchTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "club":
      renderClubTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "station":
      renderStationTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "mortar":
      renderMortarTower(ctx, screenPos, tower, zoom, time, colors);
      break;
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
