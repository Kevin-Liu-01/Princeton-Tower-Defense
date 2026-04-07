import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

// ─── DIVINE COMMAND ATTACK RINGS (split into back/front halves) ─────────────

type RingHalf = "back" | "front";

function drawDivineCommandRings(
  ctx: CanvasRenderingContext2D,
  half: RingHalf,
  x: number,
  ringCenterY: number,
  size: number,
  zoom: number,
  time: number,
  commandPose: number
) {
  // back = top of ellipse (behind hero), front = bottom (in front of hero)
  const startAngle = half === "back" ? Math.PI : 0;
  const endAngle = half === "back" ? Math.PI * 2 : Math.PI;

  for (let ring = 0; ring < 5; ring++) {
    const ringRadius = size * (0.6 + ring * 0.2 + commandPose * 0.3);
    const ringAlpha = commandPose * (0.6 - ring * 0.1);

    ctx.strokeStyle = `rgba(255, 200, 100, ${ringAlpha})`;
    ctx.lineWidth = 3 * zoom;
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      ringCenterY,
      ringRadius,
      ringRadius * 0.45,
      0,
      startAngle,
      endAngle
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(255, 100, 50, ${ringAlpha * 0.8})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      ringCenterY,
      ringRadius * 0.92,
      ringRadius * 0.42,
      0,
      startAngle,
      endAngle
    );
    ctx.stroke();
  }

  // Spark particles and flame pillars only on the matching half
  for (let spark = 0; spark < 16; spark++) {
    const sparkAngle = (time * 5 + (spark * Math.PI * 2) / 16) % (Math.PI * 2);
    const inBack = sparkAngle > Math.PI;
    if ((half === "back") !== inBack) {
      continue;
    }

    const sparkDist = size * (0.65 + commandPose * 0.5);
    const sparkX = x + Math.cos(sparkAngle) * sparkDist;
    const sparkY = ringCenterY + Math.sin(sparkAngle) * sparkDist * 0.45;
    const sparkAlpha = commandPose * (0.8 + Math.sin(time * 10 + spark) * 0.2);

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

  for (let pillar = 0; pillar < 6; pillar++) {
    const pillarAngle = (pillar * Math.PI) / 3 + time * 2;
    const normalised =
      ((pillarAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const inBack = normalised > Math.PI;
    if ((half === "back") !== inBack) {
      continue;
    }

    const pillarDist = size * (0.5 + commandPose * 0.3);
    const pillarX = x + Math.cos(pillarAngle) * pillarDist;
    const pillarY = ringCenterY + Math.sin(pillarAngle) * pillarDist * 0.45;
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
  flamePulse: number
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
    gemPulse
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
      flamePulse
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
  _totalHeight: number,
  gapHalf: number,
  gemPulse: number,
  _isAttacking: boolean,
  _attackIntensity: number,
  _flamePulse: number
) {
  const shear = size * -0.1;

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

    const drawPlatePath = () => {
      ctx.beginPath();
      ctx.moveTo(innerX, innerTopY);
      ctx.lineTo(outerX, outerTopY);
      ctx.lineTo(outerX + side * size * 0.004, outerBotY);
      ctx.lineTo(innerX - side * size * 0.002, innerBotY);
      ctx.closePath();
    };

    // Blue-steel plate fill
    const plateG = ctx.createLinearGradient(
      innerX,
      innerTopY,
      outerX,
      outerBotY
    );
    if (side === -1) {
      plateG.addColorStop(0, "#4e5260");
      plateG.addColorStop(0.2, "#474b58");
      plateG.addColorStop(0.5, "#3e4250");
      plateG.addColorStop(0.8, "#353840");
      plateG.addColorStop(1, "#2a2e36");
    } else {
      plateG.addColorStop(0, "#2a2e36");
      plateG.addColorStop(0.2, "#353840");
      plateG.addColorStop(0.5, "#3e4250");
      plateG.addColorStop(0.8, "#474b58");
      plateG.addColorStop(1, "#4e5260");
    }
    ctx.fillStyle = plateG;
    drawPlatePath();
    ctx.fill();

    // Steel specular highlight along top edge
    ctx.strokeStyle = `rgba(140, 145, 165, ${0.14 + band * 0.015})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX + side * size * 0.005, innerTopY + size * 0.003);
    ctx.lineTo(outerX - side * size * 0.005, outerTopY + size * 0.003);
    ctx.stroke();

    // Black outline
    ctx.strokeStyle = "#0a0a0c";
    ctx.lineWidth = 1.4 * zoom;
    drawPlatePath();
    ctx.stroke();

    // Gold trim on bottom edge (angled)
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX - side * size * 0.002, innerBotY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.stroke();
    ctx.strokeStyle = `rgba(218, 180, 50, ${0.2 + gemPulse * 0.06})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX, innerBotY + size * 0.002);
    ctx.lineTo(outerX + side * size * 0.002, outerBotY + size * 0.002);
    ctx.stroke();

    // Dark gold accent on top edge
    ctx.strokeStyle = `rgba(154, 122, 24, ${0.25 + band * 0.03})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX + side * size * 0.005, innerTopY + size * 0.001);
    ctx.lineTo(outerX - side * size * 0.005, outerTopY + size * 0.001);
    ctx.stroke();

    // Gold rivet near outer edge
    const rivetT = 0.75;
    const rivetX = innerX + rivetT * (outerX - innerX);
    const rivetY =
      innerTopY + rivetT * (outerTopY - innerTopY) + bandHeight * 0.45;
    const rg = ctx.createRadialGradient(
      rivetX - size * 0.002,
      rivetY - size * 0.002,
      0,
      rivetX,
      rivetY,
      size * 0.008
    );
    rg.addColorStop(0, "#daa520");
    rg.addColorStop(0.5, "#b89025");
    rg.addColorStop(1, "#5a4508");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.006, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4a3508";
    ctx.lineWidth = 0.3 * zoom;
    ctx.stroke();

    // Inner rivet
    const rivetT2 = 0.3;
    const rivetX2 = innerX + rivetT2 * (outerX - innerX);
    const rivetY2 =
      innerTopY + rivetT2 * (outerTopY - innerTopY) + bandHeight * 0.45;
    const rg2 = ctx.createRadialGradient(
      rivetX2 - size * 0.001,
      rivetY2 - size * 0.001,
      0,
      rivetX2,
      rivetY2,
      size * 0.006
    );
    rg2.addColorStop(0, "#daa520");
    rg2.addColorStop(0.5, "#a07818");
    rg2.addColorStop(1, "#5a4508");
    ctx.fillStyle = rg2;
    ctx.beginPath();
    ctx.arc(rivetX2, rivetY2, size * 0.005, 0, Math.PI * 2);
    ctx.fill();

    // Crimson lacing between plates (except last plate)
    if (band < bandCount - 1) {
      const lacingCount = 2;
      for (let lc = 0; lc < lacingCount; lc++) {
        const lcT = (lc + 1) / (lacingCount + 1);
        const lcX = innerX + lcT * (outerX - innerX);
        const lcYinner = innerBotY - size * 0.004;
        const lcYouter = innerBotY + bandHeight * 0.15;
        ctx.strokeStyle = `rgba(140, 30, 30, ${0.45 + gemPulse * 0.1})`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(lcX, lcYinner);
        ctx.lineTo(lcX, lcYouter);
        ctx.stroke();
        ctx.strokeStyle = `rgba(200, 60, 60, ${0.2 + gemPulse * 0.06})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(lcX + size * 0.002, lcYinner + size * 0.003);
        ctx.lineTo(lcX + size * 0.002, lcYouter - size * 0.003);
        ctx.stroke();
      }
    }
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
  gemPulse: number
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
  gemPulse: number
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
    skirtTop - beltThick * 0.5 + size * 0.004
  );
  ctx.lineTo(
    x + beltHalfW - size * 0.01,
    skirtTop - beltThick * 0.5 + size * 0.004
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
    if (d === 0) {
      continue;
    }
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
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawArmorChain(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number,
  zoom: number,
  time: number,
  gemPulse: number,
  sag: number,
  linkCount: number
) {
  const midX = (x1 + x2) * 0.5;
  const midY = (y1 + y2) * 0.5;
  const sagAmt = sag + Math.sin(time * 2.2) * size * 0.003;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const perpX = len > 0 ? -dy / len : 0;
  const perpY = len > 0 ? dx / len : 1;

  ctx.strokeStyle = `rgba(200, 165, 50, ${0.45 + gemPulse * 0.12})`;
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX + perpX * sagAmt, midY + perpY * sagAmt, x2, y2);
  ctx.stroke();

  for (let i = 0; i <= linkCount; i++) {
    const t = i / linkCount;
    const sagT = 4 * t * (1 - t);
    const lx = x1 + t * dx + perpX * sagAmt * sagT;
    const ly = y1 + t * dy + perpY * sagAmt * sagT;

    const lg = ctx.createRadialGradient(
      lx - size * 0.002,
      ly - size * 0.002,
      0,
      lx,
      ly,
      size * 0.01
    );
    lg.addColorStop(0, "#ffe080");
    lg.addColorStop(0.5, "#daa520");
    lg.addColorStop(1, "#805010");
    ctx.fillStyle = lg;
    ctx.beginPath();
    const linkW = size * 0.009;
    const linkH = size * 0.006;
    const angle = i % 2 === 0 ? 0.35 : -0.35;
    ctx.ellipse(lx, ly, linkW, linkH, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#604008";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }

  for (let ep = 0; ep < 2; ep++) {
    const epX = ep === 0 ? x1 : x2;
    const epY = ep === 0 ? y1 : y2;
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(epX, epY, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#805010";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();
  }
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
  targetPos?: Position
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
      size * (1.1 + layerOffset * 0.25)
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
      size * (1 + layerOffset * 0.18),
      size * (0.65 + layerOffset * 0.12),
      0,
      0,
      Math.PI * 2
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

  // === DIVINE COMMAND BACK HALF (behind hero) ===
  if (isAttacking) {
    drawDivineCommandRings(
      ctx,
      "back",
      x,
      y + size * 0.45,
      size,
      zoom,
      time,
      commandPose
    );
  }

  // === LEGENDARY FLAME CAPE ===
  const capeWave = Math.sin(time * 3) * 0.15;
  const capeWave2 = Math.sin(time * 4 + 0.7) * 0.1;

  // Cape shadow on ground
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.72, size * 0.82, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cape inner glow layer (warm fire ambient)
  const capeGlowGrad = ctx.createLinearGradient(
    x,
    y - size * 0.2,
    x,
    y + size * 0.7
  );
  capeGlowGrad.addColorStop(0, "rgba(255, 120, 40, 0.25)");
  capeGlowGrad.addColorStop(0.4, "rgba(180, 40, 20, 0.15)");
  capeGlowGrad.addColorStop(1, "rgba(80, 10, 10, 0.08)");
  ctx.fillStyle = capeGlowGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y - size * 0.2);
  ctx.bezierCurveTo(
    x - size * 1 - capeWave * size,
    y + size * 0.2,
    x - size * 0.95 - capeWave2 * size,
    y + size * 0.5,
    x - size * 0.8,
    y + size * 0.72
  );
  ctx.lineTo(x + size * 0.8, y + size * 0.72);
  ctx.bezierCurveTo(
    x + size * 0.95 + capeWave2 * size,
    y + size * 0.5,
    x + size * 1 + capeWave * size,
    y + size * 0.2,
    x + size * 0.42,
    y - size * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // Cape main body — rich dark crimson with cross-gradient for depth
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.95,
    y,
    x + size * 0.95,
    y
  );
  capeGrad.addColorStop(0, "#2a0303");
  capeGrad.addColorStop(0.12, "#4a0606");
  capeGrad.addColorStop(0.3, "#7a0e0e");
  capeGrad.addColorStop(0.5, "#991515");
  capeGrad.addColorStop(0.7, "#7a0e0e");
  capeGrad.addColorStop(0.88, "#4a0606");
  capeGrad.addColorStop(1, "#2a0303");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.95 - capeWave * size,
    y + size * 0.15,
    x - size * 0.88 - capeWave2 * size,
    y + size * 0.48,
    x - size * 0.74,
    y + size * 0.68
  );
  ctx.lineTo(x + size * 0.74, y + size * 0.68);
  ctx.bezierCurveTo(
    x + size * 0.88 + capeWave2 * size,
    y + size * 0.48,
    x + size * 0.95 + capeWave * size,
    y + size * 0.15,
    x + size * 0.4,
    y - size * 0.22
  );
  ctx.closePath();
  ctx.fill();

  // Vertical depth shading (darker at bottom)
  const capeVGrad = ctx.createLinearGradient(
    x,
    y - size * 0.2,
    x,
    y + size * 0.7
  );
  capeVGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  capeVGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.15)");
  capeVGrad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
  ctx.fillStyle = capeVGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.95 - capeWave * size,
    y + size * 0.15,
    x - size * 0.88 - capeWave2 * size,
    y + size * 0.48,
    x - size * 0.74,
    y + size * 0.68
  );
  ctx.lineTo(x + size * 0.74, y + size * 0.68);
  ctx.bezierCurveTo(
    x + size * 0.88 + capeWave2 * size,
    y + size * 0.48,
    x + size * 0.95 + capeWave * size,
    y + size * 0.15,
    x + size * 0.4,
    y - size * 0.22
  );
  ctx.closePath();
  ctx.fill();

  // Fabric fold lines (subtle vertical drapes)
  ctx.globalAlpha = 0.12;
  for (let fold = -3; fold <= 3; fold++) {
    const foldX = x + fold * size * 0.16;
    const foldWave = Math.sin(time * 2.5 + fold * 1.2) * size * 0.01;
    ctx.strokeStyle = fold < 0 ? "#000" : "#aa6060";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(foldX, y - size * 0.1);
    ctx.bezierCurveTo(
      foldX + foldWave,
      y + size * 0.15,
      foldX - foldWave,
      y + size * 0.4,
      foldX + fold * size * 0.03,
      y + size * 0.65
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
  ctx.moveTo(x - size * 0.74, y + size * 0.68);
  for (let flame = 0; flame < 20; flame++) {
    const flameX = x - size * 0.74 + flame * size * 0.074;
    const flameWave = Math.sin(time * 6 + flame * 0.8) * size * 0.035;
    const flameHeight =
      Math.sin(time * 5 + flame * 0.5) * size * 0.018 + size * 0.02;
    ctx.lineTo(
      flameX + size * 0.037,
      y + size * 0.68 + flameHeight + flameWave
    );
    ctx.lineTo(flameX + size * 0.074, y + size * 0.68);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Cape gold dragon embroidery (more ornate)
  ctx.strokeStyle = "#9a7a18";
  ctx.lineWidth = 1 * zoom;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.08);
  ctx.quadraticCurveTo(
    x - size * 0.22,
    y + size * 0.2,
    x - size * 0.15,
    y + size * 0.35
  );
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y + size * 0.4,
    x - size * 0.22,
    y + size * 0.5
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.08);
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y + size * 0.2,
    x + size * 0.15,
    y + size * 0.35
  );
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y + size * 0.4,
    x + size * 0.22,
    y + size * 0.5
  );
  ctx.stroke();
  // Scrollwork arcs
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.12,
      y + size * 0.25,
      size * 0.05,
      0,
      Math.PI * 1.2
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Cape gold edge trim (deeper gold)
  ctx.strokeStyle = "#9a7a18";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.74, y + size * 0.66);
  ctx.bezierCurveTo(
    x - size * 0.88 - capeWave2 * size,
    y + size * 0.46,
    x - size * 0.95 - capeWave * size,
    y + size * 0.13,
    x - size * 0.4,
    y - size * 0.24
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.74, y + size * 0.66);
  ctx.bezierCurveTo(
    x + size * 0.88 + capeWave2 * size,
    y + size * 0.46,
    x + size * 0.95 + capeWave * size,
    y + size * 0.13,
    x + size * 0.4,
    y - size * 0.24
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

    // Base fill — burnished dark steel with blue-steel undertones
    const armorG = ctx.createLinearGradient(
      x - size * 0.5,
      y - size * 0.35,
      x + size * 0.35,
      y + size * 0.5
    );
    armorG.addColorStop(0, "#2e3036");
    armorG.addColorStop(0.15, "#3c3e46");
    armorG.addColorStop(0.35, "#484c56");
    armorG.addColorStop(0.55, "#404450");
    armorG.addColorStop(0.75, "#33363e");
    armorG.addColorStop(1, "#1c1e24");
    ctx.fillStyle = armorG;
    drawArmorPath();
    ctx.fill();

    // Specular highlight on upper-left chest (cool steel)
    const specAG = ctx.createRadialGradient(
      x - size * 0.12,
      y - size * 0.2,
      0,
      x - size * 0.1,
      y - size * 0.15,
      size * 0.25
    );
    specAG.addColorStop(0, "rgba(145, 150, 175, 0.22)");
    specAG.addColorStop(0.5, "rgba(90, 95, 115, 0.09)");
    specAG.addColorStop(1, "rgba(50, 55, 70, 0)");
    ctx.fillStyle = specAG;
    drawArmorPath();
    ctx.fill();

    // Samurai-style horizontal plate armor (do) — overlapping bands
    const doPlates = 6;
    const doTopY = y - size * 0.26;
    const doBottomY = y + size * 0.5;
    const doStep = (doBottomY - doTopY) / doPlates;
    const doPlateH = doStep * 1.12;

    ctx.save();
    drawArmorPath();
    ctx.clip();
    for (let pi = 0; pi < doPlates; pi++) {
      const doBotY = doBottomY - pi * doStep;
      const doTopPlateY = doBotY - doPlateH;
      const doMidY = (doTopPlateY + doBotY) * 0.5;
      const narrowT = pi / (doPlates - 1);
      const doW = size * (0.52 - narrowT * 0.06);

      const dpG = ctx.createLinearGradient(
        x - doW,
        doTopPlateY,
        x + doW,
        doBotY
      );
      dpG.addColorStop(0, "#4e5260");
      dpG.addColorStop(0.15, "#474b58");
      dpG.addColorStop(0.4, "#3e4250");
      dpG.addColorStop(0.7, "#353840");
      dpG.addColorStop(1, "#2a2e36");
      ctx.fillStyle = dpG;
      ctx.beginPath();
      ctx.rect(x - doW, doTopPlateY, doW * 2, doPlateH);
      ctx.fill();

      const dpSpec = ctx.createLinearGradient(
        x,
        doTopPlateY,
        x,
        doTopPlateY + doPlateH * 0.4
      );
      dpSpec.addColorStop(0, `rgba(145, 150, 175, ${0.14 - pi * 0.01})`);
      dpSpec.addColorStop(0.5, `rgba(100, 105, 125, ${0.06 - pi * 0.005})`);
      dpSpec.addColorStop(1, "rgba(60, 65, 80, 0)");
      ctx.fillStyle = dpSpec;
      ctx.beginPath();
      ctx.rect(x - doW, doTopPlateY, doW * 2, doPlateH * 0.5);
      ctx.fill();

      ctx.strokeStyle = "rgba(8, 8, 12, 0.6)";
      ctx.lineWidth = 1.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - doW, doBotY);
      ctx.lineTo(x + doW, doBotY);
      ctx.stroke();

      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - doW + size * 0.01, doBotY - size * 0.002);
      ctx.lineTo(x + doW - size * 0.01, doBotY - size * 0.002);
      ctx.stroke();
      ctx.strokeStyle = `rgba(218, 180, 50, ${0.2 + gemPulse * 0.06})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - doW + size * 0.03, doBotY + size * 0.003);
      ctx.lineTo(x + doW - size * 0.03, doBotY + size * 0.003);
      ctx.stroke();

      ctx.strokeStyle = `rgba(154, 122, 24, ${0.25 + pi * 0.03})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - doW + size * 0.02, doTopPlateY + size * 0.002);
      ctx.lineTo(x + doW - size * 0.02, doTopPlateY + size * 0.002);
      ctx.stroke();

      ctx.strokeStyle = `rgba(140, 145, 165, ${0.12 + pi * 0.015})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - doW + size * 0.03, doTopPlateY + size * 0.005);
      ctx.lineTo(x + doW - size * 0.03, doTopPlateY + size * 0.005);
      ctx.stroke();

      for (let re = -1; re <= 1; re += 2) {
        const rvX = x + re * (doW - size * 0.04);
        const rvY = doMidY;
        const rvG = ctx.createRadialGradient(
          rvX - size * 0.002,
          rvY - size * 0.002,
          0,
          rvX,
          rvY,
          size * 0.008
        );
        rvG.addColorStop(0, "#daa520");
        rvG.addColorStop(0.5, "#b89025");
        rvG.addColorStop(1, "#5a4508");
        ctx.fillStyle = rvG;
        ctx.beginPath();
        ctx.arc(rvX, rvY, size * 0.006, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4a3508";
        ctx.lineWidth = 0.3 * zoom;
        ctx.stroke();
      }

      if (pi < 3) {
        const scaleCols = 4 + (2 - pi);
        for (let sc = 0; sc < scaleCols; sc++) {
          const scT = (sc + 0.5) / scaleCols;
          const scX = x + (scT - 0.5) * doW * 1.6;
          ctx.fillStyle = `rgba(55, 58, 66, ${0.22 + pi * 0.03})`;
          ctx.beginPath();
          ctx.ellipse(
            scX,
            doMidY,
            size * 0.028,
            size * 0.015,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.strokeStyle = `rgba(154, 122, 24, ${0.1 + pi * 0.02})`;
          ctx.lineWidth = 0.3 * zoom;
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Gold V-border (outer)
    ctx.strokeStyle = "#5a4508";
    ctx.lineWidth = 5.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.39, y - size * 0.19);
    ctx.lineTo(x, y + size * 0.19);
    ctx.lineTo(x + size * 0.39, y - size * 0.19);
    ctx.stroke();
    // Crimson V-accent with glow
    ctx.shadowColor = "#ff3333";
    ctx.shadowBlur = 6 * zoom * gemPulse;
    const vAccG = ctx.createLinearGradient(
      x - size * 0.4,
      y - size * 0.2,
      x,
      y + size * 0.2
    );
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
    // Inner gold V-highlight
    ctx.strokeStyle = `rgba(218, 168, 32, ${0.35 + gemPulse * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.36, y - size * 0.17);
    ctx.lineTo(x, y + size * 0.16);
    ctx.lineTo(x + size * 0.36, y - size * 0.17);
    ctx.stroke();
    // Outer gold V-highlight
    ctx.strokeStyle = `rgba(154, 122, 24, ${0.28 + gemPulse * 0.1})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y - size * 0.19);
    ctx.lineTo(x, y + size * 0.2);
    ctx.lineTo(x + size * 0.4, y - size * 0.19);
    ctx.stroke();

    // Gold filigree neckline — triple-line with shimmer
    // Outer dark gold border
    ctx.strokeStyle = "#6a4a08";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.36, y - size * 0.215);
    ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.275, x, y - size * 0.345);
    ctx.quadraticCurveTo(
      x + size * 0.1,
      y - size * 0.275,
      x + size * 0.36,
      y - size * 0.215
    );
    ctx.stroke();
    // Main bright gold line
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y - size * 0.22);
    ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.28, x, y - size * 0.35);
    ctx.quadraticCurveTo(
      x + size * 0.1,
      y - size * 0.28,
      x + size * 0.35,
      y - size * 0.22
    );
    ctx.stroke();
    // Inner gold accent
    ctx.strokeStyle = `rgba(218, 168, 32, ${0.45 + gemPulse * 0.1})`;
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.33, y - size * 0.205);
    ctx.quadraticCurveTo(x - size * 0.09, y - size * 0.265, x, y - size * 0.33);
    ctx.quadraticCurveTo(
      x + size * 0.09,
      y - size * 0.265,
      x + size * 0.33,
      y - size * 0.205
    );
    ctx.stroke();
    // Shimmer highlight
    ctx.strokeStyle = `rgba(255, 230, 130, ${0.18 + gemPulse * 0.08})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 0.21);
    ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.26, x, y - size * 0.32);
    ctx.quadraticCurveTo(
      x + size * 0.08,
      y - size * 0.26,
      x + size * 0.3,
      y - size * 0.21
    );
    ctx.stroke();
    // Gold necklace pendants / diamond studs along neckline
    for (let nd = 0; nd < 5; nd++) {
      const ndt = (nd + 1) / 6;
      const ndx = x + (ndt - 0.5) * size * 0.64;
      const ndy = y - size * 0.22 - Math.sin(ndt * Math.PI) * size * 0.12;
      ctx.fillStyle = `rgba(218, 165, 32, ${0.5 + gemPulse * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(ndx, ndy - size * 0.008);
      ctx.lineTo(ndx + size * 0.005, ndy);
      ctx.lineTo(ndx, ndy + size * 0.008);
      ctx.lineTo(ndx - size * 0.005, ndy);
      ctx.closePath();
      ctx.fill();
    }

    // Gold side edge trim — double line with bright highlight
    for (let side = -1; side <= 1; side += 2) {
      // Dark gold outer edge
      ctx.strokeStyle = "#6a4a08";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.32, y - size * 0.3);
      ctx.lineTo(x + side * size * 0.48, y - size * 0.05);
      ctx.lineTo(x + side * size * 0.4, y + size * 0.52);
      ctx.stroke();
      // Bright gold main trim
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.32, y - size * 0.3);
      ctx.lineTo(x + side * size * 0.48, y - size * 0.05);
      ctx.lineTo(x + side * size * 0.4, y + size * 0.52);
      ctx.stroke();
      // Inner gold shimmer line
      ctx.strokeStyle = `rgba(218, 168, 32, ${0.3 + gemPulse * 0.1})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.31, y - size * 0.29);
      ctx.lineTo(x + side * size * 0.47, y - size * 0.04);
      ctx.lineTo(x + side * size * 0.39, y + size * 0.5);
      ctx.stroke();
    }

    // Samurai-style crimson lacing (odoshi) between plates + decoration
    ctx.save();
    drawArmorPath();
    ctx.clip();

    // Vertical lacing columns connecting plates
    for (let lc = 0; lc < 5; lc++) {
      const lcX = x + (lc - 2) * size * 0.15;
      for (let pi = 0; pi < doPlates - 1; pi++) {
        const lcBotY = doBottomY - pi * doStep + size * 0.005;
        const lcTopY = doBottomY - (pi + 1) * doStep - size * 0.005;
        // Dark crimson cord
        ctx.strokeStyle = `rgba(140, 30, 30, ${0.45 + gemPulse * 0.1})`;
        ctx.lineWidth = 1.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(lcX, lcTopY);
        ctx.lineTo(lcX, lcBotY);
        ctx.stroke();
        // Bright crimson highlight
        ctx.strokeStyle = `rgba(200, 60, 60, ${0.22 + gemPulse * 0.08})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(lcX + size * 0.002, lcTopY + size * 0.005);
        ctx.lineTo(lcX + size * 0.002, lcBotY - size * 0.005);
        ctx.stroke();
        // Cross-lace knot at each junction
        const knotY = lcBotY - size * 0.005;
        ctx.strokeStyle = `rgba(160, 40, 40, ${0.35 + gemPulse * 0.08})`;
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(lcX - size * 0.008, knotY - size * 0.006);
        ctx.lineTo(lcX + size * 0.008, knotY + size * 0.006);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lcX + size * 0.008, knotY - size * 0.006);
        ctx.lineTo(lcX - size * 0.008, knotY + size * 0.006);
        ctx.stroke();
      }
    }

    // Gold filigree arcs on middle plates (indices 2-3)
    for (let pi = 2; pi <= 3; pi++) {
      const fgMidY = doBottomY - pi * doStep - doStep * 0.44;
      for (let sw = 0; sw < 2; sw++) {
        const swOff = (sw - 0.5) * size * 0.12;
        ctx.strokeStyle = `rgba(200, 160, 40, ${0.18 + sw * 0.04 + gemPulse * 0.05})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.arc(
          x + swOff,
          fgMidY,
          size * 0.03 + sw * size * 0.01,
          Math.PI * 0.15,
          Math.PI * 0.85
        );
        ctx.stroke();
      }
    }

    // Central vertical decorative cord (gold)
    ctx.strokeStyle = `rgba(154, 122, 24, ${0.3 + gemPulse * 0.08})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, doTopY);
    ctx.lineTo(x, doBottomY);
    ctx.stroke();
    ctx.strokeStyle = `rgba(218, 168, 32, ${0.16 + gemPulse * 0.06})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.003, doTopY + size * 0.02);
    ctx.lineTo(x - size * 0.003, doBottomY - size * 0.02);
    ctx.stroke();

    ctx.restore();

    // Armor border — black for contrast, gold inner trim, bright gold outer
    ctx.strokeStyle = "#0e0e0e";
    ctx.lineWidth = 3 * zoom;
    drawArmorPath();
    ctx.stroke();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.6 * zoom;
    drawArmorPath();
    ctx.stroke();
    ctx.strokeStyle = `rgba(218, 180, 50, ${0.25 + gemPulse * 0.08})`;
    ctx.lineWidth = 0.6 * zoom;
    drawArmorPath();
    ctx.stroke();

    // Central dragon emblem — elaborate with gold wings and prongs
    {
      const emX = x;
      const emY = y - size * 0.02;

      // Outer gold mandorla (larger backing)
      const outerEmbG = ctx.createRadialGradient(
        emX,
        emY - size * 0.02,
        0,
        emX,
        emY,
        size * 0.12
      );
      outerEmbG.addColorStop(0, "rgba(180, 140, 30, 0.35)");
      outerEmbG.addColorStop(0.5, "rgba(140, 110, 20, 0.2)");
      outerEmbG.addColorStop(1, "rgba(90, 70, 10, 0)");
      ctx.fillStyle = outerEmbG;
      ctx.beginPath();
      ctx.moveTo(emX, emY - size * 0.13);
      ctx.bezierCurveTo(
        emX - size * 0.1,
        emY - size * 0.08,
        emX - size * 0.09,
        emY + size * 0.06,
        emX - size * 0.05,
        emY + size * 0.12
      );
      ctx.lineTo(emX, emY + size * 0.08);
      ctx.lineTo(emX + size * 0.05, emY + size * 0.12);
      ctx.bezierCurveTo(
        emX + size * 0.09,
        emY + size * 0.06,
        emX + size * 0.1,
        emY - size * 0.08,
        emX,
        emY - size * 0.13
      );
      ctx.closePath();
      ctx.fill();

      // Gold wing extensions from emblem
      for (let side = -1; side <= 1; side += 2) {
        ctx.strokeStyle = `rgba(200, 160, 40, ${0.4 + gemPulse * 0.1})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(emX + side * size * 0.04, emY - size * 0.06);
        ctx.bezierCurveTo(
          emX + side * size * 0.1,
          emY - size * 0.1,
          emX + side * size * 0.14,
          emY - size * 0.06,
          emX + side * size * 0.12,
          emY - size * 0.01
        );
        ctx.stroke();
        ctx.strokeStyle = `rgba(154, 122, 24, ${0.3 + gemPulse * 0.08})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(emX + side * size * 0.035, emY - size * 0.04);
        ctx.bezierCurveTo(
          emX + side * size * 0.08,
          emY - size * 0.07,
          emX + side * size * 0.11,
          emY - size * 0.04,
          emX + side * size * 0.1,
          emY + size * 0.01
        );
        ctx.stroke();
      }

      // Emblem backing plate
      const embG = ctx.createRadialGradient(
        emX,
        emY - size * 0.02,
        0,
        emX,
        emY,
        size * 0.08
      );
      embG.addColorStop(0, "#d4a82c");
      embG.addColorStop(0.3, "#b89025");
      embG.addColorStop(0.6, "#8a6a15");
      embG.addColorStop(1, "#5a4508");
      ctx.fillStyle = embG;
      ctx.beginPath();
      ctx.moveTo(emX, emY - size * 0.1);
      ctx.bezierCurveTo(
        emX - size * 0.08,
        emY - size * 0.06,
        emX - size * 0.07,
        emY + size * 0.04,
        emX - size * 0.04,
        emY + size * 0.09
      );
      ctx.lineTo(emX, emY + size * 0.06);
      ctx.lineTo(emX + size * 0.04, emY + size * 0.09);
      ctx.bezierCurveTo(
        emX + size * 0.07,
        emY + size * 0.04,
        emX + size * 0.08,
        emY - size * 0.06,
        emX,
        emY - size * 0.1
      );
      ctx.closePath();
      ctx.fill();
      // Double gold border
      ctx.strokeStyle = "#6a4a08";
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();
      ctx.strokeStyle = `rgba(218, 180, 50, ${0.35 + gemPulse * 0.1})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Gold prong settings (4 prongs around gem)
      for (let prong = 0; prong < 4; prong++) {
        const prongAngle = (prong * Math.PI) / 2 + Math.PI / 4;
        const prongInner = size * 0.025;
        const prongOuter = size * 0.045;
        const px1 = emX + Math.cos(prongAngle) * prongInner;
        const py1 = emY + Math.sin(prongAngle) * prongInner;
        const px2 = emX + Math.cos(prongAngle) * prongOuter;
        const py2 = emY + Math.sin(prongAngle) * prongOuter;
        ctx.strokeStyle = `rgba(200, 160, 40, ${0.5 + gemPulse * 0.15})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
        ctx.fillStyle = `rgba(218, 165, 32, ${0.55 + gemPulse * 0.15})`;
        ctx.beginPath();
        ctx.arc(px2, py2, size * 0.005, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center ruby gem (larger, more vibrant)
      const gemG2 = ctx.createRadialGradient(
        emX - size * 0.008,
        emY - size * 0.008,
        0,
        emX,
        emY,
        size * 0.035
      );
      gemG2.addColorStop(0, "#ff6666");
      gemG2.addColorStop(0.3, "#ee3333");
      gemG2.addColorStop(0.6, "#dc2626");
      gemG2.addColorStop(1, "#8b1515");
      ctx.fillStyle = gemG2;
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 10 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(emX, emY, size * 0.032, 0, Math.PI * 2);
      ctx.fill();
      // Gold ring around gem
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(emX, emY, size * 0.035, 0, Math.PI * 2);
      ctx.stroke();
      // Gem highlight
      ctx.fillStyle = "rgba(255, 200, 200, 0.6)";
      ctx.beginPath();
      ctx.ellipse(
        emX - size * 0.008,
        emY - size * 0.008,
        size * 0.013,
        size * 0.008,
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Gold waist belt band
    {
      const beltY = y + size * 0.42;
      const beltW = size * 0.4;
      const beltH = size * 0.04;
      const beltG = ctx.createLinearGradient(
        x - beltW,
        beltY,
        x + beltW,
        beltY
      );
      beltG.addColorStop(0, "#5a4008");
      beltG.addColorStop(0.15, "#7a5a10");
      beltG.addColorStop(0.3, "#9a7a1a");
      beltG.addColorStop(0.5, "#b89025");
      beltG.addColorStop(0.7, "#9a7a1a");
      beltG.addColorStop(0.85, "#7a5a10");
      beltG.addColorStop(1, "#5a4008");
      ctx.fillStyle = beltG;
      ctx.beginPath();
      ctx.moveTo(x - beltW, beltY - beltH * 0.5);
      ctx.quadraticCurveTo(
        x,
        beltY - beltH * 0.65,
        x + beltW,
        beltY - beltH * 0.5
      );
      ctx.lineTo(x + beltW, beltY + beltH * 0.5);
      ctx.quadraticCurveTo(
        x,
        beltY + beltH * 0.35,
        x - beltW,
        beltY + beltH * 0.5
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a4008";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      // Belt highlight shimmer
      ctx.strokeStyle = `rgba(230, 200, 100, ${0.2 + gemPulse * 0.08})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - beltW * 0.9, beltY - beltH * 0.3);
      ctx.quadraticCurveTo(
        x,
        beltY - beltH * 0.45,
        x + beltW * 0.9,
        beltY - beltH * 0.3
      );
      ctx.stroke();
      // Belt notch engravings
      for (let bn = 0; bn < 7; bn++) {
        const bnt = (bn + 1) / 8;
        const bnx = x + (bnt - 0.5) * beltW * 1.8;
        ctx.strokeStyle = "rgba(90, 60, 10, 0.4)";
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(bnx, beltY - beltH * 0.35);
        ctx.lineTo(bnx, beltY + beltH * 0.35);
        ctx.stroke();
      }
    }
    // Gold-ringed waist rivets on belt
    for (let r = -2; r <= 2; r++) {
      const rx = x + r * size * 0.13;
      const ry = y + size * 0.42;
      const rvG = ctx.createRadialGradient(
        rx - size * 0.002,
        ry - size * 0.002,
        0,
        rx,
        ry,
        size * 0.01
      );
      rvG.addColorStop(0, "#daa520");
      rvG.addColorStop(0.4, "#b89025");
      rvG.addColorStop(0.7, "#7a5a10");
      rvG.addColorStop(1, "#4a3508");
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(rx, ry, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a4508";
      ctx.lineWidth = 0.5 * zoom;
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
    flamePulse
  );

  // === ANGULAR DRAGON PAULDRONS (matched to Mathey placement) ===
  for (let side = -1; side <= 1; side += 2) {
    const pX = x + side * size * 0.55;
    const pY = y - size * 0.18;
    const pW = size * 0.28;
    const pH = size * 0.2;

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      pX + size * 0.015,
      pY + size * 0.04,
      pW * 1.05,
      pH * 0.7,
      side * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Angular pauldron path — pointed outward spike with ridged top and layered bottom
    const drawPauldronPath = () => {
      ctx.beginPath();
      // Top center (inner edge, near neck)
      ctx.moveTo(pX - side * pW * 0.55, pY - pH * 0.85);
      // Top ridge rises to a pointed peak
      ctx.lineTo(pX - side * pW * 0.1, pY - pH * 1.1);
      ctx.lineTo(pX + side * pW * 0.3, pY - pH * 0.9);
      // Outer spike — pointed flange jutting outward
      ctx.lineTo(pX + side * pW * 0.85, pY - pH * 0.5);
      ctx.lineTo(pX + side * pW * 1.1, pY - pH * 0.05);
      // Lower outer edge curves back under
      ctx.quadraticCurveTo(
        pX + side * pW * 1,
        pY + pH * 0.55,
        pX + side * pW * 0.6,
        pY + pH * 0.8
      );
      // Bottom edge — segmented scallop
      ctx.quadraticCurveTo(
        pX + side * pW * 0.2,
        pY + pH * 0.95,
        pX,
        pY + pH * 0.75
      );
      ctx.quadraticCurveTo(
        pX - side * pW * 0.2,
        pY + pH * 0.85,
        pX - side * pW * 0.5,
        pY + pH * 0.6
      );
      // Inner edge back up
      ctx.quadraticCurveTo(
        pX - side * pW * 0.7,
        pY + pH * 0.1,
        pX - side * pW * 0.55,
        pY - pH * 0.85
      );
      ctx.closePath();
    };

    // Blue-steel fill
    const pG = ctx.createLinearGradient(
      pX - side * pW * 0.5,
      pY - pH,
      pX + side * pW * 1,
      pY + pH * 0.8
    );
    if (side === -1) {
      pG.addColorStop(0, "#6a6e78");
      pG.addColorStop(0.2, "#585c66");
      pG.addColorStop(0.45, "#4e5260");
      pG.addColorStop(0.7, "#3a3e4a");
      pG.addColorStop(1, "#24262c");
    } else {
      pG.addColorStop(0, "#24262c");
      pG.addColorStop(0.3, "#3a3e4a");
      pG.addColorStop(0.55, "#4e5260");
      pG.addColorStop(0.8, "#585c66");
      pG.addColorStop(1, "#6a6e78");
    }
    ctx.fillStyle = pG;
    drawPauldronPath();
    ctx.fill();

    // Specular highlight clipped inside
    ctx.save();
    drawPauldronPath();
    ctx.clip();
    const specG = ctx.createRadialGradient(
      pX - side * pW * 0.1,
      pY - pH * 0.6,
      0,
      pX + side * pW * 0.2,
      pY,
      pW * 1.2
    );
    specG.addColorStop(0, "rgba(180, 185, 200, 0.32)");
    specG.addColorStop(0.2, "rgba(140, 145, 165, 0.15)");
    specG.addColorStop(0.5, "rgba(100, 105, 120, 0.04)");
    specG.addColorStop(1, "rgba(60, 65, 80, 0)");
    ctx.fillStyle = specG;
    ctx.fillRect(pX - pW * 1.2, pY - pH * 1.3, pW * 2.6, pH * 2.6);

    // Raised ridge line from inner peak to outer spike
    ctx.strokeStyle = "rgba(110, 115, 130, 0.4)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(pX - side * pW * 0.1, pY - pH * 1.05);
    ctx.quadraticCurveTo(
      pX + side * pW * 0.5,
      pY - pH * 0.55,
      pX + side * pW * 1.08,
      pY - pH * 0.03
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(20, 20, 28, 0.35)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(pX - side * pW * 0.1, pY - pH * 0.95);
    ctx.quadraticCurveTo(
      pX + side * pW * 0.5,
      pY - pH * 0.45,
      pX + side * pW * 1.06,
      pY + pH * 0.05
    );
    ctx.stroke();

    // Horizontal segment lines across the body (layered plate look)
    for (let seg = 0; seg < 3; seg++) {
      const segY = pY + pH * (-0.15 + seg * 0.3);
      const segInner = pX - side * pW * (0.45 - seg * 0.08);
      const segOuter = pX + side * pW * (0.85 - seg * 0.15);
      ctx.strokeStyle = `rgba(20, 20, 28, ${0.3 + seg * 0.05})`;
      ctx.lineWidth = 0.9 * zoom;
      ctx.beginPath();
      ctx.moveTo(segInner, segY);
      ctx.quadraticCurveTo(
        pX + side * pW * 0.2,
        segY + pH * 0.04,
        segOuter,
        segY + pH * 0.08
      );
      ctx.stroke();
      ctx.strokeStyle = `rgba(100, 105, 120, ${0.18 + seg * 0.03})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(segInner, segY - size * 0.003);
      ctx.quadraticCurveTo(
        pX + side * pW * 0.2,
        segY + pH * 0.035,
        segOuter,
        segY + pH * 0.075
      );
      ctx.stroke();
    }

    // Gold filigree — curving arcs
    for (let sw = 0; sw < 2; sw++) {
      const swCx = pX + side * pW * (0.15 + sw * 0.25);
      const swCy = pY - pH * (0.15 - sw * 0.2);
      ctx.strokeStyle = `rgba(180, 140, 28, ${0.2 + sw * 0.06 + gemPulse * 0.05})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.arc(
        swCx,
        swCy,
        size * (0.04 + sw * 0.015),
        side > 0 ? 0.3 : Math.PI + 0.3,
        side > 0 ? Math.PI - 0.3 : Math.PI * 2 - 0.3
      );
      ctx.stroke();
    }
    ctx.restore();

    // Black outline
    ctx.strokeStyle = "#0a0a0c";
    ctx.lineWidth = 2.5 * zoom;
    drawPauldronPath();
    ctx.stroke();

    // Gold trim on all edges
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.2 * zoom;
    drawPauldronPath();
    ctx.stroke();

    // Gold rivets along bottom scallop and outer edge
    const rivetPositions = [
      [pX + side * pW * 0.85, pY - pH * 0.5],
      [pX + side * pW * 1.05, pY + pH * 0.05],
      [pX + side * pW * 0.7, pY + pH * 0.65],
      [pX + side * pW * 0.15, pY + pH * 0.85],
      [pX - side * pW * 0.35, pY + pH * 0.65],
      [pX - side * pW * 0.55, pY - pH * 0.2],
      [pX - side * pW * 0.3, pY - pH * 0.8],
      [pX + side * pW * 0.15, pY - pH * 0.95],
    ];
    for (const [rvX, rvY] of rivetPositions) {
      const rvG = ctx.createRadialGradient(
        rvX - size * 0.002,
        rvY - size * 0.002,
        0,
        rvX,
        rvY,
        size * 0.007
      );
      rvG.addColorStop(0, "#daa520");
      rvG.addColorStop(0.5, "#b89025");
      rvG.addColorStop(1, "#5a4508");
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(rvX, rvY, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4a3508";
      ctx.lineWidth = 0.35 * zoom;
      ctx.stroke();
    }

    // === RUBY GEM centered on pauldron ===
    {
      const gemX = pX + side * pW * 0.15;
      const gemY = pY - pH * 0.1;

      for (let fl = 0; fl < 4; fl++) {
        const flAngle = (fl * Math.PI) / 2;
        const flStartR = size * 0.03;
        const flEndR = size * 0.05;
        ctx.strokeStyle = `rgba(180, 140, 28, ${0.3 + gemPulse * 0.08})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(
          gemX + Math.cos(flAngle) * flStartR,
          gemY + Math.sin(flAngle) * flStartR
        );
        ctx.quadraticCurveTo(
          gemX + Math.cos(flAngle + 0.15) * flEndR * 1.1,
          gemY + Math.sin(flAngle + 0.15) * flEndR * 1.1,
          gemX + Math.cos(flAngle + 0.3) * flEndR,
          gemY + Math.sin(flAngle + 0.3) * flEndR
        );
        ctx.stroke();
      }

      ctx.strokeStyle = "#6a4a08";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.03, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.028, 0, Math.PI * 2);
      ctx.stroke();

      const gemGr = ctx.createRadialGradient(
        gemX - size * 0.005,
        gemY - size * 0.005,
        0,
        gemX,
        gemY,
        size * 0.025
      );
      gemGr.addColorStop(0, "#ff6666");
      gemGr.addColorStop(0.3, "#ee3333");
      gemGr.addColorStop(0.6, "#dc2626");
      gemGr.addColorStop(1, "#8b1515");
      ctx.fillStyle = gemGr;
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 9 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.022, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(255, 200, 200, 0.55)";
      ctx.beginPath();
      ctx.ellipse(
        gemX - size * 0.006,
        gemY - size * 0.006,
        size * 0.008,
        size * 0.006,
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // === ARMOR CHAINS (draped everywhere) ===
  {
    // Pauldron-to-chest chains (2 per side, hanging from each shoulder dome down to the breastplate)
    for (let side = -1; side <= 1; side += 2) {
      const shoulderX = x + side * size * 0.56;
      const shoulderY = y - size * 0.1;

      drawArmorChain(
        ctx,
        shoulderX,
        shoulderY,
        x + side * size * 0.18,
        y + size * 0.1,
        size,
        zoom,
        time,
        gemPulse,
        size * 0.06,
        8
      );
      drawArmorChain(
        ctx,
        shoulderX - side * size * 0.06,
        shoulderY + size * 0.06,
        x + side * size * 0.12,
        y + size * 0.22,
        size,
        zoom,
        time + 0.5,
        gemPulse,
        size * 0.05,
        7
      );
      // Pauldron-to-upper-arm chain
      drawArmorChain(
        ctx,
        shoulderX + side * size * 0.08,
        shoulderY + size * 0.1,
        x + side * size * 0.45,
        y + size * 0.12,
        size,
        zoom,
        time + 1,
        gemPulse,
        size * 0.04,
        5
      );
    }

    // Horizontal chest drape chains (3 tiers across breastplate)
    for (let tier = 0; tier < 3; tier++) {
      const tierY = y - size * 0.08 + tier * size * 0.14;
      const spread = size * (0.28 - tier * 0.04);
      const sagAmt = size * (0.025 + tier * 0.008);
      drawArmorChain(
        ctx,
        x - spread,
        tierY,
        x + spread,
        tierY,
        size,
        zoom,
        time + tier * 0.3,
        gemPulse,
        sagAmt,
        6 + tier
      );
    }

    // V-shaped chest chain (center decorative drape)
    drawArmorChain(
      ctx,
      x - size * 0.22,
      y - size * 0.18,
      x,
      y + size * 0.12,
      size,
      zoom,
      time + 0.7,
      gemPulse,
      size * 0.03,
      6
    );
    drawArmorChain(
      ctx,
      x + size * 0.22,
      y - size * 0.18,
      x,
      y + size * 0.12,
      size,
      zoom,
      time + 0.7,
      gemPulse,
      size * -0.03,
      6
    );

    // Waist/belt chains (looped across the skirt top)
    drawArmorChain(
      ctx,
      x - size * 0.35,
      y + size * 0.42,
      x - size * 0.05,
      y + size * 0.44,
      size,
      zoom,
      time + 1.2,
      gemPulse,
      size * 0.035,
      6
    );
    drawArmorChain(
      ctx,
      x + size * 0.05,
      y + size * 0.44,
      x + size * 0.35,
      y + size * 0.42,
      size,
      zoom,
      time + 1.2,
      gemPulse,
      size * 0.035,
      6
    );

    // Cross-body diagonal chain (left shoulder area to right hip)
    drawArmorChain(
      ctx,
      x - size * 0.25,
      y - size * 0.12,
      x + size * 0.2,
      y + size * 0.35,
      size,
      zoom,
      time + 1.8,
      gemPulse,
      size * 0.04,
      10
    );
  }

  // === RIGHT ARM (holds flamesword) ===
  {
    const rShoulderX = x + size * 0.55;
    const rShoulderY = y - size * 0.08;
    const swordOriginX = x + size * 0.68;
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
      WEAPON_LIMITS.rightMelee
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
    rUpG.addColorStop(0, "#62666e");
    rUpG.addColorStop(0.3, "#4c5058");
    rUpG.addColorStop(0.7, "#3a3e46");
    rUpG.addColorStop(1, "#24262c");
    ctx.fillStyle = rUpG;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.01,
      -size * 0.055,
      rUpperLen + size * 0.02,
      size * 0.11,
      size * 0.025
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
      size * 0.025
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
    ctx.strokeStyle = "rgba(100, 104, 112, 0.4)";
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
      size * 0.06
    );
    elbowCopG.addColorStop(0, "#6a6e76");
    elbowCopG.addColorStop(0.5, "#3c4048");
    elbowCopG.addColorStop(1, "#1c1e24");
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
    rFoG.addColorStop(0, "#585c64");
    rFoG.addColorStop(0.3, "#464a52");
    rFoG.addColorStop(0.7, "#353840");
    rFoG.addColorStop(1, "#1c1e24");
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
    ctx.quadraticCurveTo(
      rForeLen * 0.5,
      size * 0.01,
      rForeLen * 0.8,
      -size * 0.03
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rForeLen * 0.2, size * 0.03);
    ctx.quadraticCurveTo(
      rForeLen * 0.5,
      -size * 0.01,
      rForeLen * 0.8,
      size * 0.03
    );
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
      size * 0.055
    );
    gauntG.addColorStop(0, "#585c64");
    gauntG.addColorStop(0.5, "#353840");
    gauntG.addColorStop(1, "#1c1e24");
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
        size * 0.025,
        gsA - 0.8,
        gsA + 0.8
      );
      ctx.stroke();
    }
    ctx.restore();
    // Knuckle plates with gold trim
    for (let k = 0; k < 4; k++) {
      const ka = rForeAngle - 0.5 + k * 0.35;
      const kx = gripWX + Math.cos(ka) * size * 0.04;
      const ky = gripWY + Math.sin(ka) * size * 0.04;
      ctx.fillStyle = "#2c2e34";
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
    const lShoulderX = x - size * 0.55;
    const lShoulderY = y - size * 0.08;
    const flagOriginX = x - size * 0.75;
    const flagOriginY = y + size * 0.1;
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
    lUpG.addColorStop(0, "#62666e");
    lUpG.addColorStop(0.3, "#4c5058");
    lUpG.addColorStop(0.7, "#3a3e46");
    lUpG.addColorStop(1, "#24262c");
    ctx.fillStyle = lUpG;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.01,
      -size * 0.055,
      lUpperLen + size * 0.02,
      size * 0.11,
      size * 0.025
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
      size * 0.025
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
    ctx.strokeStyle = "rgba(100, 104, 112, 0.4)";
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
      size * 0.06
    );
    lElbG.addColorStop(0, "#6a6e76");
    lElbG.addColorStop(0.5, "#3c4048");
    lElbG.addColorStop(1, "#1c1e24");
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
    lFoG.addColorStop(0, "#585c64");
    lFoG.addColorStop(0.3, "#464a52");
    lFoG.addColorStop(0.7, "#353840");
    lFoG.addColorStop(1, "#1c1e24");
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
    ctx.quadraticCurveTo(
      lForeLen * 0.5,
      size * 0.01,
      lForeLen * 0.8,
      -size * 0.03
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lForeLen * 0.2, size * 0.03);
    ctx.quadraticCurveTo(
      lForeLen * 0.5,
      -size * 0.01,
      lForeLen * 0.8,
      size * 0.03
    );
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
      size * 0.055
    );
    lGauntG.addColorStop(0, "#585c64");
    lGauntG.addColorStop(0.5, "#353840");
    lGauntG.addColorStop(1, "#1c1e24");
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
        size * 0.025,
        gsA - 0.8,
        gsA + 0.8
      );
      ctx.stroke();
    }
    ctx.restore();
    // Knuckle plates with gold trim
    for (let k = 0; k < 4; k++) {
      const ka = lForeAngle - 0.5 + k * 0.35;
      const kx = gripFX + Math.cos(ka) * size * 0.04;
      const ky = gripFY + Math.sin(ka) * size * 0.04;
      ctx.fillStyle = "#2c2e34";
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
    x + size * 0.68,
    y + size * 0.08,
    swordBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.35 : 0.8,
    WEAPON_LIMITS.rightMelee
  );
  ctx.save();
  ctx.translate(x + size * 0.68, y + size * 0.08);
  ctx.rotate(swordAngle);

  // --- FLAME AURA ---
  {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 20 * zoom * (0.7 + attackIntensity * 0.3);
    // Outer glow haze
    const auraG = ctx.createRadialGradient(
      0,
      -size * 0.5,
      0,
      0,
      -size * 0.5,
      size * 0.2
    );
    auraG.addColorStop(0, `rgba(255, 80, 20, ${0.12 + attackIntensity * 0.1})`);
    auraG.addColorStop(
      0.6,
      `rgba(255, 50, 10, ${0.05 + attackIntensity * 0.05})`
    );
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
      ctx.ellipse(
        flameX,
        flameY,
        flameW,
        flameH,
        Math.sin(time * 5 + flame) * 0.3,
        0,
        Math.PI * 2
      );
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
      ctx.bezierCurveTo(
        -size * 0.072,
        -size * 0.25,
        -size * 0.078,
        -size * 0.55,
        -size * 0.075,
        -size * 0.78
      );
      ctx.bezierCurveTo(
        -size * 0.07,
        -size * 0.88,
        -size * 0.04,
        -size * 0.98,
        0,
        -size * 1.12
      );
      ctx.bezierCurveTo(
        size * 0.04,
        -size * 0.98,
        size * 0.07,
        -size * 0.88,
        size * 0.075,
        -size * 0.78
      );
      ctx.bezierCurveTo(
        size * 0.078,
        -size * 0.55,
        size * 0.072,
        -size * 0.25,
        size * 0.065,
        0
      );
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
    ctx.bezierCurveTo(
      -size * 0.072,
      -size * 0.25,
      -size * 0.078,
      -size * 0.55,
      -size * 0.075,
      -size * 0.78
    );
    ctx.bezierCurveTo(
      -size * 0.07,
      -size * 0.88,
      -size * 0.04,
      -size * 0.98,
      0,
      -size * 1.12
    );
    ctx.stroke();
    // Right edge (cooler)
    ctx.strokeStyle = `rgba(255, 140, 60, ${0.35 + flamePulse * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.shadowBlur = 8 * zoom * flamePulse;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.12);
    ctx.bezierCurveTo(
      size * 0.04,
      -size * 0.98,
      size * 0.07,
      -size * 0.88,
      size * 0.075,
      -size * 0.78
    );
    ctx.bezierCurveTo(
      size * 0.078,
      -size * 0.55,
      size * 0.072,
      -size * 0.25,
      size * 0.065,
      -size * 0.02
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rune engravings — alternating shapes along the fuller
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 5 * zoom;
    for (let rune = 0; rune < 7; rune++) {
      const ry = -size * 0.1 - rune * size * 0.12;
      const runeAlpha =
        0.55 + attackIntensity * 0.35 + Math.sin(time * 4 + rune * 0.9) * 0.1;
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
        ctx.fillRect(
          -size * 0.012,
          ry - size * 0.003,
          size * 0.024,
          size * 0.006
        );
        ctx.fillRect(
          -size * 0.003,
          ry - size * 0.015,
          size * 0.006,
          size * 0.03
        );
      }
    }
    ctx.shadowBlur = 0;

    // Specular highlight line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, -size * 0.05);
    ctx.bezierCurveTo(
      -size * 0.035,
      -size * 0.4,
      -size * 0.03,
      -size * 0.75,
      -size * 0.015,
      -size * 0.95
    );
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
      const gG = ctx.createLinearGradient(
        0,
        -size * 0.06,
        side * size * 0.26,
        size * 0.01
      );
      gG.addColorStop(0, "#c9a227");
      gG.addColorStop(0.3, "#f0d040");
      gG.addColorStop(0.5, "#ffe060");
      gG.addColorStop(0.7, "#f0d040");
      gG.addColorStop(1, "#8a6a15");
      ctx.fillStyle = gG;
      ctx.beginPath();
      ctx.moveTo(side * size * 0.06, -size * 0.05);
      ctx.bezierCurveTo(
        side * size * 0.12,
        -size * 0.08,
        side * size * 0.2,
        -size * 0.07,
        side * size * 0.26,
        -size * 0.04
      );
      // Wing tip curls up
      ctx.bezierCurveTo(
        side * size * 0.27,
        -size * 0.06,
        side * size * 0.28,
        -size * 0.09,
        side * size * 0.25,
        -size * 0.12
      );
      // Back edge sweeps down
      ctx.bezierCurveTo(
        side * size * 0.22,
        -size * 0.06,
        side * size * 0.16,
        0,
        side * size * 0.1,
        size * 0.03
      );
      ctx.bezierCurveTo(
        side * size * 0.08,
        size * 0.04,
        side * size * 0.06,
        size * 0.04,
        side * size * 0.04,
        size * 0.03
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
          side * size * (0.12 + v * 0.04),
          -size * 0.01,
          side * size * (0.08 + v * 0.02),
          size * 0.02
        );
        ctx.stroke();
      }

      // Black border
      ctx.strokeStyle = "#1a1008";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(side * size * 0.06, -size * 0.05);
      ctx.bezierCurveTo(
        side * size * 0.12,
        -size * 0.08,
        side * size * 0.2,
        -size * 0.07,
        side * size * 0.26,
        -size * 0.04
      );
      ctx.bezierCurveTo(
        side * size * 0.27,
        -size * 0.06,
        side * size * 0.28,
        -size * 0.09,
        side * size * 0.25,
        -size * 0.12
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
      const eyeG = ctx.createRadialGradient(
        gemX - size * 0.005,
        gemY - size * 0.005,
        0,
        gemX,
        gemY,
        size * 0.02
      );
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
    const centerG = ctx.createRadialGradient(
      0,
      -size * 0.01,
      0,
      0,
      -size * 0.01,
      size * 0.06
    );
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
    const cRG = ctx.createRadialGradient(
      -size * 0.003,
      -size * 0.015,
      0,
      0,
      -size * 0.01,
      size * 0.018
    );
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
    ctx.roundRect(
      -size * 0.035,
      size * 0.02,
      size * 0.07,
      size * 0.25,
      size * 0.008
    );
    ctx.fill();
    ctx.strokeStyle = "#0a0505";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Gold wire wrapping
    for (let wrap = 0; wrap < 8; wrap++) {
      const wy = size * 0.035 + wrap * size * 0.028;
      const wrapG = ctx.createLinearGradient(
        -size * 0.035,
        wy,
        size * 0.035,
        wy
      );
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
    const ringG = ctx.createLinearGradient(
      -size * 0.04,
      ringY,
      size * 0.04,
      ringY
    );
    ringG.addColorStop(0, "#7a5a10");
    ringG.addColorStop(0.3, "#c9a227");
    ringG.addColorStop(0.5, "#f0d040");
    ringG.addColorStop(0.7, "#c9a227");
    ringG.addColorStop(1, "#7a5a10");
    ctx.fillStyle = ringG;
    ctx.fillRect(
      -size * 0.042,
      ringY - size * 0.008,
      size * 0.084,
      size * 0.016
    );
    ctx.strokeStyle = "#5a4008";
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(
      -size * 0.042,
      ringY - size * 0.008,
      size * 0.084,
      size * 0.016
    );
  }

  // --- POMMEL (dragon head) ---
  {
    const pomY = size * 0.28;
    // Pommel body with gradient
    const pomG = ctx.createRadialGradient(
      0,
      pomY + size * 0.04,
      0,
      0,
      pomY + size * 0.04,
      size * 0.07
    );
    pomG.addColorStop(0, "#f0d040");
    pomG.addColorStop(0.3, "#daa520");
    pomG.addColorStop(0.6, "#b08a20");
    pomG.addColorStop(1, "#6a4a08");
    ctx.fillStyle = pomG;
    ctx.beginPath();
    ctx.moveTo(0, pomY);
    ctx.bezierCurveTo(
      -size * 0.04,
      pomY,
      -size * 0.07,
      pomY + size * 0.02,
      -size * 0.07,
      pomY + size * 0.05
    );
    ctx.bezierCurveTo(
      -size * 0.07,
      pomY + size * 0.08,
      -size * 0.04,
      pomY + size * 0.11,
      0,
      pomY + size * 0.12
    );
    ctx.bezierCurveTo(
      size * 0.04,
      pomY + size * 0.11,
      size * 0.07,
      pomY + size * 0.08,
      size * 0.07,
      pomY + size * 0.05
    );
    ctx.bezierCurveTo(
      size * 0.07,
      pomY + size * 0.02,
      size * 0.04,
      pomY,
      0,
      pomY
    );
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
      ctx.arc(
        side * size * 0.015,
        pomY + size * 0.035,
        size * 0.006,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    // Brow ridges
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(side * size * 0.005, pomY + size * 0.055);
      ctx.quadraticCurveTo(
        side * size * 0.03,
        pomY + size * 0.04,
        side * size * 0.04,
        pomY + size * 0.06
      );
      ctx.stroke();
    }

    // Center ruby eye
    const pomRG = ctx.createRadialGradient(
      -size * 0.003,
      pomY + size * 0.055,
      0,
      0,
      pomY + size * 0.06,
      size * 0.02
    );
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
    ctx.ellipse(
      -size * 0.005,
      pomY + size * 0.055,
      size * 0.007,
      size * 0.005,
      -0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // === LEGENDARY WAR STANDARD (Facing Left) ===
  ctx.save();
  ctx.translate(x - size * 0.75, y + size * 0.1);
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
    ctx.roundRect(
      -poleW * 0.5,
      poleTop,
      poleW,
      poleBot - poleTop,
      size * 0.006
    );
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
      ctx.bezierCurveTo(
        gx + size * 0.003,
        poleTop + (poleBot - poleTop) * 0.3,
        gx - size * 0.003,
        poleTop + (poleBot - poleTop) * 0.7,
        gx,
        poleBot - size * 0.02
      );
      ctx.stroke();
    }

    // Gold ferrule rings (wider, more ornate)
    const ringPositions = [
      poleTop + size * 0.02,
      poleTop + size * 0.22,
      poleTop + size * 0.46,
      poleTop + size * 0.7,
    ];
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
      -orbR * 0.3,
      orbY - orbR * 0.3,
      0,
      0,
      orbY,
      orbR
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
      -size * 0.003,
      orbY - size * 0.003,
      0,
      0,
      orbY,
      size * 0.016
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
        -size * 0.4
      );
      // Bottom edge with pointed tail — CP1 continues leftward from junction
      ctx.bezierCurveTo(
        -size * 0.46 - tw * 0.25,
        -size * 0.34,
        -size * 0.48 - tw * 0.22,
        -size * 0.28,
        -size * 0.48 - tw * 0.18,
        -size * 0.22
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
        -size * 0.13
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
    const bannerG = ctx.createLinearGradient(
      -size * 0.025,
      -size * 0.5,
      -size * 0.42,
      -size * 0.5
    );
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
      ctx.fillStyle =
        fold % 2 === 0
          ? `rgba(0, 0, 0, ${foldAlpha})`
          : `rgba(255, 255, 255, ${foldAlpha * 0.5})`;
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
      -size * 0.38
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
      -size * 0.26
    );
    ctx.stroke();
    ctx.restore();

    // --- BANNER EMBLEM (dragon seal) ---
    {
      const emX = -size * 0.2 - tipWave * size * 0.18;
      const emY = -size * 0.48;
      // Gold circle backdrop
      const circG = ctx.createRadialGradient(
        emX - size * 0.005,
        emY - size * 0.005,
        0,
        emX,
        emY,
        size * 0.08
      );
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
      ctx.bezierCurveTo(
        emX + size * 0.01,
        emY - size * 0.04,
        emX + size * 0.035,
        emY - size * 0.035,
        emX + size * 0.04,
        emY - size * 0.02
      );
      ctx.bezierCurveTo(
        emX + size * 0.045,
        emY - size * 0.01,
        emX + size * 0.035,
        emY + size * 0.005,
        emX + size * 0.025,
        emY + size * 0.01
      );
      // Right body
      ctx.lineTo(emX + size * 0.015, emY + size * 0.025);
      // Tail
      ctx.bezierCurveTo(
        emX + size * 0.02,
        emY + size * 0.04,
        emX + size * 0.005,
        emY + size * 0.045,
        emX,
        emY + size * 0.04
      );
      // Left side mirror
      ctx.bezierCurveTo(
        emX - size * 0.005,
        emY + size * 0.045,
        emX - size * 0.02,
        emY + size * 0.04,
        emX - size * 0.015,
        emY + size * 0.025
      );
      ctx.lineTo(emX - size * 0.025, emY + size * 0.01);
      ctx.bezierCurveTo(
        emX - size * 0.035,
        emY + size * 0.005,
        emX - size * 0.045,
        emY - size * 0.01,
        emX - size * 0.04,
        emY - size * 0.02
      );
      ctx.bezierCurveTo(
        emX - size * 0.035,
        emY - size * 0.035,
        emX - size * 0.01,
        emY - size * 0.04,
        emX,
        emY - size * 0.045
      );
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
      ctx.quadraticCurveTo(
        fx + fWave,
        fy + tongueH + size * 0.015,
        fx + size * 0.005,
        fy
      );
      ctx.fill();
      // Inner yellow core
      ctx.fillStyle = `rgba(255, 200, 60, ${0.4 + Math.sin(time * 8 + fringe * 0.7) * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(fx - size * 0.005, fy);
      ctx.quadraticCurveTo(
        fx + fWave * 0.5,
        fy + tongueH,
        fx + size * 0.003,
        fy
      );
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
      ctx.quadraticCurveTo(
        -size * 0.04 + tSway,
        tY + size * 0.04,
        -size * 0.035 + tSway,
        tY + size * 0.07
      );
      ctx.stroke();
      // Tassel knot
      const tkG = ctx.createRadialGradient(
        -size * 0.035 + tSway,
        tY + size * 0.07,
        0,
        -size * 0.035 + tSway,
        tY + size * 0.07,
        size * 0.012
      );
      tkG.addColorStop(0, "#f0d040");
      tkG.addColorStop(0.6, "#c9a227");
      tkG.addColorStop(1, "#7a5a10");
      ctx.fillStyle = tkG;
      ctx.beginPath();
      ctx.arc(
        -size * 0.035 + tSway,
        tY + size * 0.07,
        size * 0.012,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Tassel threads
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 0.6 * zoom;
      for (let th = -1; th <= 1; th++) {
        const thSway = Math.sin(time * 4 + th * 0.8 + t) * size * 0.005;
        ctx.beginPath();
        ctx.moveTo(-size * 0.035 + tSway + th * size * 0.005, tY + size * 0.08);
        ctx.lineTo(
          -size * 0.035 + tSway + th * size * 0.008 + thSway,
          tY + size * 0.11
        );
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
      wingBaseX + wingSpread * 0.4,
      wingBaseY - wingRise * 0.3 + size * 0.008,
      wingBaseX + wingSpread * 0.8,
      wingBaseY - wingRise * 0.8 + size * 0.008,
      wingBaseX + wingSpread,
      wingBaseY - wingRise + size * 0.008
    );
    ctx.lineTo(wingBaseX + wingSpread * 0.7, wingBaseY + size * 0.03);
    ctx.lineTo(wingBaseX + wingSpread * 0.3, wingBaseY + size * 0.04);
    ctx.closePath();
    ctx.fill();

    // Primary feather (top, longest)
    {
      const fG = ctx.createLinearGradient(
        wingBaseX,
        wingBaseY,
        wingBaseX + wingSpread,
        wingBaseY - wingRise
      );
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
        wingBaseX + wingSpread * 0.3,
        wingBaseY - wingRise * 0.5,
        wingBaseX + wingSpread * 0.7,
        wingBaseY - wingRise * 0.9,
        wingBaseX + wingSpread,
        wingBaseY - wingRise
      );
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.85,
        wingBaseY - wingRise * 0.7,
        wingBaseX + wingSpread * 0.5,
        wingBaseY - wingRise * 0.3,
        wingBaseX,
        wingBaseY + size * 0.005
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
    }

    // Secondary feather (middle)
    {
      const f2G = ctx.createLinearGradient(
        wingBaseX,
        wingBaseY,
        wingBaseX + wingSpread * 0.7,
        wingBaseY - wingRise * 0.5
      );
      f2G.addColorStop(0, "#6a4a08");
      f2G.addColorStop(0.3, "#9a7a18");
      f2G.addColorStop(0.6, "#c9a227");
      f2G.addColorStop(1, "#9a7a18");
      ctx.fillStyle = f2G;
      ctx.beginPath();
      ctx.moveTo(wingBaseX, wingBaseY + size * 0.008);
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.25,
        wingBaseY - wingRise * 0.15,
        wingBaseX + wingSpread * 0.5,
        wingBaseY - wingRise * 0.4,
        wingBaseX + wingSpread * 0.7,
        wingBaseY - wingRise * 0.5
      );
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.55,
        wingBaseY - wingRise * 0.25,
        wingBaseX + wingSpread * 0.28,
        wingBaseY - wingRise * 0.03,
        wingBaseX,
        wingBaseY + size * 0.02
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }

    // Tertiary feather (bottom, shortest)
    {
      const f3G = ctx.createLinearGradient(
        wingBaseX,
        wingBaseY,
        wingBaseX + wingSpread * 0.45,
        wingBaseY - wingRise * 0.15
      );
      f3G.addColorStop(0, "#5a4008");
      f3G.addColorStop(0.4, "#8a6a15");
      f3G.addColorStop(1, "#7a5a10");
      ctx.fillStyle = f3G;
      ctx.beginPath();
      ctx.moveTo(wingBaseX, wingBaseY + size * 0.022);
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.18,
        wingBaseY + size * 0.005,
        wingBaseX + wingSpread * 0.35,
        wingBaseY - wingRise * 0.1,
        wingBaseX + wingSpread * 0.45,
        wingBaseY - wingRise * 0.15
      );
      ctx.bezierCurveTo(
        wingBaseX + wingSpread * 0.35,
        wingBaseY - wingRise * 0.02,
        wingBaseX + wingSpread * 0.18,
        wingBaseY + size * 0.02,
        wingBaseX,
        wingBaseY + size * 0.035
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
      wingBaseX + wingSpread * 0.35,
      wingBaseY - wingRise * 0.45,
      wingBaseX + wingSpread * 0.7,
      wingBaseY - wingRise * 0.8,
      wingBaseX + wingSpread * 0.95,
      wingBaseY - wingRise * 0.95
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wingBaseX + side * size * 0.008, wingBaseY + size * 0.012);
    ctx.bezierCurveTo(
      wingBaseX + wingSpread * 0.25,
      wingBaseY - wingRise * 0.12,
      wingBaseX + wingSpread * 0.45,
      wingBaseY - wingRise * 0.35,
      wingBaseX + wingSpread * 0.65,
      wingBaseY - wingRise * 0.45
    );
    ctx.stroke();
  }

  // === DRAGON CROWN HELM ===
  {
    const helmCX = x;
    const helmCY = y - size * 0.52;
    const helmW = size * 0.3;
    const helmTop = helmCY - size * 0.32;
    const helmBot = helmCY + size * 0.26;
    const helmBrowY = helmCY - size * 0.08;

    // Helper to draw the helm outline path (angular dragon-crown great helm)
    const drawHelmPath = () => {
      ctx.beginPath();
      // Crown — sharp peaked ridge instead of flat top
      ctx.moveTo(helmCX - helmW * 0.65, helmTop + size * 0.03);
      ctx.lineTo(helmCX - helmW * 0.25, helmTop - size * 0.02);
      ctx.lineTo(helmCX, helmTop - size * 0.08);
      ctx.lineTo(helmCX + helmW * 0.25, helmTop - size * 0.02);
      ctx.lineTo(helmCX + helmW * 0.65, helmTop + size * 0.03);
      // Right side — angular facets with pronounced cheek flange
      ctx.lineTo(helmCX + helmW * 0.95, helmTop + size * 0.1);
      ctx.lineTo(helmCX + helmW * 1.15, helmBrowY - size * 0.03);
      // Cheek flange juts outward
      ctx.lineTo(helmCX + helmW * 1.2, helmBrowY + size * 0.04);
      ctx.lineTo(helmCX + helmW * 1.1, helmBrowY + size * 0.12);
      // Jawline tapers sharply to chin
      ctx.lineTo(helmCX + helmW * 0.75, helmBot - size * 0.04);
      ctx.lineTo(helmCX + helmW * 0.35, helmBot + size * 0.01);
      // Chin — angular V-point
      ctx.lineTo(helmCX, helmBot + size * 0.08);
      // Left jawline (mirror)
      ctx.lineTo(helmCX - helmW * 0.35, helmBot + size * 0.01);
      ctx.lineTo(helmCX - helmW * 0.75, helmBot - size * 0.04);
      ctx.lineTo(helmCX - helmW * 1.1, helmBrowY + size * 0.12);
      ctx.lineTo(helmCX - helmW * 1.2, helmBrowY + size * 0.04);
      ctx.lineTo(helmCX - helmW * 1.15, helmBrowY - size * 0.03);
      ctx.lineTo(helmCX - helmW * 0.95, helmTop + size * 0.1);
      ctx.closePath();
    };

    // Ambient shadow beneath helm
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(
      helmCX,
      helmBot + size * 0.03,
      helmW * 0.9,
      size * 0.06,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Main helm fill — burnished dark steel with blue-steel undertones
    const helmG = ctx.createLinearGradient(
      helmCX - helmW,
      helmTop,
      helmCX + helmW * 0.3,
      helmBot
    );
    helmG.addColorStop(0, "#707580");
    helmG.addColorStop(0.08, "#5e6270");
    helmG.addColorStop(0.2, "#4e5260");
    helmG.addColorStop(0.4, "#3a3e4a");
    helmG.addColorStop(0.6, "#2e3038");
    helmG.addColorStop(0.8, "#222428");
    helmG.addColorStop(1, "#18191d");
    ctx.fillStyle = helmG;
    drawHelmPath();
    ctx.fill();

    // Warm fire reflection on top of dome (from plume above)
    const fireReflG = ctx.createRadialGradient(
      helmCX,
      helmTop + size * 0.04,
      0,
      helmCX,
      helmTop + size * 0.08,
      size * 0.25
    );
    fireReflG.addColorStop(
      0,
      `rgba(255, 120, 40, ${0.12 + flamePulse * 0.06})`
    );
    fireReflG.addColorStop(
      0.3,
      `rgba(220, 80, 20, ${0.06 + flamePulse * 0.03})`
    );
    fireReflG.addColorStop(0.6, "rgba(180, 50, 10, 0.02)");
    fireReflG.addColorStop(1, "rgba(100, 20, 5, 0)");
    ctx.fillStyle = fireReflG;
    drawHelmPath();
    ctx.fill();

    // Primary specular highlight — upper-left (cool steel reflection)
    const specG = ctx.createRadialGradient(
      helmCX - size * 0.1,
      helmTop + size * 0.07,
      0,
      helmCX - size * 0.08,
      helmTop + size * 0.1,
      size * 0.18
    );
    specG.addColorStop(0, "rgba(190, 195, 215, 0.38)");
    specG.addColorStop(0.25, "rgba(140, 148, 170, 0.18)");
    specG.addColorStop(0.55, "rgba(100, 108, 130, 0.06)");
    specG.addColorStop(1, "rgba(60, 65, 80, 0)");
    ctx.fillStyle = specG;
    drawHelmPath();
    ctx.fill();

    // Secondary specular — rim light on right edge
    const rimG = ctx.createLinearGradient(
      helmCX + helmW * 0.7,
      helmTop,
      helmCX + helmW * 1.15,
      helmBot * 0.6 + helmTop * 0.4
    );
    rimG.addColorStop(0, "rgba(160, 170, 205, 0.16)");
    rimG.addColorStop(0.35, "rgba(120, 130, 165, 0.08)");
    rimG.addColorStop(1, "rgba(60, 65, 80, 0)");
    ctx.fillStyle = rimG;
    drawHelmPath();
    ctx.fill();

    // Ambient occlusion at bottom of dome
    const aoG = ctx.createLinearGradient(
      helmCX,
      helmBot - size * 0.1,
      helmCX,
      helmBot
    );
    aoG.addColorStop(0, "rgba(0, 0, 0, 0)");
    aoG.addColorStop(0.6, "rgba(0, 0, 5, 0.08)");
    aoG.addColorStop(1, "rgba(0, 0, 5, 0.18)");
    ctx.fillStyle = aoG;
    drawHelmPath();
    ctx.fill();

    // Overlapping dragon scale armor on upper dome
    ctx.save();
    drawHelmPath();
    ctx.clip();
    for (let row = 0; row < 7; row++) {
      const scaleRowY = helmTop + size * 0.015 + row * size * 0.04;
      const rowWidth = helmW * (1.08 - row * 0.03);
      const cols = 7 - Math.floor(row * 0.5);
      const stagger = row % 2 === 0 ? 0 : 0.5;
      for (let col = 0; col < cols; col++) {
        const colT = cols > 1 ? (col + stagger) / cols : 0.5;
        const sx = helmCX + (colT - 0.5) * rowWidth * 1.8;
        const sy = scaleRowY;
        const sw = size * 0.03;
        const sh = size * 0.025;

        const scaleDepth = 0.12 + row * 0.02;
        const scaleBright = Math.max(0, 0.3 - row * 0.03);

        // Scale body — overlapping U-arc shape
        ctx.fillStyle = `rgba(${48 + row * 4}, ${50 + row * 4}, ${58 + row * 3}, ${0.35 + scaleDepth})`;
        ctx.beginPath();
        ctx.moveTo(sx - sw, sy - sh * 0.3);
        ctx.quadraticCurveTo(sx - sw * 0.8, sy + sh * 0.8, sx, sy + sh);
        ctx.quadraticCurveTo(
          sx + sw * 0.8,
          sy + sh * 0.8,
          sx + sw,
          sy - sh * 0.3
        );
        ctx.closePath();
        ctx.fill();

        // Upper highlight edge
        ctx.strokeStyle = `rgba(${100 + row * 5}, ${108 + row * 5}, ${130 + row * 3}, ${0.22 + scaleBright})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(sx - sw * 0.85, sy - sh * 0.2);
        ctx.quadraticCurveTo(sx, sy - sh * 0.5, sx + sw * 0.85, sy - sh * 0.2);
        ctx.stroke();

        // Lower shadow crease
        ctx.strokeStyle = `rgba(15, 15, 22, ${0.18 + scaleDepth * 0.3})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(sx - sw * 0.65, sy + sh * 0.35);
        ctx.quadraticCurveTo(
          sx,
          sy + sh * 1.05,
          sx + sw * 0.65,
          sy + sh * 0.35
        );
        ctx.stroke();
      }
    }
    ctx.restore();

    // Central crest ridge — raised segmented spine from crown to brow
    const ridgeG = ctx.createLinearGradient(
      helmCX - size * 0.03,
      helmCY,
      helmCX + size * 0.03,
      helmCY
    );
    ridgeG.addColorStop(0, "#252530");
    ridgeG.addColorStop(0.2, "#3e3e4a");
    ridgeG.addColorStop(0.35, "#52525e");
    ridgeG.addColorStop(0.5, "#5e5e6a");
    ridgeG.addColorStop(0.65, "#52525e");
    ridgeG.addColorStop(0.8, "#3e3e4a");
    ridgeG.addColorStop(1, "#252530");
    ctx.fillStyle = ridgeG;
    ctx.beginPath();
    ctx.moveTo(helmCX - size * 0.024, helmTop - size * 0.015);
    ctx.bezierCurveTo(
      helmCX - size * 0.034,
      helmTop + size * 0.12,
      helmCX - size * 0.038,
      helmBrowY - size * 0.06,
      helmCX - size * 0.034,
      helmBrowY + size * 0.025
    );
    ctx.lineTo(helmCX + size * 0.034, helmBrowY + size * 0.025);
    ctx.bezierCurveTo(
      helmCX + size * 0.038,
      helmBrowY - size * 0.06,
      helmCX + size * 0.034,
      helmTop + size * 0.12,
      helmCX + size * 0.024,
      helmTop - size * 0.015
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(100, 100, 115, 0.35)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Spine segmentation lines across ridge
    for (let seg = 0; seg < 6; seg++) {
      const segT = (seg + 1) / 7;
      const segY = helmTop + (helmBrowY - helmTop + size * 0.02) * segT;
      const segHalfW = size * (0.026 + segT * 0.008);
      ctx.strokeStyle = `rgba(30, 30, 38, ${0.4 + seg * 0.04})`;
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(helmCX - segHalfW, segY);
      ctx.lineTo(helmCX + segHalfW, segY);
      ctx.stroke();
      ctx.strokeStyle = `rgba(90, 92, 108, ${0.15 + seg * 0.02})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(helmCX - segHalfW, segY - size * 0.003);
      ctx.lineTo(helmCX + segHalfW, segY - size * 0.003);
      ctx.stroke();
    }

    // Glowing energy line down the center of the spine
    ctx.strokeStyle = `rgba(255, 100, 30, ${0.15 + flamePulse * 0.1})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.shadowColor = "rgba(255, 80, 20, 0.3)";
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(helmCX, helmTop + size * 0.01);
    ctx.bezierCurveTo(
      helmCX,
      helmTop + size * 0.1,
      helmCX,
      helmBrowY - size * 0.08,
      helmCX,
      helmBrowY + size * 0.01
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Brow plate (thickened band across the brow, separating dome from face)
    const browG = ctx.createLinearGradient(
      helmCX - helmW,
      helmBrowY,
      helmCX + helmW,
      helmBrowY
    );
    browG.addColorStop(0, "#3a3e46");
    browG.addColorStop(0.2, "#4e525a");
    browG.addColorStop(0.5, "#585c64");
    browG.addColorStop(0.8, "#4e525a");
    browG.addColorStop(1, "#3a3e46");
    ctx.fillStyle = browG;
    ctx.beginPath();
    ctx.moveTo(helmCX - helmW * 1, helmBrowY - size * 0.025);
    ctx.quadraticCurveTo(
      helmCX,
      helmBrowY - size * 0.04,
      helmCX + helmW * 1,
      helmBrowY - size * 0.025
    );
    ctx.lineTo(helmCX + helmW * 1, helmBrowY + size * 0.025);
    ctx.quadraticCurveTo(
      helmCX,
      helmBrowY + size * 0.01,
      helmCX - helmW * 1,
      helmBrowY + size * 0.025
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6a5010";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Gold crown band on the brow plate — ornate with rune engravings
    const bandG = ctx.createLinearGradient(
      helmCX - helmW,
      helmBrowY,
      helmCX + helmW,
      helmBrowY
    );
    bandG.addColorStop(0, "#5a4008");
    bandG.addColorStop(0.1, "#7a5a10");
    bandG.addColorStop(0.2, "#9a7a1a");
    bandG.addColorStop(0.35, "#b89025");
    bandG.addColorStop(0.5, "#d4a82c");
    bandG.addColorStop(0.65, "#b89025");
    bandG.addColorStop(0.8, "#9a7a1a");
    bandG.addColorStop(0.9, "#7a5a10");
    bandG.addColorStop(1, "#5a4008");
    ctx.fillStyle = bandG;
    ctx.beginPath();
    ctx.moveTo(helmCX - helmW * 0.95, helmBrowY - size * 0.014);
    ctx.quadraticCurveTo(
      helmCX,
      helmBrowY - size * 0.028,
      helmCX + helmW * 0.95,
      helmBrowY - size * 0.014
    );
    ctx.lineTo(helmCX + helmW * 0.95, helmBrowY + size * 0.014);
    ctx.quadraticCurveTo(
      helmCX,
      helmBrowY - size * 0.002,
      helmCX - helmW * 0.95,
      helmBrowY + size * 0.014
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6a4a08";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Rune engravings on the gold band (geometric symbols)
    ctx.strokeStyle = "rgba(90, 60, 10, 0.45)";
    ctx.lineWidth = 0.5 * zoom;
    for (let r = 0; r < 5; r++) {
      const rt = (r + 1) / 6;
      const rx = helmCX + (rt - 0.5) * helmW * 1.6;
      const ry = helmBrowY - size * 0.002;
      const rs = size * 0.01;
      if (r % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(rx - rs, ry - rs * 0.6);
        ctx.lineTo(rx, ry + rs * 0.6);
        ctx.lineTo(rx + rs, ry - rs * 0.6);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(rx, ry - rs * 0.7);
        ctx.lineTo(rx, ry + rs * 0.7);
        ctx.moveTo(rx - rs * 0.5, ry);
        ctx.lineTo(rx + rs * 0.5, ry);
        ctx.stroke();
      }
    }

    // Band highlight shimmer
    ctx.strokeStyle = "rgba(230, 200, 100, 0.2)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(helmCX - helmW * 0.85, helmBrowY - size * 0.01);
    ctx.quadraticCurveTo(
      helmCX,
      helmBrowY - size * 0.022,
      helmCX + helmW * 0.85,
      helmBrowY - size * 0.01
    );
    ctx.stroke();

    // Dramatic curved dragon horns rising from crown
    for (let side = -1; side <= 1; side += 2) {
      const hornBaseX = helmCX + side * size * 0.1;
      const hornBaseY = helmTop - size * 0.01;
      const hornTipX = helmCX + side * size * 0.24;
      const hornTipY = helmTop - size * 0.24;
      const hornThick = size * 0.032;

      // Horn shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.beginPath();
      ctx.moveTo(hornBaseX - side * hornThick, hornBaseY + size * 0.008);
      ctx.bezierCurveTo(
        hornBaseX + side * size * 0.04,
        hornBaseY - size * 0.1,
        hornTipX - side * size * 0.05,
        hornTipY + size * 0.07,
        hornTipX + side * size * 0.01,
        hornTipY + size * 0.012
      );
      ctx.lineTo(hornTipX - side * size * 0.005, hornTipY + size * 0.022);
      ctx.bezierCurveTo(
        hornTipX - side * size * 0.07,
        hornTipY + size * 0.09,
        hornBaseX + side * size * 0.02,
        hornBaseY - size * 0.04,
        hornBaseX + side * hornThick,
        hornBaseY + size * 0.008
      );
      ctx.closePath();
      ctx.fill();

      // Horn body — dark bone with warm tones
      const hornG = ctx.createLinearGradient(
        hornBaseX,
        hornBaseY,
        hornTipX,
        hornTipY
      );
      hornG.addColorStop(0, "#5a4a2a");
      hornG.addColorStop(0.15, "#7a6a3a");
      hornG.addColorStop(0.3, "#9a8a4a");
      hornG.addColorStop(0.5, "#b09a55");
      hornG.addColorStop(0.7, "#a08845");
      hornG.addColorStop(0.85, "#8a7535");
      hornG.addColorStop(1, "#c9a830");
      ctx.fillStyle = hornG;
      ctx.beginPath();
      ctx.moveTo(hornBaseX - side * hornThick, hornBaseY);
      ctx.bezierCurveTo(
        hornBaseX + side * size * 0.04,
        hornBaseY - size * 0.1,
        hornTipX - side * size * 0.05,
        hornTipY + size * 0.06,
        hornTipX,
        hornTipY
      );
      ctx.bezierCurveTo(
        hornTipX - side * size * 0.02,
        hornTipY + size * 0.018,
        hornTipX - side * size * 0.07,
        hornTipY + size * 0.07,
        hornBaseX + side * hornThick,
        hornBaseY
      );
      ctx.closePath();
      ctx.fill();

      // Horn segmentation rings
      for (let seg = 0; seg < 5; seg++) {
        const t = 0.15 + seg * 0.16;
        const segX = hornBaseX + (hornTipX - hornBaseX) * t;
        const segY =
          hornBaseY +
          (hornTipY - hornBaseY) * t +
          size * 0.015 * Math.sin(t * Math.PI);
        const segW = hornThick * (1.15 - t * 0.55);
        const segAngle =
          Math.atan2(hornTipY - hornBaseY, (hornTipX - hornBaseX) * side) +
          Math.PI * 0.5;
        ctx.strokeStyle = `rgba(55, 45, 22, ${0.5 - seg * 0.06})`;
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(
          segX - Math.cos(segAngle) * segW,
          segY - Math.sin(segAngle) * segW
        );
        ctx.lineTo(
          segX + Math.cos(segAngle) * segW,
          segY + Math.sin(segAngle) * segW
        );
        ctx.stroke();
      }

      // Horn specular highlight
      ctx.strokeStyle = "rgba(220, 200, 140, 0.28)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(hornBaseX, hornBaseY - size * 0.006);
      ctx.bezierCurveTo(
        hornBaseX + side * size * 0.03,
        hornBaseY - size * 0.08,
        hornTipX - side * size * 0.04,
        hornTipY + size * 0.05,
        hornTipX - side * size * 0.005,
        hornTipY + size * 0.004
      );
      ctx.stroke();

      // Glowing horn tip (heat effect)
      ctx.fillStyle = `rgba(255, 140, 40, ${0.55 * flamePulse})`;
      ctx.shadowColor = "#ff8800";
      ctx.shadowBlur = 6 * zoom * flamePulse;
      ctx.beginPath();
      ctx.arc(hornTipX, hornTipY + size * 0.005, size * 0.007, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gold border outline
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 0.9 * zoom;
      ctx.beginPath();
      ctx.moveTo(hornBaseX - side * hornThick, hornBaseY);
      ctx.bezierCurveTo(
        hornBaseX + side * size * 0.04,
        hornBaseY - size * 0.1,
        hornTipX - side * size * 0.05,
        hornTipY + size * 0.06,
        hornTipX,
        hornTipY
      );
      ctx.bezierCurveTo(
        hornTipX - side * size * 0.02,
        hornTipY + size * 0.018,
        hornTipX - side * size * 0.07,
        hornTipY + size * 0.07,
        hornBaseX + side * hornThick,
        hornBaseY
      );
      ctx.closePath();
      ctx.stroke();
    }

    // Central crown spike — tallest point
    {
      const spikeX = helmCX;
      const spikeBaseY = helmTop - size * 0.025;
      const spikeTipY = helmTop - size * 0.19;
      const spikeW = size * 0.024;

      const spikeG = ctx.createLinearGradient(
        spikeX - spikeW,
        spikeBaseY,
        spikeX + spikeW,
        spikeTipY
      );
      spikeG.addColorStop(0, "#7a5a10");
      spikeG.addColorStop(0.2, "#9a7a1a");
      spikeG.addColorStop(0.4, "#b89025");
      spikeG.addColorStop(0.6, "#c9a227");
      spikeG.addColorStop(0.8, "#dab030");
      spikeG.addColorStop(1, "#e8c040");
      ctx.fillStyle = spikeG;
      ctx.beginPath();
      ctx.moveTo(spikeX - spikeW, spikeBaseY);
      ctx.bezierCurveTo(
        spikeX - spikeW * 0.6,
        spikeBaseY - size * 0.1,
        spikeX - spikeW * 0.2,
        spikeTipY + size * 0.02,
        spikeX,
        spikeTipY
      );
      ctx.bezierCurveTo(
        spikeX + spikeW * 0.2,
        spikeTipY + size * 0.02,
        spikeX + spikeW * 0.6,
        spikeBaseY - size * 0.1,
        spikeX + spikeW,
        spikeBaseY
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#6a4a08";
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();

      // Gem at tip of central spike
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 6 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(spikeX, spikeTipY + size * 0.012, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Dragon head emblem on forehead (centerpiece between dome and brow)
    {
      const embX = helmCX;
      const embY = helmBrowY - size * 0.06;
      const embS = size * 0.045;

      // Hexagonal backing plate
      const embBG = ctx.createRadialGradient(
        embX,
        embY,
        0,
        embX,
        embY,
        embS * 1.3
      );
      embBG.addColorStop(0, "#3a3a42");
      embBG.addColorStop(0.5, "#2a2a32");
      embBG.addColorStop(1, "#1a1a22");
      ctx.fillStyle = embBG;
      ctx.beginPath();
      ctx.moveTo(embX, embY - embS * 1.1);
      ctx.lineTo(embX + embS * 0.9, embY - embS * 0.2);
      ctx.lineTo(embX + embS * 0.7, embY + embS * 0.9);
      ctx.lineTo(embX, embY + embS * 1.15);
      ctx.lineTo(embX - embS * 0.7, embY + embS * 0.9);
      ctx.lineTo(embX - embS * 0.9, embY - embS * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();

      // Dragon face — iconic V-shaped snout
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(embX - embS * 0.35, embY - embS * 0.3);
      ctx.lineTo(embX, embY + embS * 0.5);
      ctx.lineTo(embX + embS * 0.35, embY - embS * 0.3);
      ctx.stroke();
      // Dragon horns on emblem
      ctx.beginPath();
      ctx.moveTo(embX - embS * 0.22, embY - embS * 0.22);
      ctx.lineTo(embX - embS * 0.55, embY - embS * 0.72);
      ctx.moveTo(embX + embS * 0.22, embY - embS * 0.22);
      ctx.lineTo(embX + embS * 0.55, embY - embS * 0.72);
      ctx.stroke();
      // Dragon eyes — glowing
      ctx.fillStyle = `rgba(255, 60, 20, ${0.65 + 0.35 * gemPulse})`;
      ctx.shadowColor = "#ff2200";
      ctx.shadowBlur = 4 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(
        embX - embS * 0.18,
        embY - embS * 0.05,
        size * 0.005,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        embX + embS * 0.18,
        embY - embS * 0.05,
        size * 0.005,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Central gem in emblem mouth
      const embGemG = ctx.createRadialGradient(
        embX - size * 0.002,
        embY + embS * 0.13,
        0,
        embX,
        embY + embS * 0.15,
        size * 0.009
      );
      embGemG.addColorStop(0, "#ff4040");
      embGemG.addColorStop(0.5, "#dc2626");
      embGemG.addColorStop(1, "#8a1010");
      ctx.fillStyle = embGemG;
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 5 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(embX, embY + embS * 0.15, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#daa520";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    // Side ruby gems on crown band (with proper bezels and facets)
    for (let side = -1; side <= 1; side += 2) {
      const gemX = helmCX + side * size * 0.2;
      const gemY = helmBrowY;
      // Gold bezel setting
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.013, 0, Math.PI * 2);
      ctx.stroke();
      // Ruby gem with radial facets
      const rubyG = ctx.createRadialGradient(
        gemX - size * 0.003,
        gemY - size * 0.003,
        0,
        gemX,
        gemY,
        size * 0.011
      );
      rubyG.addColorStop(0, "#ff4545");
      rubyG.addColorStop(0.35, "#dc2626");
      rubyG.addColorStop(0.7, "#a01818");
      rubyG.addColorStop(1, "#7a0e0e");
      ctx.fillStyle = rubyG;
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 6 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(gemX, gemY, size * 0.011, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Specular highlight on gem
      ctx.fillStyle = "rgba(255, 200, 200, 0.5)";
      ctx.beginPath();
      ctx.arc(
        gemX - size * 0.003,
        gemY - size * 0.003,
        size * 0.004,
        0,
        Math.PI * 2
      );
      ctx.fill();
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
      const finG = ctx.createLinearGradient(
        finBaseX,
        finBaseY,
        finTipX,
        finTipY
      );
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
        finBaseX + side * size * 0.05,
        finBaseY - size * 0.1,
        finTipX - side * size * 0.06,
        finTipY + size * 0.08,
        finTipX,
        finTipY
      );
      // Tip (sharp point)
      ctx.lineTo(finTipX + side * size * 0.008, finTipY + size * 0.005);
      // Outer edge (away from center)
      ctx.bezierCurveTo(
        finTipX - side * size * 0.02,
        finTipY + size * 0.1,
        finBaseX + side * size * 0.08,
        finBaseY - size * 0.05,
        finBaseX + side * finThick * 0.8,
        finBaseY
      );
      ctx.closePath();
      ctx.fill();

      // Specular highlight along the fin
      ctx.strokeStyle = "rgba(255, 240, 180, 0.35)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(finBaseX, finBaseY - size * 0.003);
      ctx.bezierCurveTo(
        finBaseX + side * size * 0.06,
        finBaseY - size * 0.1,
        finTipX - side * size * 0.05,
        finTipY + size * 0.08,
        finTipX,
        finTipY + size * 0.003
      );
      ctx.stroke();

      // Gold border highlight
      ctx.strokeStyle = "#8a6a15";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(finBaseX - side * finThick * 0.3, finBaseY);
      ctx.bezierCurveTo(
        finBaseX + side * size * 0.05,
        finBaseY - size * 0.1,
        finTipX - side * size * 0.06,
        finTipY + size * 0.08,
        finTipX,
        finTipY
      );
      ctx.lineTo(finTipX + side * size * 0.008, finTipY + size * 0.005);
      ctx.bezierCurveTo(
        finTipX - side * size * 0.02,
        finTipY + size * 0.1,
        finBaseX + side * size * 0.08,
        finBaseY - size * 0.05,
        finBaseX + side * finThick * 0.8,
        finBaseY
      );
      ctx.closePath();
      ctx.stroke();

      // Ruby gem at fin base
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 4 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(
        finBaseX + side * size * 0.02,
        finBaseY - size * 0.02,
        size * 0.008,
        0,
        Math.PI * 2
      );
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

      const tpG = ctx.createLinearGradient(
        tpX - side * tpW * 0.3,
        tpY - tpH * 0.5,
        tpX + side * tpW * 0.5,
        tpY + tpH * 0.3
      );
      tpG.addColorStop(0, "#62666e");
      tpG.addColorStop(0.3, "#50545c");
      tpG.addColorStop(0.6, "#3c4048");
      tpG.addColorStop(1, "#262830");
      ctx.fillStyle = tpG;
      ctx.beginPath();
      ctx.moveTo(tpX - side * size * 0.02, tpY - tpH * 0.55);
      ctx.bezierCurveTo(
        tpX + side * tpW * 0.4,
        tpY - tpH * 0.6,
        tpX + side * tpW * 0.7,
        tpY - tpH * 0.2,
        tpX + side * tpW * 0.6,
        tpY + tpH * 0.15
      );
      ctx.bezierCurveTo(
        tpX + side * tpW * 0.4,
        tpY + tpH * 0.4,
        tpX + side * tpW * 0.1,
        tpY + tpH * 0.35,
        tpX - side * size * 0.03,
        tpY + tpH * 0.1
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();

      // Gold edge accent
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(tpX - side * size * 0.02, tpY - tpH * 0.55);
      ctx.bezierCurveTo(
        tpX + side * tpW * 0.4,
        tpY - tpH * 0.6,
        tpX + side * tpW * 0.7,
        tpY - tpH * 0.2,
        tpX + side * tpW * 0.6,
        tpY + tpH * 0.15
      );
      ctx.stroke();

      // Etched dragon scale on temple
      ctx.strokeStyle = "rgba(160, 140, 80, 0.25)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.arc(
        tpX + side * tpW * 0.25,
        tpY - tpH * 0.1,
        size * 0.02,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Main cheek plate (larger, curved)
    {
      const chkX = helmCX + side * size * 0.28;
      const chkY = y - size * 0.38;
      const chkW = size * 0.15;
      const chkH = size * 0.28;

      const chkG = ctx.createLinearGradient(
        chkX - side * chkW * 0.3,
        chkY - chkH * 0.4,
        chkX + side * chkW * 0.5,
        chkY + chkH * 0.4
      );
      chkG.addColorStop(0, "#5a5e68");
      chkG.addColorStop(0.25, "#4a4e58");
      chkG.addColorStop(0.5, "#3a3e48");
      chkG.addColorStop(0.75, "#30343c");
      chkG.addColorStop(1, "#20222a");
      ctx.fillStyle = chkG;
      ctx.beginPath();
      ctx.moveTo(chkX - side * size * 0.01, chkY - chkH * 0.5);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.5,
        chkY - chkH * 0.5,
        chkX + side * chkW * 0.75,
        chkY - chkH * 0.15,
        chkX + side * chkW * 0.7,
        chkY + chkH * 0.1
      );
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.6,
        chkY + chkH * 0.4,
        chkX + side * chkW * 0.2,
        chkY + chkH * 0.5,
        chkX - side * size * 0.02,
        chkY + chkH * 0.35
      );
      ctx.closePath();
      ctx.fill();

      // Specular highlight (cool steel)
      const chkSpec = ctx.createRadialGradient(
        chkX + side * chkW * 0.15,
        chkY - chkH * 0.15,
        0,
        chkX + side * chkW * 0.15,
        chkY - chkH * 0.15,
        chkW * 0.5
      );
      chkSpec.addColorStop(0, "rgba(145, 150, 170, 0.22)");
      chkSpec.addColorStop(1, "rgba(60, 65, 80, 0)");
      ctx.fillStyle = chkSpec;
      ctx.fill();

      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();

      // Gold trim along outer edge
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(chkX - side * size * 0.01, chkY - chkH * 0.5);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.5,
        chkY - chkH * 0.5,
        chkX + side * chkW * 0.75,
        chkY - chkH * 0.15,
        chkX + side * chkW * 0.7,
        chkY + chkH * 0.1
      );
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.6,
        chkY + chkH * 0.4,
        chkX + side * chkW * 0.2,
        chkY + chkH * 0.5,
        chkX - side * size * 0.02,
        chkY + chkH * 0.35
      );
      ctx.stroke();

      // Raised ridge line across cheek
      ctx.strokeStyle = "#50545e";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(chkX, chkY - chkH * 0.2);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.4,
        chkY - chkH * 0.15,
        chkX + side * chkW * 0.5,
        chkY + chkH * 0.05,
        chkX + side * chkW * 0.35,
        chkY + chkH * 0.25
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(100, 100, 110, 0.3)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(chkX - size * 0.002, chkY - chkH * 0.2 - size * 0.002);
      ctx.bezierCurveTo(
        chkX + side * chkW * 0.4 - size * 0.002,
        chkY - chkH * 0.15 - size * 0.002,
        chkX + side * chkW * 0.5 - size * 0.002,
        chkY + chkH * 0.05 - size * 0.002,
        chkX + side * chkW * 0.35 - size * 0.002,
        chkY + chkH * 0.25 - size * 0.002
      );
      ctx.stroke();

      // Two rivets
      for (let r = 0; r < 2; r++) {
        const rx = chkX + side * chkW * (0.2 + r * 0.2);
        const ry = chkY + (r === 0 ? -chkH * 0.2 : chkH * 0.15);
        const rvG = ctx.createRadialGradient(
          rx - size * 0.002,
          ry - size * 0.002,
          0,
          rx,
          ry,
          size * 0.009
        );
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

      const jawG = ctx.createLinearGradient(
        jawX,
        jawY - jawH * 0.5,
        jawX,
        jawY + jawH * 0.5
      );
      jawG.addColorStop(0, "#484c54");
      jawG.addColorStop(0.5, "#343840");
      jawG.addColorStop(1, "#1c1e24");
      ctx.fillStyle = jawG;
      ctx.beginPath();
      ctx.moveTo(jawX - side * jawW * 0.3, jawY - jawH * 0.5);
      ctx.lineTo(jawX + side * jawW * 0.6, jawY - jawH * 0.45);
      ctx.bezierCurveTo(
        jawX + side * jawW * 0.8,
        jawY,
        jawX + side * jawW * 0.4,
        jawY + jawH * 0.4,
        jawX,
        jawY + jawH * 0.5
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
      ctx.arc(
        jawX + side * jawW * 0.1,
        jawY + jawH * 0.42,
        size * 0.006,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Ear guard (small raised disc on side of helm)
    {
      const earX = helmCX + side * size * 0.33;
      const earY = helmCY + size * 0.02;
      const earR = size * 0.04;

      const earG = ctx.createRadialGradient(
        earX - side * earR * 0.3,
        earY - earR * 0.3,
        0,
        earX,
        earY,
        earR
      );
      earG.addColorStop(0, "#5a5e66");
      earG.addColorStop(0.5, "#3c4048");
      earG.addColorStop(1, "#20222a");
      ctx.fillStyle = earG;
      ctx.beginPath();
      ctx.arc(earX, earY, earR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7a5a10";
      ctx.lineWidth = 1 * zoom;
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
    const visorCY = y - size * 0.455;
    const visorH = size * 0.27;
    const visorW = size * 0.26;
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Aggressive V-slit visor shape — angry brow dips at center, pointed chin
    const drawVisorPath = () => {
      ctx.beginPath();
      // Left wing tip (outer upper corner)
      ctx.moveTo(x - visorW, visorCY - visorH * 0.12);
      // Top edge: angry V — sweeps up to wings, dips at center
      ctx.bezierCurveTo(
        x - visorW * 0.65,
        visorCY - visorH * 0.52,
        x - visorW * 0.3,
        visorCY - visorH * 0.38,
        x,
        visorCY - visorH * 0.22
      );
      ctx.bezierCurveTo(
        x + visorW * 0.3,
        visorCY - visorH * 0.38,
        x + visorW * 0.65,
        visorCY - visorH * 0.52,
        x + visorW,
        visorCY - visorH * 0.12
      );
      // Right side down
      ctx.bezierCurveTo(
        x + visorW * 0.92,
        visorCY + visorH * 0.1,
        x + visorW * 0.55,
        visorCY + visorH * 0.35,
        x + visorW * 0.25,
        visorCY + visorH * 0.42
      );
      // Chin point
      ctx.quadraticCurveTo(
        x,
        visorCY + visorH * 0.52,
        x - visorW * 0.25,
        visorCY + visorH * 0.42
      );
      // Left side up
      ctx.bezierCurveTo(
        x - visorW * 0.55,
        visorCY + visorH * 0.35,
        x - visorW * 0.92,
        visorCY + visorH * 0.1,
        x - visorW,
        visorCY - visorH * 0.12
      );
      ctx.closePath();
    };

    // Deep hellfire void behind everything
    const visorGlow = isAttacking ? 1 : 0.82;
    ctx.fillStyle = `rgba(60, 4, 2, ${visorGlow})`;
    drawVisorPath();
    ctx.fill();
    const voidG = ctx.createRadialGradient(
      x,
      visorCY,
      0,
      x,
      visorCY,
      size * 0.2
    );
    voidG.addColorStop(0, `rgba(160, 25, 8, ${visorGlow * 0.85})`);
    voidG.addColorStop(0.35, `rgba(110, 14, 4, ${visorGlow * 0.65})`);
    voidG.addColorStop(0.7, `rgba(60, 6, 2, ${visorGlow * 0.4})`);
    voidG.addColorStop(1, `rgba(25, 2, 1, ${visorGlow * 0.3})`);
    ctx.fillStyle = voidG;
    drawVisorPath();
    ctx.fill();

    // Angular glowing eyes (behind grille — diamond-shaped slits)
    for (let side = -1; side <= 1; side += 2) {
      const eyeX = x + side * size * 0.09;
      const eyeY = visorCY - size * 0.02;
      const eyeW = size * 0.085;
      const eyeH = size * 0.022;
      const eyeAngle = side * -0.15;
      const eyeFlicker = Math.sin(time * 8 + side * 1.5) * 0.08;

      // Massive glow halo
      ctx.fillStyle = isAttacking
        ? `rgba(255, 35, 8, ${0.85 + attackIntensity * 0.15})`
        : `rgba(255, 30, 8, ${0.7 + eyeFlicker})`;
      ctx.shadowColor = "#ff1100";
      ctx.shadowBlur = isAttacking ? 35 * zoom : 22 * zoom;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, eyeW * 2.2, eyeH * 4, eyeAngle, 0, Math.PI * 2);
      ctx.fill();

      // Outer flame trail streaming outward from eye
      ctx.fillStyle = `rgba(255, 50, 10, ${0.4 + eyeFlicker})`;
      ctx.shadowBlur = 14 * zoom;
      ctx.beginPath();
      ctx.moveTo(eyeX + side * eyeW * 0.5, eyeY - eyeH * 0.8);
      ctx.bezierCurveTo(
        eyeX + side * eyeW * 1.5,
        eyeY - eyeH * 1.5,
        eyeX + side * eyeW * 2.2,
        eyeY - eyeH * 0.6,
        eyeX + side * eyeW * 2.8,
        eyeY - eyeH * 1.2
      );
      ctx.bezierCurveTo(
        eyeX + side * eyeW * 2,
        eyeY + eyeH * 0.5,
        eyeX + side * eyeW * 1.3,
        eyeY + eyeH * 1,
        eyeX + side * eyeW * 0.5,
        eyeY + eyeH * 0.8
      );
      ctx.closePath();
      ctx.fill();

      // Angular eye slit (diamond shape, not ellipse)
      ctx.fillStyle = isAttacking
        ? "#ff4020"
        : `rgba(255, 48, 22, ${0.95 + eyeFlicker})`;
      ctx.shadowColor = "#ff2200";
      ctx.shadowBlur = isAttacking ? 26 * zoom : 18 * zoom;
      ctx.beginPath();
      ctx.moveTo(eyeX - eyeW, eyeY);
      ctx.lineTo(eyeX - eyeW * 0.15, eyeY - eyeH * 1.1);
      ctx.lineTo(eyeX + eyeW, eyeY);
      ctx.lineTo(eyeX - eyeW * 0.15, eyeY + eyeH * 1.1);
      ctx.closePath();
      ctx.fill();

      // Hot inner core (shifted forward in the slit)
      ctx.fillStyle = isAttacking ? "#ffdd88" : "#ffaa55";
      ctx.shadowBlur = 14 * zoom;
      ctx.beginPath();
      ctx.moveTo(eyeX - eyeW * 0.4, eyeY);
      ctx.lineTo(eyeX + eyeW * 0.1, eyeY - eyeH * 0.7);
      ctx.lineTo(eyeX + eyeW * 0.6, eyeY);
      ctx.lineTo(eyeX + eyeW * 0.1, eyeY + eyeH * 0.7);
      ctx.closePath();
      ctx.fill();

      // White-hot pupil
      ctx.fillStyle = isAttacking ? "#ffffff" : "#fff4e0";
      ctx.shadowColor = "#ffcc77";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(eyeX + side * size * 0.012, eyeY, size * 0.009, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // === GRILLE — diagonal slash marks + pointed nose guard ===
    ctx.save();
    drawVisorPath();
    ctx.clip();

    // Diagonal slash bars (angled outward from center — aggressive pattern)
    for (let side = -1; side <= 1; side += 2) {
      for (let s = 0; s < 3; s++) {
        const slashX = x + side * (size * 0.04 + s * size * 0.06);
        const slashTopY = visorCY - visorH * 0.5;
        const slashBotY = visorCY + visorH * 0.5;
        const slashLean = side * size * 0.025 * (1 + s * 0.3);

        ctx.strokeStyle = "#15161a";
        ctx.lineWidth = 1.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(slashX - slashLean, slashTopY);
        ctx.lineTo(slashX + slashLean, slashBotY);
        ctx.stroke();

        ctx.strokeStyle = "#3e4048";
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(slashX - slashLean, slashTopY);
        ctx.lineTo(slashX + slashLean, slashBotY);
        ctx.stroke();

        // Steel highlight on one side
        ctx.strokeStyle = "rgba(90, 95, 110, 0.2)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(slashX - slashLean - 0.5, slashTopY);
        ctx.lineTo(slashX + slashLean - 0.5, slashBotY);
        ctx.stroke();
      }
    }

    // Pointed nose guard — dragon snout shape (thicker, angular)
    {
      const noseTopY = visorCY - visorH * 0.45;
      const noseBotY = visorCY + visorH * 0.5;
      const noseW = size * 0.018;

      // Nose guard body — tapers to a point at bottom
      const noseG = ctx.createLinearGradient(
        x - noseW,
        visorCY,
        x + noseW,
        visorCY
      );
      noseG.addColorStop(0, "#1a1b20");
      noseG.addColorStop(0.3, "#3a3c46");
      noseG.addColorStop(0.5, "#4a4d58");
      noseG.addColorStop(0.7, "#3a3c46");
      noseG.addColorStop(1, "#1a1b20");
      ctx.fillStyle = noseG;
      ctx.beginPath();
      ctx.moveTo(x - noseW, noseTopY);
      ctx.lineTo(x + noseW, noseTopY);
      ctx.lineTo(x + noseW * 0.5, noseBotY - size * 0.02);
      ctx.lineTo(x, noseBotY);
      ctx.lineTo(x - noseW * 0.5, noseBotY - size * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#0e0f12";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Raised center line on nose guard
      ctx.strokeStyle = "rgba(80, 85, 100, 0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(x, noseTopY + size * 0.01);
      ctx.lineTo(x, noseBotY - size * 0.01);
      ctx.stroke();
    }

    ctx.restore(); // un-clip

    // Eye glow bleed on TOP of grille (screen blend)
    ctx.save();
    drawVisorPath();
    ctx.clip();
    for (let side = -1; side <= 1; side += 2) {
      const eyeX = x + side * size * 0.09;
      const eyeY = visorCY - size * 0.02;
      const eyeAngle = side * -0.15;
      const eyeFlicker = Math.sin(time * 8 + side * 1.5) * 0.06;
      ctx.globalCompositeOperation = "screen";
      const glowG = ctx.createRadialGradient(
        eyeX,
        eyeY,
        0,
        eyeX,
        eyeY,
        size * 0.09
      );
      glowG.addColorStop(
        0,
        isAttacking
          ? `rgba(255, 90, 35, 0.85)`
          : `rgba(255, 70, 25, ${0.7 + eyeFlicker})`
      );
      glowG.addColorStop(
        0.3,
        isAttacking
          ? "rgba(255, 50, 15, 0.55)"
          : `rgba(255, 40, 12, ${0.38 + eyeFlicker})`
      );
      glowG.addColorStop(0.7, "rgba(255, 20, 5, 0.08)");
      glowG.addColorStop(1, "rgba(255, 10, 2, 0)");
      ctx.fillStyle = glowG;
      ctx.beginPath();
      ctx.ellipse(
        eyeX,
        eyeY,
        size * 0.1,
        size * 0.045,
        eyeAngle,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();

    // Prominent brow ridge overhanging the visor top
    {
      const browRidgeY = visorCY - visorH * 0.35;
      const browG = ctx.createLinearGradient(
        x - visorW,
        browRidgeY,
        x + visorW,
        browRidgeY
      );
      browG.addColorStop(0, "#3a3d48");
      browG.addColorStop(0.2, "#4a4e5a");
      browG.addColorStop(0.5, "#55596a");
      browG.addColorStop(0.8, "#4a4e5a");
      browG.addColorStop(1, "#3a3d48");
      ctx.fillStyle = browG;
      ctx.beginPath();
      ctx.moveTo(x - visorW * 0.95, browRidgeY + size * 0.005);
      ctx.bezierCurveTo(
        x - visorW * 0.5,
        browRidgeY - size * 0.025,
        x - visorW * 0.15,
        browRidgeY - size * 0.01,
        x,
        browRidgeY + size * 0.008
      );
      ctx.bezierCurveTo(
        x + visorW * 0.15,
        browRidgeY - size * 0.01,
        x + visorW * 0.5,
        browRidgeY - size * 0.025,
        x + visorW * 0.95,
        browRidgeY + size * 0.005
      );
      ctx.lineTo(x + visorW * 0.95, browRidgeY + size * 0.018);
      ctx.quadraticCurveTo(
        x,
        browRidgeY + size * 0.025,
        x - visorW * 0.95,
        browRidgeY + size * 0.018
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2a2c34";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }

    // Gold visor frame — heavy, ornate
    const frameG = ctx.createLinearGradient(
      x - visorW,
      visorCY - visorH * 0.5,
      x + visorW,
      visorCY + visorH * 0.5
    );
    frameG.addColorStop(0, "#5a4008");
    frameG.addColorStop(0.15, "#8a6a15");
    frameG.addColorStop(0.3, "#b08a20");
    frameG.addColorStop(0.5, "#d4a82c");
    frameG.addColorStop(0.7, "#b08a20");
    frameG.addColorStop(0.85, "#8a6a15");
    frameG.addColorStop(1, "#5a4008");
    ctx.strokeStyle = frameG;
    ctx.lineWidth = 2.8 * zoom;
    drawVisorPath();
    ctx.stroke();

    // Dark outer border for crisp definition
    ctx.strokeStyle = "#1a1510";
    ctx.lineWidth = 0.9 * zoom;
    drawVisorPath();
    ctx.stroke();

    // Dragon fangs along lower visor edge (larger, curved, menacing)
    const fangPositions = [-0.35, -0.18, 0, 0.18, 0.35];
    const fangHeights = [0.022, 0.03, 0.038, 0.03, 0.022];
    for (let f = 0; f < fangPositions.length; f++) {
      const fangX = x + fangPositions[f] * visorW * 1.4;
      const fangTopY =
        visorCY + visorH * 0.38 + Math.abs(fangPositions[f]) * visorH * 0.25;
      const fangH = size * fangHeights[f];
      const fangW = size * 0.01;
      const fangCurve = fangPositions[f] * size * 0.005;

      const fangG = ctx.createLinearGradient(
        fangX,
        fangTopY,
        fangX,
        fangTopY + fangH
      );
      fangG.addColorStop(0, "#4a4d58");
      fangG.addColorStop(0.3, "#3a3d46");
      fangG.addColorStop(0.6, "#2a2c34");
      fangG.addColorStop(1, "#e0ddd5");
      ctx.fillStyle = fangG;
      ctx.beginPath();
      ctx.moveTo(fangX - fangW, fangTopY);
      ctx.quadraticCurveTo(
        fangX + fangCurve - fangW * 0.3,
        fangTopY + fangH * 0.7,
        fangX + fangCurve,
        fangTopY + fangH
      );
      ctx.quadraticCurveTo(
        fangX + fangCurve + fangW * 0.3,
        fangTopY + fangH * 0.7,
        fangX + fangW,
        fangTopY
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(80, 85, 100, 0.3)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    }

    // Breath slits below visor (narrow, angular)
    for (let hole = -2; hole <= 2; hole++) {
      const hx = x + hole * size * 0.032;
      const hy = visorCY + visorH * 0.55 + Math.abs(hole) * size * 0.008;
      ctx.fillStyle = "#08080a";
      ctx.beginPath();
      ctx.ellipse(
        hx,
        hy,
        size * 0.006,
        size * 0.003,
        hole * 0.15,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // === BLAZING FIRE PLUME (rendered above helmet) ===
  {
    const flameBaseX = x;
    const flameBaseY = y - size * 0.82;
    const flameHeight = size * 0.55;
    const flameWidth = size * 0.32;

    const flameFlicker = Math.sin(time * 6) * 0.04;
    const flameSway =
      Math.sin(time * 3.2) * size * 0.03 +
      (isAttacking ? commandPose * size * 0.05 : 0);
    const flameStretch = 1 + Math.sin(time * 4.5) * 0.08 + flamePulse * 0.12;
    const tipX = flameBaseX + flameSway;
    const tipY = flameBaseY - flameHeight * flameStretch;

    // Outer glow aura
    const auraG = ctx.createRadialGradient(
      flameBaseX,
      flameBaseY - flameHeight * 0.4,
      0,
      flameBaseX,
      flameBaseY - flameHeight * 0.4,
      flameHeight * 0.7
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
      Math.PI * 2
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
      tipY + size * 0.02
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.6,
      tipY + flameHeight * 0.2,
      flameBaseX + flameWidth * 1.2 + flameSway * 0.3,
      flameBaseY - flameHeight * 0.3,
      flameBaseX + flameWidth * 0.85,
      flameBaseY
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
      flameBaseX - flameWidth * 1 + flameSway * 0.3,
      flameBaseY - flameHeight * 0.4,
      tipX - flameWidth * 0.45,
      tipY + flameHeight * 0.12,
      tipX,
      tipY
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.45,
      tipY + flameHeight * 0.12,
      flameBaseX + flameWidth * 1 + flameSway * 0.3,
      flameBaseY - flameHeight * 0.4,
      flameBaseX + flameWidth * 0.75,
      flameBaseY
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
      tipY + size * 0.01
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.35 - flameFlicker * size,
      tipY + flameHeight * 0.08,
      flameBaseX + flameWidth * 0.85 + flameSway * 0.4,
      flameBaseY - flameHeight * 0.38,
      flameBaseX + flameWidth * 0.6,
      flameBaseY
    );
    ctx.closePath();
    ctx.fill();

    // Inner bright fire core (yellow-white hot center)
    const coreG = ctx.createLinearGradient(
      flameBaseX,
      flameBaseY,
      tipX,
      tipY - flameHeight * 0.1
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
      tipY + flameHeight * 0.08
    );
    ctx.bezierCurveTo(
      tipX + flameWidth * 0.15,
      tipY + flameHeight * 0.18,
      flameBaseX + flameWidth * 0.4 + flameSway * 0.5,
      flameBaseY - flameHeight * 0.35,
      flameBaseX + flameWidth * 0.25,
      flameBaseY - size * 0.02
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
      const tPhase = time * (4 + t * 0.5) + t * 0.9;
      const tWobble = Math.sin(tPhase) * (2 + tNorm * 4);
      const tAlpha = 0.2 + Math.sin(time * 3 + t * 0.6) * 0.1;
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
      ctx.lineWidth = (1 + (1 - Math.abs(tNorm - 0.5) * 2) * 1.5) * zoom;
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
        tEndY
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    // Bright tip wisps (white-hot flickers at the top)
    for (let w = 0; w < 8; w++) {
      const wPhase = Math.sin(time * 9 + w * 1.3);
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
        wY - size * 0.1
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
      size * 0.18
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
      flameBaseY
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
      size * 0.006
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

  // === DIVINE COMMAND FRONT HALF (in front of hero) ===
  if (isAttacking) {
    drawDivineCommandRings(
      ctx,
      "front",
      x,
      y + size * 0.45,
      size,
      zoom,
      time,
      commandPose
    );
  }

  ctx.restore();
}
