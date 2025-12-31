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
      return item ? JSON.parse(item) : initialValue;
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
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
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
export interface GameProgress {
  unlockedMaps: string[];
  levelStars: Record<string, number>;
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
      setProgress((prev) => {
        const currentStars = prev.levelStars[levelId] || 0;
        if (stars <= currentStars) return prev;

        const newLevelStars = { ...prev.levelStars, [levelId]: stars };
        const totalStars = Object.values(newLevelStars).reduce(
          (a, b) => a + b,
          0
        );

        return {
          ...prev,
          levelStars: newLevelStars,
          totalStarsEarned: totalStars,
          lastPlayedLevel: levelId,
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
    unlockLevel,
    resetProgress,
    getTotalStars,
  };
}
