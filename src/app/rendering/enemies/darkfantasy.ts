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
  const shieldSwing = -armSwingAngle * 0.4;
  const armLen = size * 0.16;

  drawPathArm(ctx, cx0 - size * 0.14 + rattle, torsoY - size * 0.08, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.27, foreLen: 0.22,
    shoulderAngle: shieldSwing - 0.15,
    elbowBend: 0.7,
    elbowAngle: 0.3,
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

      // Crossguard
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(-size * 0.06, foreLen * 0.95, size * 0.12, size * 0.028);
      ctx.fillStyle = "#706050";
      ctx.fillRect(-size * 0.053, foreLen * 0.95 + size * 0.005, size * 0.106, size * 0.016);

      // Grip
      ctx.fillStyle = "#4a3828";
      ctx.fillRect(-size * 0.017, foreLen * 0.8125, size * 0.034, size * 0.12);
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

  // Cranium
  const craniumGrad = ctx.createRadialGradient(skullX, skullY - size * 0.02, 0, skullX, skullY - size * 0.02, size * 0.12);
  craniumGrad.addColorStop(0, boneWhite);
  craniumGrad.addColorStop(0.6, boneMid);
  craniumGrad.addColorStop(1, boneDark);
  ctx.fillStyle = craniumGrad;
  ctx.beginPath();
  ctx.ellipse(skullX, skullY - size * 0.02, size * 0.1, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Cranium crack
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(skullX + size * 0.02, skullY - size * 0.1);
  ctx.lineTo(skullX + size * 0.04, skullY - size * 0.06);
  ctx.lineTo(skullX + size * 0.025, skullY - size * 0.03);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(skullX + size * 0.04, skullY - size * 0.06);
  ctx.lineTo(skullX + size * 0.06, skullY - size * 0.05);
  ctx.stroke();

  // Temporal bone texture
  ctx.fillStyle = boneDark;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(skullX - size * 0.06, skullY, size * 0.025, size * 0.035, 0.3, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Brow ridge
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(skullX, skullY + size * 0.02, size * 0.09, size * 0.025, 0, Math.PI, TAU);
  ctx.fill();

  // Nasal cavity
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(skullX, skullY + size * 0.03);
  ctx.lineTo(skullX - size * 0.015, skullY + size * 0.06);
  ctx.lineTo(skullX + size * 0.015, skullY + size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Eye sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.ellipse(skullX + side * size * 0.04, skullY + size * 0.015, size * 0.028, size * 0.025, 0, 0, TAU);
    ctx.fill();
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

  // Pauldrons
  for (const side of [-1, 1]) {
    const padGrad = ctx.createRadialGradient(cx0 + side * size * 0.17, torsoY - size * 0.15, 0, cx0 + side * size * 0.17, torsoY - size * 0.15, size * 0.06);
    padGrad.addColorStop(0, steelHighlight);
    padGrad.addColorStop(0.5, steelMid);
    padGrad.addColorStop(1, steelDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(cx0 + side * size * 0.17, torsoY - size * 0.15 - bodyBob, size * 0.06, size * 0.04, side * 0.2, 0, TAU);
    ctx.fill();
    // Pauldron edge
    ctx.strokeStyle = steelDark;
    ctx.lineWidth = size * 0.006;
    ctx.stroke();
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
    shoulderAngle: -0.2 + Math.sin(walkPhase) * 0.1,
    elbowBend: 0.6,
    elbowAngle: 0.3,
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
    swingSpeed: 4.5, swingAmt: 0.2, baseAngle: 0.25,
    attackExtra: isAttacking ? 0.6 : 0, elbowBend: 0.55,
    upperLen: 0.24, foreLen: 0.20,
    style: 'bone',
  });

  // === GREAT HELM ===
  const helmX = cx0;
  const helmY = y - size * 0.3 - bodyBob;

  // Helm body
  const helmGrad = ctx.createRadialGradient(helmX, helmY, 0, helmX, helmY, size * 0.11);
  helmGrad.addColorStop(0, steelHighlight);
  helmGrad.addColorStop(0.5, steelMid);
  helmGrad.addColorStop(1, steelDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(helmX, helmY, size * 0.1, size * 0.11, 0, 0, TAU);
  ctx.fill();

  // Helm top ridge
  ctx.strokeStyle = steelHighlight;
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(helmX - size * 0.03, helmY - size * 0.1);
  ctx.quadraticCurveTo(helmX, helmY - size * 0.12, helmX + size * 0.03, helmY - size * 0.1);
  ctx.stroke();

  // T-visor
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(helmX - size * 0.065, helmY - size * 0.01, size * 0.13, size * 0.018);
  ctx.fillRect(helmX - size * 0.012, helmY - size * 0.01, size * 0.024, size * 0.06);

  // Breathing holes
  ctx.fillStyle = "#0a0a0a";
  for (let h = 0; h < 3; h++) {
    ctx.beginPath();
    ctx.arc(helmX + size * 0.05, helmY + size * 0.04 + h * size * 0.015, size * 0.005, 0, TAU);
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

  // Smoke wisps from visor
  for (let w = 0; w < 2; w++) {
    const wPhase = (time * 0.6 + w * 0.5) % 1;
    ctx.globalAlpha = (1 - wPhase) * 0.15;
    ctx.fillStyle = "rgba(60, 30, 40, 0.5)";
    ctx.beginPath();
    ctx.arc(helmX + size * 0.05 + wPhase * size * 0.05, helmY + size * 0.05 - wPhase * size * 0.08, size * 0.01 * (1 + wPhase), 0, TAU);
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

  // === BOW ARM (left side) ===
  const bowArmX = cx0 - size * 0.15;
  const bowArmY = torsoY - size * 0.1 - bodyBob;
  const bowAngle = isAttacking ? -0.6 : -0.3;

  drawPathArm(ctx, bowArmX, bowArmY, size, time, zoom, -1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    upperLen: 0.22, foreLen: 0.17,
    shoulderAngle: bowAngle,
    elbowBend: 0.45,
    elbowAngle: 0.25,
    style: 'bone',
    onWeapon: (ctx) => {
      // Bow
      const bowH = size * 0.28;
      const bowCurve = size * 0.08;

      // Bow limbs (wood grain)
      const bowGrad = ctx.createLinearGradient(-bowCurve, -bowH / 2, 0, bowH / 2);
      bowGrad.addColorStop(0, "#6a4a30");
      bowGrad.addColorStop(0.5, "#8a6a50");
      bowGrad.addColorStop(1, "#5a3a20");
      ctx.strokeStyle = bowGrad as unknown as string;
      ctx.lineWidth = size * 0.022;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -bowH / 2);
      ctx.quadraticCurveTo(-bowCurve, 0, 0, bowH / 2);
      ctx.stroke();

      // Bowstring
      const stringTension = isAttacking ? size * 0.04 : 0;
      ctx.strokeStyle = "#c8b898";
      ctx.lineWidth = size * 0.007;
      ctx.beginPath();
      ctx.moveTo(0, -bowH / 2);
      ctx.quadraticCurveTo(stringTension, 0, 0, bowH / 2);
      ctx.stroke();

      // Bowstring vibration after attack
      if (isAttacking && attackPhase > 0.5) {
        const vib = Math.sin(time * 40) * size * 0.008 * (1 - attackPhase);
        ctx.strokeStyle = "rgba(200, 184, 152, 0.4)";
        ctx.lineWidth = size * 0.005;
        ctx.beginPath();
        ctx.moveTo(0, -bowH / 2);
        ctx.quadraticCurveTo(vib, 0, 0, bowH / 2);
        ctx.stroke();
      }

      // Nocked arrow when attacking
      if (isAttacking && attackPhase < 0.5) {
        ctx.strokeStyle = "#8a7560";
        ctx.lineWidth = size * 0.009;
        ctx.beginPath();
        ctx.moveTo(stringTension, 0);
        ctx.lineTo(-size * 0.25, 0);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = "#707080";
        ctx.beginPath();
        ctx.moveTo(-size * 0.25, 0);
        ctx.lineTo(-size * 0.235, -size * 0.01);
        ctx.lineTo(-size * 0.235, size * 0.01);
        ctx.closePath();
        ctx.fill();

        // Energy trail
        ctx.strokeStyle = "rgba(80, 200, 100, 0.4)";
        ctx.lineWidth = size * 0.008;
        ctx.beginPath();
        ctx.moveTo(-size * 0.23, 0);
        ctx.lineTo(-size * 0.15, Math.sin(time * 20) * size * 0.01);
        ctx.stroke();
      }

      ctx.lineCap = "butt";
    },
  });

  // === DRAW ARM (right side) ===
  drawPathArm(ctx, cx0 + size * 0.14, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: boneMid, colorDark: boneDark, handColor: boneDark,
    swingSpeed: 5.5, swingAmt: 0.15, baseAngle: 0.2,
    attackExtra: isAttacking ? 0.4 : 0, elbowBend: 0.45,
    upperLen: 0.22, foreLen: 0.17,
    style: 'bone',
  });

  // === SKULL HEAD WITH LEATHER CAP ===
  const skullX = cx0;
  const skullY = headY;

  // Leather cap
  ctx.fillStyle = "#5a4530";
  ctx.beginPath();
  ctx.ellipse(skullX, skullY - size * 0.025, size * 0.1, size * 0.07, 0, Math.PI + 0.3, -0.3);
  ctx.fill();

  // Skull
  const skullGrad = ctx.createRadialGradient(skullX, skullY, 0, skullX, skullY, size * 0.1);
  skullGrad.addColorStop(0, boneWhite);
  skullGrad.addColorStop(0.7, boneMid);
  skullGrad.addColorStop(1, boneDark);
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.ellipse(skullX, skullY, size * 0.085, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // Brow ridge
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(skullX, skullY + size * 0.02, size * 0.08, size * 0.02, 0, Math.PI, TAU);
  ctx.fill();

  // Bone cracks
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(skullX - size * 0.03, skullY - size * 0.07);
  ctx.lineTo(skullX - size * 0.01, skullY - size * 0.03);
  ctx.stroke();

  // Eye sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0500";
    ctx.beginPath();
    ctx.ellipse(skullX + side * size * 0.035, skullY + size * 0.01, size * 0.022, size * 0.02, 0, 0, TAU);
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

  // Ornate pauldrons with gems
  for (const side of [-1, 1]) {
    const padX = cx0 + side * size * 0.18;
    const padY = torsoY - size * 0.16 - bodyBob;
    const padGrad = ctx.createRadialGradient(padX, padY, 0, padX, padY, size * 0.06);
    padGrad.addColorStop(0, goldBright);
    padGrad.addColorStop(0.6, goldMid);
    padGrad.addColorStop(1, goldDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(padX, padY, size * 0.065, size * 0.045, side * 0.2, 0, TAU);
    ctx.fill();

    // Pauldron gem
    ctx.fillStyle = "#a050e0";
    ctx.beginPath();
    ctx.arc(padX, padY, size * 0.015, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#d0a0ff";
    ctx.beginPath();
    ctx.arc(padX - size * 0.004, padY - size * 0.004, size * 0.005, 0, TAU);
    ctx.fill();
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
    shoulderAngle: -0.25 + Math.sin(walkPhase) * 0.08,
    elbowBend: 0.55,
    elbowAngle: 0.2,
    style: 'bone',
    onWeapon: (ctx) => {
      const foreLen = size * 0.1;

      // Scepter shaft
      ctx.fillStyle = goldMid;
      ctx.fillRect(-size * 0.015, foreLen * 0.5, size * 0.03, size * 0.25);

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
    swingSpeed: 3.5, swingAmt: 0.12, baseAngle: 0.2,
    upperLen: 0.22, foreLen: 0.17,
    attackExtra: isAttacking ? 0.4 : 0, elbowBend: 0.55,
    style: 'bone',
  });

  // === SKULL HEAD ===
  const skullX = cx0;
  const skullY = y - size * 0.3 - bodyBob;

  // Skull
  const craniumGrad = ctx.createRadialGradient(skullX, skullY, 0, skullX, skullY, size * 0.1);
  craniumGrad.addColorStop(0, boneWhite);
  craniumGrad.addColorStop(0.7, boneMid);
  craniumGrad.addColorStop(1, boneDark);
  ctx.fillStyle = craniumGrad;
  ctx.beginPath();
  ctx.ellipse(skullX, skullY, size * 0.09, size * 0.095, 0, 0, TAU);
  ctx.fill();

  // Eye sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0020";
    ctx.beginPath();
    ctx.ellipse(skullX + side * size * 0.035, skullY + size * 0.01, size * 0.025, size * 0.022, 0, 0, TAU);
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
  ctx.fillRect(skullX - size * 0.1, crownY + size * 0.025, size * 0.2, size * 0.018);

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

  // Exposed flesh underneath
  ctx.fillStyle = fleshMid;
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.04, torsoY - size * 0.02, size * 0.06, size * 0.08, 0.2, 0, TAU);
  ctx.fill();

  // Exposed ribs
  ctx.strokeStyle = "#d0c8b0";
  ctx.lineWidth = size * 0.01;
  for (let r = 0; r < 3; r++) {
    const ry = torsoY - size * 0.04 + r * size * 0.035;
    ctx.beginPath();
    ctx.moveTo(cx0 + size * 0.01, ry);
    ctx.quadraticCurveTo(cx0 + size * 0.06, ry + size * 0.008, cx0 + size * 0.08, ry + size * 0.02);
    ctx.stroke();
  }

  // Wound marks with infection
  ctx.fillStyle = "rgba(120, 30, 30, 0.5)";
  ctx.beginPath();
  ctx.ellipse(cx0 - size * 0.06, torsoY + size * 0.02, size * 0.025, size * 0.015, -0.3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(180, 200, 60, 0.2)";
  ctx.beginPath();
  ctx.arc(cx0 - size * 0.06, torsoY + size * 0.02, size * 0.04, 0, TAU);
  ctx.fill();

  // Shirt tear details
  ctx.strokeStyle = "#5a5a6a";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.03, torsoY - size * 0.12);
  ctx.lineTo(cx0 - size * 0.01, torsoY - size * 0.05);
  ctx.stroke();

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.12 - bodyBob, size, side, fleshDark, fleshDark, 'tattered');
  }
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.08, size, size * 0.13, "#3a3a4a", "#2a2a3a");

  // === REACHING ARM (left) ===
  drawPathArm(ctx, cx0 - size * 0.16, torsoY - size * 0.08 - bodyBob, size, time, zoom, -1, {
    color: fleshMid, colorDark: fleshDark, handColor: fleshDark,
    swingSpeed: 3, swingAmt: 0.3, baseAngle: 0.5,
    attackExtra: isAttacking ? 0.6 : 0, elbowBend: 0.5,
    upperLen: 0.28, foreLen: 0.24, handRadius: 0.052,
    style: 'fleshy',
  });

  // === HANGING ARM (right) ===
  drawPathArm(ctx, cx0 + size * 0.14, torsoY - size * 0.08 - bodyBob, size, time, zoom, 1, {
    color: fleshMid, colorDark: fleshDark, handColor: "#d0c8b0",
    swingSpeed: 3, swingAmt: 0.15, baseAngle: 0.6,
    elbowBend: 0.7, upperLen: 0.27, foreLen: 0.22,
    style: 'fleshy',
  });

  // === LOPSIDED HEAD ===
  const headX = cx0 + size * 0.02;
  const headY = y - size * 0.24 - bodyBob;

  // Head shape (slightly lopsided)
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.1);
  headGrad.addColorStop(0, fleshLight);
  headGrad.addColorStop(0.6, fleshMid);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.09, size * 0.095, 0.1, 0, TAU);
  ctx.fill();

  // Patchy hair
  ctx.fillStyle = "#3a3020";
  for (let h = 0; h < 4; h++) {
    const angle = -0.5 + h * 0.4;
    const hx = headX + Math.cos(angle) * size * 0.08;
    const hy = headY + Math.sin(angle) * size * 0.08;
    ctx.beginPath();
    ctx.ellipse(hx, hy, size * 0.025, size * 0.015, angle, 0, TAU);
    ctx.fill();
  }

  // Cheek wound
  ctx.fillStyle = "rgba(130, 30, 30, 0.6)";
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.06, headY + size * 0.02, size * 0.02, size * 0.015, 0.3, 0, TAU);
  ctx.fill();

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

  // Bloated body
  const bodyGrad = ctx.createRadialGradient(cx0, torsoY, size * 0.05, cx0, torsoY, size * 0.2);
  bodyGrad.addColorStop(0, fleshLight);
  bodyGrad.addColorStop(0.5, fleshMid);
  bodyGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, torsoY, size * 0.18, size * 0.2, 0, 0, TAU);
  ctx.fill();

  // Chain armor overlay
  ctx.fillStyle = "rgba(80, 80, 90, 0.5)";
  ctx.beginPath();
  ctx.ellipse(cx0, torsoY - size * 0.03, size * 0.16, size * 0.15, 0, 0, TAU);
  ctx.fill();

  // Chain links
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

  // Rust patches on chain
  ctx.fillStyle = "rgba(140, 80, 40, 0.3)";
  ctx.beginPath();
  ctx.ellipse(cx0 + size * 0.05, torsoY - size * 0.04, size * 0.03, size * 0.02, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx0 - size * 0.08, torsoY + size * 0.03, size * 0.025, size * 0.015, 0, 0, TAU);
  ctx.fill();

  // Stitched wound
  ctx.strokeStyle = "rgba(100, 30, 30, 0.6)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.08, torsoY + size * 0.05);
  ctx.lineTo(cx0 - size * 0.02, torsoY + size * 0.1);
  ctx.stroke();
  // Stitches
  ctx.strokeStyle = "#3a3a30";
  ctx.lineWidth = 0.6 * zoom;
  for (let s = 0; s < 3; s++) {
    const sx = cx0 - size * 0.07 + s * size * 0.025;
    const sy = torsoY + size * 0.06 + s * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.01, sy - size * 0.008);
    ctx.lineTo(sx + size * 0.01, sy + size * 0.008);
    ctx.stroke();
  }

  // Metal plate
  ctx.fillStyle = "#5a5a60";
  ctx.beginPath();
  ctx.moveTo(cx0 + size * 0.06, torsoY - size * 0.06);
  ctx.lineTo(cx0 + size * 0.14, torsoY - size * 0.04);
  ctx.lineTo(cx0 + size * 0.13, torsoY + size * 0.04);
  ctx.lineTo(cx0 + size * 0.05, torsoY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  // Bolts on plate
  ctx.fillStyle = "#8a8a90";
  ctx.beginPath();
  ctx.arc(cx0 + size * 0.08, torsoY - size * 0.03, size * 0.007, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx0 + size * 0.11, torsoY + size * 0.01, size * 0.007, 0, TAU);
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
      swingSpeed: 2.5, swingAmt: 0.2, baseAngle: 0.35,
      attackExtra: isAttacking ? 0.5 : 0, elbowBend: 0.55,
      upperLen: 0.34, foreLen: 0.29, width: 0.12, handRadius: 0.06,
      style: 'fleshy',
    });
  }

  // === SMALL ANGRY HEAD ===
  const headX = cx0;
  const headY = y - size * 0.22 - bodyBob;

  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.07);
  headGrad.addColorStop(0, fleshLight);
  headGrad.addColorStop(0.7, fleshMid);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.07, size * 0.075, 0, 0, TAU);
  ctx.fill();

  // Brow ridge
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.01, size * 0.065, size * 0.02, 0, Math.PI, TAU);
  ctx.fill();

  // Tiny angry eyes
  ctx.fillStyle = "#cc3030";
  ctx.beginPath();
  ctx.arc(headX - size * 0.025, headY + size * 0.015, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.025, headY + size * 0.015, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#1a0000";
  ctx.beginPath();
  ctx.arc(headX - size * 0.025, headY + size * 0.017, size * 0.005, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.025, headY + size * 0.017, size * 0.005, 0, TAU);
  ctx.fill();

  // Snarl mouth
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.04, size * 0.025, size * 0.012, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#d0c8a0";
  for (let t = 0; t < 3; t++) {
    const tx = headX - size * 0.012 + t * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(tx, headY + size * 0.035);
    ctx.lineTo(tx + size * 0.003, headY + size * 0.045);
    ctx.lineTo(tx + size * 0.006, headY + size * 0.035);
    ctx.closePath();
    ctx.fill();
  }

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
  const isAttacking = attackPhase > 0;
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

  // Bloated belly
  const bellyGlow = 0.3 + Math.sin(time * 3) * 0.15;
  const bellyGrad = ctx.createRadialGradient(cx0, torsoY + size * 0.04, 0, cx0, torsoY + size * 0.04, size * 0.12);
  bellyGrad.addColorStop(0, `rgba(120, 200, 60, ${bellyGlow})`);
  bellyGrad.addColorStop(0.5, `rgba(80, 150, 40, ${bellyGlow * 0.5})`);
  bellyGrad.addColorStop(1, "rgba(60, 100, 30, 0)");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.arc(cx0, torsoY + size * 0.04, size * 0.12, 0, TAU);
  ctx.fill();

  // Internal bubbling
  for (let b = 0; b < 5; b++) {
    const bSeed = b * 2.1;
    const bPhase = (time * 1.5 + bSeed) % 1;
    const bx = cx0 + Math.sin(bSeed * 3) * size * 0.06;
    const by = torsoY + size * 0.04 - bPhase * size * 0.08;
    ctx.fillStyle = `rgba(140, 220, 80, ${(1 - bPhase) * 0.25})`;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.008 * (1 + bPhase * 0.5), 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.08 - bodyBob, size, side, fleshDark, fleshDark, 'tattered');
  }

  // === CLAW ARMS ===
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.14, torsoY - size * 0.08 - bodyBob, size, time, zoom, side, {
      color: fleshMid, colorDark: fleshDark, handColor: fleshDark,
      swingSpeed: 3.5, swingAmt: 0.2, baseAngle: 0.4,
      attackExtra: isAttacking ? 0.5 : 0, elbowBend: 0.45,
      upperLen: 0.25, foreLen: 0.20,
      style: 'fleshy',
    });
  }

  // === HEAD WITH DISTENDED JAW ===
  const headX = cx0;
  const headY = y - size * 0.24 - bodyBob;

  // Head
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.08);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.7, fleshMid);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.08, size * 0.085, 0, 0, TAU);
  ctx.fill();

  // Sickly glowing eyes
  ctx.fillStyle = "#80e040";
  ctx.beginPath();
  ctx.arc(headX - size * 0.03, headY + size * 0.005, size * 0.013, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.03, headY + size * 0.005, size * 0.013, 0, TAU);
  ctx.fill();
  // Slit pupils
  ctx.fillStyle = "#1a1a00";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.03, headY + size * 0.007, size * 0.003, size * 0.009, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.03, headY + size * 0.007, size * 0.003, size * 0.009, 0, 0, TAU);
  ctx.fill();

  // Distended glowing jaw
  const jawGlow = 0.3 + Math.sin(time * 4) * 0.15;
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.05, headY + size * 0.04);
  ctx.quadraticCurveTo(headX, headY + size * 0.13, headX + size * 0.05, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Jaw inner glow
  const jawGlowGrad = ctx.createRadialGradient(headX, headY + size * 0.08, 0, headX, headY + size * 0.08, size * 0.04);
  jawGlowGrad.addColorStop(0, `rgba(120, 200, 60, ${jawGlow})`);
  jawGlowGrad.addColorStop(1, "rgba(80, 150, 40, 0)");
  ctx.fillStyle = jawGlowGrad;
  ctx.beginPath();
  ctx.arc(headX, headY + size * 0.08, size * 0.04, 0, TAU);
  ctx.fill();

  // Bile drips from mouth
  for (let d = 0; d < 2; d++) {
    const dPhase = (time * 0.7 + d * 0.5) % 1;
    ctx.fillStyle = `rgba(120, 200, 60, ${(1 - dPhase) * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(headX + (d - 0.5) * size * 0.025, headY + size * 0.1 + dPhase * size * 0.06, size * 0.005 * (1 - dPhase), size * 0.01 * (1 - dPhase), 0, 0, TAU);
    ctx.fill();
  }

  // Bile stream when attacking
  if (isAttacking) {
    ctx.strokeStyle = "rgba(120, 200, 60, 0.5)";
    ctx.lineWidth = size * 0.015;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(headX, headY + size * 0.1);
    ctx.quadraticCurveTo(headX + size * 0.1, headY + size * 0.2, headX + size * 0.25, headY + size * 0.15);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Splatter particles
    for (let s = 0; s < 4; s++) {
      const sx = headX + size * 0.2 + Math.sin(time * 10 + s) * size * 0.05;
      const sy = headY + size * 0.15 + Math.cos(time * 8 + s) * size * 0.03;
      ctx.fillStyle = "rgba(120, 200, 60, 0.4)";
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.008, 0, TAU);
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
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 8;
  const breath = getBreathScale(time, 3, 0.015);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.02;
  const cx0 = x;

  const fleshLight = bodyColorLight;
  const fleshMid = bodyColor;
  const fleshDark = bodyColorDark;

  // === SPEED BLUR TRAILS ===
  if (isAttacking) {
    for (let t = 1; t <= 3; t++) {
      ctx.globalAlpha = 0.1 / t;
      ctx.fillStyle = fleshDark;
      ctx.beginPath();
      ctx.ellipse(cx0 - t * size * 0.06, y - size * 0.05, size * 0.12, size * 0.18, 0, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // === SCRATCH MARKS ON GROUND WHEN ATTACKING ===
  if (isAttacking) {
    ctx.strokeStyle = "rgba(100, 30, 30, 0.3)";
    ctx.lineWidth = 1 * zoom;
    for (let s = 0; s < 3; s++) {
      const sx = cx0 + size * 0.15 + s * size * 0.02;
      ctx.beginPath();
      ctx.moveTo(sx, y + size * 0.46);
      ctx.lineTo(sx + size * 0.04, y + size * 0.52);
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

  const torsoGrad = ctx.createRadialGradient(cx0, torsoY, size * 0.03, cx0, torsoY, size * 0.15);
  torsoGrad.addColorStop(0, fleshLight);
  torsoGrad.addColorStop(0.6, fleshMid);
  torsoGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.ellipse(cx0, torsoY, size * 0.13, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Spine ridges
  ctx.fillStyle = fleshDark;
  for (let s = 0; s < 5; s++) {
    const sx = cx0 - size * 0.06 + s * size * 0.03;
    const sy = torsoY - size * 0.08;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + size * 0.008, sy - size * 0.02);
    ctx.lineTo(sx + size * 0.016, sy);
    ctx.closePath();
    ctx.fill();
  }

  // Tattered shroud
  ctx.fillStyle = "rgba(60, 50, 40, 0.5)";
  ctx.beginPath();
  ctx.moveTo(cx0 - size * 0.1, torsoY - size * 0.06);
  for (let i = 0; i <= 6; i++) {
    const tx = cx0 - size * 0.1 + i * size * 0.033;
    const ty = torsoY + size * 0.08 + (i % 2) * size * 0.02 + Math.sin(time * 4 + i) * size * 0.008;
    ctx.lineTo(tx, ty);
  }
  ctx.lineTo(cx0 + size * 0.1, torsoY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Decorative overlays
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawShoulderOverlay(ctx, cx0 + side * size * 0.17, torsoY - size * 0.05 - bodyBob, size, side, fleshDark, fleshDark, 'tattered');
  }
  drawBeltOverlay(ctx, cx0, torsoY + size * 0.08, size, size * 0.1, fleshDark, fleshDark);

  // === LONG CLAWED ARMS ===
  for (const side of [-1, 1] as (-1 | 1)[]) {
    drawPathArm(ctx, cx0 + side * size * 0.13, torsoY - size * 0.05 - bodyBob, size, time, zoom, side, {
      color: fleshMid, colorDark: fleshDark, handColor: fleshDark,
      swingSpeed: 8, swingAmt: 0.4, baseAngle: 0.5,
      attackExtra: isAttacking ? 0.8 : 0, elbowBend: 0.6,
      upperLen: 0.30, foreLen: 0.27, handRadius: 0.046,
      style: 'fleshy',
    });
  }

  // Blood drip from claws
  if (isAttacking) {
    for (const side of [-1, 1]) {
      const dripX = cx0 + side * size * 0.25;
      const dripPhase = (time * 0.8 + side) % 1;
      ctx.fillStyle = `rgba(140, 20, 20, ${(1 - dripPhase) * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(dripX, y + size * 0.1 + dripPhase * size * 0.1, size * 0.004, size * 0.008, 0, 0, TAU);
      ctx.fill();
    }
  }

  // === ELONGATED HEAD ===
  const headX = cx0;
  const headY = y - size * 0.18 - bodyBob;

  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.08);
  headGrad.addColorStop(0, fleshLight);
  headGrad.addColorStop(0.6, fleshMid);
  headGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.07, size * 0.085, 0, 0, TAU);
  ctx.fill();

  // Matted hair
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.ellipse(headX, headY - size * 0.05, size * 0.06, size * 0.03, 0, 0, TAU);
  ctx.fill();
  for (let h = 0; h < 3; h++) {
    const hx = headX - size * 0.03 + h * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(hx, headY - size * 0.06);
    ctx.lineTo(hx + Math.sin(time * 5 + h) * size * 0.01, headY - size * 0.1);
    ctx.lineWidth = size * 0.008;
    ctx.strokeStyle = "#2a2015";
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

  // Fanged mouth
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.045, size * 0.03, size * 0.018, 0, 0, TAU);
  ctx.fill();

  // Fangs
  ctx.fillStyle = "#e0d8c0";
  for (const [fx, angle] of [[-0.015, -0.2], [0.015, 0.2]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(headX + fx * size, headY + size * 0.04);
    ctx.lineTo(headX + fx * size - size * 0.004, headY + size * 0.065);
    ctx.lineTo(headX + fx * size + size * 0.004, headY + size * 0.065);
    ctx.closePath();
    ctx.fill();
  }

  // Saliva strands
  ctx.strokeStyle = "rgba(200, 200, 160, 0.3)";
  ctx.lineWidth = size * 0.003;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.01, headY + size * 0.06);
  ctx.lineTo(headX - size * 0.015, headY + size * 0.085 + Math.sin(time * 6) * size * 0.005);
  ctx.stroke();
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

  // Pauldrons
  for (const side of [-1, 1]) {
    const padGrad = ctx.createRadialGradient(cx0 + side * size * 0.18, torsoY - size * 0.15, 0, cx0 + side * size * 0.18, torsoY - size * 0.15, size * 0.06);
    padGrad.addColorStop(0, armorHighlight);
    padGrad.addColorStop(0.6, armorMid);
    padGrad.addColorStop(1, armorDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(cx0 + side * size * 0.18, torsoY - size * 0.15 - bodyBob, size * 0.065, size * 0.045, side * 0.2, 0, TAU);
    ctx.fill();
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
    swingSpeed: 4, swingAmt: 0.15, baseAngle: 0.3,
    elbowBend: 0.6, upperLen: 0.27, foreLen: 0.22,
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

      // Crossguard
      ctx.fillStyle = armorHighlight;
      ctx.fillRect(-size * 0.05, foreLen - size * 0.02, size * 0.1, size * 0.018);
      ctx.fillStyle = redTrim;
      ctx.beginPath();
      ctx.arc(-size * 0.04, foreLen - size * 0.01, size * 0.008, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.04, foreLen - size * 0.01, size * 0.008, 0, TAU);
      ctx.fill();

      // Grip
      ctx.fillStyle = "#2a1a1a";
      ctx.fillRect(-size * 0.012, foreLen - size * 0.1, size * 0.024, size * 0.08);

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

  const helmGrad = ctx.createRadialGradient(helmX, helmY, 0, helmX, helmY, size * 0.11);
  helmGrad.addColorStop(0, armorHighlight);
  helmGrad.addColorStop(0.5, armorMid);
  helmGrad.addColorStop(1, armorDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(helmX, helmY, size * 0.1, size * 0.11, 0, 0, TAU);
  ctx.fill();

  // Visor slit
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(helmX - size * 0.065, helmY - size * 0.005, size * 0.13, size * 0.015);

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

  // Red plume
  ctx.save();
  ctx.translate(helmX, helmY - size * 0.1);
  const plumeWave = Math.sin(time * 3) * 0.15;
  ctx.rotate(plumeWave);
  const plumeGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.12);
  plumeGrad.addColorStop(0, "#5a1020");
  plumeGrad.addColorStop(0.5, "#8a2030");
  plumeGrad.addColorStop(1, "#5a1020");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, 0);
  ctx.quadraticCurveTo(-size * 0.025, -size * 0.06, -size * 0.01, -size * 0.12);
  ctx.lineTo(size * 0.01, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.025, -size * 0.06, size * 0.015, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Steam wisps from breathing holes
  for (let w = 0; w < 2; w++) {
    const wPhase = (time * 0.5 + w * 0.5) % 1;
    ctx.globalAlpha = (1 - wPhase) * 0.12;
    ctx.fillStyle = "rgba(150, 150, 160, 0.4)";
    ctx.beginPath();
    ctx.arc(helmX + size * 0.08 + wPhase * size * 0.04, helmY + size * 0.03 - wPhase * size * 0.06, size * 0.008 * (1 + wPhase), 0, TAU);
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

  // Skull motif on chest
  ctx.fillStyle = goldMid;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx0, torsoY - size * 0.06, size * 0.025, size * 0.03, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = armorDark;
  ctx.beginPath();
  ctx.arc(cx0 - size * 0.008, torsoY - size * 0.065, size * 0.005, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx0 + size * 0.008, torsoY - size * 0.065, size * 0.005, 0, TAU);
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

  // Spiked pauldrons with gems
  for (const side of [-1, 1]) {
    const padX = cx0 + side * size * 0.2;
    const padY = torsoY - size * 0.16 - bodyBob;

    // Main pauldron
    const padGrad = ctx.createRadialGradient(padX, padY, 0, padX, padY, size * 0.07);
    padGrad.addColorStop(0, armorHighlight);
    padGrad.addColorStop(0.5, armorMid);
    padGrad.addColorStop(1, armorDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(padX, padY, size * 0.07, size * 0.05, side * 0.2, 0, TAU);
    ctx.fill();

    // Spikes
    for (let sp = 0; sp < 3; sp++) {
      const spAngle = side * (0.3 + sp * 0.3) - Math.PI / 2;
      const spLen = size * 0.04;
      ctx.fillStyle = armorLight;
      ctx.beginPath();
      ctx.moveTo(padX + Math.cos(spAngle) * size * 0.05, padY + Math.sin(spAngle) * size * 0.035);
      ctx.lineTo(padX + Math.cos(spAngle) * (size * 0.05 + spLen), padY + Math.sin(spAngle) * (size * 0.035 + spLen * 0.7));
      ctx.lineTo(padX + Math.cos(spAngle + 0.2) * size * 0.045, padY + Math.sin(spAngle + 0.2) * size * 0.03);
      ctx.closePath();
      ctx.fill();
    }

    // Soul-trapped gem
    const gemPulse = 0.5 + Math.sin(time * 3 + side) * 0.3;
    ctx.fillStyle = `rgba(120, 40, 80, ${gemPulse})`;
    ctx.beginPath();
    ctx.arc(padX, padY, size * 0.015, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(200, 100, 160, ${gemPulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(padX, padY, size * 0.025, 0, TAU);
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
    swingSpeed: 3, swingAmt: 0.12, baseAngle: 0.3,
    elbowBend: 0.6, upperLen: 0.28, foreLen: 0.24,
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

      // Ornate crossguard with skulls
      ctx.fillStyle = goldMid;
      ctx.fillRect(-size * 0.08, foreLen - size * 0.02, size * 0.16, size * 0.026);
      ctx.fillStyle = "#c8b8a0";
      for (const cs of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cs * size * 0.065, foreLen - size * 0.007, size * 0.013, 0, TAU);
        ctx.fill();
      }

      // Grip
      ctx.fillStyle = "#1a0a0a";
      ctx.fillRect(-size * 0.019, foreLen - size * 0.11, size * 0.038, size * 0.09);

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

  // === CROWN-HELM WITH HORNS ===
  const helmX = cx0;
  const helmY = y - size * 0.32 - bodyBob;

  // Helm body
  const helmGrad = ctx.createRadialGradient(helmX, helmY, 0, helmX, helmY, size * 0.12);
  helmGrad.addColorStop(0, armorHighlight);
  helmGrad.addColorStop(0.5, armorMid);
  helmGrad.addColorStop(1, armorDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(helmX, helmY, size * 0.11, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // T-visor
  ctx.fillStyle = "#050508";
  ctx.fillRect(helmX - size * 0.07, helmY - size * 0.01, size * 0.14, size * 0.018);
  ctx.fillRect(helmX - size * 0.013, helmY - size * 0.01, size * 0.026, size * 0.065);

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
  ctx.fillRect(helmX - size * 0.11, helmY - size * 0.08, size * 0.22, size * 0.02);

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
