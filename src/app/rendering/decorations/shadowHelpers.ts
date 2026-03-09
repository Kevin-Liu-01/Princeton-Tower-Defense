// Princeton Tower Defense - Directional Ground Shadow Helpers
// Consistent upper-left lighting → shadows extend toward the lower-right.

const SHADOW_DIR_X = 0.78;
const SHADOW_DIR_Y = 0.36;
const SHADOW_LEN_RATIO = 0.5;

function fmtA(a: number): string {
  return Math.max(0, Math.min(1, a)).toFixed(3);
}

/**
 * Draws a directional elliptical ground shadow with soft penumbra layers
 * and a linear gradient fade toward the shadow tip.
 *
 * All size params (footprintRx, footprintRy, objectHeight) must be pre-scaled.
 */
export function drawDirectionalShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  footprintRx: number,
  footprintRy: number,
  objectHeight: number,
  intensity: number = 0.3,
  tint: string = "0,0,0",
): void {
  const shadowLen = objectHeight * SHADOW_LEN_RATIO;
  const offX = shadowLen * SHADOW_DIR_X;
  const offY = shadowLen * SHADOW_DIR_Y;

  const scx = x + offX * 0.45;
  const scy = y + offY * 0.45;
  const srx = footprintRx + offX * 0.38;
  const sry = footprintRy + offY * 0.28;
  const rot = 0.12;

  // Outer penumbra
  ctx.beginPath();
  ctx.ellipse(
    scx + 2 * s, scy + 1 * s,
    srx + 4 * s, sry + 2 * s,
    rot, 0, Math.PI * 2,
  );
  ctx.fillStyle = `rgba(${tint},${fmtA(intensity * 0.14)})`;
  ctx.fill();

  // Mid penumbra
  ctx.beginPath();
  ctx.ellipse(
    scx + 1 * s, scy + 0.5 * s,
    srx + 2 * s, sry + 1 * s,
    rot, 0, Math.PI * 2,
  );
  ctx.fillStyle = `rgba(${tint},${fmtA(intensity * 0.26)})`;
  ctx.fill();

  // Core shadow with directional linear gradient
  ctx.beginPath();
  ctx.ellipse(scx, scy, srx, sry, rot, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(
    x - offX * 0.2, y - offY * 0.2,
    x + offX, y + offY,
  );
  grad.addColorStop(0, `rgba(${tint},${fmtA(intensity)})`);
  grad.addColorStop(0.45, `rgba(${tint},${fmtA(intensity * 0.52)})`);
  grad.addColorStop(0.8, `rgba(${tint},${fmtA(intensity * 0.12)})`);
  grad.addColorStop(1, `rgba(${tint},0)`);
  ctx.fillStyle = grad;
  ctx.fill();
}
