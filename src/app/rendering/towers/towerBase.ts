// Princeton Tower Defense - Tower Base Rendering
// Shared tower rendering functions and base components

import type { Tower, Enemy, Position, TowerColors } from "../../types";
import { TOWER_COLORS } from "../../constants/towerStats";
import { gridToWorld, worldToScreen } from "../../utils";
import {
  drawIsometricPrism,
  drawSelectionIndicator,
  drawStar,
  lightenColor,
  darkenColor,
  drawSteamVent,
  drawEnergyTube,
} from "../helpers";

// Import individual tower renderers
import { renderCannonTower } from "./cannonTower";
import { renderLibraryTower } from "./libraryTower";
import { renderLabTower } from "./labTower";
import { renderArchTower } from "./archTower";
import { renderClubTower } from "./clubTower";
import { renderStationTower } from "./stationTower";

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
    drawSelectionIndicator(ctx, screenPos.x, screenPos.y, 42, zoom, isSelected, time);
  }

  // Enhanced shadow
  const shadowGrad = ctx.createRadialGradient(
    screenPos.x,
    screenPos.y + 8 * zoom,
    0,
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom
  );
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.2)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 8 * zoom, 32 * zoom, 16 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Render specific tower type
  switch (tower.type) {
    case "cannon":
      renderCannonTower(ctx, screenPos, tower, zoom, time, colors, enemies, selectedMap, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
      break;
    case "library":
      renderLibraryTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "lab":
      renderLabTower(ctx, screenPos, tower, zoom, time, colors, enemies, selectedMap, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
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
  }

  // Level indicator
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

  // Upgrade path badge
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

  // Buff indicator
  if (tower.isBuffed) {
    const buffY = screenPos.y - 50 * zoom;
    const pulse = 0.7 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, buffY, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
  }
}

// ============================================================================
// TOWER BASE COMPONENTS
// ============================================================================

/**
 * Draw standard tower base platform
 */
export function drawTowerBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseWidth: number,
  baseHeight: number,
  colors: TowerColors,
  zoom: number
): void {
  drawIsometricPrism(
    ctx,
    x,
    y + 8 * zoom,
    baseWidth + 8,
    baseWidth + 8,
    6,
    {
      top: darkenColor(colors.base, 30),
      left: darkenColor(colors.base, 50),
      right: darkenColor(colors.base, 40),
      leftBack: darkenColor(colors.base, 20),
      rightBack: darkenColor(colors.base, 25),
    },
    zoom
  );

  drawIsometricPrism(
    ctx,
    x,
    y + 2 * zoom,
    baseWidth,
    baseWidth,
    baseHeight,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
      leftBack: lightenColor(colors.base, 15),
      rightBack: lightenColor(colors.dark, 10),
    },
    zoom
  );
}

/**
 * Draw mechanical tower base with tech details
 */
export function drawMechanicalTowerBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: TowerColors,
  zoom: number,
  time: number,
  level: number
): void {
  // Foundation platform
  drawIsometricPrism(
    ctx,
    x,
    y + 10 * zoom,
    width + 12,
    width + 12,
    6,
    {
      top: "#3a3a42",
      left: "#2a2a32",
      right: "#252530",
      leftBack: "#32323a",
      rightBack: "#2d2d35",
    },
    zoom
  );

  // Main tower body
  drawIsometricPrism(
    ctx,
    x,
    y + 4 * zoom,
    width,
    width,
    height - 8,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
      leftBack: lightenColor(colors.base, 10),
      rightBack: lightenColor(colors.dark, 5),
    },
    zoom
  );

  // Tech layer on top
  drawIsometricPrism(
    ctx,
    x,
    y - (height - 12) * zoom,
    width - 4,
    width - 4,
    8,
    {
      top: lightenColor(colors.base, 15),
      left: colors.base,
      right: colors.dark,
      leftBack: colors.light,
      rightBack: lightenColor(colors.dark, 8),
    },
    zoom
  );

  const w = width * zoom * 0.5;

  // Steam vents
  drawSteamVent(ctx, x - w * 0.75, y - height * zoom * 0.1, time, 0.8 + level * 0.2, zoom);
  if (level >= 2) {
    drawSteamVent(ctx, x + w * 0.7, y - height * zoom * 0.15, time + 0.5, 0.6 + level * 0.15, zoom);
  }

  // Energy tubes
  drawEnergyTube(
    ctx,
    x - w * 0.4,
    y,
    x - w * 0.2,
    y - height * zoom * 0.6,
    2,
    time,
    zoom,
    "rgb(255, 102, 0)"
  );

  if (level >= 3) {
    drawEnergyTube(
      ctx,
      x + w * 0.45,
      y - 4 * zoom,
      x + w * 0.45,
      y - height * zoom * 0.55,
      2.5,
      time + 0.3,
      zoom,
      "rgb(255, 80, 0)"
    );
  }
}

/**
 * Draw tower passive effects (ambient particles, energy rings)
 */
function drawTowerPassiveEffects(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  // Add ambient particles floating around all towers
  const particleCount = 3 + tower.level;
  for (let i = 0; i < particleCount; i++) {
    const angle = time * (0.5 + i * 0.1) + i * ((Math.PI * 2) / particleCount);
    const radius = (25 + Math.sin(time * 2 + i) * 5) * zoom;
    const px = screenPos.x + Math.cos(angle) * radius;
    const py = screenPos.y - 30 * zoom + Math.sin(angle * 0.5) * radius * 0.3;
    const particleAlpha = 0.3 + Math.sin(time * 3 + i) * 0.2;
    const particleSize = (2 + Math.sin(time * 4 + i) * 1) * zoom;

    ctx.fillStyle = `rgba(255, 255, 255, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle energy ring at base (except for station)
  if (tower.type !== "station") {
    const ringPulse = 1 + Math.sin(time * 2) * 0.1;
    const rgb = hexToRgbValues(colors.accent);
    ctx.strokeStyle = `rgba(${rgb}, ${0.15 + Math.sin(time * 3) * 0.1})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 5 * zoom,
      30 * zoom * ringPulse,
      15 * zoom * ringPulse,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

// Helper to convert hex to rgb values
function hexToRgbValues(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return "255, 255, 255";
}

// ============================================================================
// TOWER RANGE RENDERING
// ============================================================================

export function renderTowerRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
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

  // Get tower range with any boosts
  const { getTowerRange } = require("../../constants/towerStats");
  const range = getTowerRange(tower.type, tower.level, tower.upgrade, tower.rangeBoost || 1.0);

  // Draw range circle
  const rangeRadius = range * zoom * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = tower.isBuffed ? "#ffd700" : "#4a90d9";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, rangeRadius, rangeRadius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = tower.isBuffed ? "#ffd700" : "#4a90d9";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  ctx.restore();
}

export function renderStationRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
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

  const spawnRange = tower.spawnRange || 220;
  const rangeRadius = spawnRange * zoom * 0.5;

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, rangeRadius, rangeRadius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([8, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ============================================================================
// TOWER PREVIEW RENDERING
// ============================================================================

export function renderTowerPreview(
  ctx: CanvasRenderingContext2D,
  type: string,
  pos: Position,
  isValid: boolean,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;

  ctx.save();
  ctx.globalAlpha = 0.7;

  // Draw placement indicator
  const indicatorColor = isValid ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)";
  const borderColor = isValid ? "#22c55e" : "#ef4444";

  // Pulsing ring
  const pulse = 1 + Math.sin(time * 4) * 0.1;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 5 * zoom, 35 * zoom * pulse, 17.5 * zoom * pulse, 0, 0, Math.PI * 2);
  ctx.fillStyle = indicatorColor;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Tower icon
  const colors = TOWER_COLORS[type as keyof typeof TOWER_COLORS] || TOWER_COLORS.cannon;
  ctx.fillStyle = colors.base;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - 15 * zoom, 12 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.dark;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  ctx.restore();
}
