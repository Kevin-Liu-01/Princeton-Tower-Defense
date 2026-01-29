// Princeton Tower Defense - UI Rendering Module
// Renders game UI elements like health bars, resource displays, etc.

import type { Position, Tower, Hero } from "../../types";
import { worldToScreen, gridToWorld } from "../../utils";
import { drawHealthBar, drawOutlinedText, drawFloatingText, colorWithAlpha } from "../helpers";
import { HERO_DATA } from "../../constants";

// ============================================================================
// FLOATING DAMAGE TEXT
// ============================================================================

export interface FloatingText {
  id: string;
  pos: Position;
  text: string;
  color: string;
  progress: number;
  duration: number;
}

export function renderFloatingText(
  ctx: CanvasRenderingContext2D,
  floatingText: FloatingText,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    floatingText.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;

  drawFloatingText(
    ctx,
    floatingText.text,
    screenPos.x,
    screenPos.y,
    floatingText.progress,
    floatingText.color,
    16 * zoom
  );
}

// ============================================================================
// WAVE INDICATOR
// ============================================================================

export function renderWaveIndicator(
  ctx: CanvasRenderingContext2D,
  currentWave: number,
  totalWaves: number,
  waveProgress: number,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number
): void {
  const width = canvasWidth / dpr;
  const barWidth = 200;
  const barHeight = 8;
  const x = (width - barWidth) / 2;
  const y = 20;

  ctx.save();

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x, y, barWidth, barHeight);

  // Progress
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(x, y, barWidth * waveProgress, barHeight);

  // Border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barWidth, barHeight);

  // Wave text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`Wave ${currentWave}/${totalWaves}`, width / 2, y + barHeight + 15);

  ctx.restore();
}

// ============================================================================
// RESOURCE DISPLAY
// ============================================================================

export function renderResourceDisplay(
  ctx: CanvasRenderingContext2D,
  gold: number,
  lives: number,
  x: number,
  y: number,
  zoom: number = 1
): void {
  ctx.save();

  // Gold
  ctx.fillStyle = "#c9a227";
  ctx.font = `bold ${16 * zoom}px Arial`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`💰 ${gold}`, x, y);

  // Lives
  ctx.fillStyle = "#ef4444";
  ctx.fillText(`❤️ ${lives}`, x, y + 25 * zoom);

  ctx.restore();
}

// ============================================================================
// TOWER SELECTION UI
// ============================================================================

export function renderTowerSelectionUI(
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
  const time = Date.now() / 1000;

  ctx.save();

  // Pulsing selection ring
  const pulse = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
  ctx.lineWidth = 3 * zoom;
  ctx.setLineDash([8, 4]);
  ctx.lineDashOffset = -time * 30;

  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    45 * zoom,
    22 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

// ============================================================================
// HERO SELECTION UI
// ============================================================================

export function renderHeroSelectionUI(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    hero.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const hData = HERO_DATA[hero.type];

  ctx.save();

  // Hero selection indicator - uses hero's theme color
  const pulse = 0.6 + Math.sin(time * 3) * 0.4;
  ctx.strokeStyle = colorWithAlpha(hData.color, pulse);
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([6, 3]);
  ctx.lineDashOffset = -time * 20;

  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    35 * zoom,
    17 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.setLineDash([]);

  // Move indicator arrow if hero has target
  if (hero.targetPos) {
    const targetScreen = worldToScreen(
      hero.targetPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
    );

    ctx.strokeStyle = colorWithAlpha(hData.color, pulse * 0.5);
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(targetScreen.x, targetScreen.y);
    ctx.stroke();

    // Arrow head - uses hero's theme color
    ctx.setLineDash([]);
    ctx.fillStyle = colorWithAlpha(hData.color, pulse);
    const angle = Math.atan2(targetScreen.y - screenPos.y, targetScreen.x - screenPos.x);
    ctx.beginPath();
    ctx.moveTo(targetScreen.x, targetScreen.y);
    ctx.lineTo(
      targetScreen.x - Math.cos(angle - 0.3) * 10 * zoom,
      targetScreen.y - Math.sin(angle - 0.3) * 10 * zoom
    );
    ctx.lineTo(
      targetScreen.x - Math.cos(angle + 0.3) * 10 * zoom,
      targetScreen.y - Math.sin(angle + 0.3) * 10 * zoom
    );
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// PAUSE/SPEED OVERLAY
// ============================================================================

export function renderPauseOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number
): void {
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;

  ctx.save();

  // Dim background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, width, height);

  // Pause icon
  const iconSize = 60;
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(centerX - iconSize / 2 - 10, centerY - iconSize / 2, 15, iconSize);
  ctx.fillRect(centerX + iconSize / 2 - 5, centerY - iconSize / 2, 15, iconSize);

  // Pause text
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAUSED", centerX, centerY + iconSize / 2 + 30);

  ctx.restore();
}

export function renderSpeedIndicator(
  ctx: CanvasRenderingContext2D,
  speed: number,
  x: number,
  y: number,
  zoom: number = 1
): void {
  if (speed === 1) return;

  ctx.save();

  ctx.fillStyle = speed > 1 ? "#22c55e" : "#eab308";
  ctx.font = `bold ${14 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${speed}x`, x, y);

  ctx.restore();
}

// ============================================================================
// TOOLTIP RENDERING
// ============================================================================

export function renderTooltip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number = 200
): void {
  ctx.save();

  // Measure text
  ctx.font = "14px Arial";
  const lines = wrapText(ctx, text, maxWidth - 20);
  const lineHeight = 18;
  const padding = 10;
  const boxWidth = maxWidth;
  const boxHeight = lines.length * lineHeight + padding * 2;

  // Adjust position to stay on screen
  const adjustedX = Math.min(x, ctx.canvas.width / (window.devicePixelRatio || 1) - boxWidth - 10);
  const adjustedY = Math.max(y - boxHeight, 10);

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;

  ctx.beginPath();
  roundRect(ctx, adjustedX, adjustedY, boxWidth, boxHeight, 5);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  lines.forEach((line, i) => {
    ctx.fillText(line, adjustedX + padding, adjustedY + padding + i * lineHeight);
  });

  ctx.restore();
}

// Helper function to wrap text
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Helper function to draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

// ============================================================================
// TROOP MOVEMENT RANGE INDICATOR
// ============================================================================

export interface TroopMoveRangeConfig {
  anchorPos: Position;
  moveRadius: number;
  ownerType: 'station' | 'barracks' | 'spell' | 'hero' | 'hero_summon';
  isSelected: boolean;
}

/**
 * Renders a movement range circle for troops with restricted movement
 * Uses isometric projection for proper visual appearance
 */
export function renderTroopMoveRange(
  ctx: CanvasRenderingContext2D,
  config: TroopMoveRangeConfig,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    config.anchorPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;

  ctx.save();

  // Color scheme based on owner type
  let strokeColor: string;
  let fillColor: string;
  let glowColor: string;
  let shouldPulse = true; // Most types pulse, station does not

  switch (config.ownerType) {
    case 'station':
      // Orange for dinky station troops - NO PULSE for consistency
      strokeColor = config.isSelected 
        ? 'rgba(255, 180, 100, 0.7)' 
        : 'rgba(255, 180, 100, 0.5)';
      fillColor = config.isSelected 
        ? 'rgba(255, 180, 100, 0.12)' 
        : 'rgba(255, 180, 100, 0.06)';
      glowColor = 'rgba(255, 180, 100, 0.4)';
      shouldPulse = false; // Station range is consistent, not pulsing
      break;
    case 'barracks':
      // Blue-green for frontier barracks - NO PULSE for consistency
      strokeColor = config.isSelected 
        ? 'rgba(100, 200, 180, 0.7)' 
        : 'rgba(100, 200, 180, 0.5)';
      fillColor = config.isSelected 
        ? 'rgba(100, 200, 180, 0.12)' 
        : 'rgba(100, 200, 180, 0.06)';
      glowColor = 'rgba(100, 200, 180, 0.4)';
      shouldPulse = false; // Barracks range is consistent, not pulsing
      break;
    case 'spell':
      // Purple for spell reinforcements - NO PULSE for consistency
      strokeColor = config.isSelected 
        ? 'rgba(180, 130, 255, 0.7)' 
        : 'rgba(180, 130, 255, 0.5)';
      fillColor = config.isSelected 
        ? 'rgba(180, 130, 255, 0.12)' 
        : 'rgba(180, 130, 255, 0.06)';
      glowColor = 'rgba(180, 130, 255, 0.4)';
      shouldPulse = false; // Spell range is consistent, not pulsing
      break;
    case 'hero_summon':
      // Gold for hero-summoned troops - NO PULSE for consistency
      strokeColor = config.isSelected 
        ? 'rgba(255, 200, 80, 0.7)' 
        : 'rgba(255, 200, 80, 0.5)';
      fillColor = config.isSelected 
        ? 'rgba(255, 200, 80, 0.12)' 
        : 'rgba(255, 200, 80, 0.06)';
      glowColor = 'rgba(255, 200, 80, 0.4)';
      shouldPulse = false; // Hero summon range is consistent, not pulsing
      break;
    default:
      strokeColor = 'rgba(150, 150, 150, 0.5)';
      fillColor = 'rgba(150, 150, 150, 0.1)';
      glowColor = 'rgba(150, 150, 150, 0.3)';
  }

  // Calculate isometric ellipse dimensions (proper isometric ratio)
  const rangeX = config.moveRadius * zoom * 0.7;
  const rangeY = config.moveRadius * zoom * 0.35;

  // Animated pulse effect only for non-station/barracks types
  const pulse = (shouldPulse && config.isSelected) ? 0.9 + Math.sin(time * 3) * 0.1 : 1;

  // Draw outer glow when selected
  if (config.isSelected) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12 * zoom;
  }

  // Draw fill (isometric ellipse)
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, rangeX * pulse, rangeY * pulse, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw animated dashed border (marching ants effect)
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = config.isSelected ? 2 : 1.5;
  ctx.setLineDash([8, 5]);
  ctx.lineDashOffset = -time * 25;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, rangeX * pulse, rangeY * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ============================================================================
// PATH TARGET INDICATOR
// ============================================================================

export interface PathTargetConfig {
  targetPos: Position;
  isValid: boolean;
  isHero: boolean;
  unitPos: Position;
  themeColor?: string; // Hex color for hero/troop theme (e.g., "#8b5cf6")
}

// Helper to parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 200, b: 100 }; // Fallback gold
}

/**
 * Renders a target indicator on the path showing where the unit will move
 * Uses isometric projection for proper visual consistency with the game
 */
export function renderPathTargetIndicator(
  ctx: CanvasRenderingContext2D,
  config: PathTargetConfig,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const targetScreen = worldToScreen(
    config.targetPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const unitScreen = worldToScreen(
    config.unitPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;

  ctx.save();

  // Color scheme - use theme color if provided, otherwise fallback to type-based colors
  const baseColor = config.themeColor 
    ? hexToRgb(config.themeColor)
    : config.isHero 
      ? { r: 100, g: 200, b: 255 }  // Blue for hero (fallback)
      : { r: 255, g: 200, b: 100 }; // Orange/gold for troops (fallback)

  const validityMultiplier = config.isValid ? 1 : 0.4;
  const pulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Draw dotted line from unit to target (marching ants toward target)
  ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.35 * validityMultiplier})`;
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = time * 35; // Animated movement toward target
  ctx.beginPath();
  ctx.moveTo(unitScreen.x, unitScreen.y);
  ctx.lineTo(targetScreen.x, targetScreen.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw ISOMETRIC target indicator (ellipse instead of circle)
  const outerRadiusX = 16 * zoom * pulse;
  const outerRadiusY = 8 * zoom * pulse; // Half for isometric
  
  // Outer isometric ring
  ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.65 * validityMultiplier})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(targetScreen.x, targetScreen.y, outerRadiusX, outerRadiusY, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner isometric ellipse (filled)
  const innerRadiusX = 5 * zoom;
  const innerRadiusY = 2.5 * zoom;
  ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.8 * validityMultiplier})`;
  ctx.beginPath();
  ctx.ellipse(targetScreen.x, targetScreen.y, innerRadiusX, innerRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Isometric crosshair lines (adjusted for isometric view)
  const crossLengthX = 7 * zoom;
  const crossLengthY = 3.5 * zoom; // Shorter for isometric
  const gapX = 4 * zoom;
  const gapY = 2 * zoom;
  
  ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.5 * validityMultiplier})`;
  ctx.lineWidth = 1.5 * zoom;
  
  ctx.beginPath();
  // Top line (shorter due to isometric compression)
  ctx.moveTo(targetScreen.x, targetScreen.y - outerRadiusY - gapY);
  ctx.lineTo(targetScreen.x, targetScreen.y - outerRadiusY - gapY - crossLengthY);
  // Bottom line
  ctx.moveTo(targetScreen.x, targetScreen.y + outerRadiusY + gapY);
  ctx.lineTo(targetScreen.x, targetScreen.y + outerRadiusY + gapY + crossLengthY);
  // Left line
  ctx.moveTo(targetScreen.x - outerRadiusX - gapX, targetScreen.y);
  ctx.lineTo(targetScreen.x - outerRadiusX - gapX - crossLengthX, targetScreen.y);
  // Right line
  ctx.moveTo(targetScreen.x + outerRadiusX + gapX, targetScreen.y);
  ctx.lineTo(targetScreen.x + outerRadiusX + gapX + crossLengthX, targetScreen.y);
  ctx.stroke();

  // Draw small direction indicator (subtle arrow along the path line)
  const angle = Math.atan2(targetScreen.y - unitScreen.y, targetScreen.x - unitScreen.x);
  const arrowDist = outerRadiusX + 14 * zoom;
  const arrowX = targetScreen.x - Math.cos(angle) * arrowDist;
  const arrowY = targetScreen.y - Math.sin(angle) * arrowDist * 0.5; // Compress for isometric
  
  ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.7 * validityMultiplier * pulse})`;
  ctx.beginPath();
  const arrowSize = 6 * zoom;
  ctx.moveTo(
    arrowX + Math.cos(angle) * arrowSize,
    arrowY + Math.sin(angle) * arrowSize * 0.5
  );
  ctx.lineTo(
    arrowX + Math.cos(angle - 2.3) * arrowSize * 0.7,
    arrowY + Math.sin(angle - 2.3) * arrowSize * 0.35
  );
  ctx.lineTo(
    arrowX + Math.cos(angle + 2.3) * arrowSize * 0.7,
    arrowY + Math.sin(angle + 2.3) * arrowSize * 0.35
  );
  ctx.closePath();
  ctx.fill();

  // Invalid indicator (isometric X mark) if not valid
  if (!config.isValid) {
    ctx.strokeStyle = 'rgba(255, 80, 80, 0.75)';
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    const xSizeX = 8 * zoom;
    const xSizeY = 4 * zoom; // Compressed for isometric
    ctx.moveTo(targetScreen.x - xSizeX, targetScreen.y - xSizeY);
    ctx.lineTo(targetScreen.x + xSizeX, targetScreen.y + xSizeY);
    ctx.moveTo(targetScreen.x + xSizeX, targetScreen.y - xSizeY);
    ctx.lineTo(targetScreen.x - xSizeX, targetScreen.y + xSizeY);
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================================
// TROOP SELECTION INDICATOR
// ============================================================================

/**
 * Renders a selection indicator around a selected troop
 */
export function renderTroopSelectionUI(
  ctx: CanvasRenderingContext2D,
  troopPos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    troopPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;

  ctx.save();

  // Pulsing selection ring
  const pulse = 0.6 + Math.sin(time * 4) * 0.4;
  ctx.strokeStyle = `rgba(255, 200, 100, ${pulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([5, 3]);
  ctx.lineDashOffset = -time * 25;

  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    28 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}
