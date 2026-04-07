import { interceptShadows, refreshShadowCache } from "../performance";

interface CachedTowerSprite {
  canvas: HTMLCanvasElement;
  cx: number;
  cy: number;
}

const cache = new Map<string, CachedTowerSprite>();
const MAX_ENTRIES = 64;
const TIME_QUANT_DIVISOR = 4;

let evictionQueue: string[] = [];

function quantize(v: number, step: number): number {
  return Math.round(v / step) * step;
}

function buildKey(
  type: string,
  level: number,
  upgrade: string | undefined,
  rotation: number,
  zoom: number,
  time: number,
): string {
  const zq = quantize(zoom, 0.25);
  const rq = quantize(rotation, 0.15);
  const tq = Math.floor(time * TIME_QUANT_DIVISOR);
  return `${type}:${level}:${upgrade ?? ""}:${rq}:${zq}:${tq}`;
}

function evictIfNeeded(): void {
  while (cache.size >= MAX_ENTRIES && evictionQueue.length > 0) {
    const old = evictionQueue.shift()!;
    cache.delete(old);
  }
}

/**
 * Attempt to render a tower from cached sprite. Returns true on hit.
 * On miss, draws to an offscreen canvas, caches it, and blits.
 *
 * Only use for tower types that don't depend on dynamic enemy data
 * (library, arch, club, station, mortar). Cannon and lab pass through
 * because their rendering depends on live enemy positions.
 */
export function drawCachedTowerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  level: number,
  upgrade: string | undefined,
  rotation: number,
  zoom: number,
  time: number,
  drawTower: (offCtx: CanvasRenderingContext2D, cx: number, cy: number) => void,
): void {
  const key = buildKey(type, level, upgrade, rotation, zoom, time);

  const hit = cache.get(key);
  if (hit) {
    ctx.drawImage(hit.canvas, x - hit.cx, y - hit.cy);
    return;
  }

  const padding = Math.ceil(80 * zoom);
  const w = padding * 2;
  const h = Math.ceil(padding * 2.5);
  const cx = padding;
  const cy = Math.ceil(padding * 1.5);

  const offCanvas = document.createElement("canvas");
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext("2d");
  if (!offCtx) {
    drawTower(ctx, x, y);
    return;
  }

  interceptShadows(offCtx);
  refreshShadowCache();

  drawTower(offCtx, cx, cy);

  evictIfNeeded();
  cache.set(key, { canvas: offCanvas, cx, cy });
  evictionQueue.push(key);

  ctx.drawImage(offCanvas, x - cx, y - cy);
}

const CACHEABLE_TOWER_TYPES = new Set([
  "library",
  "arch",
  "club",
  "station",
  "mortar",
]);

export function isCacheableTowerType(type: string): boolean {
  return CACHEABLE_TOWER_TYPES.has(type);
}

export function clearTowerSpriteCache(): void {
  cache.clear();
  evictionQueue = [];
}
