// Princeton Tower Defense - Tower Rendering Module
// Main entry point for all tower rendering functions

import type { Tower, Enemy, Position, DraggingTower } from "../../types";
import { TOWER_DATA, TOWER_COLORS, TILE_SIZE } from "../../constants";
import { gridToWorld, worldToScreen, isValidBuildPosition } from "../../utils";
import { lightenColor, darkenColor, colorWithAlpha, drawRangeIndicator } from "../helpers";

// Re-export individual tower renderers (when implemented as separate files)
// export { renderCannonTower } from "./cannonTower";
// export { renderLibraryTower } from "./libraryTower";
// export { renderLabTower } from "./labTower";
// export { renderArchTower } from "./archTower";
// export { renderClubTower } from "./clubTower";
// export { renderStationTower } from "./stationTower";

// ============================================================================
// MAIN TOWER RENDER FUNCTION
// ============================================================================

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
): void {
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const isHovered = hoveredTower === tower.id;
  const isSelected = selectedTower === tower.id;
  const colors = TOWER_COLORS[tower.type];

  // Draw passive effects first (behind tower)
  drawTowerPassiveEffects(ctx, screenPos, tower, zoom, time, colors);

  // Selection/hover glow
  if (isSelected || isHovered) {
    drawSelectionGlow(ctx, screenPos, zoom, isSelected);
  }

  // Determine target for weapon aiming
  const target = tower.targetId
    ? enemies.find((e) => e.id === tower.targetId)
    : null;

  // Draw tower base
  drawTowerBase(ctx, screenPos, tower, zoom, time, colors);

  // Draw tower type-specific rendering
  switch (tower.type) {
    case "cannon":
      renderCannonTowerInternal(ctx, screenPos, tower, zoom, time, colors, target, enemies);
      break;
    case "library":
      renderLibraryTowerInternal(ctx, screenPos, tower, zoom, time, colors, target);
      break;
    case "lab":
      renderLabTowerInternal(ctx, screenPos, tower, zoom, time, colors, target, enemies);
      break;
    case "arch":
      renderArchTowerInternal(ctx, screenPos, tower, zoom, time, colors, target, enemies);
      break;
    case "club":
      renderClubTowerInternal(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "station":
      renderStationTowerInternal(ctx, screenPos, tower, zoom, time, colors);
      break;
  }

  // Draw buff indicator
  if (tower.isBuffed) {
    drawBuffIndicator(ctx, screenPos, tower, zoom, time);
  }

  // Draw level indicator
  drawLevelIndicator(ctx, screenPos, tower, zoom);
}

// ============================================================================
// TOWER RANGE RENDERING
// ============================================================================

export function renderTowerRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower & { isHovered?: boolean },
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const tData = TOWER_DATA[tower.type];
  if (tData.range <= 0) return;

  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;

  // Calculate effective range with level bonuses
  let range = tData.range * (tower.rangeBoost || 1);
  if (tower.level === 2) range *= 1.15;
  if (tower.level === 3) {
    if (tower.type === "library" && tower.upgrade === "B") range *= 1.5;
    else range *= 1.25;
  }

  // Use more subtle colors for hover state
  const alpha = tower.isHovered ? 0.3 : 0.5;
  const fillAlpha = tower.isHovered ? 0.05 : 0.1;

  drawRangeIndicator(ctx, screenPos.x, screenPos.y, range * 0.7, zoom, "#64c8ff", fillAlpha);
}

// ============================================================================
// TOWER PREVIEW RENDERING
// ============================================================================

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
  decorationPositions?: Set<string>
): void {
  const zoom = cameraZoom || 1;
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const offset = cameraOffset || { x: 0, y: 0 };

  // Convert screen position to grid position
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
    cameraZoom
  );

  // Check if position has a decoration
  const hasDecoration =
    decorationPositions?.has(`${gridPos.x},${gridPos.y}`) || false;

  const isValid =
    !hasDecoration &&
    isValidBuildPosition(
      gridPos,
      selectedMap,
      towers,
      gridWidth,
      gridHeight,
      40
    );

  // Draw range preview
  const tData = TOWER_DATA[dragging.type];
  if (tData.range > 0) {
    const rangeColor = isValid ? "rgba(100, 200, 255, 0.2)" : "rgba(255, 100, 100, 0.2)";
    const rangeStroke = isValid ? "rgba(100, 200, 255, 0.4)" : "rgba(255, 100, 100, 0.4)";

    ctx.fillStyle = rangeColor;
    ctx.strokeStyle = rangeStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      tData.range * zoom * 0.7,
      tData.range * zoom * 0.35,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
  }

  // Draw tower ghost
  ctx.globalAlpha = isValid ? 0.7 : 0.4;

  const colors = TOWER_COLORS[dragging.type];
  drawTowerBase(ctx, screenPos, { type: dragging.type, level: 1 } as Tower, zoom, 0, colors);

  ctx.globalAlpha = 1;

  // Draw validity indicator
  if (!isValid) {
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 15 * zoom, screenPos.y - 15 * zoom);
    ctx.lineTo(screenPos.x + 15 * zoom, screenPos.y + 15 * zoom);
    ctx.moveTo(screenPos.x + 15 * zoom, screenPos.y - 15 * zoom);
    ctx.lineTo(screenPos.x - 15 * zoom, screenPos.y + 15 * zoom);
    ctx.stroke();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function drawTowerPassiveEffects(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string }
): void {
  // Ambient glow for some tower types
  if (tower.type === "lab" || tower.type === "library") {
    const pulseAlpha = 0.1 + Math.sin(time * 2) * 0.05;
    ctx.fillStyle = colorWithAlpha(colors.accent, pulseAlpha);
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, 35 * zoom, 17 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSelectionGlow(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  zoom: number,
  isSelected: boolean
): void {
  ctx.save();
  ctx.shadowColor = isSelected ? "#c9a227" : "#ffffff";
  ctx.shadowBlur = 30 * zoom;

  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    42 * zoom,
    21 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = isSelected
    ? "rgba(255, 215, 0, 0.15)"
    : "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.restore();
}

function drawTowerBase(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string }
): void {
  // Simple placeholder base - actual implementation would be more detailed
  const baseWidth = 50 * zoom;
  const baseHeight = 15 * zoom;

  // Base platform
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 5 * zoom, baseWidth * 0.8, baseHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base edge
  ctx.strokeStyle = darkenColor(colors.secondary, 30);
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
}

function drawBuffIndicator(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number
): void {
  const buffPulse = 0.5 + Math.sin(time * 4) * 0.5;

  // Buff aura
  ctx.strokeStyle = `rgba(255, 215, 0, ${buffPulse * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([5, 5]);
  ctx.lineDashOffset = -time * 20;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, 40 * zoom, 20 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Buff sparkles
  ctx.fillStyle = `rgba(255, 215, 0, ${buffPulse})`;
  for (let i = 0; i < 3; i++) {
    const angle = time * 2 + (i / 3) * Math.PI * 2;
    const sparkleX = screenPos.x + Math.cos(angle) * 35 * zoom;
    const sparkleY = screenPos.y + Math.sin(angle) * 17 * zoom;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLevelIndicator(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number
): void {
  if (tower.level <= 1) return;

  const stars = tower.level - 1;
  const starSize = 4 * zoom;
  const startX = screenPos.x - (stars - 1) * starSize;

  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < stars; i++) {
    const starX = startX + i * starSize * 2;
    const starY = screenPos.y - 45 * zoom;

    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const angle = (j / 5) * Math.PI * 2 - Math.PI / 2;
      const radius = j % 2 === 0 ? starSize : starSize * 0.5;
      const px = starX + Math.cos(angle) * radius;
      const py = starY + Math.sin(angle) * radius;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ============================================================================
// INTERNAL TOWER TYPE RENDERERS (Simplified placeholders)
// Full implementations would be imported from individual files
// ============================================================================

function renderCannonTowerInternal(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  target: Enemy | null | undefined,
  enemies: Enemy[]
): void {
  // Cannon barrel
  const barrelLength = 30 * zoom;
  let rotation = 0;

  if (target) {
    const towerWorldPos = gridToWorld(tower.pos);
    const dx = target.x - towerWorldPos.x;
    const dy = target.y - towerWorldPos.y;
    rotation = Math.atan2(dy * 0.5, dx);
  }

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - 20 * zoom);
  ctx.rotate(rotation);

  // Barrel
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, -4 * zoom, barrelLength, 8 * zoom);

  // Barrel end
  ctx.fillStyle = darkenColor(colors.primary, 20);
  ctx.beginPath();
  ctx.arc(barrelLength, 0, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Turret base
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - 15 * zoom, 15 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

function renderLibraryTowerInternal(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  target: Enemy | null | undefined
): void {
  // Gothic tower shape
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 20 * zoom, screenPos.y);
  ctx.lineTo(screenPos.x - 15 * zoom, screenPos.y - 40 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y - 55 * zoom);
  ctx.lineTo(screenPos.x + 15 * zoom, screenPos.y - 40 * zoom);
  ctx.lineTo(screenPos.x + 20 * zoom, screenPos.y);
  ctx.closePath();
  ctx.fill();

  // Window
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - 25 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Magical glow
  const glowPulse = 0.3 + Math.sin(time * 3) * 0.2;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 15 * zoom * glowPulse;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function renderLabTowerInternal(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  target: Enemy | null | undefined,
  enemies: Enemy[]
): void {
  // Tesla coil base
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 18 * zoom, screenPos.y);
  ctx.lineTo(screenPos.x - 10 * zoom, screenPos.y - 35 * zoom);
  ctx.lineTo(screenPos.x + 10 * zoom, screenPos.y - 35 * zoom);
  ctx.lineTo(screenPos.x + 18 * zoom, screenPos.y);
  ctx.closePath();
  ctx.fill();

  // Coil sphere
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - 40 * zoom, 12 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Electric glow
  const glowPulse = 0.5 + Math.sin(time * 6) * 0.3;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 20 * zoom * glowPulse;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function renderArchTowerInternal(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string },
  target: Enemy | null | undefined,
  enemies: Enemy[]
): void {
  // Arch structure
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - 20 * zoom, 25 * zoom, Math.PI, Math.PI * 2);
  ctx.fill();

  // Pillars
  ctx.fillRect(screenPos.x - 25 * zoom, screenPos.y - 20 * zoom, 8 * zoom, 20 * zoom);
  ctx.fillRect(screenPos.x + 17 * zoom, screenPos.y - 20 * zoom, 8 * zoom, 20 * zoom);

  // Sound waves effect
  const wavePulse = (time * 2) % 1;
  ctx.strokeStyle = colorWithAlpha(colors.accent, 0.5 * (1 - wavePulse));
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - 10 * zoom, 20 * zoom * wavePulse, 0, Math.PI * 2);
  ctx.stroke();
}

function renderClubTowerInternal(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string }
): void {
  // Building structure
  ctx.fillStyle = colors.primary;
  ctx.fillRect(screenPos.x - 22 * zoom, screenPos.y - 35 * zoom, 44 * zoom, 35 * zoom);

  // Roof
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 25 * zoom, screenPos.y - 35 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y - 50 * zoom);
  ctx.lineTo(screenPos.x + 25 * zoom, screenPos.y - 35 * zoom);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = darkenColor(colors.primary, 40);
  ctx.fillRect(screenPos.x - 6 * zoom, screenPos.y - 18 * zoom, 12 * zoom, 18 * zoom);

  // Gold coin indicator
  const coinBounce = Math.abs(Math.sin(time * 3)) * 5 * zoom;
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y - 55 * zoom - coinBounce, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
}

function renderStationTowerInternal(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { primary: string; secondary: string; accent: string }
): void {
  // Station platform
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(screenPos.x - 30 * zoom, screenPos.y - 5 * zoom, 60 * zoom, 5 * zoom);

  // Station building
  ctx.fillStyle = colors.primary;
  ctx.fillRect(screenPos.x - 20 * zoom, screenPos.y - 30 * zoom, 40 * zoom, 25 * zoom);

  // Roof
  ctx.fillStyle = darkenColor(colors.primary, 20);
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 25 * zoom, screenPos.y - 30 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y - 45 * zoom);
  ctx.lineTo(screenPos.x + 25 * zoom, screenPos.y - 30 * zoom);
  ctx.closePath();
  ctx.fill();

  // Clock
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - 20 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Clock hands
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x, screenPos.y - 20 * zoom);
  ctx.lineTo(
    screenPos.x + Math.cos(time) * 4 * zoom,
    screenPos.y - 20 * zoom + Math.sin(time) * 4 * zoom
  );
  ctx.stroke();
}
