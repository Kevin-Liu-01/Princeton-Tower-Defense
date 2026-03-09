import type { Tower, DraggingTower, Position } from "../../types";
import { TILE_SIZE, TOWER_DATA } from "../../constants";
import { TOWER_STATS } from "../../constants/towerStats";
import {
  gridToWorld,
  worldToScreen,
  worldToScreenRounded,
  isValidBuildPosition,
  darkenColor,
} from "../../utils";
import { drawIsometricPrism, drawGroundTransition } from "./towerHelpers";
import { renderRangeReticle, RETICLE_COLORS } from "../ui/reticles";

export function renderStationRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower & { isHovered?: boolean },
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  if (!tower.isHovered && !tower.selected) return;

  const baseRange = tower.spawnRange || 180;
  const rangeBoost = tower.rangeBoost || 1;
  const range = baseRange * rangeBoost;
  const isBoosted = rangeBoost > 1;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );

  renderRangeReticle(ctx, {
    x: screenPos.x,
    y: screenPos.y,
    range,
    zoom: cameraZoom || 1,
    state: tower.isHovered ? "hovered" : "normal",
    color: isBoosted ? RETICLE_COLORS.cyan : RETICLE_COLORS.orange,
    dashed: true,
  });
}

export function renderTowerRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower & { isHovered?: boolean },
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  const tData = TOWER_DATA[tower.type];
  if (tData.range <= 0) return;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );

  let range = tData.range;
  if (tower.level === 2) range *= 1.15;
  if (tower.level === 3) {
    if (tower.type === "library" && tower.upgrade === "B") range *= 1.5;
    else range *= 1.25;
  }
  if (tower.level >= 4 && tower.upgrade) {
    const towerStats = TOWER_STATS[tower.type];
    const upgradeRange = towerStats?.upgrades?.[tower.upgrade]?.stats?.range;
    if (upgradeRange !== undefined) {
      range = upgradeRange;
    } else {
      range = tData.range * 1.5;
    }
  }
  range *= tower.rangeBoost || 1;

  const hasRangeBuff = (tower.rangeBoost || 1) > 1;

  let rangeMod = 1.0;
  let hasRangeDebuff = false;
  const now = Date.now();
  if (tower.debuffs && tower.debuffs.length > 0) {
    for (const debuff of tower.debuffs) {
      if (now >= debuff.until) continue;
      if (debuff.type === "blind") {
        rangeMod *= 1 - debuff.intensity;
        hasRangeDebuff = true;
      }
    }
  }
  range *= rangeMod;

  const state = hasRangeDebuff
    ? "debuffed" as const
    : hasRangeBuff
      ? "buffed" as const
      : tower.isHovered
        ? "hovered" as const
        : "normal" as const;

  renderRangeReticle(ctx, {
    x: screenPos.x,
    y: screenPos.y,
    range,
    zoom: cameraZoom || 1,
    state,
  });
}
// ============================================================================
// TOWER PREVIEW
// ============================================================================
// Body colors for each tower preview, matched to actual render function colors
export function getTowerPreviewColors(type: string): {
  top: string;
  left: string;
  right: string;
} {
  switch (type) {
    case "cannon":
      return { top: "#6a6a72", left: "#4a4a52", right: "#2a2a32" };
    case "library":
      return { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" };
    case "lab":
      return { top: "#4d7a9b", left: "#3a6585", right: "#2d5a7b" };
    case "arch":
      return { top: "#a89878", left: "#988868", right: "#887858" };
    case "club":
      return { top: "#3a6a4a", left: "#2a5a3a", right: "#1a4a2a" };
    case "station":
      return { top: "#6b5030", left: "#5a4020", right: "#4a3010" };
    case "mortar":
      return { top: "#5a5a62", left: "#3a3a42", right: "#2a2a32" };
    default:
      return { top: "#6a6a72", left: "#4a4a52", right: "#2a2a32" };
  }
}

// Level-1 body dimensions for each tower preview, matched to actual render sizes
export function getTowerPreviewDimensions(type: string): {
  width: number;
  height: number;
} {
  switch (type) {
    case "cannon":
      return { width: 41, height: 34 };
    case "library":
      return { width: 39, height: 40 };
    case "lab":
      return { width: 34, height: 33 };
    case "arch":
      return { width: 36, height: 36 };
    case "club":
      return { width: 43, height: 42 };
    case "station":
      return { width: 40, height: 36 };
    case "mortar":
      return { width: 43, height: 38 };
    default:
      return { width: 34, height: 28 };
  }
}

export function renderTowerPreview(
  ctx: CanvasRenderingContext2D,
  dragging: DraggingTower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  towers: Tower[],
  selectedMap: string,
  gridWidth: number = 16,
  gridHeight: number = 10,
  cameraOffset?: Position,
  cameraZoom?: number,
  blockedPositions?: Set<string>,
) {
  const zoom = cameraZoom || 1;
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const offset = cameraOffset || { x: 0, y: 0 };

  const isoX = (dragging.pos.x - width / 2) / zoom - offset.x;
  const isoY = (dragging.pos.y - height / 3) / zoom - offset.y;
  const worldX = isoX + isoY * 2;
  const worldY = isoY * 2 - isoX;
  const gridPos = {
    x: Math.floor(worldX / TILE_SIZE),
    y: Math.floor(worldY / TILE_SIZE),
  };

  const worldPos = gridToWorld(gridPos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );

  // Check validity including blocked positions (landmarks and special towers)
  const isValid = isValidBuildPosition(
    gridPos,
    selectedMap,
    towers,
    gridWidth,
    gridHeight,
    40,
    blockedPositions,
    dragging.type,
  );

  // Single base indicator at the anchor cell (footprint logic is handled by validation)
  ctx.fillStyle = isValid
    ? "rgba(100, 255, 100, 0.4)"
    : "rgba(255, 80, 80, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = isValid
    ? "rgba(50, 200, 50, 0.8)"
    : "rgba(200, 50, 50, 0.8)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha = 0.75;

  // Per-tower colors matching their actual rendered appearance
  const previewColors = getTowerPreviewColors(dragging.type);
  const previewDims = getTowerPreviewDimensions(dragging.type);

  const foundColors = {
    top: isValid ? darkenColor(previewColors.top, 30) : "#993333",
    left: isValid ? darkenColor(previewColors.left, 30) : "#882222",
    right: isValid ? darkenColor(previewColors.right, 30) : "#772222",
  };

  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    previewDims.width + 8,
    previewDims.width + 8,
    6,
    foundColors,
    zoom,
  );

  const bodyColors = {
    top: isValid ? previewColors.top : "#ff6666",
    left: isValid ? previewColors.left : "#dd4444",
    right: isValid ? previewColors.right : "#bb3333",
  };

  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    previewDims.width,
    previewDims.width,
    previewDims.height,
    bodyColors,
    zoom,
  );

  ctx.restore();

  // Range preview - show level 1 base range when placing
  const tData = TOWER_DATA[dragging.type];
  if (tData.range > 0) {
    renderRangeReticle(ctx, {
      x: screenPos.x,
      y: screenPos.y,
      range: tData.range,
      zoom,
      state: "preview",
      color: isValid ? RETICLE_COLORS.blue : RETICLE_COLORS.red,
      fillAlpha: 0,
      strokeAlpha: 0.6,
      dashed: true,
    });
  }

  if (dragging.type === "station" && tData.spawnRange) {
    renderRangeReticle(ctx, {
      x: screenPos.x,
      y: screenPos.y,
      range: tData.spawnRange,
      zoom,
      state: "preview",
      color: isValid ? RETICLE_COLORS.gold : RETICLE_COLORS.red,
      fillAlpha: 0,
      strokeAlpha: 0.5,
      dashed: true,
    });
  }
}

export function renderTowerGroundTransition(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
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
  drawGroundTransition(ctx, screenPos, tower, zoom, time, selectedMap);
}
