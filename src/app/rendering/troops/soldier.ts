import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
} from "./troopHelpers";

export function drawSoldierTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
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
  const attackSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 1.8
    : 0;
  const attackLunge = isAttacking
    ? Math.sin(attackPhase * Math.PI) * size * 0.18
    : 0;
  const bodyTwist = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.25
    : Math.sin(time * 1.4) * 0.03;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  ctx.save();
  ctx.translate(attackLunge * 0.5, 0);
  ctx.rotate(bodyTwist);

  // === AMBIENT DUST PARTICLES (kicked up while moving/attacking) ===
  if (isAttacking || footTap > 0.5) {
    for (let d = 0; d < 4; d++) {
      const dustPhase = (time * 2 + d * 0.4) % 1;
      const dustX =
        x +
        (Math.random() - 0.5) * size * 0.6 +
        Math.sin(time * 3 + d) * size * 0.2;
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
  const capeAttackFlutter = isAttacking
    ? Math.sin(attackPhase * Math.PI * 4) * 0.3
    : Math.sin(time * 2.4) * 0.04;

  // Cape shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.08);
  ctx.quadraticCurveTo(
    x - size * 0.25 + capeWave1 * size - attackLunge * 0.3,
    y + size * 0.2,
    x -
      size * 0.18 +
      capeWave2 * size -
      attackLunge * 0.4 +
      capeAttackFlutter * size,
    y + size * 0.5,
  );
  ctx.lineTo(
    x + size * 0.12 + capeWave2 * size * 0.5 - attackLunge * 0.2,
    y + size * 0.48,
  );
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y + size * 0.1,
    x + size * 0.12,
    y - size * 0.08,
  );
  ctx.closePath();
  ctx.fill();

  // Main cape - deep Princeton orange-red
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y - size * 0.1,
    x - size * 0.15,
    y + size * 0.5,
  );
  capeGrad.addColorStop(0, "#7a2306");
  capeGrad.addColorStop(0.3, "#a92f0d");
  capeGrad.addColorStop(0.7, "#641607");
  capeGrad.addColorStop(1, "#341006");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.22 + capeWave1 * size - attackLunge * 0.25,
    y + size * 0.15,
    x -
      size * 0.15 +
      capeWave2 * size -
      attackLunge * 0.35 +
      capeAttackFlutter * size,
    y + size * 0.45,
  );
  ctx.lineTo(
    x + size * 0.1 + capeWave2 * size * 0.4 - attackLunge * 0.15,
    y + size * 0.43,
  );
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.08,
    x + size * 0.1,
    y - size * 0.1,
  );
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
    x -
      size * 0.15 +
      capeWave2 * size -
      attackLunge * 0.35 +
      capeAttackFlutter * size,
    y + size * 0.45,
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
    ctx.fillRect(
      -size * 0.07 + strip * size * 0.045,
      -size * 0.05,
      size * 0.035,
      size * 0.1,
    );
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
  const greaveGrad = ctx.createLinearGradient(
    -size * 0.04,
    size * 0.12,
    size * 0.04,
    size * 0.12,
  );
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
    ctx.fillRect(
      -size * 0.07 + strip * size * 0.045,
      -size * 0.05,
      size * 0.035,
      size * 0.1,
    );
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
  const greaveGrad2 = ctx.createLinearGradient(
    -size * 0.04,
    size * 0.12,
    size * 0.04,
    size * 0.12,
  );
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
  const chestGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y,
    x + size * 0.22,
    y,
  );
  chestGrad.addColorStop(0, "#b84c00");
  chestGrad.addColorStop(0.2, "#e05500");
  chestGrad.addColorStop(0.5, "#ff6600");
  chestGrad.addColorStop(0.8, "#e05500");
  chestGrad.addColorStop(1, "#b84c00");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.25, y - size * 0.1 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.22 + breathe * 0.3,
    x + size * 0.25,
    y - size * 0.1 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();

  // Segmented armor bands (lorica segmentata style)
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1.2 * zoom;
  for (let band = 0; band < 5; band++) {
    const bandY =
      y - size * 0.05 + band * size * 0.075 + breathe * (0.3 + band * 0.15);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.21, bandY);
    ctx.lineTo(x + size * 0.21, bandY);
    ctx.stroke();
  }

  // Metal highlight strips on bands
  ctx.strokeStyle = `rgba(255, 180, 100, ${0.15 + shimmer * 0.1})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let band = 0; band < 4; band++) {
    const bandY =
      y - size * 0.03 + band * size * 0.075 + breathe * (0.3 + band * 0.15);
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
  ctx.ellipse(
    x - size * 0.03,
    y + size * 0.05 + breathe * 0.5,
    size * 0.02,
    size * 0.015,
    -0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Shoulder guards (pauldrons) with rivets
  // Left pauldron
  const pauldronGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y - size * 0.05,
    x - size * 0.2,
    y + size * 0.05,
  );
  pauldronGrad.addColorStop(0, "#5a5a6a");
  pauldronGrad.addColorStop(0.4, "#8a8a9a");
  pauldronGrad.addColorStop(1, "#6a6a7a");
  ctx.fillStyle = pauldronGrad;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.26,
    y - size * 0.02 + breathe * 0.3,
    size * 0.1,
    size * 0.06,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Pauldron rivets
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.3,
    y - size * 0.02 + breathe * 0.3,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x - size * 0.22,
    y - size * 0.02 + breathe * 0.3,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Right pauldron
  const pauldronGrad2 = ctx.createLinearGradient(
    x + size * 0.2,
    y - size * 0.05,
    x + size * 0.35,
    y + size * 0.05,
  );
  pauldronGrad2.addColorStop(0, "#6a6a7a");
  pauldronGrad2.addColorStop(0.6, "#8a8a9a");
  pauldronGrad2.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = pauldronGrad2;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.26,
    y - size * 0.02 + breathe * 0.3,
    size * 0.1,
    size * 0.06,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.3,
    y - size * 0.02 + breathe * 0.3,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.22,
    y - size * 0.02 + breathe * 0.3,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === LEATHER BELT WITH POUCHES ===
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(
    x - size * 0.22,
    y + size * 0.24 + breathe,
    size * 0.44,
    size * 0.07,
  );
  // Belt buckle
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(
    x - size * 0.05,
    y + size * 0.25 + breathe,
    size * 0.1,
    size * 0.05,
  );
  ctx.fillStyle = `rgba(255, 220, 130, ${0.4 + shimmer * 0.3})`;
  ctx.fillRect(
    x - size * 0.04,
    y + size * 0.255 + breathe,
    size * 0.03,
    size * 0.035,
  );
  // Belt studs
  ctx.fillStyle = "#8a7020";
  for (let stud = 0; stud < 3; stud++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.15 + stud * size * 0.04,
      y + size * 0.275 + breathe,
      size * 0.012,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      x + size * 0.08 + stud * size * 0.04,
      y + size * 0.275 + breathe,
      size * 0.012,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  // Small pouch on belt
  ctx.fillStyle = "#5a4030";
  ctx.fillRect(
    x + size * 0.12,
    y + size * 0.26 + breathe,
    size * 0.06,
    size * 0.08,
  );
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(
    x + size * 0.12,
    y + size * 0.26 + breathe,
    size * 0.06,
    size * 0.02,
  );

  // === SHIELD ARM (thrusts forward during attack) ===
  const shieldX = x - size * 0.42 + (isAttacking ? attackLunge * 0.9 : 0);
  const shieldY =
    y + size * 0.08 - (isAttacking ? size * 0.12 * attackSwing : 0);

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
  ctx.rotate(
    isAttacking ? -0.35 - attackSwing * 0.35 : -0.25 + ambientSway * 0.1,
  );

  // Shield outer rim (bronze/gold)
  ctx.fillStyle = "#a08040";
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.2,
    -size * 0.22,
    size * 0.4,
    size * 0.38,
    size * 0.04,
  );
  ctx.fill();

  // Shield main body (red with gradient)
  const shieldBodyGrad = ctx.createLinearGradient(
    -size * 0.15,
    -size * 0.18,
    size * 0.15,
    size * 0.18,
  );
  shieldBodyGrad.addColorStop(0, "#8b1a1a");
  shieldBodyGrad.addColorStop(0.3, "#b32222");
  shieldBodyGrad.addColorStop(0.7, "#a01c1c");
  shieldBodyGrad.addColorStop(1, "#701515");
  ctx.fillStyle = shieldBodyGrad;
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.17,
    -size * 0.19,
    size * 0.34,
    size * 0.34,
    size * 0.025,
  );
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
  const armOriginX = x + size * 0.28;
  const armOriginY = y + size * 0.02;
  const armBaseSwing = isAttacking
    ? -1.4 + attackPhase * 2.8
    : 0.25 + stance * 0.025;
  const armSwing = resolveWeaponRotation(
    targetPos,
    armOriginX,
    armOriginY,
    armBaseSwing,
    Math.PI / 2,
    isAttacking ? 1.2 : 0.55,
    WEAPON_LIMITS.rightArm,
  );
  ctx.translate(armOriginX, armOriginY);
  ctx.rotate(armSwing);

  // Arm
  ctx.fillStyle = "#dbb896";
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.18);
  // Wrist guard
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.05);
  ctx.restore();

  // === MASTERWORK GLADIUS (deeper blade profile and richer materials) ===
  ctx.save();
  const swordBaseAngle = isAttacking
    ? -1.02 + attackPhase * 2.04
    : -0.24 + stance * 0.04;
  const swordX = x + size * 0.41 + (isAttacking ? attackLunge * 1.7 : 0);
  const swordY =
    y - size * 0.06 - (isAttacking ? size * 0.28 * (1 - attackPhase) : 0);
  const swordAngle = resolveWeaponRotation(
    targetPos,
    swordX,
    swordY,
    swordBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.45 : 0.7,
    WEAPON_LIMITS.rightMelee,
  );
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);

  const swordGlow = isAttacking
    ? 0.45 + attackIntensity * 0.35
    : 0.2 + shimmer * 0.15;

  // Grip and wrapping.
  const gripGrad = ctx.createLinearGradient(
    -size * 0.022,
    size * 0.035,
    size * 0.022,
    size * 0.18,
  );
  gripGrad.addColorStop(0, "#2d1f14");
  gripGrad.addColorStop(0.5, "#4d3728");
  gripGrad.addColorStop(1, "#24170f");
  ctx.fillStyle = gripGrad;
  ctx.fillRect(-size * 0.022, size * 0.035, size * 0.044, size * 0.14);
  ctx.strokeStyle = "#6d553f";
  ctx.lineWidth = 1.1 * zoom;
  for (let wrap = 0; wrap < 5; wrap++) {
    const wy = size * (0.05 + wrap * 0.028);
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, wy);
    ctx.lineTo(size * 0.02, wy + size * 0.011);
    ctx.stroke();
  }

  // Pommel and guard.
  const pommelGrad = ctx.createRadialGradient(
    -size * 0.008,
    size * 0.19,
    size * 0.003,
    0,
    size * 0.19,
    size * 0.032,
  );
  pommelGrad.addColorStop(0, "#ffe4a6");
  pommelGrad.addColorStop(0.5, "#d5a240");
  pommelGrad.addColorStop(1, "#8d6420");
  ctx.fillStyle = pommelGrad;
  ctx.beginPath();
  ctx.arc(0, size * 0.19, size * 0.028, 0, Math.PI * 2);
  ctx.fill();

  const guardGrad = ctx.createLinearGradient(
    -size * 0.055,
    size * 0.03,
    size * 0.055,
    size * 0.06,
  );
  guardGrad.addColorStop(0, "#8d5f1a");
  guardGrad.addColorStop(0.5, "#d6a847");
  guardGrad.addColorStop(1, "#8b5c16");
  ctx.fillStyle = guardGrad;
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.055,
    size * 0.028,
    size * 0.11,
    size * 0.03,
    size * 0.01,
  );
  ctx.fill();
  ctx.fillStyle = "#e3bf65";
  ctx.beginPath();
  ctx.arc(-size * 0.048, size * 0.043, size * 0.011, 0, Math.PI * 2);
  ctx.arc(size * 0.048, size * 0.043, size * 0.011, 0, Math.PI * 2);
  ctx.fill();

  // Blade core with fuller.
  const bladeLength = size * 0.45;
  const bladeWidth = size * 0.035;
  const bladeGrad = ctx.createLinearGradient(
    -bladeWidth,
    -bladeLength,
    bladeWidth,
    -bladeLength,
  );
  bladeGrad.addColorStop(0, "#8f97a5");
  bladeGrad.addColorStop(0.22, "#dbe4ef");
  bladeGrad.addColorStop(0.5, "#ffffff");
  bladeGrad.addColorStop(0.78, "#ced8e6");
  bladeGrad.addColorStop(1, "#7f8898");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, -bladeLength);
  ctx.lineTo(-bladeWidth - size * 0.005, -bladeLength * 0.86);
  ctx.lineTo(-bladeWidth, size * 0.02);
  ctx.lineTo(bladeWidth, size * 0.02);
  ctx.lineTo(bladeWidth + size * 0.005, -bladeLength * 0.86);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 + shimmer * 0.35})`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-bladeWidth + size * 0.004, size * 0.01);
  ctx.lineTo(-bladeWidth, -bladeLength * 0.82);
  ctx.lineTo(0, -bladeLength);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bladeWidth - size * 0.004, size * 0.01);
  ctx.lineTo(bladeWidth, -bladeLength * 0.82);
  ctx.lineTo(0, -bladeLength);
  ctx.stroke();

  // Fuller and etched runes.
  ctx.strokeStyle = "rgba(98, 108, 124, 0.45)";
  ctx.lineWidth = 1.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -bladeLength * 0.78);
  ctx.lineTo(0, -size * 0.005);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 183, 96, ${0.22 + swordGlow * 0.35})`;
  ctx.lineWidth = 0.9 * zoom;
  for (let rune = 0; rune < 3; rune++) {
    const runeY = -bladeLength * (0.63 - rune * 0.16);
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, runeY);
    ctx.lineTo(size * 0.01, runeY - size * 0.012);
    ctx.lineTo(size * 0.005, runeY + size * 0.01);
    ctx.stroke();
  }

  // Tip glint.
  ctx.fillStyle = `rgba(255,255,255,${0.72 + swordGlow * 0.28})`;
  ctx.beginPath();
  ctx.ellipse(
    0,
    -bladeLength * 0.92,
    size * 0.018,
    size * 0.05,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  if (isAttacking && attackPhase < 0.62) {
    const trailAlpha = 0.86 - attackPhase * 1.3;
    for (let trail = 0; trail < 3; trail++) {
      ctx.strokeStyle = `rgba(255, 224, 173, ${trailAlpha * (0.9 - trail * 0.25)})`;
      ctx.lineWidth = (4.2 - trail * 1.1) * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -bladeLength);
      ctx.quadraticCurveTo(
        -size * (0.1 + trail * 0.03),
        -size * 0.2,
        -size * (0.02 + trail * 0.05),
        size * 0.02,
      );
      ctx.stroke();
    }
    for (let sp = 0; sp < 5; sp++) {
      const sparkX =
        -size * 0.06 + Math.sin(time * 16 + sp * 1.3) * size * 0.11;
      const sparkY = -size * 0.24 - sp * size * 0.065;
      ctx.fillStyle = `rgba(255, 220, 145, ${trailAlpha * (0.85 - sp * 0.12)})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, size * 0.013, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // === HEAD ===
  // Rear neck guard (behind head, not over face)
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.32);
  ctx.quadraticCurveTo(
    x - size * 0.18,
    y - size * 0.25,
    x - size * 0.12,
    y - size * 0.15,
  );
  ctx.lineTo(x + size * 0.12, y - size * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.25,
    x + size * 0.14,
    y - size * 0.32,
  );
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = "#dbb896";
  ctx.fillRect(x - size * 0.05, y - size * 0.18, size * 0.1, size * 0.1);
  // Face
  ctx.beginPath();
  ctx.arc(x, y - size * 0.32, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // === DETAILED GALEA HELMET ===
  // Helmet base (bowl)
  const helmetGrad = ctx.createLinearGradient(
    x - size * 0.18,
    y - size * 0.5,
    x + size * 0.18,
    y - size * 0.3,
  );
  helmetGrad.addColorStop(0, "#5a5a6a");
  helmetGrad.addColorStop(0.3, "#8a8a9a");
  helmetGrad.addColorStop(0.6, "#7a7a8a");
  helmetGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = helmetGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.4,
    size * 0.17,
    size * 0.12,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.fill();

  // Helmet crown
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.48, x, y - size * 0.52);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.48,
    x + size * 0.17,
    y - size * 0.4,
  );
  ctx.fill();

  // Helmet crest holder
  ctx.fillStyle = "#6a6a7a";
  ctx.fillRect(x - size * 0.025, y - size * 0.52, size * 0.05, size * 0.14);

  // Front-closing cheek guards (wrap forward over most of the face)
  const cheekGuardGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y - size * 0.36,
    x + size * 0.2,
    y - size * 0.16,
  );
  cheekGuardGrad.addColorStop(0, "#5f6174");
  cheekGuardGrad.addColorStop(0.5, "#7f8298");
  cheekGuardGrad.addColorStop(1, "#4f5163");
  ctx.fillStyle = cheekGuardGrad;
  // Left cheek guard
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.36);
  ctx.lineTo(x - size * 0.215, y - size * 0.25);
  ctx.quadraticCurveTo(
    x - size * 0.18,
    y - size * 0.15,
    x - size * 0.03,
    y - size * 0.18,
  );
  ctx.lineTo(x - size * 0.045, y - size * 0.31);
  ctx.closePath();
  ctx.fill();
  // Right cheek guard
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.36);
  ctx.lineTo(x + size * 0.215, y - size * 0.25);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.15,
    x + size * 0.03,
    y - size * 0.18,
  );
  ctx.lineTo(x + size * 0.045, y - size * 0.31);
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
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.46,
    size * 0.04,
    size * 0.025,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === EPIC HORSEHAIR PLUME (dynamic physics) ===
  const plumeWave =
    Math.sin(time * 5) * 1.2 + (isAttacking ? attackSwing * 2.5 : 0);
  const plumeStretch = isAttacking ? 1.1 : 1;

  // Plume shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.52);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const px =
      x +
      size * 0.02 +
      (t - 0.5) * size * 0.28 * plumeStretch +
      plumeWave * 2.5 * (1 - t);
    const py =
      y -
      size * 0.52 -
      t * size * 0.38 -
      Math.sin(t * Math.PI) * size * 0.15 +
      size * 0.02;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 9; i >= 0; i--) {
    const t = i / 9;
    const px =
      x +
      size * 0.02 +
      (t - 0.5) * size * 0.28 * plumeStretch +
      plumeWave * 2.5 * (1 - t);
    const py =
      y -
      size * 0.52 -
      t * size * 0.32 -
      Math.sin(t * Math.PI) * size * 0.1 +
      size * 0.02;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Outer plume layer (darker orange)
  const plumeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.5,
    x,
    y - size * 0.9,
  );
  plumeGrad.addColorStop(0, "#cc4400");
  plumeGrad.addColorStop(0.5, "#ff5500");
  plumeGrad.addColorStop(1, "#ff7722");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const waveOffset = Math.sin(time * 6 + t * 3) * 0.5;
    const px =
      x +
      (t - 0.5) * size * 0.26 * plumeStretch +
      plumeWave * 2.2 * (1 - t) +
      waveOffset;
    const py =
      y - size * 0.52 - t * size * 0.38 - Math.sin(t * Math.PI) * size * 0.14;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 9; i >= 0; i--) {
    const t = i / 9;
    const waveOffset = Math.sin(time * 6 + t * 3) * 0.3;
    const px =
      x +
      (t - 0.5) * size * 0.26 * plumeStretch +
      plumeWave * 2.2 * (1 - t) +
      waveOffset;
    const py =
      y - size * 0.52 - t * size * 0.32 - Math.sin(t * Math.PI) * size * 0.1;
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
    const px =
      x +
      (t - 0.5) * size * 0.18 * plumeStretch +
      plumeWave * 1.8 * (1 - t) +
      waveOffset;
    const py =
      y - size * 0.55 - t * size * 0.32 - Math.sin(t * Math.PI) * size * 0.1;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 7; i >= 0; i--) {
    const t = i / 7;
    const waveOffset = Math.sin(time * 7 + t * 2.5) * 0.3;
    const px =
      x +
      (t - 0.5) * size * 0.18 * plumeStretch +
      plumeWave * 1.8 * (1 - t) +
      waveOffset;
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
    const py =
      y - size * 0.58 - t * size * 0.25 - Math.sin(t * Math.PI) * size * 0.06;
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
    const fx =
      x +
      (fiberT - 0.5) * size * 0.3 +
      plumeWave * 2 * (1 - fiberT) +
      Math.sin(time * 8 + f) * 2;
    const fy = y - size * 0.55 - fiberT * size * 0.35 - fiberPhase * size * 0.1;
    const fiberAlpha = (1 - fiberPhase) * 0.6;
    ctx.fillStyle = `rgba(255, 136, 68, ${fiberAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      fx,
      fy,
      size * 0.008,
      size * 0.02,
      plumeWave * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === FACE DETAILS ===
  // Eyes - determined look
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.055,
    y - size * 0.33,
    size * 0.028,
    size * (isAttacking ? 0.012 : 0.022),
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.055,
    y - size * 0.33,
    size * 0.028,
    size * (isAttacking ? 0.012 : 0.022),
    0,
    0,
    Math.PI * 2,
  );
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
  ctx.quadraticCurveTo(
    x - size * 0.055,
    y - size * (0.4 + browAnger),
    x - size * 0.02,
    y - size * 0.38,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * (0.37 - browAnger));
  ctx.quadraticCurveTo(
    x + size * 0.055,
    y - size * (0.4 + browAnger),
    x + size * 0.02,
    y - size * 0.38,
  );
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
    ctx.ellipse(
      x,
      y - size * 0.22,
      size * 0.045,
      size * 0.035 * (1 + attackPhase * 0.6),
      0,
      0,
      Math.PI * 2,
    );
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

  // Face guard overlay keeps the cheek guards visibly forward-facing.
  ctx.fillStyle = "rgba(87, 91, 109, 0.93)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.052, y - size * 0.31);
  ctx.lineTo(x - size * 0.038, y - size * 0.17);
  ctx.lineTo(x + size * 0.038, y - size * 0.17);
  ctx.lineTo(x + size * 0.052, y - size * 0.31);
  ctx.closePath();
  ctx.fill();

  // Eye slit and vent holes.
  ctx.fillStyle = "#12131d";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.062,
    y - size * 0.33,
    size * 0.124,
    size * 0.028,
    size * 0.008,
  );
  ctx.fill();
  ctx.fillStyle = "#2a2d3f";
  for (let vent = -1; vent <= 1; vent++) {
    ctx.beginPath();
    ctx.arc(
      x + vent * size * 0.02,
      y - size * 0.235,
      size * 0.006,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
  drawTroopMasterworkFinish(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    TROOP_MASTERWORK_STYLES.soldier,
    { vanguard: true },
  );
}
