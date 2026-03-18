import type { MutableRefObject, Dispatch, SetStateAction } from "react";
import type { StaticMapLayerCache, StaticDecorationLayerCache, FogLayerCache } from "./renderScene";
import {
  CAMERA_ZOOM_MIN,
  CAMERA_ZOOM_MAX,
  WHEEL_ZOOM_SENSITIVITY,
  TRACKPAD_PINCH_ZOOM_SENSITIVITY,
  ZOOM_SETTLE_DEBOUNCE_MS,
} from "./runtimeConfig";
import { getGameSettings } from "../useSettings";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ZoomGestureRefs {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  isZoomDebouncingRef: MutableRefObject<boolean>;
  zoomSettleTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  stableZoomRef: MutableRefObject<number>;
  cameraZoomRef: MutableRefObject<number>;
  cachedStaticMapLayerRef: MutableRefObject<StaticMapLayerCache | null>;
  cachedStaticDecorationLayerRef: MutableRefObject<StaticDecorationLayerCache | null>;
  cachedFogLayerRef: MutableRefObject<FogLayerCache | null>;
  lastGestureScaleRef: MutableRefObject<number | null>;
}

export interface ZoomGestureSetters {
  setCameraZoom: Dispatch<SetStateAction<number>>;
  setCameraOffset: Dispatch<SetStateAction<{ x: number; y: number }>>;
}

export interface ZoomGestureParams {
  refs: ZoomGestureRefs;
  setters: ZoomGestureSetters;
  getCanvasDimensions: () => { width: number; height: number; dpr: number };
  gameState: string;
  battleOutcome: unknown;
}

// ---------------------------------------------------------------------------
// Core zoom logic (body of zoomCameraAtClientPoint useCallback)
// ---------------------------------------------------------------------------

export function zoomCameraAtClientPointImpl(
  clientX: number,
  clientY: number,
  zoomFactor: number,
  refs: ZoomGestureRefs,
  setters: ZoomGestureSetters,
  getCanvasDimensions: () => { width: number; height: number; dpr: number },
): void {
  if (!Number.isFinite(zoomFactor) || zoomFactor <= 0) return;
  const canvas = refs.canvasRef.current;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const { width, height, dpr } = getCanvasDimensions();
  const viewWidth = width / dpr;
  const viewHeight = height / dpr;

  setters.setCameraZoom((prevZoom) => {
    const nextZoom = Math.max(
      CAMERA_ZOOM_MIN,
      Math.min(CAMERA_ZOOM_MAX, prevZoom * zoomFactor),
    );

    if (Math.abs(nextZoom - prevZoom) < 0.0001) {
      return prevZoom;
    }

    const centerX = viewWidth / 2;
    const centerY = viewHeight / 3;
    const zoomDelta = 1 / nextZoom - 1 / prevZoom;

    const zoomToCursor = getGameSettings().camera.zoomToCursor;
    const anchorX = zoomToCursor ? x : centerX;
    const anchorY = zoomToCursor ? y : centerY;

    setters.setCameraOffset((prevOffset) => ({
      x: prevOffset.x + (anchorX - centerX) * zoomDelta,
      y: prevOffset.y + (anchorY - centerY) * zoomDelta,
    }));

    return nextZoom;
  });

  refs.isZoomDebouncingRef.current = true;
  if (refs.zoomSettleTimerRef.current) clearTimeout(refs.zoomSettleTimerRef.current);
  refs.zoomSettleTimerRef.current = setTimeout(() => {
    refs.isZoomDebouncingRef.current = false;
    refs.stableZoomRef.current = refs.cameraZoomRef.current;
    refs.cachedStaticMapLayerRef.current = null;
    refs.cachedStaticDecorationLayerRef.current = null;
    refs.cachedFogLayerRef.current = null;
    refs.zoomSettleTimerRef.current = null;
  }, ZOOM_SETTLE_DEBOUNCE_MS);
}

// ---------------------------------------------------------------------------
// Mouse wheel handler (body of handleCanvasWheelNative useCallback)
// ---------------------------------------------------------------------------

export function handleWheelZoom(
  e: WheelEvent,
  gameState: string,
  battleOutcome: unknown,
  zoomAtPoint: (clientX: number, clientY: number, zoomFactor: number) => void,
): void {
  if (gameState !== "playing" || battleOutcome) return;
  e.preventDefault();

  let delta = e.deltaY;
  if (e.deltaMode === 1) {
    delta *= 16;
  } else if (e.deltaMode === 2) {
    delta *= 120;
  }

  const normalizedDelta = Math.max(-600, Math.min(600, delta));
  const userZoomSens = getGameSettings().camera.zoomSensitivity;
  const baseSensitivity = e.ctrlKey
    ? TRACKPAD_PINCH_ZOOM_SENSITIVITY
    : WHEEL_ZOOM_SENSITIVITY;
  const sensitivity = baseSensitivity * userZoomSens;
  const zoomFactor = Math.exp(-normalizedDelta * sensitivity);

  zoomAtPoint(e.clientX, e.clientY, zoomFactor);
}

// ---------------------------------------------------------------------------
// macOS trackpad gesture handlers (gesturestart / gesturechange / gestureend)
// ---------------------------------------------------------------------------

export function handleGestureStart(
  event: Event,
  lastGestureScaleRef: MutableRefObject<number | null>,
): void {
  event.preventDefault();
  const gestureEvent = event as Event & { scale?: number };
  lastGestureScaleRef.current = gestureEvent.scale ?? 1;
}

export function handleGestureChange(
  event: Event,
  canvas: HTMLCanvasElement,
  lastGestureScaleRef: MutableRefObject<number | null>,
  zoomAtPoint: (clientX: number, clientY: number, zoomFactor: number) => void,
): void {
  event.preventDefault();
  const gestureEvent = event as Event & {
    scale?: number;
    clientX?: number;
    clientY?: number;
  };
  const currentScale = gestureEvent.scale ?? 1;
  const previousScale = lastGestureScaleRef.current ?? currentScale;

  if (
    !Number.isFinite(currentScale) ||
    currentScale <= 0 ||
    !Number.isFinite(previousScale) ||
    previousScale <= 0
  ) {
    return;
  }

  const zoomFactor = currentScale / previousScale;
  if (Math.abs(zoomFactor - 1) < 0.0005) return;

  const rect = canvas.getBoundingClientRect();
  const clientX =
    typeof gestureEvent.clientX === "number"
      ? gestureEvent.clientX
      : rect.left + rect.width / 2;
  const clientY =
    typeof gestureEvent.clientY === "number"
      ? gestureEvent.clientY
      : rect.top + rect.height / 2;

  zoomAtPoint(clientX, clientY, zoomFactor);
  lastGestureScaleRef.current = currentScale;
}

export function handleGestureEnd(
  event: Event,
  lastGestureScaleRef: MutableRefObject<number | null>,
): void {
  event.preventDefault();
  lastGestureScaleRef.current = null;
}

// ---------------------------------------------------------------------------
// Wire up all wheel + gesture listeners on a canvas (useEffect body)
// ---------------------------------------------------------------------------

export function attachWheelAndGestureListeners(
  canvas: HTMLCanvasElement,
  lastGestureScaleRef: MutableRefObject<number | null>,
  handleCanvasWheelNative: (e: WheelEvent) => void,
  zoomAtPoint: (clientX: number, clientY: number, zoomFactor: number) => void,
): () => void {
  const onGestureStart = (ev: Event) => handleGestureStart(ev, lastGestureScaleRef);
  const onGestureChange = (ev: Event) =>
    handleGestureChange(ev, canvas, lastGestureScaleRef, zoomAtPoint);
  const onGestureEnd = (ev: Event) => handleGestureEnd(ev, lastGestureScaleRef);

  canvas.addEventListener("wheel", handleCanvasWheelNative, { passive: false });
  canvas.addEventListener("gesturestart", onGestureStart as EventListener, { passive: false });
  canvas.addEventListener("gesturechange", onGestureChange as EventListener, { passive: false });
  canvas.addEventListener("gestureend", onGestureEnd as EventListener, { passive: false });

  return () => {
    canvas.removeEventListener("wheel", handleCanvasWheelNative);
    canvas.removeEventListener("gesturestart", onGestureStart as EventListener);
    canvas.removeEventListener("gesturechange", onGestureChange as EventListener);
    canvas.removeEventListener("gestureend", onGestureEnd as EventListener);
    lastGestureScaleRef.current = null;
  };
}
