import { getEffectiveShadowBlur, interceptShadows } from "../performance";

interface CachedSprite {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  frame: number;
  padding: number;
  pixels: number;
}

const cache = new Map<string, CachedSprite>();
const MAX_ENTRIES = 96;
const MAX_PIXELS = 4 * 1024 * 1024; // 16 MiB of RGBA backing stores.
const ANIMATION_FPS = 30;
let cachedPixels = 0;

/**
 * Share idle body artwork across enemies, keeping movement, facing, shadows,
 * health bars, damage feedback and attack animations outside the cache.
 * Each visual variant owns one reusable bitmap, not a history of time slices.
 */
export function drawCachedEnemySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  size: number,
  zoom: number,
  time: number,
  region: string,
  drawSprite: (
    offCtx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spriteTime: number
  ) => void
): void {
  // Match the destination's backing resolution, including Retina canvases.
  const transform = ctx.getTransform();
  const resolution = Math.min(
    2,
    Math.max(1, Math.hypot(transform.a, transform.b))
  );
  const key = `${type}:${size}:${zoom}:${region}:${resolution}:${getEffectiveShadowBlur(1)}`;
  const frame = Math.floor(time * ANIMATION_FPS);
  let sprite = cache.get(key);

  if (!sprite) {
    const padding = Math.ceil(size * 4);
    const side = Math.ceil(padding * 2 * resolution);
    const pixels = side * side;
    if (pixels > MAX_PIXELS || side <= 0) {
      drawSprite(ctx, x, y, time);
      return;
    }
    while (cache.size >= MAX_ENTRIES || cachedPixels + pixels > MAX_PIXELS) {
      const oldestEntry = cache.entries().next().value;
      if (!oldestEntry) {
        break;
      }
      const [oldestKey, oldest] = oldestEntry;
      cachedPixels -= oldest.pixels;
      oldest.canvas.width = 1;
      oldest.canvas.height = 1;
      cache.delete(oldestKey);
    }
    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const context = canvas.getContext("2d");
    if (!context) {
      drawSprite(ctx, x, y, time);
      return;
    }
    interceptShadows(context);
    context.setTransform(resolution, 0, 0, resolution, 0, 0);
    sprite = { canvas, context, frame: -1, padding, pixels };
    cachedPixels += pixels;
  }

  // Keep frequently drawn variants resident as types enter and leave the wave.
  cache.delete(key);
  cache.set(key, sprite);
  if (sprite.frame !== frame) {
    sprite.context.clearRect(
      0,
      0,
      sprite.canvas.width / resolution,
      sprite.canvas.height / resolution
    );
    sprite.context.save();
    drawSprite(
      sprite.context,
      sprite.padding,
      sprite.padding,
      frame / ANIMATION_FPS
    );
    sprite.context.restore();
    sprite.frame = frame;
  }
  ctx.drawImage(
    sprite.canvas,
    x - sprite.padding,
    y - sprite.padding,
    sprite.canvas.width / resolution,
    sprite.canvas.height / resolution
  );
}

export function clearEnemySpriteCache(): void {
  for (const sprite of cache.values()) {
    sprite.canvas.width = 1;
    sprite.canvas.height = 1;
  }
  cache.clear();
  cachedPixels = 0;
}
