import { ISO_Y_RATIO } from "../../constants/isometric";
import type { MapTheme } from "../../types";
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
import {
  getRegionMaterials,
  drawRegionBodyAccent,
  drawRegionWeaponAccent,
} from "./regionVariants";

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
  region: MapTheme = "grassland"
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 2.2, 0.02);
  const sway = getIdleSway(time, 0.9, 1.4, 0.8);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  let crimson = "#6b21a8";
  let crimsonDark = "#3b0764";
  let crimsonLight = "#a855f7";
  let gold = "#d4a017";
  let goldBright = "#ffd700";
  let goldDark = "#8b6914";
  let steel = "#b8c4d0";
  let steelDark = "#6a7280";
  let steelBright = "#e4eaf0";
  const ivory = "#f5f0e8";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    crimson = rm.cloth.base;
    crimsonDark = rm.cloth.dark;
    crimsonLight = rm.cloth.light;
    gold = rm.metal.accent;
    goldBright = rm.metal.bright;
    goldDark = rm.metal.dark;
    steel = rm.metal.base;
    steelDark = rm.metal.dark;
    steelBright = rm.metal.bright;
  }

  // ── Grand flowing military cape (behind body) ──
  const capeWave = Math.sin(time * 1.8) * size * 0.03;
  const capeWave2 = Math.sin(time * 2.4 + 0.8) * size * 0.02;
  const capeWave3 = Math.sin(time * 1.3) * size * 0.015;
  const capeBot = 0.28;
  const capeGrad = ctx.createLinearGradient(
    cx,
    y - size * 0.38,
    cx,
    y + size * (capeBot + 0.04)
  );
  capeGrad.addColorStop(0, crimsonDark);
  capeGrad.addColorStop(0.2, crimson);
  capeGrad.addColorStop(0.45, crimsonLight);
  capeGrad.addColorStop(0.65, crimson);
  capeGrad.addColorStop(0.85, crimsonDark);
  capeGrad.addColorStop(1, "#1a0030");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.2, y - size * 0.36 - bodyBob);
  ctx.bezierCurveTo(
    cx - size * 0.34 + capeWave,
    y - size * 0.05,
    cx - size * 0.36 + capeWave2,
    y + size * 0.1,
    cx - size * 0.26 + Math.sin(time * 2.2) * size * 0.025,
    y + size * capeBot
  );
  for (let t = 0; t < 10; t++) {
    const tx =
      cx -
      size * 0.26 +
      t * size * 0.055 +
      Math.sin(time * 2.5 + t * 0.9) * size * 0.012;
    const depth = t % 2 === 0 ? size * 0.035 : -size * 0.012;
    const ty =
      y +
      size * capeBot +
      depth +
      Math.sin(time * 3.2 + t * 0.7) * size * 0.015;
    ctx.lineTo(tx, ty);
  }
  ctx.bezierCurveTo(
    cx + size * 0.36 + capeWave2 * 0.5,
    y + size * 0.1,
    cx + size * 0.34 + capeWave * 0.5,
    y - size * 0.05,
    cx + size * 0.2,
    y - size * 0.36 - bodyBob
  );
  ctx.closePath();
  ctx.fill();

  // Cape gold trim along scalloped bottom edge
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    cx - size * 0.26 + Math.sin(time * 2.2) * size * 0.025,
    y + size * capeBot
  );
  for (let t = 0; t < 10; t++) {
    const tx =
      cx -
      size * 0.26 +
      t * size * 0.055 +
      Math.sin(time * 2.5 + t * 0.9) * size * 0.012;
    const depth = t % 2 === 0 ? size * 0.035 : -size * 0.012;
    const ty =
      y +
      size * capeBot +
      depth +
      Math.sin(time * 3.2 + t * 0.7) * size * 0.015;
    ctx.lineTo(tx, ty);
  }
  ctx.stroke();
  // Second inner gold trim line
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    cx - size * 0.24 + Math.sin(time * 2.2) * size * 0.02,
    y + size * (capeBot - 0.025)
  );
  for (let t = 0; t < 9; t++) {
    const tx =
      cx -
      size * 0.24 +
      t * size * 0.055 +
      Math.sin(time * 2.5 + t * 0.9) * size * 0.01;
    const depth = t % 2 === 0 ? size * 0.025 : -size * 0.008;
    const ty =
      y +
      size * (capeBot - 0.025) +
      depth +
      Math.sin(time * 3.2 + t * 0.7) * size * 0.012;
    ctx.lineTo(tx, ty);
  }
  ctx.stroke();

  // Hanging gold tassel drops along scalloped fringe
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.2 * zoom;
  for (let t = 0; t < 10; t++) {
    const tx =
      cx -
      size * 0.24 +
      t * size * 0.052 +
      Math.sin(time * 2.5 + t * 0.8) * size * 0.01;
    const ty = y + size * capeBot + (t % 2 === 0 ? size * 0.03 : 0);
    const tLen = size * 0.035 + Math.sin(time * 2 + t * 1.2) * size * 0.006;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.sin(time * 2.3 + t) * size * 0.005, ty + tLen);
    ctx.stroke();
    ctx.fillStyle = goldBright;
    ctx.beginPath();
    ctx.arc(
      tx + Math.sin(time * 2.3 + t) * size * 0.005,
      ty + tLen + size * 0.003,
      size * 0.004,
      0,
      TAU
    );
    ctx.fill();
  }

  // Heraldic embroidery — tiger silhouette on cape center
  ctx.save();
  ctx.globalAlpha = 0.35;
  setShadowBlur(ctx, 3 * zoom, goldBright);
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.2 * zoom;
  const embY = y + size * 0.08 - bodyBob;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.04, embY + size * 0.06);
  ctx.quadraticCurveTo(
    cx - size * 0.06,
    embY + size * 0.02,
    cx - size * 0.04,
    embY - size * 0.02
  );
  ctx.quadraticCurveTo(
    cx - size * 0.02,
    embY - size * 0.05,
    cx,
    embY - size * 0.06
  );
  ctx.quadraticCurveTo(
    cx + size * 0.02,
    embY - size * 0.05,
    cx + size * 0.04,
    embY - size * 0.02
  );
  ctx.quadraticCurveTo(
    cx + size * 0.06,
    embY + size * 0.02,
    cx + size * 0.04,
    embY + size * 0.06
  );
  ctx.quadraticCurveTo(
    cx + size * 0.02,
    embY + size * 0.08,
    cx,
    embY + size * 0.07
  );
  ctx.quadraticCurveTo(
    cx - size * 0.02,
    embY + size * 0.08,
    cx - size * 0.04,
    embY + size * 0.06
  );
  ctx.stroke();
  // Tiger ears
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.035, embY - size * 0.025);
  ctx.lineTo(cx - size * 0.045, embY - size * 0.055);
  ctx.lineTo(cx - size * 0.02, embY - size * 0.035);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.035, embY - size * 0.025);
  ctx.lineTo(cx + size * 0.045, embY - size * 0.055);
  ctx.lineTo(cx + size * 0.02, embY - size * 0.035);
  ctx.stroke();
  // Tiger stripes
  for (let s = 0; s < 3; s++) {
    const sy = embY - size * 0.01 + s * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.02, sy);
    ctx.quadraticCurveTo(
      cx - size * 0.035,
      sy + size * 0.01,
      cx - size * 0.025,
      sy + size * 0.018
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.02, sy);
    ctx.quadraticCurveTo(
      cx + size * 0.035,
      sy + size * 0.01,
      cx + size * 0.025,
      sy + size * 0.018
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Heraldic laurel wreaths flanking the tiger
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      cx + side * size * 0.08,
      embY,
      size * 0.045,
      side > 0 ? Math.PI * 0.6 : -Math.PI * 0.4,
      side > 0 ? Math.PI * 1.4 : Math.PI * 0.4
    );
    ctx.stroke();
    for (let l = 0; l < 4; l++) {
      const la =
        (side > 0 ? Math.PI * 0.6 : -Math.PI * 0.4) +
        l * 0.2 * (side > 0 ? 1 : 1.8);
      const lx = cx + side * size * 0.08 + Math.cos(la) * size * 0.045;
      const ly = embY + Math.sin(la) * size * 0.045;
      ctx.beginPath();
      ctx.ellipse(lx, ly, size * 0.008, size * 0.004, la, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Cape inner lining flash (silk shimmer)
  ctx.fillStyle = "rgba(245, 240, 232, 0.12)";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.1, y - size * 0.12 - bodyBob);
  ctx.quadraticCurveTo(
    cx,
    y + size * 0.2,
    cx + size * 0.1,
    y - size * 0.12 - bodyBob
  );
  ctx.closePath();
  ctx.fill();
  // Wind-ripple folds on cape fabric
  ctx.strokeStyle = "rgba(59, 7, 100, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  for (let f = 0; f < 4; f++) {
    const fOff = (f - 1.5) * size * 0.08;
    const fWave = Math.sin(time * 2.2 + f * 1.5) * size * 0.012;
    ctx.beginPath();
    ctx.moveTo(cx + fOff + fWave, y - size * 0.15 - bodyBob);
    ctx.quadraticCurveTo(
      cx + fOff + fWave * 1.5,
      y + size * 0.04,
      cx + fOff + fWave * 0.5,
      y + size * 0.22
    );
    ctx.stroke();
  }

  // ── Shoulder mantle / capelet (over cape, under armor) ──
  const mantleGrad = ctx.createLinearGradient(
    cx - size * 0.25,
    y - size * 0.38,
    cx + size * 0.25,
    y - size * 0.2
  );
  mantleGrad.addColorStop(0, crimsonDark);
  mantleGrad.addColorStop(0.3, crimson);
  mantleGrad.addColorStop(0.5, crimsonLight);
  mantleGrad.addColorStop(0.7, crimson);
  mantleGrad.addColorStop(1, crimsonDark);
  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.18, y - size * 0.36 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.32 + capeWave3,
    y - size * 0.28,
    cx - size * 0.28,
    y - size * 0.16 - bodyBob
  );
  for (let t = 0; t < 6; t++) {
    const tx = cx - size * 0.28 + t * size * 0.1;
    const depth = t % 2 === 0 ? size * 0.02 : -size * 0.01;
    const ty =
      y -
      size * 0.16 +
      depth +
      Math.sin(time * 2.8 + t * 1.1) * size * 0.008 -
      bodyBob;
    ctx.lineTo(tx, ty);
  }
  ctx.quadraticCurveTo(
    cx + size * 0.32 + capeWave3,
    y - size * 0.28,
    cx + size * 0.18,
    y - size * 0.36 - bodyBob
  );
  ctx.closePath();
  ctx.fill();
  // Mantle gold trim
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.28, y - size * 0.16 - bodyBob);
  for (let t = 0; t < 6; t++) {
    const tx = cx - size * 0.28 + t * size * 0.1;
    const depth = t % 2 === 0 ? size * 0.02 : -size * 0.01;
    const ty =
      y -
      size * 0.16 +
      depth +
      Math.sin(time * 2.8 + t * 1.1) * size * 0.008 -
      bodyBob;
    ctx.lineTo(tx, ty);
  }
  ctx.stroke();
  // Mantle fur/ermine trim dots
  ctx.fillStyle = ivory;
  for (let d = 0; d < 8; d++) {
    const dx = cx - size * 0.24 + d * size * 0.07;
    const dy =
      y - size * 0.17 + Math.sin(time * 2.8 + d * 1.1) * size * 0.006 - bodyBob;
    ctx.beginPath();
    ctx.arc(dx, dy, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // ── Ornate quiver on back — gold filigree with tiger emblem ──
  ctx.save();
  ctx.translate(cx + size * 0.1, y - size * 0.12 - bodyBob);
  ctx.rotate(0.18);
  const quiverGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  quiverGrad.addColorStop(0, "#4a2a10");
  quiverGrad.addColorStop(0.3, "#7a4a28");
  quiverGrad.addColorStop(0.5, "#8a5a38");
  quiverGrad.addColorStop(0.7, "#7a4a28");
  quiverGrad.addColorStop(1, "#4a2a10");
  ctx.fillStyle = quiverGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.038, -size * 0.2);
  ctx.lineTo(-size * 0.033, size * 0.12);
  ctx.quadraticCurveTo(0, size * 0.16, size * 0.033, size * 0.12);
  ctx.lineTo(size * 0.038, -size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Gold rims
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.038, -size * 0.2);
  ctx.lineTo(size * 0.038, -size * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.033, size * 0.12);
  ctx.quadraticCurveTo(0, size * 0.16, size * 0.033, size * 0.12);
  ctx.stroke();
  // Gold filigree scrollwork
  ctx.strokeStyle = gold;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.015, -size * 0.02, -size * 0.015, size * 0.02);
  ctx.quadraticCurveTo(size * 0.01, size * 0.05, -size * 0.01, size * 0.08);
  ctx.stroke();
  // Tiger emblem
  ctx.fillStyle = gold;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.14);
  ctx.quadraticCurveTo(size * 0.02, -size * 0.12, size * 0.015, -size * 0.1);
  ctx.lineTo(size * 0.008, -size * 0.09);
  ctx.lineTo(0, -size * 0.1);
  ctx.lineTo(-size * 0.008, -size * 0.09);
  ctx.lineTo(-size * 0.015, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.02, -size * 0.12, 0, -size * 0.14);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Gold strap with buckle
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.2);
  ctx.lineTo(-size * 0.14, -size * 0.1);
  ctx.stroke();
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.arc(-size * 0.14, -size * 0.1, size * 0.006, 0, TAU);
  ctx.fill();
  // Arrow shafts sticking out
  for (let a = 0; a < 5; a++) {
    const ax = -size * 0.018 + a * size * 0.009;
    ctx.strokeStyle = "#b89a70";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.2);
    ctx.lineTo(ax + Math.sin(a) * size * 0.004, -size * 0.32);
    ctx.stroke();
    for (let f = 0; f < 3; f++) {
      const fAngle = (f * TAU) / 3;
      const fx = ax + Math.cos(fAngle) * size * 0.006;
      ctx.fillStyle = f === 0 ? crimsonLight : ivory;
      ctx.beginPath();
      ctx.moveTo(fx, -size * 0.3);
      ctx.lineTo(fx + Math.cos(fAngle) * size * 0.008, -size * 0.28);
      ctx.lineTo(fx, -size * 0.26);
      ctx.fill();
    }
    ctx.fillStyle = "#c0c0c0";
    ctx.beginPath();
    ctx.moveTo(ax - size * 0.005, -size * 0.32);
    ctx.lineTo(ax, -size * 0.35);
    ctx.lineTo(ax + size * 0.005, -size * 0.32);
    ctx.fill();
  }
  ctx.restore();

  // ── Legs — polished dark parade boots ──
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: "#1a1a2e",
    colorDark: "#0d0d1a",
    footColor: "#111122",
    legLen: 0.3,
    strideAmt: 0.26,
    strideSpeed: 3.2,
    style: "fleshy",
    width: 0.06,
  });

  // ── Chainmail underlay visible at torso edges ──
  ctx.strokeStyle = "#aab0b8";
  ctx.lineWidth = 0.7 * zoom;
  for (let row = 0; row < 3; row++) {
    for (let ch = 0; ch < 8; ch++) {
      const chx = cx - size * 0.12 + ch * size * 0.035;
      const chy = y - size * 0.3 + row * size * 0.025 - bodyBob;
      ctx.beginPath();
      ctx.arc(chx, chy, size * 0.007, 0, TAU);
      ctx.stroke();
    }
  }

  // ── Ceremonial breastplate — polished steel with gold inlay ──
  const plateGrad = ctx.createLinearGradient(
    cx - size * 0.14,
    y - size * 0.35,
    cx + size * 0.14,
    y + size * 0.02
  );
  plateGrad.addColorStop(0, steelDark);
  plateGrad.addColorStop(0.2, steel);
  plateGrad.addColorStop(0.45, steelBright);
  plateGrad.addColorStop(0.55, steel);
  plateGrad.addColorStop(0.8, steelDark);
  plateGrad.addColorStop(1, "#555d68");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.17,
    y - size * 0.12 - bodyBob,
    cx - size * 0.13,
    y + size * 0.02 - bodyBob
  );
  ctx.lineTo(cx + size * 0.13, y + size * 0.02 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.17,
    y - size * 0.12 - bodyBob,
    cx + size * 0.14,
    y - size * 0.34 - bodyBob
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = steelDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Polished shine streak
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.04, y - size * 0.32 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.02,
    y - size * 0.15 - bodyBob,
    cx - size * 0.06,
    y - size * 0.02 - bodyBob
  );
  ctx.lineTo(cx - size * 0.01, y - size * 0.02 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.01,
    y - size * 0.15 - bodyBob,
    cx + size * 0.02,
    y - size * 0.32 - bodyBob
  );
  ctx.closePath();
  ctx.fill();
  // Gold inlay — laurel wreath embossed
  setShadowBlur(ctx, 3 * zoom, gold);
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx, y - size * 0.12 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.06,
    y - size * 0.18 - bodyBob,
    cx - size * 0.04,
    y - size * 0.26 - bodyBob
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, y - size * 0.12 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.06,
    y - size * 0.18 - bodyBob,
    cx + size * 0.04,
    y - size * 0.26 - bodyBob
  );
  ctx.stroke();
  ctx.fillStyle = gold;
  for (let l = 0; l < 4; l++) {
    const t = (l + 1) / 5;
    for (const side of [-1, 1]) {
      const lx = cx + side * size * (0.02 + t * 0.04);
      const ly = y - size * (0.14 + t * 0.12) - bodyBob;
      ctx.beginPath();
      ctx.ellipse(lx, ly, size * 0.008, size * 0.004, side * 0.5, 0, TAU);
      ctx.fill();
    }
  }
  clearShadow(ctx);
  // Tiger stripe accents along plate edges
  ctx.strokeStyle = "rgba(212, 160, 23, 0.5)";
  ctx.lineWidth = 0.8 * zoom;
  for (let s = 0; s < 3; s++) {
    const sy = y - size * 0.28 + s * size * 0.1 - bodyBob;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * size * 0.1, sy);
      ctx.quadraticCurveTo(
        cx + side * size * 0.12,
        sy + size * 0.03,
        cx + side * size * 0.1,
        sy + size * 0.06
      );
      ctx.stroke();
    }
  }

  // ── Crimson tabard front panel over breastplate ──
  ctx.fillStyle = crimson;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.055, y - size * 0.3 - bodyBob);
  ctx.lineTo(cx + size * 0.055, y - size * 0.3 - bodyBob);
  ctx.lineTo(cx + size * 0.045, y - size * 0.04 - bodyBob);
  ctx.lineTo(cx - size * 0.045, y - size * 0.04 - bodyBob);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Officer's sash — diagonal across chest ──
  ctx.strokeStyle = crimsonLight;
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.12, y - size * 0.32 - bodyBob);
  ctx.lineTo(cx + size * 0.1, y - size * 0.02 - bodyBob);
  ctx.stroke();
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.13, y - size * 0.33 - bodyBob);
  ctx.lineTo(cx + size * 0.11, y - size * 0.03 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.11, y - size * 0.31 - bodyBob);
  ctx.lineTo(cx + size * 0.09, y - size * 0.01 - bodyBob);
  ctx.stroke();

  // ── Ceremonial medals on sash ──
  const medalColors = [goldBright, "#c0c0c0", crimsonLight];
  for (let m = 0; m < 3; m++) {
    const mt = (m + 1) / 4;
    const mx = cx - size * 0.12 + mt * size * 0.22;
    const my = y - size * 0.32 + mt * size * 0.3 - bodyBob;
    ctx.fillStyle = crimson;
    ctx.fillRect(
      mx - size * 0.008,
      my - size * 0.01,
      size * 0.016,
      size * 0.012
    );
    setShadowBlur(ctx, 2 * zoom, goldBright);
    ctx.fillStyle = medalColors[m];
    ctx.beginPath();
    ctx.arc(mx, my + size * 0.01, size * 0.008, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.arc(mx - size * 0.002, my + size * 0.007, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // ── Sword frog on belt ──
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.roundRect(
    cx + size * 0.1,
    y - size * 0.04 - bodyBob,
    size * 0.015,
    size * 0.06,
    size * 0.003
  );
  ctx.fill();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.roundRect(
    cx + size * 0.097,
    y - size * 0.045 - bodyBob,
    size * 0.02,
    size * 0.008,
    size * 0.002
  );
  ctx.fill();

  // ── Officer's belt ──
  ctx.fillStyle = "#2a1808";
  ctx.fillRect(
    cx - size * 0.14,
    y - size * 0.03 - bodyBob,
    size * 0.28,
    size * 0.03
  );
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(
    cx - size * 0.14,
    y - size * 0.03 - bodyBob,
    size * 0.28,
    size * 0.03
  );
  setShadowBlur(ctx, 2 * zoom, gold);
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.roundRect(
    cx - size * 0.025,
    y - size * 0.035 - bodyBob,
    size * 0.05,
    size * 0.04,
    size * 0.005
  );
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = goldDark;
  ctx.beginPath();
  ctx.arc(cx, y - size * 0.015 - bodyBob, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.arc(cx, y - size * 0.015 - bodyBob, size * 0.006, 0, TAU);
  ctx.fill();

  // ── Epaulettes with gold tassels ──
  for (const side of [-1, 1]) {
    const spx = cx + side * size * 0.16;
    const spy = y - size * 0.33 - bodyBob;
    const epGrad = ctx.createLinearGradient(
      spx - size * 0.05,
      spy,
      spx + size * 0.05,
      spy + size * 0.04
    );
    epGrad.addColorStop(0, goldDark);
    epGrad.addColorStop(0.3, goldBright);
    epGrad.addColorStop(0.6, gold);
    epGrad.addColorStop(1, goldDark);
    ctx.fillStyle = epGrad;
    ctx.beginPath();
    ctx.ellipse(
      spx + side * size * 0.01,
      spy + size * 0.015,
      size * 0.055,
      size * 0.025,
      side * 0.2,
      0,
      TAU
    );
    ctx.fill();
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.arc(
      spx + side * size * 0.01,
      spy + size * 0.025,
      size * 0.04,
      0.2,
      Math.PI - 0.2
    );
    ctx.stroke();
    for (let t = 0; t < 5; t++) {
      const tx = spx + side * size * (-0.03 + t * 0.015);
      const tLen =
        size * (0.04 + (t % 2) * 0.015) +
        Math.sin(time * 2.5 + t) * size * 0.005;
      ctx.strokeStyle = goldBright;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tx, spy + size * 0.035);
      ctx.lineTo(
        tx + Math.sin(time * 1.8 + t * 0.6) * size * 0.004,
        spy + size * 0.035 + tLen
      );
      ctx.stroke();
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(
        tx + Math.sin(time * 1.8 + t * 0.6) * size * 0.004,
        spy + size * 0.038 + tLen,
        size * 0.003,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  // ── Right arm — draw hand with white ceremonial gauntlet ──
  const drawForeLen = 0.14;
  drawPathArm(
    ctx,
    cx + size * 0.15,
    y - size * 0.3 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: crimsonDark,
      colorDark: "#1e0338",
      elbowAngle: 1 + (isAttacking ? attackIntensity * 0.3 : 0),
      foreLen: drawForeLen,
      handColor: ivory,
      onWeapon: (wCtx) => {
        const handY = drawForeLen * size;
        wCtx.translate(0, handY * 0.5);
        wCtx.rotate(0.3);
        // White ceremonial gauntlet with gold knuckle plates
        const tabW = size * 0.022;
        const tabH = size * 0.04;
        wCtx.fillStyle = ivory;
        wCtx.beginPath();
        wCtx.roundRect(-tabW, -tabH * 0.3, tabW * 2, tabH, size * 0.005);
        wCtx.fill();
        wCtx.strokeStyle = gold;
        wCtx.lineWidth = 1 * zoom;
        wCtx.stroke();
        wCtx.fillStyle = goldBright;
        for (let k = 0; k < 3; k++) {
          const ky = -tabH * 0.15 + k * tabH * 0.25;
          wCtx.beginPath();
          wCtx.roundRect(
            -tabW * 0.7,
            ky,
            tabW * 1.4,
            tabH * 0.12,
            size * 0.002
          );
          wCtx.fill();
        }
        wCtx.fillStyle = gold;
        wCtx.beginPath();
        wCtx.roundRect(
          -tabW * 1.1,
          -tabH * 0.35,
          tabW * 2.2,
          tabH * 0.12,
          size * 0.002
        );
        wCtx.fill();

        // String gripped — two string segments pulled back with strong tension
        const drawPull = isAttacking
          ? attackIntensity * size * 0.12
          : size * 0.025;
        const stringAlpha =
          0.85 +
          (isAttacking ? attackIntensity * 0.15 : Math.sin(time * 2) * 0.1);
        wCtx.strokeStyle = `rgba(230, 222, 195, ${stringAlpha})`;
        wCtx.lineWidth = 1.5 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(0, -tabH * 0.1);
        wCtx.lineTo(size * 0.02, -size * 0.16 - drawPull);
        wCtx.stroke();
        wCtx.beginPath();
        wCtx.moveTo(0, tabH * 0.1);
        wCtx.lineTo(size * 0.02, size * 0.16 + drawPull);
        wCtx.stroke();
        // Bright inner highlight
        wCtx.strokeStyle = `rgba(255, 252, 240, ${stringAlpha * 0.55})`;
        wCtx.lineWidth = 0.7 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(0, -tabH * 0.1);
        wCtx.lineTo(size * 0.02, -size * 0.155 - drawPull);
        wCtx.stroke();
        wCtx.beginPath();
        wCtx.moveTo(0, tabH * 0.1);
        wCtx.lineTo(size * 0.02, size * 0.155 + drawPull);
        wCtx.stroke();
        // Glow when drawing
        if (isAttacking) {
          setShadowBlur(wCtx, 4 * zoom, goldBright);
          wCtx.strokeStyle = `rgba(255, 240, 200, ${attackIntensity * 0.4})`;
          wCtx.lineWidth = 2.5 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(0, -tabH * 0.1);
          wCtx.lineTo(size * 0.02, -size * 0.16 - drawPull);
          wCtx.stroke();
          wCtx.beginPath();
          wCtx.moveTo(0, tabH * 0.1);
          wCtx.lineTo(size * 0.02, size * 0.16 + drawPull);
          wCtx.stroke();
          clearShadow(wCtx);
        }
        // Nocked arrow shaft extending forward
        const arrowLen = size * 0.2;
        const arrowGrad = wCtx.createLinearGradient(0, 0, 0, -arrowLen);
        arrowGrad.addColorStop(0, "#b89a70");
        arrowGrad.addColorStop(0.5, "#d4bb90");
        arrowGrad.addColorStop(1, "#b89a70");
        wCtx.strokeStyle = arrowGrad;
        wCtx.lineWidth = 2 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(0, tabH * 0.3);
        wCtx.lineTo(0, -arrowLen);
        wCtx.stroke();
        // Fletching — crimson and ivory vanes
        const fletchColors = [crimsonLight, ivory, ivory];
        for (let f = 0; f < 3; f++) {
          const fOff = (f - 1) * size * 0.005;
          wCtx.fillStyle = fletchColors[f];
          wCtx.beginPath();
          wCtx.moveTo(fOff, tabH * 0.2);
          wCtx.quadraticCurveTo(
            fOff + size * 0.008,
            tabH * 0.05,
            fOff,
            -size * 0.01
          );
          wCtx.quadraticCurveTo(
            fOff - size * 0.004,
            tabH * 0.05,
            fOff,
            tabH * 0.2
          );
          wCtx.fill();
        }
        // Broadhead at far end
        wCtx.fillStyle = "#c8c8c8";
        wCtx.beginPath();
        wCtx.moveTo(0, -arrowLen - size * 0.02);
        wCtx.lineTo(-size * 0.008, -arrowLen);
        wCtx.lineTo(size * 0.008, -arrowLen);
        wCtx.closePath();
        wCtx.fill();
        // Golden glowing arrowhead
        setShadowBlur(wCtx, 4 * zoom, goldBright);
        wCtx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(time * 5) * 0.2})`;
        wCtx.beginPath();
        wCtx.arc(0, -arrowLen - size * 0.01, size * 0.006, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);
      },
      shoulderAngle:
        0.8 +
        Math.sin(time * 1.2) * 0.02 +
        (isAttacking ? attackIntensity * 0.4 : 0),
      style: "fleshy",
      upperLen: 0.15,
      width: 0.048,
    }
  );

  // ── Left arm — ornate ceremonial longbow ──
  const bowForeLen = 0.15;
  drawPathArm(
    ctx,
    cx - size * 0.15,
    y - size * 0.3 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: crimsonDark,
      colorDark: "#1e0338",
      elbowAngle: 0.5 + (isAttacking ? attackIntensity * 0.15 : 0),
      foreLen: bowForeLen,
      handColor: ivory,
      onWeapon: (wCtx) => {
        const handY = bowForeLen * size;
        wCtx.translate(0, handY * 0.45);
        wCtx.rotate(-1.45);

        const bowH = size * 0.48;

        // White-and-gold composite longbow limbs — tapered filled shapes
        const limbBase = 3.5 * zoom;
        const limbTip = 1.2 * zoom;
        const tipBreath = Math.sin(time * 1.8) * 0.005;

        // Upper limb outer edge control points
        const uTipX = size * 0.02;
        const uTipY = -bowH * (0.5 + tipBreath);
        const uHandleX = -size * 0.05;
        const uHandleY = 0;
        const uOC1x = -size * 0.06;
        const uOC1y = -bowH * 0.38;
        const uOC2x = -size * 0.1;
        const uOC2y = -bowH * 0.18;
        // Inner edge is slightly inset/straighter
        const uIC1x = -size * 0.04;
        const uIC1y = -bowH * 0.34;
        const uIC2x = -size * 0.075;
        const uIC2y = -bowH * 0.15;

        const upperGrad = wCtx.createLinearGradient(0, -bowH * 0.5, 0, 0);
        upperGrad.addColorStop(0, ivory);
        upperGrad.addColorStop(0.2, "#e8e0d0");
        upperGrad.addColorStop(0.5, ivory);
        upperGrad.addColorStop(0.8, "#ddd5c5");
        upperGrad.addColorStop(1, ivory);

        // Filled tapered upper limb
        wCtx.fillStyle = upperGrad;
        wCtx.beginPath();
        const halfTip = limbTip / 2;
        const halfBase = limbBase / 2;
        wCtx.moveTo(uTipX, uTipY - halfTip);
        wCtx.bezierCurveTo(
          uOC1x,
          uOC1y - halfTip * 0.7,
          uOC2x,
          uOC2y - halfBase * 0.85,
          uHandleX,
          uHandleY - halfBase
        );
        wCtx.lineTo(uHandleX, uHandleY + halfBase);
        wCtx.bezierCurveTo(
          uIC2x,
          uIC2y + halfBase * 0.85,
          uIC1x,
          uIC1y + halfTip * 0.7,
          uTipX,
          uTipY + halfTip
        );
        wCtx.closePath();
        wCtx.fill();

        // Lower limb
        const lTipX = size * 0.02;
        const lTipY = bowH * (0.5 + tipBreath);
        const lHandleX = -size * 0.05;
        const lHandleY = 0;
        const lOC1x = -size * 0.1;
        const lOC1y = bowH * 0.18;
        const lOC2x = -size * 0.06;
        const lOC2y = bowH * 0.38;

        const lowerGrad = wCtx.createLinearGradient(0, 0, 0, bowH * 0.5);
        lowerGrad.addColorStop(0, ivory);
        lowerGrad.addColorStop(0.2, "#ddd5c5");
        lowerGrad.addColorStop(0.5, ivory);
        lowerGrad.addColorStop(0.8, "#e8e0d0");
        lowerGrad.addColorStop(1, ivory);

        // Filled tapered lower limb
        wCtx.fillStyle = lowerGrad;
        wCtx.beginPath();
        wCtx.moveTo(lHandleX, lHandleY - halfBase);
        wCtx.bezierCurveTo(
          lOC1x,
          lOC1y - halfBase * 0.85,
          lOC2x,
          lOC2y - halfTip * 0.7,
          lTipX,
          lTipY - halfTip
        );
        wCtx.lineTo(lTipX, lTipY + halfTip);
        wCtx.bezierCurveTo(
          lOC2x,
          lOC2y + halfTip * 0.7,
          lOC1x,
          lOC1y + halfBase * 0.85,
          lHandleX,
          lHandleY + halfBase
        );
        wCtx.closePath();
        wCtx.fill();

        // Edge highlight — outer rim light on upper limb
        wCtx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        wCtx.lineWidth = 0.6 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(uTipX, uTipY - halfTip);
        wCtx.bezierCurveTo(
          uOC1x,
          uOC1y - halfTip * 0.7,
          uOC2x,
          uOC2y - halfBase * 0.85,
          uHandleX,
          uHandleY - halfBase
        );
        wCtx.stroke();
        // Edge highlight — outer rim light on lower limb
        wCtx.beginPath();
        wCtx.moveTo(lHandleX, lHandleY - halfBase);
        wCtx.bezierCurveTo(
          lOC1x,
          lOC1y - halfBase * 0.85,
          lOC2x,
          lOC2y - halfTip * 0.7,
          lTipX,
          lTipY - halfTip
        );
        wCtx.stroke();

        // Sinew wrapping — diagonal hatch marks at stress points along upper limb
        wCtx.strokeStyle = "#c8b890";
        wCtx.lineWidth = 0.8 * zoom;
        const sinewPositions = [0.2, 0.45, 0.7, 0.9];
        for (const sp of sinewPositions) {
          const t = sp;
          const t2 = 1 - t;
          const sxOuter =
            t2 * t2 * t2 * uTipX +
            3 * t2 * t2 * t * uOC1x +
            3 * t2 * t * t * uOC2x +
            t * t * t * uHandleX;
          const syOuter =
            t2 * t2 * t2 * uTipY +
            3 * t2 * t2 * t * uOC1y +
            3 * t2 * t * t * uOC2y +
            t * t * t * uHandleY;
          const sw = halfTip + (halfBase - halfTip) * t;
          for (let h = -1; h <= 1; h += 2) {
            wCtx.beginPath();
            wCtx.moveTo(sxOuter - sw * 0.8, syOuter + h * sw * 0.6);
            wCtx.lineTo(sxOuter + sw * 0.8, syOuter - h * sw * 0.6);
            wCtx.stroke();
          }
        }
        // Sinew wrapping on lower limb
        for (const sp of sinewPositions) {
          const t = sp;
          const t2 = 1 - t;
          const sxOuter =
            t2 * t2 * t2 * lHandleX +
            3 * t2 * t2 * t * lOC1x +
            3 * t2 * t * t * lOC2x +
            t * t * t * lTipX;
          const syOuter =
            t2 * t2 * t2 * lHandleY +
            3 * t2 * t2 * t * lOC1y +
            3 * t2 * t * t * lOC2y +
            t * t * t * lTipY;
          const sw = halfBase + (halfTip - halfBase) * t;
          for (let h = -1; h <= 1; h += 2) {
            wCtx.beginPath();
            wCtx.moveTo(sxOuter - sw * 0.8, syOuter + h * sw * 0.6);
            wCtx.lineTo(sxOuter + sw * 0.8, syOuter - h * sw * 0.6);
            wCtx.stroke();
          }
        }

        // Gold inlay lines along each limb
        wCtx.strokeStyle = "rgba(255, 215, 0, 0.6)";
        wCtx.lineWidth = 1 * zoom;
        for (let g = 0; g < 2; g++) {
          const gOff = (g - 0.5) * size * 0.005;
          wCtx.beginPath();
          wCtx.moveTo(size * 0.02 + gOff, -bowH * 0.48);
          wCtx.bezierCurveTo(
            -size * 0.055 + gOff,
            -bowH * 0.36,
            -size * 0.095 + gOff,
            -bowH * 0.16,
            -size * 0.045 + gOff,
            0
          );
          wCtx.stroke();
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.045 + gOff, 0);
          wCtx.bezierCurveTo(
            -size * 0.095 + gOff,
            bowH * 0.16,
            -size * 0.055 + gOff,
            bowH * 0.36,
            size * 0.02 + gOff,
            bowH * 0.48
          );
          wCtx.stroke();
        }

        // Engraved golden limb tips
        for (const dir of [-1, 1]) {
          const tipY = dir * bowH * 0.5;
          wCtx.fillStyle = goldBright;
          wCtx.beginPath();
          wCtx.moveTo(size * 0.02, tipY);
          wCtx.quadraticCurveTo(
            size * 0.045,
            tipY + dir * size * 0.025,
            size * 0.065,
            tipY + dir * size * 0.012
          );
          wCtx.lineTo(size * 0.06, tipY - dir * size * 0.005);
          wCtx.quadraticCurveTo(
            size * 0.035,
            tipY - dir * size * 0.005,
            size * 0.02,
            tipY
          );
          wCtx.fill();
          wCtx.strokeStyle = goldDark;
          wCtx.lineWidth = 0.6 * zoom;
          wCtx.stroke();
          setShadowBlur(wCtx, 3 * zoom, goldBright);
          wCtx.fillStyle = goldBright;
          wCtx.beginPath();
          wCtx.arc(
            size * 0.06,
            tipY + dir * size * 0.005,
            size * 0.005,
            0,
            TAU
          );
          wCtx.fill();
          clearShadow(wCtx);
        }

        // Crimson silk grip wrapping
        const gripY = -size * 0.015;
        const gripH = size * 0.065;
        wCtx.fillStyle = crimson;
        wCtx.beginPath();
        wCtx.roundRect(
          -size * 0.075,
          gripY - gripH / 2,
          size * 0.045,
          gripH,
          size * 0.006
        );
        wCtx.fill();
        wCtx.strokeStyle = goldDark;
        wCtx.lineWidth = 0.8 * zoom;
        wCtx.stroke();
        // Diamond cross-wrap in gold thread
        wCtx.strokeStyle = goldBright;
        wCtx.lineWidth = 0.8 * zoom;
        for (let w = 0; w < 5; w++) {
          const wy = gripY - gripH / 2 + (w * gripH) / 4;
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.075, wy);
          wCtx.lineTo(-size * 0.03, wy + gripH / 8);
          wCtx.stroke();
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.03, wy);
          wCtx.lineTo(-size * 0.075, wy + gripH / 8);
          wCtx.stroke();
        }

        // Ceremonial tassels hanging from lower limb
        const tasselBase = bowH * 0.25;
        for (let t = 0; t < 3; t++) {
          const tOff = (t - 1) * size * 0.012;
          const tLen = size * 0.04 + Math.sin(time * 2.2 + t) * size * 0.008;
          wCtx.strokeStyle = crimsonLight;
          wCtx.lineWidth = 1.2 * zoom;
          const tBaseX = -size * 0.07 + tOff;
          wCtx.beginPath();
          wCtx.moveTo(tBaseX, tasselBase);
          wCtx.lineTo(
            tBaseX + Math.sin(time * 1.5 + t) * size * 0.006,
            tasselBase + tLen
          );
          wCtx.stroke();
          wCtx.fillStyle = goldBright;
          wCtx.beginPath();
          wCtx.arc(
            tBaseX + Math.sin(time * 1.5 + t) * size * 0.006,
            tasselBase + tLen + size * 0.003,
            size * 0.003,
            0,
            TAU
          );
          wCtx.fill();
        }

        // Arrow rest/shelf
        wCtx.fillStyle = gold;
        wCtx.fillRect(
          -size * 0.07,
          gripY - size * 0.005,
          size * 0.03,
          size * 0.01
        );

        // Bowstring — proper catenary with strong pull animation
        const idleDraw = size * 0.05 + Math.sin(time * 1.5) * size * 0.012;
        const stringTwang =
          isAttacking && attackIntensity < 0.3
            ? Math.sin(time * 35) * size * 0.015 * (1 - attackIntensity * 3)
            : 0;
        const stringPull = isAttacking
          ? attackIntensity * size * 0.2 + stringTwang
          : idleDraw;
        wCtx.strokeStyle = "#ede8d0";
        wCtx.lineWidth = 1.5 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(size * 0.06, -bowH * 0.495);
        wCtx.quadraticCurveTo(
          stringPull - size * 0.04,
          0,
          size * 0.06,
          bowH * 0.495
        );
        wCtx.stroke();
        // Bright inner core
        wCtx.strokeStyle = "rgba(255, 252, 240, 0.6)";
        wCtx.lineWidth = 0.7 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(size * 0.06, -bowH * 0.49);
        wCtx.quadraticCurveTo(
          stringPull - size * 0.04,
          0,
          size * 0.06,
          bowH * 0.49
        );
        wCtx.stroke();
        // Glow when pulling back
        if (isAttacking) {
          setShadowBlur(wCtx, 5 * zoom, goldBright);
          wCtx.strokeStyle = `rgba(255, 240, 200, ${attackIntensity * 0.4})`;
          wCtx.lineWidth = 2.5 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(size * 0.06, -bowH * 0.495);
          wCtx.quadraticCurveTo(
            stringPull - size * 0.04,
            0,
            size * 0.06,
            bowH * 0.495
          );
          wCtx.stroke();
          clearShadow(wCtx);
        }

        // Nocking point marker — gold glow
        setShadowBlur(wCtx, 4 * zoom, goldBright);
        wCtx.fillStyle = goldBright;
        const nockX = stringPull - size * 0.035;
        wCtx.beginPath();
        wCtx.arc(nockX, 0, size * 0.006, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);

        // --- NOCKED ARROW ---
        const arrowStart = nockX;
        const arrowEnd = arrowStart - size * 0.28;
        const arrowShaftGrad = wCtx.createLinearGradient(
          arrowStart,
          0,
          arrowEnd,
          0
        );
        arrowShaftGrad.addColorStop(0, "#b89a70");
        arrowShaftGrad.addColorStop(0.5, "#d4bb90");
        arrowShaftGrad.addColorStop(1, "#b89a70");
        wCtx.strokeStyle = arrowShaftGrad;
        wCtx.lineWidth = 2 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(arrowStart, 0);
        wCtx.lineTo(arrowEnd, 0);
        wCtx.stroke();

        // Broadhead — leaf-shaped
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
        wCtx.strokeStyle = "rgba(255,255,255,0.4)";
        wCtx.lineWidth = 0.5 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(headX - size * 0.005, -size * 0.008);
        wCtx.lineTo(headX - size * 0.035, 0);
        wCtx.stroke();

        // Fletching — crimson and ivory vanes
        const fletchStart = arrowStart - size * 0.02;
        const fletchLen = size * 0.04;
        const fletchColors = [crimsonLight, ivory, ivory];
        for (let f = 0; f < 3; f++) {
          const fOff = (f - 1) * size * 0.006;
          wCtx.fillStyle = fletchColors[f];
          wCtx.beginPath();
          wCtx.moveTo(fletchStart, fOff);
          wCtx.quadraticCurveTo(
            fletchStart + fletchLen * 0.5,
            fOff + size * 0.01,
            fletchStart + fletchLen,
            fOff
          );
          wCtx.quadraticCurveTo(
            fletchStart + fletchLen * 0.5,
            fOff - size * 0.004,
            fletchStart,
            fOff
          );
          wCtx.fill();
        }

        // Golden glow on arrowhead
        setShadowBlur(wCtx, 6 * zoom, goldBright);
        wCtx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(time * 5) * 0.2})`;
        wCtx.beginPath();
        wCtx.arc(headX - size * 0.02, 0, size * 0.01, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);

        // Gold rune glow lines on bow limbs
        wCtx.strokeStyle = `rgba(255, 215, 0, ${0.25 + Math.sin(time * 3) * 0.15})`;
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
      shoulderAngle:
        1.25 +
        (isAttacking ? attackIntensity * 0.15 : 0) +
        Math.sin(time * 1.5) * 0.02,
      style: "fleshy",
      upperLen: 0.16,
      width: 0.048,
    }
  );

  // ── Head — grand parade helm with flowing plume ──
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;

  // Face — determined commander
  const faceGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.02,
    0,
    headX,
    headY,
    size * 0.13
  );
  faceGrad.addColorStop(0, "#e8d0b8");
  faceGrad.addColorStop(0.7, "#c4a080");
  faceGrad.addColorStop(1, "#a08060");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.13, 0, TAU);
  ctx.fill();
  // Commanding eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#f0ebe4";
    ctx.beginPath();
    ctx.ellipse(
      headX + side * size * 0.045,
      headY - size * 0.01,
      size * 0.02,
      size * 0.012,
      0,
      0,
      TAU
    );
    ctx.fill();
    ctx.fillStyle = "#2a1a08";
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.045,
      headY - size * 0.01,
      size * 0.009,
      0,
      TAU
    );
    ctx.fill();
    ctx.fillStyle = goldBright;
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.043,
      headY - size * 0.013,
      size * 0.003,
      0,
      TAU
    );
    ctx.fill();
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.025, headY - size * 0.03);
    ctx.lineTo(headX + side * size * 0.065, headY - size * 0.025);
    ctx.stroke();
  }
  // Firm determined mouth
  ctx.strokeStyle = "#6a4a30";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.025, headY + size * 0.045);
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.04,
    headX + size * 0.025,
    headY + size * 0.045
  );
  ctx.stroke();
  // Jawline shadow
  ctx.strokeStyle = "rgba(100, 70, 40, 0.3)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(headX, headY + size * 0.02, size * 0.12, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // ── Grand ceremonial burgonet — polished steel skull with gold engravings ──
  ctx.save();

  // Rear neck guard extending down the back
  const neckGrad = ctx.createLinearGradient(
    headX,
    headY,
    headX,
    headY + size * 0.1
  );
  neckGrad.addColorStop(0, steelDark);
  neckGrad.addColorStop(0.5, steel);
  neckGrad.addColorStop(1, steelDark);
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, headY + size * 0.02);
  ctx.quadraticCurveTo(
    headX - size * 0.16,
    headY + size * 0.06,
    headX - size * 0.12,
    headY + size * 0.1
  );
  ctx.lineTo(headX + size * 0.12, headY + size * 0.1);
  ctx.quadraticCurveTo(
    headX + size * 0.16,
    headY + size * 0.06,
    headX + size * 0.14,
    headY + size * 0.02
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Tall polished steel skull cap covering top and back of head
  const skullGrad = ctx.createRadialGradient(
    headX - size * 0.02,
    headY - size * 0.08,
    0,
    headX,
    headY - size * 0.04,
    size * 0.28
  );
  skullGrad.addColorStop(0, steelBright);
  skullGrad.addColorStop(0.25, "#d4dce6");
  skullGrad.addColorStop(0.5, steel);
  skullGrad.addColorStop(0.75, steelDark);
  skullGrad.addColorStop(1, "#4a5568");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.22, headY + size * 0.02);
  ctx.quadraticCurveTo(
    headX - size * 0.26,
    headY - size * 0.04,
    headX - size * 0.2,
    headY - size * 0.12
  );
  ctx.quadraticCurveTo(
    headX - size * 0.14,
    headY - size * 0.2,
    headX - size * 0.05,
    headY - size * 0.22
  );
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.23,
    headX + size * 0.05,
    headY - size * 0.22
  );
  ctx.quadraticCurveTo(
    headX + size * 0.14,
    headY - size * 0.2,
    headX + size * 0.2,
    headY - size * 0.12
  );
  ctx.quadraticCurveTo(
    headX + size * 0.26,
    headY - size * 0.04,
    headX + size * 0.22,
    headY + size * 0.02
  );
  ctx.quadraticCurveTo(
    headX + size * 0.14,
    headY + size * 0.05,
    headX,
    headY + size * 0.04
  );
  ctx.quadraticCurveTo(
    headX - size * 0.14,
    headY + size * 0.05,
    headX - size * 0.22,
    headY + size * 0.02
  );
  ctx.fill();

  // Polished mirror-shine streak on skull cap
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY - size * 0.21);
  ctx.quadraticCurveTo(
    headX - size * 0.08,
    headY - size * 0.1,
    headX - size * 0.1,
    headY + size * 0.01
  );
  ctx.lineTo(headX - size * 0.04, headY + size * 0.01);
  ctx.quadraticCurveTo(
    headX - size * 0.03,
    headY - size * 0.1,
    headX - size * 0.02,
    headY - size * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // Raised comb/ridge along top center of skull
  const combGrad = ctx.createLinearGradient(
    headX - size * 0.02,
    headY,
    headX + size * 0.02,
    headY
  );
  combGrad.addColorStop(0, steel);
  combGrad.addColorStop(0.5, steelBright);
  combGrad.addColorStop(1, steel);
  ctx.fillStyle = combGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.03, headY - size * 0.1);
  ctx.quadraticCurveTo(
    headX - size * 0.015,
    headY - size * 0.28,
    headX,
    headY - size * 0.3
  );
  ctx.quadraticCurveTo(
    headX + size * 0.015,
    headY - size * 0.28,
    headX + size * 0.03,
    headY - size * 0.1
  );
  ctx.quadraticCurveTo(
    headX + size * 0.01,
    headY - size * 0.22,
    headX,
    headY - size * 0.24
  );
  ctx.quadraticCurveTo(
    headX - size * 0.01,
    headY - size * 0.22,
    headX - size * 0.03,
    headY - size * 0.1
  );
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.24);
  ctx.quadraticCurveTo(
    headX - size * 0.012,
    headY - size * 0.22,
    headX - size * 0.028,
    headY - size * 0.1
  );
  ctx.stroke();

  // Ornate gold-engraved cheek guards / face plate framing the face
  for (const side of [-1, 1]) {
    const cgGrad = ctx.createLinearGradient(
      headX + side * size * 0.1,
      headY - size * 0.05,
      headX + side * size * 0.22,
      headY + size * 0.06
    );
    cgGrad.addColorStop(0, goldBright);
    cgGrad.addColorStop(0.3, gold);
    cgGrad.addColorStop(0.6, goldDark);
    cgGrad.addColorStop(1, gold);
    ctx.fillStyle = cgGrad;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.15, headY - size * 0.08);
    ctx.quadraticCurveTo(
      headX + side * size * 0.24,
      headY - size * 0.02,
      headX + side * size * 0.22,
      headY + size * 0.04
    );
    ctx.quadraticCurveTo(
      headX + side * size * 0.2,
      headY + size * 0.08,
      headX + side * size * 0.14,
      headY + size * 0.09
    );
    ctx.quadraticCurveTo(
      headX + side * size * 0.1,
      headY + size * 0.07,
      headX + side * size * 0.12,
      headY + size * 0.02
    );
    ctx.quadraticCurveTo(
      headX + side * size * 0.13,
      headY - size * 0.03,
      headX + side * size * 0.15,
      headY - size * 0.08
    );
    ctx.fill();
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Engraved scroll pattern on cheek guard
    ctx.strokeStyle = "rgba(139, 105, 20, 0.6)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.16, headY - size * 0.03);
    ctx.quadraticCurveTo(
      headX + side * size * 0.19,
      headY + size * 0.01,
      headX + side * size * 0.17,
      headY + size * 0.04
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.15, headY + size * 0.01);
    ctx.quadraticCurveTo(
      headX + side * size * 0.2,
      headY + size * 0.03,
      headX + side * size * 0.16,
      headY + size * 0.06
    );
    ctx.stroke();

    // Gold rivets on cheek protectors
    ctx.fillStyle = goldBright;
    const rivetPositions = [
      { rx: 0.16, ry: -0.06 },
      { rx: 0.21, ry: 0 },
      { rx: 0.19, ry: 0.06 },
      { rx: 0.14, ry: 0.07 },
    ];
    for (const rp of rivetPositions) {
      setShadowBlur(ctx, 1.5 * zoom, goldBright);
      ctx.beginPath();
      ctx.arc(
        headX + side * size * rp.rx,
        headY + size * rp.ry,
        size * 0.005,
        0,
        TAU
      );
      ctx.fill();
      clearShadow(ctx);
    }
  }

  // Gold brow band across the front of the helm
  setShadowBlur(ctx, 3 * zoom, goldBright);
  const browGrad = ctx.createLinearGradient(
    headX - size * 0.18,
    headY - size * 0.06,
    headX + size * 0.18,
    headY - size * 0.06
  );
  browGrad.addColorStop(0, goldDark);
  browGrad.addColorStop(0.2, goldBright);
  browGrad.addColorStop(0.5, "#fff0c0");
  browGrad.addColorStop(0.8, goldBright);
  browGrad.addColorStop(1, goldDark);
  ctx.fillStyle = browGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.2, headY - size * 0.04);
  ctx.quadraticCurveTo(
    headX - size * 0.15,
    headY - size * 0.1,
    headX,
    headY - size * 0.11
  );
  ctx.quadraticCurveTo(
    headX + size * 0.15,
    headY - size * 0.1,
    headX + size * 0.2,
    headY - size * 0.04
  );
  ctx.quadraticCurveTo(
    headX + size * 0.15,
    headY - size * 0.07,
    headX,
    headY - size * 0.08
  );
  ctx.quadraticCurveTo(
    headX - size * 0.15,
    headY - size * 0.07,
    headX - size * 0.2,
    headY - size * 0.04
  );
  ctx.fill();
  clearShadow(ctx);

  // Gold brow band decorative edge rivets
  ctx.fillStyle = goldBright;
  for (let r = 0; r < 9; r++) {
    const rt = (r + 0.5) / 9;
    const rx = headX - size * 0.17 + rt * size * 0.34;
    const ry = headY - size * 0.06 + Math.sin(rt * Math.PI) * size * -0.035;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Central tiger medallion on the brow band
  setShadowBlur(ctx, 4 * zoom, goldBright);
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.095, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.fillStyle = goldDark;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.095, size * 0.018, 0, TAU);
  ctx.fill();
  // Tiger face engraving on medallion
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.092, size * 0.011, 0, TAU);
  ctx.stroke();
  // Tiger ears
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.008, headY - size * 0.1);
  ctx.lineTo(headX - size * 0.012, headY - size * 0.112);
  ctx.lineTo(headX - size * 0.004, headY - size * 0.103);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.008, headY - size * 0.1);
  ctx.lineTo(headX + size * 0.012, headY - size * 0.112);
  ctx.lineTo(headX + size * 0.004, headY - size * 0.103);
  ctx.stroke();
  // Tiger eyes
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.arc(headX - size * 0.006, headY - size * 0.096, size * 0.002, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.006, headY - size * 0.096, size * 0.002, 0, TAU);
  ctx.fill();
  // Central jewel inset
  ctx.fillStyle = crimsonLight;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.088, size * 0.005, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(headX - size * 0.002, headY - size * 0.09, size * 0.002, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Gold filigree engravings on helmet skull — laurel wreath arcs
  ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
  ctx.lineWidth = 0.8 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.06,
      headY - size * 0.12,
      size * 0.06,
      Math.PI * (side > 0 ? 1.2 : -0.2),
      Math.PI * (side > 0 ? 1.8 : 0.8)
    );
    ctx.stroke();
    for (let l = 0; l < 3; l++) {
      const la = Math.PI * (side > 0 ? 1.2 : -0.2) + l * 0.2;
      const lx = headX + side * size * 0.06 + Math.cos(la) * size * 0.06;
      const ly = headY - size * 0.12 + Math.sin(la) * size * 0.06;
      ctx.beginPath();
      ctx.ellipse(lx, ly, size * 0.006, size * 0.003, la, 0, TAU);
      ctx.stroke();
    }
  }

  // Gold tiger stripe engravings on skull sides
  ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
  ctx.lineWidth = 0.7 * zoom;
  for (const side of [-1, 1]) {
    for (let s = 0; s < 3; s++) {
      const sy = headY - size * 0.18 + s * size * 0.04;
      ctx.beginPath();
      ctx.moveTo(headX + side * size * 0.08, sy);
      ctx.quadraticCurveTo(
        headX + side * size * 0.12,
        sy + size * 0.015,
        headX + side * size * 0.1,
        sy + size * 0.03
      );
      ctx.stroke();
    }
  }

  // Bottom rim gold trim with rivets
  setShadowBlur(ctx, 2 * zoom, gold);
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.21, headY + size * 0.02);
  ctx.quadraticCurveTo(
    headX - size * 0.14,
    headY + size * 0.05,
    headX,
    headY + size * 0.04
  );
  ctx.quadraticCurveTo(
    headX + size * 0.14,
    headY + size * 0.05,
    headX + size * 0.21,
    headY + size * 0.02
  );
  ctx.stroke();
  clearShadow(ctx);

  ctx.restore();

  // ── Massive ceremonial plume crest — triple-layered ──
  ctx.save();
  ctx.translate(headX, headY - size * 0.28);
  const plumeWave = Math.sin(time * 2.5) * 0.15;
  const plumeWave2 = Math.sin(time * 1.8 + 1) * 0.08;
  ctx.rotate(plumeWave * 0.25);
  const plumeH = size * 0.48;

  // Back plume layer — wide dramatic sweep
  const backPlumeGrad = ctx.createLinearGradient(
    -size * 0.06,
    0,
    size * 0.04,
    -plumeH
  );
  backPlumeGrad.addColorStop(0, crimsonDark);
  backPlumeGrad.addColorStop(0.3, "#581c87");
  backPlumeGrad.addColorStop(0.6, "#7c3aed");
  backPlumeGrad.addColorStop(0.85, "#581c87");
  backPlumeGrad.addColorStop(1, "#1a0030");
  ctx.fillStyle = backPlumeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, size * 0.02);
  ctx.bezierCurveTo(
    -size * 0.08 + Math.sin(time * 2.6) * size * 0.02,
    -plumeH * 0.3,
    -size * 0.1 + Math.sin(time * 3) * size * 0.025,
    -plumeH * 0.65,
    -size * 0.06 + Math.sin(time * 2.8) * size * 0.03,
    -plumeH * 0.95
  );
  ctx.quadraticCurveTo(
    size * 0.02 + Math.sin(time * 3.3) * size * 0.015,
    -plumeH * 0.85,
    size * 0.06,
    -plumeH * 0.5
  );
  ctx.quadraticCurveTo(size * 0.05, -plumeH * 0.15, -size * 0.02, size * 0.02);
  ctx.fill();

  // Main plume body — rich purple gradient
  const plumeGrad = ctx.createLinearGradient(0, 0, size * 0.05, -plumeH);
  plumeGrad.addColorStop(0, crimson);
  plumeGrad.addColorStop(0.15, "#9333ea");
  plumeGrad.addColorStop(0.35, "#c084fc");
  plumeGrad.addColorStop(0.55, "#a855f7");
  plumeGrad.addColorStop(0.75, "#9333ea");
  plumeGrad.addColorStop(0.9, "#7c3aed");
  plumeGrad.addColorStop(1, crimsonDark);
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    -size * 0.05 + Math.sin(time * 3) * size * 0.018,
    -plumeH * 0.25,
    -size * 0.06 + Math.sin(time * 2.7) * size * 0.022,
    -plumeH * 0.55,
    -size * 0.03 + Math.sin(time * 2.8) * size * 0.025,
    -plumeH
  );
  ctx.quadraticCurveTo(
    size * 0.03 + Math.sin(time * 3.2) * size * 0.012,
    -plumeH * 0.8,
    size * 0.07,
    -plumeH * 0.35
  );
  ctx.quadraticCurveTo(size * 0.05, -plumeH * 0.1, 0, 0);
  ctx.fill();

  // Front highlight wisp — lighter purple shimmer
  ctx.fillStyle = "rgba(196, 132, 252, 0.5)";
  ctx.beginPath();
  ctx.moveTo(size * 0.01, -size * 0.01);
  ctx.bezierCurveTo(
    size * 0.04 + Math.sin(time * 3.5) * size * 0.012,
    -plumeH * 0.3,
    size * 0.05 + Math.sin(time * 2.9) * size * 0.015,
    -plumeH * 0.6,
    size * 0.02 + Math.sin(time * 2.6) * size * 0.018,
    -plumeH * 0.9
  );
  ctx.quadraticCurveTo(
    size * 0.06,
    -plumeH * 0.45,
    size * 0.04,
    -plumeH * 0.15
  );
  ctx.closePath();
  ctx.fill();

  // Trailing secondary wisp — cascading behind
  ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.01);
  ctx.bezierCurveTo(
    -size * 0.07 + Math.sin(time * 2.3 + 0.5) * size * 0.02,
    -plumeH * 0.2,
    -size * 0.09 + Math.sin(time * 2.7 + 0.8) * size * 0.025,
    -plumeH * 0.5,
    -size * 0.05 + Math.sin(time * 2.5 + 1.2) * size * 0.03,
    -plumeH * 0.8
  );
  ctx.quadraticCurveTo(
    -size * 0.02,
    -plumeH * 0.55,
    -size * 0.01,
    -plumeH * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // Feather barb detail lines — more prominent
  ctx.strokeStyle = "rgba(59, 7, 100, 0.4)";
  ctx.lineWidth = 0.7 * zoom;
  for (let b = 0; b < 10; b++) {
    const bt = (b + 1) / 11;
    const bx =
      -size * 0.025 * (1 - bt) +
      size * 0.04 * bt +
      Math.sin(time * 3 + b * 0.7) * size * 0.006;
    const by = -plumeH * bt;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - size * 0.025, by + size * 0.018);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + size * 0.02, by + size * 0.012);
    ctx.stroke();
  }
  // Secondary barbs on the back layer
  ctx.strokeStyle = "rgba(88, 28, 135, 0.3)";
  for (let b = 0; b < 6; b++) {
    const bt = (b + 1) / 7;
    const bx =
      -size * 0.05 * (1 - bt) + Math.sin(time * 2.6 + b) * size * 0.005;
    const by = -plumeH * bt * 0.85;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - size * 0.02, by + size * 0.02);
    ctx.stroke();
  }

  // Feather tip highlights — luminous wisps at the peak
  setShadowBlur(ctx, 4 * zoom, crimsonLight);
  ctx.fillStyle = `rgba(196, 132, 252, ${0.4 + Math.sin(time * 4) * 0.15})`;
  const tipX = -size * 0.03 + Math.sin(time * 2.8) * size * 0.025;
  const tipY = -plumeH;
  ctx.beginPath();
  ctx.ellipse(tipX, tipY, size * 0.01, size * 0.025, 0.3, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Plume base mount — ornate gold socket with jeweled setting
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.01, size * 0.022, size * 0.012, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Tiny jewel on the socket
  ctx.fillStyle = crimsonLight;
  ctx.beginPath();
  ctx.arc(0, size * 0.01, size * 0.005, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(-size * 0.002, size * 0.008, size * 0.002, 0, TAU);
  ctx.fill();

  ctx.restore();

  // ── Effects — gold/crimson sparkles ──
  drawArcaneSparkles(ctx, cx, y - size * 0.2, size, time, zoom, {
    color: goldBright,
    count: 5,
    sparkleSize: 0.012,
  });

  if (isAttacking) {
    ctx.strokeStyle = `rgba(212, 160, 23, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let r = 0; r < 3; r++) {
      const ringR = size * (0.12 + r * 0.08) * (1 - attackIntensity * 0.3);
      ctx.beginPath();
      ctx.arc(cx + size * 0.3, y - size * 0.3, ringR, 0, TAU);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(107, 33, 168, ${attackIntensity * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let r = 0; r < 2; r++) {
      const ringR = size * (0.16 + r * 0.1) * (1 - attackIntensity * 0.2);
      ctx.beginPath();
      ctx.arc(cx + size * 0.3, y - size * 0.3, ringR, 0, TAU);
      ctx.stroke();
    }
  }

  drawRegionBodyAccent(ctx, cx, y - bodyBob, size, region, time, zoom);
  drawRegionWeaponAccent(
    ctx,
    cx + size * 0.3,
    y - size * 0.3,
    size,
    region,
    time,
    zoom
  );
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
  region: MapTheme = "grassland"
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 1.8, 0.025);
  const sway = getIdleSway(time, 0.7, 1.5, 1);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const alchemyPulse = 0.6 + Math.sin(time * 4) * 0.3;

  let robeBase = "#1a4a3a";
  let robeDark = "#0e3a2e";
  let robeMid = "#123828";
  let robeDarkest = "#082820";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    robeBase = rm.cloth.base;
    robeDark = rm.cloth.dark;
    robeMid = rm.cloth.base;
    robeDarkest = rm.cloth.dark;
  }

  // Flowing alchemist's cape (behind body)
  ctx.save();
  const capeTopY = y - size * 0.34 - bodyBob;
  const capeHalfW = size * 0.28;
  const capeLen = size * 0.6;
  const capeBotY = capeTopY + capeLen;
  const capeWindA = Math.sin(time * 2.2) * size * 0.025;
  const capeWindB = Math.sin(time * 1.7 + 1.5) * size * 0.018;

  // Main cape body (dark teal/emerald)
  const capeGrad = ctx.createLinearGradient(
    cx,
    capeTopY,
    cx + capeWindA * 0.3,
    capeBotY
  );
  capeGrad.addColorStop(0, robeDark);
  capeGrad.addColorStop(0.25, robeBase);
  capeGrad.addColorStop(0.6, robeMid);
  capeGrad.addColorStop(1, robeDarkest);
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.13, capeTopY);
  ctx.quadraticCurveTo(
    cx - capeHalfW - capeWindA,
    capeTopY + capeLen * 0.45,
    cx - capeHalfW * 0.9 + capeWindB,
    capeBotY
  );
  const capeScallops = 7;
  const csLeft = cx - capeHalfW * 0.9 + capeWindB;
  const csRight = cx + capeHalfW * 0.9 - capeWindB;
  const csSpan = csRight - csLeft;
  for (let cs = 0; cs < capeScallops; cs++) {
    const csT0 = cs / capeScallops;
    const csT1 = (cs + 1) / capeScallops;
    const csMidX = csLeft + (csT0 + csT1) * 0.5 * csSpan;
    const csEndX = csLeft + csT1 * csSpan;
    const csDepth =
      size * 0.022 + Math.sin(time * 3.5 + cs * 1.3) * size * 0.01;
    ctx.quadraticCurveTo(csMidX, capeBotY + csDepth, csEndX, capeBotY);
  }
  ctx.quadraticCurveTo(
    cx + capeHalfW + capeWindA,
    capeTopY + capeLen * 0.45,
    cx + size * 0.13,
    capeTopY
  );
  ctx.closePath();
  ctx.fill();

  // Inner lining flash (amber/copper visible at bottom)
  const liningFlash = 0.15 + Math.sin(time * 3) * 0.12;
  ctx.fillStyle = `rgba(160, 80, 30, ${liningFlash})`;
  ctx.beginPath();
  ctx.moveTo(cx - capeHalfW * 0.7 + capeWindB, capeBotY - capeLen * 0.18);
  ctx.quadraticCurveTo(
    cx - capeHalfW + capeWindA,
    capeBotY - capeLen * 0.06,
    cx - capeHalfW * 0.9 + capeWindB,
    capeBotY
  );
  ctx.lineTo(cx + capeHalfW * 0.9 - capeWindB, capeBotY);
  ctx.quadraticCurveTo(
    cx + capeHalfW - capeWindA,
    capeBotY - capeLen * 0.06,
    cx + capeHalfW * 0.7 - capeWindB,
    capeBotY - capeLen * 0.18
  );
  ctx.closePath();
  ctx.fill();

  // Gold trim along scalloped bottom edge
  ctx.strokeStyle = "rgba(184, 148, 46, 0.6)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(csLeft, capeBotY);
  for (let cs = 0; cs < capeScallops; cs++) {
    const csT0 = cs / capeScallops;
    const csT1 = (cs + 1) / capeScallops;
    const csMidX = csLeft + (csT0 + csT1) * 0.5 * csSpan;
    const csEndX = csLeft + csT1 * csSpan;
    const csDepth =
      size * 0.022 + Math.sin(time * 3.5 + cs * 1.3) * size * 0.01;
    ctx.quadraticCurveTo(csMidX, capeBotY + csDepth, csEndX, capeBotY);
  }
  ctx.stroke();

  // Gold trim along cape side edges
  ctx.strokeStyle = "rgba(184, 148, 46, 0.45)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.13, capeTopY);
  ctx.quadraticCurveTo(
    cx - capeHalfW - capeWindA,
    capeTopY + capeLen * 0.45,
    cx - capeHalfW * 0.9 + capeWindB,
    capeBotY
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.13, capeTopY);
  ctx.quadraticCurveTo(
    cx + capeHalfW + capeWindA,
    capeTopY + capeLen * 0.45,
    cx + capeHalfW * 0.9 - capeWindB,
    capeBotY
  );
  ctx.stroke();

  // Alchemy symbols woven into cape fabric
  ctx.strokeStyle = `rgba(40, 180, 140, ${alchemyPulse * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  const capeSym1X = cx - size * 0.08;
  const capeSym1Y = capeTopY + capeLen * 0.3;
  ctx.beginPath();
  ctx.moveTo(capeSym1X, capeSym1Y - size * 0.02);
  ctx.lineTo(capeSym1X - size * 0.015, capeSym1Y + size * 0.015);
  ctx.lineTo(capeSym1X + size * 0.015, capeSym1Y + size * 0.015);
  ctx.closePath();
  ctx.stroke();

  const capeSym2X = cx + size * 0.02;
  const capeSym2Y = capeTopY + capeLen * 0.45;
  ctx.beginPath();
  ctx.arc(capeSym2X, capeSym2Y, size * 0.015, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = `rgba(40, 180, 140, ${alchemyPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(capeSym2X, capeSym2Y, size * 0.003, 0, TAU);
  ctx.fill();

  const capeSym3X = cx + size * 0.1;
  const capeSym3Y = capeTopY + capeLen * 0.32;
  ctx.beginPath();
  ctx.moveTo(capeSym3X, capeSym3Y + size * 0.02);
  ctx.lineTo(capeSym3X - size * 0.015, capeSym3Y - size * 0.015);
  ctx.lineTo(capeSym3X + size * 0.015, capeSym3Y - size * 0.015);
  ctx.closePath();
  ctx.stroke();

  const capeSym4X = cx - size * 0.03;
  const capeSym4Y = capeTopY + capeLen * 0.6;
  ctx.beginPath();
  ctx.arc(capeSym4X, capeSym4Y, size * 0.012, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(capeSym4X, capeSym4Y + size * 0.012);
  ctx.lineTo(capeSym4X, capeSym4Y + size * 0.025);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(capeSym4X - size * 0.01, capeSym4Y + size * 0.02);
  ctx.lineTo(capeSym4X + size * 0.01, capeSym4Y + size * 0.02);
  ctx.stroke();
  ctx.restore();

  // Legs (hidden under long coat)
  drawPathLegs(ctx, cx, y + size * 0.12 - bodyBob, size, time, zoom, {
    color: "#1a1a1a",
    colorDark: "#0d0d0d",
    footColor: "#1e1e1e",
    legLen: 0.15,
    strideAmt: 0.12,
    strideSpeed: 2,
    style: "fleshy",
    width: 0.045,
  });

  // Long alchemist's leather coat — flowing robes, asymmetric cut
  const coatWind = Math.sin(time * 2.5) * size * 0.008;
  const coatWind2 = Math.sin(time * 2 + 0.8) * size * 0.006;
  const coatGrad = ctx.createLinearGradient(
    cx - size * 0.26,
    y - size * 0.35,
    cx + size * 0.26,
    y + size * 0.35
  );
  coatGrad.addColorStop(0, "#1a2a2a");
  coatGrad.addColorStop(0.25, "#2a3c3c");
  coatGrad.addColorStop(0.5, "#1e2e2e");
  coatGrad.addColorStop(0.75, "#182828");
  coatGrad.addColorStop(1, "#0e1a1a");
  ctx.fillStyle = coatGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.24,
    y - size * 0.05 - bodyBob,
    cx - size * 0.24,
    y + size * 0.14
  );
  ctx.quadraticCurveTo(
    cx - size * 0.25 + coatWind,
    y + size * 0.19,
    cx - size * 0.22 + coatWind,
    y + size * 0.25
  );
  ctx.quadraticCurveTo(
    cx - size * 0.18,
    y + size * 0.22,
    cx - size * 0.14 + coatWind2,
    y + size * 0.25
  );
  ctx.quadraticCurveTo(
    cx - size * 0.1,
    y + size * 0.22,
    cx - size * 0.06 + coatWind,
    y + size * 0.24
  );
  ctx.quadraticCurveTo(
    cx - size * 0.02,
    y + size * 0.21,
    cx + size * 0.02 + coatWind2,
    y + size * 0.23
  );
  ctx.quadraticCurveTo(
    cx + size * 0.06,
    y + size * 0.2,
    cx + size * 0.1 + coatWind,
    y + size * 0.22
  );
  ctx.quadraticCurveTo(
    cx + size * 0.14,
    y + size * 0.19,
    cx + size * 0.18 + coatWind2,
    y + size * 0.21
  );
  ctx.quadraticCurveTo(
    cx + size * 0.22,
    y + size * 0.16,
    cx + size * 0.24,
    y + size * 0.1
  );
  ctx.quadraticCurveTo(
    cx + size * 0.24,
    y - size * 0.05 - bodyBob,
    cx + size * 0.14,
    y - size * 0.34 - bodyBob
  );
  ctx.closePath();
  ctx.fill();

  // Trailing back panel (darker, extends further down)
  const backPanelGrad = ctx.createLinearGradient(
    cx,
    y + size * 0.1,
    cx,
    y + size * 0.3
  );
  backPanelGrad.addColorStop(0, "rgba(14, 26, 26, 0.7)");
  backPanelGrad.addColorStop(1, "rgba(8, 18, 18, 0.9)");
  ctx.fillStyle = backPanelGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.1, y + size * 0.12);
  ctx.quadraticCurveTo(
    cx - size * 0.16 + coatWind,
    y + size * 0.22,
    cx - size * 0.12 + coatWind2,
    y + size * 0.28
  );
  ctx.quadraticCurveTo(
    cx - size * 0.06,
    y + size * 0.25,
    cx + coatWind,
    y + size * 0.27
  );
  ctx.quadraticCurveTo(
    cx + size * 0.06,
    y + size * 0.25,
    cx + size * 0.12 - coatWind2,
    y + size * 0.28
  );
  ctx.quadraticCurveTo(
    cx + size * 0.16 - coatWind,
    y + size * 0.22,
    cx + size * 0.1,
    y + size * 0.12
  );
  ctx.closePath();
  ctx.fill();

  // Coat edge stitching lines
  ctx.strokeStyle = "rgba(80, 60, 40, 0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.23, y - size * 0.15 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.24,
    y + size * 0.05,
    cx - size * 0.23,
    y + size * 0.2
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.23, y - size * 0.15 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.24,
    y + size * 0.03,
    cx + size * 0.23,
    y + size * 0.16
  );
  ctx.stroke();

  // Buttoned front with brass clasps (center seam)
  for (let b = 0; b < 5; b++) {
    const by = y - size * 0.28 + b * size * 0.065 - bodyBob;
    const bx = cx + size * 0.005;
    ctx.fillStyle = "#b8942e";
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#8a6e1e";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    ctx.fillStyle = "#d4aa38";
    ctx.beginPath();
    ctx.arc(bx - size * 0.002, by - size * 0.002, size * 0.003, 0, TAU);
    ctx.fill();
  }

  // High collar flaps
  const collarGrad = ctx.createLinearGradient(
    cx - size * 0.12,
    y - size * 0.38,
    cx + size * 0.12,
    y - size * 0.32
  );
  collarGrad.addColorStop(0, "#2a3c3c");
  collarGrad.addColorStop(0.5, "#354848");
  collarGrad.addColorStop(1, "#2a3c3c");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.12, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.1,
    y - size * 0.42 - bodyBob,
    cx - size * 0.04,
    y - size * 0.43 - bodyBob
  );
  ctx.lineTo(cx - size * 0.02, y - size * 0.36 - bodyBob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.12, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.1,
    y - size * 0.42 - bodyBob,
    cx + size * 0.04,
    y - size * 0.43 - bodyBob
  );
  ctx.lineTo(cx + size * 0.02, y - size * 0.36 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Bandolier/harness across chest with potion vials
  ctx.strokeStyle = "#5a3a1a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.12, y - size * 0.32 - bodyBob);
  ctx.lineTo(cx + size * 0.08, y - size * 0.05 - bodyBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.12, y - size * 0.32 - bodyBob);
  ctx.lineTo(cx - size * 0.08, y - size * 0.05 - bodyBob);
  ctx.stroke();

  // Bandolier potion vials (glowing)
  const vialColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];
  const vialPositions = [
    { vx: -0.06, vy: -0.22 },
    { vx: -0.02, vy: -0.17 },
    { vx: 0.02, vy: -0.13 },
    { vx: 0.06, vy: -0.22 },
  ];
  for (let v = 0; v < 4; v++) {
    const vp = vialPositions[v];
    const vx = cx + vp.vx * size;
    const vy = y + vp.vy * size - bodyBob;
    const slosh = Math.sin(time * 3 + v * 2.1) * size * 0.003;
    ctx.fillStyle = "#888";
    ctx.fillRect(
      vx - size * 0.005,
      vy - size * 0.018,
      size * 0.01,
      size * 0.005
    );
    ctx.fillStyle = "rgba(200,210,220,0.5)";
    ctx.beginPath();
    ctx.ellipse(vx, vy, size * 0.009, size * 0.015, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(180,200,210,0.6)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    ctx.fillStyle = vialColors[v];
    ctx.globalAlpha = 0.7 + Math.sin(time * 2.5 + v * 1.8) * 0.2;
    ctx.beginPath();
    ctx.ellipse(
      vx,
      vy + size * 0.003 + slosh,
      size * 0.007,
      size * 0.01,
      0,
      0,
      TAU
    );
    ctx.fill();
    ctx.globalAlpha = 1;
    setShadowBlur(ctx, 3 * zoom, vialColors[v]);
    ctx.fillStyle = vialColors[v];
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(vx, vy, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    clearShadow(ctx);
  }

  // Wide alchemist's belt
  const beltGrad = ctx.createLinearGradient(
    cx - size * 0.16,
    y - size * 0.05,
    cx + size * 0.16,
    y - size * 0.05
  );
  beltGrad.addColorStop(0, "#3a2510");
  beltGrad.addColorStop(0.3, "#5a3a1a");
  beltGrad.addColorStop(0.5, "#6a4a28");
  beltGrad.addColorStop(0.7, "#5a3a1a");
  beltGrad.addColorStop(1, "#3a2510");
  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.15, y - size * 0.065 - bodyBob);
  ctx.lineTo(cx + size * 0.15, y - size * 0.065 - bodyBob);
  ctx.lineTo(cx + size * 0.14, y - size * 0.015 - bodyBob);
  ctx.lineTo(cx - size * 0.14, y - size * 0.015 - bodyBob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8a6818";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Belt buckle (brass)
  ctx.fillStyle = "#c8a030";
  ctx.beginPath();
  ctx.roundRect(
    cx - size * 0.02,
    y - size * 0.06 - bodyBob,
    size * 0.04,
    size * 0.04,
    size * 0.004
  );
  ctx.fill();
  ctx.strokeStyle = "#9a7818";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Belt pouches
  for (const side of [-1, 1]) {
    const px = cx + side * size * 0.1;
    const py = y - size * 0.03 - bodyBob;
    ctx.fillStyle = "#4a3018";
    ctx.beginPath();
    ctx.roundRect(
      px - size * 0.018,
      py - size * 0.015,
      size * 0.036,
      size * 0.03,
      size * 0.004
    );
    ctx.fill();
    ctx.strokeStyle = "#2a1a08";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#8a6818";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(px - size * 0.012, py - size * 0.015);
    ctx.lineTo(px + size * 0.012, py - size * 0.015);
    ctx.stroke();
  }

  // Mortar-and-pestle on belt (right side)
  const mortarX = cx + size * 0.05;
  const mortarY = y - size * 0.01 - bodyBob;
  ctx.fillStyle = "#7a7a7a";
  ctx.beginPath();
  ctx.moveTo(mortarX - size * 0.012, mortarY);
  ctx.lineTo(mortarX - size * 0.015, mortarY + size * 0.018);
  ctx.lineTo(mortarX + size * 0.015, mortarY + size * 0.018);
  ctx.lineTo(mortarX + size * 0.012, mortarY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();
  ctx.strokeStyle = "#9a9a9a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(mortarX + size * 0.008, mortarY - size * 0.005);
  ctx.lineTo(mortarX + size * 0.02, mortarY - size * 0.02);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Leather/brass epaulettes with bubbling beakers
  for (const side of [-1, 1]) {
    const epX = cx + side * size * 0.15;
    const epY = y - size * 0.33 - bodyBob;
    const epGrad = ctx.createRadialGradient(
      epX,
      epY,
      0,
      epX,
      epY,
      size * 0.035
    );
    epGrad.addColorStop(0, "#5a3a1a");
    epGrad.addColorStop(0.6, "#3a2510");
    epGrad.addColorStop(1, "#2a1a0a");
    ctx.fillStyle = epGrad;
    ctx.beginPath();
    ctx.ellipse(epX, epY, size * 0.035, size * 0.025, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#b8942e";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Brass rivets
    for (let rv = 0; rv < 3; rv++) {
      const rvX = epX + (rv - 1) * size * 0.015 * side;
      ctx.fillStyle = "#c8a838";
      ctx.beginPath();
      ctx.arc(rvX, epY, size * 0.004, 0, TAU);
      ctx.fill();
    }

    // Small beaker on epaulette
    const beakerX = epX + side * size * 0.02;
    const beakerY = epY - size * 0.025;
    ctx.fillStyle = "rgba(180,210,200,0.5)";
    ctx.beginPath();
    ctx.moveTo(beakerX - size * 0.006, beakerY);
    ctx.lineTo(beakerX - size * 0.008, beakerY + size * 0.02);
    ctx.lineTo(beakerX + size * 0.008, beakerY + size * 0.02);
    ctx.lineTo(beakerX + size * 0.006, beakerY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(140,170,160,0.6)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    const bubblePhase = Math.sin(time * 5 + side * 2);
    if (bubblePhase > 0) {
      ctx.fillStyle = `rgba(40, 200, 160, ${bubblePhase * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        beakerX,
        beakerY - size * 0.005 * bubblePhase,
        size * 0.003,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  // Left arm — MEDICAL GRIMOIRE
  const bookForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.2,
    y - size * 0.28 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: "#1a2a2a",
      colorDark: "#0e1a1a",
      elbowAngle: 0.45 + (isAttacking ? -attackIntensity * 0.15 : 0),
      foreLen: bookForeLen,
      handColor: "#1e1e1e",
      onWeapon: (wCtx) => {
        const handY = bookForeLen * size;
        wCtx.translate(0, handY * 0.5);
        wCtx.rotate(-0.55);
        wCtx.scale(-1, 1);
        const bW = size * 0.09;
        const bH = size * 0.07;

        // Thick dark leather cover
        const coverGrad = wCtx.createLinearGradient(-bW, -bH, bW, bH);
        coverGrad.addColorStop(0, "#1a1a1a");
        coverGrad.addColorStop(0.3, "#2a2a28");
        coverGrad.addColorStop(0.7, "#1a1a1a");
        coverGrad.addColorStop(1, "#0e0e0e");
        wCtx.fillStyle = coverGrad;
        wCtx.beginPath();
        wCtx.roundRect(
          -bW - size * 0.005,
          -bH - size * 0.005,
          bW * 2 + size * 0.01,
          bH * 2 + size * 0.01,
          size * 0.006
        );
        wCtx.fill();

        // Biohazard/alchemy symbol embossed on cover
        wCtx.strokeStyle = "#b8942e";
        wCtx.lineWidth = 0.8 * zoom;
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.02, 0, TAU);
        wCtx.stroke();
        for (let tri = 0; tri < 3; tri++) {
          const ta = (tri * TAU) / 3 - Math.PI / 2;
          wCtx.beginPath();
          wCtx.moveTo(0, 0);
          wCtx.lineTo(Math.cos(ta) * size * 0.025, Math.sin(ta) * size * 0.025);
          wCtx.stroke();
        }

        // Left page — aged parchment with anatomical drawing
        wCtx.fillStyle = "#e8dcc0";
        wCtx.beginPath();
        wCtx.moveTo(-bW + size * 0.005, -bH + size * 0.005);
        wCtx.lineTo(-size * 0.003, -bH + size * 0.005);
        wCtx.quadraticCurveTo(
          -size * (0.006 + Math.sin(time * 3) * 0.002),
          0,
          -size * 0.003,
          bH - size * 0.005
        );
        wCtx.lineTo(-bW + size * 0.005, bH - size * 0.005);
        wCtx.closePath();
        wCtx.fill();

        // Anatomical sketch — simplified ribcage/torso outline
        wCtx.strokeStyle = "rgba(80, 40, 20, 0.5)";
        wCtx.lineWidth = 0.5 * zoom;
        const sketchCx = -bW * 0.5;
        const sketchCy = 0;
        wCtx.beginPath();
        wCtx.ellipse(
          sketchCx,
          sketchCy - size * 0.015,
          size * 0.015,
          size * 0.02,
          0,
          0,
          TAU
        );
        wCtx.stroke();
        for (let rib = 0; rib < 3; rib++) {
          const ribY = sketchCy + rib * size * 0.008;
          wCtx.beginPath();
          wCtx.moveTo(sketchCx - size * 0.012, ribY);
          wCtx.quadraticCurveTo(
            sketchCx,
            ribY + size * 0.003,
            sketchCx + size * 0.012,
            ribY
          );
          wCtx.stroke();
        }
        wCtx.beginPath();
        wCtx.moveTo(sketchCx, sketchCy - size * 0.01);
        wCtx.lineTo(sketchCx, sketchCy + size * 0.03);
        wCtx.stroke();

        // Right page — formulas and notes
        wCtx.fillStyle = "#f0e4c8";
        wCtx.beginPath();
        wCtx.moveTo(size * 0.003, -bH + size * 0.005);
        wCtx.lineTo(bW - size * 0.005, -bH + size * 0.005);
        wCtx.lineTo(bW - size * 0.005, bH - size * 0.005);
        wCtx.lineTo(size * 0.003, bH - size * 0.005);
        wCtx.quadraticCurveTo(
          size * 0.006,
          0,
          size * 0.003,
          -bH + size * 0.005
        );
        wCtx.fill();

        // Spine
        const spineGrad = wCtx.createLinearGradient(
          -size * 0.008,
          0,
          size * 0.008,
          0
        );
        spineGrad.addColorStop(0, "#0e0e0e");
        spineGrad.addColorStop(0.5, "#2a2a28");
        spineGrad.addColorStop(1, "#0e0e0e");
        wCtx.fillStyle = spineGrad;
        wCtx.fillRect(
          -size * 0.005,
          -bH - size * 0.005,
          size * 0.01,
          bH * 2 + size * 0.01
        );

        // Brass corner clasps
        wCtx.fillStyle = "#b8942e";
        for (const ccx of [-1, 1]) {
          for (const ccy of [-1, 1]) {
            wCtx.beginPath();
            wCtx.moveTo(ccx * (bW + size * 0.002), ccy * (bH + size * 0.002));
            wCtx.lineTo(ccx * (bW - size * 0.012), ccy * (bH + size * 0.002));
            wCtx.lineTo(ccx * (bW + size * 0.002), ccy * (bH - size * 0.012));
            wCtx.closePath();
            wCtx.fill();
          }
        }

        // Formula text lines (right page)
        wCtx.strokeStyle = `rgba(40, 120, 90, ${alchemyPulse * 0.5})`;
        wCtx.lineWidth = 0.7 * zoom;
        for (let line = 0; line < 5; line++) {
          const ly = -bH * 0.55 + line * size * 0.018;
          const lw = bW * 0.65 - (line % 2) * size * 0.008;
          wCtx.beginPath();
          wCtx.moveTo(size * 0.015, ly);
          wCtx.lineTo(size * 0.015 + lw, ly);
          wCtx.stroke();
        }

        // Small flask diagram on right page
        wCtx.strokeStyle = `rgba(40, 180, 140, ${alchemyPulse * 0.6})`;
        wCtx.lineWidth = 0.8 * zoom;
        const flaskX = bW * 0.45;
        const flaskY = size * 0.015;
        wCtx.beginPath();
        wCtx.moveTo(flaskX - size * 0.005, flaskY - size * 0.015);
        wCtx.lineTo(flaskX - size * 0.005, flaskY - size * 0.005);
        wCtx.lineTo(flaskX - size * 0.012, flaskY + size * 0.01);
        wCtx.lineTo(flaskX + size * 0.012, flaskY + size * 0.01);
        wCtx.lineTo(flaskX + size * 0.005, flaskY - size * 0.005);
        wCtx.lineTo(flaskX + size * 0.005, flaskY - size * 0.015);
        wCtx.closePath();
        wCtx.stroke();
        wCtx.fillStyle = `rgba(40, 180, 140, ${alchemyPulse * 0.25})`;
        wCtx.fill();

        // Eye loupe on chain
        wCtx.strokeStyle = "#b8942e";
        wCtx.lineWidth = 0.6 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(bW + size * 0.002, -bH * 0.5);
        wCtx.quadraticCurveTo(
          bW + size * 0.03,
          -bH * 0.3,
          bW + size * 0.025,
          bH * 0.1
        );
        wCtx.stroke();
        wCtx.strokeStyle = "#8a6818";
        wCtx.lineWidth = 1.2 * zoom;
        wCtx.beginPath();
        wCtx.arc(bW + size * 0.025, bH * 0.1, size * 0.012, 0, TAU);
        wCtx.stroke();
        wCtx.fillStyle = "rgba(180, 220, 255, 0.3)";
        wCtx.fill();

        // Green vapor motes rising from book
        for (let m = 0; m < 3; m++) {
          const mAngle = time * 2.5 + (m * TAU) / 3;
          const mR = size * 0.06;
          const mx = Math.cos(mAngle) * mR;
          const my = Math.sin(mAngle) * mR * 0.5 - size * 0.03;
          wCtx.fillStyle = `rgba(40, 200, 160, ${alchemyPulse * 0.45})`;
          wCtx.beginPath();
          wCtx.arc(mx, my, size * 0.004, 0, TAU);
          wCtx.fill();
        }
      },
      shoulderAngle:
        0.4 +
        Math.sin(time * 1) * 0.03 +
        (isAttacking ? -attackIntensity * 0.25 : 0),
      style: "fleshy",
      upperLen: 0.15,
      width: 0.048,
    }
  );

  // Right arm — CADUCEUS STAFF
  const staffForeLen = 0.15;
  drawPathArm(
    ctx,
    cx + size * 0.2,
    y - size * 0.28 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: "#1a2a2a",
      colorDark: "#0e1a1a",
      elbowAngle: -0.15 + (isAttacking ? -attackIntensity * 0.1 : 0),
      foreLen: staffForeLen,
      handColor: "#1e1e1e",
      onWeapon: (wCtx) => {
        const handY = staffForeLen * size;
        wCtx.translate(0, handY * 0.5);
        wCtx.rotate(0.7);
        wCtx.scale(-1, 1);
        const shaftH = size * 0.6;

        // Dark iron shaft
        const shaftGrad = wCtx.createLinearGradient(
          -size * 0.015,
          0,
          size * 0.015,
          0
        );
        shaftGrad.addColorStop(0, "#2a2a2a");
        shaftGrad.addColorStop(0.3, "#4a4a4a");
        shaftGrad.addColorStop(0.5, "#555");
        shaftGrad.addColorStop(0.7, "#4a4a4a");
        shaftGrad.addColorStop(1, "#2a2a2a");
        wCtx.strokeStyle = shaftGrad;
        wCtx.lineWidth = 4 * zoom;
        wCtx.lineCap = "round";
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.08);
        wCtx.lineTo(0, -shaftH);
        wCtx.stroke();
        wCtx.lineCap = "butt";

        // Brass reinforcement bands
        for (let b = 0; b < 4; b++) {
          const by = -shaftH * 0.1 - b * shaftH * 0.2;
          const bandGrad = wCtx.createLinearGradient(
            -size * 0.02,
            by,
            size * 0.02,
            by
          );
          bandGrad.addColorStop(0, "#8a6818");
          bandGrad.addColorStop(0.5, "#d4aa38");
          bandGrad.addColorStop(1, "#8a6818");
          wCtx.fillStyle = bandGrad;
          wCtx.fillRect(
            -size * 0.02,
            by - size * 0.003,
            size * 0.04,
            size * 0.006
          );
        }

        // Two intertwined serpents spiraling up the shaft
        const serpentColors = ["#2a6a4a", "#1a5a3a"];
        for (let s = 0; s < 2; s++) {
          const phaseOff = s * Math.PI;
          wCtx.strokeStyle = serpentColors[s];
          wCtx.lineWidth = 2.5 * zoom;
          wCtx.lineCap = "round";
          wCtx.beginPath();
          let started = false;
          for (let t = 0; t <= 1; t += 0.02) {
            const sy = size * 0.04 - t * (shaftH + size * 0.04);
            const sx = Math.sin(t * 8 + phaseOff + time * 1.5) * size * 0.025;
            if (!started) {
              wCtx.moveTo(sx, sy);
              started = true;
            } else {
              wCtx.lineTo(sx, sy);
            }
          }
          wCtx.stroke();
          wCtx.lineCap = "butt";

          // Serpent scales highlight
          wCtx.strokeStyle = `rgba(60, 160, 100, 0.3)`;
          wCtx.lineWidth = 1.2 * zoom;
          for (let sc = 0; sc < 8; sc++) {
            const scT = sc / 8;
            const scY = size * 0.04 - scT * (shaftH + size * 0.04);
            const scX =
              Math.sin(scT * 8 + phaseOff + time * 1.5) * size * 0.025;
            wCtx.beginPath();
            wCtx.arc(scX, scY, size * 0.005, 0, Math.PI);
            wCtx.stroke();
          }
        }

        // Serpent heads at top (flaring outward)
        for (let s = 0; s < 2; s++) {
          const headSide = s === 0 ? -1 : 1;
          const hx = headSide * size * 0.03;
          const hy = -shaftH - size * 0.02;
          wCtx.fillStyle = s === 0 ? "#2a6a4a" : "#1a5a3a";
          wCtx.beginPath();
          wCtx.moveTo(hx - headSide * size * 0.005, hy + size * 0.01);
          wCtx.quadraticCurveTo(
            hx + headSide * size * 0.015,
            hy,
            hx + headSide * size * 0.008,
            hy - size * 0.012
          );
          wCtx.quadraticCurveTo(
            hx,
            hy - size * 0.005,
            hx - headSide * size * 0.005,
            hy + size * 0.01
          );
          wCtx.fill();
          wCtx.fillStyle = "#ff3030";
          wCtx.beginPath();
          wCtx.arc(
            hx + headSide * size * 0.008,
            hy - size * 0.005,
            size * 0.002,
            0,
            TAU
          );
          wCtx.fill();
        }

        // Iron foot cap
        wCtx.fillStyle = "#5a5a5a";
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.012, size * 0.07);
        wCtx.lineTo(0, size * 0.1);
        wCtx.lineTo(size * 0.012, size * 0.07);
        wCtx.closePath();
        wCtx.fill();

        // Glowing emerald orb between serpent heads
        const orbCy = -shaftH - size * 0.05;
        setShadowBlur(wCtx, 12 * zoom, "#28c896");
        const orbGrad = wCtx.createRadialGradient(
          0,
          orbCy,
          0,
          0,
          orbCy,
          size * 0.04
        );
        orbGrad.addColorStop(0, "#c0fff0");
        orbGrad.addColorStop(0.25, "#40e8a8");
        orbGrad.addColorStop(0.6, "#20a870");
        orbGrad.addColorStop(1, "#106040");
        wCtx.fillStyle = orbGrad;
        wCtx.beginPath();
        wCtx.arc(0, orbCy, size * 0.035, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = "rgba(255,255,255,0.45)";
        wCtx.beginPath();
        wCtx.arc(-size * 0.01, orbCy - size * 0.01, size * 0.012, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = "rgba(255,255,255,0.25)";
        wCtx.beginPath();
        wCtx.arc(size * 0.005, orbCy + size * 0.008, size * 0.006, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);

        // Energy wisps from orb (green/teal)
        wCtx.strokeStyle = `rgba(40, 200, 160, ${alchemyPulse * 0.5})`;
        wCtx.lineWidth = 1.2 * zoom;
        for (let w = 0; w < 4; w++) {
          const wAngle = time * 3 + (w * TAU) / 4;
          const wR = size * 0.06;
          wCtx.beginPath();
          wCtx.moveTo(
            Math.cos(wAngle) * size * 0.02,
            orbCy + Math.sin(wAngle) * size * 0.02
          );
          wCtx.quadraticCurveTo(
            Math.cos(wAngle + 0.5) * wR,
            orbCy + Math.sin(wAngle + 0.5) * wR * 0.6,
            Math.cos(wAngle + 1) * wR * 0.8,
            orbCy + Math.sin(wAngle + 1) * wR * 0.5
          );
          wCtx.stroke();
        }
      },
      shoulderAngle:
        -(0.75 + (isAttacking ? attackIntensity * 0.15 : 0)) +
        Math.sin(time * 1.3) * 0.02,
      style: "fleshy",
      upperLen: 0.16,
      width: 0.048,
    }
  );

  // HEAD — Plague Doctor Mask + Wide-brimmed Hat
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;

  // Mask base — dark leather head shape
  const maskGrad = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.12
  );
  maskGrad.addColorStop(0, "#3a3028");
  maskGrad.addColorStop(0.6, "#2a2018");
  maskGrad.addColorStop(1, "#1a1410");
  ctx.fillStyle = maskGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.11, size * 0.12, 0, 0, TAU);
  ctx.fill();

  // Mask stitching lines (across forehead and cheeks)
  ctx.strokeStyle = "rgba(90, 70, 50, 0.5)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY - size * 0.03);
  ctx.lineTo(headX + size * 0.08, headY - size * 0.03);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.1);
  ctx.lineTo(headX, headY + size * 0.04);
  ctx.stroke();

  // Plague beak — long curved beak pointing forward/down
  const beakGrad = ctx.createLinearGradient(
    headX,
    headY,
    headX,
    headY + size * 0.22
  );
  beakGrad.addColorStop(0, "#3a3028");
  beakGrad.addColorStop(0.4, "#2a2018");
  beakGrad.addColorStop(1, "#1a1410");
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.05, headY + size * 0.02);
  ctx.quadraticCurveTo(
    headX - size * 0.06,
    headY + size * 0.1,
    headX,
    headY + size * 0.2 + Math.sin(time * 2) * size * 0.005
  );
  ctx.quadraticCurveTo(
    headX + size * 0.06,
    headY + size * 0.1,
    headX + size * 0.05,
    headY + size * 0.02
  );
  ctx.closePath();
  ctx.fill();

  // Beak center ridge
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.03);
  ctx.lineTo(headX, headY + size * 0.19);
  ctx.stroke();

  // Brass rivets along beak
  ctx.fillStyle = "#c8a838";
  for (let rv = 0; rv < 4; rv++) {
    const rvY = headY + size * 0.05 + rv * size * 0.035;
    const beakWidth = size * 0.04 * (1 - rv * 0.2);
    ctx.beginPath();
    ctx.arc(headX - beakWidth, rvY, size * 0.004, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + beakWidth, rvY, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Brass goggle lenses — eerie green glow
  for (const side of [-1, 1]) {
    const lensX = headX + side * size * 0.045;
    const lensY = headY - size * 0.02;

    // Brass frame
    ctx.strokeStyle = "#b8942e";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(lensX, lensY, size * 0.032, size * 0.028, 0, 0, TAU);
    ctx.stroke();

    // Outer brass ring
    ctx.strokeStyle = "#8a6e1e";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(lensX, lensY, size * 0.036, size * 0.032, 0, 0, TAU);
    ctx.stroke();

    // Green glowing lens
    setShadowBlur(ctx, 8 * zoom, "#40e8a0");
    const lensGrad = ctx.createRadialGradient(
      lensX,
      lensY,
      0,
      lensX,
      lensY,
      size * 0.028
    );
    lensGrad.addColorStop(
      0,
      `rgba(150, 255, 200, ${0.7 + alchemyPulse * 0.3})`
    );
    lensGrad.addColorStop(
      0.4,
      `rgba(60, 220, 140, ${0.6 + alchemyPulse * 0.2})`
    );
    lensGrad.addColorStop(1, `rgba(20, 120, 80, ${0.5 + alchemyPulse * 0.2})`);
    ctx.fillStyle = lensGrad;
    ctx.beginPath();
    ctx.ellipse(lensX, lensY, size * 0.028, size * 0.024, 0, 0, TAU);
    ctx.fill();
    clearShadow(ctx);

    // Lens glint
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(
      lensX - side * size * 0.008,
      lensY - size * 0.008,
      size * 0.007,
      0,
      TAU
    );
    ctx.fill();

    // Connecting strap to frame
    ctx.strokeStyle = "#5a4a2a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lensX + side * size * 0.035, lensY);
    ctx.lineTo(headX + side * size * 0.1, lensY);
    ctx.stroke();
  }

  // Goggle bridge
  ctx.strokeStyle = "#b8942e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.015, headY - size * 0.02);
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.035,
    headX + size * 0.015,
    headY - size * 0.02
  );
  ctx.stroke();

  // Wide-brimmed dark hat
  const hatBaseY = headY - size * 0.1;

  // Brim
  const brimGrad = ctx.createRadialGradient(
    headX,
    hatBaseY,
    size * 0.05,
    headX,
    hatBaseY,
    size * 0.22
  );
  brimGrad.addColorStop(0, "#1e1e1e");
  brimGrad.addColorStop(0.6, "#151515");
  brimGrad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = brimGrad;
  ctx.beginPath();
  ctx.ellipse(headX, hatBaseY, size * 0.22, size * 0.06, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Hat crown — flat-topped, wide
  const crownGrad = ctx.createLinearGradient(
    headX - size * 0.1,
    hatBaseY,
    headX + size * 0.1,
    hatBaseY - size * 0.18
  );
  crownGrad.addColorStop(0, "#1a1a1a");
  crownGrad.addColorStop(0.5, "#222");
  crownGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, hatBaseY);
  ctx.lineTo(headX - size * 0.09, hatBaseY - size * 0.18);
  ctx.quadraticCurveTo(
    headX,
    hatBaseY - size * 0.2,
    headX + size * 0.09,
    hatBaseY - size * 0.18
  );
  ctx.lineTo(headX + size * 0.1, hatBaseY);
  ctx.closePath();
  ctx.fill();

  // Hat band (brass buckle)
  ctx.strokeStyle = "#b8942e";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, hatBaseY - size * 0.02);
  ctx.lineTo(headX + size * 0.1, hatBaseY - size * 0.02);
  ctx.stroke();
  ctx.fillStyle = "#c8a838";
  ctx.beginPath();
  ctx.roundRect(
    headX - size * 0.015,
    hatBaseY - size * 0.032,
    size * 0.03,
    size * 0.024,
    size * 0.003
  );
  ctx.fill();

  // Orbiting floating potion droplets (replacing arcane orbs)
  for (let orb = 0; orb < 4; orb++) {
    const orbAngle = time * 1.5 + (orb * TAU) / 4;
    const orbDist = size * 0.35;
    const ox = cx + Math.cos(orbAngle) * orbDist;
    const oy = y - size * 0.2 + Math.sin(orbAngle) * orbDist * 0.4 - bodyBob;
    const dropColor = vialColors[orb];
    const dropPulse = 0.4 + Math.sin(time * 3 + orb * 2) * 0.3;
    setShadowBlur(ctx, 4 * zoom, dropColor);
    ctx.fillStyle = dropColor;
    ctx.globalAlpha = dropPulse;
    ctx.beginPath();
    ctx.moveTo(ox, oy - size * 0.015);
    ctx.quadraticCurveTo(ox + size * 0.01, oy, ox, oy + size * 0.008);
    ctx.quadraticCurveTo(ox - size * 0.01, oy, ox, oy - size * 0.015);
    ctx.fill();
    ctx.globalAlpha = 1;
    clearShadow(ctx);
    ctx.fillStyle = `rgba(40, 200, 160, ${dropPulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(ox, oy + size * 0.012, size * 0.003, 0, TAU);
    ctx.fill();
  }

  drawArcaneSparkles(ctx, cx, y - size * 0.3, size, time, zoom, {
    color: "#28c896",
    count: 6,
    sparkleSize: 0.015,
  });

  // Alchemical vapor wisps
  ctx.strokeStyle = `rgba(40, 180, 140, ${alchemyPulse * 0.3})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let v = 0; v < 4; v++) {
    const vPhase = time * 1.8 + v * 1.6;
    const vx = cx + Math.sin(vPhase) * size * 0.15;
    const vy = y - size * 0.1 - bodyBob - ((time * 20 + v * 15) % (size * 0.5));
    const vAlpha = 1 - ((time * 20 + v * 15) % (size * 0.5)) / (size * 0.5);
    if (vAlpha > 0) {
      ctx.globalAlpha = vAlpha * alchemyPulse * 0.3;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.quadraticCurveTo(
        vx + Math.sin(vPhase + 1) * size * 0.04,
        vy - size * 0.04,
        vx + Math.sin(vPhase + 2) * size * 0.03,
        vy - size * 0.08
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  if (isAttacking) {
    ctx.strokeStyle = `rgba(40, 200, 160, ${attackIntensity * 0.7})`;
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
  attackPhase: number = 0
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.2)
    : 0.6 + Math.sin(time * 1) * 0.3;
  const armAngle =
    Math.sin(time * 1.5) * 0.35 * (1 - chargeLevel * 0.5) +
    (isAttacking ? attackIntensity * 0.8 : -chargeLevel * 0.4);
  const hellGlow = 0.6 + Math.sin(time * 4) * 0.3 + chargeLevel * 0.2;
  const soulWisp = 0.5 + Math.sin(time * 5) * 0.3;
  const fireIntensity = isAttacking
    ? 0.7 + attackIntensity * 0.3
    : 0.3 + chargeLevel * 0.4 + Math.sin(time * 3) * 0.15;

  const fireGrad = ctx.createRadialGradient(
    x,
    y + size * 0.3,
    0,
    x,
    y + size * 0.3,
    size * 0.7
  );
  fireGrad.addColorStop(0, `rgba(220, 38, 38, ${fireIntensity * 0.35})`);
  fireGrad.addColorStop(0.3, `rgba(180, 30, 30, ${fireIntensity * 0.2})`);
  fireGrad.addColorStop(0.6, `rgba(127, 29, 29, ${fireIntensity * 0.1})`);
  fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.3,
    size * 0.7,
    size * 0.7 * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.6 + ring * 0.35) % 1;
    const ringSize = size * (0.2 + ringPhase * 0.4);
    const ringAlpha = (0.35 - ringPhase * 0.3) * fireIntensity;
    ctx.strokeStyle = `rgba(220, 38, 38, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + size * 0.48,
      ringSize,
      ringSize * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2
    );
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
    const emberColors = [
      `rgba(251, 146, 60, ${emberAlpha})`,
      `rgba(220, 38, 38, ${emberAlpha})`,
      `rgba(252, 211, 77, ${emberAlpha})`,
    ];
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
    let cx2 = x,
      cy2 = y + size * 0.48;
    for (let seg = 0; seg < 4; seg++) {
      cx2 += Math.cos(crackAngle + Math.sin(seg * 0.5) * 0.3) * size * 0.1;
      cy2 += size * 0.015;
      ctx.lineTo(cx2 + Math.sin(seg) * size * 0.025, cy2);
    }
    ctx.stroke();
  }

  drawPathLegs(ctx, x + size * 0.18, y + size * 0.12, size, time, zoom, {
    color: "#292524",
    colorDark: "#1c1917",
    footColor: "#44403c",
    legLen: 0.16,
    strideAmt: 0.2,
    strideSpeed: 3.5,
    style: "armored",
    width: 0.055,
  });

  drawPathArm(ctx, x + size * 0.1, y - size * 0.15, size, time, zoom, -1, {
    color: "#292524",
    colorDark: "#1c1917",
    elbowAngle: 0.9 + Math.sin(time * 2.5 + 1) * 0.2,
    foreLen: 0.18,
    handColor: "#a8a29e",
    onWeapon: (wCtx: CanvasRenderingContext2D) => {
      wCtx.strokeStyle = "#78716c";
      wCtx.lineWidth = 3 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, 0);
      wCtx.lineTo(0, -size * 0.18);
      wCtx.stroke();
      wCtx.fillStyle = "#57534e";
      wCtx.fillRect(-size * 0.04, -size * 0.2, size * 0.08, size * 0.04);
    },
    shoulderAngle:
      -0.5 +
      Math.sin(time * 2) * 0.15 +
      (isAttacking ? -attackIntensity * 0.5 : 0),
    style: "armored",
    upperLen: 0.2,
    width: 0.06,
  });
  drawPathArm(ctx, x + size * 0.26, y - size * 0.15, size, time, zoom, 1, {
    color: "#292524",
    colorDark: "#1c1917",
    elbowAngle: 0.5 + Math.sin(time * 2 + 2) * 0.08,
    foreLen: 0.16,
    handColor: "#a8a29e",
    onWeapon: (wCtx: CanvasRenderingContext2D) => {
      wCtx.strokeStyle = "#44403c";
      wCtx.lineWidth = 2.5 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, 0);
      wCtx.lineTo(0, -size * 0.12);
      wCtx.stroke();
      wCtx.fillStyle = `rgba(251, 146, 60, ${fireIntensity})`;
      setShadowBlur(wCtx, 4 * zoom, "#fb923c");
      wCtx.beginPath();
      wCtx.arc(0, -size * 0.14, size * 0.025, 0, Math.PI * 2);
      wCtx.fill();
      clearShadow(wCtx);
    },
    shoulderAngle: 0.3 + Math.sin(time * 1.5) * 0.06,
    style: "armored",
    upperLen: 0.18,
    width: 0.055,
  });

  for (let w = 0; w < 2; w++) {
    const wheelX = w === 0 ? x - size * 0.38 : x + size * 0.38;
    const wheelGlow = ctx.createRadialGradient(
      wheelX,
      y + size * 0.38,
      0,
      wheelX,
      y + size * 0.38,
      size * 0.22
    );
    wheelGlow.addColorStop(0, `rgba(220, 38, 38, ${hellGlow * 0.2})`);
    wheelGlow.addColorStop(1, "rgba(220, 38, 38, 0)");
    ctx.fillStyle = wheelGlow;
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    const wheelRingGrad = ctx.createRadialGradient(
      wheelX,
      y + size * 0.38,
      size * 0.12,
      wheelX,
      y + size * 0.38,
      size * 0.18
    );
    wheelRingGrad.addColorStop(0, "#44403c");
    wheelRingGrad.addColorStop(0.5, "#292524");
    wheelRingGrad.addColorStop(1, "#1c1917");
    ctx.fillStyle = wheelRingGrad;
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#78716c";
    ctx.lineWidth = 3 * zoom;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + time * 0.6;
      ctx.beginPath();
      ctx.moveTo(wheelX, y + size * 0.38);
      ctx.lineTo(
        wheelX + Math.cos(angle) * size * 0.14,
        y + size * 0.38 + Math.sin(angle) * size * 0.14
      );
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.6})`;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + time * 0.6;
      ctx.beginPath();
      ctx.arc(
        wheelX + Math.cos(angle) * size * 0.08,
        y + size * 0.38 + Math.sin(angle) * size * 0.08,
        size * 0.008,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    const hubGrad = ctx.createRadialGradient(
      wheelX,
      y + size * 0.38,
      0,
      wheelX,
      y + size * 0.38,
      size * 0.05
    );
    hubGrad.addColorStop(0, "#d6d3d1");
    hubGrad.addColorStop(0.6, "#a8a29e");
    hubGrad.addColorStop(1, "#78716c");
    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
    setShadowBlur(ctx, 3 * zoom, "#dc2626");
    ctx.beginPath();
    ctx.arc(
      wheelX - size * 0.02,
      y + size * 0.37,
      size * 0.012,
      0,
      Math.PI * 2
    );
    ctx.arc(
      wheelX + size * 0.02,
      y + size * 0.37,
      size * 0.012,
      0,
      Math.PI * 2
    );
    ctx.fill();
    clearShadow(ctx);
    ctx.fillStyle = "#1c1917";
    for (let spike = 0; spike < 8; spike++) {
      const spikeAngle = (spike * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(
        wheelX + Math.cos(spikeAngle) * size * 0.15,
        y + size * 0.38 + Math.sin(spikeAngle) * size * 0.15
      );
      ctx.lineTo(
        wheelX + Math.cos(spikeAngle) * size * 0.22,
        y + size * 0.38 + Math.sin(spikeAngle) * size * 0.22
      );
      ctx.lineTo(
        wheelX + Math.cos(spikeAngle + 0.1) * size * 0.15,
        y + size * 0.38 + Math.sin(spikeAngle + 0.1) * size * 0.15
      );
      ctx.fill();
    }
  }

  const frameGrad = ctx.createLinearGradient(
    x - size * 0.45,
    y,
    x + size * 0.45,
    y
  );
  frameGrad.addColorStop(0, "#1c1917");
  frameGrad.addColorStop(0.15, "#292524");
  frameGrad.addColorStop(0.3, "#44403c");
  frameGrad.addColorStop(0.5, "#57534e");
  frameGrad.addColorStop(0.7, "#44403c");
  frameGrad.addColorStop(0.85, "#292524");
  frameGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = frameGrad;
  ctx.fillRect(x - size * 0.45, y + size * 0.08, size * 0.9, size * 0.24);
  ctx.strokeStyle = "#78716c";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(x - size * 0.45, y + size * 0.08, size * 0.9, size * 0.24);
  const bandGrad = ctx.createLinearGradient(
    0,
    y + size * 0.1,
    0,
    y + size * 0.3
  );
  bandGrad.addColorStop(0, "#52525b");
  bandGrad.addColorStop(0.5, "#3f3f46");
  bandGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(x - size * 0.4, y + size * 0.1, size * 0.1, size * 0.2);
  ctx.fillRect(x + size * 0.3, y + size * 0.1, size * 0.1, size * 0.2);
  ctx.fillRect(x - size * 0.05, y + size * 0.1, size * 0.1, size * 0.2);
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("◆", x - size * 0.35, y + size * 0.22);
  ctx.fillText("◆", x, y + size * 0.22);
  ctx.fillText("◆", x + size * 0.35, y + size * 0.22);
  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.2);
  ctx.lineTo(x - size * 0.05, y + size * 0.2);
  ctx.moveTo(x + size * 0.05, y + size * 0.2);
  ctx.lineTo(x + size * 0.42, y + size * 0.2);
  ctx.stroke();

  const plateGrad = ctx.createLinearGradient(
    x - size * 0.12,
    y + size * 0.12,
    x + size * 0.12,
    y + size * 0.28
  );
  plateGrad.addColorStop(0, "#71717a");
  plateGrad.addColorStop(0.5, "#52525b");
  plateGrad.addColorStop(1, "#3f3f46");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y + size * 0.14);
  ctx.lineTo(x + size * 0.1, y + size * 0.14);
  ctx.lineTo(x + size * 0.08, y + size * 0.26);
  ctx.lineTo(x - size * 0.08, y + size * 0.26);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#a1a1aa";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y + size * 0.18);
  ctx.rotate(-0.85 + armAngle);
  const armGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.65);
  armGrad.addColorStop(0, "#44403c");
  armGrad.addColorStop(0.3, "#57534e");
  armGrad.addColorStop(0.5, "#78716c");
  armGrad.addColorStop(0.7, "#57534e");
  armGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = armGrad;
  ctx.fillRect(-size * 0.06, -size * 0.65, size * 0.12, size * 0.65);
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.04, -size * 0.6);
  ctx.moveTo(size * 0.04, 0);
  ctx.lineTo(size * 0.04, -size * 0.6);
  ctx.stroke();
  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.03, -size * 0.35, 0, -size * 0.55);
  ctx.stroke();
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(-size * 0.08, -size * 0.68, size * 0.16, size * 0.1);
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(0, -size * 0.72, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.arc(0, -size * 0.64, size * 0.14, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  setShadowBlur(ctx, 10 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(0, -size * 0.6, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  for (let flame = 0; flame < 4; flame++) {
    const fAngle = (flame * Math.PI) / 2 + time * 3;
    const fDist = size * 0.08 + Math.sin(time * 6 + flame) * size * 0.03;
    const fx = Math.cos(fAngle) * fDist * 0.5;
    const fy =
      -size * 0.6 - Math.abs(Math.sin(time * 5 + flame * 1.5)) * size * 0.08;
    ctx.fillStyle = `rgba(251, 146, 60, ${hellGlow * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.02, -size * 0.58);
    ctx.quadraticCurveTo(fx, fy, fx + size * 0.02, -size * 0.58);
    ctx.fill();
  }
  const skullGrad = ctx.createRadialGradient(
    0,
    -size * 0.58,
    0,
    0,
    -size * 0.58,
    size * 0.07
  );
  skullGrad.addColorStop(0, "#f5f5f4");
  skullGrad.addColorStop(0.6, "#e7e5e4");
  skullGrad.addColorStop(1, "#a8a29e");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.arc(0, -size * 0.58, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(-size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.57);
  ctx.lineTo(-size * 0.01, -size * 0.55);
  ctx.lineTo(size * 0.01, -size * 0.55);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  ctx.strokeStyle = `rgba(220, 38, 38, ${soulWisp * 0.7})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.22);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.05, x, y - size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.32, y + size * 0.22);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.05, x, y - size * 0.15);
  ctx.stroke();
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 1.5 * zoom;
  for (let side = 0; side < 2; side++) {
    const dir = side === 0 ? -1 : 1;
    for (let link = 0; link < 4; link++) {
      const linkX = x + dir * (size * 0.28 - link * size * 0.07);
      const linkY = y + size * 0.15 - link * size * 0.07;
      ctx.beginPath();
      ctx.ellipse(
        linkX,
        linkY,
        size * 0.025,
        size * 0.015,
        0.5 * dir,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.16, y + size * 0.07, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.16, y + size * 0.07, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  const crewRobeGrad = ctx.createLinearGradient(
    x + size * 0.08,
    y - size * 0.06,
    x + size * 0.28,
    y - size * 0.06
  );
  crewRobeGrad.addColorStop(0, "#1c1917");
  crewRobeGrad.addColorStop(0.5, "#292524");
  crewRobeGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = crewRobeGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.18,
    y - size * 0.06,
    size * 0.1,
    size * 0.14,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y - size * 0.05,
    x + size * 0.02,
    y + size * 0.08
  );
  ctx.stroke();
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(x + size * 0.02, y + size * 0.08, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  const skullHeadGrad = ctx.createRadialGradient(
    x + size * 0.18,
    y - size * 0.24,
    0,
    x + size * 0.18,
    y - size * 0.24,
    size * 0.08
  );
  skullHeadGrad.addColorStop(0, "#d6d3d1");
  skullHeadGrad.addColorStop(0.6, "#a8a29e");
  skullHeadGrad.addColorStop(1, "#78716c");
  ctx.fillStyle = skullHeadGrad;
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.24, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#78716c";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.3);
  ctx.lineTo(x + size * 0.18, y - size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.22);
  ctx.stroke();
  const helmGrad = ctx.createLinearGradient(
    x + size * 0.09,
    y - size * 0.36,
    x + size * 0.27,
    y - size * 0.28
  );
  helmGrad.addColorStop(0, "#3f3f46");
  helmGrad.addColorStop(0.5, "#52525b");
  helmGrad.addColorStop(1, "#3f3f46");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.28, size * 0.09, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.38);
  ctx.lineTo(x + size * 0.15, y - size * 0.28);
  ctx.lineTo(x + size * 0.21, y - size * 0.28);
  ctx.fill();
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  setShadowBlur(ctx, 5 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(x + size * 0.16, y - size * 0.25, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.2, y - size * 0.25, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.2, size * 0.04, 0.2, Math.PI - 0.2);
  ctx.stroke();

  drawPulsingGlowRings(ctx, x, y - size * 0.1, size * 0.18, time, zoom, {
    color: "rgba(220, 38, 38, 0.4)",
    count: 3,
    expansion: 1.5,
    maxAlpha: 0.4,
    speed: 2,
  });
  drawShiftingSegments(ctx, x, y + size * 0.1, size, time, zoom, {
    color: "#78716c",
    colorAlt: "#a8a29e",
    count: 5,
    orbitRadius: 0.4,
    orbitSpeed: 1,
    segmentSize: 0.04,
    shape: "diamond",
  });
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
  region: MapTheme = "grassland"
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 1.5, 0.02);
  const sway = getIdleSway(time, 0.6, 1, 1.2);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  let charcoal = "#1c1e2a";
  let charcoalDark = "#0e0f18";
  const navy = "#141832";
  const pinstripeGlow = `rgba(120, 100, 220, ${0.25 + Math.sin(time * 2.5) * 0.15})`;
  let vestRed = "#6b1a1a";
  let vestRedLight = "#8b2a2a";
  let goldBtn = "#c9a84c";
  let goldBtnDark = "#8a6f2e";
  let obsidian = "#0a0a14";
  let obsidianMid = "#1a1a2e";
  let obsidianLight = "#2a2a44";
  let leather = "#2a1f14";
  let leatherDark = "#1a1208";
  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const voidPulse = 0.5 + Math.sin(time * 3.5) * 0.4;
  const paleSkin = "#c8b8a8";
  const paleSkinDark = "#988878";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    charcoal = rm.cloth.base;
    charcoalDark = rm.cloth.dark;
    vestRed = rm.magic.primary;
    vestRedLight = rm.magic.secondary;
    goldBtn = rm.metal.accent;
    goldBtnDark = rm.metal.dark;
    obsidian = rm.cloth.dark;
    obsidianMid = rm.cloth.base;
    obsidianLight = rm.cloth.light;
    leather = rm.leather.base;
    leatherDark = rm.leather.dark;
  }

  // Void domain aura — corporate judicial
  const voidGrad = ctx.createRadialGradient(
    cx,
    y + size * 0.3,
    0,
    cx,
    y + size * 0.3,
    size * 0.5
  );
  voidGrad.addColorStop(0, `rgba(76, 29, 149, ${voidPulse * 0.18})`);
  voidGrad.addColorStop(0.5, `rgba(46, 16, 101, ${voidPulse * 0.07})`);
  voidGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    y + size * 0.3,
    size * 0.5,
    size * 0.5 * ISO_Y_RATIO,
    0,
    0,
    TAU
  );
  ctx.fill();

  // Floor-length back panel (behind everything, trailing cape)
  const backPanelGrad = ctx.createLinearGradient(
    cx,
    y - size * 0.3,
    cx,
    y + size * 0.48
  );
  backPanelGrad.addColorStop(0, charcoalDark);
  backPanelGrad.addColorStop(0.6, "#060610");
  backPanelGrad.addColorStop(1, "#030308");
  ctx.fillStyle = backPanelGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.12, y - size * 0.3 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.22,
    y + size * 0.1,
    cx - size * 0.24,
    y + size * 0.44
  );
  for (let t = 0; t < 10; t++) {
    const tx = cx - size * 0.24 + t * size * 0.048;
    const billow = Math.sin(time * 1.4 + t * 0.7) * size * 0.018;
    const ty = y + size * 0.46 + billow + (t % 2) * size * 0.015;
    ctx.lineTo(tx, ty);
  }
  ctx.quadraticCurveTo(
    cx + size * 0.22,
    y + size * 0.1,
    cx + size * 0.12,
    y - size * 0.3 - bodyBob
  );
  ctx.closePath();
  ctx.fill();

  // Back panel purple silk inner glimpse
  ctx.fillStyle = `rgba(100, 40, 180, ${0.35 + Math.sin(time * 1.3) * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.08, y + size * 0.3);
  for (let t = 0; t < 6; t++) {
    const tx = cx - size * 0.18 + t * size * 0.06;
    const billow = Math.sin(time * 1.4 + t * 0.7) * size * 0.012;
    ctx.lineTo(tx, y + size * 0.42 + billow);
  }
  ctx.lineTo(cx + size * 0.08, y + size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Dark judicial robes — wide flowing silhouette
  const robeW = size * 0.28;
  const robeGrad = ctx.createLinearGradient(
    cx - robeW,
    y - size * 0.3,
    cx + robeW,
    y + size * 0.4
  );
  robeGrad.addColorStop(0, charcoal);
  robeGrad.addColorStop(0.35, navy);
  robeGrad.addColorStop(0.65, charcoalDark);
  robeGrad.addColorStop(1, "#060610");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.32,
    y + size * 0.04,
    cx - robeW,
    y + size * 0.38
  );
  for (let t = 0; t < 10; t++) {
    const tx = cx - robeW + t * ((robeW * 2) / 9);
    const billow = Math.sin(time * 1.8 + t * 0.7) * size * 0.02;
    const ty = y + size * 0.4 + billow + (t % 2) * size * 0.025;
    ctx.lineTo(tx, ty);
  }
  ctx.quadraticCurveTo(
    cx + size * 0.32,
    y + size * 0.04,
    cx + size * 0.22,
    y - size * 0.34 - bodyBob
  );
  ctx.closePath();
  ctx.fill();

  // Second robe fabric layer — slightly inset, lighter shade for depth
  ctx.fillStyle = `rgba(28, 30, 50, 0.5)`;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.18, y - size * 0.28 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.26,
    y + size * 0.06,
    cx - size * 0.23,
    y + size * 0.36
  );
  for (let t = 0; t < 8; t++) {
    const tx = cx - size * 0.23 + t * size * 0.066;
    const billow = Math.sin(time * 2 + t * 0.9 + 0.5) * size * 0.014;
    const ty = y + size * 0.37 + billow;
    ctx.lineTo(tx, ty);
  }
  ctx.quadraticCurveTo(
    cx + size * 0.26,
    y + size * 0.06,
    cx + size * 0.18,
    y - size * 0.28 - bodyBob
  );
  ctx.closePath();
  ctx.fill();

  // Purple silk lining — prominent inner robe reveal
  ctx.fillStyle = `rgba(110, 45, 185, ${0.55 + Math.sin(time * 1.5) * 0.15})`;
  ctx.beginPath();
  for (let t = 0; t < 10; t++) {
    const tx = cx - size * 0.25 + t * size * 0.056;
    const billow = Math.sin(time * 1.8 + t * 0.7) * size * 0.014;
    const ty = y + size * 0.35 + billow;
    if (t === 0) {
      ctx.moveTo(tx, ty);
    } else {
      ctx.lineTo(tx, ty);
    }
  }
  for (let t = 9; t >= 0; t--) {
    const tx = cx - size * 0.25 + t * size * 0.056;
    const billow = Math.sin(time * 1.8 + t * 0.7) * size * 0.02;
    const ty = y + size * 0.4 + billow + (t % 2) * size * 0.025;
    ctx.lineTo(tx, ty);
  }
  ctx.closePath();
  ctx.fill();

  // Gold/brass robe hem trim
  ctx.strokeStyle = `rgba(201, 168, 76, ${0.6 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  for (let t = 0; t < 10; t++) {
    const tx = cx - size * 0.26 + t * size * 0.058;
    const billow = Math.sin(time * 1.8 + t * 0.7) * size * 0.02;
    const ty = y + size * 0.4 + billow + (t % 2) * size * 0.025;
    if (t === 0) {
      ctx.moveTo(tx, ty);
    } else {
      ctx.lineTo(tx, ty);
    }
  }
  ctx.stroke();

  // Embroidered rune edge details along hem
  ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 + voidPulse * 0.2})`;
  ctx.lineWidth = 0.7 * zoom;
  for (let r = 0; r < 6; r++) {
    const rx = cx - size * 0.2 + r * size * 0.08;
    const ry = y + size * 0.38 + Math.sin(time * 1.8 + r * 0.7) * size * 0.012;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.008, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - size * 0.006, ry - size * 0.006);
    ctx.lineTo(rx + size * 0.006, ry + size * 0.006);
    ctx.moveTo(rx + size * 0.006, ry - size * 0.006);
    ctx.lineTo(rx - size * 0.006, ry + size * 0.006);
    ctx.stroke();
  }

  // Gold trim along robe front opening
  ctx.strokeStyle = `rgba(201, 168, 76, ${0.45 + Math.sin(time * 2.2) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * size * 0.04, y - size * 0.3 - bodyBob);
    ctx.quadraticCurveTo(
      cx + side * size * 0.05,
      y + size * 0.05,
      cx + side * size * 0.06,
      y + size * 0.36
    );
    ctx.stroke();
  }

  // Shadow magic tendrils from robe hem — more numerous and dramatic
  ctx.lineWidth = 1.5 * zoom;
  for (let t = 0; t < 7; t++) {
    const tAngle = t * 0.55 - 1.5 + Math.sin(time * 1.5 + t) * 0.25;
    const tAlpha = voidPulse * (0.2 + Math.sin(time * 1.8 + t * 1.1) * 0.12);
    ctx.strokeStyle = `rgba(76, 29, 149, ${tAlpha})`;
    ctx.beginPath();
    let tx = cx + Math.cos(tAngle) * size * 0.16;
    let ty = y + size * 0.38;
    ctx.moveTo(tx, ty);
    for (let s = 0; s < 4; s++) {
      tx +=
        Math.cos(tAngle + Math.sin(time * 2.2 + s * 0.8) * 0.5) * size * 0.055;
      ty += size * 0.035;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }

  // Wispy void smoke rising from robe edges
  ctx.globalAlpha = voidPulse * 0.15;
  for (let w = 0; w < 4; w++) {
    const wX = cx + (w - 1.5) * size * 0.12;
    const wPhase = time * 1.2 + w * 1.6;
    const wRise = Math.sin(wPhase) * size * 0.06;
    const smokeGrad = ctx.createRadialGradient(
      wX,
      y + size * 0.32 - wRise,
      0,
      wX,
      y + size * 0.32 - wRise,
      size * 0.04
    );
    smokeGrad.addColorStop(0, "rgba(76, 29, 149, 0.4)");
    smokeGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = smokeGrad;
    ctx.beginPath();
    ctx.ellipse(
      wX,
      y + size * 0.32 - wRise,
      size * 0.04,
      size * 0.025,
      0,
      0,
      TAU
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Legs — dark pinstripe suit trousers
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: charcoal,
    colorDark: charcoalDark,
    footColor: obsidian,
    legLen: 0.16,
    strideAmt: 0.14,
    strideSpeed: 2,
    style: "bone",
    width: 0.05,
  });

  // Torso — dark pinstripe suit of magical mail
  const torsoTop = y - size * 0.34 - bodyBob;
  const torsoBot = y + size * 0.02 - bodyBob;
  const suitGrad = ctx.createLinearGradient(
    cx - size * 0.15,
    torsoTop,
    cx + size * 0.15,
    torsoBot
  );
  suitGrad.addColorStop(0, charcoal);
  suitGrad.addColorStop(0.3, navy);
  suitGrad.addColorStop(0.6, charcoal);
  suitGrad.addColorStop(1, charcoalDark);
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.15, torsoTop);
  ctx.quadraticCurveTo(
    cx - size * 0.18 * breath,
    y - size * 0.12 - bodyBob,
    cx - size * 0.13,
    torsoBot
  );
  ctx.lineTo(cx + size * 0.13, torsoBot);
  ctx.quadraticCurveTo(
    cx + size * 0.18 * breath,
    y - size * 0.12 - bodyBob,
    cx + size * 0.15,
    torsoTop
  );
  ctx.closePath();
  ctx.fill();

  // Pulsing magical pinstripe lines
  ctx.strokeStyle = pinstripeGlow;
  ctx.lineWidth = 0.8 * zoom;
  for (let ps = 0; ps < 6; ps++) {
    const psX = cx - size * 0.1 + ps * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(psX, torsoTop + size * 0.02);
    ctx.lineTo(psX - size * 0.005, torsoBot - size * 0.01);
    ctx.stroke();
  }

  // Suit jacket lapel lines
  ctx.strokeStyle = charcoalDark;
  ctx.lineWidth = 1.5 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * size * 0.04, torsoTop + size * 0.01);
    ctx.quadraticCurveTo(
      cx + side * size * 0.02,
      y - size * 0.18 - bodyBob,
      cx + side * size * 0.01,
      torsoBot - size * 0.02
    );
    ctx.stroke();
  }

  // Deep red vest visible between lapels
  const vestGrad = ctx.createLinearGradient(
    cx - size * 0.04,
    torsoTop,
    cx + size * 0.04,
    torsoBot
  );
  vestGrad.addColorStop(0, vestRedLight);
  vestGrad.addColorStop(0.5, vestRed);
  vestGrad.addColorStop(1, "#4a0e0e");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.04, torsoTop + size * 0.03);
  ctx.quadraticCurveTo(
    cx - size * 0.035,
    y - size * 0.15 - bodyBob,
    cx - size * 0.02,
    torsoBot - size * 0.02
  );
  ctx.lineTo(cx + size * 0.02, torsoBot - size * 0.02);
  ctx.quadraticCurveTo(
    cx + size * 0.035,
    y - size * 0.15 - bodyBob,
    cx + size * 0.04,
    torsoTop + size * 0.03
  );
  ctx.closePath();
  ctx.fill();

  // Gold vest buttons
  for (let b = 0; b < 4; b++) {
    const bY = torsoTop + size * 0.06 + b * size * 0.06;
    ctx.fillStyle = goldBtn;
    ctx.beginPath();
    ctx.arc(cx, bY, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.fillStyle = goldBtnDark;
    ctx.beginPath();
    ctx.arc(cx + size * 0.002, bY + size * 0.002, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Obsidian-plated power shoulders with void runes
  for (const side of [-1, 1]) {
    const spX = cx + side * size * 0.17;
    const spY = y - size * 0.32 - bodyBob;

    const padGrad = ctx.createLinearGradient(
      spX - side * size * 0.06,
      spY,
      spX + side * size * 0.06,
      spY + size * 0.04
    );
    padGrad.addColorStop(0, obsidianLight);
    padGrad.addColorStop(0.4, obsidianMid);
    padGrad.addColorStop(1, obsidian);
    ctx.fillStyle = padGrad;
    ctx.beginPath();
    ctx.moveTo(spX - side * size * 0.02, spY + size * 0.03);
    ctx.lineTo(spX + side * size * 0.07, spY);
    ctx.lineTo(spX + side * size * 0.08, spY - size * 0.025);
    ctx.lineTo(spX + side * size * 0.04, spY - size * 0.03);
    ctx.lineTo(spX - side * size * 0.01, spY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = obsidianLight;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(spX + side * size * 0.07, spY);
    ctx.lineTo(spX + side * size * 0.08, spY - size * 0.025);
    ctx.stroke();

    setShadowBlur(ctx, 6 * zoom, accent);
    ctx.strokeStyle = `rgba(167, 139, 250, ${voidPulse * 0.7})`;
    ctx.lineWidth = 1 * zoom;
    const runeX = spX + side * size * 0.04;
    const runeY = spY - size * 0.005;
    ctx.beginPath();
    ctx.moveTo(runeX - size * 0.012, runeY);
    ctx.lineTo(runeX, runeY - size * 0.015);
    ctx.lineTo(runeX + size * 0.012, runeY);
    ctx.lineTo(runeX, runeY + size * 0.015);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = `rgba(200, 170, 255, ${voidPulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(runeX, runeY, size * 0.004, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Wide dark leather executive belt
  const beltY = torsoBot - size * 0.01;
  ctx.fillStyle = leatherDark;
  ctx.fillRect(cx - size * 0.14, beltY, size * 0.28, size * 0.03);
  ctx.strokeStyle = leather;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.13, beltY + size * 0.005);
  ctx.lineTo(cx + size * 0.13, beltY + size * 0.005);
  ctx.moveTo(cx - size * 0.13, beltY + size * 0.025);
  ctx.lineTo(cx + size * 0.13, beltY + size * 0.025);
  ctx.stroke();

  // Octagonal obsidian buckle with void pulse
  const buckX = cx;
  const buckY = beltY + size * 0.015;
  const buckR = size * 0.018;
  ctx.fillStyle = obsidian;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * TAU) / 8 - TAU / 16;
    const bpx = buckX + Math.cos(angle) * buckR;
    const bpy = buckY + Math.sin(angle) * buckR * 0.8;
    if (i === 0) {
      ctx.moveTo(bpx, bpy);
    } else {
      ctx.lineTo(bpx, bpy);
    }
  }
  ctx.closePath();
  ctx.fill();
  setShadowBlur(ctx, 5 * zoom, accent);
  ctx.fillStyle = `rgba(167, 139, 250, ${voidPulse * 0.6})`;
  ctx.beginPath();
  ctx.arc(buckX, buckY, buckR * 0.45, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Soul-capturing scrolls dangling from belt
  for (let sc = 0; sc < 3; sc++) {
    const scX = cx - size * 0.08 + sc * size * 0.08;
    const scY = beltY + size * 0.03;
    const scSwing = Math.sin(time * 1.5 + sc * 1.8) * size * 0.005;
    ctx.fillStyle = "#d4c8a0";
    ctx.fillRect(scX - size * 0.006 + scSwing, scY, size * 0.012, size * 0.025);
    ctx.fillStyle = "#b8a878";
    ctx.beginPath();
    ctx.ellipse(
      scX + scSwing,
      scY + size * 0.025,
      size * 0.008,
      size * 0.004,
      0,
      0,
      TAU
    );
    ctx.fill();
    ctx.fillStyle = vestRed;
    ctx.beginPath();
    ctx.arc(scX + scSwing, scY + size * 0.012, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // Left arm — obsidian briefcase
  const briefForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.2,
    y - size * 0.28 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: charcoal,
      colorDark: charcoalDark,
      elbowAngle: 0.4 + (isAttacking ? -attackIntensity * 0.2 : 0),
      foreLen: briefForeLen,
      handColor: paleSkin,
      onWeapon: (wCtx) => {
        const handY = briefForeLen * size;
        wCtx.translate(0, handY * 0.4);
        wCtx.scale(-1, 1);

        const bw = size * 0.1;
        const bh = size * 0.07;
        const floatOff = Math.sin(time * 2) * size * 0.008;

        // Chains keeping case partially closed
        wCtx.strokeStyle = "#555568";
        wCtx.lineWidth = 1.2 * zoom;
        for (let ch = 0; ch < 3; ch++) {
          const chX = -bw * 0.3 + ch * bw * 0.3;
          wCtx.beginPath();
          wCtx.moveTo(chX, -bh * 0.3 + floatOff);
          wCtx.lineTo(chX, bh * 0.1 + floatOff);
          wCtx.stroke();
        }

        // Purple light leaking from gap
        setShadowBlur(wCtx, 10 * zoom, accent);
        wCtx.fillStyle = `rgba(167, 139, 250, ${voidPulse * 0.4})`;
        wCtx.beginPath();
        wCtx.ellipse(0, floatOff, bw * 0.7, bh * 0.12, 0, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);

        // Briefcase bottom half
        const caseGrad = wCtx.createLinearGradient(-bw * 0.5, 0, bw * 0.5, bh);
        caseGrad.addColorStop(0, obsidianMid);
        caseGrad.addColorStop(0.5, obsidian);
        caseGrad.addColorStop(1, "#050510");
        wCtx.fillStyle = caseGrad;
        wCtx.beginPath();
        wCtx.rect(-bw * 0.5, floatOff, bw, bh * 0.55);
        wCtx.fill();

        // Briefcase top half (slightly ajar)
        wCtx.save();
        wCtx.translate(0, floatOff);
        wCtx.rotate(-0.08 - Math.sin(time * 2.5) * 0.03);
        const topGrad = wCtx.createLinearGradient(
          -bw * 0.5,
          -bh * 0.55,
          bw * 0.5,
          0
        );
        topGrad.addColorStop(0, obsidianLight);
        topGrad.addColorStop(0.5, obsidianMid);
        topGrad.addColorStop(1, obsidian);
        wCtx.fillStyle = topGrad;
        wCtx.beginPath();
        wCtx.rect(-bw * 0.5, -bh * 0.55, bw, bh * 0.5);
        wCtx.fill();
        wCtx.strokeStyle = obsidianLight;
        wCtx.lineWidth = 0.8 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-bw * 0.5, -bh * 0.55);
        wCtx.lineTo(bw * 0.5, -bh * 0.55);
        wCtx.stroke();
        wCtx.restore();

        // Obsidian clasps
        wCtx.fillStyle = "#3a3a50";
        for (const cSide of [-1, 1]) {
          wCtx.beginPath();
          wCtx.rect(
            cSide * bw * 0.2 - size * 0.004,
            floatOff - size * 0.003,
            size * 0.008,
            size * 0.006
          );
          wCtx.fill();
        }

        // Swirling trapped souls visible in the gap
        wCtx.fillStyle = `rgba(200, 170, 255, ${voidPulse * 0.6})`;
        for (let soul = 0; soul < 4; soul++) {
          const sAngle = time * 3 + (soul * TAU) / 4;
          const sR = bw * 0.25;
          const sx = Math.cos(sAngle) * sR;
          const sy = floatOff + Math.sin(sAngle) * bh * 0.06;
          wCtx.beginPath();
          wCtx.arc(sx, sy, size * 0.004, 0, TAU);
          wCtx.fill();
        }

        // Void energy aura rings around briefcase
        for (let r = 0; r < 2; r++) {
          const ringAlpha = (0.12 - r * 0.04) * voidPulse;
          wCtx.strokeStyle = `rgba(167, 139, 250, ${ringAlpha})`;
          wCtx.lineWidth = 1 * zoom;
          wCtx.beginPath();
          wCtx.ellipse(
            0,
            floatOff,
            bw * 0.6 + r * size * 0.015,
            bh * 0.4 + r * size * 0.01,
            0,
            0,
            TAU
          );
          wCtx.stroke();
        }
      },
      shoulderAngle:
        0.35 +
        Math.sin(time * 1.2) * 0.04 +
        (isAttacking ? -attackIntensity * 0.3 : 0),
      style: "bone",
      upperLen: 0.15,
      width: 0.048,
    }
  );

  // Right arm — soul-pen gavel
  const gavelForeLen = 0.15;
  drawPathArm(
    ctx,
    cx + size * 0.2,
    y - size * 0.28 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: charcoal,
      colorDark: charcoalDark,
      elbowAngle: -0.15 + (isAttacking ? -attackIntensity * 0.1 : 0),
      foreLen: gavelForeLen,
      handColor: paleSkin,
      onWeapon: (wCtx) => {
        const handY = gavelForeLen * size;
        wCtx.translate(0, handY * 0.5);
        wCtx.rotate(0.65);
        wCtx.scale(-1, 1);

        const shaftH = size * 0.42;
        const handleW = size * 0.013;

        // Dark iron shaft
        const shaftGrad = wCtx.createLinearGradient(-handleW, 0, handleW, 0);
        shaftGrad.addColorStop(0, "#1a1a2e");
        shaftGrad.addColorStop(0.3, "#2a2a40");
        shaftGrad.addColorStop(0.5, "#3a3a55");
        shaftGrad.addColorStop(0.7, "#2a2a40");
        shaftGrad.addColorStop(1, "#1a1a2e");
        wCtx.strokeStyle = shaftGrad;
        wCtx.lineWidth = 4 * zoom;
        wCtx.lineCap = "round";
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.06);
        wCtx.lineTo(0, -shaftH);
        wCtx.stroke();
        wCtx.lineCap = "butt";

        // Dark leather grip wrap
        wCtx.strokeStyle = leatherDark;
        wCtx.lineWidth = 5 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.04);
        wCtx.lineTo(0, -size * 0.04);
        wCtx.stroke();
        wCtx.strokeStyle = leather;
        wCtx.lineWidth = 0.8 * zoom;
        for (let w = 0; w < 6; w++) {
          const wy = size * 0.03 - w * size * 0.014;
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.01, wy);
          wCtx.lineTo(size * 0.01, wy - size * 0.008);
          wCtx.stroke();
        }

        // Chain connecting gavel to wrist
        wCtx.strokeStyle = "#555568";
        wCtx.lineWidth = 1.2 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.05);
        for (let ch = 0; ch < 5; ch++) {
          const chY = size * 0.05 + ch * size * 0.018;
          const chX = Math.sin(ch * 2 + time * 3) * size * 0.008;
          wCtx.lineTo(chX, chY);
        }
        wCtx.stroke();

        // Iron ring details along shaft
        wCtx.strokeStyle = "#4a4a60";
        wCtx.lineWidth = 1.5 * zoom;
        for (let ring = 0; ring < 3; ring++) {
          const ry = -size * 0.08 - ring * shaftH * 0.25;
          wCtx.beginPath();
          wCtx.ellipse(0, ry, handleW * 1.3, size * 0.004, 0, 0, TAU);
          wCtx.stroke();
        }

        // Gavel head — dark iron frame with void crystal
        const gHeadY = -shaftH - size * 0.015;
        const gHeadW = size * 0.06;
        const gHeadH = size * 0.035;

        const headGrad = wCtx.createLinearGradient(
          -gHeadW,
          gHeadY,
          gHeadW,
          gHeadY
        );
        headGrad.addColorStop(0, "#1a1a30");
        headGrad.addColorStop(0.3, "#2a2a48");
        headGrad.addColorStop(0.5, "#3a3a58");
        headGrad.addColorStop(0.7, "#2a2a48");
        headGrad.addColorStop(1, "#1a1a30");
        wCtx.fillStyle = headGrad;
        wCtx.beginPath();
        wCtx.rect(-gHeadW, gHeadY - gHeadH, gHeadW * 2, gHeadH * 2);
        wCtx.fill();
        wCtx.strokeStyle = "#4a4a68";
        wCtx.lineWidth = 1 * zoom;
        wCtx.beginPath();
        wCtx.rect(-gHeadW, gHeadY - gHeadH, gHeadW * 2, gHeadH * 2);
        wCtx.stroke();

        // Void crystal inset in gavel head
        setShadowBlur(wCtx, 8 * zoom, accent);
        const crystalGrad = wCtx.createRadialGradient(
          0,
          gHeadY,
          0,
          0,
          gHeadY,
          gHeadW * 0.6
        );
        crystalGrad.addColorStop(0, "#e8d0ff");
        crystalGrad.addColorStop(0.3, "#c4b5fd");
        crystalGrad.addColorStop(0.6, accent);
        crystalGrad.addColorStop(1, accentDark);
        wCtx.fillStyle = crystalGrad;
        wCtx.beginPath();
        wCtx.ellipse(0, gHeadY, gHeadW * 0.55, gHeadH * 0.6, 0, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);

        wCtx.fillStyle = "rgba(255,255,255,0.3)";
        wCtx.beginPath();
        wCtx.ellipse(
          size * 0.008,
          gHeadY - size * 0.008,
          gHeadW * 0.2,
          gHeadH * 0.25,
          -0.4,
          0,
          TAU
        );
        wCtx.fill();

        // Trailing purple energy from gavel
        wCtx.strokeStyle = `rgba(167, 139, 250, ${voidPulse * 0.5})`;
        wCtx.lineWidth = 1.2 * zoom;
        for (let tr = 0; tr < 3; tr++) {
          const trAngle = (tr * TAU) / 3 + time * 2.5;
          const trLen = gHeadW * (1.5 + Math.sin(time * 3 + tr) * 0.4);
          wCtx.beginPath();
          wCtx.moveTo(
            Math.cos(trAngle) * gHeadW * 0.4,
            gHeadY + Math.sin(trAngle) * gHeadH * 0.4
          );
          wCtx.quadraticCurveTo(
            Math.cos(trAngle + 0.3) * trLen * 0.7,
            gHeadY + Math.sin(trAngle + 0.3) * trLen * 0.5,
            Math.cos(trAngle + 0.6) * trLen,
            gHeadY + Math.sin(trAngle + 0.6) * trLen * 0.5
          );
          wCtx.stroke();
        }
      },
      shoulderAngle:
        -(0.7 + (isAttacking ? attackIntensity * 0.2 : 0)) +
        Math.sin(time * 1.4) * 0.03,
      style: "bone",
      upperLen: 0.16,
      width: 0.048,
    }
  );

  // HEAD — gaunt pale face with dark barrister's crown
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;

  // High collar of overcoat framing the neck
  ctx.fillStyle = charcoalDark;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY + size * 0.1);
  ctx.quadraticCurveTo(
    headX - size * 0.12,
    headY + size * 0.02,
    headX - size * 0.08,
    headY - size * 0.04
  );
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.06,
    headX + size * 0.08,
    headY - size * 0.04
  );
  ctx.quadraticCurveTo(
    headX + size * 0.12,
    headY + size * 0.02,
    headX + size * 0.1,
    headY + size * 0.1
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = charcoal;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY - size * 0.04);
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.02,
    headX + size * 0.08,
    headY - size * 0.04
  );
  ctx.stroke();

  // Void-touched ethereal face
  const faceGrad = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.1
  );
  faceGrad.addColorStop(0, "#b8a0d8");
  faceGrad.addColorStop(0.4, "#8068a8");
  faceGrad.addColorStop(0.7, "#5a3878");
  faceGrad.addColorStop(1, "#2a1848");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.1);
  ctx.bezierCurveTo(
    headX + size * 0.09,
    headY - size * 0.09,
    headX + size * 0.1,
    headY + size * 0.02,
    headX + size * 0.07,
    headY + size * 0.1
  );
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.12,
    headX - size * 0.07,
    headY + size * 0.1
  );
  ctx.bezierCurveTo(
    headX - size * 0.1,
    headY + size * 0.02,
    headX - size * 0.09,
    headY - size * 0.09,
    headX,
    headY - size * 0.1
  );
  ctx.fill();

  // Arcane veins radiating from eyes
  ctx.lineWidth = 0.7 * zoom;
  for (const side of [-1, 1]) {
    const eyeCX = headX + side * size * 0.035;
    const eyeCY = headY - size * 0.015;
    for (let v = 0; v < 4; v++) {
      const vAngle = side * 0.3 + v * 0.45 - 0.6;
      const vLen = size * (0.04 + Math.sin(time * 2.5 + v * 1.3) * 0.008);
      const vAlpha = 0.25 + Math.sin(time * 3 + v * 1.7) * 0.15;
      ctx.strokeStyle = `rgba(167, 139, 250, ${vAlpha})`;
      ctx.beginPath();
      ctx.moveTo(eyeCX, eyeCY);
      const vMidX = eyeCX + Math.cos(vAngle) * vLen * 0.5;
      const vMidY = eyeCY + Math.sin(vAngle) * vLen * 0.5;
      const vEndX = eyeCX + Math.cos(vAngle + 0.15) * vLen;
      const vEndY = eyeCY + Math.sin(vAngle + 0.15) * vLen;
      ctx.quadraticCurveTo(vMidX, vMidY, vEndX, vEndY);
      ctx.stroke();
    }
  }

  // Void rune sigil on forehead
  const runeAlpha = 0.3 + voidPulse * 0.4;
  setShadowBlur(ctx, 4 * zoom, accent);
  ctx.strokeStyle = `rgba(200, 170, 255, ${runeAlpha})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.065);
  ctx.lineTo(headX - size * 0.015, headY - size * 0.045);
  ctx.lineTo(headX, headY - size * 0.025);
  ctx.lineTo(headX + size * 0.015, headY - size * 0.045);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.075);
  ctx.lineTo(headX, headY - size * 0.02);
  ctx.stroke();
  clearShadow(ctx);

  // Deep void eye sockets with intense glow
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#050010";
    ctx.beginPath();
    ctx.ellipse(
      headX + side * size * 0.035,
      headY - size * 0.015,
      size * 0.024,
      size * 0.018,
      side * 0.1,
      0,
      TAU
    );
    ctx.fill();

    setShadowBlur(ctx, 10 * zoom, accent);
    const eyeFlicker = 0.8 + Math.sin(time * 6 + side * 2) * 0.2;
    const eyeGrad = ctx.createRadialGradient(
      headX + side * size * 0.035,
      headY - size * 0.015,
      0,
      headX + side * size * 0.035,
      headY - size * 0.015,
      size * 0.016
    );
    eyeGrad.addColorStop(0, `rgba(255, 240, 255, ${eyeFlicker})`);
    eyeGrad.addColorStop(0.4, `rgba(200, 170, 255, ${eyeFlicker * 0.9})`);
    eyeGrad.addColorStop(1, `rgba(100, 60, 200, ${eyeFlicker * 0.3})`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.035,
      headY - size * 0.015,
      size * 0.014,
      0,
      TAU
    );
    ctx.fill();

    // Vertical slit pupil
    ctx.fillStyle = `rgba(20, 0, 40, ${eyeFlicker * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(
      headX + side * size * 0.035,
      headY - size * 0.015,
      size * 0.003,
      size * 0.01,
      0,
      0,
      TAU
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // Spectral nose ridge (no nostrils, just a faint ridge)
  ctx.strokeStyle = `rgba(140, 110, 180, 0.4)`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.005);
  ctx.lineTo(headX, headY + size * 0.03);
  ctx.stroke();

  // Glowing void mouth — thin slit emitting energy
  setShadowBlur(ctx, 5 * zoom, accent);
  ctx.strokeStyle = `rgba(167, 139, 250, ${0.5 + voidPulse * 0.3})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.025, headY + size * 0.055);
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.048,
    headX + size * 0.025,
    headY + size * 0.055
  );
  ctx.stroke();
  ctx.fillStyle = `rgba(120, 80, 200, ${0.15 + voidPulse * 0.15})`;
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY + size * 0.052,
    size * 0.018,
    size * 0.004,
    0,
    0,
    TAU
  );
  ctx.fill();
  clearShadow(ctx);

  // Dark Barrister's Crown — towering obsidian diadem with void crystals
  const crownBaseY = headY - size * 0.05;
  const crownTopY = headY - size * 0.31;
  const crownMidY = crownBaseY + (crownTopY - crownBaseY) * 0.5;

  // Crown body — 5 tall spires
  const crownGrad = ctx.createLinearGradient(
    headX,
    crownBaseY,
    headX,
    crownTopY
  );
  crownGrad.addColorStop(0, obsidianMid);
  crownGrad.addColorStop(0.2, obsidian);
  crownGrad.addColorStop(0.5, obsidianMid);
  crownGrad.addColorStop(0.8, obsidian);
  crownGrad.addColorStop(1, obsidianLight);
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, crownBaseY);
  ctx.lineTo(headX - size * 0.09, crownTopY + size * 0.08);
  ctx.lineTo(headX - size * 0.07, crownTopY + size * 0.02);
  ctx.lineTo(headX - size * 0.05, crownTopY + size * 0.06);
  ctx.lineTo(headX - size * 0.03, crownTopY);
  ctx.lineTo(headX, crownTopY - size * 0.04);
  ctx.lineTo(headX + size * 0.03, crownTopY);
  ctx.lineTo(headX + size * 0.05, crownTopY + size * 0.06);
  ctx.lineTo(headX + size * 0.07, crownTopY + size * 0.02);
  ctx.lineTo(headX + size * 0.09, crownTopY + size * 0.08);
  ctx.lineTo(headX + size * 0.1, crownBaseY);
  ctx.closePath();
  ctx.fill();

  // Crown edge highlights on each spire
  ctx.strokeStyle = obsidianLight;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.09, crownTopY + size * 0.08);
  ctx.lineTo(headX - size * 0.07, crownTopY + size * 0.02);
  ctx.lineTo(headX - size * 0.05, crownTopY + size * 0.06);
  ctx.lineTo(headX - size * 0.03, crownTopY);
  ctx.lineTo(headX, crownTopY - size * 0.04);
  ctx.lineTo(headX + size * 0.03, crownTopY);
  ctx.lineTo(headX + size * 0.05, crownTopY + size * 0.06);
  ctx.lineTo(headX + size * 0.07, crownTopY + size * 0.02);
  ctx.lineTo(headX + size * 0.09, crownTopY + size * 0.08);
  ctx.stroke();

  // Gold filigree band at crown base
  ctx.strokeStyle = `rgba(201, 168, 76, ${0.5 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, crownBaseY);
  ctx.lineTo(headX + size * 0.1, crownBaseY);
  ctx.stroke();
  ctx.strokeStyle = `rgba(201, 168, 76, ${0.35 + Math.sin(time * 2.4) * 0.1})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.09, crownBaseY + size * 0.01);
  ctx.lineTo(headX + size * 0.09, crownBaseY + size * 0.01);
  ctx.stroke();

  // Void crystals at each spire tip (5 spires)
  const spireTips = [
    { s: 0.7, x: headX - size * 0.07, y: crownTopY + size * 0.02 },
    { s: 0.85, x: headX - size * 0.03, y: crownTopY },
    { s: 1, x: headX, y: crownTopY - size * 0.04 },
    { s: 0.85, x: headX + size * 0.03, y: crownTopY },
    { s: 0.7, x: headX + size * 0.07, y: crownTopY + size * 0.02 },
  ];
  for (let sp = 0; sp < spireTips.length; sp++) {
    const tip = spireTips[sp];
    const spPulse = 0.6 + Math.sin(time * 3.5 + sp * 1.2) * 0.4;
    const crystalR = size * 0.014 * tip.s;
    setShadowBlur(ctx, 6 * zoom * tip.s, accent);
    const spGrad = ctx.createRadialGradient(
      tip.x,
      tip.y + size * 0.02,
      0,
      tip.x,
      tip.y + size * 0.02,
      crystalR
    );
    spGrad.addColorStop(0, `rgba(232, 208, 255, ${spPulse})`);
    spGrad.addColorStop(0.5, accent);
    spGrad.addColorStop(1, accentDark);
    ctx.fillStyle = spGrad;
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x + crystalR, tip.y + size * 0.025 * tip.s);
    ctx.lineTo(tip.x, tip.y + size * 0.05 * tip.s);
    ctx.lineTo(tip.x - crystalR, tip.y + size * 0.025 * tip.s);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);
  }

  // Large center void crystal (dominant)
  setShadowBlur(ctx, 12 * zoom, accent);
  const crCrystalGrad = ctx.createRadialGradient(
    headX,
    crownMidY + size * 0.02,
    0,
    headX,
    crownMidY + size * 0.02,
    size * 0.025
  );
  crCrystalGrad.addColorStop(0, "#f0e0ff");
  crCrystalGrad.addColorStop(0.4, accent);
  crCrystalGrad.addColorStop(1, accentDark);
  ctx.fillStyle = crCrystalGrad;
  ctx.beginPath();
  ctx.moveTo(headX, crownMidY - size * 0.01);
  ctx.lineTo(headX + size * 0.02, crownMidY + size * 0.02);
  ctx.lineTo(headX, crownMidY + size * 0.05);
  ctx.lineTo(headX - size * 0.02, crownMidY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);

  // Glowing rune circles orbiting the crown
  ctx.lineWidth = 0.8 * zoom;
  for (let rc = 0; rc < 5; rc++) {
    const rcPhase = time * 2 + (rc * TAU) / 5;
    const rcR = size * 0.06 + Math.sin(time * 1.5 + rc) * size * 0.008;
    const rcX = headX + Math.cos(rcPhase) * rcR;
    const rcY = crownMidY + size * 0.02 + Math.sin(rcPhase) * rcR * 0.35;
    const rcAlpha = 0.3 + Math.sin(time * 3 + rc * 1.4) * 0.2;
    ctx.strokeStyle = `rgba(167, 139, 250, ${rcAlpha})`;
    ctx.beginPath();
    ctx.arc(rcX, rcY, size * 0.006, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rcX - size * 0.004, rcY);
    ctx.lineTo(rcX + size * 0.004, rcY);
    ctx.moveTo(rcX, rcY - size * 0.004);
    ctx.lineTo(rcX, rcY + size * 0.004);
    ctx.stroke();
  }

  // Shadow wreath arcs — more layers, wider orbits
  ctx.lineWidth = 1.5 * zoom;
  for (let w = 0; w < 5; w++) {
    const wPhase = time * 1.5 + (w * TAU) / 5;
    const wAlpha = voidPulse * (0.25 + (w % 2) * 0.15);
    ctx.strokeStyle = `rgba(76, 29, 149, ${wAlpha})`;
    ctx.beginPath();
    ctx.arc(
      headX,
      crownMidY + size * 0.02,
      size * 0.04 + w * size * 0.012,
      wPhase,
      wPhase + Math.PI * 0.5
    );
    ctx.stroke();
  }

  // Swept-back horns — longer, thicker, with etched void runes
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(headX + side * size * 0.09, crownBaseY);
    const hornGrad = ctx.createLinearGradient(
      0,
      0,
      side * size * 0.09,
      -size * 0.22
    );
    hornGrad.addColorStop(0, obsidianMid);
    hornGrad.addColorStop(0.3, obsidian);
    hornGrad.addColorStop(0.7, "#0a0018");
    hornGrad.addColorStop(1, "#050010");
    ctx.fillStyle = hornGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      side * size * 0.04,
      -size * 0.08,
      side * size * 0.1,
      -size * 0.16
    );
    ctx.quadraticCurveTo(
      side * size * 0.12,
      -size * 0.2,
      side * size * 0.14,
      -size * 0.24
    );
    ctx.quadraticCurveTo(
      side * size * 0.07,
      -size * 0.12,
      size * 0.005,
      size * 0.005
    );
    ctx.closePath();
    ctx.fill();

    // Horn edge glow
    ctx.strokeStyle = `rgba(167, 139, 250, ${voidPulse * 0.35})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      side * size * 0.04,
      -size * 0.08,
      side * size * 0.1,
      -size * 0.16
    );
    ctx.quadraticCurveTo(
      side * size * 0.12,
      -size * 0.2,
      side * size * 0.14,
      -size * 0.24
    );
    ctx.stroke();

    // Etched void runes along horn spine
    ctx.lineWidth = 0.6 * zoom;
    for (let rn = 0; rn < 4; rn++) {
      const rnT = (rn + 1) / 5;
      const rnX = side * size * (0.04 + rnT * 0.08);
      const rnY = -size * (0.04 + rnT * 0.16);
      const rnPulse = 0.2 + Math.sin(time * 3 + rn * 1.5 + side) * 0.3;
      ctx.strokeStyle = `rgba(167, 139, 250, ${rnPulse})`;
      ctx.beginPath();
      ctx.arc(rnX, rnY, size * 0.006, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rnX - size * 0.004, rnY - size * 0.004);
      ctx.lineTo(rnX + size * 0.004, rnY + size * 0.004);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Floating void shards orbiting the head
  for (let vs = 0; vs < 4; vs++) {
    const vsAngle = time * 1.3 + (vs * TAU) / 4;
    const vsR = size * 0.14 + Math.sin(time * 2 + vs * 2) * size * 0.015;
    const vsX = headX + Math.cos(vsAngle) * vsR;
    const vsY =
      crownMidY +
      Math.sin(vsAngle) * vsR * 0.3 +
      Math.sin(time * 2.5 + vs) * size * 0.01;
    const vsAlpha = 0.4 + Math.sin(time * 3 + vs * 1.8) * 0.25;
    ctx.save();
    ctx.translate(vsX, vsY);
    ctx.rotate(vsAngle + time * 0.5);
    setShadowBlur(ctx, 5 * zoom, accent);
    ctx.fillStyle = `rgba(167, 139, 250, ${vsAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.012);
    ctx.lineTo(size * 0.006, 0);
    ctx.lineTo(0, size * 0.012);
    ctx.lineTo(-size * 0.006, 0);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);
    ctx.restore();
  }

  // Floating contract scrolls orbiting body
  for (let sc = 0; sc < 3; sc++) {
    const scAngle = time * 0.8 + (sc * TAU) / 3;
    const scR = size * 0.35;
    const scX = cx + Math.cos(scAngle) * scR;
    const scY =
      y -
      size * 0.15 +
      Math.sin(scAngle) * scR * 0.3 +
      Math.sin(time * 2 + sc) * size * 0.02;
    const scAlpha = 0.3 + Math.sin(time * 2 + sc * 1.5) * 0.15;
    ctx.save();
    ctx.translate(scX, scY);
    ctx.rotate(Math.sin(time * 1.2 + sc) * 0.3);
    ctx.globalAlpha = scAlpha;
    ctx.fillStyle = "#d4c8a0";
    ctx.fillRect(-size * 0.015, -size * 0.025, size * 0.03, size * 0.05);
    ctx.fillStyle = "#b8a878";
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.025, size * 0.018, size * 0.005, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.025, size * 0.018, size * 0.005, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#685840";
    ctx.lineWidth = 0.5 * zoom;
    for (let tl = 0; tl < 3; tl++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.01, -size * 0.015 + tl * size * 0.012);
      ctx.lineTo(size * 0.01, -size * 0.015 + tl * size * 0.012);
      ctx.stroke();
    }
    ctx.fillStyle = vestRed;
    ctx.beginPath();
    ctx.arc(size * 0.005, size * 0.015, size * 0.005, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Seal stamps orbiting
  for (let st = 0; st < 2; st++) {
    const stAngle = -time * 1.2 + st * Math.PI;
    const stR = size * 0.25;
    const stX = cx + Math.cos(stAngle) * stR;
    const stY = y - size * 0.3 + Math.sin(stAngle) * stR * 0.25;
    const stAlpha = 0.25 + Math.sin(time * 2.5 + st) * 0.1;
    ctx.save();
    ctx.translate(stX, stY);
    ctx.rotate(stAngle);
    ctx.globalAlpha = stAlpha;
    ctx.fillStyle = leatherDark;
    ctx.fillRect(-size * 0.004, -size * 0.015, size * 0.008, size * 0.02);
    ctx.fillStyle = "#3a3a55";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.008, size * 0.01, size * 0.006, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Void portal rings at feet
  for (let r = 0; r < 2; r++) {
    const ringPhase = (time * 0.5 + r * 0.5) % 1;
    const ringR = size * (0.15 + ringPhase * 0.2);
    ctx.strokeStyle = `rgba(167, 139, 250, ${(1 - ringPhase) * 0.25})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.48, ringR, ringR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }

  drawShadowWisps(ctx, cx, y - size * 0.1, size, time, zoom, {
    color: "rgba(76, 29, 149, 0.35)",
    count: 4,
  });

  if (isAttacking) {
    ctx.strokeStyle = `rgba(167, 139, 250, ${attackIntensity * 0.7})`;
    ctx.lineWidth = 2.5 * zoom;
    const burstR = size * 0.2 * attackIntensity;
    ctx.beginPath();
    ctx.arc(cx, y - size * 0.3, burstR, 0, TAU);
    ctx.stroke();
  }

  drawRegionBodyAccent(ctx, cx, y - bodyBob, size, region, time, zoom);
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
  region: MapTheme = "grassland"
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 1.4, 0.018);
  const sway = getIdleSway(time, 0.4, 0.6, 0.5);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  let metalLight = "#a09888";
  let metalMid = "#706860";
  let metalDark = "#3a3430";
  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const curseGlow = 0.5 + Math.sin(time * 3) * 0.3;

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    metalLight = rm.metal.bright;
    metalMid = rm.metal.base;
    metalDark = rm.metal.dark;
  }

  // Red curse domain glow
  const curseGrad = ctx.createRadialGradient(
    cx,
    y + size * 0.3,
    0,
    cx,
    y + size * 0.3,
    size * 0.4
  );
  curseGrad.addColorStop(0, `rgba(185, 28, 28, ${curseGlow * 0.12})`);
  curseGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = curseGrad;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    y + size * 0.3,
    size * 0.4,
    size * 0.4 * ISO_Y_RATIO,
    0,
    0,
    TAU
  );
  ctx.fill();

  // Legs — heavy armored
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: "#1a1510",
    legLen: 0.17,
    strideAmt: 0.14,
    strideSpeed: 2.2,
    style: "armored",
    width: 0.065,
  });

  // Heavy armor skirt (wider than usual)
  drawArmorSkirt(
    ctx,
    cx,
    y - size * 0.02 - bodyBob,
    size,
    size * 0.28,
    size * 0.13,
    metalMid,
    metalDark,
    6
  );

  // BULKY plate cuirass — wider, thicker than standard
  const cuirassGrad = ctx.createLinearGradient(
    cx - size * 0.22,
    y - size * 0.35,
    cx + size * 0.22,
    y - size * 0.04
  );
  cuirassGrad.addColorStop(0, metalDark);
  cuirassGrad.addColorStop(0.2, metalMid);
  cuirassGrad.addColorStop(0.4, metalLight);
  cuirassGrad.addColorStop(0.6, metalMid);
  cuirassGrad.addColorStop(0.8, metalLight);
  cuirassGrad.addColorStop(1, metalDark);
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, y - size * 0.34 - bodyBob);
  ctx.bezierCurveTo(
    cx - size * 0.26,
    y - size * 0.12 - bodyBob,
    cx - size * 0.24,
    y + size * 0.01 - bodyBob,
    cx - size * 0.18,
    y + size * 0.04 - bodyBob
  );
  ctx.lineTo(cx + size * 0.18, y + size * 0.04 - bodyBob);
  ctx.bezierCurveTo(
    cx + size * 0.24,
    y + size * 0.01 - bodyBob,
    cx + size * 0.26,
    y - size * 0.12 - bodyBob,
    cx + size * 0.22,
    y - size * 0.34 - bodyBob
  );
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
      ctx.arc(
        cx - size * 0.16 + rv * size * 0.065,
        bandY,
        size * 0.005,
        0,
        TAU
      );
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
  drawGorget(
    ctx,
    cx,
    y - size * 0.34 - bodyBob,
    size,
    size * 0.18,
    metalMid,
    metalDark
  );

  // MASSIVE spiked pauldrons
  for (const side of [-1, 1] as const) {
    drawShoulderOverlay(
      ctx,
      cx + side * size * 0.26,
      y - size * 0.3 - bodyBob,
      size * 1.3,
      side,
      metalMid,
      metalDark,
      "plate"
    );
    for (let sp = 0; sp < 4; sp++) {
      const sAngle = side * (0.2 + sp * 0.35) - Math.PI * 0.4;
      const spBase = cx + side * size * 0.26;
      const spBaseY = y - size * 0.32 - bodyBob;
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.moveTo(
        spBase + Math.cos(sAngle) * size * 0.04,
        spBaseY + Math.sin(sAngle) * size * 0.03
      );
      ctx.lineTo(
        spBase + Math.cos(sAngle) * size * 0.1,
        spBaseY + Math.sin(sAngle) * size * 0.06 - size * 0.04
      );
      ctx.lineTo(
        spBase + Math.cos(sAngle) * size * 0.05,
        spBaseY + Math.sin(sAngle) * size * 0.04
      );
      ctx.fill();
    }
  }

  // Heavy belt
  drawBeltOverlay(
    ctx,
    cx,
    y - size * 0.02 - bodyBob,
    size,
    size * 0.26,
    metalDark,
    "#1a1510",
    accent
  );

  // Right arm — CROSSBOW BRACE / STRING PULL
  const braceForeLen = 0.13;
  drawPathArm(
    ctx,
    cx + size * 0.26,
    y - size * 0.26 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      elbowAngle: -(0.5 + (isAttacking ? attackIntensity * 0.3 : 0)),
      foreLen: braceForeLen,
      handColor: metalMid,
      onWeapon: (wCtx) => {
        wCtx.translate(0, braceForeLen * size * 0.35);
        wCtx.rotate(-0.2);
        // Armored gauntlet gripping the crossbow string
        // Leather cocking grip / string hook
        const gripW = size * 0.025;
        const gripH = size * 0.04;
        const gripGrad = wCtx.createLinearGradient(-gripW, 0, gripW, 0);
        gripGrad.addColorStop(0, metalDark);
        gripGrad.addColorStop(0.5, metalMid);
        gripGrad.addColorStop(1, metalDark);
        wCtx.fillStyle = gripGrad;
        wCtx.beginPath();
        wCtx.roundRect(-gripW, -gripH * 0.3, gripW * 2, gripH, size * 0.005);
        wCtx.fill();
        wCtx.strokeStyle = metalLight;
        wCtx.lineWidth = 0.8 * zoom;
        wCtx.stroke();
        // Metal cocking hook (used to pull the string)
        wCtx.strokeStyle = metalLight;
        wCtx.lineWidth = 2 * zoom;
        wCtx.lineCap = "round";
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.015, gripH * 0.5);
        wCtx.quadraticCurveTo(-size * 0.02, gripH * 0.8, 0, gripH * 0.9);
        wCtx.quadraticCurveTo(
          size * 0.02,
          gripH * 0.8,
          size * 0.015,
          gripH * 0.5
        );
        wCtx.stroke();
        wCtx.lineCap = "butt";
        // String gripped in the hook — always visible with strong tension
        const stringTension = isAttacking
          ? attackIntensity * size * 0.1
          : size * 0.025 + Math.sin(time * 1.5) * size * 0.006;
        wCtx.strokeStyle = `rgba(230, 222, 195, ${0.9 + (isAttacking ? 0.1 : 0)})`;
        wCtx.lineWidth = 1.5 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.08, gripH * 0.4);
        wCtx.lineTo(0, gripH * 1 + stringTension);
        wCtx.lineTo(size * 0.08, gripH * 0.4);
        wCtx.stroke();
        // Bright inner highlight
        wCtx.strokeStyle = `rgba(255, 252, 240, 0.55)`;
        wCtx.lineWidth = 0.7 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.075, gripH * 0.45);
        wCtx.lineTo(0, gripH * 0.95 + stringTension);
        wCtx.lineTo(size * 0.075, gripH * 0.45);
        wCtx.stroke();
        // Glow when pulling hard
        if (isAttacking) {
          setShadowBlur(wCtx, 5 * zoom, "#ffddaa");
          wCtx.strokeStyle = `rgba(255, 240, 200, ${attackIntensity * 0.5})`;
          wCtx.lineWidth = 2.5 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.08, gripH * 0.4);
          wCtx.lineTo(0, gripH * 1 + stringTension);
          wCtx.lineTo(size * 0.08, gripH * 0.4);
          wCtx.stroke();
          clearShadow(wCtx);
        }
        // Red curse glow on the hook during tension
        if (isAttacking) {
          setShadowBlur(wCtx, 4 * zoom, "#dc2626");
          wCtx.fillStyle = `rgba(220, 38, 38, ${attackIntensity * 0.5})`;
          wCtx.beginPath();
          wCtx.arc(0, gripH * 0.85, size * 0.006, 0, TAU);
          wCtx.fill();
          clearShadow(wCtx);
        }
        // Knuckle rivets on gauntlet
        wCtx.fillStyle = metalLight;
        for (let r = 0; r < 3; r++) {
          const rx = -size * 0.012 + r * size * 0.012;
          wCtx.beginPath();
          wCtx.arc(rx, -gripH * 0.1, size * 0.003, 0, TAU);
          wCtx.fill();
        }
      },
      shoulderAngle:
        -(0.5 + Math.sin(time * 1) * 0.02) -
        (isAttacking ? attackIntensity * 0.4 : 0),
      style: "armored",
      upperLen: 0.16,
      width: 0.065,
    }
  );

  // Left arm — SIEGE CROSSBOW (fires across body)
  const xbowForeLen = 0.15;
  drawPathArm(
    ctx,
    cx - size * 0.26,
    y - size * 0.26 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      elbowAngle: -(0.15 + (isAttacking ? attackIntensity * 0.1 : 0)),
      foreLen: xbowForeLen,
      handColor: metalMid,
      onWeapon: (wCtx) => {
        const handY = xbowForeLen * size;
        wCtx.translate(0, handY * 0.45);
        wCtx.rotate(2.6);

        const mechPulse = 0.5 + Math.sin(time * 3) * 0.3;
        const boltVibrate = isAttacking
          ? Math.sin(time * 30) * size * 0.002
          : 0;
        const stringPull = isAttacking ? attackIntensity * size * 0.05 : 0;
        const stringVibrate =
          isAttacking && attackIntensity < 0.3
            ? Math.sin(time * 40) * size * 0.004
            : 0;

        const tillerLen = size * 0.25;
        const tillerW = size * 0.035;
        const prodSpan = size * 0.24;
        const prodY = -tillerLen + size * 0.01;

        // ── TILLER (stock body) ──
        const tillerGrad = wCtx.createLinearGradient(-tillerW, 0, tillerW, 0);
        tillerGrad.addColorStop(0, "#1e1008");
        tillerGrad.addColorStop(0.15, "#3a2010");
        tillerGrad.addColorStop(0.35, "#6a4428");
        tillerGrad.addColorStop(0.5, "#7a5030");
        tillerGrad.addColorStop(0.65, "#6a4428");
        tillerGrad.addColorStop(0.85, "#3a2010");
        tillerGrad.addColorStop(1, "#1e1008");
        wCtx.fillStyle = tillerGrad;
        wCtx.beginPath();
        wCtx.moveTo(-tillerW * 1.3, size * 0.09);
        wCtx.lineTo(-tillerW * 1.1, size * 0.04);
        wCtx.lineTo(-tillerW * 0.9, -size * 0.02);
        wCtx.lineTo(-tillerW * 0.85, -tillerLen);
        wCtx.lineTo(tillerW * 0.85, -tillerLen);
        wCtx.lineTo(tillerW * 0.9, -size * 0.02);
        wCtx.lineTo(tillerW * 1.1, size * 0.04);
        wCtx.lineTo(tillerW * 1.3, size * 0.09);
        wCtx.closePath();
        wCtx.fill();

        // Tiller edge highlight
        wCtx.strokeStyle = "rgba(120,80,48,0.4)";
        wCtx.lineWidth = 0.8 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-tillerW * 0.5, size * 0.07);
        wCtx.lineTo(-tillerW * 0.5, -tillerLen * 0.95);
        wCtx.stroke();
        wCtx.beginPath();
        wCtx.moveTo(tillerW * 0.5, size * 0.07);
        wCtx.lineTo(tillerW * 0.5, -tillerLen * 0.95);
        wCtx.stroke();

        // Wood grain lines
        wCtx.strokeStyle = "rgba(60,30,10,0.15)";
        wCtx.lineWidth = 0.5 * zoom;
        for (let g = 0; g < 7; g++) {
          const gx = -tillerW * 0.65 + g * tillerW * 0.22;
          const waveAmp = size * 0.002;
          wCtx.beginPath();
          wCtx.moveTo(gx, size * 0.07);
          for (let gy = size * 0.06; gy > -tillerLen * 0.9; gy -= size * 0.02) {
            wCtx.lineTo(gx + Math.sin(gy * 50 + g) * waveAmp, gy);
          }
          wCtx.stroke();
        }

        // Decorative brass inlay diamonds on tiller
        wCtx.fillStyle = "rgba(180, 140, 60, 0.5)";
        const inlayPositions = [-size * 0.04, -size * 0.1, -size * 0.16];
        for (const iy of inlayPositions) {
          const dSize = size * 0.007;
          wCtx.beginPath();
          wCtx.moveTo(0, iy - dSize);
          wCtx.lineTo(-dSize * 0.6, iy);
          wCtx.lineTo(0, iy + dSize);
          wCtx.lineTo(dSize * 0.6, iy);
          wCtx.closePath();
          wCtx.fill();
        }

        // Pulsing rune glow on tiller body
        setShadowBlur(wCtx, 6 * zoom, `rgba(220, 38, 38, ${mechPulse * 0.3})`);
        wCtx.strokeStyle = `rgba(220, 38, 38, ${mechPulse * 0.2})`;
        wCtx.lineWidth = 1 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.06);
        wCtx.lineTo(-size * 0.008, -size * 0.08);
        wCtx.lineTo(0, -size * 0.1);
        wCtx.lineTo(size * 0.008, -size * 0.08);
        wCtx.closePath();
        wCtx.stroke();
        clearShadow(wCtx);

        // ── BOLT GROOVE / RAIL ──
        const railOff = tillerW * 0.25;
        wCtx.strokeStyle = "#4a3420";
        wCtx.lineWidth = 0.7 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-railOff, -size * 0.01);
        wCtx.lineTo(-railOff, -tillerLen * 0.98);
        wCtx.stroke();
        wCtx.beginPath();
        wCtx.moveTo(railOff, -size * 0.01);
        wCtx.lineTo(railOff, -tillerLen * 0.98);
        wCtx.stroke();
        wCtx.fillStyle = "rgba(30,16,8,0.25)";
        wCtx.fillRect(
          -railOff,
          -tillerLen * 0.98,
          railOff * 2,
          tillerLen * 0.97
        );

        // ── LEATHER GRIP WRAPPING ──
        const lgY = size * 0.01;
        const lgH = size * 0.06;
        const lgW = tillerW * 1.05;
        wCtx.fillStyle = "#5a3a1e";
        wCtx.beginPath();
        wCtx.roundRect(-lgW, lgY, lgW * 2, lgH, size * 0.004);
        wCtx.fill();
        wCtx.strokeStyle = "rgba(80,55,30,0.6)";
        wCtx.lineWidth = 0.5 * zoom;
        wCtx.stroke();
        // Cross-hatch on grip
        wCtx.strokeStyle = "rgba(90,65,35,0.7)";
        wCtx.lineWidth = 0.6 * zoom;
        const hatchCount = 6;
        for (let h = 0; h < hatchCount; h++) {
          const hy = lgY + ((h + 0.5) * lgH) / hatchCount;
          wCtx.beginPath();
          wCtx.moveTo(-lgW * 0.85, hy - (lgH / hatchCount) * 0.35);
          wCtx.lineTo(lgW * 0.85, hy + (lgH / hatchCount) * 0.35);
          wCtx.stroke();
          wCtx.beginPath();
          wCtx.moveTo(-lgW * 0.85, hy + (lgH / hatchCount) * 0.35);
          wCtx.lineTo(lgW * 0.85, hy - (lgH / hatchCount) * 0.35);
          wCtx.stroke();
        }

        // ── STIRRUP ──
        wCtx.strokeStyle = metalDark;
        wCtx.lineWidth = 2.5 * zoom;
        wCtx.lineCap = "round";
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.02, -tillerLen);
        wCtx.lineTo(-size * 0.025, -tillerLen - size * 0.015);
        wCtx.quadraticCurveTo(
          -size * 0.02,
          -tillerLen - size * 0.035,
          0,
          -tillerLen - size * 0.038
        );
        wCtx.quadraticCurveTo(
          size * 0.02,
          -tillerLen - size * 0.035,
          size * 0.025,
          -tillerLen - size * 0.015
        );
        wCtx.lineTo(size * 0.02, -tillerLen);
        wCtx.stroke();
        // Inner metalLight highlight on stirrup
        wCtx.strokeStyle = `rgba(200, 200, 210, 0.4)`;
        wCtx.lineWidth = 0.8 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.016, -tillerLen - size * 0.01);
        wCtx.quadraticCurveTo(
          -size * 0.014,
          -tillerLen - size * 0.03,
          0,
          -tillerLen - size * 0.033
        );
        wCtx.quadraticCurveTo(
          size * 0.014,
          -tillerLen - size * 0.03,
          size * 0.016,
          -tillerLen - size * 0.01
        );
        wCtx.stroke();
        wCtx.lineCap = "butt";

        // ── PROD (bow limbs) ──
        // Iron reinforcement plate where prod meets tiller
        wCtx.fillStyle = metalDark;
        wCtx.beginPath();
        wCtx.moveTo(-tillerW * 1.2, prodY + size * 0.015);
        wCtx.lineTo(-tillerW * 1.2, prodY - size * 0.012);
        wCtx.lineTo(tillerW * 1.2, prodY - size * 0.012);
        wCtx.lineTo(tillerW * 1.2, prodY + size * 0.015);
        wCtx.closePath();
        wCtx.fill();
        // Rivet on plate
        for (const rx of [-1, 1] as const) {
          wCtx.fillStyle = metalLight;
          wCtx.beginPath();
          wCtx.arc(rx * tillerW * 0.8, prodY, size * 0.003, 0, TAU);
          wCtx.fill();
        }

        const prodGrad = wCtx.createLinearGradient(
          0,
          prodY - size * 0.015,
          0,
          prodY + size * 0.015
        );
        prodGrad.addColorStop(0, metalLight);
        prodGrad.addColorStop(0.5, metalMid);
        prodGrad.addColorStop(1, metalDark);
        wCtx.strokeStyle = prodGrad;
        wCtx.lineWidth = 3 * zoom;
        wCtx.lineCap = "round";

        // Left limb with recurve
        wCtx.beginPath();
        wCtx.moveTo(0, prodY);
        wCtx.bezierCurveTo(
          -prodSpan * 0.25,
          prodY + size * 0.008,
          -prodSpan * 0.6,
          prodY - size * 0.018,
          -prodSpan * 0.85,
          prodY + size * 0.005
        );
        wCtx.bezierCurveTo(
          -prodSpan * 0.92,
          prodY + size * 0.012,
          -prodSpan * 0.97,
          prodY - size * 0.005,
          -prodSpan,
          prodY - size * 0.012
        );
        wCtx.stroke();

        // Right limb with recurve
        wCtx.beginPath();
        wCtx.moveTo(0, prodY);
        wCtx.bezierCurveTo(
          prodSpan * 0.25,
          prodY + size * 0.008,
          prodSpan * 0.6,
          prodY - size * 0.018,
          prodSpan * 0.85,
          prodY + size * 0.005
        );
        wCtx.bezierCurveTo(
          prodSpan * 0.92,
          prodY + size * 0.012,
          prodSpan * 0.97,
          prodY - size * 0.005,
          prodSpan,
          prodY - size * 0.012
        );
        wCtx.stroke();

        // Edge highlight on prod limbs for depth
        wCtx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        wCtx.lineWidth = 0.6 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(0, prodY);
        wCtx.bezierCurveTo(
          -prodSpan * 0.25,
          prodY + size * 0.006,
          -prodSpan * 0.6,
          prodY - size * 0.02,
          -prodSpan * 0.85,
          prodY + size * 0.003
        );
        wCtx.bezierCurveTo(
          -prodSpan * 0.92,
          prodY + size * 0.01,
          -prodSpan * 0.97,
          prodY - size * 0.007,
          -prodSpan,
          prodY - size * 0.014
        );
        wCtx.stroke();
        wCtx.beginPath();
        wCtx.moveTo(0, prodY);
        wCtx.bezierCurveTo(
          prodSpan * 0.25,
          prodY + size * 0.006,
          prodSpan * 0.6,
          prodY - size * 0.02,
          prodSpan * 0.85,
          prodY + size * 0.003
        );
        wCtx.bezierCurveTo(
          prodSpan * 0.92,
          prodY + size * 0.01,
          prodSpan * 0.97,
          prodY - size * 0.007,
          prodSpan,
          prodY - size * 0.014
        );
        wCtx.stroke();
        wCtx.lineCap = "butt";

        // Decorative end caps / nocks
        for (const side of [-1, 1] as const) {
          const tipX = side * prodSpan;
          const tipY = prodY - size * 0.012;
          wCtx.fillStyle = metalDark;
          wCtx.beginPath();
          wCtx.arc(tipX, tipY, size * 0.008, 0, TAU);
          wCtx.fill();
          wCtx.fillStyle = metalLight;
          wCtx.beginPath();
          wCtx.arc(tipX, tipY, size * 0.004, 0, TAU);
          wCtx.fill();
        }

        // Faint red curse energy wisps along prod limbs
        for (const side of [-1, 1] as const) {
          const wispCount = 3;
          for (let w = 0; w < wispCount; w++) {
            const t = (w + 1) / (wispCount + 1);
            const wx = side * prodSpan * t;
            const wy =
              prodY +
              Math.sin(t * Math.PI) * size * -0.01 +
              Math.sin(time * 4 + w * 2) * size * 0.004;
            const wispAlpha = mechPulse * 0.25;
            setShadowBlur(wCtx, 4 * zoom, `rgba(220, 38, 38, ${wispAlpha})`);
            wCtx.fillStyle = `rgba(220, 38, 38, ${wispAlpha * 0.7})`;
            wCtx.beginPath();
            wCtx.arc(wx, wy, size * 0.004, 0, TAU);
            wCtx.fill();
          }
        }
        clearShadow(wCtx);

        // ── BOWSTRING ──
        const limbTipY = prodY - size * 0.012;
        const idleTension = size * 0.05 + Math.sin(time * 1.5) * size * 0.01;
        const xbowStringPull = isAttacking
          ? attackIntensity * size * 0.2 + stringVibrate
          : idleTension;
        wCtx.strokeStyle = "#ede8d0";
        wCtx.lineWidth = 1.5 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-prodSpan, limbTipY);
        wCtx.quadraticCurveTo(
          0,
          limbTipY + size * 0.02 + xbowStringPull,
          prodSpan,
          limbTipY
        );
        wCtx.stroke();
        // Inner bright string highlight
        wCtx.strokeStyle = "rgba(255, 252, 240, 0.6)";
        wCtx.lineWidth = 0.7 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-prodSpan * 0.95, limbTipY);
        wCtx.quadraticCurveTo(
          0,
          limbTipY + size * 0.02 + xbowStringPull,
          prodSpan * 0.95,
          limbTipY
        );
        wCtx.stroke();
        // Outer glow on string when attacking
        if (isAttacking) {
          setShadowBlur(wCtx, 6 * zoom, "#dc2626");
          wCtx.strokeStyle = `rgba(220, 200, 170, ${0.4 + attackIntensity * 0.4})`;
          wCtx.lineWidth = 2.5 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(-prodSpan, limbTipY);
          wCtx.quadraticCurveTo(
            0,
            limbTipY + size * 0.02 + xbowStringPull,
            prodSpan,
            limbTipY
          );
          wCtx.stroke();
          clearShadow(wCtx);
        }

        // ── TRIGGER MECHANISM ──
        // Nut housing box
        wCtx.fillStyle = metalMid;
        wCtx.fillRect(-size * 0.013, -size * 0.05, size * 0.026, size * 0.03);
        wCtx.strokeStyle = metalDark;
        wCtx.lineWidth = 1 * zoom;
        wCtx.strokeRect(-size * 0.013, -size * 0.05, size * 0.026, size * 0.03);
        // Inner nut
        wCtx.fillStyle = metalDark;
        wCtx.fillRect(-size * 0.007, -size * 0.042, size * 0.014, size * 0.016);
        // Trigger lever
        wCtx.strokeStyle = metalMid;
        wCtx.lineWidth = 2 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(size * 0.006, -size * 0.02);
        wCtx.lineTo(size * 0.012, size * 0.01);
        wCtx.lineTo(size * 0.008, size * 0.03);
        wCtx.stroke();
        // Curved trigger guard
        wCtx.strokeStyle = metalDark;
        wCtx.lineWidth = 1.2 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.005, -size * 0.02);
        wCtx.quadraticCurveTo(
          size * 0.02,
          size * 0.02,
          size * 0.008,
          size * 0.035
        );
        wCtx.stroke();

        // ── BOLT on rail (parallel to tiller along Y axis) ──
        const boltStartY = -size * 0.04;
        const boltEndY = -tillerLen - size * 0.06;

        // Bolt shaft
        const boltGrad = wCtx.createLinearGradient(0, boltStartY, 0, boltEndY);
        boltGrad.addColorStop(0, "#777");
        boltGrad.addColorStop(0.3, "#bbb");
        boltGrad.addColorStop(0.7, "#ccc");
        boltGrad.addColorStop(1, "#999");
        wCtx.strokeStyle = boltGrad;
        wCtx.lineWidth = 2 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(boltVibrate, boltStartY);
        wCtx.lineTo(boltVibrate, boltEndY);
        wCtx.stroke();

        // Sharp diamond broadhead at the tip
        setShadowBlur(wCtx, 5 * zoom, "#dc2626");
        wCtx.fillStyle = "#c0c0c0";
        wCtx.beginPath();
        wCtx.moveTo(boltVibrate, boltEndY - size * 0.025);
        wCtx.lineTo(boltVibrate - size * 0.012, boltEndY);
        wCtx.lineTo(boltVibrate, boltEndY + size * 0.008);
        wCtx.lineTo(boltVibrate + size * 0.012, boltEndY);
        wCtx.closePath();
        wCtx.fill();

        // Glowing rune on bolt head
        wCtx.fillStyle = `rgba(220, 38, 38, ${0.5 + mechPulse * 0.4})`;
        wCtx.beginPath();
        wCtx.arc(boltVibrate, boltEndY - size * 0.01, size * 0.005, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);

        // Fletching vanes at nock end
        for (const fx of [-1, 1] as const) {
          wCtx.fillStyle = "#4a4a4a";
          wCtx.beginPath();
          wCtx.moveTo(boltVibrate, boltStartY);
          wCtx.lineTo(
            boltVibrate + fx * size * 0.01,
            boltStartY + size * 0.015
          );
          wCtx.lineTo(boltVibrate, boltStartY + size * 0.025);
          wCtx.closePath();
          wCtx.fill();
        }

        // ── Metal reinforcement bands on tiller ──
        for (let b = 0; b < 3; b++) {
          const by = -size * 0.02 - b * size * 0.06;
          // Band
          wCtx.fillStyle = metalMid;
          wCtx.fillRect(-tillerW * 1.05, by, tillerW * 2.1, size * 0.009);
          // Edge highlight
          wCtx.fillStyle = metalLight;
          wCtx.fillRect(-tillerW * 1.05, by, tillerW * 2.1, size * 0.002);
          // Rivets on each band
          for (const rx of [-0.7, 0.7] as const) {
            wCtx.fillStyle = metalLight;
            wCtx.beginPath();
            wCtx.arc(tillerW * rx, by + size * 0.0045, size * 0.003, 0, TAU);
            wCtx.fill();
            wCtx.fillStyle = metalDark;
            wCtx.beginPath();
            wCtx.arc(tillerW * rx, by + size * 0.0045, size * 0.0015, 0, TAU);
            wCtx.fill();
          }
        }
      },
      shoulderAngle:
        -(0.85 + (isAttacking ? attackIntensity * 0.2 : 0)) -
        Math.sin(time * 1.2) * 0.02,
      style: "armored",
      upperLen: 0.17,
      width: 0.065,
    }
  );

  // HEAD — Great helm / bucket helm with T-visor (NOT drawArmoredHelm)
  const headX = cx;
  const headY = y - size * 0.47 - bodyBob;
  const helmR = size * 0.16;
  // Flat-topped bucket shape
  const helmGrad = ctx.createLinearGradient(
    headX - helmR,
    headY - helmR,
    headX + helmR,
    headY + helmR
  );
  helmGrad.addColorStop(0, metalLight);
  helmGrad.addColorStop(0.3, metalMid);
  helmGrad.addColorStop(0.7, metalDark);
  helmGrad.addColorStop(1, metalMid);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(headX - helmR, headY - helmR * 0.6);
  ctx.lineTo(headX - helmR, headY + helmR * 0.8);
  ctx.quadraticCurveTo(
    headX,
    headY + helmR * 1,
    headX + helmR,
    headY + helmR * 0.8
  );
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
  ctx.lineTo(headX + helmR * 0.4, headY - helmR * 1);
  ctx.lineTo(headX - helmR * 0.4, headY - helmR * 1);
  ctx.closePath();
  ctx.fill();
  // T-shaped visor slit
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(
    headX - helmR * 0.5,
    headY - size * 0.01,
    helmR * 1,
    size * 0.015
  );
  ctx.fillRect(
    headX - size * 0.01,
    headY - size * 0.01,
    size * 0.02,
    size * 0.06
  );
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
  ctx.moveTo(headX, headY - helmR * 1);
  ctx.lineTo(headX, headY + helmR * 0.4);
  ctx.stroke();
  // Cross rivets on helm
  ctx.fillStyle = metalLight;
  for (let rv = 0; rv < 4; rv++) {
    ctx.beginPath();
    ctx.arc(
      headX - helmR * 0.3 + rv * helmR * 0.2,
      headY - helmR * 0.5,
      size * 0.005,
      0,
      TAU
    );
    ctx.fill();
  }
  // Central horn spike on top
  ctx.fillStyle = metalDark;
  ctx.beginPath();
  ctx.moveTo(headX, headY - helmR * 1);
  ctx.lineTo(headX - size * 0.015, headY - helmR * 0.85);
  ctx.lineTo(headX + size * 0.015, headY - helmR * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = metalLight;
  ctx.beginPath();
  ctx.moveTo(headX, headY - helmR * 1 - size * 0.06);
  ctx.lineTo(headX - size * 0.01, headY - helmR * 1);
  ctx.lineTo(headX + size * 0.01, headY - helmR * 1);
  ctx.closePath();
  ctx.fill();

  drawEmberSparks(ctx, cx, y - size * 0.2, size, time, zoom, {
    color: "rgba(220, 38, 38, 0.6)",
    count: 4,
  });

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

  drawRegionBodyAccent(ctx, cx, y - bodyBob, size, region, time, zoom);
  drawRegionWeaponAccent(
    ctx,
    cx + size * 0.25,
    y - size * 0.35,
    size,
    region,
    time,
    zoom
  );
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
  region: MapTheme = "grassland"
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breath = getBreathScale(time, 2, 0.025);
  const sway = getIdleSway(time, 0.9, 1.5, 1);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const accent = bodyColor;
  const accentDark = bodyColorDark;
  const bladePulse = 0.5 + Math.sin(time * 3.5) * 0.4;
  const windPhase = time * 1.8;

  let capeCrimson = "#6b1010";
  let capeCrimsonLight = "#8b1a1a";
  let capeCrimsonDark = "#5a0808";
  let capeCrimsonDarkest = "#3a0505";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    capeCrimson = rm.cloth.base;
    capeCrimsonLight = rm.cloth.light;
    capeCrimsonDark = rm.cloth.dark;
    capeCrimsonDarkest = rm.cloth.dark;
  }

  // Cherry blossom petals falling around the dancer
  for (let p = 0; p < 8; p++) {
    const petalT = (time * 0.6 + p * 1.37) % 4;
    const petalX =
      cx +
      Math.sin(time * 0.8 + p * 2.1) * size * 0.35 +
      Math.cos(time * 1.3 + p) * size * 0.08;
    const petalY = y - size * 0.5 + petalT * size * 0.25;
    const petalAlpha =
      petalT < 0.3 ? petalT / 0.3 : petalT > 3.5 ? (4 - petalT) / 0.5 : 0.6;
    const petalRot = time * 2.5 + p * 1.5;
    if (petalAlpha > 0.01) {
      ctx.save();
      ctx.translate(petalX, petalY);
      ctx.rotate(petalRot);
      ctx.fillStyle = `rgba(255, 183, 197, ${petalAlpha * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.008, size * 0.005, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // Dramatic flowing dancer's cape — wide silk with scalloped edges and gold trim
  ctx.save();
  const capeTopY = y - size * 0.33 - bodyBob;
  const capeSpread = size * 0.3 + Math.sin(windPhase * 0.8) * size * 0.03;
  const capeLen = size * 0.52;
  const capeGrad = ctx.createLinearGradient(
    cx,
    capeTopY,
    cx,
    capeTopY + capeLen
  );
  capeGrad.addColorStop(0, capeCrimson);
  capeGrad.addColorStop(0.3, capeCrimsonLight);
  capeGrad.addColorStop(0.6, capeCrimsonDark);
  capeGrad.addColorStop(1, capeCrimsonDarkest);
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.1, capeTopY);
  ctx.quadraticCurveTo(
    cx - capeSpread * 0.7,
    capeTopY + capeLen * 0.35,
    cx - capeSpread + Math.sin(windPhase) * size * 0.03,
    capeTopY + capeLen * 0.88
  );
  for (let sc = 0; sc <= 6; sc++) {
    const t = sc / 6;
    const scX =
      cx -
      capeSpread +
      t * capeSpread * 2 +
      Math.sin(windPhase * 1.3 + sc * 1.1) * size * 0.015;
    const scY =
      capeTopY + capeLen + Math.sin(windPhase * 1.5 + sc * 0.9) * size * 0.018;
    const cpX = scX + capeSpread * 0.15;
    const cpY = scY + (sc % 2 === 0 ? size * 0.025 : -size * 0.012);
    ctx.quadraticCurveTo(cpX, cpY, scX, scY);
  }
  ctx.quadraticCurveTo(
    cx + capeSpread * 0.7,
    capeTopY + capeLen * 0.35,
    cx + size * 0.1,
    capeTopY
  );
  ctx.closePath();
  ctx.fill();
  // Inner lining flash — gold silk revealed by wind
  const liningAlpha = 0.12 + Math.sin(windPhase * 1.5) * 0.06;
  ctx.fillStyle = `rgba(212, 160, 64, ${liningAlpha})`;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.08, capeTopY + size * 0.02);
  ctx.quadraticCurveTo(
    cx - capeSpread * 0.45,
    capeTopY + capeLen * 0.4,
    cx - capeSpread * 0.65 + Math.sin(windPhase) * size * 0.02,
    capeTopY + capeLen * 0.82
  );
  ctx.lineTo(
    cx + capeSpread * 0.65 + Math.sin(windPhase + 1) * size * 0.02,
    capeTopY + capeLen * 0.82
  );
  ctx.quadraticCurveTo(
    cx + capeSpread * 0.45,
    capeTopY + capeLen * 0.4,
    cx + size * 0.08,
    capeTopY + size * 0.02
  );
  ctx.closePath();
  ctx.fill();
  // Gold trim along cape edges
  ctx.strokeStyle = `rgba(212, 175, 55, ${0.5 + Math.sin(windPhase) * 0.15})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.1, capeTopY);
  ctx.quadraticCurveTo(
    cx - capeSpread * 0.7,
    capeTopY + capeLen * 0.35,
    cx - capeSpread + Math.sin(windPhase) * size * 0.03,
    capeTopY + capeLen * 0.88
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.1, capeTopY);
  ctx.quadraticCurveTo(
    cx + capeSpread * 0.7,
    capeTopY + capeLen * 0.35,
    cx + capeSpread + Math.sin(windPhase + 1) * size * 0.03,
    capeTopY + capeLen * 0.88
  );
  ctx.stroke();
  // Ribbon streamers flowing from cape bottom
  for (let rs = 0; rs < 5; rs++) {
    const rsX = cx - capeSpread * 0.7 + rs * capeSpread * 0.35;
    const rsY = capeTopY + capeLen * 0.92;
    const rsWind = Math.sin(windPhase * 1.6 + rs * 1.3) * size * 0.04;
    const rsLen = size * (0.06 + Math.sin(time + rs) * 0.02);
    ctx.strokeStyle =
      rs % 2 === 0
        ? `rgba(180, 20, 60, ${0.5 + Math.sin(time * 2 + rs) * 0.15})`
        : `rgba(212, 175, 55, ${0.4 + Math.sin(time * 2 + rs) * 0.15})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rsX, rsY);
    ctx.quadraticCurveTo(
      rsX + rsWind * 0.6,
      rsY + rsLen * 0.5,
      rsX + rsWind,
      rsY + rsLen
    );
    ctx.stroke();
    ctx.lineCap = "butt";
  }
  ctx.restore();

  // Legs with bandage wraps
  drawPathLegs(ctx, cx, y + size * 0.12 - bodyBob, size, time, zoom, {
    color: "#3a2028",
    colorDark: "#1a0a10",
    footColor: "#2a1018",
    legLen: 0.15,
    strideAmt: 0.18,
    strideSpeed: 2.8,
    style: "fleshy",
    width: 0.042,
  });

  // Battle-split hakama pants — two wide flowing panels
  for (const side of [-1, 1]) {
    const hakamaGrad = ctx.createLinearGradient(
      cx + side * size * 0.02,
      y - size * 0.06,
      cx + side * size * 0.15,
      y + size * 0.2
    );
    hakamaGrad.addColorStop(0, "#8b1a1a");
    hakamaGrad.addColorStop(0.4, "#6b1010");
    hakamaGrad.addColorStop(1, "#3a0808");
    ctx.fillStyle = hakamaGrad;
    ctx.beginPath();
    ctx.moveTo(cx + side * size * 0.02, y - size * 0.06 - bodyBob);
    ctx.quadraticCurveTo(
      cx + side * size * 0.16,
      y + size * 0.04 - bodyBob,
      cx + side * size * 0.14 + Math.sin(windPhase + side) * size * 0.02,
      y + size * 0.2 + Math.sin(windPhase * 1.2 + side * 2) * size * 0.01
    );
    ctx.lineTo(
      cx + side * size * 0.04 + Math.sin(windPhase + side * 1.5) * size * 0.01,
      y + size * 0.2 + Math.sin(windPhase * 1.4 + side) * size * 0.008
    );
    ctx.quadraticCurveTo(
      cx + side * size * 0.01,
      y + size * 0.06 - bodyBob,
      cx,
      y - size * 0.06 - bodyBob
    );
    ctx.closePath();
    ctx.fill();
  }

  // Flowing razor-ribbon trails from waist — wind-animated silk with blade glints
  for (let rb = 0; rb < 6; rb++) {
    const rbSide = rb < 3 ? -1 : 1;
    const rbIdx = rb % 3;
    const rbBaseX = cx + rbSide * size * (0.06 + rbIdx * 0.04);
    const rbBaseY = y - size * 0.06 - bodyBob;
    const rbWind = Math.sin(windPhase * 1.5 + rb * 1.2) * size * 0.04;
    const rbLen = size * (0.14 + rbIdx * 0.04);
    const ribbonAlpha = 0.6 + Math.sin(time * 2 + rb) * 0.2;
    ctx.strokeStyle =
      rb % 2 === 0
        ? `rgba(180, 20, 60, ${ribbonAlpha})`
        : `rgba(212, 175, 55, ${ribbonAlpha * 0.8})`;
    ctx.lineWidth = (1.5 - rbIdx * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rbBaseX, rbBaseY);
    ctx.quadraticCurveTo(
      rbBaseX + rbWind * 0.6 + rbSide * size * 0.03,
      rbBaseY + rbLen * 0.5,
      rbBaseX + rbWind + rbSide * size * 0.01,
      rbBaseY + rbLen
    );
    ctx.stroke();
    ctx.lineCap = "butt";
    if (rb % 3 === 0) {
      const bladeGlint = 0.3 + Math.sin(time * 5 + rb * 2.3) * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${bladeGlint})`;
      ctx.beginPath();
      ctx.arc(
        rbBaseX + rbWind + rbSide * size * 0.01,
        rbBaseY + rbLen,
        size * 0.003,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  // Chainmail visible at side splits
  for (const side of [-1, 1]) {
    const mailX = cx + side * size * 0.1;
    const mailY = y - size * 0.02 - bodyBob;
    ctx.fillStyle = "rgba(120, 120, 130, 0.4)";
    for (let mr = 0; mr < 3; mr++) {
      for (let mc = 0; mc < 2; mc++) {
        ctx.beginPath();
        ctx.arc(
          mailX + mc * size * 0.012 * side,
          mailY + mr * size * 0.012,
          size * 0.004,
          0,
          TAU
        );
        ctx.fill();
      }
    }
  }

  // Silk battle kimono bodice — deep crimson with gold dragon embroidery, wider flowing robes
  const kimonoGrad = ctx.createLinearGradient(
    cx - size * 0.16,
    y - size * 0.34,
    cx + size * 0.16,
    y - size * 0.06
  );
  kimonoGrad.addColorStop(0, "#8b1a1a");
  kimonoGrad.addColorStop(0.25, "#a52020");
  kimonoGrad.addColorStop(0.5, "#b02828");
  kimonoGrad.addColorStop(0.75, "#a52020");
  kimonoGrad.addColorStop(1, "#8b1a1a");
  ctx.fillStyle = kimonoGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.15, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.19,
    y - size * 0.18 - bodyBob,
    cx - size * 0.14,
    y - size * 0.06 - bodyBob
  );
  ctx.lineTo(cx + size * 0.14, y - size * 0.06 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.19,
    y - size * 0.18 - bodyBob,
    cx + size * 0.15,
    y - size * 0.34 - bodyBob
  );
  ctx.closePath();
  ctx.fill();
  // Flowing fabric side panels — wind-animated drapes
  for (const side of [-1, 1]) {
    const panelWave = Math.sin(windPhase * 1.2 + side * 1.5) * size * 0.015;
    const panelGrad = ctx.createLinearGradient(
      cx + side * size * 0.14,
      y - size * 0.28,
      cx + side * size * 0.22,
      y - size * 0.04
    );
    panelGrad.addColorStop(0, "rgba(139, 26, 26, 0.7)");
    panelGrad.addColorStop(1, "rgba(90, 8, 8, 0.5)");
    ctx.fillStyle = panelGrad;
    ctx.beginPath();
    ctx.moveTo(cx + side * size * 0.14, y - size * 0.28 - bodyBob);
    ctx.quadraticCurveTo(
      cx + side * (size * 0.2 + panelWave * 2),
      y - size * 0.16 - bodyBob,
      cx + side * (size * 0.18 + panelWave * 3) + panelWave,
      y - size * 0.04 - bodyBob
    );
    ctx.lineTo(cx + side * size * 0.13, y - size * 0.06 - bodyBob);
    ctx.quadraticCurveTo(
      cx + side * size * 0.15,
      y - size * 0.18 - bodyBob,
      cx + side * size * 0.14,
      y - size * 0.28 - bodyBob
    );
    ctx.closePath();
    ctx.fill();
  }

  // Kimono cross-lapel (V-neck wrap)
  ctx.strokeStyle = "#d4a040";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.08, y - size * 0.33 - bodyBob);
  ctx.lineTo(cx, y - size * 0.14 - bodyBob);
  ctx.lineTo(cx + size * 0.08, y - size * 0.33 - bodyBob);
  ctx.stroke();

  // Gold dragon/phoenix embroidery swirl on kimono
  ctx.strokeStyle = `rgba(212, 160, 64, ${0.35 + bladePulse * 0.15})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.04, y - size * 0.28 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.02,
    y - size * 0.22 - bodyBob,
    cx - size * 0.01,
    y - size * 0.16 - bodyBob
  );
  ctx.quadraticCurveTo(
    cx + size * 0.05,
    y - size * 0.12 - bodyBob,
    cx + size * 0.02,
    y - size * 0.08 - bodyBob
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.04, y - size * 0.26 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.01,
    y - size * 0.2 - bodyBob,
    cx + size * 0.03,
    y - size * 0.14 - bodyBob
  );
  ctx.stroke();

  // Armored obi sash at waist — wide with layered steel plates
  const obiGrad = ctx.createLinearGradient(
    cx - size * 0.16,
    y - size * 0.1,
    cx + size * 0.16,
    y - size * 0.04
  );
  obiGrad.addColorStop(0, "#1a1a2e");
  obiGrad.addColorStop(0.3, "#2a2a4a");
  obiGrad.addColorStop(0.5, "#3a3a5a");
  obiGrad.addColorStop(0.7, "#2a2a4a");
  obiGrad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = obiGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.16, y - size * 0.1 - bodyBob);
  ctx.lineTo(cx + size * 0.16, y - size * 0.1 - bodyBob);
  ctx.lineTo(cx + size * 0.15, y - size * 0.04 - bodyBob);
  ctx.lineTo(cx - size * 0.15, y - size * 0.04 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Steel plate segments on obi
  ctx.strokeStyle = "rgba(160, 160, 180, 0.35)";
  ctx.lineWidth = 0.6 * zoom;
  for (let op = 0; op < 6; op++) {
    const opx = cx - size * 0.13 + op * size * 0.052;
    ctx.beginPath();
    ctx.moveTo(opx, y - size * 0.1 - bodyBob);
    ctx.lineTo(opx, y - size * 0.04 - bodyBob);
    ctx.stroke();
  }
  // Obi knot on back (visible slightly to side)
  ctx.fillStyle = "#d4a040";
  ctx.beginPath();
  ctx.ellipse(
    cx + size * 0.14,
    y - size * 0.07 - bodyBob,
    size * 0.025,
    size * 0.03,
    0.3,
    0,
    TAU
  );
  ctx.fill();

  // Bandaged forearms peek — wrapped hand guards
  for (const side of [-1, 1]) {
    const bx = cx + side * size * 0.16;
    const by = y - size * 0.2 - bodyBob;
    ctx.strokeStyle = "rgba(200, 180, 160, 0.5)";
    ctx.lineWidth = 0.8 * zoom;
    for (let bw = 0; bw < 3; bw++) {
      ctx.beginPath();
      ctx.moveTo(bx - size * 0.015, by + bw * size * 0.012);
      ctx.lineTo(bx + size * 0.015, by + bw * size * 0.012 + size * 0.005);
      ctx.stroke();
    }
  }

  // Origami crane pauldrons (folded steel with ribbon tassels)
  for (const side of [-1, 1]) {
    const px = cx + side * size * 0.13;
    const py = y - size * 0.34 - bodyBob;
    // Steel origami crane shape
    const craneGrad = ctx.createLinearGradient(
      px - size * 0.03,
      py,
      px + size * 0.03,
      py + size * 0.03
    );
    craneGrad.addColorStop(0, "#a0a0b0");
    craneGrad.addColorStop(0.5, "#d0d0e0");
    craneGrad.addColorStop(1, "#808090");
    ctx.fillStyle = craneGrad;
    ctx.beginPath();
    ctx.moveTo(px, py - size * 0.02);
    ctx.lineTo(px + side * size * 0.035, py + size * 0.005);
    ctx.lineTo(px + side * size * 0.025, py + size * 0.025);
    ctx.lineTo(px, py + size * 0.015);
    ctx.lineTo(px - side * size * 0.015, py + size * 0.025);
    ctx.lineTo(px - side * size * 0.025, py + size * 0.005);
    ctx.closePath();
    ctx.fill();
    // Crane fold line
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(px, py - size * 0.02);
    ctx.lineTo(px, py + size * 0.015);
    ctx.stroke();
    // Crane beak/head detail
    ctx.fillStyle = "#c0c0d0";
    ctx.beginPath();
    ctx.moveTo(px + side * size * 0.035, py + size * 0.005);
    ctx.lineTo(px + side * size * 0.045, py - size * 0.005);
    ctx.lineTo(px + side * size * 0.03, py);
    ctx.closePath();
    ctx.fill();
    // Ribbon tassels hanging from pauldron
    for (let t = 0; t < 2; t++) {
      const tx = px + side * size * (0.01 + t * 0.015);
      const tasselWave = Math.sin(windPhase + side * 2 + t) * size * 0.008;
      ctx.strokeStyle =
        t === 0 ? "rgba(180, 20, 60, 0.7)" : "rgba(212, 175, 55, 0.6)";
      ctx.lineWidth = 1 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, py + size * 0.025);
      ctx.quadraticCurveTo(
        tx + tasselWave,
        py + size * 0.055,
        tx + tasselWave * 1.3,
        py + size * 0.075
      );
      ctx.stroke();
      ctx.lineCap = "butt";
    }
  }

  // Left arm — war fan (tessen)
  const fanForeLen = 0.13;
  drawPathArm(
    ctx,
    cx - size * 0.18,
    y - size * 0.28 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: "#8b1a1a",
      colorDark: "#3a0808",
      elbowAngle: 0.4 + (isAttacking ? -attackIntensity * 0.15 : 0),
      foreLen: fanForeLen,
      handColor: "#e0c0b0",
      onWeapon: (wCtx) => {
        const handY = fanForeLen * size;
        wCtx.translate(0, handY * 0.4);
        wCtx.rotate(-0.35);
        wCtx.scale(-1, 1);

        const fanSpread = isAttacking
          ? 0.7 + attackIntensity * 0.5
          : 0.55 + Math.sin(time * 1.2) * 0.08;
        const fanRibs = 7;
        const fanR = size * 0.07;
        const fanCY = -size * 0.01;

        // Steel ribs of the war fan
        for (let r = 0; r < fanRibs; r++) {
          const ribAngle =
            -fanSpread + (r / (fanRibs - 1)) * fanSpread * 2 - Math.PI / 2;
          const ribEndX = Math.cos(ribAngle) * fanR;
          const ribEndY = fanCY + Math.sin(ribAngle) * fanR;
          wCtx.strokeStyle = "#8a8a9a";
          wCtx.lineWidth = 1.2 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(0, fanCY + size * 0.005);
          wCtx.lineTo(ribEndX, ribEndY);
          wCtx.stroke();

          // Razor edge glint on outer ribs
          if (r === 0 || r === fanRibs - 1) {
            const glint = 0.3 + Math.sin(time * 4 + r * 3) * 0.3;
            wCtx.fillStyle = `rgba(255, 255, 255, ${glint})`;
            wCtx.beginPath();
            wCtx.arc(ribEndX, ribEndY, size * 0.003, 0, TAU);
            wCtx.fill();
          }
        }

        // Silk panels between ribs with cherry blossom painting
        for (let p = 0; p < fanRibs - 1; p++) {
          const a1 =
            -fanSpread + (p / (fanRibs - 1)) * fanSpread * 2 - Math.PI / 2;
          const a2 =
            -fanSpread +
            ((p + 1) / (fanRibs - 1)) * fanSpread * 2 -
            Math.PI / 2;
          const panelAlpha = 0.75 + Math.sin(time + p * 0.8) * 0.1;
          wCtx.fillStyle =
            p % 2 === 0
              ? `rgba(180, 20, 50, ${panelAlpha})`
              : `rgba(200, 35, 65, ${panelAlpha})`;
          wCtx.beginPath();
          wCtx.moveTo(0, fanCY + size * 0.005);
          wCtx.lineTo(Math.cos(a1) * fanR, fanCY + Math.sin(a1) * fanR);
          wCtx.lineTo(Math.cos(a2) * fanR, fanCY + Math.sin(a2) * fanR);
          wCtx.closePath();
          wCtx.fill();
        }

        // Cherry blossom dots painted on fan surface
        setShadowBlur(wCtx, 3 * zoom, "#ff90b0");
        wCtx.fillStyle = `rgba(255, 180, 200, ${0.5 + bladePulse * 0.3})`;
        for (let b = 0; b < 4; b++) {
          const bAngle = -fanSpread * 0.6 + b * fanSpread * 0.4 - Math.PI / 2;
          const bDist = fanR * (0.45 + b * 0.08);
          wCtx.beginPath();
          wCtx.arc(
            Math.cos(bAngle) * bDist,
            fanCY + Math.sin(bAngle) * bDist,
            size * 0.004,
            0,
            TAU
          );
          wCtx.fill();
        }
        clearShadow(wCtx);

        // Fan pivot rivet
        wCtx.fillStyle = "#d4a040";
        wCtx.beginPath();
        wCtx.arc(0, fanCY + size * 0.005, size * 0.006, 0, TAU);
        wCtx.fill();

        // Energy arc from fan edge during attack
        if (isAttacking) {
          wCtx.strokeStyle = `rgba(255, 100, 150, ${attackIntensity * 0.5})`;
          wCtx.lineWidth = 1.5 * zoom;
          wCtx.beginPath();
          wCtx.arc(
            0,
            fanCY,
            fanR * 1.15,
            -fanSpread - Math.PI / 2,
            fanSpread - Math.PI / 2
          );
          wCtx.stroke();
        }
      },
      shoulderAngle:
        0.35 +
        Math.sin(time * 1.3) * 0.04 +
        (isAttacking ? -attackIntensity * 0.25 : 0),
      style: "fleshy",
      upperLen: 0.14,
      width: 0.042,
    }
  );

  // Right arm — ribbon glaive (naginata), angled outward
  const glaiveForeLen = 0.15;
  drawPathArm(
    ctx,
    cx + size * 0.18,
    y - size * 0.28 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: "#8b1a1a",
      colorDark: "#3a0808",
      elbowAngle: 0.2 + (isAttacking ? attackIntensity * 0.1 : 0),
      foreLen: glaiveForeLen,
      handColor: "#e0c0b0",
      onWeapon: (wCtx) => {
        const handY = glaiveForeLen * size;
        wCtx.translate(0, handY * 0.5);
        wCtx.rotate(-0.4);
        wCtx.scale(-1, 1);
        const shaftH = size * 0.52;

        // Lacquered naginata shaft — deep red-black
        const shaftGrad = wCtx.createLinearGradient(
          -size * 0.01,
          0,
          size * 0.01,
          0
        );
        shaftGrad.addColorStop(0, "#2a0808");
        shaftGrad.addColorStop(0.3, "#5a1818");
        shaftGrad.addColorStop(0.5, "#6a2020");
        shaftGrad.addColorStop(0.7, "#5a1818");
        shaftGrad.addColorStop(1, "#2a0808");
        wCtx.strokeStyle = shaftGrad;
        wCtx.lineWidth = 3.5 * zoom;
        wCtx.lineCap = "round";
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.07);
        wCtx.lineTo(0, -shaftH);
        wCtx.stroke();
        wCtx.lineCap = "butt";

        // Gold ring wrappings along shaft
        wCtx.strokeStyle = "#d4a040";
        wCtx.lineWidth = 1.2 * zoom;
        for (let wr = 0; wr < 8; wr++) {
          const wry = size * 0.04 - wr * shaftH * 0.12;
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.012, wry);
          wCtx.lineTo(size * 0.012, wry - size * 0.008);
          wCtx.stroke();
        }

        // Silk ribbon wraps on shaft below blade
        for (let sr = 0; sr < 3; sr++) {
          const srBaseY = -shaftH * 0.7 - sr * size * 0.02;
          const srWave = Math.sin(windPhase * 1.8 + sr * 1.6) * size * 0.035;
          const srLen = size * (0.06 + sr * 0.02);
          const srSide = sr % 2 === 0 ? -1 : 1;
          wCtx.strokeStyle =
            sr === 1 ? `rgba(212, 175, 55, 0.6)` : `rgba(180, 20, 60, 0.65)`;
          wCtx.lineWidth = 1.2 * zoom;
          wCtx.lineCap = "round";
          wCtx.beginPath();
          wCtx.moveTo(srSide * size * 0.01, srBaseY);
          wCtx.quadraticCurveTo(
            srSide * size * 0.02 + srWave,
            srBaseY - srLen * 0.5,
            srSide * size * 0.015 + srWave * 1.2,
            srBaseY - srLen
          );
          wCtx.stroke();
          wCtx.lineCap = "butt";
        }

        // Tsuba (hand guard) — ornate gold cross guard
        const tsubaY = -shaftH * 0.15;
        const tsubaGrad = wCtx.createLinearGradient(
          -size * 0.025,
          tsubaY,
          size * 0.025,
          tsubaY
        );
        tsubaGrad.addColorStop(0, "#8a6020");
        tsubaGrad.addColorStop(0.5, "#d4a040");
        tsubaGrad.addColorStop(1, "#8a6020");
        wCtx.fillStyle = tsubaGrad;
        wCtx.beginPath();
        wCtx.ellipse(0, tsubaY, size * 0.022, size * 0.006, 0, 0, TAU);
        wCtx.fill();

        // Butt spike
        wCtx.fillStyle = "#5a5a6a";
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.006, size * 0.06);
        wCtx.quadraticCurveTo(0, size * 0.09, size * 0.006, size * 0.06);
        wCtx.closePath();
        wCtx.fill();

        // Crescent glaive blade at top — glowing magenta energy
        const bladeY = -shaftH - size * 0.01;
        const bladeH = size * 0.1;
        const bladeW = size * 0.05;

        // Blade mounting collar
        const collarGrad = wCtx.createLinearGradient(
          -size * 0.015,
          -shaftH,
          size * 0.015,
          -shaftH
        );
        collarGrad.addColorStop(0, "#6a6a7a");
        collarGrad.addColorStop(0.5, "#b0b0c0");
        collarGrad.addColorStop(1, "#6a6a7a");
        wCtx.fillStyle = collarGrad;
        wCtx.fillRect(
          -size * 0.012,
          -shaftH - size * 0.008,
          size * 0.024,
          size * 0.016
        );

        // Crescent blade shape
        setShadowBlur(wCtx, 8 * zoom, "#ff40a0");
        const bladeGrad = wCtx.createLinearGradient(
          0,
          bladeY,
          0,
          bladeY - bladeH
        );
        bladeGrad.addColorStop(0, "#c0c0d0");
        bladeGrad.addColorStop(0.3, "#e8e8f0");
        bladeGrad.addColorStop(0.6, "#ff80c0");
        bladeGrad.addColorStop(1, "#ff40a0");
        wCtx.fillStyle = bladeGrad;
        wCtx.beginPath();
        wCtx.moveTo(0, bladeY);
        wCtx.quadraticCurveTo(
          -bladeW * 0.4,
          bladeY - bladeH * 0.3,
          -bladeW,
          bladeY - bladeH * 0.7
        );
        wCtx.quadraticCurveTo(
          -bladeW * 0.8,
          bladeY - bladeH * 1.1,
          0,
          bladeY - bladeH
        );
        wCtx.quadraticCurveTo(
          bladeW * 0.8,
          bladeY - bladeH * 1.1,
          bladeW,
          bladeY - bladeH * 0.7
        );
        wCtx.quadraticCurveTo(bladeW * 0.4, bladeY - bladeH * 0.3, 0, bladeY);
        wCtx.closePath();
        wCtx.fill();

        // Inner crescent cutout for crescent shape
        wCtx.fillStyle = `rgba(40, 5, 25, 0.6)`;
        wCtx.beginPath();
        wCtx.moveTo(0, bladeY - bladeH * 0.15);
        wCtx.quadraticCurveTo(
          -bladeW * 0.25,
          bladeY - bladeH * 0.4,
          -bladeW * 0.5,
          bladeY - bladeH * 0.65
        );
        wCtx.quadraticCurveTo(
          -bladeW * 0.3,
          bladeY - bladeH * 0.85,
          0,
          bladeY - bladeH * 0.75
        );
        wCtx.quadraticCurveTo(
          bladeW * 0.3,
          bladeY - bladeH * 0.85,
          bladeW * 0.5,
          bladeY - bladeH * 0.65
        );
        wCtx.quadraticCurveTo(
          bladeW * 0.25,
          bladeY - bladeH * 0.4,
          0,
          bladeY - bladeH * 0.15
        );
        wCtx.closePath();
        wCtx.fill();
        clearShadow(wCtx);

        // Blade edge highlight
        wCtx.strokeStyle = `rgba(255, 200, 230, ${0.3 + bladePulse * 0.3})`;
        wCtx.lineWidth = 0.6 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(-bladeW, bladeY - bladeH * 0.7);
        wCtx.quadraticCurveTo(
          -bladeW * 0.8,
          bladeY - bladeH * 1.1,
          0,
          bladeY - bladeH
        );
        wCtx.quadraticCurveTo(
          bladeW * 0.8,
          bladeY - bladeH * 1.1,
          bladeW,
          bladeY - bladeH * 0.7
        );
        wCtx.stroke();

        // Magenta energy glow at blade tip
        setShadowBlur(wCtx, 6 * zoom, "#ff40a0");
        wCtx.fillStyle = `rgba(255, 64, 160, ${bladePulse * 0.5})`;
        wCtx.beginPath();
        wCtx.arc(0, bladeY - bladeH, size * 0.005, 0, TAU);
        wCtx.fill();
        clearShadow(wCtx);

        // Orbiting energy sparks around blade
        for (let s = 0; s < 3; s++) {
          const sAngle = time * 3.5 + (s * TAU) / 3;
          const sR = size * 0.04;
          wCtx.fillStyle = `rgba(255, 100, 180, ${bladePulse * 0.5})`;
          wCtx.beginPath();
          wCtx.arc(
            Math.cos(sAngle) * sR,
            bladeY - bladeH * 0.5 + Math.sin(sAngle) * sR * 0.6,
            size * 0.003,
            0,
            TAU
          );
          wCtx.fill();
        }
      },
      shoulderAngle:
        0.45 +
        (isAttacking ? attackIntensity * 0.15 : 0) +
        Math.sin(time * 1.5) * 0.03,
      style: "fleshy",
      upperLen: 0.15,
      width: 0.042,
    }
  );

  // Head — dramatic kabuki theatrical headdress
  const headX = cx;
  const headY = y - size * 0.46 - bodyBob;

  // Flowing silk veils from headdress sides (drawn behind head)
  for (const side of [-1, 1]) {
    const veilX = headX + side * size * 0.08;
    const veilY = headY - size * 0.06;
    const veilWind = Math.sin(windPhase * 1.2 + side * 2) * size * 0.03;
    const veilLen = size * 0.22;
    const veilGrad = ctx.createLinearGradient(
      veilX,
      veilY,
      veilX + veilWind,
      veilY + veilLen
    );
    veilGrad.addColorStop(0, "rgba(180, 20, 50, 0.6)");
    veilGrad.addColorStop(0.5, "rgba(139, 26, 26, 0.4)");
    veilGrad.addColorStop(1, "rgba(90, 8, 8, 0.15)");
    ctx.fillStyle = veilGrad;
    ctx.beginPath();
    ctx.moveTo(veilX, veilY);
    ctx.quadraticCurveTo(
      veilX + side * size * 0.06 + veilWind * 0.4,
      veilY + veilLen * 0.3,
      veilX + side * size * 0.04 + veilWind,
      veilY + veilLen * 0.65
    );
    ctx.quadraticCurveTo(
      veilX + side * size * 0.02 + veilWind * 1.3,
      veilY + veilLen * 0.85,
      veilX + veilWind * 1.5,
      veilY + veilLen
    );
    ctx.lineTo(veilX - side * size * 0.02, veilY + veilLen * 0.9);
    ctx.quadraticCurveTo(
      veilX - side * size * 0.01,
      veilY + veilLen * 0.5,
      veilX,
      veilY
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(212, 175, 55, ${0.3 + Math.sin(windPhase + side) * 0.1})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(veilX, veilY);
    ctx.quadraticCurveTo(
      veilX + side * size * 0.06 + veilWind * 0.4,
      veilY + veilLen * 0.3,
      veilX + side * size * 0.04 + veilWind,
      veilY + veilLen * 0.65
    );
    ctx.stroke();
  }

  // Short swept-back hair at sides
  ctx.fillStyle = "#1a0a12";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.08, headY - size * 0.04);
    ctx.quadraticCurveTo(
      headX + side * size * 0.11,
      headY + size * 0.02,
      headX + side * size * 0.07,
      headY + size * 0.06
    );
    ctx.quadraticCurveTo(
      headX + side * size * 0.04,
      headY + size * 0.03,
      headX + side * size * 0.02,
      headY - size * 0.06
    );
    ctx.closePath();
    ctx.fill();
  }

  // Face
  const faceGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.01,
    0,
    headX,
    headY,
    size * 0.11
  );
  faceGrad.addColorStop(0, "#f0d8c8");
  faceGrad.addColorStop(0.7, "#d8b8a0");
  faceGrad.addColorStop(1, "#c0a088");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.11, 0, TAU);
  ctx.fill();

  // Eyes — fierce, focused
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(
      headX + side * size * 0.035,
      headY - size * 0.015,
      size * 0.018,
      size * 0.012,
      side * 0.1,
      0,
      TAU
    );
    ctx.fill();
    ctx.fillStyle = "#2a0a0a";
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.035,
      headY - size * 0.015,
      size * 0.009,
      0,
      TAU
    );
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.035,
      headY - size * 0.015,
      size * 0.004,
      0,
      TAU
    );
    ctx.fill();
    // Sharp eyeliner flick
    ctx.strokeStyle = "#1a0a12";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.05, headY - size * 0.02);
    ctx.lineTo(headX + side * size * 0.058, headY - size * 0.028);
    ctx.stroke();
  }

  // Red war paint markings under eyes — two stripes per side
  ctx.fillStyle = "rgba(180, 20, 40, 0.7)";
  for (const side of [-1, 1]) {
    for (let wm = 0; wm < 2; wm++) {
      ctx.beginPath();
      ctx.moveTo(
        headX + side * size * 0.02,
        headY + size * 0.005 + wm * size * 0.012
      );
      ctx.lineTo(
        headX + side * size * 0.055,
        headY + size * 0.015 + wm * size * 0.012
      );
      ctx.lineTo(
        headX + side * size * 0.055,
        headY + size * 0.01 + wm * size * 0.012
      );
      ctx.lineTo(headX + side * size * 0.02, headY + wm * size * 0.012);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Lips — subtle, determined
  ctx.fillStyle = "#a05060";
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY + size * 0.04,
    size * 0.016,
    size * 0.006,
    0,
    0,
    TAU
  );
  ctx.fill();

  // Dramatic kabuki theatrical headdress
  const crownBaseY = headY - size * 0.1;
  const crownH = size * 0.24;
  // Crown base band — ornate gold band across forehead
  const crownBandGrad = ctx.createLinearGradient(
    headX - size * 0.14,
    crownBaseY,
    headX + size * 0.14,
    crownBaseY
  );
  crownBandGrad.addColorStop(0, "#8a6020");
  crownBandGrad.addColorStop(0.2, "#d4a040");
  crownBandGrad.addColorStop(0.5, "#f0c850");
  crownBandGrad.addColorStop(0.8, "#d4a040");
  crownBandGrad.addColorStop(1, "#8a6020");
  ctx.fillStyle = crownBandGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.13, crownBaseY + size * 0.015);
  ctx.quadraticCurveTo(
    headX - size * 0.14,
    crownBaseY - size * 0.01,
    headX - size * 0.12,
    crownBaseY - size * 0.02
  );
  ctx.lineTo(headX + size * 0.12, crownBaseY - size * 0.02);
  ctx.quadraticCurveTo(
    headX + size * 0.14,
    crownBaseY - size * 0.01,
    headX + size * 0.13,
    crownBaseY + size * 0.015
  );
  ctx.closePath();
  ctx.fill();
  // Crown body — rising crimson and gold structure
  const crownGrad = ctx.createLinearGradient(
    headX,
    crownBaseY,
    headX,
    crownBaseY - crownH
  );
  crownGrad.addColorStop(0, "#8b1a1a");
  crownGrad.addColorStop(0.3, "#a52020");
  crownGrad.addColorStop(0.6, "#b02828");
  crownGrad.addColorStop(1, "#6b1010");
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, crownBaseY - size * 0.02);
  ctx.quadraticCurveTo(
    headX - size * 0.12,
    crownBaseY - crownH * 0.4,
    headX - size * 0.06,
    crownBaseY - crownH * 0.75
  );
  ctx.lineTo(headX - size * 0.03, crownBaseY - crownH);
  ctx.lineTo(headX + size * 0.03, crownBaseY - crownH);
  ctx.lineTo(headX + size * 0.06, crownBaseY - crownH * 0.75);
  ctx.quadraticCurveTo(
    headX + size * 0.12,
    crownBaseY - crownH * 0.4,
    headX + size * 0.1,
    crownBaseY - size * 0.02
  );
  ctx.closePath();
  ctx.fill();
  // Radiating golden spokes from crown
  for (let sp = 0; sp < 7; sp++) {
    const spokeAngle = -Math.PI * 0.85 + (sp / 6) * Math.PI * 0.7;
    const spokeLen = size * (0.12 + (sp === 3 ? 0.06 : 0));
    const spokeBaseX = headX + Math.cos(spokeAngle) * size * 0.04;
    const spokeBaseY = crownBaseY - crownH * 0.65;
    const spokeTipX = spokeBaseX + Math.cos(spokeAngle) * spokeLen;
    const spokeTipY = spokeBaseY + Math.sin(spokeAngle) * spokeLen;
    const spokeGlow = 0.6 + Math.sin(time * 2.5 + sp * 0.8) * 0.2;
    ctx.strokeStyle = `rgba(212, 175, 55, ${spokeGlow})`;
    ctx.lineWidth = (1.8 - Math.abs(sp - 3) * 0.15) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(spokeBaseX, spokeBaseY);
    ctx.lineTo(spokeTipX, spokeTipY);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.fillStyle =
      sp % 2 === 0
        ? `rgba(255, 64, 160, ${spokeGlow})`
        : `rgba(212, 175, 55, ${spokeGlow})`;
    ctx.beginPath();
    ctx.arc(spokeTipX, spokeTipY, size * 0.004, 0, TAU);
    ctx.fill();
  }
  // Gold filigree arcs on crown surface
  ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 + bladePulse * 0.15})`;
  ctx.lineWidth = 0.7 * zoom;
  for (let fl = 0; fl < 3; fl++) {
    const flY = crownBaseY - crownH * (0.2 + fl * 0.22);
    const flW = size * (0.08 - fl * 0.015);
    ctx.beginPath();
    ctx.moveTo(headX - flW, flY);
    ctx.quadraticCurveTo(headX, flY - size * 0.015, headX + flW, flY);
    ctx.stroke();
  }
  // Crescent moon at crown apex
  const moonY = crownBaseY - crownH - size * 0.02;
  setShadowBlur(ctx, 8 * zoom, "#c0c0ff");
  ctx.fillStyle = "#e0e0f0";
  ctx.beginPath();
  ctx.arc(headX, moonY, size * 0.028, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#1a0a12";
  ctx.beginPath();
  ctx.arc(headX + size * 0.013, moonY - size * 0.006, size * 0.021, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  // Crescent horn tips extending upward
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#d0d0e0";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.018, moonY - size * 0.024);
    ctx.quadraticCurveTo(
      headX + side * size * 0.045,
      moonY - size * 0.05,
      headX + side * size * 0.04,
      moonY - size * 0.06
    );
    ctx.lineTo(headX + side * size * 0.03, moonY - size * 0.042);
    ctx.closePath();
    ctx.fill();
  }
  // Embedded jewels on crown — ruby and gold
  const jewelData = [
    { color: "#ff2060", dx: -0.05, frac: 0.35 },
    { color: "#ff2060", dx: 0.05, frac: 0.35 },
    { color: "#d4a040", dx: 0, frac: 0.6 },
    { color: "#ff60a0", dx: -0.03, frac: 0.8 },
    { color: "#ff60a0", dx: 0.03, frac: 0.8 },
  ];
  for (const jw of jewelData) {
    const jwX = headX + jw.dx * size;
    const jwY = crownBaseY - crownH * jw.frac;
    setShadowBlur(ctx, 3 * zoom, jw.color);
    ctx.fillStyle = jw.color;
    ctx.beginPath();
    ctx.arc(jwX, jwY, size * 0.005, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }
  // Wide dramatic side wings with feather tips
  for (const side of [-1, 1]) {
    const wingGrad = ctx.createLinearGradient(
      headX + side * size * 0.1,
      crownBaseY,
      headX + side * size * 0.2,
      crownBaseY - crownH * 0.5
    );
    wingGrad.addColorStop(0, "#8a6020");
    wingGrad.addColorStop(0.5, "#d4a040");
    wingGrad.addColorStop(1, "#f0c850");
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.1, crownBaseY - size * 0.01);
    ctx.quadraticCurveTo(
      headX + side * size * 0.18,
      crownBaseY - crownH * 0.3,
      headX + side * size * 0.2,
      crownBaseY - crownH * 0.55
    );
    ctx.lineTo(headX + side * size * 0.17, crownBaseY - crownH * 0.45);
    ctx.quadraticCurveTo(
      headX + side * size * 0.14,
      crownBaseY - crownH * 0.2,
      headX + side * size * 0.1,
      crownBaseY - size * 0.01
    );
    ctx.closePath();
    ctx.fill();
    for (let ft = 0; ft < 3; ft++) {
      const ftBaseX = headX + side * size * (0.15 + ft * 0.015);
      const ftBaseY = crownBaseY - crownH * (0.3 + ft * 0.08);
      const ftWind = Math.sin(windPhase * 1.5 + ft + side * 2) * size * 0.008;
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.5 + Math.sin(time * 2 + ft) * 0.2})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ftBaseX, ftBaseY);
      ctx.quadraticCurveTo(
        ftBaseX + side * size * 0.02 + ftWind,
        ftBaseY - size * 0.03,
        ftBaseX + side * size * 0.025 + ftWind * 1.5,
        ftBaseY - size * 0.05
      );
      ctx.stroke();
      ctx.lineCap = "butt";
    }
  }

  // Spinning ribbon trails orbiting the dancer (replacing hex runes)
  for (let rt = 0; rt < 4; rt++) {
    const rtAngle = time * 1.2 + (rt * TAU) / 4;
    const rtDist = size * 0.33;
    const rtx = cx + Math.cos(rtAngle) * rtDist;
    const rty = y - size * 0.15 + Math.sin(rtAngle) * rtDist * 0.4 - bodyBob;
    const rtLen = size * 0.04;
    const rtTail = Math.sin(time * 3 + rt * 1.7) * size * 0.015;
    ctx.strokeStyle = `rgba(255, 100, 160, ${bladePulse * 0.45})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rtx, rty);
    ctx.quadraticCurveTo(
      rtx + rtTail,
      rty - rtLen * 0.5,
      rtx + rtTail * 1.5,
      rty - rtLen
    );
    ctx.stroke();
    ctx.lineCap = "butt";
    // Small petal at ribbon end
    ctx.fillStyle = `rgba(255, 183, 197, ${bladePulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(rtx + rtTail * 1.5, rty - rtLen, size * 0.004, 0, TAU);
    ctx.fill();
  }

  drawArcaneSparkles(ctx, cx, y - size * 0.2, size, time, zoom, {
    color: accent,
    count: 5,
    sparkleSize: 0.012,
  });

  // Attack burst — magenta rings with petal explosions
  if (isAttacking) {
    ctx.strokeStyle = `rgba(255, 64, 160, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let r = 0; r < 3; r++) {
      const ringR = size * (0.12 + r * 0.08) * (1 - attackIntensity * 0.2);
      ctx.beginPath();
      ctx.arc(cx, y - size * 0.35, ringR, 0, TAU);
      ctx.stroke();
    }
    // Petal burst particles during attack
    for (let pb = 0; pb < 6; pb++) {
      const pbAngle = time * 4 + (pb * TAU) / 6;
      const pbDist = size * 0.2 * attackIntensity;
      const pbx = cx + Math.cos(pbAngle) * pbDist;
      const pby = y - size * 0.35 + Math.sin(pbAngle) * pbDist * 0.5;
      ctx.fillStyle = `rgba(255, 150, 190, ${attackIntensity * 0.5})`;
      ctx.save();
      ctx.translate(pbx, pby);
      ctx.rotate(pbAngle + time * 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.007, size * 0.004, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  drawRegionBodyAccent(ctx, cx, y - bodyBob, size, region, time, zoom);
  drawRegionWeaponAccent(ctx, cx, y - size * 0.35, size, region, time, zoom);
}
