"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * A hook that syncs state with localStorage
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if no localStorage value exists
 * @returns [value, setValue] - The current value and a setter function
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);

      // For game progress, merge with defaults to ensure all keys exist
      if (
        key === "princeton-td-progress" &&
        typeof initialValue === "object" &&
        initialValue !== null
      ) {
        const defaults = initialValue as GameProgress;
        const loaded = parsed as GameProgress;

        // Ensure loaded.levelStars is an object
        const loadedStars =
          loaded &&
          typeof loaded.levelStars === "object" &&
          loaded.levelStars !== null
            ? loaded.levelStars
            : {};

        // Merge levelStars with defaults, preferring loaded values when they're numbers > 0
        const mergedLevelStars: Record<string, number> = {
          ...defaults.levelStars,
        };
        for (const [levelId, stars] of Object.entries(loadedStars)) {
          if (typeof stars === "number" && stars >= 0) {
            mergedLevelStars[levelId] = stars;
          }
        }

        // Ensure unlockedMaps is an array
        const loadedMaps = Array.isArray(loaded?.unlockedMaps)
          ? loaded.unlockedMaps
          : [];
        const mergedMaps = [
          ...new Set([...defaults.unlockedMaps, ...loadedMaps]),
        ];

        // Ensure levelStats is an object
        const loadedStats =
          loaded &&
          typeof loaded.levelStats === "object" &&
          loaded.levelStats !== null
            ? loaded.levelStats
            : {};

        return {
          ...defaults,
          ...loaded,
          unlockedMaps: mergedMaps,
          levelStars: mergedLevelStars,
          levelStats: loadedStats,
          totalStarsEarned: Object.values(mergedLevelStars).reduce(
            (a, b) => a + b,
            0
          ),
        } as T;
      }

      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Use functional update to avoid stale closure issues
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            `Error parsing localStorage change for "${key}":`,
            error
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Game progress interface for type safety
 */
export interface LevelStats {
  bestTime?: number; // Best completion time in seconds
  lastTime?: number; // Last completion time in seconds
  bestHearts?: number; // Best hearts remaining (lives)
  lastHearts?: number; // Last hearts remaining
  timesPlayed?: number; // Number of attempts
  timesWon?: number; // Number of victories
}

export interface GameProgress {
  unlockedMaps: string[];
  levelStars: Record<string, number>;
  levelStats: Record<string, LevelStats>; // Track time and hearts per level
  lastPlayedLevel?: string;
  totalStarsEarned?: number;
}

/**
 * Default game progress
 */
export const DEFAULT_GAME_PROGRESS: GameProgress = {
  unlockedMaps: ["poe"],
  levelStars: {
    poe: 0,
    carnegie: 0,
    nassau: 0,
    bog: 0,
    witch_hut: 0,
    sunken_temple: 0,
    oasis: 0,
    pyramid: 0,
    sphinx: 0,
    glacier: 0,
    fortress: 0,
    peak: 0,
    lava: 0,
    crater: 0,
    throne: 0,
  },
  levelStats: {},
  lastPlayedLevel: undefined,
  totalStarsEarned: 0,
};

/**
 * Hook specifically for game progress with helper functions
 */
export function useGameProgress() {
  const [progress, setProgress] = useLocalStorage<GameProgress>(
    "princeton-td-progress",
    DEFAULT_GAME_PROGRESS
  );

  // Update stars for a level (only if higher than current)
  const updateLevelStars = useCallback(
    (levelId: string, stars: number) => {
      if (!levelId || stars < 1) return; // Guard against invalid inputs

      setProgress((prev) => {
        // Ensure levelStars object exists
        const currentLevelStars = prev.levelStars || {};
        const currentStars = currentLevelStars[levelId] ?? 0; // Use nullish coalescing

        // Only update if new stars are higher
        if (stars <= currentStars) {
          return prev;
        }

        const newLevelStars = { ...currentLevelStars, [levelId]: stars };
        const totalStars = Object.values(newLevelStars).reduce(
          (a, b) => a + b,
          0
        );

        const newProgress = {
          ...prev,
          levelStars: newLevelStars,
          totalStarsEarned: totalStars,
          lastPlayedLevel: levelId,
        };

        return newProgress;
      });
    },
    [setProgress]
  );

  // Update stats for a level (time, hearts, play counts)
  const updateLevelStats = useCallback(
    (levelId: string, timeSpent: number, hearts: number, won: boolean) => {
      if (!levelId) return;

      setProgress((prev) => {
        const currentStats = prev.levelStats?.[levelId] || {};
        const timesPlayed = (currentStats.timesPlayed || 0) + 1;
        const timesWon = (currentStats.timesWon || 0) + (won ? 1 : 0);

        const newStats: LevelStats = {
          ...currentStats,
          lastTime: timeSpent,
          lastHearts: hearts,
          timesPlayed,
          timesWon,
        };

        // Only update best time/hearts on victory
        if (won) {
          if (!currentStats.bestTime || timeSpent < currentStats.bestTime) {
            newStats.bestTime = timeSpent;
          }
          if (!currentStats.bestHearts || hearts > currentStats.bestHearts) {
            newStats.bestHearts = hearts;
          }
        }

        return {
          ...prev,
          levelStats: {
            ...prev.levelStats,
            [levelId]: newStats,
          },
        };
      });
    },
    [setProgress]
  );

  // Unlock a new level
  const unlockLevel = useCallback(
    (levelId: string) => {
      setProgress((prev) => {
        if (prev.unlockedMaps.includes(levelId)) return prev;
        return {
          ...prev,
          unlockedMaps: [...prev.unlockedMaps, levelId],
        };
      });
    },
    [setProgress]
  );

  // Reset all progress
  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_GAME_PROGRESS);
  }, [setProgress]);

  // Get total stars earned
  const getTotalStars = useCallback(() => {
    return Object.values(progress.levelStars).reduce((a, b) => a + b, 0);
  }, [progress.levelStars]);

  return {
    progress,
    setProgress,
    updateLevelStars,
    updateLevelStats,
    unlockLevel,
    resetProgress,
    getTotalStars,
  };
}
