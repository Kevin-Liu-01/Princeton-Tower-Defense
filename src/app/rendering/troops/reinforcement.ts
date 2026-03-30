import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
  drawArmoredSkirt,
} from "./troopHelpers";
import { getScenePressure } from "../performance";
import { getReinforcementVariation } from "./reinforcementThemes";
import type { ReinforcementPalette } from "./reinforcementHelpers";
import {
  drawReinforcementHelmet,
  drawChestMotif,
  drawPauldrons,
  drawBelt,
  drawGreaves,
} from "./reinforcementHelpers";

const PALETTES: readonly ReinforcementPalette[] = [
  {
    armorDark: "#3b3046",
    armorMid: "#5a4b6e",
    armorLight: "#8f7ab2",
    trim: "#b39261",
    cape: "#2a1d3f",
    capeShadow: "#1b112d",
    glow: "rgba(156, 108, 232, ",
    eye: "rgba(197, 169, 255, ",
    eyeShadow: "#8d63d6",
  },
  {
    armorDark: "#383855",
    armorMid: "#5a5e88",
    armorLight: "#9198c8",
    trim: "#c2a36f",
    cape: "#2a2752",
    capeShadow: "#1a1536",
    glow: "rgba(132, 152, 236, ",
    eye: "rgba(184, 206, 255, ",
    eyeShadow: "#5e79cf",
  },
  {
    armorDark: "#2f3f57",
    armorMid: "#4e6d93",
    armorLight: "#87a8d0",
    trim: "#d6bb81",
    cape: "#20324e",
    capeShadow: "#142138",
    glow: "rgba(104, 182, 236, ",
    eye: "rgba(162, 224, 255, ",
    eyeShadow: "#3b8bbf",
  },
  {
    armorDark: "#2e3f44",
    armorMid: "#4d6f79",
    armorLight: "#7fb2be",
    trim: "#e0c890",
    cape: "#1f3d41",
    capeShadow: "#10272b",
    glow: "rgba(109, 224, 203, ",
    eye: "rgba(183, 255, 236, ",
    eyeShadow: "#36a58d",
  },
  {
    armorDark: "#3d3b2f",
    armorMid: "#706648",
    armorLight: "#b39d66",
    trim: "#f2dd9d",
    cape: "#4d3e21",
    capeShadow: "#2c220f",
    glow: "rgba(246, 212, 110, ",
    eye: "rgba(255, 238, 170, ",
    eyeShadow: "#d39d34",
  },
  {
    armorDark: "#3a3422",
    armorMid: "#6f5e2b",
    armorLight: "#c7ab56",
    trim: "#ffe8a6",
    cape: "#4f2f15",
    capeShadow: "#301b0b",
    glow: "rgba(255, 195, 88, ",
    eye: "rgba(255, 241, 189, ",
    eyeShadow: "#e0aa3f",
  },
  {
    armorDark: "#4a4e5a",
    armorMid: "#8a90a4",
    armorLight: "#d0d6e8",
    trim: "#e8eaf6",
    cape: "#3a3854",
    capeShadow: "#24223a",
    glow: "rgba(210, 220, 255, ",
    eye: "rgba(230, 240, 255, ",
    eyeShadow: "#8890cc",
  },
];

export function drawReinforcementTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  tierInput: number = 0,
  targetPos?: Position,
  troopId?: string,
) {
  const tier = Math.max(0, Math.min(6, Math.floor(tierInput)));
  const isAttacking = attackPhase > 0;
  const isLancerTier = tier >= 5;
  const breathe = Math.sin(time * 2.35) * 0.6;
  const stride = Math.sin(time * 3.1) * 0.8;
  const attackDrive = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackBodyOffsetX = isAttacking ? attackDrive * size * 0.09 : 0;
  const attackBodyOffsetY = isAttacking ? -attackDrive * size * 0.04 : 0;

  const palette = PALETTES[tier];
  const variation = getReinforcementVariation(troopId);
  const { helmet, armor } = variation;

  // ── Tier aura ──
  const reinfPressure = getScenePressure();
  if (!reinfPressure.skipNonEssentialParticles) {
    const auraStrength = Math.min(0.88, 0.2 + tier * 0.08 + attackDrive * 0.25);
    const auraPulse = 0.86 + Math.sin(time * 3.7) * 0.14;
    if (reinfPressure.forceSimplifiedGradients) {
      ctx.fillStyle = `${palette.glow}${auraStrength * auraPulse * 0.3})`;
    } else {
      const auraGrad = ctx.createRadialGradient(x, y + size * 0.08, size * 0.08, x, y + size * 0.08, size * 0.74);
      auraGrad.addColorStop(0, `${palette.glow}${auraStrength * auraPulse})`);
      auraGrad.addColorStop(1, `${palette.glow}0)`);
      ctx.fillStyle = auraGrad;
    }
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.1, size * 0.65, size * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack energy rings
  if (isAttacking && tier >= 3 && !reinfPressure.skipDecorativeEffects) {
    for (let ring = 0; ring < 2; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.2) % 1;
      const ringAlpha = (1 - ringPhase) * 0.35 * attackDrive;
      ctx.strokeStyle = `${palette.glow}${ringAlpha})`;
      ctx.lineWidth = (2.5 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        size * (0.5 + ringPhase * 0.3),
        size * (0.6 + ringPhase * 0.3),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  ctx.save();
  ctx.translate(attackBodyOffsetX, attackBodyOffsetY);

  // ── Cape ──
  const capeWave = Math.sin(time * 3.9) * size * 0.07;
  ctx.fillStyle = palette.cape;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.16 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.36 + capeWave,
    y + size * 0.18,
    x - size * 0.28 + capeWave * 1.2,
    y + size * 0.48,
  );
  ctx.lineTo(x + size * 0.14 + capeWave * 0.5, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.1 + capeWave * 0.25,
    y + size * 0.1,
    x + size * 0.14,
    y - size * 0.14 + breathe * 0.4,
  );
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.capeShadow;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.08 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x - size * 0.2 + capeWave * 0.5,
    y + size * 0.14,
    x - size * 0.12 + capeWave,
    y + size * 0.36,
  );
  ctx.lineTo(x + size * 0.02 + capeWave * 0.4, y + size * 0.34);
  ctx.quadraticCurveTo(
    x + size * 0.01,
    y + size * 0.08,
    x + size * 0.06,
    y - size * 0.08 + breathe * 0.4,
  );
  ctx.closePath();
  ctx.fill();

  // Cape edge trim (tier 2+)
  if (tier >= 2) {
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 1.2 * zoom;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.28 + capeWave * 1.2, y + size * 0.48);
    ctx.lineTo(x + size * 0.14 + capeWave * 0.5, y + size * 0.45);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── Legs with varied greaves ──
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.09, y + size * 0.3 + breathe);
    ctx.rotate(side * (-0.08 + stride * 0.02));
    drawGreaves(ctx, 0, 0, size, zoom, palette, armor.greaveStyle);
    ctx.restore();
  }

  // ── Torso ──
  const chestGrad = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.22,
    x + size * 0.24,
    y + size * 0.28,
  );
  chestGrad.addColorStop(0, palette.armorDark);
  chestGrad.addColorStop(0.35, palette.armorMid);
  chestGrad.addColorStop(0.7, palette.armorLight);
  chestGrad.addColorStop(1, palette.armorDark);
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.25 + breathe * 0.2,
    x + size * 0.24,
    y - size * 0.14 + breathe * 0.4,
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Plate seam lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2 + breathe * 0.3);
  ctx.lineTo(x, y + size * 0.16 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + breathe * 0.7, size * 0.12, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Plate edge glow
  ctx.strokeStyle = `${palette.glow}0.1)`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.25 + breathe * 0.2,
    x + size * 0.24,
    y - size * 0.14 + breathe * 0.4,
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + breathe);
  ctx.stroke();

  // Torso trim line
  ctx.strokeStyle = palette.trim;
  ctx.lineWidth = (1.4 + tier * 0.16) * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.02 + breathe);
  ctx.lineTo(x + size * 0.16, y - size * 0.02 + breathe);
  ctx.stroke();

  // ── Chest motif (varies per troop) ──
  drawChestMotif(
    ctx,
    x,
    y,
    size,
    zoom,
    time,
    breathe,
    palette,
    armor.chestMotif,
    tier,
    attackDrive,
  );

  // ── Belt (varies per troop) ──
  drawBelt(ctx, x, y, size, zoom, breathe, palette, armor.beltDetail);

  // ── Armored skirt (tassets) ──
  drawArmoredSkirt(ctx, x, y, size, zoom, stride, breathe, {
    armorPeak: palette.armorLight,
    armorHigh: palette.armorMid,
    armorMid: palette.armorDark,
    armorDark: palette.armorDark,
    trimColor: palette.trim,
  }, { plateCount: 5, widthFactor: 0.44, depthFactor: 0.14, topOffset: 0.28 });

  // ── Pauldrons (varies per troop, tier 2+) ──
  drawPauldrons(
    ctx,
    x,
    y,
    size,
    zoom,
    breathe,
    palette,
    armor.pauldronShape,
    tier,
  );

  // Gorget
  if (tier >= 1) {
    const gorgetGrad = ctx.createLinearGradient(
      x - size * 0.12,
      0,
      x + size * 0.12,
      0,
    );
    gorgetGrad.addColorStop(0, palette.armorDark);
    gorgetGrad.addColorStop(0.3, palette.armorMid);
    gorgetGrad.addColorStop(0.7, palette.armorLight);
    gorgetGrad.addColorStop(1, palette.armorDark);
    ctx.fillStyle = gorgetGrad;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.13, y - size * 0.15 + breathe * 0.3);
    ctx.lineTo(x - size * 0.1, y - size * 0.21 + breathe * 0.25);
    ctx.lineTo(x + size * 0.1, y - size * 0.21 + breathe * 0.25);
    ctx.lineTo(x + size * 0.13, y - size * 0.15 + breathe * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = palette.armorLight;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, y - size * 0.21 + breathe * 0.25);
    ctx.lineTo(x + size * 0.1, y - size * 0.21 + breathe * 0.25);
    ctx.stroke();
  }

  // ── Lancer mantle (tier 5) ──
  if (tier >= 5) {
    const mantleColor = tier >= 6 ? "rgba(210, 220, 255, 0.9)" : "rgba(255, 234, 171, 0.85)";
    ctx.strokeStyle = mantleColor;
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y - size * 0.16 + breathe * 0.4);
    ctx.lineTo(x - size * 0.08, y - size * 0.26 + breathe * 0.4);
    ctx.lineTo(x + size * 0.08, y - size * 0.26 + breathe * 0.4);
    ctx.lineTo(x + size * 0.2, y - size * 0.16 + breathe * 0.4);
    ctx.stroke();
  }

  // ── Platinum jewel decorations (tier 6) ──
  if (tier >= 6) {
    const jewelPulse = 0.6 + Math.sin(time * 3.2) * 0.25 + attackDrive * 0.15;
    const jewelSparkle = Math.sin(time * 5.8) * 0.2;

    const drawJewel = (jx: number, jy: number, r: number, hue: string) => {
      ctx.save();
      ctx.shadowColor = hue;
      ctx.shadowBlur = (4 + jewelSparkle * 2) * zoom;
      const jGrad = ctx.createRadialGradient(jx - r * 0.3, jy - r * 0.3, 0, jx, jy, r);
      jGrad.addColorStop(0, "#ffffff");
      jGrad.addColorStop(0.3, hue);
      jGrad.addColorStop(1, "rgba(80, 80, 120, 0.6)");
      ctx.fillStyle = jGrad;
      ctx.beginPath();
      ctx.moveTo(jx, jy - r);
      ctx.lineTo(jx + r * 0.7, jy);
      ctx.lineTo(jx, jy + r);
      ctx.lineTo(jx - r * 0.7, jy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${jewelPulse * 0.6})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      ctx.restore();
    };

    const s = size;
    const by = breathe;
    // Chest centerpiece
    drawJewel(x, y - s * 0.06 + by * 0.5, s * 0.035, "rgba(180, 200, 255, 0.9)");
    // Pauldron jewels
    drawJewel(x - s * 0.22, y - s * 0.1 + by * 0.4, s * 0.025, "rgba(220, 180, 255, 0.85)");
    drawJewel(x + s * 0.22, y - s * 0.1 + by * 0.4, s * 0.025, "rgba(220, 180, 255, 0.85)");
    // Belt jewels
    drawJewel(x - s * 0.1, y + s * 0.18 + by * 0.8, s * 0.018, "rgba(180, 230, 255, 0.8)");
    drawJewel(x + s * 0.1, y + s * 0.18 + by * 0.8, s * 0.018, "rgba(180, 230, 255, 0.8)");

    // Crystal shimmer lines on armor plates
    ctx.globalAlpha = 0.25 + jewelSparkle * 0.15;
    ctx.strokeStyle = "rgba(210, 220, 255, 0.6)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.15, y - s * 0.12 + by * 0.4);
    ctx.lineTo(x - s * 0.05, y + s * 0.08 + by * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.15, y - s * 0.12 + by * 0.4);
    ctx.lineTo(x + s * 0.05, y + s * 0.08 + by * 0.7);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── Left arm + shield/second weapon ──
  const reinfShieldX = x - size * 0.36;
  const reinfShieldY = y + size * 0.07 + breathe * 0.6;
  const reinfLShoulderX = x - size * 0.24;
  const reinfLShoulderY = y + size * 0.03 + breathe * 0.5;
  const reinfArmToShieldAngle = !isLancerTier
    ? Math.atan2(reinfShieldY - reinfLShoulderY, reinfShieldX - reinfLShoulderX)
    : -0.24;

  ctx.save();
  ctx.translate(reinfLShoulderX, reinfLShoulderY);
  ctx.rotate(reinfArmToShieldAngle);
  ctx.fillStyle = palette.armorMid;
  ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.18, size * 0.08);
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(size * 0.1, -size * 0.045, size * 0.1, size * 0.09);
  ctx.fillStyle = palette.armorMid;
  ctx.beginPath();
  ctx.arc(size * 0.2, 0, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (!isLancerTier) {
    ctx.save();
    ctx.translate(reinfShieldX, reinfShieldY);
    ctx.rotate(-0.42 + stride * 0.03);
    const shieldGrad = ctx.createLinearGradient(
      -size * 0.08,
      -size * 0.18,
      size * 0.08,
      size * 0.16,
    );
    shieldGrad.addColorStop(0, palette.armorDark);
    shieldGrad.addColorStop(0.35, palette.armorMid);
    shieldGrad.addColorStop(0.65, palette.armorLight);
    shieldGrad.addColorStop(1, palette.armorDark);
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.2);
    ctx.lineTo(-size * 0.11, -size * 0.12);
    ctx.lineTo(-size * 0.09, size * 0.14);
    ctx.lineTo(0, size * 0.18);
    ctx.lineTo(size * 0.09, size * 0.14);
    ctx.lineTo(size * 0.11, -size * 0.12);
    ctx.closePath();
    ctx.fill();

    // Shield rim
    ctx.strokeStyle = palette.armorLight;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.18);
    ctx.lineTo(-size * 0.095, -size * 0.11);
    ctx.lineTo(-size * 0.075, size * 0.12);
    ctx.lineTo(0, size * 0.16);
    ctx.lineTo(size * 0.075, size * 0.12);
    ctx.lineTo(size * 0.095, -size * 0.11);
    ctx.closePath();
    ctx.stroke();

    // Shield motif (matches chest motif for cohesion)
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 1.8 * zoom;
    switch (armor.chestMotif) {
      case "cross":
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.14);
        ctx.lineTo(0, size * 0.13);
        ctx.moveTo(-size * 0.06, -size * 0.01);
        ctx.lineTo(size * 0.06, -size * 0.01);
        ctx.stroke();
        break;
      case "diamond":
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.1);
        ctx.lineTo(-size * 0.05, 0);
        ctx.lineTo(0, size * 0.1);
        ctx.lineTo(size * 0.05, 0);
        ctx.closePath();
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.14);
        ctx.lineTo(0, size * 0.13);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size * 0.05, -size * 0.02);
        ctx.lineTo(size * 0.05, -size * 0.02);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }

  // ── Right arm + weapon ──
  // Anchor system: weapon grip is always locked to the hand (end of arm).
  // 1. armSwingAngle drives where the hand goes (animation-controlled)
  // 2. hand = shoulder + armLength * direction(armSwingAngle)
  // 3. weaponOrigin = hand + gripOffset rotated by weaponAngle
  const armLength = size * 0.1;
  const reinfRShoulderX = x + size * 0.24;
  const reinfRShoulderY = y + size * 0.02 + breathe * 0.5;

  ctx.save();
  if (isLancerTier) {
    const spearGripLocalY = size * 0.1;

    // Arm swing: reaches back at start, thrusts forward at end
    const armSwingAngle = isAttacking
      ? 0.3 - (1 - attackPhase) * 0.8
      : -0.3 + stride * 0.04;

    const handX = reinfRShoulderX + Math.cos(armSwingAngle) * armLength;
    const handY = reinfRShoulderY + Math.sin(armSwingAngle) * armLength;

    // Spear blade orientation
    const spearBaseAngle = isAttacking
      ? -1.18 + attackPhase * 2.4
      : -0.68 + stride * 0.05;
    const spearAngle = resolveWeaponRotation(
      targetPos,
      handX,
      handY,
      spearBaseAngle,
      Math.PI / 2,
      isAttacking ? 1.28 : 0.72,
      WEAPON_LIMITS.rightPole,
    );

    // Derive spear origin so grip lands exactly on the hand
    const spearX = handX + Math.sin(spearAngle) * spearGripLocalY;
    const spearY = handY - Math.cos(spearAngle) * spearGripLocalY;

    // Draw arm (fixed length, rotated by armSwingAngle)
    ctx.save();
    ctx.translate(reinfRShoulderX, reinfRShoulderY);
    ctx.rotate(armSwingAngle);
    ctx.fillStyle = palette.armorMid;
    ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.18, size * 0.08);
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(size * 0.1, -size * 0.045, size * 0.1, size * 0.09);
    ctx.fillStyle = palette.armorMid;
    ctx.beginPath();
    ctx.arc(armLength, 0, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.translate(spearX, spearY);
    ctx.rotate(spearAngle);

    // Shaft with wood-grain gradient
    const shaftGrad = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
    shaftGrad.addColorStop(0, "#3a2510");
    shaftGrad.addColorStop(0.25, "#5a3a1b");
    shaftGrad.addColorStop(0.5, "#7a5228");
    shaftGrad.addColorStop(0.75, "#5a3a1b");
    shaftGrad.addColorStop(1, "#3a2510");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(-size * 0.028, -size * 0.66, size * 0.056, size * 1.2);

    // Shaft highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, -size * 0.6);
    ctx.lineTo(-size * 0.01, size * 0.5);
    ctx.stroke();

    // Metal ferrule bands
    for (let band = 0; band < 3; band++) {
      const bandY = -size * 0.08 + band * size * 0.04;
      const ferruleGrad = ctx.createLinearGradient(
        -size * 0.04,
        bandY,
        size * 0.04,
        bandY,
      );
      ferruleGrad.addColorStop(0, "#6a5520");
      ferruleGrad.addColorStop(0.3, palette.trim);
      ferruleGrad.addColorStop(0.7, "#e8d090");
      ferruleGrad.addColorStop(1, "#6a5520");
      ctx.fillStyle = ferruleGrad;
      ctx.fillRect(-size * 0.038, bandY, size * 0.076, size * 0.025);
    }

    // Spearhead — leaf-shaped with proper steel gradient
    const tipGrad = ctx.createLinearGradient(
      -size * 0.08,
      -size * 0.96,
      size * 0.08,
      -size * 0.66,
    );
    tipGrad.addColorStop(0, "#e8e0d0");
    tipGrad.addColorStop(0.15, "#fff4dc");
    tipGrad.addColorStop(0.5, "#ffe8a6");
    tipGrad.addColorStop(0.85, "#c8aa5a");
    tipGrad.addColorStop(1, "#8a6a2a");
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.98);
    ctx.quadraticCurveTo(
      -size * 0.1,
      -size * 0.82,
      -size * 0.085,
      -size * 0.68,
    );
    ctx.lineTo(-size * 0.02, -size * 0.64);
    ctx.lineTo(size * 0.02, -size * 0.64);
    ctx.lineTo(size * 0.085, -size * 0.68);
    ctx.quadraticCurveTo(size * 0.1, -size * 0.82, 0, -size * 0.98);
    ctx.closePath();
    ctx.fill();

    // Spearhead midrib
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.96);
    ctx.lineTo(0, -size * 0.66);
    ctx.stroke();

    // Spearhead edge highlights
    ctx.strokeStyle = "rgba(255, 248, 220, 0.35)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.97);
    ctx.quadraticCurveTo(
      -size * 0.09,
      -size * 0.81,
      -size * 0.075,
      -size * 0.69,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.97);
    ctx.quadraticCurveTo(size * 0.09, -size * 0.81, size * 0.075, -size * 0.69);
    ctx.stroke();

    // Butt spike
    ctx.fillStyle = "#8a6a2a";
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, size * 0.52);
    ctx.lineTo(0, size * 0.6);
    ctx.lineTo(size * 0.02, size * 0.52);
    ctx.closePath();
    ctx.fill();

    // ── Pennant / Banner ──
    const flagWave = Math.sin(time * 5.2) * size * 0.02;
    const flagWave2 = Math.sin(time * 7.1 + 0.8) * size * 0.012;
    const flagDrive = attackDrive * size * 0.08;

    // Banner shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.moveTo(size * 0.035, -size * 0.38);
    ctx.quadraticCurveTo(
      size * 0.18 + flagDrive * 0.6 + flagWave,
      -size * 0.35 + flagWave2,
      size * 0.28 + flagDrive + flagWave * 1.3,
      -size * 0.32,
    );
    ctx.quadraticCurveTo(
      size * 0.2 + flagDrive * 0.7 + flagWave * 0.8,
      -size * 0.24 + flagWave2 * 0.5,
      size * 0.29 + flagDrive * 0.9 + flagWave * 1.1,
      -size * 0.18,
    );
    ctx.lineTo(size * 0.035, -size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Banner body — gradient from palette
    const bannerGrad = ctx.createLinearGradient(
      size * 0.03,
      -size * 0.38,
      size * 0.28 + flagDrive,
      -size * 0.18,
    );
    bannerGrad.addColorStop(0, palette.cape);
    bannerGrad.addColorStop(0.4, palette.capeShadow);
    bannerGrad.addColorStop(1, palette.cape);
    ctx.fillStyle = bannerGrad;
    ctx.beginPath();
    ctx.moveTo(size * 0.032, -size * 0.37);
    ctx.quadraticCurveTo(
      size * 0.17 + flagDrive * 0.5 + flagWave,
      -size * 0.345 + flagWave2,
      size * 0.27 + flagDrive + flagWave * 1.2,
      -size * 0.315,
    );
    // Swallowtail notch
    ctx.lineTo(size * 0.22 + flagDrive * 0.8 + flagWave * 0.9, -size * 0.25);
    ctx.quadraticCurveTo(
      size * 0.19 + flagDrive * 0.6 + flagWave * 0.6,
      -size * 0.235 + flagWave2 * 0.3,
      size * 0.28 + flagDrive * 0.85 + flagWave * 1.0,
      -size * 0.19,
    );
    ctx.lineTo(size * 0.032, -size * 0.11);
    ctx.closePath();
    ctx.fill();

    // Banner trim border
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.032, -size * 0.37);
    ctx.quadraticCurveTo(
      size * 0.17 + flagDrive * 0.5 + flagWave,
      -size * 0.345 + flagWave2,
      size * 0.27 + flagDrive + flagWave * 1.2,
      -size * 0.315,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.032, -size * 0.11);
    ctx.quadraticCurveTo(
      size * 0.15 + flagDrive * 0.5 + flagWave * 0.7,
      -size * 0.13 + flagWave2 * 0.4,
      size * 0.28 + flagDrive * 0.85 + flagWave * 1.0,
      -size * 0.19,
    );
    ctx.stroke();

    // Banner emblem — central motif
    ctx.fillStyle = palette.trim;
    ctx.globalAlpha = 0.7;
    const emblemX = size * 0.14 + flagDrive * 0.4 + flagWave * 0.5;
    const emblemY = -size * 0.245 + flagWave2 * 0.3;
    ctx.beginPath();
    ctx.moveTo(emblemX, emblemY - size * 0.04);
    ctx.lineTo(emblemX - size * 0.025, emblemY);
    ctx.lineTo(emblemX, emblemY + size * 0.04);
    ctx.lineTo(emblemX + size * 0.025, emblemY);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Banner wave folds (light/shadow)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 0.6 * zoom;
    for (let fold = 0; fold < 3; fold++) {
      const foldT = (fold + 1) / 4;
      const fY = -size * 0.37 + foldT * size * 0.26;
      ctx.beginPath();
      ctx.moveTo(size * 0.04, fY);
      ctx.quadraticCurveTo(
        size * 0.14 + flagDrive * foldT + flagWave * foldT,
        fY + flagWave2 * foldT * 0.5,
        size * 0.24 + flagDrive * foldT * 0.8,
        fY - size * 0.01,
      );
      ctx.stroke();
    }
  } else {
    const bladeLength = size * (0.44 + tier * 0.06);
    const swordGripLocalY = size * 0.14;

    // Arm swing: overhead chop (up → forward → down)
    const armSwingAngle = isAttacking
      ? -0.3 + (1 - attackPhase) * 1.0
      : 0.15 + stride * 0.03;

    const handX = reinfRShoulderX + Math.cos(armSwingAngle) * armLength;
    const handY = reinfRShoulderY + Math.sin(armSwingAngle) * armLength;

    // Blade orientation
    const swordBaseAngle = isAttacking
      ? 1.28 + attackPhase * 3.05
      : 0.32 + stride * 0.04;
    const swordAngle = resolveWeaponRotation(
      targetPos,
      handX,
      handY,
      swordBaseAngle,
      Math.PI / 2,
      isAttacking ? 1.38 : 0.78,
      WEAPON_LIMITS.rightMelee,
    );

    // Derive sword origin so grip lands exactly on the hand
    const swordX = handX + Math.sin(swordAngle) * swordGripLocalY;
    const swordY = handY - Math.cos(swordAngle) * swordGripLocalY;

    // Draw arm (fixed length, rotated by armSwingAngle)
    ctx.save();
    ctx.translate(reinfRShoulderX, reinfRShoulderY);
    ctx.rotate(armSwingAngle);
    ctx.fillStyle = palette.armorMid;
    ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.18, size * 0.08);
    ctx.fillStyle = palette.armorLight;
    ctx.fillRect(size * 0.1, -size * 0.045, size * 0.1, size * 0.09);
    ctx.fillStyle = palette.armorMid;
    ctx.beginPath();
    ctx.arc(armLength, 0, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.translate(swordX, swordY);
    ctx.rotate(swordAngle);

    // ── Pommel ──
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.arc(0, size * 0.28, size * 0.032, 0, Math.PI * 2);
    ctx.fill();
    // Pommel face gradient
    const pommelGrad = ctx.createRadialGradient(
      -size * 0.008,
      size * 0.275,
      0,
      0,
      size * 0.28,
      size * 0.03,
    );
    pommelGrad.addColorStop(0, "#6a5530");
    pommelGrad.addColorStop(0.5, "#4a3520");
    pommelGrad.addColorStop(1, "#2a1a10");
    ctx.fillStyle = pommelGrad;
    ctx.beginPath();
    ctx.arc(0, size * 0.28, size * 0.028, 0, Math.PI * 2);
    ctx.fill();
    // Pommel gem
    ctx.fillStyle = `${palette.glow}0.55)`;
    ctx.shadowColor = palette.eyeShadow;
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.arc(0, size * 0.28, size * 0.013, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Handle with leather wrap ──
    const handleGrad = ctx.createLinearGradient(
      -size * 0.03,
      0,
      size * 0.03,
      0,
    );
    handleGrad.addColorStop(0, "#1a0f08");
    handleGrad.addColorStop(0.3, "#3a2510");
    handleGrad.addColorStop(0.7, "#3a2510");
    handleGrad.addColorStop(1, "#1a0f08");
    ctx.fillStyle = handleGrad;
    ctx.fillRect(-size * 0.03, size * 0.08, size * 0.06, size * 0.2);
    // Leather wrapping
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 1.5 * zoom;
    for (let w = 0; w < 6; w++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.03, size * (0.095 + w * 0.03));
      ctx.lineTo(size * 0.03, size * (0.11 + w * 0.03));
      ctx.stroke();
    }
    // Handle highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.012, size * 0.09);
    ctx.lineTo(-size * 0.012, size * 0.27);
    ctx.stroke();

    // ── Ornate crossguard ──
    // Crossguard body — shaped, not rectangular
    ctx.fillStyle = palette.trim;
    ctx.beginPath();
    ctx.moveTo(-size * 0.14, size * 0.06);
    ctx.lineTo(-size * 0.155, size * 0.075);
    ctx.lineTo(-size * 0.14, size * 0.095);
    ctx.lineTo(size * 0.14, size * 0.095);
    ctx.lineTo(size * 0.155, size * 0.075);
    ctx.lineTo(size * 0.14, size * 0.06);
    ctx.closePath();
    ctx.fill();
    // Crossguard shading
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.13, size * 0.09);
    ctx.lineTo(size * 0.13, size * 0.09);
    ctx.stroke();
    // Crossguard end caps
    ctx.fillStyle = palette.armorMid;
    ctx.beginPath();
    ctx.arc(-size * 0.14, size * 0.077, size * 0.03, 0, Math.PI * 2);
    ctx.arc(size * 0.14, size * 0.077, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    // Crossguard gems
    const gemPulse = 0.5 + Math.sin(time * 3.5) * 0.2 + attackDrive * 0.3;
    ctx.fillStyle = `${palette.glow}${gemPulse})`;
    ctx.shadowColor = palette.eyeShadow;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(-size * 0.14, size * 0.077, size * 0.015, 0, Math.PI * 2);
    ctx.arc(size * 0.14, size * 0.077, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Center guard jewel
    ctx.fillStyle = palette.armorLight;
    ctx.beginPath();
    ctx.arc(0, size * 0.077, size * 0.012, 0, Math.PI * 2);
    ctx.fill();

    // ── Blade ──
    // Attack glow shadow
    if (isAttacking) {
      ctx.shadowColor = palette.eyeShadow;
      ctx.shadowBlur = (10 + attackDrive * 8) * zoom;
    }
    const bladeW = size * 0.055;
    // Cross-blade gradient for steel look
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
    ctx.moveTo(-bladeW, size * 0.06);
    ctx.lineTo(-bladeW * 1.04, -bladeLength * 0.78);
    ctx.lineTo(-bladeW * 0.5, -bladeLength * 0.92);
    ctx.lineTo(0, -bladeLength);
    ctx.lineTo(bladeW * 0.5, -bladeLength * 0.92);
    ctx.lineTo(bladeW * 1.04, -bladeLength * 0.78);
    ctx.lineTo(bladeW, size * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fuller (central channel) with depth
    ctx.strokeStyle = "rgba(60, 60, 80, 0.5)";
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.04);
    ctx.lineTo(0, -bladeLength * 0.65);
    ctx.stroke();
    // Fuller highlight edge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.004, size * 0.04);
    ctx.lineTo(-size * 0.004, -bladeLength * 0.64);
    ctx.stroke();

    // Blade edge highlights — sharp bevels
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(-bladeW * 0.85, size * 0.04);
    ctx.lineTo(-bladeW * 0.92, -bladeLength * 0.76);
    ctx.lineTo(0, -bladeLength * 0.98);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bladeW * 0.85, size * 0.04);
    ctx.lineTo(bladeW * 0.92, -bladeLength * 0.76);
    ctx.lineTo(0, -bladeLength * 0.98);
    ctx.stroke();

    // Blade dark edge — opposite side shadow
    ctx.strokeStyle = "rgba(40, 40, 60, 0.25)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(bladeW * 0.6, size * 0.03);
    ctx.lineTo(bladeW * 0.7, -bladeLength * 0.6);
    ctx.stroke();

    // Blade runes (tier 3+)
    if (tier >= 3) {
      const runeGlow = 0.25 + Math.sin(time * 4) * 0.15 + attackDrive * 0.45;
      ctx.fillStyle = `${palette.glow}${runeGlow})`;
      const runeCount = tier >= 4 ? 5 : 3;
      for (let i = 0; i < runeCount; i++) {
        const runeY = -size * 0.04 - i * bladeLength * 0.17;
        // Diamond-shaped rune marks instead of rectangles
        ctx.beginPath();
        ctx.moveTo(0, runeY - size * 0.022);
        ctx.lineTo(-size * 0.012, runeY);
        ctx.lineTo(0, runeY + size * 0.022);
        ctx.lineTo(size * 0.012, runeY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Swing trail — dual layered
    if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
      const trailAlpha = Math.sin(((attackPhase - 0.15) / 0.7) * Math.PI) * 0.6;
      ctx.strokeStyle = `${palette.glow}${trailAlpha})`;
      ctx.lineWidth = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength);
      ctx.quadraticCurveTo(
        size * 0.32,
        -bladeLength * 0.6,
        size * 0.28,
        -size * 0.08,
      );
      ctx.stroke();
      // Secondary shimmer trail
      ctx.strokeStyle = `rgba(255, 255, 255, ${trailAlpha * 0.35})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength);
      ctx.quadraticCurveTo(
        size * 0.36,
        -bladeLength * 0.65,
        size * 0.32,
        -size * 0.12,
      );
      ctx.stroke();
    }
  }
  ctx.restore();

  // ── Lancer back shield (tier 5) ──
  if (tier >= 5) {
    ctx.save();
    ctx.translate(x - size * 0.34, y + size * 0.06 + breathe * 0.45);
    ctx.rotate(-0.5 + stride * 0.02);

    const lancerShieldGrad = ctx.createLinearGradient(
      -size * 0.09,
      -size * 0.17,
      size * 0.09,
      size * 0.15,
    );
    lancerShieldGrad.addColorStop(0, palette.armorDark);
    lancerShieldGrad.addColorStop(0.45, palette.armorMid);
    lancerShieldGrad.addColorStop(1, palette.armorDark);
    ctx.fillStyle = lancerShieldGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.2);
    ctx.lineTo(-size * 0.1, -size * 0.12);
    ctx.lineTo(-size * 0.08, size * 0.12);
    ctx.lineTo(0, size * 0.18);
    ctx.lineTo(size * 0.08, size * 0.12);
    ctx.lineTo(size * 0.1, -size * 0.12);
    ctx.closePath();
    ctx.fill();

    const shieldRimColor = tier >= 6 ? "rgba(210, 220, 255, 0.9)" : "rgba(255, 233, 171, 0.85)";
    ctx.strokeStyle = shieldRimColor;
    ctx.lineWidth = 1.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.18);
    ctx.lineTo(-size * 0.085, -size * 0.11);
    ctx.lineTo(-size * 0.068, size * 0.11);
    ctx.lineTo(0, size * 0.155);
    ctx.lineTo(size * 0.068, size * 0.11);
    ctx.lineTo(size * 0.085, -size * 0.11);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = palette.trim;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.02,
      -size * 0.08,
      size * 0.04,
      size * 0.18,
      size * 0.01,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.05,
      -size * 0.015,
      size * 0.1,
      size * 0.03,
      size * 0.01,
    );
    ctx.fill();

    // Shield center jewel (tier 6)
    if (tier >= 6) {
      const sJewelPulse = 0.5 + Math.sin(time * 4.1) * 0.3;
      ctx.save();
      ctx.shadowColor = "rgba(180, 200, 255, 0.8)";
      ctx.shadowBlur = 4 * zoom;
      const sJGrad = ctx.createRadialGradient(-size * 0.005, -size * 0.01, 0, 0, 0, size * 0.03);
      sJGrad.addColorStop(0, "#ffffff");
      sJGrad.addColorStop(0.4, "rgba(180, 200, 255, 0.9)");
      sJGrad.addColorStop(1, "rgba(100, 110, 160, 0.5)");
      ctx.fillStyle = sJGrad;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.03);
      ctx.lineTo(size * 0.02, 0);
      ctx.lineTo(0, size * 0.03);
      ctx.lineTo(-size * 0.02, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${sJewelPulse * 0.5})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // ── Heroic over-helm arcs (tier 4+) ──
  if (tier >= 4) {
    const headYOffset = size * 0.04;
    ctx.strokeStyle = `${palette.glow}${0.55})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.39 + breathe * 0.2 + headYOffset,
      size * 0.23,
      -2.5,
      -0.65,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.39 + breathe * 0.2 + headYOffset,
      size * 0.23,
      -2.5 + Math.PI,
      -0.65 + Math.PI,
    );
    ctx.stroke();
  }

  // ── Helmet (varies per troop) ──
  const helmY = y - size * 0.32 + breathe * 0.2;
  drawReinforcementHelmet(
    ctx,
    x,
    helmY,
    size,
    zoom,
    time,
    breathe,
    attackDrive,
    palette,
    helmet,
    tier,
  );

  // ── Helmet crown jewel (tier 6) ──
  if (tier >= 6) {
    const crownPulse = 0.65 + Math.sin(time * 3.8) * 0.2 + attackDrive * 0.15;
    ctx.save();
    ctx.shadowColor = "rgba(200, 210, 255, 0.9)";
    ctx.shadowBlur = (5 + Math.sin(time * 6) * 2) * zoom;
    const crownGrad = ctx.createRadialGradient(
      x - size * 0.01, helmY - size * 0.12, 0,
      x, helmY - size * 0.1, size * 0.03,
    );
    crownGrad.addColorStop(0, "#ffffff");
    crownGrad.addColorStop(0.35, "rgba(200, 215, 255, 0.95)");
    crownGrad.addColorStop(1, "rgba(120, 130, 180, 0.5)");
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(x, helmY - size * 0.16);
    ctx.lineTo(x + size * 0.025, helmY - size * 0.1);
    ctx.lineTo(x, helmY - size * 0.06);
    ctx.lineTo(x - size * 0.025, helmY - size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${crownPulse * 0.5})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    ctx.restore();
  }

  // Battle cry shockwave (during attack)
  if (isAttacking && attackPhase > 0.25 && attackPhase < 0.65) {
    const cryAlpha = Math.sin(((attackPhase - 0.25) / 0.4) * Math.PI) * 0.4;
    ctx.strokeStyle = `${palette.glow}${cryAlpha})`;
    ctx.lineWidth = 2 * zoom;
    for (let r = 1; r <= 2; r++) {
      ctx.beginPath();
      ctx.arc(x, helmY + size * 0.04, size * (0.2 + r * 0.1), -0.9, 0.9);
      ctx.stroke();
    }
  }

  const reinforcementFinishStyle =
    tier >= 5
      ? TROOP_MASTERWORK_STYLES.cavalry
      : tier >= 3
        ? TROOP_MASTERWORK_STYLES.elite
        : TROOP_MASTERWORK_STYLES.armored;
  drawTroopMasterworkFinish(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    reinforcementFinishStyle,
    { vanguard: tier >= 3 },
  );
  ctx.restore();
}
