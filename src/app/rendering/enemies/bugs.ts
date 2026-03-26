// Bug enemy sprites - Insect and arachnid enemies across all regions

import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import { drawRadialAura } from "./helpers";

// =====================================================
// SHARED BUG RENDERING HELPERS
// =====================================================

function drawBugLeg(
  ctx: CanvasRenderingContext2D,
  baseX: number, baseY: number,
  midX: number, midY: number,
  endX: number, endY: number,
  width: number, zoom: number,
  color: string, colorDark: string,
  jointSize: number,
) {
  const femurGrad = ctx.createLinearGradient(baseX, baseY, midX, midY);
  femurGrad.addColorStop(0, color);
  femurGrad.addColorStop(1, colorDark);
  ctx.strokeStyle = femurGrad;
  ctx.lineWidth = width * zoom * 1.15;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  const femNx = -(midY - baseY);
  const femNy = midX - baseX;
  const femLen = Math.sqrt(femNx * femNx + femNy * femNy) || 1;
  ctx.quadraticCurveTo(
    (baseX + midX) / 2 + (femNx / femLen) * width * zoom * 0.4,
    (baseY + midY) / 2 + (femNy / femLen) * width * zoom * 0.4,
    midX, midY,
  );
  ctx.stroke();

  const tibiaGrad = ctx.createLinearGradient(midX, midY, endX, endY);
  tibiaGrad.addColorStop(0, colorDark);
  tibiaGrad.addColorStop(1, color);
  ctx.strokeStyle = tibiaGrad;
  ctx.lineWidth = width * zoom * 0.75;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  const tibNx = -(endY - midY);
  const tibNy = endX - midX;
  const tibLen = Math.sqrt(tibNx * tibNx + tibNy * tibNy) || 1;
  ctx.quadraticCurveTo(
    (midX + endX) / 2 - (tibNx / tibLen) * width * zoom * 0.25,
    (midY + endY) / 2 - (tibNy / tibLen) * width * zoom * 0.25,
    endX, endY,
  );
  ctx.stroke();

  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.arc(midX, midY, jointSize * 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(midX, midY, jointSize * 0.5, 0, Math.PI * 2);
  ctx.fill();

  const footDir = Math.atan2(endY - midY, endX - midX);
  const clawLen = jointSize * 1.4;
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = width * zoom * 0.35;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX + Math.cos(footDir + 0.5) * clawLen, endY + Math.sin(footDir + 0.5) * clawLen);
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX + Math.cos(footDir - 0.5) * clawLen, endY + Math.sin(footDir - 0.5) * clawLen);
  ctx.stroke();
}

function drawSpiderLegs(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  bodyColor: string, bodyColorDark: string,
  legCount: number = 4,
  crawlSpeed: number = 5,
) {
  const angles = [-0.6, -0.2, 0.2, 0.6];
  const lengths = [0.4, 0.45, 0.45, 0.38];
  const crawl = time * crawlSpeed;
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < legCount; leg++) {
      const gaitOffset = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawl + gaitOffset);
      const lift = Math.max(0, stride);
      const a = angles[leg];
      const l = lengths[leg];

      const bx = x + side * (size * 0.1 + leg * size * 0.06);
      const by = y + leg * size * 0.04;
      const mx = bx + side * size * 0.18 + side * stride * size * 0.02;
      const my = by + a * size * 0.12 - size * 0.05 - lift * size * 0.08;
      const ex = bx + side * size * l + stride * size * 0.04 * a;
      const ey = by + a * size * 0.3 + size * 0.18 - lift * size * 0.03;

      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 3.5, zoom, bodyColor, bodyColorDark, size * 0.025);

      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 0.7 * zoom;
      for (let h = 0; h < 2; h++) {
        const ht = 0.3 + h * 0.3;
        const hx = bx + (mx - bx) * ht;
        const hy = by + (my - by) * ht;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + side * size * 0.02, hy - size * 0.025);
        ctx.stroke();
      }
    }
  }
}

function drawInsectWings(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  time: number, zoom: number,
  wingColor: string, wingAlpha: number = 0.4,
  flapSpeed: number = 12,
  wingSpan: number = 0.5,
) {
  const flapAngle = Math.sin(time * flapSpeed) * 0.6;
  const wingW = size * wingSpan;
  const wingH = size * 0.25;
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.05, y - size * 0.05);
    ctx.scale(side, 1);
    ctx.rotate(flapAngle * side * 0.5);
    const wAlpha = wingAlpha + Math.sin(time * 3) * 0.1;
    ctx.fillStyle = `rgba(${wingColor}, ${wAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      wingW * 0.15, -wingH * 0.9,
      wingW * 0.65, -wingH * 1.1,
      wingW * 0.85, -wingH * 0.5,
    );
    ctx.bezierCurveTo(
      wingW * 0.95, -wingH * 0.1,
      wingW * 0.9, wingH * 0.3,
      wingW * 0.6, wingH * 0.4,
    );
    ctx.bezierCurveTo(
      wingW * 0.3, wingH * 0.45,
      wingW * 0.08, wingH * 0.2,
      0, 0,
    );
    ctx.fill();

    ctx.strokeStyle = `rgba(${wingColor}, ${wAlpha * 0.5})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wingW * 0.2, -wingH * 0.3, wingW * 0.5, -wingH * 0.4, wingW * 0.82, -wingH * 0.35);
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wingW * 0.15, -wingH * 0.05, wingW * 0.45, -wingH * 0.1, wingW * 0.75, wingH * 0.05);
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wingW * 0.1, wingH * 0.15, wingW * 0.3, wingH * 0.25, wingW * 0.55, wingH * 0.3);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${wingColor}, ${wAlpha * 0.25})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(wingW * 0.3, -wingH * 0.6);
    ctx.bezierCurveTo(wingW * 0.35, -wingH * 0.2, wingW * 0.4, wingH * 0.0, wingW * 0.4, wingH * 0.25);
    ctx.moveTo(wingW * 0.6, -wingH * 0.65);
    ctx.bezierCurveTo(wingW * 0.62, -wingH * 0.3, wingW * 0.63, wingH * 0.0, wingW * 0.6, wingH * 0.3);
    ctx.stroke();

    ctx.restore();
  }
}

// =====================================================
// GRASSLAND BUGS
// =====================================================

export function drawOrbWeaverEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const breathe = Math.sin(time * 2) * 0.02;
  size *= 1.4;

  // Web silk trail behind
  ctx.strokeStyle = `rgba(200, 200, 210, ${0.15 + Math.sin(time * 1.5) * 0.05})`;
  ctx.lineWidth = 1 * zoom;
  for (let w = 0; w < 5; w++) {
    const wx = x + Math.sin(time * 0.5 + w * 1.2) * size * 0.3;
    const wy = y + size * 0.35 + w * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(wx - size * 0.15, wy);
    ctx.quadraticCurveTo(wx, wy - size * 0.03, wx + size * 0.15, wy);
    ctx.stroke();
  }

  // Legs (8 spider legs with crawling gait)
  drawSpiderLegs(ctx, x, y, size, time, zoom, bodyColor, bodyColorDark, 4, 4.5);

  // Underbelly (visible beneath the abdomen for depth)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.12);
  ctx.bezierCurveTo(x - size * 0.2, y + size * 0.28, x + size * 0.2, y + size * 0.28, x + size * 0.22, y + size * 0.12);
  ctx.bezierCurveTo(x + size * 0.15, y + size * 0.18, x - size * 0.15, y + size * 0.18, x - size * 0.22, y + size * 0.12);
  ctx.fill();

  // Abdomen (organic bezier shape with taper)
  const abdCx = x;
  const abdCy = y + size * 0.1;
  const abdW = size * (0.32 + breathe);
  const abdH = size * (0.28 + breathe);
  const abdGrad = ctx.createRadialGradient(abdCx, abdCy, 0, abdCx, abdCy, size * 0.35);
  abdGrad.addColorStop(0, bodyColorLight);
  abdGrad.addColorStop(0.5, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.moveTo(abdCx, abdCy - abdH);
  ctx.bezierCurveTo(abdCx + abdW * 0.7, abdCy - abdH * 1.05, abdCx + abdW * 1.1, abdCy - abdH * 0.3, abdCx + abdW * 0.95, abdCy + abdH * 0.1);
  ctx.bezierCurveTo(abdCx + abdW * 0.85, abdCy + abdH * 0.6, abdCx + abdW * 0.5, abdCy + abdH * 1.1, abdCx, abdCy + abdH * 1.05);
  ctx.bezierCurveTo(abdCx - abdW * 0.5, abdCy + abdH * 1.1, abdCx - abdW * 0.85, abdCy + abdH * 0.6, abdCx - abdW * 0.95, abdCy + abdH * 0.1);
  ctx.bezierCurveTo(abdCx - abdW * 1.1, abdCy - abdH * 0.3, abdCx - abdW * 0.7, abdCy - abdH * 1.05, abdCx, abdCy - abdH);
  ctx.fill();
  // Abdomen segment ridges
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  for (let seg = 0; seg < 4; seg++) {
    const segY = abdCy - abdH * 0.5 + seg * abdH * 0.35;
    const segW = abdW * (0.85 - Math.abs(seg - 1.5) * 0.12);
    ctx.beginPath();
    ctx.moveTo(abdCx - segW, segY);
    ctx.quadraticCurveTo(abdCx, segY + abdH * 0.06, abdCx + segW, segY);
    ctx.stroke();
  }
  // Abdomen cross pattern (orb weaver marking)
  ctx.strokeStyle = "#c4a35a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y + size * 0.1);
  ctx.lineTo(x + size * 0.1, y + size * 0.1);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + size * 0.2);
  ctx.stroke();
  // Chevron markings with bezier curves
  for (let m = 0; m < 3; m++) {
    const my = y + size * 0.02 + m * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, my + size * 0.01);
    ctx.quadraticCurveTo(x - size * 0.04, my - size * 0.02, x, my - size * 0.035);
    ctx.quadraticCurveTo(x + size * 0.04, my - size * 0.02, x + size * 0.1, my + size * 0.01);
    ctx.stroke();
  }
  // Chitin surface texture dots
  ctx.fillStyle = `rgba(0, 0, 0, 0.08)`;
  for (let td = 0; td < 8; td++) {
    const tdA = td * 0.8 + 0.5;
    const tdR = size * (0.08 + Math.sin(td * 1.7) * 0.04);
    ctx.beginPath();
    ctx.arc(abdCx + Math.cos(tdA) * tdR, abdCy + Math.sin(tdA) * tdR * 0.8, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cephalothorax (angular, shield-shaped)
  const headCx = x;
  const headCy = y - size * 0.15;
  const headGrad = ctx.createRadialGradient(headCx, headCy, 0, headCx, headCy, size * 0.2);
  headGrad.addColorStop(0, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(headCx, headCy - size * 0.14);
  ctx.bezierCurveTo(headCx + size * 0.12, headCy - size * 0.14, headCx + size * 0.2, headCy - size * 0.06, headCx + size * 0.18, headCy + size * 0.04);
  ctx.bezierCurveTo(headCx + size * 0.15, headCy + size * 0.12, headCx + size * 0.06, headCy + size * 0.15, headCx, headCy + size * 0.13);
  ctx.bezierCurveTo(headCx - size * 0.06, headCy + size * 0.15, headCx - size * 0.15, headCy + size * 0.12, headCx - size * 0.18, headCy + size * 0.04);
  ctx.bezierCurveTo(headCx - size * 0.2, headCy - size * 0.06, headCx - size * 0.12, headCy - size * 0.14, headCx, headCy - size * 0.14);
  ctx.fill();
  // Cephalothorax fovea (center groove)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headCx, headCy - size * 0.08);
  ctx.lineTo(headCx, headCy + size * 0.06);
  ctx.stroke();

  // Pedipalps (small feeler appendages flanking the mouth)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.08, y - size * 0.22);
    ctx.quadraticCurveTo(
      x + side * size * 0.12, y - size * 0.26,
      x + side * size * 0.1, y - size * 0.29,
    );
    ctx.stroke();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(x + side * size * 0.1, y - size * 0.29, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chelicerae (fangs)
  const fangSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * size * 0.05 : 0;
  ctx.fillStyle = "#1a0a05";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.28);
    ctx.bezierCurveTo(
      x + side * (size * 0.09 + fangSpread), y - size * 0.3,
      x + side * (size * 0.11 + fangSpread), y - size * 0.36,
      x + side * (size * 0.04 + fangSpread * 0.5), y - size * 0.4,
    );
    ctx.bezierCurveTo(
      x + side * (size * 0.02 + fangSpread * 0.2), y - size * 0.37,
      x + side * size * 0.02, y - size * 0.32,
      x + side * size * 0.03, y - size * 0.3,
    );
    ctx.fill();
  }
  // Venom drip from fangs
  ctx.fillStyle = `rgba(120, 200, 80, ${0.6 + Math.sin(time * 4) * 0.3})`;
  setShadowBlur(ctx, 6 * zoom, "#78c850");
  ctx.beginPath();
  ctx.arc(x - size * 0.04, y - size * 0.39, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.04, y - size * 0.39, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Eyes (8 eyes in typical spider arrangement)
  const eyeGlow = 0.6 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = "#0a0505";
  // Main pair
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.2, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.2, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  // Secondary pairs
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.17, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.17, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x - size * 0.12, y - size * 0.14, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.12, y - size * 0.14, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = `rgba(180, 30, 30, ${eyeGlow})`;
  setShadowBlur(ctx, 4 * zoom, "#b41e1e");
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.2, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.2, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Spinnerets (silk production at rear — multi-nozzle)
  ctx.fillStyle = bodyColorDark;
  for (let sp = -1; sp <= 1; sp++) {
    ctx.beginPath();
    ctx.moveTo(x + sp * size * 0.03, y + size * 0.3);
    ctx.bezierCurveTo(
      x + sp * size * 0.05, y + size * 0.33,
      x + sp * size * 0.04, y + size * 0.37,
      x + sp * size * 0.02, y + size * 0.38,
    );
    ctx.bezierCurveTo(
      x + sp * size * 0.0, y + size * 0.37,
      x + sp * size * 0.01, y + size * 0.33,
      x + sp * size * 0.03, y + size * 0.3,
    );
    ctx.fill();
  }
  // Active silk thread
  const silkAlpha = 0.3 + Math.sin(time * 3) * 0.15;
  ctx.strokeStyle = `rgba(220, 220, 230, ${silkAlpha})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.quadraticCurveTo(x + Math.sin(time) * size * 0.1, y + size * 0.45, x + Math.sin(time * 0.5) * size * 0.2, y + size * 0.5);
  ctx.stroke();

  // Attack: silk spray
  if (isAttacking) {
    for (let s = 0; s < 8; s++) {
      const sa = (s / 8) * Math.PI * 2 + time;
      const sd = attackPhase * size * 0.5;
      const salpha = (1 - attackPhase) * 0.5;
      ctx.fillStyle = `rgba(220, 220, 230, ${salpha})`;
      ctx.beginPath();
      ctx.arc(x + Math.cos(sa) * sd, y - size * 0.3 + Math.sin(sa) * sd * 0.5, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Enhancement: Chitinous abdomen shimmer
  ctx.save();
  const owShimX = x + Math.cos(time * 2) * size * 0.15;
  const owShimGrad = ctx.createRadialGradient(owShimX, y + size * 0.08, 0, owShimX, y + size * 0.08, size * 0.12);
  owShimGrad.addColorStop(0, `rgba(255, 255, 230, ${0.2 + Math.sin(time * 3) * 0.1})`);
  owShimGrad.addColorStop(1, "rgba(255, 255, 230, 0)");
  ctx.fillStyle = owShimGrad;
  ctx.beginPath();
  ctx.ellipse(owShimX, y + size * 0.08, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Eye cluster glow (individual per-eye radial gradients)
  ctx.save();
  const owEyeSpots = [
    [-0.05, -0.2, 0.035], [0.05, -0.2, 0.035],
    [-0.1, -0.17, 0.02], [0.1, -0.17, 0.02],
    [-0.12, -0.14, 0.015], [0.12, -0.14, 0.015],
  ];
  for (let oe = 0; oe < owEyeSpots.length; oe++) {
    const owEpx = x + owEyeSpots[oe][0] * size;
    const owEpy = y + owEyeSpots[oe][1] * size;
    const owEr = owEyeSpots[oe][2] * size * 2.5;
    const owEyeGrad = ctx.createRadialGradient(owEpx, owEpy, 0, owEpx, owEpy, owEr);
    owEyeGrad.addColorStop(0, `rgba(200, 30, 30, ${0.3 + Math.sin(time * 3 + oe * 0.8) * 0.15})`);
    owEyeGrad.addColorStop(1, "rgba(200, 30, 30, 0)");
    ctx.fillStyle = owEyeGrad;
    ctx.beginPath();
    ctx.arc(owEpx, owEpy, owEr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Web strands extending from spinnerets
  ctx.save();
  ctx.strokeStyle = `rgba(210, 210, 225, ${0.14 + Math.sin(time * 1.2) * 0.06})`;
  ctx.lineWidth = 0.6 * zoom;
  for (let ws = 0; ws < 4; ws++) {
    const wsA = (ws / 4) * Math.PI * 0.6 + Math.PI * 0.7;
    const wsL = size * (0.38 + Math.sin(time * 0.7 + ws) * 0.05);
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.33);
    ctx.quadraticCurveTo(
      x + Math.cos(wsA) * wsL * 0.5, y + size * 0.33 + Math.sin(wsA) * wsL * 0.4,
      x + Math.cos(wsA) * wsL, y + size * 0.33 + Math.sin(wsA) * wsL * 0.5,
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function drawMantisEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const sway = Math.sin(time * 3) * 0.03;
  size *= 1.3;

  // Walking legs (4 rear legs)
  const crawl = time * 6;
  const legAngles = [0.15, 0.45];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 2; leg++) {
      const gait = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawl + gait);
      const lift = Math.max(0, stride);
      const a = legAngles[leg];
      const bx = x + side * size * 0.08;
      const by = y + size * 0.05 + leg * size * 0.1;
      const mx = bx + side * size * 0.15;
      const my = by + a * size * 0.1 - lift * size * 0.06;
      const ex = bx + side * size * 0.3;
      const ey = by + a * size * 0.25 + size * 0.15 - lift * size * 0.02;
      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 3, zoom, bodyColor, bodyColorDark, size * 0.02);
    }
  }

  // Elongated abdomen (tapered organic shape with segment lines)
  const mAbdGrad = ctx.createLinearGradient(x, y, x, y + size * 0.4);
  mAbdGrad.addColorStop(0, bodyColor);
  mAbdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = mAbdGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.08);
  ctx.bezierCurveTo(x + size * 0.1, y - size * 0.06, x + size * 0.13, y + size * 0.05, x + size * 0.11, y + size * 0.18);
  ctx.bezierCurveTo(x + size * 0.09, y + size * 0.32, x + size * 0.04, y + size * 0.4, x, y + size * 0.42);
  ctx.bezierCurveTo(x - size * 0.04, y + size * 0.4, x - size * 0.09, y + size * 0.32, x - size * 0.11, y + size * 0.18);
  ctx.bezierCurveTo(x - size * 0.13, y + size * 0.05, x - size * 0.1, y - size * 0.06, x, y - size * 0.08);
  ctx.fill();
  // Abdomen segment lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let seg = 0; seg < 5; seg++) {
    const segY = y + seg * size * 0.08;
    const segW = size * (0.1 - Math.abs(seg - 2) * 0.015);
    ctx.beginPath();
    ctx.moveTo(x - segW, segY);
    ctx.quadraticCurveTo(x, segY + size * 0.015, x + segW, segY);
    ctx.stroke();
  }

  // Thorax (prothorax — shield-like)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.16);
  ctx.bezierCurveTo(x + size * 0.1, y - size * 0.16, x + size * 0.15, y - size * 0.08, x + size * 0.13, y);
  ctx.bezierCurveTo(x + size * 0.1, y + size * 0.06, x + size * 0.04, y + size * 0.07, x, y + size * 0.06);
  ctx.bezierCurveTo(x - size * 0.04, y + size * 0.07, x - size * 0.1, y + size * 0.06, x - size * 0.13, y);
  ctx.bezierCurveTo(x - size * 0.15, y - size * 0.08, x - size * 0.1, y - size * 0.16, x, y - size * 0.16);
  ctx.fill();
  // Thorax center ridge + lateral plate lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.14);
  ctx.lineTo(x, y + size * 0.04);
  ctx.stroke();
  ctx.lineWidth = 0.8 * zoom;
  for (let tSide = -1; tSide <= 1; tSide += 2) {
    ctx.beginPath();
    ctx.moveTo(x + tSide * size * 0.04, y - size * 0.12);
    ctx.quadraticCurveTo(x + tSide * size * 0.08, y - size * 0.06, x + tSide * size * 0.06, y + size * 0.02);
    ctx.stroke();
  }
  // Thorax surface stipple
  ctx.fillStyle = `rgba(0, 0, 0, 0.06)`;
  for (let ts = 0; ts < 6; ts++) {
    const tsA = ts * 1.1 + 0.5;
    const tsR = size * 0.06;
    ctx.beginPath();
    ctx.arc(x + Math.cos(tsA) * tsR * 0.8, y - size * 0.06 + Math.sin(tsA) * tsR * 0.5, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Triangular head (rotatable — bezier-curved)
  ctx.save();
  ctx.translate(x, y - size * 0.22);
  ctx.rotate(sway);
  const headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(1, bodyColor);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.15);
  ctx.bezierCurveTo(size * 0.06, -size * 0.14, size * 0.12, -size * 0.04, size * 0.13, size * 0.02);
  ctx.bezierCurveTo(size * 0.1, size * 0.04, size * 0.03, size * 0.04, 0, size * 0.03);
  ctx.bezierCurveTo(-size * 0.03, size * 0.04, -size * 0.1, size * 0.04, -size * 0.13, size * 0.02);
  ctx.bezierCurveTo(-size * 0.12, -size * 0.04, -size * 0.06, -size * 0.14, 0, -size * 0.15);
  ctx.fill();
  // Compound eyes
  ctx.fillStyle = `rgba(200, 255, 100, ${0.7 + Math.sin(time * 4) * 0.3})`;
  setShadowBlur(ctx, 5 * zoom, "#c8ff64");
  ctx.beginPath();
  ctx.ellipse(-size * 0.07, -size * 0.05, size * 0.04, size * 0.05, -0.3, 0, Math.PI * 2);
  ctx.ellipse(size * 0.07, -size * 0.05, size * 0.04, size * 0.05, 0.3, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  // Raptorial forelegs (scythe arms) - the main feature
  const strikeAngle = isAttacking ? Math.sin(attackPhase * Math.PI * 4) * 0.8 : Math.sin(time * 2) * 0.15;
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.12, y - size * 0.1);
    // Upper arm (coxa/trochanter)
    const armAngle = side * (-0.6 + strikeAngle * side);
    ctx.rotate(armAngle);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-size * 0.025, 0, size * 0.05, size * 0.2);
    // Spines on upper arm
    ctx.fillStyle = bodyColorDark;
    for (let sp = 0; sp < 3; sp++) {
      ctx.beginPath();
      ctx.moveTo(side * size * 0.025, size * 0.04 + sp * size * 0.05);
      ctx.lineTo(side * size * 0.06, size * 0.06 + sp * size * 0.05);
      ctx.lineTo(side * size * 0.025, size * 0.08 + sp * size * 0.05);
      ctx.fill();
    }
    // Lower arm (tibia - the scythe blade with curved taper)
    ctx.translate(0, size * 0.2);
    const bladeAngle = isAttacking ? -1.2 - attackPhase * 1.5 : -0.8 + Math.sin(time * 2.5) * 0.2;
    ctx.rotate(bladeAngle);
    const bladeGrad = ctx.createLinearGradient(0, 0, 0, size * 0.24);
    bladeGrad.addColorStop(0, bodyColor);
    bladeGrad.addColorStop(0.7, "#2a1a05");
    bladeGrad.addColorStop(1, "#1a0a00");
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, 0);
    ctx.bezierCurveTo(-size * 0.028, size * 0.06, -size * 0.022, size * 0.14, -size * 0.008, size * 0.24);
    ctx.lineTo(size * 0.008, size * 0.24);
    ctx.bezierCurveTo(size * 0.025, size * 0.16, size * 0.028, size * 0.08, size * 0.025, 0);
    ctx.closePath();
    ctx.fill();
    // Serrated edge teeth (bezier-curved)
    ctx.fillStyle = "#1a0a00";
    for (let t = 0; t < 6; t++) {
      const ty = size * 0.025 + t * size * 0.032;
      const toothW = size * (0.022 - t * 0.002);
      ctx.beginPath();
      ctx.moveTo(-size * 0.025, ty);
      ctx.quadraticCurveTo(-size * 0.025 - toothW, ty + size * 0.012, -size * 0.025, ty + size * 0.024);
      ctx.lineTo(-size * 0.02, ty + size * 0.02);
      ctx.lineTo(-size * 0.02, ty + size * 0.004);
      ctx.fill();
    }
    // Blade spine ridge (center line)
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.02);
    ctx.lineTo(-size * 0.005, size * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  // Wing cases (folded — elongated leaf shapes)
  ctx.fillStyle = `rgba(${bodyColor === "#65a30d" ? "120, 180, 30" : "100, 160, 20"}, 0.3)`;
  for (let wSide = -1; wSide <= 1; wSide += 2) {
    ctx.beginPath();
    ctx.moveTo(x + wSide * size * 0.02, y - size * 0.1);
    ctx.bezierCurveTo(
      x + wSide * size * 0.08, y - size * 0.08,
      x + wSide * size * 0.1, y + size * 0.08,
      x + wSide * size * 0.07, y + size * 0.22,
    );
    ctx.bezierCurveTo(
      x + wSide * size * 0.04, y + size * 0.24,
      x + wSide * size * 0.01, y + size * 0.12,
      x + wSide * size * 0.02, y - size * 0.1,
    );
    ctx.fill();
    // Wing case vein
    ctx.strokeStyle = `rgba(${bodyColor === "#65a30d" ? "80, 140, 20" : "70, 120, 10"}, 0.3)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + wSide * size * 0.03, y - size * 0.06);
    ctx.lineTo(x + wSide * size * 0.06, y + size * 0.18);
    ctx.stroke();
  }

  // Attack slash effect
  if (isAttacking) {
    ctx.strokeStyle = `rgba(200, 255, 100, ${attackPhase * 0.7})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.15, size * 0.35, -Math.PI * 0.7, -Math.PI * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - size * 0.15, size * 0.35, Math.PI * 0.3 - Math.PI, Math.PI * 0.7 - Math.PI);
    ctx.stroke();
  }

  // Enhancement: Abdomen segment shimmer wave
  ctx.save();
  const mShimPos = y - size * 0.05 + Math.sin(time * 2.5) * size * 0.2;
  const mShimGrad = ctx.createRadialGradient(x, mShimPos, 0, x, mShimPos, size * 0.1);
  mShimGrad.addColorStop(0, `rgba(180, 255, 80, ${0.16 + Math.sin(time * 3) * 0.08})`);
  mShimGrad.addColorStop(1, "rgba(180, 255, 80, 0)");
  ctx.fillStyle = mShimGrad;
  ctx.beginPath();
  ctx.ellipse(x, mShimPos, size * 0.12, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Blade tip venom glow
  ctx.save();
  for (let mSide = -1; mSide <= 1; mSide += 2) {
    const mTipX = x + mSide * size * 0.15;
    const mTipY = y + size * 0.1;
    const mTipGrad = ctx.createRadialGradient(mTipX, mTipY, 0, mTipX, mTipY, size * 0.06);
    mTipGrad.addColorStop(0, `rgba(200, 255, 100, ${0.28 + Math.sin(time * 4 + mSide) * 0.12})`);
    mTipGrad.addColorStop(1, "rgba(200, 255, 100, 0)");
    ctx.fillStyle = mTipGrad;
    ctx.beginPath();
    ctx.arc(mTipX, mTipY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Predator eye pulse aura
  ctx.save();
  const mEyeAura = ctx.createRadialGradient(x, y - size * 0.22, 0, x, y - size * 0.22, size * 0.1);
  mEyeAura.addColorStop(0, `rgba(200, 255, 100, ${0.18 + Math.sin(time * 4) * 0.08})`);
  mEyeAura.addColorStop(1, "rgba(200, 255, 100, 0)");
  ctx.fillStyle = mEyeAura;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.22, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBombardierBeetleEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const breathe = Math.sin(time * 2) * 0.015;
  size *= 1.25;

  // Legs (6 beetle legs)
  const crawl = time * 4;
  const legAngleSet = [-0.4, 0, 0.4];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 3; leg++) {
      const gait = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawl + gait);
      const lift = Math.max(0, stride);
      const a = legAngleSet[leg];
      const bx = x + side * size * 0.12;
      const by = y + size * 0.02 + leg * size * 0.08;
      const mx = bx + side * size * 0.18;
      const my = by + a * size * 0.08 - lift * size * 0.06;
      const ex = bx + side * size * 0.32;
      const ey = by + a * size * 0.2 + size * 0.14 - lift * size * 0.02;
      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 4, zoom, bodyColor, bodyColorDark, size * 0.025);
    }
  }

  // Underbelly (dark ventral plate visible beneath elytra)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y + size * 0.02);
  ctx.bezierCurveTo(x - size * 0.14, y + size * 0.2, x + size * 0.14, y + size * 0.2, x + size * 0.16, y + size * 0.02);
  ctx.bezierCurveTo(x + size * 0.1, y + size * 0.1, x - size * 0.1, y + size * 0.1, x - size * 0.16, y + size * 0.02);
  ctx.fill();

  // Abdomen (chemical chamber — rounded with taper, glows when attacking)
  const chamberGlow = isAttacking ? 0.6 + attackPhase * 0.4 : 0.2 + Math.sin(time * 2) * 0.1;
  const bbAbdW = size * (0.28 + breathe);
  const bbAbdH = size * (0.22 + breathe);
  const bbAbdY = y + size * 0.08;
  const bbAbdGrad = ctx.createRadialGradient(x, bbAbdY, 0, x, bbAbdY, size * 0.28);
  bbAbdGrad.addColorStop(0, `rgba(255, 120, 30, ${chamberGlow})`);
  bbAbdGrad.addColorStop(0.4, bodyColor);
  bbAbdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bbAbdGrad;
  ctx.beginPath();
  ctx.moveTo(x, bbAbdY - bbAbdH);
  ctx.bezierCurveTo(x + bbAbdW * 0.8, bbAbdY - bbAbdH, x + bbAbdW * 1.05, bbAbdY - bbAbdH * 0.3, x + bbAbdW, bbAbdY);
  ctx.bezierCurveTo(x + bbAbdW * 0.95, bbAbdY + bbAbdH * 0.5, x + bbAbdW * 0.5, bbAbdY + bbAbdH * 1.05, x, bbAbdY + bbAbdH);
  ctx.bezierCurveTo(x - bbAbdW * 0.5, bbAbdY + bbAbdH * 1.05, x - bbAbdW * 0.95, bbAbdY + bbAbdH * 0.5, x - bbAbdW, bbAbdY);
  ctx.bezierCurveTo(x - bbAbdW * 1.05, bbAbdY - bbAbdH * 0.3, x - bbAbdW * 0.8, bbAbdY - bbAbdH, x, bbAbdY - bbAbdH);
  ctx.fill();
  // Abdomen tergite ridges
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let tr = 0; tr < 3; tr++) {
    const trY = bbAbdY - bbAbdH * 0.3 + tr * bbAbdH * 0.4;
    const trW = bbAbdW * (0.9 - tr * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - trW, trY);
    ctx.quadraticCurveTo(x, trY + bbAbdH * 0.08, x + trW, trY);
    ctx.stroke();
  }

  // Elytra (wing cases — proper beetle shell shape with ridges)
  const sheenPhase = Math.sin(time * 2.5) * 0.5 + 0.5;
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.01, y - size * 0.2);
    ctx.bezierCurveTo(
      x + side * size * 0.1, y - size * 0.22,
      x + side * size * 0.17, y - size * 0.12,
      x + side * size * 0.16, y + size * 0.02,
    );
    ctx.bezierCurveTo(
      x + side * size * 0.14, y + size * 0.14,
      x + side * size * 0.08, y + size * 0.2,
      x + side * size * 0.01, y + size * 0.18,
    );
    ctx.bezierCurveTo(
      x + side * size * 0.005, y + size * 0.05,
      x + side * size * 0.005, y - size * 0.1,
      x + side * size * 0.01, y - size * 0.2,
    );
    ctx.fill();
    // Elytra longitudinal ridges
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.18);
    ctx.bezierCurveTo(x + side * size * 0.09, y - size * 0.05, x + side * size * 0.08, y + size * 0.08, x + side * size * 0.05, y + size * 0.16);
    ctx.stroke();
    // Metallic highlight
    ctx.fillStyle = `rgba(100, 180, 255, ${sheenPhase * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.03, y - size * 0.15);
    ctx.bezierCurveTo(x + side * size * 0.07, y - size * 0.14, x + side * size * 0.08, y - size * 0.04, x + side * size * 0.05, y + size * 0.04);
    ctx.bezierCurveTo(x + side * size * 0.03, y - size * 0.02, x + side * size * 0.02, y - size * 0.1, x + side * size * 0.03, y - size * 0.15);
    ctx.fill();
  }
  // Elytra seam (center split line)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x, y + size * 0.15);
  ctx.stroke();
  // Elytra puncture marks (rows of tiny dots on shell)
  ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
  for (let elSide = -1; elSide <= 1; elSide += 2) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const px = x + elSide * size * (0.04 + col * 0.04);
        const py = y - size * 0.14 + row * size * 0.07;
        ctx.beginPath();
        ctx.arc(px, py, size * 0.006, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Pronotum (shield — trapezoidal with bezier edges)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.14);
  ctx.bezierCurveTo(x - size * 0.16, y - size * 0.18, x - size * 0.08, y - size * 0.26, x, y - size * 0.26);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.26, x + size * 0.16, y - size * 0.18, x + size * 0.12, y - size * 0.14);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.12, x - size * 0.08, y - size * 0.12, x - size * 0.12, y - size * 0.14);
  ctx.fill();
  // Pronotum ridge
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.17);
  ctx.quadraticCurveTo(x, y - size * 0.2, x + size * 0.1, y - size * 0.17);
  ctx.stroke();

  // Head (slightly wider than long with clypeus)
  const bbHGrad = ctx.createRadialGradient(x, y - size * 0.28, 0, x, y - size * 0.28, size * 0.12);
  bbHGrad.addColorStop(0, bodyColor);
  bbHGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bbHGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.36);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.36, x + size * 0.12, y - size * 0.3, x + size * 0.11, y - size * 0.25);
  ctx.bezierCurveTo(x + size * 0.1, y - size * 0.2, x + size * 0.05, y - size * 0.19, x, y - size * 0.2);
  ctx.bezierCurveTo(x - size * 0.05, y - size * 0.19, x - size * 0.1, y - size * 0.2, x - size * 0.11, y - size * 0.25);
  ctx.bezierCurveTo(x - size * 0.12, y - size * 0.3, x - size * 0.08, y - size * 0.36, x, y - size * 0.36);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const aSway = Math.sin(time * 3 + side) * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.33);
    ctx.quadraticCurveTo(
      x + side * size * 0.15 + aSway * size, y - size * 0.4,
      x + side * size * 0.2 + aSway * size, y - size * 0.45,
    );
    ctx.stroke();
  }

  // Mandibles (curved pincer shapes with inner teeth)
  ctx.fillStyle = "#1a1510";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.35);
    ctx.bezierCurveTo(
      x + side * size * 0.06, y - size * 0.38,
      x + side * size * 0.09, y - size * 0.41,
      x + side * size * 0.08, y - size * 0.43,
    );
    ctx.bezierCurveTo(
      x + side * size * 0.06, y - size * 0.42,
      x + side * size * 0.03, y - size * 0.39,
      x + side * size * 0.02, y - size * 0.37,
    );
    ctx.fill();
    // Mandible inner tooth
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.05, y - size * 0.39);
    ctx.lineTo(x + side * size * 0.035, y - size * 0.41);
    ctx.lineTo(x + side * size * 0.04, y - size * 0.385);
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = `rgba(255, 200, 50, ${0.7 + Math.sin(time * 3) * 0.3})`;
  setShadowBlur(ctx, 4 * zoom, "#ffc832");
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.3, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.3, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Acid spray nozzle at rear (tapered tube shape)
  ctx.fillStyle = `rgba(255, 100, 20, ${chamberGlow})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y + size * 0.25);
  ctx.bezierCurveTo(x - size * 0.04, y + size * 0.28, x - size * 0.025, y + size * 0.32, x, y + size * 0.33);
  ctx.bezierCurveTo(x + size * 0.025, y + size * 0.32, x + size * 0.04, y + size * 0.28, x + size * 0.03, y + size * 0.25);
  ctx.fill();
  // Nozzle rim
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.33, size * 0.015, 0, Math.PI * 2);
  ctx.stroke();

  // Attack: acid blast
  if (isAttacking) {
    const sprayDist = attackPhase * size * 0.6;
    const sprayAlpha = (1 - attackPhase) * 0.7;
    ctx.fillStyle = `rgba(255, 120, 20, ${sprayAlpha})`;
    for (let p = 0; p < 10; p++) {
      const pa = (p / 10) * Math.PI * 0.5 - Math.PI * 0.25 + Math.PI;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(pa) * sprayDist * (0.8 + Math.sin(p * 1.3) * 0.2),
        y + size * 0.28 + Math.sin(pa) * sprayDist * 0.3,
        size * 0.025 * (1 - attackPhase * 0.5),
        0, Math.PI * 2,
      );
      ctx.fill();
    }
    // Acid splash ring
    ctx.strokeStyle = `rgba(200, 255, 50, ${sprayAlpha * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.28, sprayDist * 0.5, sprayDist * 0.5 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Enhancement: Carapace traveling shimmer
  ctx.save();
  const bbShimX = x + Math.cos(time * 1.8) * size * 0.13;
  const bbShimY = y - size * 0.02 + Math.sin(time * 1.2) * size * 0.07;
  const bbShimGrad = ctx.createRadialGradient(bbShimX, bbShimY, 0, bbShimX, bbShimY, size * 0.1);
  bbShimGrad.addColorStop(0, `rgba(150, 210, 255, ${0.2 + Math.sin(time * 2.5) * 0.1})`);
  bbShimGrad.addColorStop(1, "rgba(150, 210, 255, 0)");
  ctx.fillStyle = bbShimGrad;
  ctx.beginPath();
  ctx.ellipse(bbShimX, bbShimY, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Acid droplets dripping from nozzle
  ctx.save();
  for (let ad = 0; ad < 3; ad++) {
    const adPhase = (time * 1.5 + ad * 0.8) % 2;
    const adY2 = y + size * 0.3 + adPhase * size * 0.12;
    const adAlpha = Math.max(0, 0.45 - adPhase * 0.22);
    const adX2 = x + Math.sin(ad * 2.3) * size * 0.04;
    const adGrad = ctx.createRadialGradient(adX2, adY2, 0, adX2, adY2, size * 0.02);
    adGrad.addColorStop(0, `rgba(180, 255, 50, ${adAlpha})`);
    adGrad.addColorStop(1, "rgba(180, 255, 50, 0)");
    ctx.fillStyle = adGrad;
    ctx.beginPath();
    ctx.arc(adX2, adY2, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Ground chemical haze
  ctx.save();
  const bbHazeGrad = ctx.createRadialGradient(x, y + size * 0.2, 0, x, y + size * 0.2, size * 0.35);
  bbHazeGrad.addColorStop(0, `rgba(180, 220, 80, ${0.1 + Math.sin(time * 2) * 0.05})`);
  bbHazeGrad.addColorStop(1, "rgba(180, 220, 80, 0)");
  ctx.fillStyle = bbHazeGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 0.35, size * 0.35 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// =====================================================
// SWAMP BUGS
// =====================================================

export function drawMosquitoEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  size *= 1.2;

  // Translucent wings (fast flapping)
  drawInsectWings(ctx, x, y, size, time, zoom, "180, 200, 220", 0.25, 20, 0.45);

  // Dangling legs (segmented with knee joints and tarsal hooks)
  for (let leg = 0; leg < 6; leg++) {
    const lx = x + (leg - 2.5) * size * 0.06;
    const dangle = Math.sin(time * 4 + leg * 0.8) * size * 0.03;
    const kneeX = lx + dangle * 0.6;
    const kneeY = y + size * 0.18;
    const footX = lx + dangle * 1.5;
    const footY = y + size * 0.35;
    // Femur
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(lx, y + size * 0.05);
    ctx.quadraticCurveTo(lx + dangle * 0.3, y + size * 0.11, kneeX, kneeY);
    ctx.stroke();
    // Tibia
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.quadraticCurveTo(kneeX + dangle * 0.4, y + size * 0.27, footX, footY);
    ctx.stroke();
    // Knee dot
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
    // Tarsal hook
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(footX, footY);
    ctx.lineTo(footX + size * 0.01, footY + size * 0.015);
    ctx.stroke();
  }

  // Abdomen (bloated sack shape — tapered at rear)
  const bloat = isAttacking ? 0.02 : Math.sin(time * 1.5) * 0.01;
  const mqAbdW = size * (0.1 + bloat);
  const mqAbdH = size * (0.2 + bloat);
  const mqAbdY = y + size * 0.05;
  const mqAbdGrad = ctx.createRadialGradient(x, mqAbdY, 0, x, mqAbdY, size * 0.18);
  mqAbdGrad.addColorStop(0, bodyColorLight);
  mqAbdGrad.addColorStop(0.6, bodyColor);
  mqAbdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = mqAbdGrad;
  ctx.beginPath();
  ctx.moveTo(x, mqAbdY - mqAbdH);
  ctx.bezierCurveTo(x + mqAbdW * 0.8, mqAbdY - mqAbdH * 0.9, x + mqAbdW * 1.1, mqAbdY - mqAbdH * 0.2, x + mqAbdW * 1.05, mqAbdY + mqAbdH * 0.1);
  ctx.bezierCurveTo(x + mqAbdW * 0.9, mqAbdY + mqAbdH * 0.6, x + mqAbdW * 0.3, mqAbdY + mqAbdH * 1.05, x, mqAbdY + mqAbdH * 1.1);
  ctx.bezierCurveTo(x - mqAbdW * 0.3, mqAbdY + mqAbdH * 1.05, x - mqAbdW * 0.9, mqAbdY + mqAbdH * 0.6, x - mqAbdW * 1.05, mqAbdY + mqAbdH * 0.1);
  ctx.bezierCurveTo(x - mqAbdW * 1.1, mqAbdY - mqAbdH * 0.2, x - mqAbdW * 0.8, mqAbdY - mqAbdH * 0.9, x, mqAbdY - mqAbdH);
  ctx.fill();
  // Abdomen segment bands
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let bs = 0; bs < 4; bs++) {
    const bsY = mqAbdY - mqAbdH * 0.5 + bs * mqAbdH * 0.4;
    const bsW = mqAbdW * (0.8 + 0.15 * Math.sin(bs * 1.2));
    ctx.beginPath();
    ctx.moveTo(x - bsW, bsY);
    ctx.quadraticCurveTo(x, bsY + mqAbdH * 0.04, x + bsW, bsY);
    ctx.stroke();
  }

  // Thorax (humped, compact)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.03);
  ctx.bezierCurveTo(x - size * 0.1, y - size * 0.1, x - size * 0.06, y - size * 0.16, x, y - size * 0.16);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.16, x + size * 0.1, y - size * 0.1, x + size * 0.08, y - size * 0.03);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.01, x - size * 0.04, y - size * 0.01, x - size * 0.08, y - size * 0.03);
  ctx.fill();

  // Head (rounded with prominent mouthparts area)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.26);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.26, x + size * 0.08, y - size * 0.22, x + size * 0.07, y - size * 0.18);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.15, x + size * 0.02, y - size * 0.14, x, y - size * 0.15);
  ctx.bezierCurveTo(x - size * 0.02, y - size * 0.14, x - size * 0.06, y - size * 0.15, x - size * 0.07, y - size * 0.18);
  ctx.bezierCurveTo(x - size * 0.08, y - size * 0.22, x - size * 0.06, y - size * 0.26, x, y - size * 0.26);
  ctx.fill();

  // Compound eyes (large)
  ctx.fillStyle = `rgba(200, 50, 50, ${0.7 + Math.sin(time * 3) * 0.3})`;
  setShadowBlur(ctx, 4 * zoom, "#c83232");
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.22, size * 0.04, size * 0.035, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.22, size * 0.04, size * 0.035, 0.3, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Proboscis (long segmented needle with labrum sheath)
  const probAngle = isAttacking ? -Math.PI * 0.5 - 0.3 : -Math.PI * 0.5 + Math.sin(time * 2) * 0.1;
  ctx.save();
  ctx.translate(x, y - size * 0.25);
  ctx.rotate(probAngle);
  // Labrum sheath (outer casing, tapered)
  ctx.fillStyle = "#3a2a20";
  ctx.beginPath();
  ctx.moveTo(-size * 0.012, 0);
  ctx.bezierCurveTo(-size * 0.01, -size * 0.06, -size * 0.006, -size * 0.12, -size * 0.003, -size * 0.16);
  ctx.lineTo(size * 0.003, -size * 0.16);
  ctx.bezierCurveTo(size * 0.006, -size * 0.12, size * 0.01, -size * 0.06, size * 0.012, 0);
  ctx.fill();
  // Inner stylet (the piercing needle, thinner)
  ctx.strokeStyle = "#1a0a05";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.15);
  ctx.lineTo(0, -size * 0.27);
  ctx.stroke();
  // Proboscis tip
  ctx.fillStyle = isAttacking ? `rgba(200, 30, 30, ${0.8})` : "#2a1a10";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.27);
  ctx.lineTo(-size * 0.006, -size * 0.255);
  ctx.lineTo(size * 0.006, -size * 0.255);
  ctx.fill();
  // Labrum segment marks
  ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
  ctx.lineWidth = 0.6 * zoom;
  for (let ps = 0; ps < 3; ps++) {
    const psy = -size * 0.04 - ps * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(-size * 0.008, psy);
    ctx.lineTo(size * 0.008, psy);
    ctx.stroke();
  }
  ctx.restore();

  // Antennae (feathery)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const aSway = Math.sin(time * 4 + side * 2) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.25);
    ctx.quadraticCurveTo(
      x + side * size * 0.12, y - size * 0.35 + aSway * size,
      x + side * size * 0.15, y - size * 0.4 + aSway * size,
    );
    ctx.stroke();
    // Feathery branches
    for (let f = 0; f < 3; f++) {
      const fx = x + side * size * (0.06 + f * 0.03);
      const fy = y - size * (0.28 + f * 0.04);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + side * size * 0.03, fy - size * 0.02);
      ctx.stroke();
    }
  }

  // Blood drip when attacking
  if (isAttacking) {
    for (let d = 0; d < 3; d++) {
      const dPhase = (attackPhase + d * 0.3) % 1;
      ctx.fillStyle = `rgba(180, 20, 20, ${(1 - dPhase) * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.45 + dPhase * size * 0.3, size * 0.01, size * 0.02, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Enhancement: Wing membrane glow pulse
  ctx.save();
  const mqWingGlow = ctx.createRadialGradient(x, y - size * 0.05, 0, x, y - size * 0.05, size * 0.35);
  mqWingGlow.addColorStop(0, `rgba(180, 200, 220, ${0.12 + Math.sin(time * 8) * 0.06})`);
  mqWingGlow.addColorStop(1, "rgba(180, 200, 220, 0)");
  ctx.fillStyle = mqWingGlow;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05, size * 0.35, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Abdomen bioluminescence
  ctx.save();
  const mqBioGrad = ctx.createRadialGradient(x, y + size * 0.05, 0, x, y + size * 0.05, size * 0.14);
  mqBioGrad.addColorStop(0, `rgba(200, 50, 80, ${0.18 + Math.sin(time * 2) * 0.08})`);
  mqBioGrad.addColorStop(1, "rgba(200, 50, 80, 0)");
  ctx.fillStyle = mqBioGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * 0.12, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Trailing blood mist particles
  ctx.save();
  for (let bm = 0; bm < 5; bm++) {
    const bmPhase = (time * 1.2 + bm * 0.5) % 2;
    const bmX = x + size * 0.12 + bmPhase * size * 0.18;
    const bmY2 = y + Math.sin(time * 3 + bm) * size * 0.08;
    const bmAlpha = Math.max(0, 0.22 - bmPhase * 0.11);
    ctx.fillStyle = `rgba(150, 30, 50, ${bmAlpha})`;
    ctx.beginPath();
    ctx.arc(bmX, bmY2, size * 0.014, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCentipedeEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  size *= 1.4;
  const segments = 10;
  const segSpacing = size * 0.05;

  // Body segments with undulating wave motion
  const waveSpeed = time * 4;
  const segPositions: { x: number; y: number }[] = [];
  for (let i = 0; i < segments; i++) {
    const wave = Math.sin(waveSpeed + i * 0.6) * size * 0.04;
    const sx = x + wave;
    const sy = y - size * 0.25 + i * segSpacing;
    segPositions.push({ x: sx, y: sy });

    // Segment body (organic tergite plate shape)
    const segGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.08);
    const tint = i % 2 === 0 ? bodyColor : bodyColorDark;
    segGrad.addColorStop(0, bodyColorLight);
    segGrad.addColorStop(0.5, tint);
    segGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = segGrad;
    const segW = size * (0.1 - i * 0.003);
    const segH = size * 0.04;
    ctx.beginPath();
    ctx.moveTo(sx - segW, sy);
    ctx.bezierCurveTo(sx - segW * 0.9, sy - segH * 1.2, sx + segW * 0.9, sy - segH * 1.2, sx + segW, sy);
    ctx.bezierCurveTo(sx + segW * 0.9, sy + segH * 1.1, sx - segW * 0.9, sy + segH * 1.1, sx - segW, sy);
    ctx.fill();

    // Armor plate ridge with pleurite edge
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx - segW * 0.85, sy);
    ctx.quadraticCurveTo(sx, sy - segH * 0.6, sx + segW * 0.85, sy);
    ctx.stroke();
    // Lateral pleurite notches
    for (let ps = -1; ps <= 1; ps += 2) {
      ctx.beginPath();
      ctx.moveTo(sx + ps * segW * 0.75, sy - segH * 0.4);
      ctx.lineTo(sx + ps * segW * 0.9, sy);
      ctx.stroke();
    }

    // Sternite plate (ventral underside visible between segments)
    if (i > 0 && i < segments - 1) {
      ctx.fillStyle = `rgba(0, 0, 0, 0.08)`;
      ctx.beginPath();
      ctx.moveTo(sx - segW * 0.5, sy + segH * 0.4);
      ctx.bezierCurveTo(sx - segW * 0.3, sy + segH * 0.8, sx + segW * 0.3, sy + segH * 0.8, sx + segW * 0.5, sy + segH * 0.4);
      ctx.fill();
    }

    // Legs for each segment (except head)
    if (i > 0) {
      const legGait = Math.sin(waveSpeed + i * 0.6);
      const legLift = Math.max(0, legGait) * size * 0.03;
      for (let side = -1; side <= 1; side += 2) {
        const lbx = sx + side * size * 0.08;
        const lmx = lbx + side * size * 0.05;
        const lmy = sy - size * 0.03 - legLift;
        const lex = sx + side * size * 0.2 + legGait * side * size * 0.02;
        const ley = sy + size * 0.06 - legLift;
        // Coxa (thick base)
        ctx.strokeStyle = bodyColorDark;
        ctx.lineWidth = 2.5 * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lbx, sy);
        ctx.quadraticCurveTo(lbx + side * size * 0.02, sy - size * 0.015 - legLift * 0.5, lmx, lmy);
        ctx.stroke();
        // Tarsus (thin end)
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(lmx, lmy);
        ctx.quadraticCurveTo(lmx + side * size * 0.08, lmy + size * 0.02, lex, ley);
        ctx.stroke();
        // Joint
        ctx.fillStyle = bodyColorDark;
        ctx.beginPath();
        ctx.arc(lmx, lmy, size * 0.01, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Head (first segment, larger — flattened shield shape)
  const hx = segPositions[0].x;
  const hy = segPositions[0].y;
  const cpHeadGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, size * 0.12);
  cpHeadGrad.addColorStop(0, bodyColorLight);
  cpHeadGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = cpHeadGrad;
  ctx.beginPath();
  ctx.moveTo(hx, hy - size * 0.07);
  ctx.bezierCurveTo(hx + size * 0.08, hy - size * 0.08, hx + size * 0.13, hy - size * 0.03, hx + size * 0.12, hy + size * 0.02);
  ctx.bezierCurveTo(hx + size * 0.1, hy + size * 0.06, hx + size * 0.04, hy + size * 0.07, hx, hy + size * 0.06);
  ctx.bezierCurveTo(hx - size * 0.04, hy + size * 0.07, hx - size * 0.1, hy + size * 0.06, hx - size * 0.12, hy + size * 0.02);
  ctx.bezierCurveTo(hx - size * 0.13, hy - size * 0.03, hx - size * 0.08, hy - size * 0.08, hx, hy - size * 0.07);
  ctx.fill();
  // Head plate ridge
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(hx - size * 0.06, hy - size * 0.02);
  ctx.quadraticCurveTo(hx, hy - size * 0.05, hx + size * 0.06, hy - size * 0.02);
  ctx.stroke();

  // Forcipules (venomous claws)
  const clawSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.15 : 0.05 + Math.sin(time * 3) * 0.03;
  ctx.fillStyle = "#3a1a0a";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(hx + side * size * 0.06, hy - size * 0.05);
    ctx.quadraticCurveTo(
      hx + side * (size * 0.12 + clawSpread * size), hy - size * 0.12,
      hx + side * (size * 0.08 + clawSpread * size * 0.5), hy - size * 0.18,
    );
    ctx.lineTo(hx + side * size * 0.04, hy - size * 0.1);
    ctx.fill();
  }
  // Venom on forcipules
  ctx.fillStyle = `rgba(180, 50, 220, ${0.5 + Math.sin(time * 4) * 0.3})`;
  setShadowBlur(ctx, 4 * zoom, "#b432dc");
  ctx.beginPath();
  ctx.arc(hx - size * 0.08 - clawSpread * size * 0.5, hy - size * 0.17, size * 0.012, 0, Math.PI * 2);
  ctx.arc(hx + size * 0.08 + clawSpread * size * 0.5, hy - size * 0.17, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Antennae
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const aSway = Math.sin(time * 5 + side) * 0.15;
    ctx.beginPath();
    ctx.moveTo(hx + side * size * 0.05, hy - size * 0.06);
    ctx.quadraticCurveTo(
      hx + side * size * 0.15, hy - size * 0.15 + aSway * size,
      hx + side * size * 0.22, hy - size * 0.2 + aSway * size,
    );
    ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = `rgba(220, 60, 60, ${0.7 + Math.sin(time * 3) * 0.3})`;
  setShadowBlur(ctx, 3 * zoom, "#dc3c3c");
  ctx.beginPath();
  ctx.arc(hx - size * 0.05, hy - size * 0.04, size * 0.02, 0, Math.PI * 2);
  ctx.arc(hx + size * 0.05, hy - size * 0.04, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Tail cerci
  const lastSeg = segPositions[segments - 1];
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(lastSeg.x + side * size * 0.04, lastSeg.y + size * 0.02);
    ctx.quadraticCurveTo(
      lastSeg.x + side * size * 0.1, lastSeg.y + size * 0.08,
      lastSeg.x + side * size * 0.12, lastSeg.y + size * 0.12,
    );
    ctx.stroke();
  }

  // Attack: venom splash
  if (isAttacking) {
    for (let s = 0; s < 6; s++) {
      const sa = (s / 6) * Math.PI - Math.PI * 0.5;
      const sd = attackPhase * size * 0.3;
      const salpha = (1 - attackPhase) * 0.5;
      ctx.fillStyle = `rgba(180, 50, 220, ${salpha})`;
      ctx.beginPath();
      ctx.arc(hx + Math.cos(sa) * sd, hy + Math.sin(sa) * sd, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Enhancement: Segment-by-segment shimmer wave
  ctx.save();
  for (let si = 0; si < segments; si++) {
    const shimWave = Math.sin(time * 3 - si * 0.5);
    if (shimWave > 0.3) {
      const shimAlpha = (shimWave - 0.3) * 0.25;
      const sp = segPositions[si];
      const cpSegGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, size * 0.08);
      cpSegGrad.addColorStop(0, `rgba(255, 220, 180, ${shimAlpha})`);
      cpSegGrad.addColorStop(1, "rgba(255, 220, 180, 0)");
      ctx.fillStyle = cpSegGrad;
      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y, size * 0.1, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Enhancement: Venom glow at forcipule tips
  ctx.save();
  for (let cpSide = -1; cpSide <= 1; cpSide += 2) {
    const cpVtx = hx + cpSide * (size * 0.08 + clawSpread * size * 0.5);
    const cpVty = hy - size * 0.17;
    const cpVenomGrad = ctx.createRadialGradient(cpVtx, cpVty, 0, cpVtx, cpVty, size * 0.05);
    cpVenomGrad.addColorStop(0, `rgba(180, 50, 220, ${0.3 + Math.sin(time * 4) * 0.15})`);
    cpVenomGrad.addColorStop(1, "rgba(180, 50, 220, 0)");
    ctx.fillStyle = cpVenomGrad;
    ctx.beginPath();
    ctx.arc(cpVtx, cpVty, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Predator eye aura
  ctx.save();
  const cpEyeAura = ctx.createRadialGradient(hx, hy - size * 0.04, 0, hx, hy - size * 0.04, size * 0.1);
  cpEyeAura.addColorStop(0, `rgba(220, 60, 60, ${0.18 + Math.sin(time * 3) * 0.08})`);
  cpEyeAura.addColorStop(1, "rgba(220, 60, 60, 0)");
  ctx.fillStyle = cpEyeAura;
  ctx.beginPath();
  ctx.arc(hx, hy - size * 0.04, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawDragonflyEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.15;

  // Four iridescent wings (elongated dragonfly shape with detailed venation)
  const flapRate = time * 16;
  for (let pair = 0; pair < 2; pair++) {
    const wingY = y - size * 0.05 + pair * size * 0.08;
    const flapOffset = pair * 0.5;
    for (let side = -1; side <= 1; side += 2) {
      const flap = Math.sin(flapRate + flapOffset) * 0.5;
      const wingW = size * (0.5 - pair * 0.08);
      const wingH = size * 0.12;
      ctx.save();
      ctx.translate(x + side * size * 0.04, wingY);
      ctx.scale(side, 1);
      ctx.rotate(flap * 0.4);
      const iridescence = Math.sin(time * 3 + pair) * 0.5 + 0.5;
      const r = Math.round(14 + iridescence * 80);
      const g = Math.round(165 + iridescence * 60);
      const b = Math.round(233 - iridescence * 80);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wingW * 0.1, -wingH * 0.8, wingW * 0.4, -wingH * 1.1, wingW * 0.7, -wingH * 0.6);
      ctx.bezierCurveTo(wingW * 0.85, -wingH * 0.3, wingW * 0.92, -wingH * 0.05, wingW * 0.88, wingH * 0.15);
      ctx.bezierCurveTo(wingW * 0.8, wingH * 0.5, wingW * 0.5, wingH * 0.6, wingW * 0.25, wingH * 0.35);
      ctx.bezierCurveTo(wingW * 0.1, wingH * 0.15, 0, wingH * 0.05, 0, 0);
      ctx.fill();

      // Pterostigma (dark cell near wing tip)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
      ctx.beginPath();
      ctx.moveTo(wingW * 0.7, -wingH * 0.3);
      ctx.bezierCurveTo(wingW * 0.74, -wingH * 0.35, wingW * 0.82, -wingH * 0.25, wingW * 0.8, -wingH * 0.15);
      ctx.bezierCurveTo(wingW * 0.76, -wingH * 0.1, wingW * 0.72, -wingH * 0.2, wingW * 0.7, -wingH * 0.3);
      ctx.fill();

      // Wing venation (costa, radius, media, cubitus)
      ctx.strokeStyle = `rgba(14, 165, 233, 0.3)`;
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wingW * 0.2, -wingH * 0.4, wingW * 0.5, -wingH * 0.55, wingW * 0.8, -wingH * 0.2);
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wingW * 0.25, -wingH * 0.15, wingW * 0.55, -wingH * 0.1, wingW * 0.85, wingH * 0.05);
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(wingW * 0.15, wingH * 0.1, wingW * 0.35, wingH * 0.25, wingW * 0.55, wingH * 0.3);
      ctx.stroke();
      // Cross veins
      ctx.strokeStyle = `rgba(14, 165, 233, 0.15)`;
      ctx.lineWidth = 0.4 * zoom;
      for (let cv = 0; cv < 4; cv++) {
        const cvt = 0.2 + cv * 0.18;
        ctx.beginPath();
        ctx.moveTo(wingW * cvt, -wingH * (0.5 - cv * 0.06));
        ctx.lineTo(wingW * (cvt + 0.04), wingH * (0.1 + cv * 0.05));
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Long segmented abdomen (tapered cylindrical segments)
  for (let seg = 0; seg < 7; seg++) {
    const segY = y + size * 0.02 + seg * size * 0.04;
    const segW = size * (0.06 - seg * 0.004);
    const segH = size * 0.025;
    const segWave = Math.sin(time * 3 + seg * 0.5) * size * 0.01;
    const sx = x + segWave;
    ctx.fillStyle = seg % 2 === 0 ? bodyColor : bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(sx - segW, segY);
    ctx.bezierCurveTo(sx - segW, segY - segH * 1.3, sx + segW, segY - segH * 1.3, sx + segW, segY);
    ctx.bezierCurveTo(sx + segW, segY + segH * 1.2, sx - segW, segY + segH * 1.2, sx - segW, segY);
    ctx.fill();
    // Segment join groove
    if (seg > 0) {
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(sx - segW * 0.7, segY - segH);
      ctx.quadraticCurveTo(sx, segY - segH * 1.4, sx + segW * 0.7, segY - segH);
      ctx.stroke();
    }
  }
  // Tail cerci at abdomen tip
  const tailY = y + size * 0.02 + 7 * size * 0.04;
  const tailW = size * 0.025;
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - tailW, tailY);
  ctx.bezierCurveTo(x - tailW * 0.5, tailY + size * 0.03, x + tailW * 0.5, tailY + size * 0.03, x + tailW, tailY);
  ctx.fill();

  // Thorax (muscular flight engine — angular)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.12);
  ctx.bezierCurveTo(x + size * 0.07, y - size * 0.12, x + size * 0.11, y - size * 0.07, x + size * 0.1, y - size * 0.02);
  ctx.bezierCurveTo(x + size * 0.09, y + size * 0.02, x + size * 0.04, y + size * 0.03, x, y + size * 0.02);
  ctx.bezierCurveTo(x - size * 0.04, y + size * 0.03, x - size * 0.09, y + size * 0.02, x - size * 0.1, y - size * 0.02);
  ctx.bezierCurveTo(x - size * 0.11, y - size * 0.07, x - size * 0.07, y - size * 0.12, x, y - size * 0.12);
  ctx.fill();
  // Thorax wing muscle ridges
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let mr = -1; mr <= 1; mr += 2) {
    ctx.beginPath();
    ctx.moveTo(x + mr * size * 0.03, y - size * 0.1);
    ctx.quadraticCurveTo(x + mr * size * 0.06, y - size * 0.04, x + mr * size * 0.04, y + size * 0.01);
    ctx.stroke();
  }

  // Head (wide, dominated by compound eyes)
  const dfHGrad = ctx.createRadialGradient(x, y - size * 0.18, 0, x, y - size * 0.18, size * 0.1);
  dfHGrad.addColorStop(0, bodyColorLight);
  dfHGrad.addColorStop(1, bodyColor);
  ctx.fillStyle = dfHGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.bezierCurveTo(x + size * 0.07, y - size * 0.25, x + size * 0.11, y - size * 0.2, x + size * 0.1, y - size * 0.16);
  ctx.bezierCurveTo(x + size * 0.09, y - size * 0.12, x + size * 0.04, y - size * 0.11, x, y - size * 0.12);
  ctx.bezierCurveTo(x - size * 0.04, y - size * 0.11, x - size * 0.09, y - size * 0.12, x - size * 0.1, y - size * 0.16);
  ctx.bezierCurveTo(x - size * 0.11, y - size * 0.2, x - size * 0.07, y - size * 0.25, x, y - size * 0.25);
  ctx.fill();

  // Massive compound eyes
  ctx.fillStyle = `rgba(14, 165, 233, ${0.8 + Math.sin(time * 4) * 0.2})`;
  setShadowBlur(ctx, 5 * zoom, "#0ea5e9");
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.2, size * 0.055, size * 0.045, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.2, size * 0.055, size * 0.045, 0.2, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Legs (tucked underneath in flight — segmented with joints)
  for (let leg = 0; leg < 6; leg++) {
    const legSide = leg % 2 === 0 ? -1 : 1;
    const lx = x + legSide * size * 0.05;
    const ly = y + (Math.floor(leg / 2) - 1) * size * 0.04;
    const dangle = Math.sin(time * 4 + leg) * size * 0.02;
    const kneeX = lx + dangle * 0.4;
    const kneeY = ly + size * 0.055;
    const footX = lx + dangle;
    const footY = ly + size * 0.12;
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.8 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + dangle * 0.2, ly + size * 0.025, kneeX, kneeY);
    ctx.stroke();
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.quadraticCurveTo(kneeX + dangle * 0.3, kneeY + size * 0.03, footX, footY);
    ctx.stroke();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, size * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // Speed lines when moving
  for (let sl = 0; sl < 3; sl++) {
    const slAlpha = 0.15 - sl * 0.04;
    ctx.strokeStyle = `rgba(14, 165, 233, ${slAlpha})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.3 + sl * size * 0.05, y + Math.sin(time * 5 + sl) * size * 0.05);
    ctx.lineTo(x + size * 0.5 + sl * size * 0.1, y + Math.sin(time * 5 + sl) * size * 0.05);
    ctx.stroke();
  }

  // Enhancement: Wing iridescent membrane glow
  ctx.save();
  const dfWingGlow = ctx.createRadialGradient(x, y - size * 0.05, 0, x, y - size * 0.05, size * 0.4);
  dfWingGlow.addColorStop(0, `rgba(14, 165, 233, ${0.12 + Math.sin(time * 6) * 0.06})`);
  dfWingGlow.addColorStop(0.5, `rgba(80, 200, 255, ${0.06 + Math.sin(time * 6) * 0.03})`);
  dfWingGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
  ctx.fillStyle = dfWingGlow;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05, size * 0.4, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Abdomen segment bioluminescence
  ctx.save();
  for (let dfSeg = 0; dfSeg < 3; dfSeg++) {
    const dfSegY = y + size * 0.02 + dfSeg * size * 0.08;
    const dfSegAlpha = 0.14 + Math.sin(time * 3 + dfSeg * 1.2) * 0.07;
    const dfSegGrad = ctx.createRadialGradient(x, dfSegY, 0, x, dfSegY, size * 0.045);
    dfSegGrad.addColorStop(0, `rgba(14, 200, 255, ${dfSegAlpha})`);
    dfSegGrad.addColorStop(1, "rgba(14, 200, 255, 0)");
    ctx.fillStyle = dfSegGrad;
    ctx.beginPath();
    ctx.arc(x, dfSegY, size * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Trailing shimmer particles
  ctx.save();
  for (let dfp = 0; dfp < 5; dfp++) {
    const dfpPhase = (time * 2.5 + dfp * 0.4) % 2;
    const dfpX = x + size * 0.18 + dfpPhase * size * 0.22;
    const dfpY = y + size * 0.15 + Math.sin(time * 4 + dfp) * size * 0.06;
    const dfpAlpha = Math.max(0, 0.3 - dfpPhase * 0.15);
    ctx.fillStyle = `rgba(14, 200, 255, ${dfpAlpha})`;
    ctx.beginPath();
    ctx.arc(dfpX, dfpY, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Swarm speed: wing blur afterimage trail
  ctx.save();
  for (let wai = 0; wai < 3; wai++) {
    const waiOff = (wai + 1) * size * 0.12 + Math.sin(time * 7 + wai) * size * 0.015;
    const waiScale = 1 - (wai + 1) * 0.15;
    const waiAlpha = [0.12, 0.08, 0.04][wai];
    ctx.globalAlpha = waiAlpha;
    ctx.fillStyle = "#0ea5e9";
    ctx.beginPath();
    ctx.ellipse(
      x + waiOff, y + wai * size * 0.01,
      size * 0.3 * waiScale, size * 0.08 * waiScale,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Swarm speed: speed streak lines behind body
  ctx.save();
  for (let ss = 0; ss < 3; ss++) {
    const ssAlpha = [0.14, 0.09, 0.05][ss];
    const ssOff = (ss + 1) * size * 0.08 + Math.sin(time * 8 + ss * 2) * size * 0.01;
    ctx.strokeStyle = `rgba(14, 165, 233, ${ssAlpha})`;
    ctx.lineWidth = (1.5 - ss * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.25 + ssOff, y - size * 0.05 + ss * size * 0.06);
    ctx.lineTo(x + size * 0.5 + ssOff, y - size * 0.05 + ss * size * 0.06);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSilkMothEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.2;
  const flapAngle = Math.sin(time * 8) * 0.4;

  // Shimmering dust particles
  for (let p = 0; p < 8; p++) {
    const px = x + Math.sin(time * 2 + p * 1.5) * size * 0.5;
    const py = y + Math.cos(time * 1.5 + p * 1.2) * size * 0.3;
    const pAlpha = 0.3 + Math.sin(time * 4 + p) * 0.2;
    const pSize = size * (0.01 + Math.sin(p * 2.1) * 0.005);
    ctx.fillStyle = `rgba(200, 190, 255, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Large ornate wings
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(side, 1);
    ctx.rotate(flapAngle * 0.3);

    // Upper wing
    const uwGrad = ctx.createRadialGradient(size * 0.2, -size * 0.1, 0, size * 0.2, -size * 0.1, size * 0.35);
    uwGrad.addColorStop(0, `rgba(200, 185, 255, 0.6)`);
    uwGrad.addColorStop(0.5, `rgba(160, 140, 220, 0.4)`);
    uwGrad.addColorStop(1, `rgba(120, 100, 180, 0.2)`);
    ctx.fillStyle = uwGrad;
    ctx.beginPath();
    ctx.moveTo(size * 0.04, -size * 0.05);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.35, size * 0.45, -size * 0.15);
    ctx.quadraticCurveTo(size * 0.35, size * 0.05, size * 0.04, size * 0.02);
    ctx.fill();

    // Wing scale texture (rows of tiny overlapping arcs)
    ctx.strokeStyle = `rgba(160, 140, 220, 0.15)`;
    ctx.lineWidth = 0.4 * zoom;
    for (let sr = 0; sr < 3; sr++) {
      for (let sc = 0; sc < 3; sc++) {
        const scx = size * (0.1 + sr * 0.08);
        const scy = -size * (0.05 + sc * 0.06) + sr * size * 0.02;
        ctx.beginPath();
        ctx.arc(scx, scy, size * 0.025, 0, Math.PI);
        ctx.stroke();
      }
    }

    // Eye spot on wing (concentric rings for depth)
    ctx.fillStyle = `rgba(60, 30, 100, 0.5)`;
    ctx.beginPath();
    ctx.arc(size * 0.22, -size * 0.12, size * 0.065, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(100, 60, 160, 0.55)`;
    ctx.beginPath();
    ctx.arc(size * 0.22, -size * 0.12, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(180, 160, 230, 0.5)`;
    ctx.beginPath();
    ctx.arc(size * 0.22, -size * 0.12, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 210, 255, 0.65)`;
    ctx.beginPath();
    ctx.arc(size * 0.22, -size * 0.12, size * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Lower wing
    ctx.fillStyle = `rgba(180, 165, 235, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(size * 0.04, size * 0.02);
    ctx.quadraticCurveTo(size * 0.25, size * 0.15, size * 0.35, size * 0.1);
    ctx.quadraticCurveTo(size * 0.2, size * 0.02, size * 0.04, -size * 0.02);
    ctx.fill();

    ctx.restore();
  }

  // Fuzzy body (plump thorax + abdomen with fur texture)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.11);
  ctx.bezierCurveTo(x + size * 0.05, y - size * 0.11, x + size * 0.07, y - size * 0.04, x + size * 0.065, y + size * 0.03);
  ctx.bezierCurveTo(x + size * 0.06, y + size * 0.09, x + size * 0.03, y + size * 0.13, x, y + size * 0.13);
  ctx.bezierCurveTo(x - size * 0.03, y + size * 0.13, x - size * 0.06, y + size * 0.09, x - size * 0.065, y + size * 0.03);
  ctx.bezierCurveTo(x - size * 0.07, y - size * 0.04, x - size * 0.05, y - size * 0.11, x, y - size * 0.11);
  ctx.fill();
  // Fur tufts (short bristle strokes)
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 1.5 * zoom;
  for (let f = 0; f < 10; f++) {
    const fa = (f / 10) * Math.PI * 2;
    const fd = size * 0.055;
    const fx = x + Math.cos(fa) * fd;
    const fy = y + Math.sin(fa) * fd * 1.2;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(fa) * size * 0.025, fy + Math.sin(fa) * size * 0.025);
    ctx.stroke();
  }
  // Abdomen segment lines (multiple)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let abseg = 0; abseg < 3; abseg++) {
    const absY = y + size * 0.02 + abseg * size * 0.035;
    const absW = size * (0.05 - abseg * 0.005);
    ctx.beginPath();
    ctx.moveTo(x - absW, absY);
    ctx.quadraticCurveTo(x, absY + size * 0.012, x + absW, absY);
    ctx.stroke();
  }
  // Ventral fur fringe (darker underbelly tufts)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let vf = 0; vf < 5; vf++) {
    const vfx = x + (vf - 2) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(vfx, y + size * 0.1);
    ctx.lineTo(vfx + size * 0.005, y + size * 0.12);
    ctx.stroke();
  }

  // Head (round and fuzzy)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.19);
  ctx.bezierCurveTo(x + size * 0.05, y - size * 0.19, x + size * 0.065, y - size * 0.15, x + size * 0.06, y - size * 0.12);
  ctx.bezierCurveTo(x + size * 0.05, y - size * 0.1, x + size * 0.02, y - size * 0.09, x, y - size * 0.1);
  ctx.bezierCurveTo(x - size * 0.02, y - size * 0.09, x - size * 0.05, y - size * 0.1, x - size * 0.06, y - size * 0.12);
  ctx.bezierCurveTo(x - size * 0.065, y - size * 0.15, x - size * 0.05, y - size * 0.19, x, y - size * 0.19);
  ctx.fill();
  // Head fur tufts
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1 * zoom;
  for (let hf = 0; hf < 5; hf++) {
    const hfa = -Math.PI * 0.3 + (hf / 4) * Math.PI * 0.6;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(hfa) * size * 0.05, y - size * 0.15 + Math.sin(hfa) * size * 0.04);
    ctx.lineTo(x + Math.cos(hfa) * size * 0.07, y - size * 0.15 + Math.sin(hfa) * size * 0.06);
    ctx.stroke();
  }

  // Feathery antennae
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const aSway = Math.sin(time * 3 + side * 1.5) * 0.12;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.03, y - size * 0.18);
    ctx.quadraticCurveTo(
      x + side * size * 0.12, y - size * 0.3 + aSway * size,
      x + side * size * 0.18, y - size * 0.35 + aSway * size,
    );
    ctx.stroke();
    // Plumes
    for (let pl = 0; pl < 4; pl++) {
      const plx = x + side * size * (0.06 + pl * 0.03);
      const ply = y - size * (0.22 + pl * 0.03);
      ctx.beginPath();
      ctx.moveTo(plx, ply);
      ctx.lineTo(plx + side * size * 0.03, ply - size * 0.02);
      ctx.moveTo(plx, ply);
      ctx.lineTo(plx + side * size * 0.03, ply + size * 0.02);
      ctx.stroke();
    }
  }

  // Eyes (large, luminous)
  ctx.fillStyle = `rgba(200, 180, 255, ${0.8 + Math.sin(time * 3) * 0.2})`;
  setShadowBlur(ctx, 6 * zoom, "#c8b4ff");
  ctx.beginPath();
  ctx.arc(x - size * 0.04, y - size * 0.17, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.04, y - size * 0.17, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Blinding scale release aura
  const scaleAura = 0.1 + Math.sin(time * 2) * 0.05;
  ctx.fillStyle = `rgba(200, 190, 255, ${scaleAura})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.5, size * 0.5 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Enhancement: Wing membrane spectral glow
  ctx.save();
  const smWingGlow = ctx.createRadialGradient(x, y, size * 0.04, x, y, size * 0.4);
  smWingGlow.addColorStop(0, `rgba(200, 185, 255, ${0.15 + Math.sin(time * 3) * 0.07})`);
  smWingGlow.addColorStop(0.5, `rgba(160, 140, 220, ${0.07 + Math.sin(time * 3) * 0.04})`);
  smWingGlow.addColorStop(1, "rgba(160, 140, 220, 0)");
  ctx.fillStyle = smWingGlow;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.4, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Body bioluminescence
  ctx.save();
  const smBioGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.09);
  smBioGrad.addColorStop(0, `rgba(220, 210, 255, ${0.25 + Math.sin(time * 2.5) * 0.1})`);
  smBioGrad.addColorStop(1, "rgba(220, 210, 255, 0)");
  ctx.fillStyle = smBioGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.08, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Trailing spectral scale particles
  ctx.save();
  for (let sp2 = 0; sp2 < 6; sp2++) {
    const sp2Phase = (time * 1.8 + sp2 * 0.45) % 2.5;
    const sp2X = x + size * 0.1 + sp2Phase * size * 0.15 + Math.sin(sp2 * 1.9) * size * 0.12;
    const sp2Y = y + Math.sin(time * 2 + sp2 * 1.3) * size * 0.12;
    const sp2Alpha = Math.max(0, 0.3 - sp2Phase * 0.12);
    ctx.fillStyle = `rgba(200, 190, 255, ${sp2Alpha})`;
    ctx.beginPath();
    ctx.arc(sp2X, sp2Y, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// =====================================================
// DESERT BUGS
// =====================================================

export function drawAntSoldierEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  size *= 1.3;

  // Legs (6 ant legs with marching gait)
  const march = time * 5;
  const legAngleSet = [-0.35, 0, 0.35];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 3; leg++) {
      const gait = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(march + gait);
      const lift = Math.max(0, stride);
      const a = legAngleSet[leg];
      const bx = x + side * size * 0.08;
      const by = y - size * 0.02 + leg * size * 0.07;
      const mx = bx + side * size * 0.16;
      const my = by + a * size * 0.08 - lift * size * 0.06;
      const ex = bx + side * size * 0.3;
      const ey = by + a * size * 0.2 + size * 0.14 - lift * size * 0.02;
      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 3.5, zoom, bodyColor, bodyColorDark, size * 0.02);
    }
  }

  // Gaster (rear segment — teardrop shape with tergite ridges)
  const asAbdGrad = ctx.createRadialGradient(x, y + size * 0.12, 0, x, y + size * 0.12, size * 0.2);
  asAbdGrad.addColorStop(0, bodyColorLight);
  asAbdGrad.addColorStop(0.6, bodyColor);
  asAbdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = asAbdGrad;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.0);
  ctx.bezierCurveTo(x + size * 0.12, y - size * 0.01, x + size * 0.19, y + size * 0.05, x + size * 0.18, y + size * 0.12);
  ctx.bezierCurveTo(x + size * 0.16, y + size * 0.22, x + size * 0.06, y + size * 0.28, x, y + size * 0.28);
  ctx.bezierCurveTo(x - size * 0.06, y + size * 0.28, x - size * 0.16, y + size * 0.22, x - size * 0.18, y + size * 0.12);
  ctx.bezierCurveTo(x - size * 0.19, y + size * 0.05, x - size * 0.12, y - size * 0.01, x, y + size * 0.0);
  ctx.fill();
  // Gaster tergite segment lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let gt = 0; gt < 3; gt++) {
    const gtY = y + size * 0.06 + gt * size * 0.065;
    const gtW = size * (0.15 - gt * 0.02);
    ctx.beginPath();
    ctx.moveTo(x - gtW, gtY);
    ctx.quadraticCurveTo(x, gtY + size * 0.02, x + gtW, gtY);
    ctx.stroke();
  }

  // Petiole (narrow waist node — double-node with post-petiole)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.015);
  ctx.bezierCurveTo(x - size * 0.035, y - size * 0.035, x + size * 0.035, y - size * 0.035, x + size * 0.03, y - size * 0.015);
  ctx.bezierCurveTo(x + size * 0.035, y + size * 0.01, x - size * 0.035, y + size * 0.01, x - size * 0.03, y - size * 0.015);
  ctx.fill();
  // Post-petiole (second waist node)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.04);
  ctx.bezierCurveTo(x - size * 0.045, y - size * 0.06, x + size * 0.045, y - size * 0.06, x + size * 0.04, y - size * 0.04);
  ctx.bezierCurveTo(x + size * 0.045, y - size * 0.02, x - size * 0.045, y - size * 0.02, x - size * 0.04, y - size * 0.04);
  ctx.fill();
  // Petiole connecting ridge
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.06);
  ctx.lineTo(x, y - size * 0.01);
  ctx.stroke();

  // Mesosoma (thorax — angular armored shape)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.19);
  ctx.bezierCurveTo(x + size * 0.09, y - size * 0.19, x + size * 0.15, y - size * 0.14, x + size * 0.14, y - size * 0.08);
  ctx.bezierCurveTo(x + size * 0.12, y - size * 0.03, x + size * 0.05, y - size * 0.01, x, y - size * 0.02);
  ctx.bezierCurveTo(x - size * 0.05, y - size * 0.01, x - size * 0.12, y - size * 0.03, x - size * 0.14, y - size * 0.08);
  ctx.bezierCurveTo(x - size * 0.15, y - size * 0.14, x - size * 0.09, y - size * 0.19, x, y - size * 0.19);
  ctx.fill();
  // Mesosoma ridge + suture lines (promesonotal + metanotal grooves)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.1);
  ctx.quadraticCurveTo(x, y - size * 0.13, x + size * 0.08, y - size * 0.1);
  ctx.stroke();
  // Promesonotal suture
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.06);
  ctx.quadraticCurveTo(x, y - size * 0.08, x + size * 0.1, y - size * 0.06);
  ctx.stroke();
  // Metapleural gland openings (paired ovals on thorax sides)
  ctx.fillStyle = `rgba(0, 0, 0, 0.12)`;
  for (let gs = -1; gs <= 1; gs += 2) {
    ctx.beginPath();
    ctx.moveTo(x + gs * size * 0.1, y - size * 0.06);
    ctx.bezierCurveTo(
      x + gs * size * 0.12, y - size * 0.07,
      x + gs * size * 0.12, y - size * 0.04,
      x + gs * size * 0.1, y - size * 0.05,
    );
    ctx.fill();
  }

  // Head with large mandibles (squared-off ant head)
  const asHeadGrad = ctx.createRadialGradient(x, y - size * 0.25, 0, x, y - size * 0.25, size * 0.12);
  asHeadGrad.addColorStop(0, bodyColor);
  asHeadGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = asHeadGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.34);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.34, x + size * 0.12, y - size * 0.29, x + size * 0.12, y - size * 0.24);
  ctx.bezierCurveTo(x + size * 0.11, y - size * 0.19, x + size * 0.06, y - size * 0.17, x, y - size * 0.18);
  ctx.bezierCurveTo(x - size * 0.06, y - size * 0.17, x - size * 0.11, y - size * 0.19, x - size * 0.12, y - size * 0.24);
  ctx.bezierCurveTo(x - size * 0.12, y - size * 0.29, x - size * 0.08, y - size * 0.34, x, y - size * 0.34);
  ctx.fill();

  // Soldier mandibles (oversized)
  const mandibleSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.12 : 0.05 + Math.sin(time * 3) * 0.02;
  ctx.fillStyle = "#2a1a08";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.08, y - size * 0.32);
    ctx.quadraticCurveTo(
      x + side * (size * 0.18 + mandibleSpread * size), y - size * 0.38,
      x + side * (size * 0.22 + mandibleSpread * size), y - size * 0.35,
    );
    ctx.quadraticCurveTo(
      x + side * (size * 0.15 + mandibleSpread * size * 0.5), y - size * 0.32,
      x + side * size * 0.06, y - size * 0.3,
    );
    ctx.fill();
    // Mandible teeth
    ctx.fillStyle = "#1a0a00";
    for (let t = 0; t < 2; t++) {
      ctx.beginPath();
      ctx.arc(
        x + side * (size * 0.12 + mandibleSpread * size * 0.5 + t * side * size * 0.04),
        y - size * 0.36,
        size * 0.012,
        0, Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#2a1a08";
  }

  // Antennae (elbowed, ant-like)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const aSway = Math.sin(time * 4 + side * 2) * 0.08;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.32);
    ctx.lineTo(x + side * size * 0.12, y - size * 0.38 + aSway * size);
    ctx.quadraticCurveTo(
      x + side * size * 0.16, y - size * 0.42 + aSway * size,
      x + side * size * 0.2, y - size * 0.44 + aSway * size,
    );
    ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = `rgba(200, 160, 50, ${0.7 + Math.sin(time * 3) * 0.3})`;
  setShadowBlur(ctx, 3 * zoom, "#c8a032");
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.27, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.27, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Summoner aura (pheromone trails)
  const pheromoneAlpha = 0.12 + Math.sin(time * 2) * 0.05;
  ctx.strokeStyle = `rgba(200, 150, 50, ${pheromoneAlpha})`;
  ctx.lineWidth = 1 * zoom;
  ctx.setLineDash([3 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.45, size * 0.45 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Enhancement: Mandible metallic gleam
  ctx.save();
  for (let asSide = -1; asSide <= 1; asSide += 2) {
    const asGleamX = x + asSide * (size * 0.15 + mandibleSpread * size * 0.5);
    const asGleamY = y - size * 0.36;
    const asGleamGrad = ctx.createRadialGradient(asGleamX, asGleamY, 0, asGleamX, asGleamY, size * 0.045);
    asGleamGrad.addColorStop(0, `rgba(255, 240, 170, ${0.3 + Math.sin(time * 3 + asSide) * 0.15})`);
    asGleamGrad.addColorStop(1, "rgba(255, 240, 170, 0)");
    ctx.fillStyle = asGleamGrad;
    ctx.beginPath();
    ctx.arc(asGleamX, asGleamY, size * 0.045, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Pheromone trail particles
  ctx.save();
  for (let ph = 0; ph < 6; ph++) {
    const phAngle = time * 0.8 + ph * (Math.PI * 2 / 6);
    const phDist = size * (0.35 + Math.sin(time * 1.5 + ph) * 0.06);
    const phX = x + Math.cos(phAngle) * phDist;
    const phY2 = y + Math.sin(phAngle) * phDist * ISO_Y_RATIO;
    const phAlpha = 0.22 + Math.sin(time * 3 + ph * 1.5) * 0.1;
    ctx.fillStyle = `rgba(200, 150, 50, ${phAlpha})`;
    ctx.beginPath();
    ctx.arc(phX, phY2, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Armored shell highlight
  ctx.save();
  const asShellShimX = x + Math.cos(time * 1.5) * size * 0.1;
  const asShellGrad = ctx.createRadialGradient(asShellShimX, y + size * 0.1, 0, asShellShimX, y + size * 0.1, size * 0.12);
  asShellGrad.addColorStop(0, `rgba(255, 220, 160, ${0.16 + Math.sin(time * 2) * 0.08})`);
  asShellGrad.addColorStop(1, "rgba(255, 220, 160, 0)");
  ctx.fillStyle = asShellGrad;
  ctx.beginPath();
  ctx.ellipse(asShellShimX, y + size * 0.1, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawLocustEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.1;

  // Wings (large, semi-transparent with rapid flutter)
  drawInsectWings(ctx, x, y, size, time, zoom, "163, 163, 35", 0.3, 14, 0.55);

  // Hind legs (powerful jumping legs with muscular femur)
  for (let side = -1; side <= 1; side += 2) {
    const legBend = Math.sin(time * 4) * 0.1;
    const femurStartX = x + side * size * 0.06;
    const femurStartY = y + size * 0.02;
    const kneeX = x + side * size * 0.2;
    const kneeY = y - size * 0.12 + legBend * size;
    const tibiaEndX = x + side * size * 0.35;
    const tibiaEndY = y + size * 0.2 - legBend * size;

    // Femur (thick, muscular with organic bulge)
    const femurGrad = ctx.createLinearGradient(femurStartX, femurStartY, kneeX, kneeY);
    femurGrad.addColorStop(0, bodyColor);
    femurGrad.addColorStop(0.5, bodyColorLight);
    femurGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = femurGrad;
    const fNx = -(kneeY - femurStartY);
    const fNy = kneeX - femurStartX;
    const fLen = Math.sqrt(fNx * fNx + fNy * fNy) || 1;
    const bulge = size * 0.03;
    ctx.beginPath();
    ctx.moveTo(femurStartX, femurStartY);
    ctx.bezierCurveTo(
      (femurStartX + kneeX) / 2 + (fNx / fLen) * bulge * 1.8,
      (femurStartY + kneeY) / 2 + (fNy / fLen) * bulge * 1.8,
      kneeX + (fNx / fLen) * bulge * 0.5,
      kneeY + (fNy / fLen) * bulge * 0.5,
      kneeX, kneeY,
    );
    ctx.bezierCurveTo(
      kneeX - (fNx / fLen) * bulge * 0.5,
      kneeY - (fNy / fLen) * bulge * 0.5,
      (femurStartX + kneeX) / 2 - (fNx / fLen) * bulge * 1.2,
      (femurStartY + kneeY) / 2 - (fNy / fLen) * bulge * 1.2,
      femurStartX, femurStartY,
    );
    ctx.fill();
    // Femur herringbone ridge pattern
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.6 * zoom;
    for (let hr = 0; hr < 3; hr++) {
      const t = 0.25 + hr * 0.2;
      const hx = femurStartX + (kneeX - femurStartX) * t;
      const hy = femurStartY + (kneeY - femurStartY) * t;
      ctx.beginPath();
      ctx.moveTo(hx + (fNx / fLen) * size * 0.015, hy + (fNy / fLen) * size * 0.015);
      ctx.lineTo(hx - (fNx / fLen) * size * 0.015, hy - (fNy / fLen) * size * 0.015);
      ctx.stroke();
    }

    // Tibia (thinner, with tibial spurs)
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 2 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.quadraticCurveTo(
      (kneeX + tibiaEndX) / 2 + side * size * 0.01,
      (kneeY + tibiaEndY) / 2 - size * 0.02,
      tibiaEndX, tibiaEndY,
    );
    ctx.stroke();
    // Tibial spurs
    ctx.lineWidth = 1 * zoom;
    ctx.strokeStyle = bodyColorDark;
    for (let sp = 0; sp < 3; sp++) {
      const st = 0.3 + sp * 0.2;
      const spx = kneeX + (tibiaEndX - kneeX) * st;
      const spy = kneeY + (tibiaEndY - kneeY) * st;
      ctx.beginPath();
      ctx.moveTo(spx, spy);
      ctx.lineTo(spx + side * size * 0.015, spy - size * 0.01);
      ctx.stroke();
    }

    // Knee joint
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, size * 0.018, 0, Math.PI * 2);
    ctx.fill();

    // Tarsus (segmented foot)
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(tibiaEndX, tibiaEndY);
    ctx.lineTo(tibiaEndX + side * size * 0.02, tibiaEndY + size * 0.02);
    ctx.lineTo(tibiaEndX + side * size * 0.035, tibiaEndY + size * 0.035);
    ctx.stroke();
  }

  // Middle/front legs (dangling in flight)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let leg = 0; leg < 4; leg++) {
    const lx = x + (leg % 2 === 0 ? -1 : 1) * size * 0.04;
    const ly = y + (Math.floor(leg / 2) - 0.5) * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + Math.sin(time * 5 + leg) * size * 0.02, ly + size * 0.15);
    ctx.stroke();
  }

  // Abdomen (cylindrical, tapered with segmentation)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.08);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.08, x + size * 0.09, y - size * 0.02, x + size * 0.085, y + size * 0.05);
  ctx.bezierCurveTo(x + size * 0.07, y + size * 0.15, x + size * 0.03, y + size * 0.2, x, y + size * 0.21);
  ctx.bezierCurveTo(x - size * 0.03, y + size * 0.2, x - size * 0.07, y + size * 0.15, x - size * 0.085, y + size * 0.05);
  ctx.bezierCurveTo(x - size * 0.09, y - size * 0.02, x - size * 0.06, y - size * 0.08, x, y - size * 0.08);
  ctx.fill();
  // Abdomen segment lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let ls = 0; ls < 4; ls++) {
    const lsY = y - size * 0.04 + ls * size * 0.055;
    const lsW = size * (0.07 - ls * 0.008);
    ctx.beginPath();
    ctx.moveTo(x - lsW, lsY);
    ctx.quadraticCurveTo(x, lsY + size * 0.01, x + lsW, lsY);
    ctx.stroke();
  }

  // Thorax (compact, angular)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.04);
  ctx.bezierCurveTo(x - size * 0.08, y - size * 0.08, x - size * 0.05, y - size * 0.12, x, y - size * 0.12);
  ctx.bezierCurveTo(x + size * 0.05, y - size * 0.12, x + size * 0.08, y - size * 0.08, x + size * 0.06, y - size * 0.04);
  ctx.bezierCurveTo(x + size * 0.03, y - size * 0.02, x - size * 0.03, y - size * 0.02, x - size * 0.06, y - size * 0.04);
  ctx.fill();

  // Pronotum (saddle-shaped shield — extended with texture)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, y - size * 0.04);
  ctx.bezierCurveTo(x - size * 0.1, y - size * 0.1, x - size * 0.04, y - size * 0.14, x, y - size * 0.14);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.14, x + size * 0.1, y - size * 0.1, x + size * 0.11, y - size * 0.04);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.02, x - size * 0.06, y - size * 0.02, x - size * 0.11, y - size * 0.04);
  ctx.fill();
  // Pronotum keel ridge (median carina) + lateral carinae
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.13);
  ctx.lineTo(x, y - size * 0.03);
  ctx.stroke();
  // Lateral carinae (parallel ridges flanking the keel)
  ctx.lineWidth = 0.7 * zoom;
  for (let lcSide = -1; lcSide <= 1; lcSide += 2) {
    ctx.beginPath();
    ctx.moveTo(x + lcSide * size * 0.04, y - size * 0.12);
    ctx.quadraticCurveTo(x + lcSide * size * 0.05, y - size * 0.07, x + lcSide * size * 0.04, y - size * 0.03);
    ctx.stroke();
  }
  // Pronotum surface texture (small raised bumps)
  ctx.fillStyle = `rgba(0, 0, 0, 0.06)`;
  for (let pb = 0; pb < 4; pb++) {
    const pbx = x + Math.sin(pb * 1.8) * size * 0.035;
    const pby = y - size * 0.1 + pb * size * 0.02;
    ctx.beginPath();
    ctx.arc(pbx, pby, size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head (vertical face with frons)
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.24);
  ctx.bezierCurveTo(x + size * 0.05, y - size * 0.24, x + size * 0.07, y - size * 0.2, x + size * 0.065, y - size * 0.16);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.13, x + size * 0.02, y - size * 0.12, x, y - size * 0.13);
  ctx.bezierCurveTo(x - size * 0.02, y - size * 0.12, x - size * 0.06, y - size * 0.13, x - size * 0.065, y - size * 0.16);
  ctx.bezierCurveTo(x - size * 0.07, y - size * 0.2, x - size * 0.05, y - size * 0.24, x, y - size * 0.24);
  ctx.fill();

  // Eyes
  ctx.fillStyle = `rgba(180, 180, 40, ${0.7 + Math.sin(time * 3) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.2, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.2, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Antennae (short)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.22);
    ctx.lineTo(x + side * size * 0.1 + Math.sin(time * 6) * size * 0.01, y - size * 0.3);
    ctx.stroke();
  }

  // Enhancement: Wing membrane glow
  ctx.save();
  const lcWingGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 0.4);
  lcWingGlow.addColorStop(0, `rgba(163, 163, 35, ${0.12 + Math.sin(time * 6) * 0.06})`);
  lcWingGlow.addColorStop(1, "rgba(163, 163, 35, 0)");
  ctx.fillStyle = lcWingGlow;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Dust trail particles
  ctx.save();
  for (let lp = 0; lp < 5; lp++) {
    const lpPhase = (time * 2 + lp * 0.5) % 2;
    const lpX = x + size * 0.12 + lpPhase * size * 0.22;
    const lpY2 = y + size * 0.15 + Math.sin(time * 4 + lp * 1.2) * size * 0.06;
    const lpAlpha = Math.max(0, 0.25 - lpPhase * 0.12);
    ctx.fillStyle = `rgba(180, 170, 80, ${lpAlpha})`;
    ctx.beginPath();
    ctx.arc(lpX, lpY2, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Body shimmer
  ctx.save();
  const lcBodyGlow = ctx.createRadialGradient(x, y + size * 0.02, 0, x, y + size * 0.02, size * 0.1);
  lcBodyGlow.addColorStop(0, `rgba(200, 200, 80, ${0.15 + Math.sin(time * 3) * 0.07})`);
  lcBodyGlow.addColorStop(1, "rgba(200, 200, 80, 0)");
  ctx.fillStyle = lcBodyGlow;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.02, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Swarm speed: wing blur afterimage trail
  ctx.save();
  for (let wai = 0; wai < 3; wai++) {
    const waiOff = (wai + 1) * size * 0.11 + Math.sin(time * 6 + wai) * size * 0.015;
    const waiScale = 1 - (wai + 1) * 0.15;
    const waiAlpha = [0.12, 0.08, 0.04][wai];
    ctx.globalAlpha = waiAlpha;
    ctx.fillStyle = "#a3a323";
    ctx.beginPath();
    ctx.ellipse(
      x + waiOff, y + wai * size * 0.01,
      size * 0.25 * waiScale, size * 0.07 * waiScale,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Swarm speed: swarm dust particles kicked up
  ctx.save();
  for (let sd = 0; sd < 5; sd++) {
    const sdPhase = (time * 4 + sd * 0.55) % 1.3;
    const sdSide = sd % 2 === 0 ? -1 : 1;
    const sdX = x + sdSide * size * 0.08 + sdPhase * sdSide * size * 0.1;
    const sdY = y + size * 0.2 - sdPhase * size * 0.1 + Math.sin(time * 5 + sd * 1.8) * size * 0.03;
    const sdAlpha = Math.max(0, 0.2 - sdPhase * 0.14);
    const sdR = size * 0.01 * (1 - sdPhase * 0.4);
    ctx.fillStyle = `rgba(180, 170, 100, ${sdAlpha})`;
    ctx.beginPath();
    ctx.arc(sdX, sdY, sdR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTrapdoorSpiderEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  size *= 1.35;

  // Dirt/burrow particles around base
  ctx.fillStyle = "rgba(120, 90, 50, 0.25)";
  for (let d = 0; d < 6; d++) {
    const da = d * (Math.PI / 3) + time * 0.2;
    const dd = size * (0.4 + Math.sin(time * 1.5 + d) * 0.05);
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(da) * dd, y + size * 0.3 + Math.sin(da * 0.5) * size * 0.03,
      size * 0.06, size * 0.02, da, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Spider legs (thick, powerful)
  drawSpiderLegs(ctx, x, y, size, time, zoom, bodyColor, bodyColorDark, 4, 3.5);

  // Large round abdomen (stocky, bulbous build with organic contour)
  const tsAbdGrad = ctx.createRadialGradient(x, y + size * 0.08, 0, x, y + size * 0.08, size * 0.3);
  tsAbdGrad.addColorStop(0, bodyColorLight);
  tsAbdGrad.addColorStop(0.4, bodyColor);
  tsAbdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = tsAbdGrad;
  const tsAbdW = size * 0.28;
  const tsAbdH = size * 0.24;
  const tsAbdY = y + size * 0.08;
  ctx.beginPath();
  ctx.moveTo(x, tsAbdY - tsAbdH);
  ctx.bezierCurveTo(x + tsAbdW * 0.75, tsAbdY - tsAbdH * 1.0, x + tsAbdW * 1.1, tsAbdY - tsAbdH * 0.2, x + tsAbdW, tsAbdY + tsAbdH * 0.1);
  ctx.bezierCurveTo(x + tsAbdW * 0.9, tsAbdY + tsAbdH * 0.65, x + tsAbdW * 0.45, tsAbdY + tsAbdH * 1.05, x, tsAbdY + tsAbdH);
  ctx.bezierCurveTo(x - tsAbdW * 0.45, tsAbdY + tsAbdH * 1.05, x - tsAbdW * 0.9, tsAbdY + tsAbdH * 0.65, x - tsAbdW, tsAbdY + tsAbdH * 0.1);
  ctx.bezierCurveTo(x - tsAbdW * 1.1, tsAbdY - tsAbdH * 0.2, x - tsAbdW * 0.75, tsAbdY - tsAbdH * 1.0, x, tsAbdY - tsAbdH);
  ctx.fill();

  // Abdomen texture (dirt/camouflage patches — irregular bezier blobs)
  ctx.fillStyle = `rgba(100, 70, 40, 0.3)`;
  for (let t = 0; t < 5; t++) {
    const tx = x + Math.sin(t * 2.1) * size * 0.12;
    const ty = y + size * 0.05 + Math.cos(t * 1.7) * size * 0.1;
    const tr = size * 0.04;
    ctx.beginPath();
    ctx.moveTo(tx - tr, ty);
    ctx.bezierCurveTo(tx - tr * 0.8, ty - tr * 1.2, tx + tr * 0.8, ty - tr * 1.0, tx + tr, ty + tr * 0.2);
    ctx.bezierCurveTo(tx + tr * 0.6, ty + tr * 1.1, tx - tr * 0.6, ty + tr * 0.9, tx - tr, ty);
    ctx.fill();
  }
  // Abdomen chitin plate lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let pl = 0; pl < 3; pl++) {
    const plY = tsAbdY - tsAbdH * 0.3 + pl * tsAbdH * 0.4;
    const plW = tsAbdW * (0.85 - pl * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - plW, plY);
    ctx.quadraticCurveTo(x, plY + tsAbdH * 0.06, x + plW, plY);
    ctx.stroke();
  }
  // Abdomen hair tufts (bristly spider hairs radiating outward)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let ah = 0; ah < 12; ah++) {
    const aha = (ah / 12) * Math.PI * 2;
    const ahR = tsAbdW * 0.85;
    const ahx = x + Math.cos(aha) * ahR;
    const ahy = tsAbdY + Math.sin(aha) * tsAbdH * 0.85;
    ctx.beginPath();
    ctx.moveTo(ahx, ahy);
    ctx.lineTo(ahx + Math.cos(aha) * size * 0.025, ahy + Math.sin(aha) * size * 0.02);
    ctx.stroke();
  }
  // Silk pad remnants (small patches of silk on abdomen surface)
  ctx.fillStyle = `rgba(200, 200, 210, 0.08)`;
  for (let sp = 0; sp < 3; sp++) {
    const spA = sp * 2.2 + 1.0;
    const spR = size * 0.08;
    ctx.beginPath();
    ctx.arc(x + Math.cos(spA) * spR, tsAbdY + Math.sin(spA) * spR * 0.7, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cephalothorax (front body — wider, more angular)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.24);
  ctx.bezierCurveTo(x + size * 0.12, y - size * 0.24, x + size * 0.19, y - size * 0.16, x + size * 0.18, y - size * 0.08);
  ctx.bezierCurveTo(x + size * 0.16, y - size * 0.01, x + size * 0.08, y + size * 0.02, x, y + size * 0.01);
  ctx.bezierCurveTo(x - size * 0.08, y + size * 0.02, x - size * 0.16, y - size * 0.01, x - size * 0.18, y - size * 0.08);
  ctx.bezierCurveTo(x - size * 0.19, y - size * 0.16, x - size * 0.12, y - size * 0.24, x, y - size * 0.24);
  ctx.fill();
  // Cephalothorax fovea groove
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x, y - size * 0.06);
  ctx.stroke();

  // Massive chelicerae/fangs (downward pointing with basal segment)
  const fangSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 4) * size * 0.06 : Math.sin(time * 2) * size * 0.01;
  for (let side = -1; side <= 1; side += 2) {
    // Chelicera basal segment (thick, muscular)
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.2);
    ctx.bezierCurveTo(
      x + side * (size * 0.07 + fangSpread * 0.3), y - size * 0.22,
      x + side * (size * 0.08 + fangSpread * 0.5), y - size * 0.25,
      x + side * (size * 0.06 + fangSpread * 0.5), y - size * 0.27,
    );
    ctx.bezierCurveTo(
      x + side * size * 0.03, y - size * 0.26,
      x + side * size * 0.02, y - size * 0.23,
      x + side * size * 0.04, y - size * 0.2,
    );
    ctx.fill();
    // Fang (curved, sharp)
    ctx.fillStyle = "#1a0805";
    ctx.beginPath();
    ctx.moveTo(x + side * (size * 0.06 + fangSpread * 0.5), y - size * 0.27);
    ctx.bezierCurveTo(
      x + side * (size * 0.08 + fangSpread * 0.8), y - size * 0.32,
      x + side * (size * 0.05 + fangSpread * 0.5), y - size * 0.37,
      x + side * (size * 0.03 + fangSpread * 0.3), y - size * 0.39,
    );
    ctx.bezierCurveTo(
      x + side * (size * 0.025 + fangSpread * 0.2), y - size * 0.35,
      x + side * size * 0.03, y - size * 0.3,
      x + side * (size * 0.06 + fangSpread * 0.5), y - size * 0.27,
    );
    ctx.fill();
  }

  // Venom on fangs
  ctx.fillStyle = `rgba(160, 200, 60, ${0.6 + Math.sin(time * 4) * 0.3})`;
  setShadowBlur(ctx, 5 * zoom, "#a0c83c");
  ctx.beginPath();
  ctx.arc(x - size * 0.03, y - size * 0.37, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.03, y - size * 0.37, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Eyes (6 eyes in two rows)
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.17, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.17, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x - size * 0.09, y - size * 0.14, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.14, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x - size * 0.03, y - size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.03, y - size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow
  ctx.fillStyle = `rgba(160, 200, 60, ${0.5 + Math.sin(time * 3) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.17, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.17, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Silk thread from spinnerets
  ctx.strokeStyle = `rgba(200, 200, 210, ${0.2 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.quadraticCurveTo(x + Math.sin(time * 0.8) * size * 0.15, y + size * 0.4, x, y + size * 0.5);
  ctx.stroke();

  // Ambush burst effect on attack
  if (isAttacking) {
    // Dirt explosion
    for (let d = 0; d < 8; d++) {
      const da = (d / 8) * Math.PI * 2 + time;
      const dd = attackPhase * size * 0.4;
      const dalpha = (1 - attackPhase) * 0.4;
      ctx.fillStyle = `rgba(120, 90, 50, ${dalpha})`;
      ctx.beginPath();
      ctx.arc(x + Math.cos(da) * dd, y + Math.sin(da) * dd * 0.5 + size * 0.1, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Enhancement: Chitinous camouflage shimmer
  ctx.save();
  const tsShimX = x + Math.cos(time * 1.5) * size * 0.14;
  const tsShimGrad = ctx.createRadialGradient(tsShimX, y + size * 0.06, 0, tsShimX, y + size * 0.06, size * 0.12);
  tsShimGrad.addColorStop(0, `rgba(200, 170, 120, ${0.16 + Math.sin(time * 2) * 0.08})`);
  tsShimGrad.addColorStop(1, "rgba(200, 170, 120, 0)");
  ctx.fillStyle = tsShimGrad;
  ctx.beginPath();
  ctx.ellipse(tsShimX, y + size * 0.06, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Eye cluster glow (individual per-eye)
  ctx.save();
  const tsEyeSpots = [
    [-0.05, -0.17, 0.03], [0.05, -0.17, 0.03],
    [-0.09, -0.14, 0.02], [0.09, -0.14, 0.02],
    [-0.03, -0.2, 0.015], [0.03, -0.2, 0.015],
  ];
  for (let te = 0; te < tsEyeSpots.length; te++) {
    const tsEpx = x + tsEyeSpots[te][0] * size;
    const tsEpy = y + tsEyeSpots[te][1] * size;
    const tsEr = tsEyeSpots[te][2] * size * 2.2;
    const tsEyeGrad = ctx.createRadialGradient(tsEpx, tsEpy, 0, tsEpx, tsEpy, tsEr);
    tsEyeGrad.addColorStop(0, `rgba(160, 200, 60, ${0.25 + Math.sin(time * 3 + te * 0.9) * 0.12})`);
    tsEyeGrad.addColorStop(1, "rgba(160, 200, 60, 0)");
    ctx.fillStyle = tsEyeGrad;
    ctx.beginPath();
    ctx.arc(tsEpx, tsEpy, tsEr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Web tripwire strands
  ctx.save();
  ctx.strokeStyle = `rgba(200, 200, 210, ${0.12 + Math.sin(time * 1) * 0.05})`;
  ctx.lineWidth = 0.6 * zoom;
  for (let tw = 0; tw < 4; tw++) {
    const twA = tw * (Math.PI / 2) + time * 0.15;
    const twR = size * (0.42 + Math.sin(time * 0.6 + tw) * 0.04);
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.quadraticCurveTo(
      x + Math.cos(twA) * twR * 0.4, y + size * 0.3 + Math.sin(twA) * twR * 0.3,
      x + Math.cos(twA) * twR, y + size * 0.3 + Math.sin(twA) * twR * 0.4,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// =====================================================
// WINTER BUGS
// =====================================================

export function drawIceBeetleEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.3;

  // Frost aura ground effect
  const frostRadius = size * 0.5;
  const frostGrad = ctx.createRadialGradient(x, y + size * 0.15, 0, x, y + size * 0.15, frostRadius);
  frostGrad.addColorStop(0, `rgba(103, 232, 249, ${0.15 + Math.sin(time * 2) * 0.05})`);
  frostGrad.addColorStop(0.6, `rgba(103, 232, 249, ${0.08})`);
  frostGrad.addColorStop(1, "rgba(103, 232, 249, 0)");
  ctx.fillStyle = frostGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, frostRadius, frostRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (6, beetle style)
  const crawl = time * 3.5;
  const legAngleSet = [-0.35, 0, 0.35];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 3; leg++) {
      const gait = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawl + gait);
      const lift = Math.max(0, stride);
      const a = legAngleSet[leg];
      const bx = x + side * size * 0.1;
      const by = y + leg * size * 0.06;
      const mx = bx + side * size * 0.16;
      const my = by + a * size * 0.08 - lift * size * 0.05;
      const ex = bx + side * size * 0.3;
      const ey = by + a * size * 0.18 + size * 0.12 - lift * size * 0.02;
      // Icy legs
      const legColor = `rgba(103, 232, 249, 0.8)`;
      const legDark = `rgba(60, 180, 220, 0.9)`;
      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 4, zoom, legColor, legDark, size * 0.022);
    }
  }

  // Underbelly (dark ice beneath carapace)
  ctx.fillStyle = `rgba(30, 80, 100, 0.4)`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y + size * 0.06);
  ctx.bezierCurveTo(x - size * 0.15, y + size * 0.22, x + size * 0.15, y + size * 0.22, x + size * 0.18, y + size * 0.06);
  ctx.bezierCurveTo(x + size * 0.1, y + size * 0.12, x - size * 0.1, y + size * 0.12, x - size * 0.18, y + size * 0.06);
  ctx.fill();

  // Crystalline carapace (abdomen — faceted gem shape)
  const crystalGrad = ctx.createRadialGradient(x, y + size * 0.06, 0, x, y + size * 0.06, size * 0.28);
  crystalGrad.addColorStop(0, "rgba(200, 245, 255, 0.9)");
  crystalGrad.addColorStop(0.5, bodyColor);
  crystalGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = crystalGrad;
  const ibAbdY = y + size * 0.06;
  ctx.beginPath();
  ctx.moveTo(x, ibAbdY - size * 0.2);
  ctx.bezierCurveTo(x + size * 0.18, ibAbdY - size * 0.2, x + size * 0.26, ibAbdY - size * 0.08, x + size * 0.25, ibAbdY + size * 0.02);
  ctx.bezierCurveTo(x + size * 0.23, ibAbdY + size * 0.14, x + size * 0.12, ibAbdY + size * 0.2, x, ibAbdY + size * 0.2);
  ctx.bezierCurveTo(x - size * 0.12, ibAbdY + size * 0.2, x - size * 0.23, ibAbdY + size * 0.14, x - size * 0.25, ibAbdY + size * 0.02);
  ctx.bezierCurveTo(x - size * 0.26, ibAbdY - size * 0.08, x - size * 0.18, ibAbdY - size * 0.2, x, ibAbdY - size * 0.2);
  ctx.fill();

  // Ice crystal facets (angular refraction lines)
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 2.5) * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  for (let f = 0; f < 6; f++) {
    const fa = f * (Math.PI / 3) + 0.2;
    const fLen = size * (0.16 + Math.sin(f * 1.5) * 0.04);
    ctx.beginPath();
    ctx.moveTo(x, ibAbdY);
    ctx.lineTo(x + Math.cos(fa) * fLen, ibAbdY + Math.sin(fa) * fLen * 0.8);
    ctx.stroke();
  }
  // Crystalline surface plates
  ctx.strokeStyle = `rgba(180, 240, 255, 0.2)`;
  ctx.lineWidth = 0.7 * zoom;
  for (let cp = 0; cp < 3; cp++) {
    const cpY = ibAbdY - size * 0.1 + cp * size * 0.1;
    const cpW = size * (0.2 - cp * 0.02);
    ctx.beginPath();
    ctx.moveTo(x - cpW, cpY);
    ctx.quadraticCurveTo(x, cpY + size * 0.03, x + cpW, cpY);
    ctx.stroke();
  }

  // Ice crystal spines protruding from carapace surface
  ctx.fillStyle = `rgba(200, 245, 255, ${0.5 + Math.sin(time * 2) * 0.15})`;
  for (let sp = 0; sp < 5; sp++) {
    const spA = sp * 1.3 + 0.4;
    const spR = size * (0.12 + Math.sin(sp * 2.1) * 0.04);
    const spx = x + Math.cos(spA) * spR;
    const spy = ibAbdY + Math.sin(spA) * spR * 0.7;
    const spH = size * (0.04 + Math.sin(sp * 1.7) * 0.015);
    ctx.beginPath();
    ctx.moveTo(spx - size * 0.008, spy);
    ctx.lineTo(spx, spy - spH);
    ctx.lineTo(spx + size * 0.008, spy);
    ctx.fill();
  }

  // Elytra (ice wing cases — angular crystalline plates)
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = `rgba(160, 230, 255, 0.4)`;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.01, y - size * 0.18);
    ctx.bezierCurveTo(x + side * size * 0.1, y - size * 0.2, x + side * size * 0.15, y - size * 0.1, x + side * size * 0.14, y + size * 0.02);
    ctx.bezierCurveTo(x + side * size * 0.12, y + size * 0.12, x + side * size * 0.06, y + size * 0.16, x + side * size * 0.01, y + size * 0.14);
    ctx.bezierCurveTo(x + side * size * 0.005, y + size * 0.02, x + side * size * 0.005, y - size * 0.08, x + side * size * 0.01, y - size * 0.18);
    ctx.fill();
    // Elytra ridge
    ctx.strokeStyle = `rgba(200, 245, 255, 0.3)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.16);
    ctx.bezierCurveTo(x + side * size * 0.09, y - size * 0.04, x + side * size * 0.08, y + size * 0.06, x + side * size * 0.04, y + size * 0.12);
    ctx.stroke();
  }

  // Pronotum (angular ice shield)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.12);
  ctx.bezierCurveTo(x - size * 0.14, y - size * 0.16, x - size * 0.06, y - size * 0.22, x, y - size * 0.22);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.22, x + size * 0.14, y - size * 0.16, x + size * 0.1, y - size * 0.12);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.1, x - size * 0.06, y - size * 0.1, x - size * 0.1, y - size * 0.12);
  ctx.fill();

  // Head (crystalline, angular)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.33);
  ctx.bezierCurveTo(x + size * 0.07, y - size * 0.33, x + size * 0.1, y - size * 0.28, x + size * 0.09, y - size * 0.23);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.19, x + size * 0.04, y - size * 0.18, x, y - size * 0.19);
  ctx.bezierCurveTo(x - size * 0.04, y - size * 0.18, x - size * 0.08, y - size * 0.19, x - size * 0.09, y - size * 0.23);
  ctx.bezierCurveTo(x - size * 0.1, y - size * 0.28, x - size * 0.07, y - size * 0.33, x, y - size * 0.33);
  ctx.fill();

  // Ice crystal horns
  ctx.fillStyle = `rgba(200, 245, 255, ${0.8 + Math.sin(time * 3) * 0.2})`;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.3);
    ctx.lineTo(x + side * size * 0.1, y - size * 0.42);
    ctx.lineTo(x + side * size * 0.08, y - size * 0.3);
    ctx.fill();
  }

  // Antennae
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.3);
    ctx.quadraticCurveTo(
      x + side * size * 0.1, y - size * 0.38 + Math.sin(time * 4 + side) * size * 0.02,
      x + side * size * 0.14, y - size * 0.4,
    );
    ctx.stroke();
  }

  // Icy eyes
  ctx.fillStyle = `rgba(103, 232, 249, ${0.8 + Math.sin(time * 3) * 0.2})`;
  setShadowBlur(ctx, 6 * zoom, "#67e8f9");
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.27, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.27, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Floating ice motes
  for (let m = 0; m < 4; m++) {
    const ma = time * 1.5 + m * 1.6;
    const md = size * 0.35;
    const mx = x + Math.cos(ma) * md;
    const my = y + Math.sin(ma) * md * 0.5 - size * 0.05;
    const mAlpha = 0.4 + Math.sin(time * 4 + m * 2) * 0.2;
    ctx.fillStyle = `rgba(200, 245, 255, ${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Enhancement: Carapace frost shimmer traveling
  ctx.save();
  const ibShimX = x + Math.cos(time * 1.5) * size * 0.15;
  const ibShimY = y + size * 0.04 + Math.sin(time * 1.2) * size * 0.08;
  const ibShimGrad = ctx.createRadialGradient(ibShimX, ibShimY, 0, ibShimX, ibShimY, size * 0.11);
  ibShimGrad.addColorStop(0, `rgba(200, 245, 255, ${0.22 + Math.sin(time * 3) * 0.1})`);
  ibShimGrad.addColorStop(1, "rgba(200, 245, 255, 0)");
  ctx.fillStyle = ibShimGrad;
  ctx.beginPath();
  ctx.ellipse(ibShimX, ibShimY, size * 0.11, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Frost crystal particles rising
  ctx.save();
  for (let fc = 0; fc < 5; fc++) {
    const fcPhase = (time * 1.2 + fc * 0.6) % 2;
    const fcX2 = x + Math.sin(fc * 2.5 + time * 0.5) * size * 0.22;
    const fcY2 = y + size * 0.1 - fcPhase * size * 0.22;
    const fcAlpha = Math.max(0, 0.35 - fcPhase * 0.18);
    ctx.save();
    ctx.translate(fcX2, fcY2);
    ctx.rotate(time * 2 + fc);
    const fcGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.014);
    fcGrad.addColorStop(0, `rgba(180, 240, 255, ${fcAlpha})`);
    fcGrad.addColorStop(1, "rgba(180, 240, 255, 0)");
    ctx.fillStyle = fcGrad;
    ctx.fillRect(-size * 0.01, -size * 0.01, size * 0.02, size * 0.02);
    ctx.restore();
  }
  ctx.restore();

  // Enhancement: Ice crack glow on carapace
  ctx.save();
  const ibCrackAlpha = 0.14 + Math.sin(time * 2.5) * 0.07;
  ctx.strokeStyle = `rgba(150, 230, 255, ${ibCrackAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.02);
  ctx.lineTo(x - size * 0.02, y + size * 0.08);
  ctx.lineTo(x + size * 0.1, y + size * 0.04);
  ctx.moveTo(x + size * 0.05, y - size * 0.02);
  ctx.lineTo(x - size * 0.04, y + size * 0.06);
  ctx.stroke();
  ctx.restore();
}

export function drawFrostTickEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  size *= 1.15;

  // Legs (8 tick legs - short, grippy)
  const crawl = time * 5.5;
  const legAngles = [-0.5, -0.15, 0.15, 0.5];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 4; leg++) {
      const gait = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawl + gait);
      const lift = Math.max(0, stride);
      const a = legAngles[leg];
      const bx = x + side * size * 0.08;
      const by = y - size * 0.02 + leg * size * 0.04;
      const mx = bx + side * size * 0.14;
      const my = by + a * size * 0.06 - lift * size * 0.04;
      const ex = bx + side * size * 0.25;
      const ey = by + a * size * 0.15 + size * 0.1 - lift * size * 0.02;
      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 2.5, zoom, bodyColorLight, bodyColor, size * 0.015);
    }
  }

  // Hypostome (feeding tube) glow
  const feedGlow = isAttacking ? 0.6 + attackPhase * 0.4 : 0.2 + Math.sin(time * 2) * 0.1;
  ctx.fillStyle = `rgba(165, 243, 252, ${feedGlow * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.25, size * 0.25 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Idiosoma (body — flattened teardrop shield shape)
  const ftBodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.22);
  ftBodyGrad.addColorStop(0, bodyColorLight);
  ftBodyGrad.addColorStop(0.5, bodyColor);
  ftBodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = ftBodyGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17);
  ctx.bezierCurveTo(x + size * 0.14, y - size * 0.17, x + size * 0.22, y - size * 0.08, x + size * 0.22, y);
  ctx.bezierCurveTo(x + size * 0.21, y + size * 0.1, x + size * 0.12, y + size * 0.18, x, y + size * 0.19);
  ctx.bezierCurveTo(x - size * 0.12, y + size * 0.18, x - size * 0.21, y + size * 0.1, x - size * 0.22, y);
  ctx.bezierCurveTo(x - size * 0.22, y - size * 0.08, x - size * 0.14, y - size * 0.17, x, y - size * 0.17);
  ctx.fill();

  // Scutum (dorsal shield — raised plate)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.04);
  ctx.bezierCurveTo(x - size * 0.13, y - size * 0.12, x - size * 0.06, y - size * 0.15, x, y - size * 0.15);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.15, x + size * 0.13, y - size * 0.12, x + size * 0.13, y - size * 0.04);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.02, x - size * 0.08, y - size * 0.02, x - size * 0.13, y - size * 0.04);
  ctx.fill();
  // Scutum edge ridge
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.04);
  ctx.quadraticCurveTo(x, y - size * 0.06, x + size * 0.12, y - size * 0.04);
  ctx.stroke();

  // Frost pattern on shell (branching ice crystals)
  ctx.strokeStyle = `rgba(200, 245, 255, ${0.3 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  for (let f = 0; f < 3; f++) {
    const fx = x + Math.sin(f * 2.1) * size * 0.08;
    const fy = y + Math.cos(f * 1.7) * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + size * 0.04, fy - size * 0.03);
    ctx.lineTo(fx + size * 0.05, fy - size * 0.02);
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - size * 0.03, fy - size * 0.04);
    ctx.lineTo(fx - size * 0.04, fy - size * 0.035);
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + size * 0.01, fy + size * 0.04);
    ctx.stroke();
  }
  // Body margin festoons (scalloped edge detail around tick body)
  ctx.fillStyle = bodyColorDark;
  for (let fest = 0; fest < 12; fest++) {
    const festA = (fest / 12) * Math.PI * 2;
    const festR = size * 0.19;
    const fx = x + Math.cos(festA) * festR;
    const fy = y + Math.sin(festA) * festR * 0.85;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.012, fy);
    ctx.bezierCurveTo(
      fx - size * 0.008, fy - size * 0.015,
      fx + size * 0.008, fy - size * 0.015,
      fx + size * 0.012, fy,
    );
    ctx.bezierCurveTo(
      fx + size * 0.008, fy + size * 0.008,
      fx - size * 0.008, fy + size * 0.008,
      fx - size * 0.012, fy,
    );
    ctx.fill();
  }
  // Alloscutum wrinkle lines (soft body texture outside scutum)
  ctx.strokeStyle = `rgba(0, 0, 0, 0.06)`;
  ctx.lineWidth = 0.5 * zoom;
  for (let aw = 0; aw < 4; aw++) {
    const awA = 0.8 + aw * 0.5;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(awA) * size * 0.06, y + Math.sin(awA) * size * 0.06);
    ctx.quadraticCurveTo(
      x + Math.cos(awA) * size * 0.12, y + Math.sin(awA) * size * 0.1,
      x + Math.cos(awA) * size * 0.16, y + Math.sin(awA) * size * 0.14,
    );
    ctx.stroke();
  }

  // Capitulum (head/mouthparts — small, angular)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.22, x + size * 0.06, y - size * 0.19, x + size * 0.055, y - size * 0.16);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.14, x + size * 0.02, y - size * 0.13, x, y - size * 0.14);
  ctx.bezierCurveTo(x - size * 0.02, y - size * 0.13, x - size * 0.04, y - size * 0.14, x - size * 0.055, y - size * 0.16);
  ctx.bezierCurveTo(x - size * 0.06, y - size * 0.19, x - size * 0.04, y - size * 0.22, x, y - size * 0.22);
  ctx.fill();

  // Hypostome (barbed feeding tube)
  ctx.strokeStyle = "#3a2a20";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x, y - size * 0.32);
  ctx.stroke();
  // Barbs
  for (let b = 0; b < 3; b++) {
    const by2 = y - size * 0.24 - b * size * 0.025;
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, by2);
    ctx.lineTo(x - size * 0.02, by2 + size * 0.015);
    ctx.moveTo(x, by2);
    ctx.lineTo(x + size * 0.02, by2 + size * 0.015);
    ctx.stroke();
  }

  // Palps
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.03, y - size * 0.2);
    ctx.lineTo(x + side * size * 0.06, y - size * 0.28 + Math.sin(time * 4 + side) * size * 0.01);
    ctx.stroke();
  }

  // Energy drain effect
  if (isAttacking) {
    const drainRadius = attackPhase * size * 0.4;
    ctx.strokeStyle = `rgba(165, 243, 252, ${(1 - attackPhase) * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y, drainRadius, drainRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Enhancement: Shell frost shimmer wave
  ctx.save();
  const ftShimPos = y + Math.sin(time * 2.5) * size * 0.12;
  const ftShimGrad = ctx.createRadialGradient(x, ftShimPos, 0, x, ftShimPos, size * 0.1);
  ftShimGrad.addColorStop(0, `rgba(200, 245, 255, ${0.2 + Math.sin(time * 3) * 0.1})`);
  ftShimGrad.addColorStop(1, "rgba(200, 245, 255, 0)");
  ctx.fillStyle = ftShimGrad;
  ctx.beginPath();
  ctx.ellipse(x, ftShimPos, size * 0.18, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Frost glow at hypostome tip
  ctx.save();
  const ftTipGrad = ctx.createRadialGradient(x, y - size * 0.32, 0, x, y - size * 0.32, size * 0.05);
  ftTipGrad.addColorStop(0, `rgba(165, 243, 252, ${0.3 + Math.sin(time * 4) * 0.15})`);
  ftTipGrad.addColorStop(1, "rgba(165, 243, 252, 0)");
  ctx.fillStyle = ftTipGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.32, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Cryo aura pulsing particles
  ctx.save();
  for (let cp2 = 0; cp2 < 4; cp2++) {
    const cp2Angle = time * 1.2 + cp2 * (Math.PI * 2 / 4);
    const cp2Dist = size * 0.22;
    const cp2X = x + Math.cos(cp2Angle) * cp2Dist;
    const cp2Y = y + Math.sin(cp2Angle) * cp2Dist * 0.6;
    const cp2Alpha = 0.2 + Math.sin(time * 3 + cp2 * 2) * 0.1;
    ctx.fillStyle = `rgba(180, 240, 255, ${cp2Alpha})`;
    ctx.beginPath();
    ctx.arc(cp2X, cp2Y, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawSnowMothEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.2;
  const flapAngle = Math.sin(time * 9) * 0.35;

  // Snowflake dust particles
  for (let p = 0; p < 10; p++) {
    const px = x + Math.sin(time * 1.5 + p * 1.3) * size * 0.6;
    const py = y + Math.cos(time * 1.2 + p * 1.1) * size * 0.4;
    const pAlpha = 0.25 + Math.sin(time * 3 + p) * 0.15;
    ctx.fillStyle = `rgba(224, 242, 254, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wings (white/ice blue with frost patterns)
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(side, 1);
    ctx.rotate(flapAngle * 0.3);

    // Upper wing
    const uwGrad = ctx.createRadialGradient(size * 0.18, -size * 0.08, 0, size * 0.18, -size * 0.08, size * 0.3);
    uwGrad.addColorStop(0, `rgba(240, 248, 255, 0.7)`);
    uwGrad.addColorStop(0.5, `rgba(200, 230, 245, 0.5)`);
    uwGrad.addColorStop(1, `rgba(160, 210, 240, 0.2)`);
    ctx.fillStyle = uwGrad;
    ctx.beginPath();
    ctx.moveTo(size * 0.03, -size * 0.03);
    ctx.quadraticCurveTo(size * 0.25, -size * 0.3, size * 0.4, -size * 0.12);
    ctx.quadraticCurveTo(size * 0.3, size * 0.04, size * 0.03, size * 0.01);
    ctx.fill();

    // Frost vein pattern (branching ice crystal network)
    ctx.strokeStyle = `rgba(200, 240, 255, 0.4)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.05, 0);
    ctx.bezierCurveTo(size * 0.1, -size * 0.05, size * 0.18, -size * 0.1, size * 0.28, -size * 0.14);
    ctx.moveTo(size * 0.12, -size * 0.06);
    ctx.lineTo(size * 0.18, -size * 0.04);
    ctx.moveTo(size * 0.2, -size * 0.1);
    ctx.lineTo(size * 0.26, -size * 0.06);
    ctx.stroke();
    ctx.moveTo(size * 0.05, 0);
    ctx.bezierCurveTo(size * 0.12, size * 0.01, size * 0.2, size * 0.02, size * 0.28, size * 0.0);
    ctx.stroke();

    // Wing edge frost scallops (icy fringe)
    ctx.fillStyle = `rgba(230, 248, 255, 0.3)`;
    for (let sc = 0; sc < 4; sc++) {
      const sct = 0.15 + sc * 0.18;
      const scx = size * (0.05 + sct * 0.35);
      const scy = -size * (0.02 + sct * 0.25);
      ctx.beginPath();
      ctx.arc(scx, scy, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lower wing
    ctx.fillStyle = `rgba(220, 238, 250, 0.4)`;
    ctx.beginPath();
    ctx.moveTo(size * 0.03, size * 0.01);
    ctx.quadraticCurveTo(size * 0.22, size * 0.12, size * 0.3, size * 0.08);
    ctx.quadraticCurveTo(size * 0.18, size * 0.01, size * 0.03, -size * 0.01);
    ctx.fill();

    ctx.restore();
  }

  // Fuzzy white body (plump, organic thorax+abdomen)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.09);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.09, x + size * 0.06, y - size * 0.03, x + size * 0.055, y + size * 0.03);
  ctx.bezierCurveTo(x + size * 0.05, y + size * 0.08, x + size * 0.025, y + size * 0.11, x, y + size * 0.11);
  ctx.bezierCurveTo(x - size * 0.025, y + size * 0.11, x - size * 0.05, y + size * 0.08, x - size * 0.055, y + size * 0.03);
  ctx.bezierCurveTo(x - size * 0.06, y - size * 0.03, x - size * 0.04, y - size * 0.09, x, y - size * 0.09);
  ctx.fill();
  // Fur tufts (short white bristle strokes)
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 1.2 * zoom;
  for (let f = 0; f < 8; f++) {
    const fa = (f / 8) * Math.PI * 2;
    const fx = x + Math.cos(fa) * size * 0.045;
    const fy = y + Math.sin(fa) * size * 0.065;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(fa) * size * 0.02, fy + Math.sin(fa) * size * 0.02);
    ctx.stroke();
  }
  // Body segment lines (thorax-abdomen division + abdomen segments)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.7 * zoom;
  for (let snSeg = 0; snSeg < 3; snSeg++) {
    const snSegY = y + size * 0.01 + snSeg * size * 0.03;
    const snSegW = size * (0.045 - snSeg * 0.004);
    ctx.beginPath();
    ctx.moveTo(x - snSegW, snSegY);
    ctx.quadraticCurveTo(x, snSegY + size * 0.01, x + snSegW, snSegY);
    ctx.stroke();
  }
  // Ventral frost fringe (ice-crystal tufts under body)
  ctx.strokeStyle = `rgba(200, 240, 255, 0.25)`;
  ctx.lineWidth = 0.8 * zoom;
  for (let vf = 0; vf < 4; vf++) {
    const vfx = x + (vf - 1.5) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(vfx, y + size * 0.09);
    ctx.lineTo(vfx + size * 0.003, y + size * 0.11);
    ctx.stroke();
  }

  // Head (round fluffy)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.17, x + size * 0.055, y - size * 0.14, x + size * 0.05, y - size * 0.11);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.09, x + size * 0.02, y - size * 0.085, x, y - size * 0.09);
  ctx.bezierCurveTo(x - size * 0.02, y - size * 0.085, x - size * 0.04, y - size * 0.09, x - size * 0.05, y - size * 0.11);
  ctx.bezierCurveTo(x - size * 0.055, y - size * 0.14, x - size * 0.04, y - size * 0.17, x, y - size * 0.17);
  ctx.fill();

  // Feathery antennae
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.02, y - size * 0.16);
    ctx.quadraticCurveTo(
      x + side * size * 0.08, y - size * 0.26 + Math.sin(time * 3 + side) * size * 0.02,
      x + side * size * 0.12, y - size * 0.3,
    );
    ctx.stroke();
    // Plumes
    for (let pl = 0; pl < 3; pl++) {
      const plx = x + side * size * (0.04 + pl * 0.025);
      const ply = y - size * (0.19 + pl * 0.03);
      ctx.beginPath();
      ctx.moveTo(plx, ply);
      ctx.lineTo(plx + side * size * 0.025, ply - size * 0.015);
      ctx.moveTo(plx, ply);
      ctx.lineTo(plx + side * size * 0.025, ply + size * 0.015);
      ctx.stroke();
    }
  }

  // Icy eyes
  ctx.fillStyle = `rgba(200, 240, 255, ${0.8 + Math.sin(time * 3) * 0.2})`;
  setShadowBlur(ctx, 5 * zoom, "#c8f0ff");
  ctx.beginPath();
  ctx.arc(x - size * 0.03, y - size * 0.15, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.03, y - size * 0.15, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Whiteout aura
  const auraAlpha = 0.08 + Math.sin(time * 2) * 0.04;
  ctx.fillStyle = `rgba(224, 242, 254, ${auraAlpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.55 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Enhancement: Wing frost crystal glow
  ctx.save();
  const snWingGlow = ctx.createRadialGradient(x, y, size * 0.04, x, y, size * 0.35);
  snWingGlow.addColorStop(0, `rgba(220, 245, 255, ${0.14 + Math.sin(time * 4) * 0.06})`);
  snWingGlow.addColorStop(0.5, `rgba(200, 230, 250, ${0.07 + Math.sin(time * 4) * 0.03})`);
  snWingGlow.addColorStop(1, "rgba(200, 230, 250, 0)");
  ctx.fillStyle = snWingGlow;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.35, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Body frost bioluminescence
  ctx.save();
  const snBioGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.08);
  snBioGrad.addColorStop(0, `rgba(224, 242, 254, ${0.22 + Math.sin(time * 2.5) * 0.1})`);
  snBioGrad.addColorStop(1, "rgba(224, 242, 254, 0)");
  ctx.fillStyle = snBioGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.07, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Falling ice crystal trail
  ctx.save();
  for (let sn2 = 0; sn2 < 6; sn2++) {
    const sn2Phase = (time * 1.5 + sn2 * 0.45) % 2.5;
    const sn2X = x + Math.sin(time * 1.2 + sn2 * 1.8) * size * 0.28;
    const sn2Y = y + sn2Phase * size * 0.15 + size * 0.1;
    const sn2Alpha = Math.max(0, 0.28 - sn2Phase * 0.11);
    ctx.save();
    ctx.translate(sn2X, sn2Y);
    ctx.rotate(time + sn2 * 1.5);
    const sn2Grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.012);
    sn2Grad.addColorStop(0, `rgba(220, 245, 255, ${sn2Alpha})`);
    sn2Grad.addColorStop(1, "rgba(220, 245, 255, 0)");
    ctx.fillStyle = sn2Grad;
    ctx.fillRect(-size * 0.008, -size * 0.008, size * 0.016, size * 0.016);
    ctx.restore();
  }
  ctx.restore();
}

// =====================================================
// VOLCANIC BUGS
// =====================================================

export function drawFireAntEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  size *= 1.4;

  // Heat shimmer aura
  const heatAlpha = 0.1 + Math.sin(time * 3) * 0.05;
  ctx.fillStyle = `rgba(220, 38, 38, ${heatAlpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.45, size * 0.45 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (6 with marching gait)
  const march = time * 4;
  const legAngleSet = [-0.35, 0, 0.35];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 3; leg++) {
      const gait = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(march + gait);
      const lift = Math.max(0, stride);
      const a = legAngleSet[leg];
      const bx = x + side * size * 0.1;
      const by = y + leg * size * 0.06;
      const mx = bx + side * size * 0.17;
      const my = by + a * size * 0.08 - lift * size * 0.05;
      const ex = bx + side * size * 0.32;
      const ey = by + a * size * 0.2 + size * 0.12 - lift * size * 0.02;
      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 4, zoom, bodyColor, bodyColorDark, size * 0.025);
    }
  }

  // Large gaster (abdomen — bulbous teardrop with tergites)
  const fireGlow = 0.3 + Math.sin(time * 3) * 0.2;
  const faAbdGrad = ctx.createRadialGradient(x, y + size * 0.12, 0, x, y + size * 0.12, size * 0.25);
  faAbdGrad.addColorStop(0, `rgba(255, 100, 30, ${fireGlow})`);
  faAbdGrad.addColorStop(0.4, bodyColor);
  faAbdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = faAbdGrad;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.0);
  ctx.bezierCurveTo(x + size * 0.14, y - size * 0.01, x + size * 0.23, y + size * 0.04, x + size * 0.22, y + size * 0.12);
  ctx.bezierCurveTo(x + size * 0.2, y + size * 0.24, x + size * 0.08, y + size * 0.3, x, y + size * 0.3);
  ctx.bezierCurveTo(x - size * 0.08, y + size * 0.3, x - size * 0.2, y + size * 0.24, x - size * 0.22, y + size * 0.12);
  ctx.bezierCurveTo(x - size * 0.23, y + size * 0.04, x - size * 0.14, y - size * 0.01, x, y + size * 0.0);
  ctx.fill();

  // Segment lines on gaster (curved tergite boundaries)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let s = 0; s < 3; s++) {
    const sy2 = y + size * 0.06 + s * size * 0.065;
    const sw = size * (0.18 - s * 0.03);
    ctx.beginPath();
    ctx.moveTo(x - sw, sy2);
    ctx.quadraticCurveTo(x, sy2 + size * 0.02, x + sw, sy2);
    ctx.stroke();
  }
  // Gaster surface pore dots (alarm pheromone glands)
  ctx.fillStyle = `rgba(0, 0, 0, 0.08)`;
  for (let gp = 0; gp < 8; gp++) {
    const gpA = gp * 0.85 + 0.3;
    const gpR = size * (0.08 + Math.sin(gp * 1.5) * 0.03);
    ctx.beginPath();
    ctx.arc(x + Math.cos(gpA) * gpR, y + size * 0.12 + Math.sin(gpA) * gpR * 0.7, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }
  // Stinger at gaster tip (acid pore/sting)
  ctx.fillStyle = "#3a0a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.015, y + size * 0.27);
  ctx.bezierCurveTo(x - size * 0.01, y + size * 0.3, x + size * 0.01, y + size * 0.3, x + size * 0.015, y + size * 0.27);
  ctx.bezierCurveTo(x + size * 0.005, y + size * 0.34, x - size * 0.005, y + size * 0.34, x - size * 0.015, y + size * 0.27);
  ctx.fill();

  // Petiole (narrow waist node)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.01);
  ctx.bezierCurveTo(x - size * 0.045, y - size * 0.035, x + size * 0.045, y - size * 0.035, x + size * 0.04, y - size * 0.01);
  ctx.bezierCurveTo(x + size * 0.045, y + size * 0.015, x - size * 0.045, y + size * 0.015, x - size * 0.04, y - size * 0.01);
  ctx.fill();

  // Mesosoma (armored thorax)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.19);
  ctx.bezierCurveTo(x + size * 0.1, y - size * 0.19, x + size * 0.16, y - size * 0.14, x + size * 0.15, y - size * 0.08);
  ctx.bezierCurveTo(x + size * 0.13, y - size * 0.03, x + size * 0.06, y - size * 0.01, x, y - size * 0.02);
  ctx.bezierCurveTo(x - size * 0.06, y - size * 0.01, x - size * 0.13, y - size * 0.03, x - size * 0.15, y - size * 0.08);
  ctx.bezierCurveTo(x - size * 0.16, y - size * 0.14, x - size * 0.1, y - size * 0.19, x, y - size * 0.19);
  ctx.fill();
  // Mesosoma dorsal ridge
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.1);
  ctx.quadraticCurveTo(x, y - size * 0.13, x + size * 0.08, y - size * 0.1);
  ctx.stroke();

  // Crown/crest (queen)
  ctx.fillStyle = `rgba(255, 200, 50, ${0.7 + Math.sin(time * 2) * 0.2})`;
  ctx.beginPath();
  for (let c = 0; c < 5; c++) {
    const cx2 = x - size * 0.1 + c * size * 0.05;
    ctx.moveTo(cx2, y - size * 0.28);
    ctx.lineTo(cx2 + size * 0.015, y - size * 0.35 - Math.sin(c * 1.2) * size * 0.02);
    ctx.lineTo(cx2 + size * 0.03, y - size * 0.28);
  }
  ctx.fill();

  // Head (squared-off fire ant head)
  const faHeadGrad = ctx.createRadialGradient(x, y - size * 0.22, 0, x, y - size * 0.22, size * 0.12);
  faHeadGrad.addColorStop(0, bodyColor);
  faHeadGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = faHeadGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.32, x + size * 0.12, y - size * 0.27, x + size * 0.12, y - size * 0.22);
  ctx.bezierCurveTo(x + size * 0.11, y - size * 0.17, x + size * 0.06, y - size * 0.15, x, y - size * 0.16);
  ctx.bezierCurveTo(x - size * 0.06, y - size * 0.15, x - size * 0.11, y - size * 0.17, x - size * 0.12, y - size * 0.22);
  ctx.bezierCurveTo(x - size * 0.12, y - size * 0.27, x - size * 0.08, y - size * 0.32, x, y - size * 0.32);
  ctx.fill();

  // Mandibles
  const mandSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.1 : 0.04;
  ctx.fillStyle = "#3a0a0a";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.3);
    ctx.quadraticCurveTo(
      x + side * (size * 0.14 + mandSpread * size), y - size * 0.34,
      x + side * (size * 0.12 + mandSpread * size), y - size * 0.32,
    );
    ctx.lineTo(x + side * size * 0.04, y - size * 0.28);
    ctx.fill();
  }

  // Antennae
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.3);
    ctx.lineTo(x + side * size * 0.1, y - size * 0.36);
    ctx.quadraticCurveTo(
      x + side * size * 0.14, y - size * 0.4 + Math.sin(time * 4 + side) * size * 0.02,
      x + side * size * 0.18, y - size * 0.42,
    );
    ctx.stroke();
  }

  // Fire eyes
  ctx.fillStyle = `rgba(255, 120, 30, ${0.8 + Math.sin(time * 4) * 0.2})`;
  setShadowBlur(ctx, 5 * zoom, "#ff781e");
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.24, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.24, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Summoner pheromone ring
  const pheroAlpha = 0.15 + Math.sin(time * 2) * 0.08;
  ctx.strokeStyle = `rgba(255, 100, 30, ${pheroAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.setLineDash([4 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.48, size * 0.48 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Enhancement: Mandible fire gleam
  ctx.save();
  for (let faSide = -1; faSide <= 1; faSide += 2) {
    const faGleamX = x + faSide * (size * 0.12 + mandSpread * size);
    const faGleamY = y - size * 0.33;
    const faGleamGrad = ctx.createRadialGradient(faGleamX, faGleamY, 0, faGleamX, faGleamY, size * 0.05);
    faGleamGrad.addColorStop(0, `rgba(255, 200, 70, ${0.35 + Math.sin(time * 4 + faSide) * 0.15})`);
    faGleamGrad.addColorStop(1, "rgba(255, 200, 70, 0)");
    ctx.fillStyle = faGleamGrad;
    ctx.beginPath();
    ctx.arc(faGleamX, faGleamY, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Fire pheromone ember particles
  ctx.save();
  for (let fe = 0; fe < 7; fe++) {
    const feAngle = time * 0.9 + fe * (Math.PI * 2 / 7);
    const feDist = size * (0.38 + Math.sin(time * 1.5 + fe) * 0.06);
    const feX = x + Math.cos(feAngle) * feDist;
    const feY2 = y + Math.sin(feAngle) * feDist * ISO_Y_RATIO;
    const feAlpha = 0.25 + Math.sin(time * 4 + fe * 1.3) * 0.12;
    ctx.fillStyle = `rgba(255, ${Math.round(100 + Math.sin(fe * 1.5) * 40)}, 20, ${feAlpha})`;
    ctx.beginPath();
    ctx.arc(feX, feY2, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Enhancement: Shell heat glow highlights
  ctx.save();
  const faShellShimX = x + Math.sin(time * 1.8) * size * 0.08;
  const faShellGrad = ctx.createRadialGradient(faShellShimX, y + size * 0.1, 0, faShellShimX, y + size * 0.1, size * 0.15);
  faShellGrad.addColorStop(0, `rgba(255, 120, 30, ${0.15 + Math.sin(time * 3) * 0.07})`);
  faShellGrad.addColorStop(1, "rgba(255, 120, 30, 0)");
  ctx.fillStyle = faShellGrad;
  ctx.beginPath();
  ctx.ellipse(faShellShimX, y + size * 0.1, size * 0.15, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawMagmaBeetleEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.35;

  // Molten ground glow
  const heatGrad = ctx.createRadialGradient(x, y + size * 0.15, 0, x, y + size * 0.15, size * 0.4);
  heatGrad.addColorStop(0, `rgba(255, 80, 0, ${0.15 + Math.sin(time * 3) * 0.05})`);
  heatGrad.addColorStop(0.5, `rgba(255, 40, 0, 0.05)`);
  heatGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.4, size * 0.4 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (6 with lava glow)
  const crawl = time * 3;
  const legAngleSet = [-0.35, 0, 0.35];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 3; leg++) {
      const gait = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawl + gait);
      const lift = Math.max(0, stride);
      const a = legAngleSet[leg];
      const bx = x + side * size * 0.12;
      const by = y + leg * size * 0.06;
      const mx = bx + side * size * 0.18;
      const my = by + a * size * 0.08 - lift * size * 0.05;
      const ex = bx + side * size * 0.32;
      const ey = by + a * size * 0.18 + size * 0.12 - lift * size * 0.02;
      drawBugLeg(ctx, bx, by, mx, my, ex, ey, 4.5, zoom, bodyColor, bodyColorDark, size * 0.028);
    }
  }

  // Underbelly (molten glow visible beneath carapace)
  const underGrad = ctx.createRadialGradient(x, y + size * 0.1, 0, x, y + size * 0.1, size * 0.2);
  underGrad.addColorStop(0, `rgba(255, 80, 0, 0.3)`);
  underGrad.addColorStop(1, `rgba(80, 20, 0, 0.15)`);
  ctx.fillStyle = underGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.05);
  ctx.bezierCurveTo(x - size * 0.17, y + size * 0.24, x + size * 0.17, y + size * 0.24, x + size * 0.2, y + size * 0.05);
  ctx.bezierCurveTo(x + size * 0.12, y + size * 0.12, x - size * 0.12, y + size * 0.12, x - size * 0.2, y + size * 0.05);
  ctx.fill();

  // Obsidian carapace with magma cracks (faceted volcanic rock shape)
  const shellGrad = ctx.createRadialGradient(x, y + size * 0.05, 0, x, y + size * 0.05, size * 0.3);
  shellGrad.addColorStop(0, bodyColorLight);
  shellGrad.addColorStop(0.5, bodyColor);
  shellGrad.addColorStop(1, "#0a0505");
  ctx.fillStyle = shellGrad;
  const mbAbdY = y + size * 0.05;
  ctx.beginPath();
  ctx.moveTo(x, mbAbdY - size * 0.22);
  ctx.bezierCurveTo(x + size * 0.2, mbAbdY - size * 0.22, x + size * 0.29, mbAbdY - size * 0.08, x + size * 0.28, mbAbdY + size * 0.02);
  ctx.bezierCurveTo(x + size * 0.26, mbAbdY + size * 0.14, x + size * 0.14, mbAbdY + size * 0.22, x, mbAbdY + size * 0.22);
  ctx.bezierCurveTo(x - size * 0.14, mbAbdY + size * 0.22, x - size * 0.26, mbAbdY + size * 0.14, x - size * 0.28, mbAbdY + size * 0.02);
  ctx.bezierCurveTo(x - size * 0.29, mbAbdY - size * 0.08, x - size * 0.2, mbAbdY - size * 0.22, x, mbAbdY - size * 0.22);
  ctx.fill();
  // Obsidian plate texture lines
  ctx.strokeStyle = `rgba(10, 5, 5, 0.3)`;
  ctx.lineWidth = 0.8 * zoom;
  for (let op = 0; op < 3; op++) {
    const opY = mbAbdY - size * 0.1 + op * size * 0.1;
    const opW = size * (0.22 - op * 0.03);
    ctx.beginPath();
    ctx.moveTo(x - opW, opY);
    ctx.quadraticCurveTo(x, opY + size * 0.03, x + opW, opY);
    ctx.stroke();
  }

  // Lava crack lines
  const crackGlow = 0.5 + Math.sin(time * 2) * 0.3;
  ctx.strokeStyle = `rgba(255, 100, 20, ${crackGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.05);
  ctx.lineTo(x - size * 0.05, y + size * 0.08);
  ctx.lineTo(x + size * 0.08, y + size * 0.15);
  ctx.moveTo(x + size * 0.1, y - size * 0.03);
  ctx.lineTo(x + size * 0.03, y + size * 0.05);
  ctx.lineTo(x - size * 0.08, y + size * 0.18);
  ctx.moveTo(x, y - size * 0.08);
  ctx.lineTo(x + size * 0.05, y + size * 0.02);
  ctx.stroke();

  // Elytra seam
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.15);
  ctx.lineTo(x, y + size * 0.2);
  ctx.stroke();

  // Obsidian spine protrusions along carapace edge
  ctx.fillStyle = "#1a0a05";
  for (let vs = 0; vs < 6; vs++) {
    const vsA = vs * 1.1 + 0.3;
    const vsR = size * (0.2 + Math.sin(vs * 1.7) * 0.03);
    const vsx = x + Math.cos(vsA) * vsR;
    const vsy = mbAbdY + Math.sin(vsA) * vsR * 0.75;
    const vsH = size * (0.035 + Math.sin(vs * 2.3) * 0.01);
    ctx.beginPath();
    ctx.moveTo(vsx - size * 0.01, vsy);
    ctx.lineTo(vsx, vsy - vsH);
    ctx.lineTo(vsx + size * 0.01, vsy);
    ctx.fill();
  }
  // Cooled lava texture patches (rough surface)
  ctx.fillStyle = `rgba(30, 15, 10, 0.2)`;
  for (let cl = 0; cl < 5; cl++) {
    const clx = x + Math.sin(cl * 2.3 + 0.5) * size * 0.14;
    const cly = mbAbdY + Math.cos(cl * 1.8) * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(clx - size * 0.02, cly);
    ctx.bezierCurveTo(clx - size * 0.015, cly - size * 0.018, clx + size * 0.015, cly - size * 0.012, clx + size * 0.02, cly);
    ctx.bezierCurveTo(clx + size * 0.01, cly + size * 0.01, clx - size * 0.01, cly + size * 0.012, clx - size * 0.02, cly);
    ctx.fill();
  }

  // Pronotum (angular volcanic plate)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.12);
  ctx.bezierCurveTo(x - size * 0.16, y - size * 0.16, x - size * 0.08, y - size * 0.22, x, y - size * 0.22);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.22, x + size * 0.16, y - size * 0.16, x + size * 0.12, y - size * 0.12);
  ctx.bezierCurveTo(x + size * 0.06, y - size * 0.1, x - size * 0.06, y - size * 0.1, x - size * 0.12, y - size * 0.12);
  ctx.fill();
  // Pronotum magma vein
  ctx.strokeStyle = `rgba(255, 100, 20, ${0.3 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.16);
  ctx.quadraticCurveTo(x, y - size * 0.18, x + size * 0.06, y - size * 0.16);
  ctx.stroke();

  // Head (obsidian, angular)
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.33);
  ctx.bezierCurveTo(x + size * 0.08, y - size * 0.33, x + size * 0.12, y - size * 0.28, x + size * 0.11, y - size * 0.23);
  ctx.bezierCurveTo(x + size * 0.1, y - size * 0.19, x + size * 0.05, y - size * 0.18, x, y - size * 0.19);
  ctx.bezierCurveTo(x - size * 0.05, y - size * 0.18, x - size * 0.1, y - size * 0.19, x - size * 0.11, y - size * 0.23);
  ctx.bezierCurveTo(x - size * 0.12, y - size * 0.28, x - size * 0.08, y - size * 0.33, x, y - size * 0.33);
  ctx.fill();

  // Mandibles (lava-edged pincers)
  ctx.fillStyle = "#0a0505";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.05, y - size * 0.3);
    ctx.bezierCurveTo(
      x + side * size * 0.08, y - size * 0.34,
      x + side * size * 0.1, y - size * 0.37,
      x + side * size * 0.09, y - size * 0.38,
    );
    ctx.bezierCurveTo(
      x + side * size * 0.06, y - size * 0.37,
      x + side * size * 0.03, y - size * 0.35,
      x + side * size * 0.03, y - size * 0.32,
    );
    ctx.fill();
  }

  // Antennae
  ctx.strokeStyle = "#1a0a05";
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.3);
    ctx.quadraticCurveTo(
      x + side * size * 0.1, y - size * 0.38,
      x + side * size * 0.13, y - size * 0.4 + Math.sin(time * 4 + side) * size * 0.01,
    );
    ctx.stroke();
  }

  // Magma eyes
  ctx.fillStyle = `rgba(255, 160, 30, ${0.8 + Math.sin(time * 4) * 0.2})`;
  setShadowBlur(ctx, 6 * zoom, "#ffa01e");
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.27, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.27, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Ember particles
  for (let e = 0; e < 5; e++) {
    const ea = time * 2 + e * 1.3;
    const ed = size * (0.3 + Math.sin(ea) * 0.1);
    const eAlpha = 0.5 + Math.sin(time * 5 + e * 2) * 0.3;
    ctx.fillStyle = `rgba(255, ${Math.round(100 + Math.sin(e) * 60)}, 20, ${eAlpha})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(ea) * ed * 0.5,
      y - size * 0.1 + Math.sin(ea * 0.7) * ed * 0.3 - Math.abs(Math.sin(ea)) * size * 0.15,
      size * 0.01,
      0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Enhancement: Traveling magma shimmer on carapace
  ctx.save();
  const mbShimX = x + Math.cos(time * 1.3) * size * 0.15;
  const mbShimY2 = y + size * 0.03 + Math.sin(time * 1.0) * size * 0.08;
  const mbShimGrad = ctx.createRadialGradient(mbShimX, mbShimY2, 0, mbShimX, mbShimY2, size * 0.12);
  mbShimGrad.addColorStop(0, `rgba(255, 160, 40, ${0.2 + Math.sin(time * 2.5) * 0.1})`);
  mbShimGrad.addColorStop(1, "rgba(255, 160, 40, 0)");
  ctx.fillStyle = mbShimGrad;
  ctx.beginPath();
  ctx.ellipse(mbShimX, mbShimY2, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Lava crack pulse glow
  ctx.save();
  const mbCrackPulse = 0.15 + Math.sin(time * 1.5) * 0.08;
  const mbCrackGrad = ctx.createRadialGradient(x, y + size * 0.05, 0, x, y + size * 0.05, size * 0.22);
  mbCrackGrad.addColorStop(0, `rgba(255, 80, 0, ${mbCrackPulse})`);
  mbCrackGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
  ctx.fillStyle = mbCrackGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Rising heat distortion embers
  ctx.save();
  for (let he = 0; he < 4; he++) {
    const hePhase = (time * 1.5 + he * 0.7) % 2;
    const heX2 = x + Math.sin(he * 2.1 + time * 0.5) * size * 0.18;
    const heY2 = y - size * 0.05 - hePhase * size * 0.22;
    const heAlpha = Math.max(0, 0.35 - hePhase * 0.18);
    const heGrad = ctx.createRadialGradient(heX2, heY2, 0, heX2, heY2, size * 0.018);
    heGrad.addColorStop(0, `rgba(255, 200, 80, ${heAlpha})`);
    heGrad.addColorStop(1, "rgba(255, 200, 80, 0)");
    ctx.fillStyle = heGrad;
    ctx.beginPath();
    ctx.arc(heX2, heY2, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawAshMothEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.2;
  const flapAngle = Math.sin(time * 10) * 0.4;

  // Ember trail behind
  for (let e = 0; e < 8; e++) {
    const ePhase = (time * 2 + e * 0.4) % 2;
    const ex = x + size * 0.3 + ePhase * size * 0.2 + Math.sin(e * 1.5) * size * 0.08;
    const ey = y + Math.sin(time * 3 + e) * size * 0.15;
    const eAlpha = Math.max(0, 0.6 - ePhase * 0.3);
    const eSize = size * (0.015 - ePhase * 0.005);
    if (eSize > 0) {
      ctx.fillStyle = `rgba(255, ${Math.round(140 - ePhase * 50)}, 20, ${eAlpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fiery wings
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(side, 1);
    ctx.rotate(flapAngle * 0.3);

    // Upper wing
    const uwGrad = ctx.createRadialGradient(size * 0.18, -size * 0.08, 0, size * 0.18, -size * 0.08, size * 0.3);
    uwGrad.addColorStop(0, `rgba(255, 180, 50, 0.6)`);
    uwGrad.addColorStop(0.5, `rgba(249, 115, 22, 0.4)`);
    uwGrad.addColorStop(1, `rgba(200, 60, 10, 0.15)`);
    ctx.fillStyle = uwGrad;
    ctx.beginPath();
    ctx.moveTo(size * 0.03, -size * 0.03);
    ctx.quadraticCurveTo(size * 0.22, -size * 0.28, size * 0.38, -size * 0.1);
    ctx.quadraticCurveTo(size * 0.28, size * 0.03, size * 0.03, size * 0.01);
    ctx.fill();

    // Ember patterns on wing (asymmetric scorch spots)
    ctx.fillStyle = `rgba(255, 200, 60, ${0.3 + Math.sin(time * 4 + side * 2) * 0.15})`;
    ctx.beginPath();
    ctx.arc(size * 0.18, -size * 0.1, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    // Ash scorch marks (dark burned patches)
    ctx.fillStyle = `rgba(40, 20, 10, 0.2)`;
    ctx.beginPath();
    ctx.moveTo(size * 0.1, -size * 0.15);
    ctx.bezierCurveTo(size * 0.13, -size * 0.18, size * 0.17, -size * 0.16, size * 0.14, -size * 0.13);
    ctx.bezierCurveTo(size * 0.12, -size * 0.12, size * 0.09, -size * 0.13, size * 0.1, -size * 0.15);
    ctx.fill();
    // Wing edge cinder fringe
    ctx.strokeStyle = `rgba(200, 80, 20, 0.2)`;
    ctx.lineWidth = 0.6 * zoom;
    for (let cf = 0; cf < 3; cf++) {
      const cfx = size * (0.2 + cf * 0.06);
      const cfy = -size * (0.05 + cf * 0.03);
      ctx.beginPath();
      ctx.moveTo(cfx, cfy);
      ctx.lineTo(cfx + size * 0.015, cfy - size * 0.01);
      ctx.stroke();
    }

    // Lower wing
    ctx.fillStyle = `rgba(249, 115, 22, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(size * 0.03, size * 0.01);
    ctx.quadraticCurveTo(size * 0.2, size * 0.12, size * 0.28, size * 0.08);
    ctx.quadraticCurveTo(size * 0.15, size * 0.01, size * 0.03, -size * 0.01);
    ctx.fill();

    ctx.restore();
  }

  // Sooty body (tapered moth thorax/abdomen with texture)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.1);
  ctx.bezierCurveTo(x + size * 0.045, y - size * 0.1, x + size * 0.06, y - size * 0.04, x + size * 0.055, y + size * 0.03);
  ctx.bezierCurveTo(x + size * 0.04, y + size * 0.09, x + size * 0.02, y + size * 0.12, x, y + size * 0.12);
  ctx.bezierCurveTo(x - size * 0.02, y + size * 0.12, x - size * 0.04, y + size * 0.09, x - size * 0.055, y + size * 0.03);
  ctx.bezierCurveTo(x - size * 0.06, y - size * 0.04, x - size * 0.045, y - size * 0.1, x, y - size * 0.1);
  ctx.fill();
  // Soot/ash texture strokes
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1 * zoom;
  for (let sf = 0; sf < 6; sf++) {
    const sfa = (sf / 6) * Math.PI * 2;
    const sfx = x + Math.cos(sfa) * size * 0.04;
    const sfy = y + Math.sin(sfa) * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(sfx, sfy);
    ctx.lineTo(sfx + Math.cos(sfa) * size * 0.018, sfy + Math.sin(sfa) * size * 0.018);
    ctx.stroke();
  }
  // Carbonized segment rings on abdomen
  ctx.strokeStyle = `rgba(20, 10, 5, 0.15)`;
  ctx.lineWidth = 0.6 * zoom;
  for (let cs = 0; cs < 3; cs++) {
    const csY = y + size * 0.01 + cs * size * 0.03;
    const csW = size * (0.045 - cs * 0.005);
    ctx.beginPath();
    ctx.moveTo(x - csW, csY);
    ctx.quadraticCurveTo(x, csY + size * 0.008, x + csW, csY);
    ctx.stroke();
  }

  // Glowing abdomen tip (ember glow with layered depth)
  // Outer glow layer
  ctx.fillStyle = `rgba(200, 80, 10, ${0.25 + Math.sin(time * 3) * 0.15})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y + size * 0.07);
  ctx.bezierCurveTo(x - size * 0.035, y + size * 0.1, x - size * 0.02, y + size * 0.14, x, y + size * 0.14);
  ctx.bezierCurveTo(x + size * 0.02, y + size * 0.14, x + size * 0.035, y + size * 0.1, x + size * 0.03, y + size * 0.07);
  ctx.fill();
  // Inner hot core
  ctx.fillStyle = `rgba(255, 180, 50, ${0.5 + Math.sin(time * 3) * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.018, y + size * 0.085);
  ctx.bezierCurveTo(x - size * 0.02, y + size * 0.1, x - size * 0.01, y + size * 0.12, x, y + size * 0.12);
  ctx.bezierCurveTo(x + size * 0.01, y + size * 0.12, x + size * 0.02, y + size * 0.1, x + size * 0.018, y + size * 0.085);
  ctx.fill();

  // Head (small, round with ash coating)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.18, x + size * 0.055, y - size * 0.15, x + size * 0.05, y - size * 0.12);
  ctx.bezierCurveTo(x + size * 0.04, y - size * 0.1, x + size * 0.02, y - size * 0.095, x, y - size * 0.1);
  ctx.bezierCurveTo(x - size * 0.02, y - size * 0.095, x - size * 0.04, y - size * 0.1, x - size * 0.05, y - size * 0.12);
  ctx.bezierCurveTo(x - size * 0.055, y - size * 0.15, x - size * 0.04, y - size * 0.18, x, y - size * 0.18);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.02, y - size * 0.17);
    ctx.quadraticCurveTo(
      x + side * size * 0.08, y - size * 0.25 + Math.sin(time * 4 + side) * size * 0.02,
      x + side * size * 0.12, y - size * 0.28,
    );
    ctx.stroke();
  }

  // Fire eyes
  ctx.fillStyle = `rgba(255, 180, 50, ${0.8 + Math.sin(time * 4) * 0.2})`;
  setShadowBlur(ctx, 5 * zoom, "#ffb432");
  ctx.beginPath();
  ctx.arc(x - size * 0.03, y - size * 0.16, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.03, y - size * 0.16, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Heat shimmer around body
  const shimmer = 0.06 + Math.sin(time * 5) * 0.03;
  ctx.fillStyle = `rgba(255, 120, 20, ${shimmer})`;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.35, size * 0.35 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Enhancement: Wing ember membrane glow
  ctx.save();
  const amWingGlow = ctx.createRadialGradient(x, y, size * 0.04, x, y, size * 0.32);
  amWingGlow.addColorStop(0, `rgba(255, 160, 40, ${0.14 + Math.sin(time * 5) * 0.06})`);
  amWingGlow.addColorStop(0.5, `rgba(249, 115, 22, ${0.07 + Math.sin(time * 5) * 0.03})`);
  amWingGlow.addColorStop(1, "rgba(249, 115, 22, 0)");
  ctx.fillStyle = amWingGlow;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.32, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Body ember bioluminescence
  ctx.save();
  const amBioGrad = ctx.createRadialGradient(x, y + size * 0.05, 0, x, y + size * 0.05, size * 0.09);
  amBioGrad.addColorStop(0, `rgba(255, 180, 60, ${0.22 + Math.sin(time * 3) * 0.1})`);
  amBioGrad.addColorStop(1, "rgba(255, 180, 60, 0)");
  ctx.fillStyle = amBioGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * 0.08, size * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Enhancement: Cinder trail sparks
  ctx.save();
  for (let cs = 0; cs < 5; cs++) {
    const csPhase = (time * 2 + cs * 0.45) % 2;
    const csX2 = x + size * 0.12 + csPhase * size * 0.18 + Math.sin(cs * 1.7) * size * 0.07;
    const csY2 = y + Math.sin(time * 4 + cs * 1.5) * size * 0.1 - csPhase * size * 0.06;
    const csAlpha = Math.max(0, 0.35 - csPhase * 0.18);
    ctx.fillStyle = `rgba(255, ${Math.round(160 - csPhase * 60)}, 30, ${csAlpha})`;
    ctx.beginPath();
    ctx.arc(csX2, csY2, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// =====================================================
// BUG BOSS
// =====================================================

export function drawBroodMotherEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const breathe = Math.sin(time * 1.5) * 0.03;
  size *= 1.8;

  // Dark presence aura — large menacing pulse
  ctx.save();
  const darkPulse = Math.sin(time * 0.8) * 0.5 + 0.5;
  const darkAura = ctx.createRadialGradient(x, y, size * 0.2, x, y, size * 0.9);
  darkAura.addColorStop(0, `rgba(10, 5, 15, ${0.12 + darkPulse * 0.08})`);
  darkAura.addColorStop(0.4, `rgba(20, 5, 25, ${0.08 + darkPulse * 0.05})`);
  darkAura.addColorStop(0.7, `rgba(10, 0, 15, ${0.04 + darkPulse * 0.03})`);
  darkAura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = darkAura;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ground web pattern — intricate spiral web beneath
  ctx.save();
  const webCenterY = y + size * 0.15;
  ctx.strokeStyle = `rgba(180, 180, 200, ${0.06 + Math.sin(time * 0.7) * 0.02})`;
  ctx.lineWidth = 0.7 * zoom;
  for (let spiral = 0; spiral < 2; spiral++) {
    ctx.beginPath();
    for (let t = 0; t < 40; t++) {
      const spiralAngle = (t / 40) * Math.PI * 4 + spiral * Math.PI;
      const spiralRadius = (t / 40) * size * 0.55;
      const spx = x + Math.cos(spiralAngle) * spiralRadius;
      const spy = webCenterY + Math.sin(spiralAngle) * spiralRadius * ISO_Y_RATIO;
      if (t === 0) ctx.moveTo(spx, spy);
      else ctx.lineTo(spx, spy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Web network on ground
  ctx.strokeStyle = `rgba(200, 200, 210, ${0.1 + Math.sin(time * 1) * 0.04})`;
  ctx.lineWidth = 1 * zoom;
  for (let w = 0; w < 8; w++) {
    const wa = (w / 8) * Math.PI * 2;
    const wd = size * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.15);
    ctx.quadraticCurveTo(
      x + Math.cos(wa + Math.sin(time * 0.5) * 0.1) * wd * 0.5,
      y + size * 0.15 + Math.sin(wa) * wd * 0.3,
      x + Math.cos(wa) * wd,
      y + size * 0.15 + Math.sin(wa) * wd * 0.5,
    );
    ctx.stroke();
  }
  // Concentric web rings
  for (let ring = 1; ring <= 3; ring++) {
    const ringR = size * ring * 0.15;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.15, ringR, ringR * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Web strand effects — thin swaying strands extending outward
  ctx.save();
  for (let strand = 0; strand < 5; strand++) {
    const strandAngle = (strand / 5) * Math.PI * 2 + 0.3;
    const sway = Math.sin(time * 1.2 + strand * 1.5) * size * 0.04;
    const strandLen = size * (0.5 + strand * 0.06);
    const strandAlpha = 0.12 + Math.sin(time * 0.8 + strand) * 0.04;
    ctx.strokeStyle = `rgba(200, 200, 220, ${strandAlpha})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    const strandStartX = x + Math.cos(strandAngle) * size * 0.1;
    const strandStartY = y + Math.sin(strandAngle) * size * 0.08;
    const strandMidX = x + Math.cos(strandAngle) * strandLen * 0.5 + sway;
    const strandMidY = y + Math.sin(strandAngle) * strandLen * 0.4 - size * 0.05;
    const strandEndX = x + Math.cos(strandAngle) * strandLen;
    const strandEndY = y + Math.sin(strandAngle) * strandLen * 0.6;
    ctx.moveTo(strandStartX, strandStartY);
    ctx.quadraticCurveTo(strandMidX, strandMidY, strandEndX, strandEndY);
    ctx.stroke();
  }
  ctx.restore();

  // Massive spider legs (8 legs, thick and powerful)
  const crawl = time * 3;
  const legAngles = [-0.6, -0.2, 0.2, 0.6];
  const legLengths = [0.45, 0.5, 0.5, 0.42];
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 4; leg++) {
      const gaitOffset = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawl + gaitOffset);
      const lift = Math.max(0, stride);
      const a = legAngles[leg];
      const l = legLengths[leg];

      const bx = x + side * (size * 0.12 + leg * size * 0.06);
      const by = y + leg * size * 0.04;
      const mx = bx + side * size * 0.22 + side * stride * size * 0.02;
      const my = by + a * size * 0.12 - size * 0.06 - lift * size * 0.1;
      const ex = bx + side * size * l + stride * size * 0.04 * a;
      const ey = by + a * size * 0.3 + size * 0.2 - lift * size * 0.04;

      // Thick hairy legs
      const legGrad = ctx.createLinearGradient(bx, by, ex, ey);
      legGrad.addColorStop(0, bodyColor);
      legGrad.addColorStop(1, bodyColorDark);
      ctx.strokeStyle = legGrad;
      ctx.lineWidth = 6 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(mx, my);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Leg hairs
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 1 * zoom;
      for (let h = 0; h < 3; h++) {
        const hx = bx + (mx - bx) * (0.3 + h * 0.2);
        const hy = by + (my - by) * (0.3 + h * 0.2);
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + side * size * 0.03, hy - size * 0.04);
        ctx.stroke();
      }

      // Joint
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.arc(mx, my, size * 0.035, 0, Math.PI * 2);
      ctx.fill();

      // Foot claw
      ctx.fillStyle = "#0a0505";
      ctx.beginPath();
      ctx.arc(ex, ey, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Underbelly (dark ventral mass beneath abdomen for depth)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.14);
  ctx.bezierCurveTo(x - size * 0.24, y + size * 0.36, x + size * 0.24, y + size * 0.36, x + size * 0.28, y + size * 0.14);
  ctx.bezierCurveTo(x + size * 0.18, y + size * 0.22, x - size * 0.18, y + size * 0.22, x - size * 0.28, y + size * 0.14);
  ctx.fill();

  // Enormous abdomen with egg sac (massive organic bulb)
  const bmAbdW = size * (0.36 + breathe);
  const bmAbdH = size * (0.32 + breathe);
  const bmAbdY = y + size * 0.12;
  const bmAbdGrad = ctx.createRadialGradient(x, bmAbdY, 0, x, bmAbdY, size * 0.38);
  bmAbdGrad.addColorStop(0, bodyColorLight);
  bmAbdGrad.addColorStop(0.4, bodyColor);
  bmAbdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bmAbdGrad;
  ctx.beginPath();
  ctx.moveTo(x, bmAbdY - bmAbdH);
  ctx.bezierCurveTo(x + bmAbdW * 0.7, bmAbdY - bmAbdH * 1.05, x + bmAbdW * 1.1, bmAbdY - bmAbdH * 0.3, x + bmAbdW, bmAbdY);
  ctx.bezierCurveTo(x + bmAbdW * 0.9, bmAbdY + bmAbdH * 0.55, x + bmAbdW * 0.55, bmAbdY + bmAbdH * 1.05, x, bmAbdY + bmAbdH);
  ctx.bezierCurveTo(x - bmAbdW * 0.55, bmAbdY + bmAbdH * 1.05, x - bmAbdW * 0.9, bmAbdY + bmAbdH * 0.55, x - bmAbdW, bmAbdY);
  ctx.bezierCurveTo(x - bmAbdW * 1.1, bmAbdY - bmAbdH * 0.3, x - bmAbdW * 0.7, bmAbdY - bmAbdH * 1.05, x, bmAbdY - bmAbdH);
  ctx.fill();
  // Abdomen segment ridges
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let bmSeg = 0; bmSeg < 5; bmSeg++) {
    const bmSegY = bmAbdY - bmAbdH * 0.5 + bmSeg * bmAbdH * 0.3;
    const bmSegW = bmAbdW * (0.9 - Math.abs(bmSeg - 2) * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - bmSegW, bmSegY);
    ctx.quadraticCurveTo(x, bmSegY + bmAbdH * 0.06, x + bmSegW, bmSegY);
    ctx.stroke();
  }
  // Chitin surface texture
  ctx.fillStyle = `rgba(0, 0, 0, 0.06)`;
  for (let ct = 0; ct < 12; ct++) {
    const ctA = ct * 0.55 + 0.3;
    const ctR = size * (0.12 + Math.sin(ct * 1.3) * 0.06);
    ctx.beginPath();
    ctx.arc(x + Math.cos(ctA) * ctR, bmAbdY + Math.sin(ctA) * ctR * 0.8, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }
  // Abdomen hair tufts (coarse spider bristles radiating outward)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let abh = 0; abh < 16; abh++) {
    const abhA = (abh / 16) * Math.PI * 2;
    const abhR = bmAbdW * 0.9;
    const abhx = x + Math.cos(abhA) * abhR;
    const abhy = bmAbdY + Math.sin(abhA) * bmAbdH * 0.9;
    ctx.beginPath();
    ctx.moveTo(abhx, abhy);
    ctx.lineTo(abhx + Math.cos(abhA) * size * 0.035, abhy + Math.sin(abhA) * size * 0.03);
    ctx.stroke();
  }
  // Book lung openings (ventral respiratory slits)
  ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
  for (let bl = -1; bl <= 1; bl += 2) {
    for (let bls = 0; bls < 2; bls++) {
      const blx = x + bl * size * 0.1;
      const bly = bmAbdY + size * 0.05 + bls * size * 0.06;
      ctx.beginPath();
      ctx.moveTo(blx - size * 0.015, bly);
      ctx.bezierCurveTo(blx - size * 0.01, bly - size * 0.008, blx + size * 0.01, bly - size * 0.008, blx + size * 0.015, bly);
      ctx.bezierCurveTo(blx + size * 0.01, bly + size * 0.005, blx - size * 0.01, bly + size * 0.005, blx - size * 0.015, bly);
      ctx.fill();
    }
  }

  // Egg sac bioluminescent glow — pulsing sickly green/purple
  ctx.save();
  const eggPulse = Math.sin(time * 2.5) * 0.5 + 0.5;
  const eggGlow = ctx.createRadialGradient(
    x, y + size * 0.14, size * 0.05,
    x, y + size * 0.14, size * 0.35,
  );
  eggGlow.addColorStop(0, `rgba(100, 220, 60, ${0.15 + eggPulse * 0.1})`);
  eggGlow.addColorStop(0.35, `rgba(140, 80, 200, ${0.08 + eggPulse * 0.06})`);
  eggGlow.addColorStop(0.65, `rgba(80, 180, 50, ${0.04 + eggPulse * 0.03})`);
  eggGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = eggGlow;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.14, size * 0.34, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Egg patterns on abdomen
  ctx.fillStyle = `rgba(200, 200, 180, 0.2)`;
  for (let e = 0; e < 6; e++) {
    const ea = (e / 6) * Math.PI * 2 + time * 0.3;
    const ed = size * 0.18;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(ea) * ed, y + size * 0.12 + Math.sin(ea) * ed * 0.7,
      size * 0.05, size * 0.04, ea, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Hourglass marking
  ctx.fillStyle = `rgba(220, 38, 38, ${0.6 + Math.sin(time * 2) * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y + size * 0.04);
  ctx.lineTo(x, y + size * 0.12);
  ctx.lineTo(x + size * 0.06, y + size * 0.04);
  ctx.moveTo(x + size * 0.06, y + size * 0.2);
  ctx.lineTo(x, y + size * 0.12);
  ctx.lineTo(x - size * 0.06, y + size * 0.2);
  ctx.fill();

  // Cephalothorax (massive, angular shield shape)
  const thoraxGrad = ctx.createRadialGradient(x, y - size * 0.12, 0, x, y - size * 0.12, size * 0.22);
  thoraxGrad.addColorStop(0, bodyColor);
  thoraxGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = thoraxGrad;
  const bmThY = y - size * 0.12;
  ctx.beginPath();
  ctx.moveTo(x, bmThY - size * 0.16);
  ctx.bezierCurveTo(x + size * 0.14, bmThY - size * 0.17, x + size * 0.22, bmThY - size * 0.08, x + size * 0.21, bmThY + size * 0.02);
  ctx.bezierCurveTo(x + size * 0.19, bmThY + size * 0.12, x + size * 0.1, bmThY + size * 0.17, x, bmThY + size * 0.16);
  ctx.bezierCurveTo(x - size * 0.1, bmThY + size * 0.17, x - size * 0.19, bmThY + size * 0.12, x - size * 0.21, bmThY + size * 0.02);
  ctx.bezierCurveTo(x - size * 0.22, bmThY - size * 0.08, x - size * 0.14, bmThY - size * 0.17, x, bmThY - size * 0.16);
  ctx.fill();
  // Cephalothorax fovea and radiating grooves
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, bmThY - size * 0.1);
  ctx.lineTo(x, bmThY + size * 0.08);
  ctx.stroke();
  for (let cg = -1; cg <= 1; cg += 2) {
    ctx.beginPath();
    ctx.moveTo(x, bmThY);
    ctx.quadraticCurveTo(x + cg * size * 0.08, bmThY + size * 0.02, x + cg * size * 0.14, bmThY + size * 0.06);
    ctx.stroke();
  }
  // Additional thoracic grooves (cervical + marginal)
  ctx.lineWidth = 0.8 * zoom;
  for (let mg = -1; mg <= 1; mg += 2) {
    ctx.beginPath();
    ctx.moveTo(x + mg * size * 0.06, bmThY - size * 0.12);
    ctx.bezierCurveTo(
      x + mg * size * 0.1, bmThY - size * 0.06,
      x + mg * size * 0.12, bmThY + size * 0.02,
      x + mg * size * 0.1, bmThY + size * 0.08,
    );
    ctx.stroke();
  }
  // Cephalothorax setae (short stiff hairs)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let seth = 0; seth < 8; seth++) {
    const sethA = (seth / 8) * Math.PI * 2;
    const sethR = size * 0.16;
    const sethx = x + Math.cos(sethA) * sethR;
    const sethy = bmThY + Math.sin(sethA) * sethR * 0.8;
    ctx.beginPath();
    ctx.moveTo(sethx, sethy);
    ctx.lineTo(sethx + Math.cos(sethA) * size * 0.025, sethy + Math.sin(sethA) * size * 0.02);
    ctx.stroke();
  }

  // Chitinous shell shimmer — traveling highlight across carapace
  ctx.save();
  const shimmerPhase = (time * 1.8) % (Math.PI * 2);
  const shimmerX = x + Math.cos(shimmerPhase) * size * 0.12;
  const shimmerY = y - size * 0.12 + Math.sin(shimmerPhase) * size * 0.08;
  const shimmerGrad = ctx.createRadialGradient(shimmerX, shimmerY, 0, shimmerX, shimmerY, size * 0.15);
  shimmerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.12 + Math.sin(time * 3) * 0.05})`);
  shimmerGrad.addColorStop(0.5, "rgba(200, 200, 220, 0.04)");
  shimmerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shimmerGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.12, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  const abdShimmerPhase = (time * 1.2 + Math.PI) % (Math.PI * 2);
  const abdShimmerX = x + Math.cos(abdShimmerPhase) * size * 0.2;
  const abdShimmerY = y + size * 0.12 + Math.sin(abdShimmerPhase) * size * 0.15;
  const abdShimmerGrad = ctx.createRadialGradient(abdShimmerX, abdShimmerY, 0, abdShimmerX, abdShimmerY, size * 0.18);
  abdShimmerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.08 + Math.sin(time * 2.5 + 1) * 0.04})`);
  abdShimmerGrad.addColorStop(0.6, "rgba(180, 180, 200, 0.02)");
  abdShimmerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = abdShimmerGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.12, size * 0.36, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Massive chelicerae
  const fangSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * size * 0.08 : Math.sin(time * 2) * size * 0.01;
  for (let side = -1; side <= 1; side += 2) {
    // Chelicera arm
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.1, y - size * 0.25);
    ctx.quadraticCurveTo(
      x + side * (size * 0.15 + fangSpread), y - size * 0.32,
      x + side * (size * 0.12 + fangSpread), y - size * 0.38,
    );
    ctx.lineTo(x + side * size * 0.08, y - size * 0.28);
    ctx.fill();
    // Fang
    ctx.fillStyle = "#0a0505";
    ctx.beginPath();
    ctx.moveTo(x + side * (size * 0.1 + fangSpread * 0.5), y - size * 0.36);
    ctx.lineTo(x + side * (size * 0.06 + fangSpread * 0.3), y - size * 0.48);
    ctx.lineTo(x + side * (size * 0.08 + fangSpread * 0.3), y - size * 0.38);
    ctx.fill();
  }
  // Venom glow on fangs
  ctx.fillStyle = `rgba(120, 255, 80, ${0.7 + Math.sin(time * 4) * 0.3})`;
  setShadowBlur(ctx, 8 * zoom, "#78ff50");
  ctx.beginPath();
  ctx.arc(x - size * 0.06 - fangSpread * 0.3, y - size * 0.47, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06 + fangSpread * 0.3, y - size * 0.47, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Venom drip effect — glowing green droplets falling from fangs
  ctx.save();
  for (let d = 0; d < 3; d++) {
    const dripCycle = ((time * 0.8 + d * 1.2) % 2.4) / 2.4;
    const dripAlpha = dripCycle < 0.7 ? (1 - dripCycle / 0.7) * 0.7 : 0;
    if (dripAlpha > 0) {
      const dripSide = d === 0 ? -1 : d === 1 ? 1 : 0;
      const dripX = x + dripSide * (size * 0.06 + fangSpread * 0.3);
      const dripStartY = y - size * 0.45;
      const dripY = dripStartY + dripCycle * size * 0.2;
      const dropSize = size * (0.015 + (1 - dripCycle) * 0.008);
      const dripGlow = ctx.createRadialGradient(dripX, dripY, 0, dripX, dripY, dropSize * 3);
      dripGlow.addColorStop(0, `rgba(100, 255, 60, ${dripAlpha * 0.5})`);
      dripGlow.addColorStop(0.5, `rgba(80, 200, 40, ${dripAlpha * 0.2})`);
      dripGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = dripGlow;
      ctx.beginPath();
      ctx.arc(dripX, dripY, dropSize * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(120, 255, 80, ${dripAlpha})`;
      ctx.beginPath();
      ctx.moveTo(dripX, dripY - dropSize * 1.5);
      ctx.quadraticCurveTo(dripX + dropSize, dripY, dripX, dripY + dropSize);
      ctx.quadraticCurveTo(dripX - dropSize, dripY, dripX, dripY - dropSize * 1.5);
      ctx.fill();
    }
  }
  ctx.restore();

  // Eight eyes (boss variant - large and menacing)
  ctx.fillStyle = "#0a0303";
  // Main pair (large)
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.18, size * 0.045, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.18, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  // Secondary pairs
  ctx.beginPath();
  ctx.arc(x - size * 0.13, y - size * 0.14, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.13, y - size * 0.14, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x - size * 0.15, y - size * 0.1, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.15, y - size * 0.1, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x - size * 0.04, y - size * 0.22, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.04, y - size * 0.22, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // All eyes glow
  const eyeGlow = 0.6 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(200, 30, 30, ${eyeGlow})`;
  setShadowBlur(ctx, 6 * zoom, "#c81e1e");
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.18, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.18, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x - size * 0.13, y - size * 0.14, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.13, y - size * 0.14, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Eye cluster glow — individual pulsing radial gradient glows per eye
  ctx.save();
  const eyeCluster: [number, number, number][] = [
    [-0.07, -0.18, 0.035],
    [0.07, -0.18, 0.035],
    [-0.13, -0.14, 0.025],
    [0.13, -0.14, 0.025],
    [-0.15, -0.1, 0.018],
    [0.15, -0.1, 0.018],
    [-0.04, -0.22, 0.018],
    [0.04, -0.22, 0.018],
  ];
  for (let ei = 0; ei < eyeCluster.length; ei++) {
    const [eox, eoy, eor] = eyeCluster[ei];
    const ePulse = 0.4 + Math.sin(time * 3.5 + ei * 0.9) * 0.3;
    const ecx = x + eox * size;
    const ecy = y + eoy * size;
    const ecr = eor * size;
    const eGlow = ctx.createRadialGradient(ecx, ecy, 0, ecx, ecy, ecr * 2.5);
    eGlow.addColorStop(0, `rgba(220, 30, 30, ${ePulse * 0.6})`);
    eGlow.addColorStop(0.4, `rgba(180, 10, 10, ${ePulse * 0.3})`);
    eGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = eGlow;
    ctx.beginPath();
    ctx.arc(ecx, ecy, ecr * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Silk spray spinnerets (multi-tube cluster)
  ctx.fillStyle = bodyColorDark;
  for (let spn = -1; spn <= 1; spn++) {
    ctx.beginPath();
    ctx.moveTo(x + spn * size * 0.04, y + size * 0.36);
    ctx.bezierCurveTo(
      x + spn * size * 0.06, y + size * 0.39,
      x + spn * size * 0.05, y + size * 0.43,
      x + spn * size * 0.03, y + size * 0.44,
    );
    ctx.bezierCurveTo(
      x + spn * size * 0.01, y + size * 0.43,
      x + spn * size * 0.015, y + size * 0.39,
      x + spn * size * 0.04, y + size * 0.36,
    );
    ctx.fill();
  }

  // Active silk threads from spinnerets
  ctx.strokeStyle = `rgba(200, 200, 220, ${0.2 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let s = 0; s < 3; s++) {
    ctx.beginPath();
    ctx.moveTo(x + (s - 1) * size * 0.03, y + size * 0.4);
    ctx.quadraticCurveTo(
      x + Math.sin(time + s) * size * 0.15,
      y + size * 0.5,
      x + Math.sin(time * 0.5 + s * 0.8) * size * 0.25,
      y + size * 0.6,
    );
    ctx.stroke();
  }

  // Boss aura
  const auraPhase = Math.sin(time * 1.5) * 0.5 + 0.5;
  const bossAura = ctx.createRadialGradient(x, y, 0, x, y, size * 0.55);
  bossAura.addColorStop(0, `rgba(100, 20, 20, ${auraPhase * 0.08})`);
  bossAura.addColorStop(0.5, `rgba(80, 10, 10, ${auraPhase * 0.04})`);
  bossAura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = bossAura;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.55, size * 0.55 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spiderling silhouettes — tiny spiders orbiting the brood mother
  ctx.save();
  for (let sp = 0; sp < 4; sp++) {
    const orbitAngle = time * 0.6 + (sp / 4) * Math.PI * 2;
    const orbitRadius = size * (0.5 + Math.sin(time * 0.4 + sp) * 0.05);
    const spX = x + Math.cos(orbitAngle) * orbitRadius;
    const spY = y + Math.sin(orbitAngle) * orbitRadius * ISO_Y_RATIO;
    const spSize = size * 0.04;
    const spAlpha = 0.5 + Math.sin(time * 2 + sp * 1.3) * 0.2;
    ctx.fillStyle = `rgba(20, 15, 10, ${spAlpha})`;
    // Spiderling abdomen (organic bulb)
    ctx.beginPath();
    ctx.moveTo(spX, spY - spSize * 0.6);
    ctx.bezierCurveTo(spX + spSize * 0.8, spY - spSize * 0.5, spX + spSize * 0.9, spY + spSize * 0.4, spX, spY + spSize * 0.7);
    ctx.bezierCurveTo(spX - spSize * 0.9, spY + spSize * 0.4, spX - spSize * 0.8, spY - spSize * 0.5, spX, spY - spSize * 0.6);
    ctx.fill();
    // Spiderling cephalothorax
    ctx.beginPath();
    ctx.moveTo(spX, spY - spSize * 1.1);
    ctx.bezierCurveTo(spX + spSize * 0.5, spY - spSize * 1.0, spX + spSize * 0.6, spY - spSize * 0.5, spX, spY - spSize * 0.5);
    ctx.bezierCurveTo(spX - spSize * 0.6, spY - spSize * 0.5, spX - spSize * 0.5, spY - spSize * 1.0, spX, spY - spSize * 1.1);
    ctx.fill();
    ctx.strokeStyle = `rgba(20, 15, 10, ${spAlpha * 0.8})`;
    ctx.lineWidth = 0.5 * zoom;
    for (let sl = 0; sl < 4; sl++) {
      const legSide = sl < 2 ? -1 : 1;
      const legIdx = sl % 2;
      ctx.beginPath();
      ctx.moveTo(spX + legSide * spSize * 0.3, spY - spSize * 0.2 + legIdx * spSize * 0.4);
      ctx.lineTo(
        spX + legSide * spSize * 1.8,
        spY - spSize * 0.5 + legIdx * spSize * 0.6 + Math.sin(time * 4 + sl + sp) * spSize * 0.3,
      );
      ctx.stroke();
    }
  }
  ctx.restore();

  // Attack: mass silk spray
  if (isAttacking) {
    for (let s = 0; s < 16; s++) {
      const sa = (s / 16) * Math.PI * 2;
      const sd = attackPhase * size * 0.6;
      const salpha = (1 - attackPhase) * 0.4;
      ctx.fillStyle = `rgba(200, 200, 220, ${salpha})`;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(sa) * sd, y + Math.sin(sa) * sd * ISO_Y_RATIO,
        size * 0.025 * (1 - attackPhase), size * 0.015 * (1 - attackPhase),
        sa, 0, Math.PI * 2,
      );
      ctx.fill();
    }
    // Web ring
    const webRingR = attackPhase * size * 0.6;
    ctx.strokeStyle = `rgba(200, 200, 220, ${(1 - attackPhase) * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y, webRingR, webRingR * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
