import { setShadowBlur, clearShadow } from "../performance";
import { drawRobeBody } from "../enemies/helpers";
import { drawAnimatedArm } from "../enemies/animationHelpers";
import type { Position } from "../../types";

export function drawHexseerTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  _targetPos?: Position,
) {
  const isAttacking = attackPhase > 0;
  const pulse = 0.76 + Math.sin(time * 5.1) * 0.24;
  const hover = Math.sin(time * 2.1) * size * 0.022;
  const charge = isAttacking ? attackPhase : 0.35 + Math.sin(time * 1.7) * 0.15;

  const pool = ctx.createRadialGradient(x, y + size * 0.45, 0, x, y + size * 0.45, size * 0.62);
  pool.addColorStop(0, `rgba(244, 114, 182, ${0.22 * pulse})`);
  pool.addColorStop(0.45, `rgba(190, 24, 93, ${0.13 * pulse})`);
  pool.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.52, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 4; i++) {
    const orbitAngle = time * 1.15 + i * (Math.PI * 2) / 4;
    const orbitDist = size * 0.42;
    const rx = x + Math.cos(orbitAngle) * orbitDist;
    const ry = y - size * 0.12 + Math.sin(orbitAngle) * size * 0.18 + hover;
    const runeSize = size * 0.048;

    ctx.strokeStyle = `rgba(244, 114, 182, ${0.75 * pulse})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.arc(rx, ry, runeSize, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(251, 113, 133, ${0.7 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - runeSize * 0.8);
    ctx.lineTo(rx + runeSize * 0.8, ry);
    ctx.lineTo(rx, ry + runeSize * 0.8);
    ctx.lineTo(rx - runeSize * 0.8, ry);
    ctx.closePath();
    ctx.fill();
  }

  drawAnimatedArm(ctx, x - size * 0.18, y - size * 0.21 + hover, size, time, zoom, -1, {
    color: "#be185d",
    colorDark: "#9d174d",
    handColor: "#fff1f2",
    swingSpeed: 3.6,
    swingAmt: 0.36,
    baseAngle: 0.5,
    upperLen: 0.18,
    foreLen: 0.15,
    width: 0.04,
    phaseOffset: 0.3,
    elbowBend: 0.55,
  });
  drawAnimatedArm(ctx, x + size * 0.18, y - size * 0.21 + hover, size, time, zoom, 1, {
    color: "#be185d",
    colorDark: "#9d174d",
    handColor: "#fff1f2",
    swingSpeed: 3.8,
    swingAmt: 0.32,
    baseAngle: 0.38,
    upperLen: 0.17,
    foreLen: 0.14,
    width: 0.04,
    phaseOffset: 1.35,
    elbowBend: 0.65,
    attackExtra: charge * 0.5,
  });

  const trailGrad = ctx.createLinearGradient(x, y - size * 0.02, x, y + size * 0.72);
  trailGrad.addColorStop(0, "rgba(190, 24, 93, 0.65)");
  trailGrad.addColorStop(0.45, "rgba(126, 34, 206, 0.45)");
  trailGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = trailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y + size * 0.1 + hover);
  ctx.quadraticCurveTo(x - size * 0.28, y + size * 0.42, x - size * 0.08, y + size * 0.72);
  ctx.quadraticCurveTo(x, y + size * 0.58, x + size * 0.08, y + size * 0.72);
  ctx.quadraticCurveTo(x + size * 0.28, y + size * 0.4, x + size * 0.14, y + size * 0.1 + hover);
  ctx.closePath();
  ctx.fill();

  const robeGrad = ctx.createLinearGradient(x - size * 0.42, y, x + size * 0.42, y);
  robeGrad.addColorStop(0, "#7e22ce");
  robeGrad.addColorStop(0.35, "#be185d");
  robeGrad.addColorStop(0.65, "#f472b6");
  robeGrad.addColorStop(1, "#7e22ce");
  ctx.fillStyle = robeGrad;
  drawRobeBody(
    ctx,
    x,
    size * 0.18,
    y - size * 0.34 + hover,
    size * 0.4,
    y + size * 0.52,
    size * 0.42,
    y + size * 0.1,
    { count: 7, amplitude: size * 0.03, time, speed: 3.8, altAmplitude: size * 0.06 },
  );

  ctx.strokeStyle = `rgba(255, 241, 242, ${0.36 + pulse * 0.22})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31 + hover, size * 0.18, Math.PI * 0.18, Math.PI * 0.82);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31 + hover, size * 0.27, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();

  ctx.fillStyle = "#fff1f2";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + hover, size * 0.105, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a123f";
  ctx.beginPath();
  ctx.arc(x - size * 0.028, y - size * 0.35 + hover, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.028, y - size * 0.35 + hover, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(244, 114, 182, ${0.55 + charge * 0.18})`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.045, y - size * 0.3 + hover);
  ctx.lineTo(x, y - size * 0.27 + hover);
  ctx.lineTo(x + size * 0.045, y - size * 0.3 + hover);
  ctx.stroke();

  ctx.save();
  ctx.translate(x + size * 0.26, y - size * 0.1 + hover);
  ctx.rotate(-0.08 + Math.sin(time * 1.8) * 0.05);
  ctx.strokeStyle = "#4a1d35";
  ctx.lineWidth = 2.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.44);
  ctx.lineTo(0, size * 0.34);
  ctx.stroke();
  const staffGem = ctx.createRadialGradient(0, -size * 0.48, 0, 0, -size * 0.48, size * 0.07);
  staffGem.addColorStop(0, `rgba(255, 241, 242, ${0.95 * pulse})`);
  staffGem.addColorStop(0.45, `rgba(244, 114, 182, ${0.8 * pulse})`);
  staffGem.addColorStop(1, `rgba(190, 24, 93, ${0.2 * pulse})`);
  ctx.fillStyle = staffGem;
  setShadowBlur(ctx, 9 * zoom, "#f472b6");
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.57);
  ctx.lineTo(size * 0.06, -size * 0.48);
  ctx.lineTo(0, -size * 0.39);
  ctx.lineTo(-size * 0.06, -size * 0.48);
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  for (let i = 0; i < 3; i++) {
    const ribbonSwing = Math.sin(time * 2.1 + i * 1.7) * size * 0.04;
    const ribbonX = x + (i - 1) * size * 0.09;
    ctx.strokeStyle = `rgba(244, 114, 182, ${0.28 + charge * 0.14})`;
    ctx.lineWidth = (2.6 - i * 0.45) * zoom;
    ctx.beginPath();
    ctx.moveTo(ribbonX, y + size * 0.18 + hover);
    ctx.quadraticCurveTo(
      ribbonX + ribbonSwing,
      y + size * 0.36,
      ribbonX - ribbonSwing * 0.5,
      y + size * (0.56 + i * 0.06)
    );
    ctx.stroke();
  }

  if (isAttacking) {
    const burst = ctx.createRadialGradient(x, y - size * 0.12, 0, x, y - size * 0.12, size * (0.45 + charge * 0.25));
    burst.addColorStop(0, `rgba(255, 241, 242, ${0.22 * charge})`);
    burst.addColorStop(0.45, `rgba(244, 114, 182, ${0.18 * charge})`);
    burst.addColorStop(1, "rgba(190, 24, 93, 0)");
    ctx.fillStyle = burst;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.12, size * (0.45 + charge * 0.25), 0, Math.PI * 2);
    ctx.fill();
  }
}
