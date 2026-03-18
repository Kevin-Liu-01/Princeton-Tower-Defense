import { seededRandom } from "../worldMapUtils";

export function drawGrassTuft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
  time: number,
) {
  ctx.fillStyle = color;
  const blades = 3 + Math.floor(seededRandom(x + y) * 4);
  for (let blade = 0; blade < blades; blade++) {
    const bladeX = x + (blade - blades / 2) * 2 * scale;
    const bladeHeight = (6 + seededRandom(x + blade) * 6) * scale;
    const sway = Math.sin(time * 2 + x * 0.1 + blade) * 1.5;
    ctx.beginPath();
    ctx.moveTo(bladeX, y);
    ctx.quadraticCurveTo(
      bladeX + sway,
      y - bladeHeight * 0.6,
      bladeX + sway * 1.5,
      y - bladeHeight,
    );
    ctx.quadraticCurveTo(
      bladeX + sway * 0.5,
      y - bladeHeight * 0.4,
      bladeX,
      y,
    );
    ctx.fill();
  }
}

export function drawRuggedBorder(
  ctx: CanvasRenderingContext2D,
  height: number,
  x: number,
  region1Color: string,
  region2Color: string,
) {
  ctx.save();

  const pathPoints: Array<{ x: number; y: number }> = [];
  for (let y = 0; y <= height; y += 4) {
    const offset =
      Math.sin(y * 0.12 + x * 0.008) * 20 +
      Math.sin(y * 0.06 + x * 0.02) * 14 +
      Math.sin(y * 0.25 + x * 0.04) * 8 +
      seededRandom(y + x) * 16 -
      8;
    pathPoints.push({ x: x + offset, y });
  }

  const fadeWidths = [90, 65, 45, 28, 16];
  const fadeAlphas = [0.06, 0.09, 0.12, 0.16, 0.2];

  for (let layer = 0; layer < fadeWidths.length; layer++) {
    const fadeWidth = fadeWidths[layer];
    const alpha = fadeAlphas[layer];

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - fadeWidth - 10, 0);
    pathPoints.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(x - fadeWidth - 10, height);
    ctx.closePath();
    ctx.clip();

    const leftGradient = ctx.createLinearGradient(x - fadeWidth, 0, x + 5, 0);
    leftGradient.addColorStop(0, `${region1Color}00`);
    leftGradient.addColorStop(
      0.4,
      region1Color + Math.round(alpha * 255).toString(16).padStart(2, "0"),
    );
    leftGradient.addColorStop(1, `${region1Color}00`);
    ctx.fillStyle = leftGradient;
    ctx.fillRect(x - fadeWidth - 10, 0, fadeWidth + 20, height);
    ctx.restore();
  }

  for (let layer = 0; layer < fadeWidths.length; layer++) {
    const fadeWidth = fadeWidths[layer];
    const alpha = fadeAlphas[layer];

    ctx.save();
    ctx.beginPath();
    pathPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
        return;
      }
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(x + fadeWidth + 10, height);
    ctx.lineTo(x + fadeWidth + 10, 0);
    ctx.closePath();
    ctx.clip();

    const rightGradient = ctx.createLinearGradient(x - 5, 0, x + fadeWidth, 0);
    rightGradient.addColorStop(0, `${region2Color}00`);
    rightGradient.addColorStop(
      0.6,
      region2Color + Math.round(alpha * 255).toString(16).padStart(2, "0"),
    );
    rightGradient.addColorStop(1, `${region2Color}00`);
    ctx.fillStyle = rightGradient;
    ctx.fillRect(x - 10, 0, fadeWidth + 20, height);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, 0);
  pathPoints.forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, 0);
  pathPoints.forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
