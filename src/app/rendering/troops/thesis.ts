import type { Position } from "../../types";
import { drawEliteTroop } from "./elite";

export function drawThesisTroop(
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
  drawEliteTroop(ctx, x, y, size, color, time, zoom, attackPhase, targetPos);

  const breathe = Math.sin(time * 2.2) * 0.5;
  const pagePulse = 0.72 + Math.sin(time * 4.1) * 0.28;
  const isAttacking = attackPhase > 0;

  ctx.save();
  const bookGrad = ctx.createLinearGradient(
    x - size * 0.08,
    y + size * 0.01,
    x + size * 0.08,
    y + size * 0.13,
  );
  bookGrad.addColorStop(0, "#3f2e60");
  bookGrad.addColorStop(0.5, "#6a4d95");
  bookGrad.addColorStop(1, "#352751");
  ctx.fillStyle = bookGrad;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.085,
    y + size * 0.015 + breathe * 0.45,
    size * 0.17,
    size * 0.11,
    size * 0.018,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(226, 200, 255, 0.74)";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.02 + breathe * 0.45);
  ctx.lineTo(x, y + size * 0.12 + breathe * 0.45);
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
    const py = y - size * 0.2 + Math.sin(theta * 1.2) * size * 0.08;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 3.1 + p) * 0.3);
    ctx.fillStyle = `rgba(249, 238, 209, ${0.45 + pagePulse * 0.3})`;
    ctx.beginPath();
    ctx.roundRect(
      -size * 0.03,
      -size * 0.022,
      size * 0.06,
      size * 0.044,
      size * 0.008,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(166, 128, 216, 0.7)";
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
  ctx.restore();
}
