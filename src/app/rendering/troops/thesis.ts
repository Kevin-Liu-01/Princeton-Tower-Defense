import type { Position } from "../../types";
import { drawAnimatedArm } from "../enemies/animationHelpers";
import { drawRobeBody } from "../enemies/helpers";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawHexPlate,
  drawHexArmorPlate,
  drawGlowingHexGem,
  drawHexChainMail,
  drawOrbitingHexRunes,
  drawGhostlyWisps,
  drawDissolveParticles,
  drawHexEnergyVeins,
  traceHexPath,
} from "./hexHelpers";

export function drawThesisTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  _targetPos?: Position
) {
  void _targetPos;
  const breathe = Math.sin(time * 2.2) * 0.5;
  const pagePulse = 0.72 + Math.sin(time * 4.1) * 0.28;
  const shimmer = 0.56 + Math.sin(time * 5.2) * 0.38;
  const isAttacking = attackPhase > 0;
  const hover = Math.sin(time * 2.1) * size * 0.02;
  const attackGlow = isAttacking ? attackPhase : 0;

  ctx.save();

  // hex ward pool beneath feet
  const poolPulse = 0.6 + Math.sin(time * 3.2) * 0.3;
  ctx.save();
  ctx.globalAlpha = 0.18 * poolPulse;
  traceHexPath(ctx, x, y + size * 0.42, size * 0.38);
  const poolGrad = ctx.createRadialGradient(
    x,
    y + size * 0.42,
    0,
    x,
    y + size * 0.42,
    size * 0.38
  );
  poolGrad.addColorStop(0, "rgba(168, 85, 247, 0.5)");
  poolGrad.addColorStop(0.6, "rgba(126, 34, 206, 0.3)");
  poolGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = poolGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(192, 132, 252, ${0.3 * poolPulse})`;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // ward aura
  const wardAura = ctx.createRadialGradient(
    x,
    y - size * 0.06,
    0,
    x,
    y - size * 0.06,
    size * 0.58
  );
  wardAura.addColorStop(0, "rgba(244, 114, 182, 0.2)");
  wardAura.addColorStop(0.55, "rgba(168, 85, 247, 0.16)");
  wardAura.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = wardAura;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.04, size * 0.48, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  // ghostly spectral lower body (replaces legs)
  const lowerGrad = ctx.createLinearGradient(
    x,
    y + size * 0.2,
    x,
    y + size * 0.7
  );
  lowerGrad.addColorStop(0, "rgba(109, 40, 217, 0.6)");
  lowerGrad.addColorStop(0.35, "rgba(88, 28, 135, 0.4)");
  lowerGrad.addColorStop(0.7, "rgba(76, 29, 149, 0.15)");
  lowerGrad.addColorStop(1, "rgba(59, 7, 100, 0)");
  ctx.fillStyle = lowerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y + size * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    y + size * 0.42,
    x - size * 0.12,
    y + size * 0.62
  );
  ctx.quadraticCurveTo(x - size * 0.04, y + size * 0.55, x, y + size * 0.68);
  ctx.quadraticCurveTo(
    x + size * 0.04,
    y + size * 0.55,
    x + size * 0.12,
    y + size * 0.62
  );
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y + size * 0.42,
    x + size * 0.18,
    y + size * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // ghostly wisps trailing from hem
  drawGhostlyWisps(ctx, x, y + size * 0.45, size, time, zoom, pagePulse, {
    baseWidth: 2.2,
    color1: "rgba(139, 92, 246, 0.45)",
    color2: "rgba(109, 40, 217, 0.25)",
    color3: "rgba(76, 29, 149, 0)",
    count: 7,
    curlAmount: 0.06,
    lengthMax: 0.32,
    lengthMin: 0.18,
    speed: 2.4,
    spread: 0.05,
  });

  // dissolving hex particles rising from hem
  drawDissolveParticles(
    ctx,
    x,
    y + size * 0.5,
    size,
    time,
    zoom,
    8,
    0.22,
    0.35,
    "rgba(192, 132, 252, 0.5)",
    pagePulse
  );

  // arms
  drawAnimatedArm(
    ctx,
    x - size * 0.17,
    y - size * 0.17 + hover,
    size,
    time,
    zoom,
    -1,
    {
      baseAngle: 0.5,
      color: "#8b5cf6",
      colorDark: "#5b21b6",
      elbowBend: 0.5,
      foreLen: 0.15,
      handColor: "#faf5ff",
      phaseOffset: 0.2,
      swingAmt: 0.24,
      swingSpeed: 3.2,
      upperLen: 0.17,
      width: 0.04,
    }
  );
  drawAnimatedArm(
    ctx,
    x + size * 0.17,
    y - size * 0.17 + hover,
    size,
    time,
    zoom,
    1,
    {
      attackExtra: attackGlow * 0.3,
      baseAngle: 0.34,
      color: "#8b5cf6",
      colorDark: "#5b21b6",
      elbowBend: 0.6,
      foreLen: 0.15,
      handColor: "#faf5ff",
      phaseOffset: 1,
      swingAmt: 0.2,
      swingSpeed: 3.4,
      upperLen: 0.17,
      width: 0.04,
    }
  );

  // robe body with jagged hex-trimmed hem
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.32,
    x + size * 0.24,
    y + size * 0.44
  );
  robeGrad.addColorStop(0, "#3b0764");
  robeGrad.addColorStop(0.35, color);
  robeGrad.addColorStop(0.65, "#581c87");
  robeGrad.addColorStop(1, "#2e1065");
  ctx.fillStyle = robeGrad;
  drawRobeBody(
    ctx,
    x,
    size * 0.16,
    y - size * 0.28 + hover,
    size * 0.34,
    y + size * 0.46,
    size * 0.36,
    y + size * 0.03,
    {
      altAmplitude: size * 0.06,
      amplitude: size * 0.03,
      count: 8,
      speed: 3.4,
      time,
    }
  );

  // hex energy veins running down robe
  drawHexEnergyVeins(
    ctx,
    x,
    y + size * 0.08 + hover,
    size * 0.22,
    size * 0.38,
    time,
    zoom,
    `rgba(192, 132, 252, ${0.35 + pagePulse * 0.2})`,
    pagePulse,
    4
  );

  // hex inscription band across waist
  ctx.save();
  ctx.globalAlpha = 0.32 + shimmer * 0.18;
  drawHexChainMail(
    ctx,
    x,
    y + size * 0.05 + hover,
    size * 0.28,
    size * 0.06,
    size * 0.022,
    `rgba(168, 85, 247, ${0.55 + shimmer * 0.2})`,
    zoom
  );
  ctx.globalAlpha = 1;
  ctx.restore();

  // robe side panel accents
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = `rgba(192, 132, 252, ${0.2 + pagePulse * 0.12})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.12, y - size * 0.15 + hover);
    ctx.quadraticCurveTo(
      x + side * size * 0.16,
      y + size * 0.1,
      x + side * size * 0.14,
      y + size * 0.35
    );
    ctx.stroke();
  }

  // hex armor chest plate
  const chestGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y - size * 0.18,
    x + size * 0.15,
    y + size * 0.06
  );
  chestGrad.addColorStop(0, "#3e2d6e");
  chestGrad.addColorStop(0.3, "#5b3d9e");
  chestGrad.addColorStop(0.5, "#7c5abf");
  chestGrad.addColorStop(0.7, "#5b3d9e");
  chestGrad.addColorStop(1, "#3e2d6e");
  drawHexPlate(
    ctx,
    x,
    y - size * 0.06 + hover,
    size * 0.14,
    chestGrad,
    `rgba(192, 132, 252, ${0.5 + shimmer * 0.2})`,
    1.2 * zoom
  );

  // chest hex emblem
  ctx.strokeStyle = `rgba(233, 213, 255, ${0.4 + shimmer * 0.25})`;
  ctx.lineWidth = 0.8 * zoom;
  traceHexPath(ctx, x, y - size * 0.06 + hover, size * 0.08);
  ctx.stroke();

  // hex pauldrons
  for (let side = -1; side <= 1; side += 2) {
    drawHexArmorPlate(
      ctx,
      x + side * size * 0.2,
      y - size * 0.16 + hover,
      size * 0.065,
      "#4c2882",
      "#8b5cf6",
      "#2e1065",
      `rgba(192, 132, 252, ${0.5 + shimmer * 0.2})`,
      zoom
    );
  }

  // head
  ctx.fillStyle = "#faf5ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31 + hover * 0.8, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // hex-shaped hood
  const hoodGrad = ctx.createLinearGradient(
    x - size * 0.13,
    y - size * 0.42,
    x + size * 0.13,
    y - size * 0.18
  );
  hoodGrad.addColorStop(0, "#4c1d95");
  hoodGrad.addColorStop(0.5, "#9333ea");
  hoodGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.3 + hover * 0.8);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.44 + hover * 0.5,
    x + size * 0.12,
    y - size * 0.3 + hover * 0.8
  );
  ctx.lineTo(x + size * 0.09, y - size * 0.16 + hover * 0.8);
  ctx.lineTo(x - size * 0.09, y - size * 0.16 + hover * 0.8);
  ctx.closePath();
  ctx.fill();

  // hex trim on hood
  ctx.strokeStyle = `rgba(192, 132, 252, ${0.4 + shimmer * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.28 + hover * 0.8);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.38 + hover * 0.5,
    x + size * 0.1,
    y - size * 0.28 + hover * 0.8
  );
  ctx.stroke();

  // forehead hex rune
  drawGlowingHexGem(
    ctx,
    x,
    y - size * 0.38 + hover * 0.6,
    size * 0.028,
    "#c084fc",
    "#9333ea",
    pagePulse,
    zoom
  );

  // eyes
  ctx.fillStyle = "#201132";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.024,
    y - size * 0.31 + hover * 0.8,
    size * 0.012,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.024,
    y - size * 0.31 + hover * 0.8,
    size * 0.012,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // hex-grimoire (armored book with hex clasp)
  ctx.save();
  ctx.translate(x, y + size * 0.02 + breathe * 0.45);

  // book body
  const bookGrad = ctx.createLinearGradient(
    -size * 0.1,
    0,
    size * 0.1,
    size * 0.14
  );
  bookGrad.addColorStop(0, "#3b0764");
  bookGrad.addColorStop(0.5, "#6b21a8");
  bookGrad.addColorStop(1, "#2e1065");
  ctx.fillStyle = bookGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.095, 0, size * 0.19, size * 0.13, size * 0.02);
  ctx.fill();

  // hex armor plate on book cover
  drawHexPlate(
    ctx,
    0,
    size * 0.065,
    size * 0.042,
    `rgba(139, 92, 246, ${0.6 + shimmer * 0.2})`,
    `rgba(233, 213, 255, ${0.5 + shimmer * 0.2})`,
    0.8 * zoom
  );

  // book spine
  ctx.strokeStyle = `rgba(192, 132, 252, ${0.5 + shimmer * 0.15})`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.005);
  ctx.lineTo(0, size * 0.125);
  ctx.stroke();

  // hex corner clasps
  const clasps: [number, number][] = [
    [-size * 0.07, size * 0.02],
    [size * 0.07, size * 0.02],
    [-size * 0.07, size * 0.11],
    [size * 0.07, size * 0.11],
  ];
  for (const [cx, cy] of clasps) {
    drawHexPlate(ctx, cx, cy, size * 0.015, "#c084fc", "#e9d5ff80", 0.5 * zoom);
  }

  ctx.restore();

  // orbiting hex pages
  for (let p = 0; p < 4; p++) {
    const theta = time * 1.8 + p * 1.57;
    const px = x + Math.cos(theta) * size * 0.3;
    const py =
      y - size * 0.2 + Math.sin(theta * 1.2) * size * 0.08 + hover * 0.4;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 3.1 + p) * 0.3);
    ctx.fillStyle = `rgba(243, 232, 255, ${0.42 + pagePulse * 0.32})`;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.03,
      -size * 0.022,
      size * 0.06,
      size * 0.044,
      size * 0.008
    );
    ctx.fill();

    // hex watermark on pages
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.25 + pagePulse * 0.18})`;
    ctx.lineWidth = 0.5 * zoom;
    traceHexPath(ctx, 0, 0, size * 0.014);
    ctx.stroke();

    ctx.strokeStyle = "rgba(232, 121, 249, 0.76)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, -size * 0.005);
    ctx.lineTo(size * 0.02, -size * 0.005);
    ctx.moveTo(-size * 0.02, size * 0.007);
    ctx.lineTo(size * 0.02, size * 0.007);
    ctx.stroke();
    ctx.restore();
  }

  // orbiting hex runes
  drawOrbitingHexRunes(
    ctx,
    x,
    y - size * 0.12,
    5,
    size * 0.34,
    0.35,
    size * 0.032,
    `rgba(192, 132, 252, ${0.6 + pagePulse * 0.25})`,
    time,
    1.5,
    pagePulse,
    zoom
  );

  // attack burst
  if (isAttacking) {
    const burstR = size * (0.22 + attackPhase * 0.08);
    setShadowBlur(ctx, 12 * zoom, "#a855f7");
    traceHexPath(ctx, x, y - size * 0.12, burstR);
    ctx.strokeStyle = `rgba(198, 145, 255, ${0.5 + attackPhase * 0.4})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.stroke();
    clearShadow(ctx);
  }

  ctx.restore();
}
