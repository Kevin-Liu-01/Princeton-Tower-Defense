// Princeton Tower Defense - UI Rendering Module
// Renders game UI elements like health bars, resource displays, etc.

import type { Position, Tower, Hero } from "../../types";
import { worldToScreen, gridToWorld } from "../../utils";
import { drawHealthBar, drawOutlinedText, drawFloatingText, colorWithAlpha } from "../helpers";

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

  ctx.save();

  // Hero selection indicator
  const pulse = 0.6 + Math.sin(time * 3) * 0.4;
  ctx.strokeStyle = `rgba(100, 200, 255, ${pulse})`;
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

    ctx.strokeStyle = `rgba(100, 200, 255, ${pulse * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(targetScreen.x, targetScreen.y);
    ctx.stroke();

    // Arrow head
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(100, 200, 255, ${pulse})`;
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
