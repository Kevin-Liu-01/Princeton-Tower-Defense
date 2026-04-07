import { useRef, useMemo, useCallback, useEffect } from "react";
import type { MutableRefObject, Dispatch, SetStateAction } from "react";

import { DEFAULT_CAMERA_ZOOM } from "../../game/setup";
import type { Position } from "../../types";
import type { CachedCanvasRectRef } from "./cachedCanvasRect";
import type {
  StaticMapLayerCache,
  StaticDecorationLayerCache,
  FogLayerCache,
  AmbientLayerCache,
} from "./renderScene";
import {
  zoomCameraAtClientPointImpl,
  handleWheelZoom,
  attachWheelAndGestureListeners,
} from "./zoomAndGestures";
import type { ZoomGestureRefs, ZoomGestureSetters } from "./zoomAndGestures";

export interface ZoomSetupDeps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  cachedCanvasRectRef: CachedCanvasRectRef;
  isZoomDebouncingRef: MutableRefObject<boolean>;
  zoomSettleTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  cachedStaticMapLayerRef: MutableRefObject<StaticMapLayerCache | null>;
  cachedStaticDecorationLayerRef: MutableRefObject<StaticDecorationLayerCache | null>;
  cachedFogLayerRef: MutableRefObject<FogLayerCache | null>;
  cachedAmbientLayerRef: MutableRefObject<AmbientLayerCache | null>;
  lastGestureScaleRef: MutableRefObject<number | null>;
  gameState: string;
  battleOutcome: "victory" | "defeat" | null;
  selectedMap: string;
  setCameraZoom: Dispatch<SetStateAction<number>>;
  setCameraOffset: Dispatch<SetStateAction<Position>>;
  getCanvasDimensions: () => { width: number; height: number; dpr: number };
}

export interface ZoomSetupReturn {
  stableZoomRef: MutableRefObject<number>;
  cameraZoomRef: MutableRefObject<number>;
  zoomCameraAtClientPoint: (
    clientX: number,
    clientY: number,
    zoomFactor: number
  ) => void;
}

export function useZoomSetup(
  deps: ZoomSetupDeps,
  cameraZoom: number,
  externalZoomRef?: MutableRefObject<number>
): ZoomSetupReturn {
  const {
    canvasRef,
    cachedCanvasRectRef,
    isZoomDebouncingRef,
    zoomSettleTimerRef,
    cachedStaticMapLayerRef,
    cachedStaticDecorationLayerRef,
    cachedFogLayerRef,
    cachedAmbientLayerRef,
    lastGestureScaleRef,
    gameState,
    battleOutcome,
    selectedMap,
    setCameraZoom,
    setCameraOffset,
    getCanvasDimensions,
  } = deps;

  const stableZoomRef = useRef(DEFAULT_CAMERA_ZOOM);
  const internalZoomRef = useRef(DEFAULT_CAMERA_ZOOM);
  const cameraZoomRef = externalZoomRef ?? internalZoomRef;
  if (!externalZoomRef) {
    internalZoomRef.current = cameraZoom;
  }

  const zoomGestureRefs = useMemo<ZoomGestureRefs>(
    () => ({
      cachedCanvasRectRef,
      cachedFogLayerRef,
      cachedStaticDecorationLayerRef,
      cachedStaticMapLayerRef,
      cameraZoomRef,
      canvasRef,
      isZoomDebouncingRef,
      lastGestureScaleRef,
      stableZoomRef,
      zoomSettleTimerRef,
    }),
    [
      canvasRef,
      cachedCanvasRectRef,
      isZoomDebouncingRef,
      zoomSettleTimerRef,
      cachedStaticMapLayerRef,
      cachedStaticDecorationLayerRef,
      cachedFogLayerRef,
      lastGestureScaleRef,
    ]
  );

  const zoomGestureSetters = useMemo<ZoomGestureSetters>(
    () => ({ setCameraOffset, setCameraZoom }),
    [setCameraZoom, setCameraOffset]
  );

  const zoomCameraAtClientPoint = useCallback(
    (clientX: number, clientY: number, zoomFactor: number) => {
      zoomCameraAtClientPointImpl(
        clientX,
        clientY,
        zoomFactor,
        zoomGestureRefs,
        zoomGestureSetters,
        getCanvasDimensions
      );
    },
    [zoomGestureRefs, zoomGestureSetters, getCanvasDimensions]
  );

  const handleCanvasWheelNative = useCallback(
    (e: WheelEvent) =>
      handleWheelZoom(e, gameState, battleOutcome, zoomCameraAtClientPoint),
    [gameState, battleOutcome, zoomCameraAtClientPoint]
  );

  useEffect(() => {
    if (gameState !== "playing" || battleOutcome) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    return attachWheelAndGestureListeners(
      canvas,
      lastGestureScaleRef,
      handleCanvasWheelNative,
      zoomCameraAtClientPoint,
      cachedCanvasRectRef
    );
  }, [
    gameState,
    battleOutcome,
    zoomCameraAtClientPoint,
    handleCanvasWheelNative,
    canvasRef,
    lastGestureScaleRef,
  ]);

  useEffect(() => {
    cachedStaticDecorationLayerRef.current = null;
    cachedAmbientLayerRef.current = null;
    if (zoomSettleTimerRef.current) {
      clearTimeout(zoomSettleTimerRef.current);
      zoomSettleTimerRef.current = null;
    }
    isZoomDebouncingRef.current = false;
  }, [
    selectedMap,
    cachedStaticDecorationLayerRef,
    cachedAmbientLayerRef,
    zoomSettleTimerRef,
    isZoomDebouncingRef,
  ]);

  return { cameraZoomRef, stableZoomRef, zoomCameraAtClientPoint };
}
