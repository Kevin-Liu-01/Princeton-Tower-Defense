import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

// ─── DRAGON SKIRT ARMOR (segmented plate tassets below the breastplate) ──────

function drawDragonSkirtArmor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  gemPulse: number,
  flamePulse: number,
) {
  const skirtTop = y + size * 0.28;
  const bandCount = 5;
  const totalHeight = size * 0.38;
  const bandHeight = totalHeight / bandCount;
  const gapHalf = size * 0.12;

  drawCenterBanner(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    skirtTop,
    totalHeight,
    gapHalf,
    gemPulse,
  );

  for (let side = -1; side <= 1; side += 2) {
    drawTassetSide(
      ctx,
      x,
      y,
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
      flamePulse,
    );
  }

  drawGoldChain(ctx, x, size, zoom, skirtTop, gapHalf, gemPulse, time);
  drawSkirtBelt(ctx, x, size, zoom, skirtTop, gemPulse);
}

function drawTassetSide(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
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
  isAttacking: boolean,
  attackIntensity: number,
  flamePulse: number,
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
      plateG.addColorStop(0, "#4a4a4a");
      plateG.addColorStop(0.25, "#404040");
      plateG.addColorStop(0.55, "#333333");
      plateG.addColorStop(1, "#1a1a1a");
    } else {
      plateG.addColorStop(0, "#1a1a1a");
      plateG.addColorStop(0.45, "#333333");
      plateG.addColorStop(0.75, "#404040");
      plateG.addColorStop(1, "#4a4a4a");
    }

    ctx.fillStyle = plateG;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(110, 110, 110, 0.5)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX + side * size * 0.005, innerTopY + size * 0.002);
    ctx.lineTo(outerX - side * size * 0.005, outerTopY + size * 0.002);
    ctx.stroke();

    ctx.strokeStyle = "rgba(5, 5, 5, 0.65)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX - side * size * 0.002, innerBotY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.stroke();

    // Black border for contrast, then gold inner trim
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "#7a5a10";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.stroke();

    // Engraved diagonal filigree on each plate
    {
      const midIX = (innerX + outerX) * 0.5;
      const midIY = (innerTopY + outerTopY) * 0.5;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(innerX, innerTopY);
      ctx.lineTo(outerX, outerTopY);
      ctx.lineTo(outerX + side * size * 0.004, outerBotY);
      ctx.lineTo(innerX - side * size * 0.002, innerBotY);
      ctx.closePath();
      ctx.clip();
      // Gold diagonal swirl
      ctx.strokeStyle = `rgba(154, 122, 24, ${0.18 + band * 0.03})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(innerX + side * size * 0.02, innerTopY + bandHeight * 0.2);
      ctx.quadraticCurveTo(
        midIX + side * size * 0.03, midIY + bandHeight * 0.3,
        outerX - side * size * 0.02, outerBotY - bandHeight * 0.2,
      );
      ctx.stroke();
      // Decorative notch marks
      for (let n = 0; n < 2; n++) {
        const nt = 0.3 + n * 0.4;
        const nx = innerX + nt * (outerX - innerX);
        const nyTop = innerTopY + nt * (outerTopY - innerTopY);
        ctx.strokeStyle = `rgba(120, 90, 16, ${0.15 + n * 0.05})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(nx - size * 0.008, nyTop + bandHeight * 0.25);
        ctx.lineTo(nx + size * 0.008, nyTop + bandHeight * 0.65);
        ctx.stroke();
      }
      ctx.restore();
    }

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
    rg.addColorStop(0, "#ffe080");
    rg.addColorStop(0.4, "#daa520");
    rg.addColorStop(1, "#805010");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    if (band % 2 === 0) {
      ctx.fillStyle = "#4a4a4a";
      const scaleCount = 2 + Math.floor(band / 2);
      for (let sc = 0; sc < scaleCount; sc++) {
        const t = (sc + 0.5) / scaleCount;
        const scaleX = innerX + t * (outerX - innerX);
        const scaleYBase =
          innerTopY + t * (outerTopY - innerTopY) + bandHeight * 0.4;
        const scaleSize = size * 0.026;
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
      ctx.strokeStyle = `rgba(220, 38, 38, ${0.25 + gemPulse * 0.15})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.shadowColor = "#dc2626";
      ctx.shadowBlur = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(accentInnerX, accentInnerY);
      ctx.lineTo(accentOuterX, accentOuterY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  if (isAttacking) {
    const lastBand = bandCount - 1;
    const outerW = size * (0.42 + lastBand * 0.035);
    const innerGap = gapHalf + lastBand * size * 0.008;
    const innerBotY = skirtTop + totalHeight;
    const outerBotY = innerBotY + shear;
    const innerX = x + side * innerGap;
    const outerX = x + side * outerW;
    ctx.strokeStyle = `rgba(255, 102, 48, ${0.35 * attackIntensity * flamePulse})`;
    ctx.lineWidth = 2 * zoom;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX, innerBotY);
    const segs = 5;
    for (let f = 0; f < segs; f++) {
      const t1 = (f + 0.5) / segs;
      const t2 = (f + 1) / segs;
      const mx = innerX + t1 * (outerX - innerX);
      const my = innerBotY + t1 * (outerBotY - innerBotY);
      const ex = innerX + t2 * (outerX - innerX);
      const ey = innerBotY + t2 * (outerBotY - innerBotY);
      const fWave = Math.sin(time * 7 + f * 0.9 + side * 2) * size * 0.02;
      ctx.lineTo(mx, my + size * 0.018 + fWave);
      ctx.lineTo(ex, ey);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawCenterBanner(
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
  bannerGrad.addColorStop(0, "#8b1010");
  bannerGrad.addColorStop(0.15, "#b81818");
  bannerGrad.addColorStop(0.4, "#dc2626");
  bannerGrad.addColorStop(0.7, "#b81818");
  bannerGrad.addColorStop(1, "#8b1010");
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

  // Black border then gold
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Vertical gold filigree lines on banner
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - bannerHalfW, bannerTop);
  ctx.lineTo(x + bannerHalfW, bannerTop);
  ctx.lineTo(x + bannerHalfW * 0.85, bannerBottom);
  ctx.lineTo(x - bannerHalfW * 0.85, bannerBottom);
  ctx.closePath();
  ctx.clip();
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = "rgba(218, 165, 32, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * bannerHalfW * 0.5, bannerTop + size * 0.01);
    ctx.lineTo(x + side * bannerHalfW * 0.45, bannerBottom - size * 0.01);
    ctx.stroke();
  }
  // Horizontal gold filigree
  ctx.strokeStyle = "rgba(218, 165, 32, 0.25)";
  ctx.lineWidth = 0.4 * zoom;
  const bannerMidY = (bannerTop + bannerBottom) * 0.5;
  ctx.beginPath();
  ctx.moveTo(x - bannerHalfW * 0.7, bannerMidY - size * 0.04);
  ctx.lineTo(x + bannerHalfW * 0.7, bannerMidY - size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - bannerHalfW * 0.7, bannerMidY + size * 0.04);
  ctx.lineTo(x + bannerHalfW * 0.7, bannerMidY + size * 0.04);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#daa520";
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  const emblemY = (bannerTop + bannerBottom) * 0.5 - size * 0.03;
  ctx.beginPath();
  ctx.moveTo(x, emblemY - size * 0.05);
  ctx.lineTo(x - size * 0.03, emblemY - size * 0.01);
  ctx.lineTo(x - size * 0.02, emblemY + size * 0.03);
  ctx.lineTo(x, emblemY + size * 0.02);
  ctx.lineTo(x + size * 0.02, emblemY + size * 0.03);
  ctx.lineTo(x + size * 0.03, emblemY - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, emblemY, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGoldChain(
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
      lx - size * 0.002,
      ly - size * 0.002,
      0,
      lx,
      ly,
      size * 0.012,
    );
    linkGrad.addColorStop(0, "#ffe080");
    linkGrad.addColorStop(0.5, "#daa520");
    linkGrad.addColorStop(1, "#805010");
    ctx.fillStyle = linkGrad;
    ctx.beginPath();
    const linkW = size * 0.011;
    const linkH = size * 0.007;
    const angle = i % 2 === 0 ? 0.3 : -0.3;
    ctx.ellipse(lx, ly, linkW, linkH, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#604008";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(240, 192, 64, ${0.5 + gemPulse * 0.2})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.moveTo(leftAnchor, chainY);
  ctx.quadraticCurveTo(x, chainY + sag, rightAnchor, chainY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (let side = -1; side <= 1; side += 2) {
    const anchorX = side === -1 ? leftAnchor : rightAnchor;
    ctx.fillStyle = "#daa520";
    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(anchorX, chainY, size * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#805010";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawSkirtBelt(
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
  beltGrad.addColorStop(0, "#805010");
  beltGrad.addColorStop(0.2, "#c9a227");
  beltGrad.addColorStop(0.4, "#f0c040");
  beltGrad.addColorStop(0.5, "#ffe060");
  beltGrad.addColorStop(0.6, "#f0c040");
  beltGrad.addColorStop(0.8, "#c9a227");
  beltGrad.addColorStop(1, "#805010");

  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#604008";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.strokeStyle = "#ffe060";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    x - beltHalfW + size * 0.01,
    skirtTop - beltThick * 0.5 + size * 0.004,
  );
  ctx.lineTo(
    x + beltHalfW - size * 0.01,
    skirtTop - beltThick * 0.5 + size * 0.004,
  );
  ctx.stroke();

  // Decorative filigree on belt
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.clip();
  // Etched diamond pattern
  for (let d = -4; d <= 4; d++) {
    if (d === 0) continue;
    const dx = x + d * size * 0.08;
    const dy = skirtTop;
    ctx.strokeStyle = "rgba(96, 64, 8, 0.35)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(dx, dy - beltThick * 0.3);
    ctx.lineTo(dx + size * 0.015, dy);
    ctx.lineTo(dx, dy + beltThick * 0.3);
    ctx.lineTo(dx - size * 0.015, dy);
    ctx.closePath();
    ctx.stroke();
  }
  // Side rivets on belt
  for (let side = -1; side <= 1; side += 2) {
    for (let r = 0; r < 3; r++) {
      const rx = x + side * (size * 0.12 + r * size * 0.1);
      const ry = skirtTop;
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Center buckle gem
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#ff4444";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, skirtTop + vDip * 0.35, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  // Gold setting ring around buckle gem
  ctx.strokeStyle = "#8a6a15";
  ctx.lineWidth = 1.2 * zoom;
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.fillStyle = "#ff8888";
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

export function drawCaptainHero(
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
  // LEGENDARY DRAGONLORD GENERAL - Epic Fantasy War Commander with Divine Fire
  const breathe = Math.sin(time * 2) * 2;
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) : 0;
  const commandPose = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackIntensity = attackPhase;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const flamePulse = Math.sin(time * 6) * 0.15 + 0.85;
  const divineGlow = Math.sin(time * 1.5) * 0.2 + 0.8;

  ctx.save();
  ctx.translate(0, breathe);

  // === DIVINE FLAME AURA - Radiating Power ===
  const auraBase = isAttacking ? 0.45 : 0.28;
  for (let auraLayer = 0; auraLayer < 6; auraLayer++) {
    const layerOffset = auraLayer * 0.08;
    const auraGrad = ctx.createRadialGradient(
      x,
      y - size * 0.1,
      size * (0.05 + layerOffset),
      x,
      y,
      size * (1.1 + layerOffset * 0.25),
    );
    const layerAlpha = (auraBase - auraLayer * 0.05) * divineGlow;
    auraGrad.addColorStop(0, `rgba(255, 200, 100, ${layerAlpha * 0.7})`);
    auraGrad.addColorStop(0.2, `rgba(255, 100, 50, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.5, `rgba(200, 30, 30, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.75, `rgba(150, 20, 50, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(100, 10, 30, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      size * (1.0 + layerOffset * 0.18),
      size * (0.65 + layerOffset * 0.12),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Floating ember particles
  for (let p = 0; p < 18; p++) {
    const pAngle = (time * 1.2 + (p * Math.PI * 2) / 18) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 3 + p * 0.9) * size * 0.2;
    const pHeight = Math.sin(time * 2 + p * 0.5) * size * 0.15;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.45 - pHeight;
    const pAlpha = 0.5 + Math.sin(time * 5 + p * 0.7) * 0.35;
    const pSize = size * (0.015 + Math.sin(time * 4 + p) * 0.008);

    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 6 * zoom;
    ctx.fillStyle =
      p % 4 === 0
        ? `rgba(255, 220, 100, ${pAlpha})`
        : p % 4 === 1
          ? `rgba(255, 150, 50, ${pAlpha})`
          : p % 4 === 2
            ? `rgba(255, 80, 30, ${pAlpha})`
            : `rgba(220, 38, 38, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Arcane rune circle
  ctx.save();
  ctx.translate(x, y + size * 0.05);
  ctx.rotate(time * 0.3);
  ctx.strokeStyle = `rgba(255, 180, 80, ${0.25 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.75, size * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Rune symbols
  for (let rune = 0; rune < 8; rune++) {
    const runeAngle = (rune * Math.PI) / 4;
    const runeX = Math.cos(runeAngle) * size * 0.75;
    const runeY = Math.sin(runeAngle) * size * 0.35;
    ctx.fillStyle = `rgba(255, 200, 100, ${0.4 + Math.sin(time * 3 + rune) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(runeX, runeY - size * 0.03);
    ctx.lineTo(runeX + size * 0.02, runeY);
    ctx.lineTo(runeX, runeY + size * 0.03);
    ctx.lineTo(runeX - size * 0.02, runeY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === LEGENDARY FLAME CAPE ===
  const capeWave = Math.sin(time * 3) * 0.15;
  const capeWave2 = Math.sin(time * 4 + 0.7) * 0.1;

  // Cape shadow on ground
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.72, size * 0.5, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cape inner glow layer (warm fire ambient)
  const capeGlowGrad = ctx.createLinearGradient(x, y - size * 0.2, x, y + size * 0.7);
  capeGlowGrad.addColorStop(0, "rgba(255, 120, 40, 0.25)");
  capeGlowGrad.addColorStop(0.4, "rgba(180, 40, 20, 0.15)");
  capeGlowGrad.addColorStop(1, "rgba(80, 10, 10, 0.08)");
  ctx.fillStyle = capeGlowGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.2);
  ctx.bezierCurveTo(
    x - size * 0.65 - capeWave * size, y + size * 0.2,
    x - size * 0.6 - capeWave2 * size, y + size * 0.5,
    x - size * 0.5, y + size * 0.72,
  );
  ctx.lineTo(x + size * 0.5, y + size * 0.72);
  ctx.bezierCurveTo(
    x + size * 0.6 + capeWave2 * size, y + size * 0.5,
    x + size * 0.65 + capeWave * size, y + size * 0.2,
    x + size * 0.28, y - size * 0.2,
  );
  ctx.closePath();
  ctx.fill();

  // Cape main body — rich dark crimson with cross-gradient for depth
  const capeGrad = ctx.createLinearGradient(x - size * 0.6, y, x + size * 0.6, y);
  capeGrad.addColorStop(0, "#2a0303");
  capeGrad.addColorStop(0.12, "#4a0606");
  capeGrad.addColorStop(0.3, "#7a0e0e");
  capeGrad.addColorStop(0.5, "#991515");
  capeGrad.addColorStop(0.7, "#7a0e0e");
  capeGrad.addColorStop(0.88, "#4a0606");
  capeGrad.addColorStop(1, "#2a0303");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.6 - capeWave * size, y + size * 0.15,
    x - size * 0.55 - capeWave2 * size, y + size * 0.48,
    x - size * 0.45, y + size * 0.68,
  );
  ctx.lineTo(x + size * 0.45, y + size * 0.68);
  ctx.bezierCurveTo(
    x + size * 0.55 + capeWave2 * size, y + size * 0.48,
    x + size * 0.6 + capeWave * size, y + size * 0.15,
    x + size * 0.26, y - size * 0.22,
  );
  ctx.closePath();
  ctx.fill();

  // Vertical depth shading (darker at bottom)
  const capeVGrad = ctx.createLinearGradient(x, y - size * 0.2, x, y + size * 0.7);
  capeVGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  capeVGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.15)");
  capeVGrad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
  ctx.fillStyle = capeVGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.6 - capeWave * size, y + size * 0.15,
    x - size * 0.55 - capeWave2 * size, y + size * 0.48,
    x - size * 0.45, y + size * 0.68,
  );
  ctx.lineTo(x + size * 0.45, y + size * 0.68);
  ctx.bezierCurveTo(
    x + size * 0.55 + capeWave2 * size, y + size * 0.48,
    x + size * 0.6 + capeWave * size, y + size * 0.15,
    x + size * 0.26, y - size * 0.22,
  );
  ctx.closePath();
  ctx.fill();

  // Fabric fold lines (subtle vertical drapes)
  ctx.globalAlpha = 0.12;
  for (let fold = -2; fold <= 2; fold++) {
    const foldX = x + fold * size * 0.12;
    const foldWave = Math.sin(time * 2.5 + fold * 1.2) * size * 0.01;
    ctx.strokeStyle = fold < 0 ? "#000" : "#aa6060";
    ctx.lineWidth = 1.0 * zoom;
    ctx.beginPath();
    ctx.moveTo(foldX, y - size * 0.1);
    ctx.bezierCurveTo(
      foldX + foldWave, y + size * 0.15,
      foldX - foldWave, y + size * 0.4,
      foldX + fold * size * 0.02, y + size * 0.65,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Cape flame edge effect (bottom fringe)
  ctx.strokeStyle = "#dd4420";
  ctx.lineWidth = 2.5 * zoom;
  ctx.shadowColor = "#ff4400";
  ctx.shadowBlur = 6 * zoom * flamePulse;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.68);
  for (let flame = 0; flame < 12; flame++) {
    const flameX = x - size * 0.45 + flame * size * 0.075;
    const flameWave = Math.sin(time * 6 + flame * 0.8) * size * 0.035;
    const flameHeight = Math.sin(time * 5 + flame * 0.5) * size * 0.018 + size * 0.02;
    ctx.lineTo(flameX + size * 0.0375, y + size * 0.68 + flameHeight + flameWave);
    ctx.lineTo(flameX + size * 0.075, y + size * 0.68);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Cape gold dragon embroidery (more ornate)
  ctx.strokeStyle = "#9a7a18";
  ctx.lineWidth = 1.0 * zoom;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.2, x - size * 0.1, y + size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.2, y + size * 0.4, x - size * 0.15, y + size * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.2, x + size * 0.1, y + size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.4, x + size * 0.15, y + size * 0.5);
  ctx.stroke();
  // Scrollwork arcs
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.arc(x + side * size * 0.08, y + size * 0.25, size * 0.04, 0, Math.PI * 1.2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Cape gold edge trim (deeper gold)
  ctx.strokeStyle = "#9a7a18";
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.66);
  ctx.bezierCurveTo(
    x - size * 0.55 - capeWave2 * size, y + size * 0.46,
    x - size * 0.6 - capeWave * size, y + size * 0.13,
    x - size * 0.26, y - size * 0.24,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.45, y + size * 0.66);
  ctx.bezierCurveTo(
    x + size * 0.55 + capeWave2 * size, y + size * 0.46,
    x + size * 0.6 + capeWave * size, y + size * 0.13,
    x + size * 0.26, y - size * 0.24,
  );
  ctx.stroke();

  // === DRAGONSCALE PLATE ARMOR ===
  {
    // Armor shape helper
    const drawArmorPath = () => {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.4, y + size * 0.52);
      ctx.lineTo(x - size * 0.48, y - size * 0.05);
      ctx.lineTo(x - size * 0.32, y - size * 0.3);
      ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.32, y - size * 0.3);
      ctx.lineTo(x + size * 0.48, y - size * 0.05);
      ctx.lineTo(x + size * 0.4, y + size * 0.52);
      ctx.closePath();
    };

    // Base fill — dark steel with directional gradient
    const armorG = ctx.createLinearGradient(x - size * 0.5, y - size * 0.35, x + size * 0.35, y + size * 0.5);
    armorG.addColorStop(0, "#2e2e2e");
    armorG.addColorStop(0.15, "#3c3c3c");
    armorG.addColorStop(0.35, "#484850");
    armorG.addColorStop(0.55, "#404048");
    armorG.addColorStop(0.75, "#333338");
    armorG.addColorStop(1, "#1e1e20");
    ctx.fillStyle = armorG;
    drawArmorPath();
    ctx.fill();

    // Specular highlight on upper-left chest
    const specAG = ctx.createRadialGradient(
      x - size * 0.12, y - size * 0.2, 0,
      x - size * 0.1, y - size * 0.15, size * 0.25,
    );
    specAG.addColorStop(0, "rgba(140, 140, 155, 0.2)");
    specAG.addColorStop(0.5, "rgba(90, 90, 100, 0.08)");
    specAG.addColorStop(1, "rgba(50, 50, 55, 0)");
    ctx.fillStyle = specAG;
    drawArmorPath();
    ctx.fill();

    // Dragonscale texture (clipped to armor, subtler with gradients)
    ctx.save();
    drawArmorPath();
    ctx.clip();
    for (let row = 0; row < 6; row++) {
      for (let col = -3; col <= 3; col++) {
        const scaleX = x + col * size * 0.1 + (row % 2) * size * 0.05;
        const scaleY = y - size * 0.18 + row * size * 0.1;
        const ss = size * 0.042;

        const sG = ctx.createRadialGradient(scaleX - ss * 0.2, scaleY - ss * 0.2, 0, scaleX, scaleY, ss);
        sG.addColorStop(0, "rgba(80, 80, 90, 0.35)");
        sG.addColorStop(0.6, "rgba(55, 55, 62, 0.25)");
        sG.addColorStop(1, "rgba(35, 35, 40, 0)");
        ctx.fillStyle = sG;
        ctx.beginPath();
        ctx.moveTo(scaleX, scaleY - ss * 0.35);
        ctx.quadraticCurveTo(scaleX + ss, scaleY, scaleX, scaleY + ss * 0.55);
        ctx.quadraticCurveTo(scaleX - ss, scaleY, scaleX, scaleY - ss * 0.35);
        ctx.fill();
        ctx.strokeStyle = "rgba(70, 70, 78, 0.2)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.stroke();
      }
    }
    ctx.restore();

    // Armor plate separation lines (horizontal)
    ctx.strokeStyle = "rgba(20, 20, 22, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    for (let pl = 0; pl < 3; pl++) {
      const plY = y + size * 0.08 + pl * size * 0.12;
      const plW = size * (0.38 - pl * 0.02);
      ctx.beginPath();
      ctx.moveTo(x - plW, plY);
      ctx.quadraticCurveTo(x, plY + size * 0.01, x + plW, plY);
      ctx.stroke();
    }

    // Crimson V-accent with glow
    ctx.shadowColor = "#ff3333";
    ctx.shadowBlur = 5 * zoom * gemPulse;
    const vAccG = ctx.createLinearGradient(x - size * 0.4, y - size * 0.2, x, y + size * 0.2);
    vAccG.addColorStop(0, "#8b1515");
    vAccG.addColorStop(0.3, "#cc2020");
    vAccG.addColorStop(0.5, "#dc2626");
    vAccG.addColorStop(0.7, "#cc2020");
    vAccG.addColorStop(1, "#8b1515");
    ctx.strokeStyle = vAccG;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.38, y - size * 0.18);
    ctx.lineTo(x, y + size * 0.18);
    ctx.lineTo(x + size * 0.38, y - size * 0.18);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Gold filigree neckline
    ctx.strokeStyle = "#9a7a18";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y - size * 0.22);
    ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.28, x, y - size * 0.35);
    ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.28, x + size * 0.35, y - size * 0.22);
    ctx.stroke();
    // Second inner line
    ctx.strokeStyle = "rgba(154, 122, 24, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.32, y - size * 0.20);
    ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.26, x, y - size * 0.32);
    ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.26, x + size * 0.32, y - size * 0.20);
    ctx.stroke();

    // Gold side edge trim
    for (let side = -1; side <= 1; side += 2) {
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.32, y - size * 0.3);
      ctx.lineTo(x + side * size * 0.48, y - size * 0.05);
      ctx.lineTo(x + side * size * 0.4, y + size * 0.52);
      ctx.stroke();
    }

    // Gold dragon wing filigree on each breast panel
    ctx.save();
    drawArmorPath();
    ctx.clip();
    for (let side = -1; side <= 1; side += 2) {
      const wgX = x + side * size * 0.18;
      const wgY = y + size * 0.08;
      ctx.strokeStyle = `rgba(154, 122, 24, ${0.35 + gemPulse * 0.1})`;
      ctx.lineWidth = 1.2 * zoom;
      // Outer wing curve
      ctx.beginPath();
      ctx.moveTo(wgX, wgY - size * 0.12);
      ctx.bezierCurveTo(
        wgX + side * size * 0.12, wgY - size * 0.08,
        wgX + side * size * 0.16, wgY + size * 0.02,
        wgX + side * size * 0.1, wgY + size * 0.1,
      );
      ctx.stroke();
      // Inner ribs
      for (let r = 0; r < 3; r++) {
        const t = 0.3 + r * 0.2;
        ctx.strokeStyle = `rgba(154, 122, 24, ${0.2 + r * 0.05})`;
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(wgX, wgY - size * 0.12 + r * size * 0.04);
        ctx.quadraticCurveTo(
          wgX + side * size * (0.06 + t * 0.06), wgY - size * 0.02 + r * size * 0.03,
          wgX + side * size * (0.04 + t * 0.04), wgY + size * 0.06,
        );
        ctx.stroke();
      }
      // Decorative dots along wing
      ctx.fillStyle = `rgba(218, 165, 32, ${0.35 + gemPulse * 0.15})`;
      for (let d = 0; d < 4; d++) {
        const dt = 0.2 + d * 0.2;
        const dx = wgX + side * size * (0.04 + dt * 0.08);
        const dy = wgY - size * 0.08 + dt * size * 0.16;
        ctx.beginPath();
        ctx.arc(dx, dy, size * 0.005, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Horizontal engraved lines across the belly
    for (let ln = 0; ln < 4; ln++) {
      const lnY = y + size * 0.16 + ln * size * 0.06;
      ctx.strokeStyle = "rgba(120, 90, 16, 0.2)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.25 + ln * size * 0.02, lnY);
      ctx.quadraticCurveTo(x, lnY + size * 0.005, x + size * 0.25 - ln * size * 0.02, lnY);
      ctx.stroke();
    }

    // Crimson accent dots flanking the V
    for (let side = -1; side <= 1; side += 2) {
      for (let d = 0; d < 3; d++) {
        const dAlong = 0.3 + d * 0.25;
        const dx = x + side * size * (0.38 - dAlong * 0.38) * 0.85;
        const dy = y - size * 0.18 + dAlong * size * 0.36;
        ctx.fillStyle = `rgba(220, 38, 38, ${0.3 + gemPulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(dx + side * size * 0.04, dy, size * 0.006, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Central vertical spine line
    ctx.strokeStyle = "rgba(154, 122, 24, 0.25)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.28);
    ctx.lineTo(x, y + size * 0.45);
    ctx.stroke();
    ctx.restore();

    // Armor border — black for contrast, gold inner trim
    ctx.strokeStyle = "#0e0e0e";
    ctx.lineWidth = 2.5 * zoom;
    drawArmorPath();
    ctx.stroke();
    ctx.strokeStyle = "#8a6a15";
    ctx.lineWidth = 1.2 * zoom;
    drawArmorPath();
    ctx.stroke();

    // Central dragon emblem (more detailed)
    {
      const emX = x;
      const emY = y - size * 0.02;

      // Emblem backing plate
      const embG = ctx.createRadialGradient(emX, emY - size * 0.02, 0, emX, emY, size * 0.08);
      embG.addColorStop(0, "#b09025");
      embG.addColorStop(0.6, "#8a6a15");
      embG.addColorStop(1, "#5a4508");
      ctx.fillStyle = embG;
      ctx.beginPath();
      ctx.moveTo(emX, emY - size * 0.1);
      ctx.bezierCurveTo(emX - size * 0.08, emY - size * 0.06, emX - size * 0.07, emY + size * 0.04, emX - size * 0.04, emY + size * 0.09);
      ctx.lineTo(emX, emY + size * 0.06);
      ctx.lineTo(emX + size * 0.04, emY + size * 0.09);
      ctx.bezierCurveTo(emX + size * 0.07, emY + size * 0.04, emX + size * 0.08, emY - size * 0.06, emX, emY - size * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a4508";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Center ruby gem
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 8 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(emX, emY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Gem highlight
      ctx.fillStyle = "#ff9999";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(emX - size * 0.008, emY - size * 0.008, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Waist rivets
    for (let r = -2; r <= 2; r++) {
      const rx = x + r * size * 0.13;
      const ry = y + size * 0.42;
      const rvG = ctx.createRadialGradient(rx - size * 0.002, ry - size * 0.002, 0, rx, ry, size * 0.008);
      rvG.addColorStop(0, "#888");
      rvG.addColorStop(0.5, "#555");
      rvG.addColorStop(1, "#222");
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    }
  }

  // === DRAGON SKIRT ARMOR (in front of breastplate) ===
  drawDragonSkirtArmor(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    isAttacking,
    attackPhase,
    gemPulse,
    flamePulse,
  );

  // === DRAGON PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pX = x + side * size * 0.5;
    const pY = y - size * 0.15;

    // Shadow beneath pauldron
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.ellipse(pX, pY + size * 0.08, size * 0.2, size * 0.06, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Lower rim plate (layered look)
    const rimG = ctx.createRadialGradient(pX - side * size * 0.03, pY + size * 0.04, 0, pX, pY + size * 0.04, size * 0.22);
    rimG.addColorStop(0, "#4a4a4e");
    rimG.addColorStop(0.5, "#353538");
    rimG.addColorStop(1, "#1e1e20");
    ctx.fillStyle = rimG;
    ctx.beginPath();
    ctx.ellipse(pX, pY + size * 0.04, size * 0.23, size * 0.14, side * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.6 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#7a5a10";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(pX, pY + size * 0.04, size * 0.23, size * 0.14, side * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Main pauldron dome
    const pG = ctx.createRadialGradient(
      pX - side * size * 0.06, pY - size * 0.05, size * 0.02,
      pX, pY, size * 0.22,
    );
    pG.addColorStop(0, "#686870");
    pG.addColorStop(0.2, "#555560");
    pG.addColorStop(0.5, "#404048");
    pG.addColorStop(0.8, "#2e2e32");
    pG.addColorStop(1, "#1a1a1e");
    ctx.fillStyle = pG;
    ctx.beginPath();
    ctx.ellipse(pX, pY, size * 0.21, size * 0.15, side * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    const pSpec = ctx.createRadialGradient(pX - side * size * 0.07, pY - size * 0.06, 0, pX - side * size * 0.05, pY - size * 0.04, size * 0.12);
    pSpec.addColorStop(0, "rgba(160, 160, 175, 0.25)");
    pSpec.addColorStop(0.5, "rgba(100, 100, 115, 0.1)");
    pSpec.addColorStop(1, "rgba(60, 60, 70, 0)");
    ctx.fillStyle = pSpec;
    ctx.beginPath();
    ctx.ellipse(pX, pY, size * 0.2, size * 0.14, side * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Dragon scale texture on pauldron (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(pX, pY, size * 0.2, size * 0.14, side * 0.4, 0, Math.PI * 2);
    ctx.clip();
    for (let sr = 0; sr < 3; sr++) {
      for (let sc = -1; sc <= 1; sc++) {
        const sx = pX + (sc * size * 0.07 + sr * side * size * 0.02);
        const sy = pY - size * 0.06 + sr * size * 0.06;
        ctx.fillStyle = "rgba(60, 60, 68, 0.3)";
        ctx.beginPath();
        ctx.ellipse(sx, sy, size * 0.035, size * 0.022, side * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(75, 75, 82, 0.2)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.stroke();
      }
    }
    ctx.restore();

    // Raised ridge line across pauldron
    ctx.strokeStyle = "#555560";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(pX - side * size * 0.15, pY + size * 0.02);
    ctx.quadraticCurveTo(pX, pY - size * 0.08, pX + side * size * 0.18, pY - size * 0.02);
    ctx.stroke();
    ctx.strokeStyle = "rgba(110, 110, 120, 0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pX - side * size * 0.15, pY + size * 0.015);
    ctx.quadraticCurveTo(pX, pY - size * 0.085, pX + side * size * 0.18, pY - size * 0.025);
    ctx.stroke();

    // Dragon horn spike (more refined, curved)
    {
      const spBaseX = pX + side * size * 0.12;
      const spBaseY = pY - size * 0.1;
      const spTipX = pX + side * size * 0.28;
      const spTipY = pY - size * 0.42;

      // Spike shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.beginPath();
      ctx.moveTo(spBaseX - side * size * 0.02, spBaseY + size * 0.02);
      ctx.quadraticCurveTo(spTipX + side * size * 0.02, spTipY + size * 0.04, spTipX + side * size * 0.01, spTipY + size * 0.02);
      ctx.quadraticCurveTo(spBaseX + side * size * 0.03, spBaseY - size * 0.02, spBaseX - side * size * 0.02, spBaseY + size * 0.02);
      ctx.fill();

      // Spike body
      const spG = ctx.createLinearGradient(spBaseX, spBaseY, spTipX, spTipY);
      spG.addColorStop(0, "#3a3a40");
      spG.addColorStop(0.3, "#4a4a52");
      spG.addColorStop(0.6, "#3e3e44");
      spG.addColorStop(1, "#282830");
      ctx.fillStyle = spG;
      ctx.beginPath();
      ctx.moveTo(spBaseX - side * size * 0.025, spBaseY);
      ctx.quadraticCurveTo(
        (spBaseX + spTipX) * 0.5 + side * size * 0.03, (spBaseY + spTipY) * 0.5 - size * 0.02,
        spTipX, spTipY,
      );
      ctx.quadraticCurveTo(
        (spBaseX + spTipX) * 0.5 - side * size * 0.01, (spBaseY + spTipY) * 0.5 + size * 0.02,
        spBaseX + side * size * 0.02, spBaseY,
      );
      ctx.closePath();
      ctx.fill();

      // Spike highlight
      ctx.strokeStyle = "rgba(120, 120, 130, 0.35)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(spBaseX, spBaseY - size * 0.01);
      ctx.quadraticCurveTo(
        (spBaseX + spTipX) * 0.5 + side * size * 0.02, (spBaseY + spTipY) * 0.5 - size * 0.01,
        spTipX, spTipY,
      );
      ctx.stroke();

      // Spike border (gold)
      ctx.strokeStyle = "#6a5010";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(spBaseX - side * size * 0.025, spBaseY);
      ctx.quadraticCurveTo(
        (spBaseX + spTipX) * 0.5 + side * size * 0.03, (spBaseY + spTipY) * 0.5 - size * 0.02,
        spTipX, spTipY,
      );
      ctx.quadraticCurveTo(
        (spBaseX + spTipX) * 0.5 - side * size * 0.01, (spBaseY + spTipY) * 0.5 + size * 0.02,
        spBaseX + side * size * 0.02, spBaseY,
      );
      ctx.closePath();
      ctx.stroke();
    }

    // Engraved arc filigree on pauldron face
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(pX, pY, size * 0.19, size * 0.13, side * 0.4, 0, Math.PI * 2);
    ctx.clip();
    for (let arc = 0; arc < 3; arc++) {
      const arcOff = (arc - 1) * size * 0.06;
      ctx.strokeStyle = `rgba(154, 122, 24, ${0.2 + arc * 0.05})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.arc(pX + arcOff * side, pY + size * 0.08, size * 0.12 + arc * size * 0.02, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();
    }
    // Cross-hatch pattern on lower half
    for (let hx = -2; hx <= 2; hx++) {
      const lx = pX + hx * size * 0.04;
      ctx.strokeStyle = "rgba(100, 100, 110, 0.12)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, pY);
      ctx.lineTo(lx + side * size * 0.03, pY + size * 0.1);
      ctx.stroke();
    }
    ctx.restore();

    // Gold trim ring — black base with gold
    ctx.strokeStyle = "#0e0e0e";
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(pX, pY, size * 0.21, size * 0.15, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#9a7a18";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.ellipse(pX, pY, size * 0.21, size * 0.15, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Gold outer border
    ctx.strokeStyle = "#6a5010";
    ctx.lineWidth = 1.0 * zoom;
    ctx.beginPath();
    ctx.ellipse(pX, pY, size * 0.215, size * 0.155, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Decorative gold dots around pauldron edge
    for (let dd = 0; dd < 8; dd++) {
      const dotA = side * 0.4 + (dd / 8) * Math.PI * 2;
      const dotX = pX + Math.cos(dotA) * size * 0.195;
      const dotY = pY + Math.sin(dotA) * size * 0.14;
      ctx.fillStyle = `rgba(218, 165, 32, ${0.35 + gemPulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, size * 0.004, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ruby gem with gold setting
    {
      const gemX = pX - side * size * 0.02;
      const gemY = pY - size * 0.01;

      // Gold setting ring
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.04, 0, Math.PI * 2);
      ctx.stroke();

      // Ruby
      const gemG = ctx.createRadialGradient(gemX - size * 0.01, gemY - size * 0.01, 0, gemX, gemY, size * 0.035);
      gemG.addColorStop(0, "#ff5555");
      gemG.addColorStop(0.4, "#dc2626");
      gemG.addColorStop(1, "#8b1515");
      ctx.fillStyle = gemG;
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 6 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.033, 0, Math.PI * 2);
      ctx.fill();

      // Gem highlight
      ctx.fillStyle = "rgba(255, 180, 180, 0.5)";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.ellipse(gemX - size * 0.01, gemY - size * 0.01, size * 0.012, size * 0.008, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Side rivets on pauldron edge
    for (let r = 0; r < 3; r++) {
      const rAngle = side * 0.4 + (r - 1) * 0.5;
      const rx = pX + Math.cos(rAngle) * size * 0.19;
      const ry = pY - Math.sin(rAngle) * size * 0.13;
      const rvG = ctx.createRadialGradient(rx - size * 0.002, ry - size * 0.002, 0, rx, ry, size * 0.007);
      rvG.addColorStop(0, "#999");
      rvG.addColorStop(0.5, "#555");
      rvG.addColorStop(1, "#222");
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.007, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === RIGHT ARM (holds flamesword) ===
  {
    const rShoulderX = x + size * 0.42;
    const rShoulderY = y - size * 0.02;
    const swordOriginX = x + size * 0.55;
    const swordOriginY = y + size * 0.08;
    const swordGripLocalY = size * 0.15;
    const swordBaseAngleR = 0.7 + swordSwing * 1.4;
    const swordAngleR = resolveWeaponRotation(
      targetPos,
      swordOriginX,
      swordOriginY,
      swordBaseAngleR,
      Math.PI / 2,
      isAttacking ? 1.35 : 0.8,
      WEAPON_LIMITS.rightMelee,
    );
    const gripWX = swordOriginX - Math.sin(swordAngleR) * swordGripLocalY;
    const gripWY = swordOriginY + Math.cos(swordAngleR) * swordGripLocalY;
    const rArmAngle = Math.atan2(gripWY - rShoulderY, gripWX - rShoulderX);
    const rArmDist = Math.hypot(gripWX - rShoulderX, gripWY - rShoulderY);
    const rUpperLen = Math.min(rArmDist * 0.55, size * 0.28);
    const rElbowX = rShoulderX + Math.cos(rArmAngle) * rUpperLen;
    const rElbowY = rShoulderY + Math.sin(rArmAngle) * rUpperLen;
    const rForeAngle = Math.atan2(gripWY - rElbowY, gripWX - rElbowX);
    const rForeLen = Math.hypot(gripWX - rElbowX, gripWY - rElbowY);

    // Upper arm plate
    ctx.save();
    ctx.translate(rShoulderX, rShoulderY);
    ctx.rotate(rArmAngle);
    const rUpG = ctx.createLinearGradient(0, -size * 0.055, 0, size * 0.055);
    rUpG.addColorStop(0, "#606060");
    rUpG.addColorStop(0.3, "#4a4a4a");
    rUpG.addColorStop(0.7, "#3a3a3a");
    rUpG.addColorStop(1, "#222222");
    ctx.fillStyle = rUpG;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.01,
      -size * 0.055,
      rUpperLen + size * 0.02,
      size * 0.11,
      size * 0.025,
    );
    ctx.fill();
    // Black border then gold
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#7a5a10";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Dragon scale engraving on upper arm (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.01,
      -size * 0.055,
      rUpperLen + size * 0.02,
      size * 0.11,
      size * 0.025,
    );
    ctx.clip();
    for (let sc = 0; sc < 3; sc++) {
      const scX = rUpperLen * (0.15 + sc * 0.25);
      ctx.strokeStyle = "rgba(154, 122, 24, 0.18)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.arc(scX, 0, size * 0.03, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
    }
    // Crimson accent line
    ctx.strokeStyle = `rgba(220, 38, 38, 0.25)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rUpperLen * 0.1, 0);
    ctx.lineTo(rUpperLen * 0.9, 0);
    ctx.stroke();
    ctx.restore();
    // Segment line
    ctx.strokeStyle = "rgba(100, 100, 100, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rUpperLen * 0.4, -size * 0.05);
    ctx.lineTo(rUpperLen * 0.4, size * 0.05);
    ctx.stroke();
    // Gold trim band
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rUpperLen * 0.7, -size * 0.055);
    ctx.lineTo(rUpperLen * 0.7, size * 0.055);
    ctx.stroke();
    // Second gold trim band near shoulder
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rUpperLen * 0.15, -size * 0.055);
    ctx.lineTo(rUpperLen * 0.15, size * 0.055);
    ctx.stroke();
    ctx.restore();

    // Elbow cop with dragon scale
    const elbowCopG = ctx.createRadialGradient(
      rElbowX - size * 0.01,
      rElbowY - size * 0.01,
      0,
      rElbowX,
      rElbowY,
      size * 0.06,
    );
    elbowCopG.addColorStop(0, "#6a6a6a");
    elbowCopG.addColorStop(0.5, "#3a3a3a");
    elbowCopG.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = elbowCopG;
    ctx.beginPath();
    ctx.arc(rElbowX, rElbowY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // Black then gold border
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    // Engraved arcs on elbow cop
    ctx.save();
    ctx.beginPath();
    ctx.arc(rElbowX, rElbowY, size * 0.055, 0, Math.PI * 2);
    ctx.clip();
    for (let ea = 0; ea < 3; ea++) {
      ctx.strokeStyle = "rgba(154, 122, 24, 0.2)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(rElbowX, rElbowY, size * (0.025 + ea * 0.012), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // Dragon eye rivet with gold setting
    ctx.strokeStyle = "#8a6a15";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(rElbowX, rElbowY, size * 0.02, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(rElbowX, rElbowY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Forearm plate
    ctx.save();
    ctx.translate(rElbowX, rElbowY);
    ctx.rotate(rForeAngle);
    const rFoG = ctx.createLinearGradient(0, -size * 0.048, 0, size * 0.048);
    rFoG.addColorStop(0, "#555555");
    rFoG.addColorStop(0.3, "#444444");
    rFoG.addColorStop(0.7, "#333333");
    rFoG.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = rFoG;
    ctx.beginPath();
    ctx.roundRect(0, -size * 0.048, rForeLen, size * 0.096, size * 0.02);
    ctx.fill();
    // Black border then gold
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#7a5a10";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Dragon wing engraving (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, -size * 0.048, rForeLen, size * 0.096, size * 0.02);
    ctx.clip();
    ctx.strokeStyle = "rgba(154, 122, 24, 0.2)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rForeLen * 0.2, -size * 0.03);
    ctx.quadraticCurveTo(rForeLen * 0.5, size * 0.01, rForeLen * 0.8, -size * 0.03);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rForeLen * 0.2, size * 0.03);
    ctx.quadraticCurveTo(rForeLen * 0.5, -size * 0.01, rForeLen * 0.8, size * 0.03);
    ctx.stroke();
    // Scale dots
    for (let sd = 0; sd < 3; sd++) {
      ctx.fillStyle = "rgba(154, 122, 24, 0.15)";
      ctx.beginPath();
      ctx.arc(rForeLen * (0.3 + sd * 0.2), 0, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Crimson accent stripe
    ctx.strokeStyle = `rgba(220, 38, 38, ${0.4 + gemPulse * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rForeLen * 0.15, 0);
    ctx.lineTo(rForeLen * 0.85, 0);
    ctx.stroke();
    // Gold wrist band
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rForeLen - size * 0.02, -size * 0.048);
    ctx.lineTo(rForeLen - size * 0.02, size * 0.048);
    ctx.stroke();
    // Second gold band near elbow
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.015, -size * 0.048);
    ctx.lineTo(size * 0.015, size * 0.048);
    ctx.stroke();
    ctx.restore();

    // Dragonscale gauntlet
    const gauntG = ctx.createRadialGradient(
      gripWX - size * 0.01,
      gripWY - size * 0.01,
      0,
      gripWX,
      gripWY,
      size * 0.055,
    );
    gauntG.addColorStop(0, "#555555");
    gauntG.addColorStop(0.5, "#333333");
    gauntG.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = gauntG;
    ctx.beginPath();
    ctx.arc(gripWX, gripWY, size * 0.048, 0, Math.PI * 2);
    ctx.fill();
    // Black then gold border
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 0.9 * zoom;
    ctx.stroke();
    // Dragon scale etching on gauntlet
    ctx.save();
    ctx.beginPath();
    ctx.arc(gripWX, gripWY, size * 0.046, 0, Math.PI * 2);
    ctx.clip();
    for (let gs = 0; gs < 3; gs++) {
      const gsA = rForeAngle + (gs - 1) * 0.6;
      ctx.strokeStyle = "rgba(154, 122, 24, 0.15)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(
        gripWX + Math.cos(gsA) * size * 0.01,
        gripWY + Math.sin(gsA) * size * 0.01,
        size * 0.025, gsA - 0.8, gsA + 0.8,
      );
      ctx.stroke();
    }
    ctx.restore();
    // Knuckle plates with gold trim
    for (let k = 0; k < 4; k++) {
      const ka = rForeAngle - 0.5 + k * 0.35;
      const kx = gripWX + Math.cos(ka) * size * 0.04;
      const ky = gripWY + Math.sin(ka) * size * 0.04;
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.arc(kx, ky, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(154, 122, 24, 0.3)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    }
  }

  // === LEFT ARM (holds war standard) ===
  {
    const lShoulderX = x - size * 0.42;
    const lShoulderY = y - size * 0.02;
    const flagOriginX = x - size * 0.62;
    const flagOriginY = y + size * 0.12;
    const flagRotation = -0.15;
    const flagGripLocalY = -size * 0.25;
    const gripFX = flagOriginX - Math.sin(flagRotation) * flagGripLocalY;
    const gripFY = flagOriginY + Math.cos(flagRotation) * flagGripLocalY;
    const lArmAngle = Math.atan2(gripFY - lShoulderY, gripFX - lShoulderX);
    const lArmDist = Math.hypot(gripFX - lShoulderX, gripFY - lShoulderY);
    const lUpperLen = Math.min(lArmDist * 0.55, size * 0.28);
    const lElbowX = lShoulderX + Math.cos(lArmAngle) * lUpperLen;
    const lElbowY = lShoulderY + Math.sin(lArmAngle) * lUpperLen;
    const lForeAngle = Math.atan2(gripFY - lElbowY, gripFX - lElbowX);
    const lForeLen = Math.hypot(gripFX - lElbowX, gripFY - lElbowY);

    // Upper arm plate
    ctx.save();
    ctx.translate(lShoulderX, lShoulderY);
    ctx.rotate(lArmAngle);
    const lUpG = ctx.createLinearGradient(0, -size * 0.055, 0, size * 0.055);
    lUpG.addColorStop(0, "#606060");
    lUpG.addColorStop(0.3, "#4a4a4a");
    lUpG.addColorStop(0.7, "#3a3a3a");
    lUpG.addColorStop(1, "#222222");
    ctx.fillStyle = lUpG;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.01,
      -size * 0.055,
      lUpperLen + size * 0.02,
      size * 0.11,
      size * 0.025,
    );
    ctx.fill();
    // Black border then gold
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#7a5a10";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Dragon scale engraving (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.01,
      -size * 0.055,
      lUpperLen + size * 0.02,
      size * 0.11,
      size * 0.025,
    );
    ctx.clip();
    for (let sc = 0; sc < 3; sc++) {
      const scX = lUpperLen * (0.15 + sc * 0.25);
      ctx.strokeStyle = "rgba(154, 122, 24, 0.18)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.arc(scX, 0, size * 0.03, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(220, 38, 38, 0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(lUpperLen * 0.1, 0);
    ctx.lineTo(lUpperLen * 0.9, 0);
    ctx.stroke();
    ctx.restore();
    // Segment line
    ctx.strokeStyle = "rgba(100, 100, 100, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(lUpperLen * 0.4, -size * 0.05);
    ctx.lineTo(lUpperLen * 0.4, size * 0.05);
    ctx.stroke();
    // Gold trim bands
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lUpperLen * 0.7, -size * 0.055);
    ctx.lineTo(lUpperLen * 0.7, size * 0.055);
    ctx.stroke();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(lUpperLen * 0.15, -size * 0.055);
    ctx.lineTo(lUpperLen * 0.15, size * 0.055);
    ctx.stroke();
    ctx.restore();

    // Elbow cop
    const lElbG = ctx.createRadialGradient(
      lElbowX - size * 0.01,
      lElbowY - size * 0.01,
      0,
      lElbowX,
      lElbowY,
      size * 0.06,
    );
    lElbG.addColorStop(0, "#6a6a6a");
    lElbG.addColorStop(0.5, "#3a3a3a");
    lElbG.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = lElbG;
    ctx.beginPath();
    ctx.arc(lElbowX, lElbowY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // Black then gold border
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    // Engraved arcs on elbow cop
    ctx.save();
    ctx.beginPath();
    ctx.arc(lElbowX, lElbowY, size * 0.055, 0, Math.PI * 2);
    ctx.clip();
    for (let ea = 0; ea < 3; ea++) {
      ctx.strokeStyle = "rgba(154, 122, 24, 0.2)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(lElbowX, lElbowY, size * (0.025 + ea * 0.012), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // Dragon eye rivet with gold setting
    ctx.strokeStyle = "#8a6a15";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(lElbowX, lElbowY, size * 0.02, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(lElbowX, lElbowY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Forearm plate
    ctx.save();
    ctx.translate(lElbowX, lElbowY);
    ctx.rotate(lForeAngle);
    const lFoG = ctx.createLinearGradient(0, -size * 0.048, 0, size * 0.048);
    lFoG.addColorStop(0, "#555555");
    lFoG.addColorStop(0.3, "#444444");
    lFoG.addColorStop(0.7, "#333333");
    lFoG.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = lFoG;
    ctx.beginPath();
    ctx.roundRect(0, -size * 0.048, lForeLen, size * 0.096, size * 0.02);
    ctx.fill();
    // Black border then gold
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#7a5a10";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Dragon wing engraving (clipped)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, -size * 0.048, lForeLen, size * 0.096, size * 0.02);
    ctx.clip();
    ctx.strokeStyle = "rgba(154, 122, 24, 0.2)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lForeLen * 0.2, -size * 0.03);
    ctx.quadraticCurveTo(lForeLen * 0.5, size * 0.01, lForeLen * 0.8, -size * 0.03);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lForeLen * 0.2, size * 0.03);
    ctx.quadraticCurveTo(lForeLen * 0.5, -size * 0.01, lForeLen * 0.8, size * 0.03);
    ctx.stroke();
    for (let sd = 0; sd < 3; sd++) {
      ctx.fillStyle = "rgba(154, 122, 24, 0.15)";
      ctx.beginPath();
      ctx.arc(lForeLen * (0.3 + sd * 0.2), 0, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Crimson accent stripe
    ctx.strokeStyle = `rgba(220, 38, 38, ${0.4 + gemPulse * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lForeLen * 0.15, 0);
    ctx.lineTo(lForeLen * 0.85, 0);
    ctx.stroke();
    // Gold wrist band
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(lForeLen - size * 0.02, -size * 0.048);
    ctx.lineTo(lForeLen - size * 0.02, size * 0.048);
    ctx.stroke();
    // Second gold band near elbow
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.015, -size * 0.048);
    ctx.lineTo(size * 0.015, size * 0.048);
    ctx.stroke();
    ctx.restore();

    // Dragonscale gauntlet
    const lGauntG = ctx.createRadialGradient(
      gripFX - size * 0.01,
      gripFY - size * 0.01,
      0,
      gripFX,
      gripFY,
      size * 0.055,
    );
    lGauntG.addColorStop(0, "#555555");
    lGauntG.addColorStop(0.5, "#333333");
    lGauntG.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = lGauntG;
    ctx.beginPath();
    ctx.arc(gripFX, gripFY, size * 0.048, 0, Math.PI * 2);
    ctx.fill();
    // Black then gold border
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 0.9 * zoom;
    ctx.stroke();
    // Dragon scale etching
    ctx.save();
    ctx.beginPath();
    ctx.arc(gripFX, gripFY, size * 0.046, 0, Math.PI * 2);
    ctx.clip();
    for (let gs = 0; gs < 3; gs++) {
      const gsA = lForeAngle + (gs - 1) * 0.6;
      ctx.strokeStyle = "rgba(154, 122, 24, 0.15)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(
        gripFX + Math.cos(gsA) * size * 0.01,
        gripFY + Math.sin(gsA) * size * 0.01,
        size * 0.025, gsA - 0.8, gsA + 0.8,
      );
      ctx.stroke();
    }
    ctx.restore();
    // Knuckle plates with gold trim
    for (let k = 0; k < 4; k++) {
      const ka = lForeAngle - 0.5 + k * 0.35;
      const kx = gripFX + Math.cos(ka) * size * 0.04;
      const ky = gripFY + Math.sin(ka) * size * 0.04;
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.arc(kx, ky, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(154, 122, 24, 0.3)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    }
  }

  // === LEGENDARY FLAMESWORD ===
  const swordBaseAngle = 0.7 + swordSwing * 1.4;
  const swordAngle = resolveWeaponRotation(
    targetPos,
    x + size * 0.55,
    y + size * 0.08,
    swordBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.35 : 0.8,
    WEAPON_LIMITS.rightMelee,
  );
  ctx.save();
  ctx.translate(x + size * 0.55, y + size * 0.08);
  ctx.rotate(swordAngle);

  // --- FLAME AURA ---
  {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 20 * zoom * (0.7 + attackIntensity * 0.3);
    // Outer glow haze
    const auraG = ctx.createRadialGradient(0, -size * 0.5, 0, 0, -size * 0.5, size * 0.2);
    auraG.addColorStop(0, `rgba(255, 80, 20, ${0.12 + attackIntensity * 0.1})`);
    auraG.addColorStop(0.6, `rgba(255, 50, 10, ${0.05 + attackIntensity * 0.05})`);
    auraG.addColorStop(1, "rgba(255, 30, 0, 0)");
    ctx.fillStyle = auraG;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.5, size * 0.16, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    // Flame tongues along blade
    for (let flame = 0; flame < 14; flame++) {
      const flameY = -size * 0.08 - flame * size * 0.07;
      const flameX = Math.sin(time * 9 + flame * 0.8) * size * 0.04;
      const flameH = size * (0.04 + Math.sin(time * 7 + flame * 1.2) * 0.015);
      const flameW = size * (0.015 + flame * 0.001);
      const r = 255;
      const g = Math.max(0, 180 - flame * 10);
      const b = Math.max(0, 60 - flame * 4);
      const a = 0.35 + Math.sin(time * 6 + flame) * 0.15;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.beginPath();
      ctx.ellipse(flameX, flameY, flameW, flameH, Math.sin(time * 5 + flame) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // --- BLADE ---
  {
    // Blade path helper
    const drawBladePath = () => {
      ctx.beginPath();
      ctx.moveTo(-size * 0.065, 0);
      ctx.bezierCurveTo(-size * 0.072, -size * 0.25, -size * 0.078, -size * 0.55, -size * 0.075, -size * 0.78);
      ctx.bezierCurveTo(-size * 0.07, -size * 0.88, -size * 0.04, -size * 0.98, 0, -size * 1.12);
      ctx.bezierCurveTo(size * 0.04, -size * 0.98, size * 0.07, -size * 0.88, size * 0.075, -size * 0.78);
      ctx.bezierCurveTo(size * 0.078, -size * 0.55, size * 0.072, -size * 0.25, size * 0.065, 0);
      ctx.closePath();
    };

    // Base steel fill with rich gradient
    const bladeG = ctx.createLinearGradient(-size * 0.08, 0, size * 0.08, 0);
    bladeG.addColorStop(0, "#50505a");
    bladeG.addColorStop(0.1, "#75757e");
    bladeG.addColorStop(0.25, "#a0a0a8");
    bladeG.addColorStop(0.4, "#d0d0d8");
    bladeG.addColorStop(0.5, "#eaeaf2");
    bladeG.addColorStop(0.6, "#d0d0d8");
    bladeG.addColorStop(0.75, "#a0a0a8");
    bladeG.addColorStop(0.9, "#75757e");
    bladeG.addColorStop(1, "#50505a");
    ctx.fillStyle = bladeG;
    drawBladePath();
    ctx.fill();

    // Central fuller (blood groove)
    const fullerG = ctx.createLinearGradient(-size * 0.012, 0, size * 0.012, 0);
    fullerG.addColorStop(0, "rgba(60, 60, 68, 0.5)");
    fullerG.addColorStop(0.5, "rgba(40, 40, 48, 0.6)");
    fullerG.addColorStop(1, "rgba(60, 60, 68, 0.5)");
    ctx.fillStyle = fullerG;
    ctx.beginPath();
    ctx.moveTo(-size * 0.012, -size * 0.06);
    ctx.lineTo(-size * 0.012, -size * 0.88);
    ctx.lineTo(0, -size * 0.95);
    ctx.lineTo(size * 0.012, -size * 0.88);
    ctx.lineTo(size * 0.012, -size * 0.06);
    ctx.closePath();
    ctx.fill();

    // Fire edge glow (left edge, hotter)
    ctx.strokeStyle = `rgba(255, 100, 40, ${0.6 + flamePulse * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 12 * zoom * flamePulse;
    ctx.beginPath();
    ctx.moveTo(-size * 0.065, -size * 0.02);
    ctx.bezierCurveTo(-size * 0.072, -size * 0.25, -size * 0.078, -size * 0.55, -size * 0.075, -size * 0.78);
    ctx.bezierCurveTo(-size * 0.07, -size * 0.88, -size * 0.04, -size * 0.98, 0, -size * 1.12);
    ctx.stroke();
    // Right edge (cooler)
    ctx.strokeStyle = `rgba(255, 140, 60, ${0.35 + flamePulse * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.shadowBlur = 8 * zoom * flamePulse;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.12);
    ctx.bezierCurveTo(size * 0.04, -size * 0.98, size * 0.07, -size * 0.88, size * 0.075, -size * 0.78);
    ctx.bezierCurveTo(size * 0.078, -size * 0.55, size * 0.072, -size * 0.25, size * 0.065, -size * 0.02);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rune engravings — alternating shapes along the fuller
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 5 * zoom;
    for (let rune = 0; rune < 7; rune++) {
      const ry = -size * 0.1 - rune * size * 0.12;
      const runeAlpha = 0.55 + attackIntensity * 0.35 + Math.sin(time * 4 + rune * 0.9) * 0.1;
      ctx.fillStyle = `rgba(255, 100, 50, ${runeAlpha})`;
      if (rune % 2 === 0) {
        // Diamond rune
        ctx.beginPath();
        ctx.moveTo(0, ry - size * 0.022);
        ctx.lineTo(size * 0.015, ry);
        ctx.lineTo(0, ry + size * 0.022);
        ctx.lineTo(-size * 0.015, ry);
        ctx.closePath();
        ctx.fill();
      } else {
        // Cross rune
        ctx.fillRect(-size * 0.012, ry - size * 0.003, size * 0.024, size * 0.006);
        ctx.fillRect(-size * 0.003, ry - size * 0.015, size * 0.006, size * 0.03);
      }
    }
    ctx.shadowBlur = 0;

    // Specular highlight line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, -size * 0.05);
    ctx.bezierCurveTo(-size * 0.035, -size * 0.4, -size * 0.03, -size * 0.75, -size * 0.015, -size * 0.95);
    ctx.stroke();

    // Blade black border
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1.2 * zoom;
    drawBladePath();
    ctx.stroke();
  }

  // --- CROSSGUARD (dragon wings) ---
  {
    // Guard shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.01, size * 0.25, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let side = -1; side <= 1; side += 2) {
      // Dragon wing quillon
      const gG = ctx.createLinearGradient(0, -size * 0.06, side * size * 0.26, size * 0.01);
      gG.addColorStop(0, "#c9a227");
      gG.addColorStop(0.3, "#f0d040");
      gG.addColorStop(0.5, "#ffe060");
      gG.addColorStop(0.7, "#f0d040");
      gG.addColorStop(1, "#8a6a15");
      ctx.fillStyle = gG;
      ctx.beginPath();
      ctx.moveTo(side * size * 0.06, -size * 0.05);
      ctx.bezierCurveTo(
        side * size * 0.12, -size * 0.08,
        side * size * 0.2, -size * 0.07,
        side * size * 0.26, -size * 0.04,
      );
      // Wing tip curls up
      ctx.bezierCurveTo(
        side * size * 0.27, -size * 0.06,
        side * size * 0.28, -size * 0.09,
        side * size * 0.25, -size * 0.12,
      );
      // Back edge sweeps down
      ctx.bezierCurveTo(
        side * size * 0.22, -size * 0.06,
        side * size * 0.16, 0,
        side * size * 0.1, size * 0.03,
      );
      ctx.bezierCurveTo(
        side * size * 0.08, size * 0.04,
        side * size * 0.06, size * 0.04,
        side * size * 0.04, size * 0.03,
      );
      ctx.closePath();
      ctx.fill();

      // Feather veins on quillon
      ctx.strokeStyle = "rgba(96, 64, 8, 0.3)";
      ctx.lineWidth = 0.5 * zoom;
      for (let v = 0; v < 3; v++) {
        ctx.beginPath();
        ctx.moveTo(side * size * (0.08 + v * 0.04), -size * 0.05);
        ctx.quadraticCurveTo(
          side * size * (0.12 + v * 0.04), -size * 0.01,
          side * size * (0.08 + v * 0.02), size * 0.02,
        );
        ctx.stroke();
      }

      // Black border
      ctx.strokeStyle = "#1a1008";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(side * size * 0.06, -size * 0.05);
      ctx.bezierCurveTo(
        side * size * 0.12, -size * 0.08,
        side * size * 0.2, -size * 0.07,
        side * size * 0.26, -size * 0.04,
      );
      ctx.bezierCurveTo(
        side * size * 0.27, -size * 0.06,
        side * size * 0.28, -size * 0.09,
        side * size * 0.25, -size * 0.12,
      );
      ctx.stroke();

      // Dragon eye gem on guard
      const gemX = side * size * 0.15;
      const gemY = -size * 0.03;
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(gemX, gemY, size * 0.022, size * 0.016, 0, 0, Math.PI * 2);
      ctx.stroke();
      const eyeG = ctx.createRadialGradient(gemX - size * 0.005, gemY - size * 0.005, 0, gemX, gemY, size * 0.02);
      eyeG.addColorStop(0, "#ff6666");
      eyeG.addColorStop(0.5, "#dc2626");
      eyeG.addColorStop(1, "#8b1515");
      ctx.fillStyle = eyeG;
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 5 * zoom * gemPulse;
      ctx.beginPath();
      ctx.ellipse(gemX, gemY, size * 0.018, size * 0.013, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Eye slit pupil
      ctx.fillStyle = "#1a0505";
      ctx.beginPath();
      ctx.ellipse(gemX, gemY, size * 0.003, size * 0.01, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center guard plate
    const centerG = ctx.createRadialGradient(0, -size * 0.01, 0, 0, -size * 0.01, size * 0.06);
    centerG.addColorStop(0, "#ffe060");
    centerG.addColorStop(0.4, "#daa520");
    centerG.addColorStop(0.8, "#8a6a15");
    centerG.addColorStop(1, "#5a4008");
    ctx.fillStyle = centerG;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.01, size * 0.055, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a2808";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Center ruby
    const cRG = ctx.createRadialGradient(-size * 0.003, -size * 0.015, 0, 0, -size * 0.01, size * 0.018);
    cRG.addColorStop(0, "#ff7777");
    cRG.addColorStop(0.5, "#dc2626");
    cRG.addColorStop(1, "#6b0505");
    ctx.fillStyle = cRG;
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 6 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(0, -size * 0.01, size * 0.016, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // --- HILT (leather-wrapped two-handed grip) ---
  {
    // Leather base
    const hiltG = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
    hiltG.addColorStop(0, "#1a0805");
    hiltG.addColorStop(0.2, "#3a1810");
    hiltG.addColorStop(0.4, "#5a2818");
    hiltG.addColorStop(0.5, "#6a3420");
    hiltG.addColorStop(0.6, "#5a2818");
    hiltG.addColorStop(0.8, "#3a1810");
    hiltG.addColorStop(1, "#1a0805");
    ctx.fillStyle = hiltG;
    ctx.beginPath();
    ctx.roundRect(-size * 0.035, size * 0.02, size * 0.07, size * 0.25, size * 0.008);
    ctx.fill();
    ctx.strokeStyle = "#0a0505";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Gold wire wrapping
    for (let wrap = 0; wrap < 8; wrap++) {
      const wy = size * 0.035 + wrap * size * 0.028;
      const wrapG = ctx.createLinearGradient(-size * 0.035, wy, size * 0.035, wy);
      wrapG.addColorStop(0, "#6a4a08");
      wrapG.addColorStop(0.5, "#daa520");
      wrapG.addColorStop(1, "#6a4a08");
      ctx.strokeStyle = wrapG;
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(-size * 0.035, wy);
      ctx.lineTo(size * 0.035, wy + size * 0.014);
      ctx.stroke();
    }

    // Mid-hilt gold ring
    const ringY = size * 0.14;
    const ringG = ctx.createLinearGradient(-size * 0.04, ringY, size * 0.04, ringY);
    ringG.addColorStop(0, "#7a5a10");
    ringG.addColorStop(0.3, "#c9a227");
    ringG.addColorStop(0.5, "#f0d040");
    ringG.addColorStop(0.7, "#c9a227");
    ringG.addColorStop(1, "#7a5a10");
    ctx.fillStyle = ringG;
    ctx.fillRect(-size * 0.042, ringY - size * 0.008, size * 0.084, size * 0.016);
    ctx.strokeStyle = "#5a4008";
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(-size * 0.042, ringY - size * 0.008, size * 0.084, size * 0.016);
  }

  // --- POMMEL (dragon head) ---
  {
    const pomY = size * 0.28;
    // Pommel body with gradient
    const pomG = ctx.createRadialGradient(0, pomY + size * 0.04, 0, 0, pomY + size * 0.04, size * 0.07);
    pomG.addColorStop(0, "#f0d040");
    pomG.addColorStop(0.3, "#daa520");
    pomG.addColorStop(0.6, "#b08a20");
    pomG.addColorStop(1, "#6a4a08");
    ctx.fillStyle = pomG;
    ctx.beginPath();
    ctx.moveTo(0, pomY);
    ctx.bezierCurveTo(-size * 0.04, pomY, -size * 0.07, pomY + size * 0.02, -size * 0.07, pomY + size * 0.05);
    ctx.bezierCurveTo(-size * 0.07, pomY + size * 0.08, -size * 0.04, pomY + size * 0.11, 0, pomY + size * 0.12);
    ctx.bezierCurveTo(size * 0.04, pomY + size * 0.11, size * 0.07, pomY + size * 0.08, size * 0.07, pomY + size * 0.05);
    ctx.bezierCurveTo(size * 0.07, pomY + size * 0.02, size * 0.04, pomY, 0, pomY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a2808";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Dragon face etching
    ctx.strokeStyle = "rgba(96, 64, 8, 0.4)";
    ctx.lineWidth = 0.5 * zoom;
    // Nostrils
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.arc(side * size * 0.015, pomY + size * 0.035, size * 0.006, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Brow ridges
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(side * size * 0.005, pomY + size * 0.055);
      ctx.quadraticCurveTo(side * size * 0.03, pomY + size * 0.04, side * size * 0.04, pomY + size * 0.06);
      ctx.stroke();
    }

    // Center ruby eye
    const pomRG = ctx.createRadialGradient(-size * 0.003, pomY + size * 0.055, 0, 0, pomY + size * 0.06, size * 0.02);
    pomRG.addColorStop(0, "#ff7777");
    pomRG.addColorStop(0.4, "#dc2626");
    pomRG.addColorStop(1, "#6b0505");
    ctx.fillStyle = pomRG;
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 5 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(0, pomY + size * 0.06, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = "rgba(255, 200, 200, 0.4)";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(-size * 0.005, pomY + size * 0.055, size * 0.007, size * 0.005, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // === LEGENDARY WAR STANDARD (Facing Left) ===
  ctx.save();
  ctx.translate(x - size * 0.62, y + size * 0.12);
  ctx.rotate(-0.15);

  // --- POLE (ornate dark wood with gold fittings) ---
  {
    const poleW = size * 0.05;
    const poleTop = -size * 0.88;
    const poleBot = size * 0.1;
    // Wood grain base
    const poleG = ctx.createLinearGradient(-poleW * 0.5, 0, poleW * 0.5, 0);
    poleG.addColorStop(0, "#2a0c04");
    poleG.addColorStop(0.2, "#4a1c0c");
    poleG.addColorStop(0.4, "#6a2c14");
    poleG.addColorStop(0.5, "#7a3418");
    poleG.addColorStop(0.6, "#6a2c14");
    poleG.addColorStop(0.8, "#4a1c0c");
    poleG.addColorStop(1, "#2a0c04");
    ctx.fillStyle = poleG;
    ctx.beginPath();
    ctx.roundRect(-poleW * 0.5, poleTop, poleW, poleBot - poleTop, size * 0.006);
    ctx.fill();
    ctx.strokeStyle = "#1a0804";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Wood grain texture lines
    ctx.strokeStyle = "rgba(90, 40, 15, 0.25)";
    ctx.lineWidth = 0.4 * zoom;
    for (let g = 0; g < 6; g++) {
      const gx = -poleW * 0.3 + g * poleW * 0.12;
      ctx.beginPath();
      ctx.moveTo(gx, poleTop + size * 0.02);
      ctx.bezierCurveTo(gx + size * 0.003, poleTop + (poleBot - poleTop) * 0.3, gx - size * 0.003, poleTop + (poleBot - poleTop) * 0.7, gx, poleBot - size * 0.02);
      ctx.stroke();
    }

    // Gold ferrule rings (wider, more ornate)
    const ringPositions = [poleTop + size * 0.02, poleTop + size * 0.22, poleTop + size * 0.46, poleTop + size * 0.7];
    for (const ry of ringPositions) {
      const rG = ctx.createLinearGradient(-poleW * 0.65, ry, poleW * 0.65, ry);
      rG.addColorStop(0, "#6a4a08");
      rG.addColorStop(0.25, "#c9a227");
      rG.addColorStop(0.5, "#f0d040");
      rG.addColorStop(0.75, "#c9a227");
      rG.addColorStop(1, "#6a4a08");
      ctx.fillStyle = rG;
      ctx.beginPath();
      ctx.roundRect(-poleW * 0.65, ry, poleW * 1.3, size * 0.028, size * 0.004);
      ctx.fill();
      ctx.strokeStyle = "#5a4008";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
      // Etched notch on each ring
      ctx.strokeStyle = "rgba(96, 64, 8, 0.3)";
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(-poleW * 0.4, ry + size * 0.014);
      ctx.lineTo(poleW * 0.4, ry + size * 0.014);
      ctx.stroke();
    }
  }

  // --- FINIAL (golden orb on pole top) ---
  {
    const orbY = -size * 0.92;
    const orbR = size * 0.045;

    // Orb body
    const orbG = ctx.createRadialGradient(
      -orbR * 0.3, orbY - orbR * 0.3, 0,
      0, orbY, orbR,
    );
    orbG.addColorStop(0, "#ffe070");
    orbG.addColorStop(0.3, "#f0d040");
    orbG.addColorStop(0.6, "#c9a227");
    orbG.addColorStop(1, "#6a4a08");
    ctx.fillStyle = orbG;
    ctx.beginPath();
    ctx.arc(0, orbY, orbR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a2808";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Spike on top of orb
    const spikeH = size * 0.1;
    const spikeW = size * 0.015;
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.moveTo(0, orbY - orbR - spikeH);
    ctx.lineTo(-spikeW, orbY - orbR + size * 0.005);
    ctx.lineTo(spikeW, orbY - orbR + size * 0.005);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a4008";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Ruby gem in orb center
    const gemG = ctx.createRadialGradient(
      -size * 0.003, orbY - size * 0.003, 0,
      0, orbY, size * 0.016,
    );
    gemG.addColorStop(0, "#ff7777");
    gemG.addColorStop(0.5, "#dc2626");
    gemG.addColorStop(1, "#6b0505");
    ctx.fillStyle = gemG;
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 5 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(0, orbY, size * 0.016, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Collar where orb meets pole
    const collarG = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
    collarG.addColorStop(0, "#6a4a08");
    collarG.addColorStop(0.5, "#daa520");
    collarG.addColorStop(1, "#6a4a08");
    ctx.fillStyle = collarG;
    ctx.fillRect(-size * 0.035, -size * 0.89, size * 0.07, size * 0.025);
    ctx.strokeStyle = "#3a2808";
    ctx.lineWidth = 0.4 * zoom;
    ctx.strokeRect(-size * 0.035, -size * 0.89, size * 0.07, size * 0.025);
  }

  // --- BANNER FABRIC ---
  {
    const bannerWave = Math.sin(time * 4) * 0.2;
    const bannerWave2 = Math.sin(time * 5 + 0.6) * 0.12;
    // Tip wave — single coherent wave for the swallowtail region
    const tipWave = (bannerWave + bannerWave2) * 0.5;

    // Banner path helper — wave amplitude scaled proportionally along the length
    const drawBannerPath = () => {
      const tw = tipWave * size;
      ctx.beginPath();
      ctx.moveTo(-size * 0.025, -size * 0.82);
      ctx.bezierCurveTo(
        -size * 0.22 - tw * 0.15,
        -size * 0.76,
        -size * 0.34 - tw * 0.22,
        -size * 0.55,
        -size * 0.42 - tw * 0.25,
        -size * 0.4,
      );
      // Bottom edge with pointed tail — CP1 continues leftward from junction
      ctx.bezierCurveTo(
        -size * 0.46 - tw * 0.25,
        -size * 0.34,
        -size * 0.48 - tw * 0.22,
        -size * 0.28,
        -size * 0.48 - tw * 0.18,
        -size * 0.22,
      );
      // Swallowtail notch
      ctx.lineTo(-size * 0.38 - tw * 0.18, -size * 0.28);
      // Inner bottom edge
      ctx.bezierCurveTo(
        -size * 0.28 - tw * 0.18,
        -size * 0.25,
        -size * 0.18 - tw * 0.1,
        -size * 0.18,
        -size * 0.025,
        -size * 0.13,
      );
      ctx.closePath();
    };

    // Banner shadow
    ctx.save();
    ctx.translate(size * 0.008, size * 0.012);
    ctx.fillStyle = "rgba(20, 5, 5, 0.2)";
    drawBannerPath();
    ctx.fill();
    ctx.restore();

    // Banner base fabric — rich crimson gradient
    const bannerG = ctx.createLinearGradient(-size * 0.025, -size * 0.5, -size * 0.42, -size * 0.5);
    bannerG.addColorStop(0, "#7a0c0c");
    bannerG.addColorStop(0.15, "#a81515");
    bannerG.addColorStop(0.35, "#cc2020");
    bannerG.addColorStop(0.55, "#dc2626");
    bannerG.addColorStop(0.75, "#c41e1e");
    bannerG.addColorStop(1, "#8a1010");
    ctx.fillStyle = bannerG;
    drawBannerPath();
    ctx.fill();

    // Fabric fold shading (subtle vertical bands)
    ctx.save();
    drawBannerPath();
    ctx.clip();
    for (let fold = 0; fold < 5; fold++) {
      const foldT = fold / 4;
      const foldX = -size * 0.025 + (-size * 0.42 + size * 0.025) * foldT;
      const foldAlpha = 0.08 + Math.sin(time * 3 + fold * 1.5) * 0.03;
      ctx.fillStyle = fold % 2 === 0 ? `rgba(0, 0, 0, ${foldAlpha})` : `rgba(255, 255, 255, ${foldAlpha * 0.5})`;
      ctx.fillRect(foldX - size * 0.03, -size * 0.85, size * 0.03, size * 0.8);
    }
    ctx.restore();

    // Gold border — black then gold double stroke
    ctx.strokeStyle = "#0a0505";
    ctx.lineWidth = 3 * zoom;
    drawBannerPath();
    ctx.stroke();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.8 * zoom;
    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur = 3 * zoom;
    drawBannerPath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Gold inner trim line
    ctx.save();
    drawBannerPath();
    ctx.clip();
    ctx.strokeStyle = "rgba(218, 165, 32, 0.25)";
    ctx.lineWidth = 0.8 * zoom;
    const tw2 = tipWave * size;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, -size * 0.79);
    ctx.bezierCurveTo(
      -size * 0.2 - tw2 * 0.15,
      -size * 0.73,
      -size * 0.3 - tw2 * 0.2,
      -size * 0.52,
      -size * 0.38,
      -size * 0.38,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.05, -size * 0.16);
    ctx.bezierCurveTo(
      -size * 0.16 - tw2 * 0.1,
      -size * 0.2,
      -size * 0.26 - tw2 * 0.15,
      -size * 0.27,
      -size * 0.34,
      -size * 0.26,
    );
    ctx.stroke();
    ctx.restore();

    // --- BANNER EMBLEM (dragon seal) ---
    {
      const emX = -size * 0.2 - tipWave * size * 0.18;
      const emY = -size * 0.48;
      // Gold circle backdrop
      const circG = ctx.createRadialGradient(emX - size * 0.005, emY - size * 0.005, 0, emX, emY, size * 0.08);
      circG.addColorStop(0, "#f0d040");
      circG.addColorStop(0.4, "#daa520");
      circG.addColorStop(0.7, "#b08a20");
      circG.addColorStop(1, "#6a4a08");
      ctx.fillStyle = circG;
      ctx.beginPath();
      ctx.arc(emX, emY, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a2808";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();

      // Inner crimson circle
      ctx.fillStyle = "#8b1010";
      ctx.beginPath();
      ctx.arc(emX, emY, size * 0.06, 0, Math.PI * 2);
      ctx.fill();

      // Dragon silhouette — more detailed
      ctx.fillStyle = "#daa520";
      ctx.beginPath();
      // Head
      ctx.moveTo(emX, emY - size * 0.045);
      // Right wing
      ctx.bezierCurveTo(emX + size * 0.01, emY - size * 0.04, emX + size * 0.035, emY - size * 0.035, emX + size * 0.04, emY - size * 0.02);
      ctx.bezierCurveTo(emX + size * 0.045, emY - size * 0.01, emX + size * 0.035, emY + size * 0.005, emX + size * 0.025, emY + size * 0.01);
      // Right body
      ctx.lineTo(emX + size * 0.015, emY + size * 0.025);
      // Tail
      ctx.bezierCurveTo(emX + size * 0.02, emY + size * 0.04, emX + size * 0.005, emY + size * 0.045, emX, emY + size * 0.04);
      // Left side mirror
      ctx.bezierCurveTo(emX - size * 0.005, emY + size * 0.045, emX - size * 0.02, emY + size * 0.04, emX - size * 0.015, emY + size * 0.025);
      ctx.lineTo(emX - size * 0.025, emY + size * 0.01);
      ctx.bezierCurveTo(emX - size * 0.035, emY + size * 0.005, emX - size * 0.045, emY - size * 0.01, emX - size * 0.04, emY - size * 0.02);
      ctx.bezierCurveTo(emX - size * 0.035, emY - size * 0.035, emX - size * 0.01, emY - size * 0.04, emX, emY - size * 0.045);
      ctx.closePath();
      ctx.fill();

      // Emblem center gem
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 4 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(emX, emY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // --- FLAME FRINGE (bottom edge) ---
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 5 * zoom;
    for (let fringe = 0; fringe < 8; fringe++) {
      const fT = fringe / 7;
      // Interpolate along bottom banner edge
      const fx = -size * 0.025 + (-size * 0.46 + size * 0.025) * fT;
      const fy = -size * 0.13 + (-size * 0.22 + size * 0.13) * fT;
      const fWave = Math.sin(time * 8 + fringe * 0.9) * size * 0.012;
      const tongueH = size * (0.03 + Math.sin(time * 6 + fringe * 1.1) * 0.01);

      // Outer orange tongue
      ctx.fillStyle = `rgba(255, 100, 40, ${0.5 + Math.sin(time * 7 + fringe) * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(fx - size * 0.01, fy);
      ctx.quadraticCurveTo(fx + fWave, fy + tongueH + size * 0.015, fx + size * 0.005, fy);
      ctx.fill();
      // Inner yellow core
      ctx.fillStyle = `rgba(255, 200, 60, ${0.4 + Math.sin(time * 8 + fringe * 0.7) * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(fx - size * 0.005, fy);
      ctx.quadraticCurveTo(fx + fWave * 0.5, fy + tongueH, fx + size * 0.003, fy);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Tassels hanging from top attachment
    for (let t = 0; t < 2; t++) {
      const tY = -size * 0.82 + t * size * 0.62;
      const tSway = Math.sin(time * 3.5 + t * 1.5) * size * 0.008;
      // Tassel cord
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(-size * 0.025, tY);
      ctx.quadraticCurveTo(-size * 0.04 + tSway, tY + size * 0.04, -size * 0.035 + tSway, tY + size * 0.07);
      ctx.stroke();
      // Tassel knot
      const tkG = ctx.createRadialGradient(-size * 0.035 + tSway, tY + size * 0.07, 0, -size * 0.035 + tSway, tY + size * 0.07, size * 0.012);
      tkG.addColorStop(0, "#f0d040");
      tkG.addColorStop(0.6, "#c9a227");
      tkG.addColorStop(1, "#7a5a10");
      ctx.fillStyle = tkG;
      ctx.beginPath();
      ctx.arc(-size * 0.035 + tSway, tY + size * 0.07, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      // Tassel threads
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 0.6 * zoom;
      for (let th = -1; th <= 1; th++) {
        const thSway = Math.sin(time * 4 + th * 0.8 + t) * size * 0.005;
        ctx.beginPath();
        ctx.moveTo(-size * 0.035 + tSway + th * size * 0.005, tY + size * 0.08);
        ctx.lineTo(-size * 0.035 + tSway + th * size * 0.008 + thSway, tY + size * 0.11);
        ctx.stroke();
      }
    }
  }
  ctx.restore();

  // === EAR WINGS (behind helmet, shorter stylized wings) ===
  for (let side = -1; side <= 1; side += 2) {
    const wingBaseX = x + side * size * 0.28;
    const wingBaseY = y - size * 0.48;
    const wingSpread = side * size * 0.28;
    const wingRise = size * 0.12;

    // Wing shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.beginPath();
    ctx.moveTo(wingBaseX, wingBaseY + size * 0.008);
    ctx.bezierCurveTo(
      wingBaseX + wingSpread * 0.4, wingBaseY - wingRise * 0.3 + size * 0.008,
      wingBaseX + wingSpread * 0.8, wingBaseY - wingRise * 0.8 + size * 0.008,
      wingBaseX + wingSpread, wingBaseY - wingRise + size * 0.008,
    );
    ctx.lineTo(wingBaseX + wingSpread * 0.7, wingBaseY + size * 0.03);
    ctx.lineTo(wingBaseX + wingSpread * 0.3, wingBaseY + size * 0.04);
    ctx.closePath();
    ctx.fill();

    // Primary feather (top, longest)
    {
      const fG = ctx.createLinearGradient(wingBaseX, wingBaseY, wingBaseX + wingSpread, wingBaseY - wingRise);
      fG.addColorStop(0, "#7a5a10");
      fG.addColorStop(0.2, "#b08a20");
      fG.addColorStop(0.45, "#daa520");
      fG.addColorStop(0.6, "#f0d040");
      fG.addColorStop(0.8, "#daa520");
      fG.addColorStop(1, "#b08a20");
      ctx.fillStyle = fG;
      ctx.beginPath();
      ctx.moveTo(wingBaseX, wingBaseY - size * 0.01);
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.3, wingBaseY - wingRise * 0.5,
        wingBaseX + wingSpread * 0.7, wingBaseY - wingRise * 0.9,
        wingBaseX + wingSpread, wingBaseY - wingRise,
      );
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.85, wingBaseY - wingRise * 0.7,
        wingBaseX + wingSpread * 0.5, wingBaseY - wingRise * 0.3,
        wingBaseX, wingBaseY + size * 0.005,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
    }

    // Secondary feather (middle)
    {
      const f2G = ctx.createLinearGradient(wingBaseX, wingBaseY, wingBaseX + wingSpread * 0.7, wingBaseY - wingRise * 0.5);
      f2G.addColorStop(0, "#6a4a08");
      f2G.addColorStop(0.3, "#9a7a18");
      f2G.addColorStop(0.6, "#c9a227");
      f2G.addColorStop(1, "#9a7a18");
      ctx.fillStyle = f2G;
      ctx.beginPath();
      ctx.moveTo(wingBaseX, wingBaseY + size * 0.008);
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.25, wingBaseY - wingRise * 0.15,
        wingBaseX + wingSpread * 0.5, wingBaseY - wingRise * 0.4,
        wingBaseX + wingSpread * 0.7, wingBaseY - wingRise * 0.5,
      );
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.55, wingBaseY - wingRise * 0.25,
        wingBaseX + wingSpread * 0.28, wingBaseY - wingRise * 0.03,
        wingBaseX, wingBaseY + size * 0.02,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }

    // Tertiary feather (bottom, shortest)
    {
      const f3G = ctx.createLinearGradient(wingBaseX, wingBaseY, wingBaseX + wingSpread * 0.45, wingBaseY - wingRise * 0.15);
      f3G.addColorStop(0, "#5a4008");
      f3G.addColorStop(0.4, "#8a6a15");
      f3G.addColorStop(1, "#7a5a10");
      ctx.fillStyle = f3G;
      ctx.beginPath();
      ctx.moveTo(wingBaseX, wingBaseY + size * 0.022);
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.18, wingBaseY + size * 0.005,
        wingBaseX + wingSpread * 0.35, wingBaseY - wingRise * 0.1,
        wingBaseX + wingSpread * 0.45, wingBaseY - wingRise * 0.15,
      );
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.35, wingBaseY - wingRise * 0.02,
        wingBaseX + wingSpread * 0.18, wingBaseY + size * 0.02,
        wingBaseX, wingBaseY + size * 0.035,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#6a4a08";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    // Feather vein highlights
    ctx.strokeStyle = "rgba(240, 208, 64, 0.25)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(wingBaseX + side * size * 0.008, wingBaseY - size * 0.003);
    ctx.bezierCurveTo(
      wingBaseX + wingSpread * 0.35, wingBaseY - wingRise * 0.45,
      wingBaseX + wingSpread * 0.7, wingBaseY - wingRise * 0.8,
      wingBaseX + wingSpread * 0.95, wingBaseY - wingRise * 0.95,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wingBaseX + side * size * 0.008, wingBaseY + size * 0.012);
    ctx.bezierCurveTo(
      wingBaseX + wingSpread * 0.25, wingBaseY - wingRise * 0.12,
      wingBaseX + wingSpread * 0.45, wingBaseY - wingRise * 0.35,
      wingBaseX + wingSpread * 0.65, wingBaseY - wingRise * 0.45,
    );
    ctx.stroke();
  }

  // === DRAGON CROWN HELM ===
  {
    const helmCX = x;
    const helmCY = y - size * 0.52;
    const helmW = size * 0.30;
    const helmTop = helmCY - size * 0.32;
    const helmBot = helmCY + size * 0.26;
    const helmBrowY = helmCY - size * 0.08;

    // Helper to draw the helm outline path (flat-topped great helm shape)
    const drawHelmPath = () => {
      ctx.beginPath();
      ctx.moveTo(helmCX - helmW * 0.6, helmTop);
      // Flat crown curves slightly
      ctx.quadraticCurveTo(helmCX, helmTop - size * 0.04, helmCX + helmW * 0.6, helmTop);
      // Right side — angular, widens at brow then tapers to chin
      ctx.bezierCurveTo(
        helmCX + helmW * 1.05, helmTop + size * 0.06,
        helmCX + helmW * 1.1, helmBrowY - size * 0.02,
        helmCX + helmW * 1.0, helmBrowY,
      );
      ctx.bezierCurveTo(
        helmCX + helmW * 1.05, helmBrowY + size * 0.08,
        helmCX + helmW * 0.85, helmBot - size * 0.05,
        helmCX + helmW * 0.45, helmBot,
      );
      // Chin point
      ctx.quadraticCurveTo(helmCX, helmBot + size * 0.06, helmCX - helmW * 0.45, helmBot);
      // Left side
      ctx.bezierCurveTo(
        helmCX - helmW * 0.85, helmBot - size * 0.05,
        helmCX - helmW * 1.05, helmBrowY + size * 0.08,
        helmCX - helmW * 1.0, helmBrowY,
      );
      ctx.bezierCurveTo(
        helmCX - helmW * 1.1, helmBrowY - size * 0.02,
        helmCX - helmW * 1.05, helmTop + size * 0.06,
        helmCX - helmW * 0.6, helmTop,
      );
      ctx.closePath();
    };

    // Ambient shadow beneath helm
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(helmCX, helmBot + size * 0.03, helmW * 0.9, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main helm fill — rich dark steel
    const helmG = ctx.createLinearGradient(helmCX - helmW, helmTop, helmCX + helmW * 0.3, helmBot);
    helmG.addColorStop(0, "#6a6a6a");
    helmG.addColorStop(0.15, "#555");
    helmG.addColorStop(0.35, "#454545");
    helmG.addColorStop(0.6, "#363636");
    helmG.addColorStop(0.85, "#282828");
    helmG.addColorStop(1, "#1c1c1c");
    ctx.fillStyle = helmG;
    drawHelmPath();
    ctx.fill();

    // Specular highlight on upper-left dome
    const specG = ctx.createRadialGradient(
      helmCX - size * 0.1, helmTop + size * 0.08, 0,
      helmCX - size * 0.08, helmTop + size * 0.1, size * 0.2,
    );
    specG.addColorStop(0, "rgba(170, 170, 185, 0.3)");
    specG.addColorStop(0.4, "rgba(110, 110, 125, 0.12)");
    specG.addColorStop(1, "rgba(60, 60, 70, 0)");
    ctx.fillStyle = specG;
    drawHelmPath();
    ctx.fill();

    // Dragon scale pattern on upper dome
    ctx.save();
    drawHelmPath();
    ctx.clip();
    for (let row = 0; row < 5; row++) {
      const scaleRowY = helmTop + size * 0.04 + row * size * 0.055;
      const rowWidth = helmW * (1.0 - row * 0.05);
      const cols = 6 - row;
      for (let col = 0; col < cols; col++) {
        const colT = cols > 1 ? col / (cols - 1) : 0.5;
        const sx = helmCX + (colT - 0.5) * rowWidth * 1.6 + (row % 2 === 0 ? 0 : rowWidth * 0.12);
        const sy = scaleRowY;
        const sw = size * (0.028 - row * 0.002);
        const sh = size * (0.018 - row * 0.001);

        ctx.fillStyle = "rgba(55, 55, 62, 0.35)";
        ctx.beginPath();
        ctx.ellipse(sx, sy, sw, sh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(80, 80, 90, 0.2)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.stroke();
      }
    }
    ctx.restore();

    // Central crest ridge running from crown to brow
    const ridgeG = ctx.createLinearGradient(helmCX - size * 0.025, helmCY, helmCX + size * 0.025, helmCY);
    ridgeG.addColorStop(0, "#2e2e2e");
    ridgeG.addColorStop(0.3, "#4a4a50");
    ridgeG.addColorStop(0.5, "#5a5a64");
    ridgeG.addColorStop(0.7, "#4a4a50");
    ridgeG.addColorStop(1, "#2e2e2e");
    ctx.fillStyle = ridgeG;
    ctx.beginPath();
    ctx.moveTo(helmCX - size * 0.02, helmTop - size * 0.01);
    ctx.bezierCurveTo(
      helmCX - size * 0.03, helmTop + size * 0.12,
      helmCX - size * 0.035, helmBrowY - size * 0.06,
      helmCX - size * 0.03, helmBrowY + size * 0.02,
    );
    ctx.lineTo(helmCX + size * 0.03, helmBrowY + size * 0.02);
    ctx.bezierCurveTo(
      helmCX + size * 0.035, helmBrowY - size * 0.06,
      helmCX + size * 0.03, helmTop + size * 0.12,
      helmCX + size * 0.02, helmTop - size * 0.01,
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(100, 100, 112, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Brow plate (thickened band across the brow, separating dome from face)
    const browG = ctx.createLinearGradient(helmCX - helmW, helmBrowY, helmCX + helmW, helmBrowY);
    browG.addColorStop(0, "#3a3a3a");
    browG.addColorStop(0.2, "#4e4e4e");
    browG.addColorStop(0.5, "#585860");
    browG.addColorStop(0.8, "#4e4e4e");
    browG.addColorStop(1, "#3a3a3a");
    ctx.fillStyle = browG;
    ctx.beginPath();
    ctx.moveTo(helmCX - helmW * 1.0, helmBrowY - size * 0.025);
    ctx.quadraticCurveTo(helmCX, helmBrowY - size * 0.04, helmCX + helmW * 1.0, helmBrowY - size * 0.025);
    ctx.lineTo(helmCX + helmW * 1.0, helmBrowY + size * 0.025);
    ctx.quadraticCurveTo(helmCX, helmBrowY + size * 0.01, helmCX - helmW * 1.0, helmBrowY + size * 0.025);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6a5010";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Gold crown band on the brow plate
    const bandG = ctx.createLinearGradient(helmCX - helmW, helmBrowY, helmCX + helmW, helmBrowY);
    bandG.addColorStop(0, "#5a4008");
    bandG.addColorStop(0.15, "#8a6a15");
    bandG.addColorStop(0.3, "#b08a20");
    bandG.addColorStop(0.5, "#c9a227");
    bandG.addColorStop(0.7, "#b08a20");
    bandG.addColorStop(0.85, "#8a6a15");
    bandG.addColorStop(1, "#5a4008");
    ctx.fillStyle = bandG;
    ctx.beginPath();
    ctx.moveTo(helmCX - helmW * 0.95, helmBrowY - size * 0.012);
    ctx.quadraticCurveTo(helmCX, helmBrowY - size * 0.025, helmCX + helmW * 0.95, helmBrowY - size * 0.012);
    ctx.lineTo(helmCX + helmW * 0.95, helmBrowY + size * 0.012);
    ctx.quadraticCurveTo(helmCX, helmBrowY - size * 0.003, helmCX - helmW * 0.95, helmBrowY + size * 0.012);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6a4a08";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Filigree dots on band
    ctx.fillStyle = "rgba(200, 170, 60, 0.3)";
    for (let d = 0; d < 7; d++) {
      const dt = (d + 1) / 8;
      const dx = helmCX + (dt - 0.5) * helmW * 1.7;
      const dy = helmBrowY - size * 0.004;
      ctx.beginPath();
      ctx.arc(dx, dy, size * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crown dragon peaks (3 elegant pointed peaks above the dome)
    const crownPeaks = [
      { off: 0, h: 0.13, w: 0.032 },
      { off: -0.1, h: 0.09, w: 0.025 },
      { off: 0.1, h: 0.09, w: 0.025 },
    ];
    for (const peak of crownPeaks) {
      const peakX = helmCX + peak.off * size;
      const peakBaseY = helmTop - size * 0.02;
      const peakTipY = peakBaseY - peak.h * size;
      const pw = peak.w * size;

      const peakG = ctx.createLinearGradient(peakX - pw, peakBaseY, peakX + pw, peakTipY);
      peakG.addColorStop(0, "#6a5010");
      peakG.addColorStop(0.3, "#9a7a1a");
      peakG.addColorStop(0.5, "#b89025");
      peakG.addColorStop(0.7, "#c9a227");
      peakG.addColorStop(1, "#b89025");
      ctx.fillStyle = peakG;
      ctx.beginPath();
      ctx.moveTo(peakX - pw, peakBaseY);
      ctx.bezierCurveTo(
        peakX - pw * 0.5, peakBaseY - peak.h * size * 0.6,
        peakX - pw * 0.15, peakTipY + size * 0.01,
        peakX, peakTipY,
      );
      ctx.bezierCurveTo(
        peakX + pw * 0.15, peakTipY + size * 0.01,
        peakX + pw * 0.5, peakBaseY - peak.h * size * 0.6,
        peakX + pw, peakBaseY,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#6a4a08";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      if (peak.h >= 0.12) {
        ctx.fillStyle = "#dc2626";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 5 * zoom * gemPulse;
        ctx.beginPath();
        ctx.arc(peakX, peakTipY + size * 0.018, size * 0.012, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Side ruby gems on crown band
    for (let side = -1; side <= 1; side += 2) {
      const gemX = helmCX + side * size * 0.2;
      const gemY = helmBrowY;
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 4 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    // Helm border outline — black base with gold inner
    ctx.strokeStyle = "#0e0e0e";
    ctx.lineWidth = 2.4 * zoom;
    drawHelmPath();
    ctx.stroke();
    ctx.strokeStyle = "#8a6a15";
    ctx.lineWidth = 1 * zoom;
    drawHelmPath();
    ctx.stroke();

    // === V-FINS (swept-back angular blade antennae) ===
    for (let side = -1; side <= 1; side += 2) {
      const finBaseX = helmCX + side * helmW * 0.35;
      const finBaseY = helmBrowY - size * 0.01;
      const finTipX = helmCX + side * size * 0.42;
      const finTipY = helmBrowY - size * 0.36;
      const finThick = size * 0.018;

      // Fin shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.moveTo(finBaseX, finBaseY + size * 0.008);
      ctx.lineTo(finBaseX + side * size * 0.015, finBaseY + size * 0.01);
      ctx.lineTo(finTipX + side * size * 0.01, finTipY + size * 0.015);
      ctx.lineTo(finTipX, finTipY + size * 0.01);
      ctx.closePath();
      ctx.fill();

      // Main fin body with gold gradient
      const finG = ctx.createLinearGradient(finBaseX, finBaseY, finTipX, finTipY);
      finG.addColorStop(0, "#7a5a10");
      finG.addColorStop(0.15, "#b08a20");
      finG.addColorStop(0.35, "#daa520");
      finG.addColorStop(0.5, "#f0d040");
      finG.addColorStop(0.65, "#daa520");
      finG.addColorStop(0.85, "#b08a20");
      finG.addColorStop(1, "#c9a227");
      ctx.fillStyle = finG;
      ctx.beginPath();
      // Inner edge (toward center)
      ctx.moveTo(finBaseX - side * finThick * 0.3, finBaseY);
      ctx.bezierCurveTo(
        finBaseX + side * size * 0.05, finBaseY - size * 0.1,
        finTipX - side * size * 0.06, finTipY + size * 0.08,
        finTipX, finTipY,
      );
      // Tip (sharp point)
      ctx.lineTo(finTipX + side * size * 0.008, finTipY + size * 0.005);
      // Outer edge (away from center)
      ctx.bezierCurveTo(
        finTipX - side * size * 0.02, finTipY + size * 0.1,
        finBaseX + side * size * 0.08, finBaseY - size * 0.05,
        finBaseX + side * finThick * 0.8, finBaseY,
      );
      ctx.closePath();
      ctx.fill();

      // Specular highlight along the fin
      ctx.strokeStyle = "rgba(255, 240, 180, 0.35)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(finBaseX, finBaseY - size * 0.003);
      ctx.bezierCurveTo(
        finBaseX + side * size * 0.06, finBaseY - size * 0.1,
        finTipX - side * size * 0.05, finTipY + size * 0.08,
        finTipX, finTipY + size * 0.003,
      );
      ctx.stroke();

      // Gold border highlight
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(finBaseX - side * finThick * 0.3, finBaseY);
      ctx.bezierCurveTo(
        finBaseX + side * size * 0.05, finBaseY - size * 0.1,
        finTipX - side * size * 0.06, finTipY + size * 0.08,
        finTipX, finTipY,
      );
      ctx.lineTo(finTipX + side * size * 0.008, finTipY + size * 0.005);
      ctx.bezierCurveTo(
        finTipX - side * size * 0.02, finTipY + size * 0.1,
        finBaseX + side * size * 0.08, finBaseY - size * 0.05,
        finBaseX + side * finThick * 0.8, finBaseY,
      );
      ctx.closePath();
      ctx.stroke();

      // Ruby gem at fin base
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 4 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(finBaseX + side * size * 0.02, finBaseY - size * 0.02, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // === CHEEK GUARDS & SIDE ARMOR ===
  for (let side = -1; side <= 1; side += 2) {
    const helmCX = x;
    const helmCY = y - size * 0.52;

    // Upper temple plate (angular, sits above the cheek)
    {
      const tpX = helmCX + side * size * 0.3;
      const tpY = helmCY - size * 0.05;
      const tpW = size * 0.16;
      const tpH = size * 0.14;

      const tpG = ctx.createLinearGradient(tpX - side * tpW * 0.3, tpY - tpH * 0.5, tpX + side * tpW * 0.5, tpY + tpH * 0.3);
      tpG.addColorStop(0, "#606060");
      tpG.addColorStop(0.3, "#505050");
      tpG.addColorStop(0.6, "#3e3e3e");
      tpG.addColorStop(1, "#282828");
      ctx.fillStyle = tpG;
      ctx.beginPath();
      ctx.moveTo(tpX - side * size * 0.02, tpY - tpH * 0.55);
      ctx.bezierCurveTo(
        tpX + side * tpW * 0.4, tpY - tpH * 0.6,
        tpX + side * tpW * 0.7, tpY - tpH * 0.2,
        tpX + side * tpW * 0.6, tpY + tpH * 0.15,
      );
      ctx.bezierCurveTo(
        tpX + side * tpW * 0.4, tpY + tpH * 0.4,
        tpX + side * tpW * 0.1, tpY + tpH * 0.35,
        tpX - side * size * 0.03, tpY + tpH * 0.1,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 1.0 * zoom;
      ctx.stroke();

      // Gold edge accent
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(tpX - side * size * 0.02, tpY - tpH * 0.55);
      ctx.bezierCurveTo(
        tpX + side * tpW * 0.4, tpY - tpH * 0.6,
        tpX + side * tpW * 0.7, tpY - tpH * 0.2,
        tpX + side * tpW * 0.6, tpY + tpH * 0.15,
      );
      ctx.stroke();

      // Etched dragon scale on temple
      ctx.strokeStyle = "rgba(160, 140, 80, 0.25)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(tpX + side * tpW * 0.25, tpY - tpH * 0.1, size * 0.02, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Main cheek plate (larger, curved)
    {
      const chkX = helmCX + side * size * 0.28;
      const chkY = y - size * 0.38;
      const chkW = size * 0.15;
      const chkH = size * 0.28;

      const chkG = ctx.createLinearGradient(chkX - side * chkW * 0.3, chkY - chkH * 0.4, chkX + side * chkW * 0.5, chkY + chkH * 0.4);
      chkG.addColorStop(0, "#585858");
      chkG.addColorStop(0.25, "#4a4a4a");
      chkG.addColorStop(0.5, "#3c3c3c");
      chkG.addColorStop(0.75, "#323232");
      chkG.addColorStop(1, "#222222");
      ctx.fillStyle = chkG;
      ctx.beginPath();
      ctx.moveTo(chkX - side * size * 0.01, chkY - chkH * 0.5);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.5, chkY - chkH * 0.5,
        chkX + side * chkW * 0.75, chkY - chkH * 0.15,
        chkX + side * chkW * 0.7, chkY + chkH * 0.1,
      );
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.6, chkY + chkH * 0.4,
        chkX + side * chkW * 0.2, chkY + chkH * 0.5,
        chkX - side * size * 0.02, chkY + chkH * 0.35,
      );
      ctx.closePath();
      ctx.fill();

      // Specular highlight
      const chkSpec = ctx.createRadialGradient(
        chkX + side * chkW * 0.15, chkY - chkH * 0.15, 0,
        chkX + side * chkW * 0.15, chkY - chkH * 0.15, chkW * 0.5,
      );
      chkSpec.addColorStop(0, "rgba(140, 140, 150, 0.2)");
      chkSpec.addColorStop(1, "rgba(60, 60, 70, 0)");
      ctx.fillStyle = chkSpec;
      ctx.fill();

      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();

      // Gold trim along outer edge
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.0 * zoom;
      ctx.beginPath();
      ctx.moveTo(chkX - side * size * 0.01, chkY - chkH * 0.5);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.5, chkY - chkH * 0.5,
        chkX + side * chkW * 0.75, chkY - chkH * 0.15,
        chkX + side * chkW * 0.7, chkY + chkH * 0.1,
      );
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.6, chkY + chkH * 0.4,
        chkX + side * chkW * 0.2, chkY + chkH * 0.5,
        chkX - side * size * 0.02, chkY + chkH * 0.35,
      );
      ctx.stroke();

      // Raised ridge line across cheek
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(chkX, chkY - chkH * 0.2);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.4, chkY - chkH * 0.15,
        chkX + side * chkW * 0.5, chkY + chkH * 0.05,
        chkX + side * chkW * 0.35, chkY + chkH * 0.25,
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(100, 100, 110, 0.3)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(chkX - size * 0.002, chkY - chkH * 0.2 - size * 0.002);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.4 - size * 0.002, chkY - chkH * 0.15 - size * 0.002,
        chkX + side * chkW * 0.5 - size * 0.002, chkY + chkH * 0.05 - size * 0.002,
        chkX + side * chkW * 0.35 - size * 0.002, chkY + chkH * 0.25 - size * 0.002,
      );
      ctx.stroke();

      // Two rivets
      for (let r = 0; r < 2; r++) {
        const rx = chkX + side * chkW * (0.2 + r * 0.2);
        const ry = chkY + (r === 0 ? -chkH * 0.2 : chkH * 0.15);
        const rvG = ctx.createRadialGradient(rx - size * 0.002, ry - size * 0.002, 0, rx, ry, size * 0.009);
        rvG.addColorStop(0, "#aaa");
        rvG.addColorStop(0.5, "#666");
        rvG.addColorStop(1, "#2a2a2a");
        ctx.fillStyle = rvG;
        ctx.beginPath();
        ctx.arc(rx, ry, size * 0.009, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#7a5a10";
        ctx.lineWidth = 0.5 * zoom;
        ctx.stroke();
      }
    }

    // Jaw extension plate (hangs below cheek, gives angular silhouette)
    {
      const jawX = helmCX + side * size * 0.22;
      const jawY = y - size * 0.2;
      const jawW = size * 0.08;
      const jawH = size * 0.1;

      const jawG = ctx.createLinearGradient(jawX, jawY - jawH * 0.5, jawX, jawY + jawH * 0.5);
      jawG.addColorStop(0, "#484848");
      jawG.addColorStop(0.5, "#363636");
      jawG.addColorStop(1, "#1e1e1e");
      ctx.fillStyle = jawG;
      ctx.beginPath();
      ctx.moveTo(jawX - side * jawW * 0.3, jawY - jawH * 0.5);
      ctx.lineTo(jawX + side * jawW * 0.6, jawY - jawH * 0.45);
      ctx.bezierCurveTo(
        jawX + side * jawW * 0.8, jawY,
        jawX + side * jawW * 0.4, jawY + jawH * 0.4,
        jawX, jawY + jawH * 0.5,
      );
      ctx.lineTo(jawX - side * jawW * 0.4, jawY + jawH * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Gold tip
      ctx.fillStyle = "#b09030";
      ctx.beginPath();
      ctx.arc(jawX + side * jawW * 0.1, jawY + jawH * 0.42, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ear guard (small raised disc on side of helm)
    {
      const earX = helmCX + side * size * 0.33;
      const earY = helmCY + size * 0.02;
      const earR = size * 0.04;

      const earG = ctx.createRadialGradient(earX - side * earR * 0.3, earY - earR * 0.3, 0, earX, earY, earR);
      earG.addColorStop(0, "#5a5a5a");
      earG.addColorStop(0.5, "#3e3e3e");
      earG.addColorStop(1, "#222");
      ctx.fillStyle = earG;
      ctx.beginPath();
      ctx.arc(earX, earY, earR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 1.0 * zoom;
      ctx.stroke();

      // Gold ring and center
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.arc(earX, earY, earR * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Ruby center
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(earX, earY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // === DRAGON VISOR ===
  {
    const visorTopY = y - size * 0.59;
    const visorBotY = y - size * 0.32;
    const visorW = size * 0.22;
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Visor opening shape helper
    const drawVisorPath = () => {
      ctx.beginPath();
      ctx.moveTo(x - visorW, visorTopY + size * 0.02);
      ctx.quadraticCurveTo(x, visorTopY - size * 0.01, x + visorW, visorTopY + size * 0.02);
      ctx.lineTo(x + visorW * 0.82, visorBotY - size * 0.02);
      ctx.quadraticCurveTo(x, visorBotY + size * 0.02, x - visorW * 0.82, visorBotY - size * 0.02);
      ctx.closePath();
    };

    // Dark red void behind grille (visible through every slit/gap)
    const visorGlow = isAttacking ? 1.0 : 0.8;
    ctx.fillStyle = `rgba(90, 8, 4, ${visorGlow})`;
    drawVisorPath();
    ctx.fill();
    const voidG = ctx.createRadialGradient(x, (visorTopY + visorBotY) * 0.5, 0, x, (visorTopY + visorBotY) * 0.5, size * 0.18);
    voidG.addColorStop(0, `rgba(140, 22, 10, ${visorGlow * 0.9})`);
    voidG.addColorStop(0.4, `rgba(100, 12, 5, ${visorGlow * 0.7})`);
    voidG.addColorStop(1, `rgba(50, 5, 2, ${visorGlow * 0.5})`);
    ctx.fillStyle = voidG;
    drawVisorPath();
    ctx.fill();

    // Glowing eyes (drawn FIRST — behind the grille)
    for (let side = -1; side <= 1; side += 2) {
      const eyeX = x + side * size * 0.085;
      const eyeY = (visorTopY + visorBotY) * 0.5 - size * 0.02;
      const eyeW = size * 0.075;
      const eyeH = size * 0.025;
      const eyeAngle = side * -0.1;

      // Massive ambient glow halo
      ctx.fillStyle = isAttacking
        ? `rgba(255, 30, 10, ${0.8 + attackIntensity * 0.2})`
        : "rgba(255, 25, 10, 0.7)";
      ctx.shadowColor = "#ff1100";
      ctx.shadowBlur = isAttacking ? 30 * zoom : 20 * zoom;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, eyeW * 2, eyeH * 3.5, eyeAngle, 0, Math.PI * 2);
      ctx.fill();

      // Bright eye slit
      ctx.fillStyle = isAttacking
        ? "#ff3c1e"
        : "rgba(255, 45, 25, 0.97)";
      ctx.shadowColor = "#ff2200";
      ctx.shadowBlur = isAttacking ? 24 * zoom : 16 * zoom;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, eyeW, eyeH, eyeAngle, 0, Math.PI * 2);
      ctx.fill();

      // Hot inner core
      ctx.fillStyle = isAttacking ? "#ffdd99" : "#ffaa66";
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.ellipse(eyeX + side * size * 0.008, eyeY, eyeW * 0.45, eyeH * 0.7, eyeAngle, 0, Math.PI * 2);
      ctx.fill();

      // White-hot pupil
      ctx.fillStyle = isAttacking ? "#ffffff" : "#fff4e8";
      ctx.shadowColor = "#ffcc88";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(eyeX + side * size * 0.01, eyeY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // === GRILLE (drawn ON TOP of eyes — eyes peek through gaps) ===

    // Clip to visor shape so bars don't exceed the opening
    ctx.save();
    drawVisorPath();
    ctx.clip();

    // Vertical bars (fewer, thinner — wide red gaps between them)
    const barSlots = [-2, -1, 1, 2];
    const barSpacing = size * 0.065;
    for (const b of barSlots) {
      const bx = x + b * barSpacing;
      const topY = visorTopY - size * 0.01;
      const botY = visorBotY + size * 0.01;
      const barW = 1.4 * zoom;

      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = barW + 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, topY);
      ctx.lineTo(bx * 0.97 + x * 0.03, botY);
      ctx.stroke();

      ctx.strokeStyle = "#4a4a50";
      ctx.lineWidth = barW;
      ctx.beginPath();
      ctx.moveTo(bx, topY);
      ctx.lineTo(bx * 0.97 + x * 0.03, botY);
      ctx.stroke();
    }

    // Horizontal cross bars (2, thin)
    for (let hbar = 0; hbar < 2; hbar++) {
      const hY = visorTopY + size * 0.06 + hbar * (visorBotY - visorTopY - size * 0.1);
      const hW = visorW * 1.05;

      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - hW, hY);
      ctx.lineTo(x + hW, hY);
      ctx.stroke();

      ctx.strokeStyle = "#4a4a50";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - hW, hY);
      ctx.lineTo(x + hW, hY);
      ctx.stroke();
    }

    // Nose guard (center bar, thinner)
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, visorTopY - size * 0.01);
    ctx.lineTo(x, visorBotY + size * 0.01);
    ctx.stroke();

    ctx.strokeStyle = "#4a4a50";
    ctx.lineWidth = 1.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, visorTopY - size * 0.01);
    ctx.lineTo(x, visorBotY + size * 0.01);
    ctx.stroke();

    ctx.restore(); // un-clip

    // Eye glow on TOP of grille (bleed-through effect)
    ctx.save();
    drawVisorPath();
    ctx.clip();
    for (let side = -1; side <= 1; side += 2) {
      const eyeX = x + side * size * 0.085;
      const eyeY = (visorTopY + visorBotY) * 0.5 - size * 0.02;
      const eyeAngle = side * -0.1;
      // Soft glow that sits on top of bars
      ctx.globalCompositeOperation = "screen";
      const glowG = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.07);
      glowG.addColorStop(0, isAttacking ? "rgba(255, 80, 40, 0.8)" : "rgba(255, 60, 30, 0.65)");
      glowG.addColorStop(0.4, isAttacking ? "rgba(255, 40, 15, 0.5)" : "rgba(255, 30, 10, 0.35)");
      glowG.addColorStop(1, "rgba(255, 20, 5, 0)");
      ctx.fillStyle = glowG;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.08, size * 0.04, eyeAngle, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();

    // Gold visor frame border (sits on top of everything)
    const frameG = ctx.createLinearGradient(x - visorW, visorTopY, x + visorW, visorBotY);
    frameG.addColorStop(0, "#5a4008");
    frameG.addColorStop(0.2, "#8a6a15");
    frameG.addColorStop(0.35, "#b08a20");
    frameG.addColorStop(0.5, "#c9a227");
    frameG.addColorStop(0.65, "#b08a20");
    frameG.addColorStop(0.8, "#8a6a15");
    frameG.addColorStop(1, "#5a4008");
    ctx.strokeStyle = frameG;
    ctx.lineWidth = 2.5 * zoom;
    drawVisorPath();
    ctx.stroke();

    // Dark outer border for definition
    ctx.strokeStyle = "#4a3508";
    ctx.lineWidth = 0.8 * zoom;
    drawVisorPath();
    ctx.stroke();

    // Breath holes below visor
    for (let hole = -2; hole <= 2; hole++) {
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.ellipse(x + hole * size * 0.035, visorBotY + size * 0.03, size * 0.008, size * 0.005, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === BLAZING FIRE PLUME (rendered above helmet) ===
  {
    const flameBaseX = x;
    const flameBaseY = y - size * 0.82;
    const flameHeight = size * 0.55;
    const flameWidth = size * 0.32;

    const flameFlicker = Math.sin(time * 6.0) * 0.04;
    const flameSway =
      Math.sin(time * 3.2) * size * 0.03 +
      (isAttacking ? commandPose * size * 0.05 : 0);
    const flameStretch = 1.0 + Math.sin(time * 4.5) * 0.08 + flamePulse * 0.12;
    const tipX = flameBaseX + flameSway;
    const tipY = flameBaseY - flameHeight * flameStretch;

    // Outer glow aura
    const auraG = ctx.createRadialGradient(
      flameBaseX,
      flameBaseY - flameHeight * 0.4,
      0,
      flameBaseX,
      flameBaseY - flameHeight * 0.4,
      flameHeight * 0.7,
    );
    auraG.addColorStop(0, `rgba(255, 80, 20, ${0.15 + flamePulse * 0.08})`);
    auraG.addColorStop(0.5, `rgba(200, 30, 10, ${0.06 + flamePulse * 0.04})`);
    auraG.addColorStop(1, "rgba(100, 10, 5, 0)");
    ctx.fillStyle = auraG;
    ctx.beginPath();
    ctx.arc(
      flameBaseX,
      flameBaseY - flameHeight * 0.4,
      flameHeight * 0.7,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Deep shadow flame (offset slightly right)
    ctx.fillStyle = "rgba(40, 5, 2, 0.3)";
    ctx.beginPath();
    ctx.moveTo(flameBaseX - flameWidth * 0.85, flameBaseY);
    ctx.bezierCurveTo(
      flameBaseX - flameWidth * 1.1 + flameSway * 0.3,
      flameBaseY - flameHeight * 0.35,
      tipX - flameWidth * 0.5,
      tipY + flameHeight * 0.15,
      tipX + size * 0.02,
      tipY + size * 0.02,
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.6,
      tipY + flameHeight * 0.2,
      flameBaseX + flameWidth * 1.2 + flameSway * 0.3,
      flameBaseY - flameHeight * 0.3,
      flameBaseX + flameWidth * 0.85,
      flameBaseY,
    );
    ctx.closePath();
    ctx.fill();

    // Base layer (deep crimson-black core)
    const baseG = ctx.createLinearGradient(flameBaseX, flameBaseY, tipX, tipY);
    baseG.addColorStop(0, "#4a0808");
    baseG.addColorStop(0.2, "#7a1010");
    baseG.addColorStop(0.5, "#991818");
    baseG.addColorStop(0.75, "#7a0c0c");
    baseG.addColorStop(1, "#3a0404");
    ctx.fillStyle = baseG;
    ctx.beginPath();
    ctx.moveTo(flameBaseX - flameWidth * 0.75, flameBaseY);
    ctx.bezierCurveTo(
      flameBaseX - flameWidth * 1.0 + flameSway * 0.3,
      flameBaseY - flameHeight * 0.4,
      tipX - flameWidth * 0.45,
      tipY + flameHeight * 0.12,
      tipX,
      tipY,
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.45,
      tipY + flameHeight * 0.12,
      flameBaseX + flameWidth * 1.0 + flameSway * 0.3,
      flameBaseY - flameHeight * 0.4,
      flameBaseX + flameWidth * 0.75,
      flameBaseY,
    );
    ctx.closePath();
    ctx.fill();

    // Main fire body (rich orange-red gradient)
    const mainG = ctx.createLinearGradient(flameBaseX, flameBaseY, tipX, tipY);
    mainG.addColorStop(0, "#6a0a0a");
    mainG.addColorStop(0.08, "#aa1515");
    mainG.addColorStop(0.2, "#dd2a10");
    mainG.addColorStop(0.35, "#ff4422");
    mainG.addColorStop(0.5, "#ff6633");
    mainG.addColorStop(0.65, "#ff4422");
    mainG.addColorStop(0.8, "#cc1a0a");
    mainG.addColorStop(1, "#5a0505");
    ctx.fillStyle = mainG;
    ctx.beginPath();
    ctx.moveTo(flameBaseX - flameWidth * 0.6, flameBaseY);
    ctx.bezierCurveTo(
      flameBaseX - flameWidth * 0.85 + flameSway * 0.4,
      flameBaseY - flameHeight * 0.38,
      tipX - flameWidth * 0.35 + flameFlicker * size,
      tipY + flameHeight * 0.08,
      tipX,
      tipY + size * 0.01,
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.35 - flameFlicker * size,
      tipY + flameHeight * 0.08,
      flameBaseX + flameWidth * 0.85 + flameSway * 0.4,
      flameBaseY - flameHeight * 0.38,
      flameBaseX + flameWidth * 0.6,
      flameBaseY,
    );
    ctx.closePath();
    ctx.fill();

    // Inner bright fire core (yellow-white hot center)
    const coreG = ctx.createLinearGradient(
      flameBaseX,
      flameBaseY,
      tipX,
      tipY - flameHeight * 0.1,
    );
    coreG.addColorStop(0, "rgba(255, 220, 120, 0.0)");
    coreG.addColorStop(0.1, "rgba(255, 200, 80, 0.5)");
    coreG.addColorStop(0.3, "rgba(255, 240, 160, 0.65)");
    coreG.addColorStop(0.5, "rgba(255, 255, 220, 0.55)");
    coreG.addColorStop(0.7, "rgba(255, 220, 120, 0.4)");
    coreG.addColorStop(1, "rgba(255, 180, 80, 0)");
    ctx.fillStyle = coreG;
    ctx.beginPath();
    ctx.moveTo(flameBaseX - flameWidth * 0.25, flameBaseY - size * 0.02);
    ctx.bezierCurveTo(
      flameBaseX - flameWidth * 0.4 + flameSway * 0.5,
      flameBaseY - flameHeight * 0.35,
      tipX - flameWidth * 0.15,
      tipY + flameHeight * 0.18,
      tipX,
      tipY + flameHeight * 0.08,
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.15,
      tipY + flameHeight * 0.18,
      flameBaseX + flameWidth * 0.4 + flameSway * 0.5,
      flameBaseY - flameHeight * 0.35,
      flameBaseX + flameWidth * 0.25,
      flameBaseY - size * 0.02,
    );
    ctx.closePath();
    ctx.fill();

    // Animated flame tongues rising from the edges
    ctx.lineCap = "round";
    const tongueColors = [
      "#ff8844",
      "#ff5522",
      "#ffaa55",
      "#dd3311",
      "#ffcc66",
      "#ff6622",
      "#ffbb44",
    ];
    for (let t = 0; t < 14; t++) {
      const tNorm = t / 13;
      const tPhase = time * (4.0 + t * 0.5) + t * 0.9;
      const tWobble = Math.sin(tPhase) * (2.0 + tNorm * 4.0);
      const tAlpha = 0.2 + Math.sin(time * 3.0 + t * 0.6) * 0.1;
      const tSpread = (tNorm - 0.5) * flameWidth * 2.2;
      const tStartX = flameBaseX + tSpread * 0.5;
      const tStartY = flameBaseY - size * 0.02;
      const tMidX = flameBaseX + tSpread * 0.7 + tWobble + flameSway * 0.5;
      const tMidY =
        flameBaseY -
        flameHeight * (0.3 + tNorm * 0.25) +
        Math.abs(tSpread) * 0.3;
      const tEndX = tipX + tSpread * 0.8 + tWobble * 1.5;
      const tEndY = tipY + flameHeight * (0.05 + Math.abs(tNorm - 0.5) * 0.5);

      ctx.strokeStyle = tongueColors[t % tongueColors.length];
      ctx.globalAlpha = tAlpha;
      ctx.lineWidth = (1.0 + (1 - Math.abs(tNorm - 0.5) * 2) * 1.5) * zoom;
      ctx.shadowColor = "#ff4400";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(tStartX, tStartY);
      ctx.bezierCurveTo(
        tMidX,
        tMidY,
        tEndX - size * 0.03,
        tEndY - size * 0.02,
        tEndX,
        tEndY,
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    // Bright tip wisps (white-hot flickers at the top)
    for (let w = 0; w < 8; w++) {
      const wPhase = Math.sin(time * 9.0 + w * 1.3);
      const wAlpha = 0.3 + wPhase * 0.15;
      const wSpread = (w / 7 - 0.5) * flameWidth * 1.2;
      const wX = tipX + wSpread + flameSway * 0.2;
      const wY = tipY + size * 0.02 + Math.abs(wSpread) * 0.5;

      ctx.strokeStyle = `rgba(255, 250, 210, ${wAlpha})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(wX, wY);
      ctx.quadraticCurveTo(
        wX + wPhase * size * 0.03 + flameSway * 0.3,
        wY - size * 0.06,
        wX + wPhase * size * 0.05 + flameSway * 0.4,
        wY - size * 0.1,
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Rising ember sparks
    for (let e = 0; e < 12; e++) {
      const eLife = (time * 2.5 + e * 0.55) % 1;
      const eT = e / 11;
      const eRise = eLife * flameHeight * 1.2;
      const eSway = Math.sin(time * 5.5 + e * 1.2) * size * 0.05;
      const eX = flameBaseX + (eT - 0.5) * flameWidth * 0.8 + eSway;
      const eY = flameBaseY - eRise;
      const eAlpha = (1 - eLife) * 0.6;
      const eRadius = size * (0.008 + Math.sin(time * 6 + e) * 0.003);

      ctx.fillStyle = `rgba(255, ${190 + Math.floor(eT * 60)}, ${60 + Math.floor(eT * 120)}, ${eAlpha})`;
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 3 * zoom;
      ctx.beginPath();
      ctx.arc(eX, eY, eRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Intense root glow where plume meets helmet
    const rootG = ctx.createRadialGradient(
      flameBaseX,
      flameBaseY,
      0,
      flameBaseX,
      flameBaseY,
      size * 0.18,
    );
    rootG.addColorStop(0, `rgba(255, 140, 40, ${0.45 + flamePulse * 0.2})`);
    rootG.addColorStop(0.4, `rgba(255, 60, 20, ${0.2 + flamePulse * 0.1})`);
    rootG.addColorStop(1, "rgba(120, 10, 5, 0)");
    ctx.fillStyle = rootG;
    ctx.beginPath();
    ctx.arc(flameBaseX, flameBaseY, size * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Gold ornate crest mount
    const mountG = ctx.createLinearGradient(
      flameBaseX - size * 0.06,
      flameBaseY,
      flameBaseX + size * 0.06,
      flameBaseY,
    );
    mountG.addColorStop(0, "#6a5020");
    mountG.addColorStop(0.25, "#b09030");
    mountG.addColorStop(0.5, "#d4b450");
    mountG.addColorStop(0.75, "#b09030");
    mountG.addColorStop(1, "#6a5020");
    ctx.fillStyle = mountG;
    ctx.beginPath();
    ctx.roundRect(
      flameBaseX - size * 0.06,
      flameBaseY - size * 0.012,
      size * 0.12,
      size * 0.028,
      size * 0.006,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 230, 160, 0.35)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Glowing ruby at mount center
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 5 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(flameBaseX, flameBaseY + size * 0.002, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === DIVINE COMMAND EFFECT WHEN ATTACKING ===
  if (isAttacking) {
    // Outer divine fire rings
    for (let ring = 0; ring < 5; ring++) {
      const ringRadius = size * (0.6 + ring * 0.2 + commandPose * 0.3);
      const ringAlpha = commandPose * (0.6 - ring * 0.1);

      // Gold divine ring
      ctx.strokeStyle = `rgba(255, 200, 100, ${ringAlpha})`;
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Fire inner ring
      ctx.strokeStyle = `rgba(255, 100, 50, ${ringAlpha * 0.8})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        ringRadius * 0.92,
        ringRadius * 0.42,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Divine fire burst particles
    for (let spark = 0; spark < 16; spark++) {
      const sparkAngle =
        (time * 5 + (spark * Math.PI * 2) / 16) % (Math.PI * 2);
      const sparkDist = size * (0.65 + commandPose * 0.5);
      const sparkX = x + Math.cos(sparkAngle) * sparkDist;
      const sparkY = y + Math.sin(sparkAngle) * sparkDist * 0.45;
      const sparkAlpha =
        commandPose * (0.8 + Math.sin(time * 10 + spark) * 0.2);

      ctx.fillStyle =
        spark % 3 === 0
          ? `rgba(255, 220, 100, ${sparkAlpha})`
          : spark % 3 === 1
            ? `rgba(255, 150, 50, ${sparkAlpha})`
            : `rgba(220, 38, 38, ${sparkAlpha})`;
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Rising flame pillars
    for (let pillar = 0; pillar < 6; pillar++) {
      const pillarAngle = (pillar * Math.PI) / 3 + time * 2;
      const pillarDist = size * (0.5 + commandPose * 0.3);
      const pillarX = x + Math.cos(pillarAngle) * pillarDist;
      const pillarY = y + Math.sin(pillarAngle) * pillarDist * 0.45;
      const pillarHeight = size * 0.2 * commandPose;

      ctx.fillStyle = `rgba(255, 100, 50, ${commandPose * 0.6})`;
      ctx.shadowColor = "#ff4400";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(pillarX - size * 0.02, pillarY);
      ctx.lineTo(pillarX, pillarY - pillarHeight);
      ctx.lineTo(pillarX + size * 0.02, pillarY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();
}
