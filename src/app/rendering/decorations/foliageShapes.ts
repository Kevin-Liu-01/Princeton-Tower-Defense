import { drawDirectionalShadow } from "./shadowHelpers";
import { drawOrganicBlobAt } from "../helpers";
import {
  TREE_PALETTES,
  BUSH_PALETTES,
  HEDGE_PALETTES,
  TREE_ACCENT_PALETTES,
  BUSH_ACCENT_PALETTES,
  HEDGE_FLOWER_PALETTES,
} from "./foliagePalettes";

function traceOrganicEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  bumpiness: number = 0.12,
  rotation: number = 0,
): void {
  const pts = 28;
  ctx.beginPath();
  for (let i = 0; i <= pts; i++) {
    const ang = (i / pts) * Math.PI * 2;
    const n1 = Math.sin(ang * 3 + seed) * bumpiness;
    const n2 = Math.sin(ang * 5 + seed * 2.3) * bumpiness * 0.5;
    const n3 = Math.sin(ang * 7 + seed * 4.1) * bumpiness * 0.25;
    const variation = 1 + n1 + n2 + n3;
    const lx = Math.cos(ang) * rx * variation;
    const ly = Math.sin(ang) * ry * variation;
    const px = cx + lx * Math.cos(rotation) - ly * Math.sin(rotation);
    const py = cy + lx * Math.sin(rotation) + ly * Math.cos(rotation);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawLeafMark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  angle: number,
): void {
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 1.6, size * 0.5, angle, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
): void {
  const tv = TREE_PALETTES[variant % TREE_PALETTES.length];
  const tSeed = decorX * 73 + decorY * 41;

  const shapeType = Math.abs(tSeed) % 3;
  const trunkH = 22 + (Math.abs(tSeed * 7) % 7);
  const trunkW = 4.5 + (Math.abs(tSeed * 13) % 3) * 0.4;
  const lean = Math.sin(tSeed * 0.17) * 2;
  const cW = shapeType === 2 ? 1.15 : shapeType === 1 ? 0.85 : 1.0;
  const cH = shapeType === 1 ? 1.2 : shapeType === 2 ? 0.85 : 1.0;

  drawDirectionalShadow(
    ctx,
    x,
    y + 5 * s,
    s,
    18 * cW * s,
    10 * s,
    35 * s,
    0.3,
  );

  const topX = x + lean * s;

  // Visible roots at base (drawn first so trunk sits on top)
  const rootSpread = 7 + (Math.abs(tSeed * 11) % 3);
  ctx.fillStyle = tv.trunkDark;
  drawOrganicBlobAt(
    ctx,
    x,
    y + 3 * s,
    rootSpread * s,
    4 * s,
    tSeed * 1.7,
    0.1,
  );
  ctx.fill();
  ctx.fillStyle = tv.trunk;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + 2 * s,
    (rootSpread - 2) * s,
    3 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Trunk left face (shadow)
  ctx.fillStyle = tv.trunkDark;
  ctx.beginPath();
  ctx.moveTo(x - trunkW * s, y + 5 * s);
  ctx.lineTo(topX - (trunkW - 1) * s, y - trunkH * s);
  ctx.lineTo(topX, y - (trunkH + 2) * s);
  ctx.lineTo(x, y + 3 * s);
  ctx.closePath();
  ctx.fill();

  // Trunk right face (lit) with highlight
  const trunkGrad = ctx.createLinearGradient(
    x,
    y,
    x + (trunkW + 1) * s,
    y,
  );
  trunkGrad.addColorStop(0, tv.trunk);
  trunkGrad.addColorStop(0.6, tv.trunkHighlight);
  trunkGrad.addColorStop(1, tv.trunkDark);
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x + trunkW * s, y + 5 * s);
  ctx.lineTo(topX + (trunkW - 1) * s, y - trunkH * s);
  ctx.lineTo(topX, y - (trunkH + 2) * s);
  ctx.lineTo(x, y + 3 * s);
  ctx.closePath();
  ctx.fill();

  // Bark texture — varied knots and grain
  const barkCount = 4 + (Math.abs(tSeed) % 3);
  ctx.strokeStyle = tv.trunkDark;
  ctx.lineWidth = 0.7 * s;
  for (let i = 0; i < barkCount; i++) {
    const frac = (i + 0.5) / barkCount;
    const barkY = y + 3 * s - frac * (trunkH + 5) * s;
    const leanAtY = lean * frac;
    ctx.beginPath();
    ctx.moveTo(
      x - 3 * s + leanAtY * s,
      barkY + Math.sin(tSeed + i) * 1.5 * s,
    );
    ctx.quadraticCurveTo(
      x + leanAtY * s,
      barkY + Math.sin(tSeed + i * 2.3) * 2 * s,
      x + 3 * s + leanAtY * s,
      barkY - Math.sin(tSeed + i + 1) * 1.5 * s,
    );
    ctx.stroke();
  }
  // Bark knots
  for (let i = 0; i < 2; i++) {
    const knotFrac = 0.3 + (Math.abs(tSeed + i * 37) % 40) / 100;
    const knotX = x + lean * knotFrac * s + (i === 0 ? -1.5 : 1) * s;
    const knotY = y + 3 * s - knotFrac * (trunkH + 5) * s;
    ctx.fillStyle = tv.trunkDark;
    ctx.beginPath();
    ctx.ellipse(knotX, knotY, 1.2 * s, 0.8 * s, 0.5 * i, 0, Math.PI * 2);
    ctx.fill();
  }

  // Branch stubs visible at trunk-canopy junction
  const canopyCX = x + lean * 0.5 * s;
  const baseY = -trunkH + 4;
  ctx.strokeStyle = tv.trunkDark;
  ctx.lineWidth = 1.8 * s;
  const branchAngles = [
    -0.6 + Math.sin(tSeed * 0.3) * 0.2,
    0.5 + Math.cos(tSeed * 0.5) * 0.2,
    -0.2 + Math.sin(tSeed * 0.7) * 0.15,
  ];
  for (let bi = 0; bi < branchAngles.length; bi++) {
    const ba = branchAngles[bi];
    const bLen = (5 + (Math.abs(tSeed + bi * 17) % 4)) * s;
    const bStartY = y + (baseY + 2 + bi * 2) * s;
    const bStartX = topX + (bi % 2 === 0 ? -1 : 1) * 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(bStartX, bStartY);
    ctx.lineTo(bStartX + Math.cos(ba) * bLen, bStartY + Math.sin(ba) * bLen);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Main canopy — organic layered blobs
  const foliageLayers = [
    {
      oy: baseY,
      rx: 26 * cW,
      ry: 14 * cH,
      color: tv.foliage[0],
      bump: 0.12,
    },
    {
      oy: baseY - 6 * cH,
      rx: 24 * cW,
      ry: 13 * cH,
      color: tv.foliage[1],
      bump: 0.1,
    },
    {
      oy: baseY - 12 * cH,
      rx: 20 * cW,
      ry: 11 * cH,
      color: tv.foliage[2],
      bump: 0.09,
    },
    {
      oy: baseY - 17 * cH,
      rx: 14 * cW,
      ry: 8 * cH,
      color: tv.foliage[3],
      bump: 0.08,
    },
  ];

  // Canopy underside shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  traceOrganicEllipse(
    ctx,
    canopyCX,
    y + (baseY + 3) * s,
    foliageLayers[0].rx * s,
    foliageLayers[0].ry * s * 0.55,
    tSeed * 0.7,
    0.1,
  );
  ctx.fill();

  foliageLayers.forEach((layer, idx) => {
    const grad = ctx.createRadialGradient(
      canopyCX - layer.rx * 0.3 * s,
      y + layer.oy * s - layer.ry * 0.3 * s,
      0,
      canopyCX,
      y + layer.oy * s,
      layer.rx * s,
    );
    grad.addColorStop(0, tv.foliage[Math.min(idx + 1, 3)]);
    grad.addColorStop(0.65, layer.color);
    grad.addColorStop(1, tv.foliage[0]);
    ctx.fillStyle = grad;
    traceOrganicEllipse(
      ctx,
      canopyCX,
      y + layer.oy * s,
      layer.rx * s,
      layer.ry * s,
      tSeed + idx * 11,
      layer.bump,
    );
    ctx.fill();
  });

  // Dark depth crevices between foliage zones
  ctx.fillStyle = "rgba(10,40,10,0.2)";
  for (let i = 0; i < 5; i++) {
    const crevAngle =
      (i / 5) * Math.PI * 1.6 - Math.PI * 0.3 + Math.sin(tSeed + i * 5) * 0.3;
    const crevDist = 8 + Math.sin(tSeed + i * 3.3) * 5;
    const cx = canopyCX + Math.cos(crevAngle) * crevDist * cW * s;
    const cy =
      y + (baseY - 6 * cH + Math.sin(crevAngle) * 5 * cH) * s;
    traceOrganicEllipse(ctx, cx, cy, 4 * s, 2.5 * s, tSeed + i * 7, 0.15);
    ctx.fill();
  }

  // Organic foliage clusters with bumpy edges
  const clusterCount = 6 + (Math.abs(tSeed) % 3);
  for (let ci = 0; ci < clusterCount; ci++) {
    const cAngle = (ci / clusterCount) * Math.PI * 2 + tSeed * 0.1;
    const cDist = 10 + Math.sin(tSeed + ci * 2.7) * 7;
    const lcx = canopyCX + Math.cos(cAngle) * cDist * cW * s;
    const lcy =
      y +
      (baseY -
        8 * cH +
        Math.sin(cAngle) * 6 * cH +
        Math.cos(tSeed + ci * 1.9) * 3) *
        s;
    const lcr = 5 + Math.sin(tSeed + ci * 3.1) * 2;
    const grad = ctx.createRadialGradient(
      lcx - lcr * 0.3 * s,
      lcy - lcr * 0.3 * s,
      0,
      lcx,
      lcy,
      lcr * s,
    );
    grad.addColorStop(0, tv.foliage[3]);
    grad.addColorStop(0.5, tv.foliage[2]);
    grad.addColorStop(1, tv.foliage[1]);
    ctx.fillStyle = grad;
    traceOrganicEllipse(
      ctx,
      lcx,
      lcy,
      lcr * s,
      lcr * 0.6 * s,
      tSeed + ci * 13,
      0.14,
      cAngle * 0.3,
    );
    ctx.fill();
  }

  // Small raised bumps for leaf texture across canopy
  for (let i = 0; i < 12; i++) {
    const bAng = (i / 12) * Math.PI * 2 + tSeed * 0.05;
    const bDist = (6 + Math.sin(tSeed + i * 2.1) * 10) * cW;
    const bx = canopyCX + Math.cos(bAng) * bDist * s;
    const by =
      y + (baseY - 9 * cH + Math.sin(bAng) * 6 * cH) * s;
    const br = (2 + Math.sin(tSeed + i * 3.7) * 0.8) * s;
    ctx.fillStyle =
      i % 3 === 0 ? tv.foliage[3] : i % 3 === 1 ? tv.foliage[2] : tv.leafAccent;
    ctx.globalAlpha = 0.6;
    traceOrganicEllipse(ctx, bx, by, br, br * 0.55, tSeed + i * 19, 0.18);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Leaf-shaped texture marks (not circles)
  const markCount = 8 + (Math.abs(tSeed * 3) % 4);
  for (let di = 0; di < markCount; di++) {
    const mAng = (di / markCount) * Math.PI * 2 + tSeed * 0.13;
    const mDist = 5 + Math.sin(tSeed + di * 1.9) * 12;
    const mx = canopyCX + Math.cos(mAng) * mDist * cW * s;
    const my =
      y + (baseY - 10 * cH + Math.sin(mAng + tSeed * 0.07) * 9 * cH) * s;
    const mRot = mAng + Math.sin(tSeed + di * 2.7) * 0.5;
    ctx.fillStyle = tv.leafAccent;
    ctx.globalAlpha = 0.35 + Math.sin(tSeed + di * 3.7) * 0.15;
    drawLeafMark(ctx, mx, my, 1.1 * s, mRot);
  }
  ctx.globalAlpha = 1;

  // Light-facing highlight patches (organic, not ellipses)
  const hlY = baseY - 14 * cH;
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  traceOrganicEllipse(
    ctx,
    canopyCX - 4 * s,
    y + hlY * s,
    5 * cW * s,
    3 * cH * s,
    tSeed * 2.1,
    0.15,
    -0.3,
  );
  ctx.fill();
  traceOrganicEllipse(
    ctx,
    canopyCX + 7 * s,
    y + (hlY + 7) * s,
    4 * cW * s,
    2.5 * cH * s,
    tSeed * 3.1,
    0.12,
    0.2,
  );
  ctx.fill();

  // Tiny scattered highlight flecks
  ctx.fillStyle = "rgba(255,255,255,0.13)";
  for (let hi = 0; hi < 6; hi++) {
    const hx =
      canopyCX + Math.sin(tSeed + hi * 4.3) * 12 * cW * s;
    const hy =
      y + (baseY - 12 * cH + Math.cos(tSeed + hi * 3.1) * 7 * cH) * s;
    drawLeafMark(ctx, hx, hy, 0.8 * s, tSeed + hi * 1.7);
  }

  // Edge leaf silhouette bumps
  ctx.fillStyle = tv.foliage[2];
  ctx.globalAlpha = 0.5;
  for (let ei = 0; ei < 10; ei++) {
    const eAng = (ei / 10) * Math.PI * 2 + tSeed * 0.03;
    const topLayer = foliageLayers[1];
    const edgeDist =
      topLayer.rx * 0.92 + Math.sin(tSeed + ei * 4.7) * 2;
    const ex = canopyCX + Math.cos(eAng) * edgeDist * s;
    const ey =
      y + (topLayer.oy + Math.sin(eAng) * topLayer.ry * 0.85) * s;
    const er = (1.8 + Math.sin(tSeed + ei * 3.3) * 0.6) * s;
    traceOrganicEllipse(
      ctx,
      ex,
      ey,
      er * 1.3,
      er * 0.7,
      tSeed + ei * 23,
      0.2,
      eAng,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Fruit / blossom accents on certain palette variants
  const palIdx = variant % TREE_PALETTES.length;
  if (palIdx === 4) {
    const colors = TREE_ACCENT_PALETTES.fruit;
    for (let ai = 0; ai < 5; ai++) {
      ctx.fillStyle = colors[ai % colors.length];
      const ax = canopyCX + Math.sin(tSeed + ai * 3.3) * 14 * cW * s;
      const ay =
        y + (baseY - 4 + Math.cos(tSeed + ai * 2.1) * 10 * cH) * s;
      ctx.beginPath();
      ctx.arc(ax, ay, 1.3 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(ax - 0.3 * s, ay - 0.3 * s, 0.4 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (palIdx === 5) {
    const colors = TREE_ACCENT_PALETTES.blossoms;
    for (let ai = 0; ai < 4; ai++) {
      const bx = canopyCX + Math.sin(tSeed + ai * 4.1) * 12 * cW * s;
      const by =
        y + (baseY - 6 + Math.cos(tSeed + ai * 2.9) * 8 * cH) * s;
      ctx.fillStyle = colors[ai % colors.length];
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2 + tSeed * 0.01;
        ctx.beginPath();
        ctx.ellipse(
          bx + Math.cos(pa) * 1.4 * s,
          by + Math.sin(pa) * 1 * s,
          1 * s,
          0.5 * s,
          pa,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#ffd740";
      ctx.beginPath();
      ctx.arc(bx, by, 0.6 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (palIdx === 6) {
    const colors = TREE_ACCENT_PALETTES.acorns;
    for (let ai = 0; ai < 3; ai++) {
      ctx.fillStyle = colors[ai % colors.length];
      const ax = canopyCX + Math.sin(tSeed + ai * 2.5) * 10 * cW * s;
      const ay =
        y + (baseY - 2 + Math.cos(tSeed + ai * 1.8) * 8 * cH) * s;
      ctx.beginPath();
      ctx.ellipse(ax, ay, 0.9 * s, 1.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = tv.trunkDark;
      ctx.beginPath();
      ctx.ellipse(ax, ay - 1 * s, 1 * s, 0.5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
): void {
  const bv = BUSH_PALETTES[variant % BUSH_PALETTES.length];
  const bSeed = decorX * 59 + decorY * 37;

  const shapeType = Math.abs(bSeed) % 3;
  const wScale = shapeType === 1 ? 1.2 : shapeType === 2 ? 0.85 : 1.0;
  const hScale = shapeType === 2 ? 1.15 : shapeType === 1 ? 0.85 : 1.0;
  const baseRx = 18 * wScale;
  const baseRy = 12 * hScale;

  drawDirectionalShadow(
    ctx,
    x,
    y + 2 * s,
    s,
    14 * wScale * s,
    7 * s,
    18 * s,
    0.25,
  );

  // Subtle stem/branch at base
  ctx.fillStyle = bv.stemColor;
  const stemCount = 2 + (Math.abs(bSeed) % 3);
  for (let si = 0; si < stemCount; si++) {
    const sx = x + (Math.sin(bSeed + si * 2.3) * 6 - 2) * s;
    const sw = (1 + Math.sin(bSeed + si * 4.1) * 0.3) * s;
    ctx.beginPath();
    ctx.moveTo(sx - sw * 0.5, y + 2 * s);
    ctx.lineTo(sx - sw * 0.3, y - 3 * s);
    ctx.lineTo(sx + sw * 0.3, y - 3 * s);
    ctx.lineTo(sx + sw * 0.5, y + 2 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Base foliage mass — organic blob
  const baseGrad = ctx.createRadialGradient(
    x - baseRx * 0.2 * s,
    y - (2 * hScale + baseRy * 0.25) * s,
    0,
    x,
    y - 2 * hScale * s,
    baseRx * s,
  );
  baseGrad.addColorStop(0, bv.mid);
  baseGrad.addColorStop(0.55, bv.base);
  baseGrad.addColorStop(1, bv.dark);
  ctx.fillStyle = baseGrad;
  traceOrganicEllipse(
    ctx,
    x,
    y - 2 * hScale * s,
    baseRx * s,
    baseRy * s,
    bSeed,
    0.1,
  );
  ctx.fill();

  // Organic foliage clusters
  const clusterCount = 5 + (Math.abs(bSeed) % 3);
  for (let ci = 0; ci < clusterCount; ci++) {
    const angle = (ci / clusterCount) * Math.PI * 2 + bSeed * 0.07;
    const dist = 6 + Math.sin(bSeed + ci * 2.1) * 4;
    const cx = x + Math.cos(angle) * dist * wScale * s;
    const cy =
      y +
      (-6 * hScale +
        Math.sin(angle) * 4 * hScale +
        Math.cos(bSeed + ci * 1.5) * 2) *
        s;
    const crx = (8 + Math.sin(bSeed + ci * 3.3) * 2) * wScale;
    const cry = (6 + Math.cos(bSeed + ci * 2.7) * 1.5) * hScale;
    const grad = ctx.createRadialGradient(
      cx - 2 * s,
      cy - 2 * s,
      0,
      cx,
      cy,
      crx * s,
    );
    grad.addColorStop(0, ci < clusterCount / 2 ? bv.light : bv.accent);
    grad.addColorStop(0.4, bv.mid);
    grad.addColorStop(1, bv.base);
    ctx.fillStyle = grad;
    traceOrganicEllipse(
      ctx,
      cx,
      cy,
      crx * s,
      cry * s,
      bSeed + ci * 11,
      0.13,
    );
    ctx.fill();
  }

  // Dark depth crevices
  ctx.fillStyle = "rgba(10,40,10,0.18)";
  for (let i = 0; i < 3; i++) {
    const ca = (i / 3) * Math.PI * 2 + bSeed * 0.1;
    const cdist = 4 + Math.sin(bSeed + i * 3.3) * 3;
    const ccx = x + Math.cos(ca) * cdist * wScale * s;
    const ccy = y + (-5 * hScale + Math.sin(ca) * 3 * hScale) * s;
    traceOrganicEllipse(
      ctx,
      ccx,
      ccy,
      3 * s,
      2 * s,
      bSeed + i * 17,
      0.15,
    );
    ctx.fill();
  }

  // Small raised texture bumps
  for (let i = 0; i < 8; i++) {
    const bAng = (i / 8) * Math.PI * 2 + bSeed * 0.04;
    const bDist = (4 + Math.sin(bSeed + i * 2.3) * 7) * wScale;
    const bx = x + Math.cos(bAng) * bDist * s;
    const by =
      y + (-6 * hScale + Math.sin(bAng) * 4 * hScale) * s;
    const br = (1.8 + Math.sin(bSeed + i * 3.7) * 0.5) * s;
    ctx.fillStyle =
      i % 3 === 0 ? bv.light : i % 3 === 1 ? bv.accent : bv.mid;
    ctx.globalAlpha = 0.55;
    traceOrganicEllipse(ctx, bx, by, br, br * 0.6, bSeed + i * 19, 0.18);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Highlight patches
  const hlCount = 2 + (Math.abs(bSeed * 5) % 2);
  for (let hi = 0; hi < hlCount; hi++) {
    const hlx = x + Math.sin(bSeed + hi * 3.7) * 6 * wScale * s;
    const hly = y + (-10 * hScale + Math.cos(bSeed + hi * 2.3) * 3) * s;
    const hlr = 3.5 + Math.sin(bSeed + hi * 4.1) * 1;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    traceOrganicEllipse(
      ctx,
      hlx,
      hly,
      hlr * s,
      hlr * 0.55 * s,
      bSeed + hi * 31,
      0.14,
      -0.2,
    );
    ctx.fill();
  }

  // Leaf-shaped texture marks
  const leafMarks = 6 + (Math.abs(bSeed * 3) % 4);
  for (let li = 0; li < leafMarks; li++) {
    const lAng = (li / leafMarks) * Math.PI * 2 + bSeed * 0.06;
    const lDist = 4 + Math.sin(bSeed + li * 1.9) * 8;
    const lx = x + Math.cos(lAng) * lDist * wScale * s;
    const ly =
      y + (-7 * hScale + Math.sin(lAng) * 4 * hScale) * s;
    ctx.fillStyle = bv.accent;
    ctx.globalAlpha = 0.4;
    drawLeafMark(ctx, lx, ly, 1 * s, lAng + Math.sin(bSeed + li) * 0.5);
  }
  ctx.globalAlpha = 1;

  // Edge silhouette bumps
  ctx.fillStyle = bv.base;
  ctx.globalAlpha = 0.45;
  for (let ei = 0; ei < 8; ei++) {
    const eAng = (ei / 8) * Math.PI * 2 + bSeed * 0.02;
    const edgeDist = baseRx * 0.88 + Math.sin(bSeed + ei * 5.1) * 1.5;
    const ex = x + Math.cos(eAng) * edgeDist * s;
    const ey =
      y + (-2 * hScale + Math.sin(eAng) * baseRy * 0.8 * hScale) * s;
    const er = (1.4 + Math.sin(bSeed + ei * 3.7) * 0.4) * s;
    traceOrganicEllipse(ctx, ex, ey, er, er * 0.6, bSeed + ei * 29, 0.2, eAng);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Accent variety
  const accentType = variant % 4;
  if (accentType === 0) {
    const colors = BUSH_ACCENT_PALETTES.berries;
    const berryCount = 3 + (Math.abs(bSeed) % 3);
    for (let bi = 0; bi < berryCount; bi++) {
      const bbx = x + Math.sin(bSeed + bi * 2.1) * 8 * wScale * s;
      const bby =
        y + (-6 * hScale + Math.cos(bSeed + bi * 1.5) * 4 * hScale) * s;
      ctx.fillStyle = colors[bi % colors.length];
      ctx.beginPath();
      ctx.arc(bbx, bby, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(bbx - 0.3 * s, bby - 0.3 * s, 0.35 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (accentType === 2) {
    const colors = BUSH_ACCENT_PALETTES.wildflowers;
    for (let fi = 0; fi < 3; fi++) {
      const fx = x + Math.sin(bSeed + fi * 3.7) * 10 * wScale * s;
      const fy =
        y + (-4 * hScale + Math.cos(bSeed + fi * 2.3) * 5 * hScale) * s;
      ctx.fillStyle = colors[fi % colors.length];
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2 + bSeed * 0.01;
        ctx.beginPath();
        ctx.ellipse(
          fx + Math.cos(pa) * 1.2 * s,
          fy + Math.sin(pa) * 0.7 * s,
          1 * s,
          0.45 * s,
          pa,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#ffd740";
      ctx.beginPath();
      ctx.arc(fx, fy, 0.6 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (accentType === 3) {
    const colors = BUSH_ACCENT_PALETTES.yellowFlowers;
    for (let fi = 0; fi < 4; fi++) {
      const fx = x + Math.sin(bSeed + fi * 2.9) * 9 * wScale * s;
      const fy =
        y + (-5 * hScale + Math.cos(bSeed + fi * 1.9) * 4 * hScale) * s;
      ctx.fillStyle = colors[fi % colors.length];
      for (let p = 0; p < 4; p++) {
        const pa = (p / 4) * Math.PI * 2 + bSeed * 0.02;
        ctx.beginPath();
        ctx.ellipse(
          fx + Math.cos(pa) * 0.9 * s,
          fy + Math.sin(pa) * 0.6 * s,
          0.7 * s,
          0.35 * s,
          pa,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#ff8f00";
      ctx.beginPath();
      ctx.arc(fx, fy, 0.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ground contact shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  traceOrganicEllipse(
    ctx,
    x,
    y + 2 * s,
    14 * wScale * s,
    4 * s,
    bSeed * 1.3,
    0.08,
  );
  ctx.fill();
}

export function drawHedge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
): void {
  const hp = HEDGE_PALETTES[variant % HEDGE_PALETTES.length];
  const hSeed = decorX * 73 + decorY * 41;

  const wMul = 1.0 + Math.sin(hSeed * 0.13) * 0.08;
  const hMul = 1.0 + Math.cos(hSeed * 0.17) * 0.06;
  const hw = 22 * s * wMul;
  const hd = 10 * s;
  const hh = 20 * s * hMul;

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(
    x + 3 * s,
    y + 5 * s,
    hw * 0.6,
    hd * 0.55,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = hp.stem;
  ctx.fillRect(x - 3 * s, y - 2 * s, 2 * s, 4 * s);
  ctx.fillRect(x + 2 * s, y - 1 * s, 1.5 * s, 3 * s);
  ctx.fillStyle = hp.stemDark;
  ctx.fillRect(x - hw * 0.2, y - 1 * s, 1.5 * s, 3 * s);

  // Left face (shadow side) — organic curved silhouette
  ctx.fillStyle = hp.shadowFace;
  ctx.beginPath();
  ctx.moveTo(x - hw * 0.48, y + 1 * s);
  ctx.lineTo(x - hw * 0.5, y - hh * 0.15);
  ctx.quadraticCurveTo(
    x - hw * 0.46,
    y - hh * 0.6,
    x - hw * 0.28,
    y - hh * 0.82,
  );
  ctx.quadraticCurveTo(
    x - hw * 0.1,
    y - hh * 0.98,
    x,
    y - hh * 0.88 + hd * 0.35,
  );
  ctx.lineTo(x, y + hd * 0.45);
  ctx.closePath();
  ctx.fill();

  // Right face (lit side)
  const rfG = ctx.createLinearGradient(x, y, x + hw * 0.5, y);
  rfG.addColorStop(0, hp.litFace);
  rfG.addColorStop(1, hp.litFaceEdge);
  ctx.fillStyle = rfG;
  ctx.beginPath();
  ctx.moveTo(x + hw * 0.48, y + 1 * s);
  ctx.lineTo(x + hw * 0.5, y - hh * 0.15);
  ctx.quadraticCurveTo(
    x + hw * 0.46,
    y - hh * 0.55,
    x + hw * 0.28,
    y - hh * 0.78,
  );
  ctx.quadraticCurveTo(
    x + hw * 0.1,
    y - hh * 0.92,
    x,
    y - hh * 0.88 + hd * 0.35,
  );
  ctx.lineTo(x, y + hd * 0.45);
  ctx.closePath();
  ctx.fill();

  // Top surface — rounded elliptical crown
  const topG = ctx.createRadialGradient(
    x - 2 * s,
    y - hh * 0.88,
    0,
    x,
    y - hh * 0.85,
    hw * 0.45,
  );
  topG.addColorStop(0, hp.topBright);
  topG.addColorStop(0.5, hp.topMid);
  topG.addColorStop(1, hp.topDark);
  ctx.fillStyle = topG;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - hh * 0.85,
    hw * 0.44,
    hd * 0.42,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Layered leaf clusters on left face
  for (let i = 0; i < 14; i++) {
    const lx = x - hw * 0.33 + Math.sin(hSeed + i * 2.7) * hw * 0.14;
    const ly =
      y - hh * 0.1 - i * hh * 0.052 + Math.cos(hSeed + i * 1.9) * 1.5 * s;
    const lr = (2.8 + Math.sin(hSeed + i * 3.1) * 0.9) * s;
    ctx.fillStyle = hp.leftLeaf[i % 4];
    traceOrganicEllipse(
      ctx,
      lx,
      ly,
      lr * 1.4,
      lr * 0.85,
      hSeed + i * 7,
      0.16,
      0.3 * ((i % 5) - 2),
    );
    ctx.fill();
  }

  // Layered leaf clusters on right face
  for (let i = 0; i < 14; i++) {
    const rx = x + hw * 0.33 + Math.sin(hSeed + i * 2.3) * hw * 0.11;
    const ry =
      y - hh * 0.1 - i * hh * 0.052 + Math.cos(hSeed + i * 1.7) * 1.5 * s;
    const rr = (2.8 + Math.sin(hSeed + i * 2.9) * 0.9) * s;
    ctx.fillStyle = hp.rightLeaf[i % 4];
    traceOrganicEllipse(
      ctx,
      rx,
      ry,
      rr * 1.4,
      rr * 0.85,
      hSeed + i * 9,
      0.16,
      -0.3 * ((i % 5) - 2),
    );
    ctx.fill();
  }

  // Top crown leaf clusters
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const dist = hw * 0.26 + Math.sin(hSeed + i * 3.7) * 2 * s;
    const tx = x + Math.cos(angle) * dist;
    const ty = y - hh * 0.85 + Math.sin(angle) * hd * 0.24;
    const tr = (3.2 + Math.sin(hSeed + i * 4.1) * 1.2) * s;
    ctx.fillStyle = hp.topLeaf[i % 3];
    traceOrganicEllipse(ctx, tx, ty, tr, tr * 0.75, hSeed + i * 13, 0.15);
    ctx.fill();
  }

  // Highlight clusters on top-right (sun-facing)
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 6; i++) {
    const hlx = x + hw * 0.08 + Math.sin(hSeed + i * 5.3) * hw * 0.2;
    const hly = y - hh * 0.88 + Math.cos(hSeed + i * 3.3) * hd * 0.14;
    ctx.fillStyle = hp.highlight;
    traceOrganicEllipse(
      ctx,
      hlx,
      hly,
      (2.2 + Math.sin(hSeed + i * 2.1)) * s,
      (1.6 + Math.sin(hSeed + i * 2.1) * 0.5) * s,
      hSeed + i * 17,
      0.14,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Subtle dark leaf edges
  ctx.fillStyle = "rgba(15,50,15,0.25)";
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const ex = x + Math.cos(angle) * hw * 0.4;
    const ey = y - hh * 0.85 + Math.sin(angle) * hd * 0.36;
    ctx.beginPath();
    ctx.arc(ex, ey, 1.8 * s, angle - 0.5, angle + 0.5);
    ctx.fill();
  }

  // Leaf texture marks on faces
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1;
    const faceX = x + side * hw * 0.28 + Math.sin(hSeed + i * 2.9) * hw * 0.08;
    const faceY = y - hh * 0.15 - (i % 4) * hh * 0.16;
    ctx.fillStyle = side < 0 ? hp.leftLeaf[i % 4] : hp.rightLeaf[i % 4];
    drawLeafMark(
      ctx,
      faceX,
      faceY,
      1.2 * s,
      side * 0.4 + Math.sin(hSeed + i * 1.7) * 0.3,
    );
  }
  ctx.globalAlpha = 1;

  // Flowers integrated into foliage (even variants)
  if (variant % 2 === 0) {
    const flwC =
      HEDGE_FLOWER_PALETTES[variant % HEDGE_FLOWER_PALETTES.length];
    for (let f = 0; f < 7; f++) {
      const fx = x + Math.sin(hSeed + f * 4.7) * hw * 0.32;
      const fy =
        y - hh * 0.2 - f * hh * 0.09 + Math.cos(hSeed + f * 3.1) * 2 * s;
      ctx.fillStyle = flwC[f % flwC.length];
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2 + hSeed * 0.01;
        ctx.beginPath();
        ctx.ellipse(
          fx + Math.cos(pa) * 1.3 * s,
          fy + Math.sin(pa) * 0.8 * s,
          1.2 * s,
          0.55 * s,
          pa,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#ffd740";
      ctx.beginPath();
      ctx.arc(fx, fy, 0.7 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Bird perched on top (variant 1 or 3)
  if (variant % 4 === 1 || variant % 4 === 3) {
    const birdColors = ["#5a3a2a", "#3a4a6a", "#6a4a3a", "#4a5a3a"];
    const bx = x + 3 * s;
    const by = y - hh * 0.95;
    ctx.fillStyle = birdColors[variant % birdColors.length];
    ctx.beginPath();
    ctx.ellipse(bx, by, 2.5 * s, 1.5 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx + 2 * s, by - 1 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffa000";
    ctx.beginPath();
    ctx.moveTo(bx + 3.2 * s, by - 1 * s);
    ctx.lineTo(bx + 4.5 * s, by - 0.8 * s);
    ctx.lineTo(bx + 3.2 * s, by - 0.5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(bx + 2.5 * s, by - 1.3 * s, 0.4 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}
