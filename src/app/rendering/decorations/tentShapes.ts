import { ISO_COS, ISO_SIN, ISO_Y_RATIO } from "../../constants";
import { drawIsometricPrism } from "../helpers";
import { setShadowBlur, clearShadow } from "../performance";
import { drawDirectionalShadow } from "./shadowHelpers";

// ── Isometric geometry helpers ──────────────────────────────────

function isoGroundDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  iW: number,
  iD: number
): void {
  ctx.moveTo(cx, cy - iD);
  ctx.lineTo(cx + iW, cy);
  ctx.lineTo(cx, cy + iD);
  ctx.lineTo(cx - iW, cy);
  ctx.closePath();
}

// Ridge tent prism: the ridge runs from ridgeA to ridgeB at height.
// Front/back slopes extend perpendicular to the ridge direction on the ground.
function ridgeTentFaces(
  cx: number,
  cy: number,
  ridgeHalfLen: number,
  halfWidth: number,
  tentH: number
): {
  ridgeA: [number, number];
  ridgeB: [number, number];
  frontA: [number, number];
  frontB: [number, number];
  backA: [number, number];
  backB: [number, number];
} {
  const rIW = ridgeHalfLen * ISO_COS;
  const rID = ridgeHalfLen * ISO_SIN;
  const wIW = halfWidth * ISO_COS;
  const wID = halfWidth * ISO_SIN;

  return {
    backA: [cx - rIW + wIW, cy - rID - wID],
    backB: [cx + rIW + wIW, cy + rID - wID],
    frontA: [cx - rIW - wIW, cy - rID + wID],
    frontB: [cx + rIW - wIW, cy + rID + wID],
    ridgeA: [cx - rIW, cy - rID - tentH],
    ridgeB: [cx + rIW, cy + rID - tentH],
  };
}

function drawFabricFold(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  alpha: number
): void {
  ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ── Variant 0: Military Command Tent ────────────────────────────

function drawMilitaryTent(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  s: number,
  decorTime: number,
  decorX: number
): void {
  const ridgeHL = 12 * s;
  const halfW = 10 * s;
  const tentH = 18 * s;

  const { ridgeA, ridgeB, frontA, frontB, backA, backB } = ridgeTentFaces(
    tx,
    ty,
    ridgeHL,
    halfW,
    tentH
  );

  // Ground cloth (iso diamond extending slightly beyond tent)
  const clothPad = 3 * s;
  const cIW = (ridgeHL + clothPad) * ISO_COS + (halfW + clothPad) * ISO_COS;
  const cID = (ridgeHL + clothPad) * ISO_SIN + (halfW + clothPad) * ISO_SIN;
  ctx.fillStyle = "#4A3828";
  ctx.beginPath();
  isoGroundDiamond(ctx, tx, ty, cIW * 0.6, cID * 0.6);
  ctx.fill();

  // Back slope (further from viewer, draw first)
  const backG = ctx.createLinearGradient(
    backA[0],
    backA[1],
    ridgeA[0],
    ridgeA[1]
  );
  backG.addColorStop(0, "#3A3020");
  backG.addColorStop(0.6, "#4A4030");
  backG.addColorStop(1, "#504535");
  ctx.fillStyle = backG;
  ctx.beginPath();
  ctx.moveTo(ridgeA[0], ridgeA[1]);
  ctx.lineTo(ridgeB[0], ridgeB[1]);
  ctx.lineTo(backB[0], backB[1]);
  ctx.lineTo(backA[0], backA[1]);
  ctx.closePath();
  ctx.fill();

  // Back slope fabric folds
  ctx.lineWidth = 0.7 * s;
  for (let f = 0; f < 4; f++) {
    const t = (f + 1) / 5;
    const rx = ridgeA[0] + (ridgeB[0] - ridgeA[0]) * t;
    const ry = ridgeA[1] + (ridgeB[1] - ridgeA[1]) * t;
    const bx = backA[0] + (backB[0] - backA[0]) * t;
    const by = backA[1] + (backB[1] - backA[1]) * t;
    drawFabricFold(ctx, rx, ry, bx, by, 0.12);
  }

  // Front slope (closer to viewer, draw on top)
  const frontG = ctx.createLinearGradient(
    ridgeA[0],
    ridgeA[1],
    frontA[0],
    frontA[1]
  );
  frontG.addColorStop(0, "#6B5A40");
  frontG.addColorStop(0.4, "#5A4A35");
  frontG.addColorStop(1, "#48402C");
  ctx.fillStyle = frontG;
  ctx.beginPath();
  ctx.moveTo(ridgeA[0], ridgeA[1]);
  ctx.lineTo(ridgeB[0], ridgeB[1]);
  ctx.lineTo(frontB[0], frontB[1]);
  ctx.lineTo(frontA[0], frontA[1]);
  ctx.closePath();
  ctx.fill();

  // Front slope fabric folds
  ctx.lineWidth = 0.6 * s;
  for (let f = 0; f < 5; f++) {
    const t = (f + 1) / 6;
    const rx = ridgeA[0] + (ridgeB[0] - ridgeA[0]) * t;
    const ry = ridgeA[1] + (ridgeB[1] - ridgeA[1]) * t;
    const fx = frontA[0] + (frontB[0] - frontA[0]) * t;
    const fy = frontA[1] + (frontB[1] - frontA[1]) * t;
    drawFabricFold(ctx, rx, ry, fx, fy, 0.1);
  }

  // Front slope highlight along ridge
  ctx.strokeStyle = "rgba(140,120,80,0.18)";
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(ridgeA[0], ridgeA[1]);
  ctx.lineTo(ridgeB[0], ridgeB[1]);
  ctx.stroke();

  // Left gable (triangle)
  ctx.fillStyle = "#5A4830";
  ctx.beginPath();
  ctx.moveTo(ridgeA[0], ridgeA[1]);
  ctx.lineTo(frontA[0], frontA[1]);
  ctx.lineTo(backA[0], backA[1]);
  ctx.closePath();
  ctx.fill();

  // Right gable (triangle, slightly lit)
  const gableG = ctx.createLinearGradient(
    ridgeB[0],
    ridgeB[1],
    (frontB[0] + backB[0]) / 2,
    (frontB[1] + backB[1]) / 2
  );
  gableG.addColorStop(0, "#6A5A3E");
  gableG.addColorStop(1, "#5A4830");
  ctx.fillStyle = gableG;
  ctx.beginPath();
  ctx.moveTo(ridgeB[0], ridgeB[1]);
  ctx.lineTo(frontB[0], frontB[1]);
  ctx.lineTo(backB[0], backB[1]);
  ctx.closePath();
  ctx.fill();

  // Dark entrance on right gable
  const entMidX = (frontB[0] + backB[0]) / 2;
  const entMidY = (frontB[1] + backB[1]) / 2;
  ctx.fillStyle = "rgba(15,10,5,0.85)";
  ctx.beginPath();
  ctx.moveTo(
    ridgeB[0] + (entMidX - ridgeB[0]) * 0.35,
    ridgeB[1] + (entMidY - ridgeB[1]) * 0.35
  );
  ctx.lineTo(
    frontB[0] + (backB[0] - frontB[0]) * 0.2,
    frontB[1] + (backB[1] - frontB[1]) * 0.2
  );
  ctx.lineTo(
    frontB[0] + (backB[0] - frontB[0]) * 0.8,
    frontB[1] + (backB[1] - frontB[1]) * 0.8
  );
  ctx.closePath();
  ctx.fill();

  // Entrance flap (folded back)
  ctx.fillStyle = "#5A4A30";
  ctx.beginPath();
  ctx.moveTo(
    frontB[0] + (backB[0] - frontB[0]) * 0.15,
    frontB[1] + (backB[1] - frontB[1]) * 0.15
  );
  ctx.lineTo(
    ridgeB[0] + (entMidX - ridgeB[0]) * 0.4,
    ridgeB[1] + (entMidY - ridgeB[1]) * 0.4
  );
  ctx.lineTo(
    frontB[0] + (backB[0] - frontB[0]) * 0.05 + 3 * s,
    frontB[1] + (backB[1] - frontB[1]) * 0.05 + 1 * s
  );
  ctx.closePath();
  ctx.fill();

  // Ridge pole ends
  ctx.fillStyle = "#5D4037";
  ctx.beginPath();
  ctx.arc(ridgeA[0] - 1 * s, ridgeA[1], 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ridgeB[0] + 1 * s, ridgeB[1], 1.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // War banner on right ridge pole
  const banSway = Math.sin(decorTime * 2.5 + decorX) * 3 * s;
  const banX = ridgeB[0] + 2 * s;
  const banY = ridgeB[1];

  // Pole above ridge
  ctx.strokeStyle = "#5D4037";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(banX, banY);
  ctx.lineTo(banX, banY - 10 * s);
  ctx.stroke();

  // Banner flag
  ctx.fillStyle = "#5A1A1A";
  ctx.beginPath();
  ctx.moveTo(banX, banY - 10 * s);
  ctx.lineTo(banX + 8 * s + banSway, banY - 8 * s);
  ctx.lineTo(banX + 7 * s + banSway * 0.8, banY - 2 * s);
  ctx.lineTo(banX + 8 * s + banSway * 0.5, banY - 4 * s);
  ctx.lineTo(banX, banY - 1 * s);
  ctx.closePath();
  ctx.fill();

  // Banner emblem
  ctx.fillStyle = "#B8A060";
  ctx.beginPath();
  ctx.arc(banX + 4 * s + banSway * 0.5, banY - 6 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Rope ties at base corners
  ctx.strokeStyle = "#7A6A50";
  ctx.lineWidth = 0.8 * s;
  for (const corner of [frontA, frontB, backB]) {
    ctx.beginPath();
    ctx.moveTo(corner[0], corner[1]);
    ctx.lineTo(corner[0] + 4 * s, corner[1] + 3 * s);
    ctx.stroke();
    ctx.fillStyle = "#5D4037";
    ctx.beginPath();
    ctx.arc(corner[0] + 4 * s, corner[1] + 3 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Variant 1: Market Stall ─────────────────────────────────────

function drawMarketStall(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  s: number
): void {
  const stallSize = 16 * s;
  const stallH = 18 * s;
  const iW = stallSize * ISO_COS;
  const iD = stallSize * ISO_SIN;

  // Pole positions at iso diamond corners (slightly inset)
  const inset = 0.85;
  const poles: [number, number][] = [
    [tx, ty - iD * inset],
    [tx + iW * inset, ty],
    [tx, ty + iD * inset],
    [tx - iW * inset, ty],
  ];

  // Draw back two poles first (behind canopy)
  const poleW = 2 * s;
  for (const p of [poles[0], poles[3]]) {
    drawIsometricPrism(
      ctx,
      p[0],
      p[1],
      poleW,
      poleW,
      stallH,
      "#6D5A42",
      "#4E3A28",
      "#5D4A35"
    );
  }

  // Canopy top surface (iso diamond at height)
  const canopyY = ty - stallH;
  const canopyOv = 3 * s;
  const cIW = iW + canopyOv * ISO_COS;
  const cID = iD + canopyOv * ISO_SIN;

  // Canopy underside (visible front edge)
  ctx.fillStyle = "#4A3520";
  ctx.beginPath();
  ctx.moveTo(tx - cIW, canopyY);
  ctx.lineTo(tx, canopyY + cID);
  ctx.lineTo(tx, canopyY + cID + 2.5 * s);
  ctx.lineTo(tx - cIW, canopyY + 2.5 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3A2A18";
  ctx.beginPath();
  ctx.moveTo(tx, canopyY + cID);
  ctx.lineTo(tx + cIW, canopyY);
  ctx.lineTo(tx + cIW, canopyY + 2.5 * s);
  ctx.lineTo(tx, canopyY + cID + 2.5 * s);
  ctx.closePath();
  ctx.fill();

  // Scalloped edge on front-left
  ctx.fillStyle = "#C8B080";
  for (let sc = 0; sc < 5; sc++) {
    const t = (sc + 0.5) / 5;
    const scx = tx - cIW + (tx - (tx - cIW)) * t;
    const scy = canopyY + cID * t + 2.5 * s;
    ctx.beginPath();
    ctx.arc(scx, scy, 1.8 * s, 0, Math.PI);
    ctx.fill();
  }

  // Scalloped edge on front-right
  for (let sc = 0; sc < 5; sc++) {
    const t = (sc + 0.5) / 5;
    const scx = tx + cIW * t;
    const scy = canopyY + cID * (1 - t) + 2.5 * s;
    ctx.beginPath();
    ctx.arc(scx, scy, 1.8 * s, 0, Math.PI);
    ctx.fill();
  }

  // Canopy top face with stripes
  const stripe1 = "#5A3A20";
  const stripe2 = "#C8B896";

  ctx.fillStyle = stripe1;
  ctx.beginPath();
  ctx.moveTo(tx, canopyY - cID);
  ctx.lineTo(tx + cIW, canopyY);
  ctx.lineTo(tx, canopyY + cID);
  ctx.lineTo(tx - cIW, canopyY);
  ctx.closePath();
  ctx.fill();

  // Alternating stripes along one iso axis
  ctx.fillStyle = stripe2;
  const stripeCount = 4;
  for (let si = 0; si < stripeCount; si++) {
    if (si % 2 !== 0) {
      continue;
    }
    const t0 = si / stripeCount;
    const t1 = (si + 1) / stripeCount;

    const topL0x = tx + (tx - cIW - tx) * (1 - t0);
    const topL0y =
      canopyY -
      cID +
      (canopyY - (canopyY - cID)) * t0 +
      (canopyY - (canopyY - cID)) * t0;
    const topL1x = tx + (tx - cIW - tx) * (1 - t1);
    const topL1y =
      canopyY -
      cID +
      (canopyY - (canopyY - cID)) * t1 +
      (canopyY - (canopyY - cID)) * t1;

    const botL0x = tx + (tx + cIW - tx) * (1 - t0);
    const botL0y =
      canopyY +
      cID +
      (canopyY - (canopyY + cID)) * t0 +
      (canopyY - (canopyY + cID)) * t0;
    const botL1x = tx + (tx + cIW - tx) * (1 - t1);
    const botL1y =
      canopyY +
      cID +
      (canopyY - (canopyY + cID)) * t1 +
      (canopyY - (canopyY + cID)) * t1;

    ctx.beginPath();
    ctx.moveTo(topL0x, topL0y);
    ctx.lineTo(topL1x, topL1y);
    ctx.lineTo(botL1x, botL1y);
    ctx.lineTo(botL0x, botL0y);
    ctx.closePath();
    ctx.fill();
  }

  // Draw front two poles (in front of canopy)
  for (const p of [poles[1], poles[2]]) {
    drawIsometricPrism(
      ctx,
      p[0],
      p[1],
      poleW,
      poleW,
      stallH,
      "#6D5A42",
      "#4E3A28",
      "#5D4A35"
    );
  }

  // Table / counter underneath (iso prism)
  const tableW = 10 * s;
  const tableH = 8 * s;
  drawIsometricPrism(
    ctx,
    tx,
    ty,
    tableW,
    tableW,
    tableH,
    "#795548",
    "#5D4037",
    "#4E342E"
  );

  // Goods on table
  const tIW = tableW * ISO_COS;
  const tID = tableW * ISO_SIN;
  const tableTop = ty - tableH;

  // Pot (small iso cylinder)
  ctx.fillStyle = "#7A5A3A";
  ctx.beginPath();
  ctx.ellipse(
    tx - tIW * 0.4,
    tableTop - 3 * s,
    2.5 * s,
    2.5 * s * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#6A4A2A";
  ctx.beginPath();
  ctx.ellipse(
    tx - tIW * 0.4,
    tableTop - 3 * s,
    2.5 * s,
    2.5 * s * ISO_Y_RATIO,
    0,
    Math.PI,
    0
  );
  ctx.lineTo(tx - tIW * 0.4 - 2.5 * s, tableTop);
  ctx.ellipse(
    tx - tIW * 0.4,
    tableTop,
    2.5 * s,
    2.5 * s * ISO_Y_RATIO,
    0,
    Math.PI,
    Math.PI * 2,
    true
  );
  ctx.closePath();
  ctx.fill();

  // Gold trinket
  ctx.fillStyle = "#B8A050";
  ctx.beginPath();
  ctx.arc(tx + tIW * 0.1, tableTop - 1.5 * s, 1.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#D4C070";
  ctx.beginPath();
  ctx.arc(tx + tIW * 0.1 - 0.5 * s, tableTop - 2 * s, 0.7 * s, 0, Math.PI * 2);
  ctx.fill();

  // Bottle/vase
  ctx.fillStyle = "#8D6E63";
  ctx.beginPath();
  ctx.moveTo(tx + tIW * 0.35, tableTop);
  ctx.lineTo(tx + tIW * 0.3, tableTop - 5 * s);
  ctx.lineTo(tx + tIW * 0.33, tableTop - 6 * s);
  ctx.lineTo(tx + tIW * 0.42, tableTop - 6 * s);
  ctx.lineTo(tx + tIW * 0.45, tableTop - 5 * s);
  ctx.lineTo(tx + tIW * 0.4, tableTop);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#A08070";
  ctx.beginPath();
  ctx.moveTo(tx + tIW * 0.35 + 0.5 * s, tableTop);
  ctx.lineTo(tx + tIW * 0.32, tableTop - 4.5 * s);
  ctx.lineTo(tx + tIW * 0.35, tableTop - 4.5 * s);
  ctx.lineTo(tx + tIW * 0.375 + 0.5 * s, tableTop);
  ctx.closePath();
  ctx.fill();

  // Small sack
  ctx.fillStyle = "#6A5A3A";
  ctx.beginPath();
  ctx.ellipse(
    tx - tIW * 0.1,
    tableTop - 1 * s,
    2 * s,
    1.5 * s,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#5A4A2A";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(tx - tIW * 0.1, tableTop - 2.5 * s);
  ctx.lineTo(tx - tIW * 0.1 + 0.5 * s, tableTop - 3 * s);
  ctx.stroke();
}

// ── Variant 2: Round Yurt ───────────────────────────────────────

function drawYurt(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  s: number
): void {
  const yR = 13 * s;
  const wallH = 11 * s;
  const domeH = 10 * s;
  const yRX = yR;
  const yRY = yR * ISO_Y_RATIO;

  // Cylinder wall (iso ellipse base + height)
  const wallG = ctx.createLinearGradient(tx - yRX, ty, tx + yRX, ty);
  wallG.addColorStop(0, "#6A5A4A");
  wallG.addColorStop(0.3, "#8A7A6A");
  wallG.addColorStop(0.65, "#9A8A78");
  wallG.addColorStop(1, "#5A4A3A");
  ctx.fillStyle = wallG;
  ctx.beginPath();
  ctx.ellipse(tx, ty, yRX, yRY, 0, 0, Math.PI);
  ctx.lineTo(tx - yRX, ty - wallH);
  ctx.ellipse(tx, ty - wallH, yRX, yRY, 0, Math.PI, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();

  // Vertical fabric seam lines on cylinder
  ctx.strokeStyle = "rgba(40,30,20,0.15)";
  ctx.lineWidth = 0.7 * s;
  for (let seg = 0; seg < 7; seg++) {
    const angle = 0.2 + seg * 0.4;
    if (angle > Math.PI - 0.2) {
      break;
    }
    const sx = tx + Math.cos(angle) * yRX;
    const sy = ty + Math.sin(angle) * yRY;
    const topSy = sy - wallH;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, topSy);
    ctx.stroke();
  }

  // Decorative band around middle
  const bandY = ty - wallH * 0.45;
  const bandH = 3.5 * s;
  ctx.fillStyle = "#5A4030";
  ctx.beginPath();
  ctx.ellipse(tx, bandY - bandH, yRX + 0.5 * s, yRY + 0.3 * s, 0, 0, Math.PI);
  ctx.lineTo(tx - yRX - 0.5 * s, bandY);
  ctx.ellipse(
    tx,
    bandY,
    yRX + 0.5 * s,
    yRY + 0.3 * s,
    0,
    Math.PI,
    Math.PI * 2,
    true
  );
  ctx.closePath();
  ctx.fill();

  // Zigzag pattern on band
  ctx.strokeStyle = "#A08A60";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  const zigCount = 8;
  for (let z = 0; z <= zigCount; z++) {
    const angle = (z / zigCount) * Math.PI;
    const zx = tx + Math.cos(angle) * (yRX + 0.5 * s);
    const zy = bandY - bandH * 0.5 + Math.sin(angle) * (yRY + 0.3 * s);
    const zigOffset = z % 2 === 0 ? -bandH * 0.35 : bandH * 0.35;
    if (z === 0) {
      ctx.moveTo(zx, zy + zigOffset);
    } else {
      ctx.lineTo(zx, zy + zigOffset);
    }
  }
  ctx.stroke();

  // Diamond pattern accents on band
  ctx.strokeStyle = "#8A7050";
  ctx.lineWidth = 0.8 * s;
  for (let d = 0; d < 4; d++) {
    const da = 0.5 + d * 0.55;
    if (da > Math.PI - 0.3) {
      break;
    }
    const dx = tx + Math.cos(da) * (yRX + 0.5 * s);
    const dy = bandY - bandH * 0.5 + Math.sin(da) * (yRY + 0.3 * s);
    const dSize = 2 * s;
    ctx.beginPath();
    ctx.moveTo(dx, dy - dSize);
    ctx.lineTo(dx + dSize * 0.8, dy);
    ctx.lineTo(dx, dy + dSize);
    ctx.lineTo(dx - dSize * 0.8, dy);
    ctx.closePath();
    ctx.stroke();
  }

  // Dome roof — built from iso ellipse base curving up to peak
  const domeBase = ty - wallH;
  const domePeak = domeBase - domeH;

  // Back half of dome (behind peak)
  const domeG = ctx.createRadialGradient(
    tx - 3 * s,
    domePeak + domeH * 0.3,
    0,
    tx,
    domeBase,
    yR * 1.1
  );
  domeG.addColorStop(0, "#A1887F");
  domeG.addColorStop(0.4, "#8D6E63");
  domeG.addColorStop(0.7, "#795548");
  domeG.addColorStop(1, "#5D4037");
  ctx.fillStyle = domeG;
  ctx.beginPath();
  ctx.ellipse(tx, domeBase, yRX + 2 * s, yRY + 1 * s, 0, Math.PI, Math.PI * 2);
  ctx.quadraticCurveTo(tx + yRX * 0.6, domePeak - domeH * 0.15, tx, domePeak);
  ctx.quadraticCurveTo(
    tx - yRX * 0.6,
    domePeak - domeH * 0.15,
    tx - yRX - 2 * s,
    domeBase
  );
  ctx.closePath();
  ctx.fill();

  // Dome lattice lines (converging to peak)
  ctx.strokeStyle = "rgba(60,40,20,0.12)";
  ctx.lineWidth = 0.6 * s;
  for (let lat = 0; lat < 5; lat++) {
    const angle = 0.3 + lat * 0.5;
    if (angle > Math.PI - 0.3) {
      break;
    }
    const baseX = tx + Math.cos(angle) * (yRX + 2 * s);
    const baseYp = domeBase + Math.sin(angle) * (yRY + 1 * s);
    if (baseYp < domeBase) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(baseX, baseYp);
    ctx.quadraticCurveTo(
      (baseX + tx) / 2,
      domePeak + domeH * 0.3,
      tx,
      domePeak
    );
    ctx.stroke();
  }

  // Horizontal dome ring
  ctx.strokeStyle = "rgba(60,40,20,0.1)";
  ctx.lineWidth = 0.5 * s;
  const ringY = domeBase - domeH * 0.45;
  const ringRX = yRX * 0.65;
  const ringRY = yRY * 0.65;
  ctx.beginPath();
  ctx.ellipse(tx, ringY, ringRX, ringRY, 0, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Smoke hole at top (iso ellipse)
  ctx.fillStyle = "#3E2E22";
  ctx.beginPath();
  ctx.ellipse(
    tx,
    domePeak + 1 * s,
    3.5 * s,
    3.5 * s * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#5D4037";
  ctx.beginPath();
  ctx.ellipse(
    tx,
    domePeak + 0.5 * s,
    4 * s,
    4 * s * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#3E2E22";
  ctx.beginPath();
  ctx.ellipse(
    tx,
    domePeak + 1 * s,
    3 * s,
    3 * s * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Crown ring around smoke hole
  ctx.strokeStyle = "#4A3A2A";
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.ellipse(
    tx,
    domePeak + 0.5 * s,
    4.5 * s,
    4.5 * s * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Door flap — proper iso-aligned rectangle on the right side
  const doorAngle = 0.3;
  const doorBaseX = tx + Math.cos(doorAngle) * yRX;
  const doorBaseY = ty + Math.sin(doorAngle) * yRY;
  const doorTopX = doorBaseX;
  const doorTopY = doorBaseY - wallH * 0.75;
  const doorW = 5 * s;

  ctx.fillStyle = "#4A3A28";
  ctx.beginPath();
  ctx.moveTo(doorBaseX - doorW * 0.5, doorBaseY);
  ctx.lineTo(doorBaseX + doorW * 0.5, doorBaseY);
  ctx.lineTo(doorTopX + doorW * 0.3, doorTopY);
  ctx.quadraticCurveTo(
    doorTopX,
    doorTopY - 2 * s,
    doorTopX - doorW * 0.3,
    doorTopY
  );
  ctx.closePath();
  ctx.fill();

  // Dark entrance
  ctx.fillStyle = "rgba(10,5,0,0.8)";
  ctx.beginPath();
  ctx.moveTo(doorBaseX - doorW * 0.35, doorBaseY);
  ctx.lineTo(doorBaseX + doorW * 0.35, doorBaseY);
  ctx.lineTo(doorTopX + doorW * 0.15, doorTopY + 2 * s);
  ctx.quadraticCurveTo(
    doorTopX,
    doorTopY,
    doorTopX - doorW * 0.15,
    doorTopY + 2 * s
  );
  ctx.closePath();
  ctx.fill();

  // Flap rolled to side
  ctx.fillStyle = "#6A5A48";
  ctx.beginPath();
  ctx.ellipse(
    doorBaseX + doorW * 0.55,
    (doorBaseY + doorTopY) / 2 + 2 * s,
    1.5 * s,
    wallH * 0.3,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// ── Variant 3: Mystical Pavilion ────────────────────────────────

function drawMysticalPavilion(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  s: number,
  decorTime: number,
  decorX: number
): void {
  const pavSize = 14 * s;
  const pavH = 22 * s;
  const iW = pavSize * ISO_COS;
  const iD = pavSize * ISO_SIN;

  // Pole positions at iso diamond corners
  const polePositions: [number, number][] = [
    [tx, ty - iD],
    [tx + iW, ty],
    [tx, ty + iD],
    [tx - iW, ty],
  ];

  // Draw back poles first
  const poleW = 2.5 * s;
  for (const p of [polePositions[0], polePositions[3]]) {
    drawIsometricPrism(
      ctx,
      p[0],
      p[1],
      poleW,
      poleW,
      pavH,
      "#4A3A2A",
      "#2A2018",
      "#3A2E22"
    );
    // Gold band at top
    drawIsometricPrism(
      ctx,
      p[0],
      p[1] - pavH,
      poleW + 0.5 * s,
      poleW + 0.5 * s,
      1.5 * s,
      "#B0A070",
      "#8A7050",
      "#9A8060"
    );
    // Gold band at bottom
    drawIsometricPrism(
      ctx,
      p[0],
      p[1],
      poleW + 0.5 * s,
      poleW + 0.5 * s,
      2 * s,
      "#B0A070",
      "#8A7050",
      "#9A8060"
    );
  }

  // Peaked roof — 4-face iso pyramid
  const roofBase = ty - pavH;
  const roofPeak = roofBase - 10 * s;
  const roofOv = 4 * s;
  const rIW = iW + roofOv * ISO_COS;
  const rID = iD + roofOv * ISO_SIN;

  // Roof back face (back corner)
  const rBack = [tx, roofBase - rID] as const;
  const rRight = [tx + rIW, roofBase] as const;
  const rFront = [tx, roofBase + rID] as const;
  const rLeft = [tx - rIW, roofBase] as const;

  // Back-right face
  const brG = ctx.createLinearGradient(tx, roofPeak, rRight[0], rRight[1]);
  brG.addColorStop(0, "#4A5A50");
  brG.addColorStop(1, "#3A4A40");
  ctx.fillStyle = brG;
  ctx.beginPath();
  ctx.moveTo(tx, roofPeak);
  ctx.lineTo(rRight[0], rRight[1]);
  ctx.lineTo(rBack[0], rBack[1]);
  ctx.closePath();
  ctx.fill();

  // Back-left face
  ctx.fillStyle = "#2A3530";
  ctx.beginPath();
  ctx.moveTo(tx, roofPeak);
  ctx.lineTo(rBack[0], rBack[1]);
  ctx.lineTo(rLeft[0], rLeft[1]);
  ctx.closePath();
  ctx.fill();

  // Front-left face (shadow side)
  const flG = ctx.createLinearGradient(rLeft[0], rLeft[1], tx, roofPeak);
  flG.addColorStop(0, "#2A3530");
  flG.addColorStop(1, "#3A4A40");
  ctx.fillStyle = flG;
  ctx.beginPath();
  ctx.moveTo(tx, roofPeak);
  ctx.lineTo(rLeft[0], rLeft[1]);
  ctx.lineTo(rFront[0], rFront[1]);
  ctx.closePath();
  ctx.fill();

  // Front-right face (lit side)
  const frG = ctx.createLinearGradient(tx, roofPeak, rFront[0], rFront[1]);
  frG.addColorStop(0, "#5A6A60");
  frG.addColorStop(0.5, "#4A5A50");
  frG.addColorStop(1, "#3A4A40");
  ctx.fillStyle = frG;
  ctx.beginPath();
  ctx.moveTo(tx, roofPeak);
  ctx.lineTo(rFront[0], rFront[1]);
  ctx.lineTo(rRight[0], rRight[1]);
  ctx.closePath();
  ctx.fill();

  // Brass trim on roof edges
  ctx.strokeStyle = "#8A7050";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(rLeft[0], rLeft[1]);
  ctx.lineTo(tx, roofPeak);
  ctx.lineTo(rRight[0], rRight[1]);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rLeft[0], rLeft[1]);
  ctx.lineTo(rFront[0], rFront[1]);
  ctx.lineTo(rRight[0], rRight[1]);
  ctx.stroke();

  // Fascia edges (visible front eaves)
  ctx.fillStyle = "#2A3028";
  ctx.beginPath();
  ctx.moveTo(rLeft[0], rLeft[1]);
  ctx.lineTo(rFront[0], rFront[1]);
  ctx.lineTo(rFront[0], rFront[1] + 2 * s);
  ctx.lineTo(rLeft[0], rLeft[1] + 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3A4038";
  ctx.beginPath();
  ctx.moveTo(rFront[0], rFront[1]);
  ctx.lineTo(rRight[0], rRight[1]);
  ctx.lineTo(rRight[0], rRight[1] + 2 * s);
  ctx.lineTo(rFront[0], rFront[1] + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Hanging silk drapes from roof edges
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#3A4A40";
  for (let d = 0; d < 3; d++) {
    const t = (d + 1) / 4;
    // Left drape
    const ldx = rLeft[0] + (rFront[0] - rLeft[0]) * t;
    const ldy = rLeft[1] + (rFront[1] - rLeft[1]) * t;
    ctx.beginPath();
    ctx.moveTo(ldx - 1.5 * s, ldy + 2 * s);
    ctx.lineTo(ldx + 1.5 * s, ldy + 2 * s);
    ctx.quadraticCurveTo(ldx + 1 * s, ldy + 10 * s, ldx, ldy + 12 * s);
    ctx.quadraticCurveTo(ldx - 1 * s, ldy + 10 * s, ldx - 1.5 * s, ldy + 2 * s);
    ctx.closePath();
    ctx.fill();

    // Right drape
    const rdx = rFront[0] + (rRight[0] - rFront[0]) * t;
    const rdy = rFront[1] + (rRight[1] - rFront[1]) * t;
    ctx.beginPath();
    ctx.moveTo(rdx - 1.5 * s, rdy + 2 * s);
    ctx.lineTo(rdx + 1.5 * s, rdy + 2 * s);
    ctx.quadraticCurveTo(rdx + 1 * s, rdy + 10 * s, rdx, rdy + 12 * s);
    ctx.quadraticCurveTo(rdx - 1 * s, rdy + 10 * s, rdx - 1.5 * s, rdy + 2 * s);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Draw front poles (in front of roof and drapes)
  for (const p of [polePositions[1], polePositions[2]]) {
    drawIsometricPrism(
      ctx,
      p[0],
      p[1],
      poleW,
      poleW,
      pavH,
      "#4A3A2A",
      "#2A2018",
      "#3A2E22"
    );
    drawIsometricPrism(
      ctx,
      p[0],
      p[1] - pavH,
      poleW + 0.5 * s,
      poleW + 0.5 * s,
      1.5 * s,
      "#B0A070",
      "#8A7050",
      "#9A8060"
    );
    drawIsometricPrism(
      ctx,
      p[0],
      p[1],
      poleW + 0.5 * s,
      poleW + 0.5 * s,
      2 * s,
      "#B0A070",
      "#8A7050",
      "#9A8060"
    );
  }

  // Floating magical orbs
  for (let o = 0; o < 3; o++) {
    const orbPhase = decorTime * 1.5 + o * 2.1;
    const ox = tx - 8 * s + o * 8 * s + Math.sin(orbPhase) * 3 * s;
    const oy = ty - pavH * 0.5 + Math.cos(orbPhase * 0.7) * 4 * s;

    setShadowBlur(ctx, 8 * s, "rgba(200,160,80,0.4)");
    ctx.fillStyle = "rgba(240,210,150,0.6)";
    ctx.beginPath();
    ctx.arc(ox, oy, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    ctx.fillStyle = "rgba(255,240,200,0.8)";
    ctx.beginPath();
    ctx.arc(ox - 0.5 * s, oy - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Brass finial at peak
  ctx.fillStyle = "#8A7050";
  ctx.beginPath();
  ctx.arc(tx, roofPeak - 1 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#C0B080";
  ctx.beginPath();
  ctx.arc(tx - 0.5 * s, roofPeak - 1.5 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();
  // Finial spike
  ctx.fillStyle = "#B0A070";
  ctx.beginPath();
  ctx.moveTo(tx, roofPeak - 6 * s);
  ctx.lineTo(tx - 1 * s, roofPeak - 2 * s);
  ctx.lineTo(tx + 1 * s, roofPeak - 2 * s);
  ctx.closePath();
  ctx.fill();
}

// ── Public entry point ──────────────────────────────────────────

export function drawTent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorTime: number,
  decorX: number,
  skipShadow: boolean
): void {
  const tv = variant % 4;

  if (!skipShadow) {
    drawDirectionalShadow(ctx, x, y + 2 * s, s, 22 * s, 10 * s, 30 * s, 0.28);
  }

  switch (tv) {
    case 0: {
      drawMilitaryTent(ctx, x, y, s, decorTime, decorX);
      break;
    }
    case 1: {
      drawMarketStall(ctx, x, y, s);
      break;
    }
    case 2: {
      drawYurt(ctx, x, y, s);
      break;
    }
    case 3: {
      drawMysticalPavilion(ctx, x, y, s, decorTime, decorX);
      break;
    }
  }
}
