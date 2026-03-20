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
  const legGrad = ctx.createLinearGradient(baseX, baseY, endX, endY);
  legGrad.addColorStop(0, color);
  legGrad.addColorStop(1, colorDark);
  ctx.strokeStyle = legGrad;
  ctx.lineWidth = width * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(midX, midY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.arc(midX, midY, jointSize, 0, Math.PI * 2);
  ctx.fill();
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
    ctx.fillStyle = `rgba(${wingColor}, ${wingAlpha + Math.sin(time * 3) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(wingW * 0.4, -wingH * 0.3, wingW, wingH, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Wing veins
    ctx.strokeStyle = `rgba(${wingColor}, ${wingAlpha * 0.6})`;
    ctx.lineWidth = 1 * zoom;
    for (let v = 0; v < 3; v++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(wingW * (0.5 + v * 0.2), -wingH * (0.1 + v * 0.15));
      ctx.stroke();
    }
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

  // Abdomen (large, round with pattern)
  const abdGrad = ctx.createRadialGradient(x, y + size * 0.1, 0, x, y + size * 0.1, size * 0.35);
  abdGrad.addColorStop(0, bodyColorLight);
  abdGrad.addColorStop(0.5, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.32 + breathe * size, size * 0.28 + breathe * size, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen cross pattern (orb weaver marking)
  ctx.strokeStyle = "#c4a35a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y + size * 0.1);
  ctx.lineTo(x + size * 0.1, y + size * 0.1);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + size * 0.2);
  ctx.stroke();
  // Chevron markings
  for (let m = 0; m < 3; m++) {
    const my = y + size * 0.02 + m * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08, my);
    ctx.lineTo(x, my - size * 0.03);
    ctx.lineTo(x + size * 0.08, my);
    ctx.stroke();
  }

  // Cephalothorax
  const headGrad = ctx.createRadialGradient(x, y - size * 0.15, 0, x, y - size * 0.15, size * 0.2);
  headGrad.addColorStop(0, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.15, size * 0.2, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chelicerae (fangs)
  const fangSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * size * 0.05 : 0;
  ctx.fillStyle = "#1a0a05";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, y - size * 0.28);
    ctx.quadraticCurveTo(
      x + side * (size * 0.1 + fangSpread), y - size * 0.35,
      x + side * (size * 0.04 + fangSpread * 0.5), y - size * 0.4,
    );
    ctx.lineTo(x + side * size * 0.03, y - size * 0.3);
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

  // Spinnerets (silk production at rear)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.32, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
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

  // Elongated abdomen
  const abdGrad = ctx.createLinearGradient(x, y, x, y + size * 0.4);
  abdGrad.addColorStop(0, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.12, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thorax
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05, size * 0.14, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Triangular head (rotatable)
  ctx.save();
  ctx.translate(x, y - size * 0.22);
  ctx.rotate(sway);
  const headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(1, bodyColor);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.15);
  ctx.lineTo(-size * 0.12, size * 0.02);
  ctx.lineTo(size * 0.12, size * 0.02);
  ctx.closePath();
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
    // Lower arm (tibia - the scythe blade)
    ctx.translate(0, size * 0.2);
    const bladeAngle = isAttacking ? -1.2 - attackPhase * 1.5 : -0.8 + Math.sin(time * 2.5) * 0.2;
    ctx.rotate(bladeAngle);
    const bladeGrad = ctx.createLinearGradient(0, 0, 0, size * 0.22);
    bladeGrad.addColorStop(0, bodyColor);
    bladeGrad.addColorStop(1, "#2a1a05");
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, 0);
    ctx.lineTo(size * 0.01, size * 0.22);
    ctx.lineTo(size * 0.025, size * 0.22);
    ctx.lineTo(size * 0.02, 0);
    ctx.fill();
    // Serrated edge
    ctx.strokeStyle = "#1a0a00";
    ctx.lineWidth = 1 * zoom;
    for (let t = 0; t < 5; t++) {
      const ty = size * 0.03 + t * size * 0.035;
      ctx.beginPath();
      ctx.moveTo(-size * 0.02, ty);
      ctx.lineTo(-size * 0.04, ty + size * 0.015);
      ctx.lineTo(-size * 0.02, ty + size * 0.03);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Wing cases (folded)
  ctx.fillStyle = `rgba(${bodyColor === "#65a30d" ? "120, 180, 30" : "100, 160, 20"}, 0.3)`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.04, y + size * 0.05, size * 0.06, size * 0.18, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.04, y + size * 0.05, size * 0.06, size * 0.18, 0.1, 0, Math.PI * 2);
  ctx.fill();

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

  // Abdomen (chemical chamber - glows when attacking)
  const chamberGlow = isAttacking ? 0.6 + attackPhase * 0.4 : 0.2 + Math.sin(time * 2) * 0.1;
  const abdGrad = ctx.createRadialGradient(x, y + size * 0.08, 0, x, y + size * 0.08, size * 0.28);
  abdGrad.addColorStop(0, `rgba(255, 120, 30, ${chamberGlow})`);
  abdGrad.addColorStop(0.4, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.08, size * 0.28 + breathe * size, size * 0.22 + breathe * size, 0, 0, Math.PI * 2);
  ctx.fill();

  // Elytra (wing cases) with metallic sheen
  const sheenPhase = Math.sin(time * 2.5) * 0.5 + 0.5;
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.07, y - size * 0.02, size * 0.13, size * 0.22, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Metallic highlight
    ctx.fillStyle = `rgba(100, 180, 255, ${sheenPhase * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.03, y - size * 0.08, size * 0.04, size * 0.1, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Elytra seam
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x, y + size * 0.15);
  ctx.stroke();

  // Pronotum (shield)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.18, size * 0.18, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const hGrad = ctx.createRadialGradient(x, y - size * 0.28, 0, x, y - size * 0.28, size * 0.12);
  hGrad.addColorStop(0, bodyColor);
  hGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
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

  // Mandibles
  ctx.fillStyle = "#1a1510";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, y - size * 0.35);
    ctx.lineTo(x + side * size * 0.08, y - size * 0.42);
    ctx.lineTo(x + side * size * 0.02, y - size * 0.38);
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

  // Acid spray nozzle at rear
  ctx.fillStyle = `rgba(255, 100, 20, ${chamberGlow})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.28, size * 0.04, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // Dangling legs
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let leg = 0; leg < 6; leg++) {
    const lx = x + (leg - 2.5) * size * 0.06;
    const dangle = Math.sin(time * 4 + leg * 0.8) * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(lx, y + size * 0.05);
    ctx.quadraticCurveTo(lx + dangle, y + size * 0.2, lx + dangle * 1.5, y + size * 0.35);
    ctx.stroke();
  }

  // Abdomen (bloated, reddish when full)
  const bloat = isAttacking ? 0.02 : Math.sin(time * 1.5) * 0.01;
  const abdGrad = ctx.createRadialGradient(x, y + size * 0.05, 0, x, y + size * 0.05, size * 0.18);
  abdGrad.addColorStop(0, bodyColorLight);
  abdGrad.addColorStop(0.6, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * (0.1 + bloat), size * (0.2 + bloat), 0, 0, Math.PI * 2);
  ctx.fill();

  // Thorax
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.2, size * 0.08, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Compound eyes (large)
  ctx.fillStyle = `rgba(200, 50, 50, ${0.7 + Math.sin(time * 3) * 0.3})`;
  setShadowBlur(ctx, 4 * zoom, "#c83232");
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.22, size * 0.04, size * 0.035, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.22, size * 0.04, size * 0.035, 0.3, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Proboscis (long needle)
  const probAngle = isAttacking ? -Math.PI * 0.5 - 0.3 : -Math.PI * 0.5 + Math.sin(time * 2) * 0.1;
  ctx.save();
  ctx.translate(x, y - size * 0.25);
  ctx.rotate(probAngle);
  ctx.strokeStyle = "#2a1a15";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -size * 0.25);
  ctx.stroke();
  // Proboscis tip
  ctx.fillStyle = isAttacking ? `rgba(200, 30, 30, ${0.8})` : "#3a2a20";
  ctx.beginPath();
  ctx.arc(0, -size * 0.25, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
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

    // Segment body
    const segGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.08);
    const tint = i % 2 === 0 ? bodyColor : bodyColorDark;
    segGrad.addColorStop(0, bodyColorLight);
    segGrad.addColorStop(0.5, tint);
    segGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, size * 0.1, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armor plate line
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(sx, sy, size * 0.09, size * 0.02, 0, 0, Math.PI);
    ctx.stroke();

    // Legs for each segment (except head)
    if (i > 0) {
      const legGait = Math.sin(waveSpeed + i * 0.6);
      const legLift = Math.max(0, legGait) * size * 0.03;
      for (let side = -1; side <= 1; side += 2) {
        const lbx = sx + side * size * 0.08;
        const lex = sx + side * size * 0.2 + legGait * side * size * 0.02;
        const ley = sy + size * 0.06 - legLift;
        ctx.strokeStyle = bodyColorDark;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(lbx, sy);
        ctx.lineTo(lbx + side * size * 0.05, sy - size * 0.03 - legLift);
        ctx.lineTo(lex, ley);
        ctx.stroke();
      }
    }
  }

  // Head (first segment, larger)
  const hx = segPositions[0].x;
  const hy = segPositions[0].y;
  const headGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, size * 0.12);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(hx, hy, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

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
}

export function drawDragonflyEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  bodyColor: string, bodyColorDark: string, bodyColorLight: string,
  time: number, zoom: number, attackPhase: number = 0,
) {
  size *= 1.15;

  // Four iridescent wings
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
      // Wing body
      const iridescence = Math.sin(time * 3 + pair) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(${Math.round(14 + iridescence * 80)}, ${Math.round(165 + iridescence * 60)}, ${Math.round(233 - iridescence * 80)}, 0.35)`;
      ctx.beginPath();
      ctx.ellipse(wingW * 0.35, 0, wingW, wingH, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing veins
      ctx.strokeStyle = `rgba(14, 165, 233, 0.3)`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(wingW * 0.7, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(wingW * 0.5, -wingH * 0.5);
      ctx.moveTo(0, 0);
      ctx.lineTo(wingW * 0.5, wingH * 0.5);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Long segmented abdomen
  for (let seg = 0; seg < 7; seg++) {
    const segY = y + size * 0.02 + seg * size * 0.04;
    const segW = size * (0.06 - seg * 0.003);
    const segWave = Math.sin(time * 3 + seg * 0.5) * size * 0.01;
    ctx.fillStyle = seg % 2 === 0 ? bodyColor : bodyColorDark;
    ctx.beginPath();
    ctx.ellipse(x + segWave, segY, segW, size * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Thorax
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const hGrad = ctx.createRadialGradient(x, y - size * 0.18, 0, x, y - size * 0.18, size * 0.1);
  hGrad.addColorStop(0, bodyColorLight);
  hGrad.addColorStop(1, bodyColor);
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.18, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive compound eyes
  ctx.fillStyle = `rgba(14, 165, 233, ${0.8 + Math.sin(time * 4) * 0.2})`;
  setShadowBlur(ctx, 5 * zoom, "#0ea5e9");
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.2, size * 0.055, size * 0.045, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.2, size * 0.055, size * 0.045, 0.2, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Legs (tucked underneath in flight)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let leg = 0; leg < 6; leg++) {
    const lx = x + (leg % 2 === 0 ? -1 : 1) * size * 0.05;
    const ly = y + (Math.floor(leg / 2) - 1) * size * 0.04;
    const dangle = Math.sin(time * 4 + leg) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + dangle, ly + size * 0.12);
    ctx.stroke();
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

    // Eye spot on wing
    ctx.fillStyle = `rgba(100, 60, 160, 0.5)`;
    ctx.beginPath();
    ctx.arc(size * 0.22, -size * 0.12, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 210, 255, 0.6)`;
    ctx.beginPath();
    ctx.arc(size * 0.22, -size * 0.12, size * 0.03, 0, Math.PI * 2);
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

  // Fuzzy body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.06, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fur tufts
  for (let f = 0; f < 6; f++) {
    const fa = (f / 6) * Math.PI * 2;
    const fd = size * 0.06;
    ctx.fillStyle = bodyColorLight;
    ctx.beginPath();
    ctx.arc(x + Math.cos(fa) * fd, y + Math.sin(fa) * fd * 0.8, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.15, size * 0.06, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // Gaster (rear segment)
  const abdGrad = ctx.createRadialGradient(x, y + size * 0.12, 0, x, y + size * 0.12, size * 0.2);
  abdGrad.addColorStop(0, bodyColorLight);
  abdGrad.addColorStop(0.6, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.12, size * 0.18, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Petiole (narrow waist)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.04, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mesosoma (thorax)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.14, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with large mandibles
  const headGrad = ctx.createRadialGradient(x, y - size * 0.25, 0, x, y - size * 0.25, size * 0.12);
  headGrad.addColorStop(0, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.25, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
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

  // Hind legs (powerful jumping legs)
  for (let side = -1; side <= 1; side += 2) {
    const legBend = Math.sin(time * 4) * 0.1;
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    // Femur (thick, angled up)
    ctx.moveTo(x + side * size * 0.06, y + size * 0.02);
    ctx.lineTo(x + side * size * 0.2, y - size * 0.12 + legBend * size);
    // Tibia (thin, angled down)
    ctx.lineTo(x + side * size * 0.35, y + size * 0.2 - legBend * size);
    ctx.stroke();
    // Tarsus
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.35, y + size * 0.2);
    ctx.lineTo(x + side * size * 0.38, y + size * 0.24);
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

  // Abdomen
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * 0.08, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thorax
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.06, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pronotum (saddle-shaped shield)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.04);
  ctx.quadraticCurveTo(x, y - size * 0.12, x + size * 0.1, y - size * 0.04);
  ctx.quadraticCurveTo(x, y - size * 0.02, x - size * 0.1, y - size * 0.04);
  ctx.fill();

  // Head
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.18, size * 0.07, size * 0.06, 0, 0, Math.PI * 2);
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

  // Large round abdomen (stocky build)
  const abdGrad = ctx.createRadialGradient(x, y + size * 0.08, 0, x, y + size * 0.08, size * 0.3);
  abdGrad.addColorStop(0, bodyColorLight);
  abdGrad.addColorStop(0.4, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.08, size * 0.28, size * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen texture (dirt/camouflage)
  ctx.fillStyle = `rgba(100, 70, 40, 0.3)`;
  for (let t = 0; t < 5; t++) {
    ctx.beginPath();
    ctx.arc(
      x + Math.sin(t * 2.1) * size * 0.12,
      y + size * 0.05 + Math.cos(t * 1.7) * size * 0.1,
      size * 0.04, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Cephalothorax (front body)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.12, size * 0.18, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive chelicerae/fangs (downward pointing)
  const fangSpread = isAttacking ? Math.sin(attackPhase * Math.PI * 4) * size * 0.06 : Math.sin(time * 2) * size * 0.01;
  ctx.fillStyle = "#1a0805";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.05, y - size * 0.22);
    ctx.quadraticCurveTo(
      x + side * (size * 0.08 + fangSpread), y - size * 0.3,
      x + side * (size * 0.03 + fangSpread * 0.3), y - size * 0.38,
    );
    ctx.lineTo(x + side * size * 0.02, y - size * 0.26);
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

  // Crystalline carapace (abdomen)
  const crystalGrad = ctx.createRadialGradient(x, y + size * 0.06, 0, x, y + size * 0.06, size * 0.28);
  crystalGrad.addColorStop(0, "rgba(200, 245, 255, 0.9)");
  crystalGrad.addColorStop(0.5, bodyColor);
  crystalGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = crystalGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.06, size * 0.25, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ice crystal facets
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 2.5) * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  for (let f = 0; f < 4; f++) {
    const fa = f * (Math.PI / 2) + 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.06);
    ctx.lineTo(x + Math.cos(fa) * size * 0.22, y + size * 0.06 + Math.sin(fa) * size * 0.17);
    ctx.stroke();
  }

  // Elytra (ice wing cases)
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = `rgba(160, 230, 255, 0.4)`;
    ctx.beginPath();
    ctx.ellipse(x + side * size * 0.06, y - size * 0.02, size * 0.11, size * 0.18, side * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pronotum
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.15, size * 0.16, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.25, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
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

  // Idiosoma (body - flat, shield-like)
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.22);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Scutum (dorsal shield)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.04, size * 0.14, size * 0.1, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Frost pattern on shell
  ctx.strokeStyle = `rgba(200, 245, 255, ${0.3 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  for (let f = 0; f < 3; f++) {
    const fx = x + Math.sin(f * 2.1) * size * 0.08;
    const fy = y + Math.cos(f * 1.7) * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + size * 0.04, fy - size * 0.03);
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - size * 0.03, fy - size * 0.04);
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + size * 0.01, fy + size * 0.04);
    ctx.stroke();
  }

  // Capitulum (head/mouthparts)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.18, size * 0.06, size * 0.05, 0, 0, Math.PI * 2);
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

    // Frost vein pattern
    ctx.strokeStyle = `rgba(200, 240, 255, 0.4)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.05, 0);
    ctx.lineTo(size * 0.25, -size * 0.15);
    ctx.moveTo(size * 0.15, -size * 0.1);
    ctx.lineTo(size * 0.3, -size * 0.08);
    ctx.stroke();

    // Lower wing
    ctx.fillStyle = `rgba(220, 238, 250, 0.4)`;
    ctx.beginPath();
    ctx.moveTo(size * 0.03, size * 0.01);
    ctx.quadraticCurveTo(size * 0.22, size * 0.12, size * 0.3, size * 0.08);
    ctx.quadraticCurveTo(size * 0.18, size * 0.01, size * 0.03, -size * 0.01);
    ctx.fill();

    ctx.restore();
  }

  // Fuzzy white body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.05, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fur tufts
  for (let f = 0; f < 5; f++) {
    const fa = (f / 5) * Math.PI * 2;
    ctx.fillStyle = bodyColorLight;
    ctx.beginPath();
    ctx.arc(x + Math.cos(fa) * size * 0.05, y + Math.sin(fa) * size * 0.07, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.13, size * 0.05, size * 0.04, 0, 0, Math.PI * 2);
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

  // Large gaster (abdomen) with pulsing glow
  const fireGlow = 0.3 + Math.sin(time * 3) * 0.2;
  const abdGrad = ctx.createRadialGradient(x, y + size * 0.12, 0, x, y + size * 0.12, size * 0.25);
  abdGrad.addColorStop(0, `rgba(255, 100, 30, ${fireGlow})`);
  abdGrad.addColorStop(0.4, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.12, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Segment lines on gaster
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  for (let s = 0; s < 3; s++) {
    const sy2 = y + size * 0.04 + s * size * 0.06;
    ctx.beginPath();
    ctx.ellipse(x, sy2, size * 0.2 - s * size * 0.03, size * 0.015, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Petiole
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.02, size * 0.05, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mesosoma
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.15, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // Head
  const headGrad = ctx.createRadialGradient(x, y - size * 0.22, 0, x, y - size * 0.22, size * 0.12);
  headGrad.addColorStop(0, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.22, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
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

  // Obsidian carapace with magma cracks
  const shellGrad = ctx.createRadialGradient(x, y + size * 0.05, 0, x, y + size * 0.05, size * 0.3);
  shellGrad.addColorStop(0, bodyColorLight);
  shellGrad.addColorStop(0.5, bodyColor);
  shellGrad.addColorStop(1, "#0a0505");
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * 0.28, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // Pronotum
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.15, size * 0.18, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.25, size * 0.12, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mandibles
  ctx.fillStyle = "#0a0505";
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.05, y - size * 0.3);
    ctx.lineTo(x + side * size * 0.1, y - size * 0.38);
    ctx.lineTo(x + side * size * 0.03, y - size * 0.34);
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

    // Ember patterns on wing
    ctx.fillStyle = `rgba(255, 200, 60, ${0.3 + Math.sin(time * 4 + side * 2) * 0.15})`;
    ctx.beginPath();
    ctx.arc(size * 0.18, -size * 0.1, size * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Lower wing
    ctx.fillStyle = `rgba(249, 115, 22, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(size * 0.03, size * 0.01);
    ctx.quadraticCurveTo(size * 0.2, size * 0.12, size * 0.28, size * 0.08);
    ctx.quadraticCurveTo(size * 0.15, size * 0.01, size * 0.03, -size * 0.01);
    ctx.fill();

    ctx.restore();
  }

  // Sooty body
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.055, size * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  // Glowing abdomen tip
  ctx.fillStyle = `rgba(255, 140, 30, ${0.5 + Math.sin(time * 3) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.1, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.14, size * 0.05, size * 0.04, 0, 0, Math.PI * 2);
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

  // Enormous abdomen with egg sac
  const abdGrad = ctx.createRadialGradient(x, y + size * 0.12, 0, x, y + size * 0.12, size * 0.38);
  abdGrad.addColorStop(0, bodyColorLight);
  abdGrad.addColorStop(0.4, bodyColor);
  abdGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.12, size * 0.36 + breathe * size, size * 0.32 + breathe * size, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // Cephalothorax
  const thoraxGrad = ctx.createRadialGradient(x, y - size * 0.12, 0, x, y - size * 0.12, size * 0.22);
  thoraxGrad.addColorStop(0, bodyColor);
  thoraxGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = thoraxGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.12, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // Silk spray spinnerets
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.38, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

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
