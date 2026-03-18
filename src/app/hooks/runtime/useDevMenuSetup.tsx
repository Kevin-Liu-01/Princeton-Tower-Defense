"use client";

import React, { useMemo, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { GameState, Enemy, Position, DeathCause } from "../../types";
import { LEVEL_DATA } from "../../constants";
import { DevConfigMenu } from "../../components/ui/DevConfigMenu";
import type { GameProgress } from "../useLocalStorage";
import type { DevPerfSnapshot } from "./gameLoop";
import {
  lockLevelImpl,
  unlockAllLevelsImpl,
  setLevelStarsImpl,
  replaceProgressImpl,
  grantPawPointsImpl,
  adjustLivesImpl,
  instantVictoryImpl,
  skipWaveImpl,
  killAllEnemiesImpl,
  instantLoseImpl,
} from "./devMenuCallbacks";

export interface DevMenuSetupDeps {
  isDevMode: boolean;
  gameState: GameState;
  battleOutcome: "victory" | "defeat" | null;
  progress: GameProgress;
  devPerfEnabled: boolean;
  setDevPerfEnabled: Dispatch<SetStateAction<boolean>>;
  devPerfSnapshot: DevPerfSnapshot;
  currentWave: number;
  totalWaves: number;
  waveInProgress: boolean;
  enemies: Enemy[];
  selectedMap: string;
  setProgress: Dispatch<SetStateAction<GameProgress>>;
  addPawPoints: (amount: number) => void;
  setLives: Dispatch<SetStateAction<number>>;
  clearAllTimers: () => void;
  clearEnemies: () => void;
  onEnemyKill: (enemy: Enemy, pos: Position, particleCount: number, deathCause: DeathCause) => void;
  unlockLevel: (id: string) => void;
  setHoveredWaveBubblePathKey: Dispatch<SetStateAction<string | null>>;
  setWaveInProgress: Dispatch<SetStateAction<boolean>>;
  setNextWaveTimer: Dispatch<SetStateAction<number>>;
  setCurrentWave: Dispatch<SetStateAction<number>>;
  setIsDevModeUnlocked: Dispatch<SetStateAction<boolean>>;
}

export interface DevMenuSetupResult {
  devConfigMenu: React.ReactNode;
  handleDevModeChange: (enabled: boolean) => void;
}

export function useDevMenuSetup(deps: DevMenuSetupDeps): DevMenuSetupResult {
  const {
    isDevMode, gameState, battleOutcome, progress,
    devPerfEnabled, setDevPerfEnabled, devPerfSnapshot,
    currentWave, totalWaves, waveInProgress,
    enemies, selectedMap,
    setProgress, addPawPoints, setLives,
    clearAllTimers, clearEnemies, onEnemyKill, unlockLevel,
    setHoveredWaveBubblePathKey, setWaveInProgress,
    setNextWaveTimer, setCurrentWave, setIsDevModeUnlocked,
  } = deps;

  const devLevelOptions = useMemo(
    () =>
      Object.entries(LEVEL_DATA)
        .map(([id, levelData]) => ({ id, name: levelData?.name ?? id }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const unlockAllLevels = useCallback(
    () => unlockAllLevelsImpl(setProgress), [setProgress],
  );
  const lockLevel = useCallback(
    (levelId: string) => lockLevelImpl(setProgress, levelId), [setProgress],
  );
  const setLevelStars = useCallback(
    (levelId: string, stars: number) => setLevelStarsImpl(setProgress, levelId, stars), [setProgress],
  );
  const replaceProgress = useCallback(
    (candidate: unknown) => replaceProgressImpl(setProgress, candidate), [setProgress],
  );
  const grantPawPoints = useCallback(
    (amount: number) => grantPawPointsImpl(addPawPoints, amount), [addPawPoints],
  );
  const adjustLives = useCallback(
    (delta: number) => adjustLivesImpl(setLives, delta), [],
  );
  const instantVictory = useCallback(
    () => instantVictoryImpl({
      gameState, battleOutcome, totalWaves, clearAllTimers,
      setHoveredWaveBubblePathKey, setWaveInProgress, setNextWaveTimer,
      setCurrentWave, clearEnemies,
    }),
    [gameState, battleOutcome, clearAllTimers, clearEnemies, totalWaves],
  );
  const skipWave = useCallback(
    () => skipWaveImpl({
      gameState, battleOutcome, currentWave, totalWaves,
      clearAllTimers, clearEnemies, setWaveInProgress,
      setCurrentWave, setNextWaveTimer,
    }),
    [gameState, battleOutcome, currentWave, totalWaves, clearAllTimers, clearEnemies],
  );
  const killAllEnemies = useCallback(
    () => killAllEnemiesImpl({
      gameState, battleOutcome, enemies, selectedMap,
      onEnemyKill, clearEnemies,
    }),
    [gameState, battleOutcome, enemies, selectedMap, onEnemyKill, clearEnemies],
  );
  const instantLose = useCallback(
    () => instantLoseImpl({
      gameState, battleOutcome, clearAllTimers,
      setHoveredWaveBubblePathKey, setWaveInProgress,
      setNextWaveTimer, setLives,
    }),
    [gameState, battleOutcome, clearAllTimers],
  );

  const handleDevModeChange = useCallback(
    (enabled: boolean) => setIsDevModeUnlocked(enabled), [],
  );

  const devConfigMenu = isDevMode ? (
    <DevConfigMenu
      gameState={gameState}
      levelOptions={devLevelOptions}
      progress={progress}
      devPerfEnabled={devPerfEnabled}
      setDevPerfEnabled={setDevPerfEnabled}
      devPerfSnapshot={devPerfSnapshot}
      currentWave={currentWave}
      totalWaves={totalWaves}
      waveInProgress={waveInProgress}
      onUnlockLevel={unlockLevel}
      onLockLevel={lockLevel}
      onUnlockAllLevels={unlockAllLevels}
      onSetLevelStars={setLevelStars}
      onReplaceProgress={replaceProgress}
      onGrantPawPoints={grantPawPoints}
      onAdjustLives={adjustLives}
      onInstantVictory={instantVictory}
      onInstantLose={instantLose}
      onSkipWave={skipWave}
      onKillAllEnemies={killAllEnemies}
    />
  ) : null;

  return { devConfigMenu, handleDevModeChange };
}
