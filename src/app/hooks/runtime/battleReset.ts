import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { INITIAL_PAW_POINTS } from "../../constants";
import { getVaultHpMap, getLevelStartingPawPoints } from "../../game/setup";
import type { PausableTimeoutEntry } from "../../game/state";
import { resetBattleState } from "../../game/state";
import { clearParticlePool } from "../../rendering";
import type {
  Position,
  Tower,
  Enemy,
  Hero,
  Troop,
  Projectile,
  Effect,
  Spell,
  SpellType,
  TowerType,
  DraggingTower,
  GameState,
  SpecialTower,
} from "../../types";

type Setter<T> = Dispatch<SetStateAction<T>>;

export interface BattleResetDeps {
  clearAllTimers: () => void;
  setPawPoints: Setter<number>;
  setEffects: Setter<Effect[]>;
  setEnemies: Setter<Enemy[]>;
  setProjectiles: Setter<Projectile[]>;
  setBattleOutcome: Setter<"victory" | "defeat" | null>;
  setTowers: Setter<Tower[]>;
  setTroops: Setter<Troop[]>;
  setGameState: Setter<GameState>;
  setLives: Setter<number>;
  setCurrentWave: Setter<number>;
  setNextWaveTimer: Setter<number>;
  setHero: Setter<Hero | null>;
  setSelectedTower: Setter<string | null>;
  setBuildingTower: Setter<TowerType | null>;
  setDraggingTower: Setter<DraggingTower | null>;
  setIsPanning: Setter<boolean>;
  setPanStart: Setter<Position | null>;
  setPanStartOffset: Setter<Position | null>;
  setRepositioningTower: Setter<string | null>;
  setRepositionPreviewPos: Setter<Position | null>;
  setWaveInProgress: Setter<boolean>;
  setPlacingTroop: Setter<boolean>;
  setTargetingSpell: Setter<SpellType | null>;
  setSpells: Setter<Spell[]>;
  setGameSpeed: Setter<number>;
  setGoldSpellActive: Setter<boolean>;
  setInspectorActive: Setter<boolean>;
  setSelectedInspectEnemy: Setter<Enemy | null>;
  setPreviousGameSpeed: Setter<number>;
  setSpecialTowerHp: Setter<Record<string, number>>;
  setLevelStartTime: Setter<number>;
  setCameraOffset: Setter<Position>;
  setCameraZoom: Setter<number>;
  setStarsEarned: Setter<number>;
  setTimeSpent: Setter<number>;
  setActiveSentinelTargetKey: Setter<string | null>;
  setSentinelTargets: Setter<Record<string, Position>>;
  gameEndHandledRef: MutableRefObject<boolean>;
  prevGameSpeedRef: MutableRefObject<number>;
  pausedAtRef: MutableRefObject<number | null>;
  totalPausedTimeRef: MutableRefObject<number>;
  pausableTimeoutsRef: MutableRefObject<PausableTimeoutEntry[]>;
  lastBarracksSpawnRef: MutableRefObject<Map<string, number>>;
  lastSentinelStrikeRef: MutableRefObject<Map<string, number>>;
  lastSunforgeBarrageRef: MutableRefObject<Map<string, number>>;
  sunforgeAimRef: MutableRefObject<Map<string, Position>>;
  missileAutoAimRef: MutableRefObject<Map<string, Position>>;
  enemiesFirstAppearedRef: MutableRefObject<number>;
  gameResetTimeRef: MutableRefObject<number>;
}

export function performBattleResetImpl(
  deps: BattleResetDeps,
  options: {
    targetGameState: GameState;
    startingPawPoints: number;
    levelStartTimeValue: number;
    resetCamera: boolean;
    resetResultStats: boolean;
    specialTowerHpValue: Record<string, number>;
  }
): void {
  resetBattleState({
    clearAllTimers: deps.clearAllTimers,
    options: {
      levelStartTime: options.levelStartTimeValue,
      resetCamera: options.resetCamera,
      resetResultStats: options.resetResultStats,
      specialTowerHp: options.specialTowerHpValue,
      startingPawPoints: options.startingPawPoints,
      targetGameState: options.targetGameState,
    },
    refs: {
      gameEndHandledRef: deps.gameEndHandledRef,
      gameResetTimeRef: deps.gameResetTimeRef,
      lastBarracksSpawnRef: deps.lastBarracksSpawnRef,
      pausableTimeoutsRef: deps.pausableTimeoutsRef,
      pausedAtRef: deps.pausedAtRef,
      prevGameSpeedRef: deps.prevGameSpeedRef,
      totalPausedTimeRef: deps.totalPausedTimeRef,
    },
    setters: {
      clearParticlePool,
      setBuildingTower: deps.setBuildingTower,
      setCameraOffset: deps.setCameraOffset,
      setCameraZoom: deps.setCameraZoom,
      setCurrentWave: deps.setCurrentWave,
      setDraggingTower: deps.setDraggingTower,
      setEffects: deps.setEffects,
      setEnemies: deps.setEnemies,
      setGameSpeed: deps.setGameSpeed,
      setGameState: deps.setGameState,
      setGoldSpellActive: deps.setGoldSpellActive,
      setHero: deps.setHero,
      setInspectorActive: deps.setInspectorActive,
      setIsPanning: deps.setIsPanning,
      setLevelStartTime: deps.setLevelStartTime,
      setLives: deps.setLives,
      setNextWaveTimer: deps.setNextWaveTimer,
      setPanStart: deps.setPanStart,
      setPanStartOffset: deps.setPanStartOffset,
      setPawPoints: deps.setPawPoints,
      setPlacingTroop: deps.setPlacingTroop,
      setPreviousGameSpeed: deps.setPreviousGameSpeed,
      setProjectiles: deps.setProjectiles,
      setRepositionPreviewPos: deps.setRepositionPreviewPos,
      setRepositioningTower: deps.setRepositioningTower,
      setSelectedInspectEnemy: deps.setSelectedInspectEnemy,
      setSelectedTower: deps.setSelectedTower,
      setSpecialTowerHp: deps.setSpecialTowerHp,
      setSpells: deps.setSpells,
      setStarsEarned: deps.setStarsEarned,
      setTargetingSpell: deps.setTargetingSpell,
      setTimeSpent: deps.setTimeSpent,
      setTowers: deps.setTowers,
      setTroops: deps.setTroops,
      setWaveInProgress: deps.setWaveInProgress,
    },
  });
  deps.setBattleOutcome(null);
  deps.setActiveSentinelTargetKey(null);
  deps.setSentinelTargets({});
  deps.lastSentinelStrikeRef.current.clear();
  deps.lastSunforgeBarrageRef.current.clear();
  deps.sunforgeAimRef.current.clear();
  deps.missileAutoAimRef.current.clear();
  deps.enemiesFirstAppearedRef.current = 0;
}

export function resetGameImpl(
  deps: BattleResetDeps,
  selectedMap: string
): void {
  performBattleResetImpl(deps, {
    levelStartTimeValue: 0,
    resetCamera: true,
    resetResultStats: true,
    specialTowerHpValue: getVaultHpMap(selectedMap),
    startingPawPoints: INITIAL_PAW_POINTS,
    targetGameState: "menu",
  });
}

export function retryLevelImpl(
  deps: BattleResetDeps,
  selectedMap: string
): void {
  performBattleResetImpl(deps, {
    levelStartTimeValue: Date.now(),
    resetCamera: false,
    resetResultStats: false,
    specialTowerHpValue: getVaultHpMap(selectedMap),
    startingPawPoints: getLevelStartingPawPoints(selectedMap),
    targetGameState: "playing",
  });
}
