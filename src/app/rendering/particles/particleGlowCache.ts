// Pre-rendered particle glow sprites.
//
// Canvas 2D shadow blur is the single most expensive operation — each fill
// with shadowBlur > 0 triggers a full Gaussian blur kernel.  With 100+
// particles per frame this easily burns 10-18 ms.
//
// This module renders the glow *once* per colour using the native shadow
// system, caches the result on a small offscreen canvas, and replays it
// with drawImage (a fast GPU blit) every subsequent frame.

import { getEffectiveShadowBlur } from "../performance";

const SPRITE_SIZE = 64;
const SPRITE_HALF = SPRITE_SIZE / 2;
const SPRITE_DOT_RADIUS = 6;
const SPRITE_BLUR_RADIUS = 18;

const glowCache = new Map<string, HTMLCanvasElement>();

export function clearParticleGlowCache(): void {
  glowCache.clear();
}

function getOrCreateGlowSprite(color: string): HTMLCanvasElement {
  let sprite = glowCache.get(color);
  if (sprite) return sprite;

  sprite = document.createElement("canvas");
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const sCtx = sprite.getContext("2d");
  if (!sCtx) return sprite;

  sCtx.shadowColor = color;
  sCtx.shadowBlur = SPRITE_BLUR_RADIUS;
  sCtx.fillStyle = color;
  sCtx.beginPath();
  sCtx.arc(SPRITE_HALF, SPRITE_HALF, SPRITE_DOT_RADIUS, 0, Math.PI * 2);
  sCtx.fill();

  glowCache.set(color, sprite);
  return sprite;
}

/**
 * Draw a pre-rendered shadow glow behind a particle.
 *
 * Call this *before* drawing the particle shape itself so the shape sits on
 * top of the glow.  `baseBlur` is the unscaled blur value (e.g. `4 * zoom`)
 * — quality scaling is applied internally.
 */
export function drawGlowEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  baseBlur: number,
): void {
  const effective = getEffectiveShadowBlur(baseBlur);
  if (effective < 0.5) return;

  const sprite = getOrCreateGlowSprite(color);
  const scale = effective / SPRITE_BLUR_RADIUS;
  const drawSize = SPRITE_SIZE * scale;
  const drawHalf = drawSize / 2;
  ctx.drawImage(sprite, x - drawHalf, y - drawHalf, drawSize, drawSize);
}
