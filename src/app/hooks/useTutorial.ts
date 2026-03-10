"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "../useLocalStorage";
import type { EnemyType, HazardType, SpecialTowerType } from "../types";
import type { EncounterInfo } from "../constants/tutorial";
import {
  TUTORIAL_STEPS,
  SPECIAL_TOWER_ENCOUNTERS,
  getHazardEncounter,
} from "../constants/tutorial";
import { ENEMY_DATA } from "../constants/enemies";

// =============================================================================
// TUTORIAL STATE
// =============================================================================

export interface TutorialState {
  hasCompletedTutorial: boolean;
  seenEnemyTypes: string[];
  seenSpecialTowers: string[];
  seenHazards: string[];
}

const TUTORIAL_STORAGE_KEY = "princeton-td-tutorial";

const DEFAULT_TUTORIAL_STATE: TutorialState = {
  hasCompletedTutorial: false,
  seenEnemyTypes: [],
  seenSpecialTowers: [],
  seenHazards: [],
};

// =============================================================================
// ENCOUNTER QUEUE ITEM
// =============================================================================

export interface EncounterQueueItem extends EncounterInfo {
  key: string;
  entityType?: string;
  members?: EnemyType[];
}

// =============================================================================
// HOOK
// =============================================================================

export function useTutorial() {
  const [state, setState] = useLocalStorage<TutorialState>(
    TUTORIAL_STORAGE_KEY,
    DEFAULT_TUTORIAL_STATE
  );

  // --- Tutorial completion ---

  const markTutorialComplete = useCallback(() => {
    setState((prev) => ({ ...prev, hasCompletedTutorial: true }));
  }, [setState]);

  const skipTutorial = useCallback(() => {
    setState((prev) => ({ ...prev, hasCompletedTutorial: true }));
  }, [setState]);

  // --- Enemy encounters ---

  const markEnemiesSeen = useCallback(
    (types: EnemyType[]) => {
      setState((prev) => {
        const newSeen = new Set(prev.seenEnemyTypes);
        let changed = false;
        for (const t of types) {
          if (!newSeen.has(t)) {
            newSeen.add(t);
            changed = true;
          }
        }
        if (!changed) return prev;
        return { ...prev, seenEnemyTypes: Array.from(newSeen) };
      });
    },
    [setState]
  );

  const getUnseenEnemyEncounters = useCallback(
    (waveEnemyTypes: EnemyType[]): EncounterQueueItem[] => {
      const seen = new Set(state.seenEnemyTypes);
      const unseenTypes = Array.from(new Set(waveEnemyTypes.filter((t) => !seen.has(t))));
      if (unseenTypes.length === 0) return [];

      const names = unseenTypes.map((t) => ENEMY_DATA[t]?.name || t);
      const title = unseenTypes.length === 1
        ? `New: ${names[0]}`
        : `${unseenTypes.length} New Enemies`;

      return [{
        key: `enemy-wave-${unseenTypes.join("-")}`,
        name: title,
        description: "",
        category: "enemy",
        members: unseenTypes,
      }];
    },
    [state.seenEnemyTypes]
  );

  // --- Special tower encounters ---

  const markSpecialTowersSeen = useCallback(
    (types: SpecialTowerType[]) => {
      setState((prev) => {
        const newSeen = new Set(prev.seenSpecialTowers);
        let changed = false;
        for (const t of types) {
          if (!newSeen.has(t)) {
            newSeen.add(t);
            changed = true;
          }
        }
        if (!changed) return prev;
        return { ...prev, seenSpecialTowers: Array.from(newSeen) };
      });
    },
    [setState]
  );

  const getUnseenSpecialTowerEncounters = useCallback(
    (towerTypes: SpecialTowerType[]): EncounterQueueItem[] => {
      const seen = new Set(state.seenSpecialTowers);
      return towerTypes
        .filter((t) => !seen.has(t))
        .map((t) => ({
          key: `special-tower-${t}`,
          entityType: t,
          ...SPECIAL_TOWER_ENCOUNTERS[t],
        }));
    },
    [state.seenSpecialTowers]
  );

  // --- Hazard encounters ---

  const markHazardsSeen = useCallback(
    (types: HazardType[]) => {
      setState((prev) => {
        const newSeen = new Set(prev.seenHazards);
        let changed = false;
        for (const t of types) {
          if (!newSeen.has(t)) {
            newSeen.add(t);
            changed = true;
          }
        }
        if (!changed) return prev;
        return { ...prev, seenHazards: Array.from(newSeen) };
      });
    },
    [setState]
  );

  const getUnseenHazardEncounters = useCallback(
    (hazardTypes: HazardType[]): EncounterQueueItem[] => {
      const seen = new Set(state.seenHazards);
      const unique = Array.from(new Set(hazardTypes.filter((t) => !seen.has(t))));
      const encounters: EncounterQueueItem[] = [];

      for (const t of unique) {
        const info = getHazardEncounter(t);
        if (info) {
          encounters.push({ key: `hazard-${t}`, entityType: t, ...info });
        }
      }
      return encounters;
    },
    [state.seenHazards]
  );

  // --- Combined level-load encounter check ---

  const getLevelEncounters = useCallback(
    (
      specialTowerTypes: SpecialTowerType[],
      hazardTypes: HazardType[]
    ): EncounterQueueItem[] => {
      return [
        ...getUnseenSpecialTowerEncounters(specialTowerTypes),
        ...getUnseenHazardEncounters(hazardTypes),
      ];
    },
    [getUnseenSpecialTowerEncounters, getUnseenHazardEncounters]
  );

  const markLevelEncountersSeen = useCallback(
    (specialTowerTypes: SpecialTowerType[], hazardTypes: HazardType[]) => {
      markSpecialTowersSeen(specialTowerTypes);
      markHazardsSeen(hazardTypes);
    },
    [markSpecialTowersSeen, markHazardsSeen]
  );

  // --- Reset (for dev/testing) ---

  const resetTutorial = useCallback(() => {
    setState(DEFAULT_TUTORIAL_STATE);
  }, [setState]);

  const tutorialSteps = useMemo(() => TUTORIAL_STEPS, []);

  return {
    // State
    hasCompletedTutorial: state.hasCompletedTutorial,
    tutorialSteps,

    // Tutorial flow
    markTutorialComplete,
    skipTutorial,

    // Enemy encounters
    markEnemiesSeen,
    getUnseenEnemyEncounters,

    // Special tower encounters
    markSpecialTowersSeen,
    getUnseenSpecialTowerEncounters,

    // Hazard encounters
    markHazardsSeen,
    getUnseenHazardEncounters,

    // Combined level encounters
    getLevelEncounters,
    markLevelEncountersSeen,

    // Dev
    resetTutorial,
  };
}

export type UseTutorialReturn = ReturnType<typeof useTutorial>;
