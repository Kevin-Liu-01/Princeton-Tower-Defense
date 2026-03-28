import type { Position } from "../../types";

export function drawNassauHero(
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
  const s = size;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const flamePulse = Math.sin(time * 4) * 0.5 + 0.5;
  const wingFlap = Math.sin(time * 7) * 0.55;
  const breathe = Math.sin(time * 2) * 2;
  const hover = Math.sin(time * 2.5) * s * 0.04;
  const bodyGlow = 0.6 + Math.sin(time * 3) * 0.2;
  const gemPulse = Math.sin(time * 5) * 0.5 + 0.5;

  const cy = y + hover;

  drawHeatDistortion(ctx, x, cy, s, time, zoom);
  drawFireTrail(ctx, x, cy, s, time, flamePulse, zoom);
  drawWings(ctx, x, cy, s, time, zoom, wingFlap, isAttacking, attackIntensity, "back");
  drawTailPlumage(ctx, x, cy, s, time, zoom, flamePulse);
  drawCapeStraps(ctx, x, cy, s, time, zoom, flamePulse);
  drawBody(ctx, x, cy, s, breathe, time, flamePulse, zoom, bodyGlow);
  drawArmorPlates(ctx, x, cy, s, time, zoom, flamePulse, gemPulse);
  drawHarness(ctx, x, cy, s, time, zoom, gemPulse);
  drawShoulderPauldrons(ctx, x, cy, s, time, zoom, flamePulse, gemPulse);
  drawNeck(ctx, x, cy, s, time, zoom, flamePulse);
  drawHelmet(ctx, x, cy, s, time, zoom, flamePulse, gemPulse, isAttacking, attackIntensity);
  drawWings(ctx, x, cy, s, time, zoom, wingFlap, isAttacking, attackIntensity, "front");
  drawTalons(ctx, x, cy, s, time, zoom, isAttacking, attackIntensity);
  drawFireAura(ctx, x, cy, s, time, flamePulse, isAttacking, zoom);
  if (isAttacking) {
    drawAttackFlare(ctx, x, cy, s, attackIntensity, time, zoom);
  }
}

// ─── HEAT DISTORTION (subtle background shimmer) ────────────────────────────

function drawHeatDistortion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
) {
  for (let i = 0; i < 5; i++) {
    const shimmerY = y - s * 0.1 - i * s * 0.15;
    const shimmerX = x + Math.sin(time * 3 + i * 1.8) * s * 0.06;
    const shimmerAlpha = 0.04 - i * 0.006;
    const shimmerW = s * (0.4 - i * 0.05);

    ctx.fillStyle = `rgba(255, 200, 100, ${shimmerAlpha})`;
    ctx.beginPath();
    ctx.ellipse(shimmerX, shimmerY, shimmerW, s * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── FIRE TRAIL ─────────────────────────────────────────────────────────────

function drawFireTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  flamePulse: number,
  zoom: number,
) {
  for (let i = 0; i < 12; i++) {
    const trailPhase = (time * 2.5 + i * 0.22) % 1;
    const trailY = y + s * 0.35 + trailPhase * s * 0.7;
    const trailX = x + Math.sin(time * 3.5 + i * 1.0) * s * 0.18;
    const trailAlpha = (1 - trailPhase) * 0.5 * (0.7 + flamePulse * 0.3);
    const trailSize = (1 - trailPhase) * s * 0.09;

    const grad = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, trailSize);
    grad.addColorStop(0, `rgba(255, 230, 120, ${trailAlpha})`);
    grad.addColorStop(0.35, `rgba(255, 160, 40, ${trailAlpha * 0.7})`);
    grad.addColorStop(0.7, `rgba(220, 70, 10, ${trailAlpha * 0.4})`);
    grad.addColorStop(1, `rgba(150, 30, 0, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── WINGS ──────────────────────────────────────────────────────────────────

function drawWings(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  wingFlap: number,
  isAttacking: boolean,
  attackIntensity: number,
  layer: "back" | "front",
) {
  const flapAngle = wingFlap + (isAttacking ? Math.sin(attackIntensity * Math.PI * 6) * 0.5 : 0);
  const wingSpread = s * (0.85 + flapAngle * 0.35);
  const side = layer === "back" ? 1 : -1;

  ctx.save();

  const wingBaseX = x + side * s * 0.14;
  const wingBaseY = y - s * 0.06;
  const wingTipX = wingBaseX + side * wingSpread;
  const wingTipY = wingBaseY - s * 0.4 + flapAngle * s * 0.38;

  // Wing glow underlay
  const glowGrad = ctx.createRadialGradient(
    wingBaseX + side * wingSpread * 0.4, wingBaseY - s * 0.1, 0,
    wingBaseX + side * wingSpread * 0.4, wingBaseY - s * 0.1, wingSpread * 0.6,
  );
  glowGrad.addColorStop(0, `rgba(255, 180, 50, ${0.12 + flapAngle * 0.05})`);
  glowGrad.addColorStop(1, `rgba(255, 100, 20, 0)`);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(wingBaseX + side * wingSpread * 0.4, wingBaseY - s * 0.1, wingSpread * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Primary wing membrane
  const wingGrad = ctx.createLinearGradient(wingBaseX, wingBaseY, wingTipX, wingTipY);
  wingGrad.addColorStop(0, `rgba(180, 80, 15, ${0.95})`);
  wingGrad.addColorStop(0.2, `rgba(230, 126, 34, 0.9)`);
  wingGrad.addColorStop(0.45, `rgba(255, 170, 60, 0.85)`);
  wingGrad.addColorStop(0.7, `rgba(255, 210, 90, 0.75)`);
  wingGrad.addColorStop(1, `rgba(255, 240, 150, 0.45)`);

  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.bezierCurveTo(
    wingBaseX + side * wingSpread * 0.35, wingBaseY - s * 0.55 + flapAngle * s * 0.2,
    wingBaseX + side * wingSpread * 0.7, wingBaseY - s * 0.5 + flapAngle * s * 0.3,
    wingTipX, wingTipY,
  );
  ctx.bezierCurveTo(
    wingBaseX + side * wingSpread * 0.8, wingBaseY + s * 0.02 + flapAngle * s * 0.08,
    wingBaseX + side * wingSpread * 0.5, wingBaseY + s * 0.18 + flapAngle * s * 0.05,
    wingBaseX + side * wingSpread * 0.2, wingBaseY + s * 0.22,
  );
  ctx.lineTo(wingBaseX, wingBaseY + s * 0.12);
  ctx.closePath();
  ctx.fill();

  // Wing bone structure
  ctx.strokeStyle = `rgba(160, 70, 10, 0.5)`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.bezierCurveTo(
    wingBaseX + side * wingSpread * 0.3, wingBaseY - s * 0.25 + flapAngle * s * 0.12,
    wingBaseX + side * wingSpread * 0.6, wingBaseY - s * 0.35 + flapAngle * s * 0.22,
    wingTipX, wingTipY,
  );
  ctx.stroke();

  // Individual feather rachis lines
  for (let f = 0; f < 7; f++) {
    const featherT = (f + 1) / 8;
    const startT = featherT * 0.8;
    const fStartX = wingBaseX + side * wingSpread * startT;
    const fStartY = wingBaseY - s * (0.15 + startT * 0.2) + flapAngle * s * 0.1 * startT;
    const fEndX = wingBaseX + side * wingSpread * (0.2 + featherT * 0.55);
    const fEndY = wingBaseY + s * (0.08 + featherT * 0.12);
    const featherSway = Math.sin(time * 2 + f * 0.9) * s * 0.008;

    ctx.strokeStyle = `rgba(140, 60, 10, ${0.35 - f * 0.03})`;
    ctx.lineWidth = (1.5 - f * 0.1) * zoom;
    ctx.beginPath();
    ctx.moveTo(fStartX, fStartY);
    ctx.quadraticCurveTo(
      (fStartX + fEndX) / 2 + featherSway, (fStartY + fEndY) / 2,
      fEndX + featherSway, fEndY,
    );
    ctx.stroke();
  }

  // Flame fringe along wing edge
  for (let fl = 0; fl < 8; fl++) {
    const flameT = fl / 8;
    const edgeX = wingBaseX + side * wingSpread * (0.3 + flameT * 0.7);
    const edgeTopY = wingBaseY - s * (0.35 + flameT * 0.1) * (1 - flameT * 0.4) + flapAngle * s * 0.15 * flameT;
    const edgeBotY = wingBaseY + s * (0.1 + flameT * 0.12);
    const flameY = edgeTopY + (edgeBotY - edgeTopY) * (0.1 + Math.sin(time * 6 + fl * 1.5) * 0.1);
    const flameSize = s * (0.035 + flameT * 0.015) * (1 + Math.sin(time * 8 + fl * 2) * 0.3);
    const flameAlpha = 0.7 + Math.sin(time * 7 + fl) * 0.2;

    const fGrad = ctx.createRadialGradient(edgeX, flameY, 0, edgeX, flameY, flameSize);
    fGrad.addColorStop(0, `rgba(255, 255, 210, ${flameAlpha})`);
    fGrad.addColorStop(0.3, `rgba(255, 200, 60, ${flameAlpha * 0.8})`);
    fGrad.addColorStop(0.6, `rgba(255, 130, 30, ${flameAlpha * 0.5})`);
    fGrad.addColorStop(1, `rgba(200, 50, 10, 0)`);
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.arc(edgeX, flameY, flameSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── TAIL PLUMAGE (grand trailing feathers) ─────────────────────────────────

function drawTailPlumage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
) {
  const tailBaseY = y + s * 0.22;
  const featherCount = 7;

  for (let i = 0; i < featherCount; i++) {
    const spread = (i - (featherCount - 1) / 2) * 0.18;
    const sway = Math.sin(time * 1.3 + i * 0.5) * s * 0.035;
    const featherLen = s * (0.42 + Math.abs(spread) * 0.1 - Math.abs(i - 3) * 0.02);
    const thickness = (3.5 - Math.abs(spread) * 3) * zoom;

    const tipX = x + spread * s * 0.6 + sway;
    const tipY = tailBaseY + featherLen;
    const midX = x + spread * s * 0.35 + sway * 0.5;
    const midY = tailBaseY + featherLen * 0.5;

    // Feather body
    const fGrad = ctx.createLinearGradient(x, tailBaseY, tipX, tipY);
    fGrad.addColorStop(0, "#b35a10");
    fGrad.addColorStop(0.2, "#e67e22");
    fGrad.addColorStop(0.5, "#f39c12");
    fGrad.addColorStop(0.75, "#ff8800");
    fGrad.addColorStop(1, `rgba(255, 220, 70, ${0.5 + flamePulse * 0.3})`);

    ctx.strokeStyle = fGrad;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, tailBaseY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();

    // Feather barb detail
    if (Math.abs(i - 3) < 3) {
      const barbCount = 4;
      for (let b = 0; b < barbCount; b++) {
        const t = 0.3 + b * 0.15;
        const bx = x + (tipX - x) * t + sway * t;
        const by = tailBaseY + (tipY - tailBaseY) * t;
        const barbLen = s * 0.025;
        const barbAngle = spread * 1.5 + Math.sin(time * 2 + b) * 0.1;

        ctx.strokeStyle = `rgba(200, 100, 20, 0.3)`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(barbAngle + Math.PI / 2) * barbLen, by + Math.sin(barbAngle + Math.PI / 2) * barbLen);
        ctx.stroke();
      }
    }

    // Flame tip with glow
    const tipGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, s * 0.05);
    tipGlow.addColorStop(0, `rgba(255, 240, 130, ${0.8 + flamePulse * 0.2})`);
    tipGlow.addColorStop(0.4, `rgba(255, 180, 50, ${0.4 + flamePulse * 0.2})`);
    tipGlow.addColorStop(1, `rgba(255, 100, 20, 0)`);
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(tipX, tipY, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── CAPE / TRAILING STRAPS ─────────────────────────────────────────────────

function drawCapeStraps(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
) {
  for (let side = -1; side <= 1; side += 2) {
    const strapX = x + side * s * 0.13;
    const strapTopY = y - s * 0.12;
    const strapBotY = y + s * 0.30;
    const sway = Math.sin(time * 1.8 + side * 0.5) * s * 0.025;

    // Leather strap
    const strapGrad = ctx.createLinearGradient(strapX, strapTopY, strapX + sway, strapBotY);
    strapGrad.addColorStop(0, "#6b3a12");
    strapGrad.addColorStop(0.3, "#8b4a18");
    strapGrad.addColorStop(0.7, "#7a4015");
    strapGrad.addColorStop(1, `rgba(90, 45, 12, ${0.4})`);

    ctx.strokeStyle = strapGrad;
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(strapX, strapTopY);
    ctx.quadraticCurveTo(strapX + sway * 0.6, (strapTopY + strapBotY) / 2, strapX + sway, strapBotY);
    ctx.stroke();

    // Gold strap edge
    ctx.strokeStyle = `rgba(200, 160, 40, 0.3)`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(strapX - side * 1.2 * zoom, strapTopY);
    ctx.quadraticCurveTo(strapX + sway * 0.6 - side * 1.2 * zoom, (strapTopY + strapBotY) / 2, strapX + sway - side * 1.2 * zoom, strapBotY);
    ctx.stroke();

    // Strap end ornament
    const ornY = strapBotY;
    const ornX = strapX + sway;
    ctx.fillStyle = `rgba(255, 180, 40, ${0.5 + flamePulse * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(ornX, ornY);
    ctx.lineTo(ornX + side * s * 0.02, ornY + s * 0.025);
    ctx.lineTo(ornX, ornY + s * 0.04);
    ctx.lineTo(ornX - side * s * 0.02, ornY + s * 0.025);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── BODY ───────────────────────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  breathe: number,
  time: number,
  flamePulse: number,
  zoom: number,
  bodyGlow: number,
) {
  // Core body
  const bodyGrad = ctx.createRadialGradient(
    x, y - s * 0.04, s * 0.04,
    x, y + s * 0.02, s * 0.36,
  );
  bodyGrad.addColorStop(0, "#fff5e0");
  bodyGrad.addColorStop(0.15, "#ffc870");
  bodyGrad.addColorStop(0.35, "#e67e22");
  bodyGrad.addColorStop(0.6, "#cc5500");
  bodyGrad.addColorStop(0.8, "#993d00");
  bodyGrad.addColorStop(1, "#6b2800");

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, s * (0.23 + breathe * 0.002), s * (0.31 + breathe * 0.003), 0, 0, Math.PI * 2);
  ctx.fill();

  // Body rim light
  ctx.strokeStyle = `rgba(255, 200, 100, ${0.25 + bodyGlow * 0.15})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.23, s * 0.31, 0, -0.5, Math.PI * 0.6);
  ctx.stroke();

  // Layered feather texture
  for (let row = 0; row < 8; row++) {
    const rowY = y - s * 0.2 + row * s * 0.055;
    const rowWidth = s * 0.20 * Math.sin(((row + 0.5) / 8) * Math.PI);
    const feathersInRow = 3 + Math.min(row, 4);

    for (let f = 0; f < feathersInRow; f++) {
      const fx = x - rowWidth + (f / (feathersInRow - 1)) * rowWidth * 2;
      const fWidth = rowWidth * 2 / feathersInRow * 0.6;
      const fHeight = s * 0.025;
      const fSway = Math.sin(time * 1.5 + row * 0.4 + f * 0.7) * s * 0.003;

      const shade = row < 4 ? 0.08 : 0.05;
      ctx.fillStyle = `rgba(139, 58, 0, ${shade + Math.sin(time * 2 + row + f) * 0.02})`;
      ctx.beginPath();
      ctx.ellipse(fx + fSway, rowY, fWidth, fHeight, 0, 0, Math.PI);
      ctx.fill();
    }
  }

  // Inner fire core glow
  const innerGlow = ctx.createRadialGradient(x, y - s * 0.06, 0, x, y, s * 0.17);
  innerGlow.addColorStop(0, `rgba(255, 240, 160, ${0.25 * bodyGlow})`);
  innerGlow.addColorStop(0.4, `rgba(255, 190, 60, ${0.12 * bodyGlow})`);
  innerGlow.addColorStop(1, `rgba(255, 100, 0, 0)`);
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.06, s * 0.17, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── ARMOR PLATES ───────────────────────────────────────────────────────────

function drawArmorPlates(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  gemPulse: number,
) {
  // Breast plate
  const breastGrad = ctx.createLinearGradient(x - s * 0.12, y - s * 0.15, x + s * 0.12, y + s * 0.08);
  breastGrad.addColorStop(0, "#8a6020");
  breastGrad.addColorStop(0.2, "#c49030");
  breastGrad.addColorStop(0.5, "#daa530");
  breastGrad.addColorStop(0.8, "#c49030");
  breastGrad.addColorStop(1, "#8a6020");

  ctx.fillStyle = breastGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.13, y - s * 0.16);
  ctx.quadraticCurveTo(x - s * 0.16, y - s * 0.02, x - s * 0.08, y + s * 0.06);
  ctx.lineTo(x + s * 0.08, y + s * 0.06);
  ctx.quadraticCurveTo(x + s * 0.16, y - s * 0.02, x + s * 0.13, y - s * 0.16);
  ctx.closePath();
  ctx.fill();

  // Plate border
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Gold trim on plate edge
  ctx.strokeStyle = `rgba(255, 210, 80, 0.4)`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.12, y - s * 0.15);
  ctx.quadraticCurveTo(x - s * 0.15, y - s * 0.02, x - s * 0.07, y + s * 0.055);
  ctx.stroke();

  // Central medallion - Nassau Hall flame emblem
  const medY = y - s * 0.06;
  const medR = s * 0.055;

  // Medallion disc
  const medGrad = ctx.createRadialGradient(x, medY, 0, x, medY, medR);
  medGrad.addColorStop(0, "#ffe080");
  medGrad.addColorStop(0.3, "#daa520");
  medGrad.addColorStop(0.7, "#b8860b");
  medGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = medGrad;
  ctx.beginPath();
  ctx.arc(x, medY, medR, 0, Math.PI * 2);
  ctx.fill();

  // Medallion ring
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, medY, medR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 120, 0.5)`;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, medY, medR * 0.85, 0, Math.PI * 2);
  ctx.stroke();

  // Flame emblem inside medallion
  const embGlow = 0.6 + gemPulse * 0.4;
  ctx.fillStyle = `rgba(220, 50, 0, ${embGlow})`;
  ctx.beginPath();
  ctx.moveTo(x, medY - medR * 0.65);
  ctx.quadraticCurveTo(x + medR * 0.5, medY - medR * 0.1, x + medR * 0.3, medY + medR * 0.45);
  ctx.quadraticCurveTo(x, medY + medR * 0.2, x - medR * 0.3, medY + medR * 0.45);
  ctx.quadraticCurveTo(x - medR * 0.5, medY - medR * 0.1, x, medY - medR * 0.65);
  ctx.closePath();
  ctx.fill();

  // Inner flame
  ctx.fillStyle = `rgba(255, 220, 80, ${embGlow * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(x, medY - medR * 0.35);
  ctx.quadraticCurveTo(x + medR * 0.25, medY, x + medR * 0.12, medY + medR * 0.25);
  ctx.quadraticCurveTo(x, medY + medR * 0.1, x - medR * 0.12, medY + medR * 0.25);
  ctx.quadraticCurveTo(x - medR * 0.25, medY, x, medY - medR * 0.35);
  ctx.closePath();
  ctx.fill();

  // Engraved wing motifs on breastplate
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = `rgba(180, 140, 40, 0.25)`;
    ctx.lineWidth = 0.7 * zoom;
    for (let w = 0; w < 3; w++) {
      const wx = x + side * (s * 0.04 + w * s * 0.025);
      const wy = medY;
      ctx.beginPath();
      ctx.moveTo(wx, wy - s * 0.02);
      ctx.quadraticCurveTo(wx + side * s * 0.02, wy, wx, wy + s * 0.025);
      ctx.stroke();
    }
  }
}

// ─── HARNESS / CROSS STRAPS ────────────────────────────────────────────────

function drawHarness(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  gemPulse: number,
) {
  // X-shaped harness across chest
  for (let side = -1; side <= 1; side += 2) {
    const topX = x + side * s * 0.18;
    const topY = y - s * 0.2;
    const botX = x - side * s * 0.1;
    const botY = y + s * 0.12;

    ctx.strokeStyle = "#5a3010";
    ctx.lineWidth = 2.8 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(botX, botY);
    ctx.stroke();

    // Strap highlight edge
    ctx.strokeStyle = `rgba(120, 80, 20, 0.5)`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(topX + side * 0.5 * zoom, topY);
    ctx.lineTo(botX + side * 0.5 * zoom, botY);
    ctx.stroke();

    // Gold buckle rivets along strap
    for (let r = 0; r < 3; r++) {
      const t = 0.25 + r * 0.25;
      const rx = topX + (botX - topX) * t;
      const ry = topY + (botY - topY) * t;

      const rivetGrad = ctx.createRadialGradient(rx - 0.5 * zoom, ry - 0.5 * zoom, 0, rx, ry, s * 0.008);
      rivetGrad.addColorStop(0, "#ffe080");
      rivetGrad.addColorStop(0.5, "#daa520");
      rivetGrad.addColorStop(1, "#8a6020");
      ctx.fillStyle = rivetGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, s * 0.007, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Center buckle where straps cross
  const buckleY = y - s * 0.04;
  const buckleR = s * 0.025;
  const bGrad = ctx.createRadialGradient(x, buckleY, 0, x, buckleY, buckleR);
  bGrad.addColorStop(0, "#ffe080");
  bGrad.addColorStop(0.4, "#daa520");
  bGrad.addColorStop(1, "#8a6020");
  ctx.fillStyle = bGrad;
  ctx.beginPath();
  ctx.arc(x, buckleY, buckleR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Tiny gem in buckle center
  ctx.fillStyle = `rgba(255, 80, 20, ${0.7 + gemPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, buckleY, buckleR * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── SHOULDER PAULDRONS ─────────────────────────────────────────────────────

function drawShoulderPauldrons(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  gemPulse: number,
) {
  for (let side = -1; side <= 1; side += 2) {
    const sx = x + side * s * 0.22;
    const sy = y - s * 0.16;

    // Pauldron base plate
    const pGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, s * 0.1);
    pGrad.addColorStop(0, "#c49030");
    pGrad.addColorStop(0.4, "#a07020");
    pGrad.addColorStop(0.7, "#7a5518");
    pGrad.addColorStop(1, "#503810");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.085, s * 0.065, side * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Pauldron border
    ctx.strokeStyle = "#3a2508";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.085, s * 0.065, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Gold trim line
    ctx.strokeStyle = `rgba(255, 220, 100, 0.35)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.075, s * 0.055, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Layered scales on pauldron
    for (let sc = 0; sc < 3; sc++) {
      const scY = sy - s * 0.02 + sc * s * 0.022;
      const scX = sx + side * sc * s * 0.012;
      const scW = s * (0.035 - sc * 0.005);
      ctx.fillStyle = `rgba(160, 110, 30, ${0.3 - sc * 0.06})`;
      ctx.beginPath();
      ctx.ellipse(scX, scY, scW, scW * 0.45, side * 0.3, 0, Math.PI);
      ctx.fill();
    }

    // Phoenix eye engraving on pauldron
    const eyeGlow = 0.4 + gemPulse * 0.3;
    ctx.fillStyle = `rgba(255, 140, 30, ${eyeGlow})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.015, s * 0.01, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Flame wisps rising from pauldrons
    for (let w = 0; w < 3; w++) {
      const wPhase = (time * 3 + w * 0.8 + side) % 1;
      const wY = sy - wPhase * s * 0.12;
      const wX = sx + Math.sin(time * 5 + w * 2) * s * 0.02;
      const wAlpha = (1 - wPhase) * 0.4;
      const wSize = (1 - wPhase) * s * 0.02;

      ctx.fillStyle = `rgba(255, 180, 50, ${wAlpha})`;
      ctx.beginPath();
      ctx.arc(wX, wY, wSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── NECK ───────────────────────────────────────────────────────────────────

function drawNeck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
) {
  const neckTopY = y - s * 0.32;
  const neckGrad = ctx.createLinearGradient(x, y - s * 0.2, x, neckTopY);
  neckGrad.addColorStop(0, "#e67e22");
  neckGrad.addColorStop(0.4, "#d4690e");
  neckGrad.addColorStop(0.8, "#c05a08");
  neckGrad.addColorStop(1, "#a04a05");

  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.065, y - s * 0.2);
  ctx.quadraticCurveTo(x - s * 0.045, neckTopY + s * 0.06, x - s * 0.055, neckTopY);
  ctx.lineTo(x + s * 0.055, neckTopY);
  ctx.quadraticCurveTo(x + s * 0.045, neckTopY + s * 0.06, x + s * 0.065, y - s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Neck feather texture
  for (let i = 0; i < 4; i++) {
    const ny = y - s * 0.22 - i * s * 0.03;
    const nw = s * 0.05 - i * s * 0.005;
    ctx.strokeStyle = `rgba(160, 70, 10, ${0.2 - i * 0.03})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - nw, ny);
    ctx.quadraticCurveTo(x, ny - s * 0.005, x + nw, ny);
    ctx.stroke();
  }

  // Gold neck collar/gorget
  const collarY = y - s * 0.2;
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, collarY, s * 0.08, s * 0.025, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 120, 0.4)`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, collarY - 0.8 * zoom, s * 0.075, s * 0.02, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
}

// ─── HELMET + BIRD HEAD ─────────────────────────────────────────────────────

function drawHelmet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  gemPulse: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const headY = y - s * 0.38;
  const headTilt = isAttacking ? Math.sin(attackIntensity * Math.PI * 3) * s * 0.015 : 0;
  const hx = x + headTilt;

  // ── Head base (feathered bird head shape, taller and more avian) ──
  const headGrad = ctx.createRadialGradient(hx, headY - s * 0.01, s * 0.03, hx, headY + s * 0.01, s * 0.15);
  headGrad.addColorStop(0, "#ffc870");
  headGrad.addColorStop(0.25, "#e67e22");
  headGrad.addColorStop(0.5, "#cc5500");
  headGrad.addColorStop(0.75, "#993d00");
  headGrad.addColorStop(1, "#6b2800");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(hx, headY, s * 0.11, s * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head feather texture
  for (let row = 0; row < 5; row++) {
    const ry = headY - s * 0.08 + row * s * 0.035;
    const rw = s * 0.09 * Math.sin(((row + 0.5) / 5) * Math.PI);
    ctx.strokeStyle = `rgba(160, 70, 10, ${0.15 + row * 0.02})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(hx - rw, ry);
    ctx.quadraticCurveTo(hx, ry + s * 0.004, hx + rw, ry);
    ctx.stroke();
  }

  // ── Helmet armor overlay (partial, forehead/crown area) ──
  const helmGrad = ctx.createLinearGradient(hx - s * 0.1, headY - s * 0.14, hx + s * 0.1, headY - s * 0.02);
  helmGrad.addColorStop(0, "#8a6018");
  helmGrad.addColorStop(0.3, "#c49030");
  helmGrad.addColorStop(0.6, "#a07020");
  helmGrad.addColorStop(1, "#6a4510");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.11, headY - s * 0.04);
  ctx.quadraticCurveTo(hx - s * 0.12, headY - s * 0.1, hx - s * 0.06, headY - s * 0.14);
  ctx.lineTo(hx + s * 0.06, headY - s * 0.14);
  ctx.quadraticCurveTo(hx + s * 0.12, headY - s * 0.1, hx + s * 0.11, headY - s * 0.04);
  ctx.quadraticCurveTo(hx + s * 0.08, headY - s * 0.06, hx, headY - s * 0.04);
  ctx.quadraticCurveTo(hx - s * 0.08, headY - s * 0.06, hx - s * 0.11, headY - s * 0.04);
  ctx.closePath();
  ctx.fill();

  // Helmet border
  ctx.strokeStyle = "#3a2205";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Gold trim on helmet edge
  ctx.strokeStyle = `rgba(255, 220, 100, 0.35)`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.1, headY - s * 0.04);
  ctx.quadraticCurveTo(hx, headY - s * 0.03, hx + s * 0.1, headY - s * 0.04);
  ctx.stroke();

  // Central helmet ridge
  ctx.strokeStyle = `rgba(180, 130, 40, 0.5)`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(hx, headY - s * 0.145);
  ctx.lineTo(hx, headY - s * 0.04);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 120, 0.25)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(hx + 0.5 * zoom, headY - s * 0.14);
  ctx.lineTo(hx + 0.5 * zoom, headY - s * 0.045);
  ctx.stroke();

  // ── Crown / brow band ──
  const browY = headY - s * 0.04;
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(hx, browY, s * 0.11, s * 0.025, 0, Math.PI * 0.08, Math.PI * 0.92);
  ctx.stroke();

  // Crown center gem
  const crownGemR = s * 0.017;
  const cgGrad = ctx.createRadialGradient(hx, browY - s * 0.005, 0, hx, browY - s * 0.005, crownGemR);
  cgGrad.addColorStop(0, `rgba(255, 100, 30, ${0.9 + gemPulse * 0.1})`);
  cgGrad.addColorStop(0.4, `rgba(220, 50, 10, 0.9)`);
  cgGrad.addColorStop(1, `rgba(150, 20, 0, 0.7)`);
  ctx.fillStyle = cgGrad;
  ctx.beginPath();
  ctx.arc(hx, browY - s * 0.005, crownGemR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 200, 80, ${0.15 + gemPulse * 0.15})`;
  ctx.beginPath();
  ctx.arc(hx, browY - s * 0.005, crownGemR * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // ── EYES — large, expressive, glowing bird eyes ──
  for (let side = -1; side <= 1; side += 2) {
    const eyeX = hx + side * s * 0.055;
    const eyeY = headY + s * 0.005;

    // Eye socket shadow
    ctx.fillStyle = `rgba(80, 30, 0, 0.3)`;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, s * 0.032, s * 0.026, side * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye outer glow halo
    const eyeHalo = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.05);
    eyeHalo.addColorStop(0, `rgba(255, 200, 60, ${0.35 + gemPulse * 0.25})`);
    eyeHalo.addColorStop(0.5, `rgba(255, 140, 30, ${0.15 + gemPulse * 0.1})`);
    eyeHalo.addColorStop(1, `rgba(255, 80, 0, 0)`);
    ctx.fillStyle = eyeHalo;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Eye white / bright sclera
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.025);
    eyeGrad.addColorStop(0, "#fff8e0");
    eyeGrad.addColorStop(0.5, "#ffe080");
    eyeGrad.addColorStop(0.8, `rgba(255, 160, 40, ${0.8 + gemPulse * 0.2})`);
    eyeGrad.addColorStop(1, `rgba(220, 100, 10, 0.6)`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, s * 0.025, s * 0.02, side * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eye iris
    ctx.fillStyle = `rgba(200, 60, 0, ${0.9 + gemPulse * 0.1})`;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.012, 0, Math.PI * 2);
    ctx.fill();

    // Pupil — sharp vertical slit like a raptor
    ctx.fillStyle = "#1a0500";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, s * 0.004, s * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye specular highlight
    ctx.fillStyle = `rgba(255, 255, 240, 0.7)`;
    ctx.beginPath();
    ctx.arc(eyeX - s * 0.006, eyeY - s * 0.006, s * 0.005, 0, Math.PI * 2);
    ctx.fill();

    // Eye outline
    ctx.strokeStyle = `rgba(100, 40, 0, 0.5)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, s * 0.026, s * 0.021, side * 0.15, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── BEAK — large, prominent, hooked raptor beak ──
  const beakY = headY + s * 0.04;
  const beakLen = s * 0.16;

  // Upper beak — large curved hook
  const upperGrad = ctx.createLinearGradient(hx, beakY, hx, beakY - s * 0.02);
  upperGrad.addColorStop(0, "#cc8800");
  upperGrad.addColorStop(0.3, "#aa7700");
  upperGrad.addColorStop(0.7, "#886600");
  upperGrad.addColorStop(1, "#665500");
  ctx.fillStyle = upperGrad;
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.06, beakY - s * 0.015);
  ctx.quadraticCurveTo(hx - s * 0.12, beakY - s * 0.02, hx - beakLen, beakY + s * 0.005);
  ctx.quadraticCurveTo(hx - beakLen + s * 0.01, beakY + s * 0.018, hx - beakLen + s * 0.03, beakY + s * 0.012);
  ctx.lineTo(hx - s * 0.06, beakY + s * 0.008);
  ctx.closePath();
  ctx.fill();

  // Upper beak highlight ridge
  ctx.strokeStyle = `rgba(220, 180, 80, 0.45)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.065, beakY - s * 0.01);
  ctx.quadraticCurveTo(hx - s * 0.11, beakY - s * 0.012, hx - beakLen + s * 0.01, beakY + s * 0.003);
  ctx.stroke();

  // Lower beak
  ctx.fillStyle = "#996600";
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.06, beakY + s * 0.01);
  ctx.quadraticCurveTo(hx - s * 0.1, beakY + s * 0.022, hx - beakLen + s * 0.035, beakY + s * 0.015);
  ctx.lineTo(hx - s * 0.06, beakY + s * 0.008);
  ctx.closePath();
  ctx.fill();

  // Beak nostril
  ctx.fillStyle = `rgba(80, 40, 0, 0.4)`;
  ctx.beginPath();
  ctx.ellipse(hx - s * 0.08, beakY - s * 0.005, s * 0.006, s * 0.004, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Beak edge outline
  ctx.strokeStyle = `rgba(80, 40, 0, 0.35)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.06, beakY - s * 0.015);
  ctx.quadraticCurveTo(hx - s * 0.12, beakY - s * 0.02, hx - beakLen, beakY + s * 0.005);
  ctx.quadraticCurveTo(hx - beakLen + s * 0.01, beakY + s * 0.018, hx - beakLen + s * 0.03, beakY + s * 0.012);
  ctx.stroke();

  // ── Cheek feather tufts ──
  for (let side = -1; side <= 1; side += 2) {
    const tuftX = hx + side * s * 0.09;
    const tuftY = headY + s * 0.04;
    for (let t = 0; t < 3; t++) {
      const tAngle = side * (0.2 + t * 0.25) + Math.PI / 2;
      const tLen = s * (0.04 + t * 0.008);
      const tSway = Math.sin(time * 3 + t + side) * s * 0.005;
      ctx.strokeStyle = `rgba(180, 90, 20, ${0.3 - t * 0.06})`;
      ctx.lineWidth = (1.5 - t * 0.3) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tuftX, tuftY);
      ctx.lineTo(tuftX + Math.cos(tAngle) * tLen + tSway, tuftY + Math.sin(tAngle) * tLen);
      ctx.stroke();
    }
  }

  // ── Flaming crest / plume ──
  drawHelmetPlume(ctx, hx, headY, s, time, zoom, flamePulse);
}

// ─── HELMET PLUME (grand fire plume) ────────────────────────────────────────

function drawHelmetPlume(
  ctx: CanvasRenderingContext2D,
  hx: number,
  headY: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
) {
  const plumeBaseY = headY - s * 0.13;

  // Back plume glow
  const backGlow = ctx.createRadialGradient(hx, plumeBaseY - s * 0.1, 0, hx, plumeBaseY - s * 0.1, s * 0.15);
  backGlow.addColorStop(0, `rgba(255, 180, 50, ${0.2 + flamePulse * 0.1})`);
  backGlow.addColorStop(1, `rgba(255, 100, 20, 0)`);
  ctx.fillStyle = backGlow;
  ctx.beginPath();
  ctx.arc(hx, plumeBaseY - s * 0.1, s * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Main plume flames (layered)
  const plumeCount = 7;
  for (let i = 0; i < plumeCount; i++) {
    const spread = (i - (plumeCount - 1) / 2) * 0.22;
    const plumeLen = s * (0.15 + Math.random() * 0 + (1 - Math.abs(spread) / 0.7) * 0.08);
    const sway = Math.sin(time * 5 + i * 0.9) * s * 0.015;
    const flicker = Math.sin(time * 8 + i * 1.7) * s * 0.01;

    const tipX = hx + spread * s * 0.2 + sway;
    const tipY = plumeBaseY - plumeLen + flicker;

    // Outer flame tongue
    const flameGrad = ctx.createLinearGradient(hx, plumeBaseY, tipX, tipY);
    flameGrad.addColorStop(0, `rgba(200, 80, 10, 0.8)`);
    flameGrad.addColorStop(0.3, `rgba(230, 126, 34, 0.7)`);
    flameGrad.addColorStop(0.6, `rgba(255, 180, 50, ${0.5 + flamePulse * 0.2})`);
    flameGrad.addColorStop(1, `rgba(255, 240, 120, ${0.2 + flamePulse * 0.2})`);

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(hx + spread * s * 0.08, plumeBaseY);
    ctx.quadraticCurveTo(
      hx + spread * s * 0.15 + sway * 0.6, plumeBaseY - plumeLen * 0.5,
      tipX, tipY,
    );
    ctx.quadraticCurveTo(
      hx + spread * s * 0.1 - sway * 0.3, plumeBaseY - plumeLen * 0.3,
      hx - spread * s * 0.04, plumeBaseY,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Hot core plume center
  const corePlumeLen = s * 0.18;
  const coreSway = Math.sin(time * 6) * s * 0.008;
  const coreGrad = ctx.createLinearGradient(hx, plumeBaseY, hx + coreSway, plumeBaseY - corePlumeLen);
  coreGrad.addColorStop(0, `rgba(255, 220, 100, 0.7)`);
  coreGrad.addColorStop(0.5, `rgba(255, 255, 200, ${0.5 + flamePulse * 0.2})`);
  coreGrad.addColorStop(1, `rgba(255, 240, 180, 0)`);

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.015, plumeBaseY);
  ctx.quadraticCurveTo(hx + coreSway, plumeBaseY - corePlumeLen * 0.6, hx + coreSway, plumeBaseY - corePlumeLen);
  ctx.quadraticCurveTo(hx + coreSway, plumeBaseY - corePlumeLen * 0.6, hx + s * 0.015, plumeBaseY);
  ctx.closePath();
  ctx.fill();

  // Spark particles from plume tip
  for (let sp = 0; sp < 4; sp++) {
    const sparkPhase = (time * 4 + sp * 0.25) % 1;
    const sparkX = hx + Math.sin(time * 7 + sp * 2.5) * s * 0.04;
    const sparkY = plumeBaseY - corePlumeLen + sparkPhase * s * -0.08;
    const sparkAlpha = (1 - sparkPhase) * 0.6;
    const sparkSize = (1.5 - sparkPhase * 0.8) * zoom;

    ctx.fillStyle = `rgba(255, 220, 80, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── TALONS ─────────────────────────────────────────────────────────────────

function drawTalons(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const talonY = y + s * 0.28;
  const talonSpread = isAttacking ? s * 0.16 + attackIntensity * s * 0.05 : s * 0.12;

  for (let side = -1; side <= 1; side += 2) {
    const talonX = x + side * talonSpread;

    // Armored leg with gold band
    const legGrad = ctx.createLinearGradient(x + side * s * 0.08, y + s * 0.18, talonX, talonY);
    legGrad.addColorStop(0, "#aa7700");
    legGrad.addColorStop(0.5, "#886600");
    legGrad.addColorStop(1, "#664400");

    ctx.strokeStyle = legGrad;
    ctx.lineWidth = 3 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.08, y + s * 0.18);
    ctx.lineTo(talonX, talonY);
    ctx.stroke();

    // Leg armor band
    const bandY = y + s * 0.22;
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.06, bandY);
    ctx.lineTo(x + side * s * 0.12, bandY + s * 0.01);
    ctx.stroke();

    // Talon toes with sharp curved claws
    for (let t = 0; t < 3; t++) {
      const toeAngle = (t - 1) * 0.45 + side * 0.2;
      const toeLen = s * 0.06;
      const grab = isAttacking ? Math.sin(attackIntensity * Math.PI * 2 + t) * 0.2 : 0;
      const clawAngle = Math.PI / 2 + toeAngle + grab;

      // Toe
      ctx.strokeStyle = "#886600";
      ctx.lineWidth = 2 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(talonX, talonY);
      ctx.lineTo(
        talonX + Math.cos(clawAngle) * toeLen,
        talonY + Math.sin(clawAngle) * toeLen,
      );
      ctx.stroke();

      // Sharp claw tip
      const tipX = talonX + Math.cos(clawAngle) * toeLen;
      const tipY = talonY + Math.sin(clawAngle) * toeLen;
      ctx.strokeStyle = "#443300";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(
        tipX + Math.cos(clawAngle + 0.3) * s * 0.02,
        tipY + Math.sin(clawAngle + 0.3) * s * 0.02,
      );
      ctx.stroke();
    }
  }
}

// ─── FIRE AURA ──────────────────────────────────────────────────────────────

function drawFireAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  flamePulse: number,
  isAttacking: boolean,
  zoom: number,
) {
  const auraRadius = s * (0.6 + flamePulse * 0.12 + (isAttacking ? 0.18 : 0));
  const auraAlpha = 0.12 + flamePulse * 0.06 + (isAttacking ? 0.08 : 0);

  const auraGrad = ctx.createRadialGradient(x, y, s * 0.12, x, y, auraRadius);
  auraGrad.addColorStop(0, `rgba(255, 210, 90, ${auraAlpha})`);
  auraGrad.addColorStop(0.3, `rgba(255, 150, 40, ${auraAlpha * 0.6})`);
  auraGrad.addColorStop(0.6, `rgba(220, 70, 10, ${auraAlpha * 0.3})`);
  auraGrad.addColorStop(1, `rgba(150, 30, 0, 0)`);

  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting ember particles
  for (let i = 0; i < 8; i++) {
    const orbitAngle = time * 2.2 + (i * Math.PI * 2) / 8;
    const orbitDist = s * (0.32 + Math.sin(time * 1.3 + i) * 0.1);
    const emberX = x + Math.cos(orbitAngle) * orbitDist;
    const emberY = y + Math.sin(orbitAngle) * orbitDist * 0.6;
    const emberAlpha = 0.55 + Math.sin(time * 5 + i * 2) * 0.25;
    const emberSize = (1.8 + Math.sin(time * 4 + i) * 0.6) * zoom;

    const embGrad = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, emberSize);
    embGrad.addColorStop(0, `rgba(255, 240, 120, ${emberAlpha})`);
    embGrad.addColorStop(1, `rgba(255, 140, 40, 0)`);
    ctx.fillStyle = embGrad;
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rising cinder sparks
  for (let i = 0; i < 5; i++) {
    const cinderPhase = (time * 1.5 + i * 0.2) % 1;
    const cinderX = x + Math.sin(time * 2 + i * 1.8) * s * 0.25;
    const cinderY = y + s * 0.3 - cinderPhase * s * 0.8;
    const cinderAlpha = Math.sin(cinderPhase * Math.PI) * 0.45;

    ctx.fillStyle = `rgba(255, 200, 60, ${cinderAlpha})`;
    ctx.beginPath();
    ctx.arc(cinderX, cinderY, zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ATTACK FLARE ───────────────────────────────────────────────────────────

function drawAttackFlare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  attackIntensity: number,
  time: number,
  zoom: number,
) {
  const flarePhase = Math.sin(attackIntensity * Math.PI);
  const flareRadius = s * 0.55 * flarePhase;

  // Bright flash
  const flareGrad = ctx.createRadialGradient(x, y - s * 0.1, 0, x, y - s * 0.1, flareRadius);
  flareGrad.addColorStop(0, `rgba(255, 255, 230, ${0.65 * flarePhase})`);
  flareGrad.addColorStop(0.2, `rgba(255, 220, 100, ${0.45 * flarePhase})`);
  flareGrad.addColorStop(0.5, `rgba(255, 140, 30, ${0.25 * flarePhase})`);
  flareGrad.addColorStop(1, `rgba(200, 50, 10, 0)`);
  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.1, flareRadius, 0, Math.PI * 2);
  ctx.fill();

  // Radial burst lines
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 + time * 4;
    const lineLen = s * 0.35 * flarePhase;
    const lineAlpha = flarePhase * 0.45;
    const innerR = s * 0.08;

    ctx.strokeStyle = i % 2 === 0
      ? `rgba(255, 200, 60, ${lineAlpha})`
      : `rgba(255, 140, 40, ${lineAlpha * 0.7})`;
    ctx.lineWidth = (i % 2 === 0 ? 2 : 1.2) * zoom;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * innerR, y - s * 0.1 + Math.sin(angle) * innerR);
    ctx.lineTo(x + Math.cos(angle) * (innerR + lineLen), y - s * 0.1 + Math.sin(angle) * (innerR + lineLen));
    ctx.stroke();
  }
}
