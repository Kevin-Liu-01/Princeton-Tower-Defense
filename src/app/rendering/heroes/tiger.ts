function drawTigerTail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const tailBaseX = x + size * 0.35;
  const tailBaseY = y + size * 0.3;
  const tailSway = Math.sin(time * 2.0) * size * 0.08;
  const attackWhip = isAttacking
    ? Math.sin(attackIntensity * Math.PI * 4) * size * 0.15
    : 0;

  const segments = 12;
  const tailPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const curl = t * t * Math.PI * 0.8;
    tailPts.push({
      x:
        tailBaseX +
        t * size * 0.55 +
        Math.sin(curl) * size * 0.15 +
        tailSway * t +
        attackWhip * t * t,
      y:
        tailBaseY -
        t * size * 0.25 -
        Math.cos(curl) * size * 0.1 +
        Math.sin(time * 2.5 + t * 3) * size * 0.02 * t,
    });
  }

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const thick = size * (0.07 - t * 0.05);
    const p1 = tailPts[i];
    const p2 = tailPts[i + 1];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const px = Math.cos(angle + Math.PI * 0.5);
    const py = Math.sin(angle + Math.PI * 0.5);

    const segG = ctx.createLinearGradient(
      p1.x + px * thick,
      p1.y + py * thick,
      p1.x - px * thick,
      p1.y - py * thick,
    );
    segG.addColorStop(0, "#aa4400");
    segG.addColorStop(0.3, "#ff8822");
    segG.addColorStop(0.7, "#ff8822");
    segG.addColorStop(1, "#aa4400");
    ctx.fillStyle = segG;
    ctx.beginPath();
    ctx.moveTo(p1.x + px * thick, p1.y + py * thick);
    ctx.lineTo(p2.x + px * thick * 0.85, p2.y + py * thick * 0.85);
    ctx.lineTo(p2.x - px * thick * 0.85, p2.y - py * thick * 0.85);
    ctx.lineTo(p1.x - px * thick, p1.y - py * thick);
    ctx.closePath();
    ctx.fill();

    if (i % 3 === 1) {
      ctx.strokeStyle = "#0a0505";
      ctx.lineWidth = Math.max(1, (2.5 - t * 1.5) * zoom);
      ctx.beginPath();
      ctx.moveTo(p1.x + px * thick * 0.9, p1.y + py * thick * 0.9);
      ctx.lineTo(p1.x - px * thick * 0.9, p1.y - py * thick * 0.9);
      ctx.stroke();
    }
  }

  const tipEnd = tailPts[segments];
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.arc(tipEnd.x, tipEnd.y, size * 0.028, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#dd6600";
  ctx.lineWidth = 1 * zoom;
  for (let i = 1; i < segments - 1; i += 2) {
    const p = tailPts[i];
    const pN = tailPts[i + 1];
    const a = Math.atan2(pN.y - p.y, pN.x - p.x);
    const wl = size * 0.03;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(a + 0.8) * wl, p.y + Math.sin(a + 0.8) * wl);
    ctx.stroke();
  }
}

function drawTigerFurEdge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  count: number,
  tuftLength: number,
  time: number,
  zoom: number,
) {
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const wobble = Math.sin(time * 1.5 + i * 2.3) * tuftLength * 0.15;
    const bx = cx + Math.cos(angle) * radiusX;
    const by = cy + Math.sin(angle) * radiusY;
    const len = tuftLength + wobble;
    const tipX = bx + Math.cos(angle) * len;
    const tipY = by + Math.sin(angle) * len;
    const shade = i % 3;
    ctx.strokeStyle =
      shade === 0 ? "#dd6600" : shade === 1 ? "#cc5500" : "#ee7711";
    ctx.lineWidth = (1.5 + Math.sin(i * 1.7) * 0.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(angle + 0.3) * len * 0.6,
      by + Math.sin(angle + 0.3) * len * 0.6,
      tipX,
      tipY,
    );
    ctx.stroke();
  }
}

function drawTigerNeckRuff(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  breathe: number,
) {
  const ruffCY = y - size * 0.38 + breathe * 0.1;
  const ruffHW = size * 0.48;
  const ruffHH = size * 0.18;

  const ruffG = ctx.createRadialGradient(
    x,
    ruffCY,
    size * 0.1,
    x,
    ruffCY,
    ruffHW,
  );
  ruffG.addColorStop(0, "#fff0d8");
  ruffG.addColorStop(0.4, "#ffe0b8");
  ruffG.addColorStop(0.7, "#eec898");
  ruffG.addColorStop(1, "#cc9060");
  ctx.fillStyle = ruffG;
  ctx.beginPath();
  ctx.ellipse(x, ruffCY, ruffHW, ruffHH, 0, 0, Math.PI * 2);
  ctx.fill();

  const tuftCount = 24;
  ctx.lineCap = "round";
  for (let i = 0; i < tuftCount; i++) {
    const angle = (i / tuftCount) * Math.PI * 2;
    const wb = Math.sin(time * 1.2 + i * 1.9) * size * 0.005;
    const bx = x + Math.cos(angle) * (ruffHW + wb);
    const by = ruffCY + Math.sin(angle) * (ruffHH + wb * 0.5);
    const len = size * (0.06 + Math.sin(i * 2.1 + 0.7) * 0.025);
    const ta = angle + Math.sin(time * 1.4 + i * 0.8) * 0.15;
    ctx.strokeStyle =
      i % 3 === 0 ? "#fff0d8" : i % 3 === 1 ? "#eec898" : "#ddb878";
    ctx.lineWidth = (2.2 - (i % 2) * 0.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(ta) * len * 0.5,
      by + Math.sin(ta) * len * 0.3,
      bx + Math.cos(ta) * len,
      by + Math.sin(ta) * len * 0.6,
    );
    ctx.stroke();
  }
}

function drawTigerWhiskerLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
) {
  const whiskBaseY = y - size * 0.45;
  ctx.lineCap = "round";

  for (let side = -1; side <= 1; side += 2) {
    for (let w = 0; w < 4; w++) {
      const bx = x + side * size * 0.1;
      const by = whiskBaseY + w * size * 0.032;
      const sway = Math.sin(time * 1.6 + w * 0.7 + side * 0.5) * 0.05;
      const spreadAngle = side * (0.15 + w * 0.18) + sway;
      const wLen = size * (0.38 - Math.abs(w - 1.5) * 0.03);

      const vertSpread = Math.sin(Math.abs(spreadAngle));
      const mx1 = bx + side * wLen * 0.35;
      const my1 = by + vertSpread * wLen * 0.18 + size * 0.005;
      const mx2 = bx + side * wLen * 0.7;
      const my2 = by + vertSpread * wLen * 0.4 + size * 0.015;
      const ex = bx + side * wLen;
      const ey = by + vertSpread * wLen * 0.55 + size * 0.02;

      // Thick base tapering to thin tip (draw twice: thick shadow + thin bright)
      ctx.strokeStyle = `rgba(200, 190, 170, ${0.25 - w * 0.03})`;
      ctx.lineWidth = (2.5 - w * 0.2) * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.bezierCurveTo(mx1, my1, mx2, my2, ex, ey);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 - w * 0.08})`;
      ctx.lineWidth = (1.6 - w * 0.15) * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.bezierCurveTo(
        mx1,
        my1 - size * 0.002,
        mx2,
        my2 - size * 0.003,
        ex,
        ey,
      );
      ctx.stroke();
    }
  }
}

function drawTigerChinFur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
) {
  const chinY = y - size * 0.34;
  const chinHW = size * 0.14;

  const chinG = ctx.createRadialGradient(
    x,
    chinY,
    size * 0.02,
    x,
    chinY,
    size * 0.12,
  );
  chinG.addColorStop(0, "#fff8f0");
  chinG.addColorStop(0.6, "#ffe8d0");
  chinG.addColorStop(1, "#ddbb88");
  ctx.fillStyle = chinG;
  ctx.beginPath();
  ctx.ellipse(x, chinY, chinHW, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const t = (i / 7) * 2 - 1;
    const tx = x + t * chinHW * 0.8;
    const ty = chinY + size * 0.04;
    const len = size * (0.04 + Math.abs(t) * 0.015);
    const sway = Math.sin(time * 1.6 + i * 0.9) * size * 0.003;
    ctx.strokeStyle = i % 2 === 0 ? "#fff0e0" : "#eed8b8";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + sway, ty + len);
    ctx.stroke();
  }
}

function drawTigerExtraTeeth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  attackIntensity: number,
  mouthOpen: number,
) {
  if (mouthOpen < size * 0.045) return;

  const mouthY = y - size * 0.34;
  ctx.fillStyle = "#fffff0";

  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const tx = x + i * size * 0.04;
    const th = size * 0.022 + attackIntensity * size * 0.008;
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.01, mouthY - mouthOpen * 0.3);
    ctx.lineTo(tx, mouthY - mouthOpen * 0.3 + th);
    ctx.lineTo(tx + size * 0.01, mouthY - mouthOpen * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = -1; i <= 1; i += 2) {
    const tx = x + i * size * 0.05;
    const th = size * 0.018;
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.008, mouthY + mouthOpen * 0.5);
    ctx.lineTo(tx, mouthY + mouthOpen * 0.5 - th);
    ctx.lineTo(tx + size * 0.008, mouthY + mouthOpen * 0.5);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTigerBodyStripePattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  breathe: number,
) {
  ctx.strokeStyle = "#050202";
  ctx.lineCap = "round";

  for (let i = 0; i < 6; i++) {
    const stripeY = y - size * 0.25 + i * size * 0.11 + breathe * 0.2;
    const jagged = Math.sin(i * 2.3) * size * 0.015;
    ctx.lineWidth = (2.5 - i * 0.15) * zoom;

    ctx.beginPath();
    ctx.moveTo(x - size * 0.57, stripeY);
    ctx.bezierCurveTo(
      x - size * 0.52,
      stripeY - size * 0.04 + jagged,
      x - size * 0.46,
      stripeY + size * 0.02 - jagged,
      x - size * 0.38,
      stripeY + size * 0.01,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + size * 0.57, stripeY + size * 0.005);
    ctx.bezierCurveTo(
      x + size * 0.52,
      stripeY - size * 0.035 - jagged,
      x + size * 0.46,
      stripeY + size * 0.025 + jagged,
      x + size * 0.38,
      stripeY + size * 0.012,
    );
    ctx.stroke();
  }

  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const sy = y - size * 0.18 + i * size * 0.13 + breathe * 0.15;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.54, sy);
    ctx.lineTo(x - size * 0.48, sy - size * 0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.54, sy);
    ctx.lineTo(x + size * 0.48, sy - size * 0.02);
    ctx.stroke();
  }
}

function drawTigerMuscleDef(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  size: number,
  zoom: number,
  side: number,
  armOffset: number,
) {
  ctx.strokeStyle = "rgba(170, 80, 0, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(
    shoulderX + armOffset + side * size * 0.05,
    shoulderY - size * 0.12,
  );
  ctx.quadraticCurveTo(
    shoulderX + armOffset + side * size * 0.18,
    shoulderY,
    shoulderX + armOffset + side * size * 0.08,
    shoulderY + size * 0.14,
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(
    shoulderX + armOffset - side * size * 0.05,
    shoulderY - size * 0.15,
  );
  ctx.quadraticCurveTo(
    shoulderX + armOffset - side * size * 0.12,
    shoulderY - size * 0.02,
    shoulderX + armOffset - side * size * 0.06,
    shoulderY + size * 0.12,
  );
  ctx.stroke();
}

function drawTigerEyeIris(
  ctx: CanvasRenderingContext2D,
  x: number,
  eyeY: number,
  size: number,
  zoom: number,
  isAttacking: boolean,
) {
  for (let side = -1; side <= 1; side += 2) {
    const ex = x + side * size * 0.15;
    const irisR = size * 0.065;

    const irisG = ctx.createRadialGradient(
      ex,
      eyeY,
      irisR * 0.2,
      ex,
      eyeY,
      irisR,
    );
    irisG.addColorStop(0, isAttacking ? "#ff6644" : "#bbee33");
    irisG.addColorStop(0.4, isAttacking ? "#dd2211" : "#77cc11");
    irisG.addColorStop(0.7, isAttacking ? "#aa0000" : "#44aa00");
    irisG.addColorStop(1, isAttacking ? "#660000" : "#226600");
    ctx.fillStyle = irisG;
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, irisR, irisR * 0.85, side * -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isAttacking
      ? "rgba(60, 0, 0, 0.5)"
      : "rgba(0, 40, 0, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    const spokeCount = 12;
    for (let s = 0; s < spokeCount; s++) {
      const sa = (s / spokeCount) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        ex + Math.cos(sa) * irisR * 0.25,
        eyeY + Math.sin(sa) * irisR * 0.2,
      );
      ctx.lineTo(
        ex + Math.cos(sa) * irisR * 0.75,
        eyeY + Math.sin(sa) * irisR * 0.65,
      );
      ctx.stroke();
    }
  }
}

function drawTigerSkirtArmor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  gemPulse: number,
) {
  const skirtTop = y + size * 0.28;
  const bandCount = 4;
  const totalHeight = size * 0.34;
  const bandHeight = totalHeight / bandCount;
  const gapHalf = size * 0.11;

  drawTigerCenterBanner(
    ctx,
    x,
    size,
    time,
    zoom,
    skirtTop,
    totalHeight,
    gapHalf,
    gemPulse,
  );

  for (let side = -1; side <= 1; side += 2) {
    drawTigerTassetSide(
      ctx,
      x,
      size,
      time,
      zoom,
      side,
      skirtTop,
      bandCount,
      bandHeight,
      totalHeight,
      gapHalf,
      gemPulse,
      isAttacking,
      attackIntensity,
    );
  }

  const strapY = skirtTop + size * 0.025;
  const leftAnchor = x - gapHalf + size * 0.01;
  const rightAnchor = x + gapHalf - size * 0.01;
  const sag = size * 0.035 + Math.sin(time * 2) * size * 0.004;
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(leftAnchor, strapY);
  ctx.quadraticCurveTo(x, strapY + sag, rightAnchor, strapY);
  ctx.stroke();

  drawTigerSkirtBelt(ctx, x, size, zoom, skirtTop, gemPulse);
}

function drawTigerTassetSide(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  time: number,
  zoom: number,
  side: number,
  skirtTop: number,
  bandCount: number,
  bandHeight: number,
  totalHeight: number,
  gapHalf: number,
  gemPulse: number,
  _isAttacking: boolean,
  _attackIntensity: number,
) {
  const shear = size * -0.12;

  for (let band = 0; band < bandCount; band++) {
    const innerTopY = skirtTop + band * bandHeight;
    const innerBotY = innerTopY + bandHeight;
    const outerTopY = innerTopY + shear;
    const outerBotY = innerBotY + shear;

    const outerW = size * (0.42 + band * 0.035);
    const innerGap = gapHalf + band * size * 0.008;
    const sway =
      Math.sin(time * 1.5 + band * 0.7 + side * 0.4) *
      size *
      0.003 *
      (band + 1);

    const innerX = x + side * innerGap + sway;
    const outerX = x + side * outerW + sway;

    const plateG = ctx.createLinearGradient(
      innerX,
      innerTopY,
      outerX,
      outerBotY,
    );
    if (side === -1) {
      plateG.addColorStop(0, "#4a3a28");
      plateG.addColorStop(0.25, "#5a4a38");
      plateG.addColorStop(0.55, "#3a2a18");
      plateG.addColorStop(1, "#3a2a18");
    } else {
      plateG.addColorStop(0, "#3a2a18");
      plateG.addColorStop(0.45, "#3a2a18");
      plateG.addColorStop(0.75, "#5a4a38");
      plateG.addColorStop(1, "#4a3a28");
    }

    ctx.fillStyle = plateG;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#1a1008";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.stroke();

    const rivetMidT = 0.75;
    const rivetX = innerX + rivetMidT * (outerX - innerX);
    const rivetY =
      innerTopY + rivetMidT * (outerTopY - innerTopY) + bandHeight * 0.45;
    const rg = ctx.createRadialGradient(
      rivetX - size * 0.002,
      rivetY - size * 0.002,
      0,
      rivetX,
      rivetY,
      size * 0.009,
    );
    rg.addColorStop(0, "#c09040");
    rg.addColorStop(0.4, "#a07030");
    rg.addColorStop(1, "#704820");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    if (band % 2 === 0) {
      const scaleCount = 2 + Math.floor(band / 2);
      for (let sc = 0; sc < scaleCount; sc++) {
        const t = (sc + 0.5) / scaleCount;
        const scaleX = innerX + t * (outerX - innerX);
        const scaleYBase =
          innerTopY + t * (outerTopY - innerTopY) + bandHeight * 0.4;
        const scaleSize = size * 0.026;
        const scaleG = ctx.createRadialGradient(
          scaleX - scaleSize * 0.3,
          scaleYBase - scaleSize * 0.2,
          0,
          scaleX,
          scaleYBase,
          scaleSize,
        );
        scaleG.addColorStop(0, "#8a6a48");
        scaleG.addColorStop(0.5, "#6a4a28");
        scaleG.addColorStop(1, "#4a3a18");
        ctx.fillStyle = scaleG;
        ctx.beginPath();
        ctx.moveTo(scaleX, scaleYBase - scaleSize * 0.3);
        ctx.quadraticCurveTo(
          scaleX + scaleSize,
          scaleYBase,
          scaleX,
          scaleYBase + scaleSize * 0.6,
        );
        ctx.quadraticCurveTo(
          scaleX - scaleSize,
          scaleYBase,
          scaleX,
          scaleYBase - scaleSize * 0.3,
        );
        ctx.fill();
      }
    }

    if (band % 2 === 1) {
      const midT = 0.5;
      const accentInnerX = innerX + side * size * 0.015;
      const accentOuterX = outerX - side * size * 0.015;
      const accentInnerY = innerTopY + bandHeight * midT;
      const accentOuterY = outerTopY + bandHeight * midT;
      ctx.strokeStyle = `rgba(255, 140, 30, ${0.25 + gemPulse * 0.2})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.shadowColor = "#ff8c1a";
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.moveTo(accentInnerX, accentInnerY);
      ctx.lineTo(accentOuterX, accentOuterY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}

function drawTigerCenterBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  time: number,
  zoom: number,
  skirtTop: number,
  totalHeight: number,
  gapHalf: number,
  gemPulse: number,
) {
  const bannerTop = skirtTop + size * 0.04;
  const bannerBottom = skirtTop + totalHeight * 0.92;
  const bannerHalfW = gapHalf * 0.75;
  const wave = Math.sin(time * 2.5) * size * 0.008;
  const wave2 = Math.sin(time * 3.2 + 0.5) * size * 0.005;

  const bannerGrad = ctx.createLinearGradient(x, bannerTop, x, bannerBottom);
  bannerGrad.addColorStop(0, "#8b3a00");
  bannerGrad.addColorStop(0.15, "#cc5500");
  bannerGrad.addColorStop(0.4, "#ff7700");
  bannerGrad.addColorStop(0.7, "#cc5500");
  bannerGrad.addColorStop(1, "#8b3a00");
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
    bannerBottom,
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
    bannerTop,
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#a07030";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  const emblemY = (bannerTop + bannerBottom) * 0.5 - size * 0.03;
  ctx.strokeStyle = "#c09040";
  ctx.lineWidth = 2 * zoom;
  ctx.shadowColor = "#daa050";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, emblemY - size * 0.02);
  ctx.lineTo(x + size * 0.025, emblemY + size * 0.02);
  ctx.moveTo(x - size * 0.01, emblemY);
  ctx.lineTo(x + size * 0.02, emblemY + size * 0.03);
  ctx.moveTo(x, emblemY - size * 0.01);
  ctx.lineTo(x + size * 0.018, emblemY + size * 0.025);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawTigerSkirtBelt(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  zoom: number,
  skirtTop: number,
  gemPulse: number,
) {
  const beltHalfW = size * 0.43;
  const beltThick = size * 0.048;
  const vDip = size * 0.08;

  const beltGrad = ctx.createLinearGradient(
    x - beltHalfW,
    skirtTop,
    x + beltHalfW,
    skirtTop,
  );
  beltGrad.addColorStop(0, "#704820");
  beltGrad.addColorStop(0.25, "#c09040");
  beltGrad.addColorStop(0.5, "#daa050");
  beltGrad.addColorStop(0.75, "#c09040");
  beltGrad.addColorStop(1, "#704820");

  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#1a1008";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.fillStyle = "#ff6600";
  ctx.shadowColor = "#ff8c1a";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, skirtTop + vDip * 0.35, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffaa44";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.008,
    skirtTop + vDip * 0.35 - size * 0.008,
    size * 0.013,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawTigerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  // ARMORED WAR TIGER - Colossal beast warrior with devastating claw attacks
  const breathe = Math.sin(time * 1.8) * 3; // More pronounced breathing
  const idleSway = Math.sin(time * 1.2) * 1.5; // Subtle idle body sway
  const isAttacking = attackPhase > 0;
  const clawSwipe = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.8 : 0;
  const bodyLean = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.2
    : Math.sin(time * 1.5) * 0.03; // Idle lean
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Arm raise animation - arms swing UP first, then DOWN during attack
  // Phase 0-0.4: Arms raise up
  // Phase 0.4-1.0: Arms swing down powerfully
  let armRaise = 0;
  if (isAttacking) {
    if (attackPhase < 0.4) {
      // Wind up - arms raise
      armRaise = Math.sin((attackPhase / 0.4) * Math.PI * 0.5) * size * 0.35;
    } else {
      // Swing down - arms come down fast
      armRaise =
        Math.cos(((attackPhase - 0.4) / 0.6) * Math.PI * 0.5) *
        size *
        0.35 *
        (1 - (attackPhase - 0.4) / 0.6);
    }
  }

  // === ATTACK GLOW EFFECT ===
  if (isAttacking) {
    // Outer attack aura - intense orange glow
    const attackGlow = attackIntensity * 0.7;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 25 * zoom * attackIntensity;

    // Pulsing attack ring
    for (let ring = 0; ring < 3; ring++) {
      const ringSize = size * (0.85 + ring * 0.15 + attackIntensity * 0.1);
      const ringAlpha = attackGlow * (0.6 - ring * 0.18);
      ctx.strokeStyle = `rgba(255, 120, 0, ${ringAlpha})`;
      ctx.lineWidth = (4 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringSize, ringSize * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // === MULTI-LAYERED INFERNAL AURA ===
  const auraIntensity = isAttacking ? 0.65 : 0.2; // Much brighter when attacking
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x,
      y,
      size * (0.1 + layerOffset),
      x,
      y,
      size * (1.0 + layerOffset * 0.3),
    );
    auraGrad.addColorStop(
      0,
      `rgba(255, 100, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.08)})`,
    );
    auraGrad.addColorStop(
      0.4,
      `rgba(255, 60, 0, ${auraIntensity * auraPulse * (0.25 - auraLayer * 0.05)})`,
    );
    auraGrad.addColorStop(
      0.7,
      `rgba(200, 50, 0, ${auraIntensity * auraPulse * (0.12 - auraLayer * 0.02)})`,
    );
    auraGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      size * (0.95 + layerOffset * 0.2),
      size * (0.75 + layerOffset * 0.15),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Floating flame particles
  for (let p = 0; p < 14; p++) {
    const pAngle = (time * 1.2 + p * Math.PI * 0.143) % (Math.PI * 2);
    const pDist = size * 0.75 + Math.sin(time * 2 + p * 0.5) * size * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py =
      y +
      Math.sin(pAngle) * pDist * 0.6 -
      Math.abs(Math.sin(time * 4 + p)) * size * 0.1;
    const pAlpha = 0.6 + Math.sin(time * 4 + p * 0.4) * 0.3;
    ctx.fillStyle =
      p % 3 === 0
        ? `rgba(255, 200, 50, ${pAlpha})`
        : `rgba(255, 100, 0, ${pAlpha})`;
    ctx.beginPath();
    ctx.moveTo(px, py + size * 0.02);
    ctx.quadraticCurveTo(px - size * 0.01, py, px, py - size * 0.025);
    ctx.quadraticCurveTo(px + size * 0.01, py, px, py + size * 0.02);
    ctx.fill();
  }

  drawTigerTail(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === MASSIVE MUSCULAR TIGER BODY ===
  // Add attack glow to body
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }

  const bodyGrad = ctx.createRadialGradient(
    x,
    y + size * 0.05 + breathe * 0.3,
    0,
    x,
    y + size * 0.05 + breathe * 0.3,
    size * 0.7,
  );
  bodyGrad.addColorStop(0, isAttacking ? "#ffbb55" : "#ffaa44");
  bodyGrad.addColorStop(0.3, isAttacking ? "#ff9933" : "#ff8822");
  bodyGrad.addColorStop(0.6, "#dd5500");
  bodyGrad.addColorStop(0.85, "#aa3300");
  bodyGrad.addColorStop(1, "#661800");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Bulkier body shape with more breathing movement
  ctx.ellipse(
    x + idleSway * 0.3,
    y + breathe * 0.4,
    size * 0.58 + breathe * 0.008,
    size * 0.68 + breathe * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  drawTigerFurEdge(
    ctx,
    x + idleSway * 0.3,
    y + breathe * 0.4,
    size * 0.58 + breathe * 0.008,
    size * 0.68 + breathe * 0.025,
    32,
    size * 0.045,
    time,
    zoom,
  );

  // === HEAVY WAR ARMOR - CHEST PLATE ===
  const chestArmorGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y - size * 0.3,
    x + size * 0.4,
    y + size * 0.3,
  );
  chestArmorGrad.addColorStop(0, "#2a2218");
  chestArmorGrad.addColorStop(0.2, "#4a3a28");
  chestArmorGrad.addColorStop(0.4, "#5a4a38");
  chestArmorGrad.addColorStop(0.5, "#6a5a48");
  chestArmorGrad.addColorStop(0.6, "#5a4a38");
  chestArmorGrad.addColorStop(0.8, "#4a3a28");
  chestArmorGrad.addColorStop(1, "#2a2218");
  ctx.fillStyle = chestArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.35, y + size * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.45);
  ctx.quadraticCurveTo(x, y + size * 0.5, x + size * 0.15, y + size * 0.45);
  ctx.lineTo(x + size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.45, x - size * 0.38, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Armor plate edge highlight
  ctx.strokeStyle = "#8a7a68";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.33);
  ctx.quadraticCurveTo(
    x - size * 0.43,
    y - size * 0.05,
    x - size * 0.33,
    y + size * 0.28,
  );
  ctx.stroke();

  // Armor border
  ctx.strokeStyle = "#1a1510";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.35, y + size * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.45);
  ctx.quadraticCurveTo(x, y + size * 0.5, x + size * 0.15, y + size * 0.45);
  ctx.lineTo(x + size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.45, x - size * 0.38, y - size * 0.35);
  ctx.closePath();
  ctx.stroke();

  // Armor segment lines
  ctx.strokeStyle = "#3a3028";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.1);
  ctx.lineTo(x + size * 0.32, y - size * 0.1);
  ctx.moveTo(x - size * 0.28, y + size * 0.15);
  ctx.lineTo(x + size * 0.28, y + size * 0.15);
  ctx.stroke();

  // Gold trim on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.36, y - size * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y + size * 0.43);
  ctx.quadraticCurveTo(x, y + size * 0.48, x + size * 0.13, y + size * 0.43);
  ctx.stroke();

  // Central tiger emblem on armor
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.lineTo(x - size * 0.12, y + size * 0.02);
  ctx.lineTo(x, y + size * 0.15);
  ctx.lineTo(x + size * 0.12, y + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x - size * 0.08, y);
  ctx.lineTo(x, y + size * 0.1);
  ctx.lineTo(x + size * 0.08, y);
  ctx.closePath();
  ctx.fill();
  // Emblem gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = isAttacking ? 10 * zoom * gemPulse : 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.06, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Armor studs/rivets
  for (let row = 0; row < 2; row++) {
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const studX = x + i * size * 0.13;
      const studY = y - size * 0.1 + row * size * 0.25;
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(studX, studY, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f0c040";
      ctx.beginPath();
      ctx.arc(
        studX - size * 0.006,
        studY - size * 0.006,
        size * 0.01,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  drawTigerBodyStripePattern(ctx, x, y, size, time, zoom, breathe);

  drawTigerSkirtArmor(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    isAttacking,
    attackIntensity,
    gemPulse,
  );

  // === COLOSSAL ARMORED SHOULDERS/PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const shoulderX =
      x + side * size * 0.52 + (isAttacking ? 0 : idleSway * 0.2);
    const shoulderY =
      y - size * 0.15 - armRaise + (isAttacking ? 0 : breathe * 0.15); // Arms raise up during attack
    const armOffset = isAttacking ? clawSwipe * size * 0.15 * side : 0;

    // Arm rotation during attack - arms rotate outward when raised
    const armRotation = isAttacking
      ? side * (-0.25 - clawSwipe * 0.25 - (armRaise / size) * 0.5)
      : side * (-0.25 + Math.sin(time * 1.5) * 0.05);

    // Attack glow on arms
    if (isAttacking) {
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 12 * zoom * attackIntensity;
    }

    // Massive arm/shoulder muscle
    const armGrad = ctx.createRadialGradient(
      shoulderX + armOffset,
      shoulderY,
      0,
      shoulderX + armOffset,
      shoulderY,
      size * 0.35,
    );
    armGrad.addColorStop(0, isAttacking ? "#ffaa55" : "#ff9944");
    armGrad.addColorStop(0.4, isAttacking ? "#ff8833" : "#ff7722");
    armGrad.addColorStop(0.7, "#dd5500");
    armGrad.addColorStop(1, "#aa3300");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(
      shoulderX + armOffset,
      shoulderY,
      size * 0.28,
      size * 0.35,
      armRotation,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Arm stripes - thin and distinctive
    ctx.strokeStyle = "#050202";
    ctx.lineWidth = 1.8 * zoom;
    for (let stripe = 0; stripe < 5; stripe++) {
      const stripeOffset = -size * 0.22 + stripe * size * 0.1;
      ctx.beginPath();
      ctx.moveTo(
        shoulderX + armOffset + side * size * 0.22,
        shoulderY + stripeOffset,
      );
      ctx.quadraticCurveTo(
        shoulderX + armOffset + side * size * 0.14,
        shoulderY + stripeOffset - size * 0.035,
        shoulderX + armOffset + side * size * 0.06,
        shoulderY + stripeOffset + size * 0.01,
      );
      ctx.stroke();
    }

    drawTigerMuscleDef(ctx, shoulderX, shoulderY, size, zoom, side, armOffset);

    // Massive circular shoulder pad with spikes (covers the whole shoulder)
    const padCX = shoulderX + armOffset;
    const padCY = shoulderY - size * 0.14;
    const padR = size * 0.3;

    // Spikes radiating outward (drawn behind the pad)
    const spikeCount = 8;
    for (let sp = 0; sp < spikeCount; sp++) {
      const spAngle = (sp / spikeCount) * Math.PI * 2 + side * 0.25;
      const spBaseR = padR * 0.82;
      const spLen = padR * (0.45 + (sp % 2 === 0 ? 0.12 : 0));
      const spWidth = padR * 0.14;
      const bx = padCX + Math.cos(spAngle) * spBaseR;
      const by = padCY + Math.sin(spAngle) * spBaseR;
      const tx = padCX + Math.cos(spAngle) * (spBaseR + spLen);
      const ty = padCY + Math.sin(spAngle) * (spBaseR + spLen);
      const perpX = Math.cos(spAngle + Math.PI * 0.5);
      const perpY = Math.sin(spAngle + Math.PI * 0.5);

      // Spike body gradient (dark base to metallic tip)
      const spG = ctx.createLinearGradient(bx, by, tx, ty);
      spG.addColorStop(0, "#3a3028");
      spG.addColorStop(0.3, "#4a4038");
      spG.addColorStop(0.7, "#5a5048");
      spG.addColorStop(1, "#8a8078");
      ctx.fillStyle = spG;
      ctx.beginPath();
      ctx.moveTo(bx + perpX * spWidth, by + perpY * spWidth);
      ctx.lineTo(tx, ty);
      ctx.lineTo(bx - perpX * spWidth, by - perpY * spWidth);
      ctx.closePath();
      ctx.fill();
      // Spike highlight edge
      ctx.strokeStyle = "rgba(255, 220, 180, 0.25)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bx + perpX * spWidth * 0.6, by + perpY * spWidth * 0.6);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      // Spike shadow edge
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.moveTo(bx - perpX * spWidth * 0.6, by - perpY * spWidth * 0.6);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    if (isAttacking) {
      ctx.shadowColor = "#ff8800";
      ctx.shadowBlur = 10 * zoom * attackIntensity;
    }

    // Dark outer ring with 3D bevel
    const outerG = ctx.createRadialGradient(
      padCX - padR * 0.15,
      padCY - padR * 0.15,
      padR * 0.6,
      padCX,
      padCY,
      padR,
    );
    outerG.addColorStop(0, "#3a3030");
    outerG.addColorStop(0.7, "#2a2020");
    outerG.addColorStop(1, "#1a1010");
    ctx.fillStyle = outerG;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3D highlight arc on outer ring (top-left lit)
    ctx.strokeStyle = "rgba(120, 100, 80, 0.5)";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.96, -Math.PI * 0.8, -Math.PI * 0.15);
    ctx.stroke();
    // 3D shadow arc on outer ring (bottom-right dark)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.96, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    // Flame gradient ring (orange/red) with 3D depth
    const flameGrad = ctx.createRadialGradient(
      padCX - padR * 0.1,
      padCY - padR * 0.1,
      padR * 0.3,
      padCX,
      padCY,
      padR * 0.9,
    );
    flameGrad.addColorStop(0, "#ff8830");
    flameGrad.addColorStop(0.3, "#ff6020");
    flameGrad.addColorStop(0.6, "#e04010");
    flameGrad.addColorStop(1, "#801800");
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.88, 0, Math.PI * 2);
    ctx.fill();
    // Flame ring highlight arc
    ctx.strokeStyle = "rgba(255, 180, 80, 0.4)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.82, -Math.PI * 0.7, -Math.PI * 0.2);
    ctx.stroke();

    // Dark middle ring with bevel
    const midG = ctx.createRadialGradient(
      padCX - padR * 0.08,
      padCY - padR * 0.08,
      padR * 0.2,
      padCX,
      padCY,
      padR * 0.6,
    );
    midG.addColorStop(0, "#2a2525");
    midG.addColorStop(0.6, "#1a1515");
    midG.addColorStop(1, "#0a0808");
    ctx.fillStyle = midG;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.58, 0, Math.PI * 2);
    ctx.fill();
    // Inner ring highlight
    ctx.strokeStyle = "rgba(80, 70, 60, 0.5)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.55, -Math.PI * 0.75, -Math.PI * 0.1);
    ctx.stroke();

    // Bronze inner circle with 3D gradient
    const bronzeG = ctx.createRadialGradient(
      padCX - padR * 0.06,
      padCY - padR * 0.06,
      0,
      padCX,
      padCY,
      padR * 0.44,
    );
    bronzeG.addColorStop(0, "#d8a068");
    bronzeG.addColorStop(0.4, "#c08848");
    bronzeG.addColorStop(0.7, "#a06830");
    bronzeG.addColorStop(1, "#804820");
    ctx.fillStyle = bronzeG;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d08858";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Red gem center with bright glow
    const gemG = ctx.createRadialGradient(
      padCX - padR * 0.04,
      padCY - padR * 0.04,
      0,
      padCX,
      padCY,
      padR * 0.25,
    );
    gemG.addColorStop(0, "#ff6060");
    gemG.addColorStop(0.3, "#ee3030");
    gemG.addColorStop(0.7, "#cc1010");
    gemG.addColorStop(1, "#880000");
    ctx.fillStyle = gemG;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur =
      (isAttacking ? 14 + attackIntensity * 12 : 7) * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(padCX, padCY, padR * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Gem specular highlight
    ctx.fillStyle = "rgba(255, 200, 200, 0.6)";
    ctx.beginPath();
    ctx.ellipse(
      padCX - padR * 0.06,
      padCY - padR * 0.06,
      padR * 0.08,
      padR * 0.06,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // 8 rivets around the outer edge with 3D look
    for (let r = 0; r < 8; r++) {
      const rAngle = (r * Math.PI * 2) / 8;
      const rvX = padCX + Math.cos(rAngle) * padR * 0.73;
      const rvY = padCY + Math.sin(rAngle) * padR * 0.73;
      const rvR = size * 0.014;
      // Rivet body
      const rvG = ctx.createRadialGradient(
        rvX - rvR * 0.3,
        rvY - rvR * 0.3,
        0,
        rvX,
        rvY,
        rvR,
      );
      rvG.addColorStop(0, "#e0b878");
      rvG.addColorStop(0.5, "#c09050");
      rvG.addColorStop(1, "#806030");
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(rvX, rvY, rvR, 0, Math.PI * 2);
      ctx.fill();
    }

    // === MASSIVE ARMORED PAW GAUNTLETS ===
    const pawAngle = isAttacking
      ? side * (0.2 + clawSwipe * 0.3)
      : side * (0.25 + Math.sin(time * 1.2 + side * 1.5) * 0.05);
    const clawX = shoulderX + armOffset * 1.5 + side * size * 0.12;
    const clawY = shoulderY + size * 0.32;

    ctx.save();
    ctx.translate(clawX, clawY);
    ctx.rotate(pawAngle);

    // --- Fur bridge (visible fur between arm and gauntlet) ---
    const furBridgeTop = -size * 0.42;
    const furBridgeBot = -size * 0.3;
    const furBridgeHW = size * 0.15;
    const furBG = ctx.createRadialGradient(
      0, (furBridgeTop + furBridgeBot) * 0.5, 0,
      0, (furBridgeTop + furBridgeBot) * 0.5, furBridgeHW,
    );
    furBG.addColorStop(0, isAttacking ? "#ffaa55" : "#ff9944");
    furBG.addColorStop(0.6, "#dd6600");
    furBG.addColorStop(1, "#aa3300");
    ctx.fillStyle = furBG;
    ctx.beginPath();
    ctx.ellipse(0, (furBridgeTop + furBridgeBot) * 0.5, furBridgeHW, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cc5500";
    ctx.lineWidth = 1 * zoom;
    for (let ft = 0; ft < 6; ft++) {
      const ftA = ((ft / 6) * Math.PI * 2) + 0.3;
      const ftBX = Math.cos(ftA) * furBridgeHW * 0.75;
      const ftBY = (furBridgeTop + furBridgeBot) * 0.5 + Math.sin(ftA) * size * 0.06;
      const ftTX = Math.cos(ftA) * furBridgeHW * 1.1;
      const ftTY = (furBridgeTop + furBridgeBot) * 0.5 + Math.sin(ftA) * size * 0.09;
      ctx.beginPath();
      ctx.moveTo(ftBX, ftBY);
      ctx.lineTo(ftTX, ftTY);
      ctx.stroke();
    }

    // --- Forearm armor plate (overlaps into arm for seamless attachment) ---
    const faTop = -size * 0.34;
    const faBot = -size * 0.04;
    const faHW = size * 0.12;
    const faG = ctx.createLinearGradient(-faHW, faTop, faHW, faBot);
    faG.addColorStop(0, "#1e1e28");
    faG.addColorStop(0.3, "#2c2c38");
    faG.addColorStop(0.5, "#3a3a48");
    faG.addColorStop(0.7, "#2c2c38");
    faG.addColorStop(1, "#1e1e28");
    ctx.fillStyle = faG;
    ctx.beginPath();
    ctx.moveTo(-faHW, faTop);
    ctx.quadraticCurveTo(-faHW - size * 0.02, (faTop + faBot) * 0.5, -faHW - size * 0.01, faBot);
    ctx.lineTo(faHW + size * 0.01, faBot);
    ctx.quadraticCurveTo(faHW + size * 0.02, (faTop + faBot) * 0.5, faHW, faTop);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "rgba(80, 80, 100, 0.4)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-faHW + size * 0.015, faTop + size * 0.01);
    ctx.lineTo(-faHW - size * 0.003, faBot - size * 0.01);
    ctx.stroke();
    for (let fb = 0; fb < 4; fb++) {
      const fbY = faTop + size * 0.04 + fb * size * 0.07;
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(-faHW - size * 0.005, fbY);
      ctx.lineTo(faHW + size * 0.005, fbY);
      ctx.stroke();
    }

    // --- Main gauntlet shell (big, wraps around paw) ---
    const gTop = -size * 0.06;
    const gBot = size * 0.14;
    const gHW = size * 0.19;
    const gH = gBot - gTop;

    if (isAttacking) {
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 15 * zoom * attackIntensity;
    }
    const gShellG = ctx.createLinearGradient(-gHW, gTop, gHW, gBot);
    gShellG.addColorStop(0, "#18181f");
    gShellG.addColorStop(0.2, "#28283a");
    gShellG.addColorStop(0.5, "#38384a");
    gShellG.addColorStop(0.8, "#28283a");
    gShellG.addColorStop(1, "#18181f");
    ctx.fillStyle = gShellG;
    ctx.beginPath();
    ctx.moveTo(-gHW, gTop);
    ctx.quadraticCurveTo(-gHW - size * 0.03, gTop + gH * 0.5, -gHW - size * 0.02, gBot);
    ctx.lineTo(gHW + size * 0.02, gBot);
    ctx.quadraticCurveTo(gHW + size * 0.03, gTop + gH * 0.5, gHW, gTop);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "rgba(80, 80, 110, 0.45)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-gHW + size * 0.01, gTop + size * 0.01);
    ctx.quadraticCurveTo(-gHW - size * 0.02, gTop + gH * 0.5, -gHW - size * 0.01, gBot - size * 0.01);
    ctx.stroke();

    // Gold trim bands
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-gHW - size * 0.02, gTop + size * 0.01);
    ctx.lineTo(gHW + size * 0.02, gTop + size * 0.01);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-gHW - size * 0.01, gTop + gH * 0.5);
    ctx.lineTo(gHW + size * 0.01, gTop + gH * 0.5);
    ctx.stroke();

    // Knuckle guard ridge
    const knG = ctx.createLinearGradient(-gHW, gBot, gHW, gBot);
    knG.addColorStop(0, "#8a7010");
    knG.addColorStop(0.3, "#daa520");
    knG.addColorStop(0.5, "#f0d860");
    knG.addColorStop(0.7, "#daa520");
    knG.addColorStop(1, "#8a7010");
    ctx.fillStyle = knG;
    ctx.beginPath();
    ctx.ellipse(0, gBot, gHW + size * 0.02, size * 0.028, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#e8c840";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Rivets on gauntlet
    ctx.fillStyle = "#daa520";
    for (let gr = 0; gr < 4; gr++) {
      const grX = (gr - 1.5) * gHW * 0.55;
      const grY = gTop + size * 0.04;
      ctx.beginPath();
      ctx.arc(grX, grY, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
    }

    // Articulated finger guards (segmented metal over each finger)
    for (let fg = 0; fg < 4; fg++) {
      const fgX = (fg - 1.5) * size * 0.075;
      const fgTopY = gBot - size * 0.01;
      const fgBotY = gBot + size * 0.08;
      const fgW = size * 0.03;
      const fgG = ctx.createLinearGradient(fgX - fgW, fgTopY, fgX + fgW, fgBotY);
      fgG.addColorStop(0, "#2a2a38");
      fgG.addColorStop(0.5, "#3a3a4a");
      fgG.addColorStop(1, "#22222e");
      ctx.fillStyle = fgG;
      ctx.beginPath();
      ctx.moveTo(fgX - fgW, fgTopY);
      ctx.lineTo(fgX - fgW * 0.8, fgBotY);
      ctx.lineTo(fgX + fgW * 0.8, fgBotY);
      ctx.lineTo(fgX + fgW, fgTopY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
    }

    // --- Large paw with visible paw pads ---
    const pawCY = gBot + size * 0.1;
    const pawRX = size * 0.2;
    const pawRY = size * 0.14;
    const pawG = ctx.createRadialGradient(0, pawCY, 0, 0, pawCY, pawRX);
    pawG.addColorStop(0, isAttacking ? "#ffcc77" : "#ffbb66");
    pawG.addColorStop(0.5, isAttacking ? "#ffaa55" : "#ff9944");
    pawG.addColorStop(1, "#cc6600");
    ctx.fillStyle = pawG;
    ctx.beginPath();
    ctx.ellipse(0, pawCY, pawRX, pawRY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#aa4400";
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    // Fur tufts around paw edge
    ctx.strokeStyle = "#ee8833";
    ctx.lineWidth = 1.5 * zoom;
    for (let ft = 0; ft < 8; ft++) {
      const ftA = (ft / 8) * Math.PI * 2;
      const ftBX = Math.cos(ftA) * pawRX * 0.85;
      const ftBY = pawCY + Math.sin(ftA) * pawRY * 0.85;
      const ftTX = Math.cos(ftA) * pawRX * 1.12;
      const ftTY = pawCY + Math.sin(ftA) * pawRY * 1.12;
      ctx.beginPath();
      ctx.moveTo(ftBX, ftBY);
      ctx.lineTo(ftTX, ftTY);
      ctx.stroke();
    }

    // Central palm pad (large, dark)
    const palmPadG = ctx.createRadialGradient(
      0, pawCY + size * 0.01, 0,
      0, pawCY + size * 0.01, size * 0.08,
    );
    palmPadG.addColorStop(0, "#553344");
    palmPadG.addColorStop(0.5, "#3a1a28");
    palmPadG.addColorStop(1, "#220e18");
    ctx.fillStyle = palmPadG;
    ctx.beginPath();
    ctx.ellipse(0, pawCY + size * 0.015, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(100, 70, 80, 0.3)";
    ctx.beginPath();
    ctx.ellipse(-size * 0.02, pawCY, size * 0.025, size * 0.018, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Toe pads (4 small pads above the palm)
    for (let tp = 0; tp < 4; tp++) {
      const tpX = (tp - 1.5) * size * 0.07;
      const tpY = pawCY - size * 0.08;
      const tpG = ctx.createRadialGradient(tpX, tpY, 0, tpX, tpY, size * 0.03);
      tpG.addColorStop(0, "#553344");
      tpG.addColorStop(0.6, "#3a1a28");
      tpG.addColorStop(1, "#220e18");
      ctx.fillStyle = tpG;
      ctx.beginPath();
      ctx.ellipse(tpX, tpY, size * 0.032, size * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Massive curved claws ---
    for (let c = 0; c < 4; c++) {
      const cBaseX = (c - 1.5) * size * 0.08;
      const cBaseY = pawCY + pawRY * 0.7;
      const cAngle = (c - 1.5) * 0.28 + (isAttacking ? clawSwipe * 0.3 : 0);
      const cLen = size * (0.22 + (isAttacking ? attackIntensity * 0.15 : 0));
      const cWidth = size * 0.035;

      ctx.save();
      ctx.translate(cBaseX, cBaseY);
      ctx.rotate(cAngle * 0.5);

      const clawG = ctx.createLinearGradient(0, 0, 0, cLen);
      clawG.addColorStop(0, "#5a5a5a");
      clawG.addColorStop(0.15, "#3a3a3a");
      clawG.addColorStop(0.5, "#1a1a1a");
      clawG.addColorStop(0.8, "#2a2a2a");
      clawG.addColorStop(0.95, "#aaaaaa");
      clawG.addColorStop(1, "#ffffff");
      ctx.fillStyle = clawG;

      ctx.beginPath();
      ctx.moveTo(-cWidth, 0);
      ctx.quadraticCurveTo(
        -cWidth * 1.1,
        cLen * 0.4,
        -cWidth * 0.3,
        cLen * 0.75,
      );
      ctx.quadraticCurveTo(0, cLen * 1.05, cWidth * 0.3, cLen * 0.75);
      ctx.quadraticCurveTo(cWidth * 1.1, cLen * 0.4, cWidth, 0);
      ctx.closePath();
      ctx.fill();

      // Claw spine highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(-cWidth * 0.15, size * 0.02);
      ctx.quadraticCurveTo(-cWidth * 0.1, cLen * 0.5, 0, cLen * 0.9);
      ctx.stroke();

      // Claw edge shadow
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(cWidth * 0.8, size * 0.01);
      ctx.quadraticCurveTo(cWidth * 0.6, cLen * 0.4, cWidth * 0.15, cLen * 0.7);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore(); // end paw rotation transform

    // === EPIC CLAW SLASH EFFECT (Top-Down Diagonal Swipe) ===
    // Only trigger during the swing-down phase (after arms are raised)
    if (isAttacking && attackPhase > 0.35 && attackPhase < 0.95) {
      const slashProgress = (attackPhase - 0.35) / 0.6;
      const slashAlpha = Math.sin(slashProgress * Math.PI) * 0.95;

      // Starting position matches raised arm position
      const slashStartX = shoulderX + side * size * 0.2;
      const slashStartY = y - size * 0.5; // High starting point

      // Four parallel slash marks sweeping down diagonally
      for (let s = 0; s < 4; s++) {
        const slashOffset = s * size * 0.065;
        const slashEndX = shoulderX + side * size * 0.7 * slashProgress;
        const slashEndY = y + size * 0.65 * slashProgress;

        // Main slash trail gradient - brighter and more intense
        const slashGrad = ctx.createLinearGradient(
          slashStartX + slashOffset * side,
          slashStartY,
          slashEndX + slashOffset * side,
          slashEndY,
        );
        slashGrad.addColorStop(0, `rgba(255, 255, 220, ${slashAlpha * 0.4})`);
        slashGrad.addColorStop(0.15, `rgba(255, 240, 120, ${slashAlpha})`);
        slashGrad.addColorStop(0.4, `rgba(255, 160, 20, ${slashAlpha * 0.9})`);
        slashGrad.addColorStop(0.7, `rgba(255, 100, 0, ${slashAlpha * 0.6})`);
        slashGrad.addColorStop(1, `rgba(255, 60, 0, 0)`);

        ctx.strokeStyle = slashGrad;
        ctx.lineWidth = (7 - s * 1.2) * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(
          slashStartX + slashOffset * side,
          slashStartY + slashOffset * 0.4,
        );
        ctx.bezierCurveTo(
          slashStartX + side * size * 0.35 + slashOffset * side,
          slashStartY + size * 0.25,
          shoulderX + side * size * 0.5 + slashOffset * side,
          y + size * 0.15,
          slashEndX + slashOffset * side,
          slashEndY + slashOffset * 0.6,
        );
        ctx.stroke();
      }

      // Add spark particles along the slash - more particles, more dynamic
      if (slashProgress > 0.2 && slashProgress < 0.85) {
        for (let spark = 0; spark < 12; spark++) {
          const sparkProgress = slashProgress * 0.75 + spark * 0.04;
          const sparkX =
            slashStartX +
            (shoulderX + side * size * 0.55 - slashStartX) * sparkProgress +
            side * Math.sin(spark * 2.5 + time * 10) * size * 0.06;
          const sparkY =
            slashStartY +
            (y + size * 0.45 - slashStartY) * sparkProgress +
            Math.cos(spark * 3.5 + time * 8) * size * 0.05;
          const sparkAlpha = slashAlpha * (1 - spark * 0.07);
          const sparkSize = size * (0.022 - spark * 0.0012);

          // Glow behind sparks
          ctx.shadowColor = "#ff8800";
          ctx.shadowBlur = 6 * zoom;
          ctx.fillStyle =
            spark % 3 === 0
              ? `rgba(255, 255, 180, ${sparkAlpha})`
              : spark % 3 === 1
                ? `rgba(255, 200, 80, ${sparkAlpha * 0.9})`
                : `rgba(255, 140, 20, ${sparkAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  // === ARMORED LEG GUARDS ===
  for (let side = -1; side <= 1; side += 2) {
    const legX = x + side * size * 0.28;
    const legY = y + size * 0.5;

    // Leg fur
    ctx.fillStyle = "#dd6600";
    ctx.beginPath();
    ctx.ellipse(legX, legY, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leg armor
    const legArmorGrad = ctx.createLinearGradient(
      legX - size * 0.08,
      legY - size * 0.1,
      legX + size * 0.08,
      legY + size * 0.1,
    );
    legArmorGrad.addColorStop(0, "#3a3028");
    legArmorGrad.addColorStop(0.5, "#5a4a38");
    legArmorGrad.addColorStop(1, "#3a3028");
    ctx.fillStyle = legArmorGrad;
    ctx.beginPath();
    ctx.moveTo(legX - size * 0.08, legY - size * 0.08);
    ctx.lineTo(legX - size * 0.1, legY + size * 0.1);
    ctx.lineTo(legX + size * 0.1, legY + size * 0.1);
    ctx.lineTo(legX + size * 0.08, legY - size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawTigerNeckRuff(ctx, x, y, size, time, zoom, breathe);

  // === FIERCE ARMORED TIGER HEAD ===
  // Head bobs slightly with breathing
  const headY = y - size * 0.55 + breathe * 0.1;
  const headX = x + idleSway * 0.15;

  // Attack glow on head
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 18 * zoom * attackIntensity;
  }

  const headGrad = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.42,
  );
  headGrad.addColorStop(0, isAttacking ? "#ffbb55" : "#ffaa44");
  headGrad.addColorStop(0.4, isAttacking ? "#ff9933" : "#ff8822");
  headGrad.addColorStop(0.7, "#dd5500");
  headGrad.addColorStop(1, "#aa3300");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.4, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawTigerFurEdge(
    ctx,
    headX,
    headY,
    size * 0.4,
    size * 0.36,
    20,
    size * 0.035,
    time,
    zoom,
  );

  // === ROMAN LEGION GALEA (gold & black, open top) ===
  const hY = headY;

  // --- Neck guard (drawn first, behind head) ---
  const neckGG = ctx.createLinearGradient(
    x,
    hY + size * 0.2,
    x,
    hY + size * 0.42,
  );
  neckGG.addColorStop(0, "#3a3a44");
  neckGG.addColorStop(0.4, "#2a2a34");
  neckGG.addColorStop(1, "#1a1a24");
  ctx.fillStyle = neckGG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, hY + size * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.42,
    hY + size * 0.3,
    x - size * 0.38,
    hY + size * 0.42,
  );
  ctx.lineTo(x + size * 0.38, hY + size * 0.42);
  ctx.quadraticCurveTo(
    x + size * 0.42,
    hY + size * 0.3,
    x + size * 0.32,
    hY + size * 0.2,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Neck guard horizontal ridges
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  for (let nr = 0; nr < 3; nr++) {
    const nrY = hY + size * (0.26 + nr * 0.055);
    const nrW = size * (0.34 - nr * 0.02);
    ctx.beginPath();
    ctx.moveTo(x - nrW, nrY);
    ctx.lineTo(x + nrW, nrY);
    ctx.stroke();
  }

  // --- Side shells (curved plates wrapping around the head) ---
  for (let hSide = -1; hSide <= 1; hSide += 2) {
    const spG = ctx.createLinearGradient(x, hY, x + hSide * size * 0.52, hY);
    spG.addColorStop(0, "#3a3a44");
    spG.addColorStop(0.3, "#2c2c36");
    spG.addColorStop(0.6, "#1e1e28");
    spG.addColorStop(1, "#12121c");
    ctx.fillStyle = spG;

    ctx.beginPath();
    ctx.moveTo(x + hSide * size * 0.12, hY - size * 0.32);
    ctx.bezierCurveTo(
      x + hSide * size * 0.3,
      hY - size * 0.36,
      x + hSide * size * 0.48,
      hY - size * 0.22,
      x + hSide * size * 0.48,
      hY + size * 0.0,
    );
    ctx.bezierCurveTo(
      x + hSide * size * 0.48,
      hY + size * 0.18,
      x + hSide * size * 0.4,
      hY + size * 0.28,
      x + hSide * size * 0.25,
      hY + size * 0.3,
    );
    ctx.lineTo(x + hSide * size * 0.2, hY + size * 0.22);
    ctx.bezierCurveTo(
      x + hSide * size * 0.32,
      hY + size * 0.2,
      x + hSide * size * 0.38,
      hY + size * 0.1,
      x + hSide * size * 0.38,
      hY - size * 0.02,
    );
    ctx.bezierCurveTo(
      x + hSide * size * 0.38,
      hY - size * 0.16,
      x + hSide * size * 0.28,
      hY - size * 0.28,
      x + hSide * size * 0.1,
      hY - size * 0.26,
    );
    ctx.closePath();
    ctx.fill();

    // Gold outer edge trim
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + hSide * size * 0.12, hY - size * 0.32);
    ctx.bezierCurveTo(
      x + hSide * size * 0.3,
      hY - size * 0.36,
      x + hSide * size * 0.48,
      hY - size * 0.22,
      x + hSide * size * 0.48,
      hY + size * 0.0,
    );
    ctx.bezierCurveTo(
      x + hSide * size * 0.48,
      hY + size * 0.18,
      x + hSide * size * 0.4,
      hY + size * 0.28,
      x + hSide * size * 0.25,
      hY + size * 0.3,
    );
    ctx.stroke();

    // 3D highlight arc (upper-left catch light)
    ctx.strokeStyle = "rgba(90, 90, 110, 0.5)";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + hSide * size * 0.14, hY - size * 0.31);
    ctx.bezierCurveTo(
      x + hSide * size * 0.28,
      hY - size * 0.34,
      x + hSide * size * 0.44,
      hY - size * 0.2,
      x + hSide * size * 0.44,
      hY - size * 0.02,
    );
    ctx.stroke();
    // 3D shadow on inner edge
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + hSide * size * 0.22, hY + size * 0.21);
    ctx.bezierCurveTo(
      x + hSide * size * 0.34,
      hY + size * 0.18,
      x + hSide * size * 0.38,
      hY + size * 0.06,
      x + hSide * size * 0.36,
      hY - size * 0.06,
    );
    ctx.stroke();

    // Gold rivets along the plate
    ctx.fillStyle = "#daa520";
    const rvPts = [
      [x + hSide * size * 0.42, hY - size * 0.12],
      [x + hSide * size * 0.44, hY + size * 0.04],
      [x + hSide * size * 0.4, hY + size * 0.18],
    ];
    for (const [rvx, rvy] of rvPts) {
      const rvG = ctx.createRadialGradient(
        rvx - size * 0.003,
        rvy - size * 0.003,
        0,
        rvx,
        rvy,
        size * 0.013,
      );
      rvG.addColorStop(0, "#f0d860");
      rvG.addColorStop(0.5, "#daa520");
      rvG.addColorStop(1, "#8a7010");
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(rvx, rvy, size * 0.013, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Cheek guards (bucculae — hanging plates) ---
  for (let cSide = -1; cSide <= 1; cSide += 2) {
    const cgG = ctx.createLinearGradient(
      x + cSide * size * 0.44,
      hY + size * 0.05,
      x + cSide * size * 0.34,
      hY + size * 0.32,
    );
    cgG.addColorStop(0, "#2c2c36");
    cgG.addColorStop(0.3, "#222230");
    cgG.addColorStop(0.7, "#1a1a26");
    cgG.addColorStop(1, "#14141e");
    ctx.fillStyle = cgG;
    ctx.beginPath();
    ctx.moveTo(x + cSide * size * 0.4, hY + size * 0.06);
    ctx.bezierCurveTo(
      x + cSide * size * 0.5,
      hY + size * 0.1,
      x + cSide * size * 0.52,
      hY + size * 0.22,
      x + cSide * size * 0.46,
      hY + size * 0.34,
    );
    ctx.lineTo(x + cSide * size * 0.38, hY + size * 0.32);
    ctx.bezierCurveTo(
      x + cSide * size * 0.42,
      hY + size * 0.22,
      x + cSide * size * 0.42,
      hY + size * 0.12,
      x + cSide * size * 0.36,
      hY + size * 0.08,
    );
    ctx.closePath();
    ctx.fill();
    // Gold trim
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Hinge rivet at top
    const hingeG = ctx.createRadialGradient(
      x + cSide * size * 0.39 - size * 0.003,
      hY + size * 0.07 - size * 0.003,
      0,
      x + cSide * size * 0.39,
      hY + size * 0.07,
      size * 0.016,
    );
    hingeG.addColorStop(0, "#f0d860");
    hingeG.addColorStop(0.5, "#daa520");
    hingeG.addColorStop(1, "#8a7010");
    ctx.fillStyle = hingeG;
    ctx.beginPath();
    ctx.arc(
      x + cSide * size * 0.39,
      hY + size * 0.07,
      size * 0.016,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // 3D highlight on cheek guard
    ctx.strokeStyle = "rgba(80, 80, 100, 0.4)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + cSide * size * 0.41, hY + size * 0.1);
    ctx.bezierCurveTo(
      x + cSide * size * 0.47,
      hY + size * 0.14,
      x + cSide * size * 0.48,
      hY + size * 0.22,
      x + cSide * size * 0.44,
      hY + size * 0.3,
    );
    ctx.stroke();
  }

  // --- Brow guard / visor (extends forward from the front of the helmet) ---
  const browG = ctx.createLinearGradient(
    x,
    hY - size * 0.28,
    x,
    hY - size * 0.36,
  );
  browG.addColorStop(0, "#2a2a34");
  browG.addColorStop(0.4, "#1e1e28");
  browG.addColorStop(1, "#12121c");
  ctx.fillStyle = browG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, hY - size * 0.28);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    hY - size * 0.36,
    x - size * 0.18,
    hY - size * 0.38,
  );
  ctx.lineTo(x + size * 0.18, hY - size * 0.38);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    hY - size * 0.36,
    x + size * 0.22,
    hY - size * 0.28,
  );
  ctx.closePath();
  ctx.fill();
  // Gold trim on visor
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Visor highlight
  ctx.strokeStyle = "rgba(80, 80, 100, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, hY - size * 0.37);
  ctx.lineTo(x + size * 0.16, hY - size * 0.37);
  ctx.stroke();
  // Decorative gold band on visor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, hY - size * 0.31);
  ctx.lineTo(x + size * 0.2, hY - size * 0.31);
  ctx.stroke();

  // --- Gold crest ridge (runs front-to-back along the top) ---
  const crestG = ctx.createLinearGradient(
    x - size * 0.02,
    hY,
    x + size * 0.02,
    hY,
  );
  crestG.addColorStop(0, "#8a7010");
  crestG.addColorStop(0.3, "#daa520");
  crestG.addColorStop(0.5, "#f0d860");
  crestG.addColorStop(0.7, "#daa520");
  crestG.addColorStop(1, "#8a7010");
  ctx.fillStyle = crestG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.025, hY - size * 0.36);
  ctx.lineTo(x - size * 0.03, hY + size * 0.22);
  ctx.quadraticCurveTo(x, hY + size * 0.25, x + size * 0.03, hY + size * 0.22);
  ctx.lineTo(x + size * 0.025, hY - size * 0.36);
  ctx.quadraticCurveTo(x, hY - size * 0.39, x - size * 0.025, hY - size * 0.36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#e8c840";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Crest ridge highlight
  ctx.strokeStyle = "rgba(255, 240, 160, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.015, hY - size * 0.34);
  ctx.lineTo(x - size * 0.018, hY + size * 0.18);
  ctx.stroke();

  // --- Gold crest bracket / plume holder (raised piece at center-front) ---
  const bracketG = ctx.createRadialGradient(
    x - size * 0.005,
    hY - size * 0.3 - size * 0.005,
    0,
    x,
    hY - size * 0.3,
    size * 0.035,
  );
  bracketG.addColorStop(0, "#f0d860");
  bracketG.addColorStop(0.5, "#daa520");
  bracketG.addColorStop(1, "#8a7010");
  ctx.fillStyle = bracketG;
  ctx.beginPath();
  ctx.ellipse(x, hY - size * 0.3, size * 0.035, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e8c840";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // --- Forehead nose guard (nasal — vertical strip down center of face) ---
  const nasalG = ctx.createLinearGradient(
    x - size * 0.02,
    hY,
    x + size * 0.02,
    hY,
  );
  nasalG.addColorStop(0, "#1a1a24");
  nasalG.addColorStop(0.35, "#3a3a44");
  nasalG.addColorStop(0.5, "#4a4a54");
  nasalG.addColorStop(0.65, "#3a3a44");
  nasalG.addColorStop(1, "#1a1a24");
  ctx.fillStyle = nasalG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.025, hY - size * 0.28);
  ctx.lineTo(x - size * 0.02, hY + size * 0.12);
  ctx.quadraticCurveTo(x, hY + size * 0.15, x + size * 0.02, hY + size * 0.12);
  ctx.lineTo(x + size * 0.025, hY - size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // === HEAD FUR DOME above helmet (tiger head poking through open top) ===
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - size * 0.6, hY - size * 0.65, size * 1.2, size * 0.37);
  ctx.clip();
  const headGradAbove = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.48,
  );
  headGradAbove.addColorStop(0, isAttacking ? "#ffbb55" : "#ffaa44");
  headGradAbove.addColorStop(0.4, isAttacking ? "#ff9933" : "#ff8822");
  headGradAbove.addColorStop(0.7, "#dd5500");
  headGradAbove.addColorStop(1, "#aa3300");
  ctx.fillStyle = headGradAbove;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.4, size * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();
  drawTigerFurEdge(
    ctx,
    headX,
    headY,
    size * 0.4,
    size * 0.46,
    20,
    size * 0.04,
    time,
    zoom,
  );
  ctx.restore();

  // === HEAD STRIPES (matching sprite: center + curved side stripes) ===
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 3 * zoom;
  ctx.lineCap = "round";

  // Center forehead stripe (prominent in sprite)
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.82);
  ctx.lineTo(x, y - size * 0.6);
  ctx.stroke();

  // Curved side stripes (like sprite)
  for (let side = -1; side <= 1; side += 2) {
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.08, y - size * 0.78);
    ctx.quadraticCurveTo(
      x + side * size * 0.1,
      y - size * 0.65,
      x + side * size * 0.08,
      y - size * 0.55,
    );
    ctx.stroke();

    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.16, y - size * 0.72);
    ctx.quadraticCurveTo(
      x + side * size * 0.2,
      y - size * 0.62,
      x + side * size * 0.22,
      y - size * 0.52,
    );
    ctx.stroke();
  }

  // Cheek stripes
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.58);
  ctx.lineTo(x - size * 0.25, y - size * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.5);
  ctx.lineTo(x - size * 0.22, y - size * 0.46);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.38, y - size * 0.58);
  ctx.lineTo(x + size * 0.25, y - size * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.36, y - size * 0.5);
  ctx.lineTo(x + size * 0.22, y - size * 0.46);
  ctx.stroke();

  // === FIERCE POINTED EARS WITH ARMOR ===
  for (let side = -1; side <= 1; side += 2) {
    // Ear base
    ctx.fillStyle = "#dd6600";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.28, y - size * 0.72);
    ctx.lineTo(x + side * size * 0.42, y - size * 1.0);
    ctx.lineTo(x + side * size * 0.18, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Dark ear tips
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.36, y - size * 0.9);
    ctx.lineTo(x + side * size * 0.42, y - size * 1.0);
    ctx.lineTo(x + side * size * 0.32, y - size * 0.88);
    ctx.closePath();
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#ffccaa";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.27, y - size * 0.74);
    ctx.lineTo(x + side * size * 0.35, y - size * 0.88);
    ctx.lineTo(x + side * size * 0.2, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Ear armor ring
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.3,
      y - size * 0.78,
      size * 0.025,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === GOLD CROWN (sits atop the head, above the helmet) ===
  {
    const crY = y - size * 0.74;
    const crHW = size * 0.22;
    const crH = size * 0.18;
    const points = 5;

    // Crown base band
    const crBaseG = ctx.createLinearGradient(x - crHW, crY, x + crHW, crY);
    crBaseG.addColorStop(0, "#8a7010");
    crBaseG.addColorStop(0.2, "#c9a227");
    crBaseG.addColorStop(0.4, "#e8c840");
    crBaseG.addColorStop(0.5, "#f0d860");
    crBaseG.addColorStop(0.6, "#e8c840");
    crBaseG.addColorStop(0.8, "#c9a227");
    crBaseG.addColorStop(1, "#8a7010");
    ctx.fillStyle = crBaseG;
    ctx.beginPath();
    ctx.moveTo(x - crHW, crY);
    ctx.lineTo(x + crHW, crY);
    ctx.lineTo(x + crHW, crY + size * 0.05);
    ctx.lineTo(x - crHW, crY + size * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f0d860";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Crown points (tines)
    const crPtG = ctx.createLinearGradient(x, crY - crH, x, crY);
    crPtG.addColorStop(0, "#f8e880");
    crPtG.addColorStop(0.3, "#e8c840");
    crPtG.addColorStop(0.6, "#daa520");
    crPtG.addColorStop(1, "#c9a227");
    ctx.fillStyle = crPtG;
    ctx.beginPath();
    ctx.moveTo(x - crHW, crY);
    for (let p = 0; p < points; p++) {
      const t = p / (points - 1);
      const px = x - crHW + t * crHW * 2;
      const tipH =
        p === Math.floor(points / 2)
          ? crH * 1.15
          : crH * (0.75 + Math.abs(t - 0.5) * 0.4);
      ctx.lineTo(px, crY - tipH);
      if (p < points - 1) {
        const midX = px + ((crHW * 2) / (points - 1)) * 0.5;
        ctx.lineTo(midX, crY - crH * 0.2);
      }
    }
    ctx.lineTo(x + crHW, crY);
    ctx.closePath();
    ctx.fill();
    // Crown outline
    ctx.strokeStyle = "#8a7010";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Highlight on left edges
    ctx.strokeStyle = "rgba(255, 240, 160, 0.5)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - crHW, crY);
    for (let p = 0; p < 3; p++) {
      const t = p / (points - 1);
      const px = x - crHW + t * crHW * 2;
      const tipH =
        p === Math.floor(points / 2)
          ? crH * 1.15
          : crH * (0.75 + Math.abs(t - 0.5) * 0.4);
      ctx.lineTo(px, crY - tipH);
      if (p < 2) {
        const midX = px + ((crHW * 2) / (points - 1)) * 0.5;
        ctx.lineTo(midX, crY - crH * 0.2);
      }
    }
    ctx.stroke();

    // Gems on each crown point
    ctx.shadowColor = "#ff2200";
    ctx.shadowBlur = 6 * zoom * gemPulse;
    for (let p = 0; p < points; p++) {
      const t = p / (points - 1);
      const gx = x - crHW + t * crHW * 2;
      const tipH =
        p === Math.floor(points / 2)
          ? crH * 1.15
          : crH * (0.75 + Math.abs(t - 0.5) * 0.4);
      const gy = crY - tipH + size * 0.035;
      const gemR = p === Math.floor(points / 2) ? size * 0.022 : size * 0.016;

      const crGemG = ctx.createRadialGradient(
        gx - gemR * 0.3,
        gy - gemR * 0.3,
        0,
        gx,
        gy,
        gemR,
      );
      crGemG.addColorStop(0, "#ff6060");
      crGemG.addColorStop(0.4, "#ee2020");
      crGemG.addColorStop(1, "#880000");
      ctx.fillStyle = crGemG;
      ctx.beginPath();
      ctx.arc(gx, gy, gemR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Crown base band rivets
    ctx.fillStyle = "#f0d860";
    for (let br = 0; br < 7; br++) {
      const brX = x - crHW + size * 0.03 + (br * (crHW * 2 - size * 0.06)) / 6;
      ctx.beginPath();
      ctx.arc(brX, crY + size * 0.025, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === MUZZLE ===
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.44, size * 0.18, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Whisker dots (prominent white)
  ctx.fillStyle = "#ffffff";
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const dotX = x + side * (size * 0.06 + col * size * 0.035);
        const dotY = y - size * 0.46 + row * size * 0.03;
        ctx.beginPath();
        ctx.arc(dotX, dotY, size * 0.012, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawTigerWhiskerLines(ctx, x, y, size, time, zoom);

  // Nose (larger, more fierce)
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  ctx.lineTo(x - size * 0.08, y - size * 0.44);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.08, y - size * 0.44);
  ctx.closePath();
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "#3a2a20";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.02,
    y - size * 0.48,
    size * 0.015,
    size * 0.01,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  drawTigerChinFur(ctx, x, y, size, time, zoom);

  // === GLOWING FIERCE EYES ===
  const eyeGlow = 0.9 + Math.sin(time * 4) * 0.1 + attackIntensity * 0.3;
  const eyeY = y - size * 0.62 + breathe * 0.08; // Eyes move slightly with breathing

  // Eye socket shadows — tilts swapped inward for predatory look
  ctx.fillStyle = "#0a1505";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    eyeY,
    size * 0.11,
    size * 0.085,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    eyeY,
    size * 0.11,
    size * 0.085,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing eyes - GREEN normally, RED when attacking (tilts angled inward)
  ctx.shadowColor = isAttacking ? "#ff2200" : "#66ff33";
  ctx.shadowBlur = (isAttacking ? 25 + attackIntensity * 20 : 12) * zoom;
  ctx.fillStyle = isAttacking
    ? `rgba(255, 60, 20, ${eyeGlow})`
    : `rgba(140, 230, 60, ${eyeGlow})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    eyeY,
    size * (0.1 + attackIntensity * 0.015),
    size * (0.07 + attackIntensity * 0.01),
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    eyeY,
    size * (0.1 + attackIntensity * 0.015),
    size * (0.07 + attackIntensity * 0.01),
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  drawTigerEyeIris(ctx, x, eyeY, size, zoom, isAttacking);

  // Predatory V-shaped brow ridges (outer ends high, sloping down to center)
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.71);
  ctx.quadraticCurveTo(
    x - size * 0.18,
    y - size * 0.67,
    x - size * 0.06,
    y - size * 0.635,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.26, y - size * 0.71);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.67,
    x + size * 0.06,
    y - size * 0.635,
  );
  ctx.stroke();

  // Slit pupils (menacing) - narrow during attack
  const pupilWidth = isAttacking ? size * 0.018 : size * 0.025;
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    eyeY,
    pupilWidth,
    size * 0.06,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    eyeY,
    pupilWidth,
    size * 0.06,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye glints (positioned on inner-upper edge for predatory look)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, eyeY - size * 0.025, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.12, eyeY - size * 0.025, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // === ROARING MOUTH ===
  const mouthOpen = isAttacking
    ? size * 0.06 + attackIntensity * size * 0.08
    : size * 0.04;

  // Mouth interior
  ctx.fillStyle = "#2a0000";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.34,
    size * 0.14 + attackIntensity * 0.04,
    mouthOpen,
    0,
    0,
    Math.PI,
  );
  ctx.fill();

  // Tongue
  ctx.fillStyle = "#cc4466";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.32 + mouthOpen * 0.4,
    size * 0.08,
    size * 0.04,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  drawTigerExtraTeeth(ctx, x, y, size, attackIntensity, mouthOpen);

  // === MASSIVE FANGS ===
  ctx.fillStyle = "#fffff8";
  // Left fang
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.4);
  ctx.lineTo(x - size * 0.06, y - size * 0.26 + attackIntensity * size * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Right fang
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.4);
  ctx.lineTo(x + size * 0.06, y - size * 0.26 + attackIntensity * size * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Fang highlights
  ctx.strokeStyle = "rgba(200, 200, 200, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.38);
  ctx.lineTo(x - size * 0.06, y - size * 0.28);
  ctx.moveTo(x + size * 0.08, y - size * 0.38);
  ctx.lineTo(x + size * 0.06, y - size * 0.28);
  ctx.stroke();

  ctx.restore();

  // === BATTLE ROAR EFFECT ===
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.65) {
    const roarProgress = (attackPhase - 0.15) / 0.5;
    const roarAlpha = Math.sin(roarProgress * Math.PI) * 0.6;
    for (let w = 0; w < 4; w++) {
      const waveRadius = size * 0.4 + w * size * 0.2 * roarProgress;
      ctx.strokeStyle =
        w % 2 === 0
          ? `rgba(255, 150, 0, ${roarAlpha * (1 - w * 0.2)})`
          : `rgba(255, 80, 0, ${roarAlpha * (1 - w * 0.2)})`;
      ctx.lineWidth = (4 - w * 0.8) * zoom;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.45, waveRadius, -0.9, 0.9);
      ctx.stroke();
    }
  }
}
