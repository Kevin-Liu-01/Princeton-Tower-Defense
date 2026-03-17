import { setShadowBlur, clearShadow } from "../performance";
import { drawRobeBody } from "../enemies/helpers";
import { drawAnimatedArm } from "../enemies/animationHelpers";
import type { Position } from "../../types";

export function drawHexlingTroop(
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
  const pulse = 0.72 + Math.sin(time * 4.6) * 0.28;
  const hover = Math.sin(time * 2.4) * size * 0.018;
  const attackGlow = isAttacking ? attackPhase : 0;

  const aura = ctx.createRadialGradient(x, y - size * 0.08, 0, x, y - size * 0.08, size * 0.55);
  aura.addColorStop(0, `rgba(217, 70, 239, ${0.22 * pulse})`);
  aura.addColorStop(0.6, `rgba(147, 51, 234, ${0.12 * pulse})`);
  aura.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.06, size * 0.42, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const orbAngle = time * 1.5 + i * Math.PI * 0.67;
    const orbX = x + Math.cos(orbAngle) * size * 0.32;
    const orbY = y - size * 0.2 + Math.sin(orbAngle) * size * 0.18 + hover;
    const orbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, size * 0.08);
    orbGrad.addColorStop(0, `rgba(244, 114, 182, ${0.9 * pulse})`);
    orbGrad.addColorStop(0.5, `rgba(192, 38, 211, ${0.45 * pulse})`);
    orbGrad.addColorStop(1, "rgba(147, 51, 234, 0)");
    ctx.fillStyle = orbGrad;
    setShadowBlur(ctx, 6 * zoom, "#c026d3");
    ctx.beginPath();
    ctx.arc(orbX, orbY, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }

  drawAnimatedArm(ctx, x - size * 0.16, y - size * 0.19 + hover, size, time, zoom, -1, {
    color: "#86198f",
    colorDark: "#701a75",
    handColor: "#fdf2f8",
    swingSpeed: 3.8,
    swingAmt: 0.32,
    baseAngle: 0.52,
    upperLen: 0.18,
    foreLen: 0.15,
    width: 0.04,
    phaseOffset: 0.2,
    elbowBend: 0.48,
  });
  drawAnimatedArm(ctx, x + size * 0.16, y - size * 0.19 + hover, size, time, zoom, 1, {
    color: "#86198f",
    colorDark: "#701a75",
    handColor: "#fdf2f8",
    swingSpeed: 3.8,
    swingAmt: 0.28,
    baseAngle: 0.42,
    upperLen: 0.17,
    foreLen: 0.14,
    width: 0.04,
    phaseOffset: 1.1,
    elbowBend: 0.55,
    attackExtra: attackGlow * 0.4,
  });

  const tailGrad = ctx.createLinearGradient(x, y - size * 0.02, x, y + size * 0.54);
  tailGrad.addColorStop(0, "rgba(192, 38, 211, 0.75)");
  tailGrad.addColorStop(0.4, "rgba(126, 34, 206, 0.55)");
  tailGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y + size * 0.1 + hover);
  ctx.quadraticCurveTo(x - size * 0.24, y + size * 0.36, x - size * 0.05, y + size * 0.56);
  ctx.quadraticCurveTo(x + size * 0.02, y + size * 0.5, x + size * 0.08, y + size * 0.56);
  ctx.quadraticCurveTo(x + size * 0.24, y + size * 0.34, x + size * 0.13, y + size * 0.1 + hover);
  ctx.closePath();
  ctx.fill();

  const robeGrad = ctx.createLinearGradient(x, y - size * 0.35, x, y + size * 0.5);
  robeGrad.addColorStop(0, "#86198f");
  robeGrad.addColorStop(0.55, "#a21caf");
  robeGrad.addColorStop(1, "#581c87");
  ctx.fillStyle = robeGrad;
  drawRobeBody(
    ctx,
    x,
    size * 0.15,
    y - size * 0.34 + hover,
    size * 0.35,
    y + size * 0.48,
    size * 0.38,
    y,
  );

  ctx.fillStyle = "rgba(251, 113, 133, 0.72)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.16 + hover);
  ctx.lineTo(x - size * 0.03, y - size * 0.3 + hover);
  ctx.lineTo(x - size * 0.08, y - size * 0.08 + hover);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.16 + hover);
  ctx.lineTo(x + size * 0.03, y - size * 0.3 + hover);
  ctx.lineTo(x + size * 0.08, y - size * 0.08 + hover);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fdf2f8";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + hover, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a123f";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + hover, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fdf2f8";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + hover, size * 0.014, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(251, 113, 133, ${0.75 * pulse})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.08 + hover);
  ctx.lineTo(x + size * 0.18, y - size * 0.08 + hover);
  ctx.moveTo(x, y - size * 0.2 + hover);
  ctx.lineTo(x, y + size * 0.18 + hover);
  ctx.stroke();

  for (let i = 0; i < 2; i++) {
    const shardAngle = time * 2.5 + i * Math.PI;
    const shardX = x + Math.cos(shardAngle) * size * 0.22;
    const shardY = y - size * 0.28 + hover + Math.sin(shardAngle * 1.3) * size * 0.06;
    ctx.save();
    ctx.translate(shardX, shardY);
    ctx.rotate(shardAngle + Math.PI * 0.25);
    ctx.fillStyle = `rgba(244, 114, 182, ${0.55 + pulse * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.06);
    ctx.lineTo(size * 0.03, 0);
    ctx.lineTo(0, size * 0.06);
    ctx.lineTo(-size * 0.03, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
