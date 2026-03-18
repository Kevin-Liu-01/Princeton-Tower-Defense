import type { Dispatch, MutableRefObject, SetStateAction } from "react";
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
import type { PausableTimeoutEntry } from "../../game/state";
import { resetBattleState } from "../../game/state";
import { clearParticlePool } from "../../rendering";
import { getVaultHpMap, getLevelStartingPawPoints } from "../../game/setup";
import { INITIAL_PAW_POINTS } from "../../constants";

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
  },
): void {
  resetBattleState({
    clearAllTimers: deps.clearAllTimers,
    setters: {
      setGameState: deps.setGameState,
      setPawPoints: deps.setPawPoints,
      setLives: deps.setLives,
      setCurrentWave: deps.setCurrentWave,
      setNextWaveTimer: deps.setNextWaveTimer,
      setTowers: deps.setTowers,
      setEnemies: deps.setEnemies,
      setHero: deps.setHero,
      setTroops: deps.setTroops,
      setProjectiles: deps.setProjectiles,
      setEffects: deps.setEffects,
      clearParticlePool,
      setSelectedTower: deps.setSelectedTower,
      setBuildingTower: deps.setBuildingTower,
      setDraggingTower: deps.setDraggingTower,
      setIsPanning: deps.setIsPanning,
      setPanStart: deps.setPanStart,
      setPanStartOffset: deps.setPanStartOffset,
      setRepositioningTower: deps.setRepositioningTower,
      setRepositionPreviewPos: deps.setRepositionPreviewPos,
      setWaveInProgress: deps.setWaveInProgress,
      setPlacingTroop: deps.setPlacingTroop,
      setTargetingSpell: deps.setTargetingSpell,
      setSpells: deps.setSpells,
      setGameSpeed: deps.setGameSpeed,
      setGoldSpellActive: deps.setGoldSpellActive,
      setInspectorActive: deps.setInspectorActive,
      setSelectedInspectEnemy: deps.setSelectedInspectEnemy,
      setPreviousGameSpeed: deps.setPreviousGameSpeed,
      setSpecialTowerHp: deps.setSpecialTowerHp,
      setLevelStartTime: deps.setLevelStartTime,
      setCameraOffset: deps.setCameraOffset,
      setCameraZoom: deps.setCameraZoom,
      setStarsEarned: deps.setStarsEarned,
      setTimeSpent: deps.setTimeSpent,
    },
    refs: {
      gameEndHandledRef: deps.gameEndHandledRef,
      prevGameSpeedRef: deps.prevGameSpeedRef,
      pausedAtRef: deps.pausedAtRef,
      totalPausedTimeRef: deps.totalPausedTimeRef,
      pausableTimeoutsRef: deps.pausableTimeoutsRef,
      lastBarracksSpawnRef: deps.lastBarracksSpawnRef,
      gameResetTimeRef: deps.gameResetTimeRef,
    },
    options: {
      targetGameState: options.targetGameState,
      startingPawPoints: options.startingPawPoints,
      levelStartTime: options.levelStartTimeValue,
      resetCamera: options.resetCamera,
      resetResultStats: options.resetResultStats,
      specialTowerHp: options.specialTowerHpValue,
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

export function resetGameImpl(deps: BattleResetDeps, selectedMap: string): void {
  performBattleResetImpl(deps, {
    targetGameState: "menu",
    startingPawPoints: INITIAL_PAW_POINTS,
    levelStartTimeValue: 0,
    resetCamera: true,
    resetResultStats: true,
    specialTowerHpValue: getVaultHpMap(selectedMap),
  });
}

export function retryLevelImpl(deps: BattleResetDeps, selectedMap: string): void {
  performBattleResetImpl(deps, {
    targetGameState: "playing",
    startingPawPoints: getLevelStartingPawPoints(selectedMap),
    levelStartTimeValue: Date.now(),
    resetCamera: false,
    resetResultStats: false,
    specialTowerHpValue: getVaultHpMap(selectedMap),
  });
}
