import type { Tower } from "../../types";
import {
  getEffectiveShadowBlur,
  getScenePressure,
  interceptShadows,
} from "../performance";

interface CachedTowerSprite {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  frame: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
  pixels: number;
}

const cache = new Map<string, CachedTowerSprite>();
const MAX_ENTRIES = 64;
const MAX_PIXELS = 8 * 1024 * 1024; // 32 MiB of retained RGBA artwork.
const ANIMATION_FPS = 30;
let cachedPixels = 0;
const CACHEABLE_TYPES = new Set(["library", "club", "station", "mortar"]);

/** Cache idle bodies only: attacks, spawn markers and targeting stay live. */
export function canCacheTowerSprite(tower: Tower, now: number): boolean {
  if (!CACHEABLE_TYPES.has(tower.type)) {
    return false;
  }
  // Arch rendering writes a screen-space portal anchor used by projectiles.
  const attackAge = now - tower.lastAttack;
  return (
    !(attackAge >= 0 && attackAge < 700) &&
    !(tower.spawnEffect && tower.spawnEffect > 0) &&
    !tower.selected &&
    !tower.showSpawnMarkers
  );
}

/** Exact zoom/resolution identity prevents size jumps and blurry Retina artwork. */
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
  visualVariant = ""
): void {
  const transform = ctx.getTransform();
  const resolution = Math.min(
    2,
    Math.max(
      1,
      Math.hypot(transform.a, transform.b),
      Math.hypot(transform.c, transform.d)
    )
  );
  const key = `${type}:${level}:${upgrade ?? ""}:${rotation}:${zoom}:${resolution}:${getEffectiveShadowBlur(1)}:${getScenePressure().skipDecorativeEffects}:${visualVariant}`;
  const frame = Math.floor(time * ANIMATION_FPS);
  let sprite = cache.get(key);
  if (!sprite) {
    // Includes tall spires, wide upgrade models, smoke and ground effects.
    const cx = Math.ceil(128 * zoom);
    const cy = Math.ceil(224 * zoom);
    const width = cx * 2;
    const height = cy + Math.ceil(96 * zoom);
    const pixelWidth = Math.ceil(width * resolution);
    const pixelHeight = Math.ceil(height * resolution);
    const pixels = pixelWidth * pixelHeight;
    if (pixels > MAX_PIXELS || pixels <= 0) {
      drawTower(ctx, x, y);
      return;
    }
    while (cache.size >= MAX_ENTRIES || cachedPixels + pixels > MAX_PIXELS) {
      const oldest = cache.entries().next().value;
      if (!oldest) {
        break;
      }
      releaseSprite(oldest[1]);
      cache.delete(oldest[0]);
    }
    const canvas = document.createElement("canvas");
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      drawTower(ctx, x, y);
      return;
    }
    interceptShadows(context);
    context.setTransform(resolution, 0, 0, resolution, 0, 0);
    sprite = {
      canvas,
      context,
      frame: -1,
      cx,
      cy,
      width: pixelWidth / resolution,
      height: pixelHeight / resolution,
      pixels,
    };
    cachedPixels += pixels;
  }
  cache.delete(key);
  cache.set(key, sprite);
  if (sprite.frame !== frame) {
    sprite.context.clearRect(0, 0, sprite.width, sprite.height);
    sprite.context.save();
    drawTower(sprite.context, sprite.cx, sprite.cy);
    sprite.context.restore();
    sprite.frame = frame;
  }
  ctx.drawImage(
    sprite.canvas,
    x - sprite.cx,
    y - sprite.cy,
    sprite.width,
    sprite.height
  );
}

function releaseSprite(sprite: CachedTowerSprite): void {
  cachedPixels -= sprite.pixels;
  sprite.canvas.width = 1;
  sprite.canvas.height = 1;
}

export function clearTowerSpriteCache(): void {
  for (const sprite of cache.values()) {
    releaseSprite(sprite);
  }
  cache.clear();
  cachedPixels = 0;
}
