import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawPulsingGlowRings,
  drawArcaneSparkles,
  drawShiftingSegments,
  getBreathScale,
  getIdleSway,
  drawEmberSparks,
  drawShadowWisps,
} from "./animationHelpers";
import {
  drawPathArm,
  drawPathLegs,
  drawShoulderOverlay,
  drawBeltOverlay,
  drawGorget,
  drawArmorSkirt,
} from "./darkFantasyHelpers";

const TAU = Math.PI * 2;

// ============================================================================
// 1. ARCHER — LEATHER RANGER
//    Recurve longbow, leather brigandine, ranger hood, quiver on back
// ============================================================================

export function drawArcherEnemy(
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
  size *= 1.7;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 2.2, 0.02);
  const sway = getIdleSway(time, 0.9, 1.4, 0.8);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const leather = "#6b4e37";
  const leatherDark = "#3e2a18";
  const leatherLight = "#8a6a4e";
  const accent = bodyColor;
  const accentDark = bodyColorDark;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.52, size * 0.28, size * 0.28 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Tattered forest cloak (behind body)
  const cloakGrad = ctx.createLinearGradient(cx, y - size * 0.35, cx, y + size * 0.35);
  cloakGrad.addColorStop(0, "#2d4a2e");
  cloakGrad.addColorStop(0.5, "#1a3a1c");
  cloakGrad.addColorStop(1, "#0f2810");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.18, y - size * 0.32 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.26, y + size * 0.08, cx - size * 0.2 + Math.sin(time * 2) * size * 0.02, y + size * 0.32);
  for (let t = 0; t < 5; t++) {
    const tx = cx - size * 0.2 + t * size * 0.1 + Math.sin(time * 2 + t) * size * 0.015;
    const ty = y + size * 0.32 + (t % 2) * size * 0.03;
    ctx.lineTo(tx, ty);
  }
  ctx.quadraticCurveTo(cx + size * 0.26, y + size * 0.08, cx + size * 0.18, y - size * 0.32 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Quiver on back — leather cylinder with arrow shafts
  ctx.save();
  ctx.translate(cx + size * 0.1, y - size * 0.12 - bodyBob);
  ctx.rotate(0.18);
  const quiverGrad = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
  quiverGrad.addColorStop(0, leatherDark);
  quiverGrad.addColorStop(0.5, leather);
  quiverGrad.addColorStop(1, leatherDark);
  ctx.fillStyle = quiverGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, -size * 0.2);
  ctx.lineTo(-size * 0.03, size * 0.12);
  ctx.quadraticCurveTo(0, size * 0.15, size * 0.03, size * 0.12);
  ctx.lineTo(size * 0.035, -size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = leatherDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Strap
  ctx.strokeStyle = leather;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.2);
  ctx.lineTo(-size * 0.12, -size * 0.12);
  ctx.stroke();
  // Arrow shafts sticking out
  for (let a = 0; a < 5; a++) {
    const ax = -size * 0.018 + a * size * 0.009;
    ctx.strokeStyle = "#b89a70";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.2);
    ctx.lineTo(ax + Math.sin(a) * size * 0.004, -size * 0.32);
    ctx.stroke();
    // Fletching — 3 feather vanes per arrow
    for (let f = 0; f < 3; f++) {
      const fAngle = f * TAU / 3;
      const fx = ax + Math.cos(fAngle) * size * 0.006;
      ctx.fillStyle = f === 0 ? "#ef4444" : "#d4d4d4";
      ctx.beginPath();
      ctx.moveTo(fx, -size * 0.3);
      ctx.lineTo(fx + Math.cos(fAngle) * size * 0.008, -size * 0.28);
      ctx.lineTo(fx, -size * 0.26);
      ctx.fill();
    }
    // Broadhead tips
    ctx.fillStyle = "#c0c0c0";
    ctx.beginPath();
    ctx.moveTo(ax - size * 0.005, -size * 0.32);
    ctx.lineTo(ax, -size * 0.35);
    ctx.lineTo(ax + size * 0.005, -size * 0.32);
    ctx.fill();
  }
  ctx.restore();

  // Legs — leather-wrapped, NOT full plate
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: leather,
    colorDark: leatherDark,
    footColor: leatherDark,
    strideSpeed: 3.2,
    strideAmt: 0.24,
    legLen: 0.18,
    width: 0.05,
    style: "fleshy",
  });

  // Leather brigandine body (NOT plate cuirass)
  const brigGrad = ctx.createLinearGradient(cx - size * 0.16, y - size * 0.35, cx + size * 0.16, y + size * 0.02);
  brigGrad.addColorStop(0, leatherDark);
  brigGrad.addColorStop(0.25, leather);
  brigGrad.addColorStop(0.5, leatherLight);
  brigGrad.addColorStop(0.75, leather);
  brigGrad.addColorStop(1, leatherDark);
  ctx.fillStyle = brigGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.15, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.18, y - size * 0.12 - bodyBob, cx - size * 0.14, y + size * 0.02 - bodyBob);
  ctx.lineTo(cx + size * 0.14, y + size * 0.02 - bodyBob);
  ctx.quadraticCurveTo(cx + size * 0.18, y - size * 0.12 - bodyBob, cx + size * 0.15, y - size * 0.34 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Studded leather detail — rows of rivets
  ctx.fillStyle = "#a08060";
  for (let row = 0; row < 4; row++) {
    const ry = y - size * 0.28 + row * size * 0.08 - bodyBob;
    for (let col = 0; col < 5; col++) {
      const rx = cx - size * 0.08 + col * size * 0.04;
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.005, 0, TAU);
      ctx.fill();
    }
  }

  // Chainmail peek at neckline
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 0.8 * zoom;
  for (let ch = 0; ch < 6; ch++) {
    const chx = cx - size * 0.06 + ch * size * 0.025;
    const chy = y - size * 0.33 - bodyBob;
    ctx.beginPath();
    ctx.arc(chx, chy, size * 0.008, 0, TAU);
    ctx.stroke();
  }

  // Green tabard front panel
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.06, y - size * 0.3 - bodyBob);
  ctx.lineTo(cx + size * 0.06, y - size * 0.3 - bodyBob);
  ctx.lineTo(cx + size * 0.05, y - size * 0.04 - bodyBob);
  ctx.lineTo(cx - size * 0.05, y - size * 0.04 - bodyBob);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Leaf emblem
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx, y - size * 0.25 - bodyBob);
  ctx.quadraticCurveTo(cx + size * 0.035, y - size * 0.2 - bodyBob, cx, y - size * 0.15 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.035, y - size * 0.2 - bodyBob, cx, y - size * 0.25 - bodyBob);
  ctx.stroke();

  // Small leather shoulder pads (NOT plate pauldrons)
  for (const side of [-1, 1]) {
    const spx = cx + side * size * 0.17;
    const spy = y - size * 0.32 - bodyBob;
    const padGrad = ctx.createLinearGradient(spx - size * 0.04, spy, spx + size * 0.04, spy + size * 0.06);
    padGrad.addColorStop(0, leatherLight);
    padGrad.addColorStop(1, leatherDark);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.ellipse(spx, spy + size * 0.02, size * 0.05, size * 0.03, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = leatherDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // Utility belt with pouches (NOT metal belt)
  ctx.fillStyle = leatherDark;
  ctx.fillRect(cx - size * 0.14, y - size * 0.03 - bodyBob, size * 0.28, size * 0.03);
  // Belt buckle
  ctx.fillStyle = "#b8860b";
  ctx.fillRect(cx - size * 0.02, y - size * 0.035 - bodyBob, size * 0.04, size * 0.04);
  // Pouches
  for (const side of [-1, 1]) {
    ctx.fillStyle = leather;
    ctx.beginPath();
    ctx.roundRect(cx + side * size * 0.08 - size * 0.025, y - size * 0.01 - bodyBob, size * 0.05, size * 0.04, size * 0.008);
    ctx.fill();
    ctx.strokeStyle = leatherDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // Left arm — spare arrows held loosely
  const arrowForeLen = 0.14;
  drawPathArm(ctx, cx - size * 0.2, y - size * 0.28 - bodyBob, size, time, zoom, -1, {
    color: leather,
    colorDark: leatherDark,
    handColor: "#c4a882",
    upperLen: 0.15,
    foreLen: arrowForeLen,
    width: 0.048,
    shoulderAngle: 0.45 + Math.sin(time * 1.2) * 0.04 + (isAttacking ? -attackIntensity * 0.3 : 0),
    elbowAngle: 0.35 + (isAttacking ? -attackIntensity * 0.2 : 0),
    style: "fleshy",
    onWeapon: (wCtx) => {
      const handY = arrowForeLen * size;
      wCtx.translate(0, handY * 0.5);
      // 3 arrows gripped loosely
      for (let a = 0; a < 3; a++) {
        const ax = -size * 0.012 + a * size * 0.012;
        const aRot = (a - 1) * 0.05;
        wCtx.save();
        wCtx.rotate(aRot);
        // Shaft with wood grain
        const shaftGrad = wCtx.createLinearGradient(ax - 1, 0, ax + 1, 0);
        shaftGrad.addColorStop(0, "#9a7a55");
        shaftGrad.addColorStop(0.5, "#c4a878");
        shaftGrad.addColorStop(1, "#9a7a55");
        wCtx.strokeStyle = shaftGrad;
        wCtx.lineWidth = 1.8 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(ax, size * 0.06);
        wCtx.lineTo(ax, -size * 0.14);
        wCtx.stroke();
        // Fletching — red + white feathers
        for (let f = 0; f < 3; f++) {
          ctx.fillStyle = f === 0 ? "#dc2626" : "#e8e0d0";
          wCtx.fillStyle = f === 0 ? "#dc2626" : "#e8e0d0";
          const fOff = (f - 1) * size * 0.005;
          wCtx.beginPath();
          wCtx.moveTo(ax + fOff, size * 0.04);
          wCtx.quadraticCurveTo(ax + fOff + size * 0.008, size * 0.025, ax + fOff, size * 0.01);
          wCtx.quadraticCurveTo(ax + fOff - size * 0.004, size * 0.025, ax + fOff, size * 0.04);
          wCtx.fill();
        }
        // Broadhead
        wCtx.fillStyle = "#c8c8c8";
        wCtx.beginPath();
        wCtx.moveTo(ax, -size * 0.17);
        wCtx.lineTo(ax - size * 0.008, -size * 0.14);
        wCtx.lineTo(ax + size * 0.008, -size * 0.14);
        wCtx.closePath();
        wCtx.fill();
        wCtx.strokeStyle = "#888";
        wCtx.lineWidth = 0.5 * zoom;
        wCtx.stroke();
        wCtx.restore();
      }
    },
  });

  // Right arm — ORNATE RECURVE LONGBOW
  const bowForeLen = 0.15;
  drawPathArm(ctx, cx + size * 0.2, y - size * 0.28 - bodyBob, size, time, zoom, 1, {
    color: leather,
    colorDark: leatherDark,
    handColor: "#c4a882",
    upperLen: 0.16,
    foreLen: bowForeLen,
    width: 0.048,
    shoulderAngle: -(0.7 + (isAttacking ? attackIntensity * 0.35 : 0)) + Math.sin(time * 1.5) * 0.025,
    elbowAngle: -0.35 + (isAttacking ? -attackIntensity * 0.15 : 0),
    style: "fleshy",
    onWeapon: (wCtx) => {
      const handY = bowForeLen * size;
      wCtx.translate(0, handY * 0.45);

      const bowH = size * 0.48;

      // --- RECURVE BOW LIMBS ---
      // Upper limb — double-curve (S-shape recurve)
      const limbW = 4.5 * zoom;
      const upperGrad = wCtx.createLinearGradient(0, -bowH * 0.5, 0, 0);
      upperGrad.addColorStop(0, "#4a2a10");
      upperGrad.addColorStop(0.3, "#7a5030");
      upperGrad.addColorStop(0.6, "#a07048");
      upperGrad.addColorStop(1, "#6a4020");
      wCtx.strokeStyle = upperGrad;
      wCtx.lineWidth = limbW;
      wCtx.lineCap = "round";
      wCtx.beginPath();
      wCtx.moveTo(size * 0.02, -bowH * 0.5);
      wCtx.bezierCurveTo(-size * 0.06, -bowH * 0.38, -size * 0.1, -bowH * 0.18, -size * 0.05, 0);
      wCtx.stroke();
      // Lower limb — mirror S-shape
      const lowerGrad = wCtx.createLinearGradient(0, 0, 0, bowH * 0.5);
      lowerGrad.addColorStop(0, "#6a4020");
      lowerGrad.addColorStop(0.4, "#a07048");
      lowerGrad.addColorStop(0.7, "#7a5030");
      lowerGrad.addColorStop(1, "#4a2a10");
      wCtx.strokeStyle = lowerGrad;
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.05, 0);
      wCtx.bezierCurveTo(-size * 0.1, bowH * 0.18, -size * 0.06, bowH * 0.38, size * 0.02, bowH * 0.5);
      wCtx.stroke();
      wCtx.lineCap = "butt";

      // Wood grain lines along each limb
      wCtx.strokeStyle = "rgba(90,50,20,0.3)";
      wCtx.lineWidth = 0.8 * zoom;
      for (let g = 0; g < 3; g++) {
        const gOff = (g - 1) * size * 0.005;
        wCtx.beginPath();
        wCtx.moveTo(size * 0.02 + gOff, -bowH * 0.48);
        wCtx.bezierCurveTo(-size * 0.055 + gOff, -bowH * 0.36, -size * 0.095 + gOff, -bowH * 0.16, -size * 0.045 + gOff, 0);
        wCtx.stroke();
      }

      // Recurve tips — curved siyahs with horn tips
      for (const dir of [-1, 1]) {
        const tipY = dir * bowH * 0.5;
        wCtx.fillStyle = "#2a1808";
        wCtx.beginPath();
        wCtx.moveTo(size * 0.02, tipY);
        wCtx.quadraticCurveTo(size * 0.04, tipY + dir * size * 0.02, size * 0.06, tipY + dir * size * 0.01);
        wCtx.lineTo(size * 0.055, tipY - dir * size * 0.005);
        wCtx.quadraticCurveTo(size * 0.03, tipY - dir * size * 0.005, size * 0.02, tipY);
        wCtx.fill();
        // String nock (bone/horn)
        wCtx.fillStyle = "#e8dcc8";
        wCtx.beginPath();
        wCtx.arc(size * 0.055, tipY + dir * size * 0.005, size * 0.005, 0, TAU);
        wCtx.fill();
      }

      // Leather grip wrapping
      const gripY = -size * 0.015;
      const gripH = size * 0.06;
      wCtx.fillStyle = leatherDark;
      wCtx.beginPath();
      wCtx.roundRect(-size * 0.07, gripY - gripH / 2, size * 0.04, gripH, size * 0.005);
      wCtx.fill();
      // Cross-wrap detail
      wCtx.strokeStyle = "#4a3020";
      wCtx.lineWidth = 1 * zoom;
      for (let w = 0; w < 4; w++) {
        const wy = gripY - gripH / 2 + w * gripH / 3;
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.07, wy);
        wCtx.lineTo(-size * 0.03, wy + gripH / 6);
        wCtx.stroke();
      }

      // Arrow rest/shelf
      wCtx.fillStyle = leather;
      wCtx.fillRect(-size * 0.065, gripY - size * 0.005, size * 0.025, size * 0.01);

      // Bowstring — proper catenary with pull animation
      const stringPull = isAttacking ? attackIntensity * size * 0.06 : size * 0.005;
      wCtx.strokeStyle = "#c0b8a0";
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(size * 0.055, -bowH * 0.495);
      wCtx.quadraticCurveTo(stringPull - size * 0.04, 0, size * 0.055, bowH * 0.495);
      wCtx.stroke();

      // Nocking point marker
      wCtx.fillStyle = "#dc2626";
      const nockX = stringPull - size * 0.035;
      wCtx.beginPath();
      wCtx.arc(nockX, 0, size * 0.004, 0, TAU);
      wCtx.fill();

      // --- NOCKED ARROW ---
      const arrowStart = nockX;
      const arrowEnd = arrowStart - size * 0.28;
      // Shaft
      const arrowShaftGrad = wCtx.createLinearGradient(arrowStart, 0, arrowEnd, 0);
      arrowShaftGrad.addColorStop(0, "#b89a70");
      arrowShaftGrad.addColorStop(0.5, "#d4bb90");
      arrowShaftGrad.addColorStop(1, "#b89a70");
      wCtx.strokeStyle = arrowShaftGrad;
      wCtx.lineWidth = 2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(arrowStart, 0);
      wCtx.lineTo(arrowEnd, 0);
      wCtx.stroke();

      // Broadhead — detailed leaf-shaped
      const headX = arrowEnd;
      wCtx.fillStyle = "#d0d0d0";
      wCtx.beginPath();
      wCtx.moveTo(headX, 0);
      wCtx.lineTo(headX - size * 0.015, -size * 0.012);
      wCtx.lineTo(headX - size * 0.04, 0);
      wCtx.lineTo(headX - size * 0.015, size * 0.012);
      wCtx.closePath();
      wCtx.fill();
      wCtx.strokeStyle = "#888";
      wCtx.lineWidth = 0.6 * zoom;
      wCtx.stroke();
      // Edge gleam
      wCtx.strokeStyle = "rgba(255,255,255,0.4)";
      wCtx.lineWidth = 0.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(headX - size * 0.005, -size * 0.008);
      wCtx.lineTo(headX - size * 0.035, 0);
      wCtx.stroke();

      // Fletching — 3 vanes
      const fletchStart = arrowStart - size * 0.02;
      const fletchLen = size * 0.04;
      const fletchColors = ["#dc2626", "#e8e0d0", "#e8e0d0"];
      for (let f = 0; f < 3; f++) {
        const fOff = (f - 1) * size * 0.006;
        wCtx.fillStyle = fletchColors[f];
        wCtx.beginPath();
        wCtx.moveTo(fletchStart, fOff);
        wCtx.quadraticCurveTo(fletchStart + fletchLen * 0.5, fOff + size * 0.01, fletchStart + fletchLen, fOff);
        wCtx.quadraticCurveTo(fletchStart + fletchLen * 0.5, fOff - size * 0.004, fletchStart, fOff);
        wCtx.fill();
      }

      // Soul-glow on arrowhead
      setShadowBlur(wCtx, 6 * zoom, accent);
      wCtx.fillStyle = `rgba(16, 185, 129, ${0.4 + Math.sin(time * 5) * 0.2})`;
      wCtx.beginPath();
      wCtx.arc(headX - size * 0.02, 0, size * 0.01, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);

      // Green rune glow lines on bow limbs
      wCtx.strokeStyle = `rgba(16, 185, 129, ${0.25 + Math.sin(time * 3) * 0.15})`;
      wCtx.lineWidth = 1.2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.06, -bowH * 0.25);
      wCtx.lineTo(-size * 0.08, -bowH * 0.15);
      wCtx.stroke();
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.06, bowH * 0.25);
      wCtx.lineTo(-size * 0.08, bowH * 0.15);
      wCtx.stroke();
    },
  });

  // HEAD — Leather ranger hood/cowl (NOT armored helm)
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;
  // Face
  const faceGrad = ctx.createRadialGradient(headX, headY + size * 0.02, 0, headX, headY, size * 0.13);
  faceGrad.addColorStop(0, "#e8d0b8");
  faceGrad.addColorStop(0.7, "#c4a080");
  faceGrad.addColorStop(1, "#a08060");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.13, 0, TAU);
  ctx.fill();
  // Eyes — focused/squinting
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.045, headY - size * 0.01, size * 0.018, size * 0.01, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.045, headY - size * 0.01, size * 0.008, 0, TAU);
    ctx.fill();
  }
  // Mouth — determined line
  ctx.strokeStyle = "#8a6a4e";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.03, headY + size * 0.05);
  ctx.lineTo(headX + size * 0.03, headY + size * 0.05);
  ctx.stroke();

  // Leather hood
  const hoodGrad = ctx.createRadialGradient(headX, headY - size * 0.05, 0, headX, headY, size * 0.2);
  hoodGrad.addColorStop(0, "#1a3a1c");
  hoodGrad.addColorStop(0.5, "#2d4a2e");
  hoodGrad.addColorStop(1, "#1a3a1c");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.16, headY + size * 0.06);
  ctx.quadraticCurveTo(headX - size * 0.2, headY - size * 0.05, headX - size * 0.12, headY - size * 0.16);
  ctx.quadraticCurveTo(headX, headY - size * 0.22, headX + size * 0.12, headY - size * 0.16);
  ctx.quadraticCurveTo(headX + size * 0.2, headY - size * 0.05, headX + size * 0.16, headY + size * 0.06);
  ctx.quadraticCurveTo(headX + size * 0.12, headY + size * 0.01, headX + size * 0.1, headY - size * 0.03);
  ctx.quadraticCurveTo(headX, headY - size * 0.08, headX - size * 0.1, headY - size * 0.03);
  ctx.quadraticCurveTo(headX - size * 0.12, headY + size * 0.01, headX - size * 0.16, headY + size * 0.06);
  ctx.fill();

  // Hood edge accent
  ctx.strokeStyle = accentDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, headY + size * 0.04);
  ctx.quadraticCurveTo(headX, headY - size * 0.06, headX + size * 0.14, headY + size * 0.04);
  ctx.stroke();

  // Feather tucked in hood
  ctx.save();
  ctx.translate(headX + size * 0.1, headY - size * 0.12);
  ctx.rotate(0.4);
  const featherGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.14);
  featherGrad.addColorStop(0, accent);
  featherGrad.addColorStop(1, accentDark);
  ctx.fillStyle = featherGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.015, -size * 0.07, size * 0.005, -size * 0.14);
  ctx.quadraticCurveTo(-size * 0.008, -size * 0.07, 0, 0);
  ctx.fill();
  ctx.strokeStyle = accentDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.002, 0);
  ctx.lineTo(size * 0.003, -size * 0.13);
  ctx.stroke();
  ctx.restore();

  // Effects
  drawArcaneSparkles(ctx, cx, y - size * 0.2, size, time, zoom, {
    color: accent,
    count: 4,
    sparkleSize: 0.01,
  });

  if (isAttacking) {
    ctx.strokeStyle = `rgba(16, 185, 129, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let r = 0; r < 3; r++) {
      const ringR = size * (0.12 + r * 0.08) * (1 - attackIntensity * 0.3);
      ctx.beginPath();
      ctx.arc(cx + size * 0.3, y - size * 0.3, ringR, 0, TAU);
      ctx.stroke();
    }
  }
}

// ============================================================================
// 2. MAGE — ROBED ARCHMAGE
//    Flowing robes, wizard hat, crystal clasps, staff + spellbook
// ============================================================================

export function drawMageEnemy(
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
  size *= 1.7;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 1.8, 0.025);
  const sway = getIdleSway(time, 0.7, 1.5, 1.0);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const arcanePulse = 0.6 + Math.sin(time * 4) * 0.3;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.52, size * 0.3, size * 0.3 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Arcane ground circle
  ctx.strokeStyle = `rgba(139, 92, 246, ${arcanePulse * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.48, size * 0.3, size * 0.3 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();
  for (let r = 0; r < 6; r++) {
    const runeAngle = (r * TAU) / 6 + time * 0.3;
    const rx = cx + Math.cos(runeAngle) * size * 0.26;
    const ry = y + size * 0.48 + Math.sin(runeAngle) * size * 0.26 * ISO_Y_RATIO;
    ctx.fillStyle = `rgba(139, 92, 246, ${arcanePulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Legs (hidden under robes mostly)
  drawPathLegs(ctx, cx, y + size * 0.12 - bodyBob, size, time, zoom, {
    color: accentDark,
    colorDark: "#1a1030",
    footColor: "#2a1838",
    strideSpeed: 2.0,
    strideAmt: 0.12,
    legLen: 0.15,
    width: 0.045,
    style: "fleshy",
  });

  // Flowing arcane robes (NOT plate — full robe body)
  const robeGrad = ctx.createLinearGradient(cx - size * 0.22, y - size * 0.35, cx + size * 0.22, y + size * 0.35);
  robeGrad.addColorStop(0, accentDark);
  robeGrad.addColorStop(0.3, accent);
  robeGrad.addColorStop(0.6, accentDark);
  robeGrad.addColorStop(1, "#0a0618");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.2, y - size * 0.05 - bodyBob, cx - size * 0.22, y + size * 0.15);
  // Flowing hem
  for (let h = 0; h < 6; h++) {
    const hx = cx - size * 0.22 + h * size * 0.088;
    const hy = y + size * 0.15 + Math.sin(time * 2.5 + h * 1.2) * size * 0.015 + (h % 2) * size * 0.02;
    ctx.lineTo(hx, hy);
  }
  ctx.quadraticCurveTo(cx + size * 0.2, y - size * 0.05 - bodyBob, cx + size * 0.14, y - size * 0.34 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Robe V-neck opening showing inner tunic
  ctx.fillStyle = "#1a1030";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.06, y - size * 0.34 - bodyBob);
  ctx.lineTo(cx, y - size * 0.18 - bodyBob);
  ctx.lineTo(cx + size * 0.06, y - size * 0.34 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Arcane rune trim on robe edges
  ctx.strokeStyle = `rgba(251, 191, 36, ${arcanePulse * 0.4})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, y - size * 0.2 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.18, y + size * 0.05, cx - size * 0.2, y + size * 0.14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.14, y - size * 0.2 - bodyBob);
  ctx.quadraticCurveTo(cx + size * 0.18, y + size * 0.05, cx + size * 0.2, y + size * 0.14);
  ctx.stroke();

  // Crystal shoulder clasps (NOT plate pauldrons)
  for (const side of [-1, 1]) {
    const claspX = cx + side * size * 0.14;
    const claspY = y - size * 0.33 - bodyBob;
    setShadowBlur(ctx, 4 * zoom, accent);
    const claspGrad = ctx.createRadialGradient(claspX, claspY, 0, claspX, claspY, size * 0.025);
    claspGrad.addColorStop(0, bodyColorLight || "#c4b5fd");
    claspGrad.addColorStop(0.6, accent);
    claspGrad.addColorStop(1, accentDark);
    ctx.fillStyle = claspGrad;
    ctx.beginPath();
    ctx.moveTo(claspX, claspY - size * 0.025);
    ctx.lineTo(claspX + size * 0.02, claspY);
    ctx.lineTo(claspX, claspY + size * 0.025);
    ctx.lineTo(claspX - size * 0.02, claspY);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);
    ctx.strokeStyle = "#d4a040";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
  }

  // Sash belt (NOT metal belt)
  const sashGrad = ctx.createLinearGradient(cx - size * 0.15, y - size * 0.04, cx + size * 0.15, y - size * 0.04);
  sashGrad.addColorStop(0, "#d4a040");
  sashGrad.addColorStop(0.5, "#f0c860");
  sashGrad.addColorStop(1, "#d4a040");
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.13, y - size * 0.06 - bodyBob);
  ctx.lineTo(cx + size * 0.13, y - size * 0.06 - bodyBob);
  ctx.lineTo(cx + size * 0.12, y - size * 0.02 - bodyBob);
  ctx.lineTo(cx - size * 0.12, y - size * 0.02 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Sash tail
  ctx.fillStyle = "#d4a040";
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.08, y - size * 0.04 - bodyBob);
  ctx.quadraticCurveTo(cx + size * 0.12, y + size * 0.05, cx + size * 0.1, y + size * 0.1);
  ctx.lineTo(cx + size * 0.07, y + size * 0.08);
  ctx.quadraticCurveTo(cx + size * 0.1, y + size * 0.03, cx + size * 0.06, y - size * 0.04 - bodyBob);
  ctx.fill();

  // Potion vials on sash
  const potionColors = ["#ef4444", "#3b82f6", "#10b981"];
  for (let p = 0; p < 3; p++) {
    const px = cx - size * 0.06 + p * size * 0.06;
    const py = y - size * 0.01 - bodyBob;
    ctx.fillStyle = "#888";
    ctx.fillRect(px - size * 0.006, py - size * 0.015, size * 0.012, size * 0.004);
    ctx.fillStyle = potionColors[p];
    ctx.beginPath();
    ctx.ellipse(px, py, size * 0.01, size * 0.015, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // Left arm — SPELLBOOK
  const bookForeLen = 0.14;
  drawPathArm(ctx, cx - size * 0.2, y - size * 0.28 - bodyBob, size, time, zoom, -1, {
    color: accentDark,
    colorDark: "#1a1030",
    handColor: "#d8c0a8",
    upperLen: 0.15,
    foreLen: bookForeLen,
    width: 0.048,
    shoulderAngle: 0.55 + Math.sin(time * 1.0) * 0.04 + (isAttacking ? -attackIntensity * 0.35 : 0),
    elbowAngle: 0.4 + (isAttacking ? -attackIntensity * 0.25 : 0),
    style: "fleshy",
    onWeapon: (wCtx) => {
      const handY = bookForeLen * size;
      wCtx.translate(0, handY * 0.5);
      const bW = size * 0.09;
      const bH = size * 0.07;
      // Thick leather cover (back)
      const coverGrad = wCtx.createLinearGradient(-bW, -bH, bW, bH);
      coverGrad.addColorStop(0, "#5a2d0c");
      coverGrad.addColorStop(0.3, "#7a4520");
      coverGrad.addColorStop(0.7, "#5a2d0c");
      coverGrad.addColorStop(1, "#3a1808");
      wCtx.fillStyle = coverGrad;
      wCtx.beginPath();
      wCtx.roundRect(-bW - size * 0.005, -bH - size * 0.005, bW * 2 + size * 0.01, bH * 2 + size * 0.01, size * 0.006);
      wCtx.fill();
      // Pages (open book, left page slightly curled)
      wCtx.fillStyle = "#f8f0d8";
      wCtx.beginPath();
      wCtx.moveTo(-bW + size * 0.005, -bH + size * 0.005);
      wCtx.lineTo(-size * 0.003, -bH + size * 0.005);
      wCtx.quadraticCurveTo(-size * 0.006, 0, -size * 0.003, bH - size * 0.005);
      wCtx.lineTo(-bW + size * 0.005, bH - size * 0.005);
      wCtx.closePath();
      wCtx.fill();
      // Right page
      wCtx.fillStyle = "#f5eed0";
      wCtx.beginPath();
      wCtx.moveTo(size * 0.003, -bH + size * 0.005);
      wCtx.lineTo(bW - size * 0.005, -bH + size * 0.005);
      wCtx.lineTo(bW - size * 0.005, bH - size * 0.005);
      wCtx.lineTo(size * 0.003, bH - size * 0.005);
      wCtx.quadraticCurveTo(size * 0.006, 0, size * 0.003, -bH + size * 0.005);
      wCtx.fill();
      // Spine (raised center ridge)
      const spineGrad = wCtx.createLinearGradient(-size * 0.008, 0, size * 0.008, 0);
      spineGrad.addColorStop(0, "#3a1808");
      spineGrad.addColorStop(0.5, "#6a3818");
      spineGrad.addColorStop(1, "#3a1808");
      wCtx.fillStyle = spineGrad;
      wCtx.fillRect(-size * 0.005, -bH - size * 0.005, size * 0.01, bH * 2 + size * 0.01);
      // Gold corner clasps
      wCtx.fillStyle = "#d4a040";
      for (const cx of [-1, 1]) {
        for (const cy of [-1, 1]) {
          wCtx.beginPath();
          wCtx.moveTo(cx * (bW + size * 0.002), cy * (bH + size * 0.002));
          wCtx.lineTo(cx * (bW - size * 0.012), cy * (bH + size * 0.002));
          wCtx.lineTo(cx * (bW + size * 0.002), cy * (bH - size * 0.012));
          wCtx.closePath();
          wCtx.fill();
        }
      }
      // Arcane text lines (left page)
      wCtx.strokeStyle = `rgba(139, 92, 246, ${arcanePulse * 0.5})`;
      wCtx.lineWidth = 0.8 * zoom;
      for (let line = 0; line < 4; line++) {
        const ly = -bH * 0.5 + line * size * 0.02;
        const lw = bW * 0.7 - line * size * 0.005;
        wCtx.beginPath();
        wCtx.moveTo(-bW + size * 0.015, ly);
        wCtx.lineTo(-bW + size * 0.015 + lw, ly);
        wCtx.stroke();
      }
      // Rune circle on right page
      wCtx.strokeStyle = `rgba(139, 92, 246, ${arcanePulse * 0.6})`;
      wCtx.lineWidth = 1 * zoom;
      wCtx.beginPath();
      wCtx.arc(bW * 0.45, 0, size * 0.025, 0, TAU);
      wCtx.stroke();
      wCtx.fillStyle = `rgba(139, 92, 246, ${arcanePulse * 0.3})`;
      wCtx.fill();
      // Tiny star in rune circle
      wCtx.fillStyle = `rgba(200, 180, 255, ${arcanePulse * 0.7})`;
      wCtx.beginPath();
      wCtx.arc(bW * 0.45, 0, size * 0.008, 0, TAU);
      wCtx.fill();
      // Page edge glow
      wCtx.strokeStyle = `rgba(139, 92, 246, ${arcanePulse * 0.2})`;
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.roundRect(-bW - size * 0.005, -bH - size * 0.005, bW * 2 + size * 0.01, bH * 2 + size * 0.01, size * 0.006);
      wCtx.stroke();
    },
  });

  // Right arm — ARCANE STAFF
  const staffForeLen = 0.15;
  drawPathArm(ctx, cx + size * 0.2, y - size * 0.28 - bodyBob, size, time, zoom, 1, {
    color: accentDark,
    colorDark: "#1a1030",
    handColor: "#d8c0a8",
    upperLen: 0.16,
    foreLen: staffForeLen,
    width: 0.048,
    shoulderAngle: -(0.65 + (isAttacking ? attackIntensity * 0.2 : 0)) + Math.sin(time * 1.3) * 0.03,
    elbowAngle: -0.3,
    style: "fleshy",
    onWeapon: (wCtx) => {
      const handY = staffForeLen * size;
      wCtx.translate(0, handY * 0.5);
      const shaftH = size * 0.6;
      // Ornate wooden shaft with spiral grain
      const shaftGrad = wCtx.createLinearGradient(-size * 0.015, 0, size * 0.015, 0);
      shaftGrad.addColorStop(0, "#3a2818");
      shaftGrad.addColorStop(0.3, "#8b6e5a");
      shaftGrad.addColorStop(0.5, "#a0805a");
      shaftGrad.addColorStop(0.7, "#8b6e5a");
      shaftGrad.addColorStop(1, "#3a2818");
      wCtx.strokeStyle = shaftGrad;
      wCtx.lineWidth = 4.5 * zoom;
      wCtx.lineCap = "round";
      wCtx.beginPath();
      wCtx.moveTo(0, size * 0.08);
      wCtx.lineTo(0, -shaftH);
      wCtx.stroke();
      wCtx.lineCap = "butt";
      // Spiral grain lines
      wCtx.strokeStyle = "rgba(80,50,25,0.25)";
      wCtx.lineWidth = 0.7 * zoom;
      for (let g = 0; g < 12; g++) {
        const gy = size * 0.06 - g * shaftH / 10;
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.015, gy);
        wCtx.quadraticCurveTo(0, gy - size * 0.01, size * 0.015, gy - size * 0.005);
        wCtx.stroke();
      }
      // Gold filigree bands (3 bands)
      for (let b = 0; b < 3; b++) {
        const by = -shaftH * 0.15 - b * shaftH * 0.25;
        const bandGrad = wCtx.createLinearGradient(-size * 0.022, by, size * 0.022, by);
        bandGrad.addColorStop(0, "#8a6818");
        bandGrad.addColorStop(0.5, "#e8c860");
        bandGrad.addColorStop(1, "#8a6818");
        wCtx.fillStyle = bandGrad;
        wCtx.fillRect(-size * 0.022, by - size * 0.004, size * 0.044, size * 0.008);
        // Tiny gem on center band
        if (b === 1) {
          wCtx.fillStyle = accent;
          wCtx.beginPath();
          wCtx.arc(0, by, size * 0.005, 0, TAU);
          wCtx.fill();
        }
      }
      // Iron foot cap at bottom
      wCtx.fillStyle = "#6a6a6a";
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.012, size * 0.07);
      wCtx.lineTo(0, size * 0.1);
      wCtx.lineTo(size * 0.012, size * 0.07);
      wCtx.closePath();
      wCtx.fill();
      // Ornate crown/cradle holding the crystal (prongs)
      wCtx.fillStyle = "#d4a040";
      for (const ps of [-1, 0, 1]) {
        wCtx.beginPath();
        wCtx.moveTo(ps * size * 0.01, -shaftH);
        wCtx.quadraticCurveTo(ps * size * 0.025, -shaftH - size * 0.04, ps * size * 0.018, -shaftH - size * 0.06);
        wCtx.lineWidth = 2 * zoom;
        wCtx.strokeStyle = "#d4a040";
        wCtx.stroke();
      }
      // Main crystal — faceted gem
      setShadowBlur(wCtx, 10 * zoom, accent);
      const crystalGrad = wCtx.createRadialGradient(0, -shaftH - size * 0.06, 0, 0, -shaftH - size * 0.06, size * 0.05);
      crystalGrad.addColorStop(0, "#e8e0ff");
      crystalGrad.addColorStop(0.3, bodyColorLight || "#c4b5fd");
      crystalGrad.addColorStop(0.6, accent);
      crystalGrad.addColorStop(1, accentDark);
      wCtx.fillStyle = crystalGrad;
      wCtx.beginPath();
      wCtx.moveTo(0, -shaftH - size * 0.1);
      wCtx.lineTo(size * 0.035, -shaftH - size * 0.065);
      wCtx.lineTo(size * 0.04, -shaftH - size * 0.04);
      wCtx.lineTo(size * 0.025, -shaftH - size * 0.01);
      wCtx.lineTo(-size * 0.025, -shaftH - size * 0.01);
      wCtx.lineTo(-size * 0.04, -shaftH - size * 0.04);
      wCtx.lineTo(-size * 0.035, -shaftH - size * 0.065);
      wCtx.closePath();
      wCtx.fill();
      // Facet highlights
      wCtx.fillStyle = "rgba(255,255,255,0.35)";
      wCtx.beginPath();
      wCtx.moveTo(0, -shaftH - size * 0.1);
      wCtx.lineTo(size * 0.015, -shaftH - size * 0.065);
      wCtx.lineTo(-size * 0.01, -shaftH - size * 0.04);
      wCtx.lineTo(-size * 0.025, -shaftH - size * 0.06);
      wCtx.closePath();
      wCtx.fill();
      // Inner gleam
      wCtx.fillStyle = "rgba(255,255,255,0.5)";
      wCtx.beginPath();
      wCtx.arc(-size * 0.008, -shaftH - size * 0.065, size * 0.01, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);
      // Energy wisps from crystal
      wCtx.strokeStyle = `rgba(139, 92, 246, ${arcanePulse * 0.4})`;
      wCtx.lineWidth = 1 * zoom;
      for (let w = 0; w < 3; w++) {
        const wAngle = time * 3 + w * TAU / 3;
        const wR = size * 0.06;
        wCtx.beginPath();
        wCtx.moveTo(Math.cos(wAngle) * size * 0.02, -shaftH - size * 0.06 + Math.sin(wAngle) * size * 0.02);
        wCtx.quadraticCurveTo(
          Math.cos(wAngle + 0.5) * wR, -shaftH - size * 0.06 + Math.sin(wAngle + 0.5) * wR * 0.6,
          Math.cos(wAngle + 1) * wR * 0.8, -shaftH - size * 0.06 + Math.sin(wAngle + 1) * wR * 0.5,
        );
        wCtx.stroke();
      }
    },
  });

  // HEAD — Tall wizard hat directly (NO armored helm)
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;
  // Face
  const faceGrad = ctx.createRadialGradient(headX, headY + size * 0.02, 0, headX, headY, size * 0.12);
  faceGrad.addColorStop(0, "#e8d8c8");
  faceGrad.addColorStop(0.7, "#c8b0a0");
  faceGrad.addColorStop(1, "#a89080");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.12, 0, TAU);
  ctx.fill();
  // Wise old eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#f8f0e8";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.04, headY - size * 0.015, size * 0.02, size * 0.015, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.04, headY - size * 0.015, size * 0.01, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.04, headY - size * 0.015, size * 0.005, 0, TAU);
    ctx.fill();
  }
  // Long wizard beard
  ctx.fillStyle = "#c0bab0";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY + size * 0.06);
  ctx.quadraticCurveTo(headX - size * 0.04, headY + size * 0.18, headX, headY + size * 0.22 + Math.sin(time * 2) * size * 0.01);
  ctx.quadraticCurveTo(headX + size * 0.04, headY + size * 0.18, headX + size * 0.06, headY + size * 0.06);
  ctx.fill();
  ctx.strokeStyle = "#a0988e";
  ctx.lineWidth = 0.7 * zoom;
  for (let b = 0; b < 4; b++) {
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.03 + b * size * 0.02, headY + size * 0.08);
    ctx.lineTo(headX - size * 0.025 + b * size * 0.02, headY + size * 0.2 + Math.sin(time * 2 + b) * size * 0.01);
    ctx.stroke();
  }

  // Wizard hat
  const hatBaseY = headY - size * 0.1;
  ctx.fillStyle = accentDark;
  ctx.beginPath();
  ctx.ellipse(headX, hatBaseY, size * 0.2, size * 0.055, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#d4a040";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  const hatGrad = ctx.createLinearGradient(headX - size * 0.12, hatBaseY, headX + size * 0.12, hatBaseY - size * 0.35);
  hatGrad.addColorStop(0, accentDark);
  hatGrad.addColorStop(0.4, accent);
  hatGrad.addColorStop(1, accentDark);
  ctx.fillStyle = hatGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.12, hatBaseY);
  ctx.quadraticCurveTo(headX - size * 0.07, hatBaseY - size * 0.18, headX + size * 0.05, hatBaseY - size * 0.35);
  ctx.quadraticCurveTo(headX + size * 0.1, hatBaseY - size * 0.18, headX + size * 0.12, hatBaseY);
  ctx.closePath();
  ctx.fill();
  // Gold band with stars
  ctx.strokeStyle = "#d4a040";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(headX, hatBaseY - size * 0.02, size * 0.11, size * 0.03, 0, 0, TAU);
  ctx.stroke();
  // Star on tip
  setShadowBlur(ctx, 5 * zoom, "#fbbf24");
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(headX + size * 0.05, hatBaseY - size * 0.35, size * 0.015, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  // Small stars embroidered
  ctx.fillStyle = `rgba(251, 191, 36, ${arcanePulse * 0.5})`;
  for (let s = 0; s < 3; s++) {
    const sx = headX - size * 0.04 + s * size * 0.04;
    const sy = hatBaseY - size * 0.08 - s * size * 0.06;
    ctx.beginPath();
    ctx.arc(sx, sy, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // Orbiting arcane orbs
  for (let orb = 0; orb < 3; orb++) {
    const orbAngle = time * 1.5 + orb * TAU / 3;
    const orbDist = size * 0.35;
    const ox = cx + Math.cos(orbAngle) * orbDist;
    const oy = y - size * 0.2 + Math.sin(orbAngle) * orbDist * 0.4 - bodyBob;
    ctx.fillStyle = `rgba(139, 92, 246, ${arcanePulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(ox, oy, size * 0.012, 0, TAU);
    ctx.fill();
  }

  drawArcaneSparkles(ctx, cx, y - size * 0.3, size, time, zoom, { color: accent, count: 6, sparkleSize: 0.015 });

  if (isAttacking) {
    ctx.strokeStyle = `rgba(139, 92, 246, ${attackIntensity * 0.7})`;
    ctx.lineWidth = 2.5 * zoom;
    for (let r = 0; r < 3; r++) {
      const ringR = size * (0.12 + r * 0.08) * (1 - attackIntensity * 0.2);
      ctx.beginPath();
      ctx.arc(cx, y - size * 0.4, ringR, 0, TAU);
      ctx.stroke();
    }
  }
}

// ============================================================================
// 3. CATAPULT — HELLFIRE SIEGE ENGINE (PRESERVED)
// ============================================================================

export function drawCatapultEnemy(
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
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.2)
    : 0.6 + Math.sin(time * 1.0) * 0.3;
  const armAngle =
    Math.sin(time * 1.5) * 0.35 * (1 - chargeLevel * 0.5) +
    (isAttacking ? attackIntensity * 0.8 : -chargeLevel * 0.4);
  const hellGlow = 0.6 + Math.sin(time * 4) * 0.3 + chargeLevel * 0.2;
  const soulWisp = 0.5 + Math.sin(time * 5) * 0.3;
  const fireIntensity = isAttacking
    ? 0.7 + attackIntensity * 0.3
    : 0.3 + chargeLevel * 0.4 + Math.sin(time * 3) * 0.15;

  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.4, size * 0.4 * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const fireGrad = ctx.createRadialGradient(x, y + size * 0.3, 0, x, y + size * 0.3, size * 0.7);
  fireGrad.addColorStop(0, `rgba(220, 38, 38, ${fireIntensity * 0.35})`);
  fireGrad.addColorStop(0.3, `rgba(180, 30, 30, ${fireIntensity * 0.2})`);
  fireGrad.addColorStop(0.6, `rgba(127, 29, 29, ${fireIntensity * 0.1})`);
  fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.6 + ring * 0.35) % 1;
    const ringSize = size * (0.2 + ringPhase * 0.4);
    const ringAlpha = (0.35 - ringPhase * 0.3) * fireIntensity;
    ctx.strokeStyle = `rgba(220, 38, 38, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.48, ringSize, ringSize * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let e = 0; e < 12; e++) {
    const emberPhase = (time * 0.4 + e * 0.1) % 1;
    const emberAngle = (e * Math.PI) / 6 + time * 0.15;
    const emberDist = size * (0.1 + emberPhase * 0.4);
    const ex = x + Math.cos(emberAngle) * emberDist;
    const ey = y + size * 0.2 - emberPhase * size * 0.8;
    const emberAlpha = (1 - emberPhase) * 0.6 * fireIntensity;
    const emberSize = size * 0.015 * (1 - emberPhase * 0.5);
    const emberColors = [`rgba(251, 146, 60, ${emberAlpha})`, `rgba(220, 38, 38, ${emberAlpha})`, `rgba(252, 211, 77, ${emberAlpha})`];
    ctx.fillStyle = emberColors[e % 3];
    ctx.beginPath();
    ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = (crack * Math.PI) / 3 - Math.PI * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.48);
    let cx2 = x, cy2 = y + size * 0.48;
    for (let seg = 0; seg < 4; seg++) {
      cx2 += Math.cos(crackAngle + Math.sin(seg * 0.5) * 0.3) * size * 0.1;
      cy2 += size * 0.015;
      ctx.lineTo(cx2 + Math.sin(seg) * size * 0.025, cy2);
    }
    ctx.stroke();
  }

  drawPathLegs(ctx, x + size * 0.18, y + size * 0.12, size, time, zoom, { color: "#292524", colorDark: "#1c1917", footColor: "#44403c", strideSpeed: 3.5, strideAmt: 0.2, legLen: 0.16, width: 0.055, style: "armored" });

  drawPathArm(ctx, x + size * 0.1, y - size * 0.15, size, time, zoom, -1, { color: "#292524", colorDark: "#1c1917", handColor: "#a8a29e", shoulderAngle: -0.5 + Math.sin(time * 2) * 0.15 + (isAttacking ? -attackIntensity * 0.5 : 0), elbowAngle: 0.9 + Math.sin(time * 2.5 + 1) * 0.2, upperLen: 0.2, foreLen: 0.18, width: 0.06, style: "armored", onWeapon: (wCtx: CanvasRenderingContext2D) => { wCtx.strokeStyle = "#78716c"; wCtx.lineWidth = 3 * zoom; wCtx.beginPath(); wCtx.moveTo(0, 0); wCtx.lineTo(0, -size * 0.18); wCtx.stroke(); wCtx.fillStyle = "#57534e"; wCtx.fillRect(-size * 0.04, -size * 0.2, size * 0.08, size * 0.04); } });
  drawPathArm(ctx, x + size * 0.26, y - size * 0.15, size, time, zoom, 1, { color: "#292524", colorDark: "#1c1917", handColor: "#a8a29e", shoulderAngle: 0.3 + Math.sin(time * 1.5) * 0.06, elbowAngle: 0.5 + Math.sin(time * 2 + 2) * 0.08, upperLen: 0.18, foreLen: 0.16, width: 0.055, style: "armored", onWeapon: (wCtx: CanvasRenderingContext2D) => { wCtx.strokeStyle = "#44403c"; wCtx.lineWidth = 2.5 * zoom; wCtx.beginPath(); wCtx.moveTo(0, 0); wCtx.lineTo(0, -size * 0.12); wCtx.stroke(); wCtx.fillStyle = `rgba(251, 146, 60, ${fireIntensity})`; setShadowBlur(wCtx, 4 * zoom, "#fb923c"); wCtx.beginPath(); wCtx.arc(0, -size * 0.14, size * 0.025, 0, Math.PI * 2); wCtx.fill(); clearShadow(wCtx); } });

  for (let w = 0; w < 2; w++) { const wheelX = w === 0 ? x - size * 0.38 : x + size * 0.38; const wheelGlow = ctx.createRadialGradient(wheelX, y + size * 0.38, 0, wheelX, y + size * 0.38, size * 0.22); wheelGlow.addColorStop(0, `rgba(220, 38, 38, ${hellGlow * 0.2})`); wheelGlow.addColorStop(1, "rgba(220, 38, 38, 0)"); ctx.fillStyle = wheelGlow; ctx.beginPath(); ctx.arc(wheelX, y + size * 0.38, size * 0.22, 0, Math.PI * 2); ctx.fill(); const wheelRingGrad = ctx.createRadialGradient(wheelX, y + size * 0.38, size * 0.12, wheelX, y + size * 0.38, size * 0.18); wheelRingGrad.addColorStop(0, "#44403c"); wheelRingGrad.addColorStop(0.5, "#292524"); wheelRingGrad.addColorStop(1, "#1c1917"); ctx.fillStyle = wheelRingGrad; ctx.strokeStyle = "#1c1917"; ctx.lineWidth = 3 * zoom; ctx.beginPath(); ctx.arc(wheelX, y + size * 0.38, size * 0.17, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#78716c"; ctx.lineWidth = 3 * zoom; for (let i = 0; i < 6; i++) { const angle = (i * Math.PI) / 3 + time * 0.6; ctx.beginPath(); ctx.moveTo(wheelX, y + size * 0.38); ctx.lineTo(wheelX + Math.cos(angle) * size * 0.14, y + size * 0.38 + Math.sin(angle) * size * 0.14); ctx.stroke(); } ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.6})`; for (let i = 0; i < 6; i++) { const angle = (i * Math.PI) / 3 + time * 0.6; ctx.beginPath(); ctx.arc(wheelX + Math.cos(angle) * size * 0.08, y + size * 0.38 + Math.sin(angle) * size * 0.08, size * 0.008, 0, Math.PI * 2); ctx.fill(); } const hubGrad = ctx.createRadialGradient(wheelX, y + size * 0.38, 0, wheelX, y + size * 0.38, size * 0.05); hubGrad.addColorStop(0, "#d6d3d1"); hubGrad.addColorStop(0.6, "#a8a29e"); hubGrad.addColorStop(1, "#78716c"); ctx.fillStyle = hubGrad; ctx.beginPath(); ctx.arc(wheelX, y + size * 0.38, size * 0.05, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`; setShadowBlur(ctx, 3 * zoom, "#dc2626"); ctx.beginPath(); ctx.arc(wheelX - size * 0.02, y + size * 0.37, size * 0.012, 0, Math.PI * 2); ctx.arc(wheelX + size * 0.02, y + size * 0.37, size * 0.012, 0, Math.PI * 2); ctx.fill(); clearShadow(ctx); ctx.fillStyle = "#1c1917"; for (let spike = 0; spike < 8; spike++) { const spikeAngle = (spike * Math.PI) / 4; ctx.beginPath(); ctx.moveTo(wheelX + Math.cos(spikeAngle) * size * 0.15, y + size * 0.38 + Math.sin(spikeAngle) * size * 0.15); ctx.lineTo(wheelX + Math.cos(spikeAngle) * size * 0.22, y + size * 0.38 + Math.sin(spikeAngle) * size * 0.22); ctx.lineTo(wheelX + Math.cos(spikeAngle + 0.1) * size * 0.15, y + size * 0.38 + Math.sin(spikeAngle + 0.1) * size * 0.15); ctx.fill(); } }

  const frameGrad = ctx.createLinearGradient(x - size * 0.45, y, x + size * 0.45, y); frameGrad.addColorStop(0, "#1c1917"); frameGrad.addColorStop(0.15, "#292524"); frameGrad.addColorStop(0.3, "#44403c"); frameGrad.addColorStop(0.5, "#57534e"); frameGrad.addColorStop(0.7, "#44403c"); frameGrad.addColorStop(0.85, "#292524"); frameGrad.addColorStop(1, "#1c1917"); ctx.fillStyle = frameGrad; ctx.fillRect(x - size * 0.45, y + size * 0.08, size * 0.9, size * 0.24); ctx.strokeStyle = "#78716c"; ctx.lineWidth = 1 * zoom; ctx.strokeRect(x - size * 0.45, y + size * 0.08, size * 0.9, size * 0.24); const bandGrad = ctx.createLinearGradient(0, y + size * 0.1, 0, y + size * 0.3); bandGrad.addColorStop(0, "#52525b"); bandGrad.addColorStop(0.5, "#3f3f46"); bandGrad.addColorStop(1, "#27272a"); ctx.fillStyle = bandGrad; ctx.fillRect(x - size * 0.4, y + size * 0.1, size * 0.1, size * 0.2); ctx.fillRect(x + size * 0.3, y + size * 0.1, size * 0.1, size * 0.2); ctx.fillRect(x - size * 0.05, y + size * 0.1, size * 0.1, size * 0.2); ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`; ctx.font = `${size * 0.06}px serif`; ctx.textAlign = "center"; ctx.fillText("◆", x - size * 0.35, y + size * 0.22); ctx.fillText("◆", x, y + size * 0.22); ctx.fillText("◆", x + size * 0.35, y + size * 0.22); ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`; ctx.lineWidth = 1 * zoom; ctx.beginPath(); ctx.moveTo(x - size * 0.42, y + size * 0.2); ctx.lineTo(x - size * 0.05, y + size * 0.2); ctx.moveTo(x + size * 0.05, y + size * 0.2); ctx.lineTo(x + size * 0.42, y + size * 0.2); ctx.stroke();

  const plateGrad = ctx.createLinearGradient(x - size * 0.12, y + size * 0.12, x + size * 0.12, y + size * 0.28); plateGrad.addColorStop(0, "#71717a"); plateGrad.addColorStop(0.5, "#52525b"); plateGrad.addColorStop(1, "#3f3f46"); ctx.fillStyle = plateGrad; ctx.beginPath(); ctx.moveTo(x - size * 0.1, y + size * 0.14); ctx.lineTo(x + size * 0.1, y + size * 0.14); ctx.lineTo(x + size * 0.08, y + size * 0.26); ctx.lineTo(x - size * 0.08, y + size * 0.26); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#a1a1aa"; ctx.lineWidth = 1 * zoom; ctx.stroke(); ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`; ctx.beginPath(); ctx.arc(x, y + size * 0.2, size * 0.015, 0, Math.PI * 2); ctx.fill();

  ctx.save(); ctx.translate(x, y + size * 0.18); ctx.rotate(-0.85 + armAngle); const armGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.65); armGrad.addColorStop(0, "#44403c"); armGrad.addColorStop(0.3, "#57534e"); armGrad.addColorStop(0.5, "#78716c"); armGrad.addColorStop(0.7, "#57534e"); armGrad.addColorStop(1, "#44403c"); ctx.fillStyle = armGrad; ctx.fillRect(-size * 0.06, -size * 0.65, size * 0.12, size * 0.65); ctx.strokeStyle = "#a8a29e"; ctx.lineWidth = 2 * zoom; ctx.beginPath(); ctx.moveTo(-size * 0.04, 0); ctx.lineTo(-size * 0.04, -size * 0.6); ctx.moveTo(size * 0.04, 0); ctx.lineTo(size * 0.04, -size * 0.6); ctx.stroke(); ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.7})`; ctx.lineWidth = 1.5 * zoom; ctx.beginPath(); ctx.moveTo(0, -size * 0.1); ctx.quadraticCurveTo(-size * 0.03, -size * 0.35, 0, -size * 0.55); ctx.stroke(); ctx.fillStyle = "#3f3f46"; ctx.fillRect(-size * 0.08, -size * 0.68, size * 0.16, size * 0.1); ctx.fillStyle = "#a8a29e"; ctx.beginPath(); ctx.arc(0, -size * 0.72, size * 0.05, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#292524"; ctx.beginPath(); ctx.arc(0, -size * 0.64, size * 0.14, 0, Math.PI); ctx.fill(); ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`; setShadowBlur(ctx, 10 * zoom, "#dc2626"); ctx.beginPath(); ctx.arc(0, -size * 0.6, size * 0.1, 0, Math.PI * 2); ctx.fill(); for (let flame = 0; flame < 4; flame++) { const fAngle = (flame * Math.PI) / 2 + time * 3; const fDist = size * 0.08 + Math.sin(time * 6 + flame) * size * 0.03; const fx = Math.cos(fAngle) * fDist * 0.5; const fy = -size * 0.6 - Math.abs(Math.sin(time * 5 + flame * 1.5)) * size * 0.08; ctx.fillStyle = `rgba(251, 146, 60, ${hellGlow * 0.6})`; ctx.beginPath(); ctx.moveTo(fx - size * 0.02, -size * 0.58); ctx.quadraticCurveTo(fx, fy, fx + size * 0.02, -size * 0.58); ctx.fill(); } const skullGrad = ctx.createRadialGradient(0, -size * 0.58, 0, 0, -size * 0.58, size * 0.07); skullGrad.addColorStop(0, "#f5f5f4"); skullGrad.addColorStop(0.6, "#e7e5e4"); skullGrad.addColorStop(1, "#a8a29e"); ctx.fillStyle = skullGrad; ctx.beginPath(); ctx.arc(0, -size * 0.58, size * 0.07, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#1c1917"; ctx.beginPath(); ctx.arc(-size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2); ctx.arc(size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#44403c"; ctx.beginPath(); ctx.moveTo(0, -size * 0.57); ctx.lineTo(-size * 0.01, -size * 0.55); ctx.lineTo(size * 0.01, -size * 0.55); ctx.fill(); clearShadow(ctx); ctx.restore();

  ctx.strokeStyle = `rgba(220, 38, 38, ${soulWisp * 0.7})`; ctx.lineWidth = 2.5 * zoom; ctx.beginPath(); ctx.moveTo(x - size * 0.32, y + size * 0.22); ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.05, x, y - size * 0.15); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + size * 0.32, y + size * 0.22); ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.05, x, y - size * 0.15); ctx.stroke(); ctx.strokeStyle = "#57534e"; ctx.lineWidth = 1.5 * zoom; for (let side = 0; side < 2; side++) { const dir = side === 0 ? -1 : 1; for (let link = 0; link < 4; link++) { const linkX = x + dir * (size * 0.28 - link * size * 0.07); const linkY = y + size * 0.15 - link * size * 0.07; ctx.beginPath(); ctx.ellipse(linkX, linkY, size * 0.025, size * 0.015, 0.5 * dir, 0, Math.PI * 2); ctx.stroke(); } } ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`; ctx.beginPath(); ctx.arc(x - size * 0.16, y + size * 0.07, size * 0.01, 0, Math.PI * 2); ctx.arc(x + size * 0.16, y + size * 0.07, size * 0.01, 0, Math.PI * 2); ctx.fill();

  const crewRobeGrad = ctx.createLinearGradient(x + size * 0.08, y - size * 0.06, x + size * 0.28, y - size * 0.06); crewRobeGrad.addColorStop(0, "#1c1917"); crewRobeGrad.addColorStop(0.5, "#292524"); crewRobeGrad.addColorStop(1, "#1c1917"); ctx.fillStyle = crewRobeGrad; ctx.beginPath(); ctx.ellipse(x + size * 0.18, y - size * 0.06, size * 0.1, size * 0.14, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#a8a29e"; ctx.lineWidth = 2.5 * zoom; ctx.beginPath(); ctx.moveTo(x + size * 0.1, y - size * 0.1); ctx.quadraticCurveTo(x + size * 0.05, y - size * 0.05, x + size * 0.02, y + size * 0.08); ctx.stroke(); ctx.fillStyle = "#a8a29e"; ctx.beginPath(); ctx.arc(x + size * 0.02, y + size * 0.08, size * 0.025, 0, Math.PI * 2); ctx.fill(); const skullHeadGrad = ctx.createRadialGradient(x + size * 0.18, y - size * 0.24, 0, x + size * 0.18, y - size * 0.24, size * 0.08); skullHeadGrad.addColorStop(0, "#d6d3d1"); skullHeadGrad.addColorStop(0.6, "#a8a29e"); skullHeadGrad.addColorStop(1, "#78716c"); ctx.fillStyle = skullHeadGrad; ctx.beginPath(); ctx.arc(x + size * 0.18, y - size * 0.24, size * 0.08, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#78716c"; ctx.lineWidth = 1 * zoom; ctx.beginPath(); ctx.moveTo(x + size * 0.16, y - size * 0.3); ctx.lineTo(x + size * 0.18, y - size * 0.25); ctx.lineTo(x + size * 0.15, y - size * 0.22); ctx.stroke(); const helmGrad = ctx.createLinearGradient(x + size * 0.09, y - size * 0.36, x + size * 0.27, y - size * 0.28); helmGrad.addColorStop(0, "#3f3f46"); helmGrad.addColorStop(0.5, "#52525b"); helmGrad.addColorStop(1, "#3f3f46"); ctx.fillStyle = helmGrad; ctx.beginPath(); ctx.arc(x + size * 0.18, y - size * 0.28, size * 0.09, Math.PI, 0); ctx.fill(); ctx.fillStyle = "#292524"; ctx.beginPath(); ctx.moveTo(x + size * 0.18, y - size * 0.38); ctx.lineTo(x + size * 0.15, y - size * 0.28); ctx.lineTo(x + size * 0.21, y - size * 0.28); ctx.fill(); ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`; setShadowBlur(ctx, 5 * zoom, "#dc2626"); ctx.beginPath(); ctx.arc(x + size * 0.16, y - size * 0.25, size * 0.015, 0, Math.PI * 2); ctx.arc(x + size * 0.2, y - size * 0.25, size * 0.015, 0, Math.PI * 2); ctx.fill(); clearShadow(ctx); ctx.strokeStyle = "#a8a29e"; ctx.lineWidth = 1.5 * zoom; ctx.beginPath(); ctx.arc(x + size * 0.18, y - size * 0.2, size * 0.04, 0.2, Math.PI - 0.2); ctx.stroke();

  drawPulsingGlowRings(ctx, x, y - size * 0.1, size * 0.18, time, zoom, { color: "rgba(220, 38, 38, 0.4)", count: 3, speed: 2, maxAlpha: 0.4, expansion: 1.5 });
  drawShiftingSegments(ctx, x, y + size * 0.1, size, time, zoom, { color: "#78716c", colorAlt: "#a8a29e", count: 5, orbitRadius: 0.4, segmentSize: 0.04, orbitSpeed: 1.0, shape: "diamond" });
}

// ============================================================================
// 4. WARLOCK — BONE NECROMANCER
//    Skull helm, rib-cage armor, bone spikes, tattered dark robes
// ============================================================================

export function drawWarlockEnemy(
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
  size *= 1.7;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 1.5, 0.02);
  const sway = getIdleSway(time, 0.6, 1.0, 1.2);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const bone = "#d6cfc0";
  const boneMid = "#a89880";
  const boneDark = "#685840";
  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const voidPulse = 0.5 + Math.sin(time * 3.5) * 0.4;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.52, size * 0.3, size * 0.3 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Void domain aura
  const voidGrad = ctx.createRadialGradient(cx, y + size * 0.3, 0, cx, y + size * 0.3, size * 0.45);
  voidGrad.addColorStop(0, `rgba(76, 29, 149, ${voidPulse * 0.2})`);
  voidGrad.addColorStop(0.6, `rgba(46, 16, 101, ${voidPulse * 0.08})`);
  voidGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.3, size * 0.45, size * 0.45 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Tattered dark robes (behind body, reaching to ground)
  ctx.fillStyle = "#0a0618";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.2, y - size * 0.3 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.28, y + size * 0.1, cx - size * 0.24, y + size * 0.35);
  for (let t = 0; t < 7; t++) {
    const tx = cx - size * 0.24 + t * size * 0.08;
    const ty = y + size * 0.35 + Math.sin(time * 2 + t * 0.9) * size * 0.02 + (t % 2) * size * 0.04;
    ctx.lineTo(tx, ty);
  }
  ctx.quadraticCurveTo(cx + size * 0.28, y + size * 0.1, cx + size * 0.2, y - size * 0.3 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Shadow tendrils from hem
  ctx.strokeStyle = `rgba(76, 29, 149, ${voidPulse * 0.35})`;
  ctx.lineWidth = 2 * zoom;
  for (let t = 0; t < 5; t++) {
    const tAngle = t * 0.7 - 1.4 + Math.sin(time * 1.5 + t) * 0.2;
    ctx.beginPath();
    let tx = cx + Math.cos(tAngle) * size * 0.15;
    let ty = y + size * 0.3;
    ctx.moveTo(tx, ty);
    for (let s = 0; s < 3; s++) {
      tx += Math.cos(tAngle + Math.sin(time * 2 + s) * 0.4) * size * 0.08;
      ty += size * 0.05;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }

  // Legs
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: "#1a1028",
    colorDark: "#0a0618",
    footColor: "#0a0618",
    strideSpeed: 2.0,
    strideAmt: 0.14,
    legLen: 0.16,
    width: 0.05,
    style: "bone",
  });

  // Rib-cage bone armor (NOT plate cuirass)
  const ribGrad = ctx.createLinearGradient(cx - size * 0.15, y - size * 0.34, cx + size * 0.15, y - size * 0.02);
  ribGrad.addColorStop(0, boneDark);
  ribGrad.addColorStop(0.3, boneMid);
  ribGrad.addColorStop(0.5, bone);
  ribGrad.addColorStop(0.7, boneMid);
  ribGrad.addColorStop(1, boneDark);
  ctx.fillStyle = ribGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, y - size * 0.33 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.17, y - size * 0.12 - bodyBob, cx - size * 0.13, y + size * 0.01 - bodyBob);
  ctx.lineTo(cx + size * 0.13, y + size * 0.01 - bodyBob);
  ctx.quadraticCurveTo(cx + size * 0.17, y - size * 0.12 - bodyBob, cx + size * 0.14, y - size * 0.33 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Rib lines
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let rib = 0; rib < 5; rib++) {
    const ribY = y - size * 0.28 + rib * size * 0.06 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.12, ribY);
    ctx.quadraticCurveTo(cx, ribY + size * 0.015, cx + size * 0.12, ribY);
    ctx.stroke();
  }

  // Spine detail (center line)
  ctx.strokeStyle = bone;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx, y - size * 0.33 - bodyBob);
  ctx.lineTo(cx, y + size * 0.01 - bodyBob);
  ctx.stroke();

  // Bone spike pauldrons (NOT plate)
  for (const side of [-1, 1]) {
    const spX = cx + side * size * 0.16;
    const spY = y - size * 0.3 - bodyBob;
    // Bone base
    ctx.fillStyle = boneMid;
    ctx.beginPath();
    ctx.ellipse(spX, spY, size * 0.05, size * 0.03, side * 0.2, 0, TAU);
    ctx.fill();
    // Spikes
    for (let sp = 0; sp < 3; sp++) {
      const sAngle = side * (0.3 + sp * 0.4);
      ctx.fillStyle = bone;
      ctx.beginPath();
      ctx.moveTo(spX + Math.cos(sAngle) * size * 0.03, spY + Math.sin(sAngle) * size * 0.02);
      ctx.lineTo(spX + Math.cos(sAngle) * size * 0.08, spY + Math.sin(sAngle) * size * 0.04 - size * 0.03);
      ctx.lineTo(spX + Math.cos(sAngle) * size * 0.04, spY + Math.sin(sAngle) * size * 0.03);
      ctx.fill();
    }
  }

  // Chain/bone belt with skulls
  ctx.fillStyle = boneDark;
  ctx.fillRect(cx - size * 0.13, y - size * 0.02 - bodyBob, size * 0.26, size * 0.025);
  // Mini skulls on belt
  for (let sk = 0; sk < 3; sk++) {
    const skx = cx - size * 0.06 + sk * size * 0.06;
    const sky = y - size * 0.01 - bodyBob;
    ctx.fillStyle = bone;
    ctx.beginPath();
    ctx.arc(skx, sky, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(skx - size * 0.004, sky - size * 0.002, size * 0.003, 0, TAU);
    ctx.arc(skx + size * 0.004, sky - size * 0.002, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // Left arm — void orb
  const orbForeLen = 0.14;
  drawPathArm(ctx, cx - size * 0.2, y - size * 0.28 - bodyBob, size, time, zoom, -1, {
    color: "#1a1028",
    colorDark: "#0a0618",
    handColor: boneMid,
    upperLen: 0.15,
    foreLen: orbForeLen,
    width: 0.048,
    shoulderAngle: 0.5 + Math.sin(time * 1.2) * 0.05 + (isAttacking ? -attackIntensity * 0.35 : 0),
    elbowAngle: 0.35 + (isAttacking ? -attackIntensity * 0.25 : 0),
    style: "bone",
    onWeapon: (wCtx) => {
      const handY = orbForeLen * size;
      wCtx.translate(0, handY * 0.4);
      const orbR = size * 0.055;
      // Outer void aura rings
      for (let r = 2; r >= 0; r--) {
        const ringR = orbR + size * 0.015 * (r + 1);
        const ringAlpha = (0.15 - r * 0.04) * voidPulse;
        wCtx.strokeStyle = `rgba(167, 139, 250, ${ringAlpha})`;
        wCtx.lineWidth = 1.5 * zoom;
        wCtx.beginPath();
        wCtx.arc(0, 0, ringR, 0, TAU);
        wCtx.stroke();
      }
      // Skeletal fingers cradle (bone prongs)
      wCtx.strokeStyle = boneMid;
      wCtx.lineWidth = 2 * zoom;
      wCtx.lineCap = "round";
      for (let f = 0; f < 5; f++) {
        const fAngle = -Math.PI * 0.3 + f * Math.PI * 0.15;
        wCtx.beginPath();
        wCtx.moveTo(Math.cos(fAngle) * size * 0.01, orbR * 0.8 + Math.sin(fAngle) * size * 0.01);
        wCtx.quadraticCurveTo(
          Math.cos(fAngle - 0.2) * orbR * 0.6, Math.sin(fAngle - 0.2) * orbR * 0.6,
          Math.cos(fAngle - 0.5) * orbR * 0.9, Math.sin(fAngle - 0.5) * orbR * 0.9,
        );
        wCtx.stroke();
      }
      wCtx.lineCap = "butt";
      // Main orb with swirling void inside
      setShadowBlur(wCtx, 12 * zoom, accent);
      const orbGrad = wCtx.createRadialGradient(size * 0.01, -size * 0.01, 0, 0, 0, orbR);
      orbGrad.addColorStop(0, "#f0e8ff");
      orbGrad.addColorStop(0.2, "#c4b5fd");
      orbGrad.addColorStop(0.5, accent);
      orbGrad.addColorStop(0.8, accentDark);
      orbGrad.addColorStop(1, "#0a0014");
      wCtx.fillStyle = orbGrad;
      wCtx.beginPath();
      wCtx.arc(0, 0, orbR, 0, TAU);
      wCtx.fill();
      // Inner swirl pattern
      wCtx.strokeStyle = `rgba(200, 180, 255, ${voidPulse * 0.4})`;
      wCtx.lineWidth = 1 * zoom;
      for (let s = 0; s < 3; s++) {
        const sAngle = time * 2.5 + s * TAU / 3;
        wCtx.beginPath();
        wCtx.arc(0, 0, orbR * (0.3 + s * 0.15), sAngle, sAngle + Math.PI * 0.8);
        wCtx.stroke();
      }
      // Glass highlight
      wCtx.fillStyle = "rgba(255,255,255,0.35)";
      wCtx.beginPath();
      wCtx.ellipse(size * 0.012, -size * 0.015, orbR * 0.35, orbR * 0.2, -0.5, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);
      // Void tendrils reaching outward
      wCtx.strokeStyle = `rgba(167, 139, 250, ${voidPulse * 0.5})`;
      wCtx.lineWidth = 1.2 * zoom;
      for (let v = 0; v < 5; v++) {
        const vAngle = v * TAU / 5 + time * 2;
        const tendrilLen = orbR * (1.8 + Math.sin(time * 3 + v * 2) * 0.5);
        wCtx.beginPath();
        wCtx.moveTo(Math.cos(vAngle) * orbR * 0.8, Math.sin(vAngle) * orbR * 0.8);
        wCtx.quadraticCurveTo(
          Math.cos(vAngle + 0.3) * tendrilLen * 0.7, Math.sin(vAngle + 0.3) * tendrilLen * 0.7,
          Math.cos(vAngle + 0.5) * tendrilLen, Math.sin(vAngle + 0.5) * tendrilLen,
        );
        wCtx.stroke();
      }
      // Tiny trapped soul sparks
      wCtx.fillStyle = `rgba(220, 200, 255, ${voidPulse * 0.7})`;
      for (let sp = 0; sp < 3; sp++) {
        const spAngle = time * 4 + sp * TAU / 3;
        const spR = orbR * 0.4;
        wCtx.beginPath();
        wCtx.arc(Math.cos(spAngle) * spR, Math.sin(spAngle) * spR, size * 0.004, 0, TAU);
        wCtx.fill();
      }
    },
  });

  // Right arm — soul-drain scepter
  const scepterForeLen = 0.15;
  drawPathArm(ctx, cx + size * 0.2, y - size * 0.28 - bodyBob, size, time, zoom, 1, {
    color: "#1a1028",
    colorDark: "#0a0618",
    handColor: boneMid,
    upperLen: 0.16,
    foreLen: scepterForeLen,
    width: 0.048,
    shoulderAngle: -(0.6 + (isAttacking ? attackIntensity * 0.25 : 0)) + Math.sin(time * 1.4) * 0.04,
    elbowAngle: -0.3,
    style: "bone",
    onWeapon: (wCtx) => {
      const handY = scepterForeLen * size;
      wCtx.translate(0, handY * 0.5);
      const shaftH = size * 0.48;
      // Bone shaft with vertebrae-like segments
      const boneShaftGrad = wCtx.createLinearGradient(-size * 0.012, 0, size * 0.012, 0);
      boneShaftGrad.addColorStop(0, boneDark);
      boneShaftGrad.addColorStop(0.3, bone);
      boneShaftGrad.addColorStop(0.5, boneMid);
      boneShaftGrad.addColorStop(0.7, bone);
      boneShaftGrad.addColorStop(1, boneDark);
      wCtx.strokeStyle = boneShaftGrad;
      wCtx.lineWidth = 4 * zoom;
      wCtx.lineCap = "round";
      wCtx.beginPath();
      wCtx.moveTo(0, size * 0.06);
      wCtx.lineTo(0, -shaftH);
      wCtx.stroke();
      wCtx.lineCap = "butt";
      // Vertebrae knobs along shaft
      wCtx.fillStyle = bone;
      for (let v = 0; v < 7; v++) {
        const vy = size * 0.04 - v * shaftH / 6;
        wCtx.beginPath();
        wCtx.ellipse(0, vy, size * 0.012, size * 0.006, 0, 0, TAU);
        wCtx.fill();
        wCtx.strokeStyle = boneDark;
        wCtx.lineWidth = 0.5 * zoom;
        wCtx.stroke();
      }
      // Corruption veins wrapping shaft
      wCtx.strokeStyle = `rgba(167, 139, 250, ${voidPulse * 0.35})`;
      wCtx.lineWidth = 1.2 * zoom;
      for (let vn = 0; vn < 3; vn++) {
        wCtx.beginPath();
        for (let seg = 0; seg <= 8; seg++) {
          const sy = size * 0.05 - seg * shaftH / 7;
          const sx = Math.sin(seg * 1.5 + vn * TAU / 3 + time * 2) * size * 0.015;
          if (seg === 0) wCtx.moveTo(sx, sy);
          else wCtx.lineTo(sx, sy);
        }
        wCtx.stroke();
      }
      // Skull pommel — detailed cranium
      const skullY = -shaftH - size * 0.035;
      const skullR = size * 0.04;
      // Skull cranium shape
      const skullGrad = wCtx.createRadialGradient(0, skullY - size * 0.005, 0, 0, skullY, skullR);
      skullGrad.addColorStop(0, bone);
      skullGrad.addColorStop(0.6, boneMid);
      skullGrad.addColorStop(1, boneDark);
      wCtx.fillStyle = skullGrad;
      wCtx.beginPath();
      wCtx.moveTo(0, skullY - skullR * 1.3);
      wCtx.bezierCurveTo(skullR * 1.2, skullY - skullR * 1.2, skullR * 1.3, skullY + skullR * 0.3, skullR * 0.8, skullY + skullR * 0.8);
      wCtx.quadraticCurveTo(0, skullY + skullR, -skullR * 0.8, skullY + skullR * 0.8);
      wCtx.bezierCurveTo(-skullR * 1.3, skullY + skullR * 0.3, -skullR * 1.2, skullY - skullR * 1.2, 0, skullY - skullR * 1.3);
      wCtx.fill();
      // Skull cracks
      wCtx.strokeStyle = boneDark;
      wCtx.lineWidth = 0.7 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.01, skullY - skullR);
      wCtx.lineTo(-size * 0.02, skullY - skullR * 0.4);
      wCtx.lineTo(-size * 0.008, skullY);
      wCtx.stroke();
      // Eye sockets
      for (const side of [-1, 1] as const) {
        wCtx.fillStyle = "#0a0014";
        wCtx.beginPath();
        wCtx.ellipse(side * size * 0.015, skullY - size * 0.005, size * 0.012, size * 0.01, 0, 0, TAU);
        wCtx.fill();
        // Void fire eyes
        setShadowBlur(wCtx, 6 * zoom, accent);
        const eyeFlicker = 0.6 + Math.sin(time * 8 + side * 2) * 0.3;
        wCtx.fillStyle = `rgba(167, 139, 250, ${eyeFlicker})`;
        wCtx.beginPath();
        wCtx.arc(side * size * 0.015, skullY - size * 0.005, size * 0.007, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);
      }
      // Nasal cavity
      wCtx.fillStyle = "#0a0014";
      wCtx.beginPath();
      wCtx.moveTo(0, skullY + size * 0.008);
      wCtx.lineTo(-size * 0.006, skullY + size * 0.02);
      wCtx.lineTo(size * 0.006, skullY + size * 0.02);
      wCtx.closePath();
      wCtx.fill();
      // Jaw with teeth
      wCtx.strokeStyle = boneDark;
      wCtx.lineWidth = 1 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-skullR * 0.6, skullY + skullR * 0.5);
      wCtx.quadraticCurveTo(0, skullY + skullR * 0.7, skullR * 0.6, skullY + skullR * 0.5);
      wCtx.stroke();
      // Tiny teeth
      wCtx.fillStyle = bone;
      for (let t = 0; t < 5; t++) {
        const tx = -size * 0.016 + t * size * 0.008;
        wCtx.fillRect(tx, skullY + skullR * 0.42, size * 0.004, size * 0.008);
      }
      // Dripping void corruption below skull
      wCtx.fillStyle = `rgba(100, 60, 180, ${voidPulse * 0.5})`;
      for (let d = 0; d < 3; d++) {
        const dx = -size * 0.015 + d * size * 0.015;
        const dLen = size * 0.015 + Math.sin(time * 3 + d) * size * 0.008;
        wCtx.beginPath();
        wCtx.moveTo(dx - size * 0.003, skullY + skullR * 0.8);
        wCtx.quadraticCurveTo(dx, skullY + skullR * 0.8 + dLen, dx + size * 0.003, skullY + skullR * 0.8);
        wCtx.fill();
      }
    },
  });

  // HEAD — Skull helm (NOT drawArmoredHelm)
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;
  // Skull base
  const skullGrad = ctx.createRadialGradient(headX, headY - size * 0.01, 0, headX, headY, size * 0.14);
  skullGrad.addColorStop(0, bone);
  skullGrad.addColorStop(0.6, boneMid);
  skullGrad.addColorStop(1, boneDark);
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.15);
  ctx.bezierCurveTo(headX + size * 0.14, headY - size * 0.14, headX + size * 0.15, headY + size * 0.02, headX + size * 0.1, headY + size * 0.1);
  ctx.quadraticCurveTo(headX, headY + size * 0.13, headX - size * 0.1, headY + size * 0.1);
  ctx.bezierCurveTo(headX - size * 0.15, headY + size * 0.02, headX - size * 0.14, headY - size * 0.14, headX, headY - size * 0.15);
  ctx.fill();
  // Dark eye sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#0a0014";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.05, headY - size * 0.02, size * 0.03, size * 0.025, 0, 0, TAU);
    ctx.fill();
    // Void-fire eyes
    setShadowBlur(ctx, 6 * zoom, accent);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.05, headY - size * 0.02, size * 0.015, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }
  // Nasal cavity
  ctx.fillStyle = "#1a0a18";
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.02);
  ctx.lineTo(headX - size * 0.015, headY + size * 0.05);
  ctx.lineTo(headX + size * 0.015, headY + size * 0.05);
  ctx.closePath();
  ctx.fill();
  // Jaw (jawless — open void)
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY + size * 0.07);
  ctx.quadraticCurveTo(headX, headY + size * 0.1, headX + size * 0.08, headY + size * 0.07);
  ctx.stroke();
  // Skull cracks
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.02, headY - size * 0.12);
  ctx.lineTo(headX - size * 0.04, headY - size * 0.06);
  ctx.lineTo(headX - size * 0.02, headY - size * 0.02);
  ctx.stroke();

  // Curved horns on skull
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(headX + side * size * 0.1, headY - size * 0.1);
    const hornGrad = ctx.createLinearGradient(0, 0, side * size * 0.06, -size * 0.15);
    hornGrad.addColorStop(0, boneMid);
    hornGrad.addColorStop(0.5, boneDark);
    hornGrad.addColorStop(1, "#1a1010");
    ctx.fillStyle = hornGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * size * 0.08, -size * 0.08, side * size * 0.1, -size * 0.16);
    ctx.quadraticCurveTo(side * size * 0.06, -size * 0.08, size * 0.01, size * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Dark hood over skull
  ctx.fillStyle = "#0a0618";
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, headY + size * 0.02);
  ctx.quadraticCurveTo(headX - size * 0.18, headY - size * 0.1, headX, headY - size * 0.2);
  ctx.quadraticCurveTo(headX + size * 0.18, headY - size * 0.1, headX + size * 0.14, headY + size * 0.02);
  ctx.quadraticCurveTo(headX, headY - size * 0.1, headX - size * 0.14, headY + size * 0.02);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Void portal rings
  for (let r = 0; r < 2; r++) {
    const ringPhase = (time * 0.5 + r * 0.5) % 1;
    const ringR = size * (0.15 + ringPhase * 0.2);
    ctx.strokeStyle = `rgba(167, 139, 250, ${(1 - ringPhase) * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.48, ringR, ringR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  drawShadowWisps(ctx, cx, y - size * 0.1, size, time, zoom, { color: "rgba(76, 29, 149, 0.4)", count: 4 });

  if (isAttacking) {
    ctx.strokeStyle = `rgba(167, 139, 250, ${attackIntensity * 0.7})`;
    ctx.lineWidth = 2.5 * zoom;
    const burstR = size * 0.2 * attackIntensity;
    ctx.beginPath();
    ctx.arc(cx, y - size * 0.3, burstR, 0, TAU);
    ctx.stroke();
  }
}

// ============================================================================
// 5. CROSSBOWMAN — HEAVY SIEGE KNIGHT
//    Massive plate, bucket helm, spiked pauldrons, siege crossbow
// ============================================================================

export function drawCrossbowmanEnemy(
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
  size *= 1.7;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 1.4, 0.018);
  const sway = getIdleSway(time, 0.4, 0.6, 0.5);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#a09888";
  const metalMid = "#706860";
  const metalDark = "#3a3430";
  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const curseGlow = 0.5 + Math.sin(time * 3) * 0.3;

  // Ground shadow (bigger — heavy unit)
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.52, size * 0.35, size * 0.35 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Red curse domain glow
  const curseGrad = ctx.createRadialGradient(cx, y + size * 0.3, 0, cx, y + size * 0.3, size * 0.4);
  curseGrad.addColorStop(0, `rgba(185, 28, 28, ${curseGlow * 0.12})`);
  curseGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = curseGrad;
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.3, size * 0.4, size * 0.4 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Legs — heavy armored
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: "#1a1510",
    strideSpeed: 2.2,
    strideAmt: 0.14,
    legLen: 0.17,
    width: 0.065,
    style: "armored",
  });

  // Heavy armor skirt (wider than usual)
  drawArmorSkirt(ctx, cx, y - size * 0.02 - bodyBob, size, size * 0.28, size * 0.13, metalMid, metalDark, 6);

  // BULKY plate cuirass — wider, thicker than standard
  const cuirassGrad = ctx.createLinearGradient(cx - size * 0.22, y - size * 0.35, cx + size * 0.22, y - size * 0.04);
  cuirassGrad.addColorStop(0, metalDark);
  cuirassGrad.addColorStop(0.2, metalMid);
  cuirassGrad.addColorStop(0.4, metalLight);
  cuirassGrad.addColorStop(0.6, metalMid);
  cuirassGrad.addColorStop(0.8, metalLight);
  cuirassGrad.addColorStop(1, metalDark);
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, y - size * 0.34 - bodyBob);
  ctx.bezierCurveTo(cx - size * 0.26, y - size * 0.12 - bodyBob, cx - size * 0.24, y + size * 0.01 - bodyBob, cx - size * 0.18, y + size * 0.04 - bodyBob);
  ctx.lineTo(cx + size * 0.18, y + size * 0.04 - bodyBob);
  ctx.bezierCurveTo(cx + size * 0.24, y + size * 0.01 - bodyBob, cx + size * 0.26, y - size * 0.12 - bodyBob, cx + size * 0.22, y - size * 0.34 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Riveted armor bands
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let band = 0; band < 3; band++) {
    const bandY = y - size * 0.25 + band * size * 0.1 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.2, bandY);
    ctx.lineTo(cx + size * 0.2, bandY);
    ctx.stroke();
    // Rivets
    ctx.fillStyle = metalLight;
    for (let rv = 0; rv < 6; rv++) {
      ctx.beginPath();
      ctx.arc(cx - size * 0.16 + rv * size * 0.065, bandY, size * 0.005, 0, TAU);
      ctx.fill();
    }
  }

  // Brown tabard over armor
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.08, y - size * 0.32 - bodyBob);
  ctx.lineTo(cx + size * 0.08, y - size * 0.32 - bodyBob);
  ctx.lineTo(cx + size * 0.07, y - size * 0.04 - bodyBob);
  ctx.lineTo(cx - size * 0.07, y - size * 0.04 - bodyBob);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Skull crosshair emblem
  ctx.fillStyle = "#d4c0a0";
  ctx.beginPath();
  ctx.arc(cx, y - size * 0.18 - bodyBob, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#d4c0a0";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx, y - size * 0.22 - bodyBob);
  ctx.lineTo(cx, y - size * 0.14 - bodyBob);
  ctx.moveTo(cx - size * 0.04, y - size * 0.18 - bodyBob);
  ctx.lineTo(cx + size * 0.04, y - size * 0.18 - bodyBob);
  ctx.stroke();

  // Gorget (thick)
  drawGorget(ctx, cx, y - size * 0.34 - bodyBob, size, size * 0.18, metalMid, metalDark);

  // MASSIVE spiked pauldrons
  for (const side of [-1, 1] as const) {
    drawShoulderOverlay(ctx, cx + side * size * 0.26, y - size * 0.3 - bodyBob, size * 1.3, side, metalMid, metalDark, "plate");
    for (let sp = 0; sp < 4; sp++) {
      const sAngle = side * (0.2 + sp * 0.35) - Math.PI * 0.4;
      const spBase = cx + side * size * 0.26;
      const spBaseY = y - size * 0.32 - bodyBob;
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.moveTo(spBase + Math.cos(sAngle) * size * 0.04, spBaseY + Math.sin(sAngle) * size * 0.03);
      ctx.lineTo(spBase + Math.cos(sAngle) * size * 0.1, spBaseY + Math.sin(sAngle) * size * 0.06 - size * 0.04);
      ctx.lineTo(spBase + Math.cos(sAngle) * size * 0.05, spBaseY + Math.sin(sAngle) * size * 0.04);
      ctx.fill();
    }
  }

  // Heavy belt
  drawBeltOverlay(ctx, cx, y - size * 0.02 - bodyBob, size, size * 0.26, metalDark, "#1a1510", accent);

  // Left arm — gauntlet brace
  const braceForeLen = 0.13;
  drawPathArm(ctx, cx - size * 0.26, y - size * 0.26 - bodyBob, size, time, zoom, -1, {
    color: metalMid,
    colorDark: metalDark,
    handColor: metalMid,
    upperLen: 0.16,
    foreLen: braceForeLen,
    width: 0.065,
    shoulderAngle: 0.35 + Math.sin(time * 1.0) * 0.03 + (isAttacking ? -attackIntensity * 0.25 : 0),
    elbowAngle: 0.5 + (isAttacking ? -attackIntensity * 0.2 : 0),
    style: "armored",
    onWeapon: (wCtx) => {
      wCtx.translate(0, braceForeLen * size * 0.35);
      // Heavy armored tower shield (kite shape)
      const shW = size * 0.08;
      const shH = size * 0.14;
      const shieldGrad = wCtx.createLinearGradient(-shW, -shH * 0.5, shW, shH * 0.5);
      shieldGrad.addColorStop(0, metalLight);
      shieldGrad.addColorStop(0.3, metalMid);
      shieldGrad.addColorStop(0.6, metalDark);
      shieldGrad.addColorStop(1, metalMid);
      wCtx.fillStyle = shieldGrad;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH * 0.6);
      wCtx.lineTo(shW, -shH * 0.3);
      wCtx.lineTo(shW * 0.9, shH * 0.15);
      wCtx.lineTo(0, shH * 0.5);
      wCtx.lineTo(-shW * 0.9, shH * 0.15);
      wCtx.lineTo(-shW, -shH * 0.3);
      wCtx.closePath();
      wCtx.fill();
      wCtx.strokeStyle = metalDark;
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.stroke();
      // Shield border (raised edge)
      wCtx.strokeStyle = metalLight;
      wCtx.lineWidth = 2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH * 0.52);
      wCtx.lineTo(shW * 0.9, -shH * 0.24);
      wCtx.lineTo(shW * 0.8, shH * 0.1);
      wCtx.lineTo(0, shH * 0.42);
      wCtx.lineTo(-shW * 0.8, shH * 0.1);
      wCtx.lineTo(-shW * 0.9, -shH * 0.24);
      wCtx.closePath();
      wCtx.stroke();
      // Central vertical ridge
      wCtx.strokeStyle = metalLight;
      wCtx.lineWidth = 2.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH * 0.5);
      wCtx.lineTo(0, shH * 0.45);
      wCtx.stroke();
      // Horizontal bar
      wCtx.beginPath();
      wCtx.moveTo(-shW * 0.7, -shH * 0.1);
      wCtx.lineTo(shW * 0.7, -shH * 0.1);
      wCtx.stroke();
      // Rivets at corners of cross
      wCtx.fillStyle = metalLight;
      for (const pos of [[-shW * 0.65, -shH * 0.1], [shW * 0.65, -shH * 0.1], [0, -shH * 0.45], [0, shH * 0.35]]) {
        wCtx.beginPath();
        wCtx.arc(pos[0], pos[1], size * 0.005, 0, TAU);
        wCtx.fill();
      }
      // Red emblem on shield center
      wCtx.fillStyle = `rgba(220, 38, 38, ${0.6 + curseGlow * 0.3})`;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH * 0.28);
      wCtx.lineTo(shW * 0.3, -shH * 0.1);
      wCtx.lineTo(0, shH * 0.08);
      wCtx.lineTo(-shW * 0.3, -shH * 0.1);
      wCtx.closePath();
      wCtx.fill();
    },
  });

  // Right arm — SIEGE CROSSBOW
  const xbowForeLen = 0.15;
  drawPathArm(ctx, cx + size * 0.26, y - size * 0.26 - bodyBob, size, time, zoom, 1, {
    color: metalMid,
    colorDark: metalDark,
    handColor: metalMid,
    upperLen: 0.17,
    foreLen: xbowForeLen,
    width: 0.065,
    shoulderAngle: -(0.5 + (isAttacking ? attackIntensity * 0.3 : 0)) + Math.sin(time * 1.2) * 0.025,
    elbowAngle: -0.35,
    style: "armored",
    onWeapon: (wCtx) => {
      const handY = xbowForeLen * size;
      wCtx.translate(0, handY * 0.45);
      // ── WOODEN TILLER (main body) ──
      const tillerLen = size * 0.2;
      const tillerW = size * 0.025;
      const tillerGrad = wCtx.createLinearGradient(-tillerW, 0, tillerW, 0);
      tillerGrad.addColorStop(0, "#2a1808");
      tillerGrad.addColorStop(0.3, "#5a3820");
      tillerGrad.addColorStop(0.5, "#7a5030");
      tillerGrad.addColorStop(0.7, "#5a3820");
      tillerGrad.addColorStop(1, "#2a1808");
      wCtx.fillStyle = tillerGrad;
      wCtx.beginPath();
      wCtx.moveTo(-tillerW, size * 0.08);
      wCtx.lineTo(-tillerW * 0.8, -tillerLen);
      wCtx.lineTo(tillerW * 0.8, -tillerLen);
      wCtx.lineTo(tillerW, size * 0.08);
      wCtx.closePath();
      wCtx.fill();
      // Wood grain
      wCtx.strokeStyle = "rgba(60,30,10,0.2)";
      wCtx.lineWidth = 0.6 * zoom;
      for (let g = 0; g < 5; g++) {
        const gx = -tillerW * 0.5 + g * tillerW * 0.25;
        wCtx.beginPath();
        wCtx.moveTo(gx, size * 0.06);
        wCtx.lineTo(gx, -tillerLen * 0.9);
        wCtx.stroke();
      }
      // ── STIRRUP at front ──
      wCtx.strokeStyle = metalDark;
      wCtx.lineWidth = 2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.015, -tillerLen);
      wCtx.quadraticCurveTo(-size * 0.02, -tillerLen - size * 0.02, 0, -tillerLen - size * 0.025);
      wCtx.quadraticCurveTo(size * 0.02, -tillerLen - size * 0.02, size * 0.015, -tillerLen);
      wCtx.stroke();
      // ── PROD (bow arms) ──
      const prodSpan = size * 0.18;
      const prodY = -tillerLen + size * 0.01;
      // Iron reinforced prod with recurve
      const prodGrad = wCtx.createLinearGradient(0, prodY - size * 0.01, 0, prodY + size * 0.01);
      prodGrad.addColorStop(0, metalLight);
      prodGrad.addColorStop(0.5, metalMid);
      prodGrad.addColorStop(1, metalDark);
      wCtx.strokeStyle = prodGrad;
      wCtx.lineWidth = 3.5 * zoom;
      wCtx.lineCap = "round";
      // Left limb
      wCtx.beginPath();
      wCtx.moveTo(0, prodY);
      wCtx.bezierCurveTo(-prodSpan * 0.3, prodY + size * 0.005, -prodSpan * 0.7, prodY - size * 0.01, -prodSpan, prodY + size * 0.015);
      wCtx.stroke();
      // Right limb
      wCtx.beginPath();
      wCtx.moveTo(0, prodY);
      wCtx.bezierCurveTo(prodSpan * 0.3, prodY + size * 0.005, prodSpan * 0.7, prodY - size * 0.01, prodSpan, prodY + size * 0.015);
      wCtx.stroke();
      wCtx.lineCap = "butt";
      // Recurve tips
      for (const side of [-1, 1] as const) {
        wCtx.fillStyle = metalDark;
        wCtx.beginPath();
        wCtx.arc(side * prodSpan, prodY + size * 0.015, size * 0.006, 0, TAU);
        wCtx.fill();
      }
      // ── BOWSTRING ──
      const stringPull = isAttacking ? attackIntensity * size * 0.04 : 0;
      wCtx.strokeStyle = "#c0b8a0";
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-prodSpan, prodY + size * 0.015);
      wCtx.quadraticCurveTo(0, prodY + size * 0.02 + stringPull, prodSpan, prodY + size * 0.015);
      wCtx.stroke();
      // ── NUT / TRIGGER mechanism ──
      wCtx.fillStyle = metalMid;
      wCtx.fillRect(-size * 0.01, -size * 0.04, size * 0.02, size * 0.025);
      wCtx.fillStyle = metalDark;
      wCtx.fillRect(-size * 0.006, -size * 0.02, size * 0.012, size * 0.015);
      // Trigger lever
      wCtx.strokeStyle = metalMid;
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(size * 0.005, size * 0.01);
      wCtx.lineTo(size * 0.01, size * 0.04);
      wCtx.stroke();
      // ── BOLT (loaded) ──
      const boltStart = 0;
      const boltEnd = -tillerLen - size * 0.08;
      // Bolt shaft
      const boltGrad = wCtx.createLinearGradient(boltStart, -size * 0.035, boltEnd, -size * 0.035);
      boltGrad.addColorStop(0, "#888");
      boltGrad.addColorStop(0.5, "#bbb");
      boltGrad.addColorStop(1, "#888");
      wCtx.strokeStyle = boltGrad;
      wCtx.lineWidth = 2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(boltStart, -size * 0.035);
      wCtx.lineTo(boltEnd, -size * 0.035);
      wCtx.stroke();
      // Broadhead bolt tip
      setShadowBlur(wCtx, 4 * zoom, "#dc2626");
      wCtx.fillStyle = "#c0c0c0";
      wCtx.beginPath();
      wCtx.moveTo(boltEnd, -size * 0.035);
      wCtx.lineTo(boltEnd - size * 0.025, -size * 0.035 - size * 0.01);
      wCtx.lineTo(boltEnd - size * 0.035, -size * 0.035);
      wCtx.lineTo(boltEnd - size * 0.025, -size * 0.035 + size * 0.01);
      wCtx.closePath();
      wCtx.fill();
      // Glowing rune on bolt head
      wCtx.fillStyle = `rgba(220, 38, 38, ${0.5 + curseGlow * 0.4})`;
      wCtx.beginPath();
      wCtx.arc(boltEnd - size * 0.015, -size * 0.035, size * 0.005, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);
      // Bolt fletching (short vanes)
      for (const fy of [-1, 1] as const) {
        wCtx.fillStyle = "#4a4a4a";
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.01, -size * 0.035);
        wCtx.lineTo(size * 0.005, -size * 0.035 + fy * size * 0.008);
        wCtx.lineTo(size * 0.02, -size * 0.035);
        wCtx.closePath();
        wCtx.fill();
      }
      // ── Metal reinforcement bands on tiller ──
      wCtx.fillStyle = metalMid;
      for (let b = 0; b < 3; b++) {
        const by = -size * 0.02 - b * size * 0.05;
        wCtx.fillRect(-tillerW - size * 0.003, by, tillerW * 2 + size * 0.006, size * 0.008);
      }
    },
  });

  // HEAD — Great helm / bucket helm with T-visor (NOT drawArmoredHelm)
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;
  const helmR = size * 0.16;
  // Flat-topped bucket shape
  const helmGrad = ctx.createLinearGradient(headX - helmR, headY - helmR, headX + helmR, headY + helmR);
  helmGrad.addColorStop(0, metalLight);
  helmGrad.addColorStop(0.3, metalMid);
  helmGrad.addColorStop(0.7, metalDark);
  helmGrad.addColorStop(1, metalMid);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(headX - helmR, headY - helmR * 0.6);
  ctx.lineTo(headX - helmR, headY + helmR * 0.8);
  ctx.quadraticCurveTo(headX, headY + helmR * 1.0, headX + helmR, headY + helmR * 0.8);
  ctx.lineTo(headX + helmR, headY - helmR * 0.6);
  ctx.lineTo(headX + helmR * 0.5, headY - helmR * 0.9);
  ctx.lineTo(headX - helmR * 0.5, headY - helmR * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Flat top plate
  ctx.fillStyle = metalMid;
  ctx.beginPath();
  ctx.moveTo(headX - helmR * 0.5, headY - helmR * 0.9);
  ctx.lineTo(headX + helmR * 0.5, headY - helmR * 0.9);
  ctx.lineTo(headX + helmR * 0.4, headY - helmR * 1.0);
  ctx.lineTo(headX - helmR * 0.4, headY - helmR * 1.0);
  ctx.closePath();
  ctx.fill();
  // T-shaped visor slit
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(headX - helmR * 0.5, headY - size * 0.01, helmR * 1.0, size * 0.015);
  ctx.fillRect(headX - size * 0.01, headY - size * 0.01, size * 0.02, size * 0.06);
  // Red glow inside visor
  ctx.fillStyle = `rgba(220, 38, 38, ${curseGlow * 0.6})`;
  setShadowBlur(ctx, 3 * zoom, "#dc2626");
  ctx.fillRect(headX - helmR * 0.45, headY, helmR * 0.4, size * 0.01);
  ctx.fillRect(headX + helmR * 0.05, headY, helmR * 0.4, size * 0.01);
  clearShadow(ctx);
  // Central ridge
  ctx.strokeStyle = metalLight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headY - helmR * 1.0);
  ctx.lineTo(headX, headY + helmR * 0.4);
  ctx.stroke();
  // Cross rivets on helm
  ctx.fillStyle = metalLight;
  for (let rv = 0; rv < 4; rv++) {
    ctx.beginPath();
    ctx.arc(headX - helmR * 0.3 + rv * helmR * 0.2, headY - helmR * 0.5, size * 0.005, 0, TAU);
    ctx.fill();
  }
  // Central horn spike on top
  ctx.fillStyle = metalDark;
  ctx.beginPath();
  ctx.moveTo(headX, headY - helmR * 1.0);
  ctx.lineTo(headX - size * 0.015, headY - helmR * 0.85);
  ctx.lineTo(headX + size * 0.015, headY - helmR * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = metalLight;
  ctx.beginPath();
  ctx.moveTo(headX, headY - helmR * 1.0 - size * 0.06);
  ctx.lineTo(headX - size * 0.01, headY - helmR * 1.0);
  ctx.lineTo(headX + size * 0.01, headY - helmR * 1.0);
  ctx.closePath();
  ctx.fill();

  drawEmberSparks(ctx, cx, y - size * 0.2, size, time, zoom, { color: "rgba(220, 38, 38, 0.6)", count: 4 });

  if (isAttacking) {
    ctx.strokeStyle = `rgba(220, 38, 38, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let r = 0; r < 2; r++) {
      const ringR = size * (0.1 + r * 0.08) * (1 - attackIntensity * 0.3);
      ctx.beginPath();
      ctx.arc(cx + size * 0.25, y - size * 0.35, ringR, 0, TAU);
      ctx.stroke();
    }
  }
}

// ============================================================================
// 6. HEXER — ENCHANTRESS
//    Corset dress, witch hat, jewelry/bangles, hex staff + curse gem
// ============================================================================

export function drawHexerEnemy(
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
  size *= 1.7;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 2.0, 0.025);
  const sway = getIdleSway(time, 0.9, 1.5, 1.0);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const hexPulse = 0.5 + Math.sin(time * 3.5) * 0.4;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.52, size * 0.28, size * 0.28 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Hex rune circle on ground
  ctx.strokeStyle = `rgba(190, 24, 93, ${hexPulse * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(cx, y + size * 0.48, size * 0.28, size * 0.28 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();
  for (let h = 0; h < 6; h++) {
    const hAngle = h * TAU / 6 + time * 0.4;
    const hx = cx + Math.cos(hAngle) * size * 0.24;
    const hy = y + size * 0.48 + Math.sin(hAngle) * size * 0.24 * ISO_Y_RATIO;
    ctx.fillStyle = `rgba(190, 24, 93, ${hexPulse * 0.5})`;
    ctx.font = `${size * 0.025}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("✦", hx, hy);
  }

  // Legs (visible below dress)
  drawPathLegs(ctx, cx, y + size * 0.12 - bodyBob, size, time, zoom, {
    color: "#5a3040",
    colorDark: "#3a1828",
    footColor: "#2a1018",
    strideSpeed: 2.8,
    strideAmt: 0.18,
    legLen: 0.15,
    width: 0.042,
    style: "fleshy",
  });

  // Flowing enchanted dress (NOT plate armor)
  const dressGrad = ctx.createLinearGradient(cx, y - size * 0.2, cx, y + size * 0.25);
  dressGrad.addColorStop(0, accentDark);
  dressGrad.addColorStop(0.4, accent);
  dressGrad.addColorStop(0.7, accentDark);
  dressGrad.addColorStop(1, "#1a0810");
  ctx.fillStyle = dressGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.1, y - size * 0.08 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.2, y + size * 0.08, cx - size * 0.22, y + size * 0.2);
  for (let w = 0; w < 7; w++) {
    const wx = cx - size * 0.22 + w * size * 0.065;
    const wy = y + size * 0.2 + Math.sin(time * 3 + w * 1.1) * size * 0.015 + (w % 2) * size * 0.02;
    ctx.lineTo(wx, wy);
  }
  ctx.quadraticCurveTo(cx + size * 0.2, y + size * 0.08, cx + size * 0.1, y - size * 0.08 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Magical shimmer particles on dress
  ctx.fillStyle = `rgba(251, 191, 36, ${hexPulse * 0.3})`;
  for (let sp = 0; sp < 5; sp++) {
    const spx = cx - size * 0.12 + sp * size * 0.06 + Math.sin(time * 2 + sp) * size * 0.01;
    const spy = y + size * 0.05 + sp * size * 0.03 + Math.cos(time * 3 + sp) * size * 0.005;
    ctx.beginPath();
    ctx.arc(spx, spy, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Corset bodice (NOT plate cuirass)
  const corsetGrad = ctx.createLinearGradient(cx - size * 0.12, y - size * 0.34, cx + size * 0.12, y - size * 0.08);
  corsetGrad.addColorStop(0, "#2a1018");
  corsetGrad.addColorStop(0.3, "#4a2030");
  corsetGrad.addColorStop(0.5, "#5a2838");
  corsetGrad.addColorStop(0.7, "#4a2030");
  corsetGrad.addColorStop(1, "#2a1018");
  ctx.fillStyle = corsetGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.12, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(cx - size * 0.14, y - size * 0.18 - bodyBob, cx - size * 0.1, y - size * 0.08 - bodyBob);
  ctx.lineTo(cx + size * 0.1, y - size * 0.08 - bodyBob);
  ctx.quadraticCurveTo(cx + size * 0.14, y - size * 0.18 - bodyBob, cx + size * 0.12, y - size * 0.34 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Corset lacing
  ctx.strokeStyle = "#d4a040";
  ctx.lineWidth = 1 * zoom;
  for (let lace = 0; lace < 4; lace++) {
    const ly = y - size * 0.3 + lace * size * 0.05 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.03, ly);
    ctx.lineTo(cx + size * 0.03, ly + size * 0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.03, ly);
    ctx.lineTo(cx - size * 0.03, ly + size * 0.02);
    ctx.stroke();
  }

  // Jewelry chains / shoulder bangles (NOT plate pauldrons)
  for (const side of [-1, 1]) {
    const jx = cx + side * size * 0.12;
    const jy = y - size * 0.33 - bodyBob;
    // Gold chain draping
    ctx.strokeStyle = "#d4a040";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    ctx.quadraticCurveTo(jx + side * size * 0.04, jy + size * 0.04, jx + side * size * 0.02, jy + size * 0.08);
    ctx.stroke();
    // Gem pendant
    setShadowBlur(ctx, 3 * zoom, accent);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(jx + side * size * 0.02, jy + size * 0.08, size * 0.01, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Low-slung chain belt with pendants
  ctx.strokeStyle = "#d4a040";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.1, y - size * 0.08 - bodyBob);
  ctx.quadraticCurveTo(cx, y - size * 0.05 - bodyBob, cx + size * 0.1, y - size * 0.08 - bodyBob);
  ctx.stroke();
  // Pendants
  for (let p = 0; p < 3; p++) {
    const px = cx - size * 0.05 + p * size * 0.05;
    const py = y - size * 0.06 - bodyBob + Math.sin(p) * size * 0.005;
    ctx.fillStyle = p === 1 ? accent : "#d4a040";
    ctx.beginPath();
    ctx.arc(px, py + size * 0.015, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Left arm — curse focus gem
  const gemForeLen = 0.13;
  drawPathArm(ctx, cx - size * 0.18, y - size * 0.28 - bodyBob, size, time, zoom, -1, {
    color: "#5a2838",
    colorDark: "#2a1018",
    handColor: "#e0c0b0",
    upperLen: 0.14,
    foreLen: gemForeLen,
    width: 0.042,
    shoulderAngle: 0.5 + Math.sin(time * 1.3) * 0.05 + (isAttacking ? -attackIntensity * 0.3 : 0),
    elbowAngle: 0.35 + (isAttacking ? -attackIntensity * 0.2 : 0),
    style: "fleshy",
    onWeapon: (wCtx) => {
      const handY = gemForeLen * size;
      wCtx.translate(0, handY * 0.4);
      // Ornate gold claw setting
      wCtx.strokeStyle = "#d4a040";
      wCtx.lineWidth = 2 * zoom;
      wCtx.lineCap = "round";
      for (let c = 0; c < 4; c++) {
        const cAngle = -Math.PI * 0.6 + c * Math.PI * 0.4;
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.01);
        wCtx.quadraticCurveTo(
          Math.cos(cAngle) * size * 0.015, Math.sin(cAngle) * size * 0.015 - size * 0.01,
          Math.cos(cAngle) * size * 0.035, Math.sin(cAngle) * size * 0.035 - size * 0.015,
        );
        wCtx.stroke();
      }
      wCtx.lineCap = "butt";
      // Floating hex rune ring around gem
      wCtx.strokeStyle = `rgba(190, 24, 93, ${hexPulse * 0.4})`;
      wCtx.lineWidth = 1 * zoom;
      const ringR = size * 0.05;
      wCtx.beginPath();
      for (let p = 0; p < 6; p++) {
        const pa = p * TAU / 6 + time * 1.5;
        const px = Math.cos(pa) * ringR;
        const py = Math.sin(pa) * ringR - size * 0.01;
        if (p === 0) wCtx.moveTo(px, py);
        else wCtx.lineTo(px, py);
      }
      wCtx.closePath();
      wCtx.stroke();
      // Hex sigils at ring vertices
      wCtx.fillStyle = `rgba(190, 24, 93, ${hexPulse * 0.5})`;
      for (let p = 0; p < 6; p++) {
        const pa = p * TAU / 6 + time * 1.5;
        wCtx.beginPath();
        wCtx.arc(Math.cos(pa) * ringR, Math.sin(pa) * ringR - size * 0.01, size * 0.004, 0, TAU);
        wCtx.fill();
      }
      // Main gem — multifaceted hexagonal cut
      setShadowBlur(wCtx, 10 * zoom, accent);
      const gemR = size * 0.035;
      const gemCY = -size * 0.01;
      const gemGrad = wCtx.createRadialGradient(size * 0.005, gemCY - size * 0.005, 0, 0, gemCY, gemR);
      gemGrad.addColorStop(0, "#ffe0f0");
      gemGrad.addColorStop(0.3, bodyColorLight || "#f9a8d4");
      gemGrad.addColorStop(0.6, accent);
      gemGrad.addColorStop(1, accentDark);
      wCtx.fillStyle = gemGrad;
      // Hexagonal shape
      wCtx.beginPath();
      for (let p = 0; p < 6; p++) {
        const pa = p * TAU / 6 - Math.PI / 6;
        const px = Math.cos(pa) * gemR;
        const py = gemCY + Math.sin(pa) * gemR;
        if (p === 0) wCtx.moveTo(px, py);
        else wCtx.lineTo(px, py);
      }
      wCtx.closePath();
      wCtx.fill();
      // Facet lines inside gem
      wCtx.strokeStyle = `rgba(255,180,220,0.3)`;
      wCtx.lineWidth = 0.5 * zoom;
      for (let f = 0; f < 3; f++) {
        const fa1 = f * TAU / 6 - Math.PI / 6;
        const fa2 = (f + 3) * TAU / 6 - Math.PI / 6;
        wCtx.beginPath();
        wCtx.moveTo(Math.cos(fa1) * gemR, gemCY + Math.sin(fa1) * gemR);
        wCtx.lineTo(Math.cos(fa2) * gemR, gemCY + Math.sin(fa2) * gemR);
        wCtx.stroke();
      }
      // Star highlight
      wCtx.fillStyle = "rgba(255,255,255,0.5)";
      wCtx.beginPath();
      wCtx.arc(size * 0.008, gemCY - size * 0.01, size * 0.008, 0, TAU);
      wCtx.fill();
      wCtx.fillStyle = "rgba(255,255,255,0.25)";
      wCtx.beginPath();
      wCtx.arc(-size * 0.005, gemCY + size * 0.008, size * 0.005, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);
      // Energy beam upward from gem
      const beamAlpha = hexPulse * 0.3;
      wCtx.strokeStyle = `rgba(190, 24, 93, ${beamAlpha})`;
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, gemCY - gemR);
      wCtx.lineTo(0, gemCY - gemR - size * 0.04);
      wCtx.stroke();
    },
  });

  // Right arm — hex crystal staff
  const hexStaffForeLen = 0.15;
  drawPathArm(ctx, cx + size * 0.18, y - size * 0.28 - bodyBob, size, time, zoom, 1, {
    color: "#5a2838",
    colorDark: "#2a1018",
    handColor: "#e0c0b0",
    upperLen: 0.15,
    foreLen: hexStaffForeLen,
    width: 0.042,
    shoulderAngle: -(0.6 + (isAttacking ? attackIntensity * 0.2 : 0)) + Math.sin(time * 1.5) * 0.04,
    elbowAngle: -0.3,
    style: "fleshy",
    onWeapon: (wCtx) => {
      const handY = hexStaffForeLen * size;
      wCtx.translate(0, handY * 0.5);
      const shaftH = size * 0.52;
      // Twisted ironwood staff (spiral carved)
      const shaftGrad = wCtx.createLinearGradient(-size * 0.012, 0, size * 0.012, 0);
      shaftGrad.addColorStop(0, "#1a0a12");
      shaftGrad.addColorStop(0.3, "#4a2838");
      shaftGrad.addColorStop(0.5, "#6a4050");
      shaftGrad.addColorStop(0.7, "#4a2838");
      shaftGrad.addColorStop(1, "#1a0a12");
      wCtx.strokeStyle = shaftGrad;
      wCtx.lineWidth = 4 * zoom;
      wCtx.lineCap = "round";
      wCtx.beginPath();
      wCtx.moveTo(0, size * 0.07);
      wCtx.lineTo(0, -shaftH);
      wCtx.stroke();
      wCtx.lineCap = "butt";
      // Spiral carving along shaft
      wCtx.strokeStyle = `rgba(190, 24, 93, ${hexPulse * 0.2 + 0.1})`;
      wCtx.lineWidth = 0.8 * zoom;
      for (let sp = 0; sp < 20; sp++) {
        const sy = size * 0.06 - sp * shaftH / 18;
        const sx = Math.sin(sp * 0.9 + time * 2) * size * 0.012;
        if (sp === 0) { wCtx.beginPath(); wCtx.moveTo(sx, sy); }
        else wCtx.lineTo(sx, sy);
      }
      wCtx.stroke();
      // Thorns along shaft
      wCtx.fillStyle = "#2a1018";
      for (let th = 0; th < 5; th++) {
        const thY = -shaftH * 0.1 - th * shaftH * 0.18;
        const thSide = th % 2 === 0 ? -1 : 1;
        wCtx.beginPath();
        wCtx.moveTo(thSide * size * 0.012, thY);
        wCtx.lineTo(thSide * size * 0.025, thY - size * 0.01);
        wCtx.lineTo(thSide * size * 0.012, thY - size * 0.006);
        wCtx.closePath();
        wCtx.fill();
      }
      // Rose gold rings
      for (let r = 0; r < 2; r++) {
        const ry = -shaftH * 0.25 - r * shaftH * 0.35;
        const ringGrad = wCtx.createLinearGradient(-size * 0.018, ry, size * 0.018, ry);
        ringGrad.addColorStop(0, "#8a4040");
        ringGrad.addColorStop(0.5, "#e8a0a0");
        ringGrad.addColorStop(1, "#8a4040");
        wCtx.fillStyle = ringGrad;
        wCtx.fillRect(-size * 0.018, ry - size * 0.004, size * 0.036, size * 0.008);
      }
      // Foot spike (iron, curved)
      wCtx.fillStyle = "#4a4a4a";
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.008, size * 0.06);
      wCtx.quadraticCurveTo(0, size * 0.1, size * 0.008, size * 0.06);
      wCtx.closePath();
      wCtx.fill();
      // ── CRESCENT MOON topper (unique vs mage's crystal) ──
      const moonY = -shaftH - size * 0.02;
      // Wrought iron crescent cradle
      wCtx.strokeStyle = "#6a4050";
      wCtx.lineWidth = 2.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.01, -shaftH);
      wCtx.quadraticCurveTo(-size * 0.04, moonY - size * 0.02, -size * 0.035, moonY - size * 0.05);
      wCtx.stroke();
      wCtx.beginPath();
      wCtx.moveTo(size * 0.01, -shaftH);
      wCtx.quadraticCurveTo(size * 0.04, moonY - size * 0.02, size * 0.035, moonY - size * 0.05);
      wCtx.stroke();
      // Crescent moon shape
      setShadowBlur(wCtx, 10 * zoom, accent);
      const crescGrad = wCtx.createRadialGradient(0, moonY - size * 0.04, 0, 0, moonY - size * 0.04, size * 0.04);
      crescGrad.addColorStop(0, "#ffe0f0");
      crescGrad.addColorStop(0.4, bodyColorLight || "#f9a8d4");
      crescGrad.addColorStop(0.7, accent);
      crescGrad.addColorStop(1, accentDark);
      wCtx.fillStyle = crescGrad;
      wCtx.beginPath();
      wCtx.arc(0, moonY - size * 0.04, size * 0.035, 0, TAU);
      wCtx.fill();
      // Cut-out for crescent effect
      wCtx.fillStyle = "#0a0618";
      wCtx.beginPath();
      wCtx.arc(size * 0.015, moonY - size * 0.04, size * 0.025, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);
      // Small gem at crescent point
      setShadowBlur(wCtx, 4 * zoom, accent);
      wCtx.fillStyle = accent;
      wCtx.beginPath();
      wCtx.arc(-size * 0.028, moonY - size * 0.04, size * 0.006, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);
      // Hex energy beam from crescent tip
      wCtx.strokeStyle = `rgba(190, 24, 93, ${hexPulse * 0.4})`;
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.03, moonY - size * 0.06);
      wCtx.quadraticCurveTo(-size * 0.02, moonY - size * 0.1, 0, moonY - size * 0.12);
      wCtx.stroke();
      // Orbiting hex sparks around crescent
      wCtx.fillStyle = `rgba(190, 24, 93, ${hexPulse * 0.6})`;
      for (let s = 0; s < 3; s++) {
        const sAngle = time * 3 + s * TAU / 3;
        const sR = size * 0.05;
        wCtx.beginPath();
        wCtx.arc(Math.cos(sAngle) * sR, moonY - size * 0.04 + Math.sin(sAngle) * sR * 0.6, size * 0.004, 0, TAU);
        wCtx.fill();
      }
    },
  });

  // Wild hair flowing
  const headX = cx;
  const headY = y - size * 0.46 - bodyBob;
  ctx.strokeStyle = "#1a0a12";
  ctx.lineWidth = 2.5 * zoom;
  for (let h = 0; h < 8; h++) {
    const hAngle = -1.0 + h * 0.28;
    const hairLen = size * (0.12 + Math.sin(h * 1.3) * 0.03);
    const hairWave = Math.sin(time * 2.5 + h * 0.7) * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(headX + Math.cos(hAngle) * size * 0.11, headY + size * 0.06);
    ctx.quadraticCurveTo(
      headX + Math.cos(hAngle) * (size * 0.14 + hairLen * 0.5) + hairWave,
      headY + size * 0.06 + hairLen * 0.5,
      headX + Math.cos(hAngle) * size * 0.1 + hairWave * 2,
      headY + size * 0.06 + hairLen,
    );
    ctx.stroke();
  }

  // Face
  const faceGrad = ctx.createRadialGradient(headX, headY + size * 0.01, 0, headX, headY, size * 0.11);
  faceGrad.addColorStop(0, "#f0d8c8");
  faceGrad.addColorStop(0.7, "#d8b8a0");
  faceGrad.addColorStop(1, "#c0a088");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.11, 0, TAU);
  ctx.fill();
  // Eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.035, headY - size * 0.015, size * 0.018, size * 0.013, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.035, headY - size * 0.015, size * 0.009, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(headX + side * size * 0.035, headY - size * 0.015, size * 0.004, 0, TAU);
    ctx.fill();
  }
  // Lips
  ctx.fillStyle = "#c06070";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.04, size * 0.02, size * 0.008, 0, 0, TAU);
  ctx.fill();
  // Hex sigil on forehead
  ctx.fillStyle = `rgba(190, 24, 93, ${hexPulse * 0.6})`;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.07);
  ctx.lineTo(headX + size * 0.012, headY - size * 0.05);
  ctx.lineTo(headX, headY - size * 0.03);
  ctx.lineTo(headX - size * 0.012, headY - size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Witch hat directly on head (NO armored helm)
  const hatBaseY = headY - size * 0.09;
  ctx.fillStyle = accentDark;
  ctx.beginPath();
  ctx.ellipse(headX, hatBaseY, size * 0.22, size * 0.06, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#d4a040";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  const witchHatGrad = ctx.createLinearGradient(headX - size * 0.1, hatBaseY, headX + size * 0.1, hatBaseY - size * 0.3);
  witchHatGrad.addColorStop(0, accentDark);
  witchHatGrad.addColorStop(0.4, accent);
  witchHatGrad.addColorStop(1, accentDark);
  ctx.fillStyle = witchHatGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, hatBaseY);
  ctx.quadraticCurveTo(headX - size * 0.06, hatBaseY - size * 0.14, headX + size * 0.06, hatBaseY - size * 0.3);
  ctx.quadraticCurveTo(headX + size * 0.08, hatBaseY - size * 0.14, headX + size * 0.1, hatBaseY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#d4a040";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(headX, hatBaseY - size * 0.02, size * 0.09, size * 0.025, 0, 0, TAU);
  ctx.stroke();
  setShadowBlur(ctx, 3 * zoom, accent);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(headX + size * 0.07, hatBaseY - size * 0.02, size * 0.01, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = "#d4a040";
  setShadowBlur(ctx, 4 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(headX + size * 0.06, hatBaseY - size * 0.3, size * 0.01, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Orbiting hex rune symbols
  for (let hr = 0; hr < 4; hr++) {
    const hrAngle = time * 1.2 + hr * TAU / 4;
    const hrDist = size * 0.33;
    const hrx = cx + Math.cos(hrAngle) * hrDist;
    const hry = y - size * 0.15 + Math.sin(hrAngle) * hrDist * 0.4 - bodyBob;
    ctx.fillStyle = `rgba(190, 24, 93, ${hexPulse * 0.5})`;
    ctx.font = `${size * 0.025}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("✦", hrx, hry);
  }

  drawArcaneSparkles(ctx, cx, y - size * 0.2, size, time, zoom, { color: accent, count: 5, sparkleSize: 0.012 });

  if (isAttacking) {
    ctx.strokeStyle = `rgba(190, 24, 93, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let r = 0; r < 3; r++) {
      const ringR = size * (0.12 + r * 0.08) * (1 - attackIntensity * 0.2);
      ctx.beginPath();
      ctx.arc(cx, y - size * 0.35, ringR, 0, TAU);
      ctx.stroke();
    }
  }
}
