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
} from "./utils";
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
const ENEMY_SPEED_MODIFIER = 0.75; // Global enemy speed multiplier (slower enemies)

// Helper to get enemy position using their pathKey for dual-path support
const getEnemyPosWithPath = (enemy: Enemy, defaultMap: string): Position => {
  const pathKey = enemy.pathKey || defaultMap;
  return getEnemyPosition(enemy, pathKey);
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

  // Add particles helper
  const addParticles = useCallback(
    (pos: Position, type: Particle["type"], count: number) => {
      const newParticles: Particle[] = [];
      const colors = PARTICLE_COLORS[type] || PARTICLE_COLORS.spark;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed =
          type === "explosion" ? 2 + Math.random() * 3 : 1 + Math.random() * 2;
        newParticles.push({
          id: generateId("particle"),
          pos: { ...pos },
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed - (type === "explosion" ? 1 : 0),
          },
          life: 500 + Math.random() * 500,
          maxLife: 1000,
          size: type === "smoke" ? 8 : type === "explosion" ? 6 : 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: type === "explosion" ? "spark" : (type as any),
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Reset game state when starting a new game (entering "playing" state)
  useEffect(() => {
    if (gameState === "playing") {
      clearAllTimers();
      // Reset all game state for a fresh start
      setPawPoints(INITIAL_PAW_POINTS);
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
      const levelData = LEVEL_DATA[selectedMap];
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
      // HAZARD LOGIC
      // =========================================================================
      if (LEVEL_DATA[selectedMap]?.hazards) {
        enemies.forEach((enemy) => {
          const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
          let environmentalSlow = 0;
          let environmentalSpeed = 1;

          LEVEL_DATA[selectedMap].hazards!.forEach((hazard) => {
            const hazWorldPos = gridToWorld(hazard.pos);
            const dist = distance(enemyPos, hazWorldPos);
            const rad = hazard.radius * TILE_SIZE;

            if (dist < rad) {
              switch (hazard.type) {
                case "poison_fog":
                  // DoT logic
                  const damage = (15 * deltaTime) / 1000;
                  setEnemies((prev) =>
                    prev.map((e) =>
                      e.id === enemy.id
                        ? {
                          ...e,
                          hp: Math.max(0, e.hp - damage),
                          damageFlash: 200,
                        }
                        : e
                    )
                  );
                  // Visual effect
                  addParticles(hazWorldPos, "magic", 5);
                  break;
                case "quicksand":
                  environmentalSlow = Math.max(environmentalSlow, 0.5);
                  addParticles(hazWorldPos, "smoke", 5);

                  break;
                case "ice_sheet":
                  environmentalSpeed = 1.6; // Enemies slide faster
                  addParticles(hazWorldPos, "ice", 5);

                  break;
                case "lava_geyser":
                  // Random burst damage
                  if (Math.random() < 0.095) {
                    // handle overkill properly
                    const lavaDamage = 5;
                    setEnemies((prev) =>
                      prev.map((e) => {
                        if (e.id === enemy.id) {
                          const newHp = e.hp - lavaDamage;
                          return {
                            ...e,
                            hp: newHp < 0 ? 0 : newHp,
                            damageFlash: 200,
                            dead: newHp <= 0,
                          };
                        }
                        return e;
                      })
                    );

                    addParticles(enemyPos, "fire", 10);
                  }
                  break;
              }
            }
          });

          // Apply modifiers to enemy
          setEnemies((prev) =>
            prev.map((e) => {
              if (e.id === enemy.id) {
                return {
                  ...e,
                  slowEffect: Math.max(e.slowEffect, environmentalSlow),
                  speed: ENEMY_DATA[e.type].speed * environmentalSpeed,
                };
              }
              return e;
            })
          );
        });
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
            const offsets = getFormationOffsets(3);

            // 1. Find the Anchor Point (closest point on the path to the barracks)
            const path = MAP_PATHS[selectedMap];
            const secondaryPath = MAP_PATHS[`${selectedMap}_b`] || null;
            const fullPath = secondaryPath ? path.concat(secondaryPath) : path;

            let closestDist = Infinity;
            let pathAnchor: Position = specWorldPos;
            for (let i = 0; i < fullPath.length - 1; i++) {
              const p1 = gridToWorldPath(fullPath[i]);
              const p2 = gridToWorldPath(fullPath[i + 1]);
              const candidate = closestPointOnLine(specWorldPos, p1, p2);
              const dist = distance(specWorldPos, candidate);
              if (dist < closestDist) {
                closestDist = dist;
                pathAnchor = candidate;
              }
            }

            // 2. Calculate specific target within formation on the path
            const targetPos = {
              x: pathAnchor.x + offsets[slot].x,
              y: pathAnchor.y + offsets[slot].y,
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
        if (spec.type === "vault" && specialTowerHp !== null) {
          // Enemies find the vault as a combat target
          enemies.forEach((e) => {
            const ePos = getEnemyPosWithPath(e, selectedMap);
            if (distance(ePos, specWorldPos) < 60) {
              // Enemy stops to "attack" the vault
              if (now - (e.lastTroopAttack || 0) > 1000) {
                const dmg = 20;
                setSpecialTowerHp((prev) => {
                  const newVal = prev! - dmg;
                  if (newVal <= 0) {
                    setLives(() => Math.max(0, lives - 5));
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
                // Slightly larger engagement for taunt
                if (now - (enemy.lastHeroAttack || 0) > 1000) {
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
              }
            }

            // 2. CHECK FOR VAULT LOGIC (Second Priority)
            if (
              spec?.type === "vault" &&
              specialTowerHp !== null &&
              specWorldPos
            ) {
              if (distance(enemyPos, specWorldPos) < 70) {
                if (now - (enemy.lastTroopAttack || 0) > 1000) {
                  setSpecialTowerHp((prev) => {
                    const newVal = Math.max(0, prev! - 25);
                    if (newVal <= 0) {
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
            // Hero Combat Check
            const nearbyHero =
              hero &&
                !hero.dead &&
                distance(enemyPos, hero.pos) < 60 &&
                !ENEMY_DATA[enemy.type].flying
                ? hero
                : null;
            if (nearbyHero) {
              if (now - enemy.lastHeroAttack > 1000) {
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

            // Movement logic
            if (!enemy.inCombat) {
              const pathKey = enemy.pathKey || selectedMap;
              const path = MAP_PATHS[pathKey];
              const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
              const newProgress =
                enemy.progress + (enemy.speed * speedMult * deltaTime) / 1000;
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

          addParticles(hero.pos, "explosion", 20);
          addParticles(hero.pos, "smoke", 10);
        }
        // Shield Expiration Logic
        if (hero.shieldActive && now > (hero.shieldEnd || 0)) {
          setHero((prev) => (prev ? { ...prev, shieldActive: false } : null));
          // Clear taunts from all enemies
          setEnemies((prev) =>
            prev.map((e) => ({ ...e, taunted: false, tauntTarget: undefined }))
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

      // First pass: Calculate troop damage from enemies
      const troopDamage: { [id: string]: number } = {};
      const enemiesAttackingTroops: { [enemyId: string]: string } = {};

      enemies.forEach((enemy) => {
        if (enemy.frozen || now < enemy.stunUntil) return;
        if (ENEMY_DATA[enemy.type].flying) return;
        if (now - enemy.lastTroopAttack <= 1000) return;

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
              if (now - enemy.lastHeroAttack > 1000) {
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

                if (now - enemy.lastRangedAttack > enemyData.attackSpeed) {
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
            // Move enemy along path
            if (!enemy.inCombat) {
              // Use enemy's pathKey for dual-path support
              const pathKey = enemy.pathKey || selectedMap;
              const path = MAP_PATHS[pathKey];
              const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
              const newProgress =
                enemy.progress +
                (ENEMY_DATA[enemy.type].speed * speedMult * deltaTime) / 1000;
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
      // Tower attacks
      towers.forEach((tower) => {
        const tData = TOWER_DATA[tower.type];
        const towerWorldPos = gridToWorld(tower.pos);

        // Final Buffed Stats for this tick
        const finalRange = tData.range * (tower.rangeBoost || 1.0);
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

          if (now - tower.lastAttack > incomeInterval) {
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
          enemies.forEach((e) => {
            const enemyPos = getEnemyPosWithPath(e, selectedMap);
            const dist = distance(towerWorldPos, enemyPos);
            if (dist <= finalRange) {
              // Base slow effect - increases with level
              // Level 1: 0.3, Level 2: 0.45, Level 3: 0.6, Level 4A: 0.8, Level 4B: 0.7
              const slowAmount =
                tower.level === 1
                  ? 0.3
                  : tower.level === 2
                    ? 0.45
                    : tower.level === 3
                      ? 0.6 // Arcane Library
                      : tower.upgrade === "A"
                        ? 0.8 // Earthquake - stronger slow
                        : 0.7; // Blizzard

              // Level 3 (Arcane Library) - adds minor magic damage
              if (tower.level === 3 && now - tower.lastAttack > 500) {
                const arcaneDamage = 8 * finalDamageMult;
                setEnemies((prev) =>
                  prev
                    .map((enemy) => {
                      if (enemy.id === e.id) {
                        const newHp = enemy.hp - arcaneDamage;
                        if (newHp <= 0) {
                          setPawPoints(
                            (pp) => pp + ENEMY_DATA[enemy.type].bounty
                          );
                          addParticles(enemyPos, "spark", 6);
                          return null as any;
                        }
                        return { ...enemy, hp: newHp, damageFlash: 80 };
                      }
                      return enemy;
                    })
                    .filter(Boolean)
                );
                appliedDamage = true;
              }

              // Blizzard (B upgrade at level 4) - periodic freeze
              if (
                tower.level === 4 &&
                tower.upgrade === "B" &&
                now - tower.lastAttack > 4000
              ) {
                setEnemies((prev) =>
                  prev.map((enemy) =>
                    dist <= finalRange && enemy.id === e.id
                      ? {
                        ...enemy,
                        frozen: true,
                        stunUntil: now + 2000,
                        slowed: true,
                        slowIntensity: 1,
                      }
                      : enemy
                  )
                );
              } else {
                setEnemies((prev) =>
                  prev.map((enemy) =>
                    enemy.id === e.id
                      ? {
                        ...enemy,
                        slowEffect: slowAmount,
                        slowed: true,
                        slowIntensity: slowAmount,
                      }
                      : enemy
                  )
                );
              }
              // Earthquake (A upgrade at level 4) - deal heavy damage
              if (
                tower.level === 4 &&
                tower.upgrade === "A" &&
                now - tower.lastAttack > 500
              ) {
                const earthquakeDamage = 35;
                setEnemies((prev) =>
                  prev
                    .map((enemy) => {
                      if (enemy.id === e.id) {
                        const newHp = enemy.hp - earthquakeDamage;
                        if (newHp <= 0) {
                          setPawPoints(
                            (pp) => pp + ENEMY_DATA[enemy.type].bounty
                          );
                          addParticles(enemyPos, "explosion", 8);
                          return null as any;
                        }
                        return {
                          ...enemy,
                          hp: newHp,
                          damageFlash: 150,
                          slowed: true,
                          slowIntensity: 0.8,
                        };
                      }
                      return enemy;
                    })
                    .filter(Boolean)
                );
                appliedDamage = true;
              }
              appliedSlow = true;
            }
          });
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
                  size: tData.range,
                  towerId: tower.id,
                  intensity:
                    tower.level >= 3 ? 1 : tower.level === 2 ? 0.7 : 0.5,
                },
              ];
            });
          }
          if ((appliedSlow || appliedDamage) && now - tower.lastAttack > 500) {
            setTowers((prev) =>
              prev.map((t) =>
                t.id === tower.id ? { ...t, lastAttack: now } : t
              )
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

            if (arrivedAtPlatform && now - tower.lastAttack > 8000) {
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
          if (now - tower.lastAttack > attackCooldown) {
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
          if (now - tower.lastAttack > attackCooldown) {
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
          if (now - tower.lastAttack > attackSpeed) {
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
          now - tower.lastAttack > tData.attackSpeed
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
      // Hero attacks
      if (hero && !hero.dead && hero.attackAnim === 0) {
        const heroData = HERO_DATA[hero.type];
        if (now - hero.lastAttack > heroData.attackSpeed) {
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
      // Troop attacks - with ranged support for centaurs and turrets
      troops.forEach((troop) => {
        if (!troop.type) return; // Skip troops without a type
        const troopData = TROOP_DATA[troop.type];
        if (!troopData) return; // Skip if troop data not found
        const attackRange = troopData.isRanged ? troopData.range || 150 : 65;
        const attackCooldown = troopData.attackSpeed || 1000;
        const lastAttack = troop.lastAttack ?? 0; // Default to 0 if undefined
        if (
          (troop.attackAnim ?? 0) === 0 &&
          now - lastAttack > attackCooldown
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
            // For ranged troops (centaurs/turrets), create a projectile visual
            if (troopData.isRanged) {
              const projType = troop.type === "turret" ? "bullet" : "spear";
              setProjectiles((prev) => [
                ...prev,
                {
                  id: generateId("proj"),
                  from: troop.pos,
                  to: targetPos,
                  progress: 0,
                  type: projType,
                  rotation,
                },
              ]);
            }
            setTroops((prev) =>
              prev.map((t) => {
                if (t.id === troop.id) {
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
      // Update effects
      setEffects((prev) =>
        prev
          .map((eff) => ({ ...eff, progress: eff.progress + deltaTime / 500 }))
          .filter((e) => e.progress < 1)
      );
      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => {
            const newLife = p.life - deltaTime;
            if (newLife <= 0) return null as any;
            return {
              ...p,
              life: newLife,
              pos: {
                x: p.pos.x + (p.velocity.x * deltaTime) / 16,
                y: p.pos.y + (p.velocity.y * deltaTime) / 16,
              },
              velocity: {
                x: p.velocity.x * 0.98,
                y: p.velocity.y * 0.98 + 0.02,
              },
            };
          })
          .filter(Boolean)
      );
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
    const catmullRom = (
      p0: Position,
      p1: Position,
      p2: Position,
      p3: Position,
      t: number
    ): Position => {
      const t2 = t * t;
      const t3 = t2 * t;
      return {
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    };

    // Generate smooth curve
    const generateSmoothPath = (controlPoints: Position[]): Position[] => {
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
        for (let j = 0; j < 10; j++) {
          smoothPath.push(
            catmullRom(
              extended[i - 1],
              extended[i],
              extended[i + 1],
              extended[i + 2],
              j / 10
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

    // Add organic wobble to path edges
    const addPathWobble = (pathPoints: Position[], wobbleAmount: number) => {
      seedState = mapSeed + 100;
      const left: Position[] = [],
        right: Position[] = [],
        center: Position[] = [];
      for (let i = 0; i < pathPoints.length; i++) {
        const p = pathPoints[i];
        let perpX = 0,
          perpY = 1;
        if (i < pathPoints.length - 1) {
          const next = pathPoints[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          perpX = -dy / len;
          perpY = dx / len;
        }
        const leftW = (seededRandom() - 0.5) * wobbleAmount;
        const rightW = (seededRandom() - 0.5) * wobbleAmount;
        left.push({
          x: p.x + perpX * (38 + leftW),
          y: p.y + perpY * (38 + leftW) * 0.5,
        });
        right.push({
          x: p.x - perpX * (38 + rightW),
          y: p.y - perpY * (38 + rightW) * 0.5,
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

    // Wheel tracks - themed
    ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
    ctx.lineWidth = 3 * cameraZoom;
    const trackOffset = 18 * cameraZoom;
    for (let track = -1; track <= 1; track += 2) {
      ctx.beginPath();
      for (let i = 0; i < smoothPath.length; i++) {
        const p = smoothPath[i];
        let perpX = 0,
          perpY = 1;
        if (i < smoothPath.length - 1) {
          const next = smoothPath[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          perpX = -dy / len;
          perpY = dx / len;
        }
        const wobble = Math.sin(i * 0.5 + mapSeed) * 2;
        const screenP = toScreen({
          x: p.x + perpX * ((trackOffset * track) / cameraZoom + wobble),
          y: p.y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.5,
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
      // Wheel tracks
      ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
      ctx.lineWidth = 3 * cameraZoom;
      for (let track = -1; track <= 1; track += 2) {
        ctx.beginPath();
        for (let i = 0; i < smoothSecondaryPath.length; i++) {
          const p = smoothSecondaryPath[i];
          let perpX = 0,
            perpY = 1;
          if (i < smoothSecondaryPath.length - 1) {
            const next = smoothSecondaryPath[i + 1];
            const dx = next.x - p.x;
            const dy = next.y - p.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            perpX = -dy / len;
            perpY = dx / len;
          }
          const wobble = Math.sin(i * 0.5 + mapSeed) * 2;
          const screenP = toScreen({
            x: p.x + perpX * ((trackOffset * track) / cameraZoom + wobble),
            y:
              p.y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.5,
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
    const firstWorldPos = gridToWorldPath(path[0]);
    const lastWorldPos = gridToWorldPath(path[path.length - 1]);
    const firstScreenPos = worldToScreen(
      firstWorldPos,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
    const lastScreenPos = worldToScreen(
      lastWorldPos,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
    // Get direction for each path end for gradient direction
    const secondWorldPos = gridToWorldPath(path[1]);
    const secondLastWorldPos = gridToWorldPath(path[path.length - 2]);
    const secondScreenPos = worldToScreen(
      secondWorldPos,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
    const secondLastScreenPos = worldToScreen(
      secondLastWorldPos,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
    // Helper function to draw fog that gradually obscures road end
    // Helper function to draw fog that gradually obscures road end - themed
    const fogBaseRgb = hexToRgb(theme.ground[2]);
    const drawRoadEndFog = (
      endPos: Position,
      towardsPos: Position,
      size: number
    ) => {
      const time = Date.now() / 4000;
      // Calculate direction from visible road towards the fog-obscured end
      const dx = endPos.x - towardsPos.x;
      const dy = endPos.y - towardsPos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const dirX = len > 0 ? dx / len : 1;
      const dirY = len > 0 ? dy / len : 0;
      // Draw graduated fog layers from road towards end
      // Start from the visible road and get progressively more obscured
      for (let layer = 0; layer < 8; layer++) {
        const layerDist = (layer - 2) * size * 0.2; // Start slightly before visible road
        const layerX = towardsPos.x + dirX * layerDist;
        const layerY = towardsPos.y + dirY * layerDist * 0.5; // Isometric Y compression
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
      const secFirstWorldPos = gridToWorldPath(secPath[0]);
      const secLastWorldPos = gridToWorldPath(secPath[secPath.length - 1]);
      const secFirstScreenPos = worldToScreen(
        secFirstWorldPos,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
      const secSecondWorldPos = gridToWorldPath(secPath[1]);
      const secSecondScreenPos = worldToScreen(
        secSecondWorldPos,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
      // Only draw fog at the secondary path entrance (start), not the end (they merge)
      drawRoadEndFog(secFirstScreenPos, secSecondScreenPos, 120);
    }

    // =========================================================================
    // HAZARDS - Rendered AFTER path, BEFORE decorations for proper layering
    // =========================================================================
    if (LEVEL_DATA[selectedMap].hazards) {
      LEVEL_DATA[selectedMap].hazards.forEach((haz) => {
        const sPos = toScreen(gridToWorld(haz.pos));
        const sRad = haz.radius * TILE_SIZE * cameraZoom;
        const time = Date.now() / 1000;
        const isoRatio = 0.5;

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

    // Generate theme-specific decorations
    seedState = mapSeed + 400;
    type DecorationType =
      | "tree"
      | "rock"
      | "bush"
      | "crater"
      | "battle_crater"
      | "fire_pit"
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
      | "flowers"
      | "signpost"
      | "fountain"
      | "bench"
      | "lamppost"
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
      | "giant_sphinx"
      | "sphinx"
      | "oasis_pool"
      | "ice_fortress"
      | "ice_throne"
      | "obsidian_castle"
      | "dark_throne"
      | "witch_cottage"
      | "cauldron"
      | "tentacle";

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

    // Helper to check if position is on path (+2 grid spaces buffer = ~128 world units)
    const pathBuffer = TILE_SIZE * 2; // 2 grid spaces from path
    const isOnPath = (worldPos: Position): boolean => {
      for (let j = 0; j < path.length - 1; j++) {
        const p1 = gridToWorldPath(path[j]);
        const p2 = gridToWorldPath(path[j + 1]);
        if (distanceToLineSegment(worldPos, p1, p2) < pathBuffer) {
          return true;
        }
      }
      if (levelData?.secondaryPath && MAP_PATHS[levelData.secondaryPath]) {
        const secPath = MAP_PATHS[levelData.secondaryPath];
        for (let j = 0; j < secPath.length - 1; j++) {
          const p1 = gridToWorldPath(secPath[j]);
          const p2 = gridToWorldPath(secPath[j + 1]);
          if (distanceToLineSegment(worldPos, p1, p2) < pathBuffer) {
            return true;
          }
        }
      }
      return false;
    };

    // Create deterministic zones for different decoration types
    // Divide the expanded grid into zones (+10 in every direction isometrically)
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

    // Environment decorations - clustered by zone with variation (expanded +10 in every direction)
    for (let i = 0; i < 320; i++) {
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

      // Scale varies by category with natural multi-factor variation
      let baseScale = 0.7;
      let scaleVar = 0.4;
      if (category === "trees") {
        baseScale = 0.75;
        scaleVar = 0.55;
      } else if (category === "structures") {
        baseScale = 0.85;
        scaleVar = 0.35;
      } else if (category === "scattered") {
        baseScale = 0.45;
        scaleVar = 0.45;
      } else { // terrain
        baseScale = 0.6;
        scaleVar = 0.5;
      }

      // Multi-factor scale variation for more natural look
      const scaleFactor1 = seededRandom();
      const scaleFactor2 = seededRandom();
      const combinedScale = (scaleFactor1 + scaleFactor2) / 2;
      const finalScale = baseScale + combinedScale * scaleVar * (0.8 + seededRandom() * 0.4);

      decorations.push({
        type,
        x: worldPos.x,
        y: worldPos.y,
        scale: finalScale,
        rotation: seededRandom() * Math.PI * 2,
        variant: Math.floor(seededRandom() * 4),
      });
    }

    // Add extra tree clusters at edges (forests feel)
    for (let cluster = 0; cluster < 12; cluster++) {
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

        // Natural tree scale variation
        const treeScaleBase = 0.65 + seededRandom() * 0.25;
        const treeScaleVar = (seededRandom() + seededRandom()) / 2 * 0.5;

        decorations.push({
          type: treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType,
          x: worldPos.x,
          y: worldPos.y,
          scale: treeScaleBase + treeScaleVar,
          rotation: seededRandom() * Math.PI * 2,
          variant: Math.floor(seededRandom() * 4),
        });
      }
    }

    // Add structure clusters (small villages/camps)
    for (let village = 0; village < 4; village++) {
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

        // Structure scale variation
        const structScaleBase = 0.75 + seededRandom() * 0.2;
        const structScaleVar = (seededRandom() + seededRandom()) / 2 * 0.35;

        decorations.push({
          type: structureTypes[Math.floor(seededRandom() * structureTypes.length)] as DecorationType,
          x: worldPos.x,
          y: worldPos.y,
          scale: structScaleBase + structScaleVar,
          rotation: seededRandom() * Math.PI * 0.25 - Math.PI * 0.125, // Slight rotation only
          variant: Math.floor(seededRandom() * 5),
        });
      }
    }

    // Battle damage (theme-appropriate) - expanded +10 in every direction
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
    for (let i = 0; i < 180; i++) {
      const gridX = seededRandom() * (GRID_WIDTH + 19) - 9.5;
      const gridY = seededRandom() * (GRID_HEIGHT + 19) - 9.5;
      const worldPos = gridToWorld({ x: gridX, y: gridY });
      const type =
        battleDecors[Math.floor(seededRandom() * battleDecors.length)];

      // Battle debris scale variation
      const battleScaleBase = 0.4 + seededRandom() * 0.25;
      const battleScaleVar = (seededRandom() + seededRandom() + seededRandom()) / 3 * 0.5;

      decorations.push({
        type,
        x: worldPos.x,
        y: worldPos.y,
        scale: battleScaleBase + battleScaleVar,
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
        }
      }
    }

    // Sort by Y for depth
    decorations.sort((a, b) => a.y - b.y);
    const decorTime = Date.now() / 1000;

    // Render decorations
    for (const dec of decorations) {
      const screenPos = toScreen({ x: dec.x, y: dec.y });
      const s = cameraZoom * dec.scale;
      const { type, rotation, variant } = dec;

      ctx.save();
      switch (type) {
        // === GRASSLAND DECORATIONS ===
        case "tree": {
          // Enhanced 3D isometric tree with detailed foliage and trunk
          const treeSway = Math.sin(decorTime * 1.2 + screenPos.x * 0.01) * 2 * s;

          // Ground shadow with gradient
          const treeShadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s
          );
          treeShadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
          treeShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = treeShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Trunk with 3D gradient
          const trunkGrad = ctx.createLinearGradient(
            screenPos.x - 6 * s, 0, screenPos.x + 6 * s, 0
          );
          trunkGrad.addColorStop(0, "#3d2817");
          trunkGrad.addColorStop(0.3, "#5d4037");
          trunkGrad.addColorStop(0.7, "#4a3428");
          trunkGrad.addColorStop(1, "#2d1a0f");

          ctx.fillStyle = trunkGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y + 5 * s);
          ctx.quadraticCurveTo(screenPos.x - 6 * s, screenPos.y - 10 * s, screenPos.x - 4 * s + treeSway * 0.3, screenPos.y - 22 * s);
          ctx.lineTo(screenPos.x + 4 * s + treeSway * 0.3, screenPos.y - 22 * s);
          ctx.quadraticCurveTo(screenPos.x + 6 * s, screenPos.y - 10 * s, screenPos.x + 5 * s, screenPos.y + 5 * s);
          ctx.closePath();
          ctx.fill();

          // Trunk bark texture
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1 * s;
          for (let b = 0; b < 4; b++) {
            const by = screenPos.y - 5 * s - b * 5 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 3 * s, by);
            ctx.quadraticCurveTo(screenPos.x, by - 2 * s, screenPos.x + 3 * s, by);
            ctx.stroke();
          }

          // Foliage color palettes
          const treeColors = [
            { base: "#2e7d32", mid: "#388e3c", light: "#4caf50", highlight: "#66bb6a" },
            { base: "#1b5e20", mid: "#2e7d32", light: "#388e3c", highlight: "#43a047" },
            { base: "#33691e", mid: "#558b2f", light: "#689f38", highlight: "#7cb342" },
            { base: "#3d5a3d", mid: "#4a6a4a", light: "#5a7a5a", highlight: "#6a8a6a" },
          ][variant] || { base: "#2e7d32", mid: "#388e3c", light: "#4caf50", highlight: "#66bb6a" };

          // Bottom foliage layer (darkest, largest)
          ctx.fillStyle = treeColors.base;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + treeSway * 0.5, screenPos.y - 20 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Left cluster
          ctx.fillStyle = treeColors.mid;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 10 * s + treeSway * 0.6, screenPos.y - 26 * s, 18 * s, 12 * s, -0.2, 0, Math.PI * 2);
          ctx.fill();

          // Right cluster
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 12 * s + treeSway * 0.6, screenPos.y - 24 * s, 16 * s, 11 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Middle layer
          ctx.fillStyle = treeColors.light;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + treeSway * 0.7, screenPos.y - 30 * s, 22 * s, 11 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Top layer (lightest, smallest)
          ctx.fillStyle = treeColors.highlight;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + treeSway * 0.8, screenPos.y - 38 * s, 16 * s, 8 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Crown highlight
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 5 * s + treeSway, screenPos.y - 40 * s, 10 * s, 5 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Subtle leaf detail dots
          ctx.fillStyle = "rgba(0,80,0,0.3)";
          for (let d = 0; d < 8; d++) {
            const dx = screenPos.x + (Math.sin(d * 2.5 + variant) * 15) * s + treeSway * 0.5;
            const dy = screenPos.y - 25 * s + (Math.cos(d * 1.8) * 8) * s;
            ctx.beginPath();
            ctx.arc(dx, dy, 3 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "rock":
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 1,
            screenPos.y + 4 * s,
            14 * s,
            7 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = ["#6d4c41", "#5d4037", "#757575", "#616161"][variant];
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 12 * s, screenPos.y + 2 * s);
          ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 14 * s);
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 12 * s, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 8 * s);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 12 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 8 * s);
          ctx.closePath();
          ctx.fill();
          break;
        case "nassau_hall": // Unique Princeton Landmark - High Detail
          // 1. Shadow for the entire building footprint
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 10 * s,
            65 * s,
            25 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // 2. Main Building Body (Sandstone/Orange-Brown brick)
          // We use a gradient to simulate the weathered stone look
          const stoneGrad = ctx.createLinearGradient(
            screenPos.x,
            screenPos.y - 40 * s,
            screenPos.x,
            screenPos.y + 20 * s
          );
          stoneGrad.addColorStop(0, "#a1887f"); // Lighter top
          stoneGrad.addColorStop(1, "#8d6e63"); // Darker base
          ctx.fillStyle = stoneGrad;
          ctx.fillRect(
            screenPos.x - 50 * s,
            screenPos.y - 30 * s,
            100 * s,
            45 * s
          );

          // 3. Central Pavilion (The slightly protruding middle section)
          ctx.fillStyle = "#795548"; // Slightly darker stone
          ctx.fillRect(
            screenPos.x - 15 * s,
            screenPos.y - 35 * s,
            30 * s,
            50 * s
          );

          // 4. Windows (The iconic rows of windows)
          ctx.fillStyle = "#263238"; // Dark window glass
          for (let row = 0; row < 3; row++) {
            for (let col = -4; col <= 4; col++) {
              if (col === 0) continue; // Skip the center for the main door
              const winX = screenPos.x + col * 11 * s - 2.5 * s;
              const winY = screenPos.y - 22 * s + row * 12 * s;
              ctx.fillRect(winX, winY, 5 * s, 7 * s);
              // Window Sill (White detail)
              ctx.fillStyle = "#f5f5f5";
              ctx.fillRect(winX, winY + 7 * s, 5 * s, 1.5 * s);
              ctx.fillStyle = "#263238";
            }
          }

          // 5. Main Entrance (The famous center door)
          ctx.fillStyle = "#3e2723"; // Dark wood
          ctx.fillRect(
            screenPos.x - 5 * s,
            screenPos.y - 2 * s,
            10 * s,
            15 * s
          );
          // Door Arch
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 2 * s, 5 * s, Math.PI, 0);
          ctx.fill();

          // 6. The Roof (Oxidized Copper Green)
          ctx.fillStyle = "#4a7c59"; // Princeton green/copper
          ctx.beginPath();
          // Left Slope
          ctx.moveTo(screenPos.x - 52 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 25 * s);
          ctx.closePath();
          ctx.fill();
          // Right Slope
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 52 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 25 * s);
          ctx.closePath();
          ctx.fill();
          // Central Pediment (Triangle above the door)
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 55 * s);
          ctx.lineTo(screenPos.x + 18 * s, screenPos.y - 35 * s);
          ctx.closePath();
          ctx.fill();

          // 7. The Cupola (White clock tower section)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(
            screenPos.x - 6 * s,
            screenPos.y - 65 * s,
            12 * s,
            15 * s
          ); // Base
          // Clock Face
          ctx.fillStyle = "#eceff1";
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 60 * s, 3.5 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#37474f";
          ctx.lineWidth = 1;
          ctx.stroke();

          // 8. Cupola Roof and Spire
          ctx.fillStyle = "#4a7c59";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 65 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 75 * s);
          ctx.lineTo(screenPos.x + 7 * s, screenPos.y - 65 * s);
          ctx.fill();
          // Golden Spire tip
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 75 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 85 * s);
          ctx.stroke();

          // 9. THE TIGERS (Entrance Statues)
          const drawTigerStatue = (xOff) => {
            ctx.fillStyle = "#546e7a"; // Bronze/Stone color
            // Pedestal
            ctx.fillRect(
              screenPos.x + xOff - 4 * s,
              screenPos.y + 12 * s,
              8 * s,
              5 * s
            );
            // Tiger Body
            ctx.beginPath();
            ctx.ellipse(
              screenPos.x + xOff,
              screenPos.y + 10 * s,
              5 * s,
              3 * s,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            // Tiger Head
            ctx.beginPath();
            ctx.arc(
              screenPos.x + xOff + (xOff > 0 ? 4 : -4) * s,
              screenPos.y + 8 * s,
              2.5 * s,
              0,
              Math.PI * 2
            );
            ctx.fill();
          };
          drawTigerStatue(-12 * s);
          drawTigerStatue(12 * s);
          break;
        case "bush":
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 3 * s,
            14 * s,
            6 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = ["#4caf50", "#388e3c", "#558b2f", "#33691e"][variant];
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 3 * s,
            14 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x - 3 * s,
            screenPos.y - 6 * s,
            6 * s,
            4 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case "grass": {
          // Enhanced 3D isometric grass tuft with wind animation
          const grassTime = decorTime * 1.8 + dec.x * 0.05;
          const grassPalettes = [
            { base: "#3a5a1a", mid: "#4a6a28", tip: "#5a7a38", accent: "#6a8a48" },
            { base: "#2d4f15", mid: "#3d5f22", tip: "#4d6f32", accent: "#5d7f42" },
            { base: "#456a2a", mid: "#557a38", tip: "#658a48", accent: "#759a58" },
            { base: "#5a7e32", mid: "#6a8e42", tip: "#7a9e52", accent: "#8aae62" }
          ][variant] || { base: "#3a5a1a", mid: "#4a6a28", tip: "#5a7a38", accent: "#6a8a48" };

          // Subtle ground shadow
          ctx.fillStyle = "rgba(0,30,0,0.12)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw multiple grass blades
          const bladeCount = 8;
          for (let g = 0; g < bladeCount; g++) {
            const bladeAngle = (g / bladeCount) * Math.PI - Math.PI / 2;
            const gx = screenPos.x + Math.cos(bladeAngle + Math.PI / 2) * (3 + g % 3) * s;
            const bladeHeight = (12 + (g % 3) * 4) * s;
            const bladePhase = grassTime + g * 0.4;
            const sway = Math.sin(bladePhase) * (3 + g % 2) * s;
            const swayCurve = Math.sin(bladePhase * 1.3) * 1.5 * s;

            // Blade thickness varies
            const bladeWidth = (1.2 + (g % 2) * 0.5) * s;

            // Gradient along blade
            const bladeGrad = ctx.createLinearGradient(
              gx, screenPos.y,
              gx + sway, screenPos.y - bladeHeight
            );
            bladeGrad.addColorStop(0, grassPalettes.base);
            bladeGrad.addColorStop(0.4, grassPalettes.mid);
            bladeGrad.addColorStop(0.7, grassPalettes.tip);
            bladeGrad.addColorStop(1, grassPalettes.accent);

            ctx.strokeStyle = bladeGrad;
            ctx.lineWidth = bladeWidth;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(gx, screenPos.y);
            ctx.bezierCurveTo(
              gx + swayCurve * 0.3, screenPos.y - bladeHeight * 0.35,
              gx + sway * 0.6, screenPos.y - bladeHeight * 0.65,
              gx + sway, screenPos.y - bladeHeight
            );
            ctx.stroke();
          }

          // A few tiny seed heads on taller blades
          if (variant > 1) {
            ctx.fillStyle = grassPalettes.accent;
            for (let sh = 0; sh < 2; sh++) {
              const shX = screenPos.x + (sh - 0.5) * 4 * s + Math.sin(grassTime + sh) * 2.5 * s;
              const shY = screenPos.y - 14 * s - sh * 2 * s;
              ctx.beginPath();
              ctx.ellipse(shX, shY, 1.5 * s, 2.5 * s, 0.2, 0, Math.PI * 2);
              ctx.fill();
            }
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
          // Enhanced 3D isometric wildflower cluster
          const flowerTime = decorTime + variant;
          const flowerPalettes = [
            { petals: "#ff5252", petalDark: "#d32f2f", center: "#ffeb3b", centerDark: "#f9a825", stem: "#2e7d32", leaf: "#388e3c" },
            { petals: "#ffeb3b", petalDark: "#f9a825", center: "#ff9800", centerDark: "#e65100", stem: "#2e7d32", leaf: "#388e3c" },
            { petals: "#e040fb", petalDark: "#9c27b0", center: "#fff176", centerDark: "#fdd835", stem: "#2e7d32", leaf: "#388e3c" },
            { petals: "#40c4ff", petalDark: "#0288d1", center: "#fff9c4", centerDark: "#fff59d", stem: "#2e7d32", leaf: "#388e3c" }
          ][variant % 4];

          // Ground shadow
          ctx.fillStyle = "rgba(0,30,0,0.15)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw 4 flowers at different heights
          const flowerPositions = [
            { x: -8, height: 18, size: 1.1, phase: 0 },
            { x: 0, height: 22, size: 1.3, phase: 0.8 },
            { x: 8, height: 16, size: 1, phase: 1.6 },
            { x: -3, height: 12, size: 0.8, phase: 2.2 }
          ];

          // Draw leaves first (behind)
          ctx.fillStyle = flowerPalettes.leaf;
          for (let lf = 0; lf < 3; lf++) {
            const lfX = screenPos.x + (lf - 1) * 7 * s;
            const lfSway = Math.sin(flowerTime * 1.5 + lf * 1.2) * 2 * s;

            ctx.beginPath();
            ctx.ellipse(
              lfX + lfSway, screenPos.y - 4 * s,
              2 * s, 5 * s, 0.3 + lf * 0.2, 0, Math.PI * 2
            );
            ctx.fill();
          }

          for (const fp of flowerPositions) {
            const fx = screenPos.x + fp.x * s;
            const sway = Math.sin(flowerTime * 1.5 + fp.phase) * 3 * s;
            const fTop = screenPos.y - fp.height * s;

            // Stem with curve
            const stemGrad = ctx.createLinearGradient(fx, screenPos.y, fx + sway, fTop);
            stemGrad.addColorStop(0, "#1b5e20");
            stemGrad.addColorStop(1, flowerPalettes.stem);
            ctx.strokeStyle = stemGrad;
            ctx.lineWidth = 2 * s * fp.size;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(fx, screenPos.y);
            ctx.quadraticCurveTo(fx + sway * 0.5, screenPos.y - fp.height * 0.5 * s, fx + sway, fTop);
            ctx.stroke();

            // Flower head
            const flowerX = fx + sway;
            const flowerY = fTop;
            const petalCount = 5 + (variant % 2);
            const petalSize = 4 * s * fp.size;

            // Outer petals with slight 3D
            for (let p = 0; p < petalCount; p++) {
              const pAngle = (p / petalCount) * Math.PI * 2 + flowerTime * 0.3;
              const pX = flowerX + Math.cos(pAngle) * petalSize * 0.9;
              const pY = flowerY + Math.sin(pAngle) * petalSize * 0.45;

              // Petal shadow
              ctx.fillStyle = flowerPalettes.petalDark;
              ctx.beginPath();
              ctx.ellipse(pX + 0.5 * s, pY + 0.5 * s, petalSize * 0.7, petalSize * 0.4, pAngle, 0, Math.PI * 2);
              ctx.fill();

              // Petal
              ctx.fillStyle = flowerPalettes.petals;
              ctx.beginPath();
              ctx.ellipse(pX, pY, petalSize * 0.7, petalSize * 0.4, pAngle, 0, Math.PI * 2);
              ctx.fill();
            }

            // Center
            ctx.fillStyle = flowerPalettes.centerDark;
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, petalSize * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = flowerPalettes.center;
            ctx.beginPath();
            ctx.arc(flowerX - 0.5 * s * fp.size, flowerY - 0.5 * s * fp.size, petalSize * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Pollen dots
            ctx.fillStyle = "rgba(255,200,50,0.6)";
            for (let pd = 0; pd < 3; pd++) {
              const pdAngle = (pd / 3) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(
                flowerX + Math.cos(pdAngle) * petalSize * 0.15,
                flowerY + Math.sin(pdAngle) * petalSize * 0.1,
                0.8 * s * fp.size, 0, Math.PI * 2
              );
              ctx.fill();
            }
          }
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
          const fountainTime = decorTime;
          const sprayPhase = Math.sin(fountainTime * 3);

          // Ground shadow
          const ftnShadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 8 * s, 35 * s
          );
          ftnShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
          ftnShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = ftnShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 8 * s, 35 * s, 18 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Outer basin rim (stone)
          const basinGrad = ctx.createLinearGradient(
            screenPos.x - 25 * s, screenPos.y - 5 * s,
            screenPos.x + 25 * s, screenPos.y + 5 * s
          );
          basinGrad.addColorStop(0, "#78909c");
          basinGrad.addColorStop(0.5, "#b0bec5");
          basinGrad.addColorStop(1, "#607d8b");

          ctx.fillStyle = basinGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Basin top surface
          ctx.fillStyle = "#cfd8dc";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 1 * s, 26 * s, 13 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Inner basin (darker rim)
          ctx.fillStyle = "#90a4ae";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 2 * s, 22 * s, 11 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Water surface with ripples
          const waterGrad = ctx.createRadialGradient(
            screenPos.x - 5 * s, screenPos.y - 6 * s, 0,
            screenPos.x, screenPos.y - 4 * s, 20 * s
          );
          waterGrad.addColorStop(0, "#81d4fa");
          waterGrad.addColorStop(0.5, "#4fc3f7");
          waterGrad.addColorStop(1, "#29b6f6");
          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 4 * s, 20 * s, 10 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Animated ripples
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 1 * s;
          for (let rp = 0; rp < 3; rp++) {
            const ripplePhase = (fountainTime * 0.8 + rp * 0.5) % 1.5;
            const rippleSize = 5 + ripplePhase * 10;
            const rippleAlpha = 0.4 - ripplePhase * 0.25;
            ctx.strokeStyle = `rgba(255,255,255,${rippleAlpha})`;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y - 4 * s, rippleSize * s, rippleSize * 0.5 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Center pedestal
          const pedGrad = ctx.createLinearGradient(
            screenPos.x - 6 * s, 0, screenPos.x + 6 * s, 0
          );
          pedGrad.addColorStop(0, "#78909c");
          pedGrad.addColorStop(0.3, "#cfd8dc");
          pedGrad.addColorStop(0.7, "#b0bec5");
          pedGrad.addColorStop(1, "#607d8b");

          ctx.fillStyle = pedGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 4 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 25 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 25 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 4 * s);
          ctx.closePath();
          ctx.fill();

          // Decorative ring on pedestal
          ctx.fillStyle = "#b0bec5";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 15 * s, 6 * s, 2.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Top bowl
          ctx.fillStyle = "#90a4ae";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 25 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#4fc3f7";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 26 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Water spout - main jet
          const sprayHeight = 20 + sprayPhase * 4;
          const sprayGrad = ctx.createLinearGradient(
            screenPos.x, screenPos.y - 27 * s,
            screenPos.x, screenPos.y - 27 * s - sprayHeight * s
          );
          sprayGrad.addColorStop(0, "rgba(225,245,254,0.9)");
          sprayGrad.addColorStop(0.5, "rgba(179,229,252,0.7)");
          sprayGrad.addColorStop(1, "rgba(129,212,250,0.3)");

          ctx.fillStyle = sprayGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 3 * s, screenPos.y - 27 * s);
          ctx.quadraticCurveTo(
            screenPos.x, screenPos.y - 27 * s - sprayHeight * s,
            screenPos.x + 3 * s, screenPos.y - 27 * s
          );
          ctx.closePath();
          ctx.fill();

          // Water droplets falling
          for (let wd = 0; wd < 8; wd++) {
            const dropPhase = (fountainTime * 2 + wd * 0.4) % 1.5;
            const dropAngle = (wd / 8) * Math.PI * 2 + fountainTime * 0.5;
            const dropDist = 8 + dropPhase * 12;
            const dropX = screenPos.x + Math.cos(dropAngle) * dropDist * s;
            const dropY = screenPos.y - 30 * s + dropPhase * 30 * s + Math.pow(dropPhase, 2) * 15 * s;
            const dropAlpha = 0.7 - dropPhase * 0.4;
            const dropSize = 2 - dropPhase * 0.8;

            if (dropSize > 0 && dropY < screenPos.y - 4 * s) {
              ctx.fillStyle = `rgba(225,245,254,${dropAlpha})`;
              ctx.beginPath();
              ctx.ellipse(dropX, dropY, dropSize * s, dropSize * 1.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Splash effects at water surface
          for (let sp = 0; sp < 4; sp++) {
            const splashPhase = (fountainTime * 2.5 + sp * 0.6) % 1;
            const splashAngle = (sp / 4) * Math.PI * 2 + 0.3;
            const splashX = screenPos.x + Math.cos(splashAngle) * 12 * s;
            const splashY = screenPos.y - 4 * s + Math.sin(splashAngle) * 5 * s;
            const splashAlpha = (1 - splashPhase) * 0.5;

            if (splashPhase < 0.4) {
              ctx.fillStyle = `rgba(255,255,255,${splashAlpha})`;
              ctx.beginPath();
              ctx.arc(splashX, splashY - splashPhase * 6 * s, (2 - splashPhase * 3) * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Light reflection on water
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 8 * s, screenPos.y - 6 * s, 6 * s, 3 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();
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
          // Enhanced 3D isometric palm tree with detailed fronds
          const palmSway = Math.sin(decorTime * 0.8 + screenPos.x * 0.01) * 3 * s;

          // Ground shadow
          const palmShadowGrad = ctx.createRadialGradient(
            screenPos.x + 20 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 20 * s, screenPos.y + 8 * s, 35 * s
          );
          palmShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
          palmShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = palmShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 20 * s, screenPos.y + 8 * s, 35 * s, 15 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Trunk with 3D gradient
          const trunkGrad = ctx.createLinearGradient(
            screenPos.x - 5 * s, 0, screenPos.x + 8 * s, 0
          );
          trunkGrad.addColorStop(0, "#5a4510");
          trunkGrad.addColorStop(0.4, "#8b6914");
          trunkGrad.addColorStop(1, "#5a4010");

          ctx.strokeStyle = trunkGrad;
          ctx.lineWidth = 8 * s;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 5 * s);
          ctx.bezierCurveTo(
            screenPos.x + 6 * s, screenPos.y - 15 * s,
            screenPos.x + 10 * s + palmSway * 0.3, screenPos.y - 35 * s,
            screenPos.x + 5 * s + palmSway * 0.5, screenPos.y - 55 * s
          );
          ctx.stroke();

          // Trunk texture bands
          ctx.strokeStyle = "#4a3508";
          ctx.lineWidth = 1.5 * s;
          for (let i = 0; i < 9; i++) {
            const progress = i / 9;
            const tx = screenPos.x + (5 + progress * 3) * s + palmSway * progress * 0.3;
            const ty = screenPos.y + 2 * s - progress * 52 * s;
            ctx.beginPath();
            ctx.arc(tx, ty, (4 - progress * 1.5) * s, -0.8, Math.PI + 0.8);
            ctx.stroke();
          }

          // Palm fronds (layered for depth)
          const frondColors = ["#1a5a18", "#228b22", "#2e8b40", "#3cb360"];
          const palmTopX = screenPos.x + 5 * s + palmSway * 0.5;
          const palmTopY = screenPos.y - 55 * s;

          // Draw 8 fronds with leaflets
          for (let f = 0; f < 8; f++) {
            const baseAngle = (f / 8) * Math.PI * 2;
            const frondSway = Math.sin(decorTime * 1.2 + f * 0.7) * 0.15;
            const angle = baseAngle + frondSway;
            const frondLen = (38 - (f % 2) * 5) * s;

            // Frond stem
            ctx.strokeStyle = frondColors[f % 4];
            ctx.lineWidth = (3.5 - f * 0.1) * s;
            ctx.lineCap = "round";

            const endX = palmTopX + Math.cos(angle) * frondLen;
            const endY = palmTopY + Math.sin(angle) * frondLen * 0.4 + 18 * s;
            const ctrlX = palmTopX + Math.cos(angle) * frondLen * 0.4;
            const ctrlY = palmTopY - 10 * s + Math.sin(angle) * 5 * s;

            ctx.beginPath();
            ctx.moveTo(palmTopX, palmTopY);
            ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
            ctx.stroke();

            // Leaflets along the frond
            ctx.lineWidth = 1.2 * s;
            for (let l = 0.25; l < 1; l += 0.12) {
              const lx = palmTopX + (endX - palmTopX) * l;
              const ly = palmTopY + (ctrlY - palmTopY) * l * 0.6 + (endY - ctrlY) * l;
              const leafAngle = angle + (l - 0.5) * 0.3;
              const leafLen = 10 * s * (1 - l * 0.4);

              ctx.beginPath();
              ctx.moveTo(lx, ly);
              ctx.lineTo(lx + Math.cos(leafAngle + 0.6) * leafLen, ly + Math.sin(leafAngle + 0.6) * leafLen * 0.3);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(lx, ly);
              ctx.lineTo(lx + Math.cos(leafAngle - 0.6) * leafLen, ly + Math.sin(leafAngle - 0.6) * leafLen * 0.3);
              ctx.stroke();
            }
          }

          // Coconuts for some variants
          if (variant < 2) {
            ctx.fillStyle = "#5a3a1a";
            for (let c = 0; c < 3; c++) {
              const cx = palmTopX - 4 * s + c * 4 * s;
              const cy = palmTopY + 5 * s;
              ctx.beginPath();
              ctx.arc(cx, cy, 3.5 * s, 0, Math.PI * 2);
              ctx.fill();
              // Coconut highlight
              ctx.fillStyle = "#7a5a3a";
              ctx.beginPath();
              ctx.arc(cx - 1 * s, cy - 1 * s, 1.5 * s, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#5a3a1a";
            }
          }
          break;
        }
        case "cactus": {
          // Enhanced 3D isometric saguaro cactus

          // Ground shadow
          const cacShadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 5 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 5 * s, 22 * s
          );
          cacShadowGrad.addColorStop(0, "rgba(0,0,0,0.22)");
          cacShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = cacShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 5 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main body gradient for 3D roundness
          const cacGrad = ctx.createLinearGradient(
            screenPos.x - 9 * s, 0, screenPos.x + 9 * s, 0
          );
          cacGrad.addColorStop(0, "#1a4a18");
          cacGrad.addColorStop(0.25, "#2a6a28");
          cacGrad.addColorStop(0.5, "#3a8a38");
          cacGrad.addColorStop(0.75, "#2a6a28");
          cacGrad.addColorStop(1, "#1a4a18");

          // Main body - rounded pillar
          ctx.fillStyle = cacGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 3 * s);
          ctx.quadraticCurveTo(screenPos.x - 9 * s, screenPos.y - 18 * s, screenPos.x - 7 * s, screenPos.y - 35 * s);
          ctx.quadraticCurveTo(screenPos.x, screenPos.y - 42 * s, screenPos.x + 7 * s, screenPos.y - 35 * s);
          ctx.quadraticCurveTo(screenPos.x + 9 * s, screenPos.y - 18 * s, screenPos.x + 8 * s, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Vertical ridges
          ctx.strokeStyle = "rgba(0,50,0,0.25)";
          ctx.lineWidth = 1.2 * s;
          for (let r = -2; r <= 2; r++) {
            ctx.beginPath();
            ctx.moveTo(screenPos.x + r * 2.5 * s, screenPos.y + 2 * s);
            ctx.quadraticCurveTo(
              screenPos.x + r * 2.2 * s, screenPos.y - 18 * s,
              screenPos.x + r * 1.8 * s, screenPos.y - 36 * s
            );
            ctx.stroke();
          }

          // Arms for variants
          if (variant > 0) {
            // Left arm
            const armGradL = ctx.createLinearGradient(
              screenPos.x - 22 * s, 0, screenPos.x - 10 * s, 0
            );
            armGradL.addColorStop(0, "#1a4a18");
            armGradL.addColorStop(0.5, "#3a8a38");
            armGradL.addColorStop(1, "#2a6a28");

            ctx.fillStyle = armGradL;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 7 * s, screenPos.y - 14 * s);
            ctx.quadraticCurveTo(screenPos.x - 20 * s, screenPos.y - 16 * s, screenPos.x - 20 * s, screenPos.y - 26 * s);
            ctx.quadraticCurveTo(screenPos.x - 20 * s, screenPos.y - 36 * s, screenPos.x - 15 * s, screenPos.y - 36 * s);
            ctx.quadraticCurveTo(screenPos.x - 12 * s, screenPos.y - 36 * s, screenPos.x - 12 * s, screenPos.y - 26 * s);
            ctx.quadraticCurveTo(screenPos.x - 12 * s, screenPos.y - 18 * s, screenPos.x - 7 * s, screenPos.y - 17 * s);
            ctx.closePath();
            ctx.fill();
          }

          if (variant > 1) {
            // Right arm
            const armGradR = ctx.createLinearGradient(
              screenPos.x + 10 * s, 0, screenPos.x + 18 * s, 0
            );
            armGradR.addColorStop(0, "#2a6a28");
            armGradR.addColorStop(0.5, "#3a8a38");
            armGradR.addColorStop(1, "#1a4a18");

            ctx.fillStyle = armGradR;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 7 * s, screenPos.y - 10 * s);
            ctx.quadraticCurveTo(screenPos.x + 17 * s, screenPos.y - 12 * s, screenPos.x + 17 * s, screenPos.y - 22 * s);
            ctx.quadraticCurveTo(screenPos.x + 17 * s, screenPos.y - 32 * s, screenPos.x + 12 * s, screenPos.y - 32 * s);
            ctx.quadraticCurveTo(screenPos.x + 9 * s, screenPos.y - 32 * s, screenPos.x + 9 * s, screenPos.y - 22 * s);
            ctx.quadraticCurveTo(screenPos.x + 9 * s, screenPos.y - 14 * s, screenPos.x + 7 * s, screenPos.y - 13 * s);
            ctx.closePath();
            ctx.fill();
          }

          // Spines
          ctx.fillStyle = "#e8e0c0";
          for (let sy = 0; sy < 7; sy++) {
            for (let sx = -1; sx <= 1; sx++) {
              const spineX = screenPos.x + sx * 4 * s + (sy % 2) * 2 * s;
              const spineY = screenPos.y - 5 * s - sy * 5 * s;
              ctx.beginPath();
              ctx.arc(spineX, spineY, 1 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Top highlight
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 38 * s, 5 * s, 2.5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Flower for variant 3
          if (variant === 3) {
            ctx.fillStyle = "#ff69b4";
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y - 42 * s, 4 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffff00";
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y - 42 * s, 2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "dune": {
          // Enhanced 3D isometric sand dune with wind-swept look

          // Main dune body gradient
          const duneGrad = ctx.createLinearGradient(
            screenPos.x - 50 * s, screenPos.y - 20 * s,
            screenPos.x + 50 * s, screenPos.y + 8 * s
          );
          duneGrad.addColorStop(0, "#e8c868");
          duneGrad.addColorStop(0.4, "#d4a84b");
          duneGrad.addColorStop(1, "#a08028");

          ctx.fillStyle = duneGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 55 * s, screenPos.y + 8 * s);
          ctx.quadraticCurveTo(screenPos.x - 28 * s, screenPos.y - 5 * s, screenPos.x - 8 * s, screenPos.y - 22 * s);
          ctx.quadraticCurveTo(screenPos.x + 15 * s, screenPos.y - 12 * s, screenPos.x + 38 * s, screenPos.y - 6 * s);
          ctx.quadraticCurveTo(screenPos.x + 55 * s, screenPos.y, screenPos.x + 60 * s, screenPos.y + 8 * s);
          ctx.closePath();
          ctx.fill();

          // Wind-blown crest highlight
          ctx.strokeStyle = "#f0d878";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 28 * s, screenPos.y - 5 * s);
          ctx.quadraticCurveTo(screenPos.x - 8 * s, screenPos.y - 22 * s, screenPos.x + 15 * s, screenPos.y - 12 * s);
          ctx.stroke();

          // Secondary foreground dune
          const dune2Grad = ctx.createLinearGradient(
            screenPos.x - 45 * s, screenPos.y,
            screenPos.x + 45 * s, screenPos.y + 8 * s
          );
          dune2Grad.addColorStop(0, "#d4a84b");
          dune2Grad.addColorStop(0.5, "#c9a040");
          dune2Grad.addColorStop(1, "#9a7828");

          ctx.fillStyle = dune2Grad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 45 * s, screenPos.y + 8 * s);
          ctx.quadraticCurveTo(screenPos.x - 18 * s, screenPos.y - 2 * s, screenPos.x + 8 * s, screenPos.y - 10 * s);
          ctx.quadraticCurveTo(screenPos.x + 32 * s, screenPos.y - 4 * s, screenPos.x + 50 * s, screenPos.y + 8 * s);
          ctx.closePath();
          ctx.fill();

          // Wind ripple lines
          ctx.strokeStyle = "rgba(160,120,50,0.35)";
          ctx.lineWidth = 1 * s;
          for (let r = 0; r < 5; r++) {
            const ry = screenPos.y + 1 * s + r * 1.3 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 38 * s + r * 6 * s, ry);
            ctx.quadraticCurveTo(
              screenPos.x - 12 * s + r * 4 * s, ry - 2.5 * s,
              screenPos.x + 22 * s + r * 6 * s, ry
            );
            ctx.stroke();
          }

          // Wind-blown sand particles
          const windOffset = Math.sin(decorTime * 2.5) * 6 * s;
          ctx.fillStyle = "rgba(220,190,100,0.4)";
          for (let p = 0; p < 5; p++) {
            const px = screenPos.x - 12 * s + p * 10 * s + windOffset;
            const py = screenPos.y - 14 * s + p * 2 * s + Math.sin(decorTime * 3 + p) * 2 * s;
            ctx.beginPath();
            ctx.ellipse(px, py, 4 * s, 1.2 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Sharp shadow edge on lee side
          ctx.fillStyle = "rgba(0,0,0,0.08)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 10 * s);
          ctx.quadraticCurveTo(screenPos.x + 25 * s, screenPos.y - 5 * s, screenPos.x + 50 * s, screenPos.y + 8 * s);
          ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 8 * s);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case "pyramid":
          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 25 * s);
          ctx.lineTo(screenPos.x - 50 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x + 50 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x + 50 * s, screenPos.y + 25 * s);
          ctx.lineTo(screenPos.x - 50 * s, screenPos.y + 25 * s);
          ctx.closePath();
          ctx.fill();
          // Right face (lit)
          ctx.fillStyle = "#d4a84b";
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 60 * s);
          ctx.lineTo(screenPos.x + 50 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 25 * s);
          ctx.closePath();
          ctx.fill();
          // Left face (shadow)
          ctx.fillStyle = "#9a7a3a";
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 60 * s);
          ctx.lineTo(screenPos.x - 50 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 25 * s);
          ctx.closePath();
          ctx.fill();
          // Edge highlight
          ctx.strokeStyle = "#e8c860";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 60 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 25 * s);
          ctx.stroke();
          break;
        case "obelisk":
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 5 * s,
            screenPos.y + 5 * s,
            12 * s,
            6 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Main shaft
          ctx.fillStyle = "#8b7355";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x - 6 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();
          // Hieroglyphs
          ctx.fillStyle = "#6b5344";
          for (let h = 0; h < 4; h++) {
            ctx.fillRect(
              screenPos.x - 4 * s,
              screenPos.y - 35 * s + h * 10 * s,
              8 * s,
              3 * s
            );
          }
          break;
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
        case "oasis_pool":
          // Irregular Sand Bank with height
          ctx.fillStyle = "#E6BF7E"; // Sand
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 35 * s, screenPos.y);
          ctx.quadraticCurveTo(
            screenPos.x - 10 * s,
            screenPos.y - 20 * s,
            screenPos.x + 30 * s,
            screenPos.y - 5 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x + 40 * s,
            screenPos.y + 10 * s,
            screenPos.x,
            screenPos.y + 15 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x - 40 * s,
            screenPos.y + 10 * s,
            screenPos.x - 35 * s,
            screenPos.y
          );
          ctx.fill();
          // Sand bank side edge (thickness)
          ctx.fillStyle = "#C4A164";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 35 * s, screenPos.y);
          ctx.quadraticCurveTo(
            screenPos.x,
            screenPos.y + 15 * s,
            screenPos.x + 30 * s,
            screenPos.y - 5 * s
          );
          ctx.lineTo(screenPos.x + 30 * s, screenPos.y);
          ctx.quadraticCurveTo(
            screenPos.x,
            screenPos.y + 20 * s,
            screenPos.x - 35 * s,
            screenPos.y + 5 * s
          );
          ctx.fill();

          // Water (inset)
          const waterGrad = ctx.createRadialGradient(
            screenPos.x,
            screenPos.y,
            5 * s,
            screenPos.x,
            screenPos.y,
            30 * s
          );
          waterGrad.addColorStop(0, "#0277BD"); // Deep blue center
          waterGrad.addColorStop(1, "#4FC3F7"); // Lighter edge
          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 2 * s,
            28 * s,
            12 * s,
            0.1,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Simple reflections/ripples
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y + 5 * s);
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 2 * s);
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 2 * s);
          ctx.stroke();
          break;
        // === WINTER DECORATIONS ===
        case "pine": {
          // Enhanced 3D isometric snow-covered pine tree
          const pineSway = Math.sin(decorTime * 0.6 + screenPos.x * 0.01) * 2 * s;

          // Ground shadow
          const pineShadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 10 * s, 25 * s
          );
          pineShadowGrad.addColorStop(0, "rgba(0,0,0,0.25)");
          pineShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = pineShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Trunk with gradient
          const pinetrunkGrad = ctx.createLinearGradient(
            screenPos.x - 5 * s, 0, screenPos.x + 5 * s, 0
          );
          pinetrunkGrad.addColorStop(0, "#3a2718");
          pinetrunkGrad.addColorStop(0.5, "#5a4030");
          pinetrunkGrad.addColorStop(1, "#3a2718");
          ctx.fillStyle = pinetrunkGrad;
          ctx.fillRect(screenPos.x - 5 * s, screenPos.y - 8 * s, 10 * s, 18 * s);

          // Bark texture
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1 * s;
          for (let b = 0; b < 3; b++) {
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 3 * s, screenPos.y - 2 * s - b * 4 * s);
            ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 2 * s - b * 4 * s);
            ctx.stroke();
          }

          // Snow-covered layers with depth
          const pineLayerColors = [
            { dark: "#0a3a2a", mid: "#1a4a3a", light: "#2a5a4a" },
            { dark: "#1a4a3a", mid: "#2a5a4a", light: "#3a6a5a" },
            { dark: "#2a5a4a", mid: "#3a6a5a", light: "#4a7a6a" },
            { dark: "#3a6a5a", mid: "#4a7a6a", light: "#5a8a7a" },
          ];

          for (let layer = 0; layer < 4; layer++) {
            const layerY = screenPos.y - 12 * s - layer * 16 * s;
            const layerW = (28 - layer * 6) * s;
            const colors = pineLayerColors[layer];
            const sway = pineSway * (layer + 1) * 0.15;

            // Back side (dark)
            ctx.fillStyle = colors.dark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW + sway, layerY);
            ctx.lineTo(screenPos.x + sway, layerY - 20 * s);
            ctx.lineTo(screenPos.x - layerW * 0.3 + sway, layerY - 5 * s);
            ctx.closePath();
            ctx.fill();

            // Front side (mid)
            ctx.fillStyle = colors.mid;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + layerW + sway, layerY);
            ctx.lineTo(screenPos.x + sway, layerY - 20 * s);
            ctx.lineTo(screenPos.x + layerW * 0.3 + sway, layerY - 5 * s);
            ctx.closePath();
            ctx.fill();

            // Snow layer on top
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW * 0.7 + sway, layerY - 6 * s);
            ctx.quadraticCurveTo(
              screenPos.x - layerW * 0.3 + sway, layerY - 12 * s,
              screenPos.x + sway, layerY - 20 * s
            );
            ctx.quadraticCurveTo(
              screenPos.x + layerW * 0.3 + sway, layerY - 12 * s,
              screenPos.x + layerW * 0.7 + sway, layerY - 6 * s
            );
            ctx.closePath();
            ctx.fill();

            // Snow edge highlight
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = 1.5 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW * 0.5 + sway, layerY - 8 * s);
            ctx.lineTo(screenPos.x + sway, layerY - 20 * s);
            ctx.stroke();

            // Dripping snow/icicles
            if (layer < 3) {
              ctx.fillStyle = "rgba(200,230,255,0.7)";
              for (let ic = 0; ic < 3; ic++) {
                const icX = screenPos.x + (ic - 1) * layerW * 0.5 + sway;
                const icLen = (4 + ic * 2) * s;
                ctx.beginPath();
                ctx.moveTo(icX - 2 * s, layerY);
                ctx.lineTo(icX, layerY + icLen);
                ctx.lineTo(icX + 2 * s, layerY);
                ctx.closePath();
                ctx.fill();
              }
            }
          }

          // Star/snow on top
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(screenPos.x + pineSway * 0.6, screenPos.y - 75 * s, 3 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case "snowman": {
          // Enhanced 3D isometric snowman with detailed features

          // Ground shadow
          const snowmanShadowGrad = ctx.createRadialGradient(
            screenPos.x + 3 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 3 * s, screenPos.y + 8 * s, 22 * s
          );
          snowmanShadowGrad.addColorStop(0, "rgba(100,130,180,0.2)");
          snowmanShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = snowmanShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bottom ball with 3D shading
          const bottomGrad = ctx.createRadialGradient(
            screenPos.x - 5 * s, screenPos.y - 10 * s, 0,
            screenPos.x, screenPos.y - 5 * s, 18 * s
          );
          bottomGrad.addColorStop(0, "#ffffff");
          bottomGrad.addColorStop(0.5, "#f5f5f5");
          bottomGrad.addColorStop(1, "#d0dce8");
          ctx.fillStyle = bottomGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 5 * s, 17 * s, 0, Math.PI * 2);
          ctx.fill();

          // Middle ball
          const middleGrad = ctx.createRadialGradient(
            screenPos.x - 4 * s, screenPos.y - 26 * s, 0,
            screenPos.x, screenPos.y - 24 * s, 13 * s
          );
          middleGrad.addColorStop(0, "#ffffff");
          middleGrad.addColorStop(0.6, "#f5f5f5");
          middleGrad.addColorStop(1, "#d8e4f0");
          ctx.fillStyle = middleGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 24 * s, 12 * s, 0, Math.PI * 2);
          ctx.fill();

          // Head
          const headGrad = ctx.createRadialGradient(
            screenPos.x - 3 * s, screenPos.y - 42 * s, 0,
            screenPos.x, screenPos.y - 40 * s, 10 * s
          );
          headGrad.addColorStop(0, "#ffffff");
          headGrad.addColorStop(0.5, "#f8f8f8");
          headGrad.addColorStop(1, "#e0e8f0");
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 40 * s, 9 * s, 0, Math.PI * 2);
          ctx.fill();

          // Top hat
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(screenPos.x - 8 * s, screenPos.y - 48 * s, 16 * s, 3 * s); // Brim
          ctx.fillRect(screenPos.x - 5 * s, screenPos.y - 60 * s, 10 * s, 12 * s); // Crown
          // Hat band
          ctx.fillStyle = "#c62828";
          ctx.fillRect(screenPos.x - 5 * s, screenPos.y - 52 * s, 10 * s, 3 * s);
          // Hat highlight
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(screenPos.x - 4 * s, screenPos.y - 58 * s, 3 * s, 8 * s);

          // Eyes
          ctx.fillStyle = "#0a0a0a";
          ctx.beginPath();
          ctx.arc(screenPos.x - 3 * s, screenPos.y - 42 * s, 2 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(screenPos.x + 3 * s, screenPos.y - 42 * s, 2 * s, 0, Math.PI * 2);
          ctx.fill();
          // Eye shine
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(screenPos.x - 3.5 * s, screenPos.y - 42.5 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(screenPos.x + 2.5 * s, screenPos.y - 42.5 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();

          // Carrot nose with 3D
          const noseGrad = ctx.createLinearGradient(
            screenPos.x, screenPos.y - 40 * s,
            screenPos.x + 12 * s, screenPos.y - 38 * s
          );
          noseGrad.addColorStop(0, "#ff8c00");
          noseGrad.addColorStop(0.5, "#ff6b00");
          noseGrad.addColorStop(1, "#cc5500");
          ctx.fillStyle = noseGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 40 * s);
          ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 38 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 36 * s);
          ctx.closePath();
          ctx.fill();

          // Smile (coal pieces)
          ctx.fillStyle = "#1a1a1a";
          for (let sm = 0; sm < 5; sm++) {
            const smAngle = Math.PI * 0.15 + (sm / 4) * Math.PI * 0.4;
            const smX = screenPos.x + Math.cos(smAngle) * 5 * s;
            const smY = screenPos.y - 35 * s + Math.sin(smAngle) * 3 * s;
            ctx.beginPath();
            ctx.arc(smX, smY, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Buttons
          ctx.fillStyle = "#1a1a1a";
          for (let btn = 0; btn < 3; btn++) {
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y - 18 * s - btn * 6 * s, 2 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Stick arms
          ctx.strokeStyle = "#4a3728";
          ctx.lineWidth = 2.5 * s;
          ctx.lineCap = "round";
          // Left arm
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 24 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 30 * s);
          ctx.stroke();
          // Left fingers
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x - 28 * s, screenPos.y - 35 * s);
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x - 30 * s, screenPos.y - 30 * s);
          ctx.stroke();
          // Right arm
          ctx.lineWidth = 2.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 10 * s, screenPos.y - 24 * s);
          ctx.lineTo(screenPos.x + 22 * s, screenPos.y - 28 * s);
          ctx.stroke();
          // Right fingers
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 22 * s, screenPos.y - 28 * s);
          ctx.lineTo(screenPos.x + 26 * s, screenPos.y - 32 * s);
          ctx.moveTo(screenPos.x + 22 * s, screenPos.y - 28 * s);
          ctx.lineTo(screenPos.x + 28 * s, screenPos.y - 27 * s);
          ctx.stroke();

          // Scarf
          ctx.fillStyle = "#c62828";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 32 * s, 10 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Scarf tails
          ctx.fillStyle = "#b71c1c";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y - 31 * s);
          ctx.quadraticCurveTo(screenPos.x + 15 * s, screenPos.y - 28 * s, screenPos.x + 12 * s, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 21 * s);
          ctx.quadraticCurveTo(screenPos.x + 10 * s, screenPos.y - 27 * s, screenPos.x + 6 * s, screenPos.y - 30 * s);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case "ice_crystal": {
          // Enhanced 3D isometric ice crystal formation
          const crystalPulse = 0.8 + Math.sin(decorTime * 2) * 0.2;

          // Ground glow
          const iceGlow = ctx.createRadialGradient(
            screenPos.x, screenPos.y + 3 * s, 0,
            screenPos.x, screenPos.y + 3 * s, 25 * s
          );
          iceGlow.addColorStop(0, `rgba(150,220,255,${0.3 * crystalPulse})`);
          iceGlow.addColorStop(1, "transparent");
          ctx.fillStyle = iceGlow;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 3 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main crystal spikes (6 pointed)
          for (let spike = 0; spike < 6; spike++) {
            const angle = (spike / 6) * Math.PI * 2;
            const spikeLen = (22 + (spike % 2) * 8) * s;
            const spikeWidth = 6 * s;

            // Crystal body
            ctx.fillStyle = spike % 2 === 0 ? "rgba(150,220,255,0.7)" : "rgba(100,180,255,0.6)";
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y - 5 * s);
            ctx.lineTo(
              screenPos.x + Math.cos(angle) * spikeLen,
              screenPos.y + Math.sin(angle) * spikeLen * 0.4 - 20 * s
            );
            ctx.lineTo(
              screenPos.x + Math.cos(angle + 0.15) * spikeWidth,
              screenPos.y + Math.sin(angle + 0.15) * spikeWidth * 0.4
            );
            ctx.closePath();
            ctx.fill();

            // Crystal highlight edge
            ctx.fillStyle = "rgba(220,245,255,0.8)";
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y - 5 * s);
            ctx.lineTo(
              screenPos.x + Math.cos(angle) * spikeLen,
              screenPos.y + Math.sin(angle) * spikeLen * 0.4 - 20 * s
            );
            ctx.lineTo(
              screenPos.x + Math.cos(angle - 0.08) * spikeLen * 0.7,
              screenPos.y + Math.sin(angle - 0.08) * spikeLen * 0.3 - 12 * s
            );
            ctx.closePath();
            ctx.fill();
          }

          // Central core glow
          const coreGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y - 8 * s, 0,
            screenPos.x, screenPos.y - 8 * s, 10 * s
          );
          coreGrad.addColorStop(0, `rgba(255,255,255,${crystalPulse})`);
          coreGrad.addColorStop(0.4, `rgba(200,240,255,${0.7 * crystalPulse})`);
          coreGrad.addColorStop(1, "rgba(150,220,255,0)");
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 8 * s, 10 * s, 0, Math.PI * 2);
          ctx.fill();

          // Floating ice particles
          for (let p = 0; p < 6; p++) {
            const pAngle = (p / 6) * Math.PI * 2 + decorTime * 0.5;
            const pDist = 15 + Math.sin(decorTime * 2 + p) * 5;
            const pX = screenPos.x + Math.cos(pAngle) * pDist * s;
            const pY = screenPos.y - 10 * s + Math.sin(pAngle) * pDist * 0.4 * s - Math.sin(decorTime * 3 + p) * 5 * s;

            ctx.fillStyle = `rgba(200,240,255,${0.6 + Math.sin(decorTime * 2 + p) * 0.2})`;
            ctx.beginPath();
            ctx.arc(pX, pY, 2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "snow_pile": {
          // Enhanced 3D isometric snow drift with sparkles

          // Subtle shadow
          ctx.fillStyle = "rgba(100,130,170,0.15)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 8 * s, 40 * s, 15 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main snow mound - back layer
          const snowGrad1 = ctx.createLinearGradient(
            screenPos.x - 35 * s, screenPos.y - 18 * s,
            screenPos.x + 35 * s, screenPos.y + 6 * s
          );
          snowGrad1.addColorStop(0, "#f5f8fc");
          snowGrad1.addColorStop(0.5, "#e8eef5");
          snowGrad1.addColorStop(1, "#d0d8e5");

          ctx.fillStyle = snowGrad1;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 35 * s, screenPos.y + 6 * s);
          ctx.quadraticCurveTo(screenPos.x - 20 * s, screenPos.y - 10 * s, screenPos.x - 5 * s, screenPos.y - 18 * s);
          ctx.quadraticCurveTo(screenPos.x + 12 * s, screenPos.y - 10 * s, screenPos.x + 28 * s, screenPos.y - 6 * s);
          ctx.quadraticCurveTo(screenPos.x + 40 * s, screenPos.y, screenPos.x + 42 * s, screenPos.y + 6 * s);
          ctx.closePath();
          ctx.fill();

          // Front snow layer
          const snowGrad2 = ctx.createLinearGradient(
            screenPos.x - 30 * s, screenPos.y - 8 * s,
            screenPos.x + 30 * s, screenPos.y + 6 * s
          );
          snowGrad2.addColorStop(0, "#ffffff");
          snowGrad2.addColorStop(0.4, "#f8fafc");
          snowGrad2.addColorStop(1, "#e5ecf2");

          ctx.fillStyle = snowGrad2;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 30 * s, screenPos.y + 6 * s);
          ctx.quadraticCurveTo(screenPos.x - 12 * s, screenPos.y - 4 * s, screenPos.x + 5 * s, screenPos.y - 10 * s);
          ctx.quadraticCurveTo(screenPos.x + 22 * s, screenPos.y - 4 * s, screenPos.x + 35 * s, screenPos.y + 6 * s);
          ctx.closePath();
          ctx.fill();

          // Edge highlight
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 18 * s, screenPos.y - 6 * s);
          ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 16 * s, screenPos.x + 10 * s, screenPos.y - 8 * s);
          ctx.stroke();

          // Blue shadow tint
          ctx.fillStyle = "rgba(170,200,230,0.12)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 18 * s, screenPos.y + 2 * s, 12 * s, 5 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Sparkles
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          const sparkleTime = decorTime * 2.5;
          for (let sp = 0; sp < 6; sp++) {
            const sparklePhase = (sparkleTime + sp * 1.1) % 2;
            if (sparklePhase < 0.6) {
              const sparkleAlpha = Math.sin(sparklePhase / 0.6 * Math.PI);
              const spx = screenPos.x - 18 * s + (sp * 12 + Math.sin(sp * 2.1) * 6) * s;
              const spy = screenPos.y - 6 * s - sp * 1.5 * s + Math.sin(sp * 1.5) * 4 * s;

              ctx.fillStyle = `rgba(255,255,255,${sparkleAlpha * 0.9})`;
              // Star sparkle shape
              ctx.beginPath();
              ctx.moveTo(spx, spy - 2.5 * s);
              ctx.lineTo(spx + 0.6 * s, spy - 0.6 * s);
              ctx.lineTo(spx + 2.5 * s, spy);
              ctx.lineTo(spx + 0.6 * s, spy + 0.6 * s);
              ctx.lineTo(spx, spy + 2.5 * s);
              ctx.lineTo(spx - 0.6 * s, spy + 0.6 * s);
              ctx.lineTo(spx - 2.5 * s, spy);
              ctx.lineTo(spx - 0.6 * s, spy - 0.6 * s);
              ctx.closePath();
              ctx.fill();
            }
          }
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
          // Enhanced 3D isometric lava pool with dynamic effects
          const lavaTime = decorTime * 1.5;
          const lavaPulse = 0.85 + Math.sin(lavaTime * 2) * 0.15;

          // Outer heat glow
          const heatGlow = ctx.createRadialGradient(
            screenPos.x, screenPos.y, 15 * s,
            screenPos.x, screenPos.y, 50 * s
          );
          heatGlow.addColorStop(0, `rgba(255,80,0,${0.4 * lavaPulse})`);
          heatGlow.addColorStop(0.5, `rgba(255,40,0,${0.2 * lavaPulse})`);
          heatGlow.addColorStop(1, "transparent");
          ctx.fillStyle = heatGlow;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 50 * s, 25 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Outer rock rim
          const rimGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y, 18 * s,
            screenPos.x, screenPos.y, 32 * s
          );
          rimGrad.addColorStop(0, "#3a2020");
          rimGrad.addColorStop(0.5, "#1a1010");
          rimGrad.addColorStop(1, "#2a1818");
          ctx.fillStyle = rimGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 32 * s, 16 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rock rim texture
          ctx.strokeStyle = "#4a3030";
          ctx.lineWidth = 2 * s;
          for (let r = 0; r < 8; r++) {
            const rAngle = (r / 8) * Math.PI * 2;
            const rX = screenPos.x + Math.cos(rAngle) * 28 * s;
            const rY = screenPos.y + Math.sin(rAngle) * 14 * s;
            ctx.beginPath();
            ctx.arc(rX, rY, 4 * s, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Inner dark edge
          ctx.fillStyle = "#1a0808";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 26 * s, 13 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main lava surface with gradient
          const lavaGrad = ctx.createRadialGradient(
            screenPos.x - 5 * s, screenPos.y - 2 * s, 0,
            screenPos.x, screenPos.y, 22 * s
          );
          lavaGrad.addColorStop(0, "#ffcc00");
          lavaGrad.addColorStop(0.3, "#ff8800");
          lavaGrad.addColorStop(0.6, "#ff4400");
          lavaGrad.addColorStop(1, "#cc2200");
          ctx.fillStyle = lavaGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, 22 * s, 11 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Lava crust patterns (cooled areas)
          ctx.fillStyle = "rgba(60,20,0,0.5)";
          for (let c = 0; c < 5; c++) {
            const cAngle = (c / 5) * Math.PI * 2 + lavaTime * 0.2;
            const cDist = 10 + Math.sin(lavaTime + c * 1.5) * 5;
            const cX = screenPos.x + Math.cos(cAngle) * cDist * s;
            const cY = screenPos.y + Math.sin(cAngle) * cDist * 0.5 * s;
            const cSize = 4 + Math.sin(lavaTime * 2 + c) * 2;
            ctx.beginPath();
            ctx.ellipse(cX, cY, cSize * s, cSize * 0.5 * s, cAngle, 0, Math.PI * 2);
            ctx.fill();
          }

          // Bright hot spot
          const hotGrad = ctx.createRadialGradient(
            screenPos.x - 4 * s, screenPos.y - 2 * s, 0,
            screenPos.x - 4 * s, screenPos.y - 2 * s, 10 * s
          );
          hotGrad.addColorStop(0, `rgba(255,255,200,${lavaPulse})`);
          hotGrad.addColorStop(0.4, `rgba(255,220,100,${0.7 * lavaPulse})`);
          hotGrad.addColorStop(1, "transparent");
          ctx.fillStyle = hotGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 4 * s, screenPos.y - 2 * s, 10 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Animated bubbles with pop effect
          for (let b = 0; b < 4; b++) {
            const bubblePhase = (lavaTime * 1.5 + b * 1.2) % 2;
            if (bubblePhase < 1.5) {
              const bubbleX = screenPos.x + Math.sin(b * 2.5) * 12 * s;
              const bubbleY = screenPos.y + Math.cos(b * 1.8) * 5 * s - bubblePhase * 3 * s;
              const bubbleSize = (3 - bubblePhase * 1.5) * s;

              if (bubbleSize > 0) {
                ctx.fillStyle = bubblePhase < 1 ? "#ffdd88" : "#ffaa44";
                ctx.beginPath();
                ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                ctx.fill();

                // Bubble highlight
                ctx.fillStyle = "rgba(255,255,200,0.6)";
                ctx.beginPath();
                ctx.arc(bubbleX - bubbleSize * 0.3, bubbleY - bubbleSize * 0.3, bubbleSize * 0.4, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Rising heat distortion particles
          ctx.fillStyle = "rgba(255,150,50,0.4)";
          for (let h = 0; h < 3; h++) {
            const hPhase = (lavaTime + h * 0.8) % 1.5;
            const hX = screenPos.x + Math.sin(h * 3.2 + lavaTime) * 8 * s;
            const hY = screenPos.y - 5 * s - hPhase * 15 * s;
            const hAlpha = 0.5 - hPhase * 0.3;
            ctx.fillStyle = `rgba(255,150,50,${hAlpha})`;
            ctx.beginPath();
            ctx.ellipse(hX, hY, 3 * s, 1.5 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "obsidian_spike": {
          // Enhanced 3D isometric obsidian spike with glossy volcanic glass look
          const spikeHeight = (40 + variant * 8) * s;

          // Ground shadow
          const spikeShadowGrad = ctx.createRadialGradient(
            screenPos.x + 8 * s, screenPos.y + 6 * s, 0,
            screenPos.x + 8 * s, screenPos.y + 6 * s, 20 * s
          );
          spikeShadowGrad.addColorStop(0, "rgba(0,0,0,0.35)");
          spikeShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = spikeShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 8 * s, screenPos.y + 6 * s, 20 * s, 10 * s, 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Back facet (darkest)
          ctx.fillStyle = "#0a0a12";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 6 * s, screenPos.y + 4 * s);
          ctx.lineTo(screenPos.x, screenPos.y - spikeHeight);
          ctx.lineTo(screenPos.x - 12 * s, screenPos.y + 4 * s);
          ctx.closePath();
          ctx.fill();

          // Main spike body - left facet
          ctx.fillStyle = "#15151f";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 12 * s, screenPos.y + 4 * s);
          ctx.lineTo(screenPos.x, screenPos.y - spikeHeight);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y - spikeHeight * 0.7);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y + 4 * s);
          ctx.closePath();
          ctx.fill();

          // Main spike body - right facet (slightly lighter)
          ctx.fillStyle = "#1a1a28";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 2 * s, screenPos.y + 4 * s);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y - spikeHeight * 0.7);
          ctx.lineTo(screenPos.x, screenPos.y - spikeHeight);
          ctx.lineTo(screenPos.x + 12 * s, screenPos.y + 4 * s);
          ctx.closePath();
          ctx.fill();

          // Glossy highlight strip (volcanic glass reflection)
          const glossGrad = ctx.createLinearGradient(
            screenPos.x - 8 * s, screenPos.y - spikeHeight * 0.8,
            screenPos.x + 4 * s, screenPos.y
          );
          glossGrad.addColorStop(0, "rgba(150,150,200,0.5)");
          glossGrad.addColorStop(0.3, "rgba(100,100,160,0.3)");
          glossGrad.addColorStop(0.6, "rgba(80,80,140,0.15)");
          glossGrad.addColorStop(1, "transparent");

          ctx.fillStyle = glossGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 2 * s);
          ctx.lineTo(screenPos.x - 1 * s, screenPos.y - spikeHeight * 0.95);
          ctx.lineTo(screenPos.x + 1 * s, screenPos.y - spikeHeight * 0.6);
          ctx.lineTo(screenPos.x - 3 * s, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();

          // Secondary small spike
          ctx.fillStyle = "#12121a";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y + 4 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - spikeHeight * 0.4);
          ctx.lineTo(screenPos.x + 14 * s, screenPos.y + 4 * s);
          ctx.closePath();
          ctx.fill();

          // Secondary spike highlight
          ctx.fillStyle = "rgba(130,130,180,0.25)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 8 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - spikeHeight * 0.38);
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Sharp edge highlights
          ctx.strokeStyle = "rgba(180,180,220,0.35)";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - spikeHeight);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - spikeHeight * 0.5);
          ctx.stroke();

          // Base crack detail
          ctx.strokeStyle = "rgba(40,20,0,0.4)";
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x - 4 * s, screenPos.y - 5 * s);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y + 2 * s);
          ctx.stroke();

          // Subtle lava glow at base for some variants
          if (variant > 1) {
            const baseGlow = ctx.createRadialGradient(
              screenPos.x, screenPos.y + 2 * s, 0,
              screenPos.x, screenPos.y + 2 * s, 12 * s
            );
            baseGlow.addColorStop(0, "rgba(255,80,0,0.25)");
            baseGlow.addColorStop(1, "transparent");
            ctx.fillStyle = baseGlow;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y + 2 * s, 12 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "charred_tree": {
          // Enhanced 3D isometric charred/burnt tree
          const charTime = decorTime;

          // Ground shadow and ash
          const ashGrad = ctx.createRadialGradient(
            screenPos.x + 3 * s, screenPos.y + 8 * s, 0,
            screenPos.x + 3 * s, screenPos.y + 8 * s, 25 * s
          );
          ashGrad.addColorStop(0, "rgba(30,30,30,0.3)");
          ashGrad.addColorStop(0.5, "rgba(40,35,30,0.2)");
          ashGrad.addColorStop(1, "transparent");
          ctx.fillStyle = ashGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 3 * s, screenPos.y + 8 * s, 25 * s, 12 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Trunk with charred texture gradient
          const trunkCharGrad = ctx.createLinearGradient(
            screenPos.x - 7 * s, 0, screenPos.x + 7 * s, 0
          );
          trunkCharGrad.addColorStop(0, "#0a0a0a");
          trunkCharGrad.addColorStop(0.3, "#1a1a1a");
          trunkCharGrad.addColorStop(0.5, "#252525");
          trunkCharGrad.addColorStop(0.7, "#1a1a1a");
          trunkCharGrad.addColorStop(1, "#0a0a0a");

          ctx.fillStyle = trunkCharGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 7 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 38 * s);
          ctx.lineTo(screenPos.x + 7 * s, screenPos.y + 5 * s);
          ctx.closePath();
          ctx.fill();

          // Charred bark texture
          ctx.strokeStyle = "#2a2520";
          ctx.lineWidth = 1.5 * s;
          for (let cb = 0; cb < 6; cb++) {
            const cbY = screenPos.y - 5 * s - cb * 6 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 5 * s + cb % 2 * 2 * s, cbY);
            ctx.lineTo(screenPos.x + 4 * s - cb % 2 * 2 * s, cbY + 2 * s);
            ctx.stroke();
          }

          // Broken branch stumps
          ctx.fillStyle = "#151515";

          // Left broken branch
          ctx.save();
          ctx.translate(screenPos.x - 4 * s, screenPos.y - 22 * s);
          ctx.rotate(-0.6);
          ctx.fillRect(0, -2 * s, 18 * s, 4 * s);
          // Jagged break end
          ctx.fillStyle = "#252520";
          ctx.beginPath();
          ctx.moveTo(18 * s, -2 * s);
          ctx.lineTo(20 * s, 0);
          ctx.lineTo(17 * s, 2 * s);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Right broken branch (higher)
          ctx.save();
          ctx.translate(screenPos.x + 4 * s, screenPos.y - 28 * s);
          ctx.rotate(0.5);
          ctx.fillStyle = "#151515";
          ctx.fillRect(0, -1.5 * s, 14 * s, 3 * s);
          ctx.fillStyle = "#252520";
          ctx.beginPath();
          ctx.moveTo(14 * s, -1.5 * s);
          ctx.lineTo(16 * s, 0);
          ctx.lineTo(13 * s, 1.5 * s);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Small broken stump
          ctx.fillStyle = "#181818";
          ctx.save();
          ctx.translate(screenPos.x + 3 * s, screenPos.y - 15 * s);
          ctx.rotate(0.8);
          ctx.fillRect(0, -1 * s, 8 * s, 2 * s);
          ctx.restore();

          // Glowing embers on trunk
          const emberPositions = [
            { x: -2, y: -26, size: 2.5 },
            { x: 3, y: -18, size: 2 },
            { x: -1, y: -12, size: 1.8 },
            { x: 2, y: -30, size: 1.5 },
            { x: -3, y: -8, size: 2.2 }
          ];

          for (let e = 0; e < emberPositions.length; e++) {
            const ep = emberPositions[e];
            const emberPulse = 0.5 + Math.sin(charTime * 3 + e * 1.2) * 0.4;

            // Ember glow
            const emberGlow = ctx.createRadialGradient(
              screenPos.x + ep.x * s, screenPos.y + ep.y * s, 0,
              screenPos.x + ep.x * s, screenPos.y + ep.y * s, ep.size * 3 * s
            );
            emberGlow.addColorStop(0, `rgba(255,100,0,${emberPulse})`);
            emberGlow.addColorStop(0.5, `rgba(255,50,0,${emberPulse * 0.4})`);
            emberGlow.addColorStop(1, "transparent");
            ctx.fillStyle = emberGlow;
            ctx.beginPath();
            ctx.arc(screenPos.x + ep.x * s, screenPos.y + ep.y * s, ep.size * 3 * s, 0, Math.PI * 2);
            ctx.fill();

            // Ember core
            ctx.fillStyle = `rgba(255,${150 + Math.sin(charTime * 4 + e) * 50},50,${emberPulse})`;
            ctx.beginPath();
            ctx.arc(screenPos.x + ep.x * s, screenPos.y + ep.y * s, ep.size * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Rising smoke wisps
          ctx.fillStyle = "rgba(80,80,80,0.25)";
          for (let sw = 0; sw < 3; sw++) {
            const smokePhase = (charTime * 0.8 + sw * 0.6) % 2;
            const smokeX = screenPos.x - 3 * s + sw * 3 * s + Math.sin(charTime + sw) * 3 * s;
            const smokeY = screenPos.y - 38 * s - smokePhase * 20 * s;
            const smokeAlpha = 0.3 - smokePhase * 0.15;
            const smokeSize = 3 + smokePhase * 4;

            ctx.fillStyle = `rgba(80,80,80,${smokeAlpha})`;
            ctx.beginPath();
            ctx.ellipse(smokeX, smokeY, smokeSize * s, smokeSize * 0.6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "ember": {
          // Enhanced floating ember particle with trails and glow
          const emberTime = decorTime * 2 + variant;
          const emberFloat = Math.sin(emberTime * 1.5) * 5 * s;
          const emberDrift = Math.sin(emberTime * 0.8 + variant * 2) * 3 * s;
          const emberPulse = 0.7 + Math.sin(emberTime * 4) * 0.3;
          const emberSize = (3 + variant * 0.5) * s;

          const emberX = screenPos.x + emberDrift;
          const emberY = screenPos.y + emberFloat;

          // Outer glow halo
          const outerGlow = ctx.createRadialGradient(
            emberX, emberY, 0,
            emberX, emberY, emberSize * 5
          );
          outerGlow.addColorStop(0, `rgba(255,100,0,${0.4 * emberPulse})`);
          outerGlow.addColorStop(0.4, `rgba(255,50,0,${0.2 * emberPulse})`);
          outerGlow.addColorStop(1, "transparent");
          ctx.fillStyle = outerGlow;
          ctx.beginPath();
          ctx.arc(emberX, emberY, emberSize * 5, 0, Math.PI * 2);
          ctx.fill();

          // Main ember body with gradient
          const emberGrad = ctx.createRadialGradient(
            emberX - emberSize * 0.3, emberY - emberSize * 0.3, 0,
            emberX, emberY, emberSize * 1.5
          );
          emberGrad.addColorStop(0, "#ffffcc");
          emberGrad.addColorStop(0.3, "#ffcc44");
          emberGrad.addColorStop(0.6, `rgb(255,${100 + Math.sin(emberTime * 3) * 50},0)`);
          emberGrad.addColorStop(1, "#cc3300");

          ctx.fillStyle = emberGrad;
          ctx.beginPath();
          ctx.arc(emberX, emberY, emberSize * 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Hot core
          ctx.fillStyle = `rgba(255,255,200,${emberPulse})`;
          ctx.beginPath();
          ctx.arc(emberX - emberSize * 0.2, emberY - emberSize * 0.2, emberSize * 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Trailing sparks (3 small trailing particles)
          for (let tr = 1; tr <= 3; tr++) {
            const trailDelay = tr * 0.15;
            const trailX = emberX - emberDrift * trailDelay * 2 - tr * 2 * s;
            const trailY = emberY - emberFloat * trailDelay - tr * 3 * s;
            const trailSize = emberSize * (0.5 - tr * 0.12);
            const trailAlpha = 0.6 - tr * 0.18;

            ctx.fillStyle = `rgba(255,${150 - tr * 30},0,${trailAlpha})`;
            ctx.beginPath();
            ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "obsidian_castle":
          // Sharp, dark, glossy volcanic glass structure
          const obsDark = "#1A1A1A";
          const obsMid = "#333333";
          const obsLight = "#555555"; // For sharp highlights
          const lavaGlow = "#FF3D00";

          // Ground presence
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            35 * s,
            15 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Main Tower (Isometric Prism with jagged top)
          // Side Face (Darkest)
          ctx.fillStyle = obsDark;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
          ctx.fill();
          // Front Face (Mid)
          ctx.fillStyle = obsMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
          ctx.fill();

          // top face (lightest)
          ctx.fillStyle = obsLight;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 60 * s);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s);
          ctx.fill();

          // Jagged Battlements
          ctx.fillStyle = obsMid;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 60 * s); // Spike 1
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 65 * s); // Main Spike
          ctx.lineTo(screenPos.x + 15 * s, screenPos.y - 50 * s);
          ctx.lineTo(screenPos.x + 23 * s, screenPos.y - 60 * s); // Spike 3
          ctx.lineTo(screenPos.x + 23 * s, screenPos.y - 50 * s);
          ctx.fill();

          // Lava "Windows" (Glowing cracks)
          ctx.shadowColor = lavaGlow;
          ctx.shadowBlur = 15 * s;
          ctx.fillStyle = lavaGlow;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Sharp Edge Highlights (makes it look shiny)
          ctx.strokeStyle = obsLight;
          ctx.lineWidth = 1.5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 10 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 40 * s); // center corner
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 45 * s); // top edge
          ctx.stroke();
          break;

        case "dark_throne":
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 10 * s,
            18 * s,
            8 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          const metal = "#263238";
          const metalHigh = "#546E7A";
          const cushion = "#B71C1c";

          // Spiky Base angled outwards
          ctx.fillStyle = metal;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 40 * s); // Left spike
          ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 25 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 55 * s); // Center spike
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 25 * s);
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y - 40 * s); // Right spike
          ctx.lineTo(screenPos.x + 20 * s, screenPos.y - 10 * s);
          ctx.fill();

          // Seat Cushion (Velvet look with gradient)
          const cushionGrad = ctx.createLinearGradient(
            screenPos.x,
            screenPos.y - 20 * s,
            screenPos.x,
            screenPos.y
          );
          cushionGrad.addColorStop(0, cushion);
          cushionGrad.addColorStop(1, "#880E4F");
          ctx.fillStyle = cushionGrad;
          ctx.fillRect(
            screenPos.x - 12 * s,
            screenPos.y - 20 * s,
            24 * s,
            12 * s
          );
          // Cushion edge highlight
          ctx.fillStyle = "#FF5252";
          ctx.fillRect(
            screenPos.x - 12 * s,
            screenPos.y - 20 * s,
            24 * s,
            2 * s
          );

          // Highlights on metal spikes
          ctx.strokeStyle = metalHigh;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x - 25 * s, screenPos.y - 40 * s);
          ctx.moveTo(screenPos.x, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 55 * s);
          ctx.stroke();
          break;

        // === SWAMP DECORATIONS ===
        case "swamp_tree": {
          // Enhanced 3D isometric gnarled swamp tree with hanging moss
          const swampTime = decorTime;

          // Murky water reflection/shadow
          const swampShadowGrad = ctx.createRadialGradient(
            screenPos.x + 5 * s, screenPos.y + 10 * s, 0,
            screenPos.x + 5 * s, screenPos.y + 10 * s, 30 * s
          );
          swampShadowGrad.addColorStop(0, "rgba(20,40,20,0.35)");
          swampShadowGrad.addColorStop(0.7, "rgba(10,30,15,0.2)");
          swampShadowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = swampShadowGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 5 * s, screenPos.y + 10 * s, 30 * s, 15 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Exposed roots
          ctx.strokeStyle = "#2a1a10";
          ctx.lineWidth = 3 * s;
          ctx.lineCap = "round";
          for (let rt = 0; rt < 4; rt++) {
            const rtAngle = -0.6 + rt * 0.4;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + Math.cos(rtAngle) * 6 * s, screenPos.y + 4 * s);
            ctx.quadraticCurveTo(
              screenPos.x + Math.cos(rtAngle) * 18 * s, screenPos.y + 2 * s,
              screenPos.x + Math.cos(rtAngle) * 25 * s, screenPos.y + 8 * s
            );
            ctx.stroke();
          }

          // Gnarled trunk with gradient
          const swampTrunkGrad = ctx.createLinearGradient(
            screenPos.x - 10 * s, 0, screenPos.x + 10 * s, 0
          );
          swampTrunkGrad.addColorStop(0, "#1a1208");
          swampTrunkGrad.addColorStop(0.3, "#3a2a18");
          swampTrunkGrad.addColorStop(0.6, "#4a3a20");
          swampTrunkGrad.addColorStop(1, "#2a1a10");

          ctx.fillStyle = swampTrunkGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 6 * s);
          ctx.bezierCurveTo(
            screenPos.x - 15 * s, screenPos.y - 10 * s,
            screenPos.x - 8 * s, screenPos.y - 25 * s,
            screenPos.x - 5 * s, screenPos.y - 45 * s
          );
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y - 48 * s);
          ctx.bezierCurveTo(
            screenPos.x + 12 * s, screenPos.y - 25 * s,
            screenPos.x + 15 * s, screenPos.y - 10 * s,
            screenPos.x + 10 * s, screenPos.y + 6 * s
          );
          ctx.closePath();
          ctx.fill();

          // Bark texture/knots
          ctx.fillStyle = "#1a1008";
          for (let kn = 0; kn < 3; kn++) {
            const knY = screenPos.y - 10 * s - kn * 12 * s;
            const knX = screenPos.x + (kn % 2 - 0.5) * 4 * s;
            ctx.beginPath();
            ctx.ellipse(knX, knY, 3 * s, 4 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Branches
          ctx.strokeStyle = "#3a2a18";
          ctx.lineWidth = 4 * s;
          // Left branch
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 6 * s, screenPos.y - 35 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 25 * s, screenPos.y - 40 * s,
            screenPos.x - 30 * s, screenPos.y - 32 * s
          );
          ctx.stroke();
          // Right branch
          ctx.beginPath();
          ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 38 * s);
          ctx.quadraticCurveTo(
            screenPos.x + 22 * s, screenPos.y - 45 * s,
            screenPos.x + 28 * s, screenPos.y - 38 * s
          );
          ctx.stroke();

          // Dark sparse foliage
          const foliageColors = ["#1a3a1a", "#2a4a25", "#1a3520"];
          for (let fc = 0; fc < 5; fc++) {
            const fcX = screenPos.x - 20 * s + fc * 12 * s + Math.sin(fc * 1.5) * 5 * s;
            const fcY = screenPos.y - 42 * s - fc * 3 * s + Math.cos(fc * 2) * 5 * s;
            ctx.fillStyle = foliageColors[fc % 3];
            ctx.beginPath();
            ctx.ellipse(fcX, fcY, 12 * s, 8 * s, fc * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Hanging spanish moss
          ctx.lineWidth = 1.5 * s;
          const mossColors = ["#4a6a45", "#5a7a55", "#3a5a35"];
          for (let m = 0; m < 8; m++) {
            const mx = screenPos.x - 25 * s + m * 7 * s;
            const mStartY = screenPos.y - 38 * s + Math.sin(m * 1.2) * 8 * s;
            const mLen = 15 + Math.sin(m * 2.1) * 8;
            const sway = Math.sin(swampTime * 0.8 + m * 0.7) * 4 * s;

            ctx.strokeStyle = mossColors[m % 3];
            ctx.beginPath();
            ctx.moveTo(mx, mStartY);
            ctx.bezierCurveTo(
              mx + sway * 0.5, mStartY + mLen * 0.3 * s,
              mx + sway, mStartY + mLen * 0.6 * s,
              mx + sway * 0.7, mStartY + mLen * s
            );
            ctx.stroke();

            // Moss wisps
            if (m % 2 === 0) {
              ctx.lineWidth = 1 * s;
              ctx.beginPath();
              ctx.moveTo(mx + sway * 0.3, mStartY + mLen * 0.5 * s);
              ctx.lineTo(mx + sway * 0.3 - 4 * s, mStartY + mLen * 0.7 * s);
              ctx.stroke();
              ctx.lineWidth = 1.5 * s;
            }
          }

          // Fireflies/swamp lights
          for (let fl = 0; fl < 3; fl++) {
            const flPhase = (swampTime * 0.5 + fl * 1.5) % 3;
            if (flPhase < 2) {
              const flX = screenPos.x - 15 * s + fl * 15 * s + Math.sin(swampTime + fl * 2) * 8 * s;
              const flY = screenPos.y - 25 * s - fl * 5 * s + Math.cos(swampTime * 0.7 + fl) * 6 * s;
              const flAlpha = Math.sin(flPhase / 2 * Math.PI) * 0.7;

              const flyGlow = ctx.createRadialGradient(flX, flY, 0, flX, flY, 5 * s);
              flyGlow.addColorStop(0, `rgba(180,255,100,${flAlpha})`);
              flyGlow.addColorStop(1, "transparent");
              ctx.fillStyle = flyGlow;
              ctx.beginPath();
              ctx.arc(flX, flY, 5 * s, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = `rgba(200,255,150,${flAlpha})`;
              ctx.beginPath();
              ctx.arc(flX, flY, 1.5 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
        case "mushroom": {
          // Enhanced 3D isometric fantasy mushroom
          const mushTime = decorTime;
          const mushPulse = 0.85 + Math.sin(mushTime * 2.5 + variant) * 0.15;

          // Mushroom color palettes
          const mushPalettes = [
            { cap: "#9b1a1a", capDark: "#6b0a0a", capLight: "#bb3a3a", spots: "#f5f0e0", glow: null },
            { cap: "#5a1a8a", capDark: "#3a0a5a", capLight: "#7a3aaa", spots: "#e0f0ff", glow: "#9b4dff" },
            { cap: "#1a6a2a", capDark: "#0a4a1a", capLight: "#3a8a4a", spots: "#fff8e0", glow: "#4aff8a" },
            { cap: "#8a5020", capDark: "#5a3010", capLight: "#aa7040", spots: "#f8f0e8", glow: null }
          ][variant] || { cap: "#9b1a1a", capDark: "#6b0a0a", capLight: "#bb3a3a", spots: "#f5f0e0", glow: null };

          // Ground shadow
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y + 4 * s, 14 * s, 6 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bioluminescent glow for magic variants
          if (mushPalettes.glow) {
            const glowGrad = ctx.createRadialGradient(
              screenPos.x, screenPos.y - 8 * s, 0,
              screenPos.x, screenPos.y - 8 * s, 25 * s
            );
            glowGrad.addColorStop(0, `${mushPalettes.glow}${Math.floor(mushPulse * 60).toString(16).padStart(2, '0')}`);
            glowGrad.addColorStop(0.5, `${mushPalettes.glow}${Math.floor(mushPulse * 25).toString(16).padStart(2, '0')}`);
            glowGrad.addColorStop(1, "transparent");
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y - 8 * s, 25 * s, 18 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Stem with 3D shading
          const stemGrad = ctx.createLinearGradient(
            screenPos.x - 5 * s, 0, screenPos.x + 5 * s, 0
          );
          stemGrad.addColorStop(0, "#c8c0b0");
          stemGrad.addColorStop(0.3, "#f0e8d8");
          stemGrad.addColorStop(0.7, "#f8f0e0");
          stemGrad.addColorStop(1, "#d8d0c0");

          ctx.fillStyle = stemGrad;
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 4 * s, screenPos.y + 3 * s);
          ctx.quadraticCurveTo(screenPos.x - 5 * s, screenPos.y - 5 * s, screenPos.x - 3 * s, screenPos.y - 10 * s);
          ctx.lineTo(screenPos.x + 3 * s, screenPos.y - 10 * s);
          ctx.quadraticCurveTo(screenPos.x + 5 * s, screenPos.y - 5 * s, screenPos.x + 4 * s, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();

          // Stem ring details
          ctx.strokeStyle = "#b8b0a0";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 3 * s, 4 * s, 1.5 * s, 0, 0, Math.PI);
          ctx.stroke();

          // Cap underside (gills)
          ctx.fillStyle = mushPalettes.capDark;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 9 * s, 14 * s, 5 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Gill lines
          ctx.strokeStyle = mushPalettes.cap;
          ctx.lineWidth = 0.8 * s;
          for (let g = 0; g < 12; g++) {
            const gAngle = (g / 12) * Math.PI - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y - 9 * s);
            ctx.lineTo(
              screenPos.x + Math.cos(gAngle) * 13 * s,
              screenPos.y - 9 * s + Math.sin(gAngle) * 4 * s
            );
            ctx.stroke();
          }

          // Cap top with gradient
          const capGrad = ctx.createRadialGradient(
            screenPos.x - 4 * s, screenPos.y - 18 * s, 0,
            screenPos.x, screenPos.y - 12 * s, 16 * s
          );
          capGrad.addColorStop(0, mushPalettes.capLight);
          capGrad.addColorStop(0.5, mushPalettes.cap);
          capGrad.addColorStop(1, mushPalettes.capDark);

          ctx.fillStyle = capGrad;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y - 12 * s, 14 * s, 10 * s, 0, Math.PI, Math.PI * 2);
          ctx.closePath();
          ctx.fill();

          // Cap spots with slight 3D
          ctx.fillStyle = mushPalettes.spots;
          const spotPositions = [
            { x: -6, y: -16, r: 2.5 },
            { x: 4, y: -18, r: 2 },
            { x: -2, y: -20, r: 1.8 },
            { x: 7, y: -14, r: 1.5 },
            { x: -8, y: -13, r: 1.8 },
            { x: 1, y: -16, r: 2.2 }
          ];
          for (const spot of spotPositions) {
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
            ctx.fillStyle = mushPalettes.spots;
            ctx.beginPath();
            ctx.ellipse(
              screenPos.x + spot.x * s,
              screenPos.y + spot.y * s,
              spot.r * s, spot.r * 0.7 * s, 0, 0, Math.PI * 2
            );
            ctx.fill();
          }

          // Cap highlight
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x - 4 * s, screenPos.y - 17 * s, 6 * s, 4 * s, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Spore particles for glowing variants
          if (mushPalettes.glow) {
            for (let sp = 0; sp < 5; sp++) {
              const spPhase = (mushTime * 0.5 + sp * 0.8) % 2;
              const spX = screenPos.x - 8 * s + sp * 4 * s + Math.sin(mushTime + sp) * 3 * s;
              const spY = screenPos.y - 10 * s - spPhase * 15 * s;
              const spAlpha = (1 - spPhase * 0.5) * mushPulse * 0.6;

              ctx.fillStyle = `rgba(200,255,200,${spAlpha})`;
              ctx.beginPath();
              ctx.arc(spX, spY, 1.5 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }
        case "lily_pad": {
          // Enhanced 3D isometric lily pad floating on water
          const padFloat = Math.sin(decorTime * 1.2 + screenPos.x * 0.01) * 1.5 * s;
          const padRot = Math.sin(decorTime * 0.8 + variant) * 0.08;

          // Water ripple underneath
          ctx.strokeStyle = "rgba(100,150,130,0.25)";
          ctx.lineWidth = 1.5 * s;
          for (let rp = 0; rp < 2; rp++) {
            const rpPhase = (decorTime * 0.5 + rp * 0.5) % 1.5;
            const rpSize = 14 + rpPhase * 12;
            const rpAlpha = 0.25 - rpPhase * 0.15;
            ctx.strokeStyle = `rgba(100,150,130,${rpAlpha})`;
            ctx.beginPath();
            ctx.ellipse(screenPos.x, screenPos.y + padFloat * 0.3, rpSize * s, rpSize * 0.4 * s, 0, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Pad shadow on water
          ctx.fillStyle = "rgba(20,50,30,0.2)";
          ctx.beginPath();
          ctx.ellipse(screenPos.x + 2 * s, screenPos.y + 3 * s + padFloat * 0.3, 15 * s, 7 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main pad with gradient
          const padGrad = ctx.createRadialGradient(
            screenPos.x - 4 * s, screenPos.y - 3 * s + padFloat, 0,
            screenPos.x, screenPos.y + padFloat, 15 * s
          );
          padGrad.addColorStop(0, "#4a9a4a");
          padGrad.addColorStop(0.5, "#3a7a3a");
          padGrad.addColorStop(1, "#2a5a2a");

          ctx.save();
          ctx.translate(screenPos.x, screenPos.y + padFloat);
          ctx.rotate(padRot);

          ctx.fillStyle = padGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, 14 * s, 0.25, Math.PI * 2 - 0.25);
          ctx.closePath();
          ctx.fill();

          // Pad veins
          ctx.strokeStyle = "#2a6a2a";
          ctx.lineWidth = 1 * s;
          for (let v = 0; v < 7; v++) {
            const vAngle = 0.4 + (v / 6) * (Math.PI * 2 - 0.8);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(vAngle) * 11 * s, Math.sin(vAngle) * 5 * s);
            ctx.stroke();
          }

          // Center highlight
          ctx.fillStyle = "rgba(100,180,100,0.4)";
          ctx.beginPath();
          ctx.ellipse(-3 * s, -2 * s, 6 * s, 3 * s, -0.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Flower for variant 0
          if (variant === 0) {
            const flowerY = screenPos.y - 5 * s + padFloat * 0.8;

            // Flower stem
            ctx.strokeStyle = "#4a8a4a";
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 3 * s, screenPos.y + padFloat);
            ctx.quadraticCurveTo(screenPos.x - 4 * s, flowerY + 3 * s, screenPos.x, flowerY);
            ctx.stroke();

            // Lotus petals (multiple layers)
            // Outer petals
            ctx.fillStyle = "#ffb6c1";
            for (let p = 0; p < 6; p++) {
              const pa = (p / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.ellipse(
                screenPos.x + Math.cos(pa) * 5 * s,
                flowerY + Math.sin(pa) * 2.5 * s,
                4 * s, 2.5 * s, pa, 0, Math.PI * 2
              );
              ctx.fill();
            }
            // Inner petals
            ctx.fillStyle = "#ffc0cb";
            for (let p = 0; p < 5; p++) {
              const pa = (p / 5) * Math.PI * 2 + 0.3;
              ctx.beginPath();
              ctx.ellipse(
                screenPos.x + Math.cos(pa) * 3 * s,
                flowerY - 2 * s + Math.sin(pa) * 1.5 * s,
                3 * s, 2 * s, pa, 0, Math.PI * 2
              );
              ctx.fill();
            }
            // Center
            ctx.fillStyle = "#ffeb3b";
            ctx.beginPath();
            ctx.arc(screenPos.x, flowerY - 2 * s, 2.5 * s, 0, Math.PI * 2);
            ctx.fill();
            // Center texture
            ctx.fillStyle = "#ffc107";
            ctx.beginPath();
            ctx.arc(screenPos.x - 0.5 * s, flowerY - 2.5 * s, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Water droplets on pad
          if (variant > 1) {
            ctx.fillStyle = "rgba(200,240,255,0.5)";
            const droplets = [{ x: -4, y: -1 }, { x: 3, y: 1 }, { x: -1, y: 2 }];
            for (const d of droplets) {
              ctx.beginPath();
              ctx.ellipse(
                screenPos.x + d.x * s, screenPos.y + d.y * s + padFloat,
                2 * s, 1 * s, 0, 0, Math.PI * 2
              );
              ctx.fill();
              // Droplet highlight
              ctx.fillStyle = "rgba(255,255,255,0.7)";
              ctx.beginPath();
              ctx.arc(screenPos.x + d.x * s - 0.5 * s, screenPos.y + d.y * s - 0.3 * s + padFloat, 0.6 * s, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "rgba(200,240,255,0.5)";
            }
          }
          break;
        }
        case "fog_wisp": {
          // Enhanced ethereal swamp fog wisp with layered atmospheric effect
          const fogTime = decorTime * 0.7;
          const fogDrift = Math.sin(fogTime + variant * 1.5) * 15 * s;
          const fogRise = Math.cos(fogTime * 0.6 + variant) * 8 * s;
          const fogPulse = 0.8 + Math.sin(fogTime * 1.5 + variant * 2) * 0.2;

          const baseFogX = screenPos.x + fogDrift;
          const baseFogY = screenPos.y + fogRise;

          // Multiple fog layers for depth
          // Back layer (largest, most transparent)
          const backFogGrad = ctx.createRadialGradient(
            baseFogX - 10 * s, baseFogY + 5 * s, 0,
            baseFogX - 10 * s, baseFogY + 5 * s, 50 * s
          );
          backFogGrad.addColorStop(0, `rgba(80,120,80,${0.12 * fogPulse})`);
          backFogGrad.addColorStop(0.5, `rgba(90,130,90,${0.08 * fogPulse})`);
          backFogGrad.addColorStop(1, "transparent");
          ctx.fillStyle = backFogGrad;
          ctx.beginPath();
          ctx.ellipse(baseFogX - 10 * s, baseFogY + 5 * s, 50 * s, 25 * s, 0.1, 0, Math.PI * 2);
          ctx.fill();

          // Mid layer
          const midFogGrad = ctx.createRadialGradient(
            baseFogX, baseFogY, 0,
            baseFogX, baseFogY, 38 * s
          );
          midFogGrad.addColorStop(0, `rgba(100,150,100,${0.18 * fogPulse})`);
          midFogGrad.addColorStop(0.6, `rgba(110,160,110,${0.1 * fogPulse})`);
          midFogGrad.addColorStop(1, "transparent");
          ctx.fillStyle = midFogGrad;
          ctx.beginPath();
          ctx.ellipse(baseFogX, baseFogY, 38 * s, 18 * s, -0.05, 0, Math.PI * 2);
          ctx.fill();

          // Front wisp tendrils
          const tendrilGrad = ctx.createRadialGradient(
            baseFogX + 15 * s, baseFogY - 8 * s, 0,
            baseFogX + 15 * s, baseFogY - 8 * s, 28 * s
          );
          tendrilGrad.addColorStop(0, `rgba(130,180,130,${0.15 * fogPulse})`);
          tendrilGrad.addColorStop(0.7, `rgba(120,170,120,${0.08 * fogPulse})`);
          tendrilGrad.addColorStop(1, "transparent");
          ctx.fillStyle = tendrilGrad;
          ctx.beginPath();
          ctx.ellipse(baseFogX + 15 * s, baseFogY - 8 * s, 28 * s, 12 * s, 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Swirling internal detail
          ctx.strokeStyle = `rgba(150,200,150,${0.08 * fogPulse})`;
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.moveTo(baseFogX - 20 * s, baseFogY + 5 * s);
          ctx.bezierCurveTo(
            baseFogX - 5 * s, baseFogY - 8 * s,
            baseFogX + 10 * s, baseFogY + 3 * s,
            baseFogX + 30 * s, baseFogY - 5 * s
          );
          ctx.stroke();

          // Dense core
          const coreGrad = ctx.createRadialGradient(
            baseFogX + 5 * s, baseFogY - 2 * s, 0,
            baseFogX + 5 * s, baseFogY - 2 * s, 18 * s
          );
          coreGrad.addColorStop(0, `rgba(160,210,160,${0.22 * fogPulse})`);
          coreGrad.addColorStop(0.5, `rgba(140,190,140,${0.12 * fogPulse})`);
          coreGrad.addColorStop(1, "transparent");
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.ellipse(baseFogX + 5 * s, baseFogY - 2 * s, 18 * s, 10 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // Floating particles within fog
          for (let fp = 0; fp < 4; fp++) {
            const fpTime = (fogTime * 0.8 + fp * 1.2) % 2.5;
            const fpX = baseFogX - 15 * s + fp * 12 * s + Math.sin(fogTime + fp * 2) * 8 * s;
            const fpY = baseFogY + 3 * s - fpTime * 8 * s + Math.cos(fogTime * 1.3 + fp) * 4 * s;
            const fpAlpha = 0.25 * (1 - fpTime * 0.3) * fogPulse;

            ctx.fillStyle = `rgba(180,220,180,${fpAlpha})`;
            ctx.beginPath();
            ctx.arc(fpX, fpY, 2.5 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // Subtle ground interaction
          ctx.fillStyle = `rgba(80,120,80,${0.06 * fogPulse})`;
          ctx.beginPath();
          ctx.ellipse(baseFogX, baseFogY + 18 * s, 35 * s, 8 * s, 0, 0, Math.PI * 2);
          ctx.fill();
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

        case "tentacle":
          // Thicker, segmented tentacle emerging from ground
          const tentacleColor = "#7B1FA2";
          const suckerColor = "#E1BEE7";
          const sway = Math.sin(decorTime * 1.5 + dec.x) * 15 * s;

          // Dark hole at base
          ctx.fillStyle = "#1A0F21";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            10 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Tentacle body (segmented look using varying line width)
          ctx.strokeStyle = tentacleColor;
          ctx.lineCap = "round";
          // Base segment (thick)
          ctx.lineWidth = 14 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y);
          ctx.lineTo(screenPos.x + sway * 0.2, screenPos.y - 15 * s);
          ctx.stroke();
          // Middle segment
          ctx.lineWidth = 10 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + sway * 0.2, screenPos.y - 15 * s);
          ctx.lineTo(screenPos.x + sway * 0.6, screenPos.y - 35 * s);
          ctx.stroke();
          // Tip segment (thin)
          ctx.lineWidth = 5 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x + sway * 0.6, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x + sway, screenPos.y - 50 * s);
          ctx.stroke();

          // Suckers (lighter circles on the underside)
          ctx.fillStyle = suckerColor;
          const suckerPos = [
            { t: 0.2, s: 4 },
            { t: 0.4, s: 3.5 },
            { t: 0.6, s: 3 },
            { t: 0.8, s: 2 },
          ];
          suckerPos.forEach((p) => {
            // Interpolate position based on sway
            const sx = screenPos.x + sway * p.t;
            const sy = screenPos.y - 50 * s * p.t;
            ctx.beginPath();
            // Offset slightly to the "front"
            ctx.arc(sx - 3 * s, sy, p.s * s, 0, Math.PI * 2);
            ctx.fill();
          });
          break;

        case "deep_water":
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

        // === MISC DECORATIONS ===
        case "ruins": {
          // 5 unique ruin variants
          const ruinVariant = variant % 5;
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
            // VARIANT 4: Ancient altar/foundation with carved details
            // Foundation platform
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 30 * s, screenPos.y + 8 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
            ctx.lineTo(screenPos.x + 30 * s, screenPos.y + 8 * s);
            ctx.lineTo(screenPos.x, screenPos.y + 20 * s);
            ctx.closePath();
            ctx.fill();

            // Top surface
            ctx.fillStyle = stoneBase;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 25 * s, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 8 * s);
            ctx.lineTo(screenPos.x + 25 * s, screenPos.y + 5 * s);
            ctx.lineTo(screenPos.x, screenPos.y + 15 * s);
            ctx.closePath();
            ctx.fill();

            // Central altar stone
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 2 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
            ctx.lineTo(screenPos.x + 10 * s, screenPos.y + 2 * s);
            ctx.lineTo(screenPos.x, screenPos.y + 8 * s);
            ctx.closePath();
            ctx.fill();

            // Altar sides
            ctx.fillStyle = stoneDark;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 2 * s);
            ctx.lineTo(screenPos.x - 10 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 22 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = stoneBase;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 10 * s, screenPos.y + 2 * s);
            ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 22 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 5 * s);
            ctx.closePath();
            ctx.fill();

            // Altar top
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 10 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 22 * s);
            ctx.lineTo(screenPos.x + 10 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x, screenPos.y - 10 * s);
            ctx.closePath();
            ctx.fill();

            // Carved runes/symbols on front
            ctx.strokeStyle = "#2a2a2a";
            ctx.lineWidth = 1 * s;
            // Symbol 1
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 12 * s);
            ctx.lineTo(screenPos.x - 3 * s, screenPos.y - 18 * s);
            ctx.lineTo(screenPos.x - 1 * s, screenPos.y - 12 * s);
            ctx.stroke();
            // Symbol 2  
            ctx.beginPath();
            ctx.arc(screenPos.x + 4 * s, screenPos.y - 14 * s, 2.5 * s, 0, Math.PI * 2);
            ctx.stroke();

            // Corner pillar remains
            ctx.fillStyle = stoneLight;
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 22 * s, screenPos.y + 3 * s);
            ctx.lineTo(screenPos.x - 24 * s, screenPos.y - 12 * s);
            ctx.lineTo(screenPos.x - 18 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x - 16 * s, screenPos.y);
            ctx.closePath();
            ctx.fill();

            // Scattered offering bowls/debris
            ctx.fillStyle = "#6a5a4a";
            ctx.beginPath();
            ctx.ellipse(screenPos.x + 15 * s, screenPos.y + 8 * s, 4 * s, 2 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#5a4a3a";
            ctx.beginPath();
            ctx.ellipse(screenPos.x + 15 * s, screenPos.y + 7 * s, 3 * s, 1.5 * s, 0.3, 0, Math.PI * 2);
            ctx.fill();
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

    // =========================================================================
    // OLD HAZARD RENDERING - DISABLED (using new version above decorations)
    // =========================================================================
    if (false && LEVEL_DATA[selectedMap].hazards) {
      LEVEL_DATA[selectedMap].hazards.forEach((haz) => {
        const sPos = toScreen(gridToWorld(haz.pos));
        const sRad = haz.radius * TILE_SIZE * cameraZoom;
        const time = Date.now() / 1000;

        ctx.save();
        ctx.translate(sPos.x, sPos.y);

        if (haz.type === "poison_fog") {
          // 1. Ground Stain (Corroded grass)
          const stainGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad);
          stainGrad.addColorStop(0, "rgba(46, 125, 50, 0.3)");
          stainGrad.addColorStop(1, "transparent");
          ctx.fillStyle = stainGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, sRad, sRad * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Multi-layered Swirling Toxic Clouds
          for (let i = 0; i < 8; i++) {
            ctx.save();
            const rotSpeed = time * (0.15 + i * 0.05);
            ctx.rotate(rotSpeed + i);
            const driftX = Math.sin(time + i) * 15 * cameraZoom;
            const cloudScale = 0.7 + Math.sin(time * 0.5 + i) * 0.3;

            const fogGrad = ctx.createRadialGradient(
              driftX,
              0,
              0,
              driftX,
              0,
              sRad * cloudScale
            );
            fogGrad.addColorStop(0, `rgba(170, 0, 255, ${0.15 + i * 0.02})`); // Purple
            fogGrad.addColorStop(0.5, "rgba(0, 230, 118, 0.05)"); // Toxic Green edge
            fogGrad.addColorStop(1, "transparent");

            ctx.fillStyle = fogGrad;
            ctx.beginPath();
            ctx.ellipse(
              driftX,
              0,
              sRad * cloudScale,
              sRad * 0.5 * cloudScale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
          }

          // 3. Spore Particles (Rising and fading)
          for (let j = 0; j < 6; j++) {
            const seed = (time + j * 1.5) % 3;
            const px = Math.sin(j * 123.4) * sRad * 0.6;
            const py = -seed * 40 * cameraZoom;
            const pSize = (1 - seed / 3) * 4 * cameraZoom;
            ctx.fillStyle = `rgba(185, 246, 202, ${1 - seed / 3})`;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (haz.type === "lava_geyser" || haz.type === "eruption_zone") {
          const isErupting = time % 4 < 0.8; // Erupts every 4 seconds
          const buildUp = time % 4 > 3.2; // Glows before eruption

          // 1. Rock Vent (Obsidian)
          ctx.fillStyle = "#121212";
          ctx.beginPath();
          ctx.ellipse(0, 0, sRad * 0.6, sRad * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2 * cameraZoom;
          ctx.stroke();

          // 2. Internal Magma Glow
          const lavaGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.5);
          lavaGlow.addColorStop(0, buildUp || isErupting ? "#FFF" : "#FFEB3B");
          lavaGlow.addColorStop(0.4, "#FF9100");
          lavaGlow.addColorStop(1, "transparent");

          ctx.save();
          if (buildUp) ctx.shadowBlur = 20 * cameraZoom;
          ctx.shadowColor = "#FF3D00";
          ctx.fillStyle = lavaGlow;
          ctx.beginPath();
          ctx.ellipse(0, 0, sRad * 0.5, sRad * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 3. Column of Fire (Activation Effect)
          if (isErupting) {
            const h = Math.sin(((time % 4) / 0.8) * Math.PI) * 180 * cameraZoom;
            const beamGrad = ctx.createLinearGradient(0, 0, 0, -h);
            beamGrad.addColorStop(0, "#FFD740");
            beamGrad.addColorStop(0.5, "#FF3D00");
            beamGrad.addColorStop(1, "transparent");

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(-10 * cameraZoom, 0);
            ctx.quadraticCurveTo(0, -h * 1.1, 10 * cameraZoom, 0);
            ctx.fill();

            // Fire Splashes
            for (let f = 0; f < 8; f++) {
              const ang = (f * Math.PI) / 4;
              const fx = Math.cos(ang) * sRad * 0.8 * (time % 4);
              const fy = Math.sin(ang) * sRad * 0.4 * (time % 4);
              ctx.fillStyle = "#FF6D00";
              ctx.beginPath();
              ctx.arc(fx, fy, 3 * cameraZoom, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        if (haz.type === "ice_sheet" || haz.type === "slippery_ice") {
          // 1. Frosted Ground
          ctx.fillStyle = "rgba(225, 245, 254, 0.4)";
          ctx.beginPath();
          ctx.ellipse(0, 0, sRad, sRad * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Crystal Refractions (Faceted look)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 1.5 * cameraZoom;
          for (let i = 0; i < 4; i++) {
            const angleOffset = (i * Math.PI) / 2.5 + time * 0.5;
            ctx.beginPath();
            ctx.moveTo(
              Math.cos(angleOffset) * sRad * 0.8,
              Math.sin(angleOffset) * sRad * 0.4
            );
            ctx.lineTo(0, 0);
            ctx.lineTo(
              Math.cos(angleOffset + 0.65) * sRad * 0.5,
              Math.sin(angleOffset + 0.5) * sRad * 0.25
            );
            ctx.stroke();
          }

          // 3. Glare Shimmer
          const glarePos = Math.sin(time * 0.5) * sRad;
          const glareGrad = ctx.createLinearGradient(
            glarePos - 30,
            0,
            glarePos + 30,
            0
          );
          glareGrad.addColorStop(0, "transparent");
          glareGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
          glareGrad.addColorStop(1, "transparent");
          ctx.fillStyle = glareGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, sRad, sRad * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // 4. Floating Frost Flakes
          ctx.fillStyle = "white";
          for (let f = 0; f < 5; f++) {
            const fx = Math.cos(f + time) * sRad * 0.7;
            const fy = Math.sin(f * 2 + time) * sRad * 0.3 - 10 * cameraZoom;
            ctx.beginPath();
            ctx.arc(fx, fy, 1.5 * cameraZoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (haz.type === "quicksand") {
          // 1. Outer Swirl
          ctx.save();
          ctx.rotate(time * 0.5);
          for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(121, 85, 72, ${0.2 + i * 0.1})`;
            ctx.lineWidth = 3 * cameraZoom;
            ctx.beginPath();
            ctx.ellipse(
              0,
              0,
              sRad * (1 - i * 0.2),
              sRad * 0.5 * (1 - i * 0.2),
              i,
              0,
              Math.PI * 1.5
            );
            ctx.stroke();
          }
          ctx.restore();

          // 2. Central Sinking Void
          const voidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRad * 0.4);
          voidGrad.addColorStop(0, "#3E2723");
          voidGrad.addColorStop(1, "#795548");
          ctx.fillStyle = voidGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, sRad * 0.4, sRad * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // 3. Dust Clouds (Atmospheric)
          ctx.fillStyle = "rgba(161, 136, 127, 0.2)";
          for (let d = 0; d < 4; d++) {
            const dx = Math.sin(time * 0.8 + d) * sRad * 0.8;
            const dy = Math.cos(time * 0.8 + d) * sRad * 0.4;
            ctx.beginPath();
            ctx.arc(dx, dy, 12 * cameraZoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      });
    }

    // =========================================================================
    // EPIC ANIMATED SPECIAL TOWERS
    // =========================================================================
    if (LEVEL_DATA[selectedMap]?.specialTower) {
      const spec = LEVEL_DATA[selectedMap].specialTower;
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
          const s2 = s * 1.2; // Slightly larger scale for more detail space

          // Isometric constants
          const w = 24 * s2; // Half width
          const h = 32 * s2; // Base Height (without roof elements)
          const angle = Math.PI / 6; // 30 degrees
          const tanAngle = Math.tan(angle);
          const roofOffset = w * tanAngle * 2;

          // --- 0. Shadow (Moved up and tightened) ---
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.beginPath();
          // Tucked further under the base
          ctx.ellipse(0, -12 * s2, 32 * s2, 16 * s2, 0, 0, Math.PI * 2);
          ctx.fill();

          // =========================================================================
          // STATE: DESTROYED (HP <= 0)
          // =========================================================================
          if (
            hpPct <= 0 ||
            spec.hp === 0 ||
            (spec.hp !== undefined && specialTowerHp === null)
          ) {
            // Wrecked base foundation
            ctx.fillStyle = "#424242";
            ctx.beginPath();
            ctx.moveTo(-w - 5 * s2, 0);
            ctx.lineTo(0, 10 * s2);
            ctx.lineTo(w + 8 * s2, 2 * s2);
            ctx.lineTo(0, -10 * s2);
            ctx.fill();

            // The main crumpled structure body (Back walls, dark interior)
            ctx.fillStyle = "#263238"; // Dark grey interior
            ctx.beginPath();
            ctx.moveTo(-w * 0.8, -h * 0.2);
            ctx.lineTo(w * 0.9, -h * 0.1);
            ctx.lineTo(w * 0.9, -h - roofOffset * 0.8);
            ctx.lineTo(-w * 0.8, -h - roofOffset * 0.6);
            ctx.fill();

            // Broken Left Face (Jagged edges)
            ctx.fillStyle = "#546E7A"; // Dull damaged metal
            ctx.beginPath();
            ctx.moveTo(0, 5 * s2);
            ctx.lineTo(-w, -w * tanAngle + 2 * s2); // bent corner
            ctx.lineTo(-w * 0.9, -h * 0.5); // jagged break
            ctx.lineTo(-w * 1.1, -h - roofOffset * 0.5);
            ctx.lineTo(0, -h - 5 * s2); // collapsed roof line
            ctx.fill();

            // The Vault Door (Hanging off hinges)
            ctx.save();
            ctx.translate(w * 0.8, -h * 0.4);
            ctx.rotate(Math.PI / 8); // Hanging angle
            ctx.fillStyle = "#78909C";
            ctx.fillRect(-12 * s2, -18 * s2, 24 * s2, 36 * s2);
            // Broken dial
            ctx.fillStyle = "#37474F";
            ctx.beginPath();
            ctx.arc(0, -5 * s2, 6 * s2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Smoke Effects (Rising plumes)
            ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
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
            // Exit early, no HP bar needed for dead vault
            break;
          }

          // =========================================================================
          // STATE: ACTIVE VAULT (Living)
          // =========================================================================

          // Color Palette (Normal vs Flash)
          const c = isFlashing
            ? {
              top: "#FFFFFF",
              left: "#FFCDD2",
              right: "#EF9A9A",
              frame: "#FF5252",
              dark: "#B71C1C",
              glow: "#FFFFFF",
            }
            : {
              top: "#FFF59D", // Pale Gold
              left: "#C5A535", // Dark Gold Shadow
              right: "#FFD700", // Classic Gold
              frame: "#DAA520", // Goldenrod Frame
              dark: "#4E342E", // Dark bronze elements
              glow: "#40E0D0", // Turquoise energy glow
            };

          // --- 1. Main Isometric Body ---

          // Front-Left Face (Shadow Side)
          ctx.fillStyle = c.left;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-w, -w * tanAngle);
          ctx.lineTo(-w, -w * tanAngle - h);
          ctx.lineTo(0, -h);
          ctx.closePath();
          ctx.fill();

          // Front-Right Face (Lit Side - Door Side)
          ctx.fillStyle = c.right;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w, -w * tanAngle);
          ctx.lineTo(w, -w * tanAngle - h);
          ctx.lineTo(0, -h);
          ctx.closePath();
          ctx.fill();

          // Top Face
          ctx.fillStyle = c.top;
          ctx.beginPath();
          ctx.moveTo(0, -h);
          ctx.lineTo(-w, -w * tanAngle - h);
          ctx.lineTo(0, -roofOffset - h);
          ctx.lineTo(w, -w * tanAngle - h);
          ctx.closePath();
          ctx.fill();

          // --- 2. Reinforced Framing & Rivets ---
          ctx.fillStyle = c.frame;
          ctx.strokeStyle = c.dark;
          ctx.lineWidth = 1 * s2;

          // Central vertical pillar
          ctx.fillRect(-2 * s2, -h, 4 * s2, h);
          ctx.strokeRect(-2 * s2, -h, 4 * s2, h);

          // Top Rim reinforcing
          ctx.beginPath();
          ctx.moveTo(0, -h + 3 * s2);
          ctx.lineTo(-w, -w * tanAngle - h + 3 * s2);
          ctx.lineTo(0, -roofOffset - h + 3 * s2);
          ctx.lineTo(w, -w * tanAngle - h + 3 * s2);
          ctx.closePath();
          ctx.stroke();

          // Rivets along the edges
          ctx.fillStyle = c.dark;
          for (let i = 0; i <= 4; i++) {
            // Left edge rivets
            ctx.beginPath();
            ctx.arc(
              -w + 1 * s2,
              -w * tanAngle - h + (i / 4) * h,
              1.5 * s2,
              0,
              Math.PI * 2
            );
            ctx.fill();
            // Right edge rivets
            ctx.beginPath();
            ctx.arc(
              w - 1 * s2,
              -w * tanAngle - h + (i / 4) * h,
              1.5 * s2,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          // --- 3. The Protruding Door Mechanism (Right Face) ---
          ctx.save();
          // Transform to the isometric plane of the right face
          const rightFaceCenterX = w * 0.5;
          const rightFaceCenterY = -h * 0.5 - w * tanAngle * 0.5;
          ctx.translate(rightFaceCenterX, rightFaceCenterY);

          // Door Frame (Protruding rectangle)
          ctx.fillStyle = c.frame;
          ctx.beginPath();
          ctx.moveTo(-8 * s2, -12 * s2);
          ctx.lineTo(12 * s2, -12 * s2 + 12 * tanAngle); // Isometric perspective slant
          ctx.lineTo(12 * s2, 14 * s2 + 12 * tanAngle);
          ctx.lineTo(-8 * s2, 14 * s2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // The Complex Lock Dial
          ctx.scale(1, 0.8); // Flatten for isometric look
          ctx.translate(2 * s2, 0);

          // Outer Ring (Stationary)
          ctx.fillStyle = c.dark;
          ctx.beginPath();
          ctx.arc(0, 0, 9 * s2, 0, Math.PI * 2);
          ctx.fill();

          // Inner Rotating Dial
          const dialSpeed = time * 1.5;
          ctx.save();
          ctx.rotate(dialSpeed);
          ctx.fillStyle = c.right;
          ctx.beginPath();
          ctx.arc(0, 0, 6 * s2, 0, Math.PI * 2);
          ctx.fill();

          // The glowing indicator/keyhole
          ctx.fillStyle = isFlashing ? "#FFF" : c.glow;
          ctx.shadowColor = c.glow;
          ctx.shadowBlur = isFlashing ? 20 : 10;
          ctx.beginPath();
          // A shape that looks like a keyhole/arrow
          ctx.moveTo(4 * s2, 0);
          ctx.lineTo(-2 * s2, 3 * s2);
          ctx.lineTo(-2 * s2, -3 * s2);
          ctx.fill();
          ctx.shadowBlur = 0; // Reset shadow
          ctx.restore(); // End dial rotation

          ctx.restore(); // End door transform

          // --- 4. Progressive Damage Effects ---

          // Stage 1: Scratches and dents (HP < 75%)
          if (hpPct < 0.75) {
            ctx.strokeStyle = "rgba(0,0,0,0.4)";
            ctx.lineWidth = 1 * s2;
            ctx.beginPath();
            // Random looking scratches on left face
            ctx.moveTo(-w * 0.7, -h * 0.3);
            ctx.lineTo(-w * 0.3, -h * 0.5);
            ctx.moveTo(-w * 0.6, -h * 0.7);
            ctx.lineTo(-w * 0.2, -h * 0.6);
            // Dent on top rim
            ctx.moveTo(-w * 0.1, -roofOffset - h + 3 * s2);
            ctx.lineTo(w * 0.2, -roofOffset - h + 4 * s2);
            ctx.stroke();
          }

          // Stage 2: Critical Failure - Glowing Cracks & Alarm (HP < 40%)
          if (hpPct < 0.4) {
            const flicker = Math.sin(time * 20) > 0;

            // Molten Cracks
            ctx.strokeStyle = flicker ? "#FFEB3B" : "#FF5722"; // Yellow/Orange flicker
            ctx.shadowColor = "#FF5722";
            ctx.shadowBlur = 15 * s2;
            ctx.lineWidth = 2.5 * s2;
            ctx.beginPath();
            // Deep jagged crack running across left face and top
            ctx.moveTo(-w * 0.2, 0);
            ctx.lineTo(-w * 0.5, -h * 0.3);
            ctx.lineTo(-w * 0.3, -h * 0.7);
            ctx.lineTo(0, -h);
            ctx.lineTo(w * 0.2, -h - roofOffset * 0.5);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Emergency Alarm Beacon on roof
            const beaconY = -roofOffset - h - 4 * s2;
            ctx.fillStyle = c.dark;
            ctx.fillRect(-3 * s2, beaconY, 6 * s2, 4 * s2); // Base

            // Rotating Red Light
            ctx.save();
            ctx.translate(0, beaconY);
            ctx.fillStyle = flicker ? "#FF0000" : "#B71C1C";
            ctx.shadowColor = "#FF0000";
            ctx.shadowBlur = 25;
            ctx.beginPath();
            // Semi-circle dome
            ctx.arc(0, 0, 4 * s2, Math.PI, Math.PI * 2);
            ctx.fill();
            // Rotating reflector beam effect
            ctx.rotate(time * 6);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(5 * s2, -3 * s2);
            ctx.lineTo(5 * s2, 3 * s2);
            ctx.fill();
            ctx.restore();

            // Occasional sparks (simple particles)
            if (Math.random() > 0.85) {
              ctx.fillStyle = "#FFF";
              ctx.beginPath();
              const sparkX = (Math.random() - 0.5) * w;
              const sparkY = -h * 0.5 + (Math.random() - 0.5) * h;
              ctx.arc(sparkX, sparkY, 2 * s2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // --- 5. Health Bar (Modernized) ---
          if (specialTowerHp !== null && spec.hp) {
            const barWidth = 70 * s2;
            const barHeight = 10 * s2;
            // Positioned higher due to larger sprite and roof elements
            const yOffset = -roofOffset - h - 15 * s2;

            ctx.save();
            ctx.translate(0, yOffset);

            // Bar Container + Shadow
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = "#263238"; // Dark slate background
            ctx.beginPath();
            ctx.rect(-barWidth / 2, 0, barWidth, barHeight);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // HP Fill Gradient
            const hpColorStr =
              hpPct > 0.6 ? "#00E676" : hpPct > 0.3 ? "#FFC107" : "#FF3D00";
            const grad = ctx.createLinearGradient(
              -barWidth / 2,
              0,
              barWidth / 2,
              0
            );
            grad.addColorStop(0, hpColorStr);
            grad.addColorStop(1, isFlashing ? "#FFF" : hpColorStr); // Flash white on hit

            ctx.fillStyle = grad;
            ctx.beginPath();
            // Slightly smaller internal fill
            ctx.rect(
              -barWidth / 2 + 2 * s2,
              2 * s2,
              (barWidth - 4 * s2) * hpPct,
              barHeight - 4 * s2
            );
            ctx.fill();

            // Text Label
            ctx.fillStyle = "white";
            // Using a slightly nicer font stack if available, fallback to Arial
            ctx.font = `800 ${7 * s2}px "Roboto", Arial, sans-serif`;
            ctx.textAlign = "center";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 4;
            ctx.fillText("PROTECT THE VAULT", 0, -2 * s2);
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
          const w = 28 * s2;
          const h = 15 * s2;
          const tanA = Math.tan(Math.PI / 6);

          // 1. Foundation Shadow
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.ellipse(0, -15 * s2, 35 * s2, 22 * s2, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. Tiered Stone Base (Isometric steps)
          const drawStep = (
            sw: number,
            sh: number,
            color1: string,
            color2: string
          ) => {
            // Left Face
            ctx.fillStyle = color1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-sw, -sw * tanA);
            ctx.lineTo(-sw, -sw * tanA - sh);
            ctx.lineTo(0, -sh);
            ctx.fill();
            // Right Face
            ctx.fillStyle = color2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(sw, -sw * tanA);
            ctx.lineTo(sw, -sw * tanA - sh);
            ctx.lineTo(0, -sh);
            ctx.fill();
          };

          // Bottom Step
          ctx.save();
          drawStep(w, h, "#455A64", "#607D8B");
          // Mid Altar
          ctx.translate(0, -h);
          drawStep(w * 0.6, h * 1.5, "#37474F", "#546E7A");
          ctx.restore();

          // 3. Floating Faceted Runestones
          for (let i = 0; i < 3; i++) {
            ctx.save();
            const orbitAngle = time * 0.8 + (i * Math.PI * 2) / 3;
            const bob = Math.sin(time * 2 + i) * 6 * s2;
            const rx = Math.cos(orbitAngle) * 22 * s2;
            const ry = -35 * s2 + Math.sin(orbitAngle) * 10 * s2 + bob;

            ctx.translate(rx, ry);

            // Stone Sprite
            ctx.fillStyle = "#263238";
            ctx.beginPath();
            ctx.moveTo(0, -8 * s2);
            ctx.lineTo(5 * s2, 0);
            ctx.lineTo(0, 8 * s2);
            ctx.lineTo(-5 * s2, 0);
            ctx.fill();

            // Glowing Rune Detail
            ctx.shadowBlur = isHealing ? 15 * s2 : 5 * s2;
            ctx.shadowColor = "#76FF03";
            ctx.fillStyle = "#CCFF90";
            ctx.fillRect(-1 * s2, -4 * s2, 2 * s2, 8 * s2);
            ctx.shadowBlur = 0;
            ctx.restore();
          }

          // 4. Central Arcane Flame
          const flamePulse = 0.8 + Math.sin(time * 12) * 0.2;
          const fireGrad = ctx.createRadialGradient(
            0,
            -35 * s2,
            0,
            0,
            -35 * s2,
            20 * s2 * flamePulse
          );
          fireGrad.addColorStop(0, "#FFFFFF");
          fireGrad.addColorStop(0.3, "#CCFF90");
          fireGrad.addColorStop(0.6, "rgba(118, 255, 3, 0.3)");
          fireGrad.addColorStop(1, "transparent");

          ctx.fillStyle = fireGrad;
          ctx.beginPath();
          ctx.arc(0, -35 * s2, 20 * s2 * flamePulse, 0, Math.PI * 2);
          ctx.fill();

          // 5. HEALING PULSE EFFECT
          if (isHealing) {
            const prog = healCycle / 1200;
            const ringRad = 200 * prog; // Expands to heal range

            ctx.save();
            ctx.scale(1, 0.5); // Isometric floor
            ctx.strokeStyle = `rgba(118, 255, 3, ${1 - prog})`;
            ctx.lineWidth = 4 * s2;
            ctx.beginPath();
            ctx.arc(0, 0, ringRad * s2, 0, Math.PI * 2);
            ctx.stroke();

            // Rising Cross Particles
            ctx.fillStyle = `rgba(204, 255, 144, ${0.8 * (1 - prog)})`;
            for (let p = 0; p < 4; p++) {
              const px = Math.sin(p * 2) * 30 * s2;
              const py = -prog * 100 * s2;
              ctx.fillRect(px - 1 * s2, py - 4 * s2, 2 * s2, 8 * s2);
              ctx.fillRect(px - 4 * s2, py - 1 * s2, 8 * s2, 2 * s2);
            }
            ctx.restore();
          }
          break;
        }

        case "barracks": {
          const time = Date.now() / 1000;
          const spawnCycle = Date.now() % 12000; // Matches the 12s logic in updateGame
          const isSpawning = spawnCycle < 1500; // First 1.5 seconds of spawn
          const isPreparing = spawnCycle > 10500; // Glowing before spawn

          // Isometric Constants
          const w = 32 * s;
          const h = 40 * s;
          const angle = Math.PI / 6;
          const tanA = Math.tan(angle);

          // 1. Foundation Shadow (Tighter grounding)
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.ellipse(0, -15 * s, 40 * s, 20 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          // 2. The Main Building Faces (Directional Lighting)
          // Front-Left (Shadow)
          ctx.fillStyle = "#455A64";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-w, -w * tanA);
          ctx.lineTo(-w, -w * tanA - h);
          ctx.lineTo(0, -h);
          ctx.fill();

          // Front-Right (Light)
          ctx.fillStyle = "#607D8B";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w, -w * tanA);
          ctx.lineTo(w, -w * tanA - h);
          ctx.lineTo(0, -h);
          ctx.fill();

          // 3. Masonry Detail (Stone Blocks)
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1 * s;
          for (let i = 1; i < 4; i++) {
            const yOff = -(h / 4) * i;
            ctx.beginPath();
            ctx.moveTo(-w, -w * tanA + yOff);
            ctx.lineTo(0, yOff);
            ctx.lineTo(w, -w * tanA + yOff);
            ctx.stroke();
          }

          // 4. The Archway (Entrance)
          ctx.save();
          // Glow effect when preparing/spawning
          if (isPreparing || isSpawning) {
            ctx.shadowBlur = 15 * s;
            ctx.shadowColor = "#4FC3F7";
          }

          // Interior Dark Gradient
          const archGrad = ctx.createLinearGradient(0, -20 * s, 0, 0);
          archGrad.addColorStop(0, "#101010");
          archGrad.addColorStop(1, isPreparing ? "#01579B" : "#263238");
          ctx.fillStyle = archGrad;

          ctx.beginPath();
          ctx.moveTo(-10 * s, 0);
          ctx.lineTo(-10 * s, -20 * s);
          ctx.quadraticCurveTo(0, -30 * s, 10 * s, -20 * s);
          ctx.lineTo(10 * s, 0);
          ctx.fill();
          ctx.restore();

          // 5. The Roof (Peaked Overhang)
          const roofH = 25 * s;
          // Left Roof Panel (Darker)
          ctx.fillStyle = "#263238";
          ctx.beginPath();
          ctx.moveTo(0, -h);
          ctx.lineTo(-w - 4 * s, -w * tanA - h);
          ctx.lineTo(0, -h - roofH);
          ctx.fill();
          // Right Roof Panel (Lighter)
          ctx.fillStyle = "#37474F";
          ctx.beginPath();
          ctx.moveTo(0, -h);
          ctx.lineTo(w + 4 * s, -w * tanA - h);
          ctx.lineTo(0, -h - roofH);
          ctx.fill();

          // Roof Trim (Wood beams)
          ctx.strokeStyle = "#4E342E";
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.moveTo(-w - 4 * s, -w * tanA - h);
          ctx.lineTo(0, -h - roofH);
          ctx.lineTo(w + 4 * s, -w * tanA - h);
          ctx.stroke();

          // 6. Detailed Waving Banner
          ctx.save();
          const poleX = -w * 0.6,
            poleY = -w * tanA - h * 0.8;
          ctx.translate(poleX, poleY);

          // Flagpole
          ctx.fillStyle = "#795548";
          ctx.fillRect(-1.5 * s, 0, 3 * s, -45 * s);
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(0, -45 * s, 3 * s, 0, Math.PI * 2);
          ctx.fill(); // Gold tip

          // Waving Banner Logic
          const bannerTime = time * 3;
          ctx.translate(0, -40 * s);
          ctx.fillStyle = "#B71C1C"; // Deep War Red
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let i = 0; i <= 20 * s; i += s) {
            const wave = Math.sin(bannerTime + i * 0.2) * 4 * s;
            ctx.lineTo(i, wave);
          }
          ctx.lineTo(
            20 * s,
            15 * s + Math.sin(bannerTime + 20 * s * 0.2) * 4 * s
          );
          for (let i = 20 * s; i >= 0; i -= s) {
            const wave = Math.sin(bannerTime + i * 0.2) * 4 * s;
            ctx.lineTo(i, 15 * s + wave);
          }
          ctx.fill();

          // Banner Crest (Princeton-ish Orange Stripe)
          ctx.fillStyle = "#f97316";
          ctx.fillRect(5 * s, 4 * s, 10 * s, 7 * s);
          ctx.restore();

          // 7. Spawn Effect (Visual reaction to troop deployment)
          if (isSpawning) {
            // "Magic circle" on floor
            ctx.save();
            ctx.scale(1, 0.5);
            ctx.rotate(time * 2);
            ctx.strokeStyle = `rgba(79, 195, 247, ${1 - spawnCycle / 1500})`;
            ctx.lineWidth = 4 * s;
            ctx.setLineDash([10 * s, 5 * s]);
            ctx.beginPath();
            ctx.arc(0, 0, 40 * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Light beam rising from entrance
            const beamAlpha = 0.5 * (1 - spawnCycle / 1500);
            const beamGrad = ctx.createLinearGradient(0, 0, 0, -100 * s);
            beamGrad.addColorStop(0, `rgba(255, 255, 255, ${beamAlpha})`);
            beamGrad.addColorStop(1, "transparent");
            ctx.fillStyle = beamGrad;
            ctx.fillRect(-12 * s, -30 * s, 24 * s, -70 * s);
          }

          break;
        }
      }
      ctx.restore();
    }
    // Render all entities with camera offset and zoom
    renderables.forEach((r) => {
      switch (r.type) {
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
    [
      buildingTower,
      draggingTower,
      towers,
      troops,
      hero,
      getCanvasDimensions,
      cameraOffset,
      cameraZoom,
    ]
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
                type: newTroopType as any,
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
          // clear all waves because if u end the level early, they might still be queued
          setLevelStartTime(Date.now());
          //reset special towers
          if (LEVEL_DATA[selectedMap]?.specialTower?.hp) {
            setSpecialTowerHp(LEVEL_DATA[selectedMap].specialTower.hp);
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
          {/* Tooltips */}
          {hoveredTower &&
            (() => {
              const tower = towers.find((t) => t.id === hoveredTower);
              if (!tower) return null;
              const tData = TOWER_DATA[tower.type];
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
                        {tower.type === "station" && (
                          <span className="ml-2">
                            Troops: {tower.currentTroopCount || 0}/
                            {MAX_STATION_TROOPS}
                          </span>
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
