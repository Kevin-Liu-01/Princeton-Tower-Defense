"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type {
  GameSettings,
  QualityPreset,
  SettingsCategory,
} from "../constants/settings";
import {
  DEFAULT_GAME_SETTINGS,
  QUALITY_PRESETS,
  SETTINGS_STORAGE_KEY,
} from "../constants/settings";
import { setPerformanceSettings } from "../rendering/performance";

// =============================================================================
// MODULE-LEVEL SETTINGS (accessible from rendering code without React)
// =============================================================================

let currentGameSettings: GameSettings = deepClone(DEFAULT_GAME_SETTINGS);
let settingsVersion = 0;

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function mergeSettings(
  defaults: GameSettings,
  loaded: Partial<GameSettings>
): GameSettings {
  const merged = deepClone(defaults);
  for (const key of Object.keys(defaults) as SettingsCategory[]) {
    if (loaded[key] && typeof loaded[key] === "object") {
      Object.assign(merged[key], loaded[key]);
    }
  }
  return merged;
}

export function getGameSettings(): GameSettings {
  return currentGameSettings;
}

export function getSettingsVersion(): number {
  return settingsVersion;
}

function syncPerformanceModule(settings: GameSettings): void {
  const { graphics } = settings;
  setPerformanceSettings({
    disableShadows: graphics.shadowQuality === "off",
    shadowQualityMultiplier:
      graphics.shadowQuality === "off"
        ? 0
        : graphics.shadowQuality === "low"
          ? 0.35
          : graphics.shadowQuality === "medium"
            ? 0.6
            : 1.0,
    reducedParticles:
      graphics.particleDensity === "off" ||
      graphics.particleDensity === "reduced",
    simplifiedGradients: graphics.gradientQuality === "simplified",
    skipEnvironmentEffects: graphics.environmentEffects === "off",
    reducedFogQuality:
      graphics.fogQuality === "off" || graphics.fogQuality === "reduced",
  });
}

// =============================================================================
// REACT HOOK
// =============================================================================

export function useSettings(): {
  settings: GameSettings;
  updateCategory: <K extends SettingsCategory>(
    category: K,
    patch: Partial<GameSettings[K]>
  ) => void;
  applyPreset: (preset: QualityPreset) => void;
  resetToDefaults: () => void;
  resetCategory: (category: SettingsCategory) => void;
} {
  const [settings, setSettings] = useState<GameSettings>(
    () => deepClone(currentGameSettings)
  );
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw) as Partial<GameSettings>;
        const merged = mergeSettings(DEFAULT_GAME_SETTINGS, loaded);
        currentGameSettings = merged;
        settingsVersion++;
        syncPerformanceModule(merged);
        setSettings(deepClone(merged));
      } else {
        syncPerformanceModule(currentGameSettings);
      }
    } catch {
      syncPerformanceModule(currentGameSettings);
    }
  }, []);

  const persist = useCallback((next: GameSettings) => {
    currentGameSettings = next;
    settingsVersion++;
    syncPerformanceModule(next);
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage full — silently fail
    }
  }, []);

  const updateCategory = useCallback(
    <K extends SettingsCategory>(
      category: K,
      patch: Partial<GameSettings[K]>
    ) => {
      setSettings((prev) => {
        const next: GameSettings = {
          ...prev,
          [category]: { ...prev[category], ...patch },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const applyPreset = useCallback(
    (preset: QualityPreset) => {
      const presetData = QUALITY_PRESETS[preset];
      setSettings((prev) => {
        const next = deepClone(prev);
        if (presetData.graphics) Object.assign(next.graphics, presetData.graphics);
        if (presetData.landscaping) Object.assign(next.landscaping, presetData.landscaping);
        if (presetData.animation) Object.assign(next.animation, presetData.animation);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetToDefaults = useCallback(() => {
    const defaults = deepClone(DEFAULT_GAME_SETTINGS);
    persist(defaults);
    setSettings(defaults);
  }, [persist]);

  const resetCategory = useCallback(
    (category: SettingsCategory) => {
      setSettings((prev) => {
        const next = {
          ...prev,
          [category]: deepClone(DEFAULT_GAME_SETTINGS[category]),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { settings, updateCategory, applyPreset, resetToDefaults, resetCategory };
}
