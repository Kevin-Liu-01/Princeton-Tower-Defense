function drawTenorSkirtArmor(
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
  const totalHeight = size * 0.32;
  const bandHeight = totalHeight / bandCount;
  const gapHalf = size * 0.10;

  drawTenorCenterBanner(ctx, x, size, time, zoom, skirtTop, totalHeight, gapHalf, gemPulse);

  for (let side = -1; side <= 1; side += 2) {
    drawTenorTassetSide(ctx, x, size, time, zoom, side, skirtTop, bandCount, bandHeight, totalHeight, gapHalf, gemPulse, isAttacking, attackIntensity);
  }

  drawTenorSkirtChain(ctx, x, size, zoom, skirtTop, gapHalf, gemPulse, time);
  drawTenorSkirtBelt(ctx, x, size, zoom, skirtTop, gemPulse);
}

function drawTenorTassetSide(
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
  isAttacking: boolean,
  attackIntensity: number,
) {
  const shear = size * -0.10;

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
      plateG.addColorStop(0, "#0a0515");
      plateG.addColorStop(0.25, "#151028");
      plateG.addColorStop(0.55, "#1f1535");
      plateG.addColorStop(1, "#281a42");
    } else {
      plateG.addColorStop(0, "#281a42");
      plateG.addColorStop(0.45, "#1f1535");
      plateG.addColorStop(0.75, "#151028");
      plateG.addColorStop(1, "#0a0515");
    }

    ctx.fillStyle = plateG;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(10, 5, 20, 0.4)";
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
    rg.addColorStop(0, "#f0c040");
    rg.addColorStop(0.4, "#c9a227");
    rg.addColorStop(1, "#8a6a10");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    if (band % 2 === 0) {
      const pleatCount = 2 + Math.floor(band / 2);
      for (let pc = 0; pc < pleatCount; pc++) {
        const t = (pc + 0.5) / pleatCount;
        const pleatX = innerX + t * (outerX - innerX);
        const pleatYBase = innerTopY + t * (outerTopY - innerTopY) + bandHeight * 0.4;
        ctx.strokeStyle = "rgba(40, 26, 66, 0.6)";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(pleatX, pleatYBase - bandHeight * 0.2);
        ctx.lineTo(pleatX, pleatYBase + bandHeight * 0.2);
        ctx.stroke();
      }
    }

    if (band % 2 === 1) {
      const midT = 0.5;
      const accentInnerX = innerX + side * size * 0.015;
      const accentOuterX = outerX - side * size * 0.015;
      const accentInnerY = innerTopY + bandHeight * midT;
      const accentOuterY = outerTopY + bandHeight * midT;
      ctx.strokeStyle = `rgba(240, 192, 64, ${0.25 + gemPulse * 0.25})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.shadowColor = "#f0c040";
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.moveTo(accentInnerX, accentInnerY);
      ctx.lineTo(accentOuterX, accentOuterY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}

function drawTenorCenterBanner(
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
  bannerGrad.addColorStop(0, "#1a0a30");
  bannerGrad.addColorStop(0.15, "#301850");
  bannerGrad.addColorStop(0.4, "#452870");
  bannerGrad.addColorStop(0.7, "#301850");
  bannerGrad.addColorStop(1, "#1a0a30");
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

  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  const emblemY = (bannerTop + bannerBottom) * 0.5 - size * 0.03;
  ctx.strokeStyle = `rgba(240, 192, 64, ${0.6 + gemPulse * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.01, emblemY - size * 0.02, size * 0.04, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.arc(x + size * 0.02, emblemY + size * 0.02, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawTenorSkirtChain(
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
    linkGrad.addColorStop(0, "#f0c040");
    linkGrad.addColorStop(0.5, "#c9a227");
    linkGrad.addColorStop(1, "#8a6a10");
    ctx.fillStyle = linkGrad;
    ctx.beginPath();
    const linkW = size * 0.011;
    const linkH = size * 0.007;
    const angle = i % 2 === 0 ? 0.3 : -0.3;
    ctx.ellipse(lx, ly, linkW, linkH, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6a10";
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
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(anchorX, chainY, size * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a6a10";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawTenorSkirtBelt(
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
  beltGrad.addColorStop(0, "#8a6a10");
  beltGrad.addColorStop(0.2, "#c9a227");
  beltGrad.addColorStop(0.4, "#f0c040");
  beltGrad.addColorStop(0.5, "#ffd860");
  beltGrad.addColorStop(0.6, "#f0c040");
  beltGrad.addColorStop(0.8, "#c9a227");
  beltGrad.addColorStop(1, "#8a6a10");

  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#8a6a10";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.strokeStyle = "#ffd860";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW + size * 0.01, skirtTop - beltThick * 0.5 + size * 0.004);
  ctx.lineTo(x + beltHalfW - size * 0.01, skirtTop - beltThick * 0.5 + size * 0.004);
  ctx.stroke();

  ctx.fillStyle = "#f0c040";
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, skirtTop + vDip * 0.35, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd860";
  ctx.beginPath();
  ctx.arc(x - size * 0.008, skirtTop + vDip * 0.35 - size * 0.008, size * 0.013, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawTenorHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const s = size;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breathe = Math.sin(time * 2) * 1.5;
  const singWave = Math.sin(time * 3) * 3;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  drawSonicAura(ctx, x, y, s, time, isAttacking, zoom);
  drawMusicalParticles(ctx, x, y, s, time, isAttacking);

  if (isAttacking) {
    drawShockwaveRings(ctx, x, y, s, attackPhase, attackIntensity, zoom);
  }

  drawShadow(ctx, x, y, s);
  drawDressShoes(ctx, x, y, s, zoom);
  drawTuxedoBody(ctx, x, y, s, breathe, zoom);
  drawTenorSkirtArmor(ctx, x, y, s, time, zoom, isAttacking, attackIntensity, gemPulse);
  drawFlowingCapes(ctx, x, y, s, time, zoom);
  drawCummerbund(ctx, x, y, s, zoom);
  drawConductorArms(ctx, x, y, s, time, zoom, isAttacking, attackPhase, attackIntensity);
  drawShirtAndBowTie(ctx, x, y, s, breathe, isAttacking, attackIntensity, gemPulse, zoom);
  drawEpaulets(ctx, x, y, s, time, zoom);
  drawGoldChains(ctx, x, y, s, time, zoom);
  drawHead(ctx, x, y, s, time, singWave, breathe, zoom, isAttacking, attackIntensity, gemPulse);
  drawPoppedCollar(ctx, x, y, s, singWave, breathe, zoom);
  drawRimLight(ctx, x, y, s, time, zoom, isAttacking);
  drawFloatingNotes(ctx, x, y, s, time, isAttacking, zoom);
  drawSonicRings(ctx, x, y, s, time, isAttacking, zoom);

  if (isAttacking) {
    drawSpotlight(ctx, x, y, s, attackIntensity);
  }
}

// ─── SONIC AURA ──────────────────────────────────────────────────────────────

function drawSonicAura(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, isAttacking: boolean, _zoom: number
) {
  const auraBase = isAttacking ? 0.4 : 0.2;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;
  for (let layer = 0; layer < 4; layer++) {
    const offset = layer * 0.1;
    const g = ctx.createRadialGradient(
      x, y - s * 0.2, s * (0.1 + offset),
      x, y - s * 0.2, s * (0.95 + offset * 0.3)
    );
    const a = (auraBase - layer * 0.04) * auraPulse;
    g.addColorStop(0, `rgba(147, 112, 219, ${a * 0.5})`);
    g.addColorStop(0.4, `rgba(180, 150, 235, ${a * 0.35})`);
    g.addColorStop(0.7, `rgba(255, 102, 0, ${a * 0.2})`);
    g.addColorStop(1, "rgba(147, 112, 219, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.2, s * (0.9 + offset * 0.2), s * (0.65 + offset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── MUSICAL PARTICLES ───────────────────────────────────────────────────────

function drawMusicalParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, isAttacking: boolean
) {
  const count = isAttacking ? 14 : 10;
  for (let p = 0; p < count; p++) {
    const angle = (time * 1.8 + p * Math.PI * 2 / count) % (Math.PI * 2);
    const dist = s * 0.6 + Math.sin(time * 2.5 + p * 0.7) * s * 0.12;
    const px = x + Math.cos(angle) * dist;
    const py = y - s * 0.2 + Math.sin(angle) * dist * 0.5;
    const alpha = 0.55 + Math.sin(time * 4 + p * 0.6) * 0.3;
    ctx.fillStyle = p % 2 === 0
      ? `rgba(147, 112, 219, ${alpha})`
      : `rgba(255, 102, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── SHOCKWAVE RINGS ─────────────────────────────────────────────────────────

function drawShockwaveRings(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  attackPhase: number, attackIntensity: number, zoom: number
) {
  for (let ring = 0; ring < 5; ring++) {
    const phase = (attackPhase * 2.5 + ring * 0.12) % 1;
    const alpha = (1 - phase) * 0.6 * attackIntensity;
    ctx.strokeStyle = `rgba(147, 112, 219, ${alpha})`;
    ctx.lineWidth = (4 - ring * 0.6) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.25, s * (0.55 + phase * 0.9), s * (0.42 + phase * 0.7), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 200, 255, ${alpha * 0.4})`;
    ctx.lineWidth = (2 - ring * 0.3) * zoom;
    ctx.stroke();
  }
}

// ─── SHADOW ──────────────────────────────────────────────────────────────────

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const g = ctx.createRadialGradient(x, y + s * 0.52, 0, x, y + s * 0.52, s * 0.45);
  g.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  g.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.52, s * 0.42, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── DRESS SHOES ─────────────────────────────────────────────────────────────

function drawDressShoes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, _zoom: number
) {
  for (let side = -1; side <= 1; side += 2) {
    const shoeX = x + side * s * 0.12;
    const shoeY = y + s * 0.52;

    // Shoe body — polished black formal shoe
    const shoeGrad = ctx.createLinearGradient(shoeX - s * 0.06, shoeY, shoeX + s * 0.06, shoeY + s * 0.06);
    shoeGrad.addColorStop(0, "#1a1a1a");
    shoeGrad.addColorStop(0.4, "#2a2a2a");
    shoeGrad.addColorStop(0.6, "#1a1a1a");
    shoeGrad.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = shoeGrad;
    ctx.beginPath();
    ctx.moveTo(shoeX - s * 0.06, shoeY - s * 0.02);
    ctx.quadraticCurveTo(shoeX - s * 0.08, shoeY + s * 0.02, shoeX - s * 0.05, shoeY + s * 0.05);
    ctx.lineTo(shoeX + side * s * 0.1, shoeY + s * 0.05);
    ctx.quadraticCurveTo(shoeX + side * s * 0.12, shoeY + s * 0.02, shoeX + side * s * 0.08, shoeY - s * 0.01);
    ctx.lineTo(shoeX + s * 0.04, shoeY - s * 0.02);
    ctx.closePath();
    ctx.fill();

    // Sole — dark brown
    ctx.fillStyle = "#2a1a10";
    ctx.beginPath();
    ctx.moveTo(shoeX - s * 0.06, shoeY + s * 0.045);
    ctx.lineTo(shoeX + side * s * 0.11, shoeY + s * 0.045);
    ctx.lineTo(shoeX + side * s * 0.1, shoeY + s * 0.06);
    ctx.lineTo(shoeX - s * 0.055, shoeY + s * 0.06);
    ctx.closePath();
    ctx.fill();

    // Toe cap highlight
    ctx.fillStyle = "rgba(80, 80, 90, 0.3)";
    ctx.beginPath();
    ctx.ellipse(shoeX + side * s * 0.06, shoeY + s * 0.01, s * 0.035, s * 0.02, side * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Shoe shine spot
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.ellipse(shoeX + side * s * 0.03, shoeY - s * 0.005, s * 0.018, s * 0.008, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── FLOWING CAPES ───────────────────────────────────────────────────────────

function drawFlowingCapes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number
) {
  const wave1 = Math.sin(time * 2.2) * s * 0.04;
  const wave2 = Math.sin(time * 3.1 + 0.8) * s * 0.03;
  const wave3 = Math.sin(time * 1.7 + 1.5) * s * 0.025;

  for (let side = -1; side <= 1; side += 2) {
    const flip = side;
    const shoulderX = x + flip * s * 0.38;
    const shoulderY = y - s * 0.22;
    const capeBottomY = y + s * 0.7;
    const capeOuterX = x + flip * s * 0.72;
    const w1 = wave1 * flip;
    const w2 = wave2 * flip;
    const w3 = wave3 * flip;

    // Cape shadow layer
    ctx.fillStyle = "rgba(10, 5, 20, 0.4)";
    ctx.beginPath();
    ctx.moveTo(shoulderX + flip * s * 0.02, shoulderY + s * 0.02);
    ctx.bezierCurveTo(
      capeOuterX + w1 * 1.2 + flip * s * 0.04, shoulderY + s * 0.2,
      capeOuterX + w2 * 1.3 + flip * s * 0.06, y + s * 0.35,
      capeOuterX + w3 + flip * s * 0.03, capeBottomY + s * 0.03
    );
    ctx.lineTo(x + flip * s * 0.22, capeBottomY + s * 0.05);
    ctx.bezierCurveTo(
      x + flip * s * 0.18, y + s * 0.3,
      shoulderX - flip * s * 0.05, shoulderY + s * 0.15,
      shoulderX + flip * s * 0.02, shoulderY + s * 0.02
    );
    ctx.closePath();
    ctx.fill();

    // Main cape body — deep purple-black with gradient
    const capeGrad = ctx.createLinearGradient(shoulderX, shoulderY, capeOuterX, capeBottomY);
    capeGrad.addColorStop(0, "#1a0a30");
    capeGrad.addColorStop(0.2, "#25103d");
    capeGrad.addColorStop(0.5, "#1e0c35");
    capeGrad.addColorStop(0.8, "#150828");
    capeGrad.addColorStop(1, "#0a0418");
    ctx.fillStyle = capeGrad;

    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.bezierCurveTo(
      capeOuterX + w1, shoulderY + s * 0.15,
      capeOuterX + w2 * 1.2, y + s * 0.3,
      capeOuterX + w3, capeBottomY
    );
    ctx.lineTo(x + flip * s * 0.2, capeBottomY + s * 0.02);
    ctx.bezierCurveTo(
      x + flip * s * 0.15, y + s * 0.25,
      shoulderX - flip * s * 0.08, shoulderY + s * 0.12,
      shoulderX, shoulderY
    );
    ctx.closePath();
    ctx.fill();

    // Cape inner lining — rich satin purple, visible as a fold
    const liningGrad = ctx.createLinearGradient(shoulderX, shoulderY, x + flip * s * 0.25, capeBottomY);
    liningGrad.addColorStop(0, "#5a2880");
    liningGrad.addColorStop(0.3, "#7a3aa8");
    liningGrad.addColorStop(0.6, "#6a30a0");
    liningGrad.addColorStop(1, "#4a2070");
    ctx.fillStyle = liningGrad;

    ctx.beginPath();
    ctx.moveTo(shoulderX - flip * s * 0.03, shoulderY + s * 0.04);
    ctx.bezierCurveTo(
      x + flip * s * 0.35 + w1 * 0.5, y + s * 0.05,
      x + flip * s * 0.28 + w2 * 0.4, y + s * 0.35,
      x + flip * s * 0.22, capeBottomY - s * 0.05
    );
    ctx.lineTo(x + flip * s * 0.2, capeBottomY + s * 0.02);
    ctx.bezierCurveTo(
      x + flip * s * 0.15, y + s * 0.25,
      shoulderX - flip * s * 0.08, shoulderY + s * 0.12,
      shoulderX - flip * s * 0.03, shoulderY + s * 0.04
    );
    ctx.closePath();
    ctx.fill();

    // Flowing fabric fold lines
    ctx.strokeStyle = "rgba(100, 60, 160, 0.35)";
    ctx.lineWidth = 1.2 * zoom;
    for (let fold = 0; fold < 4; fold++) {
      const t = 0.2 + fold * 0.2;
      const foldStartX = shoulderX + flip * s * (0.02 + fold * 0.06) + wave1 * t;
      const foldStartY = shoulderY + s * 0.05 + fold * s * 0.03;
      const foldEndX = x + flip * s * (0.25 + fold * 0.08) + wave3 * (1 - t);
      const foldEndY = capeBottomY - s * 0.1 + fold * s * 0.02;
      const foldMidX = (foldStartX + foldEndX) * 0.5 + wave2 * (0.5 + fold * 0.2);
      const foldMidY = (foldStartY + foldEndY) * 0.5;

      ctx.beginPath();
      ctx.moveTo(foldStartX, foldStartY);
      ctx.quadraticCurveTo(foldMidX, foldMidY, foldEndX, foldEndY);
      ctx.stroke();
    }

    // Cape outer edge highlight
    ctx.strokeStyle = "#6a3890";
    ctx.shadowColor = "#b080e0";
    ctx.shadowBlur = 3 * zoom;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.bezierCurveTo(
      capeOuterX + w1, shoulderY + s * 0.15,
      capeOuterX + w2 * 1.2, y + s * 0.3,
      capeOuterX + w3, capeBottomY
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Gold trim along the bottom hem
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(capeOuterX + w3, capeBottomY);
    ctx.quadraticCurveTo(
      x + flip * s * 0.45, capeBottomY + s * 0.04 + wave2 * 0.3,
      x + flip * s * 0.2, capeBottomY + s * 0.02
    );
    ctx.stroke();

    // Gold ornamental edge dots
    ctx.fillStyle = "#f0c040";
    for (let dot = 0; dot < 5; dot++) {
      const dt = dot / 4;
      const dotX = capeOuterX + w3 + (x + flip * s * 0.2 - capeOuterX - w3) * dt;
      const dotY = capeBottomY + s * 0.01 + Math.sin(dt * Math.PI) * s * 0.03;
      ctx.beginPath();
      ctx.arc(dotX, dotY, s * 0.01, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shoulder clasp — ornate gold fastener where cape attaches
    drawShoulderClasp(ctx, shoulderX, shoulderY, s, flip, zoom);
  }
}

function drawShoulderClasp(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, s: number,
  side: number, zoom: number
) {
  // Ornate circular clasp
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8a6a10";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.04, 0, Math.PI * 2);
  ctx.stroke();

  // Inner decorative ring
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.025, 0, Math.PI * 2);
  ctx.stroke();

  // Center gem
  ctx.fillStyle = "#c090e0";
  ctx.shadowColor = "#d0a0ff";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Radiating points
  ctx.fillStyle = "#f0c040";
  for (let p = 0; p < 4; p++) {
    const angle = p * Math.PI * 0.5 + Math.PI * 0.25;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(angle) * s * 0.025, sy + Math.sin(angle) * s * 0.025);
    ctx.lineTo(sx + Math.cos(angle - 0.3) * s * 0.04, sy + Math.sin(angle - 0.3) * s * 0.04);
    ctx.lineTo(sx + Math.cos(angle) * s * 0.048, sy + Math.sin(angle) * s * 0.048);
    ctx.lineTo(sx + Math.cos(angle + 0.3) * s * 0.04, sy + Math.sin(angle + 0.3) * s * 0.04);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── GOLD CHAINS ─────────────────────────────────────────────────────────────

function drawGoldChains(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number
) {
  const leftClaspX = x - s * 0.38;
  const rightClaspX = x + s * 0.38;
  const claspY = y - s * 0.22;
  const sway = Math.sin(time * 2) * s * 0.01;

  for (let chain = 0; chain < 2; chain++) {
    const droop = s * (0.12 + chain * 0.08);
    const chainY = claspY + s * 0.04 + chain * s * 0.06;
    const midY = chainY + droop + sway;

    // Chain shadow
    ctx.strokeStyle = "rgba(60, 40, 0, 0.3)";
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(leftClaspX, chainY + s * 0.01);
    ctx.quadraticCurveTo(x, midY + s * 0.01, rightClaspX, chainY + s * 0.01);
    ctx.stroke();

    // Main chain — gold links
    const chainGrad = ctx.createLinearGradient(leftClaspX, chainY, rightClaspX, chainY);
    chainGrad.addColorStop(0, "#c9a227");
    chainGrad.addColorStop(0.25, "#f0c040");
    chainGrad.addColorStop(0.5, "#ffd860");
    chainGrad.addColorStop(0.75, "#f0c040");
    chainGrad.addColorStop(1, "#c9a227");
    ctx.strokeStyle = chainGrad;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(leftClaspX, chainY);
    ctx.quadraticCurveTo(x, midY, rightClaspX, chainY);
    ctx.stroke();

    // Individual chain link marks
    ctx.fillStyle = "#f0c040";
    const linkCount = 12 + chain * 4;
    for (let link = 0; link <= linkCount; link++) {
      const t = link / linkCount;
      const lx = leftClaspX + (rightClaspX - leftClaspX) * t;
      const ly = chainY + (midY - chainY) * Math.sin(t * Math.PI);
      ctx.beginPath();
      ctx.arc(lx, ly, s * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center medallion on first chain
    if (chain === 0) {
      drawChainMedallion(ctx, x, midY, s, time, zoom);
    }
  }
}

function drawChainMedallion(
  ctx: CanvasRenderingContext2D,
  mx: number, my: number, s: number,
  time: number, zoom: number
) {
  const pulse = Math.sin(time * 2.5) * 0.15 + 0.85;

  // Medallion outer ring
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(mx, my, s * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a6a10";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Inner ring
  ctx.fillStyle = "#1a0a30";
  ctx.beginPath();
  ctx.arc(mx, my, s * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Purple gem center
  ctx.fillStyle = `rgba(180, 120, 240, ${pulse})`;
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 6 * zoom * pulse;
  ctx.beginPath();
  ctx.arc(mx, my, s * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Highlight
  ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * pulse})`;
  ctx.beginPath();
  ctx.arc(mx - s * 0.006, my - s * 0.006, s * 0.007, 0, Math.PI * 2);
  ctx.fill();
}

// ─── TUXEDO BODY ─────────────────────────────────────────────────────────────

function drawTuxedoBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  breathe: number, zoom: number
) {
  const tuxGrad = ctx.createLinearGradient(x - s * 0.4, y - s * 0.3, x + s * 0.4, y + s * 0.4);
  tuxGrad.addColorStop(0, "#0a0515");
  tuxGrad.addColorStop(0.15, "#1a1028");
  tuxGrad.addColorStop(0.35, "#251538");
  tuxGrad.addColorStop(0.5, "#301a45");
  tuxGrad.addColorStop(0.65, "#251538");
  tuxGrad.addColorStop(0.85, "#1a1028");
  tuxGrad.addColorStop(1, "#0a0515");
  ctx.fillStyle = tuxGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y + s * 0.52 + breathe);
  ctx.lineTo(x - s * 0.45, y - s * 0.14);
  ctx.lineTo(x - s * 0.35, y - s * 0.28);
  ctx.quadraticCurveTo(x, y - s * 0.38, x + s * 0.35, y - s * 0.28);
  ctx.lineTo(x + s * 0.45, y - s * 0.14);
  ctx.lineTo(x + s * 0.4, y + s * 0.52 + breathe);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.38, y + s * 0.5 + breathe);
  ctx.lineTo(x - s * 0.43, y - s * 0.12);
  ctx.lineTo(x - s * 0.33, y - s * 0.26);
  ctx.stroke();

  drawLapels(ctx, x, y, s, zoom);
  drawTuxedoTails(ctx, x, y, s, breathe);
  drawButtons(ctx, x, y, s);
  drawPocketSquare(ctx, x, y, s, zoom);
}

// ─── LAPELS ──────────────────────────────────────────────────────────────────

function drawLapels(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, zoom: number
) {
  const lapelGrad = ctx.createLinearGradient(x - s * 0.3, y - s * 0.25, x, y + s * 0.1);
  lapelGrad.addColorStop(0, "#4a2060");
  lapelGrad.addColorStop(0.5, "#6a3080");
  lapelGrad.addColorStop(1, "#4a2060");
  ctx.fillStyle = lapelGrad;

  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y - s * 0.26);
  ctx.lineTo(x - s * 0.16, y - s * 0.22);
  ctx.lineTo(x - s * 0.18, y + s * 0.15);
  ctx.lineTo(x - s * 0.35, y + s * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + s * 0.35, y - s * 0.26);
  ctx.lineTo(x + s * 0.16, y - s * 0.22);
  ctx.lineTo(x + s * 0.18, y + s * 0.15);
  ctx.lineTo(x + s * 0.35, y + s * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#9060c0";
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 3 * zoom;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.16, y - s * 0.22);
  ctx.lineTo(x - s * 0.18, y + s * 0.15);
  ctx.moveTo(x + s * 0.16, y - s * 0.22);
  ctx.lineTo(x + s * 0.18, y + s * 0.15);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ─── TUXEDO TAILS ────────────────────────────────────────────────────────────

function drawTuxedoTails(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, breathe: number
) {
  const tailWave = breathe * 0.05;

  for (let side = -1; side <= 1; side += 2) {
    const tw = tailWave * side;

    // Tail shadow
    ctx.fillStyle = "rgba(5, 2, 10, 0.4)";
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.29, y + s * 0.36);
    ctx.bezierCurveTo(
      x + side * (s * 0.4 + tw * s), y + s * 0.54,
      x + side * (s * 0.37 + tw * s), y + s * 0.7,
      x + side * s * 0.32, y + s * 0.74
    );
    ctx.lineTo(x + side * s * 0.2, y + s * 0.6);
    ctx.closePath();
    ctx.fill();

    // Main tail body
    const tailGrad = ctx.createLinearGradient(
      x + side * s * 0.2, y + s * 0.35,
      x + side * s * 0.35, y + s * 0.7
    );
    tailGrad.addColorStop(0, "#151018");
    tailGrad.addColorStop(0.4, "#1a1220");
    tailGrad.addColorStop(0.7, "#120e18");
    tailGrad.addColorStop(1, "#0a0812");
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.28, y + s * 0.35);
    ctx.bezierCurveTo(
      x + side * (s * 0.38 + tw * s), y + s * 0.52,
      x + side * (s * 0.35 + tw * s), y + s * 0.68,
      x + side * s * 0.3, y + s * 0.72
    );
    ctx.lineTo(x + side * s * 0.2, y + s * 0.58);
    ctx.closePath();
    ctx.fill();

    // Tail inner lining peek — purple
    ctx.fillStyle = "#3a1860";
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.22, y + s * 0.4);
    ctx.quadraticCurveTo(
      x + side * s * 0.25, y + s * 0.55,
      x + side * s * 0.22, y + s * 0.6
    );
    ctx.lineTo(x + side * s * 0.2, y + s * 0.56);
    ctx.quadraticCurveTo(
      x + side * s * 0.21, y + s * 0.48,
      x + side * s * 0.2, y + s * 0.4
    );
    ctx.closePath();
    ctx.fill();

    // Tail edge definition
    ctx.strokeStyle = "#5a3070";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.28, y + s * 0.35);
    ctx.bezierCurveTo(
      x + side * (s * 0.38 + tw * s), y + s * 0.52,
      x + side * (s * 0.35 + tw * s), y + s * 0.68,
      x + side * s * 0.3, y + s * 0.72
    );
    ctx.stroke();
  }
}

// ─── BUTTONS ─────────────────────────────────────────────────────────────────

function drawButtons(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  for (let btn = 0; btn < 3; btn++) {
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(x - s * 0.2, y + s * 0.02 + btn * s * 0.12, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0c040";
    ctx.beginPath();
    ctx.arc(x - s * 0.2 - s * 0.005, y + s * 0.015 + btn * s * 0.12, s * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── POCKET SQUARE ───────────────────────────────────────────────────────────

function drawPocketSquare(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, zoom: number
) {
  const g = ctx.createLinearGradient(x - s * 0.32, y - s * 0.1, x - s * 0.24, y - s * 0.05);
  g.addColorStop(0, "#8040a0");
  g.addColorStop(0.5, "#a060c0");
  g.addColorStop(1, "#8040a0");
  ctx.fillStyle = g;
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.32, y - s * 0.1);
  ctx.lineTo(x - s * 0.28, y - s * 0.15);
  ctx.lineTo(x - s * 0.24, y - s * 0.08);
  ctx.lineTo(x - s * 0.26, y - s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── CUMMERBUND ──────────────────────────────────────────────────────────────

function drawCummerbund(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, zoom: number
) {
  // Formal waistband — satin purple with pleats
  const cumbGrad = ctx.createLinearGradient(x - s * 0.35, y + s * 0.2, x + s * 0.35, y + s * 0.2);
  cumbGrad.addColorStop(0, "#3a1860");
  cumbGrad.addColorStop(0.2, "#4a2078");
  cumbGrad.addColorStop(0.5, "#5a2890");
  cumbGrad.addColorStop(0.8, "#4a2078");
  cumbGrad.addColorStop(1, "#3a1860");
  ctx.fillStyle = cumbGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y + s * 0.18);
  ctx.quadraticCurveTo(x, y + s * 0.16, x + s * 0.35, y + s * 0.18);
  ctx.lineTo(x + s * 0.34, y + s * 0.3);
  ctx.quadraticCurveTo(x, y + s * 0.28, x - s * 0.34, y + s * 0.3);
  ctx.closePath();
  ctx.fill();

  // Pleat lines
  ctx.strokeStyle = "rgba(80, 40, 120, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let p = 0; p < 6; p++) {
    const pleatX = x - s * 0.28 + p * s * 0.112;
    ctx.beginPath();
    ctx.moveTo(pleatX, y + s * 0.185);
    ctx.lineTo(pleatX, y + s * 0.29);
    ctx.stroke();
  }

  // Satin sheen highlight
  const sheenGrad = ctx.createLinearGradient(x - s * 0.1, y + s * 0.19, x + s * 0.1, y + s * 0.24);
  sheenGrad.addColorStop(0, "rgba(120, 80, 180, 0)");
  sheenGrad.addColorStop(0.4, "rgba(140, 100, 200, 0.3)");
  sheenGrad.addColorStop(0.6, "rgba(140, 100, 200, 0.3)");
  sheenGrad.addColorStop(1, "rgba(120, 80, 180, 0)");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y + s * 0.2);
  ctx.quadraticCurveTo(x, y + s * 0.18, x + s * 0.3, y + s * 0.2);
  ctx.lineTo(x + s * 0.28, y + s * 0.25);
  ctx.quadraticCurveTo(x, y + s * 0.23, x - s * 0.28, y + s * 0.25);
  ctx.closePath();
  ctx.fill();

  // Top/bottom edge definition
  ctx.strokeStyle = "#6a3898";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y + s * 0.18);
  ctx.quadraticCurveTo(x, y + s * 0.16, x + s * 0.35, y + s * 0.18);
  ctx.stroke();
  ctx.strokeStyle = "#2a0e40";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.34, y + s * 0.3);
  ctx.quadraticCurveTo(x, y + s * 0.28, x + s * 0.34, y + s * 0.3);
  ctx.stroke();
}

// ─── EPAULETS ────────────────────────────────────────────────────────────────

function drawEpaulets(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number
) {
  for (let side = -1; side <= 1; side += 2) {
    const epX = x + side * s * 0.42;
    const epY = y - s * 0.2;

    // Epaulet base — gold plate
    const epGrad = ctx.createRadialGradient(
      epX - side * s * 0.02, epY - s * 0.01, 0,
      epX, epY, s * 0.1
    );
    epGrad.addColorStop(0, "#ffd860");
    epGrad.addColorStop(0.4, "#e0b030");
    epGrad.addColorStop(0.8, "#c9a227");
    epGrad.addColorStop(1, "#8a6a10");
    ctx.fillStyle = epGrad;
    ctx.beginPath();
    ctx.ellipse(epX, epY, s * 0.08, s * 0.04, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Border ring
    ctx.strokeStyle = "#8a6a10";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(epX, epY, s * 0.08, s * 0.04, side * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Inner decorative border
    ctx.strokeStyle = "#ffd860";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(epX, epY, s * 0.06, s * 0.028, side * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Center crest — small purple gem
    ctx.fillStyle = "#9050c0";
    ctx.shadowColor = "#b080e0";
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.arc(epX, epY, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Gold fringe hanging down
    const fringeCount = 7;
    const fringeY = epY + s * 0.035;
    const fringeSpan = s * 0.13;
    const fringeStartX = epX - fringeSpan * 0.5;
    const sway = Math.sin(time * 2.5 + side) * s * 0.005;

    for (let f = 0; f < fringeCount; f++) {
      const fx = fringeStartX + (f / (fringeCount - 1)) * fringeSpan;
      const fLen = s * (0.04 + Math.sin(f * 0.8) * 0.01);
      const fSway = sway * (1 + f * 0.1);

      // Fringe strand
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.8 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fx, fringeY);
      ctx.quadraticCurveTo(fx + fSway, fringeY + fLen * 0.6, fx + fSway * 1.5, fringeY + fLen);
      ctx.stroke();

      // Fringe tip bead
      ctx.fillStyle = "#f0c040";
      ctx.beginPath();
      ctx.arc(fx + fSway * 1.5, fringeY + fLen, s * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── CONDUCTOR ARMS ──────────────────────────────────────────────────────────

function drawConductorArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number,
  isAttacking: boolean, attackPhase: number, attackIntensity: number
) {
  // Conductor pattern: continuous sweeping figure-8 / time-signature motions
  // Left arm (baton arm) traces a smooth conducting pattern
  const conductBeat = time * 2.8;
  const beatPhase = conductBeat % (Math.PI * 2);

  // 4/4 time conducting pattern for left arm: down-left-right-up
  const leftAngle = isAttacking
    ? -0.3 - Math.sin(attackPhase * Math.PI) * 1.5
    : -0.3 - Math.sin(beatPhase) * 0.55 - Math.cos(beatPhase * 0.5) * 0.25;
  const leftLift = isAttacking
    ? Math.sin(attackPhase * Math.PI) * s * 0.12
    : Math.sin(beatPhase * 0.5) * s * 0.08 + Math.cos(beatPhase) * s * 0.04;

  // Right arm mirrors with delay and less amplitude (supporting/expressive arm)
  const rightAngle = isAttacking
    ? 0.3 + Math.sin(attackPhase * Math.PI + 0.3) * 1.3
    : 0.3 + Math.sin(beatPhase + 1.2) * 0.4 + Math.cos(beatPhase * 0.5 + 0.8) * 0.2;
  const rightLift = isAttacking
    ? Math.sin(attackPhase * Math.PI + 0.3) * s * 0.1
    : Math.sin(beatPhase * 0.5 + 1.0) * s * 0.06;

  drawSingleArm(ctx, x, y, s, time, zoom, -1, leftAngle, leftLift, isAttacking, attackIntensity, true);
  drawSingleArm(ctx, x, y, s, time, zoom, 1, rightAngle, rightLift, isAttacking, attackIntensity, false);
}

function drawSingleArm(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number,
  side: number, angle: number, lift: number,
  isAttacking: boolean, attackIntensity: number,
  isBatonHand: boolean
) {
  ctx.save();
  ctx.translate(x + side * s * 0.42, y - s * 0.1 - lift);
  ctx.rotate(angle);

  // Sleeve
  const sleeveGrad = ctx.createLinearGradient(0, 0, side * s * 0.15, s * 0.35);
  sleeveGrad.addColorStop(0, "#1a1028");
  sleeveGrad.addColorStop(0.5, "#2a1840");
  sleeveGrad.addColorStop(1, "#150a20");
  ctx.fillStyle = sleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(side * s * 0.08, s * 0.15, side * s * 0.05, s * 0.32);
  ctx.lineTo(-side * s * 0.08, s * 0.3);
  ctx.quadraticCurveTo(-side * s * 0.1, s * 0.15, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Forearm (visible lower arm piece for more articulation)
  const forearmGrad = ctx.createLinearGradient(0, s * 0.28, side * s * 0.02, s * 0.42);
  forearmGrad.addColorStop(0, "#1a1028");
  forearmGrad.addColorStop(1, "#251538");
  ctx.fillStyle = forearmGrad;
  ctx.beginPath();
  ctx.moveTo(-side * s * 0.06, s * 0.28);
  ctx.quadraticCurveTo(0, s * 0.36, side * s * 0.04, s * 0.42);
  ctx.lineTo(-side * s * 0.04, s * 0.43);
  ctx.quadraticCurveTo(-side * s * 0.08, s * 0.38, -side * s * 0.08, s * 0.3);
  ctx.closePath();
  ctx.fill();

  // Cuff
  ctx.fillStyle = "#a060c0";
  ctx.beginPath();
  ctx.ellipse(-side * s * 0.015, s * 0.31, s * 0.07, s * 0.025, -side * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Gold cufflink
  ctx.fillStyle = "#f0c040";
  ctx.beginPath();
  ctx.arc(-side * s * 0.015, s * 0.31, s * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(-side * s * 0.015, s * 0.31, s * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Hand
  const handWave = Math.sin(time * 4.5 + (isBatonHand ? 0 : 1.5)) * 0.15;
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(
    -side * s * 0.01,
    s * 0.42,
    s * 0.045,
    s * 0.055,
    -side * 0.15 + handWave,
    0, Math.PI * 2
  );
  ctx.fill();

  // Finger details — always visible for conductor expressiveness
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = (isAttacking ? 3 : 2.2) * zoom;
  ctx.lineCap = "round";

  if (isBatonHand) {
    drawBatonHandFingers(ctx, s, side, time, isAttacking);
    drawBaton(ctx, s, side, time, zoom, isAttacking, attackIntensity);
  } else {
    drawExpressiveHandFingers(ctx, s, side, time, isAttacking);
  }

  ctx.restore();
}

function drawBatonHandFingers(
  ctx: CanvasRenderingContext2D,
  s: number, side: number, time: number, isAttacking: boolean
) {
  // Fingers curled around baton grip
  const grip = isAttacking ? 0.15 : 0.1;
  for (let f = 0; f < 4; f++) {
    const fAngle = -0.8 + f * 0.35 + Math.sin(time * 5 + f * 0.4) * grip;
    const fLen = s * (0.025 + (f === 1 ? 0.008 : 0));
    const baseX = -side * s * 0.01;
    const baseY = s * 0.42;
    ctx.beginPath();
    ctx.moveTo(baseX + Math.cos(fAngle) * s * 0.03, baseY + Math.sin(fAngle) * s * 0.04);
    ctx.lineTo(
      baseX + Math.cos(fAngle) * (s * 0.03 + fLen),
      baseY + Math.sin(fAngle) * (s * 0.04 + fLen * 0.5)
    );
    ctx.stroke();
  }
  // Thumb wrapping around
  ctx.beginPath();
  ctx.moveTo(-side * s * 0.01 + side * s * 0.03, s * 0.41);
  ctx.lineTo(-side * s * 0.01 + side * s * 0.055, s * 0.395);
  ctx.stroke();
}

function drawBaton(
  ctx: CanvasRenderingContext2D,
  s: number, side: number, time: number, zoom: number,
  isAttacking: boolean, attackIntensity: number
) {
  const batonTip = Math.sin(time * 5.6) * 0.08;
  const batonLen = s * 0.22;
  const baseX = -side * s * 0.01;
  const baseY = s * 0.42;
  const tipAngle = -0.4 + batonTip + (isAttacking ? Math.sin(time * 8) * 0.2 : 0);

  // Baton shaft
  ctx.strokeStyle = "#f8f0e0";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(
    baseX + Math.cos(tipAngle) * batonLen,
    baseY + Math.sin(tipAngle) * batonLen
  );
  ctx.stroke();

  // Baton handle (cork grip)
  ctx.strokeStyle = "#c9a060";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(
    baseX + Math.cos(tipAngle) * s * 0.04,
    baseY + Math.sin(tipAngle) * s * 0.04
  );
  ctx.stroke();

  // Baton tip glow when attacking
  if (isAttacking) {
    const tipX = baseX + Math.cos(tipAngle) * batonLen;
    const tipY = baseY + Math.sin(tipAngle) * batonLen;
    ctx.shadowColor = "#d0a0ff";
    ctx.shadowBlur = 8 * zoom * attackIntensity;
    ctx.fillStyle = `rgba(200, 160, 255, ${0.6 * attackIntensity})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawExpressiveHandFingers(
  ctx: CanvasRenderingContext2D,
  s: number, side: number, time: number, isAttacking: boolean
) {
  // Expressive spread fingers for the supporting arm
  const spread = isAttacking ? 0.45 : 0.35;
  const fingerWave = Math.sin(time * 3.5) * 0.08;
  for (let f = 0; f < 5; f++) {
    const fAngle = -0.5 + f * spread + fingerWave * (f - 2) * 0.3;
    const fLen = s * (0.035 + (f === 2 ? 0.012 : f === 0 || f === 4 ? -0.008 : 0));
    const baseX = -side * s * 0.01;
    const baseY = s * 0.42;
    ctx.beginPath();
    ctx.moveTo(baseX + Math.cos(fAngle) * s * 0.03, baseY + Math.sin(fAngle) * s * 0.04);
    ctx.lineTo(
      baseX + Math.cos(fAngle) * (s * 0.03 + fLen),
      baseY + Math.sin(fAngle) * (s * 0.04 + fLen * 0.6)
    );
    ctx.stroke();
  }
}

// ─── SHIRT & BOW TIE ────────────────────────────────────────────────────────

function drawShirtAndBowTie(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  breathe: number,
  isAttacking: boolean, attackIntensity: number, gemPulse: number, zoom: number
) {
  // Shirt
  const shirtGrad = ctx.createLinearGradient(x - s * 0.15, y - s * 0.2, x + s * 0.15, y + s * 0.3);
  shirtGrad.addColorStop(0, "#ffffff");
  shirtGrad.addColorStop(0.5, "#f8f8f8");
  shirtGrad.addColorStop(1, "#f0f0f0");
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 0.24);
  ctx.lineTo(x - s * 0.12, y + s * 0.38);
  ctx.lineTo(x + s * 0.12, y + s * 0.38);
  ctx.lineTo(x + s * 0.15, y - s * 0.24);
  ctx.closePath();
  ctx.fill();

  // Ruffles
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 5; i++) {
    const rY = y - s * 0.12 + i * s * 0.09;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.1, rY);
    ctx.quadraticCurveTo(x - s * 0.03, rY + s * 0.025, x, rY);
    ctx.quadraticCurveTo(x + s * 0.03, rY + s * 0.025, x + s * 0.1, rY);
    ctx.stroke();
  }

  drawBowTie(ctx, x, y, s, isAttacking, attackIntensity, gemPulse, zoom);
}

function drawBowTie(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  isAttacking: boolean, attackIntensity: number, gemPulse: number, zoom: number
) {
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = (isAttacking ? 12 * attackIntensity : 4) * zoom;

  const bowGrad = ctx.createLinearGradient(x - s * 0.14, y - s * 0.2, x, y - s * 0.16);
  bowGrad.addColorStop(0, "#6030a0");
  bowGrad.addColorStop(0.5, "#9050c0");
  bowGrad.addColorStop(1, "#a070d0");
  ctx.fillStyle = bowGrad;

  // Left bow
  ctx.beginPath();
  ctx.moveTo(x - s * 0.02, y - s * 0.19);
  ctx.quadraticCurveTo(x - s * 0.08, y - s * 0.26, x - s * 0.14, y - s * 0.24);
  ctx.quadraticCurveTo(x - s * 0.16, y - s * 0.18, x - s * 0.14, y - s * 0.12);
  ctx.quadraticCurveTo(x - s * 0.08, y - s * 0.1, x - s * 0.02, y - s * 0.17);
  ctx.closePath();
  ctx.fill();

  // Right bow
  ctx.beginPath();
  ctx.moveTo(x + s * 0.02, y - s * 0.19);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.26, x + s * 0.14, y - s * 0.24);
  ctx.quadraticCurveTo(x + s * 0.16, y - s * 0.18, x + s * 0.14, y - s * 0.12);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.1, x + s * 0.02, y - s * 0.17);
  ctx.closePath();
  ctx.fill();

  // Center knot
  ctx.fillStyle = "#6030a0";
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.18, s * 0.035, s * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gem
  ctx.fillStyle = "#c090e0";
  ctx.shadowColor = "#d0a0ff";
  ctx.shadowBlur = isAttacking ? 8 * zoom * gemPulse : 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.18, s * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── POPPED COLLAR ───────────────────────────────────────────────────────────

function drawPoppedCollar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  singWave: number, breathe: number, zoom: number
) {
  const headY = y - s * 0.48 + singWave * 0.2 + breathe * 0.1;
  const collarTop = headY + s * 0.08;
  const collarBottom = y - s * 0.22;
  const collarHeight = collarBottom - collarTop;

  for (let side = -1; side <= 1; side += 2) {
    // Collar outer face — stiff standing panel that overlaps the jaw
    const outerX = x + side * s * 0.18;
    const innerX = x + side * s * 0.08;
    const tipX = x + side * s * 0.22;
    const tipY = collarTop - s * 0.02;

    // Main collar panel gradient — dark purple tuxedo fabric
    const collarGrad = ctx.createLinearGradient(innerX, collarTop, outerX, collarBottom);
    collarGrad.addColorStop(0, "#2a1545");
    collarGrad.addColorStop(0.3, "#351a55");
    collarGrad.addColorStop(0.6, "#2a1545");
    collarGrad.addColorStop(1, "#1a0e30");
    ctx.fillStyle = collarGrad;

    ctx.beginPath();
    ctx.moveTo(innerX - side * s * 0.02, collarBottom + s * 0.04);
    ctx.lineTo(innerX, collarBottom);
    ctx.quadraticCurveTo(innerX - side * s * 0.01, collarTop + collarHeight * 0.3, tipX, tipY);
    ctx.quadraticCurveTo(
      outerX + side * s * 0.06, collarTop + collarHeight * 0.15,
      outerX + side * s * 0.04, collarBottom
    );
    ctx.lineTo(outerX + side * s * 0.02, collarBottom + s * 0.04);
    ctx.closePath();
    ctx.fill();

    // Inner satin lining — lighter purple, visible on inside face
    const liningGrad = ctx.createLinearGradient(innerX, collarTop, innerX, collarBottom);
    liningGrad.addColorStop(0, "#6a3890");
    liningGrad.addColorStop(0.5, "#7a4aa0");
    liningGrad.addColorStop(1, "#5a2878");
    ctx.fillStyle = liningGrad;

    ctx.beginPath();
    ctx.moveTo(innerX - side * s * 0.02, collarBottom + s * 0.03);
    ctx.lineTo(innerX, collarBottom);
    ctx.quadraticCurveTo(innerX - side * s * 0.01, collarTop + collarHeight * 0.3, tipX, tipY);
    ctx.quadraticCurveTo(
      innerX + side * s * 0.04, collarTop + collarHeight * 0.2,
      innerX + side * s * 0.04, collarBottom
    );
    ctx.lineTo(innerX + side * s * 0.02, collarBottom + s * 0.03);
    ctx.closePath();
    ctx.fill();

    // Edge highlight — glowing purple trim along the collar edge
    ctx.strokeStyle = "#9060c0";
    ctx.shadowColor = "#b080e0";
    ctx.shadowBlur = 4 * zoom;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX, collarBottom);
    ctx.quadraticCurveTo(innerX - side * s * 0.01, collarTop + collarHeight * 0.3, tipX, tipY);
    ctx.quadraticCurveTo(
      outerX + side * s * 0.06, collarTop + collarHeight * 0.15,
      outerX + side * s * 0.04, collarBottom
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Collar tip point accent — small gold pin
    ctx.fillStyle = "#f0c040";
    ctx.beginPath();
    ctx.arc(tipX, tipY + s * 0.015, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(tipX, tipY + s * 0.015, s * 0.007, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── HEAD ────────────────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, singWave: number, breathe: number, zoom: number,
  isAttacking: boolean, attackIntensity: number, _gemPulse: number
) {
  const headY = y - s * 0.48 + singWave * 0.2 + breathe * 0.1;

  drawHeadShape(ctx, x, headY, s);
  drawHair(ctx, x, headY, s, zoom);
  drawEyes(ctx, x, headY, s, time, zoom, isAttacking, attackIntensity);
  drawEyebrows(ctx, x, headY, s, zoom, isAttacking);
  drawSingingMouth(ctx, x, headY, s, time, zoom, isAttacking, attackIntensity);

  // Vibrato lines emanating from mouth when singing
  drawVibratoLines(ctx, x, headY, s, time, zoom, isAttacking, attackIntensity);
}

function drawHeadShape(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number
) {
  // Neck with tendon detail
  const neckGrad = ctx.createLinearGradient(x - s * 0.07, headY + s * 0.2, x + s * 0.07, headY + s * 0.35);
  neckGrad.addColorStop(0, "#ffe0bd");
  neckGrad.addColorStop(0.5, "#f8d4b0");
  neckGrad.addColorStop(1, "#f0c8a0");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.065, headY + s * 0.2);
  ctx.quadraticCurveTo(x - s * 0.09, headY + s * 0.28, x - s * 0.08, headY + s * 0.36);
  ctx.lineTo(x + s * 0.08, headY + s * 0.36);
  ctx.quadraticCurveTo(x + s * 0.09, headY + s * 0.28, x + s * 0.065, headY + s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Neck tendon lines
  ctx.strokeStyle = "rgba(200, 160, 130, 0.2)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.025, headY + s * 0.22);
  ctx.lineTo(x - s * 0.03, headY + s * 0.34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.025, headY + s * 0.22);
  ctx.lineTo(x + s * 0.03, headY + s * 0.34);
  ctx.stroke();

  // Head shape — sculpted oval with defined jawline, not a perfect circle
  const skinGrad = ctx.createRadialGradient(
    x - s * 0.04, headY - s * 0.06, s * 0.02,
    x, headY, s * 0.3
  );
  skinGrad.addColorStop(0, "#ffe8d0");
  skinGrad.addColorStop(0.3, "#ffe0bd");
  skinGrad.addColorStop(0.65, "#f8d4b0");
  skinGrad.addColorStop(1, "#e8c09a");
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.moveTo(x, headY - s * 0.28);
  ctx.bezierCurveTo(x + s * 0.18, headY - s * 0.28, x + s * 0.28, headY - s * 0.16, x + s * 0.27, headY - s * 0.02);
  ctx.bezierCurveTo(x + s * 0.26, headY + s * 0.08, x + s * 0.2, headY + s * 0.17, x + s * 0.12, headY + s * 0.22);
  ctx.quadraticCurveTo(x + s * 0.05, headY + s * 0.27, x, headY + s * 0.28);
  ctx.quadraticCurveTo(x - s * 0.05, headY + s * 0.27, x - s * 0.12, headY + s * 0.22);
  ctx.bezierCurveTo(x - s * 0.2, headY + s * 0.17, x - s * 0.26, headY + s * 0.08, x - s * 0.27, headY - s * 0.02);
  ctx.bezierCurveTo(x - s * 0.28, headY - s * 0.16, x - s * 0.18, headY - s * 0.28, x, headY - s * 0.28);
  ctx.closePath();
  ctx.fill();

  // Forehead highlight
  const foreheadHl = ctx.createRadialGradient(x - s * 0.02, headY - s * 0.15, 0, x, headY - s * 0.1, s * 0.15);
  foreheadHl.addColorStop(0, "rgba(255, 245, 230, 0.4)");
  foreheadHl.addColorStop(1, "rgba(255, 245, 230, 0)");
  ctx.fillStyle = foreheadHl;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.02, headY - s * 0.12, s * 0.12, s * 0.08, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Cheekbone highlights — warm rosy glow
  for (let side = -1; side <= 1; side += 2) {
    const cheekGrad = ctx.createRadialGradient(
      x + side * s * 0.14, headY + s * 0.04, 0,
      x + side * s * 0.14, headY + s * 0.04, s * 0.08
    );
    cheekGrad.addColorStop(0, "rgba(255, 180, 160, 0.35)");
    cheekGrad.addColorStop(0.5, "rgba(255, 190, 170, 0.15)");
    cheekGrad.addColorStop(1, "rgba(255, 200, 180, 0)");
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.ellipse(x + side * s * 0.14, headY + s * 0.04, s * 0.07, s * 0.05, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Jawline shadow
  ctx.strokeStyle = "rgba(180, 140, 110, 0.3)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, headY + s * 0.14);
  ctx.quadraticCurveTo(x - s * 0.12, headY + s * 0.22, x, headY + s * 0.25);
  ctx.quadraticCurveTo(x + s * 0.12, headY + s * 0.22, x + s * 0.2, headY + s * 0.14);
  ctx.stroke();

  // Ears
  drawEars(ctx, x, headY, s);

  // Nose — sculpted bridge and tip
  drawNose(ctx, x, headY, s);
}

function drawEars(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number
) {
  for (let side = -1; side <= 1; side += 2) {
    const earX = x + side * s * 0.26;
    const earY = headY + s * 0.01;

    // Ear outer shape
    ctx.fillStyle = "#f0c8a0";
    ctx.beginPath();
    ctx.moveTo(earX, earY - s * 0.06);
    ctx.quadraticCurveTo(earX + side * s * 0.06, earY - s * 0.04, earX + side * s * 0.06, earY + s * 0.01);
    ctx.quadraticCurveTo(earX + side * s * 0.05, earY + s * 0.06, earX, earY + s * 0.05);
    ctx.closePath();
    ctx.fill();

    // Ear inner shadow
    ctx.fillStyle = "rgba(200, 150, 120, 0.4)";
    ctx.beginPath();
    ctx.moveTo(earX + side * s * 0.01, earY - s * 0.03);
    ctx.quadraticCurveTo(earX + side * s * 0.04, earY - s * 0.01, earX + side * s * 0.035, earY + s * 0.02);
    ctx.quadraticCurveTo(earX + side * s * 0.02, earY + s * 0.04, earX + side * s * 0.01, earY + s * 0.03);
    ctx.closePath();
    ctx.fill();
  }
}

function drawNose(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number
) {
  // Nose bridge shadow
  ctx.strokeStyle = "rgba(190, 150, 120, 0.25)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.01, headY - s * 0.04);
  ctx.quadraticCurveTo(x - s * 0.02, headY + s * 0.04, x - s * 0.03, headY + s * 0.08);
  ctx.stroke();

  // Nose tip
  const noseTipGrad = ctx.createRadialGradient(x, headY + s * 0.08, 0, x, headY + s * 0.08, s * 0.035);
  noseTipGrad.addColorStop(0, "#f8d4b0");
  noseTipGrad.addColorStop(1, "#eec8a4");
  ctx.fillStyle = noseTipGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + s * 0.08, s * 0.03, s * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = "rgba(150, 110, 80, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x - s * 0.015, headY + s * 0.09, s * 0.01, s * 0.007, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.015, headY + s * 0.09, s * 0.01, s * 0.007, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Nose bridge highlight
  ctx.fillStyle = "rgba(255, 245, 235, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x + s * 0.005, headY + s * 0.02, s * 0.012, s * 0.05, 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number, zoom: number
) {
  // Base hair volume — dark rich color with depth
  const baseGrad = ctx.createRadialGradient(
    x, headY - s * 0.18, s * 0.05,
    x, headY - s * 0.12, s * 0.35
  );
  baseGrad.addColorStop(0, "#2a1505");
  baseGrad.addColorStop(0.3, "#1a0a00");
  baseGrad.addColorStop(0.7, "#0f0500");
  baseGrad.addColorStop(1, "#080300");
  ctx.fillStyle = baseGrad;

  // Pompadour silhouette — high volume swept back
  ctx.beginPath();
  ctx.moveTo(x - s * 0.27, headY - s * 0.02);
  ctx.bezierCurveTo(x - s * 0.3, headY - s * 0.12, x - s * 0.32, headY - s * 0.28, x - s * 0.2, headY - s * 0.36);
  ctx.bezierCurveTo(x - s * 0.12, headY - s * 0.42, x - s * 0.04, headY - s * 0.44, x, headY - s * 0.43);
  ctx.bezierCurveTo(x + s * 0.04, headY - s * 0.44, x + s * 0.12, headY - s * 0.42, x + s * 0.2, headY - s * 0.36);
  ctx.bezierCurveTo(x + s * 0.32, headY - s * 0.28, x + s * 0.3, headY - s * 0.12, x + s * 0.27, headY - s * 0.02);
  ctx.closePath();
  ctx.fill();

  // Side volume — hair wrapping around the temples
  ctx.beginPath();
  ctx.moveTo(x - s * 0.27, headY - s * 0.02);
  ctx.quadraticCurveTo(x - s * 0.29, headY - s * 0.06, x - s * 0.28, headY - s * 0.14);
  ctx.quadraticCurveTo(x - s * 0.26, headY - s * 0.05, x - s * 0.24, headY + s * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.27, headY - s * 0.02);
  ctx.quadraticCurveTo(x + s * 0.29, headY - s * 0.06, x + s * 0.28, headY - s * 0.14);
  ctx.quadraticCurveTo(x + s * 0.26, headY - s * 0.05, x + s * 0.24, headY + s * 0.02);
  ctx.closePath();
  ctx.fill();

  // Pompadour top highlight — glossy sheen
  const topShine = ctx.createLinearGradient(x - s * 0.1, headY - s * 0.44, x + s * 0.05, headY - s * 0.3);
  topShine.addColorStop(0, "rgba(80, 50, 25, 0)");
  topShine.addColorStop(0.3, "rgba(100, 65, 35, 0.5)");
  topShine.addColorStop(0.5, "rgba(130, 85, 45, 0.6)");
  topShine.addColorStop(0.7, "rgba(100, 65, 35, 0.4)");
  topShine.addColorStop(1, "rgba(80, 50, 25, 0)");
  ctx.fillStyle = topShine;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, headY - s * 0.35);
  ctx.bezierCurveTo(x - s * 0.08, headY - s * 0.42, x + s * 0.08, headY - s * 0.42, x + s * 0.15, headY - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.1, headY - s * 0.32, x - s * 0.1, headY - s * 0.32, x - s * 0.15, headY - s * 0.35);
  ctx.closePath();
  ctx.fill();

  // Secondary shine band — lower
  const midShine = ctx.createLinearGradient(x - s * 0.12, headY - s * 0.3, x + s * 0.12, headY - s * 0.2);
  midShine.addColorStop(0, "rgba(70, 40, 20, 0)");
  midShine.addColorStop(0.4, "rgba(90, 55, 30, 0.35)");
  midShine.addColorStop(0.6, "rgba(90, 55, 30, 0.35)");
  midShine.addColorStop(1, "rgba(70, 40, 20, 0)");
  ctx.fillStyle = midShine;
  ctx.beginPath();
  ctx.ellipse(x, headY - s * 0.24, s * 0.18, s * 0.04, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Swept-back strand lines — layered texture
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.2 * zoom;
  const strandColors = ["#3a2010", "#2a1508", "#45280f"];
  for (let strand = 0; strand < 10; strand++) {
    ctx.strokeStyle = strandColors[strand % 3];
    const sx = x - s * 0.18 + strand * s * 0.04;
    const curve = (strand - 5) * s * 0.008;
    ctx.beginPath();
    ctx.moveTo(sx, headY - s * 0.08);
    ctx.bezierCurveTo(
      sx + curve * 0.5, headY - s * 0.2,
      sx + curve, headY - s * 0.32,
      sx + curve * 1.2 + s * 0.01, headY - s * 0.4
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Fine individual hair wisps at the crown (flyaway detail)
  ctx.strokeStyle = "rgba(50, 30, 10, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.lineCap = "round";
  const wisps = [
    { x: -0.05, endX: -0.08, endY: -0.46 },
    { x: 0.02, endX: 0.0, endY: -0.47 },
    { x: 0.08, endX: 0.1, endY: -0.45 },
    { x: -0.12, endX: -0.16, endY: -0.43 },
  ];
  for (const w of wisps) {
    ctx.beginPath();
    ctx.moveTo(x + w.x * s, headY - s * 0.36);
    ctx.quadraticCurveTo(x + (w.x + w.endX) * s * 0.5, headY - s * 0.42, x + w.endX * s, headY + w.endY * s);
    ctx.stroke();
  }

  // Sideburns — tapered, clean-cut
  for (let side = -1; side <= 1; side += 2) {
    const sbGrad = ctx.createLinearGradient(
      x + side * s * 0.24, headY - s * 0.04,
      x + side * s * 0.22, headY + s * 0.12
    );
    sbGrad.addColorStop(0, "#1a0a00");
    sbGrad.addColorStop(0.5, "#150800");
    sbGrad.addColorStop(1, "rgba(20, 10, 0, 0.3)");
    ctx.fillStyle = sbGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.25, headY - s * 0.04);
    ctx.quadraticCurveTo(x + side * s * 0.28, headY + s * 0.03, x + side * s * 0.24, headY + s * 0.12);
    ctx.lineTo(x + side * s * 0.22, headY + s * 0.1);
    ctx.quadraticCurveTo(x + side * s * 0.24, headY + s * 0.02, x + side * s * 0.23, headY - s * 0.02);
    ctx.closePath();
    ctx.fill();
  }

  // Subtle parting line — swept to the side
  ctx.strokeStyle = "rgba(15, 5, 0, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, headY - s * 0.28);
  ctx.bezierCurveTo(
    x - s * 0.06, headY - s * 0.33,
    x - s * 0.02, headY - s * 0.38,
    x + s * 0.02, headY - s * 0.42
  );
  ctx.stroke();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number,
  time: number, zoom: number,
  isAttacking: boolean, attackIntensity: number
) {
  if (isAttacking) {
    // Intense glowing closed eyes — deep concentration
    for (let side = -1; side <= 1; side += 2) {
      const eyeX = x + side * s * 0.1;
      const eyeY = headY + s * 0.01;

      // Eye socket shadow
      ctx.fillStyle = "rgba(80, 40, 100, 0.3)";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, s * 0.065, s * 0.035, side * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Glowing closed lids
      ctx.fillStyle = `rgba(147, 112, 219, ${0.6 + attackIntensity * 0.4})`;
      ctx.shadowColor = "#9370db";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, s * 0.05, s * 0.015, side * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Glow particles from closed eyes
      for (let p = 0; p < 3; p++) {
        const pAngle = time * 3 + p * 2.1 + side;
        const pDist = s * (0.04 + Math.sin(time * 4 + p) * 0.015);
        const px = eyeX + Math.cos(pAngle) * pDist;
        const py = eyeY + Math.sin(pAngle) * pDist * 0.5;
        ctx.fillStyle = `rgba(180, 140, 240, ${0.3 * attackIntensity})`;
        ctx.beginPath();
        ctx.arc(px, py, s * 0.005, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    const blinkCycle = Math.sin(time * 0.8);
    const blinking = blinkCycle > 0.97;
    const eyeOpenness = blinking ? 0.3 : 1;

    for (let side = -1; side <= 1; side += 2) {
      const eyeX = x + side * s * 0.1;
      const eyeY = headY + s * 0.01;

      // Eye socket shadow — subtle depth
      ctx.fillStyle = "rgba(160, 120, 100, 0.15)";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY + s * 0.005, s * 0.07, s * 0.05, side * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Eye white with subtle blue tint
      const whiteGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.06);
      whiteGrad.addColorStop(0, "#ffffff");
      whiteGrad.addColorStop(0.7, "#f4f4f8");
      whiteGrad.addColorStop(1, "#e8e0e8");
      ctx.fillStyle = whiteGrad;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, s * 0.06, s * 0.045 * eyeOpenness, side * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Eye outline
      ctx.strokeStyle = "rgba(60, 30, 30, 0.3)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      if (!blinking) {
        const lookX = Math.sin(time * 1.2) * s * 0.008;
        const lookY = Math.cos(time * 0.9) * s * 0.005;
        const irisX = eyeX + lookX;
        const irisY = eyeY + lookY;
        const irisR = s * 0.032;

        // Iris outer ring — deep purple
        const irisGrad = ctx.createRadialGradient(irisX, irisY, 0, irisX, irisY, irisR);
        irisGrad.addColorStop(0, "#6a3a8a");
        irisGrad.addColorStop(0.3, "#4a2060");
        irisGrad.addColorStop(0.7, "#3a1a4a");
        irisGrad.addColorStop(0.9, "#2a1035");
        irisGrad.addColorStop(1, "#1a0a20");
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
        ctx.fill();

        // Iris radial fiber lines
        ctx.strokeStyle = "rgba(120, 80, 160, 0.3)";
        ctx.lineWidth = 0.5 * zoom;
        for (let fiber = 0; fiber < 8; fiber++) {
          const angle = fiber * Math.PI * 0.25;
          ctx.beginPath();
          ctx.moveTo(irisX + Math.cos(angle) * s * 0.01, irisY + Math.sin(angle) * s * 0.01);
          ctx.lineTo(irisX + Math.cos(angle) * irisR * 0.9, irisY + Math.sin(angle) * irisR * 0.9);
          ctx.stroke();
        }

        // Pupil — deep black
        ctx.fillStyle = "#050505";
        ctx.beginPath();
        ctx.arc(irisX, irisY, s * 0.015, 0, Math.PI * 2);
        ctx.fill();

        // Primary highlight — bright white
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(irisX - s * 0.012, irisY - s * 0.012, s * 0.009, 0, Math.PI * 2);
        ctx.fill();

        // Secondary smaller highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(irisX + s * 0.008, irisY + s * 0.006, s * 0.004, 0, Math.PI * 2);
        ctx.fill();

        // Iris ring shimmer
        ctx.strokeStyle = "rgba(140, 100, 200, 0.2)";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.arc(irisX, irisY, s * 0.022, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Upper eyelid — thick defined crease
      ctx.strokeStyle = "#1a0a00";
      ctx.lineWidth = 2 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, s * 0.058, 1.05 * Math.PI, 1.95 * Math.PI);
      ctx.stroke();

      // Eyelid crease shadow
      ctx.strokeStyle = "rgba(150, 110, 90, 0.25)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY - s * 0.01, s * 0.065, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();

      // Lower lid subtle line
      ctx.strokeStyle = "rgba(120, 90, 70, 0.2)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, s * 0.055, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Eyelashes — top, more detailed
      ctx.strokeStyle = "#1a0a00";
      ctx.lineWidth = 1.3 * zoom;
      for (let lash = 0; lash < 5; lash++) {
        const lAngle = 1.1 * Math.PI + lash * 0.2;
        const lLen = s * (0.018 + (lash === 2 ? 0.006 : 0));
        ctx.beginPath();
        ctx.moveTo(eyeX + Math.cos(lAngle) * s * 0.055, eyeY + Math.sin(lAngle) * s * 0.044);
        ctx.lineTo(
          eyeX + Math.cos(lAngle) * (s * 0.055 + lLen),
          eyeY + Math.sin(lAngle) * (s * 0.044 + lLen * 0.8)
        );
        ctx.stroke();
      }
    }
  }
}

function drawEyebrows(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number, zoom: number,
  isAttacking: boolean
) {
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 2.2 * zoom;
  ctx.lineCap = "round";
  const raise = isAttacking ? s * 0.02 : 0;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.16, headY - s * 0.06);
  ctx.quadraticCurveTo(x - s * 0.1, headY - s * 0.1 - raise, x - s * 0.04, headY - s * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.16, headY - s * 0.06);
  ctx.quadraticCurveTo(x + s * 0.1, headY - s * 0.1 - raise, x + s * 0.04, headY - s * 0.05);
  ctx.stroke();
}

// ─── SINGING MOUTH ───────────────────────────────────────────────────────────

function drawSingingMouth(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number,
  time: number, zoom: number,
  isAttacking: boolean, _attackIntensity: number
) {
  const mouthY = headY + s * 0.12;

  // Continuous singing animation: mouth oscillates between shapes
  // Uses multiple sine waves for organic, varied mouth movement
  const singSpeed = isAttacking ? 8 : 4.5;
  const singBase = isAttacking ? 0.14 : 0.08;
  const singAmplitude = isAttacking ? 0.08 : 0.05;
  const singPhase1 = Math.sin(time * singSpeed);
  const singPhase2 = Math.sin(time * singSpeed * 1.7 + 0.5);
  const mouthOpenY = singBase + singAmplitude * (singPhase1 * 0.6 + singPhase2 * 0.4);
  const mouthOpenX = s * (0.08 + Math.abs(singPhase1) * 0.04);

  // Mouth interior
  const mouthGrad = ctx.createRadialGradient(x, mouthY, 0, x, mouthY, s * mouthOpenY * 1.5);
  mouthGrad.addColorStop(0, "#1a0505");
  mouthGrad.addColorStop(0.6, "#2a0a0a");
  mouthGrad.addColorStop(1, "#3a1010");
  ctx.fillStyle = mouthGrad;
  ctx.beginPath();
  ctx.ellipse(x, mouthY, mouthOpenX, s * mouthOpenY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue (visible when mouth is open enough)
  if (mouthOpenY > 0.09) {
    ctx.fillStyle = "#8a3030";
    ctx.beginPath();
    ctx.ellipse(x, mouthY + s * 0.02, s * 0.05, s * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Teeth — top row
  if (mouthOpenY > 0.06) {
    ctx.fillStyle = "#ffffff";
    const teethWidth = mouthOpenX * 0.85;
    const teethHeight = s * 0.025;
    const teethY = mouthY - s * mouthOpenY * 0.55;
    ctx.beginPath();
    ctx.rect(x - teethWidth, teethY, teethWidth * 2, teethHeight);
    ctx.fill();

    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 0.5;
    for (let tooth = -2; tooth <= 2; tooth++) {
      ctx.beginPath();
      ctx.moveTo(x + tooth * teethWidth * 0.4, teethY);
      ctx.lineTo(x + tooth * teethWidth * 0.4, teethY + teethHeight);
      ctx.stroke();
    }

    // Bottom teeth hint
    const bottomTeethY = mouthY + s * mouthOpenY * 0.35;
    ctx.fillStyle = "#f8f8f8";
    ctx.beginPath();
    ctx.rect(x - teethWidth * 0.8, bottomTeethY, teethWidth * 1.6, teethHeight * 0.7);
    ctx.fill();
  }

  // Lips
  ctx.strokeStyle = "#a06060";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, mouthY, mouthOpenX + s * 0.01, s * mouthOpenY + s * 0.01, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Upper lip bow definition
  ctx.strokeStyle = "rgba(160, 90, 90, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - mouthOpenX * 0.6, mouthY - s * mouthOpenY * 0.8);
  ctx.quadraticCurveTo(x, mouthY - s * mouthOpenY * 1.2, x + mouthOpenX * 0.6, mouthY - s * mouthOpenY * 0.8);
  ctx.stroke();
}

// ─── VIBRATO LINES ───────────────────────────────────────────────────────────

function drawVibratoLines(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number,
  time: number, zoom: number,
  isAttacking: boolean, attackIntensity: number
) {
  // Sound wave emanation lines from the mouth area
  const lineCount = isAttacking ? 6 : 3;
  const baseAlpha = isAttacking ? 0.5 * attackIntensity : 0.2;
  const mouthY = headY + s * 0.12;

  for (let i = 0; i < lineCount; i++) {
    const phase = (time * 3 + i * 0.6) % 1.5;
    const dist = s * (0.15 + phase * 0.35);
    const alpha = baseAlpha * (1 - phase / 1.5);
    if (alpha <= 0) continue;

    ctx.strokeStyle = `rgba(147, 112, 219, ${alpha})`;
    ctx.lineWidth = (2 - phase * 0.8) * zoom;

    // Left side wave
    ctx.beginPath();
    ctx.arc(x, mouthY, dist, 0.7 * Math.PI, 1.0 * Math.PI);
    ctx.stroke();

    // Right side wave
    ctx.beginPath();
    ctx.arc(x, mouthY, dist, 0.0 * Math.PI, 0.3 * Math.PI);
    ctx.stroke();
  }
}

// ─── FLOATING NOTES ──────────────────────────────────────────────────────────

function drawFloatingNotes(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, isAttacking: boolean, zoom: number
) {
  const noteCount = isAttacking ? 10 : 5;
  const symbols = ["♪", "♫", "♬", "♩"];

  for (let i = 0; i < noteCount; i++) {
    const phase = (time * 2.2 + i * 0.4) % 2;
    const angle = -0.6 + (i / noteCount) * 1.2;
    const spiral = Math.sin(phase * Math.PI * 2) * s * 0.1;
    const nx = x + s * (0.35 + phase * 0.6) * Math.cos(angle) + spiral;
    const ny = y - s * 0.3 - phase * s * 0.7 + Math.sin(phase * Math.PI * 1.5) * s * 0.15;
    const alpha = (1 - phase / 2) * (isAttacking ? 0.95 : 0.75);
    const noteSize = (16 + (isAttacking ? 6 : 0) - phase * 4) * zoom;

    ctx.shadowColor = i % 2 === 0 ? "#ff6600" : "#9370db";
    ctx.shadowBlur = isAttacking ? 10 * zoom : 5 * zoom;
    ctx.fillStyle = i % 2 === 0
      ? `rgba(255, 102, 0, ${alpha})`
      : `rgba(147, 112, 219, ${alpha})`;
    ctx.font = `${noteSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(symbols[i % 4], nx, ny);
  }
  ctx.shadowBlur = 0;
}

// ─── SONIC RINGS ─────────────────────────────────────────────────────────────

function drawSonicRings(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, isAttacking: boolean, zoom: number
) {
  for (let i = 0; i < 4; i++) {
    const phase = (time * 2.5 + i * 0.35) % 1;
    const radius = s * (0.5 + phase * 0.6);
    const alpha = (1 - phase) * (isAttacking ? 0.75 : 0.45);

    ctx.strokeStyle = `rgba(147, 112, 219, ${alpha})`;
    ctx.lineWidth = (3 - i * 0.4) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.2, radius, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.5})`;
    ctx.lineWidth = (1.5 - i * 0.2) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.2, radius * 0.95, radius * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ─── RIM LIGHTING ────────────────────────────────────────────────────────────

function drawRimLight(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, isAttacking: boolean
) {
  const intensity = isAttacking ? 0.35 : 0.18;
  const pulse = 0.9 + Math.sin(time * 2.5) * 0.1;

  // Left rim — cool purple highlight from stage lighting
  const leftRim = ctx.createLinearGradient(x - s * 0.5, y - s * 0.3, x - s * 0.3, y);
  leftRim.addColorStop(0, `rgba(140, 100, 220, ${intensity * pulse})`);
  leftRim.addColorStop(0.5, `rgba(140, 100, 220, ${intensity * pulse * 0.5})`);
  leftRim.addColorStop(1, "rgba(140, 100, 220, 0)");
  ctx.fillStyle = leftRim;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.46, y - s * 0.3);
  ctx.quadraticCurveTo(x - s * 0.5, y, x - s * 0.42, y + s * 0.5);
  ctx.lineTo(x - s * 0.38, y + s * 0.48);
  ctx.quadraticCurveTo(x - s * 0.44, y, x - s * 0.42, y - s * 0.28);
  ctx.closePath();
  ctx.fill();

  // Right rim — warm gold highlight
  const rightRim = ctx.createLinearGradient(x + s * 0.5, y - s * 0.3, x + s * 0.3, y);
  rightRim.addColorStop(0, `rgba(240, 192, 64, ${intensity * pulse * 0.7})`);
  rightRim.addColorStop(0.5, `rgba(240, 192, 64, ${intensity * pulse * 0.35})`);
  rightRim.addColorStop(1, "rgba(240, 192, 64, 0)");
  ctx.fillStyle = rightRim;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.46, y - s * 0.3);
  ctx.quadraticCurveTo(x + s * 0.5, y, x + s * 0.42, y + s * 0.5);
  ctx.lineTo(x + s * 0.38, y + s * 0.48);
  ctx.quadraticCurveTo(x + s * 0.44, y, x + s * 0.42, y - s * 0.28);
  ctx.closePath();
  ctx.fill();

  // Head rim glow — subtle halo around the top of the head
  const headY = y - s * 0.48;
  const haloGrad = ctx.createRadialGradient(x, headY - s * 0.15, s * 0.2, x, headY - s * 0.1, s * 0.4);
  haloGrad.addColorStop(0, `rgba(200, 170, 255, ${intensity * pulse * 0.4})`);
  haloGrad.addColorStop(0.6, `rgba(200, 170, 255, ${intensity * pulse * 0.15})`);
  haloGrad.addColorStop(1, "rgba(200, 170, 255, 0)");
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY - s * 0.1, s * 0.35, s * 0.25, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

// ─── SPOTLIGHT ───────────────────────────────────────────────────────────────

function drawSpotlight(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  attackIntensity: number
) {
  const g = ctx.createRadialGradient(x, y - s * 0.5, 0, x, y, s * 1.2);
  g.addColorStop(0, `rgba(255, 255, 200, ${attackIntensity * 0.15})`);
  g.addColorStop(0.5, `rgba(255, 220, 150, ${attackIntensity * 0.08})`);
  g.addColorStop(1, "rgba(255, 200, 100, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.2, s * 1.2, s * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
}
