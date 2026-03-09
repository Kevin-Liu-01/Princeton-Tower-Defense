// =============================================================================
// CENTRALIZED RETICLE SYSTEM
// Standardized canvas reticle rendering for all targeting, selection, and
// range indicators. Each category shares a visual language while allowing
// color and detail customization.
// =============================================================================

import { ISO_Y_RATIO } from "../../constants";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ReticleCategory =
  | "targeting"    // Offensive aiming (mortar manual, spell AoE)
  | "relocation"   // Troop/hero move destination
  | "spell"        // Spell cast area
  | "selection"    // Selected unit ring
  | "range"        // Tower/station/building range ellipse
  | "aesthetic";   // Decorative crosshairs (scope, turret sight)

export interface ReticleColor {
  r: number;
  g: number;
  b: number;
}

export interface ReticleStyle {
  color: ReticleColor;
  glowColor?: ReticleColor;
  radius: number;
  lineWidth?: number;
  dashPattern?: number[];
  dashSpeed?: number;
  pulseSpeed?: number;
  pulseMin?: number;
  pulseMax?: number;
  rotationSpeed?: number;
  fillAlpha?: number;
  strokeAlpha?: number;
}

// -----------------------------------------------------------------------------
// Color presets (reusable across categories)
// -----------------------------------------------------------------------------

export const RETICLE_COLORS = {
  orange:   { r: 255, g: 120, b: 20 }  as ReticleColor,
  red:      { r: 255, g: 80,  b: 60 }  as ReticleColor,
  blue:     { r: 120, g: 180, b: 255 } as ReticleColor,
  cyan:     { r: 0,   g: 230, b: 200 } as ReticleColor,
  green:    { r: 100, g: 220, b: 140 } as ReticleColor,
  gold:     { r: 255, g: 200, b: 100 } as ReticleColor,
  purple:   { r: 180, g: 130, b: 255 } as ReticleColor,
  white:    { r: 255, g: 255, b: 255 } as ReticleColor,
  violet:   { r: 160, g: 100, b: 200 } as ReticleColor,
  rose:     { r: 251, g: 113, b: 133 } as ReticleColor,
} as const;

// -----------------------------------------------------------------------------
// Shared primitives — building blocks for all reticle types
// -----------------------------------------------------------------------------

function rgba(c: ReticleColor, a: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
}

function pulse(time: number, speed: number, min: number, max: number): number {
  return min + (Math.sin(time * speed) * 0.5 + 0.5) * (max - min);
}

export function drawIsometricEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  zoom: number,
  options: {
    fillColor?: string;
    strokeColor?: string;
    lineWidth?: number;
    dash?: number[];
    dashOffset?: number;
    shadowColor?: string;
    shadowBlur?: number;
  } = {},
): void {
  const rX = radiusX * zoom;
  const rY = rX * ISO_Y_RATIO;

  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = options.shadowBlur ?? 12 * zoom;
  }

  if (options.dash) {
    ctx.setLineDash(options.dash.map((d) => d * zoom));
    if (options.dashOffset !== undefined) ctx.lineDashOffset = options.dashOffset;
  }

  ctx.beginPath();
  ctx.ellipse(x, y, rX, rY, 0, 0, Math.PI * 2);

  if (options.fillColor) {
    ctx.fillStyle = options.fillColor;
    ctx.fill();
  }
  if (options.strokeColor) {
    ctx.strokeStyle = options.strokeColor;
    ctx.lineWidth = (options.lineWidth ?? 2) * zoom;
    ctx.stroke();
  }

  if (options.dash) ctx.setLineDash([]);
  if (options.shadowColor) {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }
}

export function drawCrosshairLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  zoom: number,
  color: string,
  lineWidth: number = 1.5,
  isometric: boolean = true,
): void {
  const iR = innerRadius * zoom;
  const oR = outerRadius * zoom;
  const yRatio = isometric ? ISO_Y_RATIO : 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * zoom;
  ctx.beginPath();
  // Left
  ctx.moveTo(x - oR, y);
  ctx.lineTo(x - iR, y);
  // Right
  ctx.moveTo(x + iR, y);
  ctx.lineTo(x + oR, y);
  // Top
  ctx.moveTo(x, y - oR * yRatio);
  ctx.lineTo(x, y - iR * yRatio);
  // Bottom
  ctx.moveTo(x, y + iR * yRatio);
  ctx.lineTo(x, y + oR * yRatio);
  ctx.stroke();
}

export function drawRotatingTicks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  tickLength: number,
  count: number,
  rotation: number,
  zoom: number,
  color: string,
  lineWidth: number = 2,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * zoom;
  const r = radius * zoom;
  const tl = tickLength * zoom;

  for (let i = 0; i < count; i++) {
    const angle = rotation + (i / count) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x + cos * r, y + sin * r * ISO_Y_RATIO);
    ctx.lineTo(x + cos * (r + tl), y + sin * (r + tl) * ISO_Y_RATIO);
    ctx.stroke();
  }
}

function drawRadialGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  zoom: number,
  color: ReticleColor,
  alpha: number,
): void {
  const r = radius * zoom;
  ctx.save();
  ctx.scale(1, ISO_Y_RATIO);
  const scaledY = y / ISO_Y_RATIO;
  const grad = ctx.createRadialGradient(x, scaledY, 0, x, scaledY, r);
  grad.addColorStop(0, rgba(color, alpha));
  grad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, scaledY, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCenterDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zoom: number,
  color: string,
  radius: number = 2.5,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius * zoom, 0, Math.PI * 2);
  ctx.fill();
}

function drawRotatingCrosshairArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  rotation: number,
  zoom: number,
  color: string,
  armCount: number = 4,
  lineWidth: number = 1.5,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * zoom;
  const iR = innerRadius * zoom;
  const oR = outerRadius * zoom;
  for (let i = 0; i < armCount; i++) {
    const a = (i * Math.PI * 2) / armCount;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(cos * iR, sin * iR);
    ctx.lineTo(cos * oR, sin * oR);
    ctx.stroke();
  }
  ctx.restore();
}

// =============================================================================
// CATEGORY: TARGETING — Offensive aiming reticles
// Used by: mortar manual target, sentinel nexus
// =============================================================================

export interface TargetingReticleConfig {
  x: number;
  y: number;
  zoom: number;
  time: number;
  color?: ReticleColor;
  glowColor?: ReticleColor;
  radius?: number;
  showGlow?: boolean;
  showRotatingArms?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  aoeRadius?: number;
  laserLine?: { fromX: number; fromY: number };
  active?: boolean;
}

export function renderTargetingReticle(
  ctx: CanvasRenderingContext2D,
  config: TargetingReticleConfig,
): void {
  const {
    x, y, zoom, time,
    color = RETICLE_COLORS.orange,
    glowColor = { r: 255, g: 80, b: 0 },
    radius = 48,
    showGlow = true,
    showRotatingArms = true,
    showTicks = true,
    tickCount = 4,
    aoeRadius,
    laserLine,
    active = false,
  } = config;

  const p = pulse(time, 3, 0.6, 1.0);
  const rot = time * 0.8;
  const innerR = radius * 0.29;

  ctx.save();

  // Laser line from source to target
  if (laserLine) {
    const lineAlpha = active ? 0.6 + p * 0.25 : 0.35 + p * 0.15;
    ctx.strokeStyle = rgba(color, lineAlpha);
    ctx.lineWidth = (active ? 2.5 : 1.8) * zoom;
    ctx.setLineDash([(active ? 10 : 8) * zoom, 6 * zoom]);
    ctx.lineDashOffset = -time * 50;
    ctx.beginPath();
    ctx.moveTo(laserLine.fromX, laserLine.fromY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // AoE zone fill (e.g. sentinel strike zone)
  if (aoeRadius) {
    const fillAlpha = active ? 0.15 + p * 0.1 : 0.08 + p * 0.06;
    drawIsometricEllipse(ctx, x, y, aoeRadius, zoom, {
      fillColor: rgba(glowColor, fillAlpha),
    });
  }

  // Radial glow
  if (showGlow) {
    drawRadialGlow(ctx, x, y, innerR * 2, zoom, glowColor, 0.25 * p);
  }

  // Outer pulsing dashed ring
  drawIsometricEllipse(ctx, x, y, radius, zoom, {
    strokeColor: rgba(color, 0.35 + p * 0.25),
    lineWidth: 2,
    dash: [6, 4],
    dashOffset: -time * 40,
  });

  // Inner solid ring
  drawIsometricEllipse(ctx, x, y, radius * 0.6, zoom, {
    strokeColor: rgba(color, 0.45 * p),
    lineWidth: 1.5,
  });

  // Rotating crosshair arms
  if (showRotatingArms) {
    drawRotatingCrosshairArms(
      ctx, x, y, innerR, radius * 0.7, rot, zoom,
      rgba(color, 0.5 + p * 0.3), 4, 1.5,
    );
  }

  // Rotating tick marks
  if (showTicks) {
    drawRotatingTicks(
      ctx, x, y, radius * 0.85, 6, tickCount, rot, zoom,
      rgba(color, 0.5 * p), 2,
    );
  }

  // Center dot
  drawCenterDot(ctx, x, y, zoom, rgba(RETICLE_COLORS.white, 0.7 + p * 0.3));

  ctx.restore();
}

// =============================================================================
// CATEGORY: SPELL — Spell cast area reticles
// Used by: fireball, lightning, troop placement
// =============================================================================

export type SpellReticleVariant = "fireball" | "lightning" | "placement";

const SPELL_PRESETS: Record<SpellReticleVariant, {
  color: ReticleColor;
  glowColor: ReticleColor;
  radius: number;
}> = {
  fireball:  { color: { r: 255, g: 120, b: 20 },  glowColor: { r: 255, g: 80,  b: 0 },   radius: 50 },
  lightning: { color: { r: 120, g: 180, b: 255 }, glowColor: { r: 80,  g: 140, b: 255 }, radius: 45 },
  placement: { color: { r: 100, g: 220, b: 140 }, glowColor: { r: 50,  g: 200, b: 120 }, radius: 40 },
};

export interface SpellReticleConfig {
  x: number;
  y: number;
  zoom: number;
  time: number;
  variant?: SpellReticleVariant;
  color?: ReticleColor;
  glowColor?: ReticleColor;
  radius?: number;
}

export function renderSpellReticle(
  ctx: CanvasRenderingContext2D,
  config: SpellReticleConfig,
): void {
  const preset = config.variant ? SPELL_PRESETS[config.variant] : undefined;
  const {
    x, y, zoom, time,
    color = preset?.color ?? RETICLE_COLORS.orange,
    glowColor = preset?.glowColor ?? RETICLE_COLORS.orange,
    radius = preset?.radius ?? 50,
  } = config;

  const p = pulse(time, 3, 0.7, 1.0);

  ctx.save();

  // Outer glow halo (isometric ellipse)
  const haloR = radius * 1.5;
  drawRadialGlow(ctx, x, y, haloR, zoom, glowColor, 0.08 * p);

  // Main dashed reticle ellipse
  drawIsometricEllipse(ctx, x, y, radius, zoom, {
    strokeColor: rgba(color, 0.6 * p),
    lineWidth: 2,
    dash: [8, 5],
  });

  // Inner solid ring
  drawIsometricEllipse(ctx, x, y, radius * 0.6, zoom, {
    strokeColor: rgba(color, 0.45 * p),
    lineWidth: 1.5,
  });

  // Crosshair lines with gap
  const chOuter = radius * 0.5;
  const chInner = radius * 0.15;
  drawCrosshairLines(ctx, x, y, chInner, chOuter, zoom, rgba(color, 0.7 * p), 1.5);

  // Center dot
  drawCenterDot(ctx, x, y, zoom, rgba(RETICLE_COLORS.white, 0.8 * p));

  // Rotating tick marks
  drawRotatingTicks(
    ctx, x, y, radius * 0.85, 6, 4, time * 0.8, zoom,
    rgba(color, 0.5 * p), 2,
  );

  ctx.restore();
}

// =============================================================================
// CATEGORY: RELOCATION — Troop/hero move destination
// Used by: renderPathTargetIndicator
// =============================================================================

export interface RelocationReticleConfig {
  targetX: number;
  targetY: number;
  unitX: number;
  unitY: number;
  zoom: number;
  time: number;
  color?: ReticleColor;
  isValid?: boolean;
  showTrailLine?: boolean;
  showDirectionArrow?: boolean;
}

export function renderRelocationReticle(
  ctx: CanvasRenderingContext2D,
  config: RelocationReticleConfig,
): void {
  const {
    targetX: tx, targetY: ty, unitX: ux, unitY: uy,
    zoom, time,
    color = RETICLE_COLORS.gold,
    isValid = true,
    showTrailLine = true,
    showDirectionArrow = true,
  } = config;

  const validMul = isValid ? 1 : 0.4;
  const p = pulse(time, 3, 0.85, 1.0);
  const outerR = 16 * p;

  ctx.save();

  // Marching-ants trail line from unit to target
  if (showTrailLine) {
    ctx.strokeStyle = rgba(color, 0.35 * validMul);
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = time * 35;
    ctx.beginPath();
    ctx.moveTo(ux, uy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Outer isometric ring
  drawIsometricEllipse(ctx, tx, ty, outerR, zoom, {
    strokeColor: rgba(color, 0.65 * validMul),
    lineWidth: 2,
  });

  // Inner filled dot
  drawIsometricEllipse(ctx, tx, ty, 5, zoom, {
    fillColor: rgba(color, 0.8 * validMul),
  });

  // Crosshair spurs outside the ring
  const spurOuter = outerR + 11;
  const spurInner = outerR + 4;
  drawCrosshairLines(ctx, tx, ty, spurInner, spurOuter, zoom, rgba(color, 0.5 * validMul), 1.5);

  // Direction arrow along the trail
  if (showDirectionArrow) {
    const angle = Math.atan2(ty - uy, tx - ux);
    const arrowDist = (outerR + 14) * zoom;
    const arrowX = tx - Math.cos(angle) * arrowDist;
    const arrowY = ty - Math.sin(angle) * arrowDist * ISO_Y_RATIO;
    const arrowSize = 6 * zoom;

    ctx.fillStyle = rgba(color, 0.7 * validMul * p);
    ctx.beginPath();
    ctx.moveTo(
      arrowX + Math.cos(angle) * arrowSize,
      arrowY + Math.sin(angle) * arrowSize * ISO_Y_RATIO,
    );
    ctx.lineTo(
      arrowX + Math.cos(angle - 2.3) * arrowSize * 0.7,
      arrowY + Math.sin(angle - 2.3) * arrowSize * 0.7 * ISO_Y_RATIO,
    );
    ctx.lineTo(
      arrowX + Math.cos(angle + 2.3) * arrowSize * 0.7,
      arrowY + Math.sin(angle + 2.3) * arrowSize * 0.7 * ISO_Y_RATIO,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Invalid X mark
  if (!isValid) {
    const xSize = 8 * zoom;
    const xSizeY = xSize * ISO_Y_RATIO;
    ctx.strokeStyle = "rgba(255, 80, 80, 0.75)";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx - xSize, ty - xSizeY);
    ctx.lineTo(tx + xSize, ty + xSizeY);
    ctx.moveTo(tx + xSize, ty - xSizeY);
    ctx.lineTo(tx - xSize, ty + xSizeY);
    ctx.stroke();
  }

  ctx.restore();
}

// =============================================================================
// CATEGORY: SELECTION — Unit selection rings
// Used by: tower, hero, troop selection indicators
// =============================================================================

export interface SelectionReticleConfig {
  x: number;
  y: number;
  zoom: number;
  time: number;
  color?: ReticleColor;
  radius?: number;
  dashPattern?: number[];
  dashSpeed?: number;
  pulseSpeed?: number;
  lineWidth?: number;
}

export function renderSelectionReticle(
  ctx: CanvasRenderingContext2D,
  config: SelectionReticleConfig,
): void {
  const {
    x, y, zoom, time,
    color = RETICLE_COLORS.gold,
    radius = 35,
    dashPattern = [6, 3],
    dashSpeed = 25,
    pulseSpeed = 3,
    lineWidth = 2,
  } = config;

  const p = pulse(time, pulseSpeed, 0.5, 1.0);

  ctx.save();
  drawIsometricEllipse(ctx, x, y, radius, zoom, {
    strokeColor: rgba(color, p),
    lineWidth,
    dash: dashPattern,
    dashOffset: -time * dashSpeed,
  });
  ctx.restore();
}

// =============================================================================
// CATEGORY: RANGE — Tower / station / building range indicators
// Used by: towerRange, stationRange, special building ranges
// =============================================================================

export type RangeState = "normal" | "buffed" | "debuffed" | "hovered" | "preview";

export interface RangeReticleConfig {
  x: number;
  y: number;
  range: number;
  zoom: number;
  state?: RangeState;
  color?: ReticleColor;
  fillAlpha?: number;
  strokeAlpha?: number;
  dashed?: boolean;
  lineWidth?: number;
}

const RANGE_STATE_COLORS: Record<RangeState, ReticleColor> = {
  normal:   { r: 100, g: 200, b: 255 },
  buffed:   { r: 0,   g: 230, b: 200 },
  debuffed: { r: 160, g: 100, b: 200 },
  hovered:  { r: 100, g: 200, b: 255 },
  preview:  { r: 100, g: 200, b: 255 },
};

export function renderRangeReticle(
  ctx: CanvasRenderingContext2D,
  config: RangeReticleConfig,
): void {
  const {
    x, y, range, zoom,
    state = "normal",
    dashed = false,
    lineWidth = 2,
  } = config;

  const color = config.color ?? RANGE_STATE_COLORS[state];
  const isHovered = state === "hovered";
  const fillA = config.fillAlpha ?? (isHovered ? 0.05 : 0.1);
  const strokeA = config.strokeAlpha ?? (isHovered ? 0.3 : 0.5);

  ctx.save();
  drawIsometricEllipse(ctx, x, y, range * 0.7, zoom, {
    fillColor: rgba(color, fillA),
    strokeColor: rgba(color, strokeA),
    lineWidth,
    dash: dashed ? [8, 4] : undefined,
  });
  ctx.restore();
}

// =============================================================================
// CATEGORY: AESTHETIC — Decorative crosshairs (scope, turret sight, etc.)
// Used by: mortar scope, turret rear sight, engineer scope
// =============================================================================

export interface AestheticCrosshairConfig {
  x: number;
  y: number;
  zoom: number;
  radius: number;
  color?: string;
  lineWidth?: number;
  showCircle?: boolean;
  style?: "crosshair" | "x" | "plus";
}

export function renderAestheticCrosshair(
  ctx: CanvasRenderingContext2D,
  config: AestheticCrosshairConfig,
): void {
  const {
    x, y, zoom,
    radius,
    color = "rgba(200, 220, 240, 0.5)",
    lineWidth = 1,
    showCircle = true,
    style = "crosshair",
  } = config;

  const r = radius * zoom;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * zoom;

  if (showCircle) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  if (style === "crosshair" || style === "plus") {
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
  } else {
    const d = r * 0.707;
    ctx.moveTo(x - d, y - d);
    ctx.lineTo(x + d, y + d);
    ctx.moveTo(x + d, y - d);
    ctx.lineTo(x - d, y + d);
  }
  ctx.stroke();

  ctx.restore();
}

// =============================================================================
// Hex color conversion utility
// =============================================================================

export function hexToReticleColor(hex: string): ReticleColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : RETICLE_COLORS.gold;
}
