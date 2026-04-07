import type { Position } from "../../types";

export type InspectUnitType = "enemy" | "troop" | "hero";
export type InspectRenderPass = "ground" | "overlay" | "all";

export interface InspectIndicatorConfig {
  screenPos: Position;
  drawY?: number;
  zoom: number;
  unitSize: number;
  isSelected: boolean;
  isHovered: boolean;
  unitType?: InspectUnitType;
  renderPass?: InspectRenderPass;
}

const TWO_PI = Math.PI * 2;
const ISO_ELLIPSE_RATIO = 0.5;

interface ColorTheme {
  idle: string;
  idleRing: string;
  primary: string;
  secondary: string;
  glow: string;
  glowFade: string;
  text: string;
  marker: string;
  markerStroke: string;
}

const ENEMY_THEME: ColorTheme = {
  glow: "rgba(239, 68, 68, 0.35)",
  glowFade: "rgba(239, 68, 68, 0)",
  idle: "rgba(239, 68, 68, 0.7)",
  idleRing: "rgba(239, 68, 68, 0.4)",
  marker: "rgba(239, 68, 68, 0.9)",
  markerStroke: "rgba(255, 255, 255, 0.7)",
  primary: "rgba(239, 68, 68, 0.85)",
  secondary: "rgba(252, 165, 165, 0.5)",
  text: "rgba(252, 165, 165, 0.95)",
};

const TROOP_THEME: ColorTheme = {
  glow: "rgba(59, 130, 246, 0.35)",
  glowFade: "rgba(59, 130, 246, 0)",
  idle: "rgba(59, 130, 246, 0.7)",
  idleRing: "rgba(59, 130, 246, 0.4)",
  marker: "rgba(59, 130, 246, 0.9)",
  markerStroke: "rgba(255, 255, 255, 0.7)",
  primary: "rgba(59, 130, 246, 0.85)",
  secondary: "rgba(147, 197, 253, 0.5)",
  text: "rgba(147, 197, 253, 0.95)",
};

const HERO_THEME: ColorTheme = {
  glow: "rgba(245, 158, 11, 0.4)",
  glowFade: "rgba(245, 158, 11, 0)",
  idle: "rgba(245, 158, 11, 0.75)",
  idleRing: "rgba(245, 158, 11, 0.45)",
  marker: "rgba(245, 158, 11, 0.95)",
  markerStroke: "rgba(255, 255, 255, 0.85)",
  primary: "rgba(245, 158, 11, 0.9)",
  secondary: "rgba(253, 224, 71, 0.55)",
  text: "rgba(253, 224, 71, 0.95)",
};

function getTheme(unitType: InspectUnitType): ColorTheme {
  switch (unitType) {
    case "enemy": {
      return ENEMY_THEME;
    }
    case "troop": {
      return TROOP_THEME;
    }
    case "hero": {
      return HERO_THEME;
    }
  }
}

function drawGroundEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  zoom: number,
  rx: number,
  color: string,
  lineWidth: number
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * zoom;
  ctx.beginPath();
  ctx.ellipse(cx, groundY, rx, rx * ISO_ELLIPSE_RATIO, 0, 0, TWO_PI);
  ctx.stroke();
}

function drawDiamondMarker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number
): void {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size * 0.6, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size * 0.6, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawIdleGround(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  groundY: number,
  zoom: number,
  baseRadius: number,
  theme: ColorTheme
): void {
  drawGroundEllipse(
    ctx,
    screenPos.x,
    groundY,
    zoom,
    baseRadius,
    theme.idle,
    2.5
  );
}

function drawIdleOverlay(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  markerY: number,
  zoom: number,
  theme: ColorTheme,
  time: number
): void {
  const bobOffset = Math.sin(time * 2) * 2 * zoom;
  drawDiamondMarker(
    ctx,
    screenPos.x,
    markerY + bobOffset,
    4 * zoom,
    theme.idle,
    theme.idleRing,
    1 * zoom
  );
}

function drawHoveredGround(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  groundY: number,
  zoom: number,
  baseRadius: number,
  pulsePhase: number,
  theme: ColorTheme
): void {
  const pulseRadius = baseRadius + pulsePhase * 5 * zoom;

  const glowGrad = ctx.createRadialGradient(
    screenPos.x,
    groundY,
    0,
    screenPos.x,
    groundY,
    pulseRadius * 1.3
  );
  glowGrad.addColorStop(0, theme.glow);
  glowGrad.addColorStop(1, theme.glowFade);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    groundY,
    pulseRadius * 1.3,
    pulseRadius * 1.3 * ISO_ELLIPSE_RATIO,
    0,
    0,
    TWO_PI
  );
  ctx.fill();

  drawGroundEllipse(
    ctx,
    screenPos.x,
    groundY,
    zoom,
    pulseRadius,
    theme.primary,
    2.5 + pulsePhase
  );
  drawGroundEllipse(
    ctx,
    screenPos.x,
    groundY,
    zoom,
    baseRadius * 0.6,
    theme.secondary,
    1.5
  );
}

function drawHoveredOverlay(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  markerY: number,
  zoom: number,
  theme: ColorTheme,
  time: number
): void {
  const bobOffset = Math.sin(time * 3) * 3 * zoom;
  drawDiamondMarker(
    ctx,
    screenPos.x,
    markerY + bobOffset,
    6 * zoom,
    theme.marker,
    theme.markerStroke,
    1.5 * zoom
  );
}

function drawSelectedGround(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  groundY: number,
  zoom: number,
  baseRadius: number,
  pulsePhase: number,
  theme: ColorTheme
): void {
  const pulseRadius = baseRadius + pulsePhase * 8 * zoom;

  const glowGrad = ctx.createRadialGradient(
    screenPos.x,
    groundY,
    0,
    screenPos.x,
    groundY,
    pulseRadius * 1.3
  );
  glowGrad.addColorStop(0, theme.glow);
  glowGrad.addColorStop(1, theme.glowFade);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    groundY,
    pulseRadius * 1.3,
    pulseRadius * 1.3 * ISO_ELLIPSE_RATIO,
    0,
    0,
    TWO_PI
  );
  ctx.fill();

  drawGroundEllipse(
    ctx,
    screenPos.x,
    groundY,
    zoom,
    pulseRadius,
    theme.primary,
    3 + pulsePhase * 1.5
  );
  drawGroundEllipse(
    ctx,
    screenPos.x,
    groundY,
    zoom,
    baseRadius * 0.55,
    theme.secondary,
    2
  );

  ctx.fillStyle = theme.primary;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    groundY,
    3 * zoom,
    3 * zoom * ISO_ELLIPSE_RATIO,
    0,
    0,
    TWO_PI
  );
  ctx.fill();
}

function drawSelectedOverlay(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  markerY: number,
  groundY: number,
  zoom: number,
  baseRadius: number,
  theme: ColorTheme,
  time: number,
  label: string
): void {
  const bobOffset = Math.sin(time * 3) * 3 * zoom;
  drawDiamondMarker(
    ctx,
    screenPos.x,
    markerY + bobOffset,
    7 * zoom,
    theme.marker,
    theme.markerStroke,
    2 * zoom
  );

  ctx.font = `bold ${9 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.text;
  ctx.fillText(label, screenPos.x, groundY + baseRadius * 0.45 + 12 * zoom);
}

const SELECTED_LABELS: Record<InspectUnitType, string> = {
  enemy: "INSPECTING",
  hero: "HERO",
  troop: "TROOP",
};

export function renderUnitInspectIndicator(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  zoom: number,
  unitSize: number,
  isSelected: boolean,
  isHovered: boolean,
  unitType: InspectUnitType,
  renderPass: InspectRenderPass = "all"
): void {
  renderInspectIndicator(ctx, {
    isHovered,
    isSelected,
    renderPass,
    screenPos,
    unitSize,
    unitType,
    zoom,
  });
}

export function renderInspectIndicator(
  ctx: CanvasRenderingContext2D,
  config: InspectIndicatorConfig
): void {
  const {
    screenPos,
    zoom,
    unitSize,
    isSelected,
    isHovered,
    unitType = "enemy",
    renderPass = "all",
  } = config;
  const theme = getTheme(unitType);

  const size = unitSize * zoom;
  const baseRadius = size * 0.85;
  const groundY = screenPos.y + 8 * zoom;
  const drawY = config.drawY ?? screenPos.y - size * 0.5;
  const markerY = drawY - size * 0.6;

  const time = Date.now() / 1000;
  const doGround = renderPass === "ground" || renderPass === "all";
  const doOverlay = renderPass === "overlay" || renderPass === "all";

  ctx.save();

  if (!isSelected && !isHovered) {
    if (doGround) {
      drawIdleGround(ctx, screenPos, groundY, zoom, baseRadius, theme);
    }
    if (doOverlay) {
      drawIdleOverlay(ctx, screenPos, markerY, zoom, theme, time);
    }
    ctx.restore();
    return;
  }

  const pulsePhase = (Math.sin(time * 4) + 1) / 2;

  if (isSelected) {
    if (doGround) {
      drawSelectedGround(
        ctx,
        screenPos,
        groundY,
        zoom,
        baseRadius,
        pulsePhase,
        theme
      );
    }
    if (doOverlay) {
      drawSelectedOverlay(
        ctx,
        screenPos,
        markerY,
        groundY,
        zoom,
        baseRadius,
        theme,
        time,
        SELECTED_LABELS[unitType]
      );
    }
  } else {
    if (doGround) {
      drawHoveredGround(
        ctx,
        screenPos,
        groundY,
        zoom,
        baseRadius,
        pulsePhase,
        theme
      );
    }
    if (doOverlay) {
      drawHoveredOverlay(ctx, screenPos, markerY, zoom, theme, time);
    }
  }

  ctx.restore();
}
