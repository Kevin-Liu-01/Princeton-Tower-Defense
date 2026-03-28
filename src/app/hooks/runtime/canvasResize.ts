import type { MutableRefObject, RefObject } from "react";
import type { StaticMapLayerCache, FogLayerCache, BackdropCache } from "./renderScene";
import { BG_OVERSCAN_X, BG_OVERSCAN_Y } from "./runtimeConfig";
import { invalidateCanvasRect, type CachedCanvasRectRef } from "./cachedCanvasRect";

export function resizeCanvases(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  bgCanvasRef: RefObject<HTMLCanvasElement | null>,
  backdropCanvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  cachedStaticMapLayerRef: MutableRefObject<StaticMapLayerCache | null>,
  cachedBackdropRef: MutableRefObject<BackdropCache | null>,
  cachedFogLayerRef: MutableRefObject<FogLayerCache | null>,
  getRenderDpr: () => number,
  cachedCanvasRectRef?: CachedCanvasRectRef,
): void {
  const canvas = canvasRef.current;
  const bgCanvas = bgCanvasRef.current;
  const container = containerRef.current;
  if (canvas && container) {
    const dpr = getRenderDpr();
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    if (bgCanvas) {
      bgCanvas.width = (rect.width + BG_OVERSCAN_X) * dpr;
      bgCanvas.height = (rect.height + BG_OVERSCAN_Y) * dpr;
      bgCanvas.style.width = `${rect.width + BG_OVERSCAN_X}px`;
      bgCanvas.style.height = `${rect.height + BG_OVERSCAN_Y}px`;
    }
    const bdCanvas = backdropCanvasRef.current;
    if (bdCanvas) {
      bdCanvas.width = (rect.width + BG_OVERSCAN_X) * dpr;
      bdCanvas.height = (rect.height + BG_OVERSCAN_Y) * dpr;
      bdCanvas.style.width = `${rect.width + BG_OVERSCAN_X}px`;
      bdCanvas.style.height = `${rect.height + BG_OVERSCAN_Y}px`;
    }
    cachedStaticMapLayerRef.current = null;
    cachedBackdropRef.current = null;
    cachedFogLayerRef.current = null;
    if (cachedCanvasRectRef) invalidateCanvasRect(cachedCanvasRectRef);
  }
}

export function setupResizeListener(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  bgCanvasRef: RefObject<HTMLCanvasElement | null>,
  backdropCanvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  cachedStaticMapLayerRef: MutableRefObject<StaticMapLayerCache | null>,
  cachedBackdropRef: MutableRefObject<BackdropCache | null>,
  cachedFogLayerRef: MutableRefObject<FogLayerCache | null>,
  getRenderDpr: () => number,
  cachedCanvasRectRef?: CachedCanvasRectRef,
): () => void {
  const handler = () =>
    resizeCanvases(
      canvasRef,
      bgCanvasRef,
      backdropCanvasRef,
      containerRef,
      cachedStaticMapLayerRef,
      cachedBackdropRef,
      cachedFogLayerRef,
      getRenderDpr,
      cachedCanvasRectRef,
    );
  handler();
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}
