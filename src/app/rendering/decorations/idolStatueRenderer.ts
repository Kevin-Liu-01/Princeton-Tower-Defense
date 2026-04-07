import { getIdolStatuePalette } from "./idolStatuePalettes";
import type { IdolStatuePalette, IdolAccentType } from "./idolStatuePalettes";
import { drawDirectionalShadow } from "./shadowHelpers";

export interface IdolStatueParams {
  ctx: CanvasRenderingContext2D;
  screenX: number;
  screenY: number;
  s: number;
  time: number;
  mapTheme: string;
}

export function renderIdolStatue({
  ctx,
  screenX: ix,
  screenY: iy,
  s,
  time,
  mapTheme,
}: IdolStatueParams): void {
  const pal = getIdolStatuePalette(mapTheme);
  const { stone, glow } = pal;
  const glowPulse = 0.5 + Math.sin(time * 2) * 0.3;

  drawIdolAura(ctx, ix, iy, s, time, glow);
  drawDirectionalShadow(ctx, ix, iy + 3 * s, s, 14 * s, 7 * s, 40 * s, 0.3);

  const pedY2 = drawPedestal(ctx, ix, iy, s, stone);
  const pedH2 = 4 * s;
  const bodyBase = pedY2 - pedH2;
  const bodyW = 9 * s;
  const bodyH = 38 * s;
  const bodyTopW = 7 * s;

  drawBody(ctx, ix, bodyBase, s, bodyW, bodyH, bodyTopW, stone);
  drawMouth(ctx, ix, bodyBase, s, stone.deep, pal.fangColor);
  drawCarvedBand(ctx, ix, bodyBase, s, stone.deep, pal.carvingHighlight);
  drawUpperFace(ctx, ix, bodyBase, s, stone.deep, glow, glowPulse);
  drawCrown(ctx, ix, bodyBase, bodyH, s, stone);
  drawSidePatterns(ctx, ix, bodyBase, s, pal.carvingColor);
  drawRegionalAccents(
    ctx,
    ix,
    bodyBase,
    s,
    bodyW,
    bodyTopW,
    bodyH,
    time,
    glowPulse,
    pal
  );
}

function drawIdolAura(
  ctx: CanvasRenderingContext2D,
  ix: number,
  iy: number,
  s: number,
  time: number,
  glow: IdolStatuePalette["glow"]
): void {
  const grad = ctx.createRadialGradient(
    ix,
    iy + 4 * s,
    0,
    ix,
    iy + 4 * s,
    28 * s
  );
  grad.addColorStop(
    0,
    `rgba(${glow.r},${glow.g},${glow.b},${0.08 + Math.sin(time * 1.5) * 0.04})`
  );
  grad.addColorStop(0.5, `rgba(${glow.r},${glow.g},${glow.b},0.02)`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(ix, iy + 4 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawIsoPedTier(
  ctx: CanvasRenderingContext2D,
  ix: number,
  topY: number,
  w: number,
  h: number,
  light: string,
  mid: string,
  dark: string
): void {
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(ix - w, topY);
  ctx.lineTo(ix, topY - w * 0.5);
  ctx.lineTo(ix + w, topY);
  ctx.lineTo(ix, topY + w * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.moveTo(ix - w, topY);
  ctx.lineTo(ix - w, topY + h);
  ctx.lineTo(ix, topY + h + w * 0.5);
  ctx.lineTo(ix, topY + w * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(ix + w, topY);
  ctx.lineTo(ix + w, topY + h);
  ctx.lineTo(ix, topY + h + w * 0.5);
  ctx.lineTo(ix, topY + w * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawPedestal(
  ctx: CanvasRenderingContext2D,
  ix: number,
  iy: number,
  s: number,
  stone: IdolStatuePalette["stone"]
): number {
  const pedW1 = 14 * s;
  const pedH1 = 5 * s;
  drawIsoPedTier(
    ctx,
    ix,
    iy - pedH1,
    pedW1,
    pedH1,
    stone.light,
    stone.mid,
    stone.dark
  );

  const pedY2 = iy - pedH1;
  const pedW2 = 10 * s;
  const pedH2 = 4 * s;
  drawIsoPedTier(
    ctx,
    ix,
    pedY2 - pedH2,
    pedW2,
    pedH2,
    stone.light,
    stone.mid,
    stone.dark
  );

  return pedY2;
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  bodyH: number,
  bodyTopW: number,
  stone: IdolStatuePalette["stone"]
): void {
  ctx.fillStyle = stone.mid;
  ctx.beginPath();
  ctx.moveTo(ix - bodyW, bodyBase);
  ctx.lineTo(ix - bodyTopW, bodyBase - bodyH);
  ctx.lineTo(ix, bodyBase - bodyH);
  ctx.lineTo(ix, bodyBase);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = stone.dark;
  ctx.beginPath();
  ctx.moveTo(ix + bodyW, bodyBase);
  ctx.lineTo(ix + bodyTopW, bodyBase - bodyH);
  ctx.lineTo(ix, bodyBase - bodyH);
  ctx.lineTo(ix, bodyBase);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = stone.light;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(ix, bodyBase);
  ctx.lineTo(ix, bodyBase - bodyH);
  ctx.stroke();

  ctx.fillStyle = stone.light;
  ctx.beginPath();
  ctx.moveTo(ix - bodyTopW, bodyBase - bodyH);
  ctx.lineTo(ix, bodyBase - bodyH - 3 * s);
  ctx.lineTo(ix + bodyTopW, bodyBase - bodyH);
  ctx.lineTo(ix, bodyBase - bodyH + 3 * s);
  ctx.closePath();
  ctx.fill();
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  deep: string,
  fangColor: string
): void {
  const mouthY = bodyBase - 10 * s;
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(ix - 6 * s, mouthY);
  ctx.lineTo(ix - 4 * s, mouthY + 4 * s);
  ctx.lineTo(ix + 4 * s, mouthY + 4 * s);
  ctx.lineTo(ix + 6 * s, mouthY);
  ctx.lineTo(ix + 4 * s, mouthY - 3 * s);
  ctx.lineTo(ix - 4 * s, mouthY - 3 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = fangColor;
  for (let t = 0; t < 5; t++) {
    const tx = ix - 4 * s + t * 2 * s;
    ctx.beginPath();
    ctx.moveTo(tx, mouthY - 3 * s);
    ctx.lineTo(tx + 1 * s, mouthY - 0.5 * s);
    ctx.lineTo(tx + 2 * s, mouthY - 3 * s);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(ix - 4 * s, mouthY + 4 * s);
  ctx.lineTo(ix - 3 * s, mouthY + 1 * s);
  ctx.lineTo(ix - 2 * s, mouthY + 4 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ix + 2 * s, mouthY + 4 * s);
  ctx.lineTo(ix + 3 * s, mouthY + 1 * s);
  ctx.lineTo(ix + 4 * s, mouthY + 4 * s);
  ctx.fill();
}

function drawCarvedBand(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  deep: string,
  highlight: string
): void {
  const bandY = bodyBase - 17 * s;
  ctx.strokeStyle = deep;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(ix - 8 * s, bandY);
  ctx.lineTo(ix + 8 * s, bandY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ix - 8 * s, bandY - 3 * s);
  ctx.lineTo(ix + 8 * s, bandY - 3 * s);
  ctx.stroke();

  ctx.strokeStyle = highlight;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  for (let z = 0; z < 8; z++) {
    const zx = ix - 7 * s + z * 2 * s;
    const zy = z % 2 === 0 ? bandY - 0.5 * s : bandY - 2.5 * s;
    if (z === 0) {
      ctx.moveTo(zx, zy);
    } else {
      ctx.lineTo(zx, zy);
    }
  }
  ctx.stroke();
}

function drawUpperFace(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  deep: string,
  glow: IdolStatuePalette["glow"],
  glowPulse: number
): void {
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.moveTo(ix - 7 * s, bodyBase - 25 * s);
  ctx.quadraticCurveTo(ix, bodyBase - 27 * s, ix + 7 * s, bodyBase - 25 * s);
  ctx.lineTo(ix + 7 * s, bodyBase - 23 * s);
  ctx.quadraticCurveTo(ix, bodyBase - 24 * s, ix - 7 * s, bodyBase - 23 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.ellipse(
    ix - 4 * s,
    bodyBase - 28 * s,
    3 * s,
    2.5 * s,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    ix + 4 * s,
    bodyBase - 28 * s,
    3 * s,
    2.5 * s,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = `rgba(${glow.r},${glow.g},${glow.b},${glowPulse * 0.35})`;
  ctx.beginPath();
  ctx.arc(ix - 4 * s, bodyBase - 28 * s, 4 * s, 0, Math.PI * 2);
  ctx.arc(ix + 4 * s, bodyBase - 28 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(${glow.r},${glow.g},${glow.b},${glowPulse})`;
  ctx.beginPath();
  ctx.arc(ix - 4 * s, bodyBase - 28 * s, 2 * s, 0, Math.PI * 2);
  ctx.arc(ix + 4 * s, bodyBase - 28 * s, 2 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = glow.hex;
  ctx.beginPath();
  ctx.arc(ix - 4 * s, bodyBase - 28 * s, 1 * s, 0, Math.PI * 2);
  ctx.arc(ix + 4 * s, bodyBase - 28 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = deep;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(ix, bodyBase - 26 * s);
  ctx.lineTo(ix - 1 * s, bodyBase - 21 * s);
  ctx.lineTo(ix + 1 * s, bodyBase - 20 * s);
  ctx.stroke();
}

function drawCrown(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  bodyH: number,
  s: number,
  stone: IdolStatuePalette["stone"]
): void {
  const crownY = bodyBase - bodyH;
  ctx.fillStyle = stone.dark;
  ctx.beginPath();
  ctx.moveTo(ix - 5 * s, crownY);
  ctx.lineTo(ix - 6 * s, crownY - 5 * s);
  ctx.lineTo(ix - 3 * s, crownY - 3 * s);
  ctx.lineTo(ix, crownY - 7 * s);
  ctx.lineTo(ix + 3 * s, crownY - 3 * s);
  ctx.lineTo(ix + 6 * s, crownY - 5 * s);
  ctx.lineTo(ix + 5 * s, crownY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = stone.mid;
  ctx.beginPath();
  ctx.moveTo(ix - 5 * s, crownY);
  ctx.lineTo(ix - 6 * s, crownY - 5 * s);
  ctx.lineTo(ix - 3 * s, crownY - 3 * s);
  ctx.lineTo(ix, crownY - 7 * s);
  ctx.lineTo(ix, crownY);
  ctx.closePath();
  ctx.fill();
}

function drawSidePatterns(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  carvingColor: string
): void {
  ctx.strokeStyle = carvingColor;
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 3; a += 0.3) {
    const sr = a * 0.5 * s;
    const sx = ix - 5 * s + Math.cos(a + 1) * sr;
    const sy = bodyBase - 7 * s + Math.sin(a + 1) * sr * 0.5;
    if (a === 0) {
      ctx.moveTo(sx, sy);
    } else {
      ctx.lineTo(sx, sy);
    }
  }
  ctx.stroke();

  for (let d = 0; d < 3; d++) {
    const dy = bodyBase - 5 * s - d * 4 * s;
    ctx.strokeStyle = carvingColor;
    ctx.lineWidth = 0.7 * s;
    ctx.beginPath();
    ctx.moveTo(ix + 4 * s, dy);
    ctx.lineTo(ix + 6 * s, dy - 1.5 * s);
    ctx.lineTo(ix + 4 * s, dy - 3 * s);
    ctx.lineTo(ix + 2 * s, dy - 1.5 * s);
    ctx.closePath();
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Regional accent drawing — each biome gets unique surface decoration
// ---------------------------------------------------------------------------

function drawRegionalAccents(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  bodyTopW: number,
  bodyH: number,
  time: number,
  glowPulse: number,
  pal: IdolStatuePalette
): void {
  const drawAccent = ACCENT_DRAWERS[pal.accentType];
  drawAccent(ctx, ix, bodyBase, s, bodyW, bodyTopW, bodyH, time, pal);
  drawFloatingParticles(ctx, ix, bodyBase, s, time, glowPulse, pal);
}

type AccentDrawFn = (
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  bodyTopW: number,
  bodyH: number,
  time: number,
  pal: IdolStatuePalette
) => void;

const ACCENT_DRAWERS: Record<IdolAccentType, AccentDrawFn> = {
  frost: drawFrostAccent,
  ivy: drawIvyAccent,
  lava: drawLavaAccent,
  moss: drawMossAccent,
  sand: drawSandAccent,
};

function drawMossAccent(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  bodyTopW: number,
  _bodyH: number,
  _time: number,
  pal: IdolStatuePalette
): void {
  ctx.fillStyle = pal.accent;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(
    ix - 6 * s,
    bodyBase + 1 * s,
    3 * s,
    1.5 * s,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    ix + 5 * s,
    bodyBase - 1 * s,
    2.5 * s,
    1.2 * s,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = pal.vineColor;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(ix - bodyW + 1 * s, bodyBase);
  ctx.quadraticCurveTo(
    ix - bodyW - 1 * s,
    bodyBase - 15 * s,
    ix - bodyTopW + 1 * s,
    bodyBase - 32 * s
  );
  ctx.stroke();

  ctx.fillStyle = pal.leafColor;
  for (let lf = 0; lf < 4; lf++) {
    const lt = lf / 3;
    const lx =
      ix - bodyW + 1 * s + (bodyW - bodyTopW) * lt - Math.sin(lt * 3) * 2 * s;
    const ly = bodyBase - lt * 32 * s;
    ctx.beginPath();
    ctx.ellipse(lx - 2 * s, ly, 2 * s, 1 * s, -0.5 + lf * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIvyAccent(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  bodyTopW: number,
  _bodyH: number,
  _time: number,
  pal: IdolStatuePalette
): void {
  ctx.fillStyle = pal.accent;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(
    ix - 5 * s,
    bodyBase + 1 * s,
    2.5 * s,
    1.2 * s,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(ix + 4 * s, bodyBase, 2 * s, 1 * s, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = pal.vineColor;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(ix - bodyW + 1 * s, bodyBase);
  ctx.quadraticCurveTo(
    ix - bodyW - 1 * s,
    bodyBase - 12 * s,
    ix - bodyTopW + 2 * s,
    bodyBase - 28 * s
  );
  ctx.stroke();

  ctx.strokeStyle = pal.vineColor;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(ix + bodyW - 2 * s, bodyBase - 4 * s);
  ctx.quadraticCurveTo(
    ix + bodyW,
    bodyBase - 18 * s,
    ix + bodyTopW - 1 * s,
    bodyBase - 30 * s
  );
  ctx.stroke();

  ctx.fillStyle = pal.leafColor;
  for (let lf = 0; lf < 5; lf++) {
    const lt = lf / 4;
    const side = lf % 2 === 0 ? -1 : 1;
    const bw = side < 0 ? bodyW : bodyW - 2;
    const btw = side < 0 ? bodyTopW - 2 : bodyTopW - 1;
    const lx =
      ix +
      side * (bw * s - 1 * s + (bw - btw) * lt * s * -side) +
      Math.sin(lt * 4) * 1.5 * s * side;
    const ly = bodyBase - lt * 28 * s - 2 * s;
    ctx.beginPath();
    ctx.ellipse(
      lx,
      ly,
      2.2 * s,
      1.2 * s,
      -0.4 * side + lf * 0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawSandAccent(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  _bodyTopW: number,
  bodyH: number,
  _time: number,
  pal: IdolStatuePalette
): void {
  ctx.fillStyle = pal.accent;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(ix - 7 * s, bodyBase + 2 * s, 5 * s, 2 * s, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    ix + 6 * s,
    bodyBase + 1 * s,
    4 * s,
    1.5 * s,
    -0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = pal.accentAlt;
  ctx.lineWidth = 0.6 * s;
  ctx.globalAlpha = 0.35;
  for (let w = 0; w < 3; w++) {
    const wy = bodyBase - 3 * s - w * 8 * s;
    ctx.beginPath();
    ctx.moveTo(ix - bodyW + 2 * s, wy);
    ctx.quadraticCurveTo(
      ix - bodyW + 1 * s,
      wy - 2 * s,
      ix - bodyW + 3 * s,
      wy - 4 * s
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = pal.accentAlt;
  ctx.globalAlpha = 0.3;
  const crackBase = bodyBase - bodyH * 0.3;
  for (let c = 0; c < 3; c++) {
    const cx = ix + (c - 1) * 3 * s;
    const cy = crackBase + c * 5 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 1 * s, cy + 3 * s);
    ctx.lineTo(cx - 0.5 * s, cy + 2 * s);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFrostAccent(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  bodyTopW: number,
  bodyH: number,
  _time: number,
  pal: IdolStatuePalette
): void {
  ctx.fillStyle = pal.accent;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(ix - 5 * s, bodyBase + 1 * s, 4 * s, 2 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(ix + 5 * s, bodyBase, 3 * s, 1.5 * s, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 1.2 * s;
  ctx.globalAlpha = 0.6;
  const iceBaseL = bodyBase - 2 * s;
  ctx.beginPath();
  ctx.moveTo(ix - bodyW + 1 * s, iceBaseL);
  ctx.lineTo(ix - bodyW - 0.5 * s, iceBaseL - 8 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ix - bodyW + 2 * s, iceBaseL - 1 * s);
  ctx.lineTo(ix - bodyW + 0.5 * s, iceBaseL - 6 * s);
  ctx.stroke();

  const iceBaseR = bodyBase - 4 * s;
  ctx.beginPath();
  ctx.moveTo(ix + bodyW - 1 * s, iceBaseR);
  ctx.lineTo(ix + bodyW + 0.5 * s, iceBaseR - 7 * s);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = pal.leafColor;
  ctx.globalAlpha = 0.5;
  for (let ic = 0; ic < 4; ic++) {
    const icy = bodyBase - bodyH * 0.2 - ic * 6 * s;
    const icx = ix - bodyTopW + 1 * s + Math.sin(ic * 2.1) * 2 * s;
    const icSize = (1.5 - ic * 0.2) * s;
    drawSnowflake(ctx, icx, icy, icSize);
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#e8f0ff";
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(
    ix,
    bodyBase - bodyH + 1 * s,
    bodyTopW * 0.8,
    2 * s,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSnowflake(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
): void {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5);
    ctx.stroke();
  }
}

function drawLavaAccent(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  bodyW: number,
  _bodyTopW: number,
  bodyH: number,
  time: number,
  pal: IdolStatuePalette
): void {
  const lavaFlicker = 0.5 + Math.sin(time * 3) * 0.3;

  ctx.fillStyle = pal.accent;
  ctx.globalAlpha = 0.25 + lavaFlicker * 0.15;
  ctx.beginPath();
  ctx.ellipse(
    ix - 6 * s,
    bodyBase + 2 * s,
    4 * s,
    1.8 * s,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    ix + 5 * s,
    bodyBase + 1 * s,
    3 * s,
    1.2 * s,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 1 * s;
  ctx.globalAlpha = 0.5 + lavaFlicker * 0.3;
  const crackPositions = [
    { dx: -1.5, x: ix - 3 * s, y1: bodyBase - 5 * s, y2: bodyBase - 14 * s },
    { dx: 1, x: ix + 2 * s, y1: bodyBase - 8 * s, y2: bodyBase - 18 * s },
    {
      dx: -0.8,
      x: ix - 1 * s,
      y1: bodyBase - bodyH * 0.4,
      y2: bodyBase - bodyH * 0.65,
    },
  ];
  for (const crack of crackPositions) {
    ctx.beginPath();
    ctx.moveTo(crack.x, crack.y1);
    ctx.quadraticCurveTo(
      crack.x + crack.dx * s,
      (crack.y1 + crack.y2) / 2,
      crack.x + crack.dx * 0.5 * s,
      crack.y2
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = pal.accentAlt;
  ctx.globalAlpha = 0.3 + lavaFlicker * 0.2;
  for (const crack of crackPositions) {
    const midY = (crack.y1 + crack.y2) / 2;
    ctx.beginPath();
    ctx.arc(crack.x + crack.dx * 0.7 * s, midY, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloatingParticles(
  ctx: CanvasRenderingContext2D,
  ix: number,
  bodyBase: number,
  s: number,
  time: number,
  glowPulse: number,
  pal: IdolStatuePalette
): void {
  const { glow } = pal;
  for (let p = 0; p < 5; p++) {
    const pp = (time * 0.8 + p * 1.2) % 3;
    const pa = Math.sin((pp / 3) * Math.PI) * 0.5;
    const px = ix + Math.sin(time * 0.5 + p * 1.3) * 12 * s;
    const py = bodyBase - 20 * s - pp * 8 * s;
    ctx.fillStyle = `rgba(${glow.r},${glow.g},${glow.b},${pa * glowPulse})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}
