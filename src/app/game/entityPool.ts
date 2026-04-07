/**
 * Generic object pool that eliminates GC pressure from rapid create/destroy
 * cycles (e.g., projectiles that spawn every tower attack and die within 1s).
 *
 * Usage:
 *   const pool = new EntityPool<Projectile>(256, createBlankProjectile);
 *   const p = pool.acquire();   // get a recycled or fresh object
 *   Object.assign(p, { ... }); // set actual values
 *   pool.release(p);           // return to pool when done
 */
export class EntityPool<T extends { id: string }> {
  private pool: T[] = [];
  private freeIndices: number[] = [];
  private activeSet = new Set<T>();
  private factory: (index: number) => T;

  constructor(initialSize: number, factory: (index: number) => T) {
    this.factory = factory;
    for (let i = 0; i < initialSize; i++) {
      const obj = factory(i);
      this.pool.push(obj);
      this.freeIndices.push(i);
    }
  }

  acquire(): T {
    if (this.freeIndices.length > 0) {
      const idx = this.freeIndices.pop()!;
      const obj = this.pool[idx];
      this.activeSet.add(obj);
      return obj;
    }
    const idx = this.pool.length;
    const obj = this.factory(idx);
    this.pool.push(obj);
    this.activeSet.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (!this.activeSet.delete(obj)) {
      return;
    }
    const idx = this.pool.indexOf(obj);
    if (idx !== -1) {
      this.freeIndices.push(idx);
    }
  }

  releaseById(id: string): void {
    for (const obj of this.activeSet) {
      if (obj.id === id) {
        this.release(obj);
        return;
      }
    }
  }

  get activeCount(): number {
    return this.activeSet.size;
  }

  clear(): void {
    this.activeSet.clear();
    this.freeIndices.length = 0;
    for (let i = 0; i < this.pool.length; i++) {
      this.freeIndices.push(i);
    }
  }
}

// ============================================================================
// PROJECTILE POOL
// ============================================================================

import type { Projectile } from "../types";

const PROJECTILE_POOL_SIZE = 256;
let idCounter = 0;

function createBlankProjectile(_index: number): Projectile {
  return {
    from: { x: 0, y: 0 },
    id: `pool_proj_${_index}`,
    progress: 0,
    rotation: 0,
    to: { x: 0, y: 0 },
    type: "arrow",
  };
}

let projectilePool: EntityPool<Projectile> | null = null;

export function getProjectilePool(): EntityPool<Projectile> {
  if (!projectilePool) {
    projectilePool = new EntityPool(
      PROJECTILE_POOL_SIZE,
      createBlankProjectile
    );
  }
  return projectilePool;
}

/**
 * Acquire a projectile from the pool and assign its properties.
 * Returns a fresh object (spread from pooled template) so it works
 * with React's immutable state pattern.
 */
export function acquireProjectile(
  props: Omit<Projectile, "id"> & { id?: string }
): Projectile {
  const pool = getProjectilePool();
  const template = pool.acquire();
  const proj: Projectile = {
    ...template,
    ...props,
    id: props.id || `proj_${idCounter++}`,
  };
  pool.release(template);
  return proj;
}

// ============================================================================
// ENEMY POOL
// ============================================================================

import type { Enemy, EnemyType } from "../types";

const ENEMY_POOL_SIZE = 128;
let enemyIdCounter = 0;

function createBlankEnemy(_index: number): Enemy {
  return {
    damageFlash: 0,
    frozen: false,
    hp: 1,
    id: `pool_enemy_${_index}`,
    inCombat: false,
    laneOffset: 0,
    lastHeroAttack: 0,
    lastRangedAttack: 0,
    lastTroopAttack: 0,
    maxHp: 1,
    pathIndex: 0,
    progress: 0,
    slowEffect: 0,
    spawnProgress: 1,
    speed: 1,
    stunUntil: 0,
    type: "frosh" as EnemyType,
  };
}

let enemyPool: EntityPool<Enemy> | null = null;

export function getEnemyPool(): EntityPool<Enemy> {
  if (!enemyPool) {
    enemyPool = new EntityPool(ENEMY_POOL_SIZE, createBlankEnemy);
  }
  return enemyPool;
}

/**
 * Acquire an enemy from the pool and assign its properties.
 * Returns a fresh object (spread from pooled template) compatible
 * with React's immutable state pattern.
 */
export function acquireEnemy(
  props: Omit<Enemy, "id"> & { id?: string }
): Enemy {
  const pool = getEnemyPool();
  const template = pool.acquire();
  const enemy: Enemy = {
    ...template,
    ...props,
    id: props.id || `enemy_${enemyIdCounter++}`,
  };
  pool.release(template);
  return enemy;
}

export function clearEntityPools(): void {
  projectilePool?.clear();
  enemyPool?.clear();
}
