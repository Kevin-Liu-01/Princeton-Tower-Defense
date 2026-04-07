import type { Dispatch, SetStateAction } from "react";

import {
  LEVEL_DATA,
  normalizeSpellUpgradeLevels,
  WAVE_TIMER_BASE,
} from "../../constants";
import { getEnemyPosWithPath } from "../../game/setup";
import type {
  Enemy,
  GameState,
  SpellUpgradeLevels,
  Position,
  DeathCause,
} from "../../types";
import type { GameProgress } from "../useLocalStorage";
import { DEFAULT_GAME_PROGRESS } from "../useLocalStorage";

export interface DevMenuCallbackParams {
  gameState: GameState;
  battleOutcome: "victory" | "defeat" | null;
  enemies: Enemy[];
  selectedMap: string;
  currentWave: number;
  totalWaves: number;

  setProgress: Dispatch<SetStateAction<GameProgress>>;
  setLives: Dispatch<SetStateAction<number>>;
  setWaveInProgress: Dispatch<SetStateAction<boolean>>;
  setCurrentWave: Dispatch<SetStateAction<number>>;
  setNextWaveTimer: Dispatch<SetStateAction<number>>;
  setHoveredWaveBubblePathKey: Dispatch<SetStateAction<string | null>>;

  addPawPoints: (amount: number) => void;
  clearAllTimers: () => void;
  clearEnemies: () => void;
  onEnemyKill: (
    enemy: Enemy,
    pos: Position,
    particleCount: number,
    deathCause: DeathCause
  ) => void;
}

export function lockLevelImpl(
  setProgress: Dispatch<SetStateAction<GameProgress>>,
  levelId: string
): void {
  if (!levelId) {
    return;
  }
  setProgress((prev) => ({
    ...prev,
    unlockedMaps: prev.unlockedMaps.filter((id) => id !== levelId),
  }));
}

export function unlockAllLevelsImpl(
  setProgress: Dispatch<SetStateAction<GameProgress>>
): void {
  const allLevelIds = Object.keys(LEVEL_DATA);
  const allStars: Record<string, number> = {};
  for (const id of allLevelIds) {
    allStars[id] = 3;
  }
  setProgress((prev) => ({
    ...prev,
    levelStars: { ...prev.levelStars, ...allStars },
    totalStarsEarned: Object.values({ ...prev.levelStars, ...allStars }).reduce(
      (sum, s) => sum + (Number.isFinite(s) ? s : 0),
      0
    ),
    unlockedMaps: [...new Set([...prev.unlockedMaps, ...allLevelIds])],
  }));
}

export function setLevelStarsImpl(
  setProgress: Dispatch<SetStateAction<GameProgress>>,
  levelId: string,
  stars: number
): void {
  if (!levelId) {
    return;
  }
  if (!Number.isFinite(stars)) {
    return;
  }

  const normalizedStars = Math.max(0, Math.min(3, Math.round(stars)));

  setProgress((prev) => {
    const nextLevelStars = {
      ...prev.levelStars,
      [levelId]: normalizedStars,
    };

    return {
      ...prev,
      levelStars: nextLevelStars,
      totalStarsEarned: Object.values(nextLevelStars).reduce(
        (sum, value) => sum + (Number.isFinite(value) ? value : 0),
        0
      ),
    };
  });
}

export function replaceProgressImpl(
  setProgress: Dispatch<SetStateAction<GameProgress>>,
  candidate: unknown
): { ok: boolean; message: string } {
  if (!candidate || typeof candidate !== "object") {
    return { message: "Progress payload must be an object.", ok: false };
  }

  const next = candidate as Partial<GameProgress>;
  if (
    !Array.isArray(next.unlockedMaps) ||
    typeof next.levelStars !== "object" ||
    next.levelStars === null ||
    typeof next.levelStats !== "object" ||
    next.levelStats === null
  ) {
    return {
      message:
        "Missing required keys: unlockedMaps[], levelStars{}, levelStats{}.",
      ok: false,
    };
  }

  const normalizedStars: Record<string, number> = {
    ...DEFAULT_GAME_PROGRESS.levelStars,
  };
  Object.entries(next.levelStars as Record<string, unknown>).forEach(
    ([levelId, stars]) => {
      if (typeof stars !== "number" || !Number.isFinite(stars)) {
        return;
      }
      normalizedStars[levelId] = Math.max(0, Math.min(3, Math.round(stars)));
    }
  );

  const normalizedLevelStats = Object.fromEntries(
    Object.entries(next.levelStats as Record<string, unknown>).filter(
      ([, value]) => value && typeof value === "object"
    )
  ) as GameProgress["levelStats"];
  const normalizedSpellUpgrades = normalizeSpellUpgradeLevels(
    next.spellUpgrades as Partial<SpellUpgradeLevels> | undefined
  );

  const normalizedProgress: GameProgress = {
    ...DEFAULT_GAME_PROGRESS,
    ...next,
    lastPlayedLevel:
      typeof next.lastPlayedLevel === "string"
        ? next.lastPlayedLevel
        : undefined,
    levelStars: normalizedStars,
    levelStats: normalizedLevelStats,
    spellUpgrades: normalizedSpellUpgrades,
    totalStarsEarned: Object.values(normalizedStars).reduce(
      (sum, stars) => sum + stars,
      0
    ),
    unlockedMaps: [
      ...new Set(
        [
          ...DEFAULT_GAME_PROGRESS.unlockedMaps,
          ...next.unlockedMaps.filter(
            (levelId): levelId is string =>
              typeof levelId === "string" && levelId.length > 0
          ),
        ].filter(Boolean)
      ),
    ],
  };

  setProgress(normalizedProgress);
  return { message: "Progress data updated.", ok: true };
}

export function grantPawPointsImpl(
  addPawPoints: (amount: number) => void,
  amount: number
): void {
  const normalizedAmount = Math.max(0, Math.round(amount));
  if (normalizedAmount <= 0) {
    return;
  }
  addPawPoints(normalizedAmount);
}

export function adjustLivesImpl(
  setLives: Dispatch<SetStateAction<number>>,
  delta: number
): void {
  const normalizedDelta = Math.trunc(delta);
  if (!Number.isFinite(normalizedDelta) || normalizedDelta === 0) {
    return;
  }
  setLives((previousLives) => Math.max(0, previousLives + normalizedDelta));
}

export function instantVictoryImpl(
  params: Pick<
    DevMenuCallbackParams,
    | "gameState"
    | "battleOutcome"
    | "totalWaves"
    | "clearAllTimers"
    | "setHoveredWaveBubblePathKey"
    | "setWaveInProgress"
    | "setNextWaveTimer"
    | "setCurrentWave"
    | "clearEnemies"
  >
): void {
  if (params.gameState !== "playing" || params.battleOutcome) {
    return;
  }
  params.clearAllTimers();
  params.setHoveredWaveBubblePathKey(null);
  params.setWaveInProgress(false);
  params.setNextWaveTimer(0);
  params.setCurrentWave(params.totalWaves);
  params.clearEnemies();
}

export function skipWaveImpl(
  params: Pick<
    DevMenuCallbackParams,
    | "gameState"
    | "battleOutcome"
    | "currentWave"
    | "totalWaves"
    | "clearAllTimers"
    | "clearEnemies"
    | "setWaveInProgress"
    | "setCurrentWave"
    | "setNextWaveTimer"
  >
): void {
  if (params.gameState !== "playing" || params.battleOutcome) {
    return;
  }
  if (params.currentWave >= params.totalWaves) {
    return;
  }
  params.clearAllTimers();
  params.clearEnemies();
  params.setWaveInProgress(false);
  params.setCurrentWave((w) => w + 1);
  params.setNextWaveTimer(WAVE_TIMER_BASE);
}

export function skipToWaveImpl(
  params: Pick<
    DevMenuCallbackParams,
    | "gameState"
    | "battleOutcome"
    | "totalWaves"
    | "clearAllTimers"
    | "clearEnemies"
    | "setWaveInProgress"
    | "setCurrentWave"
    | "setNextWaveTimer"
  >,
  targetWave: number
): void {
  if (params.gameState !== "playing" || params.battleOutcome) {
    return;
  }
  if (targetWave < 0 || targetWave >= params.totalWaves) {
    return;
  }
  params.clearAllTimers();
  params.clearEnemies();
  params.setWaveInProgress(false);
  params.setCurrentWave(targetWave);
  params.setNextWaveTimer(WAVE_TIMER_BASE);
}

export function killAllEnemiesImpl(
  params: Pick<
    DevMenuCallbackParams,
    | "gameState"
    | "battleOutcome"
    | "enemies"
    | "selectedMap"
    | "onEnemyKill"
    | "clearEnemies"
  >
): void {
  if (params.gameState !== "playing" || params.battleOutcome) {
    return;
  }
  for (const enemy of params.enemies) {
    if (enemy.dead || enemy.hp <= 0) {
      continue;
    }
    const pos = getEnemyPosWithPath(enemy, params.selectedMap);
    params.onEnemyKill(enemy, pos, 10, "default");
  }
  params.clearEnemies();
}

export function instantLoseImpl(
  params: Pick<
    DevMenuCallbackParams,
    | "gameState"
    | "battleOutcome"
    | "clearAllTimers"
    | "setHoveredWaveBubblePathKey"
    | "setWaveInProgress"
    | "setNextWaveTimer"
    | "setLives"
  >
): void {
  if (params.gameState !== "playing" || params.battleOutcome) {
    return;
  }
  params.clearAllTimers();
  params.setHoveredWaveBubblePathKey(null);
  params.setWaveInProgress(false);
  params.setNextWaveTimer(0);
  params.setLives(0);
}
