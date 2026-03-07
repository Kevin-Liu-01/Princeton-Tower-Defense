// Shared atmospheric overlay effects used across environment themes.
// Each function is a self-contained screen-space effect that composes
// over the game canvas to add depth and atmosphere.

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

    // Top edge (wavy)
    ctx.beginPath();
    for (let x = 0; x <= canvasWidth; x += 12) {
      const y =
        baseY +
        Math.sin(x * 0.007 + time * 0.35 + band) * 18 +
        Math.sin(x * 0.003 + time * 0.12) * 30;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Bottom edge (reverse, slightly different wave)
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
