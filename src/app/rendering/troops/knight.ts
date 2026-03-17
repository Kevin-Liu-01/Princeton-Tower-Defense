import type { Position, TroopOwnerType } from "../../types";
import type { MapTheme } from "../../constants/maps";
import { getKnightTheme } from "./knightThemes";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
} from "./troopHelpers";

export function drawKnightTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  ownerType?: TroopOwnerType,
  targetPos?: Position,
  mapTheme?: MapTheme,
) {
  const theme = getKnightTheme(ownerType, mapTheme);

  // DARK CHAMPION - Elite Knight with Soul-Forged Greatsword
  const stance = Math.sin(time * 3) * 1;
  const breathe = Math.sin(time * 2) * 0.4;
  const capeWave = Math.sin(time * 4);

  // Attack animation - devastating overhead swing
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.2) * 2.2
    : 0;
  const bodyLean = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.25
    : Math.sin(time * 1.7) * 0.03;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const armorPeak = "#acb2c6";
  const armorHigh = "#878ea7";
  const armorMid = "#646b81";
  const armorDark = "#41485b";

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
    size * 0.8,
  );
  auraGrad.addColorStop(
    0,
    `${theme.auraColorInner}${auraIntensity * auraPulse * 0.5})`,
  );
  auraGrad.addColorStop(
    0.4,
    `${theme.auraColorMid}${auraIntensity * auraPulse * 0.3})`,
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
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === FLOWING BATTLE CAPE - THEMED ===
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y - size * 0.2,
    x + size * 0.1,
    y + size * 0.5,
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
    y + size * 0.5,
  );
  ctx.lineTo(x + size * 0.12 + capeWave * 3, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.08 + capeWave * 1.5,
    y + size * 0.12,
    x + size * 0.14,
    y - size * 0.12 + breathe,
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
    y + size * 0.38,
  );
  ctx.lineTo(x + capeWave * 1.5, y + size * 0.35);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.08,
    x + size * 0.06,
    y - size * 0.08 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // === ARMORED LEGS ===
  // Dark steel greaves - wide power stance
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.13, y + size * 0.32);
    ctx.rotate(side * (-0.12 + stance * 0.025));

    // Upper leg armor
    const legGrad = ctx.createLinearGradient(-size * 0.065, 0, size * 0.065, 0);
    legGrad.addColorStop(0, armorDark);
    legGrad.addColorStop(0.3, armorMid);
    legGrad.addColorStop(0.55, armorPeak);
    legGrad.addColorStop(1, armorDark);
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.07, 0, size * 0.14, size * 0.22);

    // Thigh plate overlay
    ctx.fillStyle = armorHigh;
    ctx.beginPath();
    ctx.moveTo(-size * 0.06, 0);
    ctx.lineTo(-size * 0.075, size * 0.08);
    ctx.lineTo(-size * 0.06, size * 0.14);
    ctx.lineTo(size * 0.06, size * 0.14);
    ctx.lineTo(size * 0.075, size * 0.08);
    ctx.lineTo(size * 0.06, 0);
    ctx.closePath();
    ctx.fill();

    // Knee guard with spike
    ctx.fillStyle = armorPeak;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.085, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = armorMid;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.055);
    ctx.lineTo(-size * 0.025, size * 0.015);
    ctx.lineTo(size * 0.025, size * 0.015);
    ctx.closePath();
    ctx.fill();

    // Shin guard
    ctx.fillStyle = armorMid;
    ctx.fillRect(-size * 0.06, size * 0.13, size * 0.12, size * 0.1);

    // Armored boot
    ctx.fillStyle = armorDark;
    ctx.fillRect(-size * 0.08, size * 0.2, size * 0.16, size * 0.09);
    ctx.fillStyle = armorHigh;
    ctx.fillRect(-size * 0.085, size * 0.27, size * 0.17, size * 0.04);
    ctx.restore();
  }

  // === DARK PLATE ARMOR ===
  // Back plate
  ctx.fillStyle = armorDark;
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
    y + size * 0.2,
  );
  plateGrad.addColorStop(0, armorMid);
  plateGrad.addColorStop(0.2, armorHigh);
  plateGrad.addColorStop(0.5, armorPeak);
  plateGrad.addColorStop(0.8, armorHigh);
  plateGrad.addColorStop(1, armorMid);
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.24 + breathe * 0.3,
    x + size * 0.24,
    y - size * 0.14 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Armor plate seams
  ctx.strokeStyle = "#3a3a48";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + breathe * 0.7, size * 0.14, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Themed plate edge glow - THEMED
  ctx.strokeStyle = theme.sigilGlow + "0.15)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.24 + breathe * 0.3,
    x + size * 0.24,
    y - size * 0.14 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + breathe);
  ctx.stroke();

  // Dark sigil on chest - hexagonal emblem
  ctx.fillStyle = "#0e0e1a";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.06 + breathe);
  ctx.lineTo(x - size * 0.065, y + size * 0.02 + breathe);
  ctx.lineTo(x - size * 0.08, y + size * 0.1 + breathe);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.08, y + size * 0.1 + breathe);
  ctx.lineTo(x + size * 0.065, y + size * 0.02 + breathe);
  ctx.closePath();
  ctx.fill();
  // Inner sigil shape - THEMED
  ctx.strokeStyle = `${theme.sigilGlow}0.25)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.01 + breathe);
  ctx.lineTo(x - size * 0.04, y + size * 0.06 + breathe);
  ctx.lineTo(x, y + size * 0.12 + breathe);
  ctx.lineTo(x + size * 0.04, y + size * 0.06 + breathe);
  ctx.closePath();
  ctx.stroke();
  // Glowing center - THEMED
  const sigilGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackIntensity * 0.4;
  ctx.fillStyle = `${theme.sigilGlow}${sigilGlow})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.07 + breathe, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Outer sigil glow ring - THEMED
  ctx.strokeStyle = `${theme.sigilGlow}${sigilGlow * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.07 + breathe, size * 0.045, 0, Math.PI * 2);
  ctx.stroke();

  // Battle belt
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(
    x - size * 0.2,
    y + size * 0.28 + breathe,
    size * 0.4,
    size * 0.07,
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
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.012,
    y + size * 0.31 + breathe,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === MASSIVE PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.27;
    const pauldronY = y - size * 0.13 + breathe * 0.4;

    // Pauldron shadow
    ctx.fillStyle = "#2a2a38";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY + size * 0.015,
      size * 0.145,
      size * 0.115,
      side * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Main pauldron dome with gradient
    const pauldGrad = ctx.createRadialGradient(
      pauldronX - side * size * 0.03,
      pauldronY - size * 0.025,
      size * 0.01,
      pauldronX,
      pauldronY,
      size * 0.14,
    );
    pauldGrad.addColorStop(0, armorPeak);
    pauldGrad.addColorStop(0.45, armorHigh);
    pauldGrad.addColorStop(1, armorDark);
    ctx.fillStyle = pauldGrad;
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY,
      size * 0.14,
      size * 0.11,
      side * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Layered plate ridges
    for (let seg = 0; seg < 3; seg++) {
      const segY = pauldronY + size * (0.025 + seg * 0.022);
      ctx.strokeStyle = `rgba(30, 30, 40, ${0.6 - seg * 0.15})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        pauldronX,
        segY,
        size * (0.12 - seg * 0.015),
        size * 0.03,
        side * 0.3,
        0,
        Math.PI,
      );
      ctx.stroke();
    }

    // Pauldron spike
    ctx.fillStyle = armorMid;
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.1, pauldronY - size * 0.07);
    ctx.lineTo(pauldronX + side * size * 0.22, pauldronY - size * 0.02);
    ctx.lineTo(pauldronX + side * size * 0.12, pauldronY + size * 0.03);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = armorPeak;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.11, pauldronY - size * 0.05);
    ctx.lineTo(pauldronX + side * size * 0.2, pauldronY - size * 0.015);
    ctx.stroke();

    // Themed edge trim - THEMED
    ctx.strokeStyle = theme.capeMid;
    ctx.lineWidth = 1.5 * zoom;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY + size * 0.035,
      size * 0.115,
      size * 0.04,
      side * 0.3,
      0,
      Math.PI,
    );
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Rivets
    ctx.fillStyle = armorPeak;
    for (let r = 0; r < 3; r++) {
      const rivetAngle = (r / 2 - 0.5) * 1.4 + side * 0.3;
      const rivetX = pauldronX + Math.cos(rivetAngle) * size * 0.095;
      const rivetY = pauldronY + Math.sin(rivetAngle) * size * 0.075;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, size * 0.011, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === ARMS ===
  // Left arm
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.02 + breathe * 0.5);
  ctx.rotate(-0.25 - (isAttacking ? bodyLean * 0.6 : 0));
  const leftArmGrad = ctx.createLinearGradient(
    -size * 0.055,
    0,
    size * 0.055,
    0,
  );
  leftArmGrad.addColorStop(0, armorDark);
  leftArmGrad.addColorStop(0.45, armorMid);
  leftArmGrad.addColorStop(1, armorHigh);
  ctx.fillStyle = leftArmGrad;
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = armorPeak;
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.restore();

  // === RIGHT ARM + SOUL-FORGED GREATSWORD ===
  // Anchor system: grip locked to hand, hand locked to arm end
  const swordScale = 0.82;
  const knightArmLength = size * 0.22;
  const knightGripLocalY = size * 0.15 * swordScale;

  const knightShoulderX = x + size * 0.18;
  const knightShoulderY = y + size * 0.02 + breathe * 0.5;

  // Arm swing: overhead chop (up-back → forward → down-forward)
  const knightArmSwing = isAttacking
    ? -0.6 + (1 - attackPhase) * 1.4
    : 0.6 + stance * 0.03;

  const knightHandX = knightShoulderX + Math.cos(knightArmSwing) * knightArmLength;
  const knightHandY = knightShoulderY + Math.sin(knightArmSwing) * knightArmLength;

  // Blade orientation
  const swordBaseAngle = isAttacking
    ? -0.55 + attackPhase * 3.2
    : 0.7 + stance * 0.04;
  const swordAngle = resolveWeaponRotation(
    targetPos,
    knightHandX,
    knightHandY,
    swordBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.45 : 0.82,
    WEAPON_LIMITS.rightMelee,
  );

  // Derive sword origin so grip lands exactly on the hand
  const swordX = knightHandX + Math.sin(swordAngle) * knightGripLocalY;
  const swordY = knightHandY - Math.cos(swordAngle) * knightGripLocalY;

  ctx.save();
  ctx.translate(knightShoulderX, knightShoulderY);
  ctx.rotate(knightArmSwing);
  const rightArmGrad = ctx.createLinearGradient(
    -size * 0.055,
    0,
    size * 0.055,
    0,
  );
  rightArmGrad.addColorStop(0, armorDark);
  rightArmGrad.addColorStop(0.45, armorMid);
  rightArmGrad.addColorStop(1, armorHigh);
  ctx.fillStyle = rightArmGrad;
  ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.2, size * 0.08);
  ctx.fillStyle = armorPeak;
  ctx.fillRect(size * 0.12, -size * 0.045, size * 0.1, size * 0.09);
  ctx.fillStyle = armorMid;
  ctx.beginPath();
  ctx.arc(knightArmLength, 0, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sword
  ctx.save();
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);

  // Pommel
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(
    0,
    size * 0.32 * swordScale,
    size * 0.035 * swordScale,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `${theme.gemColor}0.6)`;
  ctx.beginPath();
  ctx.arc(
    0,
    size * 0.32 * swordScale,
    size * 0.015 * swordScale,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wrapped handle
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(
    -size * 0.032 * swordScale,
    size * 0.1 * swordScale,
    size * 0.064 * swordScale,
    size * 0.22 * swordScale,
  );
  ctx.strokeStyle = "#4a3525";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(
      -size * 0.032 * swordScale,
      size * (0.12 + i * 0.033) * swordScale,
    );
    ctx.lineTo(
      size * 0.032 * swordScale,
      size * (0.14 + i * 0.033) * swordScale,
    );
    ctx.stroke();
  }

  // Ornate crossguard - THEMED
  ctx.fillStyle = theme.crossguardMain;
  ctx.beginPath();
  ctx.moveTo(-size * 0.16 * swordScale, size * 0.08 * swordScale);
  ctx.lineTo(-size * 0.18 * swordScale, size * 0.095 * swordScale);
  ctx.lineTo(-size * 0.16 * swordScale, size * 0.115 * swordScale);
  ctx.lineTo(size * 0.16 * swordScale, size * 0.115 * swordScale);
  ctx.lineTo(size * 0.18 * swordScale, size * 0.095 * swordScale);
  ctx.lineTo(size * 0.16 * swordScale, size * 0.08 * swordScale);
  ctx.closePath();
  ctx.fill();
  // Crossguard end caps - THEMED
  ctx.fillStyle = theme.crossguardAccent;
  ctx.beginPath();
  ctx.arc(
    -size * 0.16 * swordScale,
    size * 0.097 * swordScale,
    size * 0.035 * swordScale,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    size * 0.16 * swordScale,
    size * 0.097 * swordScale,
    size * 0.035 * swordScale,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Crossguard gems - THEMED
  ctx.fillStyle = `${theme.gemColor}${0.7 + attackIntensity * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    -size * 0.16 * swordScale,
    size * 0.097 * swordScale,
    size * 0.018 * swordScale,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    size * 0.16 * swordScale,
    size * 0.097 * swordScale,
    size * 0.018 * swordScale,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Massive blade with dark runes - THEMED shadow
  if (isAttacking) {
    ctx.shadowColor = theme.eyeShadow;
    ctx.shadowBlur = (15 + attackIntensity * 10) * zoom;
  }
  const bladeW = size * 0.065 * swordScale;
  const bladeGrad = ctx.createLinearGradient(-bladeW, 0, bladeW, 0);
  bladeGrad.addColorStop(0, "#707080");
  bladeGrad.addColorStop(0.12, "#b0b0c0");
  bladeGrad.addColorStop(0.35, "#d8d8e4");
  bladeGrad.addColorStop(0.5, "#eeeef6");
  bladeGrad.addColorStop(0.65, "#d8d8e4");
  bladeGrad.addColorStop(0.88, "#b0b0c0");
  bladeGrad.addColorStop(1, "#707080");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-bladeW, size * 0.08 * swordScale);
  ctx.lineTo(-bladeW * 1.05, -size * 0.6 * swordScale);
  ctx.lineTo(-bladeW * 0.5, -size * 0.72 * swordScale);
  ctx.lineTo(0, -size * 0.78 * swordScale);
  ctx.lineTo(bladeW * 0.5, -size * 0.72 * swordScale);
  ctx.lineTo(bladeW * 1.05, -size * 0.6 * swordScale);
  ctx.lineTo(bladeW, size * 0.08 * swordScale);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Fuller (central channel)
  ctx.strokeStyle = "rgba(60, 60, 80, 0.5)";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05 * swordScale);
  ctx.lineTo(0, -size * 0.55 * swordScale);
  ctx.stroke();

  // Blade edge highlights
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-bladeW * 0.85, size * 0.06 * swordScale);
  ctx.lineTo(-bladeW * 0.9, -size * 0.58 * swordScale);
  ctx.lineTo(0, -size * 0.76 * swordScale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bladeW * 0.85, size * 0.06 * swordScale);
  ctx.lineTo(bladeW * 0.9, -size * 0.58 * swordScale);
  ctx.lineTo(0, -size * 0.76 * swordScale);
  ctx.stroke();

  // Blade runes (glow during attack) - THEMED
  const runeGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackIntensity * 0.5;
  ctx.fillStyle = `${theme.bladeRunes}${runeGlow})`;
  for (let i = 0; i < 5; i++) {
    const runeY = -size * 0.08 * swordScale - i * size * 0.13 * swordScale;
    ctx.fillRect(
      -size * 0.018 * swordScale,
      runeY,
      size * 0.036 * swordScale,
      size * 0.065 * swordScale,
    );
  }

  // Devastating swing trail - THEMED
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const trailAlpha = Math.sin(((attackPhase - 0.15) / 0.7) * Math.PI) * 0.7;
    ctx.strokeStyle = `${theme.swingTrail}${trailAlpha})`;
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.78 * swordScale);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.55, size * 0.3, -size * 0.1);
    ctx.stroke();

    // Secondary trail - THEMED
    ctx.strokeStyle = `${theme.swingTrailAlt}${trailAlpha * 0.5})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.78 * swordScale);
    ctx.quadraticCurveTo(size * 0.4, -size * 0.6, size * 0.35, -size * 0.15);
    ctx.stroke();
  }

  ctx.restore();

  // === SHIELD (on back) ===
  ctx.save();
  const shieldScale = 1.35;
  ctx.translate(x - size * 0.38, y + size * 0.02 + breathe);
  ctx.rotate(-0.4);

  // Shield shadow
  ctx.fillStyle = "rgba(10, 10, 20, 0.3)";
  ctx.beginPath();
  ctx.moveTo(size * 0.01, -size * 0.24 * shieldScale);
  ctx.lineTo(-size * 0.13 * shieldScale, -size * 0.14 * shieldScale);
  ctx.lineTo(-size * 0.11 * shieldScale, size * 0.17 * shieldScale);
  ctx.lineTo(size * 0.01, size * 0.22 * shieldScale);
  ctx.lineTo(size * 0.11 * shieldScale, size * 0.17 * shieldScale);
  ctx.lineTo(size * 0.13 * shieldScale, -size * 0.14 * shieldScale);
  ctx.closePath();
  ctx.fill();

  // Shield body
  const shieldGrad = ctx.createLinearGradient(
    -size * 0.12 * shieldScale,
    0,
    size * 0.12 * shieldScale,
    0,
  );
  shieldGrad.addColorStop(0, armorDark);
  shieldGrad.addColorStop(0.28, armorMid);
  shieldGrad.addColorStop(0.55, armorPeak);
  shieldGrad.addColorStop(1, armorDark);
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.25 * shieldScale);
  ctx.lineTo(-size * 0.13 * shieldScale, -size * 0.16 * shieldScale);
  ctx.lineTo(-size * 0.11 * shieldScale, size * 0.16 * shieldScale);
  ctx.lineTo(0, size * 0.21 * shieldScale);
  ctx.lineTo(size * 0.11 * shieldScale, size * 0.16 * shieldScale);
  ctx.lineTo(size * 0.13 * shieldScale, -size * 0.16 * shieldScale);
  ctx.closePath();
  ctx.fill();

  // Shield rim
  ctx.strokeStyle = armorPeak;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.25 * shieldScale);
  ctx.lineTo(-size * 0.13 * shieldScale, -size * 0.16 * shieldScale);
  ctx.lineTo(-size * 0.11 * shieldScale, size * 0.16 * shieldScale);
  ctx.lineTo(0, size * 0.21 * shieldScale);
  ctx.lineTo(size * 0.11 * shieldScale, size * 0.16 * shieldScale);
  ctx.lineTo(size * 0.13 * shieldScale, -size * 0.16 * shieldScale);
  ctx.closePath();
  ctx.stroke();

  // Shield cross bars
  ctx.strokeStyle = armorHigh;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.22 * shieldScale);
  ctx.lineTo(0, size * 0.18 * shieldScale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.11 * shieldScale, 0);
  ctx.lineTo(size * 0.11 * shieldScale, 0);
  ctx.stroke();

  // Shield emblem - THEMED
  ctx.fillStyle = theme.shieldEmblem;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.16 * shieldScale);
  ctx.lineTo(-size * 0.075 * shieldScale, -size * 0.06 * shieldScale);
  ctx.lineTo(-size * 0.055 * shieldScale, size * 0.12 * shieldScale);
  ctx.lineTo(0, size * 0.15 * shieldScale);
  ctx.lineTo(size * 0.055 * shieldScale, size * 0.12 * shieldScale);
  ctx.lineTo(size * 0.075 * shieldScale, -size * 0.06 * shieldScale);
  ctx.closePath();
  ctx.fill();

  // Shield emblem inner glow - THEMED
  ctx.fillStyle = `${theme.sigilGlow}0.2)`;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1 * shieldScale);
  ctx.lineTo(-size * 0.04 * shieldScale, 0);
  ctx.lineTo(0, size * 0.08 * shieldScale);
  ctx.lineTo(size * 0.04 * shieldScale, 0);
  ctx.closePath();
  ctx.fill();

  // Shield rivets
  ctx.fillStyle = armorPeak;
  const rivetPositions = [
    [0, -size * 0.22 * shieldScale],
    [-size * 0.1 * shieldScale, -size * 0.12 * shieldScale],
    [size * 0.1 * shieldScale, -size * 0.12 * shieldScale],
    [-size * 0.09 * shieldScale, size * 0.1 * shieldScale],
    [size * 0.09 * shieldScale, size * 0.1 * shieldScale],
    [0, size * 0.18 * shieldScale],
  ];
  for (const [rx, ry] of rivetPositions) {
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.013, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const helmY = y - size * 0.32 + breathe * 0.2;

  // === SWEEPING HORSEHAIR PLUME (rendered behind helmet) - THEMED ===
  {
    const plumeBaseY = helmY - size * 0.18;
    const plumeWind = Math.sin(time * 3.8) * 2.5 + (isAttacking ? swordSwing * 2.0 : 0);
    const plumeWhip = Math.sin(time * 5.2 + 0.5) * 1.4;
    const plumeGust = Math.sin(time * 2.8) * 0.7;

    const crownX = x;
    const crownY = plumeBaseY;
    const sweepLen = size * 0.7;
    const sweepAngle = 1.8 + Math.sin(time * 2.0) * 0.12;
    const tipX = crownX + Math.cos(sweepAngle) * sweepLen + plumeWind * 1.5;
    const tipY = crownY + Math.sin(sweepAngle) * sweepLen * 0.45 + plumeGust * 2;
    const midX = (crownX + tipX) * 0.5 + plumeWind * 0.6;
    const midY = crownY - size * 0.32 + plumeWhip * 0.5;

    // Deep shadow behind plume
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.moveTo(crownX - size * 0.04, crownY + size * 0.02);
    ctx.bezierCurveTo(
      midX + size * 0.04,
      midY + size * 0.04,
      tipX + size * 0.04,
      tipY - size * 0.02,
      tipX + size * 0.06,
      tipY + size * 0.12,
    );
    ctx.bezierCurveTo(
      tipX - size * 0.02,
      tipY + size * 0.06,
      midX - size * 0.02,
      midY + size * 0.12,
      crownX + size * 0.04,
      crownY + size * 0.04,
    );
    ctx.closePath();
    ctx.fill();

    // Base layer (wide, dark backdrop)
    const plumeBaseGrad = ctx.createLinearGradient(
      crownX,
      crownY - size * 0.15,
      tipX,
      tipY,
    );
    plumeBaseGrad.addColorStop(0, theme.plumeDark);
    plumeBaseGrad.addColorStop(0.35, theme.plume);
    plumeBaseGrad.addColorStop(0.7, theme.plumeDark);
    plumeBaseGrad.addColorStop(1, theme.plumeDark);
    ctx.fillStyle = plumeBaseGrad;
    ctx.beginPath();
    ctx.moveTo(crownX - size * 0.06, crownY);
    ctx.bezierCurveTo(
      midX - size * 0.02,
      midY - size * 0.12,
      tipX - size * 0.06,
      tipY - size * 0.14,
      tipX + size * 0.04,
      tipY + size * 0.02,
    );
    ctx.bezierCurveTo(
      tipX + size * 0.02,
      tipY + size * 0.1,
      midX + size * 0.03,
      midY + size * 0.1,
      crownX + size * 0.06,
      crownY + size * 0.02,
    );
    ctx.closePath();
    ctx.fill();

    // Main body (rich themed gradient)
    const plumeMainGrad = ctx.createLinearGradient(
      crownX,
      crownY - size * 0.1,
      tipX,
      tipY,
    );
    plumeMainGrad.addColorStop(0, theme.plumeDark);
    plumeMainGrad.addColorStop(0.15, theme.plume);
    plumeMainGrad.addColorStop(0.4, theme.plumeLight);
    plumeMainGrad.addColorStop(0.65, theme.plume);
    plumeMainGrad.addColorStop(0.85, theme.plumeLight);
    plumeMainGrad.addColorStop(1, theme.plumeDark);
    ctx.fillStyle = plumeMainGrad;
    ctx.beginPath();
    ctx.moveTo(crownX - size * 0.045, crownY);
    ctx.bezierCurveTo(
      midX - size * 0.015,
      midY - size * 0.1,
      tipX - size * 0.05,
      tipY - size * 0.12,
      tipX + size * 0.02,
      tipY + size * 0.01,
    );
    ctx.bezierCurveTo(
      tipX,
      tipY + size * 0.07,
      midX + size * 0.02,
      midY + size * 0.08,
      crownX + size * 0.045,
      crownY + size * 0.015,
    );
    ctx.closePath();
    ctx.fill();

    // Inner highlight shimmer (bright ribbon along center)
    const plumeHiGrad = ctx.createLinearGradient(
      crownX,
      crownY,
      tipX,
      tipY,
    );
    plumeHiGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    plumeHiGrad.addColorStop(0.15, theme.plumeHighlight + "55");
    plumeHiGrad.addColorStop(0.4, theme.plumeHighlight + "77");
    plumeHiGrad.addColorStop(0.65, theme.plumeHighlight + "55");
    plumeHiGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = plumeHiGrad;
    ctx.beginPath();
    ctx.moveTo(crownX - size * 0.02, crownY + size * 0.005);
    ctx.bezierCurveTo(
      midX - size * 0.008,
      midY - size * 0.05,
      tipX - size * 0.04,
      tipY - size * 0.06,
      tipX,
      tipY + size * 0.02,
    );
    ctx.bezierCurveTo(
      tipX - size * 0.01,
      tipY + size * 0.04,
      midX + size * 0.01,
      midY + size * 0.04,
      crownX + size * 0.02,
      crownY + size * 0.01,
    );
    ctx.closePath();
    ctx.fill();

    // Individual horsehair strands flowing backward
    for (let strand = 0; strand < 10; strand++) {
      const strandT = strand / 9;
      const strandPhase = time * (3.5 + strand * 0.4) + strand * 1.1;
      const strandBend = Math.sin(strandPhase) * (1.5 + strandT * 3.0);
      const strandAlpha = 0.15 + Math.sin(time * 2.5 + strand * 0.8) * 0.1;
      const strandSpread = (strandT - 0.5) * size * 0.08;
      const strandStartX = crownX + strandSpread * 0.4;
      const strandStartY = crownY + Math.abs(strandSpread) * 0.3;

      ctx.strokeStyle =
        strand % 3 === 0
          ? theme.plumeHighlight + Math.round(strandAlpha * 255).toString(16).padStart(2, "0")
          : strand % 3 === 1
            ? theme.plumeLight + Math.round(strandAlpha * 255).toString(16).padStart(2, "0")
            : theme.plume + Math.round((strandAlpha * 0.8) * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = (0.6 + (1 - Math.abs(strandT - 0.5) * 2) * 0.5) * zoom;
      ctx.beginPath();
      ctx.moveTo(strandStartX, strandStartY);
      const strandMidX = midX + strandSpread + strandBend;
      const strandMidY = midY - size * 0.05 + Math.abs(strandSpread) * 0.8;
      const strandEndX = tipX + strandSpread * 1.5 + strandBend * 1.6 + plumeWind * 0.4;
      const strandEndY = tipY + strandSpread * 0.6 + Math.abs(strandSpread) * 0.5;
      ctx.bezierCurveTo(
        strandMidX,
        strandMidY,
        strandEndX - size * 0.06,
        strandEndY - size * 0.04,
        strandEndX,
        strandEndY,
      );
      ctx.stroke();
    }

    // Tip wisps at trailing edge
    for (let wisp = 0; wisp < 5; wisp++) {
      const wispT = wisp / 4;
      const wispPhase = Math.sin(time * 7 + wisp * 1.5);
      const wispAlpha = 0.2 + wispPhase * 0.1;
      const wispSpread = (wispT - 0.5) * size * 0.1;
      const wispX = tipX + wispSpread + plumeWind * 0.3;
      const wispY = tipY + wispSpread * 0.4;

      ctx.strokeStyle = theme.plumeHighlight + Math.round(wispAlpha * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(wispX, wispY);
      ctx.quadraticCurveTo(
        wispX + size * 0.06 + wispPhase * size * 0.03,
        wispY - size * 0.02,
        wispX + size * 0.1 + wispPhase * size * 0.05,
        wispY + size * 0.03,
      );
      ctx.stroke();
    }

    // Gold crest clamp at base (sits on helmet crown)
    const clampGrad = ctx.createLinearGradient(
      crownX - size * 0.06,
      crownY,
      crownX + size * 0.06,
      crownY,
    );
    clampGrad.addColorStop(0, "#5a4518");
    clampGrad.addColorStop(0.3, "#a08028");
    clampGrad.addColorStop(0.5, "#c4a440");
    clampGrad.addColorStop(0.7, "#a08028");
    clampGrad.addColorStop(1, "#5a4518");
    ctx.fillStyle = clampGrad;
    ctx.beginPath();
    ctx.roundRect(
      crownX - size * 0.06,
      crownY - size * 0.008,
      size * 0.12,
      size * 0.025,
      size * 0.005,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 230, 160, 0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    // Clamp gem (themed)
    ctx.fillStyle = theme.plume;
    ctx.shadowColor = theme.plume;
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.arc(crownX, crownY + size * 0.004, size * 0.006, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === ARMORED GORGET ===
  const gorgetGrad = ctx.createLinearGradient(
    x - size * 0.14,
    0,
    x + size * 0.14,
    0,
  );
  gorgetGrad.addColorStop(0, armorDark);
  gorgetGrad.addColorStop(0.3, armorMid);
  gorgetGrad.addColorStop(0.7, armorHigh);
  gorgetGrad.addColorStop(1, armorDark);
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 + breathe * 0.3);
  ctx.lineTo(x - size * 0.11, y - size * 0.21 + breathe * 0.25);
  ctx.lineTo(x + size * 0.11, y - size * 0.21 + breathe * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.15 + breathe * 0.3);
  ctx.closePath();
  ctx.fill();
  // Gorget rim highlight
  ctx.strokeStyle = armorPeak;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.21 + breathe * 0.25);
  ctx.lineTo(x + size * 0.12, y - size * 0.21 + breathe * 0.25);
  ctx.stroke();

  // === GREAT HELM ===
  // Helm base dome
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.04,
    helmY - size * 0.04,
    size * 0.02,
    x,
    helmY,
    size * 0.21,
  );
  helmGrad.addColorStop(0, armorPeak);
  helmGrad.addColorStop(0.35, armorHigh);
  helmGrad.addColorStop(0.7, armorMid);
  helmGrad.addColorStop(1, armorDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, helmY, size * 0.19, size * 0.185, 0, 0, Math.PI * 2);
  ctx.fill();

  // Helm center ridge
  ctx.strokeStyle = armorPeak;
  ctx.lineWidth = 2.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, helmY - size * 0.175);
  ctx.quadraticCurveTo(x + size * 0.008, helmY, x, helmY + size * 0.12);
  ctx.stroke();

  // Angular face plate
  const fpGrad = ctx.createLinearGradient(
    x - size * 0.16,
    helmY,
    x + size * 0.16,
    helmY,
  );
  fpGrad.addColorStop(0, armorDark);
  fpGrad.addColorStop(0.4, armorHigh);
  fpGrad.addColorStop(0.55, armorPeak);
  fpGrad.addColorStop(1, armorDark);
  ctx.fillStyle = fpGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.155, helmY - size * 0.04);
  ctx.lineTo(x - size * 0.17, helmY + size * 0.07);
  ctx.lineTo(x - size * 0.06, helmY + size * 0.14);
  ctx.lineTo(x, helmY + size * 0.16);
  ctx.lineTo(x + size * 0.06, helmY + size * 0.14);
  ctx.lineTo(x + size * 0.17, helmY + size * 0.07);
  ctx.lineTo(x + size * 0.155, helmY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Visor slit - narrow angular opening
  ctx.fillStyle = "#06060d";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.135, helmY - size * 0.014);
  ctx.lineTo(x - size * 0.046, helmY + size * 0.02);
  ctx.lineTo(x, helmY + size * 0.005);
  ctx.lineTo(x + size * 0.046, helmY + size * 0.02);
  ctx.lineTo(x + size * 0.135, helmY - size * 0.014);
  ctx.lineTo(x + size * 0.115, helmY - size * 0.03);
  ctx.lineTo(x, helmY - size * 0.005);
  ctx.lineTo(x - size * 0.115, helmY - size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Breathing holes - V pattern on lower face plate
  ctx.fillStyle = "#08080f";
  for (let bSide = -1; bSide <= 1; bSide += 2) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        x + bSide * (size * 0.03 + i * size * 0.025),
        helmY + size * 0.06 + i * size * 0.018,
        size * 0.009,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Glowing eyes behind visor - THEMED
  const eyeGlow = 0.42 + Math.sin(time * 3) * 0.16 + attackIntensity * 0.24;
  ctx.fillStyle = `${theme.eyeGlow}${eyeGlow})`;
  ctx.shadowColor = theme.eyeShadow;
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.058,
    helmY - size * 0.002,
    size * 0.018,
    size * 0.008,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.058,
    helmY - size * 0.002,
    size * 0.018,
    size * 0.008,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Eye core highlights
  ctx.fillStyle = `rgba(255, 255, 255, ${eyeGlow * 0.18})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.058, helmY - size * 0.002, size * 0.005, 0, Math.PI * 2);
  ctx.arc(x + size * 0.058, helmY - size * 0.002, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Battle cry shockwave during attack - THEMED
  if (isAttacking && attackPhase > 0.25 && attackPhase < 0.65) {
    const cryAlpha = Math.sin(((attackPhase - 0.25) / 0.4) * Math.PI) * 0.5;
    ctx.strokeStyle = `${theme.shockwave}${cryAlpha})`;
    ctx.lineWidth = 2.5 * zoom;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(x, helmY, size * (0.22 + r * 0.12), -0.9, 0.9);
      ctx.stroke();
    }
  }

  ctx.restore();
}
