import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

function drawFurMantle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
) {
  const mantleCenterY = y - size * 0.42;
  const mantleHalfW = size * 0.52;
  const mantleHalfH = size * 0.22;

  const mantleGrad = ctx.createRadialGradient(
    x, mantleCenterY, size * 0.08,
    x, mantleCenterY, mantleHalfW,
  );
  mantleGrad.addColorStop(0, "#5e4e3c");
  mantleGrad.addColorStop(0.35, "#4e3e2c");
  mantleGrad.addColorStop(0.7, "#3e2e1c");
  mantleGrad.addColorStop(1, "#2e1e0e");
  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.ellipse(x, mantleCenterY, mantleHalfW, mantleHalfH, 0, 0, Math.PI * 2);
  ctx.fill();

  const clumpCount = 28;
  for (let i = 0; i < clumpCount; i++) {
    const angle = (i / clumpCount) * Math.PI * 2;
    const wobble = Math.sin(time * 1.0 + i * 2.1) * size * 0.006;
    const baseX = x + Math.cos(angle) * (mantleHalfW + wobble);
    const baseY = mantleCenterY + Math.sin(angle) * (mantleHalfH + wobble * 0.5);
    const tuftLen = size * (0.07 + Math.sin(i * 1.9 + 0.5) * 0.03);
    const tuftAngle = angle + Math.sin(time * 1.3 + i * 0.7) * 0.12;
    const dirX = Math.cos(tuftAngle);
    const dirY = Math.sin(tuftAngle) * 0.5;

    ctx.strokeStyle = i % 4 === 0 ? "#6e5e4a" : i % 4 === 1 ? "#4e3e28" : i % 4 === 2 ? "#5e4e3a" : "#584832";
    ctx.lineWidth = (2.8 - (i % 3) * 0.6) * zoom;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(
      baseX + dirX * tuftLen * 0.55 + Math.sin(i * 1.4) * size * 0.012,
      baseY + dirY * tuftLen * 0.55,
      baseX + dirX * tuftLen,
      baseY + dirY * tuftLen,
    );
    ctx.stroke();
  }

  const innerGrad = ctx.createRadialGradient(
    x, mantleCenterY, size * 0.04,
    x, mantleCenterY, mantleHalfW * 0.72,
  );
  innerGrad.addColorStop(0, "#6e5e4c");
  innerGrad.addColorStop(0.4, "#5e4e3c");
  innerGrad.addColorStop(1, "#4e3e2c");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.ellipse(x, mantleCenterY, mantleHalfW * 0.75, mantleHalfH * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(110, 95, 72, 0.35)";
  ctx.lineWidth = 0.7 * zoom;
  const strandCount = 36;
  for (let i = 0; i < strandCount; i++) {
    const angle = (i / strandCount) * Math.PI * 2;
    const innerR = 0.5 + Math.sin(i * 2.9 + 1.2) * 0.1;
    const outerR = 0.82 + Math.sin(i * 2.3 + 0.7) * 0.08;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(angle) * mantleHalfW * innerR,
      mantleCenterY + Math.sin(angle) * mantleHalfH * innerR,
    );
    ctx.lineTo(
      x + Math.cos(angle + 0.06) * mantleHalfW * outerR,
      mantleCenterY + Math.sin(angle + 0.06) * mantleHalfH * outerR,
    );
    ctx.stroke();
  }

  const puffCount = 10;
  for (let i = 0; i < puffCount; i++) {
    const t = (i / (puffCount - 1)) * 2 - 1;
    const puffX = x + t * mantleHalfW * 0.85;
    const puffY = mantleCenterY - mantleHalfH * 0.4 * (1 - t * t) + Math.sin(time * 1.1 + i * 1.5) * size * 0.005;
    const puffR = size * (0.06 + (1 - Math.abs(t)) * 0.04);

    const puffGrad = ctx.createRadialGradient(
      puffX - size * 0.01, puffY - size * 0.01, 0,
      puffX, puffY, puffR,
    );
    puffGrad.addColorStop(0, "#6e5e4c");
    puffGrad.addColorStop(0.5, "#564636");
    puffGrad.addColorStop(1, "#3e2e1c");
    ctx.fillStyle = puffGrad;
    ctx.beginPath();
    ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#2e1e0e";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, mantleCenterY, mantleHalfW, mantleHalfH, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function furHash(i: number, seed: number): number {
  const v = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function drawFurCollar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
) {
  const collarY = y - size * 0.28;
  const baseW = size * 0.42;
  const baseH = size * 0.18;

  // Layer 1: Large irregular clumps forming the bulk
  const clumpCount = 16;
  for (let i = 0; i < clumpCount; i++) {
    const angle = (i / clumpCount) * Math.PI * 2 + furHash(i, 1) * 0.35;
    const radW = baseW * (0.75 + furHash(i, 2) * 0.45);
    const radH = baseH * (0.6 + furHash(i, 3) * 0.7);
    const cx = x + Math.cos(angle) * radW * 0.55 + (furHash(i, 4) - 0.5) * size * 0.08;
    const cy = collarY + Math.sin(angle) * radH * 0.5 + (furHash(i, 5) - 0.5) * size * 0.04;
    const clumpR = size * (0.07 + furHash(i, 6) * 0.06);
    const squash = 0.5 + furHash(i, 7) * 0.8;
    const tilt = (furHash(i, 8) - 0.5) * 1.2;

    const cGrad = ctx.createRadialGradient(
      cx - size * 0.01, cy - size * 0.01, 0,
      cx, cy, clumpR,
    );
    const shade = 40 + Math.floor(furHash(i, 9) * 30);
    cGrad.addColorStop(0, `rgb(${shade + 30}, ${shade + 18}, ${shade + 6})`);
    cGrad.addColorStop(0.6, `rgb(${shade + 15}, ${shade + 8}, ${shade})`);
    cGrad.addColorStop(1, `rgb(${shade}, ${shade - 8}, ${shade - 16})`);
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, clumpR, clumpR * squash, tilt, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 2: Smaller overlapping puffs for volume and irregularity
  const puffCount = 22;
  for (let i = 0; i < puffCount; i++) {
    const angle = (i / puffCount) * Math.PI * 2 + furHash(i, 20) * 0.5;
    const distW = baseW * (0.5 + furHash(i, 21) * 0.55);
    const distH = baseH * (0.35 + furHash(i, 22) * 0.65);
    const px = x + Math.cos(angle) * distW + (furHash(i, 23) - 0.5) * size * 0.06;
    const py = collarY + Math.sin(angle) * distH + (furHash(i, 24) - 0.5) * size * 0.035;
    const pr = size * (0.035 + furHash(i, 25) * 0.045);
    const psquash = 0.4 + furHash(i, 26) * 0.9;
    const ptilt = (furHash(i, 27) - 0.5) * 1.5;

    const shade = 45 + Math.floor(furHash(i, 28) * 35);
    ctx.fillStyle = `rgb(${shade + 25}, ${shade + 14}, ${shade + 4})`;
    ctx.beginPath();
    ctx.ellipse(px, py, pr, pr * psquash, ptilt, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 3: Wispy tufts radiating outward with high variety
  const tuftCount = 30;
  for (let i = 0; i < tuftCount; i++) {
    const angle = (i / tuftCount) * Math.PI * 2 + furHash(i, 40) * 0.6;
    const edgeW = baseW * (0.8 + furHash(i, 41) * 0.4);
    const edgeH = baseH * (0.7 + furHash(i, 42) * 0.5);
    const bx = x + Math.cos(angle) * edgeW + (furHash(i, 43) - 0.5) * size * 0.05;
    const by = collarY + Math.sin(angle) * edgeH;
    const tuftLen = size * (0.04 + furHash(i, 44) * 0.06);
    const curve = (furHash(i, 45) - 0.5) * size * 0.04;
    const tuftAngle = angle + (furHash(i, 46) - 0.5) * 0.8 + Math.sin(time * 1.3 + i * 0.9) * 0.1;
    const dx = Math.cos(tuftAngle);
    const dy = Math.sin(tuftAngle) * 0.5;

    const shade = 55 + Math.floor(furHash(i, 47) * 40);
    ctx.strokeStyle = `rgb(${shade + 15}, ${shade + 5}, ${shade - 8})`;
    ctx.lineWidth = (1.5 + furHash(i, 48) * 2.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + dx * tuftLen * 0.5 + curve,
      by + dy * tuftLen * 0.5 + curve * 0.3,
      bx + dx * tuftLen,
      by + dy * tuftLen,
    );
    ctx.stroke();
  }

  // Layer 4: Fine fur strands across the surface
  const strandCount = 40;
  ctx.lineWidth = 0.7 * zoom;
  for (let i = 0; i < strandCount; i++) {
    const sx = x + (furHash(i, 60) - 0.5) * baseW * 1.5;
    const sy = collarY + (furHash(i, 61) - 0.5) * baseH * 1.2;
    const sAngle = furHash(i, 62) * Math.PI * 2;
    const sLen = size * (0.02 + furHash(i, 63) * 0.035);
    const shade = 60 + Math.floor(furHash(i, 64) * 30);
    ctx.strokeStyle = `rgba(${shade + 20}, ${shade + 10}, ${shade}, 0.4)`;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(sAngle) * sLen, sy + Math.sin(sAngle) * sLen * 0.5);
    ctx.stroke();
  }

  // Layer 5: Highlight puffs on top for volume
  const highlightCount = 8;
  for (let i = 0; i < highlightCount; i++) {
    const angle = (i / highlightCount) * Math.PI * 2 + furHash(i, 80) * 0.7;
    const hx = x + Math.cos(angle) * baseW * (0.3 + furHash(i, 81) * 0.35);
    const hy = collarY + Math.sin(angle) * baseH * (0.2 + furHash(i, 82) * 0.3);
    const hr = size * (0.03 + furHash(i, 83) * 0.03);
    const hsquash = 0.5 + furHash(i, 84) * 0.7;
    const htilt = furHash(i, 85) * Math.PI;

    const hGrad = ctx.createRadialGradient(
      hx - size * 0.005, hy - size * 0.005, 0,
      hx, hy, hr,
    );
    hGrad.addColorStop(0, "rgba(120, 105, 85, 0.6)");
    hGrad.addColorStop(0.5, "rgba(95, 80, 60, 0.35)");
    hGrad.addColorStop(1, "rgba(70, 58, 42, 0)");
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.ellipse(hx, hy, hr, hr * hsquash, htilt, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFrostSkirtArmor(
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
  const skirtTop = y + size * 0.30;
  const bandCount = 5;
  const totalHeight = size * 0.38;
  const gapHalf = size * 0.12;

  drawFrostCenterBanner(ctx, x, y, size, time, zoom, skirtTop, totalHeight, gapHalf, gemPulse);

  for (let side = -1; side <= 1; side += 2) {
    drawFrostTassetSide(ctx, x, y, size, time, zoom, side, skirtTop, bandCount, totalHeight, gapHalf, gemPulse, isAttacking, attackIntensity);
  }

  drawFrostChain(ctx, x, size, zoom, skirtTop, gapHalf, gemPulse, time);
  drawFrostSkirtBelt(ctx, x, size, zoom, skirtTop, gemPulse);
}

function drawFrostTassetSide(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
  size: number,
  time: number,
  zoom: number,
  side: number,
  skirtTop: number,
  bandCount: number,
  totalHeight: number,
  gapHalf: number,
  gemPulse: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const shear = size * -0.12;
  const bandHeight = totalHeight / bandCount;

  for (let band = 0; band < bandCount; band++) {
    const innerTopY = skirtTop + band * bandHeight;
    const innerBotY = innerTopY + bandHeight;
    const outerTopY = innerTopY + shear;
    const outerBotY = innerBotY + shear;

    const outerW = size * (0.42 + band * 0.035);
    const innerGap = gapHalf + band * size * 0.008;
    const sway =
      Math.sin(time * 1.5 + band * 0.7 + side * 0.4) * size * 0.003 * (band + 1);

    const innerX = x + side * innerGap + sway;
    const outerX = x + side * outerW + sway;

    const plateG = ctx.createLinearGradient(innerX, innerTopY, outerX, outerBotY);
    if (side === -1) {
      plateG.addColorStop(0, "#454560");
      plateG.addColorStop(0.25, "#353548");
      plateG.addColorStop(0.55, "#252535");
      plateG.addColorStop(1, "#252535");
    } else {
      plateG.addColorStop(0, "#252535");
      plateG.addColorStop(0.45, "#252535");
      plateG.addColorStop(0.75, "#353548");
      plateG.addColorStop(1, "#454560");
    }

    ctx.fillStyle = plateG;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(128, 192, 255, ${0.25 + gemPulse * 0.2})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX + side * size * 0.005, innerTopY + size * 0.002);
    ctx.lineTo(outerX - side * size * 0.005, outerTopY + size * 0.002);
    ctx.stroke();

    ctx.strokeStyle = "#151525";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX - side * size * 0.002, innerBotY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.stroke();

    ctx.strokeStyle = "#151525";
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
    const rivetY = innerTopY + rivetMidT * (outerTopY - innerTopY) + bandHeight * 0.45;
    const rg = ctx.createRadialGradient(
      rivetX - size * 0.002, rivetY - size * 0.002, 0,
      rivetX, rivetY, size * 0.009,
    );
    rg.addColorStop(0, "#d0e8f5");
    rg.addColorStop(0.4, "#a0c0d8");
    rg.addColorStop(1, "#6898b0");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    if (band % 2 === 0) {
      ctx.fillStyle = "#555570";
      const scaleCount = 2 + Math.floor(band / 2);
      for (let sc = 0; sc < scaleCount; sc++) {
        const t = (sc + 0.5) / scaleCount;
        const scaleX = innerX + t * (outerX - innerX);
        const scaleYBase = innerTopY + t * (outerTopY - innerTopY) + bandHeight * 0.4;
        const scaleSize = size * 0.026;
        ctx.beginPath();
        ctx.moveTo(scaleX, scaleYBase - scaleSize * 0.3);
        ctx.quadraticCurveTo(scaleX + scaleSize, scaleYBase, scaleX, scaleYBase + scaleSize * 0.6);
        ctx.quadraticCurveTo(scaleX - scaleSize, scaleYBase, scaleX, scaleYBase - scaleSize * 0.3);
        ctx.fill();
      }
    }

    if (band % 2 === 1) {
      const midT = 0.5;
      const accentInnerX = innerX + side * size * 0.015;
      const accentOuterX = outerX - side * size * 0.015;
      const accentInnerY = innerTopY + bandHeight * midT;
      const accentOuterY = outerTopY + bandHeight * midT;
      ctx.strokeStyle = `rgba(128, 192, 255, ${0.25 + gemPulse * 0.15})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.shadowColor = "#80c0ff";
      ctx.shadowBlur = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(accentInnerX, accentInnerY);
      ctx.lineTo(accentOuterX, accentOuterY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}

function drawFrostCenterBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
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
  bannerGrad.addColorStop(0, "#1a2040");
  bannerGrad.addColorStop(0.15, "#253060");
  bannerGrad.addColorStop(0.4, "#304080");
  bannerGrad.addColorStop(0.7, "#253060");
  bannerGrad.addColorStop(1, "#1a2040");
  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  ctx.moveTo(x - bannerHalfW, bannerTop);
  ctx.lineTo(x + bannerHalfW, bannerTop);
  ctx.bezierCurveTo(
    x + bannerHalfW + wave, bannerTop + (bannerBottom - bannerTop) * 0.35,
    x + bannerHalfW * 0.9 + wave2, bannerTop + (bannerBottom - bannerTop) * 0.65,
    x + bannerHalfW * 0.85, bannerBottom,
  );
  ctx.lineTo(x + size * 0.015, bannerBottom - size * 0.04);
  ctx.lineTo(x - size * 0.015, bannerBottom - size * 0.04);
  ctx.lineTo(x - bannerHalfW * 0.85, bannerBottom);
  ctx.bezierCurveTo(
    x - bannerHalfW * 0.9 - wave2, bannerTop + (bannerBottom - bannerTop) * 0.65,
    x - bannerHalfW - wave, bannerTop + (bannerBottom - bannerTop) * 0.35,
    x - bannerHalfW, bannerTop,
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  const emblemY = (bannerTop + bannerBottom) * 0.5 - size * 0.03;
  ctx.strokeStyle = `rgba(128, 192, 255, ${0.5 + gemPulse * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, emblemY - size * 0.05);
  ctx.lineTo(x + size * 0.02, emblemY);
  ctx.lineTo(x, emblemY + size * 0.05);
  ctx.lineTo(x - size * 0.02, emblemY);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.025, emblemY - size * 0.025);
  ctx.lineTo(x + size * 0.025, emblemY + size * 0.025);
  ctx.moveTo(x - size * 0.025, emblemY + size * 0.025);
  ctx.lineTo(x + size * 0.025, emblemY - size * 0.025);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.018, emblemY);
  ctx.lineTo(x + size * 0.018, emblemY);
  ctx.moveTo(x, emblemY - size * 0.018);
  ctx.lineTo(x, emblemY + size * 0.018);
  ctx.stroke();

  ctx.fillStyle = "#80c0ff";
  ctx.shadowColor = "#80c0ff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, emblemY, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawFrostChain(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  zoom: number,
  skirtTop: number,
  gapHalf: number,
  gemPulse: number,
  time: number,
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
      lx - size * 0.002, ly - size * 0.002, 0,
      lx, ly, size * 0.012,
    );
    linkGrad.addColorStop(0, "#a0c0d8");
    linkGrad.addColorStop(0.5, "#80b0c8");
    linkGrad.addColorStop(1, "#6090a8");
    ctx.fillStyle = linkGrad;
    ctx.beginPath();
    const linkW = size * 0.011;
    const linkH = size * 0.007;
    const angle = i % 2 === 0 ? 0.3 : -0.3;
    ctx.ellipse(lx, ly, linkW, linkH, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#405060";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(128, 192, 255, ${0.5 + gemPulse * 0.2})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.shadowColor = "#80c0ff";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.moveTo(leftAnchor, chainY);
  ctx.quadraticCurveTo(x, chainY + sag, rightAnchor, chainY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (let side = -1; side <= 1; side += 2) {
    const anchorX = side === -1 ? leftAnchor : rightAnchor;
    ctx.fillStyle = "#80b0c8";
    ctx.shadowColor = "#80c0ff";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(anchorX, chainY, size * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6090a8";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawFrostSkirtBelt(
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
    x - beltHalfW, skirtTop, x + beltHalfW, skirtTop,
  );
  beltGrad.addColorStop(0, "#303048");
  beltGrad.addColorStop(0.25, "#505070");
  beltGrad.addColorStop(0.5, "#707098");
  beltGrad.addColorStop(0.75, "#505070");
  beltGrad.addColorStop(1, "#303048");

  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW + size * 0.01, skirtTop - beltThick * 0.5 + size * 0.004);
  ctx.lineTo(x + beltHalfW - size * 0.01, skirtTop - beltThick * 0.5 + size * 0.004);
  ctx.stroke();

  ctx.fillStyle = "#80c0ff";
  ctx.shadowColor = "#80c0ff";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, skirtTop + vDip * 0.35, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a0e0ff";
  ctx.beginPath();
  ctx.arc(x - size * 0.008, skirtTop + vDip * 0.35 - size * 0.008, size * 0.013, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawMatheyKnightHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  // COLOSSAL JUGGERNAUT KNIGHT - Massive heavily armored warrior with devastating war hammer
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const heavyStance = Math.sin(time * 1.5) * 1.5; // Slower, heavier movement
  const breathe = Math.sin(time * 1.8) * 1.5;
  const gemPulse = Math.sin(time * 2) * 0.3 + 0.7;

  // === MULTI-LAYERED FROST/STEEL AURA ===
  const auraIntensity = isAttacking ? 0.55 : 0.28;
  const auraPulse = 0.85 + Math.sin(time * 2.5) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x, y, size * (0.12 + layerOffset),
      x, y, size * (1.0 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(0, `rgba(100, 180, 255, ${auraIntensity * auraPulse * (0.45 - auraLayer * 0.1)})`);
    auraGrad.addColorStop(0.4, `rgba(150, 200, 255, ${auraIntensity * auraPulse * (0.3 - auraLayer * 0.06)})`);
    auraGrad.addColorStop(0.7, `rgba(200, 220, 255, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.03)})`);
    auraGrad.addColorStop(1, "rgba(100, 180, 255, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * (0.95 + layerOffset * 0.2), size * (0.65 + layerOffset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating frost/steel particles
  for (let p = 0; p < 12; p++) {
    const pAngle = (time * 0.8 + p * Math.PI * 0.167) % (Math.PI * 2);
    const pDist = size * 0.7 + Math.sin(time * 1.5 + p * 0.6) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.5;
    const pAlpha = 0.55 + Math.sin(time * 3 + p * 0.4) * 0.3;
    // Ice crystal particle
    ctx.fillStyle = p % 3 === 0 ? `rgba(200, 230, 255, ${pAlpha})` : `rgba(100, 180, 255, ${pAlpha})`;
    ctx.beginPath();
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 2 + p);
    // Diamond shape
    ctx.moveTo(0, -size * 0.025);
    ctx.lineTo(size * 0.015, 0);
    ctx.lineTo(0, size * 0.025);
    ctx.lineTo(-size * 0.015, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }


  // === MASSIVE BULKY PLATE ARMOR BODY ===
  // This knight is significantly wider and heavier
  const armorGrad = ctx.createLinearGradient(x - size * 0.55, y - size * 0.35, x + size * 0.55, y + size * 0.45);
  armorGrad.addColorStop(0, "#252535");
  armorGrad.addColorStop(0.1, "#404058");
  armorGrad.addColorStop(0.25, "#505070");
  armorGrad.addColorStop(0.4, "#606088");
  armorGrad.addColorStop(0.5, "#707098");
  armorGrad.addColorStop(0.6, "#606088");
  armorGrad.addColorStop(0.75, "#505070");
  armorGrad.addColorStop(0.9, "#404058");
  armorGrad.addColorStop(1, "#252535");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  // Much wider, bulkier body shape
  ctx.moveTo(x - size * 0.52, y + size * 0.55 + breathe);
  ctx.lineTo(x - size * 0.58, y + size * 0.1);
  ctx.lineTo(x - size * 0.55, y - size * 0.15);
  ctx.lineTo(x - size * 0.4, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.4, y - size * 0.32);
  ctx.lineTo(x + size * 0.55, y - size * 0.15);
  ctx.lineTo(x + size * 0.58, y + size * 0.1);
  ctx.lineTo(x + size * 0.52, y + size * 0.55 + breathe);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight (left side)
  ctx.strokeStyle = "#8888aa";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y + size * 0.53 + breathe);
  ctx.lineTo(x - size * 0.56, y + size * 0.08);
  ctx.lineTo(x - size * 0.53, y - size * 0.13);
  ctx.lineTo(x - size * 0.38, y - size * 0.3);
  ctx.stroke();

  // Armor border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y + size * 0.55 + breathe);
  ctx.lineTo(x - size * 0.58, y + size * 0.1);
  ctx.lineTo(x - size * 0.55, y - size * 0.15);
  ctx.lineTo(x - size * 0.4, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.4, y - size * 0.32);
  ctx.lineTo(x + size * 0.55, y - size * 0.15);
  ctx.lineTo(x + size * 0.58, y + size * 0.1);
  ctx.lineTo(x + size * 0.52, y + size * 0.55 + breathe);
  ctx.closePath();
  ctx.stroke();

  // Heavy armor plate segments
  ctx.strokeStyle = "#303048";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  // Horizontal segments
  ctx.moveTo(x - size * 0.48, y - size * 0.08);
  ctx.lineTo(x + size * 0.48, y - size * 0.08);
  ctx.moveTo(x - size * 0.46, y + size * 0.12);
  ctx.lineTo(x + size * 0.46, y + size * 0.12);
  ctx.moveTo(x - size * 0.44, y + size * 0.32);
  ctx.lineTo(x + size * 0.44, y + size * 0.32);
  // Center vertical line
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x, y + size * 0.52);
  ctx.stroke();

  // Ice blue filigree patterns on armor
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  // Left ornate pattern
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.2);
  ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.05, x - size * 0.38, y + size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.32, y + size * 0.15, x - size * 0.38, y + size * 0.25);
  ctx.stroke();
  // Right ornate pattern
  ctx.beginPath();
  ctx.moveTo(x + size * 0.38, y - size * 0.2);
  ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.05, x + size * 0.38, y + size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.32, y + size * 0.15, x + size * 0.38, y + size * 0.25);
  ctx.stroke();
  // Center frost rune pattern
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15);
  ctx.lineTo(x, y - size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.15);
  ctx.moveTo(x - size * 0.1, y + size * 0.02);
  ctx.lineTo(x, y - size * 0.08);
  ctx.lineTo(x + size * 0.1, y + size * 0.02);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Heavy reinforced rivets in rows
  for (let row = 0; row < 4; row++) {
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Skip center
      const rivetX = x + i * size * 0.12;
      const rivetY = y - size * 0.08 + row * size * 0.16;
      // Rivet base
      ctx.fillStyle = "#404058";
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, size * 0.028, 0, Math.PI * 2);
      ctx.fill();
      // Rivet highlight
      ctx.fillStyle = "#707098";
      ctx.beginPath();
      ctx.arc(rivetX - size * 0.008, rivetY - size * 0.008, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      // Rivet border
      ctx.strokeStyle = "#252535";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, size * 0.028, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // === MASSIVE MATHEY CREST ON CHEST ===
  if (isAttacking) {
    ctx.shadowColor = "#60a0ff";
    ctx.shadowBlur = 18 * zoom * attackIntensity;
  }
  // Crest outer hexagonal frame
  ctx.fillStyle = "#80c0ff";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.lineTo(x - size * 0.18, y - size * 0.1);
  ctx.lineTo(x - size * 0.18, y + size * 0.12);
  ctx.lineTo(x, y + size * 0.28);
  ctx.lineTo(x + size * 0.18, y + size * 0.12);
  ctx.lineTo(x + size * 0.18, y - size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Crest inner dark blue
  ctx.fillStyle = "#1a3050";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x - size * 0.14, y - size * 0.06);
  ctx.lineTo(x - size * 0.14, y + size * 0.08);
  ctx.lineTo(x, y + size * 0.22);
  ctx.lineTo(x + size * 0.14, y + size * 0.08);
  ctx.lineTo(x + size * 0.14, y - size * 0.06);
  ctx.closePath();
  ctx.fill();
  // Frost gem in center
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = isAttacking ? 12 * zoom * gemPulse : 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Inner gem glow
  ctx.fillStyle = "#a0e0ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.01, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Crest "M" emblem with ice effect
  ctx.fillStyle = "#a0d0ff";
  ctx.font = `bold ${14 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("M", x, y + size * 0.14);

  drawFrostSkirtArmor(ctx, x, y, size, time, zoom, isAttacking, attackIntensity, gemPulse);

  // === COLOSSAL SHOULDER PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.62;
    
    // Massive pauldron base with gradient
    const pauldronGrad = ctx.createRadialGradient(pauldronX, y - size * 0.18, 0, pauldronX, y - size * 0.18, size * 0.3);
    pauldronGrad.addColorStop(0, "#707098");
    pauldronGrad.addColorStop(0.4, "#505070");
    pauldronGrad.addColorStop(0.7, "#404058");
    pauldronGrad.addColorStop(1, "#303048");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.16, size * 0.28, size * 0.22, side * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Pauldron layered plates (3 layers for heavy look)
    for (let layer = 0; layer < 3; layer++) {
      const layerY = y - size * 0.1 + layer * size * 0.08;
      const layerWidth = size * (0.22 - layer * 0.04);
      const layerHeight = size * (0.14 - layer * 0.03);
      ctx.fillStyle = `rgb(${80 + layer * 15}, ${80 + layer * 15}, ${100 + layer * 15})`;
      ctx.beginPath();
      ctx.ellipse(pauldronX + side * size * 0.04, layerY, layerWidth, layerHeight, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Layer edge
      ctx.strokeStyle = "#252535";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Ice blue trim
    ctx.strokeStyle = "#80c0ff";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(pauldronX, y - size * 0.16, size * 0.28, size * 0.22, side * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Triple spike crown on each pauldron
    for (let spike = -1; spike <= 1; spike++) {
      const spikeX = pauldronX + side * size * 0.08 + spike * size * 0.08;
      const spikeLen = spike === 0 ? size * 0.35 : size * 0.25;
      ctx.fillStyle = "#404058";
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.025, y - size * 0.28);
      ctx.lineTo(spikeX, y - size * 0.28 - spikeLen);
      ctx.lineTo(spikeX + size * 0.025, y - size * 0.28);
      ctx.closePath();
      ctx.fill();
      // Spike edge highlight
      ctx.strokeStyle = "#707098";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.02, y - size * 0.28);
      ctx.lineTo(spikeX, y - size * 0.28 - spikeLen + size * 0.02);
      ctx.stroke();
    }
    
    // Pauldron frost gem
    ctx.fillStyle = "#40a0ff";
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 6 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(pauldronX, y - size * 0.18, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
    // Gem inner glow
    ctx.fillStyle = "#a0e0ff";
    ctx.beginPath();
    ctx.arc(pauldronX - size * 0.01, y - size * 0.19, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === FUR MANTLE ABOVE SHOULDERS (behind head) ===
  drawFurMantle(ctx, x, y, size, time, zoom);

  // === FUR COLLAR BEHIND HELMET ===
  drawFurCollar(ctx, x, y, size, time, zoom);

  // === HEAVY BARREL HELM ===
  // Different from Captain's - this is a brutal bucket helm
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.06, y - size * 0.58, size * 0.06,
    x, y - size * 0.52, size * 0.42
  );
  helmGrad.addColorStop(0, "#707098");
  helmGrad.addColorStop(0.25, "#606080");
  helmGrad.addColorStop(0.5, "#505068");
  helmGrad.addColorStop(0.75, "#404050");
  helmGrad.addColorStop(1, "#303040");
  ctx.fillStyle = helmGrad;
  // Barrel helm shape (taller, more rectangular)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.3);
  ctx.lineTo(x - size * 0.32, y - size * 0.7);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.92, x, y - size * 0.95);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.92, x + size * 0.32, y - size * 0.7);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Helm reinforcement bands
  ctx.strokeStyle = "#404058";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.31, y - size * 0.45);
  ctx.lineTo(x + size * 0.31, y - size * 0.45);
  ctx.moveTo(x - size * 0.32, y - size * 0.65);
  ctx.lineTo(x + size * 0.32, y - size * 0.65);
  ctx.stroke();

  // Center vertical reinforcement
  ctx.strokeStyle = "#505068";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x, y - size * 0.9);
  ctx.stroke();

  // Ice blue helm trim
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.32);
  ctx.lineTo(x - size * 0.32, y - size * 0.7);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.9, x, y - size * 0.93);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.9, x + size * 0.32, y - size * 0.7);
  ctx.lineTo(x + size * 0.3, y - size * 0.32);
  ctx.stroke();

  // Helm border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.3);
  ctx.lineTo(x - size * 0.32, y - size * 0.7);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.92, x, y - size * 0.95);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.92, x + size * 0.32, y - size * 0.7);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.stroke();

  // T-Visor (brutal, intimidating)
  ctx.fillStyle = "#0a0a15";
  ctx.beginPath();
  // Horizontal slit
  ctx.moveTo(x - size * 0.26, y - size * 0.58);
  ctx.lineTo(x + size * 0.26, y - size * 0.58);
  ctx.lineTo(x + size * 0.26, y - size * 0.48);
  ctx.lineTo(x - size * 0.26, y - size * 0.48);
  ctx.closePath();
  ctx.fill();
  // Vertical slit (forms the T)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.48);
  ctx.lineTo(x + size * 0.06, y - size * 0.48);
  ctx.lineTo(x + size * 0.06, y - size * 0.35);
  ctx.lineTo(x - size * 0.06, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Glowing eyes in T-visor
  ctx.fillStyle = isAttacking
    ? `rgba(100, 200, 255, ${0.8 + attackIntensity * 0.2})`
    : "rgba(80, 160, 220, 0.6)";
  if (isAttacking) {
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 10 * zoom;
  }
  // Left eye
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.53, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Right eye
  ctx.beginPath();
  ctx.arc(x + size * 0.12, y - size * 0.53, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Visor breathing holes
  ctx.fillStyle = "#0a0a15";
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      ctx.beginPath();
      ctx.arc(x - size * 0.18 + col * size * 0.04, y - size * 0.4 + row * size * 0.025, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.06 + col * size * 0.04, y - size * 0.4 + row * size * 0.025, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Helm crown with frost gem
  ctx.fillStyle = "#505068";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.93);
  ctx.lineTo(x, y - size * 1.05);
  ctx.lineTo(x + size * 0.08, y - size * 0.93);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = 8 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.97, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === ROW OF SPIKES ALONG HELMET CROWN ===
  const spikeCount = 9;
  for (let i = 0; i < spikeCount; i++) {
    const t = (i / (spikeCount - 1)) * 2 - 1; // -1 to 1
    const spikeX = x + t * size * 0.28;
    const baseY = y - size * 0.93 + t * t * size * 0.18;
    const centerFactor = 1 - Math.abs(t);
    const spikeHeight = size * (0.1 + 0.14 * centerFactor);
    const halfW = size * 0.022;

    const spikeGrad = ctx.createLinearGradient(spikeX, baseY, spikeX, baseY - spikeHeight);
    spikeGrad.addColorStop(0, "#505068");
    spikeGrad.addColorStop(0.4, "#404058");
    spikeGrad.addColorStop(1, "#303045");
    ctx.fillStyle = spikeGrad;
    ctx.beginPath();
    ctx.moveTo(spikeX - halfW, baseY);
    ctx.lineTo(spikeX, baseY - spikeHeight);
    ctx.lineTo(spikeX + halfW, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#252535";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    ctx.strokeStyle = "#606080";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(spikeX - halfW * 0.8, baseY);
    ctx.lineTo(spikeX - size * 0.003, baseY - spikeHeight + size * 0.02);
    ctx.stroke();

    const isCenterSpike = i === Math.floor(spikeCount / 2);
    ctx.fillStyle = "#60c0ff";
    ctx.shadowColor = "#80e0ff";
    ctx.shadowBlur = (isCenterSpike ? 8 : 5) * zoom;
    ctx.beginPath();
    ctx.arc(spikeX, baseY - spikeHeight, size * (isCenterSpike ? 0.02 : 0.013), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === ORNATE TOWER SHIELD (Left side) ===
  ctx.save();
  ctx.translate(x - size * 0.58, y + size * 0.05);
  ctx.rotate(0.2);

  // Shield shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.32);
  ctx.lineTo(-size * 0.2, -size * 0.2);
  ctx.lineTo(-size * 0.22, size * 0.25);
  ctx.lineTo(size * 0.02, size * 0.42);
  ctx.lineTo(size * 0.24, size * 0.25);
  ctx.lineTo(size * 0.26, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Shield body with frost steel gradient
  const shieldGrad = ctx.createLinearGradient(-size * 0.22, 0, size * 0.22, 0);
  shieldGrad.addColorStop(0, "#303050");
  shieldGrad.addColorStop(0.25, "#505078");
  shieldGrad.addColorStop(0.5, "#606090");
  shieldGrad.addColorStop(0.75, "#505078");
  shieldGrad.addColorStop(1, "#303050");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.35);
  ctx.lineTo(-size * 0.22, -size * 0.22);
  ctx.lineTo(-size * 0.24, size * 0.22);
  ctx.lineTo(0, size * 0.4);
  ctx.lineTo(size * 0.24, size * 0.22);
  ctx.lineTo(size * 0.22, -size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Shield edge highlight
  ctx.strokeStyle = "#8888aa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.33);
  ctx.lineTo(-size * 0.2, -size * 0.2);
  ctx.stroke();

  // Shield border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.35);
  ctx.lineTo(-size * 0.22, -size * 0.22);
  ctx.lineTo(-size * 0.24, size * 0.22);
  ctx.lineTo(0, size * 0.4);
  ctx.lineTo(size * 0.24, size * 0.22);
  ctx.lineTo(size * 0.22, -size * 0.22);
  ctx.closePath();
  ctx.stroke();

  // Ice blue inner trim
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(-size * 0.17, -size * 0.18);
  ctx.lineTo(-size * 0.19, size * 0.18);
  ctx.lineTo(0, size * 0.34);
  ctx.lineTo(size * 0.19, size * 0.18);
  ctx.lineTo(size * 0.17, -size * 0.18);
  ctx.closePath();
  ctx.stroke();

  // Shield frost rune patterns
  ctx.strokeStyle = "#60a0ff";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.12, 0, -size * 0.08, size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.12, 0, size * 0.08, size * 0.12);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Shield boss with "M" emblem
  ctx.fillStyle = "#80c0ff";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a3050";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  // "M" emblem
  ctx.fillStyle = "#80c0ff";
  ctx.font = `bold ${16 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("M", 0, size * 0.05);

  // Shield corner gems
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, -size * 0.26, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.14, size * 0.12, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.14, size * 0.12, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, size * 0.3, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === MASSIVE WAR HAMMER (Right side, angled away from face) ===
  // Epic attack animation: wind-up → overhead → devastating slam
  let hammerAngle: number;
  let hammerX: number;
  let hammerY: number;
  
  if (isAttacking) {
    // Phase 1 (0-0.3): Wind-up - hammer goes back and up
    // Phase 2 (0.3-0.6): Overhead swing - hammer arcs over
    // Phase 3 (0.6-1.0): Devastating slam - hammer crashes down
    if (attackPhase < 0.3) {
      // Wind-up: pull back
      const windUp = attackPhase / 0.3;
      hammerAngle = 0.8 + windUp * 1.5; // Rotate back
      hammerX = x + size * 0.55 + windUp * size * 0.15;
      hammerY = y - size * 0.1 - windUp * size * 0.2;
    } else if (attackPhase < 0.6) {
      // Overhead: arc forward
      const overheadProgress = (attackPhase - 0.3) / 0.3;
      hammerAngle = 2.3 - overheadProgress * 3.5; // Arc from back to front
      hammerX = x + size * 0.7 - overheadProgress * size * 0.3;
      hammerY = y - size * 0.3 + overheadProgress * size * 0.4;
    } else {
      // Slam: crash down
      const slamProgress = (attackPhase - 0.6) / 0.4;
      hammerAngle = -1.2 + slamProgress * 0.4; // Slight recovery
      hammerX = x + size * 0.4;
      hammerY = y + size * 0.1 - slamProgress * size * 0.15;
    }
  } else {
    // Idle: hammer resting at side, angled away from face
    hammerAngle = 0.6 + heavyStance * 0.02; // Tilted to the right
    hammerX = x + size * 0.6;
    hammerY = y + size * 0.15;
  }

  hammerAngle = resolveWeaponRotation(
    targetPos,
    hammerX,
    hammerY,
    hammerAngle,
    Math.PI / 2,
    isAttacking ? 1.25 : 0.72,
    WEAPON_LIMITS.rightMelee,
  );

  ctx.save();
  ctx.translate(hammerX, hammerY);
  ctx.rotate(hammerAngle);

  // Hammer handle - thick reinforced shaft
  const shaftGrad = ctx.createLinearGradient(-size * 0.05, -size * 0.1, size * 0.05, -size * 0.1);
  shaftGrad.addColorStop(0, "#2a1a10");
  shaftGrad.addColorStop(0.3, "#4a3020");
  shaftGrad.addColorStop(0.5, "#5a4030");
  shaftGrad.addColorStop(0.7, "#4a3020");
  shaftGrad.addColorStop(1, "#2a1a10");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.05, -size * 0.85, size * 0.1, size * 1.05);

  // Metal bands on shaft
  for (let band = 0; band < 6; band++) {
    const bandY = -size * 0.75 + band * size * 0.18;
    ctx.fillStyle = "#505068";
    ctx.fillRect(-size * 0.06, bandY, size * 0.12, size * 0.045);
    ctx.fillStyle = "#707098";
    ctx.fillRect(-size * 0.06, bandY, size * 0.12, size * 0.018);
  }

  // Shaft border
  ctx.strokeStyle = "#1a0a05";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-size * 0.05, -size * 0.85, size * 0.1, size * 1.05);

  // === MASSIVE HAMMER HEAD ===
  if (isAttacking && attackPhase > 0.5) {
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 20 * zoom * attackIntensity;
  }

  // Hammer head main body
  const headGrad = ctx.createLinearGradient(-size * 0.22, -size * 0.95, size * 0.22, -size * 0.95);
  headGrad.addColorStop(0, "#252540");
  headGrad.addColorStop(0.15, "#404060");
  headGrad.addColorStop(0.35, "#505078");
  headGrad.addColorStop(0.5, "#606090");
  headGrad.addColorStop(0.65, "#505078");
  headGrad.addColorStop(0.85, "#404060");
  headGrad.addColorStop(1, "#252540");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  // Main striking head (larger, more imposing)
  ctx.moveTo(-size * 0.2, -size * 0.82);
  ctx.lineTo(-size * 0.25, -size * 1.02);
  ctx.lineTo(size * 0.25, -size * 1.02);
  ctx.lineTo(size * 0.2, -size * 0.82);
  ctx.closePath();
  ctx.fill();

  // Top flat face with bevel
  ctx.fillStyle = "#505070";
  ctx.beginPath();
  ctx.moveTo(-size * 0.23, -size * 1.02);
  ctx.lineTo(-size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.23, -size * 1.02);
  ctx.closePath();
  ctx.fill();

  // Spike on back of hammer (war pick side)
  ctx.fillStyle = "#404058";
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.86);
  ctx.lineTo(-size * 0.4, -size * 0.92);
  ctx.lineTo(-size * 0.2, -size * 0.98);
  ctx.closePath();
  ctx.fill();
  // Spike highlight
  ctx.strokeStyle = "#606080";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.87);
  ctx.lineTo(-size * 0.38, -size * 0.92);
  ctx.stroke();

  // Hammer head border
  ctx.strokeStyle = "#151525";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.82);
  ctx.lineTo(-size * 0.25, -size * 1.02);
  ctx.lineTo(-size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.18, -size * 1.08);
  ctx.lineTo(size * 0.25, -size * 1.02);
  ctx.lineTo(size * 0.2, -size * 0.82);
  ctx.closePath();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Frost runes on hammer head (glowing intensely during attack)
  const runeGlow = isAttacking && attackPhase > 0.4 ? 0.8 + attackIntensity * 0.2 : 0.5;
  ctx.fillStyle = `rgba(100, 200, 255, ${runeGlow})`;
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = isAttacking && attackPhase > 0.4 ? 12 * zoom : 4 * zoom;
  // Central rune
  ctx.beginPath();
  ctx.arc(0, -size * 0.92, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Side runes
  ctx.beginPath();
  ctx.arc(-size * 0.12, -size * 0.92, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.12, -size * 0.92, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  // Rune connecting frost lines
  ctx.strokeStyle = `rgba(100, 200, 255, ${runeGlow * 0.7})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.92);
  ctx.lineTo(-size * 0.02, -size * 0.92);
  ctx.moveTo(size * 0.1, -size * 0.92);
  ctx.lineTo(size * 0.02, -size * 0.92);
  ctx.stroke();
  // Vertical rune line
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.89);
  ctx.lineTo(0, -size * 0.95);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Ice blue accent trim on hammer
  ctx.strokeStyle = "#80c0ff";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, -size * 0.84);
  ctx.lineTo(-size * 0.23, -size * 1.0);
  ctx.lineTo(size * 0.23, -size * 1.0);
  ctx.lineTo(size * 0.18, -size * 0.84);
  ctx.stroke();

  // Ornate pommel at bottom
  ctx.fillStyle = "#505068";
  ctx.beginPath();
  ctx.arc(0, size * 0.22, size * 0.065, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#40a0ff";
  ctx.shadowColor = "#60c0ff";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, size * 0.22, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === EPIC IMPACT EFFECTS (during slam phase) ===
  if (isAttacking && attackPhase > 0.55) {
    const slamIntensity = attackPhase > 0.6 ? ((attackPhase - 0.6) / 0.4) : 0;
    const impactX = x + size * 0.4;
    const impactY = y + size * 0.55;
    
    // Screen shake effect simulation via offset particles
    const shakeOffset = slamIntensity * 3 * Math.sin(time * 50);
    
    // Massive shockwave rings
    for (let ring = 0; ring < 5; ring++) {
      const ringSize = size * 0.2 + ring * size * 0.25 * slamIntensity;
      const ringAlpha = (0.8 - ring * 0.15) * slamIntensity;
      ctx.strokeStyle = ring % 2 === 0 
        ? `rgba(100, 180, 255, ${ringAlpha})` 
        : `rgba(200, 230, 255, ${ringAlpha * 0.7})`;
      ctx.lineWidth = (4 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(impactX + shakeOffset, impactY, ringSize, ringSize * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Ground crack lines radiating outward
    for (let crack = 0; crack < 12; crack++) {
      const crackAngle = crack * Math.PI / 6 + Math.sin(crack * 0.7) * 0.2;
      const crackLen = size * (0.4 + Math.random() * 0.3) * slamIntensity;
      const crackWidth = (3 - crack * 0.15) * zoom;
      
      // Main crack
      ctx.strokeStyle = `rgba(80, 150, 220, ${0.8 * slamIntensity})`;
      ctx.lineWidth = crackWidth;
      ctx.beginPath();
      ctx.moveTo(impactX, impactY);
      // Jagged crack path
      const midX = impactX + Math.cos(crackAngle) * crackLen * 0.5 + Math.sin(crack * 2) * size * 0.05;
      const midY = impactY + Math.sin(crackAngle) * crackLen * 0.15;
      ctx.lineTo(midX, midY);
      ctx.lineTo(
        impactX + Math.cos(crackAngle) * crackLen,
        impactY + Math.sin(crackAngle) * crackLen * 0.25
      );
      ctx.stroke();
      
      // Crack glow
      ctx.strokeStyle = `rgba(150, 200, 255, ${0.4 * slamIntensity})`;
      ctx.lineWidth = crackWidth * 2;
      ctx.stroke();
    }
    
    // Flying debris and ice shards
    for (let debris = 0; debris < 20; debris++) {
      const debrisAngle = debris * Math.PI / 10 + time * 2;
      const debrisDist = size * 0.1 + debris * size * 0.04 * slamIntensity;
      const debrisHeight = Math.sin((attackPhase - 0.6) * Math.PI * 2 + debris * 0.3) * size * 0.4;
      const debrisX = impactX + Math.cos(debrisAngle) * debrisDist;
      const debrisY = impactY - Math.abs(debrisHeight) * slamIntensity;
      const debrisAlpha = 0.9 * slamIntensity * (1 - debris * 0.04);
      
      // Ice shard shape
      ctx.fillStyle = debris % 3 === 0 
        ? `rgba(200, 230, 255, ${debrisAlpha})` 
        : `rgba(100, 180, 255, ${debrisAlpha * 0.7})`;
      ctx.save();
      ctx.translate(debrisX, debrisY);
      ctx.rotate(debrisAngle + time * 5);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.025);
      ctx.lineTo(size * 0.012, 0);
      ctx.lineTo(0, size * 0.025);
      ctx.lineTo(-size * 0.012, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    
    // Central impact flash
    if (attackPhase > 0.58 && attackPhase < 0.75) {
      const flashIntensity = Math.sin((attackPhase - 0.58) / 0.17 * Math.PI);
      const flashGrad = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, size * 0.4);
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashIntensity * 0.8})`);
      flashGrad.addColorStop(0.3, `rgba(150, 220, 255, ${flashIntensity * 0.5})`);
      flashGrad.addColorStop(1, "rgba(100, 180, 255, 0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(impactX, impactY, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === ARMORED LEGS/GREAVES ===
  for (let side = -1; side <= 1; side += 2) {
    const legX = x + side * size * 0.22;
    
    // Heavy greave
    const greaveGrad = ctx.createLinearGradient(legX - size * 0.08, y + size * 0.3, legX + size * 0.08, y + size * 0.3);
    greaveGrad.addColorStop(0, "#303048");
    greaveGrad.addColorStop(0.5, "#505070");
    greaveGrad.addColorStop(1, "#303048");
    ctx.fillStyle = greaveGrad;
    ctx.beginPath();
    ctx.moveTo(legX - size * 0.1, y + size * 0.52);
    ctx.lineTo(legX - size * 0.12, y + size * 0.32);
    ctx.lineTo(legX + size * 0.12, y + size * 0.32);
    ctx.lineTo(legX + size * 0.1, y + size * 0.52);
    ctx.closePath();
    ctx.fill();
    
    // Knee guard
    ctx.fillStyle = "#505068";
    ctx.beginPath();
    ctx.ellipse(legX, y + size * 0.34, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#40a0ff";
    ctx.shadowColor = "#60c0ff";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(legX, y + size * 0.34, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Armored boot
    ctx.fillStyle = "#404058";
    ctx.beginPath();
    ctx.moveTo(legX - size * 0.1, y + size * 0.52);
    ctx.lineTo(legX - size * 0.12, y + size * 0.58);
    ctx.lineTo(legX + side * size * 0.02, y + size * 0.6);
    ctx.lineTo(legX + size * 0.12, y + size * 0.58);
    ctx.lineTo(legX + size * 0.1, y + size * 0.52);
    ctx.closePath();
    ctx.fill();
  }
}
