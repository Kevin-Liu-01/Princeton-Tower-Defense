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

  // Heal effect - glowing green aura when recently healed
  if (hero.healFlash) {
    const healAge = Date.now() - hero.healFlash;
    const healDuration = 800; // Effect lasts 800ms
    if (healAge < healDuration) {
      const healProgress = healAge / healDuration;
      const healAlpha = (1 - healProgress) * 0.8;
      const healPulse = 0.6 + Math.sin(healAge * 0.015) * 0.4;
      
      // Outer healing glow
      ctx.save();
      ctx.shadowColor = "#44ff88";
      ctx.shadowBlur = 25 * zoom * healAlpha;
      
      // Healing ring expanding outward
      const ringRadius = size * (0.8 + healProgress * 0.6);
      ctx.strokeStyle = `rgba(68, 255, 136, ${healAlpha * healPulse})`;
      ctx.lineWidth = 3 * zoom * (1 - healProgress * 0.5);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - size * 0.3, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner healing shimmer
      ctx.fillStyle = `rgba(150, 255, 180, ${healAlpha * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y - size * 0.3, size * 0.9, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Rising heal particles
      for (let i = 0; i < 4; i++) {
        const particleProgress = ((healAge * 0.002 + i * 0.25) % 1);
        const particleY = screenPos.y - size * 0.3 - particleProgress * 40 * zoom;
        const particleX = screenPos.x + Math.sin(time * 4 + i * 1.5) * 15 * zoom;
        const particleAlpha = (1 - particleProgress) * healAlpha;
        
        ctx.fillStyle = `rgba(68, 255, 136, ${particleAlpha})`;
        ctx.beginPath();
        ctx.arc(particleX, particleY, 3 * zoom * (1 - particleProgress * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Plus sign indicator
      ctx.fillStyle = `rgba(100, 255, 150, ${healAlpha})`;
      ctx.font = `bold ${14 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("+", screenPos.x, screenPos.y - size - 25 * zoom);
      
      ctx.restore();
    }
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
  // Purple aura glow
  const auraPulse = 0.3 + Math.sin(time * 3) * 0.15;
  ctx.fillStyle = `rgba(150, 80, 200, ${auraPulse})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.7, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body - deep purple robe
  const bodyGrad = ctx.createLinearGradient(x - size * 0.5, y, x + size * 0.5, y);
  bodyGrad.addColorStop(0, "#3a1850");
  bodyGrad.addColorStop(0.5, "#5a2870");
  bodyGrad.addColorStop(1, "#3a1850");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Purple lapel highlights
  ctx.strokeStyle = "#a060c0";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.4);
  ctx.lineTo(x - size * 0.4, y + size * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.4);
  ctx.lineTo(x + size * 0.4, y + size * 0.2);
  ctx.stroke();

  // Head
  ctx.fillStyle = "#ffd5b0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Purple bow tie
  ctx.fillStyle = "#a060d0";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.lineTo(x - size * 0.12, y - size * 0.32);
  ctx.lineTo(x - size * 0.12, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.lineTo(x + size * 0.12, y - size * 0.32);
  ctx.lineTo(x + size * 0.12, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c080f0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.25, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Musical staff with purple glow
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 4 * zoom;
  ctx.fillStyle = "#8050a0";
  ctx.fillRect(x + size * 0.3, y - size * 0.8, size * 0.08, size * 1.2);
  ctx.shadowBlur = 0;

  // Music notes floating - purple
  ctx.fillStyle = "#b080e0";
  ctx.shadowColor = "#c080ff";
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${size * 0.3}px Arial`;
  const noteY = y - size * 0.8 - Math.sin(time * 4) * size * 0.2;
  ctx.fillText("♪", x + size * 0.2, noteY);
  ctx.fillText("♫", x - size * 0.3, noteY + Math.sin(time * 3) * size * 0.15);
  ctx.shadowBlur = 0;
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
  // Teal aura glow
  const auraPulse = 0.25 + Math.sin(time * 2.5) * 0.15;
  ctx.fillStyle = `rgba(60, 180, 180, ${auraPulse})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.75, size * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ghostly body with teal tint
  const ghostAlpha = 0.7 + Math.sin(time * 3) * 0.2;
  ctx.fillStyle = `rgba(40, 60, 70, ${ghostAlpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.6, 0, 0, Math.PI);
  ctx.bezierCurveTo(x + size * 0.5, y + size * 0.3, x - size * 0.5, y + size * 0.3, x - size * 0.5, y);
  ctx.fill();

  // Teal trim on jacket
  ctx.strokeStyle = "#40c0c0";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.3);
  ctx.lineTo(x - size * 0.35, y + size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.3);
  ctx.lineTo(x + size * 0.35, y + size * 0.15);
  ctx.stroke();

  // Head
  ctx.fillStyle = `rgba(255, 220, 200, ${ghostAlpha})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Glasses with teal reflection
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.42, size * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.42, size * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  // Teal lens glint
  ctx.fillStyle = `rgba(80, 200, 200, 0.4)`;
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.44, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.08, y - size * 0.44, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Book with teal accents
  ctx.fillStyle = "#5a1a2a";
  ctx.fillRect(x - size * 0.25, y - size * 0.1, size * 0.5, size * 0.35);
  // Teal book decorations
  ctx.shadowColor = "#40c0c0";
  ctx.shadowBlur = 4 * zoom;
  ctx.strokeStyle = "#50d0d0";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(x - size * 0.22, y - size * 0.07, size * 0.44, size * 0.29);
  ctx.fillStyle = "#50d0d0";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.02);
  ctx.lineTo(x - size * 0.06, y + size * 0.08);
  ctx.lineTo(x, y + size * 0.18);
  ctx.lineTo(x + size * 0.06, y + size * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Spectral teal glow
  ctx.shadowColor = "#40c0c0";
  ctx.shadowBlur = 12 * zoom;
  ctx.strokeStyle = `rgba(80, 200, 200, 0.5)`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, size * 0.7, size * 0.8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Floating teal letters
  ctx.fillStyle = `rgba(80, 210, 210, ${0.5 + Math.sin(time * 2) * 0.3})`;
  ctx.font = `${size * 0.2}px serif`;
  ctx.fillText("F", x - size * 0.5, y - size * 0.6 + Math.sin(time * 2.5) * size * 0.1);
  ctx.fillText("S", x + size * 0.4, y - size * 0.5 + Math.sin(time * 3) * size * 0.1);
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
