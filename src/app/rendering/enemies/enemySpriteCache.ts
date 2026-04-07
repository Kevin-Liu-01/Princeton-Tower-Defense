import { interceptShadows, refreshShadowCache } from "../performance";

interface CachedSprite {
  canvas: HTMLCanvasElement;
  cx: number;
  cy: number;
}

const cache = new Map<string, CachedSprite>();
const MAX_ENTRIES = 256;
const TIME_QUANT_DIVISOR = 6;

let evictionQueue: string[] = [];

function quantize(v: number, step: number): number {
  return Math.round(v / step) * step;
}

function buildKey(
  type: string,
  size: number,
  zoom: number,
  time: number,
  region: string
): string {
  const sq = quantize(size, 0.5);
  const zq = quantize(zoom, 0.25);
  const tq = Math.floor(time * TIME_QUANT_DIVISOR);
  return `${type}:${sq}:${zq}:${region}:${tq}`;
}

function evictIfNeeded(): void {
  while (cache.size >= MAX_ENTRIES && evictionQueue.length > 0) {
    const old = evictionQueue.shift()!;
    cache.delete(old);
  }
}

/**
 * Attempt to draw the enemy sprite from cache. Returns true on cache hit.
 * On miss, renders to an offscreen canvas, stores it, then blits to ctx.
 *
 * @param drawSprite - callback that draws the actual sprite centered at (cx, cy)
 *                     on the provided context. This avoids importing all the
 *                     per-type draw functions here.
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
  drawSprite: (offCtx: CanvasRenderingContext2D, cx: number, cy: number) => void
): void {
  const key = buildKey(type, size, zoom, time, region);

  const hit = cache.get(key);
  if (hit) {
    ctx.drawImage(hit.canvas, x - hit.cx, y - hit.cy);
    return;
  }

  const padding = Math.ceil(size * 3.5);
  const w = padding * 2;
  const h = padding * 2;
  const cx = padding;
  const cy = padding;

  const offCanvas = document.createElement("canvas");
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext("2d");
  if (!offCtx) {
    drawSprite(ctx, x, y);
    return;
  }

  interceptShadows(offCtx);
  refreshShadowCache();

  drawSprite(offCtx, cx, cy);

  evictIfNeeded();
  cache.set(key, { canvas: offCanvas, cx, cy });
  evictionQueue.push(key);

  ctx.drawImage(offCanvas, x - cx, y - cy);
}

export function clearEnemySpriteCache(): void {
  cache.clear();
  evictionQueue = [];
}
