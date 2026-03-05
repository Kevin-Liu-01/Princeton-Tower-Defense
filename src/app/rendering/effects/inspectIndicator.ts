import type { Position } from "../../types";

export interface InspectIndicatorConfig {
  screenPos: Position;
  drawY?: number;
  zoom: number;
  unitSize: number;
  isSelected: boolean;
  isHovered: boolean;
}

const COS_45 = Math.SQRT2 / 2;
const TWO_PI = Math.PI * 2;

const PURPLE_PRIMARY = "rgba(168, 85, 247, 0.7)";
const PURPLE_SECONDARY = "rgba(192, 132, 252, 0.6)";
const PURPLE_ICON_BG = "rgba(139, 92, 246, 0.9)";

const YELLOW_PRIMARY = "rgba(251, 191, 36, 0.9)";
const YELLOW_SECONDARY = "rgba(254, 240, 138, 0.8)";
const YELLOW_ICON_BG = "rgba(251, 191, 36, 1)";

const IDLE_PRIMARY = "rgba(200, 200, 220, 0.35)";
const IDLE_SECONDARY = "rgba(200, 200, 220, 0.2)";
const IDLE_ICON_BG = "rgba(120, 120, 140, 0.6)";

const GLOW_STOPS = ["rgba(251, 191, 36, 0.5)", "rgba(251, 191, 36, 0)"] as const;
const SEL_GLOW_STOPS = [
  { offset: 0, color: "rgba(168, 85, 247, 0.4)" },
  { offset: 0.6, color: "rgba(168, 85, 247, 0.15)" },
  { offset: 1, color: "rgba(168, 85, 247, 0)" },
] as const;

function drawGroundRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  zoom: number,
  baseRadius: number,
  pulseRadius: number,
  pulsePhase: number,
  primaryColor: string,
  secondaryColor: string,
): void {
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = (3 + pulsePhase * 1.5) * zoom;
  ctx.beginPath();
  ctx.ellipse(cx, groundY, pulseRadius, pulseRadius * 0.45, 0, 0, TWO_PI);
  ctx.stroke();

  ctx.strokeStyle = secondaryColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(cx, groundY, baseRadius * 0.7, baseRadius * 0.35, 0, 0, TWO_PI);
  ctx.stroke();

  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(cx, groundY, 3 * zoom, 0, TWO_PI);
  ctx.fill();
}

function drawIdleGroundRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  zoom: number,
  baseRadius: number,
  primaryColor: string,
): void {
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(cx, groundY, baseRadius, baseRadius * 0.45, 0, 0, TWO_PI);
  ctx.stroke();
}

function drawMagnifyingGlass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  iconY: number,
  iconSize: number,
  zoom: number,
  isYellow: boolean,
  iconBgColor: string,
  iconStrokeColor: string,
): void {
  if (isYellow) {
    const glowGrad = ctx.createRadialGradient(cx, iconY, 0, cx, iconY, iconSize * 1.5);
    glowGrad.addColorStop(0, GLOW_STOPS[0]);
    glowGrad.addColorStop(1, GLOW_STOPS[1]);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, iconY, iconSize * 1.5, 0, TWO_PI);
    ctx.fill();
  }

  ctx.fillStyle = iconBgColor;
  ctx.beginPath();
  ctx.arc(cx, iconY, iconSize, 0, TWO_PI);
  ctx.fill();

  ctx.strokeStyle = isYellow ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(cx, iconY, iconSize, 0, TWO_PI);
  ctx.stroke();

  const scale = (iconSize * 0.75) / 12;
  const lensX = cx - iconSize * 0.15;
  const lensY = iconY - iconSize * 0.15;
  const lensR = 8 * scale;

  ctx.strokeStyle = iconStrokeColor;
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(lensX, lensY, lensR, 0, TWO_PI);
  ctx.stroke();

  const hStartX = lensX + lensR * COS_45;
  const hStartY = lensY + lensR * COS_45;
  const hLen = 5 * scale;

  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(hStartX, hStartY);
  ctx.lineTo(hStartX + hLen * COS_45, hStartY + hLen * COS_45);
  ctx.stroke();

  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
}

function drawSelectedExtras(
  ctx: CanvasRenderingContext2D,
  cx: number,
  drawY: number,
  groundY: number,
  zoom: number,
  size: number,
  baseRadius: number,
): void {
  const selGlow = ctx.createRadialGradient(cx, drawY, size * 0.3, cx, drawY, size * 1.5);
  for (const stop of SEL_GLOW_STOPS) {
    selGlow.addColorStop(stop.offset, stop.color);
  }
  ctx.fillStyle = selGlow;
  ctx.beginPath();
  ctx.ellipse(cx, drawY, size * 1.5, size, 0, 0, TWO_PI);
  ctx.fill();

  ctx.font = `bold ${9 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(192, 132, 252, 0.95)";
  ctx.fillText("INSPECTING", cx, groundY + baseRadius * 0.5 + 12 * zoom);
}

export function renderUnitInspectIndicator(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  zoom: number,
  unitSize: number,
  isSelected: boolean,
  isHovered: boolean,
  _color?: string,
): void {
  renderInspectIndicator(ctx, {
    screenPos,
    zoom,
    unitSize,
    isSelected,
    isHovered,
  });
}

export function renderInspectIndicator(
  ctx: CanvasRenderingContext2D,
  config: InspectIndicatorConfig,
): void {
  const { screenPos, zoom, unitSize, isSelected, isHovered } = config;

  const size = unitSize * zoom;
  const baseRadius = size * 0.9;
  const groundY = screenPos.y + 8 * zoom;
  const drawY = config.drawY ?? screenPos.y - size * 0.5;
  const iconY = drawY - size * 0.7;

  const isIdle = !isSelected && !isHovered;

  ctx.save();

  if (isIdle) {
    const iconSize = 11 * zoom;
    drawIdleGroundRing(ctx, screenPos.x, groundY, zoom, baseRadius, IDLE_PRIMARY);
    drawMagnifyingGlass(ctx, screenPos.x, iconY, iconSize, zoom, false, IDLE_ICON_BG, "rgba(255, 255, 255, 0.7)");
    ctx.restore();
    return;
  }

  const time = Date.now() / 1000;
  const pulsePhase = (Math.sin(time * 4) + 1) / 2;
  const pulseRadius = baseRadius + pulsePhase * 6 * zoom;
  const iconSize = 14 * zoom;

  const isYellow = isHovered && !isSelected;
  const primaryColor = isYellow ? YELLOW_PRIMARY : PURPLE_PRIMARY;
  const secondaryColor = isYellow ? YELLOW_SECONDARY : PURPLE_SECONDARY;
  const iconBgColor = isYellow ? YELLOW_ICON_BG : PURPLE_ICON_BG;
  const iconStrokeColor = isYellow ? "#1c1917" : "white";

  drawGroundRings(ctx, screenPos.x, groundY, zoom, baseRadius, pulseRadius, pulsePhase, primaryColor, secondaryColor);
  drawMagnifyingGlass(ctx, screenPos.x, iconY, iconSize, zoom, isYellow, iconBgColor, iconStrokeColor);

  if (isSelected) {
    drawSelectedExtras(ctx, screenPos.x, drawY, groundY, zoom, size, baseRadius);
  }

  ctx.restore();
}
