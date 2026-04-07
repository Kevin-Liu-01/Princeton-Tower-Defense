// Princeton Tower Defense - Enemy Rendering Helpers
// Shared shape functions for enemy rendering to reduce duplication.

export interface GradientStop {
  offset: number;
  color: string;
}

// ============================================================================
// RADIAL AURA
// ============================================================================

/**
 * Draws a radial aura glow around an enemy.
 */
export function drawRadialAura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  stops: GradientStop[]
): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  for (const s of stops) {
    grad.addColorStop(s.offset, s.color);
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// FACE / HEAD
// ============================================================================

/**
 * Draws a radial-gradient face circle (or ellipse).
 * @param headY - vertical center of the head
 * @param gradRadius - outer radius of the radial gradient
 * @param stops - gradient color stops (inner to outer)
 * @param drawRx - x-radius for drawing (defaults to gradRadius)
 * @param drawRy - if provided, draws an ellipse with rx=drawRx, ry=drawRy
 */
export function drawFaceCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headY: number,
  gradRadius: number,
  stops: GradientStop[],
  drawRx?: number,
  drawRy?: number
): void {
  const grad = ctx.createRadialGradient(cx, headY, 0, cx, headY, gradRadius);
  for (const s of stops) {
    grad.addColorStop(s.offset, s.color);
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  const rx = drawRx ?? gradRadius;
  if (drawRy !== undefined) {
    ctx.ellipse(cx, headY, rx, drawRy, 0, 0, Math.PI * 2);
  } else {
    ctx.arc(cx, headY, rx, 0, Math.PI * 2);
  }
  ctx.fill();
}

// ============================================================================
// PAIRED EYES
// ============================================================================

/**
 * Draws a pair of symmetric circles (eyes, pupils, or reflections).
 * Both circles share the same fillStyle and radius, positioned symmetrically
 * about `cx` at offset `spacing` (half the inter-eye distance).
 */
export function drawPairedCircles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spacing: number,
  radius: number,
  fillStyle: string
): void {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.arc(cx - spacing, cy, radius, 0, Math.PI * 2);
  ctx.arc(cx + spacing, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws a full set of humanoid eyes: whites/iris, pupils, and optional shine.
 * Each layer is a pair of symmetric circles.
 */
export function drawEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spacing: number,
  layers: {
    radius: number;
    color: string;
    yOffset?: number;
    xOffset?: number;
  }[]
): void {
  for (const layer of layers) {
    const ly = cy + (layer.yOffset ?? 0);
    const lxOff = layer.xOffset ?? 0;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.arc(cx - spacing + lxOff, ly, layer.radius, 0, Math.PI * 2);
    ctx.arc(cx + spacing - lxOff, ly, layer.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// ROBE / CLOAK BODY
// ============================================================================

/**
 * Draws a robe/cloak body shape with optional tattered bottom edge.
 * The shape is: bottom-left → (optional jagged bottom) → bottom-right →
 * right curve up to shoulder → shoulder line → left curve down to bottom-left.
 *
 * @param shoulderW - half-width at the shoulders (e.g. `size * 0.15`)
 * @param shoulderY - y-position of shoulders
 * @param bottomW - half-width at bottom (e.g. `size * 0.4`)
 * @param bottomY - y-position of bottom
 * @param curveW - control point width for the side curves (e.g. `size * 0.45`)
 * @param curveY - control point y for the side curves (e.g. `y`)
 * @param jaggedEdge - if provided, renders a tattered bottom edge
 */
export function drawRobeBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  shoulderW: number,
  shoulderY: number,
  bottomW: number,
  bottomY: number,
  curveW: number,
  curveY: number,
  jaggedEdge?: {
    count: number;
    amplitude: number;
    time: number;
    speed: number;
    altAmplitude?: number;
  }
): void {
  ctx.beginPath();
  ctx.moveTo(cx - bottomW, bottomY);

  if (jaggedEdge) {
    const step = (bottomW * 2) / jaggedEdge.count;
    for (let i = 0; i <= jaggedEdge.count; i++) {
      const jagX = cx - bottomW + i * step;
      const jagY =
        bottomY +
        Math.sin(jaggedEdge.time * jaggedEdge.speed + i * 1.1) *
          jaggedEdge.amplitude +
        (i % 2) * (jaggedEdge.altAmplitude ?? jaggedEdge.amplitude * 0.8);
      ctx.lineTo(jagX, jagY);
    }
  } else {
    ctx.lineTo(cx + bottomW, bottomY);
  }

  ctx.quadraticCurveTo(cx + curveW, curveY, cx + shoulderW, shoulderY);
  ctx.lineTo(cx - shoulderW, shoulderY);
  ctx.quadraticCurveTo(cx - curveW, curveY, cx - bottomW, bottomY);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// HORIZONTAL GRADIENT (commonly used for robes, cloaks)
// ============================================================================

/**
 * Creates and applies a horizontal linear gradient.
 * Commonly used for robe/cloak body fills with dark edges and lighter center.
 */
export function setHorizontalGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  halfWidth: number,
  stops: GradientStop[]
): void {
  const grad = ctx.createLinearGradient(cx - halfWidth, 0, cx + halfWidth, 0);
  for (const s of stops) {
    grad.addColorStop(s.offset, s.color);
  }
  ctx.fillStyle = grad;
}

/**
 * Creates and applies a vertical linear gradient.
 */
export function setVerticalGradient(
  ctx: CanvasRenderingContext2D,
  y1: number,
  y2: number,
  stops: GradientStop[]
): void {
  const grad = ctx.createLinearGradient(0, y1, 0, y2);
  for (const s of stops) {
    grad.addColorStop(s.offset, s.color);
  }
  ctx.fillStyle = grad;
}
