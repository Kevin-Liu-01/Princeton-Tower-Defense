// Princeton Tower Defense - Troop Rendering Module
// Renders all troop types spawned by stations

import type { Troop, Position, TroopOwnerType } from "../../types";
import { TROOP_DATA } from "../../constants";
import { worldToScreen } from "../../utils";

// ============================================================================
// KNIGHT COLOR THEMES - Distinct visual styles based on owner type
// ============================================================================

export interface KnightTheme {
  // Name for identification
  name: string;
  // Aura and flame colors
  auraColorInner: string;   // Inner aura glow
  auraColorMid: string;     // Mid aura
  auraColorOuter: string;   // Outer aura edge
  flameWisps: string;       // Floating flame wisps
  energyRings: string;      // Attack energy rings
  // Cape colors
  capeLight: string;        // Cape highlight
  capeMid: string;          // Cape main color
  capeDark: string;         // Cape shadow
  capeInner: string;        // Cape inner shadow
  // Armor accent colors
  sigilGlow: string;        // Chest sigil glow
  beltBuckle: string;       // Belt buckle accent
  // Weapon colors
  crossguardMain: string;   // Sword crossguard
  crossguardAccent: string; // Crossguard highlights
  gemColor: string;         // Crossguard gems
  bladeRunes: string;       // Glowing blade runes
  swingTrail: string;       // Sword swing trail
  swingTrailAlt: string;    // Secondary swing trail
  // Shield and helm
  shieldEmblem: string;     // Shield emblem color
  plume: string;            // Helmet plume
  eyeGlow: string;          // Glowing eye color
  eyeShadow: string;        // Eye shadow/glow
  // Effects
  shockwave: string;        // Battle cry shockwave
}

// Orange theme - Default/Station knights (Princeton orange)
const KNIGHT_THEME_ORANGE: KnightTheme = {
  name: 'princeton',
  auraColorInner: 'rgba(255, 100, 20, ',
  auraColorMid: 'rgba(255, 60, 0, ',
  auraColorOuter: 'rgba(200, 40, 0, 0)',
  flameWisps: 'rgba(255, 150, 50, ',
  energyRings: 'rgba(255, 80, 20, ',
  capeLight: '#cc3300',
  capeMid: '#ff5500',
  capeDark: '#aa2200',
  capeInner: '#8b2200',
  sigilGlow: 'rgba(200, 80, 0, ',
  beltBuckle: '#c0c0d0',
  crossguardMain: '#8b0000',
  crossguardAccent: '#aa2020',
  gemColor: 'rgba(255, 200, 50, ',
  bladeRunes: 'rgba(200, 80, 0, ',
  swingTrail: 'rgba(255, 150, 50, ',
  swingTrailAlt: 'rgba(255, 200, 100, ',
  shieldEmblem: '#cc4400',
  plume: '#dd4400',
  eyeGlow: 'rgba(255, 150, 50, ',
  eyeShadow: '#ff6600',
  shockwave: 'rgba(255, 100, 50, ',
};

// Blue theme - Frontier Barracks knights
const KNIGHT_THEME_BLUE: KnightTheme = {
  name: 'frontier',
  auraColorInner: 'rgba(80, 160, 255, ',
  auraColorMid: 'rgba(40, 120, 220, ',
  auraColorOuter: 'rgba(20, 80, 180, 0)',
  flameWisps: 'rgba(100, 180, 255, ',
  energyRings: 'rgba(60, 140, 255, ',
  capeLight: '#1a4a8a',
  capeMid: '#2266bb',
  capeDark: '#0a3366',
  capeInner: '#082244',
  sigilGlow: 'rgba(80, 160, 255, ',
  beltBuckle: '#8aa8cc',
  crossguardMain: '#1a4080',
  crossguardAccent: '#2855a0',
  gemColor: 'rgba(150, 220, 255, ',
  bladeRunes: 'rgba(80, 180, 255, ',
  swingTrail: 'rgba(100, 180, 255, ',
  swingTrailAlt: 'rgba(150, 210, 255, ',
  shieldEmblem: '#2266aa',
  plume: '#3388dd',
  eyeGlow: 'rgba(120, 200, 255, ',
  eyeShadow: '#4499ff',
  shockwave: 'rgba(80, 160, 255, ',
};

// Red theme - General Mercer (Captain hero) summoned knights
const KNIGHT_THEME_RED: KnightTheme = {
  name: 'mercer',
  auraColorInner: 'rgba(255, 60, 60, ',
  auraColorMid: 'rgba(200, 30, 30, ',
  auraColorOuter: 'rgba(150, 20, 20, 0)',
  flameWisps: 'rgba(255, 100, 100, ',
  energyRings: 'rgba(255, 50, 50, ',
  capeLight: '#8b1a1a',
  capeMid: '#cc2222',
  capeDark: '#661111',
  capeInner: '#440a0a',
  sigilGlow: 'rgba(255, 80, 80, ',
  beltBuckle: '#cc9999',
  crossguardMain: '#660000',
  crossguardAccent: '#882020',
  gemColor: 'rgba(255, 180, 180, ',
  bladeRunes: 'rgba(255, 60, 60, ',
  swingTrail: 'rgba(255, 100, 100, ',
  swingTrailAlt: 'rgba(255, 150, 150, ',
  shieldEmblem: '#aa2222',
  plume: '#dd3333',
  eyeGlow: 'rgba(255, 120, 120, ',
  eyeShadow: '#ff4444',
  shockwave: 'rgba(255, 80, 80, ',
};

// Purple theme - Reinforcement spell knights
const KNIGHT_THEME_PURPLE: KnightTheme = {
  name: 'reinforcement',
  auraColorInner: 'rgba(180, 80, 255, ',
  auraColorMid: 'rgba(140, 40, 220, ',
  auraColorOuter: 'rgba(100, 20, 180, 0)',
  flameWisps: 'rgba(200, 120, 255, ',
  energyRings: 'rgba(160, 60, 255, ',
  capeLight: '#5a2a8a',
  capeMid: '#7733bb',
  capeDark: '#3a1a66',
  capeInner: '#2a0a44',
  sigilGlow: 'rgba(180, 100, 255, ',
  beltBuckle: '#b8a0cc',
  crossguardMain: '#4a1a80',
  crossguardAccent: '#6830a0',
  gemColor: 'rgba(220, 180, 255, ',
  bladeRunes: 'rgba(180, 100, 255, ',
  swingTrail: 'rgba(200, 120, 255, ',
  swingTrailAlt: 'rgba(220, 170, 255, ',
  shieldEmblem: '#7733aa',
  plume: '#9944dd',
  eyeGlow: 'rgba(200, 150, 255, ',
  eyeShadow: '#aa66ff',
  shockwave: 'rgba(180, 100, 255, ',
};

// Get knight theme based on owner type
export function getKnightTheme(ownerType?: TroopOwnerType): KnightTheme {
  switch (ownerType) {
    case 'barracks':
      return KNIGHT_THEME_BLUE;
    case 'hero_summon':
      return KNIGHT_THEME_RED;
    case 'spell':
      return KNIGHT_THEME_PURPLE;
    case 'station':
    case 'default':
    default:
      return KNIGHT_THEME_ORANGE;
  }
}

// ============================================================================
// TROOP RENDERING - Epic detailed troop sprites
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
) {
  const screenPos = worldToScreen(
    troop.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const troopType = troop.type || "footsoldier";
  const tData = TROOP_DATA[troopType];
  const time = Date.now() / 1000;

  // Check for large troops
  const isLargeTroop =
    troop.type === "elite" ||
    troop.type === "centaur" ||
    troop.type === "cavalry" ||
    troop.type === "knight" ||
    troop.type === "turret";
  const sizeScale = isLargeTroop ? 1.6 : 1;

  // Selection indicator - scaled for large troops
  if (troop.selected) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 2 * zoom,
      28 * zoom * sizeScale,
      14 * zoom * sizeScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shadow - scale based on troop type
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom,
    15 * zoom * sizeScale,
    7 * zoom * sizeScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Scale up level 3 elite troops and level 4 mounted troops
  let baseSize = 22;
  if (troop.type === "elite") baseSize = 31; // Level 3 Elite Guard - larger
  else if (troop.type === "centaur") baseSize = 32; // Level 4 Centaur - mounted
  else if (troop.type === "cavalry")
    baseSize = 32; // Level 4 Royal Cavalry - mounted
  else if (troop.type === "knight") baseSize = 32; // Level 4 Knight - mounted
  else if (troop.type === "turret") baseSize = 34; // Engineer's turret - medium-large
  const size = baseSize * zoom;
  const attackPhase = (troop.attackAnim && troop.attackAnim > 0) ? troop.attackAnim / 300 : 0;
  const attackScale = attackPhase > 0 ? 1 + attackPhase * 0.15 : 1;

  // Convert target position from world to screen coordinates for turret aiming
  let targetScreenPos: Position | undefined = undefined;
  if (targetPos) {
    targetScreenPos = worldToScreen(
      targetPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
    );
  }

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(attackScale, attackScale);

  // Draw specific troop type with attack animation
  drawTroopSprite(
    ctx,
    0,
    0,
    size,
    troopType,
    tData.color,
    time,
    zoom,
    attackPhase,
    targetScreenPos ? { 
      x: targetScreenPos.x - screenPos.x, 
      y: targetScreenPos.y - (screenPos.y - size / 2)
    } : undefined,
    troop.ownerType
  );

  ctx.restore();

  // HEALING AURA EFFECT - Soft, elegant healing visualization
  // Show for 500ms after healFlash (for shrine heals), or while hp < maxHp (for regeneration)
  const healAuraActive = troop.healFlash && (Date.now() - troop.healFlash < 500 || troop.hp < troop.maxHp);
  if (healAuraActive) {
    const pulseAlpha = 0.85 + Math.sin(time * 3) * 0.15; // Stronger breathing effect

    // Soft outer glow - diffuse emerald light
    const outerGlow = ctx.createRadialGradient(
      screenPos.x, screenPos.y, size * 0.1,
      screenPos.x, screenPos.y, size * 1.0
    );
    outerGlow.addColorStop(0, `rgba(134, 239, 172, ${0.5 * pulseAlpha})`);
    outerGlow.addColorStop(0.4, `rgba(74, 222, 128, ${0.3 * pulseAlpha})`);
    outerGlow.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, size * 0.9, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner warm core
    const innerGlow = ctx.createRadialGradient(
      screenPos.x, screenPos.y - size * 0.08, 0,
      screenPos.x, screenPos.y, size * 0.45
    );
    innerGlow.addColorStop(0, `rgba(187, 247, 208, ${0.65 * pulseAlpha})`);
    innerGlow.addColorStop(0.5, `rgba(134, 239, 172, ${0.3 * pulseAlpha})`);
    innerGlow.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - size * 0.04, size * 0.45, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floating sparkle particles - gentle upward drift
    for (let i = 0; i < 6; i++) {
      const sparklePhase = (time * 0.7 + i * 0.17) % 1;
      const sparkleX = screenPos.x + Math.sin(time * 1.8 + i * 1.2) * size * 0.38;
      const sparkleY = screenPos.y + size * 0.15 - sparklePhase * size * 0.9;
      const sparkleAlpha = Math.sin(sparklePhase * Math.PI) * pulseAlpha;
      const sparkleSize = (2.0 + Math.sin(i * 1.2) * 0.6) * zoom;

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

    // Shimmer highlights orbiting
    for (let i = 0; i < 3; i++) {
      const shimmerAngle = time * 1.0 + i * (Math.PI * 2 / 3);
      const shimmerDist = size * 0.35;
      const shimmerX = screenPos.x + Math.cos(shimmerAngle) * shimmerDist;
      const shimmerY = screenPos.y + Math.sin(shimmerAngle) * shimmerDist * 0.55;
      const shimmerAlpha = (0.7 + Math.sin(time * 4 + i * 2) * 0.2) * pulseAlpha;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(shimmerX, shimmerY, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // HP Bar - Modern styled with gradients
  if (troop.hp < troop.maxHp) {
    const barWidth = 32 * zoom * sizeScale;
    const barHeight = 5 * zoom;
    const barY = screenPos.y - size - 10 * zoom;
    const barX = screenPos.x - barWidth / 2;
    const cornerRadius = 2.5 * zoom;

    // Outer shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 3 * zoom;
    ctx.shadowOffsetY = 1 * zoom;

    // Background with rounded corners
    ctx.fillStyle = "rgba(10, 10, 15, 0.9)";
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, cornerRadius);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Inner dark background
    ctx.fillStyle = "#18181b";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius - 1);
    ctx.fill();

    const hpPercent = troop.hp / troop.maxHp;
    const hpWidth = barWidth * hpPercent;

    // Health gradient fill
    if (hpWidth > 0) {
      const hpGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
      if (hpPercent > 0.5) {
        // Green - healthy
        hpGradient.addColorStop(0, "#86efac");
        hpGradient.addColorStop(0.5, "#4ade80");
        hpGradient.addColorStop(1, "#22c55e");
      } else if (hpPercent > 0.25) {
        // Yellow - caution
        hpGradient.addColorStop(0, "#fde047");
        hpGradient.addColorStop(0.5, "#facc15");
        hpGradient.addColorStop(1, "#eab308");
      } else {
        // Red - critical
        hpGradient.addColorStop(0, "#fca5a5");
        hpGradient.addColorStop(0.5, "#f87171");
        hpGradient.addColorStop(1, "#ef4444");
      }
      ctx.fillStyle = hpGradient;
      ctx.beginPath();
      ctx.roundRect(barX, barY, hpWidth, barHeight, [cornerRadius - 1, hpPercent > 0.9 ? cornerRadius - 1 : 0, hpPercent > 0.9 ? cornerRadius - 1 : 0, cornerRadius - 1]);
      ctx.fill();

      // Shine highlight
      const shineGrad = ctx.createLinearGradient(barX, barY, barX, barY + barHeight * 0.45);
      shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, hpWidth, barHeight * 0.45, [cornerRadius - 1, hpPercent > 0.9 ? cornerRadius - 1 : 0, 0, 0]);
      ctx.fill();
    }

    // Subtle outer glow based on health
    const glowColor = hpPercent > 0.5 ? "rgba(74, 222, 128, 0.3)" : hpPercent > 0.25 ? "rgba(250, 204, 21, 0.3)" : "rgba(248, 113, 113, 0.3)";
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, cornerRadius);
    ctx.stroke();
  }
}

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
  targetPos?: Position,
  ownerType?: TroopOwnerType
) {
  switch (type) {
    case "soldier":
    case "footsoldier":
      drawSoldierTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "cavalry":
      drawCavalryTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "centaur":
      drawCentaurTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "elite":
      drawEliteTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "knight":
    case "armored":
      drawKnightTroop(ctx, x, y, size, color, time, zoom, attackPhase, ownerType);
      break;
    case "turret":
      drawTurretTroop(
        ctx,
        x,
        y,
        size,
        color,
        time,
        zoom,
        attackPhase,
        targetPos
      );
      break;
    default:
      drawDefaultTroop(ctx, x, y, size, color, time, zoom, attackPhase);
  }
}

function drawSoldierTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ============================================================================
  // DINKY LEGIONNAIRE - Level 1 Princeton Recruit with Detailed Roman Style
  // A scrappy but determined young soldier with worn but proud equipment
  // ============================================================================
  
  // Animation parameters - subtle but lively
  const stance = Math.sin(time * 3.5) * 1.2;
  const breathe = Math.sin(time * 2.5) * 0.8;
  const weightShift = Math.sin(time * 1.8) * 0.5;
  const footTap = Math.abs(Math.sin(time * 2.8)) * 0.8;
  const shimmer = Math.sin(time * 4) * 0.5 + 0.5;
  const ambientSway = Math.sin(time * 1.2) * 0.3;

  // Attack animation calculations
  const isAttacking = attackPhase > 0;
  const attackSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.8 : 0;
  const attackLunge = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 0.18 : 0;
  const bodyTwist = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.25 : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  ctx.save();
  ctx.translate(attackLunge * 0.5, 0);
  ctx.rotate(bodyTwist);

  // === AMBIENT DUST PARTICLES (kicked up while moving/attacking) ===
  if (isAttacking || footTap > 0.5) {
    for (let d = 0; d < 4; d++) {
      const dustPhase = (time * 2 + d * 0.4) % 1;
      const dustX = x + (Math.random() - 0.5) * size * 0.6 + Math.sin(time * 3 + d) * size * 0.2;
      const dustY = y + size * 0.55 - dustPhase * size * 0.3;
      const dustAlpha = (1 - dustPhase) * (isAttacking ? 0.4 : 0.15);
      const dustSize = (2 + d * 0.5) * zoom * (1 - dustPhase * 0.5);
      ctx.fillStyle = `rgba(139, 119, 101, ${dustAlpha})`;
      ctx.beginPath();
      ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === FLOWING CAPE (behind soldier) ===
  const capeWave1 = Math.sin(time * 3 + 0.5) * 0.15;
  const capeWave2 = Math.sin(time * 4) * 0.1;
  const capeAttackFlutter = isAttacking ? Math.sin(attackPhase * Math.PI * 4) * 0.3 : 0;
  
  // Cape shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.08);
  ctx.quadraticCurveTo(
    x - size * 0.25 + capeWave1 * size - attackLunge * 0.3,
    y + size * 0.2,
    x - size * 0.18 + capeWave2 * size - attackLunge * 0.4 + capeAttackFlutter * size,
    y + size * 0.5
  );
  ctx.lineTo(x + size * 0.12 + capeWave2 * size * 0.5 - attackLunge * 0.2, y + size * 0.48);
  ctx.quadraticCurveTo(x + size * 0.1, y + size * 0.1, x + size * 0.12, y - size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Main cape - deep Princeton orange-red
  const capeGrad = ctx.createLinearGradient(x - size * 0.2, y - size * 0.1, x - size * 0.15, y + size * 0.5);
  capeGrad.addColorStop(0, "#a33a00");
  capeGrad.addColorStop(0.3, "#cc4400");
  capeGrad.addColorStop(0.7, "#992200");
  capeGrad.addColorStop(1, "#661a00");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.22 + capeWave1 * size - attackLunge * 0.25,
    y + size * 0.15,
    x - size * 0.15 + capeWave2 * size - attackLunge * 0.35 + capeAttackFlutter * size,
    y + size * 0.45
  );
  ctx.lineTo(x + size * 0.1 + capeWave2 * size * 0.4 - attackLunge * 0.15, y + size * 0.43);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.08, x + size * 0.1, y - size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Cape edge highlight
  ctx.strokeStyle = `rgba(255, 120, 50, ${0.3 + shimmer * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.22 + capeWave1 * size - attackLunge * 0.25,
    y + size * 0.15,
    x - size * 0.15 + capeWave2 * size - attackLunge * 0.35 + capeAttackFlutter * size,
    y + size * 0.45
  );
  ctx.stroke();

  // Cape clasp at shoulder
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.06, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 215, 100, ${0.5 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.085, y - size * 0.065, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // === LEGS WITH DETAILED GREAVES AND SANDALS ===
  const legSpread = isAttacking ? size * 0.06 : 0;
  const leftLegShift = weightShift * 0.5;
  const rightLegShift = -weightShift * 0.5;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.12 - legSpread + leftLegShift, y + size * 0.32);
  ctx.rotate(-0.08 + footTap * 0.03 - (isAttacking ? 0.18 : 0));
  
  // Tunic skirt piece (pteruges)
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(-size * 0.08, -size * 0.05, size * 0.16, size * 0.08);
  ctx.fillStyle = "#704010";
  for (let strip = 0; strip < 3; strip++) {
    ctx.fillRect(-size * 0.07 + strip * size * 0.045, -size * 0.05, size * 0.035, size * 0.1);
  }
  
  // Upper leg (thigh)
  ctx.fillStyle = "#dbb896";
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.12);
  
  // Knee guard
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.05, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Greave (shin armor) with detail
  const greaveGrad = ctx.createLinearGradient(-size * 0.04, size * 0.12, size * 0.04, size * 0.12);
  greaveGrad.addColorStop(0, "#6a6a7a");
  greaveGrad.addColorStop(0.3, "#9a9aaa");
  greaveGrad.addColorStop(0.5, "#8a8a9a");
  greaveGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = greaveGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.13);
  ctx.lineTo(-size * 0.06, size * 0.26);
  ctx.lineTo(size * 0.06, size * 0.26);
  ctx.lineTo(size * 0.055, size * 0.13);
  ctx.closePath();
  ctx.fill();
  
  // Greave ridge detail
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.14);
  ctx.lineTo(0, size * 0.25);
  ctx.stroke();
  
  // Ankle straps
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(-size * 0.06, size * 0.24, size * 0.12, size * 0.025);
  
  // Sandal with straps
  ctx.fillStyle = "#4a2a10";
  ctx.fillRect(-size * 0.07, size * 0.26, size * 0.14, size * 0.05);
  // Sandal straps
  ctx.strokeStyle = "#6a4a2a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.27);
  ctx.lineTo(-size * 0.02, size * 0.3);
  ctx.moveTo(size * 0.05, size * 0.27);
  ctx.lineTo(size * 0.02, size * 0.3);
  ctx.stroke();
  ctx.restore();

  // Right leg (similar but mirrored)
  ctx.save();
  ctx.translate(x + size * 0.12 + legSpread + rightLegShift, y + size * 0.32);
  ctx.rotate(0.08 - footTap * 0.03 + (isAttacking ? 0.18 : 0));
  
  // Tunic skirt piece
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(-size * 0.08, -size * 0.05, size * 0.16, size * 0.08);
  ctx.fillStyle = "#704010";
  for (let strip = 0; strip < 3; strip++) {
    ctx.fillRect(-size * 0.07 + strip * size * 0.045, -size * 0.05, size * 0.035, size * 0.1);
  }
  
  // Upper leg
  ctx.fillStyle = "#dbb896";
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.12);
  
  // Knee guard
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.05, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Greave
  const greaveGrad2 = ctx.createLinearGradient(-size * 0.04, size * 0.12, size * 0.04, size * 0.12);
  greaveGrad2.addColorStop(0, "#5a5a6a");
  greaveGrad2.addColorStop(0.5, "#8a8a9a");
  greaveGrad2.addColorStop(0.7, "#9a9aaa");
  greaveGrad2.addColorStop(1, "#6a6a7a");
  ctx.fillStyle = greaveGrad2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.13);
  ctx.lineTo(-size * 0.06, size * 0.26);
  ctx.lineTo(size * 0.06, size * 0.26);
  ctx.lineTo(size * 0.055, size * 0.13);
  ctx.closePath();
  ctx.fill();
  
  // Greave ridge
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.14);
  ctx.lineTo(0, size * 0.25);
  ctx.stroke();
  
  // Ankle and sandal
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(-size * 0.06, size * 0.24, size * 0.12, size * 0.025);
  ctx.fillStyle = "#4a2a10";
  ctx.fillRect(-size * 0.07, size * 0.26, size * 0.14, size * 0.05);
  ctx.strokeStyle = "#6a4a2a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.27);
  ctx.lineTo(-size * 0.02, size * 0.3);
  ctx.moveTo(size * 0.05, size * 0.27);
  ctx.lineTo(size * 0.02, size * 0.3);
  ctx.stroke();
  ctx.restore();

  // === TORSO - SEGMENTED LORICA ARMOR ===
  // Base metal layer
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.35);
  ctx.lineTo(x - size * 0.27, y - size * 0.08);
  ctx.lineTo(x + size * 0.27, y - size * 0.08);
  ctx.lineTo(x + size * 0.24, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Main chest plate with Princeton orange and breathing animation
  const chestGrad = ctx.createLinearGradient(x - size * 0.22, y, x + size * 0.22, y);
  chestGrad.addColorStop(0, "#b84c00");
  chestGrad.addColorStop(0.2, "#e05500");
  chestGrad.addColorStop(0.5, "#ff6600");
  chestGrad.addColorStop(0.8, "#e05500");
  chestGrad.addColorStop(1, "#b84c00");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.25, y - size * 0.1 + breathe * 0.5);
  ctx.quadraticCurveTo(x, y - size * 0.22 + breathe * 0.3, x + size * 0.25, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.22, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();

  // Segmented armor bands (lorica segmentata style)
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1.2 * zoom;
  for (let band = 0; band < 5; band++) {
    const bandY = y - size * 0.05 + band * size * 0.075 + breathe * (0.3 + band * 0.15);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.21, bandY);
    ctx.lineTo(x + size * 0.21, bandY);
    ctx.stroke();
  }
  
  // Metal highlight strips on bands
  ctx.strokeStyle = `rgba(255, 180, 100, ${0.15 + shimmer * 0.1})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let band = 0; band < 4; band++) {
    const bandY = y - size * 0.03 + band * size * 0.075 + breathe * (0.3 + band * 0.15);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18, bandY);
    ctx.lineTo(x + size * 0.18, bandY);
    ctx.stroke();
  }

  // Center chest emblem - Princeton "P" with decorative border
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe * 0.5, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe * 0.5, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${9 * zoom}px Georgia`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.09 + breathe * 0.5);
  
  // Emblem shine
  ctx.fillStyle = `rgba(255, 200, 150, ${0.2 + shimmer * 0.15})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.03, y + size * 0.05 + breathe * 0.5, size * 0.02, size * 0.015, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder guards (pauldrons) with rivets
  // Left pauldron
  const pauldronGrad = ctx.createLinearGradient(x - size * 0.35, y - size * 0.05, x - size * 0.2, y + size * 0.05);
  pauldronGrad.addColorStop(0, "#5a5a6a");
  pauldronGrad.addColorStop(0.4, "#8a8a9a");
  pauldronGrad.addColorStop(1, "#6a6a7a");
  ctx.fillStyle = pauldronGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.26, y - size * 0.02 + breathe * 0.3, size * 0.1, size * 0.06, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Pauldron rivets
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.02 + breathe * 0.3, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x - size * 0.22, y - size * 0.02 + breathe * 0.3, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Right pauldron
  const pauldronGrad2 = ctx.createLinearGradient(x + size * 0.2, y - size * 0.05, x + size * 0.35, y + size * 0.05);
  pauldronGrad2.addColorStop(0, "#6a6a7a");
  pauldronGrad2.addColorStop(0.6, "#8a8a9a");
  pauldronGrad2.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = pauldronGrad2;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.26, y - size * 0.02 + breathe * 0.3, size * 0.1, size * 0.06, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y - size * 0.02 + breathe * 0.3, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.22, y - size * 0.02 + breathe * 0.3, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // === LEATHER BELT WITH POUCHES ===
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(x - size * 0.22, y + size * 0.24 + breathe, size * 0.44, size * 0.07);
  // Belt buckle
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x - size * 0.05, y + size * 0.25 + breathe, size * 0.1, size * 0.05);
  ctx.fillStyle = `rgba(255, 220, 130, ${0.4 + shimmer * 0.3})`;
  ctx.fillRect(x - size * 0.04, y + size * 0.255 + breathe, size * 0.03, size * 0.035);
  // Belt studs
  ctx.fillStyle = "#8a7020";
  for (let stud = 0; stud < 3; stud++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.15 + stud * size * 0.04, y + size * 0.275 + breathe, size * 0.012, 0, Math.PI * 2);
    ctx.arc(x + size * 0.08 + stud * size * 0.04, y + size * 0.275 + breathe, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  // Small pouch on belt
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(x + size * 0.12, y + size * 0.26 + breathe, size * 0.06, size * 0.08);
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(x + size * 0.12, y + size * 0.26 + breathe, size * 0.06, size * 0.02);

  // === SHIELD ARM (thrusts forward during attack) ===
  const shieldX = x - size * 0.42 + (isAttacking ? attackLunge * 0.9 : 0);
  const shieldY = y + size * 0.08 - (isAttacking ? size * 0.12 * attackSwing : 0);

  // Arm with bracer
  ctx.fillStyle = "#dbb896";
  ctx.save();
  ctx.translate(x - size * 0.28, y + size * 0.02);
  ctx.rotate(-0.35 - (isAttacking ? 0.45 : 0));
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.18);
  // Forearm bracer
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(-size * 0.05, size * 0.08, size * 0.1, size * 0.08);
  ctx.strokeStyle = "#7a5a3a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.1);
  ctx.lineTo(size * 0.04, size * 0.1);
  ctx.moveTo(-size * 0.04, size * 0.13);
  ctx.lineTo(size * 0.04, size * 0.13);
  ctx.stroke();
  ctx.restore();

  // === DETAILED SCUTUM SHIELD ===
  ctx.save();
  ctx.translate(shieldX, shieldY);
  ctx.rotate(isAttacking ? -0.35 - attackSwing * 0.35 : -0.25 + ambientSway * 0.1);
  
  // Shield outer rim (bronze/gold)
  ctx.fillStyle = "#a08040";
  ctx.beginPath();
  ctx.roundRect(-size * 0.2, -size * 0.22, size * 0.4, size * 0.38, size * 0.04);
  ctx.fill();
  
  // Shield main body (red with gradient)
  const shieldBodyGrad = ctx.createLinearGradient(-size * 0.15, -size * 0.18, size * 0.15, size * 0.18);
  shieldBodyGrad.addColorStop(0, "#8b1a1a");
  shieldBodyGrad.addColorStop(0.3, "#b32222");
  shieldBodyGrad.addColorStop(0.7, "#a01c1c");
  shieldBodyGrad.addColorStop(1, "#701515");
  ctx.fillStyle = shieldBodyGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.17, -size * 0.19, size * 0.34, size * 0.34, size * 0.025);
  ctx.fill();
  
  // Shield boss (center metal dome)
  const bossGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.08);
  bossGrad.addColorStop(0, `rgba(255, 255, 255, ${0.6 + shimmer * 0.3})`);
  bossGrad.addColorStop(0.3, "#c0c0c0");
  bossGrad.addColorStop(0.7, "#8a8a9a");
  bossGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = bossGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  
  // Shield decorative wings/pattern
  ctx.fillStyle = "#c9a227";
  // Left wing
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.02);
  ctx.quadraticCurveTo(-size * 0.13, -size * 0.08, -size * 0.14, -size * 0.02);
  ctx.quadraticCurveTo(-size * 0.13, size * 0.04, -size * 0.08, size * 0.02);
  ctx.closePath();
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.02);
  ctx.quadraticCurveTo(size * 0.13, -size * 0.08, size * 0.14, -size * 0.02);
  ctx.quadraticCurveTo(size * 0.13, size * 0.04, size * 0.08, size * 0.02);
  ctx.closePath();
  ctx.fill();
  
  // Shield rivets around boss
  ctx.fillStyle = "#8a7a3a";
  for (let r = 0; r < 6; r++) {
    const rivetAngle = (r / 6) * Math.PI * 2;
    const rx = Math.cos(rivetAngle) * size * 0.1;
    const ry = Math.sin(rivetAngle) * size * 0.1;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shield edge highlight
  ctx.strokeStyle = `rgba(255, 200, 100, ${0.25 + shimmer * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.17, -size * 0.15);
  ctx.lineTo(-size * 0.17, size * 0.1);
  ctx.stroke();

  // Shield spike for attack
  if (isAttacking) {
    ctx.fillStyle = "#d0d0d0";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.12 - attackIntensity * size * 0.05);
    ctx.lineTo(-size * 0.025, 0);
    ctx.lineTo(size * 0.025, 0);
    ctx.closePath();
    ctx.fill();
    // Spike glint
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * attackIntensity})`;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.08, size * 0.008, size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // === GLADIUS SWORD ARM (dramatic slash during attack) ===
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.02);
  const armSwing = isAttacking ? -1.4 + attackPhase * 2.8 : 0.25 + stance * 0.025;
  ctx.rotate(armSwing);
  
  // Arm
  ctx.fillStyle = "#dbb896";
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.18);
  // Wrist guard
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.05);
  ctx.restore();

  // === GLADIUS SWORD (slashing attack animation) ===
  ctx.save();
  const swordAngle = isAttacking ? -1.0 + attackPhase * 2.0 : -0.2 + stance * 0.04;
  const swordX = x + size * 0.4 + (isAttacking ? attackLunge * 1.6 : 0);
  const swordY = y - size * 0.05 - (isAttacking ? size * 0.25 * (1 - attackPhase) : 0);
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);

  // Sword handle (grip)
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(-size * 0.02, size * 0.05, size * 0.04, size * 0.12);
  // Grip wrapping
  ctx.strokeStyle = "#5a4a3a";
  ctx.lineWidth = 1 * zoom;
  for (let wrap = 0; wrap < 4; wrap++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, size * 0.07 + wrap * size * 0.025);
    ctx.lineTo(size * 0.02, size * 0.08 + wrap * size * 0.025);
    ctx.stroke();
  }
  
  // Pommel
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(0, size * 0.18, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 220, 130, ${0.4 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(-size * 0.008, size * 0.175, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Cross guard
  ctx.fillStyle = "#b08030";
  ctx.fillRect(-size * 0.045, size * 0.03, size * 0.09, size * 0.025);
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(-size * 0.04, size * 0.04, size * 0.012, 0, Math.PI * 2);
  ctx.arc(size * 0.04, size * 0.04, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Blade with gradient
  const bladeGrad = ctx.createLinearGradient(-size * 0.025, -size * 0.35, size * 0.025, -size * 0.35);
  bladeGrad.addColorStop(0, "#a0a0a8");
  bladeGrad.addColorStop(0.2, "#e8e8f0");
  bladeGrad.addColorStop(0.5, "#ffffff");
  bladeGrad.addColorStop(0.8, "#e0e0e8");
  bladeGrad.addColorStop(1, "#909098");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.4);
  ctx.lineTo(-size * 0.035, -size * 0.35);
  ctx.lineTo(-size * 0.03, size * 0.03);
  ctx.lineTo(size * 0.03, size * 0.03);
  ctx.lineTo(size * 0.035, -size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Blade edge highlight
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + shimmer * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.02);
  ctx.lineTo(-size * 0.03, -size * 0.34);
  ctx.lineTo(0, -size * 0.4);
  ctx.stroke();

  // Fuller (blood groove) detail
  ctx.strokeStyle = "rgba(100, 100, 110, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.32);
  ctx.lineTo(0, size * 0.0);
  ctx.stroke();

  // Blade glint (more intense during attack)
  const glintIntensity = isAttacking ? 1 : 0.7;
  ctx.fillStyle = `rgba(255,255,255,${glintIntensity})`;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.35, size * (isAttacking ? 0.03 : 0.018), size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();

  // Attack slash trail effect
  if (isAttacking && attackPhase < 0.6) {
    const trailAlpha = 0.9 - attackPhase * 1.5;
    // Multiple trail arcs for motion blur effect
    for (let trail = 0; trail < 3; trail++) {
      ctx.strokeStyle = `rgba(255, 240, 200, ${trailAlpha * (1 - trail * 0.3)})`;
      ctx.lineWidth = (4 - trail) * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.4);
      ctx.quadraticCurveTo(
        -size * 0.1 * (1 + trail * 0.3),
        -size * 0.2,
        -size * 0.05 * trail,
        size * 0.0
      );
      ctx.stroke();
    }
    // Spark particles
    for (let sp = 0; sp < 4; sp++) {
      const sparkX = -size * 0.05 + Math.sin(time * 15 + sp) * size * 0.1;
      const sparkY = -size * 0.2 - sp * size * 0.08;
      ctx.fillStyle = `rgba(255, 230, 150, ${trailAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // === HEAD ===
  // Neck
  ctx.fillStyle = "#dbb896";
  ctx.fillRect(x - size * 0.05, y - size * 0.18, size * 0.1, size * 0.1);
  // Face
  ctx.beginPath();
  ctx.arc(x, y - size * 0.32, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // === DETAILED GALEA HELMET ===
  // Helmet base (bowl)
  const helmetGrad = ctx.createLinearGradient(x - size * 0.18, y - size * 0.5, x + size * 0.18, y - size * 0.3);
  helmetGrad.addColorStop(0, "#5a5a6a");
  helmetGrad.addColorStop(0.3, "#8a8a9a");
  helmetGrad.addColorStop(0.6, "#7a7a8a");
  helmetGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = helmetGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.4, size * 0.17, size * 0.12, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // Helmet crown
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.48, x, y - size * 0.52);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.48, x + size * 0.17, y - size * 0.4);
  ctx.fill();

  // Helmet crest holder
  ctx.fillStyle = "#6a6a7a";
  ctx.fillRect(x - size * 0.025, y - size * 0.52, size * 0.05, size * 0.14);

  // Cheek guards
  ctx.fillStyle = "#7a7a8a";
  // Left cheek guard
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.35);
  ctx.lineTo(x - size * 0.2, y - size * 0.25);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.18, x - size * 0.1, y - size * 0.2);
  ctx.lineTo(x - size * 0.12, y - size * 0.3);
  ctx.closePath();
  ctx.fill();
  // Right cheek guard
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.35);
  ctx.lineTo(x + size * 0.2, y - size * 0.25);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.18, x + size * 0.1, y - size * 0.2);
  ctx.lineTo(x + size * 0.12, y - size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Neck guard
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.32);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.25, x - size * 0.12, y - size * 0.15);
  ctx.lineTo(x + size * 0.12, y - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.25, x + size * 0.14, y - size * 0.32);
  ctx.closePath();
  ctx.fill();

  // Brow guard
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.38);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.15, y - size * 0.38);
  ctx.lineTo(x + size * 0.13, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.38, x - size * 0.13, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Helmet shine
  ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + shimmer * 0.12})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.46, size * 0.04, size * 0.025, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // === EPIC HORSEHAIR PLUME (dynamic physics) ===
  const plumeWave = Math.sin(time * 5) * 1.2 + (isAttacking ? attackSwing * 2.5 : 0);
  const plumeStretch = isAttacking ? 1.1 : 1;
  
  // Plume shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.52);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const px = x + size * 0.02 + (t - 0.5) * size * 0.28 * plumeStretch + plumeWave * 2.5 * (1 - t);
    const py = y - size * 0.52 - t * size * 0.38 - Math.sin(t * Math.PI) * size * 0.15 + size * 0.02;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 9; i >= 0; i--) {
    const t = i / 9;
    const px = x + size * 0.02 + (t - 0.5) * size * 0.28 * plumeStretch + plumeWave * 2.5 * (1 - t);
    const py = y - size * 0.52 - t * size * 0.32 - Math.sin(t * Math.PI) * size * 0.1 + size * 0.02;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  
  // Outer plume layer (darker orange)
  const plumeGrad = ctx.createLinearGradient(x, y - size * 0.5, x, y - size * 0.9);
  plumeGrad.addColorStop(0, "#cc4400");
  plumeGrad.addColorStop(0.5, "#ff5500");
  plumeGrad.addColorStop(1, "#ff7722");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const waveOffset = Math.sin(time * 6 + t * 3) * 0.5;
    const px = x + (t - 0.5) * size * 0.26 * plumeStretch + plumeWave * 2.2 * (1 - t) + waveOffset;
    const py = y - size * 0.52 - t * size * 0.38 - Math.sin(t * Math.PI) * size * 0.14;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 9; i >= 0; i--) {
    const t = i / 9;
    const waveOffset = Math.sin(time * 6 + t * 3) * 0.3;
    const px = x + (t - 0.5) * size * 0.26 * plumeStretch + plumeWave * 2.2 * (1 - t) + waveOffset;
    const py = y - size * 0.52 - t * size * 0.32 - Math.sin(t * Math.PI) * size * 0.1;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Inner plume layer (bright orange highlight)
  ctx.fillStyle = "#ff8844";
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const waveOffset = Math.sin(time * 7 + t * 2.5) * 0.4;
    const px = x + (t - 0.5) * size * 0.18 * plumeStretch + plumeWave * 1.8 * (1 - t) + waveOffset;
    const py = y - size * 0.55 - t * size * 0.32 - Math.sin(t * Math.PI) * size * 0.1;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 7; i >= 0; i--) {
    const t = i / 7;
    const waveOffset = Math.sin(time * 7 + t * 2.5) * 0.3;
    const px = x + (t - 0.5) * size * 0.18 * plumeStretch + plumeWave * 1.8 * (1 - t) + waveOffset;
    const py = y - size * 0.55 - t * size * 0.28;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Plume core highlight
  ctx.fillStyle = "#ffaa66";
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const px = x + (t - 0.5) * size * 0.1 + plumeWave * 1.2 * (1 - t);
    const py = y - size * 0.58 - t * size * 0.25 - Math.sin(t * Math.PI) * size * 0.06;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 5; i >= 0; i--) {
    const t = i / 5;
    const px = x + (t - 0.5) * size * 0.1 + plumeWave * 1.2 * (1 - t);
    const py = y - size * 0.58 - t * size * 0.22;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Floating plume fibers
  for (let f = 0; f < 5; f++) {
    const fiberPhase = (time * 3 + f * 0.6) % 1;
    const fiberT = 0.3 + f * 0.12;
    const fx = x + (fiberT - 0.5) * size * 0.3 + plumeWave * 2 * (1 - fiberT) + Math.sin(time * 8 + f) * 2;
    const fy = y - size * 0.55 - fiberT * size * 0.35 - fiberPhase * size * 0.1;
    const fiberAlpha = (1 - fiberPhase) * 0.6;
    ctx.fillStyle = `rgba(255, 136, 68, ${fiberAlpha})`;
    ctx.beginPath();
    ctx.ellipse(fx, fy, size * 0.008, size * 0.02, plumeWave * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // === FACE DETAILS ===
  // Eyes - determined look
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.055, y - size * 0.33, size * 0.028, size * (isAttacking ? 0.012 : 0.022), 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.055, y - size * 0.33, size * 0.028, size * (isAttacking ? 0.012 : 0.022), 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye whites
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.052, y - size * 0.335, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.058, y - size * 0.335, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  // Pupils
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x - size * 0.052, y - size * 0.332, size * 0.005, 0, Math.PI * 2);
  ctx.arc(x + size * 0.058, y - size * 0.332, size * 0.005, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows - fierce during attack
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1.8 * zoom;
  const browAnger = isAttacking ? 0.12 : 0;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * (0.37 - browAnger));
  ctx.quadraticCurveTo(x - size * 0.055, y - size * (0.4 + browAnger), x - size * 0.02, y - size * 0.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * (0.37 - browAnger));
  ctx.quadraticCurveTo(x + size * 0.055, y - size * (0.4 + browAnger), x + size * 0.02, y - size * 0.38);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = "#c9a080";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x - size * 0.015, y - size * 0.26);
  ctx.lineTo(x, y - size * 0.24);
  ctx.stroke();

  // Mouth - battle cry during attack, determined otherwise
  if (isAttacking) {
    ctx.fillStyle = "#4a2a1a";
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.22, size * 0.045, size * 0.035 * (1 + attackPhase * 0.6), 0, 0, Math.PI * 2);
    ctx.fill();
    // Teeth hint
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(x - size * 0.025, y - size * 0.23, size * 0.05, size * 0.015);
  } else {
    // Slight smirk
    ctx.strokeStyle = "#9b7b6b";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.035, y - size * 0.22);
    ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.035, y - size * 0.22);
    ctx.stroke();
  }

  // Stubble/chin detail
  ctx.fillStyle = "rgba(90, 70, 50, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, size * 0.06, size * 0.04, 0, 0, Math.PI);
  ctx.fill();

  ctx.restore();
}

function drawCavalryTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ROYAL CAVALRY CHAMPION - Epic Knight of Princeton with Ornate Detail
  const gallop = Math.sin(time * 8) * 3;
  const legCycle = Math.sin(time * 8) * 0.35;
  const headBob = Math.sin(time * 8 + 0.5) * 2;
  const breathe = Math.sin(time * 2) * 0.3;
  const shimmer = Math.sin(time * 5) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Attack animation
  const isAttacking = attackPhase > 0;
  const lanceThrust = isAttacking ? Math.sin(attackPhase * Math.PI) * 2.5 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // === MULTI-LAYERED ROYAL AURA ===
  const auraIntensity = isAttacking ? 0.65 : 0.4;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Multiple layered aura for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
  const auraGrad = ctx.createRadialGradient(
      x, y + size * 0.1, size * (0.08 + layerOffset),
      x, y + size * 0.1, size * (0.9 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(0, `rgba(224, 96, 0, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`);
    auraGrad.addColorStop(0.4, `rgba(255, 140, 40, ${auraIntensity * auraPulse * (0.3 - auraLayer * 0.08)})`);
    auraGrad.addColorStop(0.7, `rgba(200, 80, 0, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.04)})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
    ctx.ellipse(x, y + size * 0.15, size * (0.8 + layerOffset * 0.2), size * (0.52 + layerOffset * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();
  }

  // Floating royal rune particles
  for (let p = 0; p < 8; p++) {
    const pAngle = (time * 1.8 + p * Math.PI * 0.25) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 2.5 + p * 0.8) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.35;
    const pAlpha = 0.5 + Math.sin(time * 3.5 + p * 0.5) * 0.3;
    ctx.fillStyle = `rgba(255, 160, 40, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = `rgba(255, 220, 150, ${pAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack energy rings with spark trails
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      ctx.strokeStyle = `rgba(224, 96, 0, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x, y + size * 0.1,
        size * (0.45 + ringPhase * 0.45),
        size * (0.3 + ringPhase * 0.28),
        0, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    // Spark particles during attack
    for (let sp = 0; sp < 6; sp++) {
      const spAngle = time * 8 + sp * Math.PI / 3;
      const spDist = size * 0.4 + attackIntensity * size * 0.3;
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + size * 0.1 + Math.sin(spAngle) * spDist * 0.4;
      ctx.fillStyle = `rgba(255, 200, 100, ${attackIntensity * 0.7})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === MAJESTIC ROYAL WAR STEED ===
  // Shadow with depth
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.55, 0, x, y + size * 0.55, size * 0.5);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.52, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horse body with rich gradient
  const bodyGrad = ctx.createRadialGradient(
    x - size * 0.1, y + size * 0.05, 0,
    x, y + size * 0.15, size * 0.55
  );
  bodyGrad.addColorStop(0, "#4a3a2a");
  bodyGrad.addColorStop(0.3, "#3a2a1a");
  bodyGrad.addColorStop(0.6, "#2a1a0a");
  bodyGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.48, size * 0.31,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Muscular definition on horse body
  ctx.strokeStyle = "rgba(60, 40, 20, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, y + size * 0.15 + gallop * 0.15, size * 0.18, size * 0.12, -0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.15, y + size * 0.2 + gallop * 0.15, size * 0.2, size * 0.14, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // === ORNATE ROYAL BARDING (horse armor) ===
  // Base barding plate with gradient
  const bardingGrad = ctx.createLinearGradient(
    x - size * 0.4, y + size * 0.1,
    x + size * 0.4, y + size * 0.25
  );
  bardingGrad.addColorStop(0, "#3a3a42");
  bardingGrad.addColorStop(0.2, "#5a5a62");
  bardingGrad.addColorStop(0.5, "#6a6a72");
  bardingGrad.addColorStop(0.8, "#5a5a62");
  bardingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = bardingGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.44, size * 0.24,
    0, Math.PI * 0.65, Math.PI * 2.35
  );
  ctx.fill();

  // Barding edge highlights
  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.44, size * 0.24,
    0, Math.PI * 0.7, Math.PI * 2.3
  );
  ctx.stroke();

  // Orange trim on barding with double line
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.18 + gallop * 0.15,
    size * 0.44, size * 0.24,
    0, Math.PI * 0.75, Math.PI * 2.25
  );
  ctx.stroke();
  ctx.strokeStyle = "#ff8030";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x, y + size * 0.16 + gallop * 0.15,
    size * 0.42, size * 0.22,
    0, Math.PI * 0.8, Math.PI * 2.2
  );
  ctx.stroke();

  // Engraved filigree patterns on barding
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  // Left swirl
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.15, x - size * 0.28, y + size * 0.18 + gallop * 0.15);
  ctx.quadraticCurveTo(x - size * 0.22, y + size * 0.22, x - size * 0.28, y + size * 0.28 + gallop * 0.15);
  ctx.stroke();
  // Right swirl
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.06 + gallop * 0.15);
  ctx.quadraticCurveTo(x + size * 0.28, y + size * 0.12, x + size * 0.22, y + size * 0.16 + gallop * 0.15);
  ctx.quadraticCurveTo(x + size * 0.16, y + size * 0.2, x + size * 0.22, y + size * 0.26 + gallop * 0.15);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate decorative medallions with gems
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 5 * zoom;
  for (let i = 0; i < 5; i++) {
    const medX = x - size * 0.28 + i * size * 0.14;
    const medY = y + size * 0.04 + gallop * 0.15 + Math.sin(i * 0.8) * size * 0.02;
    // Gold medallion base
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.032, 0, Math.PI * 2);
    ctx.fill();
    // Inner medallion detail
    ctx.fillStyle = "#dab32f";
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    // Center gem (alternating colors)
    ctx.fillStyle = i % 2 === 0 ? "#ff4400" : "#00aaff";
    ctx.shadowColor = i % 2 === 0 ? "#ff6600" : "#00ccff";
    ctx.shadowBlur = 4 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Saddle blanket visible edge
  ctx.fillStyle = "#1a0a3a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.02 + gallop * 0.15);
  ctx.lineTo(x - size * 0.2, y + size * 0.12 + gallop * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.14 + gallop * 0.15);
  ctx.lineTo(x + size * 0.12, y + size * 0.04 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Gold fringe on blanket
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.12 + gallop * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.14 + gallop * 0.15);
  ctx.stroke();

  // === HORSE LEGS (muscular with ornate armor) ===
  const legGrad = ctx.createLinearGradient(0, 0, 0, size * 0.35);
  legGrad.addColorStop(0, "#3a2a1a");
  legGrad.addColorStop(0.5, "#2a1a0a");
  legGrad.addColorStop(1, "#1a0a00");

  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.25, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 1.2);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  // Leg muscle highlight
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ornate armored greave with gradient
  const greaveGrad = ctx.createLinearGradient(-size * 0.055, 0, size * 0.055, 0);
  greaveGrad.addColorStop(0, "#4a4a52");
  greaveGrad.addColorStop(0.3, "#6a6a72");
  greaveGrad.addColorStop(0.7, "#6a6a72");
  greaveGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  // Greave engraving
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  // Orange trim
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  // Ornate golden hoof with glow
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.08, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 0.9);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.13, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 1.1);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.3, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 0.8);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.34);
  ctx.fillStyle = "rgba(60, 40, 20, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = greaveGrad;
  ctx.fillRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.stroke();
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.055, size * 0.06, size * 0.11, size * 0.12);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.355, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === HORSE NECK AND HEAD ===
  // Neck with gradient
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.35, y + size * 0.1,
    x - size * 0.6, y - size * 0.1
  );
  neckGrad.addColorStop(0, "#3a2a1a");
  neckGrad.addColorStop(0.5, "#2a1a0a");
  neckGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.52, y - size * 0.18 + headBob * 0.5,
    x - size * 0.6, y - size * 0.06 + headBob
  );
  ctx.lineTo(x - size * 0.72, y - size * 0.03 + headBob);
  ctx.lineTo(x - size * 0.58, y + size * 0.06 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.42, y + size * 0.14 + gallop * 0.15,
    x - size * 0.28, y + size * 0.2 + gallop * 0.15
  );
  ctx.fill();

  // Neck armor plate (crinet)
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.02 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.48, y - size * 0.12 + headBob * 0.5,
    x - size * 0.54, y - size * 0.08 + headBob
  );
  ctx.lineTo(x - size * 0.5, y - size * 0.02 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.44, y + size * 0.06 + gallop * 0.15,
    x - size * 0.36, y + size * 0.08 + gallop * 0.15
  );
  ctx.closePath();
  ctx.fill();
  // Crinet gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // === ORNATE CHANFRON (head armor) ===
  // Base chanfron
  const chanfronGrad = ctx.createLinearGradient(
    x - size * 0.7, y - size * 0.05,
    x - size * 0.5, y - size * 0.15
  );
  chanfronGrad.addColorStop(0, "#4a4a52");
  chanfronGrad.addColorStop(0.5, "#6a6a72");
  chanfronGrad.addColorStop(1, "#5a5a62");
  ctx.fillStyle = chanfronGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.56, y - size * 0.16 + headBob);
  ctx.lineTo(x - size * 0.72, y - size * 0.03 + headBob);
  ctx.lineTo(x - size * 0.6, y + size * 0.05 + headBob);
  ctx.lineTo(x - size * 0.52, y - size * 0.1 + headBob);
  ctx.closePath();
  ctx.fill();
  
  // Chanfron engravings
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.1 + headBob);
  ctx.quadraticCurveTo(x - size * 0.64, y - size * 0.06, x - size * 0.6, y - size * 0.02 + headBob);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Orange accent lines on chanfron
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.56, y - size * 0.15 + headBob);
  ctx.lineTo(x - size * 0.68, y - size * 0.03 + headBob);
  ctx.stroke();

  // Elaborate golden crest with multiple spikes
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffaa00";
  ctx.shadowBlur = 6 * zoom;
  // Center spike
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.16 + headBob);
  ctx.lineTo(x - size * 0.52, y - size * 0.3 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.16 + headBob);
  ctx.closePath();
  ctx.fill();
  // Side spikes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.24 + headBob);
  ctx.lineTo(x - size * 0.56, y - size * 0.14 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.46, y - size * 0.22 + headBob);
  ctx.lineTo(x - size * 0.48, y - size * 0.14 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Chanfron gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.58, y - size * 0.08 + headBob, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Glowing orange eyes with inner fire
  ctx.fillStyle = "#d07000";
  ctx.shadowColor = "#ff6000";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.58, y - size * 0.02 + headBob, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  // Eye inner glow
  ctx.fillStyle = "#ff9030";
  ctx.beginPath();
  ctx.arc(x - size * 0.58, y - size * 0.02 + headBob, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.59, y - size * 0.025 + headBob, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Proud armored ears
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.26 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.16 + headBob);
  ctx.fill();
  // Ear armor tips
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.2 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.26 + headBob);
  ctx.lineTo(x - size * 0.56, y - size * 0.2 + headBob);
  ctx.closePath();
  ctx.fill();

  // === FLOWING MANE WITH FIRE EFFECT ===
  // Base mane (dark)
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.46, y - size * 0.14 + headBob);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const maneX = x - size * 0.46 + t * size * 0.6;
    const maneWave = Math.sin(time * 8 + i * 0.6) * 5;
    const maneY = y - size * 0.28 + maneWave + gallop * (0.1 - t * 0.08) + t * size * 0.16;
    ctx.lineTo(maneX, maneY);
  }
  ctx.lineTo(x + size * 0.14, y - size * 0.04 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();

  // Mane highlight strands
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1.5;
  for (let strand = 0; strand < 5; strand++) {
    ctx.beginPath();
    const startX = x - size * 0.44 + strand * size * 0.1;
    ctx.moveTo(startX, y - size * 0.14 + headBob);
    const waveOffset = Math.sin(time * 8 + strand * 0.8) * 4;
    ctx.quadraticCurveTo(
      startX + size * 0.05 + waveOffset, y - size * 0.22,
      startX + size * 0.1 + waveOffset, y - size * 0.08 + gallop * 0.1
    );
    ctx.stroke();
  }

  // Orange flame tips on mane
  const maneGlow = 0.6 + Math.sin(time * 6) * 0.3;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const tipX = x - size * 0.42 + t * size * 0.56;
    const tipY = y - size * 0.32 + Math.sin(time * 8 + i * 0.7) * 5 + gallop * 0.08;
    // Outer glow
    ctx.fillStyle = `rgba(224, 96, 0, ${maneGlow * 0.5})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = `rgba(255, 180, 80, ${maneGlow})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MAJESTIC TAIL WITH FIRE ===
  // Base tail
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 8 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.42, y + size * 0.12 + gallop * 0.15);
  const tailWave1 = Math.sin(time * 6) * 10;
  const tailWave2 = Math.sin(time * 6 + 1) * 12;
  ctx.quadraticCurveTo(
    x + size * 0.62 + tailWave1,
    y + size * 0.28,
    x + size * 0.58 + tailWave2,
    y + size * 0.52
  );
  ctx.stroke();

  // Tail highlight
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.42, y + size * 0.12 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.6 + tailWave1,
    y + size * 0.26,
    x + size * 0.56 + tailWave2,
    y + size * 0.48
  );
  ctx.stroke();

  // Fire tip on tail
  ctx.fillStyle = `rgba(224, 96, 0, ${maneGlow})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.58 + tailWave2, y + size * 0.52, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 180, 80, ${maneGlow})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.58 + tailWave2, y + size * 0.52, size * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // === ROYAL KNIGHT RIDER ===
  // Elaborate ornate armored body
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.17, y - size * 0.5,
    x + size * 0.17, y - size * 0.1
  );
  armorGrad.addColorStop(0, "#4a4a52");
  armorGrad.addColorStop(0.2, "#5a5a62");
  armorGrad.addColorStop(0.4, "#6a6a72");
  armorGrad.addColorStop(0.6, "#7a7a82");
  armorGrad.addColorStop(0.8, "#6a6a72");
  armorGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.lineTo(x - size * 0.18, y - size * 0.48 + gallop * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x, y - size * 0.56 + gallop * 0.08 + breathe,
    x + size * 0.18, y - size * 0.48 + gallop * 0.08 + breathe
  );
  ctx.lineTo(x + size * 0.16, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.1 + gallop * 0.15 + breathe);
  ctx.lineTo(x - size * 0.17, y - size * 0.46 + gallop * 0.08 + breathe);
  ctx.stroke();

  // Armor segment lines
  ctx.strokeStyle = "#3a3a42";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.2 + gallop * 0.12 + breathe);
  ctx.lineTo(x + size * 0.15, y - size * 0.2 + gallop * 0.12 + breathe);
  ctx.moveTo(x - size * 0.14, y - size * 0.32 + gallop * 0.1 + breathe);
  ctx.lineTo(x + size * 0.14, y - size * 0.32 + gallop * 0.1 + breathe);
  ctx.stroke();

  // Gold filigree on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.15 + gallop * 0.13 + breathe);
  ctx.quadraticCurveTo(x - size * 0.14, y - size * 0.22, x - size * 0.08, y - size * 0.26 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.15 + gallop * 0.13 + breathe);
  ctx.quadraticCurveTo(x + size * 0.14, y - size * 0.22, x + size * 0.08, y - size * 0.26 + breathe);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate orange tabard with layered design
  // Tabard shadow
  ctx.fillStyle = "#a04000";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.06 + gallop * 0.15);
  ctx.lineTo(x - size * 0.14, y - size * 0.4 + gallop * 0.1);
  ctx.lineTo(x + size * 0.14, y - size * 0.4 + gallop * 0.1);
  ctx.lineTo(x + size * 0.12, y - size * 0.06 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Main tabard
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, y - size * 0.08 + gallop * 0.15);
  ctx.lineTo(x - size * 0.13, y - size * 0.38 + gallop * 0.1);
  ctx.lineTo(x + size * 0.13, y - size * 0.38 + gallop * 0.1);
  ctx.lineTo(x + size * 0.11, y - size * 0.08 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Double gold trim
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.1 + gallop * 0.15);
  ctx.lineTo(x - size * 0.12, y - size * 0.36 + gallop * 0.1);
  ctx.lineTo(x + size * 0.12, y - size * 0.36 + gallop * 0.1);
  ctx.lineTo(x + size * 0.1, y - size * 0.1 + gallop * 0.15);
  ctx.closePath();
  ctx.stroke();

  // Embroidered Princeton "P" emblem with shadow
  ctx.fillStyle = "#0a0a0a";
  ctx.font = `bold ${size * 0.14}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x + size * 0.005, y - size * 0.23 + gallop * 0.12);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", x, y - size * 0.24 + gallop * 0.12);

  // Layered pauldrons (shoulder armor)
  // Left pauldron
  ctx.save();
  ctx.translate(x - size * 0.18, y - size * 0.4 + gallop * 0.1 + breathe);
  const pauldronGradL = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradL.addColorStop(0, "#7a7a82");
  pauldronGradL.addColorStop(0.6, "#5a5a62");
  pauldronGradL.addColorStop(1, "#4a4a52");
  ctx.fillStyle = pauldronGradL;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Pauldron layers
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.03, size * 0.07, size * 0.045, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Gold trim and spike
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, -0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.02);
  ctx.lineTo(-size * 0.14, -size * 0.06);
  ctx.lineTo(-size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Right pauldron
  ctx.save();
  ctx.translate(x + size * 0.18, y - size * 0.4 + gallop * 0.1 + breathe);
  const pauldronGradR = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  pauldronGradR.addColorStop(0, "#7a7a82");
  pauldronGradR.addColorStop(0.6, "#5a5a62");
  pauldronGradR.addColorStop(1, "#4a4a52");
  ctx.fillStyle = pauldronGradR;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(-size * 0.02, size * 0.03, size * 0.07, size * 0.045, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.07, 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.02);
  ctx.lineTo(size * 0.14, -size * 0.06);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === MAGNIFICENT GREAT HELM ===
  // Helm base with gradient
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.04, y - size * 0.64 + gallop * 0.08, size * 0.02,
    x, y - size * 0.58 + gallop * 0.08, size * 0.18
  );
  helmGrad.addColorStop(0, "#8a8a92");
  helmGrad.addColorStop(0.5, "#6a6a72");
  helmGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // Helm crest ridge
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.75 + gallop * 0.08);
  ctx.lineTo(x - size * 0.025, y - size * 0.55 + gallop * 0.08);
  ctx.lineTo(x + size * 0.025, y - size * 0.55 + gallop * 0.08);
  ctx.lineTo(x + size * 0.02, y - size * 0.75 + gallop * 0.08);
  ctx.closePath();
  ctx.fill();

  // Decorative gold rim with pattern
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.15, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.15, Math.PI * 1.3, Math.PI * 1.7);
  ctx.stroke();

  // Crown points on helm
  ctx.fillStyle = "#c9a227";
  for (let cp = 0; cp < 3; cp++) {
    const cpAngle = Math.PI * 1.25 + cp * Math.PI * 0.25;
    const cpX = x + Math.cos(cpAngle) * size * 0.17;
    const cpY = y - size * 0.58 + gallop * 0.08 + Math.sin(cpAngle) * size * 0.17;
    ctx.beginPath();
    ctx.moveTo(cpX, cpY);
    ctx.lineTo(cpX + Math.cos(cpAngle) * size * 0.04, cpY + Math.sin(cpAngle) * size * 0.04 - size * 0.02);
    ctx.lineTo(cpX + Math.cos(cpAngle + 0.25) * size * 0.02, cpY + Math.sin(cpAngle + 0.25) * size * 0.02);
    ctx.closePath();
    ctx.fill();
  }

  // Visor with detailed construction
  ctx.fillStyle = "#2a2a32";
  ctx.fillRect(x - size * 0.13, y - size * 0.62 + gallop * 0.08, size * 0.26, size * 0.08);
  // Visor slits
  ctx.fillStyle = "#1a1a22";
  for (let slit = 0; slit < 3; slit++) {
  ctx.fillRect(
      x - size * 0.1 + slit * size * 0.07,
    y - size * 0.6 + gallop * 0.08,
      size * 0.04,
      size * 0.012
    );
  }
  // Orange glow through visor
  ctx.fillStyle = `rgba(224, 96, 0, ${0.7 + Math.sin(time * 4) * 0.25})`;
  ctx.shadowColor = "#ff6000";
  ctx.shadowBlur = 8 * zoom;
  ctx.fillRect(x - size * 0.11, y - size * 0.6 + gallop * 0.08, size * 0.22, size * 0.04);
  ctx.shadowBlur = 0;
  // Visor breaths (air holes)
  ctx.fillStyle = "#1a1a22";
  for (let hole = 0; hole < 4; hole++) {
  ctx.beginPath();
    ctx.arc(x - size * 0.08 + hole * size * 0.05, y - size * 0.54 + gallop * 0.08, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central helm gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.75 + gallop * 0.08, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === MAGNIFICENT MULTI-LAYERED PLUME ===
  const plumeWave = Math.sin(time * 5) * 3;
  const plumeWave2 = Math.sin(time * 5.5 + 0.5) * 2;

  // Plume shadow layer
  ctx.fillStyle = "#a04000";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.72 + gallop * 0.08);
  for (let i = 0; i < 7; i++) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.05 + i * 0.018) + Math.sin(time * 7 + i * 0.8) * 2.5;
    ctx.lineTo(x - pW + plumeWave + size * 0.02, pY);
  }
  for (let i = 6; i >= 0; i--) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.05 + i * 0.018) + Math.sin(time * 7 + i * 0.8) * 2.5;
    ctx.lineTo(x + pW + plumeWave + size * 0.02, pY);
  }
  ctx.closePath();
  ctx.fill();

  // Main plume
  const plumeGrad = ctx.createLinearGradient(x, y - size * 0.72, x, y - size * 1.0);
  plumeGrad.addColorStop(0, "#e06000");
  plumeGrad.addColorStop(0.3, "#ff7020");
  plumeGrad.addColorStop(0.7, "#e06000");
  plumeGrad.addColorStop(1, "#c04000");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.72 + gallop * 0.08);
  for (let i = 0; i < 7; i++) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.045 + i * 0.016) + Math.sin(time * 7 + i * 0.8) * 2;
    ctx.lineTo(x - pW + plumeWave, pY);
  }
  for (let i = 6; i >= 0; i--) {
    const pY = y - size * 0.72 - i * size * 0.045 + gallop * 0.08;
    const pW = size * (0.045 + i * 0.016) + Math.sin(time * 7 + i * 0.8) * 2;
    ctx.lineTo(x + pW + plumeWave, pY);
  }
  ctx.closePath();
  ctx.fill();

  // Plume feather highlights
  ctx.strokeStyle = "#ff9040";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  for (let feather = 0; feather < 5; feather++) {
    const fOffset = (feather - 2) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(x + fOffset, y - size * 0.74 + gallop * 0.08);
    const fWave = Math.sin(time * 7 + feather * 0.6) * 2;
    ctx.quadraticCurveTo(
      x + fOffset + fWave, y - size * 0.88,
      x + fOffset + plumeWave * 0.5, y - size * 1.0 + gallop * 0.08
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Secondary smaller plume
  ctx.fillStyle = "#ff8030";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.7 + gallop * 0.08);
  for (let i = 0; i < 4; i++) {
    const pY = y - size * 0.7 - i * size * 0.035 + gallop * 0.08;
    const pW = size * (0.03 + i * 0.01) + Math.sin(time * 8 + i) * 1.5;
    ctx.lineTo(x - size * 0.06 - pW + plumeWave2, pY);
  }
  for (let i = 3; i >= 0; i--) {
    const pY = y - size * 0.7 - i * size * 0.035 + gallop * 0.08;
    const pW = size * (0.03 + i * 0.01) + Math.sin(time * 8 + i) * 1.5;
    ctx.lineTo(x - size * 0.06 + pW + plumeWave2, pY);
  }
  ctx.closePath();
  ctx.fill();

  // === ORNATE ROYAL LANCE ===
  ctx.save();
  const lanceAngle = isAttacking ? -0.35 - lanceThrust * 0.35 : -0.35;
  const lanceLunge = isAttacking ? size * 0.32 * Math.sin(attackPhase * Math.PI) : 0;
  ctx.translate(
    x + size * 0.26 + lanceLunge * 0.5,
    y - size * 0.32 + gallop * 0.12 - lanceLunge * 0.3
  );
  ctx.rotate(lanceAngle);

  // Ornate lance shaft with wood grain gradient
  const lanceGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  lanceGrad.addColorStop(0, "#4a2a10");
  lanceGrad.addColorStop(0.2, "#6a4a2a");
  lanceGrad.addColorStop(0.5, "#8a6a4a");
  lanceGrad.addColorStop(0.8, "#6a4a2a");
  lanceGrad.addColorStop(1, "#4a2a10");
  ctx.fillStyle = lanceGrad;
  ctx.fillRect(-size * 0.04, -size * 0.85, size * 0.08, size * 1.0);

  // Spiral leather wrapping
  ctx.strokeStyle = "#3a1a0a";
  ctx.lineWidth = 1.5;
  for (let wrap = 0; wrap < 8; wrap++) {
    const wrapY = -size * 0.15 + wrap * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, wrapY);
    ctx.lineTo(size * 0.04, wrapY + size * 0.04);
    ctx.stroke();
  }

  // Ornate gold bands on shaft with gems
  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < 4; i++) {
    const bandY = -size * 0.2 - i * size * 0.2;
    ctx.fillRect(-size * 0.045, bandY, size * 0.09, size * 0.04);
    // Band engraving
    ctx.strokeStyle = "#a08020";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, bandY + size * 0.02);
    ctx.lineTo(size * 0.03, bandY + size * 0.02);
    ctx.stroke();
    // Band gem
    if (i < 3) {
      ctx.fillStyle = "#ff4400";
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(0, bandY + size * 0.02, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#c9a227";
    }
  }

  // Elaborate gleaming lance tip
  const tipGrad = ctx.createLinearGradient(-size * 0.08, -size * 0.85, size * 0.08, -size * 0.85);
  tipGrad.addColorStop(0, "#b0b0b0");
  tipGrad.addColorStop(0.3, "#e0e0e0");
  tipGrad.addColorStop(0.5, "#f0f0f0");
  tipGrad.addColorStop(0.7, "#e0e0e0");
  tipGrad.addColorStop(1, "#b0b0b0");
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.08);
  ctx.lineTo(-size * 0.07, -size * 0.85);
  ctx.lineTo(size * 0.07, -size * 0.85);
  ctx.closePath();
  ctx.fill();

  // Lance tip edge highlight
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.06);
  ctx.lineTo(-size * 0.05, -size * 0.86);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gold inlay pattern on tip
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.02);
  ctx.lineTo(0, -size * 0.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.95);
  ctx.lineTo(size * 0.025, -size * 0.95);
  ctx.stroke();

  // Ornate coronet below tip
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.85);
  ctx.lineTo(-size * 0.06, -size * 0.88);
  ctx.lineTo(size * 0.06, -size * 0.88);
  ctx.lineTo(size * 0.08, -size * 0.85);
  ctx.closePath();
  ctx.fill();

  // Orange energy during attack
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const fireIntensity = 1 - Math.abs(attackPhase - 0.5) * 2.5;
    // Outer flame
    ctx.fillStyle = `rgba(224, 96, 0, ${fireIntensity * 0.5})`;
    ctx.shadowColor = "#ff6000";
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.08);
    ctx.lineTo(-size * 0.08, -size * 1.35);
    ctx.lineTo(size * 0.08, -size * 1.35);
    ctx.closePath();
    ctx.fill();
    // Inner bright flame
    ctx.fillStyle = `rgba(255, 180, 80, ${fireIntensity * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.08);
    ctx.lineTo(-size * 0.04, -size * 1.28);
    ctx.lineTo(size * 0.04, -size * 1.28);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Fire particles
    for (let fp = 0; fp < 5; fp++) {
      const fpY = -size * 1.1 - fp * size * 0.05;
      const fpX = Math.sin(time * 12 + fp * 1.5) * size * 0.04;
      ctx.fillStyle = `rgba(255, 200, 100, ${fireIntensity * (1 - fp * 0.15)})`;
      ctx.beginPath();
      ctx.arc(fpX, fpY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ornate multi-layer pennant
  const pennantWave = Math.sin(time * 8) * 4 + (isAttacking ? lanceThrust * 6 : 0);
  // Pennant shadow
  ctx.fillStyle = "#a04000";
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.74);
  ctx.quadraticCurveTo(
    -size * 0.22 + pennantWave,
    -size * 0.68,
    -size * 0.3 + pennantWave * 1.5,
    -size * 0.64
  );
  ctx.lineTo(-size * 0.03, -size * 0.58);
  ctx.closePath();
  ctx.fill();
  // Main pennant
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.75);
  ctx.quadraticCurveTo(
    -size * 0.2 + pennantWave,
    -size * 0.69,
    -size * 0.28 + pennantWave * 1.5,
    -size * 0.65
  );
  ctx.lineTo(-size * 0.025, -size * 0.6);
  ctx.closePath();
  ctx.fill();
  // Pennant gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Pennant inner highlight
  ctx.fillStyle = "#ff8030";
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.73);
  ctx.quadraticCurveTo(
    -size * 0.15 + pennantWave,
    -size * 0.69,
    -size * 0.2 + pennantWave * 1.2,
    -size * 0.66
  );
  ctx.lineTo(-size * 0.04, -size * 0.62);
  ctx.closePath();
  ctx.fill();
  // Black "P" on pennant with gold outline
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.font = `bold ${size * 0.07}px serif`;
  ctx.strokeText("P", -size * 0.12 + pennantWave * 0.6, -size * 0.67);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", -size * 0.12 + pennantWave * 0.6, -size * 0.67);
  ctx.restore();

  // === ORNATE ROYAL SHIELD ===
  ctx.save();
  ctx.translate(x - size * 0.26, y - size * 0.18 + gallop * 0.12);
  ctx.rotate(-0.15);

  // Shield shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.22);
  ctx.lineTo(-size * 0.13, -size * 0.11);
  ctx.lineTo(-size * 0.11, size * 0.2);
  ctx.lineTo(size * 0.02, size * 0.28);
  ctx.lineTo(size * 0.14, size * 0.2);
  ctx.lineTo(size * 0.16, -size * 0.11);
  ctx.closePath();
  ctx.fill();

  // Ornate kite shield with gradient
  const shieldGrad = ctx.createLinearGradient(-size * 0.15, 0, size * 0.15, 0);
  shieldGrad.addColorStop(0, "#2a2a32");
  shieldGrad.addColorStop(0.3, "#4a4a52");
  shieldGrad.addColorStop(0.5, "#5a5a62");
  shieldGrad.addColorStop(0.7, "#4a4a52");
  shieldGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Shield edge highlight
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.25);
  ctx.lineTo(-size * 0.14, -size * 0.13);
  ctx.stroke();

  // Orange field with gradient
  const fieldGrad = ctx.createLinearGradient(0, -size * 0.18, 0, size * 0.2);
  fieldGrad.addColorStop(0, "#ff7020");
  fieldGrad.addColorStop(0.5, "#e06000");
  fieldGrad.addColorStop(1, "#c04000");
  ctx.fillStyle = fieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.11, -size * 0.09);
  ctx.lineTo(-size * 0.09, size * 0.15);
  ctx.lineTo(0, size * 0.21);
  ctx.lineTo(size * 0.09, size * 0.15);
  ctx.lineTo(size * 0.11, -size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Shield filigree engravings
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  // Top swirl
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.08, -size * 0.06, -size * 0.04, -size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.06, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.06, size * 0.04, -size * 0.02);
  ctx.stroke();
  // Bottom swirl
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.06, size * 0.14, -size * 0.02, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.04, size * 0.1);
  ctx.quadraticCurveTo(size * 0.06, size * 0.14, size * 0.02, size * 0.16);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Double gold trim
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.23);
  ctx.lineTo(-size * 0.12, -size * 0.12);
  ctx.lineTo(-size * 0.1, size * 0.17);
  ctx.lineTo(0, size * 0.24);
  ctx.lineTo(size * 0.1, size * 0.17);
  ctx.lineTo(size * 0.12, -size * 0.12);
  ctx.closePath();
  ctx.stroke();

  // Corner gems on shield
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, -size * 0.22, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.1, size * 0.12, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.1, size * 0.12, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ornate "P" emblem with shadow
  ctx.fillStyle = "#0a0a0a";
  ctx.font = `bold ${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("P", size * 0.005, size * 0.065);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", 0, size * 0.06);
  // Gold outline on P
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.6;
  ctx.strokeText("P", 0, size * 0.06);

  // Shield boss (center boss)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(0, size * 0.02, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.arc(0, size * 0.02, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCentaurTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // EPIC ORNATE CENTAUR ARCHER - Golden War Champion of Princeton
  const gallop = Math.sin(time * 7) * 4;
  const legCycle = Math.sin(time * 7) * 0.4;
  const breathe = Math.sin(time * 2) * 0.5;
  const tailSwish = Math.sin(time * 5);
  const hairFlow = Math.sin(time * 4);
  const shimmer = Math.sin(time * 5) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Attack animation - bow draw and release
  const isAttacking = attackPhase > 0;
  const bowDraw = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // === MULTI-LAYERED MAJESTIC GOLDEN AURA ===
  const auraIntensity = isAttacking ? 0.6 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Multiple layered auras for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
  const auraGrad = ctx.createRadialGradient(
      x + size * 0.05, y + size * 0.1, size * (0.08 + layerOffset),
      x + size * 0.05, y + size * 0.1, size * (0.9 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(0, `rgba(255, 215, 80, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`);
    auraGrad.addColorStop(0.3, `rgba(255, 180, 50, ${auraIntensity * auraPulse * (0.35 - auraLayer * 0.08)})`);
    auraGrad.addColorStop(0.6, `rgba(200, 140, 20, ${auraIntensity * auraPulse * (0.2 - auraLayer * 0.05)})`);
    auraGrad.addColorStop(1, "rgba(200, 100, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
    ctx.ellipse(x + size * 0.05, y + size * 0.15, size * (0.8 + layerOffset * 0.2), size * (0.55 + layerOffset * 0.15), 0, 0, Math.PI * 2);
  ctx.fill();
  }

  // Floating golden rune particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + p * Math.PI * 0.2) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 2.5 + p * 0.7) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.38;
    const pAlpha = 0.5 + Math.sin(time * 4 + p * 0.6) * 0.3;
    // Outer glow
    ctx.fillStyle = `rgba(255, 215, 0, ${pAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = `rgba(255, 240, 150, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ENERGY RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      ctx.strokeStyle = `rgba(255, 215, 80, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x, y + size * 0.1,
        size * (0.5 + ringPhase * 0.45),
        size * (0.32 + ringPhase * 0.28),
        0, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    // Golden spark particles
    for (let sp = 0; sp < 8; sp++) {
      const spAngle = time * 6 + sp * Math.PI / 4;
      const spDist = size * 0.35 + attackIntensity * size * 0.35;
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + size * 0.1 + Math.sin(spAngle) * spDist * 0.4;
      ctx.fillStyle = `rgba(255, 230, 120, ${attackIntensity * 0.8})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x + size * 0.05, y + size * 0.55, 0, x + size * 0.05, y + size * 0.55, size * 0.55);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.05, y + size * 0.55, size * 0.55, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // === POWERFUL HORSE BODY WITH DETAILED COAT ===
  // Main body with rich golden gradient
  const bodyGrad = ctx.createRadialGradient(
    x + size * 0.02, y + size * 0.05, 0,
    x + size * 0.08, y + size * 0.15, size * 0.55
  );
  bodyGrad.addColorStop(0, "#f0d878");
  bodyGrad.addColorStop(0.25, "#e8c868");
  bodyGrad.addColorStop(0.5, "#c09838");
  bodyGrad.addColorStop(0.75, "#9a7820");
  bodyGrad.addColorStop(1, "#6b5010");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08, y + size * 0.15 + gallop * 0.12,
    size * 0.46, size * 0.28,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Muscle definition highlights
  ctx.strokeStyle = "rgba(240, 220, 150, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y + size * 0.08 + gallop * 0.12, size * 0.14, 0.4, 2.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y + size * 0.06 + gallop * 0.12, size * 0.12, 0.5, 2.0);
  ctx.stroke();

  // Muscle definition shadows
  ctx.strokeStyle = "rgba(107,80,16,0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y + size * 0.14 + gallop * 0.12, size * 0.17, 0.3, 2.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.28, y + size * 0.12 + gallop * 0.12, size * 0.15, 0.4, 2.3);
  ctx.stroke();

  // Battle scars (honorable marks)
  ctx.strokeStyle = "rgba(100, 70, 30, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.04 + gallop * 0.12);
  ctx.lineTo(x - size * 0.02, y + size * 0.16 + gallop * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y + size * 0.02 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.12 + gallop * 0.12);
  ctx.stroke();

  // === ORNATE ARMORED BARDING ===
  // Chest armor plate with gradient
  const chestArmorGrad = ctx.createLinearGradient(
    x - size * 0.35, y + size * 0.1,
    x - size * 0.1, y + size * 0.25
  );
  chestArmorGrad.addColorStop(0, "#6b5010");
  chestArmorGrad.addColorStop(0.3, "#9a7820");
  chestArmorGrad.addColorStop(0.6, "#8b6914");
  chestArmorGrad.addColorStop(1, "#6b5010");
  ctx.fillStyle = chestArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, y + size * 0.03 + gallop * 0.12);
  ctx.lineTo(x - size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x - size * 0.22, y + size * 0.28 + gallop * 0.12);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Engraved filigree on chest armor
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.1 + gallop * 0.12);
  ctx.quadraticCurveTo(x - size * 0.32, y + size * 0.16, x - size * 0.26, y + size * 0.2 + gallop * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(x - size * 0.26, y + size * 0.14, x - size * 0.2, y + size * 0.18 + gallop * 0.12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Chest armor gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y + size * 0.14 + gallop * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Back armor plate
  const backArmorGrad = ctx.createLinearGradient(
    x + size * 0.2, y + size * 0.0,
    x + size * 0.4, y + size * 0.2
  );
  backArmorGrad.addColorStop(0, "#8b6914");
  backArmorGrad.addColorStop(0.5, "#9a7820");
  backArmorGrad.addColorStop(1, "#6b5010");
  ctx.fillStyle = backArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + gallop * 0.12);
  ctx.lineTo(x + size * 0.42, y + size * 0.08 + gallop * 0.12);
  ctx.lineTo(x + size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.18 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Back armor gem
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x + size * 0.32, y + size * 0.1 + gallop * 0.12, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Decorative medallion chain across body
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.22 + gallop * 0.12);
  ctx.quadraticCurveTo(x, y + size * 0.26 + gallop * 0.12, x + size * 0.2, y + size * 0.22 + gallop * 0.12);
  ctx.stroke();
  // Medallions on chain
  for (let med = 0; med < 5; med++) {
    const medX = x - size * 0.16 + med * size * 0.09;
    const medY = y + size * 0.24 + Math.sin(med * 0.8) * size * 0.015 + gallop * 0.12;
    ctx.fillStyle = "#dab32f";
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // === POWERFUL LEGS WITH ORNATE ARMOR ===
  // Leg gradient
  const legGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGrad.addColorStop(0, "#9a7820");
  legGrad.addColorStop(0.3, "#c09838");
  legGrad.addColorStop(0.7, "#c09838");
  legGrad.addColorStop(1, "#9a7820");

  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.2, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 1.1);
  // Upper leg (muscular)
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.09, size * 0.1, -size * 0.05, size * 0.18);
  ctx.lineTo(size * 0.05, size * 0.18);
  ctx.quadraticCurveTo(size * 0.09, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  // Muscle highlight
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lower leg
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  // Leg armor band
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  // Ornate hoof with glow
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.05, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 0.85);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.1, -size * 0.045, size * 0.18);
  ctx.lineTo(size * 0.045, size * 0.18);
  ctx.quadraticCurveTo(size * 0.08, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.22, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 1.0);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.09, size * 0.1, -size * 0.05, size * 0.18);
  ctx.lineTo(size * 0.05, size * 0.18);
  ctx.quadraticCurveTo(size * 0.09, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.37, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 0.9);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.1, -size * 0.045, size * 0.18);
  ctx.lineTo(size * 0.045, size * 0.18);
  ctx.quadraticCurveTo(size * 0.08, size * 0.1, size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(240, 220, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.08, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.045, size * 0.16, size * 0.09, size * 0.17);
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.04);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.06, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dab32f";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.335, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === MAJESTIC FLOWING TAIL ===
  // Tail base (dark)
  ctx.strokeStyle = "#5a4010";
  ctx.lineWidth = 9 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.06 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.72 + tailSwish * 12,
    y + size * 0.14,
    x + size * 0.62 + tailSwish * 16,
    y + size * 0.46
  );
  ctx.stroke();

  // Tail main layer
  ctx.strokeStyle = "#6b5010";
  ctx.lineWidth = 7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.07 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.7 + tailSwish * 11,
    y + size * 0.15,
    x + size * 0.6 + tailSwish * 15,
    y + size * 0.44
  );
  ctx.stroke();

  // Tail highlight strands
  ctx.strokeStyle = "#c09838";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.65 + tailSwish * 8,
    y + size * 0.14,
    x + size * 0.56 + tailSwish * 12,
    y + size * 0.38
  );
  ctx.stroke();

  // Golden tail tip glow
  ctx.fillStyle = `rgba(255, 215, 100, ${0.5 + Math.sin(time * 4) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.62 + tailSwish * 16, y + size * 0.46, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // === MUSCULAR HUMAN TORSO ===
  // Back muscles layer
  ctx.fillStyle = "#c89050";
  ctx.beginPath();
  ctx.ellipse(
    x, y - size * 0.06 + gallop * 0.08 + breathe,
    size * 0.24, size * 0.2,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Main torso with rich gradient
  const torsoGrad = ctx.createLinearGradient(
    x - size * 0.24, y - size * 0.25,
    x + size * 0.24, y + size * 0.05
  );
  torsoGrad.addColorStop(0, "#c08040");
  torsoGrad.addColorStop(0.2, "#d8a060");
  torsoGrad.addColorStop(0.4, "#e8b878");
  torsoGrad.addColorStop(0.6, "#e8b070");
  torsoGrad.addColorStop(0.8, "#d8a060");
  torsoGrad.addColorStop(1, "#c08040");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.lineTo(x - size * 0.28, y - size * 0.32 + gallop * 0.04 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x, y - size * 0.46 + gallop * 0.04 + breathe * 0.3,
    x + size * 0.28, y - size * 0.32 + gallop * 0.04 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest/pec definition
  ctx.strokeStyle = "rgba(180, 130, 80, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.24 + gallop * 0.05 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x, y - size * 0.18 + gallop * 0.05 + breathe * 0.4,
    x + size * 0.18, y - size * 0.24 + gallop * 0.05 + breathe * 0.4
  );
  ctx.stroke();
  // Ab definition lines
  ctx.strokeStyle = "rgba(139,90,50,0.35)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + gallop * 0.05 + breathe * 0.3);
  ctx.lineTo(x, y - size * 0.05 + gallop * 0.08 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.16 + gallop * 0.06 + breathe * 0.5);
  ctx.lineTo(x + size * 0.1, y - size * 0.16 + gallop * 0.06 + breathe * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.08 + gallop * 0.07 + breathe * 0.7);
  ctx.lineTo(x + size * 0.08, y - size * 0.08 + gallop * 0.07 + breathe * 0.7);
  ctx.stroke();

  // Ornate warrior sash with detail
  const sashGrad = ctx.createLinearGradient(
    x - size * 0.22, y - size * 0.26,
    x + size * 0.1, y - size * 0.04
  );
  sashGrad.addColorStop(0, "#e06000");
  sashGrad.addColorStop(0.5, "#ff7020");
  sashGrad.addColorStop(1, "#d04000");
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.27 + gallop * 0.05);
  ctx.lineTo(x + size * 0.14, y - size * 0.08 + gallop * 0.08);
  ctx.lineTo(x + size * 0.1, y - size * 0.02 + gallop * 0.08);
  ctx.lineTo(x - size * 0.26, y - size * 0.22 + gallop * 0.05);
  ctx.closePath();
  ctx.fill();
  // Sash gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Sash medallion
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.16 + gallop * 0.06, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // === POWERFUL ARMS WITH BRACERS ===
  // Left arm (drawing bow)
  ctx.save();
  ctx.translate(x - size * 0.3, y - size * 0.2 + gallop * 0.05);
  ctx.rotate(-0.55);
  // Upper arm
  const armGrad = ctx.createRadialGradient(0, size * 0.08, 0, 0, size * 0.08, size * 0.12);
  armGrad.addColorStop(0, "#e8b878");
  armGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.065, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(-size * 0.05, size * 0.22, size * 0.055, size * 0.11, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Ornate bracer
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.ellipse(-size * 0.06, size * 0.2, size * 0.06, size * 0.05, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Bracer gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Right arm (holding bowstring back)
  ctx.save();
  ctx.translate(x + size * 0.3, y - size * 0.2 + gallop * 0.05);
  ctx.rotate(0.45);
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.065, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(size * 0.04, size * 0.2, size * 0.055, size * 0.11, 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Bracer
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.ellipse(size * 0.05, size * 0.18, size * 0.06, size * 0.05, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(size * 0.05, size * 0.18, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === ORNATE HEAD ===
  // Neck with highlights
  const neckGrad = ctx.createLinearGradient(x - size * 0.06, y - size * 0.42, x + size * 0.06, y - size * 0.42);
  neckGrad.addColorStop(0, "#c89050");
  neckGrad.addColorStop(0.5, "#e0a868");
  neckGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = neckGrad;
  ctx.fillRect(x - size * 0.07, y - size * 0.42 + gallop * 0.04, size * 0.14, size * 0.12);

  // Face with gradient
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.02, y - size * 0.52 + gallop * 0.04, 0,
    x, y - size * 0.5 + gallop * 0.04, size * 0.15
  );
  faceGrad.addColorStop(0, "#f0c890");
  faceGrad.addColorStop(0.6, "#e8b878");
  faceGrad.addColorStop(1, "#d8a060");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52 + gallop * 0.04, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // === FLOWING GOLDEN HAIR WITH DETAIL ===
  // Hair shadow layer
  ctx.fillStyle = "#9a7820";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.6 + gallop * 0.04);
  for (let i = 0; i < 10; i++) {
    const hairAngle = -1.0 + i * 0.24;
    const hairWave = Math.sin(time * 5.5 + i * 0.5) * 4 + hairFlow * 2.5;
    const hairLen = size * (0.22 + (i > 4 ? 0.12 : 0));
    ctx.lineTo(
      x + Math.cos(hairAngle) * hairLen + hairWave * 0.6,
      y - size * 0.52 + Math.sin(hairAngle) * hairLen * 0.85 + hairWave + gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();

  // Main hair
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.62 + gallop * 0.04);
  for (let i = 0; i < 9; i++) {
    const hairAngle = -0.95 + i * 0.25;
    const hairWave = Math.sin(time * 5 + i * 0.5) * 3.5 + hairFlow * 2;
    const hairLen = size * (0.2 + (i > 4 ? 0.1 : 0));
    ctx.lineTo(
      x + Math.cos(hairAngle) * hairLen + hairWave * 0.5,
      y - size * 0.52 + Math.sin(hairAngle) * hairLen * 0.82 + hairWave + gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();

  // Hair highlight strands
  ctx.fillStyle = "#e0c058";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.64 + gallop * 0.04);
  for (let i = 0; i < 6; i++) {
    const hairAngle = -0.75 + i * 0.32;
    const hairWave = Math.sin(time * 5 + i * 0.6) * 2.5 + hairFlow * 1.5;
    ctx.lineTo(
      x + Math.cos(hairAngle) * size * 0.16 + hairWave * 0.35,
      y - size * 0.54 + Math.sin(hairAngle) * size * 0.13 + hairWave * 0.55 + gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();

  // Brightest highlights
  ctx.strokeStyle = "#f0d878";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.6;
  for (let strand = 0; strand < 4; strand++) {
    const strandAngle = -0.6 + strand * 0.4;
    const strandWave = Math.sin(time * 5 + strand * 0.8) * 2;
  ctx.beginPath();
    ctx.moveTo(x + Math.cos(strandAngle) * size * 0.08, y - size * 0.58 + gallop * 0.04);
    ctx.quadraticCurveTo(
      x + Math.cos(strandAngle) * size * 0.14 + strandWave,
      y - size * 0.52 + Math.sin(strandAngle) * size * 0.08,
      x + Math.cos(strandAngle) * size * 0.18 + strandWave * 1.5,
      y - size * 0.46 + Math.sin(strandAngle) * size * 0.12 + gallop * 0.04
  );
  ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === ORNATE LAUREL CROWN ===
  // Crown base band
  ctx.strokeStyle = "#dab32f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.57 + gallop * 0.04, size * 0.14, Math.PI * 0.75, Math.PI * 0.25, true);
  ctx.stroke();
  ctx.strokeStyle = "#a08020";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.57 + gallop * 0.04, size * 0.12, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.stroke();

  // Elaborate laurel leaves
  ctx.fillStyle = "#c9a227";
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 6; i++) {
      const leafAngle = side === -1 ? Math.PI * 0.75 - i * 0.12 : Math.PI * 0.25 + i * 0.12;
      const leafX = x + Math.cos(leafAngle) * size * 0.14;
      const leafY = y - size * 0.57 + Math.sin(leafAngle) * size * 0.14 + gallop * 0.04;
      const leafSize = size * (0.028 - i * 0.002);
    ctx.beginPath();
      ctx.ellipse(leafX, leafY, leafSize, leafSize * 0.45, leafAngle + Math.PI * 0.5 * side, 0, Math.PI * 2);
    ctx.fill();
    }
  }

  // Crown center gem
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.71 + gallop * 0.04, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem highlight
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.008, y - size * 0.715 + gallop * 0.04, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Side crown gems
  ctx.fillStyle = "#00aaff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.62 + gallop * 0.04, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.12, y - size * 0.62 + gallop * 0.04, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === FIERCE GLOWING EYES ===
  // Eye base
  ctx.fillStyle = "#3070b0";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.028, size * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.028, size * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow
  ctx.fillStyle = "#60a0d0";
  ctx.shadowColor = "#80c0ff";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.02, size * 0.015, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.05, y - size * 0.54 + gallop * 0.04, size * 0.02, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.045, y - size * 0.545 + gallop * 0.04, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.055, y - size * 0.545 + gallop * 0.04, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Determined eyebrows
  ctx.strokeStyle = "#9a7820";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();

  // Noble expression
  ctx.strokeStyle = "#b08060";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.47 + gallop * 0.04, size * 0.035, 0.15, Math.PI - 0.15);
  ctx.stroke();

  // === ORNATE EPIC BOW === (drawn last so it appears ON TOP)
  ctx.save();
  ctx.translate(x - size * 0.22, y - size * 0.15 + gallop * 0.06);
  ctx.rotate(-0.3 + (isAttacking ? -bowDraw * 0.15 : 0));

  // Bow flexes during draw
  const bowBend = isAttacking ? 0.58 + bowDraw * 0.18 : 0.58;

  // Bow outer layer (dark wood)
  ctx.strokeStyle = "#4a2a10";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, Math.PI - bowBend * Math.PI, Math.PI + bowBend * Math.PI);
  ctx.stroke();

  // Bow main layer (rich wood)
  const bowGrad = ctx.createLinearGradient(-size * 0.28, 0, size * 0.1, 0);
  bowGrad.addColorStop(0, "#5a3a1a");
  bowGrad.addColorStop(0.3, "#7a5a3a");
  bowGrad.addColorStop(0.7, "#6b4a2a");
  bowGrad.addColorStop(1, "#5a3a1a");
  ctx.strokeStyle = bowGrad;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.26, Math.PI - bowBend * Math.PI, Math.PI + bowBend * Math.PI);
  ctx.stroke();

  // Gold inlay patterns
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.26, Math.PI * 0.45, Math.PI * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.26, Math.PI * 1.45, Math.PI * 1.55);
  ctx.stroke();

  // Bow tip decorations
  const topTipX = Math.cos(Math.PI - bowBend * Math.PI) * size * 0.28;
  const topTipY = Math.sin(Math.PI - bowBend * Math.PI) * size * 0.28;
  const botTipX = Math.cos(Math.PI + bowBend * Math.PI) * size * 0.28;
  const botTipY = Math.sin(Math.PI + bowBend * Math.PI) * size * 0.28;

  // Gold tip caps
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(topTipX, topTipY, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(botTipX, botTipY, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Center grip
  ctx.fillStyle = "#3a2010";
  ctx.fillRect(-size * 0.24, -size * 0.035, size * 0.07, size * 0.07);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size * 0.24, -size * 0.035, size * 0.07, size * 0.07);
  ctx.fillStyle = "#ff4400";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(-size * 0.205, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bowstring
  const stringPull = -size * (0.16 + (isAttacking ? bowDraw * 0.15 : 0));
  if (isAttacking) {
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 6 * zoom * bowDraw;
  }
  ctx.strokeStyle = isAttacking ? "#fff8dc" : "#f8f8dc";
  ctx.lineWidth = (isAttacking ? 2.5 : 2) * zoom;
  ctx.beginPath();
  ctx.moveTo(topTipX, topTipY);
  ctx.lineTo(stringPull, 0);
  ctx.lineTo(botTipX, botTipY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Arrow nocked
  if (!isAttacking || attackPhase < 0.5) {
    const arrowOffset = isAttacking ? bowDraw * size * 0.1 : 0;
    const shaftGrad = ctx.createLinearGradient(stringPull - size * 0.4, 0, stringPull, 0);
    shaftGrad.addColorStop(0, "#3a2010");
    shaftGrad.addColorStop(0.5, "#5a4020");
    shaftGrad.addColorStop(1, "#3a2010");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(stringPull + arrowOffset * 0.5 - size * 0.4, -size * 0.015, size * 0.4, size * 0.03);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(stringPull + arrowOffset * 0.5 - size * 0.18, -size * 0.018, size * 0.02, size * 0.036);
    ctx.fillRect(stringPull + arrowOffset * 0.5 - size * 0.3, -size * 0.018, size * 0.02, size * 0.036);
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(stringPull + arrowOffset * 0.3 + size * 0.015, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.5 + size * 0.06, -size * 0.035);
    ctx.lineTo(stringPull + arrowOffset * 0.3 - size * 0.03, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.5 + size * 0.06, size * 0.035);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff8030";
    ctx.beginPath();
    ctx.moveTo(stringPull + arrowOffset * 0.3 + size * 0.008, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.4 + size * 0.04, -size * 0.02);
    ctx.lineTo(stringPull + arrowOffset * 0.3 - size * 0.015, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.4 + size * 0.04, size * 0.02);
    ctx.closePath();
    ctx.fill();
    if (isAttacking) {
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 8 * zoom * bowDraw;
    }
    const headGrad = ctx.createLinearGradient(stringPull - size * 0.45, -size * 0.035, stringPull - size * 0.45, size * 0.035);
    headGrad.addColorStop(0, "#c0c0c0");
    headGrad.addColorStop(0.5, isAttacking ? "#ffffff" : "#e8e8e8");
    headGrad.addColorStop(1, "#a0a0a0");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(stringPull - size * 0.42, 0);
    ctx.lineTo(stringPull - size * 0.34, -size * 0.035);
    ctx.lineTo(stringPull - size * 0.36, 0);
    ctx.lineTo(stringPull - size * 0.34, size * 0.035);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(stringPull - size * 0.4, 0);
    ctx.lineTo(stringPull - size * 0.36, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
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

function drawDefaultTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Default falls back to knight
  drawKnightTroop(ctx, x, y, size, color, time, zoom, attackPhase);
}

function drawKnightTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  ownerType?: TroopOwnerType
) {
  // Get theme based on owner type
  const theme = getKnightTheme(ownerType);
  
  // DARK CHAMPION - Elite Knight with Soul-Forged Greatsword
  const stance = Math.sin(time * 3) * 1;
  const breathe = Math.sin(time * 2) * 0.4;
  const capeWave = Math.sin(time * 4);

  // Attack animation - devastating overhead swing
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.2) * 2.2
    : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.25 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // === DARK FLAME AURA (always present) ===
  const auraIntensity = isAttacking ? 0.6 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;

  // Fiery aura gradient - THEMED
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.1,
    size * 0.1,
    x,
    y + size * 0.1,
    size * 0.8
  );
  auraGrad.addColorStop(
    0,
    `${theme.auraColorInner}${auraIntensity * auraPulse * 0.5})`
  );
  auraGrad.addColorStop(
    0.4,
    `${theme.auraColorMid}${auraIntensity * auraPulse * 0.3})`
  );
  auraGrad.addColorStop(1, theme.auraColorOuter);
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.7, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flame wisps - THEMED
  for (let w = 0; w < 3; w++) {
    const wPhase = (time * 3 + w * 1.2) % 2;
    const wAlpha = wPhase < 1 ? (1 - wPhase) * 0.4 : 0;
    const wAngle = (w / 3) * Math.PI - Math.PI * 0.5;
    const wX = x + Math.cos(wAngle) * size * 0.4;
    const wY = y + size * 0.2 - wPhase * size * 0.3;
    ctx.fillStyle = `${theme.flameWisps}${wAlpha})`;
    ctx.beginPath();
    ctx.ellipse(wX, wY, 3 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === DARK ENERGY RINGS (during attack) - THEMED ===
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `${theme.energyRings}${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        size * (0.55 + ringPhase * 0.35),
        size * (0.65 + ringPhase * 0.35),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.45, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === FLOWING BATTLE CAPE - THEMED ===
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y - size * 0.2,
    x + size * 0.1,
    y + size * 0.5
  );
  capeGrad.addColorStop(0, theme.capeLight);
  capeGrad.addColorStop(0.5, theme.capeMid);
  capeGrad.addColorStop(1, theme.capeDark);
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.3 + capeWave * 4,
    y + size * 0.2,
    x - size * 0.25 + capeWave * 6,
    y + size * 0.5
  );
  ctx.lineTo(x + size * 0.12 + capeWave * 3, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.08 + capeWave * 1.5,
    y + size * 0.12,
    x + size * 0.14,
    y - size * 0.12 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape inner shadow with pattern - THEMED
  ctx.fillStyle = theme.capeInner;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.18 + capeWave * 2.5,
    y + size * 0.12,
    x - size * 0.12 + capeWave * 4,
    y + size * 0.38
  );
  ctx.lineTo(x + capeWave * 1.5, y + size * 0.35);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.08,
    x + size * 0.06,
    y - size * 0.08 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // === ARMORED LEGS ===
  // Dark steel greaves
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.08, y + size * 0.32);
    ctx.rotate(side * (-0.08 + stance * 0.02));

    // Upper leg armor
    const legGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
    legGrad.addColorStop(0, "#4a4a5a");
    legGrad.addColorStop(0.3, "#7a7a8a");
    legGrad.addColorStop(0.7, "#8a8a9a");
    legGrad.addColorStop(1, "#5a5a6a");
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.065, 0, size * 0.13, size * 0.24);

    // Knee guard with spike
    ctx.fillStyle = "#9a9aaa";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.08, size * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a6a7a";
    ctx.beginPath();
    ctx.moveTo(0, size * 0.06);
    ctx.lineTo(-size * 0.02, size * 0.02);
    ctx.lineTo(size * 0.02, size * 0.02);
    ctx.closePath();
    ctx.fill();

    // Armored boot
    ctx.fillStyle = "#3a3a4a";
    ctx.fillRect(-size * 0.075, size * 0.2, size * 0.15, size * 0.09);
    ctx.fillStyle = "#5a5a6a";
    ctx.fillRect(-size * 0.08, size * 0.27, size * 0.16, size * 0.04);
    ctx.restore();
  }

  // === DARK PLATE ARMOR ===
  // Back plate
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.35 + breathe);
  ctx.lineTo(x - size * 0.26, y - size * 0.12 + breathe * 0.5);
  ctx.lineTo(x + size * 0.26, y - size * 0.12 + breathe * 0.5);
  ctx.lineTo(x + size * 0.24, y + size * 0.35 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.1,
    x + size * 0.22,
    y + size * 0.2
  );
  plateGrad.addColorStop(0, "#5a5a6a");
  plateGrad.addColorStop(0.2, "#8a8a9a");
  plateGrad.addColorStop(0.5, "#aaaabb");
  plateGrad.addColorStop(0.8, "#8a8a9a");
  plateGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.24 + breathe * 0.3,
    x + size * 0.24,
    y - size * 0.14 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate battle damage/details
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + breathe * 0.7, size * 0.14, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Dark sigil on chest
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.05 + breathe);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.08, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Glowing center - THEMED
  const sigilGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackIntensity * 0.4;
  ctx.fillStyle = `${theme.sigilGlow}${sigilGlow})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Battle belt
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(
    x - size * 0.2,
    y + size * 0.28 + breathe,
    size * 0.4,
    size * 0.07
  );
  // Belt skull buckle - THEMED
  ctx.fillStyle = theme.beltBuckle;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.315 + breathe, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.012,
    y + size * 0.31 + breathe,
    size * 0.008,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.012,
    y + size * 0.31 + breathe,
    size * 0.008,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === MASSIVE PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.28;
    const pauldronY = y - size * 0.08 + breathe * 0.5;

    // Main pauldron
    ctx.fillStyle = "#7a7a8a";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY,
      size * 0.12,
      size * 0.09,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Pauldron spike
    ctx.fillStyle = "#5a5a6a";
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.08, pauldronY - size * 0.06);
    ctx.lineTo(pauldronX + side * size * 0.18, pauldronY - size * 0.02);
    ctx.lineTo(pauldronX + side * size * 0.1, pauldronY + size * 0.02);
    ctx.closePath();
    ctx.fill();

    // Pauldron trim
    ctx.fillStyle = "#9a9aaa";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY + size * 0.02,
      size * 0.1,
      size * 0.04,
      side * 0.3,
      0,
      Math.PI
    );
    ctx.fill();
  }

  // === ARMS ===
  // Left arm
  ctx.fillStyle = "#5a5a6a";
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.02 + breathe * 0.5);
  ctx.rotate(-0.25 - (isAttacking ? bodyLean * 0.6 : 0));
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.restore();

  // Right arm (sword arm - swings dramatically)
  ctx.save();
  const armSwing = isAttacking ? -1.2 + attackPhase * 2.8 : 0.2 + stance * 0.03;
  ctx.translate(
    x + size * 0.3,
    y +
      size * 0.02 +
      breathe * 0.5 -
      (isAttacking ? size * 0.12 * swordSwing * 0.3 : 0)
  );
  ctx.rotate(armSwing);
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.restore();

  // === SOUL-FORGED GREATSWORD ===
  ctx.save();
  const swordAngle = isAttacking
    ? -1.4 + attackPhase * 3.2
    : -0.35 + stance * 0.04;
  const swordX = x + size * 0.4 + (isAttacking ? swordSwing * size * 0.22 : 0);
  const swordY =
    y -
    size * 0.08 +
    breathe * 0.5 -
    (isAttacking ? Math.abs(swordSwing) * size * 0.18 : 0);
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);

  // Wrapped handle
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(-size * 0.028, size * 0.1, size * 0.056, size * 0.2);
  ctx.strokeStyle = "#4a3525";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.028, size * 0.12 + i * size * 0.035);
    ctx.lineTo(size * 0.028, size * 0.14 + i * size * 0.035);
    ctx.stroke();
  }

  // Ornate crossguard - THEMED
  ctx.fillStyle = theme.crossguardMain;
  ctx.fillRect(-size * 0.12, size * 0.07, size * 0.24, size * 0.05);
  ctx.fillStyle = theme.crossguardAccent;
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.095, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.12, size * 0.095, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Crossguard gems - THEMED
  ctx.fillStyle = `${theme.gemColor}${0.7 + attackIntensity * 0.3})`;
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.095, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.12, size * 0.095, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Massive blade with dark runes - THEMED shadow
  if (isAttacking) {
    ctx.shadowColor = theme.eyeShadow;
    ctx.shadowBlur = (15 + attackIntensity * 10) * zoom;
  }
  const bladeGrad = ctx.createLinearGradient(-size * 0.05, 0, size * 0.05, 0);
  bladeGrad.addColorStop(0, "#808090");
  bladeGrad.addColorStop(0.15, "#c0c0d0");
  bladeGrad.addColorStop(0.5, "#e8e8f0");
  bladeGrad.addColorStop(0.85, "#c0c0d0");
  bladeGrad.addColorStop(1, "#707080");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.07);
  ctx.lineTo(-size * 0.055, -size * 0.55);
  ctx.lineTo(0, -size * 0.65);
  ctx.lineTo(size * 0.055, -size * 0.55);
  ctx.lineTo(size * 0.05, size * 0.07);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Blade runes (glow during attack) - THEMED
  const runeGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackIntensity * 0.5;
  ctx.fillStyle = `${theme.bladeRunes}${runeGlow})`;
  for (let i = 0; i < 4; i++) {
    const runeY = -size * 0.1 - i * size * 0.12;
    ctx.fillRect(-size * 0.015, runeY, size * 0.03, size * 0.06);
  }

  // Blade edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.lineTo(0, -size * 0.62);
  ctx.stroke();

  // Devastating swing trail - THEMED
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const trailAlpha = Math.sin(((attackPhase - 0.15) / 0.7) * Math.PI) * 0.7;
    ctx.strokeStyle = `${theme.swingTrail}${trailAlpha})`;
    ctx.lineWidth = 5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.45, size * 0.25, -size * 0.1);
    ctx.stroke();

    // Secondary trail - THEMED
    ctx.strokeStyle = `${theme.swingTrailAlt}${trailAlpha * 0.5})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.5, size * 0.3, -size * 0.15);
    ctx.stroke();
  }

  ctx.restore();

  // === SHIELD (on back) ===
  ctx.save();
  ctx.translate(x - size * 0.35, y + size * 0.05 + breathe);
  ctx.rotate(-0.45);
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.1, -size * 0.12);
  ctx.lineTo(-size * 0.08, size * 0.14);
  ctx.lineTo(0, size * 0.18);
  ctx.lineTo(size * 0.08, size * 0.14);
  ctx.lineTo(size * 0.1, -size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Shield emblem - THEMED
  ctx.fillStyle = theme.shieldEmblem;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.14);
  ctx.lineTo(-size * 0.06, -size * 0.06);
  ctx.lineTo(-size * 0.04, size * 0.1);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.04, size * 0.1);
  ctx.lineTo(size * 0.06, -size * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === GREAT HELM ===
  // Neck guard
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(
    x - size * 0.09,
    y - size * 0.24 + breathe * 0.3,
    size * 0.18,
    size * 0.14
  );

  // Great helm base
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.05,
    y - size * 0.42,
    0,
    x,
    y - size * 0.38,
    size * 0.2
  );
  helmGrad.addColorStop(0, "#9a9aaa");
  helmGrad.addColorStop(0.5, "#7a7a8a");
  helmGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + breathe * 0.2, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Face plate
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.44 + breathe * 0.2);
  ctx.lineTo(x - size * 0.16, y - size * 0.32 + breathe * 0.2);
  ctx.lineTo(x, y - size * 0.26 + breathe * 0.2);
  ctx.lineTo(x + size * 0.16, y - size * 0.32 + breathe * 0.2);
  ctx.lineTo(x + size * 0.14, y - size * 0.44 + breathe * 0.2);
  ctx.closePath();
  ctx.fill();

  // Visor with breathing holes
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(
    x - size * 0.12,
    y - size * 0.42 + breathe * 0.2,
    size * 0.24,
    size * 0.05
  );
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.06 + i * size * 0.06,
      y - size * 0.35 + breathe * 0.2,
      size * 0.015,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Glowing eyes - THEMED
  const eyeGlow = 0.6 + Math.sin(time * 3) * 0.3 + attackIntensity * 0.4;
  ctx.fillStyle = `${theme.eyeGlow}${eyeGlow})`;
  ctx.shadowColor = theme.eyeShadow;
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.05,
    y - size * 0.4 + breathe * 0.2,
    size * 0.018,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.05,
    y - size * 0.4 + breathe * 0.2,
    size * 0.018,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dramatic plume - THEMED
  ctx.fillStyle = theme.plume;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.56 + breathe * 0.2);
  const crestWave =
    Math.sin(time * 5) * 1.5 + (isAttacking ? swordSwing * 1.2 : 0);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const cx = x + (t - 0.5) * size * 0.25 + crestWave * 2.5 * (1 - t);
    const cy =
      y -
      size * 0.56 -
      t * size * 0.28 -
      Math.sin(t * Math.PI) * size * 0.1 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  for (let i = 6; i >= 0; i--) {
    const t = i / 6;
    const cx = x + (t - 0.5) * size * 0.25 + crestWave * 2.5 * (1 - t);
    const cy =
      y -
      size * 0.56 -
      t * size * 0.24 -
      Math.sin(t * Math.PI) * size * 0.06 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  ctx.closePath();
  ctx.fill();

  // Battle cry shockwave during attack - THEMED
  if (isAttacking && attackPhase > 0.25 && attackPhase < 0.65) {
    const cryAlpha = Math.sin(((attackPhase - 0.25) / 0.4) * Math.PI) * 0.5;
    ctx.strokeStyle = `${theme.shockwave}${cryAlpha})`;
    ctx.lineWidth = 2.5 * zoom;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(x, y - size * 0.38, size * (0.2 + r * 0.12), -0.9, 0.9);
      ctx.stroke();
    }
  }

  ctx.restore();
}
// ============================================================================
// TURRET TROOP - Engineer's Heavy Machine Gun Emplacement
// ============================================================================
function drawTurretTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y2: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  // ENGINEER'S HEAVY MACHINE GUN - Belt-fed rapid fire emplacement
  const y = y2 + 12;

  // Scale up the turret
  const scale = 1.5;
  const s = size * scale;

  // Calculate rotation toward target with smooth tracking
  let rotation = 0;
  let targetDistance = 0;
  if (targetPos) {
    rotation = Math.atan2(targetPos.y - y, targetPos.x - x);
    targetDistance = Math.sqrt(
      Math.pow(targetPos.x - x, 2) + Math.pow(targetPos.y - y, 2)
    );
  } else {
    // Idle scanning - sweeping motion
    rotation = Math.sin(time * 0.8) * 1.2 + Math.sin(time * 0.3) * 0.5;
  }

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // RAPID FIRE timing - machine gun fires in bursts
  const isAttacking = attackPhase > 0;
  const fireRate = 18; // Rapid fire rate
  const burstPhase = (time * fireRate) % 1;
  const inBurst = isAttacking && burstPhase < 0.6;

  // Rapid recoil oscillation during firing
  let recoilOffset = 0;
  let turretShake = 0;
  let heatGlow = 0;
  let barrelVibration = 0;

  if (isAttacking) {
    // Continuous rapid recoil
    const rapidCycle = time * fireRate * Math.PI * 2;
    recoilOffset = Math.sin(rapidCycle) * 3.5 * zoom;
    turretShake = Math.sin(rapidCycle * 1.5) * 2.5 * zoom;
    barrelVibration = Math.sin(rapidCycle * 2) * 1.5 * zoom;

    // Heat builds up over time
    heatGlow = Math.min(1, attackPhase * 1.5 + Math.sin(time * 8) * 0.15);
  }

  // Pitch calculation for aiming
  const towerElevation = s * 0.3;
  const barrelBaseLength = s * 0.55;
  let pitch = Math.atan2(towerElevation, barrelBaseLength * 2);
  // Adjust pitch based on target distance
  if (targetPos && targetDistance > 0) {
    pitch = Math.max(0.05, Math.min(0.4, 50 / targetDistance));
  }
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);

  // Apply shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;

  ctx.save();

  // ========== TRIPOD BASE ==========
  const baseY = y + s * 0.15;

  // Draw three tripod legs
  for (let i = 0; i < 3; i++) {
    const legAngle = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const legLength = s * 0.45;
    const legEndX = x + Math.cos(legAngle) * legLength;
    const legEndY = baseY + Math.sin(legAngle) * legLength * 0.4 + s * 0.25;

    // Leg shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(legEndX, legEndY + s * 0.02, s * 0.06, s * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main leg strut
    const legGrad = ctx.createLinearGradient(x, baseY, legEndX, legEndY);
    legGrad.addColorStop(0, "#3d3d4a");
    legGrad.addColorStop(0.5, "#4a4a5a");
    legGrad.addColorStop(1, "#2d2d3a");
    ctx.strokeStyle = legGrad;
    ctx.lineWidth = s * 0.055;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(legEndX, legEndY);
    ctx.stroke();

    // Leg joint at base
    ctx.fillStyle = "#4a4a58";
    ctx.beginPath();
    ctx.arc(x, baseY, s * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Foot pad with grip teeth
    ctx.fillStyle = "#2a2a35";
    ctx.beginPath();
    ctx.ellipse(legEndX, legEndY, s * 0.055, s * 0.025, legAngle * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Foot grip spikes
    ctx.fillStyle = "#5a5a68";
    for (let spike = 0; spike < 3; spike++) {
      const spikeAngle = legAngle + (spike - 1) * 0.4;
      ctx.beginPath();
      ctx.arc(
        legEndX + Math.cos(spikeAngle) * s * 0.04,
        legEndY + Math.sin(spikeAngle) * s * 0.015,
        s * 0.012,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Hydraulic strut
    const midX = (x + legEndX) / 2;
    const midY = (baseY + legEndY) / 2 - s * 0.03;
    ctx.strokeStyle = "#5a5a68";
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(legAngle) * s * 0.1, baseY + Math.sin(legAngle) * s * 0.04);
    ctx.lineTo(midX + Math.cos(legAngle + Math.PI / 2) * s * 0.04, midY);
    ctx.stroke();

    // Piston detail
    ctx.fillStyle = "#c0c0cc";
    ctx.beginPath();
    ctx.ellipse(midX, midY, s * 0.02, s * 0.012, legAngle, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== CENTRAL PIVOT MOUNT ==========
  const pivotY = baseY - s * 0.12;

  // Pivot base plate
  ctx.fillStyle = "#3a3a48";
  ctx.beginPath();
  ctx.ellipse(x, pivotY + s * 0.08, s * 0.18, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rotation bearing ring
  const bearingGrad = ctx.createLinearGradient(
    x - s * 0.15,
    pivotY,
    x + s * 0.15,
    pivotY
  );
  bearingGrad.addColorStop(0, "#2a2a35");
  bearingGrad.addColorStop(0.3, "#4a4a58");
  bearingGrad.addColorStop(0.7, "#4a4a58");
  bearingGrad.addColorStop(1, "#2a2a35");
  ctx.fillStyle = bearingGrad;
  ctx.beginPath();
  ctx.ellipse(x, pivotY + s * 0.04, s * 0.14, s * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bearing ball details
  ctx.fillStyle = "#5a5a68";
  for (let i = 0; i < 12; i++) {
    const ballAngle = rotation + (i / 12) * Math.PI * 2;
    const ballX = x + Math.cos(ballAngle) * s * 0.12;
    const ballY = pivotY + s * 0.04 + Math.sin(ballAngle) * s * 0.035;
    ctx.beginPath();
    ctx.arc(ballX, ballY, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== HEAVY AMMO BOX ==========
  const ammoBoxX = x - sinR * s * 0.28;
  const ammoBoxY = pivotY - s * 0.1 + cosR * s * 0.08;

  // Ammo box body - military green with wear
  const ammoBoxGrad = ctx.createLinearGradient(
    ammoBoxX - s * 0.15,
    ammoBoxY - s * 0.12,
    ammoBoxX + s * 0.15,
    ammoBoxY + s * 0.12
  );
  ammoBoxGrad.addColorStop(0, "#2d3d2a");
  ammoBoxGrad.addColorStop(0.3, "#3d4d3a");
  ammoBoxGrad.addColorStop(0.7, "#354535");
  ammoBoxGrad.addColorStop(1, "#253025");
  ctx.fillStyle = ammoBoxGrad;

  // Box shape (isometric)
  ctx.beginPath();
  ctx.moveTo(ammoBoxX - s * 0.14, ammoBoxY + s * 0.1);
  ctx.lineTo(ammoBoxX - s * 0.14, ammoBoxY - s * 0.08);
  ctx.lineTo(ammoBoxX - s * 0.06, ammoBoxY - s * 0.14);
  ctx.lineTo(ammoBoxX + s * 0.14, ammoBoxY - s * 0.14);
  ctx.lineTo(ammoBoxX + s * 0.14, ammoBoxY + s * 0.04);
  ctx.lineTo(ammoBoxX + s * 0.06, ammoBoxY + s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Box top face
  ctx.fillStyle = "#4a5a48";
  ctx.beginPath();
  ctx.moveTo(ammoBoxX - s * 0.06, ammoBoxY - s * 0.14);
  ctx.lineTo(ammoBoxX + s * 0.14, ammoBoxY - s * 0.14);
  ctx.lineTo(ammoBoxX + s * 0.06, ammoBoxY - s * 0.2);
  ctx.lineTo(ammoBoxX - s * 0.14, ammoBoxY - s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Ammo box lid latch
  ctx.fillStyle = "#6a6a78";
  ctx.beginPath();
  ctx.roundRect(ammoBoxX - s * 0.02, ammoBoxY - s * 0.19, s * 0.06, s * 0.03, s * 0.005);
  ctx.fill();

  // Warning stripes on ammo box
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.moveTo(ammoBoxX - s * 0.12, ammoBoxY + s * 0.06);
  ctx.lineTo(ammoBoxX - s * 0.12, ammoBoxY + s * 0.02);
  ctx.lineTo(ammoBoxX + s * 0.08, ammoBoxY + s * 0.02);
  ctx.lineTo(ammoBoxX + s * 0.08, ammoBoxY + s * 0.06);
  ctx.closePath();
  ctx.fill();

  // Diagonal warning stripes
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = s * 0.01;
  for (let stripe = 0; stripe < 4; stripe++) {
    const stripeX = ammoBoxX - s * 0.1 + stripe * s * 0.05;
    ctx.beginPath();
    ctx.moveTo(stripeX, ammoBoxY + s * 0.06);
    ctx.lineTo(stripeX + s * 0.04, ammoBoxY + s * 0.02);
    ctx.stroke();
  }

  // Carrying handle
  ctx.strokeStyle = "#4a4a58";
  ctx.lineWidth = s * 0.02;
  ctx.beginPath();
  ctx.moveTo(ammoBoxX - s * 0.08, ammoBoxY - s * 0.2);
  ctx.quadraticCurveTo(ammoBoxX, ammoBoxY - s * 0.28, ammoBoxX + s * 0.02, ammoBoxY - s * 0.2);
  ctx.stroke();

  // ========== AMMO BELT FEEDING ==========
  const beltStartX = ammoBoxX + s * 0.08;
  const beltStartY = ammoBoxY - s * 0.12;
  const beltFeedX = x + shakeX + cosR * s * 0.08;
  const beltFeedY = pivotY - s * 0.15 + shakeY;

  // Animated belt feed
  const beltWave = isAttacking ? time * 25 : time * 2;

  // Draw belt links
  const beltSegments = 8;
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = s * 0.025;

  for (let i = 0; i < beltSegments; i++) {
    const t = i / (beltSegments - 1);
    const nextT = (i + 1) / (beltSegments - 1);

    // Curved path with feeding motion
    const wave = Math.sin(beltWave + i * 0.8) * s * 0.015;

    const linkX = beltStartX + (beltFeedX - beltStartX) * t;
    const linkY =
      beltStartY +
      (beltFeedY - beltStartY) * t -
      Math.sin(t * Math.PI) * s * 0.08 +
      wave;

    if (i < beltSegments - 1) {
      const nextLinkX = beltStartX + (beltFeedX - beltStartX) * nextT;
      const nextLinkY =
        beltStartY +
        (beltFeedY - beltStartY) * nextT -
        Math.sin(nextT * Math.PI) * s * 0.08 +
        Math.sin(beltWave + (i + 1) * 0.8) * s * 0.015;

      // Belt link
      ctx.strokeStyle = "#6d5d4d";
      ctx.lineWidth = s * 0.018;
      ctx.beginPath();
      ctx.moveTo(linkX, linkY);
      ctx.lineTo(nextLinkX, nextLinkY);
      ctx.stroke();
    }

    // Bullet in belt
    const bulletAngle = Math.atan2(beltFeedY - beltStartY, beltFeedX - beltStartX);

    // Brass casing
    ctx.fillStyle = "#d4a520";
    ctx.beginPath();
    ctx.ellipse(linkX, linkY, s * 0.022, s * 0.01, bulletAngle, 0, Math.PI * 2);
    ctx.fill();

    // Bullet tip
    ctx.fillStyle = "#c0a080";
    const tipX = linkX + Math.cos(bulletAngle) * s * 0.015;
    const tipY = linkY + Math.sin(bulletAngle) * s * 0.006;
    ctx.beginPath();
    ctx.ellipse(tipX, tipY, s * 0.012, s * 0.007, bulletAngle, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== GUN RECEIVER/BODY (ROTATES WITH TARGET) ==========
  // Pivot point for the gun
  const gunPivotX = x + shakeX;
  const gunPivotY = pivotY - s * 0.12 + shakeY;

  // Draw rotated receiver body
  const receiverGrad = ctx.createLinearGradient(
    gunPivotX - s * 0.2 * cosR,
    gunPivotY - s * 0.2 * sinR * 0.5,
    gunPivotX + s * 0.2 * cosR,
    gunPivotY + s * 0.2 * sinR * 0.5
  );
  receiverGrad.addColorStop(0, "#2d2d3a");
  receiverGrad.addColorStop(0.2, "#4a4a58");
  receiverGrad.addColorStop(0.5, "#5a5a68");
  receiverGrad.addColorStop(0.8, "#4a4a58");
  receiverGrad.addColorStop(1, "#3a3a48");
  ctx.fillStyle = receiverGrad;

  // Receiver shape - rotated quadrilateral following gun direction
  const recvBack = s * 0.08;
  const recvFront = s * 0.12;
  const recvWidth = s * 0.06;
  ctx.beginPath();
  // Back corners
  ctx.moveTo(
    gunPivotX - cosR * recvBack + sinR * recvWidth,
    gunPivotY - sinR * recvBack * 0.5 - cosR * recvWidth * 0.3
  );
  ctx.lineTo(
    gunPivotX - cosR * recvBack - sinR * recvWidth,
    gunPivotY - sinR * recvBack * 0.5 + cosR * recvWidth * 0.3
  );
  // Front corners
  ctx.lineTo(
    gunPivotX + cosR * recvFront - sinR * recvWidth * 0.8,
    gunPivotY + sinR * recvFront * 0.5 + cosR * recvWidth * 0.24
  );
  ctx.lineTo(
    gunPivotX + cosR * recvFront + sinR * recvWidth * 0.8,
    gunPivotY + sinR * recvFront * 0.5 - cosR * recvWidth * 0.24
  );
  ctx.closePath();
  ctx.fill();

  // Receiver top cover - follows rotation
  ctx.fillStyle = "#5a5a68";
  const topOffset = s * 0.04;
  ctx.beginPath();
  ctx.moveTo(
    gunPivotX - cosR * recvBack * 0.6 + sinR * recvWidth * 1.1,
    gunPivotY - sinR * recvBack * 0.3 - cosR * recvWidth * 0.33 - topOffset * 0.5
  );
  ctx.lineTo(
    gunPivotX + cosR * recvFront * 0.8 + sinR * recvWidth * 1.1,
    gunPivotY + sinR * recvFront * 0.4 - cosR * recvWidth * 0.33 - topOffset * 0.3
  );
  ctx.lineTo(
    gunPivotX + cosR * recvFront * 0.8 + sinR * recvWidth * 0.5,
    gunPivotY + sinR * recvFront * 0.4 - cosR * recvWidth * 0.15 - topOffset * 0.4
  );
  ctx.lineTo(
    gunPivotX - cosR * recvBack * 0.6 + sinR * recvWidth * 0.5,
    gunPivotY - sinR * recvBack * 0.3 - cosR * recvWidth * 0.15 - topOffset * 0.5
  );
  ctx.closePath();
  ctx.fill();

  // Feed tray cover - on top of receiver, follows rotation
  ctx.fillStyle = "#4a4a58";
  const feedTrayX = gunPivotX + sinR * recvWidth * 0.8;
  const feedTrayY = gunPivotY - cosR * recvWidth * 0.24 - topOffset * 0.5;
  ctx.beginPath();
  ctx.ellipse(feedTrayX, feedTrayY, s * 0.06, s * 0.03, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a6a78";
  ctx.beginPath();
  ctx.arc(feedTrayX, feedTrayY, s * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Ejection port - on the side
  ctx.fillStyle = "#1a1a24";
  const ejectX = gunPivotX + cosR * s * 0.04 - sinR * recvWidth * 0.9;
  const ejectY = gunPivotY + sinR * s * 0.02 + cosR * recvWidth * 0.27;
  ctx.beginPath();
  ctx.ellipse(ejectX, ejectY, s * 0.025, s * 0.015, rotation, 0, Math.PI * 2);
  ctx.fill();

  // ========== CHARGING HANDLE ==========
  const handleDist = s * 0.06;
  const handleX = gunPivotX - cosR * handleDist + sinR * recvWidth * 0.6;
  const handleY = gunPivotY - sinR * handleDist * 0.5 - cosR * recvWidth * 0.18;
  ctx.fillStyle = "#3a3a48";
  ctx.beginPath();
  ctx.ellipse(handleX, handleY, s * 0.03, s * 0.015, rotation - Math.PI/2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a5a68";
  ctx.beginPath();
  ctx.arc(handleX, handleY, s * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // ========== HEAVY BARREL WITH COOLING JACKET ==========
  const barrelStartX = gunPivotX + cosR * s * 0.1 - cosR * recoilOffset;
  const barrelStartY = gunPivotY + sinR * s * 0.05 - sinR * recoilOffset * 0.5;
  const barrelLength = s * 0.55;

  // Calculate barrel end - pointing directly at target
  const barrelEndX = barrelStartX + cosR * barrelLength + barrelVibration * cosR;
  const barrelEndY = barrelStartY + sinR * barrelLength * 0.5 + barrelVibration * sinR * 0.5;

  const barrelPerpX = -sinR * s * 0.045;
  const barrelPerpY = cosR * s * 0.045 * 0.5;

  // Barrel shroud/heat shield
  const shroudGrad = ctx.createLinearGradient(
    barrelStartX,
    barrelStartY - s * 0.06,
    barrelStartX,
    barrelStartY + s * 0.06
  );
  shroudGrad.addColorStop(0, "#5a5a68");
  shroudGrad.addColorStop(0.3, "#4a4a58");
  shroudGrad.addColorStop(0.7, "#3a3a48");
  shroudGrad.addColorStop(1, "#2a2a35");

  // Draw cooling jacket with ventilation holes
  const jacketLength = barrelLength * 0.75;
  for (let ring = 0; ring < 8; ring++) {
    const t = ring / 7;
    const ringX = barrelStartX + cosR * jacketLength * t;
    const ringY = barrelStartY + sinR * jacketLength * t * 0.5;

    // Heat coloring based on firing
    const heatColor = heatGlow > 0 ? 
      `rgba(255, ${150 - ring * 10}, ${50 - ring * 5}, ${heatGlow * 0.3 * (1 - t)})` : 
      null;

    // Cooling ring
    ctx.fillStyle = shroudGrad;
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, s * 0.05, s * 0.03, rotation, 0, Math.PI * 2);
    ctx.fill();

    if (heatColor) {
      ctx.fillStyle = heatColor;
      ctx.beginPath();
      ctx.ellipse(ringX, ringY, s * 0.045, s * 0.025, rotation, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ventilation holes
    if (ring > 0 && ring < 7) {
      ctx.fillStyle = "#1a1a24";
      for (let hole = 0; hole < 4; hole++) {
        const holeAngle = rotation + (hole / 4) * Math.PI * 2 + ring * 0.3;
        const holeX = ringX + Math.cos(holeAngle) * s * 0.035;
        const holeY = ringY + Math.sin(holeAngle) * s * 0.02;
        ctx.beginPath();
        ctx.ellipse(holeX, holeY, s * 0.008, s * 0.005, holeAngle, 0, Math.PI * 2);
        ctx.fill();

        // Heat shimmer from holes when firing
        if (heatGlow > 0.3) {
          ctx.fillStyle = `rgba(255, 150, 50, ${heatGlow * 0.15})`;
          ctx.beginPath();
          ctx.ellipse(holeX, holeY - s * 0.02, s * 0.01, s * 0.015, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Inner barrel
  ctx.fillStyle = "#2a2a35";
  ctx.beginPath();
  ctx.moveTo(barrelStartX + barrelPerpX * 0.6, barrelStartY + barrelPerpY * 0.6);
  ctx.lineTo(barrelEndX + barrelPerpX * 0.4, barrelEndY + barrelPerpY * 0.4);
  ctx.lineTo(barrelEndX - barrelPerpX * 0.4, barrelEndY - barrelPerpY * 0.4);
  ctx.lineTo(barrelStartX - barrelPerpX * 0.6, barrelStartY - barrelPerpY * 0.6);
  ctx.closePath();
  ctx.fill();

  // Barrel heat gradient when firing
  if (heatGlow > 0) {
    const heatBarrelGrad = ctx.createLinearGradient(
      barrelStartX,
      barrelStartY,
      barrelEndX,
      barrelEndY
    );
    heatBarrelGrad.addColorStop(0, `rgba(255, 100, 30, ${heatGlow * 0.2})`);
    heatBarrelGrad.addColorStop(0.5, `rgba(255, 150, 50, ${heatGlow * 0.35})`);
    heatBarrelGrad.addColorStop(1, `rgba(255, 200, 100, ${heatGlow * 0.5})`);
    ctx.strokeStyle = heatBarrelGrad;
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(barrelStartX, barrelStartY);
    ctx.lineTo(barrelEndX, barrelEndY);
    ctx.stroke();
  }

  // ========== FLASH HIDER / MUZZLE BRAKE ==========
  const muzzleX = barrelEndX;
  const muzzleY = barrelEndY;

  // Flash hider prongs
  ctx.fillStyle = "#3a3a48";
  for (let prong = 0; prong < 4; prong++) {
    const prongAngle = rotation + (prong / 4) * Math.PI * 2;
    const prongX = muzzleX + Math.cos(prongAngle) * s * 0.035;
    const prongY = muzzleY + Math.sin(prongAngle) * s * 0.02;
    const prongEndX = prongX + cosR * s * 0.06;
    const prongEndY = prongY + sinR * s * 0.03;

    ctx.beginPath();
    ctx.moveTo(prongX, prongY);
    ctx.lineTo(prongEndX, prongEndY);
    ctx.lineWidth = s * 0.018;
    ctx.strokeStyle = "#4a4a58";
    ctx.stroke();
  }

  // Muzzle bore
  ctx.fillStyle = "#0a0a0f";
  ctx.beginPath();
  ctx.ellipse(
    muzzleX + cosR * s * 0.06,
    muzzleY + sinR * s * 0.03,
    s * 0.022 * foreshorten + s * 0.01,
    s * 0.018,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ========== MUZZLE FLASH - RAPID FIRE ==========
  if (isAttacking && inBurst) {
    const flashIntensity = 0.6 + Math.sin(time * fireRate * Math.PI * 2) * 0.4;
    const flashSize = s * 0.12 * flashIntensity;
    const flashX = muzzleX + cosR * s * 0.1;
    const flashY = muzzleY + sinR * s * 0.05;

    // Multiple flash layers for machine gun effect
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 25 * zoom;

    // Core flash
    const flashGrad = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, flashSize);
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashIntensity})`);
    flashGrad.addColorStop(0.15, `rgba(255, 255, 200, ${flashIntensity * 0.95})`);
    flashGrad.addColorStop(0.3, `rgba(255, 220, 100, ${flashIntensity * 0.8})`);
    flashGrad.addColorStop(0.5, `rgba(255, 150, 50, ${flashIntensity * 0.5})`);
    flashGrad.addColorStop(0.7, `rgba(255, 80, 20, ${flashIntensity * 0.3})`);
    flashGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();

    // Star-burst flash spikes
    ctx.strokeStyle = `rgba(255, 255, 200, ${flashIntensity * 0.8})`;
    ctx.lineWidth = 2 * zoom;
    for (let spike = 0; spike < 6; spike++) {
      const spikeAngle = rotation + (spike / 6) * Math.PI * 2 + time * 15;
      const spikeLen = flashSize * (0.8 + Math.sin(time * 50 + spike) * 0.4);
      ctx.beginPath();
      ctx.moveTo(flashX, flashY);
      ctx.lineTo(
        flashX + Math.cos(spikeAngle) * spikeLen,
        flashY + Math.sin(spikeAngle) * spikeLen * 0.5
      );
      ctx.stroke();
    }

    // Forward flash cone
    ctx.fillStyle = `rgba(255, 200, 100, ${flashIntensity * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(flashX, flashY);
    ctx.lineTo(
      flashX + cosR * flashSize * 2 + sinR * flashSize * 0.5,
      flashY + sinR * flashSize + cosR * flashSize * 0.25
    );
    ctx.lineTo(
      flashX + cosR * flashSize * 2 - sinR * flashSize * 0.5,
      flashY + sinR * flashSize - cosR * flashSize * 0.25
    );
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  // ========== BULLET TRACERS ==========
  if (isAttacking && targetPos) {
    // Draw multiple bullet tracers for machine gun effect
    const numTracers = 4;
    for (let tracer = 0; tracer < numTracers; tracer++) {
      const tracerPhase = ((time * fireRate + tracer * 0.25) % 1);
      const tracerProgress = tracerPhase;

      if (tracerProgress < 0.8) {
        const tracerStartX = muzzleX + cosR * s * 0.08;
        const tracerStartY = muzzleY + sinR * s * 0.04;

        // Tracer travels toward target
        const tracerX = tracerStartX + (targetPos.x - tracerStartX) * tracerProgress;
        const tracerY = tracerStartY + (targetPos.y - tracerStartY) * tracerProgress;

        // Tracer trail length
        const trailLength = s * 0.15;
        const trailX = tracerX - cosR * trailLength;
        const trailY = tracerY - sinR * trailLength * 0.5;

        // Tracer glow
        const tracerAlpha = 1 - tracerProgress * 0.8;
        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 8 * zoom;

        // Tracer trail
        const tracerGrad = ctx.createLinearGradient(trailX, trailY, tracerX, tracerY);
        tracerGrad.addColorStop(0, `rgba(255, 200, 50, 0)`);
        tracerGrad.addColorStop(0.5, `rgba(255, 220, 100, ${tracerAlpha * 0.5})`);
        tracerGrad.addColorStop(1, `rgba(255, 255, 200, ${tracerAlpha})`);
        ctx.strokeStyle = tracerGrad;
        ctx.lineWidth = 3 * zoom;
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(tracerX, tracerY);
        ctx.stroke();

        // Bright tracer head
        ctx.fillStyle = `rgba(255, 255, 220, ${tracerAlpha})`;
        ctx.beginPath();
        ctx.arc(tracerX, tracerY, s * 0.015, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }
  }

  // ========== SHELL CASINGS EJECTING ==========
  if (isAttacking) {
    const casingEjectX = gunPivotX + sinR * s * 0.1;
    const casingEjectY = gunPivotY - cosR * s * 0.02;

    // Multiple casings for rapid fire
    for (let casing = 0; casing < 5; casing++) {
      const casingPhase = ((time * fireRate * 0.8 + casing * 0.2) % 1);

      if (casingPhase < 0.6) {
        // Casing trajectory - arcing eject
        const ejectProgress = casingPhase / 0.6;
        const ejectAngle = -Math.PI * 0.3 + rotation;
        const ejectSpeed = s * 0.4;
        const gravity = s * 0.8;

        const casingX =
          casingEjectX +
          Math.cos(ejectAngle) * ejectSpeed * ejectProgress +
          (Math.sin(time * 50 + casing * 7) * 0.5 - 0.25) * s * 0.02;
        const casingY =
          casingEjectY +
          Math.sin(ejectAngle) * ejectSpeed * ejectProgress * 0.5 +
          gravity * ejectProgress * ejectProgress;

        // Spinning casing
        const spinAngle = time * 30 + casing * 2;

        // Brass casing
        ctx.fillStyle = "#d4a520";
        ctx.beginPath();
        ctx.ellipse(
          casingX,
          casingY,
          s * 0.018,
          s * 0.008,
          spinAngle,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Casing rim
        ctx.fillStyle = "#b8960b";
        ctx.beginPath();
        ctx.arc(
          casingX - Math.cos(spinAngle) * s * 0.012,
          casingY - Math.sin(spinAngle) * s * 0.005,
          s * 0.006,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Hot casing glow
        if (heatGlow > 0.3) {
          ctx.fillStyle = `rgba(255, 200, 100, ${heatGlow * 0.3 * (1 - ejectProgress)})`;
          ctx.beginPath();
          ctx.ellipse(casingX, casingY, s * 0.022, s * 0.012, spinAngle, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // ========== SMOKE EFFECTS ==========
  if (isAttacking) {
    // Barrel smoke
    for (let smoke = 0; smoke < 3; smoke++) {
      const smokePhase = ((time * 2 + smoke * 0.33) % 1);
      const smokeX =
        muzzleX +
        cosR * s * 0.08 +
        (Math.sin(time * 3 + smoke) - 0.5) * s * 0.04;
      const smokeY = muzzleY + sinR * s * 0.04 - smokePhase * s * 0.15;
      const smokeSize = s * 0.03 + smokePhase * s * 0.04;
      const smokeAlpha = (1 - smokePhase) * 0.25 * heatGlow;

      ctx.fillStyle = `rgba(150, 150, 160, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ejection port smoke
    const portSmokeX = gunPivotX + sinR * s * 0.08;
    const portSmokeY = gunPivotY - cosR * s * 0.04 - Math.sin(time * 5) * s * 0.02;
    ctx.fillStyle = `rgba(100, 100, 110, ${heatGlow * 0.2})`;
    ctx.beginPath();
    ctx.arc(portSmokeX, portSmokeY, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== TARGETING OPTICS ==========
  const opticX = gunPivotX - sinR * s * 0.08;
  const opticY = gunPivotY - s * 0.12 + cosR * s * 0.02;

  // Optic housing
  ctx.fillStyle = "#2a2a35";
  ctx.beginPath();
  ctx.ellipse(opticX, opticY, s * 0.05, s * 0.035, rotation * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Optic lens
  const lensGlow = targetPos ? 0.8 + Math.sin(time * 6) * 0.2 : 0.4 + Math.sin(time * 2) * 0.1;
  const lensColor = targetPos ? `rgba(255, 50, 50, ${lensGlow})` : `rgba(50, 200, 255, ${lensGlow})`;
  ctx.fillStyle = lensColor;
  ctx.shadowColor = targetPos ? "#ff3232" : "#00aaff";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(opticX, opticY, s * 0.03, s * 0.02, rotation * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Lens reflection
  ctx.fillStyle = `rgba(255, 255, 255, ${lensGlow * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(opticX - s * 0.01, opticY - s * 0.008, s * 0.01, s * 0.006, 0, 0, Math.PI * 2);
  ctx.fill();

  // ========== TARGETING LASER BEAM ==========
  if (targetPos) {
    const laserStartX = opticX + cosR * s * 0.04;
    const laserStartY = opticY + sinR * s * 0.02;

    // Pulsing laser when locked on
    const laserPulse = 0.5 + Math.sin(time * 12) * 0.3;

    // Laser beam to target
    ctx.strokeStyle = `rgba(255, 0, 0, ${laserPulse * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.moveTo(laserStartX, laserStartY);
    ctx.lineTo(targetPos.x, targetPos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Laser dot on target
    ctx.fillStyle = `rgba(255, 0, 0, ${laserPulse})`;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, s * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Targeting reticle on target
    ctx.strokeStyle = `rgba(255, 50, 50, ${laserPulse * 0.6})`;
    ctx.lineWidth = 1 * zoom;
    const reticleSize = s * 0.08;
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, reticleSize, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(targetPos.x - reticleSize * 1.3, targetPos.y);
    ctx.lineTo(targetPos.x - reticleSize * 0.5, targetPos.y);
    ctx.moveTo(targetPos.x + reticleSize * 0.5, targetPos.y);
    ctx.lineTo(targetPos.x + reticleSize * 1.3, targetPos.y);
    ctx.moveTo(targetPos.x, targetPos.y - reticleSize * 1.3);
    ctx.lineTo(targetPos.x, targetPos.y - reticleSize * 0.5);
    ctx.moveTo(targetPos.x, targetPos.y + reticleSize * 0.5);
    ctx.lineTo(targetPos.x, targetPos.y + reticleSize * 1.3);
    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  // ========== STATUS INDICATORS ==========
  // Ammo counter LED
  const ammoLedX = ammoBoxX + s * 0.1;
  const ammoLedY = ammoBoxY - s * 0.08;
  const ammoGlow = 0.6 + Math.sin(time * 4) * 0.2;
  ctx.fillStyle = `rgba(50, 255, 100, ${ammoGlow})`;
  ctx.shadowColor = "#32ff64";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(ammoLedX, ammoLedY, s * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Heat warning LED (blinks when hot)
  if (heatGlow > 0.5) {
    const heatLedX = gunPivotX + s * 0.12;
    const heatLedY = gunPivotY - s * 0.08;
    const heatBlink = Math.sin(time * 15) > 0 ? 1 : 0.3;
    ctx.fillStyle = `rgba(255, 80, 30, ${heatBlink})`;
    ctx.shadowColor = "#ff5020";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(heatLedX, heatLedY, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Power indicator
  const powerLedX = gunPivotX - s * 0.12;
  const powerLedY = gunPivotY - s * 0.08;
  const powerPulse = isAttacking ? 1 : 0.5 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = isAttacking
    ? `rgba(255, 150, 50, ${powerPulse})`
    : `rgba(50, 200, 255, ${powerPulse})`;
  ctx.shadowColor = isAttacking ? "#ff9632" : "#32c8ff";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(powerLedX, powerLedY, s * 0.01, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ========== ENGINEER EMBLEM ==========
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5 * zoom;
  const emblemX = x;
  const emblemY = pivotY + s * 0.12;
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, s * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating gear teeth
  for (let i = 0; i < 8; i++) {
    const gearAngle = (i / 8) * Math.PI * 2 + time * (isAttacking ? 3 : 0.5);
    ctx.beginPath();
    ctx.moveTo(
      emblemX + Math.cos(gearAngle) * s * 0.035,
      emblemY + Math.sin(gearAngle) * s * 0.035
    );
    ctx.lineTo(
      emblemX + Math.cos(gearAngle) * s * 0.05,
      emblemY + Math.sin(gearAngle) * s * 0.05
    );
    ctx.stroke();
  }

  ctx.restore();
}

