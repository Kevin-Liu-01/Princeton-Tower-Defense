// Princeton Tower Defense - Fantasy Creature Enemy Sprite Functions
// 20 fantasy-themed enemies across Grassland, Swamp, Desert, Winter, and Volcanic regions.
// Layered construction with particle systems, ambient effects, and detailed canvas rendering.

import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import { drawRadialAura } from "./helpers";

const TAU = Math.PI * 2;

// ============================================================================
// GRASSLAND REGION
// ============================================================================

// 1. DIRE BEAR — Massive brown bear with thick layered fur and powerful build
export function drawDireBearEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.5;
  const breath = 1 + Math.sin(time * 2.5) * 0.025;
  const ribHeave = Math.sin(time * 2.5) * size * 0.008;
  const walkPhase = time * 3;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.02;
  const headBob = Math.sin(walkPhase * 2) * size * 0.01;
  const rearUp = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.35 : 0;
  const swipeAngle = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.6 : 0;
  const stompImpact = isAttacking ? Math.max(0, Math.sin(attackPhase * Math.PI * 2 - 1)) : 0;

  // Heavy isometric ground shadow (two-layer soft shadow)
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.46, size * 0.42, size * 0.13 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.07)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.46, size * 0.56, size * 0.18 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Ground crack effects on stomp attack
  if (stompImpact > 0.1) {
    const crackA = stompImpact * 0.5;
    ctx.strokeStyle = `rgba(80,60,30,${crackA})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let cr = 0; cr < 8; cr++) {
      const crAng = cr * (TAU / 8) + 0.2;
      const crLen = stompImpact * size * 0.3 + Math.sin(cr * 2.3) * size * 0.05;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(crAng) * size * 0.04, y + size * 0.45 + Math.sin(crAng) * size * 0.01);
      ctx.lineTo(x + Math.cos(crAng) * crLen, y + size * 0.45 + Math.sin(crAng) * crLen * ISO_Y_RATIO * 0.3);
      ctx.stroke();
      if (cr % 2 === 0) {
        const subAng = crAng + 0.4;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(crAng) * crLen * 0.6, y + size * 0.45 + Math.sin(crAng) * crLen * 0.6 * ISO_Y_RATIO * 0.3);
        ctx.lineTo(x + Math.cos(subAng) * crLen * 0.4, y + size * 0.45 + Math.sin(subAng) * crLen * 0.4 * ISO_Y_RATIO * 0.3);
        ctx.stroke();
      }
    }
    for (let db = 0; db < 8; db++) {
      const dbAng = db * (TAU / 8);
      const dbD = stompImpact * size * 0.2;
      ctx.fillStyle = `rgba(120,100,70,${crackA * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(dbAng) * dbD,
        y + size * 0.43 - stompImpact * size * 0.06 * Math.sin(db * 1.7) + Math.sin(dbAng) * dbD * ISO_Y_RATIO * 0.3,
        size * 0.01, 0, TAU,
      );
      ctx.fill();
    }
  }

  // Dust kick-up particles from footfalls
  const leftFoot = Math.max(0, -Math.sin(walkPhase));
  const rightFoot = Math.max(0, -Math.sin(walkPhase + Math.PI));
  for (const [intensity, fx] of [[leftFoot, x - size * 0.18], [rightFoot, x + size * 0.18]] as [number, number][]) {
    if (intensity > 0.6) {
      const dust = (intensity - 0.6) * 2.5;
      for (let d = 0; d < 8; d++) {
        const dx = fx + (d - 3.5) * size * 0.03;
        const dy = y + size * 0.44 - d * size * 0.006 * dust;
        ctx.fillStyle = `rgba(140,120,90,${dust * 0.22 * (1 - d * 0.1)})`;
        ctx.beginPath();
        ctx.ellipse(dx, dy, size * 0.016 * dust, size * 0.016 * dust * ISO_Y_RATIO, 0, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Back legs with muscle definition
  const legStride = Math.sin(walkPhase) * size * 0.08;
  for (const side of [-1, 1]) {
    const lx = x + side * size * 0.15 - size * 0.02;
    const legOff = rearUp * size * 0.15;
    const thighG = ctx.createLinearGradient(lx - size * 0.06, y + size * 0.15, lx + size * 0.06, y + size * 0.32);
    thighG.addColorStop(0, bodyColorLight);
    thighG.addColorStop(0.5, bodyColor);
    thighG.addColorStop(1, bodyColorDark);
    ctx.fillStyle = thighG;
    ctx.beginPath();
    ctx.ellipse(lx - legStride * side * 0.5, y + size * 0.25 - bodyBob + legOff * 0.5, size * 0.1, size * 0.19, side * 0.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.ellipse(lx - legStride * side * 0.5 + side * size * 0.02, y + size * 0.21 - bodyBob + legOff * 0.5, size * 0.04, size * 0.08, side * 0.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.8 * zoom;
    for (let ft = 0; ft < 4; ft++) {
      const ftx = lx - legStride * side * 0.5 + (ft - 1.5) * size * 0.03;
      const fty = y + size * 0.22 - bodyBob + legOff * 0.5;
      ctx.beginPath();
      ctx.moveTo(ftx, fty);
      ctx.lineTo(ftx + Math.sin(ft * 1.2 + time) * size * 0.008, fty + size * 0.04);
      ctx.stroke();
    }
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(lx - legStride * side * 0.5, y + size * 0.37 - bodyBob + legOff, size * 0.07, size * 0.08, 0, 0, TAU);
    ctx.fill();
    const pawG = ctx.createRadialGradient(
      lx - legStride * side * 0.5, y + size * 0.42 - bodyBob + legOff, 0,
      lx - legStride * side * 0.5, y + size * 0.42 - bodyBob + legOff, size * 0.08,
    );
    pawG.addColorStop(0, "#4d3b2a");
    pawG.addColorStop(0.7, "#3d2b1a");
    pawG.addColorStop(1, "#2d1b0a");
    ctx.fillStyle = pawG;
    ctx.beginPath();
    ctx.ellipse(lx - legStride * side * 0.5, y + size * 0.42 - bodyBob + legOff, size * 0.08, size * 0.04, 0, 0, TAU);
    ctx.fill();
    for (let tp = -1; tp <= 1; tp++) {
      ctx.fillStyle = "#2d1b0a";
      ctx.beginPath();
      ctx.ellipse(lx - legStride * side * 0.5 + tp * size * 0.022, y + size * 0.44 - bodyBob + legOff, size * 0.013, size * 0.009, 0, 0, TAU);
      ctx.fill();
    }
    for (let c = -2; c <= 2; c++) {
      const clG = ctx.createLinearGradient(
        lx - legStride * side * 0.5 + c * size * 0.017, y + size * 0.44 - bodyBob + legOff,
        lx - legStride * side * 0.5 + c * size * 0.017, y + size * 0.475 - bodyBob + legOff,
      );
      clG.addColorStop(0, "#f5f0e0");
      clG.addColorStop(1, "#b8a878");
      ctx.fillStyle = clG;
      ctx.beginPath();
      ctx.moveTo(lx - legStride * side * 0.5 + c * size * 0.017 - size * 0.005, y + size * 0.44 - bodyBob + legOff);
      ctx.lineTo(lx - legStride * side * 0.5 + c * size * 0.017, y + size * 0.475 - bodyBob + legOff);
      ctx.lineTo(lx - legStride * side * 0.5 + c * size * 0.017 + size * 0.005, y + size * 0.44 - bodyBob + legOff);
      ctx.fill();
    }
  }

  // Main body with rich gradient
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.05, 0, x, y + size * 0.05, size * 0.45);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.6, bodyColorDark);
  bodyGrad.addColorStop(0.85, "#2a1a0a");
  bodyGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.3 - bodyBob);
  ctx.quadraticCurveTo(x - size * 0.48 * breath, y - size * 0.05 - rearUp * size * 0.3, x - size * 0.3, y - size * 0.3 - rearUp * size * 0.4);
  ctx.quadraticCurveTo(x, y - size * 0.42 * breath - rearUp * size * 0.45, x + size * 0.3, y - size * 0.3 - rearUp * size * 0.4);
  ctx.quadraticCurveTo(x + size * 0.48 * breath, y - size * 0.05 - rearUp * size * 0.3, x + size * 0.4, y + size * 0.3 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Undercoat fur layer (fine base texture)
  ctx.strokeStyle = "rgba(80,50,20,0.15)";
  ctx.lineWidth = 0.6 * zoom;
  for (let uf = 0; uf < 30; uf++) {
    const ufx = x - size * 0.36 + uf * size * 0.025;
    const ufy = y - size * 0.05 + Math.sin(uf * 1.8) * size * 0.12 - rearUp * size * 0.25;
    ctx.beginPath();
    ctx.moveTo(ufx, ufy);
    ctx.lineTo(ufx + Math.sin(uf * 0.6) * size * 0.008, ufy + size * 0.03);
    ctx.stroke();
  }

  // Guard hair fur layer (coarser visible strands)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.0 * zoom;
  for (let f = 0; f < 24; f++) {
    const fx2 = x - size * 0.35 + f * size * 0.03;
    const fy = y - size * 0.1 + Math.sin(f * 1.3) * size * 0.1 - rearUp * size * 0.3;
    const furLen = size * 0.07 + Math.sin(time * 2 + f) * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(fx2, fy);
    ctx.quadraticCurveTo(fx2 + Math.sin(f * 0.8 + time * 0.5) * size * 0.012, fy + furLen * 0.5, fx2 + Math.sin(f * 0.8) * size * 0.018, fy + furLen);
    ctx.stroke();
  }

  // Mane fur (thicker around neck/shoulders)
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1.4 * zoom;
  for (let mf = 0; mf < 10; mf++) {
    const mfAngle = -0.8 + mf * 0.16;
    const mfx = x - size * 0.05 + Math.cos(mfAngle) * size * 0.22;
    const mfy = y - size * 0.22 + Math.sin(mfAngle) * size * 0.08 - rearUp * size * 0.35;
    const mfLen = size * 0.08 + Math.sin(time * 1.8 + mf) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(mfx, mfy);
    ctx.lineTo(mfx + Math.sin(mfAngle + time * 0.3) * size * 0.015, mfy + mfLen);
    ctx.stroke();
  }

  // Shoulder hump with muscle ripples
  const shoulderGrad = ctx.createRadialGradient(x - size * 0.05, y - size * 0.25, 0, x, y - size * 0.2, size * 0.22);
  shoulderGrad.addColorStop(0, bodyColorLight);
  shoulderGrad.addColorStop(0.5, bodyColor);
  shoulderGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = shoulderGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.25 - rearUp * size * 0.35, size * 0.24, size * 0.14, -0.2, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1.2 * zoom;
  for (let mr = 0; mr < 3; mr++) {
    const mrx = x - size * 0.14 + mr * size * 0.07;
    const mry = y - size * 0.28 - rearUp * size * 0.35;
    ctx.beginPath();
    ctx.arc(mrx, mry, size * 0.05, -0.5, 1.2);
    ctx.stroke();
  }

  // Heaving ribcage animation
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 0.8 * zoom;
  for (let rib = 0; rib < 4; rib++) {
    const ribX = x + size * 0.05 + rib * size * 0.05;
    const ribY = y - size * 0.05 - rearUp * size * 0.2 + ribHeave;
    ctx.beginPath();
    ctx.arc(ribX, ribY, size * 0.08, -0.6, 0.8);
    ctx.stroke();
  }

  // Battle scars — three parallel claw marks on flank
  ctx.strokeStyle = "rgba(180,80,80,0.35)";
  ctx.lineWidth = 1.5 * zoom;
  for (let sc = 0; sc < 3; sc++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18 + sc * size * 0.03, y - size * 0.15 - rearUp * size * 0.3);
    ctx.quadraticCurveTo(x - size * 0.12 + sc * size * 0.03, y - size * 0.05 - rearUp * size * 0.2, x - size * 0.16 + sc * size * 0.03, y + size * 0.05 - rearUp * size * 0.1);
    ctx.stroke();
  }
  // Older faded shoulder scar with stitch marks
  ctx.strokeStyle = "rgba(160,90,90,0.25)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.2 - rearUp * size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.28 - rearUp * size * 0.35, x + size * 0.12, y - size * 0.22 - rearUp * size * 0.32);
  ctx.stroke();
  ctx.strokeStyle = "rgba(120,70,70,0.15)";
  ctx.lineWidth = 0.6 * zoom;
  for (let st = 0; st < 4; st++) {
    const stFrac = st / 4;
    const stx = x - size * 0.15 + stFrac * size * 0.27;
    const sty = y - size * 0.2 - rearUp * size * 0.3 - Math.sin(stFrac * Math.PI) * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(stx - size * 0.01, sty - size * 0.015);
    ctx.lineTo(stx + size * 0.01, sty + size * 0.015);
    ctx.stroke();
  }

  // Front legs with full articulation
  for (const side of [-1, 1]) {
    const lx = x + side * size * 0.22;
    const legAngle = side * swipeAngle;
    ctx.save();
    ctx.translate(lx, y + size * 0.05 - rearUp * size * 0.2);
    ctx.rotate(legAngle);
    const shG = ctx.createRadialGradient(0, -size * 0.02, 0, 0, -size * 0.02, size * 0.06);
    shG.addColorStop(0, bodyColorLight);
    shG.addColorStop(1, bodyColor);
    ctx.fillStyle = shG;
    ctx.beginPath();
    ctx.arc(0, -size * 0.02, size * 0.055, 0, TAU);
    ctx.fill();
    const uaG = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, size * 0.16);
    uaG.addColorStop(0, bodyColor);
    uaG.addColorStop(0.4, bodyColorLight);
    uaG.addColorStop(0.7, bodyColor);
    uaG.addColorStop(1, bodyColorDark);
    ctx.fillStyle = uaG;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.08, size * 0.085, size * 0.16, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(0, size * 0.18, size * 0.04, 0, TAU);
    ctx.fill();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.26, size * 0.065, size * 0.1, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.7 * zoom;
    for (let lf = 0; lf < 5; lf++) {
      ctx.beginPath();
      ctx.moveTo((lf - 2) * size * 0.02, size * 0.15);
      ctx.lineTo((lf - 2) * size * 0.02 + Math.sin(lf + time) * size * 0.006, size * 0.15 + size * 0.03);
      ctx.stroke();
    }
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(0, size * 0.33, size * 0.035, 0, TAU);
    ctx.fill();
    const fpG = ctx.createRadialGradient(0, size * 0.36, 0, 0, size * 0.36, size * 0.09);
    fpG.addColorStop(0, "#4d3b2a");
    fpG.addColorStop(0.6, "#3d2b1a");
    fpG.addColorStop(1, "#2d1b0a");
    ctx.fillStyle = fpG;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.36 + rearUp * size * 0.1, size * 0.09, size * 0.045, 0, 0, TAU);
    ctx.fill();
    for (let tp = -2; tp <= 2; tp++) {
      ctx.fillStyle = "#2d1b0a";
      ctx.beginPath();
      ctx.ellipse(tp * size * 0.02, size * 0.38 + rearUp * size * 0.1, size * 0.012, size * 0.008, 0, 0, TAU);
      ctx.fill();
    }
    for (let c = -2; c <= 2; c++) {
      const clG = ctx.createLinearGradient(c * size * 0.02, size * 0.38 + rearUp * size * 0.1, c * size * 0.02, size * 0.42 + rearUp * size * 0.1);
      clG.addColorStop(0, "#f5f0e0");
      clG.addColorStop(0.5, "#d8c8a0");
      clG.addColorStop(1, "#a08860");
      ctx.fillStyle = clG;
      ctx.beginPath();
      ctx.moveTo(c * size * 0.02 - size * 0.006, size * 0.38 + rearUp * size * 0.1);
      ctx.lineTo(c * size * 0.02, size * 0.42 + rearUp * size * 0.1);
      ctx.lineTo(c * size * 0.02 + size * 0.006, size * 0.38 + rearUp * size * 0.1);
      ctx.fill();
    }
    ctx.restore();
  }

  // Head with fur ruff
  const headX = x;
  const headY = y - size * 0.35 + headBob - rearUp * size * 0.45;
  ctx.fillStyle = bodyColor;
  for (let rf = 0; rf < 14; rf++) {
    const rfAngle = -Math.PI * 0.7 + rf * (Math.PI * 1.4 / 14);
    const rfDist = size * 0.17 + Math.sin(rf * 1.5) * size * 0.015;
    ctx.beginPath();
    ctx.ellipse(headX + Math.cos(rfAngle) * rfDist, headY + Math.sin(rfAngle) * rfDist * 0.8, size * 0.025, size * 0.045, rfAngle, 0, TAU);
    ctx.fill();
  }
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.17);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(0.8, bodyColorDark);
  headGrad.addColorStop(1, "#2a1a0a");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.16, size * 0.14, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.7 * zoom;
  for (let hf = 0; hf < 8; hf++) {
    const hfAngle = -Math.PI * 0.5 + hf * 0.3;
    const hfx = headX + Math.cos(hfAngle) * size * 0.14;
    const hfy = headY + Math.sin(hfAngle) * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(hfx, hfy);
    ctx.lineTo(hfx + Math.cos(hfAngle) * size * 0.03, hfy + Math.sin(hfAngle) * size * 0.03);
    ctx.stroke();
  }

  // Snout with wrinkle detail
  const snoutG = ctx.createRadialGradient(headX, headY + size * 0.07, 0, headX, headY + size * 0.08, size * 0.08);
  snoutG.addColorStop(0, bodyColorLight);
  snoutG.addColorStop(0.6, bodyColor);
  snoutG.addColorStop(1, bodyColorDark);
  ctx.fillStyle = snoutG;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.08, size * 0.1, size * 0.065, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.6 * zoom;
  for (let sw = 0; sw < 4; sw++) {
    const swy = headY + size * 0.04 + sw * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.06, swy);
    ctx.quadraticCurveTo(headX, swy - size * 0.004, headX + size * 0.06, swy);
    ctx.stroke();
  }

  // Nose (large, wet-looking)
  const noseG = ctx.createRadialGradient(headX, headY + size * 0.055, 0, headX, headY + size * 0.055, size * 0.03);
  noseG.addColorStop(0, "#2a1500");
  noseG.addColorStop(0.7, "#1a0a00");
  noseG.addColorStop(1, "#0a0000");
  ctx.fillStyle = noseG;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.055, size * 0.035, size * 0.025, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.008, headY + size * 0.05, size * 0.01, size * 0.007, -0.3, 0, TAU);
  ctx.fill();
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.012, headY + size * 0.06, size * 0.008, size * 0.006, 0, 0, TAU);
    ctx.fill();
  }

  // Ears with inner detail
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.12, headY - size * 0.1, size * 0.045, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#6b4a3a";
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.12, headY - size * 0.1, size * 0.028, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.12, headY - size * 0.12);
    ctx.lineTo(headX + side * size * 0.12, headY - size * 0.14);
    ctx.stroke();
  }

  // Glowing angry eyes with layered iris
  setShadowBlur(ctx, 8 * zoom, "#ff6600");
  for (const side of [-1, 1]) {
    const eyeX = headX + side * size * 0.06;
    const eyeY = headY - size * 0.02;
    ctx.fillStyle = "#ffe8a0";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.025, size * 0.019, 0, 0, TAU);
    ctx.fill();
    const irisG = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.016);
    irisG.addColorStop(0, "#ffee00");
    irisG.addColorStop(0.4, "#ffaa00");
    irisG.addColorStop(0.8, "#ff6600");
    irisG.addColorStop(1, "#cc3300");
    ctx.fillStyle = irisG;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.016, size * 0.014, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.005, size * 0.012, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(eyeX - size * 0.006, eyeY - size * 0.005, size * 0.004, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Angry brow ridge
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY - size * 0.03);
  ctx.quadraticCurveTo(headX, headY - size * 0.055, headX + size * 0.1, headY - size * 0.03);
  ctx.quadraticCurveTo(headX, headY - size * 0.035, headX - size * 0.1, headY - size * 0.03);
  ctx.fill();

  // Mouth / snarl with gum line
  ctx.fillStyle = "#4a0000";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.1, size * 0.06, size * 0.015 + (isAttacking ? size * 0.025 * attackPhase : 0), 0, 0, TAU);
  ctx.fill();
  if (isAttacking) {
    ctx.fillStyle = "#6a1020";
    ctx.beginPath();
    ctx.ellipse(headX, headY + size * 0.095, size * 0.055, size * 0.008, 0, 0, Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = "#f5f0e0";
  for (let t = -3; t <= 3; t++) {
    const toothH = (Math.abs(t) < 2 ? size * 0.018 : size * 0.012) * (isAttacking ? 1 + attackPhase * 0.5 : 1);
    ctx.beginPath();
    ctx.moveTo(headX + t * size * 0.015 - size * 0.004, headY + size * 0.085);
    ctx.lineTo(headX + t * size * 0.015, headY + size * 0.085 + toothH);
    ctx.lineTo(headX + t * size * 0.015 + size * 0.004, headY + size * 0.085);
    ctx.fill();
  }
  if (isAttacking) {
    ctx.fillStyle = "#f0e8d0";
    for (let lf = -1; lf <= 1; lf += 2) {
      ctx.beginPath();
      ctx.moveTo(headX + lf * size * 0.025 - size * 0.004, headY + size * 0.12);
      ctx.lineTo(headX + lf * size * 0.025, headY + size * 0.12 - size * 0.015);
      ctx.lineTo(headX + lf * size * 0.025 + size * 0.004, headY + size * 0.12);
      ctx.fill();
    }
  }

  // Drool strands with droplet
  const droolLen = size * 0.035 + Math.sin(time * 2) * size * 0.015;
  ctx.strokeStyle = "rgba(200,210,190,0.25)";
  ctx.lineWidth = 0.8 * zoom;
  for (let dr = 0; dr < 2; dr++) {
    const drx = headX + (dr - 0.5) * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(drx, headY + size * 0.11);
    ctx.quadraticCurveTo(drx + Math.sin(time * 3 + dr) * size * 0.008, headY + size * 0.11 + droolLen * 0.5, drx + Math.sin(time * 2.5 + dr) * size * 0.005, headY + size * 0.11 + droolLen);
    ctx.stroke();
  }
  const dripPhase = (time * 1.5) % 1;
  if (dripPhase < 0.6) {
    ctx.fillStyle = `rgba(200,210,190,${(1 - dripPhase / 0.6) * 0.2})`;
    ctx.beginPath();
    ctx.arc(headX, headY + size * 0.11 + droolLen + dripPhase * size * 0.06, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // Attack swipe arc effect with claw trails
  if (isAttacking && attackPhase > 0.3) {
    const swipeAlpha = (attackPhase - 0.3) * 1.4;
    ctx.lineWidth = 3 * zoom;
    for (let s = 0; s < 4; s++) {
      const sa = -0.8 + s * 0.35 + swipeAngle;
      ctx.strokeStyle = `rgba(255,255,255,${swipeAlpha * 0.5 * (1 - s * 0.2)})`;
      ctx.beginPath();
      ctx.arc(x + size * 0.25, y - size * 0.1 - rearUp * size * 0.3, size * 0.2 + s * size * 0.05, sa - 0.3, sa + 0.3);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(255,200,150,${swipeAlpha * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let ct = 0; ct < 3; ct++) {
      const ctAngle = swipeAngle * 0.8 - 0.5 + ct * 0.25;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.28 + Math.cos(ctAngle) * size * 0.15, y - size * 0.15 - rearUp * size * 0.3 + Math.sin(ctAngle) * size * 0.15);
      ctx.lineTo(x + size * 0.28 + Math.cos(ctAngle) * size * 0.35, y - size * 0.15 - rearUp * size * 0.3 + Math.sin(ctAngle) * size * 0.35);
      ctx.stroke();
    }
  }
}

// 2. ANCIENT ENT — Living tree with gnarled bark, glowing heartwood, and creeping roots
export function drawAncientEntEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.7;
  const sway = Math.sin(time * 1.2) * size * 0.015;
  const breathScale = 1 + Math.sin(time * 1.5) * 0.015;
  const rootBurst = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.8 : 0;
  const sapPulse = 0.5 + Math.sin(time * 2) * 0.3;
  const seasonHue = (Math.sin(time * 0.1) + 1) * 0.5;

  // Isometric ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.45, size * 0.14 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Ground moss / mushroom growth around base
  for (let gm = 0; gm < 10; gm++) {
    const gmAngle = gm * (TAU / 10) + Math.sin(gm * 1.7) * 0.3;
    const gmDist = size * 0.28 + Math.sin(gm * 2.3) * size * 0.05;
    const gmx = x + Math.cos(gmAngle) * gmDist;
    const gmy = y + size * 0.42 + Math.sin(gmAngle) * gmDist * ISO_Y_RATIO * 0.3;
    ctx.fillStyle = `rgba(40,100,30,${0.25 + Math.sin(time + gm) * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(gmx, gmy, size * 0.025, size * 0.012, gmAngle, 0, TAU);
    ctx.fill();
  }
  // Tiny mushroom colony around base
  for (let ms = 0; ms < 6; ms++) {
    const msAngle = ms * (TAU / 6) + 0.5;
    const msDist = size * 0.25 + Math.sin(ms * 3.1) * size * 0.04;
    const msx = x + Math.cos(msAngle) * msDist;
    const msy = y + size * 0.43 + Math.sin(msAngle) * msDist * ISO_Y_RATIO * 0.3;
    ctx.fillStyle = "#d4a574";
    ctx.beginPath();
    ctx.moveTo(msx, msy);
    ctx.lineTo(msx - size * 0.005, msy + size * 0.018);
    ctx.lineTo(msx + size * 0.005, msy + size * 0.018);
    ctx.fill();
    ctx.fillStyle = ms % 2 === 0 ? "#c0392b" : "#e67e22";
    ctx.beginPath();
    ctx.ellipse(msx, msy, size * 0.012, size * 0.008, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let dot = 0; dot < 2; dot++) {
      ctx.beginPath();
      ctx.arc(msx + (dot - 0.5) * size * 0.006, msy - size * 0.003, size * 0.002, 0, TAU);
      ctx.fill();
    }
  }

  // Creeping root tendrils gripping the ground
  ctx.lineWidth = 3 * zoom;
  for (let r = 0; r < 10; r++) {
    const rootAngle = -Math.PI + r * (TAU / 10);
    const rootLen = size * (0.35 + rootBurst * 0.25) + Math.sin(time * 1.5 + r * 1.3) * size * 0.04;
    const rootWiggle = Math.sin(time * 2 + r * 0.7) * size * 0.03;
    const rootG = ctx.createLinearGradient(x, y + size * 0.35, x + Math.cos(rootAngle) * rootLen, y + size * 0.45);
    rootG.addColorStop(0, bodyColorDark);
    rootG.addColorStop(0.5, bodyColor);
    rootG.addColorStop(1, "#3a2510");
    ctx.strokeStyle = rootG;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.35);
    ctx.quadraticCurveTo(
      x + Math.cos(rootAngle) * rootLen * 0.5 + rootWiggle,
      y + size * 0.42 + Math.sin(rootAngle) * size * 0.05,
      x + Math.cos(rootAngle) * rootLen,
      y + size * 0.45 + Math.sin(rootAngle + time) * size * 0.02,
    );
    ctx.stroke();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(x + Math.cos(rootAngle) * rootLen, y + size * 0.45 + Math.sin(rootAngle + time) * size * 0.02, size * 0.02, 0, TAU);
    ctx.fill();
    // Root grip fingers at tips
    for (let rg = -1; rg <= 1; rg++) {
      const tipX = x + Math.cos(rootAngle) * rootLen;
      const tipY = y + size * 0.45 + Math.sin(rootAngle + time) * size * 0.02;
      ctx.strokeStyle = "#3a2510";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + Math.cos(rootAngle + rg * 0.4) * size * 0.03, tipY + size * 0.015);
      ctx.stroke();
    }
    ctx.lineWidth = 3 * zoom;
  }

  // Root burst attack particles
  if (isAttacking) {
    for (let p = 0; p < 10; p++) {
      const angle = p * (TAU / 10);
      const dist = rootBurst * size * 0.5;
      const pAlpha = rootBurst * 0.6;
      ctx.fillStyle = `rgba(101,67,33,${pAlpha})`;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(angle) * dist, y + size * 0.4 + Math.sin(angle) * dist * ISO_Y_RATIO, size * 0.025, size * 0.025 * ISO_Y_RATIO, 0, 0, TAU);
      ctx.fill();
    }
  }

  // Regeneration particles rising
  for (let rp = 0; rp < 8; rp++) {
    const rpPhase = (time * 0.6 + rp * 0.125) % 1;
    const rpx = x - size * 0.22 + rp * size * 0.065 + Math.sin(time + rp) * size * 0.04;
    const rpy = y + size * 0.2 - rpPhase * size * 0.7;
    const rpAlpha = Math.sin(rpPhase * Math.PI) * 0.45;
    ctx.fillStyle = `rgba(74,222,128,${rpAlpha})`;
    ctx.beginPath();
    ctx.arc(rpx, rpy, size * 0.012, 0, TAU);
    ctx.fill();
  }

  // Regeneration glow
  setShadowBlur(ctx, 5 * zoom, "rgba(74,222,128,0.3)");
  drawRadialAura(ctx, x, y, size * 0.55, [
    { offset: 0, color: "rgba(74,222,128,0.08)" },
    { offset: 0.5, color: "rgba(34,197,94,0.04)" },
    { offset: 1, color: "rgba(34,197,94,0)" },
  ]);
  clearShadow(ctx);

  // Main trunk body
  const trunkGrad = ctx.createLinearGradient(x - size * 0.22, y, x + size * 0.22, y);
  trunkGrad.addColorStop(0, bodyColorDark);
  trunkGrad.addColorStop(0.2, bodyColor);
  trunkGrad.addColorStop(0.5, bodyColorLight);
  trunkGrad.addColorStop(0.8, bodyColor);
  trunkGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.28 * breathScale, y + size * 0.1, x - size * 0.22, y - size * 0.15);
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.38, x, y - size * 0.42);
  ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.38, x + size * 0.22, y - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.28 * breathScale, y + size * 0.1, x + size * 0.2, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Deep bark crack lines (vertical)
  ctx.lineWidth = 1.4 * zoom;
  for (let b = 0; b < 14; b++) {
    const bx = x - size * 0.18 + b * size * 0.028;
    const bDepth = 0.3 + Math.sin(b * 2.1) * 0.2;
    ctx.strokeStyle = `rgba(30,18,8,${bDepth})`;
    ctx.beginPath();
    ctx.moveTo(bx + sway * 0.3, y + size * 0.32);
    ctx.bezierCurveTo(
      bx + Math.sin(b * 1.2) * size * 0.012 + sway * 0.4, y + size * 0.15,
      bx + Math.sin(b * 0.9) * size * 0.015 + sway * 0.6, y - size * 0.1,
      bx + Math.sin(b * 0.8) * size * 0.01 + sway, y - size * 0.32,
    );
    ctx.stroke();
  }
  // Horizontal bark cracks
  ctx.strokeStyle = "rgba(30,18,8,0.25)";
  ctx.lineWidth = 1 * zoom;
  for (let hc = 0; hc < 7; hc++) {
    const hcy = y + size * 0.25 - hc * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.19, hcy + Math.sin(hc) * size * 0.01);
    ctx.quadraticCurveTo(x, hcy - Math.sin(hc * 1.3) * size * 0.008, x + size * 0.19, hcy - Math.sin(hc) * size * 0.01);
    ctx.stroke();
  }
  // Bark plate highlights
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let bp = 0; bp < 8; bp++) {
    const bpx = x - size * 0.14 + bp * size * 0.04;
    const bpy = y - size * 0.1 + Math.sin(bp * 2.5) * size * 0.15;
    ctx.beginPath();
    ctx.ellipse(bpx + sway * 0.5, bpy, size * 0.015, size * 0.03, Math.sin(bp) * 0.3, 0, TAU);
    ctx.fill();
  }

  // Glowing sap veins pulsing through the trunk
  const sapGlow = sapPulse * 0.8;
  setShadowBlur(ctx, 5 * zoom, `rgba(100,255,100,${sapGlow})`);
  ctx.lineWidth = 2 * zoom;
  for (let sv = 0; sv < 6; sv++) {
    const svx = x - size * 0.12 + sv * size * 0.05;
    const svy1 = y + size * 0.25 - sv * size * 0.04;
    const svy2 = y - size * 0.15 - sv * size * 0.03;
    const svAlpha = sapGlow * (0.5 + Math.sin(time * 3 + sv * 1.2) * 0.3);
    ctx.strokeStyle = `rgba(100,255,100,${svAlpha})`;
    ctx.beginPath();
    ctx.moveTo(svx + sway * 0.3, svy1);
    ctx.bezierCurveTo(
      svx + Math.sin(sv * 1.5) * size * 0.02 + sway * 0.5, (svy1 + svy2) * 0.5,
      svx + Math.sin(sv * 0.8 + 1) * size * 0.025 + sway * 0.7, (svy1 + svy2) * 0.5 - size * 0.05,
      svx + Math.sin(sv * 1.1) * size * 0.015 + sway, svy2,
    );
    ctx.stroke();
    // Sap node glow points
    const nodeY = (svy1 + svy2) * 0.5 + Math.sin(sv * 2) * size * 0.05;
    ctx.fillStyle = `rgba(120,255,120,${svAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(svx + sway * 0.5 + Math.sin(sv * 1.5) * size * 0.015, nodeY, size * 0.008, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Moss patches with gradient detail
  for (let m = 0; m < 8; m++) {
    const mx = x - size * 0.16 + m * size * 0.045 + Math.sin(m * 3.7) * size * 0.02;
    const my = y + size * 0.12 - m * size * 0.05;
    const mossG = ctx.createRadialGradient(mx, my, 0, mx, my, size * 0.025);
    mossG.addColorStop(0, `rgba(50,140,50,${0.4 + Math.sin(time * 1.5 + m) * 0.08})`);
    mossG.addColorStop(1, "rgba(40,100,30,0.1)");
    ctx.fillStyle = mossG;
    ctx.beginPath();
    ctx.ellipse(mx + sway * 0.4, my, size * 0.03, size * 0.018, m * 0.5, 0, TAU);
    ctx.fill();
  }

  // Small mushrooms on trunk
  for (let ms = 0; ms < 4; ms++) {
    const msx = x + (ms - 1.5) * size * 0.08 + size * 0.12;
    const msy = y + size * 0.08 - ms * size * 0.08;
    ctx.fillStyle = "#d4a574";
    ctx.beginPath();
    ctx.moveTo(msx + sway * 0.4, msy);
    ctx.lineTo(msx - size * 0.008 + sway * 0.4, msy + size * 0.025);
    ctx.lineTo(msx + size * 0.008 + sway * 0.4, msy + size * 0.025);
    ctx.fill();
    ctx.fillStyle = ms % 2 === 0 ? "#c0392b" : "#e67e22";
    ctx.beginPath();
    ctx.ellipse(msx + sway * 0.4, msy, size * 0.015, size * 0.01, 0, 0, Math.PI);
    ctx.fill();
  }

  // Branch arms with twig fingers
  for (const side of [-1, 1]) {
    const branchAngle = side * (0.8 + Math.sin(time * 1.5 + side * 2) * 0.15);
    const bx = x + side * size * 0.18;
    const by2 = y - size * 0.2;
    ctx.save();
    ctx.translate(bx + sway, by2);
    ctx.rotate(branchAngle);
    // Main branch with bark gradient
    const brG = ctx.createLinearGradient(0, size * 0.02, size * 0.25, -size * 0.02);
    brG.addColorStop(0, bodyColor);
    brG.addColorStop(0.5, bodyColorDark);
    brG.addColorStop(1, "#3a2510");
    ctx.strokeStyle = brG;
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.1, -size * 0.05, size * 0.25, -size * 0.02);
    ctx.stroke();
    // Bark texture on branch
    ctx.strokeStyle = "rgba(30,18,8,0.3)";
    ctx.lineWidth = 0.6 * zoom;
    for (let bt = 0; bt < 4; bt++) {
      const btx = size * 0.05 + bt * size * 0.05;
      ctx.beginPath();
      ctx.moveTo(btx, -size * 0.025);
      ctx.lineTo(btx + size * 0.01, size * 0.015);
      ctx.stroke();
    }
    // Sub-branches
    ctx.lineWidth = 2.5 * zoom;
    ctx.strokeStyle = bodyColorDark;
    for (let sb = 0; sb < 4; sb++) {
      const sbx = size * 0.06 + sb * size * 0.055;
      ctx.beginPath();
      ctx.moveTo(sbx, -size * 0.02);
      ctx.lineTo(sbx + size * 0.06, -size * 0.08 - sb * size * 0.015);
      ctx.stroke();
    }
    // Twig fingers at branch tip
    ctx.lineWidth = 1 * zoom;
    ctx.strokeStyle = "#4a3020";
    for (let tw = 0; tw < 5; tw++) {
      const twAngle = -0.6 + tw * 0.3;
      ctx.beginPath();
      ctx.moveTo(size * 0.24, -size * 0.02);
      ctx.lineTo(size * 0.24 + Math.cos(twAngle) * size * 0.06, -size * 0.02 + Math.sin(twAngle) * size * 0.06);
      ctx.stroke();
      ctx.fillStyle = "#4a3020";
      ctx.beginPath();
      ctx.arc(size * 0.24 + Math.cos(twAngle) * size * 0.06, -size * 0.02 + Math.sin(twAngle) * size * 0.06, size * 0.004, 0, TAU);
      ctx.fill();
    }
    // Leaf clusters with seasonal color variation
    const greenLeaves = ["#22c55e", "#16a34a", "#4ade80"];
    const autumnLeaves = ["#e67e22", "#c0392b", "#f1c40f"];
    for (let lc = 0; lc < 7; lc++) {
      const lcx = size * 0.12 + lc * size * 0.025;
      const lcy = -size * 0.05 - lc * size * 0.015 + Math.sin(time * 3 + lc) * size * 0.01;
      const leafSet = seasonHue > 0.6 ? autumnLeaves : greenLeaves;
      ctx.fillStyle = leafSet[lc % 3];
      ctx.globalAlpha = 0.7 + Math.sin(time * 2 + lc * 1.5) * 0.2;
      ctx.beginPath();
      ctx.ellipse(lcx, lcy, size * 0.022, size * 0.013, lc * 0.5, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Falling leaf particles
  for (let fl = 0; fl < 5; fl++) {
    const flPhase = (time * 0.3 + fl * 0.4) % 2;
    const flx = x + Math.sin(time * 0.6 + fl * 1.8) * size * 0.25 + sway;
    const fly = y - size * 0.35 + flPhase * size * 0.45;
    const flAlpha = Math.sin(flPhase * Math.PI * 0.5) * 0.5;
    if (flAlpha > 0.05) {
      const leafColor = seasonHue > 0.6 ? ["#e67e22", "#c0392b", "#f1c40f"] : ["#22c55e", "#16a34a", "#4ade80"];
      ctx.fillStyle = leafColor[fl % 3];
      ctx.globalAlpha = flAlpha;
      ctx.save();
      ctx.translate(flx, fly);
      ctx.rotate(time * 2 + fl * 1.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.008, size * 0.015, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;

  // Firefly / spore particles
  for (let sp = 0; sp < 6; sp++) {
    const spPhase = (time * 0.4 + sp * 0.5) % 2;
    const spx = x + Math.sin(time * 0.8 + sp * 2.1) * size * 0.3;
    const spy = y - size * 0.1 + Math.cos(time * 0.6 + sp * 1.7) * size * 0.25;
    const spAlpha = Math.sin(spPhase * Math.PI) * 0.4;
    setShadowBlur(ctx, 3 * zoom, `rgba(200,255,150,${spAlpha})`);
    ctx.fillStyle = `rgba(200,255,150,${spAlpha})`;
    ctx.beginPath();
    ctx.arc(spx, spy, size * 0.005, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Bird perched on shoulder
  const birdSide = Math.sin(time * 0.3) > 0 ? 1 : -1;
  const birdX = x + birdSide * size * 0.2 + sway;
  const birdY = y - size * 0.28 + Math.sin(time * 4) * size * 0.005;
  ctx.fillStyle = "#4a6a8a";
  ctx.beginPath();
  ctx.ellipse(birdX, birdY, size * 0.012, size * 0.009, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#3a5a7a";
  ctx.beginPath();
  ctx.ellipse(birdX + birdSide * size * 0.008, birdY - size * 0.006, size * 0.006, size * 0.005, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#e8b830";
  ctx.beginPath();
  ctx.moveTo(birdX + birdSide * size * 0.014, birdY - size * 0.005);
  ctx.lineTo(birdX + birdSide * size * 0.02, birdY - size * 0.004);
  ctx.lineTo(birdX + birdSide * size * 0.014, birdY - size * 0.003);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(birdX + birdSide * size * 0.01, birdY - size * 0.007, size * 0.002, 0, TAU);
  ctx.fill();

  // Insect ambient particles
  for (let ins = 0; ins < 4; ins++) {
    const insAngle = time * 5 + ins * (TAU / 4);
    const insDist = size * 0.15 + Math.sin(time * 3 + ins) * size * 0.04;
    const insx = x + Math.cos(insAngle) * insDist;
    const insy = y - size * 0.15 + Math.sin(insAngle) * insDist * 0.4;
    ctx.fillStyle = "rgba(60,50,30,0.3)";
    ctx.beginPath();
    ctx.arc(insx, insy, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // Face — knothole eyes with deep inner glow
  const faceY = y - size * 0.22;
  for (const side of [-1, 1]) {
    // Dark eye hollow
    ctx.fillStyle = "#0a0500";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.06 + sway, faceY, size * 0.03, size * 0.035, side * 0.15, 0, TAU);
    ctx.fill();
    // Inner ring
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.06 + sway, faceY, size * 0.025, size * 0.028, side * 0.15, 0, TAU);
    ctx.fill();
    // Deep green glow
    setShadowBlur(ctx, 6 * zoom, "#00ff44");
    const eyeG = ctx.createRadialGradient(
      x + side * size * 0.06 + sway, faceY, 0,
      x + side * size * 0.06 + sway, faceY, size * 0.018,
    );
    eyeG.addColorStop(0, `rgba(150,255,150,${0.8 + Math.sin(time * 3) * 0.2})`);
    eyeG.addColorStop(0.5, `rgba(0,255,68,${0.6 + Math.sin(time * 3) * 0.3})`);
    eyeG.addColorStop(1, "rgba(0,200,50,0.1)");
    ctx.fillStyle = eyeG;
    ctx.beginPath();
    ctx.arc(x + side * size * 0.06 + sway, faceY, size * 0.018, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }
  // Mouth knothole
  ctx.fillStyle = "#0a0500";
  ctx.beginPath();
  ctx.ellipse(x + sway, faceY + size * 0.08, size * 0.035, size * 0.018 + (isAttacking ? size * 0.012 : 0), 0, 0, TAU);
  ctx.fill();
  // Amber glow inside mouth
  if (isAttacking) {
    setShadowBlur(ctx, 3 * zoom, "rgba(100,255,100,0.4)");
    ctx.fillStyle = `rgba(100,255,100,${attackPhase * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x + sway, faceY + size * 0.08, size * 0.02, size * 0.008, 0, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Crown of leaves with seasonal color
  for (let cl = 0; cl < 16; cl++) {
    const angle = cl * (TAU / 16) + Math.sin(time * 1.5 + cl) * 0.15;
    const dist = size * 0.2 + Math.sin(time * 2 + cl * 0.8) * size * 0.025;
    const lx2 = x + Math.cos(angle) * dist + sway;
    const ly = y - size * 0.42 + Math.sin(angle) * dist * 0.3;
    const greenSet = ["#16a34a", "#22c55e", "#4ade80", "#15803d"];
    const autumnSet = ["#d97706", "#c0392b", "#f1c40f", "#a3522b"];
    const leafSet = seasonHue > 0.6 ? autumnSet : greenSet;
    ctx.fillStyle = leafSet[cl % 4];
    ctx.globalAlpha = 0.65 + Math.sin(time * 2.5 + cl) * 0.25;
    ctx.beginPath();
    ctx.ellipse(lx2, ly, size * 0.028, size * 0.018, angle, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 3. FOREST TROLL — Green-skinned brute with a tree-trunk club
export function drawForestTrollEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.4;
  const walkPhase = time * 3.5;
  const lurch = Math.sin(walkPhase) * size * 0.02;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.015;
  const breath = 1 + Math.sin(time * 2) * 0.03;
  const clubSmash = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // Isometric ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.46, size * 0.38, size * 0.12 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Regeneration shimmer
  const regenAlpha = 0.15 + Math.sin(time * 3) * 0.1;
  drawRadialAura(ctx, x, y, size * 0.5, [
    { offset: 0, color: `rgba(100,255,100,${regenAlpha})` },
    { offset: 0.6, color: `rgba(80,200,80,${regenAlpha * 0.4})` },
    { offset: 1, color: "rgba(0,255,0,0)" },
  ]);

  // Heavy footfall dust clouds
  for (const side of [-1, 1]) {
    const footPhase = Math.max(0, -Math.sin(walkPhase + side * Math.PI * 0.5));
    if (footPhase > 0.7) {
      const dustI = (footPhase - 0.7) * 3.3;
      for (let d = 0; d < 6; d++) {
        const dx = x + side * size * 0.14 + (d - 2.5) * size * 0.03;
        const dy = y + size * 0.43 - bodyBob - d * size * 0.005 * dustI;
        ctx.fillStyle = `rgba(120,100,60,${dustI * 0.2 * (1 - d * 0.12)})`;
        ctx.beginPath();
        ctx.ellipse(dx, dy, size * 0.015 * dustI, size * 0.015 * dustI * ISO_Y_RATIO, 0, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Ambient buzzing flies
  for (let fly = 0; fly < 5; fly++) {
    const flyAngle = time * 8 + fly * (TAU / 5);
    const flyDist = size * 0.22 + Math.sin(time * 4 + fly * 2) * size * 0.06;
    const flyX = x + Math.cos(flyAngle) * flyDist + lurch;
    const flyY = y - size * 0.15 + Math.sin(flyAngle * 1.3) * size * 0.1 - bodyBob;
    ctx.fillStyle = "rgba(30,30,10,0.35)";
    ctx.beginPath();
    ctx.arc(flyX, flyY, size * 0.004, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(100,100,80,0.15)";
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.arc(flyX, flyY, size * 0.008, flyAngle, flyAngle + 0.5);
    ctx.stroke();
  }

  // Articulated legs with thigh/calf/foot
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + side * Math.PI * 0.5) * 0.3;
    const lx = x + side * size * 0.13;
    const hipY = y + size * 0.2 - bodyBob;
    const thighAngle = legSwing * 0.6;
    const kneeX = lx + Math.sin(thighAngle) * size * 0.1;
    const kneeY = hipY + Math.cos(thighAngle) * size * 0.13;
    // Thigh with muscle gradient
    const thighG = ctx.createLinearGradient(lx - size * 0.06, hipY, kneeX + size * 0.05, kneeY);
    thighG.addColorStop(0, bodyColor);
    thighG.addColorStop(0.4, bodyColorLight);
    thighG.addColorStop(0.7, bodyColor);
    thighG.addColorStop(1, bodyColorDark);
    ctx.fillStyle = thighG;
    ctx.beginPath();
    ctx.moveTo(lx - size * 0.065, hipY);
    ctx.lineTo(kneeX - size * 0.055, kneeY);
    ctx.lineTo(kneeX + size * 0.055, kneeY);
    ctx.lineTo(lx + size * 0.065, hipY);
    ctx.fill();
    // Muscle highlight
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.ellipse((lx + kneeX) * 0.5 + side * size * 0.01, (hipY + kneeY) * 0.5, size * 0.025, size * 0.06, thighAngle, 0, TAU);
    ctx.fill();
    // Knee joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, size * 0.045, 0, TAU);
    ctx.fill();
    // Rocky skin patches on knee
    ctx.fillStyle = "rgba(100,90,70,0.25)";
    ctx.beginPath();
    ctx.ellipse(kneeX + side * size * 0.02, kneeY, size * 0.02, size * 0.025, side * 0.3, 0, TAU);
    ctx.fill();
    // Calf
    const calfAngle = legSwing * 0.3;
    const ankleX = kneeX + Math.sin(calfAngle) * size * 0.05;
    const ankleY = kneeY + size * 0.1;
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(kneeX - size * 0.045, kneeY);
    ctx.lineTo(ankleX - size * 0.038, ankleY);
    ctx.lineTo(ankleX + size * 0.038, ankleY);
    ctx.lineTo(kneeX + size * 0.045, kneeY);
    ctx.fill();
    // Foot with toes
    ctx.fillStyle = "#3d3020";
    ctx.beginPath();
    ctx.ellipse(ankleX, ankleY + size * 0.015, size * 0.06, size * 0.028, side * 0.15, 0, TAU);
    ctx.fill();
    for (let t = 0; t < 3; t++) {
      ctx.fillStyle = "#2a2015";
      ctx.beginPath();
      ctx.ellipse(ankleX + (t - 1) * size * 0.025 + side * size * 0.01, ankleY + size * 0.038, size * 0.013, size * 0.009, 0, 0, TAU);
      ctx.fill();
      // Toe claws
      ctx.fillStyle = "#1a1008";
      ctx.beginPath();
      ctx.moveTo(ankleX + (t - 1) * size * 0.025 + side * size * 0.015, ankleY + size * 0.042);
      ctx.lineTo(ankleX + (t - 1) * size * 0.025 + side * size * 0.018, ankleY + size * 0.055);
      ctx.lineTo(ankleX + (t - 1) * size * 0.025 + side * size * 0.012, ankleY + size * 0.042);
      ctx.fill();
    }
  }

  // Crude leather loincloth
  const loinG = ctx.createLinearGradient(x - size * 0.12, y + size * 0.15, x + size * 0.12, y + size * 0.28);
  loinG.addColorStop(0, "#5a4030");
  loinG.addColorStop(0.5, "#6a4a35");
  loinG.addColorStop(1, "#4a3020");
  ctx.fillStyle = loinG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + lurch, y + size * 0.15 - bodyBob);
  ctx.lineTo(x - size * 0.1 + lurch, y + size * 0.28 - bodyBob + Math.sin(walkPhase) * size * 0.01);
  ctx.lineTo(x + lurch, y + size * 0.3 - bodyBob);
  ctx.lineTo(x + size * 0.1 + lurch, y + size * 0.28 - bodyBob - Math.sin(walkPhase) * size * 0.01);
  ctx.lineTo(x + size * 0.12 + lurch, y + size * 0.15 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Leather stitching
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 0.6 * zoom;
  for (let ls = 0; ls < 4; ls++) {
    const lsy = y + size * 0.17 + ls * size * 0.03 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08 + lurch, lsy);
    ctx.lineTo(x + size * 0.08 + lurch, lsy + size * 0.005);
    ctx.stroke();
  }
  // Bone toggle on belt
  ctx.fillStyle = "#e8dcc0";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1 + lurch, y + size * 0.15 - bodyBob, size * 0.012, size * 0.008, 0.5, 0, TAU);
  ctx.fill();

  // Big belly body with muscle definition
  const bellyGrad = ctx.createRadialGradient(x - size * 0.05, y - size * 0.02, 0, x, y + size * 0.08, size * 0.36);
  bellyGrad.addColorStop(0, bodyColorLight);
  bellyGrad.addColorStop(0.35, bodyColor);
  bellyGrad.addColorStop(0.7, bodyColorDark);
  bellyGrad.addColorStop(1, "#1a2a0a");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(x + lurch, y + size * 0.05 - bodyBob, size * 0.3 * breath, size * 0.32, -0.1, 0, TAU);
  ctx.fill();

  // Belly lighter patch
  ctx.fillStyle = "rgba(180,200,140,0.15)";
  ctx.beginPath();
  ctx.ellipse(x + lurch, y + size * 0.1 - bodyBob, size * 0.15, size * 0.18, 0, 0, TAU);
  ctx.fill();

  // Rocky skin texture patches
  for (let rk = 0; rk < 8; rk++) {
    const rkx = x + Math.cos(rk * 1.9 + 0.3) * size * 0.22 + lurch;
    const rky = y - size * 0.04 + Math.sin(rk * 2.5 + 0.7) * size * 0.18 - bodyBob;
    const rkG = ctx.createRadialGradient(rkx, rky, 0, rkx, rky, size * 0.025);
    rkG.addColorStop(0, "rgba(100,90,70,0.3)");
    rkG.addColorStop(0.6, "rgba(80,75,55,0.2)");
    rkG.addColorStop(1, "rgba(60,55,40,0.05)");
    ctx.fillStyle = rkG;
    ctx.beginPath();
    ctx.ellipse(rkx, rky, size * 0.025, size * 0.02, rk * 0.7, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(50,45,30,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.arc(rkx, rky, size * 0.02, rk * 0.5, rk * 0.5 + 1.5);
    ctx.stroke();
  }

  // Warty skin
  for (let w = 0; w < 18; w++) {
    const wx = x + Math.cos(w * 1.7) * size * 0.24 + lurch;
    const wy = y - size * 0.05 + Math.sin(w * 2.3) * size * 0.22 - bodyBob;
    const wSize = size * (0.008 + Math.sin(w * 3) * 0.005);
    const wartGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wSize);
    wartGrad.addColorStop(0, "rgba(50,100,40,0.3)");
    wartGrad.addColorStop(1, "rgba(30,60,20,0.1)");
    ctx.fillStyle = wartGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, wSize, 0, TAU);
    ctx.fill();
  }

  // Moss patches growing on body
  for (let mp = 0; mp < 5; mp++) {
    const mpx = x + Math.cos(mp * 2.2 + 0.5) * size * 0.19 + lurch;
    const mpy = y + Math.sin(mp * 1.6 + 1) * size * 0.16 - bodyBob;
    ctx.fillStyle = `rgba(60,140,50,${0.2 + Math.sin(time * 1.5 + mp) * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(mpx, mpy, size * 0.028, size * 0.016, mp * 0.8, 0, TAU);
    ctx.fill();
  }

  // War paint tribal markings
  ctx.strokeStyle = "rgba(180,40,30,0.3)";
  ctx.lineWidth = 2 * zoom;
  // Chevron on chest
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08 + lurch, y - size * 0.08 - bodyBob);
  ctx.lineTo(x + lurch, y + size * 0.02 - bodyBob);
  ctx.lineTo(x + size * 0.08 + lurch, y - size * 0.08 - bodyBob);
  ctx.stroke();
  // Horizontal stripes on arm
  ctx.lineWidth = 1.5 * zoom;
  for (let wp = 0; wp < 3; wp++) {
    const wpy = y - size * 0.06 + wp * size * 0.04 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.24 + lurch, wpy);
    ctx.lineTo(x + size * 0.32 + lurch, wpy);
    ctx.stroke();
  }
  // Dot pattern on shoulder
  ctx.fillStyle = "rgba(180,40,30,0.25)";
  for (let dot = 0; dot < 4; dot++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.22 + lurch + dot * size * 0.025, y - size * 0.16 - bodyBob, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // Belly scar with stitching
  ctx.strokeStyle = "rgba(120,50,30,0.35)";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05 + lurch, y + size * 0.0 - bodyBob);
  ctx.bezierCurveTo(x - size * 0.02 + lurch, y + size * 0.06 - bodyBob, x + size * 0.03 + lurch, y + size * 0.12 - bodyBob, x + size * 0.08 + lurch, y + size * 0.14 - bodyBob);
  ctx.stroke();
  ctx.strokeStyle = "rgba(100,40,25,0.2)";
  ctx.lineWidth = 0.5 * zoom;
  for (let stitch = 0; stitch < 5; stitch++) {
    const sf = stitch / 5;
    const sx = x - size * 0.05 + sf * size * 0.13 + lurch;
    const sy = y + size * 0.0 + sf * size * 0.14 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(sx - size * 0.01, sy - size * 0.008);
    ctx.lineTo(sx + size * 0.01, sy + size * 0.008);
    ctx.stroke();
  }

  // Battle wound scars on flank
  ctx.strokeStyle = "rgba(80,40,20,0.3)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + lurch, y - size * 0.05 - bodyBob);
  ctx.quadraticCurveTo(x - size * 0.08 + lurch, y + size * 0.02, x - size * 0.14 + lurch, y + size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05 + lurch, y + size * 0.12 - bodyBob);
  ctx.lineTo(x + size * 0.12 + lurch, y + size * 0.18 - bodyBob);
  ctx.stroke();

  // Long muscular arms
  for (const side of [-1, 1]) {
    const armAngle = side * (0.3 + Math.sin(walkPhase + side) * 0.15);
    const clubSwing2 = side === 1 && isAttacking ? -clubSmash * 1.5 : 0;
    ctx.save();
    ctx.translate(x + side * size * 0.26 + lurch, y - size * 0.1 - bodyBob);
    ctx.rotate(armAngle + clubSwing2);
    // Upper arm with muscle bulge
    const armGrad = ctx.createLinearGradient(-size * 0.05, 0, size * 0.05, size * 0.15);
    armGrad.addColorStop(0, bodyColorDark);
    armGrad.addColorStop(0.3, bodyColor);
    armGrad.addColorStop(0.6, bodyColorLight);
    armGrad.addColorStop(0.8, bodyColor);
    armGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.07, size * 0.14, 0, 0, TAU);
    ctx.fill();
    // Bicep highlight
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.ellipse(side * size * 0.02, size * 0.07, size * 0.025, size * 0.06, side * 0.3, 0, TAU);
    ctx.fill();
    // Forearm
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.24, size * 0.055, size * 0.1, 0, 0, TAU);
    ctx.fill();
    // Knuckle fist
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(0, size * 0.33, size * 0.048, 0, TAU);
    ctx.fill();
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc((k - 1.5) * size * 0.018, size * 0.31, size * 0.011, 0, TAU);
      ctx.fill();
    }
    // Crude bone/wood club in right hand
    if (side === 1) {
      // Handle — tree trunk
      const handleGrad = ctx.createLinearGradient(-size * 0.025, size * 0.28, size * 0.025, size * 0.58);
      handleGrad.addColorStop(0, "#6a4a2a");
      handleGrad.addColorStop(0.3, "#5a3a1a");
      handleGrad.addColorStop(0.7, "#4a2a0a");
      handleGrad.addColorStop(1, "#3a1a00");
      ctx.fillStyle = handleGrad;
      ctx.beginPath();
      ctx.roundRect(-size * 0.028, size * 0.28, size * 0.056, size * 0.3, size * 0.008);
      ctx.fill();
      // Bark texture on handle
      ctx.strokeStyle = "rgba(30,18,8,0.3)";
      ctx.lineWidth = 0.5 * zoom;
      for (let bt = 0; bt < 6; bt++) {
        const bty = size * 0.3 + bt * size * 0.045;
        ctx.beginPath();
        ctx.moveTo(-size * 0.025, bty);
        ctx.lineTo(-size * 0.025, bty + size * 0.02);
        ctx.stroke();
      }
      // Grip wrapping (leather strips)
      ctx.strokeStyle = "#3a2a10";
      ctx.lineWidth = 1 * zoom;
      for (let g = 0; g < 6; g++) {
        const gy = size * 0.31 + g * size * 0.035;
        ctx.beginPath();
        ctx.moveTo(-size * 0.028, gy);
        ctx.lineTo(size * 0.028, gy + size * 0.012);
        ctx.stroke();
      }
      // Club head (gnarled wood knot)
      const clubGrad = ctx.createRadialGradient(0, size * 0.6, 0, 0, size * 0.6, size * 0.07);
      clubGrad.addColorStop(0, "#5a4a3a");
      clubGrad.addColorStop(0.4, "#4a3a2a");
      clubGrad.addColorStop(0.8, "#3a2a1a");
      clubGrad.addColorStop(1, "#2a1a0a");
      ctx.fillStyle = clubGrad;
      ctx.beginPath();
      ctx.ellipse(0, size * 0.6, size * 0.07, size * 0.055, 0, 0, TAU);
      ctx.fill();
      // Wood grain on club head
      ctx.strokeStyle = "rgba(20,12,5,0.25)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(0, size * 0.6, size * 0.04, size * 0.03, 0.3, 0, TAU);
      ctx.stroke();
      // Iron spikes embedded in wood
      for (let sp = 0; sp < 5; sp++) {
        const spA = sp * (TAU / 5) - Math.PI * 0.3;
        const spG = ctx.createLinearGradient(
          Math.cos(spA) * size * 0.05, size * 0.6 + Math.sin(spA) * size * 0.04,
          Math.cos(spA) * size * 0.09, size * 0.6 + Math.sin(spA) * size * 0.065,
        );
        spG.addColorStop(0, "#aaa");
        spG.addColorStop(0.5, "#888");
        spG.addColorStop(1, "#555");
        ctx.fillStyle = spG;
        ctx.beginPath();
        ctx.moveTo(Math.cos(spA) * size * 0.05, size * 0.6 + Math.sin(spA) * size * 0.04);
        ctx.lineTo(Math.cos(spA) * size * 0.09, size * 0.6 + Math.sin(spA) * size * 0.065);
        ctx.lineTo(Math.cos(spA + 0.15) * size * 0.05, size * 0.6 + Math.sin(spA + 0.15) * size * 0.04);
        ctx.fill();
      }
      // Bone fragment lashed to club
      ctx.fillStyle = "#e8dcc0";
      ctx.beginPath();
      ctx.ellipse(size * 0.04, size * 0.57, size * 0.008, size * 0.025, 0.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Hunched shoulders with muscle bulges
  const shoulderGrad = ctx.createLinearGradient(x - size * 0.3, y - size * 0.18, x + size * 0.3, y - size * 0.12);
  shoulderGrad.addColorStop(0, bodyColorDark);
  shoulderGrad.addColorStop(0.3, bodyColor);
  shoulderGrad.addColorStop(0.5, bodyColorLight);
  shoulderGrad.addColorStop(0.7, bodyColor);
  shoulderGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = shoulderGrad;
  ctx.beginPath();
  ctx.ellipse(x + lurch, y - size * 0.18 - bodyBob, size * 0.32, size * 0.14, 0, 0, TAU);
  ctx.fill();
  // Trapezius muscle ridges
  ctx.strokeStyle = "rgba(0,0,0,0.07)";
  ctx.lineWidth = 1 * zoom;
  for (let tr = 0; tr < 3; tr++) {
    ctx.beginPath();
    ctx.arc(x + lurch + (tr - 1) * size * 0.08, y - size * 0.2 - bodyBob, size * 0.06, -0.4, 0.8);
    ctx.stroke();
  }

  // Head (small relative to body)
  const headY = y - size * 0.3 - bodyBob;
  const headGrad = ctx.createRadialGradient(x + lurch - size * 0.02, headY - size * 0.02, 0, x + lurch, headY, size * 0.13);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY, size * 0.12, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Heavy brow ridge
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY - size * 0.035, size * 0.14, size * 0.048, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.6 * zoom;
  for (let bw = 0; bw < 3; bw++) {
    const bwy = headY - size * 0.04 + bw * size * 0.008;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.09 + lurch, bwy);
    ctx.quadraticCurveTo(x + lurch, bwy - size * 0.003, x + size * 0.09 + lurch, bwy);
    ctx.stroke();
  }

  // Beady angry eyes with glow
  setShadowBlur(ctx, 3 * zoom, "#ffaa00");
  for (const side of [-1, 1]) {
    const eyeX = x + side * size * 0.045 + lurch;
    const eyeY = headY - size * 0.008;
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.018);
    eyeGrad.addColorStop(0, "#ffee00");
    eyeGrad.addColorStop(0.4, "#ffbb00");
    eyeGrad.addColorStop(0.8, "#aa6600");
    eyeGrad.addColorStop(1, "#663300");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.018, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.arc(eyeX - size * 0.004, eyeY - size * 0.004, size * 0.003, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Wide mouth with underbite and drool
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY + size * 0.05, size * 0.075, size * 0.028, 0, 0, TAU);
  ctx.fill();
  // Lower jaw / underbite
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY + size * 0.06, size * 0.08, size * 0.02, 0, 0, Math.PI);
  ctx.fill();
  // Drool strands
  const droolLen = Math.sin(time * 2) * size * 0.03 + size * 0.03;
  ctx.strokeStyle = "rgba(180,200,160,0.3)";
  ctx.lineWidth = 1 * zoom;
  for (let dr = 0; dr < 2; dr++) {
    ctx.beginPath();
    ctx.moveTo(x + (dr - 0.5) * size * 0.04 + lurch, headY + size * 0.065);
    ctx.quadraticCurveTo(x + (dr - 0.5) * size * 0.04 + size * 0.005 + lurch, headY + size * 0.065 + droolLen * 0.6, x + (dr - 0.5) * size * 0.04 + lurch, headY + size * 0.065 + droolLen);
    ctx.stroke();
  }

  // Large upturned tusks
  for (const side of [-1, 1]) {
    const tuskGrad = ctx.createLinearGradient(
      x + side * size * 0.035 + lurch, headY + size * 0.05,
      x + side * size * 0.03 + lurch, headY - size * 0.04,
    );
    tuskGrad.addColorStop(0, "#d4c8a0");
    tuskGrad.addColorStop(0.3, "#e8dcc0");
    tuskGrad.addColorStop(0.7, "#f5f0d8");
    tuskGrad.addColorStop(1, "#c8b880");
    ctx.fillStyle = tuskGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.025 + lurch, headY + size * 0.05);
    ctx.quadraticCurveTo(x + side * size * 0.05 + lurch, headY + size * 0.015, x + side * size * 0.038 + lurch, headY - size * 0.04);
    ctx.lineTo(x + side * size * 0.042 + lurch, headY + size * 0.05);
    ctx.fill();
    // Tusk shine
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.032 + lurch, headY + size * 0.04);
    ctx.lineTo(x + side * size * 0.038 + lurch, headY - size * 0.02);
    ctx.stroke();
  }

  // Pointed ears with bone piercings
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.1 + lurch, headY);
    ctx.lineTo(x + side * size * 0.17 + lurch, headY - size * 0.07);
    ctx.lineTo(x + side * size * 0.12 + lurch, headY + size * 0.02);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "rgba(120,80,60,0.3)";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.11 + lurch, headY - size * 0.005);
    ctx.lineTo(x + side * size * 0.155 + lurch, headY - size * 0.055);
    ctx.lineTo(x + side * size * 0.12 + lurch, headY + size * 0.01);
    ctx.fill();
    // Bone earring
    ctx.fillStyle = "#e8dcc0";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.13 + lurch, headY + size * 0.015, size * 0.005, size * 0.012, side * 0.3, 0, TAU);
    ctx.fill();
  }

  // Nose bone piercing
  ctx.fillStyle = "#e8dcc0";
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY + size * 0.035, size * 0.018, size * 0.005, 0, 0, TAU);
  ctx.fill();
  // Septum ring detail
  ctx.strokeStyle = "#d4c8a0";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x + lurch, headY + size * 0.04, size * 0.01, 0, Math.PI);
  ctx.stroke();

  // Impact ring and debris on club smash
  if (isAttacking && clubSmash > 0.7) {
    const ringAlpha = (clubSmash - 0.7) * 3.3;
    ctx.strokeStyle = `rgba(180,140,80,${ringAlpha * 0.5})`;
    ctx.lineWidth = 2.5 * zoom;
    const ringR = size * 0.35 * ringAlpha;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.3, y + size * 0.45, ringR, ringR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    // Shockwave ring
    ctx.strokeStyle = `rgba(200,180,120,${ringAlpha * 0.25})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.3, y + size * 0.45, ringR * 1.3, ringR * 1.3 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    for (let db = 0; db < 8; db++) {
      const dbAngle = db * (TAU / 8) + time * 2;
      const dbDist = ringAlpha * size * 0.22;
      ctx.fillStyle = `rgba(140,120,80,${ringAlpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(x + size * 0.3 + Math.cos(dbAngle) * dbDist, y + size * 0.45 + Math.sin(dbAngle) * dbDist * ISO_Y_RATIO, size * 0.012, 0, TAU);
      ctx.fill();
    }
  }
}

// 4. TIMBER WOLF — Sleek grey wolf with animated running gait
export function drawTimberWolfEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.3;
  const gallopPhase = time * 7;
  const gallop = Math.sin(gallopPhase);
  const bodyStretch = 1 + Math.abs(gallop) * 0.05;
  const bodyBob = Math.abs(Math.sin(gallopPhase)) * size * 0.025;
  const lunge = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 0.18 : 0;
  const breathe = 1 + Math.sin(time * 3) * 0.015;
  const jawOpen = isAttacking ? 0.35 + attackPhase * 0.4 : 0.08 + Math.sin(time * 2.5) * 0.04;
  const earTwitch = Math.sin(time * 6) * 0.15;

  // Isometric ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(x + lunge * 0.2, y + size * 0.24, size * 0.38, size * 0.1 * ISO_Y_RATIO, -0.05, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.beginPath();
  ctx.ellipse(x + lunge * 0.2, y + size * 0.24, size * 0.48, size * 0.14 * ISO_Y_RATIO, -0.05, 0, TAU);
  ctx.fill();

  // Speed blur lines when attacking
  if (isAttacking) {
    ctx.lineWidth = 1.5 * zoom;
    for (let sl = 0; sl < 6; sl++) {
      const slP = (time * 6 + sl * 0.35) % 1;
      ctx.strokeStyle = `rgba(255,255,255,${(1 - slP) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.45 - slP * size * 0.3, y - size * 0.1 + sl * size * 0.04);
      ctx.lineTo(x - size * 0.45 - slP * size * 0.3 - size * 0.25, y - size * 0.1 + sl * size * 0.04);
      ctx.stroke();
    }
  }

  // Pack howl ambient effect (visible sound waves when not attacking)
  if (!isAttacking && Math.sin(time * 0.5) > 0.8) {
    const howlI = (Math.sin(time * 0.5) - 0.8) * 5;
    for (let hw = 0; hw < 3; hw++) {
      const hwR = size * 0.1 + hw * size * 0.06 + howlI * size * 0.04;
      ctx.strokeStyle = `rgba(200,210,230,${howlI * 0.12 * (1 - hw * 0.3)})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.arc(x + size * 0.35, y - size * 0.18 - bodyBob, hwR, -1.2, -0.3);
      ctx.stroke();
    }
  }

  // Bushy tail with multi-layer fur and physics sway
  const tailWag = Math.sin(time * 4) * 0.25 + (isAttacking ? -0.3 : 0);
  const tailInertia = Math.sin(time * 4 - 0.3) * 0.12;
  ctx.save();
  ctx.translate(x - size * 0.32, y - size * 0.04 - bodyBob);
  ctx.rotate(-0.7 + tailWag);
  // Outer tail (guard hairs)
  const tailGrad = ctx.createLinearGradient(0, 0, -size * 0.26, -size * 0.12);
  tailGrad.addColorStop(0, bodyColor);
  tailGrad.addColorStop(0.4, bodyColorLight);
  tailGrad.addColorStop(0.7, bodyColor);
  tailGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.035);
  ctx.quadraticCurveTo(-size * 0.08, -size * 0.11, -size * 0.2, -size * 0.09 + tailInertia * size * 0.1);
  ctx.quadraticCurveTo(-size * 0.26, -size * 0.06 + tailInertia * size * 0.08, -size * 0.25, -size * 0.03 + tailInertia * size * 0.06);
  ctx.quadraticCurveTo(-size * 0.18, size * 0.04, 0, size * 0.035);
  ctx.fill();
  // White tip
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.23, -size * 0.04 + tailInertia * size * 0.06, size * 0.025, size * 0.015, -0.5, 0, TAU);
  ctx.fill();
  // Tail fur strands
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.7 * zoom;
  for (let tf = 0; tf < 7; tf++) {
    const tx = -size * 0.04 - tf * size * 0.03;
    const ty = -size * 0.05 - tf * size * 0.008 + tailInertia * size * 0.02 * tf;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.sin(time * 3 + tf) * size * 0.01, ty - size * 0.02);
    ctx.stroke();
  }
  ctx.restore();

  // Articulated legs with joints, tendons, and claws
  const legLen = size * 0.14;
  const legData = [
    { xOff: -0.16, isFront: false, phase: 0 },
    { xOff: -0.08, isFront: false, phase: Math.PI * 0.5 },
    { xOff: 0.08, isFront: true, phase: Math.PI },
    { xOff: 0.18, isFront: true, phase: Math.PI * 1.5 },
  ];
  for (const leg of legData) {
    const swing = Math.sin(gallopPhase + leg.phase) * 0.4;
    const kneeBend = Math.max(0, -Math.sin(gallopPhase + leg.phase)) * 0.45;
    ctx.save();
    ctx.translate(x + leg.xOff * size + lunge * 0.3, y + (leg.isFront ? 0.08 : 0.1) * size - bodyBob);
    ctx.rotate(swing);

    // Upper leg with muscle definition
    const upperG = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, legLen);
    upperG.addColorStop(0, bodyColorDark);
    upperG.addColorStop(0.3, bodyColor);
    upperG.addColorStop(0.6, bodyColorLight);
    upperG.addColorStop(1, bodyColorDark);
    ctx.fillStyle = upperG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.038, 0);
    ctx.quadraticCurveTo(-size * 0.055, legLen * 0.3, -size * 0.032, legLen * 0.85);
    ctx.lineTo(size * 0.032, legLen * 0.85);
    ctx.quadraticCurveTo(size * 0.055, legLen * 0.3, size * 0.038, 0);
    ctx.closePath();
    ctx.fill();
    // Muscle highlight
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.ellipse(size * 0.01, legLen * 0.35, size * 0.015, size * 0.04, 0.1, 0, TAU);
    ctx.fill();

    // Knee joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, legLen * 0.85, size * 0.035, size * 0.028, 0, 0, TAU);
    ctx.fill();

    ctx.translate(0, legLen * 0.85);
    ctx.rotate(kneeBend);

    // Lower leg with visible tendon lines
    const lowerG = ctx.createLinearGradient(-size * 0.025, 0, size * 0.025, legLen * 0.8);
    lowerG.addColorStop(0, bodyColor);
    lowerG.addColorStop(0.5, bodyColorDark);
    lowerG.addColorStop(1, bodyColorDark);
    ctx.fillStyle = lowerG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, 0);
    ctx.lineTo(-size * 0.022, legLen * 0.7);
    ctx.lineTo(size * 0.022, legLen * 0.7);
    ctx.lineTo(size * 0.03, 0);
    ctx.closePath();
    ctx.fill();
    // Tendon lines
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.4 * zoom;
    for (let tn = -1; tn <= 1; tn++) {
      ctx.beginPath();
      ctx.moveTo(tn * size * 0.008, size * 0.01);
      ctx.lineTo(tn * size * 0.006, legLen * 0.65);
      ctx.stroke();
    }

    // Paw
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, legLen * 0.72, size * 0.038, size * 0.02, 0, 0, TAU);
    ctx.fill();

    // Claws
    for (let c = -1; c <= 1; c++) {
      const clG = ctx.createLinearGradient(c * size * 0.012, legLen * 0.72, c * size * 0.012, legLen * 0.72 + size * 0.032);
      clG.addColorStop(0, "#3a2a18");
      clG.addColorStop(1, "#1a0a00");
      ctx.fillStyle = clG;
      ctx.beginPath();
      ctx.moveTo(c * size * 0.012 - size * 0.004, legLen * 0.72 + size * 0.01);
      ctx.lineTo(c * size * 0.012, legLen * 0.72 + size * 0.032);
      ctx.lineTo(c * size * 0.012 + size * 0.004, legLen * 0.72 + size * 0.01);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Muscular body with multi-layer fur
  const bodyGrad = ctx.createRadialGradient(
    x + lunge * 0.3, y - size * 0.02 - bodyBob, size * 0.06,
    x + lunge * 0.3, y - size * 0.02 - bodyBob, size * 0.32,
  );
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.6, bodyColorDark);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x + lunge * 0.3, y - size * 0.02 - bodyBob, size * 0.34 * bodyStretch, size * 0.16 * breathe, -0.05, 0, TAU);
  ctx.fill();

  // Undercoat (lighter belly)
  const bellyG = ctx.createRadialGradient(x + lunge * 0.3, y + size * 0.06 - bodyBob, 0, x + lunge * 0.3, y + size * 0.04 - bodyBob, size * 0.2);
  bellyG.addColorStop(0, "rgba(220,210,190,0.15)");
  bellyG.addColorStop(1, "rgba(200,190,170,0)");
  ctx.fillStyle = bellyG;
  ctx.beginPath();
  ctx.ellipse(x + lunge * 0.3, y + size * 0.04 - bodyBob, size * 0.25, size * 0.1, -0.05, 0, TAU);
  ctx.fill();

  // Muscle definition
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.08 + lunge * 0.3, y - size * 0.06 - bodyBob, size * 0.07, size * 0.04, 0.3, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08 + lunge * 0.3, y - size * 0.04 - bodyBob, size * 0.06, size * 0.035, -0.2, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Rib lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.globalAlpha = 0.15;
  for (let r = 0; r < 4; r++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.06 + r * size * 0.04 + lunge * 0.2, y - size * 0.01 - bodyBob, size * 0.06, -0.4, 0.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Raised hackles (bristling spine fur)
  for (let h = 0; h < 14; h++) {
    const hx = x - size * 0.24 + h * size * 0.035 + lunge * 0.2;
    const hy = y - size * 0.16 - bodyBob;
    const hackleH = size * 0.035 + Math.sin(time * 5 + h * 0.8) * size * 0.008;
    const hackleColor = h < 4 ? bodyColorDark : (h < 10 ? bodyColor : bodyColorLight);
    ctx.fillStyle = hackleColor;
    ctx.beginPath();
    ctx.moveTo(hx - size * 0.008, hy + size * 0.02);
    ctx.lineTo(hx, hy - hackleH);
    ctx.lineTo(hx + size * 0.008, hy + size * 0.02);
    ctx.fill();
  }

  // Multi-coat fur texture strands
  ctx.lineWidth = 0.8 * zoom;
  for (let f = 0; f < 20; f++) {
    const fx = x - size * 0.3 + f * size * 0.03 + lunge * 0.2;
    const fy = y - size * 0.08 - bodyBob;
    const fColor = f % 3 === 0 ? bodyColorLight : (f % 3 === 1 ? bodyColor : bodyColorDark);
    ctx.strokeStyle = fColor;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.sin(f + time * 2) * size * 0.012, fy + size * 0.05);
    ctx.stroke();
  }
  // Secondary coat layer (lighter undercoat strands)
  ctx.lineWidth = 0.5 * zoom;
  ctx.strokeStyle = "rgba(200,190,170,0.15)";
  for (let uf = 0; uf < 12; uf++) {
    const ufx = x - size * 0.2 + uf * size * 0.035 + lunge * 0.2;
    const ufy = y + size * 0.02 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(ufx, ufy);
    ctx.lineTo(ufx + Math.sin(uf * 0.7 + time) * size * 0.008, ufy + size * 0.03);
    ctx.stroke();
  }

  // Battle-worn scars
  ctx.strokeStyle = "rgba(180,120,120,0.25)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05 + lunge * 0.2, y - size * 0.1 - bodyBob);
  ctx.lineTo(x + size * 0.05 + lunge * 0.2, y + size * 0.02 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1 + lunge * 0.2, y - size * 0.08 - bodyBob);
  ctx.lineTo(x + size * 0.15 + lunge * 0.2, y + size * 0.01 - bodyBob);
  ctx.stroke();
  // Additional scar on hindquarter
  ctx.strokeStyle = "rgba(160,100,100,0.2)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2 + lunge * 0.1, y - size * 0.05 - bodyBob);
  ctx.quadraticCurveTo(x - size * 0.15 + lunge * 0.1, y + size * 0.02 - bodyBob, x - size * 0.18 + lunge * 0.1, y + size * 0.06 - bodyBob);
  ctx.stroke();

  // Fierce head
  const headX = x + size * 0.3 + lunge;
  const headY = y - size * 0.1 - bodyBob + Math.sin(gallopPhase * 0.5) * size * 0.01;
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.13);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(0.8, bodyColorDark);
  headGrad.addColorStop(1, "#1a1510");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.12, size * 0.1, 0.08, 0, TAU);
  ctx.fill();

  // Cheek fur ruff
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColor;
    for (let cf = 0; cf < 3; cf++) {
      ctx.beginPath();
      ctx.ellipse(headX - size * 0.02 + side * size * 0.08, headY + size * 0.02 + cf * size * 0.012, size * 0.015, size * 0.025, side * 0.4, 0, TAU);
      ctx.fill();
    }
  }

  // Brow ridge
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX, headY - size * 0.065, headX + size * 0.06, headY - size * 0.03);
  ctx.quadraticCurveTo(headX, headY - size * 0.04, headX - size * 0.06, headY - size * 0.04);
  ctx.fill();

  // Snout with detailed snarl wrinkles
  const snoutG = ctx.createLinearGradient(headX + size * 0.06, headY - size * 0.02, headX + size * 0.18, headY + size * 0.02);
  snoutG.addColorStop(0, bodyColor);
  snoutG.addColorStop(0.5, bodyColorLight);
  snoutG.addColorStop(1, bodyColor);
  ctx.fillStyle = snoutG;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.06, headY - size * 0.02);
  ctx.quadraticCurveTo(headX + size * 0.16, headY, headX + size * 0.18, headY + size * 0.02);
  ctx.quadraticCurveTo(headX + size * 0.16, headY + size * 0.04, headX + size * 0.06, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();
  // Snarl wrinkle lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.globalAlpha = 0.4;
  for (let w = 0; w < 4; w++) {
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.07 + w * size * 0.02, headY - size * 0.018);
    ctx.quadraticCurveTo(headX + size * 0.08 + w * size * 0.02, headY + size * 0.005, headX + size * 0.07 + w * size * 0.02, headY + size * 0.018);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Nose
  const noseG = ctx.createRadialGradient(headX + size * 0.16, headY + size * 0.015, 0, headX + size * 0.16, headY + size * 0.015, size * 0.02);
  noseG.addColorStop(0, "#2a1500");
  noseG.addColorStop(1, "#1a0a00");
  ctx.fillStyle = noseG;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.16, headY + size * 0.015, size * 0.02, size * 0.015, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.157, headY + size * 0.012, size * 0.006, size * 0.004, -0.3, 0, TAU);
  ctx.fill();

  // Open jaws with exposed fangs
  ctx.fillStyle = "#3a0808";
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.1, headY + size * 0.01);
  ctx.quadraticCurveTo(headX + size * 0.14, headY + size * 0.01 - jawOpen * size * 0.08, headX + size * 0.16, headY - jawOpen * size * 0.04);
  ctx.lineTo(headX + size * 0.16, headY + size * 0.03 + jawOpen * size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.14, headY + size * 0.02 + jawOpen * size * 0.08, headX + size * 0.1, headY + size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Tongue
  if (jawOpen > 0.15) {
    ctx.fillStyle = "#8a2020";
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.12, headY + size * 0.025, size * 0.022, size * 0.009, 0, 0, TAU);
    ctx.fill();
  }

  // Upper fangs
  ctx.fillStyle = "#f0e8d0";
  const fangLen = size * 0.035 + jawOpen * size * 0.015;
  for (const [fx, baseY] of [[0.11, 0.005], [0.13, 0.002], [0.09, 0.008]] as [number, number][]) {
    const fG = ctx.createLinearGradient(headX + fx * size, headY + baseY * size, headX + fx * size, headY + baseY * size + fangLen);
    fG.addColorStop(0, "#f5f0e0");
    fG.addColorStop(1, "#c8b890");
    ctx.fillStyle = fG;
    ctx.beginPath();
    ctx.moveTo(headX + fx * size - size * 0.003, headY + baseY * size);
    ctx.lineTo(headX + fx * size, headY + baseY * size + fangLen);
    ctx.lineTo(headX + fx * size + size * 0.003, headY + baseY * size);
    ctx.closePath();
    ctx.fill();
  }
  // Lower fangs
  for (const [fx, baseY] of [[0.11, 0.03], [0.13, 0.028]] as [number, number][]) {
    ctx.fillStyle = "#f0e8d0";
    ctx.beginPath();
    ctx.moveTo(headX + fx * size - size * 0.003, headY + baseY * size);
    ctx.lineTo(headX + fx * size, headY + baseY * size - fangLen * 0.7);
    ctx.lineTo(headX + fx * size + size * 0.003, headY + baseY * size);
    ctx.closePath();
    ctx.fill();
  }

  // Saliva strands
  if (jawOpen > 0.1) {
    ctx.strokeStyle = `rgba(200,200,220,${jawOpen * 0.4})`;
    ctx.lineWidth = 0.5 * zoom;
    for (let s = 0; s < 3; s++) {
      const sx = headX + size * (0.1 + s * 0.018);
      ctx.beginPath();
      ctx.moveTo(sx, headY + size * 0.008);
      ctx.quadraticCurveTo(sx + size * 0.005, headY + size * 0.018, sx, headY + size * 0.025);
      ctx.stroke();
    }
  }

  // Pointed ears with animation
  for (const side of [-1, 1]) {
    const earAngle = earTwitch * side;
    ctx.save();
    ctx.translate(headX + side * size * 0.06, headY - size * 0.07);
    ctx.rotate(earAngle);
    // Outer ear
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, size * 0.01);
    ctx.lineTo(side * size * 0.015, -size * 0.08);
    ctx.lineTo(size * 0.02, size * 0.01);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#8a6a5a";
    ctx.beginPath();
    ctx.moveTo(-size * 0.012, size * 0.005);
    ctx.lineTo(side * size * 0.008, -size * 0.06);
    ctx.lineTo(size * 0.012, size * 0.005);
    ctx.fill();
    // Ear fur tufts
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.04);
    ctx.lineTo(side * size * 0.005, -size * 0.05);
    ctx.stroke();
    ctx.restore();
  }

  // Moonlit glowing amber eyes
  setShadowBlur(ctx, 8 * zoom, "#ff8800");
  for (const side of [-1, 1]) {
    const ey = headY - size * 0.02 + side * size * 0.018;
    // Outer glow
    ctx.fillStyle = `rgba(255,180,50,${0.15 + Math.sin(time * 2) * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.04, ey, size * 0.025, size * 0.02, 0.1, 0, TAU);
    ctx.fill();
    // Eye base
    const eyeGrad = ctx.createRadialGradient(headX + size * 0.04, ey, 0, headX + size * 0.04, ey, size * 0.019);
    eyeGrad.addColorStop(0, "#ffee44");
    eyeGrad.addColorStop(0.3, "#ffcc00");
    eyeGrad.addColorStop(0.6, "#ffaa00");
    eyeGrad.addColorStop(1, "#cc4400");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.04, ey, size * 0.019, size * 0.014, 0.1, 0, TAU);
    ctx.fill();
    // Slit pupil
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.04, ey, size * 0.005, size * 0.012, 0, 0, TAU);
    ctx.fill();
    // Light catch
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(headX + size * 0.036, ey - size * 0.004, size * 0.003, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);
}

// 5. GIANT EAGLE — Majestic eagle with detailed animated wing flapping
export function drawGiantEagleEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.35;
  const flapPhase = Math.sin(time * 4);
  const wingAngle = flapPhase * 0.5;
  const hover = Math.sin(time * 3) * size * 0.02;
  const dive = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 0.2 : 0;
  const by = hover - dive;
  const bankTilt = Math.sin(time * 1.5) * 0.08;

  // Isometric ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.38, size * 0.45, size * 0.1 * ISO_Y_RATIO, bankTilt, 0, TAU);
  ctx.fill();

  // Wind current particles around wings
  for (let w = 0; w < 8; w++) {
    const wAngle = time * 2 + w * (TAU / 8);
    const wDist = size * 0.4 + Math.sin(time * 3 + w) * size * 0.08;
    const wx = x + Math.cos(wAngle) * wDist;
    const wy = y + by + Math.sin(wAngle) * wDist * 0.35;
    ctx.strokeStyle = `rgba(200,220,255,${0.1 + Math.sin(time * 2 + w) * 0.05})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(wx, wy, size * 0.03, wAngle, wAngle + 1.5);
    ctx.stroke();
  }
  // Downdraft effect below body
  for (let dd = 0; dd < 4; dd++) {
    const ddPhase = (time * 1.5 + dd * 0.5) % 1;
    const ddx = x + (dd - 1.5) * size * 0.08;
    const ddy = y + size * 0.15 + by + ddPhase * size * 0.15;
    const ddAlpha = (1 - ddPhase) * 0.08 * (0.5 + flapPhase * 0.5);
    ctx.strokeStyle = `rgba(180,200,230,${ddAlpha})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(ddx - size * 0.02, ddy);
    ctx.lineTo(ddx + size * 0.02, ddy);
    ctx.stroke();
  }

  // Loose feather particles drifting down
  for (let lf = 0; lf < 4; lf++) {
    const lfPhase = (time * 0.3 + lf * 0.6) % 2;
    const lfx = x + Math.sin(time * 0.8 + lf * 2) * size * 0.3;
    const lfy = y + size * 0.1 + lfPhase * size * 0.25;
    const lfAlpha = (1 - lfPhase * 0.5) * 0.18;
    if (lfAlpha > 0.02) {
      ctx.fillStyle = `rgba(180,160,120,${lfAlpha})`;
      ctx.save();
      ctx.translate(lfx, lfy);
      ctx.rotate(Math.sin(time * 2 + lf) * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.003, size * 0.012, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // Tail feathers spread
  for (let tf = 0; tf < 7; tf++) {
    const tfAngle = -0.4 + tf * 0.13 + Math.sin(time * 2) * 0.05;
    ctx.save();
    ctx.translate(x, y + size * 0.1 + by);
    ctx.rotate(tfAngle);
    const tfGrad = ctx.createLinearGradient(0, 0, 0, size * 0.18);
    tfGrad.addColorStop(0, bodyColor);
    tfGrad.addColorStop(0.4, bodyColorDark);
    tfGrad.addColorStop(0.8, "#2a1a0a");
    tfGrad.addColorStop(1, "#1a0a00");
    ctx.fillStyle = tfGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.006, 0);
    ctx.lineTo(-size * 0.009, size * 0.16);
    ctx.lineTo(size * 0.009, size * 0.16);
    ctx.lineTo(size * 0.006, 0);
    ctx.fill();
    // Barb lines
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.015);
    ctx.lineTo(0, size * 0.15);
    ctx.stroke();
    // Barb detail
    ctx.lineWidth = 0.2 * zoom;
    for (let b = 0; b < 4; b++) {
      const bby = size * 0.04 + b * size * 0.03;
      ctx.beginPath();
      ctx.moveTo(0, bby);
      ctx.lineTo(size * 0.006, bby + size * 0.01);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, bby);
      ctx.lineTo(-size * 0.006, bby + size * 0.01);
      ctx.stroke();
    }
    // White band near tail tip
    if (tf >= 2 && tf <= 4) {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.rect(-size * 0.007, size * 0.11, size * 0.014, size * 0.015);
      ctx.fill();
    }
    ctx.restore();
  }

  // Wings with extensive feather detail
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.1, y - size * 0.05 + by);
    ctx.rotate(side * wingAngle + bankTilt * side * 0.3);

    const wingSpan = size * 0.5;
    const wingBend = size * 0.3;

    // Wing bone structure visible at shoulder
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * wingBend * 0.3, -size * 0.08, side * wingBend, -size * 0.12);
    ctx.stroke();
    // Elbow joint
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(side * wingBend, -size * 0.12, size * 0.018, 0, TAU);
    ctx.fill();
    // Forearm bone
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(side * wingBend, -size * 0.12);
    ctx.lineTo(side * wingSpan * 0.8, -size * 0.08);
    ctx.stroke();

    // Inner wing (coverts)
    const innerGrad = ctx.createLinearGradient(0, 0, side * wingBend, -size * 0.15);
    innerGrad.addColorStop(0, bodyColor);
    innerGrad.addColorStop(0.5, bodyColorDark);
    innerGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.01);
    ctx.quadraticCurveTo(side * wingBend * 0.5, -size * 0.17, side * wingBend, -size * 0.19);
    ctx.lineTo(side * wingBend, -size * 0.02);
    ctx.quadraticCurveTo(side * wingBend * 0.5, -size * 0.01, 0, size * 0.03);
    ctx.fill();

    // Outer wing (primaries)
    const outerGrad = ctx.createLinearGradient(side * wingBend, -size * 0.19, side * wingSpan, -size * 0.08);
    outerGrad.addColorStop(0, bodyColorDark);
    outerGrad.addColorStop(0.5, "#4a3a2a");
    outerGrad.addColorStop(1, "#3a2a1a");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(side * wingBend, -size * 0.19);
    ctx.quadraticCurveTo(side * (wingBend + wingSpan) * 0.55, -size * 0.22, side * wingSpan, -size * 0.1);
    ctx.lineTo(side * wingSpan * 0.95, size * 0.01);
    ctx.lineTo(side * wingBend, -size * 0.02);
    ctx.fill();

    // Iridescent sheen overlay
    const sheenAlpha = 0.08 + Math.sin(time * 3 + side * 2) * 0.04;
    const sheenG = ctx.createLinearGradient(side * wingBend * 0.5, -size * 0.1, side * wingSpan * 0.7, -size * 0.15);
    sheenG.addColorStop(0, `rgba(100,150,200,${sheenAlpha})`);
    sheenG.addColorStop(0.5, `rgba(150,100,200,${sheenAlpha * 0.7})`);
    sheenG.addColorStop(1, `rgba(100,200,150,${sheenAlpha * 0.4})`);
    ctx.fillStyle = sheenG;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.05, -size * 0.04);
    ctx.quadraticCurveTo(side * wingBend * 0.6, -size * 0.15, side * wingSpan * 0.7, -size * 0.1);
    ctx.lineTo(side * wingBend * 0.8, -size * 0.01);
    ctx.closePath();
    ctx.fill();

    // Individual covert feather rows (3 rows with increasing detail)
    for (let row = 0; row < 4; row++) {
      for (let f = 0; f < 7 - row; f++) {
        const fFrac = f / (7 - row);
        const rowOff = row * size * 0.022;
        const fx = side * (size * 0.03 + fFrac * wingBend * 0.85);
        const fy = -size * 0.04 - rowOff - fFrac * size * 0.09 + row * size * 0.005;
        ctx.fillStyle = row === 0 ? bodyColorDark : (row === 1 ? bodyColor : (row === 2 ? bodyColorLight : bodyColor));
        ctx.globalAlpha = 0.45 + row * 0.05;
        ctx.beginPath();
        ctx.ellipse(fx, fy, size * 0.007, size * 0.022, side * (0.2 + fFrac * 0.3), 0, TAU);
        ctx.fill();
        // Feather shaft line
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 0.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(fx, fy - size * 0.015);
        ctx.lineTo(fx, fy + size * 0.015);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Primary flight feathers with barb detail
    for (let pf = 0; pf < 7; pf++) {
      const pfFrac = pf / 7;
      const pfx = side * (wingBend + pfFrac * (wingSpan - wingBend));
      const pfy = -size * 0.18 + pfFrac * size * 0.09 + pf * size * 0.004;
      const pfLen = size * (0.055 - pfFrac * 0.01);
      const pfG = ctx.createLinearGradient(pfx, pfy - pfLen, pfx, pfy + pfLen);
      pfG.addColorStop(0, pf < 3 ? bodyColorDark : "#3a2a1a");
      pfG.addColorStop(1, "#2a1a0a");
      ctx.fillStyle = pfG;
      ctx.save();
      ctx.translate(pfx, pfy);
      ctx.rotate(side * (0.2 + pfFrac * 0.2));
      ctx.beginPath();
      ctx.moveTo(-size * 0.005, -pfLen);
      ctx.lineTo(size * 0.005, pfLen);
      ctx.lineTo(-size * 0.005, pfLen);
      ctx.fill();
      // Feather shaft
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -pfLen);
      ctx.lineTo(0, pfLen);
      ctx.stroke();
      // Barb lines on feather
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 0.2 * zoom;
      for (let b = 0; b < 4; b++) {
        const bby = -pfLen + b * pfLen * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, bby);
        ctx.lineTo(size * 0.004, bby + size * 0.008);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, bby);
        ctx.lineTo(-size * 0.004, bby + size * 0.008);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // Body with rich plumage detail
  const bodyGrad = ctx.createRadialGradient(x - size * 0.02, y - size * 0.06 + by, 0, x, y + by, size * 0.17);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.35, bodyColor);
  bodyGrad.addColorStop(0.7, bodyColorDark);
  bodyGrad.addColorStop(1, "#2a1a0a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.02 + by, size * 0.14, size * 0.18, 0.1 + bankTilt, 0, TAU);
  ctx.fill();

  // Breast plumage with layered feather scales
  const breastGrad = ctx.createRadialGradient(x, y + size * 0.02 + by, 0, x, y + size * 0.06 + by, size * 0.11);
  breastGrad.addColorStop(0, "#fff8e8");
  breastGrad.addColorStop(0.3, "#f5e6c8");
  breastGrad.addColorStop(0.7, "#e0c8a0");
  breastGrad.addColorStop(1, "#c8a878");
  ctx.fillStyle = breastGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.04 + by, size * 0.09, size * 0.11, 0, 0, TAU);
  ctx.fill();
  // Feather scale rows on breast
  ctx.strokeStyle = "rgba(180,150,100,0.15)";
  ctx.lineWidth = 0.4 * zoom;
  for (let fs = 0; fs < 7; fs++) {
    const fsy = y + size * 0.0 + fs * size * 0.018 + by;
    const fsWidth = size * 0.06 - Math.abs(fs - 3) * size * 0.008;
    ctx.beginPath();
    ctx.moveTo(x - fsWidth, fsy);
    ctx.quadraticCurveTo(x, fsy + size * 0.005, x + fsWidth, fsy);
    ctx.stroke();
  }
  // Individual breast feather marks
  ctx.fillStyle = "rgba(160,130,80,0.08)";
  for (let bf = 0; bf < 8; bf++) {
    const bfx = x + (bf - 3.5) * size * 0.018;
    const bfy = y + size * 0.02 + Math.sin(bf * 1.5) * size * 0.03 + by;
    ctx.beginPath();
    ctx.ellipse(bfx, bfy, size * 0.006, size * 0.01, bf * 0.3, 0, TAU);
    ctx.fill();
  }

  // Head with detailed crest feathers
  const headX = x;
  const headY2 = y - size * 0.2 + by;
  const headGrad = ctx.createRadialGradient(headX - size * 0.01, headY2 - size * 0.01, 0, headX, headY2, size * 0.08);
  headGrad.addColorStop(0, "#fffff0");
  headGrad.addColorStop(0.4, "#f5f0e0");
  headGrad.addColorStop(0.8, "#e0d8c0");
  headGrad.addColorStop(1, "#c8bea0");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY2, size * 0.08, size * 0.07, bankTilt * 0.5, 0, TAU);
  ctx.fill();

  // Crown feathers
  for (let cf = 0; cf < 5; cf++) {
    const cfAngle = -Math.PI * 0.6 + cf * 0.22;
    ctx.fillStyle = cf % 2 === 0 ? "#e0d0b0" : "#d0c0a0";
    ctx.save();
    ctx.translate(headX + Math.cos(cfAngle) * size * 0.045, headY2 + Math.sin(cfAngle) * size * 0.035);
    ctx.rotate(cfAngle - Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.004, -size * 0.03);
    ctx.lineTo(size * 0.004, -size * 0.03);
    ctx.fill();
    ctx.restore();
  }

  // Raptor beak with gradient detail
  const beakG = ctx.createLinearGradient(headX + size * 0.06, headY2 - size * 0.005, headX + size * 0.14, headY2 + size * 0.035);
  beakG.addColorStop(0, "#ecc040");
  beakG.addColorStop(0.3, "#e8b830");
  beakG.addColorStop(0.6, "#d4a020");
  beakG.addColorStop(1, "#906a10");
  ctx.fillStyle = beakG;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.06, headY2 + size * 0.003);
  ctx.quadraticCurveTo(headX + size * 0.11, headY2 + size * 0.008, headX + size * 0.14, headY2 + size * 0.032);
  ctx.quadraticCurveTo(headX + size * 0.12, headY2 + size * 0.04, headX + size * 0.06, headY2 + size * 0.042);
  ctx.closePath();
  ctx.fill();
  // Beak ridge line
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.065, headY2 + size * 0.01);
  ctx.quadraticCurveTo(headX + size * 0.1, headY2 + size * 0.015, headX + size * 0.13, headY2 + size * 0.03);
  ctx.stroke();
  // Nostril
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.075, headY2 + size * 0.015, size * 0.006, size * 0.004, 0, 0, TAU);
  ctx.fill();
  // Beak tip hook (darker, sharper)
  const hookG = ctx.createRadialGradient(headX + size * 0.135, headY2 + size * 0.035, 0, headX + size * 0.135, headY2 + size * 0.035, size * 0.01);
  hookG.addColorStop(0, "#8a6010");
  hookG.addColorStop(1, "#604008");
  ctx.fillStyle = hookG;
  ctx.beginPath();
  ctx.arc(headX + size * 0.135, headY2 + size * 0.035, size * 0.009, 0, TAU);
  ctx.fill();

  // Detailed fierce eye with iris layers
  setShadowBlur(ctx, 6 * zoom, "#ffaa00");
  const eyeX = headX + size * 0.03;
  const eyeY = headY2 - size * 0.01;
  // Sclera
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, size * 0.016, 0, TAU);
  ctx.fill();
  // Iris with gradient
  const irisG = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.013);
  irisG.addColorStop(0, "#ffdd00");
  irisG.addColorStop(0.3, "#ffcc00");
  irisG.addColorStop(0.6, "#dd9900");
  irisG.addColorStop(1, "#aa6600");
  ctx.fillStyle = irisG;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, size * 0.013, 0, TAU);
  ctx.fill();
  // Iris texture (radial lines)
  ctx.strokeStyle = "rgba(150,100,0,0.15)";
  ctx.lineWidth = 0.2 * zoom;
  for (let ir = 0; ir < 8; ir++) {
    const irAngle = ir * (TAU / 8);
    ctx.beginPath();
    ctx.moveTo(eyeX + Math.cos(irAngle) * size * 0.004, eyeY + Math.sin(irAngle) * size * 0.004);
    ctx.lineTo(eyeX + Math.cos(irAngle) * size * 0.012, eyeY + Math.sin(irAngle) * size * 0.012);
    ctx.stroke();
  }
  // Pupil
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(eyeX + size * 0.002, eyeY, size * 0.007, 0, TAU);
  ctx.fill();
  // Light catch (two spots)
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(eyeX - size * 0.004, eyeY - size * 0.004, size * 0.003, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.arc(eyeX + size * 0.004, eyeY + size * 0.003, size * 0.002, 0, TAU);
  ctx.fill();
  // Eye ring
  ctx.strokeStyle = "#886600";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, size * 0.016, 0, TAU);
  ctx.stroke();
  clearShadow(ctx);

  // Articulated talons with metallic gleam
  for (const side of [-1, 1]) {
    const talonY = y + size * 0.17 + by + (isAttacking ? dive * 0.5 : 0);
    const talonOpen = isAttacking ? attackPhase * 0.3 : 0;
    const tx = x + side * size * 0.05;
    // Leg with scaled texture
    const legG = ctx.createLinearGradient(tx, y + size * 0.1 + by, tx, talonY);
    legG.addColorStop(0, "#d4a020");
    legG.addColorStop(0.5, "#c89018");
    legG.addColorStop(1, "#b88010");
    ctx.strokeStyle = legG;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx, y + size * 0.1 + by);
    ctx.lineTo(tx, talonY);
    ctx.stroke();
    // Scales on leg
    for (let ls = 0; ls < 4; ls++) {
      const lsy = y + size * 0.11 + ls * size * 0.018 + by;
      ctx.strokeStyle = "rgba(160,120,20,0.25)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(tx - size * 0.009, lsy);
      ctx.quadraticCurveTo(tx, lsy + size * 0.003, tx + size * 0.009, lsy);
      ctx.stroke();
    }
    // Talon toes (4 toes: 3 front, 1 rear)
    const toeAngles = [-0.4 - talonOpen, 0, 0.4 + talonOpen, Math.PI - 0.3];
    for (let t = 0; t < 4; t++) {
      const tAngle = toeAngles[t];
      const toeLen = t === 3 ? size * 0.038 : size * 0.048;
      const toeEndX = tx + Math.cos(tAngle) * toeLen;
      const toeEndY = talonY + Math.abs(Math.sin(tAngle)) * toeLen * 0.5 + (t === 3 ? -size * 0.01 : size * 0.01);
      // Toe with gradient
      const toeG = ctx.createLinearGradient(tx, talonY, toeEndX, toeEndY);
      toeG.addColorStop(0, "#d4a020");
      toeG.addColorStop(1, "#c09018");
      ctx.strokeStyle = toeG;
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(tx, talonY);
      ctx.lineTo(toeEndX, toeEndY);
      ctx.stroke();
      // Toe scales
      ctx.strokeStyle = "rgba(140,100,20,0.15)";
      ctx.lineWidth = 0.3 * zoom;
      const midX = (tx + toeEndX) * 0.5;
      const midY = (talonY + toeEndY) * 0.5;
      ctx.beginPath();
      ctx.arc(midX, midY, size * 0.006, tAngle - 0.5, tAngle + 0.5);
      ctx.stroke();
      // Metallic claw with gleam
      const clawG = ctx.createLinearGradient(toeEndX, toeEndY, toeEndX + Math.cos(tAngle) * size * 0.018, toeEndY + size * 0.01);
      clawG.addColorStop(0, "#4a3a20");
      clawG.addColorStop(0.4, "#2a2010");
      clawG.addColorStop(0.8, "#1a1008");
      clawG.addColorStop(1, "#000");
      ctx.fillStyle = clawG;
      ctx.beginPath();
      ctx.moveTo(toeEndX, toeEndY);
      ctx.lineTo(toeEndX + Math.cos(tAngle) * size * 0.018, toeEndY + size * 0.01);
      ctx.lineTo(toeEndX + Math.cos(tAngle - 0.3) * size * 0.006, toeEndY - size * 0.004);
      ctx.fill();
      // Metallic shine on claw
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(toeEndX + Math.cos(tAngle) * size * 0.004, toeEndY + size * 0.002);
      ctx.lineTo(toeEndX + Math.cos(tAngle) * size * 0.012, toeEndY + size * 0.006);
      ctx.stroke();
    }
  }

  // Diving attack — speed lines + wind burst
  if (isAttacking && dive > size * 0.1) {
    const diveAlpha = attackPhase * 0.4;
    for (let l = 0; l < 6; l++) {
      const lx = x - size * 0.1 + l * size * 0.04;
      ctx.strokeStyle = `rgba(255,220,100,${diveAlpha * (1 - l * 0.12)})`;
      ctx.lineWidth = (2.5 - l * 0.3) * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, y - size * 0.25 + hover);
      ctx.lineTo(lx, y - size * 0.25 + hover - size * 0.18);
      ctx.stroke();
    }
    // Impact ring on ground
    const impactR = attackPhase * size * 0.28;
    ctx.strokeStyle = `rgba(255,220,150,${diveAlpha * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.35, impactR, impactR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,200,120,${diveAlpha * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.35, impactR * 1.3, impactR * 1.3 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }
}

// ============================================================================
// SWAMP REGION
// ============================================================================

// 6. SWAMP HYDRA — Three-headed serpent with independent head sway
export function drawSwampHydraEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.6;
  const breathPulse = 1 + Math.sin(time * 2) * 0.02;
  const lungeForward = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 0.15 : 0;

  // Swamp water ripples at base (isometric)
  ctx.save();
  ctx.translate(x, y + size * 0.4);
  ctx.scale(1, ISO_Y_RATIO);
  for (let ripple = 0; ripple < 3; ripple++) {
    const ripplePhase = (time * 0.8 + ripple * 0.7) % 2;
    const rippleR = size * (0.15 + ripplePhase * 0.2);
    const rippleAlpha = (1 - ripplePhase / 2) * 0.12;
    ctx.strokeStyle = `rgba(60,120,80,${rippleAlpha})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, rippleR, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // Ambient fog/mist floating near ground
  for (let fog = 0; fog < 10; fog++) {
    const fogPhase = (time * 0.3 + fog * 0.6) % 3;
    const fogX = x + Math.sin(fog * 1.9 + time * 0.4) * size * 0.45;
    const fogY = y + size * 0.3 + Math.cos(fog * 2.3) * size * 0.06 - fogPhase * size * 0.05;
    const fogAlpha = (1 - fogPhase / 3) * 0.08;
    if (fogAlpha > 0) {
      const fogGrad = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, size * 0.04);
      fogGrad.addColorStop(0, `rgba(120,180,100,${fogAlpha})`);
      fogGrad.addColorStop(1, `rgba(80,140,60,0)`);
      ctx.fillStyle = fogGrad;
      ctx.beginPath();
      ctx.arc(fogX, fogY, size * 0.04, 0, TAU);
      ctx.fill();
    }
  }

  // Poison mist ground (isometric, layered)
  ctx.save();
  ctx.translate(x, y + size * 0.35);
  ctx.scale(1, ISO_Y_RATIO);
  drawRadialAura(ctx, 0, 0, size * 0.55, [
    { offset: 0, color: "rgba(80,180,80,0.15)" },
    { offset: 0.3, color: "rgba(60,160,60,0.1)" },
    { offset: 0.6, color: "rgba(60,140,60,0.05)" },
    { offset: 1, color: "rgba(40,100,40,0)" },
  ]);
  ctx.restore();

  // Venom puddles on ground (enhanced with bubbles)
  for (let vp = 0; vp < 5; vp++) {
    const vpx = x + Math.sin(vp * 2.3 + 1) * size * 0.25;
    const vpy = y + size * 0.35 + Math.cos(vp * 1.7) * size * 0.06;
    const vpPulse = 0.08 + Math.sin(time + vp) * 0.03;
    const puddleGrad = ctx.createRadialGradient(vpx, vpy, 0, vpx, vpy, size * 0.05);
    puddleGrad.addColorStop(0, `rgba(80,220,50,${vpPulse + 0.05})`);
    puddleGrad.addColorStop(0.6, `rgba(80,200,50,${vpPulse})`);
    puddleGrad.addColorStop(1, `rgba(60,150,30,0)`);
    ctx.fillStyle = puddleGrad;
    ctx.beginPath();
    ctx.ellipse(vpx, vpy, size * 0.05 + Math.sin(time * 1.5 + vp) * size * 0.005, size * 0.018, vp * 0.5, 0, TAU);
    ctx.fill();
    const bubblePhase = (time * 2 + vp * 1.3) % 1;
    if (bubblePhase < 0.5) {
      ctx.fillStyle = `rgba(120,255,80,${(0.5 - bubblePhase) * 0.3})`;
      ctx.beginPath();
      ctx.arc(vpx + Math.sin(vp * 3) * size * 0.015, vpy - bubblePhase * size * 0.02, size * 0.004, 0, TAU);
      ctx.fill();
    }
  }

  // Regeneration aura (enhanced with double rings)
  const regenGlow = 0.3 + Math.sin(time * 2.5) * 0.2;
  setShadowBlur(ctx, 8 * zoom, `rgba(80,255,80,${regenGlow})`);
  ctx.strokeStyle = `rgba(80,255,80,${regenGlow * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.setLineDash([size * 0.03, size * 0.02]);
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.4, size * 0.35, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(120,255,120,${regenGlow * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.setLineDash([size * 0.015, size * 0.025]);
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.02, size * 0.32, size * 0.28, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  clearShadow(ctx);

  // Healing particles rising
  for (let hp = 0; hp < 4; hp++) {
    const hpPhase = (time * 1.2 + hp * 0.6) % 1.5;
    const hpX = x + Math.sin(hp * 2.5 + time * 0.5) * size * 0.15;
    const hpY = y + size * 0.1 - hpPhase * size * 0.3;
    const hpAlpha = (1 - hpPhase / 1.5) * 0.35;
    if (hpAlpha > 0) {
      setShadowBlur(ctx, 3 * zoom, `rgba(80,255,80,${hpAlpha})`);
      ctx.fillStyle = `rgba(80,255,80,${hpAlpha})`;
      ctx.beginPath();
      ctx.arc(hpX, hpY, size * 0.005 + Math.sin(time * 4 + hp) * size * 0.002, 0, TAU);
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // Coiling body base (more coils with individual scale detail)
  for (let coil = 0; coil < 6; coil++) {
    const coilX = x + Math.sin(time * 1.5 + coil * 1.4) * size * 0.045;
    const coilY = y + size * 0.22 - coil * size * 0.055;
    const coilW = size * (0.28 - coil * 0.018) * breathPulse;
    const coilH = size * (0.08 - coil * 0.004);
    const coilGrad = ctx.createLinearGradient(coilX - coilW, coilY, coilX + coilW, coilY);
    coilGrad.addColorStop(0, bodyColorDark);
    coilGrad.addColorStop(0.2, bodyColor);
    coilGrad.addColorStop(0.45, bodyColorLight);
    coilGrad.addColorStop(0.55, bodyColorLight);
    coilGrad.addColorStop(0.8, bodyColor);
    coilGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = coilGrad;
    ctx.beginPath();
    ctx.ellipse(coilX, coilY, coilW, coilH, coil * 0.12, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,30,0,0.1)";
    ctx.lineWidth = 0.5 * zoom;
    for (let sr = 0; sr < 12; sr++) {
      const srAngle = sr * (TAU / 12) + coil * 0.35;
      const srx = coilX + Math.cos(srAngle) * coilW * 0.75;
      const sry = coilY + Math.sin(srAngle) * coilH * 0.65;
      ctx.beginPath();
      ctx.arc(srx, sry, size * 0.01, srAngle - 0.4, srAngle + 0.4);
      ctx.stroke();
      ctx.fillStyle = `rgba(180,220,160,${0.05 + Math.sin(srAngle) * 0.03})`;
      ctx.beginPath();
      ctx.arc(srx, sry, size * 0.006, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(40,80,30,0.2)";
    ctx.beginPath();
    ctx.ellipse(coilX, coilY - coilH * 0.7, coilW * 0.6, size * 0.004, coil * 0.12, 0, TAU);
    ctx.fill();
  }

  // Belly ridge (lighter underside with crosshatch)
  const bellyGrad = ctx.createRadialGradient(x, y + size * 0.14, 0, x, y + size * 0.14, size * 0.18);
  bellyGrad.addColorStop(0, "rgba(200,220,160,0.18)");
  bellyGrad.addColorStop(0.6, "rgba(180,200,140,0.1)");
  bellyGrad.addColorStop(1, "rgba(160,180,120,0)");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.14, size * 0.18, size * 0.07, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(140,170,100,0.08)";
  ctx.lineWidth = 0.4 * zoom;
  for (let bs = 0; bs < 6; bs++) {
    const bsx = x - size * 0.1 + bs * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(bsx, y + size * 0.09);
    ctx.lineTo(bsx + size * 0.02, y + size * 0.19);
    ctx.stroke();
  }

  // Three necks and heads
  const headOffsets = [
    { angle: -0.4, timeOff: 0, neckLen: 0.42, hornAngle: -0.5 },
    { angle: 0, timeOff: 1.2, neckLen: 0.48, hornAngle: 0 },
    { angle: 0.4, timeOff: 2.4, neckLen: 0.42, hornAngle: 0.5 },
  ];

  // Webbed frills between outer necks and center neck
  for (let fi = 0; fi < 2; fi++) {
    const leftHead = headOffsets[fi];
    const rightHead = headOffsets[fi + 1];
    const lSway = Math.sin(time * 2.5 + leftHead.timeOff) * 0.2;
    const rSway = Math.sin(time * 2.5 + rightHead.timeOff) * 0.2;
    const lAngle = leftHead.angle + lSway;
    const rAngle = rightHead.angle + rSway;
    const lLen = size * leftHead.neckLen * 0.5;
    const rLen = size * rightHead.neckLen * 0.5;
    const lx = x + Math.sin(lAngle) * lLen;
    const ly = y - size * 0.1 - Math.cos(lAngle) * lLen * 0.8;
    const rx = x + Math.sin(rAngle) * rLen;
    const ry = y - size * 0.1 - Math.cos(rAngle) * rLen * 0.8;
    const membraneAlpha = 0.06 + Math.sin(time * 1.5 + fi) * 0.02;
    ctx.fillStyle = `rgba(80,160,60,${membraneAlpha})`;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.05);
    ctx.quadraticCurveTo((lx + x) / 2, (ly + y - size * 0.05) / 2 - size * 0.02, lx, ly);
    ctx.lineTo(rx, ry);
    ctx.quadraticCurveTo((rx + x) / 2, (ry + y - size * 0.05) / 2 - size * 0.02, x, y - size * 0.05);
    ctx.fill();
    ctx.strokeStyle = `rgba(60,120,40,${membraneAlpha * 1.5})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.05);
    ctx.lineTo((lx + rx) / 2, (ly + ry) / 2);
    ctx.stroke();
  }

  for (let hi = 0; hi < headOffsets.length; hi++) {
    const head = headOffsets[hi];
    const neckSway = Math.sin(time * 2.5 + head.timeOff) * 0.2;
    const headAngle = head.angle + neckSway;
    const neckLen = size * head.neckLen;
    const headLunge = lungeForward * Math.cos(head.angle);

    const neckEndX = x + Math.sin(headAngle) * neckLen + headLunge;
    const neckEndY = y - size * 0.1 - Math.cos(headAngle) * neckLen * 0.8;
    const neckMidX = x + Math.sin(headAngle * 0.5) * neckLen * 0.5;
    const neckMidY = y - Math.cos(headAngle * 0.5) * neckLen * 0.4;

    // Neck shadow on ground
    ctx.fillStyle = "rgba(0,0,0,0.04)";
    ctx.beginPath();
    ctx.ellipse(x + Math.sin(headAngle) * neckLen * 0.3, y + size * 0.35, size * 0.06, size * 0.015, headAngle * 0.3, 0, TAU);
    ctx.fill();

    // Neck (thick with multi-stop gradient)
    const neckGrad = ctx.createLinearGradient(x, y - size * 0.05, neckEndX, neckEndY);
    neckGrad.addColorStop(0, bodyColor);
    neckGrad.addColorStop(0.3, bodyColorDark);
    neckGrad.addColorStop(0.6, bodyColor);
    neckGrad.addColorStop(1, bodyColorLight);
    ctx.strokeStyle = neckGrad;
    ctx.lineWidth = size * 0.07;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.05);
    ctx.quadraticCurveTo(neckMidX, neckMidY, neckEndX, neckEndY);
    ctx.stroke();

    // Neck belly stripe (lighter, wider)
    ctx.strokeStyle = bodyColorLight;
    ctx.lineWidth = size * 0.028;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.05);
    ctx.quadraticCurveTo(neckMidX + size * 0.015, neckMidY + size * 0.008, neckEndX + size * 0.012, neckEndY);
    ctx.stroke();

    // Dorsal ridge along neck
    ctx.strokeStyle = "rgba(30,60,20,0.25)";
    ctx.lineWidth = size * 0.008;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.05);
    ctx.quadraticCurveTo(neckMidX - size * 0.015, neckMidY - size * 0.012, neckEndX - size * 0.01, neckEndY - size * 0.02);
    ctx.stroke();

    // Dorsal spikes along ridge
    for (let ds = 0; ds < 5; ds++) {
      const dt = (ds + 1) / 6;
      const dsx = x * (1 - dt) + neckEndX * dt;
      const dsy = (y - size * 0.05) * (1 - dt) + (neckEndY - size * 0.02) * dt;
      const perpAngle = headAngle - Math.PI * 0.5;
      const spikeLen = size * 0.012 * (1 - dt * 0.3);
      ctx.fillStyle = "rgba(50,80,30,0.3)";
      ctx.beginPath();
      ctx.moveTo(dsx, dsy);
      ctx.lineTo(dsx + Math.cos(perpAngle) * spikeLen, dsy + Math.sin(perpAngle) * spikeLen);
      ctx.lineTo(dsx + Math.cos(headAngle) * size * 0.005, dsy + Math.sin(headAngle) * size * 0.005);
      ctx.fill();
    }

    // Scale segments along neck (more detailed)
    const neckSegs = 8;
    for (let ns = 1; ns < neckSegs; ns++) {
      const nt = ns / neckSegs;
      const nsx = x * (1 - nt) + neckEndX * nt;
      const nsy = (y - size * 0.05) * (1 - nt) + neckEndY * nt;
      ctx.strokeStyle = "rgba(0,20,0,0.1)";
      ctx.lineWidth = 0.5 * zoom;
      const perpAngle = headAngle + Math.PI * 0.5;
      const segWidth = size * (0.03 + (1 - nt) * 0.008);
      ctx.beginPath();
      ctx.moveTo(nsx + Math.cos(perpAngle) * segWidth, nsy + Math.sin(perpAngle) * segWidth);
      ctx.lineTo(nsx - Math.cos(perpAngle) * segWidth, nsy - Math.sin(perpAngle) * segWidth);
      ctx.stroke();
      for (let sc = -1; sc <= 1; sc += 2) {
        ctx.fillStyle = `rgba(100,140,80,${0.06 + Math.sin(ns * 2 + sc) * 0.02})`;
        ctx.beginPath();
        ctx.ellipse(nsx + Math.cos(perpAngle) * segWidth * 0.4 * sc, nsy + Math.sin(perpAngle) * segWidth * 0.4 * sc, size * 0.007, size * 0.004, headAngle, 0, TAU);
        ctx.fill();
      }
    }

    // Head (with jaw articulation)
    const jawOpen2 = isAttacking ? attackPhase * 0.06 : 0.015 + Math.sin(time * 3 + head.timeOff) * 0.005;

    // Glowing throat when attacking
    if (isAttacking && attackPhase > 0.2) {
      const throatGlow = (attackPhase - 0.2) * 1.25;
      const throatGrad = ctx.createRadialGradient(neckEndX, neckEndY + size * 0.02, 0, neckEndX, neckEndY + size * 0.02, size * 0.06);
      throatGrad.addColorStop(0, `rgba(180,255,50,${throatGlow * 0.4})`);
      throatGrad.addColorStop(0.5, `rgba(120,220,40,${throatGlow * 0.2})`);
      throatGrad.addColorStop(1, `rgba(80,180,30,0)`);
      setShadowBlur(ctx, 6 * zoom, `rgba(150,255,50,${throatGlow * 0.5})`);
      ctx.fillStyle = throatGrad;
      ctx.beginPath();
      ctx.ellipse(neckEndX, neckEndY + size * 0.02, size * 0.05, size * 0.035, headAngle * 0.3, 0, TAU);
      ctx.fill();
      clearShadow(ctx);
    }

    // Upper head
    const headGrad = ctx.createRadialGradient(neckEndX - size * 0.01, neckEndY - size * 0.015, 0, neckEndX, neckEndY, size * 0.08);
    headGrad.addColorStop(0, bodyColorLight);
    headGrad.addColorStop(0.3, bodyColor);
    headGrad.addColorStop(0.7, bodyColorDark);
    headGrad.addColorStop(1, "#0a2a0a");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(neckEndX, neckEndY - size * jawOpen2 * 0.3, size * 0.08, size * 0.06, headAngle * 0.5, 0, TAU);
    ctx.fill();

    // Head scale texture
    for (let hs = 0; hs < 6; hs++) {
      const hsAngle = hs * (TAU / 6) + headAngle;
      const hsX = neckEndX + Math.cos(hsAngle) * size * 0.05;
      const hsY = neckEndY - size * jawOpen2 * 0.3 + Math.sin(hsAngle) * size * 0.035;
      ctx.fillStyle = "rgba(60,100,40,0.08)";
      ctx.beginPath();
      ctx.ellipse(hsX, hsY, size * 0.01, size * 0.006, hsAngle, 0, TAU);
      ctx.fill();
    }

    // Snout with nostrils
    const snoutX = neckEndX + Math.sin(headAngle) * size * 0.065;
    const snoutY = neckEndY - Math.cos(headAngle) * size * 0.03 - size * jawOpen2 * 0.2;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(snoutX, snoutY, size * 0.045, size * 0.028, headAngle * 0.5, 0, TAU);
    ctx.fill();

    for (const ns of [-1, 1]) {
      ctx.fillStyle = "rgba(20,40,10,0.4)";
      ctx.beginPath();
      ctx.ellipse(snoutX + ns * size * 0.015 * Math.cos(headAngle), snoutY + ns * size * 0.008 * Math.sin(headAngle), size * 0.005, size * 0.003, headAngle * 0.5, 0, TAU);
      ctx.fill();
      const smokePhase = (time * 2 + ns + head.timeOff) % 1;
      ctx.fillStyle = `rgba(100,180,60,${(1 - smokePhase) * 0.1})`;
      ctx.beginPath();
      ctx.arc(snoutX + ns * size * 0.015 * Math.cos(headAngle), snoutY - smokePhase * size * 0.02, size * 0.003, 0, TAU);
      ctx.fill();
    }

    // Lower jaw
    const jawGrad = ctx.createLinearGradient(snoutX - size * 0.03, snoutY, snoutX + size * 0.03, snoutY + size * jawOpen2 * 3);
    jawGrad.addColorStop(0, bodyColorDark);
    jawGrad.addColorStop(1, "#0a1a0a");
    ctx.fillStyle = jawGrad;
    ctx.beginPath();
    ctx.ellipse(snoutX, snoutY + size * jawOpen2 * 3, size * 0.04, size * 0.022, headAngle * 0.5, 0, TAU);
    ctx.fill();

    // Mouth interior when open
    if (jawOpen2 > 0.02) {
      ctx.fillStyle = `rgba(120,30,40,${Math.min(jawOpen2 * 8, 0.6)})`;
      ctx.beginPath();
      ctx.ellipse(snoutX, snoutY + size * jawOpen2 * 1.5, size * 0.03, size * 0.015, headAngle * 0.5, 0, TAU);
      ctx.fill();
    }

    // Teeth (more, with gradients)
    for (let t = 0; t < 5; t++) {
      const toothX = snoutX + (t - 2) * size * 0.01 * Math.cos(headAngle * 0.3);
      const toothLen = size * 0.015 * (isAttacking ? attackPhase : 0.4) * (1 + (t === 2 ? 0.3 : 0));
      const toothGrad = ctx.createLinearGradient(toothX, snoutY + size * 0.005, toothX, snoutY + size * 0.005 + toothLen);
      toothGrad.addColorStop(0, "#f5f0e0");
      toothGrad.addColorStop(1, "#c8b898");
      ctx.fillStyle = toothGrad;
      ctx.beginPath();
      ctx.moveTo(toothX - size * 0.003, snoutY + size * 0.005);
      ctx.lineTo(toothX, snoutY + size * 0.005 + toothLen);
      ctx.lineTo(toothX + size * 0.003, snoutY + size * 0.005);
      ctx.fill();
    }

    // Lower teeth
    if (jawOpen2 > 0.02) {
      for (let lt = 0; lt < 3; lt++) {
        const ltX = snoutX + (lt - 1) * size * 0.012;
        const ltY = snoutY + size * jawOpen2 * 3 - size * 0.002;
        ctx.fillStyle = "#e8dcc0";
        ctx.beginPath();
        ctx.moveTo(ltX - size * 0.002, ltY);
        ctx.lineTo(ltX, ltY - size * 0.008);
        ctx.lineTo(ltX + size * 0.002, ltY);
        ctx.fill();
      }
    }

    // Head horns/spikes (enhanced with gradient)
    for (let h = 0; h < 4; h++) {
      const hAngle = headAngle * 0.5 - 0.5 + h * 0.35 + head.hornAngle * 0.3;
      const hLen = size * (0.028 + h * 0.005);
      const hornBase = size * 0.045;
      const hornGrad = ctx.createLinearGradient(
        neckEndX + Math.cos(hAngle) * hornBase, neckEndY + Math.sin(hAngle) * size * 0.03 - size * jawOpen2 * 0.3,
        neckEndX + Math.cos(hAngle) * (hornBase + hLen), neckEndY + Math.sin(hAngle) * (size * 0.03 + hLen) - size * jawOpen2 * 0.3,
      );
      hornGrad.addColorStop(0, bodyColorDark);
      hornGrad.addColorStop(0.5, "#2a1a08");
      hornGrad.addColorStop(1, "#1a0a04");
      ctx.fillStyle = hornGrad;
      ctx.beginPath();
      ctx.moveTo(neckEndX + Math.cos(hAngle) * hornBase, neckEndY + Math.sin(hAngle) * size * 0.03 - size * jawOpen2 * 0.3);
      ctx.lineTo(neckEndX + Math.cos(hAngle) * (hornBase + hLen), neckEndY + Math.sin(hAngle) * (size * 0.03 + hLen) - size * jawOpen2 * 0.3);
      ctx.lineTo(neckEndX + Math.cos(hAngle + 0.15) * hornBase, neckEndY + Math.sin(hAngle + 0.15) * size * 0.03 - size * jawOpen2 * 0.3);
      ctx.fill();
    }

    // Frill/crest behind head
    for (let fr = 0; fr < 5; fr++) {
      const frAngle = headAngle * 0.5 - 0.6 + fr * 0.3;
      const frLen = size * (0.02 + Math.sin(time * 2 + fr + head.timeOff) * 0.005);
      ctx.fillStyle = `rgba(80,180,60,${0.15 + Math.sin(time * 2 + fr) * 0.05})`;
      ctx.beginPath();
      ctx.moveTo(neckEndX + Math.cos(frAngle) * size * 0.06, neckEndY + Math.sin(frAngle) * size * 0.04 - size * jawOpen2 * 0.3);
      ctx.lineTo(neckEndX + Math.cos(frAngle) * (size * 0.06 + frLen), neckEndY + Math.sin(frAngle) * (size * 0.04 + frLen * 0.6) - size * jawOpen2 * 0.3);
      ctx.lineTo(neckEndX + Math.cos(frAngle + 0.2) * size * 0.06, neckEndY + Math.sin(frAngle + 0.2) * size * 0.04 - size * jawOpen2 * 0.3);
      ctx.fill();
    }

    // Eyes (detailed with iris, reflection, eyelid)
    setShadowBlur(ctx, 6 * zoom, "#44ff44");
    for (const side of [-1, 1]) {
      const eyeX = neckEndX + side * size * 0.035 * Math.cos(headAngle);
      const eyeY = neckEndY - size * 0.025 + side * size * 0.008 * Math.sin(headAngle) - size * jawOpen2 * 0.3;
      ctx.fillStyle = "rgba(20,40,10,0.3)";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.016, size * 0.013, headAngle * 0.3, 0, TAU);
      ctx.fill();
      const eyeGrad = ctx.createRadialGradient(eyeX - size * 0.003, eyeY - size * 0.003, 0, eyeX, eyeY, size * 0.013);
      eyeGrad.addColorStop(0, "#ccffcc");
      eyeGrad.addColorStop(0.3, "#aaffaa");
      eyeGrad.addColorStop(0.6, "#44ff44");
      eyeGrad.addColorStop(1, "#228822");
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, size * 0.013, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#001a00";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.003, size * 0.009, headAngle * 0.3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.arc(eyeX - size * 0.004, eyeY - size * 0.004, size * 0.004, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(eyeX + size * 0.003, eyeY + size * 0.003, size * 0.002, 0, TAU);
      ctx.fill();
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY - size * 0.008, size * 0.014, size * 0.006, headAngle * 0.3, 0, Math.PI);
      ctx.fill();
    }
    clearShadow(ctx);

    // Dripping venom (more particles, detailed drips)
    for (let v = 0; v < 4; v++) {
      const vPhase = (time * 1.5 + head.timeOff + v * 0.35) % 1;
      const vx = snoutX + (v - 1.5) * size * 0.008;
      const vy = snoutY + size * jawOpen2 * 3 + size * 0.012 + vPhase * size * 0.14;
      const vAlpha = (1 - vPhase) * 0.55;
      ctx.fillStyle = `rgba(100,255,50,${vAlpha})`;
      ctx.beginPath();
      ctx.ellipse(vx, vy, size * 0.004, size * 0.012 * (1 - vPhase), 0, 0, TAU);
      ctx.fill();
      if (vPhase > 0.1) {
        ctx.strokeStyle = `rgba(100,255,50,${vAlpha * 0.3})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(vx, vy - size * 0.015);
        ctx.lineTo(vx, vy);
        ctx.stroke();
      }
      if (vPhase > 0.85) {
        const splashA = (vPhase - 0.85) * 6.67;
        ctx.fillStyle = `rgba(100,255,50,${(1 - splashA) * 0.3})`;
        for (let sp = 0; sp < 3; sp++) {
          ctx.beginPath();
          ctx.arc(vx + (sp - 1) * size * 0.006, vy + size * 0.005, size * 0.003 * splashA, 0, TAU);
          ctx.fill();
        }
      }
    }

    // Acid spray during attack (enhanced)
    if (isAttacking && attackPhase > 0.3) {
      const sprayAlpha = (attackPhase - 0.3) * 1.4;
      setShadowBlur(ctx, 4 * zoom, `rgba(100,255,50,${sprayAlpha * 0.4})`);
      for (let sp = 0; sp < 8; sp++) {
        const spDist = sprayAlpha * size * 0.18 * (1 + sp * 0.12);
        const spAngle = headAngle + Math.sin(time * 8 + sp * 1.2) * 0.35;
        const spx = snoutX + Math.sin(spAngle) * spDist;
        const spy = snoutY - Math.cos(spAngle) * spDist * 0.6;
        const spSize = size * 0.01 * (1 - sp * 0.08);
        ctx.fillStyle = `rgba(100,255,50,${sprayAlpha * 0.35 * (1 - sp * 0.1)})`;
        ctx.beginPath();
        ctx.arc(spx, spy, spSize, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(120,220,80,${sprayAlpha * 0.1 * (1 - sp * 0.1)})`;
        ctx.beginPath();
        ctx.arc(spx + Math.sin(time * 6 + sp) * size * 0.01, spy + Math.cos(time * 5 + sp) * size * 0.008, spSize * 1.5, 0, TAU);
        ctx.fill();
      }
      clearShadow(ctx);
    }
  }

  // Ground shadow (isometric)
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.38, size * 0.3, size * 0.06 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  ctx.lineCap = "butt";
}

// 7. GIANT TOAD — Huge bloated toad with inflating throat sac
export function drawGiantToadEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.35;
  const inflate = 0.5 + Math.sin(time * 2) * 0.3;
  const hop = Math.max(0, Math.sin(time * 4)) * size * 0.04;
  const tongueOut = isAttacking ? attackPhase : 0;
  const croakVibrate = Math.sin(time * 15) * size * 0.003 * inflate;

  // Fly/insect ambient particles
  for (let fly = 0; fly < 6; fly++) {
    const flyOrbit = time * (2 + fly * 0.3) + fly * TAU / 6;
    const flyDist = size * (0.3 + Math.sin(time * 1.5 + fly) * 0.08);
    const flyX = x + Math.cos(flyOrbit) * flyDist;
    const flyY = y - size * 0.1 + Math.sin(flyOrbit * 0.7) * flyDist * 0.3 + Math.sin(time * 4 + fly) * size * 0.02;
    const flyAlpha = 0.4 + Math.sin(time * 6 + fly) * 0.15;
    ctx.fillStyle = `rgba(30,30,20,${flyAlpha})`;
    ctx.beginPath();
    ctx.arc(flyX, flyY, size * 0.004, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(180,180,200,${flyAlpha * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(flyX - size * 0.003, flyY - size * 0.002, size * 0.005, size * 0.002, Math.sin(time * 20 + fly) * 0.3, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(flyX + size * 0.003, flyY - size * 0.002, size * 0.005, size * 0.002, -Math.sin(time * 20 + fly) * 0.3, 0, TAU);
    ctx.fill();
  }

  // Poison mist particles (enhanced)
  for (let m = 0; m < 10; m++) {
    const mPhase = (time * 0.5 + m * 0.14) % 1.2;
    const mx = x + Math.cos(m * 1.8 + time) * size * 0.35;
    const my = y + size * 0.25 - mPhase * size * 0.35;
    const mAlpha = (1 - mPhase / 1.2) * 0.12;
    if (mAlpha > 0) {
      const mistGrad = ctx.createRadialGradient(mx, my, 0, mx, my, size * (0.025 + mPhase * 0.02));
      mistGrad.addColorStop(0, `rgba(80,180,60,${mAlpha * 1.5})`);
      mistGrad.addColorStop(1, `rgba(60,140,40,0)`);
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.arc(mx, my, size * (0.025 + mPhase * 0.02), 0, TAU);
      ctx.fill();
    }
  }

  // Toxic puddle trail (enhanced with gradient)
  const puddleGrad = ctx.createRadialGradient(x - size * 0.05, y + size * 0.35, 0, x - size * 0.05, y + size * 0.35, size * 0.25);
  puddleGrad.addColorStop(0, "rgba(60,160,40,0.12)");
  puddleGrad.addColorStop(0.6, "rgba(60,140,40,0.06)");
  puddleGrad.addColorStop(1, "rgba(40,100,20,0)");
  ctx.fillStyle = puddleGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y + size * 0.35, size * 0.25, size * 0.06 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Mud splatter on ground from hopping
  for (let ms = 0; ms < 5; ms++) {
    const msAngle = ms * TAU / 5 + 0.3;
    const msDist = size * (0.22 + Math.sin(ms * 2.1) * 0.05);
    const msx = x + Math.cos(msAngle) * msDist;
    const msy = y + size * 0.35 + Math.sin(msAngle) * msDist * ISO_Y_RATIO * 0.3;
    ctx.fillStyle = `rgba(70,50,25,${0.06 + Math.sin(ms) * 0.02})`;
    ctx.beginPath();
    ctx.ellipse(msx, msy, size * 0.02 + Math.sin(ms * 1.5) * size * 0.008, size * 0.008, msAngle, 0, TAU);
    ctx.fill();
  }

  // Landing splash (when hopping)
  const landPhase = Math.max(0, -Math.sin(time * 4));
  if (landPhase > 0.8 && hop < size * 0.005) {
    const splashI = (landPhase - 0.8) * 5;
    for (let sl = 0; sl < 6; sl++) {
      const slAngle = sl * TAU / 6;
      const slDist = size * 0.15 * splashI;
      ctx.fillStyle = `rgba(70,50,25,${(1 - splashI) * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(slAngle) * slDist, y + size * 0.35 + Math.sin(slAngle) * slDist * 0.3, size * 0.01, size * 0.006, slAngle, 0, TAU);
      ctx.fill();
    }
  }

  // Articulated back legs (muscular, enhanced)
  for (const side of [-1, 1]) {
    const legTuck = hop > size * 0.02 ? 0.3 : 0;
    const hipX = x + side * size * 0.22;
    const hipY2 = y + size * 0.12 - hop;
    const kneeX = hipX + side * size * 0.06;
    const kneeY = hipY2 + size * 0.1 + legTuck * size * 0.03;
    const thighGrad = ctx.createLinearGradient(hipX, hipY2, kneeX, kneeY);
    thighGrad.addColorStop(0, bodyColor);
    thighGrad.addColorStop(0.5, bodyColorLight);
    thighGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = thighGrad;
    ctx.beginPath();
    ctx.moveTo(hipX - size * 0.055, hipY2);
    ctx.quadraticCurveTo(hipX + side * size * 0.02, hipY2 + size * 0.05, kneeX - size * 0.04, kneeY);
    ctx.lineTo(kneeX + size * 0.04, kneeY);
    ctx.quadraticCurveTo(hipX - side * size * 0.01, hipY2 + size * 0.05, hipX + size * 0.055, hipY2);
    ctx.fill();
    ctx.fillStyle = "rgba(180,210,120,0.1)";
    ctx.beginPath();
    ctx.ellipse((hipX + kneeX) / 2 + side * size * 0.01, (hipY2 + kneeY) / 2, size * 0.03, size * 0.015, side * 0.3, 0, TAU);
    ctx.fill();
    const kneeGrad = ctx.createRadialGradient(kneeX, kneeY, 0, kneeX, kneeY, size * 0.035);
    kneeGrad.addColorStop(0, bodyColor);
    kneeGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = kneeGrad;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, size * 0.035, 0, TAU);
    ctx.fill();
    const footX = kneeX + side * size * 0.04;
    const footY = kneeY + size * 0.1 - legTuck * size * 0.02;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(kneeX - size * 0.03, kneeY);
    ctx.lineTo(footX - size * 0.025, footY);
    ctx.lineTo(footX + size * 0.025, footY);
    ctx.lineTo(kneeX + size * 0.03, kneeY);
    ctx.fill();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(footX + side * size * 0.02, footY + size * 0.01, size * 0.06, size * 0.02, side * 0.2, 0, TAU);
    ctx.fill();
    for (let t = 0; t < 4; t++) {
      const toeAngle = (t - 1.5) * 0.3 + side * 0.2;
      const toeBaseX = footX + side * size * 0.02;
      const toeBaseY = footY + size * 0.01;
      const toeMidX = toeBaseX + Math.cos(toeAngle) * size * 0.03;
      const toeMidY = toeBaseY + Math.sin(toeAngle) * size * 0.012;
      const toeTipX = toeBaseX + Math.cos(toeAngle) * size * 0.055;
      const toeTipY = toeBaseY + Math.sin(toeAngle) * size * 0.022;
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = size * 0.008;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(toeBaseX, toeBaseY);
      ctx.lineTo(toeMidX, toeMidY);
      ctx.lineTo(toeTipX, toeTipY);
      ctx.stroke();
      const padGrad = ctx.createRadialGradient(toeTipX, toeTipY, 0, toeTipX, toeTipY, size * 0.008);
      padGrad.addColorStop(0, bodyColorLight);
      padGrad.addColorStop(1, bodyColorDark);
      ctx.fillStyle = padGrad;
      ctx.beginPath();
      ctx.arc(toeTipX, toeTipY, size * 0.008, 0, TAU);
      ctx.fill();
      if (t < 3) {
        const nextAngle = (t - 0.5) * 0.3 + side * 0.2;
        const ntMidX = toeBaseX + Math.cos(nextAngle) * size * 0.03;
        const ntMidY = toeBaseY + Math.sin(nextAngle) * size * 0.012;
        ctx.fillStyle = `rgba(100,160,60,${0.12 + Math.sin(time + t) * 0.03})`;
        ctx.beginPath();
        ctx.moveTo(toeBaseX, toeBaseY);
        ctx.lineTo(toeMidX, toeMidY);
        ctx.quadraticCurveTo((toeMidX + ntMidX) / 2, (toeMidY + ntMidY) / 2 + size * 0.005, ntMidX, ntMidY);
        ctx.lineTo(toeBaseX, toeBaseY);
        ctx.fill();
      }
    }
    ctx.lineCap = "butt";
  }

  // Front legs (smaller, with more detail)
  for (const side of [-1, 1]) {
    const fLegSwing = Math.sin(time * 4 + side) * size * 0.015;
    const flx = x + side * size * 0.2;
    const fly = y + size * 0.18 - hop;
    const fArmGrad = ctx.createLinearGradient(flx, fly - size * 0.04, flx, fly + size * 0.04);
    fArmGrad.addColorStop(0, bodyColor);
    fArmGrad.addColorStop(0.5, bodyColorLight);
    fArmGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = fArmGrad;
    ctx.beginPath();
    ctx.ellipse(flx, fly, size * 0.04, size * 0.08, side * 0.25, 0, TAU);
    ctx.fill();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(flx + side * size * 0.03 + fLegSwing, fly + size * 0.07, size * 0.035, size * 0.015, side * 0.2, 0, TAU);
    ctx.fill();
    for (let ft = 0; ft < 3; ft++) {
      const ftAngle = (ft - 1) * 0.35 + side * 0.2;
      const ftX = flx + side * size * 0.03 + fLegSwing + Math.cos(ftAngle) * size * 0.03;
      const ftY = fly + size * 0.07 + Math.sin(ftAngle) * size * 0.012;
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.arc(ftX, ftY, size * 0.006, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(120,160,80,0.2)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(ftX, ftY, size * 0.004, 0, TAU);
      ctx.stroke();
    }
  }

  // Main bloated body (enhanced)
  const bodyGrad = ctx.createRadialGradient(x - size * 0.05, y - size * 0.04 - hop, 0, x, y + size * 0.05 - hop, size * 0.35);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.25, bodyColor);
  bodyGrad.addColorStop(0.55, bodyColorDark);
  bodyGrad.addColorStop(0.8, "#1a3a1a");
  bodyGrad.addColorStop(1, "#0a2a0a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x + croakVibrate, y + size * 0.02 - hop, size * 0.32, size * 0.25, 0, 0, TAU);
  ctx.fill();

  // Moisture sheen (specular highlight)
  const sheenGrad = ctx.createRadialGradient(x - size * 0.1, y - size * 0.08 - hop, 0, x - size * 0.08, y - size * 0.06 - hop, size * 0.12);
  sheenGrad.addColorStop(0, "rgba(255,255,255,0.12)");
  sheenGrad.addColorStop(0.5, "rgba(220,240,200,0.06)");
  sheenGrad.addColorStop(1, "rgba(200,220,180,0)");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.06 - hop, size * 0.12, size * 0.08, -0.3, 0, TAU);
  ctx.fill();

  // Warty skin (enhanced with moisture dots)
  for (let w = 0; w < 32; w++) {
    const wAngle = w * (TAU / 32) + 0.3;
    const wDist = size * (0.18 + Math.sin(w * 3.1) * 0.07);
    const wx = x + Math.cos(wAngle) * wDist + croakVibrate;
    const wy = y + size * 0.02 - hop + Math.sin(wAngle) * wDist * 0.7;
    const wSize = size * (0.007 + Math.sin(w * 1.7) * 0.005);
    const wartGrad = ctx.createRadialGradient(wx - wSize * 0.3, wy - wSize * 0.3, 0, wx, wy, wSize * 1.2);
    wartGrad.addColorStop(0, "rgba(100,150,60,0.3)");
    wartGrad.addColorStop(0.5, "rgba(80,130,50,0.2)");
    wartGrad.addColorStop(1, "rgba(40,80,25,0)");
    ctx.fillStyle = wartGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, wSize, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.arc(wx - wSize * 0.3, wy - wSize * 0.4, wSize * 0.3, 0, TAU);
    ctx.fill();
  }

  // Poison gland bumps (glowing, along spine)
  for (let pg = 0; pg < 5; pg++) {
    const pgAngle = -Math.PI * 0.5 + (pg - 2) * 0.25;
    const pgDist = size * 0.24;
    const pgX = x + Math.cos(pgAngle) * pgDist * 0.8 + croakVibrate;
    const pgY = y + size * 0.02 - hop + Math.sin(pgAngle) * pgDist * 0.6;
    const pgGlow = 0.3 + Math.sin(time * 2.5 + pg * 0.8) * 0.2;
    setShadowBlur(ctx, 3 * zoom, `rgba(120,255,60,${pgGlow})`);
    const pgGrad = ctx.createRadialGradient(pgX, pgY, 0, pgX, pgY, size * 0.012);
    pgGrad.addColorStop(0, `rgba(150,255,80,${pgGlow + 0.1})`);
    pgGrad.addColorStop(0.5, `rgba(100,200,50,${pgGlow})`);
    pgGrad.addColorStop(1, `rgba(60,150,30,0)`);
    ctx.fillStyle = pgGrad;
    ctx.beginPath();
    ctx.arc(pgX, pgY, size * 0.012, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Belly (lighter, patterned underside)
  const bellyGradT = ctx.createRadialGradient(x, y + size * 0.08 - hop, 0, x, y + size * 0.1 - hop, size * 0.2);
  bellyGradT.addColorStop(0, "rgba(220,240,170,0.3)");
  bellyGradT.addColorStop(0.5, "rgba(200,220,150,0.2)");
  bellyGradT.addColorStop(1, "rgba(180,200,130,0)");
  ctx.fillStyle = bellyGradT;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1 - hop, size * 0.2, size * 0.12, 0, 0, TAU);
  ctx.fill();
  for (let bp = 0; bp < 8; bp++) {
    const bpAngle = bp * (TAU / 8) + 0.2;
    const bpDist = size * 0.1;
    const bpX = x + Math.cos(bpAngle) * bpDist;
    const bpY = y + size * 0.1 - hop + Math.sin(bpAngle) * bpDist * 0.5;
    ctx.fillStyle = "rgba(180,200,120,0.08)";
    ctx.beginPath();
    ctx.ellipse(bpX, bpY, size * 0.015, size * 0.01, bpAngle, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(120,160,80,0.1)";
  ctx.lineWidth = 0.5 * zoom;
  for (let v = 0; v < 6; v++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12 + v * size * 0.05, y + size * 0.04 - hop);
    ctx.quadraticCurveTo(x - size * 0.1 + v * size * 0.05, y + size * 0.12 - hop, x - size * 0.14 + v * size * 0.06, y + size * 0.18 - hop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + v * size * 0.05, y + size * 0.1 - hop);
    ctx.lineTo(x - size * 0.08 + v * size * 0.05, y + size * 0.14 - hop);
    ctx.stroke();
  }

  // Throat sac (inflating/deflating, enhanced)
  const sacSize = size * 0.14 * (0.6 + inflate * 0.6);
  const sacGrad = ctx.createRadialGradient(x + croakVibrate, y + size * 0.2 - hop, 0, x + croakVibrate, y + size * 0.2 - hop, sacSize);
  sacGrad.addColorStop(0, `rgba(240,220,170,${0.55 + inflate * 0.15})`);
  sacGrad.addColorStop(0.3, `rgba(230,210,160,${0.45 + inflate * 0.12})`);
  sacGrad.addColorStop(0.6, `rgba(200,210,120,${0.3 + inflate * 0.1})`);
  sacGrad.addColorStop(1, `rgba(160,190,80,${0.1 + inflate * 0.05})`);
  ctx.fillStyle = sacGrad;
  ctx.beginPath();
  ctx.ellipse(x + croakVibrate, y + size * 0.2 - hop, sacSize, sacSize * 0.72, 0, 0, TAU);
  ctx.fill();
  if (inflate > 0.4) {
    const innerAlpha = (inflate - 0.4) * 0.15;
    ctx.fillStyle = `rgba(255,180,180,${innerAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x + croakVibrate, y + size * 0.2 - hop, sacSize * 0.5, sacSize * 0.35, 0, 0, TAU);
    ctx.fill();
  }
  if (inflate > 0.4) {
    ctx.strokeStyle = `rgba(140,100,80,${(inflate - 0.4) * 0.25})`;
    ctx.lineWidth = 0.5 * zoom;
    for (let sv = 0; sv < 5; sv++) {
      const svAngle = sv * 0.4 - 0.8;
      ctx.beginPath();
      ctx.moveTo(x + croakVibrate + Math.cos(svAngle) * sacSize * 0.2, y + size * 0.16 - hop);
      ctx.quadraticCurveTo(
        x + croakVibrate + Math.cos(svAngle) * sacSize * 0.5, y + size * 0.22 - hop,
        x + croakVibrate + Math.cos(svAngle + 0.1) * sacSize * 0.3, y + size * 0.27 - hop,
      );
      ctx.stroke();
    }
  }
  ctx.fillStyle = `rgba(255,255,255,${0.06 + inflate * 0.04})`;
  ctx.beginPath();
  ctx.ellipse(x + croakVibrate - sacSize * 0.3, y + size * 0.17 - hop, sacSize * 0.2, sacSize * 0.12, -0.3, 0, TAU);
  ctx.fill();

  // Bulging eyes on stalks (enhanced with independent tracking)
  for (const side of [-1, 1]) {
    const eyeTrackX = Math.sin(time * 0.7 + side * 0.5) * size * 0.008;
    const eyeTrackY = Math.cos(time * 0.5 + side * 0.3) * size * 0.005;
    const stalkSway = Math.sin(time * 1.5 + side * 2) * 0.08;
    const eyeBaseX = x + side * size * 0.1;
    const eyeBaseY = y - size * 0.14 - hop;
    const eyeX = eyeBaseX + Math.sin(stalkSway) * size * 0.02;
    const eyeY = eyeBaseY - size * 0.06 + Math.cos(stalkSway) * size * 0.01;
    const eyeBlink = Math.sin(time * 0.8 + side) > 0.95 ? 0.3 : 1;
    const stalkGrad = ctx.createLinearGradient(eyeBaseX, eyeBaseY, eyeX, eyeY);
    stalkGrad.addColorStop(0, bodyColorDark);
    stalkGrad.addColorStop(0.5, bodyColor);
    stalkGrad.addColorStop(1, bodyColorLight);
    ctx.fillStyle = stalkGrad;
    ctx.beginPath();
    ctx.moveTo(eyeBaseX - size * 0.025, eyeBaseY);
    ctx.quadraticCurveTo(eyeX - size * 0.02, (eyeBaseY + eyeY) / 2, eyeX - size * 0.02, eyeY + size * 0.02);
    ctx.lineTo(eyeX + size * 0.02, eyeY + size * 0.02);
    ctx.quadraticCurveTo(eyeX + size * 0.02, (eyeBaseY + eyeY) / 2, eyeBaseX + size * 0.025, eyeBaseY);
    ctx.fill();
    for (let sr = 0; sr < 3; sr++) {
      const srt = (sr + 1) / 4;
      const srx = eyeBaseX + (eyeX - eyeBaseX) * srt;
      const sry = eyeBaseY + (eyeY + size * 0.02 - eyeBaseY) * srt;
      ctx.strokeStyle = "rgba(0,30,0,0.08)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.ellipse(srx, sry, size * 0.018, size * 0.006, stalkSway, 0, TAU);
      ctx.stroke();
    }
    const eyeGrad = ctx.createRadialGradient(eyeX - size * 0.008 + eyeTrackX, eyeY - size * 0.008, 0, eyeX, eyeY, size * 0.045);
    eyeGrad.addColorStop(0, "#ffffa0");
    eyeGrad.addColorStop(0.3, "#fff870");
    eyeGrad.addColorStop(0.6, "#e8e040");
    eyeGrad.addColorStop(1, "#b0a020");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.045, size * 0.045 * eyeBlink, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(120,100,20,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(eyeX + eyeTrackX * 0.5, eyeY + eyeTrackY * 0.5, size * 0.028, size * 0.028 * eyeBlink, 0, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = "#1a1a00";
    ctx.beginPath();
    ctx.ellipse(eyeX + eyeTrackX, eyeY + eyeTrackY, size * 0.024, size * 0.01 * eyeBlink, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(eyeX - size * 0.014, eyeY - size * 0.014, size * 0.01, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(eyeX + size * 0.01, eyeY + size * 0.005, size * 0.005, 0, TAU);
    ctx.fill();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY - size * 0.028, size * 0.044, size * 0.016, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "rgba(80,100,40,0.15)";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY + size * 0.028, size * 0.04, size * 0.01, 0, Math.PI, TAU);
    ctx.fill();
  }

  // Tongue attack (enhanced)
  if (tongueOut > 0) {
    const tongueLen = size * 0.6 * tongueOut;
    const tongueWave = Math.sin(time * 12) * size * 0.015 * tongueOut;
    const tongueGrad = ctx.createLinearGradient(x, y + size * 0.12 - hop, x + tongueLen, y + size * 0.06 - hop);
    tongueGrad.addColorStop(0, "#bb2233");
    tongueGrad.addColorStop(0.3, "#cc3344");
    tongueGrad.addColorStop(0.6, "#dd4455");
    tongueGrad.addColorStop(1, "#ee5566");
    ctx.strokeStyle = tongueGrad;
    ctx.lineWidth = 5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.12 - hop);
    ctx.bezierCurveTo(
      x + tongueLen * 0.3, y + size * 0.03 - hop - tongueLen * 0.1 + tongueWave,
      x + tongueLen * 0.6, y + size * 0.01 - hop - tongueLen * 0.05 - tongueWave,
      x + tongueLen, y + size * 0.06 - hop,
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(200,100,120,0.3)";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.12 - hop);
    ctx.bezierCurveTo(
      x + tongueLen * 0.3, y + size * 0.03 - hop - tongueLen * 0.1 + tongueWave,
      x + tongueLen * 0.6, y + size * 0.01 - hop - tongueLen * 0.05 - tongueWave,
      x + tongueLen, y + size * 0.06 - hop,
    );
    ctx.stroke();
    ctx.lineCap = "butt";
    const tipGrad = ctx.createRadialGradient(x + tongueLen, y + size * 0.06 - hop, 0, x + tongueLen, y + size * 0.06 - hop, size * 0.025);
    tipGrad.addColorStop(0, `rgba(240,80,100,${0.7 + tongueOut * 0.2})`);
    tipGrad.addColorStop(0.5, `rgba(220,60,80,${0.5 + tongueOut * 0.15})`);
    tipGrad.addColorStop(1, `rgba(200,40,60,0.2)`);
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.arc(x + tongueLen, y + size * 0.06 - hop, size * 0.025, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(200,180,140,${tongueOut * 0.35})`;
    ctx.lineWidth = 0.6 * zoom;
    for (let ms2 = 0; ms2 < 4; ms2++) {
      ctx.beginPath();
      ctx.moveTo(x + tongueLen, y + size * 0.06 - hop);
      ctx.quadraticCurveTo(
        x + tongueLen + size * 0.015, y + size * (0.03 + ms2 * 0.02) - hop,
        x + tongueLen + size * 0.025 * Math.cos(ms2 * 0.5 - 0.75), y + size * (0.04 + ms2 * 0.025) - hop + Math.sin(time * 8 + ms2) * size * 0.005,
      );
      ctx.stroke();
    }
  }

  // Wide mouth line with lip detail
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15 + croakVibrate, y + size * 0.1 - hop);
  ctx.quadraticCurveTo(x + croakVibrate, y + size * 0.14 - hop, x + size * 0.15 + croakVibrate, y + size * 0.1 - hop);
  ctx.stroke();
  for (let lb = 0; lb < 3; lb++) {
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(x + (lb - 1) * size * 0.07 + croakVibrate, y + size * 0.09 - hop, size * 0.025, size * 0.01, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(180,200,140,0.1)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + croakVibrate, y + size * 0.095 - hop);
  ctx.quadraticCurveTo(x + croakVibrate, y + size * 0.12 - hop, x + size * 0.12 + croakVibrate, y + size * 0.095 - hop);
  ctx.stroke();

  // Poison drip from body
  for (let pd = 0; pd < 5; pd++) {
    const pdPhase = (time * 0.8 + pd * 0.4) % 1.5;
    const pdx = x + (pd - 2) * size * 0.1;
    const pdy = y + size * 0.25 - hop + pdPhase * size * 0.15;
    const pdAlpha = (1 - pdPhase / 1.5) * 0.25;
    if (pdAlpha > 0) {
      ctx.fillStyle = `rgba(100,200,50,${pdAlpha})`;
      ctx.beginPath();
      ctx.ellipse(pdx, pdy, size * 0.005, size * 0.012 * (1 - pdPhase / 1.5), 0, 0, TAU);
      ctx.fill();
      if (pdPhase > 0.15) {
        ctx.strokeStyle = `rgba(100,200,50,${pdAlpha * 0.4})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(pdx, pdy - size * 0.015);
        ctx.lineTo(pdx, pdy);
        ctx.stroke();
      }
    }
  }

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.37, size * 0.28, size * 0.06 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
}

// 8. VINE SERPENT — Serpentine vine creature with thorns and flower head
export function drawVineSerpentEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.3;
  const slither = time * 3;
  const vineExtend = isAttacking ? attackPhase * 0.5 : 0;

  // Drifting pollen particles (enhanced with variety)
  for (let p = 0; p < 12; p++) {
    const pAngle = time * 0.6 + p * 1.1;
    const pDist = size * 0.3 + Math.sin(time * 1.2 + p * 2) * size * 0.12;
    const pRise = (time * 0.8 + p * 0.35) % 2;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - pRise * size * 0.28 + Math.sin(pAngle) * pDist * 0.3;
    const pAlpha = (1 - pRise * 0.5) * 0.3;
    if (pAlpha > 0) {
      const pollenSize = size * 0.005 + Math.sin(time * 3 + p) * size * 0.002;
      const pollenColors = ["rgba(250,220,50,", "rgba(255,200,80,", "rgba(240,240,100,"];
      setShadowBlur(ctx, 2 * zoom, `rgba(250,220,50,${pAlpha})`);
      ctx.fillStyle = `${pollenColors[p % 3]}${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, pollenSize, 0, TAU);
      ctx.fill();
      if (pRise > 0.3) {
        ctx.strokeStyle = `${pollenColors[p % 3]}${pAlpha * 0.3})`;
        ctx.lineWidth = 0.3 * zoom;
        ctx.beginPath();
        ctx.moveTo(px, py + size * 0.01);
        ctx.lineTo(px - Math.sin(pAngle) * size * 0.005, py + size * 0.02);
        ctx.stroke();
      }
    }
  }
  clearShadow(ctx);

  // Root tendrils at base
  for (let rt = 0; rt < 6; rt++) {
    const rtAngle = rt * (TAU / 6) + 0.3 + Math.sin(time * 0.5 + rt) * 0.1;
    const rtLen = size * (0.12 + Math.sin(rt * 2.1) * 0.04);
    const rtEndX = x + Math.cos(rtAngle) * rtLen;
    const rtEndY = y + size * 0.32 + Math.sin(rtAngle) * rtLen * 0.2;
    const rootGrad = ctx.createLinearGradient(x, y + size * 0.3, rtEndX, rtEndY);
    rootGrad.addColorStop(0, bodyColorDark);
    rootGrad.addColorStop(1, "rgba(80,50,20,0.3)");
    ctx.strokeStyle = rootGrad;
    ctx.lineWidth = size * 0.01 * (1 - rt * 0.08);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(rtAngle) * size * 0.03, y + size * 0.3);
    ctx.quadraticCurveTo(
      x + Math.cos(rtAngle) * rtLen * 0.5 + Math.sin(time + rt) * size * 0.015,
      y + size * 0.32 + Math.sin(rtAngle) * rtLen * 0.1,
      rtEndX, rtEndY,
    );
    ctx.stroke();
    ctx.fillStyle = "rgba(100,60,30,0.3)";
    ctx.beginPath();
    ctx.arc(rtEndX, rtEndY, size * 0.005, 0, TAU);
    ctx.fill();
  }
  ctx.lineCap = "butt";

  // Ground vine trail (enhanced)
  ctx.strokeStyle = "rgba(34,120,50,0.15)";
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.32);
  ctx.bezierCurveTo(
    x - size * 0.2, y + size * 0.35 + Math.sin(time) * size * 0.02,
    x, y + size * 0.33 - Math.sin(time * 0.8) * size * 0.015,
    x + size * 0.15, y + size * 0.3,
  );
  ctx.stroke();
  for (let tl = 0; tl < 3; tl++) {
    const tlT = (tl + 1) / 4;
    const tlX = x - size * 0.4 + tlT * size * 0.55;
    const tlY = y + size * 0.32 + Math.sin(tlT * Math.PI) * size * 0.02;
    ctx.fillStyle = "rgba(74,180,90,0.15)";
    ctx.beginPath();
    ctx.ellipse(tlX, tlY, size * 0.01, size * 0.005, tlT * 1.5, 0, TAU);
    ctx.fill();
  }

  // Body segments (undulating wave, more segments)
  const segments = 22;
  const segPoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t2 = i / segments;
    const wave = Math.sin(slither + t2 * 5.5) * size * 0.1 * (1 - t2 * 0.3);
    const vertWave = Math.sin(slither * 0.7 + t2 * 3) * size * 0.015;
    const sx = x - size * 0.34 + t2 * size * 0.68;
    const sy = y + size * 0.12 + wave - t2 * size * 0.4 + vertWave;
    segPoints.push({ x: sx, y: sy });
  }

  // Draw vine body with layered detail
  for (let i = 0; i < segments; i++) {
    const p0 = segPoints[i];
    const p1 = segPoints[i + 1];
    const segFrac = i / segments;
    const thickness = size * (0.055 - segFrac * 0.015);
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);

    // Outer bark layer (enhanced gradient)
    const barkGrad = ctx.createLinearGradient(
      p0.x - Math.sin(angle) * thickness, p0.y + Math.cos(angle) * thickness,
      p0.x + Math.sin(angle) * thickness, p0.y - Math.cos(angle) * thickness,
    );
    barkGrad.addColorStop(0, bodyColorDark);
    barkGrad.addColorStop(0.2, bodyColor);
    barkGrad.addColorStop(0.5, bodyColorLight);
    barkGrad.addColorStop(0.8, bodyColor);
    barkGrad.addColorStop(1, bodyColorDark);
    ctx.strokeStyle = barkGrad;
    ctx.lineWidth = thickness * 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    // Inner wood grain
    if (i % 2 === 0) {
      ctx.strokeStyle = "rgba(90,60,30,0.08)";
      ctx.lineWidth = 0.4 * zoom;
      for (let grain = -1; grain <= 1; grain += 2) {
        ctx.beginPath();
        ctx.moveTo(p0.x + Math.sin(angle + Math.PI * 0.5) * thickness * 0.3 * grain, p0.y - Math.cos(angle + Math.PI * 0.5) * thickness * 0.3 * grain);
        ctx.lineTo(p1.x + Math.sin(angle + Math.PI * 0.5) * thickness * 0.3 * grain, p1.y - Math.cos(angle + Math.PI * 0.5) * thickness * 0.3 * grain);
        ctx.stroke();
      }
    }

    // Scale/bark texture rings (enhanced)
    if (i % 2 === 0) {
      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.ellipse(mx, my, thickness * 0.85, thickness * 0.35, angle, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(160,140,100,0.08)";
      ctx.beginPath();
      ctx.ellipse(mx - Math.sin(angle) * thickness * 0.2, my + Math.cos(angle) * thickness * 0.2, thickness * 0.3, thickness * 0.15, angle, 0, TAU);
      ctx.fill();
    }

    // Bioluminescent glow spots along body
    if (i % 4 === 2) {
      const glowPhase = 0.3 + Math.sin(time * 2 + i * 0.8) * 0.3;
      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;
      setShadowBlur(ctx, 3 * zoom, `rgba(120,255,80,${glowPhase})`);
      const glowGrad = ctx.createRadialGradient(mx, my, 0, mx, my, thickness * 0.6);
      glowGrad.addColorStop(0, `rgba(150,255,100,${glowPhase * 0.5})`);
      glowGrad.addColorStop(0.5, `rgba(100,220,60,${glowPhase * 0.25})`);
      glowGrad.addColorStop(1, `rgba(60,180,30,0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(mx, my, thickness * 0.6, 0, TAU);
      ctx.fill();
      clearShadow(ctx);
    }

    // Thorns (alternating sides, enhanced 3D shading)
    if (i % 2 === 0) {
      const thornNormal = angle + Math.PI * 0.5;
      for (const side of [-1, 1]) {
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        const thornLen = size * 0.04 * (1 - segFrac * 0.5);
        const tx = mx + Math.cos(thornNormal) * (thickness + thornLen) * side;
        const ty = my + Math.sin(thornNormal) * (thickness + thornLen) * side;
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(thornNormal) * thickness * side * 0.6 + size * 0.002, my + Math.sin(thornNormal) * thickness * side * 0.6 + size * 0.002);
        ctx.lineTo(tx + size * 0.002, ty + size * 0.002);
        ctx.lineTo(mx + Math.cos(angle + side * 0.4) * thickness * 0.5 + size * 0.002, my + Math.sin(angle + side * 0.4) * thickness * 0.5 + size * 0.002);
        ctx.fill();
        const thornGrad = ctx.createLinearGradient(
          mx + Math.cos(thornNormal) * thickness * side * 0.6, my + Math.sin(thornNormal) * thickness * side * 0.6,
          tx, ty,
        );
        thornGrad.addColorStop(0, "#7a5a3a");
        thornGrad.addColorStop(0.4, "#6a4a2a");
        thornGrad.addColorStop(0.8, "#3a2a12");
        thornGrad.addColorStop(1, "#1a0a04");
        ctx.fillStyle = thornGrad;
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(thornNormal) * thickness * side * 0.6, my + Math.sin(thornNormal) * thickness * side * 0.6);
        ctx.lineTo(tx, ty);
        ctx.lineTo(mx + Math.cos(angle + side * 0.4) * thickness * 0.5, my + Math.sin(angle + side * 0.4) * thickness * 0.5);
        ctx.fill();
        ctx.strokeStyle = "rgba(200,180,140,0.12)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(thornNormal) * thickness * side * 0.6, my + Math.sin(thornNormal) * thickness * side * 0.6);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    }

    // Leaves with veins (enhanced)
    if (i % 3 === 1) {
      const lx = (p0.x + p1.x) / 2;
      const ly = (p0.y + p1.y) / 2;
      for (const side of [-1, 1]) {
        const leafWave = Math.sin(time * 2.5 + i + side) * 0.15;
        const leafA = angle + side * (0.8 + leafWave);
        const leafLen = size * 0.035 * (1 - segFrac * 0.3);
        const leafWidth = leafLen * 0.3;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(leafA);
        ctx.fillStyle = "rgba(0,40,0,0.06)";
        ctx.beginPath();
        ctx.moveTo(size * 0.002, size * 0.002);
        ctx.quadraticCurveTo(leafLen * 0.5 + size * 0.002, -leafWidth + size * 0.002, leafLen + size * 0.002, size * 0.002);
        ctx.quadraticCurveTo(leafLen * 0.5 + size * 0.002, leafWidth + size * 0.002, size * 0.002, size * 0.002);
        ctx.fill();
        const leafGrad = ctx.createLinearGradient(0, -leafWidth, 0, leafWidth);
        leafGrad.addColorStop(0, `rgba(60,200,100,${0.55 + Math.sin(time * 2 + i + side) * 0.15})`);
        leafGrad.addColorStop(0.5, `rgba(74,222,128,${0.65 + Math.sin(time * 2 + i + side) * 0.15})`);
        leafGrad.addColorStop(1, `rgba(50,180,80,${0.5 + Math.sin(time * 2 + i + side) * 0.12})`);
        ctx.fillStyle = leafGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, -leafWidth, leafLen, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, leafWidth, 0, 0);
        ctx.fill();
        ctx.strokeStyle = "rgba(34,120,50,0.45)";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(leafLen * 0.9, 0);
        ctx.stroke();
        ctx.strokeStyle = "rgba(34,120,50,0.2)";
        ctx.lineWidth = 0.3 * zoom;
        for (let vn = 0; vn < 3; vn++) {
          const vnT = (vn + 1) / 4;
          const vnX = leafLen * vnT;
          ctx.beginPath();
          ctx.moveTo(vnX, 0);
          ctx.lineTo(vnX + leafLen * 0.12, -leafWidth * 0.6 * (1 - vnT * 0.3));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(vnX, 0);
          ctx.lineTo(vnX + leafLen * 0.12, leafWidth * 0.6 * (1 - vnT * 0.3));
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }
  ctx.lineCap = "butt";

  // Flower head (much more elaborate)
  const headP = segPoints[segments];
  const prevP = segPoints[segments - 1];
  const headAngle = Math.atan2(headP.y - prevP.y, headP.x - prevP.x);
  const headPulse = 1 + Math.sin(time * 3) * 0.08;
  const petalBreath = Math.sin(time * 2) * 0.05;

  // Sepals (green structures behind petals)
  for (let sp = 0; sp < 5; sp++) {
    const spAngle = headAngle + sp * (TAU / 5) + TAU / 10;
    const spLen = size * 0.05 * headPulse;
    ctx.save();
    ctx.translate(headP.x + Math.cos(spAngle) * size * 0.02, headP.y + Math.sin(spAngle) * size * 0.02);
    ctx.rotate(spAngle);
    ctx.fillStyle = "rgba(34,140,50,0.5)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(spLen * 0.5, -size * 0.012, spLen, 0);
    ctx.quadraticCurveTo(spLen * 0.5, size * 0.012, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // Outer ring of large petals (more detailed)
  const petalOuter = ["#be123c", "#e11d48", "#f43f5e", "#e11d48", "#be123c", "#f43f5e", "#e11d48", "#be123c", "#d4163e", "#e91e50"];
  for (let p = 0; p < 10; p++) {
    const pAngle = headAngle + p * (TAU / 10) + Math.sin(time * 2) * 0.08 + petalBreath;
    const petalDist = size * 0.055 * headPulse;
    ctx.save();
    ctx.translate(headP.x + Math.cos(pAngle) * petalDist * 0.5, headP.y + Math.sin(pAngle) * petalDist * 0.5);
    ctx.rotate(pAngle);
    const petalLen = size * 0.045 * headPulse;
    const petalW = size * 0.02;
    ctx.fillStyle = "rgba(100,10,30,0.1)";
    ctx.beginPath();
    ctx.moveTo(size * 0.002, size * 0.002);
    ctx.quadraticCurveTo(petalLen * 0.5 + size * 0.002, -petalW + size * 0.002, petalLen + size * 0.002, size * 0.002);
    ctx.quadraticCurveTo(petalLen * 0.5 + size * 0.002, petalW + size * 0.002, size * 0.002, size * 0.002);
    ctx.fill();
    const pGrad = ctx.createLinearGradient(0, 0, petalLen, 0);
    pGrad.addColorStop(0, petalOuter[p]);
    pGrad.addColorStop(0.4, "#fb7185");
    pGrad.addColorStop(0.7, "#fda4af");
    pGrad.addColorStop(1, "#fecdd3");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(petalLen * 0.5, -petalW, petalLen, 0);
    ctx.quadraticCurveTo(petalLen * 0.5, petalW, 0, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(150,20,50,0.25)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.005, 0);
    ctx.lineTo(petalLen * 0.9, 0);
    ctx.stroke();
    ctx.strokeStyle = "rgba(150,20,50,0.12)";
    ctx.lineWidth = 0.3 * zoom;
    for (let pv = 0; pv < 2; pv++) {
      const pvT = (pv + 1) / 3;
      ctx.beginPath();
      ctx.moveTo(petalLen * pvT, 0);
      ctx.lineTo(petalLen * (pvT + 0.1), -petalW * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(petalLen * pvT, 0);
      ctx.lineTo(petalLen * (pvT + 0.1), petalW * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Inner ring of small petals
  for (let p = 0; p < 8; p++) {
    const pAngle = headAngle + p * (TAU / 8) + TAU / 16 + Math.sin(time * 2.5) * 0.1;
    const px = headP.x + Math.cos(pAngle) * size * 0.022;
    const py = headP.y + Math.sin(pAngle) * size * 0.022;
    const ipGrad = ctx.createLinearGradient(px, py, px + Math.cos(pAngle) * size * 0.015, py + Math.sin(pAngle) * size * 0.015);
    ipGrad.addColorStop(0, "#f472b6");
    ipGrad.addColorStop(1, "#fda4af");
    ctx.fillStyle = ipGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.02, size * 0.01, pAngle, 0, TAU);
    ctx.fill();
  }

  // Flower center (pollen disc with stamen)
  const centerR = size * 0.028;
  const centerGrad = ctx.createRadialGradient(headP.x - size * 0.005, headP.y - size * 0.005, 0, headP.x, headP.y, centerR);
  centerGrad.addColorStop(0, "#ffffc0");
  centerGrad.addColorStop(0.3, "#fff7a0");
  centerGrad.addColorStop(0.5, "#fbbf24");
  centerGrad.addColorStop(0.8, "#d97706");
  centerGrad.addColorStop(1, "#92400e");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(headP.x, headP.y, centerR, 0, TAU);
  ctx.fill();
  for (let st = 0; st < 8; st++) {
    const stAngle = st * (TAU / 8) + time * 0.3;
    const stDist = centerR * 0.7;
    const stX = headP.x + Math.cos(stAngle) * stDist;
    const stY = headP.y + Math.sin(stAngle) * stDist;
    ctx.strokeStyle = "rgba(180,120,20,0.4)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(headP.x + Math.cos(stAngle) * centerR * 0.3, headP.y + Math.sin(stAngle) * centerR * 0.3);
    ctx.lineTo(stX, stY);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,200,50,0.6)";
    ctx.beginPath();
    ctx.arc(stX, stY, size * 0.003, 0, TAU);
    ctx.fill();
  }
  for (let pd = 0; pd < 8; pd++) {
    const pdA = pd * (TAU / 8) + time * 0.5;
    const pdDist = centerR * (0.4 + Math.sin(time * 2 + pd) * 0.2);
    ctx.fillStyle = "rgba(255,240,150,0.45)";
    ctx.beginPath();
    ctx.arc(headP.x + Math.cos(pdA) * pdDist, headP.y + Math.sin(pdA) * pdDist, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // Fangs with venom drip (enhanced)
  for (const side of [-1, 1]) {
    const fangAngle = headAngle + side * 0.35;
    const fangLen = size * 0.055;
    const fangTip = {
      x: headP.x + Math.cos(fangAngle) * fangLen,
      y: headP.y + Math.sin(fangAngle) * fangLen,
    };
    const fangGrad = ctx.createLinearGradient(headP.x, headP.y, fangTip.x, fangTip.y);
    fangGrad.addColorStop(0, "#f8f4e8");
    fangGrad.addColorStop(0.3, "#f5f0e0");
    fangGrad.addColorStop(0.6, "#e8dcc0");
    fangGrad.addColorStop(1, "#a08860");
    ctx.fillStyle = fangGrad;
    ctx.beginPath();
    ctx.moveTo(headP.x + Math.cos(fangAngle - side * 0.15) * size * 0.015, headP.y + Math.sin(fangAngle - side * 0.15) * size * 0.015);
    ctx.lineTo(fangTip.x, fangTip.y);
    ctx.lineTo(headP.x + Math.cos(fangAngle + side * 0.3) * size * 0.012, headP.y + Math.sin(fangAngle + side * 0.3) * size * 0.012);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,240,0.15)";
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(headP.x + Math.cos(fangAngle - side * 0.1) * size * 0.012, headP.y + Math.sin(fangAngle - side * 0.1) * size * 0.012);
    ctx.lineTo(fangTip.x, fangTip.y);
    ctx.stroke();
    const venomPhase = (time * 1.5 + side * 0.5) % 1.2;
    if (venomPhase < 1) {
      const venomAlpha = (1 - venomPhase) * 0.65;
      setShadowBlur(ctx, 2 * zoom, `rgba(80,200,50,${venomAlpha * 0.5})`);
      ctx.fillStyle = `rgba(80,220,50,${venomAlpha})`;
      ctx.beginPath();
      ctx.ellipse(fangTip.x, fangTip.y + venomPhase * size * 0.09, size * 0.005, size * 0.009 * (1 - venomPhase), 0, 0, TAU);
      ctx.fill();
      clearShadow(ctx);
    }
  }

  // Vine extension attack (enhanced)
  if (isAttacking) {
    for (let v = 0; v < 8; v++) {
      const vAngle = v * (TAU / 8) + time * 2;
      const vLen = size * 0.45 * vineExtend;
      const vAlpha = attackPhase * 0.7;
      const vThickness = (3.5 - v * 0.25) * zoom;
      const tendrilGrad = ctx.createLinearGradient(x, y, x + Math.cos(vAngle) * vLen, y + Math.sin(vAngle) * vLen * 0.5);
      tendrilGrad.addColorStop(0, `rgba(34,197,94,${vAlpha})`);
      tendrilGrad.addColorStop(0.5, `rgba(28,160,74,${vAlpha * 0.6})`);
      tendrilGrad.addColorStop(1, `rgba(22,101,52,${vAlpha * 0.2})`);
      ctx.strokeStyle = tendrilGrad;
      ctx.lineWidth = vThickness;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      const midX = x + Math.cos(vAngle) * vLen * 0.5 + Math.sin(time * 4 + v) * size * 0.05;
      const midY = y + Math.sin(vAngle) * vLen * 0.25 + Math.cos(time * 3 + v) * size * 0.04;
      ctx.quadraticCurveTo(midX, midY, x + Math.cos(vAngle) * vLen, y + Math.sin(vAngle) * vLen * 0.5);
      ctx.stroke();
      ctx.lineCap = "butt";
      if (vineExtend > 0.2) {
        for (let tt = 0; tt < 2; tt++) {
          const ttT = (tt + 1) / 3;
          const ttX = x + (x + Math.cos(vAngle) * vLen - x) * ttT;
          const ttY = y + (y + Math.sin(vAngle) * vLen * 0.5 - y) * ttT;
          ctx.fillStyle = `rgba(100,50,20,${vAlpha * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(ttX, ttY);
          ctx.lineTo(ttX + Math.cos(vAngle + Math.PI * 0.4) * size * 0.015, ttY + Math.sin(vAngle + Math.PI * 0.4) * size * 0.01);
          ctx.lineTo(ttX + Math.cos(vAngle) * size * 0.005, ttY + Math.sin(vAngle) * size * 0.005);
          ctx.fill();
        }
      }
      if (vineExtend > 0.3) {
        const tipX = x + Math.cos(vAngle) * vLen;
        const tipY = y + Math.sin(vAngle) * vLen * 0.5;
        ctx.fillStyle = `rgba(100,50,20,${vAlpha})`;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX + Math.cos(vAngle) * size * 0.035, tipY + Math.sin(vAngle) * size * 0.018);
        ctx.lineTo(tipX + Math.cos(vAngle + 0.5) * size * 0.012, tipY + Math.sin(vAngle + 0.5) * size * 0.012);
        ctx.fill();
      }
    }
    const burstR = vineExtend * size * 0.38;
    ctx.strokeStyle = `rgba(120,255,80,${attackPhase * 0.35})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.1, burstR, burstR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    for (let sp = 0; sp < 6; sp++) {
      const spAngle = sp * (TAU / 6) + time * 3;
      const spDist = burstR * (0.5 + Math.sin(time * 2 + sp) * 0.3);
      ctx.fillStyle = `rgba(180,255,100,${attackPhase * 0.25})`;
      ctx.beginPath();
      ctx.arc(x + Math.cos(spAngle) * spDist, y + size * 0.1 + Math.sin(spAngle) * spDist * ISO_Y_RATIO, size * 0.004, 0, TAU);
      ctx.fill();
    }
  }
}

// 9. MARSH TROLL — Swamp-variant troll with mud, moss, fungus growths
export function drawMarshTrollEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.4;
  const walkPhase = time * 3;
  const lurch = Math.sin(walkPhase) * size * 0.02;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const breath = 1 + Math.sin(time * 2) * 0.025;
  const spearThrust = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.8 : 0;

  // Frog companions hopping nearby
  for (let frog = 0; frog < 2; frog++) {
    const frogPhase = (time * 1.5 + frog * 3) % 4;
    const frogHop = frogPhase < 1 ? Math.sin(frogPhase * Math.PI) * size * 0.03 : 0;
    const frogX = x + (frog === 0 ? -1 : 1) * size * 0.35 + Math.sin(time * 0.5 + frog * 2) * size * 0.05;
    const frogY = y + size * 0.35 - frogHop;
    const frogGrad = ctx.createRadialGradient(frogX, frogY, 0, frogX, frogY, size * 0.025);
    frogGrad.addColorStop(0, "#5a8a3a");
    frogGrad.addColorStop(1, "#3a5a2a");
    ctx.fillStyle = frogGrad;
    ctx.beginPath();
    ctx.ellipse(frogX, frogY, size * 0.025, size * 0.018, 0, 0, TAU);
    ctx.fill();
    for (const fs of [-1, 1]) {
      ctx.fillStyle = "#aacc44";
      ctx.beginPath();
      ctx.arc(frogX + fs * size * 0.012, frogY - size * 0.012, size * 0.006, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#1a2a00";
      ctx.beginPath();
      ctx.arc(frogX + fs * size * 0.012, frogY - size * 0.012, size * 0.003, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = "#4a7a2a";
    ctx.lineWidth = 1 * zoom;
    for (const fs of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(frogX + fs * size * 0.02, frogY + size * 0.01);
      ctx.lineTo(frogX + fs * size * 0.035, frogY + size * 0.02 + frogHop * 0.3);
      ctx.stroke();
    }
  }

  // Leech companions on nearby ground
  for (let leech = 0; leech < 3; leech++) {
    const lAngle = leech * TAU / 3 + time * 0.3;
    const lDist = size * 0.3 + Math.sin(leech * 2) * size * 0.05;
    const llx = x + Math.cos(lAngle) * lDist;
    const lly = y + size * 0.38 + Math.sin(lAngle) * lDist * 0.15;
    const lWave = Math.sin(time * 4 + leech * 2) * size * 0.005;
    ctx.strokeStyle = "rgba(40,30,20,0.35)";
    ctx.lineWidth = size * 0.006;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(llx, lly);
    ctx.quadraticCurveTo(llx + lWave, lly - size * 0.01, llx + size * 0.02, lly - size * 0.005);
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  // Swamp gas bubbles rising (enhanced)
  for (let gb = 0; gb < 8; gb++) {
    const gbPhase = (time * 0.6 + gb * 0.32) % 1.5;
    const gbx = x + Math.sin(gb * 2.1) * size * 0.28;
    const gby = y + size * 0.32 - gbPhase * size * 0.55;
    const gbAlpha = (1 - gbPhase / 1.5) * 0.15;
    if (gbAlpha > 0) {
      const gbSize = size * 0.008 + gbPhase * size * 0.005;
      ctx.strokeStyle = `rgba(80,200,60,${gbAlpha})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.arc(gbx, gby, gbSize, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = `rgba(120,255,100,${gbAlpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(gbx - gbSize * 0.3, gby - gbSize * 0.3, gbSize * 0.3, 0, TAU);
      ctx.fill();
      if (gbPhase > 1.3) {
        const popAlpha = (gbPhase - 1.3) * 5 * gbAlpha;
        ctx.strokeStyle = `rgba(80,200,60,${popAlpha})`;
        ctx.beginPath();
        ctx.arc(gbx, gby, gbSize * 2, 0, TAU);
        ctx.stroke();
      }
    }
  }

  // Glowing marsh-light lure (will-o'-wisp)
  const wispAngle = time * 1.2;
  const wispDist = size * 0.3 + Math.sin(time * 0.8) * size * 0.05;
  const wispX = x + Math.cos(wispAngle) * wispDist * 0.7;
  const wispY = y - size * 0.35 + Math.sin(wispAngle * 0.7) * size * 0.08;
  const wispGlow = 0.5 + Math.sin(time * 4) * 0.3;
  setShadowBlur(ctx, 8 * zoom, `rgba(120,255,180,${wispGlow})`);
  const wispGrad = ctx.createRadialGradient(wispX, wispY, 0, wispX, wispY, size * 0.025);
  wispGrad.addColorStop(0, `rgba(200,255,220,${wispGlow})`);
  wispGrad.addColorStop(0.4, `rgba(120,255,180,${wispGlow * 0.6})`);
  wispGrad.addColorStop(1, `rgba(60,200,120,0)`);
  ctx.fillStyle = wispGrad;
  ctx.beginPath();
  ctx.arc(wispX, wispY, size * 0.025, 0, TAU);
  ctx.fill();
  for (let wt = 0; wt < 3; wt++) {
    const wtPhase = (time * 2 + wt * 0.5) % 1;
    const wtX = wispX - Math.cos(wispAngle) * wtPhase * size * 0.06;
    const wtY = wispY + Math.sin(wispAngle * 0.7) * wtPhase * size * 0.03;
    ctx.fillStyle = `rgba(120,255,180,${(1 - wtPhase) * wispGlow * 0.3})`;
    ctx.beginPath();
    ctx.arc(wtX, wtY, size * 0.008 * (1 - wtPhase), 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Mud puddle beneath (enhanced)
  const mudGrad = ctx.createRadialGradient(x, y + size * 0.44, 0, x, y + size * 0.44, size * 0.38);
  mudGrad.addColorStop(0, "rgba(60,40,20,0.35)");
  mudGrad.addColorStop(0.3, "rgba(55,38,18,0.25)");
  mudGrad.addColorStop(0.6, "rgba(50,35,15,0.12)");
  mudGrad.addColorStop(1, "rgba(40,30,10,0)");
  ctx.fillStyle = mudGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.44, size * 0.4, size * 0.11 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  for (let mr = 0; mr < 2; mr++) {
    const mrPhase = (time * 0.5 + mr * 1.2) % 2;
    ctx.strokeStyle = `rgba(80,60,30,${(1 - mrPhase / 2) * 0.08})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.44, size * (0.1 + mrPhase * 0.15), size * (0.03 + mrPhase * 0.04) * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  // Regeneration shimmer
  const regenAlpha = 0.12 + Math.sin(time * 2.5) * 0.08;
  drawRadialAura(ctx, x, y, size * 0.45, [
    { offset: 0, color: `rgba(80,200,120,${regenAlpha})` },
    { offset: 0.6, color: `rgba(60,160,80,${regenAlpha * 0.3})` },
    { offset: 1, color: "rgba(0,100,0,0)" },
  ]);

  // Mud drips falling with trails
  for (let d = 0; d < 9; d++) {
    const dPhase = (time * 1.2 + d * 0.15) % 1;
    const dx = x + (d - 4) * size * 0.06 + Math.sin(d * 2.3) * size * 0.04;
    const dy = y + size * 0.05 + dPhase * size * 0.35;
    const dAlpha = (1 - dPhase) * 0.45;
    ctx.fillStyle = `rgba(80,60,30,${dAlpha})`;
    ctx.beginPath();
    ctx.ellipse(dx, dy, size * 0.005, size * 0.013 * (1 - dPhase * 0.5), 0, 0, TAU);
    ctx.fill();
    if (dPhase > 0.1) {
      ctx.strokeStyle = `rgba(80,60,30,${dAlpha * 0.35})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(dx, dy - size * 0.025);
      ctx.lineTo(dx, dy);
      ctx.stroke();
    }
  }

  // Articulated legs (enhanced with webbed feet and mud-caked detail)
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + side * Math.PI * 0.5) * 0.25;
    const lx = x + side * size * 0.12;
    const hipY2 = y + size * 0.18 - bodyBob;
    const thighAngle = legSwing * 0.5;
    const kneeX = lx + Math.sin(thighAngle) * size * 0.06;
    const kneeY = hipY2 + Math.cos(thighAngle) * size * 0.12;
    const thighGrad = ctx.createLinearGradient(lx, hipY2, kneeX, kneeY);
    thighGrad.addColorStop(0, bodyColor);
    thighGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = thighGrad;
    ctx.beginPath();
    ctx.moveTo(lx - size * 0.055, hipY2);
    ctx.lineTo(kneeX - size * 0.045, kneeY);
    ctx.lineTo(kneeX + size * 0.045, kneeY);
    ctx.lineTo(lx + size * 0.055, hipY2);
    ctx.fill();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, size * 0.035, 0, TAU);
    ctx.fill();
    const ankleX = kneeX + Math.sin(legSwing * 0.2) * size * 0.03;
    const ankleY = kneeY + size * 0.1;
    ctx.beginPath();
    ctx.moveTo(kneeX - size * 0.035, kneeY);
    ctx.lineTo(ankleX - size * 0.03, ankleY);
    ctx.lineTo(ankleX + size * 0.03, ankleY);
    ctx.lineTo(kneeX + size * 0.035, kneeY);
    ctx.fill();
    const footGrad = ctx.createRadialGradient(ankleX, ankleY + size * 0.01, 0, ankleX, ankleY + size * 0.01, size * 0.05);
    footGrad.addColorStop(0, "#4a3a18");
    footGrad.addColorStop(1, "#3a2a10");
    ctx.fillStyle = footGrad;
    ctx.beginPath();
    ctx.ellipse(ankleX, ankleY + size * 0.01, size * 0.055, size * 0.022, side * 0.1, 0, TAU);
    ctx.fill();
    for (let toe = 0; toe < 3; toe++) {
      const toeAngle = (toe - 1) * 0.35 + side * 0.15;
      const toeX = ankleX + Math.cos(toeAngle) * size * 0.05;
      const toeY = ankleY + size * 0.01 + Math.sin(toeAngle) * size * 0.015;
      ctx.fillStyle = "#3a2a10";
      ctx.beginPath();
      ctx.arc(toeX, toeY, size * 0.008, 0, TAU);
      ctx.fill();
      if (toe < 2) {
        const nextAngle = toe * 0.35 + side * 0.15;
        const ntX = ankleX + Math.cos(nextAngle) * size * 0.05;
        const ntY = ankleY + size * 0.01 + Math.sin(nextAngle) * size * 0.015;
        ctx.fillStyle = "rgba(60,50,25,0.15)";
        ctx.beginPath();
        ctx.moveTo(ankleX, ankleY + size * 0.01);
        ctx.lineTo(toeX, toeY);
        ctx.lineTo(ntX, ntY);
        ctx.fill();
      }
    }
    const legMudGrad = ctx.createLinearGradient(ankleX, ankleY + size * 0.01, ankleX, ankleY + size * 0.01 - size * 0.06);
    legMudGrad.addColorStop(0, "rgba(70,50,25,0.35)");
    legMudGrad.addColorStop(0.5, "rgba(60,45,20,0.15)");
    legMudGrad.addColorStop(1, "rgba(50,40,15,0)");
    ctx.fillStyle = legMudGrad;
    ctx.beginPath();
    ctx.ellipse(ankleX, ankleY - size * 0.01, size * 0.04, size * 0.06, 0, 0, TAU);
    ctx.fill();
    const stepI = Math.max(0, -Math.sin(walkPhase + side * Math.PI * 0.5));
    if (stepI > 0.85) {
      const splat = (stepI - 0.85) * 6.67;
      ctx.fillStyle = `rgba(70,50,25,${splat * 0.3})`;
      for (let sp = 0; sp < 4; sp++) {
        const spAngle = sp * TAU / 4;
        ctx.beginPath();
        ctx.ellipse(ankleX + Math.cos(spAngle) * size * 0.03 * splat, ankleY + size * 0.02 + Math.sin(spAngle) * size * 0.01 * splat, size * 0.008 * splat, size * 0.004 * splat, spAngle, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Big hunched body (enhanced)
  const bellyGrad = ctx.createRadialGradient(x - size * 0.04, y - size * 0.02, 0, x, y + size * 0.05, size * 0.38);
  bellyGrad.addColorStop(0, bodyColorLight);
  bellyGrad.addColorStop(0.3, bodyColor);
  bellyGrad.addColorStop(0.65, bodyColorDark);
  bellyGrad.addColorStop(0.85, "#1a2a0a");
  bellyGrad.addColorStop(1, "#0a1a05");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(x + lurch, y + size * 0.02 - bodyBob, size * 0.28 * breath, size * 0.3, -0.1, 0, TAU);
  ctx.fill();

  // Fishing net / seaweed draped on body
  ctx.strokeStyle = "rgba(60,80,40,0.15)";
  ctx.lineWidth = 0.6 * zoom;
  for (let nx = 0; nx < 5; nx++) {
    const netX = x - size * 0.15 + nx * size * 0.07 + lurch;
    ctx.beginPath();
    ctx.moveTo(netX, y - size * 0.15 - bodyBob);
    ctx.quadraticCurveTo(netX + Math.sin(nx) * size * 0.01, y + size * 0.05 - bodyBob, netX - size * 0.01, y + size * 0.2);
    ctx.stroke();
  }
  for (let ny = 0; ny < 3; ny++) {
    const netY = y - size * 0.1 + ny * size * 0.1 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15 + lurch, netY);
    ctx.quadraticCurveTo(x + lurch, netY + size * 0.02, x + size * 0.15 + lurch, netY);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(30,90,30,0.2)";
  ctx.lineWidth = 0.8 * zoom;
  for (let sw = 0; sw < 4; sw++) {
    const swX = x + (sw - 1.5) * size * 0.08 + lurch;
    const swWave = Math.sin(time * 2 + sw * 1.5) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(swX, y - size * 0.1 - bodyBob);
    ctx.quadraticCurveTo(swX + swWave, y + size * 0.05, swX + swWave * 2, y + size * 0.15);
    ctx.stroke();
  }

  // Mud and moss patches (enhanced with algae)
  const patchColors = ["#4a3a1a", "#3a5a2a", "#5a4a2a", "#2a4a1a", "#3a6a3a", "#4a5a1a"];
  for (let p = 0; p < 14; p++) {
    const px = x + Math.cos(p * 1.9) * size * 0.22 + lurch;
    const py = y + Math.sin(p * 1.5) * size * 0.18 - bodyBob;
    ctx.fillStyle = patchColors[p % 6];
    ctx.globalAlpha = 0.2 + Math.sin(p) * 0.1;
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.025 + Math.sin(p * 1.2) * size * 0.01, size * 0.018, p * 0.7, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Algae streaks dripping down body (enhanced)
  for (let a = 0; a < 6; a++) {
    const ax = x + (a - 2.5) * size * 0.08 + lurch;
    const algaeGrad = ctx.createLinearGradient(ax, y - size * 0.12 - bodyBob, ax, y + size * 0.22);
    algaeGrad.addColorStop(0, "rgba(40,110,30,0.25)");
    algaeGrad.addColorStop(0.5, "rgba(30,90,25,0.15)");
    algaeGrad.addColorStop(1, "rgba(20,70,15,0)");
    ctx.strokeStyle = algaeGrad;
    ctx.lineWidth = (1 + Math.sin(a * 1.3) * 0.4) * zoom;
    ctx.beginPath();
    ctx.moveTo(ax, y - size * 0.12 - bodyBob);
    ctx.bezierCurveTo(
      ax + Math.sin(a) * size * 0.015, y - size * 0.02,
      ax - Math.sin(a * 0.7) * size * 0.02, y + size * 0.1,
      ax - size * 0.01, y + size * 0.22,
    );
    ctx.stroke();
  }

  // Tribal bone necklace
  const necklineY = y - size * 0.18 - bodyBob;
  ctx.strokeStyle = "rgba(120,90,50,0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2 + lurch, necklineY);
  ctx.quadraticCurveTo(x + lurch, necklineY + size * 0.06, x + size * 0.2 + lurch, necklineY);
  ctx.stroke();
  for (let bn = 0; bn < 5; bn++) {
    const bnT = (bn + 1) / 6;
    const bnX = x - size * 0.2 + bnT * size * 0.4 + lurch;
    const bnY = necklineY + Math.sin(bnT * Math.PI) * size * 0.06;
    const bnAngle = Math.sin(walkPhase * 0.5 + bn) * 0.15;
    ctx.save();
    ctx.translate(bnX, bnY);
    ctx.rotate(bnAngle);
    ctx.fillStyle = "#d4c8a8";
    ctx.beginPath();
    ctx.roundRect(-size * 0.005, 0, size * 0.01, size * 0.025, size * 0.002);
    ctx.fill();
    ctx.fillStyle = "#c8b898";
    ctx.beginPath();
    ctx.arc(0, size * 0.025, size * 0.006, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#e8dcc0";
  ctx.beginPath();
  ctx.moveTo(x + lurch - size * 0.008, necklineY + size * 0.05);
  ctx.lineTo(x + lurch, necklineY + size * 0.09);
  ctx.lineTo(x + lurch + size * 0.008, necklineY + size * 0.05);
  ctx.fill();

  // Muscular arms (enhanced with webbed hands)
  for (const side of [-1, 1]) {
    const armAngle = side * (0.3 + Math.sin(walkPhase + side) * 0.12);
    const armAttack = side === 1 ? spearThrust : 0;
    ctx.save();
    ctx.translate(x + side * size * 0.24 + lurch, y - size * 0.08 - bodyBob);
    ctx.rotate(armAngle + armAttack);
    const armGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, size * 0.12);
    armGrad.addColorStop(0, bodyColorDark);
    armGrad.addColorStop(0.5, bodyColor);
    armGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.06, size * 0.14, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.24, size * 0.045, size * 0.1, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(0, size * 0.33, size * 0.04, 0, TAU);
    ctx.fill();
    for (let fg = 0; fg < 4; fg++) {
      const fgAngle = (fg - 1.5) * 0.35;
      const fgTipX = Math.sin(fgAngle) * size * 0.04 + Math.sin(fgAngle) * size * 0.025;
      const fgTipY = size * 0.33 + Math.cos(fgAngle) * size * 0.03 + size * 0.02;
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.ellipse(fgTipX, fgTipY, size * 0.006, size * 0.012, fgAngle, 0, TAU);
      ctx.fill();
      if (fg < 3) {
        const nfgAngle = (fg - 0.5) * 0.35;
        const nfgTipX = Math.sin(nfgAngle) * size * 0.04 + Math.sin(nfgAngle) * size * 0.025;
        const nfgTipY = size * 0.33 + Math.cos(nfgAngle) * size * 0.03 + size * 0.02;
        ctx.fillStyle = "rgba(60,80,40,0.12)";
        ctx.beginPath();
        ctx.moveTo(0, size * 0.33);
        ctx.lineTo(fgTipX, fgTipY);
        ctx.lineTo(nfgTipX, nfgTipY);
        ctx.fill();
      }
    }
    // Crude spear in right hand
    if (side === 1) {
      const shaftGrad = ctx.createLinearGradient(0, size * 0.2, 0, size * 0.58);
      shaftGrad.addColorStop(0, "#8a6a3a");
      shaftGrad.addColorStop(0.5, "#7a5a2a");
      shaftGrad.addColorStop(1, "#6a4a1a");
      ctx.fillStyle = shaftGrad;
      ctx.beginPath();
      ctx.roundRect(-size * 0.012, size * 0.2, size * 0.024, size * 0.38, size * 0.004);
      ctx.fill();
      const spearHeadGrad = ctx.createLinearGradient(-size * 0.02, size * 0.15, size * 0.02, size * 0.22);
      spearHeadGrad.addColorStop(0, "#888888");
      spearHeadGrad.addColorStop(0.5, "#666666");
      spearHeadGrad.addColorStop(1, "#444444");
      ctx.fillStyle = spearHeadGrad;
      ctx.beginPath();
      ctx.moveTo(0, size * 0.15);
      ctx.lineTo(-size * 0.022, size * 0.22);
      ctx.lineTo(0, size * 0.26);
      ctx.lineTo(size * 0.022, size * 0.22);
      ctx.fill();
      ctx.strokeStyle = "rgba(100,70,30,0.5)";
      ctx.lineWidth = 1 * zoom;
      for (let bw = 0; bw < 3; bw++) {
        const bwY = size * 0.24 + bw * size * 0.015;
        ctx.beginPath();
        ctx.moveTo(-size * 0.015, bwY);
        ctx.lineTo(size * 0.015, bwY + size * 0.005);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Hunched shoulders (enhanced)
  const shGrad = ctx.createLinearGradient(x - size * 0.3, y - size * 0.18, x + size * 0.3, y - size * 0.12);
  shGrad.addColorStop(0, bodyColorDark);
  shGrad.addColorStop(0.3, bodyColor);
  shGrad.addColorStop(0.7, bodyColor);
  shGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = shGrad;
  ctx.beginPath();
  ctx.ellipse(x + lurch, y - size * 0.16 - bodyBob, size * 0.28, size * 0.11, 0, 0, TAU);
  ctx.fill();
  for (let sm = 0; sm < 3; sm++) {
    const smX = x + (sm - 1) * size * 0.15 + lurch;
    const smY = y - size * 0.18 - bodyBob;
    ctx.fillStyle = `rgba(40,100,30,${0.15 + Math.sin(sm) * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(smX, smY, size * 0.035, size * 0.015, sm * 0.5, 0, TAU);
    ctx.fill();
  }

  // Glowing bioluminescent fungi (enhanced)
  const fungiColors = ["#88ff88", "#66ee66", "#aaff66", "#44dd44", "#66ff99"];
  for (let f = 0; f < 8; f++) {
    const fx = x + (f - 3.5) * size * 0.055 + lurch + Math.sin(f * 2.3) * size * 0.02;
    const fy = y - size * 0.19 + Math.sin(f * 1.8) * size * 0.04 - bodyBob;
    const fGlow = 0.5 + Math.sin(time * 3 + f * 1.3) * 0.3;
    const fSize = size * 0.016 + Math.sin(f * 1.2) * size * 0.006;
    setShadowBlur(ctx, 5 * zoom, `rgba(100,255,100,${fGlow})`);
    const capGrad = ctx.createRadialGradient(fx, fy - fSize * 0.3, 0, fx, fy, fSize);
    capGrad.addColorStop(0, fungiColors[f % 5]);
    capGrad.addColorStop(0.6, `rgba(80,200,80,${fGlow})`);
    capGrad.addColorStop(1, `rgba(40,120,40,${fGlow * 0.5})`);
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.ellipse(fx, fy, fSize, fSize * 0.6, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,200,${fGlow * 0.45})`;
    ctx.beginPath();
    ctx.arc(fx - fSize * 0.3, fy - fSize * 0.15, size * 0.004, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx + fSize * 0.2, fy - fSize * 0.1, size * 0.003, 0, TAU);
    ctx.fill();
    const stemGrad = ctx.createLinearGradient(fx, fy, fx, fy + size * 0.025);
    stemGrad.addColorStop(0, "#d4c8a8");
    stemGrad.addColorStop(1, "#b0a080");
    ctx.fillStyle = stemGrad;
    ctx.fillRect(fx - size * 0.004, fy, size * 0.008, size * 0.025);
    if (fGlow > 0.6) {
      const sporeAlpha = (fGlow - 0.6) * 2;
      ctx.fillStyle = `rgba(180,255,150,${sporeAlpha * 0.3})`;
      for (let spo = 0; spo < 2; spo++) {
        const spoPhase = (time * 2 + f + spo * 0.5) % 1;
        ctx.beginPath();
        ctx.arc(fx + (spo - 0.5) * size * 0.01, fy - spoPhase * size * 0.03, size * 0.002, 0, TAU);
        ctx.fill();
      }
    }
  }
  clearShadow(ctx);

  // Head with more detail
  const headY = y - size * 0.28 - bodyBob;
  const headGrad2 = ctx.createRadialGradient(x + lurch - size * 0.02, headY - size * 0.01, 0, x + lurch, headY, size * 0.12);
  headGrad2.addColorStop(0, bodyColorLight);
  headGrad2.addColorStop(0.4, bodyColor);
  headGrad2.addColorStop(0.8, bodyColorDark);
  headGrad2.addColorStop(1, "#0a1a08");
  ctx.fillStyle = headGrad2;
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY, size * 0.11, size * 0.09, 0, 0, TAU);
  ctx.fill();

  // Mossy beard
  ctx.fillStyle = "rgba(40,90,30,0.35)";
  for (let mb = 0; mb < 5; mb++) {
    const mbX = x + (mb - 2) * size * 0.02 + lurch;
    const mbLen = size * (0.04 + Math.sin(mb * 1.7) * 0.015);
    const mbWave = Math.sin(time * 2 + mb) * size * 0.003;
    ctx.beginPath();
    ctx.moveTo(mbX, headY + size * 0.06);
    ctx.quadraticCurveTo(mbX + mbWave, headY + size * 0.06 + mbLen * 0.5, mbX + mbWave * 1.5, headY + size * 0.06 + mbLen);
    ctx.lineTo(mbX + size * 0.005 + mbWave * 1.5, headY + size * 0.06 + mbLen);
    ctx.quadraticCurveTo(mbX + size * 0.005 + mbWave, headY + size * 0.06 + mbLen * 0.5, mbX + size * 0.005, headY + size * 0.06);
    ctx.fill();
  }
  for (let mt = 0; mt < 6; mt++) {
    ctx.fillStyle = `rgba(50,110,40,${0.2 + Math.sin(mt * 2) * 0.05})`;
    ctx.beginPath();
    ctx.arc(x + (mt - 2.5) * size * 0.018 + lurch, headY + size * 0.07 + Math.sin(mt) * size * 0.01, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // Brow ridge (enhanced)
  const browGrad = ctx.createLinearGradient(x - size * 0.12 + lurch, headY - size * 0.03, x + size * 0.12 + lurch, headY - size * 0.02);
  browGrad.addColorStop(0, bodyColorDark);
  browGrad.addColorStop(0.5, bodyColor);
  browGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = browGrad;
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY - size * 0.03, size * 0.12, size * 0.045, 0, 0, Math.PI);
  ctx.fill();

  // Beady eyes with glow (enhanced)
  setShadowBlur(ctx, 3 * zoom, "#ffaa00");
  for (const side of [-1, 1]) {
    const eyeX = x + side * size * 0.04 + lurch;
    const eyeY = headY - size * 0.01;
    ctx.fillStyle = "rgba(20,10,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.018, size * 0.014, 0, 0, TAU);
    ctx.fill();
    const eyeGrad = ctx.createRadialGradient(eyeX - size * 0.003, eyeY - size * 0.003, 0, eyeX, eyeY, size * 0.015);
    eyeGrad.addColorStop(0, "#ffee44");
    eyeGrad.addColorStop(0.5, "#ffdd00");
    eyeGrad.addColorStop(1, "#cc9900");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.015, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.007, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(eyeX - size * 0.004, eyeY - size * 0.005, size * 0.004, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Pointed ears with inner detail (enhanced)
  for (const side of [-1, 1]) {
    const earGrad = ctx.createLinearGradient(
      x + side * size * 0.09 + lurch, headY,
      x + side * size * 0.15 + lurch, headY - size * 0.05,
    );
    earGrad.addColorStop(0, bodyColor);
    earGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.09 + lurch, headY);
    ctx.lineTo(x + side * size * 0.16 + lurch, headY - size * 0.06);
    ctx.lineTo(x + side * size * 0.11 + lurch, headY + size * 0.02);
    ctx.fill();
    ctx.fillStyle = "rgba(180,120,80,0.2)";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.1 + lurch, headY);
    ctx.lineTo(x + side * size * 0.14 + lurch, headY - size * 0.04);
    ctx.lineTo(x + side * size * 0.11 + lurch, headY + size * 0.01);
    ctx.fill();
    ctx.fillStyle = "rgba(40,90,30,0.15)";
    ctx.beginPath();
    ctx.arc(x + side * size * 0.12 + lurch, headY - size * 0.01, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Nose (warty)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY + size * 0.025, size * 0.02, size * 0.015, 0, 0, TAU);
  ctx.fill();
  for (const side of [-1, 1]) {
    ctx.fillStyle = "rgba(20,10,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.008 + lurch, headY + size * 0.028, size * 0.005, size * 0.004, 0, 0, TAU);
    ctx.fill();
  }

  // Mouth with teeth and tusks (enhanced)
  ctx.fillStyle = "#1a1008";
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY + size * 0.05, size * 0.065, size * 0.024, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(120,60,50,0.3)";
  ctx.beginPath();
  ctx.ellipse(x + lurch, headY + size * 0.04, size * 0.06, size * 0.012, 0, 0, TAU);
  ctx.fill();
  for (let t = 0; t < 6; t++) {
    const toothGrad = ctx.createLinearGradient(
      x + (t - 2.5) * size * 0.016 + lurch, headY + size * 0.04,
      x + (t - 2.5) * size * 0.016 + lurch, headY + size * 0.028,
    );
    toothGrad.addColorStop(0, "#d4c8a8");
    toothGrad.addColorStop(1, "#b8a880");
    ctx.fillStyle = toothGrad;
    ctx.beginPath();
    ctx.moveTo(x + (t - 2.5) * size * 0.016 + lurch, headY + size * 0.04);
    ctx.lineTo(x + (t - 2.5) * size * 0.016 + size * 0.005 + lurch, headY + size * 0.028);
    ctx.lineTo(x + (t - 2.5) * size * 0.016 + size * 0.01 + lurch, headY + size * 0.04);
    ctx.fill();
  }
  for (const side of [-1, 1]) {
    const tuskGrad = ctx.createLinearGradient(
      x + side * size * 0.03 + lurch, headY + size * 0.04,
      x + side * size * 0.035 + lurch, headY - size * 0.025,
    );
    tuskGrad.addColorStop(0, "#c8b898");
    tuskGrad.addColorStop(0.3, "#d4c8a8");
    tuskGrad.addColorStop(0.6, "#f0e8d8");
    tuskGrad.addColorStop(1, "#c0b090");
    ctx.fillStyle = tuskGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.025 + lurch, headY + size * 0.04);
    ctx.quadraticCurveTo(x + side * size * 0.05 + lurch, headY + size * 0.01, x + side * size * 0.04 + lurch, headY - size * 0.025);
    ctx.lineTo(x + side * size * 0.045 + lurch, headY + size * 0.04);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,240,0.12)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.028 + lurch, headY + size * 0.035);
    ctx.quadraticCurveTo(x + side * size * 0.048 + lurch, headY + size * 0.008, x + side * size * 0.042 + lurch, headY - size * 0.02);
    ctx.stroke();
  }

  // Drool strand
  const droolPhase = (time * 0.8) % 2;
  if (droolPhase < 1.5) {
    const droolAlpha = droolPhase < 1 ? 0.2 : (1.5 - droolPhase) * 0.4;
    ctx.strokeStyle = `rgba(140,120,80,${droolAlpha})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + lurch, headY + size * 0.06);
    ctx.quadraticCurveTo(x + lurch + size * 0.005, headY + size * 0.08 + droolPhase * size * 0.03, x + lurch - size * 0.003, headY + size * 0.1 + droolPhase * size * 0.05);
    ctx.stroke();
  }
}

// ============================================================================
// DESERT REGION
// ============================================================================

// 10. PHOENIX — Glorious firebird of living flame
export function drawPhoenixEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.5;
  const flicker = Math.sin(time * 8) * 0.15;
  const wingFlap = Math.sin(time * 4.5) * 0.7;
  const wingFlapAbs = Math.abs(wingFlap);
  const hover = Math.sin(time * 2.5) * size * 0.03;
  const novaBurst = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const breathe = 1 + Math.sin(time * 3) * 0.03;
  const heatShimmer = Math.sin(time * 12) * 0.006;

  // Resurrection glow ring (outer pulsing halos)
  const resGlow = 0.12 + Math.sin(time * 1.5) * 0.07 + novaBurst * 0.15;
  ctx.strokeStyle = `rgba(255,200,100,${resGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y + hover, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255,180,60,${resGlow * 0.35})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y + hover, size * 0.8, size * 0.8 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255,150,30,${resGlow * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y + hover, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();

  // Radiant aura (large, pulsing, multi-layered sun glow)
  setShadowBlur(ctx, 28 * zoom, `rgba(255,150,0,${0.55 + flicker + novaBurst * 0.35})`);
  drawRadialAura(ctx, x, y + hover, size * 0.95, [
    { offset: 0, color: `rgba(255,255,240,${0.32 + novaBurst * 0.4})` },
    { offset: 0.08, color: `rgba(255,255,210,${0.28 + novaBurst * 0.35})` },
    { offset: 0.2, color: `rgba(255,210,90,${0.2 + novaBurst * 0.28})` },
    { offset: 0.4, color: `rgba(255,150,30,${0.12 + novaBurst * 0.18})` },
    { offset: 0.6, color: `rgba(255,90,0,${0.07 + novaBurst * 0.1})` },
    { offset: 0.8, color: `rgba(200,50,0,${0.03 + novaBurst * 0.05})` },
    { offset: 1, color: "rgba(120,20,0,0)" },
  ]);
  clearShadow(ctx);

  // Inner sun-like body glow (white-hot radiant disk)
  const sunPulse = 0.22 + Math.sin(time * 2) * 0.06 + novaBurst * 0.2;
  drawRadialAura(ctx, x, y - size * 0.03 + hover, size * 0.38, [
    { offset: 0, color: `rgba(255,255,255,${sunPulse * 0.7})` },
    { offset: 0.15, color: `rgba(255,255,220,${sunPulse * 0.5})` },
    { offset: 0.4, color: `rgba(255,230,120,${sunPulse * 0.3})` },
    { offset: 0.7, color: `rgba(255,180,50,${sunPulse * 0.12})` },
    { offset: 1, color: "rgba(255,150,30,0)" },
  ]);

  // Heat distortion shimmer (wavy translucent lines above)
  ctx.strokeStyle = `rgba(255,200,150,0.045)`;
  ctx.lineWidth = 1.2 * zoom;
  for (let h = 0; h < 6; h++) {
    const hy = y - size * 0.38 - h * size * 0.055 + hover;
    ctx.beginPath();
    for (let hx = -4; hx <= 4; hx++) {
      const px = x + hx * size * 0.07;
      const py = hy + Math.sin(time * 11 + hx * 2.2 + h * 1.7) * size * heatShimmer * (5 + h * 1.5);
      if (hx === -4) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Ground light pool (warm amber, isometric, multi-ring)
  const poolPulse = 0.14 + flicker * 0.08 + novaBurst * 0.18;
  ctx.fillStyle = `rgba(255,100,20,${poolPulse * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.54, size * 0.55, size * 0.55 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255,130,40,${poolPulse * 0.7})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.42 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255,180,70,${poolPulse})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.3, size * 0.3 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255,220,130,${poolPulse * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.15, size * 0.15 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();
  // Heat ripple rings on ground
  for (let hr = 0; hr < 3; hr++) {
    const hrPhase = (time * 0.5 + hr * 0.33) % 1;
    const hrR = size * (0.15 + hrPhase * 0.35);
    ctx.strokeStyle = `rgba(255,200,100,${(1 - hrPhase) * 0.08})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.5, hrR, hrR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  // Ash / smoke particles drifting down (denser)
  for (let a = 0; a < 14; a++) {
    const aPhase = (time * 0.35 + a * 0.071) % 1;
    const ax = x + Math.sin(time * 1.3 + a * 1.7) * size * 0.35;
    const ay = y + size * 0.18 + hover + aPhase * size * 0.42;
    const aSize = size * (0.005 + aPhase * 0.004);
    const aAlpha = (1 - aPhase) * 0.17;
    ctx.fillStyle = `rgba(90,70,50,${aAlpha})`;
    ctx.beginPath();
    ctx.arc(ax, ay, aSize, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(160,110,50,${aAlpha * 0.35})`;
    ctx.beginPath();
    ctx.arc(ax, ay, aSize * 0.45, 0, TAU);
    ctx.fill();
  }

  // Ember particle storm (dense swirling cloud with trails)
  for (let e = 0; e < 30; e++) {
    const ePhase = (time * 1.15 + e * 0.033) % 1;
    const eSpiral = e * 0.85 + time * 1.6;
    const eDist = size * (0.08 + e * 0.007) * (1 - ePhase * 0.35);
    const ex = x + Math.sin(eSpiral) * eDist + Math.cos(time * 2.8 + e * 0.9) * size * 0.06;
    const ey = y + size * 0.12 + hover - ePhase * size * 0.95;
    const eAlpha = Math.sin(ePhase * Math.PI) * 0.82;
    const eSize = size * 0.009 * (1 - ePhase * 0.45);
    const eGreen = Math.floor(240 - ePhase * 200);
    const eBlue = ePhase < 0.2 ? Math.floor(80 * (1 - ePhase * 5)) : 0;
    setShadowBlur(ctx, 3 * zoom, `rgba(255,${eGreen},0,0.5)`);
    ctx.fillStyle = `rgba(255,${eGreen},${eBlue},${eAlpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, TAU);
    ctx.fill();
    if (ePhase > 0.08) {
      ctx.strokeStyle = `rgba(255,${Math.floor(eGreen * 0.6)},0,${eAlpha * 0.25})`;
      ctx.lineWidth = eSize * 0.7;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.sin(eSpiral) * size * 0.018, ey + size * 0.028);
      ctx.stroke();
    }
  }
  clearShadow(ctx);

  // Ornate tail plumes (7 flowing fire streams with layered fire colors)
  const tailCount = 7;
  for (let tp = 0; tp < tailCount; tp++) {
    const tpSpread = (tp - (tailCount - 1) / 2) * 0.13;
    const tpPhaseOff = tp * 0.6;
    ctx.save();
    ctx.translate(x - size * 0.1, y + size * 0.08 + hover);
    ctx.rotate(tpSpread);

    for (let seg = 0; seg < 16; seg++) {
      const segT = seg / 16;
      const segX = -segT * size * 0.55;
      const segY = Math.sin(time * 5 + seg * 0.55 + tpPhaseOff) * size * 0.045 * segT;
      const segAlpha = (1 - segT) * 0.72;
      const segGreen = Math.floor(245 - segT * 225);
      const segBlue = segT < 0.2 ? Math.floor(100 * (1 - segT * 5)) : 0;
      const segSize = size * (0.038 - segT * 0.018);

      // Outer flame halo
      ctx.fillStyle = `rgba(255,${Math.max(0, segGreen - 80)},0,${segAlpha * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(segX, segY, segSize * 1.6, segSize * 1.0, tpSpread, 0, TAU);
      ctx.fill();

      // Middle flame
      ctx.fillStyle = `rgba(255,${Math.max(0, segGreen - 30)},0,${segAlpha * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(segX, segY, segSize * 1.2, segSize * 0.7, tpSpread, 0, TAU);
      ctx.fill();

      // Core flame (bright)
      ctx.fillStyle = `rgba(255,${segGreen},${segBlue},${segAlpha})`;
      ctx.beginPath();
      ctx.ellipse(segX, segY, segSize * 0.8, segSize * 0.4, tpSpread, 0, TAU);
      ctx.fill();
    }

    // Pure light trail dots along plume
    for (let ld = 0; ld < 6; ld++) {
      const ldT = ld / 6;
      const ldX = -ldT * size * 0.45;
      const ldY = Math.sin(time * 6 + ld * 0.9 + tpPhaseOff) * size * 0.02 * ldT;
      const ldAlpha = (1 - ldT) * 0.6 * (0.5 + Math.sin(time * 8 + ld * 2 + tp) * 0.5);
      setShadowBlur(ctx, 4 * zoom, `rgba(255,255,200,${ldAlpha})`);
      ctx.fillStyle = `rgba(255,255,240,${ldAlpha})`;
      ctx.beginPath();
      ctx.arc(ldX, ldY, size * 0.004, 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
    ctx.restore();
  }

  // Wings with detailed flame feather structure
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.06, y - size * 0.06 + hover);
    ctx.rotate(side * wingFlap * 0.45);

    // Wing membrane base (multi-stop fire gradient)
    const wingGrad = ctx.createLinearGradient(0, 0, side * size * 0.52, -size * 0.22);
    wingGrad.addColorStop(0, "rgba(255,255,230,0.88)");
    wingGrad.addColorStop(0.12, "rgba(255,240,140,0.8)");
    wingGrad.addColorStop(0.25, "rgba(255,200,70,0.7)");
    wingGrad.addColorStop(0.45, "rgba(255,140,20,0.55)");
    wingGrad.addColorStop(0.7, "rgba(255,70,0,0.35)");
    wingGrad.addColorStop(1, "rgba(180,30,0,0.12)");
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.quadraticCurveTo(
      side * size * 0.1, -size * 0.2,
      side * size * 0.28, -size * 0.28 + Math.sin(time * 5 + side) * size * 0.025,
    );
    ctx.quadraticCurveTo(
      side * size * 0.4, -size * 0.22,
      side * size * 0.5, -size * 0.15,
    );
    ctx.lineTo(side * size * 0.48, -size * 0.04);
    ctx.quadraticCurveTo(side * size * 0.38, size * 0.03, side * size * 0.22, size * 0.06);
    ctx.quadraticCurveTo(side * size * 0.1, size * 0.04, 0, size * 0.04);
    ctx.fill();

    // Wing bone structure (leading edge)
    const boneGrad = ctx.createLinearGradient(0, -size * 0.02, side * size * 0.3, -size * 0.25);
    boneGrad.addColorStop(0, "rgba(255,220,120,0.6)");
    boneGrad.addColorStop(1, "rgba(255,160,40,0.3)");
    ctx.strokeStyle = boneGrad;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.quadraticCurveTo(side * size * 0.12, -size * 0.18, side * size * 0.28, -size * 0.26);
    ctx.stroke();

    // Primary flight feathers (individual flame feathers along wing edge)
    for (let f = 0; f < 12; f++) {
      const frac = f / 11;
      const featherAngle = side * (-0.35 + frac * 0.28);
      const fx = side * (size * 0.06 + frac * size * 0.42);
      const fy = -size * 0.06 - frac * size * 0.12 + Math.sin(time * 6 + f * 0.7) * size * 0.012
        + (frac > 0.6 ? (frac - 0.6) * size * 0.15 : 0);
      const featherLen = size * (0.065 - frac * 0.02);
      const featherWidth = size * (0.013 - frac * 0.003);

      // Outer feather glow halo
      ctx.fillStyle = `rgba(255,${Math.floor(160 - f * 12)},0,${0.35 - frac * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(fx, fy, featherWidth * 2.5, featherLen * 0.6, featherAngle, 0, TAU);
      ctx.fill();

      // Feather body
      ctx.fillStyle = `rgba(255,${Math.floor(200 - f * 10)},${f < 4 ? 60 : 0},${0.55 - frac * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(fx, fy, featherWidth * 1.5, featherLen * 0.45, featherAngle, 0, TAU);
      ctx.fill();

      // Feather core (bright white-hot)
      ctx.fillStyle = `rgba(255,${Math.floor(245 - f * 8)},${f < 3 ? 100 : 20},${0.75 - frac * 0.35})`;
      ctx.beginPath();
      ctx.ellipse(fx, fy, featherWidth * 0.8, featherLen * 0.3, featherAngle, 0, TAU);
      ctx.fill();

      // Feather shaft line
      ctx.strokeStyle = `rgba(255,240,180,${0.2 - frac * 0.1})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx - Math.sin(featherAngle) * featherLen * 0.3, fy - Math.cos(featherAngle) * featherLen * 0.3);
      ctx.lineTo(fx + Math.sin(featherAngle) * featherLen * 0.3, fy + Math.cos(featherAngle) * featherLen * 0.3);
      ctx.stroke();
    }

    // Secondary coverts (smaller feathers closer to body)
    for (let sf = 0; sf < 8; sf++) {
      const sfFrac = sf / 7;
      const sfx = side * (size * 0.05 + sfFrac * size * 0.3);
      const sfy = -size * 0.02 + sfFrac * size * 0.03 + Math.sin(time * 5.5 + sf * 0.9) * size * 0.008;
      const sfLen = size * (0.03 - sfFrac * 0.008);
      ctx.fillStyle = `rgba(255,${Math.floor(220 - sf * 15)},${sf < 3 ? 60 : 0},${0.4 - sfFrac * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(sfx, sfy, size * 0.006, sfLen, side * (-0.2 + sfFrac * 0.15), 0, TAU);
      ctx.fill();
    }

    // Wing fire edge shimmer (animated glow along trailing edge)
    ctx.strokeStyle = `rgba(255,220,100,${0.35 + wingFlapAbs * 0.25})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.08, -size * 0.1);
    ctx.quadraticCurveTo(side * size * 0.2, -size * 0.26, side * size * 0.35, -size * 0.24);
    ctx.quadraticCurveTo(side * size * 0.44, -size * 0.18, side * size * 0.5, -size * 0.12);
    ctx.stroke();
    // Inner edge shimmer
    ctx.strokeStyle = `rgba(255,255,200,${0.15 + wingFlapAbs * 0.12})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.1, -size * 0.08);
    ctx.quadraticCurveTo(side * size * 0.22, -size * 0.22, side * size * 0.38, -size * 0.2);
    ctx.stroke();

    // Wing tip ember spray
    for (let we = 0; we < 4; we++) {
      const wePhase = (time * 2.5 + we * 0.25 + (side > 0 ? 0.5 : 0)) % 1;
      const weX = side * size * (0.45 + wePhase * 0.08);
      const weY = -size * 0.14 + Math.sin(time * 7 + we * 1.5) * size * 0.02 - wePhase * size * 0.06;
      const weAlpha = (1 - wePhase) * 0.5;
      ctx.fillStyle = `rgba(255,${Math.floor(200 - wePhase * 150)},0,${weAlpha})`;
      ctx.beginPath();
      ctx.arc(weX, weY, size * 0.004 * (1 - wePhase * 0.5), 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  // Body (radiant, white-hot core with feather texture)
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.06 + hover, 0, x, y + hover, size * 0.18);
  bodyGrad.addColorStop(0, "#fffff5");
  bodyGrad.addColorStop(0.1, "#fffce8");
  bodyGrad.addColorStop(0.25, "#ffec90");
  bodyGrad.addColorStop(0.45, "#ffc040");
  bodyGrad.addColorStop(0.65, "#ff8818");
  bodyGrad.addColorStop(0.85, "#ee4400");
  bodyGrad.addColorStop(1, "#aa2200");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.03 + hover, size * 0.14 * breathe + flicker * size * 0.015, size * 0.18, 0, 0, TAU);
  ctx.fill();

  // Body plumage detail (feather-like scales in rows)
  ctx.strokeStyle = "rgba(255,180,50,0.2)";
  ctx.lineWidth = 0.6 * zoom;
  for (let bp = 0; bp < 10; bp++) {
    const bpY = y - size * 0.12 + bp * size * 0.024 + hover;
    const bpW = size * 0.11 * (1 - Math.abs(bp - 5) * 0.12);
    ctx.beginPath();
    ctx.ellipse(x, bpY, bpW, size * 0.007, 0, 0, Math.PI);
    ctx.stroke();
  }
  // Feather detail lines (diagonal)
  ctx.strokeStyle = "rgba(255,200,80,0.1)";
  ctx.lineWidth = 0.4 * zoom;
  for (let fd = 0; fd < 6; fd++) {
    const fdY = y - size * 0.08 + fd * size * 0.03 + hover;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x, fdY);
      ctx.lineTo(x + side * size * 0.08, fdY + size * 0.015);
      ctx.stroke();
    }
  }

  // Breast flame (white-hot pulsing glow at chest)
  const breastPulse = 0.25 + flicker * 0.12 + novaBurst * 0.15;
  ctx.fillStyle = `rgba(255,255,245,${breastPulse})`;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.09 + hover, size * 0.065, size * 0.085, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${breastPulse * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.09 + hover, size * 0.035, size * 0.05, 0, 0, TAU);
  ctx.fill();

  // Elegant curved neck with feather scales
  const neckGrad = ctx.createLinearGradient(x, y - size * 0.12 + hover, x, y - size * 0.24 + hover);
  neckGrad.addColorStop(0, "#ffcc50");
  neckGrad.addColorStop(0.5, "#ffe080");
  neckGrad.addColorStop(1, "#ffd060");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.045, y - size * 0.12 + hover);
  ctx.quadraticCurveTo(x - size * 0.025, y - size * 0.2 + hover, x, y - size * 0.25 + hover);
  ctx.quadraticCurveTo(x + size * 0.025, y - size * 0.2 + hover, x + size * 0.045, y - size * 0.12 + hover);
  ctx.fill();
  // Neck feather texture
  ctx.strokeStyle = "rgba(255,200,80,0.15)";
  ctx.lineWidth = 0.4 * zoom;
  for (let nf = 0; nf < 5; nf++) {
    const nfY = y - size * 0.14 - nf * size * 0.022 + hover;
    const nfW = size * (0.035 - nf * 0.004);
    ctx.beginPath();
    ctx.ellipse(x, nfY, nfW, size * 0.005, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Head (ornate, radiant)
  const headY = y - size * 0.27 + hover;
  const headGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.075);
  headGrad.addColorStop(0, "#fffff5");
  headGrad.addColorStop(0.25, "#ffee90");
  headGrad.addColorStop(0.55, "#ffbb40");
  headGrad.addColorStop(0.8, "#ff8818");
  headGrad.addColorStop(1, "#dd6600");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.07, size * 0.06, 0, 0, TAU);
  ctx.fill();
  // Head highlight
  ctx.fillStyle = "rgba(255,255,240,0.15)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.015, headY - size * 0.015, size * 0.03, size * 0.02, -0.3, 0, TAU);
  ctx.fill();

  // Crown crest (elaborate flame plumes — 9 plumes with layered fire)
  for (let c = 0; c < 9; c++) {
    const cAngle = -Math.PI * 0.45 + c * 0.16;
    const cLen = size * (0.042 + c * 0.005) + Math.sin(time * 9 + c * 1.6) * size * 0.018;
    const cW = size * 0.008;
    const cGreen = 170 + c * 10;
    const cx2 = x + Math.cos(cAngle) * size * 0.045;
    const cy2 = headY + Math.sin(cAngle) * size * 0.03 - cLen;

    // Outermost plume halo
    ctx.fillStyle = `rgba(255,${Math.max(0, cGreen - 100)},0,${0.3 - c * 0.025})`;
    ctx.beginPath();
    ctx.ellipse(cx2, cy2, cW * 2.5, cLen * 0.5, cAngle, 0, TAU);
    ctx.fill();

    // Middle plume
    ctx.fillStyle = `rgba(255,${Math.max(0, cGreen - 40)},0,${0.5 - c * 0.035})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(cAngle) * size * 0.043,
      headY + Math.sin(cAngle) * size * 0.028 - cLen * 0.95,
      cW * 1.6, cLen * 0.38, cAngle, 0, TAU,
    );
    ctx.fill();

    // Core plume (bright)
    ctx.fillStyle = `rgba(255,${cGreen},${c < 4 ? 80 : 15},${0.75 - c * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(cAngle) * size * 0.04,
      headY + Math.sin(cAngle) * size * 0.025 - cLen * 0.88,
      cW * 0.8, cLen * 0.28, cAngle, 0, TAU,
    );
    ctx.fill();

    // Flame tip spark
    if (c % 2 === 0) {
      ctx.fillStyle = `rgba(255,255,220,${0.4 + Math.sin(time * 10 + c * 3) * 0.2})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(cAngle) * size * 0.038,
        headY + Math.sin(cAngle) * size * 0.022 - cLen * 0.95,
        size * 0.003, 0, TAU,
      );
      ctx.fill();
    }
  }

  // Detailed beak (curved raptor-like with ridge and mandible detail)
  // Upper mandible
  const beakGrad = ctx.createLinearGradient(x + size * 0.05, headY, x + size * 0.13, headY + size * 0.01);
  beakGrad.addColorStop(0, "#ffaa20");
  beakGrad.addColorStop(0.5, "#ff9000");
  beakGrad.addColorStop(1, "#cc6600");
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05, headY - size * 0.013);
  ctx.quadraticCurveTo(x + size * 0.09, headY - size * 0.008, x + size * 0.13, headY + size * 0.01);
  ctx.quadraticCurveTo(x + size * 0.1, headY + size * 0.015, x + size * 0.07, headY + size * 0.012);
  ctx.lineTo(x + size * 0.05, headY + size * 0.005);
  ctx.closePath();
  ctx.fill();
  // Beak ridge line
  ctx.strokeStyle = "rgba(200,120,20,0.3)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.055, headY - size * 0.005);
  ctx.quadraticCurveTo(x + size * 0.09, headY - size * 0.002, x + size * 0.12, headY + size * 0.012);
  ctx.stroke();
  // Lower mandible
  ctx.fillStyle = "#e88800";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.055, headY + size * 0.008);
  ctx.quadraticCurveTo(x + size * 0.085, headY + size * 0.02, x + size * 0.11, headY + size * 0.018);
  ctx.quadraticCurveTo(x + size * 0.09, headY + size * 0.026, x + size * 0.055, headY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  // Beak hook tip (dark)
  ctx.fillStyle = "#993300";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.115, headY + size * 0.008);
  ctx.lineTo(x + size * 0.13, headY + size * 0.012);
  ctx.lineTo(x + size * 0.12, headY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  // Nostril
  ctx.fillStyle = "rgba(100,50,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.075, headY + size * 0.001, size * 0.004, size * 0.003, 0.3, 0, TAU);
  ctx.fill();

  // Eyes (blazing white-hot with star-burst and fire trail)
  setShadowBlur(ctx, 10 * zoom, "#ffffff");
  for (const side of [-1, 1]) {
    const eyeX = x + size * 0.025;
    const eyeY = headY - size * 0.01 + side * size * 0.016;
    const eyePulse = 0.8 + Math.sin(time * 6 + side * 2) * 0.2;

    // Outer glow halo
    const eyeHaloGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.025);
    eyeHaloGrad.addColorStop(0, `rgba(255,255,255,${eyePulse * 0.4})`);
    eyeHaloGrad.addColorStop(0.3, `rgba(255,240,150,${eyePulse * 0.25})`);
    eyeHaloGrad.addColorStop(0.6, `rgba(255,180,50,${eyePulse * 0.1})`);
    eyeHaloGrad.addColorStop(1, "rgba(255,120,0,0)");
    ctx.fillStyle = eyeHaloGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.025, 0, TAU);
    ctx.fill();

    // Eye glow aura
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.018);
    eyeGrad.addColorStop(0, `rgba(255,255,255,${eyePulse})`);
    eyeGrad.addColorStop(0.35, `rgba(255,240,160,${eyePulse * 0.8})`);
    eyeGrad.addColorStop(0.7, `rgba(255,200,60,${eyePulse * 0.5})`);
    eyeGrad.addColorStop(1, "rgba(255,150,0,0)");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.018, 0, TAU);
    ctx.fill();

    // Eye core (pure white)
    ctx.fillStyle = `rgba(255,255,255,${eyePulse})`;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.008, 0, TAU);
    ctx.fill();

    // Star-burst rays from eye
    for (let sr = 0; sr < 6; sr++) {
      const srAngle = sr * (TAU / 6) + time * 3;
      const srLen = size * 0.012 * (0.6 + Math.sin(time * 8 + sr * 1.5) * 0.4);
      ctx.strokeStyle = `rgba(255,255,200,${eyePulse * 0.35})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(eyeX + Math.cos(srAngle) * size * 0.006, eyeY + Math.sin(srAngle) * size * 0.006);
      ctx.lineTo(eyeX + Math.cos(srAngle) * srLen, eyeY + Math.sin(srAngle) * srLen);
      ctx.stroke();
    }

    // Fire trail streaming behind eye
    ctx.strokeStyle = `rgba(255,200,50,${eyePulse * 0.35})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX - size * 0.01, eyeY);
    ctx.quadraticCurveTo(
      eyeX - size * 0.04, eyeY + side * size * 0.008,
      eyeX - size * 0.065, eyeY + side * size * 0.003 - size * 0.02,
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,150,0,${eyePulse * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX - size * 0.015, eyeY + side * size * 0.003);
    ctx.quadraticCurveTo(
      eyeX - size * 0.05, eyeY + side * size * 0.012,
      eyeX - size * 0.08, eyeY + side * size * 0.006 - size * 0.025,
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Detailed talons (golden, with gradient legs and spread toes)
  for (const side of [-1, 1]) {
    const talonX = x + side * size * 0.06;
    const talonY = y + size * 0.14 + hover;

    // Leg segment with gradient
    const legGrad = ctx.createLinearGradient(talonX, talonY - size * 0.02, talonX, talonY + size * 0.06);
    legGrad.addColorStop(0, "#eebb44");
    legGrad.addColorStop(0.5, "#cc9922");
    legGrad.addColorStop(1, "#aa7711");
    ctx.strokeStyle = legGrad;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(talonX, talonY);
    ctx.lineTo(talonX + side * size * 0.01, talonY + size * 0.05);
    ctx.stroke();

    // Ankle joint
    ctx.fillStyle = "#ddaa33";
    ctx.beginPath();
    ctx.arc(talonX + side * size * 0.01, talonY + size * 0.05, size * 0.008, 0, TAU);
    ctx.fill();

    // Toe segments (4 toes spread)
    for (let tc = 0; tc < 4; tc++) {
      const toeAngle = (tc - 1.5) * 0.35 + side * 0.1;
      const toeLen = size * (0.03 + (tc === 1 || tc === 2 ? 0.005 : 0));
      const toeBaseX = talonX + side * size * 0.01;
      const toeBaseY = talonY + size * 0.05;
      const toeTipX = toeBaseX + Math.sin(toeAngle) * toeLen;
      const toeTipY = toeBaseY + Math.cos(toeAngle) * toeLen;

      ctx.strokeStyle = "#bb8822";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(toeBaseX, toeBaseY);
      ctx.lineTo(toeTipX, toeTipY);
      ctx.stroke();

      // Talon claw (sharp, curved tip)
      ctx.fillStyle = "#885500";
      ctx.beginPath();
      ctx.moveTo(toeTipX - size * 0.003, toeTipY);
      ctx.lineTo(toeTipX + Math.sin(toeAngle) * size * 0.012, toeTipY + Math.cos(toeAngle) * size * 0.012);
      ctx.lineTo(toeTipX + size * 0.003, toeTipY);
      ctx.closePath();
      ctx.fill();
    }

    // Talon glow
    setShadowBlur(ctx, 3 * zoom, "rgba(255,180,50,0.3)");
    ctx.fillStyle = "rgba(255,200,100,0.15)";
    ctx.beginPath();
    ctx.arc(talonX + side * size * 0.01, talonY + size * 0.06, size * 0.02, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Nova burst attack (dramatic, multi-layered with shockwave)
  if (isAttacking) {
    const burstR = size * 0.75 * novaBurst;
    // Shockwave outer ring
    ctx.strokeStyle = `rgba(255,80,0,${novaBurst * 0.18})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + hover, burstR * 1.6, burstR * 1.6 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    // Outer fire ring
    ctx.strokeStyle = `rgba(255,120,0,${novaBurst * 0.28})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + hover, burstR * 1.3, burstR * 1.3 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    // Middle ring (bright)
    ctx.strokeStyle = `rgba(255,190,50,${novaBurst * 0.5})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + hover, burstR, burstR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    // Inner ring (white-hot)
    ctx.strokeStyle = `rgba(255,245,180,${novaBurst * 0.65})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + hover, burstR * 0.55, burstR * 0.55 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    // Nova flash particles
    for (let np = 0; np < 12; np++) {
      const npAngle = (np / 12) * TAU + time * 3;
      const npDist = burstR * (0.6 + Math.sin(time * 5 + np * 2) * 0.2);
      const npx = x + Math.cos(npAngle) * npDist;
      const npy = y + hover + Math.sin(npAngle) * npDist * ISO_Y_RATIO;
      setShadowBlur(ctx, 3 * zoom, "rgba(255,220,100,0.5)");
      ctx.fillStyle = `rgba(255,220,100,${novaBurst * 0.55})`;
      ctx.beginPath();
      ctx.arc(npx, npy, size * 0.013, 0, TAU);
      ctx.fill();
    }
    // Radial flame rays
    for (let fr = 0; fr < 8; fr++) {
      const frAngle = (fr / 8) * TAU + time * 2;
      const frLen = burstR * 1.2;
      ctx.strokeStyle = `rgba(255,180,50,${novaBurst * 0.25})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(frAngle) * burstR * 0.3, y + hover + Math.sin(frAngle) * burstR * 0.3 * ISO_Y_RATIO);
      ctx.lineTo(x + Math.cos(frAngle) * frLen, y + hover + Math.sin(frAngle) * frLen * ISO_Y_RATIO);
      ctx.stroke();
    }
    clearShadow(ctx);
  }
}

// 11. BASILISK — Giant stone-scaled serpent with petrifying gaze
export function drawBasiliskEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.45;
  const slither = time * 2.5;
  const coilPhase = Math.sin(slither) * 0.15;
  const eyeFlash = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.5 + 0.5 : 0;
  const breathe = 1 + Math.sin(time * 2) * 0.015;
  const muscleRipple = Math.sin(time * 3.5) * 0.02;

  // Ground-hugging miasma / toxic fog clouds
  for (let fog = 0; fog < 10; fog++) {
    const fogAngle = fog * 0.7 + time * 0.2;
    const fogDist = size * (0.2 + Math.sin(time * 0.5 + fog * 0.8) * 0.08);
    const fogX = x + Math.cos(fogAngle) * fogDist;
    const fogY = y + size * 0.35 + Math.sin(fogAngle) * fogDist * ISO_Y_RATIO * 0.4;
    const fogAlpha = 0.06 + Math.sin(time * 0.8 + fog * 1.2) * 0.03;
    const fogR = size * (0.06 + Math.sin(time * 0.3 + fog) * 0.015);
    const fogGrad = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, fogR);
    fogGrad.addColorStop(0, `rgba(80,120,60,${fogAlpha})`);
    fogGrad.addColorStop(0.5, `rgba(100,130,80,${fogAlpha * 0.5})`);
    fogGrad.addColorStop(1, "rgba(90,110,70,0)");
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.ellipse(fogX, fogY, fogR, fogR * 0.4, 0, 0, TAU);
    ctx.fill();
  }

  // Ambient stone/dust particles rising
  for (let sd = 0; sd < 12; sd++) {
    const sdPhase = (time * 0.35 + sd * 0.22) % 1.5;
    const sdAngle = sd * 1.05 + time * 0.25;
    const sdDist = size * 0.22 + sdPhase * size * 0.12;
    const sdx = x + Math.cos(sdAngle) * sdDist;
    const sdy = y + size * 0.15 - sdPhase * size * 0.3;
    const sdAlpha = (1 - sdPhase / 1.5) * 0.22;
    if (sdAlpha > 0.01) {
      ctx.fillStyle = `rgba(155,155,130,${sdAlpha})`;
      ctx.beginPath();
      ctx.arc(sdx, sdy, size * 0.006 + sdPhase * size * 0.003, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(180,180,160,${sdAlpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(sdx, sdy, size * 0.003, 0, TAU);
      ctx.fill();
    }
  }

  // Petrification eye beams when attacking
  if (isAttacking && eyeFlash > 0.3) {
    const beamAlpha = (eyeFlash - 0.3) * 1.4;
    // Wide petrification cone with gradient layers
    setShadowBlur(ctx, 15 * zoom, `rgba(0,255,100,${beamAlpha})`);
    const coneGrad = ctx.createLinearGradient(x, y - size * 0.35, x + size * 0.55, y - size * 0.35);
    coneGrad.addColorStop(0, `rgba(120,255,160,${beamAlpha * 0.55})`);
    coneGrad.addColorStop(0.3, `rgba(80,220,120,${beamAlpha * 0.35})`);
    coneGrad.addColorStop(0.7, `rgba(60,180,100,${beamAlpha * 0.15})`);
    coneGrad.addColorStop(1, "rgba(40,150,80,0)");
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.35);
    ctx.lineTo(x + size * 0.55, y - size * 0.45);
    ctx.lineTo(x + size * 0.55, y - size * 0.22);
    ctx.closePath();
    ctx.fill();
    // Inner bright cone
    const innerCone = ctx.createLinearGradient(x, y - size * 0.35, x + size * 0.4, y - size * 0.35);
    innerCone.addColorStop(0, `rgba(200,255,220,${beamAlpha * 0.4})`);
    innerCone.addColorStop(1, "rgba(150,255,180,0)");
    ctx.fillStyle = innerCone;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.35);
    ctx.lineTo(x + size * 0.4, y - size * 0.4);
    ctx.lineTo(x + size * 0.4, y - size * 0.28);
    ctx.closePath();
    ctx.fill();
    // Individual beam lines from each eye
    ctx.lineWidth = 2.5 * zoom;
    for (const side of [-1, 1]) {
      const eyeX = x + side * size * 0.04;
      const eyeY = y - size * 0.35;
      ctx.strokeStyle = `rgba(120,255,160,${beamAlpha * 0.65})`;
      ctx.beginPath();
      ctx.moveTo(eyeX, eyeY);
      ctx.lineTo(eyeX + size * 0.48, eyeY + side * size * 0.045);
      ctx.stroke();
      // Beam shimmer
      ctx.strokeStyle = `rgba(200,255,220,${beamAlpha * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(eyeX, eyeY);
      ctx.quadraticCurveTo(
        eyeX + size * 0.25, eyeY + side * size * 0.02 + Math.sin(time * 15) * size * 0.01,
        eyeX + size * 0.48, eyeY + side * size * 0.04,
      );
      ctx.stroke();
    }
    // Petrification ring on ground with stone chips
    const petrifyR = beamAlpha * size * 0.35;
    ctx.strokeStyle = `rgba(160,160,140,${beamAlpha * 0.45})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.35, y + size * 0.2, petrifyR, petrifyR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(140,140,120,${beamAlpha * 0.25})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.35, y + size * 0.2, petrifyR * 1.3, petrifyR * 1.3 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    // Stone chip particles around petrification zone
    for (let sc = 0; sc < 5; sc++) {
      const scAngle = sc * 1.3 + time * 4;
      const scDist = petrifyR * (0.6 + Math.sin(time * 5 + sc) * 0.3);
      const scx = x + size * 0.35 + Math.cos(scAngle) * scDist;
      const scy = y + size * 0.2 + Math.sin(scAngle) * scDist * ISO_Y_RATIO;
      ctx.fillStyle = `rgba(180,175,155,${beamAlpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(scx, scy, size * 0.005, 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
  }

  // Coiled body segments (thicker, more segments, muscle definition)
  const coilSegments = 25;
  const bodyPoints: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i <= coilSegments; i++) {
    const t2 = i / coilSegments;
    const coilAngle = t2 * TAU * 2.0 + slither;
    const coilR = size * 0.24 * (1 - t2 * 0.5);
    const bx = x + Math.cos(coilAngle) * coilR;
    const by = y + size * 0.24 - t2 * size * 0.62 + Math.sin(coilAngle) * coilR * 0.3;
    bodyPoints.push({ x: bx, y: by, r: size * 0.072 * (1 - t2 * 0.32) * breathe });
  }

  // Draw body with layered armored scales
  for (let i = 0; i < coilSegments; i++) {
    const p = bodyPoints[i];
    const np = bodyPoints[i + 1];
    const segAngle = Math.atan2(np.y - p.y, np.x - p.x);

    // Thick body stroke connecting segments with muscle bulge
    if (i < coilSegments - 1) {
      const bulge = 1 + Math.sin(i * 0.5 + muscleRipple * 10) * 0.08;
      const connGrad = ctx.createLinearGradient(
        p.x - Math.sin(segAngle) * p.r, p.y + Math.cos(segAngle) * p.r,
        p.x + Math.sin(segAngle) * p.r, p.y - Math.cos(segAngle) * p.r,
      );
      connGrad.addColorStop(0, bodyColorDark);
      connGrad.addColorStop(0.3, bodyColor);
      connGrad.addColorStop(0.5, bodyColorLight);
      connGrad.addColorStop(0.7, bodyColor);
      connGrad.addColorStop(1, bodyColorDark);
      ctx.strokeStyle = connGrad;
      ctx.lineWidth = p.r * 1.9 * bulge;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(np.x, np.y);
      ctx.stroke();
    }

    // Armored scale plate (overlapping, with individual highlight)
    const scaleGrad = ctx.createRadialGradient(
      p.x - p.r * 0.25, p.y - p.r * 0.25, 0,
      p.x, p.y, p.r,
    );
    scaleGrad.addColorStop(0, bodyColorLight);
    scaleGrad.addColorStop(0.3, bodyColor);
    scaleGrad.addColorStop(0.65, bodyColorDark);
    scaleGrad.addColorStop(1, "#1a1a10");
    ctx.fillStyle = scaleGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.92, 0, TAU);
    ctx.fill();

    // Scale edge ridge (dark)
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.87, segAngle + Math.PI * 0.55, segAngle + Math.PI * 1.45);
    ctx.stroke();
    // Scale highlight crescent (light catch)
    ctx.strokeStyle = "rgba(255,255,240,0.1)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.72, segAngle - Math.PI * 0.45, segAngle + Math.PI * 0.15);
    ctx.stroke();
    // Individual scale highlight dot
    ctx.fillStyle = "rgba(255,255,230,0.06)";
    ctx.beginPath();
    ctx.arc(p.x - p.r * 0.2, p.y - p.r * 0.2, p.r * 0.2, 0, TAU);
    ctx.fill();

    // Belly plates (lighter underside, every segment)
    const bellyX = p.x + Math.sin(segAngle) * p.r * 0.35;
    const bellyY = p.y - Math.cos(segAngle) * p.r * 0.35;
    ctx.fillStyle = "rgba(210,210,180,0.18)";
    ctx.beginPath();
    ctx.ellipse(bellyX, bellyY, p.r * 0.45, p.r * 0.28, segAngle, 0, TAU);
    ctx.fill();
    // Belly plate edge line
    ctx.strokeStyle = "rgba(180,180,150,0.1)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.ellipse(bellyX, bellyY, p.r * 0.42, p.r * 0.25, segAngle, 0, Math.PI);
    ctx.stroke();

    // Stone cracks/texture on scales (3 per segment)
    ctx.strokeStyle = "rgba(0,0,0,0.07)";
    ctx.lineWidth = 0.5 * zoom;
    for (let d = 0; d < 3; d++) {
      const cAngle = d * 1.3 + i * 0.75;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(cAngle) * p.r * 0.15, p.y + Math.sin(cAngle) * p.r * 0.15);
      ctx.lineTo(p.x + Math.cos(cAngle + 0.25) * p.r * 0.55, p.y + Math.sin(cAngle + 0.25) * p.r * 0.55);
      ctx.stroke();
    }

    // Muscle definition lines under scales
    if (i % 3 === 0) {
      ctx.strokeStyle = "rgba(0,0,0,0.04)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.5, segAngle - 0.5, segAngle + 0.5);
      ctx.stroke();
    }
  }
  ctx.lineCap = "butt";

  // Head (armored with crown crest)
  const headP = bodyPoints[coilSegments];
  const prevHeadP = bodyPoints[coilSegments - 1];
  const headDir = Math.atan2(headP.y - prevHeadP.y, headP.x - prevHeadP.x);

  // Neck frill / collar plates with veined membrane
  for (let f = 0; f < 8; f++) {
    const fAngle = headDir + Math.PI + (-1.0 + f * 0.29);
    const frillLen = size * 0.05 + Math.sin(time * 2.2 + f * 0.9) * size * 0.006;
    const frillBaseX = headP.x + Math.cos(fAngle - 0.12) * size * 0.055;
    const frillBaseY = headP.y + Math.sin(fAngle - 0.12) * size * 0.045;
    const frillTipX = headP.x + Math.cos(fAngle) * (size * 0.055 + frillLen);
    const frillTipY = headP.y + Math.sin(fAngle) * (size * 0.045 + frillLen);
    const frillEndX = headP.x + Math.cos(fAngle + 0.12) * size * 0.055;
    const frillEndY = headP.y + Math.sin(fAngle + 0.12) * size * 0.045;

    // Membrane fill
    const memGrad = ctx.createLinearGradient(frillBaseX, frillBaseY, frillTipX, frillTipY);
    memGrad.addColorStop(0, f % 2 === 0 ? bodyColorDark : bodyColor);
    memGrad.addColorStop(0.7, "rgba(60,50,30,0.6)");
    memGrad.addColorStop(1, "rgba(40,35,20,0.3)");
    ctx.fillStyle = memGrad;
    ctx.beginPath();
    ctx.moveTo(frillBaseX, frillBaseY);
    ctx.lineTo(frillTipX, frillTipY);
    ctx.lineTo(frillEndX, frillEndY);
    ctx.fill();

    // Vein lines on membrane
    ctx.strokeStyle = "rgba(80,60,30,0.15)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo((frillBaseX + frillEndX) / 2, (frillBaseY + frillEndY) / 2);
    ctx.lineTo(frillTipX, frillTipY);
    ctx.stroke();
    if (f % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(frillBaseX, frillBaseY);
      ctx.quadraticCurveTo(
        (frillBaseX + frillTipX) / 2 + Math.sin(fAngle) * size * 0.008,
        (frillBaseY + frillTipY) / 2,
        frillTipX * 0.7 + frillEndX * 0.3, frillTipY * 0.7 + frillEndY * 0.3,
      );
      ctx.stroke();
    }
  }

  // Head body (larger, more armored)
  const headGrad = ctx.createRadialGradient(
    headP.x - size * 0.012, headP.y - size * 0.012, 0,
    headP.x, headP.y, size * 0.1,
  );
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.3, bodyColor);
  headGrad.addColorStop(0.7, bodyColorDark);
  headGrad.addColorStop(1, "#1a1a10");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headP.x, headP.y, size * 0.11, size * 0.082, coilPhase, 0, TAU);
  ctx.fill();
  // Brow ridge plates
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(
      headP.x + side * size * 0.03, headP.y - size * 0.03,
      size * 0.035, size * 0.015, side * 0.3, 0, TAU,
    );
    ctx.fill();
  }

  // Crown crest (sharper, gem-tipped — 9 spikes)
  for (let c = 0; c < 9; c++) {
    const cAngle = headDir - Math.PI * 0.5 + (-0.6 + c * 0.15);
    const cLen = size * (0.055 + Math.sin(c * 1.1) * 0.012);
    const cBaseX = headP.x + Math.cos(cAngle) * size * 0.065;
    const cBaseY = headP.y + Math.sin(cAngle) * size * 0.055;
    const cTipX = headP.x + Math.cos(cAngle) * (size * 0.065 + cLen);
    const cTipY = headP.y + Math.sin(cAngle) * (size * 0.055 + cLen);

    // Spike gradient
    const cGrad = ctx.createLinearGradient(cBaseX, cBaseY, cTipX, cTipY);
    cGrad.addColorStop(0, bodyColorDark);
    cGrad.addColorStop(0.6, "#2a2a1a");
    cGrad.addColorStop(1, "#1a1a0a");
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(headP.x + Math.cos(cAngle - 0.09) * size * 0.065, headP.y + Math.sin(cAngle - 0.09) * size * 0.055);
    ctx.lineTo(cTipX, cTipY);
    ctx.lineTo(headP.x + Math.cos(cAngle + 0.09) * size * 0.065, headP.y + Math.sin(cAngle + 0.09) * size * 0.055);
    ctx.fill();

    // Gem-like tip on each spike
    const gemHue = c % 3 === 0 ? "rgba(0,255,120," : c % 3 === 1 ? "rgba(120,255,200," : "rgba(80,200,150,";
    const gemAlpha = 0.5 + Math.sin(time * 2 + c * 1.5) * 0.2;
    setShadowBlur(ctx, 2 * zoom, `rgba(0,255,100,${gemAlpha * 0.5})`);
    ctx.fillStyle = gemHue + `${gemAlpha})`;
    ctx.beginPath();
    ctx.arc(cTipX, cTipY, size * 0.005, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Deadly petrifying eyes with hypnotic spiral
  for (const side of [-1, 1]) {
    const eyeX = headP.x + side * size * 0.042;
    const eyeY = headP.y - size * 0.016;

    // Outer glow aura (larger)
    setShadowBlur(ctx, 8 * zoom, `rgba(0,255,100,${0.45 + eyeFlash * 0.45})`);
    const eyeOuterGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.025);
    eyeOuterGrad.addColorStop(0, `rgba(180,255,200,${0.6 + eyeFlash * 0.2})`);
    eyeOuterGrad.addColorStop(0.5, `rgba(0,255,100,${0.35 + eyeFlash * 0.3})`);
    eyeOuterGrad.addColorStop(1, `rgba(0,180,60,0)`);
    ctx.fillStyle = eyeOuterGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.025, 0, TAU);
    ctx.fill();

    // Eye body
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.019);
    eyeGrad.addColorStop(0, `rgba(210,255,215,${0.92 + eyeFlash * 0.08})`);
    eyeGrad.addColorStop(0.35, `rgba(0,255,100,${0.85 + eyeFlash * 0.15})`);
    eyeGrad.addColorStop(0.7, `rgba(0,200,80,${0.7 + eyeFlash * 0.2})`);
    eyeGrad.addColorStop(1, `rgba(0,140,50,${0.5 + eyeFlash * 0.3})`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.019, size * 0.015, 0, 0, TAU);
    ctx.fill();

    // Vertical slit pupil
    ctx.fillStyle = "#001a00";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.004, size * 0.013, 0, 0, TAU);
    ctx.fill();

    // Hypnotic concentric spiral rings (always visible, stronger during attack)
    const spiralAlpha = 0.1 + eyeFlash * 0.35;
    ctx.strokeStyle = `rgba(0,255,100,${spiralAlpha})`;
    ctx.lineWidth = 0.4 * zoom;
    for (let r = 1; r <= 4; r++) {
      const spiralR = size * 0.005 + r * size * 0.005;
      const spiralOffset = time * 3 * (r % 2 === 0 ? 1 : -1);
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, spiralR, spiralOffset, spiralOffset + Math.PI * 1.5);
      ctx.stroke();
    }
    // Eye glow beam line (subtle, always present)
    ctx.strokeStyle = `rgba(0,255,100,${0.08 + eyeFlash * 0.3})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX + size * 0.02, eyeY);
    ctx.lineTo(eyeX + size * 0.06, eyeY + side * size * 0.005);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Detailed snout ridge with texture
  const snoutGrad = ctx.createRadialGradient(
    headP.x + Math.cos(headDir) * size * 0.06, headP.y + Math.sin(headDir) * size * 0.04, 0,
    headP.x + Math.cos(headDir) * size * 0.06, headP.y + Math.sin(headDir) * size * 0.04, size * 0.045,
  );
  snoutGrad.addColorStop(0, bodyColor);
  snoutGrad.addColorStop(0.6, bodyColorDark);
  snoutGrad.addColorStop(1, "#1a1a10");
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.ellipse(
    headP.x + Math.cos(headDir) * size * 0.065,
    headP.y + Math.sin(headDir) * size * 0.045,
    size * 0.045, size * 0.028, headDir * 0.5, 0, TAU,
  );
  ctx.fill();
  // Snout ridge line
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headP.x + Math.cos(headDir) * size * 0.04, headP.y + Math.sin(headDir) * size * 0.025);
  ctx.lineTo(headP.x + Math.cos(headDir) * size * 0.09, headP.y + Math.sin(headDir) * size * 0.06);
  ctx.stroke();

  // Nostrils with faint breath mist
  for (const side of [-1, 1]) {
    const nostrilX = headP.x + Math.cos(headDir) * size * 0.09 + side * size * 0.013;
    const nostrilY = headP.y + Math.sin(headDir) * size * 0.065;
    ctx.fillStyle = "#0a0a05";
    ctx.beginPath();
    ctx.ellipse(nostrilX, nostrilY, size * 0.006, size * 0.004, 0, 0, TAU);
    ctx.fill();
    // Breath mist puff
    const mistPhase = (time * 1.5 + (side > 0 ? 0.5 : 0)) % 2;
    if (mistPhase < 0.8) {
      const mistAlpha = (1 - mistPhase / 0.8) * 0.06;
      ctx.fillStyle = `rgba(100,140,80,${mistAlpha})`;
      ctx.beginPath();
      ctx.arc(
        nostrilX + Math.cos(headDir) * mistPhase * size * 0.04,
        nostrilY + Math.sin(headDir) * mistPhase * size * 0.03,
        size * (0.005 + mistPhase * 0.008), 0, TAU,
      );
      ctx.fill();
    }
  }

  // Forked tongue flicking (more detailed with glistening highlight)
  const tongueFlick = Math.sin(time * 6) > 0.35 ? (Math.sin(time * 6) - 0.35) * 1.54 : 0;
  if (tongueFlick > 0) {
    const tongueBase = {
      x: headP.x + Math.cos(headDir) * size * 0.085,
      y: headP.y + Math.sin(headDir) * size * 0.06,
    };
    const tongueLen = tongueFlick * size * 0.085;
    const tongueWave = Math.sin(time * 14) * size * 0.006;
    const tongueWave2 = Math.sin(time * 14 + 1.5) * size * 0.004;

    // Tongue base (thicker)
    ctx.strokeStyle = "#cc2244";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(tongueBase.x, tongueBase.y);
    ctx.quadraticCurveTo(
      tongueBase.x + tongueLen * 0.4, tongueBase.y + tongueWave,
      tongueBase.x + tongueLen * 0.7, tongueBase.y + tongueWave2,
    );
    ctx.stroke();
    // Tongue tip (thinner)
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(tongueBase.x + tongueLen * 0.7, tongueBase.y + tongueWave2);
    ctx.lineTo(tongueBase.x + tongueLen, tongueBase.y);
    ctx.stroke();
    // Forked tips with curl
    ctx.strokeStyle = "#aa1133";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(tongueBase.x + tongueLen, tongueBase.y);
    ctx.quadraticCurveTo(
      tongueBase.x + tongueLen + size * 0.01, tongueBase.y - size * 0.008,
      tongueBase.x + tongueLen + size * 0.018, tongueBase.y - size * 0.015,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tongueBase.x + tongueLen, tongueBase.y);
    ctx.quadraticCurveTo(
      tongueBase.x + tongueLen + size * 0.01, tongueBase.y + size * 0.008,
      tongueBase.x + tongueLen + size * 0.018, tongueBase.y + size * 0.015,
    );
    ctx.stroke();
    // Glistening highlight on tongue
    ctx.strokeStyle = `rgba(255,150,180,${tongueFlick * 0.3})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(tongueBase.x + tongueLen * 0.2, tongueBase.y + tongueWave * 0.3);
    ctx.lineTo(tongueBase.x + tongueLen * 0.6, tongueBase.y + tongueWave2 * 0.5);
    ctx.stroke();
  }
}

// 12. DJINN — Ethereal desert spirit of swirling sand and arcane power
export function drawDjinnEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.35;
  const floatY = Math.sin(time * 2.5) * size * 0.03;
  const swirlSpeed = time * 2;
  const sandBlast = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const castGlow = isAttacking ? Math.sin(attackPhase * Math.PI * 0.5) : 0;

  // Ground shadow (isometric)
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.2, size * 0.2 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Sand particle vortex (3 orbit rings, dense)
  for (let ring = 0; ring < 3; ring++) {
    const ringParticles = 10 - ring * 2;
    for (let s = 0; s < ringParticles; s++) {
      const sAngle = swirlSpeed * (1.2 + ring * 0.25) + s * (TAU / ringParticles) + ring * 0.6;
      const sDist = size * (0.28 + ring * 0.07) + Math.sin(time * 2.5 + s + ring) * size * 0.04;
      const sx = x + Math.cos(sAngle) * sDist;
      const sy = y + floatY + Math.sin(sAngle) * sDist * 0.35;
      const sAlpha = 0.22 + Math.sin(time * 2 + s + ring * 1.5) * 0.1;
      const sSize = size * (0.006 + ring * 0.002 + Math.sin(time * 3 + s) * 0.002);
      ctx.fillStyle = `rgba(215,185,125,${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sSize, 0, TAU);
      ctx.fill();
      // Trailing dust
      if (ring === 0) {
        ctx.fillStyle = `rgba(200,170,110,${sAlpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(sx - Math.cos(sAngle) * size * 0.015, sy - Math.sin(sAngle) * size * 0.005, sSize * 0.6, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Magic sparks (brighter, more)
  for (let sp = 0; sp < 8; sp++) {
    const spPhase = (time * 1.1 + sp * 0.42) % 1.5;
    const spAngle = sp * 1.2 + time * 0.7;
    const spDist = size * 0.18 + spPhase * size * 0.12;
    const spx = x + Math.cos(spAngle) * spDist;
    const spy = y - size * 0.1 + floatY - spPhase * size * 0.18;
    const spAlpha = (1 - spPhase / 1.5) * 0.45;
    if (spAlpha > 0.02) {
      setShadowBlur(ctx, 3 * zoom, `rgba(200,150,255,${spAlpha})`);
      ctx.fillStyle = `rgba(220,180,255,${spAlpha})`;
      ctx.beginPath();
      ctx.arc(spx, spy, size * 0.005, 0, TAU);
      ctx.fill();
      // Spark trail
      ctx.strokeStyle = `rgba(200,150,255,${spAlpha * 0.3})`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(spx, spy);
      ctx.lineTo(spx + Math.cos(spAngle + Math.PI) * size * 0.015, spy + size * 0.01);
      ctx.stroke();
    }
  }
  clearShadow(ctx);

  // Mystic symbols appearing/fading (arcane glyphs orbiting)
  for (let ms = 0; ms < 5; ms++) {
    const msAngle = time * 0.8 + ms * (TAU / 5);
    const msDist = size * 0.35;
    const msx = x + Math.cos(msAngle) * msDist;
    const msy = y - size * 0.05 + floatY + Math.sin(msAngle) * msDist * 0.25;
    const msAlpha = 0.15 + Math.sin(time * 2 + ms * 2.5) * 0.12;
    if (msAlpha > 0.05) {
      ctx.strokeStyle = `rgba(200,150,255,${msAlpha})`;
      ctx.lineWidth = 0.5 * zoom;
      const glyphType = ms % 4;
      if (glyphType === 0) {
        ctx.beginPath();
        ctx.arc(msx, msy, size * 0.008, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(msx - size * 0.005, msy);
        ctx.lineTo(msx + size * 0.005, msy);
        ctx.moveTo(msx, msy - size * 0.005);
        ctx.lineTo(msx, msy + size * 0.005);
        ctx.stroke();
      } else if (glyphType === 1) {
        ctx.beginPath();
        ctx.moveTo(msx, msy - size * 0.008);
        ctx.lineTo(msx + size * 0.007, msy + size * 0.005);
        ctx.lineTo(msx - size * 0.007, msy + size * 0.005);
        ctx.closePath();
        ctx.stroke();
      } else if (glyphType === 2) {
        ctx.beginPath();
        ctx.moveTo(msx - size * 0.006, msy - size * 0.006);
        ctx.lineTo(msx + size * 0.006, msy - size * 0.006);
        ctx.lineTo(msx + size * 0.006, msy + size * 0.006);
        ctx.lineTo(msx - size * 0.006, msy + size * 0.006);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.beginPath();
        for (let pt = 0; pt < 5; pt++) {
          const pAngle = pt * (TAU / 5) - Math.PI / 2;
          const px = msx + Math.cos(pAngle) * size * 0.007;
          const py = msy + Math.sin(pAngle) * size * 0.007;
          if (pt === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  // Billowing fabric/cloth lower body (layered, tattered, swirling)
  for (let layer = 0; layer < 14; layer++) {
    const layerFrac = layer / 14;
    const ly = y + size * 0.06 + floatY + layerFrac * size * 0.36;
    const swirlX = Math.sin(time * 2.2 + layer * 0.55) * size * 0.05 * layerFrac;
    const lWidth = size * (0.18 - layerFrac * 0.065) + Math.sin(time * 2.8 + layer * 0.65) * size * 0.025;
    const lAlpha = (1 - layerFrac) * 0.32;

    // Fabric layer (purple-tinted cloth)
    const fabricGrad = ctx.createRadialGradient(x + swirlX, ly, 0, x + swirlX, ly, lWidth);
    fabricGrad.addColorStop(0, `rgba(120,80,160,${lAlpha})`);
    fabricGrad.addColorStop(0.3, `rgba(100,60,140,${lAlpha * 0.7})`);
    fabricGrad.addColorStop(0.6, `rgba(80,45,120,${lAlpha * 0.4})`);
    fabricGrad.addColorStop(1, "rgba(60,30,100,0)");
    ctx.fillStyle = fabricGrad;
    ctx.beginPath();
    ctx.ellipse(x + swirlX, ly, lWidth, lWidth * 0.42, layerFrac * 0.35, 0, TAU);
    ctx.fill();

    // Fabric fold lines
    if (layer % 2 === 0 && layerFrac < 0.8) {
      ctx.strokeStyle = `rgba(80,40,120,${lAlpha * 0.3})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(x + swirlX - lWidth * 0.6, ly);
      ctx.quadraticCurveTo(x + swirlX, ly + size * 0.01, x + swirlX + lWidth * 0.6, ly);
      ctx.stroke();
    }

    // Embedded sand particles in cloth
    if (layer % 3 === 0) {
      for (let ep = 0; ep < 3; ep++) {
        const epAngle = time * 3 + ep * 2 + layer;
        const epx = x + swirlX + Math.cos(epAngle) * lWidth * 0.5;
        const epy = ly + Math.sin(epAngle) * lWidth * 0.15;
        ctx.fillStyle = `rgba(210,180,120,${lAlpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(epx, epy, size * 0.003, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Ethereal face forming in the sand/cloth (ghostly visage)
  const faceAlpha = 0.08 + Math.sin(time * 1.5) * 0.04;
  const faceY = y + size * 0.22 + floatY;
  // Ghost eyes
  ctx.fillStyle = `rgba(200,150,255,${faceAlpha * 2})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.03, faceY, size * 0.006, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.03, faceY, size * 0.006, 0, TAU);
  ctx.fill();
  // Ghost mouth
  ctx.strokeStyle = `rgba(200,150,255,${faceAlpha})`;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, faceY + size * 0.02, size * 0.02, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Muscular upper body with enhanced detail
  const torsoGrad = ctx.createLinearGradient(x - size * 0.17, y - size * 0.32, x + size * 0.17, y + size * 0.1);
  torsoGrad.addColorStop(0, "rgba(95,55,175,0.78)");
  torsoGrad.addColorStop(0.2, "rgba(125,80,205,0.88)");
  torsoGrad.addColorStop(0.5, "rgba(110,65,195,0.85)");
  torsoGrad.addColorStop(0.8, "rgba(85,45,165,0.7)");
  torsoGrad.addColorStop(1, "rgba(55,25,115,0.4)");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.1 + floatY);
  ctx.quadraticCurveTo(x - size * 0.27, y - size * 0.05 + floatY, x - size * 0.2, y - size * 0.22 + floatY);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.32 + floatY, x, y - size * 0.3 + floatY);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.32 + floatY, x + size * 0.2, y - size * 0.22 + floatY);
  ctx.quadraticCurveTo(x + size * 0.27, y - size * 0.05 + floatY, x + size * 0.22, y + size * 0.1 + floatY);
  ctx.closePath();
  ctx.fill();

  // Skin shimmer highlight
  ctx.fillStyle = "rgba(180,140,240,0.08)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.15 + floatY, size * 0.06, size * 0.1, -0.3, 0, TAU);
  ctx.fill();

  // Chest muscle definition and tattoo lines
  ctx.strokeStyle = "rgba(212,175,55,0.35)";
  ctx.lineWidth = 1.5 * zoom;
  // Center line
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2 + floatY);
  ctx.lineTo(x, y + size * 0.06 + floatY);
  ctx.stroke();
  // Pectorals
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * size * 0.075, y - size * 0.1 + floatY, size * 0.065, 0, Math.PI);
    ctx.stroke();
  }
  // Abdominal lines
  ctx.strokeStyle = "rgba(212,175,55,0.2)";
  ctx.lineWidth = 1 * zoom;
  for (let ab = 0; ab < 3; ab++) {
    const abY = y - size * 0.02 + ab * size * 0.025 + floatY;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.06, abY);
    ctx.lineTo(x + size * 0.06, abY);
    ctx.stroke();
  }
  // Arcane tattoo spirals (elaborate, both arms and chest)
  ctx.strokeStyle = "rgba(200,150,255,0.22)";
  ctx.lineWidth = 0.8 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let t = 0; t < 14; t++) {
      const tFrac = t / 14;
      const spX = x + side * size * (0.04 + tFrac * 0.1);
      const spY = y - size * 0.05 + floatY + Math.sin(tFrac * TAU * 1.5) * size * 0.035;
      if (t === 0) ctx.moveTo(spX, spY);
      else ctx.lineTo(spX, spY);
    }
    ctx.stroke();
    // Shoulder spiral
    ctx.beginPath();
    ctx.arc(x + side * size * 0.16, y - size * 0.16 + floatY, size * 0.03, 0, TAU * 0.75);
    ctx.stroke();
  }

  // Articulated arms with hands and jewelry
  for (const side of [-1, 1]) {
    const armWave = Math.sin(time * 2 + side * 2) * 0.2;
    const castGesture = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.4 * side : 0;
    ctx.save();
    ctx.translate(x + side * size * 0.22, y - size * 0.17 + floatY);
    ctx.rotate(side * (0.5 + armWave) + castGesture);

    // Upper arm (bicep bulge)
    const armGrad = ctx.createLinearGradient(0, 0, 0, size * 0.13);
    armGrad.addColorStop(0, "rgba(115,75,195,0.75)");
    armGrad.addColorStop(0.4, "rgba(130,90,210,0.7)");
    armGrad.addColorStop(1, "rgba(90,55,170,0.55)");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.065, size * 0.045, size * 0.085, 0, 0, TAU);
    ctx.fill();
    // Bicep highlight
    ctx.fillStyle = "rgba(160,120,220,0.12)";
    ctx.beginPath();
    ctx.ellipse(-size * 0.01, size * 0.04, size * 0.02, size * 0.04, -0.2, 0, TAU);
    ctx.fill();

    // Forearm
    const foreGrad = ctx.createLinearGradient(0, size * 0.1, 0, size * 0.22);
    foreGrad.addColorStop(0, "rgba(105,65,185,0.65)");
    foreGrad.addColorStop(1, "rgba(90,50,170,0.5)");
    ctx.fillStyle = foreGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.16, size * 0.038, size * 0.075, 0, 0, TAU);
    ctx.fill();
    // Forearm vein line
    ctx.strokeStyle = "rgba(140,100,200,0.15)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, size * 0.1);
    ctx.lineTo(size * 0.005, size * 0.2);
    ctx.stroke();

    // Hand with individual fingers
    ctx.fillStyle = "rgba(125,85,205,0.72)";
    ctx.beginPath();
    ctx.arc(0, size * 0.235, size * 0.027, 0, TAU);
    ctx.fill();
    // Fingers (always visible, more dramatic during casting)
    const fingerSpread = isAttacking ? 0.5 : 0.3;
    for (let f = 0; f < 5; f++) {
      const fAngle = -0.8 + f * (fingerSpread + 0.1);
      const fLen = size * (0.02 + (f === 2 ? 0.005 : 0));
      ctx.strokeStyle = "rgba(125,85,205,0.55)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(Math.cos(fAngle) * size * 0.015, size * 0.235 + Math.sin(fAngle + 0.3) * size * 0.015);
      ctx.lineTo(Math.cos(fAngle) * fLen, size * 0.235 + Math.sin(fAngle + 0.5) * fLen + size * 0.015);
      ctx.stroke();
    }

    // Gold bangles (3 per arm — upper, mid, wrist)
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2.8 * zoom;
    ctx.beginPath();
    ctx.arc(0, size * 0.035, size * 0.047, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(0, size * 0.11, size * 0.04, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.arc(0, size * 0.19, size * 0.037, 0, TAU);
    ctx.stroke();
    // Bangle gem accents
    ctx.fillStyle = "#cc44cc";
    ctx.beginPath();
    ctx.arc(size * 0.047, size * 0.035, size * 0.004, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-size * 0.04, size * 0.11, size * 0.003, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Lightning arcs between hands (idle + stronger during attack)
  const lightningAlpha = isAttacking ? 0.3 + castGlow * 0.4 : 0.08 + Math.sin(time * 4) * 0.05;
  if (lightningAlpha > 0.05) {
    ctx.strokeStyle = `rgba(180,140,255,${lightningAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let la = 0; la < 2; la++) {
      ctx.beginPath();
      const startX = x - size * 0.18;
      const endX = x + size * 0.18;
      const midY = y + floatY + size * 0.08;
      ctx.moveTo(startX, midY + Math.sin(time * 3) * size * 0.03);
      const segments = 5;
      for (let ls = 1; ls <= segments; ls++) {
        const lsFrac = ls / segments;
        const lsx = startX + (endX - startX) * lsFrac;
        const lsy = midY + Math.sin(time * 8 + ls * 2 + la * 3) * size * 0.04;
        ctx.lineTo(lsx, lsy);
      }
      ctx.stroke();
    }
    // Glow at hand positions
    for (const side of [-1, 1]) {
      setShadowBlur(ctx, 4 * zoom, `rgba(180,140,255,${lightningAlpha})`);
      ctx.fillStyle = `rgba(200,170,255,${lightningAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(x + side * size * 0.18, y + floatY + size * 0.08, size * 0.012, 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
  }

  // Gold chain necklace with pendant
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2 + floatY, size * 0.11, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();
  // Chain links detail
  ctx.strokeStyle = "rgba(180,140,30,0.25)";
  ctx.lineWidth = 0.5 * zoom;
  for (let cl = 0; cl < 6; cl++) {
    const clAngle = Math.PI * 0.15 + cl * (Math.PI * 0.7 / 6);
    const clx = x + Math.cos(clAngle) * size * 0.11;
    const cly = y - size * 0.2 + floatY + Math.sin(clAngle) * size * 0.11;
    ctx.beginPath();
    ctx.arc(clx, cly, size * 0.004, 0, TAU);
    ctx.stroke();
  }
  // Pendant gem (larger, more ornate)
  setShadowBlur(ctx, 4 * zoom, "#cc44cc");
  const pendGrad = ctx.createRadialGradient(x, y - size * 0.09 + floatY, 0, x, y - size * 0.09 + floatY, size * 0.014);
  pendGrad.addColorStop(0, "#ff99ff");
  pendGrad.addColorStop(0.4, "#cc44cc");
  pendGrad.addColorStop(1, "#882288");
  ctx.fillStyle = pendGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.09 + floatY, size * 0.014, 0, TAU);
  ctx.fill();
  // Gem sparkle
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(x - size * 0.004, y - size * 0.094 + floatY, size * 0.004, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Orbiting arcane rune circles (8 runes with symbols and connecting lines)
  for (let r = 0; r < 8; r++) {
    const runeAngle = time * 1.4 + r * (TAU / 8);
    const runeDist = size * 0.3;
    const rx = x + Math.cos(runeAngle) * runeDist;
    const ry = y - size * 0.1 + floatY + Math.sin(runeAngle) * runeDist * 0.3;
    const runeAlpha = 0.28 + Math.sin(time * 2.5 + r * 1.8) * 0.18;

    setShadowBlur(ctx, 4 * zoom, `rgba(200,150,255,${runeAlpha})`);
    // Rune circle
    ctx.strokeStyle = `rgba(200,150,255,${runeAlpha * 0.5})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.012, 0, TAU);
    ctx.stroke();
    // Rune dot
    ctx.fillStyle = `rgba(210,170,255,${runeAlpha})`;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.006, 0, TAU);
    ctx.fill();
    // Rune symbol (varies per rune)
    ctx.strokeStyle = `rgba(230,200,255,${runeAlpha * 0.7})`;
    ctx.lineWidth = 0.5 * zoom;
    const symType = r % 4;
    if (symType === 0) {
      ctx.beginPath();
      ctx.moveTo(rx - size * 0.005, ry);
      ctx.lineTo(rx + size * 0.005, ry);
      ctx.moveTo(rx, ry - size * 0.005);
      ctx.lineTo(rx, ry + size * 0.005);
      ctx.stroke();
    } else if (symType === 1) {
      ctx.beginPath();
      ctx.moveTo(rx, ry - size * 0.006);
      ctx.lineTo(rx + size * 0.005, ry + size * 0.004);
      ctx.lineTo(rx - size * 0.005, ry + size * 0.004);
      ctx.closePath();
      ctx.stroke();
    } else if (symType === 2) {
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.004, 0, TAU);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(rx - size * 0.004, ry - size * 0.004);
      ctx.lineTo(rx + size * 0.004, ry + size * 0.004);
      ctx.moveTo(rx + size * 0.004, ry - size * 0.004);
      ctx.lineTo(rx - size * 0.004, ry + size * 0.004);
      ctx.stroke();
    }

    // Connecting line to next rune
    const nextAngle = time * 1.4 + ((r + 1) % 8) * (TAU / 8);
    const nrx = x + Math.cos(nextAngle) * runeDist;
    const nry = y - size * 0.1 + floatY + Math.sin(nextAngle) * runeDist * 0.3;
    ctx.strokeStyle = `rgba(180,130,240,${runeAlpha * 0.15})`;
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(nrx, nry);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Head (detailed face)
  const headY2 = y - size * 0.3 + floatY;
  const headGrad = ctx.createRadialGradient(x - size * 0.01, headY2 - size * 0.01, 0, x, headY2, size * 0.085);
  headGrad.addColorStop(0, "rgba(135,95,215,0.92)");
  headGrad.addColorStop(0.4, "rgba(110,70,190,0.88)");
  headGrad.addColorStop(0.8, "rgba(80,50,155,0.78)");
  headGrad.addColorStop(1, "rgba(60,35,130,0.65)");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY2, size * 0.085, size * 0.075, 0, 0, TAU);
  ctx.fill();
  // Cheekbone highlights
  for (const side of [-1, 1]) {
    ctx.fillStyle = "rgba(160,120,230,0.1)";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.04, headY2 + size * 0.01, size * 0.02, size * 0.012, side * 0.2, 0, TAU);
    ctx.fill();
  }
  // Brow ridge
  ctx.strokeStyle = "rgba(70,35,120,0.25)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY2 - size * 0.015, size * 0.06, Math.PI + 0.3, TAU - 0.3);
  ctx.stroke();

  // Gem-studded ornate turban/crown
  const turbanGrad = ctx.createLinearGradient(x - size * 0.1, headY2 - size * 0.07, x + size * 0.1, headY2 - size * 0.02);
  turbanGrad.addColorStop(0, "#a87d15");
  turbanGrad.addColorStop(0.2, "#c49a22");
  turbanGrad.addColorStop(0.4, "#d4af37");
  turbanGrad.addColorStop(0.5, "#e8c84a");
  turbanGrad.addColorStop(0.6, "#d4af37");
  turbanGrad.addColorStop(0.8, "#c49a22");
  turbanGrad.addColorStop(1, "#a87d15");
  ctx.fillStyle = turbanGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY2 - size * 0.042, size * 0.095, size * 0.048, 0, 0, Math.PI);
  ctx.fill();
  // Turban wrap layers
  ctx.strokeStyle = "rgba(160,120,20,0.3)";
  ctx.lineWidth = 0.6 * zoom;
  for (let tf = 0; tf < 5; tf++) {
    const tfx = x - size * 0.07 + tf * size * 0.035;
    ctx.beginPath();
    ctx.moveTo(tfx, headY2 - size * 0.075);
    ctx.quadraticCurveTo(tfx + size * 0.012, headY2 - size * 0.045, tfx + size * 0.005, headY2 - size * 0.01);
    ctx.stroke();
  }
  // Turban edge highlight
  ctx.strokeStyle = "rgba(255,220,100,0.15)";
  ctx.lineWidth = 0.4 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, headY2 - size * 0.04, size * 0.093, size * 0.04, 0, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  // Central large gem
  setShadowBlur(ctx, 6 * zoom, "#ff44ff");
  const gemGrad = ctx.createRadialGradient(x, headY2 - size * 0.065, 0, x, headY2 - size * 0.065, size * 0.02);
  gemGrad.addColorStop(0, "#ff99ff");
  gemGrad.addColorStop(0.3, "#ff66ff");
  gemGrad.addColorStop(0.7, "#cc44cc");
  gemGrad.addColorStop(1, "#882288");
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  ctx.arc(x, headY2 - size * 0.065, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(x - size * 0.006, headY2 - size * 0.07, size * 0.006, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  // Side gems
  for (const side of [-1, 1]) {
    setShadowBlur(ctx, 3 * zoom, "#4488ff");
    const sideGem = ctx.createRadialGradient(
      x + side * size * 0.06, headY2 - size * 0.05, 0,
      x + side * size * 0.06, headY2 - size * 0.05, size * 0.01,
    );
    sideGem.addColorStop(0, "#88ccff");
    sideGem.addColorStop(0.5, "#4488cc");
    sideGem.addColorStop(1, "#224466");
    ctx.fillStyle = sideGem;
    ctx.beginPath();
    ctx.arc(x + side * size * 0.06, headY2 - size * 0.05, size * 0.01, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Feather plume on turban (taller, animated)
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.045, headY2 - size * 0.065);
  ctx.quadraticCurveTo(
    x + size * 0.09, headY2 - size * 0.13,
    x + size * 0.065, headY2 - size * 0.18 + Math.sin(time * 3) * size * 0.012,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05, headY2 - size * 0.07);
  ctx.quadraticCurveTo(
    x + size * 0.1, headY2 - size * 0.12,
    x + size * 0.075, headY2 - size * 0.16 + Math.sin(time * 3 + 1) * size * 0.01,
  );
  ctx.stroke();

  // Glowing arcane eyes (intense with glow trails)
  setShadowBlur(ctx, 6 * zoom, "#ffcc00");
  for (const side of [-1, 1]) {
    const eyeX2 = x + side * size * 0.032;
    // Outer glow
    const eyeGlowGrad = ctx.createRadialGradient(eyeX2, headY2, 0, eyeX2, headY2, size * 0.022);
    eyeGlowGrad.addColorStop(0, "rgba(255,255,255,0.6)");
    eyeGlowGrad.addColorStop(0.3, "rgba(255,230,80,0.5)");
    eyeGlowGrad.addColorStop(0.7, "rgba(255,200,0,0.2)");
    eyeGlowGrad.addColorStop(1, "rgba(255,180,0,0)");
    ctx.fillStyle = eyeGlowGrad;
    ctx.beginPath();
    ctx.arc(eyeX2, headY2, size * 0.022, 0, TAU);
    ctx.fill();
    // Eye body
    const eyeGrad = ctx.createRadialGradient(eyeX2, headY2, 0, eyeX2, headY2, size * 0.016);
    eyeGrad.addColorStop(0, "#fff");
    eyeGrad.addColorStop(0.25, "#ffee44");
    eyeGrad.addColorStop(0.7, "#ffcc00");
    eyeGrad.addColorStop(1, "#cc8800");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX2, headY2, size * 0.016, size * 0.012, 0, 0, TAU);
    ctx.fill();
    // Glow trail from eye
    ctx.strokeStyle = `rgba(255,200,50,${0.15 + Math.sin(time * 4 + side * 2) * 0.08})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX2 + side * size * 0.015, headY2);
    ctx.quadraticCurveTo(eyeX2 + side * size * 0.03, headY2 + side * size * 0.005, eyeX2 + side * size * 0.04, headY2 - size * 0.005);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Wispy beard (more strands, flowing)
  for (let b = 0; b < 8; b++) {
    const bx = x + (b - 3.5) * size * 0.013;
    const bLen = size * (0.075 + Math.sin(b * 1.3) * 0.02);
    const bWave = Math.sin(time * 2 + b * 0.7) * size * 0.009;
    const bAlpha = 0.25 + Math.sin(b * 0.8) * 0.1;
    ctx.strokeStyle = `rgba(100,60,180,${bAlpha})`;
    ctx.lineWidth = (1.3 - b * 0.08) * zoom;
    ctx.beginPath();
    ctx.moveTo(bx, headY2 + size * 0.055);
    ctx.quadraticCurveTo(
      bx + bWave, headY2 + size * 0.055 + bLen * 0.4,
      bx + bWave * 1.5, headY2 + size * 0.055 + bLen,
    );
    ctx.stroke();
    // Beard tip fade
    ctx.fillStyle = `rgba(80,40,150,${bAlpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(bx + bWave * 1.5, headY2 + size * 0.055 + bLen, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // Sandstorm blast attack (intense with lightning and shockwave)
  if (isAttacking) {
    // Sand particles blast
    for (let sb = 0; sb < 28; sb++) {
      const sbAngle = sb * (TAU / 28) + time * 4.5;
      const sbDist = sandBlast * size * (0.28 + sb * 0.012);
      const sbAlpha = sandBlast * 0.38 * (1 - sb / 28);
      ctx.fillStyle = `rgba(215,185,125,${sbAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(sbAngle) * sbDist,
        y + floatY + Math.sin(sbAngle) * sbDist * 0.4,
        size * (0.013 + Math.sin(sb * 0.8) * 0.005), 0, TAU,
      );
      ctx.fill();
    }
    // Shockwave ring
    const shockR = sandBlast * size * 0.45;
    ctx.strokeStyle = `rgba(200,160,100,${sandBlast * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + floatY + size * 0.2, shockR, shockR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    // Lightning crackle during sandstorm
    if (sandBlast > 0.4) {
      const lzAlpha = (sandBlast - 0.4) * 1.67;
      setShadowBlur(ctx, 4 * zoom, `rgba(200,150,255,${lzAlpha})`);
      ctx.strokeStyle = `rgba(210,170,255,${lzAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      for (let lz = 0; lz < 4; lz++) {
        const lzAngle = lz * (TAU / 4) + time * 5;
        const lzDist = sandBlast * size * 0.32;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.1 + floatY);
        const mid1x = x + Math.cos(lzAngle) * lzDist * 0.35 + Math.sin(time * 12 + lz) * size * 0.04;
        const mid1y = y + floatY + Math.sin(lzAngle) * lzDist * 0.18;
        ctx.lineTo(mid1x, mid1y);
        const mid2x = mid1x + Math.cos(lzAngle) * lzDist * 0.3 + Math.sin(time * 10 + lz * 2) * size * 0.03;
        const mid2y = mid1y + Math.sin(lzAngle) * lzDist * 0.15;
        ctx.lineTo(mid2x, mid2y);
        ctx.lineTo(x + Math.cos(lzAngle) * lzDist, y + floatY + Math.sin(lzAngle) * lzDist * 0.35);
        ctx.stroke();
      }
      clearShadow(ctx);
    }
  }
}

// 13. MANTICORE — Lion-bat hybrid with scorpion tail
export function drawManticoreEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.4;
  const walkPhase = time * 4;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.015;
  const tailStrike = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const wingFlare = isAttacking ? Math.sin(attackPhase * Math.PI * 0.5) * 0.5 : 0;
  const snarl = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.3 : 0;

  // Ground shadow (isometric)
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.42, size * 0.28, size * 0.28 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Ambient menace particles (dark crimson sparks)
  for (let mp = 0; mp < 8; mp++) {
    const mpPhase = (time * 0.8 + mp * 0.35) % 1.5;
    const mpAngle = mp * 1.1 + time * 0.5;
    const mpDist = size * 0.2 + mpPhase * size * 0.1;
    const mpx = x + Math.cos(mpAngle) * mpDist;
    const mpy = y - size * 0.05 - bodyBob - mpPhase * size * 0.15;
    const mpAlpha = (1 - mpPhase / 1.5) * 0.25;
    if (mpAlpha > 0.02) {
      ctx.fillStyle = `rgba(180,40,30,${mpAlpha})`;
      ctx.beginPath();
      ctx.arc(mpx, mpy, size * 0.004, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255,80,40,${mpAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(mpx, mpy, size * 0.002, 0, TAU);
      ctx.fill();
    }
  }

  // Footfall dust (enhanced with more particles)
  for (const fb of [-1, 1]) {
    const dustPhase = Math.max(0, -Math.sin(walkPhase + fb * Math.PI * 0.5));
    if (dustPhase > 0.82) {
      const di = (dustPhase - 0.82) * 5.56;
      ctx.fillStyle = `rgba(160,130,80,${di * 0.22})`;
      for (let d = 0; d < 5; d++) {
        const dAngle = d * 1.2 + fb * 0.5;
        ctx.beginPath();
        ctx.ellipse(
          x + fb * size * 0.15 + Math.cos(dAngle) * size * 0.02 * di,
          y + size * 0.38 - bodyBob + Math.sin(dAngle) * size * 0.005,
          size * 0.012 * di, size * 0.012 * di * ISO_Y_RATIO, 0, 0, TAU,
        );
        ctx.fill();
      }
    }
  }

  // Articulated scorpion tail (14 segments with chitin plates)
  const tailSegments = 14;
  let prevTX = x - size * 0.15;
  let prevTY = y + size * 0.1 - bodyBob;
  for (let t = 0; t < tailSegments; t++) {
    const tFrac = t / tailSegments;
    const tailArc = -Math.PI * 0.9 * tFrac;
    const curveRadius = size * 0.34 + tailStrike * size * 0.14;
    const tx = x - size * 0.15 + Math.sin(tailArc + Math.PI * 0.3) * curveRadius;
    const ty = y - bodyBob + Math.cos(tailArc + Math.PI * 0.3) * curveRadius * 0.8 - tFrac * size * 0.14;
    const segThick = size * (0.045 - tFrac * 0.022);
    const segAngle = Math.atan2(ty - prevTY, tx - prevTX);

    // Chitin plate gradient
    const chitGrad = ctx.createLinearGradient(
      tx - Math.sin(segAngle) * segThick * 0.5, ty + Math.cos(segAngle) * segThick * 0.5,
      tx + Math.sin(segAngle) * segThick * 0.5, ty - Math.cos(segAngle) * segThick * 0.5,
    );
    chitGrad.addColorStop(0, "#4a2a1a");
    chitGrad.addColorStop(0.3, "#7a5a3a");
    chitGrad.addColorStop(0.5, "#8a6a48");
    chitGrad.addColorStop(0.7, "#7a5a3a");
    chitGrad.addColorStop(1, "#4a2a1a");
    ctx.strokeStyle = chitGrad;
    ctx.lineWidth = segThick;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(prevTX, prevTY);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Chitin plate highlight
    ctx.strokeStyle = "rgba(255,220,160,0.08)";
    ctx.lineWidth = segThick * 0.3;
    ctx.beginPath();
    ctx.moveTo(prevTX, prevTY);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Joint ring detail
    if (t > 0) {
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.arc(tx, ty, segThick * 0.42, 0, TAU);
      ctx.stroke();
      // Joint highlight
      ctx.fillStyle = "rgba(200,160,100,0.06)";
      ctx.beginPath();
      ctx.arc(tx - segThick * 0.1, ty - segThick * 0.1, segThick * 0.2, 0, TAU);
      ctx.fill();
    }

    // Segmented armor texture
    if (t % 2 === 0 && t < tailSegments - 1) {
      ctx.strokeStyle = "rgba(50,30,15,0.12)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(tx, ty, segThick * 0.35, segAngle - 0.8, segAngle + 0.8);
      ctx.stroke();
    }

    prevTX = tx;
    prevTY = ty;
  }
  ctx.lineCap = "butt";

  // Stinger (larger, with barbed detail)
  const stingerGrad = ctx.createLinearGradient(prevTX, prevTY, prevTX, prevTY - size * 0.08);
  stingerGrad.addColorStop(0, "#3a2a1a");
  stingerGrad.addColorStop(0.3, "#2a1a0a");
  stingerGrad.addColorStop(0.7, "#1a0a00");
  stingerGrad.addColorStop(1, "#0a0500");
  ctx.fillStyle = stingerGrad;
  ctx.beginPath();
  ctx.moveTo(prevTX - size * 0.025, prevTY);
  ctx.quadraticCurveTo(prevTX - size * 0.015, prevTY - size * 0.04, prevTX, prevTY - size * 0.08);
  ctx.quadraticCurveTo(prevTX + size * 0.015, prevTY - size * 0.04, prevTX + size * 0.025, prevTY);
  ctx.closePath();
  ctx.fill();
  // Barb hooks on stinger
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(prevTX + side * size * 0.01, prevTY - size * 0.05);
    ctx.lineTo(prevTX + side * size * 0.02, prevTY - size * 0.04);
    ctx.lineTo(prevTX + side * size * 0.008, prevTY - size * 0.035);
    ctx.closePath();
    ctx.fill();
  }
  // Stinger edge highlight
  ctx.strokeStyle = "rgba(200,150,80,0.12)";
  ctx.lineWidth = 0.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(prevTX - size * 0.015, prevTY - size * 0.01);
  ctx.quadraticCurveTo(prevTX - size * 0.008, prevTY - size * 0.05, prevTX, prevTY - size * 0.075);
  ctx.stroke();

  // Venom drip with glow + trail
  const venomDrip = isAttacking ? tailStrike : 0.3 + Math.sin(time * 2) * 0.15;
  setShadowBlur(ctx, 3 * zoom, `rgba(100,220,50,${venomDrip * 0.4})`);
  const venomGrad = ctx.createRadialGradient(prevTX, prevTY - size * 0.082, 0, prevTX, prevTY - size * 0.082, size * 0.01);
  venomGrad.addColorStop(0, `rgba(140,255,80,${venomDrip * 0.6})`);
  venomGrad.addColorStop(0.5, `rgba(100,220,50,${venomDrip * 0.4})`);
  venomGrad.addColorStop(1, `rgba(60,180,30,0)`);
  ctx.fillStyle = venomGrad;
  ctx.beginPath();
  ctx.ellipse(prevTX, prevTY - size * 0.082, size * 0.008, size * 0.014, 0, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  // Venom drip trail
  if (venomDrip > 0.3) {
    const dripLen = (venomDrip - 0.3) * size * 0.06;
    ctx.strokeStyle = `rgba(100,220,50,${(venomDrip - 0.3) * 0.4})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(prevTX, prevTY - size * 0.07);
    ctx.lineTo(prevTX + Math.sin(time * 3) * size * 0.005, prevTY - size * 0.07 + dripLen);
    ctx.stroke();
  }

  // Tail strike motion blur during attack
  if (isAttacking && tailStrike > 0.5) {
    const blurAlpha = (tailStrike - 0.5) * 0.15;
    ctx.strokeStyle = `rgba(100,50,30,${blurAlpha})`;
    ctx.lineWidth = size * 0.03;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(prevTX + size * 0.02, prevTY + size * 0.02);
    ctx.quadraticCurveTo(prevTX + size * 0.05, prevTY + size * 0.08, prevTX + size * 0.08, prevTY + size * 0.15);
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  // Bat wings (much more detail with membrane veins and claw hooks)
  for (const side of [-1, 1]) {
    const wingAngle2 = side * (0.4 + wingFlare + Math.sin(time * 2) * 0.1);
    ctx.save();
    ctx.translate(x + side * size * 0.16, y - size * 0.1 - bodyBob);
    ctx.rotate(wingAngle2);

    // Wing membrane with multi-gradient
    const wingGrad = ctx.createLinearGradient(0, -size * 0.12, side * size * 0.4, size * 0.02);
    wingGrad.addColorStop(0, "rgba(110,55,45,0.8)");
    wingGrad.addColorStop(0.25, "rgba(95,45,35,0.65)");
    wingGrad.addColorStop(0.5, "rgba(80,40,30,0.5)");
    wingGrad.addColorStop(0.75, "rgba(65,32,22,0.35)");
    wingGrad.addColorStop(1, "rgba(50,25,18,0.2)");
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.lineTo(side * size * 0.08, -size * 0.16);
    ctx.lineTo(side * size * 0.15, -size * 0.2);
    ctx.lineTo(side * size * 0.25, -size * 0.17);
    ctx.lineTo(side * size * 0.33, -size * 0.12);
    ctx.lineTo(side * size * 0.38, -size * 0.04);
    ctx.lineTo(side * size * 0.4, size * 0.04);
    ctx.lineTo(side * size * 0.25, size * 0.07);
    ctx.lineTo(side * size * 0.1, size * 0.04);
    ctx.lineTo(0, size * 0.03);
    ctx.fill();

    // Finger bones (5 bones, thicker with joints)
    const boneEnds: [number, number][] = [
      [side * size * 0.08, -size * 0.16],
      [side * size * 0.15, -size * 0.2],
      [side * size * 0.25, -size * 0.17],
      [side * size * 0.33, -size * 0.12],
      [side * size * 0.4, size * 0.04],
    ];
    ctx.strokeStyle = "rgba(55,28,18,0.65)";
    ctx.lineWidth = 2.5 * zoom;
    for (const [bx, by2] of boneEnds) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bx, by2);
      ctx.stroke();
    }
    // Bone joints (knuckle dots)
    ctx.fillStyle = "rgba(80,40,25,0.4)";
    for (const [bx, by2] of boneEnds) {
      const jx = bx * 0.5;
      const jy = by2 * 0.5;
      ctx.beginPath();
      ctx.arc(jx, jy, size * 0.005, 0, TAU);
      ctx.fill();
    }

    // Membrane veins (branching network)
    ctx.strokeStyle = "rgba(130,55,45,0.14)";
    ctx.lineWidth = 0.5 * zoom;
    for (let mv = 0; mv < 4; mv++) {
      const mvStart = boneEnds[mv];
      const mvEnd = boneEnds[mv + 1];
      const mvMid: [number, number] = [(mvStart[0] + mvEnd[0]) / 2, (mvStart[1] + mvEnd[1]) / 2 + size * 0.025];
      ctx.beginPath();
      ctx.moveTo(side * size * 0.04, -size * 0.02);
      ctx.quadraticCurveTo(mvMid[0], mvMid[1], (mvStart[0] + mvEnd[0]) / 2, (mvStart[1] + mvEnd[1]) / 2);
      ctx.stroke();
      // Branch veins
      ctx.beginPath();
      ctx.moveTo(mvMid[0], mvMid[1]);
      ctx.lineTo(mvMid[0] + side * size * 0.02, mvMid[1] + size * 0.015);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mvMid[0], mvMid[1]);
      ctx.lineTo(mvMid[0] - side * size * 0.01, mvMid[1] + size * 0.02);
      ctx.stroke();
    }
    // Finer capillary veins
    ctx.strokeStyle = "rgba(120,50,40,0.06)";
    ctx.lineWidth = 0.3 * zoom;
    for (let cv = 0; cv < 6; cv++) {
      const cvSrc = boneEnds[Math.floor(cv / 2)];
      const cvDst = boneEnds[Math.floor(cv / 2) + 1];
      const cvFrac = (cv % 2) * 0.3 + 0.3;
      const cvx = cvSrc[0] + (cvDst[0] - cvSrc[0]) * cvFrac;
      const cvy = cvSrc[1] + (cvDst[1] - cvSrc[1]) * cvFrac;
      ctx.beginPath();
      ctx.moveTo(cvx, cvy);
      ctx.lineTo(cvx + side * size * 0.015, cvy + size * 0.012);
      ctx.stroke();
    }

    // Wing claw hooks at bone tips
    for (let hook = 0; hook < 3; hook++) {
      const [hx, hy] = boneEnds[hook];
      ctx.fillStyle = "#1a0a00";
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + side * size * 0.008, hy - size * 0.012);
      ctx.lineTo(hx + side * size * 0.003, hy - size * 0.003);
      ctx.closePath();
      ctx.fill();
    }

    // Wing edge highlight
    ctx.strokeStyle = "rgba(180,100,70,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.08, -size * 0.16);
    ctx.lineTo(side * size * 0.15, -size * 0.2);
    ctx.lineTo(side * size * 0.25, -size * 0.17);
    ctx.lineTo(side * size * 0.33, -size * 0.12);
    ctx.stroke();

    ctx.restore();
  }

  // Articulated lion legs (more detail with muscle, fur tufts)
  for (const side of [-1, 1]) {
    for (const fb of [-1, 1]) {
      const legSwing = Math.sin(walkPhase + (side + fb) * Math.PI * 0.25) * 0.3;
      const lx = x + fb * size * 0.15 + side * size * 0.02;
      const hipY2 = y + size * 0.1 - bodyBob;
      const kneeX = lx + Math.sin(legSwing) * size * 0.04;
      const kneeY = hipY2 + size * 0.12;
      const pawX = kneeX + Math.sin(legSwing * 0.5) * size * 0.02;
      const pawY = kneeY + size * 0.1;

      // Thigh with muscle gradient
      const thighGrad = ctx.createLinearGradient(lx, hipY2, kneeX, kneeY);
      thighGrad.addColorStop(0, fb === -1 ? bodyColorDark : bodyColor);
      thighGrad.addColorStop(0.5, bodyColorLight);
      thighGrad.addColorStop(1, fb === -1 ? bodyColorDark : bodyColor);
      ctx.fillStyle = thighGrad;
      ctx.beginPath();
      ctx.moveTo(lx - size * 0.045, hipY2);
      ctx.quadraticCurveTo(lx - size * 0.05, hipY2 + size * 0.06, kneeX - size * 0.035, kneeY);
      ctx.lineTo(kneeX + size * 0.035, kneeY);
      ctx.quadraticCurveTo(lx + size * 0.05, hipY2 + size * 0.06, lx + size * 0.045, hipY2);
      ctx.fill();

      // Calf
      ctx.fillStyle = fb === -1 ? bodyColorDark : bodyColor;
      ctx.beginPath();
      ctx.moveTo(kneeX - size * 0.032, kneeY);
      ctx.lineTo(pawX - size * 0.028, pawY);
      ctx.lineTo(pawX + size * 0.028, pawY);
      ctx.lineTo(kneeX + size * 0.032, kneeY);
      ctx.fill();

      // Knee joint
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, size * 0.015, 0, TAU);
      ctx.fill();

      // Paw with toe pads
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.ellipse(pawX, pawY + size * 0.012, size * 0.038, size * 0.017, 0, 0, TAU);
      ctx.fill();
      // Toe pad detail
      for (let tp = 0; tp < 4; tp++) {
        const padX = pawX + (tp - 1.5) * size * 0.012;
        ctx.fillStyle = "rgba(60,30,15,0.2)";
        ctx.beginPath();
        ctx.ellipse(padX, pawY + size * 0.018, size * 0.006, size * 0.004, 0, 0, TAU);
        ctx.fill();
      }
      // Central pad
      ctx.fillStyle = "rgba(60,30,15,0.15)";
      ctx.beginPath();
      ctx.ellipse(pawX, pawY + size * 0.008, size * 0.012, size * 0.007, 0, 0, TAU);
      ctx.fill();

      // Retractable claws (longer, curved)
      for (let c = 0; c < 4; c++) {
        const clawX = pawX + (c - 1.5) * size * 0.012;
        const clawExtend = isAttacking ? 1 : 0.5 + Math.sin(time * 2) * 0.2;
        const clawLen = size * 0.025 * clawExtend;
        ctx.fillStyle = "#1a0a00";
        ctx.beginPath();
        ctx.moveTo(clawX - size * 0.003, pawY + size * 0.02);
        ctx.quadraticCurveTo(clawX, pawY + size * 0.02 + clawLen * 0.7, clawX + size * 0.001, pawY + size * 0.02 + clawLen);
        ctx.quadraticCurveTo(clawX + size * 0.004, pawY + size * 0.02 + clawLen * 0.5, clawX + size * 0.003, pawY + size * 0.02);
        ctx.closePath();
        ctx.fill();
      }

      // Fur tuft at ankle
      ctx.fillStyle = `rgba(${fb === -1 ? "140,90,40" : "170,110,50"},0.35)`;
      for (let ft = 0; ft < 3; ft++) {
        const ftAngle = -0.5 + ft * 0.5;
        ctx.beginPath();
        ctx.ellipse(
          kneeX + Math.cos(ftAngle) * size * 0.01,
          kneeY + size * 0.03 + Math.sin(ftAngle) * size * 0.005,
          size * 0.006, size * 0.015, ftAngle * 0.5, 0, TAU,
        );
        ctx.fill();
      }
    }
  }

  // Lion body with chest muscle definition
  const bodyGrad = ctx.createRadialGradient(x - size * 0.04, y - size * 0.03 - bodyBob, 0, x, y + size * 0.06, size * 0.32);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.65, bodyColorDark);
  bodyGrad.addColorStop(1, "#2a1a0a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.02 - bodyBob, size * 0.28, size * 0.2, 0, 0, TAU);
  ctx.fill();

  // Chest/shoulder muscle bulges
  for (const side of [-1, 1]) {
    ctx.fillStyle = "rgba(255,220,180,0.06)";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.1, y - size * 0.05 - bodyBob, size * 0.08, size * 0.06, side * 0.3, 0, TAU);
    ctx.fill();
  }
  // Rib cage lines
  ctx.strokeStyle = "rgba(0,0,0,0.04)";
  ctx.lineWidth = 0.4 * zoom;
  for (let rib = 0; rib < 4; rib++) {
    const ribAngle = 0.3 + rib * 0.25;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + side * size * 0.05, y - bodyBob, size * (0.12 + rib * 0.02), ribAngle, ribAngle + 0.5);
      ctx.stroke();
    }
  }
  // Belly fur
  ctx.fillStyle = "rgba(220,180,130,0.08)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.08 - bodyBob, size * 0.15, size * 0.06, 0, 0, TAU);
  ctx.fill();

  // Fur texture lines (denser)
  ctx.strokeStyle = "rgba(0,0,0,0.05)";
  ctx.lineWidth = 0.4 * zoom;
  for (let fu = 0; fu < 12; fu++) {
    const fuA = fu * 0.55 + 0.3;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(fuA) * size * 0.16, y + Math.sin(fuA) * size * 0.11 - bodyBob);
    ctx.lineTo(x + Math.cos(fuA) * size * 0.24, y + Math.sin(fuA) * size * 0.16 - bodyBob);
    ctx.stroke();
  }

  // Dense layered mane (3 layers, 20 strands)
  for (let layer = 0; layer < 3; layer++) {
    for (let m = 0; m < 20; m++) {
      const mAngle = -Math.PI * 0.8 + m * (Math.PI * 1.6 / 20);
      const mLen = size * (0.09 + layer * 0.035) + Math.sin(time * 2.8 + m * 0.65 + layer * 1.2) * size * 0.015;
      const mDist = size * (0.1 + layer * 0.022);
      const mx = x + Math.cos(mAngle) * mDist;
      const my = y - size * 0.15 - bodyBob + Math.sin(mAngle) * mDist * 0.5;
      const r = 170 + m * 4 + layer * 12;
      const g = 90 + m * 3 + layer * 8;
      const mAlpha = 0.5 + Math.sin(time * 2 + m * 0.8 + layer) * 0.15 - layer * 0.12;

      // Fur strand with gradient fade
      const strandGrad = ctx.createLinearGradient(
        mx, my,
        mx + Math.cos(mAngle) * mLen * 0.5, my + Math.sin(mAngle) * mLen * 0.3,
      );
      strandGrad.addColorStop(0, `rgba(${Math.min(255, r)},${g},30,${mAlpha})`);
      strandGrad.addColorStop(1, `rgba(${Math.min(255, r - 30)},${Math.max(0, g - 20)},20,${mAlpha * 0.3})`);
      ctx.fillStyle = strandGrad;
      ctx.beginPath();
      ctx.ellipse(
        mx + Math.cos(mAngle) * mLen * 0.4,
        my + Math.sin(mAngle) * mLen * 0.25,
        size * 0.011, mLen * 0.35, mAngle, 0, TAU,
      );
      ctx.fill();
    }
  }
  // Mane highlight wisps
  ctx.strokeStyle = "rgba(255,220,150,0.06)";
  ctx.lineWidth = 0.4 * zoom;
  for (let mw = 0; mw < 6; mw++) {
    const mwAngle = -Math.PI * 0.5 + mw * 0.5;
    const mwDist = size * 0.12;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(mwAngle) * mwDist, y - size * 0.15 - bodyBob + Math.sin(mwAngle) * mwDist * 0.5);
    ctx.lineTo(
      x + Math.cos(mwAngle) * (mwDist + size * 0.08),
      y - size * 0.15 - bodyBob + Math.sin(mwAngle) * (mwDist + size * 0.08) * 0.5,
    );
    ctx.stroke();
  }

  // Head (human-like, much more detailed face)
  const headY2 = y - size * 0.27 - bodyBob;
  const headGrad = ctx.createRadialGradient(x - size * 0.012, headY2 - size * 0.012, 0, x, headY2, size * 0.09);
  headGrad.addColorStop(0, "#f2d8b8");
  headGrad.addColorStop(0.35, "#ecc8a4");
  headGrad.addColorStop(0.7, "#d4a878");
  headGrad.addColorStop(1, "#b8885a");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY2, size * 0.09, size * 0.08, 0, 0, TAU);
  ctx.fill();

  // Brow ridge with furrow
  ctx.fillStyle = "#c8a070";
  ctx.beginPath();
  ctx.ellipse(x, headY2 - size * 0.032, size * 0.095, size * 0.028, 0, 0, Math.PI);
  ctx.fill();
  // Brow furrow lines
  ctx.strokeStyle = "rgba(100,60,30,0.15)";
  ctx.lineWidth = 0.5 * zoom;
  for (let bf = 0; bf < 3; bf++) {
    const bfx = x + (bf - 1) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(bfx - size * 0.005, headY2 - size * 0.04);
    ctx.lineTo(bfx + size * 0.005, headY2 - size * 0.025);
    ctx.stroke();
  }

  // Cheekbone definition
  for (const side of [-1, 1]) {
    ctx.fillStyle = "rgba(200,150,100,0.08)";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.045, headY2 + size * 0.01, size * 0.025, size * 0.015, side * 0.3, 0, TAU);
    ctx.fill();
  }

  // Jaw/chin definition
  ctx.fillStyle = "rgba(180,130,80,0.1)";
  ctx.beginPath();
  ctx.ellipse(x, headY2 + size * 0.05, size * 0.04, size * 0.02, 0, 0, TAU);
  ctx.fill();

  // Unsettling human-like eyes with fierce glow
  setShadowBlur(ctx, 4 * zoom, "#ff2200");
  for (const side of [-1, 1]) {
    const eyeX = x + side * size * 0.035;
    const eyeY = headY2 - size * 0.01;
    // Sclera
    ctx.fillStyle = "#fff8f0";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.018, size * 0.014, 0, 0, TAU);
    ctx.fill();
    // Iris (red, fierce)
    const irisGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.01);
    irisGrad.addColorStop(0, "#ff4400");
    irisGrad.addColorStop(0.5, "#cc0000");
    irisGrad.addColorStop(1, "#880000");
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.01, 0, TAU);
    ctx.fill();
    // Pupil
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.005, 0, TAU);
    ctx.fill();
    // Eye highlight
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(eyeX - size * 0.004, eyeY - size * 0.003, size * 0.003, 0, TAU);
    ctx.fill();
    // Fire trail from eye
    ctx.strokeStyle = `rgba(255,80,0,${0.15 + Math.sin(time * 4 + side * 2) * 0.08})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX + side * size * 0.018, eyeY);
    ctx.quadraticCurveTo(
      eyeX + side * size * 0.03, eyeY - size * 0.005,
      eyeX + side * size * 0.04, eyeY - size * 0.01,
    );
    ctx.stroke();
    // Eyebrow line
    ctx.strokeStyle = "rgba(80,40,20,0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX - side * size * 0.015, headY2 - size * 0.025);
    ctx.quadraticCurveTo(eyeX, headY2 - size * 0.032, eyeX + side * size * 0.02, headY2 - size * 0.022);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Nose with nostrils
  ctx.fillStyle = "#c09068";
  ctx.beginPath();
  ctx.ellipse(x, headY2 + size * 0.012, size * 0.014, size * 0.009, 0, 0, TAU);
  ctx.fill();
  // Nostril holes
  for (const side of [-1, 1]) {
    ctx.fillStyle = "rgba(60,30,15,0.3)";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.006, headY2 + size * 0.014, size * 0.004, size * 0.003, 0, 0, TAU);
    ctx.fill();
  }

  // Mouth with detailed lip and multiple rows of teeth
  const mouthOpen = isAttacking ? attackPhase * 0.018 + snarl * 0.008 : 0.006;
  // Upper lip
  ctx.fillStyle = "#a87055";
  ctx.beginPath();
  ctx.ellipse(x, headY2 + size * 0.032, size * 0.045, size * 0.008, 0, 0, Math.PI);
  ctx.fill();
  // Mouth cavity
  ctx.fillStyle = "#3a0a0a";
  ctx.beginPath();
  ctx.ellipse(x, headY2 + size * 0.037, size * 0.042, size * (0.008 + mouthOpen), 0, 0, TAU);
  ctx.fill();
  // Tongue (visible when mouth open)
  if (mouthOpen > 0.008) {
    ctx.fillStyle = "#cc5555";
    ctx.beginPath();
    ctx.ellipse(x, headY2 + size * 0.04, size * 0.025, size * mouthOpen * 0.6, 0, 0, TAU);
    ctx.fill();
  }
  // Upper teeth (sharp, 8 teeth)
  if (mouthOpen > 0.004 || isAttacking) {
    ctx.fillStyle = "#f0e8d0";
    for (let t = 0; t < 8; t++) {
      const toothX = x + (t - 3.5) * size * 0.009;
      const toothH = (t === 2 || t === 5) ? size * 0.01 : size * 0.006;
      ctx.beginPath();
      ctx.moveTo(toothX - size * 0.003, headY2 + size * 0.032);
      ctx.lineTo(toothX, headY2 + size * 0.032 + toothH);
      ctx.lineTo(toothX + size * 0.003, headY2 + size * 0.032);
      ctx.closePath();
      ctx.fill();
    }
    // Lower teeth (shorter, 6 teeth)
    for (let t = 0; t < 6; t++) {
      const toothX = x + (t - 2.5) * size * 0.01;
      ctx.beginPath();
      ctx.moveTo(toothX - size * 0.002, headY2 + size * 0.042);
      ctx.lineTo(toothX, headY2 + size * 0.042 - size * 0.005);
      ctx.lineTo(toothX + size * 0.002, headY2 + size * 0.042);
      ctx.closePath();
      ctx.fill();
    }
    // Fangs (prominent canines)
    for (const side of [-1, 1]) {
      ctx.fillStyle = "#efe0c8";
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.025, headY2 + size * 0.033);
      ctx.lineTo(x + side * size * 0.023, headY2 + size * 0.033 + size * 0.015);
      ctx.lineTo(x + side * size * 0.028, headY2 + size * 0.033);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Venom spray during tail strike attack
  if (isAttacking && tailStrike > 0.6) {
    const sprayAlpha = (tailStrike - 0.6) * 2.5;
    for (let vs = 0; vs < 6; vs++) {
      const vsAngle = -Math.PI * 0.3 + vs * 0.15 + Math.sin(time * 8 + vs) * 0.2;
      const vsDist = sprayAlpha * size * (0.1 + vs * 0.02);
      const vsx = prevTX + Math.cos(vsAngle) * vsDist;
      const vsy = prevTY - size * 0.08 + Math.sin(vsAngle) * vsDist;
      setShadowBlur(ctx, 2 * zoom, "rgba(100,220,50,0.3)");
      ctx.fillStyle = `rgba(120,240,60,${sprayAlpha * 0.3 * (1 - vs / 6)})`;
      ctx.beginPath();
      ctx.arc(vsx, vsy, size * (0.005 + Math.sin(vs) * 0.002), 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
  }
}

// ============================================================================
// WINTER REGION
// ============================================================================

// 14. FROST TROLL — Massive fearsome ice troll with crystal growths, frost aura, and frozen breath
export function drawFrostTrollEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.4;
  const walkPhase = time * 3;
  const lurch = Math.sin(walkPhase) * size * 0.02;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const breath = 1 + Math.sin(time * 2) * 0.025;
  const iceClubSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.7 : 0;
  const stompForce = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const muscleFlex = isAttacking ? 1 + stompForce * 0.08 : 1;

  // Heavy ground shadow (isometric)
  ctx.save();
  ctx.translate(x, y + size * 0.45);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.fillStyle = "rgba(0,10,30,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.4, size * 0.4, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Cracked frozen ground under feet
  ctx.save();
  ctx.translate(x, y + size * 0.42);
  ctx.scale(1, ISO_Y_RATIO);
  const groundGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.52);
  groundGrad.addColorStop(0, "rgba(180,230,255,0.2)");
  groundGrad.addColorStop(0.35, "rgba(140,200,255,0.12)");
  groundGrad.addColorStop(0.65, "rgba(100,170,255,0.05)");
  groundGrad.addColorStop(1, "rgba(80,150,255,0)");
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.52, size * 0.52, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(200,240,255,0.18)";
  ctx.lineWidth = 0.8 * zoom;
  for (let cr = 0; cr < 10; cr++) {
    const crAngle = cr * (TAU / 10) + time * 0.08;
    const crLen = size * (0.18 + Math.sin(time * 0.5 + cr * 1.3) * 0.08);
    const midX = Math.cos(crAngle) * crLen * 0.55 + Math.sin(cr * 2.3) * size * 0.04;
    const midY = Math.sin(crAngle) * crLen * 0.55 + Math.cos(cr * 1.7) * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(midX, midY);
    ctx.lineTo(Math.cos(crAngle) * crLen, Math.sin(crAngle) * crLen);
    ctx.stroke();
    if (cr % 3 === 0) {
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX + Math.cos(crAngle + 0.8) * size * 0.08, midY + Math.sin(crAngle + 0.8) * size * 0.08);
      ctx.stroke();
    }
  }
  // Ice spike eruption during stomp attack
  if (isAttacking && stompForce > 0.3) {
    for (let spike = 0; spike < 8; spike++) {
      const spAngle = spike * (TAU / 8) + 0.2;
      const spDist = size * 0.22 * stompForce + size * 0.1;
      const spHeight = size * 0.14 * stompForce;
      const spX = Math.cos(spAngle) * spDist;
      const spY = Math.sin(spAngle) * spDist;
      const spikeGrad = ctx.createLinearGradient(spX, spY, spX, spY - spHeight / ISO_Y_RATIO);
      spikeGrad.addColorStop(0, `rgba(160,210,255,${0.6 * stompForce})`);
      spikeGrad.addColorStop(1, `rgba(220,245,255,${0.3 * stompForce})`);
      ctx.fillStyle = spikeGrad;
      ctx.beginPath();
      ctx.moveTo(spX - size * 0.018, spY);
      ctx.lineTo(spX, spY - spHeight / ISO_Y_RATIO);
      ctx.lineTo(spX + size * 0.018, spY);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();

  // Frost aura particles
  for (let fp = 0; fp < 12; fp++) {
    const fpAngle = time * 0.6 + fp * (TAU / 12);
    const fpDist = size * 0.42 + Math.sin(time * 1.5 + fp * 2) * size * 0.08;
    const fpYOff = Math.sin(fpAngle) * fpDist * 0.35;
    const fpAlpha = 0.14 + Math.sin(time * 3 + fp) * 0.07;
    const fpSize = size * 0.012 + Math.sin(time * 2 + fp * 1.5) * size * 0.005;
    ctx.fillStyle = `rgba(170,220,255,${fpAlpha})`;
    ctx.beginPath();
    ctx.arc(x + Math.cos(fpAngle) * fpDist, y + fpYOff - size * 0.05, fpSize, 0, TAU);
    ctx.fill();
  }

  // Frozen breath cloud particles
  for (let fb = 0; fb < 8; fb++) {
    const fbPhase = (time * 0.8 + fb * 0.125) % 1;
    const fbx = x + size * 0.06 + fbPhase * size * 0.3 + Math.sin(time * 3 + fb) * size * 0.04;
    const fby = y - size * 0.28 - bodyBob + Math.sin(time * 2 + fb) * size * 0.025;
    const fbAlpha = (1 - fbPhase) * 0.28;
    const fbRad = size * 0.018 * (1 + fbPhase * 1.3);
    ctx.fillStyle = `rgba(200,235,255,${fbAlpha})`;
    ctx.beginPath();
    ctx.arc(fbx, fby, fbRad, 0, TAU);
    ctx.fill();
    if (fbPhase < 0.5) {
      ctx.fillStyle = `rgba(235,248,255,${(0.5 - fbPhase) * 0.35})`;
      ctx.beginPath();
      ctx.arc(fbx, fby, fbRad * 0.5, 0, TAU);
      ctx.fill();
    }
  }

  // Regeneration shimmer (icy blue)
  const regenAlpha = 0.1 + Math.sin(time * 3) * 0.08;
  setShadowBlur(ctx, 5 * zoom, `rgba(100,200,255,${regenAlpha * 2})`);
  ctx.strokeStyle = `rgba(100,200,255,${regenAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.35, size * 0.4, 0, 0, TAU);
  ctx.stroke();
  clearShadow(ctx);

  // Thick articulated legs
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + side * Math.PI * 0.5) * size * 0.04;
    const hipX = x + side * size * 0.13 + lurch;
    const hipY = y + size * 0.12 - bodyBob;
    const kneeX = hipX + side * size * 0.02;
    const kneeY = hipY + size * 0.13 + legSwing * 0.5;
    const footX = hipX;
    const footY = y + size * 0.4 + legSwing;
    // Thigh (muscular)
    const thighGrad = ctx.createLinearGradient(hipX - side * size * 0.04, hipY, hipX + side * size * 0.04, kneeY);
    thighGrad.addColorStop(0, bodyColorDark);
    thighGrad.addColorStop(0.5, bodyColor);
    thighGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = thighGrad;
    ctx.beginPath();
    ctx.moveTo(hipX - size * 0.065, hipY);
    ctx.quadraticCurveTo(hipX - size * 0.085, (hipY + kneeY) * 0.5, kneeX - size * 0.055, kneeY);
    ctx.lineTo(kneeX + size * 0.055, kneeY);
    ctx.quadraticCurveTo(hipX + size * 0.085, (hipY + kneeY) * 0.5, hipX + size * 0.065, hipY);
    ctx.closePath();
    ctx.fill();
    // Muscle highlight on thigh
    ctx.strokeStyle = "rgba(140,200,240,0.1)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(hipX + side * size * 0.02, hipY + size * 0.02);
    ctx.quadraticCurveTo(hipX + side * size * 0.04, (hipY + kneeY) * 0.5, kneeX + side * size * 0.01, kneeY - size * 0.02);
    ctx.stroke();
    // Knee joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(kneeX, kneeY, size * 0.05, size * 0.038, 0, 0, TAU);
    ctx.fill();
    // Shin
    const shinGrad = ctx.createLinearGradient(kneeX, kneeY, footX, footY);
    shinGrad.addColorStop(0, bodyColor);
    shinGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = shinGrad;
    ctx.beginPath();
    ctx.moveTo(kneeX - size * 0.045, kneeY);
    ctx.quadraticCurveTo(footX - size * 0.055, (kneeY + footY) * 0.5, footX - size * 0.04, footY);
    ctx.lineTo(footX + size * 0.05, footY);
    ctx.quadraticCurveTo(footX + size * 0.045, (kneeY + footY) * 0.5, kneeX + size * 0.045, kneeY);
    ctx.closePath();
    ctx.fill();
    // Ice-crusted feet
    const footGrad = ctx.createRadialGradient(footX, footY, 0, footX, footY, size * 0.065);
    footGrad.addColorStop(0, "rgba(200,240,255,0.7)");
    footGrad.addColorStop(0.6, "rgba(150,210,255,0.5)");
    footGrad.addColorStop(1, "rgba(100,180,255,0.15)");
    ctx.fillStyle = footGrad;
    ctx.beginPath();
    ctx.ellipse(footX, footY + size * 0.01, size * 0.065, size * 0.028, 0, 0, TAU);
    ctx.fill();
    // Foot ice spikes
    for (let ft = -1; ft <= 1; ft++) {
      ctx.fillStyle = "rgba(200,240,255,0.45)";
      ctx.beginPath();
      ctx.moveTo(footX + ft * size * 0.028, footY);
      ctx.lineTo(footX + ft * size * 0.022, footY + size * 0.04);
      ctx.lineTo(footX + ft * size * 0.034, footY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Massive body with muscle definition
  ctx.save();
  ctx.translate(x + lurch, y + size * 0.02 - bodyBob);
  ctx.scale(muscleFlex, 1);
  const bellyGrad = ctx.createRadialGradient(0, 0, 0, 0, size * 0.03, size * 0.32);
  bellyGrad.addColorStop(0, bodyColorLight);
  bellyGrad.addColorStop(0.3, bodyColor);
  bellyGrad.addColorStop(0.7, bodyColorDark);
  bellyGrad.addColorStop(1, "#0a1a3a");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.27 * breath, size * 0.28, -0.1, 0, TAU);
  ctx.fill();
  // Icy skin texture spots
  for (let st = 0; st < 8; st++) {
    const stAngle = st * (TAU / 8) + 0.3;
    const stDist = size * 0.15 + Math.sin(st * 2.1) * size * 0.05;
    const stAlpha = 0.08 + Math.sin(time * 1.5 + st) * 0.03;
    ctx.fillStyle = `rgba(160,210,240,${stAlpha})`;
    ctx.beginPath();
    ctx.ellipse(Math.cos(stAngle) * stDist, Math.sin(stAngle) * stDist * 0.95, size * 0.025, size * 0.02, stAngle, 0, TAU);
    ctx.fill();
  }
  // Muscle highlight lines (pectorals and abs)
  ctx.strokeStyle = "rgba(140,200,240,0.12)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.15);
  ctx.lineTo(0, size * 0.08);
  ctx.stroke();
  for (const ms of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(ms * size * 0.02, -size * 0.13);
    ctx.quadraticCurveTo(ms * size * 0.15, -size * 0.08, ms * size * 0.08, -size * 0.02);
    ctx.stroke();
  }
  for (let ab = 0; ab < 3; ab++) {
    const aby = size * 0.01 + ab * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(-size * 0.06, aby);
    ctx.lineTo(size * 0.06, aby);
    ctx.stroke();
  }
  // War paint frost patterns — spiral on left chest
  ctx.strokeStyle = "rgba(180,230,255,0.18)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  for (let wp = 0; wp < 20; wp++) {
    const wpAngle = wp * 0.32;
    const wpR = size * 0.008 + wp * size * 0.003;
    const wpx = -size * 0.08 + Math.cos(wpAngle) * wpR;
    const wpy = -size * 0.06 + Math.sin(wpAngle) * wpR;
    if (wp === 0) ctx.moveTo(wpx, wpy);
    else ctx.lineTo(wpx, wpy);
  }
  ctx.stroke();
  // Chevron pattern on right chest
  for (let chev = 0; chev < 3; chev++) {
    const chevy = -size * 0.1 + chev * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(size * 0.04, chevy);
    ctx.lineTo(size * 0.1, chevy + size * 0.02);
    ctx.lineTo(size * 0.04, chevy + size * 0.04);
    ctx.stroke();
  }
  ctx.restore();

  // Ice armor — shoulder plates
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.26 + lurch, y - size * 0.12 - bodyBob);
    const shoulderGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.1);
    shoulderGrad.addColorStop(0, "rgba(220,245,255,0.7)");
    shoulderGrad.addColorStop(0.5, "rgba(160,210,255,0.5)");
    shoulderGrad.addColorStop(1, "rgba(100,170,255,0.15)");
    ctx.fillStyle = shoulderGrad;
    ctx.beginPath();
    ctx.moveTo(side * -size * 0.06, size * 0.04);
    ctx.lineTo(side * -size * 0.03, -size * 0.06);
    ctx.lineTo(side * size * 0.04, -size * 0.03);
    ctx.lineTo(side * size * 0.05, size * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(side * -size * 0.04, size * 0.02);
    ctx.lineTo(side * size * 0.02, -size * 0.03);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(side * -size * 0.02, size * 0.03);
    ctx.lineTo(side * size * 0.03, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Ice armor — chest plate
  ctx.save();
  ctx.translate(x + lurch, y - size * 0.05 - bodyBob);
  const chestGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.12);
  chestGrad.addColorStop(0, "rgba(210,240,255,0.5)");
  chestGrad.addColorStop(0.7, "rgba(150,200,255,0.3)");
  chestGrad.addColorStop(1, "rgba(100,170,255,0.08)");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.lineTo(-size * 0.08, -size * 0.02);
  ctx.lineTo(-size * 0.06, size * 0.06);
  ctx.lineTo(size * 0.06, size * 0.06);
  ctx.lineTo(size * 0.08, -size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.08);
  ctx.lineTo(-size * 0.02, -size * 0.02);
  ctx.lineTo(size * 0.01, size * 0.03);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.02);
  ctx.lineTo(-size * 0.05, 0);
  ctx.stroke();
  ctx.restore();

  // Arms with ice-encrusted club
  for (const side of [-1, 1]) {
    const armAngle = side * (0.3 + Math.sin(walkPhase + side) * 0.1);
    const swing = side === 1 ? iceClubSwing : 0;
    ctx.save();
    ctx.translate(x + side * size * 0.26 + lurch, y - size * 0.1 - bodyBob);
    ctx.rotate(armAngle + swing);
    // Upper arm (bicep, muscular)
    const upperArmGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, size * 0.14);
    upperArmGrad.addColorStop(0, bodyColor);
    upperArmGrad.addColorStop(0.5, bodyColorLight);
    upperArmGrad.addColorStop(1, bodyColor);
    ctx.fillStyle = upperArmGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.07, size * 0.058 * muscleFlex, size * 0.09, 0, 0, TAU);
    ctx.fill();
    // Muscle highlight
    ctx.strokeStyle = "rgba(180,220,250,0.1)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(size * 0.02, size * 0.06, size * 0.03, -0.5, 1.5);
    ctx.stroke();
    // Elbow joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.15, size * 0.042, size * 0.032, 0, 0, TAU);
    ctx.fill();
    // Forearm
    const forearmGrad = ctx.createLinearGradient(-size * 0.03, size * 0.15, size * 0.03, size * 0.28);
    forearmGrad.addColorStop(0, bodyColor);
    forearmGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = forearmGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.22, size * 0.048, size * 0.1, 0, 0, TAU);
    ctx.fill();
    // Icicle fingers/claws
    for (let f = -1; f <= 1; f++) {
      const fingerGrad = ctx.createLinearGradient(f * size * 0.02, size * 0.3, f * size * 0.015, size * 0.39);
      fingerGrad.addColorStop(0, "rgba(180,220,255,0.8)");
      fingerGrad.addColorStop(1, "rgba(220,245,255,0.4)");
      ctx.fillStyle = fingerGrad;
      ctx.beginPath();
      ctx.moveTo(f * size * 0.025 - size * 0.006, size * 0.3);
      ctx.lineTo(f * size * 0.015, size * 0.39);
      ctx.lineTo(f * size * 0.025 + size * 0.006, size * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    // Ice club in right hand
    if (side === 1) {
      // Shaft
      const shaftGrad = ctx.createLinearGradient(-size * 0.02, size * 0.28, size * 0.02, size * 0.52);
      shaftGrad.addColorStop(0, "rgba(140,190,230,0.8)");
      shaftGrad.addColorStop(0.5, "rgba(100,160,220,0.7)");
      shaftGrad.addColorStop(1, "rgba(80,140,200,0.6)");
      ctx.fillStyle = shaftGrad;
      ctx.beginPath();
      ctx.roundRect(-size * 0.028, size * 0.28, size * 0.056, size * 0.24, size * 0.008);
      ctx.fill();
      // Grip wrapping
      ctx.strokeStyle = "rgba(100,150,200,0.3)";
      ctx.lineWidth = 0.8 * zoom;
      for (let gw = 0; gw < 4; gw++) {
        const gwy = size * 0.3 + gw * size * 0.04;
        ctx.beginPath();
        ctx.moveTo(-size * 0.028, gwy);
        ctx.lineTo(size * 0.028, gwy + size * 0.015);
        ctx.stroke();
      }
      // Club head (large crystal mass)
      setShadowBlur(ctx, 6 * zoom, "rgba(150,220,255,0.6)");
      const clubHeadGrad = ctx.createRadialGradient(0, size * 0.56, 0, 0, size * 0.56, size * 0.065);
      clubHeadGrad.addColorStop(0, "rgba(230,250,255,0.9)");
      clubHeadGrad.addColorStop(0.5, "rgba(180,220,255,0.7)");
      clubHeadGrad.addColorStop(1, "rgba(120,180,255,0.5)");
      ctx.fillStyle = clubHeadGrad;
      ctx.beginPath();
      ctx.moveTo(-size * 0.055, size * 0.5);
      ctx.lineTo(-size * 0.025, size * 0.46);
      ctx.lineTo(size * 0.025, size * 0.46);
      ctx.lineTo(size * 0.055, size * 0.5);
      ctx.lineTo(size * 0.045, size * 0.62);
      ctx.lineTo(-size * 0.045, size * 0.62);
      ctx.closePath();
      ctx.fill();
      // Crystal spikes on club head
      for (let cs = 0; cs < 4; cs++) {
        const csAngle = -0.6 + cs * 0.4;
        const csx = Math.sin(csAngle) * size * 0.045;
        const csy = size * 0.53 + Math.cos(csAngle) * size * 0.02;
        ctx.fillStyle = "rgba(220,245,255,0.8)";
        ctx.beginPath();
        ctx.moveTo(csx - size * 0.01, csy);
        ctx.lineTo(csx + Math.sin(csAngle) * size * 0.035, csy - size * 0.065);
        ctx.lineTo(csx + size * 0.01, csy);
        ctx.closePath();
        ctx.fill();
      }
      // Inner light refraction in club
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(-size * 0.02, size * 0.5);
      ctx.lineTo(0, size * 0.48);
      ctx.lineTo(size * 0.015, size * 0.54);
      ctx.lineTo(-size * 0.01, size * 0.58);
      ctx.closePath();
      ctx.fill();
      clearShadow(ctx);
    }
    ctx.restore();
  }

  // Ice crystal growths on shoulders/back
  const crystalPositions = [
    { cx: -0.19, cy: -0.17, angle: -0.55, len: 0.11, w: 0.02 },
    { cx: -0.13, cy: -0.21, angle: -0.35, len: 0.15, w: 0.019 },
    { cx: -0.06, cy: -0.24, angle: -0.12, len: 0.17, w: 0.021 },
    { cx: 0.06, cy: -0.24, angle: 0.12, len: 0.17, w: 0.021 },
    { cx: 0.13, cy: -0.21, angle: 0.35, len: 0.15, w: 0.019 },
    { cx: 0.19, cy: -0.17, angle: 0.55, len: 0.11, w: 0.02 },
    { cx: 0, cy: -0.26, angle: 0, len: 0.19, w: 0.023 },
    { cx: -0.09, cy: -0.19, angle: -0.65, len: 0.08, w: 0.014 },
    { cx: 0.09, cy: -0.19, angle: 0.65, len: 0.08, w: 0.014 },
  ];
  for (const cp of crystalPositions) {
    const cx2 = x + cp.cx * size + lurch;
    const cy2 = y + cp.cy * size - bodyBob;
    const cLen = cp.len * size;
    const cW = cp.w * size;
    const shimmer = 0.5 + Math.sin(time * 4 + cp.angle * 5) * 0.3;
    setShadowBlur(ctx, 4 * zoom, `rgba(150,220,255,${shimmer})`);
    ctx.save();
    ctx.translate(cx2, cy2);
    ctx.rotate(cp.angle);
    const crystGrad = ctx.createLinearGradient(0, 0, 0, -cLen);
    crystGrad.addColorStop(0, `rgba(120,180,255,${0.5 + shimmer * 0.2})`);
    crystGrad.addColorStop(0.5, `rgba(180,230,255,${0.7 + shimmer * 0.15})`);
    crystGrad.addColorStop(1, `rgba(220,245,255,${0.35 + shimmer * 0.3})`);
    ctx.fillStyle = crystGrad;
    ctx.beginPath();
    ctx.moveTo(-cW, 0);
    ctx.lineTo(-cW * 0.3, -cLen * 0.6);
    ctx.lineTo(0, -cLen);
    ctx.lineTo(cW * 0.3, -cLen * 0.6);
    ctx.lineTo(cW, 0);
    ctx.closePath();
    ctx.fill();
    // Inner bright edge refraction
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + shimmer * 0.2})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-cW * 0.2, -cLen * 0.1);
    ctx.lineTo(0, -cLen * 0.9);
    ctx.stroke();
    ctx.restore();
  }
  clearShadow(ctx);

  // Head
  const headY = y - size * 0.28 - bodyBob;
  const headX = x + lurch;
  // Skull with gradient
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.12);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.6, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.115, size * 0.105, 0, 0, TAU);
  ctx.fill();
  // Brow ridge
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(headX, headY - size * 0.04, size * 0.105, size * 0.032, 0, Math.PI, TAU);
  ctx.fill();
  // Jaw / lower face
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.065, size * 0.085, size * 0.042, 0, 0, Math.PI);
  ctx.fill();

  // Glowing ice-blue eyes
  setShadowBlur(ctx, 9 * zoom, "rgba(100,200,255,0.8)");
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#041428";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.042, headY - size * 0.015, size * 0.023, size * 0.019, side * 0.1, 0, TAU);
    ctx.fill();
    const eyePulse = 0.7 + Math.sin(time * 4 + side * 2) * 0.3;
    ctx.fillStyle = `rgba(100,200,255,${eyePulse})`;
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.042, headY - size * 0.015, size * 0.015, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(210,245,255,${eyePulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.042, headY - size * 0.015, size * 0.007, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Icicle beard
  for (let ib = 0; ib < 6; ib++) {
    const ibx = headX + (ib - 2.5) * size * 0.022;
    const iby = headY + size * 0.082;
    const ibLen = size * (0.035 + Math.sin(ib * 1.3) * 0.012);
    const icicleGrad = ctx.createLinearGradient(ibx, iby, ibx, iby + ibLen);
    icicleGrad.addColorStop(0, "rgba(180,230,255,0.7)");
    icicleGrad.addColorStop(1, "rgba(220,245,255,0.25)");
    ctx.fillStyle = icicleGrad;
    ctx.beginPath();
    ctx.moveTo(ibx - size * 0.007, iby);
    ctx.lineTo(ibx, iby + ibLen);
    ctx.lineTo(ibx + size * 0.007, iby);
    ctx.closePath();
    ctx.fill();
  }

  // Icicle hair spikes on top of head
  for (let ih = 0; ih < 5; ih++) {
    const ihAngle = -1.0 + ih * 0.45 + Math.sin(time * 0.5) * 0.04;
    const ihLen = size * (0.055 + ih * 0.008);
    const ihx = headX + Math.sin(ihAngle) * size * 0.065;
    const ihy = headY - size * 0.085;
    ctx.fillStyle = "rgba(190,230,255,0.55)";
    ctx.save();
    ctx.translate(ihx, ihy);
    ctx.rotate(ihAngle);
    ctx.beginPath();
    ctx.moveTo(-size * 0.009, 0);
    ctx.lineTo(0, -ihLen);
    ctx.lineTo(size * 0.009, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Tusks
  for (const side of [-1, 1]) {
    const tuskGrad = ctx.createLinearGradient(
      headX + side * size * 0.03, headY + size * 0.045,
      headX + side * size * 0.025, headY - size * 0.015
    );
    tuskGrad.addColorStop(0, "rgba(220,245,255,0.9)");
    tuskGrad.addColorStop(1, "rgba(180,220,255,0.55)");
    ctx.fillStyle = tuskGrad;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.024, headY + size * 0.05);
    ctx.lineTo(headX + side * size * 0.02, headY - size * 0.015);
    ctx.lineTo(headX + side * size * 0.036, headY + size * 0.05);
    ctx.closePath();
    ctx.fill();
  }

  // Nose
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.032, size * 0.016, size * 0.011, 0, 0, TAU);
  ctx.fill();
}

// 15. DIRE WOLF — Arctic wolf with frost breath and thick winter coat
export function drawDireWolfEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.45;
  const gallopPhase = time * 6;
  const gallop = Math.sin(gallopPhase);
  const bodyStretch = 1 + Math.abs(gallop) * 0.04;
  const bodyBob = Math.abs(Math.sin(gallopPhase)) * size * 0.02;
  const lunge = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 0.15 : 0;
  const breathe = 1 + Math.sin(time * 2.5) * 0.02;
  const jawOpen = isAttacking ? 0.4 + attackPhase * 0.45 : 0.1 + Math.sin(time * 2) * 0.04;

  // Frost breath (persistent, denser)
  for (let fb = 0; fb < 8; fb++) {
    const fbPhase = (time * 1.2 + fb * 0.125) % 1;
    const headFwdX = x + size * 0.38 + lunge;
    const fbx = headFwdX + fbPhase * size * 0.25;
    const fby = y - size * 0.06 - bodyBob + Math.sin(time * 3 + fb * 1.3) * size * 0.02;
    const fbSize = size * 0.012 * (1 + fbPhase * 1.5);
    ctx.fillStyle = `rgba(180,230,255,${(1 - fbPhase) * 0.25})`;
    ctx.beginPath();
    ctx.arc(fbx, fby, fbSize, 0, TAU);
    ctx.fill();
    if (fbPhase < 0.4) {
      ctx.fillStyle = `rgba(220,245,255,${(0.4 - fbPhase) * 0.3})`;
      ctx.beginPath();
      ctx.arc(fbx, fby, fbSize * 0.5, 0, TAU);
      ctx.fill();
    }
  }

  // Bushy frost-tipped tail
  const tailWag = Math.sin(time * 3) * 0.2 + (isAttacking ? -0.25 : 0);
  ctx.save();
  ctx.translate(x - size * 0.3, y - size * 0.03 - bodyBob);
  ctx.rotate(-0.65 + tailWag);
  const tailGrad = ctx.createLinearGradient(0, 0, -size * 0.28, -size * 0.1);
  tailGrad.addColorStop(0, bodyColor);
  tailGrad.addColorStop(0.5, bodyColorLight);
  tailGrad.addColorStop(0.8, "rgba(200,235,255,0.7)");
  tailGrad.addColorStop(1, "rgba(220,245,255,0.5)");
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.03);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.1, -size * 0.25, -size * 0.06);
  ctx.quadraticCurveTo(-size * 0.28, -size * 0.03, -size * 0.26, 0);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.04, 0, size * 0.03);
  ctx.fill();
  // Frost crystals on tail tip
  setShadowBlur(ctx, 3 * zoom, "#aaddff");
  ctx.fillStyle = "rgba(200,240,255,0.6)";
  for (let ic = 0; ic < 3; ic++) {
    const icA = -0.5 + ic * 0.4 + Math.sin(time * 2 + ic) * 0.1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 0.03);
    ctx.lineTo(-size * 0.25 + Math.cos(icA) * size * 0.03, -size * 0.03 + Math.sin(icA) * size * 0.03);
    ctx.lineTo(-size * 0.245, -size * 0.025);
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);
  ctx.restore();

  // Articulated legs with thick joints and ice claws
  const legLen = size * 0.15;
  const legData = [
    { xOff: -0.15, isFront: false, phase: 0 },
    { xOff: -0.07, isFront: false, phase: Math.PI * 0.5 },
    { xOff: 0.09, isFront: true, phase: Math.PI },
    { xOff: 0.19, isFront: true, phase: Math.PI * 1.5 },
  ];
  for (const leg of legData) {
    const swing = Math.sin(gallopPhase + leg.phase) * 0.38;
    const kneeBend = Math.max(0, -Math.sin(gallopPhase + leg.phase)) * 0.45;
    ctx.save();
    ctx.translate(x + leg.xOff * size + lunge * 0.3, y + (leg.isFront ? 0.08 : 0.1) * size - bodyBob);
    ctx.rotate(swing);

    // Upper leg (thick, powerful)
    const upperG = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, legLen);
    upperG.addColorStop(0, bodyColorDark);
    upperG.addColorStop(0.5, bodyColor);
    upperG.addColorStop(1, bodyColorDark);
    ctx.fillStyle = upperG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, 0);
    ctx.quadraticCurveTo(-size * 0.06, legLen * 0.35, -size * 0.035, legLen * 0.85);
    ctx.lineTo(size * 0.035, legLen * 0.85);
    ctx.quadraticCurveTo(size * 0.06, legLen * 0.35, size * 0.04, 0);
    ctx.closePath();
    ctx.fill();

    // Joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, legLen * 0.85, size * 0.035, size * 0.028, 0, 0, TAU);
    ctx.fill();

    ctx.translate(0, legLen * 0.85);
    ctx.rotate(kneeBend);

    // Lower leg
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, 0);
    ctx.lineTo(-size * 0.025, legLen * 0.75);
    ctx.lineTo(size * 0.025, legLen * 0.75);
    ctx.lineTo(size * 0.03, 0);
    ctx.closePath();
    ctx.fill();

    // Massive paw
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, legLen * 0.77, size * 0.04, size * 0.022, 0, 0, TAU);
    ctx.fill();

    // Ice-tipped claws
    setShadowBlur(ctx, 2 * zoom, "#88ccff");
    ctx.fillStyle = "rgba(180,230,255,0.8)";
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.moveTo(c * size * 0.015, legLen * 0.77 + size * 0.01);
      ctx.lineTo(c * size * 0.01, legLen * 0.77 + size * 0.035);
      ctx.lineTo(c * size * 0.02, legLen * 0.77 + size * 0.01);
      ctx.closePath();
      ctx.fill();
    }
    clearShadow(ctx);
    ctx.restore();
  }

  // Massive body (thick winter coat)
  const bodyGrad = ctx.createRadialGradient(
    x + lunge * 0.3, y - size * 0.01 - bodyBob, size * 0.08,
    x + lunge * 0.3, y - size * 0.01 - bodyBob, size * 0.32,
  );
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.7, bodyColorDark);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x + lunge * 0.3, y - size * 0.01 - bodyBob, size * 0.33 * bodyStretch, size * 0.17 * breathe, -0.04, 0, TAU);
  ctx.fill();

  // Muscle definition
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.7 * zoom;
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1 + lunge * 0.3, y - size * 0.06 - bodyBob, size * 0.08, size * 0.045, 0.2, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08 + lunge * 0.3, y - size * 0.04 - bodyBob, size * 0.06, size * 0.04, -0.2, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Thick shaggy fur texture (winter coat)
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 1.2 * zoom;
  for (let f = 0; f < 18; f++) {
    const fx = x - size * 0.28 + f * size * 0.033 + lunge * 0.2;
    const fy = y - size * 0.1 - bodyBob;
    const furLen = size * 0.06 + Math.sin(f * 1.7) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.sin(f + time * 1.5) * size * 0.015, fy + furLen);
    ctx.stroke();
  }

  // Frost-encrusted hackles
  for (let h = 0; h < 10; h++) {
    const hx = x - size * 0.2 + h * size * 0.04 + lunge * 0.2;
    const hy = y - size * 0.16 - bodyBob;
    const hackleH = size * 0.035 + Math.sin(time * 4 + h * 0.9) * size * 0.01;
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(hx - size * 0.008, hy + size * 0.02);
    ctx.lineTo(hx, hy - hackleH);
    ctx.lineTo(hx + size * 0.008, hy + size * 0.02);
    ctx.fill();
    // Ice crystal tips on hackles
    ctx.fillStyle = "rgba(200,240,255,0.4)";
    ctx.beginPath();
    ctx.moveTo(hx - size * 0.003, hy - hackleH + size * 0.005);
    ctx.lineTo(hx, hy - hackleH - size * 0.012);
    ctx.lineTo(hx + size * 0.003, hy - hackleH + size * 0.005);
    ctx.fill();
  }

  // Icicles hanging from underbelly
  ctx.fillStyle = "rgba(180,230,255,0.35)";
  for (let ic = 0; ic < 5; ic++) {
    const icx = x - size * 0.12 + ic * size * 0.06 + lunge * 0.15;
    const icy = y + size * 0.12 - bodyBob;
    const icLen = size * 0.025 + Math.sin(ic * 2.1) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(icx - size * 0.003, icy);
    ctx.lineTo(icx, icy + icLen);
    ctx.lineTo(icx + size * 0.003, icy);
    ctx.closePath();
    ctx.fill();
  }

  // Fierce head (larger, broader)
  const headX = x + size * 0.32 + lunge;
  const headY2 = y - size * 0.09 - bodyBob + Math.sin(gallopPhase * 0.5) * size * 0.008;
  const headGrad = ctx.createRadialGradient(headX, headY2, 0, headX, headY2, size * 0.13);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY2, size * 0.12, size * 0.1, 0.08, 0, TAU);
  ctx.fill();

  // Heavy brow ridge
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.07, headY2 - size * 0.04);
  ctx.quadraticCurveTo(headX, headY2 - size * 0.07, headX + size * 0.07, headY2 - size * 0.03);
  ctx.quadraticCurveTo(headX, headY2 - size * 0.045, headX - size * 0.07, headY2 - size * 0.04);
  ctx.fill();

  // Broad snout
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.07, headY2 - size * 0.025);
  ctx.quadraticCurveTo(headX + size * 0.18, headY2 - size * 0.005, headX + size * 0.19, headY2 + size * 0.02);
  ctx.quadraticCurveTo(headX + size * 0.18, headY2 + size * 0.045, headX + size * 0.07, headY2 + size * 0.045);
  ctx.closePath();
  ctx.fill();

  // Nose
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.18, headY2 + size * 0.015, size * 0.02, size * 0.015, 0, 0, TAU);
  ctx.fill();

  // Snarl wrinkles
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.7 * zoom;
  ctx.globalAlpha = 0.3;
  for (let w = 0; w < 3; w++) {
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.09 + w * size * 0.025, headY2 - size * 0.02);
    ctx.quadraticCurveTo(headX + size * 0.1 + w * size * 0.025, headY2 + size * 0.005, headX + size * 0.09 + w * size * 0.025, headY2 + size * 0.02);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Open jaws with massive fangs (always snarling)
  ctx.fillStyle = "#2a0a1a";
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.11, headY2 + size * 0.01);
  ctx.quadraticCurveTo(headX + size * 0.16, headY2 + size * 0.005 - jawOpen * size * 0.1, headX + size * 0.18, headY2 - jawOpen * size * 0.05);
  ctx.lineTo(headX + size * 0.18, headY2 + size * 0.035 + jawOpen * size * 0.05);
  ctx.quadraticCurveTo(headX + size * 0.16, headY2 + size * 0.025 + jawOpen * size * 0.1, headX + size * 0.11, headY2 + size * 0.035);
  ctx.closePath();
  ctx.fill();

  // Tongue
  if (jawOpen > 0.15) {
    ctx.fillStyle = "#7a2030";
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.14, headY2 + size * 0.03, size * 0.025, size * 0.008, 0, 0, TAU);
    ctx.fill();
  }

  // Massive fangs (ice-like, semi-translucent)
  setShadowBlur(ctx, 2 * zoom, "#aaddff");
  ctx.fillStyle = "rgba(230,245,255,0.9)";
  const fangLen = size * 0.04 + jawOpen * size * 0.02;
  for (const [fx, baseY] of [[0.12, 0.005], [0.14, 0.0], [0.1, 0.01]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(headX + fx * size - size * 0.004, headY2 + baseY * size);
    ctx.lineTo(headX + fx * size, headY2 + baseY * size + fangLen);
    ctx.lineTo(headX + fx * size + size * 0.004, headY2 + baseY * size);
    ctx.closePath();
    ctx.fill();
  }
  for (const [fx, baseY] of [[0.12, 0.035], [0.14, 0.032]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(headX + fx * size - size * 0.004, headY2 + baseY * size);
    ctx.lineTo(headX + fx * size, headY2 + baseY * size - fangLen * 0.8);
    ctx.lineTo(headX + fx * size + size * 0.004, headY2 + baseY * size);
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);

  // Saliva / frost drool
  if (jawOpen > 0.08) {
    ctx.strokeStyle = `rgba(200,230,255,${jawOpen * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    for (let s = 0; s < 3; s++) {
      const sx = headX + size * (0.11 + s * 0.025);
      ctx.beginPath();
      ctx.moveTo(sx, headY2 + size * 0.01);
      ctx.quadraticCurveTo(sx + size * 0.005, headY2 + size * 0.02, sx - size * 0.002, headY2 + size * 0.03);
      ctx.stroke();
    }
  }

  // Thick pointed ears with frost tips
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.04, headY2 - size * 0.07);
    ctx.lineTo(headX + side * size * 0.06, headY2 - size * 0.15);
    ctx.lineTo(headX + side * size * 0.08, headY2 - size * 0.07);
    ctx.fill();
    // Frost on ear tips
    ctx.fillStyle = "rgba(200,240,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.055, headY2 - size * 0.1);
    ctx.lineTo(headX + side * size * 0.06, headY2 - size * 0.15);
    ctx.lineTo(headX + side * size * 0.065, headY2 - size * 0.1);
    ctx.fill();
  }

  // Thick neck ruff (dense winter mane)
  for (let nr = 0; nr < 8; nr++) {
    const nrAngle = -0.6 + nr * 0.15;
    const nrDist = size * 0.09;
    const nrx = headX - size * 0.06 + Math.cos(nrAngle) * nrDist;
    const nry = headY2 + Math.sin(nrAngle) * nrDist * 0.7;
    const nrLen = size * 0.04 + Math.sin(time * 3 + nr) * size * 0.008;
    ctx.fillStyle = bodyColorLight;
    ctx.beginPath();
    ctx.moveTo(nrx - size * 0.01, nry);
    ctx.quadraticCurveTo(nrx, nry - nrLen, nrx + size * 0.01, nry);
    ctx.fill();
  }

  // Piercing ice-blue eyes
  setShadowBlur(ctx, 10 * zoom, "#44aaff");
  for (const side of [-1, 1]) {
    const ey = headY2 - size * 0.02 + side * size * 0.02;
    const eyeGrad = ctx.createRadialGradient(headX + size * 0.045, ey, 0, headX + size * 0.045, ey, size * 0.022);
    eyeGrad.addColorStop(0, "#ffffff");
    eyeGrad.addColorStop(0.25, "#bbeeFF");
    eyeGrad.addColorStop(0.5, "#66bbff");
    eyeGrad.addColorStop(0.8, "#3366dd");
    eyeGrad.addColorStop(1, "#1a2266");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.045, ey, size * 0.022, size * 0.016, 0.1, 0, TAU);
    ctx.fill();
    // Slit pupil
    ctx.fillStyle = "#060618";
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.045, ey, size * 0.005, size * 0.014, 0, 0, TAU);
    ctx.fill();
    // Eye frost trail
    ctx.strokeStyle = `rgba(150,220,255,${0.2 + Math.sin(time * 4 + side) * 0.1})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.045 - size * 0.02, ey);
    ctx.quadraticCurveTo(headX - size * 0.01, ey + side * size * 0.01, headX - size * 0.04, ey + side * size * 0.005 - size * 0.015);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Frost aura (isometric ground ring)
  const frostAuraAlpha = 0.08 + Math.sin(time * 2) * 0.04;
  ctx.strokeStyle = `rgba(150,220,255,${frostAuraAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.setLineDash([4 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x + lunge * 0.15, y + size * 0.15, size * 0.4, size * 0.4 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);

  // Frost mist swirling around body (denser)
  for (let fm = 0; fm < 7; fm++) {
    const fmPhase = (time * 0.8 + fm * 0.143) % 1;
    const fmAngle = time * 2 + fm * 0.9;
    const fmx = x + Math.cos(fmAngle) * size * 0.35 + lunge * 0.2;
    const fmy = y + Math.sin(fmAngle) * size * 0.12 - bodyBob - fmPhase * size * 0.1;
    const fmSize = size * 0.018 * (1 + fmPhase);
    ctx.fillStyle = `rgba(200,235,255,${(1 - fmPhase) * 0.15})`;
    ctx.beginPath();
    ctx.arc(fmx, fmy, fmSize, 0, TAU);
    ctx.fill();
    if (fmPhase < 0.3) {
      ctx.fillStyle = `rgba(230,248,255,${(0.3 - fmPhase) * 0.2})`;
      ctx.beginPath();
      ctx.arc(fmx, fmy, fmSize * 0.5, 0, TAU);
      ctx.fill();
    }
  }

  // Frosty ground trail behind wolf
  for (let gt = 0; gt < 4; gt++) {
    const gtPhase = (time * 0.4 + gt * 0.25) % 1;
    const gtx = x - size * 0.15 - gt * size * 0.1 + lunge * 0.1;
    ctx.fillStyle = `rgba(180,230,255,${(1 - gtPhase) * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(gtx, y + size * 0.2, size * 0.04 * (1 - gtPhase * 0.5), size * 0.015 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.fill();
  }
}

// 16. WENDIGO — Terrifying gaunt antlered horror with skeletal body and dark aura
export function drawWendigoEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.4;
  const sway = Math.sin(time * 1.8) * size * 0.015;
  const breath = 1 + Math.sin(time * 3) * 0.02;
  const lurch = Math.sin(time * 2.5) * size * 0.01;
  const clawSlash = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.6 : 0;
  const hungerTwitch = Math.sin(time * 12) * size * 0.003;
  const madnessShake = Math.sin(time * 18) * size * 0.001;

  // Ground frost spreading (isometric)
  ctx.save();
  ctx.translate(x, y + size * 0.42);
  ctx.scale(1, ISO_Y_RATIO);
  const frostGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.58);
  frostGrad.addColorStop(0, "rgba(60,80,120,0.16)");
  frostGrad.addColorStop(0.3, "rgba(40,50,80,0.1)");
  frostGrad.addColorStop(0.6, "rgba(20,30,60,0.04)");
  frostGrad.addColorStop(1, "rgba(0,0,20,0)");
  ctx.fillStyle = frostGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.58, size * 0.58, 0, 0, TAU);
  ctx.fill();
  // Frost tendrils creeping outward
  ctx.strokeStyle = "rgba(150,200,255,0.12)";
  ctx.lineWidth = 0.6 * zoom;
  for (let ft = 0; ft < 12; ft++) {
    const ftAngle = ft * (TAU / 12) + time * 0.04;
    const ftLen = size * (0.22 + Math.sin(time * 0.3 + ft * 1.7) * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(ftAngle + 0.2) * ftLen * 0.6,
      Math.sin(ftAngle + 0.2) * ftLen * 0.6,
      Math.cos(ftAngle) * ftLen,
      Math.sin(ftAngle) * ftLen
    );
    ctx.stroke();
  }
  ctx.restore();

  // Dark aura with swirling shadow particles
  drawRadialAura(ctx, x, y, size * 0.55, [
    { offset: 0, color: "rgba(20,0,40,0.2)" },
    { offset: 0.3, color: "rgba(15,0,30,0.12)" },
    { offset: 0.6, color: "rgba(10,0,20,0.05)" },
    { offset: 1, color: "rgba(0,0,10,0)" },
  ]);
  // Shadow wisps orbiting
  for (let sw = 0; sw < 10; sw++) {
    const swAngle = time * 1.2 + sw * (TAU / 10);
    const swDist = size * 0.32 + Math.sin(time * 2 + sw * 1.5) * size * 0.08;
    const swSize = size * 0.018 + Math.sin(time * 3 + sw) * size * 0.007;
    const swAlpha = 0.1 + Math.sin(time * 2.5 + sw * 0.8) * 0.05;
    const swX = x + Math.cos(swAngle) * swDist;
    const swY = y + Math.sin(swAngle) * swDist * 0.4 - size * 0.05;
    ctx.fillStyle = `rgba(30,0,50,${swAlpha})`;
    ctx.beginPath();
    ctx.ellipse(swX, swY, swSize, swSize * 0.55, swAngle, 0, TAU);
    ctx.fill();
  }

  // Will-o-wisp lights
  for (let wisp = 0; wisp < 5; wisp++) {
    const wAngle = time * 0.8 + wisp * (TAU / 5);
    const wDist = size * 0.38 + Math.sin(time * 1.5 + wisp * 2.1) * size * 0.1;
    const wX = x + Math.cos(wAngle) * wDist;
    const wY = y + Math.sin(wAngle) * wDist * 0.35 - size * 0.1;
    const wAlpha = 0.3 + Math.sin(time * 5 + wisp * 1.3) * 0.2;
    const wSize = size * 0.014 + Math.sin(time * 4 + wisp) * size * 0.005;
    setShadowBlur(ctx, 7 * zoom, `rgba(100,180,255,${wAlpha})`);
    ctx.fillStyle = `rgba(150,220,255,${wAlpha})`;
    ctx.beginPath();
    ctx.arc(wX, wY, wSize, 0, TAU);
    ctx.fill();
    // Wisp trail
    const trailAlpha = wAlpha * 0.4;
    ctx.fillStyle = `rgba(120,190,255,${trailAlpha})`;
    ctx.beginPath();
    ctx.arc(wX - Math.cos(wAngle) * size * 0.02, wY - Math.sin(wAngle) * size * 0.01, wSize * 0.6, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Frost mist swirling
  for (let fm = 0; fm < 8; fm++) {
    const fmAngle = time * 1.5 + fm * (TAU / 8);
    const fmDist = size * 0.35 + Math.sin(time * 2 + fm) * size * 0.06;
    const fmAlpha = 0.1 + Math.sin(time * 3 + fm) * 0.05;
    const fmSize = size * 0.025 + Math.sin(time * 2.5 + fm * 1.2) * size * 0.008;
    ctx.fillStyle = `rgba(180,220,255,${fmAlpha})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(fmAngle) * fmDist,
      y + size * 0.12 + Math.sin(fmAngle) * fmDist * 0.3,
      fmSize, 0, TAU
    );
    ctx.fill();
  }

  // Ambient ice crystal particles floating upward
  for (let ic = 0; ic < 7; ic++) {
    const icPhase = (time * 0.4 + ic * 0.143) % 1;
    const icX = x + Math.sin(time + ic * 2.2) * size * 0.3;
    const icY = y - size * 0.05 - icPhase * size * 0.5;
    const icAlpha = (1 - icPhase) * 0.22;
    const icSize = size * 0.008;
    ctx.fillStyle = `rgba(200,240,255,${icAlpha})`;
    ctx.save();
    ctx.translate(icX, icY);
    ctx.rotate(time * 2 + ic);
    ctx.beginPath();
    ctx.moveTo(0, -icSize);
    ctx.lineTo(icSize * 0.5, 0);
    ctx.lineTo(0, icSize);
    ctx.lineTo(-icSize * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Reversed-knee deer legs with hooves
  for (const side of [-1, 1]) {
    const legPhase = Math.sin(time * 3 + side) * size * 0.03;
    const hipX = x + side * size * 0.06 + sway;
    const hipY = y + size * 0.05;
    const kneeX = hipX + side * size * 0.035;
    const kneeY = hipY + size * 0.12 + legPhase * 0.5;
    const ankleX = kneeX - side * size * 0.025;
    const ankleY = kneeY + size * 0.14;
    const hoofX = ankleX + side * size * 0.01;
    const hoofY = y + size * 0.39 + legPhase;
    // Upper leg bone
    const upperLegGrad = ctx.createLinearGradient(hipX, hipY, kneeX, kneeY);
    upperLegGrad.addColorStop(0, bodyColor);
    upperLegGrad.addColorStop(1, bodyColorDark);
    ctx.strokeStyle = upperLegGrad;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();
    // Knee joint (reversed, prominent)
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(kneeX, kneeY, size * 0.02, size * 0.018, 0, 0, TAU);
    ctx.fill();
    // Lower leg (backward angle)
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 2.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(ankleX, ankleY);
    ctx.stroke();
    // Ankle joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(ankleX, ankleY, size * 0.013, 0, TAU);
    ctx.fill();
    // Cannon bone to hoof
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(ankleX, ankleY);
    ctx.lineTo(hoofX, hoofY);
    ctx.stroke();
    // Cloven hoof
    ctx.fillStyle = "#1a1a2a";
    ctx.beginPath();
    ctx.moveTo(hoofX - size * 0.018, hoofY);
    ctx.lineTo(hoofX - size * 0.008, hoofY + size * 0.02);
    ctx.lineTo(hoofX - size * 0.002, hoofY + size * 0.015);
    ctx.lineTo(hoofX + size * 0.002, hoofY + size * 0.015);
    ctx.lineTo(hoofX + size * 0.008, hoofY + size * 0.02);
    ctx.lineTo(hoofX + size * 0.018, hoofY);
    ctx.closePath();
    ctx.fill();
    // Tattered skin hanging from legs
    const tatSwing = Math.sin(time * 2 + side * 3) * 0.15;
    ctx.save();
    ctx.translate((hipX + kneeX) * 0.5, (hipY + kneeY) * 0.5);
    ctx.rotate(tatSwing);
    ctx.fillStyle = "rgba(80,60,50,0.18)";
    ctx.beginPath();
    ctx.moveTo(size * 0.015, 0);
    ctx.lineTo(size * 0.025, size * 0.04);
    ctx.quadraticCurveTo(size * 0.015, size * 0.05, size * 0.005, size * 0.038);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Gaunt ribcage torso with visible spine
  ctx.save();
  ctx.translate(x + sway + hungerTwitch + madnessShake, y - size * 0.1 + lurch);
  ctx.scale(breath, 1);
  // Torso outline
  const torsoGrad = ctx.createLinearGradient(-size * 0.1, -size * 0.2, size * 0.1, size * 0.18);
  torsoGrad.addColorStop(0, bodyColorDark);
  torsoGrad.addColorStop(0.3, bodyColor);
  torsoGrad.addColorStop(0.7, bodyColor);
  torsoGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, size * 0.15);
  ctx.quadraticCurveTo(-size * 0.13, size * 0.05, -size * 0.1, -size * 0.05);
  ctx.quadraticCurveTo(-size * 0.08, -size * 0.2, -size * 0.04, -size * 0.25);
  ctx.quadraticCurveTo(0, -size * 0.28, size * 0.04, -size * 0.25);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.2, size * 0.1, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.13, size * 0.05, size * 0.08, size * 0.15);
  ctx.closePath();
  ctx.fill();
  // Sunken belly hollow
  const bellyGrad = ctx.createRadialGradient(0, size * 0.05, 0, 0, size * 0.05, size * 0.08);
  bellyGrad.addColorStop(0, "rgba(0,0,0,0.16)");
  bellyGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.06, size * 0.08, 0, 0, TAU);
  ctx.fill();
  // Visible rib lines (detailed, paired)
  ctx.lineWidth = 1 * zoom;
  for (let r = 0; r < 6; r++) {
    const ry = -size * 0.12 + r * size * 0.04;
    const ribCurve = size * 0.015 + r * size * 0.003;
    // Shadow rib
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.07, ry);
    ctx.quadraticCurveTo(-size * 0.04, ry + ribCurve, 0, ry + ribCurve * 1.2);
    ctx.quadraticCurveTo(size * 0.04, ry + ribCurve, size * 0.07, ry);
    ctx.stroke();
    // Bone highlight rib
    ctx.strokeStyle = "rgba(200,190,170,0.08)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.06, ry - size * 0.003);
    ctx.quadraticCurveTo(0, ry + ribCurve * 0.8, size * 0.06, ry - size * 0.003);
    ctx.stroke();
    ctx.lineWidth = 1 * zoom;
  }
  // Spine ridge
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.22);
  for (let sv = 0; sv < 8; sv++) {
    const svy = -size * 0.22 + sv * size * 0.05;
    const svx = Math.sin(sv * 0.3) * size * 0.004;
    ctx.lineTo(svx, svy);
  }
  ctx.stroke();
  // Vertebra bumps
  for (let vb = 0; vb < 7; vb++) {
    const vby = -size * 0.2 + vb * size * 0.05;
    ctx.fillStyle = "rgba(180,170,150,0.1)";
    ctx.beginPath();
    ctx.ellipse(0, vby, size * 0.008, size * 0.005, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // Tattered skin patches hanging from body
  for (let ts = 0; ts < 8; ts++) {
    const tsx = x + (ts - 3.5) * size * 0.04 + sway;
    const tsy = y - size * 0.05 + (ts % 3) * size * 0.035 + lurch;
    const tsSwing = Math.sin(time * 2 + ts * 1.5) * 0.2;
    const tsAlpha = 0.14 + Math.sin(ts * 2.1) * 0.04;
    ctx.save();
    ctx.translate(tsx, tsy);
    ctx.rotate(tsSwing);
    ctx.fillStyle = `rgba(90,70,55,${tsAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.015, size * 0.022);
    ctx.quadraticCurveTo(size * 0.01, size * 0.04, -size * 0.005, size * 0.048);
    ctx.lineTo(-size * 0.01, size * 0.028);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(60,45,35,${tsAlpha * 0.7})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.015, size * 0.022);
    ctx.lineTo(-size * 0.005, size * 0.048);
    ctx.stroke();
    ctx.restore();
  }

  // Elongated arms with razor claws
  for (const side of [-1, 1]) {
    const armAngle = side * (0.4 + Math.sin(time * 2) * 0.1 + clawSlash);
    ctx.save();
    ctx.translate(x + side * size * 0.1 + sway, y - size * 0.18 + lurch);
    ctx.rotate(armAngle);
    // Upper arm (bony)
    const upperArmGrad = ctx.createLinearGradient(0, 0, 0, size * 0.2);
    upperArmGrad.addColorStop(0, bodyColor);
    upperArmGrad.addColorStop(1, bodyColorDark);
    ctx.strokeStyle = upperArmGrad;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.01, size * 0.1);
    ctx.lineTo(0, size * 0.2);
    ctx.stroke();
    // Elbow knob
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.2, size * 0.016, size * 0.013, 0, 0, TAU);
    ctx.fill();
    // Forearm
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.2);
    ctx.lineTo(size * 0.01, size * 0.3);
    ctx.lineTo(size * 0.02, size * 0.38);
    ctx.stroke();
    // Wrist bones visible
    ctx.fillStyle = "rgba(200,190,170,0.14)";
    ctx.beginPath();
    ctx.ellipse(size * 0.02, size * 0.37, size * 0.013, size * 0.009, 0, 0, TAU);
    ctx.fill();
    // Razor claw fingers (4 claws)
    for (let c = 0; c < 4; c++) {
      const cAngle = -0.3 + c * 0.2;
      const clawLen = size * (0.065 + c * 0.005);
      ctx.save();
      ctx.translate(size * 0.02, size * 0.38);
      ctx.rotate(cAngle);
      const clawGrad = ctx.createLinearGradient(0, 0, 0, clawLen);
      clawGrad.addColorStop(0, bodyColorDark);
      clawGrad.addColorStop(0.6, "#1a1a2a");
      clawGrad.addColorStop(1, "#0a0a15");
      ctx.fillStyle = clawGrad;
      ctx.beginPath();
      ctx.moveTo(-size * 0.005, 0);
      ctx.quadraticCurveTo(-size * 0.003, clawLen * 0.6, size * 0.001, clawLen);
      ctx.quadraticCurveTo(size * 0.003, clawLen * 0.6, size * 0.005, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // Neck (thin, exposed tendons)
  const headY = y - size * 0.38 + lurch + hungerTwitch;
  const headX = x + sway + madnessShake;
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + sway, y - size * 0.22 + lurch);
  ctx.quadraticCurveTo(headX - size * 0.01, y - size * 0.3 + lurch, headX, headY + size * 0.06);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.5 * zoom;
  for (const tn of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + sway + tn * size * 0.01, y - size * 0.2 + lurch);
    ctx.lineTo(headX + tn * size * 0.008, headY + size * 0.04);
    ctx.stroke();
  }

  // Deer skull head
  const skullGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.09);
  skullGrad.addColorStop(0, "#ede0c8");
  skullGrad.addColorStop(0.4, "#d8c8a8");
  skullGrad.addColorStop(0.8, "#c0a880");
  skullGrad.addColorStop(1, "#a89070");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.065, size * 0.088, 0, 0, TAU);
  ctx.fill();
  // Bone texture cracks on skull
  ctx.strokeStyle = "rgba(100,80,60,0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.01, headY - size * 0.06);
  ctx.lineTo(headX - size * 0.03, headY - size * 0.02);
  ctx.lineTo(headX - size * 0.02, headY + size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.015, headY - size * 0.05);
  ctx.lineTo(headX + size * 0.025, headY - size * 0.01);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.03);
  ctx.lineTo(headX + size * 0.01, headY + size * 0.01);
  ctx.lineTo(headX - size * 0.005, headY + size * 0.03);
  ctx.stroke();
  // Elongated snout
  const snoutGrad = ctx.createRadialGradient(headX, headY + size * 0.09, 0, headX, headY + size * 0.09, size * 0.05);
  snoutGrad.addColorStop(0, "#ddd0b0");
  snoutGrad.addColorStop(0.7, "#c8b898");
  snoutGrad.addColorStop(1, "#b0a080");
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.09, size * 0.042, size * 0.046, 0, 0, TAU);
  ctx.fill();
  // Nasal cavity
  ctx.fillStyle = "#1a1520";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.085, size * 0.016, size * 0.02, 0, 0, TAU);
  ctx.fill();
  // Jaw with teeth
  ctx.fillStyle = "#c0a880";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.125, size * 0.036, size * 0.016, 0, 0, Math.PI);
  ctx.fill();
  // Jagged teeth
  ctx.fillStyle = "#e8dcc0";
  for (let tooth = 0; tooth < 6; tooth++) {
    const tx = headX - size * 0.028 + tooth * size * 0.011;
    ctx.beginPath();
    ctx.moveTo(tx, headY + size * 0.118);
    ctx.lineTo(tx + size * 0.004, headY + size * 0.132);
    ctx.lineTo(tx + size * 0.008, headY + size * 0.118);
    ctx.fill();
  }

  // Empty eye sockets with flickering blue-white flames
  for (const side of [-1, 1]) {
    const socketX = headX + side * size * 0.028;
    const socketY = headY - size * 0.02;
    // Deep socket
    ctx.fillStyle = "#0a0510";
    ctx.beginPath();
    ctx.ellipse(socketX, socketY, size * 0.021, size * 0.026, side * 0.15, 0, TAU);
    ctx.fill();
    // Flickering flame
    const flameFlicker = Math.sin(time * 8 + side * 3) * 0.3;
    const flameHeight = size * (0.032 + Math.sin(time * 6 + side) * 0.01);
    setShadowBlur(ctx, 9 * zoom, `rgba(120,180,255,${0.6 + flameFlicker})`);
    // Outer flame
    ctx.fillStyle = `rgba(100,170,255,${0.4 + flameFlicker * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(socketX - size * 0.013, socketY + size * 0.006);
    ctx.quadraticCurveTo(socketX - size * 0.016, socketY - flameHeight * 0.5, socketX, socketY - flameHeight);
    ctx.quadraticCurveTo(socketX + size * 0.016, socketY - flameHeight * 0.5, socketX + size * 0.013, socketY + size * 0.006);
    ctx.closePath();
    ctx.fill();
    // Inner bright core
    ctx.fillStyle = `rgba(200,230,255,${0.5 + flameFlicker * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(socketX - size * 0.007, socketY);
    ctx.quadraticCurveTo(socketX, socketY - flameHeight * 0.7, socketX + size * 0.007, socketY);
    ctx.closePath();
    ctx.fill();
    // Hot point
    ctx.fillStyle = `rgba(240,250,255,${0.6 + Math.sin(time * 10 + side * 5) * 0.3})`;
    ctx.beginPath();
    ctx.arc(socketX, socketY - size * 0.005, size * 0.005, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Massive branching antlers with frost tips
  for (const side of [-1, 1]) {
    const antlerBaseX = headX + side * size * 0.04;
    const antlerBaseY = headY - size * 0.075;
    const beam1X = antlerBaseX + side * size * 0.08;
    const beam1Y = antlerBaseY - size * 0.1;
    const beam2X = beam1X + side * size * 0.05;
    const beam2Y = beam1Y - size * 0.08;
    const beamTipX = beam2X + side * size * 0.03;
    const beamTipY = beam2Y - size * 0.06;
    // Main beam (thick base, tapering)
    ctx.strokeStyle = "#a89070";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(antlerBaseX, antlerBaseY);
    ctx.quadraticCurveTo(antlerBaseX + side * size * 0.04, antlerBaseY - size * 0.06, beam1X, beam1Y);
    ctx.stroke();
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(beam1X, beam1Y);
    ctx.lineTo(beam2X, beam2Y);
    ctx.stroke();
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(beam2X, beam2Y);
    ctx.lineTo(beamTipX, beamTipY);
    ctx.stroke();
    // Brow tine (forward)
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(antlerBaseX + side * size * 0.04, antlerBaseY - size * 0.05);
    ctx.lineTo(antlerBaseX + side * size * 0.02, antlerBaseY - size * 0.14);
    ctx.stroke();
    // Middle tine (upward)
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(beam1X, beam1Y);
    ctx.lineTo(beam1X - side * size * 0.02, beam1Y - size * 0.1);
    ctx.stroke();
    // Upper tine (outward)
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(beam2X, beam2Y);
    ctx.lineTo(beam2X + side * size * 0.06, beam2Y - size * 0.04);
    ctx.stroke();
    // Crown tine
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(beam2X, beam2Y);
    ctx.lineTo(beam2X - side * size * 0.01, beam2Y - size * 0.08);
    ctx.stroke();
    // Frost tips on antler ends
    const frostTips = [
      { tx: beamTipX, ty: beamTipY },
      { tx: antlerBaseX + side * size * 0.02, ty: antlerBaseY - size * 0.14 },
      { tx: beam1X - side * size * 0.02, ty: beam1Y - size * 0.1 },
      { tx: beam2X + side * size * 0.06, ty: beam2Y - size * 0.04 },
      { tx: beam2X - side * size * 0.01, ty: beam2Y - size * 0.08 },
    ];
    for (let fti = 0; fti < frostTips.length; fti++) {
      const ftp = frostTips[fti];
      const ftAlpha = 0.4 + Math.sin(time * 3 + fti * 1.5) * 0.2;
      setShadowBlur(ctx, 3 * zoom, `rgba(150,220,255,${ftAlpha})`);
      ctx.fillStyle = `rgba(200,240,255,${ftAlpha})`;
      ctx.beginPath();
      ctx.arc(ftp.tx, ftp.ty, size * 0.008, 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
    // Bone texture lines on antlers
    ctx.strokeStyle = "rgba(80,65,50,0.14)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(antlerBaseX + side * size * 0.02, antlerBaseY - size * 0.03);
    ctx.lineTo(beam1X - side * size * 0.01, beam1Y + size * 0.02);
    ctx.stroke();
  }

  // Frost breath
  for (let fb = 0; fb < 6; fb++) {
    const fbPhase = (time * 0.7 + fb * 0.167) % 1;
    const fbx = headX + fbPhase * size * 0.22 + Math.sin(time * 3 + fb) * size * 0.03;
    const fby = headY + size * 0.13 + Math.sin(time * 2 + fb) * size * 0.015;
    const fbAlpha = (1 - fbPhase) * 0.2;
    ctx.fillStyle = `rgba(180,220,255,${fbAlpha})`;
    ctx.beginPath();
    ctx.arc(fbx, fby, size * 0.015 * (1 + fbPhase), 0, TAU);
    ctx.fill();
  }

  // Hunger/madness distortion aura
  const madnessAlpha = 0.04 + Math.sin(time * 5) * 0.025;
  ctx.strokeStyle = `rgba(120,0,180,${madnessAlpha})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  for (let ma = 0; ma < 24; ma++) {
    const maAngle = ma * (TAU / 24);
    const maDist = size * 0.42 + Math.sin(time * 4 + ma * 0.8) * size * 0.04;
    const mx = x + Math.cos(maAngle) * maDist;
    const my = y + Math.sin(maAngle) * maDist * 0.5 - size * 0.05;
    if (ma === 0) ctx.moveTo(mx, my);
    else ctx.lineTo(mx, my);
  }
  ctx.closePath();
  ctx.stroke();
}

// 17. MAMMOTH — Colossal armored war beast with howdah and archers
export function drawMammothEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 2.2;
  const walkPhase = time * 2;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.01;
  const trunkSway = Math.sin(time * 1.8) * size * 0.035;
  const charge = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 0.12 : 0;
  const stomp = isAttacking && attackPhase > 0.7 ? (attackPhase - 0.7) * 3.3 : 0;
  const breathe = 1 + Math.sin(time * 2) * 0.012;

  // --- Ground shaking ---
  if (stomp > 0) {
    ctx.strokeStyle = `rgba(180,160,120,${stomp * 0.35})`;
    ctx.lineWidth = 2.5 * zoom;
    for (let ring = 0; ring < 2; ring++) {
      const shakeR = size * (0.35 + ring * 0.2) * stomp;
      ctx.globalAlpha = (1 - ring * 0.5) * stomp * 0.3;
      ctx.beginPath();
      ctx.ellipse(x, y + size * 0.42, shakeR, shakeR * ISO_Y_RATIO, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // --- Dust clouds from footfalls ---
  const leftFoot = Math.max(0, -Math.sin(walkPhase));
  const rightFoot = Math.max(0, -Math.sin(walkPhase + Math.PI));
  for (const [intens, fx] of [[leftFoot, x - size * 0.16], [rightFoot, x + size * 0.16]] as [number, number][]) {
    if (intens > 0.6) {
      const dust = (intens - 0.6) * 2.5;
      for (let d = 0; d < 6; d++) {
        ctx.fillStyle = `rgba(150,135,105,${dust * 0.25 * (1 - d / 6)})`;
        ctx.beginPath();
        ctx.ellipse(
          fx + (d - 2.5) * size * 0.035 + Math.sin(time * 3 + d) * size * 0.01,
          y + size * 0.42 - d * size * 0.01,
          size * 0.018 * dust,
          size * 0.012 * dust * ISO_Y_RATIO, 0, 0, TAU,
        );
        ctx.fill();
      }
    }
  }

  // --- Shadow ---
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + charge * 0.15, y + size * 0.4, size * 0.38, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // --- Back legs (armored) ---
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + side * Math.PI * 0.5) * size * 0.035;
    const lx = x + side * size * 0.13 - size * 0.06;
    const ly = y + size * 0.1 + legSwing - bodyBob;
    // Fur base
    const legGrad = ctx.createLinearGradient(lx, ly, lx, ly + size * 0.32);
    legGrad.addColorStop(0, bodyColor);
    legGrad.addColorStop(0.6, bodyColorDark);
    legGrad.addColorStop(1, "#2a1a0a");
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.ellipse(lx, ly + size * 0.14, size * 0.075, size * 0.19, 0, 0, TAU);
    ctx.fill();
    // Metal greave
    const greaveGrad = ctx.createLinearGradient(lx - size * 0.05, ly + size * 0.2, lx + size * 0.05, ly + size * 0.2);
    greaveGrad.addColorStop(0, "#4a4040");
    greaveGrad.addColorStop(0.3, "#8a7a6a");
    greaveGrad.addColorStop(0.5, "#b0a090");
    greaveGrad.addColorStop(0.7, "#8a7a6a");
    greaveGrad.addColorStop(1, "#4a4040");
    ctx.fillStyle = greaveGrad;
    ctx.beginPath();
    ctx.ellipse(lx, ly + size * 0.22, size * 0.065, size * 0.1, 0, 0, TAU);
    ctx.fill();
    // Greave rivets
    ctx.fillStyle = "#c0b090";
    for (let r = 0; r < 2; r++) {
      ctx.beginPath();
      ctx.arc(lx + (r - 0.5) * size * 0.04, ly + size * 0.22, size * 0.006, 0, TAU);
      ctx.fill();
    }
    // Foot
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.ellipse(lx, ly + size * 0.32, size * 0.06, size * 0.028, 0, 0, TAU);
    ctx.fill();
  }

  // --- Massive body ---
  const bx = x + charge * 0.25;
  const by = y - size * 0.04 - bodyBob;
  const bodyGrad = ctx.createRadialGradient(bx, by - size * 0.05, size * 0.06, bx, by + size * 0.05, size * 0.42);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.25, bodyColor);
  bodyGrad.addColorStop(0.6, bodyColorDark);
  bodyGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(bx, by, size * 0.4 * breathe, size * 0.3, 0, 0, TAU);
  ctx.fill();

  // --- Hanging fur (visible below armor) ---
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  for (let f = 0; f < 24; f++) {
    const fAngle = -Math.PI * 0.25 + f * (Math.PI * 0.5 / 24);
    const fx2 = bx + Math.cos(fAngle) * size * 0.38;
    const fy = by + Math.sin(fAngle) * size * 0.22;
    const furLen = size * 0.06 + Math.sin(time * 1.5 + f * 0.7) * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(fx2, fy);
    ctx.quadraticCurveTo(fx2 + Math.sin(time * 2 + f) * size * 0.008, fy + furLen * 0.5, fx2, fy + furLen);
    ctx.stroke();
  }

  // --- Heavy barding (layered metal + leather) ---
  // Main plate
  for (const side of [-1, 1]) {
    const plateGrad = ctx.createLinearGradient(
      bx + side * size * 0.05, by - size * 0.15,
      bx + side * size * 0.32, by + size * 0.1,
    );
    plateGrad.addColorStop(0, "#6a5a48");
    plateGrad.addColorStop(0.2, "#8a7a68");
    plateGrad.addColorStop(0.5, "#a09080");
    plateGrad.addColorStop(0.8, "#7a6a58");
    plateGrad.addColorStop(1, "#5a4a38");
    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.moveTo(bx + side * size * 0.08, by - size * 0.2);
    ctx.quadraticCurveTo(bx + side * size * 0.35, by - size * 0.12, bx + side * size * 0.36, by + size * 0.05);
    ctx.quadraticCurveTo(bx + side * size * 0.32, by + size * 0.18, bx + side * size * 0.12, by + size * 0.2);
    ctx.quadraticCurveTo(bx + side * size * 0.06, by + size * 0.1, bx + side * size * 0.08, by - size * 0.2);
    ctx.fill();
    // Plate edge highlight
    ctx.strokeStyle = "rgba(200,180,150,0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(bx + side * size * 0.08, by - size * 0.2);
    ctx.quadraticCurveTo(bx + side * size * 0.35, by - size * 0.12, bx + side * size * 0.36, by + size * 0.05);
    ctx.stroke();
  }

  // Rivets along barding
  ctx.fillStyle = "#c0b090";
  for (const side of [-1, 1]) {
    for (let r = 0; r < 5; r++) {
      const ry = by - size * 0.15 + r * size * 0.07;
      ctx.beginPath();
      ctx.arc(bx + side * size * (0.28 + Math.sin(r) * 0.03), ry, size * 0.007, 0, TAU);
      ctx.fill();
    }
  }

  // Metal spikes along the spine
  for (let sp = 0; sp < 7; sp++) {
    const spx = bx - size * 0.2 + sp * size * 0.065;
    const spy = by - size * 0.28 - bodyBob;
    const spikeH = size * 0.035 + Math.sin(sp * 1.5) * size * 0.008;
    const spikeGrad = ctx.createLinearGradient(spx, spy, spx, spy - spikeH);
    spikeGrad.addColorStop(0, "#6a6060");
    spikeGrad.addColorStop(0.5, "#a09890");
    spikeGrad.addColorStop(1, "#d0c8c0");
    ctx.fillStyle = spikeGrad;
    ctx.beginPath();
    ctx.moveTo(spx - size * 0.008, spy);
    ctx.lineTo(spx, spy - spikeH);
    ctx.lineTo(spx + size * 0.008, spy);
    ctx.closePath();
    ctx.fill();
  }

  // Chain mail drape between plates
  ctx.strokeStyle = "rgba(150,140,130,0.3)";
  ctx.lineWidth = 0.6 * zoom;
  for (let ch = 0; ch < 12; ch++) {
    const chx = bx - size * 0.18 + ch * size * 0.03;
    const chy = by + size * 0.15;
    ctx.beginPath();
    ctx.arc(chx, chy + Math.sin(ch * 1.3) * size * 0.008, size * 0.008, 0, TAU);
    ctx.stroke();
  }

  // --- Front legs (armored) ---
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + Math.PI + side * Math.PI * 0.5) * size * 0.035;
    const lx = x + side * size * 0.15 + size * 0.06 + charge * 0.3;
    const ly = y + size * 0.08 + legSwing - bodyBob;
    // Fur
    const legGrad = ctx.createLinearGradient(lx, ly, lx, ly + size * 0.32);
    legGrad.addColorStop(0, bodyColorLight);
    legGrad.addColorStop(0.5, bodyColor);
    legGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.ellipse(lx, ly + size * 0.12, size * 0.08, size * 0.2, 0, 0, TAU);
    ctx.fill();
    // Metal greave (front legs get heavier armor)
    const greaveGrad = ctx.createLinearGradient(lx - size * 0.06, ly + size * 0.18, lx + size * 0.06, ly + size * 0.18);
    greaveGrad.addColorStop(0, "#4a4040");
    greaveGrad.addColorStop(0.3, "#9a8a7a");
    greaveGrad.addColorStop(0.5, "#c0b0a0");
    greaveGrad.addColorStop(0.7, "#9a8a7a");
    greaveGrad.addColorStop(1, "#4a4040");
    ctx.fillStyle = greaveGrad;
    ctx.beginPath();
    ctx.ellipse(lx, ly + size * 0.2, size * 0.07, size * 0.12, 0, 0, TAU);
    ctx.fill();
    // Spike on knee
    ctx.fillStyle = "#b0a090";
    ctx.beginPath();
    ctx.moveTo(lx, ly + size * 0.12);
    ctx.lineTo(lx + size * 0.025, ly + size * 0.08);
    ctx.lineTo(lx + size * 0.01, ly + size * 0.13);
    ctx.closePath();
    ctx.fill();
    // Rivets
    ctx.fillStyle = "#c0b090";
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.arc(lx + (r - 1) * size * 0.03, ly + size * 0.2, size * 0.005, 0, TAU);
      ctx.fill();
    }
    // Foot
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.ellipse(lx, ly + size * 0.31, size * 0.065, size * 0.03, 0, 0, TAU);
    ctx.fill();
  }

  // --- Howdah (war platform on the back) ---
  const hbx = bx;
  const hby = by - size * 0.28 - bodyBob;
  // Wooden platform base
  const platGrad = ctx.createLinearGradient(hbx - size * 0.18, hby, hbx + size * 0.18, hby);
  platGrad.addColorStop(0, "#5a3e20");
  platGrad.addColorStop(0.3, "#8a6a40");
  platGrad.addColorStop(0.5, "#9a7a50");
  platGrad.addColorStop(0.7, "#8a6a40");
  platGrad.addColorStop(1, "#5a3e20");
  ctx.fillStyle = platGrad;
  ctx.beginPath();
  ctx.moveTo(hbx - size * 0.18, hby + size * 0.02);
  ctx.lineTo(hbx - size * 0.16, hby - size * 0.02);
  ctx.lineTo(hbx + size * 0.16, hby - size * 0.02);
  ctx.lineTo(hbx + size * 0.18, hby + size * 0.02);
  ctx.closePath();
  ctx.fill();
  // Platform edge
  ctx.strokeStyle = "#3a2810";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(hbx - size * 0.18, hby + size * 0.02);
  ctx.lineTo(hbx + size * 0.18, hby + size * 0.02);
  ctx.stroke();
  // Wood grain
  ctx.strokeStyle = "rgba(60,40,20,0.2)";
  ctx.lineWidth = 0.5 * zoom;
  for (let g = 0; g < 4; g++) {
    const gx = hbx - size * 0.12 + g * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(gx, hby - size * 0.015);
    ctx.lineTo(gx, hby + size * 0.015);
    ctx.stroke();
  }

  // Railing / parapet walls
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#6a4a28";
    ctx.beginPath();
    ctx.rect(hbx + side * size * 0.15, hby - size * 0.08, size * 0.03 * side, size * 0.06);
    ctx.fill();
    // Shield emblem on railing
    ctx.fillStyle = "#8a6040";
    ctx.beginPath();
    ctx.arc(hbx + side * size * 0.16, hby - size * 0.05, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c0a070";
    ctx.beginPath();
    ctx.arc(hbx + side * size * 0.16, hby - size * 0.05, size * 0.007, 0, TAU);
    ctx.fill();
  }
  // Front and back rails
  ctx.fillStyle = "#6a4a28";
  ctx.beginPath();
  ctx.rect(hbx - size * 0.15, hby - size * 0.07, size * 0.3, size * 0.015);
  ctx.fill();

  // --- Archers in howdah ---
  const archerPhase = time * 2.5;
  for (let a = 0; a < 3; a++) {
    const ax = hbx + (a - 1) * size * 0.09;
    const ay = hby - size * 0.06;
    const drawPhase = Math.sin(archerPhase + a * 2.1) * size * 0.004;
    const aimAngle = Math.sin(time * 1.5 + a * 1.8) * 0.3 + (isAttacking ? -0.4 : 0);

    // Body (leather armor)
    const archerGrad = ctx.createLinearGradient(ax, ay, ax, ay - size * 0.06);
    archerGrad.addColorStop(0, "#5a4030");
    archerGrad.addColorStop(0.5, "#7a5a40");
    archerGrad.addColorStop(1, "#6a4a38");
    ctx.fillStyle = archerGrad;
    ctx.beginPath();
    ctx.ellipse(ax, ay - size * 0.02 + drawPhase, size * 0.018, size * 0.03, 0, 0, TAU);
    ctx.fill();

    // Head
    ctx.fillStyle = "#d4a880";
    ctx.beginPath();
    ctx.arc(ax, ay - size * 0.055 + drawPhase, size * 0.012, 0, TAU);
    ctx.fill();
    // Helmet
    ctx.fillStyle = "#6a6060";
    ctx.beginPath();
    ctx.arc(ax, ay - size * 0.06 + drawPhase, size * 0.013, -Math.PI, 0);
    ctx.fill();

    // Bow
    ctx.save();
    ctx.translate(ax + size * 0.015, ay - size * 0.035 + drawPhase);
    ctx.rotate(aimAngle);
    ctx.strokeStyle = "#5a3a18";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.025, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = "rgba(200,180,150,0.6)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(-Math.PI * 0.4) * size * 0.025, Math.sin(-Math.PI * 0.4) * size * 0.025);
    ctx.lineTo(Math.cos(Math.PI * 0.4) * size * 0.025, Math.sin(Math.PI * 0.4) * size * 0.025);
    ctx.stroke();

    // Arrow (drawn back when attacking)
    if (isAttacking) {
      const pullBack = attackPhase * size * 0.02;
      ctx.strokeStyle = "#5a3a18";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(-pullBack, 0);
      ctx.lineTo(size * 0.03, 0);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = "#a0a0a0";
      ctx.beginPath();
      ctx.moveTo(size * 0.03, 0);
      ctx.lineTo(size * 0.025, -size * 0.005);
      ctx.lineTo(size * 0.038, 0);
      ctx.lineTo(size * 0.025, size * 0.005);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // --- War banner ---
  const bannerX = hbx - size * 0.12;
  const bannerY = hby - size * 0.07;
  // Pole
  ctx.strokeStyle = "#5a3a18";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(bannerX, bannerY);
  ctx.lineTo(bannerX, bannerY - size * 0.1);
  ctx.stroke();
  // Banner cloth
  const bannerWave = Math.sin(time * 3) * size * 0.015;
  ctx.fillStyle = "#8a1a1a";
  ctx.beginPath();
  ctx.moveTo(bannerX, bannerY - size * 0.1);
  ctx.quadraticCurveTo(bannerX + size * 0.03 + bannerWave, bannerY - size * 0.09, bannerX + size * 0.06, bannerY - size * 0.095 + bannerWave * 0.5);
  ctx.lineTo(bannerX + size * 0.06, bannerY - size * 0.065 + bannerWave * 0.5);
  ctx.quadraticCurveTo(bannerX + size * 0.03 + bannerWave * 0.5, bannerY - size * 0.06, bannerX, bannerY - size * 0.07);
  ctx.closePath();
  ctx.fill();
  // Banner emblem (small circle)
  ctx.fillStyle = "#d4a030";
  ctx.beginPath();
  ctx.arc(bannerX + size * 0.03 + bannerWave * 0.3, bannerY - size * 0.08, size * 0.008, 0, TAU);
  ctx.fill();

  // --- Head (armored war helm) ---
  const headX = x + size * 0.24 + charge;
  const headY = y - size * 0.2 - bodyBob;

  // Base head shape
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.14);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.15, size * 0.12, 0.05, 0, TAU);
  ctx.fill();

  // War helm (metal face plate)
  const helmGrad = ctx.createLinearGradient(headX - size * 0.1, headY - size * 0.1, headX + size * 0.12, headY + size * 0.05);
  helmGrad.addColorStop(0, "#5a5050");
  helmGrad.addColorStop(0.3, "#9a8a7a");
  helmGrad.addColorStop(0.5, "#b0a090");
  helmGrad.addColorStop(0.7, "#8a7a6a");
  helmGrad.addColorStop(1, "#5a5050");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.02, headY - size * 0.03, size * 0.12, size * 0.08, 0.1, -Math.PI * 0.1, Math.PI * 0.9);
  ctx.fill();
  // Helm ridge
  ctx.strokeStyle = "#706050";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY - size * 0.08);
  ctx.quadraticCurveTo(headX + size * 0.02, headY - size * 0.11, headX + size * 0.1, headY - size * 0.07);
  ctx.stroke();

  // Head fur tufts (visible below helm)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let hf = 0; hf < 8; hf++) {
    const hfAngle = Math.PI * 0.2 + hf * 0.25;
    ctx.beginPath();
    ctx.moveTo(headX + Math.cos(hfAngle) * size * 0.13, headY + Math.sin(hfAngle) * size * 0.1);
    ctx.lineTo(headX + Math.cos(hfAngle) * size * 0.17, headY + Math.sin(hfAngle) * size * 0.13);
    ctx.stroke();
  }

  // Eyes (small, fierce, visible through helm slits)
  for (const side of [-1, 1]) {
    const ey = headY - size * 0.015 + side * size * 0.035;
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.08, ey, size * 0.012, size * 0.008, 0, 0, TAU);
    ctx.fill();
    // Angry red glow
    setShadowBlur(ctx, 3 * zoom, "#ff4400");
    ctx.fillStyle = "rgba(200,80,30,0.6)";
    ctx.beginPath();
    ctx.ellipse(headX + size * 0.08, ey, size * 0.008, size * 0.005, 0, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Ears (visible on sides of helm)
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(headX, headY + side * size * 0.085, size * 0.035, size * 0.065, side * 0.3, 0, TAU);
    ctx.fill();
  }

  // --- Trunk (armored segments) ---
  ctx.lineCap = "round";
  const trunkSegs = 5;
  let prevTX = headX + size * 0.12;
  let prevTY = headY + size * 0.05;
  for (let t = 0; t < trunkSegs; t++) {
    const tFrac = (t + 1) / trunkSegs;
    const tWave = Math.sin(time * 2.5 + t * 0.8) * size * 0.015 * tFrac;
    const tx = headX + size * 0.12 + tFrac * size * 0.06 + trunkSway * tFrac;
    const ty = headY + size * 0.05 + tFrac * size * 0.28 + tWave;
    const thickness = size * (0.04 - tFrac * 0.015);
    ctx.strokeStyle = t % 2 === 0 ? bodyColor : bodyColorDark;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(prevTX, prevTY);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    prevTX = tx;
    prevTY = ty;
  }
  ctx.lineCap = "butt";

  // --- Iron-tipped tusks ---
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    // Ivory base
    ctx.strokeStyle = "#f0e8d0";
    ctx.lineWidth = 5 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.1, headY + size * 0.02 + side * size * 0.045);
    ctx.quadraticCurveTo(
      headX + size * 0.28 + charge * 0.5,
      headY + size * 0.07 + side * size * 0.07,
      headX + size * 0.24 + charge * 0.3,
      headY + size * 0.14 + side * size * 0.015,
    );
    ctx.stroke();
    // Iron tip
    setShadowBlur(ctx, 2 * zoom, "rgba(180,180,180,0.5)");
    ctx.strokeStyle = "#a0a0a0";
    ctx.lineWidth = 4 * zoom;
    const tipStart = 0.7;
    const tsMidX = headX + size * 0.28 + charge * 0.5;
    const tsMidY = headY + size * 0.07 + side * size * 0.07;
    const tsEndX = headX + size * 0.24 + charge * 0.3;
    const tsEndY = headY + size * 0.14 + side * size * 0.015;
    const tipSX = headX + size * 0.1 + (tsMidX - headX - size * 0.1) * tipStart;
    const tipSY = headY + size * 0.02 + side * size * 0.045 + (tsMidY - headY - size * 0.02 - side * size * 0.045) * tipStart;
    ctx.beginPath();
    ctx.moveTo(tipSX, tipSY);
    ctx.quadraticCurveTo(tsMidX, tsMidY, tsEndX, tsEndY);
    ctx.stroke();
    clearShadow(ctx);
  }
  ctx.lineCap = "butt";

  // --- Arrow volley effect (when attacking) ---
  if (isAttacking && attackPhase > 0.3) {
    const volleyPhase = (attackPhase - 0.3) / 0.7;
    for (let a = 0; a < 3; a++) {
      const aProgress = Math.min(1, volleyPhase * 1.5 + a * 0.15);
      if (aProgress <= 0) continue;
      const startX = hbx + (a - 1) * size * 0.08;
      const startY = hby - size * 0.08;
      const endX = startX + size * 0.5 * aProgress;
      const endY = startY + size * 0.15 * aProgress - Math.sin(aProgress * Math.PI) * size * 0.12;
      ctx.strokeStyle = `rgba(90,60,25,${(1 - aProgress) * 0.7})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        startX + (endX - startX) * 0.9,
        startY + (endY - startY) * 0.9 - Math.sin(aProgress * Math.PI * 0.9) * size * 0.1,
      );
      ctx.lineTo(endX, endY);
      ctx.stroke();
      // Arrowhead
      if (aProgress < 0.9) {
        ctx.fillStyle = `rgba(160,160,160,${(1 - aProgress) * 0.8})`;
        ctx.beginPath();
        ctx.arc(endX, endY, size * 0.005, 0, TAU);
        ctx.fill();
      }
    }
  }
}

// ============================================================================
// VOLCANIC REGION
// ============================================================================

// 18. LAVA GOLEM — Massive obsidian/lava rock creature with cracked shell and molten core
export function drawLavaGolemEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.5;
  const walkPhase = time * 2;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.01;
  const lavaGlow = 0.5 + Math.sin(time * 3) * 0.3;
  const lavaPulse = 0.5 + Math.sin(time * 2.5) * 0.3;
  const groundErupt = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const coreFlicker = 0.6 + Math.sin(time * 7) * 0.2 + Math.sin(time * 11) * 0.1;

  // Multi-layered heat shimmer aura
  drawRadialAura(ctx, x, y, size * 0.85, [
    { offset: 0, color: `rgba(255,180,80,${lavaGlow * 0.14})` },
    { offset: 0.25, color: `rgba(255,120,30,${lavaGlow * 0.1})` },
    { offset: 0.5, color: `rgba(255,60,0,${lavaGlow * 0.06})` },
    { offset: 0.75, color: `rgba(200,40,0,${lavaGlow * 0.03})` },
    { offset: 1, color: "rgba(150,20,0,0)" },
  ]);

  // Shimmer distortion wave rings
  ctx.strokeStyle = `rgba(255,120,50,${0.04 + lavaGlow * 0.02})`;
  ctx.lineWidth = 0.5 * zoom;
  for (let sw = 0; sw < 5; sw++) {
    const swPhase = (time * 0.5 + sw * 0.2) % 1;
    const swRadius = size * (0.3 + swPhase * 0.4);
    const swAlpha = (1 - swPhase) * 0.08;
    ctx.strokeStyle = `rgba(255,120,50,${swAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.1, swRadius, swRadius * 0.3 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  // Lava pool beneath with flowing magma
  const poolGrad = ctx.createRadialGradient(x, y + size * 0.4, 0, x, y + size * 0.4, size * 0.42);
  poolGrad.addColorStop(0, `rgba(255,200,80,${lavaGlow * 0.5})`);
  poolGrad.addColorStop(0.3, `rgba(255,140,30,${lavaGlow * 0.35})`);
  poolGrad.addColorStop(0.6, `rgba(255,80,10,${lavaGlow * 0.2})`);
  poolGrad.addColorStop(1, "rgba(180,40,0,0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.4, size * 0.42, size * 0.13 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Pool surface ripples
  ctx.lineWidth = 0.8 * zoom;
  for (let pr = 0; pr < 3; pr++) {
    const prPhase = (time * 0.7 + pr * 0.33) % 1;
    const prAlpha = (1 - prPhase) * 0.25;
    ctx.strokeStyle = `rgba(255,220,100,${prAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.4, size * (0.05 + prPhase * 0.32), size * (0.015 + prPhase * 0.08) * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  // Lava pool footprints behind creature
  for (const side of [-1, 1]) {
    const fpAlpha = 0.15 + lavaPulse * 0.1;
    const fpGrad = ctx.createRadialGradient(
      x + side * size * 0.12 - size * 0.05, y + size * 0.43, 0,
      x + side * size * 0.12 - size * 0.05, y + size * 0.43, size * 0.06
    );
    fpGrad.addColorStop(0, `rgba(255,150,30,${fpAlpha})`);
    fpGrad.addColorStop(0.7, `rgba(255,80,0,${fpAlpha * 0.4})`);
    fpGrad.addColorStop(1, "rgba(200,40,0,0)");
    ctx.fillStyle = fpGrad;
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.12 - size * 0.05, y + size * 0.43, size * 0.06, size * 0.02 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.fill();
  }

  // Dense ember particle field rising
  for (let e = 0; e < 18; e++) {
    const ePhase = (time * 0.6 + e * 0.056) % 1;
    const eSpread = Math.sin(time * 1.5 + e * 2.3) * size * 0.28;
    const ex = x + eSpread;
    const ey = y + size * 0.2 - ePhase * size * 0.9;
    const eAlpha = Math.sin(ePhase * Math.PI) * 0.7;
    const eSize = size * 0.01 * (1 - ePhase * 0.6) * (0.6 + Math.sin(e * 3.7) * 0.4);
    const eGreen = Math.floor(220 - ePhase * 180);
    setShadowBlur(ctx, 3 * zoom, "#ff6600");
    ctx.fillStyle = `rgba(255,${eGreen},0,${eAlpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Magma dripping from joints with gradient drops
  for (let d = 0; d < 8; d++) {
    const dPhase = (time * 1.2 + d * 0.125) % 1;
    const dAngle = d * 0.785;
    const dx = x + Math.cos(dAngle) * size * 0.15;
    const dy = y + size * 0.05 + dPhase * size * 0.3;
    const dAlpha = (1 - dPhase) * 0.6;
    const dropGrad = ctx.createLinearGradient(dx, dy - size * 0.01, dx, dy + size * 0.02);
    dropGrad.addColorStop(0, `rgba(255,200,60,${dAlpha})`);
    dropGrad.addColorStop(0.5, `rgba(255,120,20,${dAlpha * 0.7})`);
    dropGrad.addColorStop(1, `rgba(200,60,0,${dAlpha * 0.3})`);
    ctx.fillStyle = dropGrad;
    ctx.beginPath();
    ctx.ellipse(dx, dy, size * 0.008, size * 0.02 * (1 - dPhase * 0.5), 0, 0, TAU);
    ctx.fill();
  }

  // Ground eruption attack with gradient pillars and ring
  if (isAttacking) {
    for (let ge = 0; ge < 8; ge++) {
      const geAngle = ge * (TAU / 8) + time * 0.5;
      const geDist = groundErupt * size * 0.5;
      const geHeight = size * 0.12 * groundErupt * (0.6 + Math.sin(ge * 2.1) * 0.4);
      const gx = x + Math.cos(geAngle) * geDist;
      const gy = y + size * 0.42 + Math.sin(geAngle) * geDist * 0.2;
      const geGrad = ctx.createLinearGradient(gx, gy, gx, gy - geHeight);
      geGrad.addColorStop(0, `rgba(255,120,0,${groundErupt * 0.6})`);
      geGrad.addColorStop(0.4, `rgba(255,200,50,${groundErupt * 0.4})`);
      geGrad.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = geGrad;
      ctx.beginPath();
      ctx.moveTo(gx - size * 0.025, gy);
      ctx.lineTo(gx - size * 0.005, gy - geHeight);
      ctx.lineTo(gx + size * 0.005, gy - geHeight * 0.85);
      ctx.lineTo(gx + size * 0.02, gy);
      ctx.fill();
    }
    setShadowBlur(ctx, 6 * zoom, "#ff6600");
    ctx.strokeStyle = `rgba(255,150,30,${groundErupt * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.42, size * 0.45 * groundErupt, size * 0.12 * groundErupt * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    clearShadow(ctx);
  }

  // Legs — massive obsidian columns with rock plates and lava joints
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + side * Math.PI * 0.5) * size * 0.03;

    // Upper leg angular rock plate
    const legGrad = ctx.createLinearGradient(
      x + side * size * 0.13, y + size * 0.1,
      x + side * size * 0.13, y + size * 0.42
    );
    legGrad.addColorStop(0, "#3a2a18");
    legGrad.addColorStop(0.2, "#2a1a0a");
    legGrad.addColorStop(0.5, "#1a0c02");
    legGrad.addColorStop(0.8, "#0f0700");
    legGrad.addColorStop(1, "#080400");
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y + size * 0.12 - bodyBob);
    ctx.lineTo(x + side * size * 0.18, y + size * 0.14 - bodyBob);
    ctx.lineTo(x + side * size * 0.19, y + size * 0.32 + legSwing - bodyBob);
    ctx.lineTo(x + side * size * 0.05, y + size * 0.34 + legSwing - bodyBob);
    ctx.closePath();
    ctx.fill();

    // Rock texture lines on legs
    ctx.strokeStyle = "rgba(60,40,20,0.4)";
    ctx.lineWidth = 0.8 * zoom;
    for (let lt = 0; lt < 3; lt++) {
      const lty = y + size * (0.16 + lt * 0.06) + legSwing * (lt / 3) - bodyBob;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.07, lty);
      ctx.lineTo(x + side * size * 0.17, lty + size * 0.01);
      ctx.stroke();
    }

    // Pulsing lava veins on legs
    setShadowBlur(ctx, 3 * zoom, `rgba(255,100,0,${lavaPulse})`);
    ctx.strokeStyle = `rgba(255,${Math.floor(140 + lavaPulse * 60)},40,${lavaPulse * 0.7})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.12, y + size * 0.13 - bodyBob);
    ctx.quadraticCurveTo(
      x + side * size * 0.15, y + size * 0.22 + legSwing * 0.5 - bodyBob,
      x + side * size * 0.12, y + size * 0.33 + legSwing - bodyBob
    );
    ctx.stroke();
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.13, y + size * 0.2 - bodyBob);
    ctx.lineTo(x + side * size * 0.17, y + size * 0.24 + legSwing * 0.3 - bodyBob);
    ctx.stroke();
    clearShadow(ctx);

    // Knee joint lava glow
    const kneeY = y + size * 0.25 + legSwing * 0.5 - bodyBob;
    ctx.fillStyle = `rgba(255,160,40,${lavaPulse * 0.35})`;
    ctx.beginPath();
    ctx.arc(x + side * size * 0.12, kneeY, size * 0.025, 0, TAU);
    ctx.fill();

    // Heavy angular obsidian foot
    const footY = y + size * 0.38 + legSwing - bodyBob;
    ctx.fillStyle = "#120800";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, footY);
    ctx.lineTo(x + side * size * 0.2, footY);
    ctx.lineTo(x + side * size * 0.19, footY + size * 0.04);
    ctx.lineTo(x + side * size * 0.05, footY + size * 0.04);
    ctx.closePath();
    ctx.fill();

    // Foot lava crack
    ctx.strokeStyle = `rgba(255,120,20,${lavaPulse * 0.4})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.08, footY + size * 0.005);
    ctx.lineTo(x + side * size * 0.15, footY + size * 0.035);
    ctx.stroke();
  }

  // Main body — massive obsidian torso
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.08, size * 0.04, x, y + size * 0.06, size * 0.38);
  bodyGrad.addColorStop(0, "#4a3520");
  bodyGrad.addColorStop(0.2, "#3a2515");
  bodyGrad.addColorStop(0.5, "#2a180a");
  bodyGrad.addColorStop(0.8, "#1a0c04");
  bodyGrad.addColorStop(1, "#0a0500");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.02 - bodyBob, size * 0.32, size * 0.3, 0, 0, TAU);
  ctx.fill();

  // Rock plate outlines on torso
  ctx.strokeStyle = "rgba(80,55,30,0.3)";
  ctx.lineWidth = 1 * zoom;
  const platePaths: [number, number][][] = [
    [[-0.2, -0.15], [-0.08, -0.2], [0.05, -0.18], [0.02, -0.08], [-0.15, -0.06]],
    [[0.05, -0.2], [0.2, -0.15], [0.22, -0.02], [0.1, 0.02], [0.03, -0.08]],
    [[-0.22, -0.02], [-0.1, 0.02], [-0.05, 0.15], [-0.18, 0.18], [-0.25, 0.08]],
    [[0.05, 0.02], [0.2, 0.0], [0.25, 0.1], [0.15, 0.18], [0.02, 0.14]],
    [[-0.1, -0.06], [0.03, -0.08], [0.05, 0.02], [-0.05, 0.08], [-0.12, 0.02]],
  ];
  for (const plate of platePaths) {
    ctx.beginPath();
    ctx.moveTo(x + plate[0][0] * size, y + plate[0][1] * size - bodyBob);
    for (let p = 1; p < plate.length; p++) {
      ctx.lineTo(x + plate[p][0] * size, y + plate[p][1] * size - bodyBob);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Molten core visible through large central crack
  const coreGrad = ctx.createRadialGradient(x, y - size * 0.04 - bodyBob, 0, x, y - size * 0.04 - bodyBob, size * 0.12);
  coreGrad.addColorStop(0, `rgba(255,255,200,${coreFlicker * 0.5})`);
  coreGrad.addColorStop(0.3, `rgba(255,200,80,${coreFlicker * 0.4})`);
  coreGrad.addColorStop(0.6, `rgba(255,120,20,${coreFlicker * 0.25})`);
  coreGrad.addColorStop(1, "rgba(200,60,0,0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.1 - bodyBob);
  ctx.quadraticCurveTo(x - size * 0.02, y - size * 0.04 - bodyBob, x - size * 0.04, y + size * 0.05 - bodyBob);
  ctx.quadraticCurveTo(x + size * 0.01, y + size * 0.02 - bodyBob, x + size * 0.05, y + size * 0.06 - bodyBob);
  ctx.quadraticCurveTo(x + size * 0.03, y - size * 0.02 - bodyBob, x + size * 0.04, y - size * 0.08 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Extensive lava vein network across body
  setShadowBlur(ctx, 5 * zoom, `rgba(255,120,0,${lavaGlow})`);
  ctx.lineWidth = 2.2 * zoom;
  const crackPaths: [number, number][][] = [
    [[-0.18, -0.18], [-0.1, -0.12], [0, -0.06], [0.08, -0.14], [0.14, -0.1]],
    [[-0.12, 0.0], [-0.05, 0.06], [0.04, 0.12], [0.12, 0.08], [0.18, 0.04]],
    [[0, -0.24], [-0.04, -0.14], [-0.02, -0.04], [0.06, 0.04], [0.04, 0.12]],
    [[-0.24, -0.04], [-0.16, 0.04], [-0.08, 0.1], [-0.02, 0.16]],
    [[0.08, -0.18], [0.14, -0.06], [0.2, 0.02], [0.16, 0.1]],
    [[-0.06, -0.08], [0.02, -0.02], [0.1, 0.04]],
    [[-0.16, 0.1], [-0.08, 0.14], [0.02, 0.16], [0.1, 0.14]],
  ];
  for (const path of crackPaths) {
    const pathGlow = lavaGlow * (0.6 + Math.sin(time * 3 + path[0][0] * 10) * 0.3);
    ctx.strokeStyle = `rgba(255,${Math.floor(140 + pathGlow * 60)},40,${pathGlow * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(x + path[0][0] * size, y + path[0][1] * size - bodyBob);
    for (let p = 1; p < path.length; p++) {
      ctx.lineTo(x + path[p][0] * size, y + path[p][1] * size - bodyBob);
    }
    ctx.stroke();
  }

  // Pulsing glow nodes at all crack intersections
  for (const path of crackPaths) {
    for (let n = 1; n < path.length - 1; n++) {
      const nodeGlow = lavaGlow * (0.5 + Math.sin(time * 4 + n * 2) * 0.3);
      ctx.fillStyle = `rgba(255,220,80,${nodeGlow * 0.7})`;
      ctx.beginPath();
      ctx.arc(x + path[n][0] * size, y + path[n][1] * size - bodyBob, size * 0.014, 0, TAU);
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // Obsidian spikes on shoulders and back
  const spikeDefs = [
    { sx: -0.22, sy: -0.12, h: 0.08, angle: -0.3 },
    { sx: -0.18, sy: -0.18, h: 0.1, angle: -0.2 },
    { sx: 0.22, sy: -0.12, h: 0.08, angle: 0.3 },
    { sx: 0.18, sy: -0.18, h: 0.1, angle: 0.2 },
    { sx: -0.05, sy: -0.25, h: 0.06, angle: -0.1 },
    { sx: 0.05, sy: -0.25, h: 0.06, angle: 0.1 },
    { sx: 0, sy: -0.22, h: 0.07, angle: 0 },
  ];
  for (const spike of spikeDefs) {
    const spikeGrad = ctx.createLinearGradient(
      x + spike.sx * size, y + spike.sy * size - bodyBob,
      x + (spike.sx + Math.sin(spike.angle) * spike.h) * size, y + (spike.sy - spike.h) * size - bodyBob
    );
    spikeGrad.addColorStop(0, "#2a1a0a");
    spikeGrad.addColorStop(0.6, "#1a0c04");
    spikeGrad.addColorStop(1, "#3a2a18");
    ctx.fillStyle = spikeGrad;
    ctx.beginPath();
    ctx.moveTo(x + spike.sx * size - size * 0.015, y + spike.sy * size - bodyBob);
    ctx.lineTo(x + (spike.sx + Math.sin(spike.angle) * spike.h) * size, y + (spike.sy - spike.h) * size - bodyBob);
    ctx.lineTo(x + spike.sx * size + size * 0.015, y + spike.sy * size - bodyBob);
    ctx.closePath();
    ctx.fill();
  }

  // Steam vents on shoulders with rising plumes
  for (const side of [-1, 1]) {
    const ventX = x + side * size * 0.24;
    const ventY = y - size * 0.14 - bodyBob;
    ctx.fillStyle = `rgba(255,120,30,${lavaPulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(ventX, ventY, size * 0.018, 0, TAU);
    ctx.fill();
    for (let sv = 0; sv < 5; sv++) {
      const svPhase = (time * 1.5 + sv * 0.2 + side * 0.5) % 1;
      const svx = ventX + Math.sin(time * 3 + sv * 1.5) * size * 0.02 * svPhase;
      const svy = ventY - svPhase * size * 0.2;
      const svAlpha = (1 - svPhase) * 0.2;
      ctx.fillStyle = `rgba(180,180,180,${svAlpha})`;
      ctx.beginPath();
      ctx.arc(svx, svy, size * (0.01 + svPhase * 0.015), 0, TAU);
      ctx.fill();
    }
  }

  // Arms — massive obsidian with molten joints and knuckles
  for (const side of [-1, 1]) {
    const armSwing = Math.sin(walkPhase + side * 2) * 0.2;
    const attackReach = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.15 * (side === 1 ? 1 : 0.5) : 0;
    ctx.save();
    ctx.translate(x + side * size * 0.27, y - size * 0.1 - bodyBob);
    ctx.rotate(side * (0.3 + armSwing + attackReach));

    // Upper arm angular shape
    const armGrad = ctx.createLinearGradient(0, 0, 0, size * 0.28);
    armGrad.addColorStop(0, "#3a2515");
    armGrad.addColorStop(0.3, "#2a180a");
    armGrad.addColorStop(0.7, "#1a0c04");
    armGrad.addColorStop(1, "#120800");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, 0);
    ctx.lineTo(size * 0.05, -size * 0.01);
    ctx.lineTo(size * 0.06, size * 0.18);
    ctx.lineTo(-size * 0.04, size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Arm rock texture lines
    ctx.strokeStyle = "rgba(60,40,20,0.3)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, size * 0.06);
    ctx.lineTo(size * 0.05, size * 0.07);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, size * 0.13);
    ctx.lineTo(size * 0.055, size * 0.14);
    ctx.stroke();

    // Lava vein on arm
    setShadowBlur(ctx, 3 * zoom, `rgba(255,100,0,${lavaPulse})`);
    ctx.strokeStyle = `rgba(255,150,40,${lavaPulse * 0.6})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.01, size * 0.02);
    ctx.quadraticCurveTo(size * 0.03, size * 0.12, 0, size * 0.22);
    ctx.stroke();
    clearShadow(ctx);

    // Elbow joint lava glow
    ctx.fillStyle = `rgba(255,160,40,${lavaPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(0, size * 0.19, size * 0.02, 0, TAU);
    ctx.fill();

    // Massive fist
    const fistGrad = ctx.createRadialGradient(0, size * 0.3, 0, 0, size * 0.3, size * 0.065);
    fistGrad.addColorStop(0, "#2a1a0a");
    fistGrad.addColorStop(0.6, "#1a0c04");
    fistGrad.addColorStop(1, "#0a0500");
    ctx.fillStyle = fistGrad;
    ctx.beginPath();
    ctx.arc(0, size * 0.3, size * 0.065, 0, TAU);
    ctx.fill();

    // Molten knuckle ridges
    setShadowBlur(ctx, 3 * zoom, "#ff6600");
    for (let k = -1; k <= 1; k++) {
      ctx.fillStyle = `rgba(255,${Math.floor(160 + lavaPulse * 40)},30,${lavaPulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(k * size * 0.02, size * 0.26, size * 0.012, 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);

    ctx.restore();
  }

  // Head — angular obsidian block
  const headY = y - size * 0.3 - bodyBob;
  const headGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.12);
  headGrad.addColorStop(0, "#3a2818");
  headGrad.addColorStop(0.4, "#2a1a0a");
  headGrad.addColorStop(0.8, "#1a0c04");
  headGrad.addColorStop(1, "#0a0500");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, headY + size * 0.04);
  ctx.lineTo(x - size * 0.08, headY - size * 0.06);
  ctx.lineTo(x - size * 0.02, headY - size * 0.09);
  ctx.lineTo(x + size * 0.02, headY - size * 0.09);
  ctx.lineTo(x + size * 0.08, headY - size * 0.06);
  ctx.lineTo(x + size * 0.1, headY + size * 0.04);
  ctx.lineTo(x + size * 0.06, headY + size * 0.07);
  ctx.lineTo(x - size * 0.06, headY + size * 0.07);
  ctx.closePath();
  ctx.fill();

  // Head rock plate line
  ctx.strokeStyle = "rgba(60,40,20,0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, headY - size * 0.03);
  ctx.lineTo(x + size * 0.06, headY - size * 0.03);
  ctx.stroke();

  // Branching forehead lava cracks
  setShadowBlur(ctx, 4 * zoom, `rgba(255,120,0,${lavaGlow})`);
  ctx.strokeStyle = `rgba(255,160,50,${lavaGlow * 0.8})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.08);
  ctx.lineTo(x - size * 0.02, headY - size * 0.03);
  ctx.lineTo(x + size * 0.01, headY + size * 0.02);
  ctx.stroke();
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, headY - size * 0.03);
  ctx.lineTo(x - size * 0.06, headY - size * 0.01);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, headY - size * 0.03);
  ctx.lineTo(x + size * 0.04, headY - size * 0.05);
  ctx.stroke();
  clearShadow(ctx);

  // Intense glowing lava eyes
  setShadowBlur(ctx, 8 * zoom, "#ff4400");
  for (const side of [-1, 1]) {
    const eyeX = x + side * size * 0.045;
    const eyeY = headY - size * 0.01;
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.022);
    eyeGrad.addColorStop(0, `rgba(255,255,200,${coreFlicker})`);
    eyeGrad.addColorStop(0.4, `rgba(255,180,50,${coreFlicker * 0.8})`);
    eyeGrad.addColorStop(1, `rgba(255,80,0,${coreFlicker * 0.3})`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.022, size * 0.014, 0, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Jaw/mouth lava glow
  ctx.fillStyle = `rgba(255,140,30,${lavaGlow * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.05, size * 0.04, size * 0.01, 0, 0, TAU);
  ctx.fill();
}

// 19. VOLCANIC DRAKE — Fearsome fire drake with scaled body and flame breath
export function drawVolcanicDrakeEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.4;
  const walkPhase = time * 4;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const wingFlap = Math.sin(time * 3) * 0.3;
  const fireBreath = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const internalFire = 0.4 + Math.sin(time * 3.5) * 0.2;
  const breathPulse = 0.3 + Math.sin(time * 4) * 0.2;

  // Multi-layered heat aura
  drawRadialAura(ctx, x, y, size * 0.65, [
    { offset: 0, color: `rgba(255,130,30,${0.1 + fireBreath * 0.12})` },
    { offset: 0.3, color: `rgba(255,80,0,${0.06 + fireBreath * 0.06})` },
    { offset: 0.6, color: "rgba(200,50,0,0.03)" },
    { offset: 1, color: "rgba(150,30,0,0)" },
  ]);

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.34, size * 0.28, size * 0.07 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Smoke trail behind
  for (let sm = 0; sm < 6; sm++) {
    const smPhase = (time * 0.8 + sm * 0.16) % 1;
    const smx = x - size * 0.15 - smPhase * size * 0.25 + Math.sin(time * 2 + sm) * size * 0.02;
    const smy = y + size * 0.05 - smPhase * size * 0.15;
    const smAlpha = (1 - smPhase) * 0.12;
    ctx.fillStyle = `rgba(80,60,50,${smAlpha})`;
    ctx.beginPath();
    ctx.arc(smx, smy, size * (0.01 + smPhase * 0.02), 0, TAU);
    ctx.fill();
  }

  // Tail with tapering segments and flame tip
  const tailSegments = 12;
  let prevTailX = x - size * 0.2;
  let prevTailY = y + size * 0.1 - bodyBob;
  ctx.lineCap = "round";
  for (let t = 0; t < tailSegments; t++) {
    const tFrac = (t + 1) / tailSegments;
    const tailWave = Math.sin(time * 3 + t * 0.7) * size * 0.035 * tFrac;
    const tx = x - size * 0.2 - tFrac * size * 0.35;
    const ty = y + size * 0.05 - bodyBob + tailWave;
    const segWidth = size * 0.045 * (1 - tFrac * 0.7);

    if (t < tailSegments - 3) {
      const tailGrad = ctx.createLinearGradient(prevTailX, prevTailY - segWidth, prevTailX, prevTailY + segWidth);
      tailGrad.addColorStop(0, bodyColorDark);
      tailGrad.addColorStop(0.5, bodyColor);
      tailGrad.addColorStop(1, bodyColorDark);
      ctx.strokeStyle = tailGrad;
    } else {
      const flameI = (t - (tailSegments - 3)) / 3;
      ctx.strokeStyle = `rgba(255,${Math.floor(150 - flameI * 80)},${Math.floor(30 - flameI * 30)},${0.6 + Math.sin(time * 6 + t) * 0.2})`;
    }
    ctx.lineWidth = segWidth;
    ctx.beginPath();
    ctx.moveTo(prevTailX, prevTailY);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    // Scale marks on tail
    if (t < tailSegments - 3 && t % 2 === 0) {
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5 * zoom;
      const midX = (prevTailX + tx) * 0.5;
      const midY = (prevTailY + ty) * 0.5;
      ctx.beginPath();
      ctx.moveTo(midX - size * 0.01, midY - segWidth * 0.4);
      ctx.lineTo(midX + size * 0.01, midY + segWidth * 0.4);
      ctx.stroke();
    }

    prevTailX = tx;
    prevTailY = ty;
  }
  ctx.lineCap = "butt";

  // Flame orb at tail tip
  setShadowBlur(ctx, 6 * zoom, "#ff4400");
  const tailFlameSize = size * 0.03 + Math.sin(time * 8) * size * 0.01;
  const tfGrad = ctx.createRadialGradient(prevTailX, prevTailY, 0, prevTailX, prevTailY, tailFlameSize);
  tfGrad.addColorStop(0, `rgba(255,255,200,${0.8 + Math.sin(time * 9) * 0.15})`);
  tfGrad.addColorStop(0.4, `rgba(255,150,0,0.6)`);
  tfGrad.addColorStop(1, "rgba(255,60,0,0)");
  ctx.fillStyle = tfGrad;
  ctx.beginPath();
  ctx.arc(prevTailX, prevTailY, tailFlameSize, 0, TAU);
  ctx.fill();
  // Flame wisps around tail tip
  for (let tw = 0; tw < 4; tw++) {
    const twAngle = time * 5 + tw * (TAU / 4);
    const twDist = tailFlameSize * (1 + Math.sin(time * 7 + tw) * 0.4);
    ctx.fillStyle = `rgba(255,${Math.floor(120 + Math.sin(time * 6 + tw) * 40)},0,${0.3 + Math.sin(time * 8 + tw * 2) * 0.15})`;
    ctx.beginPath();
    ctx.arc(prevTailX + Math.cos(twAngle) * twDist, prevTailY + Math.sin(twAngle) * twDist, size * 0.008, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Wings — bat-like with flame membrane, bone structure, and claw hooks
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.12, y - size * 0.1 - bodyBob);
    ctx.rotate(side * (0.3 + wingFlap));

    // Wing membrane with detailed gradient
    const wingGrad = ctx.createLinearGradient(0, -size * 0.1, side * size * 0.38, 0);
    wingGrad.addColorStop(0, "rgba(160,40,10,0.65)");
    wingGrad.addColorStop(0.3, "rgba(200,60,15,0.5)");
    wingGrad.addColorStop(0.6, `rgba(255,100,30,${0.35 + internalFire * 0.1})`);
    wingGrad.addColorStop(1, "rgba(255,130,40,0.15)");
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.lineTo(side * size * 0.1, -size * 0.2);
    ctx.lineTo(side * size * 0.22, -size * 0.22);
    ctx.lineTo(side * size * 0.35, -size * 0.12);
    ctx.lineTo(side * size * 0.38, size * 0.0);
    ctx.lineTo(side * size * 0.28, size * 0.06);
    ctx.lineTo(side * size * 0.15, size * 0.06);
    ctx.lineTo(0, size * 0.03);
    ctx.fill();

    // Flame veins in membrane
    ctx.strokeStyle = `rgba(255,120,30,${0.15 + internalFire * 0.1})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.05, -size * 0.05);
    ctx.quadraticCurveTo(side * size * 0.15, -size * 0.12, side * size * 0.28, -size * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(side * size * 0.04, size * 0.01);
    ctx.quadraticCurveTo(side * size * 0.18, -size * 0.02, side * size * 0.34, -size * 0.02);
    ctx.stroke();

    // Wing bone structure (3 digits)
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * size * 0.1, -size * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * size * 0.22, -size * 0.22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * size * 0.35, -size * 0.12);
    ctx.stroke();

    // Bone joint knobs
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(side * size * 0.1, -size * 0.2, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(side * size * 0.22, -size * 0.22, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(side * size * 0.35, -size * 0.12, size * 0.008, 0, TAU);
    ctx.fill();

    // Wing claw hooks at bone tips
    ctx.strokeStyle = "#2a1500";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.1, -size * 0.2);
    ctx.lineTo(side * size * 0.09, -size * 0.23);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(side * size * 0.35, -size * 0.12);
    ctx.lineTo(side * size * 0.37, -size * 0.15);
    ctx.stroke();

    ctx.restore();
  }

  // Legs with muscular thighs and detailed talons
  for (const side of [-1, 1]) {
    const legSwing = Math.sin(walkPhase + side * Math.PI * 0.5) * size * 0.04;

    // Muscular thigh
    const thighGrad = ctx.createLinearGradient(
      x + side * size * 0.08, y + size * 0.12,
      x + side * size * 0.16, y + size * 0.28
    );
    thighGrad.addColorStop(0, bodyColor);
    thighGrad.addColorStop(0.5, bodyColorDark);
    thighGrad.addColorStop(1, "#1a0800");
    ctx.fillStyle = thighGrad;
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.12, y + size * 0.2 + legSwing - bodyBob, size * 0.06, size * 0.1, side * 0.1, 0, TAU);
    ctx.fill();

    // Shin
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.12, y + size * 0.28 + legSwing - bodyBob, size * 0.04, size * 0.06, 0, 0, TAU);
    ctx.fill();

    // Foot pad
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.12, y + size * 0.33 + legSwing - bodyBob, size * 0.045, size * 0.018, 0, 0, TAU);
    ctx.fill();

    // Detailed talons (3 front + 1 rear)
    ctx.strokeStyle = "#2a1500";
    ctx.lineWidth = 1.5 * zoom;
    for (let c = -1; c <= 1; c++) {
      const talonX = x + side * size * 0.12 + c * size * 0.018;
      const talonBaseY = y + size * 0.34 + legSwing - bodyBob;
      ctx.beginPath();
      ctx.moveTo(talonX, talonBaseY);
      ctx.quadraticCurveTo(talonX + c * size * 0.005, talonBaseY + size * 0.015, talonX + c * size * 0.008, talonBaseY + size * 0.025);
      ctx.stroke();
      ctx.fillStyle = "#1a0800";
      ctx.beginPath();
      ctx.arc(talonX + c * size * 0.008, talonBaseY + size * 0.025, size * 0.004, 0, TAU);
      ctx.fill();
    }
    // Rear talon
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.12 - side * size * 0.015, y + size * 0.335 + legSwing - bodyBob);
    ctx.lineTo(x + side * size * 0.12 - side * size * 0.03, y + size * 0.34 + legSwing - bodyBob);
    ctx.stroke();

    // Scale texture on thigh
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    for (let ls = 0; ls < 4; ls++) {
      const lsAngle = ls * 0.5 - 0.5;
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.12 + Math.cos(lsAngle) * size * 0.035,
        y + size * 0.18 + legSwing - bodyBob + Math.sin(lsAngle) * size * 0.06,
        size * 0.01, 0, TAU
      );
      ctx.fill();
    }
  }

  // Scaled body with individual scale texture
  const bodyGrad2 = ctx.createRadialGradient(x, y - size * 0.05, 0, x, y + size * 0.05, size * 0.26);
  bodyGrad2.addColorStop(0, bodyColorLight);
  bodyGrad2.addColorStop(0.3, bodyColor);
  bodyGrad2.addColorStop(0.7, bodyColorDark);
  bodyGrad2.addColorStop(1, "#2a0a00");
  ctx.fillStyle = bodyGrad2;
  ctx.beginPath();
  ctx.ellipse(x, y - bodyBob, size * 0.23, size * 0.21, 0, 0, TAU);
  ctx.fill();

  // Individual scale texture (overlapping rows)
  for (let row = -3; row <= 3; row++) {
    for (let col = -4; col <= 4; col++) {
      const scx = x + col * size * 0.035 + (row % 2) * size * 0.018;
      const scy = y - bodyBob + row * size * 0.04;
      const distFromCenter = Math.sqrt(Math.pow((scx - x) / (size * 0.23), 2) + Math.pow((scy - (y - bodyBob)) / (size * 0.21), 2));
      if (distFromCenter > 0.85) continue;
      ctx.strokeStyle = `rgba(0,0,0,${0.08 + distFromCenter * 0.06})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.arc(scx, scy, size * 0.013, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();
    }
  }

  // Chest glow — internal fire visible through scales
  const chestGrad = ctx.createRadialGradient(x, y + size * 0.02 - bodyBob, 0, x, y + size * 0.02 - bodyBob, size * 0.12);
  chestGrad.addColorStop(0, `rgba(255,200,80,${internalFire * 0.3})`);
  chestGrad.addColorStop(0.4, `rgba(255,120,20,${internalFire * 0.15})`);
  chestGrad.addColorStop(1, "rgba(200,60,0,0)");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.02 - bodyBob, size * 0.12, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Neck — muscular connecting body to head
  const neckGrad = ctx.createLinearGradient(x + size * 0.1, y - size * 0.08, x + size * 0.2, y - size * 0.2);
  neckGrad.addColorStop(0, bodyColor);
  neckGrad.addColorStop(0.5, bodyColorDark);
  neckGrad.addColorStop(1, bodyColor);
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.06 - bodyBob);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.12 - bodyBob, x + size * 0.14, y - size * 0.2 - bodyBob);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.14 - bodyBob, x + size * 0.16, y - size * 0.04 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Neck spikes
  for (let ns = 0; ns < 5; ns++) {
    const nsFrac = ns / 5;
    const nsx = x + size * (0.1 + nsFrac * 0.08);
    const nsy = y - size * (0.06 + nsFrac * 0.12) - bodyBob;
    const nsH = size * (0.025 + Math.sin(ns * 1.5) * 0.008);
    const nsGrad = ctx.createLinearGradient(nsx, nsy, nsx - size * 0.005, nsy - nsH);
    nsGrad.addColorStop(0, bodyColorDark);
    nsGrad.addColorStop(1, "#3a2510");
    ctx.fillStyle = nsGrad;
    ctx.beginPath();
    ctx.moveTo(nsx - size * 0.008, nsy);
    ctx.lineTo(nsx - size * 0.005, nsy - nsH);
    ctx.lineTo(nsx + size * 0.006, nsy);
    ctx.closePath();
    ctx.fill();
  }

  // Head — horned dragon head with armored ridge
  const headX = x + size * 0.18;
  const headY = y - size * 0.2 - bodyBob;
  const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.1);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(0.8, bodyColorDark);
  headGrad.addColorStop(1, "#1a0800");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.1, size * 0.075, 0.15, 0, TAU);
  ctx.fill();

  // Armored brow ridge
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX, headY - size * 0.065, headX + size * 0.06, headY - size * 0.04);
  ctx.quadraticCurveTo(headX, headY - size * 0.045, headX - size * 0.06, headY - size * 0.04);
  ctx.fill();

  // Head scale texture
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.5 * zoom;
  for (let hs = 0; hs < 5; hs++) {
    const hsx = headX - size * 0.04 + hs * size * 0.02;
    ctx.beginPath();
    ctx.arc(hsx, headY - size * 0.02, size * 0.01, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
  }

  // Snout with nostril ridges
  const snoutGrad = ctx.createRadialGradient(
    headX + size * 0.08, headY + size * 0.01, 0,
    headX + size * 0.08, headY + size * 0.01, size * 0.055
  );
  snoutGrad.addColorStop(0, bodyColor);
  snoutGrad.addColorStop(0.6, bodyColorDark);
  snoutGrad.addColorStop(1, "#1a0800");
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.08, headY + size * 0.01, size * 0.055, size * 0.038, 0.15, 0, TAU);
  ctx.fill();

  // Nostril ridges
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.1, headY + side * size * 0.008);
    ctx.quadraticCurveTo(headX + size * 0.12, headY + side * size * 0.012, headX + size * 0.13, headY + side * size * 0.006);
    ctx.stroke();
  }

  // Horns — larger, curved
  for (const side of [-1, 1]) {
    const hornGrad = ctx.createLinearGradient(
      headX - size * 0.02, headY - size * 0.05,
      headX - size * 0.1, headY - size * 0.12
    );
    hornGrad.addColorStop(0, "#4a3520");
    hornGrad.addColorStop(0.5, "#3a2a1a");
    hornGrad.addColorStop(1, "#2a1a0a");
    ctx.fillStyle = hornGrad;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.02, headY - size * 0.05 + side * size * 0.015);
    ctx.quadraticCurveTo(
      headX - size * 0.06, headY - size * 0.09 + side * size * 0.025,
      headX - size * 0.1, headY - size * 0.12 + side * size * 0.02
    );
    ctx.lineTo(headX - size * 0.09, headY - size * 0.11 + side * size * 0.015);
    ctx.quadraticCurveTo(
      headX - size * 0.05, headY - size * 0.08 + side * size * 0.02,
      headX, headY - size * 0.05 + side * size * 0.01
    );
    ctx.closePath();
    ctx.fill();
    // Horn ridges
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.04, headY - size * 0.07 + side * size * 0.02);
    ctx.lineTo(headX - size * 0.035, headY - size * 0.065 + side * size * 0.018);
    ctx.stroke();
  }

  // Fire breath glow in mouth
  const mouthGlow = breathPulse + fireBreath * 0.5;
  setShadowBlur(ctx, 5 * zoom, `rgba(255,100,0,${mouthGlow})`);
  ctx.fillStyle = `rgba(255,200,60,${mouthGlow * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.12, headY + size * 0.025, size * 0.022, size * 0.012, 0, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Fire breath cone attack with ember particles
  if (isAttacking && fireBreath > 0.2) {
    const coneLen = size * 0.5 * fireBreath;
    const coneGrad = ctx.createLinearGradient(headX + size * 0.13, headY, headX + size * 0.13 + coneLen, headY);
    coneGrad.addColorStop(0, `rgba(255,255,220,${fireBreath * 0.8})`);
    coneGrad.addColorStop(0.15, `rgba(255,220,100,${fireBreath * 0.6})`);
    coneGrad.addColorStop(0.4, `rgba(255,130,0,${fireBreath * 0.4})`);
    coneGrad.addColorStop(0.7, `rgba(255,50,0,${fireBreath * 0.25})`);
    coneGrad.addColorStop(1, "rgba(200,30,0,0)");
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.13, headY + size * 0.015);
    ctx.lineTo(headX + size * 0.13 + coneLen, headY - size * 0.1 * fireBreath);
    ctx.lineTo(headX + size * 0.13 + coneLen, headY + size * 0.12 * fireBreath);
    ctx.closePath();
    ctx.fill();

    // Bright core beam
    ctx.fillStyle = `rgba(255,255,200,${fireBreath * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(headX + size * 0.13, headY + size * 0.02);
    ctx.lineTo(headX + size * 0.13 + coneLen * 0.7, headY - size * 0.02 * fireBreath);
    ctx.lineTo(headX + size * 0.13 + coneLen * 0.7, headY + size * 0.05 * fireBreath);
    ctx.closePath();
    ctx.fill();

    // Ember sparks in breath
    setShadowBlur(ctx, 2 * zoom, "#ff6600");
    for (let be = 0; be < 8; be++) {
      const bePhase = (time * 3 + be * 0.125) % 1;
      const bex = headX + size * 0.14 + bePhase * coneLen;
      const bey = headY + size * 0.02 + (Math.sin(time * 8 + be * 2) * size * 0.04 * bePhase * fireBreath);
      const beAlpha = (1 - bePhase) * fireBreath * 0.6;
      ctx.fillStyle = `rgba(255,${Math.floor(200 - bePhase * 150)},0,${beAlpha})`;
      ctx.beginPath();
      ctx.arc(bex, bey, size * 0.006 * (1 - bePhase * 0.5), 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
  }

  // Glowing ember eyes with gradient iris
  setShadowBlur(ctx, 5 * zoom, "#ff4400");
  for (const side of [-1, 1]) {
    const eyeX = headX + size * 0.04;
    const eyeY = headY - size * 0.02 + side * size * 0.022;
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.016);
    eyeGrad.addColorStop(0, "#fff");
    eyeGrad.addColorStop(0.3, "#ffaa00");
    eyeGrad.addColorStop(0.7, "#ff4400");
    eyeGrad.addColorStop(1, "#cc2200");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.016, size * 0.012, 0.1, 0, TAU);
    ctx.fill();
    // Slit pupil
    ctx.fillStyle = "#1a0500";
    ctx.beginPath();
    ctx.ellipse(eyeX + size * 0.002, eyeY, size * 0.004, size * 0.01, 0, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Nostrils with smoke wisps
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0500";
    ctx.beginPath();
    ctx.arc(headX + size * 0.12, headY + side * size * 0.012, size * 0.007, 0, TAU);
    ctx.fill();
    // Smoke wisps curling up
    for (let sw = 0; sw < 3; sw++) {
      const swPhase = (time * 1.8 + sw * 0.3 + side * 0.5) % 1;
      const swx = headX + size * 0.12 + Math.sin(time * 3 + sw * 2 + side) * size * 0.015 * swPhase;
      const swy = headY + side * size * 0.012 - swPhase * size * 0.06;
      const swAlpha = (1 - swPhase) * 0.15;
      ctx.fillStyle = `rgba(120,100,80,${swAlpha})`;
      ctx.beginPath();
      ctx.arc(swx, swy, size * (0.004 + swPhase * 0.006), 0, TAU);
      ctx.fill();
    }
  }
}

// 20. SALAMANDER — Sleek fire lizard with gradient flame scales and darting movement
export function drawSalamanderEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
): void {
  const isAttacking = attackPhase > 0;
  size *= 1.2;
  const dartPhase = time * 6;
  const dart = Math.sin(dartPhase * 0.7) * size * 0.02;
  const dartSnap = Math.sin(dartPhase * 0.7 + 0.3) * size * 0.01;
  const bodyWave = Math.sin(time * 5);
  const legCycle = time * 8;
  const bellyGlow = 0.35 + Math.sin(time * 3) * 0.15;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x + dart, y + size * 0.17, size * 0.22, size * 0.05 * ISO_Y_RATIO, 0.05, 0, TAU);
  ctx.fill();

  // Ember/spark trail behind (dense, fiery)
  for (let ft = 0; ft < 16; ft++) {
    const ftFrac = ft / 16;
    const ftWander = Math.sin(time * 4 + ft * 0.9) * size * 0.03 * (1 + ftFrac);
    const ftx = x - size * 0.08 - ftFrac * size * 0.35 + ftWander;
    const ftRise = ftFrac * size * 0.04 + Math.sin(time * 5 + ft * 1.2) * size * 0.015;
    const fty = y + size * 0.04 - ftRise;
    const ftAlpha = (1 - ftFrac) * 0.5;
    const ftSize = size * (0.013 - ftFrac * 0.007) * (0.7 + Math.sin(ft * 2.8) * 0.3);
    const r = Math.min(255, Math.floor(255 - ftFrac * 30));
    const g = Math.floor(210 - ftFrac * 170);
    const b = ftFrac > 0.6 ? 0 : 20;
    setShadowBlur(ctx, 2 * zoom, `rgba(255,${g},0,0.3)`);
    ctx.fillStyle = `rgba(${r},${g},${b},${ftAlpha})`;
    ctx.beginPath();
    ctx.arc(ftx, fty, ftSize, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Rising spark particles
  for (let sp = 0; sp < 6; sp++) {
    const spPhase = (time * 1.2 + sp * 0.17) % 1;
    const spx = x - size * 0.1 + Math.sin(time * 2 + sp * 1.5) * size * 0.15;
    const spy = y + size * 0.05 - spPhase * size * 0.3;
    const spAlpha = Math.sin(spPhase * Math.PI) * 0.5;
    ctx.fillStyle = `rgba(255,${Math.floor(200 - spPhase * 150)},0,${spAlpha})`;
    ctx.beginPath();
    ctx.arc(spx, spy, size * 0.005 * (1 - spPhase * 0.5), 0, TAU);
    ctx.fill();
  }

  // Heat shimmer on ground (wavy lines)
  ctx.lineWidth = 0.5 * zoom;
  for (let hs = 0; hs < 4; hs++) {
    const hsx = x + (hs - 1.5) * size * 0.12;
    const hsAlpha = 0.04 + Math.sin(time * 2 + hs) * 0.015;
    ctx.strokeStyle = `rgba(255,150,50,${hsAlpha})`;
    ctx.beginPath();
    for (let hp = 0; hp < 8; hp++) {
      const hpx = hsx + hp * size * 0.025;
      const hpy = y + size * 0.2 + Math.sin(time * 4 + hp * 0.8 + hs * 1.5) * size * 0.012;
      if (hp === 0) ctx.moveTo(hpx, hpy);
      else ctx.lineTo(hpx, hpy);
    }
    ctx.stroke();
  }

  // Tail — long undulating with graduated segments and flame tip
  const tailSegs = 12;
  let ptx = x - size * 0.15 + dart * 0.5;
  let pty = y + size * 0.05;
  ctx.lineCap = "round";
  for (let t = 0; t < tailSegs; t++) {
    const tFrac = (t + 1) / tailSegs;
    const tailWave = Math.sin(time * 5 + t * 0.7) * size * 0.035 * tFrac;
    const ntx = x - size * 0.15 - tFrac * size * 0.3 + dart * 0.3;
    const nty = y + size * 0.05 + tailWave;
    const segW = size * 0.035 * (1 - tFrac * 0.65);

    // Gradient coloring per segment from body to flame
    if (t < tailSegs - 3) {
      const segGrad = ctx.createLinearGradient(ptx, pty - segW, ptx, pty + segW);
      segGrad.addColorStop(0, bodyColorDark);
      segGrad.addColorStop(0.4, bodyColor);
      segGrad.addColorStop(1, bodyColorDark);
      ctx.strokeStyle = segGrad;
    } else {
      const flameI = (t - (tailSegs - 3)) / 3;
      const fR = 255;
      const fG = Math.floor(160 - flameI * 80 + Math.sin(time * 6 + t) * 20);
      ctx.strokeStyle = `rgba(${fR},${fG},${Math.floor(30 - flameI * 30)},${0.7 + Math.sin(time * 7 + t) * 0.15})`;
    }
    ctx.lineWidth = segW;
    ctx.beginPath();
    ctx.moveTo(ptx, pty);
    ctx.lineTo(ntx, nty);
    ctx.stroke();

    // Scale marks on tail body portion
    if (t < tailSegs - 3 && t % 2 === 0) {
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.4 * zoom;
      const midX = (ptx + ntx) * 0.5;
      const midY = (pty + nty) * 0.5;
      ctx.beginPath();
      ctx.arc(midX, midY, segW * 0.3, 0, Math.PI);
      ctx.stroke();
    }

    ptx = ntx;
    pty = nty;
  }

  // Multi-layered flame tip
  setShadowBlur(ctx, 5 * zoom, "#ff4400");
  for (let fl = 0; fl < 5; fl++) {
    const flAngle = Math.sin(time * 8 + fl * 1.2) * 0.6;
    const flLen = size * (0.025 + fl * 0.005);
    const flAlpha = 0.65 - fl * 0.1;
    const flG = Math.floor(180 - fl * 35 + Math.sin(time * 9 + fl) * 20);
    ctx.fillStyle = `rgba(255,${flG},0,${flAlpha})`;
    ctx.beginPath();
    ctx.moveTo(ptx, pty);
    ctx.lineTo(ptx - Math.cos(flAngle) * flLen, pty + Math.sin(flAngle) * flLen - size * 0.012);
    ctx.lineTo(ptx - Math.cos(flAngle + 0.4) * flLen * 0.4, pty + Math.sin(flAngle + 0.4) * flLen * 0.4);
    ctx.fill();
  }
  // Bright flame core at tip
  const fCoreGrad = ctx.createRadialGradient(ptx, pty, 0, ptx, pty, size * 0.018);
  fCoreGrad.addColorStop(0, "rgba(255,255,200,0.7)");
  fCoreGrad.addColorStop(0.5, "rgba(255,180,50,0.3)");
  fCoreGrad.addColorStop(1, "rgba(255,100,0,0)");
  ctx.fillStyle = fCoreGrad;
  ctx.beginPath();
  ctx.arc(ptx, pty, size * 0.018, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.lineCap = "butt";

  // Four articulated legs in running gait (gecko-style)
  const legDefs = [
    { bx: 0.1, by: 0.06, phase: 0, side: 1 },
    { bx: 0.1, by: 0.06, phase: Math.PI, side: -1 },
    { bx: -0.06, by: 0.06, phase: Math.PI * 0.5, side: 1 },
    { bx: -0.06, by: 0.06, phase: Math.PI * 1.5, side: -1 },
  ];
  for (const lp of legDefs) {
    const legAngle = Math.sin(legCycle + lp.phase) * 0.45;
    const legLift = Math.max(0, Math.sin(legCycle + lp.phase)) * size * 0.01;
    const lx = x + lp.bx * size + dart;
    const ly = y + lp.by * size - legLift;
    const kneeX = lx + lp.side * size * 0.045 + Math.sin(legAngle) * size * 0.022;
    const kneeY = ly + size * 0.055;
    const footX = kneeX + lp.side * size * 0.035 + Math.sin(legAngle) * size * 0.018;
    const footY = kneeY + size * 0.055 + Math.cos(legAngle) * size * 0.012;

    // Upper leg with muscle gradient
    const ulGrad = ctx.createLinearGradient(lx, ly, kneeX, kneeY);
    ulGrad.addColorStop(0, bodyColor);
    ulGrad.addColorStop(1, bodyColorDark);
    ctx.strokeStyle = ulGrad;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    // Knee joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, size * 0.008, 0, TAU);
    ctx.fill();

    // Lower leg
    const llGrad = ctx.createLinearGradient(kneeX, kneeY, footX, footY);
    llGrad.addColorStop(0, bodyColorDark);
    llGrad.addColorStop(1, bodyColor);
    ctx.strokeStyle = llGrad;
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // Gecko-style splayed toes with pads
    ctx.lineWidth = 1 * zoom;
    for (let toe = 0; toe < 4; toe++) {
      const tAngle = (toe - 1.5) * 0.35 + lp.side * 0.2;
      const toeEndX = footX + Math.cos(tAngle) * size * 0.022;
      const toeEndY = footY + Math.sin(tAngle) * size * 0.016 + size * 0.008;

      // Toe bone
      ctx.strokeStyle = bodyColorDark;
      ctx.beginPath();
      ctx.moveTo(footX, footY);
      ctx.lineTo(toeEndX, toeEndY);
      ctx.stroke();

      // Toe pad
      const padGrad = ctx.createRadialGradient(toeEndX, toeEndY, 0, toeEndX, toeEndY, size * 0.005);
      padGrad.addColorStop(0, bodyColor);
      padGrad.addColorStop(1, bodyColorDark);
      ctx.fillStyle = padGrad;
      ctx.beginPath();
      ctx.arc(toeEndX, toeEndY, size * 0.005, 0, TAU);
      ctx.fill();
    }
  }

  // Elongated body with flame gradient
  const bodyGrad = ctx.createLinearGradient(x - size * 0.2, y - size * 0.06, x + size * 0.2, y + size * 0.1);
  bodyGrad.addColorStop(0, bodyColorDark);
  bodyGrad.addColorStop(0.15, bodyColor);
  bodyGrad.addColorStop(0.35, bodyColorLight);
  bodyGrad.addColorStop(0.65, bodyColorLight);
  bodyGrad.addColorStop(0.85, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x + dart, y + size * 0.02, size * 0.2 + bodyWave * size * 0.01, size * 0.09, 0.05, 0, TAU);
  ctx.fill();

  // Flame pattern markings on body
  ctx.strokeStyle = `rgba(255,120,20,${0.2 + bellyGlow * 0.1})`;
  ctx.lineWidth = 1.2 * zoom;
  const markPatterns: [number, number, number][] = [
    [-0.1, -0.01, 0.4],
    [-0.03, -0.03, 0.3],
    [0.05, -0.02, 0.35],
    [0.12, 0.0, 0.25],
    [-0.07, 0.03, 0.3],
    [0.08, 0.04, 0.35],
  ];
  for (const [mx, my, mLen] of markPatterns) {
    const markX = x + mx * size + dart;
    const markY = y + my * size;
    ctx.beginPath();
    ctx.moveTo(markX, markY);
    ctx.quadraticCurveTo(
      markX + size * 0.015, markY - size * 0.015,
      markX + size * mLen * 0.06, markY - size * 0.005
    );
    ctx.stroke();
  }

  // Individual scale texture on body
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.4 * zoom;
  for (let row = -2; row <= 2; row++) {
    for (let col = -4; col <= 4; col++) {
      const scx = x + col * size * 0.035 + (row % 2) * size * 0.018 + dart;
      const scy = y + size * 0.02 + row * size * 0.028;
      const distFromCenter = Math.sqrt(
        Math.pow((scx - x - dart) / (size * 0.2), 2) +
        Math.pow((scy - y - size * 0.02) / (size * 0.09), 2)
      );
      if (distFromCenter > 0.8) continue;
      ctx.beginPath();
      ctx.arc(scx, scy, size * 0.01, Math.PI * 0.7, Math.PI * 2.3);
      ctx.stroke();
    }
  }

  // Lava cracks on body with glow
  setShadowBlur(ctx, 3 * zoom, "#ff4400");
  ctx.lineWidth = 1.2 * zoom;
  for (let lc = 0; lc < 7; lc++) {
    const lcx = x + (lc - 3) * size * 0.05 + dart;
    const lcGlow = 0.25 + Math.sin(time * 3 + lc * 1.2) * 0.1;
    ctx.strokeStyle = `rgba(255,120,20,${lcGlow})`;
    ctx.beginPath();
    ctx.moveTo(lcx, y - size * 0.025);
    ctx.quadraticCurveTo(
      lcx + Math.sin(lc * 1.5) * size * 0.018,
      y + size * 0.02,
      lcx + size * 0.012,
      y + size * 0.065
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Dorsal flame ridge — animated fire spines
  for (let sp = 0; sp < 10; sp++) {
    const spx = x + (sp - 4.5) * size * 0.035 + dart;
    const spH = size * (0.035 + Math.sin(time * 5 + sp * 0.9) * 0.01);
    const spFlicker = 0.5 + Math.sin(time * 7 + sp * 1.3) * 0.2;

    // Flame spine gradient
    const spGrad = ctx.createLinearGradient(spx, y - size * 0.02, spx, y - size * 0.02 - spH);
    spGrad.addColorStop(0, `rgba(255,80,0,${spFlicker * 0.6})`);
    spGrad.addColorStop(0.3, `rgba(255,150,30,${spFlicker * 0.5})`);
    spGrad.addColorStop(0.6, `rgba(255,200,80,${spFlicker * 0.35})`);
    spGrad.addColorStop(1, `rgba(255,240,150,${spFlicker * 0.1})`);
    ctx.fillStyle = spGrad;
    ctx.beginPath();
    ctx.moveTo(spx - size * 0.009, y - size * 0.02);
    ctx.lineTo(spx - size * 0.002, y - size * 0.02 - spH);
    ctx.lineTo(spx + size * 0.002, y - size * 0.02 - spH * 0.9);
    ctx.lineTo(spx + size * 0.009, y - size * 0.02);
    ctx.fill();

    // Spine wisp at tip
    if (sp % 2 === 0) {
      setShadowBlur(ctx, 2 * zoom, "#ff6600");
      ctx.fillStyle = `rgba(255,200,50,${spFlicker * 0.3})`;
      ctx.beginPath();
      ctx.arc(spx, y - size * 0.02 - spH, size * 0.004, 0, TAU);
      ctx.fill();
      clearShadow(ctx);
    }
  }

  // Belly glow — hot coals visible through translucent skin
  const coalGrad = ctx.createRadialGradient(
    x + dart, y + size * 0.065, 0,
    x + dart, y + size * 0.065, size * 0.14
  );
  coalGrad.addColorStop(0, `rgba(255,200,80,${bellyGlow * 0.4})`);
  coalGrad.addColorStop(0.3, `rgba(255,140,30,${bellyGlow * 0.3})`);
  coalGrad.addColorStop(0.6, `rgba(255,80,10,${bellyGlow * 0.15})`);
  coalGrad.addColorStop(1, "rgba(200,50,0,0)");
  ctx.fillStyle = coalGrad;
  ctx.beginPath();
  ctx.ellipse(x + dart, y + size * 0.065, size * 0.14, size * 0.045, 0, 0, TAU);
  ctx.fill();

  // Coal texture inside belly
  for (let ct = 0; ct < 8; ct++) {
    const ctGlow = bellyGlow * (0.4 + Math.sin(time * 4 + ct * 1.7) * 0.2);
    const ctx2 = x + (ct - 3.5) * size * 0.03 + dart;
    const cty = y + size * 0.065 + Math.sin(ct * 2.3) * size * 0.015;
    ctx.fillStyle = `rgba(255,${Math.floor(160 + ctGlow * 60)},30,${ctGlow * 0.3})`;
    ctx.beginPath();
    ctx.arc(ctx2, cty, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // Belly segment lines
  ctx.strokeStyle = `rgba(255,120,40,${bellyGlow * 0.2})`;
  ctx.lineWidth = 0.6 * zoom;
  for (let bs = 0; bs < 8; bs++) {
    const bsx = x + (bs - 3.5) * size * 0.035 + dart;
    ctx.beginPath();
    ctx.moveTo(bsx, y + size * 0.03);
    ctx.lineTo(bsx, y + size * 0.1);
    ctx.stroke();
  }

  // Head — wider reptilian with detailed snout
  const headX2 = x + size * 0.2 + dart;
  const headY2 = y - size * 0.015 + dartSnap;
  const headGrad = ctx.createRadialGradient(headX2 - size * 0.01, headY2 - size * 0.01, 0, headX2, headY2, size * 0.08);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(0.8, bodyColorDark);
  headGrad.addColorStop(1, "#1a0800");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX2, headY2, size * 0.08, size * 0.06, 0.1, 0, TAU);
  ctx.fill();

  // Head scale texture
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.4 * zoom;
  for (let hs = 0; hs < 4; hs++) {
    const hsx = headX2 - size * 0.03 + hs * size * 0.02;
    ctx.beginPath();
    ctx.arc(hsx, headY2 - size * 0.015, size * 0.008, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
  }

  // Snout with gradient
  const snoutGrad = ctx.createRadialGradient(
    headX2 + size * 0.07, headY2 + size * 0.005, 0,
    headX2 + size * 0.07, headY2 + size * 0.005, size * 0.04
  );
  snoutGrad.addColorStop(0, bodyColor);
  snoutGrad.addColorStop(0.6, bodyColorDark);
  snoutGrad.addColorStop(1, "#1a0800");
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.ellipse(headX2 + size * 0.07, headY2 + size * 0.005, size * 0.04, size * 0.028, 0.1, 0, TAU);
  ctx.fill();

  // Nostrils
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1a0800";
    ctx.beginPath();
    ctx.ellipse(headX2 + size * 0.09, headY2 + side * size * 0.009, size * 0.005, size * 0.003, 0, 0, TAU);
    ctx.fill();
  }

  // Smoke wisps from nostrils
  for (let ns = 0; ns < 4; ns++) {
    const nsPhase = (time * 2 + ns * 0.25) % 1;
    const nsSide = ns < 2 ? -1 : 1;
    const nsx = headX2 + size * 0.095 + nsPhase * size * 0.05 + Math.sin(time * 4 + ns * 2) * size * 0.01;
    const nsy = headY2 + nsSide * size * 0.009 - nsPhase * size * 0.04;
    const nsAlpha = (1 - nsPhase) * 0.16;
    ctx.fillStyle = `rgba(120,110,100,${nsAlpha})`;
    ctx.beginPath();
    ctx.arc(nsx, nsy, size * (0.005 + nsPhase * 0.007), 0, TAU);
    ctx.fill();
  }

  // Jaw line with detail
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX2 + size * 0.04, headY2 + size * 0.025);
  ctx.quadraticCurveTo(headX2 + size * 0.065, headY2 + size * 0.03, headX2 + size * 0.09, headY2 + size * 0.018);
  ctx.stroke();
  // Lower jaw line
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX2 + size * 0.05, headY2 + size * 0.03);
  ctx.quadraticCurveTo(headX2 + size * 0.07, headY2 + size * 0.035, headX2 + size * 0.085, headY2 + size * 0.025);
  ctx.stroke();

  // Fire eyes — intense with gradient iris
  setShadowBlur(ctx, 6 * zoom, "#ff4400");
  for (const side of [-1, 1]) {
    const eyeX = headX2 + size * 0.025;
    const eyeY = headY2 - size * 0.008 + side * size * 0.02;
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.014);
    eyeGrad.addColorStop(0, "#fff");
    eyeGrad.addColorStop(0.25, "#ffcc00");
    eyeGrad.addColorStop(0.5, "#ff8800");
    eyeGrad.addColorStop(1, "#cc3300");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.014, size * 0.01, 0.05, 0, TAU);
    ctx.fill();
    // Slit pupil
    ctx.fillStyle = "#1a0500";
    ctx.beginPath();
    ctx.ellipse(eyeX + size * 0.002, eyeY, size * 0.004, size * 0.008, 0, 0, TAU);
    ctx.fill();
    // Eye glow halo
    ctx.fillStyle = `rgba(255,100,0,${0.08 + Math.sin(time * 4 + side) * 0.03})`;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.02, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Fire breath / flame burst during attack
  if (isAttacking) {
    const breathLen = attackIntensity * size * 0.35;

    // Flame cone
    const breathGrad = ctx.createLinearGradient(
      headX2 + size * 0.1, headY2,
      headX2 + size * 0.1 + breathLen, headY2
    );
    breathGrad.addColorStop(0, `rgba(255,255,200,${attackIntensity * 0.7})`);
    breathGrad.addColorStop(0.2, `rgba(255,200,50,${attackIntensity * 0.5})`);
    breathGrad.addColorStop(0.5, `rgba(255,120,0,${attackIntensity * 0.35})`);
    breathGrad.addColorStop(1, "rgba(255,50,0,0)");
    ctx.fillStyle = breathGrad;
    ctx.beginPath();
    ctx.moveTo(headX2 + size * 0.1, headY2 + size * 0.008);
    ctx.lineTo(headX2 + size * 0.1 + breathLen, headY2 - size * 0.06 * attackIntensity);
    ctx.lineTo(headX2 + size * 0.1 + breathLen, headY2 + size * 0.07 * attackIntensity);
    ctx.closePath();
    ctx.fill();

    // Breath ember particles
    setShadowBlur(ctx, 2 * zoom, "#ff6600");
    for (let be = 0; be < 6; be++) {
      const bePhase = (time * 4 + be * 0.17) % 1;
      const bex = headX2 + size * 0.11 + bePhase * breathLen;
      const bey = headY2 + size * 0.01 + Math.sin(time * 9 + be * 2.5) * size * 0.03 * bePhase * attackIntensity;
      const beAlpha = (1 - bePhase) * attackIntensity * 0.5;
      ctx.fillStyle = `rgba(255,${Math.floor(200 - bePhase * 150)},0,${beAlpha})`;
      ctx.beginPath();
      ctx.arc(bex, bey, size * 0.005 * (1 - bePhase * 0.4), 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);

    // Speed lines behind during attack
    ctx.lineWidth = 0.8 * zoom;
    for (let sl = 0; sl < 5; sl++) {
      const slPhase = (time * 8 + sl * 0.2) % 1;
      const slAlpha = (1 - slPhase) * attackIntensity * 0.15;
      ctx.strokeStyle = `rgba(255,150,0,${slAlpha})`;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.18 - slPhase * size * 0.12, y + (sl - 2) * size * 0.03);
      ctx.lineTo(x - size * 0.18 - slPhase * size * 0.12 - size * 0.08, y + (sl - 2) * size * 0.03);
      ctx.stroke();
    }
  }
}
