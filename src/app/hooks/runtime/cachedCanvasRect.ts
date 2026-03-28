/**
 * Cached canvas bounding-rect utility.
 *
 * getBoundingClientRect() forces synchronous layout reflow — one of the most
 * expensive browser operations. Hot paths (pointermove, wheel, gesture, rAF
 * draw loops) must never call it directly on the game canvas.
 *
 * Instead, call `getCachedRect(canvas, cacheRef)` which returns the cached
 * DOMRect on subsequent calls (zero cost) and only falls through to the real
 * DOM measurement when the cache is empty.
 *
 * Invalidate with `invalidateCanvasRect(cacheRef)` whenever the canvas could
 * have moved or resized (currently wired into `canvasResize.ts`).
 *
 * See docs/CANVAS_OPTIMIZATION.md §5 for architecture, call-site inventory,
 * plumbing guide, and rules.
 */
import type { MutableRefObject } from "react";

export type CachedCanvasRectRef = MutableRefObject<DOMRect | null>;

export function getCachedRect(
  canvas: HTMLCanvasElement,
  cacheRef: CachedCanvasRectRef,
): DOMRect {
  if (cacheRef.current) return cacheRef.current;
  const rect = canvas.getBoundingClientRect();
  cacheRef.current = rect;
  return rect;
}

export function invalidateCanvasRect(cacheRef: CachedCanvasRectRef): void {
  cacheRef.current = null;
}
