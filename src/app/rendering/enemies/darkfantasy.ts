// Princeton Tower Defense - Dark Fantasy Enemy Sprite Functions (Redesigned)
// 10 fantasy themed enemies: skeletons, zombies, ghoul, dark knight, death knight.
// Layered construction with particle systems, ambient effects, and detailed rendering.

import { drawRadialAura } from "./helpers";
import { setShadowBlur, clearShadow } from "../performance";
import { ISO_Y_RATIO } from "../../constants/isometric";
import {
  drawGlowingEyes,
  drawShadowWisps,
  drawPoisonBubbles,
  drawOrbitingDebris,
  drawAnimatedTendril,
  drawFloatingPiece,
  drawPulsingGlowRings,
  drawShiftingSegments,
  drawEnergyArc,
  getBreathScale,
  getIdleSway,
  drawEmberSparks,
  drawArcaneSparkles,
} from "./animationHelpers";
import { drawPathArm, drawPathLegs, drawTatteredCloak, drawShoulderOverlay, drawBeltOverlay, drawGorget, drawArmorSkirt } from "./darkFantasyHelpers";

const TAU = Math.PI * 2;

// ============================================================================
// 1. SKELETON FOOTMAN — Weathered bone soldier with rusty sword & battered shield
// ============================================================================

export function drawSkeletonFootmanEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.8;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 5;
  const breath = getBreathScale(time, 1.5, 0.015);
  const sway = getIdleSway(time, 1.2, size * 0.004, size * 0.003);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.014;
  const rattle = Math.sin(time * 12) * size * 0.006 + (isAttacking ? Math.sin(time * 25) * size * 0.02 : 0);
  const jawRattle = Math.sin(time * 8) * size * 0.009 + (isAttacking ? Math.sin(time * 18) * size * 0.015 : 0);
  const armSwingAngle = Math.sin(walkPhase) * 0.18;

  const boneWhite = bodyColorLight;
  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const cx0 = x + sway.dx;
  const headY = y - size * 0.28 - bodyBob;

  // === BONE DUST PARTICLES ===
  for (let i = 0; i < 5; i++) {
    const seed = i * 1.618;
    const phase = (time * 0.8 + seed) % 1;
    const dustX = cx0 + Math.sin(seed * 7.3) * size * 0.25;
    const dustY = y + size * 0.5 - phase * size * 0.6;
    const dustAlpha = (1 - phase) * 0.25;
    const dustR = size * 0.012 * (1 - phase * 0.5) * zoom;
    ctx.globalAlpha = dustAlpha;
    ctx.fillStyle = "#c8b89a";
    ctx.beginPath();
    ctx.arc(dustX, dustY, dustR, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === DUST PUFFS ON FOOTFALL ===
  const leftFootDown = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rightFootDown = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  for (const [footDown, footX] of [[leftFootDown, cx0 - size * 0.12], [rightFootDown, cx0 + size * 0.12]] as [number, number][]) {
    if (footDown > 0.75) {
      const intensity = (footDown - 0.75) * 4;
      ctx.fillStyle = `rgba(160, 140, 110, ${intensity * 0.35})`;
      for (let d = 0; d < 4; d++) {
        ctx.beginPath();
        ctx.arc(footX + (d - 1.5) * size * 0.04, y + size * 0.53, size * 0.013 * intensity, 0, TAU);
        ctx.fill();
      }
    }
  }

  // === SHADOW WISPS (subtle undead aura) ===
  drawShadowWisps(ctx, cx0, y, size * 0.5, time, zoom, {
    count: 3, speed: 0.8, color: "rgba(60, 40, 70, 0.5)", maxAlpha: 0.15, wispLength: 0.3,
  });

  // === BONE LEGS ===
  drawPathLegs(ctx, cx0 + rattle, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.28, width: 0.1, strideSpeed: 5, strideAmt: 0.3,
    color: boneMid, colorDark: boneDark, footColor: boneDark, footLen: 0.12,
    style: 'bone',
  });

  // === TATTERED WAIST CLOTH ===
  const clothGrad = ctx.createLinearGradient(cx0 - size * 0.15, 0, cx0 + size * 0.15, 0);
  clothGrad.addColorStop(0, "#5a4d3a");
  clothGrad.addColorStop(0.5, "#6b5c4a");
  clothGrad.addColorStop(1, "#4a3d2e");
  ctx.fillStyle = clothGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.15 + rattle, y + size * 0.11 - bodyBob);
  for (let i = 0; i <= 8; i++) {
    const cx2 = cx0 - size * 0.15 + i * size * 0.0375 + rattle;
    const windFlutter = Math.sin(time * 3.5 + i * 0.9) * size * 0.012;
    const cy2 = y + size * 0.23 - bodyBob + (i % 2) * size * 0.035 + windFlutter;
    ctx.lineTo(cx2, cy2);
  }
  ctx.lineTo(cx0 + size * 0.15 + rattle, y + size * 0.11 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Cloth stitching
  ctx.strokeStyle = "#3e3225";
  ctx.lineWidth = 0.7 * zoom;
  for (const [sx, ex] of [[-0.08, -0.06], [0.03, 0.05]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(cx0 + sx * size + rattle, y + size * 0.13 - bodyBob);
    ctx.lineTo(cx0 + ex * size + rattle, y + size * 0.2 - bodyBob);
    ctx.stroke();
  }

  // Cloth patches
  ctx.fillStyle = "#5e5040";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.04 + rattle, y + size * 0.17 - bodyBob, size * 0.025, size * 0.018, 0.3, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  // === RIBCAGE TORSO ===
  const torsoY = y - size * 0.1 - bodyBob;
  const torsoScale = breath;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(torsoScale, torsoScale);
  ctx.translate(-cx0, -torsoY);

  // Spine
  const spineGrad = ctx.createLinearGradient(0, torsoY - size * 0.15, 0, torsoY + size * 0.2);
  spineGrad.addColorStop(0, boneDark);
  spineGrad.addColorStop(0.5, boneMid);
  spineGrad.addColorStop(1, boneDark);
  ctx.fillStyle = spineGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.018 + rattle, torsoY - size * 0.18);
  ctx.lineTo(cx0 + size * 0.018 + rattle, torsoY - size * 0.18);
  ctx.lineTo(cx0 + size * 0.015 + rattle, torsoY + size * 0.2);
  ctx.lineTo(cx0 - size * 0.015 + rattle, torsoY + size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Vertebrae bumps
  for (let v = 0; v < 6; v++) {
    const vy = torsoY - size * 0.15 + v * size * 0.06;
    ctx.fillStyle = boneWhite;
    ctx.beginPath();
    ctx.ellipse(cx0 + rattle, vy, size * 0.022, size * 0.012, 0, 0, TAU);
    ctx.fill();
  }

  // Ribs (6 pairs with gradients)
  for (let r = 0; r < 6; r++) {
    const ry = torsoY - size * 0.14 + r * size * 0.05;
    const ribW = size * (0.12 - r * 0.008);
    const ribCurve = size * 0.04 + r * size * 0.005;
    const ribThick = size * 0.014 - r * 0.001;

    for (const side of [-1, 1]) {
      const ribGrad = ctx.createLinearGradient(cx0, ry, cx0 + side * ribW, ry + ribCurve);
      ribGrad.addColorStop(0, boneWhite);
      ribGrad.addColorStop(0.5, boneMid);
      ribGrad.addColorStop(1, boneDark);
      ctx.strokeStyle = ribGrad as unknown as string;
      ctx.lineWidth = ribThick;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx0 + rattle, ry);
      ctx.quadraticCurveTo(cx0 + side * ribW * 0.7 + rattle, ry - size * 0.015, cx0 + side * ribW + rattle, ry + ribCurve);
      ctx.stroke();
    }
  }

  // Rib highlight
  ctx.strokeStyle = boneWhite;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = size * 0.006;
  for (let r = 0; r < 4; r++) {
    const ry = torsoY - size * 0.13 + r * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx0 + size * 0.03 + rattle, ry + size * 0.003);
    ctx.lineTo(cx0 + size * 0.07 + rattle, ry + size * 0.02);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap = "butt";

  // Sternum
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.015 + rattle, torsoY - size * 0.16);
  ctx.lineTo(cx0 + size * 0.015 + rattle, torsoY - size * 0.16);
  ctx.lineTo(cx0 + size * 0.01 + rattle, torsoY - size * 0.06);
  ctx.lineTo(cx0 - size * 0.01 + rattle, torsoY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Clavicles
  for (const side of [-1, 1]) {
    ctx.strokeStyle = boneMid;
    ctx.lineWidth = size * 0.018;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx0 + rattle, torsoY - size * 0.17);
    ctx.quadraticCurveTo(cx0 + side * size * 0.08 + rattle, torsoY - size * 0.2, cx0 + side * size * 0.14 + rattle, torsoY - size * 0.16);
    ctx.stroke();
  }
  ctx.lineCap = "butt";

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, boneMid, boneDark, 'tattered');
  }
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.08, size, size * 0.14, boneDark, "#3e3225", "#6a5a4a");

  // === SHIELD ARM (left side) ===
  const shieldX = cx0 - size * 0.22;
  const shieldY = y - size * 0.05 - bodyBob;
  const shieldSwing = -armSwingAngle * 0.4 + (isAttacking ? -Math.sin(attackPhase * Math.PI) * 0.25 : 0);
  const armLen = size * 0.16;

  drawPathArm(ctx, cx0 - size * 0.14 + rattle, torsoY - size * 0.08, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.27, foreLen: 0.22,
    shoulderAngle: shieldSwing - 0.15,
    elbowBend: 0.7,
    elbowAngle: 0.3 + (isAttacking ? -0.2 : 0),
    style: 'bone',
    onWeapon: (ctx) => {
      // Shield
      const shW = size * 0.17;
      const shH = size * 0.23;
      const shieldGrad = ctx.createLinearGradient(-shW, -shH * 0.3, shW, shH * 0.3);
      shieldGrad.addColorStop(0, "#6a5740");
      shieldGrad.addColorStop(0.3, "#8b7355");
      shieldGrad.addColorStop(0.7, "#7a6348");
      shieldGrad.addColorStop(1, "#5a4a35");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.moveTo(0, -shH);
      ctx.quadraticCurveTo(shW, -shH * 0.7, shW, 0);
      ctx.quadraticCurveTo(shW * 0.8, shH * 0.7, 0, shH);
      ctx.quadraticCurveTo(-shW * 0.8, shH * 0.7, -shW, 0);
      ctx.quadraticCurveTo(-shW, -shH * 0.7, 0, -shH);
      ctx.closePath();
      ctx.fill();

      // Shield rim
      ctx.strokeStyle = "#4a3828";
      ctx.lineWidth = size * 0.016;
      ctx.stroke();

      // Shield boss (center)
      const bossGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.052);
      bossGrad.addColorStop(0, "#9a8a70");
      bossGrad.addColorStop(0.5, "#706050");
      bossGrad.addColorStop(1, "#4a3828");
      ctx.fillStyle = bossGrad;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.052, 0, TAU);
      ctx.fill();

      // Wood grain lines
      ctx.strokeStyle = "rgba(60, 45, 25, 0.3)";
      ctx.lineWidth = 0.5 * zoom;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(-shW * 0.7 + g * shW * 0.4, -shH * 0.6);
        ctx.lineTo(-shW * 0.6 + g * shW * 0.4, shH * 0.5);
        ctx.stroke();
      }

      // Battle damage - gash marks
      ctx.strokeStyle = "#3e2e1a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(-shW * 0.3, -shH * 0.4);
      ctx.lineTo(shW * 0.1, -shH * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shW * 0.2, shH * 0.1);
      ctx.lineTo(shW * 0.5, shH * 0.35);
      ctx.stroke();

      // Splintered edge
      ctx.fillStyle = "#8b7355";
      ctx.beginPath();
      ctx.moveTo(shW * 0.7, -shH * 0.2);
      ctx.lineTo(shW * 1.05, -shH * 0.15);
      ctx.lineTo(shW * 0.8, -shH * 0.05);
      ctx.closePath();
      ctx.fill();
    },
  });

  // === SWORD ARM (right side) ===
  const swordSwing = armSwingAngle + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.8 : 0);
  const foreLen = armLen * 0.8;

  drawPathArm(ctx, cx0 + size * 0.14 + rattle, torsoY - size * 0.08, size, time, zoom, 1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.27, foreLen: 0.22,
    shoulderAngle: swordSwing + 0.2,
    elbowBend: 0.5,
    elbowAngle: 0.35 + (isAttacking ? -0.5 : 0),
    style: 'bone',
    onWeapon: (ctx) => {
      // Sword
      const swordLen = size * 0.35;
      const bladeW = size * 0.033;
      const swordGrad = ctx.createLinearGradient(-bladeW, 0, bladeW, 0);
      swordGrad.addColorStop(0, "#8a7a6a");
      swordGrad.addColorStop(0.3, "#b0a090");
      swordGrad.addColorStop(0.5, "#c8b8a8");
      swordGrad.addColorStop(0.7, "#b0a090");
      swordGrad.addColorStop(1, "#8a7a6a");
      ctx.fillStyle = swordGrad;
      ctx.beginPath();
      ctx.moveTo(-bladeW, foreLen);
      ctx.lineTo(-bladeW * 0.3, foreLen + swordLen);
      ctx.lineTo(bladeW * 0.3, foreLen + swordLen);
      ctx.lineTo(bladeW, foreLen);
      ctx.closePath();
      ctx.fill();

      // Blade edge highlight
      ctx.strokeStyle = "rgba(200, 190, 175, 0.4)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bladeW * 0.5, foreLen + swordLen * 0.0625);
      ctx.lineTo(bladeW * 0.15, foreLen + swordLen * 0.9);
      ctx.stroke();

      // Rust patches
      const rustColor = "rgba(140, 80, 40, 0.5)";
      ctx.fillStyle = rustColor;
      ctx.beginPath();
      ctx.ellipse(-bladeW * 0.3, foreLen + swordLen * 0.3, size * 0.015, size * 0.025, 0.4, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(bladeW * 0.2, foreLen + swordLen * 0.6, size * 0.012, size * 0.02, -0.3, 0, TAU);
      ctx.fill();

      // Corrosion drip from rust
      ctx.fillStyle = "rgba(120, 70, 30, 0.4)";
      const dripPhase = (time * 0.5) % 1;
      ctx.beginPath();
      ctx.arc(-bladeW * 0.3, foreLen + swordLen * 0.3 + dripPhase * size * 0.06, size * 0.005 * (1 - dripPhase), 0, TAU);
      ctx.fill();

      // Crossguard — curved with finials
      const cgY = foreLen * 0.95;
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.moveTo(-size * 0.06, cgY + size * 0.014);
      ctx.quadraticCurveTo(-size * 0.065, cgY, -size * 0.06, cgY - size * 0.005);
      ctx.lineTo(size * 0.06, cgY - size * 0.005);
      ctx.quadraticCurveTo(size * 0.065, cgY, size * 0.06, cgY + size * 0.014);
      ctx.quadraticCurveTo(size * 0.03, cgY + size * 0.022, 0, cgY + size * 0.025);
      ctx.quadraticCurveTo(-size * 0.03, cgY + size * 0.022, -size * 0.06, cgY + size * 0.014);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#706050";
      ctx.beginPath();
      ctx.moveTo(-size * 0.053, cgY + size * 0.005);
      ctx.quadraticCurveTo(0, cgY + size * 0.015, size * 0.053, cgY + size * 0.005);
      ctx.lineTo(size * 0.053, cgY - size * 0.002);
      ctx.quadraticCurveTo(0, cgY + size * 0.006, -size * 0.053, cgY - size * 0.002);
      ctx.closePath();
      ctx.fill();

      // Grip — tapered
      ctx.fillStyle = "#4a3828";
      ctx.beginPath();
      ctx.moveTo(-size * 0.017, foreLen * 0.8125);
      ctx.quadraticCurveTo(-size * 0.02, foreLen * 0.87, -size * 0.017, foreLen * 0.9325);
      ctx.lineTo(size * 0.017, foreLen * 0.9325);
      ctx.quadraticCurveTo(size * 0.02, foreLen * 0.87, size * 0.017, foreLen * 0.8125);
      ctx.closePath();
      ctx.fill();
      // Grip wrapping
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 0.8 * zoom;
      for (let w = 0; w < 4; w++) {
        const wy = foreLen * 0.8375 + w * size * 0.025;
        ctx.beginPath();
        ctx.moveTo(-size * 0.017, wy);
        ctx.lineTo(size * 0.017, wy + size * 0.01);
        ctx.stroke();
      }

      // Pommel
      ctx.fillStyle = "#6a5a4a";
      ctx.beginPath();
      ctx.arc(0, foreLen * 0.8, size * 0.024, 0, TAU);
      ctx.fill();
    },
  });

  // === SKULL HEAD ===
  const skullX = cx0 + rattle;
  const skullY = headY;

  // Cranium — proper skull shape with cheekbones, temples, and forehead
  const craniumGrad = ctx.createRadialGradient(skullX, skullY - size * 0.02, 0, skullX, skullY - size * 0.02, size * 0.12);
  craniumGrad.addColorStop(0, boneWhite);
  craniumGrad.addColorStop(0.6, boneMid);
  craniumGrad.addColorStop(1, boneDark);
  ctx.fillStyle = craniumGrad;
  ctx.beginPath();
  ctx.moveTo(skullX, skullY - size * 0.12);
  ctx.quadraticCurveTo(skullX + size * 0.06, skullY - size * 0.12, skullX + size * 0.09, skullY - size * 0.08);
  ctx.quadraticCurveTo(skullX + size * 0.1, skullY - size * 0.04, skullX + size * 0.095, skullY + size * 0.01);
  // Cheekbone protrusion
  ctx.quadraticCurveTo(skullX + size * 0.1, skullY + size * 0.04, skullX + size * 0.07, skullY + size * 0.06);
  ctx.quadraticCurveTo(skullX + size * 0.04, skullY + size * 0.075, skullX, skullY + size * 0.07);
  ctx.quadraticCurveTo(skullX - size * 0.04, skullY + size * 0.075, skullX - size * 0.07, skullY + size * 0.06);
  // Left cheekbone
  ctx.quadraticCurveTo(skullX - size * 0.1, skullY + size * 0.04, skullX - size * 0.095, skullY + size * 0.01);
  ctx.quadraticCurveTo(skullX - size * 0.1, skullY - size * 0.04, skullX - size * 0.09, skullY - size * 0.08);
  ctx.quadraticCurveTo(skullX - size * 0.06, skullY - size * 0.12, skullX, skullY - size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Skull suture lines — coronal and sagittal
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.globalAlpha = 0.3;
  // Sagittal suture (top center)
  ctx.beginPath();
  ctx.moveTo(skullX, skullY - size * 0.12);
  ctx.quadraticCurveTo(skullX + size * 0.005, skullY - size * 0.08, skullX - size * 0.003, skullY - size * 0.04);
  ctx.stroke();
  // Coronal suture (across top)
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.07, skullY - size * 0.06);
  ctx.quadraticCurveTo(skullX, skullY - size * 0.075, skullX + size * 0.07, skullY - size * 0.06);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Cranium crack — branching fracture
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(skullX + size * 0.02, skullY - size * 0.1);
  ctx.lineTo(skullX + size * 0.04, skullY - size * 0.06);
  ctx.lineTo(skullX + size * 0.025, skullY - size * 0.03);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(skullX + size * 0.04, skullY - size * 0.06);
  ctx.lineTo(skullX + size * 0.065, skullY - size * 0.045);
  ctx.lineTo(skullX + size * 0.08, skullY - size * 0.05);
  ctx.stroke();

  // Temporal bone depression — concave area on each side
  for (const side of [-1, 1]) {
    ctx.fillStyle = boneDark;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(skullX + side * size * 0.06, skullY - size * 0.04);
    ctx.quadraticCurveTo(skullX + side * size * 0.085, skullY, skullX + side * size * 0.07, skullY + size * 0.03);
    ctx.quadraticCurveTo(skullX + side * size * 0.06, skullY + size * 0.01, skullX + side * size * 0.06, skullY - size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Prominent brow ridge — angular, overhanging
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.08, skullY + size * 0.005);
  ctx.quadraticCurveTo(skullX - size * 0.05, skullY - size * 0.015, skullX, skullY - size * 0.008);
  ctx.quadraticCurveTo(skullX + size * 0.05, skullY - size * 0.015, skullX + size * 0.08, skullY + size * 0.005);
  ctx.quadraticCurveTo(skullX + size * 0.04, skullY + size * 0.025, skullX, skullY + size * 0.02);
  ctx.quadraticCurveTo(skullX - size * 0.04, skullY + size * 0.025, skullX - size * 0.08, skullY + size * 0.005);
  ctx.closePath();
  ctx.fill();

  // Nasal cavity — inverted heart shape
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(skullX, skullY + size * 0.028);
  ctx.quadraticCurveTo(skullX - size * 0.012, skullY + size * 0.035, skullX - size * 0.018, skullY + size * 0.05);
  ctx.quadraticCurveTo(skullX - size * 0.01, skullY + size * 0.065, skullX, skullY + size * 0.06);
  ctx.quadraticCurveTo(skullX + size * 0.01, skullY + size * 0.065, skullX + size * 0.018, skullY + size * 0.05);
  ctx.quadraticCurveTo(skullX + size * 0.012, skullY + size * 0.035, skullX, skullY + size * 0.028);
  ctx.closePath();
  ctx.fill();
  // Nasal septum ridge
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(skullX, skullY + size * 0.03);
  ctx.lineTo(skullX, skullY + size * 0.058);
  ctx.stroke();

  // Eye sockets — deep-set angular cavities
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(skullX + side * size * 0.02, skullY + size * 0.005);
    ctx.quadraticCurveTo(skullX + side * size * 0.04, skullY - size * 0.008, skullX + side * size * 0.06, skullY + size * 0.005);
    ctx.quadraticCurveTo(skullX + side * size * 0.065, skullY + size * 0.025, skullX + side * size * 0.05, skullY + size * 0.04);
    ctx.quadraticCurveTo(skullX + side * size * 0.035, skullY + size * 0.045, skullX + side * size * 0.025, skullY + size * 0.035);
    ctx.quadraticCurveTo(skullX + side * size * 0.018, skullY + size * 0.02, skullX + side * size * 0.02, skullY + size * 0.005);
    ctx.closePath();
    ctx.fill();
    // Socket rim highlight
    ctx.strokeStyle = boneMid;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(skullX + side * size * 0.025, skullY + size * 0.005);
    ctx.quadraticCurveTo(skullX + side * size * 0.04, skullY - size * 0.005, skullX + side * size * 0.055, skullY + size * 0.01);
    ctx.stroke();
  }

  // Soul-fire eye glow
  drawGlowingEyes(ctx, skullX, skullY + size * 0.015, size, time, {
    spacing: 0.04,
    eyeRadius: 0.018,
    pupilRadius: 0.008,
    irisColor: "#e8a030",
    pupilColor: "#fff8e0",
    glowColor: "rgba(230, 160, 50, 0.6)",
    glowRadius: 0.06,
    pulseSpeed: 4,
    lookSpeed: 1.5,
    lookAmount: 0.008,
  });

  // Jaw with teeth
  const jawY = skullY + size * 0.065 + jawRattle;
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.065, skullY + size * 0.04);
  ctx.quadraticCurveTo(skullX - size * 0.07, jawY, skullX - size * 0.04, jawY + size * 0.03);
  ctx.lineTo(skullX + size * 0.04, jawY + size * 0.03);
  ctx.quadraticCurveTo(skullX + size * 0.07, jawY, skullX + size * 0.065, skullY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Upper teeth
  ctx.fillStyle = boneWhite;
  for (let t = 0; t < 5; t++) {
    const tx = skullX - size * 0.035 + t * size * 0.018;
    ctx.beginPath();
    ctx.moveTo(tx, skullY + size * 0.055);
    ctx.lineTo(tx - size * 0.005, skullY + size * 0.075);
    ctx.lineTo(tx + size * 0.005, skullY + size * 0.075);
    ctx.closePath();
    ctx.fill();
  }

  // Lower teeth
  for (let t = 0; t < 4; t++) {
    const tx = skullX - size * 0.028 + t * size * 0.019;
    ctx.beginPath();
    ctx.moveTo(tx, jawY + size * 0.025);
    ctx.lineTo(tx - size * 0.005, jawY + size * 0.008);
    ctx.lineTo(tx + size * 0.005, jawY + size * 0.008);
    ctx.closePath();
    ctx.fill();
  }

  if (isAttacking) {
    const swingArc = (1 - attackPhase) * Math.PI * 1.2 - Math.PI * 0.3;
    const arcR = size * 0.35;
    ctx.strokeStyle = `rgba(200, 180, 140, ${attackPhase * 0.6})`;
    ctx.lineWidth = (2 + attackPhase * 3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx0 + size * 0.1, headY + size * 0.15, arcR, swingArc - 0.5, swingArc + 0.5);
    ctx.stroke();
    ctx.lineCap = "butt";

    if (attackPhase > 0.6) {
      const flashIntensity = (attackPhase - 0.6) * 2.5;
      for (let b = 0; b < 4; b++) {
        const bAngle = swingArc + (b - 1.5) * 0.3;
        const bDist = arcR * (0.9 + Math.sin(time * 15 + b) * 0.15);
        ctx.fillStyle = `rgba(220, 200, 160, ${flashIntensity * 0.4})`;
        ctx.beginPath();
        ctx.arc(
          cx0 + size * 0.1 + Math.cos(bAngle) * bDist,
          headY + size * 0.15 + Math.sin(bAngle) * bDist,
          size * 0.012, 0, TAU,
        );
        ctx.fill();
      }
    }
  }

  // === BONE RATTLE PARTICLES ===
  for (let br = 0; br < 4; br++) {
    const brSeed = br * 2.37;
    const brPhase = (time * 1.2 + brSeed) % 1;
    const brShake = Math.sin(time * 15 + br * 4.1) * size * 0.015;
    const brX = cx0 + Math.sin(brSeed * 5.3) * size * 0.18 + brShake;
    const brY = y - size * 0.05 + Math.sin(brSeed * 3.7) * size * 0.2 - brPhase * size * 0.12;
    const brAlpha = (1 - brPhase) * 0.4 * (brPhase < 0.1 ? brPhase * 10 : 1);
    const brW = size * 0.012 * (1 - brPhase * 0.4);
    const brH = size * 0.006 * (1 - brPhase * 0.3);
    ctx.save();
    ctx.translate(brX, brY);
    ctx.rotate(time * 3 + br * 1.5);
    ctx.globalAlpha = brAlpha;
    ctx.fillStyle = boneMid;
    ctx.fillRect(-brW, -brH, brW * 2, brH * 2);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // === SPEED AFTERIMAGE ===
  for (let ai = 1; ai <= 3; ai++) {
    const aiAlpha = 0.08 / ai;
    const aiOffset = ai * size * 0.06;
    ctx.globalAlpha = aiAlpha;
    ctx.fillStyle = boneDark;
    ctx.beginPath();
    ctx.ellipse(cx0 - aiOffset, y - size * 0.08, size * 0.1, size * 0.22, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx0 - aiOffset, headY, size * 0.07, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === GHOSTLY SOUL WISP (ribcage glow) ===
  const soulPulse = 0.35 + Math.sin(time * 2.5) * 0.2;
  const soulGrad = ctx.createRadialGradient(cx0, torsoY, 0, cx0, torsoY, size * 0.1);
  soulGrad.addColorStop(0, `rgba(180, 210, 255, ${soulPulse * 0.4})`);
  soulGrad.addColorStop(0.4, `rgba(140, 180, 255, ${soulPulse * 0.2})`);
  soulGrad.addColorStop(0.7, `rgba(100, 150, 230, ${soulPulse * 0.08})`);
  soulGrad.addColorStop(1, "rgba(80, 120, 200, 0)");
  ctx.fillStyle = soulGrad;
  ctx.beginPath();
  ctx.arc(cx0, torsoY, size * 0.1, 0, TAU);
  ctx.fill();

  // === DUST OF DECAY ===
  for (let dd = 0; dd < 4; dd++) {
    const ddSeed = dd * 1.93;
    const ddPhase = (time * 0.6 + ddSeed) % 1;
    const ddX = cx0 + (dd - 1.5) * size * 0.07 + Math.sin(time * 2 + dd) * size * 0.02;
    const ddY = y + size * 0.48 - ddPhase * size * 0.15;
    const ddAlpha = (1 - ddPhase) * 0.2 * (ddPhase < 0.15 ? ddPhase / 0.15 : 1);
    const ddR = size * 0.015 * (1 + ddPhase * 0.5);
    const ddGrad = ctx.createRadialGradient(ddX, ddY, 0, ddX, ddY, ddR);
    ddGrad.addColorStop(0, `rgba(140, 130, 110, ${ddAlpha})`);
    ddGrad.addColorStop(1, "rgba(120, 110, 90, 0)");
    ctx.fillStyle = ddGrad;
    ctx.beginPath();
    ctx.arc(ddX, ddY, ddR, 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// 2. SKELETON KNIGHT — Armored skeleton with dark energy veins and cape
// ============================================================================

export function drawSkeletonKnightEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.85;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 4.5;
  const breath = getBreathScale(time, 1.2, 0.012);
  const sway = getIdleSway(time, 1.0, size * 0.003, size * 0.002);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const cx0 = x + sway.dx;

  const steelDark = "#2a2a35";
  const steelMid = "#4a4a58";
  const steelLight = "#6a6a78";
  const steelHighlight = "#8a8a98";

  // Metallic sparks on footfall
  const leftFootDown = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rightFootDown = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  for (const [footDown, footX] of [[leftFootDown, cx0 - size * 0.11], [rightFootDown, cx0 + size * 0.11]] as [number, number][]) {
    if (footDown > 0.85) {
      const intensity = (footDown - 0.85) * 6;
      for (let s = 0; s < 3; s++) {
        const sparkAngle = Math.random() * TAU;
        const sparkDist = size * 0.02 * intensity;
        ctx.fillStyle = `rgba(255, 200, 100, ${intensity * 0.5})`;
        ctx.beginPath();
        ctx.arc(footX + Math.cos(sparkAngle) * sparkDist, y + size * 0.52 + Math.sin(sparkAngle) * sparkDist * 0.3, size * 0.006 * intensity, 0, TAU);
        ctx.fill();
      }
    }
  }

  // === DARK ENERGY MIST ===
  drawShadowWisps(ctx, cx0, y - size * 0.1, size * 0.6, time, zoom, {
    count: 4, speed: 1.0, color: "rgba(80, 30, 60, 0.5)", maxAlpha: 0.2, wispLength: 0.35,
  });

  // === CAPE ===
  const capeSwing = Math.sin(time * 2.5) * 0.08 + Math.sin(time * 1.3) * 0.04;
  ctx.save();
  ctx.translate(cx0, y - size * 0.28 - bodyBob);
  ctx.rotate(capeSwing);

  const capeGrad = ctx.createLinearGradient(-size * 0.14, 0, size * 0.14, 0);
  capeGrad.addColorStop(0, "#4a1520");
  capeGrad.addColorStop(0.3, "#7a2535");
  capeGrad.addColorStop(0.7, "#7a2535");
  capeGrad.addColorStop(1, "#4a1520");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, 0);
  for (let i = 0; i <= 7; i++) {
    const bx = -size * 0.15 + i * size * 0.043;
    const by = size * 0.55 + (i % 2) * size * 0.03 + Math.sin(time * 3 + i * 0.8) * size * 0.015;
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(size * 0.13, 0);
  ctx.closePath();
  ctx.fill();

  // Cape inner lining
  ctx.fillStyle = "rgba(30, 10, 15, 0.4)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.05);
  ctx.lineTo(-size * 0.12, size * 0.45);
  ctx.lineTo(size * 0.12, size * 0.45);
  ctx.lineTo(size * 0.1, size * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.26, width: 0.11, strideSpeed: 4.5, strideAmt: 0.28,
    color: steelMid, colorDark: steelDark, footColor: steelDark, footLen: 0.12,
    style: 'armored', trimColor: steelHighlight,
  });

  // === CHAINMAIL SKIRT ===
  ctx.fillStyle = steelDark;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.14, y + size * 0.12 - bodyBob);
  for (let i = 0; i <= 8; i++) {
    const mx = cx0 - size * 0.14 + i * size * 0.035;
    const my = y + size * 0.22 - bodyBob + (i % 2) * size * 0.015;
    ctx.lineTo(mx, my);
  }
  ctx.lineTo(cx0 + size * 0.14, y + size * 0.12 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Chainmail cross-hatch
  ctx.strokeStyle = steelLight;
  ctx.lineWidth = 0.4 * zoom;
  ctx.globalAlpha = 0.3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const mx = cx0 - size * 0.1 + c * size * 0.05;
      const my = y + size * 0.14 + r * size * 0.025 - bodyBob;
      ctx.beginPath();
      ctx.arc(mx, my, size * 0.008, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // === ARMORED TORSO ===
  const torsoY = y - size * 0.1 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const torsoGrad = ctx.createLinearGradient(cx0 - size * 0.15, torsoY - size * 0.2, cx0 + size * 0.15, torsoY + size * 0.1);
  torsoGrad.addColorStop(0, steelLight);
  torsoGrad.addColorStop(0.3, steelMid);
  torsoGrad.addColorStop(0.6, steelDark);
  torsoGrad.addColorStop(1, steelMid);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.14, torsoY + size * 0.15);
  ctx.lineTo(cx0 - size * 0.15, torsoY - size * 0.08);
  ctx.quadraticCurveTo(cx0 - size * 0.12, torsoY - size * 0.2, cx0, torsoY - size * 0.22);
  ctx.quadraticCurveTo(cx0 + size * 0.12, torsoY - size * 0.2, cx0 + size * 0.15, torsoY - size * 0.08);
  ctx.lineTo(cx0 + size * 0.14, torsoY + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Center ridge
  ctx.strokeStyle = steelHighlight;
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.2);
  ctx.lineTo(cx0, torsoY + size * 0.12);
  ctx.stroke();

  // Horizontal plate lines
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 0.6 * zoom;
  for (let p = 0; p < 3; p++) {
    const py = torsoY - size * 0.1 + p * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.12, py);
    ctx.lineTo(cx0 + size * 0.12, py);
    ctx.stroke();
  }

  // Rivets
  ctx.fillStyle = steelHighlight;
  for (const [rx, ry] of [[-0.11, -0.15], [0.11, -0.15], [-0.12, -0.05], [0.12, -0.05], [-0.11, 0.05], [0.11, 0.05]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(cx0 + rx * size, torsoY + ry * size, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Dark energy veins on armor
  ctx.strokeStyle = "rgba(180, 50, 80, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.05, torsoY - size * 0.15);
  ctx.quadraticCurveTo(cx0 - size * 0.08, torsoY - size * 0.05, cx0 - size * 0.03, torsoY + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.06, torsoY - size * 0.12);
  ctx.quadraticCurveTo(cx0 + size * 0.1, torsoY, cx0 + size * 0.04, torsoY + size * 0.08);
  ctx.stroke();

  ctx.restore();

  // Pauldrons — angular, layered plate armor pieces
  for (const side of [-1, 1]) {
    const padCX = cx0 + side * size * 0.17;
    const padCY = torsoY - size * 0.15 - bodyBob;
    const padGrad = ctx.createLinearGradient(padCX - side * size * 0.06, padCY - size * 0.04, padCX + side * size * 0.06, padCY + size * 0.04);
    padGrad.addColorStop(0, steelHighlight);
    padGrad.addColorStop(0.4, steelMid);
    padGrad.addColorStop(1, steelDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.moveTo(padCX - side * size * 0.04, padCY - size * 0.035);
    ctx.lineTo(padCX + side * size * 0.02, padCY - size * 0.04);
    ctx.lineTo(padCX + side * size * 0.06, padCY - size * 0.02);
    ctx.quadraticCurveTo(padCX + side * size * 0.065, padCY + size * 0.01, padCX + side * size * 0.05, padCY + size * 0.03);
    ctx.lineTo(padCX - side * size * 0.02, padCY + size * 0.04);
    ctx.quadraticCurveTo(padCX - side * size * 0.05, padCY + size * 0.02, padCX - side * size * 0.04, padCY - size * 0.035);
    ctx.closePath();
    ctx.fill();
    // Plate edge rim
    ctx.strokeStyle = steelDark;
    ctx.lineWidth = size * 0.006;
    ctx.stroke();
    // Ridge line across pauldron
    ctx.strokeStyle = steelHighlight;
    ctx.lineWidth = size * 0.004;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(padCX - side * size * 0.03, padCY);
    ctx.lineTo(padCX + side * size * 0.05, padCY - size * 0.005);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Rivet at center
    ctx.fillStyle = steelHighlight;
    ctx.beginPath();
    ctx.arc(padCX + side * size * 0.01, padCY, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, steelMid, steelDark, 'plate');
  }
  drawGorget(ctx, cx0, torsoY - size * 0.18, size, size * 0.12, steelMid, steelDark);
  drawArmorSkirt(ctx, cx0, torsoY + size * 0.08, size, size * 0.14, size * 0.06, steelMid, steelDark, 4);

  // === SHIELD ARM (left) ===
  drawPathArm(ctx, cx0 - size * 0.17, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: steelMid, colorDark: steelDark, handColor: steelDark,
    upperLen: 0.24, foreLen: 0.20,
    shoulderAngle: -0.2 + Math.sin(walkPhase) * 0.1 + (isAttacking ? -0.25 : 0),
    elbowBend: 0.6,
    elbowAngle: 0.3 + (isAttacking ? -0.2 : 0),
    style: 'armored',
    onWeapon: (ctx) => {
      // Kite shield
      const kShW = size * 0.11;
      const kShH = size * 0.2;
      const kiteGrad = ctx.createLinearGradient(-kShW, -kShH * 0.3, kShW, kShH * 0.3);
      kiteGrad.addColorStop(0, steelDark);
      kiteGrad.addColorStop(0.3, steelMid);
      kiteGrad.addColorStop(0.7, steelLight);
      kiteGrad.addColorStop(1, steelDark);
      ctx.fillStyle = kiteGrad;
      ctx.beginPath();
      ctx.moveTo(0, -kShH * 0.5);
      ctx.lineTo(kShW, 0);
      ctx.lineTo(0, kShH * 0.7);
      ctx.lineTo(-kShW, 0);
      ctx.closePath();
      ctx.fill();

      // Heraldic cross (faded)
      ctx.strokeStyle = "rgba(180, 50, 60, 0.5)";
      ctx.lineWidth = size * 0.015;
      ctx.beginPath();
      ctx.moveTo(0, -kShH * 0.3);
      ctx.lineTo(0, kShH * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-kShW * 0.5, size * 0.01);
      ctx.lineTo(kShW * 0.5, size * 0.01);
      ctx.stroke();

      // Corruption creep on shield
      ctx.fillStyle = "rgba(100, 30, 50, 0.3)";
      ctx.beginPath();
      ctx.moveTo(-kShW * 0.3, kShH * 0.3);
      ctx.quadraticCurveTo(-kShW * 0.5, kShH * 0.1, -kShW * 0.2, -kShH * 0.1);
      ctx.quadraticCurveTo(0, kShH * 0.2, kShW * 0.1, kShH * 0.35);
      ctx.lineTo(-kShW * 0.1, kShH * 0.5);
      ctx.closePath();
      ctx.fill();
    },
  });

  // === SWORD ARM (right) ===
  drawPathArm(ctx, cx0 + size * 0.17, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: steelMid, colorDark: steelDark, handColor: bodyColor,
    upperLen: 0.24, foreLen: 0.20,
    shoulderAngle: 0.35 + Math.sin(walkPhase) * 0.12 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.5 : 0),
    elbowAngle: -0.4 + (isAttacking ? 0.6 : Math.sin(walkPhase + 1) * 0.08),
    style: 'bone',
  });

  // === GREAT HELM ===
  const helmX = cx0;
  const helmY = y - size * 0.3 - bodyBob;

  // Faceted great helm — angular bucket shape with proper visor
  const helmGrad = ctx.createLinearGradient(helmX - size * 0.1, helmY - size * 0.08, helmX + size * 0.1, helmY + size * 0.06);
  helmGrad.addColorStop(0, steelHighlight);
  helmGrad.addColorStop(0.4, steelMid);
  helmGrad.addColorStop(0.8, steelDark);
  helmGrad.addColorStop(1, steelMid);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.07, helmY + size * 0.08);
  ctx.lineTo(helmX - size * 0.09, helmY + size * 0.02);
  ctx.quadraticCurveTo(helmX - size * 0.1, helmY - size * 0.04, helmX - size * 0.08, helmY - size * 0.08);
  ctx.quadraticCurveTo(helmX - size * 0.04, helmY - size * 0.12, helmX, helmY - size * 0.11);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY - size * 0.12, helmX + size * 0.08, helmY - size * 0.08);
  ctx.quadraticCurveTo(helmX + size * 0.1, helmY - size * 0.04, helmX + size * 0.09, helmY + size * 0.02);
  ctx.lineTo(helmX + size * 0.07, helmY + size * 0.08);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY + size * 0.1, helmX, helmY + size * 0.09);
  ctx.quadraticCurveTo(helmX - size * 0.04, helmY + size * 0.1, helmX - size * 0.07, helmY + size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Helm plate seam lines
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(helmX, helmY - size * 0.11);
  ctx.lineTo(helmX, helmY + size * 0.09);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.09, helmY);
  ctx.lineTo(helmX + size * 0.09, helmY);
  ctx.stroke();

  // Top crest ridge
  ctx.strokeStyle = steelHighlight;
  ctx.lineWidth = size * 0.009;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.04, helmY - size * 0.1);
  ctx.quadraticCurveTo(helmX, helmY - size * 0.13, helmX + size * 0.04, helmY - size * 0.1);
  ctx.stroke();

  // T-visor cut into helm
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.065, helmY - size * 0.012);
  ctx.lineTo(helmX + size * 0.065, helmY - size * 0.012);
  ctx.lineTo(helmX + size * 0.065, helmY + size * 0.008);
  ctx.lineTo(helmX + size * 0.013, helmY + size * 0.008);
  ctx.lineTo(helmX + size * 0.013, helmY + size * 0.055);
  ctx.lineTo(helmX - size * 0.013, helmY + size * 0.055);
  ctx.lineTo(helmX - size * 0.013, helmY + size * 0.008);
  ctx.lineTo(helmX - size * 0.065, helmY + size * 0.008);
  ctx.closePath();
  ctx.fill();

  // Breathing holes — angled slots
  for (let h = 0; h < 3; h++) {
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.moveTo(helmX + size * 0.045, helmY + size * 0.035 + h * size * 0.016);
    ctx.lineTo(helmX + size * 0.07, helmY + size * 0.033 + h * size * 0.016);
    ctx.lineTo(helmX + size * 0.07, helmY + size * 0.04 + h * size * 0.016);
    ctx.lineTo(helmX + size * 0.045, helmY + size * 0.042 + h * size * 0.016);
    ctx.closePath();
    ctx.fill();
  }

  // Rivets along helm seams
  ctx.fillStyle = steelHighlight;
  for (const [rx, ry] of [[-0.06, -0.06], [0.06, -0.06], [-0.07, 0.02], [0.07, 0.02], [-0.05, 0.07], [0.05, 0.07]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(helmX + rx * size, helmY + ry * size, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // Eye glow through visor
  drawGlowingEyes(ctx, helmX, helmY, size, time, {
    spacing: 0.035,
    eyeRadius: 0.012,
    pupilRadius: 0.006,
    irisColor: "#cc3040",
    pupilColor: "#ff6070",
    glowColor: "rgba(200, 40, 60, 0.6)",
    glowRadius: 0.05,
    pulseSpeed: 3,
    lookSpeed: 1,
    lookAmount: 0.005,
  });

  // Dark mist from breathing slots
  for (let w = 0; w < 2; w++) {
    const wPhase = (time * 0.6 + w * 0.5) % 1;
    ctx.globalAlpha = (1 - wPhase) * 0.15;
    ctx.fillStyle = "rgba(60, 30, 40, 0.5)";
    ctx.beginPath();
    ctx.arc(helmX + size * 0.07 + wPhase * size * 0.04, helmY + size * 0.04 - wPhase * size * 0.06, size * 0.008 * (1 + wPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (isAttacking) {
    const swingProgress = 1 - attackPhase;
    const sweepAngle = swingProgress * Math.PI * 1.8 - Math.PI * 0.6;
    const sweepR = size * 0.4;
    ctx.strokeStyle = `rgba(200, 40, 60, ${attackPhase * 0.7})`;
    ctx.lineWidth = (3 + attackPhase * 5) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx0, y - size * 0.05 + bodyBob, sweepR, sweepAngle - 0.7, sweepAngle + 0.7);
    ctx.stroke();
    ctx.lineCap = "butt";

    const trailLen = 5;
    for (let t = 0; t < trailLen; t++) {
      const tAngle = sweepAngle - t * 0.15;
      const tAlpha = attackPhase * 0.3 * (1 - t / trailLen);
      ctx.strokeStyle = `rgba(200, 40, 60, ${tAlpha})`;
      ctx.lineWidth = (2 - t * 0.3) * zoom;
      ctx.beginPath();
      ctx.arc(cx0, y - size * 0.05 + bodyBob, sweepR, tAngle - 0.3, tAngle + 0.3);
      ctx.stroke();
    }

    if (attackPhase > 0.7) {
      const impactFlash = (attackPhase - 0.7) * 3.3;
      const flashGrad = ctx.createRadialGradient(cx0 + size * 0.2, y, 0, cx0 + size * 0.2, y, size * 0.3 * impactFlash);
      flashGrad.addColorStop(0, `rgba(200, 40, 60, ${impactFlash * 0.3})`);
      flashGrad.addColorStop(1, "rgba(200, 40, 60, 0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(cx0 + size * 0.2, y, size * 0.3 * impactFlash, size * 0.3 * impactFlash * ISO_Y_RATIO, 0, 0, TAU);
      ctx.fill();
    }
  }
}

// ============================================================================
// 3. SKELETON ARCHER — Lean bone archer with bow & quiver
// ============================================================================

export function drawSkeletonArcherEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.75;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const walkPhase = time * 5.5;
  const breath = getBreathScale(time, 1.8, 0.012);
  const sway = getIdleSway(time, 1.3, size * 0.003, size * 0.002);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const cx0 = x + sway.dx;

  const boneWhite = bodyColorLight;
  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const headY = y - size * 0.27 - bodyBob;


  // === SHADOW WISPS ===
  drawShadowWisps(ctx, cx0, y, size * 0.4, time, zoom, {
    count: 3, speed: 0.7, color: "rgba(40, 80, 50, 0.5)", maxAlpha: 0.12, wispLength: 0.3,
  });

  // === BONE LEGS WITH LEATHER WRAPS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.28, width: 0.12, strideSpeed: 5.5, strideAmt: 0.28,
    color: boneMid, colorDark: boneDark, footColor: "#5a4a35", footLen: 0.12,
    style: 'bone',
  });

  // Leather wraps on legs
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + (side === -1 ? 0 : Math.PI)) * 0.28;
    ctx.save();
    ctx.translate(cx0 + side * size * 0.08, y + size * 0.17 + bodyBob);
    ctx.rotate(legSwing);
    ctx.strokeStyle = "#6a5540";
    ctx.lineWidth = size * 0.012;
    for (let w = 0; w < 3; w++) {
      const wy = size * 0.06 + w * size * 0.03;
      ctx.beginPath();
      ctx.moveTo(-size * 0.03, wy);
      ctx.lineTo(size * 0.03, wy + size * 0.01);
      ctx.stroke();
    }
    ctx.restore();
  }

  // === QUIVER ON BACK ===
  const quiverX = cx0 + size * 0.08;
  const quiverY = y - size * 0.2 - bodyBob;

  ctx.save();
  ctx.translate(quiverX, quiverY);
  ctx.rotate(0.15);

  // Quiver body
  const quiverGrad = ctx.createLinearGradient(-size * 0.03, -size * 0.12, size * 0.03, size * 0.12);
  quiverGrad.addColorStop(0, "#5a4530");
  quiverGrad.addColorStop(0.5, "#7a6550");
  quiverGrad.addColorStop(1, "#4a3520");
  ctx.fillStyle = quiverGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.12);
  ctx.lineTo(-size * 0.03, size * 0.12);
  ctx.lineTo(size * 0.03, size * 0.12);
  ctx.lineTo(size * 0.025, -size * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a2510";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Arrows in quiver
  for (let a = 0; a < 4; a++) {
    const ax = -size * 0.015 + a * size * 0.01;
    ctx.strokeStyle = "#8a7560";
    ctx.lineWidth = size * 0.005;
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.12);
    ctx.lineTo(ax, -size * 0.2);
    ctx.stroke();

    // Arrow tip
    ctx.fillStyle = "#707080";
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.2);
    ctx.lineTo(ax - size * 0.006, -size * 0.185);
    ctx.lineTo(ax + size * 0.006, -size * 0.185);
    ctx.closePath();
    ctx.fill();

    // Fletching
    ctx.fillStyle = a % 2 === 0 ? "#8a5540" : "#6a4530";
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.125);
    ctx.lineTo(ax + size * 0.008, -size * 0.135);
    ctx.lineTo(ax, -size * 0.145);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // === LEATHER TORSO ARMOR ===
  const torsoY = y - size * 0.1 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const leatherGrad = ctx.createLinearGradient(cx0 - size * 0.12, torsoY - size * 0.18, cx0 + size * 0.12, torsoY + size * 0.1);
  leatherGrad.addColorStop(0, "#5a4535");
  leatherGrad.addColorStop(0.5, "#7a6550");
  leatherGrad.addColorStop(1, "#4a3525");
  ctx.fillStyle = leatherGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.12, torsoY + size * 0.12);
  ctx.lineTo(cx0 - size * 0.13, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.2, cx0 + size * 0.13, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.12, torsoY + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Leather lacing
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 0.7 * zoom;
  for (let l = 0; l < 4; l++) {
    const ly = torsoY - size * 0.08 + l * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.02, ly);
    ctx.lineTo(cx0 + size * 0.02, ly + size * 0.015);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx0 + size * 0.02, ly);
    ctx.lineTo(cx0 - size * 0.02, ly + size * 0.015);
    ctx.stroke();
  }

  // Visible ribs through leather gaps
  ctx.strokeStyle = boneMid;
  ctx.lineWidth = size * 0.008;
  ctx.globalAlpha = 0.4;
  for (let r = 0; r < 3; r++) {
    const ry = torsoY - size * 0.05 + r * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.04, ry);
    ctx.quadraticCurveTo(cx0 - size * 0.08, ry + size * 0.01, cx0 - size * 0.1, ry + size * 0.025);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Bone protrusion at shoulder
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.11, torsoY - size * 0.08, size * 0.02, size * 0.012, 0.5, 0, TAU);
  ctx.fill();

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, boneMid, boneDark, 'tattered');
  }
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.08, size, size * 0.12, "#5a4535", "#3a2515", "#706050");

  // === BOW ARM (left side — toward target) ===
  const bowArmX = cx0 - size * 0.15;
  const bowArmY = torsoY - size * 0.1 - bodyBob;
  const bowForeLen = 0.17;

  drawPathArm(ctx, bowArmX, bowArmY, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.22, foreLen: bowForeLen,
    shoulderAngle: (1.1 + (isAttacking ? attackIntensity * 0.15 : 0)) + Math.sin(time * 1.2) * 0.02,
    elbowAngle: 0.4 + (isAttacking ? attackIntensity * 0.1 : 0),
    style: 'bone',
    onWeapon: (wCtx) => {
      const handY = bowForeLen * size;
      wCtx.translate(0, handY * 0.4);
      wCtx.rotate(-1.2);

      const bowH = size * 0.36;
      const limbW = 2.8 * zoom;

      // Ghostly spectral aura on limbs
      setShadowBlur(wCtx, 3 * zoom, "rgba(80, 200, 100, 0.15)");

      // Upper limb — recurve S-shape
      const upperGrad = wCtx.createLinearGradient(0, -bowH * 0.5, 0, 0);
      upperGrad.addColorStop(0, "#4a3520");
      upperGrad.addColorStop(0.5, "#7a5a40");
      upperGrad.addColorStop(1, "#5a4030");
      wCtx.strokeStyle = upperGrad;
      wCtx.lineWidth = limbW;
      wCtx.lineCap = "round";
      wCtx.beginPath();
      wCtx.moveTo(size * 0.015, -bowH * 0.5);
      wCtx.bezierCurveTo(-size * 0.04, -bowH * 0.3, -size * 0.06, -bowH * 0.12, -size * 0.03, 0);
      wCtx.stroke();

      // Lower limb — mirror
      const lowerGrad = wCtx.createLinearGradient(0, 0, 0, bowH * 0.5);
      lowerGrad.addColorStop(0, "#5a4030");
      lowerGrad.addColorStop(0.5, "#7a5a40");
      lowerGrad.addColorStop(1, "#4a3520");
      wCtx.strokeStyle = lowerGrad;
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.03, 0);
      wCtx.bezierCurveTo(-size * 0.06, bowH * 0.12, -size * 0.04, bowH * 0.3, size * 0.015, bowH * 0.5);
      wCtx.stroke();
      wCtx.lineCap = "butt";

      clearShadow(wCtx);

      // Sinew wrapping tick marks on upper limb
      wCtx.strokeStyle = "rgba(180, 160, 130, 0.4)";
      wCtx.lineWidth = 0.7 * zoom;
      for (let t = 0.2; t <= 0.8; t += 0.2) {
        const ux = size * 0.015 * (1 - t) + (-size * 0.03) * t + (-size * 0.04 - size * 0.015) * t * (1 - t) * 2;
        const uy = -bowH * 0.5 * (1 - t);
        wCtx.beginPath();
        wCtx.moveTo(ux - size * 0.008, uy - size * 0.006);
        wCtx.lineTo(ux + size * 0.008, uy + size * 0.006);
        wCtx.stroke();
      }

      // Sinew wrapping tick marks on lower limb
      for (let t = 0.2; t <= 0.8; t += 0.2) {
        const lx = -size * 0.03 * (1 - t) + size * 0.015 * t + (-size * 0.06 + size * 0.03) * t * (1 - t) * 2;
        const ly = bowH * 0.5 * t;
        wCtx.beginPath();
        wCtx.moveTo(lx - size * 0.008, ly - size * 0.006);
        wCtx.lineTo(lx + size * 0.008, ly + size * 0.006);
        wCtx.stroke();
      }

      // Weathered hairline cracks on upper limb
      wCtx.strokeStyle = "rgba(60, 40, 20, 0.2)";
      wCtx.lineWidth = 0.5 * zoom;
      const upperCrackTs = [0.3, 0.55, 0.75];
      for (const t of upperCrackTs) {
        const cx2 = size * 0.015 * (1 - t) + (-size * 0.03) * t + (-size * 0.04 - size * 0.015) * t * (1 - t) * 2;
        const cy2 = -bowH * 0.5 * (1 - t);
        wCtx.beginPath();
        wCtx.moveTo(cx2, cy2);
        wCtx.lineTo(cx2 + size * 0.005, cy2 + size * 0.008);
        wCtx.lineTo(cx2 + size * 0.002, cy2 + size * 0.012);
        wCtx.stroke();
      }

      // Weathered hairline cracks on lower limb
      const lowerCrackTs = [0.25, 0.5, 0.7];
      for (const t of lowerCrackTs) {
        const cx2 = -size * 0.03 * (1 - t) + size * 0.015 * t + (-size * 0.06 + size * 0.03) * t * (1 - t) * 2;
        const cy2 = bowH * 0.5 * t;
        wCtx.beginPath();
        wCtx.moveTo(cx2, cy2);
        wCtx.lineTo(cx2 - size * 0.004, cy2 + size * 0.009);
        wCtx.lineTo(cx2 - size * 0.001, cy2 + size * 0.013);
        wCtx.stroke();
      }

      // Bone/horn tips at each limb end
      for (const dir of [-1, 1]) {
        wCtx.fillStyle = boneDark;
        wCtx.beginPath();
        wCtx.arc(size * 0.015, dir * bowH * 0.5, size * 0.008, 0, TAU);
        wCtx.fill();
      }

      // Leather grip
      wCtx.fillStyle = "#4a3520";
      wCtx.beginPath();
      const gripX = -size * 0.045;
      const gripY = -size * 0.02;
      const gripW = size * 0.03;
      const gripH = size * 0.04;
      wCtx.roundRect(gripX, gripY, gripW, gripH, size * 0.004);
      wCtx.fill();
      // Cross-wrap leather stitching
      wCtx.strokeStyle = "rgba(90, 70, 50, 0.6)";
      wCtx.lineWidth = 0.5 * zoom;
      for (let s = 0; s < 3; s++) {
        const sy = gripY + gripH * (0.2 + s * 0.3);
        wCtx.beginPath();
        wCtx.moveTo(gripX + gripW * 0.15, sy - gripH * 0.08);
        wCtx.lineTo(gripX + gripW * 0.85, sy + gripH * 0.08);
        wCtx.stroke();
        wCtx.beginPath();
        wCtx.moveTo(gripX + gripW * 0.15, sy + gripH * 0.08);
        wCtx.lineTo(gripX + gripW * 0.85, sy - gripH * 0.08);
        wCtx.stroke();
      }

      // Bowstring with smooth attackPhase pull — thick and visible
      const idleDraw = size * 0.04 + Math.sin(time * 1.5) * size * 0.008;
      const stringTwang = isAttacking && attackIntensity < 0.3 ? Math.sin(time * 35) * size * 0.012 * (1 - attackIntensity * 3) : 0;
      const stringPull = isAttacking ? attackIntensity * size * 0.16 + stringTwang : idleDraw;
      wCtx.strokeStyle = "#e0d8b8";
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(size * 0.015, -bowH * 0.48);
      wCtx.quadraticCurveTo(stringPull - size * 0.025, 0, size * 0.015, bowH * 0.48);
      wCtx.stroke();
      // Bright inner core
      wCtx.strokeStyle = "rgba(250, 245, 220, 0.55)";
      wCtx.lineWidth = 0.7 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(size * 0.015, -bowH * 0.46);
      wCtx.quadraticCurveTo(stringPull - size * 0.025, 0, size * 0.015, bowH * 0.46);
      wCtx.stroke();

      // Nock point glow
      const nockX = stringPull - size * 0.02;
      wCtx.fillStyle = `rgba(80, 200, 100, ${0.4 + Math.sin(time * 4) * 0.2})`;
      wCtx.beginPath();
      wCtx.arc(nockX, 0, size * 0.005, 0, TAU);
      wCtx.fill();

      // Nocked arrow (always visible, extends from string to past bow)
      const arrowEnd = nockX - size * 0.22;
      wCtx.strokeStyle = "#8a7560";
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(nockX, 0);
      wCtx.lineTo(arrowEnd, 0);
      wCtx.stroke();

      // Arrowhead
      wCtx.fillStyle = "#808890";
      wCtx.beginPath();
      wCtx.moveTo(arrowEnd, 0);
      wCtx.lineTo(arrowEnd - size * 0.02, -size * 0.008);
      wCtx.lineTo(arrowEnd - size * 0.025, 0);
      wCtx.lineTo(arrowEnd - size * 0.02, size * 0.008);
      wCtx.closePath();
      wCtx.fill();

      // Fletching at nock
      const fletchColors = ["#dc2626", "#c8c0b0", "#c8c0b0"];
      for (let f = 0; f < 3; f++) {
        const fOff = (f - 1) * size * 0.004;
        wCtx.fillStyle = fletchColors[f];
        wCtx.beginPath();
        wCtx.moveTo(nockX, fOff);
        wCtx.quadraticCurveTo(nockX + size * 0.01, fOff + size * 0.006, nockX + size * 0.025, fOff);
        wCtx.quadraticCurveTo(nockX + size * 0.01, fOff - size * 0.003, nockX, fOff);
        wCtx.fill();
      }

      // Ghost energy trail on arrowhead
      wCtx.strokeStyle = `rgba(80, 200, 100, ${0.3 + attackIntensity * 0.4})`;
      wCtx.lineWidth = 1.2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(arrowEnd - size * 0.02, 0);
      wCtx.lineTo(arrowEnd - size * 0.01, Math.sin(time * 15) * size * 0.006);
      wCtx.stroke();
    },
  });

  // === DRAW ARM (right side — pulling string back) ===
  const drawForeLen = 0.17;
  drawPathArm(ctx, cx0 + size * 0.14, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.22, foreLen: drawForeLen,
    shoulderAngle: (0.7 + Math.sin(time * 1.2) * 0.02) + (isAttacking ? attackIntensity * 0.35 : 0),
    elbowAngle: (0.8 + (isAttacking ? attackIntensity * 0.25 : 0)),
    style: 'bone',
    onWeapon: (wCtx) => {
      const handY = drawForeLen * size;
      wCtx.translate(0, handY * 0.4);
      wCtx.rotate(0.3);

      // Bone fingers gripping string
      wCtx.fillStyle = boneDark;
      wCtx.beginPath();
      wCtx.roundRect(-size * 0.012, -size * 0.015, size * 0.024, size * 0.03, size * 0.003);
      wCtx.fill();

      // String segments from fingers (V-shape pull) — thick and visible
      const drawPull = isAttacking ? attackIntensity * size * 0.1 : size * 0.02;
      const sAlpha = 0.8 + (isAttacking ? attackIntensity * 0.2 : Math.sin(time * 2) * 0.1);
      wCtx.strokeStyle = `rgba(220, 212, 180, ${sAlpha})`;
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, -size * 0.008);
      wCtx.lineTo(size * 0.02, -size * 0.12 - drawPull);
      wCtx.stroke();
      wCtx.beginPath();
      wCtx.moveTo(0, size * 0.008);
      wCtx.lineTo(size * 0.02, size * 0.12 + drawPull);
      wCtx.stroke();
      // Bright inner highlights
      wCtx.strokeStyle = `rgba(250, 245, 220, ${sAlpha * 0.5})`;
      wCtx.lineWidth = 0.7 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, -size * 0.008);
      wCtx.lineTo(size * 0.02, -size * 0.115 - drawPull);
      wCtx.stroke();
      wCtx.beginPath();
      wCtx.moveTo(0, size * 0.008);
      wCtx.lineTo(size * 0.02, size * 0.115 + drawPull);
      wCtx.stroke();
    },
  });

  // === SKULL HEAD WITH LEATHER CAP ===
  const skullX = cx0;
  const skullY = headY;

  // Leather cap — fitted skull cap with stitching
  ctx.fillStyle = "#5a4530";
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.085, skullY - size * 0.01);
  ctx.quadraticCurveTo(skullX - size * 0.09, skullY - size * 0.06, skullX - size * 0.06, skullY - size * 0.085);
  ctx.quadraticCurveTo(skullX, skullY - size * 0.1, skullX + size * 0.06, skullY - size * 0.085);
  ctx.quadraticCurveTo(skullX + size * 0.09, skullY - size * 0.06, skullX + size * 0.085, skullY - size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Cap stitching lines
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 0.5 * zoom;
  ctx.setLineDash([size * 0.008, size * 0.006]);
  ctx.beginPath();
  ctx.moveTo(skullX, skullY - size * 0.095);
  ctx.quadraticCurveTo(skullX + size * 0.01, skullY - size * 0.06, skullX, skullY - size * 0.02);
  ctx.stroke();
  ctx.setLineDash([]);

  // Skull — narrow archer's skull
  const skullGrad = ctx.createRadialGradient(skullX, skullY, 0, skullX, skullY, size * 0.1);
  skullGrad.addColorStop(0, boneWhite);
  skullGrad.addColorStop(0.6, boneMid);
  skullGrad.addColorStop(1, boneDark);
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.moveTo(skullX, skullY - size * 0.09);
  ctx.quadraticCurveTo(skullX + size * 0.05, skullY - size * 0.09, skullX + size * 0.08, skullY - size * 0.05);
  ctx.quadraticCurveTo(skullX + size * 0.085, skullY + size * 0.01, skullX + size * 0.075, skullY + size * 0.04);
  ctx.quadraticCurveTo(skullX + size * 0.05, skullY + size * 0.07, skullX, skullY + size * 0.065);
  ctx.quadraticCurveTo(skullX - size * 0.05, skullY + size * 0.07, skullX - size * 0.075, skullY + size * 0.04);
  ctx.quadraticCurveTo(skullX - size * 0.085, skullY + size * 0.01, skullX - size * 0.08, skullY - size * 0.05);
  ctx.quadraticCurveTo(skullX - size * 0.05, skullY - size * 0.09, skullX, skullY - size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Brow ridge — angular
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.07, skullY + size * 0.005);
  ctx.quadraticCurveTo(skullX, skullY - size * 0.01, skullX + size * 0.07, skullY + size * 0.005);
  ctx.quadraticCurveTo(skullX, skullY + size * 0.02, skullX - size * 0.07, skullY + size * 0.005);
  ctx.closePath();
  ctx.fill();

  // Bone cracks — branching
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.03, skullY - size * 0.07);
  ctx.lineTo(skullX - size * 0.015, skullY - size * 0.04);
  ctx.lineTo(skullX - size * 0.01, skullY - size * 0.03);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.015, skullY - size * 0.04);
  ctx.lineTo(skullX - size * 0.035, skullY - size * 0.025);
  ctx.stroke();

  // Eye sockets — narrow, focused
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0500";
    ctx.beginPath();
    ctx.moveTo(skullX + side * size * 0.015, skullY + size * 0.003);
    ctx.quadraticCurveTo(skullX + side * size * 0.035, skullY - size * 0.008, skullX + side * size * 0.05, skullY + size * 0.005);
    ctx.quadraticCurveTo(skullX + side * size * 0.052, skullY + size * 0.02, skullX + side * size * 0.04, skullY + size * 0.03);
    ctx.quadraticCurveTo(skullX + side * size * 0.025, skullY + size * 0.032, skullX + side * size * 0.018, skullY + size * 0.02);
    ctx.quadraticCurveTo(skullX + side * size * 0.013, skullY + size * 0.013, skullX + side * size * 0.015, skullY + size * 0.003);
    ctx.closePath();
    ctx.fill();
  }

  // Green soul-fire eyes
  drawGlowingEyes(ctx, skullX, skullY + size * 0.01, size, time, {
    spacing: 0.035,
    eyeRadius: 0.015,
    pupilRadius: 0.006,
    irisColor: "#40c060",
    pupilColor: "#90ff90",
    glowColor: "rgba(60, 200, 90, 0.6)",
    glowRadius: 0.055,
    pulseSpeed: 3.5,
    lookSpeed: 2,
    lookAmount: 0.008,
  });

  // Nasal cavity
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(skullX, skullY + size * 0.025);
  ctx.lineTo(skullX - size * 0.012, skullY + size * 0.05);
  ctx.lineTo(skullX + size * 0.012, skullY + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Jaw
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.055, skullY + size * 0.035);
  ctx.quadraticCurveTo(skullX, skullY + size * 0.1, skullX + size * 0.055, skullY + size * 0.035);
  ctx.closePath();
  ctx.fill();

  // Teeth
  ctx.fillStyle = boneWhite;
  for (let t = 0; t < 4; t++) {
    const tx = skullX - size * 0.025 + t * size * 0.017;
    ctx.beginPath();
    ctx.rect(tx, skullY + size * 0.048, size * 0.008, size * 0.015);
    ctx.fill();
  }
}

// ============================================================================
// 4. SKELETON KING — Boss: undead monarch with soul scepter & crown
// ============================================================================

export function drawSkeletonKingEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 2.0;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3.5;
  const breath = getBreathScale(time, 1.5, 0.02);
  const sway = getIdleSway(time, 0.8, size * 0.005, size * 0.003);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.01;
  const cx0 = x + sway.dx;

  const boneWhite = bodyColorLight;
  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const goldBright = "#ffd700";
  const goldMid = "#c8a020";
  const goldDark = "#8a6a10";

  // === BONE THRONE GOLDEN AURA ===
  ctx.save();
  const throneAuraPulse = 0.7 + Math.sin(time * 1.2) * 0.3;
  const throneAuraR = size * 0.6 * throneAuraPulse;
  const throneAuraGrad = ctx.createRadialGradient(cx0, y - size * 0.05, size * 0.05, cx0, y - size * 0.05, throneAuraR);
  throneAuraGrad.addColorStop(0, `rgba(218, 165, 32, ${0.12 * throneAuraPulse})`);
  throneAuraGrad.addColorStop(0.3, `rgba(200, 160, 32, ${0.08 * throneAuraPulse})`);
  throneAuraGrad.addColorStop(0.6, `rgba(180, 140, 20, ${0.04 * throneAuraPulse})`);
  throneAuraGrad.addColorStop(1, "rgba(140, 106, 16, 0)");
  ctx.fillStyle = throneAuraGrad;
  ctx.beginPath();
  ctx.arc(cx0, y - size * 0.05, throneAuraR, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === SOUL FLAME AURA ===
  drawRadialAura(ctx, cx0, y - size * 0.1, size * 0.7, [
    { offset: 0, color: "rgba(120, 60, 180, 0.15)" },
    { offset: 0.4, color: "rgba(100, 40, 160, 0.08)" },
    { offset: 0.7, color: "rgba(80, 30, 140, 0.03)" },
    { offset: 1, color: "rgba(60, 20, 120, 0)" },
  ]);

  // === ARCANE SPARKLES ===
  drawArcaneSparkles(ctx, cx0, y - size * 0.1, size * 0.6, time, zoom, {
    count: 8, speed: 1.5, color: "rgba(180, 120, 255, 0.7)", maxAlpha: 0.5, sparkleSize: 0.06,
  });

  // === GROUND CORRUPTION CIRCLE ===
  ctx.strokeStyle = "rgba(120, 60, 180, 0.2)";
  ctx.lineWidth = 1.2 * zoom;
  const runeRadius = size * 0.5 + Math.sin(time * 1.5) * size * 0.03;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.5, runeRadius, runeRadius * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();

  // Arcane runes on the ground
  for (let r = 0; r < 6; r++) {
    const angle = r * (TAU / 6) + time * 0.3;
    const rx = cx0 + Math.cos(angle) * runeRadius * 0.8;
    const ry = y + size * 0.5 + Math.sin(angle) * runeRadius * 0.28;
    ctx.fillStyle = `rgba(160, 100, 230, ${0.2 + Math.sin(time * 2 + r) * 0.1})`;
    ctx.font = `${size * 0.06}px serif`;
    ctx.fillText("✦", rx, ry);
  }

  // === GROUND NECROMANCY CIRCLE ===
  ctx.save();
  const necroRotation = time * 0.5;
  const necroRadius = size * 0.42;
  ctx.strokeStyle = `rgba(200, 170, 40, ${0.15 + Math.sin(time * 2) * 0.05})`;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.5, necroRadius, necroRadius * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();
  const innerNecroR = size * 0.3;
  ctx.strokeStyle = `rgba(218, 165, 32, ${0.12 + Math.sin(time * 2.5) * 0.05})`;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.5, innerNecroR, innerNecroR * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();
  for (let rd = 0; rd < 12; rd++) {
    const rdAngle = rd * (TAU / 12) + necroRotation;
    const rdR = necroRadius * 0.9;
    const rdx = cx0 + Math.cos(rdAngle) * rdR;
    const rdy = y + size * 0.5 + Math.sin(rdAngle) * rdR * ISO_Y_RATIO;
    const rdAlpha = 0.2 + Math.sin(time * 3 + rd * 0.8) * 0.1;
    ctx.fillStyle = `rgba(218, 165, 32, ${rdAlpha})`;
    ctx.beginPath();
    ctx.arc(rdx, rdy, size * 0.008, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === SOUL FLAME PARTICLES ===
  for (let i = 0; i < 8; i++) {
    const seed = i * 2.39;
    const phase = (time * 0.7 + seed) % 1;
    const px = cx0 + Math.sin(seed * 5) * size * 0.3;
    const py = y + size * 0.3 - phase * size * 0.8;
    const alpha = (1 - phase) * 0.4 * (phase < 0.1 ? phase / 0.1 : 1);
    const sz = size * 0.018 * (1 - phase * 0.5);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#b070ff";
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#e0c0ff";
    ctx.beginPath();
    ctx.arc(px, py, sz * 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === ORBITING BONE FRAGMENTS ===
  for (let bf = 0; bf < 6; bf++) {
    const bfAngle = bf * (TAU / 6) + time * 0.8;
    const bfRadius = size * 0.35 + Math.sin(time * 1.5 + bf) * size * 0.03;
    const bfX = cx0 + Math.cos(bfAngle) * bfRadius;
    const bfY = y - size * 0.05 + Math.sin(bfAngle) * bfRadius * 0.35 + Math.sin(time * 2 + bf * 1.2) * size * 0.02;
    const bfAlpha = 0.6 + Math.sin(time * 2.5 + bf) * 0.2;
    ctx.save();
    ctx.translate(bfX, bfY);
    ctx.rotate(bfAngle + time * 1.5);
    ctx.fillStyle = `rgba(210, 200, 170, ${bfAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.lineTo(size * 0.006, 0);
    ctx.lineTo(0, size * 0.02);
    ctx.lineTo(-size * 0.006, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(240, 235, 220, ${bfAlpha * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.012);
    ctx.lineTo(size * 0.003, 0);
    ctx.lineTo(0, size * 0.012);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // === ROYAL CAPE ===
  const capeSwing = Math.sin(time * 2) * 0.06;
  ctx.save();
  ctx.translate(cx0, y - size * 0.3 - bodyBob);
  ctx.rotate(capeSwing);

  const capeGrad = ctx.createLinearGradient(-size * 0.16, 0, size * 0.16, 0);
  capeGrad.addColorStop(0, "#2a0840");
  capeGrad.addColorStop(0.2, "#4a1870");
  capeGrad.addColorStop(0.5, "#5a2080");
  capeGrad.addColorStop(0.8, "#4a1870");
  capeGrad.addColorStop(1, "#2a0840");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, 0);
  for (let i = 0; i <= 9; i++) {
    const bx = -size * 0.17 + i * size * 0.038;
    const by = size * 0.6 + (i % 2) * size * 0.035 + Math.sin(time * 2.5 + i * 0.7) * size * 0.015;
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(size * 0.15, 0);
  ctx.closePath();
  ctx.fill();

  // Gold trim on cape
  ctx.strokeStyle = goldMid;
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, 0);
  for (let i = 0; i <= 9; i++) {
    const bx = -size * 0.17 + i * size * 0.038;
    const by = size * 0.6 + (i % 2) * size * 0.035 + Math.sin(time * 2.5 + i * 0.7) * size * 0.015;
    ctx.lineTo(bx, by);
  }
  ctx.stroke();

  // Cape inner lining (purple/gold)
  ctx.fillStyle = "rgba(100, 50, 150, 0.3)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, size * 0.05);
  ctx.lineTo(-size * 0.14, size * 0.5);
  ctx.lineTo(size * 0.14, size * 0.5);
  ctx.lineTo(size * 0.12, size * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // === LEGS (bone with gold trim) ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.28, width: 0.1, strideSpeed: 3.5, strideAmt: 0.22,
    color: boneMid, colorDark: boneDark, footColor: goldDark, footLen: 0.12,
    style: 'bone',
  });

  // Royal cloak (behind body)
  const torsoY = y - size * 0.1 - bodyBob;
  drawTatteredCloak(ctx, cx0, torsoY - size * 0.16, size, size * 0.3, size * 0.35, goldDark, "#3a2a15", time);

  // === ROYAL ARMOR TORSO ===

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  // Gold breastplate
  const breastGrad = ctx.createLinearGradient(cx0 - size * 0.14, torsoY - size * 0.2, cx0 + size * 0.14, torsoY + size * 0.1);
  breastGrad.addColorStop(0, goldDark);
  breastGrad.addColorStop(0.3, goldMid);
  breastGrad.addColorStop(0.6, goldBright);
  breastGrad.addColorStop(1, goldMid);
  ctx.fillStyle = breastGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.13, torsoY + size * 0.13);
  ctx.lineTo(cx0 - size * 0.14, torsoY - size * 0.08);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.22, cx0 + size * 0.14, torsoY - size * 0.08);
  ctx.lineTo(cx0 + size * 0.13, torsoY + size * 0.13);
  ctx.closePath();
  ctx.fill();

  // Purple gem on chest
  const gemGrad = ctx.createRadialGradient(cx0, torsoY - size * 0.05, 0, cx0, torsoY - size * 0.05, size * 0.025);
  gemGrad.addColorStop(0, "#e0a0ff");
  gemGrad.addColorStop(0.5, "#8040c0");
  gemGrad.addColorStop(1, "#4a1060");
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  ctx.arc(cx0, torsoY - size * 0.05, size * 0.025, 0, TAU);
  ctx.fill();

  // Gem glow
  const gemPulse = 0.5 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(180, 120, 255, ${gemPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(cx0, torsoY - size * 0.05, size * 0.04, 0, TAU);
  ctx.fill();

  // Filigree lines on breastplate
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 0.6 * zoom;
  ctx.globalAlpha = 0.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx0 + side * size * 0.03, torsoY - size * 0.15);
    ctx.quadraticCurveTo(cx0 + side * size * 0.1, torsoY - size * 0.08, cx0 + side * size * 0.08, torsoY + size * 0.05);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Corruption veins on gold
  ctx.strokeStyle = "rgba(100, 40, 150, 0.35)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.05, torsoY - size * 0.12);
  ctx.quadraticCurveTo(cx0 + size * 0.08, torsoY, cx0 + size * 0.03, torsoY + size * 0.08);
  ctx.stroke();

  ctx.restore();

  // Ornate pauldrons with gems — layered royal armor plates
  for (const side of [-1, 1]) {
    const padX = cx0 + side * size * 0.18;
    const padY = torsoY - size * 0.16 - bodyBob;
    const padGrad = ctx.createLinearGradient(padX - side * size * 0.06, padY - size * 0.04, padX + side * size * 0.06, padY + size * 0.04);
    padGrad.addColorStop(0, goldBright);
    padGrad.addColorStop(0.4, goldMid);
    padGrad.addColorStop(1, goldDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.moveTo(padX - side * size * 0.04, padY - size * 0.04);
    ctx.lineTo(padX + side * size * 0.02, padY - size * 0.045);
    ctx.quadraticCurveTo(padX + side * size * 0.065, padY - size * 0.03, padX + side * size * 0.065, padY);
    ctx.quadraticCurveTo(padX + side * size * 0.06, padY + size * 0.03, padX + side * size * 0.04, padY + size * 0.04);
    ctx.lineTo(padX - side * size * 0.02, padY + size * 0.045);
    ctx.quadraticCurveTo(padX - side * size * 0.05, padY + size * 0.025, padX - side * size * 0.04, padY - size * 0.04);
    ctx.closePath();
    ctx.fill();
    // Pauldron rim
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = size * 0.005;
    ctx.stroke();
    // Filigree line across plate
    ctx.strokeStyle = goldBright;
    ctx.lineWidth = size * 0.003;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(padX - side * size * 0.03, padY - size * 0.01);
    ctx.quadraticCurveTo(padX + side * size * 0.02, padY - size * 0.015, padX + side * size * 0.05, padY);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Central gem — faceted
    ctx.fillStyle = "#a050e0";
    ctx.beginPath();
    ctx.moveTo(padX, padY - size * 0.015);
    ctx.lineTo(padX + size * 0.012, padY);
    ctx.lineTo(padX, padY + size * 0.015);
    ctx.lineTo(padX - size * 0.012, padY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d0a0ff";
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(padX - size * 0.003, padY - size * 0.01);
    ctx.lineTo(padX + size * 0.008, padY);
    ctx.lineTo(padX, padY + size * 0.005);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, goldMid, goldDark, 'plate');
  }
  drawGorget(ctx, cx0, torsoY - size * 0.18, size, size * 0.12, goldMid, goldDark);

  // === SCEPTER ARM (left) ===
  const scepterArmX = cx0 - size * 0.17;
  const scepterArmY = torsoY - size * 0.08 - bodyBob;

  drawPathArm(ctx, scepterArmX, scepterArmY, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.22, foreLen: 0.17,
    shoulderAngle: -0.25 + Math.sin(walkPhase) * 0.08 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.3 : 0),
    elbowBend: 0.55,
    elbowAngle: 0.2 + (isAttacking ? -0.25 : 0),
    style: 'bone',
    onWeapon: (ctx) => {
      const foreLen = size * 0.1;

      // Scepter shaft — ornate with taper and filigree
      const scTop = foreLen * 0.5;
      const scBot = foreLen * 0.5 + size * 0.25;
      ctx.fillStyle = goldMid;
      ctx.beginPath();
      ctx.moveTo(-size * 0.013, scTop);
      ctx.bezierCurveTo(-size * 0.017, scTop + (scBot - scTop) * 0.3, -size * 0.01, scTop + (scBot - scTop) * 0.6, -size * 0.015, scBot);
      ctx.lineTo(size * 0.015, scBot);
      ctx.bezierCurveTo(size * 0.01, scTop + (scBot - scTop) * 0.6, size * 0.017, scTop + (scBot - scTop) * 0.3, size * 0.013, scTop);
      ctx.closePath();
      ctx.fill();
      // Gold bands along shaft
      ctx.strokeStyle = goldBright;
      ctx.lineWidth = 0.5 * zoom;
      for (let sb = 0; sb < 3; sb++) {
        const sy = scTop + (scBot - scTop) * (0.2 + sb * 0.3);
        ctx.beginPath();
        ctx.moveTo(-size * 0.014, sy);
        ctx.lineTo(size * 0.014, sy);
        ctx.stroke();
      }

      // Scepter orb
      const orbY = foreLen * 0.5;
      const orbGrad = ctx.createRadialGradient(0, orbY, 0, 0, orbY, size * 0.055);
      orbGrad.addColorStop(0, "#f0d0ff");
      orbGrad.addColorStop(0.4, "#b070e0");
      orbGrad.addColorStop(1, "#6030a0");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(0, orbY, size * 0.055, 0, TAU);
      ctx.fill();

      // Orb inner glow
      const orbPulse = 0.6 + Math.sin(time * 4) * 0.3;
      ctx.fillStyle = `rgba(200, 160, 255, ${orbPulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(0, orbY, size * 0.08, 0, TAU);
      ctx.fill();
    },
  });

  // Scepter energy arcs (absolute coords)
  if (isAttacking) {
    drawEnergyArc(ctx, scepterArmX, scepterArmY + size * 0.2, cx0, y - size * 0.5, time, zoom, {
      color: "rgba(180, 120, 255, 0.7)", segments: 6, amplitude: 8, width: 1.5,
    });
  }

  // Orbiting soul fragments around scepter area
  drawOrbitingDebris(ctx, scepterArmX, scepterArmY + size * 0.15, size * 0.4, time, zoom, {
    count: 4, minRadius: 0.15, maxRadius: 0.25, speed: 2, particleSize: 0.015,
    color: "#b080e0", glowColor: "rgba(180, 120, 255, 0.3)", trailLen: 2,
  });

  // === RIGHT ARM ===
  drawPathArm(ctx, cx0 + size * 0.17, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.22, foreLen: 0.17,
    shoulderAngle: -0.5 + Math.sin(time * 1.5) * 0.1 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.4 : 0),
    elbowAngle: -0.6 + Math.sin(time * 2.2) * 0.08,
    style: 'bone',
  });

  // === SKULL HEAD ===
  const skullX = cx0;
  const skullY = y - size * 0.3 - bodyBob;

  // Skull — regal, slightly elongated with prominent cheekbones
  const craniumGrad = ctx.createRadialGradient(skullX, skullY - size * 0.01, 0, skullX, skullY, size * 0.11);
  craniumGrad.addColorStop(0, boneWhite);
  craniumGrad.addColorStop(0.6, boneMid);
  craniumGrad.addColorStop(1, boneDark);
  ctx.fillStyle = craniumGrad;
  ctx.beginPath();
  ctx.moveTo(skullX, skullY - size * 0.095);
  ctx.quadraticCurveTo(skullX + size * 0.055, skullY - size * 0.095, skullX + size * 0.08, skullY - size * 0.06);
  ctx.quadraticCurveTo(skullX + size * 0.09, skullY - size * 0.02, skullX + size * 0.085, skullY + size * 0.02);
  ctx.quadraticCurveTo(skullX + size * 0.09, skullY + size * 0.05, skullX + size * 0.06, skullY + size * 0.07);
  ctx.quadraticCurveTo(skullX + size * 0.03, skullY + size * 0.085, skullX, skullY + size * 0.08);
  ctx.quadraticCurveTo(skullX - size * 0.03, skullY + size * 0.085, skullX - size * 0.06, skullY + size * 0.07);
  ctx.quadraticCurveTo(skullX - size * 0.09, skullY + size * 0.05, skullX - size * 0.085, skullY + size * 0.02);
  ctx.quadraticCurveTo(skullX - size * 0.09, skullY - size * 0.02, skullX - size * 0.08, skullY - size * 0.06);
  ctx.quadraticCurveTo(skullX - size * 0.055, skullY - size * 0.095, skullX, skullY - size * 0.095);
  ctx.closePath();
  ctx.fill();
  // Temporal depressions
  for (const side of [-1, 1]) {
    ctx.fillStyle = boneDark;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(skullX + side * size * 0.06, skullY - size * 0.03);
    ctx.quadraticCurveTo(skullX + side * size * 0.08, skullY + size * 0.01, skullX + side * size * 0.065, skullY + size * 0.04);
    ctx.quadraticCurveTo(skullX + side * size * 0.055, skullY + size * 0.02, skullX + side * size * 0.06, skullY - size * 0.03);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Brow ridge
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.07, skullY + size * 0.005);
  ctx.quadraticCurveTo(skullX, skullY - size * 0.012, skullX + size * 0.07, skullY + size * 0.005);
  ctx.quadraticCurveTo(skullX, skullY + size * 0.02, skullX - size * 0.07, skullY + size * 0.005);
  ctx.closePath();
  ctx.fill();

  // Eye sockets — angular regal shape
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0020";
    ctx.beginPath();
    ctx.moveTo(skullX + side * size * 0.015, skullY + size * 0.003);
    ctx.quadraticCurveTo(skullX + side * size * 0.035, skullY - size * 0.01, skullX + side * size * 0.055, skullY + size * 0.005);
    ctx.quadraticCurveTo(skullX + side * size * 0.058, skullY + size * 0.025, skullX + side * size * 0.045, skullY + size * 0.035);
    ctx.quadraticCurveTo(skullX + side * size * 0.03, skullY + size * 0.038, skullX + side * size * 0.02, skullY + size * 0.03);
    ctx.quadraticCurveTo(skullX + side * size * 0.013, skullY + size * 0.018, skullX + side * size * 0.015, skullY + size * 0.003);
    ctx.closePath();
    ctx.fill();
  }

  // Purple soul-fire eyes
  drawGlowingEyes(ctx, skullX, skullY + size * 0.01, size, time, {
    spacing: 0.035,
    eyeRadius: 0.016,
    pupilRadius: 0.007,
    irisColor: "#b060e0",
    pupilColor: "#e0b0ff",
    glowColor: "rgba(160, 80, 220, 0.7)",
    glowRadius: 0.06,
    pulseSpeed: 3,
    lookSpeed: 1,
    lookAmount: 0.006,
  });

  // === ENHANCED EYE SOCKET GLOW ===
  for (const side of [-1, 1]) {
    const eyeGlowX = skullX + side * size * 0.035;
    const eyeGlowY = skullY + size * 0.01;
    const eyeFirePulse = 0.6 + Math.sin(time * 4 + side * 1.5) * 0.3;
    const eyeFireGrad = ctx.createRadialGradient(eyeGlowX, eyeGlowY, 0, eyeGlowX, eyeGlowY, size * 0.04);
    eyeFireGrad.addColorStop(0, `rgba(255, 215, 0, ${eyeFirePulse * 0.7})`);
    eyeFireGrad.addColorStop(0.3, `rgba(218, 165, 32, ${eyeFirePulse * 0.4})`);
    eyeFireGrad.addColorStop(0.6, `rgba(200, 160, 32, ${eyeFirePulse * 0.15})`);
    eyeFireGrad.addColorStop(1, "rgba(140, 106, 16, 0)");
    ctx.fillStyle = eyeFireGrad;
    ctx.beginPath();
    ctx.arc(eyeGlowX, eyeGlowY, size * 0.04, 0, TAU);
    ctx.fill();
    for (let ef = 0; ef < 3; ef++) {
      const efPhase = (time * 1.5 + ef * 0.33 + side * 0.5) % 1;
      const efX = eyeGlowX + Math.sin(time * 5 + ef * 2 + side) * size * 0.008;
      const efY = eyeGlowY - efPhase * size * 0.04;
      const efAlpha = (1 - efPhase) * eyeFirePulse * 0.5;
      ctx.fillStyle = `rgba(255, 215, 0, ${efAlpha})`;
      ctx.beginPath();
      ctx.arc(efX, efY, size * 0.005 * (1 - efPhase * 0.5), 0, TAU);
      ctx.fill();
    }
  }

  // Jaw
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.06, skullY + size * 0.035);
  ctx.quadraticCurveTo(skullX, skullY + size * 0.09, skullX + size * 0.06, skullY + size * 0.035);
  ctx.closePath();
  ctx.fill();

  // === GOLDEN CROWN ===
  const crownY = skullY - size * 0.08;
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.1, crownY + size * 0.04);
  ctx.lineTo(skullX - size * 0.1, crownY);
  ctx.lineTo(skullX - size * 0.06, crownY + size * 0.015);
  ctx.lineTo(skullX - size * 0.03, crownY - size * 0.02);
  ctx.lineTo(skullX, crownY + size * 0.01);
  ctx.lineTo(skullX + size * 0.03, crownY - size * 0.02);
  ctx.lineTo(skullX + size * 0.06, crownY + size * 0.015);
  ctx.lineTo(skullX + size * 0.1, crownY);
  ctx.lineTo(skullX + size * 0.1, crownY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Crown gold band
  const bandGrad = ctx.createLinearGradient(skullX - size * 0.1, crownY + size * 0.02, skullX + size * 0.1, crownY + size * 0.04);
  bandGrad.addColorStop(0, goldDark);
  bandGrad.addColorStop(0.3, goldBright);
  bandGrad.addColorStop(0.7, goldMid);
  bandGrad.addColorStop(1, goldDark);
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.1, crownY + size * 0.025);
  ctx.quadraticCurveTo(skullX - size * 0.05, crownY + size * 0.022, skullX, crownY + size * 0.024);
  ctx.quadraticCurveTo(skullX + size * 0.05, crownY + size * 0.022, skullX + size * 0.1, crownY + size * 0.025);
  ctx.lineTo(skullX + size * 0.1, crownY + size * 0.043);
  ctx.quadraticCurveTo(skullX + size * 0.05, crownY + size * 0.046, skullX, crownY + size * 0.044);
  ctx.quadraticCurveTo(skullX - size * 0.05, crownY + size * 0.046, skullX - size * 0.1, crownY + size * 0.043);
  ctx.closePath();
  ctx.fill();

  // Crown jewels
  const crownJewelColors = ["#ff3050", "#4080ff", "#ff3050"];
  for (let j = 0; j < 3; j++) {
    const jx = skullX - size * 0.04 + j * size * 0.04;
    ctx.fillStyle = crownJewelColors[j];
    ctx.beginPath();
    ctx.arc(jx, crownY + size * 0.033, size * 0.008, 0, TAU);
    ctx.fill();
    // Jewel shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(jx - size * 0.002, crownY + size * 0.03, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // === CROWN GEM PULSING GLOW ===
  for (let cg = 0; cg < 3; cg++) {
    const cgx = skullX - size * 0.04 + cg * size * 0.04;
    const cgPulse = 0.5 + Math.sin(time * 3.5 + cg * 1.2) * 0.4;
    const cgR = cg === 1 ? 64 : 255;
    const cgG = cg === 1 ? 128 : 48;
    const cgB = cg === 1 ? 255 : 80;
    const cgGrad = ctx.createRadialGradient(cgx, crownY + size * 0.033, 0, cgx, crownY + size * 0.033, size * 0.025);
    cgGrad.addColorStop(0, `rgba(${cgR}, ${cgG}, ${cgB}, ${cgPulse * 0.6})`);
    cgGrad.addColorStop(0.5, `rgba(${cgR}, ${cgG}, ${cgB}, ${cgPulse * 0.25})`);
    cgGrad.addColorStop(1, `rgba(${cgR}, ${cgG}, ${cgB}, 0)`);
    ctx.fillStyle = cgGrad;
    ctx.beginPath();
    ctx.arc(cgx, crownY + size * 0.033, size * 0.025, 0, TAU);
    ctx.fill();
  }

  // === SOUL COMMAND WISPS ===
  for (let sw = 0; sw < 7; sw++) {
    const swSeed = sw * 1.618;
    const swPhase = (time * 0.4 + swSeed) % 1;
    const swAngle = swSeed * TAU + time * 0.6;
    const swDist = size * 0.2 + swPhase * size * 0.25;
    const swX = cx0 + Math.cos(swAngle) * swDist;
    const swY = y - size * 0.15 + Math.sin(swAngle) * swDist * 0.4 - swPhase * size * 0.15;
    const swAlpha = (1 - swPhase) * 0.35 * (swPhase < 0.15 ? swPhase / 0.15 : 1);
    const swSize = size * 0.015 * (1 - swPhase * 0.4);
    const wispGrad = ctx.createRadialGradient(swX, swY, 0, swX, swY, swSize * 2.5);
    wispGrad.addColorStop(0, `rgba(200, 220, 255, ${swAlpha * 0.6})`);
    wispGrad.addColorStop(0.5, `rgba(150, 180, 255, ${swAlpha * 0.3})`);
    wispGrad.addColorStop(1, "rgba(100, 140, 220, 0)");
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.arc(swX, swY, swSize * 2.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 240, 255, ${swAlpha})`;
    ctx.beginPath();
    ctx.arc(swX, swY, swSize, 0, TAU);
    ctx.fill();
  }

  // === OVERLAY EFFECTS ===
  drawPulsingGlowRings(ctx, cx0, y - size * 0.1, size * 0.4, time, zoom, {
    count: 3, speed: 1.2, color: "rgba(160, 80, 220, 0.4)", maxAlpha: 0.25, expansion: 1.5,
  });

  drawShadowWisps(ctx, cx0, y - size * 0.1, size * 0.55, time, zoom, {
    count: 5, speed: 1.0, color: "rgba(100, 50, 160, 0.5)", maxAlpha: 0.2, wispLength: 0.4,
  });
}

// ============================================================================
// 5. ZOMBIE SHAMBLER — Rotting zombie with exposed bones and infection
// ============================================================================

export function drawZombieShamblerEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.8;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3;
  const breath = getBreathScale(time, 1, 0.018);
  const sway = getIdleSway(time, 0.8, size * 0.006, size * 0.004);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.016;
  const lurch = Math.sin(walkPhase * 0.5) * size * 0.02;
  const cx0 = x + sway.dx + lurch;

  const fleshLight = bodyColorLight;
  const fleshMid = bodyColor;
  const fleshDark = bodyColorDark;

  // === BLOOD TRAIL DRIPS ===
  for (let i = 0; i < 4; i++) {
    const seed = i * 1.73;
    const phase = (time * 0.4 + seed) % 1;
    const dx = cx0 + Math.sin(seed * 5) * size * 0.15 - phase * size * 0.03;
    const dy = y + size * 0.5;
    const alpha = (1 - phase) * 0.3;
    ctx.fillStyle = `rgba(120, 20, 20, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(dx, dy, size * 0.015 * (1 - phase * 0.5), size * 0.005, 0, 0, TAU);
    ctx.fill();
  }

  // === FLIES ===
  drawOrbitingDebris(ctx, cx0, y - size * 0.15, size * 0.4, time, zoom, {
    count: 5, minRadius: 0.2, maxRadius: 0.4, speed: 4, particleSize: 0.008,
    color: "#2a2a2a", glowColor: "rgba(40, 40, 40, 0.2)", trailLen: 1,
  });

  // === SHAMBLING LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.3, width: 0.12, strideSpeed: 3, strideAmt: 0.2,
    color: fleshMid, colorDark: fleshDark, footColor: fleshDark, footLen: 0.11,
    shuffle: true,
    style: 'fleshy',
  });

  // === HUNCHED TORSO ===
  const torsoY = y - size * 0.08 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  // Torn shirt base
  const shirtGrad = ctx.createLinearGradient(cx0 - size * 0.15, torsoY - size * 0.18, cx0 + size * 0.15, torsoY + size * 0.1);
  shirtGrad.addColorStop(0, "#4a4a5a");
  shirtGrad.addColorStop(0.5, "#3a3a4a");
  shirtGrad.addColorStop(1, "#2a2a3a");
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.13, torsoY + size * 0.14);
  ctx.lineTo(cx0 - size * 0.16, torsoY - size * 0.04);
  ctx.quadraticCurveTo(cx0 - size * 0.08, torsoY - size * 0.2, cx0 + size * 0.05, torsoY - size * 0.18);
  ctx.quadraticCurveTo(cx0 + size * 0.14, torsoY - size * 0.15, cx0 + size * 0.15, torsoY - size * 0.04);
  ctx.lineTo(cx0 + size * 0.13, torsoY + size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Exposed flesh wound — torn open section showing muscle and ribs
  const woundCX = cx0 + size * 0.04;
  const woundCY = torsoY - size * 0.02;
  ctx.fillStyle = fleshMid;
  ctx.beginPath();
  ctx.moveTo(woundCX - size * 0.03, woundCY - size * 0.07);
  ctx.quadraticCurveTo(woundCX + size * 0.04, woundCY - size * 0.08, woundCX + size * 0.06, woundCY - size * 0.04);
  ctx.quadraticCurveTo(woundCX + size * 0.065, woundCY + size * 0.03, woundCX + size * 0.05, woundCY + size * 0.06);
  ctx.quadraticCurveTo(woundCX + size * 0.02, woundCY + size * 0.08, woundCX - size * 0.02, woundCY + size * 0.065);
  ctx.quadraticCurveTo(woundCX - size * 0.05, woundCY + size * 0.04, woundCX - size * 0.055, woundCY - size * 0.01);
  ctx.quadraticCurveTo(woundCX - size * 0.05, woundCY - size * 0.05, woundCX - size * 0.03, woundCY - size * 0.07);
  ctx.closePath();
  ctx.fill();
  // Darker muscle layer under flesh
  ctx.fillStyle = "rgba(120, 40, 40, 0.4)";
  ctx.beginPath();
  ctx.moveTo(woundCX - size * 0.01, woundCY - size * 0.04);
  ctx.quadraticCurveTo(woundCX + size * 0.03, woundCY - size * 0.05, woundCX + size * 0.04, woundCY);
  ctx.quadraticCurveTo(woundCX + size * 0.03, woundCY + size * 0.04, woundCX, woundCY + size * 0.035);
  ctx.quadraticCurveTo(woundCX - size * 0.03, woundCY + size * 0.02, woundCX - size * 0.01, woundCY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Exposed ribs — curved bone segments
  ctx.strokeStyle = "#d0c8b0";
  ctx.lineWidth = size * 0.012;
  ctx.lineCap = "round";
  for (let r = 0; r < 3; r++) {
    const ry = torsoY - size * 0.04 + r * size * 0.035;
    ctx.beginPath();
    ctx.moveTo(cx0 + size * 0.005, ry);
    ctx.bezierCurveTo(cx0 + size * 0.03, ry - size * 0.006, cx0 + size * 0.06, ry + size * 0.004, cx0 + size * 0.08, ry + size * 0.02);
    ctx.stroke();
    // Bone highlight
    ctx.strokeStyle = "rgba(230, 220, 200, 0.3)";
    ctx.lineWidth = size * 0.005;
    ctx.beginPath();
    ctx.moveTo(cx0 + size * 0.015, ry - size * 0.003);
    ctx.quadraticCurveTo(cx0 + size * 0.04, ry - size * 0.006, cx0 + size * 0.06, ry + size * 0.005);
    ctx.stroke();
    ctx.strokeStyle = "#d0c8b0";
    ctx.lineWidth = size * 0.012;
  }

  // Infected wound on left torso — ragged edges
  ctx.fillStyle = "rgba(120, 30, 30, 0.5)";
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.045, torsoY + size * 0.01);
  ctx.quadraticCurveTo(cx0 - size * 0.06, torsoY + size * 0.005, cx0 - size * 0.075, torsoY + size * 0.02);
  ctx.quadraticCurveTo(cx0 - size * 0.08, torsoY + size * 0.035, cx0 - size * 0.06, torsoY + size * 0.04);
  ctx.quadraticCurveTo(cx0 - size * 0.04, torsoY + size * 0.035, cx0 - size * 0.045, torsoY + size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Infection seeping edges
  ctx.strokeStyle = "rgba(180, 200, 60, 0.25)";
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.08, torsoY + size * 0.015);
  ctx.quadraticCurveTo(cx0 - size * 0.09, torsoY + size * 0.03, cx0 - size * 0.07, torsoY + size * 0.045);
  ctx.stroke();

  // Shirt tear details — multiple ragged tear lines
  ctx.strokeStyle = "#5a5a6a";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.03, torsoY - size * 0.12);
  ctx.lineTo(cx0 - size * 0.01, torsoY - size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.02, torsoY - size * 0.15);
  ctx.quadraticCurveTo(cx0 + size * 0.03, torsoY - size * 0.1, cx0 + size * 0.015, torsoY - size * 0.06);
  ctx.stroke();

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, fleshDark, fleshDark, 'tattered');
  }
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.08, size, size * 0.13, "#3a3a4a", "#2a2a3a");

  // === REACHING ARM (left) — zombie lurch forward ===
  drawPathArm(ctx, cx0 - size * 0.16, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: fleshMid, colorDark: fleshDark, handColor: fleshDark,
    upperLen: 0.28, foreLen: 0.24, handRadius: 0.052,
    shoulderAngle: -0.9 + Math.sin(time * 1.5) * 0.12 + (isAttacking ? -0.3 : 0),
    elbowAngle: 0.3 + Math.sin(time * 2) * 0.08,
    style: 'fleshy',
  });

  // === HANGING ARM (right) — limp, dragging ===
  drawPathArm(ctx, cx0 + size * 0.14, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: fleshMid, colorDark: fleshDark, handColor: "#d0c8b0",
    upperLen: 0.27, foreLen: 0.22,
    shoulderAngle: 1.1 + Math.sin(time * 2.5) * 0.05,
    elbowAngle: 0.9 + Math.sin(time * 1.8) * 0.04,
    style: 'fleshy',
  });

  // === LOPSIDED HEAD ===
  const headX = cx0 + size * 0.02;
  const headY = y - size * 0.24 - bodyBob;

  // Lopsided decaying head — asymmetric bezier, sagging flesh on one side
  const headGrad = ctx.createLinearGradient(headX - size * 0.1, headY - size * 0.06, headX + size * 0.1, headY + size * 0.06);
  headGrad.addColorStop(0, fleshDark);
  headGrad.addColorStop(0.3, fleshMid);
  headGrad.addColorStop(0.6, fleshLight);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.02, headY - size * 0.09);
  ctx.quadraticCurveTo(headX + size * 0.05, headY - size * 0.095, headX + size * 0.08, headY - size * 0.05);
  ctx.quadraticCurveTo(headX + size * 0.095, headY + size * 0.01, headX + size * 0.085, headY + size * 0.06);
  ctx.quadraticCurveTo(headX + size * 0.05, headY + size * 0.1, headX, headY + size * 0.08);
  ctx.quadraticCurveTo(headX - size * 0.06, headY + size * 0.1, headX - size * 0.09, headY + size * 0.05);
  ctx.quadraticCurveTo(headX - size * 0.1, headY + size * 0.0, headX - size * 0.085, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.06, headY - size * 0.085, headX - size * 0.02, headY - size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Sagging flesh fold on right cheek
  ctx.fillStyle = fleshDark;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.06, headY + size * 0.02);
  ctx.quadraticCurveTo(headX + size * 0.09, headY + size * 0.04, headX + size * 0.08, headY + size * 0.07);
  ctx.quadraticCurveTo(headX + size * 0.06, headY + size * 0.06, headX + size * 0.06, headY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Patchy hair — irregular clumps clinging to scalp
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY - size * 0.07);
  ctx.quadraticCurveTo(headX - size * 0.02, headY - size * 0.09, headX + size * 0.03, headY - size * 0.08);
  ctx.lineTo(headX + size * 0.02, headY - size * 0.06);
  ctx.quadraticCurveTo(headX - size * 0.01, headY - size * 0.07, headX - size * 0.05, headY - size * 0.055);
  ctx.closePath();
  ctx.fill();
  // Stringy hair strands
  ctx.strokeStyle = "#2a2015";
  ctx.lineWidth = size * 0.006;
  for (let h = 0; h < 3; h++) {
    const hx = headX - size * 0.04 + h * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(hx, headY - size * 0.07);
    ctx.quadraticCurveTo(hx + size * 0.01, headY - size * 0.09, hx + Math.sin(time * 2 + h) * size * 0.008, headY - size * 0.11);
    ctx.stroke();
  }

  // Deep cheek wound — torn open with exposed bone
  ctx.fillStyle = "rgba(130, 30, 30, 0.6)";
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.045, headY + size * 0.01);
  ctx.quadraticCurveTo(headX + size * 0.075, headY + size * 0.015, headX + size * 0.07, headY + size * 0.035);
  ctx.quadraticCurveTo(headX + size * 0.06, headY + size * 0.04, headX + size * 0.045, headY + size * 0.03);
  ctx.closePath();
  ctx.fill();
  // Exposed bone through wound
  ctx.fillStyle = "#d0c8b0";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.055, headY + size * 0.015);
  ctx.lineTo(headX + size * 0.065, headY + size * 0.02);
  ctx.lineTo(headX + size * 0.06, headY + size * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Unequal eyes
  ctx.fillStyle = "#c8c880";
  ctx.beginPath();
  ctx.arc(headX - size * 0.035, headY + size * 0.005, size * 0.018, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.03, headY - size * 0.005, size * 0.013, 0, TAU);
  ctx.fill();

  // Pupils (uneven)
  ctx.fillStyle = "#1a1a00";
  ctx.beginPath();
  ctx.arc(headX - size * 0.035, headY + size * 0.008, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.032, headY - size * 0.002, size * 0.006, 0, TAU);
  ctx.fill();

  // Slack jaw with teeth
  const jawOffset = Math.sin(walkPhase * 0.7) * size * 0.005;
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.05, headY + size * 0.04);
  ctx.quadraticCurveTo(headX, headY + size * 0.11 + jawOffset, headX + size * 0.05, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Mouth opening
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.06 + jawOffset, size * 0.03, size * 0.015, 0, 0, TAU);
  ctx.fill();

  // Teeth
  ctx.fillStyle = "#d0c8a0";
  for (let t = 0; t < 3; t++) {
    const tx = headX - size * 0.015 + t * size * 0.015;
    ctx.beginPath();
    ctx.rect(tx, headY + size * 0.048 + jawOffset, size * 0.007, size * 0.012);
    ctx.fill();
  }

  // Drool strand
  const droolPhase = (time * 0.6) % 1;
  ctx.strokeStyle = `rgba(160, 180, 120, ${0.3 + Math.sin(time * 3) * 0.15})`;
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.01, headY + size * 0.07 + jawOffset);
  ctx.quadraticCurveTo(headX + size * 0.015, headY + size * 0.1 + jawOffset + droolPhase * size * 0.04, headX + size * 0.008, headY + size * 0.12 + jawOffset + droolPhase * size * 0.06);
  ctx.stroke();

  if (isAttacking) {
    const lungeOffset = attackPhase * size * 0.08;
    const clawSpread = (1 - attackPhase) * Math.PI * 0.6;
    for (const side of [-1, 1]) {
      const clawX = cx0 + side * size * 0.2 + lungeOffset;
      const clawY = y - size * 0.05;
      for (let c = 0; c < 3; c++) {
        const cAngle = side * (0.3 + c * 0.25) + clawSpread * side * 0.3;
        ctx.strokeStyle = `rgba(140, 80, 60, ${attackPhase * 0.6})`;
        ctx.lineWidth = (1.5 + attackPhase) * zoom;
        ctx.beginPath();
        ctx.moveTo(clawX, clawY);
        ctx.lineTo(
          clawX + Math.cos(cAngle) * size * 0.1,
          clawY + Math.sin(cAngle) * size * 0.08,
        );
        ctx.stroke();
      }
    }
    if (attackPhase > 0.5) {
      const biteAlpha = (attackPhase - 0.5) * 2;
      ctx.fillStyle = `rgba(130, 20, 20, ${biteAlpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(cx0 + lungeOffset, y - size * 0.1, size * 0.12 * biteAlpha, 0, TAU);
      ctx.fill();
    }
  }

  // === DECAY MIASMA ===
  for (let dm = 0; dm < 5; dm++) {
    const dmSeed = dm * 1.47;
    const dmPhase = (time * 0.5 + dmSeed) % 1;
    const dmX = cx0 + Math.sin(dmSeed * 4.2 + time * 0.8) * size * 0.15;
    const dmY = y - size * 0.05 - dmPhase * size * 0.35;
    const dmAlpha = (1 - dmPhase) * 0.25 * (dmPhase < 0.15 ? dmPhase / 0.15 : 1);
    const dmR = size * (0.02 + dmPhase * 0.025);
    const dmGrad = ctx.createRadialGradient(dmX, dmY, 0, dmX, dmY, dmR);
    dmGrad.addColorStop(0, `rgba(90, 140, 60, ${dmAlpha})`);
    dmGrad.addColorStop(0.5, `rgba(70, 110, 50, ${dmAlpha * 0.5})`);
    dmGrad.addColorStop(1, "rgba(50, 80, 40, 0)");
    ctx.fillStyle = dmGrad;
    ctx.beginPath();
    ctx.arc(dmX, dmY, dmR, 0, TAU);
    ctx.fill();
  }

  // === SHAMBLE GROUND IMPACT ===
  const shambleCadence = Math.sin(walkPhase * 0.5);
  const impactIntensity = Math.max(0, shambleCadence) * 0.6;
  if (impactIntensity > 0.1) {
    for (let gi = 0; gi < 3; gi++) {
      const giX = cx0 + (gi - 1) * size * 0.06 + Math.sin(time * 1.5 + gi) * size * 0.02;
      const giY = y + size * 0.5;
      const giR = size * 0.018 * impactIntensity;
      const giGrad = ctx.createRadialGradient(giX, giY, 0, giX, giY, giR);
      giGrad.addColorStop(0, `rgba(100, 90, 70, ${impactIntensity * 0.35})`);
      giGrad.addColorStop(1, "rgba(80, 70, 50, 0)");
      ctx.fillStyle = giGrad;
      ctx.beginPath();
      ctx.arc(giX, giY, giR, 0, TAU);
      ctx.fill();
    }
  }

  // === ROTTING FLESH GLOW ===
  const rotPulse = 0.25 + Math.sin(time * 1.8) * 0.15;
  const rotGrad = ctx.createRadialGradient(cx0, y - size * 0.06, 0, cx0, y - size * 0.06, size * 0.18);
  rotGrad.addColorStop(0, `rgba(120, 160, 50, ${rotPulse * 0.2})`);
  rotGrad.addColorStop(0.4, `rgba(100, 140, 40, ${rotPulse * 0.1})`);
  rotGrad.addColorStop(0.7, `rgba(80, 110, 30, ${rotPulse * 0.04})`);
  rotGrad.addColorStop(1, "rgba(60, 80, 20, 0)");
  ctx.fillStyle = rotGrad;
  ctx.beginPath();
  ctx.arc(cx0, y - size * 0.06, size * 0.18, 0, TAU);
  ctx.fill();

  // === TRAILING ROT DRIPS ===
  for (let rd = 0; rd < 3; rd++) {
    const rdSeed = rd * 2.13;
    const rdPhase = (time * 0.55 + rdSeed) % 1;
    const rdX = cx0 + (rd - 1) * size * 0.08 + Math.sin(rdSeed * 3) * size * 0.04;
    const rdStartY = y + size * 0.1;
    const rdY = rdStartY + rdPhase * size * 0.25;
    const rdAlpha = (1 - rdPhase) * 0.45;
    const rdR = size * 0.007 * (1 - rdPhase * 0.4);
    ctx.fillStyle = `rgba(80, 130, 45, ${rdAlpha})`;
    ctx.beginPath();
    ctx.arc(rdX, rdY, rdR, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(80, 130, 45, ${rdAlpha * 0.5})`;
    ctx.lineWidth = size * 0.003;
    ctx.beginPath();
    ctx.moveTo(rdX, rdStartY);
    ctx.lineTo(rdX + Math.sin(rdPhase * 2) * size * 0.005, rdY);
    ctx.stroke();
  }
}

// ============================================================================
// 6. ZOMBIE BRUTE — Bloated tank with chain armor and spiked gauntlets
// ============================================================================

export function drawZombieBruteEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 2.0;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 2.5;
  const breath = getBreathScale(time, 0.8, 0.02);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.015;
  const cx0 = x;

  const fleshLight = bodyColorLight;
  const fleshMid = bodyColor;
  const fleshDark = bodyColorDark;

  // === IMPACT CRACKS ON STOMP ===
  const stompPhase = Math.max(0, -Math.sin(walkPhase - 0.2));
  if (stompPhase > 0.85) {
    const crackAlpha = (stompPhase - 0.85) * 5;
    ctx.strokeStyle = `rgba(80, 70, 60, ${crackAlpha * 0.4})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let c = 0; c < 5; c++) {
      const angle = c * (TAU / 5) + time * 0.1;
      const len = size * 0.08 * crackAlpha;
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.52);
      ctx.lineTo(x + Math.cos(angle) * len, y + size * 0.52 + Math.sin(angle) * len * 0.35);
      ctx.stroke();
    }
  }

  // === TOXIC MIASMA ===
  drawShadowWisps(ctx, cx0, y - size * 0.1, size * 0.6, time, zoom, {
    count: 4, speed: 0.6, color: "rgba(80, 100, 40, 0.5)", maxAlpha: 0.2, wispLength: 0.35,
  });

  // === THICK LEGS WITH HEAVY BOOTS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.26, width: 0.11, strideSpeed: 2.5, strideAmt: 0.18,
    color: fleshDark, colorDark: "#2a2a20", footColor: "#3a3530", footLen: 0.12,
    shuffle: true,
    style: 'fleshy',
  });

  // === BLOATED TORSO WITH CHAIN ARMOR ===
  const torsoY = y - size * 0.08 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  // Bloated asymmetric body — bezier bulges for distended flesh
  const bodyGrad = ctx.createRadialGradient(cx0 - size * 0.02, torsoY + size * 0.02, size * 0.04, cx0, torsoY, size * 0.22);
  bodyGrad.addColorStop(0, fleshLight);
  bodyGrad.addColorStop(0.4, fleshMid);
  bodyGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.14, torsoY - size * 0.18);
  ctx.quadraticCurveTo(cx0 - size * 0.22, torsoY - size * 0.08, cx0 - size * 0.2, torsoY + size * 0.04);
  ctx.quadraticCurveTo(cx0 - size * 0.19, torsoY + size * 0.14, cx0 - size * 0.1, torsoY + size * 0.2);
  ctx.quadraticCurveTo(cx0, torsoY + size * 0.22, cx0 + size * 0.1, torsoY + size * 0.19);
  ctx.quadraticCurveTo(cx0 + size * 0.2, torsoY + size * 0.12, cx0 + size * 0.19, torsoY + size * 0.02);
  ctx.quadraticCurveTo(cx0 + size * 0.2, torsoY - size * 0.1, cx0 + size * 0.13, torsoY - size * 0.18);
  ctx.quadraticCurveTo(cx0 + size * 0.04, torsoY - size * 0.22, cx0 - size * 0.06, torsoY - size * 0.21);
  ctx.quadraticCurveTo(cx0 - size * 0.12, torsoY - size * 0.2, cx0 - size * 0.14, torsoY - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Exposed muscle striations on left side
  ctx.strokeStyle = "rgba(140, 50, 50, 0.35)";
  ctx.lineWidth = size * 0.006;
  for (let m = 0; m < 4; m++) {
    const my = torsoY - size * 0.06 + m * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.18, my);
    ctx.quadraticCurveTo(cx0 - size * 0.14, my + size * 0.01, cx0 - size * 0.1, my + size * 0.005);
    ctx.stroke();
  }

  // Chain armor overlay — shaped to body contour
  ctx.fillStyle = "rgba(80, 80, 90, 0.5)";
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.16);
  ctx.quadraticCurveTo(cx0 - size * 0.17, torsoY - size * 0.04, cx0 - size * 0.15, torsoY + size * 0.08);
  ctx.quadraticCurveTo(cx0, torsoY + size * 0.14, cx0 + size * 0.14, torsoY + size * 0.06);
  ctx.quadraticCurveTo(cx0 + size * 0.17, torsoY - size * 0.06, cx0 + size * 0.1, torsoY - size * 0.16);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.2, cx0 - size * 0.1, torsoY - size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Chain links — offset rows following body curvature
  ctx.strokeStyle = "rgba(120, 120, 130, 0.4)";
  ctx.lineWidth = 0.5 * zoom;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const lx = cx0 - size * 0.12 + col * size * 0.05 + (row % 2) * size * 0.025;
      const ly = torsoY - size * 0.1 + row * size * 0.04;
      ctx.beginPath();
      ctx.ellipse(lx, ly, size * 0.012, size * 0.008, 0, 0, TAU);
      ctx.stroke();
    }
  }

  // Rust patches with corrosion drip texture
  ctx.fillStyle = "rgba(140, 80, 40, 0.35)";
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.03, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0 + size * 0.07, torsoY - size * 0.04, cx0 + size * 0.06, torsoY - size * 0.01);
  ctx.quadraticCurveTo(cx0 + size * 0.04, torsoY, cx0 + size * 0.03, torsoY - size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY + size * 0.02);
  ctx.quadraticCurveTo(cx0 - size * 0.07, torsoY + size * 0.04, cx0 - size * 0.06, torsoY + size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Massive central stitched wound — thick suture line
  ctx.strokeStyle = "rgba(100, 30, 30, 0.6)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY + size * 0.04);
  ctx.quadraticCurveTo(cx0 - size * 0.06, torsoY + size * 0.08, cx0 - size * 0.01, torsoY + size * 0.12);
  ctx.stroke();
  ctx.strokeStyle = "#3a3a30";
  ctx.lineWidth = 0.7 * zoom;
  for (let s = 0; s < 5; s++) {
    const t = s / 4;
    const sx = cx0 - size * 0.1 + t * size * 0.09;
    const sy = torsoY + size * 0.04 + t * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.013, sy - size * 0.01);
    ctx.lineTo(sx + size * 0.013, sy + size * 0.01);
    ctx.stroke();
  }

  // Second lateral stitch scar
  ctx.strokeStyle = "rgba(90, 25, 25, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.05, torsoY - size * 0.12);
  ctx.lineTo(cx0 + size * 0.1, torsoY + size * 0.02);
  ctx.stroke();
  ctx.strokeStyle = "#3a3a30";
  ctx.lineWidth = 0.6 * zoom;
  for (let s = 0; s < 4; s++) {
    const t = s / 3;
    const sx = cx0 + size * 0.05 + t * size * 0.05;
    const sy = torsoY - size * 0.12 + t * size * 0.14;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.01, sy - size * 0.008);
    ctx.lineTo(sx + size * 0.01, sy + size * 0.008);
    ctx.stroke();
  }

  // Metal restraint plates bolted to flesh
  const plateGrad = ctx.createLinearGradient(cx0 + size * 0.04, torsoY - size * 0.08, cx0 + size * 0.15, torsoY + size * 0.06);
  plateGrad.addColorStop(0, "#6a6a70");
  plateGrad.addColorStop(0.5, "#5a5a60");
  plateGrad.addColorStop(1, "#4a4a50");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.06, torsoY - size * 0.08);
  ctx.lineTo(cx0 + size * 0.15, torsoY - size * 0.05);
  ctx.lineTo(cx0 + size * 0.14, torsoY + size * 0.05);
  ctx.lineTo(cx0 + size * 0.05, torsoY + size * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a3a40";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();
  // Bolt heads with cross-slot detail
  for (const [bx, by] of [[0.08, -0.04], [0.12, 0.0], [0.07, 0.02]] as [number, number][]) {
    ctx.fillStyle = "#8a8a90";
    ctx.beginPath();
    ctx.arc(cx0 + bx * size, torsoY + by * size, size * 0.009, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#5a5a60";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx0 + bx * size - size * 0.005, torsoY + by * size);
    ctx.lineTo(cx0 + bx * size + size * 0.005, torsoY + by * size);
    ctx.stroke();
  }

  // Flesh bulging around plate edges
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.05, torsoY - size * 0.07);
  ctx.quadraticCurveTo(cx0 + size * 0.04, torsoY - size * 0.05, cx0 + size * 0.05, torsoY - size * 0.03);
  ctx.lineTo(cx0 + size * 0.06, torsoY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, "#5a5a60", "#3a3a40", 'round');
  }
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.08, size, size * 0.16, "#6a6a70", "#4a4a50");

  // === HANGING CHAINS ===
  for (const chainX of [cx0 - size * 0.15, cx0 + size * 0.12]) {
    const swing = Math.sin(time * 2 + chainX) * 0.1;
    ctx.save();
    ctx.translate(chainX, torsoY + size * 0.08 - bodyBob);
    ctx.rotate(swing);
    ctx.strokeStyle = "#6a6a70";
    ctx.lineWidth = size * 0.008;
    for (let link = 0; link < 4; link++) {
      const ly = link * size * 0.03;
      ctx.beginPath();
      ctx.ellipse(0, ly, size * 0.012, size * 0.015, (link % 2) * Math.PI / 2, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  // === SPIKED GAUNTLET ARMS ===
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.18, torsoY - size * 0.08 - bodyBob, size, time, zoom, side, {
      color: fleshMid, colorDark: fleshDark, handColor: "#4a4a50",
      upperLen: 0.34, foreLen: 0.29, width: 0.12, handRadius: 0.06,
      shoulderAngle: side * -0.45 + (isAttacking ? Math.sin(time * 8 + side) * 0.5 : Math.sin(time * 2.5 + side) * 0.12),
      elbowAngle: -0.7 + (isAttacking ? side * 0.4 : Math.sin(time * 3 + side * 2) * 0.1),
      style: 'fleshy',
    });
  }

  // === SMALL ANGRY HEAD ===
  const headX = cx0;
  const headY = y - size * 0.22 - bodyBob;

  // Small misshapen head — squat and brutish with heavy brow
  const headGrad = ctx.createLinearGradient(headX - size * 0.07, headY - size * 0.05, headX + size * 0.07, headY + size * 0.05);
  headGrad.addColorStop(0, fleshDark);
  headGrad.addColorStop(0.3, fleshMid);
  headGrad.addColorStop(0.7, fleshLight);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.065);
  ctx.quadraticCurveTo(headX + size * 0.05, headY - size * 0.06, headX + size * 0.07, headY - size * 0.02);
  ctx.quadraticCurveTo(headX + size * 0.075, headY + size * 0.03, headX + size * 0.05, headY + size * 0.06);
  ctx.quadraticCurveTo(headX + size * 0.02, headY + size * 0.075, headX, headY + size * 0.07);
  ctx.quadraticCurveTo(headX - size * 0.02, headY + size * 0.075, headX - size * 0.05, headY + size * 0.06);
  ctx.quadraticCurveTo(headX - size * 0.075, headY + size * 0.03, headX - size * 0.07, headY - size * 0.02);
  ctx.quadraticCurveTo(headX - size * 0.05, headY - size * 0.06, headX, headY - size * 0.065);
  ctx.closePath();
  ctx.fill();

  // Massive brow ridge — overhanging, prominent
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.065, headY + size * 0.005);
  ctx.quadraticCurveTo(headX - size * 0.04, headY - size * 0.015, headX, headY - size * 0.01);
  ctx.quadraticCurveTo(headX + size * 0.04, headY - size * 0.015, headX + size * 0.065, headY + size * 0.005);
  ctx.quadraticCurveTo(headX + size * 0.03, headY + size * 0.015, headX, headY + size * 0.012);
  ctx.quadraticCurveTo(headX - size * 0.03, headY + size * 0.015, headX - size * 0.065, headY + size * 0.005);
  ctx.closePath();
  ctx.fill();

  // Deep-set angry eyes under brow
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.025, headY + size * 0.013, size * 0.013, size * 0.01, side * 0.15, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#cc3030";
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.025, headY + size * 0.015, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.025, headY + size * 0.016, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Wide snarling maw with jagged teeth
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.035, headY + size * 0.035);
  ctx.quadraticCurveTo(headX, headY + size * 0.055, headX + size * 0.035, headY + size * 0.035);
  ctx.quadraticCurveTo(headX, headY + size * 0.065, headX - size * 0.035, headY + size * 0.035);
  ctx.closePath();
  ctx.fill();
  // Jagged teeth — uneven, broken
  ctx.fillStyle = "#d0c8a0";
  const bruteTeeth = [-0.022, -0.01, 0.002, 0.014, 0.024];
  for (let t = 0; t < bruteTeeth.length; t++) {
    const tx = headX + bruteTeeth[t] * size;
    const tH = (t % 2 === 0) ? size * 0.012 : size * 0.008;
    ctx.beginPath();
    ctx.moveTo(tx, headY + size * 0.037);
    ctx.lineTo(tx + size * 0.003, headY + size * 0.037 + tH);
    ctx.lineTo(tx + size * 0.006, headY + size * 0.037);
    ctx.closePath();
    ctx.fill();
  }

  // Scars across face
  ctx.strokeStyle = "rgba(100, 30, 30, 0.4)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY - size * 0.03);
  ctx.lineTo(headX - size * 0.01, headY + size * 0.03);
  ctx.stroke();

  if (isAttacking) {
    const slamProgress = 1 - attackPhase;
    const slamDropY = slamProgress * size * 0.08;
    for (let ring = 0; ring < 3; ring++) {
      const rPhase = Math.min(1, slamProgress + ring * 0.12);
      const rR = size * (0.15 + rPhase * 0.4);
      const rAlpha = (1 - rPhase) * 0.4 * attackPhase;
      ctx.strokeStyle = `rgba(100, 70, 50, ${rAlpha})`;
      ctx.lineWidth = (2.5 - rPhase * 1.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(cx0, y + size * 0.48, rR, rR * ISO_Y_RATIO, 0, 0, TAU);
      ctx.stroke();
    }
    if (attackPhase > 0.6) {
      const impact = (attackPhase - 0.6) * 2.5;
      for (let d = 0; d < 6; d++) {
        const dAngle = d * Math.PI / 3 + time * 2;
        const dDist = size * 0.1 * (1 - impact * 0.5);
        ctx.fillStyle = `rgba(80, 60, 40, ${impact * 0.5})`;
        ctx.beginPath();
        ctx.arc(
          cx0 + Math.cos(dAngle) * dDist,
          y + size * 0.45 + Math.sin(dAngle) * dDist * ISO_Y_RATIO - slamDropY,
          size * 0.018 * impact, 0, TAU,
        );
        ctx.fill();
      }
    }
  }
}

// ============================================================================
// 7. ZOMBIE SPITTER — Acid-spitting zombie with bloated belly
// ============================================================================

export function drawZombieSpitterEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.8;
  const attackIntensity = attackPhase;
  const sprayBurst = Math.sin(attackIntensity * Math.PI);
  const walkPhase = time * 3.5;
  const breath = getBreathScale(time, 1.5, 0.025);
  const sway = getIdleSway(time, 1, size * 0.004, size * 0.003);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.014;
  const cx0 = x + sway.dx;

  const fleshMid = bodyColor;
  const fleshDark = bodyColorDark;

  // === ACID PUDDLE GROUND EFFECT ===
  drawPoisonBubbles(ctx, cx0, y + size * 0.48, size * 0.35, time, zoom, {
    count: 6, speed: 0.8, color: "rgba(120, 200, 60, 0.5)", maxAlpha: 0.35, maxSize: 0.1, spread: 0.8,
  });

  // === TOXIC GAS WISPS ===
  for (let i = 0; i < 4; i++) {
    const seed = i * 1.57;
    const phase = (time * 0.5 + seed) % 1;
    const gx = cx0 + Math.sin(seed * 4) * size * 0.15;
    const gy = y - phase * size * 0.5;
    ctx.globalAlpha = (1 - phase) * 0.15;
    ctx.fillStyle = "rgba(100, 180, 50, 0.4)";
    ctx.beginPath();
    ctx.arc(gx, gy, size * 0.025 * (1 + phase * 0.5), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.25, width: 0.13, strideSpeed: 3.5, strideAmt: 0.2,
    color: fleshMid, colorDark: fleshDark, footColor: fleshDark, footLen: 0.12,
    style: 'fleshy',
  });

  // === HUNCHED TORSO WITH BLOATED BELLY ===
  const torsoY = y - size * 0.06 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.rotate(attackIntensity * 0.2);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  // Tattered robe
  const robeGrad = ctx.createLinearGradient(cx0 - size * 0.14, torsoY - size * 0.15, cx0 + size * 0.14, torsoY + size * 0.1);
  robeGrad.addColorStop(0, "#3a4030");
  robeGrad.addColorStop(0.5, "#4a5040");
  robeGrad.addColorStop(1, "#2a3020");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.12, torsoY + size * 0.15);
  ctx.lineTo(cx0 - size * 0.14, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.2, cx0 + size * 0.14, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.12, torsoY + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Acid-eaten holes in robe
  ctx.fillStyle = fleshMid;
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.06, torsoY + size * 0.03, size * 0.03, size * 0.02, 0.5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx0 - size * 0.04, torsoY + size * 0.08, size * 0.02, size * 0.015, -0.3, 0, TAU);
  ctx.fill();

  // Swollen distended belly — asymmetric bezier bulge with toxic veins
  const bellyGlow = 0.3 + Math.sin(time * 3) * 0.15;
  const bellyCX = cx0 - size * 0.01;
  const bellyCY = torsoY + size * 0.05;
  const bellyGrad = ctx.createRadialGradient(bellyCX, bellyCY, size * 0.02, bellyCX, bellyCY, size * 0.13);
  bellyGrad.addColorStop(0, `rgba(140, 210, 70, ${bellyGlow * 0.8})`);
  bellyGrad.addColorStop(0.4, `rgba(100, 170, 50, ${bellyGlow * 0.4})`);
  bellyGrad.addColorStop(1, "rgba(60, 100, 30, 0)");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.02);
  ctx.quadraticCurveTo(cx0 - size * 0.14, torsoY + size * 0.04, cx0 - size * 0.12, torsoY + size * 0.12);
  ctx.quadraticCurveTo(cx0 - size * 0.06, torsoY + size * 0.17, cx0, torsoY + size * 0.16);
  ctx.quadraticCurveTo(cx0 + size * 0.08, torsoY + size * 0.15, cx0 + size * 0.11, torsoY + size * 0.1);
  ctx.quadraticCurveTo(cx0 + size * 0.13, torsoY + size * 0.04, cx0 + size * 0.1, torsoY - size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Toxic veins visible through stretched belly skin
  ctx.strokeStyle = `rgba(80, 160, 40, ${0.3 + bellyGlow * 0.2})`;
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.06, torsoY);
  ctx.quadraticCurveTo(cx0 - size * 0.08, torsoY + size * 0.06, cx0 - size * 0.04, torsoY + size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.04, torsoY + size * 0.01);
  ctx.quadraticCurveTo(cx0 + size * 0.07, torsoY + size * 0.08, cx0 + size * 0.03, torsoY + size * 0.13);
  ctx.stroke();
  ctx.lineWidth = size * 0.003;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.06, torsoY + size * 0.05);
  ctx.lineTo(cx0 - size * 0.02, torsoY + size * 0.08);
  ctx.stroke();

  // Internal bubbling — visible toxic buildup lumps
  for (let b = 0; b < 6; b++) {
    const bSeed = b * 2.1;
    const bPhase = (time * 1.5 + bSeed) % 1;
    const bx = bellyCX + Math.sin(bSeed * 3) * size * 0.07;
    const by = bellyCY - bPhase * size * 0.09;
    const bSize = size * 0.01 * (1 + bPhase * 0.6);
    ctx.fillStyle = `rgba(140, 220, 80, ${(1 - bPhase) * 0.3})`;
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, TAU);
    ctx.fill();
  }

  // Stretch marks on belly
  ctx.strokeStyle = fleshDark;
  ctx.lineWidth = 0.4 * zoom;
  ctx.globalAlpha = 0.3;
  for (let sm = 0; sm < 4; sm++) {
    const smx = cx0 - size * 0.04 + sm * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(smx, torsoY + size * 0.03);
    ctx.lineTo(smx + size * 0.005, torsoY + size * 0.1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.08 - bodyBob, size, side, fleshDark, fleshDark, 'tattered');
  }

  // === CLAW ARMS ===
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.14, torsoY - size * 0.08 - bodyBob, size, time, zoom, side, {
      color: fleshMid, colorDark: fleshDark, handColor: fleshDark,
      upperLen: 0.25, foreLen: 0.20,
      shoulderAngle: side * -0.35 + Math.sin(time * 3.5 + side * 1.5) * 0.12 + side * -0.4 * attackIntensity,
      elbowAngle: -0.5 - 0.3 * attackIntensity + Math.sin(time * 4 + side) * 0.1 * (1 - attackIntensity),
      style: 'fleshy',
    });
  }

  // === HEAD WITH DISTENDED JAW ===
  const headX = cx0;
  const headY = y - size * 0.24 - bodyBob;

  // Head with swollen throat and distended jaw
  const headGrad = ctx.createLinearGradient(headX - size * 0.08, headY - size * 0.06, headX + size * 0.08, headY + size * 0.06);
  headGrad.addColorStop(0, fleshDark);
  headGrad.addColorStop(0.3, fleshMid);
  headGrad.addColorStop(0.6, bodyColorLight);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.085);
  ctx.quadraticCurveTo(headX + size * 0.06, headY - size * 0.08, headX + size * 0.08, headY - size * 0.03);
  ctx.quadraticCurveTo(headX + size * 0.082, headY + size * 0.02, headX + size * 0.06, headY + size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.03, headY + size * 0.06, headX, headY + size * 0.05);
  ctx.quadraticCurveTo(headX - size * 0.03, headY + size * 0.06, headX - size * 0.06, headY + size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.082, headY + size * 0.02, headX - size * 0.08, headY - size * 0.03);
  ctx.quadraticCurveTo(headX - size * 0.06, headY - size * 0.08, headX, headY - size * 0.085);
  ctx.closePath();
  ctx.fill();

  // Swollen throat/gullet pouch — bulging with toxic fluid
  const throatPulse = breath;
  ctx.fillStyle = fleshMid;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY + size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.06, headY + size * 0.08 * throatPulse, headX - size * 0.03, headY + size * 0.1);
  ctx.quadraticCurveTo(headX, headY + size * 0.12 * throatPulse, headX + size * 0.03, headY + size * 0.1);
  ctx.quadraticCurveTo(headX + size * 0.06, headY + size * 0.08 * throatPulse, headX + size * 0.04, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Sickly glowing eyes — bulging, sunken sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a1a0a";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.03, headY + size * 0.003, size * 0.017, size * 0.015, side * 0.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#80e040";
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.03, headY + size * 0.005, size * 0.013, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1a1a00";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.03, headY + size * 0.007, size * 0.003, size * 0.009, 0, 0, TAU);
    ctx.fill();
  }

  // Massively distended jaw — unhinged; opening scales with attack
  const jawGlow = 0.3 + Math.sin(time * 4) * 0.15;
  const jawPivotY = headY + size * 0.042;
  ctx.save();
  ctx.translate(headX, jawPivotY);
  ctx.scale(1, 1 + attackIntensity * 0.5);
  ctx.translate(-headX, -jawPivotY);

  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.055, headY + size * 0.035);
  ctx.quadraticCurveTo(headX - size * 0.065, headY + size * 0.08, headX - size * 0.04, headY + size * 0.12);
  ctx.quadraticCurveTo(headX, headY + size * 0.15, headX + size * 0.04, headY + size * 0.12);
  ctx.quadraticCurveTo(headX + size * 0.065, headY + size * 0.08, headX + size * 0.055, headY + size * 0.035);
  ctx.closePath();
  ctx.fill();

  // Jaw teeth — broken, uneven
  ctx.fillStyle = "#c8c090";
  for (let t = 0; t < 5; t++) {
    const tx = headX - size * 0.03 + t * size * 0.015;
    const tLen = (t % 2 === 0) ? size * 0.015 : size * 0.01;
    ctx.beginPath();
    ctx.moveTo(tx, headY + size * 0.04);
    ctx.lineTo(tx + size * 0.003, headY + size * 0.04 + tLen);
    ctx.lineTo(tx + size * 0.006, headY + size * 0.04);
    ctx.closePath();
    ctx.fill();
  }

  // Inner mouth with toxic glow
  const mouthGlowR = size * (0.045 + attackIntensity * 0.035);
  const jawGlowGrad = ctx.createRadialGradient(headX, headY + size * 0.08, size * 0.01, headX, headY + size * 0.08, mouthGlowR);
  jawGlowGrad.addColorStop(0, `rgba(140, 220, 70, ${jawGlow * 0.8 * (0.5 + 0.5 * attackIntensity)})`);
  jawGlowGrad.addColorStop(0.6, `rgba(100, 180, 50, ${jawGlow * 0.3 * (0.5 + 0.5 * attackIntensity)})`);
  jawGlowGrad.addColorStop(1, "rgba(60, 120, 30, 0)");
  ctx.fillStyle = jawGlowGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.035, headY + size * 0.05);
  ctx.quadraticCurveTo(headX, headY + size * 0.11, headX + size * 0.035, headY + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Bile drips from mouth
  for (let d = 0; d < 2; d++) {
    const dPhase = (time * 0.7 + d * 0.5) % 1;
    ctx.fillStyle = `rgba(120, 200, 60, ${(1 - dPhase) * 0.5 * (0.4 + 0.6 * attackIntensity)})`;
    ctx.beginPath();
    ctx.ellipse(headX + (d - 0.5) * size * 0.025, headY + size * 0.1 + dPhase * size * 0.06, size * 0.005 * (1 - dPhase), size * 0.01 * (1 - dPhase), 0, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  // Bile stream — width, reach, and opacity follow attackIntensity
  if (attackIntensity > 0) {
    const streamAlpha = 0.5 * attackIntensity;
    ctx.strokeStyle = `rgba(120, 200, 60, ${streamAlpha})`;
    ctx.lineWidth = size * 0.015 * (0.35 + 0.65 * attackIntensity);
    ctx.lineCap = "round";
    const streamEndX = headX + size * (0.25 + 0.1 * attackIntensity);
    const streamMidY = headY + size * (0.2 + 0.04 * attackIntensity);
    ctx.beginPath();
    ctx.moveTo(headX, headY + size * 0.1);
    ctx.quadraticCurveTo(headX + size * 0.1, streamMidY, streamEndX, headY + size * 0.15);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Splatter particles — scaled by attack phase
    for (let s = 0; s < 4; s++) {
      const sx = headX + size * 0.2 + Math.sin(time * 10 + s) * size * 0.05 * attackIntensity;
      const sy = headY + size * 0.15 + Math.cos(time * 8 + s) * size * 0.03 * attackIntensity;
      const splatR = size * 0.008 * (0.45 + 0.55 * attackIntensity);
      ctx.fillStyle = `rgba(120, 200, 60, ${0.4 * attackIntensity})`;
      ctx.beginPath();
      ctx.arc(sx, sy, splatR, 0, TAU);
      ctx.fill();
    }

    // Acid spray burst — strongest near attackPhase ≈ 0.5
    const burstCount = 6 + Math.floor(sprayBurst * 4);
    for (let b = 0; b < burstCount; b++) {
      const ang = (b / burstCount) * TAU + time * 3;
      const dist = size * (0.08 + sprayBurst * 0.14) * (0.5 + Math.sin(b * 2.1 + time * 12) * 0.25);
      const bx = headX + Math.cos(ang) * dist + size * 0.12;
      const by = headY + size * 0.1 + Math.sin(ang) * dist * 0.6;
      const br = size * 0.004 * (0.8 + sprayBurst * 1.2) * attackIntensity;
      ctx.fillStyle = `rgba(160, 240, 80, ${0.55 * sprayBurst * attackIntensity})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
    }
  }
}

// ============================================================================
// 8. GHOUL — Fast feral predator with claws and speed blur
// ============================================================================

export function drawGhoulEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.8;
  const attackIntensity = attackPhase;
  const walkPhase = time * 8;
  const breath = getBreathScale(time, 3, 0.015);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.02;
  const cx0 = x + attackIntensity * size * 0.1;

  const fleshLight = bodyColorLight;
  const fleshMid = bodyColor;
  const fleshDark = bodyColorDark;

  // === SPEED BLUR TRAILS ===
  if (attackIntensity > 0) {
    for (let t = 1; t <= 3; t++) {
      ctx.globalAlpha = (0.1 / t) * attackIntensity;
      ctx.fillStyle = fleshDark;
      ctx.beginPath();
      ctx.ellipse(cx0 - t * size * 0.06, y - size * 0.05, size * 0.12 * (0.85 + 0.15 * attackIntensity), size * 0.18 * (0.85 + 0.15 * attackIntensity), 0, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // === SCRATCH MARKS ON GROUND WHEN ATTACKING ===
  if (attackIntensity > 0) {
    ctx.strokeStyle = `rgba(100, 30, 30, ${0.3 * attackIntensity})`;
    ctx.lineWidth = (0.5 + 0.5 * attackIntensity) * zoom;
    for (let s = 0; s < 3; s++) {
      const sx = cx0 + size * 0.15 + s * size * 0.02;
      ctx.beginPath();
      ctx.moveTo(sx, y + size * 0.46);
      ctx.lineTo(sx + size * 0.04 * (0.7 + 0.3 * attackIntensity), y + size * 0.52);
      ctx.stroke();
    }
  }

  // === SHADOW WISPS ===
  drawShadowWisps(ctx, cx0, y, size * 0.45, time, zoom, {
    count: 3, speed: 1.5, color: "rgba(80, 60, 40, 0.5)", maxAlpha: 0.15, wispLength: 0.3,
  });

  // === CROUCHED LEGS WITH CLAWED FEET ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.23, width: 0.13, strideSpeed: 8, strideAmt: 0.35,
    color: fleshMid, colorDark: fleshDark, footColor: fleshDark, footLen: 0.12,
    style: 'fleshy',
  });

  // Toe claws
  for (const side of [-1, 1]) {
    const footX = cx0 + side * size * 0.08;
    const footY = y + size * 0.38 + bodyBob;
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(footX + (c - 1) * size * 0.015, footY);
      ctx.lineTo(footX + (c - 1) * size * 0.015 + side * size * 0.008, footY + size * 0.015);
      ctx.lineTo(footX + (c - 1) * size * 0.015 + side * size * 0.002, footY + size * 0.013);
      ctx.closePath();
      ctx.fill();
    }
  }

  // === LOW CROUCHED TORSO ===
  const torsoY = y - size * 0.02 - bodyBob;

  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  // Emaciated hunched torso — concave belly, prominent ribcage outline
  const torsoGrad = ctx.createLinearGradient(cx0 - size * 0.14, torsoY - size * 0.1, cx0 + size * 0.14, torsoY + size * 0.08);
  torsoGrad.addColorStop(0, fleshDark);
  torsoGrad.addColorStop(0.3, fleshMid);
  torsoGrad.addColorStop(0.7, fleshLight);
  torsoGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.09);
  ctx.quadraticCurveTo(cx0 - size * 0.15, torsoY - size * 0.04, cx0 - size * 0.13, torsoY + size * 0.02);
  ctx.quadraticCurveTo(cx0 - size * 0.1, torsoY + size * 0.06, cx0 - size * 0.06, torsoY + size * 0.08);
  ctx.quadraticCurveTo(cx0, torsoY + size * 0.05, cx0 + size * 0.06, torsoY + size * 0.08);
  ctx.quadraticCurveTo(cx0 + size * 0.1, torsoY + size * 0.06, cx0 + size * 0.13, torsoY + size * 0.02);
  ctx.quadraticCurveTo(cx0 + size * 0.15, torsoY - size * 0.04, cx0 + size * 0.1, torsoY - size * 0.09);
  ctx.quadraticCurveTo(cx0 + size * 0.04, torsoY - size * 0.12, cx0 - size * 0.04, torsoY - size * 0.12);
  ctx.quadraticCurveTo(cx0 - size * 0.08, torsoY - size * 0.11, cx0 - size * 0.1, torsoY - size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Visible rib outlines pressing through skin
  ctx.strokeStyle = fleshDark;
  ctx.lineWidth = size * 0.006;
  for (let r = 0; r < 5; r++) {
    const ry = torsoY - size * 0.07 + r * size * 0.025;
    const ribW = size * (0.1 - r * 0.008);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx0, ry);
      ctx.quadraticCurveTo(cx0 + side * ribW * 0.6, ry - size * 0.005, cx0 + side * ribW, ry + size * 0.012);
      ctx.stroke();
    }
  }

  // Concave belly depression
  ctx.fillStyle = fleshDark;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.06, torsoY + size * 0.01);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.01, cx0 + size * 0.06, torsoY + size * 0.01);
  ctx.quadraticCurveTo(cx0, torsoY + size * 0.04, cx0 - size * 0.06, torsoY + size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Spine ridges — pointed vertebrae protruding from hunched back
  ctx.fillStyle = fleshDark;
  for (let s = 0; s < 6; s++) {
    const sx = cx0 - size * 0.07 + s * size * 0.028;
    const sy = torsoY - size * 0.1 + s * size * 0.003;
    const spineH = size * (0.025 - s * 0.002);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + size * 0.005, sy - spineH);
    ctx.lineTo(sx + size * 0.01, sy - spineH * 0.3);
    ctx.lineTo(sx + size * 0.014, sy);
    ctx.closePath();
    ctx.fill();
  }

  // Tattered shroud with ragged bottom edge
  ctx.fillStyle = "rgba(60, 50, 40, 0.5)";
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.06);
  for (let i = 0; i <= 8; i++) {
    const tx = cx0 - size * 0.1 + i * size * 0.025;
    const ty = torsoY + size * 0.08 + (i % 3 === 0 ? size * 0.025 : (i % 2) * size * 0.015) + Math.sin(time * 4 + i) * size * 0.008;
    ctx.lineTo(tx, ty);
  }
  ctx.lineTo(cx0 + size * 0.1, torsoY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Shroud tear lines
  ctx.strokeStyle = "rgba(40, 35, 28, 0.4)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.04, torsoY - size * 0.04);
  ctx.lineTo(cx0 - size * 0.06, torsoY + size * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.03, torsoY - size * 0.02);
  ctx.lineTo(cx0 + size * 0.05, torsoY + size * 0.05);
  ctx.stroke();

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.05 - bodyBob, size, side, fleshDark, fleshDark, 'tattered');
  }
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.08, size, size * 0.1, fleshDark, fleshDark);

  // === LONG CLAWED ARMS ===
  for (const side of [-1, 1] as (-1 | 1)[]) {
    const slash = attackIntensity * 0.5;
    drawPathArm(ctx, cx0 + side * size * 0.13, torsoY - size * 0.05 - bodyBob, size, time, zoom, side, {
      color: fleshMid, colorDark: fleshDark, handColor: fleshDark,
      upperLen: 0.30, foreLen: 0.27, handRadius: 0.046,
      shoulderAngle: side * -0.7 + Math.sin(time * 6 + side * Math.PI) * 0.18 * (1 - attackIntensity) - 0.5 * attackIntensity + side * slash,
      elbowAngle: -0.3 - 0.4 * attackIntensity + Math.sin(time * 7 + side) * 0.12 * (1 - attackIntensity) + side * slash * 0.6,
      style: 'fleshy',
    });
  }

  // Blood drip from claws
  if (attackIntensity > 0) {
    for (const side of [-1, 1]) {
      const dripX = cx0 + side * size * 0.25;
      const dripPhase = (time * 0.8 + side) % 1;
      ctx.fillStyle = `rgba(140, 20, 20, ${(1 - dripPhase) * 0.4 * attackIntensity})`;
      ctx.beginPath();
      ctx.ellipse(dripX, y + size * 0.1 + dripPhase * size * 0.1, size * 0.004 * attackIntensity, size * 0.008 * attackIntensity, 0, 0, TAU);
      ctx.fill();
    }
  }

  // === ELONGATED HEAD ===
  const headX = cx0;
  const headY = y - size * 0.18 - bodyBob;

  // Elongated feral skull — narrow, angular, predatory
  const headGrad = ctx.createLinearGradient(headX - size * 0.07, headY - size * 0.05, headX + size * 0.07, headY + size * 0.06);
  headGrad.addColorStop(0, fleshDark);
  headGrad.addColorStop(0.3, fleshMid);
  headGrad.addColorStop(0.6, fleshLight);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.09);
  ctx.quadraticCurveTo(headX + size * 0.05, headY - size * 0.08, headX + size * 0.07, headY - size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.075, headY + size * 0.01, headX + size * 0.06, headY + size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.04, headY + size * 0.065, headX + size * 0.02, headY + size * 0.07);
  ctx.lineTo(headX - size * 0.02, headY + size * 0.07);
  ctx.quadraticCurveTo(headX - size * 0.04, headY + size * 0.065, headX - size * 0.06, headY + size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.075, headY + size * 0.01, headX - size * 0.07, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.05, headY - size * 0.08, headX, headY - size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Sunken cheek hollows
  ctx.fillStyle = fleshDark;
  ctx.globalAlpha = 0.3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.03, headY + size * 0.01);
    ctx.quadraticCurveTo(headX + side * size * 0.06, headY + size * 0.02, headX + side * size * 0.05, headY + size * 0.05);
    ctx.quadraticCurveTo(headX + side * size * 0.03, headY + size * 0.04, headX + side * size * 0.03, headY + size * 0.01);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Brow ridge — heavy, pronounced
  ctx.fillStyle = fleshMid;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY - size * 0.02);
  ctx.quadraticCurveTo(headX, headY - size * 0.035, headX + size * 0.06, headY - size * 0.02);
  ctx.quadraticCurveTo(headX, headY - size * 0.015, headX - size * 0.06, headY - size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Matted hair — stringy clumps
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.05, headY - size * 0.07);
  ctx.quadraticCurveTo(headX, headY - size * 0.09, headX + size * 0.04, headY - size * 0.065);
  ctx.lineTo(headX + size * 0.03, headY - size * 0.05);
  ctx.quadraticCurveTo(headX, headY - size * 0.07, headX - size * 0.04, headY - size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2015";
  ctx.lineWidth = size * 0.007;
  for (let h = 0; h < 4; h++) {
    const hx = headX - size * 0.04 + h * size * 0.025;
    const sway = Math.sin(time * 5 + h * 1.3) * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(hx, headY - size * 0.065);
    ctx.quadraticCurveTo(hx + sway * 0.5, headY - size * 0.08, hx + sway, headY - size * 0.11);
    ctx.stroke();
  }

  // Feral yellow slit-pupil eyes
  drawGlowingEyes(ctx, headX, headY + size * 0.005, size, time, {
    spacing: 0.03,
    eyeRadius: 0.015,
    pupilRadius: 0.004,
    irisColor: "#e0c020",
    pupilColor: "#1a1a00",
    glowColor: "rgba(220, 190, 30, 0.5)",
    glowRadius: 0.045,
    pulseSpeed: 6,
    lookSpeed: 3,
    lookAmount: 0.01,
  });

  // Snout-like muzzle with wide gaping maw; snarl opens with attackIntensity
  const snarlDrop = attackIntensity * size * 0.045;
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.035, headY + size * 0.035);
  ctx.quadraticCurveTo(headX - size * 0.04, headY + size * 0.055, headX - size * 0.02, headY + size * 0.065 + snarlDrop);
  ctx.lineTo(headX + size * 0.02, headY + size * 0.065 + snarlDrop);
  ctx.quadraticCurveTo(headX + size * 0.04, headY + size * 0.055, headX + size * 0.035, headY + size * 0.035);
  ctx.closePath();
  ctx.fill();

  // Multiple jagged fangs — upper row
  ctx.fillStyle = "#e0d8c0";
  const upperFangs = [-0.025, -0.012, 0.003, 0.015, 0.025];
  for (let f = 0; f < upperFangs.length; f++) {
    const fx = headX + upperFangs[f] * size;
    const fLen = (f === 0 || f === 4) ? size * 0.022 : size * 0.028;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.004, headY + size * 0.038);
    ctx.lineTo(fx, headY + size * 0.038 + fLen);
    ctx.lineTo(fx + size * 0.004, headY + size * 0.038);
    ctx.closePath();
    ctx.fill();
  }
  // Lower fangs
  const lowerFangY0 = headY + size * 0.062 + snarlDrop;
  const lowerFangY1 = headY + size * 0.048 + snarlDrop * 0.35;
  for (const fx of [-0.018, -0.005, 0.008, 0.02]) {
    ctx.beginPath();
    ctx.moveTo(headX + fx * size - size * 0.003, lowerFangY0);
    ctx.lineTo(headX + fx * size, lowerFangY1);
    ctx.lineTo(headX + fx * size + size * 0.003, lowerFangY0);
    ctx.closePath();
    ctx.fill();
  }

  // Saliva strands between jaws
  ctx.strokeStyle = `rgba(200, 200, 160, ${0.3 + 0.25 * attackIntensity})`;
  ctx.lineWidth = size * 0.003 * (1 + attackIntensity * 0.5);
  for (let sl = 0; sl < 2; sl++) {
    const slx = headX + (sl - 0.5) * size * 0.02;
    const slEndY = headY + size * 0.085 + snarlDrop + Math.sin(time * 6 + sl) * size * 0.005;
    ctx.beginPath();
    ctx.moveTo(slx, headY + size * 0.05);
    ctx.quadraticCurveTo(slx + Math.sin(time * 6 + sl) * size * 0.005, headY + size * 0.07 + snarlDrop * 0.5, slx, slEndY);
    ctx.stroke();
  }

  // === FRENZY SPEED TRAIL ===
  for (let ft = 1; ft <= 4; ft++) {
    const ftAlpha = (0.1 / ft) * (1 + attackIntensity * 0.9);
    const ftOffset = ft * size * 0.055;
    ctx.globalAlpha = ftAlpha;
    ctx.fillStyle = fleshDark;
    ctx.beginPath();
    ctx.ellipse(cx0 - ftOffset, y - size * 0.02, size * 0.11, size * 0.15, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx0 - ftOffset, headY + ft * size * 0.005, size * 0.065, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === MADNESS EYE GLOW ===
  for (const side of [-1, 1]) {
    const megX = headX + side * size * 0.03;
    const megY = headY + size * 0.005;
    const megPulse = 0.6 + Math.sin(time * 6 + side * 2) * 0.35;
    const megR = size * 0.035;
    const megGrad = ctx.createRadialGradient(megX, megY, 0, megX, megY, megR);
    megGrad.addColorStop(0, `rgba(200, 60, 220, ${megPulse * 0.7})`);
    megGrad.addColorStop(0.3, `rgba(180, 40, 180, ${megPulse * 0.4})`);
    megGrad.addColorStop(0.6, `rgba(140, 30, 120, ${megPulse * 0.15})`);
    megGrad.addColorStop(1, "rgba(100, 20, 80, 0)");
    ctx.fillStyle = megGrad;
    ctx.beginPath();
    ctx.arc(megX, megY, megR, 0, TAU);
    ctx.fill();
  }

  // === CLAW SWIPE STREAKS ===
  ctx.globalAlpha = (0.15 + Math.sin(time * 4) * 0.05) * (1 + attackIntensity * 0.75);
  ctx.strokeStyle = `rgba(160, 130, 180, ${0.5 * (1 + attackIntensity * 0.6)})`;
  ctx.lineWidth = size * 0.005 * (1 + attackIntensity * 0.4);
  ctx.lineCap = "round";
  for (let cs = 0; cs < 3; cs++) {
    const csAngle = -0.4 + cs * 0.25 + Math.sin(time * 5) * 0.1;
    const csStartX = cx0 + size * 0.15;
    const csStartY = y - size * 0.1 + cs * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(csStartX, csStartY);
    ctx.quadraticCurveTo(
      csStartX + Math.cos(csAngle) * size * 0.12,
      csStartY + Math.sin(csAngle) * size * 0.08,
      csStartX + Math.cos(csAngle) * size * 0.2,
      csStartY + Math.sin(csAngle) * size * 0.14,
    );
    ctx.stroke();
  }
  ctx.lineCap = "butt";
  ctx.globalAlpha = 1;

  // === DARK ENERGY WISPS ===
  for (let dw = 0; dw < 5; dw++) {
    const dwSeed = dw * 1.83;
    const dwPhase = (time * 1.5 + dwSeed) % 1;
    const dwX = cx0 - dwPhase * size * 0.2 + Math.sin(dwSeed * 4 + time) * size * 0.06;
    const dwY = y - size * 0.08 + Math.cos(dwSeed * 3 + time * 0.7) * size * 0.12;
    const dwAlpha = (1 - dwPhase) * 0.3 * (dwPhase < 0.1 ? dwPhase * 10 : 1);
    const dwR = size * 0.012 * (1 - dwPhase * 0.5);
    const dwGrad = ctx.createRadialGradient(dwX, dwY, 0, dwX, dwY, dwR * 2.5);
    dwGrad.addColorStop(0, `rgba(120, 80, 160, ${dwAlpha})`);
    dwGrad.addColorStop(0.5, `rgba(90, 60, 130, ${dwAlpha * 0.4})`);
    dwGrad.addColorStop(1, "rgba(60, 40, 100, 0)");
    ctx.fillStyle = dwGrad;
    ctx.beginPath();
    ctx.arc(dwX, dwY, dwR * 2.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(150, 100, 200, ${dwAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(dwX, dwY, dwR, 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// 9. DARK KNIGHT — Heavy plate knight with dark energy greatsword
// ============================================================================

export function drawDarkKnightEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 1.9;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 4;
  const breath = getBreathScale(time, 1.2, 0.015);
  const sway = getIdleSway(time, 0.9, size * 0.003, size * 0.002);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.013;
  const cx0 = x + sway.dx;

  const armorDark = "#1a1a25";
  const armorMid = "#2a2a38";
  const armorLight = "#3a3a48";
  const armorHighlight = "#4a4a58";
  const redTrim = "#8a2030";

  // === DARK ENERGY PARTICLES ===
  for (let i = 0; i < 6; i++) {
    const seed = i * 2.1;
    const phase = (time * 0.6 + seed) % 1;
    const px = cx0 + Math.sin(seed * 4) * size * 0.25;
    const py = y + size * 0.3 - phase * size * 0.7;
    ctx.globalAlpha = (1 - phase) * 0.2;
    ctx.fillStyle = "#8a3050";
    ctx.beginPath();
    ctx.arc(px, py, size * 0.008 * (1 - phase * 0.5), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === RED CAPE ===
  const capeSwing = Math.sin(time * 2.2) * 0.07;
  ctx.save();
  ctx.translate(cx0, y - size * 0.28 - bodyBob);
  ctx.rotate(capeSwing);

  const capeGrad = ctx.createLinearGradient(-size * 0.15, 0, size * 0.15, 0);
  capeGrad.addColorStop(0, "#3a0a15");
  capeGrad.addColorStop(0.3, "#6a1525");
  capeGrad.addColorStop(0.7, "#6a1525");
  capeGrad.addColorStop(1, "#3a0a15");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, 0);
  for (let i = 0; i <= 8; i++) {
    const bx = -size * 0.16 + i * size * 0.04;
    const by = size * 0.58 + (i % 2) * size * 0.03 + Math.sin(time * 2.8 + i * 0.8) * size * 0.012;
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(size * 0.14, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.28, width: 0.1, strideSpeed: 4, strideAmt: 0.25,
    color: armorMid, colorDark: armorDark, footColor: armorDark, footLen: 0.12,
    style: 'armored', trimColor: redTrim,
  });

  const torsoY = y - size * 0.1 - bodyBob;

  // Tattered cloak (behind body)
  drawTatteredCloak(ctx, cx0, torsoY - size * 0.16, size, size * 0.3, size * 0.35, armorDark, "#1a0a0a", time);

  // === ARMORED TORSO ===
  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const torsoGrad = ctx.createLinearGradient(cx0 - size * 0.15, torsoY - size * 0.2, cx0 + size * 0.15, torsoY + size * 0.12);
  torsoGrad.addColorStop(0, armorLight);
  torsoGrad.addColorStop(0.4, armorMid);
  torsoGrad.addColorStop(0.7, armorDark);
  torsoGrad.addColorStop(1, armorMid);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.14, torsoY + size * 0.15);
  ctx.lineTo(cx0 - size * 0.16, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.22, cx0 + size * 0.16, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.14, torsoY + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Center ridge
  ctx.strokeStyle = armorHighlight;
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.2);
  ctx.lineTo(cx0, torsoY + size * 0.12);
  ctx.stroke();

  // Red trim on plates
  ctx.strokeStyle = redTrim;
  ctx.lineWidth = size * 0.005;
  for (let p = 0; p < 3; p++) {
    const py = torsoY - size * 0.12 + p * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.13, py);
    ctx.lineTo(cx0 + size * 0.13, py);
    ctx.stroke();
  }

  // Rivets
  ctx.fillStyle = armorHighlight;
  for (const [rx, ry] of [[-0.12, -0.15], [0.12, -0.15], [-0.13, -0.03], [0.13, -0.03], [-0.12, 0.06], [0.12, 0.06]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(cx0 + rx * size, torsoY + ry * size, size * 0.007, 0, TAU);
    ctx.fill();
  }

  // Corruption veins
  ctx.strokeStyle = "rgba(150, 40, 60, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.04, torsoY - size * 0.1);
  ctx.quadraticCurveTo(cx0 - size * 0.07, torsoY, cx0 - size * 0.02, torsoY + size * 0.08);
  ctx.stroke();

  ctx.restore();

  // Pauldrons — heavy angular dark plates with spike ridge
  for (const side of [-1, 1]) {
    const padCX = cx0 + side * size * 0.18;
    const padCY = torsoY - size * 0.15 - bodyBob;
    const padGrad = ctx.createLinearGradient(padCX - side * size * 0.06, padCY - size * 0.04, padCX + side * size * 0.06, padCY + size * 0.04);
    padGrad.addColorStop(0, armorHighlight);
    padGrad.addColorStop(0.4, armorMid);
    padGrad.addColorStop(1, armorDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.moveTo(padCX - side * size * 0.04, padCY - size * 0.04);
    ctx.lineTo(padCX + side * size * 0.03, padCY - size * 0.05);
    ctx.lineTo(padCX + side * size * 0.065, padCY - size * 0.02);
    ctx.quadraticCurveTo(padCX + side * size * 0.07, padCY + size * 0.01, padCX + side * size * 0.055, padCY + size * 0.035);
    ctx.lineTo(padCX - side * size * 0.02, padCY + size * 0.045);
    ctx.quadraticCurveTo(padCX - side * size * 0.05, padCY + size * 0.025, padCX - side * size * 0.04, padCY - size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = armorDark;
    ctx.lineWidth = size * 0.005;
    ctx.stroke();
    // Spike on shoulder edge
    ctx.fillStyle = armorMid;
    ctx.beginPath();
    ctx.moveTo(padCX + side * size * 0.05, padCY - size * 0.03);
    ctx.lineTo(padCX + side * size * 0.08, padCY - size * 0.06);
    ctx.lineTo(padCX + side * size * 0.06, padCY - size * 0.015);
    ctx.closePath();
    ctx.fill();
    // Ridge line
    ctx.strokeStyle = armorHighlight;
    ctx.lineWidth = size * 0.003;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(padCX - side * size * 0.03, padCY);
    ctx.lineTo(padCX + side * size * 0.05, padCY - size * 0.01);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, armorMid, armorDark, 'plate');
  }
  drawGorget(ctx, cx0, torsoY - size * 0.18, size, size * 0.14, armorMid, armorDark);
  drawArmorSkirt(ctx, cx0, torsoY + size * 0.08, size, size * 0.14, size * 0.06, armorMid, armorDark, 5);

  // === SHIELD ARM (left) ===
  drawPathArm(ctx, cx0 - size * 0.18, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: armorMid, colorDark: armorDark, handColor: armorDark,
    upperLen: 0.27, foreLen: 0.22,
    shoulderAngle: -0.35 + Math.sin(time * 4) * 0.06 + (isAttacking ? -0.3 : 0),
    elbowAngle: 0.5 + Math.sin(time * 3) * 0.08 + (isAttacking ? -0.25 : 0),
    style: 'armored',
  });

  // === GREATSWORD ARM (right) ===
  const swordSwing = Math.sin(walkPhase) * 0.12 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 0.9 : 0);

  drawPathArm(ctx, cx0 + size * 0.18, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: armorMid, colorDark: armorDark, handColor: armorDark,
    upperLen: 0.24, foreLen: 0.20,
    shoulderAngle: 0.25 + swordSwing,
    elbowBend: 0.5,
    elbowAngle: 0.35 + (isAttacking ? -0.4 : 0),
    style: 'armored',
    onWeapon: (ctx) => {
      const foreLen = size * 0.12;

      // Greatsword
      const gsLen = size * 0.4;
      const gsW = size * 0.038;

      // Blade
      const bladeGrad = ctx.createLinearGradient(-gsW, 0, gsW, 0);
      bladeGrad.addColorStop(0, "#3a3a48");
      bladeGrad.addColorStop(0.3, "#5a5a68");
      bladeGrad.addColorStop(0.5, "#6a6a78");
      bladeGrad.addColorStop(0.7, "#5a5a68");
      bladeGrad.addColorStop(1, "#3a3a48");
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(-gsW, foreLen);
      ctx.lineTo(-gsW * 0.3, foreLen + gsLen);
      ctx.lineTo(gsW * 0.3, foreLen + gsLen);
      ctx.lineTo(gsW, foreLen);
      ctx.closePath();
      ctx.fill();

      // Fuller
      ctx.strokeStyle = armorDark;
      ctx.lineWidth = size * 0.006;
      ctx.beginPath();
      ctx.moveTo(0, foreLen + size * 0.03);
      ctx.lineTo(0, foreLen + gsLen * 0.85);
      ctx.stroke();

      // Dark energy edge
      ctx.strokeStyle = "rgba(180, 50, 80, 0.4)";
      ctx.lineWidth = size * 0.008;
      ctx.beginPath();
      ctx.moveTo(gsW, foreLen);
      ctx.lineTo(gsW * 0.3, foreLen + gsLen);
      ctx.stroke();

      // Energy arc on blade when attacking
      if (isAttacking) {
        drawEnergyArc(ctx, 0, foreLen + size * 0.03, 0, foreLen + gsLen * 0.8, time, zoom, {
          color: "rgba(200, 60, 90, 0.6)", segments: 4, amplitude: 5, width: 1.2,
        });
      }

      // Crossguard — angular with gem finials
      const dkCgY = foreLen - size * 0.02;
      ctx.fillStyle = armorHighlight;
      ctx.beginPath();
      ctx.moveTo(-size * 0.05, dkCgY + size * 0.009);
      ctx.lineTo(-size * 0.055, dkCgY);
      ctx.lineTo(size * 0.055, dkCgY);
      ctx.lineTo(size * 0.05, dkCgY + size * 0.009);
      ctx.quadraticCurveTo(size * 0.03, dkCgY + size * 0.015, 0, dkCgY + size * 0.018);
      ctx.quadraticCurveTo(-size * 0.03, dkCgY + size * 0.015, -size * 0.05, dkCgY + size * 0.009);
      ctx.closePath();
      ctx.fill();
      // Gem finials
      ctx.fillStyle = redTrim;
      for (const gs of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(gs * size * 0.04, dkCgY + size * 0.009 - size * 0.008);
        ctx.lineTo(gs * size * 0.048, dkCgY + size * 0.009);
        ctx.lineTo(gs * size * 0.04, dkCgY + size * 0.009 + size * 0.008);
        ctx.lineTo(gs * size * 0.032, dkCgY + size * 0.009);
        ctx.closePath();
        ctx.fill();
      }

      // Grip — contoured
      ctx.fillStyle = "#2a1a1a";
      ctx.beginPath();
      ctx.moveTo(-size * 0.012, foreLen - size * 0.1);
      ctx.quadraticCurveTo(-size * 0.016, foreLen - size * 0.06, -size * 0.012, foreLen - size * 0.02);
      ctx.lineTo(size * 0.012, foreLen - size * 0.02);
      ctx.quadraticCurveTo(size * 0.016, foreLen - size * 0.06, size * 0.012, foreLen - size * 0.1);
      ctx.closePath();
      ctx.fill();

      // Pommel
      ctx.fillStyle = armorHighlight;
      ctx.beginPath();
      ctx.arc(0, foreLen - size * 0.105, size * 0.015, 0, TAU);
      ctx.fill();
    },
  });

  // === GREAT HELM ===
  const helmX = cx0;
  const helmY = y - size * 0.3 - bodyBob;

  // Angular great helm — faceted plate with visor and face guard
  const helmGrad = ctx.createLinearGradient(helmX - size * 0.11, helmY - size * 0.08, helmX + size * 0.11, helmY + size * 0.06);
  helmGrad.addColorStop(0, armorLight);
  helmGrad.addColorStop(0.3, armorMid);
  helmGrad.addColorStop(0.7, armorDark);
  helmGrad.addColorStop(1, armorMid);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.06, helmY + size * 0.09);
  ctx.lineTo(helmX - size * 0.085, helmY + size * 0.03);
  ctx.lineTo(helmX - size * 0.1, helmY - size * 0.02);
  ctx.quadraticCurveTo(helmX - size * 0.1, helmY - size * 0.08, helmX - size * 0.07, helmY - size * 0.1);
  ctx.quadraticCurveTo(helmX - size * 0.03, helmY - size * 0.13, helmX, helmY - size * 0.12);
  ctx.quadraticCurveTo(helmX + size * 0.03, helmY - size * 0.13, helmX + size * 0.07, helmY - size * 0.1);
  ctx.quadraticCurveTo(helmX + size * 0.1, helmY - size * 0.08, helmX + size * 0.1, helmY - size * 0.02);
  ctx.lineTo(helmX + size * 0.085, helmY + size * 0.03);
  ctx.lineTo(helmX + size * 0.06, helmY + size * 0.09);
  ctx.quadraticCurveTo(helmX + size * 0.03, helmY + size * 0.11, helmX, helmY + size * 0.1);
  ctx.quadraticCurveTo(helmX - size * 0.03, helmY + size * 0.11, helmX - size * 0.06, helmY + size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Center ridge
  ctx.strokeStyle = armorHighlight;
  ctx.lineWidth = size * 0.007;
  ctx.beginPath();
  ctx.moveTo(helmX, helmY - size * 0.12);
  ctx.lineTo(helmX, helmY + size * 0.1);
  ctx.stroke();

  // Face plate angular edge
  ctx.strokeStyle = armorDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.085, helmY + size * 0.03);
  ctx.lineTo(helmX - size * 0.07, helmY - size * 0.01);
  ctx.lineTo(helmX + size * 0.07, helmY - size * 0.01);
  ctx.lineTo(helmX + size * 0.085, helmY + size * 0.03);
  ctx.stroke();

  // Narrow visor slit
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.07, helmY - size * 0.005);
  ctx.lineTo(helmX + size * 0.07, helmY - size * 0.005);
  ctx.lineTo(helmX + size * 0.065, helmY + size * 0.012);
  ctx.lineTo(helmX - size * 0.065, helmY + size * 0.012);
  ctx.closePath();
  ctx.fill();

  // Breathing grill — angled slots on chin
  for (let h = 0; h < 4; h++) {
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    const hy = helmY + size * 0.04 + h * size * 0.013;
    ctx.moveTo(helmX - size * 0.04, hy);
    ctx.lineTo(helmX + size * 0.04, hy);
    ctx.lineTo(helmX + size * 0.035, hy + size * 0.006);
    ctx.lineTo(helmX - size * 0.035, hy + size * 0.006);
    ctx.closePath();
    ctx.fill();
  }

  // Crimson eye glow
  drawGlowingEyes(ctx, helmX, helmY, size, time, {
    spacing: 0.035,
    eyeRadius: 0.01,
    pupilRadius: 0.005,
    irisColor: "#dd3040",
    pupilColor: "#ff8090",
    glowColor: "rgba(220, 50, 70, 0.6)",
    glowRadius: 0.045,
    pulseSpeed: 3,
    lookSpeed: 1,
    lookAmount: 0.004,
  });

  // Red plume — multi-feathered horsehair crest
  ctx.save();
  ctx.translate(helmX, helmY - size * 0.1);
  const plumeWave = Math.sin(time * 3) * 0.15;
  ctx.rotate(plumeWave);
  const plumeGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.14);
  plumeGrad.addColorStop(0, "#5a1020");
  plumeGrad.addColorStop(0.4, "#8a2030");
  plumeGrad.addColorStop(0.8, "#6a1525");
  plumeGrad.addColorStop(1, "#4a0a15");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.018, 0);
  ctx.quadraticCurveTo(-size * 0.03, -size * 0.05, -size * 0.02, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.01, -size * 0.14, 0, -size * 0.14);
  ctx.quadraticCurveTo(size * 0.01, -size * 0.14, size * 0.02, -size * 0.1);
  ctx.quadraticCurveTo(size * 0.03, -size * 0.05, size * 0.018, 0);
  ctx.closePath();
  ctx.fill();
  // Feather detail lines
  ctx.strokeStyle = "#3a0a10";
  ctx.lineWidth = 0.4 * zoom;
  for (let f = 0; f < 5; f++) {
    const fy = -size * 0.02 - f * size * 0.022;
    ctx.beginPath();
    ctx.moveTo(-size * 0.012, fy);
    ctx.lineTo(0, fy - size * 0.008);
    ctx.lineTo(size * 0.012, fy);
    ctx.stroke();
  }
  ctx.restore();

  // Heat distortion from breathing grill
  for (let w = 0; w < 2; w++) {
    const wPhase = (time * 0.5 + w * 0.5) % 1;
    ctx.globalAlpha = (1 - wPhase) * 0.1;
    ctx.fillStyle = "rgba(150, 150, 160, 0.3)";
    ctx.beginPath();
    ctx.arc(helmX + (w - 0.5) * size * 0.03, helmY + size * 0.08 + wPhase * size * 0.04, size * 0.007 * (1 + wPhase), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// 10. DEATH KNIGHT — Boss: Dark warlord with flaming sword & corruption aura
// ============================================================================

export function drawDeathKnightEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  size *= 2.1;
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3;
  const breath = getBreathScale(time, 1, 0.018);
  const sway = getIdleSway(time, 0.7, size * 0.004, size * 0.003);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const cx0 = x + sway.dx;

  const armorDark = "#0a0a15";
  const armorMid = "#1a1a28";
  const armorLight = "#2a2a3a";
  const armorHighlight = "#3a3a4a";
  const goldBright = "#ffd700";
  const goldMid = "#c8a020";
  const goldDark = "#8a6a10";

  // === DREAD PRESENCE EFFECT ===
  ctx.save();
  const dreadPulse = (time * 0.6) % 1;
  for (let dp = 0; dp < 3; dp++) {
    const dpPhase = (dreadPulse + dp * 0.33) % 1;
    const dpRadius = size * 0.3 + dpPhase * size * 0.5;
    const dpAlpha = (1 - dpPhase) * 0.12;
    ctx.strokeStyle = `rgba(60, 10, 40, ${dpAlpha})`;
    ctx.lineWidth = (2 - dpPhase * 1.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(cx0, y - size * 0.05, dpRadius, dpRadius * 0.6, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // === DARK ENERGY AURA ===
  drawRadialAura(ctx, cx0, y - size * 0.1, size * 0.8, [
    { offset: 0, color: "rgba(80, 20, 60, 0.15)" },
    { offset: 0.3, color: "rgba(60, 15, 50, 0.1)" },
    { offset: 0.6, color: "rgba(40, 10, 35, 0.05)" },
    { offset: 1, color: "rgba(20, 5, 20, 0)" },
  ]);

  // === GROUND CORRUPTION CIRCLE ===
  const corruptRadius = size * 0.55 + Math.sin(time * 1.2) * size * 0.03;
  ctx.strokeStyle = "rgba(120, 40, 80, 0.25)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(cx0, y + size * 0.5, corruptRadius, corruptRadius * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();

  // Corruption runes
  for (let r = 0; r < 8; r++) {
    const angle = r * (TAU / 8) + time * 0.25;
    const rx = cx0 + Math.cos(angle) * corruptRadius * 0.75;
    const ry = y + size * 0.5 + Math.sin(angle) * corruptRadius * 0.26;
    const runeAlpha = 0.15 + Math.sin(time * 2 + r) * 0.1;
    ctx.fillStyle = `rgba(180, 60, 100, ${runeAlpha})`;
    ctx.font = `${size * 0.05}px serif`;
    ctx.fillText("◆", rx, ry);
  }

  // Ground cracks
  ctx.strokeStyle = "rgba(100, 30, 60, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  for (let c = 0; c < 6; c++) {
    const angle = c * (TAU / 6) + 0.3;
    const len = size * 0.3 + Math.sin(time + c) * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx0, y + size * 0.5);
    ctx.lineTo(cx0 + Math.cos(angle) * len, y + size * 0.5 + Math.sin(angle) * len * 0.35);
    ctx.stroke();
  }

  // === GROUND CORRUPTION TENDRILS ===
  ctx.save();
  for (let gt = 0; gt < 8; gt++) {
    const gtAngle = gt * (TAU / 8) + time * 0.15;
    const gtLen = size * 0.25 + Math.sin(time * 1.5 + gt * 0.9) * size * 0.08;
    const gtEndX = cx0 + Math.cos(gtAngle) * gtLen;
    const gtEndY = y + size * 0.5 + Math.sin(gtAngle) * gtLen * 0.35;
    const gtAlpha = 0.15 + Math.sin(time * 2 + gt) * 0.06;
    ctx.strokeStyle = `rgba(40, 10, 30, ${gtAlpha})`;
    ctx.lineWidth = (1.5 + Math.sin(time * 3 + gt) * 0.5) * zoom;
    const gtMidX = cx0 + Math.cos(gtAngle) * gtLen * 0.5 + Math.sin(time * 2.5 + gt * 2) * size * 0.03;
    const gtMidY = y + size * 0.5 + Math.sin(gtAngle) * gtLen * 0.17 + Math.cos(time * 2 + gt) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(cx0, y + size * 0.5);
    ctx.quadraticCurveTo(gtMidX, gtMidY, gtEndX, gtEndY);
    ctx.stroke();
    ctx.fillStyle = `rgba(100, 30, 60, ${gtAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(gtEndX, gtEndY, size * 0.006, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === SHADOW TRAIL ===
  for (let st = 0; st < 5; st++) {
    const stPhase = (time * 0.3 + st * 0.2) % 1;
    const stX = cx0 - stPhase * size * 0.15 + Math.sin(time * 2 + st * 1.3) * size * 0.04;
    const stY = y - size * 0.05 + Math.sin(time * 1.5 + st) * size * 0.06;
    const stAlpha = (1 - stPhase) * 0.15;
    const stSize = size * 0.06 * (1 - stPhase * 0.5);
    const stGrad = ctx.createRadialGradient(stX, stY, 0, stX, stY, stSize);
    stGrad.addColorStop(0, `rgba(10, 5, 15, ${stAlpha})`);
    stGrad.addColorStop(0.5, `rgba(20, 10, 25, ${stAlpha * 0.5})`);
    stGrad.addColorStop(1, "rgba(10, 5, 15, 0)");
    ctx.fillStyle = stGrad;
    ctx.beginPath();
    ctx.ellipse(stX, stY, stSize, stSize * 0.6, Math.sin(time + st) * 0.3, 0, TAU);
    ctx.fill();
  }

  // === DARK ENERGY PARTICLES ===
  for (let i = 0; i < 10; i++) {
    const seed = i * 1.89;
    const phase = (time * 0.5 + seed) % 1;
    const px = cx0 + Math.sin(seed * 5) * size * 0.35;
    const py = y + size * 0.4 - phase * size * 0.9;
    ctx.globalAlpha = (1 - phase) * 0.3 * (phase < 0.1 ? phase / 0.1 : 1);
    ctx.fillStyle = "#a04080";
    ctx.beginPath();
    ctx.arc(px, py, size * 0.01 * (1 - phase * 0.4), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === TORN CAPE ===
  const capeSwing = Math.sin(time * 1.8) * 0.06;
  ctx.save();
  ctx.translate(cx0, y - size * 0.3 - bodyBob);
  ctx.rotate(capeSwing);

  const capeGrad = ctx.createLinearGradient(-size * 0.18, 0, size * 0.18, 0);
  capeGrad.addColorStop(0, "#0a0515");
  capeGrad.addColorStop(0.3, "#1a0a2a");
  capeGrad.addColorStop(0.7, "#1a0a2a");
  capeGrad.addColorStop(1, "#0a0515");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.16, 0);
  for (let i = 0; i <= 10; i++) {
    const bx = -size * 0.18 + i * size * 0.036;
    const by = size * 0.65 + (i % 2) * size * 0.04 + Math.sin(time * 2 + i * 0.7) * size * 0.018;
    ctx.lineTo(bx, by);
  }
  ctx.lineTo(size * 0.16, 0);
  ctx.closePath();
  ctx.fill();

  // Gold trim on cape edge
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const bx = -size * 0.18 + i * size * 0.036;
    const by = size * 0.65 + (i % 2) * size * 0.04 + Math.sin(time * 2 + i * 0.7) * size * 0.018;
    if (i === 0) ctx.moveTo(bx, by);
    else ctx.lineTo(bx, by);
  }
  ctx.stroke();

  // Dark energy ripple on cape
  ctx.strokeStyle = "rgba(120, 40, 80, 0.15)";
  ctx.lineWidth = size * 0.01;
  for (let w = 0; w < 3; w++) {
    const wy = size * 0.15 + w * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(-size * 0.14, wy);
    ctx.quadraticCurveTo(0, wy + Math.sin(time * 3 + w) * size * 0.02, size * 0.14, wy);
    ctx.stroke();
  }

  ctx.restore();

  // === HEAVY ARMORED LEGS ===
  drawPathLegs(ctx, cx0, y + size * 0.12 + bodyBob, size, time, zoom, {
    legLen: 0.3, width: 0.1, strideSpeed: 3, strideAmt: 0.22,
    color: armorMid, colorDark: armorDark, footColor: armorDark, footLen: 0.13,
    style: 'armored', trimColor: goldDark,
  });

  const torsoY = y - size * 0.1 - bodyBob;

  // Tattered cloak (behind body)
  drawTatteredCloak(ctx, cx0, torsoY - size * 0.16, size, size * 0.3, size * 0.35, armorDark, "#1a0a10", time);

  // === ORNATE TORSO ===
  ctx.save();
  ctx.translate(cx0, torsoY);
  ctx.scale(breath, breath);
  ctx.translate(-cx0, -torsoY);

  const torsoGrad = ctx.createLinearGradient(cx0 - size * 0.16, torsoY - size * 0.22, cx0 + size * 0.16, torsoY + size * 0.12);
  torsoGrad.addColorStop(0, armorLight);
  torsoGrad.addColorStop(0.3, armorMid);
  torsoGrad.addColorStop(0.6, armorDark);
  torsoGrad.addColorStop(1, armorMid);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.15, torsoY + size * 0.16);
  ctx.lineTo(cx0 - size * 0.17, torsoY - size * 0.06);
  ctx.quadraticCurveTo(cx0, torsoY - size * 0.24, cx0 + size * 0.17, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.15, torsoY + size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Gold center ridge
  ctx.strokeStyle = goldMid;
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(cx0, torsoY - size * 0.22);
  ctx.lineTo(cx0, torsoY + size * 0.12);
  ctx.stroke();

  // Gold trim on plates
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = size * 0.004;
  for (let p = 0; p < 3; p++) {
    const py = torsoY - size * 0.12 + p * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx0 - size * 0.14, py);
    ctx.lineTo(cx0 + size * 0.14, py);
    ctx.stroke();
  }

  // Skull motif on chest — detailed engraved skull
  const smX = cx0;
  const smY = torsoY - size * 0.06;
  ctx.fillStyle = goldMid;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(smX, smY - size * 0.03);
  ctx.quadraticCurveTo(smX + size * 0.015, smY - size * 0.03, smX + size * 0.025, smY - size * 0.015);
  ctx.quadraticCurveTo(smX + size * 0.027, smY, smX + size * 0.02, smY + size * 0.012);
  ctx.quadraticCurveTo(smX + size * 0.012, smY + size * 0.025, smX, smY + size * 0.028);
  ctx.quadraticCurveTo(smX - size * 0.012, smY + size * 0.025, smX - size * 0.02, smY + size * 0.012);
  ctx.quadraticCurveTo(smX - size * 0.027, smY, smX - size * 0.025, smY - size * 0.015);
  ctx.quadraticCurveTo(smX - size * 0.015, smY - size * 0.03, smX, smY - size * 0.03);
  ctx.closePath();
  ctx.fill();
  // Mini eye sockets
  ctx.fillStyle = armorDark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(smX + side * size * 0.004, smY - size * 0.01);
    ctx.quadraticCurveTo(smX + side * size * 0.012, smY - size * 0.008, smX + side * size * 0.012, smY - size * 0.002);
    ctx.quadraticCurveTo(smX + side * size * 0.01, smY + size * 0.004, smX + side * size * 0.004, smY + size * 0.002);
    ctx.closePath();
    ctx.fill();
  }
  // Nasal hole
  ctx.beginPath();
  ctx.moveTo(smX, smY + size * 0.005);
  ctx.lineTo(smX + size * 0.004, smY + size * 0.012);
  ctx.lineTo(smX - size * 0.004, smY + size * 0.012);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Trophy chain with mini skulls
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY + size * 0.02);
  ctx.quadraticCurveTo(cx0, torsoY + size * 0.08, cx0 + size * 0.1, torsoY + size * 0.02);
  ctx.stroke();
  for (let s = 0; s < 3; s++) {
    const sx = cx0 - size * 0.06 + s * size * 0.06;
    const sy = torsoY + size * 0.04 + Math.sin(s * 1.5) * size * 0.015;
    ctx.fillStyle = "#c8b8a0";
    ctx.beginPath();
    ctx.arc(sx, sy, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(sx - size * 0.003, sy, size * 0.003, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + size * 0.003, sy, size * 0.003, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  // === DARK ARMOR CRACK GLOW ===
  ctx.save();
  const crackPulse = 0.4 + Math.sin(time * 2) * 0.2;
  ctx.strokeStyle = `rgba(140, 40, 80, ${crackPulse})`;
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.06, torsoY - size * 0.14);
  ctx.lineTo(cx0 + size * 0.08, torsoY - size * 0.08);
  ctx.lineTo(cx0 + size * 0.05, torsoY - size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.07, torsoY - size * 0.1);
  ctx.lineTo(cx0 - size * 0.04, torsoY - size * 0.04);
  ctx.lineTo(cx0 - size * 0.06, torsoY + size * 0.03);
  ctx.stroke();
  for (const [cpx, cpy] of [
    [cx0 + size * 0.07, torsoY - size * 0.11],
    [cx0 + size * 0.065, torsoY - size * 0.05],
    [cx0 - size * 0.055, torsoY - size * 0.07],
    [cx0 - size * 0.05, torsoY],
  ]) {
    const cpGrad = ctx.createRadialGradient(cpx, cpy, 0, cpx, cpy, size * 0.02);
    cpGrad.addColorStop(0, `rgba(180, 60, 120, ${crackPulse * 0.4})`);
    cpGrad.addColorStop(1, "rgba(80, 20, 50, 0)");
    ctx.fillStyle = cpGrad;
    ctx.beginPath();
    ctx.arc(cpx, cpy, size * 0.02, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // Spiked pauldrons with gems — massive angular dark plates
  for (const side of [-1, 1]) {
    const padX = cx0 + side * size * 0.2;
    const padY = torsoY - size * 0.16 - bodyBob;

    // Main pauldron — angular heavy plate
    const padGrad = ctx.createLinearGradient(padX - side * size * 0.07, padY - size * 0.05, padX + side * size * 0.07, padY + size * 0.05);
    padGrad.addColorStop(0, armorHighlight);
    padGrad.addColorStop(0.4, armorMid);
    padGrad.addColorStop(1, armorDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.moveTo(padX - side * size * 0.05, padY - size * 0.045);
    ctx.lineTo(padX + side * size * 0.03, padY - size * 0.05);
    ctx.lineTo(padX + side * size * 0.07, padY - size * 0.025);
    ctx.quadraticCurveTo(padX + side * size * 0.075, padY + size * 0.015, padX + side * size * 0.06, padY + size * 0.04);
    ctx.lineTo(padX - side * size * 0.02, padY + size * 0.05);
    ctx.quadraticCurveTo(padX - side * size * 0.055, padY + size * 0.03, padX - side * size * 0.05, padY - size * 0.045);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = armorDark;
    ctx.lineWidth = size * 0.005;
    ctx.stroke();

    // Spikes — three along top edge
    for (let sp = 0; sp < 3; sp++) {
      const spBaseX = padX + side * (-size * 0.02 + sp * size * 0.03);
      const spBaseY = padY - size * 0.04 + sp * size * 0.01;
      ctx.fillStyle = armorLight;
      ctx.beginPath();
      ctx.moveTo(spBaseX - size * 0.008, spBaseY);
      ctx.lineTo(spBaseX + side * size * 0.015, spBaseY - size * 0.05 + sp * size * 0.01);
      ctx.lineTo(spBaseX + size * 0.008, spBaseY);
      ctx.closePath();
      ctx.fill();
    }

    // Soul-trapped gem — faceted diamond shape
    const gemPulse = 0.5 + Math.sin(time * 3 + side) * 0.3;
    ctx.fillStyle = `rgba(120, 40, 80, ${gemPulse})`;
    ctx.beginPath();
    ctx.moveTo(padX, padY - size * 0.015);
    ctx.lineTo(padX + size * 0.012, padY);
    ctx.lineTo(padX, padY + size * 0.015);
    ctx.lineTo(padX - size * 0.012, padY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(200, 100, 160, ${gemPulse * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(padX, padY - size * 0.012);
    ctx.lineTo(padX + size * 0.008, padY);
    ctx.lineTo(padX, padY + size * 0.005);
    ctx.closePath();
    ctx.fill();
  }

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, armorMid, armorDark, 'plate');
  }
  drawGorget(ctx, cx0, torsoY - size * 0.18, size, size * 0.14, armorMid, armorDark);
  drawArmorSkirt(ctx, cx0, torsoY + size * 0.08, size, size * 0.15, size * 0.07, armorMid, armorDark, 5);

  // === LEFT ARM ===
  drawPathArm(ctx, cx0 - size * 0.2, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: armorMid, colorDark: armorDark, handColor: armorDark,
    upperLen: 0.28, foreLen: 0.24,
    shoulderAngle: -0.45 + Math.sin(time * 3) * 0.05 + (isAttacking ? -0.3 : 0),
    elbowAngle: 0.55 + Math.sin(time * 2.5 + 1) * 0.06 + (isAttacking ? -0.25 : 0),
    style: 'armored',
  });

  // === FLAMING SWORD ARM (right) ===
  const fsArmX = cx0 + size * 0.2;
  const fsArmY = torsoY - size * 0.08 - bodyBob;
  const fsSwing = Math.sin(walkPhase) * 0.1 + (isAttacking ? Math.sin(attackPhase * Math.PI) * 1.0 : 0);

  drawPathArm(ctx, fsArmX, fsArmY, size, time, zoom, 1, {
    color: armorMid, colorDark: armorDark, handColor: armorDark,
    upperLen: 0.25, foreLen: 0.22,
    shoulderAngle: 0.3 + fsSwing,
    elbowBend: 0.55,
    elbowAngle: 0.35 + (isAttacking ? -0.5 : 0),
    style: 'armored',
    onWeapon: (ctx) => {
      const foreLen = size * 0.13;

      // Flaming dark blade
      const bladeLen = size * 0.45;
      const blW = size * 0.042;

      const darkBladeGrad = ctx.createLinearGradient(-blW, 0, blW, 0);
      darkBladeGrad.addColorStop(0, "#1a0a15");
      darkBladeGrad.addColorStop(0.3, "#3a1a30");
      darkBladeGrad.addColorStop(0.5, "#4a2a40");
      darkBladeGrad.addColorStop(0.7, "#3a1a30");
      darkBladeGrad.addColorStop(1, "#1a0a15");
      ctx.fillStyle = darkBladeGrad;
      ctx.beginPath();
      ctx.moveTo(-blW, foreLen);
      ctx.lineTo(-blW * 0.25, foreLen + bladeLen);
      ctx.lineTo(blW * 0.25, foreLen + bladeLen);
      ctx.lineTo(blW, foreLen);
      ctx.closePath();
      ctx.fill();

      // Purple flame effect on blade
      for (let f = 0; f < 6; f++) {
        const fy = foreLen + size * 0.02 + f * bladeLen * 0.15;
        const fPhase = Math.sin(time * 8 + f * 1.5);
        const flameW = size * 0.03 * (1 + fPhase * 0.3);
        ctx.globalAlpha = 0.3 + fPhase * 0.15;
        ctx.fillStyle = "#a040a0";
        ctx.beginPath();
        ctx.ellipse(blW * 0.5 + fPhase * size * 0.015, fy, flameW * 0.6, size * 0.028, fPhase * 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#d080d0";
        ctx.beginPath();
        ctx.ellipse(blW * 0.5 + fPhase * size * 0.015, fy, flameW * 0.3, size * 0.014, fPhase * 0.3, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Energy arcs on blade
      drawEnergyArc(ctx, 0, foreLen + size * 0.03, 0, foreLen + bladeLen * 0.85, time, zoom, {
        color: "rgba(180, 80, 200, 0.5)", segments: 5, amplitude: 6, width: 1.2,
      });

      // Ornate crossguard with skull finials
      const dkCgBase = foreLen - size * 0.02;
      ctx.fillStyle = goldMid;
      ctx.beginPath();
      ctx.moveTo(-size * 0.08, dkCgBase + size * 0.013);
      ctx.quadraticCurveTo(-size * 0.085, dkCgBase, -size * 0.08, dkCgBase - size * 0.005);
      ctx.lineTo(size * 0.08, dkCgBase - size * 0.005);
      ctx.quadraticCurveTo(size * 0.085, dkCgBase, size * 0.08, dkCgBase + size * 0.013);
      ctx.quadraticCurveTo(size * 0.04, dkCgBase + size * 0.022, 0, dkCgBase + size * 0.026);
      ctx.quadraticCurveTo(-size * 0.04, dkCgBase + size * 0.022, -size * 0.08, dkCgBase + size * 0.013);
      ctx.closePath();
      ctx.fill();
      // Skull finials on crossguard ends
      ctx.fillStyle = "#c8b8a0";
      for (const cs of [-1, 1]) {
        const skX = cs * size * 0.065;
        const skY = dkCgBase + size * 0.013;
        ctx.beginPath();
        ctx.moveTo(skX, skY - size * 0.013);
        ctx.quadraticCurveTo(skX + size * 0.012, skY - size * 0.008, skX + size * 0.013, skY);
        ctx.quadraticCurveTo(skX + size * 0.01, skY + size * 0.01, skX, skY + size * 0.012);
        ctx.quadraticCurveTo(skX - size * 0.01, skY + size * 0.01, skX - size * 0.013, skY);
        ctx.quadraticCurveTo(skX - size * 0.012, skY - size * 0.008, skX, skY - size * 0.013);
        ctx.closePath();
        ctx.fill();
        // Mini eye sockets
        ctx.fillStyle = armorDark;
        ctx.beginPath();
        ctx.arc(skX - size * 0.004, skY - size * 0.002, size * 0.003, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(skX + size * 0.004, skY - size * 0.002, size * 0.003, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c8b8a0";
      }

      // Grip — contoured dark leather
      ctx.fillStyle = "#1a0a0a";
      ctx.beginPath();
      ctx.moveTo(-size * 0.019, foreLen - size * 0.11);
      ctx.quadraticCurveTo(-size * 0.023, foreLen - size * 0.065, -size * 0.019, foreLen - size * 0.02);
      ctx.lineTo(size * 0.019, foreLen - size * 0.02);
      ctx.quadraticCurveTo(size * 0.023, foreLen - size * 0.065, size * 0.019, foreLen - size * 0.11);
      ctx.closePath();
      ctx.fill();

      // Pommel gem
      const pommelGrad = ctx.createRadialGradient(0, foreLen - size * 0.115, 0, 0, foreLen - size * 0.115, size * 0.02);
      pommelGrad.addColorStop(0, "#d080d0");
      pommelGrad.addColorStop(0.5, "#8040a0");
      pommelGrad.addColorStop(1, goldDark);
      ctx.fillStyle = pommelGrad;
      ctx.beginPath();
      ctx.arc(0, foreLen - size * 0.115, size * 0.02, 0, TAU);
      ctx.fill();
    },
  });

  // Ember sparks from sword area
  drawEmberSparks(ctx, fsArmX + size * 0.1, fsArmY + size * 0.3, size * 0.3, time, zoom, {
    count: 5, speed: 1.5, color: "rgba(180, 80, 200, 0.5)", coreColor: "rgba(220, 160, 255, 0.8)", maxAlpha: 0.4,
  });

  // === SOUL-DEVOURING BLADE AURA ===
  ctx.save();
  const bladeAuraX = fsArmX + size * 0.08;
  const bladeAuraY = fsArmY + size * 0.25;
  const bladeAuraPulse = 0.6 + Math.sin(time * 3) * 0.3;
  const bladeAuraGrad = ctx.createRadialGradient(bladeAuraX, bladeAuraY, size * 0.02, bladeAuraX, bladeAuraY, size * 0.18);
  bladeAuraGrad.addColorStop(0, `rgba(120, 20, 80, ${bladeAuraPulse * 0.3})`);
  bladeAuraGrad.addColorStop(0.4, `rgba(80, 10, 50, ${bladeAuraPulse * 0.15})`);
  bladeAuraGrad.addColorStop(1, "rgba(40, 5, 25, 0)");
  ctx.fillStyle = bladeAuraGrad;
  ctx.beginPath();
  ctx.arc(bladeAuraX, bladeAuraY, size * 0.18, 0, TAU);
  ctx.fill();
  for (let bw = 0; bw < 4; bw++) {
    const bwPhase = (time * 0.8 + bw * 0.25) % 1;
    const bwX = bladeAuraX + Math.sin(time * 4 + bw * 1.7) * size * 0.06;
    const bwY = bladeAuraY - bwPhase * size * 0.2 + Math.cos(time * 3 + bw) * size * 0.03;
    const bwAlpha = (1 - bwPhase) * bladeAuraPulse * 0.4;
    const bwGrad = ctx.createRadialGradient(bwX, bwY, 0, bwX, bwY, size * 0.02);
    bwGrad.addColorStop(0, `rgba(180, 60, 120, ${bwAlpha})`);
    bwGrad.addColorStop(1, "rgba(80, 20, 60, 0)");
    ctx.fillStyle = bwGrad;
    ctx.beginPath();
    ctx.arc(bwX, bwY, size * 0.02, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === FLOATING SOUL FRAGMENTS ===
  for (let sf = 0; sf < 5; sf++) {
    const sfSeed = sf * 2.31;
    const sfPhase = (time * 0.35 + sfSeed) % 1;
    const sfAngle = sfSeed * TAU + time * 1.2 + sfPhase * TAU * 0.5;
    const sfDist = size * 0.3 * (1 - sfPhase * 0.6);
    const sfX = fsArmX + size * 0.05 + Math.cos(sfAngle) * sfDist;
    const sfY = fsArmY + size * 0.2 + Math.sin(sfAngle) * sfDist * 0.5;
    const sfAlpha = 0.3 + sfPhase * 0.3;
    const sfSize = size * 0.012 * (1 - sfPhase * 0.3);
    const sfGrad = ctx.createRadialGradient(sfX, sfY, 0, sfX, sfY, sfSize * 3);
    sfGrad.addColorStop(0, `rgba(200, 180, 255, ${sfAlpha * 0.7})`);
    sfGrad.addColorStop(0.4, `rgba(140, 100, 200, ${sfAlpha * 0.3})`);
    sfGrad.addColorStop(1, "rgba(80, 40, 120, 0)");
    ctx.fillStyle = sfGrad;
    ctx.beginPath();
    ctx.arc(sfX, sfY, sfSize * 3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(230, 210, 255, ${sfAlpha})`;
    ctx.beginPath();
    ctx.arc(sfX, sfY, sfSize, 0, TAU);
    ctx.fill();
  }

  // === CROWN-HELM WITH HORNS ===
  const helmX = cx0;
  const helmY = y - size * 0.32 - bodyBob;

  // Crown-helm — angular dark plate with crown integrated
  const helmGrad = ctx.createLinearGradient(helmX - size * 0.12, helmY - size * 0.1, helmX + size * 0.12, helmY + size * 0.08);
  helmGrad.addColorStop(0, armorLight);
  helmGrad.addColorStop(0.3, armorMid);
  helmGrad.addColorStop(0.7, armorDark);
  helmGrad.addColorStop(1, armorMid);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.07, helmY + size * 0.1);
  ctx.lineTo(helmX - size * 0.095, helmY + size * 0.03);
  ctx.lineTo(helmX - size * 0.11, helmY - size * 0.03);
  ctx.quadraticCurveTo(helmX - size * 0.11, helmY - size * 0.09, helmX - size * 0.08, helmY - size * 0.11);
  ctx.quadraticCurveTo(helmX - size * 0.04, helmY - size * 0.14, helmX, helmY - size * 0.13);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY - size * 0.14, helmX + size * 0.08, helmY - size * 0.11);
  ctx.quadraticCurveTo(helmX + size * 0.11, helmY - size * 0.09, helmX + size * 0.11, helmY - size * 0.03);
  ctx.lineTo(helmX + size * 0.095, helmY + size * 0.03);
  ctx.lineTo(helmX + size * 0.07, helmY + size * 0.1);
  ctx.quadraticCurveTo(helmX + size * 0.04, helmY + size * 0.12, helmX, helmY + size * 0.11);
  ctx.quadraticCurveTo(helmX - size * 0.04, helmY + size * 0.12, helmX - size * 0.07, helmY + size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Helm plate seam lines
  ctx.strokeStyle = armorDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(helmX, helmY - size * 0.13);
  ctx.lineTo(helmX, helmY + size * 0.11);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.1, helmY - size * 0.01);
  ctx.lineTo(helmX + size * 0.1, helmY - size * 0.01);
  ctx.stroke();

  // Face guard with cheek plates
  ctx.fillStyle = armorDark;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(helmX + side * size * 0.07, helmY + size * 0.01);
    ctx.lineTo(helmX + side * size * 0.09, helmY + size * 0.03);
    ctx.lineTo(helmX + side * size * 0.08, helmY + size * 0.08);
    ctx.lineTo(helmX + side * size * 0.05, helmY + size * 0.09);
    ctx.closePath();
    ctx.fill();
  }

  // T-visor cut into helm face
  ctx.fillStyle = "#050508";
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.07, helmY - size * 0.012);
  ctx.lineTo(helmX + size * 0.07, helmY - size * 0.012);
  ctx.lineTo(helmX + size * 0.07, helmY + size * 0.01);
  ctx.lineTo(helmX + size * 0.014, helmY + size * 0.01);
  ctx.lineTo(helmX + size * 0.014, helmY + size * 0.06);
  ctx.lineTo(helmX - size * 0.014, helmY + size * 0.06);
  ctx.lineTo(helmX - size * 0.014, helmY + size * 0.01);
  ctx.lineTo(helmX - size * 0.07, helmY + size * 0.01);
  ctx.closePath();
  ctx.fill();

  // Glowing eyes through visor
  drawGlowingEyes(ctx, helmX, helmY, size, time, {
    spacing: 0.038,
    eyeRadius: 0.013,
    pupilRadius: 0.006,
    irisColor: "#b040a0",
    pupilColor: "#e0a0ff",
    glowColor: "rgba(180, 60, 160, 0.7)",
    glowRadius: 0.06,
    pulseSpeed: 2.5,
    lookSpeed: 0.8,
    lookAmount: 0.005,
  });

  // Crown band
  const crownBandGrad = ctx.createLinearGradient(helmX - size * 0.11, 0, helmX + size * 0.11, 0);
  crownBandGrad.addColorStop(0, goldDark);
  crownBandGrad.addColorStop(0.3, goldBright);
  crownBandGrad.addColorStop(0.7, goldMid);
  crownBandGrad.addColorStop(1, goldDark);
  ctx.fillStyle = crownBandGrad;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.11, helmY - size * 0.08);
  ctx.quadraticCurveTo(helmX - size * 0.06, helmY - size * 0.085, helmX, helmY - size * 0.082);
  ctx.quadraticCurveTo(helmX + size * 0.06, helmY - size * 0.085, helmX + size * 0.11, helmY - size * 0.08);
  ctx.lineTo(helmX + size * 0.11, helmY - size * 0.06);
  ctx.quadraticCurveTo(helmX + size * 0.06, helmY - size * 0.065, helmX, helmY - size * 0.062);
  ctx.quadraticCurveTo(helmX - size * 0.06, helmY - size * 0.065, helmX - size * 0.11, helmY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Crown jewels
  for (let j = 0; j < 3; j++) {
    const jx = helmX - size * 0.05 + j * size * 0.05;
    ctx.fillStyle = j === 1 ? "#b040a0" : "#8a2060";
    ctx.beginPath();
    ctx.arc(jx, helmY - size * 0.07, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Horns
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(helmX + side * size * 0.1, helmY - size * 0.06);
    ctx.rotate(side * -0.4);

    const hornGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.18);
    hornGrad.addColorStop(0, armorDark);
    hornGrad.addColorStop(0.5, "#3a2a1a");
    hornGrad.addColorStop(1, "#5a4a3a");
    ctx.fillStyle = hornGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.015, 0);
    ctx.quadraticCurveTo(side * size * 0.04, -size * 0.1, side * size * 0.02, -size * 0.18);
    ctx.lineTo(side * size * 0.015, -size * 0.17);
    ctx.quadraticCurveTo(side * size * 0.02, -size * 0.08, size * 0.015, 0);
    ctx.closePath();
    ctx.fill();

    // Horn tip glow
    const tipGlow = 0.4 + Math.sin(time * 3 + side * 2) * 0.2;
    ctx.fillStyle = `rgba(180, 60, 160, ${tipGlow})`;
    ctx.beginPath();
    ctx.arc(side * size * 0.018, -size * 0.17, size * 0.012, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // === OVERLAY EFFECTS ===
  drawPulsingGlowRings(ctx, cx0, y - size * 0.1, size * 0.45, time, zoom, {
    count: 3, speed: 1.0, color: "rgba(180, 60, 160, 0.4)", maxAlpha: 0.2, expansion: 1.8,
  });

  drawShiftingSegments(ctx, cx0, y - size * 0.1, size, time, zoom, {
    count: 5, orbitRadius: 0.35, segmentSize: 0.025, orbitSpeed: 1.2, bobSpeed: 2.5, bobAmt: 0.03,
    color: "#4a1a3a", colorAlt: "#2a0a1a", shape: "shard", rotateWithOrbit: true,
  });

  drawShadowWisps(ctx, cx0, y - size * 0.15, size * 0.6, time, zoom, {
    count: 5, speed: 0.8, color: "rgba(100, 30, 70, 0.5)", maxAlpha: 0.25, wispLength: 0.45,
  });

  drawArcaneSparkles(ctx, cx0, y - size * 0.3, size * 0.5, time, zoom, {
    count: 6, speed: 1.5, color: "rgba(200, 120, 255, 0.7)", maxAlpha: 0.4, sparkleSize: 0.05,
  });

  if (isAttacking) {
    const slashProgress = 1 - attackPhase;
    const slashArc = slashProgress * Math.PI * 2 - Math.PI * 0.8;
    const slashR = size * 0.5;

    ctx.strokeStyle = `rgba(180, 60, 160, ${attackPhase * 0.8})`;
    ctx.lineWidth = (4 + attackPhase * 6) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx0, y - size * 0.15 + bodyBob, slashR, slashArc - 0.8, slashArc + 0.8);
    ctx.stroke();
    ctx.lineCap = "butt";

    const trailCount = 6;
    for (let t = 0; t < trailCount; t++) {
      const tOff = t * 0.12;
      const tAlpha = attackPhase * 0.25 * (1 - t / trailCount);
      ctx.strokeStyle = `rgba(120, 40, 100, ${tAlpha})`;
      ctx.lineWidth = (3 - t * 0.4) * zoom;
      ctx.beginPath();
      ctx.arc(cx0, y - size * 0.15 + bodyBob, slashR, slashArc - 0.5 - tOff, slashArc + 0.5 - tOff);
      ctx.stroke();
    }

    for (let s = 0; s < 8; s++) {
      const sAngle = slashArc + (s - 3.5) * 0.25;
      const sDist = slashR * (0.85 + Math.sin(time * 12 + s) * 0.15);
      const sAlpha = attackPhase * 0.5 * (1 - Math.abs(s - 3.5) / 4);
      ctx.fillStyle = `rgba(200, 120, 255, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(
        cx0 + Math.cos(sAngle) * sDist,
        y - size * 0.15 + bodyBob + Math.sin(sAngle) * sDist,
        size * 0.012, 0, TAU,
      );
      ctx.fill();
    }

    if (attackPhase > 0.75) {
      const burstAlpha = (attackPhase - 0.75) * 4;
      const burstR = size * 0.35 * burstAlpha;
      const burstGrad = ctx.createRadialGradient(cx0, y + bodyBob, 0, cx0, y + bodyBob, burstR);
      burstGrad.addColorStop(0, `rgba(180, 60, 160, ${burstAlpha * 0.25})`);
      burstGrad.addColorStop(0.6, `rgba(100, 20, 80, ${burstAlpha * 0.1})`);
      burstGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.ellipse(cx0, y + bodyBob, burstR, burstR * ISO_Y_RATIO, 0, 0, TAU);
      ctx.fill();
    }
  }
}
