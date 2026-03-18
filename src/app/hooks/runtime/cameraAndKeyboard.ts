import type { MutableRefObject, Dispatch, SetStateAction } from "react";
import type { Position, SpellType } from "../../types";
import type { StaticMapLayerCache } from "./renderScene";
import { captureCanvas } from "../../utils/screenshot";
import {
  BG_OVERSCAN_X,
  BG_OVERSCAN_Y,
  DEV_CONFIG_MENU_ENABLED,
  DEV_PERF_STORAGE_KEY,
} from "./runtimeConfig";
import { SPELL_DATA } from "../../constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CameraControlParams {
  cameraOffset: Position;
  cameraZoom: number;
  cameraModeActive: boolean;
  inspectorActive: boolean;
  gameSpeed: number;
  gameState: string;
  battleOutcome: unknown;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  bgCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  backdropCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  cachedStaticMapLayerRef: MutableRefObject<StaticMapLayerCache | null>;
  preLockSpeedRef: MutableRefObject<number | null>;
  targetingSpellRef: MutableRefObject<SpellType | null>;
  placingTroopRef: MutableRefObject<boolean>;
  setCameraOffset: Dispatch<SetStateAction<Position>>;
  setCameraZoom: Dispatch<SetStateAction<number>>;
  setCameraModeActive: Dispatch<SetStateAction<boolean>>;
  setGameSpeed: Dispatch<SetStateAction<number>>;
  setBuildingTower: (v: null) => void;
  setDraggingTower: (v: null) => void;
  setIsBuildDragging: (v: boolean) => void;
  setTargetingSpell: (v: null) => void;
  setPlacingTroop: (v: boolean) => void;
  setSelectedTower: (v: null) => void;
  setActiveSentinelTargetKey: (v: null) => void;
  setMissileMortarTargetingId: (v: null) => void;
  setHero: Dispatch<SetStateAction<any>>;
  setTroops: Dispatch<SetStateAction<any[]>>;
  setDevPerfEnabled: Dispatch<SetStateAction<boolean>>;
  addPawPoints: (n: number) => void;
  getRenderDpr: () => number;
}

// ---------------------------------------------------------------------------
// Keyboard camera pan / zoom / escape handler
// ---------------------------------------------------------------------------

const PAN_SPEED = 20;

export function handleCameraKeyDown(
  e: KeyboardEvent,
  params: Pick<
    CameraControlParams,
    | "setCameraOffset"
    | "setCameraZoom"
    | "setBuildingTower"
    | "setDraggingTower"
    | "setIsBuildDragging"
    | "setTargetingSpell"
    | "setPlacingTroop"
    | "setSelectedTower"
    | "setActiveSentinelTargetKey"
    | "setMissileMortarTargetingId"
    | "setHero"
    | "setTroops"
    | "addPawPoints"
    | "targetingSpellRef"
    | "placingTroopRef"
  >,
): void {
  switch (e.key.toLowerCase()) {
    case "w":
    case "arrowup":
      params.setCameraOffset((prev) => ({ ...prev, y: prev.y + PAN_SPEED }));
      break;
    case "s":
    case "arrowdown":
      params.setCameraOffset((prev) => ({ ...prev, y: prev.y - PAN_SPEED }));
      break;
    case "a":
    case "arrowleft":
      params.setCameraOffset((prev) => ({ ...prev, x: prev.x + PAN_SPEED }));
      break;
    case "d":
    case "arrowright":
      params.setCameraOffset((prev) => ({ ...prev, x: prev.x - PAN_SPEED }));
      break;
    case "+":
    case "=":
      params.setCameraZoom((prev) => Math.min(prev + 0.1, 2));
      break;
    case "-":
    case "_":
      params.setCameraZoom((prev) => Math.max(prev - 0.1, 0.5));
      break;
    case "escape":
      handleEscapeKey(params);
      break;
  }
}

function handleEscapeKey(
  params: Pick<
    CameraControlParams,
    | "setBuildingTower"
    | "setDraggingTower"
    | "setIsBuildDragging"
    | "setTargetingSpell"
    | "setPlacingTroop"
    | "setSelectedTower"
    | "setActiveSentinelTargetKey"
    | "setMissileMortarTargetingId"
    | "setHero"
    | "setTroops"
    | "addPawPoints"
    | "targetingSpellRef"
    | "placingTroopRef"
  >,
): void {
  params.setBuildingTower(null);
  params.setDraggingTower(null);
  params.setIsBuildDragging(false);

  if (params.targetingSpellRef.current) {
    const refundCost =
      SPELL_DATA[params.targetingSpellRef.current]?.cost ?? 0;
    if (refundCost > 0) params.addPawPoints(refundCost);
    params.setTargetingSpell(null);
  }
  if (params.placingTroopRef.current) {
    const refundCost = SPELL_DATA["reinforcements"]?.cost ?? 0;
    if (refundCost > 0) params.addPawPoints(refundCost);
    params.setPlacingTroop(false);
  }

  params.setSelectedTower(null);
  params.setActiveSentinelTargetKey(null);
  params.setMissileMortarTargetingId(null);
  params.setHero((prev: any) => (prev ? { ...prev, selected: false } : null));
  params.setTroops((prev: any[]) =>
    prev.map((t) => ({ ...t, selected: false })),
  );
}

// ---------------------------------------------------------------------------
// Camera / photo mode
// ---------------------------------------------------------------------------

export function enterCameraModeImpl(
  cameraModeActive: boolean,
  gameSpeed: number,
  preLockSpeedRef: MutableRefObject<number | null>,
  setGameSpeed: Dispatch<SetStateAction<number>>,
  setCameraModeActive: Dispatch<SetStateAction<boolean>>,
): void {
  if (cameraModeActive) return;
  preLockSpeedRef.current = gameSpeed;
  setGameSpeed(0);
  setCameraModeActive(true);
}

export function exitCameraModeImpl(
  cameraModeActive: boolean,
  preLockSpeedRef: MutableRefObject<number | null>,
  setGameSpeed: Dispatch<SetStateAction<number>>,
  setCameraModeActive: Dispatch<SetStateAction<boolean>>,
): void {
  if (!cameraModeActive) return;
  setCameraModeActive(false);
  const restored = preLockSpeedRef.current;
  setGameSpeed(restored != null && restored > 0 ? restored : 1);
  preLockSpeedRef.current = null;
}

// ---------------------------------------------------------------------------
// F2 key handler
// ---------------------------------------------------------------------------

export function handleF2Key(e: KeyboardEvent, toggleCameraMode: () => void): void {
  if (e.key !== "F2") return;
  e.preventDefault();
  toggleCameraMode();
}

// ---------------------------------------------------------------------------
// Space bar pause handler
// ---------------------------------------------------------------------------

export function handleSpacePause(
  e: KeyboardEvent,
  cameraModeActive: boolean,
  inspectorActive: boolean,
  battleOutcome: unknown,
  setGameSpeed: Dispatch<SetStateAction<number>>,
): void {
  if (e.key !== " ") return;
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "BUTTON" || tag === "INPUT") return;
  e.preventDefault();
  if (cameraModeActive || inspectorActive) return;
  if (battleOutcome) return;
  setGameSpeed((prev) => (prev === 0 ? 1 : 0));
}

// ---------------------------------------------------------------------------
// Screenshot capture
// ---------------------------------------------------------------------------

export async function captureScreenshotImpl(params: {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  bgCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  backdropCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
  cachedStaticMapLayerRef: MutableRefObject<StaticMapLayerCache | null>;
  cameraOffset: Position;
  cameraZoom: number;
  getRenderDpr: () => number;
}): Promise<boolean> {
  const canvas = params.canvasRef.current;
  if (!canvas) return false;

  const bgCanvas = params.bgCanvasRef.current;
  if (bgCanvas) {
    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = canvas.width;
    compositeCanvas.height = canvas.height;
    const compositeCtx = compositeCanvas.getContext("2d");
    if (compositeCtx) {
      const dpr = params.getRenderDpr();
      const cached = params.cachedStaticMapLayerRef.current;
      const anchor = cached?.anchorOffset ?? params.cameraOffset;
      const bgDeltaX = (anchor.x - params.cameraOffset.x) * params.cameraZoom;
      const bgDeltaY = (anchor.y - params.cameraOffset.y) * params.cameraZoom;
      const srcX = (BG_OVERSCAN_X / 2 + bgDeltaX) * dpr;
      const srcY = (BG_OVERSCAN_Y / 3 + bgDeltaY) * dpr;

      const bdCanvas = params.backdropCanvasRef.current;
      if (bdCanvas) {
        const bdSrcX = (BG_OVERSCAN_X / 2) * dpr;
        const bdSrcY = (BG_OVERSCAN_Y / 3) * dpr;
        compositeCtx.drawImage(
          bdCanvas,
          bdSrcX,
          bdSrcY,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }
      compositeCtx.drawImage(
        bgCanvas,
        srcX,
        srcY,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      compositeCtx.drawImage(canvas, 0, 0);
      return captureCanvas(compositeCanvas);
    }
  }
  return captureCanvas(canvas);
}

// ---------------------------------------------------------------------------
// Pause lock
// ---------------------------------------------------------------------------

export function computePauseLocked(
  cameraModeActive: boolean,
  inspectorActive: boolean,
): boolean {
  return cameraModeActive || inspectorActive;
}

// ---------------------------------------------------------------------------
// Dev perf overlay – localStorage persistence
// ---------------------------------------------------------------------------

export function loadDevPerfSetting(
  setDevPerfEnabled: Dispatch<SetStateAction<boolean>>,
): void {
  if (!DEV_CONFIG_MENU_ENABLED || typeof window === "undefined") return;
  try {
    const saved = window.localStorage.getItem(DEV_PERF_STORAGE_KEY);
    if (saved === "1" || saved === "0") {
      setDevPerfEnabled(saved === "1");
    }
  } catch {
    // Ignore localStorage access errors.
  }
}

export function saveDevPerfSetting(devPerfEnabled: boolean): void {
  if (!DEV_CONFIG_MENU_ENABLED || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DEV_PERF_STORAGE_KEY,
      devPerfEnabled ? "1" : "0",
    );
  } catch {
    // Ignore localStorage access errors.
  }
}

// ---------------------------------------------------------------------------
// Dev perf hotkey (Ctrl+Shift+P)
// ---------------------------------------------------------------------------

export function handleDevPerfHotkey(
  e: KeyboardEvent,
  setDevPerfEnabled: Dispatch<SetStateAction<boolean>>,
): void {
  if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
  if (e.key.toLowerCase() !== "p") return;
  e.preventDefault();
  setDevPerfEnabled((prev) => !prev);
}

// ---------------------------------------------------------------------------
// Battle outcome pause lock
// ---------------------------------------------------------------------------

export function enforceBattleOutcomePause(
  battleOutcome: unknown,
  gameSpeed: number,
  setGameSpeed: Dispatch<SetStateAction<number>>,
): void {
  if (!battleOutcome) return;
  if (gameSpeed === 0) return;
  setGameSpeed(0);
}
