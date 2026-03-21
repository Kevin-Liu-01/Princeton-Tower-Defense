import { setShadowBlur, clearShadow } from "../performance";

const HEX_ANGLE_OFFSET = -Math.PI / 6;

export function hexVertices(cx: number, cy: number, r: number): [number, number][] {
  const verts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = HEX_ANGLE_OFFSET + (i * Math.PI) / 3;
    verts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return verts;
}

export function traceHexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const verts = hexVertices(cx, cy, r);
  ctx.beginPath();
  ctx.moveTo(verts[0][0], verts[0][1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(verts[i][0], verts[i][1]);
  ctx.closePath();
}

export function drawHexPlate(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fill: string | CanvasGradient,
  stroke?: string,
  lineWidth?: number,
): void {
  traceHexPath(ctx, cx, cy, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth ?? 1;
    ctx.stroke();
  }
}

export function drawHexRune(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  pulse: number,
  zoom: number,
): void {
  traceHexPath(ctx, cx, cy, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2 * zoom;
  ctx.globalAlpha = 0.5 + pulse * 0.35;
  ctx.stroke();

  const innerR = r * 0.55;
  traceHexPath(ctx, cx, cy, innerR);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.3 + pulse * 0.25;
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawHexChainMail(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  cellSize: number,
  color: string,
  zoom: number,
): void {
  const cols = Math.floor(width / (cellSize * 1.5));
  const rows = Math.floor(height / (cellSize * 1.732));
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6 * zoom;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ox = cx - width / 2 + col * cellSize * 1.5 + (row % 2) * cellSize * 0.75;
      const oy = cy - height / 2 + row * cellSize * 0.866;
      traceHexPath(ctx, ox, oy, cellSize * 0.45);
      ctx.stroke();
    }
  }
}

export function drawGlowingHexGem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  coreColor: string,
  glowColor: string,
  pulse: number,
  zoom: number,
): void {
  setShadowBlur(ctx, 8 * zoom * pulse, glowColor);
  const gemGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  gemGrad.addColorStop(0, "#fff");
  gemGrad.addColorStop(0.3, coreColor);
  gemGrad.addColorStop(1, glowColor);
  drawHexPlate(ctx, cx, cy, r, gemGrad);
  clearShadow(ctx);
}

export function drawHexArmorPlate(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  baseColor: string,
  highlightColor: string,
  shadowColor: string,
  trimColor: string,
  zoom: number,
): void {
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
  grad.addColorStop(0, highlightColor);
  grad.addColorStop(0.6, baseColor);
  grad.addColorStop(1, shadowColor);
  drawHexPlate(ctx, cx, cy, r, grad, trimColor, 1.2 * zoom);

  ctx.strokeStyle = `${highlightColor}44`;
  ctx.lineWidth = 0.6 * zoom;
  traceHexPath(ctx, cx - r * 0.1, cy - r * 0.1, r * 0.7);
  ctx.stroke();
}

export function drawOrbitingHexRunes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  count: number,
  orbitDist: number,
  orbitYScale: number,
  runeSize: number,
  color: string,
  time: number,
  speed: number,
  pulse: number,
  zoom: number,
): void {
  for (let i = 0; i < count; i++) {
    const angle = time * speed + (i * Math.PI * 2) / count;
    const rx = cx + Math.cos(angle) * orbitDist;
    const ry = cy + Math.sin(angle) * orbitDist * orbitYScale;
    drawHexRune(ctx, rx, ry, runeSize, color, pulse, zoom);
  }
}

export interface WispConfig {
  count: number;
  color1: string;
  color2: string;
  color3: string;
  baseWidth: number;
  lengthMin: number;
  lengthMax: number;
  spread: number;
  speed: number;
  curlAmount: number;
}

export function drawGhostlyWisps(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  size: number,
  time: number,
  zoom: number,
  pulse: number,
  config: WispConfig,
): void {
  for (let i = 0; i < config.count; i++) {
    const phase = i * (Math.PI * 2) / config.count;
    const drift = Math.sin(time * config.speed + phase) * size * config.curlAmount;
    const drift2 = Math.cos(time * config.speed * 0.7 + phase * 1.3) * size * config.curlAmount * 0.6;
    const wispX = cx + (i - (config.count - 1) / 2) * size * config.spread + drift * 0.3;
    const wispLen = size * (config.lengthMin + (config.lengthMax - config.lengthMin) * ((i % 3) / 2));
    const alpha = 0.35 + pulse * 0.25 - (i % 2) * 0.08;

    const wispGrad = ctx.createLinearGradient(wispX, baseY, wispX + drift, baseY + wispLen);
    wispGrad.addColorStop(0, config.color1);
    wispGrad.addColorStop(0.4, config.color2);
    wispGrad.addColorStop(1, config.color3);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.strokeStyle = wispGrad;
    ctx.lineWidth = (config.baseWidth - (i % 3) * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(wispX, baseY);
    ctx.quadraticCurveTo(
      wispX + drift,
      baseY + wispLen * 0.4,
      wispX + drift2,
      baseY + wispLen * 0.75,
    );
    ctx.quadraticCurveTo(
      wispX + drift * 1.2 + drift2 * 0.5,
      baseY + wispLen * 0.9,
      wispX + drift * 0.8 + drift2,
      baseY + wispLen,
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export function drawDissolveParticles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  size: number,
  time: number,
  zoom: number,
  count: number,
  spread: number,
  riseHeight: number,
  color: string,
  pulse: number,
): void {
  for (let i = 0; i < count; i++) {
    const phase = (time * 0.8 + i * 0.31) % 1;
    const px = cx + Math.sin(time * 1.6 + i * 1.7) * size * spread;
    const py = baseY - phase * size * riseHeight;
    const pAlpha = Math.sin(phase * Math.PI) * (0.4 + pulse * 0.2);
    const pSize = (1.2 + Math.sin(i * 2.3) * 0.6) * zoom;

    ctx.fillStyle = color;
    ctx.globalAlpha = Math.max(0, pAlpha);

    if (i % 3 === 0) {
      traceHexPath(ctx, px, py, pSize);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(px, py, pSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function drawHexEnergyVeins(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  time: number,
  zoom: number,
  color: string,
  pulse: number,
  count: number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8 * zoom;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.3 + pulse * 0.2;

  for (let i = 0; i < count; i++) {
    const startX = cx + (i - (count - 1) / 2) * (width / count);
    const startY = cy - height * 0.4;
    const endY = cy + height * 0.4;
    const segments = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const segX = startX + Math.sin(time * 3.2 + i * 1.5 + s * 0.8) * width * 0.08;
      const segY = startY + (endY - startY) * t;
      ctx.lineTo(segX, segY);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawHexScaleArmor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  scaleSize: number,
  fillColor: string,
  strokeColor: string,
  zoom: number,
  shimmer: number,
): void {
  const cols = Math.floor(width / (scaleSize * 1.1));
  const rows = Math.floor(height / (scaleSize * 0.9));
  ctx.save();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ox = cx - width / 2 + col * scaleSize * 1.1 + (row % 2) * scaleSize * 0.55;
      const oy = cy - height / 2 + row * scaleSize * 0.9;
      const scaleAlpha = 0.3 + shimmer * 0.15 + Math.sin(row * 0.8 + col * 1.2) * 0.08;
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = scaleAlpha;
      traceHexPath(ctx, ox, oy, scaleSize * 0.48);
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.5 * zoom;
      ctx.globalAlpha = scaleAlpha * 0.7;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
