import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

export function drawFScottHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breathe = Math.sin(time * 2) * 1;
  const goldPulse = Math.sin(time * 3) * 0.3 + 0.7;

  // Cursive writing animation with word breaks and varied pen pressure
  const writeCycle = (time * 0.5) % 1;
  const wordPhase = (writeCycle * 5) % 1;
  const betweenWords = wordPhase > 0.88;
  const penStrokeX = isAttacking
    ? 0
    : betweenWords
      ? Math.sin(time * 3) * size * 0.005
      : Math.sin(wordPhase * Math.PI * 3) * size * 0.04 +
        Math.cos(wordPhase * Math.PI * 7) * size * 0.012;
  const penStrokeY = isAttacking
    ? 0
    : betweenWords
      ? -size * 0.012
      : Math.sin(wordPhase * Math.PI * 5) * size * 0.02 +
        Math.cos(wordPhase * Math.PI * 2) * size * 0.008;

  drawAura(
    ctx,
    x,
    y,
    size,
    time,
    isAttacking,
    attackIntensity,
    goldPulse,
    zoom
  );
  drawGreenLight(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawFloatingLetters(ctx, x, y, size, time, goldPulse, zoom, "behind");

  if (isAttacking) {
    drawAttackRings(ctx, x, y, size, attackPhase, attackIntensity, zoom);
  }

  drawCape(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawSuit(ctx, x, y, size, breathe, zoom);
  drawScottSkirtArmor(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    isAttacking,
    attackIntensity,
    goldPulse
  );
  drawEpaulettes(ctx, x, y, size, time, zoom);
  drawAiguillette(ctx, x, y, size, time, zoom);
  drawVest(ctx, x, y, size, zoom);
  drawShirtAndTie(ctx, x, y, size, isAttacking, attackIntensity, zoom);
  drawArms(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    isAttacking,
    attackPhase,
    penStrokeX,
    penStrokeY
  );
  drawCapeWraps(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawHead(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawStormCollar(ctx, x, y, size, zoom);
  drawHelmet(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawFloatingLetters(ctx, x, y, size, time, goldPulse, zoom, "front");
  drawBook(ctx, x, y, size, time, zoom, isAttacking, writeCycle);
  drawPen(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    isAttacking,
    attackPhase,
    attackIntensity,
    penStrokeX,
    penStrokeY,
    targetPos
  );
  drawFloatingWords(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
}

// ─── AURA ────────────────────────────────────────────────────────────────────

function drawAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  isAttacking: boolean,
  attackIntensity: number,
  goldPulse: number,
  zoom: number
) {
  const auraBase = isAttacking ? 0.45 : 0.24;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  for (let layer = 0; layer < 3; layer++) {
    const off = layer * 0.08;
    const g = ctx.createRadialGradient(
      x,
      y - size * 0.1,
      size * (0.08 + off),
      x,
      y - size * 0.1,
      size * (0.95 + off * 0.3)
    );
    const a = (auraBase - layer * 0.06) * auraPulse;
    g.addColorStop(0, `rgba(218, 175, 55, ${a * 0.55})`);
    g.addColorStop(0.3, `rgba(184, 144, 30, ${a * 0.38})`);
    g.addColorStop(0.6, `rgba(160, 130, 35, ${a * 0.2})`);
    g.addColorStop(1, "rgba(218, 165, 32, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.1,
      size * (0.88 + off * 0.15),
      size * (0.76 + off * 0.12),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  for (let layer = 0; layer < 2; layer++) {
    const off = 0.24 + layer * 0.08;
    const g = ctx.createRadialGradient(
      x,
      y - size * 0.1,
      size * (0.5 + off),
      x,
      y - size * 0.1,
      size * (1.05 + off * 0.2)
    );
    const a = (auraBase * 0.5 - layer * 0.04) * auraPulse;
    g.addColorStop(0, `rgba(52, 211, 153, ${a * 0.25})`);
    g.addColorStop(0.5, `rgba(34, 197, 94, ${a * 0.12})`);
    g.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.1,
      size * (0.92 + off * 0.12),
      size * (0.8 + off * 0.1),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const decoAlpha = (isAttacking ? 0.2 : 0.09) * auraPulse;
  ctx.strokeStyle = `rgba(218, 175, 55, ${decoAlpha})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let d = 0; d < 3; d++) {
    const angle = time * 0.25 + (d * Math.PI) / 1.5;
    const r = size * (0.5 + d * 0.1);
    const rY = r * 0.72;
    ctx.beginPath();
    for (let v = 0; v < 4; v++) {
      const va = angle + (v * Math.PI) / 2;
      const vx = x + Math.cos(va) * r;
      const vy = y - size * 0.1 + Math.sin(va) * rY;
      if (v === 0) {
        ctx.moveTo(vx, vy);
      } else {
        ctx.lineTo(vx, vy);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  for (let p = 0; p < 8; p++) {
    const sparkPhase = (time * 0.8 + p * 0.75) % 2;
    const sparkAngle = (time * 0.4 + (p * Math.PI * 2) / 8) % (Math.PI * 2);
    const sparkDist = size * (0.4 + sparkPhase * 0.25);
    const sparkX = x + Math.cos(sparkAngle) * sparkDist;
    const sparkY =
      y -
      size * 0.1 +
      Math.sin(sparkAngle) * sparkDist * 0.7 -
      sparkPhase * size * 0.1;
    const sparkAlpha = (1 - sparkPhase / 2) * 0.6 * goldPulse;
    const sparkR = size * (0.005 + Math.sin(time * 4 + p) * 0.003);

    ctx.fillStyle = `rgba(255, 223, 100, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 223, 100, ${sparkAlpha * 0.5})`;
    ctx.lineWidth = 0.6 * zoom;
    const crossLen = sparkR * 2.5;
    ctx.beginPath();
    ctx.moveTo(sparkX - crossLen, sparkY);
    ctx.lineTo(sparkX + crossLen, sparkY);
    ctx.moveTo(sparkX, sparkY - crossLen);
    ctx.lineTo(sparkX, sparkY + crossLen);
    ctx.stroke();
  }
}

function drawGreenLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const glX = x;
  const glY = y - size * 0.92;
  const basePulse =
    0.55 + Math.sin(time * 1.5) * 0.2 + Math.sin(time * 2.3) * 0.1;
  const intensity = isAttacking ? 0.9 + attackIntensity * 0.1 : basePulse;
  const glowR =
    size *
    (isAttacking
      ? 0.18 + attackIntensity * 0.06
      : 0.14 + Math.sin(time * 2) * 0.02);

  const outerG = ctx.createRadialGradient(glX, glY, 0, glX, glY, glowR * 4);
  outerG.addColorStop(0, `rgba(34, 197, 94, ${0.12 * intensity})`);
  outerG.addColorStop(0.4, `rgba(34, 197, 94, ${0.05 * intensity})`);
  outerG.addColorStop(1, "rgba(34, 197, 94, 0)");
  ctx.fillStyle = outerG;
  ctx.beginPath();
  ctx.arc(glX, glY, glowR * 4, 0, Math.PI * 2);
  ctx.fill();

  const midG = ctx.createRadialGradient(
    glX,
    glY,
    glowR * 0.3,
    glX,
    glY,
    glowR * 1.8
  );
  midG.addColorStop(0, `rgba(74, 222, 128, ${0.3 * intensity})`);
  midG.addColorStop(0.5, `rgba(34, 197, 94, ${0.15 * intensity})`);
  midG.addColorStop(1, "rgba(34, 197, 94, 0)");
  ctx.fillStyle = midG;
  ctx.beginPath();
  ctx.arc(glX, glY, glowR * 1.8, 0, Math.PI * 2);
  ctx.fill();

  const coreG = ctx.createRadialGradient(glX, glY, 0, glX, glY, glowR);
  coreG.addColorStop(0, `rgba(255, 255, 255, ${0.85 * intensity})`);
  coreG.addColorStop(0.15, `rgba(187, 247, 208, ${0.7 * intensity})`);
  coreG.addColorStop(0.4, `rgba(74, 222, 128, ${0.45 * intensity})`);
  coreG.addColorStop(0.7, `rgba(34, 197, 94, ${0.2 * intensity})`);
  coreG.addColorStop(1, "rgba(34, 197, 94, 0)");
  ctx.fillStyle = coreG;
  ctx.beginPath();
  ctx.arc(glX, glY, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(134, 239, 172, ${0.1 * intensity})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let r = 0; r < 6; r++) {
    const angle = time * 0.15 + (r * Math.PI) / 3;
    const rayLen = glowR * (1.8 + Math.sin(time * 1.5 + r) * 0.4);
    ctx.beginPath();
    ctx.moveTo(
      glX + Math.cos(angle) * glowR * 0.3,
      glY + Math.sin(angle) * glowR * 0.3
    );
    ctx.lineTo(glX + Math.cos(angle) * rayLen, glY + Math.sin(angle) * rayLen);
    ctx.stroke();
  }
}

function drawFloatingLetters(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  goldPulse: number,
  zoom: number,
  layer: "behind" | "front"
) {
  const letters = "GATSBY";
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + (p * Math.PI * 2) / 10) % (Math.PI * 2);
    const depth = Math.sin(pAngle);

    if (layer === "behind" && depth >= 0) {
      continue;
    }
    if (layer === "front" && depth < 0) {
      continue;
    }

    const depthScale = 0.85 + depth * 0.2;
    const depthAlpha = 0.7 + depth * 0.3;

    const pDist = size * 0.6 + Math.sin(time * 2 + p * 0.7) * size * 0.1;
    const pRise = ((time * 0.5 + p * 0.4) % 1) * size * 0.25;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - size * 0.1 + depth * pDist * 0.4 - pRise;
    const pAlpha =
      (0.6 - (pRise / (size * 0.25)) * 0.4) * goldPulse * depthAlpha;
    ctx.fillStyle = `rgba(218, 175, 55, ${pAlpha})`;
    ctx.font = `italic ${Math.round(8 * zoom * depthScale)}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(letters[p % letters.length], px, py);
  }
}

// ─── ATTACK RINGS ────────────────────────────────────────────────────────────

function drawAttackRings(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  attackPhase: number,
  attackIntensity: number,
  zoom: number
) {
  for (let ring = 0; ring < 4; ring++) {
    const phase = (attackPhase * 2 + ring * 0.12) % 1;
    const alpha = (1 - phase) * 0.5 * attackIntensity;
    ctx.strokeStyle = `rgba(218, 175, 55, ${alpha})`;
    ctx.lineWidth = (3.5 - ring * 0.6) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.12,
      size * (0.55 + phase * 0.5),
      size * (0.65 + phase * 0.5),
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

// ─── CAPE (Tenor-style: two flowing side panels + shoulder clasps) ──────────

function drawCape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const s = size;
  const wave1 = Math.sin(time * 2.2) * s * 0.04;
  const wave2 = Math.sin(time * 3.1 + 0.8) * s * 0.03;
  const wave3 = Math.sin(time * 1.7 + 1.5) * s * 0.025;
  const atkStr = isAttacking ? 1 + attackIntensity * 0.4 : 1;

  for (let side = -1; side <= 1; side += 2) {
    const flip = side;
    const shoulderX = x + flip * s * 0.4;
    const shoulderY = y - s * 0.24;
    const capeBottomOuterY = y + s * 0.68;
    const capeBottomInnerY = y + s * 0.78;
    const capeOuterX = x + flip * s * 0.74;
    const w1 = wave1 * flip * atkStr;
    const w2 = wave2 * flip * atkStr;
    const w3 = wave3 * flip * atkStr;

    // Shadow layer
    ctx.fillStyle = "rgba(4, 4, 12, 0.4)";
    ctx.beginPath();
    ctx.moveTo(shoulderX + flip * s * 0.02, shoulderY + s * 0.02);
    ctx.bezierCurveTo(
      capeOuterX + w1 * 1.2 + flip * s * 0.04,
      shoulderY + s * 0.2,
      capeOuterX + w2 * 1.3 + flip * s * 0.06,
      y + s * 0.35,
      capeOuterX + w3 + flip * s * 0.03,
      capeBottomOuterY + s * 0.03
    );
    ctx.lineTo(x + flip * s * 0.22, capeBottomInnerY + s * 0.05);
    ctx.bezierCurveTo(
      x + flip * s * 0.18,
      y + s * 0.3,
      shoulderX - flip * s * 0.05,
      shoulderY + s * 0.15,
      shoulderX + flip * s * 0.02,
      shoulderY + s * 0.02
    );
    ctx.closePath();
    ctx.fill();

    // Main cape body — deep navy-black
    const capeGrad = ctx.createLinearGradient(
      shoulderX,
      shoulderY,
      capeOuterX,
      capeBottomOuterY
    );
    capeGrad.addColorStop(0, "#1a2240");
    capeGrad.addColorStop(0.2, "#1e2e48");
    capeGrad.addColorStop(0.5, "#1c2644");
    capeGrad.addColorStop(0.8, "#1a2840");
    capeGrad.addColorStop(1, "#141e38");
    ctx.fillStyle = capeGrad;

    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.bezierCurveTo(
      capeOuterX + w1,
      shoulderY + s * 0.15,
      capeOuterX + w2 * 1.2,
      y + s * 0.3,
      capeOuterX + w3,
      capeBottomOuterY
    );
    ctx.lineTo(x + flip * s * 0.2, capeBottomInnerY + s * 0.02);
    ctx.bezierCurveTo(
      x + flip * s * 0.15,
      y + s * 0.25,
      shoulderX - flip * s * 0.08,
      shoulderY + s * 0.12,
      shoulderX,
      shoulderY
    );
    ctx.closePath();
    ctx.fill();

    // Inner lining — emerald green satin, visible as inner fold
    const liningGrad = ctx.createLinearGradient(
      shoulderX,
      shoulderY,
      x + flip * s * 0.25,
      capeBottomInnerY
    );
    liningGrad.addColorStop(0, "#165428");
    liningGrad.addColorStop(0.3, "#22803a");
    liningGrad.addColorStop(0.6, "#1e6e34");
    liningGrad.addColorStop(1, "#124a22");
    ctx.fillStyle = liningGrad;

    ctx.beginPath();
    ctx.moveTo(shoulderX - flip * s * 0.03, shoulderY + s * 0.04);
    ctx.bezierCurveTo(
      x + flip * s * 0.35 + w1 * 0.5,
      y + s * 0.05,
      x + flip * s * 0.28 + w2 * 0.4,
      y + s * 0.35,
      x + flip * s * 0.22,
      capeBottomInnerY - s * 0.05
    );
    ctx.lineTo(x + flip * s * 0.2, capeBottomInnerY + s * 0.02);
    ctx.bezierCurveTo(
      x + flip * s * 0.15,
      y + s * 0.25,
      shoulderX - flip * s * 0.08,
      shoulderY + s * 0.12,
      shoulderX - flip * s * 0.03,
      shoulderY + s * 0.04
    );
    ctx.closePath();
    ctx.fill();

    // Fold lines
    ctx.strokeStyle = "rgba(20, 60, 35, 0.35)";
    ctx.lineWidth = 1.2 * zoom;
    for (let fold = 0; fold < 4; fold++) {
      const t = 0.2 + fold * 0.2;
      const foldStartX =
        shoulderX + flip * s * (0.02 + fold * 0.06) + wave1 * t;
      const foldStartY = shoulderY + s * 0.05 + fold * s * 0.03;
      const foldEndX = x + flip * s * (0.25 + fold * 0.08) + wave3 * (1 - t);
      const foldEndY = capeBottomInnerY - s * 0.1 + fold * s * 0.02;
      const foldMidX =
        (foldStartX + foldEndX) * 0.5 + wave2 * (0.5 + fold * 0.2);
      const foldMidY = (foldStartY + foldEndY) * 0.5;

      ctx.beginPath();
      ctx.moveTo(foldStartX, foldStartY);
      ctx.quadraticCurveTo(foldMidX, foldMidY, foldEndX, foldEndY);
      ctx.stroke();
    }

    // Outer edge highlight with glow
    ctx.strokeStyle = "#1a3050";
    ctx.shadowColor = "#3070a0";
    ctx.shadowBlur = 3 * zoom;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.bezierCurveTo(
      capeOuterX + w1,
      shoulderY + s * 0.15,
      capeOuterX + w2 * 1.2,
      y + s * 0.3,
      capeOuterX + w3,
      capeBottomOuterY
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Gold trim along the bottom hem
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(capeOuterX + w3, capeBottomOuterY);
    ctx.quadraticCurveTo(
      x + flip * s * 0.45,
      (capeBottomOuterY + capeBottomInnerY) * 0.5 + s * 0.04 + wave2 * 0.3,
      x + flip * s * 0.2,
      capeBottomInnerY + s * 0.02
    );
    ctx.stroke();

    // Gold ornamental dots along hem
    ctx.fillStyle = "#f0e0a0";
    for (let dot = 0; dot < 5; dot++) {
      const dt = dot / 4;
      const dotX =
        capeOuterX + w3 + (x + flip * s * 0.2 - capeOuterX - w3) * dt;
      const dotY =
        capeBottomOuterY +
        (capeBottomInnerY - capeBottomOuterY) * dt +
        s * 0.01 +
        Math.sin(dt * Math.PI) * s * 0.03;
      ctx.beginPath();
      ctx.arc(dotX, dotY, s * 0.009, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shoulder clasp
    drawCapeShoulderClasp(ctx, shoulderX, shoulderY, s, flip, zoom);

    // Attack glow overlay
    if (isAttacking) {
      const ga = 0.1 * attackIntensity;
      ctx.fillStyle = `rgba(218, 175, 55, ${ga * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.bezierCurveTo(
        capeOuterX + w1,
        shoulderY + s * 0.15,
        capeOuterX + w2 * 1.2,
        y + s * 0.3,
        capeOuterX + w3,
        capeBottomOuterY
      );
      ctx.lineTo(x + flip * s * 0.2, capeBottomInnerY + s * 0.02);
      ctx.bezierCurveTo(
        x + flip * s * 0.15,
        y + s * 0.25,
        shoulderX - flip * s * 0.08,
        shoulderY + s * 0.12,
        shoulderX,
        shoulderY
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  // Gold clasp chain connecting the two panels across the chest
  const claspY = y - s * 0.24;
  const leftX = x - s * 0.4;
  const rightX = x + s * 0.4;
  const sway = Math.sin(time * 2) * s * 0.008;

  ctx.strokeStyle = "rgba(60, 45, 10, 0.3)";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(leftX, claspY + s * 0.01);
  ctx.quadraticCurveTo(
    x,
    claspY + s * 0.1 + sway + s * 0.01,
    rightX,
    claspY + s * 0.01
  );
  ctx.stroke();

  const chainGrad = ctx.createLinearGradient(leftX, claspY, rightX, claspY);
  chainGrad.addColorStop(0, "#8a6b20");
  chainGrad.addColorStop(0.25, "#daa520");
  chainGrad.addColorStop(0.5, "#f0e0a0");
  chainGrad.addColorStop(0.75, "#daa520");
  chainGrad.addColorStop(1, "#8a6b20");
  ctx.strokeStyle = chainGrad;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(leftX, claspY);
  ctx.quadraticCurveTo(x, claspY + s * 0.1 + sway, rightX, claspY);
  ctx.stroke();

  ctx.fillStyle = "#daa520";
  const linkCount = 10;
  for (let link = 0; link <= linkCount; link++) {
    const t = link / linkCount;
    const lx = leftX + (rightX - leftX) * t;
    const ly = claspY + (s * 0.1 + sway) * Math.sin(t * Math.PI);
    ctx.beginPath();
    ctx.arc(lx, ly, s * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCapeShoulderClasp(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  s: number,
  _side: number,
  zoom: number
) {
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.035, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#705510";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#f0e0a0";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.022, 0, Math.PI * 2);
  ctx.stroke();

  // Center emerald gem
  ctx.fillStyle = "#22c55e";
  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.01, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Radiating points
  ctx.fillStyle = "#f0e0a0";
  for (let p = 0; p < 4; p++) {
    const angle = p * Math.PI * 0.5 + Math.PI * 0.25;
    ctx.beginPath();
    ctx.moveTo(
      sx + Math.cos(angle) * s * 0.022,
      sy + Math.sin(angle) * s * 0.022
    );
    ctx.lineTo(
      sx + Math.cos(angle - 0.3) * s * 0.035,
      sy + Math.sin(angle - 0.3) * s * 0.035
    );
    ctx.lineTo(
      sx + Math.cos(angle) * s * 0.042,
      sy + Math.sin(angle) * s * 0.042
    );
    ctx.lineTo(
      sx + Math.cos(angle + 0.3) * s * 0.035,
      sy + Math.sin(angle + 0.3) * s * 0.035
    );
    ctx.closePath();
    ctx.fill();
  }
}

// drawCapeWraps is now integrated into drawCape above
function drawCapeWraps(
  _ctx: CanvasRenderingContext2D,
  _x: number,
  _y: number,
  _size: number,
  _time: number,
  _zoom: number,
  _isAttacking: boolean,
  _attackIntensity: number
) {
  // no-op: wrap panels are now part of the Tenor-style drawCape
}

// ─── OFFICER'S TUNIC + CUIRASS ──────────────────────────────────────────────

function drawSuit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  breathe: number,
  zoom: number
) {
  const shoulderW = size * 0.48;
  const waistW = size * 0.38;
  const hemW = size * 0.42;
  const neckY = y - size * 0.32;
  const chestY = y - size * 0.06;
  const waistY = y + size * 0.14;
  const hemY = y + size * 0.54 + breathe;

  // Officer's tunic base — stiff, squared shoulders
  const tunicG = ctx.createLinearGradient(
    x - shoulderW,
    neckY,
    x + shoulderW,
    hemY
  );
  tunicG.addColorStop(0, "#1e2e48");
  tunicG.addColorStop(0.25, "#142238");
  tunicG.addColorStop(0.5, "#182840");
  tunicG.addColorStop(0.75, "#142238");
  tunicG.addColorStop(1, "#1e2e48");
  ctx.fillStyle = tunicG;
  ctx.beginPath();
  ctx.moveTo(x - shoulderW, neckY + size * 0.08);
  ctx.lineTo(x - size * 0.12, neckY - size * 0.02);
  ctx.lineTo(x + size * 0.12, neckY - size * 0.02);
  ctx.lineTo(x + shoulderW, neckY + size * 0.08);
  ctx.bezierCurveTo(
    x + shoulderW,
    chestY,
    x + waistW * 1.02,
    waistY - size * 0.04,
    x + waistW,
    waistY
  );
  ctx.bezierCurveTo(
    x + waistW * 1.02,
    waistY + size * 0.06,
    x + hemW,
    hemY - size * 0.08,
    x + hemW,
    hemY
  );
  ctx.lineTo(x - hemW, hemY);
  ctx.bezierCurveTo(
    x - hemW,
    hemY - size * 0.08,
    x - waistW * 1.02,
    waistY + size * 0.06,
    x - waistW,
    waistY
  );
  ctx.bezierCurveTo(
    x - waistW * 1.02,
    waistY - size * 0.04,
    x - shoulderW,
    chestY,
    x - shoulderW,
    neckY + size * 0.08
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Hussar-style horizontal braiding across chest
  for (let row = 0; row < 5; row++) {
    const ry = neckY + size * 0.12 + row * size * 0.055;
    const hw = size * (0.3 - row * 0.015);
    ctx.strokeStyle = `rgba(218, 175, 55, ${0.32 - row * 0.04})`;
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - hw, ry);
    ctx.quadraticCurveTo(x, ry + size * 0.006, x + hw, ry);
    ctx.stroke();
  }

  // Center front seam
  ctx.strokeStyle = "rgba(8, 14, 26, 0.5)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, neckY);
  ctx.lineTo(x, hemY);
  ctx.stroke();

  // ── CUIRASS (metallic breastplate) ──
  const crTop = neckY + size * 0.06;
  const crBot = waistY - size * 0.02;
  const crHW = size * 0.28;

  const crG = ctx.createLinearGradient(x - crHW, crTop, x + crHW, crBot);
  crG.addColorStop(0, "#3a4a68");
  crG.addColorStop(0.15, "#3a5070");
  crG.addColorStop(0.35, "#4a6888");
  crG.addColorStop(0.5, "#5078a0");
  crG.addColorStop(0.65, "#4a6888");
  crG.addColorStop(0.85, "#3a5070");
  crG.addColorStop(1, "#3a4a68");

  ctx.fillStyle = crG;
  ctx.beginPath();
  ctx.moveTo(x - crHW, crTop);
  ctx.bezierCurveTo(
    x - crHW * 1.05,
    (crTop + crBot) / 2,
    x - crHW * 0.95,
    crBot - size * 0.04,
    x - crHW * 0.8,
    crBot
  );
  ctx.bezierCurveTo(
    x - crHW * 0.3,
    crBot + size * 0.02,
    x + crHW * 0.3,
    crBot + size * 0.02,
    x + crHW * 0.8,
    crBot
  );
  ctx.bezierCurveTo(
    x + crHW * 0.95,
    crBot - size * 0.04,
    x + crHW * 1.05,
    (crTop + crBot) / 2,
    x + crHW,
    crTop
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Center keel ridge
  ctx.strokeStyle = "rgba(100, 155, 210, 0.3)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, crTop + size * 0.01);
  ctx.lineTo(x, crBot - size * 0.01);
  ctx.stroke();

  // Art Deco etching — diamond on each side
  const midCR = (crTop + crBot) / 2;
  ctx.strokeStyle = "rgba(218, 175, 55, 0.25)";
  ctx.lineWidth = 0.7 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const dx = x + side * crHW * 0.5;
    const dh = size * 0.06;
    const dw = size * 0.04;
    ctx.beginPath();
    ctx.moveTo(dx, midCR - dh);
    ctx.lineTo(dx + dw, midCR);
    ctx.lineTo(dx, midCR + dh);
    ctx.lineTo(dx - dw, midCR);
    ctx.closePath();
    ctx.stroke();
  }

  // Specular highlight
  ctx.fillStyle = "rgba(180, 210, 240, 0.07)";
  ctx.beginPath();
  ctx.ellipse(
    x - crHW * 0.2,
    midCR - size * 0.03,
    crHW * 0.45,
    size * 0.055,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Small gold rivets along cuirass top edge
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    const rx = x - crHW + t * crHW * 2;
    const ry = crTop + size * 0.005;
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(rx, ry, size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── OFFICER'S BELT ──
  const beltY = waistY + size * 0.22;
  ctx.fillStyle = "#1e2e48";
  ctx.beginPath();
  ctx.moveTo(x - waistW, beltY - size * 0.028);
  ctx.lineTo(x + waistW, beltY - size * 0.028);
  ctx.lineTo(x + waistW, beltY + size * 0.028);
  ctx.lineTo(x - waistW, beltY + size * 0.028);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Belt buckle — gold
  const buckG = ctx.createRadialGradient(x, beltY, 0, x, beltY, size * 0.025);
  buckG.addColorStop(0, "#f0e0a0");
  buckG.addColorStop(0.5, "#daa520");
  buckG.addColorStop(1, "#8a6b20");
  ctx.fillStyle = buckG;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.03,
    beltY - size * 0.02,
    size * 0.06,
    size * 0.04,
    size * 0.005
  );
  ctx.fill();
  ctx.strokeStyle = "#705510";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Hem detail
  ctx.strokeStyle = "rgba(8, 14, 26, 0.4)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - hemW, hemY);
  ctx.quadraticCurveTo(x, hemY + size * 0.015 + breathe, x + hemW, hemY);
  ctx.stroke();
}

// ─── ART DECO ARMORED COAT TAILS ────────────────────────────────────────────

function drawScottSkirtArmor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  goldPulse: number
) {
  const skirtTop = y + size * 0.44;
  const totalHeight = size * 0.32;
  const gapHalf = size * 0.06;

  drawScottCenterBanner(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    skirtTop,
    totalHeight,
    gapHalf,
    goldPulse
  );

  for (let side = -1; side <= 1; side += 2) {
    drawScottTassetSide(
      ctx,
      x,
      y,
      size,
      time,
      zoom,
      side,
      skirtTop,
      3,
      totalHeight / 3,
      totalHeight,
      gapHalf,
      goldPulse,
      isAttacking,
      attackIntensity
    );
  }

  drawScottSkirtChain(ctx, x, size, zoom, skirtTop, gapHalf, goldPulse, time);
  drawScottSkirtBelt(ctx, x, size, zoom, skirtTop, goldPulse);
}

function drawScottTassetSide(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
  size: number,
  time: number,
  zoom: number,
  side: number,
  skirtTop: number,
  _bandCount: number,
  _bandHeight: number,
  totalHeight: number,
  gapHalf: number,
  goldPulse: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const plateCount = 4;
  const plateOverlap = 0.22;
  const baseAngle = size * 0.06;
  const angleGrowth = size * 0.035;

  for (let p = 0; p < plateCount; p++) {
    const vertStep = (totalHeight / plateCount) * (1 - plateOverlap);
    const innerTopY = skirtTop + p * vertStep;
    const innerBotY = innerTopY + totalHeight / plateCount;

    const drop = baseAngle + p * angleGrowth;
    const outerTopY = innerTopY - drop;
    const outerBotY = innerBotY - drop;

    const innerW = gapHalf + p * size * 0.008;
    const outerW = size * (0.34 + p * 0.05);

    const sway =
      Math.sin(time * 1.5 + p * 0.7 + side * 0.4) * size * 0.003 * (p + 1);
    const ix = x + side * innerW + sway;
    const ox = x + side * outerW + sway;

    ctx.save();

    // Drop shadow beneath each plate
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.moveTo(ix, innerTopY + size * 0.008);
    ctx.lineTo(ox, outerTopY + size * 0.008);
    ctx.lineTo(ox + side * size * 0.006, outerBotY + size * 0.008);
    ctx.lineTo(ix - side * size * 0.003, innerBotY + size * 0.008);
    ctx.closePath();
    ctx.fill();

    // Plate gradient — angled to follow the plate surface
    const pg = ctx.createLinearGradient(
      ix,
      (innerTopY + innerBotY) / 2,
      ox,
      (outerTopY + outerBotY) / 2
    );
    if (side === -1) {
      pg.addColorStop(0, "#3a4a68");
      pg.addColorStop(0.25, "#3a5070");
      pg.addColorStop(0.55, "#4a6888");
      pg.addColorStop(0.8, "#3a5070");
      pg.addColorStop(1, "#3a4a68");
    } else {
      pg.addColorStop(0, "#3a4a68");
      pg.addColorStop(0.2, "#3a5070");
      pg.addColorStop(0.45, "#4a6888");
      pg.addColorStop(0.75, "#3a5070");
      pg.addColorStop(1, "#3a4a68");
    }

    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.moveTo(ix, innerTopY);
    ctx.lineTo(ox, outerTopY);
    ctx.lineTo(ox + side * size * 0.006, outerBotY);
    ctx.lineTo(ix - side * size * 0.003, innerBotY);
    ctx.closePath();
    ctx.fill();

    // Plate border
    ctx.strokeStyle = "#2a3a58";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Gold bottom edge trim
    ctx.strokeStyle = `rgba(218, 175, 55, ${0.45 + goldPulse * 0.15})`;
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(ix - side * size * 0.003, innerBotY);
    ctx.lineTo(ox + side * size * 0.006, outerBotY);
    ctx.stroke();

    // Gold top edge accent (thinner)
    ctx.strokeStyle = `rgba(218, 175, 55, ${0.2 + goldPulse * 0.1})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(ix, innerTopY);
    ctx.lineTo(ox, outerTopY);
    ctx.stroke();

    // Specular highlight strip across upper portion
    ctx.fillStyle = "rgba(180, 210, 240, 0.06)";
    const hlCx = (ix + ox) / 2;
    const hlCy =
      ((innerTopY + outerTopY) / 2 + (innerBotY + outerBotY) / 2) * 0.5 -
      size * 0.01;
    const hlAngle = Math.atan2(outerTopY - innerTopY, ox - ix);
    ctx.beginPath();
    ctx.ellipse(
      hlCx,
      hlCy,
      Math.abs(ox - ix) * 0.3,
      (innerBotY - innerTopY) * 0.15,
      hlAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Rivet — positioned along the diagonal
    const rvtT = 0.7;
    const rvtX = ix + rvtT * (ox - ix);
    const rvtTopMid = innerTopY + rvtT * (outerTopY - innerTopY);
    const rvtBotMid = innerBotY + rvtT * (outerBotY - innerBotY);
    const rvtY = (rvtTopMid + rvtBotMid) / 2;
    const rg = ctx.createRadialGradient(
      rvtX - size * 0.002,
      rvtY - size * 0.002,
      0,
      rvtX,
      rvtY,
      size * 0.008
    );
    rg.addColorStop(0, "#f0e0a0");
    rg.addColorStop(0.5, "#daa520");
    rg.addColorStop(1, "#8a6b20");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rvtX, rvtY, size * 0.007, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  if (isAttacking) {
    const glowAlpha = 0.14 * attackIntensity;
    const gx = x + side * size * 0.28;
    const gy = skirtTop + totalHeight * 0.5 + baseAngle * 0.5;
    const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, size * 0.2);
    gg.addColorStop(0, `rgba(218, 175, 55, ${glowAlpha})`);
    gg.addColorStop(0.5, `rgba(184, 144, 30, ${glowAlpha * 0.6})`);
    gg.addColorStop(1, "rgba(218, 175, 55, 0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.ellipse(gx, gy, size * 0.15, size * 0.2, side * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawScottCenterBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
  size: number,
  time: number,
  zoom: number,
  skirtTop: number,
  totalHeight: number,
  gapHalf: number,
  goldPulse: number
) {
  const bannerTop = skirtTop + size * 0.04;
  const bannerBottom = skirtTop + totalHeight * 0.92;
  const bannerHalfW = gapHalf * 0.75;
  const wave = Math.sin(time * 2.5) * size * 0.008;
  const wave2 = Math.sin(time * 3.2 + 0.5) * size * 0.005;

  const bannerGrad = ctx.createLinearGradient(x, bannerTop, x, bannerBottom);
  bannerGrad.addColorStop(0, "#2a3a58");
  bannerGrad.addColorStop(0.15, "#3a4a68");
  bannerGrad.addColorStop(0.4, "#3a5070");
  bannerGrad.addColorStop(0.7, "#3a4a68");
  bannerGrad.addColorStop(1, "#2a3a58");
  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  ctx.moveTo(x - bannerHalfW, bannerTop);
  ctx.lineTo(x + bannerHalfW, bannerTop);
  ctx.bezierCurveTo(
    x + bannerHalfW + wave,
    bannerTop + (bannerBottom - bannerTop) * 0.35,
    x + bannerHalfW * 0.9 + wave2,
    bannerTop + (bannerBottom - bannerTop) * 0.65,
    x + bannerHalfW * 0.85,
    bannerBottom
  );
  ctx.lineTo(x + size * 0.015, bannerBottom - size * 0.04);
  ctx.lineTo(x - size * 0.015, bannerBottom - size * 0.04);
  ctx.lineTo(x - bannerHalfW * 0.85, bannerBottom);
  ctx.bezierCurveTo(
    x - bannerHalfW * 0.9 - wave2,
    bannerTop + (bannerBottom - bannerTop) * 0.65,
    x - bannerHalfW - wave,
    bannerTop + (bannerBottom - bannerTop) * 0.35,
    x - bannerHalfW,
    bannerTop
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  const emblemY = (bannerTop + bannerBottom) * 0.5 - size * 0.03;
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1.2 * zoom;
  ctx.shadowColor = "#daa520";
  ctx.shadowBlur = 4 * zoom * goldPulse;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, emblemY + size * 0.02);
  ctx.lineTo(x + size * 0.025, emblemY - size * 0.03);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.028,
    emblemY - size * 0.035,
    size * 0.006,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawScottSkirtChain(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  zoom: number,
  skirtTop: number,
  gapHalf: number,
  goldPulse: number,
  time: number
) {
  const chainY = skirtTop + size * 0.025;
  const leftAnchor = x - gapHalf + size * 0.01;
  const rightAnchor = x + gapHalf - size * 0.01;
  const sag = size * 0.035 + Math.sin(time * 2) * size * 0.004;
  const linkCount = 7;

  for (let i = 0; i <= linkCount; i++) {
    const t = i / linkCount;
    const lx = leftAnchor + t * (rightAnchor - leftAnchor);
    const sagT = 4 * t * (1 - t);
    const ly = chainY + sag * sagT;

    const linkGrad = ctx.createRadialGradient(
      lx - size * 0.002,
      ly - size * 0.002,
      0,
      lx,
      ly,
      size * 0.012
    );
    linkGrad.addColorStop(0, "#f0e0a0");
    linkGrad.addColorStop(0.5, "#daa520");
    linkGrad.addColorStop(1, "#8a6b20");
    ctx.fillStyle = linkGrad;
    ctx.beginPath();
    const linkW = size * 0.011;
    const linkH = size * 0.007;
    const angle = i % 2 === 0 ? 0.3 : -0.3;
    ctx.ellipse(lx, ly, linkW, linkH, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#705510";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(218, 175, 55, ${0.5 + goldPulse * 0.2})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.shadowColor = "#daa520";
  ctx.shadowBlur = 3 * zoom * goldPulse;
  ctx.beginPath();
  ctx.moveTo(leftAnchor, chainY);
  ctx.quadraticCurveTo(x, chainY + sag, rightAnchor, chainY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (let side = -1; side <= 1; side += 2) {
    const anchorX = side === -1 ? leftAnchor : rightAnchor;
    ctx.fillStyle = "#daa520";
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 3 * zoom * goldPulse;
    ctx.beginPath();
    ctx.arc(anchorX, chainY, size * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#705510";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawScottSkirtBelt(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  zoom: number,
  skirtTop: number,
  goldPulse: number
) {
  const beltHalfW = size * 0.43;
  const beltThick = size * 0.048;
  const vDip = size * 0.08;

  const beltGrad = ctx.createLinearGradient(
    x - beltHalfW,
    skirtTop,
    x + beltHalfW,
    skirtTop
  );
  beltGrad.addColorStop(0, "#2a3a58");
  beltGrad.addColorStop(0.2, "#3a4a68");
  beltGrad.addColorStop(0.4, "#3a5070");
  beltGrad.addColorStop(0.5, "#3a5070");
  beltGrad.addColorStop(0.6, "#3a4a68");
  beltGrad.addColorStop(0.8, "#3a4a68");
  beltGrad.addColorStop(1, "#2a3a58");

  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.strokeStyle = "rgba(218, 175, 55, 0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    x - beltHalfW + size * 0.01,
    skirtTop - beltThick * 0.5 + size * 0.004
  );
  ctx.lineTo(
    x + beltHalfW - size * 0.01,
    skirtTop - beltThick * 0.5 + size * 0.004
  );
  ctx.stroke();

  ctx.fillStyle = "#daa520";
  ctx.shadowColor = "#daa520";
  ctx.shadowBlur = 6 * zoom * goldPulse;
  ctx.beginPath();
  ctx.arc(x, skirtTop + vDip * 0.35, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0e0a0";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.008,
    skirtTop + vDip * 0.35 - size * 0.008,
    size * 0.013,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── OFFICER'S HELMET (peaked cap with metallic visor + crest) ──────────────

function drawHelmet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const headY = y - size * 0.5;
  const capTop = headY - size * 0.36;
  const bandY = headY - size * 0.16;
  const capHW = size * 0.28;

  // Crown — dark navy fabric body
  const crownG = ctx.createLinearGradient(x - capHW, capTop, x + capHW, bandY);
  crownG.addColorStop(0, "#1e2e48");
  crownG.addColorStop(0.3, "#142238");
  crownG.addColorStop(0.5, "#182840");
  crownG.addColorStop(0.7, "#142238");
  crownG.addColorStop(1, "#1e2e48");
  ctx.fillStyle = crownG;
  ctx.beginPath();
  ctx.moveTo(x - capHW * 0.7, bandY);
  ctx.bezierCurveTo(
    x - capHW * 0.85,
    (capTop + bandY) / 2 + size * 0.02,
    x - capHW * 0.88,
    (capTop + bandY) / 2 - size * 0.02,
    x - capHW * 0.55,
    capTop + size * 0.02
  );
  ctx.bezierCurveTo(
    x - capHW * 0.2,
    capTop - size * 0.01,
    x + capHW * 0.2,
    capTop - size * 0.01,
    x + capHW * 0.55,
    capTop + size * 0.02
  );
  ctx.bezierCurveTo(
    x + capHW * 0.88,
    (capTop + bandY) / 2 - size * 0.02,
    x + capHW * 0.85,
    (capTop + bandY) / 2 + size * 0.02,
    x + capHW * 0.7,
    bandY
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Crown top disc (flat top of peaked cap)
  ctx.fillStyle = "#101e30";
  ctx.beginPath();
  ctx.ellipse(
    x,
    capTop + size * 0.02,
    capHW * 0.52,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Gold headband
  const bandH = size * 0.035;
  const bandG = ctx.createLinearGradient(
    x - capHW,
    bandY,
    x + capHW,
    bandY + bandH
  );
  bandG.addColorStop(0, "#8a6b20");
  bandG.addColorStop(0.3, "#daa520");
  bandG.addColorStop(0.5, "#f0e0a0");
  bandG.addColorStop(0.7, "#daa520");
  bandG.addColorStop(1, "#8a6b20");
  ctx.fillStyle = bandG;
  ctx.beginPath();
  ctx.moveTo(x - capHW * 0.72, bandY);
  ctx.lineTo(x + capHW * 0.72, bandY);
  ctx.lineTo(x + capHW * 0.7, bandY + bandH);
  ctx.lineTo(x - capHW * 0.7, bandY + bandH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#705510";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Visor / peak (metallic)
  const visorY = bandY + bandH * 0.5;
  const visorG = ctx.createLinearGradient(x, visorY, x, visorY + size * 0.05);
  visorG.addColorStop(0, "#3a5070");
  visorG.addColorStop(0.3, "#4a6888");
  visorG.addColorStop(0.6, "#5078a0");
  visorG.addColorStop(1, "#3a4a68");
  ctx.fillStyle = visorG;
  ctx.beginPath();
  ctx.moveTo(x - capHW * 0.74, visorY);
  ctx.bezierCurveTo(
    x - capHW * 0.5,
    visorY + size * 0.065,
    x + capHW * 0.5,
    visorY + size * 0.065,
    x + capHW * 0.74,
    visorY
  );
  ctx.lineTo(x + capHW * 0.7, visorY - size * 0.005);
  ctx.bezierCurveTo(
    x + capHW * 0.45,
    visorY + size * 0.045,
    x - capHW * 0.45,
    visorY + size * 0.045,
    x - capHW * 0.7,
    visorY - size * 0.005
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a3a58";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Visor gold edge
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - capHW * 0.74, visorY);
  ctx.bezierCurveTo(
    x - capHW * 0.5,
    visorY + size * 0.065,
    x + capHW * 0.5,
    visorY + size * 0.065,
    x + capHW * 0.74,
    visorY
  );
  ctx.stroke();

  // Visor specular highlight
  ctx.fillStyle = "rgba(180, 210, 240, 0.1)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.03,
    visorY + size * 0.02,
    size * 0.08,
    size * 0.015,
    -0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Center crest emblem — shield with star
  const embY = bandY + bandH * 0.5;
  ctx.fillStyle = "#daa520";
  ctx.shadowColor = "#daa520";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, embY - size * 0.022);
  ctx.lineTo(x + size * 0.022, embY + size * 0.002);
  ctx.lineTo(x + size * 0.016, embY + size * 0.025);
  ctx.lineTo(x, embY + size * 0.032);
  ctx.lineTo(x - size * 0.016, embY + size * 0.025);
  ctx.lineTo(x - size * 0.022, embY + size * 0.002);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#f0e0a0";
  ctx.beginPath();
  ctx.arc(x - size * 0.004, embY, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Gold chinstrap
  ctx.strokeStyle = "rgba(218, 175, 55, 0.45)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - capHW * 0.62, visorY + size * 0.01);
  ctx.quadraticCurveTo(
    x,
    visorY + size * 0.1,
    x + capHW * 0.62,
    visorY + size * 0.01
  );
  ctx.stroke();

  // Chinstrap button anchors
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(
      x + side * capHW * 0.62,
      visorY + size * 0.01,
      size * 0.005,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  if (isAttacking) {
    const ga = 0.12 * attackIntensity;
    const gg = ctx.createRadialGradient(
      x,
      (capTop + bandY) / 2,
      0,
      x,
      (capTop + bandY) / 2,
      capHW
    );
    gg.addColorStop(0, `rgba(218, 175, 55, ${ga})`);
    gg.addColorStop(1, "rgba(218, 175, 55, 0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.ellipse(
      x,
      (capTop + bandY) / 2,
      capHW * 0.8,
      (bandY - capTop) * 0.6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ─── GORGET (armored neck guard, drawn after head) ──────────────────────────

function drawStormCollar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number
) {
  const headY = y - size * 0.5;

  for (let side = -1; side <= 1; side += 2) {
    const gG = ctx.createLinearGradient(
      x + side * size * 0.14,
      headY + size * 0.18,
      x + side * size * 0.28,
      headY - size * 0.06
    );
    gG.addColorStop(0, "#3a4a68");
    gG.addColorStop(0.35, "#3a5070");
    gG.addColorStop(0.65, "#4a6888");
    gG.addColorStop(1, "#3a5070");
    ctx.fillStyle = gG;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.12, headY + size * 0.24);
    ctx.bezierCurveTo(
      x + side * size * 0.14,
      headY + size * 0.1,
      x + side * size * 0.18,
      headY,
      x + side * size * 0.2,
      headY - size * 0.08
    );
    ctx.lineTo(x + side * size * 0.24, headY - size * 0.12);
    ctx.bezierCurveTo(
      x + side * size * 0.28,
      headY - size * 0.02,
      x + side * size * 0.3,
      headY + size * 0.08,
      x + side * size * 0.28,
      headY + size * 0.22
    );
    ctx.lineTo(x + side * size * 0.24, headY + size * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2a3a58";
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    // Gold edge trim
    ctx.strokeStyle = "rgba(218, 175, 55, 0.4)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.2, headY - size * 0.08);
    ctx.lineTo(x + side * size * 0.24, headY - size * 0.12);
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = "rgba(180, 210, 240, 0.06)";
    ctx.beginPath();
    ctx.ellipse(
      x + side * size * 0.2,
      headY + size * 0.06,
      size * 0.03,
      size * 0.08,
      side * 0.15,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Rivet at hinge point
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.22,
      headY - size * 0.1,
      size * 0.006,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ─── PAULDRONS (layered armored shoulder plates) ────────────────────────────

function drawEpaulettes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _time: number,
  zoom: number
) {
  for (let side = -1; side <= 1; side += 2) {
    const epX = x + side * size * 0.42;
    const epY = y - size * 0.22;

    ctx.save();
    ctx.translate(epX, epY);
    ctx.rotate(side * 0.1);

    // 3 overlapping plate layers (top is outermost)
    for (let layer = 2; layer >= 0; layer--) {
      const lw = size * (0.16 - layer * 0.03);
      const lh = size * (0.055 - layer * 0.008);
      const ly = layer * size * 0.018;

      const pg = ctx.createLinearGradient(-lw, ly - lh, lw, ly + lh);
      pg.addColorStop(0, "#3a4a68");
      pg.addColorStop(0.25, "#3a5070");
      pg.addColorStop(0.5, "#4a6888");
      pg.addColorStop(0.75, "#3a5070");
      pg.addColorStop(1, "#3a4a68");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(0, ly, lw, lh, side * 0.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(218, 165, 32, ${0.5 - layer * 0.1})`;
      ctx.lineWidth = (1.4 - layer * 0.2) * zoom;
      ctx.stroke();

      ctx.strokeStyle = "#2a3a58";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }

    // Top plate specular highlight
    ctx.fillStyle = "rgba(180, 210, 240, 0.1)";
    ctx.beginPath();
    ctx.ellipse(
      -size * 0.02,
      -size * 0.01,
      size * 0.06,
      size * 0.02,
      -0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Center rivet
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.012);
    rg.addColorStop(0, "#f0e0a0");
    rg.addColorStop(0.5, "#daa520");
    rg.addColorStop(1, "#8a6b20");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.01, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ─── AIGUILLETTE & DECORATIONS (silvery blue) ──────────────────────────────

function drawAiguillette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number
) {
  const startX = x + size * 0.35;
  const startY = y - size * 0.18;
  const sway = Math.sin(time * 2) * size * 0.01;

  // Three braided loops draping across the chest
  for (let loop = 0; loop < 3; loop++) {
    const loopDepth = size * (0.12 + loop * 0.06);
    const loopWidth = size * (0.2 + loop * 0.05);
    const alpha = 0.7 - loop * 0.12;

    ctx.strokeStyle = `rgba(218, 175, 55, ${alpha})`;
    ctx.lineWidth = (2 - loop * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY + loop * size * 0.03);
    ctx.quadraticCurveTo(
      startX - loopWidth * 0.5 + sway,
      startY + loopDepth + loop * size * 0.02,
      startX - loopWidth + sway * 0.5,
      startY + loop * size * 0.04
    );
    ctx.stroke();

    ctx.strokeStyle = `rgba(240, 224, 160, ${alpha * 0.2})`;
    ctx.lineWidth = (3.5 - loop * 0.4) * zoom;
    ctx.stroke();
  }

  // Tip ferrule
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(
    startX - size * 0.35,
    startY + size * 0.04,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Pocket square (emerald green, peeking from left breast pocket)
  const pqX = x - size * 0.2;
  const pqY = y + size * 0.02;
  ctx.fillStyle = "#3da85c";
  ctx.beginPath();
  ctx.moveTo(pqX - size * 0.03, pqY);
  ctx.lineTo(pqX - size * 0.015, pqY - size * 0.06);
  ctx.lineTo(pqX + size * 0.005, pqY - size * 0.05);
  ctx.lineTo(pqX + size * 0.02, pqY - size * 0.065);
  ctx.lineTo(pqX + size * 0.035, pqY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2d6a4f";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Decorative piping along jacket hem
  ctx.strokeStyle = "rgba(218, 175, 55, 0.25)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.48);
  ctx.quadraticCurveTo(x, y + size * 0.52, x + size * 0.36, y + size * 0.48);
  ctx.stroke();

  // Pocket watch chain across vest
  ctx.strokeStyle = "#c9a84c";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y + size * 0.05);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.12,
    x + size * 0.14,
    y + size * 0.08
  );
  ctx.stroke();
  // Watch fob
  ctx.fillStyle = "#daa520";
  ctx.shadowColor = "#c9a84c";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.14, y + size * 0.08, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#f0e0a0";
  ctx.beginPath();
  ctx.arc(x + size * 0.136, y + size * 0.075, size * 0.005, 0, Math.PI * 2);
  ctx.fill();

  // SHOULDER RANK PINS (silvery blue small bars on left collar)
  for (let pin = 0; pin < 3; pin++) {
    const px = x - size * 0.14;
    const py = y - size * 0.2 + pin * size * 0.025;
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.roundRect(px, py, size * 0.04, size * 0.008, size * 0.002);
    ctx.fill();
    ctx.strokeStyle = "#8a6b20";
    ctx.lineWidth = 0.4 * zoom;
    ctx.stroke();
  }

  // THROAT LATCH button (small silvery blue button at collar)
  const bg = ctx.createRadialGradient(
    x,
    y - size * 0.31,
    0,
    x,
    y - size * 0.31,
    size * 0.012
  );
  bg.addColorStop(0, "#f0e0a0");
  bg.addColorStop(0.5, "#daa520");
  bg.addColorStop(1, "#8a6b20");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#705510";
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();

  // MEDAL RIBBON (small rectangular ribbon on left chest)
  const medX = x - size * 0.28;
  const medY = y - size * 0.08;
  const stripeW = size * 0.008;
  const ribbonColors = ["#165428", "#3da85c", "#f0e0a0", "#3da85c", "#165428"];
  for (let ri = 0; ri < ribbonColors.length; ri++) {
    ctx.fillStyle = ribbonColors[ri];
    ctx.fillRect(medX + ri * stripeW, medY, stripeW, size * 0.025);
  }
  ctx.strokeStyle = "#705510";
  ctx.lineWidth = 0.4 * zoom;
  ctx.strokeRect(medX, medY, stripeW * ribbonColors.length, size * 0.025);

  // BACK VENT DETAIL (subtle V at the bottom of coat)
  ctx.strokeStyle = "rgba(20, 20, 40, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y + size * 0.55);
  ctx.lineTo(x, y + size * 0.48);
  ctx.lineTo(x + size * 0.04, y + size * 0.55);
  ctx.stroke();
}

// ─── VEST ────────────────────────────────────────────────────────────────────

function drawVest(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number
) {
  const vestGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y - size * 0.18,
    x + size * 0.15,
    y + size * 0.3
  );
  vestGrad.addColorStop(0, "#1e2e48");
  vestGrad.addColorStop(0.3, "#142030");
  vestGrad.addColorStop(0.5, "#182838");
  vestGrad.addColorStop(0.7, "#142030");
  vestGrad.addColorStop(1, "#1e2e48");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.14, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Art Deco brocade pattern
  ctx.strokeStyle = "rgba(218, 165, 32, 0.2)";
  ctx.lineWidth = 0.8;
  for (let p = 0; p < 4; p++) {
    const py = y - size * 0.1 + p * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, py);
    ctx.quadraticCurveTo(x, py - size * 0.02, x + size * 0.1, py);
    ctx.stroke();
  }

  // Vest border
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.2);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.stroke();

  // Gold vest buttons
  for (let i = 0; i < 4; i++) {
    const by = y - size * 0.1 + i * size * 0.095;
    ctx.fillStyle = "#705510";
    ctx.beginPath();
    ctx.arc(x + size * 0.005, by + size * 0.005, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    const bg = ctx.createRadialGradient(
      x - size * 0.005,
      by - size * 0.005,
      0,
      x,
      by,
      size * 0.02
    );
    bg.addColorStop(0, "#f0e0a0");
    bg.addColorStop(0.5, "#daa520");
    bg.addColorStop(1, "#8a6b20");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(x, by, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 240, 180, 0.4)";
    ctx.beginPath();
    ctx.arc(x - size * 0.006, by - size * 0.006, size * 0.007, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── SHIRT & TIE ────────────────────────────────────────────────────────────

function drawShirtAndTie(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isAttacking: boolean,
  attackIntensity: number,
  zoom: number
) {
  // Shirt
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.2, y - size * 0.08);
  ctx.quadraticCurveTo(x, y - size * 0.14, x + size * 0.2, y - size * 0.08);
  ctx.lineTo(x + size * 0.14, y - size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Collar points
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y - size * 0.16);
  ctx.lineTo(x - size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y - size * 0.16);
  ctx.lineTo(x + size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Tie (silvery blue)
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = isAttacking ? 10 * zoom * attackIntensity : 4 * zoom;
  const tG = ctx.createLinearGradient(x, y - size * 0.18, x, y + size * 0.22);
  tG.addColorStop(0, "#5ebd73");
  tG.addColorStop(0.2, "#3da85c");
  tG.addColorStop(0.5, "#2d8a48");
  tG.addColorStop(0.8, "#1e6b35");
  tG.addColorStop(1, "#165428");
  ctx.fillStyle = tG;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.07, y + size * 0.14);
  ctx.lineTo(x, y + size * 0.22);
  ctx.lineTo(x + size * 0.07, y + size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Tie stripes
  ctx.strokeStyle = "rgba(10, 50, 25, 0.4)";
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 5; s++) {
    const sy = y - size * 0.1 + s * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04, sy);
    ctx.lineTo(x + size * 0.04, sy + size * 0.03);
    ctx.stroke();
  }

  // Tie knot
  ctx.fillStyle = "#6fcf87";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.16,
    size * 0.045,
    size * 0.028,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── ARMS (two-segment with articulated elbows) ─────────────────────────────

function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackPhase: number,
  penStrokeX: number,
  penStrokeY: number
) {
  const upperLen = size * 0.16;
  const forearmLen = size * 0.16;

  // === LEFT ARM (holds book — gentle elbow sway) ===
  const leftShoulder = isAttacking
    ? -0.7 - Math.sin(attackPhase * Math.PI) * 0.08
    : -0.7 - Math.sin(time * 1.2) * 0.04 - Math.sin(time * 0.8) * 0.02;
  const leftElbow = isAttacking
    ? -0.95 - Math.sin(attackPhase * Math.PI) * 0.25
    : -1 + Math.sin(time * 1.2) * 0.08 + Math.sin(time * 0.6) * 0.04;

  ctx.save();
  ctx.translate(x - size * 0.36, y - size * 0.08);
  ctx.rotate(leftShoulder);

  drawUpperSleeve(ctx, size, zoom, 1);

  ctx.translate(0, upperLen);
  drawElbowJoint(ctx, size, zoom);
  ctx.rotate(leftElbow);

  drawForearmSleeve(ctx, size, zoom, 1);

  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.01,
    forearmLen + size * 0.01,
    size * 0.04,
    size * 0.045,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    size * 0.01,
    forearmLen + size * 0.04,
    size * 0.022,
    0.2 * Math.PI,
    0.8 * Math.PI
  );
  ctx.stroke();

  ctx.restore();

  // === RIGHT ARM (writing arm — reaches toward book, elbow bends with cursive strokes) ===
  const writeBend = isAttacking ? 0 : penStrokeX / (size * 0.06);
  const rightShoulder = isAttacking
    ? 0.7 + Math.sin(attackPhase * Math.PI * 1.5) * 0.12
    : 0.62 + Math.sin(time * 2) * 0.05 + writeBend * 0.04;
  const rightElbow = isAttacking
    ? 0.95 + Math.sin(attackPhase * Math.PI * 1.5) * 0.35
    : 1.05 + Math.sin(time * 2.5) * 0.12 + writeBend * 0.12;

  ctx.save();
  ctx.translate(x + size * 0.36, y - size * 0.1);
  ctx.rotate(rightShoulder);

  drawUpperSleeve(ctx, size, zoom, -1);

  ctx.translate(0, upperLen);
  drawElbowJoint(ctx, size, zoom);
  ctx.rotate(rightElbow);

  drawForearmSleeve(ctx, size, zoom, -1);

  const hx = -size * 0.01 + (isAttacking ? 0 : penStrokeX * 0.15);
  const hy = forearmLen + size * 0.01 + (isAttacking ? 0 : penStrokeY * 0.15);
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(hx, hy, size * 0.04, size * 0.045, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hx - size * 0.015, hy - size * 0.015);
  ctx.quadraticCurveTo(
    hx - size * 0.035,
    hy,
    hx - size * 0.03,
    hy + size * 0.03
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hx - size * 0.005, hy + size * 0.025);
  ctx.lineTo(hx - size * 0.015, hy + size * 0.055);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    hx + size * 0.015,
    hy + size * 0.035,
    size * 0.025,
    0.2 * Math.PI,
    0.7 * Math.PI
  );
  ctx.stroke();

  ctx.restore();
}

function drawUpperSleeve(
  ctx: CanvasRenderingContext2D,
  size: number,
  zoom: number,
  dir: number
) {
  const len = size * 0.16;
  const sg = ctx.createLinearGradient(0, 0, dir * size * 0.06, len);
  sg.addColorStop(0, "#1e2e48");
  sg.addColorStop(0.5, "#142238");
  sg.addColorStop(1, "#1e2e48");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.04, 0);
  ctx.quadraticCurveTo(dir * size * 0.065, len * 0.4, dir * size * 0.04, len);
  ctx.lineTo(-dir * size * 0.055, len);
  ctx.quadraticCurveTo(-dir * size * 0.07, len * 0.4, -dir * size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawElbowJoint(
  ctx: CanvasRenderingContext2D,
  size: number,
  _zoom: number
) {
  ctx.fillStyle = "#122030";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.048, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = "rgba(40, 40, 70, 0.35)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.005);
  ctx.quadraticCurveTo(0, size * 0.008, size * 0.03, -size * 0.005);
  ctx.stroke();
}

function drawForearmSleeve(
  ctx: CanvasRenderingContext2D,
  size: number,
  zoom: number,
  dir: number
) {
  const len = size * 0.16;
  const sg = ctx.createLinearGradient(0, 0, dir * size * 0.04, len);
  sg.addColorStop(0, "#1e2e48");
  sg.addColorStop(0.5, "#142238");
  sg.addColorStop(1, "#1e2e48");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.045, 0);
  ctx.quadraticCurveTo(dir * size * 0.05, len * 0.4, dir * size * 0.03, len);
  ctx.lineTo(-dir * size * 0.05, len - size * 0.01);
  ctx.quadraticCurveTo(-dir * size * 0.06, len * 0.4, -dir * size * 0.045, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = "#0a1220";
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.05, len - size * 0.035);
  ctx.lineTo(dir * size * 0.035, len - size * 0.035);
  ctx.lineTo(dir * size * 0.035, len - size * 0.015);
  ctx.lineTo(-dir * size * 0.05, len - size * 0.015);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a2840";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.strokeStyle = "rgba(40, 40, 70, 0.35)";
  ctx.lineWidth = 0.5;
  ctx.setLineDash([1.5, 1.5]);
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.048, len - size * 0.032);
  ctx.lineTo(dir * size * 0.033, len - size * 0.032);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.048, len - size * 0.018);
  ctx.lineTo(dir * size * 0.033, len - size * 0.018);
  ctx.stroke();
  ctx.setLineDash([]);

  const buckleG = ctx.createRadialGradient(
    -dir * size * 0.005,
    len - size * 0.025,
    0,
    -dir * size * 0.005,
    len - size * 0.025,
    size * 0.01
  );
  buckleG.addColorStop(0, "#f0e0a0");
  buckleG.addColorStop(0.5, "#daa520");
  buckleG.addColorStop(1, "#8a6b20");
  ctx.fillStyle = buckleG;
  ctx.beginPath();
  ctx.roundRect(
    -dir * size * 0.015,
    len - size * 0.03,
    size * 0.02,
    size * 0.018,
    size * 0.002
  );
  ctx.fill();
  ctx.strokeStyle = "#705510";
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.strokeStyle = "#f0e0a0";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.005, len - size * 0.028);
  ctx.lineTo(-dir * size * 0.005, len - size * 0.017);
  ctx.stroke();
}

// ─── HEAD ────────────────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const headY = y - size * 0.5;

  // Face — angular, handsome 1920s gentleman
  const fg = ctx.createRadialGradient(
    x - size * 0.03,
    headY - size * 0.04,
    0,
    x,
    headY,
    size * 0.28
  );
  fg.addColorStop(0, "#ffe8d0");
  fg.addColorStop(0.4, "#ffe0bd");
  fg.addColorStop(0.8, "#f5d0a8");
  fg.addColorStop(1, "#e8c098");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.27);
  ctx.bezierCurveTo(
    x + size * 0.2,
    headY - size * 0.27,
    x + size * 0.3,
    headY - size * 0.15,
    x + size * 0.28,
    headY - size * 0.02
  );
  ctx.bezierCurveTo(
    x + size * 0.27,
    headY + size * 0.08,
    x + size * 0.22,
    headY + size * 0.16,
    x + size * 0.16,
    headY + size * 0.22
  );
  ctx.bezierCurveTo(
    x + size * 0.1,
    headY + size * 0.26,
    x + size * 0.04,
    headY + size * 0.29,
    x,
    headY + size * 0.3
  );
  ctx.bezierCurveTo(
    x - size * 0.04,
    headY + size * 0.29,
    x - size * 0.1,
    headY + size * 0.26,
    x - size * 0.16,
    headY + size * 0.22
  );
  ctx.bezierCurveTo(
    x - size * 0.22,
    headY + size * 0.16,
    x - size * 0.27,
    headY + size * 0.08,
    x - size * 0.28,
    headY - size * 0.02
  );
  ctx.bezierCurveTo(
    x - size * 0.3,
    headY - size * 0.15,
    x - size * 0.2,
    headY - size * 0.27,
    x,
    headY - size * 0.27
  );
  ctx.closePath();
  ctx.fill();

  // Jawline definition — angular, strong
  ctx.strokeStyle = "rgba(180, 140, 100, 0.22)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, headY + size * 0.06);
  ctx.bezierCurveTo(
    x - size * 0.18,
    headY + size * 0.18,
    x - size * 0.08,
    headY + size * 0.27,
    x,
    headY + size * 0.3
  );
  ctx.bezierCurveTo(
    x + size * 0.08,
    headY + size * 0.27,
    x + size * 0.18,
    headY + size * 0.18,
    x + size * 0.24,
    headY + size * 0.06
  );
  ctx.stroke();

  // Cheekbone highlights
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = "rgba(255, 230, 200, 0.1)";
    ctx.beginPath();
    ctx.ellipse(
      x + side * size * 0.14,
      headY + size * 0.01,
      size * 0.07,
      size * 0.028,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "rgba(200, 160, 120, 0.2)";
    ctx.beginPath();
    ctx.ellipse(
      x + side * size * 0.16,
      headY + size * 0.06,
      size * 0.05,
      size * 0.022,
      side * 0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Temple shadows
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = "rgba(190, 150, 110, 0.12)";
    ctx.beginPath();
    ctx.ellipse(
      x + side * size * 0.22,
      headY - size * 0.08,
      size * 0.04,
      size * 0.06,
      side * 0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  drawHair(ctx, x, headY, size, zoom);
  drawEyes(ctx, x, headY, size, time, zoom, isAttacking, attackIntensity);
  drawNoseAndMouth(ctx, x, headY, size, zoom);
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  size: number,
  zoom: number
) {
  // Slicked-back 1920s pompadour with volume on top
  // Back/base layer
  const baseG = ctx.createLinearGradient(
    x - size * 0.2,
    headY - size * 0.3,
    x + size * 0.15,
    headY
  );
  baseG.addColorStop(0, "#1a0e08");
  baseG.addColorStop(0.4, "#2a1810");
  baseG.addColorStop(0.8, "#3a2515");
  baseG.addColorStop(1, "#2a1810");
  ctx.fillStyle = baseG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, headY + size * 0.04);
  ctx.bezierCurveTo(
    x - size * 0.3,
    headY - size * 0.08,
    x - size * 0.28,
    headY - size * 0.2,
    x - size * 0.18,
    headY - size * 0.28
  );
  ctx.bezierCurveTo(
    x - size * 0.08,
    headY - size * 0.34,
    x + size * 0.05,
    headY - size * 0.36,
    x + size * 0.15,
    headY - size * 0.3
  );
  ctx.bezierCurveTo(
    x + size * 0.24,
    headY - size * 0.24,
    x + size * 0.28,
    headY - size * 0.14,
    x + size * 0.26,
    headY + size * 0.02
  );
  ctx.bezierCurveTo(
    x + size * 0.24,
    headY + size * 0.08,
    x + size * 0.2,
    headY + size * 0.1,
    x + size * 0.16,
    headY + size * 0.06
  );
  ctx.closePath();
  ctx.fill();

  // Pompadour volume on top (swept right)
  const pompG = ctx.createLinearGradient(
    x - size * 0.1,
    headY - size * 0.35,
    x + size * 0.12,
    headY - size * 0.18
  );
  pompG.addColorStop(0, "#3a2515");
  pompG.addColorStop(0.4, "#4a3520");
  pompG.addColorStop(1, "#2a1810");
  ctx.fillStyle = pompG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.18,
    headY - size * 0.32,
    x - size * 0.06,
    headY - size * 0.38,
    x + size * 0.06,
    headY - size * 0.36
  );
  ctx.bezierCurveTo(
    x + size * 0.16,
    headY - size * 0.34,
    x + size * 0.22,
    headY - size * 0.28,
    x + size * 0.2,
    headY - size * 0.2
  );
  ctx.bezierCurveTo(
    x + size * 0.15,
    headY - size * 0.24,
    x + size * 0.02,
    headY - size * 0.26,
    x - size * 0.08,
    headY - size * 0.24
  );
  ctx.closePath();
  ctx.fill();

  // Side-swept wave strands (slicked texture)
  ctx.strokeStyle = "#1a0e08";
  ctx.lineWidth = 1.4 * zoom;
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const startX = x - size * (0.22 - t * 0.12);
    const startY = headY - size * (0.18 + t * 0.05);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + size * 0.12,
      startY - size * 0.06,
      startX + size * 0.24,
      startY - size * 0.02,
      startX + size * 0.32,
      startY + size * 0.04
    );
    ctx.stroke();
  }

  // Hair shine highlights (rich pomade golden sheen)
  ctx.strokeStyle = "rgba(180, 140, 60, 0.45)";
  ctx.lineWidth = 2.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.28);
  ctx.bezierCurveTo(
    x - size * 0.02,
    headY - size * 0.33,
    x + size * 0.08,
    headY - size * 0.32,
    x + size * 0.16,
    headY - size * 0.26
  );
  ctx.stroke();

  ctx.strokeStyle = "rgba(200, 170, 80, 0.3)";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, headY - size * 0.25);
  ctx.bezierCurveTo(
    x + size * 0.02,
    headY - size * 0.29,
    x + size * 0.1,
    headY - size * 0.28,
    x + size * 0.18,
    headY - size * 0.22
  );
  ctx.stroke();

  ctx.strokeStyle = "rgba(220, 190, 100, 0.18)";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, headY - size * 0.3);
  ctx.bezierCurveTo(
    x + size * 0.04,
    headY - size * 0.34,
    x + size * 0.12,
    headY - size * 0.31,
    x + size * 0.17,
    headY - size * 0.25
  );
  ctx.stroke();

  // Sideburn left
  ctx.fillStyle = "#2a1810";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, headY - size * 0.02);
  ctx.bezierCurveTo(
    x - size * 0.28,
    headY + size * 0.02,
    x - size * 0.27,
    headY + size * 0.1,
    x - size * 0.24,
    headY + size * 0.14
  );
  ctx.lineTo(x - size * 0.22, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Sideburn right
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, headY - size * 0.02);
  ctx.bezierCurveTo(
    x + size * 0.26,
    headY + size * 0.02,
    x + size * 0.25,
    headY + size * 0.1,
    x + size * 0.22,
    headY + size * 0.14
  );
  ctx.lineTo(x + size * 0.2, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  // Socket shadows
  ctx.fillStyle = "rgba(180, 140, 100, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    size * 0.08,
    size * 0.05,
    -0.1,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    size * 0.08,
    size * 0.05,
    0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Whites
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    size * 0.065,
    size * 0.055,
    -0.08,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    size * 0.065,
    size * 0.055,
    0.08,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Irises
  if (isAttacking) {
    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 10 * zoom * attackIntensity;
    ctx.fillStyle = `rgba(52, 211, 153, ${0.85 + attackIntensity * 0.15})`;
  } else {
    ctx.fillStyle = "#2d6a4f";
  }
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Iris detail ring
  ctx.strokeStyle = isAttacking ? "#16a34a" : "#1b4332";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  // Pupils
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Highlights
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.115, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.085, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // ── GLASSES ──
  const glassColor = isAttacking
    ? "rgba(52, 211, 153, 0.18)"
    : "rgba(180, 210, 200, 0.12)";
  const frameColor = isAttacking ? "#22c55e" : "#3a3a3a";
  const glassR = size * 0.08;

  // Lens fill (subtle tint)
  ctx.fillStyle = glassColor;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    -0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Lens glare
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    headY - size * 0.04,
    glassR * 0.4,
    glassR * 0.25,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    headY - size * 0.04,
    glassR * 0.4,
    glassR * 0.25,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Frames
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    -0.05,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    0.05,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Bridge
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, headY - size * 0.025);
  ctx.bezierCurveTo(
    x - size * 0.008,
    headY - size * 0.04,
    x + size * 0.008,
    headY - size * 0.04,
    x + size * 0.02,
    headY - size * 0.025
  );
  ctx.stroke();

  // Temple arms (sides going to ears)
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.02);
  ctx.lineTo(x - size * 0.24, headY + size * 0.01);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.02);
  ctx.lineTo(x + size * 0.24, headY + size * 0.01);
  ctx.stroke();

  // Eyebrows (above the glasses)
  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.1);
  ctx.bezierCurveTo(
    x - size * 0.14,
    headY - size * 0.13,
    x - size * 0.08,
    headY - size * 0.13,
    x - size * 0.04,
    headY - size * 0.1
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.1);
  ctx.bezierCurveTo(
    x + size * 0.14,
    headY - size * 0.13,
    x + size * 0.08,
    headY - size * 0.13,
    x + size * 0.04,
    headY - size * 0.1
  );
  ctx.stroke();
}

function drawNoseAndMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  size: number,
  zoom: number
) {
  // Nose bridge
  ctx.strokeStyle = "#c8a888";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.01);
  ctx.bezierCurveTo(
    x - size * 0.005,
    headY + size * 0.04,
    x - size * 0.018,
    headY + size * 0.07,
    x - size * 0.022,
    headY + size * 0.08
  );
  ctx.stroke();

  // Nose tip and nostril curve
  ctx.strokeStyle = "#c0a080";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.025, headY + size * 0.08);
  ctx.quadraticCurveTo(
    x,
    headY + size * 0.1,
    x + size * 0.025,
    headY + size * 0.08
  );
  ctx.stroke();

  // Nostril dots
  ctx.fillStyle = "rgba(160, 120, 80, 0.3)";
  ctx.beginPath();
  ctx.arc(x - size * 0.015, headY + size * 0.085, size * 0.006, 0, Math.PI * 2);
  ctx.arc(x + size * 0.015, headY + size * 0.085, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Philtrum (subtle line between nose and lip)
  ctx.strokeStyle = "rgba(180, 140, 100, 0.15)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, headY + size * 0.095);
  ctx.lineTo(x, headY + size * 0.12);
  ctx.stroke();

  // Upper lip
  ctx.strokeStyle = "#b08878";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.055, headY + size * 0.14);
  ctx.bezierCurveTo(
    x - size * 0.02,
    headY + size * 0.125,
    x,
    headY + size * 0.13,
    x,
    headY + size * 0.13
  );
  ctx.bezierCurveTo(
    x,
    headY + size * 0.13,
    x + size * 0.02,
    headY + size * 0.125,
    x + size * 0.055,
    headY + size * 0.14
  );
  ctx.stroke();

  // Lower lip / smile
  ctx.strokeStyle = "#a08070";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, headY + size * 0.14);
  ctx.bezierCurveTo(
    x - size * 0.03,
    headY + size * 0.17,
    x + size * 0.03,
    headY + size * 0.17,
    x + size * 0.06,
    headY + size * 0.14
  );
  ctx.stroke();

  // Chin dimple (subtle)
  ctx.strokeStyle = "rgba(180, 140, 110, 0.15)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, headY + size * 0.21, size * 0.012, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
}

// ─── BOOK ────────────────────────────────────────────────────────────────────

function drawBook(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  writeCycle: number
) {
  // Book held at center of body, open and facing up
  const bookX = x - size * 0.02;
  const bookY = y + size * 0.28;
  const bookTilt = Math.sin(time * 1.2) * 0.015;

  ctx.save();
  ctx.translate(bookX, bookY);
  ctx.rotate(bookTilt);

  const bW = size * 0.28;
  const bH = size * 0.2;

  // Book shadow beneath
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(0, bH * 0.05, bW * 0.55, bH * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back cover (slightly visible)
  const backG = ctx.createLinearGradient(-bW * 0.5, 0, bW * 0.5, 0);
  backG.addColorStop(0, "#5a2a10");
  backG.addColorStop(0.5, "#6b3818");
  backG.addColorStop(1, "#5a2a10");
  ctx.fillStyle = backG;
  ctx.beginPath();
  ctx.roundRect(-bW * 0.5, -bH * 0.5, bW, bH, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#4a1a08";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Book spine (center fold line)
  ctx.strokeStyle = "#3a1a08";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -bH * 0.5);
  ctx.lineTo(0, bH * 0.5);
  ctx.stroke();

  // Left page (creamy white)
  ctx.fillStyle = "#f8f0e0";
  ctx.beginPath();
  ctx.roundRect(-bW * 0.47, -bH * 0.46, bW * 0.45, bH * 0.92, size * 0.003);
  ctx.fill();

  // Right page
  ctx.fillStyle = "#faf4ea";
  ctx.beginPath();
  ctx.roundRect(bW * 0.02, -bH * 0.46, bW * 0.45, bH * 0.92, size * 0.003);
  ctx.fill();

  // Left page writing lines (already written)
  ctx.strokeStyle = "rgba(80, 60, 40, 0.2)";
  ctx.lineWidth = 0.6;
  for (let line = 0; line < 8; line++) {
    const ly = -bH * 0.36 + line * bH * 0.1;
    ctx.beginPath();
    ctx.moveTo(-bW * 0.43, ly);
    ctx.lineTo(-bW * 0.07, ly);
    ctx.stroke();
  }

  // Right page lines + ink animation
  for (let line = 0; line < 8; line++) {
    const ly = -bH * 0.36 + line * bH * 0.1;
    ctx.strokeStyle = "rgba(80, 60, 40, 0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(bW * 0.06, ly);
    ctx.lineTo(bW * 0.43, ly);
    ctx.stroke();
  }

  if (!isAttacking) {
    const inkLine = Math.floor(writeCycle * 8);
    const inkProgress = (writeCycle * 8) % 1;

    for (let pl = 0; pl < inkLine && pl < 8; pl++) {
      const ply = -bH * 0.36 + pl * bH * 0.1;
      ctx.strokeStyle = "rgba(15, 10, 5, 0.4)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06, ply);
      ctx.lineTo(bW * 0.06 + bW * (0.28 + Math.sin(pl * 2.3) * 0.09), ply);
      ctx.stroke();
    }

    if (inkLine < 8) {
      const iy = -bH * 0.36 + inkLine * bH * 0.1;
      ctx.strokeStyle = "rgba(10, 5, 0, 0.7)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06, iy);
      ctx.lineTo(bW * 0.06 + bW * 0.37 * inkProgress, iy);
      ctx.stroke();

      const shineStart = Math.max(0, inkProgress - 0.2);
      ctx.strokeStyle = "rgba(60, 80, 120, 0.15)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06 + bW * 0.37 * shineStart, iy);
      ctx.lineTo(bW * 0.06 + bW * 0.37 * inkProgress, iy);
      ctx.stroke();

      ctx.fillStyle = "rgba(20, 15, 10, 0.3)";
      ctx.beginPath();
      ctx.arc(
        bW * 0.06 + bW * 0.37 * inkProgress,
        iy,
        size * 0.004,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  } else {
    const glowPulse = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.strokeStyle = `rgba(218, 175, 55, ${0.3 * glowPulse})`;
    ctx.lineWidth = 1;
    for (let gl = 0; gl < 6; gl++) {
      const gly = -bH * 0.36 + gl * bH * 0.12;
      const liftOff = Math.sin(time * 3 + gl * 0.8) * size * 0.003;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06, gly + liftOff);
      ctx.lineTo(
        bW * 0.06 + bW * (0.25 + Math.sin(gl * 1.7) * 0.08),
        gly + liftOff
      );
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(218, 175, 55, ${0.06 * glowPulse})`;
    ctx.fillRect(bW * 0.02, -bH * 0.46, bW * 0.45, bH * 0.92);
  }

  // Gold corner decorations on covers
  ctx.strokeStyle = "#c9a84c";
  ctx.lineWidth = 0.8;
  const corners = [
    { cx: -bW * 0.47, cy: -bH * 0.47, dx: 1, dy: 1 },
    { cx: -bW * 0.02, cy: -bH * 0.47, dx: -1, dy: 1 },
    { cx: bW * 0.47, cy: -bH * 0.47, dx: -1, dy: 1 },
    { cx: bW * 0.02, cy: -bH * 0.47, dx: 1, dy: 1 },
  ];
  for (const c of corners) {
    ctx.beginPath();
    ctx.moveTo(c.cx, c.cy + c.dy * bH * 0.04);
    ctx.lineTo(c.cx, c.cy);
    ctx.lineTo(c.cx + c.dx * bW * 0.05, c.cy);
    ctx.stroke();
  }

  // Emerald green ribbon bookmark hanging out bottom
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bW * 0.15, bH * 0.48);
  ctx.quadraticCurveTo(bW * 0.18, bH * 0.62, bW * 0.12, bH * 0.7);
  ctx.stroke();

  ctx.restore();
}

// ─── PEN ─────────────────────────────────────────────────────────────────────

function drawPen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackPhase: number,
  attackIntensity: number,
  penStrokeX: number,
  penStrokeY: number,
  targetPos?: Position
) {
  const attackRise = isAttacking ? Math.min(attackPhase * 3, 1) : 0;
  const quillFlourish = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 1.5 +
      Math.cos(attackPhase * Math.PI * 3) * 0.4
    : 0;

  // Pen nib touches the book's right page during writing; lifts and aims during attack
  const penBaseX = x + size * 0.12 + (isAttacking ? 0 : penStrokeX);
  const penBaseY =
    y - size * 0.02 + (isAttacking ? -size * 0.18 * attackRise : penStrokeY);
  const penWriteRot = Math.PI + 0.25 + Math.sin(time * 2) * 0.04;

  let penRot: number;
  if (isAttacking) {
    const penAttackRot = -0.3 + quillFlourish * 0.4 + attackRise * 0.6;
    penRot = resolveWeaponRotation(
      targetPos,
      penBaseX,
      penBaseY,
      penAttackRot,
      Math.PI / 2,
      1.2,
      WEAPON_LIMITS.rightMelee
    );
  } else {
    penRot = penWriteRot;
  }

  ctx.save();
  ctx.translate(penBaseX, penBaseY);
  ctx.rotate(penRot);

  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }

  // Pen body
  const pg = ctx.createLinearGradient(
    -size * 0.02,
    -size * 0.2,
    size * 0.02,
    -size * 0.2
  );
  pg.addColorStop(0, "#0a0a0a");
  pg.addColorStop(0.2, "#2a2a2a");
  pg.addColorStop(0.5, "#1a1a1a");
  pg.addColorStop(0.8, "#2a2a2a");
  pg.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.025,
    -size * 0.2,
    size * 0.05,
    size * 0.28,
    size * 0.008
  );
  ctx.fill();

  // Body highlight
  ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, -size * 0.19);
  ctx.lineTo(-size * 0.015, size * 0.06);
  ctx.stroke();

  // Gold accent bands
  const tbg = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  tbg.addColorStop(0, "#8a6b20");
  tbg.addColorStop(0.3, "#c9a84c");
  tbg.addColorStop(0.5, "#e8d48a");
  tbg.addColorStop(0.7, "#c9a84c");
  tbg.addColorStop(1, "#8a6b20");
  ctx.fillStyle = tbg;
  ctx.fillRect(-size * 0.028, -size * 0.16, size * 0.056, size * 0.02);
  ctx.fillRect(-size * 0.028, -size * 0.09, size * 0.056, size * 0.012);
  ctx.fillRect(-size * 0.028, -size * 0.02, size * 0.056, size * 0.012);
  ctx.fillRect(-size * 0.028, size * 0.05, size * 0.056, size * 0.02);

  // Clip
  ctx.fillStyle = tbg;
  ctx.fillRect(size * 0.02, -size * 0.14, size * 0.012, size * 0.12);
  ctx.beginPath();
  ctx.arc(size * 0.026, -size * 0.14, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Nib section
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.2);
  ctx.lineTo(-size * 0.015, -size * 0.24);
  ctx.lineTo(size * 0.015, -size * 0.24);
  ctx.lineTo(size * 0.02, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Gold nib
  const ng = ctx.createLinearGradient(
    -size * 0.012,
    -size * 0.24,
    size * 0.012,
    -size * 0.24
  );
  ng.addColorStop(0, "#8a6b20");
  ng.addColorStop(0.5, "#e8d48a");
  ng.addColorStop(1, "#8a6b20");
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.24);
  ctx.lineTo(-size * 0.014, -size * 0.31);
  ctx.lineTo(0, -size * 0.35);
  ctx.lineTo(size * 0.014, -size * 0.31);
  ctx.closePath();
  ctx.fill();

  // Nib slit
  ctx.strokeStyle = "#304858";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(0, -size * 0.33);
  ctx.stroke();

  // Glowing ink energy during attack — scatters outward from pen tip
  if (isAttacking) {
    for (let d = 0; d < 6; d++) {
      const dropPhase = (attackPhase + d * 0.12) % 1;
      const dy = -size * 0.37 - dropPhase * size * 0.25 - d * size * 0.03;
      const dx = Math.sin(time * 8 + d * 2.1) * size * 0.025 * dropPhase;
      const da = (1 - dropPhase) * 0.7;
      const dropR = size * (0.006 + (1 - dropPhase) * 0.008);
      ctx.fillStyle = `rgba(218, 175, 55, ${da * attackIntensity})`;
      ctx.beginPath();
      ctx.arc(dx, dy, dropR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(20, 15, 10, ${da * 0.4})`;
      ctx.beginPath();
      ctx.arc(dx * 0.5, dy + size * 0.01, dropR * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── FLOATING WORDS ──────────────────────────────────────────────────────────

const FLOAT_WORDS = [
  "dream",
  "green",
  "light",
  "hope",
  "old sport",
  "jazz",
  "Gatsby",
  "Daisy",
];

function drawFloatingWords(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const count = isAttacking ? 8 : 4;
  const fontPx = Math.round((isAttacking ? 12 : 9) * zoom);
  ctx.font = `italic ${fontPx}px Georgia`;
  ctx.textAlign = "center";

  for (let i = 0; i < count; i++) {
    const speed = isAttacking ? 0.8 : 0.5;
    const phase = (time * speed + i * 0.55) % 3;
    const angle = (i * Math.PI * 2) / count + time * (isAttacking ? 0.6 : 0.4);
    const dist = size * (isAttacking ? 0.5 + phase * 0.2 : 0.45 + phase * 0.08);
    const wx = x + Math.cos(angle) * dist;
    const wy = y - size * 0.3 - phase * size * (isAttacking ? 0.3 : 0.2);
    const alpha =
      (1 - phase / 3) * (isAttacking ? 0.85 + attackIntensity * 0.15 : 0.5);

    if (isAttacking) {
      ctx.shadowColor = "rgba(218, 175, 55, 0.5)";
      ctx.shadowBlur = 6 * zoom * attackIntensity;
    }
    ctx.fillStyle = `rgba(218, 175, 55, ${alpha})`;
    ctx.fillText(FLOAT_WORDS[i % FLOAT_WORDS.length], wx, wy);
  }
  ctx.shadowBlur = 0;
}
