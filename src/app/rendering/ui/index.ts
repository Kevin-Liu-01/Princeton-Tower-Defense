// Princeton Tower Defense - UI Rendering Module
// Renders game UI elements like health bars, resource displays, etc.

import { HERO_DATA, ISO_Y_RATIO } from "../../constants";
import type { Position, Tower, Hero } from "../../types";
import { worldToScreen, gridToWorld, isoTileDiamondHalfH } from "../../utils";
import { drawFloatingText, colorWithAlpha } from "../helpers";
import {
  renderRelocationReticle,
  renderSelectionReticle,
  hexToReticleColor,
  RETICLE_COLORS,
} from "./reticles";

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
  ctx.fillText(
    `Wave ${currentWave}/${totalWaves}`,
    width / 2,
    y + barHeight + 15
  );

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
  const zoom = cameraZoom || 1;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  screenPos.y -= isoTileDiamondHalfH(zoom);

  renderSelectionReticle(ctx, {
    color: RETICLE_COLORS.gold,
    dashPattern: [8, 4],
    dashSpeed: 30,
    lineWidth: 3,
    pulseSpeed: 4,
    radius: 45,
    time: Date.now() / 1000,
    x: screenPos.x,
    y: screenPos.y,
    zoom,
  });
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
  const heroColor = hexToReticleColor(hData.color);

  renderSelectionReticle(ctx, {
    color: heroColor,
    dashPattern: [6, 3],
    dashSpeed: 20,
    pulseSpeed: 3,
    radius: 35,
    time,
    x: screenPos.x,
    y: screenPos.y,
    zoom,
  });

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
    const pulse = 0.6 + Math.sin(time * 3) * 0.4;

    ctx.save();

    ctx.strokeStyle = colorWithAlpha(hData.color, pulse * 0.5);
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(targetScreen.x, targetScreen.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = colorWithAlpha(hData.color, pulse);
    const angle = Math.atan2(
      targetScreen.y - screenPos.y,
      targetScreen.x - screenPos.x
    );
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

    ctx.restore();
  }
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
  ctx.fillRect(
    centerX - iconSize / 2 - 10,
    centerY - iconSize / 2,
    15,
    iconSize
  );
  ctx.fillRect(
    centerX + iconSize / 2 - 5,
    centerY - iconSize / 2,
    15,
    iconSize
  );

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
  if (speed === 1) {
    return;
  }

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
  const adjustedX = Math.min(
    x,
    ctx.canvas.width / (window.devicePixelRatio || 1) - boxWidth - 10
  );
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
    ctx.fillText(
      line,
      adjustedX + padding,
      adjustedY + padding + i * lineHeight
    );
  });

  ctx.restore();
}

// Helper function to wrap text
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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
  ownerType: "station" | "barracks" | "spell" | "hero" | "hero_summon";
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
    case "station": {
      // Orange for dinky station troops - NO PULSE for consistency
      strokeColor = config.isSelected
        ? "rgba(255, 180, 100, 0.7)"
        : "rgba(255, 180, 100, 0.5)";
      fillColor = config.isSelected
        ? "rgba(255, 180, 100, 0.12)"
        : "rgba(255, 180, 100, 0.06)";
      glowColor = "rgba(255, 180, 100, 0.4)";
      shouldPulse = false; // Station range is consistent, not pulsing
      break;
    }
    case "barracks": {
      // Blue-green for frontier barracks - NO PULSE for consistency
      strokeColor = config.isSelected
        ? "rgba(100, 200, 180, 0.7)"
        : "rgba(100, 200, 180, 0.5)";
      fillColor = config.isSelected
        ? "rgba(100, 200, 180, 0.12)"
        : "rgba(100, 200, 180, 0.06)";
      glowColor = "rgba(100, 200, 180, 0.4)";
      shouldPulse = false; // Barracks range is consistent, not pulsing
      break;
    }
    case "spell": {
      // Purple for spell reinforcements - NO PULSE for consistency
      strokeColor = config.isSelected
        ? "rgba(180, 130, 255, 0.7)"
        : "rgba(180, 130, 255, 0.5)";
      fillColor = config.isSelected
        ? "rgba(180, 130, 255, 0.12)"
        : "rgba(180, 130, 255, 0.06)";
      glowColor = "rgba(180, 130, 255, 0.4)";
      shouldPulse = false; // Spell range is consistent, not pulsing
      break;
    }
    case "hero_summon": {
      // Gold for hero-summoned troops - NO PULSE for consistency
      strokeColor = config.isSelected
        ? "rgba(255, 200, 80, 0.7)"
        : "rgba(255, 200, 80, 0.5)";
      fillColor = config.isSelected
        ? "rgba(255, 200, 80, 0.12)"
        : "rgba(255, 200, 80, 0.06)";
      glowColor = "rgba(255, 200, 80, 0.4)";
      shouldPulse = false; // Hero summon range is consistent, not pulsing
      break;
    }
    default: {
      strokeColor = "rgba(150, 150, 150, 0.5)";
      fillColor = "rgba(150, 150, 150, 0.1)";
      glowColor = "rgba(150, 150, 150, 0.3)";
    }
  }

  // Calculate isometric ellipse dimensions (proper isometric ratio)
  const rangeX = config.moveRadius * zoom * 0.7;
  const rangeY = rangeX * ISO_Y_RATIO;

  // Animated pulse effect only for non-station/barracks types
  const pulse =
    shouldPulse && config.isSelected ? 0.9 + Math.sin(time * 3) * 0.1 : 1;

  // Draw outer glow when selected
  if (config.isSelected) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12 * zoom;
  }

  // Draw fill (isometric ellipse)
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    rangeX * pulse,
    rangeY * pulse,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw animated dashed border (marching ants effect)
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = config.isSelected ? 2 : 1.5;
  ctx.setLineDash([8, 5]);
  ctx.lineDashOffset = -time * 25;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    rangeX * pulse,
    rangeY * pulse,
    0,
    0,
    Math.PI * 2
  );
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
        b: Number.parseInt(result[3], 16),
        g: Number.parseInt(result[2], 16),
        r: Number.parseInt(result[1], 16),
      }
    : { b: 100, g: 200, r: 255 }; // Fallback gold
}

/**
 * Renders a target indicator on the path showing where the unit will move.
 * Delegates to the centralized relocation reticle.
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

  const color = config.themeColor
    ? hexToReticleColor(config.themeColor)
    : config.isHero
      ? { r: 100, g: 200, b: 255 }
      : RETICLE_COLORS.gold;

  renderRelocationReticle(ctx, {
    color,
    isValid: config.isValid,
    targetX: targetScreen.x,
    targetY: targetScreen.y,
    time: Date.now() / 1000,
    unitX: unitScreen.x,
    unitY: unitScreen.y,
    zoom: cameraZoom || 1,
  });
}

// ============================================================================
// TROOP SELECTION INDICATOR
// ============================================================================

/**
 * Renders a selection indicator around a selected troop.
 * Delegates to centralized selection reticle.
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

  renderSelectionReticle(ctx, {
    color: RETICLE_COLORS.gold,
    dashPattern: [5, 3],
    dashSpeed: 25,
    pulseSpeed: 4,
    radius: 28,
    time: Date.now() / 1000,
    x: screenPos.x,
    y: screenPos.y,
    zoom: cameraZoom || 1,
  });
}
