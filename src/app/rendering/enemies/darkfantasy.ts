// Princeton Tower Defense - Dark Fantasy Enemy Sprite Functions
// 20 fantasy themed enemies: skeletons, zombies, knights, undead mages, and boss creatures.
// First 10: highly detailed regular fantasy style with custom paths, articulated limbs, and layered construction.

import { drawRadialAura } from "./helpers";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawAnimatedArm,
  drawAnimatedLegs,
  drawGlowingEyes,
  drawShadowWisps,
  drawPoisonBubbles,
  drawOrbitingDebris,
  drawAnimatedTendril,
  drawFloatingPiece,
  drawPulsingGlowRings,
  drawShiftingSegments,
} from "./animationHelpers";

const TAU = Math.PI * 2;

// ============================================================================
// 1. SKELETON FOOTMAN — Basic skeleton soldier with rusty sword & wooden shield
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
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 5;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.28;
  const rightThighAngle = rightLegPhase * 0.28;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.35;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.35;
  const armSwingAngle = Math.sin(walkPhase) * 0.15;
  const rattle = Math.sin(time * 12) * size * 0.006 + (isAttacking ? Math.sin(time * 25) * size * 0.018 : 0);
  const stance = bodyBob;
  const jawRattle = Math.sin(time * 8) * size * 0.008 + (isAttacking ? Math.sin(time * 18) * size * 0.012 : 0);

  const boneWhite = bodyColorLight;
  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const headY = y - size * 0.4 - bodyBob;

  // === GROUND SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.32, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // Dust puffs on footfall
  const leftFootDown = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rightFootDown = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  if (leftFootDown > 0.8) {
    ctx.fillStyle = `rgba(160, 140, 110, ${(leftFootDown - 0.8) * 1.5})`;
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(x - size * 0.13 + (d - 1) * size * 0.05, y + size * 0.52, size * 0.015 * (leftFootDown - 0.8) * 4, 0, TAU);
      ctx.fill();
    }
  }
  if (rightFootDown > 0.8) {
    ctx.fillStyle = `rgba(160, 140, 110, ${(rightFootDown - 0.8) * 1.5})`;
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(x + size * 0.13 + (d - 1) * size * 0.05, y + size * 0.52, size * 0.015 * (rightFootDown - 0.8) * 4, 0, TAU);
      ctx.fill();
    }
  }

  // === ARTICULATED BONE LEGS ===
  const thighLen = size * 0.16;
  const shinLen = size * 0.14;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.1 + rattle, y + size * 0.18 + stance);
  ctx.rotate(leftThighAngle);
  // Femur bone
  const leftFemurGrad = ctx.createLinearGradient(-size * 0.02, 0, size * 0.02, thighLen);
  leftFemurGrad.addColorStop(0, boneWhite);
  leftFemurGrad.addColorStop(0.5, boneMid);
  leftFemurGrad.addColorStop(1, boneDark);
  ctx.fillStyle = leftFemurGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, 0);
  ctx.lineTo(-size * 0.02, thighLen);
  ctx.lineTo(size * 0.02, thighLen);
  ctx.lineTo(size * 0.025, 0);
  ctx.closePath();
  ctx.fill();
  // Joint bulge at top
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.03, 0, TAU);
  ctx.fill();
  // Knee joint
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.028, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  // Tibia bone
  const leftTibiaGrad = ctx.createLinearGradient(0, 0, 0, shinLen);
  leftTibiaGrad.addColorStop(0, boneMid);
  leftTibiaGrad.addColorStop(0.5, boneWhite);
  leftTibiaGrad.addColorStop(1, boneDark);
  ctx.fillStyle = leftTibiaGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, 0);
  ctx.lineTo(-size * 0.015, shinLen);
  ctx.lineTo(size * 0.015, shinLen);
  ctx.lineTo(size * 0.02, 0);
  ctx.closePath();
  ctx.fill();
  // Bony foot
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(size * 0.01, shinLen + size * 0.008, size * 0.04, size * 0.018, 0.15, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.1 + rattle, y + size * 0.18 + stance);
  ctx.rotate(rightThighAngle);
  const rightFemurGrad = ctx.createLinearGradient(-size * 0.02, 0, size * 0.02, thighLen);
  rightFemurGrad.addColorStop(0, boneWhite);
  rightFemurGrad.addColorStop(0.5, boneMid);
  rightFemurGrad.addColorStop(1, boneDark);
  ctx.fillStyle = rightFemurGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, 0);
  ctx.lineTo(-size * 0.02, thighLen);
  ctx.lineTo(size * 0.02, thighLen);
  ctx.lineTo(size * 0.025, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.028, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const rightTibiaGrad = ctx.createLinearGradient(0, 0, 0, shinLen);
  rightTibiaGrad.addColorStop(0, boneMid);
  rightTibiaGrad.addColorStop(0.5, boneWhite);
  rightTibiaGrad.addColorStop(1, boneDark);
  ctx.fillStyle = rightTibiaGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, 0);
  ctx.lineTo(-size * 0.015, shinLen);
  ctx.lineTo(size * 0.015, shinLen);
  ctx.lineTo(size * 0.02, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, shinLen + size * 0.008, size * 0.04, size * 0.018, -0.15, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === TATTERED WAIST CLOTH ===
  ctx.fillStyle = "#6b5c4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14 + rattle, y + size * 0.12 - bodyBob);
  for (let i = 0; i <= 6; i++) {
    const cx2 = x - size * 0.14 + i * size * 0.047 + rattle;
    const cy2 = y + size * 0.22 - bodyBob + (i % 2) * size * 0.04 + Math.sin(time * 3 + i) * size * 0.01;
    ctx.lineTo(cx2, cy2);
  }
  ctx.lineTo(x + size * 0.14 + rattle, y + size * 0.12 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Cloth stitching
  ctx.strokeStyle = "#4a3d2e";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08 + rattle, y + size * 0.14 - bodyBob);
  ctx.lineTo(x - size * 0.06 + rattle, y + size * 0.2 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05 + rattle, y + size * 0.13 - bodyBob);
  ctx.lineTo(x + size * 0.04 + rattle, y + size * 0.19 - bodyBob);
  ctx.stroke();

  // === RIBCAGE TORSO (custom path, NOT ellipse) ===
  const torsoGrad = ctx.createLinearGradient(x - size * 0.18 + rattle, y - size * 0.25, x + size * 0.18 + rattle, y + size * 0.05);
  torsoGrad.addColorStop(0, boneDark);
  torsoGrad.addColorStop(0.3, boneWhite);
  torsoGrad.addColorStop(0.5, boneMid);
  torsoGrad.addColorStop(0.7, boneWhite);
  torsoGrad.addColorStop(1, boneDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + rattle, y + size * 0.15 - bodyBob);
  ctx.lineTo(x - size * 0.16 + rattle, y - size * 0.05 - bodyBob);
  ctx.quadraticCurveTo(x + rattle, y - size * 0.3 - bodyBob, x + size * 0.16 + rattle, y - size * 0.05 - bodyBob);
  ctx.lineTo(x + size * 0.12 + rattle, y + size * 0.15 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Spine center line
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + rattle, y - size * 0.22 - bodyBob);
  ctx.lineTo(x + rattle, y + size * 0.12 - bodyBob);
  ctx.stroke();

  // Individual rib bones with gaps
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1.2 * zoom;
  for (let r = 0; r < 5; r++) {
    const ry = y - size * 0.2 + r * size * 0.06 - bodyBob;
    const ribWidth = size * (0.12 - r * 0.008);
    // Left rib
    ctx.beginPath();
    ctx.moveTo(x + rattle, ry);
    ctx.quadraticCurveTo(x - ribWidth * 0.6 + rattle, ry - size * 0.015, x - ribWidth + rattle, ry + size * 0.01);
    ctx.stroke();
    // Right rib
    ctx.beginPath();
    ctx.moveTo(x + rattle, ry);
    ctx.quadraticCurveTo(x + ribWidth * 0.6 + rattle, ry - size * 0.015, x + ribWidth + rattle, ry + size * 0.01);
    ctx.stroke();
  }

  // Rib highlight strokes
  ctx.strokeStyle = boneWhite;
  ctx.lineWidth = 0.6 * zoom;
  for (let r = 0; r < 5; r++) {
    const ry = y - size * 0.2 + r * size * 0.06 - bodyBob - size * 0.005;
    const ribWidth = size * (0.1 - r * 0.006);
    ctx.beginPath();
    ctx.moveTo(x + rattle + size * 0.01, ry);
    ctx.quadraticCurveTo(x - ribWidth * 0.5 + rattle, ry - size * 0.01, x - ribWidth + rattle, ry + size * 0.005);
    ctx.stroke();
  }

  // === SHIELD ARM (left) ===
  ctx.save();
  ctx.translate(x - size * 0.16 + rattle, y - size * 0.18 - bodyBob);
  ctx.rotate(-0.35 + armSwingAngle * 0.5);
  // Upper arm bone
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, 0);
  ctx.lineTo(-size * 0.015, size * 0.12);
  ctx.lineTo(size * 0.015, size * 0.12);
  ctx.lineTo(size * 0.02, 0);
  ctx.closePath();
  ctx.fill();
  // Elbow
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, size * 0.12, size * 0.02, 0, TAU);
  ctx.fill();
  // Forearm bone
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.12);
  ctx.lineTo(-size * 0.012, size * 0.22);
  ctx.lineTo(size * 0.012, size * 0.22);
  ctx.lineTo(size * 0.015, size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Bony hand
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, size * 0.23, size * 0.018, 0, TAU);
  ctx.fill();
  // Wooden round shield
  const shieldGrad = ctx.createRadialGradient(-size * 0.04, size * 0.16, 0, -size * 0.04, size * 0.16, size * 0.1);
  shieldGrad.addColorStop(0, "#a08050");
  shieldGrad.addColorStop(0.4, "#8a6a3c");
  shieldGrad.addColorStop(0.8, "#6a4e28");
  shieldGrad.addColorStop(1, "#4a3218");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.16, size * 0.09, 0, TAU);
  ctx.fill();
  // Shield rim
  ctx.strokeStyle = "#5a4020";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.16, size * 0.09, 0, TAU);
  ctx.stroke();
  // Wood grain lines
  ctx.strokeStyle = "#7a5a30";
  ctx.lineWidth = 0.7 * zoom;
  for (let g = 0; g < 4; g++) {
    const gy = size * 0.1 + g * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(-size * 0.14, gy);
    ctx.quadraticCurveTo(-size * 0.06, gy - size * 0.01, size * 0.02, gy);
    ctx.stroke();
  }
  // Shield boss (center metal piece)
  ctx.fillStyle = "#8a8090";
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.16, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#6a6070";
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.16, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === SWORD ARM (right) ===
  ctx.save();
  ctx.translate(x + size * 0.16 + rattle, y - size * 0.18 - bodyBob);
  const swordSwing = isAttacking ? Math.sin(time * 18) * 0.9 : 0.25 + Math.sin(time * 5) * 0.15;
  ctx.rotate(swordSwing);
  // Upper arm bone
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, 0);
  ctx.lineTo(-size * 0.015, size * 0.12);
  ctx.lineTo(size * 0.015, size * 0.12);
  ctx.lineTo(size * 0.02, 0);
  ctx.closePath();
  ctx.fill();
  // Elbow
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, size * 0.12, size * 0.02, 0, TAU);
  ctx.fill();
  // Forearm bone
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.12);
  ctx.lineTo(-size * 0.012, size * 0.22);
  ctx.lineTo(size * 0.012, size * 0.22);
  ctx.lineTo(size * 0.015, size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Bony grip fingers
  ctx.fillStyle = boneMid;
  for (let f = 0; f < 3; f++) {
    ctx.beginPath();
    ctx.arc(-size * 0.01 + f * size * 0.01, size * 0.23, size * 0.006, 0, TAU);
    ctx.fill();
  }
  // Rusty iron sword blade
  const bladeGrad = ctx.createLinearGradient(-size * 0.015, size * 0.16, size * 0.015, size * 0.16);
  bladeGrad.addColorStop(0, "#6a6a78");
  bladeGrad.addColorStop(0.3, "#9a9aaa");
  bladeGrad.addColorStop(0.5, "#b0b0c0");
  bladeGrad.addColorStop(0.7, "#9a9aaa");
  bladeGrad.addColorStop(1, "#6a6a78");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.018, size * 0.24);
  ctx.lineTo(-size * 0.015, size * 0.45);
  ctx.lineTo(0, size * 0.5);
  ctx.lineTo(size * 0.015, size * 0.45);
  ctx.lineTo(size * 0.018, size * 0.24);
  ctx.closePath();
  ctx.fill();
  // Blade edge highlight
  ctx.strokeStyle = "#c8c8d8";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.012, size * 0.25);
  ctx.lineTo(0, size * 0.49);
  ctx.stroke();
  // Rust patches
  ctx.fillStyle = "rgba(140, 80, 40, 0.35)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.005, size * 0.32, size * 0.008, size * 0.015, 0.3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(120, 70, 30, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.006, size * 0.4, size * 0.006, size * 0.01, -0.2, 0, TAU);
  ctx.fill();
  // Crossguard
  ctx.fillStyle = "#5a4a30";
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.23);
  ctx.lineTo(-size * 0.045, size * 0.245);
  ctx.lineTo(size * 0.045, size * 0.245);
  ctx.lineTo(size * 0.04, size * 0.23);
  ctx.closePath();
  ctx.fill();
  // Grip wrap
  ctx.strokeStyle = "#4a3a20";
  ctx.lineWidth = 1.2 * zoom;
  for (let w = 0; w < 4; w++) {
    const wy = size * 0.19 + w * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(-size * 0.012, wy);
    ctx.lineTo(size * 0.012, wy + size * 0.006);
    ctx.stroke();
  }
  // Pommel
  ctx.fillStyle = "#7a6a48";
  ctx.beginPath();
  ctx.arc(0, size * 0.17, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === SKULL HEAD ===
  const skullGrad = ctx.createRadialGradient(x + rattle, headY, 0, x + rattle, headY, size * 0.14);
  skullGrad.addColorStop(0, boneWhite);
  skullGrad.addColorStop(0.4, boneMid);
  skullGrad.addColorStop(0.8, boneDark);
  skullGrad.addColorStop(1, "#3a3028");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.ellipse(x + rattle, headY, size * 0.12, size * 0.14, 0, 0, TAU);
  ctx.fill();

  // Cranium crack detail
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02 + rattle, headY - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.05 + rattle, headY - size * 0.06, x + size * 0.03 + rattle, headY - size * 0.02);
  ctx.stroke();

  // Nasal cavity
  ctx.fillStyle = "#2a2018";
  ctx.beginPath();
  ctx.moveTo(x + rattle, headY + size * 0.01);
  ctx.lineTo(x - size * 0.015 + rattle, headY + size * 0.045);
  ctx.lineTo(x + size * 0.015 + rattle, headY + size * 0.045);
  ctx.closePath();
  ctx.fill();

  // Eye sockets (deep, dark)
  ctx.fillStyle = "#1a1410";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.045 + rattle, headY - size * 0.025, size * 0.032, size * 0.038, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.045 + rattle, headY - size * 0.025, size * 0.032, size * 0.038, 0, 0, TAU);
  ctx.fill();

  // Eye glow cores
  const eyeGlow = 0.4 + Math.sin(time * 4) * 0.2;
  setShadowBlur(ctx, 4 * zoom, `rgba(200, 170, 80, ${eyeGlow})`);
  ctx.fillStyle = `rgba(220, 190, 100, ${eyeGlow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.045 + rattle, headY - size * 0.025, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.045 + rattle, headY - size * 0.025, size * 0.015, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Highlight dots in eyes
  ctx.fillStyle = `rgba(255, 240, 180, ${eyeGlow * 0.7})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.048 + rattle, headY - size * 0.03, size * 0.005, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.042 + rattle, headY - size * 0.03, size * 0.005, 0, TAU);
  ctx.fill();

  // Jawbone (separate piece, animated rattle)
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08 + rattle, headY + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.09 + rattle, headY + size * 0.08 + jawRattle, x - size * 0.04 + rattle, headY + size * 0.1 + jawRattle);
  ctx.quadraticCurveTo(x + rattle, headY + size * 0.12 + jawRattle, x + size * 0.04 + rattle, headY + size * 0.1 + jawRattle);
  ctx.quadraticCurveTo(x + size * 0.09 + rattle, headY + size * 0.08 + jawRattle, x + size * 0.08 + rattle, headY + size * 0.05);
  ctx.stroke();
  ctx.fill();

  // Teeth on upper jaw
  ctx.fillStyle = boneWhite;
  for (let t = 0; t < 5; t++) {
    const tx = x - size * 0.04 + t * size * 0.02 + rattle;
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.005, headY + size * 0.06);
    ctx.lineTo(tx, headY + size * 0.075);
    ctx.lineTo(tx + size * 0.005, headY + size * 0.06);
    ctx.fill();
  }

  // Teeth on lower jaw
  for (let t = 0; t < 4; t++) {
    const tx = x - size * 0.03 + t * size * 0.02 + rattle;
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.004, headY + size * 0.09 + jawRattle);
    ctx.lineTo(tx, headY + size * 0.075 + jawRattle);
    ctx.lineTo(tx + size * 0.004, headY + size * 0.09 + jawRattle);
    ctx.fill();
  }

  // Clavicle bones connecting to shoulders
  ctx.strokeStyle = boneMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02 + rattle, y - size * 0.22 - bodyBob);
  ctx.lineTo(x - size * 0.16 + rattle, y - size * 0.18 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02 + rattle, y - size * 0.22 - bodyBob);
  ctx.lineTo(x + size * 0.16 + rattle, y - size * 0.18 - bodyBob);
  ctx.stroke();

  // Shoulder joint balls
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(x - size * 0.16 + rattle, y - size * 0.18 - bodyBob, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.16 + rattle, y - size * 0.18 - bodyBob, size * 0.025, 0, TAU);
  ctx.fill();
}

// ============================================================================
// 2. SKELETON KNIGHT — Armored skeleton with T-visor helm, shield & longsword
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
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const walkPhase = time * 3.5;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.2;
  const rightThighAngle = rightLegPhase * 0.2;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.3;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.3;
  const armSwingAngle = Math.sin(walkPhase) * 0.1;
  const clank = isAttacking ? Math.sin(time * 20) * size * 0.012 : 0;
  const stance = bodyBob + (isAttacking ? attackIntensity * size * 0.05 : 0);

  const ironDark = "#2a2a3e";
  const ironMid = "#4a4a5e";
  const ironLight = "#6e6e82";
  const ironHighlight = "#8a8a9e";
  const boneWhite = bodyColorLight;
  const headY = y - size * 0.44 - bodyBob;

  // === GROUND SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.36, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Ground dust
  const leftDown = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rightDown = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  if (leftDown > 0.85) {
    ctx.fillStyle = `rgba(120, 110, 100, ${(leftDown - 0.85) * 2})`;
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(x - size * 0.12 + (d - 1) * size * 0.06, y + size * 0.53, size * 0.015, 0, TAU);
      ctx.fill();
    }
  }
  if (rightDown > 0.85) {
    ctx.fillStyle = `rgba(120, 110, 100, ${(rightDown - 0.85) * 2})`;
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(x + size * 0.12 + (d - 1) * size * 0.06, y + size * 0.53, size * 0.015, 0, TAU);
      ctx.fill();
    }
  }

  // === ARTICULATED ARMORED LEGS ===
  const thighLen = size * 0.17;
  const shinLen = size * 0.15;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.12 + clank, y + size * 0.2 + stance);
  ctx.rotate(leftThighAngle);
  const leftThighGrad = ctx.createLinearGradient(0, 0, 0, thighLen);
  leftThighGrad.addColorStop(0, ironLight);
  leftThighGrad.addColorStop(0.5, ironMid);
  leftThighGrad.addColorStop(1, ironDark);
  ctx.fillStyle = leftThighGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.045, thighLen);
  ctx.lineTo(size * 0.045, thighLen);
  ctx.lineTo(size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  // Thigh plate highlight
  ctx.strokeStyle = ironHighlight;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.03, size * 0.02);
  ctx.lineTo(size * 0.025, thighLen - size * 0.02);
  ctx.stroke();
  // Knee guard
  ctx.fillStyle = ironMid;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.fillStyle = ironLight;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.025, 0, Math.PI);
  ctx.fill();
  // Knee rivet
  ctx.fillStyle = ironHighlight;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  // Greave (shin armor)
  const leftShinGrad = ctx.createLinearGradient(0, 0, 0, shinLen);
  leftShinGrad.addColorStop(0, ironMid);
  leftShinGrad.addColorStop(0.4, ironLight);
  leftShinGrad.addColorStop(1, ironDark);
  ctx.fillStyle = leftShinGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.042, 0);
  ctx.lineTo(-size * 0.035, shinLen);
  ctx.lineTo(size * 0.035, shinLen);
  ctx.lineTo(size * 0.042, 0);
  ctx.closePath();
  ctx.fill();
  // Greave horizontal detail
  ctx.strokeStyle = ironDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.038, shinLen * 0.35);
  ctx.lineTo(size * 0.038, shinLen * 0.35);
  ctx.stroke();
  // Armored boot
  ctx.fillStyle = ironDark;
  ctx.beginPath();
  ctx.ellipse(size * 0.01, shinLen + size * 0.01, size * 0.055, size * 0.028, 0.1, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = ironMid;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.12 + clank, y + size * 0.2 + stance);
  ctx.rotate(rightThighAngle);
  const rightThighGrad = ctx.createLinearGradient(0, 0, 0, thighLen);
  rightThighGrad.addColorStop(0, ironLight);
  rightThighGrad.addColorStop(0.5, ironMid);
  rightThighGrad.addColorStop(1, ironDark);
  ctx.fillStyle = rightThighGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.045, thighLen);
  ctx.lineTo(size * 0.045, thighLen);
  ctx.lineTo(size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ironHighlight;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, size * 0.02);
  ctx.lineTo(-size * 0.025, thighLen - size * 0.02);
  ctx.stroke();
  ctx.fillStyle = ironMid;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.fillStyle = ironLight;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.025, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = ironHighlight;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const rightShinGrad = ctx.createLinearGradient(0, 0, 0, shinLen);
  rightShinGrad.addColorStop(0, ironMid);
  rightShinGrad.addColorStop(0.4, ironLight);
  rightShinGrad.addColorStop(1, ironDark);
  ctx.fillStyle = rightShinGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.042, 0);
  ctx.lineTo(-size * 0.035, shinLen);
  ctx.lineTo(size * 0.035, shinLen);
  ctx.lineTo(size * 0.042, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = ironDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.038, shinLen * 0.35);
  ctx.lineTo(size * 0.038, shinLen * 0.35);
  ctx.stroke();
  ctx.fillStyle = ironDark;
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, shinLen + size * 0.01, size * 0.055, size * 0.028, -0.1, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = ironMid;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.restore();

  // === CHAINMAIL SKIRT ===
  ctx.fillStyle = ironMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2 + clank, y + size * 0.12 - bodyBob);
  for (let i = 0; i <= 8; i++) {
    const cx2 = x - size * 0.2 + i * size * 0.05 + clank;
    const cy2 = y + size * 0.24 - bodyBob + (i % 2) * size * 0.015;
    ctx.lineTo(cx2, cy2);
  }
  ctx.lineTo(x + size * 0.2 + clank, y + size * 0.12 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Chainmail cross-hatch texture
  ctx.strokeStyle = ironDark;
  ctx.lineWidth = 0.5 * zoom;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      const mx = x - size * 0.15 + c * size * 0.06 + (r % 2) * size * 0.03 + clank;
      const my = y + size * 0.14 + r * size * 0.03 - bodyBob;
      ctx.beginPath();
      ctx.arc(mx, my, size * 0.008, 0, TAU);
      ctx.stroke();
    }
  }

  // === ARMORED TORSO (custom path) ===
  const armorGrad = ctx.createLinearGradient(x - size * 0.25 + clank, y, x + size * 0.25 + clank, y);
  armorGrad.addColorStop(0, ironDark);
  armorGrad.addColorStop(0.2, ironMid);
  armorGrad.addColorStop(0.35, ironLight);
  armorGrad.addColorStop(0.5, ironHighlight);
  armorGrad.addColorStop(0.65, ironLight);
  armorGrad.addColorStop(0.8, ironMid);
  armorGrad.addColorStop(1, ironDark);
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + clank, y + size * 0.15 - bodyBob);
  ctx.lineTo(x - size * 0.22 + clank, y - size * 0.12 - bodyBob);
  ctx.quadraticCurveTo(x + clank, y - size * 0.35 - bodyBob, x + size * 0.22 + clank, y - size * 0.12 - bodyBob);
  ctx.lineTo(x + size * 0.18 + clank, y + size * 0.15 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Center seam line
  ctx.strokeStyle = ironDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + clank, y - size * 0.28 - bodyBob);
  ctx.lineTo(x + clank, y + size * 0.12 - bodyBob);
  ctx.stroke();

  // Horizontal plate lines
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + clank, y - size * 0.1 - bodyBob);
  ctx.lineTo(x + size * 0.18 + clank, y - size * 0.1 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16 + clank, y + size * 0.02 - bodyBob);
  ctx.lineTo(x + size * 0.16 + clank, y + size * 0.02 - bodyBob);
  ctx.stroke();

  // Chest rivets
  ctx.fillStyle = ironHighlight;
  const rivetPositions = [
    [-0.14, -0.18], [0.14, -0.18], [-0.16, -0.05], [0.16, -0.05],
    [-0.14, 0.08], [0.14, 0.08],
  ];
  for (const [rx, ry] of rivetPositions) {
    ctx.beginPath();
    ctx.arc(x + rx * size + clank, y + ry * size - bodyBob, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // === PAULDRONS ===
  for (const side of [-1, 1]) {
    const px = x + side * size * 0.24 + clank;
    const py = y - size * 0.2 - bodyBob;
    // Base pauldron
    const pauldGrad = ctx.createLinearGradient(px - size * 0.08, py, px + size * 0.08, py);
    pauldGrad.addColorStop(0, ironDark);
    pauldGrad.addColorStop(0.5, ironLight);
    pauldGrad.addColorStop(1, ironDark);
    ctx.fillStyle = pauldGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.1, size * 0.065, side * 0.3, 0, TAU);
    ctx.fill();
    // Layered plate on top
    ctx.fillStyle = ironMid;
    ctx.beginPath();
    ctx.ellipse(px + side * size * 0.02, py - size * 0.02, size * 0.07, size * 0.04, side * 0.3, 0, TAU);
    ctx.fill();
    // Edge highlight
    ctx.strokeStyle = ironHighlight;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.1, size * 0.065, side * 0.3, Math.PI, TAU);
    ctx.stroke();
    // Rivet
    ctx.fillStyle = ironHighlight;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.01, 0, TAU);
    ctx.fill();
  }

  // === SHIELD ARM (left) ===
  ctx.save();
  ctx.translate(x - size * 0.22 + clank, y - size * 0.12 - bodyBob);
  ctx.rotate(-0.2 + Math.sin(time * 3.5) * 0.08);
  // Gauntlet arm
  ctx.fillStyle = ironMid;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.06, size * 0.04, size * 0.08, 0, 0, TAU);
  ctx.fill();
  // Kite shield
  const shieldGrad = ctx.createLinearGradient(-size * 0.14, -size * 0.12, size * 0.02, size * 0.16);
  shieldGrad.addColorStop(0, ironLight);
  shieldGrad.addColorStop(0.3, "#8a7a5a");
  shieldGrad.addColorStop(0.5, "#a08a60");
  shieldGrad.addColorStop(0.7, "#8a7a5a");
  shieldGrad.addColorStop(1, ironDark);
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.14);
  ctx.lineTo(-size * 0.13, -size * 0.08);
  ctx.lineTo(-size * 0.13, size * 0.1);
  ctx.lineTo(-size * 0.02, size * 0.18);
  ctx.lineTo(size * 0.02, size * 0.1);
  ctx.lineTo(size * 0.02, -size * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a4a30";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  // Heraldic cross
  ctx.strokeStyle = "#c8a840";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.08);
  ctx.lineTo(-size * 0.05, size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.02);
  ctx.lineTo(0, size * 0.02);
  ctx.stroke();
  // Shield boss
  ctx.fillStyle = ironHighlight;
  ctx.beginPath();
  ctx.arc(-size * 0.05, size * 0.02, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === SWORD ARM (right) ===
  drawAnimatedArm(ctx, x + size * 0.22 + clank, y - size * 0.24 - bodyBob, size, time, zoom, 1, {
    upperLen: 0.16, foreLen: 0.14, width: 0.05, swingSpeed: 3.5, swingAmt: 0.18,
    color: ironMid, colorDark: ironDark, handColor: ironMid, handRadius: 0.032,
    attackExtra: isAttacking ? 1 : 0,
  });

  // === HELMET ===
  const helmGrad = ctx.createLinearGradient(x - size * 0.15 + clank, headY - size * 0.1, x + size * 0.15 + clank, headY + size * 0.1);
  helmGrad.addColorStop(0, ironDark);
  helmGrad.addColorStop(0.3, ironMid);
  helmGrad.addColorStop(0.5, ironLight);
  helmGrad.addColorStop(0.7, ironMid);
  helmGrad.addColorStop(1, ironDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x + clank, headY, size * 0.15, 0, TAU);
  ctx.fill();

  // Faceplate
  ctx.fillStyle = ironDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + clank, headY - size * 0.04);
  ctx.lineTo(x - size * 0.12 + clank, headY + size * 0.08);
  ctx.lineTo(x + clank, headY + size * 0.12);
  ctx.lineTo(x + size * 0.12 + clank, headY + size * 0.08);
  ctx.lineTo(x + size * 0.12 + clank, headY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // T-visor slit
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(x - size * 0.1 + clank, headY - size * 0.02, size * 0.2, size * 0.03);
  ctx.fillRect(x - size * 0.015 + clank, headY - size * 0.02, size * 0.03, size * 0.08);

  // Eye glow through visor
  const visorGlow = 0.5 + Math.sin(time * 4) * 0.3;
  setShadowBlur(ctx, 6 * zoom, `rgba(180, 60, 60, ${visorGlow})`);
  ctx.fillStyle = `rgba(200, 80, 80, ${visorGlow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.045 + clank, headY - size * 0.005, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.045 + clank, headY - size * 0.005, size * 0.015, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Helmet crest/ridge
  ctx.fillStyle = ironMid;
  ctx.beginPath();
  ctx.moveTo(x + clank, headY - size * 0.16);
  ctx.lineTo(x - size * 0.015 + clank, headY - size * 0.04);
  ctx.lineTo(x + size * 0.015 + clank, headY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Helmet edge trim
  ctx.strokeStyle = ironHighlight;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x + clank, headY, size * 0.15, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
}

// ============================================================================
// 3. SKELETON ARCHER — Lean skeleton with leather armor, bow & quiver
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
  const isAttacking = attackPhase > 0;
  const drawPull = isAttacking ? attackPhase * 0.35 : 0;
  const walkPhase = time * 4.5;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.01;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.22;
  const rightThighAngle = rightLegPhase * 0.22;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.3;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.3;
  const sway = Math.sin(time * 4) * size * 0.004;
  const stance = bodyBob;

  const boneWhite = bodyColorLight;
  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const leatherDark = "#4a3828";
  const leatherMid = "#6a5038";
  const leatherLight = "#8a6a48";
  const headY = y - size * 0.38 - bodyBob;

  // === GROUND SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.17)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.28, size * 0.08, 0, 0, TAU);
  ctx.fill();

  // === ARTICULATED BONE LEGS WITH LEATHER WRAPS ===
  const thighLen = size * 0.15;
  const shinLen = size * 0.13;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.09 + sway, y + size * 0.18 + stance);
  ctx.rotate(leftThighAngle);
  const leftFG = ctx.createLinearGradient(0, 0, 0, thighLen);
  leftFG.addColorStop(0, boneWhite);
  leftFG.addColorStop(0.5, boneMid);
  leftFG.addColorStop(1, boneDark);
  ctx.fillStyle = leftFG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.022, 0);
  ctx.lineTo(-size * 0.018, thighLen);
  ctx.lineTo(size * 0.018, thighLen);
  ctx.lineTo(size * 0.022, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.025, 0, TAU);
  ctx.fill();
  // Leather wrap on thigh
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 1 * zoom;
  for (let w = 0; w < 3; w++) {
    const wy = size * 0.03 + w * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, wy);
    ctx.lineTo(size * 0.025, wy + size * 0.015);
    ctx.stroke();
  }
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.024, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  const leftSG = ctx.createLinearGradient(0, 0, 0, shinLen);
  leftSG.addColorStop(0, boneMid);
  leftSG.addColorStop(1, boneDark);
  ctx.fillStyle = leftSG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.018, 0);
  ctx.lineTo(-size * 0.014, shinLen);
  ctx.lineTo(size * 0.014, shinLen);
  ctx.lineTo(size * 0.018, 0);
  ctx.closePath();
  ctx.fill();
  // Leather boot
  ctx.fillStyle = leatherMid;
  ctx.beginPath();
  ctx.ellipse(size * 0.008, shinLen + size * 0.006, size * 0.035, size * 0.016, 0.12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.09 + sway, y + size * 0.18 + stance);
  ctx.rotate(rightThighAngle);
  const rightFG = ctx.createLinearGradient(0, 0, 0, thighLen);
  rightFG.addColorStop(0, boneWhite);
  rightFG.addColorStop(0.5, boneMid);
  rightFG.addColorStop(1, boneDark);
  ctx.fillStyle = rightFG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.022, 0);
  ctx.lineTo(-size * 0.018, thighLen);
  ctx.lineTo(size * 0.018, thighLen);
  ctx.lineTo(size * 0.022, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 1 * zoom;
  for (let w = 0; w < 3; w++) {
    const wy = size * 0.03 + w * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, wy);
    ctx.lineTo(size * 0.025, wy + size * 0.015);
    ctx.stroke();
  }
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.024, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const rightSG = ctx.createLinearGradient(0, 0, 0, shinLen);
  rightSG.addColorStop(0, boneMid);
  rightSG.addColorStop(1, boneDark);
  ctx.fillStyle = rightSG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.018, 0);
  ctx.lineTo(-size * 0.014, shinLen);
  ctx.lineTo(size * 0.014, shinLen);
  ctx.lineTo(size * 0.018, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = leatherMid;
  ctx.beginPath();
  ctx.ellipse(-size * 0.008, shinLen + size * 0.006, size * 0.035, size * 0.016, -0.12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();
  ctx.restore();

  // === QUIVER ON BACK ===
  ctx.save();
  ctx.translate(x + size * 0.1 + sway, y - size * 0.12 - bodyBob);
  ctx.rotate(0.18);
  // Quiver body
  const quiverGrad = ctx.createLinearGradient(-size * 0.025, -size * 0.2, size * 0.025, size * 0.15);
  quiverGrad.addColorStop(0, leatherLight);
  quiverGrad.addColorStop(0.5, leatherMid);
  quiverGrad.addColorStop(1, leatherDark);
  ctx.fillStyle = quiverGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.18);
  ctx.lineTo(-size * 0.03, size * 0.14);
  ctx.lineTo(size * 0.03, size * 0.14);
  ctx.lineTo(size * 0.025, -size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  // Leather bands
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, -size * 0.08);
  ctx.lineTo(size * 0.028, -size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.029, size * 0.05);
  ctx.lineTo(size * 0.029, size * 0.05);
  ctx.stroke();
  // Arrow shafts sticking out
  ctx.strokeStyle = "#8a7850";
  ctx.lineWidth = 0.8 * zoom;
  for (let a = 0; a < 4; a++) {
    const ax = -size * 0.015 + a * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.18);
    ctx.lineTo(ax, -size * 0.28);
    ctx.stroke();
  }
  // Arrow tips (iron)
  ctx.fillStyle = "#8a8a98";
  for (let a = 0; a < 4; a++) {
    const ax = -size * 0.015 + a * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(ax - size * 0.006, -size * 0.28);
    ctx.lineTo(ax, -size * 0.32);
    ctx.lineTo(ax + size * 0.006, -size * 0.28);
    ctx.fill();
  }
  // Fletching
  ctx.fillStyle = "#c0a070";
  for (let a = 0; a < 4; a++) {
    const ax = -size * 0.015 + a * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.19);
    ctx.lineTo(ax - size * 0.005, -size * 0.2);
    ctx.lineTo(ax, -size * 0.21);
    ctx.fill();
  }
  ctx.restore();

  // === LEATHER TORSO ARMOR (custom path) ===
  const torsoGrad = ctx.createLinearGradient(x - size * 0.15 + sway, y - size * 0.15, x + size * 0.15 + sway, y + size * 0.05);
  torsoGrad.addColorStop(0, leatherDark);
  torsoGrad.addColorStop(0.3, leatherMid);
  torsoGrad.addColorStop(0.5, leatherLight);
  torsoGrad.addColorStop(0.7, leatherMid);
  torsoGrad.addColorStop(1, leatherDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11 + sway, y + size * 0.14 - bodyBob);
  ctx.lineTo(x - size * 0.14 + sway, y - size * 0.05 - bodyBob);
  ctx.quadraticCurveTo(x + sway, y - size * 0.28 - bodyBob, x + size * 0.14 + sway, y - size * 0.05 - bodyBob);
  ctx.lineTo(x + size * 0.11 + sway, y + size * 0.14 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Leather lacing detail
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let lace = 0; lace < 5; lace++) {
    const ly = y - size * 0.18 + lace * size * 0.06 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.015 + sway, ly);
    ctx.lineTo(x + size * 0.015 + sway, ly + size * 0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.015 + sway, ly);
    ctx.lineTo(x - size * 0.015 + sway, ly + size * 0.02);
    ctx.stroke();
  }

  // Ribs visible through gaps
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.7 * zoom;
  for (let r = 0; r < 3; r++) {
    const ry = y - size * 0.12 + r * size * 0.05 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + sway, ry);
    ctx.quadraticCurveTo(x + sway, ry + size * 0.01, x + size * 0.1 + sway, ry);
    ctx.stroke();
  }

  // === BOW ARM (left) ===
  ctx.save();
  ctx.translate(x - size * 0.14 + sway, y - size * 0.18 - bodyBob);
  ctx.rotate(-0.5);
  // Bone arm
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, 0);
  ctx.lineTo(-size * 0.012, size * 0.1);
  ctx.lineTo(size * 0.012, size * 0.1);
  ctx.lineTo(size * 0.015, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, size * 0.1, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.012, size * 0.1);
  ctx.lineTo(-size * 0.01, size * 0.18);
  ctx.lineTo(size * 0.01, size * 0.18);
  ctx.lineTo(size * 0.012, size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Bony fingers
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, size * 0.19, size * 0.012, 0, TAU);
  ctx.fill();
  // Bow
  const bowGrad = ctx.createLinearGradient(-size * 0.22, 0, size * 0.22, 0);
  bowGrad.addColorStop(0, "#5a3818");
  bowGrad.addColorStop(0.5, "#8a6030");
  bowGrad.addColorStop(1, "#5a3818");
  ctx.strokeStyle = bowGrad;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, size * 0.04, size * 0.22, -Math.PI * 0.42, Math.PI * 0.42);
  ctx.stroke();
  // Bow tip details
  ctx.fillStyle = "#c0a868";
  ctx.beginPath();
  ctx.arc(Math.cos(-Math.PI * 0.42) * size * 0.22, Math.sin(-Math.PI * 0.42) * size * 0.22 + size * 0.04, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(Math.cos(Math.PI * 0.42) * size * 0.22, Math.sin(Math.PI * 0.42) * size * 0.22 + size * 0.04, size * 0.008, 0, TAU);
  ctx.fill();
  // Bowstring
  ctx.strokeStyle = "#d0c8b8";
  ctx.lineWidth = 0.8 * zoom;
  const bowTopX = Math.cos(-Math.PI * 0.42) * size * 0.22;
  const bowTopY = Math.sin(-Math.PI * 0.42) * size * 0.22 + size * 0.04;
  const bowBotX = Math.cos(Math.PI * 0.42) * size * 0.22;
  const bowBotY = Math.sin(Math.PI * 0.42) * size * 0.22 + size * 0.04;
  ctx.beginPath();
  ctx.moveTo(bowTopX, bowTopY);
  ctx.lineTo(drawPull * size * 0.3, size * 0.04);
  ctx.lineTo(bowBotX, bowBotY);
  ctx.stroke();
  // Arrow nocked (when attacking)
  if (isAttacking) {
    ctx.strokeStyle = "#8a7850";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(drawPull * size * 0.3, size * 0.04);
    ctx.lineTo(-size * 0.25, size * 0.04);
    ctx.stroke();
    ctx.fillStyle = "#8a8a98";
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, size * 0.04 - size * 0.006);
    ctx.lineTo(-size * 0.3, size * 0.04);
    ctx.lineTo(-size * 0.25, size * 0.04 + size * 0.006);
    ctx.fill();
  }
  ctx.restore();

  // === RIGHT ARM (drawing string) ===
  drawAnimatedArm(ctx, x + size * 0.12 + sway, y - size * 0.2 - bodyBob, size, time, zoom, 1, {
    upperLen: 0.14, foreLen: 0.12, width: 0.025, swingSpeed: 4.5, swingAmt: 0.12,
    color: boneMid, colorDark: boneDark, handRadius: 0.018,
  });

  // === SKULL HEAD with leather cap ===
  // Leather cap/hood
  const capGrad = ctx.createRadialGradient(x + sway, headY - size * 0.02, 0, x + sway, headY - size * 0.02, size * 0.13);
  capGrad.addColorStop(0, leatherLight);
  capGrad.addColorStop(0.5, leatherMid);
  capGrad.addColorStop(1, leatherDark);
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.arc(x + sway, headY - size * 0.02, size * 0.12, Math.PI * 1.1, Math.PI * 1.9);
  ctx.closePath();
  ctx.fill();

  // Skull beneath
  const skullGrad = ctx.createRadialGradient(x + sway, headY, 0, x + sway, headY, size * 0.11);
  skullGrad.addColorStop(0, boneWhite);
  skullGrad.addColorStop(0.6, boneMid);
  skullGrad.addColorStop(1, boneDark);
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.ellipse(x + sway, headY, size * 0.1, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // Nasal cavity
  ctx.fillStyle = "#2a2018";
  ctx.beginPath();
  ctx.moveTo(x + sway, headY + size * 0.005);
  ctx.lineTo(x - size * 0.012 + sway, headY + size * 0.04);
  ctx.lineTo(x + size * 0.012 + sway, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Eye sockets with green glow
  ctx.fillStyle = "#0a0a18";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.035 + sway, headY - size * 0.02, size * 0.027, size * 0.032, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.035 + sway, headY - size * 0.02, size * 0.027, size * 0.032, 0, 0, TAU);
  ctx.fill();

  const glow = 0.45 + Math.sin(time * 5) * 0.2;
  setShadowBlur(ctx, 4 * zoom, `rgba(100, 200, 100, ${glow})`);
  ctx.fillStyle = `rgba(120, 220, 120, ${glow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.035 + sway, headY - size * 0.02, size * 0.013, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.035 + sway, headY - size * 0.02, size * 0.013, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Jaw
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1 * zoom;
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06 + sway, headY + size * 0.05);
  ctx.quadraticCurveTo(x + sway, headY + size * 0.09, x + size * 0.06 + sway, headY + size * 0.05);
  ctx.stroke();
}

// ============================================================================
// 4. SKELETON KING (BOSS) — Royal skeleton lord with crown, scepter & purple soul flames
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
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const walkPhase = time * 2;
  const bodyBob = Math.sin(time * 2) * size * 0.01;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.15;
  const rightThighAngle = rightLegPhase * 0.15;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.25;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.25;
  const auraFlare = isAttacking ? attackIntensity * 0.6 : 0;
  const stance = bodyBob + (isAttacking ? attackIntensity * size * 0.08 : 0);
  const capeWave = Math.sin(time * 3.5) * 0.15;
  const soulPurple = 0.5 + Math.sin(time * 3) * 0.3;
  const darkPulse = 0.5 + Math.sin(time * 4) * 0.3;

  const boneWhite = bodyColorLight;
  const boneMid = bodyColor;
  const boneDark = bodyColorDark;
  const goldDark = "#8a7020";
  const goldMid = "#c8a840";
  const goldLight = "#e8c850";
  const headY = y - size * 0.48 - bodyBob;

  // === SOUL FLAME AURA ===
  drawRadialAura(ctx, x, y, size * 0.8 + auraFlare * size * 0.3, [
    { offset: 0, color: `rgba(120, 60, 200, ${(0.25 + auraFlare * 0.3) * soulPurple})` },
    { offset: 0.4, color: `rgba(80, 30, 160, ${0.15 * soulPurple})` },
    { offset: 1, color: "rgba(0,0,0,0)" },
  ]);

  // === GROUND EFFECTS ===
  ctx.fillStyle = "rgba(40,10,60,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.45, size * 0.13, 0, 0, TAU);
  ctx.fill();

  // Soul flame particles
  for (let f = 0; f < 10; f++) {
    const fPhase = (time * 1.5 + f * 0.25) % 1;
    const fAngle = (f / 10) * TAU + time * 0.4;
    const fDist = size * (0.3 + fPhase * 0.25);
    const fx = x + Math.cos(fAngle) * fDist;
    const fy = y - fPhase * size * 0.45;
    ctx.fillStyle = `rgba(160, 80, 240, ${(1 - fPhase) * 0.5})`;
    ctx.beginPath();
    ctx.arc(fx, fy, size * 0.02 * (1 - fPhase * 0.6), 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 160, 255, ${(1 - fPhase) * 0.3})`;
    ctx.beginPath();
    ctx.arc(fx, fy, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Ground cracks
  ctx.strokeStyle = `rgba(120, 60, 200, ${darkPulse * 0.35})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let c = 0; c < 5; c++) {
    const ca = (c / 5) * TAU + 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.5);
    let cx2 = x, cy2 = y + size * 0.5;
    for (let seg = 0; seg < 3; seg++) {
      cx2 += Math.cos(ca + (seg - 1) * 0.3) * size * 0.08;
      cy2 += size * 0.02;
      ctx.lineTo(cx2, cy2);
    }
    ctx.stroke();
  }

  // === ARTICULATED BONE LEGS WITH GOLD TRIM ===
  const thighLen = size * 0.17;
  const shinLen = size * 0.15;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.11, y + size * 0.22 + stance);
  ctx.rotate(leftThighAngle);
  const lTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  lTG.addColorStop(0, boneWhite);
  lTG.addColorStop(0.5, boneMid);
  lTG.addColorStop(1, boneDark);
  ctx.fillStyle = lTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, 0);
  ctx.lineTo(-size * 0.024, thighLen);
  ctx.lineTo(size * 0.024, thighLen);
  ctx.lineTo(size * 0.028, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.032, 0, TAU);
  ctx.fill();
  // Gold knee guard
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.032, 0, TAU);
  ctx.fill();
  ctx.fillStyle = goldLight;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  const lSG = ctx.createLinearGradient(0, 0, 0, shinLen);
  lSG.addColorStop(0, boneMid);
  lSG.addColorStop(0.5, boneWhite);
  lSG.addColorStop(1, boneDark);
  ctx.fillStyle = lSG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.024, 0);
  ctx.lineTo(-size * 0.02, shinLen);
  ctx.lineTo(size * 0.02, shinLen);
  ctx.lineTo(size * 0.024, 0);
  ctx.closePath();
  ctx.fill();
  // Gold trimmed boot
  ctx.fillStyle = "#3a2a18";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, shinLen + size * 0.008, size * 0.045, size * 0.02, 0.12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.11, y + size * 0.22 + stance);
  ctx.rotate(rightThighAngle);
  const rTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  rTG.addColorStop(0, boneWhite);
  rTG.addColorStop(0.5, boneMid);
  rTG.addColorStop(1, boneDark);
  ctx.fillStyle = rTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, 0);
  ctx.lineTo(-size * 0.024, thighLen);
  ctx.lineTo(size * 0.024, thighLen);
  ctx.lineTo(size * 0.028, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.032, 0, TAU);
  ctx.fill();
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.032, 0, TAU);
  ctx.fill();
  ctx.fillStyle = goldLight;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const rSG = ctx.createLinearGradient(0, 0, 0, shinLen);
  rSG.addColorStop(0, boneMid);
  rSG.addColorStop(0.5, boneWhite);
  rSG.addColorStop(1, boneDark);
  ctx.fillStyle = rSG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.024, 0);
  ctx.lineTo(-size * 0.02, shinLen);
  ctx.lineTo(size * 0.02, shinLen);
  ctx.lineTo(size * 0.024, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a2a18";
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, shinLen + size * 0.008, size * 0.045, size * 0.02, -0.12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.restore();

  // === ROYAL CAPE ===
  const capeGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  capeGrad.addColorStop(0, "#1a0830");
  capeGrad.addColorStop(0.3, "#3d1860");
  capeGrad.addColorStop(0.5, "#4a2070");
  capeGrad.addColorStop(0.7, "#3d1860");
  capeGrad.addColorStop(1, "#1a0830");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.3 + stance);
  ctx.quadraticCurveTo(x - size * 0.4 - capeWave * size, y + size * 0.15, x - size * 0.32, y + size * 0.55);
  for (let i = 0; i < 7; i++) {
    const jagX = x - size * 0.32 + i * size * 0.092;
    const jagY = y + size * 0.55 + (i % 2) * size * 0.06 + Math.sin(time * 4 + i * 1.1) * size * 0.03;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(x + size * 0.4 + capeWave * size, y + size * 0.15, x + size * 0.22, y - size * 0.3 + stance);
  ctx.closePath();
  ctx.fill();

  // Cape inner lining
  ctx.strokeStyle = "#5a3080";
  ctx.lineWidth = 1 * zoom;
  for (let fold = 0; fold < 4; fold++) {
    const fx = x - size * 0.2 + fold * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(fx, y - size * 0.15 + stance);
    ctx.quadraticCurveTo(fx + Math.sin(time * 2 + fold) * size * 0.02, y + size * 0.2, fx, y + size * 0.5);
    ctx.stroke();
  }

  // Cape gold trim
  ctx.strokeStyle = goldMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.54);
  for (let i = 0; i < 7; i++) {
    const jagX = x - size * 0.32 + i * size * 0.092;
    const jagY = y + size * 0.55 + (i % 2) * size * 0.06 + Math.sin(time * 4 + i * 1.1) * size * 0.03;
    ctx.lineTo(jagX, jagY);
  }
  ctx.stroke();

  // === ROYAL ROBE TORSO (custom path with gold-trimmed armor) ===
  const robeGrad = ctx.createLinearGradient(x - size * 0.22, y - size * 0.15, x + size * 0.22, y + size * 0.15);
  robeGrad.addColorStop(0, "#1a0830");
  robeGrad.addColorStop(0.2, "#3d1860");
  robeGrad.addColorStop(0.5, "#4a2070");
  robeGrad.addColorStop(0.8, "#3d1860");
  robeGrad.addColorStop(1, "#1a0830");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y + size * 0.2 - bodyBob);
  ctx.lineTo(x - size * 0.2, y - size * 0.08 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.35 - bodyBob, x + size * 0.2, y - size * 0.08 - bodyBob);
  ctx.lineTo(x + size * 0.16, y + size * 0.2 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Gold breastplate overlay
  const bpGrad = ctx.createLinearGradient(x - size * 0.12, y - size * 0.2, x + size * 0.12, y + size * 0.05);
  bpGrad.addColorStop(0, goldDark);
  bpGrad.addColorStop(0.3, goldMid);
  bpGrad.addColorStop(0.5, goldLight);
  bpGrad.addColorStop(0.7, goldMid);
  bpGrad.addColorStop(1, goldDark);
  ctx.fillStyle = bpGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y + size * 0.05 - bodyBob);
  ctx.lineTo(x - size * 0.12, y - size * 0.1 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.22 - bodyBob, x + size * 0.12, y - size * 0.1 - bodyBob);
  ctx.lineTo(x + size * 0.1, y + size * 0.05 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Gold plate seam & details
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2 - bodyBob);
  ctx.lineTo(x, y + size * 0.04 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.06 - bodyBob);
  ctx.lineTo(x + size * 0.1, y - size * 0.06 - bodyBob);
  ctx.stroke();

  // Gem on breastplate
  setShadowBlur(ctx, 5 * zoom, "rgba(160, 80, 240, 0.6)");
  ctx.fillStyle = `rgba(180, 100, 255, ${0.8 + soulPurple * 0.2})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.12 - bodyBob, size * 0.02, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // === ORNATE PAULDRONS ===
  for (const side of [-1, 1]) {
    const px = x + side * size * 0.22;
    const py = y - size * 0.24 - bodyBob;
    // Gold pauldron
    const pGrad = ctx.createLinearGradient(px - size * 0.08, py, px + size * 0.08, py);
    pGrad.addColorStop(0, goldDark);
    pGrad.addColorStop(0.5, goldLight);
    pGrad.addColorStop(1, goldDark);
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.1, size * 0.065, side * 0.25, 0, TAU);
    ctx.fill();
    // Purple gem on pauldron
    setShadowBlur(ctx, 4 * zoom, "rgba(160, 80, 240, 0.5)");
    ctx.fillStyle = `rgba(180, 100, 255, ${soulPurple})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.018, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    // Gold rim
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.1, size * 0.065, side * 0.25, 0, TAU);
    ctx.stroke();
  }

  // === LEFT ARM ===
  drawAnimatedArm(ctx, x - size * 0.2, y - size * 0.22 - bodyBob, size, time, zoom, -1, {
    upperLen: 0.16, foreLen: 0.14, width: 0.04, swingSpeed: 2, swingAmt: 0.12,
    color: "#3d1860", colorDark: "#1a0830", handColor: boneWhite, handRadius: 0.028,
  });

  // === SCEPTER ARM (right) ===
  ctx.save();
  ctx.translate(x + size * 0.2, y - size * 0.22 - bodyBob);
  ctx.rotate(0.2 + (isAttacking ? Math.sin(time * 12) * 0.45 : Math.sin(time * 2) * 0.1));
  // Robed arm
  ctx.fillStyle = "#3d1860";
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, size * 0.14);
  ctx.lineTo(size * 0.03, size * 0.14);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  // Bony hand
  ctx.fillStyle = boneWhite;
  ctx.beginPath();
  ctx.arc(0, size * 0.15, size * 0.022, 0, TAU);
  ctx.fill();
  // Scepter shaft
  const scepterGrad = ctx.createLinearGradient(-size * 0.01, size * 0.02, size * 0.01, size * 0.45);
  scepterGrad.addColorStop(0, goldLight);
  scepterGrad.addColorStop(0.5, goldMid);
  scepterGrad.addColorStop(1, goldDark);
  ctx.strokeStyle = scepterGrad;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.02);
  ctx.lineTo(0, size * 0.45);
  ctx.stroke();
  // Scepter head ornament
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, size * 0.01);
  ctx.lineTo(0, -size * 0.02);
  ctx.lineTo(size * 0.02, size * 0.01);
  ctx.lineTo(size * 0.01, size * 0.03);
  ctx.lineTo(-size * 0.01, size * 0.03);
  ctx.closePath();
  ctx.fill();
  // Scepter gem
  const orbGlow = ctx.createRadialGradient(0, size * 0.005, 0, 0, size * 0.005, size * 0.035);
  orbGlow.addColorStop(0, `rgba(220, 160, 255, ${0.95 + auraFlare * 0.05})`);
  orbGlow.addColorStop(0.4, `rgba(160, 80, 240, 0.7)`);
  orbGlow.addColorStop(1, "rgba(100,40,180,0)");
  setShadowBlur(ctx, 8 * zoom, `rgba(180, 100, 255, ${soulPurple})`);
  ctx.fillStyle = orbGlow;
  ctx.beginPath();
  ctx.arc(0, size * 0.005, size * 0.035, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  // === SKULL HEAD (larger, regal) ===
  const skullGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.16);
  skullGrad.addColorStop(0, boneWhite);
  skullGrad.addColorStop(0.5, boneMid);
  skullGrad.addColorStop(0.8, boneDark);
  skullGrad.addColorStop(1, "#2a2018");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.13, size * 0.15, 0, 0, TAU);
  ctx.fill();

  // Cranium suture lines
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.14);
  ctx.quadraticCurveTo(x - size * 0.06, headY - size * 0.05, x - size * 0.1, headY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.14);
  ctx.quadraticCurveTo(x + size * 0.06, headY - size * 0.05, x + size * 0.1, headY);
  ctx.stroke();

  // Nasal cavity
  ctx.fillStyle = "#1a1410";
  ctx.beginPath();
  ctx.moveTo(x, headY + size * 0.01);
  ctx.lineTo(x - size * 0.018, headY + size * 0.05);
  ctx.lineTo(x + size * 0.018, headY + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Deep eye sockets
  ctx.fillStyle = "#0a0808";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, headY - size * 0.025, size * 0.035, size * 0.04, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.05, headY - size * 0.025, size * 0.035, size * 0.04, 0, 0, TAU);
  ctx.fill();

  // Blazing purple soul fire eyes
  setShadowBlur(ctx, 10 * zoom, `rgba(160, 80, 240, ${soulPurple})`);
  drawGlowingEyes(ctx, x, headY - size * 0.025, size, time, {
    spacing: 0.05, eyeRadius: 0.028, pupilRadius: 0.012, glowRadius: 0.06,
    irisColor: `rgb(180, 100, 255)`, glowColor: `rgba(160, 80, 240, 0.6)`,
    pulseSpeed: 3,
  });
  clearShadow(ctx);

  // Soul fire wisps from eyes
  for (let w = 0; w < 4; w++) {
    const wPhase = (time * 2 + w * 0.4) % 1;
    const side2 = w < 2 ? -1 : 1;
    const wx = x + side2 * size * 0.05 + Math.sin(time * 5 + w) * size * 0.02;
    const wy = headY - size * 0.025 - wPhase * size * 0.1;
    ctx.fillStyle = `rgba(180, 100, 255, ${(1 - wPhase) * 0.4})`;
    ctx.beginPath();
    ctx.arc(wx, wy, size * 0.01 * (1 - wPhase), 0, TAU);
    ctx.fill();
  }

  // Jaw
  ctx.fillStyle = boneMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, headY + size * 0.06);
  ctx.quadraticCurveTo(x, headY + size * 0.12, x + size * 0.09, headY + size * 0.06);
  ctx.fill();
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // === GOLDEN CROWN ===
  const crownGrad = ctx.createLinearGradient(x - size * 0.12, headY - size * 0.12, x + size * 0.12, headY - size * 0.12);
  crownGrad.addColorStop(0, goldDark);
  crownGrad.addColorStop(0.3, goldLight);
  crownGrad.addColorStop(0.5, "#f0d860");
  crownGrad.addColorStop(0.7, goldLight);
  crownGrad.addColorStop(1, goldDark);
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.1);
  ctx.lineTo(x - size * 0.1, headY - size * 0.2);
  ctx.lineTo(x - size * 0.06, headY - size * 0.14);
  ctx.lineTo(x - size * 0.02, headY - size * 0.22);
  ctx.lineTo(x + size * 0.02, headY - size * 0.14);
  ctx.lineTo(x + size * 0.06, headY - size * 0.22);
  ctx.lineTo(x + size * 0.1, headY - size * 0.14);
  ctx.lineTo(x + size * 0.12, headY - size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Crown band
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.1);
  ctx.lineTo(x + size * 0.12, headY - size * 0.1);
  ctx.stroke();

  // Crown jewels
  setShadowBlur(ctx, 4 * zoom, "rgba(200, 50, 200, 0.5)");
  ctx.fillStyle = "#e040e0";
  ctx.beginPath();
  ctx.arc(x - size * 0.02, headY - size * 0.19, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#40a0e0";
  ctx.beginPath();
  ctx.arc(x + size * 0.06, headY - size * 0.19, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#e06040";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.17, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#40e080";
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.12, size * 0.01, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // === PULSING GLOW RINGS ===
  drawPulsingGlowRings(ctx, x, y - bodyBob, size, time, zoom, {
    color: "rgba(140, 60, 220, 0.2)",
    count: 3, speed: 1.5, lineWidth: 1.5,
  });
}

// ============================================================================
// 5. ZOMBIE SHAMBLER — Basic rotting zombie with torn peasant clothing
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
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.008;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.12;
  const rightThighAngle = rightLegPhase * 0.12;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.2;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.2;
  const shuffle = Math.sin(time * 3) * size * 0.01;
  const lurch = Math.sin(time * 2) * 0.08;
  const stance = bodyBob;
  const droolPhase = (time * 1.5) % 1;

  const fleshGreen = bodyColor;
  const fleshDark = bodyColorDark;
  const fleshLight = bodyColorLight;
  const headY = y - size * 0.34 - bodyBob;

  // === GROUND SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.3, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // Blood trail drips
  ctx.fillStyle = "rgba(100, 30, 20, 0.15)";
  for (let d = 0; d < 3; d++) {
    ctx.beginPath();
    ctx.ellipse(x + size * 0.05 + d * size * 0.08, y + size * 0.5, size * 0.02, size * 0.008, 0, 0, TAU);
    ctx.fill();
  }

  // === ARTICULATED ZOMBIE LEGS ===
  const thighLen = size * 0.15;
  const shinLen = size * 0.13;

  // Left leg (pants torn)
  ctx.save();
  ctx.translate(x - size * 0.1 + shuffle, y + size * 0.18 + stance);
  ctx.rotate(leftThighAngle);
  const lThG = ctx.createLinearGradient(0, 0, 0, thighLen);
  lThG.addColorStop(0, fleshGreen);
  lThG.addColorStop(0.5, fleshDark);
  lThG.addColorStop(1, "#3a3a2a");
  ctx.fillStyle = lThG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.035, thighLen);
  ctx.lineTo(size * 0.035, thighLen);
  ctx.lineTo(size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  // Torn pants fabric
  ctx.fillStyle = "#5a4a38";
  ctx.beginPath();
  ctx.moveTo(-size * 0.045, 0);
  ctx.lineTo(-size * 0.042, thighLen * 0.6);
  ctx.lineTo(-size * 0.025, thighLen * 0.7);
  ctx.lineTo(-size * 0.038, thighLen * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.fillStyle = fleshGreen;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.028, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  const lSnG = ctx.createLinearGradient(0, 0, 0, shinLen);
  lSnG.addColorStop(0, fleshDark);
  lSnG.addColorStop(1, "#3a3a28");
  ctx.fillStyle = lSnG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.032, 0);
  ctx.lineTo(-size * 0.025, shinLen);
  ctx.lineTo(size * 0.025, shinLen);
  ctx.lineTo(size * 0.032, 0);
  ctx.closePath();
  ctx.fill();
  // Wound on shin
  ctx.strokeStyle = "rgba(120, 30, 20, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, shinLen * 0.4);
  ctx.lineTo(size * 0.01, shinLen * 0.5);
  ctx.stroke();
  // Bare foot
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.ellipse(size * 0.008, shinLen + size * 0.008, size * 0.04, size * 0.018, 0.1, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Right leg (exposed bone on one section)
  ctx.save();
  ctx.translate(x + size * 0.1 + shuffle, y + size * 0.18 + stance);
  ctx.rotate(rightThighAngle);
  const rThG = ctx.createLinearGradient(0, 0, 0, thighLen);
  rThG.addColorStop(0, fleshGreen);
  rThG.addColorStop(0.5, fleshDark);
  rThG.addColorStop(1, "#3a3a2a");
  ctx.fillStyle = rThG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.035, thighLen);
  ctx.lineTo(size * 0.035, thighLen);
  ctx.lineTo(size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  // Exposed bone patch
  ctx.fillStyle = "#d8d0b8";
  ctx.beginPath();
  ctx.ellipse(size * 0.02, thighLen * 0.4, size * 0.015, size * 0.025, 0.2, 0, TAU);
  ctx.fill();
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.fillStyle = fleshGreen;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.028, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const rSnG = ctx.createLinearGradient(0, 0, 0, shinLen);
  rSnG.addColorStop(0, fleshDark);
  rSnG.addColorStop(1, "#3a3a28");
  ctx.fillStyle = rSnG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.032, 0);
  ctx.lineTo(-size * 0.025, shinLen);
  ctx.lineTo(size * 0.025, shinLen);
  ctx.lineTo(size * 0.032, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.ellipse(-size * 0.008, shinLen + size * 0.008, size * 0.04, size * 0.018, -0.1, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === HUNCHED TORSO (custom path, tilted) ===
  ctx.save();
  ctx.translate(x + shuffle, y - size * 0.06 - bodyBob);
  ctx.rotate(lurch);

  const torsoGrad = ctx.createLinearGradient(-size * 0.2, -size * 0.15, size * 0.2, size * 0.15);
  torsoGrad.addColorStop(0, fleshDark);
  torsoGrad.addColorStop(0.3, fleshLight);
  torsoGrad.addColorStop(0.5, fleshGreen);
  torsoGrad.addColorStop(0.7, fleshLight);
  torsoGrad.addColorStop(1, fleshDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, size * 0.16);
  ctx.lineTo(-size * 0.16, -size * 0.02);
  ctx.quadraticCurveTo(0, -size * 0.22, size * 0.16, -size * 0.02);
  ctx.lineTo(size * 0.13, size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Torn shirt remnants
  ctx.fillStyle = "#6a5a42";
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.12);
  ctx.lineTo(-size * 0.15, size * 0.05);
  ctx.lineTo(-size * 0.08, size * 0.08);
  ctx.lineTo(-size * 0.06, -size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5a4a32";
  ctx.beginPath();
  ctx.moveTo(size * 0.06, -size * 0.15);
  ctx.lineTo(size * 0.14, -size * 0.05);
  ctx.lineTo(size * 0.12, size * 0.1);
  ctx.lineTo(size * 0.05, size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Exposed ribs on right side
  ctx.strokeStyle = "#d0c8a8";
  ctx.lineWidth = 1 * zoom;
  for (let r = 0; r < 3; r++) {
    const ry = -size * 0.08 + r * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(size * 0.04, ry);
    ctx.quadraticCurveTo(size * 0.1, ry + size * 0.005, size * 0.13, ry + size * 0.01);
    ctx.stroke();
  }

  // Wound marks
  ctx.strokeStyle = "rgba(140, 40, 30, 0.5)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.05);
  ctx.lineTo(size * 0.02, size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.02, size * 0.06);
  ctx.lineTo(size * 0.08, size * 0.12);
  ctx.stroke();

  ctx.restore();

  // === ARMS (reaching forward, zombified) ===
  // Left arm (intact)
  drawAnimatedArm(ctx, x - size * 0.16 + shuffle, y - size * 0.14 - bodyBob, size, time, zoom, -1, {
    upperLen: 0.16, foreLen: 0.14, width: 0.04, swingSpeed: 3, swingAmt: 0.18,
    baseAngle: 0.55, color: fleshGreen, colorDark: fleshDark, handRadius: 0.028,
    attackExtra: isAttacking ? 0.8 : 0,
  });
  // Right arm (exposed bone forearm)
  ctx.save();
  ctx.translate(x + size * 0.16 + shuffle, y - size * 0.14 - bodyBob);
  const rArmSwing = 0.55 + Math.sin(time * 3 + Math.PI * 0.5) * 0.18 + (isAttacking ? Math.sin(time * 12) * 0.3 : 0);
  ctx.rotate(rArmSwing);
  // Upper arm (flesh)
  ctx.fillStyle = fleshGreen;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.06, size * 0.04, size * 0.08, 0, 0, TAU);
  ctx.fill();
  // Elbow
  ctx.fillStyle = fleshDark;
  ctx.beginPath();
  ctx.arc(0, size * 0.12, size * 0.025, 0, TAU);
  ctx.fill();
  // Forearm (exposed bone)
  ctx.fillStyle = "#c8c0a8";
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.12);
  ctx.lineTo(-size * 0.012, size * 0.24);
  ctx.lineTo(size * 0.012, size * 0.24);
  ctx.lineTo(size * 0.015, size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Bony claw hand
  ctx.fillStyle = "#b8b098";
  ctx.beginPath();
  ctx.arc(0, size * 0.25, size * 0.015, 0, TAU);
  ctx.fill();
  // Missing finger detail
  ctx.strokeStyle = "#a8a088";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, size * 0.26);
  ctx.lineTo(-size * 0.02, size * 0.28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.005, size * 0.26);
  ctx.lineTo(size * 0.015, size * 0.29);
  ctx.stroke();
  ctx.restore();

  // === LOPSIDED HEAD ===
  ctx.save();
  ctx.translate(x + shuffle, headY);
  ctx.rotate(lurch * 0.5 + 0.12);

  const headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.13);
  headGrad.addColorStop(0, fleshLight);
  headGrad.addColorStop(0.4, fleshGreen);
  headGrad.addColorStop(0.8, fleshDark);
  headGrad.addColorStop(1, "#2a2a1a");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.12, size * 0.13, 0, 0, TAU);
  ctx.fill();

  // Patchy hair/scalp
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.ellipse(-size * 0.04, -size * 0.1, size * 0.04, size * 0.025, -0.3, 0, TAU);
  ctx.fill();

  // Wound on cheek
  ctx.strokeStyle = "rgba(140, 40, 30, 0.5)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.04, -size * 0.02);
  ctx.lineTo(size * 0.08, size * 0.03);
  ctx.stroke();

  // Vacant unequal eyes
  ctx.fillStyle = "#e0e0a0";
  ctx.beginPath();
  ctx.arc(-size * 0.04, -size * 0.025, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#c8c870";
  ctx.beginPath();
  ctx.arc(size * 0.04, -size * 0.015, size * 0.02, 0, TAU);
  ctx.fill();
  // Pupils (unfocused, different sizes)
  ctx.fillStyle = "#1a1a10";
  ctx.beginPath();
  ctx.arc(-size * 0.042, -size * 0.022, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.042, -size * 0.012, size * 0.009, 0, TAU);
  ctx.fill();

  // Open slack mouth with drool
  ctx.fillStyle = "#2a1a10";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, size * 0.06, size * 0.04, size * 0.03, 0.1, 0, TAU);
  ctx.fill();
  // Remaining teeth
  ctx.fillStyle = "#c8c0a0";
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.04);
  ctx.lineTo(-size * 0.012, size * 0.05);
  ctx.lineTo(-size * 0.005, size * 0.04);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.02, size * 0.042);
  ctx.lineTo(size * 0.025, size * 0.055);
  ctx.lineTo(size * 0.03, size * 0.042);
  ctx.fill();

  // Drool strand
  ctx.strokeStyle = `rgba(140, 160, 100, ${0.4 + Math.sin(time * 2) * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.01, size * 0.08);
  ctx.quadraticCurveTo(size * 0.015, size * 0.12 + droolPhase * size * 0.08, size * 0.01, size * 0.15 + droolPhase * size * 0.06);
  ctx.stroke();

  ctx.restore();
}

// ============================================================================
// 6. ZOMBIE BRUTE — Bloated armored zombie tank with chains & spiked gauntlets
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
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 2.5;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.018;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.1;
  const rightThighAngle = rightLegPhase * 0.1;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.15;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.15;
  const breathe = Math.sin(time * 2) * 0.04;
  const stance = bodyBob + (isAttacking ? attackPhase * size * 0.06 : 0);

  const fleshG = bodyColor;
  const fleshD = bodyColorDark;
  const fleshL = bodyColorLight;
  const headY = y - size * 0.44 - bodyBob;

  // === HEAVY GROUND SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.45, size * 0.13, 0, 0, TAU);
  ctx.fill();

  // Impact cracks when stomping
  const impactStr = Math.max(0, -Math.sin(walkPhase - 0.3));
  if (impactStr > 0.6) {
    ctx.strokeStyle = `rgba(60,50,40,${(impactStr - 0.6) * 0.8})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let c = 0; c < 5; c++) {
      const ca = (c / 5) * TAU + 0.2;
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.5);
      ctx.lineTo(x + Math.cos(ca) * size * 0.22, y + size * 0.5 + Math.sin(ca) * size * 0.06);
      ctx.stroke();
    }
  }

  // === ARTICULATED THICK LEGS ===
  const thighLen = size * 0.16;
  const shinLen = size * 0.14;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.13, y + size * 0.22 + stance);
  ctx.rotate(leftThighAngle);
  const lBTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  lBTG.addColorStop(0, fleshG);
  lBTG.addColorStop(0.5, fleshD);
  lBTG.addColorStop(1, "#2a2a1a");
  ctx.fillStyle = lBTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.lineTo(-size * 0.05, thighLen);
  ctx.lineTo(size * 0.05, thighLen);
  ctx.lineTo(size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fleshD;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.fillStyle = fleshG;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.035, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  const lBSG = ctx.createLinearGradient(0, 0, 0, shinLen);
  lBSG.addColorStop(0, fleshD);
  lBSG.addColorStop(1, "#2a2a18");
  ctx.fillStyle = lBSG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.048, 0);
  ctx.lineTo(-size * 0.042, shinLen);
  ctx.lineTo(size * 0.042, shinLen);
  ctx.lineTo(size * 0.048, 0);
  ctx.closePath();
  ctx.fill();
  // Heavy boot
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, shinLen + size * 0.012, size * 0.06, size * 0.028, 0.1, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.13, y + size * 0.22 + stance);
  ctx.rotate(rightThighAngle);
  const rBTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  rBTG.addColorStop(0, fleshG);
  rBTG.addColorStop(0.5, fleshD);
  rBTG.addColorStop(1, "#2a2a1a");
  ctx.fillStyle = rBTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.lineTo(-size * 0.05, thighLen);
  ctx.lineTo(size * 0.05, thighLen);
  ctx.lineTo(size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fleshD;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.fillStyle = fleshG;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.035, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  const rBSG = ctx.createLinearGradient(0, 0, 0, shinLen);
  rBSG.addColorStop(0, fleshD);
  rBSG.addColorStop(1, "#2a2a18");
  ctx.fillStyle = rBSG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.048, 0);
  ctx.lineTo(-size * 0.042, shinLen);
  ctx.lineTo(size * 0.042, shinLen);
  ctx.lineTo(size * 0.048, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, shinLen + size * 0.012, size * 0.06, size * 0.028, -0.1, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === BLOATED TORSO (custom path) ===
  ctx.save();
  ctx.translate(x, y - size * 0.08 - bodyBob);
  ctx.rotate(breathe);
  const torsoGrad = ctx.createLinearGradient(-size * 0.28, -size * 0.2, size * 0.28, size * 0.2);
  torsoGrad.addColorStop(0, fleshD);
  torsoGrad.addColorStop(0.2, fleshL);
  torsoGrad.addColorStop(0.5, fleshG);
  torsoGrad.addColorStop(0.8, fleshL);
  torsoGrad.addColorStop(1, fleshD);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.22);
  ctx.lineTo(-size * 0.24, size * 0.05);
  ctx.quadraticCurveTo(-size * 0.26, -size * 0.15, 0, -size * 0.25);
  ctx.quadraticCurveTo(size * 0.26, -size * 0.15, size * 0.24, size * 0.05);
  ctx.lineTo(size * 0.2, size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Rusty chain armor wrapping
  ctx.strokeStyle = "#6a6a78";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.08);
  ctx.lineTo(size * 0.22, -size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.05);
  ctx.lineTo(size * 0.2, size * 0.05);
  ctx.stroke();
  // Chain cross links
  ctx.strokeStyle = "#5a5a68";
  ctx.lineWidth = 1 * zoom;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const mx = -size * 0.15 + c * size * 0.075 + (r % 2) * size * 0.04;
      const my = -size * 0.06 + r * size * 0.13;
      ctx.beginPath();
      ctx.ellipse(mx, my, size * 0.012, size * 0.008, 0.3, 0, TAU);
      ctx.stroke();
    }
  }

  // Metal plates bolted to flesh
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.18);
  ctx.lineTo(-size * 0.15, -size * 0.1);
  ctx.lineTo(-size * 0.08, -size * 0.06);
  ctx.lineTo(-size * 0.04, -size * 0.14);
  ctx.closePath();
  ctx.fill();
  // Bolts
  ctx.fillStyle = "#8a8a98";
  ctx.beginPath();
  ctx.arc(-size * 0.09, -size * 0.12, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.07, -size * 0.08, size * 0.008, 0, TAU);
  ctx.fill();

  // Stitched wounds
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.05, -size * 0.15);
  ctx.lineTo(size * 0.12, size * 0.02);
  ctx.stroke();
  for (let st = 0; st < 4; st++) {
    const t = (st + 0.5) / 4;
    const sx = size * 0.05 + (size * 0.12 - size * 0.05) * t;
    const sy = -size * 0.15 + (size * 0.02 + size * 0.15) * t;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.015, sy - size * 0.01);
    ctx.lineTo(sx + size * 0.015, sy + size * 0.01);
    ctx.stroke();
  }

  // Hanging chains
  ctx.strokeStyle = "#7a7a88";
  ctx.lineWidth = 1.5 * zoom;
  for (let ch = 0; ch < 3; ch++) {
    const chx = -size * 0.12 + ch * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(chx, size * 0.05);
    ctx.quadraticCurveTo(chx + Math.sin(time * 2 + ch) * size * 0.03, size * 0.15, chx, size * 0.22);
    ctx.stroke();
  }
  ctx.restore();

  // === MASSIVE FIST ARMS ===
  drawAnimatedArm(ctx, x - size * 0.24, y - size * 0.2 - bodyBob, size, time, zoom, -1, {
    upperLen: 0.2, foreLen: 0.18, width: 0.065, swingSpeed: 2.5, swingAmt: 0.22,
    color: fleshG, colorDark: fleshD, handColor: "#4a4a58", handRadius: 0.055,
    attackExtra: isAttacking ? 1.3 : 0,
  });
  drawAnimatedArm(ctx, x + size * 0.24, y - size * 0.2 - bodyBob, size, time, zoom, 1, {
    upperLen: 0.2, foreLen: 0.18, width: 0.065, swingSpeed: 2.5, swingAmt: 0.22,
    phaseOffset: Math.PI, color: fleshG, colorDark: fleshD, handColor: "#4a4a58", handRadius: 0.055,
    attackExtra: isAttacking ? 1.3 : 0,
  });

  // === SMALL HEAD ON BIG BODY ===
  const headGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.1);
  headGrad.addColorStop(0, fleshL);
  headGrad.addColorStop(0.5, fleshG);
  headGrad.addColorStop(0.8, fleshD);
  headGrad.addColorStop(1, "#1a1a10");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.09, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Tiny angry eyes
  ctx.fillStyle = "#c04040";
  ctx.beginPath();
  ctx.arc(x - size * 0.03, headY - size * 0.015, size * 0.016, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.03, headY - size * 0.015, size * 0.016, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#1a0808";
  ctx.beginPath();
  ctx.arc(x - size * 0.03, headY - size * 0.015, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.03, headY - size * 0.015, size * 0.008, 0, TAU);
  ctx.fill();

  // Brow ridge
  ctx.strokeStyle = fleshD;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, headY - size * 0.03);
  ctx.lineTo(x - size * 0.01, headY - size * 0.045);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.06, headY - size * 0.03);
  ctx.lineTo(x + size * 0.01, headY - size * 0.045);
  ctx.stroke();

  // Snarl mouth
  ctx.fillStyle = "#1a0a08";
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.04, size * 0.04, size * 0.015, 0, 0, TAU);
  ctx.fill();
}

// ============================================================================
// 7. ZOMBIE SPITTER — Acid-spitting zombie with distended glowing jaw
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
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 3.5;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.008;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.15;
  const rightThighAngle = rightLegPhase * 0.15;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.2;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.2;
  const retch = isAttacking ? Math.sin(time * 15) * size * 0.018 : 0;
  const hunch = 0.12;
  const stance = bodyBob;
  const bileGlow = 0.5 + Math.sin(time * 4) * 0.3;

  const fleshG = bodyColor;
  const fleshD = bodyColorDark;
  const fleshL = bodyColorLight;
  const headY = y - size * 0.32 - bodyBob;

  // === BILE PUDDLE ON GROUND ===
  const pudGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.28);
  pudGrad.addColorStop(0, `rgba(80, 200, 40, ${bileGlow * 0.35})`);
  pudGrad.addColorStop(0.5, `rgba(60, 160, 30, ${bileGlow * 0.18})`);
  pudGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = pudGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.28, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // Poison bubbles
  drawPoisonBubbles(ctx, x, y + size * 0.47, size * 0.22, time, zoom, {
    color: "rgba(100, 220, 60, 0.5)", count: 5, speed: 1.5, maxSize: 0.04,
  });

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.3, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // === ARTICULATED LEGS ===
  const thighLen = size * 0.14;
  const shinLen = size * 0.12;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.09 + retch * 0.3, y + size * 0.18 + stance);
  ctx.rotate(leftThighAngle);
  const lSTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  lSTG.addColorStop(0, fleshG);
  lSTG.addColorStop(1, fleshD);
  ctx.fillStyle = lSTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, thighLen);
  ctx.lineTo(size * 0.03, thighLen);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fleshD;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  ctx.fillStyle = fleshD;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, 0);
  ctx.lineTo(-size * 0.022, shinLen);
  ctx.lineTo(size * 0.022, shinLen);
  ctx.lineTo(size * 0.028, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a3a2a";
  ctx.beginPath();
  ctx.ellipse(size * 0.005, shinLen + size * 0.006, size * 0.035, size * 0.016, 0.1, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.09 + retch * 0.3, y + size * 0.18 + stance);
  ctx.rotate(rightThighAngle);
  const rSTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  rSTG.addColorStop(0, fleshG);
  rSTG.addColorStop(1, fleshD);
  ctx.fillStyle = rSTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, 0);
  ctx.lineTo(-size * 0.03, thighLen);
  ctx.lineTo(size * 0.03, thighLen);
  ctx.lineTo(size * 0.035, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = fleshD;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  ctx.fillStyle = fleshD;
  ctx.beginPath();
  ctx.moveTo(-size * 0.028, 0);
  ctx.lineTo(-size * 0.022, shinLen);
  ctx.lineTo(size * 0.022, shinLen);
  ctx.lineTo(size * 0.028, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a3a2a";
  ctx.beginPath();
  ctx.ellipse(-size * 0.005, shinLen + size * 0.006, size * 0.035, size * 0.016, -0.1, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === HUNCHED TORSO WITH BLOATED BELLY (custom path) ===
  ctx.save();
  ctx.translate(x + retch, y - size * 0.04 - bodyBob);
  ctx.rotate(hunch);
  const torsoGrad = ctx.createLinearGradient(-size * 0.18, -size * 0.15, size * 0.18, size * 0.15);
  torsoGrad.addColorStop(0, fleshD);
  torsoGrad.addColorStop(0.3, fleshL);
  torsoGrad.addColorStop(0.5, fleshG);
  torsoGrad.addColorStop(0.7, fleshL);
  torsoGrad.addColorStop(1, fleshD);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, size * 0.16);
  ctx.lineTo(-size * 0.14, 0);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.18, 0, -size * 0.2);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.18, size * 0.14, 0);
  ctx.lineTo(size * 0.12, size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Bloated belly distension (green glow from inside)
  const bellyGrad = ctx.createRadialGradient(0, size * 0.04, 0, 0, size * 0.04, size * 0.1);
  bellyGrad.addColorStop(0, `rgba(80, 200, 50, ${bileGlow * 0.25})`);
  bellyGrad.addColorStop(0.5, `rgba(60, 160, 30, ${bileGlow * 0.12})`);
  bellyGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.04, size * 0.09, size * 0.08, 0, 0, TAU);
  ctx.fill();

  // Tattered robe remains
  ctx.fillStyle = "#4a3a28";
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, -size * 0.1);
  ctx.lineTo(-size * 0.14, size * 0.08);
  for (let i = 0; i < 3; i++) {
    ctx.lineTo(-size * 0.14 + i * size * 0.04, size * 0.12 + (i % 2) * size * 0.03 + Math.sin(time * 2 + i) * size * 0.01);
  }
  ctx.lineTo(-size * 0.04, size * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === CLAW ARMS ===
  drawAnimatedArm(ctx, x - size * 0.14 + retch, y - size * 0.12 - bodyBob, size, time, zoom, -1, {
    upperLen: 0.14, foreLen: 0.12, width: 0.038, swingSpeed: 3.5, swingAmt: 0.15,
    color: fleshG, colorDark: fleshD, handRadius: 0.022,
  });
  drawAnimatedArm(ctx, x + size * 0.14 + retch, y - size * 0.12 - bodyBob, size, time, zoom, 1, {
    upperLen: 0.14, foreLen: 0.12, width: 0.038, swingSpeed: 3.5, swingAmt: 0.15,
    phaseOffset: Math.PI * 0.4, color: fleshG, colorDark: fleshD, handRadius: 0.022,
  });

  // === HEAD WITH DISTENDED GLOWING JAW ===
  const headGrad = ctx.createRadialGradient(x + retch, headY, 0, x + retch, headY, size * 0.12);
  headGrad.addColorStop(0, fleshL);
  headGrad.addColorStop(0.5, fleshG);
  headGrad.addColorStop(0.8, fleshD);
  headGrad.addColorStop(1, "#1a1a10");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x + retch, headY, size * 0.11, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // Swollen throat/jaw with green glow
  const jawGrad = ctx.createRadialGradient(x + retch, headY + size * 0.08, 0, x + retch, headY + size * 0.08, size * 0.07);
  jawGrad.addColorStop(0, `rgba(100, 220, 60, ${bileGlow * 0.4})`);
  jawGrad.addColorStop(0.5, fleshG);
  jawGrad.addColorStop(1, fleshD);
  ctx.fillStyle = jawGrad;
  ctx.beginPath();
  ctx.ellipse(x + retch, headY + size * 0.08, size * 0.08, size * 0.06, 0, 0, TAU);
  ctx.fill();

  // Wide-open mouth
  ctx.fillStyle = "#1a1a10";
  ctx.beginPath();
  ctx.ellipse(x + retch, headY + size * 0.07, size * 0.055, size * 0.04 + (isAttacking ? size * 0.02 : 0), 0, 0, TAU);
  ctx.fill();
  // Inner glow
  const mouthGrad = ctx.createRadialGradient(x + retch, headY + size * 0.07, 0, x + retch, headY + size * 0.07, size * 0.04);
  mouthGrad.addColorStop(0, `rgba(100, 240, 50, ${bileGlow * 0.5})`);
  mouthGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mouthGrad;
  ctx.beginPath();
  ctx.ellipse(x + retch, headY + size * 0.07, size * 0.04, size * 0.025, 0, 0, TAU);
  ctx.fill();

  // Bile dripping from mouth
  ctx.strokeStyle = `rgba(80, 220, 40, ${bileGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let d = 0; d < 4; d++) {
    const dripPhase = (time * 2 + d * 0.35) % 1;
    const dx = x + retch - size * 0.04 + d * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(dx, headY + size * 0.1);
    ctx.lineTo(dx + Math.sin(time * 3 + d) * size * 0.005, headY + size * 0.1 + dripPhase * size * 0.12);
    ctx.stroke();
    ctx.fillStyle = `rgba(100, 240, 50, ${(1 - dripPhase) * bileGlow})`;
    ctx.beginPath();
    ctx.arc(dx, headY + size * 0.1 + dripPhase * size * 0.12, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Sickly glowing eyes
  setShadowBlur(ctx, 4 * zoom, `rgba(100, 240, 50, ${bileGlow})`);
  ctx.fillStyle = `rgba(120, 240, 60, ${bileGlow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.035 + retch, headY - size * 0.025, size * 0.018, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.035 + retch, headY - size * 0.025, size * 0.018, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Pupil slits
  ctx.fillStyle = "#0a0a05";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.035 + retch, headY - size * 0.025, size * 0.004, size * 0.012, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.035 + retch, headY - size * 0.025, size * 0.004, size * 0.012, 0, 0, TAU);
  ctx.fill();
}

// ============================================================================
// 8. GHOUL — Fast feral crouching predator with claws & speed blur
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
  const isAttacking = attackPhase > 0;
  const walkPhase = time * 10;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.02;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.35;
  const rightThighAngle = rightLegPhase * 0.35;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.4;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.4;
  const sprint = Math.sin(time * 10) * size * 0.012;
  const crouch = 0.15;
  const stance = bodyBob;

  const headY = y - size * 0.26 - bodyBob;

  // === GROUND SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.32, size * 0.08, 0, 0, TAU);
  ctx.fill();

  // Speed blur trails when attacking
  if (isAttacking) {
    ctx.globalAlpha = 0.12;
    for (let t = 1; t <= 4; t++) {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(x + t * 6 * zoom, y - size * 0.08, size * 0.15 - t * size * 0.02, size * 0.2 - t * size * 0.02, crouch, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // === ARTICULATED LEGS (crouched, fast-moving) ===
  const thighLen = size * 0.13;
  const shinLen = size * 0.12;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.1 + sprint, y + size * 0.16 + stance);
  ctx.rotate(leftThighAngle);
  const lGTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  lGTG.addColorStop(0, bodyColor);
  lGTG.addColorStop(1, bodyColorDark);
  ctx.fillStyle = lGTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, 0);
  ctx.lineTo(-size * 0.025, thighLen);
  ctx.lineTo(size * 0.025, thighLen);
  ctx.lineTo(size * 0.03, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, 0);
  ctx.lineTo(-size * 0.02, shinLen);
  ctx.lineTo(size * 0.02, shinLen);
  ctx.lineTo(size * 0.025, 0);
  ctx.closePath();
  ctx.fill();
  // Clawed foot
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(size * 0.01, shinLen, size * 0.035, size * 0.015, 0.2, 0, TAU);
  ctx.fill();
  // Toe claws
  ctx.strokeStyle = "#8a8078";
  ctx.lineWidth = 0.8 * zoom;
  for (let c = 0; c < 3; c++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.01 + (c - 1) * size * 0.012, shinLen + size * 0.01);
    ctx.lineTo(size * 0.02 + (c - 1) * size * 0.012, shinLen + size * 0.025);
    ctx.stroke();
  }
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.1 + sprint, y + size * 0.16 + stance);
  ctx.rotate(rightThighAngle);
  const rGTG = ctx.createLinearGradient(0, 0, 0, thighLen);
  rGTG.addColorStop(0, bodyColor);
  rGTG.addColorStop(1, bodyColorDark);
  ctx.fillStyle = rGTG;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, 0);
  ctx.lineTo(-size * 0.025, thighLen);
  ctx.lineTo(size * 0.025, thighLen);
  ctx.lineTo(size * 0.03, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, 0);
  ctx.lineTo(-size * 0.02, shinLen);
  ctx.lineTo(size * 0.02, shinLen);
  ctx.lineTo(size * 0.025, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, shinLen, size * 0.035, size * 0.015, -0.2, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#8a8078";
  ctx.lineWidth = 0.8 * zoom;
  for (let c = 0; c < 3; c++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.01 + (c - 1) * size * 0.012, shinLen + size * 0.01);
    ctx.lineTo(-size * 0.02 + (c - 1) * size * 0.012, shinLen + size * 0.025);
    ctx.stroke();
  }
  ctx.restore();

  // === LOW CROUCHED TORSO (custom path, tilted forward) ===
  ctx.save();
  ctx.translate(x + sprint, y - size * 0.05 - bodyBob);
  ctx.rotate(crouch);
  const torsoGrad = ctx.createLinearGradient(-size * 0.16, -size * 0.12, size * 0.16, size * 0.12);
  torsoGrad.addColorStop(0, bodyColorDark);
  torsoGrad.addColorStop(0.3, bodyColor);
  torsoGrad.addColorStop(0.5, bodyColorLight);
  torsoGrad.addColorStop(0.7, bodyColor);
  torsoGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.11, size * 0.12);
  ctx.lineTo(-size * 0.13, -size * 0.02);
  ctx.quadraticCurveTo(0, -size * 0.2, size * 0.13, -size * 0.02);
  ctx.lineTo(size * 0.11, size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Visible spine ridges
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  for (let sp = 0; sp < 5; sp++) {
    const sy = -size * 0.12 + sp * size * 0.05;
    ctx.beginPath();
    ctx.arc(0, sy, size * 0.008, 0, TAU);
    ctx.stroke();
  }

  // Tattered shroud remains
  ctx.strokeStyle = "#3a3040";
  ctx.lineWidth = 0.8 * zoom;
  for (let s = 0; s < 6; s++) {
    const sx = -size * 0.1 + s * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(sx, size * 0.06);
    ctx.lineTo(sx + Math.sin(time * 5 + s) * size * 0.02, size * 0.14 + Math.sin(time * 4 + s * 0.7) * size * 0.02);
    ctx.stroke();
  }
  ctx.restore();

  // === LONG CLAWED ARMS ===
  drawAnimatedArm(ctx, x - size * 0.13 + sprint, y - size * 0.12 - bodyBob, size, time, zoom, -1, {
    upperLen: 0.16, foreLen: 0.2, width: 0.03, swingSpeed: 10, swingAmt: 0.4,
    baseAngle: 0.7, color: bodyColor, colorDark: bodyColorDark, handRadius: 0.018,
    attackExtra: isAttacking ? 1.5 : 0,
  });
  drawAnimatedArm(ctx, x + size * 0.13 + sprint, y - size * 0.12 - bodyBob, size, time, zoom, 1, {
    upperLen: 0.16, foreLen: 0.2, width: 0.03, swingSpeed: 10, swingAmt: 0.4,
    baseAngle: 0.7, phaseOffset: Math.PI * 0.6, color: bodyColor, colorDark: bodyColorDark, handRadius: 0.018,
    attackExtra: isAttacking ? 1.5 : 0,
  });

  // === HEAD (feral, elongated) ===
  ctx.save();
  ctx.translate(x + sprint, headY);
  ctx.rotate(crouch * 0.4);

  const headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.11);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.09, 0.1, 0, TAU);
  ctx.fill();

  // Wild matted hair strands
  ctx.strokeStyle = "#2a2020";
  ctx.lineWidth = 1 * zoom;
  for (let h = 0; h < 6; h++) {
    const hAngle = -Math.PI * 0.7 + h * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(hAngle) * size * 0.08, Math.sin(hAngle) * size * 0.07);
    ctx.quadraticCurveTo(
      Math.cos(hAngle) * size * 0.12 + Math.sin(time * 3 + h) * size * 0.02,
      Math.sin(hAngle) * size * 0.1,
      Math.cos(hAngle) * size * 0.15,
      Math.sin(hAngle) * size * 0.12,
    );
    ctx.stroke();
  }

  // Feral yellow eyes
  setShadowBlur(ctx, 5 * zoom, "rgba(240, 200, 40, 0.6)");
  ctx.fillStyle = `rgba(240, 210, 50, ${0.7 + Math.sin(time * 8) * 0.2})`;
  ctx.beginPath();
  ctx.arc(-size * 0.035, -size * 0.015, size * 0.018, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.035, -size * 0.01, size * 0.018, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  // Slit pupils
  ctx.fillStyle = "#0a0a05";
  ctx.beginPath();
  ctx.ellipse(-size * 0.035, -size * 0.015, size * 0.004, size * 0.014, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.035, -size * 0.01, size * 0.004, size * 0.014, 0, 0, TAU);
  ctx.fill();

  // Open fanged mouth
  ctx.fillStyle = "#1a0808";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.04, size * 0.05, size * 0.025, 0, 0, TAU);
  ctx.fill();
  // Upper fangs
  ctx.fillStyle = "#d8d0c0";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.02);
  ctx.lineTo(-size * 0.02, size * 0.05);
  ctx.lineTo(-size * 0.015, size * 0.02);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.025, size * 0.02);
  ctx.lineTo(size * 0.02, size * 0.05);
  ctx.lineTo(size * 0.015, size * 0.02);
  ctx.fill();
  // Lower fangs
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.06);
  ctx.lineTo(-size * 0.012, size * 0.04);
  ctx.lineTo(-size * 0.008, size * 0.06);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.015, size * 0.06);
  ctx.lineTo(size * 0.012, size * 0.04);
  ctx.lineTo(size * 0.008, size * 0.06);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// 9. DARK KNIGHT — Heavy plate-armored knight with greatsword & red plume
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
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const walkPhase = time * 3;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.013;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.2;
  const rightThighAngle = rightLegPhase * 0.2;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.28;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.28;
  const armSwingAngle = Math.sin(walkPhase) * 0.1;
  const capeWave = Math.sin(time * 4) * 0.12;
  const stance = bodyBob + (isAttacking ? attackIntensity * size * 0.08 : 0);

  const steelDark = "#3a3a4e";
  const steelMid = "#5a5a70";
  const steelLight = "#7a7a90";
  const steelHighlight = "#9a9ab0";
  const headY = y - size * 0.46 - bodyBob;

  // === GROUND SHADOW ===
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.4, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // Dust clouds
  const lDown = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rDown = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  for (const [side, footVal] of [[-1, lDown], [1, rDown]] as const) {
    if (footVal > 0.82) {
      ctx.fillStyle = `rgba(140, 130, 120, ${(footVal - 0.82) * 2})`;
      for (let d = 0; d < 4; d++) {
        ctx.beginPath();
        ctx.arc(x + side * size * 0.13 + (d - 1.5) * size * 0.04, y + size * 0.54, size * 0.012, 0, TAU);
        ctx.fill();
      }
    }
  }

  // === RED CAPE ===
  const capeGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  capeGrad.addColorStop(0, "#3a0808");
  capeGrad.addColorStop(0.3, "#8a1818");
  capeGrad.addColorStop(0.5, "#a02020");
  capeGrad.addColorStop(0.7, "#8a1818");
  capeGrad.addColorStop(1, "#3a0808");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.3 + stance);
  ctx.quadraticCurveTo(x - size * 0.38 - capeWave * size, y + size * 0.15, x - size * 0.3, y + size * 0.52);
  for (let i = 0; i < 6; i++) {
    const jagX = x - size * 0.3 + i * size * 0.1;
    const jagY = y + size * 0.52 + (i % 2) * size * 0.04 + Math.sin(time * 4.5 + i * 1.2) * size * 0.025;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(x + size * 0.38 + capeWave * size, y + size * 0.15, x + size * 0.24, y - size * 0.3 + stance);
  ctx.closePath();
  ctx.fill();

  // Cape fold lines
  ctx.strokeStyle = "#5a0e0e";
  ctx.lineWidth = 0.8 * zoom;
  for (let fold = 0; fold < 3; fold++) {
    const fx = x - size * 0.15 + fold * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(fx, y - size * 0.1 + stance);
    ctx.quadraticCurveTo(fx + Math.sin(time * 2 + fold) * size * 0.015, y + size * 0.2, fx, y + size * 0.48);
    ctx.stroke();
  }

  // === ARTICULATED ARMORED LEGS ===
  const thighLen = size * 0.18;
  const shinLen = size * 0.16;

  for (const [side, thAngle, knBend] of [[-1, leftThighAngle, leftKneeBend], [1, rightThighAngle, rightKneeBend]] as const) {
    ctx.save();
    ctx.translate(x + side * size * 0.13, y + size * 0.2 + stance);
    ctx.rotate(thAngle);
    const thG = ctx.createLinearGradient(0, 0, 0, thighLen);
    thG.addColorStop(0, steelLight);
    thG.addColorStop(0.5, steelMid);
    thG.addColorStop(1, steelDark);
    ctx.fillStyle = thG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.055, 0);
    ctx.lineTo(-size * 0.05, thighLen);
    ctx.lineTo(size * 0.05, thighLen);
    ctx.lineTo(size * 0.055, 0);
    ctx.closePath();
    ctx.fill();
    // Plate highlight
    ctx.strokeStyle = steelHighlight;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-side * size * 0.035, size * 0.02);
    ctx.lineTo(-side * size * 0.03, thighLen - size * 0.02);
    ctx.stroke();
    // Knee guard
    ctx.fillStyle = steelMid;
    ctx.beginPath();
    ctx.arc(0, thighLen, size * 0.042, 0, TAU);
    ctx.fill();
    ctx.fillStyle = steelHighlight;
    ctx.beginPath();
    ctx.arc(0, thighLen, size * 0.02, 0, Math.PI);
    ctx.fill();
    ctx.translate(0, thighLen);
    ctx.rotate(knBend);
    const snG = ctx.createLinearGradient(0, 0, 0, shinLen);
    snG.addColorStop(0, steelMid);
    snG.addColorStop(0.4, steelLight);
    snG.addColorStop(1, steelDark);
    ctx.fillStyle = snG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.048, 0);
    ctx.lineTo(-size * 0.04, shinLen);
    ctx.lineTo(size * 0.04, shinLen);
    ctx.lineTo(size * 0.048, 0);
    ctx.closePath();
    ctx.fill();
    // Horizontal greave detail
    ctx.strokeStyle = steelDark;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.042, shinLen * 0.4);
    ctx.lineTo(size * 0.042, shinLen * 0.4);
    ctx.stroke();
    // Boot
    ctx.fillStyle = steelDark;
    ctx.beginPath();
    ctx.ellipse(side * size * 0.01, shinLen + size * 0.01, size * 0.06, size * 0.03, side * 0.1, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = steelMid;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.restore();
  }

  // === ARMORED TORSO (custom path) ===
  const armorGrad = ctx.createLinearGradient(x - size * 0.3, y, x + size * 0.3, y);
  armorGrad.addColorStop(0, steelDark);
  armorGrad.addColorStop(0.2, steelMid);
  armorGrad.addColorStop(0.35, steelLight);
  armorGrad.addColorStop(0.5, steelHighlight);
  armorGrad.addColorStop(0.65, steelLight);
  armorGrad.addColorStop(0.8, steelMid);
  armorGrad.addColorStop(1, steelDark);
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.2 - bodyBob);
  ctx.lineTo(x - size * 0.26, y - size * 0.1 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.38 - bodyBob, x + size * 0.26, y - size * 0.1 - bodyBob);
  ctx.lineTo(x + size * 0.22, y + size * 0.2 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Center ridge
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32 - bodyBob);
  ctx.lineTo(x, y + size * 0.16 - bodyBob);
  ctx.stroke();
  // Horizontal plates
  ctx.lineWidth = 1.2 * zoom;
  for (let pl = 0; pl < 3; pl++) {
    const ply = y - size * 0.18 + pl * size * 0.1 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, ply);
    ctx.lineTo(x + size * 0.2, ply);
    ctx.stroke();
  }
  // Rivets
  ctx.fillStyle = steelHighlight;
  for (let r = 0; r < 8; r++) {
    const ra = (r / 8) * TAU;
    const rx = x + Math.cos(ra) * size * 0.14;
    const ry = y - size * 0.05 + Math.sin(ra) * size * 0.12 - bodyBob;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // Belt
  ctx.fillStyle = "#4a3a28";
  ctx.fillRect(x - size * 0.22, y + size * 0.08 - bodyBob, size * 0.44, size * 0.03);
  ctx.fillStyle = "#8a7a58";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.095 - bodyBob, size * 0.015, 0, TAU);
  ctx.fill();

  // === PAULDRONS ===
  for (const side of [-1, 1]) {
    const px = x + side * size * 0.28;
    const py = y - size * 0.22 - bodyBob;
    const pGrad = ctx.createLinearGradient(px - size * 0.1, py, px + size * 0.1, py);
    pGrad.addColorStop(0, steelDark);
    pGrad.addColorStop(0.5, steelLight);
    pGrad.addColorStop(1, steelDark);
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.12, size * 0.07, side * 0.25, 0, TAU);
    ctx.fill();
    // Layered plate
    ctx.fillStyle = steelMid;
    ctx.beginPath();
    ctx.ellipse(px + side * size * 0.02, py - size * 0.02, size * 0.08, size * 0.04, side * 0.25, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = steelHighlight;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.12, size * 0.07, side * 0.25, Math.PI, TAU);
    ctx.stroke();
  }

  // === ARMS WITH GREATSWORD ===
  drawAnimatedArm(ctx, x - size * 0.26, y - size * 0.22 - bodyBob, size, time, zoom, -1, {
    upperLen: 0.18, foreLen: 0.15, width: 0.055, swingSpeed: 3, swingAmt: 0.15,
    color: steelMid, colorDark: steelDark, handColor: steelMid, handRadius: 0.035,
    attackExtra: isAttacking ? 0.8 : 0,
  });
  // Greatsword on right arm
  ctx.save();
  ctx.translate(x + size * 0.26, y - size * 0.22 - bodyBob);
  const gsSwing = isAttacking ? Math.sin(time * 14) * 1.0 : 0.3 + armSwingAngle;
  ctx.rotate(gsSwing);
  // Gauntlet arm
  ctx.fillStyle = steelMid;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.07, size * 0.05, size * 0.09, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = steelDark;
  ctx.beginPath();
  ctx.arc(0, size * 0.15, size * 0.03, 0, TAU);
  ctx.fill();
  // Greatsword blade
  const gsGrad = ctx.createLinearGradient(-size * 0.02, size * 0.2, size * 0.02, size * 0.2);
  gsGrad.addColorStop(0, "#6a6a80");
  gsGrad.addColorStop(0.3, "#a0a0b8");
  gsGrad.addColorStop(0.5, "#c0c0d8");
  gsGrad.addColorStop(0.7, "#a0a0b8");
  gsGrad.addColorStop(1, "#6a6a80");
  ctx.fillStyle = gsGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.022, size * 0.22);
  ctx.lineTo(-size * 0.02, size * 0.55);
  ctx.lineTo(0, size * 0.62);
  ctx.lineTo(size * 0.02, size * 0.55);
  ctx.lineTo(size * 0.022, size * 0.22);
  ctx.closePath();
  ctx.fill();
  // Blade edge highlight
  ctx.strokeStyle = "#d0d0e8";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.015, size * 0.24);
  ctx.lineTo(0, size * 0.61);
  ctx.stroke();
  // Fuller (blood groove)
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.25);
  ctx.lineTo(0, size * 0.48);
  ctx.stroke();
  // Crossguard
  ctx.fillStyle = "#5a4a38";
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, size * 0.2);
  ctx.lineTo(-size * 0.06, size * 0.225);
  ctx.lineTo(size * 0.06, size * 0.225);
  ctx.lineTo(size * 0.055, size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Grip
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(-size * 0.012, size * 0.15, size * 0.024, size * 0.05);
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 0.8 * zoom;
  for (let w = 0; w < 3; w++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.013, size * 0.155 + w * size * 0.015);
    ctx.lineTo(size * 0.013, size * 0.16 + w * size * 0.015);
    ctx.stroke();
  }
  // Pommel
  ctx.fillStyle = "#6a5a40";
  ctx.beginPath();
  ctx.arc(0, size * 0.14, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === GREAT HELM ===
  const helmGrad = ctx.createLinearGradient(x - size * 0.16, headY, x + size * 0.16, headY);
  helmGrad.addColorStop(0, steelDark);
  helmGrad.addColorStop(0.3, steelMid);
  helmGrad.addColorStop(0.5, steelLight);
  helmGrad.addColorStop(0.7, steelMid);
  helmGrad.addColorStop(1, steelDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.16, 0, TAU);
  ctx.fill();

  // Visor faceplate
  ctx.fillStyle = steelDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, headY - size * 0.03);
  ctx.lineTo(x - size * 0.13, headY + size * 0.1);
  ctx.lineTo(x, headY + size * 0.13);
  ctx.lineTo(x + size * 0.13, headY + size * 0.1);
  ctx.lineTo(x + size * 0.13, headY - size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Breathing holes
  for (let h = 0; h < 3; h++) {
    ctx.fillStyle = "#0a0a12";
    ctx.beginPath();
    ctx.ellipse(x + size * 0.06, headY + size * 0.04 + h * size * 0.02, size * 0.008, size * 0.004, 0, 0, TAU);
    ctx.fill();
  }

  // Eye slit
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(x - size * 0.1, headY - size * 0.015, size * 0.2, size * 0.025);

  // Faint eye glow
  const eGlow = 0.35 + Math.sin(time * 3) * 0.15;
  ctx.fillStyle = `rgba(100, 140, 200, ${eGlow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.045, headY - size * 0.003, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.045, headY - size * 0.003, size * 0.012, 0, TAU);
  ctx.fill();

  // Red plume on top
  ctx.fillStyle = "#a01818";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.015, headY - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.04, headY - size * 0.25, x + size * 0.02, headY - size * 0.32 + Math.sin(time * 5) * size * 0.02);
  ctx.quadraticCurveTo(x - size * 0.02, headY - size * 0.28, x - size * 0.015, headY - size * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c02020";
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.16);
  ctx.quadraticCurveTo(x + size * 0.02, headY - size * 0.23, x + size * 0.01, headY - size * 0.3 + Math.sin(time * 5) * size * 0.02);
  ctx.lineTo(x - size * 0.005, headY - size * 0.24);
  ctx.closePath();
  ctx.fill();

  // Helmet edge rim
  ctx.strokeStyle = steelHighlight;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.16, Math.PI * 0.7, Math.PI * 2.3);
  ctx.stroke();
}

// ============================================================================
// 10. DEATH KNIGHT (BOSS) — Massive ornate black+gold plate armor, flaming sword
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
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const walkPhase = time * 2.5;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.015;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.22;
  const rightThighAngle = rightLegPhase * 0.22;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.32;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.32;
  const armSwingAngle = Math.sin(walkPhase) * 0.12;
  const stance = bodyBob + (isAttacking ? attackIntensity * size * 0.12 : 0);
  const darkPulse = 0.5 + Math.sin(time * 4) * 0.35;
  const capeWave = Math.sin(time * 4.5) * 0.16;
  const flamePulse = 0.6 + Math.sin(time * 6) * 0.3;

  const blackDark = "#0a0a10";
  const blackMid = "#1a1a28";
  const blackLight = "#2a2a3a";
  const goldDark = "#7a6018";
  const goldMid = "#b89830";
  const goldLight = "#d8b848";
  const headY = y - size * 0.52 - bodyBob;

  // === DARK ENERGY AURA ===
  drawRadialAura(ctx, x, y, size * 0.9 + (isAttacking ? attackIntensity * size * 0.3 : 0), [
    { offset: 0, color: `rgba(80, 40, 160, ${darkPulse * 0.3})` },
    { offset: 0.4, color: `rgba(40, 20, 100, ${darkPulse * 0.15})` },
    { offset: 1, color: "rgba(0,0,0,0)" },
  ]);

  // === GROUND EFFECTS ===
  ctx.fillStyle = "rgba(20,10,40,0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.54, size * 0.5, size * 0.14, 0, 0, TAU);
  ctx.fill();

  // Ground cracks
  ctx.strokeStyle = `rgba(100, 50, 180, ${darkPulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let c = 0; c < 6; c++) {
    const ca = (c / 6) * TAU + 0.2;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.52);
    let cx2 = x, cy2 = y + size * 0.52;
    for (let seg = 0; seg < 3; seg++) {
      cx2 += Math.cos(ca + (seg - 1) * 0.3) * size * 0.1;
      cy2 += size * 0.02;
      ctx.lineTo(cx2, cy2);
    }
    ctx.stroke();
  }

  // Dark energy particles
  for (let p = 0; p < 8; p++) {
    const pAngle = time * 1.2 + (p * TAU) / 8;
    const pDist = size * 0.5 + Math.sin(time * 2 + p) * size * 0.06;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.35;
    ctx.fillStyle = `rgba(120, 60, 200, ${0.3 + Math.sin(time * 4 + p) * 0.15})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.015, 0, TAU);
    ctx.fill();
  }

  // Dust on footfall
  const lDown2 = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rDown2 = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  for (const [side, footVal] of [[-1, lDown2], [1, rDown2]] as const) {
    if (footVal > 0.8) {
      ctx.fillStyle = `rgba(80, 70, 100, ${(footVal - 0.8) * 2.5})`;
      for (let d = 0; d < 4; d++) {
        ctx.beginPath();
        ctx.arc(x + side * size * 0.14 + (d - 1.5) * size * 0.05, y + size * 0.56, size * 0.018 * (footVal - 0.8) * 5, 0, TAU);
        ctx.fill();
      }
    }
  }

  // === TORN CAPE ===
  const capeGrad = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  capeGrad.addColorStop(0, "#050510");
  capeGrad.addColorStop(0.3, blackMid);
  capeGrad.addColorStop(0.5, blackLight);
  capeGrad.addColorStop(0.7, blackMid);
  capeGrad.addColorStop(1, "#050510");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.32 + stance);
  ctx.quadraticCurveTo(x - size * 0.48 - capeWave * size, y + size * 0.2, x - size * 0.4, y + size * 0.6);
  for (let i = 0; i < 8; i++) {
    const jagX = x - size * 0.4 + i * size * 0.1;
    const jagY = y + size * 0.6 + (i % 2) * size * 0.07 + Math.sin(time * 5 + i * 1.1) * size * 0.035;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(x + size * 0.48 + capeWave * size, y + size * 0.2, x + size * 0.28, y - size * 0.32 + stance);
  ctx.closePath();
  ctx.fill();
  // Gold trim on cape edge
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.59);
  for (let i = 0; i < 8; i++) {
    const jagX = x - size * 0.4 + i * size * 0.1;
    const jagY = y + size * 0.6 + (i % 2) * size * 0.07 + Math.sin(time * 5 + i * 1.1) * size * 0.035;
    ctx.lineTo(jagX, jagY);
  }
  ctx.stroke();

  // === ARTICULATED HEAVY ARMORED LEGS ===
  const thighLen = size * 0.19;
  const shinLen = size * 0.17;

  for (const [side, thAngle, knBend] of [[-1, leftThighAngle, leftKneeBend], [1, rightThighAngle, rightKneeBend]] as const) {
    ctx.save();
    ctx.translate(x + side * size * 0.14, y + size * 0.22 + stance);
    ctx.rotate(thAngle);
    const thG = ctx.createLinearGradient(0, 0, 0, thighLen);
    thG.addColorStop(0, blackLight);
    thG.addColorStop(0.5, blackMid);
    thG.addColorStop(1, blackDark);
    ctx.fillStyle = thG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.06, 0);
    ctx.lineTo(-size * 0.055, thighLen);
    ctx.lineTo(size * 0.055, thighLen);
    ctx.lineTo(size * 0.06, 0);
    ctx.closePath();
    ctx.fill();
    // Gold trim on thigh
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.058, size * 0.01);
    ctx.lineTo(-size * 0.053, thighLen - size * 0.01);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.058, size * 0.01);
    ctx.lineTo(size * 0.053, thighLen - size * 0.01);
    ctx.stroke();
    // Knee guard with gold
    ctx.fillStyle = blackMid;
    ctx.beginPath();
    ctx.arc(0, thighLen, size * 0.045, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = goldMid;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(0, thighLen, size * 0.045, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = goldLight;
    ctx.beginPath();
    ctx.arc(0, thighLen, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.translate(0, thighLen);
    ctx.rotate(knBend);
    const snG = ctx.createLinearGradient(0, 0, 0, shinLen);
    snG.addColorStop(0, blackMid);
    snG.addColorStop(0.4, blackLight);
    snG.addColorStop(1, blackDark);
    ctx.fillStyle = snG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.052, 0);
    ctx.lineTo(-size * 0.044, shinLen);
    ctx.lineTo(size * 0.044, shinLen);
    ctx.lineTo(size * 0.052, 0);
    ctx.closePath();
    ctx.fill();
    // Gold band on greave
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.048, shinLen * 0.35);
    ctx.lineTo(size * 0.048, shinLen * 0.35);
    ctx.stroke();
    // Heavy boot
    ctx.fillStyle = blackDark;
    ctx.beginPath();
    ctx.ellipse(side * size * 0.01, shinLen + size * 0.012, size * 0.065, size * 0.032, side * 0.1, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    ctx.restore();
  }

  // === ORNATE BLACK + GOLD TORSO ARMOR (custom path) ===
  const armorGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  armorGrad.addColorStop(0, blackDark);
  armorGrad.addColorStop(0.2, blackMid);
  armorGrad.addColorStop(0.35, blackLight);
  armorGrad.addColorStop(0.5, "#3a3a4a");
  armorGrad.addColorStop(0.65, blackLight);
  armorGrad.addColorStop(0.8, blackMid);
  armorGrad.addColorStop(1, blackDark);
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y + size * 0.22 - bodyBob);
  ctx.lineTo(x - size * 0.3, y - size * 0.12 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.42 - bodyBob, x + size * 0.3, y - size * 0.12 - bodyBob);
  ctx.lineTo(x + size * 0.26, y + size * 0.22 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Gold trim lines
  ctx.strokeStyle = goldMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.36 - bodyBob);
  ctx.lineTo(x, y + size * 0.18 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.06 - bodyBob);
  ctx.lineTo(x + size * 0.24, y - size * 0.06 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.06 - bodyBob);
  ctx.lineTo(x + size * 0.22, y + size * 0.06 - bodyBob);
  ctx.stroke();

  // Skull motif on chest
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18 - bodyBob, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.fillStyle = blackDark;
  ctx.beginPath();
  ctx.arc(x - size * 0.015, y - size * 0.19 - bodyBob, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.015, y - size * 0.19 - bodyBob, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17 - bodyBob);
  ctx.lineTo(x - size * 0.005, y - size * 0.155 - bodyBob);
  ctx.lineTo(x + size * 0.005, y - size * 0.155 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Trophy chain with mini skulls
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.08 - bodyBob);
  for (let ch = 0; ch < 5; ch++) {
    const chx = x - size * 0.2 + ch * size * 0.1;
    const chy = y - size * 0.05 + Math.sin(time * 2 + ch) * size * 0.01 - bodyBob;
    ctx.lineTo(chx, chy);
  }
  ctx.stroke();
  // Mini skulls
  ctx.fillStyle = "#c8c0a8";
  for (let sk = 0; sk < 3; sk++) {
    const skx = x - size * 0.1 + sk * size * 0.1;
    const sky = y - size * 0.04 + Math.sin(time * 2 + sk + 0.5) * size * 0.01 - bodyBob;
    ctx.beginPath();
    ctx.arc(skx, sky, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1a1010";
    ctx.beginPath();
    ctx.arc(skx - size * 0.004, sky - size * 0.003, size * 0.003, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(skx + size * 0.004, sky - size * 0.003, size * 0.003, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c8c0a8";
  }

  // === ELABORATE SPIKED PAULDRONS ===
  for (const side of [-1, 1]) {
    const px = x + side * size * 0.32;
    const py = y - size * 0.26 - bodyBob;
    // Base pauldron
    const pGrad = ctx.createLinearGradient(px - size * 0.1, py, px + size * 0.1, py);
    pGrad.addColorStop(0, blackDark);
    pGrad.addColorStop(0.5, blackLight);
    pGrad.addColorStop(1, blackDark);
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.13, size * 0.08, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = goldMid;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    // Spikes
    ctx.fillStyle = blackDark;
    for (let sp = 0; sp < 2; sp++) {
      ctx.beginPath();
      ctx.moveTo(px + side * (size * 0.08 + sp * size * 0.06), py - size * 0.02);
      ctx.lineTo(px + side * (size * 0.14 + sp * size * 0.07), py - size * 0.15 - sp * size * 0.04);
      ctx.lineTo(px + side * (size * 0.06 + sp * size * 0.06), py);
      ctx.fill();
    }
    // Gem
    setShadowBlur(ctx, 5 * zoom, `rgba(120, 60, 200, ${darkPulse})`);
    ctx.fillStyle = `rgba(140, 80, 220, ${darkPulse})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // === ARMS ===
  drawAnimatedArm(ctx, x - size * 0.3, y - size * 0.24 - bodyBob, size, time, zoom, -1, {
    upperLen: 0.2, foreLen: 0.17, width: 0.06, swingSpeed: 2.5, swingAmt: 0.15,
    color: blackLight, colorDark: blackDark, handColor: blackMid, handRadius: 0.038,
  });

  // === FLAMING MAGICAL SWORD (right) ===
  ctx.save();
  ctx.translate(x + size * 0.3, y - size * 0.24 - bodyBob);
  const swordSwing2 = isAttacking ? Math.sin(time * 14) * 1.1 : 0.3 + armSwingAngle;
  ctx.rotate(swordSwing2);
  // Gauntlet
  ctx.fillStyle = blackMid;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.055, size * 0.1, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = blackDark;
  ctx.beginPath();
  ctx.arc(0, size * 0.17, size * 0.035, 0, TAU);
  ctx.fill();
  // Sword blade (dark steel)
  const sbGrad = ctx.createLinearGradient(-size * 0.025, size * 0.24, size * 0.025, size * 0.24);
  sbGrad.addColorStop(0, "#3a3a50");
  sbGrad.addColorStop(0.3, "#5a5a78");
  sbGrad.addColorStop(0.5, "#7a7a98");
  sbGrad.addColorStop(0.7, "#5a5a78");
  sbGrad.addColorStop(1, "#3a3a50");
  ctx.fillStyle = sbGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.24);
  ctx.lineTo(-size * 0.022, size * 0.58);
  ctx.lineTo(0, size * 0.66);
  ctx.lineTo(size * 0.022, size * 0.58);
  ctx.lineTo(size * 0.025, size * 0.24);
  ctx.closePath();
  ctx.fill();
  // Magic flame effect on blade
  setShadowBlur(ctx, 8 * zoom, `rgba(100, 60, 220, ${flamePulse})`);
  for (let f = 0; f < 8; f++) {
    const fY = size * 0.26 + f * size * 0.05;
    const fPhase = (time * 4 + f * 0.4) % 1;
    const fH = size * 0.04 * (1 + Math.sin(time * 8 + f) * 0.4);
    const fW = size * 0.015 + Math.sin(time * 6 + f) * size * 0.008;
    const fAlpha = flamePulse * (0.5 - Math.abs(f - 3.5) * 0.05);
    ctx.fillStyle = `rgba(120, 80, 240, ${fAlpha})`;
    ctx.beginPath();
    ctx.ellipse(Math.sin(time * 5 + f) * size * 0.01, fY, fW, fH, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(180, 140, 255, ${fAlpha * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(Math.sin(time * 5 + f) * size * 0.005, fY, fW * 0.4, fH * 0.5, 0, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);
  // Ornate crossguard
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.065, size * 0.22);
  ctx.lineTo(-size * 0.075, size * 0.245);
  ctx.lineTo(size * 0.075, size * 0.245);
  ctx.lineTo(size * 0.065, size * 0.22);
  ctx.closePath();
  ctx.fill();
  // Crossguard skulls
  ctx.fillStyle = "#c8c0a8";
  ctx.beginPath();
  ctx.arc(-size * 0.06, size * 0.232, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.06, size * 0.232, size * 0.01, 0, TAU);
  ctx.fill();
  // Grip
  ctx.fillStyle = "#1a1018";
  ctx.fillRect(-size * 0.014, size * 0.16, size * 0.028, size * 0.06);
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let w = 0; w < 4; w++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.015, size * 0.165 + w * size * 0.013);
    ctx.lineTo(size * 0.015, size * 0.17 + w * size * 0.013);
    ctx.stroke();
  }
  // Pommel with gem
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.arc(0, size * 0.15, size * 0.018, 0, TAU);
  ctx.fill();
  setShadowBlur(ctx, 4 * zoom, "rgba(120, 60, 220, 0.6)");
  ctx.fillStyle = `rgba(140, 80, 240, ${darkPulse})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.15, size * 0.008, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  // === CROWN-HELM WITH HORNS ===
  const helmGrad = ctx.createLinearGradient(x - size * 0.2, headY, x + size * 0.2, headY);
  helmGrad.addColorStop(0, blackDark);
  helmGrad.addColorStop(0.3, blackMid);
  helmGrad.addColorStop(0.5, blackLight);
  helmGrad.addColorStop(0.7, blackMid);
  helmGrad.addColorStop(1, blackDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.19, 0, TAU);
  ctx.fill();

  // Faceplate
  ctx.fillStyle = blackDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, headY - size * 0.04);
  ctx.lineTo(x - size * 0.16, headY + size * 0.12);
  ctx.lineTo(x, headY + size * 0.16);
  ctx.lineTo(x + size * 0.16, headY + size * 0.12);
  ctx.lineTo(x + size * 0.16, headY - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // T-visor slit
  ctx.fillStyle = "#050508";
  ctx.fillRect(x - size * 0.12, headY - size * 0.02, size * 0.24, size * 0.035);
  ctx.fillRect(x - size * 0.015, headY - size * 0.02, size * 0.03, size * 0.1);

  // Glowing eyes through visor
  setShadowBlur(ctx, 10 * zoom, `rgba(120, 60, 220, ${darkPulse + 0.3})`);
  ctx.fillStyle = `rgba(140, 80, 240, ${darkPulse + 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, headY - size * 0.002, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.06, headY - size * 0.002, size * 0.022, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Gold crown band
  ctx.fillStyle = goldMid;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, headY - size * 0.08);
  ctx.lineTo(x - size * 0.17, headY - size * 0.14);
  ctx.lineTo(x - size * 0.1, headY - size * 0.1);
  ctx.lineTo(x - size * 0.05, headY - size * 0.15);
  ctx.lineTo(x, headY - size * 0.11);
  ctx.lineTo(x + size * 0.05, headY - size * 0.15);
  ctx.lineTo(x + size * 0.1, headY - size * 0.1);
  ctx.lineTo(x + size * 0.17, headY - size * 0.14);
  ctx.lineTo(x + size * 0.19, headY - size * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Crown jewels
  setShadowBlur(ctx, 4 * zoom, "rgba(200, 50, 200, 0.5)");
  ctx.fillStyle = "#e040e0";
  ctx.beginPath();
  ctx.arc(x - size * 0.05, headY - size * 0.13, size * 0.012, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#4080e0";
  ctx.beginPath();
  ctx.arc(x + size * 0.05, headY - size * 0.13, size * 0.012, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Horns
  ctx.fillStyle = blackDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, headY - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.22, headY - size * 0.35, x - size * 0.28, headY - size * 0.5);
  ctx.quadraticCurveTo(x - size * 0.2, headY - size * 0.35, x - size * 0.12, headY - size * 0.12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, headY - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.22, headY - size * 0.35, x + size * 0.28, headY - size * 0.5);
  ctx.quadraticCurveTo(x + size * 0.2, headY - size * 0.35, x + size * 0.12, headY - size * 0.12);
  ctx.fill();
  // Horn tips glow
  ctx.fillStyle = `rgba(140, 80, 220, ${darkPulse * 0.6})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.28, headY - size * 0.5, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.28, headY - size * 0.5, size * 0.008, 0, TAU);
  ctx.fill();

  // Helm edge
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.19, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();

  // === PULSING DARK ENERGY RINGS ===
  drawPulsingGlowRings(ctx, x, y - bodyBob, size, time, zoom, {
    color: `rgba(100, 50, 180, ${0.15 + (isAttacking ? attackIntensity * 0.15 : 0)})`,
    count: 4, speed: 1.2, lineWidth: 1.8,
  });

  // === ORBITING DARK SHARDS ===
  drawShiftingSegments(ctx, x, y - bodyBob, size, time, zoom, {
    color: "rgba(120, 60, 200, 0.35)",
    colorAlt: "rgba(80, 30, 160, 0.25)",
    count: 5, orbitRadius: 0.55, segmentSize: 0.02,
    orbitSpeed: 0.5, bobSpeed: 2, bobAmt: 0.04, shape: "shard", rotateWithOrbit: true,
  });
}

