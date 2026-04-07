"use client";

import React, { useMemo, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import { DevConfigMenu } from "../../components/ui/DevConfigMenu";
import { LEVEL_DATA } from "../../constants";
import type { GameState, Enemy, Position, DeathCause } from "../../types";
import type { GameProgress } from "../useLocalStorage";
import {
  lockLevelImpl,
  unlockAllLevelsImpl,
  setLevelStarsImpl,
  replaceProgressImpl,
  grantPawPointsImpl,
  adjustLivesImpl,
  instantVictoryImpl,
  skipWaveImpl,
  skipToWaveImpl,
  killAllEnemiesImpl,
  instantLoseImpl,
} from "./devMenuCallbacks";
import type { DevPerfSnapshot } from "./gameLoop";

export interface DevMenuSetupDeps {
  isDevMode: boolean;
  gameState: GameState;
  battleOutcome: "victory" | "defeat" | null;
  progress: GameProgress;
  devPerfEnabled: boolean;
  setDevPerfEnabled: Dispatch<SetStateAction<boolean>>;
  devPerfSnapshot: DevPerfSnapshot;
  photoModeEnabled: boolean;
  setPhotoModeEnabled: Dispatch<SetStateAction<boolean>>;
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
  onEnemyKill: (
    enemy: Enemy,
    pos: Position,
    particleCount: number,
    deathCause: DeathCause
  ) => void;
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
    isDevMode,
    gameState,
    battleOutcome,
    progress,
    devPerfEnabled,
    setDevPerfEnabled,
    devPerfSnapshot,
    photoModeEnabled,
    setPhotoModeEnabled,
    currentWave,
    totalWaves,
    waveInProgress,
    enemies,
    selectedMap,
    setProgress,
    addPawPoints,
    setLives,
    clearAllTimers,
    clearEnemies,
    onEnemyKill,
    unlockLevel,
    setHoveredWaveBubblePathKey,
    setWaveInProgress,
    setNextWaveTimer,
    setCurrentWave,
    setIsDevModeUnlocked,
  } = deps;

  const devLevelOptions = useMemo(
    () =>
      Object.entries(LEVEL_DATA)
        .map(([id, levelData]) => ({ id, name: levelData?.name ?? id }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const unlockAllLevels = useCallback(
    () => unlockAllLevelsImpl(setProgress),
    [setProgress]
  );
  const lockLevel = useCallback(
    (levelId: string) => lockLevelImpl(setProgress, levelId),
    [setProgress]
  );
  const setLevelStars = useCallback(
    (levelId: string, stars: number) =>
      setLevelStarsImpl(setProgress, levelId, stars),
    [setProgress]
  );
  const replaceProgress = useCallback(
    (candidate: unknown) => replaceProgressImpl(setProgress, candidate),
    [setProgress]
  );
  const grantPawPoints = useCallback(
    (amount: number) => grantPawPointsImpl(addPawPoints, amount),
    [addPawPoints]
  );
  const adjustLives = useCallback(
    (delta: number) => adjustLivesImpl(setLives, delta),
    []
  );
  const instantVictory = useCallback(
    () =>
      instantVictoryImpl({
        battleOutcome,
        clearAllTimers,
        clearEnemies,
        gameState,
        setCurrentWave,
        setHoveredWaveBubblePathKey,
        setNextWaveTimer,
        setWaveInProgress,
        totalWaves,
      }),
    [gameState, battleOutcome, clearAllTimers, clearEnemies, totalWaves]
  );
  const skipWave = useCallback(
    () =>
      skipWaveImpl({
        battleOutcome,
        clearAllTimers,
        clearEnemies,
        currentWave,
        gameState,
        setCurrentWave,
        setNextWaveTimer,
        setWaveInProgress,
        totalWaves,
      }),
    [
      gameState,
      battleOutcome,
      currentWave,
      totalWaves,
      clearAllTimers,
      clearEnemies,
    ]
  );
  const skipToWave = useCallback(
    (targetWave: number) =>
      skipToWaveImpl(
        {
          battleOutcome,
          clearAllTimers,
          clearEnemies,
          gameState,
          setCurrentWave,
          setNextWaveTimer,
          setWaveInProgress,
          totalWaves,
        },
        targetWave
      ),
    [gameState, battleOutcome, totalWaves, clearAllTimers, clearEnemies]
  );
  const killAllEnemies = useCallback(
    () =>
      killAllEnemiesImpl({
        battleOutcome,
        clearEnemies,
        enemies,
        gameState,
        onEnemyKill,
        selectedMap,
      }),
    [gameState, battleOutcome, enemies, selectedMap, onEnemyKill, clearEnemies]
  );
  const instantLose = useCallback(
    () =>
      instantLoseImpl({
        battleOutcome,
        clearAllTimers,
        gameState,
        setHoveredWaveBubblePathKey,
        setLives,
        setNextWaveTimer,
        setWaveInProgress,
      }),
    [gameState, battleOutcome, clearAllTimers]
  );

  const handleDevModeChange = useCallback(
    (enabled: boolean) => setIsDevModeUnlocked(enabled),
    []
  );

  const devConfigMenu = isDevMode ? (
    <DevConfigMenu
      gameState={gameState}
      selectedMap={selectedMap}
      levelOptions={devLevelOptions}
      progress={progress}
      devPerfEnabled={devPerfEnabled}
      setDevPerfEnabled={setDevPerfEnabled}
      devPerfSnapshot={devPerfSnapshot}
      photoModeEnabled={photoModeEnabled}
      setPhotoModeEnabled={setPhotoModeEnabled}
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
      onSkipToWave={skipToWave}
      onKillAllEnemies={killAllEnemies}
    />
  ) : null;

  return { devConfigMenu, handleDevModeChange };
}
