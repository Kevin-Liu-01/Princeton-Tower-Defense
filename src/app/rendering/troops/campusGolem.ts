import type { Position } from "../../types";

const drawStoneBlock = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void => {
  ctx.fillStyle = "#59574f";
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, radius);
  ctx.fill();

  ctx.fillStyle = "#8f8a7d";
  ctx.beginPath();
  ctx.roundRect(
    x - width / 2 + width * 0.08,
    y - height / 2 + height * 0.08,
    width * 0.72,
    height * 0.3,
    radius * 0.7
  );
  ctx.fill();

  ctx.strokeStyle = "#34342f";
  ctx.lineWidth = Math.max(1, width * 0.04);
  ctx.stroke();
};

export const drawCampusGolemTroop = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
): void => {
  const breathe = Math.sin(time * 1.8) * size * 0.012;
  const runePulse = 0.6 + Math.sin(time * 4.2) * 0.3;
  const attackSwing = Math.sin(attackPhase * Math.PI) * size * 0.3;
  const targetDirection = targetPos && targetPos.x < x ? -1 : 1;
  const shoulderY = y - size * 0.2 + breathe;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(targetDirection, 1);
  ctx.translate(-x, -y);

  ctx.fillStyle = "rgba(19, 24, 19, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.34, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  drawStoneBlock(
    ctx,
    x - size * 0.17,
    y + size * 0.22,
    size * 0.25,
    size * 0.3,
    3 * zoom
  );
  drawStoneBlock(
    ctx,
    x + size * 0.17,
    y + size * 0.22,
    size * 0.25,
    size * 0.3,
    3 * zoom
  );
  drawStoneBlock(
    ctx,
    x,
    y - size * 0.02 + breathe,
    size * 0.58,
    size * 0.56,
    5 * zoom
  );

  ctx.save();
  ctx.translate(x + size * 0.35, shoulderY);
  ctx.rotate(-attackSwing / Math.max(size, 1));
  drawStoneBlock(ctx, 0, size * 0.14, size * 0.24, size * 0.5, 4 * zoom);
  drawStoneBlock(ctx, 0, size * 0.41, size * 0.31, size * 0.25, 4 * zoom);
  ctx.restore();

  drawStoneBlock(
    ctx,
    x - size * 0.35,
    shoulderY + size * 0.15,
    size * 0.24,
    size * 0.5,
    4 * zoom
  );
  drawStoneBlock(
    ctx,
    x,
    y - size * 0.38 + breathe,
    size * 0.4,
    size * 0.3,
    5 * zoom
  );

  ctx.fillStyle = `rgba(255, 132, 31, ${runePulse})`;
  ctx.shadowColor = "#ff7a18";
  ctx.shadowBlur = 7 * zoom;
  ctx.fillRect(
    x - size * 0.105,
    y - size * 0.42 + breathe,
    size * 0.07,
    size * 0.045
  );
  ctx.fillRect(
    x + size * 0.035,
    y - size * 0.42 + breathe,
    size * 0.07,
    size * 0.045
  );
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2 + breathe);
  ctx.lineTo(x - size * 0.08, y - size * 0.02 + breathe);
  ctx.lineTo(x + size * 0.03, y + size * 0.08 + breathe);
  ctx.lineTo(x - size * 0.03, y + size * 0.2 + breathe);
  ctx.strokeStyle = `rgba(255, 132, 31, ${runePulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#315c35";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.28);
  ctx.bezierCurveTo(
    x - size * 0.38,
    y - size * 0.05,
    x - size * 0.18,
    y + size * 0.08,
    x - size * 0.31,
    y + size * 0.29
  );
  ctx.stroke();

  ctx.restore();
};
