"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
// Types
import type {
  Position,
  Tower,
  Enemy,
  EnemyType,
  Hero,
  Troop,
  Spell,
  Projectile,
  Effect,
  EffectType,
  Particle,
  TowerType,
  TroopType,
  HeroType,
  SpellType,
  GameState,
  LevelStars,
  DraggingTower,
  Renderable,
  DecorationType,
  DecorationHeightTag,
  SpecialTower,
  SpellUpgradeLevels,
  DeathCause,
} from "../types";
// Constants
import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  TOWER_DATA,
  ENEMY_DATA,
  HERO_DATA,
  SPELL_DATA,
  DEFAULT_SPELL_UPGRADES,
  MAP_PATHS,
  HERO_PATH_HITBOX_SIZE,
  TOWER_PLACEMENT_BUFFER,
  INITIAL_PAW_POINTS,
  INITIAL_LIVES,
  WAVE_TIMER_BASE,
  HERO_RESPAWN_TIME,
  HERO_ABILITY_COOLDOWNS,
  PARTICLE_COLORS,
  TROOP_DATA,
  LEVEL_DATA,
  REGION_THEMES,
  MAX_STATION_TROOPS,
  HERO_OPTIONS,
  SPELL_OPTIONS,
  MAX_SPELL_UPGRADE_LEVEL,
  normalizeSpellUpgradeLevels,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
  getNextSpellUpgradeCost,
  getSpentSpellUpgradeStars,
  getLevelPathKeys,
  ISO_Y_FACTOR,
  ISO_Y_RATIO,
} from "../constants";
// Utils
import {
  gridToWorld,
  gridToWorldPath,
  worldToScreen,
  screenToWorld,
  screenToGrid,
  distance,
  isValidBuildPosition,
  generateId,
  getPathSegmentLength,
  findClosestPathPoint,
  findClosestPathPointWithinRadius,
  getTroopMoveInfo,
  hexToRgb,
  type TroopMoveInfo,
  LANDMARK_DECORATION_TYPES,
  LANDMARK_HITBOX_Y_OFFSET,
  BACKGROUND_BLOCKING_DECORATION_TYPES,
  getMapDecorationWorldPos,
  getDecorationVolumeSpec,
  getLandmarkSpawnExclusion,
  resolveMapDecorationRuntimePlacement,
} from "../utils";
// Tower Stats
import { calculateTowerStats, getUpgradeCost } from "../constants/towerStats";
// Game logic
import {
  clampLaneOffset,
  clampLaneIndex,
  getNearestLaneIndex,
  pickFormationPattern,
  getFormationLaneIndex,
  ENEMY_LANE_OFFSETS,
  ENEMY_CENTER_LANE_INDEX,
  ENEMY_SPAWN_LANE_JITTER,
  ENEMY_REPULSION_PROGRESS_RADIUS,
  ENEMY_REPULSION_LATERAL_STRENGTH,
  ENEMY_FORMATION_PULL_STRENGTH,
  ENEMY_LANE_SHIFT_MS,
} from "../game/enemyFormation";
import { applyEnemyAbilities } from "../game/enemyAbilities";
import { findClosestRoadPoint } from "../game/barracks";
import {
  getPrioritizedEnemiesInRange,
  getClosestEnemyInRange,
  getTroopCellKey,
  findNearestTroopInRange,
  getVaultImpactPos,
} from "../game/targeting";
import { createEnemyPosCache } from "../game/enemyPosition";
import { getImpactEffect } from "../game/projectileEffects";
import { addOrRefreshDebuff } from "../game/debuffs";
import {
  isInSpecialTowerZone,
  isInLandmarkCore,
  isInLandmarkFull,
  type LandmarkZone,
} from "../game/zoneUtils";
import {
  CAMPAIGN_LEVEL_UNLOCKS,
  REGION_CAMPAIGN_LEVELS,
  REGION_CHALLENGE_UNLOCKS,
  CHALLENGE_LEVEL_UNLOCKS,
  isRegionCleared,
  type RegionKey,
} from "../game/progression";
import { buildPathSegments, minDistanceToPath, type PathSegment } from "../utils/pathUtils";
import { createSeededRandom } from "../utils/seededRandom";
import { darkenRgbChannel } from "../utils/colorUtils";
import { DecorationSpatialGrid, getExclusionRadius } from "../utils/decorationSpacing";
import {
  getDecorationRenderLayer,
  getDecorationIsoY,
  getRuntimeDecorationHeightTag,
  getLayerPriority,
  getSourcePriority,
  type RuntimeDecoration,
} from "../rendering/decorations/decorationHelpers";
import {
  getOcclusionState,
  type CachedVisibleDecoration,
  type OcclusionAnchor,
} from "../rendering/decorations/occlusion";
import { drawTriangle, drawRoundedRect } from "../rendering/utils/drawUtils";
// Rendering
import {
  renderTower,
  renderTowerGroundTransition,
  getTowerFoundationSize,
  renderEnemy,
  renderHero,
  renderTroop,
  renderProjectile,
  renderEffect,
  renderParticle,
  renderTowerPreview,
  renderStationRange,
  renderTowerRange,
  renderEnvironment,
  renderAmbientVisuals,
  renderHazard,
  renderSpecialBuilding,
  renderTroopMoveRange,
  renderPathTargetIndicator,
  renderEnemyInspectIndicator,
  renderTowerDebuffEffects,
  renderUnitStatusEffects,
  renderUnitInspectIndicator,
  renderMissileTargetReticle,
  setProjectileRenderTime,
  initParticlePool,
  acquireParticle,
  updateParticlePool,
  getActiveParticles,
  getActiveParticleCount,
  clearParticlePool,
  enforceParticleCap,
  drawRoadEndFog,
  computeFogCounts,
} from "../rendering";
import { renderEnemyDeath } from "../rendering/effects/deathAnimations";
import {
  getWaveStartBubblesScreenData as computeWaveStartBubbles,
  drawWaveStartBubble,
  WAVE_START_BUBBLE_HIT_RADIUS,
  type WaveStartBubbleScreenData,
} from "../rendering/ui/waveStartBubble";
// Decoration rendering
import { renderDecorationItem } from "../rendering/decorations";
import { getDecorationCategories } from "../rendering/decorations/decorationCategories";
import { renderDecorationTransitions, renderSpecialTowerTransitions } from "../rendering/decorations/landmarkTransition";
import {
  renderStaticMapLayer,
  type StaticMapFogEndpoint,
} from "../rendering/maps/staticLayer";
import { setPerformanceSettings } from "../rendering/performance";
import { getGameSettings, getSettingsVersion } from "./useSettings";
import {
  DECORATION_DENSITY_MULTIPLIER,
  TREE_CLUSTER_COUNT,
  GROVE_COUNT,
  VILLAGE_COUNT,
  BATTLE_DEBRIS_COUNT,
  DECORATION_SCALE_RANGE,
} from "../constants/settings";
import {
  getChallengePathSegments,
  isWorldPosInChallengeDecorationFootprint,
} from "../rendering/maps/challengeTerrain";
// Hazard game logic
import { calculateHazardEffects, applyHazardEffect } from "../game/hazards";
import { getEnemyDamageTaken } from "../game/combat";
import {
  TROOP_RESPAWN_TIME,
  TROOP_SEPARATION_DIST,
  TROOP_SIGHT_RANGE,
  TROOP_RANGED_SIGHT_RANGE,
  HERO_SIGHT_RANGE,
  HERO_RANGED_SIGHT_RANGE,
  MELEE_RANGE,
  ENEMY_SPEED_MODIFIER,
  DEFAULT_CAMERA_OFFSET,
  DEFAULT_CAMERA_ZOOM,
  ALLY_ALERT_RANGE,
  getEnemyPosWithPath,
  getFormationOffsets,
  getTowerHitboxRadius,
  getLevelWaves,
  getBlockedPositionsForMap,
  getLevelStartingPawPoints,
  getLevelSpecialTowerHp,
  getLevelSpecialTowers,
  getLevelAllowedTowers,
} from "../game/pageHelpers";
import {
  clampPositionToRadius,
  computeSeparationForces,
  getFacingRightFromDelta,
  stepTowardTarget,
} from "../game/unitMovement";
import { findAllyAlertTarget } from "../game/allyAlert";
import {
  resetBattleState,
  type PausableTimeoutEntry,
} from "../game/resetBattleState";

// Components
import { WorldMap } from "../components/menus/WorldMap";
import {
  VictoryScreen,
  calculateCategoryRatings,
} from "../components/menus/VictoryScreen";
import { DefeatScreen } from "../components/menus/DefeatScreen";
import {
  TopHUD,
  DevConfigMenu,
  CameraControls,
  HeroSpellBar,
  BuildMenu,
  TowerUpgradePanel,
  TowerHoverTooltip,
  PlacingTroopIndicator,
  TargetingSpellIndicator,
  SpecialBuildingTooltip,
  LandmarkTooltip,
  HazardTooltip,
  HeroHoverTooltip,
  EnemyInspector,
  EnemyDetailTooltip,
  TroopDetailTooltip,
  HeroDetailTooltip,
} from "../components/ui/GameUI";
// Hooks
import {
  useGameProgress,
  DEFAULT_GAME_PROGRESS,
  type GameProgress,
} from "../useLocalStorage";
import { useCustomLevels } from "./useCustomLevels";
import { useEntityCollection } from "./useEntityCollection";
import { usePawPoints } from "./usePawPoints";
import { captureCanvas } from "../utils/screenshot";
import { CameraModeOverlay } from "../components/ui/CameraModeOverlay";

type RenderQuality = "high" | "medium" | "low";

interface StaticMapLayerCache {
  key: string;
  canvas: HTMLCanvasElement;
  fogEndpoints: StaticMapFogEndpoint[];
}

interface StaticDecorationLayerCache {
  key: string;
  canvas: HTMLCanvasElement | null;
  backgroundDecorations: CachedVisibleDecoration[];
  animatedDecorations: CachedVisibleDecoration[];
  depthSensitiveDecorations: CachedVisibleDecoration[];
}

interface AmbientLayerCache {
  key: string;
  canvas: HTMLCanvasElement | null;
  renderedAtMs: number;
}

interface DevPerfSnapshot {
  fps: number;
  frameMs: number;
  updateMs: number;
  renderMs: number;
  quality: RenderQuality;
  towers: number;
  enemies: number;
  troops: number;
  projectiles: number;
  effects: number;
  particles: number;
}

interface ParticleBurstRequest {
  pos: Position;
  type: Particle["type"];
  count: number;
}

interface WaveStartConfirmState {
  mapId: string;
  waveIndex: number;
  pathKey: string;
  openedAt: number;
}

interface WavePreviewEnemyEntry {
  type: EnemyType;
  name: string;
  color: string;
  count: number;
}


type BattleOutcome = "victory" | "defeat";

type DraggingUnitState =
  | {
    kind: "hero";
    heroId: string;
  }
  | {
    kind: "troop";
    troopId: string;
    ownerId: string;
  };

const QUALITY_DPR_CAP: Record<RenderQuality, number> = {
  high: 4,
  medium: 4,
  low: 4,
};

const QUALITY_DECORATION_MARGIN_PX: Record<RenderQuality, number> = {
  high: 260,
  medium: 260,
  low: 260,
};

const QUALITY_SHADOW_MULTIPLIER: Record<RenderQuality, number> = {
  high: 1,
  medium: 0.6,
  low: 0.35,
};

const CAMERA_ZOOM_MIN = 0.5;
const CAMERA_ZOOM_MAX = 2.5;
const WHEEL_ZOOM_SENSITIVITY = 0.0014;
const TRACKPAD_PINCH_ZOOM_SENSITIVITY = 0.0022;
const FRIENDLY_SEPARATION_MULT = 0.18;


// All decoration types that use decorTime for animation.  At high quality they
// animate live; at lower quality the stride-based freeze bakes them into the
// static decoration canvas so they stay visible but stop animating.
const RUNTIME_ANIMATED_DECORATION_TYPES = new Set<string>([
  // Fire / light
  "torch",
  "fire",
  "fire_pit",
  "campfire",
  "lamppost",
  "ember",
  "ember_rock",
  "fire_crystal",
  "charred_tree",
  // Water / liquid
  "fountain",
  "lava_pool",
  "lava_fall",
  "deep_water",
  "poison_pool",
  "lake",
  "algae_pool",
  "fishing_spot",
  "frozen_pond",
  "frozen_waterfall",
  "sunken_pillar",
  "dock",
  "lily_pad",
  // Ice / snow
  "ice_crystal",
  "snow_pile",
  "glacier",
  "ice_fortress",
  "ice_spire",
  "ice_throne",
  "icicles",
  "frozen_soldier",
  "aurora_crystal",
  "snow_lantern",
  "snowman",
  "ice_bridge",
  "frost_citadel",
  // Volcanic / dark
  "volcano_rim",
  "obsidian_castle",
  "dark_barracks",
  "dark_throne",
  "dark_spire",
  "obsidian_pillar",
  "skull_throne",
  "infernal_gate",
  // Swamp / nature
  "swamp_tree",
  "mushroom",
  "fog_wisp",
  "cauldron",
  "tentacle",
  "reeds",
  // Desert / exotic
  "cobra_statue",
  "pyramid",
  "obelisk",
  "dune",
  // Structures / misc
  "hut",
  "tent",
  "signpost",
  "treasure_chest",
  "hanging_cage",
  "statue",
  "idol_statue",
  "war_monument",
  "bone_altar",
  "sun_obelisk",
  "glowing_runes",
  // Flora (common – will freeze first under stride)
  "grass",
  "flowers",
]);

// Landmark/hero decorations that should never pop in and out due stride throttling.
const NON_THROTTLED_ANIMATED_DECORATION_TYPES = new Set<string>([
  "fountain",
  "lava_fall",
  "tentacle",
]);

// Tall/occluding decorations that need proper depth interleave with units near the path.
const DEPTH_SENSITIVE_DECORATION_TYPES = new Set<string>([
  "tree",
  "pine_tree",
  "pine",
  "palm",
  "swamp_tree",
  "charred_tree",
  "mushroom",
  "hut",
  "building",
  "tent",
  "fence",
  "cart",
  "barrel",
  "bench",
  "ruins",
  "broken_wall",
  "broken_bridge",
  "gate",
  "dock",
  "statue",
  "obelisk",
  "pyramid",
  "sphinx",
  "giant_sphinx",
  "nassau_hall",
  "carnegie_lake",
  "glacier",
  "ice_fortress",
  "ice_throne",
  "obsidian_castle",
  "witch_cottage",
  "volcano_rim",
  "skull_throne",
  "obsidian_pillar",
  "hanging_cage",
  "idol_statue",
  "war_monument",
  "bone_altar",
  "sun_obelisk",
  "frost_citadel",
  "infernal_gate",
  "ice_bridge",
  "tombstone",
]);

// Some oversized landmarks should always interleave by depth, regardless of path proximity.
const ALWAYS_DEPTH_SENSITIVE_DECORATION_TYPES = new Set<DecorationType>([
  "nassau_hall",
  "carnegie_lake",
  "ruins",
  "sunken_pillar",
  "war_monument",
  "bone_altar",
  "sun_obelisk",
  "frost_citadel",
  "infernal_gate",
]);
const DEPTH_SENSITIVE_PATH_DISTANCE = 180;


const QUALITY_TRANSITION_COOLDOWN_MS = 1500;
const DEV_CONFIG_ENV_VALUE = process.env.NEXT_PUBLIC_TD_DEV_PERF;
const DEV_CONFIG_MENU_ENABLED =
  typeof DEV_CONFIG_ENV_VALUE === "string" &&
  DEV_CONFIG_ENV_VALUE.trim() === "1";
const DEV_PERF_STORAGE_KEY = "ptd:dev-perf-overlay-enabled";

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function usePrincetonTowerDefenseRuntime() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("menu");
  const [selectedMap, setSelectedMap] = useState<string>("poe");
  const [selectedHero, setSelectedHero] = useState<HeroType | null>("tiger");
  const [selectedSpells, setSelectedSpells] = useState<SpellType[]>([]);

  // Persistent progress (saved to localStorage)
  const {
    progress,
    setProgress,
    updateLevelStars,
    updateLevelStats,
    unlockLevel,
  } = useGameProgress();
  const { customLevels, upsertCustomLevel, deleteCustomLevel } = useCustomLevels();
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
    const pendingUnlocks: string[] = [];
    (Object.keys(REGION_CAMPAIGN_LEVELS) as Array<
      RegionKey
    >).forEach((regionKey) => {
      if (!isRegionCleared(regionKey, levelStars)) return;
      REGION_CHALLENGE_UNLOCKS[regionKey].forEach((challengeLevel) => {
        if (unlockedMaps.includes(challengeLevel)) return;
        if (pendingUnlocks.includes(challengeLevel)) return;
        pendingUnlocks.push(challengeLevel);
      });
    });

    Object.entries(CHALLENGE_LEVEL_UNLOCKS).forEach(
      ([completedChallengeId, unlockedChallengeId]) => {
        if ((levelStars[completedChallengeId] || 0) <= 0) return;
        if (unlockedMaps.includes(unlockedChallengeId)) return;
        pendingUnlocks.push(unlockedChallengeId);
      }
    );

    if (pendingUnlocks.length === 0) return;
    pendingUnlocks.forEach((levelId) => unlockLevel(levelId));
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
  const [nextWaveTimer, setNextWaveTimer] = useState(WAVE_TIMER_BASE);
  const [waveInProgress, setWaveInProgress] = useState(false);
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
    const reinforcementStats = getReinforcementSpellStats(
      spellUpgradeLevels.reinforcements
    );
    setTroops((prev) => {
      let changed = false;
      const next = prev.map((troop) => {
        if (!troop.ownerId.startsWith("spell") || troop.type !== "knight") return troop;
        const hpPercent = troop.maxHp > 0 ? troop.hp / troop.maxHp : 1;
        const nextMaxHp = reinforcementStats.knightHp;
        const nextHp = Math.max(
          1,
          Math.min(nextMaxHp, Math.round(nextMaxHp * hpPercent))
        );
        const shouldUpdate =
          troop.overrideDamage !== reinforcementStats.knightDamage ||
          troop.overrideAttackSpeed !== reinforcementStats.knightAttackSpeedMs ||
          troop.overrideIsRanged !== reinforcementStats.rangedUnlocked ||
          (troop.overrideRange ?? 0) !==
          (reinforcementStats.rangedUnlocked
            ? reinforcementStats.rangedRange
            : 0) ||
          troop.overrideCanTargetFlying !== reinforcementStats.rangedUnlocked ||
          troop.overrideHybridMelee !== reinforcementStats.rangedUnlocked ||
          troop.visualTier !== reinforcementStats.visualTier ||
          troop.maxHp !== nextMaxHp ||
          troop.moveRadius !== reinforcementStats.moveRadius;

        if (!shouldUpdate) return troop;
        changed = true;
        return {
          ...troop,
          hp: nextHp,
          maxHp: nextMaxHp,
          moveRadius: reinforcementStats.moveRadius,
          overrideDamage: reinforcementStats.knightDamage,
          overrideAttackSpeed: reinforcementStats.knightAttackSpeedMs,
          overrideIsRanged: reinforcementStats.rangedUnlocked,
          overrideRange: reinforcementStats.rangedUnlocked
            ? reinforcementStats.rangedRange
            : undefined,
          overrideCanTargetFlying: reinforcementStats.rangedUnlocked,
          overrideHybridMelee: reinforcementStats.rangedUnlocked,
          visualTier: reinforcementStats.visualTier,
        };
      });
      return changed ? next : prev;
    });
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
  // Special Objectives State
  const [specialTowerHp, setSpecialTowerHp] = useState<number | null>(null);
  const [vaultFlash, setVaultFlash] = useState(0);
  // HUD Animation state
  const [goldSpellActive, setGoldSpellActive] = useState(false);
  // Eating club income events for stacking floaters
  const [eatingClubIncomeEvents, setEatingClubIncomeEvents] = useState<Array<{ id: string; amount: number }>>([]);
  // Bounty income events (from enemy kills)
  const [bountyIncomeEvents, setBountyIncomeEvents] = useState<Array<{ id: string; amount: number; isGoldBoosted: boolean }>>([]);
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
  const [devPerfEnabled, setDevPerfEnabled] = useState<boolean>(
    () => DEV_CONFIG_MENU_ENABLED
  );
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
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchTimeRef = useRef<number>(0); // Track touch to prevent duplicate click events
  const isTouchDeviceRef = useRef<boolean>(false); // Track if user is using touch input
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastGestureScaleRef = useRef<number | null>(null);
  const renderQualityRef = useRef<RenderQuality>("high");
  const rollingFrameMsRef = useRef<number>(16.7);
  const qualityLastChangedAtRef = useRef<number>(0);
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

  // Wave Management Refs
  const spawnIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Pausable timer system - tracks remaining time when paused
  const gameSpeedRef = useRef(gameSpeed);
  gameSpeedRef.current = gameSpeed;
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  // Track pausable timeouts: { id, callback, remainingTime, startedAt }
  const pausableTimeoutsRef = useRef<PausableTimeoutEntry[]>([]);
  const pausableTimeoutIdCounter = useRef(0);

  // Refs for current state values to avoid stale closures in callbacks
  const towersRef = useRef(towers);
  const pawPointsRef = useRef(pawPoints);
  towersRef.current = towers;
  pawPointsRef.current = pawPoints;

  // Track last spawn time for frontier barracks to prevent double-spawning on restart
  const lastBarracksSpawnRef = useRef<number>(0);
  // Track per-structure strike cooldowns for sentinel nexus challenge towers
  const lastSentinelStrikeRef = useRef<Map<string, number>>(new Map());
  // Track per-structure cadence for orange sunforge offensive barrages.
  const lastSunforgeBarrageRef = useRef<Map<string, number>>(new Map());
  const sentinelTargetsRef = useRef<Record<string, Position>>({});
  // Track when game was reset to prevent stale state race conditions
  const gameResetTimeRef = useRef<number>(0);
  sentinelTargetsRef.current = sentinelTargets;

  const getSpecialTowerKey = useCallback(
    (tower: Pick<SpecialTower, "type" | "pos">): string =>
      `${selectedMap}:${tower.type}:${tower.pos.x.toFixed(2)}:${tower.pos.y.toFixed(2)}`,
    [selectedMap]
  );

  const clampWorldToMapBounds = useCallback((worldPos: Position): Position => {
    const min = TILE_SIZE * 0.5;
    const maxX = GRID_WIDTH * TILE_SIZE - TILE_SIZE * 0.5;
    const maxY = GRID_HEIGHT * TILE_SIZE - TILE_SIZE * 0.5;
    return {
      x: Math.max(min, Math.min(maxX, worldPos.x)),
      y: Math.max(min, Math.min(maxY, worldPos.y)),
    };
  }, []);

  const getRandomMapTarget = useCallback((): Position => {
    const margin = TILE_SIZE;
    const minX = margin;
    const minY = margin;
    const maxX = GRID_WIDTH * TILE_SIZE - margin;
    const maxY = GRID_HEIGHT * TILE_SIZE - margin;
    return {
      x: minX + Math.random() * Math.max(1, maxX - minX),
      y: minY + Math.random() * Math.max(1, maxY - minY),
    };
  }, []);

  // Get current level waves - computed from selectedMap
  const currentLevelWaves = getLevelWaves(selectedMap);
  const totalWaves = currentLevelWaves.length;
  const activeWaveSpawnPaths = React.useMemo<string[]>(() => {
    return getLevelPathKeys(selectedMap);
  }, [selectedMap]);

  const incomingWavePreviewByPath = React.useMemo<Map<string, WavePreviewEnemyEntry[]>>(() => {
    const nextWave = currentLevelWaves[currentWave];
    const groupedCounts = new Map<string, Map<EnemyType, number>>();
    for (const pathKey of activeWaveSpawnPaths) {
      groupedCounts.set(pathKey, new Map<EnemyType, number>());
    }
    if (!nextWave) {
      return new Map<string, WavePreviewEnemyEntry[]>();
    }

    const addEnemyCount = (pathKey: string, enemyType: EnemyType, count: number) => {
      if (count <= 0) return;
      const pathMap = groupedCounts.get(pathKey);
      if (!pathMap) return;
      pathMap.set(enemyType, (pathMap.get(enemyType) ?? 0) + count);
    };

    for (const group of nextWave) {
      const pathCount = Math.max(1, activeWaveSpawnPaths.length);
      const baseCount = Math.floor(group.count / pathCount);
      const remainder = group.count % pathCount;
      for (let i = 0; i < pathCount; i++) {
        const pathKey = activeWaveSpawnPaths[i];
        if (!pathKey) continue;
        const count = baseCount + (i < remainder ? 1 : 0);
        addEnemyCount(pathKey, group.type, count);
      }
    }

    const previewByPath = new Map<string, WavePreviewEnemyEntry[]>();
    for (const pathKey of activeWaveSpawnPaths) {
      const countByType = groupedCounts.get(pathKey) ?? new Map<EnemyType, number>();
      const entries = Array.from(countByType.entries())
        .map(([type, count]) => {
          const enemyData = ENEMY_DATA[type];
          return {
            type,
            count,
            name: enemyData?.name ?? type,
            color: enemyData?.color ?? "#f87171",
          };
        })
        .sort((a, b) => {
          const aBoss = ENEMY_DATA[a.type]?.isBoss ? 1 : 0;
          const bBoss = ENEMY_DATA[b.type]?.isBoss ? 1 : 0;
          return bBoss - aBoss || b.count - a.count || a.name.localeCompare(b.name);
        });
      previewByPath.set(pathKey, entries);
    }

    return previewByPath;
  }, [currentLevelWaves, currentWave, activeWaveSpawnPaths]);

  const blockedPositions = React.useMemo(
    () => getBlockedPositionsForMap(selectedMap),
    [selectedMap]
  );

  const getRenderDpr = useCallback(() => {
    if (typeof window === "undefined") return 1;
    return Math.min(window.devicePixelRatio || 1, renderDprCap);
  }, [renderDprCap]);

  // Helper to get canvas dimensions
  const getCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const dpr = getRenderDpr();
    return {
      width: canvas ? canvas.width : 1000,
      height: canvas ? canvas.height : 600,
      dpr,
    };
  }, [getRenderDpr]);

  const zoomCameraAtClientPoint = useCallback(
    (clientX: number, clientY: number, zoomFactor: number) => {
      if (!Number.isFinite(zoomFactor) || zoomFactor <= 0) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const { width, height, dpr } = getCanvasDimensions();
      const viewWidth = width / dpr;
      const viewHeight = height / dpr;

      setCameraZoom((prevZoom) => {
        const nextZoom = Math.max(
          CAMERA_ZOOM_MIN,
          Math.min(CAMERA_ZOOM_MAX, prevZoom * zoomFactor)
        );

        if (Math.abs(nextZoom - prevZoom) < 0.0001) {
          return prevZoom;
        }

        const centerX = viewWidth / 2;
        const centerY = viewHeight / 3;
        const zoomDelta = 1 / nextZoom - 1 / prevZoom;

        setCameraOffset((prevOffset) => ({
          x: prevOffset.x + (x - centerX) * zoomDelta,
          y: prevOffset.y + (y - centerY) * zoomDelta,
        }));

        return nextZoom;
      });
    },
    [getCanvasDimensions]
  );

  const handleCanvasWheelNative = useCallback(
    (e: WheelEvent) => {
      if (gameState !== "playing" || battleOutcome) return;
      e.preventDefault();

      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        delta *= 16;
      } else if (e.deltaMode === 2) {
        delta *= 120;
      }

      const normalizedDelta = Math.max(-600, Math.min(600, delta));
      const sensitivity = e.ctrlKey
        ? TRACKPAD_PINCH_ZOOM_SENSITIVITY
        : WHEEL_ZOOM_SENSITIVITY;
      const zoomFactor = Math.exp(-normalizedDelta * sensitivity);

      zoomCameraAtClientPoint(e.clientX, e.clientY, zoomFactor);
    },
    [gameState, battleOutcome, zoomCameraAtClientPoint]
  );

  useEffect(() => {
    if (gameState !== "playing" || battleOutcome) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleGestureStart = (event: Event) => {
      event.preventDefault();
      const gestureEvent = event as Event & { scale?: number };
      lastGestureScaleRef.current = gestureEvent.scale ?? 1;
    };

    const handleGestureChange = (event: Event) => {
      event.preventDefault();
      const gestureEvent = event as Event & {
        scale?: number;
        clientX?: number;
        clientY?: number;
      };
      const currentScale = gestureEvent.scale ?? 1;
      const previousScale = lastGestureScaleRef.current ?? currentScale;

      if (
        !Number.isFinite(currentScale) ||
        currentScale <= 0 ||
        !Number.isFinite(previousScale) ||
        previousScale <= 0
      ) {
        return;
      }

      const zoomFactor = currentScale / previousScale;
      if (Math.abs(zoomFactor - 1) < 0.0005) return;

      const rect = canvas.getBoundingClientRect();
      const clientX =
        typeof gestureEvent.clientX === "number"
          ? gestureEvent.clientX
          : rect.left + rect.width / 2;
      const clientY =
        typeof gestureEvent.clientY === "number"
          ? gestureEvent.clientY
          : rect.top + rect.height / 2;

      zoomCameraAtClientPoint(clientX, clientY, zoomFactor);
      lastGestureScaleRef.current = currentScale;
    };

    const handleGestureEnd = (event: Event) => {
      event.preventDefault();
      lastGestureScaleRef.current = null;
    };

    canvas.addEventListener("wheel", handleCanvasWheelNative, { passive: false });
    canvas.addEventListener("gesturestart", handleGestureStart as EventListener, {
      passive: false,
    });
    canvas.addEventListener("gesturechange", handleGestureChange as EventListener, {
      passive: false,
    });
    canvas.addEventListener("gestureend", handleGestureEnd as EventListener, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("wheel", handleCanvasWheelNative);
      canvas.removeEventListener("gesturestart", handleGestureStart as EventListener);
      canvas.removeEventListener("gesturechange", handleGestureChange as EventListener);
      canvas.removeEventListener("gestureend", handleGestureEnd as EventListener);
      lastGestureScaleRef.current = null;
    };
  }, [gameState, battleOutcome, zoomCameraAtClientPoint, handleCanvasWheelNative]);

  useEffect(() => {
    cachedStaticDecorationLayerRef.current = null;
    cachedAmbientLayerRef.current = null;
  }, [selectedMap]);

  // Timer Cleanup Helper
  const clearAllTimers = useCallback(() => {
    spawnIntervalsRef.current.forEach(clearInterval);
    spawnIntervalsRef.current = [];
    activeTimeoutsRef.current.forEach(clearTimeout);
    activeTimeoutsRef.current = [];
    // Also clear pausable timeouts
    pausableTimeoutsRef.current.forEach(pt => {
      if (pt.timeoutId) clearTimeout(pt.timeoutId);
    });
    pausableTimeoutsRef.current = [];
  }, []);

  // Pausable timeout helper - creates a timeout that can be paused/resumed
  const setPausableTimeout = useCallback((callback: () => void, delay: number) => {
    const id = ++pausableTimeoutIdCounter.current;
    const now = Date.now();

    const entry = {
      id,
      callback,
      remainingTime: delay,
      startedAt: now,
      timeoutId: null as NodeJS.Timeout | null,
    };

    // If game is paused, don't start the timeout yet
    if (gameSpeedRef.current === 0) {
      pausableTimeoutsRef.current.push(entry);
      return id;
    }

    // Start the timeout
    entry.timeoutId = setTimeout(() => {
      // Remove from tracking
      pausableTimeoutsRef.current = pausableTimeoutsRef.current.filter(pt => pt.id !== id);
      callback();
    }, delay);

    pausableTimeoutsRef.current.push(entry);
    return id;
  }, []);

  // Pause all pausable timeouts
  const pauseAllTimeouts = useCallback(() => {
    const now = Date.now();
    pausedAtRef.current = now;

    pausableTimeoutsRef.current.forEach(pt => {
      if (pt.timeoutId) {
        clearTimeout(pt.timeoutId);
        pt.timeoutId = null;
        // Calculate remaining time
        const elapsed = now - pt.startedAt;
        pt.remainingTime = Math.max(0, pt.remainingTime - elapsed);
      }
    });
    // Note: Spawn intervals are not cleared - they check gameSpeedRef and skip spawning when paused
  }, []);

  // Resume all pausable timeouts
  const resumeAllTimeouts = useCallback(() => {
    const now = Date.now();
    pausedAtRef.current = null;

    pausableTimeoutsRef.current.forEach(pt => {
      if (!pt.timeoutId && pt.remainingTime > 0) {
        pt.startedAt = now;
        pt.timeoutId = setTimeout(() => {
          pausableTimeoutsRef.current = pausableTimeoutsRef.current.filter(p => p.id !== pt.id);
          pt.callback();
        }, pt.remainingTime);
      }
    });
  }, []);

  // Performance constants for particles and effects
  const MAX_PARTICLES = 300;
  const MAX_EFFECTS = 80;
  const PARTICLE_THROTTLE_MS = 50; // Minimum time between particle spawns at same position
  const lastParticleSpawn = useRef<Map<string, number>>(new Map());
  const pendingParticleBurstsRef = useRef<ParticleBurstRequest[]>([]);
  const projectileUpdateAccumulator = useRef<number>(0); // Throttle projectile simulation under load
  const particleUpdateAccumulator = useRef<number>(0); // Accumulate time between particle updates for throttling
  const effectsUpdateAccumulator = useRef<number>(0); // Accumulate time between effects updates for throttling
  const pendingDeathEffectsRef = useRef<Effect[]>([]); // Ref-based queue so render sees death effects immediately

  // Queue particle bursts and flush once per frame to avoid many setState calls during heavy combat.
  const addParticles = useCallback(
    (pos: Position, type: Particle["type"], count: number) => {
      const now = Date.now();
      const posKey = `${Math.round(pos.x / 20)}_${Math.round(pos.y / 20)}_${type}`;
      const lastSpawn = lastParticleSpawn.current.get(posKey) || 0;
      if (now - lastSpawn < PARTICLE_THROTTLE_MS) {
        return;
      }
      lastParticleSpawn.current.set(posKey, now);

      if (lastParticleSpawn.current.size > 100) {
        const entries = Array.from(lastParticleSpawn.current.entries());
        entries
          .slice(0, 50)
          .forEach(([key]) => lastParticleSpawn.current.delete(key));
      }

      const counts = entityCountsRef.current;
      const pressure = counts.enemies + counts.projectiles * 0.8 + counts.effects * 0.6;
      const pressureScale =
        pressure > 260
          ? 0.2
          : pressure > 180
            ? 0.35
            : pressure > 120
              ? 0.5
              : pressure > 80
                ? 0.7
                : 1;
      const adjustedCount = Math.max(
        1,
        Math.floor(Math.max(1, count) * pressureScale)
      );

      if (
        pendingParticleBurstsRef.current.length > 220 &&
        adjustedCount <= 3 &&
        type !== "explosion"
      ) {
        return;
      }

      pendingParticleBurstsRef.current.push({
        pos: { ...pos },
        type,
        count: adjustedCount,
      });
      if (pendingParticleBurstsRef.current.length > 320) {
        pendingParticleBurstsRef.current.splice(
          0,
          pendingParticleBurstsRef.current.length - 320
        );
      }
    },
    []
  );

  const flushQueuedParticles = useCallback(() => {
    const bursts = pendingParticleBurstsRef.current;
    if (bursts.length === 0) return;
    pendingParticleBurstsRef.current = [];

    const counts = entityCountsRef.current;
    const pressure = counts.enemies + counts.projectiles * 0.8 + counts.effects * 0.6;
    const budget =
      pressure > 260 ? 24 : pressure > 180 ? 36 : pressure > 120 ? 56 : 84;
    let remaining = budget;

    for (const burst of bursts) {
      if (remaining <= 0) break;
      const colors = PARTICLE_COLORS[burst.type] || PARTICLE_COLORS.spark;
      const spawnCount = Math.max(1, Math.min(burst.count, remaining));
      remaining -= spawnCount;
      const isExplosion = burst.type === "explosion";
      const particleSize = burst.type === "smoke" ? 8 : isExplosion ? 6 : 4;
      const resolvedType = isExplosion ? "spark" as const : burst.type;

      for (let i = 0; i < spawnCount; i++) {
        const angle = (Math.PI * 2 * i) / spawnCount + Math.random() * 0.5;
        const speed = isExplosion ? 2 + Math.random() * 3 : 1 + Math.random() * 2;
        const colorIndex = Math.floor(Math.random() * colors.length);
        acquireParticle(
          { x: burst.pos.x, y: burst.pos.y },
          {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed - (isExplosion ? 1 : 0),
          },
          400 + Math.random() * 300,
          700,
          particleSize,
          colors[colorIndex] ?? colors[0] ?? "#ffffff",
          resolvedType,
        );
      }
    }

    const dynamicCap =
      pressure > 260 ? 180 : pressure > 180 ? 220 : pressure > 120 ? 260 : MAX_PARTICLES;
    enforceParticleCap(dynamicCap);
  }, []);

  // Helper to award bounty and track for HUD animation.
  // Uses functional setState dedup because this can be called inside setEnemies
  // updaters which React strict mode may double-invoke.
  const awardBounty = useCallback(
    (baseBounty: number, hasGoldAura: boolean, sourceId?: string) => {
      const goldBonus = hasGoldAura ? Math.floor(baseBounty * 0.5) : 0;
      const totalBounty = baseBounty + goldBonus;
      const eventId = `bounty-${Date.now()}-${sourceId || Math.random().toString(36).slice(2)}`;
      setBountyIncomeEvents((prev) => {
        if (prev.some(e => e.id === eventId)) return prev;
        return [...prev, { id: eventId, amount: totalBounty, isGoldBoosted: hasGoldAura }];
      });
      addPawPoints(totalBounty);
      return totalBounty;
    },
    [addPawPoints]
  );

  // Centralized enemy death handler - awards bounty, particles, and death animation effect
  const onEnemyKill = useCallback(
    (enemy: Enemy, pos: Position, particleCount: number = 8, deathCause: DeathCause = "default") => {
      const eData = ENEMY_DATA[enemy.type];
      const baseBounty = eData.bounty;
      awardBounty(baseBounty, enemy.goldAura || false, enemy.id);
      addParticles(pos, "explosion", particleCount);
      if (enemy.goldAura) addParticles(pos, "gold", 6);

      const DEATH_DURATIONS: Record<DeathCause, number> = {
        lightning: 1800,
        fire: 2000,
        freeze: 800,
        sonic: 650,
        poison: 1200,
        default: 1500,
      };

      const mapThemeKey = LEVEL_DATA[selectedMap]?.theme || "grassland";
      const regionColors = REGION_THEMES[mapThemeKey]?.ground;

      const deathEffect: Effect = {
        id: generateId("fx"),
        pos,
        type: "enemy_death" as const,
        progress: 0,
        size: eData.size,
        duration: DEATH_DURATIONS[deathCause],
        color: eData.color,
        enemyType: enemy.type,
        enemySize: eData.size,
        isFlying: eData.flying,
        deathCause,
        regionGroundColors: regionColors,
      };
      (deathEffect as Effect & { _spawnedAt: number })._spawnedAt = performance.now();
      pendingDeathEffectsRef.current.push(deathEffect);
      addEffectEntity(deathEffect);
    },
    [awardBounty, addParticles, addEffectEntity, selectedMap]
  );

  // Keyboard controls for camera
  useEffect(() => {
    if (gameState !== "playing" || battleOutcome) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const panSpeed = 20;
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setCameraOffset((prev) => ({ ...prev, y: prev.y + panSpeed }));
          break;
        case "s":
        case "arrowdown":
          setCameraOffset((prev) => ({ ...prev, y: prev.y - panSpeed }));
          break;
        case "a":
        case "arrowleft":
          setCameraOffset((prev) => ({ ...prev, x: prev.x + panSpeed }));
          break;
        case "d":
        case "arrowright":
          setCameraOffset((prev) => ({ ...prev, x: prev.x - panSpeed }));
          break;
        case "+":
        case "=":
          setCameraZoom((prev) => Math.min(prev + 0.1, 2));
          break;
        case "-":
        case "_":
          setCameraZoom((prev) => Math.max(prev - 0.1, 0.5));
          break;
        case "escape":
          // Cancel spell targeting/placement with PP refund
          if (targetingSpellRef.current) {
            const refundCost = SPELL_DATA[targetingSpellRef.current]?.cost ?? 0;
            if (refundCost > 0) addPawPoints(refundCost);
            setTargetingSpell(null);
          }
          if (placingTroopRef.current) {
            const refundCost = SPELL_DATA["reinforcements"]?.cost ?? 0;
            if (refundCost > 0) addPawPoints(refundCost);
            setPlacingTroop(false);
          }
          // Unselect all towers, heroes, and troops
          setSelectedTower(null);
          setActiveSentinelTargetKey(null);
          setMissileMortarTargetingId(null);
          setHero((prev) => (prev ? { ...prev, selected: false } : null));
          setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, battleOutcome, setTroops, addPawPoints]);

  // Saved speed before pause-lock (camera or inspect mode)
  const preLockSpeedRef = useRef<number | null>(null);

  const enterCameraMode = useCallback(() => {
    if (cameraModeActive) return;
    preLockSpeedRef.current = gameSpeed;
    setGameSpeed(0);
    setCameraModeActive(true);
  }, [cameraModeActive, gameSpeed]);

  const exitCameraMode = useCallback(() => {
    if (!cameraModeActive) return;
    setCameraModeActive(false);
    const restored = preLockSpeedRef.current;
    setGameSpeed(restored != null && restored > 0 ? restored : 1);
    preLockSpeedRef.current = null;
  }, [cameraModeActive]);

  const toggleCameraMode = useCallback(() => {
    if (cameraModeActive) exitCameraMode();
    else enterCameraMode();
  }, [cameraModeActive, enterCameraMode, exitCameraMode]);

  // F2 toggles camera/photo mode
  useEffect(() => {
    if (gameState !== "playing") return;
    const handleCameraModeKey = (e: KeyboardEvent) => {
      if (e.key !== "F2") return;
      e.preventDefault();
      toggleCameraMode();
    };
    window.addEventListener("keydown", handleCameraModeKey);
    return () => window.removeEventListener("keydown", handleCameraModeKey);
  }, [gameState, toggleCameraMode]);

  const handleCameraModeCapture = useCallback(async (): Promise<boolean> => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    return captureCanvas(canvas);
  }, []);

  const pauseLocked = cameraModeActive || inspectorActive;

  useEffect(() => {
    if (!DEV_CONFIG_MENU_ENABLED || typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(DEV_PERF_STORAGE_KEY);
      if (saved === "1" || saved === "0") {
        setDevPerfEnabled(saved === "1");
      }
    } catch {
      // Ignore localStorage access errors.
    }
  }, []);

  useEffect(() => {
    if (!DEV_CONFIG_MENU_ENABLED || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        DEV_PERF_STORAGE_KEY,
        devPerfEnabled ? "1" : "0"
      );
    } catch {
      // Ignore localStorage access errors.
    }
  }, [devPerfEnabled]);

  useEffect(() => {
    if (!DEV_CONFIG_MENU_ENABLED || gameState !== "playing") return;
    const handlePerfToggleKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
      if (e.key.toLowerCase() !== "p") return;
      e.preventDefault();
      setDevPerfEnabled((prev) => !prev);
    };
    window.addEventListener("keydown", handlePerfToggleKey);
    return () => window.removeEventListener("keydown", handlePerfToggleKey);
  }, [gameState]);

  // Hard lock pause while end-of-battle overlay is visible.
  useEffect(() => {
    if (!battleOutcome) return;
    if (gameSpeed === 0) return;
    setGameSpeed(0);
  }, [battleOutcome, gameSpeed]);

  // Reset game state when starting a new game (entering "playing" state)
  useEffect(() => {
    if (gameState === "playing") {
      clearAllTimers();
      setBattleOutcome(null);
      // Get level-specific starting resources
      const levelData = LEVEL_DATA[selectedMap];
      const levelStartingPawPoints = levelData?.startingPawPoints ?? INITIAL_PAW_POINTS;

      // Reset all game state for a fresh start
      resetPawPoints(levelStartingPawPoints);
      setLives(INITIAL_LIVES);
      setCurrentWave(0);
      setNextWaveTimer(WAVE_TIMER_BASE);
      setWaveInProgress(false);
      setHoveredWaveBubblePathKey(null);
      clearTowers();
      clearEnemies();
      setHero(null); // Will be re-initialized by the hero effect
      clearTroops();
      clearProjectiles();
      clearEffects();
      clearParticlePool();
      setSelectedTower(null);
      setBuildingTower(null);
      setDraggingTower(null);
      setPlacingTroop(false);
      setTargetingSpell(null);
      setActiveSentinelTargetKey(null);
      setMissileMortarTargetingId(null);
      setSentinelTargets({});
      setSpells([]);
      setGameSpeed(1);
      setGoldSpellActive(false);
      setSpecialTowerHp(getLevelSpecialTowerHp(selectedMap));
      // Reset pausable timer system state
      prevGameSpeedRef.current = 1;
      pausedAtRef.current = null;
      totalPausedTimeRef.current = 0;
      pausableTimeoutsRef.current = [];
      // Reset spawn timing refs
      lastBarracksSpawnRef.current = 0;
      lastSentinelStrikeRef.current.clear();
      lastSunforgeBarrageRef.current.clear();
      // Mark reset time to prevent stale state race conditions
      gameResetTimeRef.current = Date.now();
    }
  }, [
    gameState,
    clearAllTimers,
    selectedMap,
    resetPawPoints,
    clearTowers,
    clearEnemies,
    clearTroops,
    clearProjectiles,
    clearEffects,
  ]);

  // Clear all timers when leaving the playing state (defeat, victory, quit)
  useEffect(() => {
    if (gameState !== "playing") {
      clearAllTimers();
      pendingParticleBurstsRef.current = [];
      clearParticlePool();
      setHoveredWaveBubblePathKey(null);
    }
  }, [gameState, clearAllTimers]);

  useEffect(() => {
    setWaveStartConfirm((prev) => {
      if (!prev) return prev;
      if (gameState !== "playing" || waveInProgress) return null;
      if (prev.mapId !== selectedMap) return null;
      if (prev.waveIndex !== currentWave) return null;
      if (!activeWaveSpawnPaths.includes(prev.pathKey)) return null;
      return prev;
    });
  }, [gameState, waveInProgress, selectedMap, currentWave, activeWaveSpawnPaths]);

  useEffect(() => {
    if (!hoveredWaveBubblePathKey) return;
    if (gameState !== "playing" || waveInProgress || gameSpeed <= 0) {
      setHoveredWaveBubblePathKey(null);
      return;
    }
    if (currentWave >= totalWaves || nextWaveTimer <= 0) {
      setHoveredWaveBubblePathKey(null);
      return;
    }
    if (!activeWaveSpawnPaths.includes(hoveredWaveBubblePathKey)) {
      setHoveredWaveBubblePathKey(null);
    }
  }, [
    hoveredWaveBubblePathKey,
    gameState,
    waveInProgress,
    gameSpeed,
    currentWave,
    totalWaves,
    nextWaveTimer,
    activeWaveSpawnPaths,
  ]);

  // Initialize hero and spells when game starts
  useEffect(() => {
    if (gameState === "playing" && selectedHero && !hero) {
      const heroData = HERO_DATA[selectedHero];
      const levelSettings = LEVEL_DATA[selectedMap];
      const defaultPathKey = activeWaveSpawnPaths[0] ?? selectedMap;
      const path = MAP_PATHS[defaultPathKey] ?? MAP_PATHS.poe ?? [];
      if (path.length === 0) return;
      // Spawn hero at the END of the path (where they defend)
      // Use map-specific hero spawn when available, otherwise default near the path exit.
      const defaultRespawnNode = path[Math.max(0, path.length - 4)] ?? path[path.length - 1];
      const heroSpawnNode = levelSettings?.heroSpawn ?? defaultRespawnNode;
      if (!heroSpawnNode) return;
      const startPos = gridToWorldPath(heroSpawnNode);
      setHero({
        id: "hero",
        type: selectedHero,
        pos: startPos,
        homePos: startPos, // Add this line
        hp: heroData.hp,
        maxHp: heroData.hp,
        moving: false,
        lastAttack: 0,
        abilityReady: true,
        abilityCooldown: 0,
        revived: false,
        rotation: Math.PI, // Face back towards enemies
        facingRight: false,
        attackAnim: 0,
        selected: false,
        dead: false,
        respawnTimer: 0,
      });
      setSpells(
        selectedSpells.map((type) => ({
          type,
          cooldown: 0,
          maxCooldown: SPELL_DATA[type]?.cooldown ?? 0,
        }))
      );
      setNextWaveTimer(WAVE_TIMER_BASE);
      setLevelStartTime(Date.now());
      setTimeSpent(0);
      // Set camera to level-specific settings
      if (levelSettings?.camera) {
        setCameraOffset(levelSettings.camera.offset);
        const targetZoom =
          levelSettings.levelKind === "challenge"
            ? Math.min(levelSettings.camera.zoom, 0.72)
            : levelSettings.camera.zoom;
        setCameraZoom(targetZoom);
      }
    }
  }, [
    gameState,
    selectedHero,
    hero,
    selectedSpells,
    selectedMap,
    activeWaveSpawnPaths,
  ]);
  // Resize canvas - NO ctx.scale here, we handle DPR in render
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const dpr = getRenderDpr();
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        // DO NOT apply ctx.scale here - we do it fresh each render frame
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [gameState, getRenderDpr, cameraModeActive]);

  // Handle pause/resume of spawn timers when gameSpeed changes
  const prevGameSpeedRef = useRef(gameSpeed);
  useEffect(() => {
    const prevSpeed = prevGameSpeedRef.current;
    prevGameSpeedRef.current = gameSpeed;

    // Only handle transitions to/from paused state
    if (prevSpeed !== 0 && gameSpeed === 0) {
      // Just paused - pause all timeouts
      pauseAllTimeouts();
    } else if (prevSpeed === 0 && gameSpeed !== 0) {
      // Just resumed - extend status effect timestamps by pause duration
      // so effects don't expire prematurely from real time advancing while paused
      const pauseDuration = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0;
      if (pauseDuration > 0) {
        totalPausedTimeRef.current += pauseDuration;
        setTroops((prev) =>
          prev.map((troop) => {
            const updates: Partial<typeof troop> = {};
            if (troop.burnUntil) updates.burnUntil = troop.burnUntil + pauseDuration;
            if (troop.slowUntil) updates.slowUntil = troop.slowUntil + pauseDuration;
            if (troop.poisonUntil) updates.poisonUntil = troop.poisonUntil + pauseDuration;
            if (troop.stunUntil) updates.stunUntil = troop.stunUntil + pauseDuration;
            return Object.keys(updates).length > 0 ? { ...troop, ...updates } : troop;
          })
        );
        setHero((prev) => {
          if (!prev) return prev;
          const updates: Partial<typeof prev> = {};
          if (prev.burnUntil) updates.burnUntil = prev.burnUntil + pauseDuration;
          if (prev.slowUntil) updates.slowUntil = prev.slowUntil + pauseDuration;
          if (prev.poisonUntil) updates.poisonUntil = prev.poisonUntil + pauseDuration;
          if (prev.stunUntil) updates.stunUntil = prev.stunUntil + pauseDuration;
          return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
        });
        setEnemies((prev) =>
          prev.map((enemy) => {
            const updates: Partial<typeof enemy> = {};
            if (enemy.burnUntil) updates.burnUntil = enemy.burnUntil + pauseDuration;
            if (enemy.stunUntil) updates.stunUntil = enemy.stunUntil + pauseDuration;
            return Object.keys(updates).length > 0 ? { ...enemy, ...updates } : enemy;
          })
        );
        setTowers((prev) =>
          prev.map((tower) => {
            const updates: Partial<typeof tower> = {};
            if (tower.disabledUntil) updates.disabledUntil = tower.disabledUntil + pauseDuration;
            if (tower.boostEnd) updates.boostEnd = tower.boostEnd + pauseDuration;
            if (tower.debuffs && tower.debuffs.length > 0) {
              updates.debuffs = tower.debuffs.map((d) => ({ ...d, until: d.until + pauseDuration }));
            }
            return Object.keys(updates).length > 0 ? { ...tower, ...updates } : tower;
          })
        );
      }
      // Resume all timeouts (this also clears pausedAtRef)
      resumeAllTimeouts();
    }
  }, [gameSpeed, pauseAllTimeouts, resumeAllTimeouts, setTroops, setHero, setEnemies, setTowers]);

  // Start wave function
  const startWave = useCallback(() => {
    const levelWaves = getLevelWaves(selectedMap);
    // Double-check guards to prevent duplicate wave starts
    if (waveInProgress) {
      console.log("[Wave] Blocked: wave already in progress");
      return;
    }
    if (currentWave >= levelWaves.length) {
      console.log("[Wave] Blocked: all waves completed");
      return;
    }

    console.log(`[Wave] Starting wave ${currentWave + 1} of ${levelWaves.length}`);
    setWaveInProgress(true);
    const wave = levelWaves[currentWave];
    if (!wave) {
      setWaveInProgress(false);
      return;
    }
    let cumulativeDelay = 0;
    wave.forEach((group) => {
      cumulativeDelay += (group.delay || 0);
      const startDelay = cumulativeDelay;

      const startSpawning = () => {
        let spawned = 0;
        const spawnInterval = setInterval(() => {
          // Skip spawning if game is paused
          if (gameSpeedRef.current === 0) {
            return;
          }
          if (spawned >= group.count) {
            clearInterval(spawnInterval);
            return;
          }
          const formationPattern = pickFormationPattern(group.type, group.count);
          const mirrorFormation = (group.type.charCodeAt(0) + group.count) % 2 === 0;
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

          const enemy: Enemy = {
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
            spawnProgress: 1, // Start fully visible
            laneOffset: laneOffset,
            formationLane: spawnLaneIndex,
            slowed: false,
            slowIntensity: 0,
            pathKey: pathKey, // Track which path this enemy uses
          };
          addEnemyEntity(enemy);
          spawned++;
        }, group.interval);
        // Track interval for cleanup
        spawnIntervalsRef.current.push(spawnInterval);
      };

      // If delay is specified, wait before starting to spawn this group
      if (startDelay > 0) {
        // Use pausable timeout for delays
        setPausableTimeout(startSpawning, startDelay);
      } else {
        startSpawning();
      }
    });
    // Calculate wave duration including cumulative delays
    let accDelay = 0;
    const waveDuration = Math.max(...wave.map((g) => {
      accDelay += (g.delay || 0);
      return accDelay + g.count * g.interval;
    })) + 3000;
    const waveNumberForTimeout = currentWave; // Capture for closure
    console.log(`[Wave] Wave ${currentWave + 1} started, will complete in ${waveDuration}ms`);

    // Use pausable timeout for wave completion
    setPausableTimeout(() => {
      // Use functional updates to check current state before modifying
      setCurrentWave((currentW) => {
        // Only process if we're still on the wave this timeout was for
        if (currentW !== waveNumberForTimeout) {
          console.log(`[Wave] Timeout for wave ${waveNumberForTimeout + 1} ignored - current wave is ${currentW + 1}`);
          return currentW; // Don't change anything
        }

        console.log(`[Wave] Wave ${currentW + 1} completed, advancing to wave ${currentW + 2}`);

        // These are safe to call since we confirmed we're on the right wave
        setWaveInProgress(false);
        setNextWaveTimer(WAVE_TIMER_BASE);

        return currentW + 1;
      });
    }, waveDuration);
  }, [
    waveInProgress,
    currentWave,
    selectedMap,
    setPausableTimeout,
    addEnemyEntity,
    activeWaveSpawnPaths,
  ]);

  // Update game function
  const updateGame = useCallback(
    (deltaTime: number) => {
      const now = Date.now();
      const isPaused = gameSpeed === 0;

      // CRITICAL: Skip ALL game logic when paused
      // This prevents Date.now() based timers from advancing (status effects, healing, buffs)
      // and ensures enemies/troops/heroes don't move or act while paused.
      // Rendering still happens via the render() call in the game loop.
      if (isPaused) {
        return;
      }

      // Skip spawning logic during game reset transition to prevent race conditions
      // where stale state might cause double spawns
      const timeSinceReset = now - gameResetTimeRef.current;
      const isInResetTransition = timeSinceReset < 100; // 100ms grace period

      const levelWaves = getLevelWaves(selectedMap);
      const specialTowers = getLevelSpecialTowers(selectedMap);
      const beacons = specialTowers.filter((tower) => tower.type === "beacon");
      const chronoRelays = specialTowers.filter(
        (tower) => tower.type === "chrono_relay"
      );
      const shrines = specialTowers.filter((tower) => tower.type === "shrine");
      const sentinelNexuses = specialTowers.filter(
        (tower) => tower.type === "sentinel_nexus"
      );
      const sunforgeOrreries = specialTowers.filter(
        (tower) => tower.type === "sunforge_orrery"
      );
      const barracksTower =
        specialTowers.find((tower) => tower.type === "barracks") ?? null;
      const barracksWorldPos = barracksTower
        ? gridToWorld(barracksTower.pos)
        : null;
      const vaultWorldPositions = specialTowers
        .filter((tower) => tower.type === "vault")
        .map((tower) => gridToWorld(tower.pos));
      // Wave timer - check outside setState to avoid race conditions
      if (!waveInProgress && currentWave < levelWaves.length) {
        const shouldStartWave = nextWaveTimer - deltaTime <= 0;
        if (shouldStartWave) {
          startWave();
          setNextWaveTimer(WAVE_TIMER_BASE);
        } else {
          setNextWaveTimer((prev) => Math.max(0, prev - deltaTime));
        }
      }

      // Cache enemy positions for this tick (keyed by object reference, not id).
      const enemyPosCache = createEnemyPosCache(getEnemyPosWithPath, selectedMap);
      const getEnemyPosCached = enemyPosCache.getPos;
      const getEnemyAimPosCached = enemyPosCache.getAimPos;

      const enemiesByProgress = [...enemies].sort(
        (a, b) => b.pathIndex + b.progress - (a.pathIndex + a.progress)
      );

      const troopCellSize = 120;
      const troopBuckets = new Map<string, Troop[]>();
      for (const troop of troops) {
        const cellKey = getTroopCellKey(troop.pos.x, troop.pos.y, troopCellSize);
        const bucket = troopBuckets.get(cellKey);
        if (bucket) {
          bucket.push(troop);
        } else {
          troopBuckets.set(cellKey, [troop]);
        }
      }

      // Bind extracted helpers to this tick's data so call sites stay clean
      const getEnemiesInRange = (
        origin: Position,
        range: number,
        limit?: number,
        predicate?: (e: Enemy) => boolean,
      ) =>
        getPrioritizedEnemiesInRange(origin, range, enemiesByProgress, getEnemyPosCached, limit, predicate);
      const getClosestEnemy = (
        origin: Position,
        range: number,
        predicate?: (e: Enemy) => boolean,
      ) =>
        getClosestEnemyInRange(origin, range, enemies, getEnemyPosCached, predicate);
      const getNearestTroop = (
        origin: Position,
        range: number,
        predicate?: (t: Troop) => boolean,
      ) =>
        findNearestTroopInRange(origin, range, troopBuckets, troopCellSize, predicate);
      const getClosestVault = (enemyPos: Position, maxDistance: number) =>
        getVaultImpactPos(enemyPos, vaultWorldPositions, maxDistance);

      // =========================================================================
      // DYNAMIC BUFF REGISTRATION
      // Compute buffs from all sources: Beacon, Investment Bank, Recruitment Center, F. Scott
      // =========================================================================
      setTowers((prev) =>
        prev.map((t) => {
          if (t.type === "club") return t; // Clubs don't receive buffs

          const tWorldPos = gridToWorld(t.pos);

          // Calculate RANGE buffs (multiplicative stacking)
          let rangeMultiplier = 1.0;

          // F. Scott's Inspiration buff check (used for both range and damage)
          const isScottActive = t.boostEnd ? now < t.boostEnd : false;

          // F. Scott's Inspiration range buff (+25%, time-limited)
          if (isScottActive && t.isBuffed) {
            rangeMultiplier *= 1.25;
          }

          // Beacon range buff (+20%)
          for (const beacon of beacons) {
            const beaconPos = gridToWorld(beacon.pos);
            if (distance(tWorldPos, beaconPos) < 250) {
              rangeMultiplier *= 1.2;
            }
          }

          // Investment Bank range buff (+15% each, from nearby level 4A clubs)
          prev.forEach((club) => {
            if (club.type === "club" && club.level === 4 && club.upgrade === "A" && club.id !== t.id) {
              const clubPos = gridToWorld(club.pos);
              if (distance(tWorldPos, clubPos) <= 200) {
                rangeMultiplier *= 1.15;
              }
            }
          });

          // Cap range boost at 2.5x
          rangeMultiplier = Math.min(rangeMultiplier, 2.5);

          // Calculate DAMAGE buffs (multiplicative stacking)
          let damageMultiplier = 1.0;

          // F. Scott's Inspiration damage buff (+50%, time-limited)
          if (isScottActive && t.isBuffed) {
            damageMultiplier *= 1.5;
          }

          // Recruitment Center damage buff (+15% each, from nearby level 4B clubs)
          prev.forEach((club) => {
            if (club.type === "club" && club.level === 4 && club.upgrade === "B" && club.id !== t.id) {
              const clubPos = gridToWorld(club.pos);
              if (distance(tWorldPos, clubPos) <= 200) {
                damageMultiplier *= 1.15;
              }
            }
          });

          // Cap damage boost at 3.0x
          damageMultiplier = Math.min(damageMultiplier, 3.0);

          // Calculate ATTACK SPEED buffs (multiplicative stacking)
          let attackSpeedMultiplier = 1.0;
          for (const relay of chronoRelays) {
            const relayPos = gridToWorld(relay.pos);
            if (distance(tWorldPos, relayPos) < 220) {
              attackSpeedMultiplier *= 1.25;
            }
          }
          attackSpeedMultiplier = Math.min(attackSpeedMultiplier, 2.4);

          const hasAnyBuff =
            rangeMultiplier > 1.0 ||
            damageMultiplier > 1.0 ||
            attackSpeedMultiplier > 1.0;

          return {
            ...t,
            rangeBoost: rangeMultiplier,
            damageBoost: damageMultiplier,
            attackSpeedBoost: attackSpeedMultiplier,
            isBuffed: hasAnyBuff,
            // Clear boostEnd if Scott's buff expired
            boostEnd: isScottActive ? t.boostEnd : undefined,
          };
        })
      );

      // =========================================================================
      // HAZARD LOGIC - Using imported hazard game logic functions
      // =========================================================================
      const levelDataForHazards = LEVEL_DATA[selectedMap];
      const hazards = levelDataForHazards?.hazards;
      if (hazards && hazards.length > 0) {

        // Calculate hazard effects using the imported function
        const { effects: hazardEffects, particles: hazardParticles } = calculateHazardEffects(
          hazards,
          enemies,
          deltaTime,
          (enemy) => getEnemyPosCached(enemy)
        );

        // Single batched update for all hazard effects
        if (hazardEffects.size > 0) {
          setEnemies((prev) =>
            prev.map((e) => {
              const effect = hazardEffects.get(e.id);
              if (!effect) return e;
              return applyHazardEffect(e, effect, ENEMY_DATA[e.type].speed);
            })
          );

          // Fire particles for lava damage
          hazardEffects.forEach((effect) => {
            if (effect.fireParticlePos) {
              addParticles(effect.fireParticlePos, "fire", 6);
            }
          });
        }

        // Spawn hazard environment particles (throttled)
        hazardParticles.forEach((p) => addParticles(p.pos, p.type, p.count));
      }

      // =========================================================================
      // SPECIAL TOWER LOGIC
      // =========================================================================
      // A. BEACON: Range buff is handled in dynamic tower buff registration above.

      // B. SHRINE: Periodic HP pulse for hero and troops.
      if (shrines.length > 0 && now % 5000 < deltaTime) {
        const healRadius = 200;
        const healAmount = 50;
        const shrineWorldPositions = shrines.map((tower) => gridToWorld(tower.pos));

        if (hero && !hero.dead) {
          const isHeroInShrineRange = shrineWorldPositions.some(
            (pos) => distance(hero.pos, pos) < healRadius
          );
          if (isHeroInShrineRange) {
            setHero((prev) =>
              prev
                ? {
                  ...prev,
                  hp: Math.min(prev.maxHp, prev.hp + healAmount),
                  healFlash: Date.now(),
                }
                : null
            );
            addParticles(hero.pos, "heal", 10);
          }
        }

        setTroops((prev) =>
          prev.map((troop) => {
            const isInShrineRange = shrineWorldPositions.some(
              (pos) => distance(troop.pos, pos) < healRadius
            );
            if (!isInShrineRange) return troop;
            return {
              ...troop,
              hp: Math.min(troop.maxHp, troop.hp + healAmount),
              healFlash: Date.now(),
            };
          })
        );

        shrineWorldPositions.forEach((pos) => {
          setEffects((ef) => [
            ...ef,
            {
              id: generateId("shrine"),
              pos,
              type: "arcaneField",
              progress: 0,
              size: healRadius,
            },
          ]);
        });
      }

      // B2. SENTINEL NEXUS: Locked-coordinate lightning strike every 10 seconds.
      if (sentinelNexuses.length > 0) {
        const strikeIntervalMs = 10000;
        const strikeRadius = 140;
        const strikeDamage = 240;
        const sentinelKeys = new Set<string>();
        const nextTargets = { ...sentinelTargetsRef.current };
        let targetsChanged = false;
        const pendingDamage = new Map<string, number>();
        const strikeEffects: Effect[] = [];

        for (const nexus of sentinelNexuses) {
          const strikeKey = getSpecialTowerKey(nexus);
          sentinelKeys.add(strikeKey);
          if (!nextTargets[strikeKey]) {
            nextTargets[strikeKey] = getRandomMapTarget();
            targetsChanged = true;
          }
        }

        Object.keys(nextTargets).forEach((key) => {
          if (!sentinelKeys.has(key)) {
            delete nextTargets[key];
            targetsChanged = true;
          }
        });

        if (targetsChanged) {
          setSentinelTargets(nextTargets);
          sentinelTargetsRef.current = nextTargets;
        }

        for (const nexus of sentinelNexuses) {
          const strikeKey = getSpecialTowerKey(nexus);
          const lastStrike = lastSentinelStrikeRef.current.get(strikeKey) ?? 0;
          if (now - lastStrike < strikeIntervalMs) continue;

          const targetPos = nextTargets[strikeKey];
          if (!targetPos) continue;

          lastSentinelStrikeRef.current.set(strikeKey, now);
          const nexusWorldPos = gridToWorld(nexus.pos);
          strikeEffects.push({
            id: generateId("sentinel_strike"),
            pos: nexusWorldPos,
            type: "lightning",
            progress: 0,
            size: distance(nexusWorldPos, targetPos),
            targetPos,
            intensity: 1.55,
            duration: 240,
          });
          strikeEffects.push({
            id: generateId("sentinel_impact"),
            pos: targetPos,
            type: "sentinel_impact",
            progress: 0,
            size: strikeRadius,
            duration: 560,
          });
          addParticles(targetPos, "spark", 18);
          addParticles(targetPos, "light", 8);
          addParticles(nexusWorldPos, "light", 6);

          for (const enemy of enemies) {
            if (enemy.dead || enemy.hp <= 0) continue;
            const enemyPos = getEnemyPosCached(enemy);
            const distToStrike = distance(enemyPos, targetPos);
            if (distToStrike > strikeRadius) continue;
            const falloff = Math.max(0.45, 1 - distToStrike / strikeRadius);
            const damage = strikeDamage * falloff;
            pendingDamage.set(enemy.id, (pendingDamage.get(enemy.id) ?? 0) + damage);
          }
        }

        if (pendingDamage.size > 0) {
          setEnemies((prev) =>
            prev
              .map((enemy) => {
                const incoming = pendingDamage.get(enemy.id);
                if (!incoming) return enemy;
                const enemyPos = getEnemyPosCached(enemy);
                const hp = enemy.hp - getEnemyDamageTaken(enemy, incoming);
                if (hp <= 0) {
                  onEnemyKill(enemy, enemyPos, 14, "lightning");
                  return null;
                }
                return {
                  ...enemy,
                  hp,
                  damageFlash: 240,
                  stunUntil: Math.max(enemy.stunUntil || 0, now + 450),
                };
              })
              .filter(isDefined)
          );
        }

        if (strikeEffects.length > 0) {
          setEffects((prev) => {
            const combined = [...prev, ...strikeEffects];
            return combined.length > MAX_EFFECTS
              ? combined.slice(combined.length - MAX_EFFECTS)
              : combined;
          });
        }

        if (lastSentinelStrikeRef.current.size > 96) {
          lastSentinelStrikeRef.current.forEach((_value, key) => {
            if (!sentinelKeys.has(key)) {
              lastSentinelStrikeRef.current.delete(key);
            }
          });
        }
      }

      // B3. SUNFORGE ORRERY: Offensive tri-plasma barrage on dense enemy clusters.
      if (sunforgeOrreries.length > 0 && enemies.length > 0) {
        const barrageIntervalMs = 9000;
        const clusterScanRadius = 190;
        const strikeRadius = 115;
        const directDamage = 185;
        const burnDps = 28;
        const burnDurationMs = 2600;
        const sunforgeKeys = new Set<string>();
        const pendingDamage = new Map<
          string,
          { damage: number; burnDamage: number; burnUntil: number; stunUntil: number }
        >();
        const strikeEffects: Effect[] = [];

        for (const orrery of sunforgeOrreries) {
          const key = getSpecialTowerKey(orrery);
          sunforgeKeys.add(key);
          const lastBarrage = lastSunforgeBarrageRef.current.get(key) ?? 0;
          if (now - lastBarrage < barrageIntervalMs) continue;

          let bestTarget: Position | null = null;
          let bestScore = -Infinity;
          for (const pivotEnemy of enemiesByProgress) {
            if (pivotEnemy.dead || pivotEnemy.hp <= 0) continue;
            const pivotPos = getEnemyPosCached(pivotEnemy);
            let score = 0;
            for (const candidate of enemies) {
              if (candidate.dead || candidate.hp <= 0) continue;
              const candidatePos = getEnemyPosCached(candidate);
              const dist = distance(pivotPos, candidatePos);
              if (dist > clusterScanRadius) continue;
              const proximityWeight = 1 - dist / clusterScanRadius;
              const progressWeight = 1 + (candidate.pathIndex + candidate.progress) * 0.06;
              score += 1 + proximityWeight * 1.35 + progressWeight * 0.22;
            }
            if (score > bestScore) {
              bestScore = score;
              bestTarget = pivotPos;
            }
          }

          if (!bestTarget) continue;
          lastSunforgeBarrageRef.current.set(key, now);

          const orreryWorldPos = gridToWorld(orrery.pos);
          const spinPhase = now * 0.0012 + orrery.pos.x * 0.17 + orrery.pos.y * 0.09;
          const volleyOffsets = [
            { x: 0, y: 0, multiplier: 1.0, radiusScale: 1.0 },
            {
              x: Math.cos(spinPhase) * 70,
              y: Math.sin(spinPhase * 1.2) * 42,
              multiplier: 0.76,
              radiusScale: 0.92,
            },
            {
              x: Math.cos(spinPhase + Math.PI * 0.78) * 68,
              y: Math.sin(spinPhase * 1.28 + Math.PI * 0.52) * 40,
              multiplier: 0.72,
              radiusScale: 0.9,
            },
          ];

          volleyOffsets.forEach((offset, volleyIndex) => {
            const targetPos = {
              x: Math.max(
                TILE_SIZE,
                Math.min(
                  GRID_WIDTH * TILE_SIZE - TILE_SIZE,
                  bestTarget.x + offset.x
                )
              ),
              y: Math.max(
                TILE_SIZE,
                Math.min(
                  GRID_HEIGHT * TILE_SIZE - TILE_SIZE,
                  bestTarget.y + offset.y
                )
              ),
            };
            const volleyRadius = strikeRadius * offset.radiusScale;
            const volleyDamage = directDamage * offset.multiplier;

            strikeEffects.push({
              id: generateId("sunforge_beam"),
              pos: orreryWorldPos,
              type: "sunforge_beam",
              progress: 0,
              size: distance(orreryWorldPos, targetPos),
              targetPos,
              intensity: 1.25 + volleyIndex * 0.12,
              duration: 260,
            });
            strikeEffects.push({
              id: generateId("sunforge_impact"),
              pos: targetPos,
              type: "sunforge_impact",
              progress: 0,
              size: volleyRadius,
              intensity: 1.0 + volleyIndex * 0.08,
              duration: 640,
            });
            addParticles(targetPos, "fire", 16 - volleyIndex * 2);
            addParticles(targetPos, "spark", 12 - volleyIndex);
            addParticles(targetPos, "light", 6);

            for (const enemy of enemies) {
              if (enemy.dead || enemy.hp <= 0) continue;
              const enemyPos = getEnemyPosCached(enemy);
              const distToBlast = distance(enemyPos, targetPos);
              if (distToBlast > volleyRadius) continue;
              const falloff = Math.max(0.35, 1 - distToBlast / volleyRadius);
              const hitDamage = volleyDamage * falloff;
              const burnDamage = burnDps * Math.max(0.25, falloff * 0.8);
              const existing = pendingDamage.get(enemy.id);
              const update = existing ?? {
                damage: 0,
                burnDamage: 0,
                burnUntil: now + burnDurationMs,
                stunUntil: now + 320,
              };
              update.damage += hitDamage;
              update.burnDamage = Math.max(update.burnDamage, burnDamage);
              update.burnUntil = Math.max(update.burnUntil, now + burnDurationMs);
              update.stunUntil = Math.max(update.stunUntil, now + 320);
              pendingDamage.set(enemy.id, update);
            }
          });
          addParticles(orreryWorldPos, "light", 9);
        }

        if (pendingDamage.size > 0) {
          setEnemies((prev) =>
            prev
              .map((enemy) => {
                const incoming = pendingDamage.get(enemy.id);
                if (!incoming) return enemy;
                const enemyPos = getEnemyPosCached(enemy);
                const hp = enemy.hp - getEnemyDamageTaken(enemy, incoming.damage);
                if (hp <= 0) {
                  onEnemyKill(enemy, enemyPos, 12, "fire");
                  return null;
                }
                return {
                  ...enemy,
                  hp,
                  damageFlash: 280,
                  burning: true,
                  burnDamage: Math.max(enemy.burnDamage || 0, incoming.burnDamage),
                  burnUntil: Math.max(enemy.burnUntil || 0, incoming.burnUntil),
                  stunUntil: Math.max(enemy.stunUntil || 0, incoming.stunUntil),
                };
              })
              .filter(isDefined)
          );
        }

        if (strikeEffects.length > 0) {
          setEffects((prev) => {
            const combined = [...prev, ...strikeEffects];
            return combined.length > MAX_EFFECTS
              ? combined.slice(combined.length - MAX_EFFECTS)
              : combined;
          });
        }

        if (lastSunforgeBarrageRef.current.size > 96) {
          lastSunforgeBarrageRef.current.forEach((_value, key) => {
            if (!sunforgeKeys.has(key)) {
              lastSunforgeBarrageRef.current.delete(key);
            }
          });
        }
      }

      // C. BARRACKS: Capped & spread deployment (max 3 knights).
      if (barracksTower && barracksWorldPos && !isInResetTransition) {
        const barracksTroops = troops.filter((t) => t.ownerId === "special_barracks");

        const spawnCycle = now % 12000;
        const isInSpawnWindow = spawnCycle < 1500;
        const wasInSpawnWindow =
          lastBarracksSpawnRef.current > 0 &&
          (lastBarracksSpawnRef.current % 12000) < 1500;

        const justEnteredSpawnWindow =
          isInSpawnWindow &&
          (lastBarracksSpawnRef.current === 0 ||
            !wasInSpawnWindow ||
            now - lastBarracksSpawnRef.current > 10500);

        if (justEnteredSpawnWindow && barracksTroops.length < 3) {
          lastBarracksSpawnRef.current = now;

          const existingRallyTroop = barracksTroops.find((t) => t.userTargetPos);
          const rallyPoint =
            existingRallyTroop?.userTargetPos || findClosestRoadPoint(barracksWorldPos, activeWaveSpawnPaths, selectedMap);

          const occupiedSlots = new Set(barracksTroops.map((t) => t.spawnSlot ?? 0));
          const availableSlot =
            [0, 1, 2].find((slot) => !occupiedSlots.has(slot)) ?? barracksTroops.length;

          const futureCount = barracksTroops.length + 1;
          const formationOffsets = getFormationOffsets(futureCount);
          const slotOffset = formationOffsets[availableSlot] || { x: 0, y: 0 };
          const targetPos = {
            x: rallyPoint.x + slotOffset.x,
            y: rallyPoint.y + slotOffset.y,
          };

          const newTroop: Troop = {
            id: generateId("barracks_unit"),
            ownerId: "special_barracks",
            ownerType: "barracks",
            type: "knight",
            pos: { ...barracksWorldPos },
            hp: TROOP_DATA.knight.hp,
            maxHp: TROOP_DATA.knight.hp,
            moving: true,
            targetPos,
            userTargetPos: targetPos,
            lastAttack: 0,
            rotation: Math.atan2(
              targetPos.y - barracksWorldPos.y,
              targetPos.x - barracksWorldPos.x,
            ),
            facingRight: getFacingRightFromDelta(
              targetPos.x - barracksWorldPos.x,
              targetPos.y - barracksWorldPos.y,
            ),
            attackAnim: 0,
            selected: false,
            spawnPoint: rallyPoint,
            moveRadius: 220,
            spawnSlot: availableSlot,
          };

          setTroops((prev) => {
            const currentBarracksTroops = prev.filter(
              (troop) => troop.ownerId === "special_barracks"
            );
            const troopIdToFormationIndex = new Map<string, number>();
            currentBarracksTroops.forEach((troop, idx) => {
              troopIdToFormationIndex.set(troop.id, idx);
            });

            const updated = prev.map((troop) => {
              if (troop.ownerId !== "special_barracks") return troop;
              const newFormation = getFormationOffsets(futureCount);
              const formationIndex = troopIdToFormationIndex.get(troop.id) ?? 0;
              const offset = newFormation[formationIndex] || { x: 0, y: 0 };
              const newTarget = {
                x: rallyPoint.x + offset.x,
                y: rallyPoint.y + offset.y,
              };
              if (troop.engaging) return troop;
              return {
                ...troop,
                targetPos: newTarget,
                moving: true,
                userTargetPos: newTarget,
                spawnPoint: rallyPoint,
                facingRight: getFacingRightFromDelta(
                  newTarget.x - troop.pos.x,
                  newTarget.y - troop.pos.y,
                ),
              };
            });
            return [...updated, newTroop];
          });
          addParticles(barracksWorldPos, "smoke", 12);
        }
      }

      // D. VAULT: targetable objective.
      if (
        vaultWorldPositions.length > 0 &&
        specialTowerHp !== null &&
        specialTowerHp > 0
      ) {
        enemies.forEach((enemy) => {
          const enemyPos = getEnemyPosCached(enemy);
          const vaultImpactPos = getClosestVault(enemyPos, 60);
          if (!vaultImpactPos) return;
          const effectiveEnemyAttackInterval =
            gameSpeed > 0 ? 1000 / gameSpeed : 1000;
          if (
            isPaused ||
            now - (enemy.lastTroopAttack || 0) <= effectiveEnemyAttackInterval
          ) {
            return;
          }

          const dmg = 20;
          setSpecialTowerHp((prev) => {
            if (prev === null || prev <= 0) return prev;
            const newVal = prev - dmg;
            if (newVal <= 0) {
              setLives((life) => Math.max(0, life - 5));
              addParticles(vaultImpactPos, "explosion", 40);
              return 0;
            }
            return newVal;
          });
          setEnemies((prev) =>
            prev.map((entry) =>
              entry.id === enemy.id
                ? {
                  ...entry,
                  inCombat: true,
                  lastTroopAttack: now,
                  facingRight: getFacingRightFromDelta(
                    vaultImpactPos.x - enemyPos.x,
                    vaultImpactPos.y - enemyPos.y,
                    entry.facingRight,
                  ),
                }
                : entry
            )
          );
        });

        if (specialTowerHp <= 0) setSpecialTowerHp(null);
      }

      // =========================================================================
      // ENEMY AI: VAULT TARGETING & COMBAT
      // =========================================================================
      if (vaultFlash > 0) setVaultFlash((v) => Math.max(0, v - deltaTime));

      setEnemies((prev) =>
        prev
          .map((enemy) => {
            if (enemy.frozen || now < enemy.stunUntil) return enemy;
            const enemyPos = getEnemyPosWithPath(enemy, selectedMap);

            // 1. TAUNT LOGIC (Highest Priority)
            // If the enemy is taunted, they ignore the path and troops to hit the hero
            if (enemy.taunted && hero && !hero.dead) {
              const distToHero = distance(enemyPos, hero.pos);
              if (distToHero < 80) {
                // Slightly larger engagement for taunt - skip attacks when paused
                const effectiveEnemyAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
                if (!isPaused && now - (enemy.lastHeroAttack || 0) > effectiveEnemyAttackInterval) {
                  // Play hit effect but do NO damage if shield is active
                  if (hero.shieldActive) {
                    addParticles(hero.pos, "spark", 5);
                  } else {
                    // Apply damage and enemy abilities to hero
                    const abilities = applyEnemyAbilities(enemy, 'hero', now);
                    setHero((h) => {
                      if (!h) return null;
                      const updated = { ...h, hp: Math.max(0, h.hp - 20), lastCombatTime: Date.now() };

                      // Apply ability effects
                      if (abilities) {
                        if (abilities.burn) {
                          updated.burning = true;
                          updated.burnDamage = abilities.burn.damage;
                          updated.burnUntil = now + abilities.burn.duration;
                        }
                        if (abilities.slow) {
                          updated.slowed = true;
                          updated.slowIntensity = abilities.slow.intensity;
                          updated.slowUntil = now + abilities.slow.duration;
                        }
                        if (abilities.poison) {
                          updated.poisoned = true;
                          updated.poisonDamage = abilities.poison.damage;
                          updated.poisonUntil = now + abilities.poison.duration;
                        }
                        if (abilities.stun) {
                          updated.stunned = true;
                          updated.stunUntil = now + abilities.stun.duration;
                        }
                      }

                      return updated;
                    });
                  }
                  return {
                    ...enemy,
                    inCombat: true,
                    combatTarget: hero.id,
                    lastHeroAttack: now,
                    lastAbilityUse: now,
                    facingRight: getFacingRightFromDelta(
                      hero.pos.x - enemyPos.x,
                      hero.pos.y - enemyPos.y,
                      enemy.facingRight,
                    ),
                  };
                }
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: hero.id,
                  facingRight: getFacingRightFromDelta(
                    hero.pos.x - enemyPos.x,
                    hero.pos.y - enemyPos.y,
                    enemy.facingRight,
                  ),
                };
              } else {
                // TAUNTED MOVEMENT: Enemy moves toward hero instead of following path
                const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
                const moveSpeed = enemy.speed * speedMult * deltaTime * 0.8; // Slightly slower when taunted
                const dx = hero.pos.x - enemyPos.x;
                const dy = hero.pos.y - enemyPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                  const moveX = (dx / dist) * moveSpeed;
                  const moveY = (dy / dist) * moveSpeed;
                  // Update enemy position by adjusting progress along current path segment
                  // This is a workaround since enemies use path-based positioning
                  // We'll store an offset that gets applied in getEnemyPosWithPath
                  return {
                    ...enemy,
                    tauntOffset: {
                      x: (enemy.tauntOffset?.x || 0) + moveX,
                      y: (enemy.tauntOffset?.y || 0) + moveY,
                    },
                    inCombat: false, // Not in melee range yet
                  };
                }
              }
            }

            // 2. CHECK FOR VAULT LOGIC (Second Priority)
            if (
              vaultWorldPositions.length > 0 &&
              specialTowerHp !== null &&
              specialTowerHp > 0
            ) {
              const vaultImpactPos = getClosestVault(enemyPos, 70);
              if (vaultImpactPos) {
                // Scale enemy attack interval with game speed - skip when paused
                const effectiveVaultAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
                if (!isPaused && now - (enemy.lastTroopAttack || 0) > effectiveVaultAttackInterval) {
                  setSpecialTowerHp((prev) => {
                    // Skip if vault already destroyed
                    if (prev === null || prev <= 0) return prev;
                    const newVal = Math.max(0, prev - 25);
                    if (newVal <= 0) {
                      // Only subtract lives once when transitioning to destroyed
                      setLives((l) => Math.max(0, l - 5));
                      addParticles(vaultImpactPos, "explosion", 40);
                      return 0;
                    }
                    return newVal;
                  });
                  setVaultFlash(150);
                  addParticles(vaultImpactPos, "smoke", 3);
                  return {
                    ...enemy,
                    inCombat: true,
                    combatTarget: "vault_objective",
                    lastTroopAttack: now,
                    facingRight: getFacingRightFromDelta(
                      vaultImpactPos.x - enemyPos.x,
                      vaultImpactPos.y - enemyPos.y,
                      enemy.facingRight,
                    ),
                  };
                }
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: "vault_objective",
                  facingRight: getFacingRightFromDelta(
                    vaultImpactPos.x - enemyPos.x,
                    vaultImpactPos.y - enemyPos.y,
                    enemy.facingRight,
                  ),
                };
              }
            }
            // Hero Combat Check - skip attacks when paused
            const nearbyHero =
              hero &&
                !hero.dead &&
                distance(enemyPos, hero.pos) < 60 &&
                !ENEMY_DATA[enemy.type].flying
                ? hero
                : null;
            if (nearbyHero) {
              // Scale enemy attack interval with game speed
              const effectiveHeroAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
              if (!isPaused && now - enemy.lastHeroAttack > effectiveHeroAttackInterval) {
                if (!nearbyHero.shieldActive) {
                  // Apply damage and enemy abilities to hero
                  const abilities = applyEnemyAbilities(enemy, 'hero', now);
                  setHero((h) => {
                    if (!h) return null;
                    const updated = { ...h, hp: Math.max(0, h.hp - 20), lastCombatTime: Date.now() };

                    // Apply ability effects
                    if (abilities) {
                      if (abilities.burn) {
                        updated.burning = true;
                        updated.burnDamage = abilities.burn.damage;
                        updated.burnUntil = now + abilities.burn.duration;
                      }
                      if (abilities.slow) {
                        updated.slowed = true;
                        updated.slowIntensity = abilities.slow.intensity;
                        updated.slowUntil = now + abilities.slow.duration;
                      }
                      if (abilities.poison) {
                        updated.poisoned = true;
                        updated.poisonDamage = abilities.poison.damage;
                        updated.poisonUntil = now + abilities.poison.duration;
                      }
                      if (abilities.stun) {
                        updated.stunned = true;
                        updated.stunUntil = now + abilities.stun.duration;
                      }
                    }

                    return updated;
                  });
                  // Add melee attack visual effect based on enemy type
                  const attackAngle = Math.atan2(
                    nearbyHero.pos.y - enemyPos.y,
                    nearbyHero.pos.x - enemyPos.x
                  );
                  const effectType: EffectType =
                    ["golem", "juggernaut", "dean", "trustee"].includes(enemy.type)
                      ? "melee_smash"
                      : ["berserker", "shadow_knight"].includes(enemy.type)
                        ? "melee_slash"
                        : "melee_swipe";
                  setEffects((ef) => [
                    ...ef,
                    {
                      id: generateId("eff"),
                      pos: {
                        x: (enemyPos.x + nearbyHero.pos.x) / 2,
                        y: (enemyPos.y + nearbyHero.pos.y) / 2,
                      },
                      type: effectType,
                      progress: 0,
                      size: 40,
                      slashAngle: attackAngle,
                      attackerType: "enemy",
                    },
                  ]);
                } else {
                  addParticles(nearbyHero.pos, "spark", 5); // Visual feedback of "Blocked"
                }
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: nearbyHero.id,
                  lastHeroAttack: now,
                  facingRight: getFacingRightFromDelta(
                    nearbyHero.pos.x - enemyPos.x,
                    nearbyHero.pos.y - enemyPos.y,
                    enemy.facingRight,
                  ),
                };
              }

              return {
                ...enemy,
                inCombat: true,
                combatTarget: nearbyHero.id,
                facingRight: getFacingRightFromDelta(
                  nearbyHero.pos.x - enemyPos.x,
                  nearbyHero.pos.y - enemyPos.y,
                  enemy.facingRight,
                ),
              };
            }

            // Troop Combat Check - skip if enemy has breakthrough or is flying
            const enemyData = ENEMY_DATA[enemy.type];
            const canEngageTroops = !enemyData.flying && !enemyData.breakthrough;
            const nearbyTroop = canEngageTroops
              ? getNearestTroop(enemyPos, 60)
              : null;
            if (nearbyTroop) {
              return {
                ...enemy,
                inCombat: true,
                combatTarget: nearbyTroop.id,
                facingRight: getFacingRightFromDelta(
                  nearbyTroop.pos.x - enemyPos.x,
                  nearbyTroop.pos.y - enemyPos.y,
                  enemy.facingRight,
                ),
              };
            }

            // Movement logic - normalize speed by segment length for consistent world-space speed
            if (!enemy.inCombat) {
              const pathKey = enemy.pathKey || selectedMap;
              const path = MAP_PATHS[pathKey];
              if (!path || path.length < 2) return { ...enemy, inCombat: false };
              const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
              const segmentLength = getPathSegmentLength(enemy.pathIndex, pathKey);
              const worldAdvance =
                (enemy.speed * speedMult * deltaTime * TILE_SIZE) / 200;
              let nextPathIndex = enemy.pathIndex;
              let currentSegmentLength = Math.max(1, segmentLength);
              let segmentDistance =
                enemy.progress * currentSegmentLength + worldAdvance;

              while (
                segmentDistance >= currentSegmentLength &&
                nextPathIndex < path.length - 1
              ) {
                segmentDistance -= currentSegmentLength;
                nextPathIndex += 1;
                currentSegmentLength = Math.max(
                  1,
                  getPathSegmentLength(nextPathIndex, pathKey)
                );
              }

              if (nextPathIndex >= path.length - 1) {
                const liveCost = ENEMY_DATA[enemy.type].liveCost || 1;
                setLives((l) => Math.max(0, l - liveCost));
                return null;
              }

              return {
                ...enemy,
                pathIndex: nextPathIndex,
                progress: Math.max(
                  0,
                  Math.min(0.999, segmentDistance / currentSegmentLength)
                ),
              };
            }
            return { ...enemy, inCombat: false };
          })
          .filter(isDefined)
      );

      // Hero death check & shield maintainance
      if (hero && !hero.dead) {
        if (hero.hp <= 0) {
          setHero((prev) =>
            prev
              ? {
                ...prev,
                hp: 0,
                dead: true,
                respawnTimer: HERO_RESPAWN_TIME,
                selected: false,
                moving: false,
              }
              : null
          );
          // Clear taunts when hero dies
          setEnemies((prev) =>
            prev.map((e) => ({ ...e, taunted: false, tauntTarget: undefined, tauntOffset: undefined }))
          );

          addParticles(hero.pos, "explosion", 20);
          addParticles(hero.pos, "smoke", 10);
        }
        // Shield Expiration Logic
        if (hero.shieldActive && now > (hero.shieldEnd || 0)) {
          setHero((prev) => (prev ? { ...prev, shieldActive: false } : null));
          // Clear taunts from all enemies (including taunt offset)
          setEnemies((prev) =>
            prev.map((e) => ({ ...e, taunted: false, tauntTarget: undefined, tauntOffset: undefined }))
          );
        }
      }

      // Hero respawn timer
      if (hero && hero.dead && hero.respawnTimer > 0) {
        setHero((prev) => {
          if (!prev) return null;
          const newTimer = prev.respawnTimer - deltaTime;
          if (newTimer <= 0) {
            const levelSettings = LEVEL_DATA[selectedMap];
            const defaultPathKey = activeWaveSpawnPaths[0] ?? selectedMap;
            const path = MAP_PATHS[defaultPathKey] ?? MAP_PATHS.poe ?? [];
            if (path.length === 0) return { ...prev, respawnTimer: 0 };
            // Respawn at end of path (same as initial spawn)
            const defaultRespawnNode = path[Math.max(0, path.length - 4)] ?? path[path.length - 1];
            const respawnNode = levelSettings?.heroSpawn ?? defaultRespawnNode;
            if (!respawnNode) return { ...prev, respawnTimer: 0 };
            const startPos = gridToWorldPath(respawnNode);
            return {
              ...prev,
              dead: false,
              respawnTimer: 0,
              hp: prev.maxHp,
              pos: startPos,
              rotation: Math.PI, // Face towards enemies
              facingRight: false,
            };
          }
          return { ...prev, respawnTimer: newTimer };
        });
      }

      // First pass: Calculate troop damage from enemies - skip when paused
      const troopDamage: { [id: string]: number } = {};
      const enemiesAttackingTroops: { [enemyId: string]: string } = {};
      const troopAbilityEffects: {
        [troopId: string]: {
          burn?: { damage: number; until: number };
          slow?: { intensity: number; until: number };
          poison?: { damage: number; until: number };
          stun?: { until: number };
        }
      } = {};

      if (!isPaused) {
        // Scale enemy attack interval with game speed
        const effectiveTroopAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
        enemies.forEach((enemy) => {
          if (enemy.frozen || now < enemy.stunUntil) return;
          const eData = ENEMY_DATA[enemy.type];
          // Skip flying enemies and breakthrough enemies (they don't stop for troops)
          if (eData.flying || eData.breakthrough) return;
          if (now - enemy.lastTroopAttack <= effectiveTroopAttackInterval) return;

          const enemyPos = getEnemyPosCached(enemy);

          // Check if hero is nearby (hero takes combat priority over troops)
          const heroNearby =
            hero && !hero.dead && distance(enemyPos, hero.pos) < 60;
          if (heroNearby) return; // Hero will handle this enemy

          // Check for nearby troop
          const nearbyTroop = getNearestTroop(enemyPos, 60);
          if (nearbyTroop) {
            const damage = eData.troopDamage ?? 22;
            troopDamage[nearbyTroop.id] = (troopDamage[nearbyTroop.id] || 0) + damage;
            enemiesAttackingTroops[enemy.id] = nearbyTroop.id;

            // Apply enemy abilities to troop
            const abilities = applyEnemyAbilities(enemy, 'troop', now);
            if (abilities) {
              const existing = troopAbilityEffects[nearbyTroop.id] || {};
              if (abilities.burn) {
                existing.burn = { damage: abilities.burn.damage, until: now + abilities.burn.duration };
              }
              if (abilities.slow) {
                existing.slow = { intensity: abilities.slow.intensity, until: now + abilities.slow.duration };
              }
              if (abilities.poison) {
                existing.poison = { damage: abilities.poison.damage, until: now + abilities.poison.duration };
              }
              if (abilities.stun) {
                existing.stun = { until: now + abilities.stun.duration };
              }
              troopAbilityEffects[nearbyTroop.id] = existing;

              // Update enemy's last ability time
              enemy.lastAbilityUse = now;
            }
          }
        });

        // Flying enemies with targetsTroops can attack troops while passing by (without stopping)
        enemies.forEach((enemy) => {
          if (enemy.frozen || now < enemy.stunUntil) return;
          const flyingData = ENEMY_DATA[enemy.type];
          // Only process non-ranged flying enemies (ranged flyers use the projectile path)
          if (!flyingData.flying || !flyingData.targetsTroops || flyingData.isRanged) return;

          const attackSpeed = flyingData.troopAttackSpeed || 2000;
          const effectiveAttackInterval = gameSpeed > 0 ? attackSpeed / gameSpeed : attackSpeed;
          if (now - enemy.lastTroopAttack <= effectiveAttackInterval) return;

          const enemyPos = getEnemyPosCached(enemy);

          // Flying enemies can attack troops within a larger range (swooping attacks)
          const attackRange = 80;
          const nearbyTroop = getNearestTroop(enemyPos, attackRange);
          if (nearbyTroop) {
            const damage = flyingData.troopDamage || 20;
            troopDamage[nearbyTroop.id] = (troopDamage[nearbyTroop.id] || 0) + damage;
            enemiesAttackingTroops[enemy.id] = nearbyTroop.id;

            // Flying enemies don't stop - they continue moving
            // But we track that they attacked
            enemy.lastTroopAttack = now;
          }
        });
      } // End of !isPaused check for enemy attacks on troops

      // Calculate which troops will die based on damage
      const deathsToQueue: Array<{
        ownerId: string;
        slot: number;
        respawnPos: Position;
        troopType: string;
        troopId: string;
      }> = [];
      const troopsThatWillDie = new Set<string>();

      for (const troop of troops) {
        const damage = troopDamage[troop.id] || 0;
        if (damage > 0 && troop.hp - damage <= 0) {
          troopsThatWillDie.add(troop.id);
          addParticles(troop.pos, "explosion", 8);
          if (troop.ownerId && !troop.ownerId.startsWith("spell")) {
            deathsToQueue.push({
              ownerId: troop.ownerId,
              slot: troop.spawnSlot ?? 0,
              respawnPos: troop.userTargetPos || troop.spawnPoint || troop.pos,
              troopType: troop.type || "footsoldier",
              troopId: troop.id,
            });
          }
        }
      }

      // Apply troop damage, status effects, and remove dead troops
      if (Object.keys(troopDamage).length > 0 || Object.keys(troopAbilityEffects).length > 0) {
        setTroops((prevTroops) => {
          return prevTroops
            .filter((troop) => !troopsThatWillDie.has(troop.id))
            .map((troop) => {
              const damage = troopDamage[troop.id] || 0;
              const effects = troopAbilityEffects[troop.id];

              const updatedTroop = { ...troop };

              if (damage > 0) {
                updatedTroop.hp = troop.hp - damage;
                updatedTroop.lastCombatTime = Date.now();
              }

              // Apply ability effects
              if (effects) {
                if (effects.burn) {
                  updatedTroop.burning = true;
                  updatedTroop.burnDamage = effects.burn.damage;
                  updatedTroop.burnUntil = effects.burn.until;
                }
                if (effects.slow) {
                  updatedTroop.slowed = true;
                  updatedTroop.slowIntensity = effects.slow.intensity;
                  updatedTroop.slowUntil = effects.slow.until;
                }
                if (effects.poison) {
                  updatedTroop.poisoned = true;
                  updatedTroop.poisonDamage = effects.poison.damage;
                  updatedTroop.poisonUntil = effects.poison.until;
                }
                if (effects.stun) {
                  updatedTroop.stunned = true;
                  updatedTroop.stunUntil = effects.stun.until;
                }
              }

              return updatedTroop;
            });
        });
      }

      // Queue respawns on towers
      if (deathsToQueue.length > 0) {
        const deathsByOwner = new Map<string, (typeof deathsToQueue)[number][]>();
        deathsToQueue.forEach((death) => {
          const ownerDeaths = deathsByOwner.get(death.ownerId);
          if (ownerDeaths) {
            ownerDeaths.push(death);
          } else {
            deathsByOwner.set(death.ownerId, [death]);
          }
        });

        setTowers((prevTowers) =>
          prevTowers.map((t) => {
            const deaths = deathsByOwner.get(t.id);
            if (!deaths || deaths.length === 0) return t;

            const existing = t.pendingRespawns || [];
            const newRespawns = deaths.filter(
              (d) => !existing.some((e) => e.slot === d.slot)
            );

            if (newRespawns.length === 0) return t;

            return {
              ...t,
              pendingRespawns: [
                ...existing,
                ...newRespawns.map((d) => ({
                  slot: d.slot,
                  timer: TROOP_RESPAWN_TIME,
                  respawnPos: d.respawnPos,
                  troopType: d.troopType,
                })),
              ],
            };
          })
        );
      }

      // Update enemies
      setEnemies((prev) =>
        prev
          .map((enemy) => {
            // Process burning damage
            if (enemy.burning && enemy.burnUntil && now < enemy.burnUntil) {
              const burnDmg = ((enemy.burnDamage || 10) * deltaTime) / 1000;
              const newHp = enemy.hp - burnDmg;
              if (newHp <= 0) {
                onEnemyKill(enemy, getEnemyPosCached(enemy), 8, "fire");
                return null;
              }
              enemy = { ...enemy, hp: newHp };
            } else if (
              enemy.burning &&
              enemy.burnUntil &&
              now >= enemy.burnUntil
            ) {
              enemy = { ...enemy, burning: false, burnDamage: 0, burnUntil: 0 };
            }
            // Regenerating enemies heal 1.5% max HP/sec when not in combat
            const eTraits = ENEMY_DATA[enemy.type].traits;
            if (eTraits?.includes("regenerating") && !enemy.inCombat && enemy.hp < enemy.maxHp) {
              const regenAmount = (enemy.maxHp * 0.015 * deltaTime) / 1000;
              enemy = { ...enemy, hp: Math.min(enemy.maxHp, enemy.hp + regenAmount) };
            }
            // Clear frozen state when stun duration expires
            if (enemy.frozen && enemy.stunUntil && now >= enemy.stunUntil) {
              enemy = { ...enemy, frozen: false };
            }
            if (enemy.frozen || now < enemy.stunUntil) {
              return {
                ...enemy,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
              };
            }
            const enemyPosForCombat = getEnemyPosCached(enemy);
            // Check for nearby hero combat
            const nearbyHero =
              hero &&
                !hero.dead &&
                distance(enemyPosForCombat, hero.pos) <
                60 &&
                !ENEMY_DATA[enemy.type].flying
                ? hero
                : null;
            if (nearbyHero) {
              // Scale enemy attack interval with game speed - skip when paused
              const effectiveHeroAttackInterval2 = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
              if (!isPaused && now - enemy.lastHeroAttack > effectiveHeroAttackInterval2) {
                setHero((prevHero) => {
                  if (!prevHero || prevHero.dead) return prevHero;
                  const heroDamage = ENEMY_DATA[enemy.type].troopDamage ?? 28;
                  const newHp = prevHero.hp - heroDamage;
                  if (newHp <= 0) {
                    addParticles(prevHero.pos, "explosion", 12);
                    return {
                      ...prevHero,
                      hp: 0,
                      dead: true,
                      respawnTimer: HERO_RESPAWN_TIME,
                    };
                  }
                  return { ...prevHero, hp: newHp };
                });
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: nearbyHero.id,
                  lastHeroAttack: now,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                  facingRight: getFacingRightFromDelta(
                    nearbyHero.pos.x - enemyPosForCombat.x,
                    nearbyHero.pos.y - enemyPosForCombat.y,
                    enemy.facingRight,
                  ),
                };
              }
              return {
                ...enemy,
                inCombat: true,
                combatTarget: nearbyHero.id,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                facingRight: getFacingRightFromDelta(
                  nearbyHero.pos.x - enemyPosForCombat.x,
                  nearbyHero.pos.y - enemyPosForCombat.y,
                  enemy.facingRight,
                ),
              };
            }
            // Check for nearby troop combat (damage already applied above)
            // Skip if enemy is flying or has breakthrough
            const enemyDataCheck = ENEMY_DATA[enemy.type];
            const nearbyTroop =
              !enemyDataCheck.flying && !enemyDataCheck.breakthrough
                ? getNearestTroop(enemyPosForCombat, 60)
                : null;
            if (nearbyTroop) {
              // Check if this enemy attacked this frame
              const attackedThisFrame =
                enemiesAttackingTroops[enemy.id] === nearbyTroop.id;
              const troopFacing = getFacingRightFromDelta(
                nearbyTroop.pos.x - enemyPosForCombat.x,
                nearbyTroop.pos.y - enemyPosForCombat.y,
                enemy.facingRight,
              );
              if (attackedThisFrame) {
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: nearbyTroop.id,
                  lastTroopAttack: now,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                  facingRight: troopFacing,
                };
              }
              return {
                ...enemy,
                inCombat: true,
                combatTarget: nearbyTroop.id,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                facingRight: troopFacing,
              };
            }
            if (enemy.inCombat && !nearbyTroop && !nearbyHero) {
              // Ranged enemies: let the ranged targeting path manage their combat state
              if (!ENEMY_DATA[enemy.type].isRanged) {
                return {
                  ...enemy,
                  inCombat: false,
                  combatTarget: undefined,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                };
              }
            }
            // Ranged enemy attacks - they stop and attack when target in range
            const enemyData = ENEMY_DATA[enemy.type];
            if (
              enemyData.isRanged &&
              enemyData.range &&
              enemyData.attackSpeed
            ) {
              const enemyPos = enemyPosForCombat;
              // Check for targets in range (hero and troops)
              let rangedTarget: {
                type: "hero" | "troop";
                pos: Position;
                id: string;
              } | null = null;
              if (
                hero &&
                !hero.dead &&
                distance(enemyPos, hero.pos) <= enemyData.range
              ) {
                rangedTarget = { type: "hero", pos: hero.pos, id: hero.id };
              } else {
                const targetTroop = getNearestTroop(
                  enemyPos,
                  enemyData.range || 120
                );
                if (targetTroop) {
                  rangedTarget = {
                    type: "troop",
                    pos: targetTroop.pos,
                    id: targetTroop.id,
                  };
                }
              }

              // If ranged enemy has a target in range, stop and attack
              if (rangedTarget) {
                enemy = {
                  ...enemy,
                  inCombat: true,
                  combatTarget: rangedTarget.id,
                  facingRight: getFacingRightFromDelta(
                    rangedTarget.pos.x - enemyPos.x,
                    rangedTarget.pos.y - enemyPos.y,
                    enemy.facingRight,
                  ),
                };

                // Scale ranged enemy attack speed with game speed - skip when paused
                const effectiveRangedAttackSpeed = gameSpeed > 0 ? enemyData.attackSpeed / gameSpeed : enemyData.attackSpeed;
                if (!isPaused && now - enemy.lastRangedAttack > effectiveRangedAttackSpeed) {
                  // Create projectile with enemy-specific type
                  const projType = (() => {
                    switch (enemy.type) {
                      case "mage":
                        return "fireball";
                      case "warlock":
                        return "magicBolt";
                      case "hexer":
                        return "poisonBolt";
                      case "necromancer":
                        return "darkBolt";
                      case "catapult":
                        return "rock";
                      case "crossbowman":
                        return "bolt";
                      case "harpy":
                        return "arrow";
                      case "wyvern":
                        return "wyvernBolt";
                      case "frostling":
                        return "frostBolt";
                      case "infernal":
                        return "infernalFire";
                      case "banshee":
                        return "bansheeScream";
                      case "dragon":
                        return "fireball";
                      default:
                        return "arrow";
                    }
                  })();

                  // Determine if this is an AoE attack
                  const isAoEAttack = ["catapult", "dragon", "infernal", "wyvern"].includes(enemy.type);
                  const aoeRadius = isAoEAttack
                    ? (enemy.type === "dragon" ? 80 : enemy.type === "wyvern" ? 70 : enemy.type === "catapult" ? 60 : 50)
                    : 0;

                  // Calculate arc height for projectiles that should arc
                  const arcHeight = ["rock", "fireball"].includes(projType) ? 50 : 0;

                  // Flying enemies shoot from above — projectile starts elevated and descends
                  const elevation = enemyData.flying ? 30 : 0;

                  setProjectiles((proj) => [
                    ...proj,
                    {
                      id: generateId("eproj"),
                      from: { x: enemyPos.x, y: enemyPos.y - 15 },
                      to: rangedTarget!.pos,
                      progress: 0,
                      type: projType,
                      rotation: Math.atan2(
                        rangedTarget!.pos.y - enemyPos.y,
                        rangedTarget!.pos.x - enemyPos.x
                      ),
                      damage: enemyData.projectileDamage || 15,
                      targetType: rangedTarget!.type,
                      targetId: rangedTarget!.id,
                      arcHeight: arcHeight,
                      elevation: elevation,
                      isAoE: isAoEAttack,
                      aoeRadius: aoeRadius,
                      scale: enemy.type === "dragon" ? 1.5 : undefined,
                    },
                  ]);
                  return {
                    ...enemy,
                    lastRangedAttack: now,
                    damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                    // Don't move - attacking from range
                  };
                }
                // Has target but on cooldown - still stop and face target
                return {
                  ...enemy,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                  // Don't move - waiting for attack cooldown
                };
              }
              // Ranged enemy lost its target — clear combat state
              if (enemy.inCombat) {
                enemy = { ...enemy, inCombat: false, combatTarget: undefined };
              }
            }
            // Update slowed visual indicator
            const slowedVisual = enemy.slowEffect > 0;
            const slowIntensity = enemy.slowEffect;
            const decayedSlow = Math.max(0, enemy.slowEffect - deltaTime / 5000);
            const decayedSlowSource = decayedSlow > 0 ? enemy.slowSource : undefined;
            // Move enemy along path - normalize speed by segment length for consistent world-space speed
            if (!enemy.inCombat) {
              // Use enemy's pathKey for dual-path support
              const pathKey = enemy.pathKey || selectedMap;
              const path = MAP_PATHS[pathKey];
              if (!path || path.length < 2) {
                return {
                  ...enemy,
                  slowEffect: decayedSlow,
                  slowSource: decayedSlowSource,
                  slowed: slowedVisual,
                  slowIntensity: slowIntensity,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                };
              }
              const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
              const segmentLength = getPathSegmentLength(enemy.pathIndex, pathKey);
              const worldAdvance =
                (ENEMY_DATA[enemy.type].speed * speedMult * deltaTime * TILE_SIZE) / 1000;
              let nextPathIndex = enemy.pathIndex;
              let currentSegmentLength = Math.max(1, segmentLength);
              let segmentDistance =
                enemy.progress * currentSegmentLength + worldAdvance;

              while (
                segmentDistance >= currentSegmentLength &&
                nextPathIndex < path.length - 1
              ) {
                segmentDistance -= currentSegmentLength;
                nextPathIndex += 1;
                currentSegmentLength = Math.max(
                  1,
                  getPathSegmentLength(nextPathIndex, pathKey)
                );
              }

              // Compute facing direction from destination segment
              const segIdx = Math.min(nextPathIndex, path.length - 2);
              const segStart = path[segIdx];
              const segEnd = path[segIdx + 1] || segStart;
              const facingRight = getFacingRightFromDelta(
                segEnd.x - segStart.x,
                segEnd.y - segStart.y,
              );

              if (nextPathIndex >= path.length - 1) {
                const liveCost = ENEMY_DATA[enemy.type].liveCost || 1;
                setLives((l) => Math.max(0, l - liveCost));
                return null;
              }

              return {
                ...enemy,
                pathIndex: nextPathIndex,
                progress: Math.max(
                  0,
                  Math.min(0.999, segmentDistance / currentSegmentLength)
                ),
                slowEffect: decayedSlow,
                slowSource: decayedSlowSource,
                slowed: slowedVisual,
                slowIntensity: slowIntensity,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                facingRight,
              };
            }
            return {
              ...enemy,
              slowed: slowedVisual,
              slowIntensity: slowIntensity,
              damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
            };
          })
          .filter(isDefined)
      );
      // Soft-repulsion lane spreading: push nearby same-layer enemies apart
      // laterally instead of hard blocking. Enemies always move forward at
      // their natural speed; only the lateral (perpendicular) offset changes.
      setEnemies((prev) => {
        if (prev.length <= 1) return prev;

        type LaneEntry = {
          index: number;
          pathKey: string;
          isFlying: boolean;
          progressMetric: number;
          laneOffset: number;
          formationOffset: number;
        };

        const layerBuckets = new Map<string, LaneEntry[]>();
        const entries: LaneEntry[] = new Array(prev.length);

        for (let i = 0; i < prev.length; i++) {
          const enemy = prev[i];
          const pathKey = enemy.pathKey || selectedMap;
          const isFlying = ENEMY_DATA[enemy.type].flying;
          const preferredLane = clampLaneIndex(
            typeof enemy.formationLane === "number"
              ? enemy.formationLane
              : ENEMY_CENTER_LANE_INDEX
          );
          const entry: LaneEntry = {
            index: i,
            pathKey,
            isFlying,
            progressMetric: enemy.pathIndex + enemy.progress,
            laneOffset: enemy.laneOffset,
            formationOffset: ENEMY_LANE_OFFSETS[preferredLane] ?? 0,
          };
          entries[i] = entry;
          const layerKey = `${pathKey}:${isFlying ? "f" : "g"}`;
          const bucket = layerBuckets.get(layerKey);
          if (bucket) bucket.push(entry);
          else layerBuckets.set(layerKey, [entry]);
        }

        layerBuckets.forEach((bucket) =>
          bucket.sort((a, b) => a.progressMetric - b.progressMetric)
        );

        let hasChanges = false;
        const updated = prev.map((enemy, i) => {
          const entry = entries[i];
          if (
            enemy.inCombat ||
            enemy.taunted ||
            enemy.frozen ||
            now < enemy.stunUntil
          )
            return enemy;

          const layerKey = `${entry.pathKey}:${entry.isFlying ? "f" : "g"}`;
          const bucket = layerBuckets.get(layerKey);
          if (!bucket || bucket.length <= 1) return enemy;

          let lateralPush = 0;
          for (const other of bucket) {
            if (other.index === i) continue;
            const progressDist = Math.abs(
              other.progressMetric - entry.progressMetric
            );
            if (progressDist > ENEMY_REPULSION_PROGRESS_RADIUS) continue;

            const lateralDiff = entry.laneOffset - other.laneOffset;
            const absLateral = Math.abs(lateralDiff);
            const proximityFactor =
              1 - progressDist / ENEMY_REPULSION_PROGRESS_RADIUS;

            if (absLateral < 0.05) {
              const sign = enemy.id > prev[other.index].id ? 1 : -1;
              lateralPush +=
                sign * ENEMY_REPULSION_LATERAL_STRENGTH * proximityFactor;
            } else {
              const sign = lateralDiff > 0 ? 1 : -1;
              lateralPush +=
                (sign * ENEMY_REPULSION_LATERAL_STRENGTH * proximityFactor) /
                (1 + absLateral * 4);
            }
          }

          const formationPull =
            (entry.formationOffset - entry.laneOffset) *
            ENEMY_FORMATION_PULL_STRENGTH;

          const totalForce = lateralPush + formationPull;
          const laneBlend = Math.min(1, deltaTime / ENEMY_LANE_SHIFT_MS);
          const nextLaneOffset = clampLaneOffset(
            entry.laneOffset + totalForce * laneBlend
          );

          const preferredLane = clampLaneIndex(
            typeof enemy.formationLane === "number"
              ? enemy.formationLane
              : ENEMY_CENTER_LANE_INDEX
          );

          if (
            Math.abs(nextLaneOffset - enemy.laneOffset) > 0.0005 ||
            enemy.formationLane !== preferredLane
          ) {
            hasChanges = true;
            return {
              ...enemy,
              laneOffset: nextLaneOffset,
              formationLane: preferredLane,
            };
          }
          return enemy;
        });
        return hasChanges ? updated : prev;
      });
      // Summoner enemies spawn minions periodically
      setEnemies((prev) => {
        const summoned: Enemy[] = [];
        let hasSummonUpdates = false;
        const updated = prev.map((enemy) => {
          const eData = ENEMY_DATA[enemy.type];
          if (!eData.traits?.includes("summoner")) return enemy;
          const SUMMON_COOLDOWN = 8000;
          if (enemy.lastSummon && now - enemy.lastSummon < SUMMON_COOLDOWN) return enemy;
          if (enemy.inCombat || enemy.frozen || now < enemy.stunUntil) return enemy;
          const minion: Enemy = {
            id: generateId("minion"),
            type: "cultist",
            pathIndex: Math.max(0, enemy.pathIndex - 1),
            progress: enemy.progress,
            hp: ENEMY_DATA["cultist"].hp,
            maxHp: ENEMY_DATA["cultist"].hp,
            speed: ENEMY_DATA["cultist"].speed,
            slowEffect: 0,
            stunUntil: 0,
            frozen: false,
            damageFlash: 0,
            inCombat: false,
            lastTroopAttack: 0,
            lastHeroAttack: 0,
            lastRangedAttack: 0,
            spawnProgress: 0.1,
            laneOffset: clampLaneOffset(
              enemy.laneOffset + (Math.random() - 0.5) * ENEMY_SPAWN_LANE_JITTER
            ),
            formationLane:
              typeof enemy.formationLane === "number"
                ? clampLaneIndex(enemy.formationLane)
                : getNearestLaneIndex(enemy.laneOffset),
            slowed: false,
            slowIntensity: 0,
            pathKey: enemy.pathKey,
          };
          summoned.push(minion);
          addParticles(getEnemyPosCached(enemy), "summon", 6);
          hasSummonUpdates = true;
          return { ...enemy, lastSummon: now };
        });
        if (summoned.length === 0 && !hasSummonUpdates) {
          return prev;
        }
        return summoned.length > 0 ? [...updated, ...summoned] : updated;
      });

      // Unified separation forces for all friendly units (hero + troops).
      // Computed once, applied to both hero and troops for consistent behaviour.
      const friendlyUnits: { id: string; pos: Position }[] = troops
        .filter((t) => !t.dead)
        .map((t) => ({ id: t.id, pos: t.pos }));
      if (hero && !hero.dead) {
        friendlyUnits.push({ id: hero.id, pos: hero.pos });
      }
      const friendlySeparation = computeSeparationForces(
        friendlyUnits,
        TROOP_SEPARATION_DIST,
        1.35
      );

      // Update hero movement - with sight-based engagement
      if (hero && !hero.dead) {
        setHero((prev) => {
          if (!prev || prev.dead) return prev;

          const heroData = HERO_DATA[prev.type];
          const slowMultiplier =
            prev.slowed && prev.slowIntensity ? 1 - prev.slowIntensity : 1;
          const speed = heroData.speed * slowMultiplier;
          const isRanged = heroData.isRanged || false;
          const attackRange = heroData.range;
          const sightRange = isRanged
            ? HERO_RANGED_SIGHT_RANGE
            : HERO_SIGHT_RANGE;

          let closestEnemy = getClosestEnemy(
            prev.pos,
            sightRange,
            (enemy) => !ENEMY_DATA[enemy.type].flying
          );
          let closestDist = closestEnemy
            ? distance(prev.pos, getEnemyPosCached(closestEnemy))
            : Number.POSITIVE_INFINITY;

          // Ally alert: if no enemy in direct sight and not player-moving,
          // check if nearby troops are in combat and join the fight
          if (!closestEnemy && !prev.moving) {
            const troopAllies = troops
              .filter((t) => !t.dead)
              .map((t) => ({ pos: t.pos, engaging: !!t.engaging }));

            const alertResult = findAllyAlertTarget(
              prev.pos, troopAllies, enemies, getEnemyPosCached,
              sightRange + ALLY_ALERT_RANGE, (e) => !ENEMY_DATA[e.type].flying,
            );
            if (alertResult) {
              closestEnemy = alertResult.enemy;
              closestDist = alertResult.dist;
            }
          }

          // Determine home position (where the hero should return to)
          const homePos = prev.homePos || prev.pos;

          // If player is commanding movement, prioritize that
          if (prev.moving && prev.targetPos) {
            const step = stepTowardTarget({
              current: prev.pos,
              target: prev.targetPos,
              speed,
              deltaTime,
              stopDistance: 5,
            });

            if (step.reached) {
              return {
                ...prev,
                pos: prev.targetPos,
                moving: false,
                targetPos: undefined,
                homePos: prev.targetPos, // Update home position when reaching destination
                aggroTarget: undefined,
                returning: false,
                rotation: step.rotation,
                facingRight: getFacingRightFromDelta(
                  prev.targetPos.x - prev.pos.x,
                  prev.targetPos.y - prev.pos.y,
                  prev.facingRight ?? true,
                ),
              };
            }
            return {
              ...prev,
              pos: step.pos,
              rotation: step.rotation,
              facingRight: step.facingRight,
              homePos: prev.targetPos,
              aggroTarget: undefined,
              returning: false,
            };
          }

          if (closestEnemy) {
            // Enemy in sight - engage!
            const enemyPos = getEnemyPosCached(closestEnemy);

            // Ranged heroes: stay at attack range and don't rush in
            // Melee heroes: rush in to melee range
            // Ranged heroes will switch to melee if enemy gets too close
            const effectiveAttackRange = isRanged
              ? closestDist <= MELEE_RANGE
                ? MELEE_RANGE
                : attackRange
              : MELEE_RANGE;

            if (closestDist > effectiveAttackRange) {
              // Enemy in sight but out of attack range
              // Melee heroes: always move toward enemy
              // Ranged heroes: only move if enemy is beyond attack range
              const shouldMove = !isRanged || closestDist > attackRange;

              if (shouldMove) {
                // For ranged heroes, stop at attack range - 20 (safe distance)
                // For melee heroes, get as close as possible
                const targetDist = isRanged
                  ? Math.max(MELEE_RANGE, attackRange - 20)
                  : MELEE_RANGE;
                const step = stepTowardTarget({
                  current: prev.pos,
                  target: enemyPos,
                  speed,
                  deltaTime,
                  stopDistance: targetDist,
                });

                if (!step.reached) {
                  return {
                    ...prev,
                    pos: step.pos,
                    rotation: step.rotation,
                    facingRight: step.facingRight,
                    aggroTarget: closestEnemy.id,
                    returning: false,
                  };
                }
              }

              // Ranged hero at attack range - face enemy but don't move
              const dx = enemyPos.x - prev.pos.x;
              const dy = enemyPos.y - prev.pos.y;
              return {
                ...prev,
                rotation: Math.atan2(dy, dx),
                facingRight: getFacingRightFromDelta(dx, dy, prev.facingRight ?? true),
                aggroTarget: closestEnemy.id,
                returning: false,
              };
            } else {
              // Within attack range - face enemy but don't move
              const dx = enemyPos.x - prev.pos.x;
              const dy = enemyPos.y - prev.pos.y;
              return {
                ...prev,
                rotation: Math.atan2(dy, dx),
                facingRight: getFacingRightFromDelta(dx, dy, prev.facingRight ?? true),
                aggroTarget: closestEnemy.id,
                returning: false,
              };
            }
          } else if (homePos) {
            // No enemy in sight but was in combat - return home
            const step = stepTowardTarget({
              current: prev.pos,
              target: homePos,
              speed,
              deltaTime,
              stopDistance: 8,
            });

            if (!step.reached) {
              return {
                ...prev,
                pos: step.pos,
                rotation: step.rotation,
                facingRight: step.facingRight,
                aggroTarget: undefined,
                returning: true,
              };
            } else {
              // At home - stop
              return {
                ...prev,
                aggroTarget: undefined,
                returning: false,
                moving: false,
              };
            }
          }

          return prev;
        });
        // Apply unified separation force to hero
        setHero((prev) => {
          if (!prev || prev.dead) return prev;
          const force = friendlySeparation.get(prev.id);
          if (
            !force ||
            (Math.abs(force.x) < 0.0001 && Math.abs(force.y) < 0.0001)
          )
            return prev;
          return {
            ...prev,
            pos: {
              x: prev.pos.x + force.x * deltaTime * FRIENDLY_SEPARATION_MULT,
              y: prev.pos.y + force.y * deltaTime * FRIENDLY_SEPARATION_MULT,
            },
          };
        });
      }
      // Update troop movement - with sight-based engagement
      setTroops((prev) => {
        // Update positions with sight-based engagement
        return prev.map((troop) => {
          const updated = { ...troop };
          if (!troop.type) return updated; // Skip troops without type
          const troopData = TROOP_DATA[troop.type];
          if (!troopData) return updated; // Skip if no troop data

          // ========== PROCESS STATUS EFFECTS ==========
          const currentTime = Date.now();
          // Clear expired effects
          if (updated.burnUntil && currentTime > updated.burnUntil) {
            updated.burning = false;
            updated.burnDamage = undefined;
            updated.burnUntil = undefined;
          }
          if (updated.slowUntil && currentTime > updated.slowUntil) {
            updated.slowed = false;
            updated.slowIntensity = undefined;
            updated.slowUntil = undefined;
          }
          if (updated.poisonUntil && currentTime > updated.poisonUntil) {
            updated.poisoned = false;
            updated.poisonDamage = undefined;
            updated.poisonUntil = undefined;
          }
          if (updated.stunUntil && currentTime > updated.stunUntil) {
            updated.stunned = false;
            updated.stunUntil = undefined;
          }

          // Apply damage-over-time effects (once per second, scaled by deltaTime)
          const dotTick = deltaTime / 1000; // Normalize to per-second
          if (updated.burning && updated.burnDamage) {
            updated.hp = Math.max(0, updated.hp - updated.burnDamage * dotTick);
          }
          if (updated.poisoned && updated.poisonDamage) {
            updated.hp = Math.max(0, updated.hp - updated.poisonDamage * dotTick);
          }

          // If stunned, skip movement/engagement
          if (updated.stunned && updated.stunUntil && currentTime < updated.stunUntil) {
            // Stunned - can't move or attack, just stand there
            updated.engaging = false;
            updated.moving = false;
            return updated;
          }

          const isRanged = troop.overrideIsRanged ?? troopData.isRanged;
          const isStationary = troopData.isStationary || troop.moveRadius === 0; // Turrets can't move
          const attackRange = isRanged
            ? troop.overrideRange ?? troopData.range ?? 150
            : MELEE_RANGE;
          const sightRange = isRanged
            ? TROOP_RANGED_SIGHT_RANGE
            : TROOP_SIGHT_RANGE;

          const canHitFlying =
            troop.overrideCanTargetFlying ?? troopData.canTargetFlying ?? false;
          let enemiesInSightCount = 0;
          let closestEnemy: Enemy | null = null;
          let closestDist = Infinity;
          for (const enemy of enemies) {
            if (!canHitFlying && ENEMY_DATA[enemy.type].flying) continue;
            const enemyPos = getEnemyPosCached(enemy);
            const dist = distance(troop.pos, enemyPos);
            if (dist > sightRange) continue;
            enemiesInSightCount += 1;
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          }

          // Ally alert: if no enemy in direct sight and not player-moving,
          // check if nearby allies are in combat and join the fight
          if (!closestEnemy && !troop.moving) {
            const flyingFilter = canHitFlying
              ? undefined
              : (e: Enemy) => !ENEMY_DATA[e.type].flying;

            const allies: { pos: Position; engaging: boolean }[] = [];
            for (const other of prev) {
              if (other.id === troop.id || other.dead) continue;
              allies.push({ pos: other.pos, engaging: !!other.engaging });
            }
            if (hero && !hero.dead) {
              allies.push({ pos: hero.pos, engaging: !!hero.aggroTarget });
            }

            const alertResult = findAllyAlertTarget(
              troop.pos, allies, enemies, getEnemyPosCached,
              sightRange + ALLY_ALERT_RANGE, flyingFilter,
            );
            if (alertResult) {
              closestEnemy = alertResult.enemy;
              closestDist = alertResult.dist;
            }
          }

          // Determine home position (where the troop should return to)
          const homePos = troop.userTargetPos || troop.spawnPoint;
          const maxChaseRange = troop.moveRadius || 180; // Don't chase beyond this from home

          // Skip engagement logic if player has commanded this troop to move
          // This allows troops to disengage from combat and follow orders
          if (closestEnemy && !troop.moving) {
            // Enemy in sight - engage!
            const enemyPos = getEnemyPosCached(closestEnemy);

            // Check if chasing would take us too far from home
            const distFromHome = homePos ? distance(updated.pos, homePos) : 0;
            const wouldBeTooFar = distFromHome >= maxChaseRange;

            // Ranged units: stop at attack range and throw projectiles
            // Melee units: get close to attack
            // Ranged units go melee if enemy is too close
            const effectiveAttackRange =
              isRanged && closestDist > MELEE_RANGE ? attackRange : MELEE_RANGE;

            // Stationary units (turrets) never move - they just rotate to face enemies
            if (isStationary) {
              // Just face the enemy but don't move
              const dx = enemyPos.x - troop.pos.x;
              const dy = enemyPos.y - troop.pos.y;
              updated.rotation = Math.atan2(dy, dx);
              updated.facingRight = getFacingRightFromDelta(
                dx,
                dy,
                troop.facingRight ?? true,
              );
              updated.engaging = closestDist <= attackRange;
            } else if (closestDist > effectiveAttackRange && !wouldBeTooFar) {
              // Enemy in sight but out of attack range - move toward it
              // Move toward enemy, but stop at attack range
              const targetDist = effectiveAttackRange - 10; // Stop a bit before attack range
              const baseSpeed = 2.0; // Slightly faster when engaging
              const slowMult =
                updated.slowed && updated.slowIntensity
                  ? 1 - updated.slowIntensity
                  : 1;
              const moveStep = stepTowardTarget({
                current: troop.pos,
                target: enemyPos,
                speed: baseSpeed * slowMult,
                deltaTime,
                stopDistance: targetDist,
              });

              if (!moveStep.reached) {
                updated.pos = clampPositionToRadius(
                  moveStep.pos,
                  homePos,
                  maxChaseRange
                );
                updated.rotation = moveStep.rotation;
                updated.facingRight = moveStep.facingRight;
                updated.engaging = true;
              }
            } else if (closestDist <= effectiveAttackRange) {
              // Within attack range - face enemy but don't move
              const dx = enemyPos.x - troop.pos.x;
              const dy = enemyPos.y - troop.pos.y;
              updated.rotation = Math.atan2(dy, dx);
              updated.facingRight = getFacingRightFromDelta(
                dx,
                dy,
                troop.facingRight ?? true,
              );
              updated.engaging = true;
            } else {
              // Too far from home to chase - face enemy but stay put
              const dx = enemyPos.x - troop.pos.x;
              const dy = enemyPos.y - troop.pos.y;
              updated.rotation = Math.atan2(dy, dx);
              updated.facingRight = getFacingRightFromDelta(
                dx,
                dy,
                troop.facingRight ?? true,
              );
              updated.engaging = false; // Will return home
            }
          } else {
            // No enemy in sight OR player commanded movement - disengage
            updated.engaging = false;

            // Only return home if not being moved by player and not stationary
            if (homePos && !isStationary && !troop.moving) {
              const baseReturnSpeed = 1.5;
              const slowMult =
                updated.slowed && updated.slowIntensity
                  ? 1 - updated.slowIntensity
                  : 1;
              const returnStep = stepTowardTarget({
                current: troop.pos,
                target: homePos,
                speed: baseReturnSpeed * slowMult,
                deltaTime,
                stopDistance: 8,
              });

              if (!returnStep.reached) {
                updated.pos = returnStep.pos;
                updated.rotation = returnStep.rotation;
                updated.facingRight = returnStep.facingRight;
                updated.moving = true;
                updated.targetPos = homePos;
              } else {
                // At home - stop moving
                updated.moving = false;
                updated.targetPos = undefined;
              }
            }
          }

          const force = friendlySeparation.get(troop.id);
          if (force && !isStationary) {
            updated.pos = {
              x: updated.pos.x + force.x * deltaTime * FRIENDLY_SEPARATION_MULT,
              y: updated.pos.y + force.y * deltaTime * FRIENDLY_SEPARATION_MULT,
            };
          }

          if (homePos && !isStationary) {
            const leash = maxChaseRange + (troop.moving ? 12 : 0);
            updated.pos = clampPositionToRadius(updated.pos, homePos, leash);
          }

          // HP regeneration - regenerate 2% max HP per second when out of combat for 3+ seconds
          const inCombat = enemiesInSightCount > 0 || updated.engaging;
          const now = Date.now();
          const HEAL_DELAY_MS = 3000; // 3 seconds out of combat before healing starts

          // Update lastCombatTime if in combat
          if (inCombat) {
            updated.lastCombatTime = now;
            updated.healFlash = undefined; // Stop healing effect when entering combat
          }

          // Only heal if out of combat for long enough
          const timeSinceCombat = now - (updated.lastCombatTime || 0);
          if (!inCombat && troop.hp < troop.maxHp && timeSinceCombat >= HEAL_DELAY_MS) {
            updated.hp = Math.min(
              troop.maxHp,
              troop.hp + (troop.maxHp * 0.02 * deltaTime) / 1000
            );
            // Show healing aura while regenerating (only set once to avoid constant state updates)
            if (!updated.healFlash || now - updated.healFlash > 800) {
              updated.healFlash = now;
            }
          }

          // Handle player-commanded movement (overrides engagement, but not for stationary)
          if (troop.moving && troop.targetPos && !isStationary) {
            const moveStep = stepTowardTarget({
              current: updated.pos,
              target: troop.targetPos,
              speed: 1.5,
              deltaTime,
              stopDistance: 5,
            });
            if (moveStep.reached) {
              return {
                ...updated,
                pos: troop.targetPos,
                moving: false,
                targetPos: undefined,
                userTargetPos: troop.targetPos, // Update home position
                rotation: moveStep.rotation,
                facingRight: getFacingRightFromDelta(
                  troop.targetPos.x - updated.pos.x,
                  troop.targetPos.y - updated.pos.y,
                  troop.facingRight ?? true,
                ),
              };
            }
            return {
              ...updated,
              pos: moveStep.pos,
              rotation: moveStep.rotation,
              facingRight: moveStep.facingRight,
            };
          }

          return updated;
        });
      });
      // ========== HERO STATUS EFFECTS PROCESSING ==========
      if (hero && !hero.dead) {
        setHero((prev) => {
          if (!prev || prev.dead) return prev;
          const updated = { ...prev };

          // Clear expired effects
          if (updated.burnUntil && now > updated.burnUntil) {
            updated.burning = false;
            updated.burnDamage = undefined;
            updated.burnUntil = undefined;
          }
          if (updated.slowUntil && now > updated.slowUntil) {
            updated.slowed = false;
            updated.slowIntensity = undefined;
            updated.slowUntil = undefined;
          }
          if (updated.poisonUntil && now > updated.poisonUntil) {
            updated.poisoned = false;
            updated.poisonDamage = undefined;
            updated.poisonUntil = undefined;
          }
          if (updated.stunUntil && now > updated.stunUntil) {
            updated.stunned = false;
            updated.stunUntil = undefined;
          }

          // Apply damage-over-time effects
          const dotTick = deltaTime / 1000;
          if (updated.burning && updated.burnDamage) {
            updated.hp = Math.max(0, updated.hp - updated.burnDamage * dotTick);
          }
          if (updated.poisoned && updated.poisonDamage) {
            updated.hp = Math.max(0, updated.hp - updated.poisonDamage * dotTick);
          }

          return updated;
        });
      }

      // Hero HP regeneration - with combat buffer
      if (hero && !hero.dead && hero.hp < hero.maxHp) {
        const now = Date.now();
        const HERO_HEAL_DELAY_MS = 5000; // 5 seconds out of combat before healing starts

        // Consider in combat if any enemy is within 100 pixels OR currently targeting hero OR hero is attacking
        const inCombat =
          enemies.some(
            (e) =>
              distance(hero.pos, getEnemyPosCached(e)) <= 100
          ) || enemies.some((e) => e.combatTarget === hero.id) || (hero.attackAnim > 0);

        // Update lastCombatTime if in combat
        if (inCombat) {
          setHero((prev) => prev ? { ...prev, lastCombatTime: now, healFlash: undefined } : null);
        } else {
          // Only heal if out of combat for long enough
          const timeSinceCombat = now - (hero.lastCombatTime || 0);
          if (timeSinceCombat >= HERO_HEAL_DELAY_MS) {
            setHero((prev) => {
              if (!prev || prev.hp >= prev.maxHp) return prev;
              // Only refresh healFlash if it's expired or doesn't exist (avoid constant state churn)
              const needsNewHealFlash = !prev.healFlash || now - prev.healFlash > 800;
              return {
                ...prev,
                hp: Math.min(
                  prev.maxHp,
                  prev.hp + (prev.maxHp * 0.03 * deltaTime) / 1000
                ),
                // Show healing aura while regenerating
                healFlash: needsNewHealFlash ? now : prev.healFlash,
              };
            });
          }
        }
      }
      // ========== PROCESS TOWER DEBUFFS FROM ENEMIES ==========
      // Apply debuffs from enemies with tower-affecting abilities
      setTowers((prevTowers) => prevTowers.map((tower) => {
        const towerWorldPos = gridToWorld(tower.pos);
        const updated = { ...tower };

        // Clear expired debuffs
        if (updated.debuffs && updated.debuffs.length > 0) {
          updated.debuffs = updated.debuffs.filter((d) => now < d.until);
        }
        if (updated.disabledUntil && now > updated.disabledUntil) {
          updated.disabled = false;
          updated.disabledUntil = undefined;
        }

        // Check for enemies with tower debuff abilities nearby
        for (const enemy of enemies) {
          const eData = ENEMY_DATA[enemy.type];
          if (!eData.abilities) continue;

          const enemyPos = getEnemyPosCached(enemy);
          const distToTower = distance(enemyPos, towerWorldPos);

          // Check each ability
          for (const ability of eData.abilities) {
            if (!ability.type.startsWith('tower_')) continue;

            const abilityRange = ability.radius || 80;
            if (distToTower > abilityRange) continue;

            // Check cooldown and chance
            const abilityCooldown = ability.cooldown || 3000;
            if (enemy.lastAbilityUse && now - enemy.lastAbilityUse < abilityCooldown) continue;

            const chance = ability.chance || 0.15;
            if (Math.random() > chance) continue;

            // Apply the debuff
            const duration = ability.duration || 2000;
            const intensity = ability.intensity || 0.25;

            const applyDebuff = (debuffType: 'slow' | 'weaken' | 'blind') => {
              updated.debuffs = addOrRefreshDebuff(
                updated.debuffs || [], debuffType, intensity, now + duration, enemy.id, now
              );
            };

            switch (ability.type) {
              case 'tower_slow':
                applyDebuff('slow');
                break;
              case 'tower_weaken':
                applyDebuff('weaken');
                break;
              case 'tower_blind':
                applyDebuff('blind');
                break;
              case 'tower_disable': {
                updated.disabled = true;
                updated.disabledUntil = now + duration;
                // Also add to debuffs array for UI/rendering visibility
                updated.debuffs = updated.debuffs || [];
                updated.debuffs = updated.debuffs.filter(d =>
                  d.until > now && d.type !== 'disable'
                );
                const flavor = ability.name.toLowerCase().includes('freeze') ? 'freeze' as const
                  : ability.name.toLowerCase().includes('gaze') || ability.name.toLowerCase().includes('stone') ? 'petrify' as const
                    : ability.name.toLowerCase().includes('hold') || ability.name.toLowerCase().includes('admin') ? 'hold' as const
                      : 'stun' as const;
                updated.debuffs.push({
                  type: 'disable',
                  intensity: 1,
                  until: now + duration,
                  sourceId: enemy.id,
                  disableFlavor: flavor,
                  abilityName: ability.name,
                });
                break;
              }
            }

            // Track cooldown so this enemy can't re-apply immediately
            enemy.lastAbilityUse = now;
          }
        }

        return updated;
      }));

      const queuedTowerPatches = new Map<string, Partial<Tower>>();
      const queueTowerPatch = (towerId: string, patch: Partial<Tower>) => {
        const existing = queuedTowerPatches.get(towerId);
        queuedTowerPatches.set(
          towerId,
          existing ? { ...existing, ...patch } : patch
        );
      };

      type EnemyMutation = {
        enemyId: string;
        mutate: (enemy: Enemy) => Enemy | null;
      };
      const queuedTowerEnemyMutations: EnemyMutation[] = [];
      const queueTowerEnemyMutation = (
        enemyId: string,
        mutate: (enemy: Enemy) => Enemy | null
      ) => {
        queuedTowerEnemyMutations.push({ enemyId, mutate });
      };

      const queuedTowerEffects: Effect[] = [];
      const queuedTowerProjectiles: Projectile[] = [];

      // Tower attacks - skip when paused
      if (!isPaused) {
        towers.forEach((tower) => {
          // Skip disabled towers
          if (tower.disabled && tower.disabledUntil && now < tower.disabledUntil) {
            return;
          }

          const tData = TOWER_DATA[tower.type];
          const towerWorldPos = gridToWorld(tower.pos);

          // Calculate debuff modifiers
          let attackSpeedMod = 1.0;
          let damageMod = 1.0;
          let rangeMod = 1.0;

          if (tower.debuffs && tower.debuffs.length > 0) {
            for (const debuff of tower.debuffs) {
              if (now >= debuff.until) continue;
              switch (debuff.type) {
                case 'slow':
                  attackSpeedMod *= (1 - debuff.intensity);
                  break;
                case 'weaken':
                  damageMod *= (1 - debuff.intensity);
                  break;
                case 'blind':
                  rangeMod *= (1 - debuff.intensity);
                  break;
              }
            }
          }
          const attackSpeedMultiplier = Math.max(
            0.12,
            attackSpeedMod * (tower.attackSpeedBoost || 1)
          );

          // Final Buffed Stats for this tick - use calculateTowerStats for proper level-based range
          const towerStats = calculateTowerStats(
            tower.type,
            tower.level,
            tower.upgrade,
            tower.rangeBoost || 1,
            tower.damageBoost || 1
          );
          const finalRange = towerStats.range * rangeMod;
          const finalDamageMult = (tower.damageBoost || 1.0) * damageMod;

          if (tower.type === "club") {
            // ENHANCED CLUB TOWER - More useful income generator
            // Level 1: Basic Club - 8 PP every 8s
            // Level 2: Popular Club - 15 PP every 7s + bonus on kills nearby
            // Level 3: Grand Club - 25 PP every 6s
            // Level 4A: Investment Bank - 40 PP every 5s + 10% bonus on all income
            // Level 4B: Recruitment Center - 20 PP every 6s + 15% damage buff to nearby towers

            const incomeInterval =
              tower.level === 1
                ? 8000
                : tower.level === 2
                  ? 7000
                  : tower.level === 3
                    ? 6000
                    : tower.upgrade === "A"
                      ? 5000
                      : 6000;

            const baseAmount =
              tower.level === 1
                ? 8
                : tower.level === 2
                  ? 15
                  : tower.level === 3
                    ? 25
                    : tower.upgrade === "A"
                      ? 40
                      : 20;

            // Scale income interval with game speed (faster at higher speeds)
            const effectiveIncomeInterval = gameSpeed > 0 ? incomeInterval / gameSpeed : incomeInterval;
            if (now - tower.lastAttack > effectiveIncomeInterval) {
              // Base income
              let amount = baseAmount;

              // Investment Bank bonus: 10% bonus on income
              if (tower.level === 4 && tower.upgrade === "A") {
                amount = Math.floor(amount * 1.1);
              }

              addPawPoints(amount);
              // Add eating club income event for HUD animation
              setEatingClubIncomeEvents((prev) => [...prev, { id: `${tower.id}-${now}`, amount }]);
              addParticles(gridToWorld(tower.pos), "gold", 20);

              // Level 3+ Grand Club: Create gold particle fountain effect
              if (tower.level >= 3) {
                for (let i = 0; i < 5; i++) {
                  const burstTimeout = setTimeout(() => {
                    addParticles(gridToWorld(tower.pos), "gold", 3);
                  }, i * 100);
                  activeTimeoutsRef.current.push(burstTimeout);
                }
              }

              queueTowerPatch(tower.id, { lastAttack: now });
            }

            // Level 4B Recruitment Center and Level 4A Investment Bank buffs
            // are now handled in the DYNAMIC BUFF REGISTRATION section above
            // which runs every frame and properly calculates stacking buffs
          } else if (tower.type === "library") {
            let appliedSlow = false;
            let appliedDamage = false;

            // OPTIMIZED: Batch all library slow/damage effects into a single setEnemies call
            const slowAmount =
              tower.level === 1
                ? 0.2
                : tower.level === 2
                  ? 0.35
                  : tower.level === 3
                    ? 0.45 // Arcane Library
                    : 0.5; // Both Earthquake and Blizzard cap at 50%

            // Scale library damage intervals with game speed
            const libraryDamageInterval = gameSpeed > 0 ? 500 / gameSpeed : 500;
            const shouldApplyArcaneDamage = tower.level === 3 && now - tower.lastAttack > libraryDamageInterval;
            // Blizzard freeze: 25% chance every 2 seconds (scaled with game speed, uses separate timer)
            const blizzardFreezeInterval = gameSpeed > 0 ? 2000 / gameSpeed : 2000;
            const lastFreezeCheck = tower.lastFreezeCheck || 0;
            const shouldCheckBlizzardFreeze = tower.level === 4 && tower.upgrade === "B" && now - lastFreezeCheck > blizzardFreezeInterval;
            const shouldApplyBlizzardFreeze = shouldCheckBlizzardFreeze && Math.random() < 0.25;
            const shouldApplyEarthquakeDamage = tower.level === 4 && tower.upgrade === "A" && now - tower.lastAttack > libraryDamageInterval;
            const arcaneDamage = 8 * finalDamageMult;
            const earthquakeDamage = 35;

            // Collect enemy IDs affected by this tower for batched update
            const affectedEnemyIds = new Set<string>();
            const enemyDistances = new Map<string, { dist: number; pos: Position }>();

            for (const e of enemies) {
              const enemyPos = getEnemyPosCached(e);
              const dist = distance(towerWorldPos, enemyPos);
              if (dist <= finalRange) {
                affectedEnemyIds.add(e.id);
                enemyDistances.set(e.id, { dist, pos: enemyPos });
                appliedSlow = true;
              }
            }

            // Single batched update for all affected enemies
            if (affectedEnemyIds.size > 0) {
              let bountyEarned = 0;
              let bountyHadGoldAura = false;
              const particlePositions: Position[] = [];
              const sparkPositions: Position[] = [];

              setEnemies((prev) =>
                prev
                  .map((enemy) => {
                    if (!affectedEnemyIds.has(enemy.id)) return enemy;
                    const info = enemyDistances.get(enemy.id)!;

                    const newEnemy = { ...enemy };

                    // Apply slow
                    newEnemy.slowEffect = slowAmount;
                    newEnemy.slowed = true;
                    newEnemy.slowIntensity = slowAmount;
                    newEnemy.slowSource = "library";

                    // Blizzard freeze
                    if (shouldApplyBlizzardFreeze) {
                      newEnemy.frozen = true;
                      newEnemy.stunUntil = now + 2000;
                      newEnemy.slowIntensity = 1;
                    }

                    // Arcane damage
                    if (shouldApplyArcaneDamage) {
                      newEnemy.hp -= getEnemyDamageTaken(newEnemy, arcaneDamage);
                      newEnemy.damageFlash = 80;
                      appliedDamage = true;
                      if (newEnemy.hp <= 0) {
                        const baseBounty = ENEMY_DATA[enemy.type].bounty;
                        const goldBonus = enemy.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                        bountyEarned += baseBounty + goldBonus;
                        bountyHadGoldAura = bountyHadGoldAura || !!enemy.goldAura;
                        sparkPositions.push(info.pos);
                        const eDeathData = ENEMY_DATA[enemy.type];
                        const arcaneRegionColors = REGION_THEMES[LEVEL_DATA[selectedMap]?.theme || "grassland"]?.ground;
                        setEffects((prev) => [...prev, { id: generateId("fx"), pos: info.pos, type: "enemy_death" as const, progress: 0, size: eDeathData.size, duration: 1500, color: eDeathData.color, enemyType: enemy.type, enemySize: eDeathData.size, isFlying: eDeathData.flying, deathCause: "default" as const, regionGroundColors: arcaneRegionColors }]);
                        return null;
                      }
                    }

                    // Earthquake damage
                    if (shouldApplyEarthquakeDamage) {
                      newEnemy.hp -= getEnemyDamageTaken(
                        newEnemy,
                        earthquakeDamage
                      );
                      newEnemy.damageFlash = 150;
                      newEnemy.slowIntensity = 0.8;
                      appliedDamage = true;
                      if (newEnemy.hp <= 0) {
                        const baseBounty = ENEMY_DATA[enemy.type].bounty;
                        const goldBonus = enemy.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                        bountyEarned += baseBounty + goldBonus;
                        bountyHadGoldAura = bountyHadGoldAura || !!enemy.goldAura;
                        particlePositions.push(info.pos);
                        const eDeathData2 = ENEMY_DATA[enemy.type];
                        const quakeRegionColors = REGION_THEMES[LEVEL_DATA[selectedMap]?.theme || "grassland"]?.ground;
                        setEffects((prev) => [...prev, { id: generateId("fx"), pos: info.pos, type: "enemy_death" as const, progress: 0, size: eDeathData2.size, duration: 1500, color: eDeathData2.color, enemyType: enemy.type, enemySize: eDeathData2.size, isFlying: eDeathData2.flying, deathCause: "default" as const, regionGroundColors: quakeRegionColors }]);
                        return null;
                      }
                    }

                    return newEnemy;
                  })
                  .filter(isDefined)
              );

              // Apply bounties and particles outside of setEnemies
              if (bountyEarned > 0) {
                awardBounty(bountyEarned, bountyHadGoldAura, `library-${tower.id}`);
              }
              // Track kills for wave progress
              particlePositions.forEach((pos) => addParticles(pos, "explosion", 8));
              sparkPositions.forEach((pos) => addParticles(pos, "spark", 6));
            }
            // Continuous slow field visual effect
            if (
              enemies.some(
                (e) =>
                  distance(towerWorldPos, getEnemyPosCached(e)) <=
                  finalRange
              )
            ) {
              const effectType =
                tower.level === 4 && tower.upgrade === "B"
                  ? "freezeField"
                  : tower.level === 4 && tower.upgrade === "A"
                    ? "earthquakeField"
                    : tower.level === 3
                      ? "arcaneField"
                      : "slowField";
              // Update or add slow field effect (only add if doesn't exist, avoid resetting progress every frame)
              setEffects((ef) => {
                const existingField = ef.find(
                  (e) => e.type === effectType && e.towerId === tower.id
                );
                if (existingField) {
                  // Only reset progress if it's about to expire (> 0.8), otherwise let it continue
                  if (existingField.progress > 0.8) {
                    return ef.map((e) =>
                      e.id === existingField.id ? { ...e, progress: 0 } : e
                    );
                  }
                  return ef; // No change needed
                }
                return [
                  ...ef,
                  {
                    id: generateId("field"),
                    pos: towerWorldPos,
                    type: effectType,
                    progress: 0,
                    size: finalRange,
                    towerId: tower.id,
                    intensity:
                      tower.level >= 3 ? 1 : tower.level === 2 ? 0.7 : 0.5,
                  },
                ];
              });
            }
            // Update tower timers
            const shouldUpdateLastAttack = (appliedSlow || appliedDamage) && now - tower.lastAttack > libraryDamageInterval;
            const shouldUpdateFreezeCheck = shouldCheckBlizzardFreeze;
            if (shouldUpdateLastAttack || shouldUpdateFreezeCheck) {
              queueTowerPatch(tower.id, {
                lastAttack: shouldUpdateLastAttack ? now : tower.lastAttack,
                lastFreezeCheck: shouldUpdateFreezeCheck
                  ? now
                  : tower.lastFreezeCheck,
              });
            }
          } else if (tower.type === "station") {
            // Count living troops belonging to this station
            const stationTroops = troops.filter((t) => t.ownerId === tower.id);
            const pendingRespawns = tower.pendingRespawns || [];

            // Process pending respawns - decrement timers and spawn when ready
            const troopsToSpawn: Troop[] = [];
            const remainingRespawns: typeof pendingRespawns = [];
            const stationPos = gridToWorld(tower.pos);

            // Find rally point from existing troops or use road near station
            const existingRallyTroop = stationTroops.find((t) => t.userTargetPos);
            const rallyPoint =
              existingRallyTroop?.userTargetPos || findClosestRoadPoint(stationPos, activeWaveSpawnPaths, selectedMap);

            for (const r of pendingRespawns) {
              const newTimer = r.timer - deltaTime;
              if (newTimer <= 0 && stationTroops.length + troopsToSpawn.length < MAX_STATION_TROOPS) {
                const futureCount =
                  stationTroops.length + troopsToSpawn.length + 1;
                const formationOffsets = getFormationOffsets(futureCount);
                const slotOffset = formationOffsets[r.slot] || { x: 0, y: 0 };

                const targetPos = {
                  x: rallyPoint.x + slotOffset.x,
                  y: rallyPoint.y + slotOffset.y,
                };

                const troopHP =
                  TROOP_DATA[r.troopType as keyof typeof TROOP_DATA]?.hp || 100;
                troopsToSpawn.push({
                  id: generateId("troop"),
                  ownerId: tower.id,
                  ownerType: "station" as const, // Orange themed (Princeton station)
                  pos: stationPos, // Spawn at station
                  hp: troopHP,
                  maxHp: troopHP,
                  moving: true, // Walk to target
                  targetPos: targetPos,
                  lastAttack: 0,
                  type: r.troopType as TroopType,
                  rotation: Math.atan2(
                    targetPos.y - stationPos.y,
                    targetPos.x - stationPos.x,
                  ),
                  facingRight: getFacingRightFromDelta(
                    targetPos.x - stationPos.x,
                    targetPos.y - stationPos.y,
                  ),
                  attackAnim: 0,
                  selected: false,
                  spawnPoint: rallyPoint,
                  moveRadius: (TOWER_DATA.station.spawnRange || 180) * (tower.rangeBoost || 1),
                  spawnSlot: r.slot,
                  userTargetPos: targetPos,
                });
                addParticles(stationPos, "glow", 12);
                // Don't add to remaining (remove from pending)
              } else {
                // Keep in pending with updated timer
                remainingRespawns.push({ ...r, timer: newTimer });
              }
            }

            // Spawn any respawning troops
            if (troopsToSpawn.length > 0) {
              addTroopEntities(troopsToSpawn);
            }

            const totalOccupied = stationTroops.length + troopsToSpawn.length + remainingRespawns.length;
            const canSpawn = totalOccupied < MAX_STATION_TROOPS;

            const occupiedSlots = new Set([
              ...stationTroops.map((t) => t.spawnSlot ?? 0),
              ...troopsToSpawn.map((t) => t.spawnSlot ?? 0),
              ...remainingRespawns.map((r) => r.slot),
            ]);
            const availableSlot =
              [0, 1, 2].find((slot) => !occupiedSlots.has(slot)) ?? -1;

            // Train animation
            const currentProgress = tower.trainAnimProgress || 0;

            if (canSpawn && availableSlot !== -1) {
              // Train is running - animate it
              const newProgress = currentProgress + deltaTime / 3000;

              // Check if train just arrived at platform
              const arrivedAtPlatform =
                currentProgress < 0.3 && newProgress >= 0.3;

              // Scale station spawn interval with game speed
              const stationSpawnInterval = gameSpeed > 0 ? 8000 / gameSpeed : 8000;
              if (arrivedAtPlatform && now - tower.lastAttack > stationSpawnInterval && !isInResetTransition) {
                // Spawn troop at station, it will walk to formation position
                const stationPos = gridToWorld(tower.pos);

                // Find rally point from existing troops or use road near station
                const existingRallyTroop = stationTroops.find(
                  (t) => t.userTargetPos
                );
                const rallyPoint =
                  existingRallyTroop?.userTargetPos || findClosestRoadPoint(stationPos, activeWaveSpawnPaths, selectedMap);

                const futureCount = stationTroops.length + troopsToSpawn.length + 1;
                const formationOffsets = getFormationOffsets(futureCount);
                const slotOffset = formationOffsets[availableSlot] || {
                  x: 0,
                  y: 0,
                };

                const targetPos = {
                  x: rallyPoint.x + slotOffset.x,
                  y: rallyPoint.y + slotOffset.y,
                };

                // Determine troop type based on tower level
                // Level 1: footsoldier, Level 2: armored, Level 3: elite, Level 4A: centaur, Level 4B: cavalry
                const troopType =
                  tower.level === 1
                    ? "footsoldier"
                    : tower.level === 2
                      ? "armored"
                      : tower.level === 3
                        ? "elite"
                        : tower.upgrade === "A"
                          ? "centaur"
                          : "cavalry";
                const troopHP = TROOP_DATA[troopType]?.hp || 100;

                const newTroop: Troop = {
                  id: generateId("troop"),
                  ownerId: tower.id,
                  ownerType: "station" as const, // Orange themed (Princeton station)
                  pos: stationPos, // Start at station
                  hp: troopHP,
                  maxHp: troopHP,
                  moving: true, // Walk to target
                  targetPos: targetPos,
                  lastAttack: 0,
                  type: troopType,
                  rotation: Math.atan2(
                    targetPos.y - stationPos.y,
                    targetPos.x - stationPos.x,
                  ),
                  facingRight: getFacingRightFromDelta(
                    targetPos.x - stationPos.x,
                    targetPos.y - stationPos.y,
                  ),
                  attackAnim: 0,
                  selected: false,
                  spawnPoint: rallyPoint,
                  moveRadius: (TOWER_DATA.station.spawnRange || 180) * (tower.rangeBoost || 1),
                  spawnSlot: availableSlot,
                  userTargetPos: targetPos,
                };

                // Also update existing troops to reposition in new formation
                setTroops((prev) => {
                  // Get current troops for this tower to create sequential formation indices
                  const currentTowerTroops = prev.filter((t) => t.ownerId === tower.id);
                  const troopIdToFormationIndex = new Map<string, number>();
                  currentTowerTroops.forEach((t, idx) => {
                    troopIdToFormationIndex.set(t.id, idx);
                  });

                  const updated = prev.map((t) => {
                    if (t.ownerId === tower.id) {
                      const newFormation = getFormationOffsets(futureCount);
                      // Use sequential formation index, not spawnSlot which may have gaps
                      const formationIndex = troopIdToFormationIndex.get(t.id) ?? 0;
                      const offset = newFormation[formationIndex] || { x: 0, y: 0 };
                      const newTarget = {
                        x: rallyPoint.x + offset.x,
                        y: rallyPoint.y + offset.y,
                      };
                      // Only reposition if not engaging enemies
                      if (!t.engaging) {
                        return {
                          ...t,
                          targetPos: newTarget,
                          moving: true,
                          userTargetPos: newTarget,
                          facingRight: getFacingRightFromDelta(
                            newTarget.x - t.pos.x,
                            newTarget.y - t.pos.y,
                          ),
                        };
                      }
                    }
                    return t;
                  });
                  return [...updated, newTroop];
                });
                addParticles(stationPos, "spark", 10);

                queueTowerPatch(tower.id, {
                  lastAttack: now,
                  trainAnimProgress: newProgress >= 1 ? 0.01 : newProgress,
                  currentTroopCount: stationTroops.length + troopsToSpawn.length + 1,
                  pendingRespawns: remainingRespawns,
                });
              } else {
                queueTowerPatch(tower.id, {
                  trainAnimProgress: newProgress >= 1 ? 0.01 : newProgress,
                  currentTroopCount: stationTroops.length + troopsToSpawn.length,
                  pendingRespawns: remainingRespawns,
                });
              }
            } else {
              queueTowerPatch(tower.id, {
                trainAnimProgress: 0.35,
                currentTroopCount: stationTroops.length + troopsToSpawn.length,
                pendingRespawns: remainingRespawns,
              });
            }
          } else if (tower.type === "cannon") {
            // Level 3: Heavy Cannon - increased damage and minor splash
            // Level 4A: Gatling gun - rapid fire
            // Level 4B: Flamethrower - continuous damage with burn
            const isHeavyCannon = tower.level === 3;
            const isGatling = tower.level === 4 && tower.upgrade === "A";
            const isFlamethrower = tower.level === 4 && tower.upgrade === "B";

            // Get all valid enemies in range for targeting
            const validEnemies = getEnemiesInRange(
              towerWorldPos,
              finalRange
            );

            // Continuously track target even when not firing
            if (validEnemies.length > 0) {
              const trackTarget = validEnemies[0];
              const trackTargetPos = getEnemyAimPosCached(trackTarget);
              const trackDx = trackTargetPos.x - towerWorldPos.x;
              const trackDy = trackTargetPos.y - towerWorldPos.y;
              // Account for isometric projection: screen direction
              const trackRotation = Math.atan2(trackDx + trackDy, trackDx - trackDy);

              // Update rotation to track enemy continuously
              queueTowerPatch(tower.id, {
                rotation: trackRotation,
                targetId: trackTarget.id,
              });
            }

            const attackCooldown = isGatling
              ? 150 // Gatling is 8x faster
              : isFlamethrower
                ? 100 // Flamethrower is continuous
                : isHeavyCannon
                  ? 900 // Heavy cannon slightly slower but more damage
                  : tData.attackSpeed;
            // Scale attack cooldown with game speed and debuffs
            const effectiveAttackCooldown =
              gameSpeed > 0
                ? attackCooldown / gameSpeed / attackSpeedMultiplier
                : attackCooldown;
            if (now - tower.lastAttack > effectiveAttackCooldown && validEnemies.length > 0) {
              const target = validEnemies[0];
              const targetPos = getEnemyPosCached(target);
              const targetAimPos = getEnemyAimPosCached(target);
              let damage = tData.damage * finalDamageMult;
              if (tower.level === 2) damage *= 1.5;
              if (isHeavyCannon) damage *= 2.2; // Heavy cannon big damage
              if (isGatling) damage *= 0.4; // Lower per-shot damage but much faster
              if (isFlamethrower) damage *= 0.3; // DoT damage
              queueTowerEnemyMutation(target.id, (enemy) => {
                const newHp = enemy.hp - getEnemyDamageTaken(enemy, damage);
                if (newHp <= 0) {
                  onEnemyKill(enemy, targetPos, 12, isFlamethrower ? "fire" : "default");
                  return null;
                }
                const updates: Partial<Enemy> = {
                  hp: newHp,
                  damageFlash: 100,
                };
                if (isFlamethrower) {
                  updates.burning = true;
                  updates.burnDamage = 15;
                  updates.burnUntil = now + 3000;
                }
                return { ...enemy, ...updates };
              });
              // Update lastAttack timestamp (rotation already tracked continuously above)
              const dx = targetAimPos.x - towerWorldPos.x;
              const dy = targetAimPos.y - towerWorldPos.y;
              // Account for isometric projection
              const rotation = Math.atan2(dx + dy, dx - dy);
              queueTowerPatch(tower.id, { lastAttack: now });
              // Create cannon shot effect - renderer will position from turret
              const effectType = isFlamethrower
                ? "flame_burst"
                : isGatling
                  ? "bullet_stream"
                  : "cannon_shot";
              queuedTowerEffects.push({
                id: generateId("cannon"),
                pos: towerWorldPos, // Use tower base, renderer adjusts to turret
                type: effectType,
                progress: 0,
                size: distance(towerWorldPos, targetAimPos),
                targetPos: targetAimPos,
                towerId: tower.id,
                towerLevel: tower.level,
                towerUpgrade: tower.upgrade,
                rotation,
              });
              // Add particles at tower position
              if (!isFlamethrower) {
                addParticles(towerWorldPos, "smoke", 2);
              }
            }
          } else if (tower.type === "lab") {
            // Level 3: Tesla Coil - chains to 2 targets
            // Level 4A: Focused Beam - continuous lock-on with increasing damage
            // Level 4B: Chain Lightning - hits up to 5 targets
            const isTeslaCoil = tower.level === 3;
            const isFocusedBeam = tower.level === 4 && tower.upgrade === "A";
            const isChainLightning = tower.level === 4 && tower.upgrade === "B";
            const attackCooldown = isFocusedBeam ? 100 : tData.attackSpeed;
            // Scale attack cooldown with game speed and debuffs (attackSpeedMod)
            const effectiveLabCooldown =
              gameSpeed > 0
                ? attackCooldown / gameSpeed / attackSpeedMultiplier
                : attackCooldown;
            if (now - tower.lastAttack > effectiveLabCooldown) {
              const validEnemies = getEnemiesInRange(
                towerWorldPos,
                finalRange
              );
              if (validEnemies.length > 0) {
                const target = validEnemies[0];
                const targetAimPos = getEnemyAimPosCached(target);
                let damage = tData.damage * finalDamageMult;
                if (tower.level === 2) damage *= 1.5;
                if (tower.level >= 3) damage *= 2; // Level 3 and 4 get 2x base damage
                if (tower.level === 4) damage *= 1.3; // Level 4 gets additional bonus
                if (isFocusedBeam) damage *= 0.15; // Continuous beam
                // Chain targets: Tesla Coil = 2, Chain Lightning = 5
                const numChainTargets = isChainLightning
                  ? 5
                  : isTeslaCoil
                    ? 2
                    : 1;
                const chainTargets =
                  isTeslaCoil || isChainLightning
                    ? validEnemies.slice(0, numChainTargets)
                    : [target];
                const chainDamage =
                  isTeslaCoil || isChainLightning ? damage * 0.7 : damage;
                chainTargets.forEach((chainTarget) => {
                  queueTowerEnemyMutation(chainTarget.id, (enemy) => {
                    const newHp =
                      enemy.hp - getEnemyDamageTaken(enemy, chainDamage);
                    if (newHp <= 0) {
                      onEnemyKill(enemy, getEnemyPosCached(enemy), 8, "lightning");
                      return null;
                    }
                    return { ...enemy, hp: newHp, damageFlash: 150 };
                  });
                });
                const dx = targetAimPos.x - towerWorldPos.x;
                const dy = targetAimPos.y - towerWorldPos.y;
                const rotation = Math.atan2(dy, dx);
                queueTowerPatch(tower.id, {
                  lastAttack: now,
                  rotation,
                  target: target.id,
                });
                const lightningVisualPressure =
                  entityCountsRef.current.effects +
                  entityCountsRef.current.projectiles * 0.7 +
                  entityCountsRef.current.enemies * 0.35;
                const maxVisualChainLinks =
                  lightningVisualPressure > 240
                    ? 1
                    : lightningVisualPressure > 180
                      ? 2
                      : lightningVisualPressure > 120
                        ? 3
                        : numChainTargets;
                const visualChainTargets = chainTargets.slice(
                  0,
                  maxVisualChainLinks
                );
                const desiredRealMs = isFocusedBeam ? 250 : 420;
                const gsCompensation = Math.max(1, gameSpeed);
                const lightningFxDuration = desiredRealMs * gsCompensation;
                const lightningIntensityScale =
                  lightningVisualPressure > 240
                    ? 0.7
                    : lightningVisualPressure > 180
                      ? 0.82
                      : 1;
                // Tesla coil position at top of tower - must match visual rendering
                // In renderer: baseHeight = 25 + level * 8, coilHeight = 35 + level * 8
                // orbY = topY - coilHeight + 5 = -(baseHeight + coilHeight - 5)
                if (isTeslaCoil || isChainLightning) {
                  // Draw chain lightning between all targets
                  visualChainTargets.forEach((chainTarget, i) => {
                    const chainPos = getEnemyAimPosCached(chainTarget);
                    const fromPos =
                      i === 0
                        ? towerWorldPos // Use tower base position, renderer will adjust to orb
                        : getEnemyAimPosCached(visualChainTargets[i - 1]);
                    queuedTowerEffects.push({
                      id: generateId("chain"),
                      pos: fromPos,
                      type: "chain",
                      progress: 0,
                      size: distance(fromPos, chainPos),
                      targetPos: chainPos,
                      intensity: (1 - i * 0.15) * lightningIntensityScale, // Fade with each jump
                      duration: lightningFxDuration,
                      towerId: i === 0 ? tower.id : undefined,
                      towerLevel: tower.level,
                      towerUpgrade: tower.upgrade,
                    });
                  });
                } else {
                  queuedTowerEffects.push({
                    id: generateId("zap"),
                    pos: towerWorldPos, // Use tower base position, renderer will adjust to orb
                    type: isFocusedBeam ? "beam" : "lightning",
                    progress: 0,
                    size: distance(towerWorldPos, targetAimPos),
                    targetPos: targetAimPos,
                    intensity:
                      (isFocusedBeam ? 0.8 : 1) * lightningIntensityScale,
                    duration: lightningFxDuration,
                    towerId: tower.id,
                    towerLevel: tower.level,
                    towerUpgrade: tower.upgrade,
                  });
                }
                // Add spark particles at tower position
                const sparkCount =
                  lightningVisualPressure > 240
                    ? 0
                    : lightningVisualPressure > 180
                      ? 1
                      : lightningVisualPressure > 120
                        ? 2
                        : 3;
                if (sparkCount > 0) {
                  addParticles(towerWorldPos, "spark", sparkCount);
                }
              }
            }
          } else if (tower.type === "arch") {
            // Arch tower - sonic attacks
            // Level 3: Elite Archers - faster attack, hits 2 targets
            // Level 4A: Shockwave - stun chance
            // Level 4B: Symphony - hits up to 5 targets
            const isEliteArchers = tower.level === 3;
            const isShockwave = tower.level === 4 && tower.upgrade === "A"; // Stun chance
            const isSymphony = tower.level === 4 && tower.upgrade === "B"; // Multi-target
            const attackSpeed = isEliteArchers
              ? tData.attackSpeed * 0.7
              : tData.attackSpeed;
            // Scale attack cooldown with game speed
            const effectiveArcherSpeed =
              gameSpeed > 0
                ? attackSpeed / gameSpeed / attackSpeedMultiplier
                : attackSpeed;
            if (now - tower.lastAttack > effectiveArcherSpeed) {
              const validEnemies = getEnemiesInRange(
                towerWorldPos,
                finalRange
              );
              if (validEnemies.length > 0) {
                // Level 1: single target, Level 2: 2 targets, Level 3 Elite: 3 targets, Level 4 Symphony: 5 targets
                const numTargets = isSymphony
                  ? 5
                  : isEliteArchers
                    ? 3
                    : tower.level >= 2
                      ? 2
                      : 1;
                const targets = validEnemies.slice(0, numTargets);
                let damage = tData.damage * finalDamageMult;
                if (tower.level === 2) damage *= 1.5;
                if (tower.level >= 3) damage *= 2;
                if (tower.level === 4) damage *= 1.25; // Additional level 4 bonus
                targets.forEach((targetEnemy) => {
                  queueTowerEnemyMutation(targetEnemy.id, (enemy) => {
                    const targetEnemyPos = getEnemyPosCached(enemy);
                    const newHp = enemy.hp - getEnemyDamageTaken(enemy, damage);
                    if (newHp <= 0) {
                      onEnemyKill(enemy, targetEnemyPos, 10, "sonic");
                      return null;
                    }
                    const updates: Partial<Enemy> = {
                      hp: newHp,
                      damageFlash: 150,
                    };
                    if (isShockwave && Math.random() < 0.3) {
                      updates.stunUntil = now + 1000;
                    }
                    return { ...enemy, ...updates };
                  });
                });
                const target = targets[0];
                const targetAimPos = getEnemyAimPosCached(target);
                const dx = targetAimPos.x - towerWorldPos.x;
                const dy = targetAimPos.y - towerWorldPos.y;
                const rotation = Math.atan2(dy, dx);
                queueTowerPatch(tower.id, {
                  lastAttack: now,
                  rotation,
                  target: target.id,
                });
                queuedTowerEffects.push({
                  id: generateId("sonic"),
                  pos: towerWorldPos,
                  type: "sonic",
                  progress: 0,
                  size: finalRange,
                });
                // Create music note cluster effects to each target
                targets.forEach((target, i) => {
                  const targetPos = getEnemyAimPosCached(target);
                  // Create multiple note projectiles per target
                  for (let n = 0; n < 3 + tower.level; n++) {
                    queuedTowerEffects.push({
                      id: generateId("note"),
                      pos: towerWorldPos,
                      type: "music_notes",
                      progress: 0,
                      size: distance(towerWorldPos, targetPos),
                      targetPos,
                      intensity: 1 - i * 0.1,
                      towerId: tower.id,
                      towerLevel: tower.level,
                      towerUpgrade: tower.upgrade,
                      noteIndex: n, // Different note variations
                    });
                  }
                });
              }
            }
          } else if (tower.type === "mortar") {
            const isMissileBattery = tower.level === 4 && tower.upgrade === "A";
            const isEmberFoundry = tower.level === 4 && tower.upgrade === "B";

            const attackCooldown = isMissileBattery
              ? 4000
              : isEmberFoundry
                ? 2500
                : tData.attackSpeed;
            const effectiveAttackCooldown =
              gameSpeed > 0
                ? attackCooldown / gameSpeed / attackSpeedMultiplier
                : attackCooldown;

            const mortarStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
            const splashRadius = mortarStats.splashRadius || 60;
            let damage = tData.damage * finalDamageMult;
            if (tower.level === 2) damage *= 1.5;
            if (tower.level >= 3) damage *= 2;

            // Missile Battery: auto-aim targets nearest enemy, manual uses stored position
            if (isMissileBattery && !tower.mortarAutoAim && tower.mortarTarget) {
              const missileTarget = tower.mortarTarget;
              const tDx = missileTarget.x - towerWorldPos.x;
              const tDy = missileTarget.y - towerWorldPos.y;
              const trackRotation = Math.atan2(tDx + tDy, tDx - tDy);
              queueTowerPatch(tower.id, { rotation: trackRotation });

              if (now - tower.lastAttack > effectiveAttackCooldown) {
                const missileCount = 4;
                for (let i = 0; i < missileCount; i++) {
                  const spread = 20;
                  const offsetX = (Math.random() - 0.5) * spread * 2;
                  const offsetY = (Math.random() - 0.5) * spread * 2;
                  const targetPos = {
                    x: missileTarget.x + offsetX,
                    y: missileTarget.y + offsetY,
                  };
                  const dx = targetPos.x - towerWorldPos.x;
                  const dy = targetPos.y - towerWorldPos.y;
                  const rotation = Math.atan2(dy, dx);
                  queuedTowerProjectiles.push({
                    id: generateId("msl"),
                    from: towerWorldPos,
                    to: targetPos,
                    progress: 0,
                    type: "missile",
                    rotation,
                    arcHeight: 140 + i * 20,
                    damage: damage * 0.5,
                    targetType: "enemy",
                    isAoE: true,
                    aoeRadius: splashRadius,
                    speed: 0.18 + i * 0.03,
                    color: "#ff2200",
                    trailColor: "#ffaa00",
                  });
                }
                queueTowerPatch(tower.id, { lastAttack: now });
                addParticles(towerWorldPos, "smoke", 6);
              }
            } else if (isMissileBattery && tower.mortarAutoAim) {
              const autoEnemies = getEnemiesInRange(towerWorldPos, finalRange);
              if (autoEnemies.length > 0) {
                const autoTarget = autoEnemies[0];
                const autoPos = getEnemyAimPosCached(autoTarget);
                const aDx = autoPos.x - towerWorldPos.x;
                const aDy = autoPos.y - towerWorldPos.y;
                const aRot = Math.atan2(aDx + aDy, aDx - aDy);
                queueTowerPatch(tower.id, { rotation: aRot, targetId: autoTarget.id });

                if (now - tower.lastAttack > effectiveAttackCooldown) {
                  const missileCount = 4;
                  for (let i = 0; i < missileCount; i++) {
                    const spread = 20;
                    const offsetX = (Math.random() - 0.5) * spread * 2;
                    const offsetY = (Math.random() - 0.5) * spread * 2;
                    const targetPos = {
                      x: autoPos.x + offsetX,
                      y: autoPos.y + offsetY,
                    };
                    const dx = targetPos.x - towerWorldPos.x;
                    const dy = targetPos.y - towerWorldPos.y;
                    const rotation = Math.atan2(dy, dx);
                    queuedTowerProjectiles.push({
                      id: generateId("msl"),
                      from: towerWorldPos,
                      to: targetPos,
                      progress: 0,
                      type: "missile",
                      rotation,
                      arcHeight: 140 + i * 20,
                      damage: damage * 0.5,
                      targetType: "enemy",
                      isAoE: true,
                      aoeRadius: splashRadius,
                      speed: 0.18 + i * 0.03,
                      color: "#ff2200",
                      trailColor: "#ffaa00",
                    });
                  }
                  queueTowerPatch(tower.id, { lastAttack: now });
                  addParticles(towerWorldPos, "smoke", 6);
                }
              }
            } else {
              // Non-missile mortar types need enemies in range (cannot hit flying)
              const validEnemies = getEnemiesInRange(
                towerWorldPos,
                finalRange,
                undefined,
                (e) => !ENEMY_DATA[e.type as EnemyType]?.flying
              );

              // Track target for barrel rotation
              if (validEnemies.length > 0) {
                const trackTarget = validEnemies[0];
                const trackTargetPos = getEnemyAimPosCached(trackTarget);
                const trackDx = trackTargetPos.x - towerWorldPos.x;
                const trackDy = trackTargetPos.y - towerWorldPos.y;
                const trackRotation = Math.atan2(trackDx + trackDy, trackDx - trackDy);
                queueTowerPatch(tower.id, {
                  rotation: trackRotation,
                  targetId: trackTarget.id,
                });
              }

              if (now - tower.lastAttack > effectiveAttackCooldown && validEnemies.length > 0) {
                if (isEmberFoundry) {
                  const emberTarget = validEnemies[0];
                  const emberAimPos = getEnemyAimPosCached(emberTarget);
                  const spread = 35;
                  for (let i = 0; i < 3; i++) {
                    const offsetX = (Math.random() - 0.5) * spread * 2;
                    const offsetY = (Math.random() - 0.5) * spread * 2;
                    const targetPos = { x: emberAimPos.x + offsetX, y: emberAimPos.y + offsetY };
                    const dx = targetPos.x - towerWorldPos.x;
                    const dy = targetPos.y - towerWorldPos.y;
                    const rotation = Math.atan2(dy, dx);
                    queuedTowerProjectiles.push({
                      id: generateId("emb"),
                      from: towerWorldPos,
                      to: targetPos,
                      progress: 0,
                      type: "ember",
                      rotation,
                      arcHeight: 100 + i * 15,
                      damage: damage * 0.55,
                      targetType: "enemy",
                      isAoE: true,
                      aoeRadius: splashRadius * 0.8,
                      speed: 0.22 + i * 0.03,
                      color: "#ff4400",
                      trailColor: "#ff8800",
                    });
                  }
                  queueTowerPatch(tower.id, { lastAttack: now });
                  addParticles(towerWorldPos, "fire", 5);
                } else {
                  // Base mortar: single high-arc explosive shell
                  const target = validEnemies[0];
                  const targetAimPos = getEnemyAimPosCached(target);
                  const dx = targetAimPos.x - towerWorldPos.x;
                  const dy = targetAimPos.y - towerWorldPos.y;
                  const rotation = Math.atan2(dx + dy, dx - dy);
                  queuedTowerProjectiles.push({
                    id: generateId("mrt"),
                    from: towerWorldPos,
                    to: targetAimPos,
                    progress: 0,
                    type: "mortarShell",
                    rotation,
                    arcHeight: 120,
                    damage,
                    targetType: "enemy",
                    isAoE: true,
                    aoeRadius: splashRadius,
                    speed: 0.3,
                  });
                  queueTowerPatch(tower.id, { lastAttack: now });
                  queuedTowerEffects.push({
                    id: generateId("mrt"),
                    pos: towerWorldPos,
                    type: "mortar_launch",
                    progress: 0,
                    size: 40,
                    towerId: tower.id,
                    towerLevel: tower.level,
                    rotation,
                  });
                  addParticles(towerWorldPos, "smoke", 4);
                }
              }
            }
          } else if (
            tData.attackSpeed > 0 &&
            now - tower.lastAttack >
            (gameSpeed > 0
              ? tData.attackSpeed / gameSpeed / attackSpeedMultiplier
              : tData.attackSpeed)
          ) {
            // Generic tower attack (fallback)
            const validEnemies = getEnemiesInRange(
              towerWorldPos,
              finalRange
            );
            if (validEnemies.length > 0) {
              const target = validEnemies[0];
              const targetPos = getEnemyPosCached(target);
              const targetAimPos = getEnemyAimPosCached(target);
              let damage = tData.damage * finalDamageMult;
              if (tower.level === 2) damage *= 1.5;
              if (tower.level === 3) damage *= 2;
              queueTowerEnemyMutation(target.id, (enemy) => {
                const newHp = enemy.hp - getEnemyDamageTaken(enemy, damage);
                if (newHp <= 0) {
                  onEnemyKill(enemy, targetPos, 12);
                  return null;
                }
                return { ...enemy, hp: newHp, damageFlash: 200 };
              });
              const dx = targetAimPos.x - towerWorldPos.x;
              const dy = targetAimPos.y - towerWorldPos.y;
              const rotation = Math.atan2(dy, dx);
              queueTowerPatch(tower.id, {
                lastAttack: now,
                rotation,
                target: target.id,
              });
              queuedTowerProjectiles.push({
                id: generateId("proj"),
                from: towerWorldPos,
                to: targetAimPos,
                progress: 0,
                type: tower.type,
                rotation,
              });
              addParticles(towerWorldPos, "smoke", 3);
            }
          }
        });
      } // End of !isPaused check for tower attacks

      if (queuedTowerEnemyMutations.length > 0) {
        setEnemies((prev) => {
          const enemyById = new Map(prev.map((enemy) => [enemy.id, enemy]));
          for (const mutation of queuedTowerEnemyMutations) {
            const current = enemyById.get(mutation.enemyId);
            if (!current) continue;
            const updated = mutation.mutate(current);
            if (updated) {
              enemyById.set(mutation.enemyId, updated);
            } else {
              enemyById.delete(mutation.enemyId);
            }
          }
          const nextEnemies: Enemy[] = [];
          for (const enemy of prev) {
            const updated = enemyById.get(enemy.id);
            if (updated) nextEnemies.push(updated);
          }
          return nextEnemies;
        });
      }
      if (queuedTowerPatches.size > 0) {
        setTowers((prev) =>
          prev.map((tower) => {
            const patch = queuedTowerPatches.get(tower.id);
            return patch ? { ...tower, ...patch } : tower;
          })
        );
      }
      if (queuedTowerEffects.length > 0) {
        addEffectEntities(queuedTowerEffects);
      }
      if (queuedTowerProjectiles.length > 0) {
        addProjectileEntities(queuedTowerProjectiles);
      }

      // Hero attacks - skip when paused
      if (!isPaused && hero && !hero.dead && hero.attackAnim === 0) {
        const heroData = HERO_DATA[hero.type];
        // Scale hero attack speed with game speed
        const effectiveHeroAttackSpeed = gameSpeed > 0 ? heroData.attackSpeed / gameSpeed : heroData.attackSpeed;
        if (now - hero.lastAttack > effectiveHeroAttackSpeed) {
          const validEnemies = getEnemiesInRange(
            hero.pos,
            heroData.range
          );
          if (validEnemies.length > 0) {
            const target = validEnemies[0];
            const targetPos = getEnemyPosCached(target);
            const targetAimPos = getEnemyAimPosCached(target);
            const dx = targetAimPos.x - hero.pos.x;
            const dy = targetAimPos.y - hero.pos.y;
            const rotation = Math.atan2(dy, dx);

            // Determine attack type based on hero
            const isAoEHero = hero.type === "mathey" || hero.type === "scott";
            const isMultiTargetHero = hero.type === "tenor";
            const aoeDamageRadius = hero.type === "mathey" ? 70 : hero.type === "scott" ? 60 : 0;
            const maxTargets = hero.type === "tenor" ? 3 : 1;

            // Get targets for multi-target heroes (Tenor hits up to 3)
            const attackTargets = isMultiTargetHero
              ? validEnemies.slice(0, maxTargets)
              : [target];

            // Apply damage to all targets
            setEnemies((prev) => {
              let updatedEnemies: Array<Enemy | null> = [...prev];
              const killedEnemyIds: string[] = [];

              // Primary target damage
              for (const attackTarget of attackTargets) {
                const attackTargetPos = getEnemyPosCached(attackTarget);

                updatedEnemies = updatedEnemies.map((e) => {
                  if (!e) return e;
                  if (e.id === attackTarget.id) {
                    const newHp = e.hp - getEnemyDamageTaken(e, heroData.damage);
                    if (newHp <= 0) {
                      killedEnemyIds.push(e.id);
                      onEnemyKill(e, attackTargetPos, 10);
                      if (hero.type === "scott") addPawPoints(1);
                      return null;
                    }
                    return { ...e, hp: newHp, damageFlash: 200 };
                  }
                  return e;
                });
              }

              // AoE damage for Mathey Knight and F. Scott
              if (isAoEHero && aoeDamageRadius > 0) {
                const aoeDamage = Math.floor(heroData.damage * 0.5); // 50% damage to nearby enemies
                updatedEnemies = updatedEnemies.map((e) => {
                  if (!e || killedEnemyIds.includes(e.id)) return e;
                  if (attackTargets.some(t => t.id === e.id)) return e; // Already hit as primary

                  const enemyPos = getEnemyPosCached(e);
                  const distToTarget = distance(targetPos, enemyPos);

                  if (distToTarget <= aoeDamageRadius) {
                    const newHp = e.hp - getEnemyDamageTaken(e, aoeDamage);
                    if (newHp <= 0) {
                      onEnemyKill(e, enemyPos);
                      return null;
                    }
                    return { ...e, hp: newHp, damageFlash: 150 };
                  }
                  return e;
                });
              }

              return updatedEnemies.filter(isDefined);
            });

            // Create hero-specific attack effects
            const heroEffectType: EffectType = (() => {
              switch (hero.type) {
                case "tiger": return "tiger_slash";
                case "mathey": return "knight_cleave";
                case "scott": return "scott_quill";
                case "tenor": return "sonic_blast";
                case "rocky": return "rock_impact";
                default: return "impact_hit";
              }
            })();

            // Add attack visual effect
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("eff"),
                pos: isAoEHero ? targetPos : { x: (hero.pos.x + targetPos.x) / 2, y: (hero.pos.y + targetPos.y) / 2 },
                type: heroEffectType,
                progress: 0,
                size: isAoEHero ? aoeDamageRadius : 50,
                slashAngle: rotation,
                sourceId: hero.id,
                attackerType: "hero",
              },
            ]);

            // For multi-target Tenor, add effects to each target
            if (isMultiTargetHero && attackTargets.length > 1) {
              attackTargets.slice(1).forEach((extraTarget) => {
                const extraAimPos = getEnemyAimPosCached(extraTarget);
                setEffects((ef) => [
                  ...ef,
                  {
                    id: generateId("eff"),
                    pos: extraAimPos,
                    type: "impact_hit",
                    progress: 0,
                    size: 30,
                    color: "139, 92, 246",
                  },
                ]);
                // Add projectile to extra targets
                setProjectiles((prev) => [
                  ...prev,
                  {
                    id: generateId("proj"),
                    from: hero.pos,
                    to: extraAimPos,
                    progress: 0,
                    type: "sonicWave",
                    rotation: Math.atan2(
                      extraAimPos.y - hero.pos.y,
                      extraAimPos.x - hero.pos.x
                    ),
                  },
                ]);
              });
            }

            setHero((prev) =>
              prev
                ? { ...prev, lastAttack: now, lastCombatTime: now, rotation, attackAnim: 300 }
                : null
            );

            // Create projectile for ranged heroes
            if (heroData.isRanged || heroData.range > 80) {
              const projType = (() => {
                switch (hero.type) {
                  case "tenor": return "sonicWave";
                  case "rocky": return "rock";
                  case "scott": return "magicBolt";
                  default: return "hero";
                }
              })();

              // Hero-specific projectile colors
              const projColor = (() => {
                switch (hero.type) {
                  case "scott": return "#c9a227"; // Golden for F. Scott
                  case "tenor": return "#a855f7"; // Purple for Tenor
                  default: return undefined;
                }
              })();

              setProjectiles((prev) => [
                ...prev,
                {
                  id: generateId("proj"),
                  from: hero.pos,
                  to: targetAimPos,
                  progress: 0,
                  type: projType,
                  rotation,
                  arcHeight: hero.type === "rocky" ? 60 : 0,
                  color: projColor,
                },
              ]);
            }
          }
        }
      }
      if (hero && hero.attackAnim > 0) {
        setHero((prev) =>
          prev
            ? { ...prev, attackAnim: Math.max(0, prev.attackAnim - deltaTime) }
            : null
        );
      }
      const queuedTroopEnemyMutations: EnemyMutation[] = [];
      const queueTroopEnemyMutation = (
        enemyId: string,
        mutate: (enemy: Enemy) => Enemy | null
      ) => {
        queuedTroopEnemyMutations.push({ enemyId, mutate });
      };
      const queuedTroopEffects: Effect[] = [];
      const queuedTroopProjectiles: Projectile[] = [];
      const queuedTroopPatches = new Map<string, Partial<Troop>>();

      // Troop attacks - with ranged support for centaurs and turrets - skip when paused
      if (!isPaused) {
        troops.forEach((troop) => {
          if (!troop.type) return; // Skip troops without a type
          const troopData = TROOP_DATA[troop.type];
          if (!troopData) return; // Skip if troop data not found
          const isRanged = troop.overrideIsRanged ?? troopData.isRanged ?? false;
          const attackRange = isRanged
            ? troop.overrideRange ?? troopData.range ?? 150
            : 65;
          const attackCooldown =
            troop.overrideAttackSpeed ?? troopData.attackSpeed ?? 1000;
          // Scale troop attack cooldown with game speed
          const effectiveTroopCooldown = gameSpeed > 0 ? attackCooldown / gameSpeed : attackCooldown;
          const lastAttack = troop.lastAttack ?? 0; // Default to 0 if undefined
          if (
            (troop.attackAnim ?? 0) === 0 &&
            now - lastAttack > effectiveTroopCooldown
          ) {
            const canHitFlying =
              troop.overrideCanTargetFlying ?? troopData.canTargetFlying ?? false;
            const validEnemies = getEnemiesInRange(
              troop.pos,
              attackRange,
              Number.POSITIVE_INFINITY,
              (enemy) => !ENEMY_DATA[enemy.type].flying || canHitFlying
            );
            if (validEnemies.length > 0) {
              const target = validEnemies[0];
              const targetPos = getEnemyPosCached(target);
              const targetAimPos = getEnemyAimPosCached(target);
              const troopDamage = troop.overrideDamage ?? troopData.damage ?? 20;
              const dx = targetAimPos.x - troop.pos.x;
              const dy = targetAimPos.y - troop.pos.y;
              const rotation = Math.atan2(dy, dx);
              const targetDistance = distance(troop.pos, targetPos);
              const useRangedAttack =
                isRanged &&
                (!(troop.overrideHybridMelee ?? false) ||
                  targetDistance > MELEE_RANGE * 1.05);
              const isReinforcementLancer =
                troop.type === "reinforcement" &&
                troop.ownerType === "spell" &&
                (troop.visualTier ?? 0) >= 5;
              // Apply damage immediately (projectile is just visual)
              queueTroopEnemyMutation(target.id, (enemy) => {
                const newHp = enemy.hp - getEnemyDamageTaken(enemy, troopDamage);
                if (newHp <= 0) {
                  onEnemyKill(enemy, targetPos);
                  return null;
                }
                return { ...enemy, hp: newHp, damageFlash: 200 };
              });

              // Add melee attack visual effect for non-ranged troops
              if (!useRangedAttack) {
                const troopEffectType: EffectType =
                  isReinforcementLancer
                    ? "impact_hit"
                    : troop.type === "knight" ||
                      troop.type === "reinforcement" ||
                      troop.type === "cavalry"
                      ? "melee_slash"
                      : troop.type === "armored" || troop.type === "elite"
                        ? "melee_swipe"
                        : "impact_hit";
                queuedTroopEffects.push({
                  id: generateId("eff"),
                  pos: { x: (troop.pos.x + targetPos.x) / 2, y: (troop.pos.y + targetPos.y) / 2 },
                  type: troopEffectType,
                  progress: 0,
                  size: 35,
                  slashAngle: rotation,
                  attackerType: "troop",
                });
              }
              if (useRangedAttack) {
                const projType =
                  troop.type === "turret"
                    ? "bullet"
                    : troop.type === "knight" || troop.type === "reinforcement"
                      ? isReinforcementLancer
                        ? "spear"
                        : "bolt"
                      : "spear";
                const spawnOffset =
                  troop.type === "centaur"
                    ? { x: 0, y: -20 }
                    : troop.type === "knight" || troop.type === "reinforcement"
                      ? isReinforcementLancer
                        ? { x: 0, y: -16 }
                        : { x: 0, y: -12 }
                      : { x: 0, y: 0 };
                queuedTroopProjectiles.push({
                  id: generateId("proj"),
                  from: {
                    x: troop.pos.x + spawnOffset.x,
                    y: troop.pos.y + spawnOffset.y,
                  },
                  to: targetAimPos,
                  progress: 0,
                  type: projType,
                  rotation,
                  scale: isReinforcementLancer ? 1.1 : undefined,
                  color: isReinforcementLancer ? "#d6c07f" : undefined,
                  trailColor: isReinforcementLancer ? "#f4e3aa" : undefined,
                });
              }
              queuedTroopPatches.set(troop.id, {
                lastAttack: now,
                lastCombatTime: now,
                attackAnim: useRangedAttack ? 400 : 300,
                rotation,
                targetEnemy: target.id,
              });
            }
          }
        });
      } // End of !isPaused check for troop attacks
      if (queuedTroopEnemyMutations.length > 0) {
        setEnemies((prev) => {
          const enemyById = new Map(prev.map((enemy) => [enemy.id, enemy]));
          for (const mutation of queuedTroopEnemyMutations) {
            const current = enemyById.get(mutation.enemyId);
            if (!current) continue;
            const updated = mutation.mutate(current);
            if (updated) {
              enemyById.set(mutation.enemyId, updated);
            } else {
              enemyById.delete(mutation.enemyId);
            }
          }
          const nextEnemies: Enemy[] = [];
          for (const enemy of prev) {
            const updated = enemyById.get(enemy.id);
            if (updated) nextEnemies.push(updated);
          }
          return nextEnemies;
        });
      }
      if (queuedTroopEffects.length > 0) {
        addEffectEntities(queuedTroopEffects);
      }
      if (queuedTroopProjectiles.length > 0) {
        addProjectileEntities(queuedTroopProjectiles);
      }
      if (queuedTroopPatches.size > 0) {
        setTroops((prev) =>
          prev.map((troop) => {
            const patch = queuedTroopPatches.get(troop.id);
            return patch ? { ...troop, ...patch } : troop;
          })
        );
      }
      setTroops((prev) =>
        prev.map((t) => {
          const attackAnim = t.attackAnim ?? 0;
          return attackAnim > 0
            ? { ...t, attackAnim: Math.max(0, attackAnim - deltaTime) }
            : t;
        })
      );

      const troopCountByOwner = new Map<string, number>();
      troops.forEach((troop) => {
        troopCountByOwner.set(
          troop.ownerId,
          (troopCountByOwner.get(troop.ownerId) ?? 0) + 1
        );
      });

      setTowers((prev) =>
        prev.map((t) => {
          if (t.type === "station") {
            const troopCount = troopCountByOwner.get(t.id) ?? 0;
            if (t.currentTroopCount === troopCount) return t;
            return { ...t, currentTroopCount: troopCount };
          }
          return t;
        })
      );
      // Update cooldowns
      if (hero && hero.abilityCooldown > 0) {
        setHero((prev) =>
          prev
            ? {
              ...prev,
              abilityCooldown: Math.max(0, prev.abilityCooldown - deltaTime),
              abilityReady: prev.abilityCooldown - deltaTime <= 0,
            }
            : null
        );
      }
      // Update projectiles with a throttled simulation step and batched impact handling.
      projectileUpdateAccumulator.current += deltaTime;
      const projectilePressure =
        entityCountsRef.current.projectiles + entityCountsRef.current.enemies * 0.35;
      const projectileUpdateInterval =
        projectilePressure > 260
          ? 42
          : projectilePressure > 180
            ? 32
            : projectilePressure > 110
              ? 24
              : 16;
      if (projectileUpdateAccumulator.current >= projectileUpdateInterval) {
        const projectileDelta = projectileUpdateAccumulator.current;
        projectileUpdateAccumulator.current = 0;

        setProjectiles((prev) => {
          if (prev.length === 0) return prev;

          const nextProjectiles: Projectile[] = [];
          const completingProjectiles: Projectile[] = [];
          const baseProgressStep = projectileDelta / 300;
          for (const proj of prev) {
            const progressStep = baseProgressStep * (proj.speed ?? 1);
            const nextProgress = Math.min(1, proj.progress + progressStep);
            if (nextProgress >= 1) {
              if (proj.targetType && proj.damage) {
                completingProjectiles.push(proj);
              } else if (proj.isAoE && proj.damage) {
                completingProjectiles.push(proj);
              }
            } else {
              nextProjectiles.push({ ...proj, progress: nextProgress });
            }
          }

          if (completingProjectiles.length === 0) return nextProjectiles;

          const nowMs = Date.now();
          let heroDamageTotal = 0;
          let shouldDeflectOnHero = false;
          const directTroopDamage = new Map<string, number>();
          const aoeEvents: Array<{ center: Position; radius: number; damage: number }> = [];
          const mortarAoEEvents: Array<{ center: Position; radius: number; damage: number; isBurning: boolean }> = [];
          const queuedImpactParticles: Array<{ pos: Position; type: string }> = [];
          const queuedImpactEffects: Effect[] = [];

          for (const proj of completingProjectiles) {
            if (proj.targetType === "hero" && proj.targetId && hero && hero.id === proj.targetId && !hero.dead) {
              if (hero.shieldActive) {
                shouldDeflectOnHero = true;
                continue;
              }
              heroDamageTotal += proj.damage || 20;
              queuedImpactEffects.push({
                id: generateId("eff"),
                pos: proj.to,
                type: getImpactEffect(proj.type),
                progress: 0,
                size: 35,
                rotation: proj.rotation,
              });
              if (proj.isAoE && proj.aoeRadius) {
                const aoeEffectType: EffectType =
                  proj.type === "rock" ? "shockwave" : "fire_nova";
                queuedImpactEffects.push({
                  id: generateId("eff"),
                  pos: proj.to,
                  type: aoeEffectType,
                  progress: 0,
                  size: proj.aoeRadius || 50,
                });
                aoeEvents.push({
                  center: proj.to,
                  radius: proj.aoeRadius,
                  damage: Math.floor((proj.damage || 20) * 0.5),
                });
              }
              continue;
            }

            if (proj.targetType === "troop" && proj.targetId) {
              directTroopDamage.set(
                proj.targetId,
                (directTroopDamage.get(proj.targetId) ?? 0) + (proj.damage || 20)
              );
              queuedImpactEffects.push({
                id: generateId("eff"),
                pos: proj.to,
                type: getImpactEffect(proj.type),
                progress: 0,
                size: 30,
                rotation: proj.rotation,
              });
            }

            // Mortar/tower AoE projectiles targeting enemies - collect for batch processing
            if (proj.targetType === "enemy" && proj.isAoE && proj.aoeRadius && proj.damage) {
              queuedImpactEffects.push({
                id: generateId("eff"),
                pos: proj.to,
                type: proj.type === "ember" ? "fire_nova" : "mortar_impact",
                progress: 0,
                size: proj.aoeRadius,
                duration: proj.type === "ember" ? 600 : 800,
              });
              mortarAoEEvents.push({
                center: proj.to,
                radius: proj.aoeRadius,
                damage: proj.damage,
                isBurning: proj.type === "ember",
              });
              queuedImpactParticles.push({
                pos: proj.to,
                type: proj.type === "ember" ? "fire" : "explosion",
              });
            }
          }

          if (heroDamageTotal > 0) {
            setHero((prevHero) => {
              if (!prevHero || prevHero.dead) return prevHero;
              const newHp = prevHero.hp - heroDamageTotal;
              if (newHp <= 0) {
                return {
                  ...prevHero,
                  hp: 0,
                  dead: true,
                  respawnTimer: 15000,
                  lastCombatTime: nowMs,
                };
              }
              return { ...prevHero, hp: newHp, lastCombatTime: nowMs };
            });
          } else if (shouldDeflectOnHero && hero?.shieldActive) {
            addParticles(hero.pos, "spark", 8);
          }

          if (directTroopDamage.size > 0 || aoeEvents.length > 0) {
            setTroops((prevTroops) =>
              prevTroops
                .map((troop) => {
                  let totalDamage = directTroopDamage.get(troop.id) ?? 0;
                  if (aoeEvents.length > 0) {
                    for (const aoe of aoeEvents) {
                      if (distance(troop.pos, aoe.center) <= aoe.radius) {
                        totalDamage += aoe.damage;
                      }
                    }
                  }
                  if (totalDamage <= 0) return troop;
                  const newHp = troop.hp - totalDamage;
                  if (newHp <= 0) {
                    addParticles(troop.pos, "explosion", 6);
                    return null;
                  }
                  return { ...troop, hp: newHp, lastCombatTime: nowMs };
                })
                .filter(isDefined)
            );
          }

          // Mortar AoE damage against enemies
          if (mortarAoEEvents.length > 0) {
            setEnemies((prevEnemies) => {
              const nextEnemies: Enemy[] = [];
              for (const enemy of prevEnemies) {
                const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
                let totalDamage = 0;
                let shouldBurn = false;
                for (const aoe of mortarAoEEvents) {
                  const dist = distance(enemyPos, aoe.center);
                  if (dist <= aoe.radius) {
                    const falloff = 1 - (dist / aoe.radius) * 0.4;
                    totalDamage += getEnemyDamageTaken(enemy, aoe.damage * falloff);
                    if (aoe.isBurning) shouldBurn = true;
                  }
                }
                if (totalDamage <= 0) {
                  nextEnemies.push(enemy);
                  continue;
                }
                const newHp = enemy.hp - totalDamage;
                if (newHp <= 0) {
                  onEnemyKill(enemy, enemyPos, 12, shouldBurn ? "fire" : "default");
                  continue;
                }
                const updates: Partial<Enemy> = { hp: newHp, damageFlash: 200 };
                if (shouldBurn) {
                  updates.burning = true;
                  updates.burnDamage = 25;
                  updates.burnUntil = nowMs + 4000;
                }
                nextEnemies.push({ ...enemy, ...updates });
              }
              return nextEnemies;
            });
          }

          if (queuedImpactEffects.length > 0) {
            setEffects((ef) => {
              const combined = [...ef, ...queuedImpactEffects];
              if (combined.length > MAX_EFFECTS) {
                return combined.slice(combined.length - MAX_EFFECTS);
              }
              return combined;
            });
          }

          // Mortar impact particles (called from within updater for batching)
          for (const p of queuedImpactParticles) {
            addParticles(p.pos, p.type as "fire" | "explosion", 8);
          }

          return nextProjectiles;
        });
      }
      // Update effects - with hard cap (throttled to reduce state updates)
      effectsUpdateAccumulator.current += deltaTime;
      if (effectsUpdateAccumulator.current >= 32) { // Update every ~32ms instead of every frame
        const accumulatedDelta = effectsUpdateAccumulator.current;
        effectsUpdateAccumulator.current = 0;

        setEffects((prev) => {
          if (prev.length === 0) return prev;

          const updated = prev
            .map((eff) => ({ ...eff, progress: eff.progress + accumulatedDelta / (eff.duration || 500) }))
            .filter((e) => e.progress < 1);

          // Hard cap on effects
          if (updated.length > MAX_EFFECTS) {
            return updated.slice(updated.length - MAX_EFFECTS);
          }
          return updated;
        });
      }
      // Update particles via pool (no React state — avoids GC and re-renders)
      particleUpdateAccumulator.current += deltaTime;
      const liveEnemyCount = entityCountsRef.current.enemies;
      const particleUpdateInterval =
        liveEnemyCount > 180 ? 48 : liveEnemyCount > 120 ? 40 : 32;
      if (particleUpdateAccumulator.current >= particleUpdateInterval) {
        const accumulatedDelta = particleUpdateAccumulator.current;
        particleUpdateAccumulator.current = 0;
        updateParticlePool(accumulatedDelta);
        const dynamicParticleCap =
          liveEnemyCount > 180 ? 180 : liveEnemyCount > 120 ? 220 : MAX_PARTICLES;
        enforceParticleCap(dynamicParticleCap);
      }
      // Update spell cooldowns
      setSpells((prev) =>
        prev.map((spell) => ({
          ...spell,
          cooldown: Math.max(0, spell.cooldown - deltaTime),
        }))
      );
      // Check win/lose conditions - ref guard prevents duplicate triggers across animation frames
      if (
        lives <= 0 &&
        gameState === "playing" &&
        !battleOutcome &&
        !gameEndHandledRef.current
      ) {
        gameEndHandledRef.current = true;

        // Calculate time spent on defeat (subtract accumulated pause time)
        const finalTime = Math.floor((Date.now() - levelStartTime - totalPausedTimeRef.current) / 1000);
        setTimeSpent(finalTime);

        // Freeze battle in-place and show overlay without leaving the battle screen.
        clearAllTimers();
        setWaveInProgress(false);
        setHoveredWaveBubblePathKey(null);
        setNextWaveTimer(0);
        setGameSpeed(0);

        // Save stats for defeat (won = false)
        updateLevelStats(selectedMap, finalTime, lives, false);
        setBattleOutcome("defeat");
      }
      if (
        gameState === "playing" &&
        !battleOutcome &&
        currentWave >= levelWaves.length &&
        enemies.length === 0 &&
        !waveInProgress &&
        !gameEndHandledRef.current
      ) {
        gameEndHandledRef.current = true;

        // Calculate time spent on victory (subtract accumulated pause time)
        const finalTime = Math.floor((Date.now() - levelStartTime - totalPausedTimeRef.current) / 1000);
        setTimeSpent(finalTime);

        // Calculate stars from multi-category ratings
        const { overall: stars } = calculateCategoryRatings(
          finalTime,
          lives,
          totalWaves,
        );
        setStarsEarned(stars);

        // Freeze battle in-place and show overlay without leaving the battle screen.
        clearAllTimers();
        setWaveInProgress(false);
        setHoveredWaveBubblePathKey(null);
        setNextWaveTimer(0);
        setGameSpeed(0);
        setBattleOutcome("victory");

        // Save progress to localStorage immediately (no setTimeout to avoid stale closure issues)
        // Using the captured selectedMap value directly
        const mapToSave = selectedMap;
        updateLevelStars(mapToSave, stars);

        // Save stats for victory (won = true)
        updateLevelStats(mapToSave, finalTime, lives, true);

        // Campaign progression unlocks.
        const nextLevel = CAMPAIGN_LEVEL_UNLOCKS[mapToSave];
        if (nextLevel && !unlockedMaps.includes(nextLevel)) {
          unlockLevel(nextLevel);
        }

        // Challenge progression unlocks when all campaign stages in a region
        // have at least one star.
        const projectedLevelStars = {
          ...levelStars,
          [mapToSave]: Math.max(levelStars[mapToSave] || 0, stars),
        };
        (Object.keys(REGION_CAMPAIGN_LEVELS) as Array<
          RegionKey
        >).forEach((regionKey) => {
          if (!isRegionCleared(regionKey, projectedLevelStars)) return;
          REGION_CHALLENGE_UNLOCKS[regionKey].forEach((challengeLevel) => {
            if (!unlockedMaps.includes(challengeLevel)) {
              unlockLevel(challengeLevel);
            }
          });
        });

        const nextChallengeLevel = CHALLENGE_LEVEL_UNLOCKS[mapToSave];
        if (
          nextChallengeLevel &&
          (projectedLevelStars[mapToSave] || 0) > 0 &&
          !unlockedMaps.includes(nextChallengeLevel)
        ) {
          unlockLevel(nextChallengeLevel);
        }
      }
    },
    [
      gameSpeed,
      selectedMap,
      waveInProgress,
      currentWave,
      vaultFlash,
      hero,
      lives,
      gameState,
      battleOutcome,
      enemies,
      nextWaveTimer,
      startWave,
      addParticles,
      specialTowerHp,
      troops,
      towers,
      levelStartTime,
      clearAllTimers,
      levelStars,
      totalWaves,
      updateLevelStats,
      updateLevelStars,
      unlockedMaps,
      unlockLevel,
      awardBounty,
      onEnemyKill,
      addPawPoints,
      addEffectEntities,
      addProjectileEntities,
      addTroopEntities,
      getSpecialTowerKey,
      getRandomMapTarget,
      setEffects,
      setEnemies,
      setProjectiles,
      setSentinelTargets,
      setTowers,
      setTroops,
      activeWaveSpawnPaths,
    ]
  );
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
          nextWaveTimer,
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
      nextWaveTimer,
      activeWaveSpawnPaths,
      cameraOffset,
      cameraZoom,
    ]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = getRenderDpr();
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const frameNowMs = performance.now();
    const nowSeconds = frameNowMs / 1000;
    const renderQuality = renderQualityRef.current;
    renderFrameIndexRef.current += 1;
    // CRITICAL: Reset transform to identity matrix at start of each frame
    // This prevents transform accumulation that causes the recursive rendering bug
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Apply DPR scaling fresh each frame
    ctx.scale(dpr, dpr);
    // Clear the entire canvas
    ctx.clearRect(0, 0, width, height);

    // Cache the current time for all projectile renders this frame
    setProjectileRenderTime(Date.now());

    // Get theme for current map
    const mapTheme = LEVEL_DATA[selectedMap]?.theme || "grassland";
    const theme = REGION_THEMES[mapTheme];

    const levelData = LEVEL_DATA[selectedMap];
    const isChallengeTerrainLevel = levelData?.levelKind === "challenge";
    const challengePathSegments = isChallengeTerrainLevel
      ? getChallengePathSegments(selectedMap)
      : [];
    const mapSeed = selectedMap
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    let seededRandom = createSeededRandom(mapSeed);

    const toScreen = (p: Position) =>
      worldToScreen(
        p,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );

    const staticLayerKey = [
      selectedMap,
      canvas.width,
      canvas.height,
      dpr,
      cameraZoom.toFixed(3),
      cameraOffset.x.toFixed(2),
      cameraOffset.y.toFixed(2),
    ].join("|");

    const preRoadCallback = (drawCtx: CanvasRenderingContext2D) => {
      renderDecorationTransitions(
        drawCtx,
        selectedMap,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom,
      );
    };

    let fogEndpoints: StaticMapFogEndpoint[] = [];
    const cachedStaticMapLayer = cachedStaticMapLayerRef.current;
    if (cachedStaticMapLayer && cachedStaticMapLayer.key === staticLayerKey) {
      ctx.drawImage(cachedStaticMapLayer.canvas, 0, 0, width, height);
      fogEndpoints = cachedStaticMapLayer.fogEndpoints;
    } else {
      let renderedFromCache = false;
      if (typeof document !== "undefined") {
        const staticCanvas = document.createElement("canvas");
        staticCanvas.width = canvas.width;
        staticCanvas.height = canvas.height;
        const staticCtx = staticCanvas.getContext("2d");
        if (staticCtx) {
          staticCtx.setTransform(1, 0, 0, 1, 0, 0);
          staticCtx.scale(dpr, dpr);
          const staticLayerResult = renderStaticMapLayer({
            ctx: staticCtx,
            selectedMap,
            theme,
            canvasWidthPx: canvas.width,
            canvasHeightPx: canvas.height,
            cssWidth: width,
            cssHeight: height,
            dpr,
            cameraOffset,
            cameraZoom,
            preRoadCallback,
          });
          fogEndpoints = staticLayerResult.fogEndpoints;
          cachedStaticMapLayerRef.current = {
            key: staticLayerKey,
            canvas: staticCanvas,
            fogEndpoints,
          };
          ctx.drawImage(staticCanvas, 0, 0, width, height);
          renderedFromCache = true;
        }
      }

      if (!renderedFromCache) {
        const staticLayerResult = renderStaticMapLayer({
          ctx,
          selectedMap,
          theme,
          canvasWidthPx: canvas.width,
          canvasHeightPx: canvas.height,
          cssWidth: width,
          cssHeight: height,
          dpr,
          cameraOffset,
          cameraZoom,
          preRoadCallback,
        });
        fogEndpoints = staticLayerResult.fogEndpoints;
      }
    }

    // Save state before camera transforms
    ctx.save();

    // Draw fog over road ends to create fade effect
    const fogGroundRgb = hexToRgb(theme.ground[2]);
    const fogAccentRgb = hexToRgb(theme.accent);
    const fogPathRgb = hexToRgb(theme.path[2]);
    const { fogBlobCount, fogWispCount } = computeFogCounts(isChallengeTerrainLevel);
    const roadEndFogSize = isChallengeTerrainLevel ? 215 : 300;
    for (const endpoint of fogEndpoints) {
      drawRoadEndFog({
        ctx,
        endPos: endpoint.endPos,
        towardsPos: endpoint.towardsPos,
        size: roadEndFogSize,
        nowSeconds,
        cameraZoom,
        groundRgb: fogGroundRgb,
        accentRgb: fogAccentRgb,
        pathRgb: fogPathRgb,
        isChallengeTerrainLevel,
        fogBlobCount,
        fogWispCount,
      });
    }

    // Pre-pass: special tower ground transitions (above roads, below decorations/towers)
    renderSpecialTowerTransitions(
      ctx,
      selectedMap,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom,
    );

    // Generate theme-specific decorations (CACHED for performance)
    // PERFORMANCE FIX: Cache decorations to avoid regenerating 500+ objects every frame
    // This was a major cause of freezing on mobile devices
    let decorations: RuntimeDecoration[];

    const settingsVer = getSettingsVersion();
    const decorCacheKey = `${selectedMap}:${settingsVer}`;
    if (cachedDecorationsRef.current && cachedDecorationsRef.current.mapKey === decorCacheKey) {
      decorations = cachedDecorationsRef.current.decorations;
    } else {
      // Generate decorations and cache them
      decorations = [];
      const spacingGrid = new DecorationSpatialGrid();
      seededRandom = createSeededRandom(mapSeed + 400);
      const currentTheme = mapTheme;

      const categories = getDecorationCategories(currentTheme);
      const levelPathKeys =
        activeWaveSpawnPaths.length > 0
          ? activeWaveSpawnPaths
          : getLevelPathKeys(selectedMap);

      const allPathSegments: PathSegment[] = [];
      for (const pathKey of levelPathKeys) {
        const pathPoints = MAP_PATHS[pathKey];
        if (pathPoints && pathPoints.length >= 2) {
          allPathSegments.push(...buildPathSegments(pathPoints));
        }
      }

      const distToPath = (worldPos: Position): number =>
        minDistanceToPath(worldPos, allPathSegments);

      const isOnPath = (worldPos: Position): boolean =>
        distToPath(worldPos) < TOWER_PLACEMENT_BUFFER + 15;

      // Create deterministic zones for different decoration types
      const zoneSize = 4;
      const minX = -12, maxX = GRID_WIDTH + 12;
      const minY = -12, maxY = GRID_HEIGHT + 12;
      const zonesX = Math.ceil((maxX - minX) / zoneSize);
      const zonesY = Math.ceil((maxY - minY) / zoneSize);

      const distFromPath = (gx: number, gy: number): number =>
        distToPath(gridToWorld({ x: gx, y: gy }));

      const isBeyondGrid = (gx: number, gy: number): boolean =>
        gx < 0 || gx > GRID_WIDTH || gy < 0 || gy > GRID_HEIGHT;
      const BEYOND_GRID_REDUCE = 0.3;
      const specialTowerZones = getLevelSpecialTowers(selectedMap).map((tower) => ({
        cx: tower.pos.x,
        cy: tower.pos.y,
      }));

      // Build landmark exclusion zones from map-defined decorations.
      // Each zone has a core radius (no decorations) and a full radius
      // (small ground-level decorations allowed but trees/structures blocked).
      const landmarkZones: LandmarkZone[] = [];
      if (levelData?.decorations) {
        for (const deco of levelData.decorations) {
          const decoType = deco.category || deco.type;
          if (!decoType || !LANDMARK_DECORATION_TYPES.has(decoType)) continue;
          const resolvedPlacement = resolveMapDecorationRuntimePlacement(deco);
          const decoWorldPos = getMapDecorationWorldPos(deco);
          const decoGridX = decoWorldPos.x / TILE_SIZE - 0.5;
          const decoGridY = decoWorldPos.y / TILE_SIZE - 0.5;
          const exclusion = getLandmarkSpawnExclusion(
            decoType,
            resolvedPlacement?.scale ?? (deco.size || 1),
            deco.heightTag
          );
          if (!exclusion) continue;
          landmarkZones.push({
            cx: decoGridX,
            cy: decoGridY,
            coreR: exclusion.coreR,
            fullR: exclusion.fullR,
          });
        }
      }

      // Zone assignments with smaller zones for tighter clustering
      const zoneAssignments: (keyof typeof categories)[][] = [];
      for (let zx = 0; zx < zonesX; zx++) {
        zoneAssignments[zx] = [];
        for (let zy = 0; zy < zonesY; zy++) {
          const zoneHash = (mapSeed * 31 + zx * 17 + zy * 13) % 100;
          let cat: keyof typeof categories;
          if (zoneHash < 45) cat = "trees";
          else if (zoneHash < 70) cat = "terrain";
          else if (zoneHash < 88) cat = "structures";
          else cat = "scattered";
          zoneAssignments[zx][zy] = cat;
        }
      }

      const landscapeSettings = getGameSettings().landscaping;
      const decoMultiplier = DECORATION_DENSITY_MULTIPLIER[landscapeSettings.decorationDensity];
      const scaleRange = DECORATION_SCALE_RANGE[landscapeSettings.decorationScale];

      const mainDecoCount = Math.round(300 * decoMultiplier);
      for (let i = 0; i < mainDecoCount; i++) {
        const zoneX = Math.floor(seededRandom() * zonesX);
        const zoneY = Math.floor(seededRandom() * zonesY);
        const category = zoneAssignments[zoneX][zoneY];
        const categoryDecors = categories[category];
        if (!categoryDecors || categoryDecors.length === 0) continue;

        const zoneCenterX = minX + (zoneX + 0.5) * zoneSize;
        const zoneCenterY = minY + (zoneY + 0.5) * zoneSize;
        const offsetX = (seededRandom() - 0.5 + seededRandom() - 0.5) * zoneSize * 0.65;
        const offsetY = (seededRandom() - 0.5 + seededRandom() - 0.5) * zoneSize * 0.65;
        const gridX = zoneCenterX + offsetX;
        const gridY = zoneCenterY + offsetY;

        if (isBeyondGrid(gridX, gridY) && seededRandom() > BEYOND_GRID_REDUCE) continue;

        const worldPos = gridToWorld({ x: gridX, y: gridY });
        if (isOnPath(worldPos)) continue;

        const isLargeCategory = category === "trees" || category === "structures";
        if (isLargeCategory && isInLandmarkCore(gridX, gridY, landmarkZones)) continue;
        if (!isLargeCategory && isInLandmarkFull(gridX, gridY, landmarkZones)) continue;
        if (isLargeCategory && isInSpecialTowerZone(gridX, gridY, 1.9, specialTowerZones)) continue;
        if (!isLargeCategory && isInSpecialTowerZone(gridX, gridY, 1.15, specialTowerZones)) continue;

        const typeIndex = Math.floor(seededRandom() * seededRandom() * categoryDecors.length);
        const type = categoryDecors[typeIndex] as DecorationType;

        let baseScale = scaleRange.base;
        let scaleVar = scaleRange.variance;
        if (category === "trees") {
          baseScale = Math.max(baseScale, 0.75);
          scaleVar = Math.max(scaleVar, 0.5);
        } else if (category === "structures") {
          baseScale = Math.max(baseScale, 0.8);
          scaleVar = Math.min(scaleVar, 0.45);
        } else if (category === "scattered") {
          baseScale = Math.min(baseScale, 0.55);
          scaleVar = Math.min(scaleVar, 0.45);
        }

        const scale = baseScale + seededRandom() * scaleVar;
        const rotation = seededRandom() * Math.PI * 2;
        const variant = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(type, scale);
        if (!spacingGrid.tryPlace(gridX, gridY, exR)) continue;

        decorations.push({
          type,
          x: worldPos.x,
          y: worldPos.y,
          scale,
          rotation,
          variant,
        });
      }

      const treeClusterCount = TREE_CLUSTER_COUNT[landscapeSettings.treeClusterDensity];
      for (let cluster = 0; cluster < treeClusterCount; cluster++) {
        const clusterX = minX + seededRandom() * (maxX - minX);
        const clusterY = minY + seededRandom() * (maxY - minY);

        if (isBeyondGrid(clusterX, clusterY) && seededRandom() > BEYOND_GRID_REDUCE) continue;

        const treesInCluster = 8 + Math.floor(seededRandom() * 10);
        const treeTypes = categories.trees;
        for (let t = 0; t < treesInCluster; t++) {
          const treeX = clusterX + (seededRandom() - 0.5) * 2.9;
          const treeY = clusterY + (seededRandom() - 0.5) * 2.9;
          const worldPos = gridToWorld({ x: treeX, y: treeY });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(treeX, treeY, landmarkZones)) continue;
          if (isInSpecialTowerZone(treeX, treeY, 1.9, specialTowerZones)) continue;

          const treeType = treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType;
          const treeScale = 0.6 + seededRandom() * 0.7;
          const treeRot = seededRandom() * Math.PI * 2;
          const treeVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(treeType, treeScale);
          if (!spacingGrid.tryPlace(treeX, treeY, exR)) continue;

          decorations.push({
            type: treeType,
            x: worldPos.x,
            y: worldPos.y,
            scale: treeScale,
            rotation: treeRot,
            variant: treeVar,
          });
        }
      }

      const groveCount = GROVE_COUNT[landscapeSettings.treeClusterDensity];
      for (let grove = 0; grove < groveCount; grove++) {
        const groveX = minX + 3 + seededRandom() * (maxX - minX - 6);
        const groveY = minY + 3 + seededRandom() * (maxY - minY - 6);
        const groveDist = distFromPath(groveX, groveY);
        if (groveDist < TOWER_PLACEMENT_BUFFER + 40) continue;

        const groveSize = 6 + Math.floor(seededRandom() * 8);
        const treeTypes = categories.trees;
        for (let t = 0; t < groveSize; t++) {
          const tx = groveX + (seededRandom() - 0.5) * 2.62;
          const ty = groveY + (seededRandom() - 0.5) * 2.62;
          const worldPos = gridToWorld({ x: tx, y: ty });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(tx, ty, landmarkZones)) continue;
          if (isInSpecialTowerZone(tx, ty, 1.9, specialTowerZones)) continue;

          const groveType = treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType;
          const groveScale = 0.65 + seededRandom() * 0.65;
          const groveRot = seededRandom() * Math.PI * 2;
          const groveVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(groveType, groveScale);
          if (!spacingGrid.tryPlace(tx, ty, exR)) continue;

          decorations.push({
            type: groveType,
            x: worldPos.x,
            y: worldPos.y,
            scale: groveScale,
            rotation: groveRot,
            variant: groveVar,
          });
        }
      }

      const villageCount = VILLAGE_COUNT[landscapeSettings.villageDensity];
      for (let village = 0; village < villageCount; village++) {
        const villageX = minX + 5 + seededRandom() * (maxX - minX - 10);
        const villageY = minY + 5 + seededRandom() * (maxY - minY - 10);
        const villageCenterWorld = gridToWorld({ x: villageX, y: villageY });
        if (isOnPath(villageCenterWorld)) continue;
        if (distFromPath(villageX, villageY) < TOWER_PLACEMENT_BUFFER + 25) continue;
        if (isInSpecialTowerZone(villageX, villageY, 2.3, specialTowerZones)) continue;

        const structureTypes = categories.structures;
        const scatteredTypes = categories.scattered;
        const structCount = 6 + Math.floor(seededRandom() * 7);

        // Core structures
        for (let si = 0; si < structCount; si++) {
          const structX = villageX + (seededRandom() - 0.5) * 3.0;
          const structY = villageY + (seededRandom() - 0.5) * 3.0;
          const worldPos = gridToWorld({ x: structX, y: structY });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(structX, structY, landmarkZones)) continue;
          if (isInSpecialTowerZone(structX, structY, 1.9, specialTowerZones)) continue;

          const sType = structureTypes[Math.floor(seededRandom() * structureTypes.length)] as DecorationType;
          const sScale = 0.7 + seededRandom() * 0.5;
          const sRot = seededRandom() * Math.PI * 0.3 - Math.PI * 0.15;
          const sVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(sType, sScale);
          if (!spacingGrid.tryPlace(structX, structY, exR)) continue;

          decorations.push({
            type: sType,
            x: worldPos.x,
            y: worldPos.y,
            scale: sScale,
            rotation: sRot,
            variant: sVar,
          });
        }

        // Surrounding scatter (lampposts, barrels, signs around village)
        const surroundCount = 4 + Math.floor(seededRandom() * 5);
        for (let si = 0; si < surroundCount; si++) {
          const angle = seededRandom() * Math.PI * 2;
          const dist = 1.8 + seededRandom() * 1.5;
          const sx = villageX + Math.cos(angle) * dist;
          const sy = villageY + Math.sin(angle) * dist;
          const worldPos = gridToWorld({ x: sx, y: sy });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkFull(sx, sy, landmarkZones)) continue;
          if (isInSpecialTowerZone(sx, sy, 1.15, specialTowerZones)) continue;

          const scType = (scatteredTypes.length > 0
            ? scatteredTypes[Math.floor(seededRandom() * scatteredTypes.length)]
            : structureTypes[Math.floor(seededRandom() * structureTypes.length)]) as DecorationType;
          const scScale = 0.5 + seededRandom() * 0.4;
          const scRot = seededRandom() * Math.PI * 2;
          const scVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(scType, scScale);
          if (!spacingGrid.tryPlace(sx, sy, exR)) continue;

          decorations.push({
            type: scType,
            x: worldPos.x,
            y: worldPos.y,
            scale: scScale,
            rotation: scRot,
            variant: scVar,
          });
        }

        // Trees around village perimeter
        const perimeterTrees = 3 + Math.floor(seededRandom() * 4);
        const treeTypes = categories.trees;
        for (let ti = 0; ti < perimeterTrees; ti++) {
          const angle = seededRandom() * Math.PI * 2;
          const dist = 2.5 + seededRandom() * 2;
          const tx = villageX + Math.cos(angle) * dist;
          const ty = villageY + Math.sin(angle) * dist;
          const worldPos = gridToWorld({ x: tx, y: ty });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(tx, ty, landmarkZones)) continue;
          if (isInSpecialTowerZone(tx, ty, 1.9, specialTowerZones)) continue;

          const ptType = treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType;
          const ptScale = 0.6 + seededRandom() * 0.5;
          const ptRot = seededRandom() * Math.PI * 2;
          const ptVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(ptType, ptScale);
          if (!spacingGrid.tryPlace(tx, ty, exR)) continue;

          decorations.push({
            type: ptType,
            x: worldPos.x,
            y: worldPos.y,
            scale: ptScale,
            rotation: ptRot,
            variant: ptVar,
          });
        }
      }

      const uniformFillCount = Math.round(350 * decoMultiplier);
      for (let i = 0; i < uniformFillCount; i++) {
        const gx = minX + seededRandom() * (maxX - minX);
        const gy = minY + seededRandom() * (maxY - minY);
        const pathDist = distFromPath(gx, gy);

        const pathFactor = Math.min(1, pathDist / 120);
        if (seededRandom() > pathFactor) continue;

        if (isBeyondGrid(gx, gy) && seededRandom() > BEYOND_GRID_REDUCE) continue;

        const worldPos = gridToWorld({ x: gx, y: gy });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
        if (isInSpecialTowerZone(gx, gy, 1.15, specialTowerZones)) continue;

        const allDecorTypes = [...categories.trees, ...categories.terrain];
        const fillType = allDecorTypes[Math.floor(seededRandom() * allDecorTypes.length)] as DecorationType;
        const fillScale = 0.5 + seededRandom() * 0.6;
        const fillRot = seededRandom() * Math.PI * 2;
        const fillVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(fillType, fillScale);
        if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

        decorations.push({
          type: fillType,
          x: worldPos.x,
          y: worldPos.y,
          scale: fillScale,
          rotation: fillRot,
          variant: fillVar,
        });
      }

      // Battle damage (theme-appropriate)
      seededRandom = createSeededRandom(mapSeed + 600);
      const battleDecors: DecorationType[] =
        currentTheme === "volcanic"
          ? ["crater", "ember", "bones", "sword"]
          : currentTheme === "winter"
            ? ["crater", "debris", "sword", "arrow"]
            : currentTheme === "desert"
              ? ["crater", "skeleton", "sword", "arrow", "bones"]
              : currentTheme === "swamp"
                ? ["crater", "skeleton", "bones", "debris"]
                : ["crater", "debris", "cart", "sword", "arrow", "skeleton", "fire"];
      const battleDebrisCount = BATTLE_DEBRIS_COUNT[landscapeSettings.battleDebrisDensity];
      for (let i = 0; i < battleDebrisCount; i++) {
        const gridX = seededRandom() * (GRID_WIDTH + 23) - 11.5;
        const gridY = seededRandom() * (GRID_HEIGHT + 23) - 11.5;

        if (isBeyondGrid(gridX, gridY) && seededRandom() > BEYOND_GRID_REDUCE) continue;
        if (isInLandmarkFull(gridX, gridY, landmarkZones)) continue;
        if (isInSpecialTowerZone(gridX, gridY, 1.15, specialTowerZones)) continue;

        const worldPos = gridToWorld({ x: gridX, y: gridY });
        const bdType =
          battleDecors[Math.floor(seededRandom() * battleDecors.length)];
        const bdScale = 0.4 + seededRandom() * 0.55;
        const bdRot = seededRandom() * Math.PI * 2;
        const bdVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(bdType, bdScale);
        if (!spacingGrid.tryPlace(gridX, gridY, exR)) continue;

        decorations.push({
          type: bdType,
          x: worldPos.x,
          y: worldPos.y,
          scale: bdScale,
          rotation: bdRot,
          variant: bdVar,
        });
      }

      // Grid edge border decorations — line the perimeter with trees and terrain
      seededRandom = createSeededRandom(mapSeed + 800);
      const edgeTreeTypes = categories.trees;
      const edgeTerrainTypes = categories.terrain;

      const edgeSegments = [
        { startX: -3, startY: -2, dx: 1, dy: 0, length: GRID_WIDTH + 6 },
        { startX: -3, startY: GRID_HEIGHT + 2, dx: 1, dy: 0, length: GRID_WIDTH + 6 },
        { startX: -2, startY: -3, dx: 0, dy: 1, length: GRID_HEIGHT + 6 },
        { startX: GRID_WIDTH + 2, startY: -3, dx: 0, dy: 1, length: GRID_HEIGHT + 6 },
      ];

      for (const seg of edgeSegments) {
        let travelled = 0;
        while (travelled < seg.length) {
          const step = 1.2 + seededRandom() * 1.3;
          travelled += step;
          if (travelled > seg.length) break;

          const baseX = seg.startX + seg.dx * travelled;
          const baseY = seg.startY + seg.dy * travelled;
          const perpX = seg.dy;
          const perpY = seg.dx;
          const offsetPerp = (seededRandom() - 0.5) * 3;
          const offsetAlong = (seededRandom() - 0.5) * 0.5;
          const gx = baseX + perpX * offsetPerp + seg.dx * offsetAlong;
          const gy = baseY + perpY * offsetPerp + seg.dy * offsetAlong;

          const worldPos = gridToWorld({ x: gx, y: gy });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
          if (isInSpecialTowerZone(gx, gy, 1.9, specialTowerZones)) continue;

          const isTree = seededRandom() > 0.3;
          const edgeType = (isTree
            ? edgeTreeTypes[Math.floor(seededRandom() * edgeTreeTypes.length)]
            : edgeTerrainTypes[Math.floor(seededRandom() * edgeTerrainTypes.length)]) as DecorationType;
          const edgeScale = isTree ? 0.7 + seededRandom() * 0.6 : 0.5 + seededRandom() * 0.5;
          const edgeRot = seededRandom() * Math.PI * 2;
          const edgeVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(edgeType, edgeScale);
          if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

          decorations.push({
            type: edgeType,
            x: worldPos.x,
            y: worldPos.y,
            scale: edgeScale,
            rotation: edgeRot,
            variant: edgeVar,
          });
        }
      }

      // Dense decorations around path spawns and exits
      seededRandom = createSeededRandom(mapSeed + 700);
      const pathEndpoints: { x: number; y: number }[] = [];
      for (const pathKey of levelPathKeys) {
        const pathPoints = MAP_PATHS[pathKey];
        if (!pathPoints || pathPoints.length < 2) continue;
        pathEndpoints.push(pathPoints[0], pathPoints[pathPoints.length - 1]);
      }

      const endpointTreeTypes = categories.trees;
      const endpointTerrainTypes = categories.terrain;

      for (const endpoint of pathEndpoints) {
        // Inner dense wall of large trees/terrain right at the endpoint (0.3-2 tiles)
        const innerCount = 10 + Math.floor(seededRandom() * 5);
        for (let i = 0; i < innerCount; i++) {
          const angle = seededRandom() * Math.PI * 2;
          const dist = 0.3 + seededRandom() * 1.7;
          const gx = endpoint.x + Math.cos(angle) * dist;
          const gy = endpoint.y + Math.sin(angle) * dist;
          const worldPos = gridToWorld({ x: gx, y: gy });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
          if (isInSpecialTowerZone(gx, gy, 1.9, specialTowerZones)) continue;

          const epInType = (seededRandom() > 0.3
            ? endpointTreeTypes[Math.floor(seededRandom() * endpointTreeTypes.length)]
            : endpointTerrainTypes[Math.floor(seededRandom() * endpointTerrainTypes.length)]) as DecorationType;
          const epInScale = 0.8 + seededRandom() * 0.7;
          const epInRot = seededRandom() * Math.PI * 2;
          const epInVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(epInType, epInScale);
          if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

          decorations.push({
            type: epInType,
            x: worldPos.x,
            y: worldPos.y,
            scale: epInScale,
            rotation: epInRot,
            variant: epInVar,
          });
        }

        // Mid-ring trees (1.5-4.5 tiles)
        const treeCount = 18 + Math.floor(seededRandom() * 8);
        for (let t = 0; t < treeCount; t++) {
          const angle = seededRandom() * Math.PI * 2;
          const dist = 1.5 + seededRandom() * 3;
          const gx = endpoint.x + Math.cos(angle) * dist;
          const gy = endpoint.y + Math.sin(angle) * dist;
          const worldPos = gridToWorld({ x: gx, y: gy });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
          if (isInSpecialTowerZone(gx, gy, 1.9, specialTowerZones)) continue;

          const epMidType = (seededRandom() > 0.25
            ? endpointTreeTypes[Math.floor(seededRandom() * endpointTreeTypes.length)]
            : endpointTerrainTypes[Math.floor(seededRandom() * endpointTerrainTypes.length)]) as DecorationType;
          const epMidScale = 0.65 + seededRandom() * 0.65;
          const epMidRot = seededRandom() * Math.PI * 2;
          const epMidVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(epMidType, epMidScale);
          if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

          decorations.push({
            type: epMidType,
            x: worldPos.x,
            y: worldPos.y,
            scale: epMidScale,
            rotation: epMidRot,
            variant: epMidVar,
          });
        }

        // Outer scattered ring (2.5-6.5 tiles)
        const scatterCount = 12 + Math.floor(seededRandom() * 7);
        for (let s = 0; s < scatterCount; s++) {
          const angle = seededRandom() * Math.PI * 2;
          const dist = 2.5 + seededRandom() * 4;
          const gx = endpoint.x + Math.cos(angle) * dist;
          const gy = endpoint.y + Math.sin(angle) * dist;
          const worldPos = gridToWorld({ x: gx, y: gy });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkFull(gx, gy, landmarkZones)) continue;
          if (isInSpecialTowerZone(gx, gy, 1.15, specialTowerZones)) continue;

          const epOutTypes = [...categories.scattered, ...endpointTerrainTypes];
          const epOutType = epOutTypes[Math.floor(seededRandom() * epOutTypes.length)] as DecorationType;
          const epOutScale = 0.4 + seededRandom() * 0.5;
          const epOutRot = seededRandom() * Math.PI * 2;
          const epOutVar = Math.floor(seededRandom() * 4);

          const exR = getExclusionRadius(epOutType, epOutScale);
          if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

          decorations.push({
            type: epOutType,
            x: worldPos.x,
            y: worldPos.y,
            scale: epOutScale,
            rotation: epOutRot,
            variant: epOutVar,
          });
        }
      }

      // Add major landmarks from LEVEL_DATA if defined
      const levelDecorations = LEVEL_DATA[selectedMap]?.decorations;
      if (levelDecorations) {
        const specialTowerWorldPositions = getLevelSpecialTowers(selectedMap).map((tower) =>
          gridToWorld(tower.pos)
        );
        let manualDecorationCount = 0;
        for (const dec of levelDecorations) {
          const resolvedPlacement = resolveMapDecorationRuntimePlacement(dec);
          if (!resolvedPlacement) continue;

          const worldPos = getMapDecorationWorldPos(dec);
          if (specialTowerWorldPositions.length > 0) {
            const clearRadius =
              Math.max(TILE_SIZE * 0.8, resolvedPlacement.scale * 18);
            const overlapsSpecialTower = specialTowerWorldPositions.some(
              (specPos) => distance(worldPos, specPos) < clearRadius
            );
            if (overlapsSpecialTower) {
              continue;
            }
          }
          const decorationVariant =
            typeof dec.variant === "number"
              ? dec.variant
              : typeof dec.variant === "string"
                ? Number.parseInt(dec.variant, 10) || 0
                : 0;
          const manualDecoration: RuntimeDecoration = {
            type: resolvedPlacement.runtimeType,
            x: worldPos.x,
            y: worldPos.y,
            scale: resolvedPlacement.scale,
            rotation: 0,
            variant: decorationVariant,
            source: "manual",
            manualOrder: manualDecorationCount,
          };
          manualDecorationCount += 1;

          if (dec.heightTag) {
            manualDecoration.heightTag = dec.heightTag;
          }
          if (getDecorationRenderLayer(manualDecoration) === "background") {
            manualDecoration.renderLayer = "background";
          }
          decorations.push(manualDecoration);
        }
      }

      for (const decoration of decorations) {
        decoration.heightTag = getRuntimeDecorationHeightTag(decoration);
      }

      // Stable decoration order: background layer -> depth -> manual tie-breakers.
      decorations.sort((a, b) => {
        const layerDiff = getLayerPriority(a) - getLayerPriority(b);
        if (layerDiff !== 0) return layerDiff;

        const depthDiff = getDecorationIsoY(a) - getDecorationIsoY(b);
        if (Math.abs(depthDiff) > 0.001) return depthDiff;

        const sourceDiff = getSourcePriority(a) - getSourcePriority(b);
        if (sourceDiff !== 0) return sourceDiff;

        return (a.manualOrder ?? 0) - (b.manualOrder ?? 0);
      });

      // Cache the generated decorations
      cachedDecorationsRef.current = { mapKey: decorCacheKey, decorations };

      // Add blocked positions from procedural background decorations (water, lava, etc.)
      for (const dec of decorations) {
        if (dec.source === "manual") continue;
        if (!BACKGROUND_BLOCKING_DECORATION_TYPES.has(dec.type)) continue;
        const gx = Math.floor(dec.x / TILE_SIZE - 0.5);
        const gy = Math.floor(dec.y / TILE_SIZE - 0.5);
        const range = Math.ceil(dec.scale);
        for (let dx = -range; dx <= range; dx++) {
          for (let dy = -range; dy <= range; dy++) {
            blockedPositions.add(`${gx + dx},${gy + dy}`);
          }
        }
      }
    } // End of decoration generation (else block)

    const decorTime = nowSeconds;

    // Collect renderables
    const renderables: Renderable[] = [];
    const decorationMarginPx = QUALITY_DECORATION_MARGIN_PX[renderQuality];
    const worldCorners = [
      screenToWorld(
        { x: -decorationMarginPx, y: -decorationMarginPx },
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      ),
      screenToWorld(
        { x: width + decorationMarginPx, y: -decorationMarginPx },
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      ),
      screenToWorld(
        { x: -decorationMarginPx, y: height + decorationMarginPx },
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      ),
      screenToWorld(
        { x: width + decorationMarginPx, y: height + decorationMarginPx },
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      ),
    ];
    const minVisibleWorldX = Math.min(...worldCorners.map((p) => p.x));
    const maxVisibleWorldX = Math.max(...worldCorners.map((p) => p.x));
    const minVisibleWorldY = Math.min(...worldCorners.map((p) => p.y));
    const maxVisibleWorldY = Math.max(...worldCorners.map((p) => p.y));
    const enemyCullMargin = 220;
    const projectileCullMargin = 180;
    const effectCullMargin = 240;
    const enemyById = new Map(enemies.map((enemy) => [enemy.id, enemy]));
    const enemyWorldPosById = new Map<string, Position>();
    const getEnemyWorldPos = (enemy: Enemy): Position => {
      const cached = enemyWorldPosById.get(enemy.id);
      if (cached) return cached;
      const pos = getEnemyPosWithPath(enemy, selectedMap);
      enemyWorldPosById.set(enemy.id, pos);
      return pos;
    };

    const decorationLayerKey = [
      selectedMap,
      canvas.width,
      canvas.height,
      dpr,
      renderQuality,
      cameraZoom.toFixed(3),
      cameraOffset.x.toFixed(2),
      cameraOffset.y.toFixed(2),
    ].join("|");
    const drawBackgroundDecorations = (
      entries: CachedVisibleDecoration[]
    ) => {
      for (const entry of entries) {
        const dec = entry.decoration;
        const decVolume = getDecorationVolumeSpec(dec.type, dec.heightTag);
        const hasBackgroundShadowPass = decVolume.backgroundShadowOnly;
        ctx.save();
        renderDecorationItem({
          ctx,
          screenPos: entry.screenPos,
          scale: cameraZoom * dec.scale,
          type: dec.type,
          rotation: dec.rotation,
          variant: dec.variant,
          decorTime,
          decorX: dec.x,
          decorY: dec.y,
          selectedMap,
          mapTheme,
          shadowOnly: !!entry.shadowOnly,
          skipShadow: hasBackgroundShadowPass && !entry.shadowOnly,
        });
        ctx.restore();
      }
    };
    const drawLevelHazards = () => {
      const levelHazards = LEVEL_DATA[selectedMap]?.hazards;
      if (!levelHazards || levelHazards.length === 0) return;

      for (const hazard of levelHazards) {
        renderHazard(
          ctx,
          hazard,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cameraZoom
        );
      }
    };

    // Hazards must render beneath all decoration passes.
    drawLevelHazards();

    // Merge pending death effects from the ref queue so they render immediately,
    // bypassing React state batch timing. Advance their progress using wall-clock time.
    const pendingDeath = pendingDeathEffectsRef.current;
    const effectIds = new Set(effects.map(e => e.id));
    const mergedEffects: Effect[] = [...effects];
    const now = performance.now();
    const survivingPending: Effect[] = [];
    for (const de of pendingDeath) {
      if (effectIds.has(de.id)) continue;
      const spawnedAt = (de as Effect & { _spawnedAt?: number })._spawnedAt || now;
      const elapsed = now - spawnedAt;
      de.progress = Math.min(0.99, elapsed / (de.duration || 500));
      if (de.progress < 0.99) {
        mergedEffects.push(de);
        survivingPending.push(de);
      }
    }
    pendingDeathEffectsRef.current = survivingPending;

    // Ground-level spell effects (scorch marks, impact craters) render above roads/hazards
    // but below decorations, towers, and entities.
    const groundEffectTypes = new Set(["fire_scorch", "lightning_scorch", "meteor_impact"]);
    const skyEffectTypes = new Set(["meteor_falling", "lightning_bolt"]);
    const deathEffectType = "enemy_death";
    const groundEffects: Effect[] = [];
    const skyEffects: Effect[] = [];
    const deathEffects: Effect[] = [];
    for (const eff of mergedEffects) {
      if (groundEffectTypes.has(eff.type)) groundEffects.push(eff);
      else if (skyEffectTypes.has(eff.type)) skyEffects.push(eff);
      else if (eff.type === deathEffectType) deathEffects.push(eff);
    }
    for (const eff of groundEffects) {
      renderEffect(
        ctx, eff, canvas.width, canvas.height, dpr,
        enemies, towers, selectedMap, cameraOffset, cameraZoom, mergedEffects.length
      );
    }

    // Death animation effects render above roads/hazards but below decorations and entities.
    for (const eff of deathEffects) {
      const deathScreenPos = worldToScreen(eff.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
      const deathZoom = cameraZoom || 1;
      ctx.save();
      renderEnemyDeath(ctx, deathScreenPos, deathZoom, eff.progress, eff);
      ctx.restore();
    }

    let animatedVisibleDecorations: CachedVisibleDecoration[] = [];
    let depthSensitiveVisibleDecorations: CachedVisibleDecoration[] = [];
    const cachedStaticDecorationLayer = cachedStaticDecorationLayerRef.current;
    if (
      cachedStaticDecorationLayer &&
      cachedStaticDecorationLayer.key === decorationLayerKey
    ) {
      drawBackgroundDecorations(cachedStaticDecorationLayer.backgroundDecorations);
      if (cachedStaticDecorationLayer.canvas) {
        ctx.drawImage(cachedStaticDecorationLayer.canvas, 0, 0, width, height);
      }
      animatedVisibleDecorations = cachedStaticDecorationLayer.animatedDecorations;
      depthSensitiveVisibleDecorations =
        cachedStaticDecorationLayer.depthSensitiveDecorations;
    } else {
      const visibleDecorations: CachedVisibleDecoration[] = [];
      for (const dec of decorations) {
        if (
          isChallengeTerrainLevel &&
          !isWorldPosInChallengeDecorationFootprint(
            { x: dec.x, y: dec.y },
            challengePathSegments
          )
        ) {
          continue;
        }
        if (
          dec.x < minVisibleWorldX ||
          dec.x > maxVisibleWorldX ||
          dec.y < minVisibleWorldY ||
          dec.y > maxVisibleWorldY
        ) {
          continue;
        }
        const decScreenPos = toScreen({ x: dec.x, y: dec.y });
        if (
          decScreenPos.x < -decorationMarginPx ||
          decScreenPos.x > width + decorationMarginPx ||
          decScreenPos.y < -decorationMarginPx ||
          decScreenPos.y > height + decorationMarginPx
        ) {
          continue;
        }
        visibleDecorations.push({
          decoration: dec,
          screenPos: decScreenPos,
          isoY: getDecorationIsoY(dec),
        });
      }

      const backgroundDecorations: CachedVisibleDecoration[] = [];
      const staticDecorations: CachedVisibleDecoration[] = [];
      const animatedDecorations: CachedVisibleDecoration[] = [];
      const depthSensitiveDecorations: CachedVisibleDecoration[] = [];
      const occlusionAnchors: OcclusionAnchor[] = visibleDecorations.reduce<
        OcclusionAnchor[]
      >((anchors, entry) => {
        const volume = getDecorationVolumeSpec(
          entry.decoration.type,
          entry.decoration.heightTag
        );
        if (volume.heightTag !== "landmark") {
          return anchors;
        }
        const screenScale = cameraZoom * entry.decoration.scale;
        anchors.push({
          source: entry,
          heightTag: volume.heightTag,
          centerX: entry.screenPos.x,
          centerY: entry.screenPos.y + volume.anchorOffsetY * screenScale,
          radiusX: (volume.width * 0.35) * screenScale,
          radiusY: (volume.length * 0.35) * screenScale,
          isoY: entry.isoY,
          frontDepthPadding: volume.frontDepthPadding * entry.decoration.scale,
        });
        return anchors;
      }, []);

      const renderPathSegments: PathSegment[] = [];
      const renderPathKeys =
        activeWaveSpawnPaths.length > 0
          ? activeWaveSpawnPaths
          : getLevelPathKeys(selectedMap);
      for (const pathKey of renderPathKeys) {
        const pathPoints = MAP_PATHS[pathKey];
        if (pathPoints && pathPoints.length >= 2) {
          renderPathSegments.push(...buildPathSegments(pathPoints));
        }
      }
      const renderDistToPath = (worldPos: Position): number =>
        minDistanceToPath(worldPos, renderPathSegments);
      for (const entry of visibleDecorations) {
        const type = entry.decoration.type;
        const renderLayer = getDecorationRenderLayer(entry.decoration);
        const volume = getDecorationVolumeSpec(
          entry.decoration.type,
          entry.decoration.heightTag
        );
        const heightTag = volume.heightTag;
        const isLargeByHeight = heightTag === "tall" || heightTag === "landmark";
        const occlusionState = getOcclusionState(entry, occlusionAnchors);
        const resolvedEntry =
          occlusionState.clampIsoY === undefined
            ? entry
            : {
              ...entry,
              isoY: Math.min(entry.isoY, occlusionState.clampIsoY),
            };
        if (volume.backgroundShadowOnly) {
          backgroundDecorations.push({ ...resolvedEntry, shadowOnly: true });
        }
        if (renderLayer === "background") {
          backgroundDecorations.push(resolvedEntry);
        } else if (occlusionState.isInsideOccluder) {
          // Decorations inside/around landmark volumes must interleave by depth.
          depthSensitiveDecorations.push(resolvedEntry);
        } else if (RUNTIME_ANIMATED_DECORATION_TYPES.has(type)) {
          if (heightTag === "landmark") {
            depthSensitiveDecorations.push(resolvedEntry);
          } else {
            animatedDecorations.push(resolvedEntry);
          }
        } else if (
          ALWAYS_DEPTH_SENSITIVE_DECORATION_TYPES.has(type) ||
          heightTag === "landmark" ||
          ((DEPTH_SENSITIVE_DECORATION_TYPES.has(type) || isLargeByHeight) &&
            renderDistToPath({
              x: resolvedEntry.decoration.x,
              y: resolvedEntry.decoration.y,
            }) <= DEPTH_SENSITIVE_PATH_DISTANCE)
        ) {
          depthSensitiveDecorations.push(resolvedEntry);
        } else {
          staticDecorations.push(resolvedEntry);
        }
      }

      const shouldFreezeAnimations = renderQuality !== "high";
      const liveAnimatedDecorations: CachedVisibleDecoration[] = [];
      if (!shouldFreezeAnimations) {
        liveAnimatedDecorations.push(...animatedDecorations);
      } else {
        for (const entry of animatedDecorations) {
          if (
            NON_THROTTLED_ANIMATED_DECORATION_TYPES.has(
              entry.decoration.type
            )
          ) {
            liveAnimatedDecorations.push(entry);
          } else {
            staticDecorations.push(entry);
          }
        }
      }

      staticDecorations.sort((a, b) => a.isoY - b.isoY);

      let staticDecorationCanvas: HTMLCanvasElement | null = null;
      if (typeof document !== "undefined") {
        const layerCanvas = document.createElement("canvas");
        layerCanvas.width = canvas.width;
        layerCanvas.height = canvas.height;
        const layerCtx = layerCanvas.getContext("2d");
        if (layerCtx) {
          layerCtx.setTransform(1, 0, 0, 1, 0, 0);
          layerCtx.scale(dpr, dpr);
          for (const entry of staticDecorations) {
            const dec = entry.decoration;
            layerCtx.save();
            renderDecorationItem({
              ctx: layerCtx,
              screenPos: entry.screenPos,
              scale: cameraZoom * dec.scale,
              type: dec.type,
              rotation: dec.rotation,
              variant: dec.variant,
              decorTime: 0,
              decorX: dec.x,
              decorY: dec.y,
              selectedMap,
              mapTheme,
              skipShadow: getDecorationVolumeSpec(dec.type, dec.heightTag)
                .backgroundShadowOnly,
            });
            layerCtx.restore();
          }
          staticDecorationCanvas = layerCanvas;
        }
      }

      drawBackgroundDecorations(backgroundDecorations);
      if (staticDecorationCanvas) {
        ctx.drawImage(staticDecorationCanvas, 0, 0, width, height);
      } else {
        liveAnimatedDecorations.push(...staticDecorations);
      }

      cachedStaticDecorationLayerRef.current = {
        key: decorationLayerKey,
        canvas: staticDecorationCanvas,
        backgroundDecorations,
        animatedDecorations: liveAnimatedDecorations,
        depthSensitiveDecorations,
      };
      animatedVisibleDecorations = liveAnimatedDecorations;
      depthSensitiveVisibleDecorations = depthSensitiveDecorations;
    }

    for (const entry of animatedVisibleDecorations) {
      renderables.push({
        type: "decoration",
        data: {
          ...entry.decoration,
          decorTime,
          selectedMap,
          screenPos: entry.screenPos,
        },
        isoY: entry.isoY,
      });
    }
    for (const entry of depthSensitiveVisibleDecorations) {
      renderables.push({
        type: "decoration",
        data: {
          ...entry.decoration,
          decorTime,
          selectedMap,
          screenPos: entry.screenPos,
        },
        isoY: entry.isoY,
      });
    }
    towers.forEach((tower) => {
      const worldPos = gridToWorld(tower.pos);
      renderables.push({
        type: "tower",
        data: tower,
        isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
      });
    });
    towers.forEach((tower) => {
      if (tower.type === "station" && tower.spawnRange) {
        const worldPos = gridToWorld(tower.pos);
        const isHovered = hoveredTower === tower.id;
        renderables.push({
          type: "station-range",
          data: { ...tower, isHovered },
          isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR - 1000,
        });
      }
    });
    // Show range for selected tower
    if (selectedTower) {
      const tower = towers.find((t) => t.id === selectedTower);
      if (tower && TOWER_DATA[tower.type].range > 0) {
        const worldPos = gridToWorld(tower.pos);
        renderables.push({
          type: "tower-range",
          data: tower,
          isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR - 999,
        });
      }
    }
    // Show range for hovered tower (if different from selected)
    if (hoveredTower && hoveredTower !== selectedTower) {
      const tower = towers.find((t) => t.id === hoveredTower);
      if (tower && TOWER_DATA[tower.type].range > 0) {
        const worldPos = gridToWorld(tower.pos);
        renderables.push({
          type: "tower-range",
          data: { ...tower, isHovered: true },
          isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR - 998,
        });
      }
    }
    enemies.forEach((enemy) => {
      const worldPos = getEnemyWorldPos(enemy);
      if (
        worldPos.x < minVisibleWorldX - enemyCullMargin ||
        worldPos.x > maxVisibleWorldX + enemyCullMargin ||
        worldPos.y < minVisibleWorldY - enemyCullMargin ||
        worldPos.y > maxVisibleWorldY + enemyCullMargin
      ) {
        return;
      }
      // Add small offset based on enemy id hash to prevent z-fighting/flickering
      // when enemies are at the same position
      let stableOffset = enemySortOffsetCacheRef.current.get(enemy.id);
      if (stableOffset === undefined) {
        let idHash = 0;
        for (let i = 0; i < enemy.id.length; i++) {
          idHash += enemy.id.charCodeAt(i);
        }
        stableOffset = (idHash % 1000) * 0.0001; // Tiny offset for stable sort
        if (enemySortOffsetCacheRef.current.size > 4000) {
          enemySortOffsetCacheRef.current.clear();
        }
        enemySortOffsetCacheRef.current.set(enemy.id, stableOffset);
      }
      renderables.push({
        type: "enemy",
        data: enemy,
        isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR + stableOffset,
      });
    });
    if (hero && !hero.dead) {
      renderables.push({
        type: "hero",
        data: hero,
        isoY: (hero.pos.x + hero.pos.y) * ISO_Y_FACTOR,
      });
    }
    // Only render living troops (dead ones handled separately for ghost effect)
    troops.forEach((troop) => {
      renderables.push({
        type: "troop",
        data: troop,
        isoY: (troop.pos.x + troop.pos.y) * ISO_Y_FACTOR,
      });
    });
    projectiles.forEach((proj) => {
      const x = proj.from.x + (proj.to.x - proj.from.x) * proj.progress;
      const y = proj.from.y + (proj.to.y - proj.from.y) * proj.progress;
      if (
        x < minVisibleWorldX - projectileCullMargin ||
        x > maxVisibleWorldX + projectileCullMargin ||
        y < minVisibleWorldY - projectileCullMargin ||
        y > maxVisibleWorldY + projectileCullMargin
      ) {
        return;
      }
      renderables.push({
        type: "projectile",
        data: proj,
        isoY: (x + y) * ISO_Y_FACTOR,
      });
    });
    mergedEffects.forEach((eff) => {
      // Ground, sky, and death effects are rendered in dedicated passes, skip them here
      if (groundEffectTypes.has(eff.type) || skyEffectTypes.has(eff.type) || eff.type === deathEffectType) return;
      const fromX = eff.pos.x;
      const fromY = eff.pos.y;
      const toX = eff.targetPos?.x ?? fromX;
      const toY = eff.targetPos?.y ?? fromY;
      const segMinX = Math.min(fromX, toX);
      const segMaxX = Math.max(fromX, toX);
      const segMinY = Math.min(fromY, toY);
      const segMaxY = Math.max(fromY, toY);
      if (
        segMaxX < minVisibleWorldX - effectCullMargin ||
        segMinX > maxVisibleWorldX + effectCullMargin ||
        segMaxY < minVisibleWorldY - effectCullMargin ||
        segMinY > maxVisibleWorldY + effectCullMargin
      ) {
        return;
      }
      renderables.push({
        type: "effect",
        data: eff,
        isoY: (eff.pos.x + eff.pos.y) * ISO_Y_FACTOR,
      });
    });
    // Read active particles from pool (ref-based, no React state)
    const activeParticles = getActiveParticles();
    particlesRef.current = activeParticles;
    for (let i = 0; i < activeParticles.length; i++) {
      const p = activeParticles[i];
      renderables.push({
        type: "particle",
        data: p,
        isoY: (p.pos.x + p.pos.y) * ISO_Y_FACTOR,
      });
    }
    // Add special building to renderables for proper depth sorting
    const levelSpecialTowersForRenderable = getLevelSpecialTowers(selectedMap);
    levelSpecialTowersForRenderable.forEach((spec, index) => {
      const worldPos = gridToWorld(spec.pos);
      let boostedTowerCount = 0;
      if (spec.type === "beacon" || spec.type === "chrono_relay") {
        const boostRange = spec.type === "beacon" ? 250 : 220;
        boostedTowerCount = towers.filter((tower) => {
          if (tower.type === "club") return false;
          const towerWorldPos = gridToWorld(tower.pos);
          return distance(towerWorldPos, worldPos) < boostRange;
        }).length;
      } else if (spec.type === "sunforge_orrery") {
        const heatRange = 260;
        boostedTowerCount = enemies.filter((enemy) => {
          if (enemy.dead || enemy.hp <= 0) return false;
          return distance(getEnemyWorldPos(enemy), worldPos) < heatRange;
        }).length;
      }

      let chargeProgress = 0;
      if (spec.type === "sentinel_nexus") {
        const key = getSpecialTowerKey(spec);
        const lastStrike = lastSentinelStrikeRef.current.get(key) ?? 0;
        const strikeInterval = 10000;
        chargeProgress = lastStrike === 0 ? 1 : Math.min(1, (Date.now() - lastStrike) / strikeInterval);
      } else if (spec.type === "sunforge_orrery") {
        const key = getSpecialTowerKey(spec);
        const lastBarrage = lastSunforgeBarrageRef.current.get(key) ?? 0;
        const barrageInterval = 9000;
        chargeProgress = lastBarrage === 0 ? 1 : Math.min(1, (Date.now() - lastBarrage) / barrageInterval);
      }

      renderables.push({
        type: "special-building",
        data: { ...spec, boostedTowerCount, chargeProgress, __towerIndex: index },
        isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
      });
    });
    if (draggingTower) {
      const gridPos = screenToGrid(
        draggingTower.pos,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
      const worldPos = gridToWorld(gridPos);
      renderables.push({
        type: "tower-preview",
        data: draggingTower,
        isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
      });
    }
    // Tower repositioning preview - show tower being moved at new position
    if (repositioningTower && repositionPreviewPos) {
      const tower = towers.find((t) => t.id === repositioningTower);
      if (tower) {
        const gridPos = screenToGrid(
          repositionPreviewPos,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const worldPos = gridToWorld(gridPos);
        // Check if position is valid (for visual feedback)
        const otherTowers = towers.filter((t) => t.id !== repositioningTower);
        const isValid = isValidBuildPosition(
          gridPos,
          selectedMap,
          otherTowers,
          GRID_WIDTH,
          GRID_HEIGHT,
          TOWER_PLACEMENT_BUFFER,
          blockedPositions,
          tower.type
        );
        renderables.push({
          type: "tower-preview",
          data: {
            type: tower.type,
            pos: repositionPreviewPos,
            isRepositioning: true,
            isValid,
            level: tower.level,
            upgrade: tower.upgrade,
          },
          isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
        });
      }
    }
    renderables.sort((a, b) => a.isoY - b.isoY);

    // =========================================================================
    // SPECIAL BUILDING RANGE RINGS (On Hover)
    // =========================================================================
    if (hoveredSpecialTower) {
      const time = nowSeconds;
      const spec = hoveredSpecialTower;
      const sPos = toScreen(gridToWorld(spec.pos));
      const range =
        spec.type === "beacon"
          ? 150
          : spec.type === "shrine"
            ? 200
            : spec.type === "chrono_relay"
              ? 220
              : spec.type === "sentinel_nexus"
                ? 140
                : spec.type === "sunforge_orrery"
                  ? 260
                  : 0;
      const ringStroke =
        spec.type === "beacon"
          ? "rgba(0, 229, 255, 0.5)"
          : spec.type === "shrine"
            ? "rgba(118, 255, 3, 0.5)"
            : spec.type === "chrono_relay"
              ? "rgba(129, 140, 248, 0.55)"
              : spec.type === "sentinel_nexus"
                ? "rgba(251, 113, 133, 0.62)"
                : "rgba(251, 146, 60, 0.65)";
      const ringFill =
        spec.type === "beacon"
          ? "rgba(0, 229, 255, 0.05)"
          : spec.type === "shrine"
            ? "rgba(118, 255, 3, 0.05)"
            : spec.type === "chrono_relay"
              ? "rgba(129, 140, 248, 0.06)"
              : spec.type === "sentinel_nexus"
                ? "rgba(251, 113, 133, 0.09)"
                : "rgba(251, 146, 60, 0.1)";

      if (range > 0) {
        ctx.save();
        ctx.translate(sPos.x, sPos.y);
        ctx.scale(1, ISO_Y_RATIO);

        if (spec.type === "sunforge_orrery") {
          const outerR = range * cameraZoom;
          const midR = outerR * 0.84;
          const innerR = outerR * 0.64;

          ctx.rotate(time * 0.36);
          ctx.strokeStyle = "rgba(251, 146, 60, 0.72)";
          ctx.lineWidth = 3.2;
          ctx.setLineDash([12 * cameraZoom, 9 * cameraZoom]);
          ctx.beginPath();
          ctx.arc(0, 0, outerR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.rotate(-time * 0.58);
          ctx.strokeStyle = "rgba(255, 216, 170, 0.56)";
          ctx.lineWidth = 2;
          ctx.setLineDash([8 * cameraZoom, 6 * cameraZoom]);
          ctx.beginPath();
          ctx.arc(0, 0, midR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.strokeStyle = "rgba(255, 237, 213, 0.42)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(0, 0, innerR, 0, Math.PI * 2);
          ctx.stroke();

          const markerCount = 12;
          for (let i = 0; i < markerCount; i++) {
            const a = (i / markerCount) * Math.PI * 2 + time * 0.35;
            const iX = Math.cos(a) * (midR + outerR) * 0.5;
            const iY = Math.sin(a) * (midR + outerR) * 0.5;
            const oX = Math.cos(a) * (outerR - 4 * cameraZoom);
            const oY = Math.sin(a) * (outerR - 4 * cameraZoom);
            ctx.strokeStyle = `rgba(255, 228, 188, ${0.38 + Math.sin(time * 2 + i) * 0.12})`;
            ctx.lineWidth = (i % 3 === 0 ? 2.1 : 1.2) * cameraZoom;
            ctx.beginPath();
            ctx.moveTo(iX, iY);
            ctx.lineTo(oX, oY);
            ctx.stroke();
          }

          ctx.fillStyle = "rgba(251, 146, 60, 0.08)";
          ctx.beginPath();
          ctx.arc(0, 0, outerR, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Animated spinning ring
          ctx.rotate(time * 0.5);
          ctx.strokeStyle = ringStroke;
          ctx.lineWidth = 3;
          ctx.setLineDash([10 * cameraZoom, 10 * cameraZoom]);
          ctx.beginPath();
          ctx.arc(0, 0, range * cameraZoom, 0, Math.PI * 2);
          ctx.stroke();

          // Inner soft fill
          ctx.fillStyle = ringFill;
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Sentinel nexus targeting overlays (persistent lock lines + strike zone marker).
    const sentinelStrikeRadiusWorld = 140;
    levelSpecialTowersForRenderable.forEach((spec) => {
      if (spec.type !== "sentinel_nexus") return;
      const key = getSpecialTowerKey(spec);
      const targetPos = sentinelTargets[key];
      if (!targetPos) return;
      const sourceScreenPos = toScreen(gridToWorld(spec.pos));
      const targetScreenPos = toScreen(targetPos);
      const isActiveTargeting = activeSentinelTargetKey === key;
      const pulse = 0.5 + Math.sin(nowSeconds * 6 + spec.pos.x * 0.2) * 0.5;

      ctx.save();
      ctx.strokeStyle = isActiveTargeting
        ? `rgba(254, 205, 211, ${0.72 + pulse * 0.2})`
        : `rgba(251, 113, 133, ${0.42 + pulse * 0.18})`;
      ctx.lineWidth = (isActiveTargeting ? 3.2 : 2.1) * cameraZoom;
      ctx.setLineDash([
        (8 + (isActiveTargeting ? 2 : 0)) * cameraZoom,
        6 * cameraZoom,
      ]);
      ctx.beginPath();
      ctx.moveTo(sourceScreenPos.x, sourceScreenPos.y - 30 * cameraZoom);
      ctx.lineTo(targetScreenPos.x, targetScreenPos.y);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(targetScreenPos.x, targetScreenPos.y);
      ctx.scale(1, ISO_Y_RATIO);
      const markerRadius = sentinelStrikeRadiusWorld * cameraZoom;
      const markerAlpha = isActiveTargeting ? 0.24 + pulse * 0.15 : 0.14 + pulse * 0.1;
      ctx.fillStyle = `rgba(190, 24, 93, ${markerAlpha})`;
      ctx.strokeStyle = isActiveTargeting
        ? `rgba(255, 228, 230, ${0.84 + pulse * 0.12})`
        : `rgba(251, 113, 133, ${0.62 + pulse * 0.1})`;
      ctx.lineWidth = (isActiveTargeting ? 3 : 2) * cameraZoom;
      ctx.setLineDash([10 * cameraZoom, 8 * cameraZoom]);
      ctx.beginPath();
      ctx.arc(0, 0, markerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(255, 237, 213, ${0.85 + pulse * 0.1})`;
      ctx.lineWidth = 1.8 * cameraZoom;
      ctx.beginPath();
      ctx.arc(0, 0, markerRadius * 0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // ========== RENDER TROOP/HERO MOVEMENT INDICATORS (UNDER ENTITIES) ==========
    // Draw movement range circle when a troop is selected (renders UNDER towers/decorations)
    if (selectedUnitMoveInfo && !selectedUnitMoveInfo.canMoveAnywhere) {
      renderTroopMoveRange(
        ctx,
        {
          anchorPos: selectedUnitMoveInfo.anchorPos,
          moveRadius: selectedUnitMoveInfo.moveRadius,
          ownerType: selectedUnitMoveInfo.ownerType,
          isSelected: true,
        },
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
    }

    // Draw path target indicator when hovering with a selected unit (renders UNDER towers/decorations)
    const selectedTroopForIndicator = troops.find((t) => t.selected);
    const heroIsSelectedForIndicator = hero && !hero.dead && hero.selected;
    const isUnitDraggingForIndicator = !!draggingUnit;

    if (
      moveTargetPos &&
      (selectedTroopForIndicator || heroIsSelectedForIndicator || isUnitDraggingForIndicator)
    ) {
      const draggedTroopForIndicator =
        draggingUnit?.kind === "troop"
          ? troops.find((t) => t.id === draggingUnit.troopId)
          : null;
      const unitPos = selectedTroopForIndicator
        ? selectedTroopForIndicator.pos
        : heroIsSelectedForIndicator && hero
          ? hero.pos
          : draggingUnit?.kind === "hero" && hero
            ? hero.pos
            : draggedTroopForIndicator
              ? draggedTroopForIndicator.pos
              : moveTargetPos;
      // Get theme color - hero's color if hero selected, otherwise use troop default
      const themeColor =
        (heroIsSelectedForIndicator || draggingUnit?.kind === "hero") && hero
          ? HERO_DATA[hero.type].color
          : undefined;
      renderPathTargetIndicator(
        ctx,
        {
          targetPos: moveTargetPos,
          isValid: moveTargetValid,
          isHero:
            !!heroIsSelectedForIndicator ||
            draggingUnit?.kind === "hero",
          unitPos: unitPos,
          themeColor: themeColor,
        },
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
    }

    // Pre-pass: draw ALL tower ground transitions before any tower bodies
    for (const r of renderables) {
      if (r.type === "tower") {
        renderTowerGroundTransition(
          ctx,
          r.data as Tower,
          canvas.width,
          canvas.height,
          dpr,
          selectedMap,
          cameraOffset,
          cameraZoom,
        );
      }
    }

    // =========================================================================
    // EPIC ISOMETRIC BUFF AURA (rendered above ground transitions, below towers)
    // =========================================================================
    towers.forEach((t) => {
      const hasDamageBuff = t.damageBoost && t.damageBoost > 1;
      const hasRangeBuff = t.rangeBoost && t.rangeBoost > 1;
      const hasAttackSpeedBuff =
        t.attackSpeedBoost && t.attackSpeedBoost > 1;

      if (!hasDamageBuff && !hasRangeBuff && !hasAttackSpeedBuff && !t.isBuffed)
        return;

      const activeBuffCount =
        Number(hasDamageBuff) + Number(hasRangeBuff) + Number(hasAttackSpeedBuff);
      const theme =
        activeBuffCount >= 2
          ? {
            base: "255, 220, 140",
            accent: "255, 200, 90",
            glow: "#ffe08c",
            fill: "rgba(255, 220, 140, 0.08)",
            icon: "✦",
          }
          : hasAttackSpeedBuff
            ? {
              base: "165, 180, 255",
              accent: "129, 140, 248",
              glow: "#a5b4fc",
              fill: "rgba(165, 180, 255, 0.08)",
              icon: "⌁",
            }
            : hasDamageBuff
              ? {
                base: "255, 100, 100",
                accent: "255, 150, 50",
                glow: "#ff6464",
                fill: "rgba(255, 100, 100, 0.06)",
                icon: "◆",
              }
              : {
                base: "100, 200, 255",
                accent: "50, 150, 255",
                glow: "#64c8ff",
                fill: "rgba(100, 200, 255, 0.06)",
                icon: "◎",
              };

      const time = nowSeconds;
      const sPos = toScreen(gridToWorld(t.pos));
      const s = cameraZoom;

      const fnd = getTowerFoundationSize(t);
      const auraR = Math.max(fnd.w, fnd.d) * 0.5 * s;
      const outerR = auraR * 1.15;
      const sealR = auraR * 0.7;
      const orbitR = auraR * 0.45;

      const pulse = Math.sin(time * 4) * 0.08;
      const opacity = 0.6 + Math.sin(time * 2) * 0.25;
      const buffPulse = 0.5 + Math.sin(time * 4) * 0.5;

      ctx.save();
      ctx.translate(sPos.x, sPos.y + 10 * s);

      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 25 * s * buffPulse;

      ctx.scale(1, ISO_Y_RATIO);

      // 1. Soft Core Glow
      const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR * 1.1);
      innerGlow.addColorStop(0, `rgba(${theme.base}, ${0.5 * opacity})`);
      innerGlow.addColorStop(0.5, `rgba(${theme.base}, ${0.25 * opacity})`);
      innerGlow.addColorStop(1, `rgba(${theme.base}, 0)`);
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, outerR * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Orbiting Ring
      ctx.save();
      ctx.rotate(-time * 0.6);
      ctx.strokeStyle = `rgba(${theme.base}, ${0.7 * opacity})`;
      ctx.lineWidth = 3 * s;
      ctx.setLineDash([12 * s, 6 * s]);
      ctx.beginPath();
      ctx.arc(0, 0, outerR * (1 + pulse), 0, Math.PI * 2);
      ctx.stroke();

      const dotCount = activeBuffCount >= 2 ? 6 : 4;
      for (let i = 0; i < dotCount; i++) {
        ctx.rotate((Math.PI * 2) / dotCount);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 5 + i) * 0.2})`;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 8 * s;
        ctx.beginPath();
        ctx.arc(outerR * (1 + pulse), 0, 3 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Runic Seal (Overlapping Triangles)
      ctx.save();
      ctx.rotate(time * 0.8);

      ctx.lineWidth = 2 * s;
      drawTriangle(ctx, sealR, `rgba(${theme.accent}, ${0.85 * opacity})`);
      ctx.rotate(Math.PI);
      drawTriangle(ctx, sealR, `rgba(${theme.accent}, ${0.85 * opacity})`);

      ctx.fillStyle = theme.fill;
      ctx.fill();
      ctx.restore();

      // 4. Inner Orbitals
      ctx.save();
      ctx.rotate(time * 1.5);
      const orbitalCount = activeBuffCount >= 2 ? 5 : 3;
      for (let i = 0; i < orbitalCount; i++) {
        ctx.rotate((Math.PI * 2) / orbitalCount);
        const orbitDist = orbitR + Math.sin(time * 3 + i) * 6 * s;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 12 * s;
        ctx.shadowColor = theme.glow;
        ctx.beginPath();
        ctx.arc(orbitDist, 0, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. Rising particles
      ctx.shadowBlur = 0;
      for (let i = 0; i < 4; i++) {
        const riseProgress = ((time * 0.8 + i * 0.25) % 1);
        const riseY = -riseProgress * outerR * 1.3;
        const riseAlpha = (1 - riseProgress) * 0.6 * buffPulse;
        const riseX = Math.sin(time * 3 + i * 2) * orbitR;

        ctx.fillStyle = `rgba(${theme.base}, ${riseAlpha})`;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.arc(riseX, riseY, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Buff Icon
      ctx.shadowBlur = 0;
      const iconY = outerR * 1.1;

      ctx.fillStyle = `rgba(0, 0, 0, 0.6)`;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 12 * s * buffPulse;
      ctx.beginPath();
      ctx.arc(0, iconY, 10 * s, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${theme.base}, ${0.8 + buffPulse * 0.2})`;
      ctx.lineWidth = 2 * s;
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 8 * s * buffPulse;
      ctx.fillStyle = `rgba(${theme.base}, 1)`;
      ctx.font = `bold ${11 * s}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(theme.icon, sPos.x, sPos.y + 10 * s + iconY * ISO_Y_RATIO);
      ctx.restore();
    });

    // Render all entities with camera offset and zoom (including special buildings)
    renderables.forEach((r) => {
      switch (r.type) {
        case "special-building": {
          const spec = r.data as { type: string; pos: Position; hp?: number; boostedTowerCount?: number; chargeProgress?: number };
          const sPos = toScreen(gridToWorld(spec.pos));
          const maxHp = spec.type === "vault"
            ? getLevelSpecialTowerHp(selectedMap) ?? spec.hp
            : spec.hp;
          renderSpecialBuilding(
            ctx,
            sPos.x,
            sPos.y,
            cameraZoom,
            spec.type,
            maxHp,
            specialTowerHp,
            vaultFlash,
            spec.boostedTowerCount || 0,
            spec.chargeProgress ?? 0
          );
          break;
        }


        case "station-range":
          renderStationRange(
            ctx,
            r.data as Tower & { isHovered?: boolean },
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          break;
        case "tower-range":
          renderTowerRange(
            ctx,
            r.data as Tower & { isHovered?: boolean },
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          break;
        case "decoration": {
          const decData = r.data as {
            type: DecorationType;
            x: number;
            y: number;
            scale: number;
            rotation: number;
            variant: number;
            decorTime: number;
            selectedMap: string;
            screenPos?: Position;
            heightTag?: DecorationHeightTag;
          };
          const decScreenPos = decData.screenPos ?? toScreen({ x: decData.x, y: decData.y });
          const decScale = cameraZoom * decData.scale;
          ctx.save();
          renderDecorationItem({
            ctx,
            screenPos: decScreenPos,
            scale: decScale,
            type: decData.type,
            rotation: decData.rotation,
            variant: decData.variant,
            decorTime: decData.decorTime,
            decorX: decData.x,
            decorY: decData.y,
            selectedMap: decData.selectedMap,
            mapTheme,
            skipShadow: getDecorationVolumeSpec(
              decData.type,
              decData.heightTag
            ).backgroundShadowOnly,
          });
          ctx.restore();
          break;
        }
        case "tower":
          renderTower(
            ctx,
            r.data as Tower,
            canvas.width,
            canvas.height,
            dpr,
            hoveredTower,
            selectedTower,
            enemies,
            selectedMap,
            cameraOffset,
            cameraZoom
          );
          // Render tower debuff effects if tower has active debuffs
          {
            const tower = r.data as Tower;
            const activeDebuffs = tower.debuffs?.filter(d => d.until > frameNowMs);
            if (activeDebuffs && activeDebuffs.length > 0) {
              const towerPos = gridToWorld(tower.pos);
              const towerScreenPos = worldToScreen(
                towerPos,
                canvas.width,
                canvas.height,
                dpr,
                cameraOffset,
                cameraZoom
              );
              // Pass tower with only active debuffs for rendering
              renderTowerDebuffEffects(ctx, { ...tower, debuffs: activeDebuffs }, towerScreenPos, cameraZoom, pausedAtRef.current ?? undefined);
            }
            // Missile Battery target reticle
            if (tower.type === "mortar" && tower.level === 4 && tower.upgrade === "A" && tower.mortarTarget) {
              const targetScreenPos = worldToScreen(
                tower.mortarTarget,
                canvas.width,
                canvas.height,
                dpr,
                cameraOffset,
                cameraZoom
              );
              renderMissileTargetReticle(ctx, targetScreenPos, cameraZoom, nowSeconds);
            }
          }
          break;
        case "enemy":
          renderEnemy(
            ctx,
            r.data as Enemy,
            canvas.width,
            canvas.height,
            dpr,
            selectedMap,
            cameraOffset,
            cameraZoom,
            enemies.length
          );
          // Note: Inspector indicators are now rendered in a separate top-layer pass below
          break;
        case "hero":
          {
            const heroRenderable = r.data as Hero;
            let heroTargetPos: Position | undefined = undefined;
            if (heroRenderable.aggroTarget) {
              const aggroEnemy = enemyById.get(heroRenderable.aggroTarget);
              if (aggroEnemy) {
                heroTargetPos = getEnemyWorldPos(aggroEnemy);
              }
            }
            if (!heroTargetPos && heroRenderable.targetPos) {
              heroTargetPos = heroRenderable.targetPos;
            }
            renderHero(
              ctx,
              heroRenderable,
              canvas.width,
              canvas.height,
              dpr,
              cameraOffset,
              cameraZoom,
              heroTargetPos
            );
            // Render hero status effects (burning, slowed, poisoned, stunned)
            {
              const heroData = heroRenderable;
              if (heroData.burning || heroData.slowed || heroData.poisoned || heroData.stunned) {
                const heroScreenPos = worldToScreen(
                  heroData.pos,
                  canvas.width,
                  canvas.height,
                  dpr,
                  cameraOffset,
                  cameraZoom
                );
                renderUnitStatusEffects(ctx, heroData, heroScreenPos, cameraZoom, pausedAtRef.current ?? undefined);
              }
            }
            break;
          }
        case "troop":
          const troopRenderable = r.data as Troop;
          let targetPos: Position | undefined = undefined;
          if (troopRenderable.targetEnemy) {
            const targetEnemy = enemyById.get(troopRenderable.targetEnemy);
            if (targetEnemy) {
              targetPos = getEnemyWorldPos(targetEnemy);
            }
          }
          renderTroop(
            ctx,
            troopRenderable,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom,
            targetPos
          );
          // Render troop status effects (burning, slowed, poisoned, stunned)
          {
            const troopData = troopRenderable;
            if (troopData.burning || troopData.slowed || troopData.poisoned || troopData.stunned) {
              const troopScreenPos = worldToScreen(
                troopData.pos,
                canvas.width,
                canvas.height,
                dpr,
                cameraOffset,
                cameraZoom
              );
              renderUnitStatusEffects(ctx, troopData, troopScreenPos, cameraZoom, pausedAtRef.current ?? undefined);
            }
          }
          break;
        case "projectile":
          renderProjectile(
            ctx,
            r.data as Projectile,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom,
            projectiles.length
          );
          break;
        case "effect":
          renderEffect(
            ctx,
            r.data as Effect,
            canvas.width,
            canvas.height,
            dpr,
            enemies,
            towers,
            selectedMap,
            cameraOffset,
            cameraZoom,
            mergedEffects.length
          );
          break;
        case "particle":
          renderParticle(
            ctx,
            r.data as Particle,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom,
            particlesRef.current.length
          );
          break;
        case "tower-preview":
          // For repositioning, exclude the tower being moved from validation
          const previewData = r.data as DraggingTower & {
            isRepositioning?: boolean;
          };
          const previewTowers = previewData.isRepositioning
            ? towers.filter((t) => t.id !== repositioningTower)
            : towers;
          renderTowerPreview(
            ctx,
            previewData,
            canvas.width,
            canvas.height,
            dpr,
            previewTowers,
            selectedMap,
            GRID_WIDTH,
            GRID_HEIGHT,
            cameraOffset,
            cameraZoom,
            blockedPositions
          );
          break;
      }
    });

    // Sky-level spell effects (falling meteors, lightning bolts) render above all map objects.
    for (const eff of skyEffects) {
      renderEffect(
        ctx, eff, canvas.width, canvas.height, dpr,
        enemies, towers, selectedMap, cameraOffset, cameraZoom, mergedEffects.length
      );
    }

    // ========== INSPECTOR INDICATORS - TOP LAYER ==========
    // Render inspector indicators as a separate pass so they're always on top
    // and can be easily hovered/clicked
    if (inspectorActive) {
      enemies.forEach((enemy) => {
        renderEnemyInspectIndicator(
          ctx,
          enemy,
          canvas.width,
          canvas.height,
          dpr,
          selectedMap,
          selectedInspectEnemy?.id === enemy.id,
          hoveredInspectEnemy === enemy.id,
          cameraOffset,
          cameraZoom
        );
      });

      // Troop inspect indicators
      troops.forEach((troop) => {
        if (troop.dead) return;
        const troopScreen = worldToScreen(troop.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
        renderUnitInspectIndicator(
          ctx, troopScreen, cameraZoom ?? 1, 18,
          selectedInspectTroop?.id === troop.id,
          hoveredInspectTroop === troop.id,
          "rgba(59, 130, 246, 0.7)",
        );
      });

      // Hero inspect indicator
      if (hero && !hero.dead) {
        const heroScreen = worldToScreen(hero.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
        renderUnitInspectIndicator(
          ctx, heroScreen, cameraZoom ?? 1, 22,
          selectedInspectHero,
          hoveredInspectHero,
          "rgba(245, 158, 11, 0.9)",
        );
      }
    }

    // ========== SPELL / REINFORCEMENT TARGETING RETICLE ==========
    const rTargeting = targetingSpellRef.current;
    const rPlacing = placingTroopRef.current;
    const rMouse = mousePosRef.current;
    if ((rTargeting || rPlacing) && rMouse.x > 0 && rMouse.y > 0) {
      const reticleScreenX = rMouse.x;
      const reticleScreenY = rMouse.y;
      const z = cameraZoom ?? 1;
      const t = Date.now() * 0.003;
      const pulse = 0.7 + Math.sin(t * 3) * 0.3;

      let mainR: number, mainG: number, mainB: number;
      let glowR: number, glowG: number, glowB: number;
      let reticleRadius: number;

      if (rTargeting === "fireball") {
        mainR = 255; mainG = 120; mainB = 20;
        glowR = 255; glowG = 80; glowB = 0;
        reticleRadius = 50 * z;
      } else if (rTargeting === "lightning") {
        mainR = 120; mainG = 180; mainB = 255;
        glowR = 80; glowG = 140; glowB = 255;
        reticleRadius = 45 * z;
      } else {
        mainR = 100; mainG = 220; mainB = 140;
        glowR = 50; glowG = 200; glowB = 120;
        reticleRadius = 40 * z;
      }

      // Outer glow halo
      const haloR = reticleRadius * 1.5;
      const haloGrad = ctx.createRadialGradient(reticleScreenX, reticleScreenY, reticleRadius * 0.6, reticleScreenX, reticleScreenY, haloR);
      haloGrad.addColorStop(0, `rgba(${glowR}, ${glowG}, ${glowB}, ${0.08 * pulse})`);
      haloGrad.addColorStop(1, `rgba(${glowR}, ${glowG}, ${glowB}, 0)`);
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.ellipse(reticleScreenX, reticleScreenY, haloR, haloR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main reticle ellipse
      ctx.strokeStyle = `rgba(${mainR}, ${mainG}, ${mainB}, ${0.6 * pulse})`;
      ctx.lineWidth = 2 * z;
      ctx.setLineDash([8 * z, 5 * z]);
      ctx.beginPath();
      ctx.ellipse(reticleScreenX, reticleScreenY, reticleRadius, reticleRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner solid ring
      const innerR = reticleRadius * 0.6;
      ctx.strokeStyle = `rgba(${mainR}, ${mainG}, ${mainB}, ${0.45 * pulse})`;
      ctx.lineWidth = 1.5 * z;
      ctx.beginPath();
      ctx.ellipse(reticleScreenX, reticleScreenY, innerR, innerR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines
      const chLen = reticleRadius * 0.35;
      const chGap = reticleRadius * 0.15;
      ctx.strokeStyle = `rgba(${mainR}, ${mainG}, ${mainB}, ${0.7 * pulse})`;
      ctx.lineWidth = 1.5 * z;
      ctx.beginPath();
      ctx.moveTo(reticleScreenX - chLen - chGap, reticleScreenY);
      ctx.lineTo(reticleScreenX - chGap, reticleScreenY);
      ctx.moveTo(reticleScreenX + chGap, reticleScreenY);
      ctx.lineTo(reticleScreenX + chLen + chGap, reticleScreenY);
      ctx.moveTo(reticleScreenX, reticleScreenY - (chLen + chGap) * 0.5);
      ctx.lineTo(reticleScreenX, reticleScreenY - chGap * 0.5);
      ctx.moveTo(reticleScreenX, reticleScreenY + chGap * 0.5);
      ctx.lineTo(reticleScreenX, reticleScreenY + (chLen + chGap) * 0.5);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse})`;
      ctx.beginPath();
      ctx.arc(reticleScreenX, reticleScreenY, 2 * z, 0, Math.PI * 2);
      ctx.fill();

      // Rotating tick marks
      const tickCount = 4;
      const tickDist = reticleRadius * 0.85;
      const rotation = t * 0.8;
      ctx.strokeStyle = `rgba(${mainR}, ${mainG}, ${mainB}, ${0.5 * pulse})`;
      ctx.lineWidth = 2 * z;
      for (let i = 0; i < tickCount; i++) {
        const angle = rotation + (i / tickCount) * Math.PI * 2;
        const tx = reticleScreenX + Math.cos(angle) * tickDist;
        const ty = reticleScreenY + Math.sin(angle) * tickDist * 0.5;
        const tx2 = reticleScreenX + Math.cos(angle) * (tickDist + 6 * z);
        const ty2 = reticleScreenY + Math.sin(angle) * (tickDist + 6 * z) * 0.5;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
      }
    }

    // Restore state
    ctx.restore();

    const waveStartBubbles = getWaveStartBubblesScreenData(
      canvas.width,
      canvas.height,
      dpr
    );
    const primedWaveBubble = waveStartConfirm
      ? waveStartBubbles.find(
        (bubble) =>
          bubble.pathKey === waveStartConfirm.pathKey &&
          waveStartConfirm.mapId === selectedMap &&
          waveStartConfirm.waveIndex === currentWave
      )
      : null;

    const primedPathKey = primedWaveBubble?.pathKey ?? null;

    const ambientPressure =
      entityCountsRef.current.enemies +
      entityCountsRef.current.projectiles * 0.8 +
      entityCountsRef.current.effects * 0.6;
    const ambientIntervalMs =
      ambientPressure > 240
        ? renderQuality === "high"
          ? 64
          : 88
        : renderQuality === "low"
          ? 52
          : 40;
    const ambientLayerKey = [
      selectedMap,
      canvas.width,
      canvas.height,
      dpr,
      renderQuality,
    ].join("|");
    const cachedAmbientLayer = cachedAmbientLayerRef.current;
    const canReuseAmbientLayer =
      cachedAmbientLayer &&
      cachedAmbientLayer.key === ambientLayerKey &&
      cachedAmbientLayer.canvas &&
      frameNowMs - cachedAmbientLayer.renderedAtMs < ambientIntervalMs;
    const renderAmbientOverlay = (targetCtx: CanvasRenderingContext2D) => {
      renderEnvironment(targetCtx, mapTheme, width, height, nowSeconds);
      renderAmbientVisuals(targetCtx, mapTheme, width, height, nowSeconds);
    };

    if (canReuseAmbientLayer && cachedAmbientLayer?.canvas) {
      ctx.drawImage(cachedAmbientLayer.canvas, 0, 0, width, height);
    } else {
      let ambientCanvas: HTMLCanvasElement | null = null;
      if (typeof document !== "undefined") {
        let layerCanvas = cachedAmbientLayer?.canvas ?? null;
        if (
          !layerCanvas ||
          layerCanvas.width !== canvas.width ||
          layerCanvas.height !== canvas.height
        ) {
          layerCanvas = document.createElement("canvas");
          layerCanvas.width = canvas.width;
          layerCanvas.height = canvas.height;
        }
        const layerCtx = layerCanvas.getContext("2d");
        if (layerCtx) {
          layerCtx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
          layerCtx.setTransform(1, 0, 0, 1, 0, 0);
          layerCtx.scale(dpr, dpr);
          renderAmbientOverlay(layerCtx);
          ambientCanvas = layerCanvas;
        }
      }

      cachedAmbientLayerRef.current = {
        key: ambientLayerKey,
        canvas: ambientCanvas,
        renderedAtMs: frameNowMs,
      };

      if (ambientCanvas) {
        ctx.drawImage(ambientCanvas, 0, 0, width, height);
      } else {
        renderAmbientOverlay(ctx);
      }
    }

    // Draw wave start bubbles after ambient/vignette pass so they're readable over fog.
    for (const bubble of waveStartBubbles) {
      drawWaveStartBubble({
        ctx,
        bubble,
        primedPathKey,
        hoveredPathKey: hoveredWaveBubblePathKey,
        frameNowMs,
      });
    }

    if (primedWaveBubble) {
      const { screenPos, radius, pathKey, pathLabel } = primedWaveBubble;
      const pathEntries = incomingWavePreviewByPath.get(pathKey) ?? [];
      const listRows = pathEntries.slice(0, 4);
      const hiddenRows = Math.max(0, pathEntries.length - listRows.length);
      const hasNoPathEnemies = pathEntries.length === 0;
      const panelWidth = 230;
      const panelHeight =
        68 +
        (hasNoPathEnemies ? 20 : listRows.length * 22) +
        (hiddenRows > 0 ? 16 : 0);
      const panelMargin = 12;
      const preferredX = screenPos.x + radius * 2.2;
      const fallbackX = screenPos.x - panelWidth - radius * 2.2;
      const maxX = width - panelWidth - panelMargin;
      const minX = panelMargin;
      let panelX = preferredX > maxX ? fallbackX : preferredX;
      panelX = Math.max(minX, Math.min(maxX, panelX));
      const maxY = height - panelHeight - panelMargin;
      const panelY = Math.max(
        panelMargin,
        Math.min(maxY, screenPos.y - radius * 2.25)
      );

      const panelPulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(frameNowMs * 0.008));
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 16;
      drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 12);
      const panelGradient = ctx.createLinearGradient(
        panelX,
        panelY,
        panelX,
        panelY + panelHeight
      );
      panelGradient.addColorStop(0, "rgba(36, 18, 18, 0.95)");
      panelGradient.addColorStop(1, "rgba(14, 10, 12, 0.95)");
      ctx.fillStyle = panelGradient;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = `rgba(255, 106, 84, ${(0.45 + panelPulse * 0.3).toFixed(3)})`;
      ctx.lineWidth = 1.6;
      drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 12);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 224, 198, 0.96)";
      ctx.font = '700 12px "bc-novatica-cyr", "inter", sans-serif';
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${pathLabel} - Wave ${currentWave + 1}`, panelX + 12, panelY + 16);

      ctx.fillStyle = "rgba(255, 170, 150, 0.92)";
      ctx.font = '600 10px "bc-novatica-cyr", "inter", sans-serif';
      ctx.fillText(
        "Click same bubble again to launch",
        panelX + 12,
        panelY + 34
      );

      let rowY = panelY + 54;
      if (hasNoPathEnemies) {
        ctx.fillStyle = "rgba(225, 175, 160, 0.85)";
        ctx.font = '600 11px "bc-novatica-cyr", "inter", sans-serif';
        ctx.fillText("No enemies this lane this wave", panelX + 12, rowY);
        rowY += 20;
      } else {
        for (const row of listRows) {
          ctx.fillStyle = row.color;
          ctx.beginPath();
          ctx.arc(panelX + 16, rowY, 4.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(248, 234, 220, 0.95)";
          ctx.font = '600 11px "bc-novatica-cyr", "inter", sans-serif';
          ctx.fillText(`${row.name} x${row.count}`, panelX + 27, rowY);
          rowY += 22;
        }
      }

      if (hiddenRows > 0) {
        ctx.fillStyle = "rgba(225, 175, 160, 0.82)";
        ctx.font = '500 10px "bc-novatica-cyr", "inter", sans-serif';
        ctx.fillText(`+${hiddenRows} more enemy types`, panelX + 12, rowY + 2);
      }
      ctx.restore();
    }

  }, [
    getRenderDpr,
    cameraOffset,
    cameraZoom,
    selectedMap,
    towers,
    enemies,
    hero,
    troops,
    projectiles,
    effects,
    draggingTower,
    hoveredTower,
    selectedTower,
    moveTargetPos,
    moveTargetValid,
    selectedUnitMoveInfo,
    draggingUnit,
    hoveredSpecialTower,
    sentinelTargets,
    activeSentinelTargetKey,
    specialTowerHp,
    vaultFlash,
    repositioningTower,
    repositionPreviewPos,
    blockedPositions,
    inspectorActive,
    selectedInspectEnemy,
    hoveredInspectEnemy,
    getWaveStartBubblesScreenData,
    hoveredWaveBubblePathKey,
    waveStartConfirm,
    incomingWavePreviewByPath,
    currentWave,
    activeWaveSpawnPaths,
    getSpecialTowerKey,
  ]);

  // PERFORMANCE FIX: Keep refs updated with latest callbacks
  // This allows the game loop to always use the latest version without restarting
  updateGameRef.current = updateGame;
  renderRef.current = render;
  targetingSpellRef.current = targetingSpell;
  placingTroopRef.current = placingTroop;
  mousePosRef.current = mousePos;
  flushParticleQueueRef.current = flushQueuedParticles;

  // Game loop - uses refs to avoid restarting when state changes
  // This prevents freezes when selecting troops/heroes or toggling inspector
  useEffect(() => {
    if (gameState !== "playing" || battleOutcome) return;
    const gameLoop = (timestamp: number) => {
      // Calculate delta time, but cap it to prevent issues when tab is inactive
      // When user leaves tab and returns, deltaTime could be huge (seconds/minutes)
      // which breaks game logic. Cap at 100ms (10 FPS equivalent) to stay stable.
      const rawDelta = lastTimeRef.current
        ? timestamp - lastTimeRef.current
        : 0;
      const cappedDelta = Math.min(rawDelta, 100); // Max 100ms per frame
      const sampleMs = Math.max(8, cappedDelta || 16.7);
      rollingFrameMsRef.current = rollingFrameMsRef.current * 0.92 + sampleMs * 0.08;

      if (timestamp - qualityLastChangedAtRef.current > QUALITY_TRANSITION_COOLDOWN_MS) {
        const avgFrameMs = rollingFrameMsRef.current;
        const currentQuality = renderQualityRef.current;
        let nextQuality = currentQuality;

        if (currentQuality === "high") {
          if (avgFrameMs > 18) nextQuality = "medium";
        } else if (currentQuality === "medium") {
          if (avgFrameMs > 23) nextQuality = "low";
          else if (avgFrameMs < 16.2) nextQuality = "high";
        } else if (avgFrameMs < 20) {
          nextQuality = "medium";
        }

        if (nextQuality !== currentQuality) {
          renderQualityRef.current = nextQuality;
          qualityLastChangedAtRef.current = timestamp;
          const nextDprCap = QUALITY_DPR_CAP[nextQuality];
          setRenderDprCap((prev) =>
            Math.abs(prev - nextDprCap) > 0.001 ? nextDprCap : prev
          );
          setPerformanceSettings({
            shadowQualityMultiplier: QUALITY_SHADOW_MULTIPLIER[nextQuality],
          });
        }
      }

      // Use gameSpeedRef instead of gameSpeed to avoid loop restart when pausing/unpausing
      const deltaTime = cappedDelta * gameSpeedRef.current;
      lastTimeRef.current = timestamp;
      const shouldSampleDevPerf =
        DEV_CONFIG_MENU_ENABLED && devPerfEnabledRef.current;
      if (shouldSampleDevPerf) {
        const updateStart = performance.now();
        updateGameRef.current(deltaTime);
        const updateMs = performance.now() - updateStart;
        flushParticleQueueRef.current();

        const renderStart = performance.now();
        renderRef.current();
        const renderMs = performance.now() - renderStart;

        devPerfUpdateMsRef.current =
          devPerfUpdateMsRef.current * 0.9 + updateMs * 0.1;
        devPerfRenderMsRef.current =
          devPerfRenderMsRef.current * 0.9 + renderMs * 0.1;

        if (timestamp - devPerfLastPublishedAtRef.current >= 250) {
          devPerfLastPublishedAtRef.current = timestamp;
          const counts = entityCountsRef.current;
          const frameMs = rollingFrameMsRef.current;
          setDevPerfSnapshot({
            fps: Math.round(1000 / Math.max(1, frameMs)),
            frameMs: Number(frameMs.toFixed(1)),
            updateMs: Number(devPerfUpdateMsRef.current.toFixed(2)),
            renderMs: Number(devPerfRenderMsRef.current.toFixed(2)),
            quality: renderQualityRef.current,
            towers: counts.towers,
            enemies: counts.enemies,
            troops: counts.troops,
            projectiles: counts.projectiles,
            effects: counts.effects,
            particles: counts.particles,
          });
        }
      } else {
        // Use refs to call latest versions without restarting the loop
        updateGameRef.current(deltaTime);
        flushParticleQueueRef.current();
        renderRef.current();
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, battleOutcome]); // Stop loop while battle-end overlay is active

  const resolveHeroCommandTarget = useCallback(
    (clickWorldPos: Position): Position | null => {
      if (moveTargetPos && moveTargetValid) return moveTargetPos;
      const pathResult = findClosestPathPoint(clickWorldPos, selectedMap);
      if (pathResult && pathResult.distance < HERO_PATH_HITBOX_SIZE * 2.5) {
        return pathResult.point;
      }
      return null;
    },
    [moveTargetPos, moveTargetValid, selectedMap]
  );

  const resolveTroopCommandTarget = useCallback(
    (clickWorldPos: Position, moveInfo: TroopMoveInfo): Position | null => {
      if (moveTargetPos && moveTargetValid) return moveTargetPos;
      const pathResult = findClosestPathPointWithinRadius(
        clickWorldPos,
        moveInfo.anchorPos,
        moveInfo.moveRadius,
        selectedMap
      );
      if (!pathResult || !pathResult.isValid) return null;
      const pathPoint = findClosestPathPoint(clickWorldPos, selectedMap);
      const isNearPath = !!pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2.5;
      return isNearPath ? pathResult.point : null;
    },
    [moveTargetPos, moveTargetValid, selectedMap]
  );

  const issueHeroMoveCommand = useCallback(
    (heroId: string, targetPos: Position) => {
      setHero((prev) =>
        prev && prev.id === heroId
          ? {
            ...prev,
            moving: true,
            targetPos,
            selected: false,
            facingRight: getFacingRightFromDelta(
              targetPos.x - prev.pos.x,
              targetPos.y - prev.pos.y,
              prev.facingRight ?? true,
            ),
          }
          : prev
      );
      addParticles(targetPos, "glow", 5);
    },
    [addParticles]
  );

  const issueTroopFormationMoveCommand = useCallback(
    (ownerId: string, targetPos: Position) => {
      const station = towers.find((tower) => tower.id === ownerId && tower.type === "station");
      const isBarracksTroop = ownerId === "special_barracks";
      const isSpellTroop = ownerId.startsWith("spell");
      setTroops((prev) => {
        const formationTroops = prev.filter((troop) => troop.ownerId === ownerId);
        if (formationTroops.length === 0) {
          return prev.map((troop) => ({ ...troop, selected: false }));
        }

        const formationOffsets = getFormationOffsets(formationTroops.length);
        const troopIdToFormationIndex = new Map<string, number>();
        formationTroops.forEach((troop, idx) => {
          troopIdToFormationIndex.set(troop.id, idx);
        });

        return prev.map((troop) => {
          if (troop.ownerId !== ownerId) {
            return { ...troop, selected: false };
          }

          const formationIndex = troopIdToFormationIndex.get(troop.id) ?? 0;
          const offset = formationOffsets[formationIndex] || { x: 0, y: 0 };
          const newTarget = {
            x: targetPos.x + offset.x,
            y: targetPos.y + offset.y,
          };
          const shouldRelocateAnchor = !!station || isBarracksTroop || isSpellTroop;
          return {
            ...troop,
            moving: true,
            targetPos: newTarget,
            userTargetPos: newTarget,
            selected: false,
            spawnPoint: shouldRelocateAnchor ? newTarget : troop.spawnPoint,
            facingRight: getFacingRightFromDelta(
              newTarget.x - troop.pos.x,
              newTarget.y - troop.pos.y,
              troop.facingRight ?? true,
            ),
          };
        });
      });
      addParticles(targetPos, "light", 5);
    },
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

  // ========== POINTER DOWN HANDLER ==========
  // Handles starting canvas panning and tower repositioning
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const isTouch = e.pointerType === 'touch';

      // Track device type
      if (isTouch) {
        isTouchDeviceRef.current = true;
        lastTouchTimeRef.current = Date.now();
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const clickPos = { x, y };
      const { width, height, dpr } = getCanvasDimensions();

      // Start click-hold tower placement dragging on canvas.
      if (buildingTower || draggingTower) {
        if (gameSpeed === 0) {
          setDraggingTower(null);
          setBuildingTower(null);
          setIsBuildDragging(false);
          return;
        }
        const towerType = draggingTower?.type || buildingTower;
        if (towerType) {
          setIsBuildDragging(true);
          setDraggingTower({ type: towerType, pos: clickPos });
        }
        return;
      }

      // Don't start panning while a troop/spell placement is armed.
      if (placingTroop || targetingSpell) return;

      const waveStartBubbles = getWaveStartBubblesScreenData(width, height, dpr);
      const clickedWaveBubble = waveStartBubbles.find(
        (bubble) =>
          distance(clickPos, bubble.screenPos) <=
          bubble.radius * WAVE_START_BUBBLE_HIT_RADIUS
      );
      if (clickedWaveBubble) {
        return;
      }

      if (activeSentinelTargetKey) {
        return;
      }

      // In inspector mode, let handleCanvasClick handle everything
      if (inspectorActive && gameSpeed === 0) {
        return;
      }

      // Check if clicking on a tower to start repositioning
      if (selectedTower) {
        const tower = towers.find((t) => t.id === selectedTower);
        if (tower) {
          const worldPos = gridToWorld(tower.pos);
          const screenPos = worldToScreen(
            worldPos,
            width,
            height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          const hitboxRadius = getTowerHitboxRadius(tower, cameraZoom);

          // If clicking on the selected tower, start repositioning
          if (distance(clickPos, screenPos) < hitboxRadius) {
            setRepositioningTower(selectedTower);
            setRepositionPreviewPos(clickPos);
            return;
          }
        }
      }

      // Start canvas panning - check we're not clicking on interactive elements
      // First check if clicking on a tower
      const clickedTower = towers.find((t) => {
        const worldPos = gridToWorld(t.pos);
        const screenPos = worldToScreen(
          worldPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const hitboxRadius = getTowerHitboxRadius(t, cameraZoom);
        return distance(clickPos, screenPos) < hitboxRadius;
      });

      // Check if clicking on hero
      let clickedHero = false;
      if (hero && !hero.dead) {
        const heroScreen = worldToScreen(
          hero.pos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        clickedHero = distance(clickPos, heroScreen) < 28;
      }

      // Check if clicking on a troop
      const clickedTroop = troops.find((t) => {
        const troopScreen = worldToScreen(
          t.pos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        return distance(clickPos, troopScreen) < 22;
      });

      // Begin hero/troop drag intent.
      if (clickedHero && hero && !hero.dead) {
        setDraggingUnit({ kind: "hero", heroId: hero.id });
        setUnitDragStart(clickPos);
        setUnitDragMoved(false);
        return;
      }

      if (clickedTroop && !isTouch) {
        setDraggingUnit({
          kind: "troop",
          troopId: clickedTroop.id,
          ownerId: clickedTroop.ownerId,
        });
        setUnitDragStart(clickPos);
        setUnitDragMoved(false);
        return;
      }

      // If not clicking on any interactive element, start panning
      if (!clickedTower && !clickedHero && !clickedTroop) {
        setIsPanning(true);
        setPanStart(clickPos);
        setPanStartOffset({ ...cameraOffset });
      }
    },
    [
      buildingTower,
      draggingTower,
      placingTroop,
      targetingSpell,
      activeSentinelTargetKey,
      inspectorActive,
      selectedTower,
      towers,
      hero,
      troops,
      cameraOffset,
      cameraZoom,
      getCanvasDimensions,
      gameSpeed,
      getWaveStartBubblesScreenData,
    ]
  );

  // Event handlers
  const handleCanvasClick = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Use pointer type to determine if this is touch or mouse input
      // This is more reliable across browsers than checking for recent touch events
      const isTouch = e.pointerType === 'touch';

      // Track device type for UI decisions (hide tooltips on touch)
      if (isTouch) {
        isTouchDeviceRef.current = true;
        lastTouchTimeRef.current = Date.now();
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const clickPos = { x: clickX, y: clickY };
      const { width, height, dpr } = getCanvasDimensions();
      if (isBuildDragging) {
        setIsBuildDragging(false);
      }

      // ========== STOP PANNING ==========
      // If we were panning, stop and don't trigger click events
      if (isPanning) {
        const wasPanning = panStart && (
          Math.abs(clickX - panStart.x) > 5 ||
          Math.abs(clickY - panStart.y) > 5
        );
        setIsPanning(false);
        setPanStart(null);
        setPanStartOffset(null);
        // If we actually moved while panning, don't trigger any click logic
        if (wasPanning) {
          if (inspectorActive) {
            setSelectedInspectEnemy(null);
            setSelectedInspectTroop(null);
            setSelectedInspectHero(false);
          }
          return;
        }
      }

      // ========== HERO/TROOP DRAG RELOCATION ==========
      if (draggingUnit) {
        const movedEnough =
          unitDragMoved ||
          (!!unitDragStart &&
            (Math.abs(clickX - unitDragStart.x) > 4 ||
              Math.abs(clickY - unitDragStart.y) > 4));

        if (movedEnough) {
          const clickWorldPos = screenToWorld(
            clickPos,
            width,
            height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          const spec =
            getLevelSpecialTowers(selectedMap).find(
              (tower) => tower.type === "barracks"
            ) ?? undefined;

          if (
            draggingUnit.kind === "hero" &&
            hero &&
            !hero.dead &&
            hero.id === draggingUnit.heroId
          ) {
            const targetPos = resolveHeroCommandTarget(clickWorldPos);
            if (targetPos) {
              issueHeroMoveCommand(draggingUnit.heroId, targetPos);
            }
          } else if (draggingUnit.kind === "troop") {
            const draggedTroop = troops.find((t) => t.id === draggingUnit.troopId);
            if (draggedTroop) {
              const moveInfo = getTroopMoveInfo(draggedTroop, towers, spec);
              const targetPos = resolveTroopCommandTarget(clickWorldPos, moveInfo);
              if (targetPos) {
                issueTroopFormationMoveCommand(draggingUnit.ownerId, targetPos);
              }
            }
          }

          clearUnitMoveInteraction();
          return;
        }

        // Not enough movement to count as a drag; fall through to regular click behavior.
        setDraggingUnit(null);
        setUnitDragStart(null);
        setUnitDragMoved(false);
      }

      const waveStartBubbles = getWaveStartBubblesScreenData(width, height, dpr);
      let clickedWaveBubble: WaveStartBubbleScreenData | null = null;
      let bestBubbleDist = Number.POSITIVE_INFINITY;
      for (const bubble of waveStartBubbles) {
        const bubbleDist = distance(clickPos, bubble.screenPos);
        if (
          bubbleDist <= bubble.radius * WAVE_START_BUBBLE_HIT_RADIUS &&
          bubbleDist < bestBubbleDist
        ) {
          clickedWaveBubble = bubble;
          bestBubbleDist = bubbleDist;
        }
      }

      if (clickedWaveBubble) {
        const isSecondClickConfirm =
          waveStartConfirm?.mapId === selectedMap &&
          waveStartConfirm.waveIndex === currentWave &&
          waveStartConfirm.pathKey === clickedWaveBubble.pathKey;

        if (isSecondClickConfirm) {
          startWave();
          setNextWaveTimer(WAVE_TIMER_BASE);
          setWaveStartConfirm(null);
          addParticles(clickedWaveBubble.worldPos, "spark", 14);
          addParticles(clickedWaveBubble.worldPos, "glow", 8);
        } else {
          setWaveStartConfirm({
            mapId: selectedMap,
            waveIndex: currentWave,
            pathKey: clickedWaveBubble.pathKey,
            openedAt: Date.now(),
          });
          addParticles(clickedWaveBubble.worldPos, "glow", 7);
        }
        return;
      }
      if (waveStartConfirm) {
        setWaveStartConfirm(null);
      }

      // ========== TOWER REPOSITIONING - Drop tower at new position ==========
      if (repositioningTower && repositionPreviewPos) {
        const tower = towers.find((t) => t.id === repositioningTower);
        if (tower) {
          const newGridPos = screenToGrid(
            repositionPreviewPos,
            width,
            height,
            dpr,
            cameraOffset,
            cameraZoom
          );

          // Check if the new position is valid (not on path, not overlapping other towers, etc.)
          // Temporarily remove the tower being moved from the towers list for validation
          const otherTowers = towers.filter((t) => t.id !== repositioningTower);
          const isValid = isValidBuildPosition(
            newGridPos,
            selectedMap,
            otherTowers,
            GRID_WIDTH,
            GRID_HEIGHT,
            TOWER_PLACEMENT_BUFFER,
            blockedPositions,
            tower.type
          );

          if (isValid) {
            // Move the tower to the new position
            setTowers((prev) =>
              prev.map((t) => {
                if (t.id === repositioningTower) {
                  return { ...t, pos: newGridPos };
                }
                return t;
              })
            );
            addParticles(gridToWorld(newGridPos), "spark", 8);
          }
        }

        // Clear repositioning state
        setRepositioningTower(null);
        setRepositionPreviewPos(null);
        return;
      }

      // ========== INSPECTOR MODE - Handle unit selection ==========
      // Intercept clicks for enemy/troop/hero selection when inspector is active AND game is paused
      if (inspectorActive && gameSpeed === 0) {
        const worldPos = screenToWorld(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );

        let closestType: "enemy" | "troop" | "hero" | null = null;
        let closestDist = Infinity;
        let closestEnemy: Enemy | null = null;
        let closestTroop: Troop | null = null;
        const clickRadius = 40 / cameraZoom;

        // Check enemies
        for (const enemy of enemies) {
          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
          const eData = ENEMY_DATA[enemy.type];
          const flyingOffset = eData.flying ? 35 : 0;
          const adjustedEnemyPos = { x: enemyPos.x, y: enemyPos.y - flyingOffset };
          const dist = distance(worldPos, adjustedEnemyPos);
          const hitRadius = (eData?.size || 20) * 1.5;

          if (dist < hitRadius + clickRadius && dist < closestDist) {
            closestDist = dist;
            closestType = "enemy";
            closestEnemy = enemy;
            closestTroop = null;
          }
        }

        // Check hero
        if (hero && !hero.dead) {
          const dist = distance(worldPos, hero.pos);
          if (dist < 30 + clickRadius && dist < closestDist) {
            closestDist = dist;
            closestType = "hero";
            closestEnemy = null;
            closestTroop = null;
          }
        }

        // Check troops
        for (const troop of troops) {
          if (troop.dead) continue;
          const dist = distance(worldPos, troop.pos);
          if (dist < 22 + clickRadius && dist < closestDist) {
            closestDist = dist;
            closestType = "troop";
            closestEnemy = null;
            closestTroop = troop;
          }
        }

        // Clear all selections first
        setSelectedInspectEnemy(null);
        setSelectedInspectTroop(null);
        setSelectedInspectHero(false);

        if (closestType === "enemy" && closestEnemy) {
          setSelectedInspectEnemy(closestEnemy);
        } else if (closestType === "hero") {
          setSelectedInspectHero(true);
        } else if (closestType === "troop" && closestTroop) {
          setSelectedInspectTroop(closestTroop);
        }
        return;
      }

      // ========== PREVENT TOWER PLACEMENT WHEN PAUSED ==========
      if (gameSpeed === 0 && (draggingTower || buildingTower)) {
        // Game is paused - cancel tower placement
        setDraggingTower(null);
        setBuildingTower(null);
        setIsBuildDragging(false);
        return;
      }

      // ========== TOWER PLACEMENT ==========
      // Always allow click-release-click placement when a tower is selected.
      // draggingTower still powers live preview during drag interactions.
      const towerToPlace =
        draggingTower ||
        (buildingTower ? { type: buildingTower, pos: clickPos } : null);

      if (towerToPlace) {
        const allowedTowersForLevel = getLevelAllowedTowers(selectedMap);
        if (
          allowedTowersForLevel &&
          !allowedTowersForLevel.includes(towerToPlace.type)
        ) {
          setDraggingTower(null);
          setBuildingTower(null);
          setIsBuildDragging(false);
          return;
        }

        const gridPos = screenToGrid(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const towerCost = TOWER_DATA[towerToPlace.type].cost;
        if (
          canAffordPawPoints(towerCost) &&
          isValidBuildPosition(
            gridPos,
            selectedMap,
            towers,
            GRID_WIDTH,
            GRID_HEIGHT,
            TOWER_PLACEMENT_BUFFER,
            blockedPositions,
            towerToPlace.type
          )
        ) {
          const defaultRotation = towerToPlace.type === "cannon" ? Math.PI * 0.75 : towerToPlace.type === "mortar" ? -Math.PI / 2 : 0;
          const newTower: Tower = {
            id: generateId("tower"),
            type: towerToPlace.type,
            pos: gridPos,
            level: 1,
            lastAttack: 0,
            rotation: defaultRotation,
            spawnRange:
              towerToPlace.type === "station"
                ? TOWER_DATA.station.spawnRange
                : undefined,
            occupiedSpawnSlots:
              towerToPlace.type === "station"
                ? [false, false, false]
                : undefined,
            pendingRespawns: towerToPlace.type === "station" ? [] : undefined,
          };
          if (!spendPawPoints(towerCost)) {
            setDraggingTower(null);
            setBuildingTower(null);
            setIsBuildDragging(false);
            return;
          }
          addTowerEntity(newTower);
          addParticles(gridToWorld(gridPos), "spark", 12);
        }
        setDraggingTower(null);
        setBuildingTower(null);
        setIsBuildDragging(false);
        return;
      }
      if (placingTroop) {
        const worldPos = screenToWorld(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const reinforcementStats = getReinforcementSpellStats(
          spellUpgradeLevels.reinforcements
        );

        // Snap placement to nearest path point — ignore clicks too far from any path
        const pathSnap = findClosestPathPoint(worldPos, selectedMap);
        if (!pathSnap || pathSnap.distance > HERO_PATH_HITBOX_SIZE * 2.5) {
          return;
        }
        const castCenter = pathSnap.point;
        const castGroupId = generateId("spell");

        // Spawn troops in a compact formation around the cast point.
        const troopOffsets = [
          { x: 0, y: -25 },
          { x: -25, y: 20 },
          { x: 25, y: 20 },
          { x: -48, y: -4 },
          { x: 48, y: -4 },
        ].slice(0, reinforcementStats.knightCount);
        const newTroops: Troop[] = troopOffsets.map((offset, i) => {
          const troopPos = { x: castCenter.x + offset.x, y: castCenter.y + offset.y };
          return {
            id: generateId("troop"),
            ownerId: castGroupId,
            ownerType: "spell" as const,
            pos: troopPos,
            hp: reinforcementStats.knightHp,
            maxHp: reinforcementStats.knightHp,
            moving: false,
            lastAttack: 0,
            type: "reinforcement" as const,
            overrideDamage: reinforcementStats.knightDamage,
            overrideAttackSpeed: reinforcementStats.knightAttackSpeedMs,
            overrideIsRanged: reinforcementStats.rangedUnlocked,
            overrideRange: reinforcementStats.rangedUnlocked
              ? reinforcementStats.rangedRange
              : undefined,
            overrideCanTargetFlying: reinforcementStats.rangedUnlocked,
            overrideHybridMelee: reinforcementStats.rangedUnlocked,
            visualTier: reinforcementStats.visualTier,
            rotation: 0,
            facingRight: true,
            attackAnim: 0,
            selected: false,
            spawnPoint: troopPos, // Individual spawn point, not shared center
            moveRadius: reinforcementStats.moveRadius,
            spawnSlot: i,
            userTargetPos: troopPos, // Set home position to their starting position
          };
        });
        addTroopEntities(newTroops);
        addParticles(castCenter, "glow", 20);
        addParticles({ x: castCenter.x - 20, y: castCenter.y + 15 }, "spark", 8);
        addParticles({ x: castCenter.x + 20, y: castCenter.y + 15 }, "spark", 8);
        setSpells((prev) =>
          prev.map((s) =>
            s.type === "reinforcements" ? { ...s, cooldown: s.maxCooldown } : s
          )
        );
        setPlacingTroop(false);
        return;
      }
      if (targetingSpell) {
        const worldPos = screenToWorld(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const castType = targetingSpell;
        executeTargetedSpellRef.current(targetingSpell, worldPos);
        setSpells((prev) =>
          prev.map((s) =>
            s.type === castType ? { ...s, cooldown: s.maxCooldown } : s
          )
        );
        setTargetingSpell(null);
        return;
      }

      // ========== PRIORITIZED SELECTION LOGIC ==========
      // When a hero or troop is selected, prioritize their interactions:
      // 1. Clicking on themselves -> deselect
      // 2. Clicking on path -> move
      // 3. Clicking elsewhere -> deselect (don't select other entities)

      const selectedTroopUnit = troops.find((t) => t.selected);
      const heroIsSelected = hero && !hero.dead && hero.selected;
      const levelSpecialTowers = getLevelSpecialTowers(selectedMap);
      const spec =
        levelSpecialTowers.find(
          (tower) => tower.type === "barracks"
        ) ?? undefined;

      // Convert to world coordinates for touch-based path calculation
      const clickWorldPos = screenToWorld(
        clickPos,
        width,
        height,
        dpr,
        cameraOffset,
        cameraZoom
      );
      const clickedSpecialTower =
        levelSpecialTowers.find(
          (tower) => distance(clickWorldPos, gridToWorld(tower.pos)) < 105
        ) ?? null;
      const clickedSentinelNexus =
        clickedSpecialTower?.type === "sentinel_nexus"
          ? clickedSpecialTower
          : null;

      // Missile mortar targeting mode: click to set target
      if (missileMortarTargetingId) {
        const targetPos = clampWorldToMapBounds(clickWorldPos);
        setTowers((prev) =>
          prev.map((t) =>
            t.id === missileMortarTargetingId
              ? { ...t, mortarTarget: targetPos }
              : t
          )
        );
        setMissileMortarTargetingId(null);
        addParticles(targetPos, "fire", 10);
        addParticles(targetPos, "spark", 6);
        return;
      }

      if (activeSentinelTargetKey) {
        if (clickedSentinelNexus) {
          setActiveSentinelTargetKey(getSpecialTowerKey(clickedSentinelNexus));
          addParticles(gridToWorld(clickedSentinelNexus.pos), "spark", 6);
          return;
        }
        const lockedTarget = clampWorldToMapBounds(clickWorldPos);
        setSentinelTargets((prev) => ({
          ...prev,
          [activeSentinelTargetKey]: lockedTarget,
        }));
        setActiveSentinelTargetKey(null);
        setEffects((prev) => {
          const next = [
            ...prev,
            {
              id: generateId("sentinel_lockon"),
              pos: lockedTarget,
              type: "sentinel_lockon" as const,
              progress: 0,
              size: 72,
              duration: 460,
            },
          ];
          return next.length > MAX_EFFECTS
            ? next.slice(next.length - MAX_EFFECTS)
            : next;
        });
        addParticles(lockedTarget, "light", 12);
        addParticles(lockedTarget, "spark", 8);
        return;
      }

      if (clickedSentinelNexus) {
        const sentinelKey = getSpecialTowerKey(clickedSentinelNexus);
        setActiveSentinelTargetKey(sentinelKey);
        setSelectedTower(null);
        setHero((prev) => (prev ? { ...prev, selected: false } : null));
        setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
        const existingTarget = sentinelTargetsRef.current[sentinelKey];
        if (existingTarget) {
          setEffects((prev) => {
            const next = [
              ...prev,
              {
                id: generateId("sentinel_lockon"),
                pos: existingTarget,
                type: "sentinel_lockon" as const,
                progress: 0,
                size: 72,
                duration: 460,
              },
            ];
            return next.length > MAX_EFFECTS
              ? next.slice(next.length - MAX_EFFECTS)
              : next;
          });
        }
        addParticles(gridToWorld(clickedSentinelNexus.pos), "spark", 10);
        return;
      }

      // ---------- HERO SELECTED MODE ----------
      if (heroIsSelected) {
        const heroScreen = worldToScreen(
          hero.pos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );

        // Check if clicking on hero itself to deselect
        if (distance(clickPos, heroScreen) < 28) {
          setHero((prev) => prev ? { ...prev, selected: false } : null);
          return;
        }

        // Use pre-calculated move target if valid (mouse with hover)
        if (moveTargetPos && moveTargetValid) {
          issueHeroMoveCommand(hero.id, moveTargetPos);
          return;
        }

        // For touch: calculate path on-the-fly since there's no hover preview
        if (isTouch) {
          const touchTarget = resolveHeroCommandTarget(clickWorldPos);
          if (touchTarget) {
            issueHeroMoveCommand(hero.id, touchTarget);
            return;
          }
        }

        // Clicked elsewhere - deselect hero (don't select other entities)
        setHero((prev) => prev ? { ...prev, selected: false } : null);
        return;
      }

      // ---------- TROOP SELECTED MODE ----------
      if (selectedTroopUnit) {
        // Check if clicking on the selected troop itself to deselect
        const troopScreen = worldToScreen(
          selectedTroopUnit.pos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        if (distance(clickPos, troopScreen) < 22) {
          setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
          return;
        }

        // Use pre-calculated move target if valid (mouse with hover)
        if (moveTargetPos && moveTargetValid && selectedUnitMoveInfo) {
          issueTroopFormationMoveCommand(selectedTroopUnit.ownerId, moveTargetPos);
          return;
        }

        // For touch: calculate path on-the-fly since there's no hover preview
        if (isTouch) {
          const moveInfo = getTroopMoveInfo(selectedTroopUnit, towers, spec);
          const touchTarget = resolveTroopCommandTarget(clickWorldPos, moveInfo);
          if (touchTarget) {
            issueTroopFormationMoveCommand(selectedTroopUnit.ownerId, touchTarget);
            return;
          }
        }

        // Clicked elsewhere - deselect troops (don't select other entities)
        setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
        return;
      }

      // ========== NORMAL SELECTION MODE (nothing selected) ==========
      // Check tower clicks with dynamic hitbox based on tower level/height
      const clickedTower = towers.find((t) => {
        const worldPos = gridToWorld(t.pos);
        const screenPos = worldToScreen(
          worldPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const hitboxRadius = getTowerHitboxRadius(t, cameraZoom);
        return distance(clickPos, screenPos) < hitboxRadius;
      });
      if (clickedTower) {
        const isDeselecting = selectedTower === clickedTower.id;
        setSelectedTower(isDeselecting ? null : clickedTower.id);
        setHero((prev) => (prev ? { ...prev, selected: false } : null));
        // If clicking on a Dinky Station, highlight its troops
        if (clickedTower.type === "station" && !isDeselecting) {
          setTroops((prev) =>
            prev.map((t) => ({
              ...t,
              selected: t.ownerId === clickedTower.id,
            }))
          );
        } else {
          setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
        }
        return;
      }

      // Check hero clicks (when hero is not selected)
      if (hero && !hero.dead) {
        const heroScreen = worldToScreen(
          hero.pos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        if (distance(clickPos, heroScreen) < 28) {
          setHero((prev) =>
            prev ? { ...prev, selected: true } : null
          );
          setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
          setSelectedTower(null);
          return;
        }
      }

      // Check troop clicks (only living troops can be selected)
      for (const troop of troops) {
        const troopScreen = worldToScreen(
          troop.pos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        if (distance(clickPos, troopScreen) < 22) {
          setTroops((prev) =>
            prev.map((t) => ({
              ...t,
              selected: t.id === troop.id,
            }))
          );
          setHero((prev) => (prev ? { ...prev, selected: false } : null));
          setSelectedTower(null);
          return;
        }
      }

      // Deselect all (clicked on empty space)
      setSelectedTower(null);
      setHero((prev) => (prev ? { ...prev, selected: false } : null));
      setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
    },
    [
      draggingTower,
      placingTroop,
      targetingSpell,
      buildingTower,
      towers,
      hero,
      troops,
      enemies,
      selectedTower,
      activeSentinelTargetKey,
      missileMortarTargetingId,
      selectedMap,
      canAffordPawPoints,
      gameSpeed,
      inspectorActive,
      getCanvasDimensions,
      addParticles,
      cameraOffset,
      cameraZoom,
      moveTargetPos,
      moveTargetValid,
      selectedUnitMoveInfo,
      isPanning,
      panStart,
      isBuildDragging,
      draggingUnit,
      unitDragStart,
      unitDragMoved,
      repositioningTower,
      repositionPreviewPos,
      blockedPositions,
      spendPawPoints,
      addTowerEntity,
      addTroopEntities,
      getWaveStartBubblesScreenData,
      startWave,
      setNextWaveTimer,
      setTowers,
      setTroops,
      setSpells,
      waveStartConfirm,
      currentWave,
      spellUpgradeLevels,
      clampWorldToMapBounds,
      getSpecialTowerKey,
      setEffects,
      setSentinelTargets,
      resolveHeroCommandTarget,
      resolveTroopCommandTarget,
      issueHeroMoveCommand,
      issueTroopFormationMoveCommand,
      clearUnitMoveInteraction,
    ]
  );
  const handleMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const isTouch = e.pointerType === 'touch';

      // Track device type
      if (isTouch) {
        isTouchDeviceRef.current = true;
        setHoveredWaveBubblePathKey(null);
      }

      // MOBILE FIX: Skip synthetic mouse events that follow touch events
      // Mobile browsers generate fake mousemove events after touchend which causes
      // expensive recalculations and freezing
      if (!isTouch && Date.now() - lastTouchTimeRef.current < 500) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      // If pointer was released outside the canvas, cancel drag states on re-entry.
      if (!isTouch && (e.buttons & 1) === 0) {
        if (isBuildDragging) {
          setIsBuildDragging(false);
          setDraggingTower(null);
        }
        if (draggingUnit) {
          setDraggingUnit(null);
          setUnitDragStart(null);
          setUnitDragMoved(false);
          setMoveTargetPos(null);
          setMoveTargetValid(false);
          setSelectedUnitMoveInfo(null);
        }
      }

      const { width, height, dpr } = getCanvasDimensions();
      let hoveredWaveBubblePath: string | null = null;
      if (
        !isTouch &&
        !isPanning &&
        !repositioningTower &&
        !draggingUnit &&
        (e.buttons & 1) === 0
      ) {
        const waveStartBubbles = getWaveStartBubblesScreenData(width, height, dpr);
        let bestBubbleDist = Number.POSITIVE_INFINITY;
        for (const bubble of waveStartBubbles) {
          const bubbleDist = distance({ x, y }, bubble.screenPos);
          if (
            bubbleDist <= bubble.radius * WAVE_START_BUBBLE_HIT_RADIUS &&
            bubbleDist < bestBubbleDist
          ) {
            hoveredWaveBubblePath = bubble.pathKey;
            bestBubbleDist = bubbleDist;
          }
        }
      }
      setHoveredWaveBubblePathKey(hoveredWaveBubblePath);

      // Mobile performance: troop drag-relocation is disabled on touch input.
      if (isTouch && draggingUnit?.kind === "troop") {
        setDraggingUnit(null);
        setUnitDragStart(null);
        setUnitDragMoved(false);
        setMoveTargetPos(null);
        setMoveTargetValid(false);
        setSelectedUnitMoveInfo(null);
      }

      // ========== CANVAS PANNING ==========
      if (isPanning && panStart && panStartOffset) {
        const dx = (x - panStart.x) / cameraZoom;
        const dy = (y - panStart.y) / cameraZoom;
        setCameraOffset({
          x: panStartOffset.x + dx,
          y: panStartOffset.y + dy,
        });
        return; // Don't process other interactions while panning
      }

      // ========== TOWER REPOSITIONING ==========
      if (repositioningTower) {
        setRepositionPreviewPos({ x, y });
        return; // Don't process other interactions while repositioning
      }

      // ========== HERO/TROOP DRAG TARGETING ==========
      if (draggingUnit && unitDragStart) {
        if (
          !unitDragMoved &&
          (Math.abs(x - unitDragStart.x) > 4 || Math.abs(y - unitDragStart.y) > 4)
        ) {
          setUnitDragMoved(true);
        }

        const mouseWorldPos = screenToWorld(
          { x, y },
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const spec =
          getLevelSpecialTowers(selectedMap).find(
            (tower) => tower.type === "barracks"
          ) ?? undefined;

        if (draggingUnit.kind === "hero") {
          setSelectedUnitMoveInfo({
            anchorPos: hero?.pos || mouseWorldPos,
            moveRadius: Infinity,
            canMoveAnywhere: true,
            ownerType: "hero",
            ownerId: draggingUnit.heroId,
          });

          const pathResult = findClosestPathPoint(mouseWorldPos, selectedMap);
          if (pathResult && pathResult.distance < HERO_PATH_HITBOX_SIZE * 2) {
            setMoveTargetPos(pathResult.point);
            setMoveTargetValid(true);
          } else {
            setMoveTargetPos(null);
            setMoveTargetValid(false);
          }
        } else {
          const draggedTroop = troops.find((t) => t.id === draggingUnit.troopId);
          if (!draggedTroop) {
            setDraggingUnit(null);
            setUnitDragStart(null);
            setUnitDragMoved(false);
            setMoveTargetPos(null);
            setMoveTargetValid(false);
            setSelectedUnitMoveInfo(null);
            return;
          }

          const moveInfo = getTroopMoveInfo(draggedTroop, towers, spec);
          setSelectedUnitMoveInfo(moveInfo);
          const pathResult = findClosestPathPointWithinRadius(
            mouseWorldPos,
            moveInfo.anchorPos,
            moveInfo.moveRadius,
            selectedMap
          );

          if (pathResult) {
            const pathPoint = findClosestPathPoint(mouseWorldPos, selectedMap);
            const isNearPath = !!pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2;
            setMoveTargetPos(pathResult.point);
            setMoveTargetValid(pathResult.isValid && isNearPath);
          } else {
            setMoveTargetPos(null);
            setMoveTargetValid(false);
          }
        }

        return;
      }

      // For touch: only handle tower dragging, panning, and repositioning
      if (isTouch) {
        // ========== TOUCH PANNING ==========
        if (isPanning && panStart && panStartOffset) {
          const dx = (x - panStart.x) / cameraZoom;
          const dy = (y - panStart.y) / cameraZoom;
          setCameraOffset({
            x: panStartOffset.x + dx,
            y: panStartOffset.y + dy,
          });
          return;
        }

        // ========== TOUCH TOWER REPOSITIONING ==========
        if (repositioningTower) {
          setRepositionPreviewPos({ x, y });
          return;
        }

        // ========== TOWER DRAGGING ON TOUCH ==========
        if (gameSpeed === 0) {
          if (draggingTower) {
            setDraggingTower(null);
            setBuildingTower(null);
            setIsBuildDragging(false);
          }
        } else {
          if (isBuildDragging && buildingTower && !draggingTower) {
            setDraggingTower({ type: buildingTower, pos: { x, y } });
          } else if (isBuildDragging && draggingTower) {
            setDraggingTower({ type: draggingTower.type, pos: { x, y } });
          }
        }
        return; // Skip hover effects for touch
      }

      // ========== INSPECTOR MODE - Handle enemy hover ==========
      if (inspectorActive) {
        const mouseWorldPos = screenToWorld(
          { x, y },
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );

        let hoveredEnemy: Enemy | null = null;
        let closestDist = Infinity;
        const hoverRadius = 40 / cameraZoom;

        for (const enemy of enemies) {
          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
          const eData = ENEMY_DATA[enemy.type];
          // Adjust hitbox position for flying enemies (they render higher up)
          const flyingOffset = eData.flying ? 35 : 0;
          const adjustedEnemyPos = { x: enemyPos.x, y: enemyPos.y - flyingOffset };
          const dist = distance(mouseWorldPos, adjustedEnemyPos);
          const hitRadius = (eData?.size || 20) * 1.5;

          if (dist < hitRadius + hoverRadius && dist < closestDist) {
            closestDist = dist;
            hoveredEnemy = enemy;
          }
        }

        // Check hero hover
        let isHeroHovered = false;
        if (hero && !hero.dead) {
          const heroDist = distance(mouseWorldPos, hero.pos);
          if (heroDist < 30 + hoverRadius && heroDist < closestDist) {
            closestDist = heroDist;
            hoveredEnemy = null;
            isHeroHovered = true;
          }
        }

        // Check troop hover
        let hoveredTroop: Troop | null = null;
        for (const troop of troops) {
          if (troop.dead) continue;
          const troopDist = distance(mouseWorldPos, troop.pos);
          if (troopDist < 22 + hoverRadius && troopDist < closestDist) {
            closestDist = troopDist;
            hoveredEnemy = null;
            isHeroHovered = false;
            hoveredTroop = troop;
          }
        }

        setHoveredInspectEnemy(hoveredEnemy?.id || null);
        setHoveredInspectTroop(hoveredTroop?.id || null);
        setHoveredInspectHero(isHeroHovered);

        if (gameSpeed === 0) {
          return;
        }
      }

      // ========== PREVENT TOWER DRAGGING WHEN PAUSED ==========
      if (gameSpeed === 0) {
        // Game is paused - don't allow tower dragging
        if (draggingTower) {
          setDraggingTower(null);
          setBuildingTower(null);
          setIsBuildDragging(false);
        }
      } else {
        // Game is running - keep classic move-preview behavior, while also supporting hold-drag placement.
        if (buildingTower && !draggingTower) {
          setDraggingTower({ type: buildingTower, pos: { x, y } });
        } else if (draggingTower) {
          setDraggingTower({ type: draggingTower.type, pos: { x, y } });
        }
      }
      const mouseWorldPos = screenToWorld(
        { x, y },
        width,
        height,
        dpr,
        cameraOffset,
        cameraZoom
      );
      // Check for tower hover with dynamic hitbox based on tower level/height
      const hoveredT = towers.find((t) => {
        const worldPos = gridToWorld(t.pos);
        const screenPos = worldToScreen(
          worldPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const hitboxRadius = getTowerHitboxRadius(t, cameraZoom);
        return distance({ x, y }, screenPos) < hitboxRadius;
      });

      // Check if hovering near any special building (screen-space for zoom-aware hitbox)
      const specialTowers = getLevelSpecialTowers(selectedMap);
      let hoveredSpecial: SpecialTower | null = null;
      let nearestSpecialDist = Infinity;
      for (const tower of specialTowers) {
        const towerWorldPos = gridToWorld(tower.pos);
        const towerScreenPos = worldToScreen(
          towerWorldPos, width, height, dpr, cameraOffset, cameraZoom
        );
        const dist = distance({ x, y }, towerScreenPos);
        if (dist < 60 && dist < nearestSpecialDist) {
          hoveredSpecial = tower;
          nearestSpecialDist = dist;
        }
      }
      setHoveredSpecialTower(hoveredSpecial);

      // Check for troop hover (to show station range)
      let hoveredTroopOwnerId: string | null = null;
      if (!hoveredT) {
        const hoveredTroop = troops.find((t) => {
          const screenPos = worldToScreen(
            t.pos,
            width,
            height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          return distance({ x, y }, screenPos) < 22;
        });
        if (hoveredTroop && !hoveredTroop.ownerId.startsWith("spell")) {
          hoveredTroopOwnerId = hoveredTroop.ownerId;
        }
      }

      setHoveredTower(hoveredT?.id || hoveredTroopOwnerId || null);

      if (hero && !hero.dead) {
        const heroScreen = worldToScreen(
          hero.pos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        setHoveredHero(distance({ x, y }, heroScreen) < 28);
      }

      // ========== LANDMARK & HAZARD HOVER DETECTION ==========
      // Only check when not hovering a tower/troop (lower priority)
      if (!hoveredT && !hoveredTroopOwnerId) {
        const levelData = LEVEL_DATA[selectedMap];

        // Check landmarks (decorations that are in LANDMARK_DECORATION_TYPES)
        let foundLandmark: string | null = null;
        if (levelData?.decorations) {
          for (const deco of levelData.decorations) {
            const decoType = deco.category || deco.type;
            if (decoType && (LANDMARK_DECORATION_TYPES.has(decoType) || decoType === "statue" || decoType === "demon_statue" || decoType === "obelisk")) {
              const resolvedPlacement = resolveMapDecorationRuntimePlacement(deco);
              const decoWorldPos = getMapDecorationWorldPos(deco);
              const decoScreen = worldToScreen(decoWorldPos, width, height, dpr, cameraOffset, cameraZoom);
              const scale =
                (resolvedPlacement?.scale ?? (deco.size || 1)) * cameraZoom;
              const hitRadius = scale * 35;
              const yOffset = (LANDMARK_HITBOX_Y_OFFSET[decoType] ?? 0) * scale;
              const hitCenter = { x: decoScreen.x, y: decoScreen.y - yOffset };
              if (distance({ x, y }, hitCenter) < hitRadius) {
                foundLandmark = decoType;
                break;
              }
            }
          }
        }
        setHoveredLandmark(foundLandmark);

        // Check hazards
        let foundHazard: string | null = null;
        if (levelData?.hazards) {
          for (const haz of levelData.hazards) {
            if (haz.pos) {
              const hazWorldPos = gridToWorld(haz.pos);
              const hazScreen = worldToScreen(hazWorldPos, width, height, dpr, cameraOffset, cameraZoom);
              const hitRadius = (haz.radius || 2) * 24 * cameraZoom;
              if (distance({ x, y }, hazScreen) < hitRadius) {
                foundHazard = haz.type;
                break;
              }
            }
          }
        }
        setHoveredHazardType(foundHazard);
      } else {
        setHoveredLandmark(null);
        setHoveredHazardType(null);
      }

      // ========== MOVEMENT TARGET INDICATOR CALCULATION ==========
      const selectedTroop = troops.find((t) => t.selected);
      const heroIsSelected = hero && !hero.dead && hero.selected;
      const spec =
        getLevelSpecialTowers(selectedMap).find(
          (tower) => tower.type === "barracks"
        ) ?? undefined;

      if (selectedTroop) {
        // Get move info for this troop
        const moveInfo = getTroopMoveInfo(selectedTroop, towers, spec);
        setSelectedUnitMoveInfo(moveInfo);

        // Find the valid path point within the troop's move radius
        const pathResult = findClosestPathPointWithinRadius(
          mouseWorldPos,
          moveInfo.anchorPos,
          moveInfo.moveRadius,
          selectedMap
        );

        if (pathResult) {
          // Check if the cursor is reasonably close to the path
          const pathPoint = findClosestPathPoint(mouseWorldPos, selectedMap);
          const isNearPath = !!pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2;

          setMoveTargetPos(pathResult.point);
          setMoveTargetValid(pathResult.isValid && isNearPath);
        } else {
          setMoveTargetPos(null);
          setMoveTargetValid(false);
        }
      } else if (heroIsSelected) {
        // Heroes can move anywhere on the path
        setSelectedUnitMoveInfo({
          anchorPos: hero.pos,
          moveRadius: Infinity,
          canMoveAnywhere: true,
          ownerType: 'hero',
          ownerId: hero.id,
        });

        const pathResult = findClosestPathPoint(mouseWorldPos, selectedMap);
        if (pathResult && pathResult.distance < HERO_PATH_HITBOX_SIZE * 2) {
          setMoveTargetPos(pathResult.point);
          setMoveTargetValid(true);
        } else {
          setMoveTargetPos(null);
          setMoveTargetValid(false);
        }
      } else {
        // Nothing selected - clear move target
        setMoveTargetPos(null);
        setMoveTargetValid(false);
        setSelectedUnitMoveInfo(null);
      }
    },
    [
      buildingTower,
      draggingTower,
      getCanvasDimensions,
      cameraOffset,
      cameraZoom,
      towers,
      selectedMap,
      hero,
      troops,
      inspectorActive,
      enemies,
      gameSpeed,
      isPanning,
      panStart,
      panStartOffset,
      repositioningTower,
      draggingUnit,
      unitDragStart,
      unitDragMoved,
      isBuildDragging,
      getWaveStartBubblesScreenData,
    ]
  );
  const handleCanvasPointerLeave = useCallback(() => {
    setHoveredWaveBubblePathKey(null);
  }, []);

  // Game actions
  const upgradeTower = useCallback(
    (towerId: string, choice?: "A" | "B") => {
      // Use refs to get current state values to avoid stale closure issues
      const currentTowers = towersRef.current;
      const currentPawPoints = pawPointsRef.current;

      const tower = currentTowers.find((t) => t.id === towerId);
      if (!tower) return;

      // Use getUpgradeCost to match the cost shown in the UI
      const cost = getUpgradeCost(tower.type, tower.level, tower.upgrade);
      if (cost === 0 || currentPawPoints < cost) return;

      // Level progression: 1→2, 2→3, 3→4 (with A/B choice)
      // Choice is only needed for level 3→4
      if (tower.level === 3 && !choice) return; // Need A/B choice for final upgrade

      const newLevel = (tower.level + 1) as 2 | 3 | 4;
      const newUpgrade = tower.level === 3 ? choice : tower.upgrade;

      setTowers((prev) =>
        prev.map((t) => {
          if (t.id === towerId) {
            const updates: Partial<Tower> = { level: newLevel, upgrade: newUpgrade };
            // Missile Battery (mortar 4A): set initial target near enemy spawn
            if (t.type === "mortar" && newLevel === 4 && newUpgrade === "A") {
              const defaultPathKey = activeWaveSpawnPaths[0] ?? selectedMap;
              const path = MAP_PATHS[defaultPathKey] ?? MAP_PATHS[selectedMap] ?? [];
              if (path.length >= 2) {
                const spawnNode = path[Math.min(2, path.length - 1)];
                updates.mortarTarget = gridToWorld({ x: spawnNode.x, y: spawnNode.y });
              } else {
                updates.mortarTarget = gridToWorld(t.pos);
              }
            }
            return { ...t, ...updates };
          }
          return t;
        })
      );

      // If this is a station, upgrade all its troops (without selecting them)
      if (tower.type === "station") {
        // Level 1: footsoldier, Level 2: armored, Level 3: elite, Level 4A: centaur, Level 4B: cavalry
        const newTroopType: TroopType =
          newLevel === 2
            ? "armored"
            : newLevel === 3
              ? "elite"
              : newUpgrade === "A"
                ? "centaur"
                : "cavalry";
        const newHP = TROOP_DATA[newTroopType]?.hp || 100;

        setTroops((prev) =>
          prev.map((t) => {
            if (t.ownerId === towerId) {
              // Calculate HP percentage to preserve relative health
              const hpPercent = t.hp / t.maxHp;
              return {
                ...t,
                type: newTroopType,
                maxHp: newHP,
                hp: Math.round(newHP * hpPercent),
                selected: false, // Deselect troops after upgrade
              };
            }
            return t;
          })
        );
      }

      removePawPoints(cost);
      addParticles(gridToWorld(tower.pos), "glow", 20);
      setSelectedTower(null);
    },
    [addParticles, removePawPoints, setTowers, setTroops, activeWaveSpawnPaths, selectedMap]
  );
  const sellTower = useCallback(
    (towerId: string) => {
      const tower = towers.find((t) => t.id === towerId);
      if (!tower) return;
      const refund =
        Math.floor(TOWER_DATA[tower.type].cost * 0.7) +
        (tower.level - 1) *
        (tower.level === 2
          ? 150 * 0.7
          : tower.level === 3
            ? 250 * 0.7
            : tower.level === 4
              ? 350 * 0.7
              : 0);
      addPawPoints(refund);
      addParticles(gridToWorld(tower.pos), "smoke", 15);
      removeTowerEntity(towerId);
      // Remove all troops belonging to this station
      removeTroopsWhere((troop) => troop.ownerId === towerId);
      setSelectedTower(null);
    },
    [towers, addParticles, addPawPoints, removeTowerEntity, removeTroopsWhere]
  );
  const castSpell = useCallback(
    (spellType: SpellType) => {
      // Prevent spell casting when game is paused
      if (gameSpeed === 0) return;

      // Cancel targeting if clicking the same spell again
      if (targetingSpell === spellType) {
        setTargetingSpell(null);
        const refundCost = SPELL_DATA[spellType]?.cost ?? 0;
        if (refundCost > 0) addPawPoints(refundCost);
        return;
      }
      // Cancel reinforcement placement if clicking reinforcements again
      if (placingTroop && spellType === "reinforcements") {
        setPlacingTroop(false);
        const refundCost = SPELL_DATA["reinforcements"]?.cost ?? 0;
        if (refundCost > 0) addPawPoints(refundCost);
        return;
      }
      // Cancel any existing targeting if switching to a different spell
      if (targetingSpell) {
        const prevCost = SPELL_DATA[targetingSpell]?.cost ?? 0;
        if (prevCost > 0) addPawPoints(prevCost);
        setTargetingSpell(null);
      }
      // Cancel reinforcement placement if switching to a different spell
      if (placingTroop) {
        const prevCost = SPELL_DATA["reinforcements"]?.cost ?? 0;
        if (prevCost > 0) addPawPoints(prevCost);
        setPlacingTroop(false);
      }

      const spell = spells.find((s) => s.type === spellType);
      if (!spell || spell.cooldown > 0) return;
      const cost = SPELL_DATA[spellType]?.cost ?? 0;
      if (!canAffordPawPoints(cost)) return;
      if (
        (spellType === "fireball" || spellType === "lightning" || spellType === "freeze" || spellType === "payday") &&
        enemies.length === 0
      ) {
        return;
      }
      if (!spendPawPoints(cost)) return;

      let enteredTargeting = false;
      switch (spellType) {
        case "fireball":
        case "lightning": {
          const level = spellUpgradeLevels[spellType] ?? 0;
          if (level >= 2) {
            setTargetingSpell(spellType);
            enteredTargeting = true;
          } else {
            // Auto-target: pick center of enemies as the cast point
            const enemyPositions = enemies.map((e) => getEnemyPosWithPath(e, selectedMap));
            const avgX = enemyPositions.reduce((s, p) => s + p.x, 0) / enemyPositions.length;
            const avgY = enemyPositions.reduce((s, p) => s + p.y, 0) / enemyPositions.length;
            executeTargetedSpellRef.current(spellType, { x: avgX, y: avgY });
          }
          break;
        }

        case "freeze": {
          const freezeStats = getFreezeSpellStats(spellUpgradeLevels.freeze);
          const freezeUntil = Date.now() + freezeStats.freezeDurationMs;
          setEnemies((prev) =>
            prev.map((e) => ({ ...e, frozen: true, stunUntil: freezeUntil }))
          );
          // Create freeze wave effect
          if (enemies.length > 0) {
            const centerEnemy = enemies[Math.floor(enemies.length / 2)];
            const centerPos = getEnemyPosWithPath(centerEnemy, selectedMap);
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("freeze_wave"),
                pos: centerPos,
                type: "freeze_wave",
                progress: 0,
                size: 400,
              },
            ]);
          }
          enemies.forEach((e) => {
            const pos = getEnemyPosWithPath(e, selectedMap);
            addParticles(pos, "ice", 8);
          });
          break;
        }

        case "payday": {
          // ENHANCED PAYDAY - Creates money aura around all enemies for duration
          // Enemies killed while gold aura active give +50% bounty
          const paydayStats = getPaydaySpellStats(spellUpgradeLevels.payday);
          const bonusPerEnemy = paydayStats.bonusPerEnemy;
          const basePayout = paydayStats.basePayout;
          const enemyBonus = Math.min(
            enemies.length * bonusPerEnemy,
            paydayStats.maxBonus
          );
          const totalPayout = basePayout + enemyBonus;

          addPawPoints(totalPayout);

          // Apply gold aura effect to all enemies and activate HUD animation
          setEnemies((prev) => prev.map((e) => ({ ...e, goldAura: true })));
          setGoldSpellActive(true);

          // Create money aura around all enemies
          setEffects((ef) => [
            ...ef,
            {
              id: generateId("payday_aura"),
              pos: { x: 0, y: 0 },
              type: "payday_aura",
              progress: 0,
              size: 0,
              duration: paydayStats.auraDurationMs,
              enemies: enemies.map((e) => e.id),
            },
          ]);

          // Create gold particles on each enemy
          enemies.forEach((e) => {
            const pos = getEnemyPosWithPath(e, selectedMap);
            addParticles(pos, "gold", 12);
          });

          // Clear gold aura after 10 seconds
          setTimeout(() => {
            setEnemies((prev) => prev.map((e) => ({ ...e, goldAura: false })));
            setGoldSpellActive(false);
          }, paydayStats.auraDurationMs);
          break;
        }

        case "reinforcements":
          setPlacingTroop(true);
          enteredTargeting = true;
          break;
      }
      if (!enteredTargeting) {
        setSpells((prev) =>
          prev.map((s) =>
            s.type === spellType ? { ...s, cooldown: s.maxCooldown } : s
          )
        );
      }
    },
    [
      spells,
      enemies,
      selectedMap,
      addParticles,
      gameSpeed,
      targetingSpell,
      placingTroop,
      onEnemyKill,
      canAffordPawPoints,
      spendPawPoints,
      addPawPoints,
      setEnemies,
      setEffects,
      spellUpgradeLevels,
    ]
  );

  const executeTargetedSpell = useCallback(
    (spellType: SpellType, centerWorldPos: Position) => {
      if (spellType === "fireball") {
        const fireballStats = getFireballSpellStats(
          spellUpgradeLevels.fireball
        );
        const meteorCount = fireballStats.meteorCount;
        const damagePerMeteor = fireballStats.damagePerMeteor;
        const impactRadius = fireballStats.impactRadius;
        const burnDuration = fireballStats.burnDurationMs;
        const burnDamage = fireballStats.burnDamagePerSecond;
        const fallDuration = fireballStats.fallDurationMs;

        const meteorTargets: Position[] = [];
        for (let i = 0; i < meteorCount; i++) {
          const offsetX = (Math.random() - 0.5) * 300;
          const offsetY = (Math.random() - 0.5) * 150;
          meteorTargets.push({
            x: centerWorldPos.x + offsetX,
            y: centerWorldPos.y + offsetY,
          });
        }

        meteorTargets.forEach((targetPos, index) => {
          const staggerDelay = index * 180;

          setTimeout(() => {
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("meteor_falling"),
                pos: { x: targetPos.x + 700, y: targetPos.y - 2800 },
                targetPos: targetPos,
                type: "meteor_falling",
                progress: 0,
                size: 90,
                duration: fallDuration,
                meteorIndex: index,
              },
            ]);

            setTimeout(() => {
              const now = Date.now();
              setEnemies((prev) =>
                prev
                  .map((e) => {
                    const pos = getEnemyPosWithPath(e, selectedMap);
                    const dist = distance(pos, targetPos);
                    if (dist < impactRadius) {
                      const damageMultiplier = 1 - (dist / impactRadius) * 0.5;
                      const damage = Math.floor(damagePerMeteor * damageMultiplier);
                      const newHp = e.hp - getEnemyDamageTaken(e, damage, "fire");
                      if (newHp <= 0) {
                        onEnemyKill(e, pos, 20, "fire");
                        addParticles(pos, "fire", 15);
                        return null;
                      }
                      return {
                        ...e,
                        hp: newHp,
                        damageFlash: 300,
                        burning: true,
                        burnDamage: burnDamage,
                        burnUntil: now + burnDuration,
                      };
                    }
                    return e;
                  })
                  .filter(isDefined)
              );

              setEffects((ef) => [
                ...ef,
                {
                  id: generateId("meteor_impact"),
                  pos: targetPos,
                  type: "meteor_impact",
                  progress: 0,
                  size: impactRadius * 1.5,
                },
                {
                  id: generateId("fire_scorch"),
                  pos: targetPos,
                  type: "fire_scorch",
                  progress: 0,
                  size: impactRadius * 1.2,
                  duration: 3000,
                },
              ]);
              addParticles(targetPos, "explosion", 40);
              addParticles(targetPos, "fire", 35);
              addParticles(targetPos, "smoke", 25);
            }, fallDuration);
          }, staggerDelay);
        });
      } else if (spellType === "lightning") {
        const lightningStats = getLightningSpellStats(
          spellUpgradeLevels.lightning
        );
        const totalDamage = lightningStats.totalDamage;
        const targetCount = Math.min(lightningStats.chainCount, enemies.length);
        const damagePerTarget = targetCount > 0 ? Math.floor(totalDamage / targetCount) : 0;

        // Sort enemies by distance to clicked position, prioritize closest
        const sorted = [...enemies]
          .map((e) => ({
            enemy: e,
            dist: distance(getEnemyPosWithPath(e, selectedMap), centerWorldPos),
          }))
          .sort((a, b) => a.dist - b.dist);
        const targets = sorted.slice(0, targetCount).map((s) => s.enemy);

        targets.forEach((target, index) => {
          setTimeout(() => {
            const targetPos = getEnemyPosWithPath(target, selectedMap);

            setEffects((ef) => [
              ...ef,
              {
                id: generateId("lightning_bolt"),
                pos: { x: targetPos.x, y: targetPos.y - 700 },
                targetPos: targetPos,
                type: "lightning_bolt",
                progress: 0,
                size: 120,
                strikeIndex: index,
              },
              {
                id: generateId("lightning_scorch"),
                pos: targetPos,
                type: "lightning_scorch",
                progress: 0,
                size: 80,
                duration: 2500,
              },
            ]);

            setEnemies((prev) =>
              prev
                .map((e) => {
                  if (e.id === target.id) {
                    const newHp =
                      e.hp - getEnemyDamageTaken(e, damagePerTarget);
                    if (newHp <= 0) {
                      onEnemyKill(e, targetPos, 12, "lightning");
                      addParticles(targetPos, "spark", 25);
                      addParticles(targetPos, "glow", 15);
                      return null;
                    }
                    return {
                      ...e,
                      hp: newHp,
                      damageFlash: 250,
                      stunUntil: Date.now() + lightningStats.stunDurationMs,
                    };
                  }
                  return e;
                })
                .filter(isDefined)
            );
            addParticles(targetPos, "spark", 20);
          }, index * 200);
        });
      }
    },
    [
      enemies,
      selectedMap,
      addParticles,
      onEnemyKill,
      setEnemies,
      setEffects,
      spellUpgradeLevels,
    ]
  );
  executeTargetedSpellRef.current = executeTargetedSpell;

  const upgradeSpell = useCallback(
    (spellType: SpellType) => {
      setProgress((prev) => {
        const normalizedUpgrades = normalizeSpellUpgradeLevels(
          prev.spellUpgrades ?? DEFAULT_SPELL_UPGRADES
        );
        const currentLevel = normalizedUpgrades[spellType] ?? 0;
        if (currentLevel >= MAX_SPELL_UPGRADE_LEVEL) return prev;

        const nextUpgradeCost = getNextSpellUpgradeCost(spellType, currentLevel);
        if (nextUpgradeCost <= 0) return prev;

        const totalEarned =
          prev.totalStarsEarned ??
          Object.values(prev.levelStars || {}).reduce(
            (sum, stars) => sum + (Number.isFinite(stars) ? stars : 0),
            0
          );
        const spent = getSpentSpellUpgradeStars(normalizedUpgrades);
        const available = Math.max(0, totalEarned - spent);
        if (available < nextUpgradeCost) return prev;

        return {
          ...prev,
          spellUpgrades: {
            ...normalizedUpgrades,
            [spellType]: currentLevel + 1,
          },
        };
      });
    },
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
    // Prevent hero ability usage when game is paused
    if (gameSpeed === 0) return;
    if (!hero || !hero.abilityReady || hero.dead) return;

    switch (hero.type) {
      case "tiger": {
        // MIGHTY ROAR - Stuns ALL enemies in radius with fear effect
        const roarRadius = 180;
        const nearbyEnemies = enemies.filter(
          (e) =>
            distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) < roarRadius
        );
        nearbyEnemies.forEach((e) => {
          setEnemies((prev) =>
            prev.map((enemy) =>
              enemy.id === e.id
                ? { ...enemy, stunUntil: Date.now() + 3000, slowEffect: 0.5 }
                : enemy
            )
          );
        });
        // Create roar shockwave effect
        setEffects((ef) => [
          ...ef,
          {
            id: generateId("roar"),
            pos: hero.pos,
            type: "roar_wave",
            progress: 0,
            size: roarRadius,
          },
        ]);
        addParticles(hero.pos, "spark", 30);
        addParticles(hero.pos, "explosion", 15);
        break;
      }

      case "tenor": {
        // HIGH NOTE - Devastating sonic blast with huge radius + Inspiring Melody that heals allies
        const noteRadius = 250;
        const healRadius = 200; // Healing radius for allies
        const healAmount = 75; // Healing for nearby troops

        const nearbyEnemies = enemies.filter(
          (e) =>
            distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) < noteRadius
        );
        // Deal damage and stun
        setEnemies((prev) =>
          prev
            .map((e) => {
              const isTarget = nearbyEnemies.find((ne) => ne.id === e.id);
              if (isTarget) {
                const newHp = e.hp - getEnemyDamageTaken(e, 80);
                if (newHp <= 0) {
                  onEnemyKill(e, getEnemyPosWithPath(e, selectedMap), 8, "sonic");
                  return null;
                }
                return {
                  ...e,
                  hp: newHp,
                  stunUntil: Date.now() + 2000,
                  damageFlash: 200,
                };
              }
              return e;
            })
            .filter(isDefined)
        );

        // Heal nearby troops with inspiring melody
        setTroops((prev) =>
          prev.map((t) => {
            if (!t.dead && distance(t.pos, hero.pos) < healRadius) {
              addParticles(t.pos, "heal", 6);
              return {
                ...t,
                hp: Math.min(t.maxHp, t.hp + healAmount),
                healFlash: Date.now(),
              };
            }
            return t;
          })
        );

        // Create musical shockwave effect
        setEffects((ef) => [
          ...ef,
          {
            id: generateId("note"),
            pos: hero.pos,
            type: "high_note",
            progress: 0,
            size: noteRadius,
          },
        ]);
        addParticles(hero.pos, "light", 35);
        addParticles(hero.pos, "heal", 20);
        break;
      }

      case "mathey": {
        const tauntRadius = 300; // Increased for better effectiveness
        const duration = 10000; // 10 seconds

        // 1. Set Hero state
        setHero((prev) =>
          prev
            ? { ...prev, shieldActive: true, shieldEnd: Date.now() + duration }
            : null
        );

        // 2. Force enemies to target the hero (Update state of current enemies)
        setEnemies((prev) =>
          prev.map((enemy) => {
            const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
            if (distance(hero.pos, enemyPos) < tauntRadius) {
              return { ...enemy, taunted: true, tauntTarget: hero.id };
            }
            return enemy;
          })
        );

        // 3. Visuals
        setEffects((ef) => [
          ...ef,
          {
            id: generateId("shield"),
            pos: { ...hero.pos },
            type: "fortress_shield",
            progress: 0,
            size: 80,
            duration,
          },
        ]);
        addParticles(hero.pos, "glow", 25);
        addParticles(hero.pos, "spark", 15);
        break;
      }

      case "rocky": {
        // BOULDER STRIKE - Throws boulders at nearest enemies
        const throwRange = 350; // How far Rocky can throw
        const boulderDamage = 180;
        const maxBoulders = 5; // Number of boulders thrown

        // Find enemies in range and sort by distance
        const enemiesInRange = enemies
          .filter((e) => !e.dead && distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <= throwRange)
          .map((e) => ({
            enemy: e,
            dist: distance(hero.pos, getEnemyPosWithPath(e, selectedMap)),
            pos: getEnemyPosWithPath(e, selectedMap),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, maxBoulders);

        if (enemiesInRange.length === 0) {
          // No enemies in range - throw boulders in random directions for visual flair
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 150 + Math.random() * 100;
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("boulder"),
                pos: { ...hero.pos },
                type: "boulder_strike",
                progress: 0,
                size: 40,
                targetPos: {
                  x: hero.pos.x + Math.cos(angle) * dist,
                  y: hero.pos.y + Math.sin(angle) * dist,
                },
              },
            ]);
          }
          addParticles(hero.pos, "smoke", 10);
          break;
        }

        // Create boulder effects for each target enemy
        const newEffects: Effect[] = [];
        enemiesInRange.forEach((target, idx) => {
          newEffects.push({
            id: generateId(`boulder-${idx}`),
            pos: { ...hero.pos },
            type: "boulder_strike",
            progress: 0,
            size: 45,
            targetPos: { ...target.pos },
          });
        });

        setEffects((ef) => [...ef, ...newEffects]);

        // Deal damage to targeted enemies
        setEnemies((prev) =>
          prev
            .map((e) => {
              const isTarget = enemiesInRange.find((t) => t.enemy.id === e.id);
              if (isTarget) {
                const newHp = e.hp - getEnemyDamageTaken(e, boulderDamage);
                if (newHp <= 0) {
                  onEnemyKill(e, getEnemyPosWithPath(e, selectedMap), 12);
                  return null;
                }
                return {
                  ...e,
                  hp: newHp,
                  stunUntil: Date.now() + 800, // Brief stun from boulder impact
                  damageFlash: 300,
                };
              }
              return e;
            })
            .filter(isDefined)
        );

        // Throw particles from Rocky
        addParticles(hero.pos, "smoke", 15);
        addParticles(hero.pos, "explosion", 8);
        break;
      }

      case "scott": {
        // INSPIRATION - Boost all tower damage (stacks with Recruitment Center and other buffs)
        // Just mark towers as buffed with a boostEnd time - actual buff calculation is done
        // in the DYNAMIC BUFF REGISTRATION section which handles stacking properly
        const boostRadius = 450;
        setTowers((prev) =>
          prev.map((t) => {
            if (t.type === "club") return t; // Clubs don't receive buffs
            const tWorldPos = gridToWorld(t.pos);
            if (distance(hero.pos, tWorldPos) <= boostRadius) {
              return {
                ...t,
                boostEnd: Date.now() + 8000, // 8 second duration
                isBuffed: true, // Mark as having F. Scott's buff
              };
            }
            return t;
          })
        );
        // Create inspiration aura effect
        setEffects((ef) => [
          ...ef,
          {
            id: generateId("inspire"),
            pos: hero.pos,
            type: "inspiration",
            progress: 0,
            size: 300,
            duration: 8000,
          },
        ]);
        addParticles(hero.pos, "light", 30);
        addParticles(hero.pos, "gold", 20);
        break;
      }

      case "captain": {
        // RALLY KNIGHTS - Summon 3 reinforcement knights (weaker summoned version)
        // Captain's summoned knights are weaker than Dinky Station knights
        const summonedKnightHP = 350; // Reduced from 800
        // Offsets are larger than TROOP_SEPARATION_DIST (35) to prevent immediate overlap
        const knightOffsets = [
          { x: -35, y: -20 },
          { x: 35, y: -20 },
          { x: 0, y: 35 },
        ];
        const newTroops: Troop[] = knightOffsets.map((offset) => {
          // Each knight gets their own home position to prevent bundling/vibration
          const knightPos = { x: hero.pos.x + offset.x, y: hero.pos.y + offset.y };
          return {
            id: generateId("troop"),
            ownerId: hero.id,
            ownerType: "hero_summon" as const, // Red themed knight (Mercer's rally)
            type: "knight" as TroopType,
            pos: knightPos,
            hp: summonedKnightHP,
            maxHp: summonedKnightHP,
            moving: false,
            targetPos: undefined,
            targetEnemy: null,
            rallyPoint: null,
            selected: false,
            lastAttack: 0, // IMPORTANT: Initialize for attack timing
            rotation: 0, // IMPORTANT: Initialize rotation
            facingRight: true,
            attackAnim: 0,
            spawnPoint: knightPos,
            moveRadius: 180, // Captain's summoned knights range
            userTargetPos: knightPos, // Set home position to their starting position
          };
        });
        addTroopEntities(newTroops);
        // Create summon effect
        setEffects((ef) => [
          ...ef,
          {
            id: generateId("summon"),
            pos: hero.pos,
            type: "knight_summon",
            progress: 0,
            size: 80,
          },
        ]);
        addParticles(hero.pos, "spark", 25);
        addParticles(hero.pos, "gold", 15);
        break;
      }

      case "engineer": {
        // DEPLOY TURRET - Create a stationary defense turret (as a troop, not a tower)
        // The turret is a fixed-position ranged unit that can be destroyed by enemies
        const turretPos = { x: hero.pos.x + 40, y: hero.pos.y };
        const turretHP = 400;
        const newTurret: Troop = {
          id: generateId("turret"),
          ownerId: hero.id,
          type: "turret" as TroopType,
          pos: turretPos,
          hp: turretHP,
          maxHp: turretHP,
          moving: false, // Turret doesn't move
          targetPos: undefined,
          targetEnemy: null,
          rallyPoint: null,
          selected: false,
          lastAttack: 0,
          rotation: 0,
          facingRight: true,
          attackAnim: 0,
          spawnPoint: turretPos, // Fixed position
          moveRadius: 0, // Cannot move at all
        };
        addTroopEntity(newTurret);
        // Create deploy effect
        setEffects((ef) => [
          ...ef,
          {
            id: generateId("deploy"),
            pos: turretPos,
            type: "turret_deploy",
            progress: 0,
            size: 60,
          },
        ]);
        addParticles(turretPos, "spark", 30);
        addParticles(turretPos, "smoke", 10);
        break;
      }
    }

    setHero((prev) =>
      prev
        ? {
          ...prev,
          abilityReady: false,
          abilityCooldown: HERO_ABILITY_COOLDOWNS[hero.type],
        }
        : null
    );
  }, [
    hero,
    enemies,
    selectedMap,
    addParticles,
    gameSpeed,
    onEnemyKill,
    addTroopEntities,
    addTroopEntity,
    setEffects,
    setEnemies,
    setTowers,
    setTroops,
  ]);

  // Auto-trigger hero ability when HP drops below 25%
  const AUTO_ABILITY_HP_THRESHOLD = 0.25;
  useEffect(() => {
    if (!hero || hero.dead || !hero.abilityReady || hero.hp <= 0) return;
    if (hero.hp < hero.maxHp * AUTO_ABILITY_HP_THRESHOLD) {
      triggerHeroAbility();
    }
  }, [hero?.hp, hero?.maxHp, hero?.abilityReady, hero?.dead, triggerHeroAbility]);

  const performBattleReset = useCallback(
    ({
      targetGameState,
      startingPawPoints,
      levelStartTimeValue,
      resetCamera,
      resetResultStats,
      specialTowerHpValue,
    }: {
      targetGameState: GameState;
      startingPawPoints: number;
      levelStartTimeValue: number;
      resetCamera: boolean;
      resetResultStats: boolean;
      specialTowerHpValue: number | null;
    }) => {
      resetBattleState({
        clearAllTimers,
        setters: {
          setGameState,
          setPawPoints,
          setLives,
          setCurrentWave,
          setNextWaveTimer,
          setTowers,
          setEnemies,
          setHero,
          setTroops,
          setProjectiles,
          setEffects,
          clearParticlePool,
          setSelectedTower,
          setBuildingTower,
          setDraggingTower,
          setIsPanning,
          setPanStart,
          setPanStartOffset,
          setRepositioningTower,
          setRepositionPreviewPos,
          setWaveInProgress,
          setPlacingTroop,
          setTargetingSpell,
          setSpells,
          setGameSpeed,
          setGoldSpellActive,
          setInspectorActive,
          setSelectedInspectEnemy,
          setPreviousGameSpeed,
          setSpecialTowerHp,
          setLevelStartTime,
          setCameraOffset,
          setCameraZoom,
          setStarsEarned,
          setTimeSpent,
        },
        refs: {
          gameEndHandledRef,
          prevGameSpeedRef,
          pausedAtRef,
          totalPausedTimeRef,
          pausableTimeoutsRef,
          lastBarracksSpawnRef,
          gameResetTimeRef,
        },
        options: {
          targetGameState,
          startingPawPoints,
          levelStartTime: levelStartTimeValue,
          resetCamera,
          resetResultStats,
          specialTowerHp: specialTowerHpValue,
        },
      });
      setBattleOutcome(null);
      setActiveSentinelTargetKey(null);
      setSentinelTargets({});
      lastSentinelStrikeRef.current.clear();
      lastSunforgeBarrageRef.current.clear();
    },
    [
      clearAllTimers,
      setPawPoints,
      setEffects,
      setEnemies,
      setProjectiles,
      setBattleOutcome,
      setTowers,
      setTroops,
    ]
  );

  const resetGame = useCallback(() => {
    performBattleReset({
      targetGameState: "menu",
      startingPawPoints: INITIAL_PAW_POINTS,
      levelStartTimeValue: 0,
      resetCamera: true,
      resetResultStats: true,
      specialTowerHpValue: getLevelSpecialTowerHp(selectedMap),
    });
  }, [performBattleReset, selectedMap]);

  const retryLevel = useCallback(() => {
    performBattleReset({
      targetGameState: "playing",
      startingPawPoints: getLevelStartingPawPoints(selectedMap),
      levelStartTimeValue: Date.now(),
      resetCamera: false,
      resetResultStats: false,
      specialTowerHpValue: getLevelSpecialTowerHp(selectedMap),
    });
  }, [performBattleReset, selectedMap]);

  const quitLevel = useCallback(() => {
    resetGame();
    setGameState("setup");
  }, [resetGame]);

  const devLevelOptions = useMemo(
    () =>
      Object.entries(LEVEL_DATA)
        .map(([id, levelData]) => ({
          id,
          name: levelData?.name ?? id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const unlockAllLevels = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      unlockedMaps: Array.from(
        new Set([...prev.unlockedMaps, ...Object.keys(LEVEL_DATA)])
      ),
    }));
  }, [setProgress]);

  const lockLevelFromDevMenu = useCallback(
    (levelId: string) => {
      if (!levelId) return;
      setProgress((prev) => ({
        ...prev,
        unlockedMaps: prev.unlockedMaps.filter((id) => id !== levelId),
      }));
    },
    [setProgress]
  );

  const setLevelStarsFromDevMenu = useCallback(
    (levelId: string, stars: number) => {
      if (!levelId) return;
      if (!Number.isFinite(stars)) return;

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
    },
    [setProgress]
  );

  const replaceProgressFromDevMenu = useCallback(
    (
      candidate: unknown
    ): {
      ok: boolean;
      message: string;
    } => {
      if (!candidate || typeof candidate !== "object") {
        return { ok: false, message: "Progress payload must be an object." };
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
          ok: false,
          message:
            "Missing required keys: unlockedMaps[], levelStars{}, levelStats{}.",
        };
      }

      const normalizedStars: Record<string, number> = {
        ...DEFAULT_GAME_PROGRESS.levelStars,
      };
      Object.entries(next.levelStars as Record<string, unknown>).forEach(
        ([levelId, stars]) => {
          if (typeof stars !== "number" || !Number.isFinite(stars)) return;
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
        unlockedMaps: Array.from(
          new Set(
            [
              ...DEFAULT_GAME_PROGRESS.unlockedMaps,
              ...next.unlockedMaps.filter(
                (levelId): levelId is string =>
                  typeof levelId === "string" && levelId.length > 0
              ),
            ].filter(Boolean)
          )
        ),
        levelStars: normalizedStars,
        levelStats: normalizedLevelStats,
        spellUpgrades: normalizedSpellUpgrades,
        lastPlayedLevel:
          typeof next.lastPlayedLevel === "string"
            ? next.lastPlayedLevel
            : undefined,
        totalStarsEarned: Object.values(normalizedStars).reduce(
          (sum, stars) => sum + stars,
          0
        ),
      };

      setProgress(normalizedProgress);
      return { ok: true, message: "Progress data updated." };
    },
    [setProgress]
  );

  const grantPawPointsFromDevMenu = useCallback(
    (amount: number) => {
      const normalizedAmount = Math.max(0, Math.round(amount));
      if (normalizedAmount <= 0) return;
      addPawPoints(normalizedAmount);
    },
    [addPawPoints]
  );

  const adjustLivesFromDevMenu = useCallback((delta: number) => {
    const normalizedDelta = Math.trunc(delta);
    if (!Number.isFinite(normalizedDelta) || normalizedDelta === 0) return;
    setLives((previousLives) => Math.max(0, previousLives + normalizedDelta));
  }, []);

  const instantVictoryFromDevMenu = useCallback(() => {
    if (gameState !== "playing" || battleOutcome) return;
    clearAllTimers();
    setHoveredWaveBubblePathKey(null);
    setWaveInProgress(false);
    setNextWaveTimer(0);
    setCurrentWave(totalWaves);
    clearEnemies();
  }, [gameState, battleOutcome, clearAllTimers, clearEnemies, totalWaves]);

  const instantLoseFromDevMenu = useCallback(() => {
    if (gameState !== "playing" || battleOutcome) return;
    clearAllTimers();
    setHoveredWaveBubblePathKey(null);
    setWaveInProgress(false);
    setNextWaveTimer(0);
    setLives(0);
  }, [gameState, battleOutcome, clearAllTimers]);

  const devConfigMenu = DEV_CONFIG_MENU_ENABLED ? (
    <DevConfigMenu
      gameState={gameState}
      levelOptions={devLevelOptions}
      progress={progress}
      devPerfEnabled={devPerfEnabled}
      setDevPerfEnabled={setDevPerfEnabled}
      devPerfSnapshot={devPerfSnapshot}
      onUnlockLevel={unlockLevel}
      onLockLevel={lockLevelFromDevMenu}
      onUnlockAllLevels={unlockAllLevels}
      onSetLevelStars={setLevelStarsFromDevMenu}
      onReplaceProgress={replaceProgressFromDevMenu}
      onGrantPawPoints={grantPawPointsFromDevMenu}
      onAdjustLives={adjustLivesFromDevMenu}
      onInstantVictory={instantVictoryFromDevMenu}
      onInstantLose={instantLoseFromDevMenu}
    />
  ) : null;

  const pendingStartWithRandomRef = useRef(false);
  const startWithRandomLoadout = useCallback(() => {
    const hero = HERO_OPTIONS[Math.floor(Math.random() * HERO_OPTIONS.length)];
    const shuffled = [...SPELL_OPTIONS].sort(() => Math.random() - 0.5);
    setSelectedHero(hero);
    setSelectedSpells(shuffled.slice(0, 3));
    pendingStartWithRandomRef.current = true;
  }, []);

  useEffect(() => {
    if (pendingStartWithRandomRef.current && selectedHero && selectedSpells.length === 3) {
      pendingStartWithRandomRef.current = false;
      setGameState("playing");
    }
  }, [selectedHero, selectedSpells, setGameState]);

  // Render different screens based on game state
  // Show WorldMap for both menu and setup (combined into one screen)
  if (gameState === "menu" || gameState === "setup") {
    return (
      <>
        <WorldMap
          setGameState={setGameState}
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
          unlockedMaps={unlockedMaps}
          levelStars={levelStars}
          levelStats={levelStats}
          customLevels={customLevels}
          onSaveCustomLevel={upsertCustomLevel}
          onDeleteCustomLevel={deleteCustomLevel}
          gameState={gameState}
          onStartWithRandomLoadout={startWithRandomLoadout}
          isDevMode={DEV_CONFIG_MENU_ENABLED}
        />
        {devConfigMenu}
      </>
    );
  }
  // Main game view (battle overlay stays on top without leaving this view)
  const { width, height, dpr } = getCanvasDimensions();
  const selectedLevelData = LEVEL_DATA[selectedMap];
  const selectedThemeKey =
    selectedLevelData?.theme && selectedLevelData.theme in REGION_THEMES
      ? (selectedLevelData.theme as keyof typeof REGION_THEMES)
      : "grassland";
  const selectedThemePalette = REGION_THEMES[selectedThemeKey];
  const themeAccentRgb = hexToRgb(selectedThemePalette.accent);
  const themeGroundStartRgb = hexToRgb(selectedThemePalette.ground[0] || "#1a1f25");
  const themeGroundEndRgb = hexToRgb(selectedThemePalette.ground[2] || "#080b10");
  const fadeOverlayBackground = `radial-gradient(circle at 24% 16%, rgba(${themeAccentRgb.r}, ${themeAccentRgb.g}, ${themeAccentRgb.b}, 0.26), rgba(${themeAccentRgb.r}, ${themeAccentRgb.g}, ${themeAccentRgb.b}, 0.08) 42%, rgba(0,0,0,0) 76%), linear-gradient(135deg, rgba(${darkenRgbChannel(
    themeGroundStartRgb.r,
    0.55
  )}, ${darkenRgbChannel(themeGroundStartRgb.g, 0.55)}, ${darkenRgbChannel(
    themeGroundStartRgb.b,
    0.55
  )}, 0.98) 0%, rgba(${darkenRgbChannel(themeGroundEndRgb.r, 0.7)}, ${darkenRgbChannel(
    themeGroundEndRgb.g,
    0.7
  )}, ${darkenRgbChannel(themeGroundEndRgb.b, 0.7)}, 0.98) 100%)`;
  const levelAllowedTowers = selectedLevelData?.allowedTowers ?? null;
  const currentLevelStats = levelStats?.[selectedMap] || {};
  const isVictory = battleOutcome === "victory";
  const isDefeat = battleOutcome === "defeat";
  return (
    <div className="w-full h-screen bg-black flex flex-col text-amber-100 overflow-hidden relative">
      <TopHUD
        pawPoints={pawPoints}
        lives={lives}
        currentWave={currentWave}
        totalWaves={totalWaves}
        nextWaveTimer={nextWaveTimer}
        gameSpeed={gameSpeed}
        setGameSpeed={(nextSpeed) => {
          if (battleOutcome || pauseLocked) return;
          setGameSpeed(nextSpeed);
        }}
        goldSpellActive={goldSpellActive}
        eatingClubIncomeEvents={eatingClubIncomeEvents}
        onEatingClubEventComplete={(id) => setEatingClubIncomeEvents((prev) => prev.filter((e) => e.id !== id))}
        bountyIncomeEvents={bountyIncomeEvents}
        onBountyEventComplete={(id) => setBountyIncomeEvents((prev) => prev.filter((e) => e.id !== id))}
        inspectorActive={inspectorActive}
        setInspectorActive={setInspectorActive}
        setSelectedInspectEnemy={setSelectedInspectEnemy}
        quitLevel={quitLevel}
        retryLevel={retryLevel}
        cameraModeActive={cameraModeActive}
        onTogglePhotoMode={toggleCameraMode}
        pauseLocked={pauseLocked}
      />
      {!cameraModeActive && devConfigMenu}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{ background: fadeOverlayBackground }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handleCanvasClick}
            onPointerMove={handleMouseMove}
            onPointerLeave={handleCanvasPointerLeave}
            className={`w-full h-full touch-none game-start-fade ${isPanning ? 'cursor-grabbing' :
              repositioningTower ? 'cursor-move' :
                hoveredWaveBubblePathKey ? 'cursor-pointer' : 'cursor-crosshair'
              }`}
          />
          {cameraModeActive && (
            <CameraModeOverlay
              onCapture={handleCameraModeCapture}
              onExit={exitCameraMode}
            />
          )}
          {!cameraModeActive && (
            <CameraControls
              setCameraOffset={setCameraOffset}
              setCameraZoom={setCameraZoom}
              defaultOffset={selectedLevelData?.camera?.offset}
            />
          )}
          {!cameraModeActive && (
            <>
              {!isTouchDeviceRef.current && hoveredTower && !selectedTower &&
                (() => {
                  const tower = towers.find((t) => t.id === hoveredTower);
                  if (!tower) return null;
                  return <TowerHoverTooltip tower={tower} position={mousePos} />;
                })()}
              {!isTouchDeviceRef.current && hoveredHero && hero && !hero.dead && (
                <HeroHoverTooltip hero={hero} position={mousePos} />
              )}
              {selectedTower &&
                (() => {
                  const tower = towers.find((t) => t.id === selectedTower);
                  if (!tower) return null;
                  const worldPos = gridToWorld(tower.pos);
                  const screenPos = worldToScreen(
                    worldPos,
                    width,
                    height,
                    dpr,
                    cameraOffset,
                    cameraZoom
                  );
                  return (
                    <TowerUpgradePanel
                      tower={tower}
                      screenPos={screenPos}
                      pawPoints={pawPoints}
                      upgradeTower={upgradeTower}
                      sellTower={sellTower}
                      onClose={() => setSelectedTower(null)}
                      onRetargetMissile={(towerId) => {
                        setMissileMortarTargetingId(towerId);
                        setSelectedTower(null);
                      }}
                      onToggleMissileAutoAim={(towerId) => {
                        setTowers((prev) =>
                          prev.map((t) =>
                            t.id === towerId
                              ? { ...t, mortarAutoAim: !t.mortarAutoAim }
                              : t
                          )
                        );
                      }}
                      onRallyTroops={(towerId) => {
                        setTroops((prev) =>
                          prev.map((t) => ({
                            ...t,
                            selected: t.ownerId === towerId,
                          }))
                        );
                        setSelectedTower(null);
                      }}
                    />
                  );
                })()}
              {placingTroop && <PlacingTroopIndicator />}
              {targetingSpell && <TargetingSpellIndicator spellType={targetingSpell} />}
              {activeSentinelTargetKey && (
                <div
                  className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide pointer-events-none"
                  style={{
                    zIndex: 180,
                    background: "rgba(69, 10, 10, 0.86)",
                    border: "1px solid rgba(251, 113, 133, 0.58)",
                    color: "#ffe4e6",
                    boxShadow: "0 0 18px rgba(244, 63, 94, 0.35)",
                  }}
                >
                  Imperial Sentinel targeting mode: click any map location.
                </div>
              )}
              {missileMortarTargetingId && (
                <div
                  className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide pointer-events-none"
                  style={{
                    zIndex: 180,
                    background: "rgba(74, 32, 0, 0.9)",
                    border: "1px solid rgba(255, 140, 0, 0.6)",
                    color: "#ffcc88",
                    boxShadow: "0 0 18px rgba(255, 100, 0, 0.35)",
                  }}
                >
                  Missile Battery targeting: click any map location to set strike zone.
                </div>
              )}
              {!isTouchDeviceRef.current && hoveredSpecialTower && (
                <SpecialBuildingTooltip
                  type={hoveredSpecialTower.type}
                  hp={hoveredSpecialTower.type === "vault" ? specialTowerHp : null}
                  maxHp={
                    hoveredSpecialTower.type === "vault"
                      ? getLevelSpecialTowerHp(selectedMap) ?? hoveredSpecialTower.hp
                      : hoveredSpecialTower.hp
                  }
                  position={mousePos}
                  sentinelTarget={
                    hoveredSpecialTower.type === "sentinel_nexus"
                      ? sentinelTargets[
                      getSpecialTowerKey(hoveredSpecialTower)
                      ] ?? null
                      : undefined
                  }
                  sentinelTargeting={
                    hoveredSpecialTower.type === "sentinel_nexus" &&
                    activeSentinelTargetKey ===
                    getSpecialTowerKey(hoveredSpecialTower)
                  }
                />
              )}
              {!isTouchDeviceRef.current && hoveredLandmark && !hoveredTower && !selectedTower && (
                <LandmarkTooltip landmarkType={hoveredLandmark} position={mousePos} />
              )}
              {!isTouchDeviceRef.current && hoveredHazardType && !hoveredTower && !selectedTower && (
                <HazardTooltip hazardType={hoveredHazardType} position={mousePos} />
              )}
              <EnemyInspector
                isActive={inspectorActive}
                setIsActive={setInspectorActive}
                selectedEnemy={selectedInspectEnemy}
                setSelectedEnemy={setSelectedInspectEnemy}
                enemies={enemies}
                troops={troops}
                setGameSpeed={(nextSpeed) => {
                  if (battleOutcome) return;
                  setGameSpeed(nextSpeed);
                }}
                previousGameSpeed={previousGameSpeed}
                setPreviousGameSpeed={setPreviousGameSpeed}
                gameSpeed={gameSpeed}
                onDeactivate={() => {
                  setSelectedInspectTroop(null);
                  setSelectedInspectHero(false);
                }}
              />
              {inspectorActive && selectedInspectEnemy && (() => {
                const enemyPos = getEnemyPosWithPath(selectedInspectEnemy, selectedMap);
                const screenPos = worldToScreen(
                  enemyPos,
                  width,
                  height,
                  dpr,
                  cameraOffset,
                  cameraZoom
                );
                return (
                  <EnemyDetailTooltip
                    enemy={selectedInspectEnemy}
                    position={screenPos}
                    onClose={() => setSelectedInspectEnemy(null)}
                  />
                );
              })()}
              {inspectorActive && selectedInspectTroop && (() => {
                const liveTroop = troops.find(t => t.id === selectedInspectTroop.id);
                if (!liveTroop) return null;
                const screenPos = worldToScreen(
                  liveTroop.pos,
                  width,
                  height,
                  dpr,
                  cameraOffset,
                  cameraZoom
                );
                return (
                  <TroopDetailTooltip
                    troop={liveTroop}
                    position={screenPos}
                    onClose={() => setSelectedInspectTroop(null)}
                  />
                );
              })()}
              {inspectorActive && selectedInspectHero && hero && (() => {
                const screenPos = worldToScreen(
                  hero.pos,
                  width,
                  height,
                  dpr,
                  cameraOffset,
                  cameraZoom
                );
                return (
                  <HeroDetailTooltip
                    hero={hero}
                    position={screenPos}
                    onClose={() => setSelectedInspectHero(false)}
                  />
                );
              })()}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 100 }}>
                <HeroSpellBar
                  hero={hero}
                  spells={spells}
                  pawPoints={pawPoints}
                  enemies={enemies}
                  spellUpgradeLevels={spellUpgradeLevels}
                  targetingSpell={targetingSpell}
                  placingTroop={placingTroop}
                  toggleHeroSelection={toggleHeroSelection}
                  onUseHeroAbility={triggerHeroAbility}
                  castSpell={castSpell}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {!cameraModeActive && (
        <div className="flex flex-col flex-shrink-0">
          <BuildMenu
            pawPoints={pawPoints}
            buildingTower={buildingTower}
            setBuildingTower={setBuildingTower}
            setIsBuildDragging={setIsBuildDragging}
            setHoveredBuildTower={setHoveredBuildTower}
            hoveredTower={hoveredTower}
            setHoveredTower={setHoveredTower}
            setDraggingTower={setDraggingTower}
            placedTowers={towers.reduce((acc, t) => {
              acc[t.type] = (acc[t.type] || 0) + 1;
              return acc;
            }, {} as Record<TowerType, number>)}
            allowedTowers={levelAllowedTowers}
          />
        </div>
      )}
      {!cameraModeActive && isVictory && (
        <VictoryScreen
          starsEarned={starsEarned}
          lives={lives}
          timeSpent={timeSpent}
          bestTime={currentLevelStats.bestTime}
          bestHearts={currentLevelStats.bestHearts}
          levelName={LEVEL_DATA[selectedMap]?.name || selectedMap}
          resetGame={resetGame}
          totalWaves={totalWaves}
          overlay
        />
      )}
      {!cameraModeActive && isDefeat && (
        <DefeatScreen
          resetGame={retryLevel}
          onBackToMap={quitLevel}
          timeSpent={timeSpent}
          waveReached={Math.min(currentWave + 1, totalWaves)}
          totalWaves={totalWaves}
          levelName={LEVEL_DATA[selectedMap]?.name || selectedMap}
          bestTime={currentLevelStats.bestTime}
          timesPlayed={currentLevelStats.timesPlayed || 1}
          overlay
        />
      )}
    </div>
  );
}
