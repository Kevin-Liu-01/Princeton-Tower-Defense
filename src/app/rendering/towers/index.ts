// Princeton Tower Defense - Tower Rendering Module
// Main entry point for all tower rendering functions

import type { Tower, Enemy, Position, DraggingTower } from "../../types";
import { TOWER_DATA, TOWER_COLORS, TILE_SIZE } from "../../constants";
import { TOWER_STATS } from "../../constants/towerStats";
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
  let range = tData.range;
  if (tower.level === 2) range *= 1.15;
  if (tower.level === 3) {
    if (tower.type === "library" && tower.upgrade === "B") range *= 1.5;
    else range *= 1.25;
  }
  // Level 4 uses the range from TOWER_STATS upgrade paths
  if (tower.level >= 4 && tower.upgrade) {
    const towerStats = TOWER_STATS[tower.type];
    const upgradeRange = towerStats?.upgrades?.[tower.upgrade]?.stats?.range;
    if (upgradeRange !== undefined) {
      range = upgradeRange;
    } else {
      // Fallback: 1.5x base range if no specific range defined
      range = tData.range * 1.5;
    }
  }
  // Apply external range buff (from beacons etc)
  range *= (tower.rangeBoost || 1);

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
  const hasRangeBoost = (tower.rangeBoost || 1) > 1;
  const hasDamageBoost = (tower.damageBoost || 1) > 1;
  const hasBothBoosts = hasRangeBoost && hasDamageBoost;

  // Determine buff colors based on type
  // Range = Blue, Damage = Red/Orange, Both = Gold
  let primaryColor: string;
  let secondaryColor: string;
  let glowColor: string;
  let buffIcon: string;

  if (hasBothBoosts) {
    primaryColor = "255, 215, 0"; // Gold
    secondaryColor = "255, 180, 0";
    glowColor = "#ffd700";
    buffIcon = "⚡";
  } else if (hasRangeBoost) {
    primaryColor = "100, 200, 255"; // Blue
    secondaryColor = "50, 150, 255";
    glowColor = "#64c8ff";
    buffIcon = "◎";
  } else if (hasDamageBoost) {
    primaryColor = "255, 100, 100"; // Red/Orange
    secondaryColor = "255, 150, 50";
    glowColor = "#ff6464";
    buffIcon = "🗡";
  } else {
    primaryColor = "255, 215, 0"; // Fallback gold
    secondaryColor = "255, 180, 0";
    glowColor = "#ffd700";
    buffIcon = "✦";
  }

  ctx.save();

  // Outer glow aura (much more visible)
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20 * zoom * buffPulse;
  ctx.strokeStyle = `rgba(${primaryColor}, ${0.4 + buffPulse * 0.4})`;
  ctx.lineWidth = 3 * zoom;
  ctx.setLineDash([8, 4]);
  ctx.lineDashOffset = -time * 30;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, 45 * zoom, 22 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner pulsing ring
  const innerPulse = 0.7 + Math.sin(time * 6) * 0.3;
  ctx.strokeStyle = `rgba(${secondaryColor}, ${innerPulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, 38 * zoom, 19 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Buff sparkles - more particles, rotating faster
  const sparkleCount = hasBothBoosts ? 6 : 4;
  for (let i = 0; i < sparkleCount; i++) {
    const angle = time * 2.5 + (i / sparkleCount) * Math.PI * 2;
    const sparkleX = screenPos.x + Math.cos(angle) * 40 * zoom;
    const sparkleY = screenPos.y + Math.sin(angle) * 20 * zoom;
    const sparkleSize = (3 + Math.sin(time * 5 + i) * 1) * zoom;
    
    // Sparkle glow
    ctx.fillStyle = `rgba(${primaryColor}, ${buffPulse * 0.8})`;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rising particles effect
  for (let i = 0; i < 3; i++) {
    const riseProgress = ((time * 0.8 + i * 0.3) % 1);
    const riseY = screenPos.y - riseProgress * 35 * zoom;
    const riseAlpha = (1 - riseProgress) * 0.6 * buffPulse;
    const riseX = screenPos.x + Math.sin(time * 3 + i * 2) * 12 * zoom;
    
    ctx.fillStyle = `rgba(${primaryColor}, ${riseAlpha})`;
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(riseX, riseY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.setLineDash([]);

  // Buff icon at bottom of aura ring
  const iconY = screenPos.y + 24 * zoom; // Bottom of the elliptical aura
  
  // Glowing icon background circle
  ctx.fillStyle = `rgba(0, 0, 0, 0.6)`;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10 * zoom * buffPulse;
  ctx.beginPath();
  ctx.arc(screenPos.x, iconY, 9 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Icon border
  ctx.strokeStyle = `rgba(${primaryColor}, ${0.7 + buffPulse * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Buff icon
  ctx.shadowBlur = 6 * zoom * buffPulse;
  ctx.fillStyle = `rgba(${primaryColor}, 1)`;
  ctx.font = `bold ${10 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(buffIcon, screenPos.x, iconY);

  ctx.restore();
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
  const level = tower.level;
  const baseWidth = 36 + level * 3;
  const towerHeight = 40 + level * 12;
  
  // === FOUNDATION PLATFORM ===
  // Multi-layer tech platform
  ctx.fillStyle = "#1a2a3a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 6 * zoom, (baseWidth + 10) * zoom * 0.5, (baseWidth + 10) * zoom * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#2a3a4a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 3 * zoom, (baseWidth + 4) * zoom * 0.5, (baseWidth + 4) * zoom * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Platform edge glow
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // === MAIN HOUSING STRUCTURE ===
  // Tapered tech housing with panels
  const housingBottom = screenPos.y;
  const housingTop = screenPos.y - towerHeight * zoom * 0.5;
  
  // Back panel
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 16 * zoom, housingBottom);
  ctx.lineTo(screenPos.x - 12 * zoom, housingTop);
  ctx.lineTo(screenPos.x + 12 * zoom, housingTop);
  ctx.lineTo(screenPos.x + 16 * zoom, housingBottom);
  ctx.closePath();
  ctx.fill();
  
  // Front panel (lighter)
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 14 * zoom, housingBottom - 2 * zoom);
  ctx.lineTo(screenPos.x - 10 * zoom, housingTop + 2 * zoom);
  ctx.lineTo(screenPos.x + 10 * zoom, housingTop + 2 * zoom);
  ctx.lineTo(screenPos.x + 14 * zoom, housingBottom - 2 * zoom);
  ctx.closePath();
  ctx.fill();
  
  // Panel lines (tech detailing)
  ctx.strokeStyle = "#0a1a2a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x, housingBottom - 2 * zoom);
  ctx.lineTo(screenPos.x, housingTop + 2 * zoom);
  ctx.stroke();
  
  // Status lights on housing
  const lightColors = ["#00ff00", "#ffff00", "#00ffff"];
  for (let i = 0; i < 3; i++) {
    const lightY = housingBottom - 8 * zoom - i * 6 * zoom;
    const lightPulse = Math.sin(time * 4 + i * 1.5) > 0 ? 1 : 0.3;
    ctx.fillStyle = colorWithAlpha(lightColors[i], lightPulse);
    ctx.beginPath();
    ctx.arc(screenPos.x - 8 * zoom, lightY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screenPos.x + 8 * zoom, lightY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === CAPACITOR BANKS (Level 2+) ===
  if (level >= 2) {
    const capColors = ["#3a5a7a", "#4a6a8a"];
    // Left capacitor bank
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = capColors[i % 2];
      const capX = screenPos.x - 22 * zoom;
      const capY = screenPos.y - 5 * zoom - i * 8 * zoom;
      ctx.fillRect(capX - 4 * zoom, capY - 6 * zoom, 8 * zoom, 6 * zoom);
      
      // Capacitor glow ring
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.4 + Math.sin(time * 3 + i) * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(capX, capY - 3 * zoom, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Right capacitor bank
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = capColors[i % 2];
      const capX = screenPos.x + 22 * zoom;
      const capY = screenPos.y - 5 * zoom - i * 8 * zoom;
      ctx.fillRect(capX - 4 * zoom, capY - 6 * zoom, 8 * zoom, 6 * zoom);
      
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.4 + Math.sin(time * 3 + i + 1) * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(capX, capY - 3 * zoom, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Wiring from capacitors to main housing
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 18 * zoom, screenPos.y - 15 * zoom);
    ctx.quadraticCurveTo(screenPos.x - 16 * zoom, screenPos.y - 20 * zoom, screenPos.x - 14 * zoom, screenPos.y - 15 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + 18 * zoom, screenPos.y - 15 * zoom);
    ctx.quadraticCurveTo(screenPos.x + 16 * zoom, screenPos.y - 20 * zoom, screenPos.x + 14 * zoom, screenPos.y - 15 * zoom);
    ctx.stroke();
    
    // Blue power cables
    ctx.strokeStyle = "#0066ff";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 18 * zoom, screenPos.y - 8 * zoom);
    ctx.quadraticCurveTo(screenPos.x - 16 * zoom, screenPos.y - 12 * zoom, screenPos.x - 14 * zoom, screenPos.y - 8 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + 18 * zoom, screenPos.y - 8 * zoom);
    ctx.quadraticCurveTo(screenPos.x + 16 * zoom, screenPos.y - 12 * zoom, screenPos.x + 14 * zoom, screenPos.y - 8 * zoom);
    ctx.stroke();
  }

  // === SCAFFOLDING & SUPPORT STRUCTURE (Level 2+) ===
  if (level >= 2) {
    ctx.strokeStyle = "#5a6a7a";
    ctx.lineWidth = 2 * zoom;
    
    // Vertical support struts
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 20 * zoom, screenPos.y + 3 * zoom);
    ctx.lineTo(screenPos.x - 16 * zoom, screenPos.y - 30 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + 20 * zoom, screenPos.y + 3 * zoom);
    ctx.lineTo(screenPos.x + 16 * zoom, screenPos.y - 30 * zoom);
    ctx.stroke();
    
    // Cross bracing
    ctx.strokeStyle = "#4a5a6a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 19 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x + 17 * zoom, screenPos.y - 25 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + 19 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x - 17 * zoom, screenPos.y - 25 * zoom);
    ctx.stroke();
    
    // Horizontal support rings
    ctx.strokeStyle = "#6a7a8a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - 15 * zoom, 18 * zoom, 6 * zoom, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // === LEVEL 3+ ADVANCED EQUIPMENT ===
  if (level >= 3) {
    // Secondary coil towers on sides
    const sideCoilHeight = 25 * zoom;
    const sideCoilX = [-25, 25];
    
    for (const offsetX of sideCoilX) {
      const coilX = screenPos.x + offsetX * zoom;
      const coilBaseY = screenPos.y - 5 * zoom;
      
      // Mini coil housing
      ctx.fillStyle = "#3a4a5a";
      ctx.beginPath();
      ctx.moveTo(coilX - 5 * zoom, coilBaseY);
      ctx.lineTo(coilX - 3 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 3 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 5 * zoom, coilBaseY);
      ctx.closePath();
      ctx.fill();
      
      // Mini coil orb
      const miniOrbPulse = 0.5 + Math.sin(time * 5 + offsetX) * 0.3;
      ctx.fillStyle = `rgba(0, 200, 255, ${miniOrbPulse})`;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(coilX, coilBaseY - sideCoilHeight - 4 * zoom, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Energy arc to main coil
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(time * 8 + offsetX) * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(coilX, coilBaseY - sideCoilHeight - 4 * zoom);
      const midX = screenPos.x + offsetX * 0.3 * zoom;
      const midY = screenPos.y - towerHeight * zoom * 0.6;
      ctx.quadraticCurveTo(midX, midY, screenPos.x, screenPos.y - towerHeight * zoom * 0.7);
      ctx.stroke();
    }
    
    // Plasma conduits on the ground
    ctx.strokeStyle = `rgba(0, 255, 200, ${0.4 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([3 * zoom, 3 * zoom]);
    ctx.lineDashOffset = -time * 20;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 30 * zoom, screenPos.y + 5 * zoom);
    ctx.lineTo(screenPos.x - 20 * zoom, screenPos.y + 3 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + 30 * zoom, screenPos.y + 5 * zoom);
    ctx.lineTo(screenPos.x + 20 * zoom, screenPos.y + 3 * zoom);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Extra wiring network
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      const wireY = screenPos.y - 10 * zoom - i * 10 * zoom;
      const sag = Math.sin(time * 2 + i) * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 25 * zoom, wireY);
      ctx.quadraticCurveTo(screenPos.x - 20 * zoom, wireY + sag, screenPos.x - 15 * zoom, wireY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 25 * zoom, wireY);
      ctx.quadraticCurveTo(screenPos.x + 20 * zoom, wireY + sag, screenPos.x + 15 * zoom, wireY);
      ctx.stroke();
    }
    
    // Control panel on front
    ctx.fillStyle = "#1a1a2a";
    ctx.fillRect(screenPos.x - 6 * zoom, screenPos.y - 12 * zoom, 12 * zoom, 8 * zoom);
    
    // Screen on control panel
    const screenGlow = 0.6 + Math.sin(time * 4) * 0.2;
    ctx.fillStyle = `rgba(0, 255, 128, ${screenGlow})`;
    ctx.fillRect(screenPos.x - 4 * zoom, screenPos.y - 10 * zoom, 8 * zoom, 4 * zoom);
    
    // Blinking data on screen
    ctx.fillStyle = "#00ff00";
    for (let i = 0; i < 4; i++) {
      if (Math.sin(time * 10 + i * 2) > 0) {
        ctx.fillRect(screenPos.x - 3 * zoom + i * 2 * zoom, screenPos.y - 9 * zoom, 1 * zoom, 2 * zoom);
      }
    }
  }

  // === MAIN TESLA COIL ===
  const coilBaseY = screenPos.y - towerHeight * zoom * 0.45;
  const coilHeight = (30 + level * 10) * zoom;
  const coilTopY = coilBaseY - coilHeight;
  
  // Coil mounting ring
  ctx.fillStyle = "#4a5a6a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, coilBaseY, 10 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#00ccff";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  
  // Coil core (central pillar)
  const coreGrad = ctx.createLinearGradient(screenPos.x - 4 * zoom, coilBaseY, screenPos.x + 4 * zoom, coilBaseY);
  coreGrad.addColorStop(0, "#2a3a4a");
  coreGrad.addColorStop(0.5, "#4a6a8a");
  coreGrad.addColorStop(1, "#2a3a4a");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 5 * zoom, coilBaseY);
  ctx.lineTo(screenPos.x - 3 * zoom, coilTopY + 8 * zoom);
  ctx.lineTo(screenPos.x + 3 * zoom, coilTopY + 8 * zoom);
  ctx.lineTo(screenPos.x + 5 * zoom, coilBaseY);
  ctx.closePath();
  ctx.fill();

  // === IMPROVED COPPER COIL WINDINGS ===
  const coilTurns = 8 + level * 3;
  const coilSegmentHeight = coilHeight / coilTurns;
  
  for (let i = 0; i < coilTurns; i++) {
    const t = i / coilTurns;
    const y = coilBaseY - t * coilHeight;
    const coilWidth = (8 - t * 3) * zoom;
    const coilDepth = coilWidth * 0.4;
    
    // Animated coil energy
    const energyPhase = time * 3 + i * 0.4;
    const energyPulse = 0.3 + Math.sin(energyPhase) * 0.3;
    
    // Copper coil base color
    ctx.fillStyle = "#cd7f32";
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 0.5 * zoom;
    
    // Draw coil as 3D torus segment
    ctx.beginPath();
    ctx.ellipse(screenPos.x, y, coilWidth, coilDepth, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Coil highlight
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.4 + energyPulse * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, y, coilWidth * 0.9, coilDepth * 0.9, 0, Math.PI * 0.8, Math.PI * 1.2);
    ctx.stroke();
    
    // Energy glow between coils
    if (i > 0 && i % 2 === 0) {
      ctx.fillStyle = `rgba(0, 200, 255, ${energyPulse * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, y + coilSegmentHeight * 0.5, coilWidth * 0.6, coilDepth * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === ENERGY ORB AT TOP ===
  const orbRadius = (8 + level * 2) * zoom;
  const orbPulse = 0.6 + Math.sin(time * 4) * 0.4;
  const orbY = coilTopY;
  
  // Outer energy field
  ctx.fillStyle = `rgba(0, 100, 200, ${orbPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbRadius * 1.8, 0, Math.PI * 2);
  ctx.fill();
  
  // Main orb glow
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 25 * zoom * orbPulse;
  
  // Orb gradient
  const orbGrad = ctx.createRadialGradient(
    screenPos.x - 2 * zoom, orbY - 2 * zoom, 0,
    screenPos.x, orbY, orbRadius
  );
  orbGrad.addColorStop(0, "#ffffff");
  orbGrad.addColorStop(0.2, "#ccffff");
  orbGrad.addColorStop(0.5, "#00ffff");
  orbGrad.addColorStop(0.8, "#0088ff");
  orbGrad.addColorStop(1, "#004488");
  
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner core highlight
  ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + orbPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(screenPos.x - 2 * zoom, orbY - 2 * zoom, orbRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;

  // === ELECTRIC ARCS FROM ORB ===
  const arcCount = 4 + level;
  ctx.strokeStyle = `rgba(0, 255, 255, ${orbPulse * 0.8})`;
  ctx.lineWidth = 1.5 * zoom;
  
  for (let i = 0; i < arcCount; i++) {
    const arcAngle = (i / arcCount) * Math.PI * 2 + time * 3;
    const arcLength = (15 + level * 5 + Math.sin(time * 8 + i) * 8) * zoom;
    const endX = screenPos.x + Math.cos(arcAngle) * arcLength;
    const endY = orbY + Math.sin(arcAngle) * arcLength * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(screenPos.x, orbY);
    
    // Jagged lightning path with more segments for higher levels
    const segments = 3 + level;
    let prevX = screenPos.x;
    let prevY = orbY;
    
    for (let s = 1; s <= segments; s++) {
      const progress = s / segments;
      const targetX = screenPos.x + (endX - screenPos.x) * progress;
      const targetY = orbY + (endY - orbY) * progress;
      const jitter = (1 - progress) * 8 * zoom;
      const x = targetX + (Math.sin(time * 20 + i * 7 + s * 3) * jitter);
      const y = targetY + (Math.cos(time * 15 + i * 5 + s * 2) * jitter * 0.5);
      ctx.lineTo(x, y);
      prevX = x;
      prevY = y;
    }
    ctx.stroke();
    
    // Arc endpoint spark
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 12 + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(prevX, prevY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === LEVEL 3+ PLASMA FIELD EFFECT ===
  if (level >= 3) {
    // Rotating energy rings around orb
    for (let ring = 0; ring < 2; ring++) {
      const ringAngle = time * 2 + ring * Math.PI;
      const ringRadius = orbRadius * (1.4 + ring * 0.3);
      const ringAlpha = 0.3 + Math.sin(time * 4 + ring) * 0.2;
      
      ctx.strokeStyle = `rgba(0, 255, 200, ${ringAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        orbY,
        ringRadius,
        ringRadius * 0.3,
        ringAngle,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    // Particle sparks
    for (let p = 0; p < 6; p++) {
      const particleAngle = time * 4 + p * (Math.PI * 2 / 6);
      const particleDist = orbRadius * 1.5 + Math.sin(time * 6 + p) * 5 * zoom;
      const px = screenPos.x + Math.cos(particleAngle) * particleDist;
      const py = orbY + Math.sin(particleAngle) * particleDist * 0.4;
      
      ctx.fillStyle = `rgba(200, 255, 255, ${0.4 + Math.sin(time * 10 + p) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LEVEL 4 UPGRADE EFFECTS ===
  if (tower.level === 4) {
    if (tower.upgrade === "A") {
      // Focused beam - targeting laser sight
      ctx.strokeStyle = `rgba(255, 0, 0, ${0.4 + Math.sin(time * 6) * 0.2})`;
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -time * 30;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, orbY);
      const beamLength = 120 * zoom;
      ctx.lineTo(
        screenPos.x + Math.cos(tower.rotation || 0) * beamLength,
        orbY + Math.sin(tower.rotation || 0) * beamLength * 0.5
      );
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Beam source intensifier
      ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(time * 8) * 0.3})`;
      ctx.beginPath();
      ctx.arc(screenPos.x, orbY, orbRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (tower.upgrade === "B") {
      // Chain lightning - orbiting sub-orbs
      for (let i = 0; i < 4; i++) {
        const subOrbAngle = (i / 4) * Math.PI * 2 + time * 3;
        const subOrbDist = 18 * zoom;
        const subX = screenPos.x + Math.cos(subOrbAngle) * subOrbDist;
        const subY = orbY + Math.sin(subOrbAngle) * subOrbDist * 0.4;
        
        // Sub-orb glow
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10 * zoom;
        ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 5 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(subX, subY, 4 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Connection arc to main orb
        ctx.strokeStyle = `rgba(0, 200, 255, ${0.4 + Math.sin(time * 7 + i) * 0.2})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, orbY);
        ctx.lineTo(subX, subY);
        ctx.stroke();
      }
    }
  }
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
