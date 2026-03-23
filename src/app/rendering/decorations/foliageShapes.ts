import { drawDirectionalShadow } from "./shadowHelpers";
import { drawOrganicBlobAt } from "../helpers";
import {
  TREE_PALETTES,
  BUSH_PALETTES,
  HEDGE_PALETTES,
  TREE_ACCENT_PALETTES,
  BUSH_ACCENT_PALETTES,
  HEDGE_FLOWER_PALETTES,
  PINE_PALETTES,
  CHARRED_TREE_PALETTES,
  SWAMP_TREE_PALETTES,
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

function drawSwampWaterBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  widthMul: number,
  sSeed: number,
  decorTime: number,
  palette: typeof SWAMP_TREE_PALETTES[number],
): void {
  const waterGrad = ctx.createRadialGradient(
    x - 4 * s,
    y + 5 * s,
    2 * s,
    x,
    y + 6 * s,
    22 * widthMul * s,
  );
  waterGrad.addColorStop(0, "rgba(40,70,62,0.34)");
  waterGrad.addColorStop(0.45, "rgba(24,46,42,0.22)");
  waterGrad.addColorStop(1, "rgba(10,20,18,0)");
  ctx.fillStyle = waterGrad;
  traceOrganicEllipse(
    ctx,
    x,
    y + 6 * s,
    18 * widthMul * s,
    8 * s,
    sSeed * 0.61,
    0.11,
    -0.06,
  );
  ctx.fill();

  for (let r = 0; r < 3; r++) {
    const ripplePhase = ((decorTime * 0.9 + r * 0.45 + sSeed * 0.003) % 1 + 1) % 1;
    const rx = (8 + ripplePhase * 10) * widthMul * s;
    const ry = (3.5 + ripplePhase * 4.2) * s;
    ctx.strokeStyle = `rgba(120,170,150,${(0.14 * (1 - ripplePhase)).toFixed(3)})`;
    ctx.lineWidth = (1.1 - ripplePhase * 0.35) * s;
    ctx.beginPath();
    ctx.ellipse(x, y + 7 * s, rx, ry, 0.04, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = palette.mossDark;
  for (let p = 0; p < 5; p++) {
    const ang = (p / 5) * Math.PI * 2 + sSeed * 0.07;
    const dist = (8 + Math.sin(sSeed + p * 1.9) * 4) * widthMul * s;
    drawOrganicBlobAt(
      ctx,
      x + Math.cos(ang) * dist,
      y + 7 * s + Math.sin(ang) * 2 * s,
      (2.4 + Math.sin(sSeed + p * 2.7) * 0.8) * s,
      (1.5 + Math.cos(sSeed + p * 1.3) * 0.3) * s,
      sSeed * 1.9 + p * 13,
      0.12,
    );
    ctx.fill();
  }
}

function drawSwampTrunkRidges(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  heightMul: number,
  twistDir: number,
  sSeed: number,
  palette: typeof SWAMP_TREE_PALETTES[number],
): void {
  const ridgeCount = 6;
  ctx.strokeStyle = palette.trunkMid;
  ctx.lineWidth = 0.95 * s;
  for (let i = 0; i < ridgeCount; i++) {
    const frac = (i + 0.7) / (ridgeCount + 0.8);
    const startY = y + 1.5 * s - frac * 41 * heightMul * s;
    const offsetX = (-4 + i * 1.9 + Math.sin(sSeed + i * 2.2) * 1.3) * twistDir * s;
    ctx.beginPath();
    ctx.moveTo(x + offsetX, startY);
    ctx.quadraticCurveTo(
      x + (offsetX - 2.8 * twistDir * s),
      startY - 6 * s,
      x + (offsetX + 1.6 * twistDir * s),
      startY - 12 * s,
    );
    ctx.stroke();
  }

  ctx.strokeStyle = palette.trunkLight;
  ctx.lineWidth = 0.55 * s;
  for (let i = 0; i < 3; i++) {
    const frac = 0.22 + i * 0.23;
    const ridgeY = y - frac * 39 * heightMul * s;
    ctx.beginPath();
    ctx.moveTo(x - 1.5 * s, ridgeY);
    ctx.quadraticCurveTo(
      x + (2 + i) * twistDir * s,
      ridgeY - 3 * s,
      x + 4.5 * twistDir * s,
      ridgeY - 7 * s,
    );
    ctx.stroke();
  }
}

function drawSwampCanopyDetail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  widthMul: number,
  heightMul: number,
  sSeed: number,
  palette: typeof SWAMP_TREE_PALETTES[number],
): void {
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  traceOrganicEllipse(
    ctx,
    x,
    y - 38 * heightMul * s,
    22 * widthMul * s,
    8 * heightMul * s,
    sSeed * 0.37,
    0.09,
  );
  ctx.fill();

  ctx.globalAlpha = 0.28;
  for (let h = 0; h < 5; h++) {
    const hx = x + (-10 + h * 5 + Math.sin(sSeed + h * 1.8) * 2) * widthMul * s;
    const hy = y + (-50 + Math.cos(sSeed + h * 2.3) * 5) * heightMul * s;
    const grad = ctx.createRadialGradient(hx, hy, 0, hx, hy, 8 * s);
    grad.addColorStop(0, palette.foliage[3]);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hx, hy, 8 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.46;
  for (let li = 0; li < 14; li++) {
    const ang = (li / 14) * Math.PI * 2 + sSeed * 0.03;
    const dist = (6 + Math.sin(sSeed + li * 2.4) * 8) * widthMul * s;
    const lx = x + Math.cos(ang) * dist;
    const ly = y + (-44 + Math.sin(ang) * 7) * heightMul * s;
    ctx.fillStyle = palette.foliage[(li + 1) % palette.foliage.length];
    drawLeafMark(ctx, lx, ly, 1.4 * s, ang * 0.7 + sSeed * 0.01);
  }
  ctx.globalAlpha = 1;

  for (let tu = 0; tu < 4; tu++) {
    const tx = x + (-12 + tu * 8 + Math.sin(sSeed + tu * 2.1) * 2) * widthMul * s;
    const ty = y + (-48 - Math.cos(sSeed + tu * 1.7) * 4) * heightMul * s;
    const highlight = ctx.createRadialGradient(tx - 2 * s, ty - 2 * s, 0, tx, ty, 9 * s);
    highlight.addColorStop(0, "rgba(170,210,150,0.20)");
    highlight.addColorStop(0.55, "rgba(110,150,95,0.10)");
    highlight.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(tx, ty, 9 * s, 0, Math.PI * 2);
    ctx.fill();
  }
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

  // Moss/lichen patches on the shadow (left) side of the trunk
  const mossCount = 2 + (Math.abs(tSeed * 5) % 2);
  for (let mi = 0; mi < mossCount; mi++) {
    const mossFrac = 0.25 + mi * 0.22;
    const mossLeanAtY = lean * mossFrac;
    const mossX = x - (trunkW - 1) * s + mossLeanAtY * s;
    const mossY = y + 3 * s - mossFrac * (trunkH + 5) * s;
    ctx.fillStyle = "rgba(80,120,55,0.35)";
    traceOrganicEllipse(
      ctx,
      mossX,
      mossY,
      2.5 * s,
      1.5 * s,
      tSeed + mi * 17,
      0.2,
      0.4,
    );
    ctx.fill();
    ctx.fillStyle = "rgba(100,145,65,0.25)";
    traceOrganicEllipse(
      ctx,
      mossX + 0.3 * s,
      mossY - 0.3 * s,
      1.6 * s,
      1 * s,
      tSeed + mi * 23,
      0.18,
      0.3,
    );
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

  // Ambient occlusion — canopy shadow cast onto the trunk
  const aoGrad = ctx.createRadialGradient(
    canopyCX, y + (baseY + 1) * s, 0,
    canopyCX, y + (baseY + 1) * s, 12 * cW * s,
  );
  aoGrad.addColorStop(0, "rgba(0,20,0,0.28)");
  aoGrad.addColorStop(0.5, "rgba(0,15,0,0.12)");
  aoGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aoGrad;
  ctx.beginPath();
  ctx.arc(canopyCX, y + (baseY + 1) * s, 12 * cW * s, 0, Math.PI * 2);
  ctx.fill();

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

  // Directional light gradient — warm top-left, cool bottom-right
  const dirLight = ctx.createRadialGradient(
    canopyCX - 8 * cW * s,
    y + (baseY - 18 * cH) * s,
    0,
    canopyCX + 4 * cW * s,
    y + (baseY - 4 * cH) * s,
    28 * cW * s,
  );
  dirLight.addColorStop(0, "rgba(200,240,120,0.14)");
  dirLight.addColorStop(0.35, "rgba(160,220,80,0.06)");
  dirLight.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = dirLight;
  traceOrganicEllipse(
    ctx,
    canopyCX,
    y + (baseY - 8 * cH) * s,
    foliageLayers[0].rx * s,
    foliageLayers[0].ry * 1.3 * s,
    tSeed * 0.71,
    0.09,
  );
  ctx.fill();

  // Cool shadow on the canopy underside
  const coolShadow = ctx.createLinearGradient(
    canopyCX,
    y + (baseY + 2) * s,
    canopyCX,
    y + (baseY - 6 * cH) * s,
  );
  coolShadow.addColorStop(0, "rgba(15,40,60,0.16)");
  coolShadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = coolShadow;
  traceOrganicEllipse(
    ctx,
    canopyCX,
    y + (baseY - 1) * s,
    foliageLayers[0].rx * 0.9 * s,
    foliageLayers[0].ry * 0.5 * s,
    tSeed * 1.23,
    0.08,
  );
  ctx.fill();

  // Dappled sunlight spots — distinct bright patches
  const dappleCount = 5 + (Math.abs(tSeed * 11) % 3);
  for (let di = 0; di < dappleCount; di++) {
    const dAng = (di / dappleCount) * Math.PI * 2 + tSeed * 0.09;
    const dDist = 4 + Math.sin(tSeed + di * 2.3) * 8;
    const dx = canopyCX + Math.cos(dAng) * dDist * cW * s;
    const dy = y + (baseY - 10 * cH + Math.sin(dAng) * 6 * cH) * s;
    const dr = (2.2 + Math.sin(tSeed + di * 4.1) * 1.0) * s;
    const dappleGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dr);
    dappleGrad.addColorStop(0, "rgba(220,255,160,0.22)");
    dappleGrad.addColorStop(0.6, "rgba(180,230,100,0.08)");
    dappleGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = dappleGrad;
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Canopy rim highlight — bright edge on the sun-facing side (upper-left)
  ctx.strokeStyle = "rgba(140,230,80,0.2)";
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.arc(
    canopyCX,
    y + (baseY - 6 * cH) * s,
    foliageLayers[1].rx * 0.88 * s,
    Math.PI * 0.85,
    Math.PI * 1.6,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(180,255,120,0.12)";
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.arc(
    canopyCX,
    y + (baseY - 10 * cH) * s,
    foliageLayers[2].rx * 0.82 * s,
    Math.PI * 0.9,
    Math.PI * 1.55,
  );
  ctx.stroke();

  // Small grass tufts at the base for grounding
  const grassColors = [tv.foliage[1], tv.foliage[2], tv.leafAccent];
  const grassCount = 4 + (Math.abs(tSeed * 3) % 3);
  for (let gi = 0; gi < grassCount; gi++) {
    const gx = x + (-8 + gi * (16 / grassCount) + Math.sin(tSeed + gi * 3.7) * 3) * s;
    const gy = y + (4 + Math.sin(tSeed + gi * 2.1) * 1.5) * s;
    ctx.fillStyle = grassColors[gi % grassColors.length];
    ctx.globalAlpha = 0.55;
    for (let bl = 0; bl < 3; bl++) {
      const bladeAng = -Math.PI / 2 + (bl - 1) * 0.3 + Math.sin(tSeed + gi * 4 + bl) * 0.2;
      const bladeH = (3.5 + Math.sin(tSeed + gi * 2 + bl * 3) * 1.5) * s;
      ctx.beginPath();
      ctx.moveTo(gx + bl * 0.8 * s, gy);
      ctx.quadraticCurveTo(
        gx + bl * 0.8 * s + Math.cos(bladeAng) * bladeH * 0.5,
        gy + Math.sin(bladeAng) * bladeH * 0.5,
        gx + bl * 0.8 * s + Math.cos(bladeAng) * bladeH,
        gy + Math.sin(bladeAng) * bladeH,
      );
      ctx.lineWidth = 0.6 * s;
      ctx.strokeStyle = grassColors[(gi + bl) % grassColors.length];
      ctx.stroke();
    }
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

export function drawPine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
): void {
  const pp = PINE_PALETTES[variant % PINE_PALETTES.length];
  const pSeed = decorX * 67 + decorY * 43;

  const heightMul = 1.0 + Math.sin(pSeed * 0.11) * 0.15;
  const widthMul = 1.0 + Math.cos(pSeed * 0.13) * 0.1;
  const lean = Math.sin(pSeed * 0.19) * 1.5;

  drawDirectionalShadow(ctx, x, y + 5 * s, s, 18 * widthMul * s, 10 * s, 50 * heightMul * s, 0.28);

  // Snow mound at base
  ctx.fillStyle = pp.snowBlue;
  traceOrganicEllipse(ctx, x, y + 5 * s, 12 * s, 5 * s, pSeed, 0.08);
  ctx.fill();
  ctx.fillStyle = pp.snowWhite;
  traceOrganicEllipse(ctx, x - 2 * s, y + 3 * s, 8 * s, 3 * s, pSeed * 1.3, 0.1, -0.2);
  ctx.fill();

  // Trunk
  const trunkTop = y - 10 * heightMul * s;
  const topX = x + lean * s;
  ctx.fillStyle = pp.trunkDark;
  ctx.beginPath();
  ctx.moveTo(x - 5 * s, y + 3 * s);
  ctx.lineTo(topX - 4 * s, trunkTop);
  ctx.lineTo(topX, trunkTop - 2 * s);
  ctx.lineTo(x, y + 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pp.trunk;
  ctx.beginPath();
  ctx.moveTo(x + 5 * s, y + 3 * s);
  ctx.lineTo(topX + 4 * s, trunkTop);
  ctx.lineTo(topX, trunkTop - 2 * s);
  ctx.lineTo(x, y + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Pine layers with organic edges
  const layerCount = 4 + (Math.abs(pSeed) % 2);
  for (let idx = 0; idx < layerCount; idx++) {
    const frac = idx / (layerCount - 1);
    const layerY = y + (-8 - frac * 46 * heightMul) * s;
    const layerW = (26 - frac * 16) * widthMul * s;
    const layerH = (20 - frac * 6) * heightMul * s;
    const layerLean = lean * (0.3 + frac * 0.7) * s;

    const sizeVar = 1 + Math.sin(pSeed + idx * 3.7) * 0.08;
    const lw = layerW * sizeVar;
    const lh = layerH * sizeVar;

    // Back shadow
    ctx.fillStyle = pp.dark;
    ctx.beginPath();
    ctx.moveTo(x + layerLean - lw * 0.9, layerY + 2 * s);
    ctx.lineTo(x + layerLean, layerY - lh + 2 * s);
    ctx.lineTo(x + layerLean + lw * 0.9, layerY + 2 * s);
    ctx.closePath();
    ctx.fill();

    // Left face (darker) with organic edge
    ctx.fillStyle = pp.greens[0];
    ctx.beginPath();
    ctx.moveTo(x + layerLean, layerY + 5 * s);
    ctx.lineTo(x + layerLean, layerY - lh);
    const leftPts = 6;
    for (let i = 0; i <= leftPts; i++) {
      const t = i / leftPts;
      const edgeX = x + layerLean - lw * (1 - t);
      const edgeY = layerY + 5 * s * (1 - t) + (-lh) * t;
      const bump = Math.sin(pSeed + idx * 5 + i * 3.1) * 2 * s;
      ctx.lineTo(edgeX + bump, edgeY);
    }
    ctx.closePath();
    ctx.fill();

    // Right face (lighter) with organic edge
    ctx.fillStyle = pp.greens[1 + (idx % 2)];
    ctx.beginPath();
    ctx.moveTo(x + layerLean, layerY + 5 * s);
    ctx.lineTo(x + layerLean, layerY - lh);
    for (let i = 0; i <= leftPts; i++) {
      const t = i / leftPts;
      const edgeX = x + layerLean + lw * (1 - t);
      const edgeY = layerY + 5 * s * (1 - t) + (-lh) * t;
      const bump = Math.sin(pSeed + idx * 7 + i * 2.7) * 2 * s;
      ctx.lineTo(edgeX + bump, edgeY);
    }
    ctx.closePath();
    ctx.fill();

    // Needle texture on faces
    ctx.strokeStyle = pp.greens[3];
    ctx.lineWidth = 0.5 * s;
    ctx.globalAlpha = 0.4;
    const needleCount = 3 + (Math.abs(pSeed + idx) % 3);
    for (let ni = 0; ni < needleCount; ni++) {
      const nFrac = (ni + 0.5) / needleCount;
      const nx = x + layerLean + (-lw * 0.6 + lw * 1.2 * nFrac) * (1 - nFrac * 0.3);
      const ny = layerY + 4 * s * (1 - nFrac) + (-lh * 0.5) * nFrac;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx + Math.sin(pSeed + ni * 2.3) * 3 * s, ny - 3 * s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Snow cap with organic shape
    ctx.fillStyle = pp.snowWhite;
    ctx.beginPath();
    const snowPts = 8;
    ctx.moveTo(x + layerLean - lw * 0.7, layerY - lh * 0.2);
    for (let i = 0; i <= snowPts; i++) {
      const t = i / snowPts;
      const sx = x + layerLean + (-lw * 0.7 + lw * 1.2 * t);
      const sBaseY = layerY - lh * (0.2 + t * 0.7);
      const snowBump = Math.sin(pSeed + idx * 9 + i * 2.1) * 1.5 * s;
      const snowHeight = (2 + Math.sin(pSeed + idx * 3 + i * 1.7) * 1.5) * s;
      ctx.lineTo(sx, sBaseY - snowHeight + snowBump);
    }
    ctx.lineTo(x + layerLean + lw * 0.5, layerY - lh * 0.3);
    ctx.quadraticCurveTo(
      x + layerLean + lw * 0.2, layerY - lh * 0.15,
      x + layerLean - lw * 0.2, layerY - lh * 0.1,
    );
    ctx.closePath();
    ctx.fill();

    // Snow blue tint on shadow side
    ctx.fillStyle = pp.snowBlue;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(x + layerLean - lw * 0.6, layerY - lh * 0.15);
    ctx.quadraticCurveTo(
      x + layerLean - lw * 0.3, layerY - lh * 0.4,
      x + layerLean, layerY - lh * 0.8,
    );
    ctx.lineTo(x + layerLean - lw * 0.1, layerY - lh * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Snow clumps hanging from branch tips
    if (idx < layerCount - 1) {
      ctx.fillStyle = pp.snowWhite;
      const clumpX1 = x + layerLean - lw * (0.5 + Math.sin(pSeed + idx * 4) * 0.1);
      const clumpX2 = x + layerLean + lw * (0.4 + Math.cos(pSeed + idx * 5) * 0.1);
      traceOrganicEllipse(ctx, clumpX1, layerY + 2 * s, 4 * s, 2.5 * s, pSeed + idx * 13, 0.12, 0.3);
      ctx.fill();
      traceOrganicEllipse(ctx, clumpX2, layerY + 1 * s, 3.5 * s, 2 * s, pSeed + idx * 17, 0.12, -0.2);
      ctx.fill();
    }
  }

  // Top snow cap
  ctx.fillStyle = pp.snowWhite;
  const topY = y + (-8 - 46 * heightMul) * s;
  traceOrganicEllipse(ctx, x + lean * s, topY - 4 * s, 3 * s, 2 * s, pSeed * 2.1, 0.15);
  ctx.fill();

  // Sparkle effects (seed-positioned)
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  const sparkleCount = 3 + (Math.abs(pSeed) % 3);
  for (let si = 0; si < sparkleCount; si++) {
    const spX = x + Math.sin(pSeed + si * 4.3) * 12 * widthMul * s;
    const spY = y + (-15 - si * 12 * heightMul + Math.cos(pSeed + si * 2.7) * 5) * s;
    ctx.beginPath();
    ctx.arc(spX, spY, 0.9 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawCharredTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
  decorTime: number,
): void {
  const cp = CHARRED_TREE_PALETTES[variant % CHARRED_TREE_PALETTES.length];
  const cSeed = decorX * 71 + decorY * 47;

  const trunkH = 35 + (Math.abs(cSeed * 7) % 8);
  const trunkW = 6.5 + (Math.abs(cSeed * 13) % 2);
  const lean = Math.sin(cSeed * 0.19) * 2;
  const brokenTopH = trunkH + 3 + (Math.abs(cSeed) % 5);

  drawDirectionalShadow(ctx, x, y + 4 * s, s, 16 * s, 8 * s, 40 * s, 0.35);

  // Ash pile at base
  ctx.fillStyle = cp.mid;
  drawOrganicBlobAt(ctx, x, y + 4 * s, 10 * s, 4 * s, cSeed * 1.7, 0.1);
  ctx.fill();
  ctx.fillStyle = cp.light;
  traceOrganicEllipse(ctx, x - 2 * s, y + 3 * s, 6 * s, 2.5 * s, cSeed * 2.1, 0.12, -0.2);
  ctx.fill();

  const topX = x + lean * s;

  // Burnt trunk left face
  ctx.fillStyle = cp.black;
  ctx.beginPath();
  ctx.moveTo(x - trunkW * s, y + 3 * s);
  ctx.lineTo(topX - (trunkW - 1) * s, y - (trunkH - 6) * s);
  ctx.lineTo(topX - (trunkW - 3) * s, y - trunkH * s);
  ctx.lineTo(topX, y - (trunkH - 2) * s);
  ctx.lineTo(x, y + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Burnt trunk right face
  const tGrad = ctx.createLinearGradient(x, y - 20 * s, x + 8 * s, y - 10 * s);
  tGrad.addColorStop(0, cp.dark);
  tGrad.addColorStop(0.5, cp.mid);
  tGrad.addColorStop(1, cp.dark);
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(x + trunkW * s, y + 3 * s);
  ctx.lineTo(topX + (trunkW - 2) * s, y - (trunkH - 5) * s);
  ctx.lineTo(topX + (trunkW - 4) * s, y - (trunkH - 1) * s);
  ctx.lineTo(topX, y - (trunkH - 2) * s);
  ctx.lineTo(x, y + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Jagged broken top — procedural
  ctx.fillStyle = cp.dark;
  ctx.beginPath();
  ctx.moveTo(topX - (trunkW - 3) * s, y - trunkH * s);
  const jagCount = 3 + (Math.abs(cSeed) % 2);
  for (let ji = 0; ji < jagCount; ji++) {
    const jFrac = ji / jagCount;
    const jx = topX + (-trunkW + 3 + (trunkW * 2 - 4) * jFrac) * s;
    const jy = y - (brokenTopH + Math.sin(cSeed + ji * 3.7) * 3) * s;
    ctx.lineTo(jx, jy);
    if (ji < jagCount - 1) {
      const dip = y - (trunkH - 1 + Math.cos(cSeed + ji * 2.1) * 2) * s;
      ctx.lineTo(jx + 2 * s, dip);
    }
  }
  ctx.lineTo(topX + (trunkW - 4) * s, y - (trunkH - 1) * s);
  ctx.closePath();
  ctx.fill();

  // Broken branches — procedural angles and lengths
  ctx.strokeStyle = cp.dark;
  ctx.lineCap = "round";
  const branches = [
    { startFrac: 0.55, angle: -2.5, len: 16, width: 4, sub: true },
    { startFrac: 0.4, angle: 0.3, len: 13, width: 3, sub: false },
    { startFrac: 0.75, angle: -2.8, len: 10, width: 2.5, sub: false },
  ];
  branches.forEach((br, bi) => {
    const bAngle = br.angle + Math.sin(cSeed + bi * 5.1) * 0.3;
    const bLen = (br.len + Math.sin(cSeed + bi * 3.3) * 3) * s;
    const bStartX = topX + (bi % 2 === 0 ? -2 : 2) * s;
    const bStartY = y - trunkH * br.startFrac * s;
    ctx.lineWidth = br.width * s;
    ctx.beginPath();
    ctx.moveTo(bStartX, bStartY);
    ctx.lineTo(bStartX + Math.cos(bAngle) * bLen, bStartY + Math.sin(bAngle) * bLen);
    ctx.stroke();
    if (br.sub) {
      const midX = bStartX + Math.cos(bAngle) * bLen * 0.6;
      const midY = bStartY + Math.sin(bAngle) * bLen * 0.6;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX + Math.cos(bAngle - 0.5) * 6 * s, midY + Math.sin(bAngle - 0.5) * 6 * s);
      ctx.stroke();
    }
  });

  // Crack lines on trunk
  ctx.strokeStyle = cp.mid;
  ctx.lineWidth = 1 * s;
  const crackCount = 2 + (Math.abs(cSeed) % 2);
  for (let ci = 0; ci < crackCount; ci++) {
    const cx = x + (ci === 0 ? -3 : 2 + ci) * s;
    const startY = y - 5 * s - ci * 3 * s;
    const endY = y - trunkH * (0.4 + ci * 0.2) * s;
    ctx.beginPath();
    ctx.moveTo(cx, startY);
    ctx.quadraticCurveTo(
      cx + Math.sin(cSeed + ci * 3) * 2 * s,
      (startY + endY) / 2,
      cx + Math.sin(cSeed + ci * 5) * 3 * s,
      endY,
    );
    ctx.stroke();
  }

  // Glowing embers — procedural positions
  const emberCount = 5 + (Math.abs(cSeed) % 3);
  for (let ei = 0; ei < emberCount; ei++) {
    const eAngle = (ei / emberCount) * Math.PI * 2 + cSeed * 0.1;
    const eDist = 5 + Math.sin(cSeed + ei * 2.7) * 10;
    const ex = topX + Math.cos(eAngle) * eDist * s;
    const ey = y - trunkH * (0.3 + (ei / emberCount) * 0.5) * s;
    const er = (1.5 + Math.sin(cSeed + ei * 3.1) * 0.8) * s;
    const pulse = 0.4 + Math.sin(decorTime * (2.5 + ei * 0.3) + cSeed + ei) * 0.4;

    const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 3);
    glow.addColorStop(0, `rgba(255,150,50,${(pulse * 0.6).toFixed(3)})`);
    glow.addColorStop(0.5, `rgba(255,80,0,${(pulse * 0.3).toFixed(3)})`);
    glow.addColorStop(1, "rgba(255,50,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex, ey, er * 3, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(ex, ey, 0, ex, ey, er);
    core.addColorStop(0, pulse > 0.6 ? cp.emberYellow : cp.emberOrange);
    core.addColorStop(0.5, cp.emberOrange);
    core.addColorStop(1, cp.emberRed);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoke wisps
  ctx.fillStyle = "rgba(60,60,60,0.2)";
  for (let sm = 0; sm < 4; sm++) {
    const smokeTime = (decorTime * 15 + sm * 12) % 35;
    const smokeY = y - brokenTopH * s - smokeTime * s;
    const smokeX = x + lean * s + Math.sin(decorTime * 1.5 + sm + cSeed * 0.01) * 5 * s;
    const smokeSize = (2 + smokeTime * 0.15) * s;
    const smokeAlpha = Math.max(0, 0.25 - smokeTime * 0.007);
    ctx.fillStyle = `rgba(50,50,50,${smokeAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating ash particles
  ctx.fillStyle = "rgba(80,80,80,0.4)";
  for (let ash = 0; ash < 5; ash++) {
    const ashTime = (decorTime * 8 + ash * 15) % 50;
    const ashY = y + 5 * s - ashTime * s;
    const ashX = x + Math.sin(decorTime * 0.8 + ash * 2 + cSeed * 0.01) * 15 * s;
    ctx.beginPath();
    ctx.arc(ashX, ashY, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawSwampTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  variant: number,
  decorX: number,
  decorY: number,
  decorTime: number,
): void {
  const sp = SWAMP_TREE_PALETTES[variant % SWAMP_TREE_PALETTES.length];
  const sSeed = decorX * 79 + decorY * 53;

  const heightMul = 1.0 + Math.sin(sSeed * 0.11) * 0.12;
  const widthMul = 1.0 + Math.cos(sSeed * 0.13) * 0.08;
  const twistDir = Math.sin(sSeed * 0.17) > 0 ? 1 : -1;
  const canopyY = y - 44 * heightMul * s;

  drawDirectionalShadow(ctx, x, y + 5 * s, s, 20 * widthMul * s, 10 * s, 45 * heightMul * s, 0.35, "10,20,10");

  drawSwampWaterBase(ctx, x, y, s, widthMul, sSeed, decorTime, sp);

  // Exposed roots in water — procedural
  ctx.strokeStyle = sp.trunkDark;
  ctx.lineWidth = 3 * s;
  const rootCount = 3 + (Math.abs(sSeed) % 3);
  for (let r = 0; r < rootCount; r++) {
    const rootAngle = -0.8 + r * (1.6 / rootCount) + Math.sin(sSeed + r * 3.7) * 0.2;
    const rootLen = (12 + r * 3 + Math.sin(sSeed + r * 2.3) * 3) * widthMul;
    ctx.beginPath();
    ctx.moveTo(x + (r - rootCount / 2) * 4 * s, y + 4 * s);
    ctx.quadraticCurveTo(
      x + Math.cos(rootAngle) * rootLen * 0.5 * s,
      y + 6 * s,
      x + Math.cos(rootAngle) * rootLen * s,
      y + 8 * s,
    );
    ctx.stroke();

    ctx.strokeStyle = sp.trunkLight;
    ctx.lineWidth = 1.1 * s;
    ctx.beginPath();
    ctx.moveTo(x + (r - rootCount / 2) * 3.5 * s, y + 4.5 * s);
    ctx.quadraticCurveTo(
      x + Math.cos(rootAngle) * rootLen * 0.45 * s,
      y + 5.5 * s,
      x + Math.cos(rootAngle) * rootLen * 0.82 * s,
      y + 7.2 * s,
    );
    ctx.stroke();

    ctx.strokeStyle = sp.trunkDark;
    ctx.lineWidth = 3 * s;
    if (r % 2 === 0) {
      const rootTipX = x + Math.cos(rootAngle) * rootLen * s;
      const rootTipY = y + 8 * s;
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.moveTo(rootTipX, rootTipY);
      ctx.lineTo(rootTipX + Math.cos(rootAngle + 0.55 * twistDir) * 5 * s, rootTipY + 1.5 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rootTipX - 1.5 * s, rootTipY - 0.4 * s);
      ctx.lineTo(rootTipX + Math.cos(rootAngle - 0.45 * twistDir) * 4 * s, rootTipY + 2.3 * s);
      ctx.stroke();
      ctx.lineWidth = 3 * s;
    }
  }

  ctx.fillStyle = "rgba(10,18,12,0.18)";
  traceOrganicEllipse(
    ctx,
    x,
    y + 3.8 * s,
    12 * widthMul * s,
    3.8 * s,
    sSeed * 1.4,
    0.08,
  );
  ctx.fill();

  // Gnarled trunk left side
  const twistAmt = 4 * twistDir;
  ctx.fillStyle = sp.trunkDark;
  ctx.beginPath();
  ctx.moveTo(x - 10 * widthMul * s, y + 4 * s);
  ctx.bezierCurveTo(
    x - (14 + twistAmt) * widthMul * s, y - 10 * heightMul * s,
    x - (8 - twistAmt) * widthMul * s, y - 25 * heightMul * s,
    x - 6 * widthMul * s, y - 38 * heightMul * s,
  );
  ctx.lineTo(x - 2 * s, y - 40 * heightMul * s);
  ctx.bezierCurveTo(
    x - 4 * s, y - 20 * heightMul * s,
    x - 6 * s, y - 5 * heightMul * s,
    x - 2 * s, y + 2 * s,
  );
  ctx.closePath();
  ctx.fill();

  // Gnarled trunk right side
  const tGrad = ctx.createLinearGradient(x, y, x + 12 * widthMul * s, y - 20 * heightMul * s);
  tGrad.addColorStop(0, sp.trunkMid);
  tGrad.addColorStop(0.5, sp.trunkLight);
  tGrad.addColorStop(1, sp.trunkMid);
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(x + 10 * widthMul * s, y + 4 * s);
  ctx.bezierCurveTo(
    x + (12 - twistAmt) * widthMul * s, y - 8 * heightMul * s,
    x + (6 + twistAmt) * widthMul * s, y - 22 * heightMul * s,
    x + 4 * widthMul * s, y - 38 * heightMul * s,
  );
  ctx.lineTo(x - 2 * s, y - 40 * heightMul * s);
  ctx.bezierCurveTo(
    x + 2 * s, y - 18 * heightMul * s,
    x + 4 * s, y - 5 * heightMul * s,
    x + 2 * s, y + 2 * s,
  );
  ctx.closePath();
  ctx.fill();

  // Bark texture knots — procedural
  ctx.fillStyle = sp.trunkDark;
  const knotCount = 2 + (Math.abs(sSeed) % 2);
  for (let ki = 0; ki < knotCount; ki++) {
    const kFrac = 0.3 + ki * 0.25;
    const kx = x + (twistDir * (-3 + ki * 5) + Math.sin(sSeed + ki * 3) * 2) * s;
    const ky = y - kFrac * 40 * heightMul * s;
    ctx.beginPath();
    ctx.ellipse(kx, ky, (2.5 + Math.sin(sSeed + ki) * 0.5) * s, (3.5 + Math.cos(sSeed + ki) * 0.5) * s, 0.3 * twistDir, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSwampTrunkRidges(ctx, x, y, s, heightMul, twistDir, sSeed, sp);

  // Dead branches — procedural
  ctx.strokeStyle = sp.trunkMid;
  const branchCount = 2 + (Math.abs(sSeed) % 2);
  for (let bi = 0; bi < branchCount; bi++) {
    const bFrac = 0.6 + bi * 0.15;
    const bSide = bi % 2 === 0 ? 1 : -1;
    const bAngle = bSide * (0.2 + Math.sin(sSeed + bi * 4.1) * 0.3);
    const bLen = (14 + Math.sin(sSeed + bi * 2.7) * 4) * widthMul;
    const bx = x + bSide * 3 * s;
    const by = y - bFrac * 40 * heightMul * s;
    ctx.lineWidth = (2.5 - bi * 0.3) * s;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(bAngle) * bLen * s, by + Math.sin(bAngle) * bLen * s - 4 * s);
    ctx.stroke();

    const tipX = bx + Math.cos(bAngle) * bLen * s;
    const tipY = by + Math.sin(bAngle) * bLen * s - 4 * s;
    ctx.lineWidth = 1.1 * s;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(
      tipX + Math.cos(bAngle + 0.55 * bSide) * 5 * s,
      tipY + Math.sin(bAngle + 0.55 * bSide) * 5 * s,
    );
    ctx.stroke();

    if (bi === 0) {
      ctx.strokeStyle = sp.mossDark;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(tipX - 1.5 * s, tipY + 1.5 * s);
      ctx.bezierCurveTo(
        tipX - 1.8 * s,
        tipY + 6 * s,
        tipX + 1.5 * s,
        tipY + 9 * s,
        tipX + 0.5 * s,
        tipY + 13 * s,
      );
      ctx.stroke();
      ctx.strokeStyle = sp.trunkMid;
    }
  }

  // Dark sparse foliage canopy — organic blobs
  const canopyCount = 3 + (Math.abs(sSeed) % 2);
  for (let ci = 0; ci < canopyCount; ci++) {
    const cAngle = (ci / canopyCount) * Math.PI * 1.5 - Math.PI * 0.25 + Math.sin(sSeed + ci * 3) * 0.3;
    const cDist = 6 + Math.sin(sSeed + ci * 2.7) * 4;
    const ccx = x + Math.cos(cAngle) * cDist * widthMul * s;
    const ccy = y + (-44 + Math.sin(cAngle) * 6) * heightMul * s;
    const crx = (13 - ci * 1.5 + Math.sin(sSeed + ci * 3.1) * 2) * widthMul;
    const cry = (8 - ci + Math.cos(sSeed + ci * 2.3) * 1.5) * heightMul;

    const cGrad = ctx.createRadialGradient(
      ccx - 3 * s, ccy - 3 * s, 0,
      ccx, ccy, crx * s,
    );
    cGrad.addColorStop(0, sp.foliage[2]);
    cGrad.addColorStop(0.5, sp.foliage[ci % 4]);
    cGrad.addColorStop(1, sp.foliage[0]);
    ctx.fillStyle = cGrad;
    traceOrganicEllipse(ctx, ccx, ccy, crx * s, cry * s, sSeed + ci * 11, 0.14);
    ctx.fill();
  }

  drawSwampCanopyDetail(ctx, x, y, s, widthMul, heightMul, sSeed, sp);

  // Leaf texture on canopy
  ctx.globalAlpha = 0.4;
  for (let li = 0; li < 8; li++) {
    const lAng = (li / 8) * Math.PI * 2 + sSeed * 0.05;
    const lDist = 5 + Math.sin(sSeed + li * 2.1) * 6;
    const lx = x + Math.cos(lAng) * lDist * widthMul * s;
    const ly = y + (-44 + Math.sin(lAng) * 5) * heightMul * s;
    ctx.fillStyle = sp.foliage[li % 4];
    drawLeafMark(ctx, lx, ly, 1.2 * s, lAng + sSeed * 0.01);
  }
  ctx.globalAlpha = 1;

  // Hanging Spanish moss strands — seed-positioned
  const mossCount = 6 + (Math.abs(sSeed) % 4);
  for (let m = 0; m < mossCount; m++) {
    const mossX = x + (-16 + m * (32 / mossCount) + Math.sin(sSeed + m * 2.3) * 3) * widthMul * s;
    const mossStartY = y + (-35 - Math.sin(sSeed + m * 1.7) * 10) * heightMul * s;
    const mossLen = (15 + Math.sin(sSeed + m * 1.5) * 8) * heightMul;
    const sway = Math.sin(decorTime * 0.8 + m * 0.7 + sSeed * 0.01) * 4 * s;

    const mGrad = ctx.createLinearGradient(mossX, mossStartY, mossX + sway, mossStartY + mossLen * s);
    mGrad.addColorStop(0, sp.mossDark);
    mGrad.addColorStop(0.5, sp.mossLight);
    mGrad.addColorStop(1, sp.mossDark);

    ctx.strokeStyle = mGrad;
    ctx.lineWidth = (1.5 + Math.sin(sSeed + m) * 0.5) * s;
    ctx.beginPath();
    ctx.moveTo(mossX, mossStartY);
    ctx.bezierCurveTo(
      mossX + sway * 0.3, mossStartY + mossLen * 0.3 * s,
      mossX + sway * 0.7, mossStartY + mossLen * 0.6 * s,
      mossX + sway, mossStartY + mossLen * s,
    );
    ctx.stroke();

    if (m % 2 === 0) {
      ctx.strokeStyle = sp.mossDark;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(mossX + sway * 0.5, mossStartY + mossLen * 0.5 * s);
      ctx.lineTo(mossX + sway * 0.5 + 4 * s, mossStartY + mossLen * 0.7 * s);
      ctx.stroke();
    }

    if (m % 3 === 0) {
      ctx.fillStyle = "rgba(90,120,88,0.24)";
      drawOrganicBlobAt(
        ctx,
        mossX + sway * 0.8,
        mossStartY + mossLen * 0.72 * s,
        2.8 * s,
        1.8 * s,
        sSeed * 2.3 + m * 7,
        0.15,
      );
      ctx.fill();
    }
  }

  // Fireflies/wisps
  const flyAlpha = 0.4 + Math.sin(decorTime * 2 + sSeed * 0.01) * 0.3;
  const flyCount = 2 + (Math.abs(sSeed) % 3);
  for (let f = 0; f < flyCount; f++) {
    const flyX = x + Math.sin(decorTime + f * 2 + sSeed * 0.01) * 15 * widthMul * s;
    const flyY = y - 25 * heightMul * s + Math.cos(decorTime * 1.3 + f + sSeed * 0.01) * 10 * s;
    const glow = ctx.createRadialGradient(flyX, flyY, 0, flyX, flyY, 5 * s);
    glow.addColorStop(0, `rgba(${sp.fireflyColor},${(flyAlpha * 0.5).toFixed(3)})`);
    glow.addColorStop(1, `rgba(${sp.fireflyColor},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(flyX, flyY, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${sp.fireflyColor},${flyAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(flyX, flyY, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(190,220,170,0.10)";
  traceOrganicEllipse(
    ctx,
    x,
    canopyY - 1.5 * s,
    10 * widthMul * s,
    3.8 * s,
    sSeed * 2.6,
    0.08,
  );
  ctx.fill();
}
