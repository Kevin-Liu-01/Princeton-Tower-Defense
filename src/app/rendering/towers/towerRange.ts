import type { Tower, DraggingTower, Position, TowerType } from "../../types";
import { TILE_SIZE, TOWER_DATA, TOWER_COLORS, LEVEL_2_RANGE_MULT, LEVEL_3_RANGE_MULT, LEVEL_4_RANGE_MULT } from "../../constants";
import { TOWER_STATS } from "../../constants/towerStats";
import {
  gridToWorld,
  worldToScreen,
  worldToScreenRounded,
  isValidBuildPosition,
  isoTileDiamondHalfH,
} from "../../utils";
import { drawGroundTransition } from "./towerHelpers";
import { renderRangeReticle, RETICLE_COLORS } from "../ui/reticles";
import { getGameSettings } from "../../hooks/useSettings";
import { renderCannonTower } from "./cannon";
import { renderLibraryTower } from "./library";
import { renderLabTower } from "./lab";
import { renderArchTower } from "./arch";
import { renderClubTower } from "./club";
import { renderStationTower } from "./station";
import { renderMortarTower } from "./mortar";

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
  const zoom = cameraZoom || 1;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  screenPos.y -= isoTileDiamondHalfH(zoom);

  renderRangeReticle(ctx, {
    x: screenPos.x,
    y: screenPos.y,
    range,
    zoom,
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
  const zoom = cameraZoom || 1;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  screenPos.y -= isoTileDiamondHalfH(zoom);

  let range = tData.range;
  if (tower.level === 2) range *= LEVEL_2_RANGE_MULT;
  if (tower.level === 3) {
    if (tower.type === "library" && tower.upgrade === "B") range *= LEVEL_4_RANGE_MULT;
    else range *= LEVEL_3_RANGE_MULT;
  }
  if (tower.level >= 4 && tower.upgrade) {
    const towerStats = TOWER_STATS[tower.type];
    const upgradeRange = towerStats?.upgrades?.[tower.upgrade]?.stats?.range;
    if (upgradeRange !== undefined) {
      range = upgradeRange;
    } else {
      range = tData.range * LEVEL_4_RANGE_MULT;
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
// TOWER PREVIEW — offscreen canvas for tinted actual-tower rendering
// ============================================================================

let _previewCanvas: HTMLCanvasElement | null = null;
let _previewCtx: CanvasRenderingContext2D | null = null;
const PREVIEW_CANVAS_SIZE = 600;

function getPreviewCtx(): { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement } {
  if (!_previewCanvas) {
    _previewCanvas = document.createElement("canvas");
    _previewCanvas.width = PREVIEW_CANVAS_SIZE;
    _previewCanvas.height = PREVIEW_CANVAS_SIZE;
    _previewCtx = _previewCanvas.getContext("2d")!;
  }
  _previewCtx!.clearRect(0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE);
  return { ctx: _previewCtx!, canvas: _previewCanvas };
}

function renderTowerOnCtx(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  type: TowerType,
  zoom: number,
  time: number,
): void {
  const tower: Tower = {
    id: "__preview__",
    type,
    pos: { x: 0, y: 0 },
    level: 1,
    lastAttack: 0,
    rotation: type === "cannon" ? Math.PI * 0.75 : type === "mortar" ? -Math.PI * 0.5 : 0,
  };
  const colors = TOWER_COLORS[type];

  switch (type) {
    case "cannon":
      renderCannonTower(ctx, screenPos, tower, zoom, time, colors, [], "", 0, 0, 1);
      break;
    case "library":
      renderLibraryTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "lab":
      renderLabTower(ctx, screenPos, tower, zoom, time, colors, [], "", 0, 0, 1);
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
  screenPos.y -= isoTileDiamondHalfH(zoom);

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

  // Render the actual tower model onto an offscreen canvas, then tint it
  const { ctx: tCtx, canvas: tCanvas } = getPreviewCtx();
  const center = PREVIEW_CANVAS_SIZE / 2;
  const time = Date.now() / 1000;

  renderTowerOnCtx(tCtx, { x: center, y: center }, dragging.type as TowerType, zoom, time);

  // Tint the entire drawn content green or red
  tCtx.globalCompositeOperation = "source-atop";
  tCtx.fillStyle = isValid ? "rgba(0, 220, 0, 0.3)" : "rgba(220, 0, 0, 0.3)";
  tCtx.fillRect(0, 0, PREVIEW_CANVAS_SIZE, PREVIEW_CANVAS_SIZE);
  tCtx.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.drawImage(tCanvas, screenPos.x - center, screenPos.y - center);
  ctx.restore();

  // Range preview - show level 1 base range when placing
  if (getGameSettings().ui.showTowerRadii) {
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
