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
import { calculateTowerStats } from "./constants/towerStats";
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
} from "./rendering";

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
      if (levelData?.specialTower?.hp) {
        setSpecialTowerHp(levelData.specialTower.hp);
      } else {
        setSpecialTowerHp(null);
      }
    }
  }, [gameState, clearAllTimers, selectedMap]); // Initialize hero and spells when game starts
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
    if (waveInProgress || currentWave >= levelWaves.length) return;
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
    const waveOverTimeout = setTimeout(() => {
      setWaveInProgress(false);
      setCurrentWave((w) => w + 1);
      setNextWaveTimer(WAVE_TIMER_BASE);
    }, Math.max(...wave.map((g) => g.count * g.interval)) + 5000);
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

      // Wave timer
      if (!waveInProgress && currentWave < levelWaves.length) {
        setNextWaveTimer((prev) => {
          const newTimer = prev - deltaTime;
          if (newTimer <= 0) {
            startWave();
            return WAVE_TIMER_BASE;
          }
          return newTimer;
        });
      }

      // =========================================================================
      // DYNAMIC BUFF REGISTRATION
      // We compute these "live" rather than relying on stale state
      // =========================================================================
      setTowers((prev) =>
        prev.map((t) => {
          const tWorldPos = gridToWorld(t.pos);
          const isBeaconNearby =
            spec?.type === "beacon" && distance(tWorldPos, specWorldPos!) < 250;
          const isScottActive = t.boostEnd ? now < t.boostEnd : false;

          return {
            ...t,
            rangeBoost: isBeaconNearby ? 1.2 : 1.0,
            damageBoost: isScottActive ? t.damageBoost || 1.5 : 1.0,
            isBuffed: isBeaconNearby || isScottActive,
          };
        })
      );

      // =========================================================================
      // HAZARD LOGIC - OPTIMIZED: Batch all hazard effects into single setEnemies call
      // =========================================================================
      if (LEVEL_DATA[selectedMap]?.hazards) {
        const hazards = LEVEL_DATA[selectedMap].hazards!;

        // Pre-calculate hazard positions
        const hazardData = hazards.map((hazard) => ({
          ...hazard,
          worldPos: gridToWorld(hazard.pos),
          radius: hazard.radius * TILE_SIZE,
        }));

        // Collect all hazard effects per enemy in one pass
        const hazardEffects = new Map<string, {
          poisonDamage: number;
          lavaDamage: number;
          environmentalSlow: number;
          environmentalSpeed: number;
          fireParticlePos?: Position;
        }>();

        const hazardParticles: { pos: Position; type: Particle["type"]; count: number }[] = [];

        for (const enemy of enemies) {
          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
          let effect = {
            poisonDamage: 0,
            lavaDamage: 0,
            environmentalSlow: 0,
            environmentalSpeed: 1,
            fireParticlePos: undefined as Position | undefined,
          };

          for (const hazard of hazardData) {
            const dist = distance(enemyPos, hazard.worldPos);
            if (dist >= hazard.radius) continue;

            switch (hazard.type) {
              case "poison_fog":
                effect.poisonDamage += (15 * deltaTime) / 1000;
                // Throttle particle spawns
                if (Math.random() < 0.1) {
                  hazardParticles.push({ pos: hazard.worldPos, type: "magic", count: 3 });
                }
                break;
              case "quicksand":
                effect.environmentalSlow = Math.max(effect.environmentalSlow, 0.5);
                if (Math.random() < 0.1) {
                  hazardParticles.push({ pos: hazard.worldPos, type: "smoke", count: 3 });
                }
                break;
              case "ice_sheet":
                effect.environmentalSpeed = 1.6;
                if (Math.random() < 0.1) {
                  hazardParticles.push({ pos: hazard.worldPos, type: "ice", count: 3 });
                }
                break;
              case "lava_geyser":
                if (Math.random() < 0.095) {
                  effect.lavaDamage += 5;
                  effect.fireParticlePos = enemyPos;
                }
                break;
            }
          }

          // Only store if there's an actual effect
          if (effect.poisonDamage > 0 || effect.lavaDamage > 0 ||
            effect.environmentalSlow > 0 || effect.environmentalSpeed !== 1) {
            hazardEffects.set(enemy.id, effect);
          }
        }

        // Single batched update for all hazard effects
        if (hazardEffects.size > 0) {
          setEnemies((prev) =>
            prev.map((e) => {
              const effect = hazardEffects.get(e.id);
              if (!effect) return e;

              let newHp = e.hp;
              let damageFlash = e.damageFlash;

              if (effect.poisonDamage > 0) {
                newHp = Math.max(0, newHp - effect.poisonDamage);
                damageFlash = 200;
              }
              if (effect.lavaDamage > 0) {
                newHp = Math.max(0, newHp - effect.lavaDamage);
                damageFlash = 200;
              }

              return {
                ...e,
                hp: newHp,
                damageFlash,
                slowEffect: Math.max(e.slowEffect, effect.environmentalSlow),
                speed: ENEMY_DATA[e.type].speed * effect.environmentalSpeed,
                dead: newHp <= 0,
              };
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

        // A. BEACON: Continuous Range Buff
        if (spec.type === "beacon") {
          setTowers((prev) =>
            prev.map((t) => {
              if (distance(gridToWorld(t.pos), specWorldPos) < 250) {
                return { ...t, rangeBoost: 1.2, isBuffed: true };
              }
              return t;
            })
          );
        }

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
                ? { ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) }
                : null
            );
            addParticles(hero.pos, "magic", 10);
          }
          // Heal Troops
          setTroops((prev) =>
            prev.map((t) => {
              if (distance(t.pos, specWorldPos) < healRadius) {
                return { ...t, hp: Math.min(t.maxHp, t.hp + healAmount) };
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
                setPawPoints((pp) => pp + ENEMY_DATA[enemy.type].bounty);
                addParticles(
                  getEnemyPosWithPath(enemy, selectedMap),
                  "explosion",
                  8
                );
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

            if (dist < TROOP_SEPARATION_DIST && dist > 0) {
              // Push away from other troop
              const pushStrength =
                (TROOP_SEPARATION_DIST - dist) / TROOP_SEPARATION_DIST;
              forceX += (dx / dist) * pushStrength * 0.5;
              forceY += (dy / dist) * pushStrength * 0.5;
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

          // Find enemies within sight range (excluding flying enemies)
          const enemiesInSight = enemies.filter((e) => {
            const enemyPos = getEnemyPosWithPath(e, selectedMap);
            const dist = distance(troop.pos, enemyPos);
            return dist <= sightRange && !ENEMY_DATA[e.type].flying;
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

          // Apply separation force (only when not actively engaging and not stationary)
          const force = separationForces.get(troop.id);
          if (force && !updated.engaging && !updated.moving && !isStationary) {
            updated.pos = {
              x: updated.pos.x + force.x * deltaTime * 0.1,
              y: updated.pos.y + force.y * deltaTime * 0.1,
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

            // Level 4B Recruitment Center: Buff nearby towers
            if (tower.level === 4 && tower.upgrade === "B") {
              const buffRange = 150;
              setTowers((prev) =>
                prev.map((t) => {
                  if (t.id !== tower.id && t.type !== "club") {
                    const otherPos = gridToWorld(t.pos);
                    if (distance(towerWorldPos, otherPos) <= buffRange) {
                      return {
                        ...t,
                        damageBoost: Math.max(t.damageBoost || 1, 1.15),
                        boostEnd: now + 2000,
                      };
                    }
                  }
                  return t;
                })
              );
            }
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
                        bountyEarned += ENEMY_DATA[enemy.type].bounty;
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
                        bountyEarned += ENEMY_DATA[enemy.type].bounty;
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
            const attackCooldown = isGatling
              ? 150 // Gatling is 8x faster
              : isFlamethrower
                ? 100 // Flamethrower is continuous
                : isHeavyCannon
                  ? 900 // Heavy cannon slightly slower but more damage
                  : tData.attackSpeed;
            // Scale attack cooldown with game speed
            const effectiveAttackCooldown = gameSpeed > 0 ? attackCooldown / gameSpeed : attackCooldown;
            if (now - tower.lastAttack > effectiveAttackCooldown) {
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
                          setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                          addParticles(targetPos, "explosion", 12);
                          return null as any;
                        }
                        return { ...e, ...updates };
                      }
                      return e;
                    })
                    .filter(Boolean)
                );
                // Simple rotation calculation - renderer handles visual adjustments
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
                          setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                          addParticles(
                            getEnemyPosWithPath(e, selectedMap),
                            "explosion",
                            8
                          );
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
                          setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                          addParticles(targetPos, "explosion", 10);
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
                        setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                        addParticles(targetPos, "explosion", 12);
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
                      setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                      if (hero.type === "scott") setPawPoints((pp) => pp + 1);
                      addParticles(targetPos, "explosion", 10);
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
            const validEnemies = enemies.filter(
              (e) =>
                distance(troop.pos, getEnemyPosWithPath(e, selectedMap)) <=
                attackRange && !ENEMY_DATA[e.type].flying
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
                        setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                        addParticles(targetPos, "explosion", 8);
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
          .map((eff) => ({ ...eff, progress: eff.progress + deltaTime / 500 }))
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
    [
      hero,
      troops,
      enemies,
      towers,
      selectedMap,
      waveInProgress,
      currentWave,
      lives,
      unlockedMaps,
      startWave,
      addParticles,
      updateLevelStars,
      updateLevelStats,
      unlockLevel,
      gameState,
      levelStartTime,
      gameSpeed,
    ]
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
    seedState = mapSeed + 400;
    type DecorationType =
      | "tree"
      | "rock"
      | "bush"
      | "crater"
      | "debris"
      | "cart"
      | "hut"
      | "fire"
      | "sword"
      | "arrow"
      | "skeleton"
      | "barrel"
      | "fence"
      | "gravestone"
      | "tent"
      | "grass"
      | "palm"
      | "cactus"
      | "dune"
      | "pyramid"
      | "obelisk"
      | "pine"
      | "snowman"
      | "ice_crystal"
      | "snow_pile"
      | "lava_pool"
      | "obsidian_spike"
      | "charred_tree"
      | "ember"
      | "swamp_tree"
      | "mushroom"
      | "lily_pad"
      | "fog_wisp"
      | "ruins"
      | "bones"
      | "torch"
      | "statue"
      | "nassau_hall"
      | "deep_water"
      | "flowers"
      | "signpost"
      | "fountain"
      | "bench"
      | "lamppost"
      | "witch_cottage"
      | "cauldron"
      | "tentacle"
      | "giant_sphinx"
      | "sphinx"
      | "oasis_pool"
      | "ice_fortress"
      | "ice_throne"
      | "obsidian_castle"
      | "dark_throne"
      | "dark_barracks"
      | "dark_spire"
      | "icicles"
      | "frozen_pond"
      | "frozen_gate"
      | "broken_wall"
      | "frozen_soldier"
      | "battle_crater"
      | "demon_statue"
      | "fire_pit"
      | "lily_pads"
      | "mushroom_cluster"
      | "fog_patch"
      | "ruined_temple"
      | "sunken_pillar"
      | "idol_statue"
      | "skeleton_pile"
      | "tombstone"
      | "broken_bridge"
      | "frog";

    interface Decoration {
      type: DecorationType;
      x: number;
      y: number;
      scale: number;
      rotation: number;
      variant: number;
    }
    const decorations: Decoration[] = [];

    // Get current theme
    const currentTheme = mapTheme;

    // Theme-specific decoration types
    const getThemeDecorations = (theme: string): DecorationType[] => {
      switch (theme) {
        case "desert":
          return [
            "palm",
            "cactus",
            "dune",
            "rock",
            "skeleton",
            "bones",
            "ruins",
            "torch",
          ];
        case "winter":
          return [
            "pine",
            "snowman",
            "ice_crystal",
            "snow_pile",
            "rock",
            "fence",
            "ruins",
          ];
        case "volcanic":
          return [
            "lava_pool",
            "obsidian_spike",
            "charred_tree",
            "ember",
            "rock",
            "skeleton",
            "bones",
          ];
        case "swamp":
          return [
            "swamp_tree",
            "mushroom",
            "lily_pad",
            "fog_wisp",
            "rock",
            "gravestone",
            "ruins",
            "bones",
          ];
        default: // grassland
          return [
            "tree",
            "bush",
            "rock",
            "grass",
            "fence",
            "hut",
            "barrel",
            "tent",
          ];
      }
    };

    const themeDecorTypes = getThemeDecorations(currentTheme);

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
    const allCategories = Object.keys(categories) as (keyof typeof categories)[];

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
    // ULTRA-DETAILED ISOMETRIC HAZARD SPRITES
    // =========================================================================
    if (LEVEL_DATA[selectedMap].hazards) {
      LEVEL_DATA[selectedMap].hazards.forEach((haz) => {
        const sPos = toScreen(gridToWorld(haz.pos));
        const sRad = haz.radius * TILE_SIZE * cameraZoom;
        const time = Date.now() / 1000;
        const isoRatio = 0.5; // Standard isometric Y compression

        ctx.save();
        ctx.translate(sPos.x, sPos.y);

        // Helper function to draw organic blob shape instead of perfect ellipse
        const drawOrganicBlob = (radiusX: number, radiusY: number, seed: number, bumpiness: number = 0.15) => {
          ctx.beginPath();
          const points = 24;
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const noise1 = Math.sin(angle * 3 + seed) * bumpiness;
            const noise2 = Math.sin(angle * 5 + seed * 2.3) * bumpiness * 0.5;
            const noise3 = Math.sin(angle * 7 + seed * 4.1) * bumpiness * 0.25;
            const variation = 1 + noise1 + noise2 + noise3;
            const x = Math.cos(angle) * radiusX * variation;
            const y = Math.sin(angle) * radiusY * variation;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        };

        if (haz.type === "poison_fog") {
          const hazSeed = (haz.pos?.x || 0) * 17.3 + (haz.pos?.y || 0) * 31.7;
          const soilGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 1.1);
          soilGrad.addColorStop(0, "rgba(25, 45, 25, 0.85)");
          soilGrad.addColorStop(0.4, "rgba(35, 55, 30, 0.7)");
          soilGrad.addColorStop(0.7, "rgba(45, 65, 35, 0.4)");
          soilGrad.addColorStop(1, "transparent");
          ctx.fillStyle = soilGrad;
          drawOrganicBlob(sRad * 1.1, sRad * 1.1 * isoRatio, hazSeed, 0.2);
          ctx.fill();

          ctx.strokeStyle = "rgba(80, 200, 80, 0.4)";
          ctx.lineWidth = 1.5 * cameraZoom;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.sin(hazSeed + i) * 0.3;
            const len = sRad * (0.5 + Math.sin(time * 0.3 + i) * 0.2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(Math.cos(angle) * len * 0.5 + Math.sin(i * 2 + hazSeed) * 12 * cameraZoom, Math.sin(angle) * len * 0.5 * isoRatio + Math.cos(i * 2 + hazSeed) * 6 * cameraZoom, Math.cos(angle) * len, Math.sin(angle) * len * isoRatio);
            ctx.stroke();
          }

          for (let pool = 0; pool < 4; pool++) {
            const poolSeed = hazSeed + pool * 23.7;
            const poolAngle = (pool / 4) * Math.PI * 2 + Math.sin(poolSeed) * 0.5;
            const poolDist = sRad * (0.4 + Math.sin(poolSeed * 1.3) * 0.15);
            const poolX = Math.cos(poolAngle) * poolDist;
            const poolY = Math.sin(poolAngle) * poolDist * isoRatio;
            const poolSize = sRad * (0.15 + Math.sin(poolSeed * 2.1) * 0.05);
            ctx.save();
            ctx.translate(poolX, poolY);
            const poolGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, poolSize);
            poolGrad.addColorStop(0, "rgba(100, 220, 100, 0.8)");
            poolGrad.addColorStop(0.6, "rgba(60, 180, 60, 0.6)");
            poolGrad.addColorStop(1, "rgba(40, 100, 40, 0.3)");
            ctx.fillStyle = poolGrad;
            drawOrganicBlob(poolSize, poolSize * isoRatio, poolSeed, 0.25);
            ctx.fill();
            ctx.restore();
            for (let b = 0; b < 3; b++) {
              const bubblePhase = (time * 1.5 + pool + b * 0.3) % 1;
              const bubbleSize = (3 + b) * cameraZoom * (1 - bubblePhase * 0.5);
              ctx.fillStyle = `rgba(150, 255, 150, ${0.6 * (1 - bubblePhase)})`;
              ctx.beginPath();
              ctx.arc(poolX + Math.sin(time * 3 + b + poolSeed) * 5 * cameraZoom, poolY - bubblePhase * 25 * cameraZoom, bubbleSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          for (let layer = 0; layer < 5; layer++) {
            const layerHeight = -layer * 12 * cameraZoom;
            const layerScale = 1 - layer * 0.1;
            const layerAlpha = 0.25 - layer * 0.04;
            const drift = Math.sin(time * 0.5 + layer) * 15 * cameraZoom;
            ctx.save();
            ctx.translate(drift, layerHeight);
            const fogGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * layerScale);
            fogGrad.addColorStop(0, `rgba(120, 40, 180, ${layerAlpha})`);
            fogGrad.addColorStop(0.3, `rgba(80, 180, 80, ${layerAlpha * 0.8})`);
            fogGrad.addColorStop(0.6, `rgba(60, 140, 60, ${layerAlpha * 0.5})`);
            fogGrad.addColorStop(1, "transparent");
            ctx.fillStyle = fogGrad;
            drawOrganicBlob(sRad * layerScale, sRad * layerScale * isoRatio * 0.8, hazSeed + layer * 7, 0.18);
            ctx.fill();
            ctx.restore();
          }

          for (let j = 0; j < 12; j++) {
            const seed = j * 0.618;
            const particleLife = (time + seed * 2) % 2.5;
            const px = Math.sin(seed * 17.3 + hazSeed) * sRad * 0.7 + Math.sin(time + j) * 10 * cameraZoom;
            const py = -particleLife * 35 * cameraZoom + Math.cos(seed * 23.7 + hazSeed) * sRad * 0.3 * isoRatio;
            const pSize = (1 - particleLife / 2.5) * (3 + (j % 3)) * cameraZoom;
            ctx.save();
            ctx.shadowColor = "rgba(100, 255, 100, 0.8)";
            ctx.shadowBlur = 8 * cameraZoom;
            ctx.fillStyle = `rgba(150, 255, 150, ${(1 - particleLife / 2.5) * 0.8})`;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        if (haz.type === "lava_geyser" || haz.type === "eruption_zone") {
          const hazSeed = (haz.pos?.x || 0) * 13.7 + (haz.pos?.y || 0) * 29.3;
          const cycleTime = time % 5;
          const isErupting = cycleTime < 1.2;
          const buildUp = cycleTime > 4.0;
          const eruptionIntensity = isErupting ? Math.sin((cycleTime / 1.2) * Math.PI) : 0;
          const lavaIsoRatio = 0.55;

          const scorchGrad = ctx.createRadialGradient(0, 0, sRad * 0.3, 0, 0, sRad * 1.4);
          scorchGrad.addColorStop(0, "rgba(60, 30, 15, 0.9)");
          scorchGrad.addColorStop(0.4, "rgba(40, 20, 10, 0.7)");
          scorchGrad.addColorStop(0.7, "rgba(30, 15, 8, 0.4)");
          scorchGrad.addColorStop(1, "transparent");
          ctx.fillStyle = scorchGrad;
          drawOrganicBlob(sRad * 1.4, sRad * 1.4 * lavaIsoRatio, hazSeed, 0.2);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 100, 0, 0.4)";
          ctx.lineWidth = 2 * cameraZoom;
          for (let c = 0; c < 12; c++) {
            const crackAngle = (c / 12) * Math.PI * 2 + Math.sin(hazSeed + c * 2) * 0.2;
            const crackLen = sRad * (0.4 + Math.sin(c * 3 + hazSeed) * 0.3);
            ctx.beginPath();
            ctx.moveTo(Math.cos(crackAngle) * sRad * 0.35, Math.sin(crackAngle) * sRad * 0.35 * lavaIsoRatio);
            ctx.quadraticCurveTo(Math.cos(crackAngle + Math.sin(hazSeed + c) * 0.15) * crackLen * 0.6, Math.sin(crackAngle + Math.sin(hazSeed + c) * 0.15) * crackLen * 0.6 * lavaIsoRatio, Math.cos(crackAngle) * crackLen, Math.sin(crackAngle) * crackLen * lavaIsoRatio);
            ctx.stroke();
          }

          const ventWidth = sRad * 0.8;
          ctx.fillStyle = "#1a1a1a";
          for (let r = 0; r < 5; r++) {
            const rockAngle = Math.PI + (r / 5) * Math.PI;
            const rockOffset = Math.sin(hazSeed + r * 3) * 0.15;
            const rockX = Math.cos(rockAngle) * ventWidth * (0.5 + rockOffset);
            const rockY = Math.sin(rockAngle) * ventWidth * (0.3 + rockOffset * 0.5) * lavaIsoRatio;
            const rockH = (12 + r * 4 + Math.sin(hazSeed + r) * 5) * cameraZoom;
            const rockW = (6 + Math.sin(hazSeed + r * 2) * 2) * cameraZoom;
            ctx.beginPath();
            ctx.moveTo(rockX - rockW, rockY);
            ctx.lineTo(rockX - rockW * 0.7, rockY - rockH);
            ctx.lineTo(rockX + rockW * 0.7, rockY - rockH);
            ctx.lineTo(rockX + rockW, rockY);
            ctx.closePath();
            ctx.fill();
          }

          const magmaGrad = ctx.createRadialGradient(0, -5 * cameraZoom, 0, 0, -5 * cameraZoom, ventWidth * 0.5);
          const magmaIntensity = buildUp ? 1.3 : (isErupting ? 1.5 : 1);
          magmaGrad.addColorStop(0, `rgba(255, 255, ${buildUp ? 200 : 100}, ${magmaIntensity})`);
          magmaGrad.addColorStop(0.3, "#ff6600");
          magmaGrad.addColorStop(0.6, "#cc3300");
          magmaGrad.addColorStop(1, "#661100");
          ctx.save();
          ctx.translate(0, -5 * cameraZoom);
          if (buildUp || isErupting) { ctx.shadowColor = "#ff4400"; ctx.shadowBlur = (20 + eruptionIntensity * 30) * cameraZoom; }
          ctx.fillStyle = magmaGrad;
          drawOrganicBlob(ventWidth * 0.45, ventWidth * 0.25 * lavaIsoRatio, hazSeed + 100, 0.12);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = "rgba(255, 200, 50, 0.6)";
          ctx.lineWidth = 2 * cameraZoom;
          for (let conv = 0; conv < 3; conv++) {
            const convAngle = time * 0.5 + conv * 2;
            const convR = ventWidth * 0.2 * (1 + conv * 0.2);
            ctx.beginPath();
            ctx.arc(Math.cos(convAngle) * convR * 0.3, -5 * cameraZoom + Math.sin(convAngle) * convR * 0.15 * lavaIsoRatio, convR * 0.3, 0, Math.PI * 1.5);
            ctx.stroke();
          }

          for (let r = 0; r < 5; r++) {
            const rockAngle = (r / 5) * Math.PI;
            const rockOffset = Math.sin(hazSeed + r * 5) * 0.15;
            const rockX = Math.cos(rockAngle) * ventWidth * (0.5 + rockOffset);
            const rockY = Math.sin(rockAngle) * ventWidth * (0.3 + rockOffset * 0.5) * lavaIsoRatio;
            const rockH = (10 + (r % 2) * 6 + Math.sin(hazSeed + r * 3) * 4) * cameraZoom;
            const rockW = (5 + Math.sin(hazSeed + r * 4) * 2) * cameraZoom;
            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.moveTo(rockX - rockW, rockY);
            ctx.lineTo(rockX - rockW * 0.6, rockY - rockH);
            ctx.lineTo(rockX + rockW * 0.6, rockY - rockH);
            ctx.lineTo(rockX + rockW, rockY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 100, 0, ${0.3 + eruptionIntensity * 0.4})`;
            ctx.lineWidth = 2 * cameraZoom;
            ctx.beginPath();
            ctx.moveTo(rockX - rockW, rockY);
            ctx.lineTo(rockX - rockW * 0.6, rockY - rockH);
            ctx.stroke();
          }

          if (isErupting) {
            const columnHeight = eruptionIntensity * 120 * cameraZoom;
            const columnGrad = ctx.createLinearGradient(0, 0, 0, -columnHeight);
            columnGrad.addColorStop(0, "#ffcc00");
            columnGrad.addColorStop(0.2, "#ff8800");
            columnGrad.addColorStop(0.5, "#ff4400");
            columnGrad.addColorStop(0.8, "rgba(255, 68, 0, 0.5)");
            columnGrad.addColorStop(1, "transparent");
            ctx.save();
            ctx.shadowColor = "#ff4400";
            ctx.shadowBlur = 30 * cameraZoom;
            ctx.fillStyle = columnGrad;
            ctx.beginPath();
            ctx.moveTo(-15 * cameraZoom * eruptionIntensity, -10 * cameraZoom);
            ctx.quadraticCurveTo(-5 * cameraZoom + Math.sin(time * 20) * 8 * cameraZoom, -columnHeight * 0.5, 0, -columnHeight);
            ctx.quadraticCurveTo(5 * cameraZoom + Math.sin(time * 20 + 1) * 8 * cameraZoom, -columnHeight * 0.5, 15 * cameraZoom * eruptionIntensity, -10 * cameraZoom);
            ctx.fill();
            ctx.restore();
            for (let bomb = 0; bomb < 8; bomb++) {
              const bombPhase = (cycleTime + bomb * 0.1) % 1.2;
              const bombAngle = (bomb / 8) * Math.PI * 2 + time;
              const bombDist = bombPhase * sRad * 1.5;
              const bombHeight = Math.sin(bombPhase * Math.PI) * 80 * cameraZoom;
              const bombX = Math.cos(bombAngle) * bombDist;
              const bombY = Math.sin(bombAngle) * bombDist * lavaIsoRatio - bombHeight;
              const bombSize = (6 - bombPhase * 3) * cameraZoom;
              if (bombPhase < 1) {
                ctx.save();
                ctx.shadowColor = "#ff6600";
                ctx.shadowBlur = 10 * cameraZoom;
                const bombGrad = ctx.createRadialGradient(bombX, bombY, 0, bombX, bombY, bombSize);
                bombGrad.addColorStop(0, "#ffcc00");
                bombGrad.addColorStop(0.5, "#ff6600");
                bombGrad.addColorStop(1, "#cc3300");
                ctx.fillStyle = bombGrad;
                ctx.beginPath();
                ctx.arc(bombX, bombY, bombSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }
          }

          for (let ember = 0; ember < 6; ember++) {
            const emberPhase = (time * 0.7 + ember * 0.4) % 2;
            const emberX = Math.sin(ember * 2.3 + time * 0.5) * sRad * 0.4;
            const emberY = -emberPhase * 40 * cameraZoom;
            const emberSize = (2 + Math.sin(ember)) * cameraZoom * (1 - emberPhase / 2);
            ctx.fillStyle = `rgba(255, ${150 + ember * 10}, 0, ${0.8 * (1 - emberPhase / 2)})`;
            ctx.beginPath();
            ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (haz.type === "ice_sheet" || haz.type === "slippery_ice") {
          const hazSeed = (haz.pos?.x || 0) * 19.3 + (haz.pos?.y || 0) * 37.1;
          const frostGrad = ctx.createRadialGradient(0, 0, sRad * 0.7, 0, 0, sRad * 1.2);
          frostGrad.addColorStop(0, "transparent");
          frostGrad.addColorStop(0.5, "rgba(240, 248, 255, 0.4)");
          frostGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");
          ctx.fillStyle = frostGrad;
          drawOrganicBlob(sRad * 1.2, sRad * 1.2 * isoRatio, hazSeed, 0.2);
          ctx.fill();

          ctx.fillStyle = "rgba(250, 250, 255, 0.7)";
          for (let mound = 0; mound < 10; mound++) {
            const moundAngle = (mound / 10) * Math.PI * 2 + Math.sin(hazSeed + mound) * 0.3;
            const moundDist = sRad * (0.85 + Math.sin(hazSeed + mound * 2) * 0.15);
            const moundX = Math.cos(moundAngle) * moundDist;
            const moundY = Math.sin(moundAngle) * moundDist * isoRatio;
            const moundSize = (6 + Math.sin(hazSeed + mound * 3) * 4) * cameraZoom;
            ctx.beginPath();
            ctx.ellipse(moundX, moundY, moundSize, moundSize * 0.4, moundAngle + Math.sin(hazSeed + mound) * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }

          const iceDeepGrad = ctx.createRadialGradient(0, 5 * cameraZoom, 0, 0, 5 * cameraZoom, sRad);
          iceDeepGrad.addColorStop(0, "rgba(100, 150, 180, 0.9)");
          iceDeepGrad.addColorStop(0.5, "rgba(80, 130, 170, 0.8)");
          iceDeepGrad.addColorStop(1, "rgba(60, 110, 150, 0.6)");
          ctx.fillStyle = iceDeepGrad;
          ctx.save();
          ctx.translate(0, 5 * cameraZoom);
          drawOrganicBlob(sRad * 0.95, sRad * 0.95 * isoRatio, hazSeed + 50, 0.15);
          ctx.fill();
          ctx.restore();

          const iceSurfGrad = ctx.createRadialGradient(-sRad * 0.3, -sRad * 0.15 * isoRatio, 0, 0, 0, sRad);
          iceSurfGrad.addColorStop(0, "rgba(220, 240, 255, 0.9)");
          iceSurfGrad.addColorStop(0.3, "rgba(180, 210, 240, 0.7)");
          iceSurfGrad.addColorStop(0.7, "rgba(140, 180, 220, 0.5)");
          iceSurfGrad.addColorStop(1, "rgba(100, 150, 200, 0.3)");
          ctx.fillStyle = iceSurfGrad;
          drawOrganicBlob(sRad * 0.9, sRad * 0.9 * isoRatio, hazSeed + 100, 0.15);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 1 * cameraZoom;
          for (let crack = 0; crack < 6; crack++) {
            const crackAngle = (crack / 6) * Math.PI * 2 + Math.sin(hazSeed + crack) * 0.4;
            const crackLen = sRad * (0.4 + Math.sin(crack * 2 + hazSeed) * 0.3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let seg = 1; seg <= 4; seg++) {
              const progress = seg / 4;
              const baseX = Math.cos(crackAngle) * crackLen * progress;
              const baseY = Math.sin(crackAngle) * crackLen * progress * isoRatio;
              const jitter = (Math.sin(crack * 5 + seg * 3 + hazSeed) * 8) * cameraZoom;
              ctx.lineTo(baseX + Math.cos(crackAngle + Math.PI / 2) * jitter, baseY + Math.sin(crackAngle + Math.PI / 2) * jitter * isoRatio);
            }
            ctx.stroke();
          }

          const crystalPositions = [{ angle: 0.5, dist: 0.4, h: 35, w: 8 }, { angle: 2.3, dist: 0.35, h: 28, w: 7 }, { angle: 4.1, dist: 0.45, h: 22, w: 6 }, { angle: 1.2, dist: 0.25, h: 40, w: 10 }];
          for (const crystal of crystalPositions) {
            const cx = Math.cos(crystal.angle + hazSeed * 0.1) * sRad * crystal.dist;
            const cy = Math.sin(crystal.angle + hazSeed * 0.1) * sRad * crystal.dist * isoRatio;
            const ch = crystal.h * cameraZoom;
            const cw = crystal.w * cameraZoom;
            ctx.fillStyle = "rgba(150, 200, 240, 0.8)";
            ctx.beginPath();
            ctx.moveTo(cx, cy - ch);
            ctx.lineTo(cx - cw, cy - ch * 0.3);
            ctx.lineTo(cx - cw * 0.5, cy);
            ctx.lineTo(cx + cw * 0.5, cy);
            ctx.lineTo(cx + cw, cy - ch * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(220, 240, 255, 0.95)";
            ctx.beginPath();
            ctx.moveTo(cx, cy - ch);
            ctx.lineTo(cx + cw, cy - ch * 0.3);
            ctx.lineTo(cx + cw * 0.5, cy);
            ctx.lineTo(cx, cy - ch * 0.15);
            ctx.closePath();
            ctx.fill();
          }

          for (let p = 0; p < 10; p++) {
            const pPhase = (time + p * 0.7) % 3;
            const pAngle = p * 0.618 * Math.PI * 2 + hazSeed;
            const pDist = sRad * 0.3 + pPhase * sRad * 0.2;
            const px = Math.cos(pAngle + time * 0.2) * pDist;
            const py = Math.sin(pAngle + time * 0.2) * pDist * isoRatio - pPhase * 15 * cameraZoom;
            const pSize = (2 + Math.sin(p * 2) * 1) * cameraZoom * (1 - pPhase / 3);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * (1 - pPhase / 3)})`;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
          }

          for (let mist = 0; mist < 4; mist++) {
            const mistPhase = (time * 0.5 + mist) % 2;
            const mistX = Math.sin(time * 0.3 + mist * 2 + hazSeed) * sRad * 0.6;
            const mistY = sRad * 0.2 * isoRatio;
            const mistSize = sRad * 0.4 * (0.5 + mistPhase * 0.3);
            const mistGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, mistSize);
            mistGrad.addColorStop(0, `rgba(200, 230, 255, ${0.15 * (1 - mistPhase / 2)})`);
            mistGrad.addColorStop(1, "transparent");
            ctx.fillStyle = mistGrad;
            ctx.beginPath();
            ctx.ellipse(mistX, mistY, mistSize, mistSize * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (haz.type === "quicksand") {
          const hazSeed = (haz.pos?.x || 0) * 23.1 + (haz.pos?.y || 0) * 41.9;
          const disturbedGrad = ctx.createRadialGradient(0, 0, sRad * 0.5, 0, 0, sRad * 1.3);
          disturbedGrad.addColorStop(0, "transparent");
          disturbedGrad.addColorStop(0.5, "rgba(139, 119, 101, 0.5)");
          disturbedGrad.addColorStop(0.8, "rgba(160, 140, 120, 0.3)");
          disturbedGrad.addColorStop(1, "transparent");
          ctx.fillStyle = disturbedGrad;
          drawOrganicBlob(sRad * 1.3, sRad * 1.3 * isoRatio, hazSeed, 0.22);
          ctx.fill();

          ctx.strokeStyle = "rgba(100, 80, 60, 0.5)";
          ctx.lineWidth = 1.5 * cameraZoom;
          for (let crack = 0; crack < 12; crack++) {
            const crackAngle = (crack / 12) * Math.PI * 2 + Math.sin(hazSeed + crack) * 0.25;
            const crackStart = sRad * (0.8 + Math.sin(hazSeed + crack * 2) * 0.1);
            const crackEnd = sRad * (1.1 + Math.sin(hazSeed + crack * 3) * 0.1);
            ctx.beginPath();
            ctx.moveTo(Math.cos(crackAngle) * crackStart, Math.sin(crackAngle) * crackStart * isoRatio);
            ctx.lineTo(Math.cos(crackAngle + 0.1) * crackEnd, Math.sin(crackAngle + 0.1) * crackEnd * isoRatio);
            ctx.stroke();
          }

          const deepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.4);
          deepGrad.addColorStop(0, "rgba(50, 35, 25, 0.95)");
          deepGrad.addColorStop(0.7, "rgba(70, 50, 35, 0.9)");
          deepGrad.addColorStop(1, "rgba(90, 65, 45, 0.8)");
          ctx.fillStyle = deepGrad;
          drawOrganicBlob(sRad * 0.4, sRad * 0.4 * isoRatio, hazSeed + 50, 0.18);
          ctx.fill();

          const midGrad = ctx.createRadialGradient(0, 0, sRad * 0.3, 0, 0, sRad * 0.7);
          midGrad.addColorStop(0, "rgba(100, 75, 55, 0.85)");
          midGrad.addColorStop(1, "rgba(140, 110, 80, 0.7)");
          ctx.fillStyle = midGrad;
          drawOrganicBlob(sRad * 0.7, sRad * 0.7 * isoRatio, hazSeed + 100, 0.16);
          ctx.fill();

          const surfGrad = ctx.createRadialGradient(0, 0, sRad * 0.5, 0, 0, sRad);
          surfGrad.addColorStop(0, "rgba(180, 150, 120, 0.6)");
          surfGrad.addColorStop(0.5, "rgba(200, 170, 130, 0.75)");
          surfGrad.addColorStop(1, "rgba(180, 150, 110, 0.65)");
          ctx.fillStyle = surfGrad;
          drawOrganicBlob(sRad, sRad * isoRatio, hazSeed + 150, 0.18);
          ctx.fill();

          const spiralSpeed = time * 0.8;
          for (let arm = 0; arm < 4; arm++) {
            ctx.strokeStyle = `rgba(90, 70, 50, ${0.3 + arm * 0.1})`;
            ctx.lineWidth = (3 - arm * 0.5) * cameraZoom;
            ctx.beginPath();
            for (let t = 0; t < 3; t += 0.05) {
              const spiralR = sRad * 0.1 + t * sRad * 0.25;
              const spiralAngle = t * 3 + spiralSpeed + arm * (Math.PI / 2);
              const sx = Math.cos(spiralAngle) * spiralR;
              const sy = Math.sin(spiralAngle) * spiralR * isoRatio;
              if (t === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
          }

          for (let ripple = 0; ripple < 4; ripple++) {
            const ripplePhase = (time * 0.5 + ripple * 0.25) % 1;
            const rippleR = sRad * (1 - ripplePhase * 0.6);
            ctx.strokeStyle = `rgba(160, 130, 100, ${0.4 * (1 - ripplePhase)})`;
            ctx.lineWidth = 2 * cameraZoom * (1 - ripplePhase * 0.5);
            drawOrganicBlob(rippleR, rippleR * isoRatio, hazSeed + ripple * 20, 0.1);
            ctx.stroke();
          }

          const debrisItems = [{ type: 'bone', angle: 0.5 + hazSeed * 0.01, dist: 0.6 }, { type: 'rock', angle: 3.8 + hazSeed * 0.01, dist: 0.5 }, { type: 'skull', angle: 5.2 + hazSeed * 0.01, dist: 0.4 }];
          for (const debris of debrisItems) {
            const sinkProgress = (time * 0.15 + debris.angle) % 1;
            const debrisDist = debris.dist * sRad * (1 - sinkProgress * 0.5);
            const debrisX = Math.cos(debris.angle + sinkProgress * 0.5) * debrisDist;
            const debrisY = Math.sin(debris.angle + sinkProgress * 0.5) * debrisDist * isoRatio;
            const debrisSink = sinkProgress * 8 * cameraZoom;
            ctx.save();
            ctx.translate(debrisX, debrisY + debrisSink);
            ctx.rotate(sinkProgress * 0.5);
            ctx.globalAlpha = 1 - sinkProgress * 0.7;
            if (debris.type === 'bone') { ctx.fillStyle = "#e8dcc8"; ctx.beginPath(); ctx.ellipse(0, 0, 12 * cameraZoom, 3 * cameraZoom, 0, 0, Math.PI * 2); ctx.fill(); }
            else if (debris.type === 'rock') { ctx.fillStyle = "#7a7a7a"; ctx.beginPath(); ctx.moveTo(-8 * cameraZoom, 5 * cameraZoom); ctx.lineTo(-5 * cameraZoom, -6 * cameraZoom); ctx.lineTo(7 * cameraZoom, -4 * cameraZoom); ctx.lineTo(9 * cameraZoom, 4 * cameraZoom); ctx.closePath(); ctx.fill(); }
            else if (debris.type === 'skull') { ctx.fillStyle = "#d4c8b8"; ctx.beginPath(); ctx.arc(0, -3 * cameraZoom, 8 * cameraZoom, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#3d3d3d"; ctx.beginPath(); ctx.arc(-3 * cameraZoom, -4 * cameraZoom, 2 * cameraZoom, 0, Math.PI * 2); ctx.arc(3 * cameraZoom, -4 * cameraZoom, 2 * cameraZoom, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
          }

          for (let bubble = 0; bubble < 8; bubble++) {
            const bubblePhase = (time * 1.2 + bubble * 0.4) % 1;
            const bubbleAngle = bubble * 0.785 + Math.sin(time + bubble + hazSeed) * 0.3;
            const bubbleDist = sRad * 0.3 + Math.sin(bubble * 2 + hazSeed) * sRad * 0.2;
            const bubbleX = Math.cos(bubbleAngle) * bubbleDist;
            const bubbleY = Math.sin(bubbleAngle) * bubbleDist * isoRatio;
            if (bubblePhase < 0.5) {
              const bubbleSize = (4 + bubble % 3) * cameraZoom * Math.sin(bubblePhase * Math.PI);
              ctx.fillStyle = `rgba(200, 170, 130, ${0.6 * (1 - bubblePhase * 2)})`;
              ctx.beginPath();
              ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          ctx.save();
          const signAngle = hazSeed * 0.1;
          ctx.translate(Math.cos(signAngle) * sRad * 0.9, Math.sin(signAngle) * sRad * 0.4 * isoRatio - sRad * 0.3 * isoRatio);
          ctx.fillStyle = "#5d4e37";
          ctx.fillRect(-3 * cameraZoom, -25 * cameraZoom, 6 * cameraZoom, 30 * cameraZoom);
          ctx.fillStyle = "#c4a35a";
          ctx.beginPath();
          ctx.moveTo(0, -35 * cameraZoom);
          ctx.lineTo(-12 * cameraZoom, -20 * cameraZoom);
          ctx.lineTo(12 * cameraZoom, -20 * cameraZoom);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#8b0000";
          ctx.font = `bold ${12 * cameraZoom}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText("!", 0, -23 * cameraZoom);
          ctx.restore();
        }

        ctx.restore();
      });
    }

    // Render decorations
    for (const dec of decorations) {
      const screenPos = toScreen({ x: dec.x, y: dec.y });
      const s = cameraZoom * dec.scale;
      const { type, rotation, variant } = dec;

      ctx.save();
      switch (type) {
        // === GRASSLAND DECORATIONS ===
        case "tree": {
          // Enhanced 3D isometric tree with detailed foliage and bark
          const treeVariants = [
            { trunk: "#5d4037", trunkDark: "#3e2723", foliage: ["#2e7d32", "#388e3c", "#43a047", "#4caf50"] },
            { trunk: "#4a3728", trunkDark: "#2d1f14", foliage: ["#1b5e20", "#2e7d32", "#388e3c", "#33691e"] },
            { trunk: "#6d4c41", trunkDark: "#4e342e", foliage: ["#33691e", "#558b2f", "#689f38", "#7cb342"] },
            { trunk: "#5d4037", trunkDark: "#3e2723", foliage: ["#4a6741", "#5a7751", "#6a8761", "#7a9771"] },
          ];
          const tv = treeVariants[variant % 4];

          // Ground shadow with gradient
          const shadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s
          );
          shadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
          shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.15)");
          shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = shadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Trunk with 3D isometric faces
          // Left face (shadow)
          ctx.fillStyle = tv.trunkDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 22 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 24 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Right face (lit)
          const trunkGrad = ctx.createLinearGradient(
            screenPos.x, screenPos.y, screenPos.x + 6 * s, screenPos.y
          );
          trunkGrad.addColorStop(0, tv.trunk);
          trunkGrad.addColorStop(1, tv.trunkDark);
          ctx.fillStyle = trunkGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 5 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 22 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 24 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Bark texture lines
          ctx.strokeStyle = tv.trunkDark;
          ctx.lineWidth = 0.8 * s;
          for (let i = 0; i < 5; i++) {
            const barkY = screenPos.y - 5 * s - i * 5 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 3 * s, barkY + Math.sin(i) * 2 * s);
            ctx.lineTo(screenPos.x + 3 * s, barkY - Math.sin(i + 1) * 2 * s);
            ctx.stroke();
          }

          // Visible roots at base
          ctx.fillStyle = tv.trunkDark;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = tv.trunk;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main foliage body - layered 3D clusters
          const foliageLayers = [
            { y: -18, rx: 26, ry: 14, color: tv.foliage[0] },
            { y: -24, rx: 24, ry: 13, color: tv.foliage[1] },
            { y: -30, rx: 20, ry: 11, color: tv.foliage[2] },
            { y: -35, rx: 14, ry: 8, color: tv.foliage[3] },
          ];

          // Draw foliage with gradient shading
          foliageLayers.forEach((layer, idx) => {
            // Shadow underneath each layer
            if (idx === 0) {
              ctx.fillStyle = "rgba(0,0,0,0.15)";
              ctx.beginPath();
              ctx.ellipse(screenPos.x, screenPos.y + layer.y * s + 3 * s, layer.rx * s, layer.ry * s * 0.6, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            // Main foliage blob with gradient
            const foliageGrad = ctx.createRadialGradient(
              screenPos.x - layer.rx * 0.3 * s, screenPos.y + layer.y * s - layer.ry * 0.3 * s, 0,
              screenPos.x, screenPos.y + layer.y * s, layer.rx * s
            );
            foliageGrad.addColorStop(0, tv.foliage[Math.min(idx + 1, 3)]);
            foliageGrad.addColorStop(0.7, layer.color);
            foliageGrad.addColorStop(1, tv.foliage[0]);
            ctx.fillStyle = foliageGrad;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y + layer.y * s, layer.rx * s, layer.ry * s, 0, 0, Math.PI * 2);
            ctx.fill();
          });

          // Add leaf cluster details for depth
          const leafClusters = [
            { x: -15, y: -20, r: 8 }, { x: 12, y: -22, r: 7 },
            { x: -8, y: -28, r: 6 }, { x: 10, y: -30, r: 6 },
            { x: 0, y: -38, r: 5 }, { x: -12, y: -32, r: 5 },
          ];
          leafClusters.forEach((lc, i) => {
            const clusterGrad = ctx.createRadialGradient(
              screenPos.x + lc.x * s, screenPos.y + lc.y * s, 0,
              screenPos.x + lc.x * s, screenPos.y + lc.y * s, lc.r * s
            );
            clusterGrad.addColorStop(0, tv.foliage[3]);
            clusterGrad.addColorStop(0.5, tv.foliage[2]);
            clusterGrad.addColorStop(1, tv.foliage[1]);
            ctx.fillStyle = clusterGrad;
            ctx.beginPath();
            ctx.ellipse(screenPos.x + lc.x * s, screenPos.y + lc.y * s, lc.r * s, lc.r * 0.6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          });

          // Highlight spots on top
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 5 * s, screenPos.y - 34 * s, 5 * s, 3 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 8 * s, screenPos.y - 26 * s, 4 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();


          break;
        }
        case "rock": {
          // Enhanced 3D isometric rock with detailed texture and moss
          const rockVariants = [
            { base: "#6d4c41", mid: "#8d6e63", light: "#a1887f", dark: "#4e342e", moss: "#4a6741" },
            { base: "#5d4037", mid: "#795548", light: "#8d6e63", dark: "#3e2723", moss: "#2e7d32" },
            { base: "#757575", mid: "#9e9e9e", light: "#bdbdbd", dark: "#424242", moss: "#455a64" },
            { base: "#616161", mid: "#757575", light: "#9e9e9e", dark: "#424242", moss: "#37474f" },
          ];
          const rv = rockVariants[variant % 4];

          // Ground shadow with soft edge
          const rockShadowGrad = ctx.createRadialGradient(
            screenPos.x + 3 * s, screenPos.y + 5 * s, 0,
            screenPos.x + 3 * s, screenPos.y + 5 * s, 18 * s
          );
          rockShadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
          rockShadowGrad.addColorStop(0.7, "rgba(0,0,0,0.1)");
          rockShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = rockShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 5 * s, 18 * s, 9 * s, 0.1, 0, Math.PI * 2);
          ctx.fill();

          // Main rock body - proper isometric 3D shape
          // Key vertices for consistent isometric rock:
          // topPeak: (0, -16) - highest point
          // topLeft: (-8, -12) - top left corner
          // topRight: (+10, -10) - top right corner  
          // frontPeak: (0, -2) - front edge where faces meet
          // bottomLeft: (-12, +2) - bottom left
          // bottomRight: (+12, +4) - bottom right

          // Top face (brightest - faces up)
          const topFaceGrad = ctx.createLinearGradient(
            screenPos.x - 8 * s, screenPos.y - 14 * s, screenPos.x + 10 * s, screenPos.y - 8 * s
          );
          topFaceGrad.addColorStop(0, rv.light);
          topFaceGrad.addColorStop(1, rv.mid);
          ctx.fillStyle = topFaceGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 12 * s);   // topLeft
          ctx.lineTo(screenPos.x, screenPos.y - 16 * s);           // topPeak
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 10 * s);  // topRight
          ctx.lineTo(screenPos.x, screenPos.y - 6 * s);            // center point
          ctx.closePath();
          ctx.fill();

          // Front face (medium - faces viewer)
          const frontFaceGrad = ctx.createLinearGradient(
            screenPos.x - 12 * s, screenPos.y - 8 * s, screenPos.x + 4 * s, screenPos.y + 4 * s
          );
          frontFaceGrad.addColorStop(0, rv.mid);
          frontFaceGrad.addColorStop(0.5, rv.base);
          frontFaceGrad.addColorStop(1, rv.dark);
          ctx.fillStyle = frontFaceGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 12 * s);   // topLeft
          ctx.lineTo(screenPos.x, screenPos.y - 6 * s);            // center point
          ctx.lineTo(screenPos.x, screenPos.y + 2 * s);            // frontPeak
          ctx.lineTo(screenPos.x - 12 * s, screenPos.y + 2 * s);   // bottomLeft
          ctx.closePath();
          ctx.fill();

          // Right side face (darkest - faces right/away)
          const rightFaceGrad = ctx.createLinearGradient(
            screenPos.x, screenPos.y - 10 * s, screenPos.x + 12 * s, screenPos.y + 2 * s
          );
          rightFaceGrad.addColorStop(0, rv.base);
          rightFaceGrad.addColorStop(0.6, rv.dark);
          rightFaceGrad.addColorStop(1, rv.dark);
          ctx.fillStyle = rightFaceGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 10 * s, screenPos.y - 10 * s);  // topRight
          ctx.lineTo(screenPos.x + 12 * s, screenPos.y + 4 * s);   // bottomRight
          ctx.lineTo(screenPos.x, screenPos.y + 2 * s);            // frontPeak
          ctx.lineTo(screenPos.x, screenPos.y - 6 * s);            // center point
          ctx.closePath();
          ctx.fill();

          // Stone texture - cracks and facets
          ctx.strokeStyle = rv.dark;
          ctx.lineWidth = 0.8 * s;
          // Crack on front face
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 4 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 4 * s);
          ctx.lineTo(screenPos.x - 8 * s, screenPos.y);
          ctx.stroke();
          // Crack on right face
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 6 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 2 * s);
          ctx.stroke();
          // Crack on top face
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 9 * s);
          ctx.stroke();

          // Highlight on top edges
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 16 * s);
          ctx.lineTo(screenPos.x + 9 * s, screenPos.y - 10 * s);
          ctx.stroke();

          // Moss patches (on some variants)
          if (variant === 0 || variant === 1) {
            ctx.fillStyle = rv.moss;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 5 * s, 4 * s, 2 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(screenPos.x + 5 * s, screenPos.y - 2 * s, 3 * s, 1.5 * s, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          // Small pebbles around base
          ctx.fillStyle = rv.mid;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 12 * s, screenPos.y + 4 * s, 2 * s, 1.2 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rv.dark;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 12 * s, screenPos.y + 3 * s, 1.5 * s, 1 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "nassau_hall": {
          // Unique Princeton Landmark - High Detail Ornate Version
          const nx = screenPos.x;
          const ny = screenPos.y;

          // 1. Ground Shadow
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath();
          ctx.ellipse(nx, ny + 12 * s, 70 * s, 28 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Define key measurements
          const foundY = ny + 8 * s;
          const wallY = ny - 28 * s;
          const wallH = 36 * s;
          const pedimentY = wallY - 9 * s;

          // ============================================================
          // BACKGROUND ELEMENTS (Draw first - appear behind)
          // ============================================================

          // 2. The Cupola & Spire (BEHIND the main building)
          const cupolaY = pedimentY - 14 * s; // Moved down to be behind pediment

          // Cupola base
          ctx.fillStyle = "#D7CCC8";
          ctx.fillRect(nx - 9 * s, cupolaY - 4 * s, 18 * s, 4 * s);

          // Cupola main body
          const cupolaGrad = ctx.createLinearGradient(nx - 7 * s, cupolaY - 22 * s, nx + 7 * s, cupolaY - 4 * s);
          cupolaGrad.addColorStop(0, "#E0E0E0");
          cupolaGrad.addColorStop(0.3, "#FAFAFA");
          cupolaGrad.addColorStop(0.7, "#FAFAFA");
          cupolaGrad.addColorStop(1, "#E0E0E0");
          ctx.fillStyle = cupolaGrad;
          ctx.fillRect(nx - 7 * s, cupolaY - 22 * s, 14 * s, 18 * s);

          // Cupola arched openings with pillars between
          const archSpacing = 7 * s; // More space between arches for pillars
          for (let i = -1; i <= 1; i++) {
            ctx.fillStyle = "#37474F";
            ctx.beginPath();
            ctx.arc(nx + i * archSpacing, cupolaY - 14 * s, 2 * s, Math.PI, 0);
            ctx.fillRect(nx + i * archSpacing - 2 * s, cupolaY - 14 * s, 4 * s, 7 * s);
            ctx.fill();
          }
          // Pillar details between arches
          ctx.fillStyle = "#E8E8E8";
          ctx.fillRect(nx - archSpacing + 2.5 * s, cupolaY - 16 * s, 2 * s, 10 * s);
          ctx.fillRect(nx + archSpacing - 4.5 * s, cupolaY - 16 * s, 2 * s, 10 * s);
          ctx.fillRect(nx - 1 * s, cupolaY - 16 * s, 2 * s, 10 * s); // Center pillars
          ctx.fillRect(nx + 3 * s, cupolaY - 16 * s, 2 * s, 10 * s);

          // Cupola cornice
          ctx.fillStyle = "#BCAAA4";
          ctx.fillRect(nx - 8 * s, cupolaY - 24 * s, 16 * s, 2 * s);

          // Cupola roof (dome)
          const cupolaRoofY = cupolaY - 24 * s;
          ctx.fillStyle = "#4A7C59";
          ctx.beginPath();
          ctx.moveTo(nx - 8 * s, cupolaRoofY);
          ctx.quadraticCurveTo(nx - 6 * s, cupolaRoofY - 12 * s, nx, cupolaRoofY - 16 * s);
          ctx.quadraticCurveTo(nx + 6 * s, cupolaRoofY - 12 * s, nx + 8 * s, cupolaRoofY);
          ctx.fill();
          ctx.strokeStyle = "#5D8A6B";
          ctx.lineWidth = 1.5 * s;
          ctx.stroke();

          // Golden spire
          const spireY = cupolaRoofY - 16 * s;
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.moveTo(nx - 1.5 * s, spireY);
          ctx.lineTo(nx, spireY - 16 * s);
          ctx.lineTo(nx + 1.5 * s, spireY);
          ctx.closePath();
          ctx.fill();

          // Spire orb
          ctx.fillStyle = "#FFC107";
          ctx.beginPath();
          ctx.arc(nx, spireY - 3 * s, 2.5 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(nx - 0.8 * s, spireY - 3.8 * s, 1 * s, 0, Math.PI * 2);
          ctx.fill();

          // Princeton Flag on Spire (Orange and Black)
          ctx.save();
          ctx.translate(nx + 1.5 * s, spireY - 12 * s);
          ctx.strokeStyle = "#5D4037";
          ctx.lineWidth = 0.6 * s;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(8 * s, 0);
          ctx.stroke();
          // Orange field
          ctx.fillStyle = "#F97316";
          ctx.fillRect(1 * s, -5 * s, 7 * s, 5 * s);
          // Black stripe
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(1 * s, -3.5 * s, 7 * s, 2 * s);
          ctx.restore();

          // 3. Wing Buildings (BEHIND the central pavilion)
          // Left wing wall gradient
          const leftWallGrad = ctx.createLinearGradient(nx - 52 * s, wallY, nx - 18 * s, wallY);
          leftWallGrad.addColorStop(0, "#7D5E53");
          leftWallGrad.addColorStop(0.3, "#8D6E63");
          leftWallGrad.addColorStop(0.7, "#A1887F");
          leftWallGrad.addColorStop(1, "#8D6E63");
          ctx.fillStyle = leftWallGrad;
          ctx.fillRect(nx - 52 * s, wallY + 4 * s, 34 * s, wallH - 4 * s);

          // Right wing wall gradient
          const rightWallGrad = ctx.createLinearGradient(nx + 18 * s, wallY, nx + 52 * s, wallY);
          rightWallGrad.addColorStop(0, "#8D6E63");
          rightWallGrad.addColorStop(0.3, "#A1887F");
          rightWallGrad.addColorStop(0.7, "#8D6E63");
          rightWallGrad.addColorStop(1, "#7D5E53");
          ctx.fillStyle = rightWallGrad;
          ctx.fillRect(nx + 18 * s, wallY + 4 * s, 34 * s, wallH - 4 * s);

          // Brick/Stone Detail Lines on wings
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 0.5 * s;
          for (let row = 1; row < 5; row++) {
            const rowY = wallY + 4 * s + ((wallH - 4 * s) / 5) * row;
            ctx.beginPath();
            ctx.moveTo(nx - 52 * s, rowY);
            ctx.lineTo(nx - 18 * s, rowY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(nx + 18 * s, rowY);
            ctx.lineTo(nx + 52 * s, rowY);
            ctx.stroke();
          }

          // Decorative Cornice on wings
          ctx.fillStyle = "#BCAAA4";
          ctx.fillRect(nx - 54 * s, wallY + 1 * s, 36 * s, 3 * s);
          ctx.fillRect(nx + 18 * s, wallY + 1 * s, 36 * s, 3 * s);

          // Wing Roofs
          const roofGradL = ctx.createLinearGradient(nx - 54 * s, wallY - 8 * s, nx - 18 * s, wallY + 1 * s);
          roofGradL.addColorStop(0, "#3D6B4A");
          roofGradL.addColorStop(0.5, "#4A7C59");
          roofGradL.addColorStop(1, "#5D8A6B");
          ctx.fillStyle = roofGradL;
          ctx.beginPath();
          ctx.moveTo(nx - 56 * s, wallY + 1 * s);
          ctx.lineTo(nx - 36 * s, wallY - 10 * s);
          ctx.lineTo(nx - 16 * s, wallY + 1 * s);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#5D8A6B";
          ctx.lineWidth = 1.5 * s;
          ctx.stroke();

          const roofGradR = ctx.createLinearGradient(nx + 18 * s, wallY + 1 * s, nx + 54 * s, wallY - 8 * s);
          roofGradR.addColorStop(0, "#5D8A6B");
          roofGradR.addColorStop(0.5, "#4A7C59");
          roofGradR.addColorStop(1, "#3D6B4A");
          ctx.fillStyle = roofGradR;
          ctx.beginPath();
          ctx.moveTo(nx + 16 * s, wallY + 1 * s);
          ctx.lineTo(nx + 36 * s, wallY - 10 * s);
          ctx.lineTo(nx + 56 * s, wallY + 1 * s);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Windows on Left Wing
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
              const winX = nx - 48 * s + col * 11 * s;
              const winY = wallY + 8 * s + row * 13 * s;

              ctx.fillStyle = "#5D4037";
              ctx.fillRect(winX - 1 * s, winY - 1 * s, 8 * s, 11 * s);

              const glassGrad = ctx.createLinearGradient(winX, winY, winX + 6 * s, winY + 9 * s);
              glassGrad.addColorStop(0, "#37474F");
              glassGrad.addColorStop(0.3, "#1a1a2e");
              glassGrad.addColorStop(0.7, "#263238");
              glassGrad.addColorStop(1, "#1a1a2e");
              ctx.fillStyle = glassGrad;
              ctx.fillRect(winX, winY, 6 * s, 9 * s);

              ctx.strokeStyle = "#4E342E";
              ctx.lineWidth = 0.8 * s;
              ctx.beginPath();
              ctx.moveTo(winX + 3 * s, winY);
              ctx.lineTo(winX + 3 * s, winY + 9 * s);
              ctx.moveTo(winX, winY + 4.5 * s);
              ctx.lineTo(winX + 6 * s, winY + 4.5 * s);
              ctx.stroke();

              ctx.fillStyle = "#EFEBE9";
              ctx.fillRect(winX - 1 * s, winY + 9 * s, 8 * s, 2 * s);
              ctx.fillStyle = "#D7CCC8";
              ctx.fillRect(winX - 1 * s, winY - 3 * s, 8 * s, 2 * s);
            }
          }

          // Windows on Right Wing
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
              const winX = nx + 21 * s + col * 11 * s;
              const winY = wallY + 8 * s + row * 13 * s;

              ctx.fillStyle = "#5D4037";
              ctx.fillRect(winX - 1 * s, winY - 1 * s, 8 * s, 11 * s);

              const glassGrad2 = ctx.createLinearGradient(winX, winY, winX + 6 * s, winY + 9 * s);
              glassGrad2.addColorStop(0, "#263238");
              glassGrad2.addColorStop(0.4, "#1a1a2e");
              glassGrad2.addColorStop(0.8, "#37474F");
              glassGrad2.addColorStop(1, "#1a1a2e");
              ctx.fillStyle = glassGrad2;
              ctx.fillRect(winX, winY, 6 * s, 9 * s);

              ctx.strokeStyle = "#4E342E";
              ctx.lineWidth = 0.8 * s;
              ctx.beginPath();
              ctx.moveTo(winX + 3 * s, winY);
              ctx.lineTo(winX + 3 * s, winY + 9 * s);
              ctx.moveTo(winX, winY + 4.5 * s);
              ctx.lineTo(winX + 6 * s, winY + 4.5 * s);
              ctx.stroke();

              ctx.fillStyle = "#EFEBE9";
              ctx.fillRect(winX - 1 * s, winY + 9 * s, 8 * s, 2 * s);
              ctx.fillStyle = "#D7CCC8";
              ctx.fillRect(winX - 1 * s, winY - 3 * s, 8 * s, 2 * s);
            }
          }

          // ============================================================
          // FOREGROUND ELEMENTS (Draw last - appear in front)
          // ============================================================

          // 4. Stone Foundation/Steps
          const foundGrad = ctx.createLinearGradient(nx - 55 * s, foundY, nx + 55 * s, foundY);
          foundGrad.addColorStop(0, "#5D4037");
          foundGrad.addColorStop(0.5, "#6D4C41");
          foundGrad.addColorStop(1, "#5D4037");
          ctx.fillStyle = foundGrad;
          ctx.fillRect(nx - 55 * s, foundY, 110 * s, 8 * s);

          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(nx - 55 * s, foundY + 4 * s);
          ctx.lineTo(nx + 55 * s, foundY + 4 * s);
          ctx.stroke();

          // Front steps
          for (let step = 0; step < 3; step++) {
            const stepY = foundY + 8 * s + step * 3 * s;
            const stepW = 14 * s - step * 2 * s;
            ctx.fillStyle = step % 2 === 0 ? "#9E9E9E" : "#BDBDBD";
            ctx.fillRect(nx - stepW, stepY, stepW * 2, 3 * s);
          }

          // 5. Central Pavilion (IN FRONT of wings)
          const pavGrad = ctx.createLinearGradient(nx - 18 * s, wallY - 6 * s, nx + 18 * s, wallY - 6 * s);
          pavGrad.addColorStop(0, "#6D4C41");
          pavGrad.addColorStop(0.2, "#795548");
          pavGrad.addColorStop(0.5, "#8D6E63");
          pavGrad.addColorStop(0.8, "#795548");
          pavGrad.addColorStop(1, "#6D4C41");
          ctx.fillStyle = pavGrad;
          ctx.fillRect(nx - 18 * s, wallY - 6 * s, 36 * s, wallH + 14 * s);

          // Pavilion vertical pilaster strips
          ctx.fillStyle = "#5D4037";
          ctx.fillRect(nx - 18 * s, wallY - 6 * s, 3 * s, wallH + 14 * s);
          ctx.fillRect(nx + 15 * s, wallY - 6 * s, 3 * s, wallH + 14 * s);

          // Pavilion cornice
          ctx.fillStyle = "#EFEBE9";
          ctx.fillRect(nx - 20 * s, wallY - 9 * s, 40 * s, 3 * s);

          // 6. Central Pediment (IN FRONT of cupola)
          const pedGrad = ctx.createLinearGradient(nx, pedimentY - 22 * s, nx, pedimentY);
          pedGrad.addColorStop(0, "#5D8A6B");
          pedGrad.addColorStop(0.5, "#4A7C59");
          pedGrad.addColorStop(1, "#3D6B4A");
          ctx.fillStyle = pedGrad;
          ctx.beginPath();
          ctx.moveTo(nx - 22 * s, pedimentY);
          ctx.lineTo(nx, pedimentY - 22 * s);
          ctx.lineTo(nx + 22 * s, pedimentY);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "#6B9B7A";
          ctx.lineWidth = 2 * s;
          ctx.stroke();

          // Pediment oculus
          ctx.fillStyle = "#3D6B4A";
          ctx.beginPath();
          ctx.arc(nx, pedimentY - 10 * s, 6 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#6B9B7A";
          ctx.lineWidth = 1.5 * s;
          ctx.stroke();

          ctx.fillStyle = "#4A7C59";
          ctx.beginPath();
          ctx.arc(nx, pedimentY - 10 * s, 4 * s, 0, Math.PI * 2);
          ctx.fill();

          // 7. Pavilion Windows
          for (let row = 0; row < 2; row++) {
            for (let col = -1; col <= 1; col++) {
              if (col === 0 && row === 1) continue;
              const winX = nx + col * 10 * s - 3 * s;
              const winY = wallY + (row === 0 ? 2 * s : 18 * s);

              ctx.fillStyle = "#4E342E";
              ctx.fillRect(winX - 1.5 * s, winY - 2 * s, 9 * s, 14 * s);

              ctx.fillStyle = "#1a1a2e";
              ctx.fillRect(winX, winY, 6 * s, 11 * s);

              ctx.beginPath();
              ctx.arc(winX + 3 * s, winY, 3 * s, Math.PI, 0);
              ctx.fill();

              ctx.strokeStyle = "#3E2723";
              ctx.lineWidth = 0.6 * s;
              ctx.beginPath();
              ctx.moveTo(winX + 3 * s, winY - 2 * s);
              ctx.lineTo(winX + 3 * s, winY + 11 * s);
              ctx.moveTo(winX, winY + 4 * s);
              ctx.lineTo(winX + 6 * s, winY + 4 * s);
              ctx.moveTo(winX, winY + 8 * s);
              ctx.lineTo(winX + 6 * s, winY + 8 * s);
              ctx.stroke();

              ctx.fillStyle = "#EFEBE9";
              ctx.fillRect(winX - 1.5 * s, winY + 11 * s, 9 * s, 2 * s);
            }
          }

          // 8. Grand Entrance Door
          const doorY = ny - 4 * s;

          ctx.fillStyle = "#5D4037";
          ctx.beginPath();
          ctx.moveTo(nx - 8 * s, doorY + 12 * s);
          ctx.lineTo(nx - 8 * s, doorY - 2 * s);
          ctx.quadraticCurveTo(nx, doorY - 14 * s, nx + 8 * s, doorY - 2 * s);
          ctx.lineTo(nx + 8 * s, doorY + 12 * s);
          ctx.lineTo(nx + 6 * s, doorY + 12 * s);
          ctx.lineTo(nx + 6 * s, doorY);
          ctx.quadraticCurveTo(nx, doorY - 10 * s, nx - 6 * s, doorY);
          ctx.lineTo(nx - 6 * s, doorY + 12 * s);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#D7CCC8";
          ctx.beginPath();
          ctx.moveTo(nx - 3 * s, doorY - 10 * s);
          ctx.lineTo(nx, doorY - 14 * s);
          ctx.lineTo(nx + 3 * s, doorY - 10 * s);
          ctx.lineTo(nx + 2 * s, doorY - 7 * s);
          ctx.lineTo(nx - 2 * s, doorY - 7 * s);
          ctx.closePath();
          ctx.fill();

          const doorGrad = ctx.createLinearGradient(nx - 5 * s, doorY, nx + 5 * s, doorY);
          doorGrad.addColorStop(0, "#2D1B14");
          doorGrad.addColorStop(0.5, "#3E2723");
          doorGrad.addColorStop(1, "#2D1B14");
          ctx.fillStyle = doorGrad;
          ctx.beginPath();
          ctx.moveTo(nx - 5 * s, doorY + 12 * s);
          ctx.lineTo(nx - 5 * s, doorY + 1 * s);
          ctx.quadraticCurveTo(nx, doorY - 8 * s, nx + 5 * s, doorY + 1 * s);
          ctx.lineTo(nx + 5 * s, doorY + 12 * s);
          ctx.fill();

          ctx.strokeStyle = "#1a0f0a";
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(nx, doorY + 12 * s);
          ctx.lineTo(nx, doorY - 4 * s);
          ctx.stroke();

          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(nx - 2 * s, doorY + 5 * s, 1.2 * s, 0, Math.PI * 2);
          ctx.arc(nx + 2 * s, doorY + 5 * s, 1.2 * s, 0, Math.PI * 2);
          ctx.fill();

          // 9. Decorative Columns on Pavilion
          const colPositions = [-12 * s, -4 * s, 4 * s, 12 * s];
          colPositions.forEach((colX) => {
            ctx.fillStyle = "#D7CCC8";
            ctx.fillRect(nx + colX - 2.5 * s, foundY - 5 * s, 5 * s, 5 * s);

            const colGrad = ctx.createLinearGradient(nx + colX - 2 * s, 0, nx + colX + 2 * s, 0);
            colGrad.addColorStop(0, "#BCAAA4");
            colGrad.addColorStop(0.3, "#EFEBE9");
            colGrad.addColorStop(0.7, "#EFEBE9");
            colGrad.addColorStop(1, "#BCAAA4");
            ctx.fillStyle = colGrad;
            ctx.fillRect(nx + colX - 2 * s, wallY + 2 * s, 4 * s, foundY - wallY - 7 * s);

            ctx.fillStyle = "#D7CCC8";
            ctx.fillRect(nx + colX - 3 * s, wallY - 1 * s, 6 * s, 3 * s);
            ctx.beginPath();
            ctx.arc(nx + colX - 3 * s, wallY, 1.5 * s, 0, Math.PI * 2);
            ctx.arc(nx + colX + 3 * s, wallY, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();
          });

          // 10. Tiger Statues
          const drawTigerStatue = (xOff: number, facing: number) => {
            const tx = nx + xOff;
            const ty = ny + 16 * s;

            ctx.fillStyle = "#546E7A";
            ctx.fillRect(tx - 6 * s, ty, 12 * s, 6 * s);
            ctx.fillStyle = "#78909C";
            ctx.fillRect(tx - 5 * s, ty - 2 * s, 10 * s, 2 * s);

            const tigerGrad = ctx.createLinearGradient(tx - 6 * s, ty - 6 * s, tx + 6 * s, ty - 6 * s);
            tigerGrad.addColorStop(0, "#455A64");
            tigerGrad.addColorStop(0.5, "#607D8B");
            tigerGrad.addColorStop(1, "#455A64");
            ctx.fillStyle = tigerGrad;
            ctx.beginPath();
            ctx.ellipse(tx, ty - 6 * s, 7 * s, 4 * s, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#546E7A";
            ctx.fillRect(tx - 5 * s, ty - 4 * s, 2.5 * s, 6 * s);
            ctx.fillRect(tx + 2.5 * s, ty - 4 * s, 2.5 * s, 6 * s);

            ctx.fillStyle = "#607D8B";
            ctx.beginPath();
            ctx.arc(tx + facing * 6 * s, ty - 9 * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tx + facing * 5 * s, ty - 12 * s);
            ctx.lineTo(tx + facing * 4 * s, ty - 15 * s);
            ctx.lineTo(tx + facing * 6 * s, ty - 13 * s);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(tx + facing * 7 * s, ty - 12 * s);
            ctx.lineTo(tx + facing * 8 * s, ty - 15 * s);
            ctx.lineTo(tx + facing * 6 * s, ty - 13 * s);
            ctx.fill();

            ctx.fillStyle = "#263238";
            ctx.beginPath();
            ctx.arc(tx + facing * 5 * s, ty - 9.5 * s, 0.8 * s, 0, Math.PI * 2);
            ctx.arc(tx + facing * 7 * s, ty - 9.5 * s, 0.8 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#546E7A";
            ctx.lineWidth = 2 * s;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tx - facing * 6 * s, ty - 6 * s);
            ctx.quadraticCurveTo(tx - facing * 10 * s, ty - 12 * s, tx - facing * 8 * s, ty - 16 * s);
            ctx.stroke();
          };

          drawTigerStatue(-28 * s, 1);
          drawTigerStatue(28 * s, -1);

          break;
        }
        case "bush": {
          // Enhanced 3D isometric bush with detailed foliage clusters
          const bushVariants = [
            { base: "#4caf50", mid: "#66bb6a", light: "#81c784", dark: "#388e3c", accent: "#aed581" },
            { base: "#388e3c", mid: "#4caf50", light: "#66bb6a", dark: "#2e7d32", accent: "#81c784" },
            { base: "#558b2f", mid: "#689f38", light: "#7cb342", dark: "#33691e", accent: "#8bc34a" },
            { base: "#33691e", mid: "#558b2f", light: "#689f38", dark: "#1b5e20", accent: "#7cb342" },
          ];
          const bv = bushVariants[variant % 4];

          // Ground shadow
          const bushShadowGrad = ctx.createRadialGradient(
            screenPos.x + 2 * s, screenPos.y + 5 * s, 0,
            screenPos.x + 2 * s, screenPos.y + 5 * s, 20 * s
          );
          bushShadowGrad.addColorStop(0, "rgba(0,0,0,0.28)");
          bushShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
          bushShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = bushShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 5 * s, 20 * s, 10 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Base foliage mass (darker, bottom layer)
          const baseGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y - 2 * s, 0,
            screenPos.x, screenPos.y - 2 * s, 18 * s
          );
          baseGrad.addColorStop(0, bv.mid);
          baseGrad.addColorStop(0.6, bv.base);
          baseGrad.addColorStop(1, bv.dark);
          ctx.fillStyle = baseGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 2 * s, 18 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Foliage clusters for 3D depth - multiple overlapping spheres
          const clusters = [
            { x: -10, y: -4, rx: 9, ry: 7 },
            { x: 8, y: -5, rx: 10, ry: 8 },
            { x: -3, y: -10, rx: 10, ry: 7 },
            { x: 6, y: -12, rx: 8, ry: 6 },
            { x: -8, y: -11, rx: 7, ry: 5 },
            { x: 0, y: -6, rx: 12, ry: 9 },
          ];

          clusters.forEach((cluster, idx) => {
            const clusterGrad = ctx.createRadialGradient(
              screenPos.x + cluster.x * s - 2 * s, screenPos.y + cluster.y * s - 2 * s, 0,
              screenPos.x + cluster.x * s, screenPos.y + cluster.y * s, cluster.rx * s
            );
            clusterGrad.addColorStop(0, idx < 3 ? bv.light : bv.accent);
            clusterGrad.addColorStop(0.4, bv.mid);
            clusterGrad.addColorStop(1, bv.base);
            ctx.fillStyle = clusterGrad;
            ctx.beginPath();
            ctx.ellipse(
              screenPos.x + cluster.x * s, screenPos.y + cluster.y * s,
              cluster.rx * s, cluster.ry * s, 0, 0, Math.PI * 2
            );
            ctx.fill();
          });

          // Top highlight clusters
          const highlights = [
            { x: -5, y: -13, r: 4 },
            { x: 4, y: -14, r: 3.5 },
            { x: -1, y: -8, r: 5 },
          ];
          highlights.forEach((hl) => {
            ctx.fillStyle = "rgba(255,255,255,0.12)";
            ctx.beginPath();
            ctx.ellipse(screenPos.x + hl.x * s, screenPos.y + hl.y * s, hl.r * s, hl.r * 0.6 * s, -0.2, 0, Math.PI * 2);
            ctx.fill();
          });

          // Leaf detail dots for texture
          ctx.fillStyle = bv.accent;
          for (let i = 0; i < 8; i++) {
            const leafX = screenPos.x + (Math.sin(i * 1.3) * 12 - 2) * s;
            const leafY = screenPos.y + (-8 + Math.cos(i * 1.7) * 5) * s;
            ctx.beginPath();
            ctx.arc(leafX, leafY, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Add subtle berry/flower accents on some variants
          if (variant === 0 || variant === 2) {
            const berryColors = ["#ef5350", "#ff7043", "#ffca28"];
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = berryColors[i % 3];
              const bx = screenPos.x + (Math.sin(i * 2.1) * 8) * s;
              const by = screenPos.y + (-6 + Math.cos(i * 1.5) * 4) * s;
              ctx.beginPath();
              ctx.arc(bx, by, 1.2 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Shadow detail at base for grounding
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "grass": {
          // Enhanced 3D grass tuft with varied blade heights and colors
          const grassPalettes = [
            { base: "#4a5d23", mid: "#5a6d33", tip: "#7a8d53", dark: "#3a4d13" },
            { base: "#3d4f1c", mid: "#4d5f2c", tip: "#6d7f4c", dark: "#2d3f0c" },
            { base: "#556b2f", mid: "#657b3f", tip: "#859b5f", dark: "#45511f" },
            { base: "#6b8e23", mid: "#7b9e33", tip: "#9bbe53", dark: "#5b7e13" },
          ];
          const gp = grassPalettes[variant % 4];

          // Subtle ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.08)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 1 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw multiple grass blades with varying properties
          const blades = [
            { x: -6, h: 16, w: 1.8, sway: 0 },
            { x: -3, h: 20, w: 2.2, sway: 0.3 },
            { x: 0, h: 22, w: 2.5, sway: 0.5 },
            { x: 3, h: 18, w: 2, sway: 0.7 },
            { x: 6, h: 14, w: 1.6, sway: 1 },
            { x: -4, h: 12, w: 1.4, sway: 0.2 },
            { x: 4, h: 11, w: 1.3, sway: 0.8 },
            { x: -1, h: 15, w: 1.7, sway: 0.4 },
            { x: 2, h: 13, w: 1.5, sway: 0.6 },
          ];

          blades.forEach((blade, idx) => {
            const gx = screenPos.x + blade.x * s;
            const sway = Math.sin(decorTime * 2 + blade.sway * 3 + dec.x * 0.1) * (2 + blade.h * 0.1) * s;
            const tipSway = sway * 1.5;

            // Gradient from base to tip
            const bladeGrad = ctx.createLinearGradient(gx, screenPos.y, gx + tipSway, screenPos.y - blade.h * s);
            bladeGrad.addColorStop(0, gp.dark);
            bladeGrad.addColorStop(0.3, gp.base);
            bladeGrad.addColorStop(0.7, gp.mid);
            bladeGrad.addColorStop(1, gp.tip);

            // Draw blade as filled shape for better appearance
            ctx.fillStyle = bladeGrad;
            ctx.beginPath();
            ctx.moveTo(gx - blade.w * 0.5 * s, screenPos.y);
            ctx.quadraticCurveTo(
              gx + sway * 0.3 - blade.w * 0.3 * s,
              screenPos.y - blade.h * 0.5 * s,
              gx + tipSway,
              screenPos.y - blade.h * s
            );
            ctx.quadraticCurveTo(
              gx + sway * 0.3 + blade.w * 0.3 * s,
              screenPos.y - blade.h * 0.5 * s,
              gx + blade.w * 0.5 * s,
              screenPos.y
            );
            ctx.closePath();
            ctx.fill();

            // Subtle highlight on some blades
            if (idx % 3 === 0) {
              ctx.strokeStyle = "rgba(255,255,255,0.1)";
              ctx.lineWidth = 0.5 * s;
              ctx.beginPath();
              ctx.moveTo(gx, screenPos.y - 2 * s);
              ctx.quadraticCurveTo(
                gx + sway * 0.3,
                screenPos.y - blade.h * 0.5 * s,
                gx + tipSway * 0.8,
                screenPos.y - blade.h * 0.9 * s
              );
              ctx.stroke();
            }
          });

          // Add a few seed heads on taller blades
          if (variant === 1 || variant === 3) {
            ctx.fillStyle = "#a89078";
            const seedX = screenPos.x + Math.sin(decorTime * 2 + 0.5 + dec.x * 0.1) * 3.5 * s;
            const seedY = screenPos.y - 21 * s;
            ctx.beginPath();
            ctx.ellipse(seedX, seedY, 1.5 * s, 2.5 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "crater":
        case "battle_crater":
        case "fire_pit": {
          // Subtle, environment-blending crater/pit - natural depression in terrain
          const isBattle = type === "battle_crater";
          const isFirePit = type === "fire_pit";
          const safeVariant = (variant ?? 0) % 4;

          // Variant-based size variations
          const craterVariants = [
            { outerRx: 24, outerRy: 12, depth: 3, debris: 3 },
            { outerRx: 16, outerRy: 8, depth: 4, debris: 2 },
            { outerRx: 32, outerRy: 16, depth: 2, debris: 4 },
            { outerRx: 28, outerRy: 10, depth: 3.5, debris: 3 },
          ];
          const cv = craterVariants[safeVariant];

          const craterX = screenPos.x;
          const craterY = screenPos.y;

          // Very subtle outer shadow - barely visible depression
          const outerShadow = ctx.createRadialGradient(
            craterX, craterY, cv.outerRx * 0.3 * s,
            craterX, craterY, (cv.outerRx + 4) * s
          );
          outerShadow.addColorStop(0, "rgba(40,35,25,0.12)");
          outerShadow.addColorStop(0.7, "rgba(35,30,20,0.06)");
          outerShadow.addColorStop(1, "rgba(30,25,15,0)");
          ctx.fillStyle = outerShadow;
          ctx.beginPath();
          ctx.ellipse(craterX, craterY, (cv.outerRx + 4) * s, (cv.outerRy + 2) * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rim - very subtle earthy tone, blends with ground
          const rimGrad = ctx.createRadialGradient(
            craterX, craterY - 1 * s, cv.outerRx * 0.5 * s,
            craterX, craterY, cv.outerRx * s
          );
          rimGrad.addColorStop(0, "rgba(70,60,45,0.25)");
          rimGrad.addColorStop(0.6, "rgba(60,50,35,0.18)");
          rimGrad.addColorStop(1, "rgba(50,45,30,0.08)");
          ctx.fillStyle = rimGrad;
          ctx.beginPath();
          ctx.ellipse(craterX, craterY, cv.outerRx * s, cv.outerRy * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Inner depression - darker but still subtle
          const innerGrad = ctx.createRadialGradient(
            craterX, craterY + cv.depth * 0.3 * s, 0,
            craterX, craterY + cv.depth * 0.3 * s, (cv.outerRx - 3) * s
          );
          innerGrad.addColorStop(0, "rgba(25,20,12,0.35)");
          innerGrad.addColorStop(0.5, "rgba(35,28,18,0.25)");
          innerGrad.addColorStop(1, "rgba(45,38,25,0.12)");
          ctx.fillStyle = innerGrad;
          ctx.beginPath();
          ctx.ellipse(craterX, craterY + 1 * s, (cv.outerRx - 2) * s, (cv.outerRy - 1) * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Subtle depth shading on back edge
          ctx.fillStyle = "rgba(20,15,8,0.15)";
          ctx.beginPath();
          ctx.ellipse(craterX, craterY - 1 * s, (cv.outerRx - 4) * s, (cv.outerRy - 2) * s, 0, Math.PI * 1.1, Math.PI * 1.9);
          ctx.fill();

          // A few subtle dirt clumps around edge
          ctx.fillStyle = "rgba(65,55,40,0.2)";
          for (let d = 0; d < cv.debris; d++) {
            const debrisAngle = (d / cv.debris) * Math.PI * 2 + safeVariant * 0.8;
            const debrisDist = cv.outerRx * 0.9 + Math.sin(d * 2.1 + safeVariant) * 2;
            const debrisX = craterX + Math.cos(debrisAngle) * debrisDist * s;
            const debrisY = craterY + Math.sin(debrisAngle) * debrisDist * 0.5 * s;
            ctx.beginPath();
            ctx.ellipse(debrisX, debrisY, 1.5 * s, 0.8 * s, debrisAngle * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Battle crater - subtle scorch marks
          if (isBattle) {
            ctx.strokeStyle = "rgba(35,25,15,0.15)";
            ctx.lineWidth = 1.5 * s;
            for (let sc = 0; sc < 3; sc++) {
              const scorchAngle = sc * 2 + safeVariant * 0.5;
              const scorchStart = cv.outerRx * 0.7;
              const scorchEnd = cv.outerRx + 3;
              ctx.beginPath();
              ctx.moveTo(
                craterX + Math.cos(scorchAngle) * scorchStart * s,
                craterY + Math.sin(scorchAngle) * scorchStart * 0.5 * s
              );
              ctx.lineTo(
                craterX + Math.cos(scorchAngle) * scorchEnd * s,
                craterY + Math.sin(scorchAngle) * scorchEnd * 0.5 * s
              );
              ctx.stroke();
            }
          }

          // Fire pit - subtle warm glow
          if (isFirePit) {
            const firePulse = 0.2 + Math.sin(decorTime * 3) * 0.08;
            const fireGlow = ctx.createRadialGradient(
              craterX, craterY + cv.depth * 0.2 * s, 0,
              craterX, craterY + cv.depth * 0.2 * s, (cv.outerRx - 4) * s
            );
            fireGlow.addColorStop(0, `rgba(180,80,20,${firePulse})`);
            fireGlow.addColorStop(0.5, `rgba(120,40,10,${firePulse * 0.4})`);
            fireGlow.addColorStop(1, "rgba(60,20,5,0)");
            ctx.fillStyle = fireGlow;
            ctx.beginPath();
            ctx.ellipse(craterX, craterY + cv.depth * 0.2 * s, (cv.outerRx - 4) * s, (cv.outerRy - 2) * s, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tiny ember particles
            for (let e = 0; e < 2; e++) {
              const emberPhase = (decorTime * 1.2 + e * 1.2 + safeVariant) % 2;
              const emberAlpha = (emberPhase < 1 ? emberPhase : 2 - emberPhase) * 0.5;
              const emberRise = emberPhase * 5 * s;
              const emberX = craterX + Math.sin(e * 3 + decorTime) * 4 * s;
              const emberY = craterY - emberRise;

              ctx.fillStyle = `rgba(255,150,50,${emberAlpha})`;
              ctx.beginPath();
              ctx.arc(emberX, emberY, 1 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          break;
        }
        case "debris":
          ctx.fillStyle = "#4a3525";
          for (let d = 0; d < 5; d++) {
            const angle = rotation + d * 1.2;
            const dist = (8 + variant * 3) * s;
            ctx.beginPath();
            ctx.ellipse(
              screenPos.x + Math.cos(angle) * dist,
              screenPos.y + Math.sin(angle) * dist * 0.5,
              6 * s,
              4 * s,
              angle,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          ctx.fillStyle = "#6d4c41";
          ctx.save();
          ctx.translate(screenPos.x, screenPos.y);
          ctx.rotate(rotation);
          ctx.fillRect(-15 * s, -3 * s, 30 * s, 4 * s);
          ctx.fillRect(-8 * s, -12 * s, 4 * s, 20 * s);
          ctx.restore();
          break;
        case "cart":
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 2,
            screenPos.y + 5 * s,
            25 * s,
            12 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.save();
          ctx.translate(screenPos.x, screenPos.y);
          ctx.rotate(rotation * 0.3);
          ctx.fillStyle = "#5d4037";
          ctx.fillRect(-20 * s, -8 * s, 40 * s, 12 * s);
          ctx.strokeStyle = "#4a3525";
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.arc(-15 * s, 2 * s, 8 * s, 0, Math.PI * 1.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(15 * s, -5 * s, 8 * s, Math.PI * 0.5, Math.PI * 1.8);
          ctx.stroke();
          ctx.fillStyle = "#8d6e63";
          ctx.fillRect(5 * s, -12 * s, 8 * s, 6 * s);
          ctx.fillRect(-10 * s, 4 * s, 6 * s, 5 * s);
          ctx.restore();
          break;
        case "hut":
          ctx.fillStyle = "rgba(0,0,0,0.28)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 3,
            screenPos.y + 8 * s,
            28 * s,
            14 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#8d6e63";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 22 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 22 * s, screenPos.y + 5 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#5d4037";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 24 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 28 * s);
          ctx.lineTo(screenPos.x + 24 * s, screenPos.y - 10 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#3e2723";
          ctx.fillRect(
            screenPos.x - 5 * s,
            screenPos.y - 5 * s,
            10 * s,
            10 * s
          );
          ctx.fillStyle =
            variant > 1 ? "rgba(255,200,100,0.5)" : "rgba(50,50,50,0.5)";
          ctx.fillRect(screenPos.x + 8 * s, screenPos.y - 8 * s, 6 * s, 5 * s);
          break;
        case "fire":
          const smokeOff = Math.sin(decorTime * 3) * 3 * s;
          ctx.fillStyle = "rgba(80,80,80,0.25)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + smokeOff,
            screenPos.y - 25 * s,
            8 * s,
            6 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "rgba(100,100,100,0.15)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - smokeOff * 0.5,
            screenPos.y - 35 * s,
            6 * s,
            4 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.shadowColor = "#ff6600";
          ctx.shadowBlur = 15 * s;
          const flameH = 12 + Math.sin(decorTime * 8) * 4;
          const fireGrad = ctx.createRadialGradient(
            screenPos.x,
            screenPos.y - 5 * s,
            0,
            screenPos.x,
            screenPos.y - 5 * s,
            flameH * s
          );
          fireGrad.addColorStop(0, "#ffffff");
          fireGrad.addColorStop(0.2, "#ffff00");
          fireGrad.addColorStop(0.5, "#ff8800");
          fireGrad.addColorStop(0.8, "#ff4400");
          fireGrad.addColorStop(1, "rgba(200,50,0,0)");
          ctx.fillStyle = fireGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y);
          ctx.quadraticCurveTo(
            screenPos.x - 10 * s,
            screenPos.y - flameH * 0.5 * s,
            screenPos.x - 3 * s,
            screenPos.y - flameH * s
          );
          ctx.quadraticCurveTo(
            screenPos.x,
            screenPos.y - flameH * 1.2 * s,
            screenPos.x + 3 * s,
            screenPos.y - flameH * s
          );
          ctx.quadraticCurveTo(
            screenPos.x + 10 * s,
            screenPos.y - flameH * 0.5 * s,
            screenPos.x + 8 * s,
            screenPos.y
          );
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#5d4037";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 2 * s,
            10 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case "sword":
          ctx.save();
          ctx.translate(screenPos.x, screenPos.y);
          ctx.rotate(rotation);
          ctx.fillStyle = "#9e9e9e";
          ctx.beginPath();
          ctx.moveTo(0, -20 * s);
          ctx.lineTo(3 * s, -5 * s);
          ctx.lineTo(3 * s, 8 * s);
          ctx.lineTo(-3 * s, 8 * s);
          ctx.lineTo(-3 * s, -5 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#5d4037";
          ctx.fillRect(-8 * s, 6 * s, 16 * s, 4 * s);
          ctx.fillStyle = "#3e2723";
          ctx.fillRect(-2 * s, 10 * s, 4 * s, 10 * s);
          ctx.restore();
          break;
        case "arrow":
          ctx.save();
          ctx.translate(screenPos.x, screenPos.y);
          ctx.rotate(rotation);
          ctx.strokeStyle = "#5d4037";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(-12 * s, 0);
          ctx.lineTo(12 * s, 0);
          ctx.stroke();
          ctx.fillStyle = "#757575";
          ctx.beginPath();
          ctx.moveTo(12 * s, 0);
          ctx.lineTo(8 * s, -3 * s);
          ctx.lineTo(8 * s, 3 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#8d6e63";
          ctx.beginPath();
          ctx.moveTo(-12 * s, 0);
          ctx.lineTo(-8 * s, -4 * s);
          ctx.lineTo(-8 * s, 0);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-12 * s, 0);
          ctx.lineTo(-8 * s, 4 * s);
          ctx.lineTo(-8 * s, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        case "skeleton":
          ctx.fillStyle = "#e0e0e0";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 8 * s,
            6 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#424242";
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 2 * s,
            screenPos.y - 9 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.arc(
            screenPos.x + 2 * s,
            screenPos.y - 9 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.strokeStyle = "#e0e0e0";
          ctx.lineWidth = 1.5 * s;
          for (let r = 0; r < 3; r++) {
            ctx.beginPath();
            ctx.arc(
              screenPos.x,
              screenPos.y + r * 4 * s,
              5 * s,
              Math.PI * 0.2,
              Math.PI * 0.8
            );
            ctx.stroke();
          }
          break;
        case "barrel":
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 1,
            screenPos.y + 5 * s,
            10 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#6d4c41";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#4a3525";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 8 * s);
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 2 * s);
          ctx.stroke();
          ctx.fillStyle = "#5d4037";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 12 * s,
            6 * s,
            3 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case "fence":
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(
            screenPos.x - 18 * s,
            screenPos.y + 2 * s,
            36 * s,
            4 * s
          );
          ctx.fillStyle = "#5d4037";
          for (let f = -1; f <= 1; f++)
            ctx.fillRect(
              screenPos.x + f * 15 * s - 2 * s,
              screenPos.y - 15 * s,
              4 * s,
              18 * s
            );
          ctx.fillRect(
            screenPos.x - 18 * s,
            screenPos.y - 12 * s,
            36 * s,
            3 * s
          );
          ctx.fillRect(
            screenPos.x - 18 * s,
            screenPos.y - 5 * s,
            36 * s,
            3 * s
          );
          break;
        case "gravestone":
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 1,
            screenPos.y + 4 * s,
            10 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#757575";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y + 2 * s);
          ctx.lineTo(screenPos.x - 7 * s, screenPos.y - 10 * s);
          ctx.arc(screenPos.x, screenPos.y - 10 * s, 7 * s, Math.PI, 0);
          ctx.lineTo(screenPos.x + 7 * s, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#424242";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 1 * s, screenPos.y);
          ctx.stroke();
          break;
        case "tent":
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 2,
            screenPos.y + 6 * s,
            22 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = ["#8b4513", "#6d4c41", "#4e342e", "#3e2723"][variant];
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y + 4 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 4 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 4 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 4 * s);
          ctx.closePath();
          ctx.fill();
          break;
        case "flowers": {
          // Enhanced 3D flowers with detailed petals and stems
          const flowerPalettes = [
            { petals: ["#FF5252", "#FF8A80", "#FFCDD2"], center: "#FFF176", stem: "#2E7D32", stemDark: "#1B5E20" },
            { petals: ["#FFEB3B", "#FFF59D", "#FFFDE7"], center: "#FF8F00", stem: "#558B2F", stemDark: "#33691E" },
            { petals: ["#E040FB", "#EA80FC", "#F3E5F5"], center: "#FFD54F", stem: "#388E3C", stemDark: "#2E7D32" },
            { petals: ["#40C4FF", "#80D8FF", "#E1F5FE"], center: "#FFCA28", stem: "#43A047", stemDark: "#2E7D32" },
          ];
          const fp = flowerPalettes[variant % 4];

          // Ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Small grass tufts at base
          ctx.strokeStyle = fp.stem;
          ctx.lineWidth = 1.5 * s;
          for (let g = 0; g < 5; g++) {
            const gx = screenPos.x + (g - 2) * 5 * s;
            const sway = Math.sin(decorTime * 2 + g) * 1.5 * s;
            ctx.beginPath();
            ctx.moveTo(gx, screenPos.y);
            ctx.quadraticCurveTo(gx + sway * 0.5, screenPos.y - 4 * s, gx + sway, screenPos.y - 7 * s);
            ctx.stroke();
          }

          // Draw 5 flowers with different heights and angles
          const flowerPositions = [
            { x: -8, y: 0, height: 18, angle: -0.15 },
            { x: 0, y: 0, height: 22, angle: 0.05 },
            { x: 8, y: 0, height: 16, angle: 0.2 },
            { x: -4, y: -2, height: 14, angle: -0.08 },
            { x: 5, y: -1, height: 13, angle: 0.12 },
          ];

          flowerPositions.forEach((fl, idx) => {
            const fx = screenPos.x + fl.x * s;
            const fy = screenPos.y + fl.y * s;
            const sway = Math.sin(decorTime * 1.5 + idx * 0.7) * 2 * s;

            // Stem with gradient
            const stemGrad = ctx.createLinearGradient(fx, fy, fx, fy - fl.height * s);
            stemGrad.addColorStop(0, fp.stemDark);
            stemGrad.addColorStop(1, fp.stem);
            ctx.strokeStyle = stemGrad;
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.quadraticCurveTo(fx + sway * 0.3 + fl.angle * 10 * s, fy - fl.height * 0.5 * s, fx + sway + fl.angle * 8 * s, fy - fl.height * s);
            ctx.stroke();

            // Leaf on stem
            if (idx < 3) {
              ctx.fillStyle = fp.stem;
              ctx.save();
              ctx.translate(fx + sway * 0.2, fy - fl.height * 0.4 * s);
              ctx.rotate(fl.angle + 0.3);
              ctx.beginPath();
              ctx.ellipse(3 * s, 0, 4 * s, 1.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

            // Flower head position
            const headX = fx + sway + fl.angle * 8 * s;
            const headY = fy - fl.height * s;
            const petalSize = 3 + (idx === 1 ? 1 : 0);

            // Petals - layered for 3D effect
            for (let layer = 0; layer < 2; layer++) {
              const layerOffset = layer * 0.3;
              const layerSize = petalSize - layer * 0.5;

              for (let p = 0; p < 5; p++) {
                const pa = (p / 5) * Math.PI * 2 + layerOffset + decorTime * 0.3;
                const petalX = headX + Math.cos(pa) * layerSize * s;
                const petalY = headY + Math.sin(pa) * layerSize * 0.5 * s - layer * 1.5 * s;

                ctx.fillStyle = layer === 0 ? fp.petals[0] : fp.petals[1];
                ctx.beginPath();
                ctx.ellipse(petalX, petalY, 2.5 * s, 1.8 * s, pa, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            // Flower center with gradient
            const centerGrad = ctx.createRadialGradient(headX - 0.5 * s, headY - 2 * s, 0, headX, headY - 1.5 * s, 2.5 * s);
            centerGrad.addColorStop(0, "#FFF8E1");
            centerGrad.addColorStop(0.5, fp.center);
            centerGrad.addColorStop(1, fp.petals[0]);
            ctx.fillStyle = centerGrad;
            ctx.beginPath();
            ctx.arc(headX, headY - 1.5 * s, 2 * s, 0, Math.PI * 2);
            ctx.fill();

            // Pollen dots on center
            ctx.fillStyle = "#8D6E63";
            for (let d = 0; d < 3; d++) {
              const da = (d / 3) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(headX + Math.cos(da) * 0.8 * s, headY - 1.5 * s + Math.sin(da) * 0.4 * s, 0.4 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          break;
        }
        case "signpost":
          // Isometric wooden post
          const postW = 4 * s;
          const postH = 25 * s;
          // Ground Shadow
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            postW * 1.5,
            postW * 0.8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Post Side (Darker wood)
          ctx.fillStyle = "#5D4037";
          ctx.fillRect(screenPos.x, screenPos.y - postH, postW / 2, postH);
          // Post Front (Lighter wood)
          ctx.fillStyle = "#795548";
          ctx.fillRect(
            screenPos.x - postW / 2,
            screenPos.y - postH + 2 * s,
            postW / 2,
            postH - 2 * s
          );
          // Post Top cap
          ctx.fillStyle = "#8D6E63";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - postW / 2, screenPos.y - postH + 2 * s);
          ctx.lineTo(screenPos.x, screenPos.y - postH);
          ctx.lineTo(screenPos.x + postW / 2, screenPos.y - postH + 2 * s);
          ctx.lineTo(screenPos.x, screenPos.y - postH + 4 * s);
          ctx.fill();

          // The Sign Board (with thickness and angle)
          const signY = screenPos.y - postH + 5 * s;
          ctx.save();
          ctx.translate(screenPos.x, signY);
          ctx.rotate(-0.1); // Slight tilt
          // Sign shadow on post
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(-postW / 2, 2 * s, postW, 4 * s);

          // Sign thickness (dark edge)
          ctx.fillStyle = "#4E342E";
          ctx.beginPath();
          ctx.moveTo(-15 * s, 0);
          ctx.lineTo(15 * s, 0);
          ctx.lineTo(15 * s, 8 * s);
          ctx.lineTo(17 * s, 10 * s); // jagged edge
          ctx.lineTo(15 * s, 12 * s);
          ctx.lineTo(-15 * s, 12 * s);
          ctx.lineTo(-17 * s, 6 * s); // jagged edge
          ctx.closePath();
          ctx.fill();
          // Sign Front Face
          ctx.fillStyle = "#8D6E63";
          ctx.fillRect(-15 * s, -2 * s, 30 * s, 12 * s);
          // Wood grain details
          ctx.strokeStyle = "#6D4C41";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(-12 * s, 2 * s);
          ctx.lineTo(10 * s, 2 * s);
          ctx.moveTo(-10 * s, 6 * s);
          ctx.lineTo(12 * s, 6 * s);
          ctx.stroke();
          ctx.restore();
          break;
        case "fountain": {
          // Enhanced 3D isometric ornate fountain with animated water
          const fountainBaseX = screenPos.x;
          const fountainBaseY = screenPos.y;
          const waterTime = decorTime * 3;

          // Ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(fountainBaseX, fountainBaseY + 5 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Outer basin - stone rim
          const stoneGrad = ctx.createLinearGradient(
            fountainBaseX - 22 * s, 0, fountainBaseX + 22 * s, 0
          );
          stoneGrad.addColorStop(0, "#707880");
          stoneGrad.addColorStop(0.3, "#90A4AE");
          stoneGrad.addColorStop(0.7, "#B0BEC5");
          stoneGrad.addColorStop(1, "#78909C");

          ctx.fillStyle = stoneGrad;
          ctx.beginPath();
          ctx.ellipse(fountainBaseX, fountainBaseY, 22 * s, 11 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Basin inner wall
          ctx.fillStyle = "#607D8B";
          ctx.beginPath();
          ctx.ellipse(fountainBaseX, fountainBaseY - 2 * s, 18 * s, 9 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Water surface with ripple effect
          const waterGrad = ctx.createRadialGradient(
            fountainBaseX, fountainBaseY - 3 * s, 0,
            fountainBaseX, fountainBaseY - 3 * s, 15 * s
          );
          waterGrad.addColorStop(0, "#81D4FA");
          waterGrad.addColorStop(0.5, "#4FC3F7");
          waterGrad.addColorStop(1, "#29B6F6");

          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          ctx.ellipse(fountainBaseX, fountainBaseY - 3 * s, 15 * s, 7.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Water ripples
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1 * s;
          for (let r = 0; r < 3; r++) {
            const ripplePhase = (waterTime + r * 0.7) % 2;
            const rippleSize = 4 + ripplePhase * 5;
            const rippleAlpha = 1 - ripplePhase / 2;
            ctx.strokeStyle = `rgba(255,255,255,${rippleAlpha * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(fountainBaseX, fountainBaseY - 3 * s, rippleSize * s, rippleSize * 0.5 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Central pillar/pedestal
          ctx.fillStyle = "#78909C";
          ctx.fillRect(fountainBaseX - 3 * s, fountainBaseY - 18 * s, 6 * s, 15 * s);

          // Pillar highlight
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(fountainBaseX - 1 * s, fountainBaseY - 18 * s, 2 * s, 15 * s);

          // Top bowl
          ctx.fillStyle = "#90A4AE";
          ctx.beginPath();
          ctx.ellipse(fountainBaseX, fountainBaseY - 18 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Top bowl water
          ctx.fillStyle = "#81D4FA";
          ctx.beginPath();
          ctx.ellipse(fountainBaseX, fountainBaseY - 19 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Water spray from center
          const sprayHeight = 12 + Math.sin(waterTime * 2) * 3;
          const sprayGrad = ctx.createLinearGradient(
            0, fountainBaseY - 19 * s - sprayHeight * s,
            0, fountainBaseY - 19 * s
          );
          sprayGrad.addColorStop(0, "rgba(255,255,255,0.9)");
          sprayGrad.addColorStop(0.5, "rgba(225,245,254,0.7)");
          sprayGrad.addColorStop(1, "rgba(129,212,250,0.4)");

          ctx.fillStyle = sprayGrad;
          ctx.beginPath();
          ctx.moveTo(fountainBaseX - 2 * s, fountainBaseY - 19 * s);
          ctx.quadraticCurveTo(
            fountainBaseX - 4 * s, fountainBaseY - 25 * s,
            fountainBaseX, fountainBaseY - 19 * s - sprayHeight * s
          );
          ctx.quadraticCurveTo(
            fountainBaseX + 4 * s, fountainBaseY - 25 * s,
            fountainBaseX + 2 * s, fountainBaseY - 19 * s
          );
          ctx.closePath();
          ctx.fill();

          // Water droplets
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          for (let d = 0; d < 6; d++) {
            const dropPhase = (waterTime * 1.5 + d * 0.4) % 1;
            const dropAngle = (d / 6) * Math.PI * 2;
            const dropDist = 3 + dropPhase * 8;
            const dropX = fountainBaseX + Math.cos(dropAngle) * dropDist * s;
            const dropY = fountainBaseY - 19 * s + dropPhase * 16 * s - sprayHeight * (1 - dropPhase) * s * 0.5;
            const dropSize = (1 - dropPhase) * 1.5;

            ctx.beginPath();
            ctx.arc(dropX, dropY, dropSize * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Water falling from top bowl
          ctx.strokeStyle = "rgba(129,212,250,0.5)";
          ctx.lineWidth = 2 * s;
          for (let w = 0; w < 4; w++) {
            const wAngle = (w / 4) * Math.PI * 2 + waterTime * 0.5;
            const wX = fountainBaseX + Math.cos(wAngle) * 6 * s;
            const waveOffset = Math.sin(waterTime * 4 + w) * 2 * s;

            ctx.beginPath();
            ctx.moveTo(wX, fountainBaseY - 18 * s);
            ctx.quadraticCurveTo(
              wX + waveOffset, fountainBaseY - 10 * s,
              fountainBaseX + Math.cos(wAngle) * 10 * s, fountainBaseY - 3 * s
            );
            ctx.stroke();
          }

          // Sparkle on water
          const sparklePhase = waterTime % 1;
          if (sparklePhase < 0.3) {
            ctx.fillStyle = `rgba(255,255,255,${1 - sparklePhase / 0.3})`;
            ctx.beginPath();
            ctx.arc(fountainBaseX + 5 * s, fountainBaseY - 4 * s, 2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "bench":
          // Isometric view needs thickness for seat and legs
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          // Shadow under legs
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 10 * s,
            screenPos.y,
            4 * s,
            2 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.ellipse(
            screenPos.x + 10 * s,
            screenPos.y,
            4 * s,
            2 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          const benchColor = "#5D4037";
          const benchDark = "#3E2723";
          const benchLight = "#795548";

          // Front Legs (Darker faces)
          ctx.fillStyle = benchDark;
          ctx.fillRect(screenPos.x - 11 * s, screenPos.y - 8 * s, 2 * s, 8 * s);
          ctx.fillRect(screenPos.x + 9 * s, screenPos.y - 8 * s, 2 * s, 8 * s);
          // Side faces of legs (angled back)
          ctx.fillStyle = benchColor;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 11 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x - 9 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x - 9 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x - 11 * s, screenPos.y);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 9 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 11 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x + 11 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x + 9 * s, screenPos.y);
          ctx.fill();

          // Seat support beams
          ctx.fillStyle = benchDark;
          ctx.fillRect(
            screenPos.x - 12 * s,
            screenPos.y - 10 * s,
            24 * s,
            2 * s
          );

          // Seat Slats (Top surface - Light)
          ctx.fillStyle = benchLight;
          for (let i = 0; i < 3; i++) {
            // Offset back slats slightly for isometric depth
            ctx.fillRect(
              screenPos.x - 12 * s + i * s,
              screenPos.y - 12 * s - i * 3 * s,
              24 * s,
              2.5 * s
            );
          }
          // Seat Slats (Front thickness - Dark)
          ctx.fillStyle = benchDark;
          ctx.fillRect(
            screenPos.x - 12 * s,
            screenPos.y - 10 * s,
            24 * s,
            1 * s
          );

          // Backrest frames
          ctx.fillStyle = benchColor;
          ctx.fillRect(
            screenPos.x - 11 * s,
            screenPos.y - 20 * s,
            2 * s,
            10 * s
          );
          ctx.fillRect(
            screenPos.x + 9 * s,
            screenPos.y - 20 * s,
            2 * s,
            10 * s
          );
          // Backrest Slats
          ctx.fillStyle = benchLight;
          ctx.fillRect(
            screenPos.x - 12 * s,
            screenPos.y - 18 * s,
            24 * s,
            3 * s
          );
          ctx.fillRect(
            screenPos.x - 12 * s,
            screenPos.y - 23 * s,
            24 * s,
            3 * s
          );
          break;

        case "lamppost":
          // Victorian style isometric lamppost
          // Ground Shadow
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            8 * s,
            4 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          const metalDark = "#212121";
          const metalMid = "#424242";

          // Base (stepped)
          ctx.fillStyle = metalDark;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 2 * s,
            6 * s,
            3 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = metalMid;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 4 * s,
            5 * s,
            2.5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Pole (Cylinder with gradient for roundness)
          const poleGrad = ctx.createLinearGradient(
            screenPos.x - 2 * s,
            0,
            screenPos.x + 2 * s,
            0
          );
          poleGrad.addColorStop(0, metalDark);
          poleGrad.addColorStop(0.5, metalMid);
          poleGrad.addColorStop(1, metalDark);
          ctx.fillStyle = poleGrad;
          ctx.fillRect(
            screenPos.x - 2 * s,
            screenPos.y - 35 * s,
            4 * s,
            31 * s
          );

          // Lamp Head fixture
          ctx.fillStyle = metalDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 4 * s, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 45 * s);
          ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 45 * s);
          ctx.fill();

          // Glass/Light
          const flicker = 0.1 + Math.sin(decorTime * 3) * 0.05;
          ctx.fillStyle = `rgba(255, 236, 179, ${0.8 + flicker})`;
          ctx.fillRect(screenPos.x - 4 * s, screenPos.y - 44 * s, 8 * s, 8 * s);

          // Glow Effect
          const glowRad = ctx.createRadialGradient(
            screenPos.x,
            screenPos.y - 40 * s,
            2 * s,
            screenPos.x,
            screenPos.y - 40 * s,
            25 * s
          );
          glowRad.addColorStop(0, `rgba(255, 213, 79, ${0.4 + flicker})`);
          glowRad.addColorStop(1, "rgba(255, 213, 79, 0)");
          ctx.fillStyle = glowRad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 40 * s, 25 * s, 0, Math.PI * 2);
          ctx.fill();

          // Lamp Top Cap
          ctx.fillStyle = metalMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 45 * s);
          ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 45 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 52 * s);
          ctx.fill();
          break;

        // === DESERT DECORATIONS ===
        case "palm": {
          // Enhanced 3D isometric palm tree
          const palmBaseX = screenPos.x;
          const palmBaseY = screenPos.y;

          // Ground shadow with gradient
          const palmShadowGrad = ctx.createRadialGradient(
            palmBaseX + 20 * s, palmBaseY + 8 * s, 0,
            palmBaseX + 20 * s, palmBaseY + 8 * s, 35 * s
          );
          palmShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
          palmShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = palmShadowGrad;
          ctx.beginPath();
          ctx.ellipse(palmBaseX + 20 * s, palmBaseY + 8 * s, 35 * s, 15 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Curved trunk with gradient for 3D effect
          const trunkGrad = ctx.createLinearGradient(
            palmBaseX - 4 * s, 0, palmBaseX + 6 * s, 0
          );
          trunkGrad.addColorStop(0, "#5a4510");
          trunkGrad.addColorStop(0.5, "#8b6914");
          trunkGrad.addColorStop(1, "#6b5012");
          ctx.strokeStyle = trunkGrad;
          ctx.lineWidth = 8 * s;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(palmBaseX, palmBaseY + 5 * s);
          ctx.bezierCurveTo(
            palmBaseX + 6 * s, palmBaseY - 15 * s,
            palmBaseX + 10 * s, palmBaseY - 35 * s,
            palmBaseX + 5 * s, palmBaseY - 50 * s
          );
          ctx.stroke();

          // Trunk texture bands
          for (let i = 0; i < 8; i++) {
            const ty = palmBaseY - i * 6 * s - 2 * s;
            const tx = palmBaseX + Math.sin(i * 0.3) * 3 * s;
            ctx.strokeStyle = i % 2 === 0 ? "#5a4510" : "#3a2a08";
            ctx.lineWidth = 1.5 * s;
            ctx.beginPath();
            ctx.arc(tx, ty, 4 * s, -0.5, Math.PI + 0.5);
            ctx.stroke();
          }

          // Palm fronds (layered for depth)
          const frondColors = ["#1a5a1a", "#228b22", "#2e8b57", "#3cb371"];
          const palmTopX = palmBaseX + 5 * s;
          const palmTopY = palmBaseY - 50 * s;

          // Draw fronds in layers (back to front)
          for (let layer = 0; layer < 2; layer++) {
            const frondCount = layer === 0 ? 5 : 6;
            const layerOffset = layer === 0 ? 0 : Math.PI / 11;

            for (let f = 0; f < frondCount; f++) {
              const baseAngle = (f / frondCount) * Math.PI * 2 + layerOffset;
              const sway = Math.sin(decorTime * 1.5 + f * 0.5) * 0.1;
              const angle = baseAngle + sway;
              const frondLen = (35 - layer * 5) * s;

              // Frond stem
              ctx.strokeStyle = frondColors[layer + 1];
              ctx.lineWidth = (3 - layer * 0.5) * s;
              ctx.lineCap = "round";

              const endX = palmTopX + Math.cos(angle) * frondLen;
              const endY = palmTopY + Math.sin(angle) * frondLen * 0.4 + 15 * s;
              const ctrlX = palmTopX + Math.cos(angle) * frondLen * 0.4;
              const ctrlY = palmTopY - 8 * s + Math.sin(angle) * 5 * s;

              ctx.beginPath();
              ctx.moveTo(palmTopX, palmTopY);
              ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
              ctx.stroke();

              // Leaflets along the frond
              ctx.strokeStyle = frondColors[layer + 2] || frondColors[2];
              ctx.lineWidth = 1 * s;
              for (let l = 0.3; l < 1; l += 0.15) {
                const lx = palmTopX + (endX - palmTopX) * l;
                const ly = palmTopY + (ctrlY - palmTopY) * l * 0.5 + (endY - ctrlY) * l;
                const leafAngle = angle + (l - 0.5) * 0.3;
                const leafLen = 8 * s * (1 - l * 0.5);

                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(
                  lx + Math.cos(leafAngle + 0.5) * leafLen,
                  ly + Math.sin(leafAngle + 0.5) * leafLen * 0.3
                );
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(
                  lx + Math.cos(leafAngle - 0.5) * leafLen,
                  ly + Math.sin(leafAngle - 0.5) * leafLen * 0.3
                );
                ctx.stroke();
              }
            }
          }

          // Optional coconuts for some variants
          if (variant < 2) {
            ctx.fillStyle = "#5a3a1a";
            for (let c = 0; c < 3; c++) {
              const cx = palmTopX - 3 * s + c * 4 * s;
              const cy = palmTopY + 3 * s;
              ctx.beginPath();
              ctx.arc(cx, cy, 3 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
        case "cactus": {
          // Enhanced 3D isometric cactus with saguaro style
          const cacBaseX = screenPos.x;
          const cacBaseY = screenPos.y;

          // Ground shadow
          const cacShadowGrad = ctx.createRadialGradient(
            cacBaseX + 5 * s, cacBaseY + 5 * s, 0,
            cacBaseX + 5 * s, cacBaseY + 5 * s, 20 * s
          );
          cacShadowGrad.addColorStop(0, "rgba(0,0,0,0.2)");
          cacShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = cacShadowGrad;
          ctx.beginPath();
          ctx.ellipse(cacBaseX + 5 * s, cacBaseY + 5 * s, 20 * s, 8 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main body gradient for 3D roundness
          const cacGrad = ctx.createLinearGradient(
            cacBaseX - 8 * s, 0, cacBaseX + 8 * s, 0
          );
          cacGrad.addColorStop(0, "#1a4a1a");
          cacGrad.addColorStop(0.3, "#2d6a2d");
          cacGrad.addColorStop(0.5, "#3a8a3a");
          cacGrad.addColorStop(0.7, "#2d6a2d");
          cacGrad.addColorStop(1, "#1a4a1a");

          // Main body - rounded pillar shape
          ctx.fillStyle = cacGrad;
          ctx.beginPath();
          ctx.moveTo(cacBaseX - 7 * s, cacBaseY + 3 * s);
          ctx.quadraticCurveTo(cacBaseX - 8 * s, cacBaseY - 15 * s, cacBaseX - 6 * s, cacBaseY - 30 * s);
          ctx.quadraticCurveTo(cacBaseX, cacBaseY - 38 * s, cacBaseX + 6 * s, cacBaseY - 30 * s);
          ctx.quadraticCurveTo(cacBaseX + 8 * s, cacBaseY - 15 * s, cacBaseX + 7 * s, cacBaseY + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Vertical ridges for texture
          ctx.strokeStyle = "rgba(0,50,0,0.3)";
          ctx.lineWidth = 1 * s;
          for (let r = -2; r <= 2; r++) {
            ctx.beginPath();
            ctx.moveTo(cacBaseX + r * 2.5 * s, cacBaseY + 2 * s);
            ctx.quadraticCurveTo(
              cacBaseX + r * 2 * s, cacBaseY - 15 * s,
              cacBaseX + r * 1.5 * s, cacBaseY - 32 * s
            );
            ctx.stroke();
          }

          // Arms for larger variants
          if (variant > 0) {
            // Left arm
            const armGrad = ctx.createLinearGradient(
              cacBaseX - 20 * s, 0, cacBaseX - 10 * s, 0
            );
            armGrad.addColorStop(0, "#1a4a1a");
            armGrad.addColorStop(0.5, "#3a8a3a");
            armGrad.addColorStop(1, "#2d6a2d");

            ctx.fillStyle = armGrad;
            ctx.beginPath();
            ctx.moveTo(cacBaseX - 6 * s, cacBaseY - 12 * s);
            ctx.quadraticCurveTo(cacBaseX - 18 * s, cacBaseY - 14 * s, cacBaseX - 18 * s, cacBaseY - 22 * s);
            ctx.quadraticCurveTo(cacBaseX - 18 * s, cacBaseY - 30 * s, cacBaseX - 14 * s, cacBaseY - 30 * s);
            ctx.quadraticCurveTo(cacBaseX - 12 * s, cacBaseY - 30 * s, cacBaseX - 12 * s, cacBaseY - 22 * s);
            ctx.quadraticCurveTo(cacBaseX - 12 * s, cacBaseY - 16 * s, cacBaseX - 6 * s, cacBaseY - 15 * s);
            ctx.closePath();
            ctx.fill();

            // Right arm for variant > 1
            if (variant > 1) {
              ctx.fillStyle = armGrad;
              ctx.beginPath();
              ctx.moveTo(cacBaseX + 6 * s, cacBaseY - 8 * s);
              ctx.quadraticCurveTo(cacBaseX + 15 * s, cacBaseY - 10 * s, cacBaseX + 15 * s, cacBaseY - 18 * s);
              ctx.quadraticCurveTo(cacBaseX + 15 * s, cacBaseY - 26 * s, cacBaseX + 11 * s, cacBaseY - 26 * s);
              ctx.quadraticCurveTo(cacBaseX + 9 * s, cacBaseY - 26 * s, cacBaseX + 9 * s, cacBaseY - 18 * s);
              ctx.quadraticCurveTo(cacBaseX + 9 * s, cacBaseY - 12 * s, cacBaseX + 6 * s, cacBaseY - 11 * s);
              ctx.closePath();
              ctx.fill();
            }
          }

          // Spines (small dots)
          ctx.fillStyle = "#e8e0c0";
          for (let sy = 0; sy < 6; sy++) {
            for (let sx = -1; sx <= 1; sx++) {
              const spineX = cacBaseX + sx * 4 * s + (sy % 2) * 2 * s;
              const spineY = cacBaseY - 5 * s - sy * 5 * s;
              ctx.beginPath();
              ctx.arc(spineX, spineY, 0.8 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Top highlight
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.beginPath();
          ctx.ellipse(cacBaseX, cacBaseY - 33 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "dune": {
          // Enhanced 3D isometric sand dune with proper ground blending
          const duneBaseX = screenPos.x;
          const duneBaseY = screenPos.y;

          // Isometric ground shadow/base - fades into terrain
          const groundShadowGrad = ctx.createRadialGradient(
            duneBaseX, duneBaseY + 12 * s, 0,
            duneBaseX, duneBaseY + 12 * s, 65 * s
          );
          groundShadowGrad.addColorStop(0, "rgba(120,90,40,0.35)");
          groundShadowGrad.addColorStop(0.5, "rgba(100,75,30,0.2)");
          groundShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = groundShadowGrad;
          ctx.beginPath();
          ctx.ellipse(duneBaseX, duneBaseY + 12 * s, 60 * s, 18 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Base sand spread - isometric ellipse that grounds the dune
          const baseSandGrad = ctx.createRadialGradient(
            duneBaseX, duneBaseY + 8 * s, 0,
            duneBaseX, duneBaseY + 8 * s, 55 * s
          );
          baseSandGrad.addColorStop(0, "#c9a040");
          baseSandGrad.addColorStop(0.6, "#b89035");
          baseSandGrad.addColorStop(1, "rgba(168,128,48,0)");
          ctx.fillStyle = baseSandGrad;
          ctx.beginPath();
          ctx.ellipse(duneBaseX, duneBaseY + 8 * s, 55 * s, 16 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main dune body - gradient for depth with curved isometric base
          const duneGrad = ctx.createLinearGradient(
            duneBaseX - 45 * s, duneBaseY - 20 * s,
            duneBaseX + 45 * s, duneBaseY + 5 * s
          );
          duneGrad.addColorStop(0, "#f0d070");
          duneGrad.addColorStop(0.3, "#e8c060");
          duneGrad.addColorStop(0.6, "#d4a84b");
          duneGrad.addColorStop(1, "#b08830");

          ctx.fillStyle = duneGrad;
          ctx.beginPath();
          // Start from left side of isometric base ellipse
          ctx.moveTo(duneBaseX - 52 * s, duneBaseY + 6 * s);
          // Curve up to first peak
          ctx.bezierCurveTo(
            duneBaseX - 40 * s, duneBaseY - 2 * s,
            duneBaseX - 20 * s, duneBaseY - 15 * s,
            duneBaseX - 5 * s, duneBaseY - 22 * s
          );
          // Continue to second ridge
          ctx.bezierCurveTo(
            duneBaseX + 10 * s, duneBaseY - 15 * s,
            duneBaseX + 30 * s, duneBaseY - 8 * s,
            duneBaseX + 45 * s, duneBaseY - 3 * s
          );
          // Curve down to right side of isometric base
          ctx.bezierCurveTo(
            duneBaseX + 52 * s, duneBaseY + 2 * s,
            duneBaseX + 54 * s, duneBaseY + 5 * s,
            duneBaseX + 52 * s, duneBaseY + 8 * s
          );
          // Isometric curved base (front edge of dune)
          ctx.bezierCurveTo(
            duneBaseX + 35 * s, duneBaseY + 14 * s,
            duneBaseX - 35 * s, duneBaseY + 14 * s,
            duneBaseX - 52 * s, duneBaseY + 6 * s
          );
          ctx.fill();

          // Secondary dune layer (foreground ridge)
          const dune2Grad = ctx.createLinearGradient(
            duneBaseX - 35 * s, duneBaseY - 5 * s,
            duneBaseX + 40 * s, duneBaseY + 10 * s
          );
          dune2Grad.addColorStop(0, "#ddb855");
          dune2Grad.addColorStop(0.4, "#d4a84b");
          dune2Grad.addColorStop(1, "#a08028");

          ctx.fillStyle = dune2Grad;
          ctx.beginPath();
          ctx.moveTo(duneBaseX - 42 * s, duneBaseY + 10 * s);
          ctx.bezierCurveTo(
            duneBaseX - 25 * s, duneBaseY + 2 * s,
            duneBaseX - 5 * s, duneBaseY - 6 * s,
            duneBaseX + 12 * s, duneBaseY - 10 * s
          );
          ctx.bezierCurveTo(
            duneBaseX + 28 * s, duneBaseY - 5 * s,
            duneBaseX + 40 * s, duneBaseY + 2 * s,
            duneBaseX + 46 * s, duneBaseY + 10 * s
          );
          // Curved isometric base for foreground ridge
          ctx.bezierCurveTo(
            duneBaseX + 25 * s, duneBaseY + 16 * s,
            duneBaseX - 25 * s, duneBaseY + 16 * s,
            duneBaseX - 42 * s, duneBaseY + 10 * s
          );
          ctx.fill();

          // Wind-blown crest (highlighted edge with glow)
          ctx.shadowColor = "rgba(255,230,150,0.4)";
          ctx.shadowBlur = 4 * s;
          ctx.strokeStyle = "#f5e090";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(duneBaseX - 20 * s, duneBaseY - 8 * s);
          ctx.bezierCurveTo(
            duneBaseX - 10 * s, duneBaseY - 18 * s,
            duneBaseX, duneBaseY - 22 * s,
            duneBaseX + 12 * s, duneBaseY - 12 * s
          );
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Wind ripples texture on the dune face
          ctx.strokeStyle = "rgba(160,120,50,0.35)";
          ctx.lineWidth = 0.8 * s;
          for (let r = 0; r < 5; r++) {
            const ry = duneBaseY + r * 2.5 * s;
            const rxOffset = r * 3 * s;
            ctx.beginPath();
            ctx.moveTo(duneBaseX - 38 * s + rxOffset, ry + 2 * s);
            ctx.bezierCurveTo(
              duneBaseX - 20 * s + rxOffset, ry - 1 * s,
              duneBaseX + rxOffset, ry - 1 * s,
              duneBaseX + 25 * s + rxOffset * 0.5, ry + 2 * s
            );
            ctx.stroke();
          }

          // Sand grain texture highlights
          ctx.fillStyle = "rgba(255,235,180,0.25)";
          for (let g = 0; g < 8; g++) {
            const gx = duneBaseX - 30 * s + g * 9 * s + (Math.sin(g * 1.7) * 5 * s);
            const gy = duneBaseY - 5 * s + (Math.cos(g * 2.3) * 8 * s);
            ctx.beginPath();
            ctx.ellipse(gx, gy, 2 * s, 1 * s, 0.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Subtle wind-blown sand particles with animation
          ctx.fillStyle = "rgba(240,215,130,0.4)";
          const windOffset = Math.sin(decorTime * 2.5) * 6 * s;
          const windOffset2 = Math.cos(decorTime * 1.8) * 4 * s;
          for (let p = 0; p < 5; p++) {
            const px = duneBaseX - 15 * s + p * 10 * s + windOffset + (p % 2) * windOffset2;
            const py = duneBaseY - 16 * s + p * 3 * s + Math.sin(decorTime * 3 + p) * 2 * s;
            ctx.beginPath();
            ctx.ellipse(px, py, 4 * s, 1.2 * s, 0.4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Scattered sand at the base edges for natural blending
          ctx.fillStyle = "rgba(200,160,80,0.3)";
          for (let sp = 0; sp < 12; sp++) {
            const angle = (sp / 12) * Math.PI * 2;
            const dist = 48 * s + Math.sin(sp * 2.7) * 8 * s;
            const spx = duneBaseX + Math.cos(angle) * dist * 0.9;
            const spy = duneBaseY + 10 * s + Math.sin(angle) * dist * 0.3;
            const spSize = 1.5 * s + Math.abs(Math.sin(sp * 1.3)) * 2 * s;
            ctx.beginPath();
            ctx.ellipse(spx, spy, spSize, spSize * 0.4, angle * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "pyramid": {
          const pyrX = screenPos.x;
          const pyrY = screenPos.y;
          const tipY = pyrY - 60 * s;

          // Ground shadow - positioned to extend from pyramid base toward lower-left
          // Shadow center is offset from pyramid base (pyrY + 25) in the shadow direction
          const shadowCenterX = pyrX + 30 * s;
          const shadowCenterY = pyrY + 17 * s;

          const pyrShadowGrad = ctx.createRadialGradient(
            shadowCenterX, shadowCenterY, 0,
            shadowCenterX, shadowCenterY, 55 * s
          );
          pyrShadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
          pyrShadowGrad.addColorStop(0.5, "rgba(0,0,0,0.2)");
          pyrShadowGrad.addColorStop(0.8, "rgba(0,0,0,0.08)");
          pyrShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = pyrShadowGrad;
          ctx.beginPath();
          // Skewed ellipse extending from base toward lower-right (isometric shadow direction)
          ctx.ellipse(shadowCenterX, shadowCenterY, 50 * s, 20 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Right face (lit) with gradient
          const rightFaceGrad = ctx.createLinearGradient(
            pyrX, tipY,
            pyrX + 50 * s, pyrY + 15 * s
          );
          rightFaceGrad.addColorStop(0, "#e8c860");
          rightFaceGrad.addColorStop(0.3, "#d4a84b");
          rightFaceGrad.addColorStop(0.7, "#c9983f");
          rightFaceGrad.addColorStop(1, "#b88832");

          ctx.fillStyle = rightFaceGrad;
          ctx.beginPath();
          ctx.moveTo(pyrX, tipY);
          ctx.lineTo(pyrX + 50 * s, pyrY + 3 * s);
          ctx.lineTo(pyrX, pyrY + 25 * s);
          ctx.closePath();
          ctx.fill();

          // Left face (shadow) with gradient
          const leftFaceGrad = ctx.createLinearGradient(
            pyrX - 50 * s, pyrY,
            pyrX, tipY
          );
          leftFaceGrad.addColorStop(0, "#7a6030");
          leftFaceGrad.addColorStop(0.4, "#8a7035");
          leftFaceGrad.addColorStop(0.8, "#9a7a3a");
          leftFaceGrad.addColorStop(1, "#a8843f");

          ctx.fillStyle = leftFaceGrad;
          ctx.beginPath();
          ctx.moveTo(pyrX, tipY);
          ctx.lineTo(pyrX - 50 * s, pyrY + 3 * s);
          ctx.lineTo(pyrX, pyrY + 25 * s);
          ctx.closePath();
          ctx.fill();

          // Stone block lines for texture
          ctx.strokeStyle = "rgba(0,0,0,0.12)";
          ctx.lineWidth = 0.8 * s;
          for (let row = 1; row < 6; row++) {
            const rowY = tipY + row * 14 * s;
            const rowWidth = row * 8 * s;
            // Right side blocks
            ctx.beginPath();
            ctx.moveTo(pyrX, rowY);
            ctx.lineTo(pyrX + rowWidth, rowY - row * 3 * s);
            ctx.stroke();
            // Left side blocks  
            ctx.beginPath();
            ctx.moveTo(pyrX, rowY);
            ctx.lineTo(pyrX - rowWidth, rowY - row * 3 * s);
            ctx.stroke();
          }

          // Edge highlight (center ridge)
          ctx.strokeStyle = "rgba(255,220,140,0.5)";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(pyrX, tipY + 15 * s);
          ctx.lineTo(pyrX, pyrY + 25 * s);
          ctx.stroke();

          // === SHINY GOLDEN PYRAMIDION (TIP) ===
          const capHeight = 18 * s;
          const capWidth = 12 * s;
          const capY = tipY + capHeight;

          // Outer glow effect
          ctx.shadowColor = "rgba(255,215,100,0.8)";
          ctx.shadowBlur = 20 * s;

          // Golden cap base - right face
          const capRightGrad = ctx.createLinearGradient(
            pyrX, tipY,
            pyrX + capWidth, capY
          );
          capRightGrad.addColorStop(0, "#fff8e0");
          capRightGrad.addColorStop(0.2, "#ffd700");
          capRightGrad.addColorStop(0.5, "#f0c030");
          capRightGrad.addColorStop(1, "#d4a020");

          ctx.fillStyle = capRightGrad;
          ctx.beginPath();
          ctx.moveTo(pyrX, tipY);
          ctx.lineTo(pyrX + capWidth, capY - 3 * s);
          ctx.lineTo(pyrX, capY);
          ctx.closePath();
          ctx.fill();

          // Golden cap - left face
          const capLeftGrad = ctx.createLinearGradient(
            pyrX - capWidth, capY,
            pyrX, tipY
          );
          capLeftGrad.addColorStop(0, "#b8860b");
          capLeftGrad.addColorStop(0.3, "#d4a020");
          capLeftGrad.addColorStop(0.7, "#e8b830");
          capLeftGrad.addColorStop(1, "#f5d050");

          ctx.fillStyle = capLeftGrad;
          ctx.beginPath();
          ctx.moveTo(pyrX, tipY);
          ctx.lineTo(pyrX - capWidth, capY - 3 * s);
          ctx.lineTo(pyrX, capY);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 0;

          // Bright tip highlight
          const tipHighlightGrad = ctx.createRadialGradient(
            pyrX, tipY + 3 * s, 0,
            pyrX, tipY + 3 * s, 8 * s
          );
          tipHighlightGrad.addColorStop(0, "rgba(255,255,255,0.9)");
          tipHighlightGrad.addColorStop(0.3, "rgba(255,250,200,0.7)");
          tipHighlightGrad.addColorStop(0.6, "rgba(255,230,150,0.3)");
          tipHighlightGrad.addColorStop(1, "transparent");
          ctx.fillStyle = tipHighlightGrad;
          ctx.beginPath();
          ctx.arc(pyrX, tipY + 3 * s, 8 * s, 0, Math.PI * 2);
          ctx.fill();

          // Animated sparkle/shine effect
          const sparklePhase = decorTime * 3;
          const sparkleIntensity = (Math.sin(sparklePhase) + 1) / 2;

          // Main sparkle
          ctx.fillStyle = `rgba(255,255,255,${0.4 + sparkleIntensity * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(pyrX, tipY - 5 * s * sparkleIntensity);
          ctx.lineTo(pyrX + 2 * s, tipY + 3 * s);
          ctx.lineTo(pyrX, tipY + 8 * s * sparkleIntensity);
          ctx.lineTo(pyrX - 2 * s, tipY + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Horizontal sparkle
          ctx.beginPath();
          ctx.moveTo(pyrX - 6 * s * sparkleIntensity, tipY + 2 * s);
          ctx.lineTo(pyrX, tipY + 4 * s);
          ctx.lineTo(pyrX + 6 * s * sparkleIntensity, tipY + 2 * s);
          ctx.lineTo(pyrX, tipY);
          ctx.closePath();
          ctx.fill();

          // Secondary sparkles around the tip
          const sparkle2Phase = decorTime * 2.3;
          const sparkle2Int = (Math.sin(sparkle2Phase + 1) + 1) / 2;
          ctx.fillStyle = `rgba(255,250,200,${0.3 + sparkle2Int * 0.4})`;

          // Right sparkle
          ctx.beginPath();
          ctx.arc(pyrX + 5 * s, tipY + 8 * s, 2 * s * sparkle2Int, 0, Math.PI * 2);
          ctx.fill();

          // Left sparkle (offset phase)
          const sparkle3Int = (Math.sin(sparkle2Phase + 2.5) + 1) / 2;
          ctx.fillStyle = `rgba(255,250,200,${0.3 + sparkle3Int * 0.4})`;
          ctx.beginPath();
          ctx.arc(pyrX - 4 * s, tipY + 10 * s, 1.8 * s * sparkle3Int, 0, Math.PI * 2);
          ctx.fill();

          // Edge gleam on cap
          ctx.strokeStyle = "rgba(255,255,255,0.7)";
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(pyrX, tipY);
          ctx.lineTo(pyrX + capWidth * 0.5, capY - 10 * s);
          ctx.stroke();

          // Subtle lens flare effect
          if (sparkleIntensity > 0.7) {
            const flareAlpha = (sparkleIntensity - 0.7) * 2;
            ctx.fillStyle = `rgba(255,255,240,${flareAlpha * 0.15})`;
            ctx.beginPath();
            ctx.ellipse(pyrX + 15 * s, tipY + 15 * s, 12 * s, 4 * s, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(pyrX - 10 * s, tipY + 20 * s, 8 * s, 3 * s, -0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "obelisk": {
          // Enhanced 3D isometric Egyptian obelisk
          const obelBaseX = screenPos.x;
          const obelBaseY = screenPos.y;

          // Ground shadow
          const obelShadowGrad = ctx.createRadialGradient(
            obelBaseX + 8 * s, obelBaseY + 8 * s, 0,
            obelBaseX + 8 * s, obelBaseY + 8 * s, 18 * s
          );
          obelShadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
          obelShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = obelShadowGrad;
          ctx.beginPath();
          ctx.ellipse(obelBaseX + 8 * s, obelBaseY + 8 * s, 18 * s, 8 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Base pedestal
          ctx.fillStyle = "#6b5a45";
          ctx.beginPath();
          ctx.moveTo(obelBaseX - 12 * s, obelBaseY + 5 * s);
          ctx.lineTo(obelBaseX + 12 * s, obelBaseY + 5 * s);
          ctx.lineTo(obelBaseX + 10 * s, obelBaseY);
          ctx.lineTo(obelBaseX - 10 * s, obelBaseY);
          ctx.closePath();
          ctx.fill();

          // Right face (lit side)
          ctx.fillStyle = "#a08868";
          ctx.beginPath();
          ctx.moveTo(obelBaseX + 2 * s, obelBaseY);
          ctx.lineTo(obelBaseX + 9 * s, obelBaseY);
          ctx.lineTo(obelBaseX + 7 * s, obelBaseY - 45 * s);
          ctx.lineTo(obelBaseX, obelBaseY - 55 * s);
          ctx.lineTo(obelBaseX, obelBaseY - 45 * s);
          ctx.closePath();
          ctx.fill();

          // Left face (shaded side)
          ctx.fillStyle = "#7a6850";
          ctx.beginPath();
          ctx.moveTo(obelBaseX - 2 * s, obelBaseY);
          ctx.lineTo(obelBaseX - 9 * s, obelBaseY);
          ctx.lineTo(obelBaseX - 7 * s, obelBaseY - 45 * s);
          ctx.lineTo(obelBaseX, obelBaseY - 55 * s);
          ctx.lineTo(obelBaseX, obelBaseY - 45 * s);
          ctx.closePath();
          ctx.fill();

          // Pyramidion (gold cap)
          ctx.fillStyle = "#d4a840";
          ctx.beginPath();
          ctx.moveTo(obelBaseX, obelBaseY - 55 * s);
          ctx.lineTo(obelBaseX - 5 * s, obelBaseY - 48 * s);
          ctx.lineTo(obelBaseX + 5 * s, obelBaseY - 48 * s);
          ctx.closePath();
          ctx.fill();

          // Gold cap highlight
          ctx.fillStyle = "#f0c850";
          ctx.beginPath();
          ctx.moveTo(obelBaseX, obelBaseY - 55 * s);
          ctx.lineTo(obelBaseX + 5 * s, obelBaseY - 48 * s);
          ctx.lineTo(obelBaseX + 2 * s, obelBaseY - 50 * s);
          ctx.closePath();
          ctx.fill();

          // Hieroglyphic carvings (more detailed)
          ctx.fillStyle = "#5a4a38";
          // Left side glyphs
          for (let h = 0; h < 5; h++) {
            const hy = obelBaseY - 40 * s + h * 8 * s;
            // Varied glyph shapes
            if (h % 3 === 0) {
              // Eye shape
              ctx.beginPath();
              ctx.ellipse(obelBaseX - 5 * s, hy, 2 * s, 1.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(obelBaseX - 5 * s, hy, 0.8 * s, 0, Math.PI * 2);
              ctx.fill();
            } else if (h % 3 === 1) {
              // Ankh shape
              ctx.beginPath();
              ctx.ellipse(obelBaseX - 5 * s, hy - 1 * s, 1.5 * s, 1 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillRect(obelBaseX - 5.5 * s, hy, 1 * s, 3 * s);
              ctx.fillRect(obelBaseX - 6.5 * s, hy + 1 * s, 3 * s, 0.8 * s);
            } else {
              // Rectangle glyph
              ctx.fillRect(obelBaseX - 6.5 * s, hy, 3 * s, 1.5 * s);
            }
          }

          // Right side glyphs
          ctx.fillStyle = "#6a5a48";
          for (let h = 0; h < 5; h++) {
            const hy = obelBaseY - 38 * s + h * 8 * s;
            if (h % 2 === 0) {
              ctx.fillRect(obelBaseX + 3 * s, hy, 3 * s, 1.5 * s);
            } else {
              ctx.beginPath();
              ctx.arc(obelBaseX + 4.5 * s, hy, 1.5 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Edge highlight
          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(obelBaseX, obelBaseY - 55 * s);
          ctx.lineTo(obelBaseX + 7 * s, obelBaseY - 45 * s);
          ctx.stroke();
          break;
        }
        case "giant_sphinx": {
          const time = Date.now() / 1000;

          // Color palette - aged sandstone
          const sandLight = "#d4c490";
          const sandBase = "#c2b280";
          const sandMid = "#b0a070";
          const sandDark = "#8a7a55";
          const sandShadow = "#6a5a40";
          const goldAccent = "#d4a850";
          const goldDark = "#a08030";
          const eyeGlow = "#40d0ff";

          // Subtle mystical pulse
          const mysticPulse = 0.6 + Math.sin(time * 1.5) * 0.2;

          // ========== GROUND SHADOW ==========
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 5 * s,
            screenPos.y + 18 * s,
            55 * s,
            22 * s,
            0.1,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // ========== SAND AROUND BASE ==========
          const sandGrad = ctx.createRadialGradient(
            screenPos.x,
            screenPos.y + 10 * s,
            20 * s,
            screenPos.x,
            screenPos.y + 10 * s,
            60 * s
          );
          sandGrad.addColorStop(0, "rgba(194, 178, 128, 0.4)");
          sandGrad.addColorStop(0.5, "rgba(194, 178, 128, 0.2)");
          sandGrad.addColorStop(1, "rgba(194, 178, 128, 0)");
          ctx.fillStyle = sandGrad;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 10 * s,
            60 * s,
            25 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // ========== GRAND PEDESTAL BASE ==========
          // Multi-tiered base for monumentality

          // Bottom tier (largest)
          ctx.fillStyle = sandDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 45 * s, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x + 45 * s, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 32 * s);
          ctx.closePath();
          ctx.fill();

          // Bottom tier front face
          ctx.fillStyle = sandShadow;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 45 * s, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 32 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 38 * s);
          ctx.lineTo(screenPos.x - 45 * s, screenPos.y + 18 * s);
          ctx.closePath();
          ctx.fill();

          // Bottom tier side face
          ctx.fillStyle = sandDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 32 * s);
          ctx.lineTo(screenPos.x + 45 * s, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x + 45 * s, screenPos.y + 18 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 38 * s);
          ctx.closePath();
          ctx.fill();

          // Middle tier
          ctx.fillStyle = sandMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 38 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 28 * s);
          ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 14 * s);
          ctx.closePath();
          ctx.fill();

          // Middle tier front
          ctx.fillStyle = sandDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 38 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 20 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 28 * s);
          ctx.lineTo(screenPos.x - 38 * s, screenPos.y + 12 * s);
          ctx.closePath();
          ctx.fill();

          // Middle tier side
          ctx.fillStyle = sandMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 20 * s);
          ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 28 * s);
          ctx.closePath();
          ctx.fill();

          // Top tier (main platform)
          ctx.fillStyle = sandBase;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 32 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 16 * s);
          ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 14 * s);
          ctx.closePath();
          ctx.fill();

          // Top tier front
          ctx.fillStyle = sandMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 32 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 18 * s);
          ctx.lineTo(screenPos.x - 32 * s, screenPos.y + 5 * s);
          ctx.closePath();
          ctx.fill();

          // Top tier side
          ctx.fillStyle = sandBase;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 12 * s);
          ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x + 32 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 18 * s);
          ctx.closePath();
          ctx.fill();

          // ========== HIEROGLYPHIC CARVINGS ON BASE ==========
          ctx.strokeStyle = sandShadow;
          ctx.lineWidth = 1 * s;

          // Front face hieroglyphics
          const glyphY = screenPos.y + 8 * s;
          // Ankh symbol
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 20 * s,
            glyphY - 3 * s,
            2.5 * s,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, glyphY - 0.5 * s);
          ctx.lineTo(screenPos.x - 20 * s, glyphY + 6 * s);
          ctx.moveTo(screenPos.x - 23 * s, glyphY + 2 * s);
          ctx.lineTo(screenPos.x - 17 * s, glyphY + 2 * s);
          ctx.stroke();

          // Eye of Horus
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 8 * s,
            glyphY + 1 * s,
            4 * s,
            2.5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(screenPos.x - 8 * s, glyphY + 1 * s, 1.5 * s, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, glyphY + 3.5 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 10 * s,
            glyphY + 6 * s,
            screenPos.x - 12 * s,
            glyphY + 5 * s
          );
          ctx.stroke();

          // Cartouche border on side
          ctx.strokeStyle = sandDark;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.roundRect(
            screenPos.x + 8 * s,
            screenPos.y + 3 * s,
            18 * s,
            8 * s,
            3 * s
          );
          ctx.stroke();

          // ========== EXTENDED FRONT PAWS ==========
          // Right paw (front)
          const pawGrad = ctx.createLinearGradient(
            screenPos.x + 15 * s,
            screenPos.y - 5 * s,
            screenPos.x + 35 * s,
            screenPos.y + 5 * s
          );
          pawGrad.addColorStop(0, sandBase);
          pawGrad.addColorStop(0.5, sandLight);
          pawGrad.addColorStop(1, sandMid);
          ctx.fillStyle = pawGrad;

          ctx.beginPath();
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 35 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x + 38 * s, screenPos.y + 2 * s);
          ctx.lineTo(screenPos.x + 35 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y);
          ctx.closePath();
          ctx.fill();

          // Paw details - toes
          ctx.strokeStyle = sandDark;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 32 * s, screenPos.y - 1 * s);
          ctx.lineTo(screenPos.x + 35 * s, screenPos.y + 2 * s);
          ctx.moveTo(screenPos.x + 29 * s, screenPos.y);
          ctx.lineTo(screenPos.x + 32 * s, screenPos.y + 3 * s);
          ctx.stroke();

          // Left paw (behind, darker)
          ctx.fillStyle = sandMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 6 * s);
          ctx.lineTo(screenPos.x + 28 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x + 28 * s, screenPos.y - 6 * s);
          ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 2 * s);
          ctx.closePath();
          ctx.fill();

          // ========== LION BODY ==========
          // Back haunch
          ctx.fillStyle = sandDark;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 18 * s,
            screenPos.y - 18 * s,
            14 * s,
            10 * s,
            -0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Main body gradient
          const bodyGrad = ctx.createLinearGradient(
            screenPos.x - 25 * s,
            screenPos.y - 30 * s,
            screenPos.x + 20 * s,
            screenPos.y
          );
          bodyGrad.addColorStop(0, sandLight);
          bodyGrad.addColorStop(0.3, sandBase);
          bodyGrad.addColorStop(0.6, sandMid);
          bodyGrad.addColorStop(1, sandDark);
          ctx.fillStyle = bodyGrad;

          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 12 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 20 * s,
            screenPos.y - 35 * s,
            screenPos.x - 5 * s,
            screenPos.y - 32 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x + 15 * s,
            screenPos.y - 28 * s,
            screenPos.x + 22 * s,
            screenPos.y - 18 * s
          );
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 6 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 8 * s);
          ctx.closePath();
          ctx.fill();

          // Body contour lines (muscle definition)
          ctx.strokeStyle = sandDark;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 15 * s, screenPos.y - 25 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 5 * s,
            screenPos.y - 20 * s,
            screenPos.x + 5 * s,
            screenPos.y - 22 * s
          );
          ctx.stroke();

          // Ribcage suggestion
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 18 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 8 * s,
            screenPos.y - 14 * s,
            screenPos.x - 5 * s,
            screenPos.y - 12 * s
          );
          ctx.stroke();

          // ========== CHEST AND NECK ==========
          // Broad chest
          const chestGrad = ctx.createLinearGradient(
            screenPos.x + 5 * s,
            screenPos.y - 35 * s,
            screenPos.x + 25 * s,
            screenPos.y - 15 * s
          );
          chestGrad.addColorStop(0, sandLight);
          chestGrad.addColorStop(0.5, sandBase);
          chestGrad.addColorStop(1, sandMid);
          ctx.fillStyle = chestGrad;

          ctx.beginPath();
          ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 32 * s);
          ctx.quadraticCurveTo(
            screenPos.x + 18 * s,
            screenPos.y - 35 * s,
            screenPos.x + 25 * s,
            screenPos.y - 25 * s
          );
          ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 18 * s);
          ctx.quadraticCurveTo(
            screenPos.x + 15 * s,
            screenPos.y - 25 * s,
            screenPos.x + 5 * s,
            screenPos.y - 28 * s
          );
          ctx.closePath();
          ctx.fill();

          // ========== NEMES HEADDREs (Back portion first) ==========
          // Back drape of headdres
          ctx.fillStyle = sandMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 55 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 20 * s,
            screenPos.y - 50 * s,
            screenPos.x - 22 * s,
            screenPos.y - 25 * s
          );
          ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 20 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 12 * s,
            screenPos.y - 35 * s,
            screenPos.x,
            screenPos.y - 45 * s
          );
          ctx.closePath();
          ctx.fill();

          // ========== HEAD AND FACE ==========
          const headCenterX = screenPos.x + 8 * s;
          const headCenterY = screenPos.y - 45 * s;

          // Face base shape
          const faceGrad = ctx.createLinearGradient(
            headCenterX - 10 * s,
            headCenterY - 10 * s,
            headCenterX + 10 * s,
            headCenterY + 15 * s
          );
          faceGrad.addColorStop(0, sandLight);
          faceGrad.addColorStop(0.4, sandBase);
          faceGrad.addColorStop(0.8, sandMid);
          faceGrad.addColorStop(1, sandDark);
          ctx.fillStyle = faceGrad;

          // Face shape - more angular/Egyptian
          ctx.beginPath();
          ctx.moveTo(headCenterX - 10 * s, headCenterY - 8 * s);
          ctx.lineTo(headCenterX - 12 * s, headCenterY + 5 * s);
          ctx.quadraticCurveTo(
            headCenterX - 10 * s,
            headCenterY + 12 * s,
            headCenterX,
            headCenterY + 15 * s
          );
          ctx.quadraticCurveTo(
            headCenterX + 10 * s,
            headCenterY + 12 * s,
            headCenterX + 12 * s,
            headCenterY + 5 * s
          );
          ctx.lineTo(headCenterX + 10 * s, headCenterY - 8 * s);
          ctx.closePath();
          ctx.fill();

          // ========== NEMES HEADDREs (Front) ==========
          // Main headdres
          const nemesGrad = ctx.createLinearGradient(
            headCenterX - 18 * s,
            headCenterY - 15 * s,
            headCenterX + 18 * s,
            headCenterY + 10 * s
          );
          nemesGrad.addColorStop(0, goldAccent);
          nemesGrad.addColorStop(0.3, sandLight);
          nemesGrad.addColorStop(0.5, goldAccent);
          nemesGrad.addColorStop(0.7, sandLight);
          nemesGrad.addColorStop(1, goldDark);
          ctx.fillStyle = nemesGrad;

          // Headdres shape
          ctx.beginPath();
          ctx.moveTo(headCenterX, headCenterY - 18 * s); // Top
          ctx.quadraticCurveTo(
            headCenterX - 18 * s,
            headCenterY - 15 * s,
            headCenterX - 20 * s,
            headCenterY
          );
          ctx.lineTo(headCenterX - 18 * s, headCenterY + 20 * s); // Left drape
          ctx.lineTo(headCenterX - 12 * s, headCenterY + 5 * s);
          ctx.lineTo(headCenterX - 10 * s, headCenterY - 8 * s);
          ctx.lineTo(headCenterX + 10 * s, headCenterY - 8 * s);
          ctx.lineTo(headCenterX + 12 * s, headCenterY + 5 * s);
          ctx.lineTo(headCenterX + 18 * s, headCenterY + 20 * s); // Right drape
          ctx.quadraticCurveTo(
            headCenterX + 18 * s,
            headCenterY - 15 * s,
            headCenterX,
            headCenterY - 18 * s
          );
          ctx.closePath();
          ctx.fill();

          // Headdres stripes
          ctx.strokeStyle = goldDark;
          ctx.lineWidth = 1.5 * s;

          // Left side stripes
          for (let i = 0; i < 5; i++) {
            const stripeT = i / 5;
            ctx.beginPath();
            ctx.moveTo(
              headCenterX - 10 * s - stripeT * 8 * s,
              headCenterY - 8 * s + stripeT * 5 * s
            );
            ctx.lineTo(
              headCenterX - 12 * s - stripeT * 6 * s,
              headCenterY + 5 * s + stripeT * 15 * s
            );
            ctx.stroke();
          }

          // Right side stripes
          for (let i = 0; i < 5; i++) {
            const stripeT = i / 5;
            ctx.beginPath();
            ctx.moveTo(
              headCenterX + 10 * s + stripeT * 8 * s,
              headCenterY - 8 * s + stripeT * 5 * s
            );
            ctx.lineTo(
              headCenterX + 12 * s + stripeT * 6 * s,
              headCenterY + 5 * s + stripeT * 15 * s
            );
            ctx.stroke();
          }

          // ========== URAEUS (Cobra on forehead) ==========
          ctx.fillStyle = goldAccent;
          // Cobra body
          ctx.beginPath();
          ctx.moveTo(headCenterX, headCenterY - 18 * s);
          ctx.quadraticCurveTo(
            headCenterX + 2 * s,
            headCenterY - 22 * s,
            headCenterX,
            headCenterY - 26 * s
          );
          ctx.quadraticCurveTo(
            headCenterX - 2 * s,
            headCenterY - 22 * s,
            headCenterX,
            headCenterY - 18 * s
          );
          ctx.fill();

          // Cobra hood
          ctx.beginPath();
          ctx.moveTo(headCenterX - 4 * s, headCenterY - 24 * s);
          ctx.quadraticCurveTo(
            headCenterX,
            headCenterY - 30 * s,
            headCenterX + 4 * s,
            headCenterY - 24 * s
          );
          ctx.quadraticCurveTo(
            headCenterX,
            headCenterY - 26 * s,
            headCenterX - 4 * s,
            headCenterY - 24 * s
          );
          ctx.fill();

          // Cobra eyes (glowing)
          ctx.fillStyle = `rgba(255, 50, 50, ${mysticPulse})`;
          ctx.beginPath();
          ctx.arc(
            headCenterX - 1.5 * s,
            headCenterY - 26 * s,
            0.8 * s,
            0,
            Math.PI * 2
          );
          ctx.arc(
            headCenterX + 1.5 * s,
            headCenterY - 26 * s,
            0.8 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // ========== FACIAL FEATURES ==========
          // Eyebrows (carved)
          ctx.strokeStyle = sandDark;
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(headCenterX - 8 * s, headCenterY - 3 * s);
          ctx.quadraticCurveTo(
            headCenterX - 5 * s,
            headCenterY - 5 * s,
            headCenterX - 2 * s,
            headCenterY - 3 * s
          );
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(headCenterX + 2 * s, headCenterY - 3 * s);
          ctx.quadraticCurveTo(
            headCenterX + 5 * s,
            headCenterY - 5 * s,
            headCenterX + 8 * s,
            headCenterY - 3 * s
          );
          ctx.stroke();

          // Eye sockets
          ctx.fillStyle = sandShadow;
          ctx.beginPath();
          ctx.ellipse(
            headCenterX - 5 * s,
            headCenterY,
            3.5 * s,
            2 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(
            headCenterX + 5 * s,
            headCenterY,
            3.5 * s,
            2 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Mystical glowing eyes
          const eyeGlowIntensity = mysticPulse * 0.8;
          ctx.fillStyle = `rgba(64, 208, 255, ${eyeGlowIntensity})`;
          ctx.shadowColor = eyeGlow;
          ctx.shadowBlur = 8 * s;
          ctx.beginPath();
          ctx.ellipse(
            headCenterX - 5 * s,
            headCenterY,
            2.5 * s,
            1.5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(
            headCenterX + 5 * s,
            headCenterY,
            2.5 * s,
            1.5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.shadowBlur = 0;

          // Eye pupils
          ctx.fillStyle = "#104050";
          ctx.beginPath();
          ctx.arc(headCenterX - 5 * s, headCenterY, 1 * s, 0, Math.PI * 2);
          ctx.arc(headCenterX + 5 * s, headCenterY, 1 * s, 0, Math.PI * 2);
          ctx.fill();

          // Nose
          ctx.fillStyle = sandMid;
          ctx.beginPath();
          ctx.moveTo(headCenterX, headCenterY + 1 * s);
          ctx.lineTo(headCenterX - 2.5 * s, headCenterY + 7 * s);
          ctx.lineTo(headCenterX, headCenterY + 6 * s);
          ctx.lineTo(headCenterX + 2.5 * s, headCenterY + 7 * s);
          ctx.closePath();
          ctx.fill();

          // Nose shadow
          ctx.strokeStyle = sandDark;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(headCenterX - 2 * s, headCenterY + 7 * s);
          ctx.lineTo(headCenterX + 2 * s, headCenterY + 7 * s);
          ctx.stroke();

          // Mouth (serene smile)
          ctx.strokeStyle = sandDark;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(headCenterX - 5 * s, headCenterY + 10 * s);
          ctx.quadraticCurveTo(
            headCenterX,
            headCenterY + 12 * s,
            headCenterX + 5 * s,
            headCenterY + 10 * s
          );
          ctx.stroke();

          // Chin definition
          ctx.beginPath();
          ctx.moveTo(headCenterX - 3 * s, headCenterY + 13 * s);
          ctx.quadraticCurveTo(
            headCenterX,
            headCenterY + 15 * s,
            headCenterX + 3 * s,
            headCenterY + 13 * s
          );
          ctx.stroke();

          // ========== CEREMONIAL BEARD ==========
          ctx.fillStyle = goldDark;
          ctx.beginPath();
          ctx.moveTo(headCenterX - 2 * s, headCenterY + 15 * s);
          ctx.lineTo(headCenterX - 3 * s, headCenterY + 28 * s);
          ctx.quadraticCurveTo(
            headCenterX,
            headCenterY + 30 * s,
            headCenterX + 3 * s,
            headCenterY + 28 * s
          );
          ctx.lineTo(headCenterX + 2 * s, headCenterY + 15 * s);
          ctx.closePath();
          ctx.fill();

          // Beard stripes
          ctx.strokeStyle = sandDark;
          ctx.lineWidth = 1 * s;
          for (let i = 0; i < 4; i++) {
            const beardY = headCenterY + 18 * s + i * 3 * s;
            ctx.beginPath();
            ctx.moveTo(headCenterX - 2.5 * s, beardY);
            ctx.lineTo(headCenterX + 2.5 * s, beardY);
            ctx.stroke();
          }

          // ========== COLLAR/BROAD COLLAR ==========
          // Decorative collar at neck
          const collarY = headCenterY + 15 * s;
          ctx.fillStyle = goldAccent;
          ctx.beginPath();
          ctx.moveTo(headCenterX - 15 * s, collarY + 5 * s);
          ctx.quadraticCurveTo(
            headCenterX,
            collarY + 12 * s,
            headCenterX + 15 * s,
            collarY + 5 * s
          );
          ctx.quadraticCurveTo(
            headCenterX,
            collarY + 8 * s,
            headCenterX - 15 * s,
            collarY + 5 * s
          );
          ctx.fill();

          // Collar details
          ctx.strokeStyle = goldDark;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(headCenterX - 12 * s, collarY + 6 * s);
          ctx.quadraticCurveTo(
            headCenterX,
            collarY + 10 * s,
            headCenterX + 12 * s,
            collarY + 6 * s
          );
          ctx.stroke();

          // Gem on collar
          ctx.fillStyle = `rgba(64, 208, 255, ${mysticPulse})`;
          ctx.shadowColor = eyeGlow;
          ctx.shadowBlur = 6 * s;
          ctx.beginPath();
          ctx.arc(headCenterX, collarY + 8 * s, 2.5 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // ========== WEATHERING AND CRACKS ==========
          ctx.strokeStyle = "rgba(80, 60, 40, 0.3)";
          ctx.lineWidth = 0.5 * s;

          // Crack on face
          ctx.beginPath();
          ctx.moveTo(headCenterX + 8 * s, headCenterY + 3 * s);
          ctx.lineTo(headCenterX + 10 * s, headCenterY + 8 * s);
          ctx.lineTo(headCenterX + 9 * s, headCenterY + 12 * s);
          ctx.stroke();

          // Crack on body
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 15 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 10 * s);
          ctx.stroke();

          // ========== MYSTICAL AURA ==========
          // Subtle glow around the sphinx
          const auraGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s,
            screenPos.y - 30 * s,
            10 * s,
            screenPos.x + 5 * s,
            screenPos.y - 30 * s,
            50 * s
          );
          auraGrad.addColorStop(0, `rgba(64, 208, 255, ${mysticPulse * 0.1})`);
          auraGrad.addColorStop(
            0.5,
            `rgba(64, 208, 255, ${mysticPulse * 0.05})`
          );
          auraGrad.addColorStop(1, "rgba(64, 208, 255, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 5 * s,
            screenPos.y - 25 * s,
            50 * s,
            35 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // ========== FLOATING DUST PARTICLES ==========
          ctx.fillStyle = `rgba(212, 196, 144, 0.4)`;
          for (let i = 0; i < 6; i++) {
            const dustTime = (time * 0.3 + i * 0.8) % 3;
            const dustAngle = (i / 6) * Math.PI * 2 + time * 0.2;
            const dustDist = 35 + Math.sin(time + i * 2) * 10;
            const dustX = screenPos.x + Math.cos(dustAngle) * dustDist * s;
            const dustY =
              screenPos.y -
              20 * s +
              Math.sin(dustAngle) * dustDist * 0.4 * s -
              dustTime * 8 * s;
            const dustAlpha = 0.3 + Math.sin(time * 2 + i) * 0.15;

            ctx.fillStyle = `rgba(212, 196, 144, ${dustAlpha})`;
            ctx.beginPath();
            ctx.arc(dustX, dustY, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          break;
        }
        case "sphinx":
          const sandBase = "#C2B280";
          const sandShadow = "#A09060";
          const sandHighlight = "#D4C490";

          // Large Pedestal Base (Isometric Block)
          // Top face
          ctx.fillStyle = sandBase;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 15 * s);
          ctx.lineTo(screenPos.x + 30 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
          ctx.fill();
          // Front face (darker)
          ctx.fillStyle = sandShadow;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 15 * s);
          ctx.lineTo(screenPos.x - 30 * s, screenPos.y + 5 * s);
          ctx.fill();
          // Side face (medium)
          ctx.fillStyle = sandBase;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x + 30 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 15 * s);
          ctx.fill();

          // Body (Lion shape roughly)
          ctx.fillStyle = sandShadow; // Back haunch shadow
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 15 * s,
            screenPos.y - 15 * s,
            12 * s,
            8 * s,
            -0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = sandBase; // Main body
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
          ctx.quadraticCurveTo(
            screenPos.x,
            screenPos.y - 30 * s,
            screenPos.x + 25 * s,
            screenPos.y - 15 * s
          ); // Back to front
          ctx.lineTo(screenPos.x + 30 * s, screenPos.y - 5 * s); // Paws
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 5 * s);
          ctx.fill();

          // Head and Nemes (Headdress)
          const headY = screenPos.y - 25 * s;
          // Headdress back
          ctx.fillStyle = sandHighlight;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 15 * s, headY + 10 * s);
          ctx.lineTo(screenPos.x - 18 * s, headY - 5 * s);
          ctx.quadraticCurveTo(
            screenPos.x,
            headY - 15 * s,
            screenPos.x + 18 * s,
            headY - 5 * s
          );
          ctx.lineTo(screenPos.x + 15 * s, headY + 10 * s);
          ctx.fill();
          // Face
          ctx.fillStyle = sandBase;
          ctx.fillRect(screenPos.x - 8 * s, headY - 5 * s, 16 * s, 14 * s);
          // Stripes on headdress
          ctx.strokeStyle = sandShadow;
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 16 * s, headY - 2 * s);
          ctx.lineTo(screenPos.x - 8 * s, headY - 5 * s);
          ctx.moveTo(screenPos.x + 16 * s, headY - 2 * s);
          ctx.lineTo(screenPos.x + 8 * s, headY - 5 * s);
          ctx.stroke();
          break;
        case "oasis_pool": {
          const time = Date.now() / 1000;

          // Color palette
          const sandLight = "#E8D4A8";
          const sandMid = "#D4C090";
          const sandDark = "#B8A070";
          const sandWet = "#9A8860";
          const waterDeep = "#1565C0";
          const waterMid = "#1E88E5";
          const waterShallow = "#42A5F5";
          const waterSurface = "#64B5F6";
          const foamWhite = "#E3F2FD";

          // ========== GROUND SHADOW ==========
          const lakeShadowGrad = ctx.createRadialGradient(
            screenPos.x + 3 * s, screenPos.y + 5 * s, 0,
            screenPos.x + 3 * s, screenPos.y + 5 * s, 50 * s
          );
          lakeShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
          lakeShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
          lakeShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = lakeShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 45 * s, 20 * s, 0.05, 0, Math.PI * 2);
          ctx.fill();

          // ========== OUTER SAND BANK (BEACH) ==========
          // Gradient from dry sand to wet sand
          const sandGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y + 2 * s, 25 * s,
            screenPos.x, screenPos.y + 2 * s, 42 * s
          );
          sandGrad.addColorStop(0, sandWet);
          sandGrad.addColorStop(0.4, sandMid);
          sandGrad.addColorStop(0.8, sandLight);
          sandGrad.addColorStop(1, sandLight);

          ctx.fillStyle = sandGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 40 * s, screenPos.y - 2 * s);
          ctx.bezierCurveTo(
            screenPos.x - 25 * s, screenPos.y - 18 * s,
            screenPos.x + 15 * s, screenPos.y - 16 * s,
            screenPos.x + 38 * s, screenPos.y - 4 * s
          );
          ctx.bezierCurveTo(
            screenPos.x + 45 * s, screenPos.y + 8 * s,
            screenPos.x + 25 * s, screenPos.y + 20 * s,
            screenPos.x, screenPos.y + 18 * s
          );
          ctx.bezierCurveTo(
            screenPos.x - 30 * s, screenPos.y + 16 * s,
            screenPos.x - 45 * s, screenPos.y + 8 * s,
            screenPos.x - 40 * s, screenPos.y - 2 * s
          );
          ctx.fill();

          // Sand bank 3D edge (thickness illusion)
          ctx.fillStyle = sandDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 38 * s, screenPos.y + 2 * s);
          ctx.bezierCurveTo(
            screenPos.x - 35 * s, screenPos.y + 18 * s,
            screenPos.x + 30 * s, screenPos.y + 22 * s,
            screenPos.x + 40 * s, screenPos.y + 2 * s
          );
          ctx.lineTo(screenPos.x + 38 * s, screenPos.y - 2 * s);
          ctx.bezierCurveTo(
            screenPos.x + 28 * s, screenPos.y + 16 * s,
            screenPos.x - 32 * s, screenPos.y + 14 * s,
            screenPos.x - 38 * s, screenPos.y - 1 * s
          );
          ctx.fill();

          // Sand texture dots
          ctx.fillStyle = "rgba(180, 160, 100, 0.4)";
          for (let i = 0; i < 25; i++) {
            const sandAngle = (i / 25) * Math.PI * 2;
            const sandDist = 32 + Math.sin(i * 7.3) * 8;
            const sandX = screenPos.x + Math.cos(sandAngle) * sandDist * s * 1.1;
            const sandY = screenPos.y + 2 * s + Math.sin(sandAngle) * sandDist * 0.42 * s;
            ctx.beginPath();
            ctx.arc(sandX, sandY, (1 + Math.abs(Math.sin(i * 3.7))) * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // ========== WATER BODY ==========
          // Multi-layered water depth gradient
          const waterGrad = ctx.createRadialGradient(
            screenPos.x - 5 * s, screenPos.y - 2 * s, 0,
            screenPos.x, screenPos.y + 2 * s, 30 * s
          );
          waterGrad.addColorStop(0, waterDeep);
          waterGrad.addColorStop(0.3, waterMid);
          waterGrad.addColorStop(0.7, waterShallow);
          waterGrad.addColorStop(0.9, waterSurface);
          waterGrad.addColorStop(1, "#90CAF9");

          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 30 * s, 13 * s, 0.08, 0, Math.PI * 2);
          ctx.fill();

          // ========== UNDERWATER CAUSTICS ==========
          // Animated light patterns on the lake bed
          ctx.globalAlpha = 0.15;
          for (let c = 0; c < 8; c++) {
            const causticTime = time * 0.8 + c * 0.9;
            const causticX = screenPos.x + Math.sin(causticTime + c * 2.1) * 18 * s;
            const causticY = screenPos.y + 2 * s + Math.cos(causticTime * 0.7 + c) * 6 * s;
            const causticSize = (4 + Math.sin(causticTime * 1.5) * 2) * s;

            const causticGrad = ctx.createRadialGradient(
              causticX, causticY, 0,
              causticX, causticY, causticSize
            );
            causticGrad.addColorStop(0, "#BBDEFB");
            causticGrad.addColorStop(0.5, "rgba(144, 202, 249, 0.5)");
            causticGrad.addColorStop(1, "rgba(100, 181, 246, 0)");

            ctx.fillStyle = causticGrad;
            ctx.beginPath();
            ctx.ellipse(causticX, causticY, causticSize * 1.5, causticSize * 0.7, c * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;

          // ========== WATER SURFACE EFFECTS ==========
          // Animated ripples
          const rippleCount = 3;
          for (let r = 0; r < rippleCount; r++) {
            const ripplePhase = ((time * 0.4 + r * 1.2) % 3) / 3;
            const rippleAlpha = 0.25 * (1 - ripplePhase);
            const rippleSize = ripplePhase * 20;

            ctx.strokeStyle = `rgba(255, 255, 255, ${rippleAlpha})`;
            ctx.lineWidth = (1.5 - ripplePhase) * s;
            ctx.beginPath();
            ctx.ellipse(
              screenPos.x - 8 * s + r * 8 * s,
              screenPos.y + r * 2 * s,
              (5 + rippleSize) * s,
              (2 + rippleSize * 0.4) * s,
              0.1,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }

          // Surface shimmer/sparkles
          ctx.fillStyle = foamWhite;
          for (let sp = 0; sp < 12; sp++) {
            const sparkleTime = time * 2 + sp * 0.7;
            const sparkleAlpha = 0.3 + Math.sin(sparkleTime * 3) * 0.3;
            if (sparkleAlpha > 0.35) {
              const spAngle = sp * 0.52 + Math.sin(time * 0.5) * 0.3;
              const spDist = 8 + sp * 1.8;
              const spX = screenPos.x + Math.cos(spAngle) * spDist * s;
              const spY = screenPos.y + 2 * s + Math.sin(spAngle) * spDist * 0.4 * s;

              ctx.globalAlpha = sparkleAlpha;
              ctx.beginPath();
              ctx.arc(spX, spY, (0.8 + Math.sin(sparkleTime) * 0.3) * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.globalAlpha = 1.0;

          // ========== LILY PADS ==========
          const lilyPositions = [
            { x: -15, y: 4, rot: 0.3, size: 1 },
            { x: -10, y: -3, rot: -0.5, size: 0.8 },
            { x: 12, y: 5, rot: 0.8, size: 0.9 },
            { x: 18, y: -1, rot: -0.2, size: 0.7 },
            { x: -5, y: 7, rot: 1.2, size: 0.85 },
          ];

          lilyPositions.forEach((lily, i) => {
            const lilyX = screenPos.x + lily.x * s;
            const lilyY = screenPos.y + lily.y * s;
            const lilySway = Math.sin(time * 0.8 + i * 1.5) * 0.5 * s;
            const lilySize = 5 * lily.size * s;

            // Lily pad shadow
            ctx.fillStyle = "rgba(0, 80, 120, 0.2)";
            ctx.beginPath();
            ctx.ellipse(lilyX + lilySway + 1 * s, lilyY + 1 * s, lilySize * 1.1, lilySize * 0.5, lily.rot, 0, Math.PI * 2);
            ctx.fill();

            // Lily pad
            ctx.fillStyle = "#2E7D32";
            ctx.beginPath();
            ctx.ellipse(lilyX + lilySway, lilyY, lilySize, lilySize * 0.45, lily.rot, 0.15, Math.PI * 2 - 0.15);
            ctx.lineTo(lilyX + lilySway, lilyY);
            ctx.fill();

            // Lily pad highlight
            ctx.fillStyle = "#4CAF50";
            ctx.beginPath();
            ctx.ellipse(lilyX + lilySway - 1 * s, lilyY - 0.5 * s, lilySize * 0.5, lilySize * 0.2, lily.rot + 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Flower on some pads
            if (i % 2 === 0) {
              const flowerX = lilyX + lilySway;
              const flowerY = lilyY - 2 * s;

              // Petals
              ctx.fillStyle = i === 0 ? "#F8BBD9" : "#FFF9C4";
              for (let p = 0; p < 6; p++) {
                const petalAngle = (p / 6) * Math.PI * 2 + time * 0.2;
                const petalX = flowerX + Math.cos(petalAngle) * 2.5 * s;
                const petalY = flowerY + Math.sin(petalAngle) * 1.2 * s;
                ctx.beginPath();
                ctx.ellipse(petalX, petalY, 2 * s, 1 * s, petalAngle, 0, Math.PI * 2);
                ctx.fill();
              }

              // Flower center
              ctx.fillStyle = "#FFC107";
              ctx.beginPath();
              ctx.arc(flowerX, flowerY, 1.5 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // ========== CATTAILS/REEDS ==========
          const reedPositions = [
            { x: -28, y: 8, count: 3 },
            { x: 28, y: 6, count: 2 },
            { x: -22, y: -8, count: 2 },
            { x: 25, y: -6, count: 2 },
          ];

          reedPositions.forEach((reedGroup, gi) => {
            for (let ri = 0; ri < reedGroup.count; ri++) {
              const reedX = screenPos.x + (reedGroup.x + ri * 3) * s;
              const reedY = screenPos.y + reedGroup.y * s;
              const reedSway = Math.sin(time * 1.2 + gi + ri * 0.5) * 2 * s;
              const reedHeight = (18 + ri * 4) * s;

              // Reed stalk
              ctx.strokeStyle = "#5D4037";
              ctx.lineWidth = 1.5 * s;
              ctx.beginPath();
              ctx.moveTo(reedX, reedY);
              ctx.quadraticCurveTo(
                reedX + reedSway * 0.3, reedY - reedHeight * 0.5,
                reedX + reedSway, reedY - reedHeight
              );
              ctx.stroke();

              // Cattail head
              ctx.fillStyle = "#4E342E";
              ctx.beginPath();
              ctx.ellipse(
                reedX + reedSway * 0.85,
                reedY - reedHeight + 4 * s,
                1.8 * s,
                5 * s,
                reedSway * 0.05,
                0,
                Math.PI * 2
              );
              ctx.fill();

              // Reed leaves
              ctx.strokeStyle = "#7CB342";
              ctx.lineWidth = 2 * s;
              ctx.beginPath();
              ctx.moveTo(reedX, reedY - 2 * s);
              ctx.quadraticCurveTo(
                reedX + 6 * s + reedSway * 0.5, reedY - 8 * s,
                reedX + 10 * s + reedSway, reedY - 6 * s
              );
              ctx.stroke();
            }
          });

          // ========== EDGE FOAM/SHORE LINE ==========
          ctx.strokeStyle = "rgba(227, 242, 253, 0.5)";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 29 * s, 12.5 * s, 0.08, 0, Math.PI * 2);
          ctx.stroke();

          // Subtle animated foam at edges
          const foamAlpha = 0.3 + Math.sin(time * 2) * 0.1;
          ctx.fillStyle = `rgba(255, 255, 255, ${foamAlpha})`;
          for (let f = 0; f < 8; f++) {
            const foamAngle = (f / 8) * Math.PI * 2 + time * 0.15;
            const foamDist = 28 + Math.sin(time * 1.5 + f * 2) * 1.5;
            const foamX = screenPos.x + Math.cos(foamAngle) * foamDist * s;
            const foamY = screenPos.y + 2 * s + Math.sin(foamAngle) * foamDist * 0.43 * s;
            ctx.beginPath();
            ctx.ellipse(foamX, foamY, 2.5 * s, 1 * s, foamAngle + 0.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // ========== SMALL FISH SHADOWS ==========
          ctx.fillStyle = "rgba(0, 60, 100, 0.2)";
          for (let fish = 0; fish < 3; fish++) {
            const fishTime = time * 0.6 + fish * 2.1;
            const fishAngle = fishTime * 0.4;
            const fishDist = 10 + fish * 5;
            const fishX = screenPos.x + Math.cos(fishAngle) * fishDist * s;
            const fishY = screenPos.y + 2 * s + Math.sin(fishAngle) * fishDist * 0.35 * s;

            ctx.beginPath();
            ctx.ellipse(fishX, fishY, 2.5 * s, 1 * s, fishAngle + Math.PI / 2, 0, Math.PI * 2);
            ctx.fill();
            // Fish tail
            ctx.beginPath();
            ctx.moveTo(fishX - Math.cos(fishAngle + Math.PI / 2) * 2.5 * s, fishY - Math.sin(fishAngle + Math.PI / 2) * 1 * s);
            ctx.lineTo(fishX - Math.cos(fishAngle + Math.PI / 2) * 4 * s - Math.sin(fishAngle) * 1.5 * s, fishY - Math.sin(fishAngle + Math.PI / 2) * 1.5 * s);
            ctx.lineTo(fishX - Math.cos(fishAngle + Math.PI / 2) * 4 * s + Math.sin(fishAngle) * 1.5 * s, fishY - Math.sin(fishAngle + Math.PI / 2) * 1.5 * s);
            ctx.closePath();
            ctx.fill();
          }

          break;
        }
        // === WINTER DECORATIONS ===
        case "pine": {
          // Enhanced 3D isometric snow-covered pine tree
          const pineGreen = ["#1a4a3a", "#2a5a4a", "#3a6a5a", "#4a7a6a"];
          const pineDark = "#0a2a1a";
          const trunkColor = "#4a3728";
          const trunkDark = "#2a1708";
          const snowWhite = "#f8f9fa";
          const snowBlue = "#e3f2fd";

          // Ground shadow with gradient
          const pineShadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 10 * s, 25 * s
          );
          pineShadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
          pineShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
          pineShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = pineShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Snow mound at base
          ctx.fillStyle = snowBlue;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = snowWhite;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 2 * s, screenPos.y + 3 * s, 8 * s, 3 * s, -0.2, 0, Math.PI * 2);
          ctx.fill();

          // Trunk with 3D faces
          ctx.fillStyle = trunkDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = trunkColor;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 5 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x + 4 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();

          // Pine layers with 3D depth and snow
          const pineLayers = [
            { y: -8, w: 26, h: 20 },
            { y: -24, w: 22, h: 18 },
            { y: -38, w: 18, h: 16 },
            { y: -50, w: 12, h: 14 },
          ];

          pineLayers.forEach((layer, idx) => {
            const layerY = screenPos.y + layer.y * s;
            const layerW = layer.w * s;
            const layerH = layer.h * s;

            // Back shadow layer
            ctx.fillStyle = pineDark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW * 0.9, layerY + 2 * s);
            ctx.lineTo(screenPos.x, layerY - layerH + 2 * s);
            ctx.lineTo(screenPos.x + layerW * 0.9, layerY + 2 * s);
            ctx.closePath();
            ctx.fill();

            // Left face (darker)
            ctx.fillStyle = pineGreen[0];
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW, layerY);
            ctx.lineTo(screenPos.x, layerY - layerH);
            ctx.lineTo(screenPos.x, layerY + 5 * s);
            ctx.closePath();
            ctx.fill();

            // Right face (lighter)
            ctx.fillStyle = pineGreen[1 + idx % 2];
            ctx.beginPath();
            ctx.moveTo(screenPos.x + layerW, layerY);
            ctx.lineTo(screenPos.x, layerY - layerH);
            ctx.lineTo(screenPos.x, layerY + 5 * s);
            ctx.closePath();
            ctx.fill();

            // Snow cap on layer (gradient)
            const snowGrad = ctx.createLinearGradient(
              screenPos.x - layerW * 0.6, layerY - layerH * 0.3,
              screenPos.x + layerW * 0.3, layerY - layerH * 0.1
            );
            snowGrad.addColorStop(0, snowWhite);
            snowGrad.addColorStop(0.7, snowBlue);
            snowGrad.addColorStop(1, "rgba(227,242,253,0.5)");
            ctx.fillStyle = snowGrad;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW * 0.7, layerY - layerH * 0.2);
            ctx.quadraticCurveTo(screenPos.x - layerW * 0.3, layerY - layerH * 0.5, screenPos.x, layerY - layerH);
            ctx.quadraticCurveTo(screenPos.x + layerW * 0.3, layerY - layerH * 0.6, screenPos.x + layerW * 0.5, layerY - layerH * 0.3);
            ctx.quadraticCurveTo(screenPos.x + layerW * 0.2, layerY - layerH * 0.15, screenPos.x - layerW * 0.2, layerY - layerH * 0.1);
            ctx.closePath();
            ctx.fill();

            // Snow clumps hanging from branches
            if (idx < 3) {
              ctx.fillStyle = snowWhite;
              ctx.beginPath();
              ctx.ellipse(screenPos.x - layerW * 0.6, layerY + 2 * s, 4 * s, 2.5 * s, 0.3, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(screenPos.x + layerW * 0.5, layerY + 1 * s, 3.5 * s, 2 * s, -0.2, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Top star/point highlight
          ctx.fillStyle = snowWhite;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 62 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle effect on snow
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          const sparkles = [
            { x: -8, y: -15 }, { x: 10, y: -30 }, { x: -5, y: -45 }, { x: 6, y: -55 }
          ];
          sparkles.forEach((sp) => {
            ctx.beginPath();
            ctx.arc(screenPos.x + sp.x * s, screenPos.y + sp.y * s, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }
        case "snowman": {
          // Enhanced 3D isometric snowman with detailed features
          const snowBase = "#f5f5f5";
          const snowShade = "#e0e0e0";
          const snowHighlight = "#ffffff";
          const snowBlueShade = "#e3f2fd";

          // Ground shadow with gradient
          const snowmanShadowGrad = ctx.createRadialGradient(
            screenPos.x + 4 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s
          );
          snowmanShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
          snowmanShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
          snowmanShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = snowmanShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bottom ball with 3D shading
          const bottomGrad = ctx.createRadialGradient(
            screenPos.x - 5 * s, screenPos.y - 10 * s, 0,
            screenPos.x, screenPos.y - 5 * s, 18 * s
          );
          bottomGrad.addColorStop(0, snowHighlight);
          bottomGrad.addColorStop(0.4, snowBase);
          bottomGrad.addColorStop(0.8, snowShade);
          bottomGrad.addColorStop(1, snowBlueShade);
          ctx.fillStyle = bottomGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 5 * s, 16 * s, 0, Math.PI * 2);
          ctx.fill();

          // Bottom ball shadow curve
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 5 * s, 15 * s, 0.3, Math.PI - 0.3);
          ctx.stroke();

          // Middle ball with 3D shading
          const middleGrad = ctx.createRadialGradient(
            screenPos.x - 4 * s, screenPos.y - 26 * s, 0,
            screenPos.x, screenPos.y - 22 * s, 13 * s
          );
          middleGrad.addColorStop(0, snowHighlight);
          middleGrad.addColorStop(0.4, snowBase);
          middleGrad.addColorStop(0.85, snowShade);
          middleGrad.addColorStop(1, snowBlueShade);
          ctx.fillStyle = middleGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 22 * s, 12 * s, 0, Math.PI * 2);
          ctx.fill();

          // Buttons on middle ball
          ctx.fillStyle = "#37474f";
          for (let btn = 0; btn < 3; btn++) {
            ctx.beginPath();
            ctx.arc(screenPos.x + 2 * s, screenPos.y - 16 * s - btn * 6 * s, 1.8 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Stick arms
          ctx.strokeStyle = "#5d4037";
          ctx.lineWidth = 2.5 * s;
          // Left arm
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 22 * s);
          ctx.lineTo(screenPos.x - 22 * s, screenPos.y - 28 * s);
          ctx.stroke();
          // Left arm twigs
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 26 * s);
          ctx.lineTo(screenPos.x - 22 * s, screenPos.y - 32 * s);
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 27 * s);
          ctx.lineTo(screenPos.x - 24 * s, screenPos.y - 25 * s);
          ctx.stroke();
          // Right arm
          ctx.lineWidth = 2.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 10 * s, screenPos.y - 22 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 18 * s);
          ctx.stroke();
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 17 * s, screenPos.y - 18 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 14 * s);
          ctx.moveTo(screenPos.x + 19 * s, screenPos.y - 18 * s);
          ctx.lineTo(screenPos.x + 24 * s, screenPos.y - 20 * s);
          ctx.stroke();

          // Head with 3D shading
          const headGrad = ctx.createRadialGradient(
            screenPos.x - 3 * s, screenPos.y - 42 * s, 0,
            screenPos.x, screenPos.y - 38 * s, 10 * s
          );
          headGrad.addColorStop(0, snowHighlight);
          headGrad.addColorStop(0.4, snowBase);
          headGrad.addColorStop(0.85, snowShade);
          headGrad.addColorStop(1, snowBlueShade);
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 38 * s, 9 * s, 0, Math.PI * 2);
          ctx.fill();

          // Top hat
          ctx.fillStyle = "#1a1a1a";
          // Hat brim
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 46 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Hat top
          ctx.fillRect(screenPos.x - 6 * s, screenPos.y - 62 * s, 12 * s, 16 * s);
          // Hat rim edge
          ctx.fillStyle = "#37474f";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 62 * s, 6 * s, 2.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Hat band
          ctx.fillStyle = "#c62828";
          ctx.fillRect(screenPos.x - 6 * s, screenPos.y - 54 * s, 12 * s, 3 * s);

          // Eyes (coal)
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 40 * s, 2 * s, 2.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 3 * s, screenPos.y - 40 * s, 2 * s, 2.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Eye highlights
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.beginPath();
          ctx.arc(screenPos.x - 3.5 * s, screenPos.y - 41 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(screenPos.x + 2.5 * s, screenPos.y - 41 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();

          // Carrot nose with gradient
          const noseGrad = ctx.createLinearGradient(
            screenPos.x, screenPos.y - 38 * s, screenPos.x + 10 * s, screenPos.y - 36 * s
          );
          noseGrad.addColorStop(0, "#ff8c00");
          noseGrad.addColorStop(0.5, "#ff6b00");
          noseGrad.addColorStop(1, "#e65100");
          ctx.fillStyle = noseGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 39 * s);
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 36 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 33 * s);
          ctx.closePath();
          ctx.fill();
          // Nose highlight
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 1 * s, screenPos.y - 38 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 37 * s);
          ctx.lineTo(screenPos.x + 1 * s, screenPos.y - 36 * s);
          ctx.closePath();
          ctx.fill();

          // Smile (coal pieces)
          ctx.fillStyle = "#37474f";
          for (let i = 0; i < 5; i++) {
            const smileAngle = Math.PI * 0.15 + (i / 4) * Math.PI * 0.3;
            const smileX = screenPos.x + Math.cos(smileAngle) * 5 * s;
            const smileY = screenPos.y - 34 * s + Math.sin(smileAngle) * 3 * s;
            ctx.beginPath();
            ctx.arc(smileX, smileY, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Scarf
          ctx.fillStyle = "#c62828";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 30 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Scarf tail
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 6 * s, screenPos.y - 30 * s);
          ctx.quadraticCurveTo(screenPos.x + 12 * s, screenPos.y - 28 * s, screenPos.x + 10 * s, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 21 * s);
          ctx.quadraticCurveTo(screenPos.x + 8 * s, screenPos.y - 27 * s, screenPos.x + 4 * s, screenPos.y - 29 * s);
          ctx.closePath();
          ctx.fill();
          // Scarf stripes
          ctx.fillStyle = "#ffeb3b";
          ctx.fillRect(screenPos.x - 8 * s, screenPos.y - 31 * s, 2 * s, 3 * s);
          ctx.fillRect(screenPos.x + 6 * s, screenPos.y - 31 * s, 2 * s, 3 * s);
          break;
        }
        case "ice_crystal": {
          // Enhanced 3D isometric ice crystal formation
          const crystalLight = "#e3f2fd";
          const crystalMid = "#90caf9";
          const crystalDark = "#42a5f5";
          const crystalDeep = "#1976d2";
          const crystalGlow = "#bbdefb";

          // Ground glow/reflection
          const crystalGlowGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y + 3 * s, 0,
            screenPos.x, screenPos.y + 3 * s, 25 * s
          );
          crystalGlowGrad.addColorStop(0, "rgba(144,202,249,0.35)");
          crystalGlowGrad.addColorStop(0.5, "rgba(144,202,249,0.15)");
          crystalGlowGrad.addColorStop(1, "rgba(144,202,249,0)");
          ctx.fillStyle = crystalGlowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Ice base mound
          ctx.fillStyle = crystalGlow;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main crystal spires - 3D faceted shapes
          const spires = [
            { x: 0, y: 0, h: 35, w: 8, angle: 0 },
            { x: -8, y: 2, h: 22, w: 5, angle: -0.15 },
            { x: 10, y: 1, h: 25, w: 6, angle: 0.12 },
            { x: -4, y: 3, h: 18, w: 4, angle: -0.08 },
            { x: 6, y: 3, h: 16, w: 4, angle: 0.2 },
            { x: -12, y: 4, h: 14, w: 3, angle: -0.25 },
          ];

          // Sort by y position for proper layering (back to front)
          spires.sort((a, b) => a.y - b.y);

          spires.forEach((spire, idx) => {
            const sx = screenPos.x + spire.x * s;
            const sy = screenPos.y + spire.y * s;
            const sh = spire.h * s;
            const sw = spire.w * s;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(spire.angle);

            // Back face (darkest)
            ctx.fillStyle = crystalDeep;
            ctx.beginPath();
            ctx.moveTo(-sw * 0.3, 0);
            ctx.lineTo(0, -sh);
            ctx.lineTo(sw * 0.3, 0);
            ctx.closePath();
            ctx.fill();

            // Left face
            const leftGrad = ctx.createLinearGradient(-sw, 0, 0, -sh * 0.5);
            leftGrad.addColorStop(0, crystalDark);
            leftGrad.addColorStop(0.5, crystalMid);
            leftGrad.addColorStop(1, crystalLight);
            ctx.fillStyle = leftGrad;
            ctx.beginPath();
            ctx.moveTo(-sw, 0);
            ctx.lineTo(-sw * 0.3, -sh * 0.15);
            ctx.lineTo(0, -sh);
            ctx.lineTo(-sw * 0.3, 0);
            ctx.closePath();
            ctx.fill();

            // Right face
            const rightGrad = ctx.createLinearGradient(0, -sh, sw, 0);
            rightGrad.addColorStop(0, crystalLight);
            rightGrad.addColorStop(0.3, crystalMid);
            rightGrad.addColorStop(1, crystalDark);
            ctx.fillStyle = rightGrad;
            ctx.beginPath();
            ctx.moveTo(sw, 0);
            ctx.lineTo(sw * 0.3, -sh * 0.15);
            ctx.lineTo(0, -sh);
            ctx.lineTo(sw * 0.3, 0);
            ctx.closePath();
            ctx.fill();

            // Center highlight facet
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.beginPath();
            ctx.moveTo(0, -sh);
            ctx.lineTo(-sw * 0.2, -sh * 0.6);
            ctx.lineTo(0, -sh * 0.5);
            ctx.lineTo(sw * 0.15, -sh * 0.65);
            ctx.closePath();
            ctx.fill();

            // Edge highlight
            ctx.strokeStyle = "rgba(255,255,255,0.6)";
            ctx.lineWidth = 1 * s;
            ctx.beginPath();
            ctx.moveTo(0, -sh);
            ctx.lineTo(-sw * 0.3, -sh * 0.15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -sh);
            ctx.lineTo(sw * 0.3, -sh * 0.15);
            ctx.stroke();

            ctx.restore();
          });

          // Inner glow at center
          const centerGlow = ctx.createRadialGradient(
            screenPos.x, screenPos.y - 10 * s, 0,
            screenPos.x, screenPos.y - 10 * s, 12 * s
          );
          centerGlow.addColorStop(0, "rgba(255,255,255,0.5)");
          centerGlow.addColorStop(0.5, "rgba(144,202,249,0.3)");
          centerGlow.addColorStop(1, "rgba(144,202,249,0)");
          ctx.fillStyle = centerGlow;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 12 * s, 8 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle particles
          ctx.fillStyle = "#ffffff";
          const sparkleTime = decorTime * 2;
          for (let sp = 0; sp < 6; sp++) {
            const sparkleAngle = sp * Math.PI / 3 + sparkleTime;
            const sparkleR = 8 + Math.sin(sparkleTime + sp) * 4;
            const sparkleX = screenPos.x + Math.cos(sparkleAngle) * sparkleR * s;
            const sparkleY = screenPos.y - 15 * s + Math.sin(sparkleAngle) * sparkleR * 0.4 * s;
            const sparkleSize = 1 + Math.sin(sparkleTime * 2 + sp) * 0.5;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Frost particles floating up
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          for (let fp = 0; fp < 4; fp++) {
            const frostY = screenPos.y - ((decorTime * 20 + fp * 15) % 40) * s;
            const frostX = screenPos.x + Math.sin(decorTime + fp * 1.5) * 8 * s;
            ctx.beginPath();
            ctx.arc(frostX, frostY, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "snow_pile": {
          // Proper isometric 3D snow drift with diamond base
          const snowBaseX = screenPos.x;
          const snowBaseY = screenPos.y;
          const snowSeed = (dec.x || 0) * 7.3 + (dec.y || 0) * 13.1;

          // Isometric ratios
          const isoWidth = 35 * s;  // Half-width of diamond base
          const isoDepth = 18 * s;  // Half-depth (appears shorter due to iso angle)
          const snowHeight = 28 * s; // Peak height

          // Diamond base corners (isometric)
          const leftPt = { x: snowBaseX - isoWidth, y: snowBaseY };
          const rightPt = { x: snowBaseX + isoWidth, y: snowBaseY };
          const backPt = { x: snowBaseX, y: snowBaseY - isoDepth };
          const frontPt = { x: snowBaseX, y: snowBaseY + isoDepth };
          const peakPt = { x: snowBaseX - 5 * s, y: snowBaseY - snowHeight };

          // Soft shadow on ground (isometric ellipse)
          const shadowGrad = ctx.createRadialGradient(
            snowBaseX + 8 * s, snowBaseY + 5 * s, 0,
            snowBaseX + 8 * s, snowBaseY + 5 * s, 50 * s
          );
          shadowGrad.addColorStop(0, "rgba(70, 90, 120, 0.3)");
          shadowGrad.addColorStop(0.6, "rgba(80, 100, 130, 0.12)");
          shadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = shadowGrad;
          ctx.beginPath();
          ctx.ellipse(snowBaseX + 8 * s, snowBaseY + 5 * s, 45 * s, 22 * s, 0.1, 0, Math.PI * 2);
          ctx.fill();

          // Back face (darker, more blue - facing away from light)
          const backFaceGrad = ctx.createLinearGradient(
            backPt.x, backPt.y,
            snowBaseX, snowBaseY + isoDepth * 0.5
          );
          backFaceGrad.addColorStop(0, "#c8d5e5");
          backFaceGrad.addColorStop(0.5, "#d5e0eb");
          backFaceGrad.addColorStop(1, "#dde8f0");

          ctx.fillStyle = backFaceGrad;
          ctx.beginPath();
          ctx.moveTo(leftPt.x, leftPt.y);
          ctx.quadraticCurveTo(leftPt.x + 8 * s, leftPt.y - snowHeight * 0.6, peakPt.x - 8 * s, peakPt.y + 5 * s);
          ctx.quadraticCurveTo(backPt.x - 5 * s, backPt.y - snowHeight * 0.4, backPt.x, backPt.y);
          ctx.lineTo(leftPt.x, leftPt.y);
          ctx.closePath();
          ctx.fill();

          // Left face (medium shadow)
          const leftFaceGrad = ctx.createLinearGradient(
            leftPt.x, leftPt.y,
            frontPt.x, frontPt.y
          );
          leftFaceGrad.addColorStop(0, "#d0dce8");
          leftFaceGrad.addColorStop(0.4, "#dce6ef");
          leftFaceGrad.addColorStop(1, "#e5edf4");

          ctx.fillStyle = leftFaceGrad;
          ctx.beginPath();
          ctx.moveTo(leftPt.x, leftPt.y);
          ctx.quadraticCurveTo(leftPt.x + 8 * s, leftPt.y - snowHeight * 0.6, peakPt.x - 8 * s, peakPt.y + 5 * s);
          ctx.quadraticCurveTo(peakPt.x, peakPt.y, peakPt.x + 5 * s, peakPt.y + 8 * s);
          ctx.quadraticCurveTo(frontPt.x - 10 * s, frontPt.y - snowHeight * 0.3, frontPt.x, frontPt.y);
          ctx.lineTo(leftPt.x, leftPt.y);
          ctx.closePath();
          ctx.fill();

          // Right face (brightest - lit side)
          const rightFaceGrad = ctx.createLinearGradient(
            backPt.x, backPt.y - snowHeight,
            rightPt.x, rightPt.y
          );
          rightFaceGrad.addColorStop(0, "#ffffff");
          rightFaceGrad.addColorStop(0.2, "#fcfeff");
          rightFaceGrad.addColorStop(0.5, "#f5fafc");
          rightFaceGrad.addColorStop(1, "#eef4f8");

          ctx.fillStyle = rightFaceGrad;
          ctx.beginPath();
          ctx.moveTo(backPt.x, backPt.y);
          ctx.quadraticCurveTo(backPt.x + 5 * s, backPt.y - snowHeight * 0.5, peakPt.x + 3 * s, peakPt.y + 3 * s);
          ctx.quadraticCurveTo(rightPt.x - 10 * s, rightPt.y - snowHeight * 0.5, rightPt.x, rightPt.y);
          ctx.lineTo(backPt.x, backPt.y);
          ctx.closePath();
          ctx.fill();

          // Front face (lit, but slightly shadowed due to angle)
          const frontFaceGrad = ctx.createLinearGradient(
            peakPt.x, peakPt.y,
            frontPt.x, frontPt.y
          );
          frontFaceGrad.addColorStop(0, "#f8fbfd");
          frontFaceGrad.addColorStop(0.3, "#f2f7fa");
          frontFaceGrad.addColorStop(0.7, "#eaf1f6");
          frontFaceGrad.addColorStop(1, "#e0eaf2");

          ctx.fillStyle = frontFaceGrad;
          ctx.beginPath();
          ctx.moveTo(frontPt.x, frontPt.y);
          ctx.quadraticCurveTo(frontPt.x - 10 * s, frontPt.y - snowHeight * 0.3, peakPt.x + 5 * s, peakPt.y + 8 * s);
          ctx.quadraticCurveTo(peakPt.x + 8 * s, peakPt.y + 5 * s, peakPt.x + 12 * s, peakPt.y + 10 * s);
          ctx.quadraticCurveTo(rightPt.x - 5 * s, rightPt.y - snowHeight * 0.25, rightPt.x, rightPt.y);
          ctx.lineTo(frontPt.x, frontPt.y);
          ctx.closePath();
          ctx.fill();

          // Secondary smaller mound on top-right
          const mound2X = snowBaseX + 12 * s;
          const mound2Y = snowBaseY - 5 * s;
          const mound2Grad = ctx.createRadialGradient(
            mound2X - 3 * s, mound2Y - 8 * s, 0,
            mound2X, mound2Y, 15 * s
          );
          mound2Grad.addColorStop(0, "#ffffff");
          mound2Grad.addColorStop(0.5, "#f5f9fc");
          mound2Grad.addColorStop(1, "#e8f0f5");
          ctx.fillStyle = mound2Grad;
          ctx.beginPath();
          ctx.moveTo(mound2X - 12 * s, mound2Y + 6 * s);
          ctx.quadraticCurveTo(mound2X - 8 * s, mound2Y - 10 * s, mound2X + 2 * s, mound2Y - 12 * s);
          ctx.quadraticCurveTo(mound2X + 12 * s, mound2Y - 6 * s, mound2X + 15 * s, mound2Y + 6 * s);
          ctx.quadraticCurveTo(mound2X + 5 * s, mound2Y + 8 * s, mound2X - 5 * s, mound2Y + 7 * s);
          ctx.quadraticCurveTo(mound2X - 10 * s, mound2Y + 7 * s, mound2X - 12 * s, mound2Y + 6 * s);
          ctx.closePath();
          ctx.fill();

          // Blue shadow in crevice between mounds
          ctx.fillStyle = "rgba(150, 180, 215, 0.3)";
          ctx.beginPath();
          ctx.moveTo(snowBaseX - 5 * s, snowBaseY - 12 * s);
          ctx.quadraticCurveTo(snowBaseX + 5 * s, snowBaseY - 8 * s, snowBaseX + 10 * s, snowBaseY - 10 * s);
          ctx.quadraticCurveTo(snowBaseX + 3 * s, snowBaseY - 5 * s, snowBaseX - 5 * s, snowBaseY - 12 * s);
          ctx.fill();

          // Soft edge definition between faces
          ctx.strokeStyle = "rgba(180, 200, 220, 0.3)";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(peakPt.x, peakPt.y + 3 * s);
          ctx.quadraticCurveTo(frontPt.x - 8 * s, frontPt.y - snowHeight * 0.25, frontPt.x, frontPt.y);
          ctx.stroke();

          // Highlight ridges on top
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 2 * s;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(peakPt.x - 10 * s, peakPt.y + 12 * s);
          ctx.quadraticCurveTo(peakPt.x - 2 * s, peakPt.y - 2 * s, peakPt.x + 8 * s, peakPt.y + 8 * s);
          ctx.stroke();

          // Secondary highlight
          ctx.strokeStyle = "rgba(255,255,255,0.6)";
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(mound2X - 5 * s, mound2Y - 5 * s);
          ctx.quadraticCurveTo(mound2X + 2 * s, mound2Y - 10 * s, mound2X + 8 * s, mound2Y - 4 * s);
          ctx.stroke();

          // Snow texture bumps on surfaces
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          for (let bump = 0; bump < 10; bump++) {
            const bumpAngle = (bump / 10) * Math.PI * 2 + snowSeed;
            const bumpDist = (12 + Math.sin(snowSeed + bump * 2) * 8) * s;
            const bumpX = snowBaseX + Math.cos(bumpAngle) * bumpDist * 0.8;
            const bumpY = snowBaseY - 10 * s + Math.sin(bumpAngle) * bumpDist * 0.4;
            const bumpSize = (1.5 + Math.sin(snowSeed + bump) * 0.8) * s;
            ctx.beginPath();
            ctx.ellipse(bumpX, bumpY, bumpSize * 1.8, bumpSize * 0.7, bumpAngle * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Frost crystals scattered on surface
          ctx.fillStyle = "rgba(220, 240, 255, 0.75)";
          const crystalSpots = [
            { x: -20, y: -18 }, { x: -8, y: -24 }, { x: 5, y: -20 },
            { x: 18, y: -12 }, { x: 25, y: -8 }, { x: -15, y: -8 }
          ];
          crystalSpots.forEach((cp, idx) => {
            const cx = snowBaseX + cp.x * s;
            const cy = snowBaseY + cp.y * s;
            const crystalSize = (1.2 + Math.sin(snowSeed + idx * 1.7) * 0.4) * s;

            // 6-point frost crystal
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
              const px = cx + Math.cos(angle) * crystalSize;
              const py = cy + Math.sin(angle) * crystalSize * 0.5; // Flatten for isometric
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          });

          // Animated sparkles
          const sparkleTime = decorTime * 2.5;
          for (let sp = 0; sp < 7; sp++) {
            const sparklePhase = (sparkleTime + sp * 0.9 + Math.sin(snowSeed + sp) * 0.5) % 2;
            if (sparklePhase < 0.5) {
              const sparkleAlpha = Math.sin(sparklePhase * Math.PI / 0.5) * 0.95;
              const spAngle = (sp / 7) * Math.PI * 1.5 - Math.PI * 0.5 + snowSeed * 0.1;
              const spDist = (15 + sp * 3) * s;
              const spx = snowBaseX + Math.cos(spAngle) * spDist * 0.7;
              const spy = snowBaseY - 15 * s + Math.sin(spAngle) * spDist * 0.35;

              ctx.fillStyle = `rgba(255,255,255,${sparkleAlpha})`;
              const starSize = (1.2 + Math.sin(sparklePhase * 6) * 0.4) * s;

              // 4-point sparkle star
              ctx.beginPath();
              ctx.moveTo(spx, spy - starSize * 1.8);
              ctx.lineTo(spx + starSize * 0.25, spy - starSize * 0.25);
              ctx.lineTo(spx + starSize * 1.8, spy);
              ctx.lineTo(spx + starSize * 0.25, spy + starSize * 0.25);
              ctx.lineTo(spx, spy + starSize * 1.8);
              ctx.lineTo(spx - starSize * 0.25, spy + starSize * 0.25);
              ctx.lineTo(spx - starSize * 1.8, spy);
              ctx.lineTo(spx - starSize * 0.25, spy - starSize * 0.25);
              ctx.closePath();
              ctx.fill();

              // Bright center
              ctx.beginPath();
              ctx.arc(spx, spy, starSize * 0.35, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Floating snow particles
          ctx.fillStyle = "rgba(255,255,255,0.45)";
          for (let p = 0; p < 4; p++) {
            const particlePhase = (decorTime * 0.7 + p * 0.8 + snowSeed) % 2.5;
            const px = snowBaseX - 12 * s + p * 10 * s + Math.sin(decorTime * 1.5 + p) * 4 * s;
            const py = snowBaseY - 20 * s - particlePhase * 10 * s;
            const pSize = (0.7 + Math.sin(particlePhase + p) * 0.25) * s;
            if (particlePhase < 2) {
              ctx.globalAlpha = 0.35 * (1 - particlePhase / 2);
              ctx.beginPath();
              ctx.arc(px, py, pSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.globalAlpha = 1;

          // Rim light on the lit edge
          ctx.strokeStyle = "rgba(255, 252, 245, 0.5)";
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.moveTo(backPt.x + 5 * s, backPt.y - 3 * s);
          ctx.quadraticCurveTo(peakPt.x + 5 * s, peakPt.y + 2 * s, rightPt.x - 10 * s, rightPt.y - 8 * s);
          ctx.stroke();
          break;
        }
        case "ice_fortress":
          // Crystalline structure using faceted polygons
          const iceLight = "#B3E5FC";
          const iceMid = "#81D4FA";
          const iceDark = "#29B6F6";
          const iceShadow = "rgba(0, 96, 100, 0.4)";

          // Ground shadow blob
          ctx.fillStyle = iceShadow;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 25,
            40 * s,
            15 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Helper to draw crystal spires
          const drawSpire = (x, y, h, w) => {
            // Left face (Mid)
            ctx.fillStyle = iceMid;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - w, y - h * 0.2);
            ctx.lineTo(x, y - h);
            ctx.lineTo(x + w * 0.5, y - h * 0.8);
            ctx.fill();
            // Right face (Dark)
            ctx.fillStyle = iceDark;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y - h * 0.2);
            ctx.lineTo(x + w * 0.5, y - h * 0.8);
            ctx.fill();
            // Top face (Light)
            ctx.fillStyle = iceLight;
            ctx.beginPath();
            ctx.moveTo(x, y - h);
            ctx.lineTo(x - w, y - h * 0.2);
            ctx.lineTo(x + w * 0.5, y - h * 0.8);
            ctx.fill();
            // Edge highlight
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1 * s;
            ctx.beginPath();
            ctx.moveTo(x, y - h);
            ctx.lineTo(x, y);
            ctx.stroke();
          };

          // Draw cluster of spires back to front
          drawSpire(screenPos.x - 20 * s, screenPos.y - 5 * s, 50 * s, 15 * s);
          drawSpire(screenPos.x + 15 * s, screenPos.y - 8 * s, 45 * s, 12 * s);
          drawSpire(screenPos.x, screenPos.y, 65 * s, 20 * s); // Main spire
          drawSpire(screenPos.x - 10 * s, screenPos.y + 5 * s, 30 * s, 10 * s);
          break;

        case "ice_throne":
          // Jagged ice shards forming a chair
          ctx.fillStyle = "rgba(0, 96, 100, 0.3)"; // Shadow
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 10 * s,
            20 * s,
            8 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          const throneBase = "#4FC3F7";
          const throneHighlight = "#B3E5FC";

          // Base block
          ctx.fillStyle = throneBase;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 15 * s, screenPos.y + 2);
          ctx.lineTo(screenPos.x, screenPos.y + 7 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y + 2);
          ctx.lineTo(screenPos.x, screenPos.y - 7 * s);
          ctx.fill();
          //throneBase but darker
          ctx.fillStyle = "#29B6F6";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 15 * s, screenPos.y + 2);
          ctx.lineTo(screenPos.x, screenPos.y + 7 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 17 * s);
          ctx.lineTo(screenPos.x - 15 * s, screenPos.y + 10 * s);
          ctx.fill();
          // right side, darkest
          ctx.fillStyle = "#0288D1";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 15 * s, screenPos.y + 2);
          ctx.lineTo(screenPos.x, screenPos.y + 7 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 17 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y + 10 * s);
          ctx.fill();

          // connector
          ctx.fillStyle = "#0288D1";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y + 2 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y + 2 * s);
          ctx.fill();

          // Seat and Backrest (jagged polygons)
          ctx.fillStyle = throneHighlight;
          ctx.beginPath();
          // Seat area
          ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 5 * s);
          // Backrest rising up
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 35 * s); // Right point
          ctx.lineTo(screenPos.x, screenPos.y - 50 * s); // Top point
          ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 35 * s); // Left point
          ctx.closePath();
          ctx.fill();

          // Facet definitions
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 50 * s);
          ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 35 * s);
          ctx.stroke();
          break;

        // === VOLCANIC DECORATIONS ===
        case "lava_pool": {
          // Enhanced 3D isometric lava pool with animated molten effects
          const lavaYellow = "#ffeb3b";
          const lavaOrange = "#ff9800";
          const lavaRed = "#f44336";
          const lavaDark = "#bf360c";
          const rockDark = "#1a1210";
          const rockMid = "#2a1a10";

          // Ambient heat glow
          const heatGlow = ctx.createRadialGradient(
            screenPos.x, screenPos.y, 0,
            screenPos.x, screenPos.y, 45 * s
          );
          const heatPulse = 0.25 + Math.sin(decorTime * 2) * 0.1;
          heatGlow.addColorStop(0, `rgba(255,100,0,${heatPulse})`);
          heatGlow.addColorStop(0.4, `rgba(255,60,0,${heatPulse * 0.5})`);
          heatGlow.addColorStop(1, "rgba(255,60,0,0)");
          ctx.fillStyle = heatGlow;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 45 * s, 25 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Outer rock rim with 3D depth
          // Rock rim back
          ctx.fillStyle = rockDark;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 3 * s, 32 * s, 16 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rock rim front edge
          ctx.fillStyle = rockMid;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 32 * s, 16 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Inner dark crater
          ctx.fillStyle = "#0a0505";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 1 * s, 26 * s, 13 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Lava surface with animated gradient
          const lavaGrad = ctx.createRadialGradient(
            screenPos.x + Math.sin(decorTime * 1.5) * 5 * s,
            screenPos.y + Math.cos(decorTime * 1.2) * 2 * s,
            0,
            screenPos.x,
            screenPos.y,
            24 * s
          );
          lavaGrad.addColorStop(0, lavaYellow);
          lavaGrad.addColorStop(0.2, lavaOrange);
          lavaGrad.addColorStop(0.5, lavaRed);
          lavaGrad.addColorStop(0.8, lavaDark);
          lavaGrad.addColorStop(1, "#1a0a00");
          ctx.fillStyle = lavaGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 1 * s, 24 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cooling crust patterns (darker streaks)
          ctx.strokeStyle = "rgba(40,10,0,0.4)";
          ctx.lineWidth = 2 * s;
          for (let c = 0; c < 4; c++) {
            const crustAngle = c * Math.PI / 2 + decorTime * 0.2;
            const crustR = 8 + c * 4;
            ctx.beginPath();
            ctx.arc(
              screenPos.x + Math.cos(crustAngle + 1) * 5 * s,
              screenPos.y + Math.sin(crustAngle + 1) * 2.5 * s,
              crustR * s,
              crustAngle, crustAngle + 0.8
            );
            ctx.stroke();
          }

          // Hot spots / bright vents
          const hotSpots = [
            { x: 0, y: 0, r: 8 },
            { x: -8, y: -2, r: 5 },
            { x: 10, y: 1, r: 4 },
            { x: -4, y: 3, r: 3 },
          ];
          hotSpots.forEach((hs, idx) => {
            const hotPulse = 0.6 + Math.sin(decorTime * 3 + idx) * 0.3;
            const hotGrad = ctx.createRadialGradient(
              screenPos.x + hs.x * s, screenPos.y + hs.y * s - 1 * s, 0,
              screenPos.x + hs.x * s, screenPos.y + hs.y * s - 1 * s, hs.r * s
            );
            hotGrad.addColorStop(0, `rgba(255,255,200,${hotPulse})`);
            hotGrad.addColorStop(0.3, `rgba(255,200,50,${hotPulse * 0.8})`);
            hotGrad.addColorStop(0.7, `rgba(255,100,0,${hotPulse * 0.4})`);
            hotGrad.addColorStop(1, "rgba(255,100,0,0)");
            ctx.fillStyle = hotGrad;
            ctx.beginPath();
            ctx.ellipse(screenPos.x + hs.x * s, screenPos.y + hs.y * s - 1 * s, hs.r * s, hs.r * 0.5 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          });

          // Animated bubbles
          const bubbles = [
            { x: 5, y: -1, r: 3, speed: 2, phase: 0 },
            { x: -8, y: 1, r: 2.5, speed: 2.5, phase: 1.5 },
            { x: 12, y: 2, r: 2, speed: 1.8, phase: 3 },
            { x: -3, y: -2, r: 2, speed: 2.2, phase: 2 },
          ];
          bubbles.forEach((bub) => {
            const bubTime = (decorTime * bub.speed + bub.phase) % 2;
            const bubScale = bubTime < 1 ? bubTime : 2 - bubTime;
            const bubY = bub.y - bubTime * 3;

            if (bubScale > 0.1) {
              ctx.fillStyle = `rgba(255,200,100,${bubScale * 0.8})`;
              ctx.beginPath();
              ctx.arc(
                screenPos.x + bub.x * s,
                screenPos.y + bubY * s,
                bub.r * bubScale * s,
                0, Math.PI * 2
              );
              ctx.fill();
              // Bubble highlight
              ctx.fillStyle = `rgba(255,255,200,${bubScale * 0.5})`;
              ctx.beginPath();
              ctx.arc(
                screenPos.x + bub.x * s - bub.r * 0.3 * s,
                screenPos.y + bubY * s - bub.r * 0.3 * s,
                bub.r * bubScale * 0.4 * s,
                0, Math.PI * 2
              );
              ctx.fill();
            }
          });

          // Rising heat shimmer / smoke wisps
          ctx.fillStyle = "rgba(100,50,20,0.15)";
          for (let w = 0; w < 3; w++) {
            const wispY = screenPos.y - ((decorTime * 25 + w * 20) % 40) * s;
            const wispX = screenPos.x + Math.sin(decorTime * 2 + w) * 10 * s;
            const wispSize = 4 + (1 - ((decorTime * 25 + w * 20) % 40) / 40) * 4;
            ctx.beginPath();
            ctx.arc(wispX, wispY, wispSize * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Rock edge details
          ctx.strokeStyle = rockMid;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 30 * s, 15 * s, 0, Math.PI * 0.1, Math.PI * 0.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 30 * s, 15 * s, 0, Math.PI * 0.7, Math.PI * 0.9);
          ctx.stroke();
          break;
        }
        case "obsidian_spike": {
          // Enhanced 3D isometric obsidian crystal spike
          const spikeBaseX = screenPos.x;
          const spikeBaseY = screenPos.y;

          // Lava glow beneath
          const lavaGlow = ctx.createRadialGradient(
            spikeBaseX, spikeBaseY + 3 * s, 0,
            spikeBaseX, spikeBaseY + 3 * s, 15 * s
          );
          lavaGlow.addColorStop(0, "rgba(255,80,0,0.4)");
          lavaGlow.addColorStop(0.5, "rgba(255,40,0,0.2)");
          lavaGlow.addColorStop(1, "transparent");
          ctx.fillStyle = lavaGlow;
          ctx.beginPath();
          ctx.ellipse(spikeBaseX, spikeBaseY + 3 * s, 15 * s, 8 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.beginPath();
          ctx.ellipse(spikeBaseX + 4 * s, spikeBaseY + 6 * s, 14 * s, 7 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main spike - faceted crystal look
          // Back face (darkest)
          ctx.fillStyle = "#0a0a15";
          ctx.beginPath();
          ctx.moveTo(spikeBaseX - 8 * s, spikeBaseY + 3 * s);
          ctx.lineTo(spikeBaseX - 3 * s, spikeBaseY - 40 * s);
          ctx.lineTo(spikeBaseX + 2 * s, spikeBaseY + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Right face (mid-dark)
          ctx.fillStyle = "#15152a";
          ctx.beginPath();
          ctx.moveTo(spikeBaseX + 2 * s, spikeBaseY + 3 * s);
          ctx.lineTo(spikeBaseX - 3 * s, spikeBaseY - 40 * s);
          ctx.lineTo(spikeBaseX + 10 * s, spikeBaseY + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Sharp glossy highlight facet
          ctx.fillStyle = "rgba(140,140,180,0.5)";
          ctx.beginPath();
          ctx.moveTo(spikeBaseX - 4 * s, spikeBaseY + 3 * s);
          ctx.lineTo(spikeBaseX - 3 * s, spikeBaseY - 40 * s);
          ctx.lineTo(spikeBaseX + 1 * s, spikeBaseY - 25 * s);
          ctx.lineTo(spikeBaseX - 1 * s, spikeBaseY + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Secondary smaller spike
          ctx.fillStyle = "#0a0a15";
          ctx.beginPath();
          ctx.moveTo(spikeBaseX + 5 * s, spikeBaseY + 3 * s);
          ctx.lineTo(spikeBaseX + 8 * s, spikeBaseY - 18 * s);
          ctx.lineTo(spikeBaseX + 12 * s, spikeBaseY + 3 * s);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "rgba(120,120,160,0.4)";
          ctx.beginPath();
          ctx.moveTo(spikeBaseX + 6 * s, spikeBaseY + 3 * s);
          ctx.lineTo(spikeBaseX + 8 * s, spikeBaseY - 18 * s);
          ctx.lineTo(spikeBaseX + 9 * s, spikeBaseY - 10 * s);
          ctx.lineTo(spikeBaseX + 8 * s, spikeBaseY + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Lava cracks with glow
          ctx.strokeStyle = "#ff4400";
          ctx.lineWidth = 1.5 * s;
          ctx.shadowColor = "#ff6600";
          ctx.shadowBlur = 5 * s;
          ctx.beginPath();
          ctx.moveTo(spikeBaseX - 2 * s, spikeBaseY + 2 * s);
          ctx.lineTo(spikeBaseX - 1 * s, spikeBaseY - 8 * s);
          ctx.lineTo(spikeBaseX + 1 * s, spikeBaseY - 5 * s);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Tip glint
          ctx.fillStyle = "rgba(200,200,255,0.6)";
          ctx.beginPath();
          ctx.arc(spikeBaseX - 3 * s, spikeBaseY - 39 * s, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "charred_tree": {
          // Enhanced 3D isometric burnt tree with glowing embers
          const charBlack = "#0a0a0a";
          const charDark = "#1a1a1a";
          const charMid = "#2a2a2a";
          const charLight = "#3a3a3a";
          const emberOrange = "#ff6600";
          const emberYellow = "#ffaa00";
          const emberRed = "#ff3300";

          // Ground shadow
          const charShadowGrad = ctx.createRadialGradient(
            screenPos.x + 4 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s
          );
          charShadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
          charShadowGrad.addColorStop(0.6, "rgba(0,0,0,0.15)");
          charShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = charShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s, 11 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Ash pile at base
          ctx.fillStyle = charMid;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = charLight;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 2 * s, screenPos.y + 3 * s, 6 * s, 2.5 * s, -0.2, 0, Math.PI * 2);
          ctx.fill();

          // Burnt trunk - left face (darker)
          ctx.fillStyle = charBlack;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 32 * s);
          ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 38 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();

          // Burnt trunk - right face (slightly lighter)
          const trunkGrad = ctx.createLinearGradient(
            screenPos.x, screenPos.y - 20 * s, screenPos.x + 8 * s, screenPos.y - 10 * s
          );
          trunkGrad.addColorStop(0, charDark);
          trunkGrad.addColorStop(0.5, charMid);
          trunkGrad.addColorStop(1, charDark);
          ctx.fillStyle = trunkGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 7 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 36 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();

          // Jagged broken top
          ctx.fillStyle = charDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 4 * s, screenPos.y - 38 * s);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 42 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 36 * s);
          ctx.closePath();
          ctx.fill();

          // Broken branches with charred texture
          ctx.strokeStyle = charDark;
          ctx.lineWidth = 4 * s;
          ctx.lineCap = "round";
          // Left branch
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 2 * s, screenPos.y - 22 * s);
          ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 30 * s);
          ctx.stroke();
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 12 * s, screenPos.y - 27 * s);
          ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 35 * s);
          ctx.stroke();

          // Right branch
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 18 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 22 * s);
          ctx.stroke();

          // Upper branch
          ctx.lineWidth = 2.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 38 * s);
          ctx.stroke();

          // Crack lines on trunk
          ctx.strokeStyle = charMid;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 3 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 18 * s);
          ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 28 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 2 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 22 * s);
          ctx.stroke();

          // Glowing embers with pulsing effect
          const embers = [
            { x: -3, y: -26, r: 2.5, speed: 3, phase: 0 },
            { x: 4, y: -20, r: 2, speed: 2.5, phase: 1 },
            { x: -1, y: -15, r: 1.8, speed: 3.5, phase: 2 },
            { x: -14, y: -32, r: 1.5, speed: 2.8, phase: 0.5 },
            { x: 10, y: -23, r: 1.5, speed: 3.2, phase: 1.5 },
            { x: -8, y: -36, r: 1.2, speed: 2.2, phase: 2.5 },
          ];

          embers.forEach((ember) => {
            const emberPulse = 0.4 + Math.sin(decorTime * ember.speed + ember.phase) * 0.4;

            // Ember glow
            const emberGlow = ctx.createRadialGradient(
              screenPos.x + ember.x * s, screenPos.y + ember.y * s, 0,
              screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * 3 * s
            );
            emberGlow.addColorStop(0, `rgba(255,150,50,${emberPulse * 0.6})`);
            emberGlow.addColorStop(0.5, `rgba(255,80,0,${emberPulse * 0.3})`);
            emberGlow.addColorStop(1, "rgba(255,50,0,0)");
            ctx.fillStyle = emberGlow;
            ctx.beginPath();
            ctx.arc(screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * 3 * s, 0, Math.PI * 2);
            ctx.fill();

            // Ember core
            const coreGrad = ctx.createRadialGradient(
              screenPos.x + ember.x * s, screenPos.y + ember.y * s, 0,
              screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * s
            );
            coreGrad.addColorStop(0, emberPulse > 0.6 ? emberYellow : emberOrange);
            coreGrad.addColorStop(0.5, emberOrange);
            coreGrad.addColorStop(1, emberRed);
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(screenPos.x + ember.x * s, screenPos.y + ember.y * s, ember.r * s, 0, Math.PI * 2);
            ctx.fill();
          });

          // Smoke wisps rising
          ctx.fillStyle = "rgba(60,60,60,0.2)";
          for (let sm = 0; sm < 4; sm++) {
            const smokeTime = (decorTime * 15 + sm * 12) % 35;
            const smokeY = screenPos.y - 35 * s - smokeTime * s;
            const smokeX = screenPos.x + Math.sin(decorTime * 1.5 + sm) * 5 * s;
            const smokeSize = 2 + smokeTime * 0.15;
            const smokeAlpha = Math.max(0, 0.25 - smokeTime * 0.007);
            ctx.fillStyle = `rgba(50,50,50,${smokeAlpha})`;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeSize * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Floating ash particles
          ctx.fillStyle = "rgba(80,80,80,0.4)";
          for (let ash = 0; ash < 5; ash++) {
            const ashTime = (decorTime * 8 + ash * 15) % 50;
            const ashY = screenPos.y + 5 * s - ashTime * s;
            const ashX = screenPos.x + Math.sin(decorTime * 0.8 + ash * 2) * 15 * s;
            ctx.beginPath();
            ctx.arc(ashX, ashY, 0.8 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "ember": {
          // Enhanced animated floating ember with glow and particles
          const emberBaseX = screenPos.x;
          const emberBaseY = screenPos.y;
          const emberFloat = Math.sin(decorTime * 2 + variant * 1.5) * 5 * s;
          const emberPulse = 0.7 + Math.sin(decorTime * 4 + variant) * 0.3;

          // Outer glow
          const emberGlow = ctx.createRadialGradient(
            emberBaseX, emberBaseY + emberFloat, 0,
            emberBaseX, emberBaseY + emberFloat, 12 * s
          );
          emberGlow.addColorStop(0, `rgba(255,150,0,${0.4 * emberPulse})`);
          emberGlow.addColorStop(0.5, `rgba(255,80,0,${0.2 * emberPulse})`);
          emberGlow.addColorStop(1, "transparent");
          ctx.fillStyle = emberGlow;
          ctx.beginPath();
          ctx.arc(emberBaseX, emberBaseY + emberFloat, 12 * s, 0, Math.PI * 2);
          ctx.fill();

          // Main ember body
          ctx.fillStyle = `rgba(255,${80 + Math.sin(decorTime * 5 + variant) * 40},0,${0.8 * emberPulse})`;
          ctx.beginPath();
          ctx.arc(emberBaseX, emberBaseY + emberFloat, 5 * s, 0, Math.PI * 2);
          ctx.fill();

          // Hot core
          ctx.fillStyle = `rgba(255,${180 + Math.sin(decorTime * 6) * 50},${50 + Math.sin(decorTime * 4) * 30},${emberPulse})`;
          ctx.beginPath();
          ctx.arc(emberBaseX, emberBaseY + emberFloat, 3 * s, 0, Math.PI * 2);
          ctx.fill();

          // White-hot center
          ctx.fillStyle = `rgba(255,255,200,${0.8 * emberPulse})`;
          ctx.beginPath();
          ctx.arc(emberBaseX, emberBaseY + emberFloat, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();

          // Trailing sparks
          for (let sp = 0; sp < 3; sp++) {
            const sparkTime = (decorTime * 3 + sp * 0.5 + variant) % 1;
            const sparkX = emberBaseX + Math.sin(sp * 2 + decorTime) * 3 * s;
            const sparkY = emberBaseY + emberFloat + sparkTime * 15 * s;
            const sparkAlpha = (1 - sparkTime) * 0.8;

            ctx.fillStyle = `rgba(255,${150 + sp * 30},0,${sparkAlpha})`;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, (1 - sparkTime) * 2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "obsidian_castle": {
          // Ornate dark volcanic glass fortress with full detail
          const ox = screenPos.x;
          const oy = screenPos.y;
          const obsDark = "#0D0D0D";
          const obsMid = "#1A1A1A";
          const obsLight = "#2D2D2D";
          const obsHighlight = "#4A4A4A";
          const lavaGlow = "#FF3D00";
          const lavaCore = "#FFAB00";
          const tanA = Math.tan(Math.PI / 6);

          // Ground shadow with lava glow
          const groundGlow = ctx.createRadialGradient(ox, oy + 5 * s, 0, ox, oy + 5 * s, 50 * s);
          groundGlow.addColorStop(0, "rgba(255, 61, 0, 0.25)");
          groundGlow.addColorStop(0.5, "rgba(0,0,0,0.45)");
          groundGlow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = groundGlow;
          ctx.beginPath();
          ctx.ellipse(ox, oy + 5 * s, 50 * s, 25 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Stone foundation with carved details
          const foundH = 10 * s;
          ctx.fillStyle = "#0a0a0a";
          ctx.beginPath();
          ctx.moveTo(ox, oy + 5 * s);
          ctx.lineTo(ox - 35 * s, oy + 5 * s - 17 * s * tanA);
          ctx.lineTo(ox - 35 * s, oy + 5 * s - 17 * s * tanA - foundH);
          ctx.lineTo(ox, oy + 5 * s - foundH);
          ctx.fill();
          ctx.fillStyle = "#151515";
          ctx.beginPath();
          ctx.moveTo(ox, oy + 5 * s);
          ctx.lineTo(ox + 35 * s, oy + 5 * s - 17 * s * tanA);
          ctx.lineTo(ox + 35 * s, oy + 5 * s - 17 * s * tanA - foundH);
          ctx.lineTo(ox, oy + 5 * s - foundH);
          ctx.fill();

          // Foundation carved runes (glowing)
          ctx.strokeStyle = "rgba(255, 61, 0, 0.3)";
          ctx.lineWidth = 1 * s;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(ox - 28 * s + i * 12 * s, oy - foundH * 0.3);
            ctx.lineTo(ox - 24 * s + i * 12 * s, oy - foundH * 0.7);
            ctx.stroke();
          }

          // Back tower (drawn first - behind)
          const backTowerX = ox;
          const backTowerY = oy - 18 * s;
          const backTowerW = 14 * s;
          const backTowerH = 60 * s;

          ctx.fillStyle = obsDark;
          ctx.beginPath();
          ctx.moveTo(backTowerX - backTowerW, backTowerY - backTowerW * tanA);
          ctx.lineTo(backTowerX - backTowerW, backTowerY - backTowerW * tanA - backTowerH);
          ctx.lineTo(backTowerX, backTowerY - backTowerH);
          ctx.lineTo(backTowerX, backTowerY);
          ctx.fill();

          ctx.fillStyle = obsMid;
          ctx.beginPath();
          ctx.moveTo(backTowerX + backTowerW, backTowerY - backTowerW * tanA);
          ctx.lineTo(backTowerX + backTowerW, backTowerY - backTowerW * tanA - backTowerH);
          ctx.lineTo(backTowerX, backTowerY - backTowerH);
          ctx.lineTo(backTowerX, backTowerY);
          ctx.fill();

          // Back tower spire
          ctx.fillStyle = obsMid;
          ctx.beginPath();
          ctx.moveTo(backTowerX - backTowerW, backTowerY - backTowerW * tanA - backTowerH);
          ctx.lineTo(backTowerX, backTowerY - backTowerH - 25 * s);
          ctx.lineTo(backTowerX + backTowerW, backTowerY - backTowerW * tanA - backTowerH);
          ctx.lineTo(backTowerX, backTowerY - backTowerH);
          ctx.closePath();
          ctx.fill();

          // Main central tower
          const mainW = 20 * s;
          const mainH = 55 * s;
          const mainY = oy - 5 * s;

          // Left face gradient
          const leftGrad = ctx.createLinearGradient(ox - mainW, mainY, ox, mainY);
          leftGrad.addColorStop(0, obsDark);
          leftGrad.addColorStop(1, obsMid);
          ctx.fillStyle = leftGrad;
          ctx.beginPath();
          ctx.moveTo(ox, mainY);
          ctx.lineTo(ox - mainW, mainY - mainW * tanA);
          ctx.lineTo(ox - mainW, mainY - mainW * tanA - mainH);
          ctx.lineTo(ox, mainY - mainH);
          ctx.fill();

          // Right face gradient
          const rightGrad = ctx.createLinearGradient(ox, mainY, ox + mainW, mainY);
          rightGrad.addColorStop(0, obsMid);
          rightGrad.addColorStop(1, obsLight);
          ctx.fillStyle = rightGrad;
          ctx.beginPath();
          ctx.moveTo(ox, mainY);
          ctx.lineTo(ox + mainW, mainY - mainW * tanA);
          ctx.lineTo(ox + mainW, mainY - mainW * tanA - mainH);
          ctx.lineTo(ox, mainY - mainH);
          ctx.fill();

          // Stone block lines
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 0.5 * s;
          for (let row = 1; row < 7; row++) {
            const rowY = mainY - mainH * (row / 7);
            ctx.beginPath();
            ctx.moveTo(ox - mainW, rowY - mainW * tanA);
            ctx.lineTo(ox, rowY);
            ctx.lineTo(ox + mainW, rowY - mainW * tanA);
            ctx.stroke();
          }

          // Jagged battlements with more detail
          ctx.fillStyle = obsMid;
          ctx.beginPath();
          ctx.moveTo(ox - mainW, mainY - mainW * tanA - mainH);
          ctx.lineTo(ox - mainW + 6 * s, mainY - mainW * tanA - mainH - 14 * s);
          ctx.lineTo(ox - mainW + 12 * s, mainY - mainW * tanA - mainH);
          ctx.lineTo(ox - 5 * s, mainY - mainH - 10 * s);
          ctx.lineTo(ox, mainY - mainH - 22 * s);
          ctx.lineTo(ox + 5 * s, mainY - mainH - 10 * s);
          ctx.lineTo(ox + mainW - 12 * s, mainY - mainW * tanA - mainH);
          ctx.lineTo(ox + mainW - 6 * s, mainY - mainW * tanA - mainH - 14 * s);
          ctx.lineTo(ox + mainW, mainY - mainW * tanA - mainH);
          ctx.lineTo(ox, mainY - mainH);
          ctx.closePath();
          ctx.fill();

          // Side turrets
          const turretW = 10 * s;
          const turretH = 40 * s;
          const turretPositions = [
            { x: ox - 26 * s, y: oy + 2 * s },
            { x: ox + 26 * s, y: oy + 2 * s },
          ];

          turretPositions.forEach((tp, idx) => {
            ctx.fillStyle = idx === 0 ? obsDark : obsMid;
            ctx.beginPath();
            ctx.moveTo(tp.x - turretW, tp.y - turretW * tanA);
            ctx.lineTo(tp.x - turretW, tp.y - turretW * tanA - turretH);
            ctx.lineTo(tp.x, tp.y - turretH);
            ctx.lineTo(tp.x, tp.y);
            ctx.fill();

            ctx.fillStyle = idx === 0 ? obsMid : obsLight;
            ctx.beginPath();
            ctx.moveTo(tp.x + turretW, tp.y - turretW * tanA);
            ctx.lineTo(tp.x + turretW, tp.y - turretW * tanA - turretH);
            ctx.lineTo(tp.x, tp.y - turretH);
            ctx.lineTo(tp.x, tp.y);
            ctx.fill();

            // Turret pointed roof
            ctx.fillStyle = obsMid;
            ctx.beginPath();
            ctx.moveTo(tp.x - turretW - 2 * s, tp.y - turretW * tanA - turretH + 2 * s);
            ctx.lineTo(tp.x, tp.y - turretH - 18 * s);
            ctx.lineTo(tp.x + turretW + 2 * s, tp.y - turretW * tanA - turretH + 2 * s);
            ctx.lineTo(tp.x, tp.y - turretH);
            ctx.closePath();
            ctx.fill();

            // Turret window (glowing)
            ctx.shadowColor = lavaGlow;
            ctx.shadowBlur = 10 * s;
            ctx.fillStyle = lavaGlow;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y - turretH * 0.5, 3.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Lava cracks on main tower
          ctx.shadowColor = lavaGlow;
          ctx.shadowBlur = 12 * s;
          ctx.strokeStyle = lavaGlow;
          ctx.lineWidth = 2.5 * s;

          ctx.beginPath();
          ctx.moveTo(ox - mainW + 5 * s, mainY - mainW * tanA - 12 * s);
          ctx.lineTo(ox - mainW + 9 * s, mainY - mainW * tanA - 24 * s);
          ctx.lineTo(ox - mainW + 6 * s, mainY - mainW * tanA - 34 * s);
          ctx.lineTo(ox - mainW + 11 * s, mainY - mainW * tanA - 44 * s);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(ox + mainW - 5 * s, mainY - mainW * tanA - 10 * s);
          ctx.lineTo(ox + mainW - 8 * s, mainY - mainW * tanA - 22 * s);
          ctx.lineTo(ox + mainW - 6 * s, mainY - mainW * tanA - 36 * s);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Main gate
          ctx.fillStyle = "#050505";
          ctx.beginPath();
          ctx.moveTo(ox - 7 * s, mainY);
          ctx.lineTo(ox - 7 * s, mainY - 16 * s);
          ctx.quadraticCurveTo(ox, mainY - 24 * s, ox + 7 * s, mainY - 16 * s);
          ctx.lineTo(ox + 7 * s, mainY);
          ctx.fill();

          // Gate inner glow
          ctx.shadowColor = lavaCore;
          ctx.shadowBlur = 18 * s;
          ctx.fillStyle = lavaCore;
          ctx.beginPath();
          ctx.arc(ox, mainY - 10 * s, 4 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Decorative skulls on gate pillars
          ctx.fillStyle = "#3D3D3D";
          [-8 * s, 8 * s].forEach((xOff) => {
            ctx.beginPath();
            ctx.arc(ox + xOff, mainY - 20 * s, 3.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = lavaGlow;
            ctx.beginPath();
            ctx.arc(ox + xOff - 1.2 * s, mainY - 20.5 * s, 0.9 * s, 0, Math.PI * 2);
            ctx.arc(ox + xOff + 1.2 * s, mainY - 20.5 * s, 0.9 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#3D3D3D";
          });

          // Edge highlights
          ctx.strokeStyle = obsHighlight;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(ox, mainY);
          ctx.lineTo(ox, mainY - mainH);
          ctx.moveTo(ox - mainW, mainY - mainW * tanA - mainH);
          ctx.lineTo(ox, mainY - mainH - 22 * s);
          ctx.lineTo(ox + mainW, mainY - mainW * tanA - mainH);
          ctx.stroke();

          // Ambient lava particles
          const time = Date.now() / 1000;
          for (let p = 0; p < 5; p++) {
            const pTime = time + p * 0.6;
            const pLife = (pTime * 0.4) % 1;
            const px = ox + Math.sin(pTime * 2 + p) * 10 * s;
            const py = mainY - 12 * s - pLife * 55 * s;
            const pAlpha = Math.sin(pLife * Math.PI) * 0.85;
            ctx.fillStyle = `rgba(255, 100, 0, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, (1.8 - pLife) * s, 0, Math.PI * 2);
            ctx.fill();
          }

          break;
        }

        case "dark_barracks": {
          // Simpler dark volcanic structure (previous obsidian_castle)
          const obsDarkB = "#1A1A1A";
          const obsMidB = "#333333";
          const obsLightB = "#555555";
          const lavaGlowB = "#FF3D00";

          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 35 * s, 15 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = obsDarkB;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
          ctx.fill();

          ctx.fillStyle = obsMidB;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
          ctx.fill();

          ctx.fillStyle = obsLightB;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 60 * s);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
          ctx.fill();

          ctx.fillStyle = obsMidB;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 60 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 65 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x + 23 * s, screenPos.y - 60 * s);
          ctx.lineTo(screenPos.x + 23 * s, screenPos.y - 50 * s);
          ctx.fill();

          ctx.shadowColor = lavaGlowB;
          ctx.shadowBlur = 15 * s;
          ctx.fillStyle = lavaGlowB;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.strokeStyle = obsLightB;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 45 * s);
          ctx.stroke();
          break;
        }

        case "dark_throne": {
          // Ornate evil throne with detailed craftsmanship
          const tx = screenPos.x;
          const ty = screenPos.y;
          const metalDark = "#1a1a1a";
          const metalMid = "#2D2D2D";
          const metalLight = "#404040";
          const metalHighlight = "#606060";
          const velvetDark = "#4A0A1A";
          const velvetMid = "#6B1020";
          const velvetLight = "#8B1530";
          const goldAccent = "#8B7355";
          const goldLight = "#A08060";
          const evilGlow = "#6B0000";

          // Ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.ellipse(tx, ty + 5 * s, 30 * s, 14 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Stone base platform
          const baseH = 8 * s;
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.moveTo(tx - 22 * s, ty + 2 * s);
          ctx.lineTo(tx + 22 * s, ty + 2 * s);
          ctx.lineTo(tx + 26 * s, ty - 2 * s);
          ctx.lineTo(tx + 26 * s, ty - 2 * s - baseH);
          ctx.lineTo(tx - 26 * s, ty - 2 * s - baseH);
          ctx.lineTo(tx - 26 * s, ty - 2 * s);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#252525";
          ctx.fillRect(tx - 24 * s, ty - 2 * s, 48 * s, 4 * s);
          ctx.fillStyle = "#2D2D2D";
          ctx.fillRect(tx - 22 * s, ty - 6 * s, 44 * s, 4 * s);

          // Main throne back
          const backGrad = ctx.createLinearGradient(tx - 20 * s, ty - 65 * s, tx + 20 * s, ty - 65 * s);
          backGrad.addColorStop(0, metalDark);
          backGrad.addColorStop(0.3, metalMid);
          backGrad.addColorStop(0.5, metalLight);
          backGrad.addColorStop(0.7, metalMid);
          backGrad.addColorStop(1, metalDark);
          ctx.fillStyle = backGrad;
          ctx.beginPath();
          ctx.moveTo(tx - 20 * s, ty - 14 * s);
          ctx.lineTo(tx - 24 * s, ty - 38 * s);
          ctx.lineTo(tx - 20 * s, ty - 55 * s);
          ctx.lineTo(tx - 14 * s, ty - 64 * s);
          ctx.lineTo(tx - 8 * s, ty - 58 * s);
          ctx.lineTo(tx, ty - 78 * s);
          ctx.lineTo(tx + 8 * s, ty - 58 * s);
          ctx.lineTo(tx + 14 * s, ty - 64 * s);
          ctx.lineTo(tx + 20 * s, ty - 55 * s);
          ctx.lineTo(tx + 24 * s, ty - 38 * s);
          ctx.lineTo(tx + 20 * s, ty - 14 * s);
          ctx.closePath();
          ctx.fill();

          // Inner velvet panel
          const velvetGrad = ctx.createLinearGradient(tx, ty - 55 * s, tx, ty - 16 * s);
          velvetGrad.addColorStop(0, velvetDark);
          velvetGrad.addColorStop(0.5, velvetMid);
          velvetGrad.addColorStop(1, velvetDark);
          ctx.fillStyle = velvetGrad;
          ctx.beginPath();
          ctx.moveTo(tx - 16 * s, ty - 16 * s);
          ctx.lineTo(tx - 18 * s, ty - 35 * s);
          ctx.lineTo(tx - 14 * s, ty - 50 * s);
          ctx.lineTo(tx - 8 * s, ty - 54 * s);
          ctx.lineTo(tx, ty - 62 * s);
          ctx.lineTo(tx + 8 * s, ty - 54 * s);
          ctx.lineTo(tx + 14 * s, ty - 50 * s);
          ctx.lineTo(tx + 18 * s, ty - 35 * s);
          ctx.lineTo(tx + 16 * s, ty - 16 * s);
          ctx.closePath();
          ctx.fill();

          // Skull at center top
          ctx.fillStyle = "#4A4A4A";
          ctx.beginPath();
          ctx.arc(tx, ty - 64 * s, 6 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = evilGlow;
          ctx.shadowBlur = 10 * s;
          ctx.fillStyle = "#8B0000";
          ctx.beginPath();
          ctx.arc(tx - 2 * s, ty - 65 * s, 1.5 * s, 0, Math.PI * 2);
          ctx.arc(tx + 2 * s, ty - 65 * s, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#3D3D3D";
          ctx.beginPath();
          ctx.moveTo(tx - 3.5 * s, ty - 60 * s);
          ctx.lineTo(tx, ty - 58 * s);
          ctx.lineTo(tx + 3.5 * s, ty - 60 * s);
          ctx.fill();

          // Bat wing decorations
          [-1, 1].forEach((side) => {
            ctx.fillStyle = metalMid;
            ctx.beginPath();
            ctx.moveTo(tx + side * 20 * s, ty - 38 * s);
            ctx.quadraticCurveTo(tx + side * 32 * s, ty - 50 * s, tx + side * 28 * s, ty - 62 * s);
            ctx.lineTo(tx + side * 25 * s, ty - 54 * s);
            ctx.quadraticCurveTo(tx + side * 30 * s, ty - 44 * s, tx + side * 25 * s, ty - 38 * s);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = metalHighlight;
            ctx.lineWidth = 1 * s;
            ctx.beginPath();
            ctx.moveTo(tx + side * 20 * s, ty - 38 * s);
            ctx.quadraticCurveTo(tx + side * 28 * s, ty - 46 * s, tx + side * 26 * s, ty - 56 * s);
            ctx.stroke();
          });

          // Armrests with dragon heads
          [-1, 1].forEach((side) => {
            ctx.fillStyle = metalDark;
            ctx.beginPath();
            ctx.moveTo(tx + side * 16 * s, ty - 14 * s);
            ctx.lineTo(tx + side * 20 * s, ty - 17 * s);
            ctx.lineTo(tx + side * 24 * s, ty - 20 * s);
            ctx.lineTo(tx + side * 24 * s, ty - 24 * s);
            ctx.lineTo(tx + side * 16 * s, ty - 20 * s);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = metalMid;
            ctx.beginPath();
            ctx.moveTo(tx + side * 16 * s, ty - 20 * s);
            ctx.lineTo(tx + side * 24 * s, ty - 24 * s);
            ctx.lineTo(tx + side * 26 * s, ty - 22 * s);
            ctx.lineTo(tx + side * 18 * s, ty - 18 * s);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = metalLight;
            ctx.beginPath();
            ctx.arc(tx + side * 25 * s, ty - 23 * s, 3.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#8B0000";
            ctx.beginPath();
            ctx.arc(tx + side * 24 * s, ty - 24 * s, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          });

          // Seat cushion
          const seatGrad = ctx.createLinearGradient(tx, ty - 16 * s, tx, ty - 6 * s);
          seatGrad.addColorStop(0, velvetLight);
          seatGrad.addColorStop(0.3, velvetMid);
          seatGrad.addColorStop(1, velvetDark);
          ctx.fillStyle = seatGrad;
          ctx.beginPath();
          ctx.moveTo(tx - 15 * s, ty - 6 * s);
          ctx.lineTo(tx - 16 * s, ty - 16 * s);
          ctx.lineTo(tx + 16 * s, ty - 16 * s);
          ctx.lineTo(tx + 15 * s, ty - 6 * s);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = velvetMid;
          ctx.beginPath();
          ctx.moveTo(tx - 16 * s, ty - 16 * s);
          ctx.lineTo(tx - 14 * s, ty - 20 * s);
          ctx.lineTo(tx + 14 * s, ty - 20 * s);
          ctx.lineTo(tx + 16 * s, ty - 16 * s);
          ctx.closePath();
          ctx.fill();

          // Tufting buttons
          ctx.fillStyle = goldAccent;
          for (let row = 0; row < 2; row++) {
            for (let col = -1; col <= 1; col++) {
              ctx.beginPath();
              ctx.arc(tx + col * 7 * s, ty - 18 * s + row * 5 * s, 1.2 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Gold trim
          ctx.strokeStyle = goldLight;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(tx - 16 * s, ty - 16 * s);
          ctx.lineTo(tx + 16 * s, ty - 16 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tx - 16 * s, ty - 16 * s);
          ctx.lineTo(tx - 18 * s, ty - 35 * s);
          ctx.lineTo(tx - 14 * s, ty - 50 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tx + 16 * s, ty - 16 * s);
          ctx.lineTo(tx + 18 * s, ty - 35 * s);
          ctx.lineTo(tx + 14 * s, ty - 50 * s);
          ctx.stroke();

          // Decorative spikes
          ctx.fillStyle = metalLight;
          [-14, -8, 8, 14].forEach((xOff) => {
            const spikeH = Math.abs(xOff) === 14 ? 10 * s : 7 * s;
            const baseY = Math.abs(xOff) === 14 ? ty - 64 * s : ty - 58 * s;
            ctx.beginPath();
            ctx.moveTo(tx + xOff * s - 2.5 * s, baseY);
            ctx.lineTo(tx + xOff * s, baseY - spikeH);
            ctx.lineTo(tx + xOff * s + 2.5 * s, baseY);
            ctx.closePath();
            ctx.fill();
          });

          // Evil rune glow
          ctx.shadowColor = evilGlow;
          ctx.shadowBlur = 12 * s;
          ctx.strokeStyle = "#6B0000";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(tx, ty - 28 * s);
          ctx.lineTo(tx - 5 * s, ty - 36 * s);
          ctx.lineTo(tx, ty - 45 * s);
          ctx.lineTo(tx + 5 * s, ty - 36 * s);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tx, ty - 32 * s);
          ctx.lineTo(tx, ty - 42 * s);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Edge highlights
          ctx.strokeStyle = metalHighlight;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(tx, ty - 78 * s);
          ctx.lineTo(tx - 8 * s, ty - 58 * s);
          ctx.moveTo(tx, ty - 78 * s);
          ctx.lineTo(tx + 8 * s, ty - 58 * s);
          ctx.stroke();

          break;
        }

        case "dark_spire": {
          // Simpler dark throne (previous dark_throne)
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 18 * s, 8 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          const metalS = "#263238";
          const metalHighS = "#546E7A";
          const cushionS = "#B71C1c";

          ctx.fillStyle = metalS;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 25 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 55 * s);
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 25 * s);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 10 * s);
          ctx.fill();

          const cushionGradS = ctx.createLinearGradient(screenPos.x, screenPos.y - 20 * s, screenPos.x, screenPos.y);
          cushionGradS.addColorStop(0, cushionS);
          cushionGradS.addColorStop(1, "#880E4F");
          ctx.fillStyle = cushionGradS;
          ctx.fillRect(screenPos.x - 12 * s, screenPos.y - 20 * s, 24 * s, 12 * s);

          ctx.fillStyle = "#FF5252";
          ctx.fillRect(screenPos.x - 12 * s, screenPos.y - 20 * s, 24 * s, 2 * s);

          ctx.strokeStyle = metalHighS;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 40 * s);
          ctx.moveTo(screenPos.x, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 55 * s);
          ctx.stroke();
          break;
        }

        // === SWAMP DECORATIONS ===
        case "swamp_tree": {
          // Enhanced 3D isometric gnarled swamp tree with hanging moss
          const swampTrunkDark = "#1a1208";
          const swampTrunkMid = "#2a2218";
          const swampTrunkLight = "#3a3228";
          const swampMossLight = "#5a7a4a";
          const swampMossDark = "#3a5a2a";
          const swampFoliage = ["#1a3a1a", "#2a4a2a", "#1a2a1a", "#2a3a2a"];

          // Ground shadow/murky water reflection
          const swampShadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s
          );
          swampShadowGrad.addColorStop(0, "rgba(10,20,10,0.4)");
          swampShadowGrad.addColorStop(0.5, "rgba(20,40,20,0.2)");
          swampShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = swampShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Exposed roots in water
          ctx.strokeStyle = swampTrunkDark;
          ctx.lineWidth = 3 * s;
          for (let r = 0; r < 4; r++) {
            const rootAngle = -0.8 + r * 0.5;
            const rootLen = 12 + r * 3;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + (r - 1.5) * 4 * s, screenPos.y + 4 * s);
            ctx.quadraticCurveTo(
              screenPos.x + Math.cos(rootAngle) * rootLen * 0.5 * s,
              screenPos.y + 6 * s,
              screenPos.x + Math.cos(rootAngle) * rootLen * s,
              screenPos.y + 8 * s
            );
            ctx.stroke();
          }

          // Gnarled trunk with 3D twisted shape - left side (dark)
          ctx.fillStyle = swampTrunkDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 4 * s);
          ctx.bezierCurveTo(
            screenPos.x - 14 * s, screenPos.y - 10 * s,
            screenPos.x - 8 * s, screenPos.y - 25 * s,
            screenPos.x - 6 * s, screenPos.y - 38 * s
          );
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 40 * s);
          ctx.bezierCurveTo(
            screenPos.x - 4 * s, screenPos.y - 20 * s,
            screenPos.x - 6 * s, screenPos.y - 5 * s,
            screenPos.x - 2 * s, screenPos.y + 2 * s
          );
          ctx.closePath();
          ctx.fill();

          // Trunk right side (lighter)
          const trunkGrad = ctx.createLinearGradient(
            screenPos.x, screenPos.y, screenPos.x + 12 * s, screenPos.y - 20 * s
          );
          trunkGrad.addColorStop(0, swampTrunkMid);
          trunkGrad.addColorStop(0.5, swampTrunkLight);
          trunkGrad.addColorStop(1, swampTrunkMid);
          ctx.fillStyle = trunkGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 10 * s, screenPos.y + 4 * s);
          ctx.bezierCurveTo(
            screenPos.x + 12 * s, screenPos.y - 8 * s,
            screenPos.x + 6 * s, screenPos.y - 22 * s,
            screenPos.x + 4 * s, screenPos.y - 38 * s
          );
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 40 * s);
          ctx.bezierCurveTo(
            screenPos.x + 2 * s, screenPos.y - 18 * s,
            screenPos.x + 4 * s, screenPos.y - 5 * s,
            screenPos.x + 2 * s, screenPos.y + 2 * s
          );
          ctx.closePath();
          ctx.fill();

          // Bark texture knots
          ctx.fillStyle = swampTrunkDark;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 4 * s, screenPos.y - 15 * s, 3 * s, 4 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 3 * s, screenPos.y - 25 * s, 2.5 * s, 3.5 * s, -0.2, 0, Math.PI * 2);
          ctx.fill();

          // Dead branches sticking out
          ctx.strokeStyle = swampTrunkMid;
          ctx.lineWidth = 2.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 3 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 35 * s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 28 * s);
          ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 32 * s);
          ctx.stroke();

          // Dark sparse foliage canopy
          const canopyLayers = [
            { x: -8, y: -42, rx: 15, ry: 10 },
            { x: 6, y: -44, rx: 14, ry: 9 },
            { x: -2, y: -50, rx: 12, ry: 8 },
            { x: 10, y: -38, rx: 10, ry: 7 },
          ];

          canopyLayers.forEach((layer, idx) => {
            const canopyGrad = ctx.createRadialGradient(
              screenPos.x + layer.x * s - 3 * s, screenPos.y + layer.y * s - 3 * s, 0,
              screenPos.x + layer.x * s, screenPos.y + layer.y * s, layer.rx * s
            );
            canopyGrad.addColorStop(0, swampFoliage[2]);
            canopyGrad.addColorStop(0.5, swampFoliage[idx % 4]);
            canopyGrad.addColorStop(1, swampFoliage[0]);
            ctx.fillStyle = canopyGrad;
            ctx.beginPath();
            ctx.ellipse(screenPos.x + layer.x * s, screenPos.y + layer.y * s, layer.rx * s, layer.ry * s, 0, 0, Math.PI * 2);
            ctx.fill();
          });

          // Hanging Spanish moss strands
          for (let m = 0; m < 8; m++) {
            const mossX = screenPos.x - 18 * s + m * 5 * s;
            const mossStartY = screenPos.y - 35 * s - Math.sin(m) * 10 * s;
            const mossLen = 15 + Math.sin(m * 1.5) * 8;
            const sway = Math.sin(decorTime * 0.8 + m * 0.7) * 4 * s;

            // Moss gradient from attachment point
            const mossGrad = ctx.createLinearGradient(
              mossX, mossStartY, mossX + sway, mossStartY + mossLen * s
            );
            mossGrad.addColorStop(0, swampMossDark);
            mossGrad.addColorStop(0.5, swampMossLight);
            mossGrad.addColorStop(1, swampMossDark);

            ctx.strokeStyle = mossGrad;
            ctx.lineWidth = (1.5 + Math.sin(m) * 0.5) * s;
            ctx.beginPath();
            ctx.moveTo(mossX, mossStartY);
            ctx.bezierCurveTo(
              mossX + sway * 0.3, mossStartY + mossLen * 0.3 * s,
              mossX + sway * 0.7, mossStartY + mossLen * 0.6 * s,
              mossX + sway, mossStartY + mossLen * s
            );
            ctx.stroke();

            // Moss tendrils
            if (m % 2 === 0) {
              ctx.strokeStyle = swampMossDark;
              ctx.lineWidth = 0.8 * s;
              ctx.beginPath();
              ctx.moveTo(mossX + sway * 0.5, mossStartY + mossLen * 0.5 * s);
              ctx.lineTo(mossX + sway * 0.5 + 4 * s, mossStartY + mossLen * 0.7 * s);
              ctx.stroke();
            }
          }

          // Fireflies/wisps around tree
          ctx.fillStyle = `rgba(180,255,180,${0.4 + Math.sin(decorTime * 2) * 0.3})`;
          for (let f = 0; f < 3; f++) {
            const flyX = screenPos.x + Math.sin(decorTime + f * 2) * 15 * s;
            const flyY = screenPos.y - 25 * s + Math.cos(decorTime * 1.3 + f) * 10 * s;
            ctx.beginPath();
            ctx.arc(flyX, flyY, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "mushroom": {
          // Enhanced 3D isometric fantasy mushroom with glowing effects
          const mushroomPalettes = [
            { cap: "#b71c1c", capLight: "#e53935", capDark: "#7f0000", spots: "#ffebee", stem: "#efebe9", stemDark: "#d7ccc8", glow: null },
            { cap: "#6a1b9a", capLight: "#9c27b0", capDark: "#4a148c", spots: "#f3e5f5", stem: "#ede7f6", stemDark: "#d1c4e9", glow: "rgba(156,39,176,0.4)" },
            { cap: "#1b5e20", capLight: "#2e7d32", capDark: "#0d3d11", spots: "#e8f5e9", stem: "#e8f5e9", stemDark: "#c8e6c9", glow: "rgba(76,175,80,0.3)" },
            { cap: "#bf360c", capLight: "#e64a19", capDark: "#8d2804", spots: "#fff3e0", stem: "#efebe9", stemDark: "#d7ccc8", glow: null },
          ];
          const mp = mushroomPalettes[variant % 4];

          // Bioluminescent glow for magical mushrooms
          if (mp.glow) {
            const glowPulse = 0.6 + Math.sin(decorTime * 2) * 0.3;
            const mushroomGlow = ctx.createRadialGradient(
              screenPos.x, screenPos.y - 8 * s, 0,
              screenPos.x, screenPos.y - 8 * s, 22 * s
            );
            mushroomGlow.addColorStop(0, mp.glow.replace("0.4", String(glowPulse * 0.5)));
            mushroomGlow.addColorStop(0.5, mp.glow.replace("0.4", String(glowPulse * 0.2)));
            mushroomGlow.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = mushroomGlow;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y - 8 * s, 22 * s, 14 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 4 * s, 12 * s, 6 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Stem with 3D cylinder shading
          const stemGrad = ctx.createLinearGradient(
            screenPos.x - 5 * s, screenPos.y, screenPos.x + 5 * s, screenPos.y
          );
          stemGrad.addColorStop(0, mp.stemDark);
          stemGrad.addColorStop(0.3, mp.stem);
          stemGrad.addColorStop(0.7, mp.stem);
          stemGrad.addColorStop(1, mp.stemDark);
          ctx.fillStyle = stemGrad;

          // Curved stem shape
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 4 * s, screenPos.y + 2 * s);
          ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 4 * s, screenPos.x - 3.5 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x + 3.5 * s, screenPos.y - 10 * s);
          ctx.quadraticCurveTo(screenPos.x + 5 * s, screenPos.y - 4 * s, screenPos.x + 4 * s, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();

          // Stem ring detail
          ctx.strokeStyle = mp.stemDark;
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 5 * s, 4 * s, 1.5 * s, 0, 0, Math.PI);
          ctx.stroke();

          // Gills under cap
          ctx.fillStyle = mp.stemDark;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 10 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Gill lines
          ctx.strokeStyle = mp.stem;
          ctx.lineWidth = 0.5 * s;
          for (let g = 0; g < 8; g++) {
            const gillAngle = (g / 8) * Math.PI - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y - 10 * s);
            ctx.lineTo(
              screenPos.x + Math.cos(gillAngle) * 9 * s,
              screenPos.y - 10 * s + Math.sin(gillAngle) * 2.5 * s
            );
            ctx.stroke();
          }

          // Cap with 3D dome shading
          const capGrad = ctx.createRadialGradient(
            screenPos.x - 4 * s, screenPos.y - 18 * s, 0,
            screenPos.x, screenPos.y - 12 * s, 14 * s
          );
          capGrad.addColorStop(0, mp.capLight);
          capGrad.addColorStop(0.4, mp.cap);
          capGrad.addColorStop(0.8, mp.capDark);
          capGrad.addColorStop(1, mp.capDark);
          ctx.fillStyle = capGrad;

          // Cap shape - more mushroom-like dome
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 13 * s, screenPos.y - 10 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 14 * s, screenPos.y - 18 * s,
            screenPos.x - 8 * s, screenPos.y - 22 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x, screenPos.y - 26 * s,
            screenPos.x + 8 * s, screenPos.y - 22 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x + 14 * s, screenPos.y - 18 * s,
            screenPos.x + 13 * s, screenPos.y - 10 * s
          );
          ctx.closePath();
          ctx.fill();

          // Spots on cap with 3D appearance
          const spots = [
            { x: -6, y: -18, r: 2.5 },
            { x: 3, y: -20, r: 2 },
            { x: -2, y: -14, r: 1.8 },
            { x: 7, y: -16, r: 1.5 },
            { x: -8, y: -14, r: 1.3 },
            { x: 1, y: -22, r: 1.2 },
          ];

          spots.forEach((spot) => {
            // Spot shadow
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.beginPath();
            ctx.ellipse(
              screenPos.x + spot.x * s + 0.5 * s,
              screenPos.y + spot.y * s + 0.5 * s,
              spot.r * s, spot.r * 0.7 * s, 0, 0, Math.PI * 2
            );
            ctx.fill();
            // Spot
            const spotGrad = ctx.createRadialGradient(
              screenPos.x + spot.x * s - spot.r * 0.3 * s,
              screenPos.y + spot.y * s - spot.r * 0.3 * s,
              0,
              screenPos.x + spot.x * s,
              screenPos.y + spot.y * s,
              spot.r * s
            );
            spotGrad.addColorStop(0, "#ffffff");
            spotGrad.addColorStop(0.5, mp.spots);
            spotGrad.addColorStop(1, mp.stemDark);
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.ellipse(
              screenPos.x + spot.x * s,
              screenPos.y + spot.y * s,
              spot.r * s, spot.r * 0.7 * s, 0, 0, Math.PI * 2
            );
            ctx.fill();
          });

          // Highlight on cap
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 4 * s, screenPos.y - 20 * s, 5 * s, 3 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Spore particles for magical mushrooms
          if (mp.glow) {
            const sporeAlpha = 0.3 + Math.sin(decorTime * 1.5) * 0.2;
            ctx.fillStyle = mp.glow.replace("0.4", String(sporeAlpha));
            for (let sp = 0; sp < 5; sp++) {
              const sporeY = screenPos.y - 8 * s - ((decorTime * 15 + sp * 8) % 25) * s;
              const sporeX = screenPos.x + Math.sin(decorTime + sp * 1.3) * 8 * s;
              ctx.beginPath();
              ctx.arc(sporeX, sporeY, 1 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
        case "lily_pad": {
          // Enhanced 3D isometric lily pad with water reflections
          const lilyBaseX = screenPos.x;
          const lilyBaseY = screenPos.y;
          const lilyBob = Math.sin(decorTime * 1.5 + variant * 2) * 1.5 * s;

          // Water ripple beneath
          ctx.strokeStyle = "rgba(100,150,100,0.3)";
          ctx.lineWidth = 1 * s;
          const rippleSize = 16 + Math.sin(decorTime * 2 + variant) * 2;
          ctx.beginPath();
          ctx.ellipse(lilyBaseX, lilyBaseY + 2 * s, rippleSize * s, rippleSize * 0.4 * s, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Main pad shadow on water
          ctx.fillStyle = "rgba(20,60,20,0.3)";
          ctx.beginPath();
          ctx.ellipse(lilyBaseX + 1 * s, lilyBaseY + 3 * s + lilyBob, 14 * s, 7 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main lily pad - elliptical for isometric view with notch
          ctx.fillStyle = "#2a6a2a";
          ctx.beginPath();
          ctx.ellipse(lilyBaseX, lilyBaseY + lilyBob, 14 * s, 7 * s, 0, 0.15, Math.PI * 2 - 0.15);
          ctx.lineTo(lilyBaseX, lilyBaseY + lilyBob);
          ctx.closePath();
          ctx.fill();

          // Pad surface gradient (lighter center)
          const padGrad = ctx.createRadialGradient(
            lilyBaseX - 2 * s, lilyBaseY - 2 * s + lilyBob, 0,
            lilyBaseX, lilyBaseY + lilyBob, 12 * s
          );
          padGrad.addColorStop(0, "#4a9a4a");
          padGrad.addColorStop(0.5, "#3a7a3a");
          padGrad.addColorStop(1, "#2a5a2a");
          ctx.fillStyle = padGrad;
          ctx.beginPath();
          ctx.ellipse(lilyBaseX, lilyBaseY + lilyBob, 12 * s, 6 * s, 0, 0.2, Math.PI * 2 - 0.2);
          ctx.lineTo(lilyBaseX, lilyBaseY + lilyBob);
          ctx.closePath();
          ctx.fill();

          // Vein lines radiating from center
          ctx.strokeStyle = "rgba(60,100,60,0.5)";
          ctx.lineWidth = 0.8 * s;
          for (let v = 0; v < 6; v++) {
            const vAngle = (v / 6) * Math.PI * 2 + 0.3;
            if (vAngle > 0.1 && vAngle < Math.PI * 2 - 0.1) {
              ctx.beginPath();
              ctx.moveTo(lilyBaseX, lilyBaseY + lilyBob);
              ctx.lineTo(
                lilyBaseX + Math.cos(vAngle) * 10 * s,
                lilyBaseY + lilyBob + Math.sin(vAngle) * 5 * s
              );
              ctx.stroke();
            }
          }

          // Water droplet highlight
          ctx.fillStyle = "rgba(200,255,200,0.4)";
          ctx.beginPath();
          ctx.ellipse(lilyBaseX - 4 * s, lilyBaseY - 2 * s + lilyBob, 2 * s, 1 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Flower for variant 0
          if (variant === 0) {
            const flowerY = lilyBaseY - 5 * s + lilyBob;
            // Outer petals
            ctx.fillStyle = "#ff7ab5";
            for (let p = 0; p < 6; p++) {
              const pa = (p / 6) * Math.PI * 2 + decorTime * 0.2;
              const petalX = lilyBaseX + Math.cos(pa) * 5 * s;
              const petalY = flowerY + Math.sin(pa) * 2.5 * s;
              ctx.beginPath();
              ctx.ellipse(petalX, petalY, 4 * s, 2.5 * s, pa, 0, Math.PI * 2);
              ctx.fill();
            }
            // Inner petals
            ctx.fillStyle = "#ffaad5";
            for (let p = 0; p < 5; p++) {
              const pa = (p / 5) * Math.PI * 2 + 0.3;
              const petalX = lilyBaseX + Math.cos(pa) * 3 * s;
              const petalY = flowerY + Math.sin(pa) * 1.5 * s;
              ctx.beginPath();
              ctx.ellipse(petalX, petalY, 2.5 * s, 1.5 * s, pa, 0, Math.PI * 2);
              ctx.fill();
            }
            // Center
            ctx.fillStyle = "#ffe033";
            ctx.beginPath();
            ctx.arc(lilyBaseX, flowerY, 2.5 * s, 0, Math.PI * 2);
            ctx.fill();
            // Pollen dots
            ctx.fillStyle = "#ffaa00";
            for (let d = 0; d < 4; d++) {
              const da = (d / 4) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(lilyBaseX + Math.cos(da) * 1.2 * s, flowerY + Math.sin(da) * 0.8 * s, 0.5 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
        case "fog_wisp": {
          // Enhanced ethereal swamp fog wisp with layered effects
          const fogBaseX = screenPos.x;
          const fogBaseY = screenPos.y;

          // Multiple layers of drifting fog
          const driftX = Math.sin(decorTime * 0.4 + variant * 1.5) * 15 * s;
          const driftY = Math.cos(decorTime * 0.25 + variant) * 8 * s;
          const breathe = 0.8 + Math.sin(decorTime * 0.6 + variant * 2) * 0.2;

          // Deepest layer (largest, most transparent)
          const fogGrad1 = ctx.createRadialGradient(
            fogBaseX + driftX * 0.5, fogBaseY + driftY * 0.5, 0,
            fogBaseX + driftX * 0.5, fogBaseY + driftY * 0.5, 45 * s * breathe
          );
          fogGrad1.addColorStop(0, `rgba(80,130,80,${0.12 * breathe})`);
          fogGrad1.addColorStop(0.6, `rgba(100,150,100,${0.08 * breathe})`);
          fogGrad1.addColorStop(1, "transparent");
          ctx.fillStyle = fogGrad1;
          ctx.beginPath();
          ctx.ellipse(fogBaseX + driftX * 0.5, fogBaseY + driftY * 0.5, 45 * s * breathe, 22 * s * breathe, driftX * 0.01, 0, Math.PI * 2);
          ctx.fill();

          // Middle layer
          const fogGrad2 = ctx.createRadialGradient(
            fogBaseX + driftX, fogBaseY + driftY, 0,
            fogBaseX + driftX, fogBaseY + driftY, 32 * s * breathe
          );
          fogGrad2.addColorStop(0, `rgba(120,180,120,${0.15 * breathe})`);
          fogGrad2.addColorStop(0.5, `rgba(100,160,100,${0.1 * breathe})`);
          fogGrad2.addColorStop(1, "transparent");
          ctx.fillStyle = fogGrad2;
          ctx.beginPath();
          ctx.ellipse(fogBaseX + driftX, fogBaseY + driftY, 32 * s * breathe, 16 * s * breathe, -driftX * 0.02, 0, Math.PI * 2);
          ctx.fill();

          // Top layer (densest core)
          const fogGrad3 = ctx.createRadialGradient(
            fogBaseX + driftX * 1.3, fogBaseY + driftY * 0.8, 0,
            fogBaseX + driftX * 1.3, fogBaseY + driftY * 0.8, 20 * s * breathe
          );
          fogGrad3.addColorStop(0, `rgba(150,200,150,${0.18 * breathe})`);
          fogGrad3.addColorStop(0.7, `rgba(130,180,130,${0.1 * breathe})`);
          fogGrad3.addColorStop(1, "transparent");
          ctx.fillStyle = fogGrad3;
          ctx.beginPath();
          ctx.ellipse(fogBaseX + driftX * 1.3, fogBaseY + driftY * 0.8, 20 * s * breathe, 10 * s * breathe, driftX * 0.015, 0, Math.PI * 2);
          ctx.fill();

          // Subtle ghostly wisps rising
          for (let w = 0; w < 3; w++) {
            const wispPhase = (decorTime * 0.8 + w * 1.2 + variant) % 3;
            const wispAlpha = Math.sin(wispPhase * Math.PI / 3) * 0.12;
            const wispRise = wispPhase * 12 * s;
            const wispDrift = Math.sin(wispPhase + w) * 8 * s;

            ctx.fillStyle = `rgba(180,220,180,${wispAlpha})`;
            ctx.beginPath();
            ctx.ellipse(
              fogBaseX + driftX + wispDrift,
              fogBaseY + driftY - wispRise,
              (8 - wispPhase * 2) * s,
              (4 - wispPhase) * s,
              wispDrift * 0.05,
              0, Math.PI * 2
            );
            ctx.fill();
          }
          break;
        }
        case "witch_cottage": {
          const time = Date.now() / 1000;

          // Color palette
          const woodDark = "#1a1210";
          const woodMid = "#2d1f1a";
          const woodLight = "#3d2a22";
          const woodHighlight = "#4a3328";
          const roofDark = "#1f1a15";
          const roofMid = "#2a2018";
          const roofMoss = "#1a2a1a";
          const glowGreen = "#4aff4a";
          const glowPurple = "#9b4dff";

          // Eerie ambient glow
          const ambientPulse = 0.6 + Math.sin(time * 2) * 0.15;

          // ========== GROUND SHADOW ==========
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 5 * s,
            screenPos.y + 5 * s,
            45 * s,
            18 * s,
            0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // ========== DEAD GROUND / CORRUPTION ==========
          // Corrupted earth around cottage
          const corruptGrad = ctx.createRadialGradient(
            screenPos.x,
            screenPos.y,
            10 * s,
            screenPos.x,
            screenPos.y,
            50 * s
          );
          corruptGrad.addColorStop(0, "rgba(30, 15, 30, 0.6)");
          corruptGrad.addColorStop(0.5, "rgba(20, 25, 15, 0.3)");
          corruptGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = corruptGrad;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            50 * s,
            22 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // ========== BONE FENCE POSTS ==========
          // Scattered bone/stick fence
          for (let i = 0; i < 5; i++) {
            const fenceAngle = -0.6 + i * 0.3;
            const fenceX = screenPos.x - 40 * s + i * 18 * s;
            const fenceY = screenPos.y + 8 * s - Math.abs(i - 2) * 3 * s;
            const lean = Math.sin(i * 1.5) * 0.15;

            ctx.save();
            ctx.translate(fenceX, fenceY);
            ctx.rotate(lean);

            // Gnarled post
            ctx.fillStyle = i % 2 === 0 ? "#3a3530" : "#d4c8b8";
            ctx.beginPath();
            ctx.moveTo(-2 * s, 0);
            ctx.lineTo(-1 * s, -18 * s - Math.sin(i) * 5 * s);
            ctx.lineTo(1 * s, -16 * s - Math.cos(i) * 4 * s);
            ctx.lineTo(2 * s, 0);
            ctx.closePath();
            ctx.fill();

            // Skull on some posts
            if (i === 1 || i === 3) {
              ctx.fillStyle = "#d4c8b8";
              ctx.beginPath();
              ctx.ellipse(0, -20 * s, 4 * s, 5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              // Eye sockets
              ctx.fillStyle = "#1a1a1a";
              ctx.beginPath();
              ctx.arc(-1.5 * s, -21 * s, 1.2 * s, 0, Math.PI * 2);
              ctx.arc(1.5 * s, -21 * s, 1.2 * s, 0, Math.PI * 2);
              ctx.fill();
              // Glow in sockets
              ctx.fillStyle = `rgba(74, 255, 74, ${ambientPulse * 0.5})`;
              ctx.beginPath();
              ctx.arc(-1.5 * s, -21 * s, 0.8 * s, 0, Math.PI * 2);
              ctx.arc(1.5 * s, -21 * s, 0.8 * s, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          }

          // ========== FOUNDATION STONES ==========
          ctx.fillStyle = "#252020";
          // Irregular stone foundation
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 32 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 35 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 38 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 5 * s);
          ctx.closePath();
          ctx.fill();

          // Foundation stones detail
          ctx.strokeStyle = "#1a1515";
          ctx.lineWidth = 1 * s;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 25 * s + i * 12 * s, screenPos.y + 3 * s);
            ctx.lineTo(screenPos.x - 22 * s + i * 12 * s, screenPos.y - 3 * s);
            ctx.stroke();
          }

          // ========== MAIN STRUCTURE - CROOKED WALLS ==========
          // Back wall (darker, recessed)
          ctx.fillStyle = woodDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 48 * s);
          ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 55 * s);
          ctx.lineTo(screenPos.x + 35 * s, screenPos.y - 12 * s);
          ctx.closePath();
          ctx.fill();

          // Side wall (angled, shows depth)
          const sideGrad = ctx.createLinearGradient(
            screenPos.x + 18 * s,
            screenPos.y,
            screenPos.x + 38 * s,
            screenPos.y - 20 * s
          );
          sideGrad.addColorStop(0, woodMid);
          sideGrad.addColorStop(0.5, woodLight);
          sideGrad.addColorStop(1, woodDark);
          ctx.fillStyle = sideGrad;

          ctx.beginPath();
          ctx.moveTo(screenPos.x + 18 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 45 * s);
          ctx.lineTo(screenPos.x + 32 * s, screenPos.y - 55 * s);
          ctx.lineTo(screenPos.x + 38 * s, screenPos.y - 12 * s);
          ctx.closePath();
          ctx.fill();

          // Side wall planks
          ctx.strokeStyle = woodDark;
          ctx.lineWidth = 1 * s;
          for (let i = 0; i < 4; i++) {
            const plankT = 0.15 + i * 0.22;
            ctx.beginPath();
            ctx.moveTo(
              screenPos.x + 18 * s + plankT * 20 * s,
              screenPos.y - 5 * s - plankT * 7 * s
            );
            ctx.lineTo(
              screenPos.x + 15 * s + plankT * 17 * s,
              screenPos.y - 45 * s - plankT * 10 * s
            );
            ctx.stroke();
          }

          // Front wall
          const frontGrad = ctx.createLinearGradient(
            screenPos.x - 30 * s,
            screenPos.y,
            screenPos.x + 10 * s,
            screenPos.y - 30 * s
          );
          frontGrad.addColorStop(0, woodMid);
          frontGrad.addColorStop(0.3, woodLight);
          frontGrad.addColorStop(0.7, woodMid);
          frontGrad.addColorStop(1, woodDark);
          ctx.fillStyle = frontGrad;

          ctx.beginPath();
          ctx.moveTo(screenPos.x - 30 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 28 * s, screenPos.y - 42 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 45 * s);
          ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 5 * s);
          ctx.closePath();
          ctx.fill();

          // Front wall planks (vertical, warped)
          ctx.strokeStyle = woodDark;
          ctx.lineWidth = 1.5 * s;
          for (let i = 0; i < 6; i++) {
            const warp = Math.sin(i * 0.8) * 2 * s;
            ctx.beginPath();
            ctx.moveTo(
              screenPos.x - 25 * s + i * 8 * s + warp,
              screenPos.y - 5 * s
            );
            ctx.quadraticCurveTo(
              screenPos.x - 26 * s + i * 8 * s - warp * 0.5,
              screenPos.y - 25 * s,
              screenPos.x - 24 * s + i * 8 * s + warp * 0.3,
              screenPos.y - 43 * s + i * 0.5 * s
            );
            ctx.stroke();
          }

          // ========== CROOKED DOOR ==========
          // Door frame (darker recess)
          ctx.fillStyle = "#0a0808";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 16 * s, screenPos.y - 28 * s);
          ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 5 * s);
          ctx.closePath();
          ctx.fill();

          // Door (slightly ajar)
          ctx.fillStyle = woodDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 17 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 27 * s);
          ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 28 * s);
          ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 5 * s);
          ctx.closePath();
          ctx.fill();

          // Door planks
          ctx.strokeStyle = "#151010";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 13 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 27 * s);
          ctx.stroke();

          // Door handle (bone)
          ctx.fillStyle = "#c8baa8";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 8 * s,
            screenPos.y - 15 * s,
            1.5 * s,
            2.5 * s,
            0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Eerie glow from inside door gap
          ctx.fillStyle = `rgba(74, 255, 74, ${ambientPulse * 0.4})`;
          ctx.shadowColor = glowGreen;
          ctx.shadowBlur = 8 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 28 * s);
          ctx.lineTo(screenPos.x - 3 * s, screenPos.y - 29 * s);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 5 * s);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;

          // ========== WINDOWS ==========
          // Main window (glowing)
          ctx.fillStyle = "#0a0808";
          ctx.fillRect(
            screenPos.x + 2 * s,
            screenPos.y - 35 * s,
            12 * s,
            12 * s
          );

          // Window glow
          const windowPulse = 0.7 + Math.sin(time * 2.5 + 1) * 0.2;
          ctx.fillStyle = `rgba(74, 255, 74, ${windowPulse})`;
          ctx.shadowColor = glowGreen;
          ctx.shadowBlur = 15 * s;
          ctx.fillRect(
            screenPos.x + 3 * s,
            screenPos.y - 34 * s,
            10 * s,
            10 * s
          );
          ctx.shadowBlur = 0;

          // Window cross frame
          ctx.strokeStyle = woodDark;
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 34 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 24 * s);
          ctx.moveTo(screenPos.x + 3 * s, screenPos.y - 29 * s);
          ctx.lineTo(screenPos.x + 13 * s, screenPos.y - 29 * s);
          ctx.stroke();

          // Silhouette in window (creepy!)
          ctx.fillStyle = `rgba(0, 0, 0, ${0.5 + Math.sin(time * 0.5) * 0.2})`;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 8 * s,
            screenPos.y - 30 * s,
            3 * s,
            4 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Eyes in silhouette
          ctx.fillStyle = `rgba(255, 100, 100, ${windowPulse})`;
          ctx.beginPath();
          ctx.arc(
            screenPos.x + 6.5 * s,
            screenPos.y - 31 * s,
            0.8 * s,
            0,
            Math.PI * 2
          );
          ctx.arc(
            screenPos.x + 9.5 * s,
            screenPos.y - 31 * s,
            0.8 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Small side window
          ctx.fillStyle = "#0a0808";
          ctx.fillRect(
            screenPos.x + 24 * s,
            screenPos.y - 38 * s,
            8 * s,
            8 * s
          );
          ctx.fillStyle = `rgba(155, 77, 255, ${windowPulse * 0.8})`;
          ctx.shadowColor = glowPurple;
          ctx.shadowBlur = 10 * s;
          ctx.fillRect(
            screenPos.x + 25 * s,
            screenPos.y - 37 * s,
            6 * s,
            6 * s
          );
          ctx.shadowBlur = 0;

          // ========== THATCHED ROOF ==========
          // Roof back layer
          ctx.fillStyle = roofDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 35 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 72 * s);
          ctx.lineTo(screenPos.x + 40 * s, screenPos.y - 52 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 42 * s);
          ctx.closePath();
          ctx.fill();

          // Roof front layer
          const roofGrad = ctx.createLinearGradient(
            screenPos.x - 30 * s,
            screenPos.y - 35 * s,
            screenPos.x + 5 * s,
            screenPos.y - 65 * s
          );
          roofGrad.addColorStop(0, roofMid);
          roofGrad.addColorStop(0.4, "#3a3025");
          roofGrad.addColorStop(0.7, roofMid);
          roofGrad.addColorStop(1, roofDark);
          ctx.fillStyle = roofGrad;

          ctx.beginPath();
          ctx.moveTo(screenPos.x - 35 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 72 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 42 * s);
          ctx.closePath();
          ctx.fill();

          // Thatch texture lines
          ctx.strokeStyle = roofDark;
          ctx.lineWidth = 1 * s;
          for (let i = 0; i < 12; i++) {
            const thatchT = i / 12;
            const startX = screenPos.x - 35 * s + thatchT * 55 * s;
            const startY = screenPos.y - 40 * s - thatchT * 2 * s;
            const endX = screenPos.x - 5 * s + thatchT * 25 * s;
            const endY = screenPos.y - 72 * s + thatchT * 30 * s;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }

          // Moss patches on roof
          ctx.fillStyle = roofMoss;
          for (let i = 0; i < 4; i++) {
            const mossX =
              screenPos.x - 20 * s + i * 12 * s + Math.sin(i * 2) * 5 * s;
            const mossY = screenPos.y - 48 * s - i * 5 * s;
            ctx.beginPath();
            ctx.ellipse(mossX, mossY, 5 * s, 3 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Overhanging roof edge (thick thatch)
          ctx.fillStyle = "#2a2218";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 38 * s, screenPos.y - 38 * s);
          ctx.lineTo(screenPos.x - 35 * s, screenPos.y - 42 * s);
          ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 43 * s);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 38 * s);
          ctx.closePath();
          ctx.fill();

          // Dripping moss/vines from roof edge
          ctx.strokeStyle = "#1a3018";
          ctx.lineWidth = 2 * s;
          for (let i = 0; i < 6; i++) {
            const vineX = screenPos.x - 32 * s + i * 10 * s;
            const vineLen = 8 + Math.sin(i * 1.5) * 4;
            ctx.beginPath();
            ctx.moveTo(vineX, screenPos.y - 38 * s);
            ctx.quadraticCurveTo(
              vineX - 2 * s,
              screenPos.y - 38 * s + vineLen * s * 0.5,
              vineX + Math.sin(i) * 3 * s,
              screenPos.y - 38 * s + vineLen * s
            );
            ctx.stroke();
          }

          // ========== CROOKED CHIMNEY ==========
          // Chimney base
          ctx.fillStyle = "#252020";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 55 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 78 * s);
          ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 80 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 58 * s);
          ctx.closePath();
          ctx.fill();

          // Chimney stones
          ctx.strokeStyle = "#1a1515";
          ctx.lineWidth = 1 * s;
          for (let i = 0; i < 4; i++) {
            const stoneY = screenPos.y - 58 * s - i * 6 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 7 * s, stoneY);
            ctx.lineTo(screenPos.x + 19 * s, stoneY - 1 * s);
            ctx.stroke();
          }

          // Chimney cap
          ctx.fillStyle = "#1a1515";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 4 * s, screenPos.y - 78 * s);
          ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 82 * s);
          ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 80 * s);
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 76 * s);
          ctx.closePath();
          ctx.fill();

          // Smoke from chimney
          ctx.fillStyle = `rgba(60, 50, 60, ${0.4 + Math.sin(time * 1.5) * 0.15
            })`;
          for (let i = 0; i < 4; i++) {
            const smokeOffset = (time * 8 + i * 20) % 40;
            const smokeX =
              screenPos.x + 13 * s + Math.sin(time * 2 + i) * 4 * s;
            const smokeY = screenPos.y - 82 * s - smokeOffset * s;
            const smokeSize = (3 + i * 1.5 + smokeOffset * 0.15) * s;
            const smokeAlpha = Math.max(0, 0.5 - smokeOffset * 0.012);

            ctx.fillStyle = `rgba(50, 40, 55, ${smokeAlpha})`;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
          }

          // ========== CAULDRON ==========
          // Cauldron body
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 38 * s,
            screenPos.y - 2 * s,
            10 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 48 * s, screenPos.y - 2 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 48 * s,
            screenPos.y + 8 * s,
            screenPos.x - 38 * s,
            screenPos.y + 10 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x - 28 * s,
            screenPos.y + 8 * s,
            screenPos.x - 28 * s,
            screenPos.y - 2 * s
          );
          ctx.fill();

          // Cauldron rim
          ctx.strokeStyle = "#2a2a2a";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 38 * s,
            screenPos.y - 2 * s,
            10 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // Bubbling potion
          const bubbleGlow = 0.8 + Math.sin(time * 4) * 0.2;
          ctx.fillStyle = `rgba(74, 255, 74, ${bubbleGlow * 0.7})`;
          ctx.shadowColor = glowGreen;
          ctx.shadowBlur = 12 * s;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 38 * s,
            screenPos.y - 3 * s,
            8 * s,
            4 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.shadowBlur = 0;

          // Bubbles
          for (let i = 0; i < 5; i++) {
            const bubbleTime = (time * 2 + i * 1.3) % 3;
            const bubbleX =
              screenPos.x - 42 * s + i * 3 * s + Math.sin(i * 2) * 2 * s;
            const bubbleY = screenPos.y - 3 * s - bubbleTime * 4 * s;
            const bubbleSize = (1.5 + Math.sin(i) * 0.5) * s;
            const bubbleAlpha = Math.max(0, 1 - bubbleTime * 0.4);

            ctx.fillStyle = `rgba(150, 255, 150, ${bubbleAlpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
          }

          // ========== HANGING ITEMS ==========
          // Rope/chain from roof
          ctx.strokeStyle = "#3a3530";
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 38 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 28 * s,
            screenPos.y - 30 * s,
            screenPos.x - 26 * s,
            screenPos.y - 22 * s
          );
          ctx.stroke();

          // Hanging skull
          ctx.fillStyle = "#d4c8b8";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 26 * s,
            screenPos.y - 18 * s,
            4 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Jaw
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 26 * s,
            screenPos.y - 13 * s,
            3 * s,
            2 * s,
            0,
            0,
            Math.PI
          );
          ctx.fill();
          // Eye sockets
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 28 * s,
            screenPos.y - 19 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.arc(
            screenPos.x - 24 * s,
            screenPos.y - 19 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Second hanging item - herbs/garlic
          ctx.strokeStyle = "#3a3530";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 15 * s, screenPos.y - 43 * s);
          ctx.lineTo(screenPos.x + 16 * s, screenPos.y - 32 * s);
          ctx.stroke();

          // Dried herbs bundle
          ctx.fillStyle = "#4a5540";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 16 * s,
            screenPos.y - 30 * s,
            3 * s,
            5 * s,
            0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.strokeStyle = "#3a4530";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 14 * s, screenPos.y - 32 * s);
          ctx.lineTo(screenPos.x + 13 * s, screenPos.y - 25 * s);
          ctx.moveTo(screenPos.x + 18 * s, screenPos.y - 32 * s);
          ctx.lineTo(screenPos.x + 19 * s, screenPos.y - 25 * s);
          ctx.stroke();

          // ========== COBWEBS ==========
          ctx.strokeStyle = `rgba(200, 200, 200, 0.3)`;
          ctx.lineWidth = 0.5 * s;

          // Corner web
          const webCenterX = screenPos.x - 28 * s;
          const webCenterY = screenPos.y - 42 * s;
          for (let i = 0; i < 6; i++) {
            const webAngle = Math.PI * 0.5 + (i / 6) * Math.PI * 0.7;
            ctx.beginPath();
            ctx.moveTo(webCenterX, webCenterY);
            ctx.lineTo(
              webCenterX + Math.cos(webAngle) * 12 * s,
              webCenterY + Math.sin(webAngle) * 8 * s
            );
            ctx.stroke();
          }
          // Web spirals
          for (let ring = 1; ring < 4; ring++) {
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) {
              const webAngle = Math.PI * 0.5 + (i / 6) * Math.PI * 0.7;
              const ringDist = ring * 3.5 * s;
              const x = webCenterX + Math.cos(webAngle) * ringDist;
              const y = webCenterY + Math.sin(webAngle) * ringDist * 0.7;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // ========== MUSHROOMS ==========
          // Creepy glowing mushrooms near base
          const mushroomPositions = [
            { x: 28, y: 3 },
            { x: 32, y: 6 },
            { x: -35, y: 8 },
          ];

          mushroomPositions.forEach((pos, i) => {
            const mushX = screenPos.x + pos.x * s;
            const mushY = screenPos.y + pos.y * s;
            const mushGlow = 0.6 + Math.sin(time * 2 + i) * 0.2;

            // Stem
            ctx.fillStyle = "#c8b8a8";
            ctx.beginPath();
            ctx.moveTo(mushX - 1.5 * s, mushY);
            ctx.lineTo(mushX - 1 * s, mushY - 5 * s);
            ctx.lineTo(mushX + 1 * s, mushY - 5 * s);
            ctx.lineTo(mushX + 1.5 * s, mushY);
            ctx.closePath();
            ctx.fill();

            // Cap
            ctx.fillStyle = `rgba(180, 50, 50, ${0.8 + mushGlow * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(
              mushX,
              mushY - 6 * s,
              4 * s,
              2.5 * s,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Glow spots on cap
            ctx.fillStyle = `rgba(255, 200, 100, ${mushGlow * 0.5})`;
            ctx.beginPath();
            ctx.arc(mushX - 1.5 * s, mushY - 6 * s, 0.8 * s, 0, Math.PI * 2);
            ctx.arc(mushX + 1 * s, mushY - 7 * s, 0.6 * s, 0, Math.PI * 2);
            ctx.fill();
          });

          break;
        }

        case "cauldron":
          // Large iron pot with volume and bubbling goo
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 3 * s,
            15 * s,
            6 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          const iron = "#212121";
          const ironLight = "#424242";

          // Little legs
          ctx.fillStyle = iron;
          ctx.fillRect(screenPos.x - 10 * s, screenPos.y, 3 * s, 4 * s);
          ctx.fillRect(screenPos.x + 7 * s, screenPos.y, 3 * s, 4 * s);

          // Main Pot body (gradient spherical look)
          const potGrad = ctx.createRadialGradient(
            screenPos.x - 5 * s,
            screenPos.y - 15 * s,
            5 * s,
            screenPos.x,
            screenPos.y - 15 * s,
            20 * s
          );
          potGrad.addColorStop(0, ironLight);
          potGrad.addColorStop(1, iron);
          ctx.fillStyle = potGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 15 * s, 18 * s, 0, Math.PI * 2);
          ctx.fill();

          // Rim (thick torus shape)
          ctx.fillStyle = ironLight;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 28 * s,
            18 * s,
            6 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = iron; // inner hole
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 28 * s,
            14 * s,
            4 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Bubbling Goo content
          const gooHeight = Math.sin(decorTime * 3) * 2 * s;
          ctx.fillStyle = "#64DD17";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 26 * s + gooHeight,
            13 * s,
            3.5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Bubbles
          const b1 = Math.sin(decorTime * 5) * 3 * s;
          const b2 = Math.cos(decorTime * 4) * 3 * s;
          ctx.fillStyle = "#B2FF59";
          ctx.beginPath();
          ctx.arc(
            screenPos.x + b1,
            screenPos.y - 28 * s + gooHeight,
            3 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            screenPos.x - b2,
            screenPos.y - 25 * s + gooHeight,
            2 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;

        case "tentacle": {
          // Properly isometric 3D tentacle emerging from murky water
          const tentacleDark = "#4A148C";
          const tentacleMid = "#7B1FA2";
          const tentacleLight = "#9C27B0";
          const tentacleHighlight = "#BA68C8";
          const suckerOuter = "#E1BEE7";
          const suckerInner = "#CE93D8";
          const suckerDeep = "#7B1FA2";

          const sway = Math.sin(decorTime * 1.5 + dec.x) * 12 * s;
          const secondarySway = Math.cos(decorTime * 2.3 + dec.x * 1.5) * 6 * s;
          const segments = 14;

          // Base blends seamlessly with water underneath
          const holeWidth = 18 * s;
          const holeDepth = 9 * s;

          // Outer water disturbance ripples (animated)
          const ripplePhase = decorTime * 1.2 + dec.x;
          for (let r = 0; r < 3; r++) {
            const rippleSize = ((ripplePhase + r * 0.8) % 2) * 12 * s;
            const rippleAlpha = 0.25 * (1 - ((ripplePhase + r * 0.8) % 2) / 2);
            ctx.strokeStyle = `rgba(80, 100, 140, ${rippleAlpha})`;
            ctx.lineWidth = 1 * s;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y + 2 * s, holeWidth + rippleSize, holeDepth + rippleSize * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Soft water shadow/depth around emergence point
          const waterBlendGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y + 2 * s, holeWidth * 0.3,
            screenPos.x, screenPos.y + 2 * s, holeWidth + 10 * s
          );
          waterBlendGrad.addColorStop(0, "rgba(20, 40, 60, 0.5)");
          waterBlendGrad.addColorStop(0.4, "rgba(30, 50, 70, 0.3)");
          waterBlendGrad.addColorStop(0.7, "rgba(40, 60, 80, 0.15)");
          waterBlendGrad.addColorStop(1, "transparent");
          ctx.fillStyle = waterBlendGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, holeWidth + 10 * s, holeDepth + 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dark depth where tentacle enters water
          const holeGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y, 0,
            screenPos.x, screenPos.y + 2 * s, holeWidth * 0.9
          );
          holeGrad.addColorStop(0, "rgba(5, 2, 10, 0.9)");
          holeGrad.addColorStop(0.5, "rgba(15, 10, 25, 0.7)");
          holeGrad.addColorStop(0.8, "rgba(30, 25, 50, 0.4)");
          holeGrad.addColorStop(1, "transparent");
          ctx.fillStyle = holeGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, holeWidth, holeDepth, 0, 0, Math.PI * 2);
          ctx.fill();

          // Water surface light reflection near tentacle
          ctx.strokeStyle = "rgba(120, 150, 180, 0.35)";
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 1 * s, holeWidth * 0.7, holeDepth * 0.7, 0, Math.PI * 0.9, Math.PI * 1.7);
          ctx.stroke();

          // Subtle water caustics near base
          ctx.fillStyle = "rgba(100, 130, 160, 0.15)";
          for (let c = 0; c < 4; c++) {
            const causticAngle = (c / 4) * Math.PI * 2 + decorTime * 0.5;
            const causticDist = (holeWidth * 0.6 + Math.sin(decorTime * 2 + c) * 3 * s);
            const cx = screenPos.x + Math.cos(causticAngle) * causticDist;
            const cy = screenPos.y + 2 * s + Math.sin(causticAngle) * causticDist * 0.5;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 3 * s, 1.5 * s, causticAngle, 0, Math.PI * 2);
            ctx.fill();
          }

          // Bubbles rising from water
          ctx.fillStyle = "rgba(150, 180, 210, 0.5)";
          const bubbleTime = decorTime * 2.5 + dec.x;
          for (let b = 0; b < 4; b++) {
            const bubblePhase = (bubbleTime + b * 0.6) % 2.5;
            const bubbleY = screenPos.y - bubblePhase * 15 * s;
            const bubbleX = screenPos.x + Math.sin(bubbleTime * 2 + b * 1.5) * 5 * s;
            const bubbleSize = (1.5 - bubblePhase * 0.3) * s;
            if (bubblePhase < 2) {
              ctx.globalAlpha = 0.45 * (1 - bubblePhase / 2);
              ctx.beginPath();
              ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.globalAlpha = 1;

          // Calculate 3D tentacle path with proper cylindrical points
          const tentaclePoints: { x: number; y: number; radius: number; angle: number }[] = [];
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Curved path in 3D space
            const curveX = screenPos.x + sway * t * t + secondarySway * Math.sin(t * Math.PI);
            const curveY = screenPos.y - 65 * s * t;
            const radius = (12 - t * 9.5) * s; // Taper from 12 to 2.5 (thicker)
            const bendAngle = Math.sin(t * Math.PI * 0.8) * 0.4 + sway * 0.01; // Slight rotation as it curves
            tentaclePoints.push({ x: curveX, y: curveY, radius, angle: bendAngle });
          }

          // Draw ground shadow
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = "#1A0F21";
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 10 * s, screenPos.y + 10 * s, 28 * s, 14 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Draw BACK half of tentacle (shadow side) first
          const backGrad = ctx.createLinearGradient(
            screenPos.x - 15 * s, screenPos.y,
            screenPos.x + 5 * s, screenPos.y - 50 * s
          );
          backGrad.addColorStop(0, tentacleDark);
          backGrad.addColorStop(0.5, "#5E1E87");
          backGrad.addColorStop(1, tentacleDark);

          ctx.fillStyle = backGrad;
          ctx.beginPath();
          // Start from base, draw right edge up
          ctx.moveTo(tentaclePoints[0].x, tentaclePoints[0].y);
          for (let i = 0; i <= segments; i++) {
            const p = tentaclePoints[i];
            const wobble = Math.sin(i * 0.6 + decorTime * 2.5) * 0.6 * s;
            // Right edge (back side visible from isometric view)
            ctx.lineTo(p.x + p.radius * 0.9 + wobble, p.y + p.radius * 0.3);
          }
          // Curve around tip
          const tipBack = tentaclePoints[segments];
          ctx.quadraticCurveTo(tipBack.x + 3 * s, tipBack.y - 3 * s, tipBack.x, tipBack.y - 5 * s);
          ctx.quadraticCurveTo(tipBack.x - 1 * s, tipBack.y - 3 * s, tipBack.x - tipBack.radius * 0.3, tipBack.y);
          // Back down the center
          for (let i = segments; i >= 0; i--) {
            const p = tentaclePoints[i];
            ctx.lineTo(p.x, p.y + p.radius * 0.5);
          }
          ctx.closePath();
          ctx.fill();

          // Draw FRONT half of tentacle (lit side)
          const frontGrad = ctx.createLinearGradient(
            screenPos.x - 10 * s, screenPos.y - 30 * s,
            screenPos.x + 15 * s, screenPos.y
          );
          frontGrad.addColorStop(0, tentacleLight);
          frontGrad.addColorStop(0.3, tentacleMid);
          frontGrad.addColorStop(0.7, tentacleLight);
          frontGrad.addColorStop(1, tentacleMid);

          ctx.fillStyle = frontGrad;
          ctx.beginPath();
          ctx.moveTo(tentaclePoints[0].x, tentaclePoints[0].y);
          // Left edge going up (front/lit side)
          for (let i = 0; i <= segments; i++) {
            const p = tentaclePoints[i];
            const wobble = Math.sin(i * 0.6 + decorTime * 2.5 + 0.5) * 0.6 * s;
            ctx.lineTo(p.x - p.radius * 0.9 + wobble, p.y + p.radius * 0.3);
          }
          // Curve around tip
          const tipFront = tentaclePoints[segments];
          ctx.quadraticCurveTo(tipFront.x - 2 * s, tipFront.y - 4 * s, tipFront.x, tipFront.y - 5 * s);
          ctx.quadraticCurveTo(tipFront.x + 1 * s, tipFront.y - 2 * s, tipFront.x, tipFront.y);
          // Back down center
          for (let i = segments; i >= 0; i--) {
            const p = tentaclePoints[i];
            ctx.lineTo(p.x, p.y + p.radius * 0.5);
          }
          ctx.closePath();
          ctx.fill();

          // Highlight stripe on lit side
          ctx.strokeStyle = tentacleHighlight;
          ctx.lineWidth = 3.5 * s;
          ctx.lineCap = "round";
          ctx.beginPath();
          for (let i = 1; i < segments - 2; i++) {
            const p = tentaclePoints[i];
            const hx = p.x - p.radius * 0.5;
            const hy = p.y + p.radius * 0.2;
            if (i === 1) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();

          // Secondary highlight
          ctx.strokeStyle = "rgba(225, 190, 231, 0.5)";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          for (let i = 2; i < segments - 3; i++) {
            const p = tentaclePoints[i];
            const hx = p.x - p.radius * 0.7;
            const hy = p.y + p.radius * 0.1;
            if (i === 2) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();

          // Muscle/vein lines
          ctx.strokeStyle = tentacleDark;
          ctx.lineWidth = 1.2 * s;
          ctx.globalAlpha = 0.35;
          for (let v = 0; v < 3; v++) {
            ctx.beginPath();
            const offset = (v - 1) * 0.25;
            for (let i = 1; i < segments - 1; i++) {
              const p = tentaclePoints[i];
              const vx = p.x + p.radius * offset;
              const vy = p.y + p.radius * 0.4;
              if (i === 1) ctx.moveTo(vx, vy);
              else ctx.lineTo(vx, vy);
            }
            ctx.stroke();
          }
          ctx.globalAlpha = 1;

          // 3D Suckers on the inner curve - more circular shape
          const suckerSpots = [
            { t: 0.12, size: 5.5 },
            { t: 0.22, size: 5 },
            { t: 0.32, size: 4.5 },
            { t: 0.42, size: 4 },
            { t: 0.52, size: 3.5 },
            { t: 0.62, size: 3 },
            { t: 0.72, size: 2.5 },
            { t: 0.82, size: 2 },
          ];

          suckerSpots.forEach((sp) => {
            const idx = Math.floor(sp.t * segments);
            const p = tentaclePoints[idx];
            // Position suckers on the inner curve, facing viewer
            const sx = p.x - p.radius * 0.55;
            const sy = p.y + p.radius * 0.3;
            // More circular suckers (0.85 ratio instead of 0.5)
            const suckerSize = sp.size * s;
            const suckerRatio = 0.85; // Nearly circular

            // Sucker shadow/depth
            ctx.fillStyle = "rgba(74, 20, 140, 0.35)";
            ctx.beginPath();
            ctx.ellipse(sx + 0.8 * s, sy + 0.6 * s, suckerSize, suckerSize * suckerRatio, 0, 0, Math.PI * 2);
            ctx.fill();

            // Outer sucker rim with slight 3D rim effect
            const rimGrad = ctx.createRadialGradient(
              sx - suckerSize * 0.2, sy - suckerSize * 0.15, 0,
              sx, sy, suckerSize
            );
            rimGrad.addColorStop(0, "#F3E5F5");
            rimGrad.addColorStop(0.5, suckerOuter);
            rimGrad.addColorStop(1, "#D1C4E9");
            ctx.fillStyle = rimGrad;
            ctx.beginPath();
            ctx.ellipse(sx, sy, suckerSize, suckerSize * suckerRatio, 0, 0, Math.PI * 2);
            ctx.fill();

            // Inner ring - concentric circle
            const innerGrad = ctx.createRadialGradient(
              sx - suckerSize * 0.1, sy - suckerSize * 0.08, 0,
              sx, sy, suckerSize * 0.7
            );
            innerGrad.addColorStop(0, "#E1BEE7");
            innerGrad.addColorStop(0.6, suckerInner);
            innerGrad.addColorStop(1, "#AB47BC");
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.ellipse(sx, sy, suckerSize * 0.68, suckerSize * 0.68 * suckerRatio, 0, 0, Math.PI * 2);
            ctx.fill();

            // Deep center hole
            ctx.fillStyle = suckerDeep;
            ctx.beginPath();
            ctx.ellipse(sx, sy, suckerSize * 0.32, suckerSize * 0.32 * suckerRatio, 0, 0, Math.PI * 2);
            ctx.fill();

            // Darkest center
            ctx.fillStyle = "#38006b";
            ctx.beginPath();
            ctx.ellipse(sx, sy, suckerSize * 0.15, suckerSize * 0.15 * suckerRatio, 0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight reflection on sucker rim
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.beginPath();
            ctx.ellipse(sx - suckerSize * 0.3, sy - suckerSize * 0.25 * suckerRatio, suckerSize * 0.18, suckerSize * 0.12, -0.4, 0, Math.PI * 2);
            ctx.fill();
          });

          // Slime drip
          ctx.fillStyle = "rgba(186, 104, 200, 0.55)";
          const dripPhase = (decorTime * 0.6 + dec.x) % 3;
          if (dripPhase < 1.8) {
            const dripIdx = 4;
            const dripPt = tentaclePoints[dripIdx];
            const dripX = dripPt.x - dripPt.radius * 0.5;
            const dripY = dripPt.y + dripPhase * 8 * s;
            ctx.beginPath();
            ctx.ellipse(dripX, dripY, 1.5 * s, (2 + dripPhase) * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Wet sheen where tentacle meets water
          ctx.fillStyle = "rgba(100, 140, 180, 0.25)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 3 * s, screenPos.y - 5 * s, 5 * s, 2.5 * s, -0.2, 0, Math.PI * 2);
          ctx.fill();

          // Water dripping down tentacle base
          ctx.fillStyle = "rgba(80, 120, 160, 0.2)";
          const dripTime = decorTime * 0.8 + dec.x * 0.5;
          for (let d = 0; d < 2; d++) {
            const dripOffset = (dripTime + d * 1.2) % 2;
            if (dripOffset < 1.5) {
              const dy = screenPos.y - 12 * s + dripOffset * 8 * s;
              const dx = screenPos.x + (d - 0.5) * 6 * s;
              ctx.beginPath();
              ctx.ellipse(dx, dy, 1.2 * s, (1.5 + dripOffset * 0.5) * s, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }

        case "deep_water": {
          // Ultra-detailed isometric deep water pool
          const waterSeed = (dec.x || 0) * 11.3 + (dec.y || 0) * 23.7;
          const isoRatioWater = 0.5;

          // Helper for organic blob edges (water-specific)
          const drawWaterBlob = (cx: number, cy: number, rx: number, ry: number, seed: number, bumpy: number = 0.12) => {
            ctx.beginPath();
            const pts = 20;
            for (let i = 0; i <= pts; i++) {
              const ang = (i / pts) * Math.PI * 2;
              const n1 = Math.sin(ang * 3 + seed) * bumpy;
              const n2 = Math.sin(ang * 5 + seed * 2.1) * bumpy * 0.5;
              const variation = 1 + n1 + n2;
              const x = cx + Math.cos(ang) * rx * variation;
              const y = cy + Math.sin(ang) * ry * variation;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
          };

          // 1. Outer wet ground ring (organic edges)
          const wetGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 20 * s, screenPos.x, screenPos.y, 38 * s);
          wetGrad.addColorStop(0, "transparent");
          wetGrad.addColorStop(0.5, "rgba(20, 50, 80, 0.4)");
          wetGrad.addColorStop(1, "rgba(30, 60, 90, 0.15)");
          ctx.fillStyle = wetGrad;
          drawWaterBlob(screenPos.x, screenPos.y, 38 * s, 19 * s * isoRatioWater, waterSeed, 0.18);
          ctx.fill();

          // 2. Stone/dirt rim around water (organic)
          ctx.fillStyle = "rgba(60, 55, 50, 0.85)";
          drawWaterBlob(screenPos.x, screenPos.y, 32 * s, 16 * s * isoRatioWater, waterSeed + 10, 0.15);
          ctx.fill();

          // 3. Deep water abyss layer (organic shape)
          const deepGradW = ctx.createRadialGradient(screenPos.x, screenPos.y + 4 * s, 0, screenPos.x, screenPos.y, 28 * s);
          deepGradW.addColorStop(0, "rgba(5, 15, 40, 0.98)");
          deepGradW.addColorStop(0.4, "rgba(10, 30, 60, 0.95)");
          deepGradW.addColorStop(0.7, "rgba(20, 50, 90, 0.9)");
          deepGradW.addColorStop(1, "rgba(30, 70, 120, 0.85)");
          ctx.fillStyle = deepGradW;
          drawWaterBlob(screenPos.x, screenPos.y, 28 * s, 14 * s * isoRatioWater, waterSeed + 20, 0.12);
          ctx.fill();

          // 4. Surface water layer with slight offset (organic)
          const surfGradW = ctx.createRadialGradient(screenPos.x - 8 * s, screenPos.y - 4 * s, 0, screenPos.x, screenPos.y, 26 * s);
          surfGradW.addColorStop(0, "rgba(80, 150, 200, 0.7)");
          surfGradW.addColorStop(0.4, "rgba(50, 120, 180, 0.5)");
          surfGradW.addColorStop(1, "rgba(30, 80, 140, 0.3)");
          ctx.fillStyle = surfGradW;
          drawWaterBlob(screenPos.x, screenPos.y - 2 * s, 25 * s, 12.5 * s * isoRatioWater, waterSeed + 30, 0.1);
          ctx.fill();

          // 5. Animated ripples (concentric, moving outward)
          for (let rip = 0; rip < 3; rip++) {
            const ripPhase = (decorTime * 0.6 + rip * 0.33) % 1;
            const ripR = (8 + ripPhase * 16) * s;
            ctx.strokeStyle = `rgba(150, 200, 255, ${0.4 * (1 - ripPhase)})`;
            ctx.lineWidth = (1.5 - ripPhase) * s;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y, ripR, ripR * isoRatioWater, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // 6. Shimmer highlights (animated)
          ctx.fillStyle = "rgba(200, 230, 255, 0.5)";
          for (let sh = 0; sh < 4; sh++) {
            const shAngle = sh * 0.7 + decorTime * 0.5 + waterSeed * 0.1;
            const shDist = (10 + Math.sin(decorTime + sh) * 5) * s;
            const shX = screenPos.x + Math.cos(shAngle) * shDist * 0.8;
            const shY = screenPos.y + Math.sin(shAngle) * shDist * 0.4 - 2 * s;
            const shSize = (4 + Math.sin(decorTime * 2 + sh * 2) * 2) * s;
            ctx.beginPath();
            ctx.ellipse(shX, shY, shSize, shSize * 0.4, shAngle * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // 7. Underwater glow from center (mysterious depth)
          const glowPhase = Math.sin(decorTime * 0.8 + waterSeed) * 0.3 + 0.7;
          const underwaterGlow = ctx.createRadialGradient(screenPos.x, screenPos.y + 3 * s, 0, screenPos.x, screenPos.y, 20 * s);
          underwaterGlow.addColorStop(0, `rgba(50, 150, 200, ${0.25 * glowPhase})`);
          underwaterGlow.addColorStop(0.5, `rgba(30, 100, 150, ${0.15 * glowPhase})`);
          underwaterGlow.addColorStop(1, "transparent");
          ctx.fillStyle = underwaterGlow;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 18 * s, 9 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // 8. Bubbles rising occasionally
          for (let bub = 0; bub < 3; bub++) {
            const bubPhase = (decorTime * 0.8 + bub * 0.5 + waterSeed * 0.01) % 2;
            if (bubPhase < 1.2) {
              const bubX = screenPos.x + Math.sin(bub * 3 + waterSeed) * 12 * s;
              const bubY = screenPos.y + 5 * s - bubPhase * 18 * s;
              const bubSize = (2 + bub * 0.5) * s * (1 - bubPhase / 1.5);
              ctx.fillStyle = `rgba(180, 220, 255, ${0.6 * (1 - bubPhase / 1.2)})`;
              ctx.beginPath();
              ctx.arc(bubX, bubY, bubSize, 0, Math.PI * 2);
              ctx.fill();
              // Bubble highlight
              ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * (1 - bubPhase / 1.2)})`;
              ctx.beginPath();
              ctx.arc(bubX - bubSize * 0.3, bubY - bubSize * 0.3, bubSize * 0.35, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // 9. Rocks/pebbles at edge
          ctx.fillStyle = "#4a4540";
          for (let rock = 0; rock < 6; rock++) {
            const rockAngle = (rock / 6) * Math.PI * 2 + Math.sin(waterSeed + rock) * 0.4;
            const rockDist = (26 + Math.sin(rock * 2 + waterSeed) * 4) * s;
            const rockX = screenPos.x + Math.cos(rockAngle) * rockDist;
            const rockY = screenPos.y + Math.sin(rockAngle) * rockDist * isoRatioWater;
            const rockSize = (3 + Math.sin(waterSeed + rock * 3) * 1.5) * s;
            ctx.beginPath();
            ctx.ellipse(rockX, rockY, rockSize, rockSize * 0.6, rockAngle, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        // === MISC DECORATIONS ===
        case "ruins": {
          // 5 unique ruin variants (variant 4 is original, used for sunken_temple)
          // For sunken_temple level, force variant 4 (original ruins)
          const ruinVariant = selectedMap === "sunken_temple" ? 4 : (variant % 5);
          const stoneBase = "#5a5a5a";
          const stoneDark = "#3a3a3a";
          const stoneLight = "#7a7a7a";
          const mossColor = "#4a5d3a";

          // Ground shadow for all variants
          const shadowGrad = ctx.createRadialGradient(
            screenPos.x + 3 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 3 * s, screenPos.y + 8 * s, 45 * s
          );
          shadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
          shadowGrad.addColorStop(0.7, "rgba(0,0,0,0.1)");
          shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = shadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 45 * s, 22 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          if (ruinVariant === 0) {
            // VARIANT 0: Broken Roman column with scattered debris
            // Column base
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 12 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y + 8 * s, 12 * s, 6 * s, 0, 0, Math.PI);
            ctx.fill();

            // Column shaft (broken, angled)
            ctx.fillStyle = stoneBase;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 2 * s);
            ctx.lineTo(screenPos.x - 7 * s, screenPos.y - 35 * s);
            ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 40 * s);
            ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 38 * s);
            ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 2 * s);
            ctx.closePath();
            ctx.fill();

            // Column fluting (vertical lines)
            ctx.strokeStyle = stoneDark;
            ctx.lineWidth = 0.5 * s;
            for (let i = -5; i <= 5; i += 2) {
              ctx.beginPath();
              ctx.moveTo(screenPos.x + i * s, screenPos.y + 2 * s);
              ctx.lineTo(screenPos.x + i * s - 1, screenPos.y - 35 * s);
              ctx.stroke();
            }

            // Broken capital piece lying nearby
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 18 * s, screenPos.y + 3 * s);
            ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 2 * s);
            ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x + 22 * s, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Scattered rubble
            ctx.fillStyle = stoneDark;
            for (let r = 0; r < 5; r++) {
              const rx = screenPos.x - 25 * s + r * 12 * s + Math.sin(r * 2.5) * 8 * s;
              const ry = screenPos.y + 5 * s + Math.cos(r * 1.7) * 5 * s;
              ctx.beginPath();
              ctx.ellipse(rx, ry, (4 + r % 3) * s, (2 + r % 2) * s, r * 0.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Moss patches
            ctx.fillStyle = mossColor;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.ellipse(screenPos.x - 5 * s, screenPos.y - 15 * s, 4 * s, 2.5 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(screenPos.x + 3 * s, screenPos.y - 5 * s, 3 * s, 2 * s, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

          } else if (ruinVariant === 1) {
            // VARIANT 1: Crumbling archway
            // Left pillar
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 25 * s, screenPos.y + 10 * s);
            ctx.lineTo(screenPos.x - 28 * s, screenPos.y - 30 * s);
            ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 35 * s);
            ctx.lineTo(screenPos.x - 15 * s, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Left pillar highlight
            ctx.fillStyle = stoneBase;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 15 * s, screenPos.y + 8 * s);
            ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 35 * s);
            ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 32 * s);
            ctx.lineTo(screenPos.x - 10 * s, screenPos.y + 10 * s);
            ctx.closePath();
            ctx.fill();

            // Right pillar (broken shorter)
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 15 * s, screenPos.y + 10 * s);
            ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 18 * s);
            ctx.lineTo(screenPos.x + 25 * s, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = stoneBase;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 25 * s, screenPos.y + 8 * s);
            ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 18 * s);
            ctx.lineTo(screenPos.x + 28 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 10 * s);
            ctx.closePath();
            ctx.fill();

            // Partial arch connecting
            ctx.strokeStyle = stoneBase;
            ctx.lineWidth = 6 * s;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y - 20 * s, 22 * s, Math.PI * 1.1, Math.PI * 1.6);
            ctx.stroke();

            // Fallen arch stones
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 5 * s, screenPos.y + 2 * s);
            ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 5 * s);
            ctx.lineTo(screenPos.x + 18 * s, screenPos.y + 3 * s);
            ctx.lineTo(screenPos.x + 10 * s, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Scattered debris
            ctx.fillStyle = stoneDark;
            for (let r = 0; r < 4; r++) {
              const rx = screenPos.x - 8 * s + r * 8 * s;
              const ry = screenPos.y + 6 * s + Math.sin(r * 2) * 3 * s;
              ctx.beginPath();
              ctx.ellipse(rx, ry, 3 * s, 1.8 * s, r, 0, Math.PI * 2);
              ctx.fill();
            }

          } else if (ruinVariant === 2) {
            // VARIANT 2: Collapsed wall section with vegetation
            // Back wall segment
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 30 * s, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x - 28 * s, screenPos.y - 25 * s);
            ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 35 * s);
            ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 5 * s);
            ctx.closePath();
            ctx.fill();

            // Wall texture - brick lines
            ctx.strokeStyle = "#2a2a2a";
            ctx.lineWidth = 0.5 * s;
            for (let row = 0; row < 5; row++) {
              const yOff = -5 - row * 6;
              ctx.beginPath();
              ctx.moveTo(screenPos.x - 28 * s, screenPos.y + yOff * s);
              ctx.lineTo(screenPos.x + 6 * s, screenPos.y + (yOff - 8) * s);
              ctx.stroke();
            }

            // Collapsed section (pile of stones)
            ctx.fillStyle = stoneBase;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 8 * s, screenPos.y + 8 * s);
            ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 8 * s);
            ctx.lineTo(screenPos.x + 28 * s, screenPos.y + 2 * s);
            ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 10 * s);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 12 * s, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 3 * s);
            ctx.lineTo(screenPos.x + 25 * s, screenPos.y + 4 * s);
            ctx.lineTo(screenPos.x + 20 * s, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Vegetation growing through cracks
            ctx.fillStyle = "#3d5c2a";
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 15 * s);
            ctx.quadraticCurveTo(screenPos.x - 15 * s, screenPos.y - 30 * s, screenPos.x - 8 * s, screenPos.y - 28 * s);
            ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 22 * s, screenPos.x - 10 * s, screenPos.y - 15 * s);
            ctx.fill();

            ctx.fillStyle = "#4a7a35";
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 18 * s);
            ctx.quadraticCurveTo(screenPos.x - 2 * s, screenPos.y - 32 * s, screenPos.x + 3 * s, screenPos.y - 25 * s);
            ctx.quadraticCurveTo(screenPos.x, screenPos.y - 20 * s, screenPos.x - 5 * s, screenPos.y - 18 * s);
            ctx.fill();

            // Ivy tendrils
            ctx.strokeStyle = mossColor;
            ctx.lineWidth = 1.5 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
            ctx.quadraticCurveTo(screenPos.x - 15 * s, screenPos.y - 5 * s, screenPos.x - 18 * s, screenPos.y + 2 * s);
            ctx.stroke();

          } else if (ruinVariant === 3) {
            // VARIANT 3: Ruined tower base with spiral staircase remains
            // Circular base
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y + 5 * s, 25 * s, 15 * s, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tower wall remains (partial cylinder)
            ctx.fillStyle = stoneBase;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 22 * s, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x - 20 * s, screenPos.y - 30 * s);
            ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 38 * s, screenPos.x + 10 * s, screenPos.y - 25 * s);
            ctx.lineTo(screenPos.x + 12 * s, screenPos.y + 3 * s);
            ctx.closePath();
            ctx.fill();

            // Inner darkness (hollow center)
            ctx.fillStyle = "#1a1a1a";
            ctx.beginPath();
            ctx.ellipse(screenPos.x - 2 * s, screenPos.y, 14 * s, 8 * s, 0, 0, Math.PI * 2);
            ctx.fill();

            // Spiral stair remains
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 8 * s, screenPos.y - 2 * s);
            ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 10 * s);
            ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 12 * s);
            ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 5 * s);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 12 * s);
            ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 20 * s);
            ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 22 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 15 * s);
            ctx.closePath();
            ctx.fill();

            // Broken top edge detail
            ctx.strokeStyle = stoneDark;
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 30 * s);
            ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 32 * s);
            ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 28 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 32 * s);
            ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 25 * s);
            ctx.stroke();

            // Rubble around base
            ctx.fillStyle = stoneDark;
            for (let r = 0; r < 6; r++) {
              const angle = r * 1.1 + 0.5;
              const rx = screenPos.x + Math.cos(angle) * 28 * s;
              const ry = screenPos.y + Math.sin(angle) * 14 * s + 3 * s;
              ctx.beginPath();
              ctx.ellipse(rx, ry, 4 * s, 2.5 * s, angle, 0, Math.PI * 2);
              ctx.fill();
            }

          } else {
            // VARIANT 4: Properly isometric 3D sunken temple ruins
            // Shadow already drawn above

            const stoneLight = "#8a8a7a";
            const stoneMid = "#6a6a5a";
            const stoneDark = "#4a4a3a";
            const stoneShadow = "#3a3a2a";
            const mossColor = "#3d5a3d";
            const vineColor = "#2d4a2d";
            const waterStainColor = "rgba(40, 80, 90, 0.25)";

            // Isometric floor/foundation - diamond shape
            const floorW = 38 * s;
            const floorD = 19 * s;

            // Floor shadow
            ctx.fillStyle = "rgba(30, 30, 20, 0.25)";
            ctx.beginPath();
            ctx.moveTo(screenPos.x - floorW, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x, screenPos.y - floorD + 8 * s);
            ctx.lineTo(screenPos.x + floorW, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x, screenPos.y + floorD + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Stone floor tiles (isometric grid)
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - floorW + 5 * s, screenPos.y + 3 * s);
            ctx.lineTo(screenPos.x, screenPos.y - floorD + 6 * s);
            ctx.lineTo(screenPos.x + floorW - 5 * s, screenPos.y + 3 * s);
            ctx.lineTo(screenPos.x, screenPos.y + floorD + 3 * s);
            ctx.closePath();
            ctx.fill();

            // Floor tile lines
            ctx.strokeStyle = stoneShadow;
            ctx.lineWidth = 0.5 * s;
            for (let i = -2; i <= 2; i++) {
              ctx.beginPath();
              ctx.moveTo(screenPos.x + i * 12 * s, screenPos.y - floorD + 6 * s + Math.abs(i) * 5 * s);
              ctx.lineTo(screenPos.x + i * 12 * s, screenPos.y + floorD + 3 * s - Math.abs(i) * 5 * s);
              ctx.stroke();
            }

            // === LEFT WALL (3D isometric box) ===
            const lWallX = screenPos.x - 28 * s;
            const lWallW = 14 * s;  // Width
            const lWallD = 7 * s;   // Depth  
            const lWallH = 38 * s;  // Height

            // Left wall - LEFT face (darkest, shadow)
            const leftFaceGrad = ctx.createLinearGradient(
              lWallX - lWallD, screenPos.y,
              lWallX, screenPos.y
            );
            leftFaceGrad.addColorStop(0, stoneShadow);
            leftFaceGrad.addColorStop(1, stoneDark);
            ctx.fillStyle = leftFaceGrad;
            ctx.beginPath();
            ctx.moveTo(lWallX - lWallD, screenPos.y + 8 * s);
            ctx.lineTo(lWallX - lWallD, screenPos.y - lWallH + 12 * s);
            // Broken top edge
            ctx.lineTo(lWallX - lWallD + 3 * s, screenPos.y - lWallH + 8 * s);
            ctx.lineTo(lWallX - lWallD + 5 * s, screenPos.y - lWallH + 14 * s);
            ctx.lineTo(lWallX, screenPos.y - lWallH + 5 * s);
            ctx.lineTo(lWallX, screenPos.y + 5 * s);
            ctx.closePath();
            ctx.fill();

            // Left wall - FRONT face (medium lit)
            const frontFaceGrad = ctx.createLinearGradient(
              lWallX, screenPos.y - lWallH,
              lWallX + lWallW, screenPos.y
            );
            frontFaceGrad.addColorStop(0, stoneMid);
            frontFaceGrad.addColorStop(0.5, stoneLight);
            frontFaceGrad.addColorStop(1, stoneMid);
            ctx.fillStyle = frontFaceGrad;
            ctx.beginPath();
            ctx.moveTo(lWallX, screenPos.y + 5 * s);
            ctx.lineTo(lWallX, screenPos.y - lWallH + 5 * s);
            // Broken top
            ctx.lineTo(lWallX + 4 * s, screenPos.y - lWallH);
            ctx.lineTo(lWallX + 8 * s, screenPos.y - lWallH + 8 * s);
            ctx.lineTo(lWallX + lWallW, screenPos.y - lWallH + 3 * s);
            ctx.lineTo(lWallX + lWallW, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Left wall - TOP face (brightest)
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(lWallX - lWallD, screenPos.y - lWallH + 12 * s);
            ctx.lineTo(lWallX - lWallD + 3 * s, screenPos.y - lWallH + 8 * s);
            ctx.lineTo(lWallX - lWallD + 5 * s, screenPos.y - lWallH + 14 * s);
            ctx.lineTo(lWallX, screenPos.y - lWallH + 5 * s);
            ctx.lineTo(lWallX + 4 * s, screenPos.y - lWallH);
            ctx.lineTo(lWallX + 8 * s, screenPos.y - lWallH + 8 * s);
            ctx.lineTo(lWallX + lWallW, screenPos.y - lWallH + 3 * s);
            ctx.lineTo(lWallX + lWallW - lWallD, screenPos.y - lWallH);
            ctx.closePath();
            ctx.fill();

            // Brick lines on left wall front face
            ctx.strokeStyle = stoneShadow;
            ctx.lineWidth = 0.5 * s;
            for (let row = 0; row < 6; row++) {
              const rowY = screenPos.y - lWallH + 15 * s + row * 7 * s;
              if (rowY < screenPos.y + 5 * s) {
                ctx.beginPath();
                ctx.moveTo(lWallX + 1 * s, rowY);
                ctx.lineTo(lWallX + lWallW - 1 * s, rowY + 2 * s);
                ctx.stroke();
              }
            }

            // Water stains on left wall
            ctx.fillStyle = waterStainColor;
            ctx.beginPath();
            ctx.moveTo(lWallX + 3 * s, screenPos.y - 15 * s);
            ctx.quadraticCurveTo(lWallX + 5 * s, screenPos.y - 5 * s, lWallX + 2 * s, screenPos.y + 3 * s);
            ctx.lineTo(lWallX + 6 * s, screenPos.y + 3 * s);
            ctx.quadraticCurveTo(lWallX + 8 * s, screenPos.y - 8 * s, lWallX + 7 * s, screenPos.y - 15 * s);
            ctx.closePath();
            ctx.fill();

            // === RIGHT WALL (3D isometric box) ===
            const rWallX = screenPos.x + 15 * s;
            const rWallW = 16 * s;
            const rWallD = 8 * s;
            const rWallH = 32 * s;

            // Right wall - BACK face (visible in iso)
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.moveTo(rWallX + rWallW, screenPos.y + 5 * s);
            ctx.lineTo(rWallX + rWallW, screenPos.y - rWallH + 8 * s);
            ctx.lineTo(rWallX + rWallW + rWallD, screenPos.y - rWallH + 5 * s);
            ctx.lineTo(rWallX + rWallW + rWallD, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Right wall - FRONT face (brightest)
            const rFrontGrad = ctx.createLinearGradient(
              rWallX, screenPos.y,
              rWallX + rWallW, screenPos.y - rWallH
            );
            rFrontGrad.addColorStop(0, stoneMid);
            rFrontGrad.addColorStop(0.4, stoneLight);
            rFrontGrad.addColorStop(1, stoneMid);
            ctx.fillStyle = rFrontGrad;
            ctx.beginPath();
            ctx.moveTo(rWallX, screenPos.y + 8 * s);
            ctx.lineTo(rWallX, screenPos.y - rWallH + 12 * s);
            // Broken top
            ctx.lineTo(rWallX + 5 * s, screenPos.y - rWallH + 5 * s);
            ctx.lineTo(rWallX + 10 * s, screenPos.y - rWallH + 10 * s);
            ctx.lineTo(rWallX + rWallW, screenPos.y - rWallH + 8 * s);
            ctx.lineTo(rWallX + rWallW, screenPos.y + 5 * s);
            ctx.closePath();
            ctx.fill();

            // Right wall - TOP face
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(rWallX, screenPos.y - rWallH + 12 * s);
            ctx.lineTo(rWallX + 5 * s, screenPos.y - rWallH + 5 * s);
            ctx.lineTo(rWallX + 10 * s, screenPos.y - rWallH + 10 * s);
            ctx.lineTo(rWallX + rWallW, screenPos.y - rWallH + 8 * s);
            ctx.lineTo(rWallX + rWallW + rWallD, screenPos.y - rWallH + 5 * s);
            ctx.lineTo(rWallX + rWallD, screenPos.y - rWallH + 9 * s);
            ctx.closePath();
            ctx.fill();

            // Brick lines on right wall
            ctx.strokeStyle = stoneShadow;
            for (let row = 0; row < 5; row++) {
              const rowY = screenPos.y - rWallH + 18 * s + row * 7 * s;
              if (rowY < screenPos.y + 5 * s) {
                ctx.beginPath();
                ctx.moveTo(rWallX + 1 * s, rowY + 1 * s);
                ctx.lineTo(rWallX + rWallW - 1 * s, rowY - 1 * s);
                ctx.stroke();
              }
            }

            // Ancient carved eye symbol on right wall
            ctx.strokeStyle = "#4a4a4a";
            ctx.lineWidth = 1.2 * s;
            ctx.beginPath();
            ctx.ellipse(rWallX + 8 * s, screenPos.y - 8 * s, 4 * s, 2.5 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(rWallX + 8 * s, screenPos.y - 8 * s, 1.2 * s, 0, Math.PI * 2);
            ctx.stroke();

            // === CENTRAL BROKEN COLUMN (3D cylinder) ===
            const colX = screenPos.x;
            const colY = screenPos.y;
            const colRadius = 7 * s;
            const colHeight = 42 * s;

            // Column shadow
            ctx.fillStyle = "rgba(30, 30, 20, 0.3)";
            ctx.beginPath();
            ctx.ellipse(colX + 4 * s, colY + 10 * s, colRadius + 4 * s, (colRadius + 4 * s) * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Column base (isometric ellipse)
            ctx.fillStyle = stoneMid;
            ctx.beginPath();
            ctx.ellipse(colX, colY + 6 * s, colRadius + 3 * s, (colRadius + 3 * s) * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Base rim shadow
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.ellipse(colX, colY + 8 * s, colRadius + 3 * s, (colRadius + 3 * s) * 0.5, 0, 0, Math.PI);
            ctx.fill();

            // Column body - back half (shadow)
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.ellipse(colX, colY + 4 * s, colRadius, colRadius * 0.5, 0, Math.PI, Math.PI * 2);
            ctx.lineTo(colX + colRadius, colY - colHeight + 15 * s);
            ctx.ellipse(colX, colY - colHeight + 15 * s, colRadius, colRadius * 0.5, 0, 0, Math.PI, true);
            ctx.closePath();
            ctx.fill();

            // Column body - front half (lit)
            const colFrontGrad = ctx.createLinearGradient(
              colX - colRadius, colY,
              colX + colRadius, colY
            );
            colFrontGrad.addColorStop(0, stoneMid);
            colFrontGrad.addColorStop(0.3, stoneLight);
            colFrontGrad.addColorStop(0.7, stoneMid);
            colFrontGrad.addColorStop(1, stoneDark);
            ctx.fillStyle = colFrontGrad;
            ctx.beginPath();
            ctx.ellipse(colX, colY + 4 * s, colRadius, colRadius * 0.5, 0, 0, Math.PI);
            ctx.lineTo(colX - colRadius, colY - colHeight + 15 * s);
            ctx.ellipse(colX, colY - colHeight + 15 * s, colRadius, colRadius * 0.5, 0, Math.PI, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            // Column top (broken, jagged)
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(colX - colRadius, colY - colHeight + 15 * s);
            ctx.lineTo(colX - colRadius + 3 * s, colY - colHeight + 8 * s);
            ctx.lineTo(colX - 2 * s, colY - colHeight + 12 * s);
            ctx.lineTo(colX + 2 * s, colY - colHeight + 5 * s);
            ctx.lineTo(colX + colRadius - 2 * s, colY - colHeight + 10 * s);
            ctx.lineTo(colX + colRadius, colY - colHeight + 15 * s);
            ctx.ellipse(colX, colY - colHeight + 15 * s, colRadius, colRadius * 0.5, 0, 0, Math.PI, true);
            ctx.closePath();
            ctx.fill();

            // Column fluting (vertical grooves)
            ctx.strokeStyle = stoneShadow;
            ctx.lineWidth = 0.8 * s;
            for (let fl = 0; fl < 5; fl++) {
              const flAngle = (fl / 5) * Math.PI - Math.PI / 2;
              const flX = colX + Math.cos(flAngle) * colRadius * 0.85;
              ctx.beginPath();
              ctx.moveTo(flX, colY + 3 * s);
              ctx.lineTo(flX, colY - colHeight + 16 * s);
              ctx.stroke();
            }

            // Highlight on column
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(colX - colRadius * 0.5, colY + 2 * s);
            ctx.lineTo(colX - colRadius * 0.5, colY - colHeight + 18 * s);
            ctx.stroke();

            // === RUBBLE (3D isometric rocks) ===
            const rubblePositions = [
              { x: -20, y: 8, size: 4 }, { x: -12, y: 10, size: 3 },
              { x: 5, y: 12, size: 5 }, { x: 15, y: 9, size: 3.5 },
              { x: 25, y: 11, size: 4 }, { x: -8, y: 7, size: 2.5 },
              { x: 32, y: 7, size: 3 }, { x: -32, y: 6, size: 3.5 }
            ];

            rubblePositions.forEach((rb, idx) => {
              const rx = screenPos.x + rb.x * s;
              const ry = screenPos.y + rb.y * s;
              const rSize = rb.size * s;

              // 3D rock - top face
              ctx.fillStyle = idx % 2 === 0 ? stoneLight : stoneMid;
              ctx.beginPath();
              ctx.moveTo(rx, ry - rSize * 0.8);
              ctx.lineTo(rx + rSize, ry - rSize * 0.3);
              ctx.lineTo(rx + rSize * 0.3, ry + rSize * 0.2);
              ctx.lineTo(rx - rSize * 0.7, ry - rSize * 0.2);
              ctx.closePath();
              ctx.fill();

              // Front face
              ctx.fillStyle = stoneMid;
              ctx.beginPath();
              ctx.moveTo(rx - rSize * 0.7, ry - rSize * 0.2);
              ctx.lineTo(rx + rSize * 0.3, ry + rSize * 0.2);
              ctx.lineTo(rx + rSize * 0.2, ry + rSize * 0.6);
              ctx.lineTo(rx - rSize * 0.6, ry + rSize * 0.3);
              ctx.closePath();
              ctx.fill();

              // Right face
              ctx.fillStyle = stoneDark;
              ctx.beginPath();
              ctx.moveTo(rx + rSize * 0.3, ry + rSize * 0.2);
              ctx.lineTo(rx + rSize, ry - rSize * 0.3);
              ctx.lineTo(rx + rSize * 0.8, ry + rSize * 0.2);
              ctx.lineTo(rx + rSize * 0.2, ry + rSize * 0.6);
              ctx.closePath();
              ctx.fill();
            });

            // === FALLEN COLUMN SEGMENT ===
            const fallX = screenPos.x + 26 * s;
            const fallY = screenPos.y + 4 * s;
            const fallR = 4 * s;
            const fallLen = 14 * s;

            // Cylinder lying on side (isometric)
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.ellipse(fallX + fallLen * 0.7, fallY - fallLen * 0.35, fallR, fallR * 0.5, 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Body
            const fallGrad = ctx.createLinearGradient(fallX, fallY - fallR, fallX, fallY + fallR);
            fallGrad.addColorStop(0, stoneLight);
            fallGrad.addColorStop(0.5, stoneMid);
            fallGrad.addColorStop(1, stoneDark);
            ctx.fillStyle = fallGrad;
            ctx.beginPath();
            ctx.moveTo(fallX, fallY - fallR * 0.5);
            ctx.lineTo(fallX + fallLen * 0.7, fallY - fallLen * 0.35 - fallR * 0.5);
            ctx.ellipse(fallX + fallLen * 0.7, fallY - fallLen * 0.35, fallR, fallR * 0.5, 0.8, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(fallX, fallY + fallR * 0.5);
            ctx.ellipse(fallX, fallY, fallR, fallR * 0.5, 0, Math.PI / 2, -Math.PI / 2, true);
            ctx.closePath();
            ctx.fill();

            // End cap
            ctx.fillStyle = stoneMid;
            ctx.beginPath();
            ctx.ellipse(fallX, fallY, fallR, fallR * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // === MOSS & VINES ===
            ctx.fillStyle = mossColor;
            ctx.globalAlpha = 0.75;
            // Moss on left wall
            ctx.beginPath();
            ctx.ellipse(lWallX + 5 * s, screenPos.y - 12 * s, 5 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
            ctx.fill();
            // Moss on column
            ctx.beginPath();
            ctx.ellipse(colX - 3 * s, colY - 20 * s, 4 * s, 2 * s, -0.3, 0, Math.PI * 2);
            ctx.fill();
            // Moss on floor
            ctx.beginPath();
            ctx.ellipse(screenPos.x + 8 * s, screenPos.y + 5 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Hanging vines
            ctx.strokeStyle = vineColor;
            ctx.lineWidth = 1.5 * s;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(lWallX + 8 * s, screenPos.y - lWallH + 10 * s);
            ctx.quadraticCurveTo(lWallX + 5 * s, screenPos.y - 15 * s, lWallX + 10 * s, screenPos.y - 5 * s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(colX + 3 * s, colY - colHeight + 10 * s);
            ctx.quadraticCurveTo(colX + 10 * s, colY - 25 * s, colX + 6 * s, colY - 10 * s);
            ctx.stroke();

            // Vine leaves
            ctx.fillStyle = mossColor;
            const leaves = [
              { x: lWallX + 6 * s, y: screenPos.y - 18 * s },
              { x: lWallX + 9 * s, y: screenPos.y - 10 * s },
              { x: colX + 8 * s, y: colY - 22 * s },
              { x: colX + 7 * s, y: colY - 15 * s }
            ];
            leaves.forEach(lf => {
              ctx.beginPath();
              ctx.ellipse(lf.x, lf.y, 2.5 * s, 1.2 * s, 0.5, 0, Math.PI * 2);
              ctx.fill();
            });

            // Cracks in stonework
            ctx.strokeStyle = "#2a2a1a";
            ctx.lineWidth = 0.8 * s;
            ctx.beginPath();
            ctx.moveTo(lWallX + 3 * s, screenPos.y - 8 * s);
            ctx.lineTo(lWallX + 6 * s, screenPos.y - 3 * s);
            ctx.lineTo(lWallX + 4 * s, screenPos.y + 2 * s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(rWallX + 5 * s, screenPos.y - 15 * s);
            ctx.lineTo(rWallX + 8 * s, screenPos.y - 10 * s);
            ctx.stroke();
          }
          break;
        }
        case "bones":
          ctx.fillStyle = "#e8e0d0";
          // Skull
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 3 * s, 6 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 2 * s,
            screenPos.y - 4 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            screenPos.x + 2 * s,
            screenPos.y - 4 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Bones
          ctx.fillStyle = "#d8d0c0";
          ctx.save();
          ctx.translate(screenPos.x, screenPos.y);
          ctx.rotate(rotation);
          ctx.fillRect(-12 * s, 2 * s, 24 * s, 3 * s);
          ctx.beginPath();
          ctx.arc(-12 * s, 3.5 * s, 2 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(12 * s, 3.5 * s, 2 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        case "torch":
          // Stand
          ctx.fillStyle = "#4a3a2a";
          ctx.fillRect(
            screenPos.x - 2 * s,
            screenPos.y - 20 * s,
            4 * s,
            25 * s
          );
          // Flame
          const flameFlicker = Math.sin(decorTime * 8) * 2 * s;
          ctx.fillStyle = "#ff4400";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 20 * s);
          ctx.quadraticCurveTo(
            screenPos.x + flameFlicker,
            screenPos.y - 35 * s,
            screenPos.x + 5 * s,
            screenPos.y - 20 * s
          );
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#ff8800";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 3 * s, screenPos.y - 20 * s);
          ctx.quadraticCurveTo(
            screenPos.x - flameFlicker * 0.5,
            screenPos.y - 30 * s,
            screenPos.x + 3 * s,
            screenPos.y - 20 * s
          );
          ctx.closePath();
          ctx.fill();
          // Glow
          ctx.fillStyle = `rgba(255,150,50,${0.15 + Math.sin(decorTime * 6) * 0.05
            })`;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 25 * s, 20 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "statue": {
          // Grayscale stone statue with raised sword
          const stoneLight = "#a8a8a8";
          const stoneMid = "#888888";
          const stoneDark = "#686868";
          const stoneShadow = "#484848";
          const figureHighlight = "#b0b0b0";
          const figureLight = "#909090";
          const figureMid = "#707070";
          const figureDark = "#505050";
          const figureShadow = "#383838";
          const steelLight = "#c8c8c8";
          const steelDark = "#606060";

          // Ground shadow
          const statueShadowGrad = ctx.createRadialGradient(
            screenPos.x + 4 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 4 * s, screenPos.y + 8 * s, 25 * s
          );
          statueShadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
          statueShadowGrad.addColorStop(0.5, "rgba(0,0,0,0.15)");
          statueShadowGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = statueShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 4 * s, screenPos.y + 8 * s, 22 * s, 11 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // ========== STONE PEDESTAL (3-tier, bottom to top) ==========
          const baseY = screenPos.y + 5 * s;

          // === BOTTOM TIER (largest) ===
          const tier1W = 16 * s;
          const tier1H = 6 * s;
          // Top surface
          ctx.fillStyle = stoneLight;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - tier1W, baseY - tier1H);
          ctx.lineTo(screenPos.x, baseY - tier1H - tier1W * 0.5);
          ctx.lineTo(screenPos.x + tier1W, baseY - tier1H);
          ctx.lineTo(screenPos.x, baseY - tier1H + tier1W * 0.5);
          ctx.closePath();
          ctx.fill();
          // Left face
          ctx.fillStyle = stoneMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - tier1W, baseY - tier1H);
          ctx.lineTo(screenPos.x - tier1W, baseY);
          ctx.lineTo(screenPos.x, baseY + tier1W * 0.5);
          ctx.lineTo(screenPos.x, baseY - tier1H + tier1W * 0.5);
          ctx.closePath();
          ctx.fill();
          // Right face
          ctx.fillStyle = stoneDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + tier1W, baseY - tier1H);
          ctx.lineTo(screenPos.x + tier1W, baseY);
          ctx.lineTo(screenPos.x, baseY + tier1W * 0.5);
          ctx.lineTo(screenPos.x, baseY - tier1H + tier1W * 0.5);
          ctx.closePath();
          ctx.fill();

          // === MIDDLE TIER ===
          const tier2Y = baseY - tier1H;
          const tier2W = 12 * s;
          const tier2H = 10 * s;
          // Top surface
          ctx.fillStyle = stoneLight;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - tier2W, tier2Y - tier2H);
          ctx.lineTo(screenPos.x, tier2Y - tier2H - tier2W * 0.5);
          ctx.lineTo(screenPos.x + tier2W, tier2Y - tier2H);
          ctx.lineTo(screenPos.x, tier2Y - tier2H + tier2W * 0.5);
          ctx.closePath();
          ctx.fill();
          // Left face
          ctx.fillStyle = stoneMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - tier2W, tier2Y - tier2H);
          ctx.lineTo(screenPos.x - tier2W, tier2Y);
          ctx.lineTo(screenPos.x, tier2Y + tier2W * 0.5);
          ctx.lineTo(screenPos.x, tier2Y - tier2H + tier2W * 0.5);
          ctx.closePath();
          ctx.fill();
          // Right face
          ctx.fillStyle = stoneDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + tier2W, tier2Y - tier2H);
          ctx.lineTo(screenPos.x + tier2W, tier2Y);
          ctx.lineTo(screenPos.x, tier2Y + tier2W * 0.5);
          ctx.lineTo(screenPos.x, tier2Y - tier2H + tier2W * 0.5);
          ctx.closePath();
          ctx.fill();

          // Decorative line on middle tier
          ctx.strokeStyle = stoneShadow;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - tier2W + 2 * s, tier2Y - tier2H * 0.5);
          ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.5 + tier2W * 0.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(screenPos.x + tier2W - 2 * s, tier2Y - tier2H * 0.5);
          ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.5 + tier2W * 0.4);
          ctx.stroke();

          // === TOP TIER (smallest, figure stands on this) ===
          const tier3Y = tier2Y - tier2H;
          const tier3W = 8 * s;
          const tier3H = 4 * s;
          // Top surface
          ctx.fillStyle = stoneLight;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - tier3W, tier3Y - tier3H);
          ctx.lineTo(screenPos.x, tier3Y - tier3H - tier3W * 0.5);
          ctx.lineTo(screenPos.x + tier3W, tier3Y - tier3H);
          ctx.lineTo(screenPos.x, tier3Y - tier3H + tier3W * 0.5);
          ctx.closePath();
          ctx.fill();
          // Left face
          ctx.fillStyle = stoneMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - tier3W, tier3Y - tier3H);
          ctx.lineTo(screenPos.x - tier3W, tier3Y);
          ctx.lineTo(screenPos.x, tier3Y + tier3W * 0.5);
          ctx.lineTo(screenPos.x, tier3Y - tier3H + tier3W * 0.5);
          ctx.closePath();
          ctx.fill();
          // Right face
          ctx.fillStyle = stoneDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + tier3W, tier3Y - tier3H);
          ctx.lineTo(screenPos.x + tier3W, tier3Y);
          ctx.lineTo(screenPos.x, tier3Y + tier3W * 0.5);
          ctx.lineTo(screenPos.x, tier3Y - tier3H + tier3W * 0.5);
          ctx.closePath();
          ctx.fill();

          // ========== STONE FIGURE ==========
          const figureBase = tier3Y - tier3H;

          // Legs/Robe base
          ctx.fillStyle = figureDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, figureBase);
          ctx.lineTo(screenPos.x - 6 * s, figureBase - 18 * s);
          ctx.lineTo(screenPos.x, figureBase - 20 * s);
          ctx.lineTo(screenPos.x, figureBase);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = figureMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 5 * s, figureBase);
          ctx.lineTo(screenPos.x + 6 * s, figureBase - 18 * s);
          ctx.lineTo(screenPos.x, figureBase - 20 * s);
          ctx.lineTo(screenPos.x, figureBase);
          ctx.closePath();
          ctx.fill();

          // Torso
          ctx.fillStyle = figureDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, figureBase - 18 * s);
          ctx.lineTo(screenPos.x - 4 * s, figureBase - 32 * s);
          ctx.lineTo(screenPos.x, figureBase - 34 * s);
          ctx.lineTo(screenPos.x, figureBase - 20 * s);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = figureMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 5 * s, figureBase - 18 * s);
          ctx.lineTo(screenPos.x + 4 * s, figureBase - 32 * s);
          ctx.lineTo(screenPos.x, figureBase - 34 * s);
          ctx.lineTo(screenPos.x, figureBase - 20 * s);
          ctx.closePath();
          ctx.fill();

          // Cape flowing back
          ctx.fillStyle = figureShadow;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 4 * s, figureBase - 30 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 12 * s, figureBase - 25 * s,
            screenPos.x - 10 * s, figureBase - 12 * s
          );
          ctx.lineTo(screenPos.x - 6 * s, figureBase - 18 * s);
          ctx.closePath();
          ctx.fill();

          // Left arm (holding shield at side)
          ctx.fillStyle = figureDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 4 * s, figureBase - 30 * s);
          ctx.lineTo(screenPos.x - 8 * s, figureBase - 20 * s);
          ctx.lineTo(screenPos.x - 6 * s, figureBase - 19 * s);
          ctx.lineTo(screenPos.x - 3 * s, figureBase - 28 * s);
          ctx.closePath();
          ctx.fill();

          // Shield at side
          ctx.fillStyle = figureMid;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 10 * s, figureBase - 18 * s, 5 * s, 7 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = figureLight;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 10 * s, figureBase - 18 * s, 3 * s, 4.5 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = figureDark;
          ctx.beginPath();
          ctx.arc(screenPos.x - 10 * s, figureBase - 18 * s, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();

          // Right arm (raised high, holding sword)
          ctx.fillStyle = figureMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 3 * s, figureBase - 30 * s);
          ctx.lineTo(screenPos.x + 10 * s, figureBase - 45 * s);
          ctx.lineTo(screenPos.x + 12 * s, figureBase - 43 * s);
          ctx.lineTo(screenPos.x + 5 * s, figureBase - 28 * s);
          ctx.closePath();
          ctx.fill();

          // Hand gripping sword
          ctx.fillStyle = figureLight;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 11 * s, figureBase - 44 * s, 2 * s, 1.5 * s, 0.7, 0, Math.PI * 2);
          ctx.fill();

          // Sword blade (raised high)
          ctx.fillStyle = steelLight;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 10 * s, figureBase - 46 * s);
          ctx.lineTo(screenPos.x + 8 * s, figureBase - 70 * s);
          ctx.lineTo(screenPos.x + 10 * s, figureBase - 72 * s);
          ctx.lineTo(screenPos.x + 12 * s, figureBase - 70 * s);
          ctx.lineTo(screenPos.x + 12 * s, figureBase - 46 * s);
          ctx.closePath();
          ctx.fill();
          // Blade dark edge
          ctx.fillStyle = steelDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 10 * s, figureBase - 46 * s);
          ctx.lineTo(screenPos.x + 8 * s, figureBase - 70 * s);
          ctx.lineTo(screenPos.x + 10 * s, figureBase - 72 * s);
          ctx.lineTo(screenPos.x + 10 * s, figureBase - 46 * s);
          ctx.closePath();
          ctx.fill();
          // Blade highlight
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 11 * s, figureBase - 48 * s);
          ctx.lineTo(screenPos.x + 10 * s, figureBase - 68 * s);
          ctx.lineTo(screenPos.x + 11 * s, figureBase - 68 * s);
          ctx.lineTo(screenPos.x + 11.5 * s, figureBase - 48 * s);
          ctx.closePath();
          ctx.fill();

          // Sword crossguard
          ctx.fillStyle = figureDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 7 * s, figureBase - 45 * s);
          ctx.lineTo(screenPos.x + 15 * s, figureBase - 47 * s);
          ctx.lineTo(screenPos.x + 15 * s, figureBase - 45 * s);
          ctx.lineTo(screenPos.x + 7 * s, figureBase - 43 * s);
          ctx.closePath();
          ctx.fill();

          // Head
          const headY = figureBase - 38 * s;
          const headGrad = ctx.createRadialGradient(
            screenPos.x - 1 * s, headY - 2 * s, 0,
            screenPos.x, headY, 6 * s
          );
          headGrad.addColorStop(0, figureHighlight);
          headGrad.addColorStop(0.4, figureLight);
          headGrad.addColorStop(0.8, figureMid);
          headGrad.addColorStop(1, figureDark);
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, headY, 5 * s, 6 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Helmet
          ctx.fillStyle = figureDark;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, headY - 3 * s, 5.5 * s, 3.5 * s, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          // Helmet crest
          ctx.fillStyle = figureShadow;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, headY - 6 * s);
          ctx.lineTo(screenPos.x - 1 * s, headY - 3 * s);
          ctx.lineTo(screenPos.x + 1 * s, headY - 3 * s);
          ctx.closePath();
          ctx.fill();

          // Face features (subtle)
          ctx.fillStyle = figureShadow;
          ctx.beginPath();
          ctx.arc(screenPos.x - 1.5 * s, headY - 1 * s, 0.7 * s, 0, Math.PI * 2);
          ctx.arc(screenPos.x + 1.5 * s, headY - 1 * s, 0.7 * s, 0, Math.PI * 2);
          ctx.fill();

          // Highlights
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 2 * s, headY - 3 * s, 2 * s, 1.5 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 2 * s, figureBase - 28 * s, 1.5 * s, 3 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Pedestal plaque
          ctx.fillStyle = figureDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 6 * s, tier2Y - tier2H * 0.3);
          ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.3 + 3 * s);
          ctx.lineTo(screenPos.x + 6 * s, tier2Y - tier2H * 0.3);
          ctx.lineTo(screenPos.x, tier2Y - tier2H * 0.3 - 3 * s);
          ctx.closePath();
          ctx.fill();
          break;
        }
      }
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
    // EPIC ISOMETRIC BUFF AURA (Dynamic Color: Red for Damage, Blue for Range)
    // =========================================================================
    towers.forEach((t) => {
      const hasDamageBuff = t.damageBoost && t.damageBoost > 1;
      const hasRangeBuff = t.rangeBoost && t.rangeBoost > 1;

      // If no buff is active, don't render the aura
      if (!hasDamageBuff && !hasRangeBuff && !t.isBuffed) return;

      // Color Configuration logic
      // Priority: Damage (Red) > Range (Blue)
      // Account for having both (purple)
      const theme = hasDamageBuff
        ? hasRangeBuff
          ? {
            base: "128, 0, 255", // Purple
            accent: "178, 102, 255",
            glow: "#A500FF",
            fill: "rgba(128, 0, 255, 0.05)",
          }
          : {
            base: "255, 23, 68", // Red
            accent: "255, 138, 128",
            glow: "#FF1744",
            fill: "rgba(255, 23, 68, 0.05)",
          }
        : {
          base: "0, 229, 255", // Cyan/Blue
          accent: "128, 255, 255",
          glow: "#00E5FF",
          fill: "rgba(0, 229, 255, 0.05)",
        };

      const time = Date.now() / 1000;
      const sPos = toScreen(gridToWorld(t.pos));
      const s = cameraZoom;

      // Calculate dynamic pulse
      const pulse = Math.sin(time * 4) * 0.05;
      const opacity = 0.5 + Math.sin(time * 2) * 0.2;

      ctx.save();
      ctx.translate(sPos.x, sPos.y);

      // IMPORTANT: Squish everything into isometric perspective (2:1 ratio)
      ctx.scale(1, 0.5);

      // --- 1. Soft Core Glow (No rotation) ---
      const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 40 * s);
      innerGlow.addColorStop(0, `rgba(${theme.base}, ${0.4 * opacity})`);
      innerGlow.addColorStop(1, `rgba(${theme.base}, 0)`);
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 45 * s, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. Outer Orbiting Ring (Counter-Clockwise) ---
      ctx.save();
      ctx.rotate(-time * 0.5);
      ctx.strokeStyle = `rgba(${theme.base}, ${0.6 * opacity})`;
      ctx.lineWidth = 2 * s;
      ctx.setLineDash([15 * s, 10 * s]);
      ctx.beginPath();
      ctx.arc(0, 0, 40 * s * (1 + pulse), 0, Math.PI * 2);
      ctx.stroke();

      // Add small dots on the outer ring
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(40 * s * (1 + pulse), 0, 2 * s, 0, Math.PI * 2);
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

      ctx.lineWidth = 1.5 * s;
      // Double triangle (Star of David style)
      drawTriangle(28 * s, `rgba(${theme.accent}, ${0.8 * opacity})`);
      ctx.rotate(Math.PI);
      drawTriangle(28 * s, `rgba(${theme.accent}, ${0.8 * opacity})`);

      ctx.fillStyle = theme.fill;
      ctx.fill();
      ctx.restore();

      // --- 4. Inner Orbitals (Floating Particles) ---
      ctx.save();
      ctx.rotate(time * 1.5);
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        const orbitDist = 18 * s + Math.sin(time * 3 + i) * 5 * s;
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 10 * s;
        ctx.shadowColor = theme.glow;
        ctx.beginPath();
        ctx.arc(orbitDist, 0, 3 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

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
          // EPIC ANIMATED SPECIAL TOWERS
          const spec = r.data as { type: string; pos: Position; hp?: number };
          const sPos = toScreen(gridToWorld(spec.pos));
          const s = cameraZoom;
          const time = Date.now() / 1000;

          ctx.save();
          ctx.translate(sPos.x, sPos.y);

          switch (spec.type) {
            case "beacon": {
              const time = Date.now() / 1000;
              const s2 = s * 1.1;
              const pulse = Math.sin(time * 3) * 0.5 + 0.5;

              // Isometric Constants
              const w = 22 * s2;
              const h = 55 * s2; // Slightly shorter for better grounding
              const tanA = Math.tan(Math.PI / 6);

              // 1. Ground Shadow (Tucked up to ground the base better)
              ctx.fillStyle = "rgba(0,0,0,0.35)";
              ctx.beginPath();
              ctx.ellipse(0, 0, 32 * s2, 16 * s2, 0, 0, Math.PI * 2);
              ctx.fill();

              // 2. Lighter Tiered Granite Pedestal
              const drawHex = (
                hw: number,
                hh: number,
                y: number,
                c1: string,
                c2: string,
                c3: string
              ) => {
                ctx.save();
                ctx.translate(0, y + 4 * s2); // Lowered by 4s for better grounding
                // Left Side (Shadow)
                ctx.fillStyle = c1;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-hw, -hw * tanA);
                ctx.lineTo(-hw, -hw * tanA - hh);
                ctx.lineTo(0, -hh);
                ctx.fill();
                // Right Side (Mid)
                ctx.fillStyle = c2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(hw, -hw * tanA);
                ctx.lineTo(hw, -hw * tanA - hh);
                ctx.lineTo(0, -hh);
                ctx.fill();
                // Top face (Highlight)
                ctx.fillStyle = c3;
                ctx.beginPath();
                ctx.moveTo(0, -hh);
                ctx.lineTo(-hw, -hw * tanA - hh);
                ctx.lineTo(0, -hw * tanA * 2 - hh);
                ctx.lineTo(hw, -hw * tanA - hh);
                ctx.fill();
                ctx.restore();
              };

              // Shifted colors from dark slate to light granite
              drawHex(w, 8 * s2, 8 * s2, "#78909C", "#90A4AE", "#B0BEC5"); // Bottom Tier
              drawHex(w * 0.7, 6 * s2, -4 * s2, "#546E7A", "#78909C", "#CFD8DC"); // Top Tier

              // 3. The Spire (Lighter Faceted Monolith)
              const spireW = 11 * s2;
              const spireH = 55 * s2;
              const topY = -9 * s2; // Moved DOWN from -15s

              // Spire Left Face
              ctx.fillStyle = "#546E7A";
              ctx.beginPath();
              ctx.moveTo(0, topY);
              ctx.lineTo(-spireW, topY - spireW * tanA);
              ctx.lineTo(-spireW * 0.6, topY - spireW * tanA - spireH);
              ctx.lineTo(0, topY - spireH);
              ctx.fill();

              // Spire Right Face
              ctx.fillStyle = "#78909C";
              ctx.beginPath();
              ctx.moveTo(0, topY);
              ctx.lineTo(spireW, topY - spireW * tanA);
              ctx.lineTo(spireW * 0.6, topY - spireW * tanA - spireH);
              ctx.lineTo(0, topY - spireH);
              ctx.fill();

              // 4. ADVANCED VARIED RUNES
              ctx.save();
              ctx.shadowBlur = 12 * s2;
              ctx.shadowColor = "#00E5FF";
              ctx.strokeStyle = `rgba(128, 255, 255, ${0.4 + pulse * 0.6})`;
              ctx.lineWidth = 1.8 * s2;
              ctx.lineCap = "round";

              for (let f = 0; f < 2; f++) {
                const side = f === 0 ? -1 : 1;
                const scroll = (time * 12) % 40;

                for (let r = 0; r < 4; r++) {
                  const rY = topY - 10 * s2 - r * 15 * s2 + scroll;
                  // Only draw if within monolith bounds
                  if (rY > topY || rY < topY - spireH + 5 * s2) continue;

                  const xOff = side * (spireW * 0.5);
                  const yOff = rY + Math.abs(xOff) * tanA;

                  ctx.save();
                  ctx.translate(xOff, yOff);

                  // Varied Glyph Logic (Draws different shapes based on index 'r')
                  ctx.beginPath();
                  if (r % 4 === 0) {
                    // Diamond Rune
                    ctx.moveTo(0, -4 * s2);
                    ctx.lineTo(2 * s2, -2 * s2);
                    ctx.lineTo(0, 0);
                    ctx.lineTo(-2 * s2, -2 * s2);
                    ctx.closePath();
                  } else if (r % 4 === 1) {
                    // Forked Rune
                    ctx.moveTo(-2 * s2, 0);
                    ctx.lineTo(0, -4 * s2);
                    ctx.lineTo(2 * s2, 0);
                    ctx.moveTo(0, -4 * s2);
                    ctx.lineTo(0, -1 * s2);
                  } else if (r % 4 === 2) {
                    // Triple-Dot Rune
                    ctx.moveTo(-2 * s2, -2 * s2);
                    ctx.lineTo(2 * s2, -2 * s2);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -1 * s2);
                  } else {
                    // Circle-Cross
                    ctx.arc(0, -2 * s2, 2 * s2, 0, Math.PI * 2);
                  }
                  ctx.stroke();
                  ctx.restore();
                }
              }
              ctx.restore();

              // 5. Orbital Energy Rings (Cyan glow)
              for (let r = 0; r < 2; r++) {
                ctx.save();
                const ringY =
                  topY - 15 * s2 - r * 22 * s2 + Math.sin(time + r) * 4 * s2;
                ctx.translate(0, ringY);
                ctx.scale(1, 0.5);
                ctx.rotate(time * (r === 0 ? 0.7 : -1.2));

                ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 + pulse * 0.3})`;
                ctx.lineWidth = 2.5 * s2;
                ctx.setLineDash([10 * s2, 20 * s2]);
                ctx.beginPath();
                ctx.arc(0, 0, 20 * s2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
              }

              // 6. The Core Pulse Sphere
              const coreY = topY - spireH - 12 * s2 + Math.sin(time * 2.5) * 6 * s2;

              // Brighter multi-layer glow
              const coreGlow = ctx.createRadialGradient(
                0,
                coreY,
                0,
                0,
                coreY,
                15 * s2
              );
              coreGlow.addColorStop(0, "#FFFFFF");
              coreGlow.addColorStop(0.2, "#E0F7FA");
              coreGlow.addColorStop(0.5, "#00E5FF");
              coreGlow.addColorStop(1, "transparent");

              ctx.save();
              ctx.shadowBlur = 30 * s2;
              ctx.shadowColor = "#00E5FF";
              ctx.fillStyle = coreGlow;
              ctx.beginPath();
              ctx.arc(0, coreY, 15 * s2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              // 7. Occasional Energy "Leaks" (Arcs)
              if (Math.random() > 0.92) {
                ctx.strokeStyle = "white";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, topY - spireH);
                ctx.lineTo(
                  (Math.random() - 0.5) * 20,
                  coreY + (Math.random() - 0.5) * 20
                );
                ctx.stroke();
              }
              break;
            }

            case "vault": {
              const hpPct =
                specialTowerHp !== null && spec.hp ? specialTowerHp / spec.hp : 1;
              const isFlashing = vaultFlash > 0;
              const time = Date.now() / 1000;
              const s2 = s * 1.2;

              // Isometric constants
              const w = 26 * s2;
              const h = 36 * s2;
              const angle = Math.PI / 6;
              const tanAngle = Math.tan(angle);
              const roofOffset = w * tanAngle * 2;

              // --- 0. Ground Shadow ---
              ctx.fillStyle = "rgba(0,0,0,0.4)";
              ctx.beginPath();
              ctx.ellipse(0, -w * tanAngle, 38 * s2, 20 * s2, 0, 0, Math.PI * 2);
              ctx.fill();

              // =========================================================================
              // STATE: DESTROYED (HP <= 0)
              // =========================================================================
              if (
                hpPct <= 0 ||
                spec.hp === 0 ||
                (spec.hp !== undefined && specialTowerHp === null)
              ) {
                // Wrecked stone base
                ctx.fillStyle = "#3D3D3D";
                ctx.beginPath();
                ctx.moveTo(-w - 5 * s2, 0);
                ctx.lineTo(0, 10 * s2);
                ctx.lineTo(w + 8 * s2, 2 * s2);
                ctx.lineTo(0, -10 * s2);
                ctx.fill();

                // Crumpled structure interior
                ctx.fillStyle = "#1a1a1a";
                ctx.beginPath();
                ctx.moveTo(-w * 0.8, -h * 0.2);
                ctx.lineTo(w * 0.9, -h * 0.1);
                ctx.lineTo(w * 0.9, -h - roofOffset * 0.8);
                ctx.lineTo(-w * 0.8, -h - roofOffset * 0.6);
                ctx.fill();

                // Broken Left Face
                ctx.fillStyle = "#4A4A4A";
                ctx.beginPath();
                ctx.moveTo(0, 5 * s2);
                ctx.lineTo(-w, -w * tanAngle + 2 * s2);
                ctx.lineTo(-w * 0.9, -h * 0.5);
                ctx.lineTo(-w * 1.1, -h - roofOffset * 0.5);
                ctx.lineTo(0, -h - 5 * s2);
                ctx.fill();

                // Vault Door hanging off
                ctx.save();
                ctx.translate(w * 0.8, -h * 0.4);
                ctx.rotate(Math.PI / 8);
                ctx.fillStyle = "#5A5A5A";
                ctx.fillRect(-12 * s2, -18 * s2, 24 * s2, 36 * s2);
                ctx.fillStyle = "#2D2D2D";
                ctx.beginPath();
                ctx.arc(0, -5 * s2, 6 * s2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Smoke
                ctx.fillStyle = "rgba(80, 80, 80, 0.4)";
                for (let i = 0; i < 3; i++) {
                  const smokeOffset = (time * 2 + i * 1.5) % 4;
                  const smokeX = Math.sin(time + i) * 10 * s2;
                  ctx.beginPath();
                  ctx.arc(
                    smokeX,
                    -h - roofOffset - smokeOffset * 15 * s2,
                    (5 + smokeOffset * 3) * s2,
                    0,
                    Math.PI * 2
                  );
                  ctx.fill();
                }
                break;
              }

              // =========================================================================
              // STATE: ACTIVE VAULT
              // =========================================================================

              // Duller Color Palette (Aged Bronze/Iron)
              const c = isFlashing
                ? {
                  baseLight: "#E8E8E8",
                  baseDark: "#C0C0C0",
                  wallLeft: "#D4A5A5",
                  wallRight: "#E8BFBF",
                  wallTop: "#F0D0D0",
                  frame: "#CC8080",
                  trim: "#B06060",
                  dark: "#6B3030",
                  accent: "#FFFFFF",
                  glow: "#FF6B6B",
                }
                : {
                  baseLight: "#5D5D5D",      // Stone gray
                  baseDark: "#3D3D3D",       // Dark stone
                  wallLeft: "#6B5D4D",       // Aged bronze shadow
                  wallRight: "#8B7355",      // Aged bronze lit
                  wallTop: "#9D8B73",        // Bronze top
                  frame: "#5C4A3A",          // Dark iron frame
                  trim: "#786048",           // Bronze trim
                  dark: "#2D2420",           // Very dark bronze
                  accent: "#A08060",         // Warm bronze accent
                  glow: "#5A9080",           // Muted teal glow
                };

              // --- 1. Stone Foundation Base ---
              const baseH = 8 * s2;

              // Base left face
              const baseGradL = ctx.createLinearGradient(-w - 4 * s2, 0, 0, 0);
              baseGradL.addColorStop(0, "#2D2D2D");
              baseGradL.addColorStop(1, "#3D3D3D");
              ctx.fillStyle = baseGradL;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(-w - 4 * s2, -w * tanAngle - 2 * s2);
              ctx.lineTo(-w - 4 * s2, -w * tanAngle - 2 * s2 - baseH);
              ctx.lineTo(0, -baseH);
              ctx.fill();

              // Base right face
              const baseGradR = ctx.createLinearGradient(0, 0, w + 4 * s2, 0);
              baseGradR.addColorStop(0, "#4D4D4D");
              baseGradR.addColorStop(1, "#3D3D3D");
              ctx.fillStyle = baseGradR;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(w + 4 * s2, -w * tanAngle - 2 * s2);
              ctx.lineTo(w + 4 * s2, -w * tanAngle - 2 * s2 - baseH);
              ctx.lineTo(0, -baseH);
              ctx.fill();

              // Base top face
              ctx.fillStyle = "#454545";
              ctx.beginPath();
              ctx.moveTo(0, -baseH);
              ctx.lineTo(-w - 4 * s2, -w * tanAngle - 2 * s2 - baseH);
              ctx.lineTo(0, -w * tanAngle * 2 - 4 * s2 - baseH);
              ctx.lineTo(w + 4 * s2, -w * tanAngle - 2 * s2 - baseH);
              ctx.closePath();
              ctx.fill();

              // Stone block lines on base
              ctx.strokeStyle = "rgba(0,0,0,0.2)";
              ctx.lineWidth = 1 * s2;
              ctx.beginPath();
              ctx.moveTo(-w * 0.5 - 2 * s2, -w * tanAngle * 0.5 - 1 * s2 - baseH * 0.5);
              ctx.lineTo(0, -baseH * 0.5);
              ctx.lineTo(w * 0.5 + 2 * s2, -w * tanAngle * 0.5 - 1 * s2 - baseH * 0.5);
              ctx.stroke();

              // --- 2. Main Vault Body ---
              const bodyY = -baseH;

              // Front-Left Face (Shadow Side) with gradient
              const wallGradL = ctx.createLinearGradient(-w, bodyY - w * tanAngle, 0, bodyY);
              wallGradL.addColorStop(0, "#5A4A3A");
              wallGradL.addColorStop(0.5, c.wallLeft);
              wallGradL.addColorStop(1, "#7A6A5A");
              ctx.fillStyle = wallGradL;
              ctx.beginPath();
              ctx.moveTo(0, bodyY);
              ctx.lineTo(-w, bodyY - w * tanAngle);
              ctx.lineTo(-w, bodyY - w * tanAngle - h);
              ctx.lineTo(0, bodyY - h);
              ctx.closePath();
              ctx.fill();

              // Front-Right Face (Lit Side) with gradient
              const wallGradR = ctx.createLinearGradient(0, bodyY, w, bodyY - w * tanAngle);
              wallGradR.addColorStop(0, "#9A8A75");
              wallGradR.addColorStop(0.5, c.wallRight);
              wallGradR.addColorStop(1, "#7A6A55");
              ctx.fillStyle = wallGradR;
              ctx.beginPath();
              ctx.moveTo(0, bodyY);
              ctx.lineTo(w, bodyY - w * tanAngle);
              ctx.lineTo(w, bodyY - w * tanAngle - h);
              ctx.lineTo(0, bodyY - h);
              ctx.closePath();
              ctx.fill();

              // Top Face with gradient
              const topGrad = ctx.createLinearGradient(0, bodyY - h - roofOffset, 0, bodyY - h);
              topGrad.addColorStop(0, "#A89878");
              topGrad.addColorStop(1, c.wallTop);
              ctx.fillStyle = topGrad;
              ctx.beginPath();
              ctx.moveTo(0, bodyY - h);
              ctx.lineTo(-w, bodyY - w * tanAngle - h);
              ctx.lineTo(0, bodyY - roofOffset - h);
              ctx.lineTo(w, bodyY - w * tanAngle - h);
              ctx.closePath();
              ctx.fill();

              // --- 3. Decorative Wall Panels ---
              // Left wall inset panel
              ctx.fillStyle = "rgba(0,0,0,0.15)";
              ctx.beginPath();
              ctx.moveTo(-3 * s2, bodyY - h * 0.15);
              ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
              ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
              ctx.lineTo(-3 * s2, bodyY - h + 5 * s2);
              ctx.closePath();
              ctx.fill();

              // Right wall inset panel
              ctx.fillStyle = "rgba(0,0,0,0.1)";
              ctx.beginPath();
              ctx.moveTo(3 * s2, bodyY - h * 0.15);
              ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
              ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
              ctx.lineTo(3 * s2, bodyY - h + 5 * s2);
              ctx.closePath();
              ctx.fill();

              // --- 4. Ornate Corner Pilasters ---
              // Left corner pilaster
              ctx.fillStyle = c.frame;
              ctx.beginPath();
              ctx.moveTo(0, bodyY);
              ctx.lineTo(-4 * s2, bodyY - 2 * s2);
              ctx.lineTo(-4 * s2, bodyY - h + 2 * s2);
              ctx.lineTo(0, bodyY - h);
              ctx.closePath();
              ctx.fill();

              // Right edge pilaster (on right wall)
              ctx.fillStyle = c.trim;
              ctx.beginPath();
              ctx.moveTo(w, bodyY - w * tanAngle);
              ctx.lineTo(w - 4 * s2, bodyY - w * tanAngle + 2 * s2);
              ctx.lineTo(w - 4 * s2, bodyY - w * tanAngle - h + 2 * s2);
              ctx.lineTo(w, bodyY - w * tanAngle - h);
              ctx.closePath();
              ctx.fill();

              // Far corner pilaster (left wall)
              ctx.fillStyle = "#4A3A2A";
              ctx.beginPath();
              ctx.moveTo(-w, bodyY - w * tanAngle);
              ctx.lineTo(-w + 4 * s2, bodyY - w * tanAngle + 2 * s2);
              ctx.lineTo(-w + 4 * s2, bodyY - w * tanAngle - h + 2 * s2);
              ctx.lineTo(-w, bodyY - w * tanAngle - h);
              ctx.closePath();
              ctx.fill();

              // --- 5. Decorative Cornice/Crown Molding ---
              const corniceH = 5 * s2;

              // Left cornice
              ctx.fillStyle = c.trim;
              ctx.beginPath();
              ctx.moveTo(0, bodyY - h);
              ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
              ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
              ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
              ctx.closePath();
              ctx.fill();

              // Right cornice
              ctx.fillStyle = c.accent;
              ctx.beginPath();
              ctx.moveTo(0, bodyY - h);
              ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
              ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
              ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
              ctx.closePath();
              ctx.fill();

              // Cornice shadow line
              ctx.strokeStyle = c.dark;
              ctx.lineWidth = 1.5 * s2;
              ctx.beginPath();
              ctx.moveTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
              ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
              ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
              ctx.stroke();

              // --- 6. Heavy-Duty Rivets with Plates ---
              ctx.fillStyle = c.dark;
              // Corner rivet plates
              const rivetPositions = [
                { x: -w + 3 * s2, yBase: bodyY - w * tanAngle },
                { x: w - 3 * s2, yBase: bodyY - w * tanAngle },
                { x: -2 * s2, yBase: bodyY },
                { x: 2 * s2, yBase: bodyY },
              ];

              rivetPositions.forEach((pos) => {
                for (let i = 0; i < 4; i++) {
                  const ry = pos.yBase - h * 0.2 - (i * h * 0.22);
                  // Rivet plate
                  ctx.fillStyle = c.frame;
                  ctx.beginPath();
                  ctx.arc(pos.x, ry, 3 * s2, 0, Math.PI * 2);
                  ctx.fill();
                  // Rivet center
                  ctx.fillStyle = c.dark;
                  ctx.beginPath();
                  ctx.arc(pos.x, ry, 1.5 * s2, 0, Math.PI * 2);
                  ctx.fill();
                  // Rivet highlight
                  ctx.fillStyle = "rgba(255,255,255,0.2)";
                  ctx.beginPath();
                  ctx.arc(pos.x - 0.5 * s2, ry - 0.5 * s2, 0.8 * s2, 0, Math.PI * 2);
                  ctx.fill();
                }
              });

              // --- 7. Ornate Central Crest/Emblem (Left Wall) ---
              ctx.save();
              ctx.translate(-w * 0.5, bodyY - w * tanAngle * 0.5 - h * 0.5);

              // Shield background
              ctx.fillStyle = c.dark;
              ctx.beginPath();
              ctx.moveTo(0, -10 * s2);
              ctx.lineTo(-8 * s2, -6 * s2);
              ctx.lineTo(-8 * s2, 6 * s2);
              ctx.quadraticCurveTo(0, 14 * s2, 8 * s2, 6 * s2);
              ctx.lineTo(8 * s2, -6 * s2);
              ctx.closePath();
              ctx.fill();

              // Shield inner
              ctx.fillStyle = c.trim;
              ctx.beginPath();
              ctx.moveTo(0, -7 * s2);
              ctx.lineTo(-5 * s2, -4 * s2);
              ctx.lineTo(-5 * s2, 4 * s2);
              ctx.quadraticCurveTo(0, 10 * s2, 5 * s2, 4 * s2);
              ctx.lineTo(5 * s2, -4 * s2);
              ctx.closePath();
              ctx.fill();

              // Dollar/coin symbol
              ctx.strokeStyle = c.dark;
              ctx.lineWidth = 2 * s2;
              ctx.beginPath();
              ctx.arc(0, 0, 3 * s2, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(0, -5 * s2);
              ctx.lineTo(0, 5 * s2);
              ctx.stroke();
              ctx.restore();

              // --- 8. The Grand Vault Door (Right Face) ---
              ctx.save();
              const doorCenterX = w * 0.5;
              const doorCenterY = bodyY - h * 0.5 - w * tanAngle * 0.5;
              ctx.translate(doorCenterX, doorCenterY);

              // Door outer frame
              ctx.fillStyle = c.frame;
              ctx.strokeStyle = c.dark;
              ctx.lineWidth = 2 * s2;
              ctx.beginPath();
              ctx.moveTo(-10 * s2, -14 * s2);
              ctx.lineTo(14 * s2, -14 * s2 + 14 * tanAngle);
              ctx.lineTo(14 * s2, 16 * s2 + 14 * tanAngle);
              ctx.lineTo(-10 * s2, 16 * s2);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              // Door inner panel
              ctx.fillStyle = c.trim;
              ctx.beginPath();
              ctx.moveTo(-7 * s2, -11 * s2);
              ctx.lineTo(11 * s2, -11 * s2 + 11 * tanAngle);
              ctx.lineTo(11 * s2, 13 * s2 + 11 * tanAngle);
              ctx.lineTo(-7 * s2, 13 * s2);
              ctx.closePath();
              ctx.fill();

              // Door decorative bands
              ctx.fillStyle = c.dark;
              ctx.fillRect(-8 * s2, -5 * s2, 20 * s2, 2 * s2);
              ctx.fillRect(-8 * s2, 5 * s2, 20 * s2, 2 * s2);

              // Door hinges
              ctx.fillStyle = "#2D2420";
              ctx.fillRect(-9 * s2, -12 * s2, 3 * s2, 6 * s2);
              ctx.fillRect(-9 * s2, 8 * s2, 3 * s2, 6 * s2);

              // Lock mechanism housing
              ctx.fillStyle = c.dark;
              ctx.beginPath();
              ctx.arc(2 * s2, 1 * s2, 11 * s2, 0, Math.PI * 2);
              ctx.fill();

              // Lock outer ring with notches
              ctx.fillStyle = c.frame;
              ctx.beginPath();
              ctx.arc(2 * s2, 1 * s2, 9 * s2, 0, Math.PI * 2);
              ctx.fill();

              // Lock notches
              ctx.fillStyle = c.dark;
              for (let n = 0; n < 12; n++) {
                const notchAngle = (n * Math.PI * 2) / 12;
                const nx = 2 * s2 + Math.cos(notchAngle) * 8 * s2;
                const ny = 1 * s2 + Math.sin(notchAngle) * 8 * s2;
                ctx.beginPath();
                ctx.arc(nx, ny, 1 * s2, 0, Math.PI * 2);
                ctx.fill();
              }

              // Inner dial ring
              ctx.fillStyle = c.trim;
              ctx.beginPath();
              ctx.arc(2 * s2, 1 * s2, 6 * s2, 0, Math.PI * 2);
              ctx.fill();

              // Rotating inner dial
              const dialSpeed = time * 1.2;
              ctx.save();
              ctx.translate(2 * s2, 1 * s2);
              ctx.rotate(dialSpeed);

              ctx.fillStyle = c.accent;
              ctx.beginPath();
              ctx.arc(0, 0, 4.5 * s2, 0, Math.PI * 2);
              ctx.fill();

              // Dial spokes
              ctx.strokeStyle = c.dark;
              ctx.lineWidth = 1.5 * s2;
              for (let spoke = 0; spoke < 3; spoke++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const spokeAngle = (spoke * Math.PI * 2) / 3;
                ctx.lineTo(Math.cos(spokeAngle) * 4 * s2, Math.sin(spokeAngle) * 4 * s2);
                ctx.stroke();
              }

              // Central keyhole with glow
              ctx.shadowColor = c.glow;
              ctx.shadowBlur = isFlashing ? 25 : 12;
              ctx.fillStyle = isFlashing ? "#FFF" : c.glow;
              ctx.beginPath();
              ctx.arc(0, 0, 2 * s2, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(0, 1 * s2);
              ctx.lineTo(-1.5 * s2, 4 * s2);
              ctx.lineTo(1.5 * s2, 4 * s2);
              ctx.closePath();
              ctx.fill();
              ctx.shadowBlur = 0;

              ctx.restore(); // End dial rotation
              ctx.restore(); // End door transform

              // --- 9. Handle/Lever on Door ---
              ctx.save();
              ctx.translate(doorCenterX + 12 * s2, doorCenterY + 8 * s2);
              ctx.fillStyle = c.dark;
              ctx.fillRect(-2 * s2, -8 * s2, 4 * s2, 16 * s2);
              ctx.fillStyle = c.frame;
              ctx.beginPath();
              ctx.arc(0, -8 * s2, 3 * s2, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(0, 8 * s2, 3 * s2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              // --- 10. Roof Ornament/Finial ---
              const roofPeakY = bodyY - h - roofOffset;

              // Decorative roof cap
              ctx.fillStyle = c.dark;
              ctx.beginPath();
              ctx.moveTo(-6 * s2, roofPeakY + 3 * s2);
              ctx.lineTo(0, roofPeakY - 2 * s2);
              ctx.lineTo(6 * s2, roofPeakY + 3 * s2);
              ctx.closePath();
              ctx.fill();

              ctx.fillStyle = c.trim;
              ctx.beginPath();
              ctx.moveTo(-4 * s2, roofPeakY + 2 * s2);
              ctx.lineTo(0, roofPeakY - 1 * s2);
              ctx.lineTo(4 * s2, roofPeakY + 2 * s2);
              ctx.closePath();
              ctx.fill();

              // Apex ornament ball
              ctx.fillStyle = c.accent;
              ctx.beginPath();
              ctx.arc(0, roofPeakY - 5 * s2, 3 * s2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "rgba(255,255,255,0.3)";
              ctx.beginPath();
              ctx.arc(-1 * s2, roofPeakY - 6 * s2, 1.2 * s2, 0, Math.PI * 2);
              ctx.fill();

              // --- 11. Subtle Ambient Glow ---
              if (!isFlashing) {
                const ambientGlow = ctx.createRadialGradient(
                  doorCenterX,
                  doorCenterY,
                  0,
                  doorCenterX,
                  doorCenterY,
                  25 * s2
                );
                ambientGlow.addColorStop(0, "rgba(90, 144, 128, 0.15)");
                ambientGlow.addColorStop(1, "transparent");
                ctx.fillStyle = ambientGlow;
                ctx.beginPath();
                ctx.arc(doorCenterX, doorCenterY, 25 * s2, 0, Math.PI * 2);
                ctx.fill();
              }

              // --- 12. Progressive Damage Effects ---

              // Stage 1: Scratches (HP < 75%)
              if (hpPct < 0.75) {
                ctx.strokeStyle = "rgba(0,0,0,0.5)";
                ctx.lineWidth = 1 * s2;
                ctx.beginPath();
                ctx.moveTo(-w * 0.7, bodyY - h * 0.3);
                ctx.lineTo(-w * 0.3, bodyY - h * 0.5);
                ctx.moveTo(-w * 0.6, bodyY - h * 0.7);
                ctx.lineTo(-w * 0.2, bodyY - h * 0.6);
                ctx.moveTo(w * 0.3, bodyY - w * tanAngle - h * 0.4);
                ctx.lineTo(w * 0.6, bodyY - w * tanAngle - h * 0.6);
                ctx.stroke();
              }

              // Stage 2: Critical (HP < 40%)
              if (hpPct < 0.4) {
                const flicker = Math.sin(time * 20) > 0;

                // Glowing cracks
                ctx.strokeStyle = flicker ? "#FFEB3B" : "#FF5722";
                ctx.shadowColor = "#FF5722";
                ctx.shadowBlur = 15 * s2;
                ctx.lineWidth = 2.5 * s2;
                ctx.beginPath();
                ctx.moveTo(-w * 0.2, bodyY);
                ctx.lineTo(-w * 0.5, bodyY - h * 0.3);
                ctx.lineTo(-w * 0.3, bodyY - h * 0.7);
                ctx.lineTo(0, bodyY - h);
                ctx.lineTo(w * 0.2, bodyY - h - roofOffset * 0.5);
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Emergency beacon
                const beaconY = roofPeakY - 12 * s2;
                ctx.fillStyle = c.dark;
                ctx.fillRect(-3 * s2, beaconY, 6 * s2, 6 * s2);

                ctx.save();
                ctx.translate(0, beaconY);
                ctx.fillStyle = flicker ? "#FF0000" : "#B71C1C";
                ctx.shadowColor = "#FF0000";
                ctx.shadowBlur = 25;
                ctx.beginPath();
                ctx.arc(0, 0, 4 * s2, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.rotate(time * 6);
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(5 * s2, -3 * s2);
                ctx.lineTo(5 * s2, 3 * s2);
                ctx.fill();
                ctx.restore();

                // Sparks
                if (Math.random() > 0.85) {
                  ctx.fillStyle = "#FFF";
                  ctx.beginPath();
                  const sparkX = (Math.random() - 0.5) * w;
                  const sparkY = bodyY - h * 0.5 + (Math.random() - 0.5) * h;
                  ctx.arc(sparkX, sparkY, 2 * s2, 0, Math.PI * 2);
                  ctx.fill();
                }
              }

              // --- 13. Health Bar ---
              if (specialTowerHp !== null && spec.hp) {
                const barWidth = 70 * s2;
                const barHeight = 10 * s2;
                const yOffset = roofPeakY - 22 * s2;

                ctx.save();
                ctx.translate(0, yOffset);

                // Bar background
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;
                ctx.fillStyle = "#1a1a1a";
                ctx.beginPath();
                ctx.rect(-barWidth / 2 - 2 * s2, -2 * s2, barWidth + 4 * s2, barHeight + 4 * s2);
                ctx.fill();

                ctx.fillStyle = "#2D2D2D";
                ctx.beginPath();
                ctx.rect(-barWidth / 2, 0, barWidth, barHeight);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;

                // HP fill
                const hpColorStr =
                  hpPct > 0.6 ? "#4CAF50" : hpPct > 0.3 ? "#FF9800" : "#F44336";
                const grad = ctx.createLinearGradient(
                  -barWidth / 2,
                  0,
                  barWidth / 2,
                  0
                );
                grad.addColorStop(0, hpColorStr);
                grad.addColorStop(1, isFlashing ? "#FFF" : hpColorStr);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.rect(
                  -barWidth / 2 + 2 * s2,
                  2 * s2,
                  (barWidth - 4 * s2) * hpPct,
                  barHeight - 4 * s2
                );
                ctx.fill();

                // Text
                ctx.fillStyle = "#E0E0E0";
                ctx.font = `800 ${7 * s2}px "Roboto", Arial, sans-serif`;
                ctx.textAlign = "center";
                ctx.shadowColor = "black";
                ctx.shadowBlur = 4;
                ctx.fillText("PROTECT THE VAULT", 0, -4 * s2);
                ctx.restore();
              }
              break;
            }

            case "shrine": {
              const time = Date.now() / 1000;
              const healCycle = Date.now() % 5000; // 5s loop
              const isHealing = healCycle < 1200; // Visual pulse duration
              const s2 = s * 1.1;

              // Isometric Constants
              const w = 32 * s2;
              const h = 12 * s2;
              const tanA = Math.tan(Math.PI / 6);

              // 1. Foundation Shadow (Larger, softer)
              ctx.fillStyle = "rgba(0,0,0,0.3)";
              ctx.beginPath();
              ctx.ellipse(0, -w * tanA, 45 * s2, 25 * s2, 0, 0, Math.PI * 2);
              ctx.fill();

              // Helper: Draw isometric step with gradient
              const drawOrnateStep = (
                sw: number,
                sh: number,
                gradL: CanvasGradient | string,
                gradR: CanvasGradient | string,
                topColor?: string
              ) => {
                // Left Face
                ctx.fillStyle = gradL;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-sw, -sw * tanA);
                ctx.lineTo(-sw, -sw * tanA - sh);
                ctx.lineTo(0, -sh);
                ctx.fill();
                // Right Face
                ctx.fillStyle = gradR;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(sw, -sw * tanA);
                ctx.lineTo(sw, -sw * tanA - sh);
                ctx.lineTo(0, -sh);
                ctx.fill();
                // Top Face (optional)
                if (topColor) {
                  ctx.fillStyle = topColor;
                  ctx.beginPath();
                  ctx.moveTo(0, -sh);
                  ctx.lineTo(-sw, -sw * tanA - sh);
                  ctx.lineTo(0, -sw * tanA * 2 - sh);
                  ctx.lineTo(sw, -sw * tanA - sh);
                  ctx.closePath();
                  ctx.fill();
                }
              };

              // 2. Ornate Tiered Base with Multiple Levels
              ctx.save();

              // Base tier 1 (Largest - foundation)
              const baseGradL1 = ctx.createLinearGradient(-w, 0, 0, 0);
              baseGradL1.addColorStop(0, "#37474F");
              baseGradL1.addColorStop(1, "#455A64");
              const baseGradR1 = ctx.createLinearGradient(0, 0, w, 0);
              baseGradR1.addColorStop(0, "#607D8B");
              baseGradR1.addColorStop(1, "#546E7A");
              drawOrnateStep(w, h, baseGradL1, baseGradR1, "#4E5D63");

              // Decorative edge trim on base
              ctx.strokeStyle = "#78909C";
              ctx.lineWidth = 1.5 * s2;
              ctx.beginPath();
              ctx.moveTo(-w, -w * tanA - h);
              ctx.lineTo(0, -h);
              ctx.lineTo(w, -w * tanA - h);
              ctx.stroke();

              // Base tier 2 (Middle platform)
              ctx.translate(0, -h);
              const w2 = w * 0.75;
              const baseGradL2 = ctx.createLinearGradient(-w2, 0, 0, 0);
              baseGradL2.addColorStop(0, "#2E4A52");
              baseGradL2.addColorStop(1, "#3D5C5F");
              const baseGradR2 = ctx.createLinearGradient(0, 0, w2, 0);
              baseGradR2.addColorStop(0, "#4A7C7F");
              baseGradR2.addColorStop(1, "#3D6B6E");
              drawOrnateStep(w2, h * 1.2, baseGradL2, baseGradR2, "#456563");

              // Carved rune patterns on middle tier
              ctx.strokeStyle = "rgba(118, 255, 3, 0.3)";
              ctx.lineWidth = 1 * s2;
              // Left face runes
              ctx.beginPath();
              ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
              ctx.lineTo(-w2 * 0.5 - 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
              ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
              ctx.lineTo(-w2 * 0.5 + 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
              ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
              ctx.lineTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.9);
              ctx.stroke();
              // Right face runes
              ctx.beginPath();
              ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
              ctx.lineTo(w2 * 0.5 - 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
              ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
              ctx.lineTo(w2 * 0.5 + 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
              ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
              ctx.lineTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.9);
              ctx.stroke();

              // Base tier 3 (Inner pedestal)
              ctx.translate(0, -h * 1.2);
              const w3 = w * 0.45;
              const baseGradL3 = ctx.createLinearGradient(-w3, 0, 0, 0);
              baseGradL3.addColorStop(0, "#1B3A3D");
              baseGradL3.addColorStop(1, "#2A4F52");
              const baseGradR3 = ctx.createLinearGradient(0, 0, w3, 0);
              baseGradR3.addColorStop(0, "#3D6B6E");
              baseGradR3.addColorStop(1, "#2E5558");
              drawOrnateStep(w3, h * 0.8, baseGradL3, baseGradR3, "#355855");

              ctx.restore();

              // 3. Four Corner Pillars with Crystals
              const pillarPositions = [
                { x: -w * 0.7, y: -w * tanA * 0.7, side: "left" },
                { x: w * 0.7, y: -w * tanA * 0.7, side: "right" },
                { x: -w * 0.35, y: -w * tanA * 0.35 - h, side: "left" },
                { x: w * 0.35, y: -w * tanA * 0.35 - h, side: "right" },
              ];

              pillarPositions.forEach((pil, idx) => {
                ctx.save();
                ctx.translate(pil.x, pil.y);

                // Pillar base
                ctx.fillStyle = pil.side === "left" ? "#37474F" : "#546E7A";
                ctx.fillRect(-4 * s2, -2 * s2, 8 * s2, 4 * s2);

                // Pillar shaft
                const pillarGrad = ctx.createLinearGradient(-3 * s2, 0, 3 * s2, 0);
                if (pil.side === "left") {
                  pillarGrad.addColorStop(0, "#2E4A52");
                  pillarGrad.addColorStop(0.5, "#3D5C5F");
                  pillarGrad.addColorStop(1, "#2E4A52");
                } else {
                  pillarGrad.addColorStop(0, "#3D6B6E");
                  pillarGrad.addColorStop(0.5, "#4A8285");
                  pillarGrad.addColorStop(1, "#3D6B6E");
                }
                ctx.fillStyle = pillarGrad;
                ctx.fillRect(-3 * s2, -2 * s2, 6 * s2, -25 * s2);

                // Pillar capital (top ornament)
                ctx.fillStyle = pil.side === "left" ? "#455A64" : "#607D8B";
                ctx.fillRect(-5 * s2, -27 * s2, 10 * s2, 4 * s2);

                // Crystal on top
                const crystalGlow = 0.5 + Math.sin(time * 3 + idx) * 0.3;
                ctx.shadowBlur = (isHealing ? 15 : 8) * s2;
                ctx.shadowColor = `rgba(118, 255, 3, ${crystalGlow})`;

                // Crystal shape
                ctx.fillStyle = `rgba(144, 238, 144, ${0.7 + crystalGlow * 0.3})`;
                ctx.beginPath();
                ctx.moveTo(0, -40 * s2);
                ctx.lineTo(-4 * s2, -32 * s2);
                ctx.lineTo(-3 * s2, -27 * s2);
                ctx.lineTo(3 * s2, -27 * s2);
                ctx.lineTo(4 * s2, -32 * s2);
                ctx.closePath();
                ctx.fill();

                // Crystal highlight
                ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + crystalGlow * 0.2})`;
                ctx.beginPath();
                ctx.moveTo(0, -38 * s2);
                ctx.lineTo(-2 * s2, -33 * s2);
                ctx.lineTo(0, -30 * s2);
                ctx.lineTo(2 * s2, -33 * s2);
                ctx.closePath();
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();
              });

              // 4. Sacred Bowl/Brazier (Center)
              ctx.save();
              const bowlY = -h * 2.2;
              ctx.translate(0, bowlY);

              // Bowl outer rim
              ctx.fillStyle = "#4E342E";
              ctx.beginPath();
              ctx.ellipse(0, 0, 14 * s2, 7 * s2, 0, 0, Math.PI * 2);
              ctx.fill();

              // Bowl inner (dark)
              ctx.fillStyle = "#1a1a2e";
              ctx.beginPath();
              ctx.ellipse(0, -2 * s2, 11 * s2, 5 * s2, 0, 0, Math.PI * 2);
              ctx.fill();

              // Bowl decorative bands
              ctx.strokeStyle = "#FFD700";
              ctx.lineWidth = 1.5 * s2;
              ctx.beginPath();
              ctx.ellipse(0, 2 * s2, 13 * s2, 6.5 * s2, 0, 0, Math.PI, true);
              ctx.stroke();

              // Bowl pedestal
              ctx.fillStyle = "#3E2723";
              ctx.fillRect(-5 * s2, 4 * s2, 10 * s2, 8 * s2);
              ctx.fillStyle = "#5D4037";
              ctx.fillRect(-4 * s2, 4 * s2, 8 * s2, 8 * s2);
              ctx.restore();

              // 5. Floating Ornate Runestones (Improved)
              for (let i = 0; i < 5; i++) {
                ctx.save();
                const orbitAngle = time * 0.6 + (i * Math.PI * 2) / 5;
                const orbitRadius = 28 * s2;
                const bob = Math.sin(time * 2.5 + i * 1.2) * 5 * s2;
                const rx = Math.cos(orbitAngle) * orbitRadius;
                const ry = -45 * s2 + Math.sin(orbitAngle) * 12 * s2 + bob;

                ctx.translate(rx, ry);
                ctx.rotate(Math.sin(time + i) * 0.2);

                // Stone body (faceted gem shape)
                const stoneSize = (6 + Math.sin(i * 2) * 2) * s2;

                // Stone shadow
                ctx.fillStyle = "rgba(0,0,0,0.3)";
                ctx.beginPath();
                ctx.moveTo(2 * s2, -stoneSize + 2 * s2);
                ctx.lineTo(stoneSize + 2 * s2, 2 * s2);
                ctx.lineTo(2 * s2, stoneSize + 2 * s2);
                ctx.lineTo(-stoneSize + 2 * s2, 2 * s2);
                ctx.closePath();
                ctx.fill();

                // Stone dark side
                ctx.fillStyle = "#1B3A3D";
                ctx.beginPath();
                ctx.moveTo(0, -stoneSize);
                ctx.lineTo(-stoneSize, 0);
                ctx.lineTo(0, stoneSize);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();

                // Stone light side
                ctx.fillStyle = "#2E5558";
                ctx.beginPath();
                ctx.moveTo(0, -stoneSize);
                ctx.lineTo(stoneSize, 0);
                ctx.lineTo(0, stoneSize);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();

                // Glowing rune inscription
                const runeGlow = isHealing ? 1 : 0.5 + Math.sin(time * 4 + i) * 0.3;
                ctx.shadowBlur = (isHealing ? 12 : 6) * s2;
                ctx.shadowColor = "#76FF03";
                ctx.strokeStyle = `rgba(204, 255, 144, ${runeGlow})`;
                ctx.lineWidth = 1.5 * s2;

                // Different rune pattern for each stone
                ctx.beginPath();
                if (i % 3 === 0) {
                  // Vertical line with branches
                  ctx.moveTo(0, -stoneSize * 0.6);
                  ctx.lineTo(0, stoneSize * 0.6);
                  ctx.moveTo(-stoneSize * 0.3, -stoneSize * 0.2);
                  ctx.lineTo(stoneSize * 0.3, stoneSize * 0.2);
                } else if (i % 3 === 1) {
                  // X pattern
                  ctx.moveTo(-stoneSize * 0.4, -stoneSize * 0.4);
                  ctx.lineTo(stoneSize * 0.4, stoneSize * 0.4);
                  ctx.moveTo(stoneSize * 0.4, -stoneSize * 0.4);
                  ctx.lineTo(-stoneSize * 0.4, stoneSize * 0.4);
                } else {
                  // Triangle
                  ctx.moveTo(0, -stoneSize * 0.5);
                  ctx.lineTo(-stoneSize * 0.4, stoneSize * 0.3);
                  ctx.lineTo(stoneSize * 0.4, stoneSize * 0.3);
                  ctx.closePath();
                }
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.restore();
              }

              // 6. Central Sacred Flame (Enhanced)
              const flameY = bowlY - 8 * s2;
              const flamePulse = 0.85 + Math.sin(time * 10) * 0.15;
              const flameSize = 22 * s2 * flamePulse;

              // Outer glow aura
              const auraGrad = ctx.createRadialGradient(
                0,
                flameY,
                0,
                0,
                flameY,
                flameSize * 1.8
              );
              auraGrad.addColorStop(0, "rgba(118, 255, 3, 0.3)");
              auraGrad.addColorStop(0.5, "rgba(118, 255, 3, 0.1)");
              auraGrad.addColorStop(1, "transparent");
              ctx.fillStyle = auraGrad;
              ctx.beginPath();
              ctx.arc(0, flameY, flameSize * 1.8, 0, Math.PI * 2);
              ctx.fill();

              // Main flame core
              const fireGrad = ctx.createRadialGradient(
                0,
                flameY,
                0,
                0,
                flameY,
                flameSize
              );
              fireGrad.addColorStop(0, "#FFFFFF");
              fireGrad.addColorStop(0.2, "#E8F5E9");
              fireGrad.addColorStop(0.4, "#CCFF90");
              fireGrad.addColorStop(0.7, "rgba(118, 255, 3, 0.5)");
              fireGrad.addColorStop(1, "transparent");

              ctx.fillStyle = fireGrad;
              ctx.beginPath();
              ctx.arc(0, flameY, flameSize, 0, Math.PI * 2);
              ctx.fill();

              // Flame tendrils (animated)
              for (let t = 0; t < 4; t++) {
                const tendrilAngle = time * 3 + (t * Math.PI) / 2;
                const tendrilLen = (12 + Math.sin(time * 6 + t) * 4) * s2;
                const tx = Math.cos(tendrilAngle) * 8 * s2;
                const ty = flameY + Math.sin(tendrilAngle) * 4 * s2 - tendrilLen * 0.5;

                const tendrilGrad = ctx.createLinearGradient(tx, ty, tx, ty - tendrilLen);
                tendrilGrad.addColorStop(0, "rgba(204, 255, 144, 0.8)");
                tendrilGrad.addColorStop(1, "transparent");

                ctx.fillStyle = tendrilGrad;
                ctx.beginPath();
                ctx.moveTo(tx - 3 * s2, ty);
                ctx.quadraticCurveTo(tx + Math.sin(time * 8 + t) * 4 * s2, ty - tendrilLen * 0.5, tx, ty - tendrilLen);
                ctx.quadraticCurveTo(tx - Math.sin(time * 8 + t) * 4 * s2, ty - tendrilLen * 0.5, tx + 3 * s2, ty);
                ctx.fill();
              }

              // 7. Ambient Floating Particles
              for (let p = 0; p < 8; p++) {
                const pTime = time + p * 0.8;
                const pLifeCycle = (pTime * 0.5) % 1;
                const pAngle = p * (Math.PI / 4) + time * 0.3;
                const pDist = 15 * s2 + pLifeCycle * 25 * s2;
                const px = Math.cos(pAngle) * pDist;
                const py = flameY - pLifeCycle * 40 * s2 + Math.sin(pTime * 2) * 5 * s2;
                const pAlpha = Math.sin(pLifeCycle * Math.PI) * 0.6;
                const pSize = (1 + Math.sin(pTime * 3) * 0.5) * s2;

                ctx.fillStyle = `rgba(204, 255, 144, ${pAlpha})`;
                ctx.beginPath();
                ctx.arc(px, py, pSize, 0, Math.PI * 2);
                ctx.fill();
              }

              // 8. Sacred Circle on Ground (Under everything, always visible)
              const circleY = -w * tanA * 2; // Match shadow position (doubled because of scale)
              ctx.save();
              ctx.scale(1, 0.5);
              ctx.strokeStyle = "rgba(118, 255, 3, 0.15)";
              ctx.lineWidth = 2 * s2;
              ctx.beginPath();
              ctx.arc(0, circleY, 38 * s2, 0, Math.PI * 2);
              ctx.stroke();

              // Inner decorative circle
              ctx.setLineDash([4 * s2, 4 * s2]);
              ctx.beginPath();
              ctx.arc(0, circleY, 32 * s2, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);

              // Cardinal direction markers
              ctx.fillStyle = "rgba(118, 255, 3, 0.2)";
              for (let d = 0; d < 4; d++) {
                const dAngle = (d * Math.PI) / 2;
                const dx = Math.cos(dAngle) * 35 * s2;
                const dy = circleY + Math.sin(dAngle) * 35 * s2;
                ctx.beginPath();
                ctx.arc(dx, dy, 3 * s2, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();

              // 9. HEALING PULSE EFFECT (Enhanced)
              if (isHealing) {
                const prog = healCycle / 1200;
                const ringRad = 200 * prog;
                const pulseY = -w * tanA * 2; // Match building center (doubled because of scale)

                ctx.save();
                ctx.scale(1, 0.5);

                // Multiple expanding rings
                for (let ring = 0; ring < 3; ring++) {
                  const ringProg = Math.max(0, prog - ring * 0.15);
                  if (ringProg > 0) {
                    const ringAlpha = (1 - ringProg) * (1 - ring * 0.3);
                    ctx.strokeStyle = `rgba(118, 255, 3, ${ringAlpha})`;
                    ctx.lineWidth = (4 - ring) * s2;
                    ctx.beginPath();
                    ctx.arc(0, pulseY, ringRad * s2 * (1 - ring * 0.2), 0, Math.PI * 2);
                    ctx.stroke();
                  }
                }

                // Sacred healing symbols rising
                ctx.fillStyle = `rgba(204, 255, 144, ${0.9 * (1 - prog)})`;
                for (let sym = 0; sym < 6; sym++) {
                  const symAngle = (sym * Math.PI) / 3 + time * 0.5;
                  const symDist = 25 + prog * 60;
                  const sx = Math.cos(symAngle) * symDist * s2;
                  const sy = pulseY - prog * 80 * s2 + Math.sin(symAngle) * symDist * s2 * 0.5;

                  ctx.save();
                  ctx.translate(sx, sy);
                  ctx.rotate(symAngle);

                  // Cross/plus healing symbol
                  ctx.fillRect(-1.5 * s2, -5 * s2, 3 * s2, 10 * s2);
                  ctx.fillRect(-5 * s2, -1.5 * s2, 10 * s2, 3 * s2);
                  ctx.restore();
                }
                ctx.restore();

                // Vertical light beam
                const beamAlpha = 0.4 * (1 - prog);
                const beamGrad = ctx.createLinearGradient(0, flameY, 0, -100 * s2);
                beamGrad.addColorStop(0, `rgba(204, 255, 144, ${beamAlpha})`);
                beamGrad.addColorStop(0.5, `rgba(118, 255, 3, ${beamAlpha * 0.5})`);
                beamGrad.addColorStop(1, "transparent");
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(-8 * s2, flameY);
                ctx.lineTo(-4 * s2, -100 * s2);
                ctx.lineTo(4 * s2, -100 * s2);
                ctx.lineTo(8 * s2, flameY);
                ctx.fill();
              }

              break;
            }

            case "barracks": {
              const time = Date.now() / 1000;
              const spawnCycle = Date.now() % 12000; // Matches the 12s logic in updateGame
              const isSpawning = spawnCycle < 1500; // First 1.5 seconds of spawn
              const isPreparing = spawnCycle > 10500; // Glowing before spawn

              // Isometric Constants
              const w = 34 * s;
              const h = 48 * s;
              const angle = Math.PI / 6;
              const tanA = Math.tan(angle);

              // 1. Foundation Shadow (Ground shadow)
              ctx.fillStyle = "rgba(0,0,0,0.35)";
              ctx.beginPath();
              ctx.ellipse(0, -w * tanA, 44 * s, 22 * s, 0, 0, Math.PI * 2);
              ctx.fill();

              // 2. Stone Foundation/Base Platform
              const baseH = 6 * s;
              ctx.fillStyle = "#37474F";
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(-w - 3 * s, -w * tanA - 2 * s);
              ctx.lineTo(-w - 3 * s, -w * tanA - 2 * s - baseH);
              ctx.lineTo(0, -baseH);
              ctx.fill();

              ctx.fillStyle = "#546E7A";
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(w + 3 * s, -w * tanA - 2 * s);
              ctx.lineTo(w + 3 * s, -w * tanA - 2 * s - baseH);
              ctx.lineTo(0, -baseH);
              ctx.fill();

              // Base top surface
              ctx.fillStyle = "#4E5D63";
              ctx.beginPath();
              ctx.moveTo(0, -baseH);
              ctx.lineTo(-w - 3 * s, -w * tanA - 2 * s - baseH);
              ctx.lineTo(0, -w * tanA * 2 - 4 * s - baseH);
              ctx.lineTo(w + 3 * s, -w * tanA - 2 * s - baseH);
              ctx.closePath();
              ctx.fill();

              // 3. The Main Building Faces (Directional Lighting)
              // Front-Left (Shadow side)
              const wallGradL = ctx.createLinearGradient(
                -w,
                -w * tanA - baseH,
                0,
                -baseH
              );
              wallGradL.addColorStop(0, "#3D4F59");
              wallGradL.addColorStop(0.5, "#455A64");
              wallGradL.addColorStop(1, "#4A6270");
              ctx.fillStyle = wallGradL;
              ctx.beginPath();
              ctx.moveTo(0, -baseH);
              ctx.lineTo(-w, -w * tanA - baseH);
              ctx.lineTo(-w, -w * tanA - h - baseH);
              ctx.lineTo(0, -h - baseH);
              ctx.fill();

              // Front-Right (Light side)
              const wallGradR = ctx.createLinearGradient(
                0,
                -baseH,
                w,
                -w * tanA - baseH
              );
              wallGradR.addColorStop(0, "#6B8794");
              wallGradR.addColorStop(0.5, "#607D8B");
              wallGradR.addColorStop(1, "#546E7A");
              ctx.fillStyle = wallGradR;
              ctx.beginPath();
              ctx.moveTo(0, -baseH);
              ctx.lineTo(w, -w * tanA - baseH);
              ctx.lineTo(w, -w * tanA - h - baseH);
              ctx.lineTo(0, -h - baseH);
              ctx.fill();

              // 4. Masonry Detail (Stone Blocks with offset pattern)
              ctx.strokeStyle = "rgba(0,0,0,0.15)";
              ctx.lineWidth = 1 * s;
              for (let row = 1; row < 5; row++) {
                const yOff = -(h / 5) * row - baseH;
                ctx.beginPath();
                ctx.moveTo(-w, -w * tanA + yOff);
                ctx.lineTo(0, yOff);
                ctx.lineTo(w, -w * tanA + yOff);
                ctx.stroke();

                // Vertical joints (offset every other row)
                const offset = row % 2 === 0 ? 8 * s : 0;
                for (let col = 1; col < 3; col++) {
                  const xLeft = (-w / 3) * col + offset * 0.3;
                  const xRight = (w / 3) * col - offset * 0.3;
                  ctx.beginPath();
                  ctx.moveTo(xLeft, yOff - (h / 5) * 0.5 + Math.abs(xLeft) * tanA);
                  ctx.lineTo(xLeft, yOff + Math.abs(xLeft) * tanA);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.moveTo(xRight, yOff - (h / 5) * 0.5 + Math.abs(xRight) * tanA);
                  ctx.lineTo(xRight, yOff + Math.abs(xRight) * tanA);
                  ctx.stroke();
                }
              }

              // 5. Corner Stone Accents (Quoins)
              ctx.fillStyle = "#37474F";
              for (let i = 0; i < 4; i++) {
                const cornerY = -baseH - 10 * s - i * 12 * s;
                // Left corner
                ctx.fillRect(-w - 2 * s, -w * tanA + cornerY - 1 * s, 6 * s, 10 * s);
                // Right corner
                ctx.fillRect(w - 4 * s, -w * tanA + cornerY - 1 * s, 6 * s, 10 * s);
              }

              // 6. Arrow Slit Windows
              ctx.fillStyle = "#1a1a2e";
              // Left wall window
              ctx.save();
              ctx.translate(-w * 0.5, -w * tanA * 0.5 - h * 0.65 - baseH);
              ctx.beginPath();
              ctx.moveTo(0, -8 * s);
              ctx.lineTo(-2 * s, -4 * s);
              ctx.lineTo(-2 * s, 6 * s);
              ctx.lineTo(2 * s, 6 * s);
              ctx.lineTo(2 * s, -4 * s);
              ctx.closePath();
              ctx.fill();
              // Inner glow when preparing
              if (isPreparing) {
                ctx.fillStyle = "rgba(79, 195, 247, 0.4)";
                ctx.fill();
              }
              ctx.restore();

              // Right wall window
              ctx.save();
              ctx.translate(w * 0.5, -w * tanA * 0.5 - h * 0.65 - baseH);
              ctx.fillStyle = "#1a1a2e";
              ctx.beginPath();
              ctx.moveTo(0, -8 * s);
              ctx.lineTo(-2 * s, -4 * s);
              ctx.lineTo(-2 * s, 6 * s);
              ctx.lineTo(2 * s, 6 * s);
              ctx.lineTo(2 * s, -4 * s);
              ctx.closePath();
              ctx.fill();
              if (isPreparing) {
                ctx.fillStyle = "rgba(79, 195, 247, 0.4)";
                ctx.fill();
              }
              ctx.restore();

              // 7. The Grand Archway Door (Shifted UP)
              const doorY = -baseH - 8 * s; // Door raised up
              ctx.save();
              if (isPreparing || isSpawning) {
                ctx.shadowBlur = 20 * s;
                ctx.shadowColor = "#4FC3F7";
              }

              // Door frame (stone arch)
              ctx.fillStyle = "#37474F";
              ctx.beginPath();
              ctx.moveTo(-14 * s, doorY);
              ctx.lineTo(-14 * s, doorY - 28 * s);
              ctx.quadraticCurveTo(0, doorY - 42 * s, 14 * s, doorY - 28 * s);
              ctx.lineTo(14 * s, doorY);
              ctx.lineTo(11 * s, doorY);
              ctx.lineTo(11 * s, doorY - 26 * s);
              ctx.quadraticCurveTo(0, doorY - 38 * s, -11 * s, doorY - 26 * s);
              ctx.lineTo(-11 * s, doorY);
              ctx.closePath();
              ctx.fill();

              // Keystone at top of arch
              ctx.fillStyle = "#4E342E";
              ctx.beginPath();
              ctx.moveTo(-4 * s, doorY - 34 * s);
              ctx.lineTo(0, doorY - 38 * s);
              ctx.lineTo(4 * s, doorY - 34 * s);
              ctx.lineTo(2 * s, doorY - 30 * s);
              ctx.lineTo(-2 * s, doorY - 30 * s);
              ctx.closePath();
              ctx.fill();

              // Interior Dark Gradient
              const archGrad = ctx.createLinearGradient(0, doorY - 30 * s, 0, doorY);
              archGrad.addColorStop(0, "#0a0a12");
              archGrad.addColorStop(0.7, isPreparing ? "#0D47A1" : "#1a1a2e");
              archGrad.addColorStop(1, isPreparing ? "#1565C0" : "#263238");
              ctx.fillStyle = archGrad;

              ctx.beginPath();
              ctx.moveTo(-10 * s, doorY);
              ctx.lineTo(-10 * s, doorY - 25 * s);
              ctx.quadraticCurveTo(0, doorY - 36 * s, 10 * s, doorY - 25 * s);
              ctx.lineTo(10 * s, doorY);
              ctx.fill();

              // Door wooden planks detail
              ctx.strokeStyle = "rgba(78, 52, 46, 0.3)";
              ctx.lineWidth = 1.5 * s;
              ctx.beginPath();
              ctx.moveTo(0, doorY);
              ctx.lineTo(0, doorY - 32 * s);
              ctx.stroke();
              ctx.restore();

              // 8. Wall-mounted Torches
              const torchFlicker = Math.sin(time * 8) * 0.15 + 0.85;
              // Left torch
              ctx.save();
              ctx.translate(-18 * s, doorY - 20 * s);
              // Torch bracket
              ctx.fillStyle = "#3E2723";
              ctx.fillRect(-1 * s, 0, 3 * s, 8 * s);
              ctx.fillRect(-3 * s, 6 * s, 7 * s, 3 * s);
              // Flame glow
              ctx.shadowBlur = 12 * s;
              ctx.shadowColor = `rgba(255, 150, 50, ${torchFlicker})`;
              ctx.fillStyle = `rgba(255, 180, 50, ${torchFlicker})`;
              ctx.beginPath();
              ctx.ellipse(0.5 * s, -2 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = `rgba(255, 220, 100, ${torchFlicker})`;
              ctx.beginPath();
              ctx.ellipse(0.5 * s, -3 * s, 2 * s, 3 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              // Right torch
              ctx.save();
              ctx.translate(18 * s, doorY - 20 * s);
              ctx.fillStyle = "#3E2723";
              ctx.fillRect(-1 * s, 0, 3 * s, 8 * s);
              ctx.fillRect(-3 * s, 6 * s, 7 * s, 3 * s);
              ctx.shadowBlur = 12 * s;
              ctx.shadowColor = `rgba(255, 150, 50, ${torchFlicker})`;
              ctx.fillStyle = `rgba(255, 180, 50, ${torchFlicker})`;
              ctx.beginPath();
              ctx.ellipse(0.5 * s, -2 * s, 3 * s, 5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = `rgba(255, 220, 100, ${torchFlicker})`;
              ctx.beginPath();
              ctx.ellipse(0.5 * s, -3 * s, 2 * s, 3 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              // 9. The Roof (Multi-layered with tiles)
              const roofH = 30 * s;
              const roofOverhang = 8 * s;
              const roofBase = -h - baseH;

              // Roof underside shadow
              ctx.fillStyle = "#1a1a2e";
              ctx.beginPath();
              ctx.moveTo(-w - roofOverhang, -w * tanA + roofBase + 4 * s);
              ctx.lineTo(0, roofBase + 4 * s);
              ctx.lineTo(w + roofOverhang, -w * tanA + roofBase + 4 * s);
              ctx.lineTo(w + roofOverhang, -w * tanA + roofBase);
              ctx.lineTo(0, roofBase);
              ctx.lineTo(-w - roofOverhang, -w * tanA + roofBase);
              ctx.closePath();
              ctx.fill();

              // Left Roof Panel (Darker - shadowed)
              const roofGradL = ctx.createLinearGradient(
                -w - roofOverhang,
                -w * tanA + roofBase,
                0,
                roofBase - roofH
              );
              roofGradL.addColorStop(0, "#1B2631");
              roofGradL.addColorStop(0.4, "#212F3C");
              roofGradL.addColorStop(1, "#283747");
              ctx.fillStyle = roofGradL;
              ctx.beginPath();
              ctx.moveTo(0, roofBase);
              ctx.lineTo(-w - roofOverhang, -w * tanA + roofBase);
              ctx.lineTo(0, roofBase - roofH);
              ctx.fill();

              // Right Roof Panel (Lighter)
              const roofGradR = ctx.createLinearGradient(
                0,
                roofBase - roofH,
                w + roofOverhang,
                -w * tanA + roofBase
              );
              roofGradR.addColorStop(0, "#34495E");
              roofGradR.addColorStop(0.6, "#2C3E50");
              roofGradR.addColorStop(1, "#273746");
              ctx.fillStyle = roofGradR;
              ctx.beginPath();
              ctx.moveTo(0, roofBase);
              ctx.lineTo(w + roofOverhang, -w * tanA + roofBase);
              ctx.lineTo(0, roofBase - roofH);
              ctx.fill();

              // Roof tile lines (left side)
              ctx.strokeStyle = "rgba(0,0,0,0.2)";
              ctx.lineWidth = 1 * s;
              for (let i = 1; i < 5; i++) {
                const t = i / 5;
                const startX = -w * t - roofOverhang * t;
                const startY = -w * tanA * t + roofBase;
                const endX = 0;
                const endY = roofBase - roofH * t;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX + (startX - endX) * 0.1, endY + (startY - endY) * 0.1);
                ctx.stroke();
              }

              // Roof tile lines (right side)
              for (let i = 1; i < 5; i++) {
                const t = i / 5;
                const startX = w * t + roofOverhang * t;
                const startY = -w * tanA * t + roofBase;
                const endX = 0;
                const endY = roofBase - roofH * t;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX + (startX - endX) * 0.1, endY + (startY - endY) * 0.1);
                ctx.stroke();
              }

              // Roof Ridge Cap
              ctx.strokeStyle = "#4E342E";
              ctx.lineWidth = 4 * s;
              ctx.lineCap = "round";
              ctx.beginPath();
              ctx.moveTo(-w - roofOverhang, -w * tanA + roofBase);
              ctx.lineTo(0, roofBase - roofH);
              ctx.lineTo(w + roofOverhang, -w * tanA + roofBase);
              ctx.stroke();

              // Roof peak ornament
              ctx.fillStyle = "#FFD700";
              ctx.beginPath();
              ctx.moveTo(0, roofBase - roofH - 8 * s);
              ctx.lineTo(-4 * s, roofBase - roofH);
              ctx.lineTo(4 * s, roofBase - roofH);
              ctx.closePath();
              ctx.fill();
              ctx.fillStyle = "#FFA000";
              ctx.beginPath();
              ctx.arc(0, roofBase - roofH - 4 * s, 3 * s, 0, Math.PI * 2);
              ctx.fill();

              // 10. Detailed Waving Banner
              ctx.save();
              const poleX = -w * 0.7;
              const poleY = -w * tanA - h * 0.9 - baseH;
              ctx.translate(poleX, poleY);

              // Flagpole with detail
              ctx.fillStyle = "#5D4037";
              ctx.fillRect(-2 * s, 0, 4 * s, -50 * s);
              ctx.fillStyle = "#795548";
              ctx.fillRect(-1.5 * s, 0, 3 * s, -50 * s);
              // Gold rings on pole
              ctx.fillStyle = "#FFD700";
              ctx.fillRect(-2.5 * s, -10 * s, 5 * s, 2 * s);
              ctx.fillRect(-2.5 * s, -25 * s, 5 * s, 2 * s);
              // Gold ornate tip
              ctx.beginPath();
              ctx.moveTo(0, -50 * s);
              ctx.lineTo(-4 * s, -54 * s);
              ctx.lineTo(0, -60 * s);
              ctx.lineTo(4 * s, -54 * s);
              ctx.closePath();
              ctx.fill();

              // Waving Banner
              const bannerTime = time * 3;
              ctx.translate(0, -45 * s);
              // Banner shadow
              ctx.fillStyle = "rgba(0,0,0,0.3)";
              ctx.beginPath();
              ctx.moveTo(2 * s, 2 * s);
              for (let i = 0; i <= 25 * s; i += s) {
                const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
                ctx.lineTo(i + 2 * s, wave + 2 * s);
              }
              ctx.lineTo(27 * s, 18 * s + Math.sin(bannerTime + 25 * s * 0.18) * 5 * s);
              for (let i = 25 * s; i >= 0; i -= s) {
                const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
                ctx.lineTo(i + 2 * s, 18 * s + wave + 2 * s);
              }
              ctx.fill();

              // Main banner
              ctx.fillStyle = "#8B0000";
              ctx.beginPath();
              ctx.moveTo(0, 0);
              for (let i = 0; i <= 25 * s; i += s) {
                const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
                ctx.lineTo(i, wave);
              }
              ctx.lineTo(25 * s, 18 * s + Math.sin(bannerTime + 25 * s * 0.18) * 5 * s);
              for (let i = 25 * s; i >= 0; i -= s) {
                const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
                ctx.lineTo(i, 18 * s + wave);
              }
              ctx.fill();

              // Banner inner highlight
              ctx.fillStyle = "#B71C1C";
              ctx.beginPath();
              ctx.moveTo(2 * s, 2 * s);
              for (let i = 2 * s; i <= 23 * s; i += s) {
                const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
                ctx.lineTo(i, wave + 1 * s);
              }
              ctx.lineTo(23 * s, 16 * s + Math.sin(bannerTime + 23 * s * 0.18) * 5 * s);
              for (let i = 23 * s; i >= 2 * s; i -= s) {
                const wave = Math.sin(bannerTime + i * 0.18) * 5 * s;
                ctx.lineTo(i, 16 * s + wave + 1 * s);
              }
              ctx.fill();

              // Princeton Orange Crest/Shield
              ctx.fillStyle = "#f97316";
              const crestX = 10 * s + Math.sin(bannerTime + 10 * s * 0.18) * 2 * s;
              ctx.beginPath();
              ctx.moveTo(crestX, 5 * s);
              ctx.lineTo(crestX - 5 * s, 7 * s);
              ctx.lineTo(crestX - 5 * s, 12 * s);
              ctx.lineTo(crestX, 15 * s);
              ctx.lineTo(crestX + 5 * s, 12 * s);
              ctx.lineTo(crestX + 5 * s, 7 * s);
              ctx.closePath();
              ctx.fill();
              ctx.restore();

              // 11. Shield Emblem on Wall (Above Door)
              ctx.save();
              ctx.translate(0, doorY - 44 * s);
              // Shield shape
              ctx.fillStyle = "#37474F";
              ctx.beginPath();
              ctx.moveTo(0, -10 * s);
              ctx.lineTo(-8 * s, -6 * s);
              ctx.lineTo(-8 * s, 4 * s);
              ctx.quadraticCurveTo(0, 12 * s, 8 * s, 4 * s);
              ctx.lineTo(8 * s, -6 * s);
              ctx.closePath();
              ctx.fill();
              // Inner shield
              ctx.fillStyle = "#f97316";
              ctx.beginPath();
              ctx.moveTo(0, -7 * s);
              ctx.lineTo(-5 * s, -4 * s);
              ctx.lineTo(-5 * s, 2 * s);
              ctx.quadraticCurveTo(0, 8 * s, 5 * s, 2 * s);
              ctx.lineTo(5 * s, -4 * s);
              ctx.closePath();
              ctx.fill();
              // "P" letter hint
              ctx.fillStyle = "#1a1a2e";
              ctx.font = `bold ${8 * s}px serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("P", 0, 0);
              ctx.restore();

              // 12. Spawn Effect (Enhanced)
              if (isSpawning) {
                // Magic circle on floor
                const spawnCircleY = -w * tanA * 2; // Match building center (doubled because of scale)
                ctx.save();
                ctx.translate(0, spawnCircleY * 0.5); // Apply offset before scale
                ctx.scale(1, 0.5);
                ctx.rotate(time * 2);
                ctx.strokeStyle = `rgba(79, 195, 247, ${1 - spawnCycle / 1500})`;
                ctx.lineWidth = 3 * s;
                ctx.setLineDash([8 * s, 4 * s]);
                ctx.beginPath();
                ctx.arc(0, 0, 45 * s, 0, Math.PI * 2);
                ctx.stroke();
                // Inner circle
                ctx.rotate(-time * 3);
                ctx.strokeStyle = `rgba(100, 220, 255, ${0.8 * (1 - spawnCycle / 1500)})`;
                ctx.setLineDash([4 * s, 8 * s]);
                ctx.beginPath();
                ctx.arc(0, 0, 30 * s, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // Light beam from entrance
                const beamAlpha = 0.6 * (1 - spawnCycle / 1500);
                const beamGrad = ctx.createLinearGradient(0, doorY, 0, -120 * s);
                beamGrad.addColorStop(0, `rgba(79, 195, 247, ${beamAlpha})`);
                beamGrad.addColorStop(0.3, `rgba(100, 220, 255, ${beamAlpha * 0.7})`);
                beamGrad.addColorStop(1, "transparent");
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(-12 * s, doorY);
                ctx.lineTo(-8 * s, -120 * s);
                ctx.lineTo(8 * s, -120 * s);
                ctx.lineTo(12 * s, doorY);
                ctx.fill();

                // Particle sparkles
                for (let i = 0; i < 5; i++) {
                  const px = (Math.sin(time * 4 + i * 1.5) * 15 - 7.5) * s;
                  const py = doorY - 20 * s - ((time * 40 + i * 20) % 60) * s;
                  const pAlpha = (1 - spawnCycle / 1500) * (0.5 + Math.sin(time * 10 + i) * 0.3);
                  ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
                  ctx.beginPath();
                  ctx.arc(px, py, 2 * s, 0, Math.PI * 2);
                  ctx.fill();
                }
              }

              break;
            }
          }
          ctx.restore();
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
        const troopOffsets = [
          { x: 0, y: -20 }, // Top
          { x: -20, y: 15 }, // Bottom left
          { x: 20, y: 15 }, // Bottom right
        ];
        const knightHP = TROOP_DATA.knight.hp;
        const newTroops: Troop[] = troopOffsets.map((offset, i) => ({
          id: generateId("troop"),
          ownerId: "spell",
          pos: { x: worldPos.x + offset.x, y: worldPos.y + offset.y },
          hp: knightHP,
          maxHp: knightHP,
          moving: false,
          lastAttack: 0,
          type: "knight" as const,
          rotation: 0,
          attackAnim: 0,
          selected: false,
          spawnPoint: worldPos,
          moveRadius: 200,
          spawnSlot: i,
          userTargetPos: undefined,
        }));
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
      const tower = towers.find((t) => t.id === towerId);
      if (!tower) return;

      // Cost structure: Level 1→2: 150, Level 2→3: 250, Level 3→4: 350
      const cost =
        tower.level === 1
          ? 150
          : tower.level === 2
            ? 250
            : tower.level === 3
              ? 350
              : 0;
      if (cost === 0 || pawPoints < cost) return;

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
    [towers, pawPoints, addParticles]
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
        (spellType === "fireball" || spellType === "lightning") &&
        enemies.length === 0
      ) {
        return;
      }
      setPawPoints((pp) => pp - cost);

      switch (spellType) {
        case "fireball": {
          // ENHANCED FIREBALL - Comes from sky with delay before massive explosion
          if (enemies.length > 0) {
            const randomEnemy =
              enemies[Math.floor(Math.random() * enemies.length)];
            const targetPos = getEnemyPosWithPath(randomEnemy, selectedMap);

            // Create incoming meteor effect (1 second delay)
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("meteor_incoming"),
                pos: { x: targetPos.x, y: targetPos.y - 300 },
                targetPos: targetPos,
                type: "meteor_incoming",
                progress: 0,
                size: 150,
                duration: 1000,
              },
            ]);

            // Delayed impact after 1 second
            setTimeout(() => {
              setEnemies((prev) =>
                prev
                  .map((e) => {
                    const pos = getEnemyPosWithPath(e, selectedMap);
                    const dist = distance(pos, targetPos);
                    if (dist < 150) {
                      // Damage falls off with distance
                      const damageMultiplier = 1 - (dist / 150) * 0.5;
                      const damage = Math.floor(200 * damageMultiplier);
                      const newHp = e.hp - damage;
                      if (newHp <= 0) {
                        setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                        addParticles(pos, "explosion", 15);
                        addParticles(pos, "fire", 10);
                        return null as any;
                      }
                      return { ...e, hp: newHp, damageFlash: 300 };
                    }
                    return e;
                  })
                  .filter(Boolean)
              );

              // Create massive explosion effect
              setEffects((ef) => [
                ...ef,
                {
                  id: generateId("meteor_impact"),
                  pos: targetPos,
                  type: "meteor_impact",
                  progress: 0,
                  size: 150,
                },
              ]);
              addParticles(targetPos, "explosion", 50);
              addParticles(targetPos, "fire", 30);
              addParticles(targetPos, "smoke", 20);
            }, 1000);
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
                          setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                          addParticles(targetPos, "spark", 25);
                          addParticles(targetPos, "glow", 15);
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
          const bonusPerEnemy = 5;
          const basePayout = 80;
          const enemyBonus = Math.min(enemies.length * bonusPerEnemy, 50);
          const totalPayout = basePayout + enemyBonus;

          setPawPoints((pp) => pp + totalPayout);

          // Create money aura around all enemies
          setEffects((ef) => [
            ...ef,
            {
              id: generateId("payday_aura"),
              pos: { x: 0, y: 0 },
              type: "payday_aura",
              progress: 0,
              size: 0,
              duration: 3000,
              enemies: enemies.map((e) => e.id),
            },
          ]);

          // Create gold particles on each enemy
          enemies.forEach((e) => {
            const pos = getEnemyPosWithPath(e, selectedMap);
            addParticles(pos, "gold", 12);
          });
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
        // HIGH NOTE - Devastating sonic blast with huge radius
        const noteRadius = 250;
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
                  setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
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
        // METEOR STRIKE - Massive AoE damage
        const strikeRadius = 120;
        const nearbyEnemies = enemies.filter(
          (e) =>
            distance(hero.pos, getEnemyPosWithPath(e, selectedMap)) <
            strikeRadius
        );
        // Deal massive damage
        setEnemies((prev) =>
          prev
            .map((e) => {
              const isTarget = nearbyEnemies.find((ne) => ne.id === e.id);
              if (isTarget) {
                const newHp = e.hp - 200;
                if (newHp <= 0) {
                  addParticles(
                    getEnemyPosWithPath(e, selectedMap),
                    "explosion",
                    12
                  );
                  setPawPoints((pp) => pp + ENEMY_DATA[e.type].bounty);
                  return null as any;
                }
                return {
                  ...e,
                  hp: newHp,
                  stunUntil: Date.now() + 500,
                  damageFlash: 300,
                };
              }
              return e;
            })
            .filter(Boolean)
        );
        // Create meteor strike effect
        setEffects((ef) => [
          ...ef,
          {
            id: generateId("meteor"),
            pos: hero.pos,
            type: "meteor_strike",
            progress: 0,
            size: strikeRadius,
          },
        ]);
        addParticles(hero.pos, "explosion", 40);
        addParticles(hero.pos, "fire", 25);
        addParticles(hero.pos, "smoke", 15);
        break;
      }

      case "scott": {
        // INSPIRATION - Boost all tower damage
        const boostRadius = 450;
        setTowers((prev) =>
          prev.map((t) => {
            const tWorldPos = gridToWorld(t.pos);
            if (distance(hero.pos, tWorldPos) <= boostRadius) {
              return {
                ...t,
                damageBoost: 1.5,
                boostEnd: Date.now() + 8000, // 8 second duration
                isBuffed: true,
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
        const knightOffsets = [
          { x: -30, y: -20 },
          { x: 30, y: -20 },
          { x: 0, y: 30 },
        ];
        const newTroops: Troop[] = knightOffsets.map((offset, i) => ({
          id: generateId("troop"),
          ownerId: hero.id,
          type: "knight" as TroopType,
          pos: { x: hero.pos.x + offset.x, y: hero.pos.y + offset.y },
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
          spawnPoint: { x: hero.pos.x + offset.x, y: hero.pos.y + offset.y },
          moveRadius: 150, // Allow knights to roam and engage enemies
        }));
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
        waveReached={currentWave}
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
              const tData = TOWER_DATA[tower.type];
              const stats = calculateTowerStats(
                tower.type,
                tower.level,
                tower.upgrade,
                tower.rangeBoost || 1,
                tower.damageBoost || 1
              );
              return (
                <Tooltip
                  position={mousePos}
                  content={
                    <>
                      <div className="text-sm font-bold text-amber-300 mb-1">
                        {tData.name}
                      </div>
                      <div className="text-xs text-amber-400">{tData.desc}</div>
                      <div className="text-[10px] text-amber-500 mt-1">
                        Level {tower.level}
                        {tower.level === 4 &&
                          tower.upgrade &&
                          ` (Path ${tower.upgrade})`}
                      </div>
                      <div className="flex flex-wrap gap-x-2 text-[9px] mt-1">
                        {stats.damage > 0 && (
                          <span className="text-red-400">DMG: {Math.floor(stats.damage)}</span>
                        )}
                        {stats.range > 0 && (
                          <span className="text-blue-400">RNG: {Math.floor(stats.range)}</span>
                        )}
                        {stats.attackSpeed > 0 && (
                          <span className="text-green-400">SPD: {stats.attackSpeed}ms</span>
                        )}
                        {stats.slowAmount && stats.slowAmount > 0 && (
                          <span className="text-purple-400">SLOW: {Math.round(stats.slowAmount * 100)}%</span>
                        )}
                        {tower.type === "station" && (
                          <span className="text-amber-400">
                            Troops: {tower.currentTroopCount || 0}/{MAX_STATION_TROOPS}
                          </span>
                        )}
                        {tower.type === "club" && stats.income && (
                          <span className="text-amber-400">+{stats.income}PP/{(stats.incomeInterval || 8000) / 1000}s</span>
                        )}
                      </div>
                    </>
                  }
                />
              );
            })()}
          {hoveredBuildTower &&
            (() => {
              const tData = TOWER_DATA[hoveredBuildTower];
              return (
                <Tooltip
                  position={mousePos}
                  content={
                    <>
                      <div className="text-sm font-bold text-amber-300 mb-1">
                        {tData.name}
                      </div>
                      <div className="text-xs text-amber-400">{tData.desc}</div>
                      <div className="text-[10px] text-amber-500 mt-1">
                        Cost: {tData.cost}PP
                        {tData.attackSpeed > 0 &&
                          ` | DMG: ${tData.damage} | RNG: ${tData.range}`}
                      </div>
                    </>
                  }
                />
              );
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
