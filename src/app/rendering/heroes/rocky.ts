import { ISO_Y_RATIO } from "../../constants";

function drawStoneSkirtArmor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  _time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  yOffset: number,
  cracked: boolean
) {
  const skirtTop = y - hop + s * yOffset;
  const bandCount = 4;
  const totalHeight = s * 0.32;
  const bandHeight = totalHeight / bandCount;
  const gapHalf = s * 0.1;

  drawStoneCenterBanner(
    ctx,
    x,
    s,
    zoom,
    skirtTop,
    totalHeight,
    gapHalf,
    cracked
  );
  for (let side = -1; side <= 1; side += 2) {
    drawStoneTassetSide(
      ctx,
      x,
      s,
      zoom,
      side,
      skirtTop,
      bandCount,
      bandHeight,
      totalHeight,
      gapHalf,
      isAttacking,
      attackIntensity,
      cracked
    );
  }
  const bridgeY = skirtTop + s * 0.025;
  const bridgeLeft = x - gapHalf + s * 0.01;
  const bridgeRight = x + gapHalf - s * 0.01;
  const bridgeThick = s * 0.018;
  const bridgeGrad = ctx.createLinearGradient(
    bridgeLeft,
    bridgeY,
    bridgeRight,
    bridgeY
  );
  bridgeGrad.addColorStop(0, "#484038");
  bridgeGrad.addColorStop(0.3, "#585050");
  bridgeGrad.addColorStop(0.5, "#686058");
  bridgeGrad.addColorStop(0.7, "#585050");
  bridgeGrad.addColorStop(1, "#484038");
  ctx.fillStyle = bridgeGrad;
  ctx.beginPath();
  ctx.moveTo(bridgeLeft, bridgeY - bridgeThick * 0.5);
  ctx.lineTo(bridgeRight, bridgeY - bridgeThick * 0.5);
  ctx.lineTo(bridgeRight, bridgeY + bridgeThick * 0.5);
  ctx.lineTo(bridgeLeft, bridgeY + bridgeThick * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a3430";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  drawStoneSkirtBelt(ctx, x, s, zoom, skirtTop);
}

function drawStoneTassetSide(
  ctx: CanvasRenderingContext2D,
  x: number,
  s: number,
  zoom: number,
  side: number,
  skirtTop: number,
  bandCount: number,
  bandHeight: number,
  _totalHeight: number,
  gapHalf: number,
  isAttacking: boolean,
  attackIntensity: number,
  cracked: boolean
) {
  const shear = s * -0.1;

  for (let band = 0; band < bandCount; band++) {
    const innerTopY = skirtTop + band * bandHeight;
    const innerBotY = innerTopY + bandHeight;
    const outerTopY = innerTopY + shear;
    const outerBotY = innerBotY + shear;

    const baseOuterW = s * (0.42 + band * 0.035);
    const tattered = cracked && side === 1;
    const outerW = tattered ? baseOuterW * (1 - band * 0.14) : baseOuterW;
    const innerGap = gapHalf + band * s * 0.008;
    const innerX = x + side * innerGap;
    const outerX = x + side * outerW;

    const plateAlpha = tattered ? Math.max(0.15, 0.82 - band * 0.22) : 1;
    ctx.globalAlpha = plateAlpha;

    const plateG = ctx.createLinearGradient(
      innerX,
      innerTopY,
      outerX,
      outerBotY
    );
    if (cracked) {
      if (side === -1) {
        plateG.addColorStop(0, "#706860");
        plateG.addColorStop(0.25, "#605850");
        plateG.addColorStop(0.55, "#504840");
        plateG.addColorStop(1, "#484038");
      } else {
        plateG.addColorStop(0, "#484038");
        plateG.addColorStop(0.45, "#504840");
        plateG.addColorStop(0.75, "#605850");
        plateG.addColorStop(1, "#706860");
      }
    } else {
      if (side === -1) {
        plateG.addColorStop(0, "#848078");
        plateG.addColorStop(0.25, "#787068");
        plateG.addColorStop(0.55, "#686058");
        plateG.addColorStop(1, "#585050");
      } else {
        plateG.addColorStop(0, "#585050");
        plateG.addColorStop(0.45, "#686058");
        plateG.addColorStop(0.75, "#787068");
        plateG.addColorStop(1, "#848078");
      }
    }

    ctx.fillStyle = plateG;
    ctx.beginPath();
    if (tattered) {
      const chipI = side * s * 0.01 * band;
      const chipO = -side * s * 0.015 * band;
      const jagI = band >= 1 ? side * s * 0.012 * band : 0;
      const jagO = band >= 1 ? -side * s * 0.018 * band : 0;
      ctx.moveTo(innerX + chipI, innerTopY);
      ctx.lineTo(outerX + chipO, outerTopY);
      if (band >= 2) {
        const mx =
          outerX + chipO + (side * s * 0.004 + chipO * 0.5 - chipO) * 0.5;
        const my = (outerTopY + outerBotY) * 0.5;
        ctx.lineTo(mx + jagO * 0.6, my);
      }
      ctx.lineTo(outerX + side * s * 0.004 + chipO * 0.5, outerBotY);
      if (band >= 1) {
        const mx =
          innerX + chipI + (-side * s * 0.002 + chipI * 0.5 - chipI) * 0.5;
        const my = (innerBotY + innerTopY) * 0.5 + bandHeight * 0.1;
        ctx.lineTo(mx + jagI * 0.5, my);
      }
    } else {
      ctx.moveTo(innerX, innerTopY);
      ctx.lineTo(outerX, outerTopY);
      ctx.lineTo(outerX + side * s * 0.004, outerBotY);
      ctx.lineTo(innerX - side * s * 0.002, innerBotY);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = cracked ? "#2a2420" : "#3a3430";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    if (!tattered || band < 3) {
      const rivetMidT = 0.75;
      const rivetX = innerX + rivetMidT * (outerX - innerX);
      const rivetY =
        innerTopY + rivetMidT * (outerTopY - innerTopY) + bandHeight * 0.45;
      const rg = ctx.createRadialGradient(
        rivetX - s * 0.002,
        rivetY - s * 0.002,
        0,
        rivetX,
        rivetY,
        s * 0.009
      );
      rg.addColorStop(0, "#686058");
      rg.addColorStop(0.4, "#585050");
      rg.addColorStop(1, "#484038");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, s * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }

    const crackCount = cracked ? 6 + band * 2 : 2;
    const crackAlpha = cracked ? 0.85 : 0.5;
    const crackWidth = cracked ? 1.5 : 0.8;
    ctx.strokeStyle = `rgba(40, 35, 30, ${crackAlpha})`;
    ctx.lineWidth = crackWidth * zoom;
    for (let c = 0; c < crackCount; c++) {
      const t = (c + 0.5) / crackCount;
      const crackX = innerX + t * (outerX - innerX);
      const crackYBase =
        innerTopY + t * (outerTopY - innerTopY) + bandHeight * 0.4;
      const len = cracked ? s * 0.024 + c * s * 0.006 : s * 0.012;
      ctx.beginPath();
      ctx.moveTo(crackX, crackYBase - len * 0.5);
      ctx.lineTo(crackX + s * 0.008, crackYBase + len * 0.3);
      ctx.lineTo(crackX - s * 0.005, crackYBase + len * 0.7);
      ctx.stroke();
      if (cracked) {
        ctx.beginPath();
        ctx.moveTo(crackX + s * 0.008, crackYBase + len * 0.3);
        ctx.lineTo(crackX + s * 0.022, crackYBase + len * 0.05);
        ctx.stroke();
        if (c % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(crackX - s * 0.005, crackYBase + len * 0.7);
          ctx.lineTo(crackX - s * 0.022, crackYBase + len);
          ctx.stroke();
        }
      }
    }

    if (band % 2 === 1 && (!tattered || band < 2)) {
      const accentInnerX = innerX + side * s * 0.015;
      const accentOuterX = outerX - side * s * 0.015;
      const accentInnerY = innerTopY + bandHeight * 0.5;
      const accentOuterY = outerTopY + bandHeight * 0.5;
      const cyanAlpha = tattered
        ? 0.06
        : 0.2 + (isAttacking ? attackIntensity * 0.15 : 0);
      ctx.strokeStyle = `rgba(0, 200, 240, ${cyanAlpha})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(accentInnerX, accentInnerY);
      ctx.lineTo(accentOuterX, accentOuterY);
      ctx.stroke();
    }

    if (tattered) {
      ctx.fillStyle = `rgba(80, 100, 50, ${0.3 + band * 0.08})`;
      const mossX = innerX + 0.35 * (outerX - innerX);
      const mossY = innerTopY + bandHeight * 0.55;
      ctx.beginPath();
      ctx.arc(mossX, mossY, s * (0.013 + band * 0.005), 0, Math.PI * 2);
      ctx.fill();
      if (band >= 1) {
        ctx.beginPath();
        ctx.arc(
          mossX + s * 0.025,
          mossY - s * 0.006,
          s * (0.009 + band * 0.004),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (band >= 2) {
        ctx.beginPath();
        ctx.arc(
          mossX - s * 0.018,
          mossY + s * 0.016,
          s * (0.011 + band * 0.003),
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mossX + s * 0.04, mossY + s * 0.01, s * 0.007, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (cracked) {
      const hasMoss =
        (band === 1 && side === -1) ||
        (band === 2 && side === 1) ||
        (band === 3 && side === -1);
      if (hasMoss) {
        ctx.fillStyle = "rgba(80, 100, 50, 0.3)";
        const mossX = innerX + 0.6 * (outerX - innerX);
        const mossY = innerTopY + bandHeight * 0.5;
        ctx.beginPath();
        ctx.arc(mossX, mossY, s * 0.012, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mossX - s * 0.02, mossY + s * 0.01, s * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const hasMoss =
        (band === 1 && side === -1) ||
        (band === 2 && side === 1) ||
        (band === 3 && side === -1);
      if (hasMoss) {
        ctx.fillStyle = "rgba(80, 100, 50, 0.3)";
        const mossX = innerX + 0.6 * (outerX - innerX);
        const mossY = innerTopY + bandHeight * 0.5;
        ctx.beginPath();
        ctx.arc(mossX, mossY, s * 0.012, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mossX - s * 0.02, mossY + s * 0.01, s * 0.008, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }
}

function drawStoneCenterBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  s: number,
  zoom: number,
  skirtTop: number,
  totalHeight: number,
  gapHalf: number,
  cracked: boolean
) {
  const tabletTop = skirtTop + s * 0.04;
  const tabletBottom = skirtTop + totalHeight * 0.92;
  const tabletHalfW = gapHalf * 0.75;

  const tabletGrad = ctx.createLinearGradient(x, tabletTop, x, tabletBottom);
  if (cracked) {
    tabletGrad.addColorStop(0, "#504840");
    tabletGrad.addColorStop(0.25, "#605850");
    tabletGrad.addColorStop(0.5, "#686060");
    tabletGrad.addColorStop(0.75, "#605850");
    tabletGrad.addColorStop(1, "#504840");
  } else {
    tabletGrad.addColorStop(0, "#605850");
    tabletGrad.addColorStop(0.25, "#706860");
    tabletGrad.addColorStop(0.5, "#807870");
    tabletGrad.addColorStop(0.75, "#706860");
    tabletGrad.addColorStop(1, "#605850");
  }

  ctx.fillStyle = tabletGrad;
  ctx.beginPath();
  ctx.moveTo(x - tabletHalfW, tabletTop);
  ctx.lineTo(x + tabletHalfW, tabletTop);
  ctx.lineTo(x + tabletHalfW, tabletBottom);
  ctx.lineTo(x - tabletHalfW, tabletBottom);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#484038";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  const emblemY = (tabletTop + tabletBottom) * 0.5;
  ctx.strokeStyle = "#908880";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.02, emblemY - s * 0.02);
  ctx.lineTo(x + s * 0.015, emblemY + s * 0.01);
  ctx.moveTo(x, emblemY - s * 0.015);
  ctx.lineTo(x - s * 0.01, emblemY + s * 0.02);
  ctx.moveTo(x + s * 0.02, emblemY);
  ctx.lineTo(x + s * 0.005, emblemY + s * 0.018);
  ctx.stroke();

  if (cracked) {
    ctx.strokeStyle = "rgba(40, 35, 30, 0.7)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - tabletHalfW * 0.6, tabletTop + s * 0.01);
    ctx.lineTo(x + tabletHalfW * 0.3, tabletBottom - s * 0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + tabletHalfW * 0.5, tabletTop + s * 0.02);
    ctx.lineTo(x - tabletHalfW * 0.2, emblemY);
    ctx.stroke();
  }
}

function drawStoneSkirtBelt(
  ctx: CanvasRenderingContext2D,
  x: number,
  s: number,
  zoom: number,
  skirtTop: number
) {
  const beltHalfW = s * 0.43;
  const beltThick = s * 0.048;
  const vDip = s * 0.08;

  const beltGrad = ctx.createLinearGradient(
    x - beltHalfW,
    skirtTop,
    x + beltHalfW,
    skirtTop
  );
  beltGrad.addColorStop(0, "#484038");
  beltGrad.addColorStop(0.25, "#585050");
  beltGrad.addColorStop(0.5, "#686058");
  beltGrad.addColorStop(0.75, "#585050");
  beltGrad.addColorStop(1, "#484038");

  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#3a3430";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.fillStyle = "#00e0ff";
  ctx.shadowColor = "#00c8e0";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x, skirtTop + vDip * 0.35, s * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawRockyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const s = size;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const hop = Math.abs(Math.sin(time * 5)) * 4;
  const breathe = Math.sin(time * 2) * 0.018;

  const tossPhase = (time * 1.1) % 1;
  const tossY = -Math.sin(tossPhase * Math.PI) * s * 0.65;
  const tossX = Math.sin(tossPhase * Math.PI) * s * 0.06;

  drawAura(ctx, x, y, s, hop, time, isAttacking, attackIntensity);
  drawDebrisParticles(ctx, x, y, s, hop, time);

  if (isAttacking) {
    drawAttackShockwaves(ctx, x, y, s, hop, attackPhase, attackIntensity, zoom);
  }

  drawSquirrelTail(ctx, x, y, s, hop, time, zoom, isAttacking, attackPhase);
  drawWing(ctx, x, y, s, hop, time, zoom, isAttacking, attackIntensity, -1);
  drawWing(ctx, x, y, s, hop, time, zoom, isAttacking, attackIntensity, 1);
  drawBody(ctx, x, y, s, hop, breathe, zoom, time);
  drawStoneSkirtArmor(
    ctx,
    x,
    y,
    s,
    hop,
    time,
    zoom,
    isAttacking,
    attackIntensity,
    -0.32,
    false
  );
  drawStoneSkirtArmor(
    ctx,
    x,
    y,
    s,
    hop,
    time,
    zoom,
    isAttacking,
    attackIntensity,
    0.16,
    true
  );
  drawStoneClaws(ctx, x, y, s, hop, time, zoom, isAttacking, attackIntensity);
  drawShoulderPads(ctx, x, y, s, hop, time, zoom);
  drawStoneArms(
    ctx,
    x,
    y,
    s,
    hop,
    time,
    zoom,
    isAttacking,
    attackPhase,
    tossPhase
  );
  drawHead(ctx, x, y, s, hop, time, zoom, isAttacking, attackIntensity);
  drawIdleStoneToss(ctx, x, y, s, hop, tossX, tossY, time, zoom, isAttacking);

  if (isAttacking) {
    drawGroundCracks(ctx, x, y, s, time, attackIntensity, zoom);
  }
}

// ─── AURA ────────────────────────────────────────────────────────────────────

function drawAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const strength = isAttacking ? 0.45 : 0.18;
  const pulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let layer = 0; layer < 3; layer++) {
    const r = s * (0.85 + layer * 0.13);
    const g = ctx.createRadialGradient(x, y - hop, s * 0.1, x, y - hop, r);
    const a = (strength - layer * 0.05) * pulse;
    g.addColorStop(0, `rgba(180, 140, 60, ${a * 0.4})`);
    g.addColorStop(0.35, `rgba(120, 90, 40, ${a * 0.3})`);
    g.addColorStop(0.65, `rgba(80, 60, 30, ${a * 0.15})`);
    g.addColorStop(1, "rgba(60, 40, 20, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - hop, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gemstone glow from left eye
  const gemGlow =
    0.14 +
    Math.sin(time * 2.5) * 0.07 +
    (isAttacking ? attackIntensity * 0.18 : 0);
  const gg = ctx.createRadialGradient(
    x - s * 0.12,
    y - s * 0.54 - hop,
    0,
    x - s * 0.12,
    y - s * 0.54 - hop,
    s * 0.4
  );
  gg.addColorStop(0, `rgba(0, 220, 255, ${gemGlow})`);
  gg.addColorStop(0.5, `rgba(0, 160, 220, ${gemGlow * 0.3})`);
  gg.addColorStop(1, "rgba(0, 100, 180, 0)");
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(x - s * 0.12, y - s * 0.54 - hop, s * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────

function drawDebrisParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number
) {
  for (let p = 0; p < 12; p++) {
    const angle = (time * 1.2 + (p * Math.PI * 2) / 12) % (Math.PI * 2);
    const dist = s * 0.55 + Math.sin(time * 2 + p) * s * 0.12;
    const px = x + Math.cos(angle) * dist;
    const py = y - hop + Math.sin(angle) * dist * 0.5;
    const alpha = 0.35 + Math.sin(time * 2.5 + p * 0.8) * 0.2;
    const r = s * (0.012 + Math.sin(time + p) * 0.006);
    ctx.fillStyle =
      p % 3 === 0
        ? `rgba(160, 130, 80, ${alpha})`
        : p % 3 === 1
          ? `rgba(120, 95, 55, ${alpha})`
          : `rgba(90, 70, 40, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ATTACK SHOCKWAVES ──────────────────────────────────────────────────────

function drawAttackShockwaves(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  attackPhase: number,
  attackIntensity: number,
  zoom: number
) {
  for (let ring = 0; ring < 4; ring++) {
    const phase = (attackPhase * 2 + ring * 0.18) % 1;
    const alpha = (1 - phase) * 0.5 * attackIntensity;
    ctx.strokeStyle = `rgba(140, 100, 50, ${alpha})`;
    ctx.lineWidth = (3.5 - ring * 0.7) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - hop,
      s * (0.55 + phase * 0.6),
      s * (ISO_Y_RATIO + phase * 0.45),
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

// ─── FLUFFY SQUIRREL TAIL ───────────────────────────────────────────────────

function drawSquirrelTail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackPhase: number
) {
  const wave1 = Math.sin(time * 4) * 7;
  const wave2 = Math.sin(time * 5.2 + 0.5) * 4;
  const wave3 = Math.sin(time * 3.3 + 1.2) * 3;
  const aggro = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 12 : 0;
  const tw = wave1 + aggro;

  // Deep shadow silhouette (wider than the tail for volume)
  ctx.fillStyle = "#2a1a04";
  ctx.beginPath();
  ctx.moveTo(x + s * 0.2, y + s * 0.3 - hop * 0.3);
  ctx.bezierCurveTo(
    x + s * 0.56 + tw * 0.95,
    y + s * 0.14 - hop * 0.35,
    x + s * 0.95 + tw * 1.05,
    y - s * 0.18 - hop * 0.4,
    x + s * 0.72 + tw * 0.6,
    y - s * 0.82 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + s * 0.58 + tw * 0.4,
    y - s * 0.92 - hop * 0.48,
    x + s * 0.36 + wave2 * 0.3,
    y - s * 0.76 - hop * 0.45,
    x + s * 0.48 + wave2 * 0.35,
    y - s * 0.5 - hop * 0.38
  );
  ctx.bezierCurveTo(
    x + s * 0.34 + wave2 * 0.2,
    y - s * 0.22 - hop * 0.32,
    x + s * 0.24,
    y + s * 0.04 - hop * 0.3,
    x + s * 0.14,
    y + s * 0.2 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Main fur body — thick, voluminous shape with a curled tip
  const tg = ctx.createLinearGradient(
    x + s * 0.2,
    y - hop,
    x + s * 0.7 + tw * 0.4,
    y - s * 0.7 - hop
  );
  tg.addColorStop(0, "#c08020");
  tg.addColorStop(0.15, "#b07018");
  tg.addColorStop(0.35, "#c48828");
  tg.addColorStop(0.55, "#a86c18");
  tg.addColorStop(0.75, "#b07820");
  tg.addColorStop(1, "#8a5810");
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.22, y + s * 0.24 - hop * 0.3);
  // Outer edge — wide sweep upward
  ctx.bezierCurveTo(
    x + s * 0.52 + tw * 0.9,
    y + s * 0.08 - hop * 0.35,
    x + s * 0.88 + tw,
    y - s * 0.22 - hop * 0.4,
    x + s * 0.68 + tw * 0.55,
    y - s * 0.76 - hop * 0.45
  );
  // Curled tip
  ctx.bezierCurveTo(
    x + s * 0.58 + tw * 0.38,
    y - s * 0.88 - hop * 0.48,
    x + s * 0.4 + wave2 * 0.3,
    y - s * 0.82 - hop * 0.46,
    x + s * 0.46 + wave2 * 0.3,
    y - s * 0.62 - hop * 0.42
  );
  // Inner edge — narrower, creates the volume
  ctx.bezierCurveTo(
    x + s * 0.38 + wave2 * 0.22,
    y - s * 0.4 - hop * 0.35,
    x + s * 0.28,
    y - s * 0.1 - hop * 0.3,
    x + s * 0.19,
    y + s * 0.14 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // RACCOON BANDING — dark rings across the tail
  ctx.fillStyle = "rgba(40, 25, 8, 0.55)";
  for (let b = 0; b < 5; b++) {
    const t = 0.1 + b * 0.17;
    const bx1 = x + s * 0.24 + t * (s * 0.4 + tw * 0.5);
    const by1 = y + s * 0.18 - t * s * 0.82 - hop * (0.3 + t * 0.15);
    const bw = s * (0.08 + t * 0.04);
    const bAngle = Math.atan2(-0.82, 0.4 + tw * 0.005) + wave3 * 0.01;
    ctx.save();
    ctx.translate(bx1, by1);
    ctx.rotate(bAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, bw, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Light highlight stripe (inner fur)
  ctx.fillStyle = "#d8a840";
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.25, y + s * 0.16 - hop * 0.3);
  ctx.bezierCurveTo(
    x + s * 0.42 + tw * 0.65,
    y - s * 0.04 - hop * 0.35,
    x + s * 0.6 + tw * 0.75,
    y - s * 0.3 - hop * 0.4,
    x + s * 0.52 + tw * 0.38,
    y - s * 0.58 - hop * 0.43
  );
  ctx.bezierCurveTo(
    x + s * 0.38 + wave2 * 0.2,
    y - s * 0.36 - hop * 0.35,
    x + s * 0.28,
    y - s * 0.04 - hop * 0.3,
    x + s * 0.24,
    y + s * 0.1 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Cream underfur highlight
  ctx.fillStyle = "rgba(255, 240, 200, 0.2)";
  ctx.beginPath();
  ctx.moveTo(x + s * 0.23, y + s * 0.12 - hop * 0.3);
  ctx.bezierCurveTo(
    x + s * 0.35 + tw * 0.5,
    y - s * 0.06 - hop * 0.33,
    x + s * 0.48 + tw * 0.55,
    y - s * 0.28 - hop * 0.38,
    x + s * 0.46 + tw * 0.3,
    y - s * 0.48 - hop * 0.4
  );
  ctx.bezierCurveTo(
    x + s * 0.36 + wave2 * 0.15,
    y - s * 0.3 - hop * 0.34,
    x + s * 0.27,
    y - s * 0.02 - hop * 0.3,
    x + s * 0.23,
    y + s * 0.06 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Outer fur tufts (jagged edges along the outside for bushiness)
  ctx.fillStyle = "#a06818";
  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.13;
    const tx = x + s * 0.26 + t * (s * 0.42 + tw * 0.52);
    const ty = y + s * 0.12 - t * s * 0.78 - hop * (0.3 + t * 0.15);
    const tuftW = Math.sin(time * 5 + i * 0.8) * s * 0.01;
    ctx.beginPath();
    ctx.moveTo(tx + s * 0.06, ty - s * 0.02);
    ctx.quadraticCurveTo(
      tx + s * 0.12 + tuftW,
      ty,
      tx + s * 0.06,
      ty + s * 0.025
    );
    ctx.closePath();
    ctx.fill();
  }

  // Inner fur strand lines
  ctx.strokeStyle = "rgba(60, 40, 10, 0.3)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const sx = x + s * 0.24 + t * (s * 0.32 + tw * 0.35);
    const sy = y + s * 0.14 - t * s * 0.68 - hop * (0.3 + t * 0.15);
    const sw = Math.sin(time * 5 + i * 0.55) * s * 0.018;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + s * 0.04 + sw,
      sy - s * 0.03,
      sx + s * 0.08 + sw,
      sy - s * 0.05
    );
    ctx.stroke();
  }

  // Dark outer edge definition
  ctx.strokeStyle = "rgba(40, 25, 5, 0.2)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.24, y + s * 0.22 - hop * 0.3);
  ctx.bezierCurveTo(
    x + s * 0.52 + tw * 0.88,
    y + s * 0.06 - hop * 0.35,
    x + s * 0.86 + tw * 0.98,
    y - s * 0.24 - hop * 0.4,
    x + s * 0.66 + tw * 0.53,
    y - s * 0.76 - hop * 0.45
  );
  ctx.stroke();

  // Curled tip fur tuft (bushy end)
  const tipX = x + s * 0.5 + tw * 0.32 + wave2 * 0.28;
  const tipY = y - s * 0.68 - hop * 0.44;
  ctx.fillStyle = "#8a5810";
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.bezierCurveTo(
    tipX - s * 0.06,
    tipY - s * 0.12,
    tipX + s * 0.04,
    tipY - s * 0.16,
    tipX + s * 0.08,
    tipY - s * 0.1
  );
  ctx.bezierCurveTo(
    tipX + s * 0.12,
    tipY - s * 0.04,
    tipX + s * 0.06,
    tipY + s * 0.04,
    tipX,
    tipY
  );
  ctx.closePath();
  ctx.fill();

  // Tail tip glow
  const tipPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(220, 180, 80, ${0.35 + tipPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(tipX, tipY - s * 0.06, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 220, 120, ${0.25 + tipPulse * 0.15})`;
  ctx.beginPath();
  ctx.arc(tipX, tipY - s * 0.06, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

// ─── WINGS ──────────────────────────────────────────────────────────────────

function drawWing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  side: number
) {
  const by = y - hop;
  const isStone = side === -1;
  const flapAngle = isAttacking
    ? Math.sin(attackIntensity * Math.PI * 2) * 0.95
    : Math.sin(time * 1.8) * 0.91;

  ctx.save();
  ctx.translate(x + side * s * 0.32, by - s * -0.2);
  ctx.scale(side, 1);
  ctx.rotate(0.15 + flapAngle);

  // Wing arm bone
  const boneColors = isStone
    ? ["#787068", "#686058", "#585050"]
    : ["#b08020", "#9a6c18", "#7a5010"];
  const boneG = ctx.createLinearGradient(0, 0, -s * 0.5, -s * 0.35);
  boneG.addColorStop(0, boneColors[0]);
  boneG.addColorStop(0.5, boneColors[1]);
  boneG.addColorStop(1, boneColors[2]);
  ctx.fillStyle = boneG;
  ctx.beginPath();
  ctx.moveTo(s * 0.02, -s * 0.03);
  ctx.lineTo(-s * 0.48, -s * 0.34);
  ctx.lineTo(-s * 0.5, -s * 0.3);
  ctx.lineTo(-s * 0.02, s * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = isStone ? "#3a3434" : "#5a3a08";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Finger bones radiating from elbow
  const fingers = [
    { angle: -0.9, len: 0.52 },
    { angle: -0.6, len: 0.56 },
    { angle: -0.3, len: 0.5 },
    { angle: 0, len: 0.42 },
    { angle: 0.3, len: 0.32 },
  ];
  const elbowX = -s * 0.46;
  const elbowY = -s * 0.32;

  for (const finger of fingers) {
    const fx = elbowX + Math.cos(finger.angle - 0.6) * s * finger.len;
    const fy = elbowY + Math.sin(finger.angle - 0.6) * s * finger.len;
    ctx.strokeStyle = isStone ? "#585050" : "#8a5810";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.strokeStyle = isStone
      ? "rgba(140, 130, 120, 0.3)"
      : "rgba(220, 180, 100, 0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(elbowX + 1, elbowY - 1);
    ctx.lineTo(fx + 1, fy - 1);
    ctx.stroke();
  }

  // Membrane panels between fingers
  for (let i = 0; i < fingers.length - 1; i++) {
    const f1 = fingers[i];
    const f2 = fingers[i + 1];
    const fx1 = elbowX + Math.cos(f1.angle - 0.6) * s * f1.len;
    const fy1 = elbowY + Math.sin(f1.angle - 0.6) * s * f1.len;
    const fx2 = elbowX + Math.cos(f2.angle - 0.6) * s * f2.len;
    const fy2 = elbowY + Math.sin(f2.angle - 0.6) * s * f2.len;

    const panelG = ctx.createLinearGradient(
      elbowX,
      elbowY,
      (fx1 + fx2) / 2,
      (fy1 + fy2) / 2
    );
    const shade = 0.85 - i * 0.08;
    if (isStone) {
      panelG.addColorStop(
        0,
        `rgba(${Math.round(100 * shade)}, ${Math.round(90 * shade)}, ${Math.round(80 * shade)}, 0.85)`
      );
      panelG.addColorStop(
        1,
        `rgba(${Math.round(70 * shade)}, ${Math.round(65 * shade)}, ${Math.round(58 * shade)}, 0.75)`
      );
    } else {
      panelG.addColorStop(
        0,
        `rgba(${Math.round(190 * shade)}, ${Math.round(140 * shade)}, ${Math.round(50 * shade)}, 0.8)`
      );
      panelG.addColorStop(
        1,
        `rgba(${Math.round(150 * shade)}, ${Math.round(100 * shade)}, ${Math.round(30 * shade)}, 0.7)`
      );
    }
    ctx.fillStyle = panelG;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY);
    ctx.lineTo(fx1, fy1);
    ctx.lineTo(fx2, fy2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isStone
      ? "rgba(40, 35, 30, 0.3)"
      : "rgba(80, 50, 10, 0.25)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // Jagged tips at finger ends
  for (let i = 0; i < fingers.length; i++) {
    const f = fingers[i];
    const fx = elbowX + Math.cos(f.angle - 0.6) * s * f.len;
    const fy = elbowY + Math.sin(f.angle - 0.6) * s * f.len;
    const tipAngle = f.angle - 0.6 + 0.2;
    const tipLen = s * 0.06;
    ctx.fillStyle = isStone ? "#484040" : "#7a5010";
    ctx.beginPath();
    ctx.moveTo(fx - s * 0.02, fy);
    ctx.lineTo(
      fx + Math.cos(tipAngle) * tipLen,
      fy + Math.sin(tipAngle) * tipLen
    );
    ctx.lineTo(fx + s * 0.02, fy);
    ctx.closePath();
    ctx.fill();
  }

  // Texture lines across membrane
  ctx.strokeStyle = isStone
    ? "rgba(30, 25, 20, 0.4)"
    : "rgba(80, 50, 10, 0.25)";
  ctx.lineWidth = 0.7 * zoom;
  for (let i = 0; i < 3; i++) {
    const f = fingers[i];
    const midX = elbowX + Math.cos(f.angle - 0.6) * s * f.len * 0.5;
    const midY = elbowY + Math.sin(f.angle - 0.6) * s * f.len * 0.5;
    ctx.beginPath();
    ctx.moveTo(midX - s * 0.03, midY + s * 0.02);
    ctx.lineTo(midX + s * 0.04, midY - s * 0.02);
    ctx.stroke();
  }

  // Elbow joint
  ctx.fillStyle = isStone ? "#706860" : "#a07020";
  ctx.beginPath();
  ctx.arc(elbowX, elbowY, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isStone ? "#3a3434" : "#5a3a08";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Gemstone (stone wing) / golden tuft (fur wing)
  if (isStone) {
    const gemG = ctx.createRadialGradient(
      elbowX,
      elbowY,
      0,
      elbowX,
      elbowY,
      s * 0.018
    );
    gemG.addColorStop(0, "#80ffff");
    gemG.addColorStop(0.5, "#00c8e0");
    gemG.addColorStop(1, "#006880");
    ctx.fillStyle = gemG;
    ctx.beginPath();
    ctx.arc(elbowX, elbowY, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#d8a840";
    ctx.beginPath();
    ctx.arc(elbowX, elbowY, s * 0.014, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── BODY ────────────────────────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  breathe: number,
  zoom: number,
  time: number
) {
  const bw = s * (0.42 + breathe);
  const bh = s * (0.46 + breathe * 0.5);
  const by = y - hop;

  // Organic body shape using bezier curves (wider hips, narrower shoulders)
  const g = ctx.createRadialGradient(
    x - s * 0.05,
    by - s * 0.04,
    s * 0.1,
    x,
    by,
    s * 0.5
  );
  g.addColorStop(0, "#d8a840");
  g.addColorStop(0.25, "#c09030");
  g.addColorStop(0.5, "#a07020");
  g.addColorStop(0.75, "#856018");
  g.addColorStop(1, "#5a3a08");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, by - bh);
  ctx.bezierCurveTo(
    x + bw * 0.6,
    by - bh,
    x + bw * 1.05,
    by - bh * 0.5,
    x + bw,
    by - bh * 0.1
  );
  ctx.bezierCurveTo(
    x + bw * 1.08,
    by + bh * 0.3,
    x + bw * 0.85,
    by + bh * 0.8,
    x + bw * 0.4,
    by + bh
  );
  ctx.bezierCurveTo(
    x + bw * 0.15,
    by + bh * 1.05,
    x - bw * 0.15,
    by + bh * 1.05,
    x - bw * 0.4,
    by + bh
  );
  ctx.bezierCurveTo(
    x - bw * 0.85,
    by + bh * 0.8,
    x - bw * 1.12,
    by + bh * 0.3,
    x - bw * 1.05,
    by - bh * 0.1
  );
  ctx.bezierCurveTo(
    x - bw * 1.1,
    by - bh * 0.5,
    x - bw * 0.65,
    by - bh,
    x,
    by - bh
  );
  ctx.closePath();
  ctx.fill();

  // Body outline
  ctx.strokeStyle = "rgba(50, 30, 8, 0.25)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Cream belly FIRST (drawn before stones so stones overlap it)
  const belly = ctx.createRadialGradient(
    x + s * 0.04,
    by + s * 0.06,
    s * 0.03,
    x + s * 0.04,
    by + s * 0.06,
    s * 0.24
  );
  belly.addColorStop(0, "#fff8e8");
  belly.addColorStop(0.4, "#f0dcc0");
  belly.addColorStop(0.8, "#d8c0a0");
  belly.addColorStop(1, "#c0a880");
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, by - s * 0.16);
  ctx.bezierCurveTo(
    x + s * 0.12,
    by - s * 0.2,
    x + s * 0.24,
    by - s * 0.08,
    x + s * 0.22,
    by + s * 0.1
  );
  ctx.bezierCurveTo(
    x + s * 0.2,
    by + s * 0.28,
    x + s * 0.05,
    by + s * 0.34,
    x - s * 0.06,
    by + s * 0.3
  );
  ctx.bezierCurveTo(
    x - s * 0.18,
    by + s * 0.24,
    x - s * 0.18,
    by - s * 0.1,
    x - s * 0.08,
    by - s * 0.16
  );
  ctx.closePath();
  ctx.fill();

  // Belly fur detail
  ctx.strokeStyle = "rgba(180, 150, 110, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 5; i++) {
    const fy = by + s * (-0.05 + i * 0.065);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.04, fy);
    ctx.quadraticCurveTo(x + s * 0.06, fy + s * 0.015, x + s * 0.16, fy);
    ctx.stroke();
  }

  // LEFT-SIDE STONE PLATING (drawn after belly so it overlaps)
  drawLeftStonePlating(ctx, x, by, s, zoom);

  // Fur texture strands (right side only, fur side)
  ctx.strokeStyle = "rgba(60, 40, 10, 0.22)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 8; i++) {
    const a = -0.3 + i * 0.12;
    const wv = Math.sin(time * 4 + i * 0.7) * s * 0.008;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * s * 0.16, by + Math.sin(a) * s * 0.22);
    ctx.lineTo(x + Math.cos(a) * s * 0.38 + wv, by + Math.sin(a) * s * 0.42);
    ctx.stroke();
  }

  // Right flank fur tufts
  ctx.fillStyle = "#b08020";
  for (let t = 0; t < 3; t++) {
    const ty = by + s * (-0.15 + t * 0.14);
    const tx = x + s * (0.36 + t * 0.02);
    ctx.beginPath();
    ctx.moveTo(tx, ty - s * 0.03);
    ctx.quadraticCurveTo(tx + s * 0.06, ty, tx, ty + s * 0.03);
    ctx.closePath();
    ctx.fill();
  }

  // Left side jagged stone tufts
  ctx.fillStyle = "#686058";
  for (let t = 0; t < 4; t++) {
    const ty = by + s * (-0.2 + t * 0.12);
    const tx = x - s * (0.37 + t * 0.015);
    ctx.beginPath();
    ctx.moveTo(tx, ty - s * 0.025);
    ctx.lineTo(tx - s * 0.05, ty - s * 0.01);
    ctx.lineTo(tx - s * 0.04, ty + s * 0.02);
    ctx.lineTo(tx, ty + s * 0.03);
    ctx.closePath();
    ctx.fill();
  }

  // Chest tuft (bezier layered)
  ctx.fillStyle = "#f0d890";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.06, by - s * 0.22);
  ctx.bezierCurveTo(
    x - s * 0.02,
    by - s * 0.31,
    x + s * 0.02,
    by - s * 0.31,
    x + s * 0.09,
    by - s * 0.22
  );
  ctx.bezierCurveTo(
    x + s * 0.07,
    by - s * 0.16,
    x + s * 0.03,
    by - s * 0.12,
    x,
    by - s * 0.1
  );
  ctx.bezierCurveTo(
    x - s * 0.04,
    by - s * 0.13,
    x - s * 0.06,
    by - s * 0.17,
    x - s * 0.06,
    by - s * 0.22
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f8e0a0";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.03, by - s * 0.21);
  ctx.bezierCurveTo(
    x,
    by - s * 0.27,
    x + s * 0.02,
    by - s * 0.27,
    x + s * 0.05,
    by - s * 0.21
  );
  ctx.bezierCurveTo(
    x + s * 0.03,
    by - s * 0.17,
    x + s * 0.01,
    by - s * 0.14,
    x,
    by - s * 0.13
  );
  ctx.bezierCurveTo(
    x - s * 0.02,
    by - s * 0.15,
    x - s * 0.03,
    by - s * 0.18,
    x - s * 0.03,
    by - s * 0.21
  );
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Scattered stone fragments
  drawBodyStoneFragments(ctx, x, y, s, hop, zoom);
}

function drawLeftStonePlating(
  ctx: CanvasRenderingContext2D,
  x: number,
  by: number,
  s: number,
  zoom: number
) {
  // Large stone plate covering upper-left torso
  const pg = ctx.createLinearGradient(
    x - s * 0.45,
    by - s * 0.3,
    x - s * 0.05,
    by + s * 0.15
  );
  pg.addColorStop(0, "#8a8278");
  pg.addColorStop(0.3, "#706860");
  pg.addColorStop(0.6, "#5a524a");
  pg.addColorStop(1, "#484038");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.05, by - s * 0.35);
  ctx.lineTo(x - s * 0.18, by - s * 0.38);
  ctx.lineTo(x - s * 0.35, by - s * 0.3);
  ctx.lineTo(x - s * 0.42, by - s * 0.12);
  ctx.lineTo(x - s * 0.4, by + s * 0.1);
  ctx.lineTo(x - s * 0.32, by + s * 0.25);
  ctx.lineTo(x - s * 0.18, by + s * 0.3);
  ctx.lineTo(x - s * 0.06, by + s * 0.22);
  ctx.lineTo(x - s * 0.02, by + s * 0.05);
  ctx.lineTo(x - s * 0.04, by - s * 0.18);
  ctx.closePath();
  ctx.fill();

  // Plate outline
  ctx.strokeStyle = "rgba(30, 25, 18, 0.45)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.stroke();

  // Major cracks across the plate
  ctx.strokeStyle = "rgba(25, 20, 12, 0.6)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.34, by - s * 0.28);
  ctx.lineTo(x - s * 0.22, by - s * 0.08);
  ctx.lineTo(x - s * 0.12, by + s * 0.15);
  ctx.stroke();
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, by - s * 0.08);
  ctx.lineTo(x - s * 0.38, by + s * 0.04);
  ctx.stroke();
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, by - s * 0.2);
  ctx.lineTo(x - s * 0.06, by - s * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, by + s * 0.12);
  ctx.lineTo(x - s * 0.2, by + s * 0.25);
  ctx.stroke();

  // Crack highlights
  ctx.strokeStyle = "rgba(170, 160, 150, 0.25)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.33, by - s * 0.27);
  ctx.lineTo(x - s * 0.21, by - s * 0.07);
  ctx.stroke();

  // Top specular highlight
  const hl = ctx.createLinearGradient(
    x - s * 0.35,
    by - s * 0.38,
    x - s * 0.2,
    by - s * 0.15
  );
  hl.addColorStop(0, "rgba(200, 190, 180, 0.35)");
  hl.addColorStop(1, "rgba(200, 190, 180, 0)");
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.16, by - s * 0.37);
  ctx.lineTo(x - s * 0.34, by - s * 0.28);
  ctx.lineTo(x - s * 0.3, by - s * 0.15);
  ctx.lineTo(x - s * 0.1, by - s * 0.25);
  ctx.closePath();
  ctx.fill();

  // Small stone chunk jutting off the edge
  ctx.fillStyle = "#605850";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.42, by - s * 0.1);
  ctx.lineTo(x - s * 0.48, by - s * 0.04);
  ctx.lineTo(x - s * 0.46, by + s * 0.06);
  ctx.lineTo(x - s * 0.4, by + s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(30, 25, 18, 0.4)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Moss-like patches in crevices
  ctx.fillStyle = "rgba(80, 100, 60, 0.2)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.28, by - s * 0.05);
  ctx.quadraticCurveTo(
    x - s * 0.32,
    by + s * 0.02,
    x - s * 0.26,
    by + s * 0.06
  );
  ctx.quadraticCurveTo(
    x - s * 0.22,
    by + s * 0.02,
    x - s * 0.28,
    by - s * 0.05
  );
  ctx.fill();
  ctx.fillStyle = "rgba(70, 95, 55, 0.15)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.12, by + s * 0.12);
  ctx.quadraticCurveTo(x - s * 0.16, by + s * 0.18, x - s * 0.1, by + s * 0.2);
  ctx.quadraticCurveTo(
    x - s * 0.06,
    by + s * 0.16,
    x - s * 0.12,
    by + s * 0.12
  );
  ctx.fill();
}

function drawBodyStoneFragments(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  zoom: number
) {
  // Heavy left-side fragments + a few scattered right-side chips
  const fragments: { ox: number; oy: number; pts: number[][]; rot: number }[] =
    [
      // LEFT SIDE: large, angular chunks
      {
        ox: -0.28,
        oy: -0.2,
        pts: [
          [-0.5, -0.3],
          [-0.2, -0.6],
          [0.35, -0.5],
          [0.55, 0],
          [0.3, 0.5],
          [-0.2, 0.55],
          [-0.55, 0.15],
        ],
        rot: 0.4,
      },
      {
        ox: -0.34,
        oy: 0.15,
        pts: [
          [-0.45, -0.35],
          [-0.1, -0.55],
          [0.4, -0.4],
          [0.5, 0.1],
          [0.2, 0.5],
          [-0.3, 0.5],
          [-0.5, 0.1],
        ],
        rot: -0.2,
      },
      {
        ox: -0.15,
        oy: 0.32,
        pts: [
          [-0.4, -0.2],
          [0, -0.5],
          [0.45, -0.2],
          [0.4, 0.35],
          [-0.1, 0.5],
          [-0.45, 0.2],
        ],
        rot: 0.5,
      },
      {
        ox: -0.38,
        oy: -0.04,
        pts: [
          [-0.5, -0.25],
          [-0.15, -0.5],
          [0.3, -0.45],
          [0.5, 0.05],
          [0.25, 0.5],
          [-0.25, 0.45],
          [-0.5, 0.1],
        ],
        rot: 0.1,
      },
      {
        ox: -0.08,
        oy: -0.12,
        pts: [
          [-0.4, -0.3],
          [0.1, -0.5],
          [0.5, -0.15],
          [0.35, 0.4],
          [-0.15, 0.5],
          [-0.45, 0.1],
        ],
        rot: -0.3,
      },
      // RIGHT SIDE: smaller scattered chips
      {
        ox: 0.2,
        oy: 0.18,
        pts: [
          [-0.4, -0.25],
          [0.05, -0.5],
          [0.45, -0.1],
          [0.3, 0.45],
          [-0.15, 0.45],
          [-0.45, 0.1],
        ],
        rot: -0.5,
      },
      {
        ox: 0.26,
        oy: -0.08,
        pts: [
          [-0.35, -0.35],
          [0.15, -0.5],
          [0.5, 0],
          [0.2, 0.45],
          [-0.3, 0.4],
          [-0.45, -0.05],
        ],
        rot: 0.3,
      },
      {
        ox: 0.12,
        oy: 0.3,
        pts: [
          [-0.4, -0.2],
          [0.1, -0.45],
          [0.45, 0.05],
          [0.15, 0.45],
          [-0.35, 0.3],
        ],
        rot: -0.6,
      },
    ];

  const sizes = [0.08, 0.07, 0.06, 0.055, 0.06, 0.05, 0.045, 0.04];

  for (let i = 0; i < fragments.length; i++) {
    const frag = fragments[i];
    const sz = sizes[i] * s;
    const fx = x + frag.ox * s;
    const fy = y - hop + frag.oy * s;

    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(frag.rot);

    const fg = ctx.createRadialGradient(
      -sz * 0.15,
      -sz * 0.15,
      0,
      0,
      0,
      sz * 1.2
    );
    fg.addColorStop(0, "#9a9288");
    fg.addColorStop(0.4, "#807870");
    fg.addColorStop(0.8, "#605850");
    fg.addColorStop(1, "#484040");
    ctx.fillStyle = fg;

    ctx.beginPath();
    const { pts } = frag;
    ctx.moveTo(pts[0][0] * sz, pts[0][1] * sz);
    for (let p = 1; p < pts.length; p++) {
      ctx.lineTo(pts[p][0] * sz, pts[p][1] * sz);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(30, 25, 18, 0.35)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Crack across fragment
    ctx.strokeStyle = "rgba(30, 25, 18, 0.5)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] * sz * 0.6, pts[0][1] * sz * 0.6);
    const mid = Math.floor(pts.length / 2);
    ctx.lineTo(pts[mid][0] * sz * 0.6, pts[mid][1] * sz * 0.6);
    ctx.stroke();

    // Highlight edge on top
    ctx.strokeStyle = "rgba(190, 180, 170, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pts[0][0] * sz, pts[0][1] * sz);
    ctx.lineTo(pts[1][0] * sz, pts[1][1] * sz);
    ctx.stroke();

    ctx.restore();
  }
}

// ─── STONE CLAWS (feet) ─────────────────────────────────────────────────────

function drawStoneClaws(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const by = y - hop;
  const footY = by + s * 0.44;
  const grip = isAttacking ? Math.sin(attackIntensity * Math.PI) * s * 0.02 : 0;

  for (let side = -1; side <= 1; side += 2) {
    const footX = x + side * s * 0.18;

    ctx.save();
    ctx.translate(footX, footY);
    ctx.scale(side, 1);

    // Ankle / leg stub connecting to body
    const ankleG = ctx.createLinearGradient(0, -s * 0.1, 0, s * 0.04);
    ankleG.addColorStop(0, "#787068");
    ankleG.addColorStop(0.5, "#686058");
    ankleG.addColorStop(1, "#585050");
    ctx.fillStyle = ankleG;
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, -s * 0.08);
    ctx.lineTo(s * 0.06, -s * 0.08);
    ctx.lineTo(s * 0.08, s * 0.02);
    ctx.lineTo(-s * 0.07, s * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a3434";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Main foot pad (stone slab)
    const footG = ctx.createLinearGradient(
      -s * 0.1,
      -s * 0.02,
      s * 0.12,
      s * 0.06
    );
    footG.addColorStop(0, "#706860");
    footG.addColorStop(0.4, "#605850");
    footG.addColorStop(0.8, "#504840");
    footG.addColorStop(1, "#484038");
    ctx.fillStyle = footG;
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.01);
    ctx.lineTo(s * 0.1, -s * 0.02);
    ctx.lineTo(s * 0.14, s * 0.04);
    ctx.lineTo(s * 0.12, s * 0.08);
    ctx.lineTo(-s * 0.1, s * 0.08);
    ctx.lineTo(-s * 0.12, s * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a3434";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Crack across foot
    ctx.strokeStyle = "rgba(30, 25, 20, 0.4)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.04, 0);
    ctx.lineTo(s * 0.02, s * 0.06);
    ctx.stroke();

    // Three talons
    const talonOffsets = [
      { angle: 0.15, len: s * 0.1, tx: s * 0.1, ty: s * 0.04 },
      { angle: 0, len: s * 0.12, tx: s * 0.04, ty: s * 0.07 },
      { angle: -0.2, len: s * 0.1, tx: -s * 0.04, ty: s * 0.07 },
    ];

    for (const talon of talonOffsets) {
      const clawGrip = grip * (talon.angle > 0 ? 1 : -0.5);

      ctx.save();
      ctx.translate(talon.tx, talon.ty);
      ctx.rotate(talon.angle + clawGrip);

      const tg = ctx.createLinearGradient(0, 0, 0, talon.len);
      tg.addColorStop(0, "#686058");
      tg.addColorStop(0.5, "#585050");
      tg.addColorStop(1, "#3a3434");
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.moveTo(-s * 0.02, 0);
      ctx.lineTo(s * 0.02, 0);
      ctx.lineTo(s * 0.008, talon.len * 0.7);
      ctx.lineTo(0, talon.len);
      ctx.lineTo(-s * 0.008, talon.len * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2a2424";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Talon highlight edge
      ctx.strokeStyle = "rgba(140, 130, 120, 0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(-s * 0.015, s * 0.005);
      ctx.lineTo(-s * 0.006, talon.len * 0.65);
      ctx.stroke();

      ctx.restore();
    }

    // Back spur talon
    ctx.save();
    ctx.translate(-s * 0.09, s * 0.03);
    ctx.rotate(-0.5);
    ctx.fillStyle = "#585050";
    ctx.beginPath();
    ctx.moveTo(-s * 0.015, 0);
    ctx.lineTo(s * 0.015, 0);
    ctx.lineTo(0, s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2a2424";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();
    ctx.restore();

    // Foot top highlight
    ctx.strokeStyle = "rgba(150, 140, 128, 0.25)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, 0);
    ctx.lineTo(s * 0.08, -s * 0.01);
    ctx.stroke();

    ctx.restore();
  }
}

// ─── STONE SHOULDER PADS ────────────────────────────────────────────────────

function drawShoulderPads(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number,
  zoom: number
) {
  for (let side = -1; side <= 1; side += 2) {
    const padX = x + side * s * 0.37;
    const padY = y - hop - s * 0.2;

    ctx.save();
    ctx.translate(padX, padY);
    ctx.rotate(side * 0.15);

    const padW = s * 0.24;
    const padH = s * 0.18;

    const pg = ctx.createRadialGradient(
      -side * padW * 0.15,
      -padH * 0.2,
      padW * 0.1,
      0,
      0,
      padW * 1.1
    );
    pg.addColorStop(0, "#a09890");
    pg.addColorStop(0.25, "#8a8278");
    pg.addColorStop(0.5, "#706860");
    pg.addColorStop(0.75, "#585048");
    pg.addColorStop(1, "#403830");
    ctx.fillStyle = pg;

    ctx.beginPath();
    ctx.moveTo(-padW * 0.88, padH * 0.12);
    ctx.quadraticCurveTo(
      -padW * 0.92,
      -padH * 0.55,
      -padW * 0.42,
      -padH * 0.85
    );
    ctx.quadraticCurveTo(0, -padH * 1.05, padW * 0.42, -padH * 0.85);
    ctx.quadraticCurveTo(padW * 0.92, -padH * 0.55, padW * 0.88, padH * 0.12);
    ctx.quadraticCurveTo(padW * 0.55, padH * 0.75, 0, padH * 0.65);
    ctx.quadraticCurveTo(-padW * 0.55, padH * 0.75, -padW * 0.88, padH * 0.12);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = "rgba(30, 25, 20, 0.5)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Major crack
    ctx.strokeStyle = "rgba(25, 20, 15, 0.6)";
    ctx.lineWidth = 1.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.65, -padH * 0.45);
    ctx.lineTo(-padW * 0.12, padH * 0.15);
    ctx.lineTo(padW * 0.35, padH * 0.4);
    ctx.stroke();
    // Branch
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.12, padH * 0.15);
    ctx.lineTo(padW * 0.18, -padH * 0.4);
    ctx.stroke();
    // Secondary
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(padW * 0.38, -padH * 0.25);
    ctx.lineTo(padW * 0.65, padH * 0.08);
    ctx.stroke();
    // Extra fine cracks
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.4, padH * 0.3);
    ctx.lineTo(-padW * 0.15, padH * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padW * 0.5, -padH * 0.55);
    ctx.lineTo(padW * 0.7, -padH * 0.3);
    ctx.stroke();

    // Crack edge highlights
    ctx.strokeStyle = "rgba(180, 170, 160, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.63, -padH * 0.43);
    ctx.lineTo(-padW * 0.1, padH * 0.13);
    ctx.stroke();

    // Top specular highlight
    const hl = ctx.createLinearGradient(0, -padH * 0.95, 0, -padH * 0.2);
    hl.addColorStop(0, "rgba(210, 200, 190, 0.4)");
    hl.addColorStop(1, "rgba(210, 200, 190, 0)");
    ctx.fillStyle = hl;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.38, -padH * 0.78);
    ctx.quadraticCurveTo(0, -padH * 1, padW * 0.38, -padH * 0.78);
    ctx.quadraticCurveTo(0, -padH * 0.45, -padW * 0.38, -padH * 0.78);
    ctx.closePath();
    ctx.fill();

    // Ridge line
    ctx.strokeStyle = "rgba(150, 140, 130, 0.4)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.75, -padH * 0.12);
    ctx.quadraticCurveTo(0, -padH * 0.4, padW * 0.75, -padH * 0.12);
    ctx.stroke();

    // Etched rune symbol on pad (subtle)
    ctx.strokeStyle = "rgba(140, 120, 80, 0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(0, -padH * 0.1, padW * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -padH * 0.1 - padW * 0.12);
    ctx.lineTo(0, -padH * 0.1 + padW * 0.12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-padW * 0.12, -padH * 0.1);
    ctx.lineTo(padW * 0.12, -padH * 0.1);
    ctx.stroke();

    ctx.restore();
  }
}

// ─── STONE-ARMORED ARMS ─────────────────────────────────────────────────────

function drawStoneArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackPhase: number,
  tossPhase: number
) {
  const rightIdleLift = isAttacking ? 0 : Math.sin(tossPhase * Math.PI) * 0.4;
  const leftSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 0.7
    : Math.sin(time * 2.5) * 0.05;
  const rightSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2 + 0.5) * 0.8
    : rightIdleLift;

  for (let side = -1; side <= 1; side += 2) {
    const swing = side === -1 ? leftSwing : rightSwing;
    ctx.save();
    ctx.translate(x + side * s * 0.33, y - hop - s * 0.05);
    ctx.rotate(side * (-0.85 - swing * 0.6));

    // Fur upper arm (wider)
    const armFur = ctx.createLinearGradient(0, 0, 0, s * 0.1);
    armFur.addColorStop(0, "#c09028");
    armFur.addColorStop(1, "#956818");
    ctx.fillStyle = armFur;
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, 0);
    ctx.quadraticCurveTo(-s * 0.06, s * 0.05, -s * 0.055, s * 0.1);
    ctx.lineTo(s * 0.055, s * 0.09);
    ctx.quadraticCurveTo(s * 0.06, s * 0.04, s * 0.03, 0);
    ctx.closePath();
    ctx.fill();

    // Stone gauntlet (wider, more detailed)
    const stoneGrad = ctx.createLinearGradient(0, s * 0.08, 0, s * 0.26);
    stoneGrad.addColorStop(0, "#908878");
    stoneGrad.addColorStop(0.3, "#787068");
    stoneGrad.addColorStop(0.6, "#605850");
    stoneGrad.addColorStop(1, "#484038");
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, s * 0.08);
    ctx.lineTo(-s * 0.065, s * 0.24);
    ctx.lineTo(s * 0.065, s * 0.22);
    ctx.lineTo(s * 0.06, s * 0.08);
    ctx.closePath();
    ctx.fill();

    // Gauntlet outline
    ctx.strokeStyle = "rgba(30, 25, 18, 0.4)";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Cracks on gauntlet
    ctx.strokeStyle = "rgba(40, 30, 20, 0.5)";
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.035, s * 0.1);
    ctx.lineTo(s * 0.012, s * 0.16);
    ctx.lineTo(-s * 0.025, s * 0.22);
    ctx.stroke();
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(s * 0.025, s * 0.11);
    ctx.lineTo(s * 0.04, s * 0.19);
    ctx.stroke();

    // Ridge plate lines
    ctx.strokeStyle = "rgba(160, 150, 140, 0.4)";
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.058, s * 0.085);
    ctx.lineTo(s * 0.058, s * 0.085);
    ctx.stroke();
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.055, s * 0.15);
    ctx.lineTo(s * 0.055, s * 0.15);
    ctx.stroke();

    // Knuckle guard
    ctx.fillStyle = "#686058";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.24, s * 0.06, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30, 25, 18, 0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Paw (larger)
    const pawG = ctx.createRadialGradient(
      0,
      s * 0.27,
      0,
      0,
      s * 0.27,
      s * 0.07
    );
    pawG.addColorStop(0, "#d8c0a0");
    pawG.addColorStop(0.6, "#c0a080");
    pawG.addColorStop(1, "#907050");
    ctx.fillStyle = pawG;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.27, s * 0.06, s * 0.05, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Paw pads
    ctx.fillStyle = "#a08070";
    ctx.beginPath();
    ctx.arc(-s * 0.022, s * 0.275, s * 0.012, 0, Math.PI * 2);
    ctx.arc(s * 0.015, s * 0.278, s * 0.01, 0, Math.PI * 2);
    ctx.arc(0, s * 0.29, s * 0.008, 0, Math.PI * 2);
    ctx.fill();

    // Claws (sharper)
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.lineCap = "round";
    for (let c = 0; c < 5; c++) {
      const ca = -0.9 + c * 0.35;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ca) * s * 0.045, s * 0.27 + Math.sin(ca) * s * 0.035);
      ctx.lineTo(Math.cos(ca) * s * 0.068, s * 0.27 + Math.sin(ca) * s * 0.055);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ─── HALF-GARGOYLE / HALF-SQUIRREL HEAD ─────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const headY = y - s * 0.55 - hop;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const headW = s * 0.34;
  const headH = s * 0.32;

  // Build a shared bezier head path (rounded but slightly angular, wider at cheeks)
  function headPath() {
    ctx.beginPath();
    ctx.moveTo(x, headY - headH);
    ctx.bezierCurveTo(
      x + headW * 0.55,
      headY - headH * 1.05,
      x + headW * 1.1,
      headY - headH * 0.45,
      x + headW,
      headY
    );
    ctx.bezierCurveTo(
      x + headW * 1.05,
      headY + headH * 0.5,
      x + headW * 0.6,
      headY + headH * 1.05,
      x,
      headY + headH
    );
    ctx.bezierCurveTo(
      x - headW * 0.6,
      headY + headH * 1.05,
      x - headW * 1.05,
      headY + headH * 0.5,
      x - headW,
      headY
    );
    ctx.bezierCurveTo(
      x - headW * 1.1,
      headY - headH * 0.45,
      x - headW * 0.55,
      headY - headH * 1.05,
      x,
      headY - headH
    );
    ctx.closePath();
  }

  // RIGHT HALF: squirrel fur (clip to right side)
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, headY - s * 0.5, s * 0.6, s * 1.2);
  ctx.clip();
  const rg = ctx.createRadialGradient(
    x + s * 0.05,
    headY - s * 0.04,
    s * 0.05,
    x,
    headY,
    headW * 1.05
  );
  rg.addColorStop(0, "#d8a840");
  rg.addColorStop(0.35, "#c09030");
  rg.addColorStop(0.65, "#956818");
  rg.addColorStop(1, "#6b4904");
  ctx.fillStyle = rg;
  headPath();
  ctx.fill();
  ctx.restore();

  // LEFT HALF: stone gargoyle (clip to left side)
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - s * 0.6, headY - s * 0.5, s * 0.6, s * 1.2);
  ctx.clip();
  const lg = ctx.createRadialGradient(
    x - s * 0.05,
    headY - s * 0.04,
    s * 0.05,
    x,
    headY,
    headW * 1.05
  );
  lg.addColorStop(0, "#908880");
  lg.addColorStop(0.35, "#787068");
  lg.addColorStop(0.65, "#585050");
  lg.addColorStop(1, "#3a3434");
  ctx.fillStyle = lg;
  headPath();
  ctx.fill();
  ctx.restore();

  // Head outline
  ctx.strokeStyle = "rgba(40, 30, 15, 0.3)";
  ctx.lineWidth = 1.2 * zoom;
  headPath();
  ctx.stroke();

  // Center seam (jagged, not straight)
  ctx.strokeStyle = "rgba(80, 60, 40, 0.55)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, headY - headH * 0.9);
  ctx.lineTo(x + s * 0.01, headY - headH * 0.5);
  ctx.lineTo(x - s * 0.015, headY - headH * 0.15);
  ctx.lineTo(x + s * 0.008, headY + headH * 0.2);
  ctx.lineTo(x - s * 0.01, headY + headH * 0.55);
  ctx.lineTo(x, headY + headH * 0.9);
  ctx.stroke();

  // Gargoyle cracks
  ctx.strokeStyle = "rgba(30, 25, 20, 0.55)";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.04, headY - s * 0.25);
  ctx.lineTo(x - s * 0.11, headY - s * 0.12);
  ctx.lineTo(x - s * 0.18, headY + s * 0.02);
  ctx.stroke();
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.11, headY - s * 0.12);
  ctx.lineTo(x - s * 0.25, headY - s * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.09, headY + s * 0.1);
  ctx.lineTo(x - s * 0.2, headY + s * 0.16);
  ctx.stroke();
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, headY - s * 0.02);
  ctx.lineTo(x - s * 0.28, headY + s * 0.04);
  ctx.stroke();
  ctx.strokeStyle = "rgba(150, 140, 130, 0.3)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.038, headY - s * 0.24);
  ctx.lineTo(x - s * 0.108, headY - s * 0.11);
  ctx.stroke();

  // Small stone chip protruding from left jaw
  ctx.fillStyle = "#686058";
  ctx.beginPath();
  ctx.moveTo(x - headW * 0.85, headY + headH * 0.3);
  ctx.lineTo(x - headW * 1, headY + headH * 0.45);
  ctx.lineTo(x - headW * 0.9, headY + headH * 0.6);
  ctx.lineTo(x - headW * 0.7, headY + headH * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(30, 25, 18, 0.35)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Fluffy right cheek (bezier puff)
  const cG = ctx.createRadialGradient(
    x + s * 0.16,
    headY + s * 0.06,
    s * 0.02,
    x + s * 0.16,
    headY + s * 0.06,
    s * 0.13
  );
  cG.addColorStop(0, "#fff8e8");
  cG.addColorStop(0.5, "#f5deb3");
  cG.addColorStop(1, "#e0c8a0");
  ctx.fillStyle = cG;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.06, headY + 0);
  ctx.bezierCurveTo(
    x + s * 0.14,
    headY - s * 0.06,
    x + s * 0.26,
    headY - s * 0.02,
    x + s * 0.27,
    headY + s * 0.06
  );
  ctx.bezierCurveTo(
    x + s * 0.28,
    headY + s * 0.14,
    x + s * 0.2,
    headY + s * 0.18,
    x + s * 0.1,
    headY + s * 0.15
  );
  ctx.bezierCurveTo(
    x + s * 0.05,
    headY + s * 0.12,
    x + s * 0.04,
    headY + s * 0.05,
    x + s * 0.06,
    headY + 0
  );
  ctx.closePath();
  ctx.fill();

  // Stone cheek detail (left - angular slab)
  ctx.fillStyle = "rgba(100, 90, 80, 0.25)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, headY + 0);
  ctx.lineTo(x - s * 0.18, headY - s * 0.02);
  ctx.lineTo(x - s * 0.25, headY + s * 0.06);
  ctx.lineTo(x - s * 0.22, headY + s * 0.14);
  ctx.lineTo(x - s * 0.12, headY + s * 0.15);
  ctx.closePath();
  ctx.fill();

  // Ears
  drawSquirrelEar(ctx, x, headY, s, 1, zoom);
  drawGargoyleEar(ctx, x, headY, s, zoom);

  // Muzzle (protruding snout — more animalistic)
  const mG = ctx.createRadialGradient(
    x,
    headY + s * 0.12,
    s * 0.02,
    x,
    headY + s * 0.12,
    s * 0.16
  );
  mG.addColorStop(0, "#f0e0c8");
  mG.addColorStop(0.4, "#dccab0");
  mG.addColorStop(0.7, "#c8b8a0");
  mG.addColorStop(1, "#a89880");
  ctx.fillStyle = mG;
  ctx.beginPath();
  // Wider, more protruding snout shape
  ctx.moveTo(x - s * 0.15, headY + s * 0.04);
  ctx.bezierCurveTo(
    x - s * 0.17,
    headY - s * 0.01,
    x - s * 0.08,
    headY - s * 0.04,
    x,
    headY - s * 0.02
  );
  ctx.bezierCurveTo(
    x + s * 0.08,
    headY - s * 0.04,
    x + s * 0.17,
    headY - s * 0.01,
    x + s * 0.15,
    headY + s * 0.04
  );
  ctx.bezierCurveTo(
    x + s * 0.18,
    headY + s * 0.12,
    x + s * 0.14,
    headY + s * 0.22,
    x + s * 0.06,
    headY + s * 0.26
  );
  ctx.lineTo(x, headY + s * 0.28);
  ctx.lineTo(x - s * 0.06, headY + s * 0.26);
  ctx.bezierCurveTo(
    x - s * 0.14,
    headY + s * 0.22,
    x - s * 0.18,
    headY + s * 0.12,
    x - s * 0.15,
    headY + s * 0.04
  );
  ctx.closePath();
  ctx.fill();
  // Muzzle ridge line (bridge of nose)
  ctx.strokeStyle = "rgba(80, 60, 40, 0.25)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, headY - s * 0.02);
  ctx.lineTo(x, headY + s * 0.08);
  ctx.stroke();
  // Raccoon mask marking (dark fur around eyes extending to muzzle)
  ctx.fillStyle = "rgba(40, 25, 10, 0.3)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, headY - s * 0.1);
  ctx.bezierCurveTo(
    x - s * 0.14,
    headY - s * 0.15,
    x - s * 0.04,
    headY - s * 0.06,
    x,
    headY - s * 0.04
  );
  ctx.bezierCurveTo(
    x + s * 0.04,
    headY - s * 0.06,
    x + s * 0.14,
    headY - s * 0.15,
    x + s * 0.22,
    headY - s * 0.1
  );
  ctx.bezierCurveTo(
    x + s * 0.2,
    headY + s * 0.02,
    x + s * 0.1,
    headY + s * 0.04,
    x,
    headY + s * 0.02
  );
  ctx.bezierCurveTo(
    x - s * 0.1,
    headY + s * 0.04,
    x - s * 0.2,
    headY + s * 0.02,
    x - s * 0.22,
    headY - s * 0.1
  );
  ctx.closePath();
  ctx.fill();

  // Eyes
  drawRightEye(ctx, x, headY, s, zoom, isAttacking, attackIntensity);
  drawGemstoneLeftEye(
    ctx,
    x,
    headY,
    s,
    time,
    zoom,
    isAttacking,
    attackIntensity,
    gemPulse
  );

  // Eyebrows (thicker, angrier)
  ctx.lineCap = "round";
  const browAnger = isAttacking ? s * 0.045 : s * 0.018;
  ctx.strokeStyle = "#4a3008";
  ctx.lineWidth = 2.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.24, headY - s * 0.1);
  ctx.quadraticCurveTo(
    x + s * 0.14,
    headY - s * 0.17 - browAnger,
    x + s * 0.04,
    headY - s * 0.11
  );
  ctx.stroke();
  ctx.strokeStyle = "#3a3430";
  ctx.lineWidth = 3.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.24, headY - s * 0.09);
  ctx.quadraticCurveTo(
    x - s * 0.14,
    headY - s * 0.18 - browAnger,
    x - s * 0.04,
    headY - s * 0.11
  );
  ctx.stroke();

  // Nose (larger, more prominent)
  const nG = ctx.createRadialGradient(
    x,
    headY + s * 0.1,
    0,
    x,
    headY + s * 0.1,
    s * 0.055
  );
  nG.addColorStop(0, "#3a1a0a");
  nG.addColorStop(0.5, "#2a0a00");
  nG.addColorStop(1, "#1a0500");
  ctx.fillStyle = nG;
  ctx.beginPath();
  ctx.ellipse(x, headY + s * 0.1, s * 0.055, s * 0.042, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "rgba(100, 70, 50, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    x - s * 0.012,
    headY + s * 0.085,
    s * 0.02,
    s * 0.014,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Nostrils
  ctx.fillStyle = "#1a0500";
  ctx.beginPath();
  ctx.ellipse(
    x - s * 0.022,
    headY + s * 0.108,
    s * 0.012,
    s * 0.008,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + s * 0.022,
    headY + s * 0.108,
    s * 0.012,
    s * 0.008,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Whiskers (both sides — long, animated)
  ctx.strokeStyle = "#4a3a20";
  ctx.lineWidth = 0.9 * zoom;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.55;
  for (let side = -1; side <= 1; side += 2) {
    for (let w = 0; w < 3; w++) {
      const ww = Math.sin(time * 3.5 + w * 0.5 + side * 0.8) * s * 0.015;
      const spread = (w - 1) * s * 0.028;
      ctx.beginPath();
      ctx.moveTo(x + side * s * 0.12, headY + s * 0.11 + spread);
      ctx.quadraticCurveTo(
        x + side * s * 0.22 + ww,
        headY + s * 0.1 + spread * 0.6,
        x + side * s * 0.34 + ww,
        headY + s * 0.09 + spread * 1.4
      );
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Mouth & Fangs
  if (isAttacking) {
    // Open snarling mouth
    ctx.fillStyle = "#1a0500";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.09, headY + s * 0.16);
    ctx.bezierCurveTo(
      x - s * 0.06,
      headY + s * 0.14,
      x + s * 0.06,
      headY + s * 0.14,
      x + s * 0.09,
      headY + s * 0.16
    );
    ctx.bezierCurveTo(
      x + s * 0.08,
      headY + s * 0.24,
      x + s * 0.04,
      headY + s * 0.27,
      x,
      headY + s * 0.28
    );
    ctx.bezierCurveTo(
      x - s * 0.04,
      headY + s * 0.27,
      x - s * 0.08,
      headY + s * 0.24,
      x - s * 0.09,
      headY + s * 0.16
    );
    ctx.closePath();
    ctx.fill();
    // Tongue
    ctx.fillStyle = "#8a2020";
    ctx.beginPath();
    ctx.ellipse(x, headY + s * 0.22, s * 0.035, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    // Upper fangs (4 teeth)
    ctx.fillStyle = "#fffff0";
    const fangPositions = [-0.06, -0.025, 0.025, 0.06];
    const fangLengths = [0.065, 0.04, 0.04, 0.065];
    for (let f = 0; f < 4; f++) {
      const fx = x + fangPositions[f] * s;
      const fl = fangLengths[f] * s * (0.6 + attackIntensity * 0.4);
      ctx.beginPath();
      ctx.moveTo(fx - s * 0.01, headY + s * 0.155);
      ctx.lineTo(fx, headY + s * 0.155 + fl);
      ctx.lineTo(fx + s * 0.01, headY + s * 0.155);
      ctx.closePath();
      ctx.fill();
    }
    // Lower fangs (smaller, 2)
    for (let f = -1; f <= 1; f += 2) {
      const fx = x + f * s * 0.04;
      ctx.beginPath();
      ctx.moveTo(fx - s * 0.008, headY + s * 0.26);
      ctx.lineTo(fx, headY + s * 0.26 - s * 0.035 * attackIntensity);
      ctx.lineTo(fx + s * 0.008, headY + s * 0.26);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Closed snarl — lips curled, showing small fangs
    ctx.fillStyle = "#1a0500";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.07, headY + s * 0.17);
    ctx.bezierCurveTo(
      x - s * 0.04,
      headY + s * 0.15,
      x + s * 0.04,
      headY + s * 0.15,
      x + s * 0.07,
      headY + s * 0.17
    );
    ctx.bezierCurveTo(
      x + s * 0.05,
      headY + s * 0.2,
      x - s * 0.05,
      headY + s * 0.2,
      x - s * 0.07,
      headY + s * 0.17
    );
    ctx.closePath();
    ctx.fill();
    // Small idle fangs peeking out
    ctx.fillStyle = "#fffff0";
    for (let f = -1; f <= 1; f += 2) {
      ctx.beginPath();
      ctx.moveTo(x + f * s * 0.055, headY + s * 0.165);
      ctx.lineTo(x + f * s * 0.048, headY + s * 0.2);
      ctx.lineTo(x + f * s * 0.062, headY + s * 0.165);
      ctx.closePath();
      ctx.fill();
    }
    // Lip line
    ctx.strokeStyle = "#3a1a0a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.07, headY + s * 0.17);
    ctx.bezierCurveTo(
      x - s * 0.03,
      headY + s * 0.19,
      x + s * 0.03,
      headY + s * 0.19,
      x + s * 0.07,
      headY + s * 0.17
    );
    ctx.stroke();
  }

  // Chin tuft / ruff of fur under jaw
  ctx.fillStyle = "#e0c890";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.06, headY + s * 0.26);
  ctx.bezierCurveTo(
    x - s * 0.04,
    headY + s * 0.32,
    x + s * 0.04,
    headY + s * 0.32,
    x + s * 0.06,
    headY + s * 0.26
  );
  ctx.bezierCurveTo(
    x + s * 0.03,
    headY + s * 0.28,
    x - s * 0.03,
    headY + s * 0.28,
    x - s * 0.06,
    headY + s * 0.26
  );
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSquirrelEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
  side: number,
  zoom: number
) {
  const earX = x + side * s * 0.25;
  const earY = headY - s * 0.25;

  ctx.fillStyle = "#956818";
  ctx.beginPath();
  ctx.ellipse(earX, earY, s * 0.1, s * 0.16, side * 0.35, 0, Math.PI * 2);
  ctx.fill();

  const inner = ctx.createRadialGradient(
    earX,
    earY + s * 0.02,
    0,
    earX,
    earY + s * 0.02,
    s * 0.1
  );
  inner.addColorStop(0, "#f5d0b8");
  inner.addColorStop(0.7, "#d4a040");
  inner.addColorStop(1, "#b08020");
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.ellipse(
    earX,
    earY + s * 0.02,
    s * 0.068,
    s * 0.12,
    side * 0.35,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Tufts (more elaborate)
  ctx.fillStyle = "#c0a040";
  ctx.beginPath();
  ctx.moveTo(earX - side * s * 0.01, earY - s * 0.14);
  ctx.lineTo(earX + side * s * 0.02, earY - s * 0.25);
  ctx.lineTo(earX + side * s * 0.04, earY - s * 0.22);
  ctx.lineTo(earX + side * s * 0.05, earY - s * 0.28);
  ctx.lineTo(earX + side * s * 0.06, earY - s * 0.24);
  ctx.lineTo(earX + side * s * 0.04, earY - s * 0.12);
  ctx.closePath();
  ctx.fill();
  // Secondary tuft
  ctx.fillStyle = "#a88830";
  ctx.beginPath();
  ctx.moveTo(earX + side * s * 0.01, earY - s * 0.12);
  ctx.lineTo(earX + side * s * 0.025, earY - s * 0.2);
  ctx.lineTo(earX + side * s * 0.04, earY - s * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawGargoyleEar(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
  zoom: number
) {
  const earX = x - s * 0.25;
  const earY = headY - s * 0.28;

  const hG = ctx.createLinearGradient(
    earX,
    earY + s * 0.12,
    earX,
    earY - s * 0.18
  );
  hG.addColorStop(0, "#787068");
  hG.addColorStop(0.5, "#605850");
  hG.addColorStop(1, "#484040");
  ctx.fillStyle = hG;
  ctx.beginPath();
  ctx.moveTo(earX + s * 0.07, headY - s * 0.16);
  ctx.lineTo(earX + s * 0.02, earY - s * 0.14);
  ctx.lineTo(earX - s * 0.05, earY - s * 0.1);
  ctx.lineTo(earX - s * 0.08, headY - s * 0.12);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = "rgba(30, 25, 20, 0.45)";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Crack
  ctx.strokeStyle = "rgba(30, 25, 20, 0.5)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(earX + s * 0.03, headY - s * 0.18);
  ctx.lineTo(earX - s * 0.02, earY - s * 0.05);
  ctx.stroke();

  // Highlight
  ctx.strokeStyle = "rgba(170, 160, 150, 0.35)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(earX + s * 0.065, headY - s * 0.16);
  ctx.lineTo(earX + s * 0.015, earY - s * 0.13);
  ctx.stroke();
}

function drawRightEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number
) {
  const eyeX = x + s * 0.12;
  const eyeY = headY - s * 0.02;
  const sc = isAttacking ? 1.15 : 1;

  const wg = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.1 * sc);
  wg.addColorStop(0, "#ffffff");
  wg.addColorStop(0.7, "#f8f8f0");
  wg.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, s * 0.1 * sc, s * 0.11 * sc, 0.1, 0, Math.PI * 2);
  ctx.fill();

  const irisColor = isAttacking
    ? `rgba(200, 140, 30, ${0.85 + attackIntensity * 0.15})`
    : "#b08020";
  if (isAttacking) {
    ctx.shadowColor = "#ffa000";
    ctx.shadowBlur = 7 * zoom;
  }
  ctx.fillStyle = irisColor;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.06 * sc, 0, Math.PI * 2);
  ctx.fill();

  // Inner iris ring
  ctx.fillStyle = isAttacking ? "#c0a010" : "#907018";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.04 * sc, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#1a1a1a";
  if (isAttacking) {
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, s * 0.015, s * 0.045 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.028, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(eyeX - s * 0.028, eyeY - s * 0.028, s * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeX + s * 0.016, eyeY + s * 0.012, s * 0.009, 0, Math.PI * 2);
  ctx.fill();
}

function drawGemstoneLeftEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  s: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  gemPulse: number
) {
  const eyeX = x - s * 0.12;
  const eyeY = headY - s * 0.02;
  const sc = isAttacking ? 1.15 : 1;

  // Stone socket
  const sG = ctx.createRadialGradient(
    eyeX,
    eyeY,
    s * 0.04,
    eyeX,
    eyeY,
    s * 0.12 * sc
  );
  sG.addColorStop(0, "#484040");
  sG.addColorStop(0.6, "#3a3434");
  sG.addColorStop(1, "#2a2424");
  ctx.fillStyle = sG;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, s * 0.11 * sc, s * 0.12 * sc, -0.1, 0, Math.PI * 2);
  ctx.fill();

  const glowI = isAttacking ? 1 + attackIntensity * 0.5 : gemPulse;
  ctx.shadowColor = "#00e0ff";
  ctx.shadowBlur = 12 * zoom * glowI;

  const gO = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.08 * sc);
  gO.addColorStop(0, "#80ffff");
  gO.addColorStop(0.3, "#40d0e0");
  gO.addColorStop(0.6, "#00a0c0");
  gO.addColorStop(1, "#006080");
  ctx.fillStyle = gO;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.08 * sc, 0, Math.PI * 2);
  ctx.fill();

  // Facets
  ctx.fillStyle = `rgba(180, 255, 255, ${0.4 + gemPulse * 0.25})`;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + time * 0.8;
    const r1 = s * 0.075 * sc;
    const r2 = s * 0.028 * sc;
    const px1 = eyeX + Math.cos(a) * r1;
    const py1 = eyeY + Math.sin(a) * r1;
    const px2 = eyeX + Math.cos(a + Math.PI / 6) * r2;
    const py2 = eyeY + Math.sin(a + Math.PI / 6) * r2;
    if (i === 0) {
      ctx.moveTo(px1, py1);
    } else {
      ctx.lineTo(px1, py1);
    }
    ctx.lineTo(px2, py2);
  }
  ctx.closePath();
  ctx.fill();

  // Core
  ctx.fillStyle = `rgba(200, 255, 255, ${0.6 + gemPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.028 * sc, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.2;
  ctx.beginPath();
  ctx.arc(eyeX - s * 0.022, eyeY - s * 0.022, s * 0.016, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.shadowBlur = 0;
}

// ─── IDLE STONE TOSS ────────────────────────────────────────────────────────

function drawIdleStoneToss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hop: number,
  tossX: number,
  tossY: number,
  time: number,
  zoom: number,
  isAttacking: boolean
) {
  if (isAttacking) {
    return;
  }

  const pawBaseX = x + s * 0.38;
  const pawBaseY = y - s * 0.35 - hop;
  const stoneX = pawBaseX + tossX;
  const stoneY = pawBaseY + tossY;
  const stoneRot = time * 2.2;
  const r = s * 0.15;

  // Ground shadow
  const shadowScale = 1 + (-tossY / (s * 0.65)) * 0.3;
  const shadowAlpha = 0.25 - (-tossY / (s * 0.65)) * 0.12;
  ctx.fillStyle = `rgba(0,0,0,${Math.max(shadowAlpha, 0.06)})`;
  ctx.beginPath();
  ctx.ellipse(
    pawBaseX + tossX * 0.5,
    y + s * 0.48,
    s * 0.12 * shadowScale,
    s * 0.035 * shadowScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.save();
  ctx.translate(stoneX, stoneY);
  ctx.rotate(stoneRot);

  const sg = ctx.createRadialGradient(
    -r * 0.15,
    -r * 0.15,
    r * 0.05,
    0,
    0,
    r * 1.1
  );
  sg.addColorStop(0, "#b0a898");
  sg.addColorStop(0.25, "#908878");
  sg.addColorStop(0.5, "#787068");
  sg.addColorStop(0.75, "#605850");
  sg.addColorStop(1, "#484038");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, -r * 0.25);
  ctx.lineTo(-r * 0.55, -r * 0.82);
  ctx.lineTo(-r * 0.1, -r * 0.92);
  ctx.lineTo(r * 0.4, -r * 0.78);
  ctx.lineTo(r * 0.82, -r * 0.4);
  ctx.lineTo(r * 0.9, r * 0.15);
  ctx.lineTo(r * 0.65, r * 0.7);
  ctx.lineTo(r * 0.1, r * 0.88);
  ctx.lineTo(-r * 0.45, r * 0.75);
  ctx.lineTo(-r * 0.85, r * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(30, 25, 18, 0.5)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.stroke();

  // Cracks
  ctx.strokeStyle = "rgba(25, 18, 10, 0.6)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(-r * 0.65, -r * 0.5);
  ctx.lineTo(-r * 0.1, r * 0.05);
  ctx.lineTo(r * 0.4, r * 0.5);
  ctx.stroke();
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-r * 0.1, r * 0.05);
  ctx.lineTo(r * 0.35, -r * 0.4);
  ctx.stroke();
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(r * 0.15, r * 0.25);
  ctx.lineTo(r * 0.65, r * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r * 0.35, -r * 0.2);
  ctx.lineTo(-r * 0.7, r * 0.1);
  ctx.stroke();

  // Highlights
  ctx.strokeStyle = "rgba(180, 170, 160, 0.25)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(-r * 0.63, -r * 0.48);
  ctx.lineTo(-r * 0.08, r * 0.03);
  ctx.stroke();

  const hlG = ctx.createRadialGradient(
    -r * 0.3,
    -r * 0.45,
    0,
    -r * 0.3,
    -r * 0.45,
    r * 0.5
  );
  hlG.addColorStop(0, "rgba(220, 210, 200, 0.4)");
  hlG.addColorStop(0.5, "rgba(200, 190, 180, 0.15)");
  hlG.addColorStop(1, "rgba(200, 190, 180, 0)");
  ctx.fillStyle = hlG;
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.45, r * 0.4, r * 0.3, -0.4, 0, Math.PI * 2);
  ctx.fill();

  const shG = ctx.createRadialGradient(
    r * 0.3,
    r * 0.35,
    0,
    r * 0.3,
    r * 0.35,
    r * 0.55
  );
  shG.addColorStop(0, "rgba(30, 25, 20, 0.25)");
  shG.addColorStop(1, "rgba(30, 25, 20, 0)");
  ctx.fillStyle = shG;
  ctx.beginPath();
  ctx.ellipse(r * 0.3, r * 0.35, r * 0.45, r * 0.35, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Speckles
  ctx.fillStyle = "rgba(60, 50, 40, 0.3)";
  const speckles = [
    [-0.4, 0.3],
    [0.5, -0.3],
    [-0.15, -0.55],
    [0.25, 0.55],
    [-0.55, -0.05],
    [0.6, -0.05],
    [0, -0.7],
    [-0.3, 0.55],
  ];
  for (const [sx, sy] of speckles) {
    ctx.beginPath();
    ctx.arc(sx * r, sy * r, r * 0.032, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── GROUND CRACKS ──────────────────────────────────────────────────────────

function drawGroundCracks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  attackIntensity: number,
  zoom: number
) {
  ctx.strokeStyle = `rgba(100, 70, 30, ${0.5 * attackIntensity})`;
  ctx.lineWidth = 2 * zoom;
  for (let c = 0; c < 6; c++) {
    const a = (c * Math.PI * 2) / 6 + time * 0.4;
    const len = s * (0.28 + attackIntensity * 0.28);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * s * 0.14, y + s * 0.48);
    ctx.lineTo(
      x + Math.cos(a) * len,
      y + s * 0.48 + Math.sin(a + 0.3) * s * 0.07
    );
    ctx.stroke();
  }
}
