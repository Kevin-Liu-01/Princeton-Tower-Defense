import type { MutableRefObject, Dispatch, SetStateAction } from "react";
import type {
  Position,
  Enemy,
  Hero,
  Troop,
  Tower,
  Spell,
  SpellType,
  HeroType,
  EnemyType,
  GameState,
  HazardType,
  SpecialTowerType,
} from "../../types";
import type { PausableTimeoutEntry } from "../../game/state";
import { acquireEnemy } from "../../game/entityPool";
import type { EncounterQueueItem, UseTutorialReturn } from "../useTutorial";
import type { WaveStartConfirmState } from "./waveStartBubbles";
import type { GameEventLogAPI } from "../useGameEventLog";
import {
  HERO_DATA,
  SPELL_DATA,
  LEVEL_DATA,
  MAP_PATHS,
  INITIAL_PAW_POINTS,
  INITIAL_LIVES,
  WAVE_TIMER_BASE,
  ENEMY_DATA,
} from "../../constants";
import { gridToWorldPath, generateId } from "../../utils";
import { buildPhotoModeTowers } from "../../constants/photoModeTowers";
import { clearDamageNumbers } from "../../rendering/ui/damageNumbers";
import { clearParticlePool } from "../../rendering";
import { isMountainTerrainKind } from "../../rendering/maps/challengeTerrain";
import {
  getLevelWaves,
  getLevelSpecialTowers,
  getVaultHpMap,
} from "../../game/setup";
import {
  isSandboxLevel,
  resetSandboxWaves,
  ensureSandboxWaves,
} from "../../game/sandboxWaves";
import {
  clampLaneOffset,
  pickFormationPattern,
  getFormationLaneIndex,
  ENEMY_LANE_OFFSETS,
  ENEMY_SPAWN_LANE_JITTER,
} from "../../game/spatial";
import { getFacingRightFromDelta } from "../../game/unitMovement";

// ---------------------------------------------------------------------------
// Shared parameter interface
// ---------------------------------------------------------------------------

export interface GameLifecycleRefs {
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
  hexWardRaisesRemainingRef: MutableRefObject<number>;
  pendingParticleBurstsRef: MutableRefObject<unknown[]>;
  spawnIntervalsRef: MutableRefObject<NodeJS.Timeout[]>;
  gameSpeedRef: MutableRefObject<number>;
  handledWaveCompletionRef: MutableRefObject<number>;
  gameEventLogRef: MutableRefObject<GameEventLogAPI>;
  tutorialBlockingRef: MutableRefObject<boolean>;
}

// ---------------------------------------------------------------------------
// 1. Reset game state when entering "playing"
// ---------------------------------------------------------------------------

export interface ResetGameStateParams {
  selectedMap: string;
  refs: Pick<
    GameLifecycleRefs,
    | "prevGameSpeedRef"
    | "pausedAtRef"
    | "totalPausedTimeRef"
    | "pausableTimeoutsRef"
    | "lastBarracksSpawnRef"
    | "lastSentinelStrikeRef"
    | "lastSunforgeBarrageRef"
    | "sunforgeAimRef"
    | "missileAutoAimRef"
    | "enemiesFirstAppearedRef"
    | "gameResetTimeRef"
    | "hexWardRaisesRemainingRef"
  >;
  clearAllTimers: () => void;
  setBattleOutcome: Dispatch<SetStateAction<"victory" | "defeat" | null>>;
  resetPawPoints: (amount: number) => void;
  setLives: Dispatch<SetStateAction<number>>;
  setCurrentWave: Dispatch<SetStateAction<number>>;
  setNextWaveTimer: Dispatch<SetStateAction<number>>;
  setWaveInProgress: Dispatch<SetStateAction<boolean>>;
  setHoveredWaveBubblePathKey: Dispatch<SetStateAction<string | null>>;
  setTowers: Dispatch<SetStateAction<Tower[]>>;
  clearTowers: () => void;
  clearEnemies: () => void;
  setHero: Dispatch<SetStateAction<Hero | null>>;
  clearTroops: () => void;
  clearProjectiles: () => void;
  clearEffects: () => void;
  setSelectedTower: (v: string | null) => void;
  setBuildingTower: (v: null) => void;
  setDraggingTower: (v: null) => void;
  setPlacingTroop: (v: boolean) => void;
  setTargetingSpell: (v: SpellType | null) => void;
  setActiveSentinelTargetKey: (v: string | null) => void;
  setMissileMortarTargetingId: (v: string | null) => void;
  setSentinelTargets: Dispatch<SetStateAction<Record<string, Position>>>;
  setSpells: Dispatch<SetStateAction<Spell[]>>;
  setGameSpeed: Dispatch<SetStateAction<number>>;
  setGoldSpellActive: Dispatch<SetStateAction<boolean>>;
  setPaydayEndTime: Dispatch<SetStateAction<number | null>>;
  setPaydayPawPointsEarned: Dispatch<SetStateAction<number>>;
  setHexWardEndTime: Dispatch<SetStateAction<number | null>>;
  setHexWardTargetCount: Dispatch<SetStateAction<number>>;
  setHexWardRaiseCap: Dispatch<SetStateAction<number>>;
  setHexWardRaisesRemaining: Dispatch<SetStateAction<number>>;
  setHexWardDamageAmpPct: Dispatch<SetStateAction<number>>;
  setHexWardBlocksHealing: Dispatch<SetStateAction<boolean>>;
  setSpecialTowerHp: Dispatch<SetStateAction<Record<string, number>>>;
  photoModeEnabled?: boolean;
}

export function resetGameStateImpl(params: ResetGameStateParams): void {
  const { selectedMap, refs } = params;

  if (isSandboxLevel(selectedMap)) {
    resetSandboxWaves();
  }

  params.clearAllTimers();
  params.setBattleOutcome(null);

  const levelData = LEVEL_DATA[selectedMap];
  const levelStartingPawPoints =
    levelData?.startingPawPoints ?? INITIAL_PAW_POINTS;

  params.resetPawPoints(levelStartingPawPoints);
  params.setLives(INITIAL_LIVES);
  params.setCurrentWave(0);
  params.setNextWaveTimer(WAVE_TIMER_BASE);
  params.setWaveInProgress(false);
  params.setHoveredWaveBubblePathKey(null);

  const prePlaced = levelData?.prePlacedTowers?.() ?? [];
  if (prePlaced.length > 0) {
    params.setTowers(prePlaced);
  } else if (params.photoModeEnabled) {
    const photoTowers = buildPhotoModeTowers(selectedMap);
    if (photoTowers.length > 0) {
      params.setTowers(photoTowers);
    } else {
      params.clearTowers();
    }
  } else {
    params.clearTowers();
  }

  params.clearEnemies();
  params.setHero(null);
  params.clearTroops();
  params.clearProjectiles();
  params.clearEffects();
  clearDamageNumbers();
  clearParticlePool();
  params.setSelectedTower(null);
  params.setBuildingTower(null);
  params.setDraggingTower(null);
  params.setPlacingTroop(false);
  params.setTargetingSpell(null);
  params.setActiveSentinelTargetKey(null);
  params.setMissileMortarTargetingId(null);
  params.setSentinelTargets({});
  params.setSpells([]);
  params.setGameSpeed(1);
  params.setGoldSpellActive(false);
  params.setPaydayEndTime(null);
  params.setPaydayPawPointsEarned(0);
  params.setHexWardEndTime(null);
  params.setHexWardTargetCount(0);
  params.setHexWardRaiseCap(0);
  params.setHexWardRaisesRemaining(0);
  params.setHexWardDamageAmpPct(0);
  params.setHexWardBlocksHealing(false);
  refs.hexWardRaisesRemainingRef.current = 0;
  params.setSpecialTowerHp(getVaultHpMap(selectedMap));

  refs.prevGameSpeedRef.current = 1;
  refs.pausedAtRef.current = null;
  refs.totalPausedTimeRef.current = 0;
  refs.pausableTimeoutsRef.current = [];
  refs.lastBarracksSpawnRef.current = new Map();
  refs.lastSentinelStrikeRef.current.clear();
  refs.lastSunforgeBarrageRef.current.clear();
  refs.sunforgeAimRef.current.clear();
  refs.missileAutoAimRef.current.clear();
  refs.enemiesFirstAppearedRef.current = 0;
  refs.gameResetTimeRef.current = Date.now();
}

// ---------------------------------------------------------------------------
// 2. Tutorial & encounter check when entering playing state
// ---------------------------------------------------------------------------

export interface InitTutorialParams {
  selectedMap: string;
  tutorial: Pick<UseTutorialReturn, "hasCompletedTutorial" | "getLevelEncounters">;
  setShowTutorial: Dispatch<SetStateAction<boolean>>;
  setEncounterExiting: Dispatch<SetStateAction<boolean>>;
  setEncounterQueue: Dispatch<SetStateAction<EncounterQueueItem[]>>;
  setEncounterIndex: Dispatch<SetStateAction<number>>;
}

export function initTutorialEncountersImpl(params: InitTutorialParams): void {
  const { selectedMap, tutorial } = params;

  if (!tutorial.hasCompletedTutorial) {
    params.setShowTutorial(true);
    return;
  }

  const levelData = LEVEL_DATA[selectedMap];
  const specialTowerTypes = (getLevelSpecialTowers(selectedMap) ?? []).map(
    (t) => t.type
  );
  const hazardTypes = (levelData?.hazards ?? []).map(
    (h) => h.type
  );
  const levelEncounters = tutorial.getLevelEncounters(specialTowerTypes, hazardTypes);

  if (levelEncounters.length > 0) {
    params.setEncounterExiting(false);
    params.setEncounterQueue(levelEncounters);
    params.setEncounterIndex(0);
  }
}

// ---------------------------------------------------------------------------
// 3. Cleanup when leaving playing state
// ---------------------------------------------------------------------------

export interface CleanupOnLeavePlayingParams {
  refs: Pick<GameLifecycleRefs, "pendingParticleBurstsRef">;
  clearAllTimers: () => void;
  setHoveredWaveBubblePathKey: Dispatch<SetStateAction<string | null>>;
  setShowTutorial: Dispatch<SetStateAction<boolean>>;
  setEncounterExiting: Dispatch<SetStateAction<boolean>>;
  setEncounterQueue: Dispatch<SetStateAction<EncounterQueueItem[]>>;
  setEncounterIndex: Dispatch<SetStateAction<number>>;
}

export function cleanupOnLeavePlayingImpl(
  params: CleanupOnLeavePlayingParams
): void {
  params.clearAllTimers();
  params.refs.pendingParticleBurstsRef.current = [];
  clearParticlePool();
  params.setHoveredWaveBubblePathKey(null);
  params.setShowTutorial(false);
  params.setEncounterExiting(false);
  params.setEncounterQueue([]);
  params.setEncounterIndex(0);
}

// ---------------------------------------------------------------------------
// 4. Wave start confirm state management
// ---------------------------------------------------------------------------

export function validateWaveStartConfirmImpl(
  prev: WaveStartConfirmState | null,
  gameState: GameState,
  waveInProgress: boolean,
  selectedMap: string,
  currentWave: number,
  activeWaveSpawnPaths: string[]
): WaveStartConfirmState | null {
  if (!prev) return prev;
  if (gameState !== "playing" || waveInProgress) return null;
  if (prev.mapId !== selectedMap) return null;
  if (prev.waveIndex !== currentWave) return null;
  if (!activeWaveSpawnPaths.includes(prev.pathKey)) return null;
  return prev;
}

// ---------------------------------------------------------------------------
// 5. Wave hover cleanup
// ---------------------------------------------------------------------------

export function shouldClearWaveHover(
  hoveredWaveBubblePathKey: string | null,
  gameState: GameState,
  waveInProgress: boolean,
  gameSpeed: number,
  currentWave: number,
  totalWaves: number,
  nextWaveTimer: number,
  activeWaveSpawnPaths: string[]
): boolean {
  if (!hoveredWaveBubblePathKey) return false;
  if (gameState !== "playing" || waveInProgress || gameSpeed <= 0) return true;
  if (currentWave >= totalWaves || nextWaveTimer <= 0) return true;
  if (!activeWaveSpawnPaths.includes(hoveredWaveBubblePathKey)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// 6. Hero initialization / respawn
// ---------------------------------------------------------------------------

export interface InitHeroParams {
  selectedHero: HeroType;
  selectedMap: string;
  selectedSpells: SpellType[];
  activeWaveSpawnPaths: string[];
  refs: Pick<GameLifecycleRefs, "gameEventLogRef">;
  setHero: Dispatch<SetStateAction<Hero | null>>;
  setSpells: Dispatch<SetStateAction<Spell[]>>;
  setNextWaveTimer: Dispatch<SetStateAction<number>>;
  setLevelStartTime: Dispatch<SetStateAction<number>>;
  setTimeSpent: Dispatch<SetStateAction<number>>;
  setCameraOffset: Dispatch<SetStateAction<Position>>;
  setCameraZoom: Dispatch<SetStateAction<number>>;
}

export function initHeroAndSpellsImpl(params: InitHeroParams): void {
  const { selectedHero, selectedMap, selectedSpells, activeWaveSpawnPaths, refs } = params;

  const heroData = HERO_DATA[selectedHero];
  const levelSettings = LEVEL_DATA[selectedMap];
  const defaultPathKey = activeWaveSpawnPaths[0] ?? selectedMap;
  const path = MAP_PATHS[defaultPathKey] ?? MAP_PATHS.poe ?? [];
  if (path.length === 0) return;

  const defaultRespawnNode =
    path[Math.max(0, path.length - 4)] ?? path[path.length - 1];
  const heroSpawnNode = levelSettings?.heroSpawn ?? defaultRespawnNode;
  if (!heroSpawnNode) return;

  const startPos = gridToWorldPath(heroSpawnNode);
  params.setHero({
    id: "hero",
    type: selectedHero,
    pos: startPos,
    homePos: startPos,
    hp: heroData.hp,
    maxHp: heroData.hp,
    moving: false,
    lastAttack: 0,
    abilityReady: true,
    abilityCooldown: 0,
    revived: false,
    rotation: Math.PI,
    facingRight: false,
    attackAnim: 0,
    selected: false,
    dead: false,
    respawnTimer: 0,
  });

  params.setSpells(
    selectedSpells.map((type) => ({
      type,
      cooldown: 0,
      maxCooldown: SPELL_DATA[type]?.cooldown ?? 0,
    }))
  );
  params.setNextWaveTimer(WAVE_TIMER_BASE);
  params.setLevelStartTime(Date.now());
  params.setTimeSpent(0);
  refs.gameEventLogRef.current.clear();
  refs.gameEventLogRef.current.log("game_start", `Started level ${selectedMap}`, {
    map: selectedMap,
  });

  if (levelSettings?.camera) {
    params.setCameraOffset(levelSettings.camera.offset);
    const targetZoom = isMountainTerrainKind(levelSettings.levelKind)
      ? Math.min(levelSettings.camera.zoom, 0.72)
      : levelSettings.camera.zoom;
    params.setCameraZoom(targetZoom);
  }
}

// ---------------------------------------------------------------------------
// 7. Pause/resume status effects on gameSpeed change
// ---------------------------------------------------------------------------

export interface GameSpeedChangeParams {
  gameSpeed: number;
  refs: Pick<GameLifecycleRefs, "pausedAtRef" | "totalPausedTimeRef">;
  pauseAllTimeouts: () => void;
  resumeAllTimeouts: () => void;
  setTroops: Dispatch<SetStateAction<Troop[]>>;
  setHero: Dispatch<SetStateAction<Hero | null>>;
  setEnemies: Dispatch<SetStateAction<Enemy[]>>;
  setTowers: Dispatch<SetStateAction<Tower[]>>;
  setHexWardEndTime: Dispatch<SetStateAction<number | null>>;
}

export function extendStatusEffectsAfterResume(
  params: GameSpeedChangeParams
): void {
  const pauseDuration = params.refs.pausedAtRef.current
    ? Date.now() - params.refs.pausedAtRef.current
    : 0;
  if (pauseDuration <= 0) return;

  params.refs.totalPausedTimeRef.current += pauseDuration;

  params.setTroops((prev) =>
    prev.map((troop) => {
      const updates: Partial<typeof troop> = {};
      if (troop.burnUntil) updates.burnUntil = troop.burnUntil + pauseDuration;
      if (troop.slowUntil) updates.slowUntil = troop.slowUntil + pauseDuration;
      if (troop.poisonUntil)
        updates.poisonUntil = troop.poisonUntil + pauseDuration;
      if (troop.stunUntil) updates.stunUntil = troop.stunUntil + pauseDuration;
      return Object.keys(updates).length > 0
        ? { ...troop, ...updates }
        : troop;
    })
  );

  params.setHero((prev) => {
    if (!prev) return prev;
    const updates: Partial<typeof prev> = {};
    if (prev.burnUntil) updates.burnUntil = prev.burnUntil + pauseDuration;
    if (prev.slowUntil) updates.slowUntil = prev.slowUntil + pauseDuration;
    if (prev.poisonUntil)
      updates.poisonUntil = prev.poisonUntil + pauseDuration;
    if (prev.stunUntil) updates.stunUntil = prev.stunUntil + pauseDuration;
    return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
  });

  params.setEnemies((prev) =>
    prev.map((enemy) => {
      const updates: Partial<typeof enemy> = {};
      if (enemy.burnUntil) updates.burnUntil = enemy.burnUntil + pauseDuration;
      if (enemy.stunUntil) updates.stunUntil = enemy.stunUntil + pauseDuration;
      if (enemy.hexWardUntil)
        updates.hexWardUntil = enemy.hexWardUntil + pauseDuration;
      return Object.keys(updates).length > 0
        ? { ...enemy, ...updates }
        : enemy;
    })
  );

  params.setHexWardEndTime((prev) => (prev ? prev + pauseDuration : prev));

  params.setTowers((prev) =>
    prev.map((tower) => {
      const updates: Partial<typeof tower> = {};
      if (tower.disabledUntil)
        updates.disabledUntil = tower.disabledUntil + pauseDuration;
      if (tower.boostEnd) updates.boostEnd = tower.boostEnd + pauseDuration;
      if (tower.debuffs && tower.debuffs.length > 0) {
        updates.debuffs = tower.debuffs.map((d) => ({
          ...d,
          until: d.until + pauseDuration,
        }));
      }
      return Object.keys(updates).length > 0
        ? { ...tower, ...updates }
        : tower;
    })
  );
}

// ---------------------------------------------------------------------------
// 8. Tutorial spell sync
// ---------------------------------------------------------------------------

export function buildSpellsFromSelection(selectedSpells: SpellType[]): Spell[] {
  return selectedSpells.map((type) => ({
    type,
    cooldown: 0,
    maxCooldown: SPELL_DATA[type]?.cooldown ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// 9. Start wave (inner)
// ---------------------------------------------------------------------------

export interface StartWaveInnerParams {
  selectedMap: string;
  waveInProgress: boolean;
  currentWave: number;
  activeWaveSpawnPaths: string[];
  refs: Pick<
    GameLifecycleRefs,
    "gameSpeedRef" | "spawnIntervalsRef" | "handledWaveCompletionRef" | "gameEventLogRef"
  >;
  setWaveInProgress: Dispatch<SetStateAction<boolean>>;
  setCurrentWave: Dispatch<SetStateAction<number>>;
  setNextWaveTimer: Dispatch<SetStateAction<number>>;
  addEnemyEntity: (enemy: Enemy) => void;
  setPausableTimeout: (callback: () => void, delay: number) => number;
}

export function startWaveInnerImpl(params: StartWaveInnerParams): void {
  const {
    selectedMap,
    waveInProgress,
    currentWave,
    activeWaveSpawnPaths,
    refs,
  } = params;

  if (isSandboxLevel(selectedMap)) {
    ensureSandboxWaves(currentWave);
  }

  const levelWaves = getLevelWaves(selectedMap);

  if (waveInProgress) {
    console.log("[Wave] Blocked: wave already in progress");
    return;
  }
  if (!isSandboxLevel(selectedMap) && currentWave >= levelWaves.length) {
    console.log("[Wave] Blocked: all waves completed");
    return;
  }

  console.log(
    `[Wave] Starting wave ${currentWave + 1} of ${levelWaves.length}`
  );
  refs.gameEventLogRef.current.log(
    "wave_started",
    `Wave ${currentWave + 1} of ${levelWaves.length} started`,
    { wave: currentWave + 1, totalWaves: levelWaves.length }
  );
  params.setWaveInProgress(true);

  const wave = levelWaves[currentWave];
  if (!wave) {
    params.setWaveInProgress(false);
    return;
  }

  let cumulativeDelay = 0;
  wave.forEach((group) => {
    cumulativeDelay += group.delay || 0;
    const startDelay = cumulativeDelay;

    const startSpawning = () => {
      let spawned = 0;
      const spawnInterval = setInterval(() => {
        if (refs.gameSpeedRef.current === 0) return;
        if (spawned >= group.count) {
          clearInterval(spawnInterval);
          return;
        }
        const formationPattern = pickFormationPattern(
          group.type,
          group.count
        );
        const mirrorFormation =
          (group.type.charCodeAt(0) + group.count) % 2 === 0;
        const spawnLaneIndex = getFormationLaneIndex(
          formationPattern,
          spawned,
          group.count,
          mirrorFormation
        );
        const baseLaneOffset = ENEMY_LANE_OFFSETS[spawnLaneIndex] ?? 0;
        const laneOffset = clampLaneOffset(
          baseLaneOffset + (Math.random() - 0.5) * ENEMY_SPAWN_LANE_JITTER
        );

        const spawnPathCount = Math.max(1, activeWaveSpawnPaths.length);
        const pathKey =
          activeWaveSpawnPaths[spawned % spawnPathCount] ?? selectedMap;

        const spawnPath = MAP_PATHS[pathKey];
        const initialFacing =
          spawnPath && spawnPath.length >= 2
            ? getFacingRightFromDelta(
                spawnPath[1].x - spawnPath[0].x,
                spawnPath[1].y - spawnPath[0].y,
              )
            : false;

        const enemy = acquireEnemy({
          id: generateId("enemy"),
          type: group.type,
          pathIndex: 0,
          progress: 0,
          hp: ENEMY_DATA[group.type].hp,
          maxHp: ENEMY_DATA[group.type].hp,
          speed: ENEMY_DATA[group.type].speed,
          slowEffect: 0,
          stunUntil: 0,
          frozen: false,
          damageFlash: 0,
          inCombat: false,
          lastTroopAttack: 0,
          lastHeroAttack: 0,
          lastRangedAttack: 0,
          spawnProgress: 1,
          laneOffset,
          formationLane: spawnLaneIndex,
          slowed: false,
          slowIntensity: 0,
          pathKey,
          facingRight: initialFacing,
        });
        params.addEnemyEntity(enemy);
        spawned++;
      }, group.interval);
      refs.spawnIntervalsRef.current.push(spawnInterval);
    };

    if (startDelay > 0) {
      params.setPausableTimeout(startSpawning, startDelay);
    } else {
      startSpawning();
    }
  });

  let accDelay = 0;
  const waveDuration =
    Math.max(
      ...wave.map((g) => {
        accDelay += g.delay || 0;
        return accDelay + g.count * g.interval;
      })
    ) + 3000;
  const waveNumberForTimeout = currentWave;
  console.log(
    `[Wave] Wave ${currentWave + 1} started, will complete in ${waveDuration}ms`
  );

  params.setPausableTimeout(() => {
    params.setCurrentWave((currentW) => {
      if (currentW !== waveNumberForTimeout) {
        console.log(
          `[Wave] Timeout for wave ${waveNumberForTimeout + 1} ignored - current wave is ${currentW + 1}`
        );
        return currentW;
      }

      console.log(
        `[Wave] Wave ${currentW + 1} completed, advancing to wave ${currentW + 2}`
      );
      if (refs.handledWaveCompletionRef.current !== currentW) {
        refs.handledWaveCompletionRef.current = currentW;
        refs.gameEventLogRef.current.log(
          "wave_completed",
          `Wave ${currentW + 1} completed`,
          { wave: currentW + 1 }
        );
      }

      params.setWaveInProgress(false);
      params.setNextWaveTimer(WAVE_TIMER_BASE);

      return currentW + 1;
    });
  }, waveDuration);
}

// ---------------------------------------------------------------------------
// 10. Start wave wrapper (encounter check)
// ---------------------------------------------------------------------------

export interface StartWaveParams {
  selectedMap: string;
  waveInProgress: boolean;
  currentWave: number;
  refs: Pick<GameLifecycleRefs, "tutorialBlockingRef">;
  tutorial: Pick<UseTutorialReturn, "getUnseenEnemyEncounters" | "markEnemiesSeen">;
  startWaveInner: () => void;
  setEncounterExiting: Dispatch<SetStateAction<boolean>>;
  setEncounterQueue: Dispatch<SetStateAction<EncounterQueueItem[]>>;
  setEncounterIndex: Dispatch<SetStateAction<number>>;
}

export function startWaveImpl(params: StartWaveParams): void {
  const { selectedMap, waveInProgress, currentWave, refs, tutorial } = params;

  if (refs.tutorialBlockingRef.current) return;

  if (isSandboxLevel(selectedMap)) {
    ensureSandboxWaves(currentWave);
  }

  const levelWaves = getLevelWaves(selectedMap);
  if (waveInProgress || (!isSandboxLevel(selectedMap) && currentWave >= levelWaves.length)) {
    params.startWaveInner();
    return;
  }

  const wave = levelWaves[currentWave];
  if (!wave) {
    params.startWaveInner();
    return;
  }

  const waveEnemyTypes = Array.from(new Set(wave.map((g) => g.type)));
  const unseenEncounters = tutorial.getUnseenEnemyEncounters(waveEnemyTypes);

  if (unseenEncounters.length > 0) {
    tutorial.markEnemiesSeen(waveEnemyTypes);
    params.setEncounterExiting(false);
    params.setEncounterQueue(unseenEncounters);
    params.setEncounterIndex(0);
  }

  tutorial.markEnemiesSeen(waveEnemyTypes);
  params.startWaveInner();
}

// ---------------------------------------------------------------------------
// 11. Spell upgrade sync (reinforcement stats -> live troops)
// ---------------------------------------------------------------------------

export { getReinforcementSpellStats } from "../../constants";
