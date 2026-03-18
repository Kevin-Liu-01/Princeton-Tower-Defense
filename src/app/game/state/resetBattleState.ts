import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type {
  DraggingTower,
  Effect,
  Enemy,
  GameState,
  Hero,
  Position,
  Projectile,
  Spell,
  SpellType,
  Tower,
  TowerType,
  Troop,
} from "../../types";
import { INITIAL_LIVES, WAVE_TIMER_BASE } from "../../constants";
import { DEFAULT_CAMERA_OFFSET, DEFAULT_CAMERA_ZOOM } from "../setup";
import { getGameSettings } from "../../hooks/useSettings";

export type PausableTimeoutEntry = {
  id: number;
  callback: () => void;
  remainingTime: number;
  startedAt: number;
  timeoutId: NodeJS.Timeout | null;
};

type Setter<T> = Dispatch<SetStateAction<T>>;

interface BattleStateSetters {
  setGameState: Setter<GameState>;
  setPawPoints: Setter<number>;
  setLives: Setter<number>;
  setCurrentWave: Setter<number>;
  setNextWaveTimer: Setter<number>;
  setTowers: Setter<Tower[]>;
  setEnemies: Setter<Enemy[]>;
  setHero: Setter<Hero | null>;
  setTroops: Setter<Troop[]>;
  setProjectiles: Setter<Projectile[]>;
  setEffects: Setter<Effect[]>;
  clearParticlePool: () => void;
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
}

interface BattleStateRefs {
  gameEndHandledRef: MutableRefObject<boolean>;
  prevGameSpeedRef: MutableRefObject<number>;
  pausedAtRef: MutableRefObject<number | null>;
  totalPausedTimeRef: MutableRefObject<number>;
  pausableTimeoutsRef: MutableRefObject<PausableTimeoutEntry[]>;
  lastBarracksSpawnRef: MutableRefObject<Map<string, number>>;
  gameResetTimeRef: MutableRefObject<number>;
}

interface ResetBattleStateOptions {
  startingPawPoints: number;
  targetGameState: GameState;
  levelStartTime: number;
  specialTowerHp: Record<string, number>;
  resetCamera: boolean;
  resetResultStats: boolean;
}

interface ResetBattleStateParams {
  clearAllTimers: () => void;
  setters: BattleStateSetters;
  refs: BattleStateRefs;
  options: ResetBattleStateOptions;
}

export function resetBattleState({
  clearAllTimers,
  setters,
  refs,
  options,
}: ResetBattleStateParams): void {
  clearAllTimers();

  refs.gameEndHandledRef.current = false;
  refs.prevGameSpeedRef.current = 1;
  refs.pausedAtRef.current = null;
  refs.totalPausedTimeRef.current = 0;
  refs.pausableTimeoutsRef.current = [];
  refs.lastBarracksSpawnRef.current = new Map();
  refs.gameResetTimeRef.current = Date.now();

  setters.setGameState(options.targetGameState);
  setters.setPawPoints(options.startingPawPoints);
  setters.setLives(INITIAL_LIVES);
  setters.setCurrentWave(0);
  setters.setNextWaveTimer(WAVE_TIMER_BASE);

  setters.setTowers([]);
  setters.setEnemies([]);
  setters.setHero(null);
  setters.setTroops([]);
  setters.setProjectiles([]);
  setters.setEffects([]);
  setters.clearParticlePool();

  setters.setSelectedTower(null);
  setters.setBuildingTower(null);
  setters.setDraggingTower(null);
  setters.setIsPanning(false);
  setters.setPanStart(null);
  setters.setPanStartOffset(null);
  setters.setRepositioningTower(null);
  setters.setRepositionPreviewPos(null);
  setters.setWaveInProgress(false);
  setters.setPlacingTroop(false);
  setters.setTargetingSpell(null);
  setters.setSpells([]);

  setters.setGameSpeed(1);
  setters.setGoldSpellActive(false);
  setters.setInspectorActive(false);
  setters.setSelectedInspectEnemy(null);
  setters.setPreviousGameSpeed(1);

  setters.setSpecialTowerHp(options.specialTowerHp);
  setters.setLevelStartTime(options.levelStartTime);

  if (options.resetCamera) {
    setters.setCameraOffset(DEFAULT_CAMERA_OFFSET);
    const userZoom = getGameSettings().camera.defaultZoom;
    setters.setCameraZoom(
      userZoom > 0 ? userZoom * DEFAULT_CAMERA_ZOOM : DEFAULT_CAMERA_ZOOM,
    );
  }

  if (options.resetResultStats) {
    setters.setStarsEarned(0);
    setters.setTimeSpent(0);
  }

  clearAllTimers();
}
