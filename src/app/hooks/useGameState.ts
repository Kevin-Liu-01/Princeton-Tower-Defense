// Princeton Tower Defense - Game State Hook
// Manages core game state with React hooks

import { useState, useCallback, useRef } from "react";
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
import {
  initializeWaveState,
  createTower,
  createHero,
  getTowerBuildCost,
  canBuildTower,
  type WaveState,
} from "../game";

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
  const [selectedMap, setSelectedMap] = useState<string>("nassau");
  const [pawPoints, setPawPoints] = useState<number>(0);
  const [lives, setLives] = useState<number>(20);
  const [score, setScore] = useState<number>(0);

  // Wave state
  const [waveState, setWaveState] = useState<WaveState>(() =>
    initializeWaveState("nassau")
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
  const generateId = useCallback(() => {
    idCounter.current++;
    return `entity-${Date.now()}-${idCounter.current}`;
  }, []);

  // ============================================================================
  // GAME FLOW ACTIONS
  // ============================================================================

  const startGame = useCallback(
    (mapId: string, startingGold: number) => {
      setSelectedMap(mapId);
      setPawPoints(startingGold);
      setLives(20);
      setScore(0);
      setTowers([]);
      setEnemies([]);
      setTroops([]);
      setProjectiles([]);
      setEffects([]);
      setParticles([]);
      setWaveState(initializeWaveState(mapId));
      setSelectedTower(null);
      setSelectedHero(null);
      setGameState("setup");
    },
    []
  );

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

      if (!canBuildTower(pos, selectedMap, towers, gridWidth, gridHeight)) {
        return false;
      }

      const newTower = createTower(type, pos, generateId());
      setTowers((prev) => [...prev, newTower]);
      setPawPoints((prev) => prev - cost);

      return true;
    },
    [pawPoints, selectedMap, towers, gridWidth, gridHeight, generateId]
  );

  const sellTowerAction = useCallback(
    (towerId: string): number => {
      const tower = towers.find((t) => t.id === towerId);
      if (!tower) return 0;

      // Calculate sell value (60% of investment)
      const { getTowerSellValue } = require("../game/towers");
      const sellValue = getTowerSellValue(tower);

      setTowers((prev) => prev.filter((t) => t.id !== towerId));
      setPawPoints((prev) => prev + sellValue);

      if (selectedTower === towerId) {
        setSelectedTower(null);
      }

      // Remove associated troops for stations
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

      const { getTowerUpgradeCost, upgradeTower: doUpgrade } = require("../game/towers");
      const cost = getTowerUpgradeCost(tower);

      if (pawPoints < cost) return false;

      setTowers((prev) =>
        prev.map((t) => {
          if (t.id === towerId) {
            doUpgrade(t);
            return { ...t };
          }
          return t;
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
      // Check if hero already exists
      const existingHero = heroes.find((h) => h.type === type);
      if (existingHero) return null;

      const newHero = createHero(type, pos, generateId());
      setHeroes((prev) => [...prev, newHero]);

      return newHero.id;
    },
    [heroes, generateId]
  );

  const moveHeroAction = useCallback(
    (heroId: string, pos: Position) => {
      setHeroes((prev) =>
        prev.map((h) => {
          if (h.id === heroId && !h.dead) {
            return { ...h, targetPos: pos, moving: true };
          }
          return h;
        })
      );
    },
    []
  );

  const selectHero = useCallback((heroId: string | null) => {
    setSelectedHero(heroId);
    setSelectedTower(null);
    setHeroes((prev) =>
      prev.map((h) => ({ ...h, selected: h.id === heroId }))
    );
  }, []);

  const useHeroAbility = useCallback(
    (heroId: string) => {
      const hero = heroes.find((h) => h.id === heroId);
      if (!hero || !hero.abilityReady || hero.dead) return;

      const { executeHeroAbility } = require("../game/heroes");
      const result = executeHeroAbility(hero, enemies, towers, selectedMap);

      // Update hero state
      setHeroes((prev) =>
        prev.map((h) => (h.id === heroId ? { ...hero } : h))
      );

      // Add effects
      if (result.effects.length > 0) {
        setEffects((prev) => [...prev, ...result.effects]);
      }
    },
    [heroes, enemies, towers, selectedMap]
  );

  // ============================================================================
  // ENTITY MANAGEMENT
  // ============================================================================

  const addEnemy = useCallback((enemy: Enemy) => {
    setEnemies((prev) => [...prev, enemy]);
  }, []);

  const removeEnemy = useCallback((enemyId: string) => {
    setEnemies((prev) => prev.filter((e) => e.id !== enemyId));
  }, []);

  const addProjectile = useCallback((projectile: Projectile) => {
    setProjectiles((prev) => [...prev, projectile]);
  }, []);

  const removeProjectile = useCallback((projectileId: string) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
  }, []);

  const addEffect = useCallback((effect: Effect) => {
    setEffects((prev) => [...prev, effect]);
  }, []);

  const removeEffect = useCallback((effectId: string) => {
    setEffects((prev) => prev.filter((e) => e.id !== effectId));
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
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameState("defeat");
      }
      return Math.max(0, newLives);
    });
  }, []);

  // ============================================================================
  // WAVE MANAGEMENT
  // ============================================================================

  const startNextWaveAction = useCallback((): boolean => {
    const { startNextWave: doStartWave } = require("../game/waves");

    const success = doStartWave(waveState, selectedMap);
    if (success) {
      setWaveState({ ...waveState });
      setGameState("playing");
    }
    return success;
  }, [waveState, selectedMap]);

  // ============================================================================
  // RETURN STATE AND ACTIONS
  // ============================================================================

  const state: GameStateData = {
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
  };

  const actions: GameStateActions = {
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
  };

  return [state, actions];
}
