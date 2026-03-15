import type { Position, DecorationType, DecorationHeightTag } from "../../types";
import { getDecorationVolumeSpec } from "../../utils";
import { renderDecorationItem } from "./renderDecorationItem";

export interface DecorationSprite {
  canvas: HTMLCanvasElement;
  /** CSS-pixel offset from screenPos to the top-left corner of the sprite */
  offsetX: number;
  offsetY: number;
  cssWidth: number;
  cssHeight: number;
  /** DPR the sprite was rendered at (may be reduced for large sprites) */
  spriteDpr: number;
}

const SPRITE_BASE_CSS: Record<DecorationHeightTag, number> = {
  ground: 80,
  short: 110,
  medium: 180,
  tall: 300,
  landmark: 520,
};

const MAX_SPRITE_CSS = 700;
const LARGE_SPRITE_DPR_CAP = 1.5;
const LARGE_SPRITE_THRESHOLD = 400;

function getSpriteCSS(
  heightTag: DecorationHeightTag,
  effectiveScale: number,
): number {
  const base = SPRITE_BASE_CSS[heightTag] ?? 180;
  return Math.min(Math.ceil(base * Math.max(effectiveScale, 0.5)), MAX_SPRITE_CSS);
}

export function prerenderDecorationSprite(
  type: DecorationType,
  effectiveScale: number,
  rotation: number,
  variant: number,
  decorX: number,
  decorY: number,
  selectedMap: string,
  mapTheme: string,
  dpr: number,
  heightTag?: DecorationHeightTag,
  shadowOnly?: boolean,
  skipShadow?: boolean,
  zoom?: number,
): DecorationSprite | null {
  if (typeof document === "undefined") return null;

  const vol = getDecorationVolumeSpec(type as string, heightTag);
  const cssSize = getSpriteCSS(vol.heightTag, effectiveScale);
  const spriteDpr = cssSize > LARGE_SPRITE_THRESHOLD
    ? Math.min(dpr, LARGE_SPRITE_DPR_CAP)
    : dpr;
  const pxSize = Math.ceil(cssSize * spriteDpr);

  const canvas = document.createElement("canvas");
  canvas.width = pxSize;
  canvas.height = pxSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(spriteDpr, spriteDpr);

  const centerX = cssSize / 2;
  const centerY = cssSize / 2;

  ctx.save();
  renderDecorationItem({
    ctx,
    screenPos: { x: centerX, y: centerY },
    scale: effectiveScale,
    type,
    rotation,
    variant,
    decorTime: 0,
    decorX,
    decorY,
    selectedMap,
    mapTheme,
    shadowOnly: !!shadowOnly,
    skipShadow: !!skipShadow,
    zoom,
  });
  ctx.restore();

  return {
    canvas,
    offsetX: centerX,
    offsetY: centerY,
    cssWidth: cssSize,
    cssHeight: cssSize,
    spriteDpr,
  };
}

/**
 * Draw a pre-rendered decoration sprite to the target context.
 * `ctx` must already have DPR scaling applied via `ctx.scale(dpr, dpr)`.
 */
export function drawDecorationSprite(
  ctx: CanvasRenderingContext2D,
  sprite: DecorationSprite,
  screenPos: Position,
): void {
  const dx = screenPos.x - sprite.offsetX;
  const dy = screenPos.y - sprite.offsetY;
  ctx.drawImage(
    sprite.canvas,
    0, 0, sprite.canvas.width, sprite.canvas.height,
    dx, dy, sprite.cssWidth, sprite.cssHeight,
  );
}
