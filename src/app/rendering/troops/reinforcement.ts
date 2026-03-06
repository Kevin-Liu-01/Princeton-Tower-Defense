import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
} from "./troopHelpers";

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
) {
  const tier = Math.max(0, Math.min(5, Math.floor(tierInput)));
  const isAttacking = attackPhase > 0;
  const isLancerTier = tier >= 5;
  const breathe = Math.sin(time * 2.35) * 0.6;
  const stride = Math.sin(time * 3.1) * 0.8;
  const attackDrive = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.25) * 1.8
    : 0;
  const headYOffset = size * 0.04;
  const attackBodyOffsetX = isAttacking ? attackDrive * size * 0.09 : 0;
  const attackBodyOffsetY = isAttacking ? -attackDrive * size * 0.04 : 0;

  const palettes = [
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
  ] as const;
  const palette = palettes[tier];

  // Tier aura
  const auraStrength = Math.min(0.88, 0.2 + tier * 0.08 + attackDrive * 0.25);
  const auraPulse = 0.86 + Math.sin(time * 3.7) * 0.14;
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.08,
    size * 0.08,
    x,
    y + size * 0.08,
    size * 0.74,
  );
  auraGrad.addColorStop(0, `${palette.glow}${auraStrength * auraPulse})`);
  auraGrad.addColorStop(0.5, `${palette.glow}${auraStrength * 0.35})`);
  auraGrad.addColorStop(1, `${palette.glow}0)`);
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.65, size * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  // Keep body parts, helm lines, and head in the same attack translation.
  ctx.save();
  ctx.translate(attackBodyOffsetX, attackBodyOffsetY);

  // Cape back
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

  // Legs
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.09, y + size * 0.3 + breathe);
    ctx.rotate(side * (-0.08 + stride * 0.02));
    const legGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
    legGrad.addColorStop(0, palette.armorDark);
    legGrad.addColorStop(0.45, palette.armorMid);
    legGrad.addColorStop(1, palette.armorDark);
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.24);

    ctx.fillStyle = palette.armorLight;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.065,
      size * 0.11,
      size * 0.13,
      size * 0.06,
      size * 0.025,
    );
    ctx.fill();

    ctx.fillStyle = "#2a2335";
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.075,
      size * 0.2,
      size * 0.15,
      size * 0.1,
      size * 0.025,
    );
    ctx.fill();
    ctx.restore();
  }

  // Torso
  const chestGrad = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.22,
    x + size * 0.24,
    y + size * 0.28,
  );
  chestGrad.addColorStop(0, palette.armorDark);
  chestGrad.addColorStop(0.45, palette.armorMid);
  chestGrad.addColorStop(0.85, palette.armorLight);
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

  // Torso trim by tier
  ctx.strokeStyle = palette.trim;
  ctx.lineWidth = (1.4 + tier * 0.16) * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.02 + breathe);
  ctx.lineTo(x + size * 0.16, y - size * 0.02 + breathe);
  ctx.stroke();

  if (tier >= 1) {
    ctx.fillStyle = "rgba(235, 225, 205, 0.28)";
    for (let i = 0; i < 4; i++) {
      const segX = x - size * 0.14 + i * size * 0.09;
      ctx.beginPath();
      ctx.roundRect(
        segX,
        y + size * 0.08 + breathe,
        size * 0.06,
        size * 0.09,
        size * 0.015,
      );
      ctx.fill();
    }
  }

  if (tier >= 2) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = palette.armorLight;
      ctx.beginPath();
      ctx.ellipse(
        x + side * size * 0.29,
        y - size * 0.07 + breathe * 0.4,
        size * 0.12,
        size * 0.09,
        side * 0.28,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = palette.trim;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.31, y - size * 0.14 + breathe * 0.4);
      ctx.lineTo(x + side * size * 0.38, y - size * 0.08 + breathe * 0.4);
      ctx.lineTo(x + side * size * 0.3, y - size * 0.02 + breathe * 0.4);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (tier >= 3) {
    ctx.strokeStyle = `${palette.glow}${0.5 + attackDrive * 0.35})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.09 + breathe, size * 0.06, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (tier >= 4) {
    ctx.fillStyle = `${palette.glow}${0.35 + attackDrive * 0.3})`;
    for (let i = 0; i < 2; i++) {
      const sigilX = x + (i === 0 ? -1 : 1) * size * 0.09;
      ctx.beginPath();
      ctx.arc(sigilX, y - size * 0.02 + breathe, size * 0.018, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (tier >= 5) {
    // Scale mantle to signal elite lancer upgrade.
    ctx.strokeStyle = "rgba(255, 234, 171, 0.85)";
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, y - size * 0.16 + breathe * 0.4);
    ctx.lineTo(x - size * 0.08, y - size * 0.26 + breathe * 0.4);
    ctx.lineTo(x + size * 0.08, y - size * 0.26 + breathe * 0.4);
    ctx.lineTo(x + size * 0.2, y - size * 0.16 + breathe * 0.4);
    ctx.stroke();
  }

  // Left arm and shield
  ctx.save();
  ctx.translate(x - size * 0.28, y + size * 0.03 + breathe * 0.5);
  ctx.rotate(-0.24);
  ctx.fillStyle = palette.armorMid;
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.23);
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(-size * 0.065, size * 0.16, size * 0.13, size * 0.1);
  ctx.restore();

  if (!isLancerTier) {
    ctx.save();
    ctx.translate(x - size * 0.36, y + size * 0.07 + breathe * 0.6);
    ctx.rotate(-0.42 + stride * 0.03);
    const shieldGrad = ctx.createLinearGradient(
      -size * 0.08,
      -size * 0.18,
      size * 0.08,
      size * 0.16,
    );
    shieldGrad.addColorStop(0, palette.armorDark);
    shieldGrad.addColorStop(0.5, palette.armorMid);
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
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.14);
    ctx.lineTo(0, size * 0.13);
    ctx.moveTo(-size * 0.05, -size * 0.02);
    ctx.lineTo(size * 0.05, -size * 0.02);
    ctx.stroke();
    ctx.restore();
  }

  // Right arm
  ctx.save();
  const armBaseAngle = isLancerTier
    ? isAttacking
      ? -1.18 + attackPhase * 2.2
      : -0.46 + stride * 0.05
    : isAttacking
      ? -1.25 + attackPhase * 2.9
      : 0.18 + stride * 0.04;
  const armX = x + size * 0.29 + (isAttacking ? attackSwing * size * 0.08 : 0);
  const armY = y + size * 0.02 + breathe * 0.5;
  const armAngle = resolveWeaponRotation(
    targetPos,
    armX,
    armY,
    armBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.0 : 0.58,
  );
  ctx.translate(armX, armY);
  ctx.rotate(armAngle);
  ctx.fillStyle = palette.armorMid;
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.23);
  ctx.fillStyle = palette.armorLight;
  ctx.fillRect(-size * 0.065, size * 0.16, size * 0.13, size * 0.09);
  ctx.restore();

  // Weapon
  ctx.save();
  if (isLancerTier) {
    const spearBaseAngle = isAttacking
      ? -1.18 + attackPhase * 2.4
      : -0.68 + stride * 0.05;
    const spearX = x + size * 0.38 + attackDrive * size * 0.12;
    const spearY = y - size * 0.1 + breathe * 0.45 - attackDrive * size * 0.1;
    const spearAngle = resolveWeaponRotation(
      targetPos,
      spearX,
      spearY,
      spearBaseAngle,
      Math.PI / 2,
      isAttacking ? 1.28 : 0.72,
      WEAPON_LIMITS.rightPole,
    );
    ctx.translate(spearX, spearY);
    ctx.rotate(spearAngle);

    ctx.fillStyle = "#5a3a1b";
    ctx.fillRect(-size * 0.03, -size * 0.66, size * 0.06, size * 1.2);

    ctx.fillStyle = palette.trim;
    ctx.fillRect(-size * 0.042, -size * 0.08, size * 0.084, size * 0.12);

    const tipGrad = ctx.createLinearGradient(
      -size * 0.06,
      -size * 0.86,
      size * 0.06,
      -size * 0.62,
    );
    tipGrad.addColorStop(0, "#c8aa5a");
    tipGrad.addColorStop(0.5, "#fff0c4");
    tipGrad.addColorStop(1, "#a07d34");
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.96);
    ctx.lineTo(-size * 0.09, -size * 0.66);
    ctx.lineTo(size * 0.09, -size * 0.66);
    ctx.closePath();
    ctx.fill();

    // Pennant
    ctx.fillStyle = isAttacking ? "#ffd67a" : "#f0c15d";
    ctx.beginPath();
    ctx.moveTo(size * 0.03, -size * 0.36);
    ctx.lineTo(size * 0.26 + attackDrive * size * 0.12, -size * 0.31);
    ctx.lineTo(size * 0.13 + attackDrive * size * 0.06, -size * 0.23);
    ctx.lineTo(size * 0.27 + attackDrive * size * 0.08, -size * 0.14);
    ctx.lineTo(size * 0.03, -size * 0.11);
    ctx.closePath();
    ctx.fill();
  } else {
    const bladeLength = size * (0.56 + tier * 0.08);
    const swordBaseAngle = isAttacking
      ? -1.28 + attackPhase * 3.05
      : -0.32 + stride * 0.04;
    const swordX =
      x + size * 0.37 + (isAttacking ? attackSwing * size * 0.16 : 0);
    const swordY =
      y -
      size * 0.08 +
      breathe * 0.5 -
      (isAttacking ? attackDrive * size * 0.09 : 0);
    const swordAngle = resolveWeaponRotation(
      targetPos,
      swordX,
      swordY,
      swordBaseAngle,
      Math.PI / 2,
      isAttacking ? 1.38 : 0.78,
      WEAPON_LIMITS.rightMelee,
    );
    ctx.translate(swordX, swordY);
    ctx.rotate(swordAngle);
    ctx.fillStyle = "#2d1f16";
    ctx.fillRect(-size * 0.028, size * 0.08, size * 0.056, size * 0.2);
    ctx.fillStyle = palette.trim;
    ctx.fillRect(-size * 0.12, size * 0.05, size * 0.24, size * 0.05);
    ctx.fillStyle = palette.armorDark;
    ctx.beginPath();
    ctx.arc(-size * 0.12, size * 0.075, size * 0.028, 0, Math.PI * 2);
    ctx.arc(size * 0.12, size * 0.075, size * 0.028, 0, Math.PI * 2);
    ctx.fill();

    const bladeGrad = ctx.createLinearGradient(
      -size * 0.05,
      -bladeLength,
      size * 0.05,
      size * 0.08,
    );
    bladeGrad.addColorStop(0, "#f2f2f2");
    bladeGrad.addColorStop(0.35, "#d2d8e4");
    bladeGrad.addColorStop(0.75, "#a2aab8");
    bladeGrad.addColorStop(1, "#7a828f");
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, size * 0.06);
    ctx.lineTo(-size * 0.055, -bladeLength * 0.8);
    ctx.lineTo(0, -bladeLength);
    ctx.lineTo(size * 0.055, -bladeLength * 0.8);
    ctx.lineTo(size * 0.05, size * 0.06);
    ctx.closePath();
    ctx.fill();

    if (tier >= 4) {
      ctx.strokeStyle = `${palette.glow}${0.45 + attackDrive * 0.3})`;
      ctx.lineWidth = 1.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength * 0.88);
      ctx.lineTo(0, -bladeLength * 0.2);
      ctx.stroke();
    }
  }
  ctx.restore();

  if (tier >= 4) {
    // Heroic over-helm arcs: render behind the helmet/head.
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

  // Helmet
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.05,
    y - size * 0.43 + headYOffset,
    0,
    x,
    y - size * 0.38 + headYOffset,
    size * 0.2,
  );
  helmGrad.addColorStop(0, palette.armorLight);
  helmGrad.addColorStop(0.4, palette.armorMid);
  helmGrad.addColorStop(1, palette.armorDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.39 + breathe * 0.25 + headYOffset,
    size * 0.18,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = palette.armorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.44 + breathe * 0.2 + headYOffset);
  ctx.lineTo(x - size * 0.16, y - size * 0.33 + breathe * 0.2 + headYOffset);
  ctx.lineTo(x, y - size * 0.25 + breathe * 0.2 + headYOffset);
  ctx.lineTo(x + size * 0.16, y - size * 0.33 + breathe * 0.2 + headYOffset);
  ctx.lineTo(x + size * 0.14, y - size * 0.44 + breathe * 0.2 + headYOffset);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#18151f";
  ctx.fillRect(
    x - size * 0.12,
    y - size * 0.42 + breathe * 0.2 + headYOffset,
    size * 0.24,
    size * 0.048,
  );
  const eyeGlow = 0.58 + Math.sin(time * 3.8) * 0.2 + attackDrive * 0.35;
  ctx.fillStyle = `${palette.eye}${eyeGlow})`;
  ctx.shadowColor = palette.eyeShadow;
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.052,
    y - size * 0.4 + breathe * 0.2 + headYOffset,
    size * 0.018,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.052,
    y - size * 0.4 + breathe * 0.2 + headYOffset,
    size * 0.018,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Crest progression
  if (tier >= 1) {
    ctx.fillStyle = palette.trim;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.58 + breathe * 0.2 + headYOffset);
    ctx.lineTo(x - size * 0.022, y - size * 0.52 + breathe * 0.2 + headYOffset);
    ctx.lineTo(x + size * 0.022, y - size * 0.52 + breathe * 0.2 + headYOffset);
    ctx.closePath();
    ctx.fill();
  }

  if (tier >= 3) {
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = 1.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.54 + breathe * 0.2 + headYOffset);
    ctx.quadraticCurveTo(
      x + size * 0.14 + stride * 0.8,
      y - size * 0.66 + headYOffset,
      x + size * 0.1 + stride * 0.5,
      y - size * 0.46 + breathe * 0.2 + headYOffset,
    );
    ctx.stroke();
  }

  if (tier >= 5) {
    // Lancer-tier back shield (replaces spare left spear).
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

    // Rim + central motif for readability at small sizes.
    ctx.strokeStyle = "rgba(255, 233, 171, 0.85)";
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
    ctx.restore();
  }

  ctx.restore();

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
}
