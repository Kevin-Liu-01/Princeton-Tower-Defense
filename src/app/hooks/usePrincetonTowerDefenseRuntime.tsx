"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// Types
import type {
  Position,
  Tower,
  Enemy,
  Hero,
  Troop,
  Spell,
  Projectile,
  Effect,
  Particle,
  TowerType,
  HeroType,
  SpellType,
  GameState,
  LevelStars,
  DraggingTower,
  Decoration,
  SpecialTower,
} from "../types";
// Constants
import {
  LEVEL_DATA,
  HERO_OPTIONS,
  SPELL_OPTIONS,
  HERO_AUTO_ABILITY_HP_THRESHOLD,
  normalizeSpellUpgradeLevels,
  getSpentSpellUpgradeStars,
  getLevelPathKeys,
  INITIAL_PAW_POINTS,
  INITIAL_LIVES,
  WAVE_TIMER_BASE,
} from "../constants";
import {
  STORAGE_KEY_SELECTED_HERO,
  STORAGE_KEY_SELECTED_SPELLS,
  STORAGE_KEY_SPELL_AUTOAIM,
} from "../constants/storage";
// Utils
import {
  type TroopMoveInfo,
} from "../utils";
import {
  type RuntimeDecoration,
} from "../rendering/decorations/decorationHelpers";
import {
  initParticlePool,
  getActiveParticleCount,
} from "../rendering";
import {
  getWaveStartBubblesScreenData as computeWaveStartBubbles,
} from "../rendering/ui/waveStartBubble";
import {
  DEFAULT_CAMERA_OFFSET,
  DEFAULT_CAMERA_ZOOM,
  getBlockedPositionsForMap,
  getLevelWaves,
} from "../game/setup";
import { updateGameTick } from "./runtime/updateGame";
import { useTimerSystem } from "./runtime/useTimerSystem";
// Components
import { WorldMap } from "../components/menus/WorldMap";
// Hooks
import {
  useGameProgress,
  useLocalStorage,
} from "./useLocalStorage";
import { useCustomLevels } from "./useCustomLevels";
import { useEntityCollection } from "./useEntityCollection";
import { usePawPoints } from "./usePawPoints";
import { useGameEventLog } from "./useGameEventLog";
import { useTutorial, type EncounterQueueItem } from "./useTutorial";
import {
  DEV_CONFIG_MENU_ENABLED,
  QUALITY_DPR_CAP,
  QUALITY_TRANSITION_COOLDOWN_MS,
  readDevModeUnlocked,
  type RenderQuality,
} from "./runtime/runtimeConfig";
import {
  renderScene,
  type StaticMapLayerCache,
  type StaticDecorationLayerCache,
  type FogLayerCache,
  type BackdropCache,
  type AmbientLayerCache,
  type DraggingUnitState,
  type WavePreviewEnemyEntry,
} from "./runtime/renderScene";
import {
  handlePointerDownImpl,
  handleCanvasClickImpl,
  handleMouseMoveImpl,
  type CanvasEventParams,
} from "./runtime/canvasEventHandlers";
import {
  type WaveStartConfirmState,
} from "./runtime/waveStartBubbles";
import {
  castSpellImpl,
  executeTargetedSpellImpl,
  type SpellExecutionParams,
} from "./runtime/spellExecution";
import { triggerHeroAbilityImpl } from "./runtime/heroAbilities";
import {
  startGameLoop,
  type GameLoopRefs,
  type DevPerfSnapshot,
} from "./runtime/gameLoop";
import {
  resolveHeroCommandTargetImpl,
  resolveTroopCommandTargetImpl,
  issueHeroMoveCommandImpl,
  issueTroopFormationMoveCommandImpl,
} from "./runtime/unitCommandHelpers";
import {
  upgradeTowerImpl,
  sellTowerImpl,
  type UpgradeTowerParams,
  type SellTowerParams,
} from "./runtime/towerActions";
import {
  resetGameImpl,
  retryLevelImpl,
  type BattleResetDeps,
} from "./runtime/battleReset";
import {
  getSpecialTowerKeyImpl,
  clampWorldToMapBoundsImpl,
  getRandomMapTargetImpl,
  getRenderDprImpl,
  getCanvasDimensionsImpl,
} from "./runtime/viewMath";
import { upgradeSpellImpl, downgradeSpellImpl } from "./runtime/spellUpgrades";
import { useParticleAndCombat } from "./runtime/useParticleAndCombat";
import { useDevMenuSetup } from "./runtime/useDevMenuSetup";
import { computeBattleTheme } from "./runtime/battleTheme";
import {
  queueLevelEncountersImpl,
  handleTutorialHeroChangeImpl,
  handleTutorialSpellToggleImpl,
  handleEncounterAcknowledgeImpl,
  startWithRandomLoadoutImpl,
  ENCOUNTER_AUTO_DISMISS_MS,
  ENCOUNTER_EXIT_DURATION_MS,
} from "./runtime/tutorialCallbacks";
import { computeWavePreviewByPath } from "./runtime/wavePreview";
import { syncReinforcementTroops } from "./runtime/reinforcementSync";
import { setupResizeListener } from "./runtime/canvasResize";
import { handleBuildTouchDragMoveImpl, handleBuildTouchDragEndImpl } from "./runtime/buildDragHandlers";
import { computePendingChallengeUnlocks } from "./runtime/challengeUnlocks";
import { BattleUI } from "./runtime/BattleUI";
import { FreeplayDisclaimer } from "../components/menus/FreeplayDisclaimer";
import { LoadingScreen, LoadingOverlay, SceneTransitionOverlay } from "../components/menus/LoadingScreen";
import { usePreloadGate, useBattleLoadingGate } from "./useImagePreloader";
import { getWorldMapAssets, getBattleAssets, resolveLoadingTheme } from "../constants/loadingAssets";
import {
  handleCameraKeyDown,
  enterCameraModeImpl,
  exitCameraModeImpl,
  handleF2Key,
  handleSpacePause,
  captureScreenshotImpl,
  computePauseLocked,
  loadDevPerfSetting,
  saveDevPerfSetting,
  loadPhotoModeSetting,
  savePhotoModeSetting,
  handleDevPerfHotkey,
  enforceBattleOutcomePause,
} from "./runtime/cameraAndKeyboard";
import {
  resetGameStateImpl,
  initTutorialEncountersImpl,
  cleanupOnLeavePlayingImpl,
  validateWaveStartConfirmImpl,
  shouldClearWaveHover,
  initHeroAndSpellsImpl,
  extendStatusEffectsAfterResume,
  buildSpellsFromSelection,
  startWaveInnerImpl,
  startWaveImpl,
} from "./runtime/gameLifecycle";
import { useZoomSetup } from "./runtime/useZoomSetup";

type BattleOutcome = "victory" | "defeat";

export function usePrincetonTowerDefenseRuntime() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("menu");
  const [selectedMap, setSelectedMap] = useState<string>("poe");
  const [selectedHero, setSelectedHero] = useLocalStorage<HeroType | null>(STORAGE_KEY_SELECTED_HERO, "tiger");
  const [selectedSpells, setSelectedSpells] = useLocalStorage<SpellType[]>(STORAGE_KEY_SELECTED_SPELLS, []);

  // Freeplay: true when accessing a locked level via URL (no campaign credit on victory)
  const [isFreeplay, setIsFreeplay] = useState(false);
  // Level landing page: shown for any direct URL level access
  const [showFreeplayDisclaimer, setShowFreeplayDisclaimer] = useState(false);

  // ── Loading screens ──
  const worldMapAssetUrls = useMemo(() => getWorldMapAssets(), []);
  const worldMapPreload = usePreloadGate(worldMapAssetUrls, 2400);

  const getBattleUrlsForMap = useCallback(
    () => getBattleAssets(selectedMap),
    [selectedMap],
  );
  const [sceneTransitioning, setSceneTransitioning] = useState(false);
  const battleLoading = useBattleLoadingGate(
    getBattleUrlsForMap,
    2600,
    useCallback(() => {
      setGameState("playing");
    }, [setGameState]),
  );

  useEffect(() => {
    if (sceneTransitioning) {
      const t = setTimeout(() => setSceneTransitioning(false), 400);
      return () => clearTimeout(t);
    }
  }, [sceneTransitioning]);

  const startBattle = battleLoading.trigger;
  const cancelBattle = battleLoading.cancel;

  const freeplayDismissedRef = useRef(false);

  const handleFreeplayRequest = useCallback((levelId: string, isUnlocked: boolean) => {
    if (freeplayDismissedRef.current) {
      freeplayDismissedRef.current = false;
      return;
    }
    setSelectedMap(levelId);
    setIsFreeplay(!isUnlocked);
    setShowFreeplayDisclaimer(true);
  }, []);

  const freeplayStartRef = useRef<() => void>(() => {});

  const handleFreeplayCancel = useCallback(() => {
    freeplayDismissedRef.current = true;
    setIsFreeplay(false);
    setShowFreeplayDisclaimer(false);
    setSelectedMap("poe");
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  // Persistent progress (saved to localStorage)
  const {
    progress,
    setProgress,
    updateLevelStars,
    updateLevelStats,
    unlockLevel,
  } = useGameProgress();
  const { customLevels, upsertCustomLevel, deleteCustomLevel } = useCustomLevels();

  // Tutorial system
  const tutorial = useTutorial();
  const [showTutorial, setShowTutorial] = useState(false);
  const [encounterQueue, setEncounterQueue] = useState<EncounterQueueItem[]>([]);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [encounterExiting, setEncounterExiting] = useState(false);
  const tutorialBlockingRef = useRef(false);
  tutorialBlockingRef.current = showTutorial;

  const unlockedMaps = progress.unlockedMaps;
  const levelStars = progress.levelStars as LevelStars;
  const levelStats = progress.levelStats;
  const spellUpgradeLevels = useMemo(
    () => normalizeSpellUpgradeLevels(progress.spellUpgrades),
    [progress.spellUpgrades]
  );
  const totalStarsEarned =
    progress.totalStarsEarned ??
    Object.values(levelStars).reduce((sum, stars) => sum + stars, 0);
  const spentSpellStars = getSpentSpellUpgradeStars(spellUpgradeLevels);
  const availableSpellStars = Math.max(0, totalStarsEarned - spentSpellStars);

  useEffect(() => {
    const pending = computePendingChallengeUnlocks(levelStars, unlockedMaps);
    if (pending.length > 0) pending.forEach((levelId) => unlockLevel(levelId));
  }, [levelStars, unlockedMaps, unlockLevel]);

  const [starsEarned, setStarsEarned] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [battleOutcome, setBattleOutcome] = useState<BattleOutcome | null>(
    null
  );
  // Game resources
  const {
    pawPoints,
    setPawPoints,
    canAfford: canAffordPawPoints,
    addPawPoints,
    removePawPoints,
    spendPawPoints,
    resetPawPoints,
  } = usePawPoints(INITIAL_PAW_POINTS);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [currentWave, setCurrentWave] = useState(0);
  const nextWaveTimerRef = useRef(WAVE_TIMER_BASE);
  const setNextWaveTimer = useCallback((action: React.SetStateAction<number>) => {
    nextWaveTimerRef.current = typeof action === 'function' ? action(nextWaveTimerRef.current) : action;
  }, []);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const gameEventLog = useGameEventLog();
  const gameEventLogRef = useRef(gameEventLog);
  gameEventLogRef.current = gameEventLog;
  const [waveStartConfirm, setWaveStartConfirm] =
    useState<WaveStartConfirmState | null>(null);
  const [hoveredWaveBubblePathKey, setHoveredWaveBubblePathKey] =
    useState<string | null>(null);
  // Game entities
  const {
    items: towers,
    setItems: setTowers,
    addItem: addTowerEntity,
    clearItems: clearTowers,
    removeById: removeTowerEntity,
  } = useEntityCollection<Tower>([]);
  const {
    items: enemies,
    setItems: setEnemies,
    addItem: addEnemyEntity,
    clearItems: clearEnemies,
  } = useEntityCollection<Enemy>([]);
  const [hero, setHero] = useState<Hero | null>(null);
  const {
    items: troops,
    setItems: setTroops,
    addItem: addTroopEntity,
    addItems: addTroopEntities,
    clearItems: clearTroops,
    removeWhere: removeTroopsWhere,
  } = useEntityCollection<Troop>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  useEffect(() => {
    syncReinforcementTroops(spellUpgradeLevels.reinforcements, setTroops);
  }, [spellUpgradeLevels.reinforcements, setTroops]);
  const {
    items: projectiles,
    setItems: setProjectiles,
    addItems: addProjectileEntities,
    clearItems: clearProjectiles,
  } = useEntityCollection<Projectile>([]);
  const {
    items: effects,
    setItems: setEffects,
    addItem: addEffectEntity,
    addItems: addEffectEntities,
    clearItems: clearEffects,
  } = useEntityCollection<Effect>([]);
  // Particles use a ref-based object pool instead of React state to avoid
  // GC pressure and unnecessary re-renders. The pool is a module-level
  // singleton; we just snapshot active particles into a ref each frame.
  const particlesRef = useRef<Particle[]>([]);
  const particlePoolInitRef = useRef(false);
  if (!particlePoolInitRef.current) {
    initParticlePool();
    particlePoolInitRef.current = true;
  }
  // Special Objectives State – keyed by vault position (e.g. "3,5")
  const [specialTowerHp, setSpecialTowerHp] = useState<Record<string, number>>({});
  const [vaultFlash, setVaultFlash] = useState<Record<string, number>>({});
  // HUD Animation state
  const [goldSpellActive, setGoldSpellActive] = useState(false);
  const [paydayEndTime, setPaydayEndTime] = useState<number | null>(null);
  const [paydayPawPointsEarned, setPaydayPawPointsEarned] = useState(0);
  const [hexWardEndTime, setHexWardEndTime] = useState<number | null>(null);
  const [hexWardTargetCount, setHexWardTargetCount] = useState(0);
  const [hexWardRaiseCap, setHexWardRaiseCap] = useState(0);
  const [hexWardRaisesRemaining, setHexWardRaisesRemaining] = useState(0);
  const [hexWardDamageAmpPct, setHexWardDamageAmpPct] = useState(0);
  const [hexWardBlocksHealing, setHexWardBlocksHealing] = useState(false);
  // Eating club income events for stacking floaters
  const [eatingClubIncomeEvents, setEatingClubIncomeEvents] = useState<Array<{ id: string; amount: number }>>([]);
  // Bounty income events (from enemy kills)
  const [bountyIncomeEvents, setBountyIncomeEvents] = useState<Array<{ id: string; amount: number; isGoldBoosted: boolean }>>([]);
  // Leaked enemy bounty events (enemies that reached the end still award paw points)
  const [leakedBountyEvents, setLeakedBountyEvents] = useState<Array<{ id: string; amount: number }>>([]);
  // UI state
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [hoveredTower, setHoveredTower] = useState<string | null>(null);
  const [, setHoveredBuildTower] = useState<TowerType | null>(null);
  const [hoveredHero, setHoveredHero] = useState(false);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [buildingTower, setBuildingTower] = useState<TowerType | null>(null);
  const [draggingTower, setDraggingTower] = useState<DraggingTower | null>(
    null
  );
  const [placingTroop, setPlacingTroop] = useState(false);
  const [targetingSpell, setTargetingSpell] = useState<SpellType | null>(null);
  const targetingSpellRef = useRef<SpellType | null>(null);
  const [spellAutoAim, setSpellAutoAim] = useLocalStorage<Partial<Record<SpellType, boolean>>>(STORAGE_KEY_SPELL_AUTOAIM, {
    fireball: false,
    lightning: false,
  });
  const placingTroopRef = useRef(false);
  const mousePosRef = useRef<Position>({ x: 0, y: 0 });
  const executeTargetedSpellRef = useRef<(spellType: SpellType, pos: Position) => void>(() => { });
  const [gameSpeed, setGameSpeed] = useState(1);
  const [hoveredSpecialTower, setHoveredSpecialTower] = useState<SpecialTower | null>(null);
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [hoveredHazardType, setHoveredHazardType] = useState<string | null>(null);
  const [activeSentinelTargetKey, setActiveSentinelTargetKey] = useState<
    string | null
  >(null);
  const [missileMortarTargetingId, setMissileMortarTargetingId] = useState<
    string | null
  >(null);
  const missileMortarTargetingIdRef = useRef<string | null>(null);
  const [sentinelTargets, setSentinelTargets] = useState<
    Record<string, Position>
  >({});
  // Unit Inspector state (enemies, troops, heroes)
  const [inspectorActive, setInspectorActive] = useState(false);
  const [selectedInspectEnemy, setSelectedInspectEnemy] = useState<Enemy | null>(null);
  const [selectedInspectTroop, setSelectedInspectTroop] = useState<Troop | null>(null);
  const [selectedInspectHero, setSelectedInspectHero] = useState(false);
  const [previousGameSpeed, setPreviousGameSpeed] = useState(1);
  const [hoveredInspectEnemy, setHoveredInspectEnemy] = useState<string | null>(null);
  const [hoveredInspectTroop, setHoveredInspectTroop] = useState<string | null>(null);
  const [hoveredInspectHero, setHoveredInspectHero] = useState(false);
  const [hoveredInspectDecoration, setHoveredInspectDecoration] = useState<Decoration | null>(null);
  // Troop/Hero movement target indicator state
  const [moveTargetPos, setMoveTargetPos] = useState<Position | null>(null);
  const [moveTargetValid, setMoveTargetValid] = useState(false);
  const [selectedUnitMoveInfo, setSelectedUnitMoveInfo] = useState<TroopMoveInfo | null>(null);
  const [draggingUnit, setDraggingUnit] = useState<DraggingUnitState | null>(null);
  const [unitDragStart, setUnitDragStart] = useState<Position | null>(null);
  const [unitDragMoved, setUnitDragMoved] = useState(false);
  // Camera panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position | null>(null);
  const [panStartOffset, setPanStartOffset] = useState<Position | null>(null);
  const [isBuildDragging, setIsBuildDragging] = useState(false);
  // Tower repositioning state (drag existing towers to move them)
  const [repositioningTower, setRepositioningTower] = useState<string | null>(null);
  const [repositionPreviewPos, setRepositionPreviewPos] = useState<Position | null>(null);
  // Camera - start more zoomed in and centered
  const [cameraOffset, setCameraOffset] = useState<Position>(DEFAULT_CAMERA_OFFSET);
  const [cameraZoom, setCameraZoom] = useState(DEFAULT_CAMERA_ZOOM);
  const [cameraModeActive, setCameraModeActive] = useState(false);
  const [renderDprCap, setRenderDprCap] = useState<number>(QUALITY_DPR_CAP.high);
  const [isDevModeUnlocked, setIsDevModeUnlocked] = useState(readDevModeUnlocked);
  const isDevMode = DEV_CONFIG_MENU_ENABLED || isDevModeUnlocked;
  const [devPerfEnabled, setDevPerfEnabled] = useState<boolean>(
    () => DEV_CONFIG_MENU_ENABLED
  );
  const [photoModeEnabled, setPhotoModeEnabled] = useState<boolean>(false);
  const [devPerfSnapshot, setDevPerfSnapshot] = useState<DevPerfSnapshot>({
    fps: 0,
    frameMs: 16.7,
    updateMs: 0,
    renderMs: 0,
    quality: "high",
    towers: 0,
    enemies: 0,
    troops: 0,
    projectiles: 0,
    effects: 0,
    particles: 0,
  });
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const backdropCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchTimeRef = useRef<number>(0); // Track touch to prevent duplicate click events
  const isTouchDeviceRef = useRef<boolean>(false); // Track if user is using touch input
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastGestureScaleRef = useRef<number | null>(null);
  const renderQualityRef = useRef<RenderQuality>("high");
  const rollingFrameMsRef = useRef<number>(16.7);
  const qualityLastChangedAtRef = useRef<number>(0);
  const qualityCooldownMsRef = useRef<number>(QUALITY_TRANSITION_COOLDOWN_MS);
  const qualityThresholdSustainedSinceRef = useRef<number>(0);
  const renderFrameIndexRef = useRef<number>(0);
  const devPerfEnabledRef = useRef<boolean>(devPerfEnabled);
  const devPerfLastPublishedAtRef = useRef<number>(0);
  const devPerfUpdateMsRef = useRef<number>(0);
  const devPerfRenderMsRef = useRef<number>(0);
  const entityCountsRef = useRef({
    towers: 0,
    enemies: 0,
    troops: 0,
    projectiles: 0,
    effects: 0,
    particles: 0,
  });

  // PERFORMANCE FIX: Use refs for game loop callbacks to prevent loop restart on state changes
  // Without this, selecting a troop/hero causes the game loop useEffect to re-run,
  // which cancels the animation frame and causes a noticeable freeze on mobile devices
  const updateGameRef = useRef<(deltaTime: number) => void>(() => { });
  const renderRef = useRef<() => void>(() => { });
  const flushParticleQueueRef = useRef<() => void>(() => { });
  const enemySortOffsetCacheRef = useRef<Map<string, number>>(new Map());
  // Guard ref to prevent duplicate defeat/victory handling across animation frames
  const gameEndHandledRef = useRef(false);

  // PERFORMANCE FIX: Cache decorations to avoid regenerating them every frame
  // This was causing major performance issues on mobile - generating 500+ decorations per frame
  const cachedDecorationsRef = useRef<{ mapKey: string; decorations: RuntimeDecoration[] } | null>(null);
  const cachedStaticMapLayerRef = useRef<StaticMapLayerCache | null>(null);
  const cachedStaticDecorationLayerRef =
    useRef<StaticDecorationLayerCache | null>(null);
  const cachedFogLayerRef = useRef<FogLayerCache | null>(null);
  const cachedBackdropRef = useRef<BackdropCache | null>(null);
  const cachedAmbientLayerRef = useRef<AmbientLayerCache | null>(null);
  devPerfEnabledRef.current = devPerfEnabled;
  entityCountsRef.current = {
    towers: towers.length,
    enemies: enemies.length,
    troops: troops.length,
    projectiles: projectiles.length,
    effects: effects.length,
    particles: getActiveParticleCount(),
  };

  // Timer system (wave management + pausable timeouts + zoom debounce refs)
  const {
    clearAllTimers, setPausableTimeout, pauseAllTimeouts, resumeAllTimeouts,
    spawnIntervalsRef, activeTimeoutsRef, pausableTimeoutsRef,
    gameSpeedRef, pausedAtRef, totalPausedTimeRef,
    zoomSettleTimerRef, isZoomDebouncingRef,
  } = useTimerSystem(gameSpeed);

  // Refs for current state values to avoid stale closures in callbacks
  const towersRef = useRef(towers);
  const pawPointsRef = useRef(pawPoints);
  towersRef.current = towers;
  pawPointsRef.current = pawPoints;

  // Track per-barracks spawn time to prevent double-spawning on restart
  const lastBarracksSpawnRef = useRef<Map<string, number>>(new Map());
  // Track per-structure strike cooldowns for sentinel nexus challenge towers
  const lastSentinelStrikeRef = useRef<Map<string, number>>(new Map());
  // Track per-structure cadence for orange sunforge offensive barrages.
  const lastSunforgeBarrageRef = useRef<Map<string, number>>(new Map());
  // Track the sunforge orrery's current aim position (for non-interactable reticle)
  const sunforgeAimRef = useRef<Map<string, Position>>(new Map());
  // Track the missile battery auto-aim position per tower (for non-interactable reticle)
  const missileAutoAimRef = useRef<Map<string, Position>>(new Map());
  // Track when enemies first appeared on the field (for special tower warmup delay)
  const enemiesFirstAppearedRef = useRef<number>(0);
  const sentinelTargetsRef = useRef<Record<string, Position>>({});
  // Track when game was reset to prevent stale state race conditions
  const gameResetTimeRef = useRef<number>(0);
  sentinelTargetsRef.current = sentinelTargets;

  const getSpecialTowerKey = useCallback(
    (tower: Pick<SpecialTower, "type" | "pos">): string =>
      getSpecialTowerKeyImpl(selectedMap, tower),
    [selectedMap]
  );

  const clampWorldToMapBounds = useCallback(
    (worldPos: Position): Position => clampWorldToMapBoundsImpl(worldPos),
    []
  );

  const getRandomMapTarget = useCallback(
    (): Position => getRandomMapTargetImpl(),
    []
  );

  const currentLevelWaves = getLevelWaves(selectedMap);
  const totalWaves = currentLevelWaves.length;
  const activeWaveSpawnPaths = React.useMemo<string[]>(() => {
    return getLevelPathKeys(selectedMap);
  }, [selectedMap]);

  const incomingWavePreviewByPath = React.useMemo<Map<string, WavePreviewEnemyEntry[]>>(
    () => computeWavePreviewByPath(selectedMap, currentWave, activeWaveSpawnPaths),
    [selectedMap, currentWave, activeWaveSpawnPaths],
  );

  const blockedPositions = React.useMemo(
    () => getBlockedPositionsForMap(selectedMap),
    [selectedMap]
  );

  const getRenderDpr = useCallback(
    () => getRenderDprImpl(renderDprCap),
    [renderDprCap],
  );

  const getCanvasDimensions = useCallback(
    () => getCanvasDimensionsImpl(canvasRef, renderDprCap),
    [renderDprCap],
  );

  const { stableZoomRef } = useZoomSetup({
    canvasRef, isZoomDebouncingRef, zoomSettleTimerRef,
    cachedStaticMapLayerRef, cachedStaticDecorationLayerRef, cachedFogLayerRef,
    cachedAmbientLayerRef, lastGestureScaleRef,
    gameState, battleOutcome, selectedMap,
    setCameraZoom, setCameraOffset, getCanvasDimensions,
  }, cameraZoom);

  // Timer callbacks come from useTimerSystem above

  // Particle & combat system (refs + callbacks in sub-hook)
  const {
    addParticles, flushQueuedParticles, awardBounty, killHero, onEnemyKill,
    raiseHexWardGhostFromTroopDeath,
    pendingParticleBurstsRef, pendingDeathEffectsRef,
    handledEnemyIdsRef, handledHexGhostSourceIdsRef,
    hexWardRaisesRemainingRef, handledWaveCompletionRef,
    projectileUpdateAccumulator, particleUpdateAccumulator, effectsUpdateAccumulator,
  } = useParticleAndCombat({
    entityCountsRef, gameEventLogRef,
    hexWardEndTime, activeWaveSpawnPaths, selectedMap,
    addPawPoints, setBountyIncomeEvents, setPaydayPawPointsEarned,
    addTroopEntities, setHexWardRaisesRemaining, addEffectEntity,
  });

  // Keyboard controls for camera panning, zoom, and escape
  useEffect(() => {
    if (gameState !== "playing" || battleOutcome) return;
    const handleKeyDown = (e: KeyboardEvent) =>
      handleCameraKeyDown(e, {
        setCameraOffset,
        setCameraZoom,
        setBuildingTower,
        setDraggingTower,
        setIsBuildDragging,
        setTargetingSpell,
        setPlacingTroop,
        setSelectedTower,
        setActiveSentinelTargetKey,
        setMissileMortarTargetingId,
        setHero,
        setTroops,
        addPawPoints,
        targetingSpellRef,
        placingTroopRef,
      });
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, battleOutcome, setTroops, addPawPoints]);

  const preLockSpeedRef = useRef<number | null>(null);

  const enterCameraMode = useCallback(
    () => enterCameraModeImpl(cameraModeActive, gameSpeed, preLockSpeedRef, setGameSpeed, setCameraModeActive),
    [cameraModeActive, gameSpeed],
  );

  const exitCameraMode = useCallback(
    () => exitCameraModeImpl(cameraModeActive, preLockSpeedRef, setGameSpeed, setCameraModeActive),
    [cameraModeActive],
  );

  const toggleCameraMode = useCallback(() => {
    if (cameraModeActive) exitCameraMode();
    else enterCameraMode();
  }, [cameraModeActive, enterCameraMode, exitCameraMode]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => handleF2Key(e, toggleCameraMode);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, toggleCameraMode]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) =>
      handleSpacePause(e, cameraModeActive, inspectorActive, battleOutcome, setGameSpeed);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, cameraModeActive, inspectorActive, battleOutcome]);

  const handleCameraModeCapture = useCallback(
    () =>
      captureScreenshotImpl({
        canvasRef,
        bgCanvasRef,
        backdropCanvasRef,
        cachedStaticMapLayerRef,
        cameraOffset,
        cameraZoom,
        getRenderDpr,
      }),
    [cameraOffset, cameraZoom, getRenderDpr],
  );

  const pauseLocked = computePauseLocked(cameraModeActive, inspectorActive);

  useEffect(() => { loadDevPerfSetting(setDevPerfEnabled); }, []);
  useEffect(() => { saveDevPerfSetting(devPerfEnabled); }, [devPerfEnabled]);

  useEffect(() => { loadPhotoModeSetting(setPhotoModeEnabled); }, []);
  useEffect(() => { savePhotoModeSetting(photoModeEnabled); }, [photoModeEnabled]);

  useEffect(() => {
    if (!DEV_CONFIG_MENU_ENABLED || gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => handleDevPerfHotkey(e, setDevPerfEnabled);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState]);

  useEffect(() => {
    enforceBattleOutcomePause(battleOutcome, gameSpeed, setGameSpeed);
  }, [battleOutcome, gameSpeed]);

  // Reset game state when starting a new game (entering "playing" state)
  useEffect(() => {
    if (gameState === "playing") {
      resetGameStateImpl({
        selectedMap,
        refs: {
          prevGameSpeedRef,
          pausedAtRef,
          totalPausedTimeRef,
          pausableTimeoutsRef,
          lastBarracksSpawnRef,
          lastSentinelStrikeRef,
          lastSunforgeBarrageRef,
          sunforgeAimRef,
          missileAutoAimRef,
          enemiesFirstAppearedRef,
          gameResetTimeRef,
          hexWardRaisesRemainingRef,
        },
        clearAllTimers,
        setBattleOutcome,
        resetPawPoints,
        setLives,
        setCurrentWave,
        setNextWaveTimer,
        setWaveInProgress,
        setHoveredWaveBubblePathKey,
        setTowers,
        clearTowers,
        clearEnemies,
        setHero,
        clearTroops,
        clearProjectiles,
        clearEffects,
        setSelectedTower,
        setBuildingTower,
        setDraggingTower,
        setPlacingTroop,
        setTargetingSpell,
        setActiveSentinelTargetKey,
        setMissileMortarTargetingId,
        setSentinelTargets,
        setSpells,
        setGameSpeed,
        setGoldSpellActive,
        setPaydayEndTime,
        setPaydayPawPointsEarned,
        setHexWardEndTime,
        setHexWardTargetCount,
        setHexWardRaiseCap,
        setHexWardRaisesRemaining,
        setHexWardDamageAmpPct,
        setHexWardBlocksHealing,
        setSpecialTowerHp,
        photoModeEnabled,
      });
    }
  }, [
    gameState,
    clearAllTimers,
    selectedMap,
    resetPawPoints,
    clearTowers,
    setTowers,
    clearEnemies,
    clearTroops,
    clearProjectiles,
    clearEffects,
    photoModeEnabled,
  ]);

  // Tutorial & encounter check when entering playing state
  useEffect(() => {
    if (gameState !== "playing") return;
    initTutorialEncountersImpl({
      selectedMap,
      tutorial,
      setShowTutorial,
      setEncounterExiting,
      setEncounterQueue,
      setEncounterIndex,
    });
  }, [gameState, selectedMap, tutorial.hasCompletedTutorial, tutorial.getLevelEncounters]);

  // Clear all timers when leaving the playing state (defeat, victory, quit)
  useEffect(() => {
    if (gameState !== "playing") {
      cleanupOnLeavePlayingImpl({
        refs: { pendingParticleBurstsRef },
        clearAllTimers,
        setHoveredWaveBubblePathKey,
        setShowTutorial,
        setEncounterExiting,
        setEncounterQueue,
        setEncounterIndex,
      });
    }
  }, [gameState, clearAllTimers]);

  useEffect(() => {
    setWaveStartConfirm((prev) =>
      validateWaveStartConfirmImpl(
        prev,
        gameState,
        waveInProgress,
        selectedMap,
        currentWave,
        activeWaveSpawnPaths
      )
    );
  }, [gameState, waveInProgress, selectedMap, currentWave, activeWaveSpawnPaths]);

  useEffect(() => {
    if (
      shouldClearWaveHover(
        hoveredWaveBubblePathKey,
        gameState,
        waveInProgress,
        gameSpeed,
        currentWave,
        totalWaves,
        nextWaveTimerRef.current,
        activeWaveSpawnPaths
      )
    ) {
      setHoveredWaveBubblePathKey(null);
    }
  }, [
    hoveredWaveBubblePathKey,
    gameState,
    waveInProgress,
    gameSpeed,
    currentWave,
    totalWaves,
    activeWaveSpawnPaths,
  ]);

  // Initialize hero and spells when game starts
  useEffect(() => {
    if (gameState === "playing" && selectedHero && !hero) {
      initHeroAndSpellsImpl({
        selectedHero,
        selectedMap,
        selectedSpells,
        activeWaveSpawnPaths,
        refs: { gameEventLogRef },
        setHero,
        setSpells,
        setNextWaveTimer,
        setLevelStartTime,
        setTimeSpent,
        setCameraOffset,
        setCameraZoom,
      });
    }
  }, [
    gameState,
    selectedHero,
    hero,
    selectedSpells,
    selectedMap,
    activeWaveSpawnPaths,
  ]);
  useEffect(() => {
    return setupResizeListener(
      canvasRef, bgCanvasRef, backdropCanvasRef, containerRef,
      cachedStaticMapLayerRef, cachedBackdropRef, cachedFogLayerRef, getRenderDpr,
    );
  }, [gameState, getRenderDpr, cameraModeActive]);

  // Handle pause/resume of spawn timers when gameSpeed changes
  const prevGameSpeedRef = useRef(gameSpeed);
  useEffect(() => {
    const prevSpeed = prevGameSpeedRef.current;
    prevGameSpeedRef.current = gameSpeed;

    if (prevSpeed !== 0 && gameSpeed === 0) {
      pauseAllTimeouts();
    } else if (prevSpeed === 0 && gameSpeed !== 0) {
      extendStatusEffectsAfterResume({
        gameSpeed,
        refs: { pausedAtRef, totalPausedTimeRef },
        pauseAllTimeouts,
        resumeAllTimeouts,
        setTroops,
        setHero,
        setEnemies,
        setTowers,
        setHexWardEndTime,
      });
      resumeAllTimeouts();
    }
  }, [gameSpeed, pauseAllTimeouts, resumeAllTimeouts, setTroops, setHero, setEnemies, setTowers]);

  // --- Tutorial & encounter callbacks ---

  const startWaveInnerRef = useRef<() => void>(() => { });

  const queueLevelEncounters = useCallback(
    (mapKey: string) => queueLevelEncountersImpl(mapKey, tutorial, setEncounterExiting, setEncounterQueue, setEncounterIndex),
    [tutorial],
  );

  const handleTutorialComplete = useCallback(() => {
    tutorial.markTutorialComplete();
    setShowTutorial(false);
    queueLevelEncounters(selectedMap);
  }, [tutorial, selectedMap, queueLevelEncounters]);

  const handleTutorialSkip = useCallback(() => {
    tutorial.skipTutorial();
    setShowTutorial(false);
    queueLevelEncounters(selectedMap);
  }, [tutorial, selectedMap, queueLevelEncounters]);

  const handleTutorialHeroChange = useCallback(
    (heroType: HeroType) => handleTutorialHeroChangeImpl(heroType, setSelectedHero, setHero),
    [setSelectedHero],
  );

  const handleTutorialSpellToggle = useCallback(
    (spellType: SpellType) => handleTutorialSpellToggleImpl(spellType, setSelectedSpells),
    [setSelectedSpells],
  );

  // Keep live spells in sync when selectedSpells changes during tutorial
  useEffect(() => {
    if (!showTutorial) return;
    setSpells(buildSpellsFromSelection(selectedSpells));
  }, [selectedSpells, showTutorial]);

  const encounterQueueRef = useRef(encounterQueue);
  encounterQueueRef.current = encounterQueue;
  const encounterIndexRef = useRef(encounterIndex);
  encounterIndexRef.current = encounterIndex;
  const tutorialRef = useRef(tutorial);
  tutorialRef.current = tutorial;

  const handleEncounterAcknowledge = useCallback(
    () => handleEncounterAcknowledgeImpl(encounterQueueRef, encounterIndexRef, tutorialRef, setEncounterExiting, setEncounterIndex),
    [],
  );

  useEffect(() => {
    if (!encounterExiting) return;
    const timer = setTimeout(() => {
      setEncounterQueue([]);
      setEncounterIndex(0);
      setEncounterExiting(false);
    }, ENCOUNTER_EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [encounterExiting]);

  // Start wave function
  const startWaveInner = useCallback(() => {
    startWaveInnerImpl({
      selectedMap,
      waveInProgress,
      currentWave,
      activeWaveSpawnPaths,
      refs: {
        gameSpeedRef,
        spawnIntervalsRef,
        handledWaveCompletionRef,
        gameEventLogRef,
      },
      setWaveInProgress,
      setCurrentWave,
      setNextWaveTimer,
      addEnemyEntity,
      setPausableTimeout,
    });
  }, [
    waveInProgress,
    currentWave,
    selectedMap,
    setPausableTimeout,
    addEnemyEntity,
    activeWaveSpawnPaths,
  ]);

  startWaveInnerRef.current = startWaveInner;

  // Wrapper that checks for new enemy encounters before spawning
  const startWave = useCallback(() => {
    startWaveImpl({
      selectedMap,
      waveInProgress,
      currentWave,
      refs: { tutorialBlockingRef },
      tutorial,
      startWaveInner,
      setEncounterExiting,
      setEncounterQueue,
      setEncounterIndex,
    });
  }, [startWaveInner, selectedMap, waveInProgress, currentWave, tutorial]);

  // updateGame is only accessed through updateGameRef, so no useMemo/useCallback needed
  const updateGame = (deltaTime: number) => updateGameTick({
    gameSpeed, selectedMap, isFreeplay, waveInProgress, currentWave, vaultFlash,
    hero, lives, gameState, battleOutcome, enemies, nextWaveTimer: nextWaveTimerRef.current,
    specialTowerHp, troops, towers, levelStartTime, levelStars,
    totalWaves, unlockedMaps, activeWaveSpawnPaths, cameraOffset, cameraZoom,
    setTimeSpent, setWaveInProgress, setHoveredWaveBubblePathKey,
    setNextWaveTimer, setGameSpeed, setBattleOutcome, setStarsEarned,
    setTowers, setEnemies, setHero, setTroops, setSpells, setEffects,
    setProjectiles, setSentinelTargets, setLives, setSpecialTowerHp,
    setVaultFlash, setLeakedBountyEvents, setEatingClubIncomeEvents,
    startWave, addParticles, clearAllTimers, updateLevelStats, updateLevelStars,
    unlockLevel, awardBounty, killHero, onEnemyKill, addPawPoints,
    addEffectEntities, addProjectileEntities, addTroopEntities,
    getSpecialTowerKey, getRandomMapTarget, raiseHexWardGhostFromTroopDeath,
    getCanvasDimensions,
    handledEnemyIdsRef, handledHexGhostSourceIdsRef, gameEndHandledRef,
    totalPausedTimeRef, gameResetTimeRef, gameEventLogRef,
    enemiesFirstAppearedRef, lastSentinelStrikeRef, lastSunforgeBarrageRef,
    sunforgeAimRef, lastBarracksSpawnRef, entityCountsRef,
    projectileUpdateAccumulator, effectsUpdateAccumulator,
    particleUpdateAccumulator, tutorialBlockingRef, activeTimeoutsRef,
    sentinelTargetsRef, missileMortarTargetingIdRef, mousePosRef,
    missileAutoAimRef,
  }, deltaTime);
  const getWaveStartBubblesScreenData = useCallback(
    (canvasWidth: number, canvasHeight: number, dpr: number) =>
      computeWaveStartBubbles(
        {
          gameState,
          battleOutcome,
          gameSpeed,
          waveInProgress,
          currentWave,
          totalWaves,
          nextWaveTimer: nextWaveTimerRef.current,
          activeWaveSpawnPaths,
          cameraOffset,
          cameraZoom,
        },
        canvasWidth,
        canvasHeight,
        dpr
      ),
    [
      gameState,
      battleOutcome,
      gameSpeed,
      waveInProgress,
      currentWave,
      totalWaves,
      activeWaveSpawnPaths,
      cameraOffset,
      cameraZoom,
    ]
  );

  // PERFORMANCE FIX: Keep refs updated with latest callbacks
  // The game loop uses these refs, so the actual identity of render/updateGame doesn't matter.
  updateGameRef.current = updateGame;
  renderRef.current = () => renderScene({
    canvasRef, bgCanvasRef, backdropCanvasRef,
    cameraOffset, cameraZoom, stableZoomRef, isZoomDebouncingRef,
    renderQualityRef, renderFrameIndexRef,
    towers, enemies, hero, troops, projectiles, effects,
    selectedMap, currentWave, activeWaveSpawnPaths,
    draggingTower, hoveredTower, selectedTower,
    moveTargetPos, moveTargetValid, selectedUnitMoveInfo, draggingUnit,
    hoveredSpecialTower, sentinelTargets, activeSentinelTargetKey,
    specialTowerHp, vaultFlash,
    repositioningTower, repositionPreviewPos, blockedPositions,
    inspectorActive, selectedInspectEnemy, hoveredInspectEnemy,
    hoveredInspectTroop, hoveredInspectHero,
    selectedInspectTroop, selectedInspectHero,
    hoveredWaveBubblePathKey, waveStartConfirm, incomingWavePreviewByPath,
    cachedStaticMapLayerRef, cachedStaticDecorationLayerRef,
    cachedFogLayerRef, cachedBackdropRef, cachedAmbientLayerRef,
    cachedDecorationsRef, pendingDeathEffectsRef,
    particlesRef, entityCountsRef, enemySortOffsetCacheRef,
    pausedAtRef, gameSpeedRef, enemiesFirstAppearedRef,
    lastSentinelStrikeRef, lastSunforgeBarrageRef,
    sunforgeAimRef, missileAutoAimRef, mousePosRef,
    targetingSpellRef, placingTroopRef, missileMortarTargetingIdRef,
    getRenderDpr, getWaveStartBubblesScreenData, getSpecialTowerKey,
  });
  targetingSpellRef.current = targetingSpell;
  placingTroopRef.current = placingTroop;
  mousePosRef.current = mousePos;
  missileMortarTargetingIdRef.current = missileMortarTargetingId;
  flushParticleQueueRef.current = flushQueuedParticles;

  useEffect(() => {
    if (gameState !== "playing" || battleOutcome) return;
    const loopRefs: GameLoopRefs = {
      lastTimeRef, gameLoopRef, rollingFrameMsRef,
      qualityLastChangedAtRef, qualityThresholdSustainedSinceRef,
      qualityCooldownMsRef, renderQualityRef, gameSpeedRef,
      devPerfEnabledRef, devPerfLastPublishedAtRef,
      devPerfUpdateMsRef, devPerfRenderMsRef, entityCountsRef,
      updateGameRef, renderRef, flushParticleQueueRef,
    };
    return startGameLoop(loopRefs, setRenderDprCap, setDevPerfSnapshot);
  }, [gameState, battleOutcome]);

  const resolveHeroCommandTarget = useCallback(
    (clickWorldPos: Position): Position | null =>
      resolveHeroCommandTargetImpl(clickWorldPos, moveTargetPos, moveTargetValid, selectedMap),
    [moveTargetPos, moveTargetValid, selectedMap]
  );

  const resolveTroopCommandTarget = useCallback(
    (clickWorldPos: Position, moveInfo: TroopMoveInfo): Position | null =>
      resolveTroopCommandTargetImpl(clickWorldPos, moveInfo, moveTargetPos, moveTargetValid, selectedMap),
    [moveTargetPos, moveTargetValid, selectedMap]
  );

  const issueHeroMoveCommand = useCallback(
    (heroId: string, targetPos: Position) =>
      issueHeroMoveCommandImpl(heroId, targetPos, setHero, addParticles),
    [addParticles]
  );

  const issueTroopFormationMoveCommand = useCallback(
    (ownerId: string, targetPos: Position) =>
      issueTroopFormationMoveCommandImpl(ownerId, targetPos, towers, setTroops, addParticles),
    [addParticles, setTroops, towers]
  );

  const clearUnitMoveInteraction = useCallback(() => {
    setMoveTargetPos(null);
    setMoveTargetValid(false);
    setSelectedUnitMoveInfo(null);
    setDraggingUnit(null);
    setUnitDragStart(null);
    setUnitDragMoved(false);
  }, []);

  // Canvas event params updated via ref each render (handlers use ref to avoid stale closures)
  const canvasEventParamsRef = useRef<CanvasEventParams>(null as unknown as CanvasEventParams);
  canvasEventParamsRef.current = {
    canvasRef, isTouchDeviceRef, lastTouchTimeRef, executeTargetedSpellRef,
    sentinelTargetsRef, missileAutoAimRef, cachedDecorationsRef, gameEventLogRef,
    cameraOffset, cameraZoom, buildingTower, draggingTower, placingTroop,
    targetingSpell, activeSentinelTargetKey, inspectorActive, gameSpeed,
    selectedTower, selectedMap, repositioningTower, repositionPreviewPos,
    missileMortarTargetingId, isPanning, panStart, panStartOffset,
    isBuildDragging, draggingUnit, unitDragStart, unitDragMoved,
    blockedPositions, waveStartConfirm, currentWave, spellUpgradeLevels,
    moveTargetPos, moveTargetValid, selectedUnitMoveInfo,
    towers, enemies, hero, troops,
    getCanvasDimensions, getWaveStartBubblesScreenData,
    canAffordPawPoints, spendPawPoints, addParticles,
    addTowerEntity, addTroopEntities, startWave, getSpecialTowerKey,
    clampWorldToMapBounds, resolveHeroCommandTarget, resolveTroopCommandTarget,
    issueHeroMoveCommand, issueTroopFormationMoveCommand, clearUnitMoveInteraction,
    setIsBuildDragging, setDraggingTower, setBuildingTower, setIsPanning,
    setPanStart, setPanStartOffset, setDraggingUnit, setUnitDragStart,
    setUnitDragMoved, setSelectedInspectEnemy, setSelectedInspectTroop,
    setSelectedInspectHero, setNextWaveTimer, setWaveStartConfirm,
    setRepositioningTower, setRepositionPreviewPos, setTowers, setTroops,
    setSpells, setHero, setSelectedTower, setActiveSentinelTargetKey,
    setSentinelTargets, setEffects, setPlacingTroop, setTargetingSpell,
    setMissileMortarTargetingId, setMousePos, setMoveTargetPos,
    setMoveTargetValid, setSelectedUnitMoveInfo, setCameraOffset,
    setHoveredTower, setHoveredHero, setHoveredSpecialTower,
    setHoveredLandmark, setHoveredHazardType, setHoveredWaveBubblePathKey,
    setHoveredInspectEnemy, setHoveredInspectTroop, setHoveredInspectHero,
    setHoveredInspectDecoration,
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => handlePointerDownImpl(canvasEventParamsRef.current, e),
    [],
  );

  const handleCanvasClick = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => handleCanvasClickImpl(canvasEventParamsRef.current, e),
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => handleMouseMoveImpl(canvasEventParamsRef.current, e),
    [],
  );

  const handleCanvasPointerLeave = useCallback(() => {
    setHoveredWaveBubblePathKey(null);
  }, []);

  const handleBuildTouchDragMove = useCallback(
    (clientX: number, clientY: number, towerType: TowerType) =>
      handleBuildTouchDragMoveImpl(clientX, clientY, towerType, canvasRef, setDraggingTower),
    []
  );

  const handleBuildTouchDragEnd = useCallback(
    (clientX: number, clientY: number) =>
      handleBuildTouchDragEndImpl(clientX, clientY, canvasRef, setDraggingTower),
    []
  );

  const upgradeTowerParams = useMemo<UpgradeTowerParams>(() => ({
    towersRef, pawPointsRef, activeWaveSpawnPaths, selectedMap, gameEventLogRef,
    setTowers, setTroops, setSelectedTower, removePawPoints, addParticles,
  }), [addParticles, removePawPoints, setTowers, setTroops, activeWaveSpawnPaths, selectedMap]);

  const upgradeTower = useCallback(
    (towerId: string, choice?: "A" | "B") => upgradeTowerImpl(towerId, choice, upgradeTowerParams),
    [upgradeTowerParams]
  );

  const sellTowerParams = useMemo<SellTowerParams>(() => ({
    towers, gameEventLogRef, addPawPoints, addParticles,
    removeTowerEntity, removeTroopsWhere, setSelectedTower,
  }), [towers, addParticles, addPawPoints, removeTowerEntity, removeTroopsWhere]);

  const sellTower = useCallback(
    (towerId: string) => sellTowerImpl(towerId, sellTowerParams),
    [sellTowerParams]
  );
  const spellExecParams: SpellExecutionParams = useMemo(() => ({
    spells, enemies, selectedMap, gameSpeed, targetingSpell, placingTroop,
    spellUpgradeLevels, spellAutoAim,
    setSpells, setEnemies, setEffects, setTargetingSpell, setPlacingTroop,
    setGoldSpellActive, setPaydayPawPointsEarned, setPaydayEndTime,
    setHexWardEndTime, setHexWardTargetCount, setHexWardRaiseCap,
    setHexWardRaisesRemaining, setHexWardDamageAmpPct, setHexWardBlocksHealing,
    hexWardRaisesRemainingRef, executeTargetedSpellRef, gameEventLogRef,
    canAffordPawPoints, spendPawPoints, addPawPoints, addParticles, onEnemyKill,
  }), [
    spells, enemies, selectedMap, gameSpeed, targetingSpell, placingTroop,
    spellUpgradeLevels, spellAutoAim, addParticles, canAffordPawPoints,
    spendPawPoints, addPawPoints, onEnemyKill, setEnemies, setEffects,
  ]);

  const castSpell = useCallback(
    (spellType: SpellType) => {
      castSpellImpl(spellExecParams, spellType);
    },
    [spellExecParams]
  );

  const toggleSpellAutoAim = useCallback((spellType: SpellType) => {
    setSpellAutoAim((prev) => ({ ...prev, [spellType]: !prev[spellType] }));
  }, [setSpellAutoAim]);

  const executeTargetedSpell = useCallback(
    (spellType: SpellType, centerWorldPos: Position) => {
      executeTargetedSpellImpl(spellExecParams, spellType, centerWorldPos);
    },
    [spellExecParams]
  );
  executeTargetedSpellRef.current = executeTargetedSpell;

  const upgradeSpell = useCallback(
    (spellType: SpellType) => upgradeSpellImpl(spellType, setProgress),
    [setProgress]
  );
  const downgradeSpell = useCallback(
    (spellType: SpellType) => downgradeSpellImpl(spellType, setProgress),
    [setProgress]
  );

  const toggleHeroSelection = useCallback(() => {
    setHero((prev) =>
      prev && !prev.dead
        ? { ...prev, selected: !prev.selected }
        : prev
    );
  }, []);
  const triggerHeroAbility = useCallback(() => {
    if (!hero) return;
    triggerHeroAbilityImpl({
      hero, enemies, selectedMap, gameSpeed,
      setHero, setEnemies, setTowers, setTroops, setEffects,
      addParticles, onEnemyKill, addTroopEntities, addTroopEntity,
    });
  }, [
    hero, enemies, selectedMap, addParticles, gameSpeed,
    onEnemyKill, addTroopEntities, addTroopEntity, setEffects, setEnemies, setTowers, setTroops,
  ]);

  // Auto-trigger hero ability when HP drops below 25% while actively attacking
  useEffect(() => {
    if (!hero || hero.dead || !hero.abilityReady || hero.hp <= 0) return;
    if (!hero.aggroTarget) return;
    if (hero.hp < hero.maxHp * HERO_AUTO_ABILITY_HP_THRESHOLD) {
      triggerHeroAbility();
    }
  }, [hero?.hp, hero?.maxHp, hero?.abilityReady, hero?.dead, hero?.aggroTarget, triggerHeroAbility]);

  const battleResetDeps = useMemo<BattleResetDeps>(() => ({
    clearAllTimers, setPawPoints, setEffects, setEnemies, setProjectiles,
    setBattleOutcome, setTowers, setTroops, setGameState, setLives,
    setCurrentWave, setNextWaveTimer, setHero, setSelectedTower,
    setBuildingTower, setDraggingTower, setIsPanning, setPanStart,
    setPanStartOffset, setRepositioningTower, setRepositionPreviewPos,
    setWaveInProgress, setPlacingTroop, setTargetingSpell, setSpells,
    setGameSpeed, setGoldSpellActive, setInspectorActive,
    setSelectedInspectEnemy, setPreviousGameSpeed, setSpecialTowerHp,
    setLevelStartTime, setCameraOffset, setCameraZoom, setStarsEarned,
    setTimeSpent, setActiveSentinelTargetKey, setSentinelTargets,
    gameEndHandledRef, prevGameSpeedRef, pausedAtRef, totalPausedTimeRef,
    pausableTimeoutsRef, lastBarracksSpawnRef, lastSentinelStrikeRef,
    lastSunforgeBarrageRef, sunforgeAimRef, missileAutoAimRef,
    enemiesFirstAppearedRef, gameResetTimeRef,
  }), [clearAllTimers, setPawPoints, setEffects, setEnemies, setProjectiles, setTowers, setTroops]);

  const resetGame = useCallback(
    () => resetGameImpl(battleResetDeps, selectedMap),
    [battleResetDeps, selectedMap],
  );

  const retryLevel = useCallback(
    () => retryLevelImpl(battleResetDeps, selectedMap),
    [battleResetDeps, selectedMap],
  );

  const resetGameWithTransition = useCallback(() => {
    setSceneTransitioning(true);
    setIsFreeplay(false);
    resetGame();
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, [resetGame]);

  const quitLevel = useCallback(() => {
    setSceneTransitioning(true);
    setIsFreeplay(false);
    resetGame();
    setGameState("setup");
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, [resetGame]);

  const { devConfigMenu, handleDevModeChange } = useDevMenuSetup({
    isDevMode, gameState, battleOutcome, progress,
    devPerfEnabled, setDevPerfEnabled, devPerfSnapshot,
    photoModeEnabled, setPhotoModeEnabled,
    currentWave, totalWaves, waveInProgress,
    enemies, selectedMap,
    setProgress, addPawPoints, setLives,
    clearAllTimers, clearEnemies, onEnemyKill, unlockLevel,
    setHoveredWaveBubblePathKey, setWaveInProgress,
    setNextWaveTimer, setCurrentWave, setIsDevModeUnlocked,
  });

  const pendingStartWithRandomRef = useRef(false);
  const startWithRandomLoadout = useCallback(
    () => startWithRandomLoadoutImpl(
      selectedHero, selectedSpells, setSelectedHero, setSelectedSpells,
      pendingStartWithRandomRef, HERO_OPTIONS, SPELL_OPTIONS,
    ),
    [selectedHero, selectedSpells, setSelectedHero, setSelectedSpells],
  );

  freeplayStartRef.current = () => {
    setShowFreeplayDisclaimer(false);
    if (!selectedHero || selectedSpells.length < 3) {
      startWithRandomLoadout();
    } else {
      startBattle();
    }
  };

  useEffect(() => {
    if (pendingStartWithRandomRef.current && selectedHero && selectedSpells.length === 3) {
      pendingStartWithRandomRef.current = false;
      startBattle();
    }
  }, [selectedHero, selectedSpells, startBattle]);

  // Wrap setGameState to intercept "playing" transitions through loading screen
  const setGameStateWithLoading = useCallback(
    (state: GameState) => {
      if (state === "playing") {
        startBattle();
      } else {
        setGameState(state);
      }
    },
    [startBattle, setGameState],
  );

  // ── Phase 1: Blocking loading screen (gameState is still "menu"/"setup") ──
  // Visible until minDisplayMs elapses, then onReady sets gameState("playing").
  if (battleLoading.active && gameState !== "playing") {
    const levelData = LEVEL_DATA[selectedMap];
    const battleTheme = resolveLoadingTheme(levelData?.theme, levelData?.levelKind);
    return (
      <LoadingScreen
        progress={battleLoading.progress}
        loaded={battleLoading.loaded}
        total={battleLoading.total}
        context="battle"
        levelName={levelData?.name}
        theme={battleTheme}
        onBack={cancelBattle}
      />
    );
  }

  // ── Phase 1b: Level landing page (accessed level via direct URL) ──
  if (showFreeplayDisclaimer && (gameState === "menu" || gameState === "setup")) {
    return (
      <FreeplayDisclaimer
        levelId={selectedMap}
        isFreeplay={isFreeplay}
        onStart={() => freeplayStartRef.current()}
        onBack={handleFreeplayCancel}
      />
    );
  }

  // World map + loading overlay (WorldMap renders behind and initializes canvas while loading)
  if (gameState === "menu" || gameState === "setup") {
    return (
      <>
        <WorldMap
          setGameState={setGameStateWithLoading}
          setSelectedMap={setSelectedMap}
          selectedHero={selectedHero}
          setSelectedHero={setSelectedHero}
          selectedSpells={selectedSpells}
          setSelectedSpells={setSelectedSpells}
          availableSpellStars={availableSpellStars}
          totalSpellStarsEarned={totalStarsEarned}
          spentSpellStars={spentSpellStars}
          spellUpgradeLevels={spellUpgradeLevels}
          upgradeSpell={upgradeSpell}
          downgradeSpell={downgradeSpell}
          spellAutoAim={spellAutoAim}
          onToggleSpellAutoAim={toggleSpellAutoAim}
          unlockedMaps={unlockedMaps}
          levelStars={levelStars}
          levelStats={levelStats}
          customLevels={customLevels}
          onSaveCustomLevel={upsertCustomLevel}
          onDeleteCustomLevel={deleteCustomLevel}
          gameState={gameState}
          onStartWithRandomLoadout={startWithRandomLoadout}
          isDevMode={isDevMode}
          onDevModeChange={handleDevModeChange}
          onFreeplayRequest={handleFreeplayRequest}
        />
        {devConfigMenu}
        <LoadingOverlay visible={!worldMapPreload.isReady}>
          <LoadingScreen
            progress={worldMapPreload.progress}
            loaded={worldMapPreload.loaded}
            total={worldMapPreload.total}
            context="worldmap"
          />
        </LoadingOverlay>
        <SceneTransitionOverlay visible={sceneTransitioning} />
      </>
    );
  }
  // Main game view (battle overlay stays on top without leaving this view)
  const { width, height, dpr } = getCanvasDimensions();
  const selectedLevelData = LEVEL_DATA[selectedMap];
  const { fadeOverlayBackground, levelAllowedTowers } = computeBattleTheme(selectedMap);
  const currentLevelStats = levelStats?.[selectedMap] || {};

  return (
    <>
      <BattleUI
        canvasRef={canvasRef}
        bgCanvasRef={bgCanvasRef}
        backdropCanvasRef={backdropCanvasRef}
        containerRef={containerRef}
        isTouchDeviceRef={isTouchDeviceRef}
        width={width}
        height={height}
        dpr={dpr}
        handlePointerDown={handlePointerDown}
        handleCanvasClick={handleCanvasClick}
        handleMouseMove={handleMouseMove}
        handleCanvasPointerLeave={handleCanvasPointerLeave}
        fadeOverlayBackground={fadeOverlayBackground}
        isPanning={isPanning}
        repositioningTower={repositioningTower}
        hoveredWaveBubblePathKey={hoveredWaveBubblePathKey}
        selectedMap={selectedMap}
        battleOutcome={battleOutcome}
        isFreeplay={isFreeplay}
        pauseLocked={pauseLocked}
        cameraModeActive={cameraModeActive}
        pawPoints={pawPoints}
        lives={lives}
        currentWave={currentWave}
        totalWaves={totalWaves}
        gameSpeed={gameSpeed}
        setGameSpeed={setGameSpeed}
        goldSpellActive={goldSpellActive}
        paydayEndTime={paydayEndTime}
        paydayPawPointsEarned={paydayPawPointsEarned}
        hexWardEndTime={hexWardEndTime}
        hexWardTargetCount={hexWardTargetCount}
        hexWardRaiseCap={hexWardRaiseCap}
        hexWardRaisesRemaining={hexWardRaisesRemaining}
        hexWardDamageAmpPct={hexWardDamageAmpPct}
        hexWardBlocksHealing={hexWardBlocksHealing}
        eatingClubIncomeEvents={eatingClubIncomeEvents}
        onEatingClubEventComplete={(id) =>
          setEatingClubIncomeEvents((prev) => prev.filter((e) => e.id !== id))
        }
        bountyIncomeEvents={bountyIncomeEvents}
        onBountyEventComplete={(id) =>
          setBountyIncomeEvents((prev) => prev.filter((e) => e.id !== id))
        }
        leakedBountyEvents={leakedBountyEvents}
        onLeakedBountyEventComplete={(id) =>
          setLeakedBountyEvents((prev) => prev.filter((e) => e.id !== id))
        }
        inspectorActive={inspectorActive}
        setInspectorActive={setInspectorActive}
        selectedInspectEnemy={selectedInspectEnemy}
        setSelectedInspectEnemy={setSelectedInspectEnemy}
        selectedInspectTroop={selectedInspectTroop}
        setSelectedInspectTroop={setSelectedInspectTroop}
        selectedInspectHero={selectedInspectHero}
        setSelectedInspectHero={setSelectedInspectHero}
        hoveredInspectDecoration={hoveredInspectDecoration}
        quitLevel={quitLevel}
        retryLevel={retryLevel}
        onTogglePhotoMode={toggleCameraMode}
        onToggleDevMenu={() => setDevMenuOpen((p) => !p)}
        devMenuOpen={devMenuOpen}
        setCameraOffset={setCameraOffset}
        setCameraZoom={setCameraZoom}
        cameraOffset={cameraOffset}
        cameraZoom={cameraZoom}
        selectedLevelData={selectedLevelData}
        handleCameraModeCapture={handleCameraModeCapture}
        exitCameraMode={exitCameraMode}
        towers={towers}
        setTowers={setTowers}
        enemies={enemies}
        troops={troops}
        setTroops={setTroops}
        hero={hero}
        spells={spells}
        spellUpgradeLevels={spellUpgradeLevels}
        selectedTower={selectedTower}
        setSelectedTower={setSelectedTower}
        hoveredTower={hoveredTower}
        setHoveredTower={setHoveredTower}
        hoveredHero={hoveredHero}
        mousePos={mousePos}
        upgradeTower={upgradeTower}
        sellTower={sellTower}
        setMissileMortarTargetingId={setMissileMortarTargetingId}
        placingTroop={placingTroop}
        targetingSpell={targetingSpell}
        activeSentinelTargetKey={activeSentinelTargetKey}
        missileMortarTargetingId={missileMortarTargetingId}
        hoveredSpecialTower={hoveredSpecialTower}
        specialTowerHp={specialTowerHp}
        sentinelTargets={sentinelTargets}
        getSpecialTowerKey={getSpecialTowerKey}
        hoveredLandmark={hoveredLandmark}
        hoveredHazardType={hoveredHazardType}
        previousGameSpeed={previousGameSpeed}
        setPreviousGameSpeed={setPreviousGameSpeed}
        showTutorial={showTutorial}
        encounterQueue={encounterQueue}
        encounterIndex={encounterIndex}
        encounterExiting={encounterExiting}
        encounterAutoDismissMs={ENCOUNTER_AUTO_DISMISS_MS}
        handleEncounterAcknowledge={handleEncounterAcknowledge}
        devConfigMenu={devConfigMenu}
        gameEventLog={gameEventLog}
        setDevMenuOpen={setDevMenuOpen}
        spellAutoAim={spellAutoAim}
        toggleSpellAutoAim={toggleSpellAutoAim}
        toggleHeroSelection={toggleHeroSelection}
        triggerHeroAbility={triggerHeroAbility}
        castSpell={castSpell}
        buildingTower={buildingTower}
        setBuildingTower={setBuildingTower}
        setIsBuildDragging={setIsBuildDragging}
        setHoveredBuildTower={setHoveredBuildTower}
        setDraggingTower={setDraggingTower}
        handleBuildTouchDragMove={handleBuildTouchDragMove}
        handleBuildTouchDragEnd={handleBuildTouchDragEnd}
        levelAllowedTowers={levelAllowedTowers}
        levelStartTime={levelStartTime}
        totalPausedTimeRef={totalPausedTimeRef}
        starsEarned={starsEarned}
        timeSpent={timeSpent}
        currentLevelStats={currentLevelStats}
        resetGame={resetGameWithTransition}
        handleTutorialComplete={handleTutorialComplete}
        handleTutorialSkip={handleTutorialSkip}
        selectedHero={selectedHero}
        selectedSpells={selectedSpells}
        handleTutorialHeroChange={handleTutorialHeroChange}
        handleTutorialSpellToggle={handleTutorialSpellToggle}
      />
      <LoadingOverlay visible={battleLoading.active} fadeDurationMs={600}>
        <LoadingScreen
          progress={battleLoading.progress}
          loaded={battleLoading.loaded}
          total={battleLoading.total}
          context="battle"
          levelName={selectedLevelData?.name}
          theme={resolveLoadingTheme(selectedLevelData?.theme, selectedLevelData?.levelKind)}
        />
      </LoadingOverlay>
    </>
  );
}
