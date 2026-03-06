import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
} from "./troopHelpers";

export function drawArmoredTroop(
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
  const stance = Math.sin(time * 2.8) * 1.1;
  const breathe = Math.sin(time * 2.05) * 0.45;
  const capeWave = Math.sin(time * 3.2) * 0.8;
  const shimmer = 0.62 + Math.sin(time * 5.2) * 0.38;
  const steelPulse = 0.56 + Math.sin(time * 4.4) * 0.3;
  const heraldicColor = color || "#ff6a2a";

  const isAttacking = attackPhase > 0;
  const maceSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 2.25
    : 0;
  const bodyLean = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.2
    : Math.sin(time * 1.6) * 0.03;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // Knight-like cape shell.
  const capeOuter = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.18,
    x + size * 0.12,
    y + size * 0.54,
  );
  capeOuter.addColorStop(0, "#13243a");
  capeOuter.addColorStop(0.55, "#0f1d30");
  capeOuter.addColorStop(1, "#0a1627");
  ctx.fillStyle = capeOuter;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.13 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.29 + capeWave * 4,
    y + size * 0.2,
    x - size * 0.2 + capeWave * 5,
    y + size * 0.52,
  );
  ctx.lineTo(x + size * 0.13 + capeWave * 2.2, y + size * 0.47);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.14,
    x + size * 0.13,
    y - size * 0.1 + breathe,
  );
  ctx.closePath();
  ctx.fill();

  const capeInner = ctx.createLinearGradient(
    x - size * 0.18,
    y - size * 0.08,
    x + size * 0.08,
    y + size * 0.44,
  );
  capeInner.addColorStop(0, "#7a2a14");
  capeInner.addColorStop(0.45, "#aa3a18");
  capeInner.addColorStop(1, "#6b2412");
  ctx.fillStyle = capeInner;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.11 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.2 + capeWave * 3.2,
    y + size * 0.15,
    x - size * 0.14 + capeWave * 3.8,
    y + size * 0.39,
  );
  ctx.lineTo(x + size * 0.09 + capeWave * 1.8, y + size * 0.35);
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y + size * 0.1,
    x + size * 0.09,
    y - size * 0.09 + breathe,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(233, 173, 84, ${0.35 + shimmer * 0.3})`;
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.13 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.29 + capeWave * 4,
    y + size * 0.2,
    x - size * 0.2 + capeWave * 5,
    y + size * 0.52,
  );
  ctx.stroke();

  // Legs and sabatons.
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.09, y + size * 0.3);
    ctx.rotate(side * (-0.09 + stance * 0.02));
    const greaveGrad = ctx.createLinearGradient(
      -size * 0.06,
      0,
      size * 0.06,
      0,
    );
    greaveGrad.addColorStop(0, "#394a5f");
    greaveGrad.addColorStop(0.5, "#7f97b2");
    greaveGrad.addColorStop(1, "#34465c");
    ctx.fillStyle = greaveGrad;
    ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.24);
    ctx.fillStyle = "#8ea7c4";
    ctx.fillRect(-size * 0.062, size * 0.09, size * 0.124, size * 0.05);
    ctx.fillStyle = "rgba(203, 168, 108, 0.7)";
    ctx.fillRect(-size * 0.058, size * 0.107, size * 0.116, size * 0.018);
    ctx.fillStyle = "#2a3447";
    ctx.beginPath();
    ctx.moveTo(-size * 0.07, size * 0.2);
    ctx.lineTo(size * 0.07, size * 0.2);
    ctx.lineTo(size * 0.08, size * 0.285);
    ctx.lineTo(-size * 0.08, size * 0.285);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Chainmail fauld and belt.
  ctx.fillStyle = "#566a83";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.17,
    y + size * 0.22 + breathe,
    size * 0.34,
    size * 0.1,
    size * 0.02,
  );
  ctx.fill();
  ctx.strokeStyle = "rgba(205, 226, 246, 0.33)";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 3; row++) {
    const ly = y + size * (0.245 + row * 0.028) + breathe;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.152, ly);
    ctx.lineTo(x + size * 0.152, ly);
    ctx.stroke();
  }

  // Core cuirass with knight-like ribbing.
  const cuirassGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.14,
    x + size * 0.22,
    y + size * 0.32,
  );
  cuirassGrad.addColorStop(0, "#3e5167");
  cuirassGrad.addColorStop(0.24, "#7d98b5");
  cuirassGrad.addColorStop(0.5, "#a3bdd6");
  cuirassGrad.addColorStop(0.76, "#6f8da9");
  cuirassGrad.addColorStop(1, "#33475d");
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.205, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.225, y - size * 0.1 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.22 + breathe * 0.35,
    x + size * 0.225,
    y - size * 0.1 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.205, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(215, 233, 250, 0.42)";
  ctx.lineWidth = 1.35 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.19 + breathe);
  ctx.stroke();

  // Knight tabard over armor (red/orange heraldry).
  const tabardGrad = ctx.createLinearGradient(
    x - size * 0.1,
    y - size * 0.02,
    x + size * 0.1,
    y + size * 0.27,
  );
  tabardGrad.addColorStop(0, "#922f16");
  tabardGrad.addColorStop(0.5, heraldicColor);
  tabardGrad.addColorStop(1, "#7b2514");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.005 + breathe * 0.5);
  ctx.lineTo(x - size * 0.07, y + size * 0.24 + breathe);
  ctx.lineTo(x, y + size * 0.3 + breathe);
  ctx.lineTo(x + size * 0.07, y + size * 0.24 + breathe);
  ctx.lineTo(x + size * 0.09, y - size * 0.005 + breathe * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(240, 196, 112, 0.72)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.075, y + size * 0.03 + breathe * 0.6);
  ctx.lineTo(x + size * 0.075, y + size * 0.03 + breathe * 0.6);
  ctx.moveTo(x, y + size * 0.03 + breathe * 0.6);
  ctx.lineTo(x, y + size * 0.22 + breathe);
  ctx.stroke();

  // Belt and buckle.
  ctx.fillStyle = "#253142";
  ctx.fillRect(
    x - size * 0.19,
    y + size * 0.252 + breathe,
    size * 0.38,
    size * 0.058,
  );
  ctx.fillStyle = `rgba(186, 61, 45, ${0.54 + steelPulse * 0.22})`;
  ctx.fillRect(
    x - size * 0.175,
    y + size * 0.262 + breathe,
    size * 0.35,
    size * 0.017,
  );
  ctx.fillStyle = "#c8a567";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.048,
    y + size * 0.255 + breathe,
    size * 0.096,
    size * 0.051,
    size * 0.01,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(255, 225, 162, ${0.35 + shimmer * 0.25})`;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.02,
    y + size * 0.268 + breathe,
    size * 0.022,
    size * 0.022,
    size * 0.004,
  );
  ctx.fill();

  // Pauldrons with knight motif.
  for (let side = -1; side <= 1; side += 2) {
    const pauldronGrad = ctx.createLinearGradient(
      x + side * size * 0.31,
      y - size * 0.13,
      x + side * size * 0.16,
      y + size * 0.04,
    );
    pauldronGrad.addColorStop(0, "#627f9d");
    pauldronGrad.addColorStop(0.45, "#8eabc9");
    pauldronGrad.addColorStop(1, "#506983");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(
      x + side * size * 0.245,
      y - size * 0.055 + breathe * 0.5,
      size * 0.115,
      size * 0.082,
      side * 0.28,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(227, 202, 144, 0.75)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();
  }

  // Left arm and heraldic kite shield.
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.02 + breathe * 0.45);
  ctx.rotate(-0.24 + stance * 0.01);
  ctx.fillStyle = "#617f9e";
  ctx.fillRect(-size * 0.056, 0, size * 0.112, size * 0.215);
  ctx.fillStyle = "#86a7c4";
  ctx.fillRect(-size * 0.06, size * 0.148, size * 0.12, size * 0.076);
  ctx.fillStyle = "#b94935";
  ctx.fillRect(-size * 0.055, size * 0.168, size * 0.11, size * 0.02);
  ctx.restore();

  ctx.save();
  ctx.translate(x - size * 0.39, y + size * 0.075 + breathe * 0.55);
  ctx.rotate(-0.36 + stance * 0.02);
  const shieldGrad = ctx.createLinearGradient(
    -size * 0.09,
    -size * 0.2,
    size * 0.09,
    size * 0.16,
  );
  shieldGrad.addColorStop(0, "#2f4359");
  shieldGrad.addColorStop(0.52, "#5a7898");
  shieldGrad.addColorStop(1, "#2d4158");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.22);
  ctx.lineTo(-size * 0.13, -size * 0.12);
  ctx.lineTo(-size * 0.102, size * 0.16);
  ctx.lineTo(0, size * 0.22);
  ctx.lineTo(size * 0.102, size * 0.16);
  ctx.lineTo(size * 0.13, -size * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(229, 205, 148, 0.78)";
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.17);
  ctx.lineTo(0, size * 0.16);
  ctx.moveTo(-size * 0.056, -size * 0.012);
  ctx.lineTo(size * 0.056, -size * 0.012);
  ctx.stroke();
  ctx.fillStyle = `rgba(201, 74, 52, ${0.64 + steelPulse * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.18);
  ctx.lineTo(-size * 0.042, -size * 0.09);
  ctx.lineTo(0, -size * 0.015);
  ctx.lineTo(size * 0.042, -size * 0.09);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255, 196, 111, ${0.32 + shimmer * 0.24})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.035, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm and upgraded mace (drawn in single context so mace stays attached).
  ctx.save();
  const armBaseAngle = isAttacking
    ? -1.2 + attackPhase * 2.65
    : 0.19 + stance * 0.03;
  const armX = x + size * 0.31 + (isAttacking ? maceSwing * size * 0.08 : 0);
  const armY = y + size * 0.02 + breathe * 0.45;
  const armAngle = resolveWeaponRotation(
    targetPos,
    armX,
    armY,
    armBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.05 : 0.58,
    WEAPON_LIMITS.rightArm,
  );
  ctx.translate(armX, armY);
  ctx.rotate(armAngle);

  ctx.fillStyle = "#617f9e";
  ctx.fillRect(-size * 0.056, 0, size * 0.112, size * 0.225);
  ctx.fillStyle = "#86a7c4";
  ctx.fillRect(-size * 0.06, size * 0.162, size * 0.12, size * 0.08);

  const maceWristAngle = isAttacking
    ? -0.12 + attackPhase * 0.3
    : -0.08 + stance * 0.01;
  ctx.translate(0, size * 0.21);
  ctx.rotate(maceWristAngle);

  const shaftGrad = ctx.createLinearGradient(
    -size * 0.022,
    -size * 0.56,
    size * 0.022,
    0.2 * size,
  );
  shaftGrad.addColorStop(0, "#2f2215");
  shaftGrad.addColorStop(0.5, "#5a4331");
  shaftGrad.addColorStop(1, "#271b11");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.023, -size * 0.56, size * 0.046, size * 0.76);
  ctx.strokeStyle = "#2a1d12";
  ctx.lineWidth = 1 * zoom;
  for (let wrap = 0; wrap < 7; wrap++) {
    const wy = -size * 0.14 + wrap * size * 0.054;
    ctx.beginPath();
    ctx.moveTo(-size * 0.023, wy);
    ctx.lineTo(size * 0.023, wy + size * 0.02);
    ctx.stroke();
  }

  ctx.fillStyle = "#c8aa73";
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.032,
    -size * 0.52,
    size * 0.064,
    size * 0.024,
    size * 0.007,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  const maceHeadGrad = ctx.createRadialGradient(
    0,
    -size * 0.64,
    size * 0.016,
    0,
    -size * 0.64,
    size * 0.1,
  );
  maceHeadGrad.addColorStop(0, "#e5ecf8");
  maceHeadGrad.addColorStop(0.45, "#a7bad6");
  maceHeadGrad.addColorStop(1, "#5f7491");
  ctx.fillStyle = maceHeadGrad;
  ctx.beginPath();
  ctx.arc(0, -size * 0.64, size * 0.087, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#9db2d0";
  for (let spike = 0; spike < 8; spike++) {
    const a = (spike / 8) * Math.PI * 2;
    const innerX = Math.cos(a) * size * 0.048;
    const innerY = -size * 0.64 + Math.sin(a) * size * 0.048;
    const outerX = Math.cos(a) * size * 0.114;
    const outerY = -size * 0.64 + Math.sin(a) * size * 0.114;
    const wingAX = Math.cos(a + 0.17) * size * 0.07;
    const wingAY = -size * 0.64 + Math.sin(a + 0.17) * size * 0.07;
    const wingBX = Math.cos(a - 0.17) * size * 0.07;
    const wingBY = -size * 0.64 + Math.sin(a - 0.17) * size * 0.07;
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(wingAX, wingAY);
    ctx.lineTo(outerX, outerY);
    ctx.lineTo(wingBX, wingBY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = `rgba(255, 165, 96, ${0.3 + shimmer * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.64, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  if (isAttacking && Math.abs(maceSwing) > 0.32) {
    ctx.strokeStyle = `rgba(188, 224, 255, ${Math.abs(maceSwing) * 0.48})`;
    ctx.lineWidth = 3.3 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.64,
      size * 0.24,
      -Math.PI * 0.54,
      -Math.PI * 0.54 + maceSwing * 0.84,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Greathelm inspired by knight line.
  const gorgetGrad = ctx.createLinearGradient(
    x - size * 0.09,
    y - size * 0.15,
    x + size * 0.09,
    y - size * 0.15,
  );
  gorgetGrad.addColorStop(0, "#4a5d76");
  gorgetGrad.addColorStop(0.5, "#6f88a3");
  gorgetGrad.addColorStop(1, "#465970");
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.085 + breathe);
  ctx.lineTo(x - size * 0.11, y - size * 0.165 + breathe);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.192,
    x + size * 0.11,
    y - size * 0.165 + breathe,
  );
  ctx.lineTo(x + size * 0.09, y - size * 0.085 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(213, 185, 126, 0.7)";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  const helmGrad = ctx.createLinearGradient(
    x - size * 0.16,
    y - size * 0.44 + breathe * 0.25,
    x + size * 0.16,
    y - size * 0.18 + breathe * 0.25,
  );
  helmGrad.addColorStop(0, "#5e7894");
  helmGrad.addColorStop(0.45, "#9ab6d3");
  helmGrad.addColorStop(1, "#4b627c");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.34 + breathe * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.16,
    y - size * 0.45 + breathe * 0.1,
    x,
    y - size * 0.47 + breathe * 0.1,
  );
  ctx.quadraticCurveTo(
    x + size * 0.16,
    y - size * 0.45 + breathe * 0.1,
    x + size * 0.14,
    y - size * 0.34 + breathe * 0.2,
  );
  ctx.lineTo(x + size * 0.125, y - size * 0.2 + breathe * 0.2);
  ctx.lineTo(x - size * 0.125, y - size * 0.2 + breathe * 0.2);
  ctx.closePath();
  ctx.fill();

  // Visor slit and vents.
  ctx.fillStyle = "#111a27";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.102,
    y - size * 0.33 + breathe * 0.2,
    size * 0.204,
    size * 0.045,
    size * 0.012,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(184, 232, 255, ${0.5 + shimmer * 0.32})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.044,
    y - size * 0.307 + breathe * 0.2,
    size * 0.014,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.044,
    y - size * 0.307 + breathe * 0.2,
    size * 0.014,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#243247";
  for (let vent = -1; vent <= 1; vent++) {
    ctx.beginPath();
    ctx.arc(
      x + vent * size * 0.03,
      y - size * 0.245 + breathe * 0.2,
      size * 0.007,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Nasal, cheek plates, and crest.
  ctx.fillStyle = "#6f88a6";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.016,
    y - size * 0.37 + breathe * 0.2,
    size * 0.032,
    size * 0.14,
    size * 0.007,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.115, y - size * 0.33 + breathe * 0.2);
  ctx.lineTo(x - size * 0.14, y - size * 0.25 + breathe * 0.2);
  ctx.lineTo(x - size * 0.08, y - size * 0.2 + breathe * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.115, y - size * 0.33 + breathe * 0.2);
  ctx.lineTo(x + size * 0.14, y - size * 0.25 + breathe * 0.2);
  ctx.lineTo(x + size * 0.08, y - size * 0.2 + breathe * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d5b775";
  for (let rivet = 0; rivet < 3; rivet++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.08 + rivet * size * 0.08,
      y - size * 0.355 + breathe * 0.2,
      size * 0.008,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  const plumeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.56,
    x + size * 0.22,
    y - size * 0.36,
  );
  plumeGrad.addColorStop(0, "#ff7a14");
  plumeGrad.addColorStop(0.45, "#ff5812");
  plumeGrad.addColorStop(1, "#c13b0f");
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.47 + breathe * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.17 + capeWave * 1.5,
    y - size * 0.56,
    x + size * 0.24 + capeWave * 2.2,
    y - size * 0.39 + breathe * 0.15,
  );
  ctx.quadraticCurveTo(
    x + size * 0.11,
    y - size * 0.35,
    x,
    y - size * 0.43 + breathe * 0.15,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 193, 110, ${0.46 + shimmer * 0.24})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.45 + breathe * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.14 + capeWave * 1.2,
    y - size * 0.51,
    x + size * 0.2 + capeWave * 1.8,
    y - size * 0.4 + breathe * 0.15,
  );
  ctx.stroke();

  ctx.restore();

  drawTroopMasterworkFinish(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    TROOP_MASTERWORK_STYLES.armored,
    { vanguard: true },
  );
}
