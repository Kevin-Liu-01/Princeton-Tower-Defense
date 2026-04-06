import { DEV_MODE_STORAGE_KEY } from "../../constants/settings";

export type RenderQuality = "high" | "medium" | "low";

export const BG_OVERSCAN_X = 300;
export const BG_OVERSCAN_Y = 300;
export const DECOR_OVERSCAN = 200;

export const QUALITY_DPR_CAP: Record<RenderQuality, number> = {
  high: 2,
  medium: 1.75,
  low: 1.5,
};

export const QUALITY_DECORATION_MARGIN_PX: Record<RenderQuality, number> = {
  high: 260,
  medium: 260,
  low: 260,
};

export const QUALITY_SHADOW_MULTIPLIER: Record<RenderQuality, number> = {
  high: 1,
  medium: 0.6,
  low: 0.35,
};

export const CAMERA_ZOOM_MIN = 0.5;
export const CAMERA_ZOOM_MAX = 2.5;
export const WHEEL_ZOOM_SENSITIVITY = 0.0014;
export const TRACKPAD_PINCH_ZOOM_SENSITIVITY = 0.0022;
export const ZOOM_SETTLE_DEBOUNCE_MS = 150;
export const FRIENDLY_SEPARATION_MULT = 0.18;

export const WATER_DECORATION_TYPES = new Set([
  "water",
  "fountain",
  "deep_water",
  "frozen_pond",
  "lava_pool",
  "lava_fall",
  "poison_pool",
  "lake",
  "algae_pool",
  "fishing_spot",
  "carnegie_lake",
]);

export const QUALITY_TRANSITION_COOLDOWN_MS = 2000;
export const QUALITY_TRANSITION_MAX_COOLDOWN_MS = 15_000;

export const QUALITY_DOWNGRADE_THRESHOLD: Record<RenderQuality, number> = {
  high: 18,
  medium: 24,
  low: Infinity,
};

export const QUALITY_UPGRADE_THRESHOLD: Record<RenderQuality, number> = {
  high: -Infinity,
  medium: 12,
  low: 14,
};

export const QUALITY_UPGRADE_TARGET: Record<RenderQuality, RenderQuality> = {
  high: "high",
  medium: "high",
  low: "medium",
};

export const QUALITY_DOWNGRADE_TARGET: Record<RenderQuality, RenderQuality> = {
  high: "medium",
  medium: "low",
  low: "low",
};

let _isMobile: boolean | null = null;

export function isMobileDevice(): boolean {
  if (_isMobile !== null) return _isMobile;
  if (typeof window === "undefined") return false;
  _isMobile = window.matchMedia("(pointer: coarse)").matches;
  return _isMobile;
}

const DEV_CONFIG_ENV_VALUE = process.env.NEXT_PUBLIC_TD_DEV_PERF;

export const DEV_CONFIG_MENU_ENABLED =
  typeof DEV_CONFIG_ENV_VALUE === "string" &&
  DEV_CONFIG_ENV_VALUE.trim() === "1";
export const DEV_PERF_STORAGE_KEY = "ptd:dev-perf-overlay-enabled";
export const PHOTO_MODE_STORAGE_KEY = "ptd:photo-mode-enabled";

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function readDevModeUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEV_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
