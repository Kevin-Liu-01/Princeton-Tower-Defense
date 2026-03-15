// Shared atmospheric overlay effects used across environment themes.
// Each function is a self-contained screen-space effect that composes
// over the game canvas to add depth and atmosphere.

import { getPerformanceSettings } from "../performance";

function atmosHash(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// GOD RAYS – Volumetric light beams from a point source
// ---------------------------------------------------------------------------

export function renderGodRays(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  originX: number,
  originY: number,
  r: number,
  g: number,
  b: number,
  baseAlpha: number,
  rayCount: number
): void {
  if (!getPerformanceSettings().showGodRays) return;
  const diagonal = Math.sqrt(
    canvasWidth * canvasWidth + canvasHeight * canvasHeight
  );
  const rayLength = diagonal * 1.3;
  const toCenterAngle = Math.atan2(
    canvasHeight / 2 - originY,
    canvasWidth / 2 - originX
  );
  const spreadRange = 1.0;

  for (let i = 0; i < rayCount; i++) {
    const phase = (i + 0.5) / rayCount;
    const baseAngle = toCenterAngle - spreadRange / 2 + phase * spreadRange;
    const driftAngle =
      baseAngle + Math.sin(time * 0.12 + i * 1.7) * 0.06;
    const spreadHalf =
      0.03 + Math.sin(time * 0.18 + i * 2.3) * 0.012;
    const rayAlpha =
      baseAlpha * (0.4 + Math.sin(time * 0.25 + i * 1.1) * 0.6);
    if (rayAlpha < 0.003) continue;

    const x1 = originX + Math.cos(driftAngle - spreadHalf) * rayLength;
    const y1 = originY + Math.sin(driftAngle - spreadHalf) * rayLength;
    const x2 = originX + Math.cos(driftAngle + spreadHalf) * rayLength;
    const y2 = originY + Math.sin(driftAngle + spreadHalf) * rayLength;
    const midX = originX + Math.cos(driftAngle) * rayLength;
    const midY = originY + Math.sin(driftAngle) * rayLength;

    const grad = ctx.createLinearGradient(originX, originY, midX, midY);
    grad.addColorStop(
      0,
      `rgba(${r},${g},${b},${(rayAlpha * 0.5).toFixed(4)})`
    );
    grad.addColorStop(
      0.12,
      `rgba(${r},${g},${b},${rayAlpha.toFixed(4)})`
    );
    grad.addColorStop(
      0.45,
      `rgba(${r},${g},${b},${(rayAlpha * 0.45).toFixed(4)})`
    );
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// FOG BANKS – Large slow-drifting elliptical fog formations
// ---------------------------------------------------------------------------

export function renderFogBanks(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  r: number,
  g: number,
  b: number,
  baseAlpha: number,
  bankCount: number
): void {
  for (let i = 0; i < bankCount; i++) {
    const driftSpeed = 0.06 + (i % 3) * 0.015;
    const phase = time * driftSpeed + i * 2.4;
    const x = canvasWidth * 0.5 + Math.sin(phase) * canvasWidth * 0.55;
    const y =
      canvasHeight * (0.2 + (i / bankCount) * 0.55) +
      Math.cos(phase * 0.7 + i) * 25;
    const sizeX =
      canvasWidth * (0.22 + Math.sin(time * 0.12 + i * 1.5) * 0.08);
    const sizeY = sizeX * 0.32;
    const alpha =
      baseAlpha * (0.5 + Math.sin(time * 0.2 + i * 1.8) * 0.5);
    if (alpha < 0.005) continue;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, sizeX);
    grad.addColorStop(
      0,
      `rgba(${r},${g},${b},${alpha.toFixed(4)})`
    );
    grad.addColorStop(
      0.3,
      `rgba(${r},${g},${b},${(alpha * 0.6).toFixed(4)})`
    );
    grad.addColorStop(
      0.65,
      `rgba(${r},${g},${b},${(alpha * 0.18).toFixed(4)})`
    );
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, sizeX, sizeY, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// AURORA – Animated curtain-like bands for winter/magical themes
// ---------------------------------------------------------------------------

export function renderAuroraEffect(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  intensity: number
): void {
  if (!getPerformanceSettings().showAurora) return;
  const bandCount = 4;

  for (let band = 0; band < bandCount; band++) {
    const baseY = canvasHeight * (0.03 + band * 0.065);
    const bandHeight = 28 + Math.sin(time * 0.3 + band * 0.8) * 12;

    const huePhase = time * 0.08 + band * 0.5;
    const r = Math.round(70 + 80 * Math.max(0, Math.sin(huePhase)));
    const g = Math.round(
      160 + 95 * Math.max(0, Math.sin(huePhase + 2.1))
    );
    const b = Math.round(
      130 + 125 * Math.max(0, Math.sin(huePhase + 4.2))
    );
    const alpha =
      intensity * (0.4 + Math.sin(time * 0.18 + band * 1.5) * 0.6);
    if (alpha < 0.005) continue;

    ctx.beginPath();
    for (let x = 0; x <= canvasWidth; x += 12) {
      const y =
        baseY +
        Math.sin(x * 0.007 + time * 0.35 + band) * 18 +
        Math.sin(x * 0.003 + time * 0.12) * 30;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let x = canvasWidth; x >= 0; x -= 12) {
      const y =
        baseY +
        bandHeight +
        Math.sin(x * 0.005 + time * 0.3 + band * 2.5) * 22 +
        Math.sin(x * 0.002 + time * 0.08 + band) * 25;
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    const fadeStart = Math.max(
      0.01,
      0.1 + Math.sin(time * 0.1 + band * 0.8) * 0.08
    );
    const fadeEnd = Math.min(
      0.99,
      0.9 + Math.sin(time * 0.08 + band * 1.3) * 0.08
    );

    const grad = ctx.createLinearGradient(0, baseY, canvasWidth, baseY);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(
      fadeStart,
      `rgba(${r},${g},${b},${alpha.toFixed(4)})`
    );
    grad.addColorStop(
      0.5,
      `rgba(${r},${g},${b},${Math.min(1, alpha * 1.2).toFixed(4)})`
    );
    grad.addColorStop(
      fadeEnd,
      `rgba(${r},${g},${b},${alpha.toFixed(4)})`
    );
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    ctx.fillStyle = grad;
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// SCREEN GLOW – Soft radial glow at an arbitrary position
// ---------------------------------------------------------------------------

export function renderScreenGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  alpha: number,
  size: number
): void {
  if (!getPerformanceSettings().showScreenGlow) return;
  if (alpha < 0.003) return;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
  grad.addColorStop(
    0,
    `rgba(${r},${g},${b},${alpha.toFixed(4)})`
  );
  grad.addColorStop(
    0.3,
    `rgba(${r},${g},${b},${(alpha * 0.5).toFixed(4)})`
  );
  grad.addColorStop(
    0.6,
    `rgba(${r},${g},${b},${(alpha * 0.12).toFixed(4)})`
  );
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// DAPPLED LIGHT – Shifting pools of light like sun through a canopy
// ---------------------------------------------------------------------------

export function renderDappledLight(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  r: number,
  g: number,
  b: number,
  baseAlpha: number,
  spotCount: number
): void {
  if (!getPerformanceSettings().showScreenGlow) return;

  for (let i = 0; i < spotCount; i++) {
    const seedX = atmosHash(i * 73.1 + 11.3);
    const seedY = atmosHash(i * 41.7 + 23.9);
    const driftX = Math.sin(time * 0.15 + i * 1.9) * canvasWidth * 0.06;
    const driftY = Math.cos(time * 0.12 + i * 2.3) * canvasHeight * 0.04;
    const x = seedX * canvasWidth + driftX;
    const y = seedY * canvasHeight + driftY;
    const sizePulse = 0.7 + Math.sin(time * 0.25 + i * 1.4) * 0.3;
    const spotSize = (40 + atmosHash(i * 17.3) * 80) * sizePulse;
    const alpha =
      baseAlpha * (0.3 + Math.sin(time * 0.2 + i * 2.1) * 0.7);
    if (alpha < 0.003) continue;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, spotSize);
    grad.addColorStop(0, `rgba(${r},${g},${b},${alpha.toFixed(4)})`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b},${(alpha * 0.4).toFixed(4)})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, spotSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// LIGHT SHAFTS – Vertical columns of light (e.g. moonlight, crevasse light)
// ---------------------------------------------------------------------------

export function renderLightShafts(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  r: number,
  g: number,
  b: number,
  baseAlpha: number,
  shaftCount: number
): void {
  if (!getPerformanceSettings().showGodRays) return;

  for (let i = 0; i < shaftCount; i++) {
    const seedX = atmosHash(i * 53.7 + 7.1);
    const driftX = Math.sin(time * 0.08 + i * 2.7) * canvasWidth * 0.03;
    const x = seedX * canvasWidth + driftX;
    const halfWidth = 15 + atmosHash(i * 29.3) * 30;
    const alpha =
      baseAlpha * (0.3 + Math.sin(time * 0.15 + i * 1.8) * 0.7);
    if (alpha < 0.003) continue;

    const grad = ctx.createLinearGradient(x - halfWidth, 0, x + halfWidth, 0);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(0.3, `rgba(${r},${g},${b},${(alpha * 0.5).toFixed(4)})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha.toFixed(4)})`);
    grad.addColorStop(0.7, `rgba(${r},${g},${b},${(alpha * 0.5).toFixed(4)})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    const vGrad = ctx.createLinearGradient(x, 0, x, canvasHeight);
    vGrad.addColorStop(0, `rgba(${r},${g},${b},${alpha.toFixed(4)})`);
    vGrad.addColorStop(0.3, `rgba(${r},${g},${b},${(alpha * 0.6).toFixed(4)})`);
    vGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = grad;
    ctx.fillRect(x - halfWidth, 0, halfWidth * 2, canvasHeight * 0.8);
    ctx.fillStyle = vGrad;
    ctx.fillRect(x - halfWidth, 0, halfWidth * 2, canvasHeight * 0.8);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// FROST VIGNETTE – Icy crystalline overlay creeping from screen edges
// ---------------------------------------------------------------------------

export function renderFrostVignette(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  intensity: number
): void {
  if (intensity < 0.003) return;

  const edgeDepth = Math.min(canvasWidth, canvasHeight) * 0.18;
  const pulse = 1 + Math.sin(time * 0.3) * 0.08;
  const depth = edgeDepth * pulse;

  // Top frost band
  const topGrad = ctx.createLinearGradient(0, 0, 0, depth);
  topGrad.addColorStop(0, `rgba(200,230,255,${(intensity * 0.5).toFixed(4)})`);
  topGrad.addColorStop(0.4, `rgba(180,210,240,${(intensity * 0.2).toFixed(4)})`);
  topGrad.addColorStop(1, "rgba(180,210,240,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, canvasWidth, depth);

  // Bottom frost band
  const botGrad = ctx.createLinearGradient(0, canvasHeight, 0, canvasHeight - depth);
  botGrad.addColorStop(0, `rgba(200,230,255,${(intensity * 0.4).toFixed(4)})`);
  botGrad.addColorStop(0.4, `rgba(180,210,240,${(intensity * 0.15).toFixed(4)})`);
  botGrad.addColorStop(1, "rgba(180,210,240,0)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, canvasHeight - depth, canvasWidth, depth);

  // Left/right frost
  const sideGradL = ctx.createLinearGradient(0, 0, depth, 0);
  sideGradL.addColorStop(0, `rgba(200,230,255,${(intensity * 0.35).toFixed(4)})`);
  sideGradL.addColorStop(1, "rgba(180,210,240,0)");
  ctx.fillStyle = sideGradL;
  ctx.fillRect(0, 0, depth, canvasHeight);

  const sideGradR = ctx.createLinearGradient(canvasWidth, 0, canvasWidth - depth, 0);
  sideGradR.addColorStop(0, `rgba(200,230,255,${(intensity * 0.35).toFixed(4)})`);
  sideGradR.addColorStop(1, "rgba(180,210,240,0)");
  ctx.fillStyle = sideGradR;
  ctx.fillRect(canvasWidth - depth, 0, depth, canvasHeight);

  // Ice crystal speckles along edges
  const crystalCount = 20;
  ctx.strokeStyle = `rgba(220,240,255,${(intensity * 0.3).toFixed(4)})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < crystalCount; i++) {
    const edge = i % 4;
    let cx: number, cy: number;
    const h = atmosHash(i * 37.1 + 99.3);
    const armLen = 3 + h * 8;
    switch (edge) {
      case 0: cx = h * canvasWidth; cy = atmosHash(i * 13.7) * depth * 0.6; break;
      case 1: cx = h * canvasWidth; cy = canvasHeight - atmosHash(i * 13.7) * depth * 0.6; break;
      case 2: cx = atmosHash(i * 13.7) * depth * 0.6; cy = h * canvasHeight; break;
      default: cx = canvasWidth - atmosHash(i * 13.7) * depth * 0.6; cy = h * canvasHeight; break;
    }
    const rot = time * 0.05 + i * 1.047;
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const angle = rot + (a * Math.PI) / 3;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * armLen, cy + Math.sin(angle) * armLen);
    }
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// MAGMA CRACKS – Glowing ground fissure lines
// ---------------------------------------------------------------------------

export function renderMagmaCracks(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  intensity: number
): void {
  if (intensity < 0.003) return;
  const crackCount = 6;

  for (let i = 0; i < crackCount; i++) {
    const startX = atmosHash(i * 71.3 + 5.7) * canvasWidth;
    const startY = canvasHeight * (0.5 + atmosHash(i * 33.1) * 0.45);
    const segments = 4 + Math.floor(atmosHash(i * 19.7) * 4);
    const pulse = 0.5 + Math.sin(time * 1.5 + i * 2.1) * 0.5;
    const alpha = intensity * pulse;
    if (alpha < 0.01) continue;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let px = startX;
    let py = startY;
    for (let s = 0; s < segments; s++) {
      const angle = atmosHash(i * 11.3 + s * 7.9) * Math.PI * 2;
      const len = 20 + atmosHash(i * 5.1 + s * 13.3) * 60;
      px += Math.cos(angle) * len;
      py += Math.sin(angle) * len * 0.4;
      ctx.lineTo(px, py);
    }

    ctx.strokeStyle = `rgba(255,200,50,${(alpha * 0.6).toFixed(4)})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,120,20,${alpha.toFixed(4)})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,200,${(alpha * 0.8).toFixed(4)})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// CLOUD SHADOWS – Slow-moving dark patches that drift across the ground
// ---------------------------------------------------------------------------

export function renderCloudShadows(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  baseAlpha: number,
  cloudCount: number
): void {
  for (let i = 0; i < cloudCount; i++) {
    const seedX = atmosHash(i * 61.7 + 3.1);
    const seedY = atmosHash(i * 47.3 + 17.9);
    const driftSpeed = 0.02 + atmosHash(i * 83.1) * 0.03;
    const rawX = (seedX * canvasWidth + time * driftSpeed * canvasWidth) % (canvasWidth * 1.5) - canvasWidth * 0.25;
    const y = seedY * canvasHeight + Math.sin(time * 0.1 + i * 2.0) * 20;
    const sizeX = canvasWidth * (0.15 + atmosHash(i * 29.7) * 0.2);
    const sizeY = sizeX * 0.4;
    const alpha = baseAlpha * (0.5 + Math.sin(time * 0.12 + i * 1.5) * 0.5);
    if (alpha < 0.005) continue;

    const grad = ctx.createRadialGradient(rawX, y, 0, rawX, y, sizeX);
    grad.addColorStop(0, `rgba(0,0,0,${alpha.toFixed(4)})`);
    grad.addColorStop(0.5, `rgba(0,0,0,${(alpha * 0.5).toFixed(4)})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(rawX, y, sizeX, sizeY, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// COLOR GRADE – Full-screen tint with highlight/shadow split-toning
// ---------------------------------------------------------------------------

export function renderColorGrade(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  shadowR: number,
  shadowG: number,
  shadowB: number,
  shadowAlpha: number,
  highlightR: number,
  highlightG: number,
  highlightB: number,
  highlightAlpha: number
): void {
  if (shadowAlpha > 0.003) {
    const sGrad = ctx.createLinearGradient(0, canvasHeight * 0.3, 0, canvasHeight);
    sGrad.addColorStop(0, `rgba(${shadowR},${shadowG},${shadowB},0)`);
    sGrad.addColorStop(1, `rgba(${shadowR},${shadowG},${shadowB},${shadowAlpha.toFixed(4)})`);
    ctx.fillStyle = sGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  if (highlightAlpha > 0.003) {
    const hGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.6);
    hGrad.addColorStop(0, `rgba(${highlightR},${highlightG},${highlightB},${highlightAlpha.toFixed(4)})`);
    hGrad.addColorStop(1, `rgba(${highlightR},${highlightG},${highlightB},0)`);
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}
