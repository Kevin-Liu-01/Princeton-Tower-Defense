import type { Position } from "../../types";
import { drawAnimatedArm, drawAnimatedLegs } from "../enemies/animationHelpers";

export function drawRowingTroop(
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
  const breathe = Math.sin(time * 2.6) * 0.45;
  const isAttacking = attackPhase > 0;
  const pull = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const sway = Math.sin(time * 1.8) * size * 0.018;
  const auraPulse = 0.72 + Math.sin(time * 4.2) * 0.2;

  ctx.save();
  const aura = ctx.createRadialGradient(
    x,
    y - size * 0.02,
    0,
    x,
    y - size * 0.02,
    size * 0.52,
  );
  aura.addColorStop(0, `rgba(216, 180, 254, ${0.22 * auraPulse})`);
  aura.addColorStop(0.55, `rgba(147, 51, 234, ${0.15 * auraPulse})`);
  aura.addColorStop(1, "rgba(76, 29, 149, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.01, size * 0.48, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  drawAnimatedLegs(ctx, x, y + size * 0.28, size, time, zoom, {
    color: "#5b21b6",
    colorDark: "#3b0764",
    footColor: "#201132",
    strideSpeed: 3.4,
    strideAmt: 0.18,
    legLen: 0.17,
    width: 0.055,
    phaseOffset: 0.3,
  });

  drawAnimatedArm(ctx, x - size * 0.16, y - size * 0.18 + sway, size, time, zoom, -1, {
    color: "#8b5cf6",
    colorDark: "#5b21b6",
    handColor: "#f5e9ff",
    swingSpeed: 3.2,
    swingAmt: 0.22,
    baseAngle: 0.46,
    upperLen: 0.18,
    foreLen: 0.16,
    width: 0.045,
    phaseOffset: 0.25,
    elbowBend: 0.45,
  });
  drawAnimatedArm(ctx, x + size * 0.16, y - size * 0.18 + sway, size, time, zoom, 1, {
    color: "#8b5cf6",
    colorDark: "#5b21b6",
    handColor: "#f5e9ff",
    swingSpeed: 3.2,
    swingAmt: 0.18,
    baseAngle: 0.34,
    upperLen: 0.18,
    foreLen: 0.18,
    width: 0.045,
    phaseOffset: 1.0,
    elbowBend: 0.52,
    attackExtra: pull * 0.35,
  });

  const torsoGrad = ctx.createLinearGradient(
    x - size * 0.26,
    y - size * 0.28,
    x + size * 0.26,
    y + size * 0.24,
  );
  torsoGrad.addColorStop(0, "#2e1065");
  torsoGrad.addColorStop(0.45, color);
  torsoGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y - size * 0.22 + sway);
  ctx.lineTo(x + size * 0.19, y - size * 0.22 + sway);
  ctx.lineTo(x + size * 0.25, y + size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.lineTo(x - size * 0.25, y + size * 0.1 + breathe * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(243, 232, 255, 0.62)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.07, y - size * 0.16 + sway);
  ctx.lineTo(x + size * 0.07, y - size * 0.16 + sway);
  ctx.moveTo(x - size * 0.11, y - size * 0.02);
  ctx.lineTo(x + size * 0.11, y - size * 0.02);
  ctx.stroke();

  ctx.fillStyle = "#f5e9ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.33 + sway * 0.8, size * 0.095, 0, Math.PI * 2);
  ctx.fill();

  const hoodGrad = ctx.createLinearGradient(
    x - size * 0.12,
    y - size * 0.42,
    x + size * 0.12,
    y - size * 0.2,
  );
  hoodGrad.addColorStop(0, "#4c1d95");
  hoodGrad.addColorStop(0.5, "#7c3aed");
  hoodGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, y - size * 0.34 + sway * 0.8);
  ctx.quadraticCurveTo(x, y - size * 0.46 + sway * 0.6, x + size * 0.11, y - size * 0.34 + sway * 0.8);
  ctx.lineTo(x + size * 0.08, y - size * 0.18 + sway * 0.8);
  ctx.lineTo(x - size * 0.08, y - size * 0.18 + sway * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#26183f";
  ctx.beginPath();
  ctx.arc(x - size * 0.024, y - size * 0.34 + sway * 0.8, size * 0.011, 0, Math.PI * 2);
  ctx.arc(x + size * 0.024, y - size * 0.34 + sway * 0.8, size * 0.011, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(52, 22, 86, 0.82)";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.16,
    y - size * 0.05 + breathe * 0.45,
    size * 0.32,
    size * 0.06,
    size * 0.015,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(229, 196, 255, 0.78)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.02 + breathe * 0.45);
  ctx.lineTo(x + size * 0.12, y - size * 0.02 + breathe * 0.45);
  ctx.stroke();

  ctx.save();
  ctx.translate(x + size * 0.33, y - size * 0.01 + breathe * 0.45);
  ctx.rotate(-1.04 + pull * 0.55);
  const shaftGrad = ctx.createLinearGradient(0, -size * 0.58, 0, size * 0.1);
  shaftGrad.addColorStop(0, "#4c1d95");
  shaftGrad.addColorStop(0.5, "#7c3aed");
  shaftGrad.addColorStop(1, "#2e1065");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.014, -size * 0.58, size * 0.028, size * 0.72);
  ctx.fillStyle = "#e9d5ff";
  ctx.beginPath();
  ctx.moveTo(-size * 0.062, -size * 0.68);
  ctx.lineTo(size * 0.062, -size * 0.68);
  ctx.lineTo(size * 0.045, -size * 0.56);
  ctx.lineTo(-size * 0.045, -size * 0.56);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.04 + breathe * 0.5);
  ctx.rotate(-0.26);
  const shieldGrad = ctx.createRadialGradient(
    0,
    -size * 0.03,
    size * 0.015,
    0,
    0,
    size * 0.16,
  );
  shieldGrad.addColorStop(0, "#7c3aed");
  shieldGrad.addColorStop(0.7, "#4c1d95");
  shieldGrad.addColorStop(1, "#2a0e52");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.17);
  ctx.lineTo(size * 0.15, -size * 0.04);
  ctx.lineTo(size * 0.09, size * 0.17);
  ctx.lineTo(0, size * 0.22);
  ctx.lineTo(-size * 0.09, size * 0.17);
  ctx.lineTo(-size * 0.15, -size * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(243, 232, 255, 0.76)";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.12);
  ctx.lineTo(size * 0.1, -size * 0.03);
  ctx.lineTo(size * 0.06, size * 0.12);
  ctx.lineTo(0, size * 0.16);
  ctx.lineTo(-size * 0.06, size * 0.12);
  ctx.lineTo(-size * 0.1, -size * 0.03);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(233, 213, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(0, -size * 0.01, size * 0.028, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const moteAngle = time * 2.4 + i * 2.1;
    const mx = x + Math.cos(moteAngle) * size * 0.26;
    const my = y - size * 0.26 + Math.sin(moteAngle * 1.2) * size * 0.08;
    ctx.fillStyle = `rgba(233, 213, 255, ${0.45 + Math.sin(time * 4 + i) * 0.18})`;
    ctx.beginPath();
    ctx.arc(mx, my, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}
