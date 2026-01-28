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
} from "./rendering";
// Decoration rendering
import { renderDecorationItem } from "./rendering/decorations";
// Hazard game logic
import { calculateHazardEffects, applyHazardEffect } from "./game/hazards";

// Dinky Station spawn management constants
const MAX_STATION_TROOPS = 3;
const TROOP_RESPAWN_TIME = 5000; // 5 seconds
const TROOP_SEPARATION_DIST = 35; // Minimum distance between troops
const TROOP_SIGHT_RANGE = 120; // Base sight range for melee troops
const TROOP_RANGED_SIGHT_RANGE = 200; // Extended sight range for ranged troops (centaur, cavalry)
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
const getFormationOffsets = (count: number): Position[] => {
  if (count === 1) {
    return [{ x: 0, y: 0 }];
  } else if (count === 2) {
    // Line formation
    return [
      { x: -15, y: -10 },
      { x: 15, y: 10 },
    ];
  } else {
    // Triangle formation
    return [
      { x: 0, y: -20 }, // Front (tip of triangle)
      { x: -20, y: 15 }, // Back left
      { x: 20, y: 15 }, // Back right
    ];
  }
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
  const [selectedHero, setSelectedHero] = useState<HeroType | null>(null);
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
  // Camera - start more zoomed in and centered
  const [cameraOffset, setCameraOffset] = useState<Position>({
    x: -40,
    y: -60,
  });
  const [cameraZoom, setCameraZoom] = useState(1.5);
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Wave Management Refs
  const spawnIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Refs for current state values to avoid stale closures in callbacks
  const towersRef = useRef(towers);
  const pawPointsRef = useRef(pawPoints);
  towersRef.current = towers;
  pawPointsRef.current = pawPoints;

  // Get current level waves - computed from selectedMap
  const currentLevelWaves = getLevelWaves(selectedMap);
  const totalWaves = currentLevelWaves.length;

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
  }, []);

  // Performance constants for particles and effects
  const MAX_PARTICLES = 300;
  const MAX_EFFECTS = 50;
  const PARTICLE_THROTTLE_MS = 50; // Minimum time between particle spawns at same position
  const lastParticleSpawn = useRef<Map<string, number>>(new Map());

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
    wave.forEach((group) => {
      let spawned = 0;
      const spawnInterval = setInterval(() => {
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
          group.type === "shadow_knight"
        ) {
          // Bosses use wedge formation
          laneOffset = formationPatterns.wedge(spawned, group.count);
        } else if (
          group.type === "harpy" ||
          group.type === "mascot" ||
          group.type === "wyvern" ||
          group.type === "specter" ||
          group.type === "berserker"
        ) {
          // Fast enemies use diamond
          laneOffset = formationPatterns.diamond(spawned, group.count);
        } else if (group.count > 5) {
          // Large groups use staggered
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
      }, group.interval);
      // Track interval for cleanup
      spawnIntervalsRef.current.push(spawnInterval);
    });
    const waveDuration = Math.max(...wave.map((g) => g.count * g.interval)) + 5000;
    const waveNumberForTimeout = currentWave; // Capture for closure
    console.log(`[Wave] Wave ${currentWave + 1} started, will complete in ${waveDuration}ms`);

    const waveOverTimeout = setTimeout(() => {
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
    // Track timeout for cleanup
    activeTimeoutsRef.current.push(waveOverTimeout);
  }, [waveInProgress, currentWave, selectedMap]);
  // Update game function
  const updateGame = useCallback(
    (deltaTime: number) => {
      const now = Date.now();
      const isPaused = gameSpeed === 0;
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

          // F. Scott's Inspiration buff (+50%, time-limited)
          const isScottActive = t.boostEnd ? now < t.boostEnd : false;
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
          // Heal Troops
          setTroops((prev) =>
            prev.map((t) => {
              if (distance(t.pos, specWorldPos) < healRadius) {
                addParticles(t.pos, "magic", 5);
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

        // C. BARRACKS: Capped & Spread Deployment
        const isSpawnTick =
          Math.floor(now / 12000) > Math.floor((now - deltaTime) / 12000);
        if (spec.type === "barracks" && isSpawnTick) {
          const barracksTroops = troops.filter(
            (t) => t.ownerId === "special_barracks"
          );

          if (barracksTroops.length < 3) {
            const slot = barracksTroops.length;

            // 1. Find the closest path segment to the barracks
            const path = MAP_PATHS[selectedMap];
            const secondaryPath = MAP_PATHS[`${selectedMap}_b`] || null;
            const fullPath = secondaryPath ? path.concat(secondaryPath) : path;

            let closestDist = Infinity;
            let pathAnchor: Position = specWorldPos;
            let closestSegmentStart: Position = specWorldPos;
            let closestSegmentEnd: Position = specWorldPos;

            for (let i = 0; i < fullPath.length - 1; i++) {
              const p1 = gridToWorldPath(fullPath[i]);
              const p2 = gridToWorldPath(fullPath[i + 1]);
              const candidate = closestPointOnLine(specWorldPos, p1, p2);
              const dist = distance(specWorldPos, candidate);
              if (dist < closestDist) {
                closestDist = dist;
                pathAnchor = candidate;
                closestSegmentStart = p1;
                closestSegmentEnd = p2;
              }
            }

            // 2. Calculate direction along the path segment
            const segDx = closestSegmentEnd.x - closestSegmentStart.x;
            const segDy = closestSegmentEnd.y - closestSegmentStart.y;
            const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
            const pathDirX = segLen > 0 ? segDx / segLen : 1;
            const pathDirY = segLen > 0 ? segDy / segLen : 0;

            // 3. Position troops along the path at different distances from anchor
            // Spacing between troops along the path
            const troopSpacing = 35;
            const slotOffsets = [-troopSpacing, 0, troopSpacing]; // spread along path

            const targetPos = {
              x: pathAnchor.x + pathDirX * slotOffsets[slot],
              y: pathAnchor.y + pathDirY * slotOffsets[slot],
            };

            const newTroop: Troop = {
              id: generateId("barracks_unit"),
              ownerId: "special_barracks",
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
              spawnPoint: pathAnchor, // Anchor move radius to the path spot
              moveRadius: 150,
              spawnSlot: slot,
            };
            setTroops((prev) => [...prev, newTroop]);
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
                    setHero((h) =>
                      h ? { ...h, hp: Math.max(0, h.hp - 20) } : null
                    );
                  }
                  return {
                    ...enemy,
                    inCombat: true,
                    combatTarget: hero.id,
                    lastHeroAttack: now,
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
                  setHero((h) =>
                    h ? { ...h, hp: Math.max(0, h.hp - 20) } : null
                  );
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

            // Troop Combat Check
            const nearbyTroop = troops.find(
              (t) =>
                distance(enemyPos, t.pos) < 60 && !ENEMY_DATA[enemy.type].flying
            );
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
                setLives((l) => l - 1);
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

      if (!isPaused) {
        // Scale enemy attack interval with game speed
        const effectiveTroopAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
        enemies.forEach((enemy) => {
          if (enemy.frozen || now < enemy.stunUntil) return;
          if (ENEMY_DATA[enemy.type].flying) return;
          if (now - enemy.lastTroopAttack <= effectiveTroopAttackInterval) return;

          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);

          // Check if hero is nearby (hero takes combat priority over troops)
          const heroNearby =
            hero && !hero.dead && distance(enemyPos, hero.pos) < 60;
          if (heroNearby) return; // Hero will handle this enemy

          // Check for nearby troop
          const nearbyTroop = troops.find((t) => distance(enemyPos, t.pos) < 60);
          if (nearbyTroop) {
            troopDamage[nearbyTroop.id] = (troopDamage[nearbyTroop.id] || 0) + 15;
            enemiesAttackingTroops[enemy.id] = nearbyTroop.id;
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

      // Apply troop damage and remove dead troops
      if (Object.keys(troopDamage).length > 0) {
        setTroops((prevTroops) => {
          return prevTroops
            .filter((troop) => !troopsThatWillDie.has(troop.id))
            .map((troop) => {
              const damage = troopDamage[troop.id] || 0;
              if (damage > 0) {
                return { ...troop, hp: troop.hp - damage };
              }
              return troop;
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
                const goldBonus = enemy.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                setPawPoints((pp) => pp + baseBounty + goldBonus);
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
                  const newHp = prevHero.hp - 20;
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
            const nearbyTroop = troops.find(
              (t) =>
                distance(getEnemyPosWithPath(enemy, selectedMap), t.pos) < 60 &&
                !ENEMY_DATA[enemy.type].flying
            );
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
                  // Create projectile
                  const projType =
                    enemy.type === "mage" ||
                      enemy.type === "warlock" ||
                      enemy.type === "hexer" ||
                      enemy.type === "necromancer"
                      ? "magicBolt"
                      : enemy.type === "catapult"
                        ? "rock"
                        : "arrow";
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
                setLives((l) => l - 1);
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
      // Enemy separation - prevent stacking
      setEnemies((prev) => {
        const SEPARATION_DISTANCE = 25;
        const SEPARATION_FORCE = 0.3;
        return prev.map((enemy) => {
          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
          let separationX = 0;
          let separationY = 0;
          for (const other of prev) {
            if (other.id === enemy.id) continue;
            const otherPos = getEnemyPosWithPath(other, selectedMap);
            const dx = enemyPos.x - otherPos.x;
            const dy = enemyPos.y - otherPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < SEPARATION_DISTANCE && dist > 0) {
              const force =
                ((SEPARATION_DISTANCE - dist) / SEPARATION_DISTANCE) *
                SEPARATION_FORCE;
              separationX += (dx / dist) * force;
              separationY += (dy / dist) * force;
            }
          }
          if (Math.abs(separationX) > 0.01 || Math.abs(separationY) > 0.01) {
            // Apply separation as lane offset adjustment
            const newLaneOffset = Math.max(
              -1,
              Math.min(1, enemy.laneOffset + separationX * 0.02)
            );
            return { ...enemy, laneOffset: newLaneOffset };
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

          if (closestEnemy) {
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
                const speed = 2.0; // Slightly faster when engaging
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
            // No enemy in sight - return home if not there (unless stationary)
            updated.engaging = false;

            if (homePos && !isStationary) {
              const dx = homePos.x - troop.pos.x;
              const dy = homePos.y - troop.pos.y;
              const distToHome = Math.sqrt(dx * dx + dy * dy);

              if (distToHome > 8) {
                // Not at home - move back
                const speed = 1.5;
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

          // HP regeneration - regenerate 2% max HP per second when not in combat
          const inCombat = enemiesInSight.length > 0;
          if (!inCombat && troop.hp < troop.maxHp) {
            updated.hp = Math.min(
              troop.maxHp,
              troop.hp + (troop.maxHp * 0.02 * deltaTime) / 1000
            );
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
      // Hero HP regeneration

      if (hero && !hero.dead && hero.hp < hero.maxHp) {
        // Consider in combat if any enemy is within 100 pixels OR currently targeting hero
        const inCombat =
          enemies.some(
            (e) =>
              distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <= 100
          ) || enemies.some((e) => e.combatTarget === hero.id);

        // set a timer if the hero is in combat, only after this timer is done
        // will the hero start regenerating HP

        if (!inCombat) {
          const regenTimeout = setTimeout(() => {
            setHero((prev) =>
              prev
                ? {
                  ...prev,
                  hp: Math.min(
                    prev.maxHp,
                    prev.hp + (prev.maxHp * 0.03 * deltaTime) / 1000
                  ),
                }
                : null
            );
          }, 5000);
          activeTimeoutsRef.current.push(regenTimeout);
        }
      }
      // Tower attacks - skip when paused
      if (!isPaused) {
        towers.forEach((tower) => {
          const tData = TOWER_DATA[tower.type];
          const towerWorldPos = gridToWorld(tower.pos);

          // Final Buffed Stats for this tick - use calculateTowerStats for proper level-based range
          const towerStats = calculateTowerStats(
            tower.type,
            tower.level,
            tower.upgrade,
            tower.rangeBoost || 1,
            tower.damageBoost || 1
          );
          const finalRange = towerStats.range;
          const finalDamageMult = tower.damageBoost || 1.0;

          if (tower.type === "club") {
            // ENHANCED CLUB TOWER - More useful income generator
            // Level 1: Basic Club - 8 PP every 8s
            // Level 2: Popular Club - 15 PP every 7s + bonus on kills nearby
            // Level 3: Grand Club - 25 PP every 6s + slow enemies in range
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

            // Level 3+ Grand Club: Slow nearby enemies (greed aura)
            if (tower.level >= 3) {
              const auraRange = 100 + tower.level * 20;
              enemies.forEach((e) => {
                const enemyPos = getEnemyPosWithPath(e, selectedMap);
                if (distance(towerWorldPos, enemyPos) <= auraRange) {
                  const slowAmount = tower.level === 3 ? 0.15 : 0.2;
                  setEnemies((prev) =>
                    prev.map((enemy) =>
                      enemy.id === e.id
                        ? {
                          ...enemy,
                          slowEffect: Math.max(enemy.slowEffect, slowAmount),
                        }
                        : enemy
                    )
                  );
                }
              });
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
                setPawPoints((pp) => pp + bountyEarned);
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
              // Update or add slow field effect
              setEffects((ef) => {
                const existingField = ef.find(
                  (e) => e.type === effectType && e.towerId === tower.id
                );
                if (existingField) {
                  return ef.map((e) =>
                    e.id === existingField.id ? { ...e, progress: 0 } : e
                  );
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
              if (arrivedAtPlatform && now - tower.lastAttack > stationSpawnInterval) {
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
                  const updated = prev.map((t) => {
                    if (t.ownerId === tower.id) {
                      const newFormation = getFormationOffsets(futureCount);
                      const offset = newFormation[t.spawnSlot] || { x: 0, y: 0 };
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
            // Scale attack cooldown with game speed
            const effectiveAttackCooldown = gameSpeed > 0 ? attackCooldown / gameSpeed : attackCooldown;
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
                        const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                        setPawPoints((pp) => pp + baseBounty + goldBonus);
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
            // Scale attack cooldown with game speed
            const effectiveLabCooldown = gameSpeed > 0 ? attackCooldown / gameSpeed : attackCooldown;
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
                          const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                          setPawPoints((pp) => pp + baseBounty + goldBonus);
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
                          const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                          setPawPoints((pp) => pp + baseBounty + goldBonus);
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
                        const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                        setPawPoints((pp) => pp + baseBounty + goldBonus);
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
            setEnemies((prev) =>
              prev
                .map((e) => {
                  if (e.id === target.id) {
                    const newHp = e.hp - heroData.damage;
                    if (newHp <= 0) {
                      const baseBounty = ENEMY_DATA[e.type].bounty;
                      const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                      setPawPoints((pp) => pp + baseBounty + goldBonus);
                      if (hero.type === "scott") setPawPoints((pp) => pp + 1);
                      addParticles(targetPos, "explosion", 10);
                      if (e.goldAura) addParticles(targetPos, "gold", 6);
                      setEffects((ef) => [
                        ...ef,
                        {
                          id: generateId("eff"),
                          pos: targetPos,
                          type: "explosion",
                          progress: 0,
                          size: 25,
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
            const dx = targetPos.x - hero.pos.x;
            const dy = targetPos.y - hero.pos.y;
            const rotation = Math.atan2(dy, dx);
            setHero((prev) =>
              prev
                ? { ...prev, lastAttack: now, rotation, attackAnim: 300 }
                : null
            );
            if (heroData.range > 80) {
              setProjectiles((prev) => [
                ...prev,
                {
                  id: generateId("proj"),
                  from: hero.pos,
                  to: targetPos,
                  progress: 0,
                  type: "hero",
                  rotation,
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
                        const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                        setPawPoints((pp) => pp + baseBounty + goldBonus);
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
                      attackAnim: troopData.isRanged ? 400 : 300,
                      rotation,
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
      // Update projectiles and handle enemy projectile damage
      setProjectiles((prev) => {
        const completingProjectiles = prev.filter(
          (p) =>
            p.progress + deltaTime / 300 >= 1 &&
            p.targetType &&
            p.targetId &&
            p.damage
        );

        // Deal damage from enemy projectiles to heroes/troops
        completingProjectiles.forEach((proj) => {
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
                  return { ...prev, hp: 0, dead: true, respawnTimer: 15000 };
                }
                return { ...prev, hp: newHp };
              }
              return prev;
            });
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
                    return { ...t, hp: newHp };
                  }
                  return t;
                })
                .filter(Boolean)
            );
          }
        });

        return prev
          .map((proj) => ({
            ...proj,
            progress: Math.min(1, proj.progress + deltaTime / 300),
          }))
          .filter((p) => p.progress < 1);
      });
      // Update effects - with hard cap
      setEffects((prev) => {
        const updated = prev
          .map((eff) => ({ ...eff, progress: eff.progress + deltaTime / (eff.duration || 500) }))
          .filter((e) => e.progress < 1);
        // Hard cap on effects
        if (updated.length > MAX_EFFECTS) {
          return updated.slice(updated.length - MAX_EFFECTS);
        }
        return updated;
      });
      // Update particles - optimized batch update
      setParticles((prev) => {
        // Skip update if no particles
        if (prev.length === 0) return prev;

        const updated: Particle[] = [];
        const deltaScale = deltaTime / 16;

        for (const p of prev) {
          const newLife = p.life - deltaTime;
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
      // Update spell cooldowns
      setSpells((prev) =>
        prev.map((spell) => ({
          ...spell,
          cooldown: Math.max(0, spell.cooldown - deltaTime),
        }))
      );
      // Check win/lose conditions - only if still playing to prevent duplicate triggers
      if (lives <= 0 && gameState === "playing") {
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
        !waveInProgress
      ) {
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
    // Helper function to draw fog that gradually obscures road end
    // Helper function to draw fog that gradually obscures road end - themed
    const fogBaseRgb = hexToRgb(theme.ground[2]);
    const drawRoadEndFog = (
      endPos: Position,
      towardsPos: Position,
      size: number
    ) => {
      const time = Date.now() / 4000;
      // Calculate direction from endPos outward (away from the visible path)
      const dx = endPos.x - towardsPos.x;
      const dy = endPos.y - towardsPos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const dirX = len > 0 ? dx / len : 1;
      const dirY = len > 0 ? dy / len : 0;
      // Draw graduated fog layers CENTERED at endPos, spreading outward
      for (let layer = 0; layer < 8; layer++) {
        const layerDist = (layer - 4) * size * 0.15; // Center at endPos, spread both directions
        const layerX = endPos.x + dirX * layerDist;
        const layerY = endPos.y + dirY * layerDist * 0.5; // Isometric Y compression
        const layerSize = size * (0.8 + layer * 0.1);
        const layerAlpha = Math.min(0.9, layer * 0.12); // Gradually increase opacity
        // Animated offset for cloud-like movement
        const animX = Math.sin(time + layer * 0.5) * 4 * cameraZoom;
        const animY = Math.cos(time * 0.7 + layer * 0.3) * 2 * cameraZoom;
        // Fog gradient - themed
        const fogGradient = ctx.createRadialGradient(
          layerX + animX,
          layerY + animY,
          0,
          layerX + animX,
          layerY + animY,
          layerSize * cameraZoom
        );
        fogGradient.addColorStop(
          0,
          `rgba(${fogBaseRgb.r}, ${fogBaseRgb.g}, ${fogBaseRgb.b}, ${layerAlpha})`
        );
        fogGradient.addColorStop(
          0.3,
          `rgba(${fogBaseRgb.r + 4}, ${fogBaseRgb.g + 4}, ${fogBaseRgb.b + 4
          }, ${layerAlpha * 0.75})`
        );
        fogGradient.addColorStop(
          0.6,
          `rgba(${fogBaseRgb.r + 8}, ${fogBaseRgb.g + 8}, ${fogBaseRgb.b + 8
          }, ${layerAlpha * 0.4})`
        );
        fogGradient.addColorStop(
          1,
          `rgba(${fogBaseRgb.r + 12}, ${fogBaseRgb.g + 12}, ${fogBaseRgb.b + 12
          }, 0)`
        );
        ctx.fillStyle = fogGradient;
        ctx.beginPath();
        ctx.ellipse(
          layerX + animX,
          layerY + animY,
          layerSize * cameraZoom,
          layerSize * 0.5 * cameraZoom,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      // Add wispy cloud puffs around the fog area - themed
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + time * 0.15;
        const dist = size * 0.5 + Math.sin(time + i) * size * 0.1;
        const puffX = endPos.x + Math.cos(angle) * dist * cameraZoom * 0.6;
        const puffY = endPos.y + Math.sin(angle) * dist * 0.3 * cameraZoom;
        const puffSize =
          (size * 0.35 + Math.sin(time * 1.5 + i * 1.2) * size * 0.1) *
          cameraZoom;
        const puffGradient = ctx.createRadialGradient(
          puffX,
          puffY,
          0,
          puffX,
          puffY,
          puffSize
        );
        puffGradient.addColorStop(
          0,
          `rgba(${fogBaseRgb.r + 20}, ${fogBaseRgb.g + 18}, ${fogBaseRgb.b + 14
          }, 0.5)`
        );
        puffGradient.addColorStop(
          0.5,
          `rgba(${fogBaseRgb.r + 15}, ${fogBaseRgb.g + 14}, ${fogBaseRgb.b + 10
          }, 0.25)`
        );
        puffGradient.addColorStop(
          1,
          `rgba(${fogBaseRgb.r + 10}, ${fogBaseRgb.g + 10}, ${fogBaseRgb.b + 8
          }, 0)`
        );
        ctx.fillStyle = puffGradient;
        ctx.beginPath();
        ctx.ellipse(puffX, puffY, puffSize, puffSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Subtle lighter mist highlights for depth - themed
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + time * 0.1 + 0.5;
        const dist = size * 0.4 + Math.cos(time * 0.6 + i) * size * 0.12;
        const mistX = endPos.x + Math.cos(angle) * dist * 0.5 * cameraZoom;
        const mistY = endPos.y + Math.sin(angle) * dist * 0.25 * cameraZoom;
        const mistSize = size * 0.2 * cameraZoom;
        const mistGradient = ctx.createRadialGradient(
          mistX,
          mistY - mistSize * 0.15,
          0,
          mistX,
          mistY,
          mistSize
        );
        mistGradient.addColorStop(
          0,
          `rgba(${Math.min(255, fogBaseRgb.r + 100)}, ${Math.min(
            255,
            fogBaseRgb.g + 90
          )}, ${Math.min(255, fogBaseRgb.b + 75)}, 0.15)`
        );
        mistGradient.addColorStop(
          0.5,
          `rgba(${Math.min(255, fogBaseRgb.r + 80)}, ${Math.min(
            255,
            fogBaseRgb.g + 70
          )}, ${Math.min(255, fogBaseRgb.b + 60)}, 0.08)`
        );
        mistGradient.addColorStop(
          1,
          `rgba(${Math.min(255, fogBaseRgb.r + 60)}, ${Math.min(
            255,
            fogBaseRgb.g + 52
          )}, ${Math.min(255, fogBaseRgb.b + 42)}, 0)`
        );
        ctx.fillStyle = mistGradient;
        ctx.beginPath();
        ctx.ellipse(mistX, mistY, mistSize, mistSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    // Draw fog at path start (enemy entrance) - large to fully obscure road exit
    drawRoadEndFog(firstScreenPos, secondScreenPos, 120);
    // Draw fog at path end (enemy exit)
    drawRoadEndFog(lastScreenPos, secondLastScreenPos, 120);

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
      drawRoadEndFog(secFirstScreenPos, secSecondScreenPos, 120);

      // Secondary path END (exit) fog
      const secLastScreenPos = secSmoothScreenPath[secSmoothScreenPath.length - 1];
      const secSecondLastScreenPos = secSmoothScreenPath[Math.max(0, secSmoothScreenPath.length - 1 - secDirOffset)];
      drawRoadEndFog(secLastScreenPos, secSecondLastScreenPos, 120);
    }

    // Generate theme-specific decorations
    // DecorationType and Decoration are imported from ./types
    seedState = mapSeed + 400;
    const decorations: Decoration[] = [];

    // Get current theme
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
            scattered: ["snowman", "frozen_soldier"],
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
    // Divide the expanded grid into zones, each zone gets a primary decoration category
    const zoneSize = 6; // Grid units per zone
    const minX = -9, maxX = GRID_WIDTH + 9;
    const minY = -9, maxY = GRID_HEIGHT + 9;
    const zonesX = Math.ceil((maxX - minX) / zoneSize);
    const zonesY = Math.ceil((maxY - minY) / zoneSize);

    // Generate zone assignments deterministically based on seed
    const zoneAssignments: (keyof typeof categories)[][] = [];
    for (let zx = 0; zx < zonesX; zx++) {
      zoneAssignments[zx] = [];
      for (let zy = 0; zy < zonesY; zy++) {
        // Use a deterministic hash based on zone position and seed
        const zoneHash = (mapSeed * 31 + zx * 17 + zy * 13) % 100;
        // Weight towards trees (40%), terrain (30%), structures (20%), scattered (10%)
        let cat: keyof typeof categories;
        if (zoneHash < 40) cat = "trees";
        else if (zoneHash < 70) cat = "terrain";
        else if (zoneHash < 90) cat = "structures";
        else cat = "scattered";
        zoneAssignments[zx][zy] = cat;
      }
    }

    // Environment decorations - clustered by zone with variation
    for (let i = 0; i < 400; i++) {
      // Pick a zone first, then place within that zone with some jitter
      const zoneX = Math.floor(seededRandom() * zonesX);
      const zoneY = Math.floor(seededRandom() * zonesY);
      const category = zoneAssignments[zoneX][zoneY];
      const categoryDecors = categories[category];

      if (!categoryDecors || categoryDecors.length === 0) continue;

      // Position within zone with clustering (bias towards zone center)
      const zoneCenterX = minX + (zoneX + 0.5) * zoneSize;
      const zoneCenterY = minY + (zoneY + 0.5) * zoneSize;
      // Gaussian-like distribution towards center
      const offsetX = (seededRandom() - 0.5 + seededRandom() - 0.5) * zoneSize * 0.8;
      const offsetY = (seededRandom() - 0.5 + seededRandom() - 0.5) * zoneSize * 0.8;
      const gridX = zoneCenterX + offsetX;
      const gridY = zoneCenterY + offsetY;

      const worldPos = gridToWorld({ x: gridX, y: gridY });
      if (isOnPath(worldPos)) continue;

      // Pick decoration from category (slight bias towards first items for consistency)
      const typeIndex = Math.floor(seededRandom() * seededRandom() * categoryDecors.length);
      const type = categoryDecors[typeIndex] as DecorationType;

      // Scale varies by category
      let baseScale = 0.7;
      let scaleVar = 0.4;
      if (category === "trees") {
        baseScale = 0.8;
        scaleVar = 0.5;
      } else if (category === "structures") {
        baseScale = 0.9;
        scaleVar = 0.3;
      } else if (category === "scattered") {
        baseScale = 0.5;
        scaleVar = 0.4;
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

    // Add extra tree clusters at edges (forests feel)
    for (let cluster = 0; cluster < 16; cluster++) {
      // Pick cluster center at map edges
      const edgeSide = Math.floor(seededRandom() * 4);
      let clusterX: number, clusterY: number;
      if (edgeSide === 0) { // Left edge
        clusterX = minX + seededRandom() * 4;
        clusterY = minY + seededRandom() * (maxY - minY);
      } else if (edgeSide === 1) { // Right edge
        clusterX = maxX - seededRandom() * 4;
        clusterY = minY + seededRandom() * (maxY - minY);
      } else if (edgeSide === 2) { // Top edge
        clusterX = minX + seededRandom() * (maxX - minX);
        clusterY = minY + seededRandom() * 4;
      } else { // Bottom edge
        clusterX = minX + seededRandom() * (maxX - minX);
        clusterY = maxY - seededRandom() * 4;
      }

      // Add 4-8 trees in this cluster
      const treesInCluster = 4 + Math.floor(seededRandom() * 5);
      const treeTypes = categories.trees;
      for (let t = 0; t < treesInCluster; t++) {
        const treeX = clusterX + (seededRandom() - 0.5) * 3;
        const treeY = clusterY + (seededRandom() - 0.5) * 3;
        const worldPos = gridToWorld({ x: treeX, y: treeY });
        if (isOnPath(worldPos)) continue;

        decorations.push({
          type: treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType,
          x: worldPos.x,
          y: worldPos.y,
          scale: 0.7 + seededRandom() * 0.6,
          rotation: seededRandom() * Math.PI * 2,
          variant: Math.floor(seededRandom() * 4),
        });
      }
    }

    // Add structure clusters (small villages/camps)
    for (let village = 0; village < 6; village++) {
      const villageX = minX + 4 + seededRandom() * (maxX - minX - 8);
      const villageY = minY + 4 + seededRandom() * (maxY - minY - 8);

      // Check if village center is on path
      const villageCenterWorld = gridToWorld({ x: villageX, y: villageY });
      if (isOnPath(villageCenterWorld)) continue;

      const structureTypes = categories.structures;
      const structuresInVillage = 3 + Math.floor(seededRandom() * 4);
      for (let s = 0; s < structuresInVillage; s++) {
        const structX = villageX + (seededRandom() - 0.5) * 4;
        const structY = villageY + (seededRandom() - 0.5) * 4;
        const worldPos = gridToWorld({ x: structX, y: structY });
        if (isOnPath(worldPos)) continue;

        decorations.push({
          type: structureTypes[Math.floor(seededRandom() * structureTypes.length)] as DecorationType,
          x: worldPos.x,
          y: worldPos.y,
          scale: 0.8 + seededRandom() * 0.4,
          rotation: seededRandom() * Math.PI * 0.3 - Math.PI * 0.15, // Slight rotation only
          variant: Math.floor(seededRandom() * 5),
        });
      }
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
    // Battle damage - expanded +10 in every direction isometrically
    for (let i = 0; i < 240; i++) {
      const gridX = seededRandom() * (GRID_WIDTH + 19) - 9.5;
      const gridY = seededRandom() * (GRID_HEIGHT + 19) - 9.5;
      const worldPos = gridToWorld({ x: gridX, y: gridY });
      const type =
        battleDecors[Math.floor(seededRandom() * battleDecors.length)];
      decorations.push({
        type,
        x: worldPos.x,
        y: worldPos.y,
        scale: 0.5 + seededRandom() * 0.5,
        rotation: seededRandom() * Math.PI * 2,
        variant: Math.floor(seededRandom() * 4),
      });
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
        }
      }
    }

    // Sort by Y for depth
    decorations.sort((a, b) => a.y - b.y);
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


    // Render decorations using the imported renderDecorationItem function
    for (const dec of decorations) {
      const screenPos = toScreen({ x: dec.x, y: dec.y });
      const s = cameraZoom * dec.scale;

      ctx.save();
      renderDecorationItem({
        ctx,
        screenPos,
        scale: s,
        type: dec.type,
        rotation: dec.rotation,
        variant: dec.variant,
        decorTime,
        decorX: dec.x,
        selectedMap,
      });
      ctx.restore();
    }


    // Collect renderables
    const renderables: Renderable[] = [];
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
      renderables.push({
        type: "enemy",
        data: enemy,
        isoY: (worldPos.x + worldPos.y) * 0.25,
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
      renderables.push({
        type: "special-building",
        data: spec,
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

    // Render all entities with camera offset and zoom (including special buildings)
    renderables.forEach((r) => {
      switch (r.type) {
        case "special-building": {
          const spec = r.data as { type: string; pos: Position; hp?: number };
          const sPos = toScreen(gridToWorld(spec.pos));
          renderSpecialBuilding(
            ctx,
            sPos.x,
            sPos.y,
            cameraZoom,
            spec.type,
            spec.hp,
            specialTowerHp,
            vaultFlash
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
          renderTowerPreview(
            ctx,
            r.data,
            canvas.width,
            canvas.height,
            dpr,
            towers,
            selectedMap,
            GRID_WIDTH,
            GRID_HEIGHT,
            cameraOffset,
            cameraZoom
          );
          break;
      }
    });

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
  ]);
  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const gameLoop = (timestamp: number) => {
      const deltaTime = lastTimeRef.current
        ? (timestamp - lastTimeRef.current) * gameSpeed
        : 0;
      lastTimeRef.current = timestamp;
      updateGame(deltaTime);
      render();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameSpeed, updateGame, render]);
  // Event handlers
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const clickPos = { x: clickX, y: clickY };
      const { width, height, dpr } = getCanvasDimensions();
      if (draggingTower) {
        const gridPos = screenToGrid(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const towerCost = TOWER_DATA[draggingTower.type].cost;
        if (
          pawPoints >= towerCost &&
          isValidBuildPosition(
            gridPos,
            selectedMap,
            towers,
            GRID_WIDTH,
            GRID_HEIGHT,
            TOWER_PLACEMENT_BUFFER
          )
        ) {
          const newTower: Tower = {
            id: generateId("tower"),
            type: draggingTower.type,
            pos: gridPos,
            level: 1,
            lastAttack: 0,
            rotation: 0,
            spawnRange:
              draggingTower.type === "station"
                ? TOWER_DATA.station.spawnRange
                : undefined,
            occupiedSpawnSlots:
              draggingTower.type === "station"
                ? [false, false, false]
                : undefined,
            pendingRespawns: draggingTower.type === "station" ? [] : undefined,
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
      // Check tower clicks
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
        return distance(clickPos, screenPos) < 40;
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
              selected: t.ownerId === clickedTower.id, // Select troops owned by this station
            }))
          );
        } else {
          setTroops((prev) => prev.map((t) => ({ ...t, selected: false })));
        }
        return;
      }
      // Check hero clicks
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
            prev ? { ...prev, selected: !prev.selected } : null
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
              selected: t.id === troop.id ? !t.selected : false,
            }))
          );
          setHero((prev) => (prev ? { ...prev, selected: false } : null));
          setSelectedTower(null);
          return;
        }
      }
      // Hero movement
      if (hero && !hero.dead && hero.selected) {
        const worldPos = screenToWorld(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const path = MAP_PATHS[selectedMap];
        const secondaryPath = MAP_PATHS[`${selectedMap}_b`];
        let fullPath = path;
        if (secondaryPath) {
          fullPath = path.concat(secondaryPath);
        }
        let onPath = false;
        let closestPoint = worldPos;
        let minDist = Infinity;
        for (let i = 0; i < fullPath.length - 1; i++) {
          const p1 = gridToWorldPath(fullPath[i]);
          const p2 = gridToWorldPath(fullPath[i + 1]);
          const dist = distanceToLineSegment(worldPos, p1, p2);
          if (dist < HERO_PATH_HITBOX_SIZE && dist < minDist) {
            onPath = true;
            minDist = dist;
            closestPoint = closestPointOnLine(worldPos, p1, p2);
          }
        }
        if (onPath) {
          setHero((prev) =>
            prev ? { ...prev, moving: true, targetPos: closestPoint } : null
          );
          addParticles(closestPoint, "glow", 5);
        }
        return;
      }
      // Troop movement - constrained to road, save userTargetPos for respawn
      // Around line 1553 - Inside handleCanvasClick
      // Troop movement - constrained to road and owner range
      const selectedTroopUnit = troops.find((t) => t.selected);
      if (selectedTroopUnit) {
        const worldPos = screenToWorld(
          clickPos,
          width,
          height,
          dpr,
          cameraOffset,
          cameraZoom
        );

        // 1. Determine Anchor Position and Range Radius based on Owner
        const station = towers.find((t) => t.id === selectedTroopUnit.ownerId);

        // If it's a station troop, center range on the tower.
        // Otherwise (Spell/Hero), center on the original summon spawnPoint.
        const anchorPos = station
          ? gridToWorld(station.pos)
          : selectedTroopUnit.spawnPoint;

        // Use tower data range for stations, or the individual troop's moveRadius for summons
        const rangeRadius = station
          ? TOWER_DATA.station.spawnRange || 180
          : selectedTroopUnit.moveRadius || 200;

        // 2. Find the closest point on the road (Path Snapping)
        const path = MAP_PATHS[selectedMap];
        const secondaryPath = MAP_PATHS[`${selectedMap}_b`];
        let fullPath = path;
        if (secondaryPath) {
          fullPath = path.concat(secondaryPath);
        }

        let closestRoadPoint = worldPos;
        let minDist = Infinity;
        for (let i = 0; i < fullPath.length - 1; i++) {
          const p1 = gridToWorldPath(fullPath[i]);
          const p2 = gridToWorldPath(fullPath[i + 1]);
          const roadPoint = closestPointOnLine(worldPos, p1, p2);
          const roadDist = distance(worldPos, roadPoint);
          if (roadDist < minDist) {
            minDist = roadDist;
            closestRoadPoint = roadPoint;
          }
        }

        // 3. Distance Check: Is the snapped road point within the allowed range?
        const distFromAnchor = distance(closestRoadPoint, anchorPos);

        if (distFromAnchor <= rangeRadius) {
          // Move entire group (if part of a station/spell group)
          const ownerId = selectedTroopUnit.ownerId;
          const formationTroops = troops.filter((t) => t.ownerId === ownerId);
          const formationOffsets = getFormationOffsets(formationTroops.length);

          setTroops((prev) =>
            prev.map((t) => {
              if (t.ownerId === ownerId) {
                const offset = formationOffsets[t.spawnSlot] || { x: 0, y: 0 };
                const newTarget = {
                  x: closestRoadPoint.x + offset.x,
                  y: closestRoadPoint.y + offset.y,
                };
                return {
                  ...t,
                  moving: true,
                  targetPos: newTarget,
                  userTargetPos: newTarget, // Saves home for return-after-combat
                  // For summons, we update the spawnPoint to the new rally to allow local movement
                  spawnPoint: station ? t.spawnPoint : closestRoadPoint,
                };
              }
              return t;
            })
          );
          addParticles(closestRoadPoint, "light", 5);
        }
        return;
      }
      // Deselect all
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
    ]
  );
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
      if (buildingTower && !draggingTower) {
        setDraggingTower({ type: buildingTower, pos: { x, y } });
      } else if (draggingTower) {
        setDraggingTower({ type: draggingTower.type, pos: { x, y } });
      }
      const { width, height, dpr } = getCanvasDimensions();
      const mouseWorldPos = screenToWorld(
        mousePos,
        width,
        height,
        dpr,
        cameraOffset,
        cameraZoom
      );
      // Check for tower hover
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
        return distance({ x, y }, screenPos) < 40;
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
    },
    [buildingTower, draggingTower, getCanvasDimensions, mousePos, cameraOffset, cameraZoom, towers, selectedMap, hero, troops]
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
                            const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                            setPawPoints((pp) => pp + baseBounty + goldBonus);
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
                          const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                          setPawPoints((pp) => pp + baseBounty + goldBonus);
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
    [spells, pawPoints, enemies, selectedMap, addParticles]
  );
  const useHeroAbility = useCallback(() => {
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
                  const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                  setPawPoints((pp) => pp + baseBounty + goldBonus);
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
        const duration = 5000; // 5 seconds

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
                  const goldBonus = e.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                  setPawPoints((pp) => pp + baseBounty + goldBonus);
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
            moveRadius: 150, // Allow knights to roam and engage enemies
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
  }, [hero, enemies, selectedMap, addParticles]);
  const resetGame = useCallback(() => {
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
    setWaveInProgress(false);
    setPlacingTroop(false);
    setSpells([]);
    setGameSpeed(1);
    setCameraOffset({ x: -40, y: -60 });
    setCameraZoom(1.5);
    setStarsEarned(0);
    setTimeSpent(0);
    setLevelStartTime(0);
    setGoldSpellActive(false);
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
        quitLevel={() => {
          resetGame();
          setGameState("setup");
        }}
        retryLevel={() => {
          clearAllTimers();
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
          setWaveInProgress(false);
          setPlacingTroop(false);
          setSpells([]);
          setGameSpeed(1);
          setGoldSpellActive(false);
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
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="w-full h-full cursor-crosshair"
          />
          <CameraControls
            setCameraOffset={setCameraOffset}
            setCameraZoom={setCameraZoom}
          />
          {/* Tooltips - hide when upgrade panel is open */}
          {hoveredTower && !selectedTower &&
            (() => {
              const tower = towers.find((t) => t.id === hoveredTower);
              if (!tower) return null;
              return <TowerHoverTooltip tower={tower} position={mousePos} />;
            })()}
          {hoveredHero && hero && !hero.dead && (
            <Tooltip
              position={mousePos}
              content={
                <>
                  <div className="text-sm font-bold text-amber-300 uppercase">
                    {hero.type}
                  </div>
                  <div className="text-xs text-amber-400">
                    HP: {Math.floor(hero.hp)}/{hero.maxHp}
                  </div>
                </>
              }
            />
          )}
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
          {hoveredSpecial && LEVEL_DATA[selectedMap]?.specialTower && (
            <SpecialBuildingTooltip
              type={LEVEL_DATA[selectedMap].specialTower.type}
              hp={specialTowerHp}
              maxHp={LEVEL_DATA[selectedMap].specialTower.hp}
              position={mousePos}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col flex-shrink-0">
        <HeroSpellBar
          hero={hero}
          spells={spells}
          pawPoints={pawPoints}
          enemies={enemies}
          useHeroAbility={useHeroAbility}
          castSpell={castSpell}
        />
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
