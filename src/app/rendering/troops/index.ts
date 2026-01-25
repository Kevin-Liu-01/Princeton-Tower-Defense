// Princeton Tower Defense - Troop Rendering Module
// Renders all troop types spawned by stations

import type { Troop, Position } from "../../types";
import { TROOP_DATA } from "../../constants";
import { worldToScreen } from "../../utils";
import { lightenColor, darkenColor, drawHealthBar, drawSelectionIndicator } from "../helpers";

// ============================================================================
// MAIN TROOP RENDER FUNCTION
// ============================================================================

export function renderTroop(
  ctx: CanvasRenderingContext2D,
  troop: Troop,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  targetPos?: Position
): void {
  if (troop.dead) return;

  const troopData = troop.type ? TROOP_DATA[troop.type] : TROOP_DATA.footsoldier;
  const screenPos = worldToScreen(
    troop.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const size = 18 * zoom;

  ctx.save();

  // Selection indicator
  if (troop.selected) {
    drawSelectionIndicator(ctx, screenPos.x, screenPos.y, 20, zoom, true, time);
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 3 * zoom, size * 0.7, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw troop sprite
  const attackPhase = (troop.attackAnim || 0) / 300;
  drawTroopSprite(
    ctx,
    screenPos.x,
    screenPos.y,
    size,
    troop.type || "footsoldier",
    troopData.color,
    time,
    zoom,
    attackPhase,
    targetPos
  );

  // Health bar
  if (troop.hp < troop.maxHp) {
    const hpPercent = troop.hp / troop.maxHp;
    drawHealthBar(
      ctx,
      screenPos.x,
      screenPos.y - size - 6 * zoom,
      20,
      3,
      hpPercent,
      zoom
    );
  }

  // Engaging indicator
  if (troop.engaging) {
    ctx.fillStyle = `rgba(255, 100, 100, ${0.5 + Math.sin(time * 6) * 0.3})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y - size - 12 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// TROOP SPRITE DRAWING
// ============================================================================

function drawTroopSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
): void {
  const bodyColor = color;
  const bodyColorDark = darkenColor(color, 30);
  const bodyColorLight = lightenColor(color, 20);

  ctx.save();

  switch (type) {
    case "footsoldier":
      drawSoldierTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "armored":
      drawArmoredTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "elite":
      drawEliteTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "knight":
      drawKnightTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "centaur":
      drawCentaurTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "cavalry":
      drawCavalryTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "turret":
      drawTurretTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase, targetPos);
      break;
    default:
      drawSoldierTroop(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
  }

  ctx.restore();
}

function drawSoldierTroop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helmet
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = "#ffd5b0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Sword
  ctx.fillStyle = "#c0c0c0";
  ctx.fillRect(x + size * 0.3, y - size * 0.3, size * 0.05, size * 0.5);

  // Shield
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.4, y, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawArmoredTroop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Armor body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Plate armor highlight
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.1, size * 0.2, size * 0.25, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Helmet with visor
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.25, y - size * 0.5, size * 0.5, size * 0.1);

  // Large shield
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.45, y, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x - size * 0.45, y, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawEliteTroop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Elite armor
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Golden trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Plumed helmet
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Plume
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.85);
  ctx.quadraticCurveTo(x + size * 0.3, y - size * 1, x + size * 0.1, y - size * 0.6);
  ctx.fill();

  // Halberd
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x + size * 0.3, y - size * 0.8, size * 0.06, size * 1.1);
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.33, y - size * 0.8);
  ctx.lineTo(x + size * 0.2, y - size * 0.6);
  ctx.lineTo(x + size * 0.33, y - size * 0.5);
  ctx.lineTo(x + size * 0.46, y - size * 0.6);
  ctx.closePath();
  ctx.fill();
}

function drawKnightTroop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  drawArmoredTroop(ctx, x, y, size, "#c0c0c0", "#808080", "#e0e0e0", time, zoom, attackPhase);
}

function drawCentaurTroop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Horse body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = dark;
  ctx.fillRect(x - size * 0.5, y + size * 0.3, size * 0.12, size * 0.5);
  ctx.fillRect(x - size * 0.2, y + size * 0.3, size * 0.12, size * 0.5);
  ctx.fillRect(x + size * 0.2, y + size * 0.3, size * 0.12, size * 0.5);
  ctx.fillRect(x + size * 0.5, y + size * 0.3, size * 0.12, size * 0.5);

  // Human torso
  ctx.fillStyle = "#ffd5b0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.3, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Armor
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.3, size * 0.3, size * 0.35, 0, 0, Math.PI);
  ctx.fill();

  // Bow
  ctx.strokeStyle = "#8b4513";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.3, size * 0.3, -0.8, 0.8);
  ctx.stroke();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.5);
  ctx.lineTo(x - size * 0.4, y - size * 0.1);
  ctx.stroke();
}

function drawCavalryTroop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Horse
  ctx.fillStyle = "#8b4513";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.7, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horse head
  ctx.beginPath();
  ctx.ellipse(x + size * 0.5, y, size * 0.25, size * 0.2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Horse legs
  ctx.fillStyle = darkenColor("#8b4513", 20);
  ctx.fillRect(x - size * 0.4, y + size * 0.35, size * 0.1, size * 0.4);
  ctx.fillRect(x - size * 0.1, y + size * 0.35, size * 0.1, size * 0.4);
  ctx.fillRect(x + size * 0.2, y + size * 0.35, size * 0.1, size * 0.4);
  ctx.fillRect(x + size * 0.4, y + size * 0.35, size * 0.1, size * 0.4);

  // Rider
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.25, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rider helmet
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.6, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Lance
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x + size * 0.3, y - size * 0.9, size * 0.05, size * 1.2);
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.325, y - size * 0.9);
  ctx.lineTo(x + size * 0.25, y - size * 0.75);
  ctx.lineTo(x + size * 0.4, y - size * 0.75);
  ctx.closePath();
  ctx.fill();
}

function drawTurretTroop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number, targetPos?: Position): void {
  // Base
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Turret body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Barrel
  let rotation = 0;
  if (targetPos) {
    const dx = targetPos.x - x;
    const dy = targetPos.y - y;
    rotation = Math.atan2(dy, dx);
  }

  const barrelLength = size * 0.6;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.15);
  ctx.lineTo(x + cosR * barrelLength - size * 0.05, y - size * 0.15 + sinR * barrelLength * 0.5);
  ctx.lineTo(x + cosR * barrelLength + size * 0.05, y - size * 0.15 + sinR * barrelLength * 0.5);
  ctx.lineTo(x + size * 0.08, y - size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Muzzle
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(
    x + cosR * barrelLength,
    y - size * 0.15 + sinR * barrelLength * 0.5,
    size * 0.08,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Tech glow
  const glowPulse = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(255, 200, 0, ${glowPulse})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.1, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
}
