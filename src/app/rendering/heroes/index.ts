// Princeton Tower Defense - Hero Rendering Module
// Renders all hero types with unique visual designs

import type { Hero, Position } from "../../types";
import { HERO_DATA } from "../../constants";
import { worldToScreen } from "../../utils";
import { lightenColor, darkenColor, drawHealthBar, drawSelectionIndicator } from "../helpers";

// ============================================================================
// MAIN HERO RENDER FUNCTION
// ============================================================================

export function renderHero(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  if (hero.dead) return;

  const heroData = HERO_DATA[hero.type];
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
  const size = 30 * zoom;

  ctx.save();

  // Selection indicator
  if (hero.selected) {
    drawSelectionIndicator(ctx, screenPos.x, screenPos.y, 30, zoom, true, time);
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 5 * zoom, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shield effect
  if (hero.shieldActive) {
    const shieldPulse = 0.4 + Math.sin(time * 6) * 0.2;
    ctx.strokeStyle = `rgba(100, 200, 255, ${shieldPulse})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - size * 0.3, size * 1.3, size * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(100, 200, 255, ${shieldPulse * 0.3})`;
    ctx.fill();
  }

  // Draw hero sprite
  const attackPhase = hero.attackAnim / 300;
  drawHeroSprite(
    ctx,
    screenPos.x,
    screenPos.y,
    size,
    hero.type,
    heroData.color,
    time,
    zoom,
    attackPhase
  );

  // Health bar
  if (hero.hp < hero.maxHp) {
    const hpPercent = hero.hp / hero.maxHp;
    drawHealthBar(
      ctx,
      screenPos.x,
      screenPos.y - size - 10 * zoom,
      30,
      5,
      hpPercent,
      zoom
    );
  }

  // Ability ready indicator
  if (hero.abilityReady) {
    const readyPulse = 0.6 + Math.sin(time * 4) * 0.4;
    ctx.fillStyle = `rgba(255, 215, 0, ${readyPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y - size - 18 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 215, 0, ${readyPulse})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================================
// HERO SPRITE DRAWING
// ============================================================================

function drawHeroSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
): void {
  const bodyColor = color;
  const bodyColorDark = darkenColor(color, 30);
  const bodyColorLight = lightenColor(color, 30);

  ctx.save();

  // Type-specific rendering
  switch (type) {
    case "tiger":
      drawTigerHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "tenor":
      drawTenorHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "mathey":
      drawMatheyHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "rocky":
      drawRockyHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "scott":
      drawScottHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "captain":
      drawCaptainHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "engineer":
      drawEngineerHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    default:
      drawDefaultHero(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
  }

  ctx.restore();
}

// Individual hero rendering functions
function drawTigerHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.7, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stripes
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3 + i * size * 0.3, y - size * 0.3);
    ctx.lineTo(x - size * 0.2 + i * size * 0.3, y + size * 0.3);
    ctx.stroke();
  }

  // Head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.6);
  ctx.lineTo(x - size * 0.2, y - size * 0.8);
  ctx.lineTo(x - size * 0.1, y - size * 0.6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.6);
  ctx.lineTo(x + size * 0.2, y - size * 0.8);
  ctx.lineTo(x + size * 0.1, y - size * 0.6);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.12, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.44, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.14, y - size * 0.44, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Attack animation - claws
  if (attackPhase > 0) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 3; i++) {
      const clawX = x + size * 0.5 + i * size * 0.1;
      const clawY = y - size * 0.2 - i * size * 0.1;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + size * 0.3 * attackPhase, clawY - size * 0.1);
      ctx.stroke();
    }
  }
}

function drawTenorHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#ffd5b0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Musical staff
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x + size * 0.3, y - size * 0.8, size * 0.08, size * 1.2);

  // Music notes floating
  ctx.fillStyle = color;
  ctx.font = `${size * 0.3}px Arial`;
  const noteY = y - size * 0.8 - Math.sin(time * 4) * size * 0.2;
  ctx.fillText("♪", x + size * 0.2, noteY);
}

function drawMatheyHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Armor body
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helmet
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Visor
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.25, y - size * 0.5, size * 0.5, size * 0.15);

  // Shield
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.5, y, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shield emblem
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x - size * 0.5, y, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawRockyHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Stone body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y + size * 0.3);
  ctx.lineTo(x - size * 0.6, y - size * 0.2);
  ctx.lineTo(x - size * 0.3, y - size * 0.6);
  ctx.lineTo(x + size * 0.3, y - size * 0.6);
  ctx.lineTo(x + size * 0.6, y - size * 0.2);
  ctx.lineTo(x + size * 0.5, y + size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Stone texture
  ctx.strokeStyle = dark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.2);
  ctx.lineTo(x + size * 0.1, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.3);
  ctx.lineTo(x + size * 0.4, y + size * 0.1);
  ctx.stroke();

  // Glowing eyes
  ctx.fillStyle = "#ffff00";
  ctx.shadowColor = "#ffff00";
  ctx.shadowBlur = 5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.35, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.35, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawScottHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Ghostly body
  const ghostAlpha = 0.7 + Math.sin(time * 3) * 0.2;
  ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${ghostAlpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI);
  ctx.bezierCurveTo(x + size * 0.5, y + size * 0.3, x - size * 0.5, y + size * 0.3, x - size * 0.5, y);
  ctx.fill();

  // Head
  ctx.fillStyle = `rgba(255, 220, 200, ${ghostAlpha})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Book
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x - size * 0.25, y - size * 0.1, size * 0.5, size * 0.35);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(x - size * 0.22, y - size * 0.08, size * 0.44, size * 0.02);

  // Spectral glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 10 * zoom;
  ctx.strokeStyle = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.5)`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, size * 0.7, size * 0.8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawCaptainHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Body armor
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cape
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.3);
  ctx.quadraticCurveTo(x - size * 0.8, y + size * 0.2, x - size * 0.5, y + size * 0.5);
  ctx.lineTo(x + size * 0.5, y + size * 0.5);
  ctx.quadraticCurveTo(x + size * 0.8, y + size * 0.2, x + size * 0.4, y - size * 0.3);
  ctx.fill();

  // Helmet
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Plume
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.8);
  ctx.quadraticCurveTo(x + size * 0.3, y - size * 1, x + size * 0.1, y - size * 0.6);
  ctx.fill();

  // Sword
  ctx.fillStyle = "#c0c0c0";
  ctx.fillRect(x + size * 0.4, y - size * 0.6, size * 0.08, size * 0.8);
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x + size * 0.35, y + size * 0.15, size * 0.18, size * 0.1);
}

function drawEngineerHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hard hat
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.35, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - size * 0.45, y - size * 0.5, size * 0.9, size * 0.1);

  // Goggles
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.25, y - size * 0.45, size * 0.5, size * 0.12);
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(x - size * 0.2, y - size * 0.43, size * 0.15, size * 0.08);
  ctx.fillRect(x + size * 0.05, y - size * 0.43, size * 0.15, size * 0.08);

  // Wrench
  ctx.fillStyle = "#808080";
  ctx.fillRect(x + size * 0.3, y - size * 0.2, size * 0.4, size * 0.1);
  ctx.beginPath();
  ctx.arc(x + size * 0.7, y - size * 0.15, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawDefaultHero(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, dark: string, light: string, time: number, zoom: number, attackPhase: number): void {
  // Basic humanoid shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.5, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.5, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
}
