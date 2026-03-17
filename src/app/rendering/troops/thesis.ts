import type { Position } from "../../types";
import { drawAnimatedArm, drawAnimatedLegs } from "../enemies/animationHelpers";
import { drawRobeBody } from "../enemies/helpers";

export function drawThesisTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  _targetPos?: Position,
) {
  void _targetPos;
  const breathe = Math.sin(time * 2.2) * 0.5;
  const pagePulse = 0.72 + Math.sin(time * 4.1) * 0.28;
  const isAttacking = attackPhase > 0;
  const hover = Math.sin(time * 2.1) * size * 0.02;
  const attackGlow = isAttacking ? attackPhase : 0;

  ctx.save();
  const wardAura = ctx.createRadialGradient(
    x,
    y - size * 0.06,
    0,
    x,
    y - size * 0.06,
    size * 0.58,
  );
  wardAura.addColorStop(0, "rgba(244, 114, 182, 0.2)");
  wardAura.addColorStop(0.55, "rgba(168, 85, 247, 0.16)");
  wardAura.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = wardAura;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.04, size * 0.48, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  drawAnimatedLegs(ctx, x, y + size * 0.31, size, time, zoom, {
    color: "#6d28d9",
    colorDark: "#4c1d95",
    footColor: "#1f1636",
    strideSpeed: 3.1,
    strideAmt: 0.12,
    legLen: 0.16,
    width: 0.04,
    shuffle: true,
    phaseOffset: 0.7,
  });

  drawAnimatedArm(ctx, x - size * 0.17, y - size * 0.17 + hover, size, time, zoom, -1, {
    color: "#8b5cf6",
    colorDark: "#5b21b6",
    handColor: "#faf5ff",
    swingSpeed: 3.2,
    swingAmt: 0.24,
    baseAngle: 0.5,
    upperLen: 0.17,
    foreLen: 0.15,
    width: 0.04,
    phaseOffset: 0.2,
    elbowBend: 0.5,
  });
  drawAnimatedArm(ctx, x + size * 0.17, y - size * 0.17 + hover, size, time, zoom, 1, {
    color: "#8b5cf6",
    colorDark: "#5b21b6",
    handColor: "#faf5ff",
    swingSpeed: 3.4,
    swingAmt: 0.2,
    baseAngle: 0.34,
    upperLen: 0.17,
    foreLen: 0.15,
    width: 0.04,
    phaseOffset: 1.0,
    elbowBend: 0.6,
    attackExtra: attackGlow * 0.3,
  });

  const robeGrad = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.32,
    x + size * 0.24,
    y + size * 0.44,
  );
  robeGrad.addColorStop(0, "#3b0764");
  robeGrad.addColorStop(0.5, color);
  robeGrad.addColorStop(1, "#2e1065");
  ctx.fillStyle = robeGrad;
  drawRobeBody(
    ctx,
    x,
    size * 0.16,
    y - size * 0.28 + hover,
    size * 0.34,
    y + size * 0.46,
    size * 0.36,
    y + size * 0.03,
    {
      count: 6,
      amplitude: size * 0.025,
      time,
      speed: 3.4,
      altAmplitude: size * 0.05,
    },
  );

  ctx.fillStyle = "#faf5ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31 + hover * 0.8, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  const hoodGrad = ctx.createLinearGradient(
    x - size * 0.13,
    y - size * 0.42,
    x + size * 0.13,
    y - size * 0.18,
  );
  hoodGrad.addColorStop(0, "#4c1d95");
  hoodGrad.addColorStop(0.5, "#9333ea");
  hoodGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.3 + hover * 0.8);
  ctx.quadraticCurveTo(x, y - size * 0.44 + hover * 0.5, x + size * 0.12, y - size * 0.3 + hover * 0.8);
  ctx.lineTo(x + size * 0.09, y - size * 0.16 + hover * 0.8);
  ctx.lineTo(x - size * 0.09, y - size * 0.16 + hover * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#201132";
  ctx.beginPath();
  ctx.arc(x - size * 0.024, y - size * 0.31 + hover * 0.8, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.024, y - size * 0.31 + hover * 0.8, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  const bookGrad = ctx.createLinearGradient(
    x - size * 0.08,
    y + size * 0.01,
    x + size * 0.08,
    y + size * 0.13,
  );
  bookGrad.addColorStop(0, "#3b0764");
  bookGrad.addColorStop(0.5, "#9333ea");
  bookGrad.addColorStop(1, "#2e1065");
  ctx.fillStyle = bookGrad;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.085,
    y + size * 0.02 + breathe * 0.45,
    size * 0.17,
    size * 0.11,
    size * 0.018,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(245, 232, 255, 0.8)";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.03 + breathe * 0.45);
  ctx.lineTo(x, y + size * 0.13 + breathe * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y + size * 0.04 + breathe * 0.45);
  ctx.lineTo(x - size * 0.02, y + size * 0.04 + breathe * 0.45);
  ctx.moveTo(x + size * 0.02, y + size * 0.04 + breathe * 0.45);
  ctx.lineTo(x + size * 0.06, y + size * 0.04 + breathe * 0.45);
  ctx.stroke();

  for (let p = 0; p < 3; p++) {
    const theta = time * 1.8 + p * 2.1;
    const px = x + Math.cos(theta) * size * 0.28;
    const py = y - size * 0.2 + Math.sin(theta * 1.2) * size * 0.08 + hover * 0.4;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 3.1 + p) * 0.3);
    ctx.fillStyle = `rgba(243, 232, 255, ${0.42 + pagePulse * 0.32})`;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.03,
      -size * 0.022,
      size * 0.06,
      size * 0.044,
      size * 0.008,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(232, 121, 249, 0.76)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, -size * 0.005);
    ctx.lineTo(size * 0.02, -size * 0.005);
    ctx.moveTo(-size * 0.02, size * 0.007);
    ctx.lineTo(size * 0.02, size * 0.007);
    ctx.stroke();
    ctx.restore();
  }

  if (isAttacking) {
    ctx.strokeStyle = `rgba(198, 145, 255, ${0.5 + attackPhase * 0.4})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.12,
      size * (0.22 + attackPhase * 0.06),
      -Math.PI * 0.8,
      Math.PI * 0.2,
    );
    ctx.stroke();
  }

  for (let i = 0; i < 4; i++) {
    const runeAngle = time * 1.5 + i * 1.57;
    const rx = x + Math.cos(runeAngle) * size * 0.3;
    const ry = y - size * 0.28 + Math.sin(runeAngle * 1.15) * size * 0.09;
    const runeSize = size * 0.028;
    ctx.fillStyle = `rgba(232, 121, 249, ${0.5 + Math.sin(time * 3.5 + i) * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - runeSize);
    ctx.lineTo(rx + runeSize * 0.8, ry);
    ctx.lineTo(rx, ry + runeSize);
    ctx.lineTo(rx - runeSize * 0.8, ry);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
