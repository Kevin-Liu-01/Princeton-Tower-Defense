import type { Particle, ParticleType, Position } from "../../types";

// ============================================================================
// PARTICLE OBJECT POOL
// Eliminates per-burst allocations that cause GC pauses / frame drops.
// Pre-allocates a fixed pool of Particle objects and recycles them.
// ============================================================================

const POOL_SIZE = 512;

interface PooledParticle extends Particle {
  _active: boolean;
  _poolIndex: number;
}

let pool: PooledParticle[] = [];
let activeCount = 0;
let idCounter = 0;

function createBlankParticle(index: number): PooledParticle {
  return {
    id: `pp${index}`,
    pos: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    life: 0,
    maxLife: 0,
    size: 0,
    color: "#ffffff",
    type: "spark",
    _active: false,
    _poolIndex: index,
  };
}

export function initParticlePool(): void {
  pool = [];
  activeCount = 0;
  idCounter = 0;
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push(createBlankParticle(i));
  }
}

export function acquireParticle(
  pos: Position,
  velocity: Position,
  life: number,
  maxLife: number,
  size: number,
  color: string,
  type: ParticleType,
): PooledParticle | null {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (!p._active) {
      p._active = true;
      p.id = `pp${idCounter++}`;
      p.pos.x = pos.x;
      p.pos.y = pos.y;
      p.velocity.x = velocity.x;
      p.velocity.y = velocity.y;
      p.life = life;
      p.maxLife = maxLife;
      p.size = size;
      p.color = color;
      p.type = type;
      activeCount++;
      return p;
    }
  }

  // Pool exhausted — grow by one (rare)
  const p = createBlankParticle(pool.length);
  p._active = true;
  p.id = `pp${idCounter++}`;
  p.pos.x = pos.x;
  p.pos.y = pos.y;
  p.velocity.x = velocity.x;
  p.velocity.y = velocity.y;
  p.life = life;
  p.maxLife = maxLife;
  p.size = size;
  p.color = color;
  p.type = type;
  pool.push(p);
  activeCount++;
  return p;
}

export function releaseParticle(p: PooledParticle): void {
  if (!p._active) return;
  p._active = false;
  activeCount--;
}

export function updateParticles(accumulatedDelta: number): void {
  const deltaScale = accumulatedDelta / 16;
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (!p._active) continue;

    p.life -= accumulatedDelta;
    if (p.life <= 0) {
      p._active = false;
      activeCount--;
      continue;
    }

    p.pos.x += p.velocity.x * deltaScale;
    p.pos.y += p.velocity.y * deltaScale;
    p.velocity.x *= 0.98;
    p.velocity.y = p.velocity.y * 0.98 + 0.02;
  }
}

export function getActiveParticles(): PooledParticle[] {
  const result: PooledParticle[] = [];
  for (let i = 0; i < pool.length; i++) {
    if (pool[i]._active) result.push(pool[i]);
  }
  return result;
}

export function getActiveParticleCount(): number {
  return activeCount;
}

export function clearParticlePool(): void {
  for (let i = 0; i < pool.length; i++) {
    pool[i]._active = false;
  }
  activeCount = 0;
}

export function enforceParticleCap(cap: number): void {
  if (activeCount <= cap) return;
  let toRemove = activeCount - cap;
  for (let i = 0; i < pool.length && toRemove > 0; i++) {
    if (pool[i]._active) {
      pool[i]._active = false;
      activeCount--;
      toRemove--;
    }
  }
}

export type { PooledParticle };
