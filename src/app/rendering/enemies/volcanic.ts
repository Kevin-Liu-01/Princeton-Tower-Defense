// Volcanic region enemy sprites

import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import { drawEmberSparks, drawShiftingSegments, drawOrbitingDebris, drawAnimatedTendril, drawFloatingPiece } from "./animationHelpers";
import { drawPathArm, drawPathLegs, drawHipGarb } from "./darkFantasyHelpers";

// =====================================================
// VOLCANIC REGION TROOPS
// =====================================================

export function drawMagmaSpawnEnemy(
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
  // MAGMA SPAWN - Primordial elemental of living molten rock, born from volcanic fury
  const isAttacking = attackPhase > 0;
  const bubble = Math.sin(time * 4);
  const flow = (time * 2) % 1;
  const glow = 0.65 + Math.sin(time * 3) * 0.35;
  const surge = Math.sin(time * 2.5) * 0.04;
  const rage = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.15 : 0;
  size *= 1.5; // Larger size

  // Intense heat distortion aura
  const heatGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  heatGrad.addColorStop(0, `rgba(251, 146, 60, ${glow * 0.15})`);
  heatGrad.addColorStop(0.4, `rgba(234, 88, 12, ${glow * 0.1})`);
  heatGrad.addColorStop(0.7, `rgba(194, 65, 12, ${glow * 0.05})`);
  heatGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();


  // Lava pool beneath
  const poolGrad = ctx.createRadialGradient(
    x,
    y + size * 0.32,
    0,
    x,
    y + size * 0.32,
    size * 0.45,
  );
  poolGrad.addColorStop(0, `rgba(251, 191, 36, ${glow * 0.6})`);
  poolGrad.addColorStop(0.5, `rgba(234, 88, 12, ${glow * 0.4})`);
  poolGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.32, size * 0.4, size * 0.4 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dripping lava trails to ground
  ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + glow * 0.3})`;
  for (let drip = 0; drip < 4; drip++) {
    const dripX = x - size * 0.25 + drip * size * 0.18;
    const dripPhase = (flow + drip * 0.25) % 1;
    const dripY = y + size * 0.1 + dripPhase * size * 0.25;
    ctx.beginPath();
    ctx.ellipse(
      dripX,
      dripY,
      size * 0.025,
      size * 0.06 * (1 - dripPhase * 0.5),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Animated magma tendrils (arm-like appendages) - drawn before body
  drawAnimatedTendril(ctx, x - size * 0.35, y - size * 0.05, -Math.PI * 0.6, size, time, zoom, {
    color: bodyColor,
    tipColor: "#fbbf24",
    length: 0.35,
    width: 0.04,
    segments: 10,
    waveSpeed: 3,
    waveAmt: 0.08,
    tipRadius: 0.02,
  });
  drawAnimatedTendril(ctx, x + size * 0.35, y - size * 0.05, -Math.PI * 0.4, size, time, zoom, {
    color: bodyColor,
    tipColor: "#fbbf24",
    length: 0.32,
    width: 0.04,
    segments: 10,
    waveSpeed: 3.5,
    waveAmt: 0.07,
    tipRadius: 0.02,
  });
  drawAnimatedTendril(ctx, x - size * 0.2, y + size * 0.15, Math.PI * 0.7, size, time, zoom, {
    color: bodyColorDark,
    tipColor: "#fb923c",
    length: 0.25,
    width: 0.03,
    segments: 8,
    waveSpeed: 4,
    waveAmt: 0.06,
    tipRadius: 0.015,
  });
  drawAnimatedTendril(ctx, x + size * 0.2, y + size * 0.15, Math.PI * 0.3, size, time, zoom, {
    color: bodyColorDark,
    tipColor: "#fb923c",
    length: 0.25,
    width: 0.03,
    segments: 8,
    waveSpeed: 4.5,
    waveAmt: 0.06,
    tipRadius: 0.015,
  });

  // Main molten body — cooled rock plates with bezier organic shape
  const bodyGrad = ctx.createRadialGradient(
    x, y - size * 0.1, 0,
    x, y, size * 0.48,
  );
  bodyGrad.addColorStop(0, "#fef3c7");
  bodyGrad.addColorStop(0.2, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, "#7c2d12");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.5 + surge * size, y + size * 0.08 + bubble * size * 0.04,
    x - size * 0.52, y - size * 0.18,
    x - size * 0.32, y - size * 0.38,
  );
  ctx.bezierCurveTo(
    x - size * 0.22, y - size * 0.48 + bubble * size * 0.04,
    x - size * 0.08, y - size * 0.54 + bubble * size * 0.03,
    x, y - size * 0.52 + bubble * size * 0.03,
  );
  ctx.bezierCurveTo(
    x + size * 0.08, y - size * 0.54 + bubble * size * 0.03,
    x + size * 0.22, y - size * 0.48 + bubble * size * 0.04,
    x + size * 0.32, y - size * 0.38,
  );
  ctx.bezierCurveTo(
    x + size * 0.52, y - size * 0.18,
    x + size * 0.5 - surge * size, y + size * 0.08 - bubble * size * 0.04,
    x + size * 0.4, y + size * 0.22,
  );
  ctx.bezierCurveTo(
    x + size * 0.3, y + size * 0.3 + surge * size,
    x + size * 0.12, y + size * 0.32,
    x, y + size * 0.3,
  );
  ctx.bezierCurveTo(
    x - size * 0.12, y + size * 0.32,
    x - size * 0.3, y + size * 0.3 - surge * size,
    x - size * 0.4, y + size * 0.22,
  );
  ctx.fill();

  // Structural crack lines between cooled rock plates
  ctx.strokeStyle = `rgba(251, 191, 36, ${glow * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.45);
  ctx.bezierCurveTo(x - size * 0.1, y - size * 0.25, x + size * 0.05, y - size * 0.1, x + size * 0.15, y + size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.4);
  ctx.bezierCurveTo(x + size * 0.12, y - size * 0.2, x - size * 0.08, y + size * 0.02, x - size * 0.2, y + size * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.1);
  ctx.bezierCurveTo(x - size * 0.15, y - size * 0.05, x + size * 0.1, y + size * 0.05, x + size * 0.35, y + size * 0.08);
  ctx.stroke();

  // Cooled rock patches — irregular bezier plate shapes
  ctx.fillStyle = "#451a03";
  for (let rock = 0; rock < 6; rock++) {
    const rockX = x + Math.sin(rock * 1.1 + time * 0.2) * size * 0.25;
    const rockY = y - size * 0.15 + Math.cos(rock * 1.4) * size * 0.2;
    const rS = size * (0.06 + Math.sin(rock) * 0.02);
    const rRot = rock * 0.5;
    const cos_r = Math.cos(rRot);
    const sin_r = Math.sin(rRot);
    const pts = [
      { px: -rS, py: 0 },
      { px: -rS * 0.3, py: -rS * 0.8 },
      { px: rS * 0.5, py: -rS * 0.5 },
      { px: rS, py: rS * 0.2 },
      { px: rS * 0.4, py: rS * 0.7 },
      { px: -rS * 0.4, py: rS * 0.5 },
    ];
    ctx.beginPath();
    const firstPt = pts[0];
    ctx.moveTo(rockX + firstPt.px * cos_r - firstPt.py * sin_r, rockY + firstPt.px * sin_r + firstPt.py * cos_r);
    for (let pi = 1; pi <= pts.length; pi++) {
      const pt = pts[pi % pts.length];
      const prevPt = pts[(pi - 1) % pts.length];
      const cpx = (prevPt.px + pt.px) * 0.5 + Math.sin(rock + pi) * rS * 0.2;
      const cpy = (prevPt.py + pt.py) * 0.5 + Math.cos(rock + pi) * rS * 0.2;
      ctx.quadraticCurveTo(
        rockX + cpx * cos_r - cpy * sin_r,
        rockY + cpx * sin_r + cpy * cos_r,
        rockX + pt.px * cos_r - pt.py * sin_r,
        rockY + pt.px * sin_r + pt.py * cos_r,
      );
    }
    ctx.fill();
  }

  // Cooling crust plates with glowing crack edges
  for (let crust = 0; crust < 4; crust++) {
    const crustAngle = crust * (Math.PI / 2) + time * 0.1;
    const crustX = x + Math.cos(crustAngle) * size * 0.2;
    const crustY = y - size * 0.1 + Math.sin(crustAngle * 0.7) * size * 0.15;
    const crustW = size * (0.08 + Math.sin(crust * 1.5) * 0.02);
    ctx.fillStyle = `rgba(50, 20, 5, ${0.6 + Math.sin(time + crust) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(crustX - crustW, crustY - crustW * 0.4);
    ctx.lineTo(crustX - crustW * 0.3, crustY - crustW * 0.7);
    ctx.lineTo(crustX + crustW * 0.5, crustY - crustW * 0.3);
    ctx.lineTo(crustX + crustW * 0.7, crustY + crustW * 0.4);
    ctx.lineTo(crustX, crustY + crustW * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(251, 191, 36, ${glow * 0.6})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
  }

  // Glowing molten crack network
  ctx.strokeStyle = `rgba(251, 191, 36, ${glow})`;
  ctx.lineWidth = 3 * zoom;
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  // Main crack patterns
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.15,
    y - size * 0.1,
    x - size * 0.2,
    y + size * 0.1,
  );
  ctx.lineTo(x - size * 0.28, y + size * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.35);
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.15,
    x + size * 0.15,
    y + size * 0.05,
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.25);
  ctx.lineTo(x + size * 0.08, y - size * 0.05);
  ctx.lineTo(x, y + size * 0.12);
  ctx.stroke();
  // Branching cracks
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.1);
  ctx.lineTo(x - size * 0.08, y - size * 0.05);
  ctx.moveTo(x + size * 0.25, y - size * 0.15);
  ctx.lineTo(x + size * 0.32, y - size * 0.08);
  ctx.stroke();
  clearShadow(ctx);

  // Intensely bright molten core
  const coreGrad = ctx.createRadialGradient(
    x,
    y - size * 0.12,
    0,
    x,
    y - size * 0.12,
    size * 0.28,
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 230, ${glow})`);
  coreGrad.addColorStop(0.3, `rgba(254, 243, 199, ${glow * 0.8})`);
  coreGrad.addColorStop(0.6, `rgba(251, 191, 36, ${glow * 0.5})`);
  coreGrad.addColorStop(1, "rgba(251, 146, 60, 0)");
  ctx.fillStyle = coreGrad;
  setShadowBlur(ctx, 15 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(x, y - size * 0.12, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Magma pseudopod arms
  ctx.fillStyle = bodyColor;
  // Left arm extending
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.5,
    y - size * 0.05 + rage * size,
    x - size * 0.45,
    y + size * 0.15,
  );
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y + size * 0.2,
    x - size * 0.32,
    y + size * 0.1,
  );
  ctx.quadraticCurveTo(x - size * 0.4, y, x - size * 0.35, y - size * 0.1);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y - rage * size,
    x + size * 0.48,
    y + size * 0.12,
  );
  ctx.quadraticCurveTo(
    x + size * 0.38,
    y + size * 0.18,
    x + size * 0.34,
    y + size * 0.08,
  );
  ctx.quadraticCurveTo(
    x + size * 0.42,
    y - size * 0.02,
    x + size * 0.35,
    y - size * 0.1,
  );
  ctx.fill();

  // Arm lava glow
  ctx.strokeStyle = `rgba(251, 191, 36, ${glow * 0.7})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.02);
  ctx.lineTo(x - size * 0.38, y + size * 0.12);
  ctx.moveTo(x + size * 0.42, y + size * 0.05);
  ctx.lineTo(x + size * 0.4, y + size * 0.13);
  ctx.stroke();

  // Fierce glowing eyes - deep set in molten face
  ctx.fillStyle = "#0a0502";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.22,
    size * 0.07,
    size * 0.055,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.22,
    size * 0.07,
    size * 0.055,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Inner eye fire
  ctx.fillStyle = `rgba(255, 255, 200, ${glow})`;
  setShadowBlur(ctx, 12 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.22,
    size * 0.045,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.22,
    size * 0.045,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Burning pupils
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.22, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.12, y - size * 0.22, size * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // Jagged mouth crack
  ctx.fillStyle = `rgba(255, 255, 200, ${glow * 0.9})`;
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.08);
  ctx.lineTo(x - size * 0.08, y - size * 0.04);
  ctx.lineTo(x - size * 0.03, y - size * 0.07);
  ctx.lineTo(x + size * 0.02, y - size * 0.03);
  ctx.lineTo(x + size * 0.08, y - size * 0.06);
  ctx.lineTo(x + size * 0.12, y - size * 0.02);
  ctx.lineTo(x + size * 0.08, y + size * 0.02);
  ctx.lineTo(x + size * 0.02, y - size * 0.01);
  ctx.lineTo(x - size * 0.04, y + size * 0.02);
  ctx.lineTo(x - size * 0.1, y - size * 0.02);
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);

  // Bubbling lava on surface
  ctx.fillStyle = `rgba(251, 191, 36, ${glow * 0.8})`;
  for (let b = 0; b < 5; b++) {
    const bx = x - size * 0.2 + b * size * 0.1;
    const bubblePhase = Math.abs(Math.sin(time * 3 + b * 1.2));
    const by = y - size * 0.4 - bubblePhase * size * 0.12;
    const bSize = size * (0.035 + bubblePhase * 0.02);
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lava bubble pop bursts
  for (let pop = 0; pop < 3; pop++) {
    const popCycle = (time * 1.2 + pop * 0.33) % 1;
    const popX = x - size * 0.15 + pop * size * 0.15;
    const popBaseY = y - size * 0.35 - Math.abs(Math.sin(time * 2 + pop)) * size * 0.1;
    if (popCycle > 0.7) {
      const burstPhase = (popCycle - 0.7) / 0.3;
      const burstAlpha = (1 - burstPhase) * 0.6;
      ctx.strokeStyle = `rgba(251, 191, 36, ${burstAlpha})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(popX, popBaseY, size * 0.03 + burstPhase * size * 0.06, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(251, 146, 60, ${burstAlpha * 0.8})`;
      for (let splat = 0; splat < 4; splat++) {
        const splatAngle = splat * (Math.PI / 2) + pop;
        const splatDist = burstPhase * size * 0.08;
        ctx.beginPath();
        ctx.arc(
          popX + Math.cos(splatAngle) * splatDist,
          popBaseY + Math.sin(splatAngle) * splatDist,
          size * 0.01 * (1 - burstPhase),
          0, Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  // Rising embers/sparks
  ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + glow * 0.3})`;
  for (let ember = 0; ember < 8; ember++) {
    const emberPhase = (time * 1.5 + ember * 0.12) % 1;
    const ex = x + Math.sin(ember * 1.3 + time * 2) * size * 0.35;
    const ey = y - size * 0.3 - emberPhase * size * 0.5;
    const emberSize = size * 0.02 * (1 - emberPhase);
    ctx.beginPath();
    ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoke wisps
  ctx.fillStyle = `rgba(100, 80, 60, ${0.3 - flow * 0.2})`;
  for (let smoke = 0; smoke < 3; smoke++) {
    const sx = x + Math.sin(smoke * 2.1 + time) * size * 0.2;
    const smokePhase = (flow + smoke * 0.3) % 1;
    const sy = y - size * 0.5 - smokePhase * size * 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, size * (0.06 + smokePhase * 0.04), 0, Math.PI * 2);
    ctx.fill();
  }

  // Rising ember sparks
  drawEmberSparks(ctx, x, y - size * 0.1, size * 0.3, time, zoom, {
    color: "rgba(251, 146, 60, 0.5)",
    coreColor: "rgba(255, 230, 150, 0.8)",
    count: 6,
    speed: 1.2,
    maxAlpha: 0.45,
  });

  // Floating magma segments
  drawShiftingSegments(ctx, x, y - size * 0.1, size, time, zoom, {
    color: "#ea580c",
    colorAlt: "#fbbf24",
    count: 5,
    orbitRadius: 0.35,
    segmentSize: 0.035,
    orbitSpeed: 1,
    shape: "circle",
  });

  // Orbiting ember debris
  drawOrbitingDebris(ctx, x, y - size * 0.15, size, time, zoom, {
    color: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.3)",
    count: 7,
    speed: 2.5,
    particleSize: 0.018,
    minRadius: 0.3,
    maxRadius: 0.5,
    trailLen: 4,
  });

  // Lava crack glow lines on body surface
  ctx.save();
  ctx.strokeStyle = `rgba(251, 191, 36, ${glow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let lc = 0; lc < 5; lc++) {
    const lcStartX = x - size * 0.15 + lc * size * 0.08;
    const lcStartY = y - size * 0.2 + Math.sin(lc * 2) * size * 0.1;
    const lcEndX = lcStartX + Math.sin(time * 2 + lc) * size * 0.06;
    const lcEndY = lcStartY + size * 0.12;
    const lcGrad = ctx.createLinearGradient(lcStartX, lcStartY, lcEndX, lcEndY);
    lcGrad.addColorStop(0, `rgba(255, 255, 200, ${glow * 0.5})`);
    lcGrad.addColorStop(0.5, `rgba(251, 191, 36, ${glow * 0.4})`);
    lcGrad.addColorStop(1, `rgba(234, 88, 12, 0)`);
    ctx.strokeStyle = lcGrad;
    ctx.beginPath();
    ctx.moveTo(lcStartX, lcStartY);
    ctx.quadraticCurveTo(lcStartX + size * 0.03, lcStartY + size * 0.06, lcEndX, lcEndY);
    ctx.stroke();
  }
  ctx.restore();

  // Heat distortion waves rising
  ctx.save();
  for (let hw = 0; hw < 4; hw++) {
    const hwPhase = (time * 0.8 + hw * 0.25) % 1;
    const hwY = y - size * 0.1 - hwPhase * size * 0.5;
    const hwWidth = size * (0.3 - hwPhase * 0.1);
    const hwAlpha = (1 - hwPhase) * 0.06;
    ctx.fillStyle = `rgba(255, 200, 100, ${hwAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.sin(time * 6 + hw * 2) * size * 0.04, hwY,
      hwWidth, size * 0.02, 0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Magma drip splatter at base
  ctx.save();
  for (let md = 0; md < 3; md++) {
    const mdPhase = (time * 1.3 + md * 0.33) % 1;
    const mdX = x + (md - 1) * size * 0.18;
    const mdY = y + size * 0.28 + mdPhase * size * 0.08;
    const mdAlpha = (1 - mdPhase) * glow * 0.4;
    const mdGrad = ctx.createRadialGradient(mdX, mdY, 0, mdX, mdY, size * 0.03);
    mdGrad.addColorStop(0, `rgba(255, 255, 200, ${mdAlpha})`);
    mdGrad.addColorStop(1, `rgba(251, 146, 60, 0)`);
    ctx.fillStyle = mdGrad;
    ctx.beginPath();
    ctx.arc(mdX, mdY, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Lava crack glow veins on body surface
  ctx.save();
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = crack * Math.PI * 0.35 + 0.2;
    const crackPulse = 0.3 + Math.sin(time * 3 + crack * 1.5) * 0.2;
    const crackStartX = x + Math.cos(crackAngle) * size * 0.08;
    const crackStartY = y - size * 0.08;
    const crackEndX = x + Math.cos(crackAngle) * size * 0.28;
    const crackEndY = y - size * 0.08 + Math.sin(crackAngle * 0.7) * size * 0.15;
    const crackGrad = ctx.createLinearGradient(crackStartX, crackStartY, crackEndX, crackEndY);
    crackGrad.addColorStop(0, `rgba(251, 191, 36, ${crackPulse * glow})`);
    crackGrad.addColorStop(0.5, `rgba(251, 146, 60, ${crackPulse * glow * 0.7})`);
    crackGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
    ctx.strokeStyle = crackGrad;
    ctx.lineWidth = (1.5 + crackPulse * 1.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(crackStartX, crackStartY);
    ctx.quadraticCurveTo(
      (crackStartX + crackEndX) / 2 + Math.sin(time * 4 + crack) * size * 0.04,
      (crackStartY + crackEndY) / 2 - size * 0.02,
      crackEndX, crackEndY,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Heat distortion shimmer waves rising
  ctx.save();
  for (let hw = 0; hw < 4; hw++) {
    const hwPhase = (time * 0.8 + hw * 0.25) % 1;
    const hwX = x + Math.sin(time * 5 + hw * 2) * size * 0.15;
    const hwY = y - size * 0.2 - hwPhase * size * 0.4;
    const hwAlpha = (1 - hwPhase) * glow * 0.08;
    ctx.fillStyle = `rgba(255, 200, 100, ${hwAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      hwX, hwY,
      size * (0.15 + Math.sin(time * 6 + hw) * 0.03), size * 0.02,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Attack eruption: lava burst with expanding ground wave and flying magma
  if (isAttacking) {
    const eruptIntensity = Math.sin(attackPhase * Math.PI);

    // Expanding lava shockwave on ground
    const lavaWaveR = size * (0.2 + attackPhase * 0.6);
    ctx.strokeStyle = `rgba(251, 191, 36, ${(1 - attackPhase) * 0.5})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.3, lavaWaveR, lavaWaveR * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Bright eruption core flash
    const coreFlashGrad = ctx.createRadialGradient(
      x, y - size * 0.15, 0,
      x, y - size * 0.15, size * eruptIntensity * 0.4,
    );
    coreFlashGrad.addColorStop(0, `rgba(255, 255, 230, ${eruptIntensity * 0.6})`);
    coreFlashGrad.addColorStop(0.5, `rgba(251, 191, 36, ${eruptIntensity * 0.3})`);
    coreFlashGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
    ctx.fillStyle = coreFlashGrad;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.15, size * eruptIntensity * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Flying magma globs in arc patterns
    setShadowBlur(ctx, 6 * zoom, "#fbbf24");
    for (let erupt = 0; erupt < 10; erupt++) {
      const eruptAngle = (erupt / 10) * Math.PI * 2;
      const eruptDist = attackPhase * size * 0.55;
      const arcHeight = Math.sin(attackPhase * Math.PI) * size * 0.3;
      const ex = x + Math.cos(eruptAngle) * eruptDist;
      const ey = y - size * 0.2 + Math.sin(eruptAngle) * eruptDist * 0.4 - arcHeight;
      const globSize = size * 0.035 * (1 - attackPhase * 0.4);
      ctx.fillStyle = `rgba(251, 191, 36, ${(1 - attackPhase) * 0.8})`;
      ctx.beginPath();
      ctx.arc(ex, ey, globSize, 0, Math.PI * 2);
      ctx.fill();
    }
    clearShadow(ctx);
  }
}

export function drawFireImpEnemy(
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
  // FIRE IMP - Mischievous demon of infernal flames, delighting in chaos and destruction
  const isAttacking = attackPhase > 0;
  const hop = Math.abs(Math.sin(time * 8)) * size * 0.15;
  const armWave = Math.sin(time * 6) * 0.5;
  const flameFlicker = 0.75 + Math.random() * 0.25;
  const bodyPulse = 0.95 + Math.sin(time * 5) * 0.05;
  const cackleBounce = Math.sin(time * 12) * size * 0.02;
  size *= 1.7; // Much larger size

  // Intense fiery aura
  const auraGrad = ctx.createRadialGradient(
    x,
    y - hop,
    0,
    x,
    y - hop,
    size * 0.7,
  );
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${flameFlicker * 0.2})`);
  auraGrad.addColorStop(0.4, `rgba(251, 146, 60, ${flameFlicker * 0.15})`);
  auraGrad.addColorStop(0.7, `rgba(234, 88, 12, ${flameFlicker * 0.08})`);
  auraGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();


  // Ember trail on ground
  ctx.fillStyle = `rgba(251, 146, 60, ${0.4 + flameFlicker * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.32, size * 0.15, size * 0.15 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Burning fire footprints
  const stepPhase = (time * 2) % 2;
  const leftFootGlow = stepPhase < 1 ? 1 - stepPhase : 0;
  const rightFootGlow = stepPhase >= 1 ? 2 - stepPhase : 0;
  if (leftFootGlow > 0.1) {
    ctx.fillStyle = `rgba(251, 146, 60, ${leftFootGlow * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.12, y + size * 0.32, size * 0.06, size * 0.06 * ISO_Y_RATIO, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(251, 191, 36, ${leftFootGlow * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.12, y + size * 0.32, size * 0.035, size * 0.035 * ISO_Y_RATIO, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (rightFootGlow > 0.1) {
    ctx.fillStyle = `rgba(251, 146, 60, ${rightFootGlow * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.12, y + size * 0.32, size * 0.06, size * 0.06 * ISO_Y_RATIO, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(251, 191, 36, ${rightFootGlow * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.12, y + size * 0.32, size * 0.035, size * 0.035 * ISO_Y_RATIO, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Armored hopping legs — molten-edged path-based
  drawPathLegs(ctx, x, y + size * 0.12 - hop, size, time, zoom, {
    color: "#b45309",
    colorDark: "#7c2d12",
    footColor: "#451a03",
    strideSpeed: 8,
    strideAmt: 0.4,
    legLen: 0.14,
    width: 0.04,
    style: 'armored',
  });

  // Fire Imp arms — mischievous clawing
  drawPathArm(ctx, x - size * 0.18, y - size * 0.1 - hop, size, time, zoom, -1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#7c2d12",
    shoulderAngle: -0.6 + Math.sin(time * 5) * 0.2 + (isAttacking ? -attackPhase * 0.5 : 0),
    elbowAngle: 0.4 + Math.sin(time * 6 + 0.8) * 0.2,
    upperLen: 0.14,
    foreLen: 0.12,
    width: 0.04,
    handRadius: 0.03,
    style: 'armored',
    onWeapon: (wCtx) => {
      const s = size;
      const handY = 0.12 * s;
      const atk = isAttacking ? attackPhase : 0;
      const pulse = 0.85 + Math.sin(time * 10) * 0.15 + atk * 0.2;
      wCtx.translate(0, handY * 0.62);
      wCtx.rotate(-0.12);
      const orbR = s * 0.07 * (0.92 + atk * 0.12 + Math.sin(time * 14) * 0.06);
      const coreGrad = wCtx.createRadialGradient(0, 0, 0, 0, 0, orbR * 1.35);
      coreGrad.addColorStop(0, `rgba(255, 255, 220, ${0.95 * pulse})`);
      coreGrad.addColorStop(0.25, `rgba(253, 224, 71, ${0.85 * pulse})`);
      coreGrad.addColorStop(0.55, `rgba(251, 146, 60, ${0.7 * pulse})`);
      coreGrad.addColorStop(0.85, `rgba(234, 88, 12, ${0.45 * pulse})`);
      coreGrad.addColorStop(1, "rgba(127, 29, 29, 0)");
      wCtx.fillStyle = coreGrad;
      wCtx.beginPath();
      wCtx.arc(0, 0, orbR, 0, Math.PI * 2);
      wCtx.fill();
      const shellGrad = wCtx.createRadialGradient(-orbR * 0.25, -orbR * 0.2, orbR * 0.1, 0, 0, orbR);
      shellGrad.addColorStop(0, `rgba(255, 200, 100, ${0.35 * pulse})`);
      shellGrad.addColorStop(0.6, `rgba(249, 115, 22, ${0.2 * pulse})`);
      shellGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
      wCtx.fillStyle = shellGrad;
      wCtx.beginPath();
      wCtx.arc(0, 0, orbR * 0.92, 0, Math.PI * 2);
      wCtx.fill();
      for (let e = 0; e < 5; e++) {
        const eAng = time * 4 + e * ((Math.PI * 2) / 5);
        const eRad = orbR * (1.05 + Math.sin(time * 6 + e) * 0.08);
        const ex = Math.cos(eAng) * eRad;
        const ey = Math.sin(eAng) * eRad * 0.75;
        wCtx.fillStyle = `rgba(255, 237, 150, ${0.45 + atk * 0.35})`;
        wCtx.beginPath();
        wCtx.arc(ex, ey, s * 0.012, 0, Math.PI * 2);
        wCtx.fill();
      }
      wCtx.strokeStyle = `rgba(251, 191, 36, ${0.5 + atk * 0.35})`;
      wCtx.lineWidth = 1.2 * zoom;
      wCtx.setLineDash([2 * zoom, 3 * zoom]);
      wCtx.beginPath();
      wCtx.arc(0, 0, orbR * 0.55, time * 3, time * 3 + Math.PI * 1.25);
      wCtx.stroke();
      wCtx.setLineDash([]);
    },
  });
  drawPathArm(ctx, x + size * 0.18, y - size * 0.1 - hop, size, time, zoom, 1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#7c2d12",
    shoulderAngle: 0.6 + Math.sin(time * 5 + Math.PI) * 0.2 + (isAttacking ? attackPhase * 0.5 : 0),
    elbowAngle: 0.4 + Math.sin(time * 6 + 2.5) * 0.2,
    upperLen: 0.14,
    foreLen: 0.12,
    width: 0.04,
    handRadius: 0.03,
    style: 'armored',
    onWeapon: (wCtx) => {
      const s = size;
      const handY = 0.12 * s;
      const atk = isAttacking ? attackPhase : 0;
      wCtx.translate(0, handY * 0.58);
      wCtx.rotate(0.08);
      const shaftTop = -s * 0.44;
      const shaftBot = s * 0.02;
      const shaftGrad = wCtx.createLinearGradient(0, shaftBot, 0, shaftTop);
      shaftGrad.addColorStop(0, "#1c1917");
      shaftGrad.addColorStop(0.45, "#292524");
      shaftGrad.addColorStop(0.72, "#7c2d12");
      shaftGrad.addColorStop(0.9, "#c2410c");
      shaftGrad.addColorStop(1, "#ea580c");
      wCtx.fillStyle = shaftGrad;
      wCtx.beginPath();
      wCtx.moveTo(-s * 0.014, shaftBot);
      wCtx.lineTo(s * 0.014, shaftBot);
      wCtx.lineTo(s * 0.01, shaftTop + s * 0.06);
      wCtx.lineTo(-s * 0.01, shaftTop + s * 0.06);
      wCtx.closePath();
      wCtx.fill();
      wCtx.strokeStyle = "#0c0a09";
      wCtx.lineWidth = Math.max(0.6, zoom * 0.8);
      wCtx.stroke();
      const forkY = shaftTop + s * 0.05;
      const prongLen = s * 0.1;
      const spread = s * 0.034;
      for (const px of [-spread, 0, spread]) {
        const prongGrad = wCtx.createLinearGradient(px, forkY, px, forkY - prongLen);
        prongGrad.addColorStop(0, "#44403c");
        prongGrad.addColorStop(0.6, "#9a3412");
        prongGrad.addColorStop(1, "#f97316");
        wCtx.fillStyle = prongGrad;
        wCtx.beginPath();
        wCtx.moveTo(px - s * 0.008, forkY);
        wCtx.lineTo(px, forkY - prongLen);
        wCtx.lineTo(px + s * 0.008, forkY);
        wCtx.closePath();
        wCtx.fill();
        const tipGlow = 0.65 + atk * 0.35 + Math.sin(time * 11 + px * 3) * 0.15;
        const tipG = wCtx.createRadialGradient(px, forkY - prongLen, 0, px, forkY - prongLen, s * 0.028);
        tipG.addColorStop(0, `rgba(255, 252, 220, ${0.9 * tipGlow})`);
        tipG.addColorStop(0.4, `rgba(251, 146, 60, ${0.75 * tipGlow})`);
        tipG.addColorStop(1, "rgba(220, 38, 38, 0)");
        wCtx.fillStyle = tipG;
        wCtx.beginPath();
        wCtx.arc(px, forkY - prongLen, s * 0.022, 0, Math.PI * 2);
        wCtx.fill();
        wCtx.fillStyle = `rgba(255, 200, 80, ${0.35 * tipGlow})`;
        wCtx.beginPath();
        wCtx.moveTo(px - s * 0.006, forkY - prongLen);
        wCtx.quadraticCurveTo(px - s * 0.02, forkY - prongLen - s * 0.04, px, forkY - prongLen - s * 0.07);
        wCtx.quadraticCurveTo(px + s * 0.02, forkY - prongLen - s * 0.04, px + s * 0.006, forkY - prongLen);
        wCtx.fill();
      }
      wCtx.fillStyle = "#292524";
      wCtx.beginPath();
      wCtx.moveTo(-spread - s * 0.008, forkY);
      wCtx.lineTo(spread + s * 0.008, forkY);
      wCtx.lineTo(spread + s * 0.004, forkY + s * 0.018);
      wCtx.lineTo(-spread - s * 0.004, forkY + s * 0.018);
      wCtx.closePath();
      wCtx.fill();
    },
  });

  // Clawed feet — digitigrade bezier demon feet
  ctx.fillStyle = "#7c2d12";
  for (const ftData of [
    { fx: x - size * 0.12 + cackleBounce, dir: -1 },
    { fx: x + size * 0.12 - cackleBounce, dir: 1 },
  ] as const) {
    const ftY = y + size * 0.2 - hop;
    ctx.beginPath();
    ctx.moveTo(ftData.fx, ftY - size * 0.1);
    ctx.bezierCurveTo(
      ftData.fx + ftData.dir * size * 0.05, ftY - size * 0.08,
      ftData.fx + ftData.dir * size * 0.09, ftY - size * 0.02,
      ftData.fx + ftData.dir * size * 0.08, ftY + size * 0.06,
    );
    ctx.bezierCurveTo(
      ftData.fx + ftData.dir * size * 0.04, ftY + size * 0.12,
      ftData.fx - ftData.dir * size * 0.04, ftY + size * 0.12,
      ftData.fx - ftData.dir * size * 0.06, ftY + size * 0.06,
    );
    ctx.bezierCurveTo(
      ftData.fx - ftData.dir * size * 0.08, ftY - size * 0.02,
      ftData.fx - ftData.dir * size * 0.04, ftY - size * 0.09,
      ftData.fx, ftY - size * 0.1,
    );
    ctx.fill();
  }

  // Foot claws
  ctx.fillStyle = "#451a03";
  for (let foot = -1; foot <= 1; foot += 2) {
    for (let claw = 0; claw < 3; claw++) {
      const clawX = x + foot * size * 0.12 + (claw - 1) * size * 0.03 * foot;
      const clawY = y + size * 0.28 - hop;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + foot * size * 0.02, clawY + size * 0.04);
      ctx.lineTo(clawX - foot * size * 0.01, clawY + size * 0.02);
      ctx.fill();
    }
  }

  // Sinuous demonic body — tapered torso with bezier anatomy
  const bodyGrad = ctx.createRadialGradient(
    x, y - size * 0.05 - hop, 0,
    x, y - size * 0.05 - hop, size * 0.28,
  );
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28 * bodyPulse - hop);
  ctx.bezierCurveTo(
    x + size * 0.12 * bodyPulse, y - size * 0.26 - hop,
    x + size * 0.22 * bodyPulse, y - size * 0.15 - hop,
    x + size * 0.2 * bodyPulse, y - size * 0.02 - hop,
  );
  ctx.bezierCurveTo(
    x + size * 0.18 * bodyPulse, y + size * 0.1 - hop,
    x + size * 0.15, y + size * 0.18 - hop,
    x, y + size * 0.2 * bodyPulse - hop,
  );
  ctx.bezierCurveTo(
    x - size * 0.15, y + size * 0.18 - hop,
    x - size * 0.18 * bodyPulse, y + size * 0.1 - hop,
    x - size * 0.2 * bodyPulse, y - size * 0.02 - hop,
  );
  ctx.bezierCurveTo(
    x - size * 0.22 * bodyPulse, y - size * 0.15 - hop,
    x - size * 0.12 * bodyPulse, y - size * 0.26 - hop,
    x, y - size * 0.28 * bodyPulse - hop,
  );
  ctx.fill();

  // Bat-like wings — bezier membrane stretched between finger bones
  const wingFlap = Math.sin(time * 6) * 0.25;
  const wingSpread = 0.8 + (isAttacking ? 0.3 : 0);
  for (const wingSide of [-1, 1] as const) {
    const wingBaseX = x + wingSide * size * 0.15;
    const wingBaseY = y - size * 0.15 - hop;
    const wingSpan = size * 0.35 * wingSpread;
    const wingH = size * 0.25;

    // Wing membrane
    ctx.fillStyle = `rgba(120, 40, 10, ${0.55 + flameFlicker * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(wingBaseX, wingBaseY);
    // Upper wing edge
    ctx.bezierCurveTo(
      wingBaseX + wingSide * wingSpan * 0.4, wingBaseY - wingH * 0.8 + wingFlap * size,
      wingBaseX + wingSide * wingSpan * 0.8, wingBaseY - wingH * 0.6 + wingFlap * size * 0.5,
      wingBaseX + wingSide * wingSpan, wingBaseY - wingH * 0.3 + wingFlap * size * 0.3,
    );
    // Wing tip down to lower edge
    ctx.bezierCurveTo(
      wingBaseX + wingSide * wingSpan * 0.95, wingBaseY + wingH * 0.1,
      wingBaseX + wingSide * wingSpan * 0.7, wingBaseY + wingH * 0.4,
      wingBaseX + wingSide * wingSpan * 0.4, wingBaseY + wingH * 0.3 - wingFlap * size * 0.2,
    );
    // Return to base
    ctx.bezierCurveTo(
      wingBaseX + wingSide * wingSpan * 0.2, wingBaseY + wingH * 0.25,
      wingBaseX + wingSide * size * 0.05, wingBaseY + wingH * 0.1,
      wingBaseX, wingBaseY,
    );
    ctx.fill();

    // Wing bone struts
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.5 * zoom;
    for (let bone = 0; bone < 3; bone++) {
      const boneT = (bone + 1) / 4;
      const boneEndX = wingBaseX + wingSide * wingSpan * (0.3 + boneT * 0.65);
      const boneEndY = wingBaseY - wingH * (0.5 - boneT * 0.4) + wingFlap * size * (1 - boneT) * 0.5;
      ctx.beginPath();
      ctx.moveTo(wingBaseX, wingBaseY);
      ctx.bezierCurveTo(
        wingBaseX + wingSide * wingSpan * boneT * 0.4, wingBaseY - wingH * 0.2,
        wingBaseX + wingSide * wingSpan * boneT * 0.7, boneEndY + wingH * 0.1,
        boneEndX, boneEndY,
      );
      ctx.stroke();
    }

    // Membrane vein detail
    ctx.strokeStyle = `rgba(180, 60, 15, ${0.25 + flameFlicker * 0.1})`;
    ctx.lineWidth = 0.8 * zoom;
    for (let vein = 0; vein < 2; vein++) {
      const vT = (vein + 1) / 3;
      ctx.beginPath();
      ctx.moveTo(
        wingBaseX + wingSide * wingSpan * vT * 0.5,
        wingBaseY - wingH * 0.3 + wingFlap * size * 0.3,
      );
      ctx.lineTo(
        wingBaseX + wingSide * wingSpan * (vT * 0.5 + 0.15),
        wingBaseY + wingH * 0.15,
      );
      ctx.stroke();
    }
  }

  // Body flame patterns
  ctx.strokeStyle = `rgba(251, 191, 36, ${flameFlicker * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2 - hop);
  ctx.quadraticCurveTo(
    x - size * 0.05,
    y - size * 0.1 - hop,
    x - size * 0.12,
    y + size * 0.05 - hop,
  );
  ctx.moveTo(x + size * 0.08, y - size * 0.15 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.05 - hop,
    x + size * 0.06,
    y + size * 0.08 - hop,
  );
  ctx.stroke();

  // Belly ember glow
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.02 - hop,
    size * 0.1,
    size * 0.08,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wiry muscular arms reaching outward
  ctx.fillStyle = bodyColor;
  // Left arm raised in mischief
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x - size * 0.35 + armWave * size * 0.12,
    y - size * 0.2 - hop,
    x - size * 0.32 + armWave * size * 0.1,
    y - size * 0.35 - hop,
  );
  ctx.lineTo(x - size * 0.26 + armWave * size * 0.08, y - size * 0.32 - hop);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    y - size * 0.15 - hop,
    x - size * 0.18,
    y - size * 0.08 - hop,
  );
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.35 - armWave * size * 0.12,
    y - size * 0.15 - hop,
    x + size * 0.32 - armWave * size * 0.1,
    y - size * 0.3 - hop,
  );
  ctx.lineTo(x + size * 0.26 - armWave * size * 0.08, y - size * 0.27 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y - size * 0.12 - hop,
    x + size * 0.18,
    y - size * 0.08 - hop,
  );
  ctx.fill();

  // Clawed hands with fire
  ctx.fillStyle = "#7c2d12";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.32 + armWave * size * 0.1,
    y - size * 0.37 - hop,
    size * 0.06,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.32 - armWave * size * 0.1,
    y - size * 0.32 - hop,
    size * 0.06,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Hand claws
  ctx.fillStyle = "#451a03";
  for (let hand = -1; hand <= 1; hand += 2) {
    const handX =
      hand < 0
        ? x - size * 0.32 + armWave * size * 0.1
        : x + size * 0.32 - armWave * size * 0.1;
    const handY = hand < 0 ? y - size * 0.37 - hop : y - size * 0.32 - hop;
    for (let claw = 0; claw < 3; claw++) {
      const clawAngle =
        (hand < 0 ? -Math.PI * 0.6 : -Math.PI * 0.4) + claw * 0.25 * hand;
      ctx.beginPath();
      ctx.moveTo(
        handX + Math.cos(clawAngle) * size * 0.04,
        handY + Math.sin(clawAngle) * size * 0.04,
      );
      ctx.lineTo(
        handX + Math.cos(clawAngle) * size * 0.1,
        handY + Math.sin(clawAngle) * size * 0.08,
      );
      ctx.lineTo(
        handX + Math.cos(clawAngle + 0.15) * size * 0.04,
        handY + Math.sin(clawAngle + 0.15) * size * 0.04,
      );
      ctx.fill();
    }
  }

  // Fireball forming in hand when attacking
  if (isAttacking) {
    const fireballGrad = ctx.createRadialGradient(
      x - size * 0.32 + armWave * size * 0.1,
      y - size * 0.42 - hop,
      0,
      x - size * 0.32 + armWave * size * 0.1,
      y - size * 0.42 - hop,
      size * 0.08 * attackPhase,
    );
    fireballGrad.addColorStop(0, `rgba(255, 255, 200, ${attackPhase})`);
    fireballGrad.addColorStop(0.5, `rgba(251, 191, 36, ${attackPhase * 0.8})`);
    fireballGrad.addColorStop(1, `rgba(234, 88, 12, ${attackPhase * 0.4})`);
    ctx.fillStyle = fireballGrad;
    setShadowBlur(ctx, 10 * zoom * attackPhase, "#fbbf24");
    ctx.beginPath();
    ctx.arc(
      x - size * 0.32 + armWave * size * 0.1,
      y - size * 0.42 - hop,
      size * 0.08 * attackPhase,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // Large impish head
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.35 - hop,
    0,
    x,
    y - size * 0.35 - hop,
    size * 0.2,
  );
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.6, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  // Impish head — angular bezier cranium with pointed chin
  ctx.fillStyle = headGrad;
  const ihx = x + cackleBounce;
  const ihy = y - size * 0.35 - hop;
  const ihR = size * 0.18;
  ctx.beginPath();
  ctx.moveTo(ihx, ihy - ihR);
  ctx.bezierCurveTo(
    ihx + ihR * 0.8, ihy - ihR * 0.95,
    ihx + ihR * 1.05, ihy - ihR * 0.2,
    ihx + ihR * 0.85, ihy + ihR * 0.3,
  );
  ctx.bezierCurveTo(
    ihx + ihR * 0.6, ihy + ihR * 0.7,
    ihx + ihR * 0.2, ihy + ihR * 1.0,
    ihx, ihy + ihR * 0.95,
  );
  ctx.bezierCurveTo(
    ihx - ihR * 0.2, ihy + ihR * 1.0,
    ihx - ihR * 0.6, ihy + ihR * 0.7,
    ihx - ihR * 0.85, ihy + ihR * 0.3,
  );
  ctx.bezierCurveTo(
    ihx - ihR * 1.05, ihy - ihR * 0.2,
    ihx - ihR * 0.8, ihy - ihR * 0.95,
    ihx, ihy - ihR,
  );
  ctx.fill();

  // Pointed bat-like ears with bezier
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.38 - hop);
  ctx.bezierCurveTo(
    x - size * 0.2, y - size * 0.4 - hop,
    x - size * 0.26, y - size * 0.44 - hop,
    x - size * 0.3, y - size * 0.52 - hop,
  );
  ctx.bezierCurveTo(
    x - size * 0.27, y - size * 0.48 - hop,
    x - size * 0.22, y - size * 0.43 - hop,
    x - size * 0.18, y - size * 0.4 - hop,
  );
  ctx.lineTo(x - size * 0.14, y - size * 0.36 - hop);
  ctx.fill();
  // Ear membrane detail
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.39 - hop);
  ctx.lineTo(x - size * 0.26, y - size * 0.48 - hop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.38 - hop);
  ctx.bezierCurveTo(
    x + size * 0.2, y - size * 0.4 - hop,
    x + size * 0.26, y - size * 0.44 - hop,
    x + size * 0.3, y - size * 0.52 - hop,
  );
  ctx.bezierCurveTo(
    x + size * 0.27, y - size * 0.48 - hop,
    x + size * 0.22, y - size * 0.43 - hop,
    x + size * 0.18, y - size * 0.4 - hop,
  );
  ctx.lineTo(x + size * 0.14, y - size * 0.36 - hop);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.39 - hop);
  ctx.lineTo(x + size * 0.26, y - size * 0.48 - hop);
  ctx.stroke();

  // Pointed tail curving behind
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 3 * zoom;
  ctx.lineCap = "round";
  const tailWag = Math.sin(time * 5) * size * 0.05;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.15 - hop);
  ctx.bezierCurveTo(
    x + size * 0.1, y + size * 0.2 - hop,
    x + size * 0.18 + tailWag, y + size * 0.12 - hop,
    x + size * 0.22 + tailWag, y + size * 0.02 - hop,
  );
  ctx.stroke();
  // Tail tip (arrow point)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22 + tailWag, y + size * 0.02 - hop);
  ctx.lineTo(x + size * 0.27 + tailWag, y - size * 0.02 - hop);
  ctx.lineTo(x + size * 0.22 + tailWag, y - size * 0.04 - hop);
  ctx.lineTo(x + size * 0.2 + tailWag, y + size * 0.01 - hop);
  ctx.fill();

  // Wicked curved horns — bezier ridged
  ctx.fillStyle = "#451a03";
  // Left horn
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.48 - hop);
  ctx.bezierCurveTo(
    x - size * 0.15, y - size * 0.56 - hop,
    x - size * 0.2, y - size * 0.64 - hop,
    x - size * 0.08, y - size * 0.72 - hop,
  );
  ctx.bezierCurveTo(
    x - size * 0.06, y - size * 0.66 - hop,
    x - size * 0.1, y - size * 0.56 - hop,
    x - size * 0.07, y - size * 0.48 - hop,
  );
  ctx.fill();
  // Horn ridge marks
  ctx.strokeStyle = "#2a0a02";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.52 - hop);
  ctx.lineTo(x - size * 0.11, y - size * 0.54 - hop);
  ctx.moveTo(x - size * 0.1, y - size * 0.58 - hop);
  ctx.lineTo(x - size * 0.13, y - size * 0.6 - hop);
  ctx.stroke();
  // Right horn
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.48 - hop);
  ctx.bezierCurveTo(
    x + size * 0.15, y - size * 0.56 - hop,
    x + size * 0.2, y - size * 0.64 - hop,
    x + size * 0.08, y - size * 0.72 - hop,
  );
  ctx.bezierCurveTo(
    x + size * 0.06, y - size * 0.66 - hop,
    x + size * 0.1, y - size * 0.56 - hop,
    x + size * 0.12,
    y - size * 0.55 - hop,
    x + size * 0.07,
    y - size * 0.48 - hop,
  );
  ctx.fill();

  // Horn glow tips
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker * 0.7})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.7 - hop, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.7 - hop, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Smoke wisps rising from horn tips
  for (let horn = -1; horn <= 1; horn += 2) {
    const hornTipX = x + horn * size * 0.08;
    const hornTipY = y - size * 0.7 - hop;
    for (let puff = 0; puff < 3; puff++) {
      const smokePhase = (time * 1.5 + puff * 0.3 + (horn > 0 ? 0.15 : 0)) % 1;
      const smokeX = hornTipX + Math.sin(time * 4 + puff * 2 + horn) * size * 0.03;
      const smokeY = hornTipY - smokePhase * size * 0.2;
      const smokeRadius = size * (0.015 + smokePhase * 0.02) * (1 - smokePhase * 0.5);
      ctx.fillStyle = `rgba(80, 60, 40, ${(1 - smokePhase) * 0.25})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Large mischievous eyes
  ctx.fillStyle = "#0a0502";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08 + cackleBounce,
    y - size * 0.38 - hop,
    size * 0.055,
    size * 0.06,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08 + cackleBounce,
    y - size * 0.38 - hop,
    size * 0.055,
    size * 0.06,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing irises
  ctx.fillStyle = `rgba(254, 243, 199, ${flameFlicker})`;
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08 + cackleBounce,
    y - size * 0.38 - hop,
    size * 0.035,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08 + cackleBounce,
    y - size * 0.38 - hop,
    size * 0.035,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Sinister red pupils
  ctx.fillStyle = "#b91c1c";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08 + cackleBounce,
    y - size * 0.38 - hop,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08 + cackleBounce,
    y - size * 0.38 - hop,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wide cackling grin with fangs
  ctx.fillStyle = "#0a0502";
  ctx.beginPath();
  ctx.ellipse(
    x + cackleBounce,
    y - size * 0.28 - hop,
    size * 0.1,
    size * 0.05 + Math.abs(cackleBounce),
    0,
    0,
    Math.PI,
  );
  ctx.fill();

  // Sharp fangs
  ctx.fillStyle = "#fef3c7";
  // Upper fangs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x - size * 0.05 + cackleBounce, y - size * 0.24 - hop);
  ctx.lineTo(x - size * 0.04 + cackleBounce, y - size * 0.3 - hop);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.06 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x + size * 0.05 + cackleBounce, y - size * 0.24 - hop);
  ctx.lineTo(x + size * 0.04 + cackleBounce, y - size * 0.3 - hop);
  ctx.fill();
  // Lower fangs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03 + cackleBounce, y - size * 0.26 - hop);
  ctx.lineTo(x - size * 0.02 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x - size * 0.01 + cackleBounce, y - size * 0.26 - hop);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.03 + cackleBounce, y - size * 0.26 - hop);
  ctx.lineTo(x + size * 0.02 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x + size * 0.01 + cackleBounce, y - size * 0.26 - hop);
  ctx.fill();

  // Flaming hair/crown
  ctx.fillStyle = bodyColorLight;
  for (let f = 0; f < 5; f++) {
    const fx = x - size * 0.12 + f * size * 0.06 + cackleBounce;
    const fHeight = size * (0.18 + Math.sin(time * 10 + f * 1.5) * 0.06);
    const fWave = Math.sin(time * 8 + f) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.025, y - size * 0.5 - hop);
    ctx.quadraticCurveTo(
      fx + fWave,
      y - size * 0.5 - fHeight - hop,
      fx + size * 0.025,
      y - size * 0.5 - hop,
    );
    ctx.fill();
  }

  // Flame wisps around flames
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker * 0.5})`;
  for (let wisp = 0; wisp < 4; wisp++) {
    const wispX = x + Math.sin(time * 6 + wisp * 1.5) * size * 0.15;
    const wispY =
      y - size * 0.55 - hop - Math.abs(Math.sin(time * 8 + wisp)) * size * 0.15;
    ctx.beginPath();
    ctx.arc(wispX, wispY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flame tail curling behind
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.15 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y + size * 0.22 - hop,
    x + size * 0.22,
    y + size * 0.15 - hop + Math.sin(time * 6) * size * 0.06,
  );
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y + size * 0.08 - hop,
    x + size * 0.25,
    y + size * 0.02 - hop,
  );
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y + size * 0.12 - hop,
    x + size * 0.1,
    y + size * 0.18 - hop,
  );
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y + size * 0.17 - hop,
    x,
    y + size * 0.15 - hop,
  );
  ctx.fill();

  // Tail flame tip
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker})`;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.25,
    y + size * 0.02 - hop + Math.sin(time * 8) * size * 0.03,
    size * 0.035,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Fire ember sparks
  drawEmberSparks(ctx, x, y - size * 0.05 - hop, size * 0.2, time, zoom, {
    color: "rgba(251, 191, 36, 0.5)",
    coreColor: "rgba(255, 255, 200, 0.9)",
    count: 5,
    speed: 2.0,
    maxAlpha: 0.4,
  });

  // Floating ember shards
  drawShiftingSegments(ctx, x, y - size * 0.35 - hop, size, time, zoom, {
    color: "#fb923c",
    colorAlt: "#fbbf24",
    count: 5,
    orbitRadius: 0.22,
    segmentSize: 0.025,
    orbitSpeed: 2.5,
    shape: "shard",
  });

  // Rising embers
  ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + flameFlicker * 0.3})`;
  for (let ember = 0; ember < 6; ember++) {
    const emberPhase = (time * 2 + ember * 0.15) % 1;
    const ex = x + Math.sin(ember * 1.8 + time * 3) * size * 0.25;
    const ey = y - size * 0.3 - hop - emberPhase * size * 0.4;
    const emberSize = size * 0.015 * (1 - emberPhase);
    ctx.beginPath();
    ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Heat aura pulsing halo
  ctx.save();
  const impHeatPulse = 0.5 + Math.sin(time * 3.5) * 0.5;
  const impHeatGrad = ctx.createRadialGradient(
    x, y - size * 0.15 - hop, size * 0.1,
    x, y - size * 0.15 - hop, size * 0.35,
  );
  impHeatGrad.addColorStop(0, `rgba(251, 191, 36, ${impHeatPulse * 0.1})`);
  impHeatGrad.addColorStop(0.5, `rgba(234, 88, 12, ${impHeatPulse * 0.06})`);
  impHeatGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
  ctx.fillStyle = impHeatGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.15 - hop, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Scorched ground trail marks
  ctx.save();
  for (let sc = 0; sc < 3; sc++) {
    const scX = x + Math.sin(sc * 2.5) * size * 0.12;
    const scY = y + size * 0.3;
    const scAlpha = 0.2 + Math.sin(time * 2 + sc) * 0.08;
    ctx.fillStyle = `rgba(120, 50, 10, ${scAlpha})`;
    ctx.beginPath();
    ctx.ellipse(scX, scY, size * 0.06, size * 0.025 * ISO_Y_RATIO, sc * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Dancing flame wisps orbiting body
  ctx.save();
  for (let fw = 0; fw < 4; fw++) {
    const fwAngle = time * 3.5 + fw * Math.PI * 0.5;
    const fwDist = size * (0.18 + Math.sin(time * 2 + fw * 1.5) * 0.04);
    const fwX = x + Math.cos(fwAngle) * fwDist;
    const fwY = y - size * 0.15 - hop + Math.sin(fwAngle * 0.7) * size * 0.12;
    const fwAlpha = flameFlicker * (0.3 + Math.sin(time * 5 + fw) * 0.15);
    const fwSize = size * (0.025 + Math.sin(time * 6 + fw * 2) * 0.01);
    const fwGrad = ctx.createRadialGradient(fwX, fwY, 0, fwX, fwY, fwSize);
    fwGrad.addColorStop(0, `rgba(255, 255, 200, ${fwAlpha})`);
    fwGrad.addColorStop(0.4, `rgba(251, 191, 36, ${fwAlpha * 0.7})`);
    fwGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
    ctx.fillStyle = fwGrad;
    ctx.beginPath();
    ctx.arc(fwX, fwY, fwSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Heat shimmer distortion on body
  ctx.save();
  ctx.globalAlpha = 0.06 + Math.sin(time * 7) * 0.03;
  for (let hs = 0; hs < 3; hs++) {
    const hsOffset = Math.sin(time * 9 + hs * 2.5) * size * 0.02;
    const hsY = y - size * 0.2 - hop + hs * size * 0.1;
    ctx.fillStyle = "rgba(255, 200, 100, 0.08)";
    ctx.beginPath();
    ctx.ellipse(x + hsOffset, hsY, size * 0.2, size * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Swarm speed: flame dash afterimage trail (fading fire body copies)
  ctx.save();
  for (let ai = 0; ai < 3; ai++) {
    const aiOffset = (ai + 1) * size * 0.1 + Math.sin(time * 7 + ai) * size * 0.015;
    const aiScale = 1 - (ai + 1) * 0.14;
    const aiAlpha = [0.15, 0.10, 0.06][ai];
    ctx.globalAlpha = aiAlpha;
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.ellipse(
      x + aiOffset, y - hop + ai * size * 0.01,
      size * 0.1 * aiScale, size * 0.16 * aiScale,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Swarm speed: spark spray particles trailing behind
  ctx.save();
  for (let sp = 0; sp < 6; sp++) {
    const spPhase = (time * 5 + sp * 0.45) % 1.4;
    const spX = x + size * 0.12 + spPhase * size * 0.2;
    const spY = y - hop * 0.5 - size * 0.05 + Math.sin(time * 8 + sp * 2.3) * size * 0.06;
    const spAlpha = Math.max(0, 0.3 - spPhase * 0.2);
    const spR = size * 0.01 * (1 - spPhase * 0.4);
    ctx.fillStyle = `rgba(255, 200, 80, ${spAlpha})`;
    ctx.beginPath();
    ctx.arc(spX, spY, spR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawEmberGuardEnemy(
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
  // EMBER GUARD - Elite infernal knight forged in volcanic fire, wielding a blade of living flame
  const isAttacking = attackPhase > 0;
  const walkCycle = time * 2.2;
  const leftHipAngle = Math.sin(walkCycle) * 0.35;
  const rightHipAngle = Math.sin(walkCycle + Math.PI) * 0.35;
  const leftKneeBend = Math.max(0, Math.sin(walkCycle)) * 0.5;
  const rightKneeBend = Math.max(0, Math.sin(walkCycle + Math.PI)) * 0.5;
  const bodyBob = Math.abs(Math.sin(walkCycle)) * 0.02;
  const flamePulse = 0.6 + Math.sin(time * 2.5) * 0.4;
  const breathe = Math.sin(time * 2) * 0.02 + bodyBob;
  const leftArmSwing = Math.sin(walkCycle + Math.PI) * 0.12;
  const rightArmSwing = Math.sin(walkCycle) * 0.12;
  const swordSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 0.3
    : 0;
  size *= 1.4; // Larger size

  // Intense heat aura
  const heatGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  heatGrad.addColorStop(0, `rgba(251, 191, 36, ${flamePulse * 0.12})`);
  heatGrad.addColorStop(0.5, `rgba(249, 115, 22, ${flamePulse * 0.08})`);
  heatGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.85, size * 0.85 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fire glow pool underneath
  const poolGrad = ctx.createRadialGradient(
    x,
    y + size * 0.48,
    0,
    x,
    y + size * 0.48,
    size * 0.5,
  );
  poolGrad.addColorStop(0, `rgba(251, 191, 36, ${flamePulse * 0.35})`);
  poolGrad.addColorStop(0.5, `rgba(249, 115, 22, ${flamePulse * 0.2})`);
  poolGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.5, size * 0.5 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heat shimmer distortion lines rising from armor
  for (let shimmer = 0; shimmer < 6; shimmer++) {
    const shimmerX = x - size * 0.3 + shimmer * size * 0.12;
    const shimmerPhase = (time * 1.8 + shimmer * 0.17) % 1;
    const shimmerBaseY = y - size * 0.1 - shimmerPhase * size * 0.7;
    const shimmerAlpha = (1 - shimmerPhase) * 0.15;
    ctx.strokeStyle = `rgba(251, 191, 36, ${shimmerAlpha})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(shimmerX, shimmerBaseY);
    ctx.quadraticCurveTo(
      shimmerX + Math.sin(time * 6 + shimmer) * size * 0.04,
      shimmerBaseY - size * 0.05,
      shimmerX + Math.sin(time * 6 + shimmer + 1) * size * 0.04,
      shimmerBaseY - size * 0.1,
    );
    ctx.stroke();
  }

  // Armored heavy marching legs — volcanic plating
  drawPathLegs(ctx, x, y + size * 0.08, size, time, zoom, {
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: "#451a03",
    strideSpeed: 2.2,
    strideAmt: 0.25,
    legLen: 0.22,
    width: 0.07,
    shuffle: false,
    phaseOffset: 0,
    style: 'armored',
  });

  // Ember Guard arms — weapon ready / shield brace
  drawPathArm(ctx, x - size * 0.35, y - size * 0.32, size, time, zoom, -1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#451a03",
    shoulderAngle: -0.5 + Math.sin(time * 1.8) * 0.06,
    elbowAngle: 0.85 + Math.sin(time * 2 + 0.5) * 0.08,
    upperLen: 0.2,
    foreLen: 0.18,
    width: 0.07,
    handRadius: 0.045,
    style: 'armored',
    onWeapon: (wCtx) => {
      const s = size;
      const handY = 0.18 * s;
      const atk = isAttacking ? attackPhase : 0;
      wCtx.translate(0, handY * 0.58);
      wCtx.rotate(0.22);
      const sw = s * 0.24;
      const sh = s * 0.42;
      const fx = -sw * 0.5;
      const fy = -sh;
      const frameGrad = wCtx.createLinearGradient(fx, fy, fx + sw, fy + sh);
      frameGrad.addColorStop(0, "#18181b");
      frameGrad.addColorStop(0.5, "#3f3f46");
      frameGrad.addColorStop(1, "#27272a");
      wCtx.fillStyle = frameGrad;
      wCtx.beginPath();
      wCtx.roundRect(fx - s * 0.018, fy - s * 0.012, sw + s * 0.036, sh + s * 0.028, s * 0.02);
      wCtx.fill();
      const faceGrad = wCtx.createLinearGradient(fx, fy, fx + sw, fy + sh);
      faceGrad.addColorStop(0, "#292524");
      faceGrad.addColorStop(0.35, "#1c1917");
      faceGrad.addColorStop(0.55, "#431407");
      faceGrad.addColorStop(1, "#27272a");
      wCtx.fillStyle = faceGrad;
      wCtx.beginPath();
      wCtx.roundRect(fx, fy, sw, sh, s * 0.012);
      wCtx.fill();
      wCtx.strokeStyle = `rgba(251, 146, 60, ${0.35 + flamePulse * 0.25})`;
      wCtx.lineWidth = Math.max(1, zoom * 1.1);
      wCtx.beginPath();
      wCtx.moveTo(fx + sw * 0.2, fy + sh * 0.25);
      wCtx.quadraticCurveTo(fx + sw * 0.45, fy + sh * 0.5, fx + sw * 0.35, fy + sh * 0.78);
      wCtx.stroke();
      wCtx.beginPath();
      wCtx.moveTo(fx + sw * 0.75, fy + sh * 0.18);
      wCtx.quadraticCurveTo(fx + sw * 0.55, fy + sh * 0.42, fx + sw * 0.68, fy + sh * 0.72);
      wCtx.stroke();
      wCtx.beginPath();
      wCtx.moveTo(fx + sw * 0.5, fy + sh * 0.12);
      wCtx.lineTo(fx + sw * 0.48, fy + sh * 0.88);
      wCtx.stroke();
      const lavaGrad = wCtx.createRadialGradient(
        fx + sw * 0.5, fy + sh * 0.55, 0,
        fx + sw * 0.5, fy + sh * 0.55, sw * 0.55,
      );
      lavaGrad.addColorStop(0, `rgba(254, 243, 199, ${0.45 + atk * 0.2})`);
      lavaGrad.addColorStop(0.35, `rgba(251, 191, 36, ${0.35 + flamePulse * 0.15})`);
      lavaGrad.addColorStop(0.65, `rgba(234, 88, 12, ${0.28})`);
      lavaGrad.addColorStop(1, "rgba(69, 10, 10, 0)");
      wCtx.fillStyle = lavaGrad;
      wCtx.beginPath();
      wCtx.roundRect(fx + sw * 0.06, fy + sh * 0.08, sw * 0.88, sh * 0.84, s * 0.008);
      wCtx.fill();
      wCtx.globalCompositeOperation = "lighter";
      for (let em = 0; em < 5; em++) {
        const emT = (time * 1.4 + em * 0.31) % 1;
        const emX = fx + sw * (0.15 + em * 0.18);
        const emY = fy - emT * s * 0.08;
        wCtx.fillStyle = `rgba(255, 200, 100, ${(1 - emT) * (0.35 + atk * 0.25)})`;
        wCtx.beginPath();
        wCtx.ellipse(emX, emY, s * 0.012, s * 0.02, 0, 0, Math.PI * 2);
        wCtx.fill();
      }
      wCtx.globalCompositeOperation = "source-over";
      for (let h = 0; h < 3; h++) {
        const hPh = (time * 2.2 + h * 0.21) % 1;
        const hx = fx + sw * (0.2 + h * 0.28);
        const hy = fy + sh * 0.15 - hPh * sh * 0.5;
        wCtx.strokeStyle = `rgba(253, 224, 71, ${(1 - hPh) * 0.12})`;
        wCtx.lineWidth = 1 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(hx, hy);
        wCtx.quadraticCurveTo(hx + Math.sin(time * 5 + h) * s * 0.02, hy - sh * 0.06, hx, hy - sh * 0.1);
        wCtx.stroke();
      }
      wCtx.strokeStyle = "#52525b";
      wCtx.lineWidth = Math.max(1, zoom);
      wCtx.strokeRect(fx, fy, sw, sh);
    },
  });
  drawPathArm(ctx, x + size * 0.35, y - size * 0.32, size, time, zoom, 1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#451a03",
    shoulderAngle: 0.8 + Math.sin(time * 2) * 0.08 + (isAttacking ? attackPhase * 0.3 : 0),
    elbowAngle: 0.35 + Math.sin(time * 2.5 + 1.5) * 0.1,
    upperLen: 0.2,
    foreLen: 0.18,
    width: 0.07,
    handRadius: 0.045,
    attackExtra: isAttacking ? attackPhase * 0.3 : 0,
    style: 'armored',
    onWeapon: (wCtx) => {
      const s = size;
      const handY = 0.18 * s;
      const atk = isAttacking ? attackPhase : 0;
      const fireI = 0.55 + flamePulse * 0.35 + atk * 0.45;
      wCtx.translate(0, handY * 0.55);
      wCtx.rotate(-0.15 + swordSwing);
      const bladeTip = -s * 0.62;
      const bladeGuard = -s * 0.07;
      const bladeGrad = wCtx.createLinearGradient(0, bladeGuard, 0, bladeTip);
      bladeGrad.addColorStop(0, "#fed7aa");
      bladeGrad.addColorStop(0.25, "#fb923c");
      bladeGrad.addColorStop(0.55, "#ea580c");
      bladeGrad.addColorStop(0.82, "#b91c1c");
      bladeGrad.addColorStop(1, "#7f1d1d");
      wCtx.fillStyle = bladeGrad;
      wCtx.beginPath();
      wCtx.moveTo(-s * 0.045, bladeGuard);
      wCtx.lineTo(-s * 0.012, bladeTip);
      wCtx.lineTo(s * 0.012, bladeTip);
      wCtx.lineTo(s * 0.045, bladeGuard);
      wCtx.closePath();
      wCtx.fill();
      const edgeGrad = wCtx.createLinearGradient(s * 0.035, bladeGuard, s * 0.055, bladeTip);
      edgeGrad.addColorStop(0, "rgba(255, 237, 180, 0.5)");
      edgeGrad.addColorStop(0.5, `rgba(251, 113, 133, ${0.35 + atk * 0.3})`);
      edgeGrad.addColorStop(1, "rgba(185, 28, 28, 0.15)");
      wCtx.fillStyle = edgeGrad;
      wCtx.beginPath();
      wCtx.moveTo(s * 0.02, bladeGuard);
      wCtx.lineTo(s * 0.035, bladeTip);
      wCtx.lineTo(s * 0.048, bladeGuard);
      wCtx.closePath();
      wCtx.fill();
      const guardGrad = wCtx.createLinearGradient(-s * 0.12, 0, s * 0.12, 0);
      guardGrad.addColorStop(0, "#27272a");
      guardGrad.addColorStop(0.35, "#52525b");
      guardGrad.addColorStop(0.5, "#3f3f46");
      guardGrad.addColorStop(1, "#18181b");
      wCtx.fillStyle = guardGrad;
      wCtx.beginPath();
      wCtx.moveTo(-s * 0.14, bladeGuard + s * 0.02);
      wCtx.lineTo(-s * 0.1, bladeGuard - s * 0.035);
      wCtx.quadraticCurveTo(0, bladeGuard - s * 0.055, s * 0.1, bladeGuard - s * 0.035);
      wCtx.lineTo(s * 0.14, bladeGuard + s * 0.02);
      wCtx.lineTo(s * 0.08, bladeGuard + s * 0.012);
      wCtx.lineTo(-s * 0.08, bladeGuard + s * 0.012);
      wCtx.closePath();
      wCtx.fill();
      for (let g = 0; g < 3; g++) {
        const gx = -s * 0.06 + g * s * 0.06;
        const gemG = wCtx.createRadialGradient(gx, bladeGuard - s * 0.02, 0, gx, bladeGuard - s * 0.02, s * 0.022);
        gemG.addColorStop(0, `rgba(255, 200, 120, ${0.9 * fireI})`);
        gemG.addColorStop(0.5, `rgba(249, 115, 22, ${0.75})`);
        gemG.addColorStop(1, "#7c2d12");
        wCtx.fillStyle = gemG;
        wCtx.beginPath();
        wCtx.arc(gx, bladeGuard - s * 0.02, s * 0.014, 0, Math.PI * 2);
        wCtx.fill();
      }
      wCtx.fillStyle = "#1c1917";
      wCtx.fillRect(-s * 0.022, bladeGuard + s * 0.008, s * 0.044, s * 0.09);
      wCtx.strokeStyle = "#292524";
      wCtx.lineWidth = Math.max(0.6, zoom * 0.7);
      wCtx.strokeRect(-s * 0.022, bladeGuard + s * 0.008, s * 0.044, s * 0.09);
      const pomG = wCtx.createRadialGradient(0, bladeGuard + s * 0.11, 0, 0, bladeGuard + s * 0.11, s * 0.028);
      pomG.addColorStop(0, "#57534e");
      pomG.addColorStop(1, "#0c0a09");
      wCtx.fillStyle = pomG;
      wCtx.beginPath();
      wCtx.arc(0, bladeGuard + s * 0.115, s * 0.022, 0, Math.PI * 2);
      wCtx.fill();
      wCtx.globalCompositeOperation = "lighter";
      for (let p = 0; p < 8; p++) {
        const t = (time * 2.5 + p * 0.13) % 1;
        const py = bladeGuard - t * (bladeGuard - bladeTip);
        const px = s * 0.038 + Math.sin(time * 9 + p) * s * 0.008;
        wCtx.fillStyle = `rgba(255, 180, 80, ${(1 - t) * 0.35 * fireI})`;
        wCtx.beginPath();
        wCtx.arc(px, py, s * 0.006 + t * s * 0.004, 0, Math.PI * 2);
        wCtx.fill();
      }
      wCtx.globalCompositeOperation = "source-over";
    },
  });

  // Articulated armored legs with molten joints
  const thighLen = size * 0.17;
  const shinLen = size * 0.17;
  const legW = size * 0.06;

  // --- Left leg ---
  ctx.save();
  ctx.translate(x - size * 0.17, y + size * 0.05);
  ctx.rotate(leftHipAngle);

  // Left thigh armor plate
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-legW, 0);
  ctx.lineTo(legW, 0);
  ctx.lineTo(legW * 0.85, thighLen);
  ctx.lineTo(-legW * 0.85, thighLen);
  ctx.closePath();
  ctx.fill();

  // Thigh plate rivets
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.arc(-legW * 0.5, thighLen * 0.2, size * 0.012, 0, Math.PI * 2);
  ctx.arc(legW * 0.5, thighLen * 0.2, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Thigh armor band
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-legW, thighLen * 0.45);
  ctx.lineTo(legW, thighLen * 0.45);
  ctx.stroke();

  // Knee joint pivot
  ctx.translate(0, thighLen);

  // Molten knee glow
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.7})`;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 200, ${flamePulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Shin with knee bend
  ctx.save();
  ctx.rotate(leftKneeBend);

  // Left shin armor plate
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-legW * 0.85, 0);
  ctx.lineTo(legW * 0.85, 0);
  ctx.lineTo(legW, shinLen);
  ctx.lineTo(-legW, shinLen);
  ctx.closePath();
  ctx.fill();

  // Shin armor band
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-legW * 0.85, shinLen * 0.5);
  ctx.lineTo(legW * 0.85, shinLen * 0.5);
  ctx.stroke();

  // Shin ember crack
  ctx.strokeStyle = `rgba(249, 115, 22, ${flamePulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, shinLen * 0.15);
  ctx.lineTo(-legW * 0.3, shinLen * 0.6);
  ctx.stroke();

  // Left armored boot — bezier plated boot shape
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, shinLen - size * 0.01);
  ctx.bezierCurveTo(-size * 0.08, shinLen + size * 0.01, -size * 0.07, shinLen + size * 0.05, -size * 0.04, shinLen + size * 0.06);
  ctx.bezierCurveTo(0, shinLen + size * 0.07, size * 0.05, shinLen + size * 0.06, size * 0.08, shinLen + size * 0.03);
  ctx.bezierCurveTo(size * 0.09, shinLen, size * 0.07, shinLen - size * 0.02, size * 0.06, shinLen - size * 0.01);
  ctx.closePath();
  ctx.fill();

  // Boot toe spike
  ctx.fillStyle = "#1a0a02";
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, shinLen);
  ctx.bezierCurveTo(-size * 0.09, shinLen - size * 0.02, -size * 0.12, shinLen - size * 0.04, -size * 0.11, shinLen - size * 0.04);
  ctx.lineTo(-size * 0.05, shinLen - size * 0.01);
  ctx.fill();

  // Boot sole ember glow
  ctx.fillStyle = `rgba(251, 146, 60, ${flamePulse * 0.25})`;
  ctx.beginPath();
  ctx.ellipse(0, shinLen + size * 0.035, size * 0.06, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // left shin
  ctx.restore(); // left leg

  // --- Right leg ---
  ctx.save();
  ctx.translate(x + size * 0.15, y + size * 0.05);
  ctx.rotate(rightHipAngle);

  // Right thigh armor plate
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-legW, 0);
  ctx.lineTo(legW, 0);
  ctx.lineTo(legW * 0.85, thighLen);
  ctx.lineTo(-legW * 0.85, thighLen);
  ctx.closePath();
  ctx.fill();

  // Thigh plate rivets
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.arc(-legW * 0.5, thighLen * 0.2, size * 0.012, 0, Math.PI * 2);
  ctx.arc(legW * 0.5, thighLen * 0.2, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Thigh armor band
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-legW, thighLen * 0.45);
  ctx.lineTo(legW, thighLen * 0.45);
  ctx.stroke();

  // Knee joint pivot
  ctx.translate(0, thighLen);

  // Molten knee glow
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.7})`;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 200, ${flamePulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Shin with knee bend
  ctx.save();
  ctx.rotate(rightKneeBend);

  // Right shin armor plate
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-legW * 0.85, 0);
  ctx.lineTo(legW * 0.85, 0);
  ctx.lineTo(legW, shinLen);
  ctx.lineTo(-legW, shinLen);
  ctx.closePath();
  ctx.fill();

  // Shin armor band
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-legW * 0.85, shinLen * 0.5);
  ctx.lineTo(legW * 0.85, shinLen * 0.5);
  ctx.stroke();

  // Shin ember crack
  ctx.strokeStyle = `rgba(249, 115, 22, ${flamePulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, shinLen * 0.15);
  ctx.lineTo(legW * 0.3, shinLen * 0.6);
  ctx.stroke();

  // Right armored boot — bezier plated boot shape
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, shinLen - size * 0.01);
  ctx.bezierCurveTo(-size * 0.08, shinLen + size * 0.01, -size * 0.07, shinLen + size * 0.05, -size * 0.04, shinLen + size * 0.06);
  ctx.bezierCurveTo(0, shinLen + size * 0.07, size * 0.05, shinLen + size * 0.06, size * 0.08, shinLen + size * 0.03);
  ctx.bezierCurveTo(size * 0.09, shinLen, size * 0.07, shinLen - size * 0.02, size * 0.06, shinLen - size * 0.01);
  ctx.closePath();
  ctx.fill();

  // Boot toe spike
  ctx.fillStyle = "#1a0a02";
  ctx.beginPath();
  ctx.moveTo(size * 0.07, shinLen);
  ctx.lineTo(size * 0.11, shinLen - size * 0.04);
  ctx.lineTo(size * 0.05, shinLen - size * 0.01);
  ctx.fill();

  // Boot sole ember glow
  ctx.fillStyle = `rgba(251, 146, 60, ${flamePulse * 0.25})`;
  ctx.beginPath();
  ctx.ellipse(0, shinLen + size * 0.035, size * 0.06, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // right shin
  ctx.restore(); // right leg

  drawHipGarb(ctx, x, y + size * 0.04, size, zoom, time, 'plates', bodyColorDark, '#1a0a02');

  // Massive armored torso — volcanic stone bezier armor with lava veins
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.35, y - size * 0.35,
    x + size * 0.35, y + size * 0.1,
  );
  armorGrad.addColorStop(0, bodyColorDark);
  armorGrad.addColorStop(0.3, bodyColor);
  armorGrad.addColorStop(0.6, bodyColorDark);
  armorGrad.addColorStop(1, "#451a03");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.1);
  ctx.bezierCurveTo(
    x - size * 0.36, y + size * 0.02,
    x - size * 0.4, y - size * 0.08 + breathe * size,
    x - size * 0.38, y - size * 0.15 + breathe * size,
  );
  ctx.bezierCurveTo(
    x - size * 0.38, y - size * 0.25,
    x - size * 0.36, y - size * 0.32,
    x - size * 0.3, y - size * 0.38,
  );
  ctx.bezierCurveTo(
    x - size * 0.22, y - size * 0.43,
    x - size * 0.1, y - size * 0.46,
    x, y - size * 0.45 + breathe * size,
  );
  ctx.bezierCurveTo(
    x + size * 0.1, y - size * 0.46,
    x + size * 0.22, y - size * 0.43,
    x + size * 0.3, y - size * 0.38,
  );
  ctx.bezierCurveTo(
    x + size * 0.36, y - size * 0.32,
    x + size * 0.38, y - size * 0.25,
    x + size * 0.38, y - size * 0.15 + breathe * size,
  );
  ctx.bezierCurveTo(
    x + size * 0.4, y - size * 0.08 + breathe * size,
    x + size * 0.36, y + size * 0.02,
    x + size * 0.32, y + size * 0.1,
  );
  ctx.closePath();
  ctx.fill();

  // Lava vein structural lines on chest armor
  ctx.strokeStyle = `rgba(249, 115, 22, ${flamePulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.35);
  ctx.bezierCurveTo(x - size * 0.22, y - size * 0.2, x - size * 0.18, y - size * 0.05, x - size * 0.25, y + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.35);
  ctx.bezierCurveTo(x + size * 0.22, y - size * 0.2, x + size * 0.18, y - size * 0.05, x + size * 0.25, y + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.42);
  ctx.bezierCurveTo(x - size * 0.05, y - size * 0.3, x + size * 0.05, y - size * 0.15, x + size * 0.1, y + size * 0.05);
  ctx.stroke();
  // Chest plate segment line
  ctx.strokeStyle = "#1a0a02";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.22);
  ctx.bezierCurveTo(x - size * 0.15, y - size * 0.24, x + size * 0.15, y - size * 0.24, x + size * 0.35, y - size * 0.22);
  ctx.stroke();

  // Horizontal armor bands
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.28);
  ctx.lineTo(x + size * 0.25, y - size * 0.28);
  ctx.moveTo(x - size * 0.22, y - size * 0.12);
  ctx.lineTo(x + size * 0.22, y - size * 0.12);
  ctx.stroke();

  // Sparking rivet effects on armor
  const sparkTime = (time * 3) % 4;
  const activeRivet = Math.floor(sparkTime);
  const sparkProgress = sparkTime - activeRivet;
  const rivetPositions: [number, number][] = [
    [x - size * 0.28, y - size * 0.28],
    [x + size * 0.28, y - size * 0.28],
    [x - size * 0.25, y - size * 0.12],
    [x + size * 0.25, y - size * 0.12],
  ];
  if (sparkProgress < 0.4) {
    const sparkAlpha = (0.4 - sparkProgress) * 2.5;
    const [rx, ry] = rivetPositions[activeRivet];
    ctx.fillStyle = `rgba(255, 255, 200, ${sparkAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(251, 191, 36, ${sparkAlpha * 0.6})`;
    for (let sp = 0; sp < 3; sp++) {
      const spAngle = sp * (Math.PI * 2 / 3) + time * 8;
      const spDist = sparkProgress * size * 0.12;
      ctx.beginPath();
      ctx.arc(
        rx + Math.cos(spAngle) * spDist,
        ry + Math.sin(spAngle) * spDist + sparkProgress * size * 0.03,
        Math.max(0.001, size * 0.008 * (1 - sparkProgress * 2)),
        0, Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Glowing infernal core in chest
  const coreGrad = ctx.createRadialGradient(
    x,
    y - size * 0.2,
    0,
    x,
    y - size * 0.2,
    size * 0.15,
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 200, ${flamePulse})`);
  coreGrad.addColorStop(0.3, `rgba(251, 191, 36, ${flamePulse * 0.9})`);
  coreGrad.addColorStop(0.6, `rgba(249, 115, 22, ${flamePulse * 0.6})`);
  coreGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
  ctx.fillStyle = coreGrad;
  setShadowBlur(ctx, 15 * zoom * flamePulse, "#fbbf24");
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Core rune symbol
  ctx.strokeStyle = `rgba(255, 255, 200, ${flamePulse * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.lineTo(x, y - size * 0.12);
  ctx.moveTo(x - size * 0.06, y - size * 0.2);
  ctx.lineTo(x + size * 0.06, y - size * 0.2);
  ctx.stroke();

  // Heavily armored arms with walk swing
  ctx.fillStyle = bodyColor;
  // Left arm (swings opposite to left leg)
  const leftSwingOff = leftArmSwing * size;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.32);
  ctx.quadraticCurveTo(
    x - size * 0.48,
    y - size * 0.2 + leftSwingOff * 0.5,
    x - size * 0.45,
    y + size * 0.05 + leftSwingOff,
  );
  ctx.lineTo(x - size * 0.35, y + size * 0.05 + leftSwingOff);
  ctx.quadraticCurveTo(
    x - size * 0.38,
    y - size * 0.15 + leftSwingOff * 0.5,
    x - size * 0.32,
    y - size * 0.28,
  );
  ctx.fill();
  // Right arm (sword arm - swings with walk, raised when attacking)
  const rightSwingOff = rightArmSwing * size;
  const armRaise = swordSwing * size * 0.2;
  const rightArmOff = armRaise - rightSwingOff;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.32);
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y - size * 0.25 - rightArmOff,
    x + size * 0.48,
    y - size * 0.05 - rightArmOff,
  );
  ctx.lineTo(x + size * 0.38, y - size * 0.05 - rightArmOff);
  ctx.quadraticCurveTo(
    x + size * 0.4,
    y - size * 0.2 - rightArmOff,
    x + size * 0.32,
    y - size * 0.28,
  );
  ctx.fill();

  // Arm armor details
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y - size * 0.15);
  ctx.lineTo(x - size * 0.38, y - size * 0.15);
  ctx.moveTo(x + size * 0.44, y - size * 0.15 - armRaise);
  ctx.lineTo(x + size * 0.4, y - size * 0.15 - armRaise);
  ctx.stroke();

  // Massive spiked pauldrons
  ctx.fillStyle = bodyColorDark;
  // Left pauldron
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.4,
    y - size * 0.35,
    size * 0.15,
    size * 0.1,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Right pauldron
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.4,
    y - size * 0.35 - armRaise * 0.3,
    size * 0.15,
    size * 0.1,
    0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Pauldron spikes
  ctx.fillStyle = "#1a0a02";
  // Left spikes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.48, y - size * 0.38);
  ctx.lineTo(x - size * 0.55, y - size * 0.48);
  ctx.lineTo(x - size * 0.45, y - size * 0.4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y - size * 0.42);
  ctx.lineTo(x - size * 0.45, y - size * 0.52);
  ctx.lineTo(x - size * 0.38, y - size * 0.44);
  ctx.fill();
  // Right spikes
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y - size * 0.38 - armRaise * 0.3);
  ctx.lineTo(x + size * 0.55, y - size * 0.48 - armRaise * 0.3);
  ctx.lineTo(x + size * 0.45, y - size * 0.4 - armRaise * 0.3);
  ctx.fill();

  // Gauntlets with clawed fingers
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(x - size * 0.44, y + size * 0.08, size * 0.08, 0, Math.PI * 2);
  ctx.arc(
    x + size * 0.46,
    y + size * 0.0 - armRaise,
    size * 0.08,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Gauntlet claws
  ctx.fillStyle = "#1a0a02";
  for (let claw = 0; claw < 4; claw++) {
    // Left hand
    const lClawAngle = 0.3 + claw * 0.25;
    ctx.beginPath();
    ctx.moveTo(
      x - size * 0.44 + Math.cos(lClawAngle) * size * 0.06,
      y + size * 0.08 + Math.sin(lClawAngle) * size * 0.06,
    );
    ctx.lineTo(
      x - size * 0.44 + Math.cos(lClawAngle) * size * 0.12,
      y + size * 0.08 + Math.sin(lClawAngle) * size * 0.1,
    );
    ctx.lineTo(
      x - size * 0.44 + Math.cos(lClawAngle + 0.1) * size * 0.06,
      y + size * 0.08 + Math.sin(lClawAngle + 0.1) * size * 0.06,
    );
    ctx.fill();
  }

  // Imposing helmet with face guard
  const helmetGrad = ctx.createLinearGradient(
    x,
    y - size * 0.7,
    x,
    y - size * 0.45,
  );
  helmetGrad.addColorStop(0, bodyColorDark);
  helmetGrad.addColorStop(0.5, bodyColor);
  helmetGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = helmetGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Helmet face plate
  ctx.fillStyle = "#1a0a02";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55);
  ctx.lineTo(x - size * 0.18, y - size * 0.45);
  ctx.lineTo(x - size * 0.12, y - size * 0.4);
  ctx.lineTo(x, y - size * 0.38);
  ctx.lineTo(x + size * 0.12, y - size * 0.4);
  ctx.lineTo(x + size * 0.18, y - size * 0.45);
  ctx.lineTo(x + size * 0.15, y - size * 0.55);
  ctx.closePath();
  ctx.fill();

  // Helmet crest/plume
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.72);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y - size * 0.65,
    x - size * 0.06,
    y - size * 0.52,
  );
  ctx.lineTo(x + size * 0.06, y - size * 0.52);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.65, x, y - size * 0.72);
  ctx.fill();

  // Crest flame effect
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.72);
  ctx.quadraticCurveTo(
    x + Math.sin(time * 8) * size * 0.05,
    y - size * 0.82,
    x,
    y - size * 0.9 + Math.sin(time * 6) * size * 0.05,
  );
  ctx.quadraticCurveTo(
    x - Math.sin(time * 8) * size * 0.05,
    y - size * 0.8,
    x,
    y - size * 0.72,
  );
  ctx.fill();

  // Helmet horns
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.6);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    y - size * 0.65,
    x - size * 0.3,
    y - size * 0.75,
  );
  ctx.lineTo(x - size * 0.24, y - size * 0.65);
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y - size * 0.58,
    x - size * 0.16,
    y - size * 0.55,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.6);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y - size * 0.65,
    x + size * 0.3,
    y - size * 0.75,
  );
  ctx.lineTo(x + size * 0.24, y - size * 0.65);
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y - size * 0.58,
    x + size * 0.16,
    y - size * 0.55,
  );
  ctx.fill();

  // Visor slit with burning eyes
  ctx.fillStyle = "#050202";
  ctx.fillRect(x - size * 0.13, y - size * 0.55, size * 0.26, size * 0.08);

  // Fierce glowing eyes behind visor
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse})`;
  setShadowBlur(ctx, 10 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07,
    y - size * 0.51,
    size * 0.035,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.07,
    y - size * 0.51,
    size * 0.035,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Fire breathing from visor when attacking
  if (isAttacking && attackPhase > 0.5) {
    ctx.fillStyle = `rgba(251, 191, 36, ${(attackPhase - 0.5) * 1.2})`;
    for (let breath = 0; breath < 4; breath++) {
      const bx = x + Math.sin(time * 12 + breath) * size * 0.1;
      const bDist = (attackPhase - 0.5) * 2 * size * 0.3;
      const by = y - size * 0.48 + bDist;
      ctx.beginPath();
      ctx.arc(bx, by, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // FLAMING GREATSWORD
  // Sword hilt/handle
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y - size * 0.05 - armRaise);
  ctx.lineTo(x + size * 0.52, y + size * 0.15 - armRaise);
  ctx.lineTo(x + size * 0.46, y + size * 0.15 - armRaise);
  ctx.closePath();
  ctx.fill();

  // Sword crossguard
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.49,
    y - size * 0.08 - armRaise,
    size * 0.08,
    size * 0.03,
    0.2 - swordSwing,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Blade base (metal)
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.46, y - size * 0.1 - armRaise);
  ctx.lineTo(
    x + size * 0.55,
    y - size * 0.45 - armRaise - swordSwing * size * 0.2,
  );
  ctx.lineTo(x + size * 0.52, y - size * 0.1 - armRaise);
  ctx.closePath();
  ctx.fill();

  // Blade molten edge
  const bladeGrad = ctx.createLinearGradient(
    x + size * 0.46,
    y - size * 0.1 - armRaise,
    x + size * 0.55,
    y - size * 0.45 - armRaise,
  );
  bladeGrad.addColorStop(0, `rgba(251, 191, 36, ${flamePulse})`);
  bladeGrad.addColorStop(0.5, `rgba(254, 243, 199, ${flamePulse})`);
  bladeGrad.addColorStop(1, `rgba(251, 191, 36, ${flamePulse * 0.8})`);
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.47, y - size * 0.12 - armRaise);
  ctx.lineTo(
    x + size * 0.54,
    y - size * 0.43 - armRaise - swordSwing * size * 0.2,
  );
  ctx.lineTo(x + size * 0.51, y - size * 0.12 - armRaise);
  ctx.closePath();
  ctx.fill();

  // Blade fire aura
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.5})`;
  setShadowBlur(ctx, 12 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.moveTo(x + size * 0.45, y - size * 0.15 - armRaise);
  ctx.quadraticCurveTo(
    x + size * 0.6 + Math.sin(time * 8) * size * 0.04,
    y - size * 0.3 - armRaise - swordSwing * size * 0.1,
    x + size * 0.53,
    y - size * 0.48 - armRaise - swordSwing * size * 0.2,
  );
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y - size * 0.35 - armRaise - swordSwing * size * 0.15,
    x + size * 0.45,
    y - size * 0.15 - armRaise,
  );
  ctx.fill();
  clearShadow(ctx);

  // Blade embers
  ctx.fillStyle = `rgba(255, 255, 200, ${flamePulse * 0.8})`;
  for (let ember = 0; ember < 5; ember++) {
    const emberPhase = (time * 2 + ember * 0.2) % 1;
    const emberX =
      x + size * 0.5 + Math.sin(ember * 2 + time * 6) * size * 0.08;
    const emberY = y - size * 0.15 - armRaise - emberPhase * size * 0.35;
    ctx.beginPath();
    ctx.arc(emberX, emberY, size * 0.015 * (1 - emberPhase), 0, Math.PI * 2);
    ctx.fill();
  }

  // Molten ember sparks
  drawEmberSparks(ctx, x, y - size * 0.2, size * 0.25, time, zoom, {
    color: "rgba(249, 115, 22, 0.5)",
    coreColor: "rgba(255, 220, 160, 0.85)",
    count: 7,
    speed: 1.0,
    maxAlpha: 0.4,
    sparkSize: 0.06,
  });

  // Floating obsidian armor segments
  drawShiftingSegments(ctx, x, y - size * 0.15, size, time, zoom, {
    color: "#1a0a02",
    colorAlt: "#451a03",
    count: 5,
    orbitRadius: 0.4,
    segmentSize: 0.04,
    orbitSpeed: 0.8,
    shape: "diamond",
  });


  // Rising heat from armor
  ctx.fillStyle = `rgba(251, 146, 60, ${0.3 + Math.sin(time * 3) * 0.15})`;
  for (let heat = 0; heat < 4; heat++) {
    const hx = x + Math.sin(heat * 1.5 + time * 2) * size * 0.2;
    const heatPhase = (time * 1.5 + heat * 0.25) % 1;
    const hy = y - size * 0.3 - heatPhase * size * 0.3;
    ctx.beginPath();
    ctx.arc(hx, hy, size * 0.03 * (1 - heatPhase * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  // Lava crack glow veins on armor
  ctx.save();
  ctx.lineWidth = 1.5 * zoom;
  for (let lv = 0; lv < 6; lv++) {
    const lvStartX = x - size * 0.18 + lv * size * 0.07;
    const lvStartY = y - size * 0.25 + Math.sin(lv * 1.8) * size * 0.12;
    const lvEndX = lvStartX + Math.sin(time * 1.5 + lv * 0.8) * size * 0.05;
    const lvEndY = lvStartY + size * 0.1;
    const lvGrad = ctx.createLinearGradient(lvStartX, lvStartY, lvEndX, lvEndY);
    lvGrad.addColorStop(0, `rgba(255, 255, 200, ${flamePulse * 0.45})`);
    lvGrad.addColorStop(0.5, `rgba(251, 191, 36, ${flamePulse * 0.35})`);
    lvGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
    ctx.strokeStyle = lvGrad;
    ctx.beginPath();
    ctx.moveTo(lvStartX, lvStartY);
    ctx.quadraticCurveTo(
      lvStartX + size * 0.02, lvStartY + size * 0.05,
      lvEndX, lvEndY,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Magma drip from armor joints
  ctx.save();
  for (let mj = 0; mj < 4; mj++) {
    const mjPhase = (time * 1.0 + mj * 0.25) % 1;
    const mjX = x + (mj - 1.5) * size * 0.12;
    const mjY = y - size * 0.05 + mjPhase * size * 0.2;
    const mjAlpha = (1 - mjPhase) * flamePulse * 0.5;
    const mjSize = size * 0.015 * (1 - mjPhase * 0.4);
    ctx.fillStyle = `rgba(251, 191, 36, ${mjAlpha})`;
    ctx.beginPath();
    ctx.ellipse(mjX, mjY, mjSize * 0.7, mjSize * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const mjGlowGrad = ctx.createRadialGradient(mjX, mjY, 0, mjX, mjY, mjSize * 2);
    mjGlowGrad.addColorStop(0, `rgba(251, 146, 60, ${mjAlpha * 0.4})`);
    mjGlowGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
    ctx.fillStyle = mjGlowGrad;
    ctx.beginPath();
    ctx.arc(mjX, mjY, mjSize * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Molten ground cracks beneath
  ctx.save();
  ctx.strokeStyle = `rgba(251, 191, 36, ${flamePulse * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let gc = 0; gc < 4; gc++) {
    const gcAngle = gc * Math.PI * 0.5 + 0.4;
    const gcLen = size * (0.2 + Math.sin(gc * 2) * 0.05);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(gcAngle) * size * 0.2, y + size * 0.46);
    ctx.lineTo(
      x + Math.cos(gcAngle) * gcLen,
      y + size * 0.46 + Math.sin(gcAngle * 0.4) * size * 0.04,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Volcanic ember cascade from weapon tip
  ctx.save();
  for (let ec = 0; ec < 5; ec++) {
    const ecPhase = (time * 1.2 + ec * 0.2) % 1;
    const ecX = x + size * 0.45 + Math.sin(ec * 2 + time * 4) * size * 0.06;
    const ecY = y - size * 0.2 - ecPhase * size * 0.25;
    const ecAlpha = (1 - ecPhase) * flamePulse * 0.5;
    const ecSize = size * 0.012 * (1 - ecPhase * 0.5);
    const ecGrad = ctx.createRadialGradient(ecX, ecY, 0, ecX, ecY, ecSize * 2);
    ecGrad.addColorStop(0, `rgba(255, 255, 200, ${ecAlpha})`);
    ecGrad.addColorStop(0.5, `rgba(251, 191, 36, ${ecAlpha * 0.6})`);
    ecGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
    ctx.fillStyle = ecGrad;
    ctx.beginPath();
    ctx.arc(ecX, ecY, ecSize * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Armor plate heat pulse glow
  ctx.save();
  const armorPulse = 0.5 + Math.sin(time * 2) * 0.3;
  for (let ap = 0; ap < 3; ap++) {
    const apX = x + (ap - 1) * size * 0.15;
    const apY = y - size * 0.2 + ap * size * 0.08;
    const apGrad = ctx.createRadialGradient(apX, apY, 0, apX, apY, size * 0.06);
    apGrad.addColorStop(0, `rgba(251, 191, 36, ${armorPulse * flamePulse * 0.2})`);
    apGrad.addColorStop(0.5, `rgba(249, 115, 22, ${armorPulse * flamePulse * 0.1})`);
    apGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
    ctx.fillStyle = apGrad;
    ctx.beginPath();
    ctx.arc(apX, apY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
