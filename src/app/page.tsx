"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Decoration,
} from "./types";
// Constants
import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  GROUP_SPACING_MULTIPLIER,
  WAVE_INTERVAL_MULTIPLIER,
  WAVE_DELAY_MULTIPLIER,
  TOWER_DATA,
  ENEMY_DATA,
  HERO_DATA,
  SPELL_DATA,
  MAP_PATHS,
  WAVES,
  LEVEL_WAVES,
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
} from "./constants";
// Utils
import {
  gridToWorld,
  gridToWorldPath,
  worldToScreen,
  screenToWorld,
  screenToGrid,
  distance,
  distanceToLineSegment,
  closestPointOnLine,
  getEnemyPosition,
  isValidBuildPosition,
  generateId,
  getPathSegmentLength,
  findClosestPathPoint,
  findClosestPathPointWithinRadius,
  getTroopMoveInfo,
  type TroopMoveInfo,
  LANDMARK_DECORATION_TYPES,
  LANDMARK_HITBOX_Y_OFFSET,
} from "./utils";
// Tower Stats
import { calculateTowerStats, getUpgradeCost } from "./constants/towerStats";
// Rendering
import {
  renderTower,
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
} from "./rendering";
// Decoration rendering
import { renderDecorationItem } from "./rendering/decorations";
// Hazard game logic
import { calculateHazardEffects, applyHazardEffect } from "./game/hazards";

// Dinky Station spawn management constants
const MAX_STATION_TROOPS = 3;
const TROOP_RESPAWN_TIME = 5000; // 5 seconds
const TROOP_SEPARATION_DIST = 35; // Minimum distance between troops
const TROOP_SIGHT_RANGE = 180; // Base sight range for melee troops (increased)
const TROOP_RANGED_SIGHT_RANGE = 280; // Extended sight range for ranged troops (centaur, cavalry) (increased)
const HERO_SIGHT_RANGE = 150; // How far hero can see enemies
const HERO_RANGED_SIGHT_RANGE = 220; // Extended sight for Rocky (ranged hero)
const COMBAT_RANGE = 50; // Range at which units stop to fight
const MELEE_RANGE = 60; // Close range where ranged units switch to melee
const FORMATION_SPACING = 30; // Distance between troops in formation
const ENEMY_SPEED_MODIFIER = 1.25; // Global enemy speed multiplier (slower enemies)

// Helper to get enemy position using their pathKey for dual-path support
const getEnemyPosWithPath = (enemy: Enemy, defaultMap: string): Position => {
  const pathKey = enemy.pathKey || defaultMap;
  const basePos = getEnemyPosition(enemy, pathKey);
  // Apply taunt offset if enemy is being taunted and moving toward hero
  if (enemy.tauntOffset) {
    return {
      x: basePos.x + enemy.tauntOffset.x,
      y: basePos.y + enemy.tauntOffset.y,
    };
  }
  return basePos;
};

// Formation offsets relative to rally point (triangle pattern)
// Spacing should be > TROOP_SEPARATION_DIST (35) to prevent clustering/vibration
const getFormationOffsets = (count: number): Position[] => {
  if (count === 1) {
    return [{ x: 0, y: 0 }];
  } else if (count === 2) {
    // Line formation - spread apart more to avoid separation force fighting
    return [
      { x: -22, y: -12 },
      { x: 22, y: 12 },
    ];
  } else {
    // Triangle formation - larger spacing to prevent vibration
    return [
      { x: 0, y: -28 }, // Front (tip of triangle)
      { x: -28, y: 18 }, // Back left
      { x: 28, y: 18 }, // Back right
    ];
  }
};

// Dynamic tower hitbox calculation based on tower type and level
// Tower heights grow with level, so hitboxes should too
const getTowerHitboxRadius = (tower: Tower, zoom: number = 1): number => {
  const level = tower.level;
  let baseWidth: number;
  let baseHeight: number;

  switch (tower.type) {
    case "cannon":
      baseWidth = 36 + level * 5;
      baseHeight = 24 + level * 10;
      break;
    case "lab":
    case "library":
      baseWidth = 34 + level * 5;
      baseHeight = 30 + level * 10;
      break;
    case "arch":
      baseWidth = 32 + level * 4;
      baseHeight = 28 + level * 8;
      break;
    case "club":
      baseWidth = 38 + level * 5;
      baseHeight = 32 + level * 10;
      break;
    case "station":
      // Station has wider base dimensions
      baseWidth = 56 + level * 6;
      baseHeight = 40 + level * 12;
      break;
    default:
      baseWidth = 36 + level * 5;
      baseHeight = 24 + level * 10;
  }

  // Calculate hitbox as a combination of width and height
  // Wider for X, taller for Y - we use the larger dimension for a circular hitbox
  // Scale by zoom and add a base minimum
  const hitboxSize = Math.max(baseWidth * 0.5, baseHeight * 0.4) * zoom;
  return Math.max(25, Math.min(hitboxSize, 60)); // Clamp between 25-60 pixels
};

// Components
import { WorldMap } from "./components/menus/WorldMap";
import { VictoryScreen } from "./components/menus/VictoryScreen";
import { DefeatScreen } from "./components/menus/DefeatScreen";
import {
  TopHUD,
  CameraControls,
  HeroSpellBar,
  BuildMenu,
  TowerUpgradePanel,
  Tooltip,
  TowerHoverTooltip,
  BuildTowerTooltip,
  PlacingTroopIndicator,
  SpecialBuildingTooltip,
  LandmarkTooltip,
  HazardTooltip,
  EnemyInspector,
  EnemyDetailTooltip,
} from "./components/ui/GameUI";
// Hooks
import { useGameProgress } from "./useLocalStorage";

// Helper to parse hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : { r: 0, g: 0, b: 0 };
};

// Helper to create rgba from hex and alpha
const hexToRgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper to get waves for current level
const getLevelWaves = (levelId: string) => {
  return LEVEL_WAVES[levelId] || WAVES;
};

export default function PrincetonTowerDefense() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("menu");
  const [selectedMap, setSelectedMap] = useState<string>("poe");
  const [selectedHero, setSelectedHero] = useState<HeroType | null>("tiger");
  const [selectedSpells, setSelectedSpells] = useState<SpellType[]>([]);

  // Persistent progress (saved to localStorage)
  const { progress, updateLevelStars, updateLevelStats, unlockLevel } =
    useGameProgress();
  const unlockedMaps = progress.unlockedMaps;
  const levelStars = progress.levelStars as LevelStars;
  const levelStats = progress.levelStats;

  const [starsEarned, setStarsEarned] = useState(0);
  const [levelStartTime, setLevelStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  // Game resources
  const [pawPoints, setPawPoints] = useState(INITIAL_PAW_POINTS);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [currentWave, setCurrentWave] = useState(0);
  const [nextWaveTimer, setNextWaveTimer] = useState(WAVE_TIMER_BASE);
  const [waveInProgress, setWaveInProgress] = useState(false);
  // Game entities
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [hero, setHero] = useState<Hero | null>(null);
  const [troops, setTroops] = useState<Troop[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
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
  const [hoveredBuildTower, setHoveredBuildTower] = useState<TowerType | null>(
    null
  );
  const [hoveredHero, setHoveredHero] = useState(false);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [buildingTower, setBuildingTower] = useState<TowerType | null>(null);
  const [draggingTower, setDraggingTower] = useState<DraggingTower | null>(
    null
  );
  const [placingTroop, setPlacingTroop] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [hoveredSpecial, setHoveredSpecial] = useState<boolean>(false);
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);
  const [hoveredHazardType, setHoveredHazardType] = useState<string | null>(null);
  // Enemy Inspector state
  const [inspectorActive, setInspectorActive] = useState(false);
  const [selectedInspectEnemy, setSelectedInspectEnemy] = useState<Enemy | null>(null);
  const [previousGameSpeed, setPreviousGameSpeed] = useState(1);
  const [hoveredInspectEnemy, setHoveredInspectEnemy] = useState<string | null>(null);
  // Troop/Hero movement target indicator state
  const [moveTargetPos, setMoveTargetPos] = useState<Position | null>(null);
  const [moveTargetValid, setMoveTargetValid] = useState(false);
  const [selectedUnitMoveInfo, setSelectedUnitMoveInfo] = useState<TroopMoveInfo | null>(null);
  // Camera panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position | null>(null);
  const [panStartOffset, setPanStartOffset] = useState<Position | null>(null);
  // Tower repositioning state (drag existing towers to move them)
  const [repositioningTower, setRepositioningTower] = useState<string | null>(null);
  const [repositionPreviewPos, setRepositionPreviewPos] = useState<Position | null>(null);
  // Camera - start more zoomed in and centered
  const [cameraOffset, setCameraOffset] = useState<Position>({
    x: -40,
    y: -60,
  });
  const [cameraZoom, setCameraZoom] = useState(1.5);
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchTimeRef = useRef<number>(0); // Track touch to prevent duplicate click events
  const isTouchDeviceRef = useRef<boolean>(false); // Track if user is using touch input
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // PERFORMANCE FIX: Use refs for game loop callbacks to prevent loop restart on state changes
  // Without this, selecting a troop/hero causes the game loop useEffect to re-run,
  // which cancels the animation frame and causes a noticeable freeze on mobile devices
  const updateGameRef = useRef<(deltaTime: number) => void>(() => { });
  const renderRef = useRef<() => void>(() => { });
  // Guard ref to prevent duplicate defeat/victory handling across animation frames
  const gameEndHandledRef = useRef(false);

  // PERFORMANCE FIX: Cache decorations to avoid regenerating them every frame
  // This was causing major performance issues on mobile - generating 500+ decorations per frame
  const cachedDecorationsRef = useRef<{ mapKey: string; decorations: Decoration[] } | null>(null);

  // Wave Management Refs
  const spawnIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Pausable timer system - tracks remaining time when paused
  const gameSpeedRef = useRef(gameSpeed);
  gameSpeedRef.current = gameSpeed;
  const pausedAtRef = useRef<number | null>(null);
  // Track pausable timeouts: { id, callback, remainingTime, startedAt }
  const pausableTimeoutsRef = useRef<Array<{
    id: number;
    callback: () => void;
    remainingTime: number;
    startedAt: number;
    timeoutId: NodeJS.Timeout | null;
  }>>([]);
  const pausableTimeoutIdCounter = useRef(0);

  // Refs for current state values to avoid stale closures in callbacks
  const towersRef = useRef(towers);
  const pawPointsRef = useRef(pawPoints);
  towersRef.current = towers;
  pawPointsRef.current = pawPoints;

  // Track last spawn time for frontier barracks to prevent double-spawning on restart
  const lastBarracksSpawnRef = useRef<number>(0);
  // Track when game was reset to prevent stale state race conditions
  const gameResetTimeRef = useRef<number>(0);

  // Get current level waves - computed from selectedMap
  const currentLevelWaves = getLevelWaves(selectedMap);
  const totalWaves = currentLevelWaves.length;

  // Compute blocked positions (landmarks and special towers) - computed from selectedMap
  // These positions cannot have player towers placed on them
  const blockedPositions = React.useMemo(() => {
    const levelData = LEVEL_DATA[selectedMap];
    const blocked = new Set<string>();

    // Add landmark decoration positions
    if (levelData?.decorations) {
      for (const deco of levelData.decorations) {
        const decorType = deco.category || deco.type;
        if (decorType && LANDMARK_DECORATION_TYPES.has(decorType)) {
          // Block the decoration position and surrounding cells based on size
          const size = deco.size || 1;
          const baseX = Math.floor(deco.pos.x);
          const baseY = Math.floor(deco.pos.y);

          // Block a grid area around the landmark based on its size
          const range = Math.ceil(size);
          for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
              blocked.add(`${baseX + dx},${baseY + dy}`);
            }
          }
        }
      }
    }

    // Add special tower position (beacon, vault, shrine, barracks)
    if (levelData?.specialTower) {
      const spec = levelData.specialTower;
      const baseX = Math.floor(spec.pos.x);
      const baseY = Math.floor(spec.pos.y);
      // Block a 3x3 area around special buildings
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          blocked.add(`${baseX + dx},${baseY + dy}`);
        }
      }
    }

    return blocked;
  }, [selectedMap]);

  // Helper to get canvas dimensions
  const getCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    return {
      width: canvas ? canvas.width : 1000,
      height: canvas ? canvas.height : 600,
      dpr,
    };
  }, []);

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
  const MAX_EFFECTS = 50;
  const PARTICLE_THROTTLE_MS = 50; // Minimum time between particle spawns at same position
  const lastParticleSpawn = useRef<Map<string, number>>(new Map());
  const particleUpdateAccumulator = useRef<number>(0); // Accumulate time between particle updates for throttling
  const effectsUpdateAccumulator = useRef<number>(0); // Accumulate time between effects updates for throttling

  // Add particles helper - with performance limits
  const addParticles = useCallback(
    (pos: Position, type: Particle["type"], count: number) => {
      // Throttle particles at similar positions
      const posKey = `${Math.round(pos.x / 20)}_${Math.round(pos.y / 20)}_${type}`;
      const now = Date.now();
      const lastSpawn = lastParticleSpawn.current.get(posKey) || 0;
      if (now - lastSpawn < PARTICLE_THROTTLE_MS) {
        return; // Skip if recently spawned at this location
      }
      lastParticleSpawn.current.set(posKey, now);

      // Clean up old throttle entries periodically
      if (lastParticleSpawn.current.size > 100) {
        const entries = Array.from(lastParticleSpawn.current.entries());
        entries.slice(0, 50).forEach(([key]) => lastParticleSpawn.current.delete(key));
      }

      const newParticles: Particle[] = [];
      const colors = PARTICLE_COLORS[type] || PARTICLE_COLORS.spark;
      // Reduce particle count when there are many enemies/effects
      const actualCount = Math.min(count, Math.max(2, Math.floor(count * 0.7)));

      for (let i = 0; i < actualCount; i++) {
        const angle = (Math.PI * 2 * i) / actualCount + Math.random() * 0.5;
        const speed =
          type === "explosion" ? 2 + Math.random() * 3 : 1 + Math.random() * 2;
        newParticles.push({
          id: generateId("particle"),
          pos: { ...pos },
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed - (type === "explosion" ? 1 : 0),
          },
          life: 400 + Math.random() * 300, // Shorter particle life for performance
          maxLife: 700,
          size: type === "smoke" ? 8 : type === "explosion" ? 6 : 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: type === "explosion" ? "spark" : (type as any),
        });
      }
      setParticles((prev) => {
        // Hard cap on total particles - remove oldest if over limit
        const combined = [...prev, ...newParticles];
        if (combined.length > MAX_PARTICLES) {
          return combined.slice(combined.length - MAX_PARTICLES);
        }
        return combined;
      });
    },
    []
  );

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
      setPawPoints((pp) => pp + totalBounty);
      return totalBounty;
    },
    []
  );

  // Keyboard controls for camera
  useEffect(() => {
    if (gameState !== "playing") return;
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
          // Unselect all towers, heroes, and troops
          setSelectedTower(null);
          setHero((prev) => (prev ? { ...prev, selected: false } : null));
          setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Reset game state when starting a new game (entering "playing" state)
  useEffect(() => {
    if (gameState === "playing") {
      clearAllTimers();
      // Get level-specific starting resources
      const levelData = LEVEL_DATA[selectedMap];
      const levelStartingPawPoints = levelData?.startingPawPoints ?? INITIAL_PAW_POINTS;

      // Reset all game state for a fresh start
      setPawPoints(levelStartingPawPoints);
      setLives(INITIAL_LIVES);
      setCurrentWave(0);
      setNextWaveTimer(WAVE_TIMER_BASE);
      setWaveInProgress(false);
      setTowers([]);
      setEnemies([]);
      setHero(null); // Will be re-initialized by the hero effect
      setTroops([]);
      setProjectiles([]);
      setEffects([]);
      setParticles([]);
      setSelectedTower(null);
      setBuildingTower(null);
      setDraggingTower(null);
      setPlacingTroop(false);
      setSpells([]);
      setGameSpeed(1);
      setGoldSpellActive(false);
      if (levelData?.specialTower?.hp) {
        setSpecialTowerHp(levelData.specialTower.hp);
      } else {
        setSpecialTowerHp(null);
      }
      // Reset pausable timer system state
      prevGameSpeedRef.current = 1;
      pausedAtRef.current = null;
      pausableTimeoutsRef.current = [];
      // Reset spawn timing refs
      lastBarracksSpawnRef.current = 0;
      // Mark reset time to prevent stale state race conditions
      gameResetTimeRef.current = Date.now();
    }
  }, [gameState, clearAllTimers, selectedMap]);

  // Clear all timers when leaving the playing state (defeat, victory, quit)
  useEffect(() => {
    if (gameState !== "playing") {
      clearAllTimers();
    }
  }, [gameState, clearAllTimers]);

  // Initialize hero and spells when game starts
  useEffect(() => {
    if (gameState === "playing" && selectedHero && !hero) {
      const heroData = HERO_DATA[selectedHero];
      const path = MAP_PATHS[selectedMap];
      // Spawn hero at the END of the path (where they defend)
      // Use path.length - 3 to get a visible position near the exit
      const endIndex = Math.max(0, path.length - 4);
      const startPos = gridToWorldPath(path[endIndex]);
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
        attackAnim: 0,
        selected: false,
        dead: false,
        respawnTimer: 0,
      });
      setSpells(
        selectedSpells.map((type) => ({
          type,
          cooldown: 0,
          maxCooldown: SPELL_DATA[type].cooldown,
        }))
      );
      setNextWaveTimer(WAVE_TIMER_BASE);
      setLevelStartTime(Date.now());
      setTimeSpent(0);
      // Set camera to level-specific settings
      const levelSettings = LEVEL_DATA[selectedMap];
      if (levelSettings?.camera) {
        setCameraOffset(levelSettings.camera.offset);
        setCameraZoom(levelSettings.camera.zoom);
      }
    }
  }, [gameState, selectedHero, hero, selectedSpells, selectedMap]);
  // Resize canvas - NO ctx.scale here, we handle DPR in render
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const dpr = window.devicePixelRatio || 1;
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
  }, [gameState]);

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
      // Just resumed - resume all timeouts
      resumeAllTimeouts();
    }
  }, [gameSpeed, pauseAllTimeouts, resumeAllTimeouts]);

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
    let cumulativeDelay = 0;
    wave.forEach((group) => {
      cumulativeDelay += (group.delay || 0) * WAVE_DELAY_MULTIPLIER * GROUP_SPACING_MULTIPLIER;
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
          // Complex marching formations based on enemy type and group size
          // Creates wedge, line, staggered, and diamond patterns
          const formationPatterns = {
            // V-formation (wedge) - good for bosses and elites
            wedge: (i: number, total: number) => {
              const mid = Math.floor(total / 2);
              const offset = i - mid;
              return Math.abs(offset) * 0.15 * Math.sign(offset);
            },
            // Staggered lines - for regular troops
            staggered: (i: number) => {
              const row = Math.floor(i / 3);
              const col = i % 3;
              return (col - 1) * 0.4 + (row % 2 === 0 ? 0.1 : -0.1);
            },
            // Diamond formation
            diamond: (i: number, total: number) => {
              const phase = (i / total) * Math.PI * 2;
              return Math.sin(phase) * 0.6;
            },
            // Tight cluster for swarms
            cluster: (i: number) => {
              return (Math.random() - 0.5) * 0.8;
            },
          };

          // Select formation based on enemy type
          let laneOffset: number;
          if (
            group.type === "trustee" ||
            group.type === "dean" ||
            group.type === "golem" ||
            group.type === "necromancer" ||
            group.type === "shadow_knight" ||
            group.type === "juggernaut" ||
            group.type === "dragon" ||
            group.type === "sandworm"
          ) {
            // Bosses and tanks use wedge formation - they lead the charge
            laneOffset = formationPatterns.wedge(spawned, group.count);
          } else if (
            group.type === "harpy" ||
            group.type === "mascot" ||
            group.type === "wyvern" ||
            group.type === "specter" ||
            group.type === "berserker" ||
            group.type === "assassin" ||
            group.type === "frostling" ||
            group.type === "banshee"
          ) {
            // Fast/flying enemies use diamond formation - scattered chaos
            laneOffset = formationPatterns.diamond(spawned, group.count);
          } else if (
            group.type === "cultist" ||
            group.type === "frosh" ||
            group.type === "plaguebearer" ||
            group.type === "thornwalker" ||
            group.type === "infernal"
          ) {
            // Swarm enemies use cluster formation - tight groups
            laneOffset = formationPatterns.cluster(spawned);
          } else if (group.count > 5) {
            // Large groups use staggered lines - organized march
            laneOffset = formationPatterns.staggered(spawned);
          } else {
            // Default wedge
            laneOffset = formationPatterns.wedge(spawned, group.count);
          }

          // Add slight randomness to prevent perfect alignment
          laneOffset += (Math.random() - 0.5) * 0.35;
          laneOffset = Math.max(-0.9, Math.min(0.9, laneOffset));

          // Check for dual-path levels
          const levelData = LEVEL_DATA[selectedMap];
          const isDualPath = levelData?.dualPath && levelData?.secondaryPath;
          // Alternate between paths for dual-path levels
          const useSecondaryPath = isDualPath && spawned % 2 === 1;
          const pathKey = useSecondaryPath
            ? levelData.secondaryPath
            : selectedMap;

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
            slowed: false,
            slowIntensity: 0,
            pathKey: pathKey, // Track which path this enemy uses
          };
          setEnemies((prev) => [...prev, enemy]);
          spawned++;
        }, group.interval * WAVE_INTERVAL_MULTIPLIER);
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
      accDelay += (g.delay || 0) * WAVE_DELAY_MULTIPLIER * GROUP_SPACING_MULTIPLIER;
      return accDelay + g.count * g.interval * WAVE_INTERVAL_MULTIPLIER;
    })) + 5000;
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
  }, [waveInProgress, currentWave, selectedMap, setPausableTimeout]);
  // Helper to apply enemy abilities to a target (troop or hero)
  const applyEnemyAbilities = useCallback((
    enemy: Enemy,
    targetType: 'troop' | 'hero',
    now: number
  ): {
    burn?: { damage: number; duration: number };
    slow?: { intensity: number; duration: number };
    poison?: { damage: number; duration: number };
    stun?: { duration: number };
  } | null => {
    const eData = ENEMY_DATA[enemy.type];
    if (!eData.abilities || eData.abilities.length === 0) return null;

    // Check if enemy can use ability (cooldown)
    const abilityCooldown = eData.abilities[0]?.cooldown || 2000;
    if (enemy.lastAbilityUse && now - enemy.lastAbilityUse < abilityCooldown) {
      return null;
    }

    const result: {
      burn?: { damage: number; duration: number };
      slow?: { intensity: number; duration: number };
      poison?: { damage: number; duration: number };
      stun?: { duration: number };
    } = {};

    for (const ability of eData.abilities) {
      // Only apply abilities that affect troops/heroes (not tower abilities)
      if (ability.type.startsWith('tower_')) continue;

      // Check if ability triggers (based on chance)
      const chance = ability.chance || 0.3;
      if (Math.random() > chance) continue;

      switch (ability.type) {
        case 'burn':
          result.burn = {
            damage: ability.intensity || 5,
            duration: ability.duration || 3000,
          };
          break;
        case 'slow':
          result.slow = {
            intensity: ability.intensity || 0.3,
            duration: ability.duration || 2000,
          };
          break;
        case 'poison':
          result.poison = {
            damage: ability.intensity || 3,
            duration: ability.duration || 4000,
          };
          break;
        case 'stun':
          result.stun = {
            duration: ability.duration || 1500,
          };
          break;
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }, []);

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
      const mapData = LEVEL_DATA[selectedMap];
      const spec = mapData?.specialTower;
      const specWorldPos = spec ? gridToWorld(spec.pos) : null;

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
          const isBeaconNearby =
            spec?.type === "beacon" && distance(tWorldPos, specWorldPos!) < 250;
          if (isBeaconNearby) {
            rangeMultiplier *= 1.2;
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

          const hasAnyBuff = rangeMultiplier > 1.0 || damageMultiplier > 1.0;

          return {
            ...t,
            rangeBoost: rangeMultiplier,
            damageBoost: damageMultiplier,
            isBuffed: hasAnyBuff,
            // Clear boostEnd if Scott's buff expired
            boostEnd: isScottActive ? t.boostEnd : undefined,
          };
        })
      );

      // =========================================================================
      // HAZARD LOGIC - Using imported hazard game logic functions
      // =========================================================================
      if (LEVEL_DATA[selectedMap]?.hazards) {
        const hazards = LEVEL_DATA[selectedMap].hazards!;

        // Calculate hazard effects using the imported function
        const { effects: hazardEffects, particles: hazardParticles } = calculateHazardEffects(
          hazards,
          enemies,
          deltaTime,
          (enemy) => getEnemyPosWithPath(enemy, selectedMap)
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
      if (LEVEL_DATA[selectedMap]?.specialTower) {
        const spec = LEVEL_DATA[selectedMap].specialTower;
        const specWorldPos = gridToWorld(spec.pos);

        // A. BEACON: Range buff is now handled in DYNAMIC BUFF REGISTRATION above
        // which properly stacks with Investment Bank range buffs

        // B. SHRINE: Periodic HP Pulse for Hero and Troops
        if (spec.type === "shrine" && now % 5000 < deltaTime) {
          const healRadius = 200;
          const healAmount = 50;

          // Heal Hero
          if (
            hero &&
            !hero.dead &&
            distance(hero.pos, specWorldPos) < healRadius
          ) {
            setHero((prev) =>
              prev
                ? { ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount), healFlash: Date.now() }
                : null
            );
            addParticles(hero.pos, "magic", 10);
          }
          // Heal Troops - uses heal aura effect instead of magic particles
          setTroops((prev) =>
            prev.map((t) => {
              if (distance(t.pos, specWorldPos) < healRadius) {
                return { ...t, hp: Math.min(t.maxHp, t.hp + healAmount), healFlash: Date.now() };
              }
              return t;
            })
          );
          // Visual pulse effect
          setEffects((ef) => [
            ...ef,
            {
              id: generateId("shrine"),
              pos: specWorldPos,
              type: "arcaneField",
              progress: 0,
              size: healRadius,
            },
          ]);
        }

        // C. BARRACKS: Capped & Spread Deployment (max 3 knights)
        // Align spawn timing with the visual glow animation (12-second cycle, spawn in first 1.5 seconds)
        if (spec.type === "barracks" && !isInResetTransition) {
          const barracksTroops = troops.filter(
            (t) => t.ownerId === "special_barracks"
          );

          // Match the visual cycle from specialBuildings.ts rendering
          const spawnCycle = now % 12000;
          const isInSpawnWindow = spawnCycle < 1500;
          const wasInSpawnWindow = lastBarracksSpawnRef.current > 0 &&
            (lastBarracksSpawnRef.current % 12000) < 1500;

          // Only spawn at the START of the spawn window (when transitioning into it)
          // or if this is the first spawn (lastBarracksSpawnRef is 0)
          const justEnteredSpawnWindow = isInSpawnWindow &&
            (lastBarracksSpawnRef.current === 0 || !wasInSpawnWindow || (now - lastBarracksSpawnRef.current) > 10500);

          if (justEnteredSpawnWindow && barracksTroops.length < 3) {
            // Update last spawn time
            lastBarracksSpawnRef.current = now;

            // Helper to find closest road point
            const findBarracksRoadPoint = (pos: Position): Position => {
              const path = MAP_PATHS[selectedMap];
              const secondaryPath = MAP_PATHS[`${selectedMap}_b`] || null;
              const fullPath = secondaryPath ? path.concat(secondaryPath) : path;
              if (!fullPath || fullPath.length < 2) return pos;

              let closestPoint: Position = pos;
              let minDist = Infinity;
              for (let i = 0; i < fullPath.length - 1; i++) {
                const p1 = gridToWorldPath(fullPath[i]);
                const p2 = gridToWorldPath(fullPath[i + 1]);
                const roadPoint = closestPointOnLine(pos, p1, p2);
                const dist = distance(pos, roadPoint);
                if (dist < minDist) {
                  minDist = dist;
                  closestPoint = roadPoint;
                }
              }
              return closestPoint;
            };

            // Find rally point from existing barracks troops (user-selected position) or use road near barracks
            const existingRallyTroop = barracksTroops.find((t) => t.userTargetPos);
            const rallyPoint = existingRallyTroop?.userTargetPos || findBarracksRoadPoint(specWorldPos);

            // Find available slot
            const occupiedSlots = new Set(barracksTroops.map((t) => t.spawnSlot ?? 0));
            const availableSlot = [0, 1, 2].find((slot) => !occupiedSlots.has(slot)) ?? barracksTroops.length;

            // Calculate formation position (like dinky station)
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
              ownerType: "barracks", // Blue themed knight
              type: "knight",
              pos: { ...specWorldPos }, // START at building center
              hp: TROOP_DATA.knight.hp,
              maxHp: TROOP_DATA.knight.hp,
              moving: true, // Movement engine will walk them to the path
              targetPos: targetPos,
              userTargetPos: targetPos,
              lastAttack: 0,
              rotation: Math.atan2(
                targetPos.y - specWorldPos.y,
                targetPos.x - specWorldPos.x
              ),
              attackAnim: 0,
              selected: false,
              spawnPoint: rallyPoint, // Anchor move radius to the rally point
              moveRadius: 220, // Increased range for frontier barracks
              spawnSlot: availableSlot,
            };

            // Also update existing barracks troops to reposition in new formation
            setTroops((prev) => {
              const currentBarracksTroops = prev.filter((t) => t.ownerId === "special_barracks");
              const troopIdToFormationIndex = new Map<string, number>();
              currentBarracksTroops.forEach((t, idx) => {
                troopIdToFormationIndex.set(t.id, idx);
              });

              const updated = prev.map((t) => {
                if (t.ownerId === "special_barracks") {
                  const newFormation = getFormationOffsets(futureCount);
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
                      spawnPoint: rallyPoint,
                    };
                  }
                }
                return t;
              });
              return [...updated, newTroop];
            });
            addParticles(specWorldPos, "smoke", 12);
          }
        }

        // D. VAULT: Immobile Troop Logic (Targetable by Enemies)
        if (spec.type === "vault" && specialTowerHp !== null && specialTowerHp > 0) {
          // Enemies find the vault as a combat target - skip attacks when paused
          enemies.forEach((e) => {
            const ePos = getEnemyPosWithPath(e, selectedMap);
            if (distance(ePos, specWorldPos) < 60) {
              // Enemy stops to "attack" the vault - skip when paused
              const effectiveEnemyAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
              if (!isPaused && now - (e.lastTroopAttack || 0) > effectiveEnemyAttackInterval) {
                const dmg = 20;
                setSpecialTowerHp((prev) => {
                  // Skip if vault already destroyed
                  if (prev === null || prev <= 0) return prev;
                  const newVal = prev - dmg;
                  if (newVal <= 0) {
                    // Only subtract lives once when transitioning to destroyed
                    setLives((l) => Math.max(0, l - 5));
                    addParticles(specWorldPos, "explosion", 40);
                    return 0;
                  }
                  return newVal;
                });
                setEnemies((prev) =>
                  prev.map((en) =>
                    en.id === e.id
                      ? { ...en, inCombat: true, lastTroopAttack: now }
                      : en
                  )
                );
              }
            }
          });
          // If HP hit 0, objective failed
          if (specialTowerHp <= 0) setSpecialTowerHp(null);
        }
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
                      let updated = { ...h, hp: Math.max(0, h.hp - 20), lastCombatTime: Date.now() };

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
                  };
                }
                return { ...enemy, inCombat: true, combatTarget: hero.id };
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
              spec?.type === "vault" &&
              specialTowerHp !== null &&
              specialTowerHp > 0 &&
              specWorldPos
            ) {
              if (distance(enemyPos, specWorldPos) < 70) {
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
                      addParticles(specWorldPos, "explosion", 40);
                      return 0;
                    }
                    return newVal;
                  });
                  setVaultFlash(150);
                  addParticles(specWorldPos, "smoke", 3);
                  return {
                    ...enemy,
                    inCombat: true,
                    combatTarget: "vault_objective",
                    lastTroopAttack: now,
                  };
                }
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: "vault_objective",
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
                if (!hero.shieldActive) {
                  // Apply damage and enemy abilities to hero
                  const abilities = applyEnemyAbilities(enemy, 'hero', now);
                  setHero((h) => {
                    if (!h) return null;
                    let updated = { ...h, hp: Math.max(0, h.hp - 20), lastCombatTime: Date.now() };

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
                    hero.pos.y - enemyPos.y,
                    hero.pos.x - enemyPos.x
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
                      pos: { x: (enemyPos.x + hero.pos.x) / 2, y: (enemyPos.y + hero.pos.y) / 2 },
                      type: effectType,
                      progress: 0,
                      size: 40,
                      slashAngle: attackAngle,
                      attackerType: "enemy",
                    },
                  ]);
                } else {
                  addParticles(hero.pos, "spark", 5); // Visual feedback of "Blocked"
                }
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: nearbyHero.id,
                  lastHeroAttack: now,
                };
              }

              return { ...enemy, inCombat: true, combatTarget: nearbyHero.id };
            }

            // Troop Combat Check - skip if enemy has breakthrough or is flying
            const enemyData = ENEMY_DATA[enemy.type];
            const canEngageTroops = !enemyData.flying && !enemyData.breakthrough;
            const nearbyTroop = canEngageTroops ? troops.find(
              (t) => distance(enemyPos, t.pos) < 60
            ) : null;
            if (nearbyTroop) {
              return { ...enemy, inCombat: true, combatTarget: nearbyTroop.id };
            }

            // Movement logic - normalize speed by segment length for consistent world-space speed
            if (!enemy.inCombat) {
              const pathKey = enemy.pathKey || selectedMap;
              const path = MAP_PATHS[pathKey];
              const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
              // Get segment length to normalize movement speed
              const segmentLength = getPathSegmentLength(enemy.pathIndex, pathKey);
              // Scale speed by TILE_SIZE to convert from old progress-based system to pixel-based
              // Then divide by actual segment length for consistent world-space speed
              const progressIncrement = (enemy.speed * speedMult * deltaTime * TILE_SIZE) / 200 / segmentLength;
              const newProgress = enemy.progress + progressIncrement;
              if (newProgress >= 1 && enemy.pathIndex < path.length - 1) {
                return {
                  ...enemy,
                  pathIndex: enemy.pathIndex + 1,
                  progress: 0,
                };
              } else if (newProgress >= 1) {
                // Use liveCost from enemy data, default to 1
                const liveCost = ENEMY_DATA[enemy.type].liveCost || 1;
                setLives((l) => Math.max(0, l - liveCost));
                return null as any;
              } else {
                return { ...enemy, progress: newProgress };
              }
            }
            return { ...enemy, inCombat: false };
          })
          .filter(Boolean)
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
            const path = MAP_PATHS[selectedMap];
            // Respawn at end of path (same as initial spawn)
            const endIndex = Math.max(0, path.length - 4);
            const startPos = gridToWorldPath(path[endIndex]);
            return {
              ...prev,
              dead: false,
              respawnTimer: 0,
              hp: prev.maxHp,
              pos: startPos,
              rotation: Math.PI, // Face towards enemies
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

          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);

          // Check if hero is nearby (hero takes combat priority over troops)
          const heroNearby =
            hero && !hero.dead && distance(enemyPos, hero.pos) < 60;
          if (heroNearby) return; // Hero will handle this enemy

          // Check for nearby troop
          const nearbyTroop = troops.find((t) => distance(enemyPos, t.pos) < 60);
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
          // Only process flying enemies that can target troops
          if (!flyingData.flying || !flyingData.targetsTroops) return;

          const attackSpeed = flyingData.troopAttackSpeed || 2000;
          const effectiveAttackInterval = gameSpeed > 0 ? attackSpeed / gameSpeed : attackSpeed;
          if (now - enemy.lastTroopAttack <= effectiveAttackInterval) return;

          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);

          // Flying enemies can attack troops within a larger range (swooping attacks)
          const attackRange = 80;
          const nearbyTroop = troops.find((t) => distance(enemyPos, t.pos) < attackRange);
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
          if (troop.ownerId && troop.ownerId !== "spell") {
            deathsToQueue.push({
              ownerId: troop.ownerId,
              slot: troop.spawnSlot ?? 0,
              respawnPos: troop.userTargetPos || troop.spawnPoint,
              troopType: troop.type,
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

              let updatedTroop = { ...troop };

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
        setTowers((prevTowers) =>
          prevTowers.map((t) => {
            const deaths = deathsToQueue.filter((d) => d.ownerId === t.id);
            if (deaths.length === 0) return t;

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
                const baseBounty = ENEMY_DATA[enemy.type].bounty;
                awardBounty(baseBounty, enemy.goldAura || false, enemy.id);
                addParticles(
                  getEnemyPosWithPath(enemy, selectedMap),
                  "explosion",
                  8
                );
                if (enemy.goldAura) addParticles(getEnemyPosWithPath(enemy, selectedMap), "gold", 6);
                return null as any;
              }
              enemy = { ...enemy, hp: newHp };
            } else if (
              enemy.burning &&
              enemy.burnUntil &&
              now >= enemy.burnUntil
            ) {
              enemy = { ...enemy, burning: false, burnDamage: 0, burnUntil: 0 };
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
            // Check for nearby hero combat
            const nearbyHero =
              hero &&
                !hero.dead &&
                distance(getEnemyPosWithPath(enemy, selectedMap), hero.pos) <
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
                };
              }
              return {
                ...enemy,
                inCombat: true,
                combatTarget: nearbyHero.id,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
              };
            }
            // Check for nearby troop combat (damage already applied above)
            // Skip if enemy is flying or has breakthrough
            const enemyDataCheck = ENEMY_DATA[enemy.type];
            const nearbyTroop = (!enemyDataCheck.flying && !enemyDataCheck.breakthrough) ? troops.find(
              (t) => distance(getEnemyPosWithPath(enemy, selectedMap), t.pos) < 60
            ) : null;
            if (nearbyTroop) {
              // Check if this enemy attacked this frame
              const attackedThisFrame =
                enemiesAttackingTroops[enemy.id] === nearbyTroop.id;
              if (attackedThisFrame) {
                return {
                  ...enemy,
                  inCombat: true,
                  combatTarget: nearbyTroop.id,
                  lastTroopAttack: now,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                };
              }
              return {
                ...enemy,
                inCombat: true,
                combatTarget: nearbyTroop.id,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
              };
            }
            if (enemy.inCombat && !nearbyTroop && !nearbyHero) {
              return {
                ...enemy,
                inCombat: false,
                combatTarget: undefined,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
              };
            }
            // Ranged enemy attacks - they stop and attack when target in range
            const enemyData = ENEMY_DATA[enemy.type];
            let isAttackingRanged = false;
            if (
              enemyData.isRanged &&
              enemyData.range &&
              enemyData.attackSpeed
            ) {
              const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
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
                const targetTroop = troops.find(
                  (t) => distance(enemyPos, t.pos) <= (enemyData.range || 120)
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
                isAttackingRanged = true;
                // set inCombat state
                enemy = {
                  ...enemy,
                  inCombat: true,
                  combatTarget: rangedTarget.id,
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
                        return "fireball";
                      case "frostling":
                        return "frostBolt";
                      case "infernal":
                        return "infernalFire";
                      case "banshee":
                        return "bansheeScream";
                      case "dragon":
                        return "dragonBreath";
                      default:
                        return "arrow";
                    }
                  })();

                  // Determine if this is an AoE attack
                  const isAoEAttack = ["catapult", "dragon", "infernal"].includes(enemy.type);
                  const aoeRadius = isAoEAttack ? (enemy.type === "dragon" ? 80 : enemy.type === "catapult" ? 60 : 50) : 0;

                  // Calculate arc height for projectiles that should arc
                  const arcHeight = ["rock", "fireball"].includes(projType) ? 50 : 0;

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
                      isAoE: isAoEAttack,
                      aoeRadius: aoeRadius,
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
            }
            // Update slowed visual indicator
            const slowedVisual = enemy.slowEffect > 0;
            const slowIntensity = enemy.slowEffect;
            // Move enemy along path - normalize speed by segment length for consistent world-space speed
            if (!enemy.inCombat) {
              // Use enemy's pathKey for dual-path support
              const pathKey = enemy.pathKey || selectedMap;
              const path = MAP_PATHS[pathKey];
              const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
              // Get segment length to normalize movement speed
              const segmentLength = getPathSegmentLength(enemy.pathIndex, pathKey);
              // Scale speed by TILE_SIZE to convert from old progress-based system to pixel-based
              // Then divide by actual segment length for consistent world-space speed
              const progressIncrement = (ENEMY_DATA[enemy.type].speed * speedMult * deltaTime * TILE_SIZE) / 1000 / segmentLength;
              const newProgress = enemy.progress + progressIncrement;
              if (newProgress >= 1 && enemy.pathIndex < path.length - 1) {
                return {
                  ...enemy,
                  pathIndex: enemy.pathIndex + 1,
                  progress: 0,
                  slowEffect: Math.max(0, enemy.slowEffect - deltaTime / 5000),
                  slowed: slowedVisual,
                  slowIntensity: slowIntensity,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                };
              } else if (
                newProgress >= 1 &&
                enemy.pathIndex >= path.length - 1
              ) {
                // Use liveCost from enemy data, default to 1
                const liveCost = ENEMY_DATA[enemy.type].liveCost || 1;
                setLives((l) => Math.max(0, l - liveCost));
                return null as any;
              } else {
                return {
                  ...enemy,
                  progress: newProgress,
                  slowEffect: Math.max(0, enemy.slowEffect - deltaTime / 5000),
                  slowed: slowedVisual,
                  slowIntensity: slowIntensity,
                  damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                };
              }
            }
            return {
              ...enemy,
              slowed: slowedVisual,
              slowIntensity: slowIntensity,
              damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
            };
          })
          .filter(Boolean)
      );
      // Enemy separation - soft collision avoidance with smart exceptions
      setEnemies((prev) => {
        // Much gentler separation - enemies can overlap when needed
        const BASE_SEPARATION_DISTANCE = 20;
        const SEPARATION_FORCE = 0.15; // Gentler push
        const PROGRESS_SEPARATION = 0.008; // Subtle path spreading

        return prev.map((enemy) => {
          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
          const eData = ENEMY_DATA[enemy.type];
          const enemySize = eData?.size || 20;
          const enemyFlying = eData?.flying || false;

          // Enemies in combat have MUCH reduced separation - they're allowed to crowd targets
          const inCombatMultiplier = enemy.inCombat ? 0.1 : 1.0;

          // Flying enemies have very minimal separation from ground enemies
          // and reduced separation from other flying enemies
          const flyingReduction = enemyFlying ? 0.3 : 1.0;

          let separationX = 0;
          let separationY = 0;
          let progressPush = 0;
          let overlappingCount = 0;

          for (const other of prev) {
            if (other.id === enemy.id) continue;
            // Only separate enemies on the same path
            if (enemy.pathKey !== other.pathKey) continue;

            const oData = ENEMY_DATA[other.type];
            const otherFlying = oData?.flying || false;

            // Flying vs ground enemies: no separation at all
            // They exist on different "layers"
            if (enemyFlying !== otherFlying) continue;

            const otherPos = getEnemyPosWithPath(other, selectedMap);
            const otherSize = oData?.size || 20;

            // Both in combat with same target? Minimal separation
            const bothInCombat = enemy.inCombat && other.inCombat;
            const sameTarget = enemy.combatTarget && enemy.combatTarget === other.combatTarget;
            const combatOverlapAllowed = bothInCombat && sameTarget;

            // Dynamic separation distance - smaller when in combat together
            const baseDist = combatOverlapAllowed ? 10 : BASE_SEPARATION_DISTANCE;
            const combinedSize = (enemySize + otherSize) * 0.4;
            const dynamicSepDist = Math.max(baseDist, combinedSize);

            const dx = enemyPos.x - otherPos.x;
            const dy = enemyPos.y - otherPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Only apply separation if very close
            if (dist < dynamicSepDist && dist > 0.1) {
              overlappingCount++;

              // Linear falloff instead of quadratic - gentler push
              const forceMult = (dynamicSepDist - dist) / dynamicSepDist;
              const force = forceMult * SEPARATION_FORCE * inCombatMultiplier * flyingReduction;

              // If combat overlap allowed, almost no push
              if (!combatOverlapAllowed) {
                separationX += (dx / dist) * force;
                separationY += (dy / dist) * force;
              }

              // Path progress spreading - only when NOT in combat
              if (!enemy.inCombat && !combatOverlapAllowed) {
                const progressDiff = enemy.progress - other.progress;
                const pathIndexDiff = enemy.pathIndex - other.pathIndex;
                const isBehind = pathIndexDiff < 0 || (pathIndexDiff === 0 && progressDiff < 0);

                if (dist < dynamicSepDist * 0.5) {
                  progressPush += isBehind ? -PROGRESS_SEPARATION * forceMult : PROGRESS_SEPARATION * forceMult * 0.5;
                }
              }
            }
          }

          // Only apply changes if significant overlap with non-combat enemies
          if (overlappingCount > 0 && (Math.abs(separationX) > 0.005 || Math.abs(separationY) > 0.005 || Math.abs(progressPush) > 0.001)) {
            // Apply separation as lane offset adjustment (perpendicular to path)
            // Gentler application rate
            const newLaneOffset = Math.max(
              -1.5, // Allow wider spread
              Math.min(1.5, enemy.laneOffset + separationX * 0.02)
            );

            // Apply progress adjustment (along path)
            let newProgress = enemy.progress + progressPush;
            newProgress = Math.max(0, Math.min(1, newProgress));

            return {
              ...enemy,
              laneOffset: newLaneOffset,
              progress: newProgress,
            };
          }
          return enemy;
        });
      });
      // Update hero movement - with sight-based engagement
      if (hero && !hero.dead) {
        setHero((prev) => {
          if (!prev || prev.dead) return prev;

          const heroData = HERO_DATA[prev.type];
          const speed = heroData.speed;
          const isRanged = heroData.isRanged || false; // Use isRanged from hero data
          const attackRange = heroData.range; // Use the hero's actual range
          const sightRange = isRanged
            ? HERO_RANGED_SIGHT_RANGE
            : HERO_SIGHT_RANGE;

          // Find enemies within sight range (excluding flying for ground heroes)
          const enemiesInSight = enemies.filter((e) => {
            const enemyPos = getEnemyPosWithPath(e, selectedMap);
            const dist = distance(prev.pos, enemyPos);
            return dist <= sightRange && !ENEMY_DATA[e.type].flying;
          });

          // Find closest enemy in sight
          let closestEnemy: (typeof enemies)[0] | null = null;
          let closestDist = Infinity;
          for (const e of enemiesInSight) {
            const enemyPos = getEnemyPosWithPath(e, selectedMap);
            const dist = distance(prev.pos, enemyPos);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = e;
            }
          }

          // Determine home position (where the hero should return to)
          const homePos = prev.homePos || prev.pos;

          // If player is commanding movement, prioritize that
          if (prev.moving && prev.targetPos) {
            const dx = prev.targetPos.x - prev.pos.x;
            const dy = prev.targetPos.y - prev.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 5) {
              return {
                ...prev,
                pos: prev.targetPos,
                moving: false,
                targetPos: undefined,
                homePos: prev.targetPos, // Update home position when reaching destination
                aggroTarget: undefined,
                returning: false,
              };
            }

            const newX = prev.pos.x + ((dx / dist) * speed * deltaTime) / 16;
            const newY = prev.pos.y + ((dy / dist) * speed * deltaTime) / 16;
            const rotation = Math.atan2(dy, dx);
            return {
              ...prev,
              pos: { x: newX, y: newY },
              rotation,
              homePos: prev.targetPos, // Set home to destination
              aggroTarget: undefined,
              returning: false,
            };
          }

          if (closestEnemy) {
            // Enemy in sight - engage!
            const enemyPos = getEnemyPosWithPath(closestEnemy, selectedMap);

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
                const dx = enemyPos.x - prev.pos.x;
                const dy = enemyPos.y - prev.pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // For ranged heroes, stop at attack range - 20 (safe distance)
                // For melee heroes, get as close as possible
                const targetDist = isRanged ? attackRange - 20 : MELEE_RANGE;
                const moveRatio = Math.min(1, (dist - targetDist) / dist);

                if (dist > 0 && moveRatio > 0) {
                  const newX =
                    prev.pos.x +
                    ((dx / dist) * speed * deltaTime * moveRatio) / 16;
                  const newY =
                    prev.pos.y +
                    ((dy / dist) * speed * deltaTime * moveRatio) / 16;
                  const rotation = Math.atan2(dy, dx);
                  return {
                    ...prev,
                    pos: { x: newX, y: newY },
                    rotation,
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
                aggroTarget: closestEnemy.id,
                returning: false,
              };
            }
          } else if (homePos) {
            // No enemy in sight but was in combat - return home
            const dx = homePos.x - prev.pos.x;
            const dy = homePos.y - prev.pos.y;
            const distToHome = Math.sqrt(dx * dx + dy * dy);

            if (distToHome > 8) {
              // Not at home - move back
              const newX =
                prev.pos.x + ((dx / distToHome) * speed * deltaTime) / 16;
              const newY =
                prev.pos.y + ((dy / distToHome) * speed * deltaTime) / 16;
              const rotation = Math.atan2(dy, dx);
              return {
                ...prev,
                pos: { x: newX, y: newY },
                rotation,
                aggroTarget: undefined,
                returning: true,
              };
            } else {
              // At home - stop
              return {
                ...prev,
                aggroTarget: undefined,
                returning: false,
              };
            }
          }

          return prev;
        });
      }
      // Update troop movement - with sight-based engagement
      setTroops((prev) => {
        // First pass: calculate separation forces
        const separationForces: Map<string, Position> = new Map();

        for (let i = 0; i < prev.length; i++) {
          const troop = prev[i];
          let forceX = 0;
          let forceY = 0;

          for (let j = 0; j < prev.length; j++) {
            if (i === j) continue;
            const other = prev[j];
            const dx = troop.pos.x - other.pos.x;
            const dy = troop.pos.y - other.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < TROOP_SEPARATION_DIST) {
              // Handle near-zero distance to prevent direction instability (causes vibration)
              if (dist < 1) {
                // Troops almost exactly overlapping - push in a consistent direction based on id
                const angle = (i * 0.618 + j * 0.382) * Math.PI * 2; // Golden ratio for distribution
                forceX += Math.cos(angle) * 1.0;
                forceY += Math.sin(angle) * 1.0;
              } else {
                // Push away from other troop with stronger force when closer
                const pushStrength =
                  (TROOP_SEPARATION_DIST - dist) / TROOP_SEPARATION_DIST;
                forceX += (dx / dist) * pushStrength * 0.8;
                forceY += (dy / dist) * pushStrength * 0.8;
              }
            }
          }

          if (forceX !== 0 || forceY !== 0) {
            separationForces.set(troop.id, { x: forceX, y: forceY });
          }
        }

        // Second pass: update positions with sight-based engagement
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

          const isRanged = troopData.isRanged;
          const isStationary = troopData.isStationary || troop.moveRadius === 0; // Turrets can't move
          const attackRange = isRanged ? troopData.range || 150 : MELEE_RANGE;
          const sightRange = isRanged
            ? TROOP_RANGED_SIGHT_RANGE
            : TROOP_SIGHT_RANGE;

          // Find enemies within sight range (excluding flying enemies unless troop can target them)
          const enemiesInSight = enemies.filter((e) => {
            const enemyPos = getEnemyPosWithPath(e, selectedMap);
            const dist = distance(troop.pos, enemyPos);
            const canHitFlying = troopData.canTargetFlying || false;
            return dist <= sightRange && (!ENEMY_DATA[e.type].flying || canHitFlying);
          });

          // Find closest enemy in sight
          let closestEnemy: (typeof enemies)[0] | null = null;
          let closestDist = Infinity;
          for (const e of enemiesInSight) {
            const enemyPos = getEnemyPosWithPath(e, selectedMap);
            const dist = distance(troop.pos, enemyPos);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = e;
            }
          }

          // Determine home position (where the troop should return to)
          const homePos = troop.userTargetPos || troop.spawnPoint;
          const maxChaseRange = troop.moveRadius || 180; // Don't chase beyond this from home

          // Skip engagement logic if player has commanded this troop to move
          // This allows troops to disengage from combat and follow orders
          if (closestEnemy && !troop.moving) {
            // Enemy in sight - engage!
            const enemyPos = getEnemyPosWithPath(closestEnemy, selectedMap);

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
              updated.engaging = closestDist <= attackRange;
            } else if (closestDist > effectiveAttackRange && !wouldBeTooFar) {
              // Enemy in sight but out of attack range - move toward it
              const dx = enemyPos.x - troop.pos.x;
              const dy = enemyPos.y - troop.pos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Move toward enemy, but stop at attack range
              const targetDist = effectiveAttackRange - 10; // Stop a bit before attack range
              const moveRatio = Math.min(1, (dist - targetDist) / dist);

              if (dist > 0 && moveRatio > 0) {
                // Apply slow effect to movement speed
                const baseSpeed = 2.0; // Slightly faster when engaging
                const slowMultiplier = updated.slowed && updated.slowIntensity ? (1 - updated.slowIntensity) : 1;
                const speed = baseSpeed * slowMultiplier;
                let newX = troop.pos.x + ((dx / dist) * speed * deltaTime) / 16;
                let newY = troop.pos.y + ((dy / dist) * speed * deltaTime) / 16;

                // Clamp to move radius from home
                if (homePos) {
                  const newDistFromHome = distance(
                    { x: newX, y: newY },
                    homePos
                  );
                  if (newDistFromHome > maxChaseRange) {
                    // Pull back toward the edge of the allowed range
                    const dxHome = newX - homePos.x;
                    const dyHome = newY - homePos.y;
                    const homeDist = Math.sqrt(
                      dxHome * dxHome + dyHome * dyHome
                    );
                    if (homeDist > 0) {
                      newX = homePos.x + (dxHome / homeDist) * maxChaseRange;
                      newY = homePos.y + (dyHome / homeDist) * maxChaseRange;
                    }
                  }
                }

                const rotation = Math.atan2(dy, dx);
                updated.pos = { x: newX, y: newY };
                updated.rotation = rotation;
                updated.engaging = true;
              }
            } else if (closestDist <= effectiveAttackRange) {
              // Within attack range - face enemy but don't move
              const dx = enemyPos.x - troop.pos.x;
              const dy = enemyPos.y - troop.pos.y;
              updated.rotation = Math.atan2(dy, dx);
              updated.engaging = true;
            } else {
              // Too far from home to chase - face enemy but stay put
              const dx = enemyPos.x - troop.pos.x;
              const dy = enemyPos.y - troop.pos.y;
              updated.rotation = Math.atan2(dy, dx);
              updated.engaging = false; // Will return home
            }
          } else {
            // No enemy in sight OR player commanded movement - disengage
            updated.engaging = false;

            // Only return home if not being moved by player and not stationary
            if (homePos && !isStationary && !troop.moving) {
              const dx = homePos.x - troop.pos.x;
              const dy = homePos.y - troop.pos.y;
              const distToHome = Math.sqrt(dx * dx + dy * dy);

              if (distToHome > 8) {
                // Not at home - move back
                const baseReturnSpeed = 1.5;
                const slowMult = updated.slowed && updated.slowIntensity ? (1 - updated.slowIntensity) : 1;
                const speed = baseReturnSpeed * slowMult;
                const newX =
                  troop.pos.x + ((dx / distToHome) * speed * deltaTime) / 16;
                const newY =
                  troop.pos.y + ((dy / distToHome) * speed * deltaTime) / 16;
                const rotation = Math.atan2(dy, dx);
                updated.pos = { x: newX, y: newY };
                updated.rotation = rotation;
                updated.moving = true;
                updated.targetPos = homePos;
              } else {
                // At home - stop moving
                updated.moving = false;
                updated.targetPos = undefined;
              }
            }
          }

          // Apply separation force - ALWAYS apply (except stationary) to prevent bundling/vibration
          // Use stronger force and always apply to prevent the oscillation bug where
          // troops bundle when engaging then separate when not engaging
          const force = separationForces.get(troop.id);
          if (force && !isStationary) {
            // Apply separation more aggressively to prevent overlap
            // Scale down slightly when engaging to allow some grouping but prevent vibration
            const forceMult = updated.engaging ? 0.15 : 0.2;
            updated.pos = {
              x: updated.pos.x + force.x * deltaTime * forceMult,
              y: updated.pos.y + force.y * deltaTime * forceMult,
            };
          }

          // HP regeneration - regenerate 2% max HP per second when out of combat for 3+ seconds
          const inCombat = enemiesInSight.length > 0 || updated.engaging;
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
            const dx = troop.targetPos.x - updated.pos.x;
            const dy = troop.targetPos.y - updated.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5) {
              return {
                ...updated,
                pos: troop.targetPos,
                moving: false,
                targetPos: undefined,
                userTargetPos: troop.targetPos, // Update home position
              };
            }
            const speed = 1.5;
            const newX = updated.pos.x + ((dx / dist) * speed * deltaTime) / 16;
            const newY = updated.pos.y + ((dy / dist) * speed * deltaTime) / 16;
            const rotation = Math.atan2(dy, dx);
            return { ...updated, pos: { x: newX, y: newY }, rotation };
          }

          return updated;
        });
      });
      // ========== HERO STATUS EFFECTS PROCESSING ==========
      if (hero && !hero.dead) {
        setHero((prev) => {
          if (!prev || prev.dead) return prev;
          let updated = { ...prev };

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
              distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <= 100
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
        let updated = { ...tower };

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

          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
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

            // Helper to add or refresh debuff (replace existing of same type)
            const addOrRefreshDebuff = (debuffType: 'slow' | 'weaken' | 'blind') => {
              updated.debuffs = updated.debuffs || [];
              // Remove expired debuffs and existing debuffs of same type
              updated.debuffs = updated.debuffs.filter(d =>
                d.until > now && d.type !== debuffType
              );
              // Add the new/refreshed debuff
              updated.debuffs.push({
                type: debuffType,
                intensity,
                until: now + duration,
                sourceId: enemy.id,
              });
            };

            switch (ability.type) {
              case 'tower_slow':
                // Slow tower attack speed
                addOrRefreshDebuff('slow');
                break;
              case 'tower_weaken':
                // Reduce tower damage
                addOrRefreshDebuff('weaken');
                break;
              case 'tower_blind':
                // Reduce tower range
                addOrRefreshDebuff('blind');
                break;
              case 'tower_disable':
                // Completely disable tower
                updated.disabled = true;
                updated.disabledUntil = now + duration;
                break;
            }
          }
        }

        return updated;
      }));

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

              setPawPoints((pp) => pp + amount);
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

              setTowers((prev) =>
                prev.map((t) =>
                  t.id === tower.id ? { ...t, lastAttack: now } : t
                )
              );
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
              const enemyPos = getEnemyPosWithPath(e, selectedMap);
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

                    let newEnemy = { ...enemy };

                    // Apply slow
                    newEnemy.slowEffect = slowAmount;
                    newEnemy.slowed = true;
                    newEnemy.slowIntensity = slowAmount;

                    // Blizzard freeze
                    if (shouldApplyBlizzardFreeze) {
                      newEnemy.frozen = true;
                      newEnemy.stunUntil = now + 2000;
                      newEnemy.slowIntensity = 1;
                    }

                    // Arcane damage
                    if (shouldApplyArcaneDamage) {
                      newEnemy.hp -= arcaneDamage;
                      newEnemy.damageFlash = 80;
                      appliedDamage = true;
                      if (newEnemy.hp <= 0) {
                        const baseBounty = ENEMY_DATA[enemy.type].bounty;
                        const goldBonus = enemy.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                        bountyEarned += baseBounty + goldBonus;
                        bountyHadGoldAura = bountyHadGoldAura || !!enemy.goldAura;
                        sparkPositions.push(info.pos);
                        return null as any;
                      }
                    }

                    // Earthquake damage
                    if (shouldApplyEarthquakeDamage) {
                      newEnemy.hp -= earthquakeDamage;
                      newEnemy.damageFlash = 150;
                      newEnemy.slowIntensity = 0.8;
                      appliedDamage = true;
                      if (newEnemy.hp <= 0) {
                        const baseBounty = ENEMY_DATA[enemy.type].bounty;
                        const goldBonus = enemy.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                        bountyEarned += baseBounty + goldBonus;
                        bountyHadGoldAura = bountyHadGoldAura || !!enemy.goldAura;
                        particlePositions.push(info.pos);
                        return null as any;
                      }
                    }

                    return newEnemy;
                  })
                  .filter(Boolean)
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
                  distance(towerWorldPos, getEnemyPosWithPath(e, selectedMap)) <=
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
              setTowers((prev) =>
                prev.map((t) => {
                  if (t.id !== tower.id) return t;
                  return {
                    ...t,
                    lastAttack: shouldUpdateLastAttack ? now : t.lastAttack,
                    lastFreezeCheck: shouldUpdateFreezeCheck ? now : t.lastFreezeCheck,
                  };
                })
              );
            }
          } else if (tower.type === "station") {
            // Count living troops belonging to this station
            const stationTroops = troops.filter((t) => t.ownerId === tower.id);
            const pendingRespawns = tower.pendingRespawns || [];

            // Helper to find closest road point within station range
            const findRoadPoint = (pos: Position): Position => {
              const path = MAP_PATHS[selectedMap];
              const secondaryPath = MAP_PATHS[selectedMap + "_b"] || null;
              if (!path || path.length < 2) return pos;

              // Combine primary and secondary paths if available
              const fullPath = secondaryPath ? path.concat(secondaryPath) : path;

              let closestPoint: Position = pos;
              let minDist = Infinity;
              for (let i = 0; i < fullPath.length - 1; i++) {
                const p1 = gridToWorldPath(fullPath[i]);
                const p2 = gridToWorldPath(fullPath[i + 1]);
                const roadPoint = closestPointOnLine(pos, p1, p2);
                const dist = distance(pos, roadPoint);
                if (dist < minDist) {
                  minDist = dist;
                  closestPoint = roadPoint;
                }
              }
              return closestPoint;
            };

            // Process pending respawns - decrement timers and spawn when ready
            const troopsToSpawn: Troop[] = [];
            const remainingRespawns: typeof pendingRespawns = [];
            const stationPos = gridToWorld(tower.pos);

            // Find rally point from existing troops or use road near station
            const existingRallyTroop = stationTroops.find((t) => t.userTargetPos);
            const rallyPoint =
              existingRallyTroop?.userTargetPos || findRoadPoint(stationPos);

            for (const r of pendingRespawns) {
              const newTimer = r.timer - deltaTime;
              if (newTimer <= 0) {
                // Calculate how many troops will exist after this spawn
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
                  type: r.troopType as any,
                  rotation: Math.atan2(
                    targetPos.y - stationPos.y,
                    targetPos.x - stationPos.x
                  ),
                  attackAnim: 0,
                  selected: false,
                  spawnPoint: rallyPoint,
                  moveRadius: TOWER_DATA.station.spawnRange || 180,
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
              setTroops((prev) => [...prev, ...troopsToSpawn]);
            }

            // Total occupied = living troops + pending respawns
            const totalOccupied = stationTroops.length + remainingRespawns.length;
            const canSpawn = totalOccupied < MAX_STATION_TROOPS;

            // Find available spawn slot
            const occupiedSlots = new Set([
              ...stationTroops.map((t) => t.spawnSlot ?? 0),
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
                  existingRallyTroop?.userTargetPos || findRoadPoint(stationPos);

                // Calculate formation position
                const futureCount = stationTroops.length + 1;
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
                    targetPos.x - stationPos.x
                  ),
                  attackAnim: 0,
                  selected: false,
                  spawnPoint: rallyPoint,
                  moveRadius: TOWER_DATA.station.spawnRange || 180,
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
                        };
                      }
                    }
                    return t;
                  });
                  return [...updated, newTroop];
                });
                addParticles(stationPos, "spark", 10);

                setTowers((prev) =>
                  prev.map((t) =>
                    t.id === tower.id
                      ? {
                        ...t,
                        lastAttack: now,
                        trainAnimProgress:
                          newProgress >= 1 ? 0.01 : newProgress,
                        currentTroopCount: stationTroops.length + 1,
                        pendingRespawns: remainingRespawns,
                      }
                      : t
                  )
                );
              } else {
                // Just animate the train and update respawns
                setTowers((prev) =>
                  prev.map((t) =>
                    t.id === tower.id
                      ? {
                        ...t,
                        trainAnimProgress:
                          newProgress >= 1 ? 0.01 : newProgress,
                        currentTroopCount: stationTroops.length,
                        pendingRespawns: remainingRespawns,
                      }
                      : t
                  )
                );
              }
            } else {
              // At max capacity - park train at platform
              setTowers((prev) =>
                prev.map((t) =>
                  t.id === tower.id
                    ? {
                      ...t,
                      trainAnimProgress: 0.35,
                      currentTroopCount: stationTroops.length,
                      pendingRespawns: remainingRespawns,
                    }
                    : t
                )
              );
            }
          } else if (tower.type === "cannon") {
            // Level 3: Heavy Cannon - increased damage and minor splash
            // Level 4A: Gatling gun - rapid fire
            // Level 4B: Flamethrower - continuous damage with burn
            const isHeavyCannon = tower.level === 3;
            const isGatling = tower.level === 4 && tower.upgrade === "A";
            const isFlamethrower = tower.level === 4 && tower.upgrade === "B";

            // Get all valid enemies in range for targeting
            const validEnemies = enemies
              .filter(
                (e) =>
                  distance(
                    towerWorldPos,
                    getEnemyPosWithPath(e, selectedMap)
                  ) <= finalRange
              )
              .sort(
                (a, b) => b.pathIndex + b.progress - (a.pathIndex + a.progress)
              );

            // Continuously track target even when not firing
            if (validEnemies.length > 0) {
              const trackTarget = validEnemies[0];
              const trackTargetPos = getEnemyPosWithPath(trackTarget, selectedMap);
              const trackDx = trackTargetPos.x - towerWorldPos.x;
              const trackDy = trackTargetPos.y - towerWorldPos.y;
              // Account for isometric projection: isoX = (x-y)*0.5, isoY = (x+y)*0.25
              // Visual angle needs: atan2(dx+dy, dx-dy) to match screen-space direction
              const trackRotation = Math.atan2(trackDx + trackDy, trackDx - trackDy);

              // Update rotation to track enemy continuously
              setTowers((prev) =>
                prev.map((t) =>
                  t.id === tower.id
                    ? { ...t, rotation: trackRotation, targetId: trackTarget.id }
                    : t
                )
              );
            }

            const attackCooldown = isGatling
              ? 150 // Gatling is 8x faster
              : isFlamethrower
                ? 100 // Flamethrower is continuous
                : isHeavyCannon
                  ? 900 // Heavy cannon slightly slower but more damage
                  : tData.attackSpeed;
            // Scale attack cooldown with game speed and debuffs
            const effectiveAttackCooldown = gameSpeed > 0 ? (attackCooldown / gameSpeed) / attackSpeedMod : attackCooldown;
            if (now - tower.lastAttack > effectiveAttackCooldown && validEnemies.length > 0) {
              const target = validEnemies[0];
              const targetPos = getEnemyPosWithPath(target, selectedMap);
              let damage = tData.damage * finalDamageMult;
              if (tower.level === 2) damage *= 1.5;
              if (isHeavyCannon) damage *= 2.2; // Heavy cannon big damage
              if (isGatling) damage *= 0.4; // Lower per-shot damage but much faster
              if (isFlamethrower) damage *= 0.3; // DoT damage
              // Apply damage
              setEnemies((prev) =>
                prev
                  .map((e) => {
                    if (e.id === target.id) {
                      const newHp =
                        e.hp - damage * (1 - ENEMY_DATA[e.type].armor);
                      const updates: any = { hp: newHp, damageFlash: 100 };
                      // Flamethrower applies burn
                      if (isFlamethrower) {
                        updates.burning = true;
                        updates.burnDamage = 15;
                        updates.burnUntil = now + 3000;
                      }
                      if (newHp <= 0) {
                        const baseBounty = ENEMY_DATA[e.type].bounty;
                        awardBounty(baseBounty, e.goldAura || false, e.id);
                        addParticles(targetPos, "explosion", 12);
                        if (e.goldAura) addParticles(targetPos, "gold", 6);
                        return null as any;
                      }
                      return { ...e, ...updates };
                    }
                    return e;
                  })
                  .filter(Boolean)
              );
              // Update lastAttack timestamp (rotation already tracked continuously above)
              const dx = targetPos.x - towerWorldPos.x;
              const dy = targetPos.y - towerWorldPos.y;
              // Account for isometric projection: isoX = (x-y)*0.5, isoY = (x+y)*0.25
              const rotation = Math.atan2(dx + dy, dx - dy);
              setTowers((prev) =>
                prev.map((t) =>
                  t.id === tower.id
                    ? { ...t, lastAttack: now }
                    : t
                )
              );
              // Create cannon shot effect - renderer will position from turret
              const effectType = isFlamethrower
                ? "flame_burst"
                : isGatling
                  ? "bullet_stream"
                  : "cannon_shot";
              setEffects((ef) => [
                ...ef,
                {
                  id: generateId("cannon"),
                  pos: towerWorldPos, // Use tower base, renderer adjusts to turret
                  type: effectType,
                  progress: 0,
                  size: distance(towerWorldPos, targetPos),
                  targetPos,
                  towerId: tower.id,
                  towerLevel: tower.level,
                  towerUpgrade: tower.upgrade,
                  rotation,
                },
              ]);
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
            const effectiveLabCooldown = gameSpeed > 0 ? (attackCooldown / gameSpeed) / attackSpeedMod : attackCooldown;
            if (now - tower.lastAttack > effectiveLabCooldown) {
              const validEnemies = enemies
                .filter(
                  (e) =>
                    distance(
                      towerWorldPos,
                      getEnemyPosWithPath(e, selectedMap)
                    ) <= finalRange
                )
                .sort(
                  (a, b) => b.pathIndex + b.progress - (a.pathIndex + a.progress)
                );
              if (validEnemies.length > 0) {
                const target = validEnemies[0];
                const targetPos = getEnemyPosWithPath(target, selectedMap);
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
                setEnemies((prev) =>
                  prev
                    .map((e) => {
                      const isChainTarget = chainTargets.find(
                        (t) => t.id === e.id
                      );
                      if (isChainTarget) {
                        const newHp =
                          e.hp - chainDamage * (1 - ENEMY_DATA[e.type].armor);
                        if (newHp <= 0) {
                          const baseBounty = ENEMY_DATA[e.type].bounty;
                          awardBounty(baseBounty, e.goldAura || false, e.id);
                          addParticles(
                            getEnemyPosWithPath(e, selectedMap),
                            "explosion",
                            8
                          );
                          if (e.goldAura) addParticles(getEnemyPosWithPath(e, selectedMap), "gold", 6);
                          return null as any;
                        }
                        return { ...e, hp: newHp, damageFlash: 150 };
                      }
                      return e;
                    })
                    .filter(Boolean)
                );
                const dx = targetPos.x - towerWorldPos.x;
                const dy = targetPos.y - towerWorldPos.y;
                const rotation = Math.atan2(dy, dx);
                setTowers((prev) =>
                  prev.map((t) =>
                    t.id === tower.id
                      ? { ...t, lastAttack: now, rotation, target: target.id }
                      : t
                  )
                );
                // Tesla coil position at top of tower - must match visual rendering
                // In renderer: baseHeight = 25 + level * 8, coilHeight = 35 + level * 8
                // orbY = topY - coilHeight + 5 = -(baseHeight + coilHeight - 5)
                if (isTeslaCoil || isChainLightning) {
                  // Draw chain lightning between all targets
                  chainTargets.forEach((chainTarget, i) => {
                    const chainPos = getEnemyPosWithPath(
                      chainTarget,
                      selectedMap
                    );
                    const fromPos =
                      i === 0
                        ? towerWorldPos // Use tower base position, renderer will adjust to orb
                        : getEnemyPosWithPath(chainTargets[i - 1], selectedMap);
                    setEffects((ef) => [
                      ...ef,
                      {
                        id: generateId("chain"),
                        pos: fromPos,
                        type: "chain",
                        progress: 0,
                        size: distance(fromPos, chainPos),
                        targetPos: chainPos,
                        intensity: 1 - i * 0.15, // Fade with each jump
                        towerId: i === 0 ? tower.id : undefined,
                        towerLevel: tower.level,
                        towerUpgrade: tower.upgrade,
                      },
                    ]);
                  });
                } else {
                  setEffects((ef) => [
                    ...ef,
                    {
                      id: generateId("zap"),
                      pos: towerWorldPos, // Use tower base position, renderer will adjust to orb
                      type: isFocusedBeam ? "beam" : "lightning",
                      progress: 0,
                      size: distance(towerWorldPos, targetPos),
                      targetPos,
                      intensity: isFocusedBeam ? 0.8 : 1,
                      towerId: tower.id,
                      towerLevel: tower.level,
                      towerUpgrade: tower.upgrade,
                    },
                  ]);
                }
                // Add spark particles at tower position
                addParticles(towerWorldPos, "spark", 3);
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
            const effectiveArcherSpeed = gameSpeed > 0 ? attackSpeed / gameSpeed : attackSpeed;
            if (now - tower.lastAttack > effectiveArcherSpeed) {
              const validEnemies = enemies
                .filter(
                  (e) =>
                    distance(
                      towerWorldPos,
                      getEnemyPosWithPath(e, selectedMap)
                    ) <= finalRange
                )
                .sort(
                  (a, b) => b.pathIndex + b.progress - (a.pathIndex + a.progress)
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
                setEnemies((prev) =>
                  prev
                    .map((e) => {
                      const isTarget = targets.find((t) => t.id === e.id);
                      if (isTarget) {
                        const targetPos = getEnemyPosWithPath(e, selectedMap);
                        const newHp =
                          e.hp - damage * (1 - ENEMY_DATA[e.type].armor);
                        const updates: any = { hp: newHp, damageFlash: 150 };
                        // Shockwave has 30% stun chance
                        if (isShockwave && Math.random() < 0.3) {
                          updates.stunUntil = now + 1000;
                        }
                        if (newHp <= 0) {
                          const baseBounty = ENEMY_DATA[e.type].bounty;
                          awardBounty(baseBounty, e.goldAura || false, e.id);
                          addParticles(targetPos, "explosion", 10);
                          if (e.goldAura) addParticles(targetPos, "gold", 6);
                          return null as any;
                        }
                        return { ...e, ...updates };
                      }
                      return e;
                    })
                    .filter(Boolean)
                );
                const target = targets[0];
                const targetPos = getEnemyPosWithPath(target, selectedMap);
                const dx = targetPos.x - towerWorldPos.x;
                const dy = targetPos.y - towerWorldPos.y;
                const rotation = Math.atan2(dy, dx);
                setTowers((prev) =>
                  prev.map((t) =>
                    t.id === tower.id
                      ? { ...t, lastAttack: now, rotation, target: target.id }
                      : t
                  )
                );
                setEffects((ef) => [
                  ...ef,
                  {
                    id: generateId("sonic"),
                    pos: towerWorldPos,
                    type: "sonic",
                    progress: 0,
                    size: finalRange,
                  },
                ]);
                // Create music note cluster effects to each target
                targets.forEach((target, i) => {
                  const targetPos = getEnemyPosWithPath(target, selectedMap);
                  // Create multiple note projectiles per target
                  for (let n = 0; n < 3 + tower.level; n++) {
                    setEffects((ef) => [
                      ...ef,
                      {
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
                      },
                    ]);
                  }
                });
              }
            }
          } else if (
            tData.attackSpeed > 0 &&
            now - tower.lastAttack > (gameSpeed > 0 ? tData.attackSpeed / gameSpeed : tData.attackSpeed)
          ) {
            // Generic tower attack (fallback)
            const validEnemies = enemies
              .filter(
                (e) =>
                  distance(towerWorldPos, getEnemyPosWithPath(e, selectedMap)) <=
                  finalRange
              )
              .sort(
                (a, b) => b.pathIndex + b.progress - (a.pathIndex + a.progress)
              );
            if (validEnemies.length > 0) {
              const target = validEnemies[0];
              const targetPos = getEnemyPosWithPath(target, selectedMap);
              let damage = tData.damage * finalDamageMult;
              if (tower.level === 2) damage *= 1.5;
              if (tower.level === 3) damage *= 2;
              setEnemies((prev) =>
                prev
                  .map((e) => {
                    if (e.id === target.id) {
                      const newHp =
                        e.hp - damage * (1 - ENEMY_DATA[e.type].armor);
                      if (newHp <= 0) {
                        const baseBounty = ENEMY_DATA[e.type].bounty;
                        awardBounty(baseBounty, e.goldAura || false, e.id);
                        addParticles(targetPos, "explosion", 12);
                        if (e.goldAura) addParticles(targetPos, "gold", 6);
                        setEffects((ef) => [
                          ...ef,
                          {
                            id: generateId("eff"),
                            pos: targetPos,
                            type: "explosion",
                            progress: 0,
                            size: 30,
                          },
                        ]);
                        return null as any;
                      }
                      return { ...e, hp: newHp, damageFlash: 200 };
                    }
                    return e;
                  })
                  .filter(Boolean)
              );
              const dx = targetPos.x - towerWorldPos.x;
              const dy = targetPos.y - towerWorldPos.y;
              const rotation = Math.atan2(dy, dx);
              setTowers((prev) =>
                prev.map((t) =>
                  t.id === tower.id
                    ? { ...t, lastAttack: now, rotation, target: target.id }
                    : t
                )
              );
              setProjectiles((prev) => [
                ...prev,
                {
                  id: generateId("proj"),
                  from: towerWorldPos,
                  to: targetPos,
                  progress: 0,
                  type: tower.type,
                  rotation,
                },
              ]);
              addParticles(towerWorldPos, "smoke", 3);
            }
          }
        });
      } // End of !isPaused check for tower attacks
      // Hero attacks - skip when paused
      if (!isPaused && hero && !hero.dead && hero.attackAnim === 0) {
        const heroData = HERO_DATA[hero.type];
        // Scale hero attack speed with game speed
        const effectiveHeroAttackSpeed = gameSpeed > 0 ? heroData.attackSpeed / gameSpeed : heroData.attackSpeed;
        if (now - hero.lastAttack > effectiveHeroAttackSpeed) {
          const validEnemies = enemies
            .filter(
              (e) =>
                distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <=
                heroData.range
            )
            .sort(
              (a, b) => b.pathIndex + b.progress - (a.pathIndex + a.progress)
            );
          if (validEnemies.length > 0) {
            const target = validEnemies[0];
            const targetPos = getEnemyPosWithPath(target, selectedMap);
            const dx = targetPos.x - hero.pos.x;
            const dy = targetPos.y - hero.pos.y;
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
              let updatedEnemies = [...prev];
              const killedEnemyIds: string[] = [];

              // Primary target damage
              for (const attackTarget of attackTargets) {
                const attackTargetPos = getEnemyPosWithPath(attackTarget, selectedMap);

                updatedEnemies = updatedEnemies.map((e) => {
                  if (e.id === attackTarget.id) {
                    const newHp = e.hp - heroData.damage;
                    if (newHp <= 0) {
                      killedEnemyIds.push(e.id);
                      const baseBounty = ENEMY_DATA[e.type].bounty;
                      awardBounty(baseBounty, e.goldAura || false, e.id);
                      if (hero.type === "scott") setPawPoints((pp) => pp + 1);
                      addParticles(attackTargetPos, "explosion", 10);
                      if (e.goldAura) addParticles(attackTargetPos, "gold", 6);
                      return null as any;
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

                  const enemyPos = getEnemyPosWithPath(e, selectedMap);
                  const distToTarget = distance(targetPos, enemyPos);

                  if (distToTarget <= aoeDamageRadius) {
                    const newHp = e.hp - aoeDamage;
                    if (newHp <= 0) {
                      const baseBounty = ENEMY_DATA[e.type].bounty;
                      awardBounty(baseBounty, e.goldAura || false, e.id);
                      addParticles(enemyPos, "explosion", 8);
                      if (e.goldAura) addParticles(enemyPos, "gold", 4);
                      return null as any;
                    }
                    return { ...e, hp: newHp, damageFlash: 150 };
                  }
                  return e;
                });
              }

              return updatedEnemies.filter(Boolean);
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
              attackTargets.slice(1).forEach((extraTarget, idx) => {
                const extraPos = getEnemyPosWithPath(extraTarget, selectedMap);
                setEffects((ef) => [
                  ...ef,
                  {
                    id: generateId("eff"),
                    pos: extraPos,
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
                    to: extraPos,
                    progress: 0,
                    type: "sonicWave",
                    rotation: Math.atan2(extraPos.y - hero.pos.y, extraPos.x - hero.pos.x),
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
                  to: targetPos,
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
      // Troop attacks - with ranged support for centaurs and turrets - skip when paused
      if (!isPaused) {
        troops.forEach((troop) => {
          if (!troop.type) return; // Skip troops without a type
          const troopData = TROOP_DATA[troop.type];
          if (!troopData) return; // Skip if troop data not found
          const attackRange = troopData.isRanged ? troopData.range || 150 : 65;
          const attackCooldown = troopData.attackSpeed || 1000;
          // Scale troop attack cooldown with game speed
          const effectiveTroopCooldown = gameSpeed > 0 ? attackCooldown / gameSpeed : attackCooldown;
          const lastAttack = troop.lastAttack ?? 0; // Default to 0 if undefined
          if (
            (troop.attackAnim ?? 0) === 0 &&
            now - lastAttack > effectiveTroopCooldown
          ) {
            const canHitFlying = troopData.canTargetFlying || false;
            const validEnemies = enemies.filter(
              (e) =>
                distance(troop.pos, getEnemyPosWithPath(e, selectedMap)) <=
                attackRange && (!ENEMY_DATA[e.type].flying || canHitFlying)
            );
            if (validEnemies.length > 0) {
              const target = validEnemies[0];
              const targetPos = getEnemyPosWithPath(target, selectedMap);
              const troopDamage = troopData.damage || 20;
              const dx = targetPos.x - troop.pos.x;
              const dy = targetPos.y - troop.pos.y;
              const rotation = Math.atan2(dy, dx);
              // Apply damage immediately (projectile is just visual)
              setEnemies((prev) =>
                prev
                  .map((e) => {
                    if (e.id === target.id) {
                      const newHp = e.hp - troopDamage;
                      if (newHp <= 0) {
                        const baseBounty = ENEMY_DATA[e.type].bounty;
                        awardBounty(baseBounty, e.goldAura || false, e.id);
                        addParticles(targetPos, "explosion", 8);
                        if (e.goldAura) addParticles(targetPos, "gold", 6);
                        setEffects((ef) => [
                          ...ef,
                          {
                            id: generateId("eff"),
                            pos: targetPos,
                            type: "explosion",
                            progress: 0,
                            size: 20,
                          },
                        ]);
                        return null as any;
                      }
                      return { ...e, hp: newHp, damageFlash: 200 };
                    }
                    return e;
                  })
                  .filter(Boolean)
              );

              // Add melee attack visual effect for non-ranged troops
              if (!troopData.isRanged) {
                const troopEffectType: EffectType =
                  troop.type === "knight" || troop.type === "cavalry"
                    ? "melee_slash"
                    : troop.type === "armored" || troop.type === "elite"
                      ? "melee_swipe"
                      : "impact_hit";
                setEffects((ef) => [
                  ...ef,
                  {
                    id: generateId("eff"),
                    pos: { x: (troop.pos.x + targetPos.x) / 2, y: (troop.pos.y + targetPos.y) / 2 },
                    type: troopEffectType,
                    progress: 0,
                    size: 35,
                    slashAngle: rotation,
                    attackerType: "troop",
                  },
                ]);
              }
              // Update troop state and create projectile from CURRENT position
              // (not the stale position from outer troops state)
              setTroops((prev) =>
                prev.map((t) => {
                  if (t.id === troop.id) {
                    // For ranged troops (centaurs/turrets), create a projectile visual
                    // using the CURRENT troop position from this callback
                    if (troopData.isRanged) {
                      const projType = t.type === "turret" ? "bullet" : "spear";
                      // For centaurs, spawn arrow from bow position (upper body)
                      // The bow is at approximately y - 20 pixels from center
                      const spawnOffset = t.type === "centaur" ? { x: 0, y: -20 } : { x: 0, y: 0 };
                      setProjectiles((prevProj) => [
                        ...prevProj,
                        {
                          id: generateId("proj"),
                          from: { x: t.pos.x + spawnOffset.x, y: t.pos.y + spawnOffset.y },
                          to: targetPos,
                          progress: 0,
                          type: projType,
                          rotation,
                        },
                      ]);
                    }
                    return {
                      ...t,
                      lastAttack: now,
                      lastCombatTime: now, // Track combat time for heal delay
                      attackAnim: troopData.isRanged ? 400 : 300,
                      rotation,
                      targetEnemy: target.id,
                    };
                  }
                  return t;
                })
              );
            }
          }
        });
      } // End of !isPaused check for troop attacks
      setTroops((prev) =>
        prev.map((t) =>
          t.attackAnim > 0
            ? { ...t, attackAnim: Math.max(0, t.attackAnim - deltaTime) }
            : t
        )
      );
      setTowers((prev) =>
        prev.map((t) => {
          if (t.type === "station") {
            const troopCount = troops.filter(
              (tr) => tr.ownerId === t.id
            ).length;
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
      // Update projectiles and handle enemy projectile damage (skip if empty)
      setProjectiles((prev) => {
        if (prev.length === 0) return prev;

        const completingProjectiles = prev.filter(
          (p) =>
            p.progress + deltaTime / 300 >= 1 &&
            p.targetType &&
            p.targetId &&
            p.damage
        );

        // Deal damage from enemy projectiles to heroes/troops
        completingProjectiles.forEach((proj) => {
          // Determine impact effect type based on projectile
          const getImpactEffect = (projType: string): EffectType => {
            switch (projType) {
              case "fireball":
              case "infernalFire":
              case "dragonBreath":
                return "fire_impact";
              case "rock":
                return "rock_impact";
              case "frostBolt":
                return "frost_impact";
              case "poisonBolt":
                return "poison_splash";
              case "magicBolt":
              case "darkBolt":
                return "magic_impact";
              case "arrow":
              case "bolt":
                return "arrow_hit";
              default:
                return "impact_hit";
            }
          };

          if (
            proj.targetType === "hero" &&
            proj.targetId &&
            hero.id === proj.targetId &&
            !hero.dead &&
            !hero.shieldActive
          ) {
            setHero((prev) => {
              if (prev && prev.id === proj.targetId && !prev.dead) {
                const newHp = prev.hp - (proj.damage || 20);
                if (newHp <= 0) {
                  return { ...prev, hp: 0, dead: true, respawnTimer: 15000, lastCombatTime: Date.now() };
                }
                return { ...prev, hp: newHp, lastCombatTime: Date.now() };
              }
              return prev;
            });
            // Add impact effect at hero position
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("eff"),
                pos: proj.to,
                type: getImpactEffect(proj.type),
                progress: 0,
                size: 35,
                rotation: proj.rotation,
              },
            ]);
            // Handle AoE damage for enemy projectiles
            if (proj.isAoE && proj.aoeRadius) {
              const aoeEffectType: EffectType = proj.type === "rock" ? "shockwave" : "fire_nova";
              setEffects((ef) => [
                ...ef,
                {
                  id: generateId("eff"),
                  pos: proj.to,
                  type: aoeEffectType,
                  progress: 0,
                  size: proj.aoeRadius || 50,
                },
              ]);
              // Deal AoE damage to nearby troops
              setTroops((prevTroops) =>
                prevTroops.map((t) => {
                  const troopDist = distance(t.pos, proj.to);
                  if (troopDist <= proj.aoeRadius!) {
                    const aoeDamage = Math.floor((proj.damage || 20) * 0.5);
                    const newHp = t.hp - aoeDamage;
                    if (newHp <= 0) {
                      addParticles(t.pos, "explosion", 5);
                      return null as any;
                    }
                    return { ...t, hp: newHp, lastCombatTime: Date.now() };
                  }
                  return t;
                }).filter(Boolean)
              );
            }
          } else if (hero?.shieldActive) {
            addParticles(hero.pos, "spark", 8); // Deflect visual
          } else if (proj.targetType === "troop" && proj.targetId) {
            // kill troops
            setTroops((prev) =>
              prev
                .map((t) => {
                  if (t.id === proj.targetId) {
                    const newHp = t.hp - (proj.damage || 20);
                    if (newHp <= 0) {
                      addParticles(t.pos, "explosion", 6);
                      return null as any;
                    }
                    return { ...t, hp: newHp, lastCombatTime: Date.now() };
                  }
                  return t;
                })
                .filter(Boolean)
            );
            // Add impact effect at troop position
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("eff"),
                pos: proj.to,
                type: getImpactEffect(proj.type),
                progress: 0,
                size: 30,
                rotation: proj.rotation,
              },
            ]);
          }
        });

        return prev
          .map((proj) => ({
            ...proj,
            progress: Math.min(1, proj.progress + deltaTime / 300),
          }))
          .filter((p) => p.progress < 1);
      });
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
      // Update particles - optimized batch update (throttled to reduce state updates)
      particleUpdateAccumulator.current += deltaTime;
      if (particleUpdateAccumulator.current >= 32) { // Update every ~32ms instead of every frame
        const accumulatedDelta = particleUpdateAccumulator.current;
        particleUpdateAccumulator.current = 0;

        setParticles((prev) => {
          // Skip update if no particles
          if (prev.length === 0) return prev;

          const updated: Particle[] = [];
          const deltaScale = accumulatedDelta / 16;

          for (const p of prev) {
            const newLife = p.life - accumulatedDelta;
            if (newLife <= 0) continue;

            updated.push({
              ...p,
              life: newLife,
              pos: {
                x: p.pos.x + p.velocity.x * deltaScale,
                y: p.pos.y + p.velocity.y * deltaScale,
              },
              velocity: {
                x: p.velocity.x * 0.98,
                y: p.velocity.y * 0.98 + 0.02,
              },
            });
          }

          // Hard cap check
          if (updated.length > MAX_PARTICLES) {
            return updated.slice(updated.length - MAX_PARTICLES);
          }
          return updated;
        });
      }
      // Update spell cooldowns
      setSpells((prev) =>
        prev.map((spell) => ({
          ...spell,
          cooldown: Math.max(0, spell.cooldown - deltaTime),
        }))
      );
      // Check win/lose conditions - ref guard prevents duplicate triggers across animation frames
      if (lives <= 0 && gameState === "playing" && !gameEndHandledRef.current) {
        gameEndHandledRef.current = true;

        // Calculate time spent on defeat
        const finalTime = Math.floor((Date.now() - levelStartTime) / 1000);
        setTimeSpent(finalTime);

        // Clear all timers to stop wave spawning
        clearAllTimers();

        // Reset wave tracking
        setWaveInProgress(false);

        // Save stats for defeat (won = false)
        updateLevelStats(selectedMap, finalTime, lives, false);
        setGameState("defeat");
      }
      if (
        gameState === "playing" &&
        currentWave >= levelWaves.length &&
        enemies.length === 0 &&
        !waveInProgress &&
        !gameEndHandledRef.current
      ) {
        gameEndHandledRef.current = true;

        // Calculate stars based on lives remaining
        const stars = lives >= 18 ? 3 : lives >= 10 ? 2 : 1;
        setStarsEarned(stars);

        // Calculate time spent
        const finalTime = Math.floor((Date.now() - levelStartTime) / 1000);
        setTimeSpent(finalTime);

        // Clear all timers to ensure clean state
        clearAllTimers();

        // IMPORTANT: Set game state first to prevent duplicate triggers
        setGameState("victory");

        // Save progress to localStorage immediately (no setTimeout to avoid stale closure issues)
        // Using the captured selectedMap value directly
        const mapToSave = selectedMap;
        updateLevelStars(mapToSave, stars);

        // Save stats for victory (won = true)
        updateLevelStats(mapToSave, finalTime, lives, true);

        // Level unlock progression
        const unlockMap: Record<string, string> = {
          poe: "carnegie",
          carnegie: "nassau",
          nassau: "bog",
          bog: "witch_hut",
          witch_hut: "sunken_temple",
          sunken_temple: "oasis",
          oasis: "pyramid",
          pyramid: "sphinx",
          sphinx: "glacier",
          glacier: "fortress",
          fortress: "peak",
          peak: "lava",
          lava: "crater",
          crater: "throne",
        };
        const nextLevel = unlockMap[mapToSave];
        if (nextLevel && !unlockedMaps.includes(nextLevel)) {
          unlockLevel(nextLevel);
        }
      }
    },
    [gameSpeed, selectedMap, waveInProgress, currentWave, vaultFlash, hero, lives, gameState, enemies, nextWaveTimer, startWave, addParticles, specialTowerHp, troops, towers, levelStartTime, clearAllTimers, updateLevelStats, updateLevelStars, unlockedMaps, unlockLevel]
  );
  // Render function - FIXED: Reset transform each frame to prevent accumulation
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    // CRITICAL: Reset transform to identity matrix at start of each frame
    // This prevents transform accumulation that causes the recursive rendering bug
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Apply DPR scaling fresh each frame
    ctx.scale(dpr, dpr);
    // Clear the entire canvas
    ctx.clearRect(0, 0, width, height);

    // Get theme for current map
    const mapTheme = LEVEL_DATA[selectedMap]?.theme || "grassland";
    const theme = REGION_THEMES[mapTheme];

    // Background - themed gradient
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width
    );
    gradient.addColorStop(0, theme.ground[0]);
    gradient.addColorStop(0.5, theme.ground[1]);
    gradient.addColorStop(1, theme.ground[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    // Save state before camera transforms
    ctx.save();
    // Draw grid (no camera transform for background elements)
    // Use seeded random for consistent grid fill
    const gridSeed = selectedMap
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    let gridSeedState = gridSeed;
    const gridRandom = () => {
      gridSeedState = (gridSeedState * 1103515245 + 12345) & 0x7fffffff;
      return gridSeedState / 0x7fffffff;
    };

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const worldPos = gridToWorld({ x, y });
        const screenPos = worldToScreen(
          worldPos,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        // Grid color based on theme accent
        ctx.strokeStyle = hexToRgba(theme.accent, 0.1);
        ctx.lineWidth = 1;
        const tileWidth = TILE_SIZE * cameraZoom;
        const tileHeight = TILE_SIZE * 0.5 * cameraZoom;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(screenPos.x + tileWidth / 2, screenPos.y + tileHeight / 2);
        ctx.lineTo(screenPos.x, screenPos.y + tileHeight);
        ctx.lineTo(screenPos.x - tileWidth / 2, screenPos.y + tileHeight / 2);
        ctx.closePath();
        ctx.stroke();
        // Use seeded random for consistent tile fills
        if (gridRandom() > 0.7) {
          ctx.fillStyle = hexToRgba(theme.accent, 0.02 + gridRandom() * 0.03);
          ctx.fill();
        }
      }
    }
    // Draw path using smooth rendering
    const path = MAP_PATHS[selectedMap];
    const pathWorldPoints = path.map((p) => gridToWorldPath(p));

    // Import map rendering functions (we'll call them inline)
    // Generate smooth path with Catmull-Rom splines
    // tension: 0 = linear (no curve), 0.5 = standard Catmull-Rom, default 0.25 for subtle curves
    const catmullRom = (
      p0: Position,
      p1: Position,
      p2: Position,
      p3: Position,
      t: number,
      tension: number = 0.25
    ): Position => {
      const t2 = t * t;
      const t3 = t2 * t;
      // Scale tension so 0.5 gives standard Catmull-Rom behavior
      const s = tension * 2;
      // Blend between linear interpolation and Catmull-Rom based on tension
      const linearX = p1.x + (p2.x - p1.x) * t;
      const linearY = p1.y + (p2.y - p1.y) * t;
      const catmullX =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const catmullY =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      return {
        x: linearX * (1 - s) + catmullX * s,
        y: linearY * (1 - s) + catmullY * s,
      };
    };

    // Generate smooth curve with configurable tension
    // tension: 0 = linear, 0.5 = standard Catmull-Rom, default 0.25 for subtle curves
    const generateSmoothPath = (
      controlPoints: Position[],
      tension: number = 0.25,
      subdivisions: number = 8
    ): Position[] => {
      if (controlPoints.length < 2) return controlPoints;
      const smoothPath: Position[] = [];
      const extended = [
        {
          x: controlPoints[0].x * 2 - controlPoints[1].x,
          y: controlPoints[0].y * 2 - controlPoints[1].y,
        },
        ...controlPoints,
        {
          x:
            controlPoints[controlPoints.length - 1].x * 2 -
            controlPoints[controlPoints.length - 2].x,
          y:
            controlPoints[controlPoints.length - 1].y * 2 -
            controlPoints[controlPoints.length - 2].y,
        },
      ];
      for (let i = 1; i < extended.length - 2; i++) {
        for (let j = 0; j < subdivisions; j++) {
          smoothPath.push(
            catmullRom(
              extended[i - 1],
              extended[i],
              extended[i + 1],
              extended[i + 2],
              j / subdivisions,
              tension
            )
          );
        }
      }
      smoothPath.push(controlPoints[controlPoints.length - 1]);
      return smoothPath;
    };

    // Seeded random for consistent decoration
    const mapSeed = selectedMap
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    let seedState = mapSeed;
    const seededRandom = () => {
      seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
      return seedState / 0x7fffffff;
    };

    const smoothPath = generateSmoothPath(pathWorldPoints);

    // Calculate smoothed perpendicular direction at a point by averaging neighbors
    const getSmoothedPerpendicular = (
      pathPoints: Position[],
      index: number,
      lookAhead: number = 4
    ): { perpX: number; perpY: number } => {
      let avgPerpX = 0;
      let avgPerpY = 0;
      let count = 0;

      // Sample perpendiculars from neighboring segments and average them
      for (let offset = -lookAhead; offset <= lookAhead; offset++) {
        const i = Math.max(0, Math.min(pathPoints.length - 2, index + offset));
        const next = Math.min(i + 1, pathPoints.length - 1);

        const dx = pathPoints[next].x - pathPoints[i].x;
        const dy = pathPoints[next].y - pathPoints[i].y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > 0.001) {
          // Weight closer samples more heavily
          const weight = 1 / (1 + Math.abs(offset) * 0.5);
          avgPerpX += (-dy / len) * weight;
          avgPerpY += (dx / len) * weight;
          count += weight;
        }
      }

      if (count > 0) {
        avgPerpX /= count;
        avgPerpY /= count;
        // Normalize the averaged perpendicular
        const len = Math.sqrt(avgPerpX * avgPerpX + avgPerpY * avgPerpY);
        if (len > 0.001) {
          avgPerpX /= len;
          avgPerpY /= len;
        }
      } else {
        avgPerpX = 0;
        avgPerpY = 1;
      }

      return { perpX: avgPerpX, perpY: avgPerpY };
    };

    // Add organic wobble to path edges with consistent thickness at turns
    const addPathWobble = (pathPoints: Position[], wobbleAmount: number, pathWidth: number = 48) => {
      seedState = mapSeed + 100;
      const left: Position[] = [],
        right: Position[] = [],
        center: Position[] = [];
      for (let i = 0; i < pathPoints.length; i++) {
        const p = pathPoints[i];

        // Use smoothed perpendicular for consistent thickness at corners
        const { perpX, perpY } = getSmoothedPerpendicular(pathPoints, i, 4);

        // Reduce wobble at corners (where direction changes significantly)
        let cornerFactor = 1.0;
        if (i > 0 && i < pathPoints.length - 1) {
          const prev = pathPoints[i - 1];
          const next = pathPoints[i + 1];
          const dx1 = p.x - prev.x;
          const dy1 = p.y - prev.y;
          const dx2 = next.x - p.x;
          const dy2 = next.y - p.y;
          const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (len1 > 0.001 && len2 > 0.001) {
            // Dot product to detect corners
            const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
            // Reduce wobble when turning (dot < 1 means turning)
            cornerFactor = 0.3 + 0.7 * Math.max(0, dot);
          }
        }

        const leftW = (seededRandom() - 0.5) * wobbleAmount * cornerFactor;
        const rightW = (seededRandom() - 0.5) * wobbleAmount * cornerFactor;
        left.push({
          x: p.x + perpX * (pathWidth + leftW) * 1.05,
          y: p.y + perpY * (pathWidth + leftW) * 0.95,
        });
        right.push({
          x: p.x - perpX * (pathWidth + rightW),
          y: p.y - perpY * (pathWidth + rightW) * 0.95,
        });
        center.push(p);
      }
      return { left, right, center };
    };

    const {
      left: pathLeft,
      right: pathRight,
      center: pathCenter,
    } = addPathWobble(smoothPath, 10);

    const toScreen = (p: Position) =>
      worldToScreen(
        p,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
    const screenCenter = smoothPath.map(toScreen);
    const screenLeft = pathLeft.map(toScreen);
    const screenRight = pathRight.map(toScreen);

    // Shadow layer
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.moveTo(screenLeft[0].x + 4, screenLeft[0].y + 4);
    for (let i = 1; i < screenLeft.length; i++)
      ctx.lineTo(screenLeft[i].x + 4, screenLeft[i].y + 4);
    for (let i = screenRight.length - 1; i >= 0; i--)
      ctx.lineTo(screenRight[i].x + 4, screenRight[i].y + 4);
    ctx.closePath();
    ctx.fill();

    // Main road edge - themed
    ctx.fillStyle = theme.path[2];
    ctx.beginPath();
    ctx.moveTo(screenLeft[0].x, screenLeft[0].y);
    for (let i = 1; i < screenLeft.length; i++)
      ctx.lineTo(screenLeft[i].x, screenLeft[i].y);
    for (let i = screenRight.length - 1; i >= 0; i--)
      ctx.lineTo(screenRight[i].x, screenRight[i].y);
    ctx.closePath();
    ctx.fill();

    // Inner road - themed
    ctx.fillStyle = theme.path[0];
    ctx.beginPath();
    for (let i = 0; i < screenCenter.length; i++) {
      const lx =
        screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * 0.88;
      const ly =
        screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * 0.88;
      if (i === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    for (let i = screenCenter.length - 1; i >= 0; i--) {
      const rx =
        screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.88;
      const ry =
        screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.88;
      ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();

    // Top road layer - themed
    ctx.fillStyle = theme.path[1];
    ctx.beginPath();
    for (let i = 0; i < screenCenter.length; i++) {
      const lx =
        screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * 0.72;
      const ly =
        screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * 0.72 - 2;
      if (i === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    for (let i = screenCenter.length - 1; i >= 0; i--) {
      const rx =
        screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.72;
      const ry =
        screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.72 - 2;
      ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();

    // Road texture patches - themed
    seedState = mapSeed + 200;
    ctx.fillStyle = hexToRgba(theme.ground[2], 0.12);
    for (let i = 0; i < smoothPath.length; i += 3) {
      if (i >= screenCenter.length) break;
      const sp = screenCenter[i];
      const patchSize = (3 + seededRandom() * 6) * cameraZoom;
      ctx.beginPath();
      ctx.ellipse(
        sp.x + (seededRandom() - 0.5) * 35 * cameraZoom,
        sp.y + (seededRandom() - 0.5) * 18 * cameraZoom,
        patchSize,
        patchSize * 0.5,
        seededRandom() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Wheel tracks - themed (use smoothed perpendiculars for consistent corners)
    ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
    ctx.lineWidth = 3 * cameraZoom;
    const trackOffset = 18 * cameraZoom;
    for (let track = -1; track <= 1; track += 2) {
      ctx.beginPath();
      for (let i = 0; i < smoothPath.length; i++) {
        const p = smoothPath[i];
        const { perpX, perpY } = getSmoothedPerpendicular(smoothPath, i, 3);
        const wobble = Math.sin(i * 0.5 + mapSeed) * 2;
        const screenP = toScreen({
          x: p.x + perpX * ((trackOffset * track) / cameraZoom + wobble),
          y: p.y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.75,
        });
        if (i === 0) ctx.moveTo(screenP.x, screenP.y);
        else ctx.lineTo(screenP.x, screenP.y);
      }
      ctx.stroke();
    }

    // Pebbles on edges - themed
    seedState = mapSeed + 300;
    ctx.fillStyle = theme.path[0];
    for (let i = 0; i < smoothPath.length; i += 2) {
      if (i >= screenLeft.length || seededRandom() > 0.5) continue;
      const side = seededRandom() > 0.5 ? screenLeft : screenRight;
      const p = side[i];
      ctx.beginPath();
      ctx.ellipse(
        p.x,
        p.y,
        (2 + seededRandom() * 3) * cameraZoom,
        (1.5 + seededRandom() * 2) * cameraZoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw secondary path for dual-path levels
    const levelData = LEVEL_DATA[selectedMap];
    if (
      levelData?.dualPath &&
      levelData?.secondaryPath &&
      MAP_PATHS[levelData.secondaryPath]
    ) {
      const secondaryPath = MAP_PATHS[levelData.secondaryPath];
      const secondaryPathWorldPoints = secondaryPath.map((p) =>
        gridToWorldPath(p)
      );
      //the secondary path needs to have the same exact details as the primary path
      // and thus we can reuse the same functions. it must have the same ruggedness
      // and decorations to match the primary path
      const smoothSecondaryPath = generateSmoothPath(secondaryPathWorldPoints);
      const {
        left: secPathLeft,
        right: secPathRight,
        center: secPathCenter,
      } = addPathWobble(smoothSecondaryPath, 10);
      const secScreenCenter = secPathCenter.map(toScreen);
      const secScreenLeft = secPathLeft.map(toScreen);
      const secScreenRight = secPathRight.map(toScreen);

      // Draw secondary road layers - themed
      //add shadow layer
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.moveTo(secScreenLeft[0].x + 4, secScreenLeft[0].y + 4);
      for (let i = 1; i < secScreenLeft.length; i++)
        ctx.lineTo(secScreenLeft[i].x + 4, secScreenLeft[i].y + 4);
      for (let i = secScreenRight.length - 1; i >= 0; i--)
        ctx.lineTo(secScreenRight[i].x + 4, secScreenRight[i].y + 4);
      ctx.closePath();
      ctx.fill();
      // Main road edge
      ctx.fillStyle = theme.path[2];
      ctx.beginPath();
      ctx.moveTo(secScreenLeft[0].x, secScreenLeft[0].y);
      for (let i = 1; i < secScreenLeft.length; i++)
        ctx.lineTo(secScreenLeft[i].x, secScreenLeft[i].y);
      for (let i = secScreenRight.length - 1; i >= 0; i--)
        ctx.lineTo(secScreenRight[i].x, secScreenRight[i].y);
      ctx.closePath();
      ctx.fill();

      // Inner road
      ctx.fillStyle = theme.path[0];
      ctx.beginPath();
      for (let i = 0; i < secScreenCenter.length; i++) {
        const lx =
          secScreenCenter[i].x +
          (secScreenLeft[i].x - secScreenCenter[i].x) * 0.88;
        const ly =
          secScreenCenter[i].y +
          (secScreenLeft[i].y - secScreenCenter[i].y) * 0.88;
        if (i === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      for (let i = secScreenCenter.length - 1; i >= 0; i--) {
        const rx =
          secScreenCenter[i].x +
          (secScreenRight[i].x - secScreenCenter[i].x) * 0.88;
        const ry =
          secScreenCenter[i].y +
          (secScreenRight[i].y - secScreenCenter[i].y) * 0.88;
        ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();

      // Top road layer
      ctx.fillStyle = theme.path[1];
      ctx.beginPath();
      for (let i = 0; i < secScreenCenter.length; i++) {
        const lx =
          secScreenCenter[i].x +
          (secScreenLeft[i].x - secScreenCenter[i].x) * 0.92;
        const ly =
          secScreenCenter[i].y +
          (secScreenLeft[i].y - secScreenCenter[i].y) * 0.92 -
          2;
        if (i === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      for (let i = secScreenCenter.length - 1; i >= 0; i--) {
        const rx =
          secScreenCenter[i].x +
          (secScreenRight[i].x - secScreenCenter[i].x) * 0.92;
        const ry =
          secScreenCenter[i].y +
          (secScreenRight[i].y - secScreenCenter[i].y) * 0.92 -
          2;
        ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();

      //add pebbles and wheel tracks as well
      // Wheel tracks (use smoothed perpendiculars for consistent corners)
      ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
      ctx.lineWidth = 3 * cameraZoom;
      for (let track = -1; track <= 1; track += 2) {
        ctx.beginPath();
        for (let i = 0; i < smoothSecondaryPath.length; i++) {
          const p = smoothSecondaryPath[i];
          const { perpX, perpY } = getSmoothedPerpendicular(smoothSecondaryPath, i, 3);
          const wobble = Math.sin(i * 0.5 + mapSeed) * 2;
          const screenP = toScreen({
            x: p.x + perpX * ((trackOffset * track) / cameraZoom + wobble),
            y:
              p.y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.75,
          });
          if (i === 0) ctx.moveTo(screenP.x, screenP.y);
          else ctx.lineTo(screenP.x, screenP.y);
        }
        ctx.stroke();
      }
      // Pebbles on edges
      seedState = mapSeed + 300;
      ctx.fillStyle = theme.path[0];
      for (let i = 0; i < smoothSecondaryPath.length; i += 2) {
        if (i >= secScreenLeft.length || seededRandom() > 0.5) continue;
        const side = seededRandom() > 0.5 ? secScreenLeft : secScreenRight;
        const p = side[i];
        ctx.beginPath();
        ctx.ellipse(
          p.x,
          p.y,
          (2 + seededRandom() * 3) * cameraZoom,
          (1.5 + seededRandom() * 2) * cameraZoom,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Now draw fog OVER the road ends to create fade effect
    // Use screenCenter (the actual smoothed road positions) for accurate fog placement
    const directionOffset = Math.min(30, Math.floor(screenCenter.length / 4)); // ~3 control points into path
    const firstScreenPos = screenCenter[0];
    const secondScreenPos = screenCenter[Math.min(directionOffset, screenCenter.length - 1)];
    const lastScreenPos = screenCenter[screenCenter.length - 1];
    const secondLastScreenPos = screenCenter[Math.max(0, screenCenter.length - 1 - directionOffset)];
    // Dark fog at path entrances/exits — scattered circles for irregular edges
    const fogGroundRgb = hexToRgb(theme.ground[2]);
    const fogAccentRgb = hexToRgb(theme.accent);
    const fogPathRgb = hexToRgb(theme.path[2]);
    const drawRoadEndFog = (
      endPos: Position,
      towardsPos: Position,
      size: number
    ) => {
      const time = Date.now() / 4000;
      const dx = endPos.x - towardsPos.x;
      const dy = endPos.y - towardsPos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const dirX = len > 0 ? dx / len : 1;
      const dirY = len > 0 ? dy / len : 0;
      const perpX = -dirY;
      const perpY = dirX;
      const z = cameraZoom;

      // Region-tinted dark fog: blend ground + accent + path for unique look
      const mixR = Math.round(fogGroundRgb.r * 0.5 + fogAccentRgb.r * 0.25 + fogPathRgb.r * 0.25);
      const mixG = Math.round(fogGroundRgb.g * 0.5 + fogAccentRgb.g * 0.25 + fogPathRgb.g * 0.25);
      const mixB = Math.round(fogGroundRgb.b * 0.5 + fogAccentRgb.b * 0.25 + fogPathRgb.b * 0.25);
      const coreR = Math.round(mixR * 0.25);
      const coreG = Math.round(mixG * 0.25);
      const coreB = Math.round(mixB * 0.25);
      const edgeR = Math.round(mixR * 0.55);
      const edgeG = Math.round(mixG * 0.55);
      const edgeB = Math.round(mixB * 0.55);

      const hash = (n: number) => {
        const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453;
        return x - Math.floor(x);
      };

      // Irregular shape via deterministic "arms" extending in random directions
      const armCount = 7;
      const armAngles: number[] = [];
      const armLengths: number[] = [];
      for (let a = 0; a < armCount; a++) {
        armAngles.push(hash(a * 99.1 + 42.7) * Math.PI * 2);
        armLengths.push(0.8 + hash(a * 77.3 + 13.1) * 0.7);
      }

      const getMaxReach = (angle: number): number => {
        let reach = 0.75;
        for (let a = 0; a < armCount; a++) {
          const diff = Math.abs(angle - armAngles[a]);
          const wrapped = Math.min(diff, Math.PI * 2 - diff);
          const influence = Math.max(0, 1 - wrapped / 0.6);
          reach = Math.max(reach, 0.75 + influence * armLengths[a] * 0.6);
        }
        return reach;
      };

      // Scattered dark blobs — circles only, no ellipses = no flat sides
      for (let i = 0; i < 85; i++) {
        const h1 = hash(i * 13.37);
        const h2 = hash(i * 7.91 + 0.5);
        const h3 = hash(i * 3.14 + 1.0);
        const h4 = hash(i * 11.23 + 2.0);

        const angle = h1 * Math.PI * 2;
        const maxR = getMaxReach(angle);
        const rawDist = (h2 * 0.5 + h3 * 0.5) * maxR;

        const alongDist = Math.cos(angle) * rawDist * size;
        const perpDist = Math.sin(angle) * rawDist * size;

        const bx = endPos.x + dirX * alongDist * z + perpX * perpDist * 0.65 * z;
        const by = endPos.y + dirY * alongDist * 0.5 * z + perpY * perpDist * 0.32 * z;

        const animX = Math.sin(time * 0.25 + i * 0.68) * 4 * z;
        const animY = Math.cos(time * 0.2 + i * 0.52) * 2.5 * z;

        const blobSize = size * (0.22 + h4 * 0.3) * z;
        const distNorm = rawDist / maxR;
        const alpha = Math.max(0, 0.45 * (1 - distNorm * distNorm));
        if (alpha <= 0.01) continue;

        const blend = distNorm;
        const cr = coreR + (edgeR - coreR) * blend;
        const cg = coreG + (edgeG - coreG) * blend;
        const cb = coreB + (edgeB - coreB) * blend;

        const grad = ctx.createRadialGradient(
          bx + animX, by + animY, 0,
          bx + animX, by + animY, blobSize
        );
        grad.addColorStop(0, `rgba(${Math.round(cr)},${Math.round(cg)},${Math.round(cb)},${alpha.toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(${edgeR},${edgeG},${edgeB},${(alpha * 0.45).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${edgeR},${edgeG},${edgeB},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx + animX, by + animY, blobSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drifting wisps — slowly orbiting dark puffs for animation
      for (let i = 0; i < 12; i++) {
        const wAngle = time * (0.07 + hash(i + 100) * 0.05) + i * 0.52;
        const wAlongDist = Math.sin(wAngle) * size * 0.65;
        const wPerpDist = Math.cos(wAngle * 0.7 + i) * size * 0.45;
        const wx = endPos.x + dirX * wAlongDist * z + perpX * wPerpDist * 0.65 * z;
        const wy = endPos.y + dirY * wAlongDist * 0.5 * z + perpY * wPerpDist * 0.32 * z;
        const wSize = size * (0.18 + hash(i + 200) * 0.2) * z;
        const wa = 0.14 + 0.07 * Math.sin(time * 0.4 + i);

        const wGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wSize);
        wGrad.addColorStop(0, `rgba(${coreR},${coreG},${coreB},${wa.toFixed(3)})`);
        wGrad.addColorStop(0.45, `rgba(${edgeR},${edgeG},${edgeB},${(wa * 0.4).toFixed(3)})`);
        wGrad.addColorStop(1, `rgba(${edgeR},${edgeG},${edgeB},0)`);
        ctx.fillStyle = wGrad;
        ctx.beginPath();
        ctx.arc(wx, wy, wSize, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawRoadEndFog(firstScreenPos, secondScreenPos, 300);
    drawRoadEndFog(lastScreenPos, secondLastScreenPos, 300);

    // Draw fog for secondary path endpoints (dual-path levels)
    if (
      levelData?.dualPath &&
      levelData?.secondaryPath &&
      MAP_PATHS[levelData.secondaryPath]
    ) {
      const secPath = MAP_PATHS[levelData.secondaryPath];
      // Generate smooth path for accurate fog placement
      const secPathWorldPoints = secPath.map((p) => gridToWorldPath(p));
      const secSmoothPath = generateSmoothPath(secPathWorldPoints);
      const secSmoothScreenPath = secSmoothPath.map(toScreen);
      const secDirOffset = Math.min(30, Math.floor(secSmoothScreenPath.length / 4));

      // Secondary path START (entrance) fog
      const secFirstScreenPos = secSmoothScreenPath[0];
      const secSecondScreenPos = secSmoothScreenPath[Math.min(secDirOffset, secSmoothScreenPath.length - 1)];
      drawRoadEndFog(secFirstScreenPos, secSecondScreenPos, 300);

      // Secondary path END (exit) fog
      const secLastScreenPos = secSmoothScreenPath[secSmoothScreenPath.length - 1];
      const secSecondLastScreenPos = secSmoothScreenPath[Math.max(0, secSmoothScreenPath.length - 1 - secDirOffset)];
      drawRoadEndFog(secLastScreenPos, secSecondLastScreenPos, 300);
    }

    // Generate theme-specific decorations (CACHED for performance)
    // PERFORMANCE FIX: Cache decorations to avoid regenerating 500+ objects every frame
    // This was a major cause of freezing on mobile devices
    let decorations: Decoration[];

    if (cachedDecorationsRef.current && cachedDecorationsRef.current.mapKey === selectedMap) {
      // Use cached decorations
      decorations = cachedDecorationsRef.current.decorations;
    } else {
      // Generate decorations and cache them
      decorations = [];
      seedState = mapSeed + 400;
      const currentTheme = mapTheme;

      // Categorize decorations by type for clustering
      const getDecorationCategories = (theme: string) => {
        switch (theme) {
          case "desert":
            return {
              trees: ["palm", "cactus"],
              structures: ["ruins", "torch", "obelisk"],
              terrain: ["rock", "dune", "sand_pile"],
              scattered: ["skeleton", "bones", "skull", "pottery"],
            };
          case "winter":
            return {
              trees: ["pine_tree", "pine"],
              structures: ["ruins", "fence", "broken_wall"],
              terrain: ["rock", "snow_pile", "ice_crystal", "icicles"],
              scattered: ["aurora_crystal", "frozen_soldier", "snowman"],
            };
          case "volcanic":
            return {
              trees: ["charred_tree"],
              structures: ["obsidian_spike", "fire_pit", "torch"],
              terrain: ["rock", "lava_pool", "ember_rock"],
              scattered: ["skeleton", "bones", "ember", "skull"],
            };
          case "swamp":
            return {
              trees: ["swamp_tree", "mushroom", "mushroom_cluster"],
              structures: ["ruins", "gravestone", "tombstone", "broken_bridge"],
              terrain: ["rock", "lily_pad", "lily_pads", "fog_patch"],
              scattered: ["bones", "frog", "tentacle"],
            };
          default: // grassland
            return {
              trees: ["tree", "bush"],
              structures: ["hut", "fence", "tent", "barrel", "bench", "cart"],
              terrain: ["rock", "grass", "flowers"],
              scattered: ["lamppost", "signpost"],
            };
        }
      };

      const categories = getDecorationCategories(currentTheme);

      // Helper to check if position is on path
      const isOnPath = (worldPos: Position): boolean => {
        for (let j = 0; j < path.length - 1; j++) {
          const p1 = gridToWorldPath(path[j]);
          const p2 = gridToWorldPath(path[j + 1]);
          if (distanceToLineSegment(worldPos, p1, p2) < TOWER_PLACEMENT_BUFFER + 15) {
            return true;
          }
        }
        if (levelData?.secondaryPath && MAP_PATHS[levelData.secondaryPath]) {
          const secPath = MAP_PATHS[levelData.secondaryPath];
          for (let j = 0; j < secPath.length - 1; j++) {
            const p1 = gridToWorldPath(secPath[j]);
            const p2 = gridToWorldPath(secPath[j + 1]);
            if (distanceToLineSegment(worldPos, p1, p2) < TOWER_PLACEMENT_BUFFER + 15) {
              return true;
            }
          }
        }
        return false;
      };

      // Create deterministic zones for different decoration types
      const zoneSize = 4;
      const minX = -12, maxX = GRID_WIDTH + 12;
      const minY = -12, maxY = GRID_HEIGHT + 12;
      const zonesX = Math.ceil((maxX - minX) / zoneSize);
      const zonesY = Math.ceil((maxY - minY) / zoneSize);

      // Helper: distance from nearest path point (in grid coords)
      const distFromPath = (gx: number, gy: number): number => {
        const wp = gridToWorld({ x: gx, y: gy });
        let minDist = Infinity;
        for (let j = 0; j < path.length - 1; j++) {
          const p1 = gridToWorldPath(path[j]);
          const p2 = gridToWorldPath(path[j + 1]);
          const d = distanceToLineSegment(wp, p1, p2);
          if (d < minDist) minDist = d;
        }
        if (levelData?.secondaryPath && MAP_PATHS[levelData.secondaryPath]) {
          const secPath = MAP_PATHS[levelData.secondaryPath];
          for (let j = 0; j < secPath.length - 1; j++) {
            const p1 = gridToWorldPath(secPath[j]);
            const p2 = gridToWorldPath(secPath[j + 1]);
            const d = distanceToLineSegment(wp, p1, p2);
            if (d < minDist) minDist = d;
          }
        }
        return minDist;
      };

      const isBeyondGrid = (gx: number, gy: number): boolean =>
        gx < 0 || gx > GRID_WIDTH || gy < 0 || gy > GRID_HEIGHT;
      const BEYOND_GRID_REDUCE = 0.3;

      // Build landmark exclusion zones from map-defined decorations.
      // Each zone has a core radius (no decorations) and a full radius
      // (small ground-level decorations allowed but trees/structures blocked).
      const landmarkZones: Array<{ cx: number; cy: number; coreR: number; fullR: number }> = [];
      if (levelData?.decorations) {
        for (const deco of levelData.decorations) {
          const decoType = deco.category || deco.type;
          if (decoType && LANDMARK_DECORATION_TYPES.has(decoType)) {
            const size = deco.size || 1;
            const coreR = size * 0.9;
            const fullR = coreR + 0.6;
            landmarkZones.push({ cx: deco.pos.x, cy: deco.pos.y, coreR, fullR });
          }
        }
      }

      const isInLandmarkCore = (gx: number, gy: number): boolean => {
        for (const zone of landmarkZones) {
          const dx = gx - zone.cx;
          const dy = gy - zone.cy;
          if (dx * dx + dy * dy < zone.coreR * zone.coreR) return true;
        }
        return false;
      };

      const isInLandmarkFull = (gx: number, gy: number): boolean => {
        for (const zone of landmarkZones) {
          const dx = gx - zone.cx;
          const dy = gy - zone.cy;
          if (dx * dx + dy * dy < zone.fullR * zone.fullR) return true;
        }
        return false;
      };

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

      // Main environment decorations — increased density
      for (let i = 0; i < 300; i++) {
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
        if (isLargeCategory && isInLandmarkCore(gridX, gridY)) continue;
        if (!isLargeCategory && isInLandmarkFull(gridX, gridY)) continue;

        const typeIndex = Math.floor(seededRandom() * seededRandom() * categoryDecors.length);
        const type = categoryDecors[typeIndex] as DecorationType;

        let baseScale = 0.7;
        let scaleVar = 0.5;
        if (category === "trees") {
          baseScale = 0.75;
          scaleVar = 0.6;
        } else if (category === "structures") {
          baseScale = 0.85;
          scaleVar = 0.4;
        } else if (category === "scattered") {
          baseScale = 0.45;
          scaleVar = 0.45;
        }

        decorations.push({
          type,
          x: worldPos.x,
          y: worldPos.y,
          scale: baseScale + seededRandom() * scaleVar,
          rotation: seededRandom() * Math.PI * 2,
          variant: Math.floor(seededRandom() * 4),
        });
      }

      // Tree clusters — uniformly distributed, reduced beyond grid
      for (let cluster = 0; cluster < 40; cluster++) {
        const clusterX = minX + seededRandom() * (maxX - minX);
        const clusterY = minY + seededRandom() * (maxY - minY);

        if (isBeyondGrid(clusterX, clusterY) && seededRandom() > BEYOND_GRID_REDUCE) continue;

        const treesInCluster = 8 + Math.floor(seededRandom() * 10);
        const treeTypes = categories.trees;
        for (let t = 0; t < treesInCluster; t++) {
          const treeX = clusterX + (seededRandom() - 0.5) * 2.5;
          const treeY = clusterY + (seededRandom() - 0.5) * 2.5;
          const worldPos = gridToWorld({ x: treeX, y: treeY });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(treeX, treeY)) continue;

          decorations.push({
            type: treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.6 + seededRandom() * 0.7,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
          });
        }
      }

      // Interior tree groves — dense pockets away from paths
      for (let grove = 0; grove < 12; grove++) {
        const groveX = minX + 3 + seededRandom() * (maxX - minX - 6);
        const groveY = minY + 3 + seededRandom() * (maxY - minY - 6);
        const groveDist = distFromPath(groveX, groveY);
        if (groveDist < TOWER_PLACEMENT_BUFFER + 40) continue;

        const groveSize = 6 + Math.floor(seededRandom() * 8);
        const treeTypes = categories.trees;
        for (let t = 0; t < groveSize; t++) {
          const tx = groveX + (seededRandom() - 0.5) * 2.2;
          const ty = groveY + (seededRandom() - 0.5) * 2.2;
          const worldPos = gridToWorld({ x: tx, y: ty });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(tx, ty)) continue;

          decorations.push({
            type: treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.65 + seededRandom() * 0.65,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
          });
        }
      }

      // Lively village clusters — tighter spacing with surrounding decorations
      for (let village = 0; village < 12; village++) {
        const villageX = minX + 5 + seededRandom() * (maxX - minX - 10);
        const villageY = minY + 5 + seededRandom() * (maxY - minY - 10);
        const villageCenterWorld = gridToWorld({ x: villageX, y: villageY });
        if (isOnPath(villageCenterWorld)) continue;
        if (distFromPath(villageX, villageY) < TOWER_PLACEMENT_BUFFER + 25) continue;

        const structureTypes = categories.structures;
        const scatteredTypes = categories.scattered;
        const structCount = 6 + Math.floor(seededRandom() * 7);

        // Core structures — tight cluster
        for (let si = 0; si < structCount; si++) {
          const structX = villageX + (seededRandom() - 0.5) * 2.8;
          const structY = villageY + (seededRandom() - 0.5) * 2.8;
          const worldPos = gridToWorld({ x: structX, y: structY });
          if (isOnPath(worldPos)) continue;
          if (isInLandmarkCore(structX, structY)) continue;

          decorations.push({
            type: structureTypes[Math.floor(seededRandom() * structureTypes.length)] as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.7 + seededRandom() * 0.5,
            rotation: seededRandom() * Math.PI * 0.3 - Math.PI * 0.15,
            variant: Math.floor(seededRandom() * 4),
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
          if (isInLandmarkFull(sx, sy)) continue;

          const scType = scatteredTypes.length > 0
            ? scatteredTypes[Math.floor(seededRandom() * scatteredTypes.length)]
            : structureTypes[Math.floor(seededRandom() * structureTypes.length)];
          decorations.push({
            type: scType as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.5 + seededRandom() * 0.4,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
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
          if (isInLandmarkCore(tx, ty)) continue;

          decorations.push({
            type: treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.6 + seededRandom() * 0.5,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
          });
        }
      }

      // Uniform density fill, reduced beyond grid
      for (let i = 0; i < 350; i++) {
        const gx = minX + seededRandom() * (maxX - minX);
        const gy = minY + seededRandom() * (maxY - minY);
        const pathDist = distFromPath(gx, gy);

        const pathFactor = Math.min(1, pathDist / 120);
        if (seededRandom() > pathFactor) continue;

        if (isBeyondGrid(gx, gy) && seededRandom() > BEYOND_GRID_REDUCE) continue;

        const worldPos = gridToWorld({ x: gx, y: gy });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(gx, gy)) continue;

        const allDecorTypes = [...categories.trees, ...categories.terrain];
        const fillType = allDecorTypes[Math.floor(seededRandom() * allDecorTypes.length)] as DecorationType;

        decorations.push({
          type: fillType,
          x: worldPos.x,
          y: worldPos.y,
          scale: 0.5 + seededRandom() * 0.6,
          rotation: seededRandom() * Math.PI * 2,
          variant: Math.floor(seededRandom() * 4),
        });
      }

      // Battle damage (theme-appropriate)
      seedState = mapSeed + 600;
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
      for (let i = 0; i < 280; i++) {
        const gridX = seededRandom() * (GRID_WIDTH + 23) - 11.5;
        const gridY = seededRandom() * (GRID_HEIGHT + 23) - 11.5;

        if (isBeyondGrid(gridX, gridY) && seededRandom() > BEYOND_GRID_REDUCE) continue;
        if (isInLandmarkFull(gridX, gridY)) continue;

        const worldPos = gridToWorld({ x: gridX, y: gridY });
        const type =
          battleDecors[Math.floor(seededRandom() * battleDecors.length)];
        decorations.push({
          type,
          x: worldPos.x,
          y: worldPos.y,
          scale: 0.4 + seededRandom() * 0.55,
          rotation: seededRandom() * Math.PI * 2,
          variant: Math.floor(seededRandom() * 4),
        });
      }

      // Grid edge border decorations — line the perimeter with trees and terrain
      seedState = mapSeed + 800;
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
          if (isInLandmarkCore(gx, gy)) continue;

          const isTree = seededRandom() > 0.3;
          const type = isTree
            ? edgeTreeTypes[Math.floor(seededRandom() * edgeTreeTypes.length)]
            : edgeTerrainTypes[Math.floor(seededRandom() * edgeTerrainTypes.length)];

          decorations.push({
            type: type as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: isTree ? 0.7 + seededRandom() * 0.6 : 0.5 + seededRandom() * 0.5,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
          });
        }
      }

      // Dense decorations around path spawns and exits
      seedState = mapSeed + 700;
      const pathEndpoints: { x: number; y: number }[] = [];

      if (path.length >= 2) {
        pathEndpoints.push(path[0], path[path.length - 1]);
      }

      if (levelData?.secondaryPath && MAP_PATHS[levelData.secondaryPath]) {
        const secPath = MAP_PATHS[levelData.secondaryPath];
        if (secPath.length >= 2) {
          pathEndpoints.push(secPath[0], secPath[secPath.length - 1]);
        }
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
          if (isInLandmarkCore(gx, gy)) continue;

          const type = seededRandom() > 0.3
            ? endpointTreeTypes[Math.floor(seededRandom() * endpointTreeTypes.length)]
            : endpointTerrainTypes[Math.floor(seededRandom() * endpointTerrainTypes.length)];

          decorations.push({
            type: type as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.8 + seededRandom() * 0.7,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
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
          if (isInLandmarkCore(gx, gy)) continue;

          const type = seededRandom() > 0.25
            ? endpointTreeTypes[Math.floor(seededRandom() * endpointTreeTypes.length)]
            : endpointTerrainTypes[Math.floor(seededRandom() * endpointTerrainTypes.length)];

          decorations.push({
            type: type as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.65 + seededRandom() * 0.65,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
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
          if (isInLandmarkFull(gx, gy)) continue;

          const scatteredTypes = [...categories.scattered, ...endpointTerrainTypes];
          const type = scatteredTypes[Math.floor(seededRandom() * scatteredTypes.length)];

          decorations.push({
            type: type as DecorationType,
            x: worldPos.x,
            y: worldPos.y,
            scale: 0.4 + seededRandom() * 0.5,
            rotation: seededRandom() * Math.PI * 2,
            variant: Math.floor(seededRandom() * 4),
          });
        }
      }

      // Add major landmarks from LEVEL_DATA if defined
      const levelDecorations = LEVEL_DATA[selectedMap]?.decorations;
      if (levelDecorations) {
        for (const dec of levelDecorations) {
          const worldPos = gridToWorld(dec.pos);
          const size = dec.size || 1;
          // Add major landmark based on type
          if (dec.type === "pyramid") {
            decorations.push({
              type: "pyramid",
              x: worldPos.x - 300,
              y: worldPos.y - 320,
              scale: size * 1.5,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "obelisk") {
            decorations.push({
              type: "obelisk",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "nassau_hall") {
            decorations.push({
              type: "nassau_hall",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "statue" || dec.type === "demon_statue") {
            decorations.push({
              type: "statue",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.3,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "ruined_temple") {
            decorations.push({
              type: "ruins",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.5,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (
            dec.type === "lava_pool" ||
            dec.type === "lake" ||
            dec.type === "algae_pool"
          ) {
            decorations.push({
              type: "lava_pool",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (
            dec.type === "torch" ||
            dec.type === "fire_pit" ||
            dec.type === "magma_vent"
          ) {
            decorations.push({
              type: "torch",
              x: worldPos.x,
              y: worldPos.y,
              scale: size,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "flowers") {
            decorations.push({
              type: "flowers",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 0.6,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "signpost") {
            decorations.push({
              type: "signpost",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 0.8,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "fountain") {
            decorations.push({
              type: "fountain",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "bench") {
            decorations.push({
              type: "bench",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 0.7,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "lamppost") {
            decorations.push({
              type: "lamppost",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "witch_cottage") {
            decorations.push({
              type: "witch_cottage",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.1,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "cauldron") {
            decorations.push({
              type: "cauldron",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 0.8,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "tentacle") {
            decorations.push({
              type: "tentacle",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "deep_water") {
            decorations.push({
              type: "deep_water",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.3,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "giant_sphinx") {
            decorations.push({
              type: "giant_sphinx",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.4,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "sphinx") {
            decorations.push({
              type: "sphinx",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.4,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "oasis_pool") {
            decorations.push({
              type: "oasis_pool",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.1,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "carnegie_lake") {
            decorations.push({
              type: "carnegie_lake",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "ice_fortress") {
            decorations.push({
              type: "ice_fortress",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.3,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "ice_throne") {
            decorations.push({
              type: "ice_throne",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "frozen_waterfall") {
            decorations.push({
              type: "frozen_waterfall",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.3,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "aurora_crystal") {
            decorations.push({
              type: "aurora_crystal",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.1,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "snow_lantern") {
            decorations.push({
              type: "snow_lantern",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 0.9,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "frozen_pond") {
            decorations.push({
              type: "frozen_pond",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "frozen_soldier") {
            decorations.push({
              type: "frozen_soldier",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.0,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "frozen_gate") {
            decorations.push({
              type: "frozen_gate",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "broken_wall") {
            decorations.push({
              type: "broken_wall",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.1,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "icicles") {
            decorations.push({
              type: "icicles",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.0,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "obsidian_castle") {
            decorations.push({
              type: "obsidian_castle",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.5,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "dark_throne") {
            decorations.push({
              type: "dark_throne",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "dark_barracks") {
            decorations.push({
              type: "dark_barracks",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
          } else if (dec.type === "dark_spire") {
            decorations.push({
              type: "dark_spire",
              x: worldPos.x,
              y: worldPos.y,
              scale: size * 1.2,
              rotation: 0,
              variant: dec.variant,
            });
            // Desert
          } else if (dec.type === "sarcophagus") {
            decorations.push({ type: "sarcophagus", x: worldPos.x, y: worldPos.y, scale: size * 1.1, rotation: 0, variant: dec.variant });
          } else if (dec.type === "cobra_statue") {
            decorations.push({ type: "cobra_statue", x: worldPos.x, y: worldPos.y, scale: size * 1.2, rotation: 0, variant: dec.variant });
          } else if (dec.type === "hieroglyph_wall") {
            decorations.push({ type: "hieroglyph_wall", x: worldPos.x, y: worldPos.y, scale: size * 1.1, rotation: 0, variant: dec.variant });
          } else if (dec.type === "pottery") {
            decorations.push({ type: "pottery", x: worldPos.x, y: worldPos.y, scale: size * 0.9, rotation: 0, variant: dec.variant });
          } else if (dec.type === "sand_pile") {
            decorations.push({ type: "sand_pile", x: worldPos.x, y: worldPos.y, scale: size * 1.0, rotation: 0, variant: dec.variant });
          } else if (dec.type === "treasure_chest") {
            decorations.push({ type: "treasure_chest", x: worldPos.x, y: worldPos.y, scale: size * 0.9, rotation: 0, variant: dec.variant });
            // Volcanic
          } else if (dec.type === "lava_fall") {
            decorations.push({ type: "lava_fall", x: worldPos.x, y: worldPos.y, scale: size * 1.3, rotation: 0, variant: dec.variant });
          } else if (dec.type === "obsidian_pillar") {
            decorations.push({ type: "obsidian_pillar", x: worldPos.x, y: worldPos.y, scale: size * 1.2, rotation: 0, variant: dec.variant });
          } else if (dec.type === "fire_crystal") {
            decorations.push({ type: "fire_crystal", x: worldPos.x, y: worldPos.y, scale: size * 1.1, rotation: 0, variant: dec.variant });
          } else if (dec.type === "skull_throne") {
            decorations.push({ type: "skull_throne", x: worldPos.x, y: worldPos.y, scale: size * 1.2, rotation: 0, variant: dec.variant });
          } else if (dec.type === "ember_rock") {
            decorations.push({ type: "ember_rock", x: worldPos.x, y: worldPos.y, scale: size * 1.0, rotation: 0, variant: dec.variant });
          } else if (dec.type === "volcano_rim") {
            decorations.push({ type: "volcano_rim", x: worldPos.x, y: worldPos.y, scale: size * 1.3, rotation: 0, variant: dec.variant });
            // Swamp
          } else if (dec.type === "sunken_pillar") {
            decorations.push({ type: "sunken_pillar", x: worldPos.x, y: worldPos.y, scale: size * 1.1, rotation: 0, variant: dec.variant });
          } else if (dec.type === "idol_statue") {
            decorations.push({ type: "idol_statue", x: worldPos.x, y: worldPos.y, scale: size * 1.1, rotation: 0, variant: dec.variant });
          } else if (dec.type === "glowing_runes") {
            decorations.push({ type: "glowing_runes", x: worldPos.x, y: worldPos.y, scale: size * 1.0, rotation: 0, variant: dec.variant });
          } else if (dec.type === "hanging_cage") {
            decorations.push({ type: "hanging_cage", x: worldPos.x, y: worldPos.y, scale: size * 1.0, rotation: 0, variant: dec.variant });
          } else if (dec.type === "poison_pool") {
            decorations.push({ type: "poison_pool", x: worldPos.x, y: worldPos.y, scale: size * 1.1, rotation: 0, variant: dec.variant });
          } else if (dec.type === "skeleton_pile") {
            decorations.push({ type: "skeleton_pile", x: worldPos.x, y: worldPos.y, scale: size * 1.0, rotation: 0, variant: dec.variant });
            // Grassland
          } else if (dec.type === "hedge") {
            decorations.push({ type: "hedge", x: worldPos.x, y: worldPos.y, scale: size * 0.9, rotation: 0, variant: dec.variant });
          } else if (dec.type === "campfire") {
            decorations.push({ type: "campfire", x: worldPos.x, y: worldPos.y, scale: size * 0.9, rotation: 0, variant: dec.variant });
          } else if (dec.type === "dock") {
            decorations.push({ type: "dock", x: worldPos.x, y: worldPos.y, scale: size * 1.1, rotation: 0, variant: dec.variant });
          } else if (dec.type === "gate") {
            decorations.push({ type: "gate", x: worldPos.x, y: worldPos.y, scale: size * 1.2, rotation: 0, variant: dec.variant });
          } else if (dec.type === "reeds") {
            decorations.push({ type: "reeds", x: worldPos.x, y: worldPos.y, scale: size * 0.8, rotation: 0, variant: dec.variant });
          } else if (dec.type === "fishing_spot") {
            decorations.push({ type: "fishing_spot", x: worldPos.x, y: worldPos.y, scale: size * 0.9, rotation: 0, variant: dec.variant });
          }
        }
      }

      // Sort by Y for depth
      decorations.sort((a, b) => a.y - b.y);

      // Cache the generated decorations
      cachedDecorationsRef.current = { mapKey: selectedMap, decorations };
    } // End of decoration generation (else block)

    const decorTime = Date.now() / 1000;

    // =========================================================================
    // HAZARD RENDERING - Using imported renderHazard function
    // =========================================================================
    if (LEVEL_DATA[selectedMap].hazards) {
      LEVEL_DATA[selectedMap].hazards.forEach((haz) => {
        renderHazard(
          ctx,
          haz,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cameraZoom
        );
      });
    }

    // Collect renderables
    const renderables: Renderable[] = [];
    // Add decorations to renderables for proper depth sorting
    decorations.forEach((dec) => {
      renderables.push({
        type: "decoration",
        data: { ...dec, decorTime, selectedMap },
        isoY: (dec.x + dec.y) * 0.25,
      });
    });
    towers.forEach((tower) => {
      const worldPos = gridToWorld(tower.pos);
      renderables.push({
        type: "tower",
        data: tower,
        isoY: (worldPos.x + worldPos.y) * 0.25,
      });
    });
    towers.forEach((tower) => {
      if (tower.type === "station" && tower.spawnRange) {
        const worldPos = gridToWorld(tower.pos);
        const isHovered = hoveredTower === tower.id;
        renderables.push({
          type: "station-range",
          data: { ...tower, isHovered },
          isoY: (worldPos.x + worldPos.y) * 0.25 - 1000,
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
          isoY: (worldPos.x + worldPos.y) * 0.25 - 999,
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
          isoY: (worldPos.x + worldPos.y) * 0.25 - 998,
        });
      }
    }
    enemies.forEach((enemy) => {
      const worldPos = getEnemyPosWithPath(enemy, selectedMap);
      // Add small offset based on enemy id hash to prevent z-fighting/flickering
      // when enemies are at the same position
      const idHash = enemy.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const stableOffset = (idHash % 1000) * 0.0001; // Tiny offset for stable sort
      renderables.push({
        type: "enemy",
        data: enemy,
        isoY: (worldPos.x + worldPos.y) * 0.25 + stableOffset,
      });
    });
    if (hero && !hero.dead) {
      renderables.push({
        type: "hero",
        data: hero,
        isoY: (hero.pos.x + hero.pos.y) * 0.25,
      });
    }
    // Only render living troops (dead ones handled separately for ghost effect)
    troops.forEach((troop) => {
      renderables.push({
        type: "troop",
        data: troop,
        isoY: (troop.pos.x + troop.pos.y) * 0.25,
      });
    });
    projectiles.forEach((proj) => {
      const x = proj.from.x + (proj.to.x - proj.from.x) * proj.progress;
      const y = proj.from.y + (proj.to.y - proj.from.y) * proj.progress;
      renderables.push({
        type: "projectile",
        data: proj,
        isoY: (x + y) * 0.25,
      });
    });
    effects.forEach((eff) => {
      renderables.push({
        type: "effect",
        data: eff,
        isoY: (eff.pos.x + eff.pos.y) * 0.25,
      });
    });
    particles.forEach((p) => {
      renderables.push({
        type: "particle",
        data: p,
        isoY: (p.pos.x + p.pos.y) * 0.25,
      });
    });
    // Add special building to renderables for proper depth sorting
    if (LEVEL_DATA[selectedMap]?.specialTower) {
      const spec = LEVEL_DATA[selectedMap].specialTower;
      const worldPos = gridToWorld(spec.pos);

      // Calculate how many towers are being boosted by the beacon (for visual stages)
      let boostedTowerCount = 0;
      if (spec.type === "beacon") {
        const beaconBoostRange = 250;
        boostedTowerCount = towers.filter(t => {
          if (t.type === "club") return false; // Clubs don't receive beacon buffs
          const tWorldPos = gridToWorld(t.pos);
          return distance(tWorldPos, worldPos) < beaconBoostRange;
        }).length;
      }

      renderables.push({
        type: "special-building",
        data: { ...spec, boostedTowerCount },
        isoY: (worldPos.x + worldPos.y) * 0.25,
      });
    }
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
        isoY: (worldPos.x + worldPos.y) * 0.25,
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
          blockedPositions
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
          isoY: (worldPos.x + worldPos.y) * 0.25,
        });
      }
    }
    renderables.sort((a, b) => a.isoY - b.isoY);

    // =========================================================================
    // EPIC ISOMETRIC BUFF AURA (Dynamic Color: Red for Damage, Blue for Range, Gold for Both)
    // =========================================================================
    towers.forEach((t) => {
      const hasDamageBuff = t.damageBoost && t.damageBoost > 1;
      const hasRangeBuff = t.rangeBoost && t.rangeBoost > 1;

      // If no buff is active, don't render the aura
      if (!hasDamageBuff && !hasRangeBuff && !t.isBuffed) return;

      // Color Configuration logic - Gold for both, Red for damage, Blue for range
      const hasBothBuffs = hasDamageBuff && hasRangeBuff;
      const theme = hasBothBuffs
        ? {
          base: "255, 215, 0", // Gold
          accent: "255, 180, 0",
          glow: "#ffd700",
          fill: "rgba(255, 215, 0, 0.08)",
          icon: "⚡",
        }
        : hasDamageBuff
          ? {
            base: "255, 100, 100", // Red/Orange
            accent: "255, 150, 50",
            glow: "#ff6464",
            fill: "rgba(255, 100, 100, 0.06)",
            icon: "🗡",
          }
          : {
            base: "100, 200, 255", // Blue
            accent: "50, 150, 255",
            glow: "#64c8ff",
            fill: "rgba(100, 200, 255, 0.06)",
            icon: "◎",
          };

      const time = Date.now() / 1000;
      const sPos = toScreen(gridToWorld(t.pos));
      const s = cameraZoom;

      // Calculate dynamic pulse - more pronounced for visibility
      const pulse = Math.sin(time * 4) * 0.08;
      const opacity = 0.6 + Math.sin(time * 2) * 0.25;
      const buffPulse = 0.5 + Math.sin(time * 4) * 0.5;

      ctx.save();
      ctx.translate(sPos.x, sPos.y);

      // --- Enhanced Glow Effect (before isometric transform) ---
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 25 * s * buffPulse;

      // IMPORTANT: Squish everything into isometric perspective (2:1 ratio)
      ctx.scale(1, 0.5);

      // --- 1. Soft Core Glow (No rotation) - Larger and more visible ---
      const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 50 * s);
      innerGlow.addColorStop(0, `rgba(${theme.base}, ${0.5 * opacity})`);
      innerGlow.addColorStop(0.5, `rgba(${theme.base}, ${0.25 * opacity})`);
      innerGlow.addColorStop(1, `rgba(${theme.base}, 0)`);
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 55 * s, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. Outer Orbiting Ring (Counter-Clockwise) - Thicker and brighter ---
      ctx.save();
      ctx.rotate(-time * 0.6);
      ctx.strokeStyle = `rgba(${theme.base}, ${0.7 * opacity})`;
      ctx.lineWidth = 3 * s;
      ctx.setLineDash([12 * s, 6 * s]);
      ctx.beginPath();
      ctx.arc(0, 0, 45 * s * (1 + pulse), 0, Math.PI * 2);
      ctx.stroke();

      // Add glowing dots on the outer ring
      const dotCount = hasBothBuffs ? 6 : 4;
      for (let i = 0; i < dotCount; i++) {
        ctx.rotate((Math.PI * 2) / dotCount);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 5 + i) * 0.2})`;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 8 * s;
        ctx.beginPath();
        ctx.arc(45 * s * (1 + pulse), 0, 3 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- 3. The Main Runic Seal (Overlapping Triangles) ---
      ctx.save();
      ctx.rotate(time * 0.8);

      const drawTriangle = (size: number, color: string) => {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const angle = (i * Math.PI * 2) / 3;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
      };

      ctx.lineWidth = 2 * s;
      // Double triangle (Star of David style)
      drawTriangle(32 * s, `rgba(${theme.accent}, ${0.85 * opacity})`);
      ctx.rotate(Math.PI);
      drawTriangle(32 * s, `rgba(${theme.accent}, ${0.85 * opacity})`);

      ctx.fillStyle = theme.fill;
      ctx.fill();
      ctx.restore();

      // --- 4. Inner Orbitals (Floating Particles) - More particles for combined buff ---
      ctx.save();
      ctx.rotate(time * 1.5);
      const orbitalCount = hasBothBuffs ? 5 : 3;
      for (let i = 0; i < orbitalCount; i++) {
        ctx.rotate((Math.PI * 2) / orbitalCount);
        const orbitDist = 20 * s + Math.sin(time * 3 + i) * 6 * s;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 12 * s;
        ctx.shadowColor = theme.glow;
        ctx.beginPath();
        ctx.arc(orbitDist, 0, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- 5. Rising particles effect ---
      ctx.shadowBlur = 0;
      for (let i = 0; i < 4; i++) {
        const riseProgress = ((time * 0.8 + i * 0.25) % 1);
        const riseY = -riseProgress * 60 * s;
        const riseAlpha = (1 - riseProgress) * 0.6 * buffPulse;
        const riseX = Math.sin(time * 3 + i * 2) * 20 * s;

        ctx.fillStyle = `rgba(${theme.base}, ${riseAlpha})`;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.arc(riseX, riseY, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 6. Buff Icon at Bottom of Aura Ring (in isometric space) ---
      ctx.shadowBlur = 0;
      const iconY = 50 * s; // Bottom of the isometric ring

      // Glowing icon background circle
      ctx.fillStyle = `rgba(0, 0, 0, 0.6)`;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 12 * s * buffPulse;
      ctx.beginPath();
      ctx.arc(0, iconY, 10 * s, 0, Math.PI * 2);
      ctx.fill();

      // Icon border
      ctx.strokeStyle = `rgba(${theme.base}, ${0.8 + buffPulse * 0.2})`;
      ctx.lineWidth = 2 * s;
      ctx.stroke();

      ctx.restore();

      // Draw icon outside isometric transform for proper text rendering
      ctx.save();
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 8 * s * buffPulse;
      ctx.fillStyle = `rgba(${theme.base}, 1)`;
      ctx.font = `bold ${11 * s}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(theme.icon, sPos.x, sPos.y + 25 * s); // Bottom of aura in screen space
      ctx.restore();
    });
    // =========================================================================
    // SPECIAL BUILDING RANGE RINGS (On Hover)
    // =========================================================================
    if (hoveredSpecial && LEVEL_DATA[selectedMap]?.specialTower) {
      const time = Date.now() / 1000;
      const spec = LEVEL_DATA[selectedMap].specialTower;
      const sPos = toScreen(gridToWorld(spec.pos));
      const range =
        spec.type === "beacon" ? 150 : spec.type === "shrine" ? 200 : 0;

      if (range > 0) {
        ctx.save();
        ctx.translate(sPos.x, sPos.y);
        ctx.scale(1, 0.5); // Perspective lock

        // Animated spinning ring
        ctx.rotate(time * 0.5);
        ctx.strokeStyle =
          spec.type === "beacon"
            ? "rgba(0, 229, 255, 0.5)"
            : "rgba(118, 255, 3, 0.5)";
        ctx.lineWidth = 3;
        ctx.setLineDash([10 * cameraZoom, 10 * cameraZoom]);
        ctx.beginPath();
        ctx.arc(0, 0, range * cameraZoom, 0, Math.PI * 2);
        ctx.stroke();

        // Inner soft fill
        ctx.fillStyle =
          spec.type === "beacon"
            ? "rgba(0, 229, 255, 0.05)"
            : "rgba(118, 255, 3, 0.05)";
        ctx.fill();
        ctx.restore();
      }
    }

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

    if (moveTargetPos && (selectedTroopForIndicator || heroIsSelectedForIndicator)) {
      const unitPos = selectedTroopForIndicator ? selectedTroopForIndicator.pos : (hero ? hero.pos : moveTargetPos);
      // Get theme color - hero's color if hero selected, otherwise use troop default
      const themeColor = heroIsSelectedForIndicator && hero ? HERO_DATA[hero.type].color : undefined;
      renderPathTargetIndicator(
        ctx,
        {
          targetPos: moveTargetPos,
          isValid: moveTargetValid,
          isHero: !!heroIsSelectedForIndicator,
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

    // Render all entities with camera offset and zoom (including special buildings)
    renderables.forEach((r) => {
      switch (r.type) {
        case "special-building": {
          const spec = r.data as { type: string; pos: Position; hp?: number; boostedTowerCount?: number };
          const sPos = toScreen(gridToWorld(spec.pos));
          renderSpecialBuilding(
            ctx,
            sPos.x,
            sPos.y,
            cameraZoom,
            spec.type,
            spec.hp,
            specialTowerHp,
            vaultFlash,
            spec.boostedTowerCount || 0
          );
          break;
        }


        case "station-range":
          renderStationRange(
            ctx,
            r.data,
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
            r.data,
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
          };
          const decScreenPos = toScreen({ x: decData.x, y: decData.y });
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
            selectedMap: decData.selectedMap,
          });
          ctx.restore();
          break;
        }
        case "tower":
          renderTower(
            ctx,
            r.data,
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
            const activeDebuffs = tower.debuffs?.filter(d => d.until > Date.now());
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
              renderTowerDebuffEffects(ctx, { ...tower, debuffs: activeDebuffs }, towerScreenPos, cameraZoom);
            }
          }
          break;
        case "enemy":
          renderEnemy(
            ctx,
            r.data,
            canvas.width,
            canvas.height,
            dpr,
            selectedMap,
            cameraOffset,
            cameraZoom
          );
          // Note: Inspector indicators are now rendered in a separate top-layer pass below
          break;
        case "hero":
          renderHero(
            ctx,
            r.data,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          // Render hero status effects (burning, slowed, poisoned, stunned)
          {
            const heroData = r.data as Hero;
            if (heroData.burning || heroData.slowed || heroData.poisoned || heroData.stunned) {
              const heroScreenPos = worldToScreen(
                heroData.pos,
                canvas.width,
                canvas.height,
                dpr,
                cameraOffset,
                cameraZoom
              );
              renderUnitStatusEffects(ctx, heroData, heroScreenPos, cameraZoom);
            }
          }
          break;
        case "troop":
          let targetPos: Position | undefined = undefined;
          if (r.data.targetEnemy) {
            const targetEnemy = enemies.find(
              (e) => e.id === r.data.targetEnemy
            );
            if (targetEnemy) {
              targetPos = getEnemyPosWithPath(targetEnemy, selectedMap);
            }
          }
          renderTroop(
            ctx,
            r.data,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom,
            targetPos
          );
          // Render troop status effects (burning, slowed, poisoned, stunned)
          {
            const troopData = r.data as Troop;
            if (troopData.burning || troopData.slowed || troopData.poisoned || troopData.stunned) {
              const troopScreenPos = worldToScreen(
                troopData.pos,
                canvas.width,
                canvas.height,
                dpr,
                cameraOffset,
                cameraZoom
              );
              renderUnitStatusEffects(ctx, troopData, troopScreenPos, cameraZoom);
            }
          }
          break;
        case "projectile":
          renderProjectile(
            ctx,
            r.data,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          break;
        case "effect":
          renderEffect(
            ctx,
            r.data,
            canvas.width,
            canvas.height,
            dpr,
            enemies,
            towers,
            selectedMap,
            cameraOffset,
            cameraZoom
          );
          break;
        case "particle":
          renderParticle(
            ctx,
            r.data,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom
          );
          break;
        case "tower-preview":
          // For repositioning, exclude the tower being moved from validation
          const previewTowers = r.data.isRepositioning
            ? towers.filter((t) => t.id !== repositioningTower)
            : towers;
          renderTowerPreview(
            ctx,
            r.data,
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
    }

    // Restore state
    ctx.restore();

    // Draw environmental effects (particles, atmosphere) based on theme
    const time = Date.now() / 1000;
    renderEnvironment(ctx, mapTheme, width, height, time);
    renderAmbientVisuals(ctx, mapTheme, width, height, time);
  }, [
    cameraOffset,
    cameraZoom,
    selectedMap,
    towers,
    enemies,
    hero,
    troops,
    projectiles,
    effects,
    particles,
    draggingTower,
    hoveredTower,
    selectedTower,
    moveTargetPos,
    moveTargetValid,
    selectedUnitMoveInfo,
    inspectorActive,
    selectedInspectEnemy,
    hoveredInspectEnemy,
  ]);

  // PERFORMANCE FIX: Keep refs updated with latest callbacks
  // This allows the game loop to always use the latest version without restarting
  updateGameRef.current = updateGame;
  renderRef.current = render;

  // Game loop - uses refs to avoid restarting when state changes
  // This prevents freezes when selecting troops/heroes or toggling inspector
  useEffect(() => {
    if (gameState !== "playing") return;
    const gameLoop = (timestamp: number) => {
      // Calculate delta time, but cap it to prevent issues when tab is inactive
      // When user leaves tab and returns, deltaTime could be huge (seconds/minutes)
      // which breaks game logic. Cap at 100ms (10 FPS equivalent) to stay stable.
      const rawDelta = lastTimeRef.current
        ? timestamp - lastTimeRef.current
        : 0;
      const cappedDelta = Math.min(rawDelta, 100); // Max 100ms per frame
      // Use gameSpeedRef instead of gameSpeed to avoid loop restart when pausing/unpausing
      const deltaTime = cappedDelta * gameSpeedRef.current;
      lastTimeRef.current = timestamp;
      // Use refs to call latest versions without restarting the loop
      updateGameRef.current(deltaTime);
      renderRef.current();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState]); // Only restart loop when entering/leaving playing state

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

      // Don't start panning if we're placing a new tower or troop
      if (buildingTower || draggingTower || placingTroop) return;

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

      // If not clicking on any interactive element, start panning
      if (!clickedTower && !clickedHero && !clickedTroop) {
        setIsPanning(true);
        setPanStart(clickPos);
        setPanStartOffset({ ...cameraOffset });
      }
    },
    [buildingTower, draggingTower, placingTroop, selectedTower, towers, hero, troops, cameraOffset, cameraZoom, getCanvasDimensions]
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
          return;
        }
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
            blockedPositions
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

      // ========== INSPECTOR MODE - Handle enemy selection ==========
      // Only intercept clicks for enemy selection when inspector is active AND game is paused
      if (inspectorActive && gameSpeed === 0) {
        const worldPos = screenToWorld(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );

        // Find clicked enemy
        let closestEnemy: Enemy | null = null;
        let closestDist = Infinity;
        const clickRadius = 40 / cameraZoom; // Adjust click radius for zoom

        for (const enemy of enemies) {
          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
          const eData = ENEMY_DATA[enemy.type];
          // Adjust hitbox position for flying enemies (they render higher up)
          const flyingOffset = eData.flying ? 35 : 0;
          const adjustedEnemyPos = { x: enemyPos.x, y: enemyPos.y - flyingOffset };
          const dist = distance(worldPos, adjustedEnemyPos);
          const hitRadius = (eData?.size || 20) * 1.5;

          if (dist < hitRadius + clickRadius && dist < closestDist) {
            closestDist = dist;
            closestEnemy = enemy;
          }
        }

        if (closestEnemy) {
          setSelectedInspectEnemy(closestEnemy);
        } else {
          // Clicked on empty space - deselect
          setSelectedInspectEnemy(null);
        }
        return;
      }

      // ========== PREVENT TOWER PLACEMENT WHEN PAUSED ==========
      if (gameSpeed === 0 && (draggingTower || buildingTower)) {
        // Game is paused - cancel tower placement
        setDraggingTower(null);
        setBuildingTower(null);
        return;
      }

      // ========== TOWER PLACEMENT ==========
      // For touch: buildingTower might be set but draggingTower not (user tapped without dragging)
      // For mouse: draggingTower is set on mouse move
      const towerToPlace = draggingTower || (isTouch && buildingTower ? { type: buildingTower, pos: clickPos } : null);

      if (towerToPlace) {
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
          pawPoints >= towerCost &&
          isValidBuildPosition(
            gridPos,
            selectedMap,
            towers,
            GRID_WIDTH,
            GRID_HEIGHT,
            TOWER_PLACEMENT_BUFFER,
            blockedPositions
          )
        ) {
          const newTower: Tower = {
            id: generateId("tower"),
            type: towerToPlace.type,
            pos: gridPos,
            level: 1,
            lastAttack: 0,
            rotation: 0,
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
          setTowers((prev) => [...prev, newTower]);
          setPawPoints((pp) => pp - towerCost);
          addParticles(gridToWorld(gridPos), "spark", 12);
        }
        setDraggingTower(null);
        setBuildingTower(null);
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
        // Spawn 3 troops in a triangle formation
        // Offsets are larger than TROOP_SEPARATION_DIST (35) to prevent immediate overlap
        const troopOffsets = [
          { x: 0, y: -25 }, // Top
          { x: -25, y: 20 }, // Bottom left
          { x: 25, y: 20 }, // Bottom right
        ];
        const knightHP = TROOP_DATA.knight.hp;
        const newTroops: Troop[] = troopOffsets.map((offset, i) => {
          // Each troop gets their own individual home position to prevent bundling/vibration
          const troopPos = { x: worldPos.x + offset.x, y: worldPos.y + offset.y };
          return {
            id: generateId("troop"),
            ownerId: "spell",
            ownerType: "spell" as const, // Purple themed knight
            pos: troopPos,
            hp: knightHP,
            maxHp: knightHP,
            moving: false,
            lastAttack: 0,
            type: "knight" as const,
            rotation: 0,
            attackAnim: 0,
            selected: false,
            spawnPoint: troopPos, // Individual spawn point, not shared center
            moveRadius: 200,
            spawnSlot: i,
            userTargetPos: troopPos, // Set home position to their starting position
          };
        });
        setTroops((prev) => [...prev, ...newTroops]);
        addParticles(worldPos, "glow", 20);
        addParticles({ x: worldPos.x - 20, y: worldPos.y + 15 }, "spark", 8);
        addParticles({ x: worldPos.x + 20, y: worldPos.y + 15 }, "spark", 8);
        setPlacingTroop(false);
        return;
      }

      // ========== PRIORITIZED SELECTION LOGIC ==========
      // When a hero or troop is selected, prioritize their interactions:
      // 1. Clicking on themselves -> deselect
      // 2. Clicking on path -> move
      // 3. Clicking elsewhere -> deselect (don't select other entities)

      const selectedTroopUnit = troops.find((t) => t.selected);
      const heroIsSelected = hero && !hero.dead && hero.selected;
      const spec = LEVEL_DATA[selectedMap]?.specialTower;

      // Convert to world coordinates for touch-based path calculation
      const clickWorldPos = screenToWorld(
        clickPos,
        width,
        height,
        dpr,
        cameraOffset,
        cameraZoom
      );

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
          setHero((prev) =>
            prev ? { ...prev, moving: true, targetPos: moveTargetPos, selected: false } : null
          );
          addParticles(moveTargetPos, "glow", 5);
          return;
        }

        // For touch: calculate path on-the-fly since there's no hover preview
        if (isTouch) {
          const pathResult = findClosestPathPoint(clickWorldPos, selectedMap);
          if (pathResult && pathResult.distance < HERO_PATH_HITBOX_SIZE * 2.5) {
            setHero((prev) =>
              prev ? { ...prev, moving: true, targetPos: pathResult.point, selected: false } : null
            );
            addParticles(pathResult.point, "glow", 5);
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
          const ownerId = selectedTroopUnit.ownerId;
          const formationTroops = troops.filter((t) => t.ownerId === ownerId);
          const formationOffsets = getFormationOffsets(formationTroops.length);

          // Create a mapping from troop id to their formation index (0, 1, 2...)
          // This ensures sequential positioning even if spawnSlots are non-sequential (e.g., 0 and 2 after one died)
          const troopIdToFormationIndex = new Map<string, number>();
          formationTroops.forEach((t, idx) => {
            troopIdToFormationIndex.set(t.id, idx);
          });

          // Check if owned by a dinky station or frontier barracks
          const station = towers.find((t) => t.id === ownerId && t.type === 'station');
          const isBarracksTroop = ownerId === 'special_barracks';

          setTroops((prev) =>
            prev.map((t) => {
              if (t.ownerId === ownerId) {
                // Use formation index (sequential 0, 1, 2) not spawnSlot (may have gaps)
                const formationIndex = troopIdToFormationIndex.get(t.id) ?? 0;
                const offset = formationOffsets[formationIndex] || { x: 0, y: 0 };
                const newTarget = {
                  x: moveTargetPos.x + offset.x,
                  y: moveTargetPos.y + offset.y,
                };
                return {
                  ...t,
                  moving: true,
                  targetPos: newTarget,
                  userTargetPos: newTarget,
                  selected: false, // Deselect after moving
                  // Update spawn point to rally point for station/barracks troops
                  spawnPoint: (station || isBarracksTroop) ? moveTargetPos : t.spawnPoint,
                };
              }
              return { ...t, selected: false }; // Deselect all troops
            })
          );
          addParticles(moveTargetPos, "light", 5);
          return;
        }

        // For touch: calculate path on-the-fly since there's no hover preview
        if (isTouch) {
          const moveInfo = getTroopMoveInfo(selectedTroopUnit, towers, spec);
          const pathResult = findClosestPathPointWithinRadius(
            clickWorldPos,
            moveInfo.anchorPos,
            moveInfo.moveRadius,
            selectedMap
          );

          if (pathResult) {
            const pathPoint = findClosestPathPoint(clickWorldPos, selectedMap);
            const isNearPath = pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2.5;

            if (pathResult.isValid && isNearPath) {
              const ownerId = selectedTroopUnit.ownerId;
              const formationTroops = troops.filter((t) => t.ownerId === ownerId);
              const formationOffsets = getFormationOffsets(formationTroops.length);

              const troopIdToFormationIndex = new Map<string, number>();
              formationTroops.forEach((t, idx) => {
                troopIdToFormationIndex.set(t.id, idx);
              });

              const station = towers.find((t) => t.id === ownerId && t.type === 'station');
              const isBarracksTroop = ownerId === 'special_barracks';

              setTroops((prev) =>
                prev.map((t) => {
                  if (t.ownerId === ownerId) {
                    const formationIndex = troopIdToFormationIndex.get(t.id) ?? 0;
                    const offset = formationOffsets[formationIndex] || { x: 0, y: 0 };
                    const newTarget = {
                      x: pathResult.point.x + offset.x,
                      y: pathResult.point.y + offset.y,
                    };
                    return {
                      ...t,
                      moving: true,
                      targetPos: newTarget,
                      userTargetPos: newTarget,
                      selected: false,
                      spawnPoint: (station || isBarracksTroop) ? pathResult.point : t.spawnPoint,
                    };
                  }
                  return { ...t, selected: false };
                })
              );
              addParticles(pathResult.point, "light", 5);
              return;
            }
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
      towers,
      hero,
      troops,
      selectedTower,
      selectedMap,
      pawPoints,
      getCanvasDimensions,
      addParticles,
      cameraOffset,
      cameraZoom,
      moveTargetPos,
      moveTargetValid,
      selectedUnitMoveInfo,
      isPanning,
      panStart,
      repositioningTower,
      repositionPreviewPos,
      blockedPositions,
    ]
  );
  const handleMouseMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const isTouch = e.pointerType === 'touch';

      // Track device type
      if (isTouch) {
        isTouchDeviceRef.current = true;
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

      const { width, height, dpr } = getCanvasDimensions();

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
          }
        } else {
          if (buildingTower && !draggingTower) {
            setDraggingTower({ type: buildingTower, pos: { x, y } });
          } else if (draggingTower) {
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

        setHoveredInspectEnemy(hoveredEnemy?.id || null);

        // If game is paused, only handle inspector hover and return
        // Otherwise, continue with normal mouse move handling
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
        }
      } else {
        // Game is running - allow normal tower dragging
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

      // Check if hovering near the special building
      const spec = LEVEL_DATA[selectedMap]?.specialTower;
      if (spec) {
        const specWorldPos = gridToWorld(spec.pos);
        const isHoveringSpec = distance(mouseWorldPos, specWorldPos) < 60;
        setHoveredSpecial(isHoveringSpec);
      } else {
        setHoveredSpecial(false);
      }

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
        if (hoveredTroop && hoveredTroop.ownerId !== "spell") {
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
              const decoWorldPos = gridToWorld(deco.pos);
              const decoScreen = worldToScreen(decoWorldPos, width, height, dpr, cameraOffset, cameraZoom);
              const scale = (deco.size || 1) * cameraZoom;
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
          const isNearPath = pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2;

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
    [buildingTower, draggingTower, getCanvasDimensions, cameraOffset, cameraZoom, towers, selectedMap, hero, troops, inspectorActive, enemies, gameSpeed, isPanning, panStart, panStartOffset, repositioningTower]
  );

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
            return { ...t, level: newLevel, upgrade: newUpgrade };
          }
          return t;
        })
      );

      // If this is a station, upgrade all its troops (without selecting them)
      if (tower.type === "station") {
        // Level 1: footsoldier, Level 2: armored, Level 3: elite, Level 4A: centaur, Level 4B: cavalry
        const newTroopType =
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
                type: newTroopType as Troop,
                maxHp: newHP,
                hp: Math.round(newHP * hpPercent),
                selected: false, // Deselect troops after upgrade
              };
            }
            return t;
          })
        );
      }

      setPawPoints((pp) => pp - cost);
      addParticles(gridToWorld(tower.pos), "glow", 20);
      setSelectedTower(null);
    },
    [addParticles]
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
      setPawPoints((pp) => pp + refund);
      addParticles(gridToWorld(tower.pos), "smoke", 15);
      setTowers((prev) => prev.filter((t) => t.id !== towerId));
      // Remove all troops belonging to this station
      setTroops((prev) => prev.filter((t) => t.ownerId !== towerId));
      setSelectedTower(null);
    },
    [towers, addParticles]
  );
  const castSpell = useCallback(
    (spellType: SpellType) => {
      // Prevent spell casting when game is paused
      if (gameSpeed === 0) return;

      const spell = spells.find((s) => s.type === spellType);
      if (!spell || spell.cooldown > 0) return;
      const cost = SPELL_DATA[spellType].cost;
      if (pawPoints < cost) return;
      if (
        (spellType === "fireball" || spellType === "lightning" || spellType === "freeze" || spellType === "payday") &&
        enemies.length === 0
      ) {
        return;
      }
      setPawPoints((pp) => pp - cost);

      switch (spellType) {
        case "fireball": {
          // METEOR SHOWER - Rains down 10 meteors in random locations, burning enemies
          if (enemies.length > 0) {
            const meteorCount = 10;
            const damagePerMeteor = 50;
            const impactRadius = 100;
            const burnDuration = 4000; // 4 seconds burn
            const burnDamage = 20; // damage per second while burning
            const fallDuration = 1200; // How long meteor takes to fall (ms) - longer for dramatic effect

            // Generate random target positions around enemies
            const meteorTargets: Position[] = [];
            for (let i = 0; i < meteorCount; i++) {
              // Pick a random enemy to target near
              const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
              const basePos = getEnemyPosWithPath(randomEnemy, selectedMap);
              // Add some random offset so meteors spread out more
              const offsetX = (Math.random() - 0.5) * 300;
              const offsetY = (Math.random() - 0.5) * 150;
              meteorTargets.push({
                x: basePos.x + offsetX,
                y: basePos.y + offsetY,
              });
            }

            // Create all meteor effects with staggered delays
            meteorTargets.forEach((targetPos, index) => {
              const staggerDelay = index * 180; // 180ms between each meteor start

              setTimeout(() => {
                // Create falling meteor effect - comes from WAY across screen in top RIGHT
                setEffects((ef) => [
                  ...ef,
                  {
                    id: generateId("meteor_falling"),
                    pos: { x: targetPos.x + 700, y: targetPos.y - 2800 }, // Start from far upper RIGHT
                    targetPos: targetPos,
                    type: "meteor_falling",
                    progress: 0,
                    size: 90,
                    duration: fallDuration,
                    meteorIndex: index,
                  },
                ]);

                // Impact happens when meteor lands (synced with fall animation)
                setTimeout(() => {
                  const now = Date.now();
                  setEnemies((prev) =>
                    prev
                      .map((e) => {
                        const pos = getEnemyPosWithPath(e, selectedMap);
                        const dist = distance(pos, targetPos);
                        if (dist < impactRadius) {
                          // Damage falls off with distance
                          const damageMultiplier = 1 - (dist / impactRadius) * 0.5;
                          const damage = Math.floor(damagePerMeteor * damageMultiplier);
                          const newHp = e.hp - damage;
                          if (newHp <= 0) {
                            const baseBounty = ENEMY_DATA[e.type].bounty;
                            awardBounty(baseBounty, e.goldAura || false, e.id);
                            addParticles(pos, "explosion", 20);
                            addParticles(pos, "fire", 15);
                            if (e.goldAura) addParticles(pos, "gold", 6);
                            return null as any;
                          }
                          // Apply burn effect
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
                      .filter(Boolean)
                  );

                  // Create dramatic impact explosion effect
                  setEffects((ef) => [
                    ...ef,
                    {
                      id: generateId("meteor_impact"),
                      pos: targetPos,
                      type: "meteor_impact",
                      progress: 0,
                      size: impactRadius * 1.5,
                    },
                  ]);
                  addParticles(targetPos, "explosion", 40);
                  addParticles(targetPos, "fire", 35);
                  addParticles(targetPos, "smoke", 25);
                }, fallDuration);
              }, staggerDelay);
            });
          }
          break;
        }

        case "lightning": {
          // ENHANCED LIGHTNING - Strikes 5 enemies one by one with chain effect
          if (enemies.length > 0) {
            const totalDamage = 600;
            const targetCount = Math.min(5, enemies.length);
            const damagePerTarget = Math.floor(totalDamage / targetCount);
            const shuffled = [...enemies].sort(() => Math.random() - 0.5);
            const targets = shuffled.slice(0, targetCount);

            // Strike each target with a delay for dramatic effect
            targets.forEach((target, index) => {
              setTimeout(() => {
                const targetPos = getEnemyPosWithPath(target, selectedMap);

                // Create lightning bolt from sky
                setEffects((ef) => [
                  ...ef,
                  {
                    id: generateId("lightning_bolt"),
                    pos: { x: targetPos.x, y: targetPos.y - 400 },
                    targetPos: targetPos,
                    type: "lightning_bolt",
                    progress: 0,
                    size: 80,
                    strikeIndex: index,
                  },
                ]);

                setEnemies((prev) =>
                  prev
                    .map((e) => {
                      if (e.id === target.id) {
                        const newHp = e.hp - damagePerTarget;
                        if (newHp <= 0) {
                          const baseBounty = ENEMY_DATA[e.type].bounty;
                          awardBounty(baseBounty, e.goldAura || false, e.id);
                          addParticles(targetPos, "spark", 25);
                          addParticles(targetPos, "glow", 15);
                          if (e.goldAura) addParticles(targetPos, "gold", 6);
                          return null as any;
                        }
                        return {
                          ...e,
                          hp: newHp,
                          damageFlash: 250,
                          stunUntil: Date.now() + 500,
                        };
                      }
                      return e;
                    })
                    .filter(Boolean)
                );
                addParticles(targetPos, "spark", 20);
              }, index * 200); // 200ms delay between each strike
            });
          }
          break;
        }

        case "freeze":
          setEnemies((prev) => prev.map((e) => ({ ...e, frozen: true })));
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
          setTimeout(() => {
            setEnemies((prev) => prev.map((e) => ({ ...e, frozen: false })));
          }, 3000);
          break;

        case "payday": {
          // ENHANCED PAYDAY - Creates money aura around all enemies for duration
          // Enemies killed while gold aura active give +50% bounty
          const bonusPerEnemy = 5;
          const basePayout = 80;
          const enemyBonus = Math.min(enemies.length * bonusPerEnemy, 50);
          const totalPayout = basePayout + enemyBonus;

          setPawPoints((pp) => pp + totalPayout);

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
              duration: 10000,
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
          }, 10000);
          break;
        }

        case "reinforcements":
          setPlacingTroop(true);
          break;
      }
      setSpells((prev) =>
        prev.map((s) =>
          s.type === spellType ? { ...s, cooldown: s.maxCooldown } : s
        )
      );
    },
    [spells, pawPoints, enemies, selectedMap, addParticles, gameSpeed]
  );
  const useHeroAbility = useCallback(() => {
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
                const newHp = e.hp - 80;
                if (newHp <= 0) {
                  addParticles(
                    getEnemyPosWithPath(e, selectedMap),
                    "explosion",
                    8
                  );
                  const baseBounty = ENEMY_DATA[e.type].bounty;
                  awardBounty(baseBounty, e.goldAura || false, e.id);
                  if (e.goldAura) addParticles(getEnemyPosWithPath(e, selectedMap), "gold", 6);
                  return null as any;
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
            .filter(Boolean)
        );

        // Heal nearby troops with inspiring melody
        setTroops((prev) =>
          prev.map((t) => {
            if (!t.dead && distance(t.pos, hero.pos) < healRadius) {
              addParticles(t.pos, "magic", 6);
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
        addParticles(hero.pos, "magic", 20);
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
        const newEffects: any[] = [];
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
                const newHp = e.hp - boulderDamage;
                if (newHp <= 0) {
                  addParticles(
                    getEnemyPosWithPath(e, selectedMap),
                    "explosion",
                    12
                  );
                  const baseBounty = ENEMY_DATA[e.type].bounty;
                  awardBounty(baseBounty, e.goldAura || false, e.id);
                  if (e.goldAura) addParticles(getEnemyPosWithPath(e, selectedMap), "gold", 6);
                  return null as any;
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
            .filter(Boolean)
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
        const newTroops: Troop[] = knightOffsets.map((offset, i) => {
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
            attackAnim: 0,
            spawnPoint: knightPos,
            moveRadius: 180, // Captain's summoned knights range
            userTargetPos: knightPos, // Set home position to their starting position
          };
        });
        setTroops((prev) => [...prev, ...newTroops]);
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
          attackAnim: 0,
          spawnPoint: turretPos, // Fixed position
          moveRadius: 0, // Cannot move at all
        };
        setTroops((prev) => [...prev, newTurret]);
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
  }, [hero, enemies, selectedMap, addParticles, gameSpeed]);
  const resetGame = useCallback(() => {
    clearAllTimers();
    gameEndHandledRef.current = false;
    setGameState("menu");
    setPawPoints(INITIAL_PAW_POINTS);
    setLives(INITIAL_LIVES);
    setCurrentWave(0);
    setNextWaveTimer(WAVE_TIMER_BASE);
    setTowers([]);
    setEnemies([]);
    setHero(null);
    setTroops([]);
    setProjectiles([]);
    setEffects([]);
    setParticles([]);
    setSelectedTower(null);
    setBuildingTower(null);
    setDraggingTower(null);
    // Reset panning and repositioning state
    setIsPanning(false);
    setPanStart(null);
    setPanStartOffset(null);
    setRepositioningTower(null);
    setRepositionPreviewPos(null);
    setWaveInProgress(false);
    setPlacingTroop(false);
    setSpells([]);
    setGameSpeed(1);
    setCameraOffset({ x: -40, y: -60 });
    // Reset pausable timer system state
    prevGameSpeedRef.current = 1;
    pausedAtRef.current = null;
    pausableTimeoutsRef.current = [];
    // Reset spawn timing refs
    lastBarracksSpawnRef.current = 0;
    // Mark reset time to prevent stale state race conditions
    gameResetTimeRef.current = Date.now();
    setCameraZoom(1.5);
    setStarsEarned(0);
    setTimeSpent(0);
    setLevelStartTime(0);
    setGoldSpellActive(false);
    // Reset inspector state
    setInspectorActive(false);
    setSelectedInspectEnemy(null);
    setPreviousGameSpeed(1);
    // clear all waves because if u end the level early, they might still be queued
    clearAllTimers();
    if (LEVEL_DATA[selectedMap]?.specialTower?.hp) {
      setSpecialTowerHp(LEVEL_DATA[selectedMap].specialTower.hp);
    } else {
      setSpecialTowerHp(null);
    }
    setTroops((prev) => prev.filter((t) => t.ownerId === "spell"));
    setTroops((prev) => prev.filter((t) => t.ownerId === "special_barracks"));
  }, []);
  // Render different screens based on game state
  // Show WorldMap for both menu and setup (combined into one screen)
  if (gameState === "menu" || gameState === "setup") {
    return (
      <WorldMap
        setGameState={setGameState as any}
        setSelectedMap={setSelectedMap}
        selectedHero={selectedHero}
        setSelectedHero={setSelectedHero}
        selectedSpells={selectedSpells}
        setSelectedSpells={setSelectedSpells}
        unlockedMaps={unlockedMaps}
        levelStars={levelStars}
        levelStats={levelStats}
        gameState={gameState}
      />
    );
  }
  if (gameState === "victory") {
    const currentLevelStats = levelStats?.[selectedMap] || {};
    return (
      <VictoryScreen
        starsEarned={starsEarned}
        lives={lives}
        timeSpent={timeSpent}
        bestTime={currentLevelStats.bestTime}
        bestHearts={currentLevelStats.bestHearts}
        levelName={LEVEL_DATA[selectedMap]?.name || selectedMap}
        resetGame={resetGame}
      />
    );
  }
  if (gameState === "defeat") {
    const currentLevelStats = levelStats?.[selectedMap] || {};
    return (
      <DefeatScreen
        resetGame={resetGame}
        timeSpent={timeSpent}
        waveReached={Math.min(currentWave + 1, totalWaves)}
        totalWaves={totalWaves}
        levelName={LEVEL_DATA[selectedMap]?.name || selectedMap}
        bestTime={currentLevelStats.bestTime}
        timesPlayed={currentLevelStats.timesPlayed || 1}
      />
    );
  }
  // Main game view
  const { width, height, dpr } = getCanvasDimensions();
  return (
    <div className="w-full h-screen bg-black flex flex-col text-amber-100 overflow-hidden">
      <TopHUD
        pawPoints={pawPoints}
        lives={lives}
        currentWave={currentWave}
        totalWaves={totalWaves}
        nextWaveTimer={nextWaveTimer}
        gameSpeed={gameSpeed}
        setGameSpeed={setGameSpeed}
        goldSpellActive={goldSpellActive}
        eatingClubIncomeEvents={eatingClubIncomeEvents}
        onEatingClubEventComplete={(id) => setEatingClubIncomeEvents((prev) => prev.filter((e) => e.id !== id))}
        bountyIncomeEvents={bountyIncomeEvents}
        onBountyEventComplete={(id) => setBountyIncomeEvents((prev) => prev.filter((e) => e.id !== id))}
        inspectorActive={inspectorActive}
        setInspectorActive={setInspectorActive}
        setSelectedInspectEnemy={setSelectedInspectEnemy}
        quitLevel={() => {
          resetGame();
          setGameState("setup");
        }}
        retryLevel={() => {
          clearAllTimers();
          gameEndHandledRef.current = false;
          // Use level-specific starting paw points
          const levelData = LEVEL_DATA[selectedMap];
          const levelStartingPawPoints = levelData?.startingPawPoints ?? INITIAL_PAW_POINTS;
          setPawPoints(levelStartingPawPoints);
          setLives(INITIAL_LIVES);
          setCurrentWave(0);
          setNextWaveTimer(WAVE_TIMER_BASE);
          setTowers([]);
          setEnemies([]);
          setHero(null);
          setTroops([]);
          setProjectiles([]);
          setEffects([]);
          setParticles([]);
          setSelectedTower(null);
          setBuildingTower(null);
          setDraggingTower(null);
          // Reset panning and repositioning state
          setIsPanning(false);
          setPanStart(null);
          setPanStartOffset(null);
          setRepositioningTower(null);
          setRepositionPreviewPos(null);
          setWaveInProgress(false);
          setPlacingTroop(false);
          setSpells([]);
          setGameSpeed(1);
          setGoldSpellActive(false);
          // Reset inspector state
          setInspectorActive(false);
          setSelectedInspectEnemy(null);
          setPreviousGameSpeed(1);
          // Reset pausable timer system state
          prevGameSpeedRef.current = 1;
          pausedAtRef.current = null;
          pausableTimeoutsRef.current = [];
          // Reset spawn timing refs
          lastBarracksSpawnRef.current = 0;
          // Mark reset time to prevent stale state race conditions
          gameResetTimeRef.current = Date.now();
          // clear all waves because if u end the level early, they might still be queued
          setLevelStartTime(Date.now());
          //reset special towers
          if (levelData?.specialTower?.hp) {
            setSpecialTowerHp(levelData.specialTower.hp);
          } else {
            setSpecialTowerHp(null);
          }
        }}
      />
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 bg-gradient-to-br from-amber-950 to-stone-950"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handleCanvasClick}
            onPointerMove={handleMouseMove}
            className={`w-full h-full touch-none ${isPanning ? 'cursor-grabbing' :
              repositioningTower ? 'cursor-move' :
                'cursor-crosshair'
              }`}
          />
          <CameraControls
            setCameraOffset={setCameraOffset}
            setCameraZoom={setCameraZoom}
            defaultOffset={LEVEL_DATA[selectedMap]?.camera?.offset}
          />
          {/* Tooltips - hide on touch devices (too cluttered) and when upgrade panel is open */}
          {!isTouchDeviceRef.current && hoveredTower && !selectedTower &&
            (() => {
              const tower = towers.find((t) => t.id === hoveredTower);
              if (!tower) return null;
              return <TowerHoverTooltip tower={tower} position={mousePos} />;
            })()}
          {!isTouchDeviceRef.current && hoveredHero && hero && !hero.dead && (() => {
            const heroData = HERO_DATA[hero.type];
            const tooltipWidth = 200;
            let tooltipX = mousePos.x + 20;
            let tooltipY = mousePos.y - 30;
            if (tooltipX + tooltipWidth > window.innerWidth - 10)
              tooltipX = mousePos.x - tooltipWidth - 20;
            if (tooltipY < 60) tooltipY = 60;

            return (
              <div
                className="fixed pointer-events-none bg-gradient-to-r from-amber-900/95 via-yellow-900/95 to-amber-900/95 border border-amber-500/70 shadow-2xl rounded-xl backdrop-blur-md overflow-hidden"
                style={{ left: tooltipX, top: tooltipY, zIndex: 250, width: tooltipWidth }}
              >
                {/* Header */}
                <div className="bg-amber-900/40 px-3 py-1.5 border-b border-amber-700/50">
                  <div className="font-bold text-amber-200 text-sm">{heroData.name}</div>
                  <div className="text-xs text-red-300">HP: {Math.floor(hero.hp)}/{hero.maxHp}</div>
                </div>

                {/* Stats row */}
                <div className="px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-400">⚔</span>
                    <span className="text-orange-300 font-medium">{heroData.damage}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">◎</span>
                    <span className="text-blue-300 font-medium">{heroData.range}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">»</span>
                    <span className="text-green-300 font-medium">{heroData.speed}</span>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* Tower upgrade panel */}
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
                />
              );
            })()}
          {placingTroop && <PlacingTroopIndicator />}
          {!isTouchDeviceRef.current && hoveredSpecial && LEVEL_DATA[selectedMap]?.specialTower && (
            <SpecialBuildingTooltip
              type={LEVEL_DATA[selectedMap].specialTower.type}
              hp={specialTowerHp}
              maxHp={LEVEL_DATA[selectedMap].specialTower.hp}
              position={mousePos}
            />
          )}
          {!isTouchDeviceRef.current && hoveredLandmark && !hoveredTower && !selectedTower && (
            <LandmarkTooltip landmarkType={hoveredLandmark} position={mousePos} />
          )}
          {!isTouchDeviceRef.current && hoveredHazardType && !hoveredTower && !selectedTower && (
            <HazardTooltip hazardType={hoveredHazardType} position={mousePos} />
          )}
          {/* Enemy Inspector UI */}
          <EnemyInspector
            isActive={inspectorActive}
            setIsActive={setInspectorActive}
            selectedEnemy={selectedInspectEnemy}
            setSelectedEnemy={setSelectedInspectEnemy}
            enemies={enemies}
            setGameSpeed={setGameSpeed}
            previousGameSpeed={previousGameSpeed}
            setPreviousGameSpeed={setPreviousGameSpeed}
            gameSpeed={gameSpeed}
          />
          {/* Enemy Detail Tooltip when enemy is selected in inspect mode */}
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
          {/* Hero and Spell Bar - overlaid on map at bottom */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 100 }}>
            <HeroSpellBar
              hero={hero}
              spells={spells}
              pawPoints={pawPoints}
              enemies={enemies}
              useHeroAbility={useHeroAbility}
              castSpell={castSpell}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-shrink-0">
        <BuildMenu
          pawPoints={pawPoints}
          buildingTower={buildingTower}
          setBuildingTower={setBuildingTower}
          setHoveredBuildTower={setHoveredBuildTower}
          hoveredTower={hoveredTower}
          setHoveredTower={setHoveredTower}
          setDraggingTower={setDraggingTower}
          placedTowers={towers.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
          }, {} as Record<TowerType, number>)}
        />
      </div>{" "}
    </div>
  );
}
