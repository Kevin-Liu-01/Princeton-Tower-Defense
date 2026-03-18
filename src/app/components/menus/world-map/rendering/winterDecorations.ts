import { drawOrganicBlobAt } from "../../../../rendering/helpers";
import type { WorldMapDrawContext } from "./drawContext";

export function drawSnowMountain(
  dc: WorldMapDrawContext,
  mx: number,
  myPct: number,
  width: number,
  heightPx: number,
) {
  const { ctx, time } = dc;
  const my = dc.getY(myPct);
  const isoDepth = heightPx * 0.35;
  const mtSeed = mx * 2.1 + myPct * 5.7;

  // Shadow underneath — organic shape
  ctx.fillStyle = "rgba(30, 50, 70, 0.3)";
  drawOrganicBlobAt(
    ctx,
    mx + width * 0.08,
    my + isoDepth * 0.4,
    width * 0.55,
    isoDepth * 0.45,
    mtSeed + 99,
    0.15,
    14,
  );
  ctx.fill();

  // Back face (shadowed right side) with strata
  const backGrad = ctx.createLinearGradient(
    mx,
    my - heightPx,
    mx + width * 0.5,
    my,
  );
  backGrad.addColorStop(0, "#7a8a9a");
  backGrad.addColorStop(0.3, "#6a7a8a");
  backGrad.addColorStop(0.6, "#5a6a7a");
  backGrad.addColorStop(1, "#4a5a6a");
  ctx.fillStyle = backGrad;
  ctx.beginPath();
  ctx.moveTo(mx + width * 0.05, my - heightPx);
  ctx.lineTo(mx + width * 0.12, my - heightPx * 0.88);
  ctx.lineTo(mx + width * 0.18, my - heightPx * 0.92);
  ctx.lineTo(mx + width * 0.25, my - heightPx * 0.75);
  ctx.lineTo(mx + width * 0.35, my - heightPx * 0.4);
  ctx.lineTo(mx + width * 0.45, my);
  ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
  ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
  ctx.closePath();
  ctx.fill();

  // Secondary ridge/spur on the right for mountain-range feel
  const spurGrad = ctx.createLinearGradient(
    mx + width * 0.15,
    my - heightPx * 0.6,
    mx + width * 0.55,
    my,
  );
  spurGrad.addColorStop(0, "#6a7a8a");
  spurGrad.addColorStop(0.5, "#556878");
  spurGrad.addColorStop(1, "#4a5a6a");
  ctx.fillStyle = spurGrad;
  ctx.beginPath();
  ctx.moveTo(mx + width * 0.18, my - heightPx * 0.65);
  ctx.bezierCurveTo(
    mx + width * 0.28,
    my - heightPx * 0.55,
    mx + width * 0.38,
    my - heightPx * 0.35,
    mx + width * 0.52,
    my + isoDepth * 0.2,
  );
  ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
  ctx.lineTo(mx + width * 0.18, my - heightPx * 0.35);
  ctx.closePath();
  ctx.fill();
  // Snow on spur ridge
  ctx.fillStyle = "rgba(230, 242, 255, 0.6)";
  ctx.beginPath();
  ctx.moveTo(mx + width * 0.18, my - heightPx * 0.65);
  ctx.quadraticCurveTo(
    mx + width * 0.25,
    my - heightPx * 0.58,
    mx + width * 0.32,
    my - heightPx * 0.48,
  );
  ctx.lineTo(mx + width * 0.28, my - heightPx * 0.46);
  ctx.quadraticCurveTo(
    mx + width * 0.22,
    my - heightPx * 0.56,
    mx + width * 0.17,
    my - heightPx * 0.62,
  );
  ctx.closePath();
  ctx.fill();

  // Front face (lit left side) with detailed gradient
  const mtGrad = ctx.createLinearGradient(
    mx - width * 0.4,
    my - heightPx,
    mx + width * 0.1,
    my + isoDepth,
  );
  mtGrad.addColorStop(0, "#f0f8ff");
  mtGrad.addColorStop(0.15, "#e8f2fc");
  mtGrad.addColorStop(0.3, "#d0e4f0");
  mtGrad.addColorStop(0.5, "#b0c8d8");
  mtGrad.addColorStop(0.7, "#90a8b8");
  mtGrad.addColorStop(1, "#708898");
  ctx.fillStyle = mtGrad;
  ctx.beginPath();
  ctx.moveTo(mx + width * 0.05, my - heightPx);
  ctx.bezierCurveTo(
    mx - width * 0.01,
    my - heightPx * 0.92,
    mx - width * 0.06,
    my - heightPx * 0.96,
    mx - width * 0.1,
    my - heightPx * 0.82,
  );
  ctx.bezierCurveTo(
    mx - width * 0.16,
    my - heightPx * 0.62,
    mx - width * 0.28,
    my - heightPx * 0.38,
    mx - width * 0.4,
    my,
  );
  ctx.lineTo(mx - width * 0.4, my + isoDepth * 0.4);
  ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
  ctx.closePath();
  ctx.fill();

  // Visible rock strata layers on front face
  ctx.save();
  ctx.globalAlpha = 0.25;
  for (let s = 0; s < 5; s++) {
    const strataY = my - heightPx * (0.15 + s * 0.14);
    const strataColor =
      s % 2 === 0 ? "rgba(90, 105, 120, 0.4)" : "rgba(70, 85, 100, 0.3)";
    ctx.fillStyle = strataColor;
    ctx.beginPath();
    const leftX = mx - width * (0.38 - s * 0.03);
    const rightX = mx + width * 0.04;
    ctx.moveTo(leftX, strataY);
    ctx.quadraticCurveTo(
      leftX + (rightX - leftX) * 0.3,
      strataY - heightPx * 0.02 + dc.seededRandom(mtSeed + s) * 3,
      rightX,
      strataY - heightPx * 0.03,
    );
    ctx.lineTo(rightX, strataY + heightPx * 0.04);
    ctx.quadraticCurveTo(
      leftX + (rightX - leftX) * 0.6,
      strataY + heightPx * 0.06 - dc.seededRandom(mtSeed + s + 10) * 2,
      leftX,
      strataY + heightPx * 0.05,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Deep crevasse shadow lines cutting across the face
  ctx.save();
  ctx.strokeStyle = "rgba(20, 35, 50, 0.35)";
  ctx.lineWidth = 1.2;
  for (let cv = 0; cv < 3; cv++) {
    const cvStartY = my - heightPx * (0.3 + cv * 0.22);
    const cvStartX = mx - width * (0.32 - cv * 0.06);
    const cvLen = width * (0.15 + dc.seededRandom(mtSeed + cv * 7) * 0.12);
    ctx.beginPath();
    ctx.moveTo(cvStartX, cvStartY);
    ctx.bezierCurveTo(
      cvStartX + cvLen * 0.3,
      cvStartY + heightPx * 0.06 + dc.seededRandom(mtSeed + cv * 3) * 4,
      cvStartX + cvLen * 0.7,
      cvStartY + heightPx * 0.02 - dc.seededRandom(mtSeed + cv * 5) * 3,
      cvStartX + cvLen,
      cvStartY + heightPx * 0.08,
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(40, 55, 70, 0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(20, 35, 50, 0.35)";
  }
  ctx.restore();

  // Exposed darker rock patches on the face
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let ep = 0; ep < 5; ep++) {
    const epX = mx - width * (0.08 + dc.seededRandom(mtSeed + ep * 11) * 0.25);
    const epY = my - heightPx * (0.15 + dc.seededRandom(mtSeed + ep * 13) * 0.6);
    const epW = 4 + dc.seededRandom(mtSeed + ep * 17) * 6;
    const epH = 2 + dc.seededRandom(mtSeed + ep * 19) * 3;
    ctx.fillStyle = dc.seededRandom(mtSeed + ep) > 0.5 ? "#4a5868" : "#3a4858";
    drawOrganicBlobAt(ctx, epX, epY, epW, epH, mtSeed + ep * 3.3, 0.25, 8);
    ctx.fill();
  }
  ctx.restore();

  // Snow accumulation on ledges
  ctx.save();
  ctx.globalAlpha = 0.6;
  for (let sl = 0; sl < 4; sl++) {
    const ledgeY = my - heightPx * (0.2 + sl * 0.16);
    const ledgeX = mx - width * (0.34 - sl * 0.04);
    const ledgeW = 8 + dc.seededRandom(mtSeed + sl * 21) * 10;
    ctx.fillStyle = "#e8f2ff";
    drawOrganicBlobAt(
      ctx,
      ledgeX + ledgeW * 0.4,
      ledgeY + 1,
      ledgeW * 0.5,
      2.5,
      mtSeed + sl * 5.1,
      0.2,
      8,
    );
    ctx.fill();
  }
  ctx.restore();

  // Isometric base edge
  ctx.fillStyle = "#5a6a7a";
  ctx.beginPath();
  ctx.moveTo(mx - width * 0.4, my + isoDepth * 0.4);
  ctx.lineTo(mx + width * 0.05, my + isoDepth * 0.25);
  ctx.lineTo(mx + width * 0.45, my + isoDepth * 0.4);
  ctx.quadraticCurveTo(
    mx + width * 0.1,
    my + isoDepth * 0.55,
    mx - width * 0.4,
    my + isoDepth * 0.4,
  );
  ctx.fill();

  // Talus/scree boulders at base
  ctx.save();
  for (let tb = 0; tb < 8; tb++) {
    const tbAngle = (tb / 8) * Math.PI - Math.PI * 0.1;
    const tbDist = width * (0.38 + dc.seededRandom(mtSeed + tb * 9) * 0.15);
    const tbX = mx + Math.cos(tbAngle) * tbDist * 0.5;
    const tbY = my + isoDepth * 0.2 + Math.sin(tbAngle) * tbDist * 0.15;
    const tbSize = 2 + dc.seededRandom(mtSeed + tb * 14) * 3;
    const tbShade = 70 + Math.floor(dc.seededRandom(mtSeed + tb * 16) * 30);
    ctx.fillStyle = `rgb(${tbShade}, ${tbShade + 10}, ${tbShade + 20})`;
    drawOrganicBlobAt(
      ctx,
      tbX,
      tbY,
      tbSize,
      tbSize * 0.6,
      mtSeed + tb * 2.7,
      0.25,
      7,
    );
    ctx.fill();
  }
  ctx.restore();

  // Snow cap with multiple sculpted layers
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(mx + width * 0.05, my - heightPx);
  ctx.lineTo(mx + width * 0.12, my - heightPx * 0.88);
  ctx.lineTo(mx + width * 0.2, my - heightPx * 0.7);
  ctx.quadraticCurveTo(
    mx + width * 0.15,
    my - heightPx * 0.72,
    mx + width * 0.1,
    my - heightPx * 0.68,
  );
  ctx.lineTo(mx + width * 0.05, my - heightPx * 0.65);
  ctx.quadraticCurveTo(
    mx - width * 0.02,
    my - heightPx * 0.75,
    mx - width * 0.08,
    my - heightPx * 0.72,
  );
  ctx.lineTo(mx - width * 0.12, my - heightPx * 0.68);
  ctx.closePath();
  ctx.fill();

  // Snow drip cascading on front face
  ctx.fillStyle = "#f0f8ff";
  ctx.beginPath();
  ctx.moveTo(mx - width * 0.02, my - heightPx * 0.9);
  ctx.lineTo(mx - width * 0.15, my - heightPx * 0.65);
  ctx.quadraticCurveTo(
    mx - width * 0.12,
    my - heightPx * 0.6,
    mx - width * 0.08,
    my - heightPx * 0.58,
  );
  ctx.lineTo(mx - width * 0.2, my - heightPx * 0.48);
  ctx.quadraticCurveTo(
    mx - width * 0.18,
    my - heightPx * 0.45,
    mx - width * 0.14,
    my - heightPx * 0.42,
  );
  ctx.lineTo(mx + width * 0.02, my - heightPx * 0.6);
  ctx.closePath();
  ctx.fill();

  // Frozen waterfall streak on front face
  ctx.save();
  const fwX = mx - width * 0.15;
  const fwStartY = my - heightPx * 0.55;
  const fwEndY = my - heightPx * 0.1;
  const fwGrad = ctx.createLinearGradient(fwX, fwStartY, fwX, fwEndY);
  fwGrad.addColorStop(0, "rgba(180, 215, 240, 0.5)");
  fwGrad.addColorStop(0.3, "rgba(160, 200, 230, 0.4)");
  fwGrad.addColorStop(0.7, "rgba(140, 190, 225, 0.25)");
  fwGrad.addColorStop(1, "rgba(120, 180, 220, 0.1)");
  ctx.strokeStyle = fwGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(fwX, fwStartY);
  ctx.bezierCurveTo(
    fwX - 3,
    fwStartY + (fwEndY - fwStartY) * 0.3,
    fwX + 4,
    fwStartY + (fwEndY - fwStartY) * 0.6,
    fwX - 1,
    fwEndY,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(210, 235, 255, 0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Rime frost crystals near summit
  ctx.save();
  ctx.globalAlpha = 0.45;
  for (let rf = 0; rf < 5; rf++) {
    const rfX =
      mx +
      width * 0.05 +
      (dc.seededRandom(mtSeed + rf * 23) - 0.5) * width * 0.15;
    const rfY =
      my - heightPx * (0.85 + dc.seededRandom(mtSeed + rf * 25) * 0.12);
    ctx.strokeStyle = "rgba(200, 230, 255, 0.7)";
    ctx.lineWidth = 0.8;
    for (let branch = 0; branch < 3; branch++) {
      const angle =
        (branch / 3) * Math.PI -
        Math.PI * 0.3 +
        dc.seededRandom(mtSeed + rf + branch) * 0.4;
      const len = 2 + dc.seededRandom(mtSeed + rf * 3 + branch) * 3;
      ctx.beginPath();
      ctx.moveTo(rfX, rfY);
      ctx.lineTo(rfX + Math.cos(angle) * len, rfY + Math.sin(angle) * len);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Snow cornices overhanging the ridgeline
  ctx.fillStyle = "rgba(240, 248, 255, 0.7)";
  ctx.beginPath();
  ctx.moveTo(mx + width * 0.12, my - heightPx * 0.88);
  ctx.quadraticCurveTo(
    mx + width * 0.16,
    my - heightPx * 0.86,
    mx + width * 0.2,
    my - heightPx * 0.82,
  );
  ctx.quadraticCurveTo(
    mx + width * 0.18,
    my - heightPx * 0.8,
    mx + width * 0.14,
    my - heightPx * 0.82,
  );
  ctx.quadraticCurveTo(
    mx + width * 0.11,
    my - heightPx * 0.85,
    mx + width * 0.12,
    my - heightPx * 0.88,
  );
  ctx.fill();

  // Wind-blown snow at summit (animated wisps)
  const windPhase = time * 1.5;
  ctx.save();
  ctx.globalAlpha = 0.4 + Math.sin(time * 2) * 0.15;
  ctx.strokeStyle = "rgba(230, 240, 255, 0.6)";
  ctx.lineWidth = 1.5;
  for (let w = 0; w < 3; w++) {
    const windX = mx + width * 0.05 + w * 4;
    const windY = my - heightPx + w * 3;
    ctx.beginPath();
    ctx.moveTo(windX, windY);
    const windLen = 15 + w * 5 + Math.sin(windPhase + w) * 8;
    ctx.quadraticCurveTo(
      windX + windLen * 0.5,
      windY - 3 + Math.sin(windPhase + w * 0.5) * 2,
      windX + windLen,
      windY - 1 + Math.sin(windPhase * 1.3 + w) * 3,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Icicles hanging from outcrops — varied sizes with sparkle
  for (let ic = 0; ic < 7; ic++) {
    const icX =
      mx -
      width * 0.32 +
      ic * width * 0.08 +
      dc.seededRandom(mtSeed + ic * 31) * 3;
    const icY = my - heightPx * (0.4 + dc.seededRandom(mtSeed + ic * 33) * 0.35);
    const icLen = 3 + dc.seededRandom(mtSeed + ic * 7) * 8;
    const icW = 1 + dc.seededRandom(mtSeed + ic * 9) * 1.5;
    const icGrad = ctx.createLinearGradient(icX, icY, icX, icY + icLen);
    icGrad.addColorStop(0, "rgba(200, 230, 255, 0.8)");
    icGrad.addColorStop(0.5, "rgba(180, 220, 250, 0.6)");
    icGrad.addColorStop(1, "rgba(170, 215, 248, 0.3)");
    ctx.fillStyle = icGrad;
    ctx.beginPath();
    ctx.moveTo(icX - icW, icY);
    ctx.quadraticCurveTo(
      icX - icW * 0.6,
      icY + icLen * 0.7,
      icX,
      icY + icLen,
    );
    ctx.quadraticCurveTo(icX + icW * 0.6, icY + icLen * 0.7, icX + icW, icY);
    ctx.closePath();
    ctx.fill();
    // Sparkle glint
    const sparkle = Math.sin(time * 4 + ic * 2.3 + mtSeed) * 0.5 + 0.5;
    if (sparkle > 0.7) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(sparkle - 0.7) * 2})`;
      ctx.beginPath();
      ctx.arc(icX, icY + icLen * 0.2, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Avalanche snow cascading (animated particles on slope)
  const avalancheActive = Math.sin(time * 0.3 + mx * 0.1) > 0.3;
  if (avalancheActive) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let av = 0; av < 6; av++) {
      const avProgress = ((time * 30 + av * 12 + mx) % 60) / 60;
      const avX = mx - width * 0.1 + avProgress * width * 0.3;
      const avY = my - heightPx * (0.7 - avProgress * 0.5);
      const avSize = 2 + avProgress * 3;
      ctx.fillStyle = `rgba(240, 248, 255, ${0.6 - avProgress * 0.5})`;
      ctx.beginPath();
      ctx.arc(avX, avY, avSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function drawFrostedPine(
  dc: WorldMapDrawContext,
  x: number,
  yPct: number,
  scale: number,
) {
  const { ctx } = dc;
  const y = dc.getY(yPct);
  // Shadow
  ctx.fillStyle = "rgba(30, 50, 70, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    x + 5 * scale,
    y + 5 * scale,
    14 * scale,
    5 * scale,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Snow pile at base drawn first so it sits behind the trunk and branches
  const snowGrad = ctx.createRadialGradient(
    x,
    y + 2 * scale,
    0,
    x,
    y + 2 * scale,
    12 * scale,
  );
  snowGrad.addColorStop(0, "#f4f8ff");
  snowGrad.addColorStop(0.7, "#e0ecf8");
  snowGrad.addColorStop(1, "rgba(220, 235, 248, 0)");
  ctx.fillStyle = snowGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + 2 * scale,
    y + 2 * scale,
    12 * scale,
    5 * scale,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Detailed trunk with bark texture
  const trunkGrad = ctx.createLinearGradient(
    x - 3 * scale,
    y,
    x + 3 * scale,
    y,
  );
  trunkGrad.addColorStop(0, "#2a1a12");
  trunkGrad.addColorStop(0.3, "#4a3828");
  trunkGrad.addColorStop(0.5, "#5a4838");
  trunkGrad.addColorStop(0.7, "#4a3828");
  trunkGrad.addColorStop(1, "#2a1a12");
  ctx.fillStyle = trunkGrad;
  ctx.fillRect(x - 3 * scale, y - 6 * scale, 6 * scale, 14 * scale);
  // Bark texture lines
  ctx.strokeStyle = "rgba(30, 20, 10, 0.4)";
  ctx.lineWidth = 0.5;
  for (let b = 0; b < 5; b++) {
    const barkY = y - 4 * scale + b * 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 2.5 * scale, barkY);
    ctx.quadraticCurveTo(x, barkY - 1, x + 2.5 * scale, barkY + 0.5);
    ctx.stroke();
  }

  // Branch layers (6 tiers of individual branches instead of triangles)
  const branchTiers = [
    { y: -4, spread: 16, droop: 3 },
    { y: -10, spread: 14, droop: 2.5 },
    { y: -16, spread: 12, droop: 2 },
    { y: -22, spread: 10, droop: 1.5 },
    { y: -27, spread: 7, droop: 1 },
    { y: -31, spread: 4, droop: 0.5 },
  ];
  branchTiers.forEach((tier, ti) => {
    const baseY = y + tier.y * scale;
    for (let side = -1; side <= 1; side += 2) {
      // Main branch with foliage (flat color instead of per-branch gradient)
      ctx.fillStyle = ti < 3 ? "#1a5a3a" : "#1a4a2a";
      ctx.beginPath();
      ctx.moveTo(x, baseY - 1.5 * scale);
      ctx.quadraticCurveTo(
        x + side * tier.spread * 0.6 * scale,
        baseY - 1 * scale,
        x + side * tier.spread * scale,
        baseY + tier.droop * scale,
      );
      ctx.lineTo(
        x + side * tier.spread * scale,
        baseY + tier.droop * scale + 2 * scale,
      );
      ctx.quadraticCurveTo(
        x + side * tier.spread * 0.5 * scale,
        baseY + 1.5 * scale,
        x,
        baseY + 1 * scale,
      );
      ctx.closePath();
      ctx.fill();

      // Needle texture
      ctx.strokeStyle = "rgba(10, 50, 25, 0.3)";
      ctx.lineWidth = 0.5;
      for (let n = 0; n < 3; n++) {
        const nx = x + side * tier.spread * (0.3 + n * 0.25) * scale;
        const ny = baseY + tier.droop * (n * 0.3) * scale;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx + side * 2 * scale, ny + 2 * scale);
        ctx.stroke();
      }

      // Heavy snow load bending branches
      ctx.fillStyle = "rgba(240, 248, 255, 0.9)";
      ctx.beginPath();
      ctx.moveTo(x + side * 2 * scale, baseY - 1.5 * scale);
      ctx.quadraticCurveTo(
        x + side * tier.spread * 0.5 * scale,
        baseY - 2.5 * scale + Math.sin(ti * 0.5) * scale,
        x + side * tier.spread * 0.85 * scale,
        baseY + tier.droop * 0.5 * scale,
      );
      ctx.lineTo(
        x + side * tier.spread * 0.7 * scale,
        baseY + tier.droop * 0.3 * scale,
      );
      ctx.quadraticCurveTo(
        x + side * tier.spread * 0.4 * scale,
        baseY - 1 * scale,
        x + side * 2 * scale,
        baseY - 0.5 * scale,
      );
      ctx.closePath();
      ctx.fill();

      // Icicles hanging from snow-laden branches
      if (ti < 4) {
        ctx.fillStyle = "rgba(200, 230, 255, 0.6)";
        const icicleX = x + side * tier.spread * 0.6 * scale;
        const icicleY = baseY + tier.droop * 0.5 * scale;
        const icicleLen = (2 + ti * 0.5) * scale;
        ctx.beginPath();
        ctx.moveTo(icicleX - 0.8 * scale, icicleY);
        ctx.lineTo(icicleX, icicleY + icicleLen);
        ctx.lineTo(icicleX + 0.8 * scale, icicleY);
        ctx.closePath();
        ctx.fill();
      }
    }
  });

  // Visible pinecones
  ctx.fillStyle = "#5a3a20";
  for (let p = 0; p < 2; p++) {
    const pcX = x + (p === 0 ? -5 : 4) * scale;
    const pcY = y + (-6 - p * 8) * scale;
    ctx.beginPath();
    ctx.ellipse(
      pcX,
      pcY,
      1.8 * scale,
      3 * scale,
      0.2 * (p === 0 ? 1 : -1),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(40, 25, 10, 0.5)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(pcX - 1 * scale, pcY - 1 * scale);
    ctx.lineTo(pcX + 1 * scale, pcY + 1 * scale);
    ctx.stroke();
  }

  // Natural snow cap at treetop
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y - 33 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export function drawIceCrystal(
  dc: WorldMapDrawContext,
  cx: number,
  cyPct: number,
  scale: number,
) {
  const { ctx, time } = dc;
  const cy = dc.getY(cyPct);
  const pulse = Math.sin(time * 2 + cx * 0.1) * 0.15;

  // Frost patterns radiating from base
  ctx.save();
  ctx.strokeStyle = "rgba(180, 220, 255, 0.25)";
  ctx.lineWidth = 0.8;
  for (let f = 0; f < 8; f++) {
    const angle = (f / 8) * Math.PI * 2;
    const frostLen = 18 + dc.seededRandom(cx + f * 3) * 12;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 2 * scale);
    const endX = cx + Math.cos(angle) * frostLen * scale;
    const endY = cy + 2 * scale + Math.sin(angle) * frostLen * scale * 0.4;
    const midX = cx + Math.cos(angle) * frostLen * 0.5 * scale;
    const midY =
      cy + 2 * scale + Math.sin(angle) * frostLen * 0.5 * scale * 0.4;
    ctx.lineTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    // Sub-branches
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(
      midX + Math.cos(angle + 0.5) * frostLen * 0.3 * scale,
      midY + Math.sin(angle + 0.5) * frostLen * 0.3 * scale * 0.4,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Outer glow pulsing
  const glowGrad = ctx.createRadialGradient(
    cx,
    cy - 15 * scale,
    0,
    cx,
    cy - 15 * scale,
    30 * scale,
  );
  glowGrad.addColorStop(0, `rgba(150, 220, 255, ${0.25 + pulse})`);
  glowGrad.addColorStop(0.5, `rgba(120, 200, 255, ${0.1 + pulse * 0.5})`);
  glowGrad.addColorStop(1, "rgba(150, 220, 255, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - 15 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Main hexagonal crystal spire
  const crystalGrad = ctx.createLinearGradient(
    cx - 8 * scale,
    cy,
    cx + 8 * scale,
    cy - 38 * scale,
  );
  crystalGrad.addColorStop(0, "rgba(160, 210, 255, 0.85)");
  crystalGrad.addColorStop(0.3, "rgba(200, 230, 255, 0.9)");
  crystalGrad.addColorStop(0.6, "rgba(230, 245, 255, 0.95)");
  crystalGrad.addColorStop(1, "rgba(255, 255, 255, 1)");
  ctx.fillStyle = crystalGrad;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 38 * scale);
  ctx.lineTo(cx + 5 * scale, cy - 28 * scale);
  ctx.lineTo(cx + 7 * scale, cy - 15 * scale);
  ctx.lineTo(cx + 5 * scale, cy + 2 * scale);
  ctx.lineTo(cx, cy + 4 * scale);
  ctx.lineTo(cx - 5 * scale, cy + 2 * scale);
  ctx.lineTo(cx - 7 * scale, cy - 15 * scale);
  ctx.lineTo(cx - 5 * scale, cy - 28 * scale);
  ctx.closePath();
  ctx.fill();

  // Hexagonal facet lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 38 * scale);
  ctx.lineTo(cx, cy + 4 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 7 * scale, cy - 15 * scale);
  ctx.lineTo(cx + 7 * scale, cy - 15 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 5 * scale, cy - 28 * scale);
  ctx.lineTo(cx + 5 * scale, cy + 2 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 5 * scale, cy - 28 * scale);
  ctx.lineTo(cx - 5 * scale, cy + 2 * scale);
  ctx.stroke();

  // Rainbow light refraction (prismatic effect)
  ctx.save();
  ctx.globalAlpha = 0.2 + pulse * 0.5;
  const prismColors = [
    "#ff6666",
    "#ffaa44",
    "#ffff66",
    "#66ff88",
    "#6688ff",
    "#aa66ff",
  ];
  prismColors.forEach((color, i) => {
    const refractAngle = (i / 6) * Math.PI + time * 0.3;
    const refractDist = 10 + Math.sin(time * 1.5 + i) * 3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(refractAngle) * refractDist * scale,
      cy - 15 * scale + Math.sin(refractAngle) * refractDist * scale * 0.6,
      2.5 * scale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });
  ctx.restore();

  // Inner glow pulsing
  const innerGlow = ctx.createRadialGradient(
    cx,
    cy - 18 * scale,
    0,
    cx,
    cy - 18 * scale,
    12 * scale,
  );
  innerGlow.addColorStop(0, `rgba(200, 240, 255, ${0.3 + pulse})`);
  innerGlow.addColorStop(1, "rgba(200, 240, 255, 0)");
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy - 18 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Side crystals (smaller hexagonal)
  ctx.fillStyle = "rgba(190, 225, 255, 0.75)";
  ctx.beginPath();
  ctx.moveTo(cx - 5 * scale, cy - 10 * scale);
  ctx.lineTo(cx - 16 * scale, cy - 24 * scale);
  ctx.lineTo(cx - 14 * scale, cy - 22 * scale);
  ctx.lineTo(cx - 8 * scale, cy - 8 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 5 * scale, cy - 14 * scale);
  ctx.lineTo(cx + 14 * scale, cy - 28 * scale);
  ctx.lineTo(cx + 12 * scale, cy - 26 * scale);
  ctx.lineTo(cx + 7 * scale, cy - 12 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 2 * scale, cy - 5 * scale);
  ctx.lineTo(cx + 10 * scale, cy - 15 * scale);
  ctx.lineTo(cx + 8 * scale, cy - 13 * scale);
  ctx.lineTo(cx + 3 * scale, cy - 4 * scale);
  ctx.closePath();
  ctx.fill();

  // Sparkle star at tip
  const sparkle = 0.5 + Math.sin(time * 5 + cx * 0.5) * 0.5;
  ctx.fillStyle = `rgba(255, 255, 255, ${sparkle})`;
  const sparkSize = 2 + sparkle * 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 38 * scale - sparkSize * scale);
  ctx.lineTo(cx + sparkSize * 0.4 * scale, cy - 38 * scale);
  ctx.lineTo(cx, cy - 38 * scale + sparkSize * 0.6 * scale);
  ctx.lineTo(cx - sparkSize * 0.4 * scale, cy - 38 * scale);
  ctx.closePath();
  ctx.fill();
}

export function drawFrozenLake(
  dc: WorldMapDrawContext,
  lx: number,
  lyPct: number,
  width: number,
  heightRatio: number,
) {
  const { ctx, time } = dc;
  const ly = dc.getY(lyPct);
  const h = width * heightRatio;
  const seed = lx * 3.1 + lyPct * 7.7;

  // Snow bank — organic blob outline
  ctx.fillStyle = "rgba(225,238,248,0.55)";
  drawOrganicBlobAt(ctx, lx, ly, width + 7, h + 5, seed + 0.5, 0.18, 20);
  ctx.fill();

  // Deep water underneath
  const depthGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, width);
  depthGrad.addColorStop(0, "rgba(25,55,95,0.5)");
  depthGrad.addColorStop(0.5, "rgba(35,75,125,0.4)");
  depthGrad.addColorStop(1, "rgba(50,90,140,0.25)");
  ctx.fillStyle = depthGrad;
  drawOrganicBlobAt(ctx, lx, ly, width + 1, h + 0.5, seed, 0.15, 18);
  ctx.fill();

  // Translucent ice surface
  const iceGrad = ctx.createRadialGradient(
    lx - width * 0.2,
    ly - h * 0.2,
    0,
    lx,
    ly,
    width,
  );
  iceGrad.addColorStop(0, "rgba(210,235,255,0.6)");
  iceGrad.addColorStop(0.3, "rgba(185,215,245,0.65)");
  iceGrad.addColorStop(0.7, "rgba(160,195,230,0.7)");
  iceGrad.addColorStop(1, "rgba(130,170,210,0.45)");
  ctx.fillStyle = iceGrad;
  drawOrganicBlobAt(ctx, lx, ly, width, h, seed, 0.15, 18);
  ctx.fill();

  // Organic shore edge highlight
  ctx.strokeStyle = "rgba(200,225,245,0.3)";
  ctx.lineWidth = 1.2;
  drawOrganicBlobAt(ctx, lx, ly, width - 2, h - 1, seed, 0.12, 16);
  ctx.stroke();

  // Branching ice cracks
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 0.8;
  for (let c = 0; c < 6; c++) {
    const startAngle = dc.seededRandom(lx + c) * Math.PI * 2;
    const crackLen = 10 + dc.seededRandom(lx + c + 10) * (width * 0.6);
    const midX = lx + Math.cos(startAngle) * crackLen * 0.5;
    const midY = ly + Math.sin(startAngle) * crackLen * heightRatio * 0.5;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(
      midX + (dc.seededRandom(lx + c + 20) - 0.5) * 5,
      midY + (dc.seededRandom(lx + c + 21) - 0.5) * 3,
      lx + Math.cos(startAngle) * crackLen,
      ly + Math.sin(startAngle) * crackLen * heightRatio,
    );
    ctx.stroke();
    if (c < 4) {
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      const branchAngle =
        startAngle + (dc.seededRandom(lx + c + 30) > 0.5 ? 0.6 : -0.6);
      ctx.lineTo(
        midX + Math.cos(branchAngle) * crackLen * 0.4,
        midY + Math.sin(branchAngle) * crackLen * heightRatio * 0.4,
      );
      ctx.stroke();
    }
  }

  // Trapped air bubbles
  ctx.fillStyle = "rgba(200,230,255,0.35)";
  for (let b = 0; b < 8; b++) {
    const bx = lx - width * 0.6 + dc.seededRandom(lx + b * 13) * width * 1.2;
    const by = ly - h * 0.5 + dc.seededRandom(lx + b * 17) * h;
    const bSize = 1.5 + dc.seededRandom(lx + b * 23) * 3;
    const dx = (bx - lx) / width;
    const dy = (by - ly) / h;
    if (dx * dx + dy * dy < 0.7) {
      ctx.beginPath();
      ctx.arc(bx, by, bSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(
        bx - bSize * 0.3,
        by - bSize * 0.3,
        bSize * 0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "rgba(200,230,255,0.35)";
    }
  }

  // Skating scratch marks
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 0.6;
  for (let sc = 0; sc < 4; sc++) {
    const scX = lx - width * 0.4 + dc.seededRandom(lx + sc * 41) * width * 0.8;
    const scY = ly - h * 0.2 + dc.seededRandom(lx + sc * 43) * h * 0.4;
    const scLen = 8 + dc.seededRandom(lx + sc * 47) * 12;
    const scAngle = dc.seededRandom(lx + sc * 51) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(scX, scY);
    ctx.lineTo(
      scX + Math.cos(scAngle) * scLen,
      scY + Math.sin(scAngle) * scLen * heightRatio,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(scX + 2, scY + 1);
    ctx.lineTo(
      scX + Math.cos(scAngle) * scLen + 2,
      scY + Math.sin(scAngle) * scLen * heightRatio + 1,
    );
    ctx.stroke();
  }

  // Surface shimmer
  ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.sin(time * 3) * 0.15})`;
  for (let s = 0; s < 4; s++) {
    const sx = lx - width * 0.5 + dc.seededRandom(lx + s * 7) * width;
    const sy = ly - h * 0.3 + dc.seededRandom(lx + s * 11) * h * 0.6;
    ctx.beginPath();
    ctx.ellipse(
      sx,
      sy,
      5 + Math.sin(time * 2 + s) * 2,
      2,
      dc.seededRandom(lx + s * 19) * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

export function drawIgloo(
  dc: WorldMapDrawContext,
  ix: number,
  iyPct: number,
  scale: number,
) {
  const { ctx, time } = dc;
  const iy = dc.getY(iyPct);

  // Shadow
  ctx.fillStyle = "rgba(50, 70, 90, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    ix + 3 * scale,
    iy + 6 * scale,
    24 * scale,
    8 * scale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Snow drift accumulation around base
  ctx.fillStyle = "rgba(235, 245, 255, 0.7)";
  ctx.beginPath();
  ctx.ellipse(ix, iy + 3 * scale, 26 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main dome with gradient
  const domeGrad = ctx.createRadialGradient(
    ix - 5 * scale,
    iy - 12 * scale,
    0,
    ix,
    iy,
    22 * scale,
  );
  domeGrad.addColorStop(0, "#ffffff");
  domeGrad.addColorStop(0.3, "#f0f8ff");
  domeGrad.addColorStop(0.6, "#e0eef8");
  domeGrad.addColorStop(1, "#c0d4e4");
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.arc(ix, iy - 2 * scale, 18 * scale, Math.PI, 0);
  ctx.lineTo(ix + 18 * scale, iy + 2 * scale);
  ctx.lineTo(ix - 18 * scale, iy + 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Visible ice block construction lines (rows and vertical dividers)
  ctx.strokeStyle = "rgba(140, 170, 195, 0.5)";
  ctx.lineWidth = 0.8;
  for (let row = 0; row < 4; row++) {
    // Horizontal row arcs
    ctx.beginPath();
    ctx.arc(ix, iy - 2 * scale, 18 * scale - row * 2 * scale, Math.PI, 0);
    ctx.stroke();
    // Vertical block dividers
    const blocksInRow = 5 - row;
    for (let b = 0; b < blocksInRow; b++) {
      const blockAngle = Math.PI + ((b + 0.5) / blocksInRow) * Math.PI;
      const bx1 = ix + Math.cos(blockAngle) * (18 * scale - row * 2 * scale);
      const by1 =
        iy -
        2 * scale -
        Math.sin(blockAngle) * (18 * scale - row * 2 * scale);
      const bx2 =
        ix + Math.cos(blockAngle) * (18 * scale - (row + 1) * 2 * scale);
      const by2 =
        iy -
        2 * scale -
        Math.sin(blockAngle) * (18 * scale - (row + 1) * 2 * scale);
      ctx.beginPath();
      ctx.moveTo(bx1, by1);
      ctx.lineTo(bx2, by2);
      ctx.stroke();
    }
  }

  // Entrance tunnel (dark interior)
  ctx.fillStyle = "#1a2a38";
  ctx.beginPath();
  ctx.ellipse(
    ix + 18 * scale,
    iy - 1 * scale,
    7 * scale,
    9 * scale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Warm interior glow from entrance
  const warmGlow = ctx.createRadialGradient(
    ix + 18 * scale,
    iy - 1 * scale,
    0,
    ix + 18 * scale,
    iy - 1 * scale,
    12 * scale,
  );
  warmGlow.addColorStop(
    0,
    `rgba(255, 180, 80, ${0.4 + Math.sin(time * 2) * 0.1})`,
  );
  warmGlow.addColorStop(
    0.4,
    `rgba(255, 140, 50, ${0.2 + Math.sin(time * 1.5) * 0.05})`,
  );
  warmGlow.addColorStop(1, "rgba(255, 100, 30, 0)");
  ctx.fillStyle = warmGlow;
  ctx.beginPath();
  ctx.arc(ix + 18 * scale, iy - 1 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Tunnel arch
  ctx.fillStyle = "#d0e0ec";
  ctx.beginPath();
  ctx.arc(ix + 18 * scale, iy - 1 * scale, 7 * scale, Math.PI, 0);
  ctx.lineTo(ix + 27 * scale, iy + 2 * scale);
  ctx.lineTo(ix + 9 * scale, iy + 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Smoke hole at top
  ctx.fillStyle = "rgba(20, 30, 40, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    ix - 2 * scale,
    iy - 19 * scale,
    2.5 * scale,
    1.5 * scale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Rising smoke wisps from hole
  for (let sm = 0; sm < 3; sm++) {
    const smokePhase = (time * 12 + sm * 8) % 30;
    const smokeY = iy - 20 * scale - smokePhase;
    const smokeX =
      ix - 2 * scale + Math.sin(time * 1.5 + sm) * (2 + smokePhase * 0.1);
    const smokeSize = 2 + smokePhase * 0.15;
    const smokeAlpha = Math.max(0, 0.3 - smokePhase / 40);
    ctx.fillStyle = `rgba(200, 210, 220, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeSize * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawMammoth(
  dc: WorldMapDrawContext,
  mx: number,
  myPct: number,
  scale: number,
  facing: number,
) {
  const { ctx } = dc;
  const my = dc.getY(myPct);
  ctx.save();
  ctx.translate(mx, my);
  ctx.scale(facing, 1);

  // Shadow
  ctx.fillStyle = "rgba(30, 50, 70, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 12 * scale, 28 * scale, 9 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back legs
  ctx.fillStyle = "#3a2418";
  ctx.fillRect(-14 * scale, 8 * scale, 7 * scale, 16 * scale);
  ctx.fillRect(8 * scale, 8 * scale, 7 * scale, 16 * scale);
  // Back leg fur fringe
  ctx.fillStyle = "#4a3020";
  for (let lf = 0; lf < 2; lf++) {
    const lfx = lf === 0 ? -14 * scale : 8 * scale;
    for (let f = 0; f < 4; f++) {
      ctx.beginPath();
      ctx.moveTo(lfx + f * 2 * scale, 20 * scale);
      ctx.lineTo(lfx + f * 2 * scale + 1 * scale, 25 * scale);
      ctx.lineTo(lfx + f * 2 * scale + 2 * scale, 20 * scale);
      ctx.fill();
    }
  }

  // Body with rich fur gradient
  const furGrad = ctx.createRadialGradient(
    -2 * scale,
    -4 * scale,
    0,
    0,
    0,
    24 * scale,
  );
  furGrad.addColorStop(0, "#6a5040");
  furGrad.addColorStop(0.5, "#5a4030");
  furGrad.addColorStop(1, "#3a2418");
  ctx.fillStyle = furGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shaggy fur texture (layered strands)
  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 0.8;
  for (let f = 0; f < 14; f++) {
    const fx = -18 * scale + f * 3 * scale;
    const furLen = 10 + dc.seededRandom(mx + f * 3) * 8;
    ctx.beginPath();
    ctx.moveTo(fx, -8 * scale + dc.seededRandom(mx + f * 7) * 4 * scale);
    ctx.quadraticCurveTo(
      fx + 1 * scale,
      4 * scale,
      fx - 1 * scale,
      furLen * scale,
    );
    ctx.stroke();
  }
  // Long belly fur
  ctx.strokeStyle = "#4a3828";
  ctx.lineWidth = 1;
  for (let bf = 0; bf < 8; bf++) {
    const bfx = -12 * scale + bf * 3.5 * scale;
    ctx.beginPath();
    ctx.moveTo(bfx, 10 * scale);
    ctx.quadraticCurveTo(
      bfx + 0.5 * scale,
      16 * scale,
      bfx - 0.5 * scale,
      20 * scale,
    );
    ctx.stroke();
  }

  // Front legs
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(-6 * scale, 10 * scale, 7 * scale, 16 * scale);
  ctx.fillRect(1 * scale, 10 * scale, 7 * scale, 16 * scale);
  // Front leg fur fringe
  for (let lf = 0; lf < 2; lf++) {
    const lfx = lf === 0 ? -6 * scale : 1 * scale;
    ctx.fillStyle = "#5a4030";
    for (let f = 0; f < 4; f++) {
      ctx.beginPath();
      ctx.moveTo(lfx + f * 2 * scale, 22 * scale);
      ctx.lineTo(lfx + f * 2 * scale + 1 * scale, 26 * scale);
      ctx.lineTo(lfx + f * 2 * scale + 2 * scale, 22 * scale);
      ctx.fill();
    }
  }

  // Head with fur
  const headGrad = ctx.createRadialGradient(
    18 * scale,
    -6 * scale,
    0,
    18 * scale,
    -6 * scale,
    14 * scale,
  );
  headGrad.addColorStop(0, "#6a5040");
  headGrad.addColorStop(1, "#4a3020");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(
    18 * scale,
    -5 * scale,
    13 * scale,
    11 * scale,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Head fur tuft
  ctx.fillStyle = "#5a4030";
  ctx.beginPath();
  ctx.moveTo(14 * scale, -14 * scale);
  ctx.quadraticCurveTo(18 * scale, -20 * scale, 22 * scale, -14 * scale);
  ctx.quadraticCurveTo(18 * scale, -16 * scale, 14 * scale, -14 * scale);
  ctx.fill();

  // Trunk with segmented detail
  ctx.fillStyle = "#4a3020";
  ctx.beginPath();
  ctx.moveTo(27 * scale, -2 * scale);
  ctx.quadraticCurveTo(36 * scale, 4 * scale, 33 * scale, 14 * scale);
  ctx.quadraticCurveTo(31 * scale, 20 * scale, 28 * scale, 18 * scale);
  ctx.quadraticCurveTo(30 * scale, 12 * scale, 26 * scale, 6 * scale);
  ctx.quadraticCurveTo(25 * scale, 2 * scale, 25 * scale, 0);
  ctx.fill();
  // Trunk segment lines
  ctx.strokeStyle = "rgba(30, 18, 8, 0.4)";
  ctx.lineWidth = 0.6;
  for (let ts = 0; ts < 5; ts++) {
    const tsy = 0 + ts * 4 * scale;
    const tsx = 27 * scale + Math.sin(ts * 0.8) * 3 * scale;
    ctx.beginPath();
    ctx.arc(tsx, tsy, 3 * scale, -0.5, 1.5);
    ctx.stroke();
  }

  // Curved tusks with ivory detail and ridges
  const tuskGrad = ctx.createLinearGradient(
    22 * scale,
    4 * scale,
    42 * scale,
    -2 * scale,
  );
  tuskGrad.addColorStop(0, "#f8f0e0");
  tuskGrad.addColorStop(0.5, "#fff8f0");
  tuskGrad.addColorStop(1, "#f0e8d8");
  ctx.fillStyle = tuskGrad;
  ctx.beginPath();
  ctx.moveTo(22 * scale, 3 * scale);
  ctx.quadraticCurveTo(34 * scale, -8 * scale, 42 * scale, -2 * scale);
  ctx.quadraticCurveTo(44 * scale, 2 * scale, 42 * scale, 5 * scale);
  ctx.quadraticCurveTo(36 * scale, -3 * scale, 24 * scale, 5 * scale);
  ctx.closePath();
  ctx.fill();
  // Tusk ridges
  ctx.strokeStyle = "rgba(180, 160, 130, 0.3)";
  ctx.lineWidth = 0.5;
  for (let tr = 0; tr < 4; tr++) {
    const trX = 28 * scale + tr * 4 * scale;
    ctx.beginPath();
    ctx.moveTo(trX, 0);
    ctx.lineTo(trX + 1 * scale, -4 * scale);
    ctx.stroke();
  }

  // Expressive eye with detail
  ctx.fillStyle = "#f0e8e0";
  ctx.beginPath();
  ctx.ellipse(
    24 * scale,
    -8 * scale,
    3.5 * scale,
    2.5 * scale,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#2a1a08";
  ctx.beginPath();
  ctx.arc(24.5 * scale, -8 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a0400";
  ctx.beginPath();
  ctx.arc(25 * scale, -8 * scale, 1.2 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.arc(24 * scale, -9 * scale, 0.8 * scale, 0, Math.PI * 2);
  ctx.fill();
  // Eyelid/brow
  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(24 * scale, -8 * scale, 3.5 * scale, Math.PI + 0.3, -0.3);
  ctx.stroke();

  // Snow clinging to fur
  ctx.fillStyle = "rgba(240, 248, 255, 0.8)";
  ctx.beginPath();
  ctx.ellipse(
    -2 * scale,
    -13 * scale,
    16 * scale,
    4 * scale,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Scattered snow clumps
  for (let sc = 0; sc < 6; sc++) {
    const scx = -15 * scale + sc * 6 * scale;
    const scy = -6 * scale + dc.seededRandom(mx + sc * 11) * 10 * scale;
    ctx.beginPath();
    ctx.arc(
      scx,
      scy,
      (1.5 + dc.seededRandom(mx + sc * 13)) * scale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Ear
  ctx.fillStyle = "#5a4030";
  ctx.beginPath();
  ctx.ellipse(
    12 * scale,
    -10 * scale,
    5 * scale,
    8 * scale,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#4a3020";
  ctx.beginPath();
  ctx.ellipse(
    12 * scale,
    -10 * scale,
    3.5 * scale,
    6 * scale,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.restore();
}
