// Princeton Tower Defense - Isometric Flush Element System
// Unified rendering for elements flush with isometric wall faces:
// windows, doors, arrow slits, vents, panels, etc.
//
// All functions accept a `face` parameter ("left" | "right" | "front")
// that determines the isometric skew direction, ensuring elements
// look properly embedded in the wall they sit on.

import { ISO_Y_RATIO } from "../constants";

export type IsoFace = "left" | "right" | "front";

// ============================================================================
// CORE UTILITIES
// ============================================================================

export function getIsoSlope(face: IsoFace): number {
  return face === "right" ? -ISO_Y_RATIO : face === "left" ? ISO_Y_RATIO : 0;
}

export interface IsoCorners {
  tl: [number, number];
  tr: [number, number];
  br: [number, number];
  bl: [number, number];
}

/** Compute the 4 corners of a parallelogram flush with an isometric face. */
export function getIsoFlushCorners(
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number
): IsoCorners {
  const slope = getIsoSlope(face);
  const hw = w * zoom * 0.5;
  const hh = h * zoom * 0.5;
  return {
    bl: [cx - hw, cy + hh - hw * slope],
    br: [cx + hw, cy + hh + hw * slope],
    tl: [cx - hw, cy - hh - hw * slope],
    tr: [cx + hw, cy - hh + hw * slope],
  };
}

/** Compute recess offset for 3D depth effect on a given face. */
export function getIsoRecessOffset(
  face: IsoFace,
  depth: number
): [number, number] {
  const rdx = face === "right" ? depth : face === "left" ? -depth : 0;
  const rdy = -depth * ISO_Y_RATIO;
  return [rdx, rdy];
}

/** Trace a flush parallelogram path (no fill/stroke). */
export function traceIsoFlushRect(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number
): void {
  const c = getIsoFlushCorners(cx, cy, w, h, face, zoom);
  ctx.beginPath();
  ctx.moveTo(c.tl[0], c.tl[1]);
  ctx.lineTo(c.tr[0], c.tr[1]);
  ctx.lineTo(c.br[0], c.br[1]);
  ctx.lineTo(c.bl[0], c.bl[1]);
  ctx.closePath();
}

/**
 * Interpolate a point along the top edge of a flush rect at parameter t (0=left, 1=right).
 * Useful for placing elements along a face edge.
 */
export function lerpIsoEdge(
  c: IsoCorners,
  edge: "top" | "bottom" | "left" | "right",
  t: number
): [number, number] {
  let p0: [number, number], p1: [number, number];
  switch (edge) {
    case "top": {
      p0 = c.tl;
      p1 = c.tr;
      break;
    }
    case "bottom": {
      p0 = c.bl;
      p1 = c.br;
      break;
    }
    case "left": {
      p0 = c.tl;
      p1 = c.bl;
      break;
    }
    case "right": {
      p0 = c.tr;
      p1 = c.br;
      break;
    }
  }
  return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
}

// ============================================================================
// FLUSH RECTANGLE — basic filled parallelogram on an iso face
// ============================================================================

export interface IsoFlushRectOptions {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  recessDepth?: number;
  recessFill?: string;
}

export function drawIsoFlushRect(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number,
  options?: IsoFlushRectOptions
): void {
  const rd = (options?.recessDepth ?? 0) * zoom;

  if (rd > 0 && options?.recessFill) {
    const [rdx, rdy] = getIsoRecessOffset(face, rd);
    traceIsoFlushRect(ctx, cx + rdx, cy + rdy, w, h, face, zoom);
    ctx.fillStyle = options.recessFill;
    ctx.fill();
  }

  traceIsoFlushRect(ctx, cx, cy, w, h, face, zoom);
  if (options?.fill) {
    ctx.fillStyle = options.fill;
    ctx.fill();
  }
  if (options?.stroke) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = (options?.lineWidth ?? 0.8) * zoom;
    ctx.stroke();
  }
}

// ============================================================================
// GOTHIC WINDOW — pointed-arch window flush with an iso face
// ============================================================================

export function drawIsoGothicWindow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number,
  glowColor: string | null = "rgba(255, 150, 50",
  glowAlpha: number = 0.3,
  colors?: { frame?: string; void?: string; sill?: string }
): void {
  const slope = getIsoSlope(face);
  const hw = w * zoom * 0.5;
  const hh = h * zoom * 0.5;
  const archPeak = hh + 2.5 * zoom;

  const rd = 1.2 * zoom;
  const [rdx, rdy] = getIsoRecessOffset(face, rd);

  const frameColor = colors?.frame ?? "#2a2a32";
  const voidColor = colors?.void ?? "#1a1a22";
  const sillColor = colors?.sill ?? "#5a5a62";

  // Frame recess (darker border)
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.moveTo(cx - hw + rdx, cy - hh + -hw * slope + rdy);
  ctx.lineTo(cx + rdx, cy - archPeak + rdy);
  ctx.lineTo(cx + hw + rdx, cy - hh + hw * slope + rdy);
  ctx.lineTo(cx + hw + rdx, cy + hh + hw * slope + rdy);
  ctx.lineTo(cx - hw + rdx, cy + hh + -hw * slope + rdy);
  ctx.closePath();
  ctx.fill();

  // Window void (darkest)
  ctx.fillStyle = voidColor;
  ctx.beginPath();
  ctx.moveTo(cx - hw, cy - hh + -hw * slope);
  ctx.lineTo(cx, cy - archPeak);
  ctx.lineTo(cx + hw, cy - hh + hw * slope);
  ctx.lineTo(cx + hw, cy + hh + hw * slope);
  ctx.lineTo(cx - hw, cy + hh + -hw * slope);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Inner glow
  if (glowColor) {
    ctx.fillStyle = `${glowColor}, ${glowAlpha})`;
    ctx.beginPath();
    const inset = 0.3 * zoom;
    ctx.moveTo(cx - hw + inset, cy - hh + -hw * slope + inset * ISO_Y_RATIO);
    ctx.lineTo(cx, cy - archPeak + inset);
    ctx.lineTo(cx + hw - inset, cy - hh + hw * slope + inset * ISO_Y_RATIO);
    ctx.lineTo(cx + hw - inset, cy + hh + hw * slope - inset * ISO_Y_RATIO);
    ctx.lineTo(cx - hw + inset, cy + hh + -hw * slope - inset * ISO_Y_RATIO);
    ctx.closePath();
    ctx.fill();
  }

  // Stone sill at bottom
  ctx.fillStyle = sillColor;
  ctx.beginPath();
  const sillH = 1 * zoom;
  ctx.moveTo(cx - hw - 0.5 * zoom, cy + hh + -hw * slope);
  ctx.lineTo(cx + hw + 0.5 * zoom, cy + hh + hw * slope);
  ctx.lineTo(cx + hw + 0.5 * zoom, cy + hh + hw * slope + sillH);
  ctx.lineTo(cx - hw - 0.5 * zoom, cy + hh + -hw * slope + sillH);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// FLUSH SLIT — arrow slit / narrow slot on an iso face
// ============================================================================

export interface IsoFlushSlitOptions {
  voidColor?: string;
  glowColor?: string | null;
  glowAlpha?: number;
  frameColor?: string;
}

export function drawIsoFlushSlit(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number,
  options?: IsoFlushSlitOptions
): void {
  const slope = getIsoSlope(face);
  const hw = w * zoom * 0.5;
  const hh = h * zoom * 0.5;

  const rd = 0.8 * zoom;
  const [rdx, rdy] = getIsoRecessOffset(face, rd);

  const frameColor = options?.frameColor ?? "rgba(10,10,15,0.4)";
  const voidColor = options?.voidColor ?? "rgba(10,10,15,0.7)";

  // Recessed frame
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.moveTo(cx + rdx, cy - hh - hw * slope + rdy);
  ctx.lineTo(cx + hw + rdx, cy + rdy);
  ctx.lineTo(cx + rdx, cy + hh + hw * slope + rdy);
  ctx.lineTo(cx - hw + rdx, cy + rdy);
  ctx.closePath();
  ctx.fill();

  // Diamond void — narrow slit shape
  ctx.fillStyle = voidColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh - hw * slope);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh + hw * slope);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
  ctx.fill();

  // Inner glow
  if (options?.glowColor) {
    const alpha = options?.glowAlpha ?? 0.3;
    ctx.fillStyle = `${options.glowColor}, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh * 0.8 - hw * slope * 0.8);
    ctx.lineTo(cx + hw * 0.7, cy);
    ctx.lineTo(cx, cy + hh * 0.8 + hw * slope * 0.8);
    ctx.lineTo(cx - hw * 0.7, cy);
    ctx.closePath();
    ctx.fill();
  }
}

// ============================================================================
// FLUSH DOOR — arched doorway flush with an iso face
// ============================================================================

export interface IsoFlushDoorOptions {
  frameColor?: string;
  bodyDark?: string;
  bodyMid?: string;
  bodyLight?: string;
  handleColor?: string;
  hasStep?: boolean;
  stepColor?: string;
  plankLines?: number;
}

export function drawIsoFlushDoor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number,
  options?: IsoFlushDoorOptions
): void {
  const slope = getIsoSlope(face);
  const hw = w * zoom * 0.5;
  const hh = h * zoom * 0.5;
  const archRise = hw * 0.6;

  const rd = 1.5 * zoom;
  const [rdx, rdy] = getIsoRecessOffset(face, rd);

  const frameColor = options?.frameColor ?? "#4A3828";
  const bodyDark = options?.bodyDark ?? "#2A1808";
  const bodyMid = options?.bodyMid ?? "#3A2210";
  const bodyLight = options?.bodyLight ?? "#4A3220";
  const handleColor = options?.handleColor ?? "#C8A860";
  const stepColor = options?.stepColor ?? "#5A4A38";
  const plankCount = options?.plankLines ?? 3;

  // Bottom-center of door (baseline)
  const botY = cy + hh;
  const botSlopeL = -hw * slope;
  const botSlopeR = hw * slope;

  // Step (small isometric platform in front of door)
  if (options?.hasStep !== false) {
    const stepW = hw * 1.4;
    const stepH = 1.5 * zoom;
    const stepD = 2 * zoom;
    ctx.fillStyle = stepColor;
    ctx.beginPath();
    ctx.moveTo(cx - stepW, botY + botSlopeL);
    ctx.lineTo(cx + stepW, botY + botSlopeR);
    ctx.lineTo(
      cx + stepW - stepD * (face === "right" ? 1 : face === "left" ? -1 : 0),
      botY + botSlopeR + stepH + stepD * ISO_Y_RATIO
    );
    ctx.lineTo(
      cx - stepW - stepD * (face === "right" ? 1 : face === "left" ? -1 : 0),
      botY + botSlopeL + stepH + stepD * ISO_Y_RATIO
    );
    ctx.closePath();
    ctx.fill();
    // Step top
    ctx.fillStyle = "#6A5A48";
    ctx.beginPath();
    ctx.moveTo(cx - stepW, botY + botSlopeL);
    ctx.lineTo(cx + stepW, botY + botSlopeR);
    ctx.lineTo(
      cx + stepW + stepD * (face === "right" ? -1 : face === "left" ? 1 : 0),
      botY + botSlopeR - stepD * ISO_Y_RATIO
    );
    ctx.lineTo(
      cx - stepW + stepD * (face === "right" ? -1 : face === "left" ? 1 : 0),
      botY + botSlopeL - stepD * ISO_Y_RATIO
    );
    ctx.closePath();
    ctx.fill();
  }

  // Frame recess (darker surround visible behind door)
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  const fmHw = hw * 1.1;
  const fmHh = hh * 1.05;
  ctx.moveTo(cx - fmHw + rdx, botY - fmHw * slope + rdy);
  ctx.lineTo(cx - fmHw + rdx, botY - 2 * fmHh - fmHw * slope + rdy);
  ctx.quadraticCurveTo(
    cx + rdx,
    botY - 2 * fmHh - archRise * 2.2 + rdy,
    cx + fmHw + rdx,
    botY - 2 * fmHh + fmHw * slope + rdy
  );
  ctx.lineTo(cx + fmHw + rdx, botY + fmHw * slope + rdy);
  ctx.closePath();
  ctx.fill();

  // Door body with gradient
  const gradStart =
    face === "right" ? cx - hw : face === "left" ? cx + hw : cx - hw;
  const gradEnd =
    face === "right" ? cx + hw : face === "left" ? cx - hw : cx + hw;
  const doorG = ctx.createLinearGradient(gradStart, cy, gradEnd, cy);
  doorG.addColorStop(0, bodyDark);
  doorG.addColorStop(0.3, bodyLight);
  doorG.addColorStop(0.7, bodyMid);
  doorG.addColorStop(1, bodyDark);
  ctx.fillStyle = doorG;

  // Arched door shape (parallelogram bottom + arch top)
  ctx.beginPath();
  ctx.moveTo(cx - hw, botY - hw * slope);
  ctx.lineTo(cx - hw, botY - 2 * hh + archRise - hw * slope);
  ctx.quadraticCurveTo(
    cx,
    botY - 2 * hh - archRise * 1.5,
    cx + hw,
    botY - 2 * hh + archRise + hw * slope
  );
  ctx.lineTo(cx + hw, botY + hw * slope);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Horizontal plank lines (skewed to match face)
  ctx.strokeStyle = "rgba(70,55,35,0.4)";
  ctx.lineWidth = 0.6 * zoom;
  for (let p = 1; p <= plankCount; p++) {
    const t = p / (plankCount + 1);
    const plankY = botY - 2 * hh * t;
    ctx.beginPath();
    ctx.moveTo(cx - hw, plankY - hw * slope);
    ctx.lineTo(cx + hw, plankY + hw * slope);
    ctx.stroke();
  }

  // Iron hinge straps
  ctx.fillStyle = "#5A4A35";
  for (let hi = 0; hi < 2; hi++) {
    const hingeT = 0.3 + hi * 0.4;
    const hingeY = botY - 2 * hh * hingeT;
    const hingeSide = face === "right" ? -1 : 1;
    const hingeX = cx + hingeSide * hw * 0.9;
    const hingSlopeY =
      hingeX === cx + hw * 0.9 ? hw * 0.9 * slope : -hw * 0.9 * slope;
    ctx.beginPath();
    ctx.arc(hingeX, hingeY + hingSlopeY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Door handle
  ctx.fillStyle = handleColor;
  const handleSide = face === "right" ? 1 : -1;
  const handleX = cx + handleSide * hw * 0.3;
  const handleSlopeY =
    handleX > cx ? (handleX - cx) * slope : -(cx - handleX) * slope;
  ctx.beginPath();
  ctx.arc(handleX, botY - hh * 0.9 + handleSlopeY, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  // Handle ring
  ctx.strokeStyle = handleColor;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    handleX,
    botY - hh * 0.9 + handleSlopeY - 1.5 * zoom,
    1 * zoom,
    0,
    Math.PI
  );
  ctx.stroke();
}

// ============================================================================
// FLUSH VENT — louvered vent/grate on an iso face
// ============================================================================

export interface IsoFlushVentOptions {
  frameColor?: string;
  slats?: number;
  slatColor?: string;
  bgColor?: string;
}

export function drawIsoFlushVent(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number,
  options?: IsoFlushVentOptions
): void {
  const slope = getIsoSlope(face);
  const hw = w * zoom * 0.5;
  const hh = h * zoom * 0.5;

  const rd = 0.6 * zoom;
  const [rdx, rdy] = getIsoRecessOffset(face, rd);

  const frameColor = options?.frameColor ?? "#3a3a42";
  const bgColor = options?.bgColor ?? "#1a1a22";
  const slatColor = options?.slatColor ?? "#4a4a52";
  const slats = options?.slats ?? 4;

  // Frame
  const c = getIsoFlushCorners(cx, cy, w + 1, h + 1, face, zoom);
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.moveTo(c.tl[0], c.tl[1]);
  ctx.lineTo(c.tr[0], c.tr[1]);
  ctx.lineTo(c.br[0], c.br[1]);
  ctx.lineTo(c.bl[0], c.bl[1]);
  ctx.closePath();
  ctx.fill();

  // Recessed void behind slats
  traceIsoFlushRect(ctx, cx + rdx, cy + rdy, w, h, face, zoom);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // Louvered slats
  ctx.strokeStyle = slatColor;
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 1; i <= slats; i++) {
    const t = i / (slats + 1);
    const slatY = cy - hh + 2 * hh * t;
    ctx.beginPath();
    ctx.moveTo(cx - hw, slatY - hw * slope);
    ctx.lineTo(cx + hw, slatY + hw * slope);
    ctx.stroke();
  }
}

// ============================================================================
// FLUSH PANEL — decorative rectangular inset panel on an iso face
// ============================================================================

export interface IsoFlushPanelOptions {
  fill?: string;
  borderColor?: string;
  recessDepth?: number;
  innerGlow?: string;
}

export function drawIsoFlushPanel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  face: IsoFace,
  zoom: number,
  options?: IsoFlushPanelOptions
): void {
  const rd = (options?.recessDepth ?? 0.8) * zoom;
  const [rdx, rdy] = getIsoRecessOffset(face, rd);

  // Outer border/bevel
  if (options?.borderColor) {
    traceIsoFlushRect(ctx, cx, cy, w + 0.8, h + 0.8, face, zoom);
    ctx.fillStyle = options.borderColor;
    ctx.fill();
  }

  // Recessed background
  traceIsoFlushRect(ctx, cx + rdx, cy + rdy, w, h, face, zoom);
  ctx.fillStyle = options?.fill ?? "#2a2a32";
  ctx.fill();

  // Inner glow
  if (options?.innerGlow) {
    traceIsoFlushRect(
      ctx,
      cx + rdx * 0.5,
      cy + rdy * 0.5,
      w * 0.85,
      h * 0.85,
      face,
      zoom
    );
    ctx.fillStyle = options.innerGlow;
    ctx.fill();
  }
}
