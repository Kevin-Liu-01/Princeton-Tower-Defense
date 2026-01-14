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
          `rgba(${fogBaseRgb.r + 4}, ${fogBaseRgb.g + 4}, ${
            fogBaseRgb.b + 4
          }, ${layerAlpha * 0.75})`
        );
        fogGradient.addColorStop(
          0.6,
          `rgba(${fogBaseRgb.r + 8}, ${fogBaseRgb.g + 8}, ${
            fogBaseRgb.b + 8
          }, ${layerAlpha * 0.4})`
        );
        fogGradient.addColorStop(
          1,
          `rgba(${fogBaseRgb.r + 12}, ${fogBaseRgb.g + 12}, ${
            fogBaseRgb.b + 12
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
          `rgba(${fogBaseRgb.r + 20}, ${fogBaseRgb.g + 18}, ${
            fogBaseRgb.b + 14
          }, 0.5)`
        );
        puffGradient.addColorStop(
          0.5,
          `rgba(${fogBaseRgb.r + 15}, ${fogBaseRgb.g + 14}, ${
            fogBaseRgb.b + 10
          }, 0.25)`
        );
        puffGradient.addColorStop(
          1,
          `rgba(${fogBaseRgb.r + 10}, ${fogBaseRgb.g + 10}, ${
            fogBaseRgb.b + 8
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
      | "deep_water";

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

    // Environment decorations (avoid path)
    for (let i = 0; i < 55; i++) {
      const gridX = seededRandom() * (GRID_WIDTH - 2) + 1;
      const gridY = seededRandom() * (GRID_HEIGHT - 2) + 1;
      const worldPos = gridToWorld({ x: gridX, y: gridY });
      let onPath = false;
      for (let j = 0; j < path.length - 1; j++) {
        const p1 = gridToWorldPath(path[j]);
        const p2 = gridToWorldPath(path[j + 1]);
        if (
          distanceToLineSegment(worldPos, p1, p2) <
          TOWER_PLACEMENT_BUFFER + 15
        ) {
          onPath = true;
          break;
        }
      }
      // Also check secondary path
      if (
        !onPath &&
        levelData?.secondaryPath &&
        MAP_PATHS[levelData.secondaryPath]
      ) {
        const secPath = MAP_PATHS[levelData.secondaryPath];
        for (let j = 0; j < secPath.length - 1; j++) {
          const p1 = gridToWorldPath(secPath[j]);
          const p2 = gridToWorldPath(secPath[j + 1]);
          if (
            distanceToLineSegment(worldPos, p1, p2) <
            TOWER_PLACEMENT_BUFFER + 15
          ) {
            onPath = true;
            break;
          }
        }
      }
      if (onPath) continue;
      const type =
        themeDecorTypes[Math.floor(seededRandom() * themeDecorTypes.length)];
      decorations.push({
        type,
        x: worldPos.x,
        y: worldPos.y,
        scale: 0.7 + seededRandom() * 0.5,
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
    for (let i = 0; i < 35; i++) {
      const gridX = seededRandom() * (GRID_WIDTH - 1) + 0.5;
      const gridY = seededRandom() * (GRID_HEIGHT - 1) + 0.5;
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
        case "tree":
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 2,
            screenPos.y + 8 * s,
            20 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = variant < 2 ? "#5d4037" : "#4a3728";
          ctx.fillRect(
            screenPos.x - 4 * s,
            screenPos.y - 18 * s,
            8 * s,
            22 * s
          );
          const treeColors = [
            ["#2e7d32", "#388e3c", "#43a047"],
            ["#1b5e20", "#2e7d32", "#388e3c"],
            ["#33691e", "#558b2f", "#689f38"],
            ["#4a6741", "#5a7751", "#6a8761"],
          ][variant];
          ctx.fillStyle = treeColors[0];
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 18 * s,
            24 * s,
            12 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = treeColors[1];
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 24 * s,
            20 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = treeColors[2];
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 29 * s,
            15 * s,
            7 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
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
        case "grass":
          ctx.strokeStyle = ["#4a5d23", "#3d4f1c", "#556b2f", "#6b8e23"][
            variant
          ];
          ctx.lineWidth = 1.5 * s;
          for (let g = 0; g < 5; g++) {
            const gx = screenPos.x + (g - 2) * 4 * s;
            const sway = Math.sin(decorTime * 2 + g + dec.x) * 2 * s;
            ctx.beginPath();
            ctx.moveTo(gx, screenPos.y);
            ctx.quadraticCurveTo(
              gx + sway,
              screenPos.y - 8 * s,
              gx + sway * 1.5,
              screenPos.y - 14 * s
            );
            ctx.stroke();
          }
          break;
        case "crater":
          ctx.fillStyle = "rgba(30,15,5,0.35)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            30 * s,
            15 * s,
            rotation,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#3d2817";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            22 * s,
            11 * s,
            rotation,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#2a1a0f";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 2 * s,
            16 * s,
            8 * s,
            rotation,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
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
        case "flowers":
          const flowerColors = ["#FF5252", "#FFEB3B", "#E040FB", "#40C4FF"];
          const fCol = flowerColors[variant % flowerColors.length];
          // Stems
          ctx.strokeStyle = "#2E7D32";
          ctx.lineWidth = 2 * s;
          for (let i = 0; i < 3; i++) {
            const fx = screenPos.x + (i - 1) * 8 * s;
            const fy = screenPos.y;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.quadraticCurveTo(fx + 2 * s, fy - 5 * s, fx, fy - 10 * s);
            ctx.stroke();
            // Petals
            ctx.fillStyle = fCol;
            ctx.beginPath();
            ctx.arc(fx, fy - 10 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
            // Center
            ctx.fillStyle = "#FFF176";
            ctx.beginPath();
            ctx.arc(fx, fy - 10 * s, 1 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
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
        case "fountain":
          // Basin
          ctx.fillStyle = "#90A4AE";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            20 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "#CFD8DC";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 2 * s,
            16 * s,
            8 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Water
          ctx.fillStyle = "#4FC3F7";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 3 * s,
            14 * s,
            7 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Spout
          const spray = Math.sin(decorTime * 4) * 2 * s;
          ctx.fillStyle = "#E1F5FE";
          ctx.beginPath();
          ctx.arc(
            screenPos.x,
            screenPos.y - 10 * s + spray,
            4 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
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
        case "palm":
          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 15 * s,
            screenPos.y + 5 * s,
            25 * s,
            12 * s,
            0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Trunk (curved)
          ctx.strokeStyle = "#8b6914";
          ctx.lineWidth = 6 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y + 5 * s);
          ctx.quadraticCurveTo(
            screenPos.x + 8 * s,
            screenPos.y - 20 * s,
            screenPos.x + 5 * s,
            screenPos.y - 45 * s
          );
          ctx.stroke();
          // Trunk texture
          ctx.strokeStyle = "#6b4c12";
          ctx.lineWidth = 2 * s;
          for (let i = 0; i < 6; i++) {
            const ty = screenPos.y - i * 8 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 2 * s - 3 * s, ty);
            ctx.lineTo(screenPos.x + 2 * s + 3 * s, ty);
            ctx.stroke();
          }
          // Palm fronds
          const palmColors = ["#228b22", "#2e8b57", "#3cb371"];
          for (let f = 0; f < 7; f++) {
            const angle = (f / 7) * Math.PI * 2 + decorTime * 0.3;
            const frondLen = 30 * s;
            ctx.strokeStyle = palmColors[f % 3];
            ctx.lineWidth = 3 * s;
            ctx.beginPath();
            ctx.moveTo(screenPos.x + 5 * s, screenPos.y - 45 * s);
            const endX = screenPos.x + 5 * s + Math.cos(angle) * frondLen;
            const endY =
              screenPos.y - 45 * s + Math.sin(angle) * frondLen * 0.4 + 10 * s;
            ctx.quadraticCurveTo(
              screenPos.x + 5 * s + Math.cos(angle) * frondLen * 0.5,
              screenPos.y - 50 * s,
              endX,
              endY
            );
            ctx.stroke();
          }
          break;
        case "cactus":
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 3 * s,
            12 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Main body
          ctx.fillStyle = "#2d5a27";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 6 * s, screenPos.y + 2 * s);
          ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 25 * s);
          ctx.quadraticCurveTo(
            screenPos.x,
            screenPos.y - 30 * s,
            screenPos.x + 5 * s,
            screenPos.y - 25 * s
          );
          ctx.lineTo(screenPos.x + 6 * s, screenPos.y + 2 * s);
          ctx.closePath();
          ctx.fill();
          // Arms
          if (variant > 1) {
            ctx.fillStyle = "#2d5a27";
            ctx.beginPath();
            ctx.moveTo(screenPos.x - 5 * s, screenPos.y - 12 * s);
            ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 15 * s);
            ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 25 * s);
            ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 25 * s);
            ctx.lineTo(screenPos.x - 12 * s, screenPos.y - 18 * s);
            ctx.lineTo(screenPos.x - 5 * s, screenPos.y - 15 * s);
            ctx.closePath();
            ctx.fill();
          }
          // Highlight
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(
            screenPos.x - 2 * s,
            screenPos.y - 20 * s,
            2 * s,
            15 * s
          );
          break;
        case "dune":
          ctx.fillStyle = "#d4a84b";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 40 * s, screenPos.y + 5 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 10 * s,
            screenPos.y - 15 * s,
            screenPos.x + 10 * s,
            screenPos.y - 8 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x + 30 * s,
            screenPos.y - 3 * s,
            screenPos.x + 45 * s,
            screenPos.y + 5 * s
          );
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#c9a227";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 35 * s, screenPos.y + 5 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 5 * s,
            screenPos.y - 10 * s,
            screenPos.x + 15 * s,
            screenPos.y - 5 * s
          );
          ctx.lineTo(screenPos.x + 40 * s, screenPos.y + 5 * s);
          ctx.closePath();
          ctx.fill();
          break;
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
        case "pine":
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 3 * s,
            screenPos.y + 8 * s,
            18 * s,
            8 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Trunk
          ctx.fillStyle = "#4a3728";
          ctx.fillRect(screenPos.x - 4 * s, screenPos.y - 5 * s, 8 * s, 12 * s);
          // Snow-covered layers
          const pineColors = ["#1a4a3a", "#2a5a4a", "#3a6a5a"];
          for (let layer = 0; layer < 3; layer++) {
            const layerY = screenPos.y - 10 * s - layer * 15 * s;
            const layerW = (25 - layer * 6) * s;
            ctx.fillStyle = pineColors[layer];
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW, layerY);
            ctx.lineTo(screenPos.x, layerY - 18 * s);
            ctx.lineTo(screenPos.x + layerW, layerY);
            ctx.closePath();
            ctx.fill();
            // Snow on top
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.beginPath();
            ctx.moveTo(screenPos.x - layerW * 0.6, layerY - 5 * s);
            ctx.lineTo(screenPos.x, layerY - 18 * s);
            ctx.lineTo(screenPos.x + layerW * 0.6, layerY - 5 * s);
            ctx.closePath();
            ctx.fill();
          }
          break;
        case "snowman":
          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 5 * s,
            18 * s,
            8 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Bottom ball
          ctx.fillStyle = "#f5f5f5";
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 5 * s, 15 * s, 0, Math.PI * 2);
          ctx.fill();
          // Middle ball
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 22 * s, 11 * s, 0, Math.PI * 2);
          ctx.fill();
          // Head
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 38 * s, 8 * s, 0, Math.PI * 2);
          ctx.fill();
          // Eyes
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 3 * s,
            screenPos.y - 40 * s,
            2 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            screenPos.x + 3 * s,
            screenPos.y - 40 * s,
            2 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Carrot nose
          ctx.fillStyle = "#ff6b00";
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 38 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y - 36 * s);
          ctx.lineTo(screenPos.x, screenPos.y - 34 * s);
          ctx.closePath();
          ctx.fill();
          break;
        case "ice_crystal":
          ctx.fillStyle = "rgba(100,200,255,0.3)";
          for (let spike = 0; spike < 6; spike++) {
            const angle = (spike / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y);
            ctx.lineTo(
              screenPos.x + Math.cos(angle) * 20 * s,
              screenPos.y + Math.sin(angle) * 10 * s - 15 * s
            );
            ctx.lineTo(
              screenPos.x + Math.cos(angle + 0.2) * 8 * s,
              screenPos.y + Math.sin(angle + 0.2) * 4 * s
            );
            ctx.closePath();
            ctx.fill();
          }
          ctx.fillStyle = "rgba(200,240,255,0.6)";
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 5 * s, 6 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "snow_pile":
          ctx.fillStyle = "#e8e8e8";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 25 * s, screenPos.y + 5 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 10 * s,
            screenPos.y - 10 * s,
            screenPos.x + 5 * s,
            screenPos.y - 5 * s
          );
          ctx.quadraticCurveTo(
            screenPos.x + 20 * s,
            screenPos.y,
            screenPos.x + 30 * s,
            screenPos.y + 5 * s
          );
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 20 * s, screenPos.y + 3 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 5 * s,
            screenPos.y - 5 * s,
            screenPos.x + 10 * s,
            screenPos.y
          );
          ctx.lineTo(screenPos.x + 25 * s, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();
          break;
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
        case "lava_pool":
          // Outer glow
          ctx.fillStyle = "rgba(255,100,0,0.3)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            35 * s,
            18 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Dark rim
          ctx.fillStyle = "#2a1a1a";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            28 * s,
            14 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Lava surface
          ctx.fillStyle = "#ff4400";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            22 * s,
            11 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Bright center
          ctx.fillStyle = "#ff8800";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            12 * s,
            6 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Animated bubbles
          const bubblePhase = decorTime * 2;
          ctx.fillStyle = "#ffaa00";
          ctx.beginPath();
          ctx.arc(
            screenPos.x + Math.sin(bubblePhase) * 8 * s,
            screenPos.y + Math.cos(bubblePhase * 1.3) * 4 * s,
            3 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            screenPos.x - Math.cos(bubblePhase * 0.7) * 10 * s,
            screenPos.y + Math.sin(bubblePhase) * 3 * s,
            2 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case "obsidian_spike":
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 3 * s,
            screenPos.y + 5 * s,
            12 * s,
            6 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Main spike
          ctx.fillStyle = "#1a1a2a";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 10 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x + 10 * s, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();
          // Glossy highlight
          ctx.fillStyle = "rgba(100,100,150,0.4)";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y + 3 * s);
          ctx.lineTo(screenPos.x - 2 * s, screenPos.y - 35 * s);
          ctx.lineTo(screenPos.x + 2 * s, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x, screenPos.y + 3 * s);
          ctx.closePath();
          ctx.fill();
          break;
        case "charred_tree":
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 2 * s,
            screenPos.y + 5 * s,
            15 * s,
            7 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Burnt trunk
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(
            screenPos.x - 5 * s,
            screenPos.y - 30 * s,
            10 * s,
            35 * s
          );
          // Broken branches
          ctx.strokeStyle = "#2a2a2a";
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y - 20 * s);
          ctx.lineTo(screenPos.x - 15 * s, screenPos.y - 28 * s);
          ctx.moveTo(screenPos.x, screenPos.y - 15 * s);
          ctx.lineTo(screenPos.x + 12 * s, screenPos.y - 20 * s);
          ctx.stroke();
          // Embers
          ctx.fillStyle = "#ff4400";
          ctx.globalAlpha = 0.5 + Math.sin(decorTime * 3) * 0.3;
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 2 * s,
            screenPos.y - 25 * s,
            2 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            screenPos.x + 3 * s,
            screenPos.y - 18 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
        case "ember":
          ctx.fillStyle = `rgba(255,${
            100 + Math.sin(decorTime * 5 + variant) * 50
          },0,${0.5 + Math.sin(decorTime * 3) * 0.3})`;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, 4 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ff8800";
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, 2 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
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
        case "swamp_tree":
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x + 3 * s,
            screenPos.y + 8 * s,
            22 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Gnarled trunk
          ctx.fillStyle = "#3a2a1a";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 8 * s, screenPos.y + 5 * s);
          ctx.quadraticCurveTo(
            screenPos.x - 12 * s,
            screenPos.y - 15 * s,
            screenPos.x - 5 * s,
            screenPos.y - 35 * s
          );
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 35 * s);
          ctx.quadraticCurveTo(
            screenPos.x + 10 * s,
            screenPos.y - 15 * s,
            screenPos.x + 8 * s,
            screenPos.y + 5 * s
          );
          ctx.closePath();
          ctx.fill();
          // Hanging moss
          ctx.strokeStyle = "#4a6a4a";
          ctx.lineWidth = 2 * s;
          for (let m = 0; m < 5; m++) {
            const mx = screenPos.x - 15 * s + m * 8 * s;
            const sway = Math.sin(decorTime + m) * 3 * s;
            ctx.beginPath();
            ctx.moveTo(mx, screenPos.y - 30 * s);
            ctx.quadraticCurveTo(
              mx + sway,
              screenPos.y - 20 * s,
              mx + sway * 0.5,
              screenPos.y - 10 * s
            );
            ctx.stroke();
          }
          // Dark foliage
          ctx.fillStyle = "#2a4a2a";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y - 35 * s,
            20 * s,
            12 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case "mushroom":
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 3 * s,
            10 * s,
            5 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Stem
          ctx.fillStyle = "#e8e0d0";
          ctx.fillRect(screenPos.x - 3 * s, screenPos.y - 8 * s, 6 * s, 12 * s);
          // Cap
          const mushroomColors = ["#8b0000", "#4a0080", "#006400", "#804000"][
            variant
          ];
          ctx.fillStyle = mushroomColors;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 10 * s, 12 * s, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          // Spots
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 5 * s,
            screenPos.y - 14 * s,
            2 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            screenPos.x + 4 * s,
            screenPos.y - 12 * s,
            1.5 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Glow effect for some
          if (variant === 1) {
            ctx.fillStyle = `rgba(150,0,200,${
              0.2 + Math.sin(decorTime * 2) * 0.1
            })`;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y - 10 * s, 15 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        case "lily_pad":
          ctx.fillStyle = "#2a5a2a";
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, 12 * s, 0.2, Math.PI * 2 - 0.2);
          ctx.lineTo(screenPos.x, screenPos.y);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#3a7a3a";
          ctx.beginPath();
          ctx.arc(
            screenPos.x - 2 * s,
            screenPos.y - 2 * s,
            8 * s,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Flower on some
          if (variant === 0) {
            ctx.fillStyle = "#ff69b4";
            for (let p = 0; p < 5; p++) {
              const pa = (p / 5) * Math.PI * 2;
              ctx.beginPath();
              ctx.ellipse(
                screenPos.x + Math.cos(pa) * 4 * s,
                screenPos.y + Math.sin(pa) * 2 * s - 3 * s,
                3 * s,
                2 * s,
                pa,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
            ctx.fillStyle = "#ffff00";
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y - 3 * s, 2 * s, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        case "fog_wisp":
          ctx.fillStyle = `rgba(100,150,100,${
            0.15 + Math.sin(decorTime + variant) * 0.1
          })`;
          const wispX =
            screenPos.x + Math.sin(decorTime * 0.5 + variant) * 10 * s;
          const wispY = screenPos.y + Math.cos(decorTime * 0.3) * 5 * s;
          ctx.beginPath();
          ctx.ellipse(wispX, wispY, 30 * s, 15 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(150,200,150,${
            0.1 + Math.sin(decorTime * 0.7) * 0.05
          })`;
          ctx.beginPath();
          ctx.ellipse(
            wispX + 10 * s,
            wispY - 5 * s,
            20 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
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
          ctx.fillStyle = `rgba(60, 50, 60, ${
            0.4 + Math.sin(time * 1.5) * 0.15
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
          // Animated deep water pool with layers

          // outside glow
          ctx.fillStyle = "rgba(0,0,100,0.3)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            30 * s,
            15 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Dark rim
          ctx.fillStyle = "#0a0a4a";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y,
            24 * s,
            12 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Light reflections
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          for (let r = 0; r < 3; r++) {
            const rx =
              screenPos.x -
              10 * s +
              r * 10 * s +
              Math.sin(decorTime * 3 + r) * 3 * s;
            const ry =
              screenPos.y - 2 * s + Math.cos(decorTime * 2 + r) * 2 * s;
            ctx.beginPath();
            ctx.ellipse(rx, ry, 6 * s, 3 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;

        // === MISC DECORATIONS ===
        case "ruins":
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 10 * s,
            40 * s,
            20 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Broken walls
          ctx.fillStyle = "#5a5a5a";
          ctx.fillRect(
            screenPos.x - 30 * s,
            screenPos.y - 20 * s,
            15 * s,
            30 * s
          );
          ctx.fillRect(
            screenPos.x + 10 * s,
            screenPos.y - 15 * s,
            20 * s,
            25 * s
          );
          // Rubble
          ctx.fillStyle = "#4a4a4a";
          for (let r = 0; r < 6; r++) {
            const rx = screenPos.x - 20 * s + r * 10 * s + Math.sin(r) * 5 * s;
            const ry = screenPos.y + 5 * s + Math.cos(r) * 3 * s;
            ctx.beginPath();
            ctx.ellipse(rx, ry, 5 * s, 3 * s, r, 0, Math.PI * 2);
            ctx.fill();
          }
          // Broken column
          ctx.fillStyle = "#6a6a6a";
          ctx.beginPath();
          ctx.moveTo(screenPos.x - 5 * s, screenPos.y + 5 * s);
          ctx.lineTo(screenPos.x - 8 * s, screenPos.y - 25 * s);
          ctx.lineTo(screenPos.x + 5 * s, screenPos.y - 30 * s);
          ctx.lineTo(screenPos.x + 8 * s, screenPos.y + 5 * s);
          ctx.closePath();
          ctx.fill();
          break;
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
          ctx.fillStyle = `rgba(255,150,50,${
            0.15 + Math.sin(decorTime * 6) * 0.05
          })`;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 25 * s, 20 * s, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "statue":
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 8 * s,
            20 * s,
            10 * s,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Pedestal
          ctx.fillStyle = "#5a5a5a";
          ctx.fillRect(
            screenPos.x - 15 * s,
            screenPos.y - 5 * s,
            30 * s,
            12 * s
          );
          ctx.fillStyle = "#6a6a6a";
          ctx.fillRect(
            screenPos.x - 12 * s,
            screenPos.y - 8 * s,
            24 * s,
            5 * s
          );
          // Figure
          ctx.fillStyle = "#4a4a4a";
          ctx.fillRect(
            screenPos.x - 8 * s,
            screenPos.y - 35 * s,
            16 * s,
            30 * s
          );
          // Head
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y - 42 * s, 8 * s, 0, Math.PI * 2);
          ctx.fill();
          // Arms
          ctx.fillRect(
            screenPos.x - 18 * s,
            screenPos.y - 30 * s,
            10 * s,
            5 * s
          );
          ctx.fillRect(
            screenPos.x + 8 * s,
            screenPos.y - 30 * s,
            10 * s,
            5 * s
          );
          break;
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
    // MASSIVELY IMPROVED EPIC HAZARD SPRITES
    // =========================================================================
    if (LEVEL_DATA[selectedMap].hazards) {
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
    // Draw atmospheric fog around entire battlefield (UI layer) - themed
    const time = Date.now() / 1000;
    const edgeFogRgb = hexToRgb(theme.ground[2]);
    // Left edge fog - extensive and atmospheric
    const leftFog = ctx.createLinearGradient(
      0,
      height / 2,
      width * 0.35,
      height / 2
    );
    leftFog.addColorStop(
      0,
      `rgba(${edgeFogRgb.r}, ${edgeFogRgb.g}, ${edgeFogRgb.b}, 0.95)`
    );
    leftFog.addColorStop(
      0.3,
      `rgba(${edgeFogRgb.r + 4}, ${edgeFogRgb.g + 4}, ${edgeFogRgb.b + 4}, 0.7)`
    );
    leftFog.addColorStop(
      0.6,
      `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 7}, ${
        edgeFogRgb.b + 7
      }, 0.35)`
    );
    leftFog.addColorStop(
      0.85,
      `rgba(${edgeFogRgb.r + 12}, ${edgeFogRgb.g + 10}, ${
        edgeFogRgb.b + 10
      }, 0.1)`
    );
    leftFog.addColorStop(
      1,
      `rgba(${edgeFogRgb.r + 14}, ${edgeFogRgb.g + 12}, ${
        edgeFogRgb.b + 12
      }, 0)`
    );
    ctx.fillStyle = leftFog;
    ctx.fillRect(0, 0, width * 0.35, height);
    // Right edge fog
    const rightFog = ctx.createLinearGradient(
      width * 0.65,
      height / 2,
      width,
      height / 2
    );
    rightFog.addColorStop(
      0,
      `rgba(${edgeFogRgb.r + 14}, ${edgeFogRgb.g + 12}, ${
        edgeFogRgb.b + 12
      }, 0)`
    );
    rightFog.addColorStop(
      0.15,
      `rgba(${edgeFogRgb.r + 12}, ${edgeFogRgb.g + 10}, ${
        edgeFogRgb.b + 10
      }, 0.1)`
    );
    rightFog.addColorStop(
      0.4,
      `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 7}, ${
        edgeFogRgb.b + 7
      }, 0.35)`
    );
    rightFog.addColorStop(
      0.7,
      `rgba(${edgeFogRgb.r + 4}, ${edgeFogRgb.g + 4}, ${edgeFogRgb.b + 4}, 0.7)`
    );
    rightFog.addColorStop(
      1,
      `rgba(${edgeFogRgb.r}, ${edgeFogRgb.g}, ${edgeFogRgb.b}, 0.95)`
    );
    ctx.fillStyle = rightFog;
    ctx.fillRect(width * 0.65, 0, width * 0.35, height);
    // Top edge fog
    const topFog = ctx.createLinearGradient(
      width / 2,
      0,
      width / 2,
      height * 0.3
    );
    topFog.addColorStop(
      0,
      `rgba(${edgeFogRgb.r}, ${edgeFogRgb.g}, ${edgeFogRgb.b}, 0.9)`
    );
    topFog.addColorStop(
      0.4,
      `rgba(${edgeFogRgb.r + 4}, ${edgeFogRgb.g + 4}, ${edgeFogRgb.b + 4}, 0.5)`
    );
    topFog.addColorStop(
      0.75,
      `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 7}, ${
        edgeFogRgb.b + 7
      }, 0.15)`
    );
    topFog.addColorStop(
      1,
      `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 7}, ${edgeFogRgb.b + 7}, 0)`
    );
    ctx.fillStyle = topFog;
    ctx.fillRect(0, 0, width, height * 0.3);
    // Bottom edge fog
    const bottomFog = ctx.createLinearGradient(
      width / 2,
      height * 0.7,
      width / 2,
      height
    );
    bottomFog.addColorStop(
      0,
      `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 7}, ${edgeFogRgb.b + 7}, 0)`
    );
    bottomFog.addColorStop(
      0.25,
      `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 7}, ${
        edgeFogRgb.b + 7
      }, 0.15)`
    );
    bottomFog.addColorStop(
      0.6,
      `rgba(${edgeFogRgb.r + 4}, ${edgeFogRgb.g + 4}, ${edgeFogRgb.b + 4}, 0.5)`
    );
    bottomFog.addColorStop(
      1,
      `rgba(${edgeFogRgb.r}, ${edgeFogRgb.g}, ${edgeFogRgb.b}, 0.9)`
    );
    ctx.fillStyle = bottomFog;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
    // Additional fog cloud puffs for depth throughout the battlefield edges - themed
    const drawFogCloud = (
      x: number,
      y: number,
      radius: number,
      baseAlpha: number
    ) => {
      const animOffset = Math.sin(time * 0.3) * 8;
      for (let i = 0; i < 4; i++) {
        const puffX = x + Math.sin(time * 0.25 + i * 1.5) * 15 + animOffset;
        const puffY = y + Math.cos(time * 0.35 + i) * 8;
        const puffR = radius * (0.7 + i * 0.15);
        const cloudGradient = ctx.createRadialGradient(
          puffX,
          puffY,
          0,
          puffX,
          puffY,
          puffR
        );
        cloudGradient.addColorStop(
          0,
          `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 6}, ${
            edgeFogRgb.b + 6
          }, ${baseAlpha * 0.7})`
        );
        cloudGradient.addColorStop(
          0.4,
          `rgba(${edgeFogRgb.r + 14}, ${edgeFogRgb.g + 10}, ${
            edgeFogRgb.b + 10
          }, ${baseAlpha * 0.4})`
        );
        cloudGradient.addColorStop(
          0.7,
          `rgba(${edgeFogRgb.r + 19}, ${edgeFogRgb.g + 14}, ${
            edgeFogRgb.b + 14
          }, ${baseAlpha * 0.15})`
        );
        cloudGradient.addColorStop(
          1,
          `rgba(${edgeFogRgb.r + 24}, ${edgeFogRgb.g + 18}, ${
            edgeFogRgb.b + 16
          }, 0)`
        );
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.ellipse(puffX, puffY, puffR, puffR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    // Scatter fog clouds along edges
    drawFogCloud(width * 0.08, height * 0.2, 100, 0.6);
    drawFogCloud(width * 0.12, height * 0.5, 120, 0.5);
    drawFogCloud(width * 0.06, height * 0.75, 90, 0.55);
    drawFogCloud(width * 0.92, height * 0.25, 110, 0.55);
    drawFogCloud(width * 0.88, height * 0.55, 100, 0.5);
    drawFogCloud(width * 0.94, height * 0.8, 95, 0.6);
    drawFogCloud(width * 0.3, height * 0.06, 85, 0.5);
    drawFogCloud(width * 0.6, height * 0.04, 90, 0.55);
    drawFogCloud(width * 0.4, height * 0.94, 95, 0.55);
    drawFogCloud(width * 0.7, height * 0.96, 80, 0.5);
    // Corner fog puffs for extra atmosphere - themed
    const drawCornerFog = (x: number, y: number, radius: number) => {
      const animOffset = Math.sin(time * 0.5) * 5;
      for (let i = 0; i < 5; i++) {
        const puffX = x + Math.sin(time * 0.3 + i) * 12 + animOffset;
        const puffY = y + Math.cos(time * 0.4 + i) * 6;
        const puffR = radius * (0.6 + i * 0.15);
        const cornerGradient = ctx.createRadialGradient(
          puffX,
          puffY,
          0,
          puffX,
          puffY,
          puffR
        );
        cornerGradient.addColorStop(
          0,
          `rgba(${edgeFogRgb.r + 4}, ${edgeFogRgb.g + 4}, ${edgeFogRgb.b}, 0.7)`
        );
        cornerGradient.addColorStop(
          0.4,
          `rgba(${edgeFogRgb.r + 9}, ${edgeFogRgb.g + 8}, ${
            edgeFogRgb.b + 4
          }, 0.4)`
        );
        cornerGradient.addColorStop(
          0.7,
          `rgba(${edgeFogRgb.r + 14}, ${edgeFogRgb.g + 12}, ${
            edgeFogRgb.b + 8
          }, 0.15)`
        );
        cornerGradient.addColorStop(
          1,
          `rgba(${edgeFogRgb.r + 19}, ${edgeFogRgb.g + 17}, ${
            edgeFogRgb.b + 11
          }, 0)`
        );
        ctx.fillStyle = cornerGradient;
        ctx.beginPath();
        ctx.ellipse(puffX, puffY, puffR, puffR * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    // Add fog puffs at corners
    drawCornerFog(width * 0.08, height * 0.08, 120);
    drawCornerFog(width * 0.92, height * 0.08, 120);
    drawCornerFog(width * 0.08, height * 0.92, 120);
    drawCornerFog(width * 0.92, height * 0.92, 120);
    // Fireflies / particles based on theme
    const particleColor =
      mapTheme === "volcanic"
        ? "rgba(255, 100, 0,"
        : mapTheme === "winter"
        ? "rgba(200, 220, 255,"
        : mapTheme === "desert"
        ? "rgba(255, 220, 150,"
        : "rgba(255, 215, 0,";
    for (let i = 0; i < 10; i++) {
      const x = (i * 137.5 + time * 20) % width;
      const y = (i * 421.3 + time * 15) % height;
      const size = 2 + Math.sin(time + i) * 0.8;
      const alpha = 0.06 + Math.sin(time * 2 + i) * 0.06;
      const lightGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      lightGlow.addColorStop(0, `${particleColor} ${alpha})`);
      lightGlow.addColorStop(1, `${particleColor} 0)`);
      ctx.fillStyle = lightGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
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
