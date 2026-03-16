import type { Position } from "../../types";
import { drawSoldierTroop } from "./soldier";

export function drawRowingTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  drawSoldierTroop(ctx, x, y, size, color, time, zoom, attackPhase, targetPos);

  const breathe = Math.sin(time * 2.6) * 0.45;
  const isAttacking = attackPhase > 0;
  const pull = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  ctx.save();
  ctx.fillStyle = "rgba(101, 66, 29, 0.78)";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.16,
    y - size * 0.05 + breathe * 0.45,
    size * 0.32,
    size * 0.06,
    size * 0.015,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 170, 96, 0.7)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.02 + breathe * 0.45);
  ctx.lineTo(x + size * 0.12, y - size * 0.02 + breathe * 0.45);
  ctx.stroke();

  ctx.save();
  ctx.translate(x + size * 0.33, y - size * 0.01 + breathe * 0.45);
  ctx.rotate(-1.04 + pull * 0.55);
  const shaftGrad = ctx.createLinearGradient(0, -size * 0.58, 0, size * 0.1);
  shaftGrad.addColorStop(0, "#7f4d24");
  shaftGrad.addColorStop(0.5, "#a66a32");
  shaftGrad.addColorStop(1, "#6d4020");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.014, -size * 0.58, size * 0.028, size * 0.72);
  ctx.fillStyle = "#d78a4b";
  ctx.beginPath();
  ctx.moveTo(-size * 0.062, -size * 0.68);
  ctx.lineTo(size * 0.062, -size * 0.68);
  ctx.lineTo(size * 0.045, -size * 0.56);
  ctx.lineTo(-size * 0.045, -size * 0.56);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x - size * 0.33, y + size * 0.07 + breathe * 0.5);
  ctx.rotate(-0.26);
  const shieldGrad = ctx.createRadialGradient(
    0,
    -size * 0.03,
    size * 0.015,
    0,
    0,
    size * 0.16,
  );
  shieldGrad.addColorStop(0, "#754623");
  shieldGrad.addColorStop(0.7, "#55341c");
  shieldGrad.addColorStop(1, "#362213");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 178, 106, 0.7)";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.115, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.quadraticCurveTo(0, -size * 0.04, size * 0.06, 0);
  ctx.moveTo(-size * 0.06, size * 0.035);
  ctx.quadraticCurveTo(0, size * 0.075, size * 0.06, size * 0.035);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}
