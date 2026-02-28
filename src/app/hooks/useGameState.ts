// Princeton Tower Defense - Game State Hook
// Manages core game state with React hooks

import { useState, useCallback, useRef, useMemo } from "react";
import type {
  Tower,
  Enemy,
  Hero,
  Troop,
  Projectile,
  Effect,
  Particle,
  TowerType,
  HeroType,
  Position,
  GridPosition,
  GameState,
} from "../types";
import { HERO_ABILITY_COOLDOWNS, HERO_DATA, TOWER_DATA } from "../constants";
import { getUpgradeCost } from "../constants/towerStats";
import { getLevelWaves } from "../game/pageHelpers";
import { isValidBuildPosition } from "../utils";

// ============================================================================
// WAVE STATE
// ============================================================================

export interface WaveState {
  currentWave: number;
  totalWaves: number;
  waveInProgress: boolean;
  nextWaveTimer: number;
  lastWaveStartedAt: number | null;
}

const DEFAULT_MAP = "nassau";
const DEFAULT_LIVES = 20;

const initializeWaveState = (mapId: string): WaveState => ({
  currentWave: 0,
  totalWaves: getLevelWaves(mapId).length,
  waveInProgress: false,
  nextWaveTimer: 0,
  lastWaveStartedAt: null,
});

const createTowerEntity = (
  type: TowerType,
  pos: GridPosition,
  id: string
): Tower => ({
  id,
  type,
  pos,
  level: 1,
  lastAttack: 0,
  rotation: 0,
  spawnRange: type === "station" ? TOWER_DATA.station.spawnRange : undefined,
  occupiedSpawnSlots: type === "station" ? [false, false, false] : undefined,
  pendingRespawns: type === "station" ? [] : undefined,
});

const createHeroEntity = (type: HeroType, pos: Position, id: string): Hero => {
  const heroData = HERO_DATA[type];
  return {
    id,
    type,
    pos,
    homePos: pos,
    hp: heroData.hp,
    maxHp: heroData.hp,
    moving: false,
    lastAttack: 0,
    abilityReady: true,
    abilityCooldown: 0,
    revived: false,
    rotation: 0,
    attackAnim: 0,
    selected: false,
    dead: false,
    respawnTimer: 0,
  };
};

const getTowerBuildCost = (type: TowerType): number => TOWER_DATA[type]?.cost ?? 0;

const getTowerUpgradeCost = (tower: Tower): number =>
  getUpgradeCost(tower.type, tower.level, tower.upgrade);

const getTowerSellValue = (tower: Tower): number => {
  let totalInvested = getTowerBuildCost(tower.type);
  for (let level = 1; level < tower.level; level++) {
    totalInvested += getUpgradeCost(tower.type, level, tower.upgrade);
  }
  return Math.floor(totalInvested * 0.6);
};

const HERO_ABILITY_EFFECT_TYPE: Record<HeroType, Effect["type"]> = {
  tiger: "roar_wave",
  tenor: "sonic_blast",
  mathey: "fortress_shield",
  rocky: "boulder_strike",
  scott: "inspiration",
  captain: "knight_summon",
  engineer: "turret_deploy",
};

// ============================================================================
// GAME STATE INTERFACE
// ============================================================================

export interface GameStateData {
  // Core state
  gameState: GameState;
  selectedMap: string;
  pawPoints: number;
  lives: number;
  score: number;

  // Wave state
  waveState: WaveState;

  // Entities
  towers: Tower[];
  enemies: Enemy[];
  heroes: Hero[];
  troops: Troop[];
  projectiles: Projectile[];
  effects: Effect[];
  particles: Particle[];

  // Selection state
  selectedTower: string | null;
  selectedHero: string | null;
  hoveredTower: string | null;

  // UI state
  isPaused: boolean;
  gameSpeed: number;
}

export interface GameStateActions {
  // Game flow
  startGame: (mapId: string, startingGold: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setGameSpeed: (speed: number) => void;

  // Tower actions
  buildTower: (type: TowerType, pos: GridPosition) => boolean;
  sellTower: (towerId: string) => number;
  upgradeTower: (towerId: string) => boolean;
  selectTower: (towerId: string | null) => void;
  hoverTower: (towerId: string | null) => void;

  // Hero actions
  placeHero: (type: HeroType, pos: Position) => string | null;
  moveHero: (heroId: string, pos: Position) => void;
  selectHero: (heroId: string | null) => void;
  useHeroAbility: (heroId: string) => void;

  // Entity updates
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (enemyId: string) => void;
  addProjectile: (projectile: Projectile) => void;
  removeProjectile: (projectileId: string) => void;
  addEffect: (effect: Effect) => void;
  removeEffect: (effectId: string) => void;
  addParticle: (particle: Particle) => void;

  // Resource management
  addPawPoints: (amount: number) => void;
  spendPawPoints: (amount: number) => boolean;
  loseLife: () => void;

  // Wave management
  startNextWave: () => boolean;

  // State setters for batch updates
  setTowers: React.Dispatch<React.SetStateAction<Tower[]>>;
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  setHeroes: React.Dispatch<React.SetStateAction<Hero[]>>;
  setTroops: React.Dispatch<React.SetStateAction<Troop[]>>;
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  setEffects: React.Dispatch<React.SetStateAction<Effect[]>>;
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  setWaveState: React.Dispatch<React.SetStateAction<WaveState>>;
  setPawPoints: React.Dispatch<React.SetStateAction<number>>;
  setLives: React.Dispatch<React.SetStateAction<number>>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useGameState(
  gridWidth: number = 16,
  gridHeight: number = 10
): [GameStateData, GameStateActions] {
  // Core state
  const [gameState, setGameState] = useState<GameState>("menu");
  const [selectedMap, setSelectedMap] = useState<string>(DEFAULT_MAP);
  const [pawPoints, setPawPoints] = useState<number>(0);
  const [lives, setLives] = useState<number>(DEFAULT_LIVES);
  const [score, setScore] = useState<number>(0);

  // Wave state
  const [waveState, setWaveState] = useState<WaveState>(() =>
    initializeWaveState(DEFAULT_MAP)
  );

  // Entities
  const [towers, setTowers] = useState<Tower[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [troops, setTroops] = useState<Troop[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Selection state
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [hoveredTower, setHoveredTower] = useState<string | null>(null);

  // UI state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameSpeed, setGameSpeedState] = useState<number>(1);

  // ID counter for entity creation
  const idCounter = useRef<number>(0);
  const generateEntityId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${Date.now()}-${idCounter.current}`;
  }, []);

  // ============================================================================
  // GAME FLOW ACTIONS
  // ============================================================================

  const startGame = useCallback((mapId: string, startingGold: number) => {
    setSelectedMap(mapId);
    setPawPoints(startingGold);
    setLives(DEFAULT_LIVES);
    setScore(0);
    setTowers([]);
    setEnemies([]);
    setHeroes([]);
    setTroops([]);
    setProjectiles([]);
    setEffects([]);
    setParticles([]);
    setWaveState(initializeWaveState(mapId));
    setSelectedTower(null);
    setSelectedHero(null);
    setGameState("setup");
    setIsPaused(false);
    setGameSpeedState(1);
  }, []);

  const pauseGame = useCallback(() => {
    setIsPaused(true);
    setGameState("paused");
  }, []);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
    setGameState("playing");
  }, []);

  const setGameSpeed = useCallback((speed: number) => {
    setGameSpeedState(Math.max(0.5, Math.min(3, speed)));
  }, []);

  // ============================================================================
  // TOWER ACTIONS
  // ============================================================================

  const buildTower = useCallback(
    (type: TowerType, pos: GridPosition): boolean => {
      const cost = getTowerBuildCost(type);
      if (pawPoints < cost) return false;

      if (!isValidBuildPosition(pos, selectedMap, towers, gridWidth, gridHeight)) {
        return false;
      }

      const newTower = createTowerEntity(type, pos, generateEntityId("tower"));
      setTowers((prev) => [...prev, newTower]);
      setPawPoints((prev) => prev - cost);
      return true;
    },
    [pawPoints, selectedMap, towers, gridWidth, gridHeight, generateEntityId]
  );

  const sellTowerAction = useCallback(
    (towerId: string): number => {
      const tower = towers.find((t) => t.id === towerId);
      if (!tower) return 0;

      const sellValue = getTowerSellValue(tower);
      setTowers((prev) => prev.filter((t) => t.id !== towerId));
      setPawPoints((prev) => prev + sellValue);

      if (selectedTower === towerId) {
        setSelectedTower(null);
      }

      if (tower.type === "station") {
        setTroops((prev) => prev.filter((t) => t.ownerId !== towerId));
      }

      return sellValue;
    },
    [towers, selectedTower]
  );

  const upgradeTowerAction = useCallback(
    (towerId: string): boolean => {
      const tower = towers.find((t) => t.id === towerId);
      if (!tower || tower.level >= 4) return false;

      const cost = getTowerUpgradeCost(tower);
      if (pawPoints < cost) return false;

      setTowers((prev) =>
        prev.map((t) => {
          if (t.id !== towerId) return t;
          const nextLevel = (t.level + 1) as 2 | 3 | 4;
          return {
            ...t,
            level: nextLevel,
            upgrade: t.level === 3 ? (t.upgrade ?? "A") : t.upgrade,
          };
        })
      );
      setPawPoints((prev) => prev - cost);
      return true;
    },
    [towers, pawPoints]
  );

  const selectTower = useCallback((towerId: string | null) => {
    setSelectedTower(towerId);
    setSelectedHero(null);
    setTowers((prev) =>
      prev.map((t) => ({ ...t, selected: t.id === towerId }))
    );
  }, []);

  const hoverTower = useCallback((towerId: string | null) => {
    setHoveredTower(towerId);
  }, []);

  // ============================================================================
  // HERO ACTIONS
  // ============================================================================

  const placeHero = useCallback(
    (type: HeroType, pos: Position): string | null => {
      const existingHero = heroes.find((h) => h.type === type);
      if (existingHero) return null;

      const newHero = createHeroEntity(type, pos, generateEntityId("hero"));
      setHeroes((prev) => [...prev, newHero]);
      return newHero.id;
    },
    [heroes, generateEntityId]
  );

  const moveHeroAction = useCallback((heroId: string, pos: Position) => {
    setHeroes((prev) =>
      prev.map((h) => {
        if (h.id === heroId && !h.dead) {
          return { ...h, targetPos: pos, moving: true };
        }
        return h;
      })
    );
  }, []);

  const selectHero = useCallback((heroId: string | null) => {
    setSelectedHero(heroId);
    setSelectedTower(null);
    setHeroes((prev) => prev.map((h) => ({ ...h, selected: h.id === heroId })));
  }, []);

  const useHeroAbility = useCallback(
    (heroId: string) => {
      const hero = heroes.find((h) => h.id === heroId);
      if (!hero || !hero.abilityReady || hero.dead) return;

      const abilityCooldown = HERO_ABILITY_COOLDOWNS[hero.type] ?? 10000;
      setHeroes((prev) =>
        prev.map((h) =>
          h.id === heroId
            ? {
                ...h,
                abilityReady: false,
                abilityCooldown: abilityCooldown,
              }
            : h
        )
      );

      setEffects((prev) => [
        ...prev,
        {
          id: generateEntityId("effect"),
          pos: hero.pos,
          type: HERO_ABILITY_EFFECT_TYPE[hero.type],
          progress: 0,
          size: hero.type === "tiger" ? 180 : 100,
          duration: 1000,
        },
      ]);
    },
    [heroes, generateEntityId]
  );

  // ============================================================================
  // ENTITY MANAGEMENT
  // ============================================================================

  const addEnemy = useCallback((enemy: Enemy) => {
    setEnemies((prev) => [...prev, enemy]);
  }, []);

  const removeEnemy = useCallback((enemyId: string) => {
    setEnemies((prev) => {
      if (!prev.some((e) => e.id === enemyId)) return prev;
      return prev.filter((e) => e.id !== enemyId);
    });
  }, []);

  const addProjectile = useCallback((projectile: Projectile) => {
    setProjectiles((prev) => [...prev, projectile]);
  }, []);

  const removeProjectile = useCallback((projectileId: string) => {
    setProjectiles((prev) => {
      if (!prev.some((p) => p.id === projectileId)) return prev;
      return prev.filter((p) => p.id !== projectileId);
    });
  }, []);

  const addEffect = useCallback((effect: Effect) => {
    setEffects((prev) => [...prev, effect]);
  }, []);

  const removeEffect = useCallback((effectId: string) => {
    setEffects((prev) => {
      if (!prev.some((e) => e.id === effectId)) return prev;
      return prev.filter((e) => e.id !== effectId);
    });
  }, []);

  const addParticle = useCallback((particle: Particle) => {
    setParticles((prev) => [...prev, particle]);
  }, []);

  // ============================================================================
  // RESOURCE MANAGEMENT
  // ============================================================================

  const addPawPoints = useCallback((amount: number) => {
    setPawPoints((prev) => prev + amount);
    setScore((prev) => prev + amount);
  }, []);

  const spendPawPoints = useCallback(
    (amount: number): boolean => {
      if (pawPoints < amount) return false;
      setPawPoints((prev) => prev - amount);
      return true;
    },
    [pawPoints]
  );

  const loseLife = useCallback(() => {
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setGameState("defeat");
      }
      return Math.max(0, nextLives);
    });
  }, []);

  // ============================================================================
  // WAVE MANAGEMENT
  // ============================================================================

  const startNextWaveAction = useCallback((): boolean => {
    if (waveState.waveInProgress || waveState.currentWave >= waveState.totalWaves) {
      return false;
    }

    setWaveState((prev) => ({
      ...prev,
      currentWave: prev.currentWave + 1,
      waveInProgress: true,
      nextWaveTimer: 0,
      lastWaveStartedAt: Date.now(),
    }));
    setGameState("playing");
    return true;
  }, [waveState]);

  // ============================================================================
  // RETURN STATE AND ACTIONS
  // ============================================================================

  const state = useMemo<GameStateData>(
    () => ({
      gameState,
      selectedMap,
      pawPoints,
      lives,
      score,
      waveState,
      towers,
      enemies,
      heroes,
      troops,
      projectiles,
      effects,
      particles,
      selectedTower,
      selectedHero,
      hoveredTower,
      isPaused,
      gameSpeed,
    }),
    [
      gameState,
      selectedMap,
      pawPoints,
      lives,
      score,
      waveState,
      towers,
      enemies,
      heroes,
      troops,
      projectiles,
      effects,
      particles,
      selectedTower,
      selectedHero,
      hoveredTower,
      isPaused,
      gameSpeed,
    ]
  );

  const actions = useMemo<GameStateActions>(
    () => ({
      startGame,
      pauseGame,
      resumeGame,
      setGameSpeed,
      buildTower,
      sellTower: sellTowerAction,
      upgradeTower: upgradeTowerAction,
      selectTower,
      hoverTower,
      placeHero,
      moveHero: moveHeroAction,
      selectHero,
      useHeroAbility,
      addEnemy,
      removeEnemy,
      addProjectile,
      removeProjectile,
      addEffect,
      removeEffect,
      addParticle,
      addPawPoints,
      spendPawPoints,
      loseLife,
      startNextWave: startNextWaveAction,
      setTowers,
      setEnemies,
      setHeroes,
      setTroops,
      setProjectiles,
      setEffects,
      setParticles,
      setWaveState,
      setPawPoints,
      setLives,
    }),
    [
      startGame,
      pauseGame,
      resumeGame,
      setGameSpeed,
      buildTower,
      sellTowerAction,
      upgradeTowerAction,
      selectTower,
      hoverTower,
      placeHero,
      moveHeroAction,
      selectHero,
      useHeroAbility,
      addEnemy,
      removeEnemy,
      addProjectile,
      removeProjectile,
      addEffect,
      removeEffect,
      addParticle,
      addPawPoints,
      spendPawPoints,
      loseLife,
      startNextWaveAction,
      setTowers,
      setEnemies,
      setHeroes,
      setTroops,
      setProjectiles,
      setEffects,
      setParticles,
      setWaveState,
      setPawPoints,
      setLives,
    ]
  );

  return [state, actions];
}
