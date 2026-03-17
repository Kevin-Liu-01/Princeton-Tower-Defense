// Princeton Tower Defense — Dark Fantasy Path-Based Body Helpers
// Renders arms and legs using overlapping-plate technique matching
// troop sprite quality. Bulky, wide, no gaps between segments.

import { lightenColor } from "../../utils";

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
  time: number,
): void {
  // Base pauldron shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, w * 0.2, w * 1.7, w * 1.2, 0, 0, TAU);
  ctx.fill();

  // Ornate Pauldron
  const padGrad = ctx.createLinearGradient(-w * 1.8, -w * 0.5, w * 1.8, w * 0.5);
  padGrad.addColorStop(0, colorDark);
  padGrad.addColorStop(0.3, color);
  padGrad.addColorStop(0.5, lightenColor(color, 20));
  padGrad.addColorStop(0.7, color);
  padGrad.addColorStop(1, colorDark);
  ctx.fillStyle = padGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 1.7, w * 1.15, 0, 0, TAU);
  ctx.fill();

  // Pauldron Trim and Spikes
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(1, zoom * 1.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 1.6, w * 1.05, 0, 0, TAU);
  ctx.stroke();

  // Pauldron runes (glowing)
  const pulse = (Math.sin(time * 3) + 1) / 2;
  ctx.fillStyle = `rgba(255, 200, 50, ${0.3 + pulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(0, -w * 0.4, w * 0.15, 0, TAU);
  ctx.fill();
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.arc(0, -w * 0.4, w * 0.08, 0, TAU);
  ctx.fill();

  // Spikes on pauldron
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.moveTo(-w * 1.2, -w * 0.5);
  ctx.lineTo(-w * 1.8, -w * 1.2);
  ctx.lineTo(-w * 0.8, -w * 0.8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 1.2, -w * 0.5);
  ctx.lineTo(w * 1.8, -w * 1.2);
  ctx.lineTo(w * 0.8, -w * 0.8);
  ctx.fill();

  // Upper arm plate (layered)
  const uGrad = ctx.createLinearGradient(-w * 1.2, 0, w * 1.2, 0);
  uGrad.addColorStop(0, colorDark);
  uGrad.addColorStop(0.5, color);
  uGrad.addColorStop(1, colorDark);
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.2, w * 0.15);
  ctx.lineTo(-w * 1.05, upperLen);
  ctx.lineTo(w * 1.05, upperLen);
  ctx.lineTo(w * 1.2, w * 0.15);
  ctx.closePath();
  ctx.fill();

  // Center ridge with gold trim
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(1, zoom * 1.2);
  ctx.beginPath();
  ctx.moveTo(0, w * 0.4);
  ctx.lineTo(0, upperLen - w * 0.2);
  ctx.stroke();

  // Overlapping plates
  ctx.lineWidth = Math.max(0.6, zoom * 0.8);
  ctx.strokeStyle = colorDark;
  for (let i = 1; i <= 3; i++) {
    const py = upperLen * (i * 0.25);
    ctx.beginPath();
    ctx.moveTo(-w * 1.1, py);
    ctx.quadraticCurveTo(0, py + w * 0.3, w * 1.1, py);
    ctx.stroke();
  }

  // Elbow cop (more imposing)
  const eCGrad = ctx.createRadialGradient(0, upperLen, 0, 0, upperLen, w * 1.5);
  eCGrad.addColorStop(0, lightenColor(color, 15));
  eCGrad.addColorStop(0.6, color);
  eCGrad.addColorStop(1, colorDark);
  ctx.fillStyle = eCGrad;
  ctx.beginPath();
  ctx.ellipse(0, upperLen, w * 1.5, w * 1.0, 0, 0, TAU);
  ctx.fill();
  
  // Elbow spike
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.4, upperLen);
  ctx.lineTo(0, upperLen + w * 1.8);
  ctx.lineTo(w * 0.4, upperLen);
  ctx.fill();

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Vambrace
  const fGrad = ctx.createLinearGradient(-w * 1.1, 0, w * 1.1, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.5, color);
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, -w * 0.35);
  ctx.lineTo(-w * 0.9, foreLen);
  ctx.lineTo(w * 0.9, foreLen);
  ctx.lineTo(w * 1.1, -w * 0.35);
  ctx.closePath();
  ctx.fill();

  // Vambrace intricate trim
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(1, zoom * 1.2);
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, 0);
  ctx.lineTo(0, foreLen - w * 0.5);
  ctx.lineTo(w * 0.5, 0);
  ctx.stroke();

  // Gauntlet
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.moveTo(-w * 0.85, foreLen - w * 0.2);
  ctx.lineTo(-w * 0.9, foreLen + hR * 1.1);
  ctx.lineTo(w * 0.9, foreLen + hR * 1.1);
  ctx.lineTo(w * 0.85, foreLen - w * 0.2);
  ctx.closePath();
  ctx.fill();
  
  // Gauntlet armor plates
  ctx.fillStyle = trimColor;
  ctx.fillRect(-w * 0.8, foreLen, w * 1.6, w * 0.3);
  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.arc(0, foreLen + hR * 0.8, hR * 0.9, 0, TAU);
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
  time: number,
): void {
  // Thigh plate (detailed)
  const tGrad = ctx.createLinearGradient(-w * 1.2, 0, w * 1.2, 0);
  tGrad.addColorStop(0, colorDark);
  tGrad.addColorStop(0.5, color);
  tGrad.addColorStop(1, colorDark);
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.2, 0);
  ctx.lineTo(-w * 1.05, halfLen);
  ctx.lineTo(w * 1.05, halfLen);
  ctx.lineTo(w * 1.2, 0);
  ctx.closePath();
  ctx.fill();

  // Thigh trim and layers
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = Math.max(1, 1.2 * zoom);
  for (let i = 1; i <= 3; i++) {
    const py = halfLen * (i * 0.25);
    ctx.beginPath();
    ctx.moveTo(-w * 1.1, py);
    ctx.quadraticCurveTo(0, py + w * 0.4, w * 1.1, py);
    ctx.stroke();
  }

  // Trim stripe
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(1.5, 2 * zoom);
  ctx.beginPath();
  ctx.moveTo(ls * w * 0.65, w * 0.2);
  ctx.lineTo(ls * w * 0.5, halfLen - w * 0.1);
  ctx.stroke();

  // Knee guard (heavy)
  const kGrad = ctx.createRadialGradient(0, halfLen, 0, 0, halfLen, w * 1.5);
  kGrad.addColorStop(0, lightenColor(color, 15));
  kGrad.addColorStop(0.5, color);
  kGrad.addColorStop(1, colorDark);
  ctx.fillStyle = kGrad;
  ctx.beginPath();
  ctx.ellipse(0, halfLen, w * 1.5, w * 1.1, 0, 0, TAU);
  ctx.fill();

  // Knee spike
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, halfLen);
  ctx.lineTo(0, halfLen + w * 1.6);
  ctx.lineTo(w * 0.5, halfLen);
  ctx.fill();

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Greave (flared)
  const gGrad = ctx.createLinearGradient(-w * 1.1, 0, w * 1.1, 0);
  gGrad.addColorStop(0, colorDark);
  gGrad.addColorStop(0.4, color);
  gGrad.addColorStop(1, colorDark);
  ctx.fillStyle = gGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, -w * 0.3);
  ctx.quadraticCurveTo(-w * 0.7, halfLen * 0.5, -w * 0.95, halfLen);
  ctx.lineTo(w * 0.95, halfLen);
  ctx.quadraticCurveTo(w * 0.7, halfLen * 0.5, w * 1.1, -w * 0.3);
  ctx.closePath();
  ctx.fill();

  // Greave trim
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(1, 1.5 * zoom);
  ctx.beginPath();
  ctx.moveTo(0, w * 0.1);
  ctx.lineTo(0, halfLen - w * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, halfLen * 0.5);
  ctx.lineTo(0, halfLen - w * 0.2);
  ctx.lineTo(w * 0.5, halfLen * 0.5);
  ctx.stroke();

  // Sabaton (Armored Boot)
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.moveTo(-w * 0.9, halfLen - w * 0.2);
  ctx.lineTo(-w * 0.75, halfLen + w * 0.55);
  ctx.lineTo(fl * 0.85, halfLen + w * 0.55);
  ctx.lineTo(fl * 0.95, halfLen - w * 0.1);
  ctx.closePath();
  ctx.fill();
  
  // Sabaton plates
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, halfLen + w * 0.1);
  ctx.lineTo(fl * 0.6, halfLen + w * 0.2);
  ctx.lineTo(fl * 0.7, halfLen + w * 0.55);
  ctx.lineTo(-w * 0.6, halfLen + w * 0.55);
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
  time: number,
): void {
  const pulse = (Math.sin(time * 4) + 1) / 2;
  const glowAlpha = 0.4 + pulse * 0.4;
  const glowColor = `rgba(120, 255, 150, ${glowAlpha})`;

  // Necromantic glow behind joint
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.5, 0, TAU);
  ctx.fill();

  // Shoulder ball with spikes
  const sGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.3);
  sGrad.addColorStop(0, lightenColor(color, 20));
  sGrad.addColorStop(0.6, color);
  sGrad.addColorStop(1, colorDark);
  ctx.fillStyle = sGrad;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.3, 0, TAU);
  ctx.fill();
  
  // Shoulder bone spikes
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.moveTo(-w * 0.8, -w * 0.8);
  ctx.lineTo(-w * 2.2, -w * 1.5);
  ctx.lineTo(-w * 0.4, -w * 1.0);
  ctx.fill();

  // Humerus
  const uGrad = ctx.createLinearGradient(-w * 1.1, 0, w * 1.1, 0);
  uGrad.addColorStop(0, colorDark);
  uGrad.addColorStop(0.25, color);
  uGrad.addColorStop(0.5, lightenColor(color, 10));
  uGrad.addColorStop(0.75, color);
  uGrad.addColorStop(1, colorDark);
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.9, -w * 0.25);
  ctx.quadraticCurveTo(-w * 0.5, upperLen * 0.5, -w * 0.9, upperLen + w * 0.2);
  ctx.lineTo(w * 0.9, upperLen + w * 0.2);
  ctx.quadraticCurveTo(w * 0.5, upperLen * 0.5, w * 0.9, -w * 0.25);
  ctx.closePath();
  ctx.fill();

  // Glowing bone cracks
  ctx.strokeStyle = `rgba(120, 255, 150, ${0.5 + pulse * 0.5})`;
  ctx.lineWidth = Math.max(1, 1.5 * zoom);
  ctx.beginPath();
  ctx.moveTo(w * 0.2, upperLen * 0.2);
  ctx.lineTo(-w * 0.15, upperLen * 0.42);
  ctx.lineTo(w * 0.1, upperLen * 0.6);
  ctx.stroke();

  // Elbow ball with glow
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(0, upperLen, w * 1.3, 0, TAU);
  ctx.fill();

  const eGrad = ctx.createRadialGradient(0, upperLen, 0, 0, upperLen, w * 1.25);
  eGrad.addColorStop(0, lightenColor(color, 20));
  eGrad.addColorStop(0.55, color);
  eGrad.addColorStop(1, colorDark);
  ctx.fillStyle = eGrad;
  ctx.beginPath();
  ctx.arc(0, upperLen, w * 1.25, 0, TAU);
  ctx.fill();
  
  // Elbow bone spike
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, upperLen);
  ctx.lineTo(-w * 2.0, upperLen + w * 1.0);
  ctx.lineTo(-w * 0.2, upperLen + w * 0.5);
  ctx.fill();

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Radius / ulna (more jagged)
  const fGrad = ctx.createLinearGradient(-w * 0.9, 0, w * 0.9, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.3, color);
  fGrad.addColorStop(0.7, color);
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.8, -w * 0.35);
  ctx.quadraticCurveTo(-w * 0.4, foreLen * 0.5, -w * 0.7, foreLen);
  ctx.lineTo(w * 0.7, foreLen);
  ctx.quadraticCurveTo(w * 0.4, foreLen * 0.5, w * 0.8, -w * 0.35);
  ctx.closePath();
  ctx.fill();
  
  // Glowing crack on forearm
  ctx.strokeStyle = `rgba(120, 255, 150, ${0.4 + pulse * 0.4})`;
  ctx.lineWidth = Math.max(0.8, 1.2 * zoom);
  ctx.beginPath();
  ctx.moveTo(0, foreLen * 0.3);
  ctx.lineTo(-w * 0.2, foreLen * 0.5);
  ctx.lineTo(w * 0.1, foreLen * 0.7);
  ctx.stroke();

  // Bony hand (sharper claws)
  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.65, foreLen - w * 0.1);
  ctx.lineTo(-w * 0.85, foreLen + hR * 1.2);
  ctx.lineTo(-w * 0.2, foreLen + hR * 2.0);
  ctx.lineTo(w * 0.2, foreLen + hR * 2.2);
  ctx.lineTo(w * 0.8, foreLen + hR * 1.3);
  ctx.lineTo(w * 0.6, foreLen - w * 0.1);
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
  time: number,
): void {
  const pulse = (Math.sin(time * 3.5 + 1) + 1) / 2;
  const glowAlpha = 0.3 + pulse * 0.5;
  const glowColor = `rgba(120, 255, 150, ${glowAlpha})`;

  // Hip ball glow
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.3, 0, TAU);
  ctx.fill();

  // Hip ball
  const hGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.15);
  hGrad.addColorStop(0, lightenColor(color, 20));
  hGrad.addColorStop(0.6, color);
  hGrad.addColorStop(1, colorDark);
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(0, 0, w * 1.15, 0, TAU);
  ctx.fill();

  // Femur
  const fGrad = ctx.createLinearGradient(-w * 1.0, 0, w * 1.0, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.25, color);
  fGrad.addColorStop(0.5, lightenColor(color, 15));
  fGrad.addColorStop(0.75, color);
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.85, -w * 0.2);
  ctx.quadraticCurveTo(-w * 0.45, halfLen * 0.5, -w * 0.8, halfLen + w * 0.15);
  ctx.lineTo(w * 0.8, halfLen + w * 0.15);
  ctx.quadraticCurveTo(w * 0.45, halfLen * 0.5, w * 0.85, -w * 0.2);
  ctx.closePath();
  ctx.fill();
  
  // Femur glowing cracks
  ctx.strokeStyle = `rgba(120, 255, 150, ${0.4 + pulse * 0.5})`;
  ctx.lineWidth = Math.max(1, 1.5 * zoom);
  ctx.beginPath();
  ctx.moveTo(-w * 0.2, halfLen * 0.2);
  ctx.lineTo(w * 0.1, halfLen * 0.5);
  ctx.lineTo(-w * 0.1, halfLen * 0.7);
  ctx.stroke();

  // Knee ball
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(0, halfLen, w * 1.2, 0, TAU);
  ctx.fill();

  const kGrad = ctx.createRadialGradient(0, halfLen, 0, 0, halfLen, w * 1.1);
  kGrad.addColorStop(0, lightenColor(color, 20));
  kGrad.addColorStop(0.55, color);
  kGrad.addColorStop(1, colorDark);
  ctx.fillStyle = kGrad;
  ctx.beginPath();
  ctx.arc(0, halfLen, w * 1.1, 0, TAU);
  ctx.fill();
  
  // Knee spike
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, halfLen);
  ctx.lineTo(0, halfLen + w * 1.5);
  ctx.lineTo(w * 0.3, halfLen);
  ctx.fill();

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Tibia
  const tGrad = ctx.createLinearGradient(-w * 0.8, 0, w * 0.8, 0);
  tGrad.addColorStop(0, colorDark);
  tGrad.addColorStop(0.5, color);
  tGrad.addColorStop(1, colorDark);
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.75, -w * 0.3);
  ctx.quadraticCurveTo(-w * 0.3, halfLen * 0.5, -w * 0.6, halfLen);
  ctx.lineTo(w * 0.6, halfLen);
  ctx.quadraticCurveTo(w * 0.3, halfLen * 0.5, w * 0.75, -w * 0.3);
  ctx.closePath();
  ctx.fill();

  // Skeletal foot (sharper)
  ctx.fillStyle = footColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.55, halfLen - w * 0.1);
  ctx.lineTo(-w * 0.3, halfLen + w * 0.4);
  ctx.lineTo(fl * 0.7, halfLen + w * 0.45);
  ctx.lineTo(fl * 0.8, halfLen + w * 0.1);
  ctx.lineTo(w * 0.4, halfLen - w * 0.1);
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
  time: number,
): void {
  // Upper arm — thick organic slab
  const uGrad = ctx.createLinearGradient(-w * 1.5, 0, w * 1.5, 0);
  uGrad.addColorStop(0, colorDark);
  uGrad.addColorStop(0.3, color);
  uGrad.addColorStop(0.7, lightenColor(color, 10));
  uGrad.addColorStop(1, colorDark);
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.25, -w * 0.35);
  ctx.quadraticCurveTo(-w * 1.8, upperLen * 0.4, -w * 1.2, upperLen + w * 0.5);
  ctx.lineTo(w * 1.2, upperLen + w * 0.5);
  ctx.quadraticCurveTo(w * 1.8, upperLen * 0.4, w * 1.25, -w * 0.35);
  ctx.closePath();
  ctx.fill();

  // Pulsing veins
  const pulse = Math.sin(time * 2) * 0.5 + 0.5;
  ctx.strokeStyle = `rgba(80, 20, 30, ${0.4 + pulse * 0.4})`;
  ctx.lineWidth = Math.max(1, 1.5 * zoom);
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, 0);
  ctx.quadraticCurveTo(-w * 1.0, upperLen * 0.5, 0, upperLen);
  ctx.stroke();

  // Gross pustules
  ctx.fillStyle = `rgba(180, 160, 60, ${0.7 + pulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(w * 0.8, upperLen * 0.3, w * 0.4, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(120, 100, 30, 0.6)`;
  ctx.beginPath();
  ctx.arc(w * 0.9, upperLen * 0.3, w * 0.2, 0, TAU);
  ctx.fill();

  // Stitch across upper arm
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = Math.max(0.8, 1.2 * zoom);
  ctx.beginPath();
  ctx.moveTo(-w * 0.8, upperLen * 0.3);
  ctx.lineTo(w * 0.7, upperLen * 0.55);
  ctx.stroke();
  for (let s = 0; s < 4; s++) {
    const t = (s + 0.5) / 4;
    const sx = -w * 0.8 + t * w * 1.5;
    const sy = upperLen * 0.3 + t * upperLen * 0.25;
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.2, sy - w * 0.2);
    ctx.lineTo(sx + w * 0.2, sy + w * 0.2);
    ctx.stroke();
  }

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Forearm — overlaps generously, mutated
  const fGrad = ctx.createLinearGradient(-w * 1.2, 0, w * 1.2, 0);
  fGrad.addColorStop(0, colorDark);
  fGrad.addColorStop(0.35, color);
  fGrad.addColorStop(0.65, lightenColor(color, 5));
  fGrad.addColorStop(1, colorDark);
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.15, -w * 0.55);
  ctx.quadraticCurveTo(-w * 1.5, foreLen * 0.35, -w * 0.9, foreLen);
  ctx.lineTo(w * 0.9, foreLen);
  ctx.quadraticCurveTo(w * 1.5, foreLen * 0.35, w * 1.15, -w * 0.55);
  ctx.closePath();
  ctx.fill();

  // More veins
  ctx.strokeStyle = `rgba(80, 20, 30, ${0.5 + pulse * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w * 0.8, foreLen * 0.5, -w * 0.2, foreLen);
  ctx.stroke();

  // Misshapen fist/claw
  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.75, foreLen - w * 0.2);
  ctx.quadraticCurveTo(-w * 1.0, foreLen + hR * 0.8, -w * 0.3, foreLen + hR * 1.8);
  ctx.quadraticCurveTo(w * 0.2, foreLen + hR * 2.2, w * 0.7, foreLen + hR * 0.9);
  ctx.quadraticCurveTo(w * 0.8, foreLen, w * 0.65, foreLen - w * 0.2);
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
  time: number,
): void {
  // Thick thigh
  const tGrad = ctx.createLinearGradient(-w * 1.5, 0, w * 1.5, 0);
  tGrad.addColorStop(0, colorDark);
  tGrad.addColorStop(0.3, color);
  tGrad.addColorStop(0.7, lightenColor(color, 10));
  tGrad.addColorStop(1, colorDark);
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.25, -w * 0.2);
  ctx.quadraticCurveTo(-w * 1.7, halfLen * 0.35, -w * 1.15, halfLen + w * 0.45);
  ctx.lineTo(w * 1.15, halfLen + w * 0.45);
  ctx.quadraticCurveTo(w * 1.7, halfLen * 0.35, w * 1.25, -w * 0.2);
  ctx.closePath();
  ctx.fill();

  // Pulse veins
  const pulse = Math.sin(time * 2) * 0.5 + 0.5;
  ctx.strokeStyle = `rgba(80, 20, 30, ${0.4 + pulse * 0.4})`;
  ctx.lineWidth = Math.max(1, 1.5 * zoom);
  ctx.beginPath();
  ctx.moveTo(w * 0.2, 0);
  ctx.quadraticCurveTo(w * 1.0, halfLen * 0.5, 0, halfLen);
  ctx.stroke();

  // Stitch
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = Math.max(0.6, 1.0 * zoom);
  ctx.beginPath();
  ctx.moveTo(-w * 0.7, halfLen * 0.4);
  ctx.lineTo(w * 0.6, halfLen * 0.6);
  ctx.stroke();
  for (let s = 0; s < 3; s++) {
    const t = (s + 0.5) / 3;
    const sx = -w * 0.7 + t * w * 1.3;
    const sy = halfLen * 0.4 + t * halfLen * 0.2;
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.2, sy - w * 0.2);
    ctx.lineTo(sx + w * 0.2, sy + w * 0.2);
    ctx.stroke();
  }

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Calf (swollen)
  const cGrad = ctx.createLinearGradient(-w * 1.2, 0, w * 1.2, 0);
  cGrad.addColorStop(0, colorDark);
  cGrad.addColorStop(0.35, color);
  cGrad.addColorStop(0.65, lightenColor(color, 5));
  cGrad.addColorStop(1, colorDark);
  ctx.fillStyle = cGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, -w * 0.5);
  ctx.quadraticCurveTo(-w * 1.4, halfLen * 0.35, -w * 0.8, halfLen);
  ctx.lineTo(w * 0.8, halfLen);
  ctx.quadraticCurveTo(w * 1.4, halfLen * 0.35, w * 1.1, -w * 0.5);
  ctx.closePath();
  ctx.fill();

  // Chunky mutated foot
  ctx.fillStyle = footColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.7, halfLen - w * 0.2);
  ctx.quadraticCurveTo(-w * 0.9, halfLen + w * 0.6, fl * 0.3, halfLen + w * 0.65);
  ctx.lineTo(fl * 0.8, halfLen + w * 0.3);
  ctx.quadraticCurveTo(fl * 0.6, halfLen - w * 0.1, w * 0.4, halfLen - w * 0.3);
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
  time: number,
): void {
  // Ethereal core
  const corePulse = (Math.sin(time * 5) + 1) / 2;
  const coreAlpha = 0.5 + corePulse * 0.5;
  ctx.fillStyle = `rgba(200, 255, 255, ${coreAlpha * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(0, upperLen * 0.5, w * 0.5, upperLen * 0.6, 0, 0, TAU);
  ctx.fill();

  // Broad upper wisp
  const uGrad = ctx.createLinearGradient(0, -w * 0.3, 0, upperLen + w * 0.5);
  uGrad.addColorStop(0, lightenColor(color, 20));
  uGrad.addColorStop(0.4, color);
  uGrad.addColorStop(0.7, colorDark);
  uGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = uGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.3, -w * 0.35);
  ctx.quadraticCurveTo(-w * 1.8, upperLen * 0.3, -w * 0.85, upperLen + w * 0.5);
  ctx.lineTo(w * 0.85, upperLen + w * 0.5);
  ctx.quadraticCurveTo(w * 1.8, upperLen * 0.3, w * 1.3, -w * 0.35);
  ctx.closePath();
  ctx.fill();

  // Inner dark wisp
  ctx.fillStyle = `rgba(0, 0, 0, 0.4)`;
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, 0);
  ctx.quadraticCurveTo(-w * 0.8, upperLen * 0.4, 0, upperLen);
  ctx.lineTo(w * 0.2, upperLen);
  ctx.quadraticCurveTo(w * 0.8, upperLen * 0.4, w * 0.5, 0);
  ctx.fill();

  ctx.translate(0, upperLen);
  ctx.rotate(elbowA);

  // Lower wisp core
  ctx.fillStyle = `rgba(200, 255, 255, ${coreAlpha * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(0, foreLen * 0.5, w * 0.4, foreLen * 0.6, 0, 0, TAU);
  ctx.fill();

  // Lower wisp — fading
  const fGrad = ctx.createLinearGradient(0, -w * 0.5, 0, foreLen + hR * 2.0);
  fGrad.addColorStop(0, color);
  fGrad.addColorStop(0.4, colorDark);
  fGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.1, -w * 0.5);
  ctx.quadraticCurveTo(-w * 1.4, foreLen * 0.3, -w * 0.4, foreLen + hR * 1.5);
  ctx.lineTo(w * 0.4, foreLen + hR * 1.5);
  ctx.quadraticCurveTo(w * 1.4, foreLen * 0.3, w * 1.1, -w * 0.5);
  ctx.closePath();
  ctx.fill();

  // Wispy claws (elongated, trailing)
  ctx.strokeStyle = handColor;
  ctx.lineWidth = w * 0.4;
  ctx.lineCap = 'round';
  const clawSway = Math.sin(time * 3);
  for (let c = 0; c < 4; c++) {
    const ca = (c - 1.5) * 0.4 + clawSway * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, foreLen);
    ctx.quadraticCurveTo(
      Math.sin(ca) * hR * 2.0, foreLen + hR * 1.5,
      Math.sin(ca) * hR * 3.5, foreLen + hR * 3.5,
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
  time: number,
): void {
  // Upper tendril
  const tGrad = ctx.createLinearGradient(0, -w * 0.2, 0, halfLen + w * 0.5);
  tGrad.addColorStop(0, lightenColor(color, 20));
  tGrad.addColorStop(0.5, color);
  tGrad.addColorStop(0.8, colorDark);
  tGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 1.2, -w * 0.2);
  ctx.quadraticCurveTo(-w * 1.5, halfLen * 0.3, -w * 0.75, halfLen + w * 0.4);
  ctx.lineTo(w * 0.75, halfLen + w * 0.4);
  ctx.quadraticCurveTo(w * 1.5, halfLen * 0.3, w * 1.2, -w * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.translate(0, halfLen);
  ctx.rotate(kneeBend * ls * 0.5);

  // Lower tendril — fading
  const cGrad = ctx.createLinearGradient(0, -w * 0.35, 0, halfLen + w * 1.0);
  cGrad.addColorStop(0, color);
  cGrad.addColorStop(0.4, colorDark);
  cGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.9, -w * 0.35);
  ctx.quadraticCurveTo(-w * 1.2, halfLen * 0.3, -w * 0.2, halfLen + w * 1.0);
  ctx.lineTo(w * 0.2, halfLen + w * 1.0);
  ctx.quadraticCurveTo(w * 1.2, halfLen * 0.3, w * 0.9, -w * 0.35);
  ctx.closePath();
  ctx.fill();
  
  // Extra phantom trails
  ctx.fillStyle = colorDark;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.4, 0);
  ctx.quadraticCurveTo(-w * 0.8, halfLen * 0.5, -w * 0.5, halfLen + w * 1.5);
  ctx.lineTo(w * 0.1, halfLen + w * 1.2);
  ctx.quadraticCurveTo(w * 0.5, halfLen * 0.5, w * 0.2, 0);
  ctx.fill();
  ctx.globalAlpha = 1.0;
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
    renderArmoredArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, trim, elbowA, time);
  else if (style === 'bone')
    renderBoneArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, elbowA, time);
  else if (style === 'fleshy')
    renderFleshyArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, elbowA, time);
  else
    renderGhostlyArm(ctx, w, upperLen, foreLen, hR, zoom, opts.color, opts.colorDark, hColor, elbowA, time);

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
      renderArmoredLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, trim, kb, ls, time);
    else if (style === 'bone')
      renderBoneLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, kb, ls, time);
    else if (style === 'fleshy')
      renderFleshyLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, kb, ls, time);
    else
      renderGhostlyLeg(ctx, w, halfLen, fl, zoom, opts.color, opts.colorDark, fColor, kb, ls, time);

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
  const sway = Math.sin(time * 2) * size * 0.02;
  const hw = width / 2;
  
  // Back shadow layer
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.moveTo(cx - hw * 0.8, topY + size * 0.05);
  ctx.quadraticCurveTo(cx - hw * 1.0, topY + length * 0.6, cx - hw * 0.6 + sway * 1.5, topY + length * 1.1);
  ctx.lineTo(cx + hw * 0.5 + sway * 1.5, topY + length * 1.0);
  ctx.quadraticCurveTo(cx + hw * 0.9, topY + length * 0.5, cx + hw * 0.8, topY + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Main cloak gradient
  const grad = ctx.createLinearGradient(cx - hw, topY, cx + hw, topY + length);
  grad.addColorStop(0, lightenColor(color, 10));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, colorDark);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - hw, topY);
  ctx.quadraticCurveTo(cx - hw * 1.2, topY + length * 0.5, cx - hw * 0.7 + sway, topY + length);
  ctx.lineTo(cx - hw * 0.3 + sway * 1.2, topY + length * 0.85); // jagged tear
  ctx.lineTo(cx + hw * 0.1 + sway * 0.8, topY + length * 0.95);
  ctx.lineTo(cx + hw * 0.6 + sway, topY + length * 0.92);
  ctx.quadraticCurveTo(cx + hw * 1.1, topY + length * 0.4, cx + hw, topY);
  ctx.closePath();
  ctx.fill();

  // Cloth folds/creases
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = Math.max(1, size * 0.005);
  for (let i = 1; i <= 3; i++) {
    const tx = cx - hw * 0.6 + i * hw * 0.4 + sway * (0.5 + i * 0.1);
    const baseY = topY + length * 0.9;
    ctx.beginPath();
    ctx.moveTo(cx - hw * 0.3 + i * hw * 0.15, topY + length * 0.1);
    ctx.quadraticCurveTo(tx - size * 0.05, topY + length * 0.5, tx, baseY);
    ctx.stroke();
  }

  // Tattered threads
  ctx.lineWidth = Math.max(0.5, size * 0.003);
  for (let i = 0; i < 5; i++) {
    const tx = cx - hw * 0.5 + i * hw * 0.3 + sway;
    const baseY = topY + length * (0.8 + Math.sin(i * 1.7) * 0.15);
    ctx.beginPath();
    ctx.moveTo(tx, baseY);
    ctx.quadraticCurveTo(
      tx + Math.sin(time * 1.5 + i) * size * 0.02, baseY + size * 0.03,
      tx + Math.sin(time * 2 + i) * size * 0.03, baseY + size * 0.05 + Math.sin(time + i) * size * 0.02
    );
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
    // Multi-layered plate
    const grad1 = ctx.createLinearGradient(x - size * 0.09, y, x + size * 0.09, y);
    grad1.addColorStop(0, colorDark);
    grad1.addColorStop(0.5, lightenColor(color, 15));
    grad1.addColorStop(1, colorDark);
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.08, size * 0.055, side * 0.25, 0, TAU);
    ctx.fill();

    const grad2 = ctx.createLinearGradient(x - size * 0.07, y, x + size * 0.07, y);
    grad2.addColorStop(0, colorDark);
    grad2.addColorStop(0.5, color);
    grad2.addColorStop(1, colorDark);
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.01, size * 0.06, size * 0.04, side * 0.25, 0, TAU);
    ctx.fill();

    // Rivets and spikes
    ctx.fillStyle = colorDark;
    ctx.beginPath();
    ctx.arc(x - side * size * 0.03, y - size * 0.01, size * 0.01, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + side * size * 0.03, y - size * 0.01, size * 0.01, 0, TAU);
    ctx.fill();

    ctx.fillStyle = lightenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.03);
    ctx.lineTo(x - side * size * 0.01, y - size * 0.08);
    ctx.lineTo(x + side * size * 0.01, y - size * 0.08);
    ctx.fill();

  } else if (type === 'round') {
    const grad = ctx.createRadialGradient(x, y - size * 0.01, 0, x, y, size * 0.07);
    grad.addColorStop(0, lightenColor(color, 15));
    grad.addColorStop(0.6, color);
    grad.addColorStop(1, colorDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.065, 0, TAU);
    ctx.fill();
    
    // Spiked ring
    ctx.strokeStyle = colorDark;
    ctx.lineWidth = size * 0.005;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.05, 0, TAU);
    ctx.stroke();

  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - side * size * 0.03, y - size * 0.04);
    ctx.lineTo(x + side * size * 0.07, y - size * 0.01);
    ctx.lineTo(x + side * size * 0.05, y + size * 0.06);
    ctx.lineTo(x - side * size * 0.02, y + size * 0.05);
    ctx.closePath();
    ctx.fill();
    
    // extra tattered piece
    ctx.fillStyle = colorDark;
    ctx.beginPath();
    ctx.moveTo(x - side * size * 0.01, y);
    ctx.lineTo(x + side * size * 0.04, y + size * 0.08);
    ctx.lineTo(x + side * size * 0.01, y + size * 0.07);
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
  const h = size * 0.04;
  
  // Belt shadow/depth
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(cx - halfWidth, y - h / 2 + size * 0.01, halfWidth * 2, h);

  // Main belt band
  const grad = ctx.createLinearGradient(cx - halfWidth, y, cx + halfWidth, y);
  grad.addColorStop(0, colorDark);
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, colorDark);
  ctx.fillStyle = grad;
  ctx.fillRect(cx - halfWidth, y - h / 2, halfWidth * 2, h);

  // Belt trims
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = size * 0.005;
  ctx.strokeRect(cx - halfWidth, y - h / 2, halfWidth * 2, h);
  
  // Etched details
  ctx.beginPath();
  ctx.moveTo(cx - halfWidth * 0.8, y - h * 0.2);
  ctx.lineTo(cx + halfWidth * 0.8, y - h * 0.2);
  ctx.moveTo(cx - halfWidth * 0.8, y + h * 0.2);
  ctx.lineTo(cx + halfWidth * 0.8, y + h * 0.2);
  ctx.stroke();

  if (buckle) {
    // Buckle base
    ctx.fillStyle = colorDark;
    ctx.fillRect(cx - size * 0.03, y - h * 0.9, size * 0.06, h * 1.8);
    
    // Buckle outer rim
    ctx.fillStyle = buckle;
    ctx.fillRect(cx - size * 0.025, y - h * 0.8, size * 0.05, h * 1.6);
    
    // Buckle inner hole
    ctx.fillStyle = colorDark;
    ctx.fillRect(cx - size * 0.01, y - h * 0.5, size * 0.02, h * 1.0);
    
    // Buckle prong
    ctx.fillStyle = buckle;
    ctx.fillRect(cx - size * 0.005, y - h * 0.5, size * 0.02, h * 0.8);
  }
}

export function drawGorget(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, size: number,
  width: number,
  color: string, colorDark: string,
): void {
  const hw = width / 2;
  const h = size * 0.05;
  
  // Under-shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.5, hw * 1.1, h * 0.8, 0, 0, TAU);
  ctx.fill();

  const grad = ctx.createLinearGradient(cx - hw, y, cx + hw, y);
  grad.addColorStop(0, colorDark);
  grad.addColorStop(0.5, lightenColor(color, 15));
  grad.addColorStop(1, colorDark);
  
  // Layer 1 (bottom plate)
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.moveTo(cx - hw * 1.1, y + h * 0.5);
  ctx.quadraticCurveTo(cx, y - h * 1.2, cx + hw * 1.1, y + h * 0.5);
  ctx.lineTo(cx + hw, y + h * 1.3);
  ctx.quadraticCurveTo(cx, y + h * 0.3, cx - hw, y + h * 1.3);
  ctx.closePath();
  ctx.fill();

  // Layer 2 (main plate)
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - hw, y + h * 0.3);
  ctx.quadraticCurveTo(cx, y - h, cx + hw, y + h * 0.3);
  ctx.lineTo(cx + hw * 0.9, y + h);
  ctx.quadraticCurveTo(cx, y + h * 0.2, cx - hw * 0.9, y + h);
  ctx.closePath();
  ctx.fill();
  
  // Gorget trims and rivets
  ctx.strokeStyle = colorDark;
  ctx.lineWidth = size * 0.005;
  ctx.stroke();
  
  ctx.fillStyle = colorDark;
  ctx.beginPath();
  ctx.arc(cx - hw * 0.6, y + h * 0.4, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + hw * 0.6, y + h * 0.4, size * 0.008, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.6, size * 0.008, 0, TAU);
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
  
  // Draw back panels first (darker)
  for (let i = 0; i < panels + 1; i++) {
    const px = cx - halfWidth - pw * 0.5 + i * pw;
    const splay = (i - panels / 2) * size * 0.012;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px + splay, y + length * 1.1);
    ctx.lineTo(px + pw + splay, y + length * 1.1);
    ctx.lineTo(px + pw, y);
    ctx.closePath();
    ctx.fill();
  }

  // Draw front panels
  for (let i = 0; i < panels; i++) {
    const px = cx - halfWidth + i * pw;
    const splay = (i - (panels - 1) / 2) * size * 0.01;
    const grad = ctx.createLinearGradient(px, y, px + pw, y);
    grad.addColorStop(0, colorDark);
    grad.addColorStop(0.5, lightenColor(color, 10));
    grad.addColorStop(1, colorDark);
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px + size * 0.003, y);
    ctx.lineTo(px - size * 0.005 + splay, y + length);
    ctx.lineTo(px + pw + size * 0.005 + splay, y + length);
    ctx.lineTo(px + pw - size * 0.003, y);
    ctx.closePath();
    ctx.fill();
    
    // Panel trim
    ctx.strokeStyle = colorDark;
    ctx.lineWidth = Math.max(1, size * 0.004);
    ctx.stroke();
    
    // Outer edge trim
    ctx.strokeStyle = lightenColor(color, 30);
    ctx.beginPath();
    ctx.moveTo(px + size * 0.003, y);
    ctx.lineTo(px - size * 0.005 + splay, y + length);
    ctx.stroke();
    
    // Rivets
    ctx.fillStyle = colorDark;
    ctx.beginPath();
    ctx.arc(px + pw * 0.5, y + size * 0.02, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + pw * 0.5 + splay, y + length - size * 0.02, size * 0.008, 0, TAU);
    ctx.fill();
  }
}
