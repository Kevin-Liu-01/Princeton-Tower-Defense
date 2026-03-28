import { ISO_TAN, ISO_Y_RATIO } from "../../constants";

export interface VaultGeometry {
  bodyY: number;
  roofPeakY: number;
  parH: number;
  rcy: number;
  lWallPt: (fx: number, fy: number) => { x: number; y: number };
  rWallPt: (fx: number, fy: number) => { x: number; y: number };
}

export interface VaultPalette {
  baseLight: string;
  baseDark: string;
  wallLeft: string;
  wallRight: string;
  wallTop: string;
  frame: string;
  trim: string;
  dark: string;
  accent: string;
  glow: string;
}

export function getVaultPalette(isFlashing: boolean): VaultPalette {
  if (isFlashing) {
    return {
      baseLight: "#E8E8E8",
      baseDark: "#C0C0C0",
      wallLeft: "#D4A5A5",
      wallRight: "#E8BFBF",
      wallTop: "#F0D0D0",
      frame: "#CC8080",
      trim: "#B06060",
      dark: "#6B3030",
      accent: "#FFFFFF",
      glow: "#FF6B6B",
    };
  }
  return {
    baseLight: "#787068",
    baseDark: "#4A4440",
    wallLeft: "#7E6B52",
    wallRight: "#9C8464",
    wallTop: "#B09A7A",
    frame: "#6E5540",
    trim: "#90704E",
    dark: "#2D2118",
    accent: "#C8A860",
    glow: "#4CB898",
  };
}

// ---------------------------------------------------------------------------
// Geometry primitives
// ---------------------------------------------------------------------------

function isoBox(
  ctx: CanvasRenderingContext2D,
  baseY: number,
  w: number,
  h: number,
  left: string,
  right: string,
  top: string,
): void {
  const t = ISO_TAN;
  ctx.fillStyle = left;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(-w, baseY - w * t);
  ctx.lineTo(-w, baseY - w * t - h);
  ctx.lineTo(0, baseY - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(w, baseY - w * t);
  ctx.lineTo(w, baseY - w * t - h);
  ctx.lineTo(0, baseY - h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(0, baseY - h);
  ctx.lineTo(-w, baseY - w * t - h);
  ctx.lineTo(0, baseY - w * t * 2 - h);
  ctx.lineTo(w, baseY - w * t - h);
  ctx.closePath();
  ctx.fill();
}

function isoBoxAt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  hw: number,
  height: number,
  left: string,
  right: string,
  top: string,
): void {
  const hd = hw * ISO_Y_RATIO;
  ctx.fillStyle = left;
  ctx.beginPath();
  ctx.moveTo(cx - hw, baseY);
  ctx.lineTo(cx, baseY + hd);
  ctx.lineTo(cx, baseY + hd - height);
  ctx.lineTo(cx - hw, baseY - height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = right;
  ctx.beginPath();
  ctx.moveTo(cx + hw, baseY);
  ctx.lineTo(cx, baseY + hd);
  ctx.lineTo(cx, baseY + hd - height);
  ctx.lineTo(cx + hw, baseY - height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(cx, baseY - height - hd);
  ctx.lineTo(cx - hw, baseY - height);
  ctx.lineTo(cx, baseY - height + hd);
  ctx.lineTo(cx + hw, baseY - height);
  ctx.closePath();
  ctx.fill();
}

function isoCylinder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  rx: number,
  height: number,
  bodyColor: string,
  darkColor: string,
  topColor: string,
): void {
  const ry = rx * ISO_Y_RATIO;

  const grad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  grad.addColorStop(0, darkColor);
  grad.addColorStop(0.35, bodyColor);
  grad.addColorStop(0.65, bodyColor);
  grad.addColorStop(1, darkColor);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, baseY - height);
  ctx.ellipse(cx, baseY - height, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.ellipse(cx, baseY - height, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Foundation: 3-step pyramid base
// ---------------------------------------------------------------------------

function drawVaultFoundation(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  tanAngle: number,
): number {
  const step1W = w + 7 * s2;
  const step1H = 4 * s2;
  const step2W = w + 4 * s2;
  const step2H = 3 * s2;
  const step3W = w + 1 * s2;
  const step3H = 3 * s2;

  isoBox(ctx, 0, step1W, step1H, "#353028", "#585250", "#4A4640");

  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.8 * s2;
  ctx.beginPath();
  ctx.moveTo(0, -step1H * 0.55);
  ctx.lineTo(-step1W, -step1W * tanAngle - step1H * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -step1H * 0.55);
  ctx.lineTo(step1W, -step1W * tanAngle - step1H * 0.55);
  ctx.stroke();

  const studs = [
    { x: 0, y: -step1H * 0.55 },
    { x: -step1W * 0.5, y: -step1W * 0.5 * tanAngle - step1H * 0.55 },
    { x: step1W * 0.5, y: -step1W * 0.5 * tanAngle - step1H * 0.55 },
  ];
  studs.forEach((p) => {
    ctx.fillStyle = "#2E2A24";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.arc(p.x - 0.3 * s2, p.y - 0.3 * s2, 0.6 * s2, 0, Math.PI * 2);
    ctx.fill();
  });

  isoBox(ctx, -step1H, step2W, step2H, "#3A3530", "#5E5852", "#504C46");

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 0.6 * s2;
  ctx.beginPath();
  ctx.moveTo(0, -step1H - step2H);
  ctx.lineTo(-step2W, -step2W * tanAngle - step1H - step2H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -step1H - step2H);
  ctx.lineTo(step2W, -step2W * tanAngle - step1H - step2H);
  ctx.stroke();

  isoBox(ctx, -step1H - step2H, step3W, step3H, "#403A34", "#645E56", "#56524C");

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 0.5 * s2;
  ctx.beginPath();
  ctx.moveTo(0, -step1H - step2H - step3H);
  ctx.lineTo(-step3W, -step3W * tanAngle - step1H - step2H - step3H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -step1H - step2H - step3H);
  ctx.lineTo(step3W, -step3W * tanAngle - step1H - step2H - step3H);
  ctx.stroke();

  return step1H + step2H + step3H;
}

// ---------------------------------------------------------------------------
// Main body walls with rich gradient shading
// ---------------------------------------------------------------------------

function drawVaultWalls(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
  c: VaultPalette,
): void {
  const lg = ctx.createLinearGradient(-w, bodyY - w * tanAngle, 0, bodyY);
  lg.addColorStop(0, "#3E3228");
  lg.addColorStop(0.12, "#52453A");
  lg.addColorStop(0.4, c.wallLeft);
  lg.addColorStop(0.78, "#6A5A4A");
  lg.addColorStop(1, "#4E4238");
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(0, bodyY);
  ctx.lineTo(-w, bodyY - w * tanAngle);
  ctx.lineTo(-w, bodyY - w * tanAngle - h);
  ctx.lineTo(0, bodyY - h);
  ctx.closePath();
  ctx.fill();

  const rg = ctx.createLinearGradient(0, bodyY, w, bodyY - w * tanAngle);
  rg.addColorStop(0, "#8E7E68");
  rg.addColorStop(0.12, "#9A8A72");
  rg.addColorStop(0.4, c.wallRight);
  rg.addColorStop(0.78, "#8A7A64");
  rg.addColorStop(1, "#7A6A55");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(0, bodyY);
  ctx.lineTo(w, bodyY - w * tanAngle);
  ctx.lineTo(w, bodyY - w * tanAngle - h);
  ctx.lineTo(0, bodyY - h);
  ctx.closePath();
  ctx.fill();

  const roofOffset = w * tanAngle * 2;
  const tg = ctx.createLinearGradient(0, bodyY - h - roofOffset, 0, bodyY - h);
  tg.addColorStop(0, "#A89878");
  tg.addColorStop(0.5, c.wallTop);
  tg.addColorStop(1, "#9A8A70");
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(0, bodyY - h);
  ctx.lineTo(-w, bodyY - w * tanAngle - h);
  ctx.lineTo(0, bodyY - roofOffset - h);
  ctx.lineTo(w, bodyY - w * tanAngle - h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1 * s2;
  ctx.beginPath();
  ctx.moveTo(0, bodyY - h);
  ctx.lineTo(-w, bodyY - w * tanAngle - h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, bodyY);
  ctx.lineTo(0, bodyY - h);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.moveTo(0, bodyY);
  ctx.lineTo(-w, bodyY - w * tanAngle);
  ctx.lineTo(-w, bodyY - w * tanAngle - 3 * s2);
  ctx.lineTo(0, bodyY - 3 * s2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.moveTo(0, bodyY);
  ctx.lineTo(w, bodyY - w * tanAngle);
  ctx.lineTo(w, bodyY - w * tanAngle - 3 * s2);
  ctx.lineTo(0, bodyY - 3 * s2);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Stone coursework lines clipped to walls
// ---------------------------------------------------------------------------

function drawVaultStonework(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
): void {
  const courseCount = 7;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, bodyY);
  ctx.lineTo(-w, bodyY - w * tanAngle);
  ctx.lineTo(-w, bodyY - w * tanAngle - h);
  ctx.lineTo(0, bodyY - h);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = "rgba(0,0,0,0.09)";
  ctx.lineWidth = 0.6 * s2;
  for (let row = 1; row < courseCount; row++) {
    const frac = row / courseCount;
    const ly = bodyY - h * frac;
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.lineTo(-w, ly - w * tanAngle);
    ctx.stroke();
    for (let j = 0; j < 3; j++) {
      const jfrac = (j + (row % 2 === 0 ? 0.5 : 0)) / 3;
      const jx = -w * jfrac;
      const jyTop = ly - w * tanAngle * jfrac;
      const jyBot = bodyY - h * ((row - 1) / courseCount) - w * tanAngle * jfrac;
      ctx.beginPath();
      ctx.moveTo(jx, jyTop);
      ctx.lineTo(jx, jyBot);
      ctx.stroke();
    }
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, bodyY);
  ctx.lineTo(w, bodyY - w * tanAngle);
  ctx.lineTo(w, bodyY - w * tanAngle - h);
  ctx.lineTo(0, bodyY - h);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 0.6 * s2;
  for (let row = 1; row < courseCount; row++) {
    const frac = row / courseCount;
    const ry = bodyY - h * frac;
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.lineTo(w, ry - w * tanAngle);
    ctx.stroke();
    for (let j = 0; j < 3; j++) {
      const jfrac = (j + (row % 2 === 0 ? 0.5 : 0)) / 3;
      const jx = w * jfrac;
      const jyTop = ry - w * tanAngle * jfrac;
      const jyBot = bodyY - h * ((row - 1) / courseCount) - w * tanAngle * jfrac;
      ctx.beginPath();
      ctx.moveTo(jx, jyTop);
      ctx.lineTo(jx, jyBot);
      ctx.stroke();
    }
  }
  ctx.restore();

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.moveTo(-3 * s2, bodyY - h * 0.15);
  ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
  ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
  ctx.lineTo(-3 * s2, bodyY - h + 5 * s2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 0.7 * s2;
  ctx.beginPath();
  ctx.moveTo(-3 * s2, bodyY - h + 5 * s2);
  ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.beginPath();
  ctx.moveTo(3 * s2, bodyY - h * 0.15);
  ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
  ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
  ctx.lineTo(3 * s2, bodyY - h + 5 * s2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.7 * s2;
  ctx.beginPath();
  ctx.moveTo(3 * s2, bodyY - h + 5 * s2);
  ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Corner buttresses — protruding 3D pilasters at the three visible corners
// ---------------------------------------------------------------------------

function drawVaultButtresses(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
  c: VaultPalette,
): void {
  const bw = 3.5 * s2;
  const bDepth = 2.5 * s2;

  const frontX = 0;
  const frontY = bodyY;
  ctx.fillStyle = c.frame;
  ctx.beginPath();
  ctx.moveTo(frontX - bw, frontY);
  ctx.lineTo(frontX - bw, frontY - h);
  ctx.lineTo(frontX, frontY - h);
  ctx.lineTo(frontX, frontY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.trim;
  ctx.beginPath();
  ctx.moveTo(frontX, frontY);
  ctx.lineTo(frontX, frontY - h);
  ctx.lineTo(frontX + bw, frontY);
  ctx.lineTo(frontX + bw, frontY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.trim;
  ctx.beginPath();
  ctx.moveTo(frontX + bw, frontY);
  ctx.lineTo(frontX + bw, frontY - h);
  ctx.lineTo(frontX, frontY - h);
  ctx.lineTo(frontX, frontY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.moveTo(frontX - bw - bDepth, frontY + bDepth * ISO_Y_RATIO);
  ctx.lineTo(frontX - bw, frontY);
  ctx.lineTo(frontX - bw, frontY - h);
  ctx.lineTo(frontX - bw - bDepth, frontY + bDepth * ISO_Y_RATIO - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.moveTo(frontX + bw + bDepth, frontY + bDepth * ISO_Y_RATIO);
  ctx.lineTo(frontX + bw, frontY);
  ctx.lineTo(frontX + bw, frontY - h);
  ctx.lineTo(frontX + bw + bDepth, frontY + bDepth * ISO_Y_RATIO - h);
  ctx.closePath();
  ctx.fill();

  const leftCornerX = -w;
  const leftCornerY = bodyY - w * tanAngle;
  ctx.fillStyle = "#4A3A2A";
  ctx.beginPath();
  ctx.moveTo(leftCornerX, leftCornerY);
  ctx.lineTo(leftCornerX + bw, leftCornerY + bw * tanAngle);
  ctx.lineTo(leftCornerX + bw, leftCornerY + bw * tanAngle - h);
  ctx.lineTo(leftCornerX, leftCornerY - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3A2A1A";
  ctx.beginPath();
  ctx.moveTo(leftCornerX, leftCornerY);
  ctx.lineTo(leftCornerX - bw, leftCornerY + bw * tanAngle);
  ctx.lineTo(leftCornerX - bw, leftCornerY + bw * tanAngle - h);
  ctx.lineTo(leftCornerX, leftCornerY - h);
  ctx.closePath();
  ctx.fill();

  const rightCornerX = w;
  const rightCornerY = bodyY - w * tanAngle;
  ctx.fillStyle = c.trim;
  ctx.beginPath();
  ctx.moveTo(rightCornerX, rightCornerY);
  ctx.lineTo(rightCornerX - bw, rightCornerY + bw * tanAngle);
  ctx.lineTo(rightCornerX - bw, rightCornerY + bw * tanAngle - h);
  ctx.lineTo(rightCornerX, rightCornerY - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.frame;
  ctx.beginPath();
  ctx.moveTo(rightCornerX, rightCornerY);
  ctx.lineTo(rightCornerX + bw, rightCornerY + bw * tanAngle);
  ctx.lineTo(rightCornerX + bw, rightCornerY + bw * tanAngle - h);
  ctx.lineTo(rightCornerX, rightCornerY - h);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Shield crest on left wall
// ---------------------------------------------------------------------------

function drawVaultCrest(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
  c: VaultPalette,
  isFlashing: boolean,
): void {
  ctx.save();
  ctx.translate(-w * 0.5, bodyY - w * tanAngle * 0.5 - h * 0.5);
  ctx.transform(1, tanAngle, 0, 1, 0, 0);

  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.moveTo(0, -11 * s2);
  ctx.lineTo(-9 * s2, -7 * s2);
  ctx.lineTo(-9 * s2, 4 * s2);
  ctx.quadraticCurveTo(-9 * s2, 10 * s2, 0, 15 * s2);
  ctx.quadraticCurveTo(9 * s2, 10 * s2, 9 * s2, 4 * s2);
  ctx.lineTo(9 * s2, -7 * s2);
  ctx.closePath();
  ctx.fill();

  const sg = ctx.createLinearGradient(0, -9 * s2, 0, 12 * s2);
  sg.addColorStop(0, c.trim);
  sg.addColorStop(0.5, c.accent);
  sg.addColorStop(1, c.trim);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(0, -8 * s2);
  ctx.lineTo(-6 * s2, -5 * s2);
  ctx.lineTo(-6 * s2, 3 * s2);
  ctx.quadraticCurveTo(-6 * s2, 8 * s2, 0, 12 * s2);
  ctx.quadraticCurveTo(6 * s2, 8 * s2, 6 * s2, 3 * s2);
  ctx.lineTo(6 * s2, -5 * s2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.arc(0, -2 * s2, 3.5 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-2 * s2, 0);
  ctx.lineTo(-1.2 * s2, 8 * s2);
  ctx.lineTo(1.2 * s2, 8 * s2);
  ctx.lineTo(2 * s2, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = isFlashing ? c.glow : "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.arc(0, -2 * s2, 1.8 * s2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 1.5 * s2;
  ctx.beginPath();
  ctx.moveTo(0, -8 * s2);
  ctx.lineTo(-6 * s2, -5 * s2);
  ctx.lineTo(-6 * s2, 3 * s2);
  ctx.quadraticCurveTo(-6 * s2, 8 * s2, 0, 12 * s2);
  ctx.quadraticCurveTo(6 * s2, 8 * s2, 6 * s2, 3 * s2);
  ctx.lineTo(6 * s2, -5 * s2);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Grand vault door on right wall
// ---------------------------------------------------------------------------

function drawVaultDoor(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
  c: VaultPalette,
  isFlashing: boolean,
  time: number,
): { doorCenterX: number; doorCenterY: number } {
  const doorCenterX = w * 0.5;
  const doorCenterY = bodyY - h * 0.5 - w * tanAngle * 0.5;

  ctx.save();
  ctx.translate(doorCenterX, doorCenterY);
  ctx.transform(1, -tanAngle, 0, 1, 0, 0);

  const dfGrad = ctx.createLinearGradient(-12 * s2, 0, 16 * s2, 0);
  dfGrad.addColorStop(0, "#3A2A1A");
  dfGrad.addColorStop(0.5, c.frame);
  dfGrad.addColorStop(1, "#4A3A28");
  ctx.fillStyle = dfGrad;
  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 2.5 * s2;
  ctx.fillRect(-12 * s2, -16 * s2, 28 * s2, 34 * s2);
  ctx.strokeRect(-12 * s2, -16 * s2, 28 * s2, 34 * s2);

  const dpGrad = ctx.createLinearGradient(-9 * s2, -13 * s2, 13 * s2, 15 * s2);
  dpGrad.addColorStop(0, "#4C3C2C");
  dpGrad.addColorStop(0.35, c.trim);
  dpGrad.addColorStop(0.65, c.trim);
  dpGrad.addColorStop(1, "#5A4A38");
  ctx.fillStyle = dpGrad;
  ctx.fillRect(-9 * s2, -13 * s2, 22 * s2, 28 * s2);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(-10 * s2, -7 * s2, 24 * s2, 2.5 * s2);
  ctx.fillRect(-10 * s2, 5 * s2, 24 * s2, 2.5 * s2);

  ctx.fillStyle = c.dark;
  ctx.fillRect(-11 * s2, -14 * s2, 4.5 * s2, 8 * s2);
  ctx.fillRect(-11 * s2, 7 * s2, 4.5 * s2, 8 * s2);
  ctx.fillStyle = c.frame;
  ctx.beginPath();
  ctx.arc(-9 * s2, -10.5 * s2, 1.8 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-9 * s2, 11.5 * s2, 1.8 * s2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.arc(2 * s2, 1 * s2, 12.5 * s2, 0, Math.PI * 2);
  ctx.fill();

  const dg = ctx.createRadialGradient(
    1 * s2, -0.5 * s2, 0,
    2 * s2, 1 * s2, 11 * s2,
  );
  dg.addColorStop(0, "#A09080");
  dg.addColorStop(0.3, c.frame);
  dg.addColorStop(0.7, "#5A4A38");
  dg.addColorStop(1, c.dark);
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(2 * s2, 1 * s2, 10.5 * s2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.6 * s2;
  ctx.beginPath();
  ctx.arc(2 * s2, 1 * s2, 9.5 * s2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = c.dark;
  for (let n = 0; n < 12; n++) {
    const a = (n * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.arc(2 * s2 + Math.cos(a) * 9.5 * s2, 1 * s2 + Math.sin(a) * 9.5 * s2, 1.3 * s2, 0, Math.PI * 2);
    ctx.fill();
  }

  const ig = ctx.createRadialGradient(1.5 * s2, 0, 0, 2 * s2, 1 * s2, 7 * s2);
  ig.addColorStop(0, c.accent);
  ig.addColorStop(0.5, c.trim);
  ig.addColorStop(1, c.frame);
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(2 * s2, 1 * s2, 7 * s2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5 * s2;
  ctx.beginPath();
  ctx.arc(2 * s2, 1 * s2, 5.5 * s2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(2 * s2, 1 * s2);
  ctx.rotate(time * 1.2);

  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(0, 0, 4.8 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.5 * s2;
  ctx.stroke();

  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 2.2 * s2;
  for (let sp = 0; sp < 4; sp++) {
    const a = (sp * Math.PI * 2) / 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 4.3 * s2, Math.sin(a) * 4.3 * s2);
    ctx.stroke();
  }

  ctx.fillStyle = c.trim;
  for (let sp = 0; sp < 4; sp++) {
    const a = (sp * Math.PI * 2) / 4;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 4 * s2, Math.sin(a) * 4 * s2, 1.3 * s2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowColor = c.glow;
  ctx.shadowBlur = isFlashing ? 30 : 14;
  ctx.fillStyle = isFlashing ? "#FFF" : c.glow;
  ctx.beginPath();
  ctx.arc(0, 0, 2.4 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(-0.5 * s2, -0.5 * s2, 1 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.save();
  ctx.translate(14 * s2, 7 * s2);
  ctx.fillStyle = c.dark;
  ctx.fillRect(-3.5 * s2, -2 * s2, 7 * s2, 4 * s2);
  ctx.fillStyle = "#3A3028";
  ctx.fillRect(-2 * s2, -9 * s2, 4 * s2, 18 * s2);
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(0, -9 * s2, 3 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.arc(-0.5 * s2, -9.5 * s2, 1.2 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(0, 9 * s2, 3 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.arc(-0.5 * s2, 8.5 * s2, 1.2 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  return { doorCenterX, doorCenterY };
}

// ---------------------------------------------------------------------------
// Cornice / crown molding with dentil blocks
// ---------------------------------------------------------------------------

function drawVaultCornice(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
  c: VaultPalette,
): void {
  const corniceH = 6 * s2;

  const clg = ctx.createLinearGradient(-w - 2 * s2, bodyY - w * tanAngle - h, 0, bodyY - h);
  clg.addColorStop(0, "#6A5840");
  clg.addColorStop(1, c.trim);
  ctx.fillStyle = clg;
  ctx.beginPath();
  ctx.moveTo(0, bodyY - h);
  ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
  ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
  ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
  ctx.closePath();
  ctx.fill();

  const crg = ctx.createLinearGradient(0, bodyY - h, w + 2 * s2, bodyY - w * tanAngle - h);
  crg.addColorStop(0, c.accent);
  crg.addColorStop(1, "#A08850");
  ctx.fillStyle = crg;
  ctx.beginPath();
  ctx.moveTo(0, bodyY - h);
  ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
  ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
  ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  const dentilCount = 5;
  for (let d = 0; d < dentilCount; d++) {
    const f = (d + 0.5) / (dentilCount + 1);
    const dx = -w * f - 2 * s2 * f;
    const dy = bodyY - w * tanAngle * f - h - 1 * s2 * f;
    ctx.fillRect(dx - 1.5 * s2, dy - corniceH + 1 * s2, 2.5 * s2, corniceH - 2 * s2);
  }
  for (let d = 0; d < dentilCount; d++) {
    const f = (d + 0.5) / (dentilCount + 1);
    const dx = w * f + 2 * s2 * f;
    const dy = bodyY - w * tanAngle * f - h - 1 * s2 * f;
    ctx.fillRect(dx - 1.5 * s2, dy - corniceH + 1 * s2, 2.5 * s2, corniceH - 2 * s2);
  }

  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 1.5 * s2;
  ctx.beginPath();
  ctx.moveTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
  ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
  ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 0.8 * s2;
  ctx.beginPath();
  ctx.moveTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH + 1.5 * s2);
  ctx.lineTo(0, bodyY - h - corniceH + 3.5 * s2);
  ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH + 1.5 * s2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Wall rivets
// ---------------------------------------------------------------------------

function drawVaultRivets(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
  c: VaultPalette,
): void {
  const positions = [
    { x: -w + 3 * s2, yBase: bodyY - w * tanAngle },
    { x: w - 3 * s2, yBase: bodyY - w * tanAngle },
    { x: -2 * s2, yBase: bodyY },
    { x: 2 * s2, yBase: bodyY },
  ];
  positions.forEach((pos) => {
    for (let i = 0; i < 4; i++) {
      const ry = pos.yBase - h * 0.2 - i * h * 0.22;
      ctx.fillStyle = c.frame;
      ctx.beginPath();
      ctx.arc(pos.x, ry, 3 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.arc(pos.x, ry, 1.5 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(pos.x - 0.5 * s2, ry - 0.5 * s2, 0.8 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// ---------------------------------------------------------------------------
// Roof: parapet, merlons, corner turrets, and golden dome
// ---------------------------------------------------------------------------

function drawVaultRoof(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  bodyY: number,
  tanAngle: number,
  roofOffset: number,
  c: VaultPalette,
  time: number,
): { roofPeakY: number; parH: number; rcy: number } {
  const roofPeakY = bodyY - h - roofOffset;
  const parH = 4 * s2;

  const rf = { x: 0, y: bodyY - h };
  const rl = { x: -w, y: bodyY - w * tanAngle - h };
  const rb = { x: 0, y: roofPeakY };
  const rr = { x: w, y: bodyY - w * tanAngle - h };
  const rcx = 0;
  const rcy = bodyY - h - w * tanAngle;

  const pi = 0.78;
  const rfi = { x: rcx + (rf.x - rcx) * pi, y: rcy + (rf.y - rcy) * pi };
  const rli = { x: rcx + (rl.x - rcx) * pi, y: rcy + (rl.y - rcy) * pi };
  const rbi = { x: rcx + (rb.x - rcx) * pi, y: rcy + (rb.y - rcy) * pi };
  const rri = { x: rcx + (rr.x - rcx) * pi, y: rcy + (rr.y - rcy) * pi };

  // Back-left parapet (rl → rb) — drawn first, furthest from viewer
  ctx.fillStyle = "#4A3A28";
  ctx.beginPath();
  ctx.moveTo(rl.x, rl.y);
  ctx.lineTo(rb.x, rb.y);
  ctx.lineTo(rb.x, rb.y - parH);
  ctx.lineTo(rl.x, rl.y - parH);
  ctx.closePath();
  ctx.fill();

  // Back-right parapet (rb → rr)
  ctx.fillStyle = "#5A4A38";
  ctx.beginPath();
  ctx.moveTo(rb.x, rb.y);
  ctx.lineTo(rr.x, rr.y);
  ctx.lineTo(rr.x, rr.y - parH);
  ctx.lineTo(rb.x, rb.y - parH);
  ctx.closePath();
  ctx.fill();

  // Front-left parapet (rf → rl)
  const plg = ctx.createLinearGradient(rl.x, rl.y, rf.x, rf.y);
  plg.addColorStop(0, "#5A4A38");
  plg.addColorStop(1, c.trim);
  ctx.fillStyle = plg;
  ctx.beginPath();
  ctx.moveTo(rf.x, rf.y);
  ctx.lineTo(rl.x, rl.y);
  ctx.lineTo(rl.x, rl.y - parH);
  ctx.lineTo(rf.x, rf.y - parH);
  ctx.closePath();
  ctx.fill();

  // Front-right parapet (rf → rr)
  const prg = ctx.createLinearGradient(rf.x, rf.y, rr.x, rr.y);
  prg.addColorStop(0, c.accent);
  prg.addColorStop(1, "#A08850");
  ctx.fillStyle = prg;
  ctx.beginPath();
  ctx.moveTo(rr.x, rr.y);
  ctx.lineTo(rf.x, rf.y);
  ctx.lineTo(rf.x, rf.y - parH);
  ctx.lineTo(rr.x, rr.y - parH);
  ctx.closePath();
  ctx.fill();

  // Parapet top ledges
  ctx.fillStyle = c.wallTop;
  ctx.beginPath();
  ctx.moveTo(rf.x, rf.y - parH);
  ctx.lineTo(rl.x, rl.y - parH);
  ctx.lineTo(rli.x, rli.y - parH);
  ctx.lineTo(rfi.x, rfi.y - parH);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rl.x, rl.y - parH);
  ctx.lineTo(rb.x, rb.y - parH);
  ctx.lineTo(rbi.x, rbi.y - parH);
  ctx.lineTo(rli.x, rli.y - parH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#B8A882";
  ctx.beginPath();
  ctx.moveTo(rb.x, rb.y - parH);
  ctx.lineTo(rr.x, rr.y - parH);
  ctx.lineTo(rri.x, rri.y - parH);
  ctx.lineTo(rbi.x, rbi.y - parH);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rr.x, rr.y - parH);
  ctx.lineTo(rf.x, rf.y - parH);
  ctx.lineTo(rfi.x, rfi.y - parH);
  ctx.lineTo(rri.x, rri.y - parH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.beginPath();
  ctx.moveTo(rfi.x, rfi.y - parH);
  ctx.lineTo(rli.x, rli.y - parH);
  ctx.lineTo(rbi.x, rbi.y - parH);
  ctx.lineTo(rri.x, rri.y - parH);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 0.8 * s2;
  ctx.beginPath();
  ctx.moveTo(rl.x, rl.y - parH);
  ctx.lineTo(rf.x, rf.y - parH);
  ctx.lineTo(rr.x, rr.y - parH);
  ctx.stroke();

  // Merlon and turret constants
  const merlonH = 4.5 * s2;
  const merlonW = 3.5 * s2;
  const mCount = 3;
  const turretR = 4 * s2;
  const turretH = 8 * s2;
  const capH = 4 * s2;
  const tSm = 0.9;

  // --- Back elements first (painter's algorithm) ---

  // Back corner turret (rb)
  isoCylinder(ctx, rb.x, rb.y - parH, turretR * tSm, turretH * 0.8, "#6A5A48", "#3A2A1A", "#A09070");
  ctx.fillStyle = c.trim;
  ctx.beginPath();
  ctx.moveTo(rb.x, rb.y - parH - turretH * 0.8 - capH * 0.8);
  ctx.lineTo(rb.x - turretR * 1.1, rb.y - parH - turretH * 0.8);
  ctx.lineTo(rb.x + turretR * 1.1, rb.y - parH - turretH * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.arc(rb.x, rb.y - parH - turretH * 0.8 - capH * 0.8 - 1.2 * s2, 1.3 * s2, 0, Math.PI * 2);
  ctx.fill();

  // Merlons on back-left edge (rl → rb)
  for (let m = 0; m < mCount; m++) {
    const t = (m + 0.5) / (mCount + 0.5);
    const mx = rl.x + (rb.x - rl.x) * t;
    const my = rl.y + (rb.y - rl.y) * t - parH;
    isoBoxAt(ctx, mx, my, merlonW, merlonH, "#5A4A38", "#7A6A54", "#A09070");
  }

  // Merlons on back-right edge (rb → rr)
  for (let m = 0; m < mCount; m++) {
    const t = (m + 0.5) / (mCount + 0.5);
    const mx = rb.x + (rr.x - rb.x) * t;
    const my = rb.y + (rr.y - rb.y) * t - parH;
    isoBoxAt(ctx, mx, my, merlonW, merlonH, "#6A5A48", "#8A7A62", "#A89878");
  }

  // --- Side turrets (drawn before front elements) ---

  // Left corner turret (rl)
  isoCylinder(ctx, rl.x, rl.y - parH, turretR * tSm, turretH * 0.85, "#6A5A48", "#3A2A1A", "#A09070");
  ctx.fillStyle = c.trim;
  ctx.beginPath();
  ctx.moveTo(rl.x, rl.y - parH - turretH * 0.85 - capH * 0.85);
  ctx.lineTo(rl.x - turretR * 1.1, rl.y - parH - turretH * 0.85);
  ctx.lineTo(rl.x + turretR * 1.1, rl.y - parH - turretH * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.arc(rl.x, rl.y - parH - turretH * 0.85 - capH * 0.85 - 1.2 * s2, 1.3 * s2, 0, Math.PI * 2);
  ctx.fill();

  // Right corner turret (rr)
  isoCylinder(ctx, rr.x, rr.y - parH, turretR * tSm, turretH * 0.85, "#8A7A65", "#5A4A38", "#B8A882");
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.moveTo(rr.x, rr.y - parH - turretH * 0.85 - capH * 0.85);
  ctx.lineTo(rr.x - turretR * 1.1, rr.y - parH - turretH * 0.85);
  ctx.lineTo(rr.x + turretR * 1.1, rr.y - parH - turretH * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.arc(rr.x, rr.y - parH - turretH * 0.85 - capH * 0.85 - 1.2 * s2, 1.3 * s2, 0, Math.PI * 2);
  ctx.fill();

  // --- Front merlons ---

  // Merlons on front-left edge (rf → rl)
  for (let m = 0; m < mCount; m++) {
    const t = (m + 0.5) / (mCount + 0.5);
    const mx = rf.x + (rl.x - rf.x) * t;
    const my = rf.y + (rl.y - rf.y) * t - parH;
    isoBoxAt(ctx, mx, my, merlonW, merlonH, "#5E4E3C", "#8A7A64", c.wallTop);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    const slitW = 0.8 * s2;
    const slitH = 2.5 * s2;
    ctx.fillRect(mx - slitW * 0.5 - merlonW * 0.25, my - merlonH * 0.6, slitW, slitH);
  }

  // Merlons on front-right edge (rf → rr)
  for (let m = 0; m < mCount; m++) {
    const t = (m + 0.5) / (mCount + 0.5);
    const mx = rf.x + (rr.x - rf.x) * t;
    const my = rf.y + (rr.y - rf.y) * t - parH;
    isoBoxAt(ctx, mx, my, merlonW, merlonH, "#7A6A54", "#A09070", "#B8A882");
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    const slitW = 0.8 * s2;
    const slitH = 2.5 * s2;
    ctx.fillRect(mx - slitW * 0.5 + merlonW * 0.15, my - merlonH * 0.6, slitW, slitH);
  }

  // --- Front corner turret (rf) — drawn last, closest to viewer ---
  isoCylinder(ctx, rf.x, rf.y - parH, turretR, turretH, "#7A6A55", "#4A3A2A", "#B09A7A");
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.moveTo(rf.x, rf.y - parH - turretH - capH);
  ctx.lineTo(rf.x - turretR * 1.2, rf.y - parH - turretH);
  ctx.lineTo(rf.x + turretR * 1.2, rf.y - parH - turretH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.dark;
  ctx.beginPath();
  ctx.arc(rf.x, rf.y - parH - turretH - capH - 1.5 * s2, 1.5 * s2, 0, Math.PI * 2);
  ctx.fill();

  // Central golden dome
  const domeBaseY = rcy - parH;
  const domeR = w * 0.22;
  const domeH = 8 * s2;
  const domeRy = domeR * ISO_Y_RATIO;

  isoBoxAt(ctx, rcx, rcy - parH, w * 0.16, 3 * s2, c.frame, c.trim, c.accent);

  const dg = ctx.createRadialGradient(
    rcx - domeR * 0.2, domeBaseY - 3 * s2 - domeH * 0.6,
    0,
    rcx, domeBaseY - 3 * s2 - domeH * 0.3,
    domeR * 1.2,
  );
  dg.addColorStop(0, "#F0D870");
  dg.addColorStop(0.3, "#D4B850");
  dg.addColorStop(0.6, c.accent);
  dg.addColorStop(1, "#8A7030");
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.ellipse(rcx, domeBaseY - 3 * s2, domeR, domeRy, 0, Math.PI, 0, true);
  ctx.quadraticCurveTo(
    rcx + domeR * 0.4, domeBaseY - 3 * s2 - domeH * 1.1,
    rcx, domeBaseY - 3 * s2 - domeH,
  );
  ctx.quadraticCurveTo(
    rcx - domeR * 0.4, domeBaseY - 3 * s2 - domeH * 1.1,
    rcx - domeR, domeBaseY - 3 * s2,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.6 * s2;
  ctx.beginPath();
  ctx.ellipse(rcx, domeBaseY - 3 * s2, domeR, domeRy, 0, Math.PI, 0, true);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,200,0.25)";
  ctx.beginPath();
  ctx.ellipse(rcx - domeR * 0.3, domeBaseY - 3 * s2 - domeH * 0.55, domeR * 0.25, domeH * 0.25, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Finial orb
  const finialY = domeBaseY - 3 * s2 - domeH - 2 * s2;
  ctx.fillStyle = c.dark;
  ctx.fillRect(rcx - 0.8 * s2, finialY + 0.5 * s2, 1.6 * s2, 2.5 * s2);
  const fg = ctx.createRadialGradient(
    rcx - 0.5 * s2, finialY - 0.5 * s2, 0,
    rcx, finialY, 3 * s2,
  );
  fg.addColorStop(0, "#F8E888");
  fg.addColorStop(0.5, c.accent);
  fg.addColorStop(1, "#8A7030");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(rcx, finialY, 3 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(rcx - 0.8 * s2, finialY - 0.8 * s2, 1.1 * s2, 0, Math.PI * 2);
  ctx.fill();

  const glowPulse = 0.15 + Math.sin(time * 2.5) * 0.06;
  ctx.shadowColor = c.accent;
  ctx.shadowBlur = 8 * s2;
  ctx.fillStyle = `rgba(200, 168, 96, ${glowPulse})`;
  ctx.beginPath();
  ctx.arc(rcx, finialY, 4 * s2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  return { roofPeakY, parH, rcy };
}

// ---------------------------------------------------------------------------
// Ambient glow and gold particle effects
// ---------------------------------------------------------------------------

function drawVaultAmbient(
  ctx: CanvasRenderingContext2D,
  s2: number,
  doorCenterX: number,
  doorCenterY: number,
  isFlashing: boolean,
  time: number,
): void {
  const glowPulse = 0.12 + Math.sin(time * 2.5) * 0.04;
  const ag = ctx.createRadialGradient(
    doorCenterX, doorCenterY, 0,
    doorCenterX, doorCenterY, 28 * s2,
  );
  if (isFlashing) {
    ag.addColorStop(0, "rgba(255, 100, 100, 0.25)");
    ag.addColorStop(0.5, "rgba(255, 100, 100, 0.08)");
    ag.addColorStop(1, "transparent");
  } else {
    ag.addColorStop(0, `rgba(76, 184, 152, ${glowPulse})`);
    ag.addColorStop(0.5, `rgba(76, 184, 152, ${glowPulse * 0.4})`);
    ag.addColorStop(1, "transparent");
  }
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.arc(doorCenterX, doorCenterY, 28 * s2, 0, Math.PI * 2);
  ctx.fill();

  if (!isFlashing) {
    for (let i = 0; i < 5; i++) {
      const phase = (time * 0.6 + i * 1.3) % 4;
      const alpha = Math.max(0, 0.5 - phase * 0.13);
      const angle = time * 0.4 + i * (Math.PI * 2) / 5;
      const radius = (18 + phase * 5) * s2;
      const px = doorCenterX + Math.cos(angle) * radius * 0.6;
      const py = doorCenterY - phase * 8 * s2 + Math.sin(angle) * radius * 0.3;
      const sz = (0.8 + Math.sin(time * 3 + i) * 0.3) * s2;

      ctx.fillStyle = `rgba(212, 184, 112, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function drawActiveVaultBuilding(
  ctx: CanvasRenderingContext2D,
  s2: number,
  w: number,
  h: number,
  tanAngle: number,
  roofOffset: number,
  time: number,
  isFlashing: boolean,
): VaultGeometry {
  const c = getVaultPalette(isFlashing);

  const totalBaseH = drawVaultFoundation(ctx, s2, w, tanAngle);
  const bodyY = -totalBaseH;

  drawVaultWalls(ctx, s2, w, h, bodyY, tanAngle, c);
  drawVaultStonework(ctx, s2, w, h, bodyY, tanAngle);
  drawVaultButtresses(ctx, s2, w, h, bodyY, tanAngle, c);
  drawVaultRivets(ctx, s2, w, h, bodyY, tanAngle, c);
  drawVaultCrest(ctx, s2, w, h, bodyY, tanAngle, c, isFlashing);

  const { doorCenterX, doorCenterY } = drawVaultDoor(
    ctx, s2, w, h, bodyY, tanAngle, c, isFlashing, time,
  );

  drawVaultCornice(ctx, s2, w, h, bodyY, tanAngle, c);

  const { roofPeakY, parH, rcy } = drawVaultRoof(
    ctx, s2, w, h, bodyY, tanAngle, roofOffset, c, time,
  );

  drawVaultAmbient(ctx, s2, doorCenterX, doorCenterY, isFlashing, time);

  const lWallPt = (fx: number, fy: number) => ({
    x: -w * fx,
    y: bodyY - w * tanAngle * fx - h * fy,
  });
  const rWallPt = (fx: number, fy: number) => ({
    x: w * fx,
    y: bodyY - w * tanAngle * fx - h * fy,
  });

  return { bodyY, roofPeakY, parH, rcy, lWallPt, rWallPt };
}
