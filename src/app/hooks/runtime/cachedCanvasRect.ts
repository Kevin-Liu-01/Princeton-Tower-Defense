import type { MutableRefObject } from "react";

export type CachedCanvasRectRef = MutableRefObject<DOMRect | null>;

/**
 * Returns a cached DOMRect for the canvas, lazily calling
 * getBoundingClientRect() only when the cache is empty.
 * Invalidate on resize / scroll via `invalidateCanvasRect`.
 */
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
