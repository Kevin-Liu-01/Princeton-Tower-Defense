import type { Position, TroopOwnerType } from "../../types";
import type { MapTheme } from "../../constants/maps";
import { getKnightTheme, getKnightGearVariant } from "./knightThemes";
import type { KnightTheme, KnightGearVariant } from "./knightThemes";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  drawArmoredSkirt,
  drawDetailedArm,
} from "./troopHelpers";
import type { ArmColors } from "./troopHelpers";

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
  knightVariant?: number,
) {
  const theme = getKnightTheme(ownerType, mapTheme);
  const gear = getKnightGearVariant(knightVariant, ownerType);

  const stance = Math.sin(time * 3) * 1;
  const breathe = Math.sin(time * 2) * 0.4;
  const capeWave = Math.sin(time * 4);

  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.2) * 2.2
    : 0;
  const bodyLean = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.25
    : Math.sin(time * 1.7) * 0.03;
  const attackIntensity = attackPhase;
  const armorPeak = gear.armorPeak;
  const armorHigh = gear.armorHigh;
  const armorMid = gear.armorMid;
  const armorDark = gear.armorDark;

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
  drawKnightCape(ctx, x, y, size, zoom, breathe, capeWave, theme, gear);

  // === ARMORED LEGS ===
  const knightStanceSpread = size * (isAttacking ? 0.13 : 0.11);
  for (let side = -1; side <= 1; side += 2) {
    const isLeft = side === -1;
    ctx.save();
    ctx.translate(x + side * knightStanceSpread, y + size * 0.32);
    ctx.rotate(side * (-0.10 + stance * 0.025));

    const lw = size * 0.15;
    const hlw = lw * 0.5;

    // --- Thigh plate (cuisse) ---
    const thighH = size * 0.10;
    const thighGrad = ctx.createLinearGradient(-hlw, 0, hlw, 0);
    thighGrad.addColorStop(0, armorDark);
    thighGrad.addColorStop(0.2, armorMid);
    thighGrad.addColorStop(0.5, armorHigh);
    thighGrad.addColorStop(0.8, armorMid);
    thighGrad.addColorStop(1, armorDark);
    ctx.fillStyle = thighGrad;
    ctx.beginPath();
    ctx.roundRect(-hlw, 0, lw, thighH, size * 0.015);
    ctx.fill();

    // Thigh plate flared overlay
    ctx.fillStyle = armorHigh;
    ctx.beginPath();
    ctx.moveTo(-hlw + size * 0.01, 0);
    ctx.lineTo(-hlw - size * 0.005, thighH * 0.55);
    ctx.lineTo(-hlw + size * 0.01, thighH);
    ctx.lineTo(hlw - size * 0.01, thighH);
    ctx.lineTo(hlw + size * 0.005, thighH * 0.55);
    ctx.lineTo(hlw - size * 0.01, 0);
    ctx.closePath();
    ctx.fill();

    // Thigh edge highlight
    ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(isLeft ? -hlw : hlw, size * 0.01);
    ctx.lineTo(isLeft ? -hlw : hlw, thighH - size * 0.01);
    ctx.stroke();

    // Thigh articulation bands
    ctx.strokeStyle = armorDark;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.45);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.45);
    ctx.moveTo(-hlw + size * 0.01, thighH * 0.75);
    ctx.lineTo(hlw - size * 0.01, thighH * 0.75);
    ctx.stroke();

    // Side rivet
    ctx.fillStyle = armorPeak;
    ctx.beginPath();
    ctx.arc(isLeft ? -hlw + size * 0.015 : hlw - size * 0.015, thighH * 0.55, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    // --- Knee cop (poleyn) with spike ---
    const kneeY = thighH + size * 0.005;
    ctx.fillStyle = armorMid;
    ctx.beginPath();
    ctx.ellipse(0, kneeY, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner dome
    const kneeCopGrad = ctx.createRadialGradient(
      -size * 0.01, kneeY, 0, 0, kneeY, size * 0.06,
    );
    kneeCopGrad.addColorStop(0, armorPeak);
    kneeCopGrad.addColorStop(0.5, armorHigh);
    kneeCopGrad.addColorStop(1, armorDark);
    ctx.fillStyle = kneeCopGrad;
    ctx.beginPath();
    ctx.ellipse(0, kneeY, size * 0.06, size * 0.038, 0, 0, Math.PI * 2);
    ctx.fill();
    // Spike above knee
    ctx.fillStyle = armorMid;
    ctx.beginPath();
    ctx.moveTo(0, kneeY - size * 0.055);
    ctx.lineTo(-size * 0.02, kneeY - size * 0.02);
    ctx.lineTo(size * 0.02, kneeY - size * 0.02);
    ctx.closePath();
    ctx.fill();
    // Fan guard below
    ctx.fillStyle = armorMid;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, kneeY + size * 0.025);
    ctx.lineTo(0, kneeY + size * 0.055);
    ctx.lineTo(size * 0.04, kneeY + size * 0.025);
    ctx.closePath();
    ctx.fill();
    // Center rivet
    ctx.fillStyle = armorPeak;
    ctx.beginPath();
    ctx.arc(0, kneeY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();

    // --- Greave (shin guard) ---
    const greaveTop = kneeY + size * 0.05;
    const greaveH = size * 0.12;
    const greaveGrad = ctx.createLinearGradient(-hlw, greaveTop, hlw, greaveTop);
    greaveGrad.addColorStop(0, armorDark);
    greaveGrad.addColorStop(0.15, armorMid);
    greaveGrad.addColorStop(0.45, armorHigh);
    greaveGrad.addColorStop(0.55, armorMid);
    greaveGrad.addColorStop(0.85, armorMid);
    greaveGrad.addColorStop(1, armorDark);
    ctx.fillStyle = greaveGrad;
    ctx.beginPath();
    ctx.roundRect(-hlw, greaveTop, lw, greaveH, [0, 0, size * 0.02, size * 0.02]);
    ctx.fill();

    // Greave center ridge
    ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, greaveTop + size * 0.01);
    ctx.lineTo(0, greaveTop + greaveH - size * 0.01);
    ctx.stroke();

    // Greave articulation bands
    ctx.strokeStyle = armorDark;
    ctx.lineWidth = 0.8 * zoom;
    for (const t of [0.35, 0.65]) {
      const bandY = greaveTop + greaveH * t;
      ctx.beginPath();
      ctx.moveTo(-hlw + size * 0.01, bandY);
      ctx.lineTo(hlw - size * 0.01, bandY);
      ctx.stroke();
    }

    // Greave edge highlight
    ctx.strokeStyle = `rgba(255, 255, 255, 0.12)`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(isLeft ? -hlw : hlw, greaveTop + size * 0.01);
    ctx.lineTo(isLeft ? -hlw : hlw, greaveTop + greaveH - size * 0.01);
    ctx.stroke();

    // --- Sabaton (armored boot) ---
    const bootTop = greaveTop + greaveH;
    const bootH = size * 0.07;
    const sabGrad = ctx.createLinearGradient(-hlw, bootTop, hlw, bootTop);
    sabGrad.addColorStop(0, armorDark);
    sabGrad.addColorStop(0.4, armorMid);
    sabGrad.addColorStop(0.6, armorMid);
    sabGrad.addColorStop(1, armorDark);
    ctx.fillStyle = sabGrad;
    ctx.beginPath();
    ctx.moveTo(-hlw, bootTop);
    ctx.lineTo(hlw, bootTop);
    ctx.lineTo(hlw + size * 0.01, bootTop + bootH);
    ctx.lineTo(-hlw - size * 0.01, bootTop + bootH);
    ctx.closePath();
    ctx.fill();

    // Boot cuff
    ctx.fillStyle = armorHigh;
    ctx.fillRect(-hlw - size * 0.005, bootTop, lw + size * 0.01, size * 0.018);

    // Plate segments
    ctx.strokeStyle = armorDark;
    ctx.lineWidth = 0.7 * zoom;
    for (const t of [0.4, 0.65]) {
      ctx.beginPath();
      ctx.moveTo(-hlw, bootTop + bootH * t);
      ctx.lineTo(hlw, bootTop + bootH * t);
      ctx.stroke();
    }

    // Toe ridge
    ctx.strokeStyle = `rgba(255, 255, 255, 0.12)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, bootTop + size * 0.02);
    ctx.lineTo(0, bootTop + bootH - size * 0.008);
    ctx.stroke();

    // Sole
    ctx.fillStyle = armorDark;
    ctx.fillRect(-hlw - size * 0.01, bootTop + bootH - size * 0.01, lw + size * 0.02, size * 0.01);

    ctx.restore();
  }

  // === DARK PLATE ARMOR ===
  const by = breathe;

  // Back plate
  ctx.fillStyle = armorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.35 + by);
  ctx.lineTo(x - size * 0.26, y - size * 0.12 + by * 0.5);
  ctx.lineTo(x + size * 0.26, y - size * 0.12 + by * 0.5);
  ctx.lineTo(x + size * 0.24, y + size * 0.35 + by);
  ctx.closePath();
  ctx.fill();

  // Front chest plate — rich multi-stop gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.22, y - size * 0.18 + by * 0.5,
    x + size * 0.22, y + size * 0.34 + by,
  );
  plateGrad.addColorStop(0, armorDark);
  plateGrad.addColorStop(0.12, armorMid);
  plateGrad.addColorStop(0.3, armorHigh);
  plateGrad.addColorStop(0.48, armorPeak);
  plateGrad.addColorStop(0.6, armorHigh);
  plateGrad.addColorStop(0.8, armorMid);
  plateGrad.addColorStop(1, armorDark);
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + by);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + by * 0.5);
  ctx.quadraticCurveTo(x, y - size * 0.24 + by * 0.3, x + size * 0.24, y - size * 0.14 + by * 0.5);
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + by);
  ctx.closePath();
  ctx.fill();

  // Pectoral contour lines (musculature sculpted into plate)
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.02, y - size * 0.12 + by * 0.4);
    ctx.quadraticCurveTo(
      x + side * size * 0.12, y - size * 0.02 + by * 0.6,
      x + side * size * 0.08, y + size * 0.12 + by,
    );
    ctx.stroke();

    // Specular highlight on each pectoral
    ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.03, y - size * 0.10 + by * 0.4);
    ctx.quadraticCurveTo(
      x + side * size * 0.10, y - size * 0.01 + by * 0.6,
      x + side * size * 0.07, y + size * 0.10 + by,
    );
    ctx.stroke();
  }

  // Center seam (sternum line)
  ctx.strokeStyle = "#3a3a48";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17 + by * 0.4);
  ctx.lineTo(x, y + size * 0.18 + by);
  ctx.stroke();

  // Abdominal plate lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.04 + by * 0.7, size * 0.14, 0.25, Math.PI - 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + size * 0.12 + by * 0.8, size * 0.12, 0.35, Math.PI - 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + size * 0.19 + by * 0.9, size * 0.10, 0.4, Math.PI - 0.4);
  ctx.stroke();

  // Armor plate edge rivets
  for (let side = -1; side <= 1; side += 2) {
    for (let r = 0; r < 3; r++) {
      const ry = y - size * 0.06 + r * size * 0.10 + by * (0.5 + r * 0.15);
      ctx.fillStyle = armorPeak;
      ctx.beginPath();
      ctx.arc(x + side * size * 0.20, ry, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(x + side * size * 0.20 - size * 0.003, ry - size * 0.003, size * 0.003, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Themed plate edge glow
  ctx.strokeStyle = theme.sigilGlow + "0.15)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + by);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + by * 0.5);
  ctx.quadraticCurveTo(x, y - size * 0.24 + by * 0.3, x + size * 0.24, y - size * 0.14 + by * 0.5);
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + by);
  ctx.stroke();

  // Dark sigil on chest — hexagonal emblem
  ctx.fillStyle = "#0e0e1a";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.06 + by);
  ctx.lineTo(x - size * 0.065, y + size * 0.02 + by);
  ctx.lineTo(x - size * 0.08, y + size * 0.1 + by);
  ctx.lineTo(x, y + size * 0.18 + by);
  ctx.lineTo(x + size * 0.08, y + size * 0.1 + by);
  ctx.lineTo(x + size * 0.065, y + size * 0.02 + by);
  ctx.closePath();
  ctx.fill();

  // Sigil etched border
  ctx.strokeStyle = `${theme.sigilGlow}0.12)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Inner diamond sigil
  ctx.strokeStyle = `${theme.sigilGlow}0.25)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.01 + by);
  ctx.lineTo(x - size * 0.04, y + size * 0.06 + by);
  ctx.lineTo(x, y + size * 0.12 + by);
  ctx.lineTo(x + size * 0.04, y + size * 0.06 + by);
  ctx.closePath();
  ctx.stroke();

  // Sigil wing flourishes
  ctx.strokeStyle = `${theme.sigilGlow}0.15)`;
  ctx.lineWidth = 0.8 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y + size * 0.06 + by);
    ctx.quadraticCurveTo(
      x + side * size * 0.07, y + size * 0.04 + by,
      x + side * size * 0.065, y + size * 0.02 + by,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y + size * 0.06 + by);
    ctx.quadraticCurveTo(
      x + side * size * 0.07, y + size * 0.09 + by,
      x + side * size * 0.065, y + size * 0.12 + by,
    );
    ctx.stroke();
  }

  // Glowing center gem
  const sigilGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackIntensity * 0.4;
  ctx.shadowColor = `${theme.sigilGlow}0.6)`;
  ctx.shadowBlur = 4 * zoom * sigilGlow;
  ctx.fillStyle = `${theme.sigilGlow}${sigilGlow})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.065 + by, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Gem specular pip
  ctx.fillStyle = `rgba(255,255,255,${0.4 + sigilGlow * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.008, y + size * 0.06 + by, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Outer sigil glow ring
  ctx.strokeStyle = `${theme.sigilGlow}${sigilGlow * 0.35})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.065 + by, size * 0.045, 0, Math.PI * 2);
  ctx.stroke();

  // Battle belt — layered
  const beltY = y + size * 0.28 + by;
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(x - size * 0.21, beltY, size * 0.42, size * 0.07);
  // Belt upper trim
  ctx.fillStyle = armorMid;
  ctx.fillRect(x - size * 0.21, beltY, size * 0.42, size * 0.015);
  // Belt lower trim
  ctx.fillStyle = armorMid;
  ctx.fillRect(x - size * 0.21, beltY + size * 0.055, size * 0.42, size * 0.015);
  // Belt segment lines
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.7 * zoom;
  for (let b = 1; b < 4; b++) {
    const bx = x - size * 0.21 + b * size * 0.105;
    ctx.beginPath();
    ctx.moveTo(bx, beltY + size * 0.015);
    ctx.lineTo(bx, beltY + size * 0.055);
    ctx.stroke();
  }

  // Belt skull buckle
  ctx.fillStyle = theme.beltBuckle;
  ctx.beginPath();
  ctx.arc(x, beltY + size * 0.035, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  // Skull eye sockets
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.arc(x - size * 0.012, beltY + size * 0.03, size * 0.008, 0, Math.PI * 2);
  ctx.arc(x + size * 0.012, beltY + size * 0.03, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
  // Buckle ring
  ctx.strokeStyle = armorPeak;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(x, beltY + size * 0.035, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  // === ARMORED SKIRT (tassets) ===
  drawArmoredSkirt(ctx, x, y, size, zoom, stance, breathe, {
    armorPeak, armorHigh, armorMid, armorDark,
    trimColor: gear.trimHighlight,
  }, { plateCount: 5, widthFactor: 0.52, depthFactor: 0.18 });

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
  const knightArmColors: ArmColors = {
    upper: armorMid,
    upperLight: armorHigh,
    upperDark: armorDark,
    vambrace: armorHigh,
    vambraceLight: armorPeak,
    elbow: armorMid,
    hand: armorMid,
    trim: gear.trimColor,
  };

  // Left arm
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.02 + breathe * 0.5);
  ctx.rotate(-0.25 - (isAttacking ? bodyLean * 0.6 : 0));
  drawDetailedArm(ctx, size, size * 0.22, zoom, knightArmColors);
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
  drawDetailedArm(ctx, size, knightArmLength, zoom, knightArmColors);
  ctx.restore();

  // Sword (variant-dependent blade shape)
  ctx.save();
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);
  drawKnightWeapon(ctx, size, swordScale, zoom, time, theme, gear.weaponStyle, gear.trimColor, attackIntensity, isAttacking, attackPhase);
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

  // === HELMET (variant-dependent) ===
  drawKnightHelmet(ctx, x, helmY, size, zoom, time, armorPeak, armorHigh, armorMid, armorDark, gear.helmetStyle, gear.trimColor, gear.trimHighlight, theme, attackIntensity, isAttacking, attackPhase);

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

// ============================================================================
// HELMET VARIANTS
// ============================================================================

function drawKnightHelmet(
  ctx: CanvasRenderingContext2D,
  x: number,
  helmY: number,
  size: number,
  zoom: number,
  time: number,
  armorPeak: string,
  armorHigh: string,
  armorMid: string,
  armorDark: string,
  helmetStyle: "greathelm" | "crusader" | "winged",
  trimColor: string,
  trimHighlight: string,
  theme: import("./knightThemes").KnightTheme,
  attackIntensity: number,
  isAttacking: boolean,
  attackPhase: number,
) {
  // Base dome (shared across variants)
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.04, helmY - size * 0.04, size * 0.02,
    x, helmY, size * 0.21,
  );
  helmGrad.addColorStop(0, armorPeak);
  helmGrad.addColorStop(0.35, armorHigh);
  helmGrad.addColorStop(0.7, armorMid);
  helmGrad.addColorStop(1, armorDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, helmY, size * 0.19, size * 0.185, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center ridge
  ctx.strokeStyle = armorPeak;
  ctx.lineWidth = 2.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, helmY - size * 0.175);
  ctx.quadraticCurveTo(x + size * 0.008, helmY, x, helmY + size * 0.12);
  ctx.stroke();

  switch (helmetStyle) {
    case "greathelm":
      drawGreatHelm(ctx, x, helmY, size, zoom, armorPeak, armorHigh, armorMid, armorDark);
      break;
    case "crusader":
      drawCrusaderHelm(ctx, x, helmY, size, zoom, armorPeak, armorHigh, armorMid, armorDark, trimColor, trimHighlight);
      break;
    case "winged":
      drawWingedHelm(ctx, x, helmY, size, zoom, time, armorPeak, armorHigh, armorMid, armorDark, trimColor, trimHighlight);
      break;
  }

  // Glowing eyes behind visor (all variants)
  const eyeGlow = 0.42 + Math.sin(time * 3) * 0.16 + attackIntensity * 0.24;
  ctx.fillStyle = `${theme.eyeGlow}${eyeGlow})`;
  ctx.shadowColor = theme.eyeShadow;
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.058, helmY - size * 0.002, size * 0.018, size * 0.008, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.058, helmY - size * 0.002, size * 0.018, size * 0.008, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${eyeGlow * 0.18})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.058, helmY - size * 0.002, size * 0.005, 0, Math.PI * 2);
  ctx.arc(x + size * 0.058, helmY - size * 0.002, size * 0.005, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// Variant 0: Classic Great Helm — flat top with narrow slit and breathing holes
function drawGreatHelm(
  ctx: CanvasRenderingContext2D,
  x: number, helmY: number, size: number, zoom: number,
  armorPeak: string, armorHigh: string, _armorMid: string, armorDark: string,
) {
  const fpGrad = ctx.createLinearGradient(x - size * 0.16, helmY, x + size * 0.16, helmY);
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

  // Narrow visor slit
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

  // Breathing holes
  ctx.fillStyle = "#08080f";
  for (let bSide = -1; bSide <= 1; bSide += 2) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        x + bSide * (size * 0.03 + i * size * 0.025),
        helmY + size * 0.06 + i * size * 0.018,
        size * 0.009, 0, Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

// Variant 1: Crusader Helm — cross-shaped visor opening, chainmail fringe
function drawCrusaderHelm(
  ctx: CanvasRenderingContext2D,
  x: number, helmY: number, size: number, zoom: number,
  armorPeak: string, armorHigh: string, _armorMid: string, armorDark: string,
  trimColor: string, trimHighlight: string,
) {
  // Flat face plate (slightly more squared)
  const fpGrad = ctx.createLinearGradient(x - size * 0.16, helmY, x + size * 0.16, helmY);
  fpGrad.addColorStop(0, armorDark);
  fpGrad.addColorStop(0.35, armorHigh);
  fpGrad.addColorStop(0.6, armorPeak);
  fpGrad.addColorStop(1, armorDark);
  ctx.fillStyle = fpGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, helmY - size * 0.05);
  ctx.lineTo(x - size * 0.165, helmY + size * 0.08);
  ctx.lineTo(x - size * 0.12, helmY + size * 0.13);
  ctx.lineTo(x, helmY + size * 0.14);
  ctx.lineTo(x + size * 0.12, helmY + size * 0.13);
  ctx.lineTo(x + size * 0.165, helmY + size * 0.08);
  ctx.lineTo(x + size * 0.16, helmY - size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Cross-shaped visor — wide openings with deep shadow for contrast
  ctx.shadowColor = "#000000";
  ctx.shadowBlur = 4 * zoom;
  ctx.fillStyle = "#020208";
  // Horizontal eye slit (wide)
  ctx.fillRect(x - size * 0.13, helmY - size * 0.022, size * 0.26, size * 0.042);
  // Vertical nose/mouth slit (tall)
  ctx.fillRect(x - size * 0.02, helmY - size * 0.07, size * 0.04, size * 0.14);
  ctx.shadowBlur = 0;

  // Thin metal dividers between the four openings (subtle, not dominant)
  ctx.strokeStyle = armorDark;
  ctx.lineWidth = 1.5 * zoom;
  // Vertical divider
  ctx.beginPath();
  ctx.moveTo(x, helmY - size * 0.07);
  ctx.lineTo(x, helmY + size * 0.07);
  ctx.stroke();
  // Horizontal divider
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, helmY);
  ctx.lineTo(x + size * 0.13, helmY);
  ctx.stroke();

  // Chainmail fringe at bottom
  ctx.fillStyle = trimColor;
  for (let i = -4; i <= 4; i++) {
    const cx = x + i * size * 0.025;
    const cy = helmY + size * 0.13 + Math.abs(i) * size * 0.005;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }

  // Forehead trim band
  ctx.strokeStyle = trimHighlight;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.arc(x, helmY, size * 0.185, Math.PI + 0.4, -0.4);
  ctx.stroke();
}

// Variant 2: Winged Helm — open-face with decorative metal wings on sides
function drawWingedHelm(
  ctx: CanvasRenderingContext2D,
  x: number, helmY: number, size: number, zoom: number, time: number,
  armorPeak: string, armorHigh: string, armorMid: string, armorDark: string,
  trimColor: string, trimHighlight: string,
) {
  // Face plate with nose guard
  const fpGrad = ctx.createLinearGradient(x - size * 0.16, helmY, x + size * 0.16, helmY);
  fpGrad.addColorStop(0, armorDark);
  fpGrad.addColorStop(0.4, armorHigh);
  fpGrad.addColorStop(0.55, armorPeak);
  fpGrad.addColorStop(1, armorDark);
  ctx.fillStyle = fpGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, helmY - size * 0.03);
  ctx.lineTo(x - size * 0.16, helmY + size * 0.06);
  ctx.lineTo(x - size * 0.04, helmY + size * 0.12);
  ctx.lineTo(x, helmY + size * 0.14);
  ctx.lineTo(x + size * 0.04, helmY + size * 0.12);
  ctx.lineTo(x + size * 0.16, helmY + size * 0.06);
  ctx.lineTo(x + size * 0.15, helmY - size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Y-shaped visor opening (nose guard + eye openings)
  ctx.fillStyle = "#06060d";
  // Left eye opening
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, helmY - size * 0.005, size * 0.04, size * 0.016, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Right eye opening
  ctx.beginPath();
  ctx.ellipse(x + size * 0.06, helmY - size * 0.005, size * 0.04, size * 0.016, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Central nose guard
  ctx.fillStyle = armorPeak;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.015, helmY - size * 0.06);
  ctx.lineTo(x, helmY + size * 0.06);
  ctx.lineTo(x + size * 0.015, helmY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Decorative metal wings on each side
  const wingBob = Math.sin(time * 2.5) * size * 0.005;
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    const wingX = x + side * size * 0.19;
    const wingY = helmY - size * 0.08 + wingBob;

    // Wing base plate
    const wingGrad = ctx.createLinearGradient(
      wingX, wingY - size * 0.12,
      wingX + side * size * 0.08, wingY + size * 0.06,
    );
    wingGrad.addColorStop(0, trimHighlight);
    wingGrad.addColorStop(0.5, trimColor);
    wingGrad.addColorStop(1, armorDark);
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(wingX, wingY + size * 0.04);
    ctx.quadraticCurveTo(
      wingX + side * size * 0.06, wingY - size * 0.02,
      wingX + side * size * 0.12, wingY - size * 0.2,
    );
    ctx.lineTo(wingX + side * size * 0.08, wingY - size * 0.15);
    ctx.quadraticCurveTo(
      wingX + side * size * 0.04, wingY - size * 0.06,
      wingX - side * size * 0.01, wingY + size * 0.02,
    );
    ctx.closePath();
    ctx.fill();

    // Wing feather lines
    ctx.strokeStyle = armorMid;
    ctx.lineWidth = 0.8 * zoom;
    for (let f = 0; f < 3; f++) {
      const ft = f / 2;
      const fStartX = wingX + side * size * 0.01;
      const fStartY = wingY + size * 0.02 - f * size * 0.015;
      const fEndX = wingX + side * size * (0.08 + ft * 0.04);
      const fEndY = wingY - size * (0.08 + ft * 0.06);
      ctx.beginPath();
      ctx.moveTo(fStartX, fStartY);
      ctx.quadraticCurveTo(
        (fStartX + fEndX) / 2 + side * size * 0.02,
        (fStartY + fEndY) / 2,
        fEndX, fEndY,
      );
      ctx.stroke();
    }

    // Wing tip highlight
    ctx.fillStyle = trimHighlight;
    ctx.beginPath();
    ctx.arc(wingX + side * size * 0.12, wingY - size * 0.2, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Crown band with gem
  ctx.strokeStyle = trimHighlight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, helmY, size * 0.185, Math.PI + 0.3, -0.3);
  ctx.stroke();
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.arc(x, helmY - size * 0.18, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// WEAPON VARIANTS
// ============================================================================

function drawKnightWeapon(
  ctx: CanvasRenderingContext2D,
  size: number,
  swordScale: number,
  zoom: number,
  time: number,
  theme: import("./knightThemes").KnightTheme,
  weaponStyle: "broadsword" | "longsword" | "bastardsword",
  trimColor: string,
  attackIntensity: number,
  isAttacking: boolean,
  attackPhase: number,
) {
  // Pommel (shared)
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(0, size * 0.32 * swordScale, size * 0.035 * swordScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `${theme.gemColor}0.6)`;
  ctx.beginPath();
  ctx.arc(0, size * 0.32 * swordScale, size * 0.015 * swordScale, 0, Math.PI * 2);
  ctx.fill();

  // Handle (shared, length varies by weapon)
  const handleLen = weaponStyle === "longsword" ? 0.26 : weaponStyle === "bastardsword" ? 0.24 : 0.22;
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(-size * 0.032 * swordScale, size * 0.1 * swordScale, size * 0.064 * swordScale, size * handleLen * swordScale);
  ctx.strokeStyle = "#4a3525";
  ctx.lineWidth = 2 * zoom;
  const wraps = weaponStyle === "longsword" ? 7 : 6;
  for (let i = 0; i < wraps; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.032 * swordScale, size * (0.12 + i * (handleLen / wraps)) * swordScale);
    ctx.lineTo(size * 0.032 * swordScale, size * (0.14 + i * (handleLen / wraps)) * swordScale);
    ctx.stroke();
  }

  // Crossguard (variant-shaped)
  switch (weaponStyle) {
    case "broadsword":
      drawBroadswordGuard(ctx, size, swordScale, zoom, theme, trimColor);
      break;
    case "longsword":
      drawLongswordGuard(ctx, size, swordScale, zoom, theme, trimColor);
      break;
    case "bastardsword":
      drawBastardswordGuard(ctx, size, swordScale, zoom, theme, trimColor);
      break;
  }

  // Blade (variant-shaped)
  if (isAttacking) {
    ctx.shadowColor = theme.eyeShadow;
    ctx.shadowBlur = (15 + attackIntensity * 10) * zoom;
  }
  switch (weaponStyle) {
    case "broadsword":
      drawBroadswordBlade(ctx, size, swordScale, zoom);
      break;
    case "longsword":
      drawLongswordBlade(ctx, size, swordScale, zoom);
      break;
    case "bastardsword":
      drawBastardswordBlade(ctx, size, swordScale, zoom);
      break;
  }
  ctx.shadowBlur = 0;

  // Blade runes (all variants)
  const runeGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackIntensity * 0.5;
  ctx.fillStyle = `${theme.bladeRunes}${runeGlow})`;
  const runeCount = weaponStyle === "longsword" ? 6 : weaponStyle === "bastardsword" ? 4 : 5;
  for (let i = 0; i < runeCount; i++) {
    const runeY = -size * 0.08 * swordScale - i * size * 0.12 * swordScale;
    ctx.fillRect(-size * 0.016 * swordScale, runeY, size * 0.032 * swordScale, size * 0.055 * swordScale);
  }

  // Swing trail (all variants)
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const trailAlpha = Math.sin(((attackPhase - 0.15) / 0.7) * Math.PI) * 0.7;
    ctx.strokeStyle = `${theme.swingTrail}${trailAlpha})`;
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.78 * swordScale);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.55, size * 0.3, -size * 0.1);
    ctx.stroke();
    ctx.strokeStyle = `${theme.swingTrailAlt}${trailAlpha * 0.5})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.78 * swordScale);
    ctx.quadraticCurveTo(size * 0.4, -size * 0.6, size * 0.35, -size * 0.15);
    ctx.stroke();
  }
}

// --- Crossguard variants ---

function drawBroadswordGuard(
  ctx: CanvasRenderingContext2D,
  size: number, swordScale: number, zoom: number,
  theme: import("./knightThemes").KnightTheme, _trimColor: string,
) {
  // Wide straight crossguard with ball ends
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
  ctx.fillStyle = theme.crossguardAccent;
  ctx.beginPath();
  ctx.arc(-size * 0.16 * swordScale, size * 0.097 * swordScale, size * 0.035 * swordScale, 0, Math.PI * 2);
  ctx.arc(size * 0.16 * swordScale, size * 0.097 * swordScale, size * 0.035 * swordScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `${theme.gemColor}0.8)`;
  ctx.beginPath();
  ctx.arc(-size * 0.16 * swordScale, size * 0.097 * swordScale, size * 0.018 * swordScale, 0, Math.PI * 2);
  ctx.arc(size * 0.16 * swordScale, size * 0.097 * swordScale, size * 0.018 * swordScale, 0, Math.PI * 2);
  ctx.fill();
}

function drawLongswordGuard(
  ctx: CanvasRenderingContext2D,
  size: number, swordScale: number, zoom: number,
  theme: import("./knightThemes").KnightTheme, trimColor: string,
) {
  // Downswept crossguard with elongated quillons
  ctx.fillStyle = theme.crossguardMain;
  ctx.beginPath();
  ctx.moveTo(-size * 0.19 * swordScale, size * 0.075 * swordScale);
  ctx.quadraticCurveTo(-size * 0.14 * swordScale, size * 0.105 * swordScale, -size * 0.04 * swordScale, size * 0.1 * swordScale);
  ctx.lineTo(size * 0.04 * swordScale, size * 0.1 * swordScale);
  ctx.quadraticCurveTo(size * 0.14 * swordScale, size * 0.105 * swordScale, size * 0.19 * swordScale, size * 0.075 * swordScale);
  ctx.lineTo(size * 0.18 * swordScale, size * 0.09 * swordScale);
  ctx.quadraticCurveTo(size * 0.12 * swordScale, size * 0.115 * swordScale, size * 0.04 * swordScale, size * 0.11 * swordScale);
  ctx.lineTo(-size * 0.04 * swordScale, size * 0.11 * swordScale);
  ctx.quadraticCurveTo(-size * 0.12 * swordScale, size * 0.115 * swordScale, -size * 0.18 * swordScale, size * 0.09 * swordScale);
  ctx.closePath();
  ctx.fill();
  // Quillon tips
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.arc(-size * 0.19 * swordScale, size * 0.078 * swordScale, size * 0.02 * swordScale, 0, Math.PI * 2);
  ctx.arc(size * 0.19 * swordScale, size * 0.078 * swordScale, size * 0.02 * swordScale, 0, Math.PI * 2);
  ctx.fill();
  // Ricasso highlight
  ctx.strokeStyle = theme.crossguardAccent;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03 * swordScale, size * 0.08 * swordScale);
  ctx.lineTo(size * 0.03 * swordScale, size * 0.08 * swordScale);
  ctx.stroke();
}

function drawBastardswordGuard(
  ctx: CanvasRenderingContext2D,
  size: number, swordScale: number, zoom: number,
  theme: import("./knightThemes").KnightTheme, trimColor: string,
) {
  // Ring-guard crossguard with finger loop
  ctx.fillStyle = theme.crossguardMain;
  ctx.beginPath();
  ctx.moveTo(-size * 0.14 * swordScale, size * 0.08 * swordScale);
  ctx.lineTo(-size * 0.15 * swordScale, size * 0.095 * swordScale);
  ctx.lineTo(-size * 0.14 * swordScale, size * 0.115 * swordScale);
  ctx.lineTo(size * 0.14 * swordScale, size * 0.115 * swordScale);
  ctx.lineTo(size * 0.15 * swordScale, size * 0.095 * swordScale);
  ctx.lineTo(size * 0.14 * swordScale, size * 0.08 * swordScale);
  ctx.closePath();
  ctx.fill();
  // Finger ring on guard
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(size * 0.06 * swordScale, size * 0.06 * swordScale, size * 0.035 * swordScale, size * 0.05 * swordScale, 0.2, 0, Math.PI * 2);
  ctx.stroke();
  // Guard gems
  ctx.fillStyle = `${theme.gemColor}0.85)`;
  ctx.beginPath();
  ctx.arc(0, size * 0.095 * swordScale, size * 0.022 * swordScale, 0, Math.PI * 2);
  ctx.fill();
  // Guard end accents
  ctx.fillStyle = theme.crossguardAccent;
  ctx.beginPath();
  ctx.arc(-size * 0.14 * swordScale, size * 0.097 * swordScale, size * 0.025 * swordScale, 0, Math.PI * 2);
  ctx.arc(size * 0.14 * swordScale, size * 0.097 * swordScale, size * 0.025 * swordScale, 0, Math.PI * 2);
  ctx.fill();
}

// --- Blade shape variants ---

function drawBroadswordBlade(
  ctx: CanvasRenderingContext2D,
  size: number, swordScale: number, zoom: number,
) {
  // Wide straight blade tapering to a pointed tip
  const bladeW = size * 0.07 * swordScale;
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

  // Fuller
  ctx.strokeStyle = "rgba(60, 60, 80, 0.5)";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05 * swordScale);
  ctx.lineTo(0, -size * 0.55 * swordScale);
  ctx.stroke();

  // Edge highlights
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
}

function drawLongswordBlade(
  ctx: CanvasRenderingContext2D,
  size: number, swordScale: number, zoom: number,
) {
  // Narrow, long blade with gentle taper — elegant and precise
  const bladeW = size * 0.05 * swordScale;
  const bladeLen = 0.88;
  const bladeGrad = ctx.createLinearGradient(-bladeW, 0, bladeW, 0);
  bladeGrad.addColorStop(0, "#808890");
  bladeGrad.addColorStop(0.15, "#c0c8d4");
  bladeGrad.addColorStop(0.4, "#e4e8f0");
  bladeGrad.addColorStop(0.5, "#f4f4fa");
  bladeGrad.addColorStop(0.6, "#e4e8f0");
  bladeGrad.addColorStop(0.85, "#c0c8d4");
  bladeGrad.addColorStop(1, "#808890");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-bladeW, size * 0.08 * swordScale);
  ctx.lineTo(-bladeW * 0.9, -size * 0.7 * swordScale);
  ctx.lineTo(-bladeW * 0.3, -size * (bladeLen - 0.04) * swordScale);
  ctx.lineTo(0, -size * bladeLen * swordScale);
  ctx.lineTo(bladeW * 0.3, -size * (bladeLen - 0.04) * swordScale);
  ctx.lineTo(bladeW * 0.9, -size * 0.7 * swordScale);
  ctx.lineTo(bladeW, size * 0.08 * swordScale);
  ctx.closePath();
  ctx.fill();

  // Double fuller channels
  ctx.strokeStyle = "rgba(60, 60, 80, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-bladeW * 0.3, size * 0.05 * swordScale);
  ctx.lineTo(-bladeW * 0.25, -size * 0.6 * swordScale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bladeW * 0.3, size * 0.05 * swordScale);
  ctx.lineTo(bladeW * 0.25, -size * 0.6 * swordScale);
  ctx.stroke();

  // Edge highlights
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-bladeW * 0.8, size * 0.06 * swordScale);
  ctx.lineTo(-bladeW * 0.75, -size * 0.68 * swordScale);
  ctx.lineTo(0, -size * (bladeLen - 0.02) * swordScale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bladeW * 0.8, size * 0.06 * swordScale);
  ctx.lineTo(bladeW * 0.75, -size * 0.68 * swordScale);
  ctx.lineTo(0, -size * (bladeLen - 0.02) * swordScale);
  ctx.stroke();
}

function drawBastardswordBlade(
  ctx: CanvasRenderingContext2D,
  size: number, swordScale: number, zoom: number,
) {
  // Wide blade that flares slightly before tapering — powerful cleaving shape
  const bladeW = size * 0.065 * swordScale;
  const flareW = bladeW * 1.2;
  const bladeGrad = ctx.createLinearGradient(-flareW, 0, flareW, 0);
  bladeGrad.addColorStop(0, "#6a6a78");
  bladeGrad.addColorStop(0.1, "#a8a8b8");
  bladeGrad.addColorStop(0.3, "#d0d0dc");
  bladeGrad.addColorStop(0.5, "#e8e8f2");
  bladeGrad.addColorStop(0.7, "#d0d0dc");
  bladeGrad.addColorStop(0.9, "#a8a8b8");
  bladeGrad.addColorStop(1, "#6a6a78");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-bladeW, size * 0.08 * swordScale);
  // Flare outward at 1/3 up
  ctx.lineTo(-flareW, -size * 0.25 * swordScale);
  ctx.lineTo(-flareW * 0.95, -size * 0.55 * swordScale);
  ctx.lineTo(-bladeW * 0.6, -size * 0.7 * swordScale);
  ctx.lineTo(0, -size * 0.82 * swordScale);
  ctx.lineTo(bladeW * 0.6, -size * 0.7 * swordScale);
  ctx.lineTo(flareW * 0.95, -size * 0.55 * swordScale);
  ctx.lineTo(flareW, -size * 0.25 * swordScale);
  ctx.lineTo(bladeW, size * 0.08 * swordScale);
  ctx.closePath();
  ctx.fill();

  // Single wide fuller
  ctx.strokeStyle = "rgba(50, 50, 70, 0.5)";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05 * swordScale);
  ctx.lineTo(0, -size * 0.5 * swordScale);
  ctx.stroke();

  // Edge highlights
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-bladeW * 0.9, size * 0.06 * swordScale);
  ctx.lineTo(-flareW * 0.9, -size * 0.24 * swordScale);
  ctx.lineTo(-flareW * 0.85, -size * 0.53 * swordScale);
  ctx.lineTo(0, -size * 0.8 * swordScale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bladeW * 0.9, size * 0.06 * swordScale);
  ctx.lineTo(flareW * 0.9, -size * 0.24 * swordScale);
  ctx.lineTo(flareW * 0.85, -size * 0.53 * swordScale);
  ctx.lineTo(0, -size * 0.8 * swordScale);
  ctx.stroke();
}

// ============================================================================
// KNIGHT CAPE — flowing behind the body
// ============================================================================
function drawKnightCape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  breathe: number,
  capeWave: number,
  theme: KnightTheme,
  gear: KnightGearVariant,
) {
  const capeWave2 = capeWave * 0.7;

  // Main cape body — drapes from shoulders, flows downward behind
  const capeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.18,
    x,
    y + size * 0.65,
  );
  capeGrad.addColorStop(0, theme.capeLight);
  capeGrad.addColorStop(0.35, theme.capeMid);
  capeGrad.addColorStop(0.75, theme.capeDark);
  capeGrad.addColorStop(1, theme.capeDark);
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  // Left shoulder attachment
  ctx.moveTo(x - size * 0.2, y - size * 0.15 + breathe);
  // Left edge flows down with wave
  ctx.quadraticCurveTo(
    x - size * 0.32 + capeWave * 3,
    y + size * 0.15,
    x - size * 0.28 + capeWave * 5,
    y + size * 0.58,
  );
  // Bottom edge — wider and wavy
  ctx.quadraticCurveTo(
    x - size * 0.1 + capeWave2 * 3,
    y + size * 0.66 + capeWave2 * 2,
    x + capeWave2 * 2,
    y + size * 0.62,
  );
  ctx.quadraticCurveTo(
    x + size * 0.12 + capeWave2 * 2,
    y + size * 0.65 + capeWave2 * 1.5,
    x + size * 0.28 + capeWave * 4,
    y + size * 0.56,
  );
  // Right edge flows back up
  ctx.quadraticCurveTo(
    x + size * 0.32 + capeWave * 2.5,
    y + size * 0.12,
    x + size * 0.2,
    y - size * 0.15 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Cape inner fold shadow — adds depth
  ctx.fillStyle = theme.capeInner;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.2 + capeWave * 2,
    y + size * 0.2,
    x - size * 0.16 + capeWave * 3.5,
    y + size * 0.5,
  );
  ctx.quadraticCurveTo(
    x + capeWave2 * 1.5,
    y + size * 0.55,
    x + size * 0.16 + capeWave * 3,
    y + size * 0.48,
  );
  ctx.quadraticCurveTo(
    x + size * 0.2 + capeWave * 1.5,
    y + size * 0.18,
    x + size * 0.12,
    y - size * 0.08 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  // Cape fold highlight — central vertical fold catching light
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = theme.capeLight;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.06 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.04 + capeWave * 1.5,
    y + size * 0.25,
    x - size * 0.02 + capeWave * 2,
    y + size * 0.52,
  );
  ctx.lineTo(x + size * 0.04 + capeWave * 1.5, y + size * 0.5);
  ctx.quadraticCurveTo(
    x + size * 0.05 + capeWave,
    y + size * 0.22,
    x + size * 0.03,
    y - size * 0.06 + breathe,
  );
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Bottom trim stripe
  ctx.strokeStyle = gear.trimHighlight;
  ctx.lineWidth = 1.8 * zoom;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27 + capeWave * 4.8, y + size * 0.56);
  ctx.quadraticCurveTo(
    x + capeWave2 * 2,
    y + size * 0.64 + capeWave2 * 1.8,
    x + size * 0.27 + capeWave * 3.8,
    y + size * 0.54,
  );
  ctx.stroke();
  ctx.globalAlpha = 1.0;
}

