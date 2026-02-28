// Princeton Tower Defense - Game Loop Hook
// Manages the main game update loop

import { useRef, useEffect, useCallback, useState } from "react";
import type {
  Tower,
  Enemy,
  Hero,
  Troop,
  Projectile,
  Effect,
  Particle,
  Position,
} from "../types";
import { HERO_DATA, MAP_PATHS, TOWER_DATA, TROOP_DATA } from "../constants";
import { distance, gridToWorld, gridToWorldPath } from "../utils";
import type { WaveState } from "./useGameState";

// ============================================================================
// GAME LOOP CONFIG
// ============================================================================

export interface GameLoopConfig {
  targetFPS: number;
  maxDeltaTime: number;
}

const DEFAULT_CONFIG: GameLoopConfig = {
  targetFPS: 60,
  maxDeltaTime: 100, // Cap delta time to prevent update spikes
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
  const targetFPS = config.targetFPS ?? DEFAULT_CONFIG.targetFPS;
  const maxDeltaTime = config.maxDeltaTime ?? DEFAULT_CONFIG.maxDeltaTime;

  const [metrics, setMetrics] = useState({ fps: 0, frameTime: 0 });

  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const callbacksRef = useRef(callbacks);
  const isRunningRef = useRef(isRunning);
  const gameSpeedRef = useRef(gameSpeed);
  const configRef = useRef({ targetFPS, maxDeltaTime });

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    gameSpeedRef.current = gameSpeed;
  }, [gameSpeed]);

  useEffect(() => {
    configRef.current = { targetFPS, maxDeltaTime };
  }, [targetFPS, maxDeltaTime]);

  const loop = useCallback((currentTime: number) => {
    if (!isRunningRef.current) {
      animationFrameRef.current = null;
      return;
    }

    const rawDeltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const clampedDeltaTime = Math.min(rawDeltaTime, configRef.current.maxDeltaTime);
    const scaledDeltaTime = clampedDeltaTime * gameSpeedRef.current;

    frameCountRef.current += 1;
    if (currentTime - fpsTimeRef.current >= 1000) {
      setMetrics({
        fps: frameCountRef.current,
        frameTime: rawDeltaTime,
      });
      frameCountRef.current = 0;
      fpsTimeRef.current = currentTime;
    }

    const fixedDeltaTime = 1000 / configRef.current.targetFPS;
    accumulatorRef.current += scaledDeltaTime;

    // Prevent spiral-of-death on slow frames by capping fixed updates per frame.
    let updatesRan = 0;
    while (accumulatorRef.current >= fixedDeltaTime && updatesRan < 8) {
      callbacksRef.current.onUpdate(fixedDeltaTime, currentTime);
      accumulatorRef.current -= fixedDeltaTime;
      updatesRan += 1;
    }

    const interpolation =
      fixedDeltaTime > 0 ? accumulatorRef.current / fixedDeltaTime : 0;
    callbacksRef.current.onRender(interpolation);

    animationFrameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const now = performance.now();
    lastTimeRef.current = now;
    fpsTimeRef.current = now;
    frameCountRef.current = 0;
    accumulatorRef.current = 0;

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, loop]);

  return metrics;
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

const getPathForEnemy = (enemy: Enemy, selectedMap: string) => {
  const pathKey = enemy.pathKey ?? selectedMap;
  return MAP_PATHS[pathKey] ?? MAP_PATHS[selectedMap] ?? MAP_PATHS.poe ?? [];
};

const getEnemyPosition = (enemy: Enemy, selectedMap: string): Position => {
  const path = getPathForEnemy(enemy, selectedMap);
  if (path.length === 0) {
    return { x: 0, y: 0 };
  }

  const currentIndex = Math.max(0, Math.min(enemy.pathIndex, path.length - 1));
  const nextIndex = Math.min(currentIndex + 1, path.length - 1);

  const currentNode = path[currentIndex];
  const nextNode = path[nextIndex];
  if (!currentNode || !nextNode) {
    return { x: 0, y: 0 };
  }

  const currentPos = gridToWorldPath(currentNode);
  const nextPos = gridToWorldPath(nextNode);

  return {
    x: currentPos.x + (nextPos.x - currentPos.x) * enemy.progress,
    y: currentPos.y + (nextPos.y - currentPos.y) * enemy.progress,
  };
};

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
  const newProjectiles: Projectile[] = [];
  const newEffects: Effect[] = [];
  const newParticles: Particle[] = [];

  // Enemy movement and lifecycle pass
  const movedEnemies: Enemy[] = [];
  for (const enemy of state.enemies) {
    if (enemy.dead || enemy.hp <= 0) continue;

    const path = getPathForEnemy(enemy, selectedMap);
    if (path.length < 2) continue;

    const slowedMultiplier = enemy.slowed
      ? Math.max(0.1, 1 - (enemy.slowIntensity ?? 0))
      : 1;
    let nextProgress =
      enemy.progress + (enemy.speed * slowedMultiplier * deltaTime) / 1000;
    let nextPathIndex = enemy.pathIndex;

    while (nextProgress >= 1) {
      nextProgress -= 1;
      nextPathIndex += 1;
      if (nextPathIndex >= path.length - 1) {
        callbacks.onEnemyReachedEnd(enemy);
        nextPathIndex = path.length - 1;
        nextProgress = 1;
        break;
      }
    }

    const movedEnemy: Enemy = {
      ...enemy,
      pathIndex: nextPathIndex,
      progress: nextProgress,
      spawnProgress: Math.min(1, enemy.spawnProgress + deltaTime / 500),
    };
    movedEnemies.push(movedEnemy);
  }

  // Shared per-frame enemy position cache for all target queries.
  const enemyPositionById = new Map<string, Position>();
  for (const enemy of movedEnemies) {
    enemyPositionById.set(enemy.id, getEnemyPosition(enemy, selectedMap));
  }

  const findLeadEnemyInRange = (
    origin: Position,
    range: number
  ): Enemy | null => {
    let target: Enemy | null = null;
    let bestProgress = -Infinity;

    for (const enemy of movedEnemies) {
      const enemyPos = enemyPositionById.get(enemy.id);
      if (!enemyPos) continue;
      if (distance(origin, enemyPos) > range) continue;

      const progress = enemy.pathIndex + enemy.progress;
      if (progress > bestProgress) {
        bestProgress = progress;
        target = enemy;
      }
    }

    return target;
  };

  const pendingEnemyDamage = new Map<string, number>();
  const addEnemyDamage = (enemyId: string, damage: number) => {
    pendingEnemyDamage.set(enemyId, (pendingEnemyDamage.get(enemyId) ?? 0) + damage);
  };

  // Tower updates
  const updatedTowers = state.towers.map((tower) => {
    const towerData = TOWER_DATA[tower.type];
    if (!towerData) return tower;

    const baseRange = towerData.range ?? 0;
    const baseDamage = towerData.damage ?? 0;
    const attackInterval = Math.max(100, towerData.attackSpeed ?? 1000);
    const effectiveRange = baseRange * (tower.rangeBoost ?? 1);
    const effectiveDamage = baseDamage * (tower.damageBoost ?? 1);

    const worldPos = gridToWorld(tower.pos);
    const target = findLeadEnemyInRange(worldPos, effectiveRange);
    let nextTower = tower;

    if (target && time - tower.lastAttack >= attackInterval) {
      addEnemyDamage(target.id, effectiveDamage);
      nextTower = { ...tower, lastAttack: time, targetId: target.id };

      const targetPos = enemyPositionById.get(target.id) ?? worldPos;
      newProjectiles.push({
        id: `proj-${Date.now()}-${tower.id}-${target.id}`,
        from: worldPos,
        to: targetPos,
        progress: 0,
        rotation: 0,
        type:
          tower.type === "cannon"
            ? "cannon"
            : tower.type === "arch"
              ? "sonicWave"
              : "magicBolt",
      });
    }

    // Club income generation
    if (tower.type === "club") {
      const incomeInterval =
        tower.level >= 4
          ? tower.upgrade === "A"
            ? 5000
            : 6000
          : tower.level === 3
            ? 6000
            : tower.level === 2
              ? 7000
              : 8000;
      const incomeAmount =
        tower.level >= 4
          ? tower.upgrade === "A"
            ? 40
            : 20
          : tower.level === 3
            ? 25
            : tower.level === 2
              ? 15
              : 8;

      if (time - (tower.lastSpawn ?? 0) >= incomeInterval) {
        callbacks.onIncomeGenerated(incomeAmount, tower.id);
        nextTower = { ...nextTower, lastSpawn: time };
      }
    }

    return nextTower;
  });

  // Hero updates
  const updatedHeroes = state.heroes.map((hero) => {
    if (hero.dead) {
      const remainingRespawn = Math.max(0, hero.respawnTimer - deltaTime);
      if (remainingRespawn <= 0) {
        return {
          ...hero,
          dead: false,
          hp: hero.maxHp,
          respawnTimer: 0,
          abilityReady: true,
        };
      }
      return { ...hero, respawnTimer: remainingRespawn };
    }

    const heroData = HERO_DATA[hero.type];
    let nextHero = hero;

    if (hero.moving && hero.targetPos) {
      const dx = hero.targetPos.x - hero.pos.x;
      const dy = hero.targetPos.y - hero.pos.y;
      const dist = Math.hypot(dx, dy);
      const moveDist = (heroData.speed * deltaTime) / 16.67;

      if (dist <= moveDist || dist === 0) {
        nextHero = {
          ...nextHero,
          pos: hero.targetPos,
          moving: false,
          targetPos: undefined,
        };
      } else {
        nextHero = {
          ...nextHero,
          pos: {
            x: hero.pos.x + (dx / dist) * moveDist,
            y: hero.pos.y + (dy / dist) * moveDist,
          },
          rotation: Math.atan2(dy, dx),
        };
      }
    }

    if (nextHero.abilityCooldown > 0) {
      const cooldown = Math.max(0, nextHero.abilityCooldown - deltaTime);
      nextHero = {
        ...nextHero,
        abilityCooldown: cooldown,
        abilityReady: cooldown === 0,
      };
    }

    if (time - nextHero.lastAttack >= heroData.attackSpeed) {
      const target = findLeadEnemyInRange(nextHero.pos, heroData.range);
      if (target) {
        addEnemyDamage(target.id, heroData.damage);
        nextHero = {
          ...nextHero,
          lastAttack: time,
          attackAnim: 250,
        };
      }
    }

    if (nextHero.attackAnim > 0) {
      nextHero = {
        ...nextHero,
        attackAnim: Math.max(0, nextHero.attackAnim - deltaTime),
      };
    }

    return nextHero;
  });

  // Troop updates
  const updatedTroops = state.troops
    .filter((troop) => !troop.dead)
    .map((troop) => {
      const troopType = troop.type ?? "footsoldier";
      const troopData = TROOP_DATA[troopType];
      if (!troopData) return troop;

      const attackRange = troopData.isRanged ? troopData.range ?? 140 : 70;
      const attackSpeed = troopData.attackSpeed ?? 1000;
      const attackDamage = troopData.damage ?? 25;
      let nextTroop = troop;

      if (troop.moving && troop.targetPos) {
        const dx = troop.targetPos.x - troop.pos.x;
        const dy = troop.targetPos.y - troop.pos.y;
        const dist = Math.hypot(dx, dy);
        const moveDist = (2.4 * deltaTime) / 16.67;

        if (dist <= moveDist || dist === 0) {
          nextTroop = {
            ...nextTroop,
            pos: troop.targetPos,
            moving: false,
            targetPos: undefined,
          };
        } else {
          nextTroop = {
            ...nextTroop,
            pos: {
              x: troop.pos.x + (dx / dist) * moveDist,
              y: troop.pos.y + (dy / dist) * moveDist,
            },
            rotation: Math.atan2(dy, dx),
          };
        }
      }

      const lastAttack = nextTroop.lastAttack ?? 0;
      if (time - lastAttack >= attackSpeed) {
        const target = findLeadEnemyInRange(nextTroop.pos, attackRange);
        if (target) {
          addEnemyDamage(target.id, attackDamage);
          nextTroop = {
            ...nextTroop,
            lastAttack: time,
            attackAnim: troopData.isRanged ? 350 : 250,
            targetEnemy: target.id,
          };
        }
      }

      if ((nextTroop.attackAnim ?? 0) > 0) {
        nextTroop = {
          ...nextTroop,
          attackAnim: Math.max(0, (nextTroop.attackAnim ?? 0) - deltaTime),
        };
      }

      return nextTroop;
    });

  // Apply all combat damage in one pass
  const updatedEnemies = movedEnemies
    .map((enemy) => {
      const damage = pendingEnemyDamage.get(enemy.id) ?? 0;
      if (damage <= 0) return enemy;

      const nextHp = enemy.hp - damage;
      if (nextHp <= 0) {
        callbacks.onEnemyKilled(enemy);
        return null;
      }

      return {
        ...enemy,
        hp: nextHp,
        damageFlash: 180,
      };
    })
    .filter((enemy): enemy is Enemy => enemy !== null);

  // Projectile updates
  const updatedProjectiles = state.projectiles
    .map((projectile) => {
      const nextProgress = projectile.progress + deltaTime / 300;
      if (nextProgress >= 1) {
        callbacks.onProjectileHit(projectile);
        return null;
      }
      return { ...projectile, progress: nextProgress };
    })
    .filter((projectile): projectile is Projectile => projectile !== null);

  // Effect updates
  const updatedEffects = state.effects
    .map((effect) => {
      const duration = effect.duration ?? 500;
      const nextProgress = effect.progress + deltaTime / duration;
      if (nextProgress >= 1) {
        callbacks.onEffectComplete(effect);
        return null;
      }
      return { ...effect, progress: nextProgress };
    })
    .filter((effect): effect is Effect => effect !== null);

  // Particle updates
  const updatedParticles = state.particles
    .map((particle) => {
      const nextLife = particle.life - deltaTime;
      if (nextLife <= 0) return null;

      return {
        ...particle,
        life: nextLife,
        pos: {
          x: particle.pos.x + particle.velocity.x * (deltaTime / 1000),
          y: particle.pos.y + particle.velocity.y * (deltaTime / 1000),
        },
      };
    })
    .filter((particle): particle is Particle => particle !== null);

  // Spawn queue processing placeholder (kept for API compatibility).
  const spawnedEnemies: Enemy[] = [];
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
