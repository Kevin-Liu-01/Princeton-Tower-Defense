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
// Elite Guard - Level 3 station troop with ornate royal armor and halberd
function drawEliteTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const stance = Math.sin(time * 3) * 1.2;
  const breathe = Math.sin(time * 2) * 0.5;
  const capeWave = Math.sin(time * 3.5);
  const capeWave2 = Math.sin(time * 4.2 + 0.5);
  const shimmer = Math.sin(time * 6) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Attack animation - halberd swing
  const isAttacking = attackPhase > 0;
  const halberdSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 1.8
    : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.15 : 0;

  // === ELITE AURA (always present, stronger during attack) ===
  const auraIntensity = isAttacking ? 0.6 : 0.3;
  const auraPulse = 0.8 + Math.sin(time * 4) * 0.2;

  // Multiple layered aura rings for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.15;
    const auraGrad = ctx.createRadialGradient(
      x, y + size * 0.1, size * (0.05 + layerOffset),
      x, y + size * 0.1, size * (0.6 + layerOffset)
    );
    auraGrad.addColorStop(0, `rgba(255, 108, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.1)})`);
    auraGrad.addColorStop(0.4, `rgba(255, 140, 40, ${auraIntensity * auraPulse * (0.25 - auraLayer * 0.06)})`);
    auraGrad.addColorStop(0.7, `rgba(255, 180, 80, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.04)})`);
    auraGrad.addColorStop(1, "rgba(255, 108, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.15, size * (0.7 + layerOffset * 0.3), size * (0.55 + layerOffset * 0.2), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating rune particles around the elite
  for (let p = 0; p < 6; p++) {
    const pAngle = (time * 0.8 + p * Math.PI / 3) % (Math.PI * 2);
    const pRadius = size * 0.5 + Math.sin(time * 2 + p) * size * 0.1;
    const pX = x + Math.cos(pAngle) * pRadius;
    const pY = y + Math.sin(pAngle) * pRadius * 0.4 + size * 0.1;
    const pAlpha = 0.4 + Math.sin(time * 3 + p * 0.7) * 0.3;
    ctx.fillStyle = `rgba(255, 180, 60, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(pX, pY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Energy rings during attack
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6;
      ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.35 + ringPhase * 0.4),
        size * (0.22 + ringPhase * 0.25),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === ROYAL CAPE (multi-layered with intricate patterns) ===
  // Cape shadow layer (deepest)
  ctx.fillStyle = "#050515";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.3 + capeWave * 5,
    y + size * 0.35,
    x - size * 0.26 + capeWave * 6,
    y + size * 0.68
  );
  ctx.lineTo(x + size * 0.14 + capeWave * 4, y + size * 0.62);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.25,
    x + size * 0.14,
    y - size * 0.06 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape inner layer (royal purple)
  const capeInnerGrad = ctx.createLinearGradient(
    x - size * 0.2, y - size * 0.1,
    x + size * 0.1, y + size * 0.6
  );
  capeInnerGrad.addColorStop(0, "#1a0a3a");
  capeInnerGrad.addColorStop(0.3, "#0d0520");
  capeInnerGrad.addColorStop(0.7, "#150830");
  capeInnerGrad.addColorStop(1, "#0a0418");
  ctx.fillStyle = capeInnerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.26 + capeWave * 4,
    y + size * 0.3,
    x - size * 0.22 + capeWave * 5,
    y + size * 0.6
  );
  ctx.lineTo(x + size * 0.1 + capeWave * 3, y + size * 0.55);
  ctx.quadraticCurveTo(
    x + size * 0.06,
    y + size * 0.2,
    x + size * 0.12,
    y - size * 0.08 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape middle layer with gradient
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.15, y,
    x + size * 0.1, y + size * 0.5
  );
  capeGrad.addColorStop(0, "#2a1a5a");
  capeGrad.addColorStop(0.4, "#1d1045");
  capeGrad.addColorStop(1, "#120830");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.12 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.22 + capeWave * 3,
    y + size * 0.2,
    x - size * 0.18 + capeWave * 4,
    y + size * 0.5
  );
  ctx.lineTo(x + size * 0.08 + capeWave * 2, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y + size * 0.15,
    x + size * 0.1,
    y - size * 0.1 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape embroidered pattern (gold thread design)
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  // Decorative swirl patterns on cape
  for (let row = 0; row < 3; row++) {
    const rowY = y + size * (0.15 + row * 0.12);
    const waveOffset = capeWave * (2 + row);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + waveOffset, rowY);
    ctx.quadraticCurveTo(
      x - size * 0.05 + waveOffset, rowY - size * 0.03,
      x + waveOffset, rowY
    );
    ctx.quadraticCurveTo(
      x + size * 0.05 + waveOffset, rowY + size * 0.03,
      x + size * 0.08 + waveOffset, rowY
    );
    ctx.stroke();
  }
  ctx.restore();

  // Cape outer gold trim with decorative pattern
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + capeWave * 4, y + size * 0.5);
  ctx.lineTo(x + size * 0.08 + capeWave * 2, y + size * 0.45);
  ctx.stroke();
  
  // Inner trim line
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17 + capeWave * 4, y + size * 0.48);
  ctx.lineTo(x + size * 0.07 + capeWave * 2, y + size * 0.43);
  ctx.stroke();

  // Cape clasp gem at shoulder
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.08 + breathe, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem highlight
  ctx.fillStyle = "rgba(255,255,200,0.7)";
  ctx.beginPath();
  ctx.arc(x - size * 0.11, y - size * 0.09 + breathe, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // === LEGS (ornate greaves with engravings) ===
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.07, y + size * 0.28);
  ctx.rotate(-0.06 + stance * 0.015);
  
  // Greave base with metallic gradient
  const legGradL = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGradL.addColorStop(0, "#4a4a5a");
  legGradL.addColorStop(0.3, "#6a6a7a");
  legGradL.addColorStop(0.7, "#7a7a8a");
  legGradL.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = legGradL;
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  
  // Leg armor segments
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.06);
  ctx.lineTo(size * 0.055, size * 0.06);
  ctx.moveTo(-size * 0.055, size * 0.12);
  ctx.lineTo(size * 0.055, size * 0.12);
  ctx.stroke();
  
  // Ornate knee guard with layered design
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Knee gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Detailed boot with buckles
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  // Boot cuff
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.07, size * 0.17, size * 0.14, size * 0.025);
  // Gold buckle
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.025, size * 0.19, size * 0.05, size * 0.02);
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.07, y + size * 0.28);
  ctx.rotate(0.06 - stance * 0.015);
  
  // Greave base
  const legGradR = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGradR.addColorStop(0, "#5a5a6a");
  legGradR.addColorStop(0.3, "#7a7a8a");
  legGradR.addColorStop(0.7, "#6a6a7a");
  legGradR.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = legGradR;
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  
  // Leg armor segments
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.06);
  ctx.lineTo(size * 0.055, size * 0.06);
  ctx.moveTo(-size * 0.055, size * 0.12);
  ctx.lineTo(size * 0.055, size * 0.12);
  ctx.stroke();
  
  // Ornate knee guard
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Knee gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Boot with buckles
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.07, size * 0.17, size * 0.14, size * 0.025);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.025, size * 0.19, size * 0.05, size * 0.02);
  ctx.restore();

  // === BODY (highly ornate plate armor with filigree) ===
  // Back plate
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.21, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.24, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.21, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with elaborate metallic gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.2, y - size * 0.1,
    x + size * 0.2, y + size * 0.3
  );
  plateGrad.addColorStop(0, "#5a5a6a");
  plateGrad.addColorStop(0.15, "#7a7a8a");
  plateGrad.addColorStop(0.3, "#9a9aaa");
  plateGrad.addColorStop(0.5, "#8a8a9a");
  plateGrad.addColorStop(0.7, "#9a9aaa");
  plateGrad.addColorStop(0.85, "#7a7a8a");
  plateGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y + size * 0.3 + breathe);
  ctx.lineTo(x - size * 0.22, y - size * 0.08 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.14 + breathe * 0.3,
    x + size * 0.22,
    y - size * 0.08 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.19, y + size * 0.3 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate edge highlight
  ctx.strokeStyle = "#a0a0b0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y + size * 0.28 + breathe);
  ctx.lineTo(x - size * 0.21, y - size * 0.06 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.12 + breathe * 0.3,
    x + size * 0.21,
    y - size * 0.06 + breathe * 0.5
  );
  ctx.stroke();

  // Armor segment lines (muscle cuirass detail)
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.2;
  // Center line
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.06 + breathe);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();
  // Pectoral lines
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.02 + breathe);
  ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.08, x - size * 0.02, y + size * 0.04 + breathe);
  ctx.moveTo(x + size * 0.15, y + size * 0.02 + breathe);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.08, x + size * 0.02, y + size * 0.04 + breathe);
  ctx.stroke();
  // Abdominal segments
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.12 + breathe);
  ctx.lineTo(x + size * 0.12, y + size * 0.12 + breathe);
  ctx.moveTo(x - size * 0.1, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.1, y + size * 0.18 + breathe);
  ctx.stroke();

  // Gold filigree patterns on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.8;
  // Left filigree swirl
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.02 + breathe);
  ctx.quadraticCurveTo(x - size * 0.18, y + size * 0.06, x - size * 0.12, y + size * 0.08 + breathe);
  ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.1, x - size * 0.14, y + size * 0.14 + breathe);
  ctx.stroke();
  // Right filigree swirl
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.02 + breathe);
  ctx.quadraticCurveTo(x + size * 0.18, y + size * 0.06, x + size * 0.12, y + size * 0.08 + breathe);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.1, x + size * 0.14, y + size * 0.14 + breathe);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate gold chest emblem (Princeton shield with detail)
  // Shield base
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.04 + breathe);
  ctx.lineTo(x - size * 0.1, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.1, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Shield inner detail
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.01 + breathe);
  ctx.lineTo(x - size * 0.06, y + size * 0.07 + breathe);
  ctx.lineTo(x, y + size * 0.14 + breathe);
  ctx.lineTo(x + size * 0.06, y + size * 0.07 + breathe);
  ctx.closePath();
  ctx.fill();
  // Center gem on shield
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.07 + breathe, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem sparkle
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.01, y + size * 0.06 + breathe, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Belt with ornate buckle and pouches
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(x - size * 0.18, y + size * 0.22 + breathe, size * 0.36, size * 0.045);
  // Belt buckle
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.06, y + size * 0.215 + breathe, size * 0.12, size * 0.055, size * 0.01);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.04, y + size * 0.225 + breathe, size * 0.08, size * 0.035, size * 0.005);
  ctx.fill();
  // Buckle gem
  ctx.fillStyle = "#ff4400";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.242 + breathe, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  // Belt pouches
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(x - size * 0.16, y + size * 0.24 + breathe, size * 0.05, size * 0.04);
  ctx.fillRect(x + size * 0.11, y + size * 0.24 + breathe, size * 0.05, size * 0.04);

  // === ORNATE HALBERD (polearm weapon with intricate design) ===
  ctx.save();
  const halberdX =
    x + size * 0.27 + (isAttacking ? halberdSwing * size * 0.18 : 0);
  const halberdY =
    y - size * 0.12 - (isAttacking ? Math.abs(halberdSwing) * size * 0.12 : 0);
  ctx.translate(halberdX, halberdY);
  ctx.rotate(0.15 + stance * 0.02 + halberdSwing);

  // Ornate pole with wrapped leather
  const poleGrad = ctx.createLinearGradient(-size * 0.03, -size * 0.5, size * 0.03, -size * 0.5);
  poleGrad.addColorStop(0, "#3a2a1a");
  poleGrad.addColorStop(0.3, "#5a4a3a");
  poleGrad.addColorStop(0.7, "#5a4a3a");
  poleGrad.addColorStop(1, "#3a2a1a");
  ctx.fillStyle = poleGrad;
  ctx.fillRect(-size * 0.025, -size * 0.55, size * 0.05, size * 1.0);
  
  // Leather wrappings on pole
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1.5;
  for (let wrap = 0; wrap < 6; wrap++) {
    const wrapY = -size * 0.1 + wrap * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, wrapY);
    ctx.lineTo(size * 0.025, wrapY + size * 0.03);
    ctx.stroke();
  }

  // Gold pole rings
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.03, -size * 0.52, size * 0.06, size * 0.025);
  ctx.fillRect(-size * 0.03, -size * 0.2, size * 0.06, size * 0.02);
  ctx.fillRect(-size * 0.03, size * 0.25, size * 0.06, size * 0.02);

  // Elaborate axe head (glows during attack)
  if (isAttacking) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 15 * zoom * Math.abs(halberdSwing);
  }
  
  // Axe blade with gradient
  const bladeGrad = ctx.createLinearGradient(-size * 0.18, -size * 0.4, -size * 0.02, -size * 0.3);
  bladeGrad.addColorStop(0, isAttacking ? "#e0e0f0" : "#b0b0c0");
  bladeGrad.addColorStop(0.5, isAttacking ? "#f0f0ff" : "#d0d0e0");
  bladeGrad.addColorStop(1, isAttacking ? "#c0c0d0" : "#a0a0b0");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.52);
  ctx.lineTo(-size * 0.18, -size * 0.38);
  ctx.quadraticCurveTo(-size * 0.2, -size * 0.32, -size * 0.15, -size * 0.26);
  ctx.lineTo(-size * 0.025, -size * 0.32);
  ctx.closePath();
  ctx.fill();
  
  // Blade edge highlight
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.52);
  ctx.lineTo(-size * 0.17, -size * 0.38);
  ctx.quadraticCurveTo(-size * 0.19, -size * 0.33, -size * 0.14, -size * 0.27);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Blade engravings
  ctx.strokeStyle = "#7a7a8a";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.42);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.38, -size * 0.08, -size * 0.32);
  ctx.stroke();

  // Ornate spike tip
  ctx.fillStyle = isAttacking ? "#e0e0f0" : "#c0c0d0";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.62);
  ctx.lineTo(-size * 0.04, -size * 0.52);
  ctx.lineTo(size * 0.04, -size * 0.52);
  ctx.closePath();
  ctx.fill();
  
  // Spike decorative collar
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.52);
  ctx.lineTo(-size * 0.035, -size * 0.54);
  ctx.lineTo(size * 0.035, -size * 0.54);
  ctx.lineTo(size * 0.05, -size * 0.52);
  ctx.closePath();
  ctx.fill();

  // Back spike with curve
  ctx.fillStyle = isAttacking ? "#d0d0e0" : "#b0b0c0";
  ctx.beginPath();
  ctx.moveTo(size * 0.025, -size * 0.44);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.42, size * 0.1, -size * 0.38);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.34, size * 0.025, -size * 0.36);
  ctx.closePath();
  ctx.fill();
  
  ctx.shadowBlur = 0;

  // Swing trail effect with particles
  if (isAttacking && Math.abs(halberdSwing) > 0.4) {
    // Main trail
    ctx.strokeStyle = `rgba(255, 200, 100, ${Math.abs(halberdSwing) * 0.5})`;
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.42,
      size * 0.25,
      -Math.PI * 0.5,
      -Math.PI * 0.5 + halberdSwing * 0.9
    );
    ctx.stroke();
    
    // Inner trail
    ctx.strokeStyle = `rgba(255, 255, 200, ${Math.abs(halberdSwing) * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.42,
      size * 0.22,
      -Math.PI * 0.5,
      -Math.PI * 0.5 + halberdSwing * 0.85
    );
    ctx.stroke();
    
    // Spark particles
    for (let sp = 0; sp < 4; sp++) {
      const spAngle = -Math.PI * 0.5 + halberdSwing * (0.5 + sp * 0.1);
      const spDist = size * (0.2 + sp * 0.02);
      const spX = Math.cos(spAngle) * spDist;
      const spY = -size * 0.42 + Math.sin(spAngle) * spDist;
      ctx.fillStyle = `rgba(255, 220, 150, ${0.8 - sp * 0.15})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  // === SHOULDERS (elaborate layered pauldrons) ===
  // Left pauldron - multiple layers
  ctx.save();
  ctx.translate(x - size * 0.19, y - size * 0.04 + breathe);
  
  // Pauldron base layer
  const pauldronGradL = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradL.addColorStop(0, "#8a8a9a");
  pauldronGradL.addColorStop(0.6, "#6a6a7a");
  pauldronGradL.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = pauldronGradL;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Pauldron ridge layers
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.03, size * 0.09, size * 0.05, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.ellipse(size * 0.04, size * 0.05, size * 0.06, size * 0.035, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Gold trim and rivets
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, -0.3, 0, Math.PI * 2);
  ctx.stroke();
  
  // Decorative rivets
  ctx.fillStyle = "#dab32f";
  for (let rivet = 0; rivet < 4; rivet++) {
    const rivetAngle = -0.3 + rivet * Math.PI * 0.5;
    const rivetX = Math.cos(rivetAngle) * size * 0.09;
    const rivetY = Math.sin(rivetAngle) * size * 0.06;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Pauldron spike
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.02);
  ctx.lineTo(-size * 0.14, -size * 0.06);
  ctx.lineTo(-size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right pauldron
  ctx.save();
  ctx.translate(x + size * 0.19, y - size * 0.04 + breathe);
  
  const pauldronGradR = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradR.addColorStop(0, "#8a8a9a");
  pauldronGradR.addColorStop(0.6, "#6a6a7a");
  pauldronGradR.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = pauldronGradR;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(-size * 0.02, size * 0.03, size * 0.09, size * 0.05, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.ellipse(-size * 0.04, size * 0.05, size * 0.06, size * 0.035, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.fillStyle = "#dab32f";
  for (let rivet = 0; rivet < 4; rivet++) {
    const rivetAngle = 0.3 + rivet * Math.PI * 0.5;
    const rivetX = Math.cos(rivetAngle) * size * 0.09;
    const rivetY = Math.sin(rivetAngle) * size * 0.06;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.02);
  ctx.lineTo(size * 0.14, -size * 0.06);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === HEAD (elaborate plumed helm with face guard) ===
  // Gorget (neck armor)
  const gorgetGrad = ctx.createLinearGradient(x - size * 0.08, y - size * 0.14, x + size * 0.08, y - size * 0.14);
  gorgetGrad.addColorStop(0, "#4a4a5a");
  gorgetGrad.addColorStop(0.5, "#6a6a7a");
  gorgetGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.08 + breathe);
  ctx.lineTo(x - size * 0.1, y - size * 0.16 + breathe);
  ctx.quadraticCurveTo(x, y - size * 0.18, x + size * 0.1, y - size * 0.16 + breathe);
  ctx.lineTo(x + size * 0.08, y - size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Gorget gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Helm base with gradient
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.03, y - size * 0.32 + breathe, size * 0.02,
    x, y - size * 0.28 + breathe, size * 0.14
  );
  helmGrad.addColorStop(0, "#9a9aaa");
  helmGrad.addColorStop(0.4, "#7a7a8a");
  helmGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + breathe, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Helm ridge/crest base
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.42 + breathe);
  ctx.lineTo(x - size * 0.025, y - size * 0.26 + breathe);
  ctx.lineTo(x + size * 0.025, y - size * 0.26 + breathe);
  ctx.lineTo(x + size * 0.02, y - size * 0.42 + breathe);
  ctx.closePath();
  ctx.fill();

  // Visor with slit detail
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.26 + breathe,
    size * 0.1,
    size * 0.05,
    0,
    0,
    Math.PI
  );
  ctx.fill();
  // Visor slits
  ctx.fillStyle = "#0a0a15";
  ctx.fillRect(x - size * 0.08, y - size * 0.26 + breathe, size * 0.16, size * 0.01);
  ctx.fillRect(x - size * 0.06, y - size * 0.24 + breathe, size * 0.12, size * 0.008);
  
  // Eye glow behind visor
  ctx.fillStyle = `rgba(255, 100, 0, ${0.4 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.03, y - size * 0.26 + breathe, size * 0.015, size * 0.008, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.03, y - size * 0.26 + breathe, size * 0.015, size * 0.008, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ornate gold crown band with gems
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.28 + breathe,
    size * 0.14,
    Math.PI * 1.15,
    Math.PI * 1.85
  );
  ctx.stroke();
  
  // Crown points
  ctx.fillStyle = "#c9a227";
  for (let cp = 0; cp < 3; cp++) {
    const cpAngle = Math.PI * 1.3 + cp * Math.PI * 0.2;
    const cpX = x + Math.cos(cpAngle) * size * 0.14;
    const cpY = y - size * 0.28 + breathe + Math.sin(cpAngle) * size * 0.14;
    ctx.beginPath();
    ctx.moveTo(cpX, cpY);
    ctx.lineTo(cpX + Math.cos(cpAngle) * size * 0.04, cpY + Math.sin(cpAngle) * size * 0.04 - size * 0.02);
    ctx.lineTo(cpX + Math.cos(cpAngle + 0.3) * size * 0.02, cpY + Math.sin(cpAngle + 0.3) * size * 0.02);
    ctx.closePath();
    ctx.fill();
  }
  
  // Crown center gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + breathe, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Elaborate multi-layered plume
  // Plume shadow/depth layer
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.42 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.2 + capeWave * 2.5,
    y - size * 0.58,
    x + size * 0.28 + capeWave * 4,
    y - size * 0.4 + breathe
  );
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.35,
    x + size * 0.02,
    y - size * 0.4 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Main plume with gradient
  const plumeGrad = ctx.createLinearGradient(
    x, y - size * 0.55,
    x + size * 0.25, y - size * 0.35
  );
  plumeGrad.addColorStop(0, "#ff7700");
  plumeGrad.addColorStop(0.3, "#ff5500");
  plumeGrad.addColorStop(0.7, "#ff6600");
  plumeGrad.addColorStop(1, "#dd4400");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.42 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.18 + capeWave * 2,
    y - size * 0.56,
    x + size * 0.24 + capeWave * 3.5,
    y - size * 0.38 + breathe
  );
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.34,
    x,
    y - size * 0.4 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Plume highlight feathers
  ctx.strokeStyle = "#ffaa44";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  for (let feather = 0; feather < 4; feather++) {
    const fOffset = feather * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.02, y - size * 0.42 + breathe);
    ctx.quadraticCurveTo(
      x + size * (0.1 + fOffset) + capeWave * (1.5 + feather * 0.3),
      y - size * (0.48 + fOffset * 0.3),
      x + size * (0.15 + fOffset) + capeWave * (2 + feather * 0.4),
      y - size * 0.38 + breathe
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Secondary smaller plume
  ctx.fillStyle = "#ff8800";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.4 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.08 + capeWave2 * 1.5,
    y - size * 0.48,
    x + size * 0.12 + capeWave2 * 2,
    y - size * 0.36 + breathe
  );
  ctx.quadraticCurveTo(
    x + size * 0.04,
    y - size * 0.34,
    x - size * 0.02,
    y - size * 0.38 + breathe
  );
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
