// Princeton Tower Defense - Game Loop Hook
// Manages the main game update loop

import { useRef, useEffect, useCallback } from "react";
import type {
  Tower,
  Enemy,
  Hero,
  Troop,
  Projectile,
  Effect,
  Particle,
} from "../types";
import type { WaveState } from "../game";

// ============================================================================
// GAME LOOP CONFIG
// ============================================================================

export interface GameLoopConfig {
  targetFPS: number;
  maxDeltaTime: number;
}

const DEFAULT_CONFIG: GameLoopConfig = {
  targetFPS: 60,
  maxDeltaTime: 100, // Cap delta time to prevent physics explosions
};

// ============================================================================
// GAME LOOP CALLBACK TYPES
// ============================================================================

export interface GameLoopCallbacks {
  onUpdate: (deltaTime: number, time: number) => void;
  onRender: (interpolation: number) => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useGameLoop(
  isRunning: boolean,
  gameSpeed: number,
  callbacks: GameLoopCallbacks,
  config: Partial<GameLoopConfig> = {}
): {
  fps: number;
  frameTime: number;
} {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const frameTimeRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const fixedDeltaTime = 1000 / fullConfig.targetFPS;

  const loop = useCallback(
    (currentTime: number) => {
      if (!isRunning) {
        animationFrameRef.current = requestAnimationFrame(loop);
        lastTimeRef.current = currentTime;
        return;
      }

      // Calculate delta time
      const rawDeltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Cap delta time
      const deltaTime = Math.min(rawDeltaTime, fullConfig.maxDeltaTime) * gameSpeed;
      frameTimeRef.current = rawDeltaTime;

      // FPS calculation
      frameCountRef.current++;
      if (currentTime - fpsTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        fpsTimeRef.current = currentTime;
      }

      // Fixed timestep accumulator
      accumulatorRef.current += deltaTime;

      // Run fixed updates
      while (accumulatorRef.current >= fixedDeltaTime) {
        callbacks.onUpdate(fixedDeltaTime, currentTime);
        accumulatorRef.current -= fixedDeltaTime;
      }

      // Render with interpolation
      const interpolation = accumulatorRef.current / fixedDeltaTime;
      callbacks.onRender(interpolation);

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(loop);
    },
    [isRunning, gameSpeed, callbacks, fixedDeltaTime, fullConfig.maxDeltaTime]
  );

  useEffect(() => {
    lastTimeRef.current = performance.now();
    fpsTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loop]);

  return {
    fps: fpsRef.current,
    frameTime: frameTimeRef.current,
  };
}

// ============================================================================
// GAME UPDATE HELPER
// ============================================================================

export interface GameUpdateContext {
  deltaTime: number;
  time: number;
  selectedMap: string;
  gameSpeed: number;
}

/**
 * Process a single game update tick
 */
export function processGameUpdate(
  context: GameUpdateContext,
  state: {
    towers: Tower[];
    enemies: Enemy[];
    heroes: Hero[];
    troops: Troop[];
    projectiles: Projectile[];
    effects: Effect[];
    particles: Particle[];
    waveState: WaveState;
  },
  callbacks: {
    onEnemyKilled: (enemy: Enemy) => void;
    onEnemyReachedEnd: (enemy: Enemy) => void;
    onProjectileHit: (projectile: Projectile) => void;
    onEffectComplete: (effect: Effect) => void;
    onSpawnEnemy: (enemy: Enemy) => void;
    onIncomeGenerated: (amount: number, towerId: string) => void;
  }
): {
  updatedTowers: Tower[];
  updatedEnemies: Enemy[];
  updatedHeroes: Hero[];
  updatedTroops: Troop[];
  updatedProjectiles: Projectile[];
  updatedEffects: Effect[];
  updatedParticles: Particle[];
  newProjectiles: Projectile[];
  newEffects: Effect[];
  newParticles: Particle[];
} {
  const { deltaTime, time, selectedMap } = context;
  const {
    moveEnemy,
    updateEnemySpawn,
    updateEnemyStatus,
    moveHero,
    updateHeroReturn,
    updateHeroAttackAnim,
    moveTroop,
    updateTroopReturn,
    updateTroopAttackAnim,
    moveProjectile,
    findTowerTarget,
    executeTowerAttack,
    findHeroTarget,
    executeHeroAttack,
    findTroopTarget,
    executeTroopAttack,
    processSpawnQueue,
    updateTowerBuffs,
    shouldClubGenerateIncome,
    getClubIncomeAmount,
    updateHeroAbilityCooldown,
    updateHeroShield,
    updateHeroRespawn,
    canHeroAttack,
    canStationSpawn,
  } = require("../game");

  const newProjectiles: Projectile[] = [];
  const newEffects: Effect[] = [];
  const newParticles: Particle[] = [];

  // Update enemies
  const updatedEnemies = state.enemies
    .filter((e) => !e.dead && e.hp > 0)
    .map((enemy) => {
      updateEnemySpawn(enemy, deltaTime);
      updateEnemyStatus(enemy, deltaTime);

      const reachedEnd = moveEnemy(enemy, deltaTime, selectedMap);
      if (reachedEnd) {
        callbacks.onEnemyReachedEnd(enemy);
        return { ...enemy, dead: true };
      }

      if (enemy.hp <= 0) {
        callbacks.onEnemyKilled(enemy);
        return { ...enemy, dead: true };
      }

      return enemy;
    })
    .filter((e) => !e.dead);

  // Update towers
  const updatedTowers = state.towers.map((tower) => {
    // Process tower attacks
    const target = findTowerTarget(tower, updatedEnemies, selectedMap);
    if (target && time - tower.lastAttack >= 1000) {
      // Simplified attack speed check
      const result = executeTowerAttack(tower, target, updatedEnemies, selectedMap, time);
      newProjectiles.push(...result.projectiles);
      newEffects.push(...result.effects);
    }

    // Club income
    if (shouldClubGenerateIncome(tower, time)) {
      const income = getClubIncomeAmount(tower);
      callbacks.onIncomeGenerated(income, tower.id);
      return { ...tower, lastSpawn: time };
    }

    return tower;
  });

  // Update tower buffs
  updateTowerBuffs(updatedTowers);

  // Update heroes
  const updatedHeroes = state.heroes.map((hero) => {
    if (hero.dead) {
      const respawned = updateHeroRespawn(hero, deltaTime);
      return { ...hero };
    }

    moveHero(hero, deltaTime);
    updateHeroReturn(hero);
    updateHeroAttackAnim(hero, deltaTime);
    updateHeroAbilityCooldown(hero, deltaTime);
    updateHeroShield(hero);

    // Hero attacks
    if (canHeroAttack(hero, time)) {
      const target = findHeroTarget(hero, updatedEnemies, selectedMap);
      if (target) {
        executeHeroAttack(hero, target, time);
      }
    }

    return hero;
  });

  // Update troops
  const updatedTroops = state.troops
    .filter((t) => !t.dead)
    .map((troop) => {
      moveTroop(troop, deltaTime);
      updateTroopReturn(troop);
      updateTroopAttackAnim(troop, deltaTime);

      // Troop attacks
      const target = findTroopTarget(troop, updatedEnemies, selectedMap);
      if (target && (!troop.lastAttack || time - troop.lastAttack >= 1000)) {
        executeTroopAttack(troop, target, time);
      }

      return troop;
    });

  // Update projectiles
  const updatedProjectiles = state.projectiles
    .map((proj) => {
      const hit = moveProjectile(proj, deltaTime);
      if (hit) {
        callbacks.onProjectileHit(proj);
        return null;
      }
      return proj;
    })
    .filter((p): p is Projectile => p !== null);

  // Update effects
  const updatedEffects = state.effects
    .map((effect) => {
      const newProgress = effect.progress + deltaTime / (effect.duration || 500);
      if (newProgress >= 1) {
        callbacks.onEffectComplete(effect);
        return null;
      }
      return { ...effect, progress: newProgress };
    })
    .filter((e): e is Effect => e !== null);

  // Update particles
  const updatedParticles = state.particles
    .map((particle) => {
      const newLife = particle.life - deltaTime;
      if (newLife <= 0) return null;

      return {
        ...particle,
        life: newLife,
        pos: {
          x: particle.pos.x + particle.velocity.x * (deltaTime / 1000),
          y: particle.pos.y + particle.velocity.y * (deltaTime / 1000),
        },
      };
    })
    .filter((p): p is Particle => p !== null);

  // Spawn enemies from wave
  const generateId = () => `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const spawnedEnemies = processSpawnQueue(state.waveState, selectedMap, deltaTime, generateId);
  for (const enemy of spawnedEnemies) {
    callbacks.onSpawnEnemy(enemy);
  }

  return {
    updatedTowers,
    updatedEnemies: [...updatedEnemies, ...spawnedEnemies],
    updatedHeroes,
    updatedTroops,
    updatedProjectiles: [...updatedProjectiles, ...newProjectiles],
    updatedEffects: [...updatedEffects, ...newEffects],
    updatedParticles: [...updatedParticles, ...newParticles],
    newProjectiles,
    newEffects,
    newParticles,
  };
}
