// Princeton Tower Defense — Dark Fantasy Path-Based Body Helpers
// Renders arms and legs using overlapping-plate technique matching
// troop sprite quality. Bulky, wide, no gaps between segments.

const TAU = Math.PI * 2;

export type LimbStyle = 'armored' | 'bone' | 'ghostly' | 'fleshy';

// ─── Public interfaces ───────────────────────────────────────────

export interface PathArmOptions {
  upperLen?: number;
  foreLen?: number;
  width?: number;
  swingSpeed?: number;
  swingAmt?: number;
  baseAngle?: number;
  color: string;
  colorDark: string;
  handColor?: string;
  handRadius?: number;
  phaseOffset?: number;
  elbowBend?: number;
  attackExtra?: number;
  style?: LimbStyle;
  trimColor?: string;
  shoulderAngle?: number;
  elbowAngle?: number;
  onWeapon?: (ctx: CanvasRenderingContext2D) => void;
}

export interface PathLegOptions {
  legLen?: number;
  width?: number;
  strideSpeed?: number;
  strideAmt?: number;
  color: string;
  colorDark: string;
  footColor?: string;
  footLen?: number;
  shuffle?: boolean;
  phaseOffset?: number;
  style?: LimbStyle;
  trimColor?: string;
}

// ═══════════════════════════════════════════════════════════════════
// ARMORED — bulky trapezoidal plates, wide pauldrons & knee guards
// ═══════════════════════════════════════════════════════════════════

function renderArmoredArm(
  ctx: CanvasRenderingContext2D,
  w: number,
  upperLen: number,
  foreLen: number,
  hR: number,
  zoom: number,
  color: string,
  colorDark: string,
  handColor: string,
  trimColor: string,
  elbowA: number,
): void {
  // Pauldron
  const padGrad = ctx.createLinearGradient(-w * 1.6, 0, w * 1.6, 0);
  padGrad.addColorStop(0, colorDark);
  padGrad.addColorStop(0.4, color);
  padGrad.addColorStop(1, colorDark);
  ctx.fillStyle = padGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 1.6, w * 1.05, 0, 0, TAU);
  ctx.fill();

  // Pauldron rivet
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.arc(0, -w * 0.3, w * 0.18, 0, TAU);
  ctx.fill();

  // Upper arm plate
  const uGrad = ctx.createLinearGradient(-w * 1.1, 0, w * 1.1, 0);
  uGrad.addColorStop(0, colorDark);
  uGrad.addColorStop(0.45, color);
  uGrad.addColorStop(1, colorDark);
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, w * 0.15);
  ctx.lineTo(-w * 1.0, upperLen);
  ctx.lineTo(w * 1.0, upperLen);
  ctx.lineTo(w * 1.1, w * 0.15);
  ctx.closePath();
  ctx.fill();

  // Center ridge
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(0.6, zoom * 0.8);
  ctx.beginPath();
  ctx.moveTo(0, w * 0.4);
  ctx.lineTo(0, upperLen - w * 0.1);
  ctx.stroke();

  // Plate separators
  ctx.lineWidth = Math.max(0.4, zoom * 0.6);
  ctx.beginPath();
  ctx.moveTo(-w * 1.05, upperLen * 0.45);
  ctx.lineTo(w * 1.05, upperLen * 0.45);
  ctx.stroke();

  // Elbow cop
  const eCGrad = ctx.createLinearGradient(-w * 1.4, upperLen, w * 1.4, upperLen);
  eCGrad.addColorStop(0, colorDark);
  eCGrad.addColorStop(0.5, color);
  eCGrad.addColorStop(1, colorDark);
  ctx.fillStyle = eCGrad;
  ctx.beginPath();
  ctx.ellipse(0, upperLen, w * 1.4, w * 0.9, 0, 0, TAU);
  ctx.fill();

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Vambrace
  const fGrad = ctx.createLinearGradient(-w * 1.0, 0, w * 1.0, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.45, color);
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.05, -w * 0.35);
  ctx.lineTo(-w * 0.85, foreLen);
  ctx.lineTo(w * 0.85, foreLen);
  ctx.lineTo(w * 1.05, -w * 0.35);
  ctx.closePath();
  ctx.fill();

  // Gauntlet
  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.75, foreLen - w * 0.15);
  ctx.lineTo(-w * 0.8, foreLen + hR * 0.9);
  ctx.lineTo(w * 0.8, foreLen + hR * 0.9);
  ctx.lineTo(w * 0.75, foreLen - w * 0.15);
  ctx.closePath();
  ctx.fill();
}

function renderArmoredLeg(
  ctx: CanvasRenderingContext2D,
  w: number,
  halfLen: number,
  fl: number,
  zoom: number,
  color: string,
  colorDark: string,
  footColor: string,
  trimColor: string,
  kneeBend: number,
  ls: number,
): void {
  // Thigh plate
  const tGrad = ctx.createLinearGradient(-w * 1.1, 0, w * 1.1, 0);
  tGrad.addColorStop(0, colorDark);
  tGrad.addColorStop(0.45, color);
  tGrad.addColorStop(1, colorDark);
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, 0);
  ctx.lineTo(-w * 1.0, halfLen);
  ctx.lineTo(w * 1.0, halfLen);
  ctx.lineTo(w * 1.1, 0);
  ctx.closePath();
  ctx.fill();

  // Trim stripe
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(0.5, 0.8 * zoom);
  ctx.beginPath();
  ctx.moveTo(ls * w * 0.65, w * 0.2);
  ctx.lineTo(ls * w * 0.6, halfLen - w * 0.1);
  ctx.stroke();

  // Knee guard
  const kGrad = ctx.createLinearGradient(-w * 1.4, halfLen, w * 1.4, halfLen);
  kGrad.addColorStop(0, colorDark);
  kGrad.addColorStop(0.5, color);
  kGrad.addColorStop(1, colorDark);
  ctx.fillStyle = kGrad;
  ctx.beginPath();
  ctx.ellipse(0, halfLen, w * 1.4, w * 0.9, 0, 0, TAU);
  ctx.fill();

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Greave
  const gGrad = ctx.createLinearGradient(-w * 1.0, 0, w * 1.0, 0);
  gGrad.addColorStop(0, colorDark);
  gGrad.addColorStop(0.4, color);
  gGrad.addColorStop(1, colorDark);
  ctx.fillStyle = gGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.05, -w * 0.3);
  ctx.lineTo(-w * 0.85, halfLen);
  ctx.lineTo(w * 0.85, halfLen);
  ctx.lineTo(w * 1.05, -w * 0.3);
  ctx.closePath();
  ctx.fill();

  // Greave ridge
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(0.4, 0.6 * zoom);
  ctx.beginPath();
  ctx.moveTo(0, w * 0.1);
  ctx.lineTo(0, halfLen - w * 0.15);
  ctx.stroke();

  // Boot
  ctx.fillStyle = footColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.8, halfLen - w * 0.2);
  ctx.lineTo(-w * 0.65, halfLen + w * 0.45);
  ctx.lineTo(fl * 0.8, halfLen + w * 0.45);
  ctx.lineTo(fl * 0.9, halfLen - w * 0.1);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════════════
// BONE — thick shafts, huge joint balls, cracks
// ═══════════════════════════════════════════════════════════════════

function renderBoneArm(
  ctx: CanvasRenderingContext2D,
  w: number,
  upperLen: number,
  foreLen: number,
  hR: number,
  zoom: number,
  color: string,
  colorDark: string,
  handColor: string,
  elbowA: number,
): void {
  // Shoulder ball
  const sGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.2);
  sGrad.addColorStop(0, color);
  sGrad.addColorStop(0.6, color);
  sGrad.addColorStop(1, colorDark);
  ctx.fillStyle = sGrad;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.2, 0, TAU);
  ctx.fill();

  // Humerus
  const uGrad = ctx.createLinearGradient(-w * 0.95, 0, w * 0.95, 0);
  uGrad.addColorStop(0, colorDark);
  uGrad.addColorStop(0.25, color);
  uGrad.addColorStop(0.75, color);
  uGrad.addColorStop(1, colorDark);
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.85, -w * 0.25);
  ctx.quadraticCurveTo(-w * 0.65, upperLen * 0.5, -w * 0.8, upperLen + w * 0.2);
  ctx.lineTo(w * 0.8, upperLen + w * 0.2);
  ctx.quadraticCurveTo(w * 0.65, upperLen * 0.5, w * 0.85, -w * 0.25);
  ctx.closePath();
  ctx.fill();

  // Bone cracks
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = Math.max(0.4, 0.6 * zoom);
  ctx.beginPath();
  ctx.moveTo(w * 0.2, upperLen * 0.2);
  ctx.lineTo(-w * 0.15, upperLen * 0.42);
  ctx.lineTo(w * 0.1, upperLen * 0.58);
  ctx.stroke();

  // Elbow ball
  const eGrad = ctx.createRadialGradient(0, upperLen, 0, 0, upperLen, w * 1.15);
  eGrad.addColorStop(0, color);
  eGrad.addColorStop(0.55, color);
  eGrad.addColorStop(1, colorDark);
  ctx.fillStyle = eGrad;
  ctx.beginPath();
  ctx.arc(0, upperLen, w * 1.15, 0, TAU);
  ctx.fill();

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Radius / ulna
  const fGrad = ctx.createLinearGradient(-w * 0.8, 0, w * 0.8, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.3, color);
  fGrad.addColorStop(0.7, color);
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.7, -w * 0.35);
  ctx.quadraticCurveTo(-w * 0.5, foreLen * 0.5, -w * 0.6, foreLen);
  ctx.lineTo(w * 0.6, foreLen);
  ctx.quadraticCurveTo(w * 0.5, foreLen * 0.5, w * 0.7, -w * 0.35);
  ctx.closePath();
  ctx.fill();

  // Bony hand
  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.55, foreLen - w * 0.1);
  ctx.lineTo(-w * 0.65, foreLen + hR * 0.9);
  ctx.lineTo(-w * 0.2, foreLen + hR * 1.6);
  ctx.lineTo(w * 0.2, foreLen + hR * 1.7);
  ctx.lineTo(w * 0.6, foreLen + hR * 1.0);
  ctx.lineTo(w * 0.5, foreLen - w * 0.1);
  ctx.closePath();
  ctx.fill();
}

function renderBoneLeg(
  ctx: CanvasRenderingContext2D,
  w: number,
  halfLen: number,
  fl: number,
  zoom: number,
  color: string,
  colorDark: string,
  footColor: string,
  kneeBend: number,
  ls: number,
): void {
  // Hip ball
  const hGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.05);
  hGrad.addColorStop(0, color);
  hGrad.addColorStop(0.6, color);
  hGrad.addColorStop(1, colorDark);
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.05, 0, TAU);
  ctx.fill();

  // Femur
  const fGrad = ctx.createLinearGradient(-w * 0.85, 0, w * 0.85, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.25, color);
  fGrad.addColorStop(0.75, color);
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.75, -w * 0.2);
  ctx.quadraticCurveTo(-w * 0.55, halfLen * 0.5, -w * 0.7, halfLen + w * 0.15);
  ctx.lineTo(w * 0.7, halfLen + w * 0.15);
  ctx.quadraticCurveTo(w * 0.55, halfLen * 0.5, w * 0.75, -w * 0.2);
  ctx.closePath();
  ctx.fill();

  // Knee ball
  const kGrad = ctx.createRadialGradient(0, halfLen, 0, 0, halfLen, w * 1.0);
  kGrad.addColorStop(0, color);
  kGrad.addColorStop(0.55, color);
  kGrad.addColorStop(1, colorDark);
  ctx.fillStyle = kGrad;
  ctx.beginPath();
  ctx.arc(0, halfLen, w * 1.0, 0, TAU);
  ctx.fill();

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Tibia
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-w * 0.65, -w * 0.3);
  ctx.quadraticCurveTo(-w * 0.45, halfLen * 0.5, -w * 0.5, halfLen);
  ctx.lineTo(w * 0.5, halfLen);
  ctx.quadraticCurveTo(w * 0.45, halfLen * 0.5, w * 0.65, -w * 0.3);
  ctx.closePath();
  ctx.fill();

  // Skeletal foot
  ctx.fillStyle = footColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.45, halfLen - w * 0.1);
  ctx.lineTo(-w * 0.2, halfLen + w * 0.3);
  ctx.lineTo(fl * 0.6, halfLen + w * 0.35);
  ctx.lineTo(fl * 0.7, halfLen + w * 0.1);
  ctx.lineTo(w * 0.3, halfLen - w * 0.1);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════════════
// FLESHY — thick organic blobs, stitch overlays, no visible joints
// ═══════════════════════════════════════════════════════════════════

function renderFleshyArm(
  ctx: CanvasRenderingContext2D,
  w: number,
  upperLen: number,
  foreLen: number,
  hR: number,
  zoom: number,
  color: string,
  colorDark: string,
  handColor: string,
  elbowA: number,
): void {
  // Upper arm — thick organic slab
  const uGrad = ctx.createLinearGradient(-w * 1.5, 0, w * 1.5, 0);
  uGrad.addColorStop(0, colorDark);
  uGrad.addColorStop(0.3, color);
  uGrad.addColorStop(0.7, color);
  uGrad.addColorStop(1, colorDark);
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.15, -w * 0.25);
  ctx.quadraticCurveTo(-w * 1.6, upperLen * 0.4, -w * 1.1, upperLen + w * 0.4);
  ctx.lineTo(w * 1.1, upperLen + w * 0.4);
  ctx.quadraticCurveTo(w * 1.6, upperLen * 0.4, w * 1.15, -w * 0.25);
  ctx.closePath();
  ctx.fill();

  // Stitch across upper arm
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = Math.max(0.5, 0.8 * zoom);
  ctx.beginPath();
  ctx.moveTo(-w * 0.7, upperLen * 0.3);
  ctx.lineTo(w * 0.6, upperLen * 0.45);
  ctx.stroke();
  for (let s = 0; s < 3; s++) {
    const t = (s + 0.5) / 3;
    const sx = -w * 0.7 + t * w * 1.3;
    const sy = upperLen * 0.3 + t * upperLen * 0.15;
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.1, sy - w * 0.15);
    ctx.lineTo(sx + w * 0.1, sy + w * 0.15);
    ctx.stroke();
  }

  // Discoloration patch
  ctx.fillStyle = colorDark;
  ctx.globalAlpha *= 0.25;
  ctx.beginPath();
  ctx.ellipse(w * 0.3, upperLen * 0.6, w * 0.4, w * 0.3, 0.3, 0, TAU);
  ctx.fill();
  ctx.globalAlpha /= 0.25;

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Forearm — overlaps generously
  const fGrad = ctx.createLinearGradient(-w * 1.1, 0, w * 1.1, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.35, color);
  fGrad.addColorStop(0.65, color);
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.05, -w * 0.45);
  ctx.quadraticCurveTo(-w * 1.3, foreLen * 0.35, -w * 0.8, foreLen);
  ctx.lineTo(w * 0.8, foreLen);
  ctx.quadraticCurveTo(w * 1.3, foreLen * 0.35, w * 1.05, -w * 0.45);
  ctx.closePath();
  ctx.fill();

  // Misshapen fist
  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.65, foreLen - w * 0.15);
  ctx.quadraticCurveTo(-w * 0.8, foreLen + hR * 0.6, -w * 0.25, foreLen + hR * 1.5);
  ctx.quadraticCurveTo(w * 0.15, foreLen + hR * 1.8, w * 0.6, foreLen + hR * 0.7);
  ctx.quadraticCurveTo(w * 0.7, foreLen, w * 0.55, foreLen - w * 0.15);
  ctx.closePath();
  ctx.fill();
}

function renderFleshyLeg(
  ctx: CanvasRenderingContext2D,
  w: number,
  halfLen: number,
  fl: number,
  zoom: number,
  color: string,
  colorDark: string,
  footColor: string,
  kneeBend: number,
  ls: number,
): void {
  // Thick thigh
  const tGrad = ctx.createLinearGradient(-w * 1.4, 0, w * 1.4, 0);
  tGrad.addColorStop(0, colorDark);
  tGrad.addColorStop(0.3, color);
  tGrad.addColorStop(0.7, color);
  tGrad.addColorStop(1, colorDark);
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.15, -w * 0.2);
  ctx.quadraticCurveTo(-w * 1.5, halfLen * 0.35, -w * 1.05, halfLen + w * 0.35);
  ctx.lineTo(w * 1.05, halfLen + w * 0.35);
  ctx.quadraticCurveTo(w * 1.5, halfLen * 0.35, w * 1.15, -w * 0.2);
  ctx.closePath();
  ctx.fill();

  // Stitch
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = Math.max(0.4, 0.6 * zoom);
  ctx.beginPath();
  ctx.moveTo(-w * 0.6, halfLen * 0.4);
  ctx.lineTo(w * 0.5, halfLen * 0.55);
  ctx.stroke();

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Calf
  const cGrad = ctx.createLinearGradient(-w * 1.0, 0, w * 1.0, 0);
  cGrad.addColorStop(0, colorDark);
  cGrad.addColorStop(0.35, color);
  cGrad.addColorStop(0.65, color);
  cGrad.addColorStop(1, colorDark);
  ctx.fillStyle = cGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.0, -w * 0.4);
  ctx.quadraticCurveTo(-w * 1.2, halfLen * 0.35, -w * 0.7, halfLen);
  ctx.lineTo(w * 0.7, halfLen);
  ctx.quadraticCurveTo(w * 1.2, halfLen * 0.35, w * 1.0, -w * 0.4);
  ctx.closePath();
  ctx.fill();

  // Chunky wrapped foot
  ctx.fillStyle = footColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.6, halfLen - w * 0.15);
  ctx.quadraticCurveTo(-w * 0.7, halfLen + w * 0.55, fl * 0.25, halfLen + w * 0.5);
  ctx.lineTo(fl * 0.65, halfLen + w * 0.25);
  ctx.quadraticCurveTo(fl * 0.5, halfLen - w * 0.1, w * 0.3, halfLen - w * 0.2);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════════════
// GHOSTLY — wide semi-transparent flowing shapes
// ═══════════════════════════════════════════════════════════════════

function renderGhostlyArm(
  ctx: CanvasRenderingContext2D,
  w: number,
  upperLen: number,
  foreLen: number,
  hR: number,
  _zoom: number,
  color: string,
  colorDark: string,
  handColor: string,
  elbowA: number,
): void {
  // Broad upper wisp
  const uGrad = ctx.createLinearGradient(0, -w * 0.3, 0, upperLen + w * 0.5);
  uGrad.addColorStop(0, color);
  uGrad.addColorStop(0.6, colorDark);
  uGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, -w * 0.25);
  ctx.quadraticCurveTo(-w * 1.4, upperLen * 0.3, -w * 0.85, upperLen + w * 0.5);
  ctx.lineTo(w * 0.85, upperLen + w * 0.5);
  ctx.quadraticCurveTo(w * 1.4, upperLen * 0.3, w * 1.1, -w * 0.25);
  ctx.closePath();
  ctx.fill();

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Lower wisp — fading
  const fGrad = ctx.createLinearGradient(0, -w * 0.5, 0, foreLen + hR * 1.5);
  fGrad.addColorStop(0, color);
  fGrad.addColorStop(0.5, colorDark);
  fGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.9, -w * 0.5);
  ctx.quadraticCurveTo(-w * 1.1, foreLen * 0.3, -w * 0.4, foreLen + hR * 1.2);
  ctx.lineTo(w * 0.4, foreLen + hR * 1.2);
  ctx.quadraticCurveTo(w * 1.1, foreLen * 0.3, w * 0.9, -w * 0.5);
  ctx.closePath();
  ctx.fill();

  // Wispy claws
  ctx.strokeStyle = handColor;
  ctx.lineWidth = w * 0.3;
  ctx.lineCap = 'round';
  for (let c = 0; c < 3; c++) {
    const ca = (c - 1) * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, foreLen);
    ctx.quadraticCurveTo(
      Math.sin(ca) * hR * 1.4, foreLen + hR,
      Math.sin(ca) * hR * 2.5, foreLen + hR * 2.2,
    );
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

function renderGhostlyLeg(
  ctx: CanvasRenderingContext2D,
  w: number,
  halfLen: number,
  _fl: number,
  _zoom: number,
  color: string,
  colorDark: string,
  _footColor: string,
  kneeBend: number,
  ls: number,
): void {
  // Upper tendril
  const tGrad = ctx.createLinearGradient(0, -w * 0.2, 0, halfLen + w * 0.5);
  tGrad.addColorStop(0, color);
  tGrad.addColorStop(0.6, colorDark);
  tGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.0, -w * 0.2);
  ctx.quadraticCurveTo(-w * 1.2, halfLen * 0.3, -w * 0.75, halfLen + w * 0.4);
  ctx.lineTo(w * 0.75, halfLen + w * 0.4);
  ctx.quadraticCurveTo(w * 1.2, halfLen * 0.3, w * 1.0, -w * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Lower tendril — fading
  const cGrad = ctx.createLinearGradient(0, -w * 0.35, 0, halfLen + w * 0.7);
  cGrad.addColorStop(0, colorDark);
  cGrad.addColorStop(0.4, colorDark);
  cGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.75, -w * 0.35);
  ctx.quadraticCurveTo(-w * 0.9, halfLen * 0.3, -w * 0.2, halfLen + w * 0.7);
  ctx.lineTo(w * 0.2, halfLen + w * 0.7);
  ctx.quadraticCurveTo(w * 0.9, halfLen * 0.3, w * 0.75, -w * 0.35);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC: drawPathArm
// ═══════════════════════════════════════════════════════════════════

export function drawPathArm(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  time: number,
  zoom: number,
  side: -1 | 1,
  opts: PathArmOptions,
): void {
  const upperLen = (opts.upperLen ?? 0.18) * size;
  const foreLen = (opts.foreLen ?? 0.15) * size;
  const w = (opts.width ?? 0.09) * size;
  const speed = opts.swingSpeed ?? 4;
  const amt = opts.swingAmt ?? 0.35;
  const base = (opts.baseAngle ?? 0.3) * side;
  const phase = opts.phaseOffset ?? 0;
  const elbowBase = opts.elbowBend ?? 0.4;
  const atkBoost = opts.attackExtra ?? 0;
  const style = opts.style ?? 'armored';
  const trim = opts.trimColor ?? opts.colorDark;
  const hColor = opts.handColor ?? opts.color;
  const hR = (opts.handRadius ?? 0.04) * size;

  const swing = Math.sin(time * speed + phase) * amt
    + atkBoost * Math.sin(time * speed * 2) * 0.2;
  const shoulderA = opts.shoulderAngle ?? (base + swing);
  const elbowA = opts.elbowAngle ?? (elbowBase
    + Math.sin(time * speed + phase + 1.2) * 0.25 * side);

  const savedAlpha = ctx.globalAlpha;
  if (style === 'ghostly') ctx.globalAlpha *= 0.45;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(shoulderA);

  if (style === 'armored')
    renderArmoredArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, trim, elbowA);
  else if (style === 'bone')
    renderBoneArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, elbowA);
  else if (style === 'fleshy')
    renderFleshyArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, elbowA);
  else
    renderGhostlyArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, elbowA);

  if (opts.onWeapon) {
    opts.onWeapon(ctx);
  }

  ctx.restore();
  ctx.globalAlpha = savedAlpha;
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC: drawPathLegs
// ═══════════════════════════════════════════════════════════════════

export function drawPathLegs(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  size: number,
  time: number,
  zoom: number,
  opts: PathLegOptions,
): void {
  const halfLen = ((opts.legLen ?? 0.16) * size) / 2;
  const w = (opts.width ?? 0.08) * size;
  const speed = opts.strideSpeed ?? 5;
  const stride = opts.strideAmt ?? 0.3;
  const phase = opts.phaseOffset ?? 0;
  const isShuffle = opts.shuffle ?? false;
  const style = opts.style ?? 'armored';
  const trim = opts.trimColor ?? opts.colorDark;
  const fColor = opts.footColor ?? opts.colorDark;
  const fl = (opts.footLen ?? 0.1) * size;

  const savedAlpha = ctx.globalAlpha;
  if (style === 'ghostly') ctx.globalAlpha *= 0.45;

  for (let leg = 0; leg < 2; leg++) {
    const ls = leg === 0 ? -1 : 1;
    const lp = leg === 0 ? 0 : Math.PI;
    const sw = Math.sin(time * speed + lp + phase) * stride;
    const kb = Math.max(0, Math.sin(time * speed + lp + phase + 0.8)) * 0.3;
    const hx = hipX + ls * size * 0.08;

    ctx.save();
    ctx.translate(hx, hipY);
    ctx.rotate(sw * (isShuffle ? 0.5 : 1));

    if (style === 'armored')
      renderArmoredLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, trim, kb, ls);
    else if (style === 'bone')
      renderBoneLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, kb, ls);
    else if (style === 'fleshy')
      renderFleshyLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, kb, ls);
    else
      renderGhostlyLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, kb, ls);

    ctx.restore();
  }

  ctx.globalAlpha = savedAlpha;
}

// ═══════════════════════════════════════════════════════════════════
// DECORATIVE OVERLAYS — cover joints, add visual interest
// ═══════════════════════════════════════════════════════════════════

export function drawTatteredCloak(
  ctx: CanvasRenderingContext2D,
  cx: number, topY: number, size: number,
  width: number, length: number,
  color: string, colorDark: string,
  time: number,
): void {
  const sway = Math.sin(time * 2) * size * 0.01;
  const hw = width / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - hw, topY);
  ctx.quadraticCurveTo(cx - hw * 1.15, topY + length * 0.5, cx - hw * 0.7 + sway, topY + length);
  ctx.lineTo(cx + hw * 0.6 + sway, topY + length * 0.92);
  ctx.quadraticCurveTo(cx + hw * 1.05, topY + length * 0.4, cx + hw, topY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = colorDark;
  ctx.lineWidth = size * 0.003;
  for (let i = 0; i < 4; i++) {
    const tx = cx - hw * 0.5 + i * hw * 0.38 + sway;
    const baseY = topY + length * (0.82 + Math.sin(i * 1.7) * 0.1);
    ctx.beginPath();
    ctx.moveTo(tx, baseY);
    ctx.lineTo(tx + Math.sin(time * 1.5 + i) * size * 0.01,
      baseY + size * 0.02 + Math.sin(time + i) * size * 0.01);
    ctx.stroke();
  }
}

export function drawShoulderOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  side: -1 | 1,
  color: string, colorDark: string,
  type: 'plate' | 'round' | 'tattered',
): void {
  if (type === 'plate') {
    const grad = ctx.createLinearGradient(x - size * 0.07, y, x + size * 0.07, y);
    grad.addColorStop(0, colorDark);
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, colorDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.07, size * 0.045, side * 0.25, 0, TAU);
    ctx.fill();
    ctx.fillStyle = colorDark;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.01, size * 0.009, 0, TAU);
    ctx.fill();
  } else if (type === 'round') {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.055);
    grad.addColorStop(0, color);
    grad.addColorStop(1, colorDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.055, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - side * size * 0.02, y - size * 0.03);
    ctx.lineTo(x + side * size * 0.06, y - size * 0.005);
    ctx.lineTo(x + side * size * 0.04, y + size * 0.04);
    ctx.lineTo(x - side * size * 0.01, y + size * 0.03);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawBeltOverlay(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, size: number,
  halfWidth: number,
  color: string, colorDark: string,
  buckle?: string,
): void {
  const h = size * 0.025;
  ctx.fillStyle = color;
  ctx.fillRect(cx - halfWidth, y - h / 2, halfWidth * 2, h);
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = size * 0.003;
  ctx.strokeRect(cx - halfWidth, y - h / 2, halfWidth * 2, h);
  if (buckle) {
    ctx.fillStyle = buckle;
    ctx.fillRect(cx - size * 0.015, y - h * 0.7, size * 0.03, h * 1.4);
  }
}

export function drawGorget(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, size: number,
  width: number,
  color: string, colorDark: string,
): void {
  const hw = width / 2;
  const h = size * 0.035;
  const grad = ctx.createLinearGradient(cx - hw, y, cx + hw, y);
  grad.addColorStop(0, colorDark);
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, colorDark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - hw, y + h * 0.3);
  ctx.quadraticCurveTo(cx, y - h, cx + hw, y + h * 0.3);
  ctx.lineTo(cx + hw * 0.9, y + h);
  ctx.quadraticCurveTo(cx, y, cx - hw * 0.9, y + h);
  ctx.closePath();
  ctx.fill();
}

export function drawArmorSkirt(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, size: number,
  halfWidth: number, length: number,
  color: string, colorDark: string,
  panels: number,
): void {
  const pw = (halfWidth * 2) / panels;
  for (let i = 0; i < panels; i++) {
    const px = cx - halfWidth + i * pw;
    const splay = (i - (panels - 1) / 2) * size * 0.008;
    const grad = ctx.createLinearGradient(px, y, px + pw, y);
    grad.addColorStop(0, colorDark);
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, colorDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px + size * 0.003, y);
    ctx.lineTo(px - size * 0.005 + splay, y + length);
    ctx.lineTo(px + pw + size * 0.005 + splay, y + length);
    ctx.lineTo(px + pw - size * 0.003, y);
    ctx.closePath();
    ctx.fill();
  }
}
