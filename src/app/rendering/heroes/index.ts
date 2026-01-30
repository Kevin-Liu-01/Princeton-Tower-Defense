// Princeton Tower Defense - Hero Rendering Module
// Renders all hero types with unique visual designs

import type { Hero, Position } from "../../types";
import { HERO_DATA } from "../../constants";
import { worldToScreen, lightenColor, darkenColor } from "../../utils";

export function renderHero(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const screenPos = worldToScreen(
    hero.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const hData = HERO_DATA[hero.type];
  const time = Date.now() / 1000;

  // Selection glow - uses hero's theme color
  if (hero.selected) {
    ctx.strokeStyle = hData.color;
    ctx.lineWidth = 3 * zoom;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 3 * zoom,
      40 * zoom,
      20 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 1 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const size = 32 * zoom;
  const attackPhase = hero.attackAnim > 0 ? hero.attackAnim / 300 : 0;
  const attackScale = attackPhase > 0 ? 1 + attackPhase * 0.2 : 1;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(attackScale, attackScale);

  // Draw specific hero type with attack animation
  drawHeroSprite(
    ctx,
    0,
    0,
    size,
    hero.type,
    hData.color,
    time,
    zoom,
    attackPhase
  );

  ctx.restore();

  // HEALING AURA EFFECT - Soft, elegant healing visualization for heroes
  if (hero.healFlash && hero.hp < hero.maxHp) {
    const pulseAlpha = 0.9 + Math.sin(time * 3) * 0.1; // Stronger breathing effect

    // Soft outer glow - larger diffuse emerald light for heroes
    const outerGlow = ctx.createRadialGradient(
      screenPos.x, screenPos.y, size * 0.15,
      screenPos.x, screenPos.y, size * 1.2
    );
    outerGlow.addColorStop(0, `rgba(134, 239, 172, ${0.55 * pulseAlpha})`);
    outerGlow.addColorStop(0.4, `rgba(74, 222, 128, ${0.35 * pulseAlpha})`);
    outerGlow.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, size * 1.1, size * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner warm core - brighter for heroes
    const innerGlow = ctx.createRadialGradient(
      screenPos.x, screenPos.y - size * 0.1, 0,
      screenPos.x, screenPos.y, size * 0.55
    );
    innerGlow.addColorStop(0, `rgba(187, 247, 208, ${0.7 * pulseAlpha})`);
    innerGlow.addColorStop(0.45, `rgba(134, 239, 172, ${0.35 * pulseAlpha})`);
    innerGlow.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - size * 0.05, size * 0.55, size * 0.33, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floating sparkle particles - more for heroes
    for (let i = 0; i < 8; i++) {
      const sparklePhase = (time * 0.65 + i * 0.125) % 1;
      const sparkleX = screenPos.x + Math.sin(time * 1.6 + i * 1.0) * size * 0.45;
      const sparkleY = screenPos.y + size * 0.2 - sparklePhase * size * 1.1;
      const sparkleAlpha = Math.sin(sparklePhase * Math.PI) * pulseAlpha;
      const sparkleSize = (2.2 + Math.sin(i * 1.1) * 0.7) * zoom;

      // Diamond-shaped sparkle
      ctx.fillStyle = `rgba(220, 252, 231, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.moveTo(sparkleX, sparkleY - sparkleSize);
      ctx.lineTo(sparkleX + sparkleSize * 0.5, sparkleY);
      ctx.lineTo(sparkleX, sparkleY + sparkleSize);
      ctx.lineTo(sparkleX - sparkleSize * 0.5, sparkleY);
      ctx.closePath();
      ctx.fill();
    }

    // Orbiting shimmer highlights - more for heroes
    for (let i = 0; i < 4; i++) {
      const shimmerAngle = time * 0.9 + i * (Math.PI * 2 / 4);
      const shimmerDist = size * 0.42;
      const shimmerX = screenPos.x + Math.cos(shimmerAngle) * shimmerDist;
      const shimmerY = screenPos.y + Math.sin(shimmerAngle) * shimmerDist * 0.55;
      const shimmerAlpha = (0.75 + Math.sin(time * 4.5 + i * 1.5) * 0.2) * pulseAlpha;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(shimmerX, shimmerY, 2.0 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gentle healing ring - soft glow
    const ringAlpha = 0.4 + Math.sin(time * 2.5) * 0.15;
    ctx.strokeStyle = `rgba(134, 239, 172, ${ringAlpha * pulseAlpha})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, size * 0.8, size * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // HP Bar - Premium hero style
  const barWidth = 48 * zoom;
  const barHeight = 7 * zoom;
  const barY = screenPos.y - size - 20 * zoom;
  const barX = screenPos.x - barWidth / 2;
  const cornerRadius = 3.5 * zoom;

  // Outer glow/shadow for premium feel
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 5 * zoom;
  ctx.shadowOffsetY = 1.5 * zoom;

  // Background with gold trim effect
  ctx.fillStyle = "rgba(8, 8, 12, 0.95)";
  ctx.beginPath();
  ctx.roundRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, cornerRadius + 1);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Gold border (hero distinction)
  const goldGrad = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
  goldGrad.addColorStop(0, "#fbbf24");
  goldGrad.addColorStop(0.5, "#f59e0b");
  goldGrad.addColorStop(1, "#d97706");
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, cornerRadius);
  ctx.stroke();

  // Inner dark background
  ctx.fillStyle = "#0f0f12";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius - 1);
  ctx.fill();

  const hpPercent = hero.hp / hero.maxHp;
  const hpWidth = barWidth * hpPercent;

  // Health gradient fill with vibrant colors
  if (hpWidth > 0) {
    const hpGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    if (hpPercent > 0.5) {
      // Bright green - healthy hero
      hpGradient.addColorStop(0, "#a7f3d0");
      hpGradient.addColorStop(0.3, "#6ee7b7");
      hpGradient.addColorStop(0.7, "#34d399");
      hpGradient.addColorStop(1, "#10b981");
    } else if (hpPercent > 0.25) {
      // Amber - hero in danger
      hpGradient.addColorStop(0, "#fef08a");
      hpGradient.addColorStop(0.3, "#fde047");
      hpGradient.addColorStop(0.7, "#facc15");
      hpGradient.addColorStop(1, "#eab308");
    } else {
      // Red - critical hero health
      hpGradient.addColorStop(0, "#fecaca");
      hpGradient.addColorStop(0.3, "#fca5a5");
      hpGradient.addColorStop(0.7, "#f87171");
      hpGradient.addColorStop(1, "#ef4444");
    }
    ctx.fillStyle = hpGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY, hpWidth, barHeight, [cornerRadius - 1, hpPercent > 0.92 ? cornerRadius - 1 : 0, hpPercent > 0.92 ? cornerRadius - 1 : 0, cornerRadius - 1]);
    ctx.fill();

    // Premium shine highlight
    const shineGrad = ctx.createLinearGradient(barX, barY, barX, barY + barHeight * 0.5);
    shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    shineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
    shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, hpWidth, barHeight * 0.5, [cornerRadius - 1, hpPercent > 0.92 ? cornerRadius - 1 : 0, 0, 0]);
    ctx.fill();

    // Pulsing edge glow when low health
    if (hpPercent <= 0.25) {
      const pulseAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;
      ctx.shadowColor = `rgba(239, 68, 68, ${pulseAlpha})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.strokeStyle = `rgba(239, 68, 68, ${pulseAlpha})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, cornerRadius);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Name tag with enhanced glow
  ctx.shadowColor = hData.color;
  ctx.shadowBlur = 6 * zoom;
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${11 * zoom}px bc-novatica-cyr`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(hData.name, screenPos.x, barY - 4 * zoom);
  ctx.shadowBlur = 0;
}

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
) {
  switch (type) {
    case "tiger":
      drawTigerHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "tenor":
      drawTenorHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "mathey":
      drawMatheyKnightHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "rocky":
      drawRockyHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "scott":
    case "fscott":
      drawFScottHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "captain":
      drawCaptainHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "engineer":
      drawEngineerHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    default:
      drawDefaultHero(ctx, x, y, size, color, time, zoom, attackPhase);
  }
}

function drawTigerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ARMORED WAR TIGER - Colossal beast warrior with devastating claw attacks
  const breathe = Math.sin(time * 1.8) * 3; // More pronounced breathing
  const idleSway = Math.sin(time * 1.2) * 1.5; // Subtle idle body sway
  const isAttacking = attackPhase > 0;
  const clawSwipe = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.8 : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.2 : Math.sin(time * 1.5) * 0.03; // Idle lean
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  
  // Arm raise animation - arms swing UP first, then DOWN during attack
  // Phase 0-0.4: Arms raise up
  // Phase 0.4-1.0: Arms swing down powerfully
  let armRaise = 0;
  if (isAttacking) {
    if (attackPhase < 0.4) {
      // Wind up - arms raise
      armRaise = Math.sin((attackPhase / 0.4) * Math.PI * 0.5) * size * 0.35;
    } else {
      // Swing down - arms come down fast
      armRaise = Math.cos(((attackPhase - 0.4) / 0.6) * Math.PI * 0.5) * size * 0.35 * (1 - (attackPhase - 0.4) / 0.6);
    }
  }

  // === ATTACK GLOW EFFECT ===
  if (isAttacking) {
    // Outer attack aura - intense orange glow
    const attackGlow = attackIntensity * 0.7;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 25 * zoom * attackIntensity;
    
    // Pulsing attack ring
    for (let ring = 0; ring < 3; ring++) {
      const ringSize = size * (0.85 + ring * 0.15 + attackIntensity * 0.1);
      const ringAlpha = attackGlow * (0.6 - ring * 0.18);
      ctx.strokeStyle = `rgba(255, 120, 0, ${ringAlpha})`;
      ctx.lineWidth = (4 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringSize, ringSize * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // === MULTI-LAYERED INFERNAL AURA ===
  const auraIntensity = isAttacking ? 0.65 : 0.2; // Much brighter when attacking
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x, y, size * (0.1 + layerOffset),
      x, y, size * (1.0 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(0, `rgba(255, 100, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.08)})`);
    auraGrad.addColorStop(0.4, `rgba(255, 60, 0, ${auraIntensity * auraPulse * (0.25 - auraLayer * 0.05)})`);
    auraGrad.addColorStop(0.7, `rgba(200, 50, 0, ${auraIntensity * auraPulse * (0.12 - auraLayer * 0.02)})`);
    auraGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * (0.95 + layerOffset * 0.2), size * (0.75 + layerOffset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating flame particles
  for (let p = 0; p < 14; p++) {
    const pAngle = (time * 1.2 + p * Math.PI * 0.143) % (Math.PI * 2);
    const pDist = size * 0.75 + Math.sin(time * 2 + p * 0.5) * size * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.6 - Math.abs(Math.sin(time * 4 + p)) * size * 0.1;
    const pAlpha = 0.6 + Math.sin(time * 4 + p * 0.4) * 0.3;
    ctx.fillStyle = p % 3 === 0 ? `rgba(255, 200, 50, ${pAlpha})` : `rgba(255, 100, 0, ${pAlpha})`;
    ctx.beginPath();
    ctx.moveTo(px, py + size * 0.02);
    ctx.quadraticCurveTo(px - size * 0.01, py, px, py - size * 0.025);
    ctx.quadraticCurveTo(px + size * 0.01, py, px, py + size * 0.02);
    ctx.fill();
  }

  // === DEEP SHADOW ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.6, 0, x, y + size * 0.6, size * 0.65);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.35)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.6, size * 0.65, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === MASSIVE MUSCULAR TIGER BODY ===
  // Add attack glow to body
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }
  
  const bodyGrad = ctx.createRadialGradient(x, y + size * 0.05 + breathe * 0.3, 0, x, y + size * 0.05 + breathe * 0.3, size * 0.7);
  bodyGrad.addColorStop(0, isAttacking ? "#ffbb55" : "#ffaa44");
  bodyGrad.addColorStop(0.3, isAttacking ? "#ff9933" : "#ff8822");
  bodyGrad.addColorStop(0.6, "#dd5500");
  bodyGrad.addColorStop(0.85, "#aa3300");
  bodyGrad.addColorStop(1, "#661800");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Bulkier body shape with more breathing movement
  ctx.ellipse(
    x + idleSway * 0.3,
    y + breathe * 0.4,
    size * 0.58 + breathe * 0.008,
    size * 0.68 + breathe * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // === HEAVY WAR ARMOR - CHEST PLATE ===
  const chestArmorGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.3, x + size * 0.4, y + size * 0.3);
  chestArmorGrad.addColorStop(0, "#2a2218");
  chestArmorGrad.addColorStop(0.2, "#4a3a28");
  chestArmorGrad.addColorStop(0.4, "#5a4a38");
  chestArmorGrad.addColorStop(0.5, "#6a5a48");
  chestArmorGrad.addColorStop(0.6, "#5a4a38");
  chestArmorGrad.addColorStop(0.8, "#4a3a28");
  chestArmorGrad.addColorStop(1, "#2a2218");
  ctx.fillStyle = chestArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.35, y + size * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.45);
  ctx.quadraticCurveTo(x, y + size * 0.5, x + size * 0.15, y + size * 0.45);
  ctx.lineTo(x + size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.45, x - size * 0.38, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Armor plate edge highlight
  ctx.strokeStyle = "#8a7a68";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.33);
  ctx.quadraticCurveTo(x - size * 0.43, y - size * 0.05, x - size * 0.33, y + size * 0.28);
  ctx.stroke();

  // Armor border
  ctx.strokeStyle = "#1a1510";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.35, y + size * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.45);
  ctx.quadraticCurveTo(x, y + size * 0.5, x + size * 0.15, y + size * 0.45);
  ctx.lineTo(x + size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.45, x - size * 0.38, y - size * 0.35);
  ctx.closePath();
  ctx.stroke();

  // Armor segment lines
  ctx.strokeStyle = "#3a3028";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.1);
  ctx.lineTo(x + size * 0.32, y - size * 0.1);
  ctx.moveTo(x - size * 0.28, y + size * 0.15);
  ctx.lineTo(x + size * 0.28, y + size * 0.15);
  ctx.stroke();

  // Gold trim on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.36, y - size * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y + size * 0.43);
  ctx.quadraticCurveTo(x, y + size * 0.48, x + size * 0.13, y + size * 0.43);
  ctx.stroke();

  // Central tiger emblem on armor
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.lineTo(x - size * 0.12, y + size * 0.02);
  ctx.lineTo(x, y + size * 0.15);
  ctx.lineTo(x + size * 0.12, y + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x - size * 0.08, y);
  ctx.lineTo(x, y + size * 0.1);
  ctx.lineTo(x + size * 0.08, y);
  ctx.closePath();
  ctx.fill();
  // Emblem gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = isAttacking ? 10 * zoom * gemPulse : 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.06, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Armor studs/rivets
  for (let row = 0; row < 2; row++) {
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const studX = x + i * size * 0.13;
      const studY = y - size * 0.1 + row * size * 0.25;
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(studX, studY, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f0c040";
      ctx.beginPath();
      ctx.arc(studX - size * 0.006, studY - size * 0.006, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === DARK TIGER STRIPES (on exposed fur areas) ===
  ctx.strokeStyle = "#050202";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  // Side stripes visible around armor - more prominent
  for (let i = 0; i < 4; i++) {
    const stripeY = y - size * 0.2 + i * size * 0.14 + breathe * 0.3;
    // Left side stripes - longer and more visible
    ctx.beginPath();
    ctx.moveTo(x - size * 0.58, stripeY);
    ctx.quadraticCurveTo(x - size * 0.5, stripeY - size * 0.06, x - size * 0.4, stripeY + size * 0.01);
    ctx.stroke();
    // Right side stripes
    ctx.beginPath();
    ctx.moveTo(x + size * 0.58, stripeY);
    ctx.quadraticCurveTo(x + size * 0.5, stripeY - size * 0.06, x + size * 0.4, stripeY + size * 0.01);
    ctx.stroke();
  }

  // === COLOSSAL ARMORED SHOULDERS/PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const shoulderX = x + side * size * 0.52 + (isAttacking ? 0 : idleSway * 0.2);
    const shoulderY = y - size * 0.15 - armRaise + (isAttacking ? 0 : breathe * 0.15); // Arms raise up during attack
    const armOffset = isAttacking ? clawSwipe * size * 0.15 * side : 0;
    
    // Arm rotation during attack - arms rotate outward when raised
    const armRotation = isAttacking 
      ? side * (-0.25 - clawSwipe * 0.25 - (armRaise / size) * 0.5) 
      : side * (-0.25 + Math.sin(time * 1.5) * 0.05);

    // Attack glow on arms
    if (isAttacking) {
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 12 * zoom * attackIntensity;
    }

    // Massive arm/shoulder muscle
    const armGrad = ctx.createRadialGradient(
      shoulderX + armOffset, shoulderY, 0,
      shoulderX + armOffset, shoulderY, size * 0.35
    );
    armGrad.addColorStop(0, isAttacking ? "#ffaa55" : "#ff9944");
    armGrad.addColorStop(0.4, isAttacking ? "#ff8833" : "#ff7722");
    armGrad.addColorStop(0.7, "#dd5500");
    armGrad.addColorStop(1, "#aa3300");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(
      shoulderX + armOffset,
      shoulderY,
      size * 0.28,
      size * 0.35,
      armRotation,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Arm stripes - thin and distinctive
    ctx.strokeStyle = "#050202";
    ctx.lineWidth = 1.8 * zoom;
    for (let stripe = 0; stripe < 5; stripe++) {
      const stripeOffset = -size * 0.22 + stripe * size * 0.1;
      ctx.beginPath();
      ctx.moveTo(shoulderX + armOffset + side * size * 0.22, shoulderY + stripeOffset);
      ctx.quadraticCurveTo(
        shoulderX + armOffset + side * size * 0.14, shoulderY + stripeOffset - size * 0.035,
        shoulderX + armOffset + side * size * 0.06, shoulderY + stripeOffset + size * 0.01
      );
      ctx.stroke();
    }

    // Heavy shoulder pauldron with attack glow
    if (isAttacking) {
      ctx.shadowColor = "#ff8800";
      ctx.shadowBlur = 10 * zoom * attackIntensity;
    }
    const pauldronGrad = ctx.createRadialGradient(
      shoulderX + armOffset, shoulderY - size * 0.1, 0,
      shoulderX + armOffset, shoulderY - size * 0.1, size * 0.25
    );
    pauldronGrad.addColorStop(0, isAttacking ? "#7a6a58" : "#6a5a48");
    pauldronGrad.addColorStop(0.4, "#5a4a38");
    pauldronGrad.addColorStop(0.7, "#4a3a28");
    pauldronGrad.addColorStop(1, "#2a2218");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(
      shoulderX + armOffset,
      shoulderY - size * 0.08,
      size * 0.22,
      size * 0.18,
      armRotation * 0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pauldron spikes
    for (let spike = -1; spike <= 1; spike++) {
      const spikeAngle = armRotation * 0.5 + spike * 0.4;
      const spikeX = shoulderX + armOffset + Math.cos(spikeAngle - Math.PI * 0.5) * size * 0.15;
      const spikeY = shoulderY - size * 0.08 + Math.sin(spikeAngle - Math.PI * 0.5) * size * 0.1;
      const spikeLen = spike === 0 ? size * 0.2 : size * 0.14;
      
      ctx.fillStyle = "#3a3028";
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.025, spikeY);
      ctx.lineTo(spikeX + side * spikeLen * 0.3, spikeY - spikeLen);
      ctx.lineTo(spikeX + size * 0.025, spikeY);
      ctx.closePath();
      ctx.fill();
      // Spike highlight
      ctx.strokeStyle = "#5a4a38";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.015, spikeY);
      ctx.lineTo(spikeX + side * spikeLen * 0.25, spikeY - spikeLen + size * 0.02);
      ctx.stroke();
    }

    // Gold trim on pauldron - glows during attack
    ctx.strokeStyle = isAttacking ? `rgba(255, 180, 50, ${0.8 + attackIntensity * 0.2})` : "#c9a227";
    ctx.lineWidth = (2 + (isAttacking ? attackIntensity : 0)) * zoom;
    if (isAttacking) {
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 8 * zoom * attackIntensity;
    }
    ctx.beginPath();
    ctx.ellipse(
      shoulderX + armOffset,
      shoulderY - size * 0.08,
      size * 0.22,
      size * 0.18,
      armRotation * 0.5,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pauldron gem - glows intensely during attack
    ctx.fillStyle = isAttacking ? "#ff6600" : "#ff4400";
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = (isAttacking ? 12 + attackIntensity * 10 : 5) * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(shoulderX + armOffset, shoulderY - size * 0.1, size * (0.03 + (isAttacking ? attackIntensity * 0.01 : 0)), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // === ARMORED CLAW GAUNTLETS ===
    // Claws move with arms - raise up during wind-up, extend down during strike
    const clawX = shoulderX + armOffset * 1.8 + side * size * 0.15;
    const clawY = y + size * 0.28 - armRaise * 0.8; // Claws raise with arms
    const clawExtend = isAttacking ? attackIntensity * size * 0.3 : 0;

    // Paw base with fur - glows during attack
    if (isAttacking) {
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 15 * zoom * attackIntensity;
    }
    const pawGrad = ctx.createRadialGradient(clawX, clawY - size * 0.06, 0, clawX, clawY - size * 0.06, size * 0.16);
    pawGrad.addColorStop(0, isAttacking ? "#ffbb66" : "#ffaa55");
    pawGrad.addColorStop(0.6, isAttacking ? "#ff9944" : "#ff8833");
    pawGrad.addColorStop(1, "#cc5500");
    ctx.fillStyle = pawGrad;
    ctx.beginPath();
    ctx.ellipse(clawX, clawY - size * 0.04, size * 0.14, size * 0.12, armRotation * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Metal claw guards/gauntlet
    const gauntletGrad = ctx.createLinearGradient(clawX - size * 0.1, clawY, clawX + size * 0.1, clawY);
    gauntletGrad.addColorStop(0, "#2a2218");
    gauntletGrad.addColorStop(0.3, "#4a3a28");
    gauntletGrad.addColorStop(0.5, "#5a4a38");
    gauntletGrad.addColorStop(0.7, "#4a3a28");
    gauntletGrad.addColorStop(1, "#2a2218");
    ctx.fillStyle = gauntletGrad;
    ctx.beginPath();
    ctx.moveTo(clawX - size * 0.1, clawY - size * 0.08);
    ctx.lineTo(clawX - size * 0.12, clawY + size * 0.04);
    ctx.lineTo(clawX + size * 0.12, clawY + size * 0.04);
    ctx.lineTo(clawX + size * 0.1, clawY - size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Deadly claws with metal tips
    for (let c = 0; c < 4; c++) {
      const clawAngle = (c - 1.5) * 0.35 + side * (clawSwipe * 0.4);
      const clawBaseX = clawX + Math.sin(clawAngle) * size * 0.12;
      const clawBaseY = clawY + size * 0.04 + Math.cos(clawAngle) * size * 0.04;
      
      ctx.save();
      ctx.translate(clawBaseX, clawBaseY);
      ctx.rotate(clawAngle * 0.4);
      
      // Metal-reinforced claw
      const metalClawGrad = ctx.createLinearGradient(0, 0, 0, size * 0.16 + clawExtend);
      metalClawGrad.addColorStop(0, "#4a4a4a");
      metalClawGrad.addColorStop(0.2, "#2a2a2a");
      metalClawGrad.addColorStop(0.6, "#1a1a1a");
      metalClawGrad.addColorStop(0.85, "#3a3a3a");
      metalClawGrad.addColorStop(1, "#ffffff");
      ctx.fillStyle = metalClawGrad;
      
      ctx.beginPath();
      ctx.moveTo(-size * 0.028, 0);
      ctx.quadraticCurveTo(-size * 0.032, size * 0.08 + clawExtend * 0.5, 0, size * 0.16 + clawExtend);
      ctx.quadraticCurveTo(size * 0.032, size * 0.08 + clawExtend * 0.5, size * 0.028, 0);
      ctx.closePath();
      ctx.fill();
      
      // Claw highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(-size * 0.012, size * 0.025);
      ctx.lineTo(0, size * 0.14 + clawExtend * 0.85);
      ctx.stroke();
      
      ctx.restore();
    }

    // === EPIC CLAW SLASH EFFECT (Top-Down Diagonal Swipe) ===
    // Only trigger during the swing-down phase (after arms are raised)
    if (isAttacking && attackPhase > 0.35 && attackPhase < 0.95) {
      const slashProgress = (attackPhase - 0.35) / 0.6;
      const slashAlpha = Math.sin(slashProgress * Math.PI) * 0.95;
      
      // Starting position matches raised arm position
      const slashStartX = shoulderX + side * size * 0.2;
      const slashStartY = y - size * 0.5; // High starting point
      
      // Four parallel slash marks sweeping down diagonally
      for (let s = 0; s < 4; s++) {
        const slashOffset = s * size * 0.065;
        const slashEndX = shoulderX + side * size * 0.7 * slashProgress;
        const slashEndY = y + size * 0.65 * slashProgress;
        
        // Main slash trail gradient - brighter and more intense
        const slashGrad = ctx.createLinearGradient(
          slashStartX + slashOffset * side, slashStartY,
          slashEndX + slashOffset * side, slashEndY
        );
        slashGrad.addColorStop(0, `rgba(255, 255, 220, ${slashAlpha * 0.4})`);
        slashGrad.addColorStop(0.15, `rgba(255, 240, 120, ${slashAlpha})`);
        slashGrad.addColorStop(0.4, `rgba(255, 160, 20, ${slashAlpha * 0.9})`);
        slashGrad.addColorStop(0.7, `rgba(255, 100, 0, ${slashAlpha * 0.6})`);
        slashGrad.addColorStop(1, `rgba(255, 60, 0, 0)`);
        
        ctx.strokeStyle = slashGrad;
        ctx.lineWidth = (7 - s * 1.2) * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(slashStartX + slashOffset * side, slashStartY + slashOffset * 0.4);
        ctx.bezierCurveTo(
          slashStartX + side * size * 0.35 + slashOffset * side, slashStartY + size * 0.25,
          shoulderX + side * size * 0.5 + slashOffset * side, y + size * 0.15,
          slashEndX + slashOffset * side, slashEndY + slashOffset * 0.6
        );
        ctx.stroke();
      }
      
      // Add spark particles along the slash - more particles, more dynamic
      if (slashProgress > 0.2 && slashProgress < 0.85) {
        for (let spark = 0; spark < 12; spark++) {
          const sparkProgress = slashProgress * 0.75 + spark * 0.04;
          const sparkX = slashStartX + (shoulderX + side * size * 0.55 - slashStartX) * sparkProgress + side * Math.sin(spark * 2.5 + time * 10) * size * 0.06;
          const sparkY = slashStartY + (y + size * 0.45 - slashStartY) * sparkProgress + Math.cos(spark * 3.5 + time * 8) * size * 0.05;
          const sparkAlpha = slashAlpha * (1 - spark * 0.07);
          const sparkSize = size * (0.022 - spark * 0.0012);
          
          // Glow behind sparks
          ctx.shadowColor = "#ff8800";
          ctx.shadowBlur = 6 * zoom;
          ctx.fillStyle = spark % 3 === 0 
            ? `rgba(255, 255, 180, ${sparkAlpha})` 
            : spark % 3 === 1
            ? `rgba(255, 200, 80, ${sparkAlpha * 0.9})`
            : `rgba(255, 140, 20, ${sparkAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  // === ARMORED LEG GUARDS ===
  for (let side = -1; side <= 1; side += 2) {
    const legX = x + side * size * 0.28;
    const legY = y + size * 0.5;
    
    // Leg fur
    ctx.fillStyle = "#dd6600";
    ctx.beginPath();
    ctx.ellipse(legX, legY, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Leg armor
    const legArmorGrad = ctx.createLinearGradient(legX - size * 0.08, legY - size * 0.1, legX + size * 0.08, legY + size * 0.1);
    legArmorGrad.addColorStop(0, "#3a3028");
    legArmorGrad.addColorStop(0.5, "#5a4a38");
    legArmorGrad.addColorStop(1, "#3a3028");
    ctx.fillStyle = legArmorGrad;
    ctx.beginPath();
    ctx.moveTo(legX - size * 0.08, legY - size * 0.08);
    ctx.lineTo(legX - size * 0.1, legY + size * 0.1);
    ctx.lineTo(legX + size * 0.1, legY + size * 0.1);
    ctx.lineTo(legX + size * 0.08, legY - size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // === FIERCE ARMORED TIGER HEAD ===
  // Head bobs slightly with breathing
  const headY = y - size * 0.55 + breathe * 0.1;
  const headX = x + idleSway * 0.15;
  
  // Attack glow on head
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 18 * zoom * attackIntensity;
  }
  
  const headGrad = ctx.createRadialGradient(
    headX, headY, 0,
    headX, headY, size * 0.42
  );
  headGrad.addColorStop(0, isAttacking ? "#ffbb55" : "#ffaa44");
  headGrad.addColorStop(0.4, isAttacking ? "#ff9933" : "#ff8822");
  headGrad.addColorStop(0.7, "#dd5500");
  headGrad.addColorStop(1, "#aa3300");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.4, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === WAR CROWN/HELMET ===
  const crownGrad = ctx.createLinearGradient(x - size * 0.35, y - size * 0.85, x + size * 0.35, y - size * 0.85);
  crownGrad.addColorStop(0, "#2a2218");
  crownGrad.addColorStop(0.3, "#5a4a38");
  crownGrad.addColorStop(0.5, "#6a5a48");
  crownGrad.addColorStop(0.7, "#5a4a38");
  crownGrad.addColorStop(1, "#2a2218");
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.72);
  ctx.lineTo(x - size * 0.38, y - size * 0.88);
  ctx.lineTo(x - size * 0.2, y - size * 0.78);
  ctx.lineTo(x - size * 0.12, y - size * 0.95);
  ctx.lineTo(x, y - size * 0.82);
  ctx.lineTo(x + size * 0.12, y - size * 0.95);
  ctx.lineTo(x + size * 0.2, y - size * 0.78);
  ctx.lineTo(x + size * 0.38, y - size * 0.88);
  ctx.lineTo(x + size * 0.32, y - size * 0.72);
  ctx.closePath();
  ctx.fill();

  // Crown gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Crown gems
  const crownGemPositions = [
    { x: x - size * 0.12, y: y - size * 0.9 },
    { x: x, y: y - size * 0.78 },
    { x: x + size * 0.12, y: y - size * 0.9 }
  ];
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  for (const gem of crownGemPositions) {
    ctx.fillStyle = "#ff4400";
    ctx.beginPath();
    ctx.arc(gem.x, gem.y, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Forehead armor plate
  ctx.fillStyle = "#4a3a28";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.7);
  ctx.lineTo(x, y - size * 0.58);
  ctx.lineTo(x + size * 0.22, y - size * 0.7);
  ctx.lineTo(x + size * 0.15, y - size * 0.75);
  ctx.lineTo(x, y - size * 0.68);
  ctx.lineTo(x - size * 0.15, y - size * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // === HEAD STRIPES ===
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 3 * zoom;
  ctx.lineCap = "round";
  // Cheek stripes (bold, jagged)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.58);
  ctx.lineTo(x - size * 0.25, y - size * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.5);
  ctx.lineTo(x - size * 0.22, y - size * 0.46);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.38, y - size * 0.58);
  ctx.lineTo(x + size * 0.25, y - size * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.36, y - size * 0.5);
  ctx.lineTo(x + size * 0.22, y - size * 0.46);
  ctx.stroke();

  // === FIERCE POINTED EARS WITH ARMOR ===
  for (let side = -1; side <= 1; side += 2) {
    // Ear base
    ctx.fillStyle = "#dd6600";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.28, y - size * 0.72);
    ctx.lineTo(x + side * size * 0.42, y - size * 1.0);
    ctx.lineTo(x + side * size * 0.18, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Dark ear tips
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.36, y - size * 0.9);
    ctx.lineTo(x + side * size * 0.42, y - size * 1.0);
    ctx.lineTo(x + side * size * 0.32, y - size * 0.88);
    ctx.closePath();
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#ffccaa";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.27, y - size * 0.74);
    ctx.lineTo(x + side * size * 0.35, y - size * 0.88);
    ctx.lineTo(x + side * size * 0.2, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Ear armor ring
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(x + side * size * 0.3, y - size * 0.78, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MUZZLE ===
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.44, size * 0.18, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Whisker dots (prominent white)
  ctx.fillStyle = "#ffffff";
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const dotX = x + side * (size * 0.06 + col * size * 0.035);
        const dotY = y - size * 0.46 + row * size * 0.03;
        ctx.beginPath();
        ctx.arc(dotX, dotY, size * 0.012, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Nose (larger, more fierce)
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  ctx.lineTo(x - size * 0.08, y - size * 0.44);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.08, y - size * 0.44);
  ctx.closePath();
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "#3a2a20";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.02, y - size * 0.48, size * 0.015, size * 0.01, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // === GLOWING FIERCE EYES ===
  const eyeGlow = 0.9 + Math.sin(time * 4) * 0.1 + attackIntensity * 0.3;
  const eyeY = y - size * 0.62 + breathe * 0.08; // Eyes move slightly with breathing
  
  // Eye socket shadows
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, eyeY, size * 0.11, size * 0.085, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.15, eyeY, size * 0.11, size * 0.085, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes - INTENSE glow during attack
  ctx.shadowColor = isAttacking ? "#ff4400" : "#ffaa00";
  ctx.shadowBlur = (isAttacking ? 25 + attackIntensity * 20 : 12) * zoom;
  ctx.fillStyle = isAttacking
    ? `rgba(255, 100, 0, ${eyeGlow})`
    : `rgba(255, 180, 0, ${eyeGlow})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, eyeY, size * (0.1 + attackIntensity * 0.015), size * (0.07 + attackIntensity * 0.01), -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.15, eyeY, size * (0.1 + attackIntensity * 0.015), size * (0.07 + attackIntensity * 0.01), 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Angry brow ridges
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.68);
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.72, x - size * 0.08, y - size * 0.68);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.68);
  ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.72, x + size * 0.08, y - size * 0.68);
  ctx.stroke();

  // Slit pupils (menacing) - narrow during attack
  const pupilWidth = isAttacking ? size * 0.018 : size * 0.025;
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, eyeY, pupilWidth, size * 0.06, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.15, eyeY, pupilWidth, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye glints
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, eyeY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.18, eyeY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // === ROARING MOUTH ===
  const mouthOpen = isAttacking
    ? size * 0.06 + attackIntensity * size * 0.08
    : size * 0.04;
  
  // Mouth interior
  ctx.fillStyle = "#2a0000";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.34, size * 0.14 + attackIntensity * 0.04, mouthOpen, 0, 0, Math.PI);
  ctx.fill();

  // Tongue
  ctx.fillStyle = "#cc4466";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.32 + mouthOpen * 0.4, size * 0.08, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // === MASSIVE FANGS ===
  ctx.fillStyle = "#fffff8";
  // Left fang
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.4);
  ctx.lineTo(x - size * 0.06, y - size * 0.26 + attackIntensity * size * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Right fang
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.4);
  ctx.lineTo(x + size * 0.06, y - size * 0.26 + attackIntensity * size * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Fang highlights
  ctx.strokeStyle = "rgba(200, 200, 200, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.38);
  ctx.lineTo(x - size * 0.06, y - size * 0.28);
  ctx.moveTo(x + size * 0.08, y - size * 0.38);
  ctx.lineTo(x + size * 0.06, y - size * 0.28);
  ctx.stroke();

  ctx.restore();

  // === BATTLE ROAR EFFECT ===
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.65) {
    const roarProgress = (attackPhase - 0.15) / 0.5;
    const roarAlpha = Math.sin(roarProgress * Math.PI) * 0.6;
    for (let w = 0; w < 4; w++) {
      const waveRadius = size * 0.4 + w * size * 0.2 * roarProgress;
      ctx.strokeStyle = w % 2 === 0
        ? `rgba(255, 150, 0, ${roarAlpha * (1 - w * 0.2)})`
        : `rgba(255, 80, 0, ${roarAlpha * (1 - w * 0.2)})`;
      ctx.lineWidth = (4 - w * 0.8) * zoom;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.45, waveRadius, -0.9, 0.9);
      ctx.stroke();
    }
  }

}

function drawTenorHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // GRAND ORNATE TENOR - Triangle Club Opera Master with devastating voice attacks
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const singWave = Math.sin(time * 3) * 3;
  const breathe = Math.sin(time * 2) * 1.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // === MULTI-LAYERED SONIC AURA ===
  const auraBase = isAttacking ? 0.4 : 0.2;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x, y - size * 0.2, size * (0.1 + layerOffset),
      x, y - size * 0.2, size * (0.95 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.04) * auraPulse;
    auraGrad.addColorStop(0, `rgba(147, 112, 219, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.4, `rgba(180, 150, 235, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.7, `rgba(255, 102, 0, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(147, 112, 219, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, size * (0.9 + layerOffset * 0.2), size * (0.65 + layerOffset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating musical particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.8 + p * Math.PI * 0.2) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 2.5 + p * 0.7) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - size * 0.2 + Math.sin(pAngle) * pDist * 0.5;
    const pAlpha = 0.55 + Math.sin(time * 4 + p * 0.6) * 0.3;
    ctx.fillStyle = p % 2 === 0 ? `rgba(147, 112, 219, ${pAlpha})` : `rgba(255, 102, 0, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // === SONIC SHOCKWAVE RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 5; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      // Outer ring
      ctx.strokeStyle = `rgba(147, 112, 219, ${ringAlpha})`;
      ctx.lineWidth = (4 - ring * 0.6) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.25, size * (0.55 + ringPhase * 0.9), size * (0.42 + ringPhase * 0.7), 0, 0, Math.PI * 2);
      ctx.stroke();
      // Inner bright ring
      ctx.strokeStyle = `rgba(255, 200, 255, ${ringAlpha * 0.4})`;
      ctx.lineWidth = (2 - ring * 0.3) * zoom;
      ctx.stroke();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.45);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ELEGANT FORMAL TUXEDO WITH PURPLE HIGHLIGHTS ===
  // Tuxedo jacket main body - deep purple undertones
  const tuxGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.3, x + size * 0.4, y + size * 0.4);
  tuxGrad.addColorStop(0, "#0a0515");
  tuxGrad.addColorStop(0.15, "#1a1028");
  tuxGrad.addColorStop(0.35, "#251538");
  tuxGrad.addColorStop(0.5, "#301a45");
  tuxGrad.addColorStop(0.65, "#251538");
  tuxGrad.addColorStop(0.85, "#1a1028");
  tuxGrad.addColorStop(1, "#0a0515");
  ctx.fillStyle = tuxGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.52 + breathe);
  ctx.lineTo(x - size * 0.45, y - size * 0.14);
  ctx.lineTo(x - size * 0.35, y - size * 0.28);
  ctx.quadraticCurveTo(x, y - size * 0.38, x + size * 0.35, y - size * 0.28);
  ctx.lineTo(x + size * 0.45, y - size * 0.14);
  ctx.lineTo(x + size * 0.4, y + size * 0.52 + breathe);
  ctx.closePath();
  ctx.fill();

  // Tuxedo edge highlight - purple
  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5 + breathe);
  ctx.lineTo(x - size * 0.43, y - size * 0.12);
  ctx.lineTo(x - size * 0.33, y - size * 0.26);
  ctx.stroke();

  // Satin lapels - rich purple
  const lapelGrad = ctx.createLinearGradient(x - size * 0.3, y - size * 0.25, x, y + size * 0.1);
  lapelGrad.addColorStop(0, "#4a2060");
  lapelGrad.addColorStop(0.5, "#6a3080");
  lapelGrad.addColorStop(1, "#4a2060");
  ctx.fillStyle = lapelGrad;
  // Left lapel
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.26);
  ctx.lineTo(x - size * 0.16, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y + size * 0.15);
  ctx.lineTo(x - size * 0.35, y + size * 0.05);
  ctx.closePath();
  ctx.fill();
  // Right lapel
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.26);
  ctx.lineTo(x + size * 0.16, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y + size * 0.15);
  ctx.lineTo(x + size * 0.35, y + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Lapel borders - glowing purple
  ctx.strokeStyle = "#9060c0";
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 3 * zoom;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y + size * 0.15);
  ctx.moveTo(x + size * 0.16, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y + size * 0.15);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Elegant tuxedo tails
  const tailWave = Math.sin(time * 2.5) * 0.08;
  ctx.fillStyle = "#101015";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.35);
  ctx.bezierCurveTo(
    x - size * 0.38 - tailWave * size, y + size * 0.52,
    x - size * 0.35 - tailWave * size, y + size * 0.68,
    x - size * 0.3, y + size * 0.72
  );
  ctx.lineTo(x - size * 0.2, y + size * 0.58);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y + size * 0.35);
  ctx.bezierCurveTo(
    x + size * 0.38 + tailWave * size, y + size * 0.52,
    x + size * 0.35 + tailWave * size, y + size * 0.68,
    x + size * 0.3, y + size * 0.72
  );
  ctx.lineTo(x + size * 0.2, y + size * 0.58);
  ctx.closePath();
  ctx.fill();

  // Gold buttons
  ctx.fillStyle = "#c9a227";
  for (let btn = 0; btn < 3; btn++) {
  ctx.beginPath();
    ctx.arc(x - size * 0.2, y + size * 0.02 + btn * size * 0.12, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0c040";
    ctx.beginPath();
    ctx.arc(x - size * 0.2 - size * 0.005, y + size * 0.015 + btn * size * 0.12, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
  }

  // === DRAMATIC OPERA ARMS ===
  // Arm animation: idle = relaxed at sides, attacking = raised dramatically for opera singing
  const armRaiseLeft = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.8 : Math.sin(time * 1.5) * 0.1;
  const armRaiseRight = isAttacking ? Math.sin(attackPhase * Math.PI + 0.3) * 0.9 : Math.sin(time * 1.5 + 0.5) * 0.1;
  
  // Left arm (conducting arm - more dramatic)
  ctx.save();
  ctx.translate(x - size * 0.42, y - size * 0.1);
  ctx.rotate(-0.3 - armRaiseLeft * 1.2);
  
  // Left sleeve (tuxedo) - purple tones
  const leftSleeveGrad = ctx.createLinearGradient(0, 0, size * 0.15, size * 0.35);
  leftSleeveGrad.addColorStop(0, "#1a1028");
  leftSleeveGrad.addColorStop(0.5, "#2a1840");
  leftSleeveGrad.addColorStop(1, "#150a20");
  ctx.fillStyle = leftSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.08, size * 0.15, size * 0.05, size * 0.32);
  ctx.lineTo(-size * 0.08, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.15, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Left cuff - purple accent
  ctx.fillStyle = "#a060c0";
  ctx.beginPath();
  ctx.ellipse(-size * 0.015, size * 0.31, size * 0.07, size * 0.025, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Left hand
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, size * 0.37, size * 0.045, size * 0.06, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Fingers spread dramatically during attack
  if (isAttacking) {
    ctx.strokeStyle = "#f5d0a8";
    ctx.lineWidth = 3 * zoom;
    ctx.lineCap = "round";
    for (let f = 0; f < 5; f++) {
      const fingerAngle = -0.6 + f * 0.3;
      const fingerLen = size * (0.04 + (f === 2 ? 0.015 : 0));
      ctx.beginPath();
      ctx.moveTo(-size * 0.01 + Math.cos(fingerAngle) * size * 0.03, size * 0.37 + Math.sin(fingerAngle) * size * 0.045);
      ctx.lineTo(-size * 0.01 + Math.cos(fingerAngle) * (size * 0.03 + fingerLen), size * 0.37 + Math.sin(fingerAngle) * (size * 0.045 + fingerLen * 0.6));
      ctx.stroke();
    }
  }
  ctx.restore();
  
  // Right arm (supporting arm)
  ctx.save();
  ctx.translate(x + size * 0.42, y - size * 0.1);
  ctx.rotate(0.3 + armRaiseRight * 1.0);
  
  // Right sleeve (tuxedo) - purple tones
  const rightSleeveGrad = ctx.createLinearGradient(0, 0, -size * 0.15, size * 0.35);
  rightSleeveGrad.addColorStop(0, "#1a1028");
  rightSleeveGrad.addColorStop(0.5, "#2a1840");
  rightSleeveGrad.addColorStop(1, "#150a20");
  ctx.fillStyle = rightSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.15, -size * 0.05, size * 0.32);
  ctx.lineTo(size * 0.08, size * 0.3);
  ctx.quadraticCurveTo(size * 0.1, size * 0.15, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Right cuff - purple accent
  ctx.fillStyle = "#a060c0";
  ctx.beginPath();
  ctx.ellipse(size * 0.015, size * 0.31, size * 0.07, size * 0.025, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Right hand (cupped gesture for opera)
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, size * 0.37, size * 0.045, size * 0.06, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Fingers together, cupped during attack
  if (isAttacking) {
    ctx.strokeStyle = "#f5d0a8";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(size * 0.01, size * 0.4, size * 0.035, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();

  // Pocket square (purple silk)
  const pocketGrad = ctx.createLinearGradient(x - size * 0.32, y - size * 0.1, x - size * 0.24, y - size * 0.05);
  pocketGrad.addColorStop(0, "#8040a0");
  pocketGrad.addColorStop(0.5, "#a060c0");
  pocketGrad.addColorStop(1, "#8040a0");
  ctx.fillStyle = pocketGrad;
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.1);
  ctx.lineTo(x - size * 0.28, y - size * 0.15);
  ctx.lineTo(x - size * 0.24, y - size * 0.08);
  ctx.lineTo(x - size * 0.26, y - size * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // === PRISTINE WHITE SHIRT WITH RUFFLES ===
  const shirtGrad = ctx.createLinearGradient(x - size * 0.15, y - size * 0.2, x + size * 0.15, y + size * 0.3);
  shirtGrad.addColorStop(0, "#ffffff");
  shirtGrad.addColorStop(0.5, "#f8f8f8");
  shirtGrad.addColorStop(1, "#f0f0f0");
  ctx.fillStyle = shirtGrad;
    ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.24);
  ctx.lineTo(x - size * 0.12, y + size * 0.38);
  ctx.lineTo(x + size * 0.12, y + size * 0.38);
  ctx.lineTo(x + size * 0.15, y - size * 0.24);
  ctx.closePath();
  ctx.fill();

  // Elaborate ruffle details
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 5; i++) {
    const ruffY = y - size * 0.12 + i * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, ruffY);
    ctx.quadraticCurveTo(x - size * 0.03, ruffY + size * 0.025, x, ruffY);
    ctx.quadraticCurveTo(x + size * 0.03, ruffY + size * 0.025, x + size * 0.1, ruffY);
    ctx.stroke();
  }

  // === ORNATE PURPLE BOW TIE ===
  const bowGlow = isAttacking ? 0.6 + attackIntensity * 0.4 : 0.3;
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = (isAttacking ? 12 * attackIntensity : 4) * zoom;
  // Left bow
  const bowGrad = ctx.createLinearGradient(x - size * 0.14, y - size * 0.2, x, y - size * 0.16);
  bowGrad.addColorStop(0, "#6030a0");
  bowGrad.addColorStop(0.5, "#9050c0");
  bowGrad.addColorStop(1, "#a070d0");
  ctx.fillStyle = bowGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.19);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.26, x - size * 0.14, y - size * 0.24);
  ctx.quadraticCurveTo(x - size * 0.16, y - size * 0.18, x - size * 0.14, y - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.1, x - size * 0.02, y - size * 0.17);
  ctx.closePath();
  ctx.fill();
  // Right bow
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.19);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.26, x + size * 0.14, y - size * 0.24);
  ctx.quadraticCurveTo(x + size * 0.16, y - size * 0.18, x + size * 0.14, y - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.1, x + size * 0.02, y - size * 0.17);
  ctx.closePath();
  ctx.fill();
  // Bow center knot
  ctx.fillStyle = "#6030a0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.18, size * 0.035, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bow gem - glowing purple
  ctx.fillStyle = "#c090e0";
  ctx.shadowColor = "#d0a0ff";
  ctx.shadowBlur = isAttacking ? 8 * zoom * gemPulse : 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === DRAMATIC OPERA HEAD ===
  const headY = y - size * 0.48 + singWave * 0.2 + breathe * 0.1;
  
  // Head with subtle skin gradient
  const skinGrad = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.05, 0, x, headY, size * 0.28);
  skinGrad.addColorStop(0, "#ffe8d0");
  skinGrad.addColorStop(0.6, "#ffe0bd");
  skinGrad.addColorStop(1, "#f5d0a8");
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Cheekbone highlights
  ctx.fillStyle = "rgba(255, 200, 180, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.12, headY + size * 0.02, size * 0.06, size * 0.04, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.12, headY + size * 0.02, size * 0.06, size * 0.04, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === ELABORATE SLICKED HAIR ===
  const hairGrad = ctx.createLinearGradient(x - size * 0.25, headY - size * 0.2, x + size * 0.25, headY - size * 0.3);
  hairGrad.addColorStop(0, "#0a0500");
  hairGrad.addColorStop(0.3, "#1a0a00");
  hairGrad.addColorStop(0.5, "#2a1505");
  hairGrad.addColorStop(0.7, "#1a0a00");
  hairGrad.addColorStop(1, "#0a0500");
  ctx.fillStyle = hairGrad;
  
  // Main hair shape
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, headY - size * 0.06);
  ctx.quadraticCurveTo(x - size * 0.32, headY - size * 0.25, x - size * 0.15, headY - size * 0.32);
  ctx.quadraticCurveTo(x, headY - size * 0.35, x + size * 0.15, headY - size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.32, headY - size * 0.25, x + size * 0.25, headY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Hair wave crest
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, headY - size * 0.08);
  ctx.bezierCurveTo(
    x - size * 0.35, headY - size * 0.3,
    x - size * 0.1, headY - size * 0.38,
    x, headY - size * 0.35
  );
  ctx.bezierCurveTo(
    x + size * 0.1, headY - size * 0.38,
    x + size * 0.35, headY - size * 0.3,
    x + size * 0.22, headY - size * 0.08
  );
  ctx.fill();

  // Hair highlights
  ctx.strokeStyle = "#3a2010";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let strand = 0; strand < 5; strand++) {
    const strandX = x - size * 0.15 + strand * size * 0.075;
    ctx.beginPath();
    ctx.moveTo(strandX, headY - size * 0.1);
    ctx.quadraticCurveTo(strandX - size * 0.02, headY - size * 0.22, strandX + size * 0.01, headY - size * 0.32);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === DRAMATIC OPERA EYES ===
  if (isAttacking) {
    // Glowing closed eyes during attack
    ctx.fillStyle = `rgba(147, 112, 219, ${0.6 + attackIntensity * 0.4})`;
    ctx.shadowColor = "#9370db";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.1, headY + size * 0.01, size * 0.05, size * 0.015, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.1, headY + size * 0.01, size * 0.05, size * 0.015, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Dramatic closed eyes (operatic expression)
    ctx.strokeStyle = "#1a0a00";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x - size * 0.1, headY + size * 0.01, size * 0.055, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size * 0.1, headY + size * 0.01, size * 0.055, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // Eyelashes
    ctx.lineWidth = 1.5 * zoom;
    for (let lash = 0; lash < 3; lash++) {
      const lashAngle = 0.3 + lash * 0.25;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.1 + Math.cos(lashAngle) * size * 0.055, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.055);
      ctx.lineTo(x - size * 0.1 + Math.cos(lashAngle) * size * 0.08, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.1 - Math.cos(lashAngle) * size * 0.055, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.055);
      ctx.lineTo(x + size * 0.1 - Math.cos(lashAngle) * size * 0.08, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.08);
    ctx.stroke();
    }
  }

  // Dramatic eyebrows
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, headY - size * 0.06);
  ctx.quadraticCurveTo(x - size * 0.1, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0), x - size * 0.04, headY - size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, headY - size * 0.06);
  ctx.quadraticCurveTo(x + size * 0.1, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0), x + size * 0.04, headY - size * 0.05);
  ctx.stroke();

  // === POWERFUL SINGING MOUTH ===
  const mouthOpen = isAttacking ? 0.16 + attackIntensity * 0.1 : 0.12;
  const mouthY = headY + size * 0.12;

  // Mouth interior (dark)
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.ellipse(x, mouthY, size * 0.1, size * mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue (subtle)
  ctx.fillStyle = "#8a3030";
  ctx.beginPath();
  ctx.ellipse(x, mouthY + size * 0.03, size * 0.06, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teeth row
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.rect(x - size * 0.07, mouthY - size * mouthOpen * 0.6, size * 0.14, size * 0.03);
  ctx.fill();
  // Individual teeth lines
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 0.5;
  for (let tooth = -2; tooth <= 2; tooth++) {
    ctx.beginPath();
    ctx.moveTo(x + tooth * size * 0.025, mouthY - size * mouthOpen * 0.6);
    ctx.lineTo(x + tooth * size * 0.025, mouthY - size * mouthOpen * 0.6 + size * 0.03);
    ctx.stroke();
  }

  // Lips
  ctx.strokeStyle = "#a06060";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, mouthY, size * 0.11, size * mouthOpen + size * 0.01, 0, 0, Math.PI * 2);
  ctx.stroke();

  // === FLOATING MUSICAL NOTES (elaborate) ===
  const noteCount = isAttacking ? 10 : 5;
  for (let i = 0; i < noteCount; i++) {
    const notePhase = (time * 2.2 + i * 0.4) % 2;
    const noteAngle = -0.6 + (i / noteCount) * 1.2;
    const noteSpiral = Math.sin(notePhase * Math.PI * 2) * size * 0.1;
    const noteX = x + size * (0.35 + notePhase * 0.6) * Math.cos(noteAngle) + noteSpiral;
    const noteY = y - size * 0.3 - notePhase * size * 0.7 + Math.sin(notePhase * Math.PI * 1.5) * size * 0.15;
    const noteAlpha = (1 - notePhase / 2) * (isAttacking ? 0.95 : 0.75);
    const noteSize = (16 + (isAttacking ? 6 : 0) - notePhase * 4) * zoom;

    // Note glow
    ctx.shadowColor = i % 2 === 0 ? "#ff6600" : "#9370db";
    ctx.shadowBlur = isAttacking ? 10 * zoom : 5 * zoom;

    ctx.fillStyle = i % 2 === 0 ? `rgba(255, 102, 0, ${noteAlpha})` : `rgba(147, 112, 219, ${noteAlpha})`;
    ctx.font = `${noteSize}px Arial`;
    ctx.textAlign = "center";
    const noteSymbol = i % 4 === 0 ? "♪" : i % 4 === 1 ? "♫" : i % 4 === 2 ? "♬" : "♩";
    ctx.fillText(noteSymbol, noteX, noteY);
  }
  ctx.shadowBlur = 0;

  // === SOUND WAVE STAFF LINES ===
  ctx.globalAlpha = isAttacking ? 0.6 : 0.3;
  ctx.strokeStyle = "#9370db";
  ctx.lineWidth = 1.5 * zoom;
  for (let staff = 0; staff < 3; staff++) {
    const staffY = y - size * 0.7 - staff * size * 0.08;
    const staffWave = Math.sin(time * 5 + staff * 0.5) * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, staffY + staffWave);
    for (let point = 0; point <= 20; point++) {
      const px = x - size * 0.6 + point * size * 0.06;
      const py = staffY + Math.sin(time * 6 + point * 0.3 + staff) * size * 0.02;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === ELABORATE SONIC AURA RINGS ===
  for (let i = 0; i < 4; i++) {
    const ringPhase = (time * 2.5 + i * 0.35) % 1;
    const ringRadius = size * (0.5 + ringPhase * 0.6);
    const ringAlpha = (1 - ringPhase) * (isAttacking ? 0.75 : 0.45);
    
    // Outer ring
    ctx.strokeStyle = `rgba(147, 112, 219, ${ringAlpha})`;
    ctx.lineWidth = (3 - i * 0.4) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, ringRadius, ringRadius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner golden ring
    ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha * 0.5})`;
    ctx.lineWidth = (1.5 - i * 0.2) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, ringRadius * 0.95, ringRadius * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === SPOTLIGHT EFFECT ===
  if (isAttacking) {
    const spotGrad = ctx.createRadialGradient(x, y - size * 0.5, 0, x, y, size * 1.2);
    spotGrad.addColorStop(0, `rgba(255, 255, 200, ${attackIntensity * 0.15})`);
    spotGrad.addColorStop(0.5, `rgba(255, 220, 150, ${attackIntensity * 0.08})`);
    spotGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, size * 1.2, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMatheyKnightHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // COLOSSAL JUGGERNAUT KNIGHT - Massive heavily armored warrior with devastating war hammer
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const heavyStance = Math.sin(time * 1.5) * 1.5; // Slower, heavier movement
  const breathe = Math.sin(time * 1.8) * 1.5;
  const gemPulse = Math.sin(time * 2) * 0.3 + 0.7;

  // === MULTI-LAYERED FROST/STEEL AURA ===
  const auraIntensity = isAttacking ? 0.55 : 0.28;
  const auraPulse = 0.85 + Math.sin(time * 2.5) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x, y, size * (0.12 + layerOffset),
      x, y, size * (1.0 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(0, `rgba(100, 180, 255, ${auraIntensity * auraPulse * (0.45 - auraLayer * 0.1)})`);
    auraGrad.addColorStop(0.4, `rgba(150, 200, 255, ${auraIntensity * auraPulse * (0.3 - auraLayer * 0.06)})`);
    auraGrad.addColorStop(0.7, `rgba(200, 220, 255, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.03)})`);
    auraGrad.addColorStop(1, "rgba(100, 180, 255, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * (0.95 + layerOffset * 0.2), size * (0.65 + layerOffset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating frost/steel particles
  for (let p = 0; p < 12; p++) {
    const pAngle = (time * 0.8 + p * Math.PI * 0.167) % (Math.PI * 2);
    const pDist = size * 0.7 + Math.sin(time * 1.5 + p * 0.6) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.5;
    const pAlpha = 0.55 + Math.sin(time * 3 + p * 0.4) * 0.3;
    // Ice crystal particle
    ctx.fillStyle = p % 3 === 0 ? `rgba(200, 230, 255, ${pAlpha})` : `rgba(100, 180, 255, ${pAlpha})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 2 + p);
    // Diamond shape
    ctx.moveTo(0, -size * 0.025);
    ctx.lineTo(size * 0.015, 0);
    ctx.lineTo(0, size * 0.025);
    ctx.lineTo(-size * 0.015, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // === DEEP SHADOW ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.55, 0, x, y + size * 0.55, size * 0.6);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.6, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // === MASSIVE BULKY PLATE ARMOR BODY ===
  // This knight is significantly wider and heavier
  const armorGrad = ctx.createLinearGradient(x - size * 0.55, y - size * 0.35, x + size * 0.55, y + size * 0.45);
  armorGrad.addColorStop(0, "#252535");
  armorGrad.addColorStop(0.1, "#404058");
  armorGrad.addColorStop(0.25, "#505070");
  armorGrad.addColorStop(0.4, "#606088");
  armorGrad.addColorStop(0.5, "#707098");
  armorGrad.addColorStop(0.6, "#606088");
  armorGrad.addColorStop(0.75, "#505070");
  armorGrad.addColorStop(0.9, "#404058");
  armorGrad.addColorStop(1, "#252535");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  // Much wider, bulkier body shape
  ctx.moveTo(x - size * 0.52, y + size * 0.55 + breathe);
  ctx.lineTo(x - size * 0.58, y + size * 0.1);
  ctx.lineTo(x - size * 0.55, y - size * 0.15);
  ctx.lineTo(x - size * 0.4, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.4, y - size * 0.32);
  ctx.lineTo(x + size * 0.55, y - size * 0.15);
  ctx.lineTo(x + size * 0.58, y + size * 0.1);
  ctx.lineTo(x + size * 0.52, y + size * 0.55 + breathe);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight (left side)
  ctx.strokeStyle = "#8888aa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y + size * 0.53 + breathe);
  ctx.lineTo(x - size * 0.56, y + size * 0.08);
  ctx.lineTo(x - size * 0.53, y - size * 0.13);
  ctx.lineTo(x - size * 0.38, y - size * 0.3);
  ctx.stroke();

  // Armor border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y + size * 0.55 + breathe);
  ctx.lineTo(x - size * 0.58, y + size * 0.1);
  ctx.lineTo(x - size * 0.55, y - size * 0.15);
  ctx.lineTo(x - size * 0.4, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.4, y - size * 0.32);
  ctx.lineTo(x + size * 0.55, y - size * 0.15);
  ctx.lineTo(x + size * 0.58, y + size * 0.1);
  ctx.lineTo(x + size * 0.52, y + size * 0.55 + breathe);
  ctx.closePath();
  ctx.stroke();

  // Heavy armor plate segments
  ctx.strokeStyle = "#303048";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  // Horizontal segments
  ctx.moveTo(x - size * 0.48, y - size * 0.08);
  ctx.lineTo(x + size * 0.48, y - size * 0.08);
  ctx.moveTo(x - size * 0.46, y + size * 0.12);
  ctx.lineTo(x + size * 0.46, y + size * 0.12);
  ctx.moveTo(x - size * 0.44, y + size * 0.32);
  ctx.lineTo(x + size * 0.44, y + size * 0.32);
  // Center vertical line
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x, y + size * 0.52);
  ctx.stroke();

  // Ice blue filigree patterns on armor
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  // Left ornate pattern
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.2);
  ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.05, x - size * 0.38, y + size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.32, y + size * 0.15, x - size * 0.38, y + size * 0.25);
  ctx.stroke();
  // Right ornate pattern
  ctx.beginPath();
  ctx.moveTo(x + size * 0.38, y - size * 0.2);
  ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.05, x + size * 0.38, y + size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.32, y + size * 0.15, x + size * 0.38, y + size * 0.25);
  ctx.stroke();
  // Center frost rune pattern
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15);
  ctx.lineTo(x, y - size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.15);
  ctx.moveTo(x - size * 0.1, y + size * 0.02);
  ctx.lineTo(x, y - size * 0.08);
  ctx.lineTo(x + size * 0.1, y + size * 0.02);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Heavy reinforced rivets in rows
  for (let row = 0; row < 4; row++) {
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Skip center
      const rivetX = x + i * size * 0.12;
      const rivetY = y - size * 0.08 + row * size * 0.16;
      // Rivet base
      ctx.fillStyle = "#404058";
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, size * 0.028, 0, Math.PI * 2);
      ctx.fill();
      // Rivet highlight
      ctx.fillStyle = "#707098";
      ctx.beginPath();
      ctx.arc(rivetX - size * 0.008, rivetY - size * 0.008, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      // Rivet border
      ctx.strokeStyle = "#252535";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, size * 0.028, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // === MASSIVE MATHEY CREST ON CHEST ===
  if (isAttacking) {
    ctx.shadowColor = "#60a0ff";
    ctx.shadowBlur = 18 * zoom * attackIntensity;
  }
  // Crest outer hexagonal frame
  ctx.fillStyle = "#80c0ff";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.lineTo(x - size * 0.18, y - size * 0.1);
  ctx.lineTo(x - size * 0.18, y + size * 0.12);
  ctx.lineTo(x, y + size * 0.28);
  ctx.lineTo(x + size * 0.18, y + size * 0.12);
  ctx.lineTo(x + size * 0.18, y - size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Crest inner dark blue
  ctx.fillStyle = "#1a3050";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x - size * 0.14, y - size * 0.06);
  ctx.lineTo(x - size * 0.14, y + size * 0.08);
  ctx.lineTo(x, y + size * 0.22);
  ctx.lineTo(x + size * 0.14, y + size * 0.08);
  ctx.lineTo(x + size * 0.14, y - size * 0.06);
  ctx.closePath();
  ctx.fill();
  // Frost gem in center
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = isAttacking ? 12 * zoom * gemPulse : 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Inner gem glow
  ctx.fillStyle = "#a0e0ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.01, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Crest "M" emblem with ice effect
  ctx.fillStyle = "#a0d0ff";
  ctx.font = `bold ${14 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("M", x, y + size * 0.14);

  // === COLOSSAL SHOULDER PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.62;
    
    // Massive pauldron base with gradient
    const pauldronGrad = ctx.createRadialGradient(pauldronX, y - size * 0.18, 0, pauldronX, y - size * 0.18, size * 0.3);
    pauldronGrad.addColorStop(0, "#707098");
    pauldronGrad.addColorStop(0.4, "#505070");
    pauldronGrad.addColorStop(0.7, "#404058");
    pauldronGrad.addColorStop(1, "#303048");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.16, size * 0.28, size * 0.22, side * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Pauldron layered plates (3 layers for heavy look)
    for (let layer = 0; layer < 3; layer++) {
      const layerY = y - size * 0.1 + layer * size * 0.08;
      const layerWidth = size * (0.22 - layer * 0.04);
      const layerHeight = size * (0.14 - layer * 0.03);
      ctx.fillStyle = `rgb(${80 + layer * 15}, ${80 + layer * 15}, ${100 + layer * 15})`;
      ctx.beginPath();
      ctx.ellipse(pauldronX + side * size * 0.04, layerY, layerWidth, layerHeight, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Layer edge
      ctx.strokeStyle = "#252535";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Ice blue trim
    ctx.strokeStyle = "#80c0ff";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.16, size * 0.28, size * 0.22, side * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Triple spike crown on each pauldron
    for (let spike = -1; spike <= 1; spike++) {
      const spikeX = pauldronX + side * size * 0.08 + spike * size * 0.08;
      const spikeLen = spike === 0 ? size * 0.35 : size * 0.25;
      ctx.fillStyle = "#404058";
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.025, y - size * 0.28);
      ctx.lineTo(spikeX, y - size * 0.28 - spikeLen);
      ctx.lineTo(spikeX + size * 0.025, y - size * 0.28);
      ctx.closePath();
      ctx.fill();
      // Spike edge highlight
      ctx.strokeStyle = "#707098";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.02, y - size * 0.28);
      ctx.lineTo(spikeX, y - size * 0.28 - spikeLen + size * 0.02);
      ctx.stroke();
    }
    
    // Pauldron frost gem
    ctx.fillStyle = "#40a0ff";
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 6 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(pauldronX, y - size * 0.18, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
    // Gem inner glow
    ctx.fillStyle = "#a0e0ff";
    ctx.beginPath();
    ctx.arc(pauldronX - size * 0.01, y - size * 0.19, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === HEAVY BARREL HELM ===
  // Different from Captain's - this is a brutal bucket helm
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.06, y - size * 0.58, size * 0.06,
    x, y - size * 0.52, size * 0.42
  );
  helmGrad.addColorStop(0, "#707098");
  helmGrad.addColorStop(0.25, "#606080");
  helmGrad.addColorStop(0.5, "#505068");
  helmGrad.addColorStop(0.75, "#404050");
  helmGrad.addColorStop(1, "#303040");
  ctx.fillStyle = helmGrad;
  // Barrel helm shape (taller, more rectangular)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.3);
  ctx.lineTo(x - size * 0.32, y - size * 0.7);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.92, x, y - size * 0.95);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.92, x + size * 0.32, y - size * 0.7);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Helm reinforcement bands
  ctx.strokeStyle = "#404058";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.31, y - size * 0.45);
  ctx.lineTo(x + size * 0.31, y - size * 0.45);
  ctx.moveTo(x - size * 0.32, y - size * 0.65);
  ctx.lineTo(x + size * 0.32, y - size * 0.65);
  ctx.stroke();

  // Center vertical reinforcement
  ctx.strokeStyle = "#505068";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x, y - size * 0.9);
  ctx.stroke();

  // Ice blue helm trim
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.32);
  ctx.lineTo(x - size * 0.32, y - size * 0.7);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.9, x, y - size * 0.93);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.9, x + size * 0.32, y - size * 0.7);
  ctx.lineTo(x + size * 0.3, y - size * 0.32);
  ctx.stroke();

  // Helm border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.3);
  ctx.lineTo(x - size * 0.32, y - size * 0.7);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.92, x, y - size * 0.95);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.92, x + size * 0.32, y - size * 0.7);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.stroke();

  // T-Visor (brutal, intimidating)
  ctx.fillStyle = "#0a0a15";
  ctx.beginPath();
  // Horizontal slit
  ctx.moveTo(x - size * 0.26, y - size * 0.58);
  ctx.lineTo(x + size * 0.26, y - size * 0.58);
  ctx.lineTo(x + size * 0.26, y - size * 0.48);
  ctx.lineTo(x - size * 0.26, y - size * 0.48);
  ctx.closePath();
  ctx.fill();
  // Vertical slit (forms the T)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.48);
  ctx.lineTo(x + size * 0.06, y - size * 0.48);
  ctx.lineTo(x + size * 0.06, y - size * 0.35);
  ctx.lineTo(x - size * 0.06, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Glowing eyes in T-visor
  ctx.fillStyle = isAttacking
    ? `rgba(100, 200, 255, ${0.8 + attackIntensity * 0.2})`
    : "rgba(80, 160, 220, 0.6)";
  if (isAttacking) {
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 10 * zoom;
  }
  // Left eye
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.53, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.arc(x + size * 0.12, y - size * 0.53, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Visor breathing holes
  ctx.fillStyle = "#0a0a15";
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.beginPath();
      ctx.arc(x - size * 0.18 + col * size * 0.04, y - size * 0.4 + row * size * 0.025, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.06 + col * size * 0.04, y - size * 0.4 + row * size * 0.025, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Helm crown with frost gem
  ctx.fillStyle = "#505068";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.93);
  ctx.lineTo(x, y - size * 1.05);
  ctx.lineTo(x + size * 0.08, y - size * 0.93);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = 8 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.97, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === NO PLUME - Instead, heavy metal horns ===
  for (let side = -1; side <= 1; side += 2) {
    const hornX = x + side * size * 0.25;
    // Horn base
    ctx.fillStyle = "#404058";
    ctx.beginPath();
    ctx.moveTo(hornX - side * size * 0.04, y - size * 0.82);
    ctx.quadraticCurveTo(
      hornX + side * size * 0.15, y - size * 1.0,
      hornX + side * size * 0.32, y - size * 0.9
    );
    ctx.quadraticCurveTo(
      hornX + side * size * 0.18, y - size * 0.85,
      hornX + side * size * 0.02, y - size * 0.78
    );
    ctx.closePath();
    ctx.fill();
    // Horn highlight
    ctx.strokeStyle = "#606080";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hornX - side * size * 0.02, y - size * 0.8);
    ctx.quadraticCurveTo(
      hornX + side * size * 0.12, y - size * 0.96,
      hornX + side * size * 0.28, y - size * 0.88
    );
    ctx.stroke();
    // Frost glow at horn tips
    ctx.fillStyle = "#60c0ff";
    ctx.shadowColor = "#80e0ff";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(hornX + side * size * 0.3, y - size * 0.89, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === ORNATE TOWER SHIELD (Left side) ===
  ctx.save();
  ctx.translate(x - size * 0.58, y + size * 0.05);
  ctx.rotate(0.2);

  // Shield shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.32);
  ctx.lineTo(-size * 0.2, -size * 0.2);
  ctx.lineTo(-size * 0.22, size * 0.25);
  ctx.lineTo(size * 0.02, size * 0.42);
  ctx.lineTo(size * 0.24, size * 0.25);
  ctx.lineTo(size * 0.26, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Shield body with frost steel gradient
  const shieldGrad = ctx.createLinearGradient(-size * 0.22, 0, size * 0.22, 0);
  shieldGrad.addColorStop(0, "#303050");
  shieldGrad.addColorStop(0.25, "#505078");
  shieldGrad.addColorStop(0.5, "#606090");
  shieldGrad.addColorStop(0.75, "#505078");
  shieldGrad.addColorStop(1, "#303050");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.35);
  ctx.lineTo(-size * 0.22, -size * 0.22);
  ctx.lineTo(-size * 0.24, size * 0.22);
  ctx.lineTo(0, size * 0.4);
  ctx.lineTo(size * 0.24, size * 0.22);
  ctx.lineTo(size * 0.22, -size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Shield edge highlight
  ctx.strokeStyle = "#8888aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.33);
  ctx.lineTo(-size * 0.2, -size * 0.2);
  ctx.stroke();

  // Shield border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.35);
  ctx.lineTo(-size * 0.22, -size * 0.22);
  ctx.lineTo(-size * 0.24, size * 0.22);
  ctx.lineTo(0, size * 0.4);
  ctx.lineTo(size * 0.24, size * 0.22);
  ctx.lineTo(size * 0.22, -size * 0.22);
  ctx.closePath();
  ctx.stroke();

  // Ice blue inner trim
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(-size * 0.17, -size * 0.18);
  ctx.lineTo(-size * 0.19, size * 0.18);
  ctx.lineTo(0, size * 0.34);
  ctx.lineTo(size * 0.19, size * 0.18);
  ctx.lineTo(size * 0.17, -size * 0.18);
  ctx.closePath();
  ctx.stroke();

  // Shield frost rune patterns
  ctx.strokeStyle = "#60a0ff";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.12, 0, -size * 0.08, size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.12, 0, size * 0.08, size * 0.12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Shield boss with "M" emblem
  ctx.fillStyle = "#80c0ff";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a3050";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  // "M" emblem
  ctx.fillStyle = "#80c0ff";
  ctx.font = `bold ${16 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("M", 0, size * 0.05);

  // Shield corner gems
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, -size * 0.26, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.14, size * 0.12, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.14, size * 0.12, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, size * 0.3, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === MASSIVE WAR HAMMER (Right side, angled away from face) ===
  // Epic attack animation: wind-up → overhead → devastating slam
  let hammerAngle: number;
  let hammerX: number;
  let hammerY: number;
  
  if (isAttacking) {
    // Phase 1 (0-0.3): Wind-up - hammer goes back and up
    // Phase 2 (0.3-0.6): Overhead swing - hammer arcs over
    // Phase 3 (0.6-1.0): Devastating slam - hammer crashes down
    if (attackPhase < 0.3) {
      // Wind-up: pull back
      const windUp = attackPhase / 0.3;
      hammerAngle = 0.8 + windUp * 1.5; // Rotate back
      hammerX = x + size * 0.55 + windUp * size * 0.15;
      hammerY = y - size * 0.1 - windUp * size * 0.2;
    } else if (attackPhase < 0.6) {
      // Overhead: arc forward
      const overheadProgress = (attackPhase - 0.3) / 0.3;
      hammerAngle = 2.3 - overheadProgress * 3.5; // Arc from back to front
      hammerX = x + size * 0.7 - overheadProgress * size * 0.3;
      hammerY = y - size * 0.3 + overheadProgress * size * 0.4;
    } else {
      // Slam: crash down
      const slamProgress = (attackPhase - 0.6) / 0.4;
      hammerAngle = -1.2 + slamProgress * 0.4; // Slight recovery
      hammerX = x + size * 0.4;
      hammerY = y + size * 0.1 - slamProgress * size * 0.15;
    }
  } else {
    // Idle: hammer resting at side, angled away from face
    hammerAngle = 0.6 + heavyStance * 0.02; // Tilted to the right
    hammerX = x + size * 0.6;
    hammerY = y + size * 0.15;
  }

  ctx.save();
  ctx.translate(hammerX, hammerY);
  ctx.rotate(hammerAngle);

  // Hammer handle - thick reinforced shaft
  const shaftGrad = ctx.createLinearGradient(-size * 0.05, -size * 0.1, size * 0.05, -size * 0.1);
  shaftGrad.addColorStop(0, "#2a1a10");
  shaftGrad.addColorStop(0.3, "#4a3020");
  shaftGrad.addColorStop(0.5, "#5a4030");
  shaftGrad.addColorStop(0.7, "#4a3020");
  shaftGrad.addColorStop(1, "#2a1a10");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.05, -size * 0.85, size * 0.1, size * 1.05);

  // Metal bands on shaft
  for (let band = 0; band < 6; band++) {
    const bandY = -size * 0.75 + band * size * 0.18;
    ctx.fillStyle = "#505068";
    ctx.fillRect(-size * 0.06, bandY, size * 0.12, size * 0.045);
    ctx.fillStyle = "#707098";
    ctx.fillRect(-size * 0.06, bandY, size * 0.12, size * 0.018);
  }

  // Shaft border
  ctx.strokeStyle = "#1a0a05";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-size * 0.05, -size * 0.85, size * 0.1, size * 1.05);

  // === MASSIVE HAMMER HEAD ===
  if (isAttacking && attackPhase > 0.5) {
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 20 * zoom * attackIntensity;
  }

  // Hammer head main body
  const headGrad = ctx.createLinearGradient(-size * 0.22, -size * 0.95, size * 0.22, -size * 0.95);
  headGrad.addColorStop(0, "#252540");
  headGrad.addColorStop(0.15, "#404060");
  headGrad.addColorStop(0.35, "#505078");
  headGrad.addColorStop(0.5, "#606090");
  headGrad.addColorStop(0.65, "#505078");
  headGrad.addColorStop(0.85, "#404060");
  headGrad.addColorStop(1, "#252540");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  // Main striking head (larger, more imposing)
  ctx.moveTo(-size * 0.2, -size * 0.82);
  ctx.lineTo(-size * 0.25, -size * 1.02);
  ctx.lineTo(size * 0.25, -size * 1.02);
  ctx.lineTo(size * 0.2, -size * 0.82);
  ctx.closePath();
  ctx.fill();

  // Top flat face with bevel
  ctx.fillStyle = "#505070";
  ctx.beginPath();
  ctx.moveTo(-size * 0.23, -size * 1.02);
  ctx.lineTo(-size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.23, -size * 1.02);
  ctx.closePath();
  ctx.fill();

  // Spike on back of hammer (war pick side)
  ctx.fillStyle = "#404058";
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.86);
  ctx.lineTo(-size * 0.4, -size * 0.92);
  ctx.lineTo(-size * 0.2, -size * 0.98);
  ctx.closePath();
  ctx.fill();
  // Spike highlight
  ctx.strokeStyle = "#606080";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.87);
  ctx.lineTo(-size * 0.38, -size * 0.92);
  ctx.stroke();

  // Hammer head border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.82);
  ctx.lineTo(-size * 0.25, -size * 1.02);
  ctx.lineTo(-size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.25, -size * 1.02);
  ctx.lineTo(size * 0.2, -size * 0.82);
  ctx.closePath();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Frost runes on hammer head (glowing intensely during attack)
  const runeGlow = isAttacking && attackPhase > 0.4 ? 0.8 + attackIntensity * 0.2 : 0.5;
  ctx.fillStyle = `rgba(100, 200, 255, ${runeGlow})`;
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = isAttacking && attackPhase > 0.4 ? 12 * zoom : 4 * zoom;
  // Central rune
  ctx.beginPath();
  ctx.arc(0, -size * 0.92, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Side runes
  ctx.beginPath();
  ctx.arc(-size * 0.12, -size * 0.92, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.12, -size * 0.92, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  // Rune connecting frost lines
  ctx.strokeStyle = `rgba(100, 200, 255, ${runeGlow * 0.7})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.92);
  ctx.lineTo(-size * 0.02, -size * 0.92);
  ctx.moveTo(size * 0.1, -size * 0.92);
  ctx.lineTo(size * 0.02, -size * 0.92);
  ctx.stroke();
  // Vertical rune line
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.89);
  ctx.lineTo(0, -size * 0.95);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Ice blue accent trim on hammer
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, -size * 0.84);
  ctx.lineTo(-size * 0.23, -size * 1.0);
  ctx.lineTo(size * 0.23, -size * 1.0);
  ctx.lineTo(size * 0.18, -size * 0.84);
  ctx.stroke();

  // Ornate pommel at bottom
  ctx.fillStyle = "#505068";
  ctx.beginPath();
  ctx.arc(0, size * 0.22, size * 0.065, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.22, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === EPIC IMPACT EFFECTS (during slam phase) ===
  if (isAttacking && attackPhase > 0.55) {
    const slamIntensity = attackPhase > 0.6 ? ((attackPhase - 0.6) / 0.4) : 0;
    const impactX = x + size * 0.4;
    const impactY = y + size * 0.55;
    
    // Screen shake effect simulation via offset particles
    const shakeOffset = slamIntensity * 3 * Math.sin(time * 50);
    
    // Massive shockwave rings
    for (let ring = 0; ring < 5; ring++) {
      const ringSize = size * 0.2 + ring * size * 0.25 * slamIntensity;
      const ringAlpha = (0.8 - ring * 0.15) * slamIntensity;
      ctx.strokeStyle = ring % 2 === 0 
        ? `rgba(100, 180, 255, ${ringAlpha})` 
        : `rgba(200, 230, 255, ${ringAlpha * 0.7})`;
      ctx.lineWidth = (4 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(impactX + shakeOffset, impactY, ringSize, ringSize * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Ground crack lines radiating outward
    for (let crack = 0; crack < 12; crack++) {
      const crackAngle = crack * Math.PI / 6 + Math.sin(crack * 0.7) * 0.2;
      const crackLen = size * (0.4 + Math.random() * 0.3) * slamIntensity;
      const crackWidth = (3 - crack * 0.15) * zoom;
      
      // Main crack
      ctx.strokeStyle = `rgba(80, 150, 220, ${0.8 * slamIntensity})`;
      ctx.lineWidth = crackWidth;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      // Jagged crack path
      const midX = impactX + Math.cos(crackAngle) * crackLen * 0.5 + Math.sin(crack * 2) * size * 0.05;
      const midY = impactY + Math.sin(crackAngle) * crackLen * 0.15;
      ctx.lineTo(midX, midY);
      ctx.lineTo(
        impactX + Math.cos(crackAngle) * crackLen,
        impactY + Math.sin(crackAngle) * crackLen * 0.25
      );
      ctx.stroke();
      
      // Crack glow
      ctx.strokeStyle = `rgba(150, 200, 255, ${0.4 * slamIntensity})`;
      ctx.lineWidth = crackWidth * 2;
      ctx.stroke();
    }
    
    // Flying debris and ice shards
    for (let debris = 0; debris < 20; debris++) {
      const debrisAngle = debris * Math.PI / 10 + time * 2;
      const debrisDist = size * 0.1 + debris * size * 0.04 * slamIntensity;
      const debrisHeight = Math.sin((attackPhase - 0.6) * Math.PI * 2 + debris * 0.3) * size * 0.4;
      const debrisX = impactX + Math.cos(debrisAngle) * debrisDist;
      const debrisY = impactY - Math.abs(debrisHeight) * slamIntensity;
      const debrisAlpha = 0.9 * slamIntensity * (1 - debris * 0.04);
      
      // Ice shard shape
      ctx.fillStyle = debris % 3 === 0 
        ? `rgba(200, 230, 255, ${debrisAlpha})` 
        : `rgba(100, 180, 255, ${debrisAlpha * 0.7})`;
      ctx.save();
      ctx.translate(debrisX, debrisY);
      ctx.rotate(debrisAngle + time * 5);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.025);
      ctx.lineTo(size * 0.012, 0);
      ctx.lineTo(0, size * 0.025);
      ctx.lineTo(-size * 0.012, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    
    // Central impact flash
    if (attackPhase > 0.58 && attackPhase < 0.75) {
      const flashIntensity = Math.sin((attackPhase - 0.58) / 0.17 * Math.PI);
      const flashGrad = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, size * 0.4);
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashIntensity * 0.8})`);
      flashGrad.addColorStop(0.3, `rgba(150, 220, 255, ${flashIntensity * 0.5})`);
      flashGrad.addColorStop(1, "rgba(100, 180, 255, 0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === ARMORED LEGS/GREAVES ===
  for (let side = -1; side <= 1; side += 2) {
    const legX = x + side * size * 0.22;
    
    // Heavy greave
    const greaveGrad = ctx.createLinearGradient(legX - size * 0.08, y + size * 0.3, legX + size * 0.08, y + size * 0.3);
    greaveGrad.addColorStop(0, "#303048");
    greaveGrad.addColorStop(0.5, "#505070");
    greaveGrad.addColorStop(1, "#303048");
    ctx.fillStyle = greaveGrad;
    ctx.beginPath();
    ctx.moveTo(legX - size * 0.1, y + size * 0.52);
    ctx.lineTo(legX - size * 0.12, y + size * 0.32);
    ctx.lineTo(legX + size * 0.12, y + size * 0.32);
    ctx.lineTo(legX + size * 0.1, y + size * 0.52);
    ctx.closePath();
    ctx.fill();
    
    // Knee guard
    ctx.fillStyle = "#505068";
    ctx.beginPath();
    ctx.ellipse(legX, y + size * 0.34, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#40a0ff";
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(legX, y + size * 0.34, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Armored boot
    ctx.fillStyle = "#404058";
    ctx.beginPath();
    ctx.moveTo(legX - size * 0.1, y + size * 0.52);
    ctx.lineTo(legX - size * 0.12, y + size * 0.58);
    ctx.lineTo(legX + side * size * 0.02, y + size * 0.6);
    ctx.lineTo(legX + size * 0.12, y + size * 0.58);
    ctx.lineTo(legX + size * 0.1, y + size * 0.52);
    ctx.closePath();
    ctx.fill();
  }
}

function drawRockyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // EPIC ORNATE ROCKY - Legendary Golden Squirrel King with devastating tail whip attacks
  const hop = Math.abs(Math.sin(time * 6)) * 5;
  const isAttacking = attackPhase > 0;
  const tailWhip = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.8 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // === MULTI-LAYERED GOLDEN AURA ===
  const auraBase = isAttacking ? 0.45 : 0.25;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x, y - hop, size * (0.1 + layerOffset),
      x, y - hop, size * (0.95 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.05) * auraPulse;
    auraGrad.addColorStop(0, `rgba(218, 165, 32, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.4, `rgba(255, 200, 80, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.7, `rgba(255, 150, 50, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(218, 165, 32, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - hop, size * (0.9 + layerOffset * 0.2), size * (0.7 + layerOffset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating golden spark particles
  for (let p = 0; p < 12; p++) {
    const pAngle = (time * 2 + p * Math.PI * 2 / 12) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 3 + p * 0.8) * size * 0.15;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - hop + Math.sin(pAngle) * pDist * 0.55;
    const pAlpha = 0.6 + Math.sin(time * 4.5 + p * 0.7) * 0.3;
    ctx.fillStyle = p % 2 === 0 ? `rgba(255, 215, 0, ${pAlpha})` : `rgba(255, 180, 50, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ATTACK AURA RINGS ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.55 * attackIntensity;
      // Outer golden ring
      ctx.strokeStyle = `rgba(218, 165, 32, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y - hop, size * (0.55 + ringPhase * 0.5), size * (0.5 + ringPhase * 0.45), 0, 0, Math.PI * 2);
      ctx.stroke();
      // Inner bright ring
      ctx.strokeStyle = `rgba(255, 235, 150, ${ringAlpha * 0.4})`;
      ctx.lineWidth = (1.5 - ring * 0.25) * zoom;
      ctx.stroke();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.45);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === MAGNIFICENT MULTI-LAYERED FLUFFY TAIL ===
  const tailWave = Math.sin(time * 4.5 + tailWhip) * 7;
  const tailWave2 = Math.sin(time * 5.5 + tailWhip + 0.5) * 4;

  // Tail outer shadow layer
  ctx.fillStyle = "#4a3002";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.26 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.5 + tailWave * 0.9, y + size * 0.1 - hop * 0.35,
    x + size * 0.85 + tailWave, y - size * 0.2 - hop * 0.4,
    x + size * 0.62 + tailWave * 0.55, y - size * 0.75 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.4 + tailWave2 * 0.3, y - size * 0.45 - hop * 0.35,
    x + size * 0.28, y - size * 0.15 - hop * 0.3,
    x + size * 0.18, y + size * 0.15 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail outer layer (darker gold)
  ctx.fillStyle = "#6b4904";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.24 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.48 + tailWave * 0.85, y + size * 0.08 - hop * 0.35,
    x + size * 0.82 + tailWave, y - size * 0.18 - hop * 0.4,
    x + size * 0.6 + tailWave * 0.5, y - size * 0.72 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.38 + tailWave2 * 0.3, y - size * 0.42 - hop * 0.35,
    x + size * 0.26, y - size * 0.12 - hop * 0.3,
    x + size * 0.17, y + size * 0.14 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail middle layer (warm gold)
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.2 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.45 + tailWave * 0.8, y + size * 0.02 - hop * 0.35,
    x + size * 0.75 + tailWave * 0.9, y - size * 0.22 - hop * 0.4,
    x + size * 0.55 + tailWave * 0.45, y - size * 0.65 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.36 + tailWave2 * 0.25, y - size * 0.38 - hop * 0.35,
    x + size * 0.25, y - size * 0.08 - hop * 0.3,
    x + size * 0.18, y + size * 0.12 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail highlight layer (bright gold)
  const tailHighlightGrad = ctx.createLinearGradient(
    x + size * 0.2, y - hop, x + size * 0.6 + tailWave * 0.4, y - size * 0.6 - hop
  );
  tailHighlightGrad.addColorStop(0, "#b09030");
  tailHighlightGrad.addColorStop(0.5, "#d4b050");
  tailHighlightGrad.addColorStop(1, "#c0a040");
  ctx.fillStyle = tailHighlightGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.14 - hop * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.4 + tailWave * 0.7, y - size * 0.05 - hop * 0.35,
    x + size * 0.62 + tailWave * 0.8, y - size * 0.28 - hop * 0.4,
    x + size * 0.48 + tailWave * 0.38, y - size * 0.55 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + size * 0.35 + tailWave2 * 0.2, y - size * 0.32 - hop * 0.35,
    x + size * 0.26, y - size * 0.02 - hop * 0.3,
    x + size * 0.2, y + size * 0.08 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Tail fur strands
  ctx.strokeStyle = "#5a4008";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let strand = 0; strand < 8; strand++) {
    const strandT = strand / 7;
    const strandX = x + size * 0.25 + strandT * (size * 0.3 + tailWave * 0.35);
    const strandY = y + size * 0.1 - strandT * (size * 0.55) - hop * (0.3 + strandT * 0.15);
    const strandWave = Math.sin(time * 5 + strand * 0.5) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(strandX, strandY);
    ctx.lineTo(strandX + size * 0.08 + strandWave, strandY - size * 0.06);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Tail tip magical glow
  const tailTipX = x + size * 0.55 + tailWave * 0.45;
  const tailTipY = y - size * 0.68 - hop * 0.45;
  ctx.fillStyle = `rgba(255, 220, 80, ${0.4 + gemPulse * 0.3})`;
  ctx.shadowColor = "#ffc000";
  ctx.shadowBlur = 10 * zoom * (isAttacking ? 1 + attackIntensity : 0.6);
  ctx.beginPath();
  ctx.arc(tailTipX, tailTipY, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 200, ${0.5 + gemPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(tailTipX, tailTipY, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  // === HEROIC MUSCULAR BODY ===
  const bodyGrad = ctx.createRadialGradient(
    x - size * 0.05, y - hop - size * 0.05, size * 0.08,
    x, y - hop, size * 0.45
  );
  bodyGrad.addColorStop(0, "#e0b050");
  bodyGrad.addColorStop(0.3, "#d4a040");
  bodyGrad.addColorStop(0.6, "#a07020");
  bodyGrad.addColorStop(0.85, "#8b6914");
  bodyGrad.addColorStop(1, "#5a4008");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, size * 0.36, size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body fur texture
  ctx.strokeStyle = "rgba(90, 64, 8, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 6; i++) {
    const furAngle = -0.6 + i * 0.25;
    const furWave = Math.sin(time * 6 + i * 0.5) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(furAngle) * size * 0.15,
      y - hop + Math.sin(furAngle) * size * 0.22
    );
    ctx.lineTo(
      x + Math.cos(furAngle) * size * 0.32 + furWave,
      y - hop + Math.sin(furAngle) * size * 0.38
    );
    ctx.stroke();
  }

  // Royal chest fur tuft
  ctx.fillStyle = "#f0d890";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - hop - size * 0.2);
  ctx.quadraticCurveTo(x, y - hop - size * 0.28, x + size * 0.08, y - hop - size * 0.2);
  ctx.quadraticCurveTo(x + size * 0.06, y - hop - size * 0.12, x, y - hop - size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.06, y - hop - size * 0.12, x - size * 0.08, y - hop - size * 0.2);
  ctx.fill();

  // Soft belly
  const bellyGrad = ctx.createRadialGradient(
    x, y - hop + size * 0.06, size * 0.02,
    x, y - hop + size * 0.06, size * 0.24
  );
  bellyGrad.addColorStop(0, "#fffaf0");
  bellyGrad.addColorStop(0.5, "#fff8e8");
  bellyGrad.addColorStop(1, "#e8d0b0");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop + size * 0.07, size * 0.24, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // === HEROIC SQUIRREL ARMS ===
  // Arms hold the acorn and raise during tail whip attack
  const armSwingLeft = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.5 : Math.sin(time * 3) * 0.08;
  const armSwingRight = isAttacking ? Math.sin(attackPhase * Math.PI * 2 + 0.4) * 0.6 : Math.sin(time * 3 + 0.5) * 0.08;
  
  // Left arm (holding acorn from below)
  ctx.save();
  ctx.translate(x - size * 0.28, y - hop - size * 0.05);
  ctx.rotate(-0.8 - armSwingLeft * 0.8);
  
  // Left arm fur
  const leftArmGrad = ctx.createLinearGradient(0, 0, -size * 0.08, size * 0.22);
  leftArmGrad.addColorStop(0, "#c89828");
  leftArmGrad.addColorStop(0.5, "#a07020");
  leftArmGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = leftArmGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.06, size * 0.08, -size * 0.04, size * 0.18);
  ctx.lineTo(size * 0.04, size * 0.16);
  ctx.quadraticCurveTo(size * 0.06, size * 0.08, 0, 0);
  ctx.closePath();
  ctx.fill();
  
  // Left paw
  const leftPawGrad = ctx.createRadialGradient(0, size * 0.2, 0, 0, size * 0.2, size * 0.06);
  leftPawGrad.addColorStop(0, "#e8d0b0");
  leftPawGrad.addColorStop(0.6, "#d4a040");
  leftPawGrad.addColorStop(1, "#a07020");
  ctx.fillStyle = leftPawGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.2, size * 0.055, size * 0.045, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Little paw pads
  ctx.fillStyle = "#a08070";
  ctx.beginPath();
  ctx.arc(-size * 0.02, size * 0.21, size * 0.012, 0, Math.PI * 2);
  ctx.arc(size * 0.015, size * 0.215, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  
  // Tiny claws
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  ctx.lineCap = "round";
  for (let c = 0; c < 4; c++) {
    const clawAngle = -0.8 + c * 0.35;
    ctx.beginPath();
    ctx.moveTo(Math.cos(clawAngle) * size * 0.04, size * 0.2 + Math.sin(clawAngle) * size * 0.035);
    ctx.lineTo(Math.cos(clawAngle) * size * 0.06, size * 0.2 + Math.sin(clawAngle) * size * 0.05);
    ctx.stroke();
  }
  ctx.restore();
  
  // Right arm (holding acorn from side)
  ctx.save();
  ctx.translate(x - size * 0.32, y - hop + size * 0.08);
  ctx.rotate(-1.2 - armSwingRight * 0.6);
  
  // Right arm fur
  const rightArmGrad = ctx.createLinearGradient(0, 0, -size * 0.06, size * 0.2);
  rightArmGrad.addColorStop(0, "#c89828");
  rightArmGrad.addColorStop(0.5, "#a07020");
  rightArmGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = rightArmGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.05, size * 0.07, -size * 0.03, size * 0.16);
  ctx.lineTo(size * 0.04, size * 0.14);
  ctx.quadraticCurveTo(size * 0.05, size * 0.07, 0, 0);
  ctx.closePath();
  ctx.fill();
  
  // Right paw
  const rightPawGrad = ctx.createRadialGradient(0, size * 0.18, 0, 0, size * 0.18, size * 0.055);
  rightPawGrad.addColorStop(0, "#e8d0b0");
  rightPawGrad.addColorStop(0.6, "#d4a040");
  rightPawGrad.addColorStop(1, "#a07020");
  ctx.fillStyle = rightPawGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.18, size * 0.05, size * 0.04, -0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Little paw pads
  ctx.fillStyle = "#a08070";
  ctx.beginPath();
  ctx.arc(-size * 0.015, size * 0.19, size * 0.01, 0, Math.PI * 2);
  ctx.arc(size * 0.012, size * 0.19, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
  
  // Tiny claws
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  for (let c = 0; c < 4; c++) {
    const clawAngle = -0.7 + c * 0.3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(clawAngle) * size * 0.035, size * 0.18 + Math.sin(clawAngle) * size * 0.03);
    ctx.lineTo(Math.cos(clawAngle) * size * 0.055, size * 0.18 + Math.sin(clawAngle) * size * 0.045);
    ctx.stroke();
  }
  ctx.restore();

  // === ROYAL HEAD ===
  const headY = y - size * 0.5 - hop;
  const headGrad = ctx.createRadialGradient(
    x - size * 0.05, headY - size * 0.05, size * 0.05,
    x, headY, size * 0.32
  );
  headGrad.addColorStop(0, "#c89828");
  headGrad.addColorStop(0.4, "#b08020");
  headGrad.addColorStop(0.7, "#8b6914");
  headGrad.addColorStop(1, "#6b4904");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.3, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy cheeks with highlight
  const cheekGrad = ctx.createRadialGradient(
    x - size * 0.17, headY + size * 0.06, size * 0.02,
    x - size * 0.16, headY + size * 0.06, size * 0.14
  );
  cheekGrad.addColorStop(0, "#fff8e8");
  cheekGrad.addColorStop(0.6, "#f5deb3");
  cheekGrad.addColorStop(1, "#e0c8a0");
  ctx.fillStyle = cheekGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.17, headY + size * 0.06, size * 0.13, size * 0.11, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.17, headY + size * 0.06, size * 0.13, size * 0.11, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "#4a3a20";
  ctx.lineWidth = 0.8 * zoom;
  ctx.globalAlpha = 0.6;
  for (let side = -1; side <= 1; side += 2) {
    for (let w = 0; w < 3; w++) {
      const whiskerWave = Math.sin(time * 4 + w * 0.5) * size * 0.01;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.12, headY + size * 0.08 + w * size * 0.03);
      ctx.lineTo(x + side * size * 0.32 + whiskerWave, headY + size * 0.05 + w * size * 0.04);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // === ORNATE ROYAL EARS (tufted) ===
  for (let side = -1; side <= 1; side += 2) {
    const earX = x + side * size * 0.22;
    const earY = y - size * 0.72 - hop;

    // Ear outer (dark)
    ctx.fillStyle = "#7a5910";
    ctx.beginPath();
    ctx.ellipse(earX, earY, size * 0.1, size * 0.16, side * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Ear middle (golden)
    ctx.fillStyle = "#9b7018";
    ctx.beginPath();
    ctx.ellipse(earX, earY + size * 0.01, size * 0.085, size * 0.14, side * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear (pink warmth)
    const innerEarGrad = ctx.createRadialGradient(earX, earY + size * 0.02, 0, earX, earY + size * 0.02, size * 0.1);
    innerEarGrad.addColorStop(0, "#f5d0b8");
    innerEarGrad.addColorStop(0.7, "#d4a040");
    innerEarGrad.addColorStop(1, "#b08020");
    ctx.fillStyle = innerEarGrad;
    ctx.beginPath();
    ctx.ellipse(earX, earY + size * 0.02, size * 0.065, size * 0.11, side * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Elaborate ear tufts
    ctx.fillStyle = "#c0a040";
    ctx.beginPath();
    ctx.moveTo(earX - side * size * 0.02, earY - size * 0.14);
    ctx.lineTo(earX + side * size * 0.03, earY - size * 0.24);
    ctx.lineTo(earX + side * size * 0.05, earY - size * 0.22);
    ctx.lineTo(earX + side * size * 0.06, earY - size * 0.28);
    ctx.lineTo(earX + side * size * 0.04, earY - size * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#a08030";
    ctx.beginPath();
    ctx.moveTo(earX, earY - size * 0.12);
    ctx.lineTo(earX + side * size * 0.02, earY - size * 0.2);
    ctx.lineTo(earX + side * size * 0.03, earY - size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Ear gold jewelry ring
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(earX + side * size * 0.06, earY + size * 0.05, size * 0.025, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.arc(earX + side * size * 0.06, earY + size * 0.075, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MAJESTIC MINI CROWN ===
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.22);
  ctx.lineTo(x - size * 0.14, headY - size * 0.32);
  ctx.lineTo(x - size * 0.08, headY - size * 0.26);
  ctx.lineTo(x - size * 0.04, headY - size * 0.35);
  ctx.lineTo(x, headY - size * 0.28);
  ctx.lineTo(x + size * 0.04, headY - size * 0.35);
  ctx.lineTo(x + size * 0.08, headY - size * 0.26);
  ctx.lineTo(x + size * 0.14, headY - size * 0.32);
  ctx.lineTo(x + size * 0.12, headY - size * 0.22);
  ctx.closePath();
  ctx.fill();
  // Crown highlight
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, headY - size * 0.23);
  ctx.lineTo(x - size * 0.11, headY - size * 0.28);
  ctx.lineTo(x - size * 0.06, headY - size * 0.25);
  ctx.lineTo(x - size * 0.03, headY - size * 0.31);
  ctx.lineTo(x, headY - size * 0.26);
  ctx.lineTo(x + size * 0.03, headY - size * 0.31);
  ctx.lineTo(x + size * 0.06, headY - size * 0.25);
  ctx.lineTo(x + size * 0.11, headY - size * 0.28);
  ctx.lineTo(x + size * 0.1, headY - size * 0.23);
  ctx.closePath();
  ctx.fill();
  // Crown gems
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.32, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, headY - size * 0.27, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.08, headY - size * 0.27, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === FIERCE EXPRESSIVE EYES ===
  const eyeScale = isAttacking ? 1.2 : 1;

  // Eye whites with slight gradient
  for (let side = -1; side <= 1; side += 2) {
    const eyeX = x + side * size * 0.11;
    const eyeGrad = ctx.createRadialGradient(eyeX, headY - size * 0.02, 0, eyeX, headY - size * 0.02, size * 0.1 * eyeScale);
    eyeGrad.addColorStop(0, "#ffffff");
    eyeGrad.addColorStop(0.7, "#f8f8f8");
    eyeGrad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, headY - size * 0.02, size * 0.1 * eyeScale, size * 0.12 * eyeScale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden iris (intense glow during attack)
  const irisColor = isAttacking
    ? `rgba(255, 200, 50, ${0.8 + attackIntensity * 0.2})`
    : "#c09040";
  if (isAttacking) {
    ctx.shadowColor = "#ffc000";
    ctx.shadowBlur = 8 * zoom;
  }
  ctx.fillStyle = irisColor;
  ctx.beginPath();
  ctx.arc(x - size * 0.11, headY - size * 0.02, size * 0.06 * eyeScale, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, headY - size * 0.02, size * 0.06 * eyeScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eye highlights (sparkle)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.13, headY - size * 0.04, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, headY - size * 0.04, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - size * 0.095, headY, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.125, headY, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (fierce slits during attack)
  ctx.fillStyle = "#1a1a1a";
  if (isAttacking) {
    ctx.beginPath();
    ctx.ellipse(x - size * 0.11, headY - size * 0.02, size * 0.015, size * 0.045 * eyeScale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.11, headY - size * 0.02, size * 0.015, size * 0.045 * eyeScale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x - size * 0.11, headY - size * 0.02, size * 0.028, 0, Math.PI * 2);
    ctx.arc(x + size * 0.11, headY - size * 0.02, size * 0.028, 0, Math.PI * 2);
    ctx.fill();
  }

  // Determined eyebrows
  ctx.strokeStyle = "#5a4008";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0));
  ctx.quadraticCurveTo(x - size * 0.11, headY - size * 0.14 - (isAttacking ? size * 0.03 : 0), x - size * 0.04, headY - size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0));
  ctx.quadraticCurveTo(x + size * 0.11, headY - size * 0.14 - (isAttacking ? size * 0.03 : 0), x + size * 0.04, headY - size * 0.1);
  ctx.stroke();

  // === DETAILED NOSE ===
  const noseGrad = ctx.createRadialGradient(x, headY + size * 0.1, 0, x, headY + size * 0.1, size * 0.05);
  noseGrad.addColorStop(0, "#4a2a15");
  noseGrad.addColorStop(0.6, "#3a1a0a");
  noseGrad.addColorStop(1, "#2a0a00");
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.1, size * 0.05, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "#6a4a3a";
  ctx.beginPath();
  ctx.arc(x - size * 0.015, headY + size * 0.085, size * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // === EXPRESSIVE MOUTH ===
  if (isAttacking) {
    // Fierce snarling mouth
    ctx.fillStyle = "#2a0a00";
    ctx.beginPath();
    ctx.ellipse(x, headY + size * 0.16, size * 0.06, size * 0.04 * attackIntensity, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fangs
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.035, headY + size * 0.13);
    ctx.lineTo(x - size * 0.02, headY + size * 0.2);
    ctx.lineTo(x - size * 0.005, headY + size * 0.13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.035, headY + size * 0.13);
    ctx.lineTo(x + size * 0.02, headY + size * 0.2);
    ctx.lineTo(x + size * 0.005, headY + size * 0.13);
    ctx.closePath();
    ctx.fill();
  } else {
    // Cute confident smile
    ctx.strokeStyle = "#3a1a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.arc(x, headY + size * 0.13, size * 0.055, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    // Little smile curl
    ctx.beginPath();
    ctx.arc(x - size * 0.04, headY + size * 0.14, size * 0.02, 0, Math.PI * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size * 0.04, headY + size * 0.14, size * 0.02, Math.PI * 0.2, Math.PI);
    ctx.stroke();
  }

  // === LEGENDARY GOLDEN ACORN ===
  ctx.save();
  ctx.translate(x - size * 0.42, y - size * 0.06 - hop);
  ctx.rotate(-0.15);

  // Acorn powerful glow
  ctx.shadowColor = "#ffc000";
  ctx.shadowBlur = 12 * zoom * (isAttacking ? 1 + attackIntensity * 0.5 : gemPulse);

  // Acorn outer (dark)
  ctx.fillStyle = "#6b5010";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.11, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acorn body gradient
  const acornGrad = ctx.createRadialGradient(-size * 0.02, -size * 0.02, 0, 0, 0, size * 0.12);
  acornGrad.addColorStop(0, "#d4a030");
  acornGrad.addColorStop(0.5, "#c09030");
  acornGrad.addColorStop(0.8, "#8b6914");
  acornGrad.addColorStop(1, "#5a3a0a");
  ctx.fillStyle = acornGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acorn highlight
  ctx.fillStyle = "rgba(255, 230, 180, 0.4)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.03, -size * 0.04, size * 0.04, size * 0.06, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Elaborate acorn cap
  const capGrad = ctx.createLinearGradient(-size * 0.1, -size * 0.1, size * 0.1, -size * 0.08);
  capGrad.addColorStop(0, "#8a6818");
  capGrad.addColorStop(0.5, "#b08020");
  capGrad.addColorStop(1, "#8a6818");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.1, size * 0.095, size * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cap scallop pattern
  ctx.strokeStyle = "#5a4010";
  ctx.lineWidth = 0.8 * zoom;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(i * size * 0.025, -size * 0.1, size * 0.018, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Acorn stem
  ctx.fillStyle = "#6b5010";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.145, size * 0.015, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acorn magical sparkle
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.3;
  ctx.beginPath();
  ctx.arc(-size * 0.025, -size * 0.03, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.shadowBlur = 0;
  ctx.restore();

  // === EPIC SPEED LINES ===
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const lineAlpha = 0.5 - i * 0.08 + Math.sin(time * 10 + i) * 0.15;
    ctx.strokeStyle = `rgba(218, 165, 32, ${lineAlpha})`;
    ctx.lineWidth = (2.5 - i * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(
      x + size * 0.5 - i * size * 0.1,
      y + size * 0.1 + i * size * 0.1 - hop * 0.5
    );
    ctx.lineTo(
      x + size * 0.8 - i * size * 0.12,
      y + size * 0.1 + i * size * 0.1 - hop * 0.5
    );
    ctx.stroke();
  }

  // === GOLDEN DUST TRAIL ===
  for (let dust = 0; dust < 8; dust++) {
    const dustPhase = (time * 3 + dust * 0.4) % 1.5;
    const dustX = x - size * 0.4 - dustPhase * size * 0.5;
    const dustY = y + size * 0.1 + Math.sin(time * 6 + dust * 0.8) * size * 0.1 - hop * 0.3;
    const dustAlpha = (1 - dustPhase / 1.5) * 0.5;
    ctx.fillStyle = `rgba(218, 165, 32, ${dustAlpha})`;
    ctx.beginPath();
    ctx.arc(dustX, dustY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFScottHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ORNATE F. SCOTT FITZGERALD - The Great Gatsby Author, Jazz Age Literary Master
  const isAttacking = attackPhase > 0;
  const quillFlourish = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.2 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const writeGesture = Math.sin(time * 2) * 1.5;
  const breathe = Math.sin(time * 2) * 1;
  const goldPulse = Math.sin(time * 3) * 0.3 + 0.7;

  // === MULTI-LAYERED TEAL LITERARY AURA ===
  const auraBase = isAttacking ? 0.4 : 0.25;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.08;
    const auraGrad = ctx.createRadialGradient(
      x, y - size * 0.1, size * (0.1 + layerOffset),
      x, y - size * 0.1, size * (0.95 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.04) * auraPulse;
    auraGrad.addColorStop(0, `rgba(60, 200, 200, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.3, `rgba(40, 170, 170, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.6, `rgba(30, 140, 140, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(60, 200, 200, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.1, size * (0.85 + layerOffset * 0.15), size * (0.75 + layerOffset * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating teal letter particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + p * Math.PI * 2 / 10) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 2 + p * 0.7) * size * 0.1;
    const pRise = ((time * 0.5 + p * 0.4) % 1) * size * 0.25;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - size * 0.1 + Math.sin(pAngle) * pDist * 0.4 - pRise;
    const pAlpha = (0.6 - pRise / (size * 0.25) * 0.4) * goldPulse;
    ctx.fillStyle = `rgba(80, 210, 210, ${pAlpha})`;
    ctx.font = `italic ${8 * zoom}px Georgia`;
    ctx.textAlign = "center";
    const letters = "GATSBY";
    ctx.fillText(letters[p % letters.length], px, py);
  }

  // === MAGICAL TEAL WORD ATTACK RINGS ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `rgba(80, 210, 210, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.6) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.12, size * (0.55 + ringPhase * 0.5), size * (0.65 + ringPhase * 0.5), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.45);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.2)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ORNATE 1920S THREE-PIECE SUIT ===
  // Main suit jacket
  const suitGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.1, x + size * 0.4, y + size * 0.3);
  suitGrad.addColorStop(0, "#1a1a28");
  suitGrad.addColorStop(0.25, "#2a2a3a");
  suitGrad.addColorStop(0.5, "#353548");
  suitGrad.addColorStop(0.75, "#2a2a3a");
  suitGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5 + breathe);
  ctx.lineTo(x - size * 0.42, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.28, x, y - size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.28, x + size * 0.42, y - size * 0.1);
  ctx.lineTo(x + size * 0.38, y + size * 0.5 + breathe);
  ctx.closePath();
  ctx.fill();

  // Suit jacket border
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Suit pinstripes
  ctx.strokeStyle = "rgba(60, 60, 80, 0.3)";
  ctx.lineWidth = 0.8;
  for (let stripe = 0; stripe < 8; stripe++) {
    const stripeX = x - size * 0.32 + stripe * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(stripeX, y - size * 0.15);
    ctx.lineTo(stripeX - size * 0.02, y + size * 0.45);
    ctx.stroke();
  }

  // Suit lapels with satin finish
  const lapelGrad = ctx.createLinearGradient(x - size * 0.25, y - size * 0.2, x - size * 0.08, y + size * 0.18);
  lapelGrad.addColorStop(0, "#1a1a28");
  lapelGrad.addColorStop(0.4, "#252535");
  lapelGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = lapelGrad;
  // Left lapel
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.24);
  ctx.lineTo(x - size * 0.28, y + size * 0.18);
  ctx.lineTo(x - size * 0.1, y + size * 0.2);
  ctx.lineTo(x - size * 0.12, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Teal lapel highlight
  ctx.strokeStyle = "#40b0b0";
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = 3 * zoom;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Right lapel
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.24);
  ctx.lineTo(x + size * 0.28, y + size * 0.18);
  ctx.lineTo(x + size * 0.1, y + size * 0.2);
  ctx.lineTo(x + size * 0.12, y - size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#40b0b0";
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = 3 * zoom;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Lapel flower (carnation)
  ctx.fillStyle = "#cc2233";
  ctx.beginPath();
  ctx.arc(x - size * 0.22, y - size * 0.08, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dd4455";
  ctx.beginPath();
  ctx.arc(x - size * 0.215, y - size * 0.085, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Ornate brocade vest
  const vestGrad = ctx.createLinearGradient(x - size * 0.15, y - size * 0.18, x + size * 0.15, y + size * 0.3);
  vestGrad.addColorStop(0, "#5a4530");
  vestGrad.addColorStop(0.3, "#7a6545");
  vestGrad.addColorStop(0.5, "#8b7555");
  vestGrad.addColorStop(0.7, "#7a6545");
  vestGrad.addColorStop(1, "#5a4530");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.14, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Vest brocade pattern
  ctx.strokeStyle = "rgba(180, 150, 100, 0.3)";
  ctx.lineWidth = 0.8;
  for (let pattern = 0; pattern < 4; pattern++) {
    const patternY = y - size * 0.1 + pattern * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, patternY);
    ctx.quadraticCurveTo(x, patternY - size * 0.02, x + size * 0.1, patternY);
    ctx.stroke();
  }

  // Vest border
  ctx.strokeStyle = "#4a3520";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.2);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.stroke();

  // Vest buttons (ornate gold)
  for (let i = 0; i < 4; i++) {
    const btnY = y - size * 0.1 + i * size * 0.095;
    // Button shadow
    ctx.fillStyle = "#8b6914";
    ctx.beginPath();
    ctx.arc(x + size * 0.005, btnY + size * 0.005, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Main button
    const btnGrad = ctx.createRadialGradient(x - size * 0.005, btnY - size * 0.005, 0, x, btnY, size * 0.022);
    btnGrad.addColorStop(0, "#ffec8b");
    btnGrad.addColorStop(0.5, "#daa520");
    btnGrad.addColorStop(1, "#b8860b");
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.arc(x, btnY, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Button highlight
    ctx.fillStyle = "rgba(255, 255, 220, 0.5)";
    ctx.beginPath();
    ctx.arc(x - size * 0.008, btnY - size * 0.008, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crisp white dress shirt
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.2, y - size * 0.08);
  ctx.quadraticCurveTo(x, y - size * 0.14, x + size * 0.2, y - size * 0.08);
  ctx.lineTo(x + size * 0.14, y - size * 0.22);
  ctx.closePath();
  ctx.fill();
  // Shirt collar points
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y - size * 0.16);
  ctx.lineTo(x - size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y - size * 0.16);
  ctx.lineTo(x + size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // === ELEGANT TEAL TIE ===
  ctx.shadowColor = "#50d0d0";
  ctx.shadowBlur = isAttacking ? 10 * zoom * attackIntensity : 4 * zoom;
  const tieGrad = ctx.createLinearGradient(x, y - size * 0.18, x, y + size * 0.22);
  tieGrad.addColorStop(0, "#40c0c0");
  tieGrad.addColorStop(0.2, "#35a5a5");
  tieGrad.addColorStop(0.5, "#2a8a8a");
  tieGrad.addColorStop(0.8, "#206a6a");
  tieGrad.addColorStop(1, "#185050");
  ctx.fillStyle = tieGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.07, y + size * 0.14);
  ctx.lineTo(x, y + size * 0.22);
  ctx.lineTo(x + size * 0.07, y + size * 0.14);
  ctx.closePath();
  ctx.fill();
  // Tie diagonal stripes - darker teal
  ctx.strokeStyle = "rgba(20, 60, 60, 0.4)";
  ctx.lineWidth = 1.5;
  for (let stripe = 0; stripe < 5; stripe++) {
    const stripeY = y - size * 0.1 + stripe * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04, stripeY);
    ctx.lineTo(x + size * 0.04, stripeY + size * 0.03);
    ctx.stroke();
  }
  // Tie knot - glowing teal
  ctx.fillStyle = "#50d0d0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.16, size * 0.045, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === ELEGANT 1920S ARMS ===
  // Left arm - relaxed at side, gestures during attack
  const leftArmGesture = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.5 : Math.sin(time * 1.2) * 0.08;
  // Right arm - holds pen, flourishes when writing/attacking
  const rightArmFlourish = isAttacking ? Math.sin(attackPhase * Math.PI * 1.5) * 0.6 + 0.3 : 0.15 + Math.sin(time * 2) * 0.05;
  
  // Left arm (suit sleeve)
  ctx.save();
  ctx.translate(x - size * 0.4, y - size * 0.08);
  ctx.rotate(-0.25 - leftArmGesture * 0.9);
  
  // Left sleeve (suit jacket)
  const leftSleeveGrad = ctx.createLinearGradient(0, 0, size * 0.1, size * 0.35);
  leftSleeveGrad.addColorStop(0, "#2a2a3a");
  leftSleeveGrad.addColorStop(0.5, "#353548");
  leftSleeveGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = leftSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.07, size * 0.12, size * 0.04, size * 0.3);
  ctx.lineTo(-size * 0.06, size * 0.28);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  
  // Left shirt cuff
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, size * 0.29, size * 0.055, size * 0.022, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Left cufflink (gold)
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(-size * 0.01, size * 0.29, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffec8b";
  ctx.beginPath();
  ctx.arc(-size * 0.014, size * 0.286, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
  
  // Left hand
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(-size * 0.005, size * 0.35, size * 0.04, size * 0.055, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Fingers - relaxed or gesturing during attack
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  if (isAttacking) {
    // Dramatic gesture with fingers spread
    for (let f = 0; f < 5; f++) {
      const fingerAngle = -0.5 + f * 0.25;
      const fingerLen = size * (0.035 + (f === 2 ? 0.01 : 0));
      ctx.beginPath();
      ctx.moveTo(-size * 0.005 + Math.cos(fingerAngle) * size * 0.025, size * 0.35 + Math.sin(fingerAngle) * size * 0.04);
      ctx.lineTo(-size * 0.005 + Math.cos(fingerAngle) * (size * 0.025 + fingerLen), size * 0.35 + Math.sin(fingerAngle) * (size * 0.04 + fingerLen * 0.5));
      ctx.stroke();
    }
  } else {
    // Relaxed fingers
    ctx.beginPath();
    ctx.arc(-size * 0.005, size * 0.38, size * 0.025, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
  
  // Right arm (holding pen - more forward)
  ctx.save();
  ctx.translate(x + size * 0.38, y - size * 0.1);
  ctx.rotate(0.4 + rightArmFlourish * 0.7);
  
  // Right sleeve (suit jacket)
  const rightSleeveGrad = ctx.createLinearGradient(0, 0, -size * 0.1, size * 0.35);
  rightSleeveGrad.addColorStop(0, "#2a2a3a");
  rightSleeveGrad.addColorStop(0.5, "#353548");
  rightSleeveGrad.addColorStop(1, "#1a1a28");
  ctx.fillStyle = rightSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.12, -size * 0.04, size * 0.3);
  ctx.lineTo(size * 0.06, size * 0.28);
  ctx.quadraticCurveTo(size * 0.08, size * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0a0a15";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  
  // Right shirt cuff
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, size * 0.29, size * 0.055, size * 0.022, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Right cufflink (gold)
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(size * 0.01, size * 0.29, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffec8b";
  ctx.beginPath();
  ctx.arc(size * 0.014, size * 0.286, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
  
  // Right hand (holding pen)
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(size * 0.005, size * 0.35, size * 0.04, size * 0.055, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Fingers gripping the pen
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  // Thumb
  ctx.beginPath();
  ctx.moveTo(size * 0.025, size * 0.33);
  ctx.quadraticCurveTo(size * 0.045, size * 0.35, size * 0.04, size * 0.38);
  ctx.stroke();
  // Index finger (pointing forward to hold pen)
  ctx.beginPath();
  ctx.moveTo(size * 0.015, size * 0.38);
  ctx.lineTo(size * 0.025, size * 0.44);
  ctx.stroke();
  // Other fingers curled
  ctx.beginPath();
  ctx.arc(-size * 0.005, size * 0.39, size * 0.025, 0.4 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // === DISTINGUISHED HEAD ===
  const headY = y - size * 0.5;
  // Face with subtle gradient
  const faceGrad = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.05, 0, x, headY, size * 0.28);
  faceGrad.addColorStop(0, "#ffe8d0");
  faceGrad.addColorStop(0.5, "#ffe0bd");
  faceGrad.addColorStop(1, "#f0c8a0");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Chiseled jaw/chin
  ctx.fillStyle = "#f5d5b0";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, headY + size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.1, headY + size * 0.22, x, headY + size * 0.26);
  ctx.quadraticCurveTo(x + size * 0.1, headY + size * 0.22, x + size * 0.16, headY + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Subtle cheekbone shadows
  ctx.fillStyle = "rgba(200, 160, 120, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, headY + size * 0.02, size * 0.06, size * 0.04, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + size * 0.15, headY + size * 0.02, size * 0.06, size * 0.04, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === SLICKED 1920S HAIR ===
  // Main hair
  const hairGrad = ctx.createLinearGradient(x - size * 0.2, headY - size * 0.2, x + size * 0.2, headY - size * 0.1);
  hairGrad.addColorStop(0, "#2a1810");
  hairGrad.addColorStop(0.3, "#3a2515");
  hairGrad.addColorStop(0.7, "#3a2515");
  hairGrad.addColorStop(1, "#2a1810");
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.14, size * 0.27, size * 0.16, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Hair wave on left side
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.28, headY, x - size * 0.26, headY + size * 0.1);
  ctx.lineWidth = 5 * zoom;
  ctx.strokeStyle = "#3a2515";
  ctx.stroke();

  // Hair on right side
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.24, headY - size * 0.02, x + size * 0.22, headY + size * 0.06);
  ctx.lineWidth = 4 * zoom;
  ctx.stroke();

  // Hair shine
  ctx.strokeStyle = "rgba(80, 60, 40, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, headY - size * 0.22);
  ctx.quadraticCurveTo(x, headY - size * 0.26, x + size * 0.1, headY - size * 0.22);
  ctx.stroke();

  // Side part line
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, headY - size * 0.24);
  ctx.lineTo(x + size * 0.14, headY - size * 0.08);
  ctx.stroke();

  // === SOULFUL EYES ===
  // Eye socket shadows
  ctx.fillStyle = "rgba(180, 140, 100, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, headY - size * 0.02, size * 0.08, size * 0.05, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, headY - size * 0.02, size * 0.08, size * 0.05, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye whites
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, headY - size * 0.02, size * 0.065, size * 0.055, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, headY - size * 0.02, size * 0.065, size * 0.055, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Irises (glowing golden during attack, otherwise deep blue-grey)
  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 8 * zoom * attackIntensity;
    ctx.fillStyle = `rgba(218, 165, 32, ${0.85 + attackIntensity * 0.15})`;
  } else {
    ctx.fillStyle = "#4a6080";
  }
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Iris detail
  ctx.strokeStyle = isAttacking ? "#b8860b" : "#3a5070";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  // Pupils
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.115, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.085, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows (thoughtful, slightly furrowed)
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.1, headY - size * 0.11, x - size * 0.04, headY - size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.1, headY - size * 0.11, x + size * 0.04, headY - size * 0.08);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = "#c8a888";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.02);
  ctx.lineTo(x - size * 0.02, headY + size * 0.08);
  ctx.quadraticCurveTo(x, headY + size * 0.1, x + size * 0.02, headY + size * 0.08);
  ctx.stroke();

  // Subtle smile/contemplative expression
  ctx.strokeStyle = "#a08070";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, headY + size * 0.14);
  ctx.quadraticCurveTo(x, headY + size * 0.16, x + size * 0.08, headY + size * 0.14);
  ctx.stroke();

  // === ORNATE MAGICAL FOUNTAIN PEN ===
  // Pen follows the right arm movement
  const penArmAngle = 0.4 + rightArmFlourish * 0.7;
  const penBaseX = x + size * 0.38 + Math.sin(penArmAngle) * size * 0.35;
  const penBaseY = y - size * 0.1 + Math.cos(penArmAngle) * size * 0.35;
  ctx.save();
  ctx.translate(penBaseX, penBaseY + writeGesture * 0.5);
  ctx.rotate(-0.5 + penArmAngle * 0.3 + quillFlourish * 0.25);

  // Pen glow during attack
  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }

  // Pen body (black lacquer with gold inlay)
  const penGrad = ctx.createLinearGradient(-size * 0.025, -size * 0.25, size * 0.025, -size * 0.25);
  penGrad.addColorStop(0, "#0a0a0a");
  penGrad.addColorStop(0.2, "#2a2a2a");
  penGrad.addColorStop(0.5, "#1a1a1a");
  penGrad.addColorStop(0.8, "#2a2a2a");
  penGrad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = penGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.03, -size * 0.25, size * 0.06, size * 0.32, size * 0.01);
  ctx.fill();

  // Pen body highlight
  ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.24);
  ctx.lineTo(-size * 0.02, size * 0.06);
  ctx.stroke();

  // Gold bands (ornate)
  const goldBandGrad = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
  goldBandGrad.addColorStop(0, "#b8860b");
  goldBandGrad.addColorStop(0.3, "#daa520");
  goldBandGrad.addColorStop(0.5, "#ffec8b");
  goldBandGrad.addColorStop(0.7, "#daa520");
  goldBandGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = goldBandGrad;
  ctx.fillRect(-size * 0.035, -size * 0.2, size * 0.07, size * 0.025);
  ctx.fillRect(-size * 0.035, -size * 0.12, size * 0.07, size * 0.015);
  ctx.fillRect(-size * 0.035, -size * 0.04, size * 0.07, size * 0.015);
  ctx.fillRect(-size * 0.035, size * 0.04, size * 0.07, size * 0.025);

  // Gold clip
  ctx.fillStyle = goldBandGrad;
  ctx.fillRect(size * 0.025, -size * 0.18, size * 0.015, size * 0.15);
  ctx.beginPath();
  ctx.arc(size * 0.0325, -size * 0.18, size * 0.0075, 0, Math.PI * 2);
  ctx.fill();

  // Nib section
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.25);
  ctx.lineTo(-size * 0.02, -size * 0.3);
  ctx.lineTo(size * 0.02, -size * 0.3);
  ctx.lineTo(size * 0.025, -size * 0.25);
  ctx.closePath();
  ctx.fill();

  // Gold nib
  const nibGrad = ctx.createLinearGradient(-size * 0.015, -size * 0.3, size * 0.015, -size * 0.3);
  nibGrad.addColorStop(0, "#b8860b");
  nibGrad.addColorStop(0.5, "#ffd700");
  nibGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = nibGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(-size * 0.018, -size * 0.38);
  ctx.lineTo(0, -size * 0.42);
  ctx.lineTo(size * 0.018, -size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Nib slit
  ctx.strokeStyle = "#5a4010";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.32);
  ctx.lineTo(0, -size * 0.4);
  ctx.stroke();

  // Ink flow during attack
  if (isAttacking && attackPhase > 0.2) {
    const inkPhase = (attackPhase - 0.2) / 0.8;
    for (let drop = 0; drop < 3; drop++) {
      const dropY = -size * 0.44 - inkPhase * size * 0.2 - drop * size * 0.05;
      const dropAlpha = (1 - inkPhase) * (1 - drop * 0.3);
      ctx.fillStyle = `rgba(20, 15, 10, ${dropAlpha})`;
      ctx.beginPath();
      ctx.ellipse(Math.sin(time * 10 + drop) * size * 0.01, dropY, size * 0.012, size * 0.018, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // === FLOATING MAGICAL WORDS (enhanced) ===
  const wordCount = isAttacking ? 8 : 5;
  const words = ["dream", "green", "light", "hope", "glory", "jazz", "Gatsby", "beauty"];
  for (let i = 0; i < wordCount; i++) {
    const wordPhase = (time * 0.6 + i * 0.4) % 3.5;
    const wordAngle = -0.6 + (i / wordCount) * 1.2;
    const wordX = x - size * 0.3 + Math.sin(wordAngle + wordPhase * Math.PI * 0.4) * size * 0.65;
    const wordY = y - size * 0.6 - wordPhase * size * 0.3;
    const wordAlpha = (1 - wordPhase / 3.5) * (isAttacking ? 0.95 : 0.6);
    const wordScale = 1 + (isAttacking ? attackIntensity * 0.3 : 0);

    ctx.fillStyle = `rgba(218, 165, 32, ${wordAlpha})`;
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = isAttacking ? 8 * zoom : 4 * zoom;
    ctx.font = `italic ${(10 + (isAttacking ? 4 : 0)) * zoom * wordScale}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(words[i % words.length], wordX, wordY);
  }
  ctx.shadowBlur = 0;

  // === GOLDEN LITERARY AURA ===
  const auraGlow = 0.3 + Math.sin(time * 3.5) * 0.1 + attackIntensity * 0.3;
  ctx.strokeStyle = `rgba(218, 165, 32, ${auraGlow})`;
  ctx.lineWidth = (2 + attackIntensity * 2) * zoom;
  ctx.setLineDash([5 * zoom, 4 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner aura glow
  ctx.strokeStyle = `rgba(255, 215, 0, ${auraGlow * 0.4})`;
  ctx.lineWidth = (1.2 + attackIntensity * 1) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.5, size * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCaptainHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // LEGENDARY DRAGONLORD GENERAL - Epic Fantasy War Commander with Divine Fire
  const breathe = Math.sin(time * 2) * 2;
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) : 0;
  const commandPose = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackIntensity = attackPhase;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const flamePulse = Math.sin(time * 6) * 0.15 + 0.85;
  const divineGlow = Math.sin(time * 1.5) * 0.2 + 0.8;

  // === DIVINE FLAME AURA - Radiating Power ===
  const auraBase = isAttacking ? 0.45 : 0.28;
  for (let auraLayer = 0; auraLayer < 6; auraLayer++) {
    const layerOffset = auraLayer * 0.08;
    const auraGrad = ctx.createRadialGradient(
      x, y - size * 0.1, size * (0.05 + layerOffset),
      x, y, size * (1.1 + layerOffset * 0.25)
    );
    const layerAlpha = (auraBase - auraLayer * 0.05) * divineGlow;
    auraGrad.addColorStop(0, `rgba(255, 200, 100, ${layerAlpha * 0.7})`);
    auraGrad.addColorStop(0.2, `rgba(255, 100, 50, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.5, `rgba(200, 30, 30, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.75, `rgba(150, 20, 50, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(100, 10, 30, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * (1.0 + layerOffset * 0.18), size * (0.65 + layerOffset * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating ember particles
  for (let p = 0; p < 18; p++) {
    const pAngle = (time * 1.2 + p * Math.PI * 2 / 18) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 3 + p * 0.9) * size * 0.2;
    const pHeight = Math.sin(time * 2 + p * 0.5) * size * 0.15;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.45 - pHeight;
    const pAlpha = 0.5 + Math.sin(time * 5 + p * 0.7) * 0.35;
    const pSize = size * (0.015 + Math.sin(time * 4 + p) * 0.008);
    
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 6 * zoom;
    ctx.fillStyle = p % 4 === 0 ? `rgba(255, 220, 100, ${pAlpha})` : 
                    p % 4 === 1 ? `rgba(255, 150, 50, ${pAlpha})` :
                    p % 4 === 2 ? `rgba(255, 80, 30, ${pAlpha})` :
                    `rgba(220, 38, 38, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Arcane rune circle
  ctx.save();
  ctx.translate(x, y + size * 0.05);
  ctx.rotate(time * 0.3);
  ctx.strokeStyle = `rgba(255, 180, 80, ${0.25 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.75, size * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Rune symbols
  for (let rune = 0; rune < 8; rune++) {
    const runeAngle = rune * Math.PI / 4;
    const runeX = Math.cos(runeAngle) * size * 0.75;
    const runeY = Math.sin(runeAngle) * size * 0.35;
    ctx.fillStyle = `rgba(255, 200, 100, ${0.4 + Math.sin(time * 3 + rune) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(runeX, runeY - size * 0.03);
    ctx.lineTo(runeX + size * 0.02, runeY);
    ctx.lineTo(runeX, runeY + size * 0.03);
    ctx.lineTo(runeX - size * 0.02, runeY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.54, 0, x, y + size * 0.54, size * 0.6);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  shadowGrad.addColorStop(0.5, "rgba(50, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.54, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LEGENDARY FLAME CAPE ===
  const capeWave = Math.sin(time * 3) * 0.15;
  const capeWave2 = Math.sin(time * 4 + 0.7) * 0.1;

  // Cape inner glow layer
  const capeGlowGrad = ctx.createLinearGradient(x, y - size * 0.2, x, y + size * 0.7);
  capeGlowGrad.addColorStop(0, "rgba(255, 150, 50, 0.3)");
  capeGlowGrad.addColorStop(0.5, "rgba(200, 50, 30, 0.2)");
  capeGlowGrad.addColorStop(1, "rgba(100, 20, 20, 0.1)");
  ctx.fillStyle = capeGlowGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.2);
  ctx.bezierCurveTo(
    x - size * 0.65 - capeWave * size, y + size * 0.2,
    x - size * 0.6 - capeWave2 * size, y + size * 0.5,
    x - size * 0.5, y + size * 0.72
  );
  ctx.lineTo(x + size * 0.5, y + size * 0.72);
  ctx.bezierCurveTo(
    x + size * 0.6 + capeWave2 * size, y + size * 0.5,
    x + size * 0.65 + capeWave * size, y + size * 0.2,
    x + size * 0.28, y - size * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // Cape main - deep crimson with gradient
  const capeGrad = ctx.createLinearGradient(x - size * 0.6, y, x + size * 0.6, y);
  capeGrad.addColorStop(0, "#3a0505");
  capeGrad.addColorStop(0.15, "#5a0808");
  capeGrad.addColorStop(0.3, "#8b1010");
  capeGrad.addColorStop(0.5, "#b81818");
  capeGrad.addColorStop(0.7, "#8b1010");
  capeGrad.addColorStop(0.85, "#5a0808");
  capeGrad.addColorStop(1, "#3a0505");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.6 - capeWave * size, y + size * 0.15,
    x - size * 0.55 - capeWave2 * size, y + size * 0.48,
    x - size * 0.45, y + size * 0.68
  );
  ctx.lineTo(x + size * 0.45, y + size * 0.68);
  ctx.bezierCurveTo(
    x + size * 0.55 + capeWave2 * size, y + size * 0.48,
    x + size * 0.6 + capeWave * size, y + size * 0.15,
    x + size * 0.26, y - size * 0.22
  );
  ctx.closePath();
  ctx.fill();

  // Cape flame edge effect
  ctx.strokeStyle = "#ff6630";
  ctx.lineWidth = 3 * zoom;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 8 * zoom * flamePulse;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.68);
  for (let flame = 0; flame < 12; flame++) {
    const flameX = x - size * 0.45 + flame * size * 0.075;
    const flameWave = Math.sin(time * 6 + flame * 0.8) * size * 0.04;
    const flameHeight = Math.sin(time * 5 + flame * 0.5) * size * 0.02 + size * 0.02;
    ctx.lineTo(flameX + size * 0.0375, y + size * 0.68 + flameHeight + flameWave);
    ctx.lineTo(flameX + size * 0.075, y + size * 0.68);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Cape gold dragon embroidery
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1.2 * zoom;
  ctx.globalAlpha = 0.7;
  // Central dragon silhouette pattern
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.2, x - size * 0.1, y + size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.2, y + size * 0.4, x - size * 0.15, y + size * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.2, x + size * 0.1, y + size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.4, x + size * 0.15, y + size * 0.5);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Cape gold trim with ornate pattern
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.66);
  ctx.bezierCurveTo(
    x - size * 0.55 - capeWave2 * size, y + size * 0.46,
    x - size * 0.6 - capeWave * size, y + size * 0.13,
    x - size * 0.26, y - size * 0.24
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.45, y + size * 0.66);
  ctx.bezierCurveTo(
    x + size * 0.55 + capeWave2 * size, y + size * 0.46,
    x + size * 0.6 + capeWave * size, y + size * 0.13,
    x + size * 0.26, y - size * 0.24
  );
  ctx.stroke();

  // === DRAGONSCALE PLATE ARMOR ===
  // Base armor shape
  const armorGrad = ctx.createLinearGradient(x - size * 0.45, y - size * 0.3, x + size * 0.45, y + size * 0.45);
  armorGrad.addColorStop(0, "#1a1a1a");
  armorGrad.addColorStop(0.15, "#2a2a2a");
  armorGrad.addColorStop(0.3, "#3a3a3a");
  armorGrad.addColorStop(0.5, "#4a4a4a");
  armorGrad.addColorStop(0.7, "#3a3a3a");
  armorGrad.addColorStop(0.85, "#2a2a2a");
  armorGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.52 + breathe);
  ctx.lineTo(x - size * 0.48, y - size * 0.05);
  ctx.lineTo(x - size * 0.32, y - size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.32, y - size * 0.3);
  ctx.lineTo(x + size * 0.48, y - size * 0.05);
  ctx.lineTo(x + size * 0.4, y + size * 0.52 + breathe);
  ctx.closePath();
  ctx.fill();

  // Dragonscale texture overlay
  ctx.fillStyle = "#555555";
  for (let row = 0; row < 5; row++) {
    for (let col = -3; col <= 3; col++) {
      const scaleX = x + col * size * 0.11 + (row % 2) * size * 0.055;
      const scaleY = y - size * 0.15 + row * size * 0.11;
      const scaleSize = size * 0.05;
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY - scaleSize * 0.3);
      ctx.quadraticCurveTo(scaleX + scaleSize, scaleY, scaleX, scaleY + scaleSize * 0.6);
      ctx.quadraticCurveTo(scaleX - scaleSize, scaleY, scaleX, scaleY - scaleSize * 0.3);
      ctx.fill();
    }
  }

  // Armor crimson accents with glow
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.18);
  ctx.lineTo(x, y + size * 0.18);
  ctx.lineTo(x + size * 0.38, y - size * 0.18);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Armor gold filigree
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.22);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.28, x, y - size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.28, x + size * 0.35, y - size * 0.22);
  ctx.stroke();

  // Armor border
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.52 + breathe);
  ctx.lineTo(x - size * 0.48, y - size * 0.05);
  ctx.lineTo(x - size * 0.32, y - size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.32, y - size * 0.3);
  ctx.lineTo(x + size * 0.48, y - size * 0.05);
  ctx.lineTo(x + size * 0.4, y + size * 0.52 + breathe);
  ctx.closePath();
  ctx.stroke();

  // Central dragon emblem
  ctx.fillStyle = "#daa520";
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  // Dragon head silhouette emblem
  ctx.moveTo(x, y - size * 0.08);
  ctx.lineTo(x - size * 0.06, y + size * 0.02);
  ctx.lineTo(x - size * 0.04, y + size * 0.08);
  ctx.lineTo(x, y + size * 0.05);
  ctx.lineTo(x + size * 0.04, y + size * 0.08);
  ctx.lineTo(x + size * 0.06, y + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Emblem center gem
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 8 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8888";
  ctx.beginPath();
  ctx.arc(x - size * 0.01, y - size * 0.01, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === DRAGON PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.5;
    
    // Pauldron base with gradient
    const pauldronGrad = ctx.createRadialGradient(
      pauldronX - side * size * 0.05, y - size * 0.2, 0,
      pauldronX, y - size * 0.15, size * 0.25
    );
    pauldronGrad.addColorStop(0, "#5a5a5a");
    pauldronGrad.addColorStop(0.5, "#3a3a3a");
    pauldronGrad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.15, size * 0.22, size * 0.16, side * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Dragon scale pattern on pauldron
    ctx.fillStyle = "#4a4a4a";
    for (let scale = 0; scale < 3; scale++) {
      const sX = pauldronX + side * scale * size * 0.05;
      const sY = y - size * 0.18 + scale * size * 0.04;
      ctx.beginPath();
      ctx.ellipse(sX, sY, size * 0.06, size * 0.04, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dragon horn spike
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.1, y - size * 0.25);
    ctx.quadraticCurveTo(
      pauldronX + side * size * 0.25, y - size * 0.35,
      pauldronX + side * size * 0.28, y - size * 0.48
    );
    ctx.quadraticCurveTo(
      pauldronX + side * size * 0.2, y - size * 0.38,
      pauldronX + side * size * 0.15, y - size * 0.2
    );
    ctx.closePath();
    ctx.fill();
    // Spike highlight
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.12, y - size * 0.26);
    ctx.quadraticCurveTo(
      pauldronX + side * size * 0.24, y - size * 0.36,
      pauldronX + side * size * 0.27, y - size * 0.46
    );
    ctx.stroke();

    // Pauldron gold trim
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.15, size * 0.22, size * 0.16, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Pauldron ruby gem
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 6 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(pauldronX, y - size * 0.15, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6666";
    ctx.beginPath();
    ctx.arc(pauldronX - size * 0.015, y - size * 0.16, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === ARMORED ARMS ===
  for (let side = -1; side <= 1; side += 2) {
    const armX = x + side * size * 0.48;
    const armSwing = side === 1 ? swordSwing * 0.3 : 0; // Right arm moves with sword
    
    // Upper arm (plate armor)
    const upperArmGrad = ctx.createLinearGradient(
      armX - size * 0.08, y - size * 0.1,
      armX + size * 0.08, y + size * 0.15
    );
    upperArmGrad.addColorStop(0, "#4a4a4a");
    upperArmGrad.addColorStop(0.3, "#5a5a5a");
    upperArmGrad.addColorStop(0.5, "#6a6a6a");
    upperArmGrad.addColorStop(0.7, "#5a5a5a");
    upperArmGrad.addColorStop(1, "#3a3a3a");
    ctx.fillStyle = upperArmGrad;
    ctx.beginPath();
    ctx.moveTo(armX - side * size * 0.02, y - size * 0.08);
    ctx.quadraticCurveTo(
      armX + side * size * 0.12, y + size * 0.05 + armSwing * size * 0.1,
      armX + side * size * 0.08, y + size * 0.18 + armSwing * size * 0.15
    );
    ctx.lineTo(armX - side * size * 0.04, y + size * 0.2 + armSwing * size * 0.15);
    ctx.quadraticCurveTo(
      armX - side * size * 0.06, y + size * 0.08,
      armX - side * size * 0.02, y - size * 0.08
    );
    ctx.closePath();
    ctx.fill();
    
    // Upper arm plate segments
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(armX - side * size * 0.03, y + size * 0.02);
    ctx.lineTo(armX + side * size * 0.1, y + size * 0.06 + armSwing * size * 0.08);
    ctx.stroke();
    
    // Elbow joint
    const elbowX = armX + side * size * 0.06;
    const elbowY = y + size * 0.2 + armSwing * size * 0.15;
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.ellipse(elbowX, elbowY, size * 0.055, size * 0.04, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    
    // Forearm
    const forearmEndX = armX + side * size * 0.15;
    const forearmEndY = y + size * 0.38 + armSwing * size * 0.2;
    const forearmGrad = ctx.createLinearGradient(elbowX, elbowY, forearmEndX, forearmEndY);
    forearmGrad.addColorStop(0, "#4a4a4a");
    forearmGrad.addColorStop(0.5, "#5a5a5a");
    forearmGrad.addColorStop(1, "#3a3a3a");
    ctx.fillStyle = forearmGrad;
    ctx.beginPath();
    ctx.moveTo(elbowX - side * size * 0.04, elbowY);
    ctx.quadraticCurveTo(
      forearmEndX, forearmEndY - size * 0.05,
      forearmEndX + side * size * 0.02, forearmEndY
    );
    ctx.lineTo(forearmEndX - side * size * 0.04, forearmEndY + size * 0.02);
    ctx.quadraticCurveTo(
      elbowX - side * size * 0.02, elbowY + size * 0.08,
      elbowX - side * size * 0.04, elbowY
    );
    ctx.closePath();
    ctx.fill();
    
    // Forearm plate detail
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY + size * 0.04);
    ctx.lineTo(forearmEndX, forearmEndY - size * 0.02);
    ctx.stroke();
    
    // Gauntlet/Hand
    const handX = forearmEndX + side * size * 0.02;
    const handY = forearmEndY + size * 0.02;
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.ellipse(handX, handY, size * 0.045, size * 0.035, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Gauntlet knuckle details
    ctx.fillStyle = "#2a2a2a";
    for (let knuckle = 0; knuckle < 4; knuckle++) {
      const kX = handX + side * size * 0.015 + knuckle * side * size * 0.015;
      const kY = handY - size * 0.015 + Math.abs(knuckle - 1.5) * size * 0.008;
      ctx.beginPath();
      ctx.arc(kX, kY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
    // Gauntlet gold trim
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(handX, handY, size * 0.045, size * 0.035, side * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === LEGENDARY FLAMESWORD ===
  ctx.save();
  ctx.translate(x + size * 0.55, y + size * 0.08);
  ctx.rotate(0.7 + swordSwing * 1.4);

  // Flame aura around blade
  if (isAttacking || true) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 15 * zoom * (0.7 + attackIntensity * 0.3);
    
    // Flame particles along blade
    for (let flame = 0; flame < 8; flame++) {
      const flameY = -size * 0.1 - flame * size * 0.08;
      const flameX = Math.sin(time * 8 + flame * 0.7) * size * 0.03;
      const flameAlpha = 0.4 + Math.sin(time * 6 + flame) * 0.2;
      ctx.fillStyle = `rgba(255, ${150 - flame * 10}, 50, ${flameAlpha})`;
      ctx.beginPath();
      ctx.ellipse(flameX, flameY, size * 0.025, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Blade with fire gradient
  const bladeGrad = ctx.createLinearGradient(-size * 0.05, -size * 0.4, size * 0.05, -size * 0.4);
  bladeGrad.addColorStop(0, "#606068");
  bladeGrad.addColorStop(0.15, "#909098");
  bladeGrad.addColorStop(0.3, "#c0c0c8");
  bladeGrad.addColorStop(0.5, "#e8e8f0");
  bladeGrad.addColorStop(0.7, "#c0c0c8");
  bladeGrad.addColorStop(0.85, "#909098");
  bladeGrad.addColorStop(1, "#606068");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.055, -size * 0.55);
  ctx.lineTo(-size * 0.03, -size * 0.7);
  ctx.lineTo(0, -size * 0.78);
  ctx.lineTo(size * 0.03, -size * 0.7);
  ctx.lineTo(size * 0.055, -size * 0.55);
  ctx.lineTo(size * 0.05, 0);
  ctx.closePath();
  ctx.fill();

  // Blade fire edge glow
  ctx.strokeStyle = "#ff6630";
  ctx.lineWidth = 2 * zoom;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 8 * zoom * flamePulse;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.05);
  ctx.lineTo(-size * 0.05, -size * 0.53);
  ctx.lineTo(-size * 0.025, -size * 0.68);
  ctx.lineTo(0, -size * 0.76);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Blade runes with fire glow
  ctx.fillStyle = `rgba(255, 100, 50, ${0.6 + attackIntensity * 0.4})`;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 6 * zoom;
  for (let rune = 0; rune < 4; rune++) {
    const runeY = -size * 0.12 - rune * size * 0.14;
    // Diamond rune shape
    ctx.beginPath();
    ctx.moveTo(0, runeY - size * 0.025);
    ctx.lineTo(size * 0.015, runeY);
    ctx.lineTo(0, runeY + size * 0.025);
    ctx.lineTo(-size * 0.015, runeY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Blade border
  ctx.strokeStyle = "#404048";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.055, -size * 0.55);
  ctx.lineTo(-size * 0.03, -size * 0.7);
  ctx.lineTo(0, -size * 0.78);
  ctx.lineTo(size * 0.03, -size * 0.7);
  ctx.lineTo(size * 0.055, -size * 0.55);
  ctx.lineTo(size * 0.05, 0);
  ctx.closePath();
  ctx.stroke();

  // Dragon crossguard
  const guardGrad = ctx.createLinearGradient(-size * 0.18, 0, size * 0.18, 0);
  guardGrad.addColorStop(0, "#805010");
  guardGrad.addColorStop(0.2, "#c9a227");
  guardGrad.addColorStop(0.4, "#f0c040");
  guardGrad.addColorStop(0.5, "#ffe060");
  guardGrad.addColorStop(0.6, "#f0c040");
  guardGrad.addColorStop(0.8, "#c9a227");
  guardGrad.addColorStop(1, "#805010");
  ctx.fillStyle = guardGrad;
  // Dragon wing crossguard shape
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, size * 0.02);
  ctx.quadraticCurveTo(-size * 0.2, -size * 0.04, -size * 0.15, -size * 0.06);
  ctx.lineTo(-size * 0.05, -size * 0.04);
  ctx.lineTo(size * 0.05, -size * 0.04);
  ctx.lineTo(size * 0.15, -size * 0.06);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.04, size * 0.18, size * 0.02);
  ctx.quadraticCurveTo(size * 0.1, size * 0.04, 0, size * 0.02);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.04, -size * 0.18, size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#604008";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Guard dragon eye gems
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(-size * 0.1, -size * 0.02, size * 0.025, size * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.1, -size * 0.02, size * 0.025, size * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ornate hilt
  const hiltGrad = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
  hiltGrad.addColorStop(0, "#1a0805");
  hiltGrad.addColorStop(0.3, "#3a1810");
  hiltGrad.addColorStop(0.5, "#5a2818");
  hiltGrad.addColorStop(0.7, "#3a1810");
  hiltGrad.addColorStop(1, "#1a0805");
  ctx.fillStyle = hiltGrad;
  ctx.fillRect(-size * 0.035, size * 0.01, size * 0.07, size * 0.18);
  
  // Hilt gold wrapping
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  for (let wrap = 0; wrap < 5; wrap++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.035, size * 0.03 + wrap * size * 0.032);
    ctx.lineTo(size * 0.035, size * 0.045 + wrap * size * 0.032);
    ctx.stroke();
  }

  // Dragon head pommel
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  // Dragon head shape
  ctx.moveTo(0, size * 0.19);
  ctx.lineTo(-size * 0.05, size * 0.22);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.26, -size * 0.05, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.02, size * 0.33, 0, size * 0.32);
  ctx.quadraticCurveTo(size * 0.02, size * 0.33, size * 0.05, size * 0.3);
  ctx.quadraticCurveTo(size * 0.07, size * 0.26, size * 0.05, size * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#805010";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Pommel ruby eye
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.26, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === LEGENDARY WAR STANDARD (Facing Left) ===
  ctx.save();
  ctx.translate(x - size * 0.62, y - size * 0.08);
  ctx.rotate(-0.15); // Angle the standard outward

  // Banner pole - ornate gold and dark wood
  const poleGrad = ctx.createLinearGradient(-size * 0.03, -size * 0.85, size * 0.03, -size * 0.85);
  poleGrad.addColorStop(0, "#3a1508");
  poleGrad.addColorStop(0.3, "#5a2510");
  poleGrad.addColorStop(0.5, "#7a3518");
  poleGrad.addColorStop(0.7, "#5a2510");
  poleGrad.addColorStop(1, "#3a1508");
  ctx.fillStyle = poleGrad;
  ctx.fillRect(-size * 0.028, -size * 0.85, size * 0.056, size * 0.95);

  // Pole gold ornaments
  ctx.fillStyle = "#daa520";
  for (let ring = 0; ring < 4; ring++) {
    ctx.fillRect(-size * 0.035, -size * 0.82 + ring * size * 0.25, size * 0.07, size * 0.035);
  }

  // Dragon finial
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  // Dragon head finial
  ctx.moveTo(0, -size * 0.98);
  ctx.lineTo(-size * 0.04, -size * 0.92);
  ctx.quadraticCurveTo(-size * 0.06, -size * 0.88, -size * 0.05, -size * 0.85);
  ctx.lineTo(size * 0.05, -size * 0.85);
  ctx.quadraticCurveTo(size * 0.06, -size * 0.88, size * 0.04, -size * 0.92);
  ctx.closePath();
  ctx.fill();
  // Dragon horns
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.92);
  ctx.lineTo(-size * 0.06, -size * 1.0);
  ctx.lineTo(-size * 0.02, -size * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.03, -size * 0.92);
  ctx.lineTo(size * 0.06, -size * 1.0);
  ctx.lineTo(size * 0.02, -size * 0.9);
  ctx.closePath();
  ctx.fill();
  // Finial gem
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, -size * 0.9, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Banner fabric with epic wave (facing left)
  const bannerWave = Math.sin(time * 4) * 0.2;
  const bannerWave2 = Math.sin(time * 5 + 0.6) * 0.12;

  // Banner shadow
  ctx.fillStyle = "#3a0808";
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, -size * 0.78);
  ctx.bezierCurveTo(
    -size * 0.28 - bannerWave * size, -size * 0.72,
    -size * 0.36 - bannerWave2 * size, -size * 0.5,
    -size * 0.42, -size * 0.35
  );
  ctx.bezierCurveTo(
    -size * 0.32 - bannerWave2 * size * 0.5, -size * 0.28,
    -size * 0.22 - bannerWave * size * 0.3, -size * 0.18,
    -size * 0.028, -size * 0.12
  );
  ctx.closePath();
  ctx.fill();

  // Banner main
  const bannerGrad = ctx.createLinearGradient(-size * 0.028, -size * 0.5, -size * 0.4, -size * 0.5);
  bannerGrad.addColorStop(0, "#8b1010");
  bannerGrad.addColorStop(0.3, "#b81818");
  bannerGrad.addColorStop(0.6, "#dc2626");
  bannerGrad.addColorStop(1, "#aa1515");
  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, -size * 0.8);
  ctx.bezierCurveTo(
    -size * 0.26 - bannerWave * size, -size * 0.74,
    -size * 0.34 - bannerWave2 * size, -size * 0.52,
    -size * 0.4, -size * 0.38
  );
  ctx.bezierCurveTo(
    -size * 0.3 - bannerWave2 * size * 0.5, -size * 0.3,
    -size * 0.2 - bannerWave * size * 0.3, -size * 0.2,
    -size * 0.028, -size * 0.15
  );
  ctx.closePath();
  ctx.fill();

  // Banner gold trim with glow
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 2.5 * zoom;
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 4 * zoom;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Banner dragon emblem
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(-size * 0.18, -size * 0.48, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.arc(-size * 0.18, -size * 0.48, size * 0.075, 0, Math.PI * 2);
  ctx.fill();
  // Dragon silhouette
  ctx.fillStyle = "#8b1010";
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, -size * 0.52);
  ctx.lineTo(-size * 0.14, -size * 0.46);
  ctx.lineTo(-size * 0.16, -size * 0.44);
  ctx.lineTo(-size * 0.18, -size * 0.46);
  ctx.lineTo(-size * 0.2, -size * 0.44);
  ctx.lineTo(-size * 0.22, -size * 0.46);
  ctx.closePath();
  ctx.fill();

  // Banner flame fringe
  ctx.strokeStyle = "#ff6630";
  ctx.lineWidth = 1.5 * zoom;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 4 * zoom;
  for (let fringe = 0; fringe < 6; fringe++) {
    const fringeT = fringe / 5;
    const fx = -size * 0.028 + (-size * 0.38 + size * 0.028) * fringeT;
    const fy = -size * 0.15 + (-size * 0.38 + size * 0.15) * fringeT;
    const fWave = Math.sin(time * 7 + fringe * 0.8) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - size * 0.015, fy + size * 0.04 + fWave);
    ctx.lineTo(fx - size * 0.03, fy + size * 0.02);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // === DRAGON CROWN HELM ===
  // Helm base
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.05, y - size * 0.58, size * 0.05,
    x, y - size * 0.52, size * 0.35
  );
  helmGrad.addColorStop(0, "#606060");
  helmGrad.addColorStop(0.3, "#4a4a4a");
  helmGrad.addColorStop(0.6, "#3a3a3a");
  helmGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52, size * 0.32, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helm dragon scale pattern
  ctx.fillStyle = "#2a2a2a";
  for (let row = 0; row < 3; row++) {
    const scaleY = y - size * 0.7 + row * size * 0.08;
    for (let col = -2; col <= 2; col++) {
      const scaleX = x + col * size * 0.08 + (row % 2) * size * 0.04;
      ctx.beginPath();
      ctx.ellipse(scaleX, scaleY, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Helm dragon crest ridge
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.82);
  ctx.lineTo(x - size * 0.05, y - size * 0.52);
  ctx.lineTo(x + size * 0.05, y - size * 0.52);
  ctx.lineTo(x + size * 0.04, y - size * 0.82);
  ctx.closePath();
  ctx.fill();

  // Dragon crown band with ornate detail
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 4 * zoom;
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52, size * 0.32, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Crown dragon teeth/points
  ctx.fillStyle = "#daa520";
  for (let tooth = -3; tooth <= 3; tooth++) {
    const toothX = x + tooth * size * 0.07;
    const toothHeight = Math.abs(tooth) === 3 ? 0.08 : Math.abs(tooth) === 2 ? 0.1 : Math.abs(tooth) === 1 ? 0.12 : 0.14;
    ctx.beginPath();
    ctx.moveTo(toothX - size * 0.025, y - size * 0.76);
    ctx.lineTo(toothX, y - size * (0.76 + toothHeight));
    ctx.lineTo(toothX + size * 0.025, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Tooth gem
    if (Math.abs(tooth) <= 1) {
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(toothX, y - size * (0.78 + toothHeight * 0.3), size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#daa520";
    }
  }

  // Helm border
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52, size * 0.32, size * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Dragon visor base (darkness behind grille)
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.58);
  ctx.quadraticCurveTo(x, y - size * 0.52, x + size * 0.24, y - size * 0.58);
  ctx.lineTo(x + size * 0.2, y - size * 0.38);
  ctx.quadraticCurveTo(x, y - size * 0.32, x - size * 0.2, y - size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Visor glowing red light behind grille
  const eyeGlow = isAttacking ? 1 : 0.75;
  ctx.fillStyle = isAttacking
    ? `rgba(220, 38, 38, ${0.85 + attackIntensity * 0.15})`
    : `rgba(180, 30, 30, ${eyeGlow})`;
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = isAttacking ? 15 * zoom : 10 * zoom;
  // Full visor inner glow
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.56);
  ctx.quadraticCurveTo(x, y - size * 0.5, x + size * 0.22, y - size * 0.56);
  ctx.lineTo(x + size * 0.18, y - size * 0.4);
  ctx.quadraticCurveTo(x, y - size * 0.34, x - size * 0.18, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Brighter center eye areas
  ctx.fillStyle = isAttacking
    ? `rgba(255, 60, 60, ${0.9 + attackIntensity * 0.1})`
    : `rgba(220, 50, 50, ${eyeGlow * 0.9})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.48, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, y - size * 0.48, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Visor grille bars - vertical
  for (let vbar = -3; vbar <= 3; vbar++) {
    const vbarX = x + vbar * size * 0.055;
    const topY = y - size * 0.56;
    const bottomY = y - size * 0.38;
    ctx.beginPath();
    ctx.moveTo(vbarX, topY);
    ctx.lineTo(vbarX * 0.95 + x * 0.05, bottomY);
    ctx.stroke();
  }
  // Grille highlights
  ctx.strokeStyle = "#5a5a5a";
  ctx.lineWidth = 0.8 * zoom;
  for (let bar = 0; bar < 5; bar++) {
    const barY = y - size * 0.56 + bar * size * 0.045 - size * 0.005;
    const barWidth = size * (0.19 - bar * 0.015);
    ctx.beginPath();
    ctx.moveTo(x - barWidth, barY);
    ctx.lineTo(x + barWidth, barY);
    ctx.stroke();
  }


  // Glowing red eyes IN FRONT of grille
  ctx.fillStyle = isAttacking
    ? `rgba(255, 50, 50, ${0.95 + attackIntensity * 0.05})`
    : "rgba(220, 38, 38, 0.9)";
  ctx.shadowColor = "#ff2222";
  ctx.shadowBlur = isAttacking ? 18 * zoom : 12 * zoom;
  // Left eye
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.48, size * 0.055, size * 0.035, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, y - size * 0.48, size * 0.055, size * 0.035, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Eye bright centers
  ctx.fillStyle = isAttacking ? "#ff8888" : "#ff6666";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.11, y - size * 0.485, size * 0.025, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.09, y - size * 0.485, size * 0.025, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
 

  // Visor grille frame border (a little light gray)
  ctx.strokeStyle = "#6a6a6a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.58);
  ctx.quadraticCurveTo(x, y - size * 0.52, x + size * 0.28, y - size * 0.58);
  ctx.lineTo(x + size * 0.2, y - size * 0.38);
  ctx.quadraticCurveTo(x, y - size * 0.32, x - size * 0.2, y - size * 0.38);
  ctx.closePath();
  ctx.stroke();


  // Visor breath holes at bottom
  ctx.fillStyle = "#000000";
  for (let hole = -2; hole <= 2; hole++) {
    ctx.beginPath();
    ctx.arc(x + hole * size * 0.04, y - size * 0.35, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helm center dragon gem
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 8 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.83, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8888";
  ctx.beginPath();
  ctx.arc(x - size * 0.01, y - size * 0.84, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === LEGENDARY FLAME PLUME ===
  // Plume base shadow
  for (let i = 0; i < 9; i++) {
    const plumeX = x + (i - 4) * size * 0.04;
    const plumeWave = Math.sin(time * 5 + i * 0.4) * 6;
    const plumeLen = size * (0.4 + Math.abs(i - 4) * 0.02);
    ctx.strokeStyle = "#3a0808";
    ctx.lineWidth = (7 - Math.abs(i - 4) * 0.6) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(plumeX + size * 0.01, y - size * 0.81);
    ctx.quadraticCurveTo(
      plumeX + plumeWave * 1.8 + size * 0.01,
      y - size * 1.0 - plumeLen * 0.5,
      plumeX + plumeWave + size * 0.01,
      y - size * 0.82 - plumeLen
    );
    ctx.stroke();
  }

  // Main flame plume with gradient colors
  for (let i = 0; i < 9; i++) {
    const plumeX = x + (i - 4) * size * 0.04;
    const plumeWave = Math.sin(time * 5 + i * 0.4) * 6;
    const plumeLen = size * (0.4 + Math.abs(i - 4) * 0.02);
    const plumeColor = i % 3 === 0 ? "#ff6630" : i % 3 === 1 ? "#dc2626" : "#aa1515";
    ctx.strokeStyle = plumeColor;
    ctx.lineWidth = (6.5 - Math.abs(i - 4) * 0.55) * zoom;
    ctx.lineCap = "round";
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(plumeX, y - size * 0.83);
    ctx.quadraticCurveTo(
      plumeX + plumeWave * 1.6,
      y - size * 1.02 - plumeLen * 0.5,
      plumeX + plumeWave * 0.9,
      y - size * 0.84 - plumeLen
    );
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Plume fire highlights
  for (let i = 0; i < 7; i += 2) {
    const plumeX = x + (i - 3) * size * 0.05;
    const plumeWave = Math.sin(time * 5 + i * 0.4) * 6;
    const plumeLen = size * (0.36 + Math.abs(i - 3) * 0.015);
    ctx.strokeStyle = "#ffaa44";
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(plumeX, y - size * 0.85);
    ctx.quadraticCurveTo(
      plumeX + plumeWave * 1.3,
      y - size * 0.98 - plumeLen * 0.4,
      plumeX + plumeWave * 0.7,
      y - size * 0.86 - plumeLen * 0.9
    );
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // === DIVINE COMMAND EFFECT WHEN ATTACKING ===
  if (isAttacking) {
    // Outer divine fire rings
    for (let ring = 0; ring < 5; ring++) {
      const ringRadius = size * (0.6 + ring * 0.2 + commandPose * 0.3);
      const ringAlpha = commandPose * (0.6 - ring * 0.1);
      
      // Gold divine ring
      ctx.strokeStyle = `rgba(255, 200, 100, ${ringAlpha})`;
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Fire inner ring
      ctx.strokeStyle = `rgba(255, 100, 50, ${ringAlpha * 0.8})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringRadius * 0.92, ringRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Divine fire burst particles
    for (let spark = 0; spark < 16; spark++) {
      const sparkAngle = (time * 5 + spark * Math.PI * 2 / 16) % (Math.PI * 2);
      const sparkDist = size * (0.65 + commandPose * 0.5);
      const sparkX = x + Math.cos(sparkAngle) * sparkDist;
      const sparkY = y + Math.sin(sparkAngle) * sparkDist * 0.45;
      const sparkAlpha = commandPose * (0.8 + Math.sin(time * 10 + spark) * 0.2);
      
      ctx.fillStyle = spark % 3 === 0 
        ? `rgba(255, 220, 100, ${sparkAlpha})`
        : spark % 3 === 1
        ? `rgba(255, 150, 50, ${sparkAlpha})`
        : `rgba(220, 38, 38, ${sparkAlpha})`;
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Rising flame pillars
    for (let pillar = 0; pillar < 6; pillar++) {
      const pillarAngle = pillar * Math.PI / 3 + time * 2;
      const pillarDist = size * (0.5 + commandPose * 0.3);
      const pillarX = x + Math.cos(pillarAngle) * pillarDist;
      const pillarY = y + Math.sin(pillarAngle) * pillarDist * 0.45;
      const pillarHeight = size * 0.2 * commandPose;
      
      ctx.fillStyle = `rgba(255, 100, 50, ${commandPose * 0.6})`;
      ctx.shadowColor = "#ff4400";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(pillarX - size * 0.02, pillarY);
      ctx.lineTo(pillarX, pillarY - pillarHeight);
      ctx.lineTo(pillarX + size * 0.02, pillarY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}


function drawEngineerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // SCI-FI ENGINEER - Advanced Tech Specialist with holographic displays and nano-tools
  const breathe = Math.sin(time * 2) * 1.5;
  const isAttacking = attackPhase > 0;
  const workAnimation = isAttacking ? Math.sin(attackPhase * Math.PI * 4) : 0;
  const toolSpark = isAttacking ? Math.sin(attackPhase * Math.PI * 8) : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const dataPulse = Math.sin(time * 5) * 0.5 + 0.5;
  const holoFlicker = Math.sin(time * 15) * 0.1 + 0.9;

  // === MULTI-LAYERED TECH AURA ===
  const auraBase = isAttacking ? 0.35 : 0.2;
  const auraPulse = 0.85 + Math.sin(time * 4) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.08;
    const auraGrad = ctx.createRadialGradient(
      x, y, size * (0.1 + layerOffset),
      x, y, size * (0.9 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.04) * auraPulse;
    auraGrad.addColorStop(0, `rgba(0, 200, 255, ${layerAlpha * 0.4})`);
    auraGrad.addColorStop(0.4, `rgba(100, 220, 255, ${layerAlpha * 0.3})`);
    auraGrad.addColorStop(0.7, `rgba(234, 179, 8, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(0, 200, 255, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * (0.85 + layerOffset * 0.2), size * (0.55 + layerOffset * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating data particles
  for (let p = 0; p < 12; p++) {
    const pAngle = (time * 2 + p * Math.PI * 2 / 12) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 3 + p * 0.8) * size * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.45;
    const pAlpha = 0.5 + Math.sin(time * 6 + p * 0.7) * 0.3;
    ctx.fillStyle = p % 3 === 0 ? `rgba(0, 220, 255, ${pAlpha})` : p % 3 === 1 ? `rgba(234, 179, 8, ${pAlpha})` : `rgba(0, 255, 150, ${pAlpha})`;
    ctx.beginPath();
    ctx.rect(px - size * 0.01, py - size * 0.01, size * 0.02, size * 0.02);
    ctx.fill();
  }

  // === HOLOGRAPHIC CIRCUIT LINES ===
  ctx.strokeStyle = `rgba(0, 200, 255, ${0.3 + dataPulse * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  for (let circuit = 0; circuit < 6; circuit++) {
    const circuitAngle = circuit * Math.PI / 3 + time * 0.5;
    const circuitDist = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(circuitAngle) * circuitDist, y + Math.sin(circuitAngle) * circuitDist * 0.5);
    ctx.stroke();
    // Circuit node
    ctx.fillStyle = `rgba(0, 255, 200, ${0.5 + dataPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(x + Math.cos(circuitAngle) * circuitDist * 0.7, y + Math.sin(circuitAngle) * circuitDist * 0.35, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.48);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.45, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ADVANCED TECH BACKPACK ===
  // Main backpack body
  const backpackGrad = ctx.createLinearGradient(x - size * 0.25, y - size * 0.2, x + size * 0.25, y + size * 0.3);
  backpackGrad.addColorStop(0, "#3a3a4a");
  backpackGrad.addColorStop(0.3, "#4a4a5a");
  backpackGrad.addColorStop(0.7, "#3a3a4a");
  backpackGrad.addColorStop(1, "#2a2a3a");
  ctx.fillStyle = backpackGrad;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.24, y - size * 0.22, size * 0.48, size * 0.55, size * 0.06);
  ctx.fill();

  // Backpack border
  ctx.strokeStyle = "#5a5a6a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.24, y - size * 0.22, size * 0.48, size * 0.55, size * 0.06);
  ctx.stroke();

  // Tech panels on backpack
  ctx.fillStyle = "#2a2a3a";
  for (let panel = 0; panel < 4; panel++) {
    ctx.fillRect(x - size * 0.18, y - size * 0.15 + panel * size * 0.12, size * 0.36, size * 0.08);
    // Panel light strip
    const panelGlow = Math.sin(time * 4 + panel * 0.8) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(0, 200, 255, ${panelGlow})`;
    ctx.fillRect(x - size * 0.16, y - size * 0.14 + panel * size * 0.12, size * 0.32, size * 0.02);
    ctx.fillStyle = "#2a2a3a";
  }

  // Central reactor core
  const reactorGrad = ctx.createRadialGradient(x, y + size * 0.08, 0, x, y + size * 0.08, size * 0.1);
  reactorGrad.addColorStop(0, `rgba(0, 255, 200, ${0.8 + dataPulse * 0.2})`);
  reactorGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.6 + dataPulse * 0.2})`);
  reactorGrad.addColorStop(1, "rgba(0, 100, 150, 0.3)");
  ctx.fillStyle = reactorGrad;
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 10 * zoom * (0.7 + dataPulse * 0.3);
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Reactor ring
  ctx.strokeStyle = "#00ccff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08, size * 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Exhaust vents
  for (let vent = 0; vent < 3; vent++) {
    const ventX = x - size * 0.15 + vent * size * 0.15;
    ctx.fillStyle = "#1a1a2a";
    ctx.beginPath();
    ctx.ellipse(ventX, y + size * 0.28, size * 0.03, size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
    // Vent glow when attacking
    if (isAttacking) {
      ctx.fillStyle = `rgba(255, 150, 50, ${attackIntensity * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(ventX, y + size * 0.28, size * 0.02, size * 0.01, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === ADVANCED EXOSUIT BODY ===
  const suitGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.3, x + size * 0.4, y + size * 0.4);
  suitGrad.addColorStop(0, "#3a4a30");
  suitGrad.addColorStop(0.2, "#5a6a40");
  suitGrad.addColorStop(0.5, "#7a8a50");
  suitGrad.addColorStop(0.8, "#5a6a40");
  suitGrad.addColorStop(1, "#3a4a30");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.48 + breathe);
  ctx.lineTo(x - size * 0.42, y - size * 0.1);
  ctx.lineTo(x - size * 0.3, y - size * 0.25);
  ctx.quadraticCurveTo(x, y - size * 0.32, x + size * 0.3, y - size * 0.25);
  ctx.lineTo(x + size * 0.42, y - size * 0.1);
  ctx.lineTo(x + size * 0.38, y + size * 0.48 + breathe);
  ctx.closePath();
  ctx.fill();

  // Suit border
  ctx.strokeStyle = "#2a3a20";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Armor panel lines
  ctx.strokeStyle = "#4a5a38";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.34, y - size * 0.05);
  ctx.lineTo(x + size * 0.34, y - size * 0.05);
  ctx.moveTo(x - size * 0.32, y + size * 0.15);
  ctx.lineTo(x + size * 0.32, y + size * 0.15);
  ctx.moveTo(x - size * 0.3, y + size * 0.35);
  ctx.lineTo(x + size * 0.3, y + size * 0.35);
  ctx.stroke();

  // Hi-vis orange safety strips (reflective)
  const stripGrad = ctx.createLinearGradient(x - size * 0.35, y, x - size * 0.25, y);
  stripGrad.addColorStop(0, "#cc4400");
  stripGrad.addColorStop(0.3, "#ff6600");
  stripGrad.addColorStop(0.5, "#ffaa44");
  stripGrad.addColorStop(0.7, "#ff6600");
  stripGrad.addColorStop(1, "#cc4400");
  ctx.fillStyle = stripGrad;
  ctx.fillRect(x - size * 0.35, y - size * 0.18, size * 0.1, size * 0.45);
  ctx.fillRect(x + size * 0.25, y - size * 0.18, size * 0.1, size * 0.45);

  // Reflective highlights on strips
  ctx.fillStyle = "rgba(255, 255, 200, 0.3)";
  ctx.fillRect(x - size * 0.34, y - size * 0.16, size * 0.03, size * 0.4);
  ctx.fillRect(x + size * 0.31, y - size * 0.16, size * 0.03, size * 0.4);

  // Chest status display
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(x - size * 0.12, y - size * 0.15, size * 0.24, size * 0.12);
  ctx.strokeStyle = "#00aaff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - size * 0.12, y - size * 0.15, size * 0.24, size * 0.12);

  // Display content (scrolling data)
  ctx.fillStyle = `rgba(0, 255, 200, ${0.6 + dataPulse * 0.3})`;
  const dataOffset = (time * 50) % (size * 0.2);
  for (let line = 0; line < 3; line++) {
    const lineY = y - size * 0.13 + line * size * 0.035;
    ctx.fillRect(x - size * 0.1, lineY, size * 0.08 + Math.sin(time * 3 + line) * size * 0.04, size * 0.015);
  }

  // === ADVANCED UTILITY BELT ===
  const beltGrad = ctx.createLinearGradient(x - size * 0.4, y + size * 0.18, x + size * 0.4, y + size * 0.18);
  beltGrad.addColorStop(0, "#3a3a3a");
  beltGrad.addColorStop(0.5, "#5a5a5a");
  beltGrad.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = beltGrad;
  ctx.fillRect(x - size * 0.4, y + size * 0.16, size * 0.8, size * 0.12);
  ctx.strokeStyle = "#6a6a6a";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - size * 0.4, y + size * 0.16, size * 0.8, size * 0.12);

  // Belt pouches with tech details
  for (let pouch = 0; pouch < 4; pouch++) {
    const pouchX = x - size * 0.34 + pouch * size * 0.2;
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.roundRect(pouchX, y + size * 0.13, size * 0.14, size * 0.18, size * 0.02);
    ctx.fill();
    ctx.strokeStyle = "#4a4a4a";
    ctx.stroke();
    // Pouch status light
    ctx.fillStyle = pouch % 2 === 0 ? `rgba(0, 255, 150, ${0.5 + dataPulse * 0.3})` : `rgba(255, 200, 50, ${0.5 + dataPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(pouchX + size * 0.07, y + size * 0.16, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Belt buckle (tech)
  ctx.fillStyle = "#4a4a5a";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.06, y + size * 0.17, size * 0.12, size * 0.08, size * 0.01);
  ctx.fill();
  ctx.fillStyle = `rgba(234, 179, 8, ${0.6 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.21, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // === MECHANICAL ARMS WITH TECH TOOLS ===
  // Left arm (with gauntlet)
  const leftArmGrad = ctx.createRadialGradient(
    x - size * 0.42, y - size * 0.05 + workAnimation * size * 0.05, 0,
    x - size * 0.42, y - size * 0.05 + workAnimation * size * 0.05, size * 0.18
  );
  leftArmGrad.addColorStop(0, "#6a7a50");
  leftArmGrad.addColorStop(0.7, "#5a6a40");
  leftArmGrad.addColorStop(1, "#4a5a30");
  ctx.fillStyle = leftArmGrad;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.42,
    y - size * 0.05 + workAnimation * size * 0.05,
    size * 0.14,
    size * 0.22,
    -0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Left gauntlet
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.48,
    y + size * 0.12 + workAnimation * size * 0.05,
    size * 0.1,
    size * 0.08,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Gauntlet lights
  ctx.fillStyle = `rgba(0, 200, 255, ${0.6 + dataPulse * 0.3})`;
  for (let light = 0; light < 3; light++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.52 + light * size * 0.04, y + size * 0.1 + workAnimation * size * 0.05, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // High-tech wrench tool
  ctx.save();
  ctx.translate(x - size * 0.55, y + size * 0.15 + workAnimation * size * 0.05);
  ctx.rotate(-0.6 + workAnimation * 0.35);

  // Wrench handle (metallic)
  const wrenchGrad = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  wrenchGrad.addColorStop(0, "#5a5a5a");
  wrenchGrad.addColorStop(0.3, "#8a8a8a");
  wrenchGrad.addColorStop(0.7, "#8a8a8a");
  wrenchGrad.addColorStop(1, "#5a5a5a");
  ctx.fillStyle = wrenchGrad;
  ctx.fillRect(-size * 0.025, -size * 0.28, size * 0.05, size * 0.28);

  // Wrench head (adjustable)
  ctx.fillStyle = "#6a6a6a";
  ctx.beginPath();
  ctx.roundRect(-size * 0.07, -size * 0.32, size * 0.14, size * 0.08, size * 0.01);
  ctx.fill();
  // Adjustment mechanism
  ctx.fillStyle = "#4a4a4a";
  ctx.fillRect(-size * 0.06, -size * 0.3, size * 0.04, size * 0.04);
  // Wrench jaw
  ctx.fillStyle = "#7a7a7a";
  ctx.fillRect(-size * 0.06, -size * 0.34, size * 0.12, size * 0.02);

  // Power indicator on wrench
  ctx.fillStyle = `rgba(0, 255, 150, ${0.5 + dataPulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.15, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm (with plasma tool)
  const rightArmGrad = ctx.createRadialGradient(
    x + size * 0.42, y - size * 0.05 - workAnimation * size * 0.05, 0,
    x + size * 0.42, y - size * 0.05 - workAnimation * size * 0.05, size * 0.18
  );
  rightArmGrad.addColorStop(0, "#6a7a50");
  rightArmGrad.addColorStop(0.7, "#5a6a40");
  rightArmGrad.addColorStop(1, "#4a5a30");
  ctx.fillStyle = rightArmGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.42,
    y - size * 0.05 - workAnimation * size * 0.05,
    size * 0.14,
    size * 0.22,
    0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Right gauntlet
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.48,
    y + size * 0.12 - workAnimation * size * 0.05,
    size * 0.1,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Plasma welding/cutting tool
  ctx.save();
  ctx.translate(x + size * 0.55, y + size * 0.1 - workAnimation * size * 0.05);
  ctx.rotate(0.4 - workAnimation * 0.25);

  // Tool body
  const toolGrad = ctx.createLinearGradient(-size * 0.025, 0, size * 0.025, 0);
  toolGrad.addColorStop(0, "#3a3a4a");
  toolGrad.addColorStop(0.5, "#5a5a6a");
  toolGrad.addColorStop(1, "#3a3a4a");
  ctx.fillStyle = toolGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.03, -size * 0.25, size * 0.06, size * 0.25, size * 0.01);
  ctx.fill();

  // Tool grip
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.035, -size * 0.1, size * 0.07, size * 0.12);

  // Tool emitter head
  ctx.fillStyle = "#4a4a5a";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.27, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Plasma/welding effect
  if (isAttacking || Math.sin(time * 3) > 0.5) {
    const sparkIntensity = isAttacking ? Math.abs(toolSpark) : 0.4 + Math.sin(time * 8) * 0.3;
    
    // Plasma glow
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 15 * zoom * sparkIntensity;
    ctx.fillStyle = `rgba(0, 255, 255, ${sparkIntensity})`;
    ctx.beginPath();
    ctx.arc(0, -size * 0.3, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Plasma beam
    ctx.fillStyle = `rgba(100, 255, 255, ${sparkIntensity * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, -size * 0.3);
    ctx.lineTo(0, -size * 0.4 - sparkIntensity * size * 0.1);
    ctx.lineTo(size * 0.01, -size * 0.3);
    ctx.closePath();
    ctx.fill();

    // Spark particles
    for (let spark = 0; spark < 6; spark++) {
      const sparkAngle = time * 15 + spark * Math.PI / 3;
      const sparkDist = size * 0.05 + Math.sin(time * 20 + spark) * size * 0.03;
      ctx.fillStyle = `rgba(255, 200, 50, ${sparkIntensity * (0.5 + Math.sin(time * 10 + spark) * 0.3)})`;
      ctx.beginPath();
      ctx.arc(
        Math.cos(sparkAngle) * sparkDist,
        -size * 0.32 + Math.sin(sparkAngle) * sparkDist * 0.5,
        size * 0.008,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // === SCI-FI HELMET HEAD ===
  const headY = y - size * 0.45;

  // Face/skin
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.02, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Advanced hard hat/helmet
  const hatGrad = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.12, 0, x, headY - size * 0.08, size * 0.32);
  hatGrad.addColorStop(0, "#ffcc22");
  hatGrad.addColorStop(0.5, "#eab308");
  hatGrad.addColorStop(1, "#aa8008");
  ctx.fillStyle = hatGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.1, size * 0.3, size * 0.18, 0, 0, Math.PI);
  ctx.fill();

  // Helmet ridge
  ctx.fillStyle = "#ca9a08";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, headY - size * 0.28);
  ctx.lineTo(x - size * 0.03, headY - size * 0.1);
  ctx.lineTo(x + size * 0.03, headY - size * 0.1);
  ctx.lineTo(x + size * 0.05, headY - size * 0.28);
  ctx.closePath();
  ctx.fill();

  // Helmet brim (tech enhanced)
  const brimGrad = ctx.createLinearGradient(x - size * 0.35, headY - size * 0.02, x + size * 0.35, headY - size * 0.02);
  brimGrad.addColorStop(0, "#9a7a08");
  brimGrad.addColorStop(0.3, "#ca9a08");
  brimGrad.addColorStop(0.7, "#ca9a08");
  brimGrad.addColorStop(1, "#9a7a08");
  ctx.fillStyle = brimGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.02, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helmet border
  ctx.strokeStyle = "#8a6a08";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.02, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Main headlamp
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 12 * zoom * (0.6 + dataPulse * 0.4);
  ctx.fillStyle = `rgba(255, 255, 220, ${0.7 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.14, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Headlamp housing
  ctx.fillStyle = "#5a5a5a";
  ctx.beginPath();
  ctx.ellipse(x, headY - size * 0.14, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Side indicator lights
  ctx.fillStyle = `rgba(0, 255, 150, ${0.6 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.2, headY - size * 0.08, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 50, ${0.6 + dataPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.2, headY - size * 0.08, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // === ADVANCED HUD GOGGLES ===
  // Goggle frame
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.22, headY - size * 0.02, size * 0.44, size * 0.1, size * 0.02);
  ctx.fill();
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Left lens (with HUD display)
  const leftLensGrad = ctx.createLinearGradient(x - size * 0.2, headY, x - size * 0.02, headY + size * 0.06);
  leftLensGrad.addColorStop(0, `rgba(0, 150, 255, ${0.6 * holoFlicker})`);
  leftLensGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.7 * holoFlicker})`);
  leftLensGrad.addColorStop(1, `rgba(0, 100, 200, ${0.5 * holoFlicker})`);
  ctx.fillStyle = leftLensGrad;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.2, headY, size * 0.17, size * 0.07, size * 0.01);
  ctx.fill();

  // Left lens HUD elements
  ctx.strokeStyle = `rgba(0, 255, 200, ${0.5 * holoFlicker})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY + size * 0.02);
  ctx.lineTo(x - size * 0.08, headY + size * 0.02);
  ctx.moveTo(x - size * 0.18, headY + size * 0.04);
  ctx.lineTo(x - size * 0.12, headY + size * 0.04);
  ctx.stroke();

  // Right lens
  const rightLensGrad = ctx.createLinearGradient(x + size * 0.02, headY, x + size * 0.2, headY + size * 0.06);
  rightLensGrad.addColorStop(0, `rgba(0, 100, 200, ${0.5 * holoFlicker})`);
  rightLensGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.7 * holoFlicker})`);
  rightLensGrad.addColorStop(1, `rgba(0, 150, 255, ${0.6 * holoFlicker})`);
  ctx.fillStyle = rightLensGrad;
  ctx.beginPath();
  ctx.roundRect(x + size * 0.03, headY, size * 0.17, size * 0.07, size * 0.01);
  ctx.fill();

  // Right lens targeting reticle
  ctx.strokeStyle = `rgba(255, 100, 50, ${0.6 * holoFlicker})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x + size * 0.115, headY + size * 0.035, size * 0.02, 0, Math.PI * 2);
  ctx.moveTo(x + size * 0.095, headY + size * 0.035);
  ctx.lineTo(x + size * 0.135, headY + size * 0.035);
  ctx.moveTo(x + size * 0.115, headY + size * 0.015);
  ctx.lineTo(x + size * 0.115, headY + size * 0.055);
  ctx.stroke();

  // Nose bridge
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(x - size * 0.02, headY + size * 0.01, size * 0.04, size * 0.04);

  // Mouth (determined expression)
  ctx.fillStyle = "#8b5030";
  ctx.beginPath();
  ctx.arc(x, headY + size * 0.12, size * 0.045, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Chin stubble dots
  ctx.fillStyle = "#9a7050";
  for (let stubble = 0; stubble < 5; stubble++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.04 + stubble * size * 0.02, headY + size * 0.15, size * 0.004, 0, Math.PI * 2);
    ctx.fill();
  }

  // === FLOATING HOLOGRAPHIC GEARS ===
  for (let g = 0; g < 5; g++) {
    const gearAngle = time * 1.8 + g * Math.PI * 0.4;
    const gearDist = size * 0.62;
    const gearX = x + Math.cos(gearAngle) * gearDist;
    const gearY = y - size * 0.05 + Math.sin(gearAngle) * gearDist * 0.4;
    const gearSize = size * (0.06 + Math.sin(time * 2 + g) * 0.015);
    const gearAlpha = 0.4 + Math.sin(time * 3 + g * 0.8) * 0.2;

    // Gear glow
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 5 * zoom;

    ctx.strokeStyle = `rgba(0, 200, 255, ${gearAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    for (let tooth = 0; tooth < 8; tooth++) {
      const tAngle = (tooth / 8) * Math.PI * 2 + time * (3 + g * 0.3);
      const innerR = gearSize * 0.5;
      const outerR = gearSize;
      if (tooth === 0) {
        ctx.moveTo(gearX + Math.cos(tAngle) * outerR, gearY + Math.sin(tAngle) * outerR * 0.5);
      } else {
        ctx.lineTo(gearX + Math.cos(tAngle) * outerR, gearY + Math.sin(tAngle) * outerR * 0.5);
      }
      ctx.lineTo(gearX + Math.cos(tAngle + Math.PI / 8) * innerR, gearY + Math.sin(tAngle + Math.PI / 8) * innerR * 0.5);
    }
    ctx.closePath();
    ctx.stroke();

    // Gear center
    ctx.fillStyle = `rgba(0, 255, 200, ${gearAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(gearX, gearY, gearSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === HOLOGRAPHIC DATA PROJECTION (when attacking) ===
  if (isAttacking) {
    const holoAlpha = attackIntensity * 0.7;
    
    // Holographic schematic lines
    ctx.strokeStyle = `rgba(0, 255, 200, ${holoAlpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Turret schematic outline
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 0.7);
    ctx.lineTo(x - size * 0.3, y - size * 0.9);
    ctx.lineTo(x + size * 0.3, y - size * 0.9);
    ctx.lineTo(x + size * 0.3, y - size * 0.7);
    ctx.lineTo(x - size * 0.3, y - size * 0.7);
    ctx.stroke();
    
    // Turret barrel
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.9);
    ctx.lineTo(x, y - size * 1.1);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Deployment indicator rings
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = size * (0.15 + ring * 0.1 + attackIntensity * 0.1);
      ctx.strokeStyle = `rgba(234, 179, 8, ${holoAlpha * (1 - ring * 0.25)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y + size * 0.6, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // "DEPLOYING" text effect
    ctx.fillStyle = `rgba(0, 255, 200, ${holoAlpha * holoFlicker})`;
    ctx.font = `bold ${8 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("DEPLOYING", x, y - size * 0.75);
  }

  // === TECH ENERGY AURA ===
  const energyGlow = 0.25 + Math.sin(time * 4) * 0.1 + attackIntensity * 0.25;
  ctx.strokeStyle = `rgba(0, 200, 255, ${energyGlow})`;
  ctx.lineWidth = (1.5 + attackIntensity * 1.5) * zoom;
  ctx.setLineDash([4 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawDefaultHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Default hero fallback
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6);
  bodyGrad.addColorStop(0, lightenColor(color, 30));
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, darkenColor(color, 40));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.45, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ffdbac";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.25, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.27, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.27, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
}
