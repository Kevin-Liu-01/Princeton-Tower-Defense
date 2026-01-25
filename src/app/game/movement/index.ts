// Princeton Tower Defense - Movement System
// Handles entity movement along paths and positioning

import type { Enemy, Hero, Troop, Position } from "../../types";
import { ENEMY_DATA, MAP_PATHS, HERO_DATA, TROOP_DATA } from "../../constants";
import { distance, getEnemyPosition, lerp } from "../../utils";

// ============================================================================
// ENEMY MOVEMENT
// ============================================================================

/**
 * Move an enemy along its path
 * Returns true if enemy reached the end of path
 */
export function moveEnemy(
  enemy: Enemy,
  deltaTime: number,
  selectedMap: string
): boolean {
  // Don't move if stunned/frozen
  if (enemy.frozen || enemy.stunUntil > Date.now()) {
    return false;
  }

  // Don't move if in combat
  if (enemy.inCombat) {
    return false;
  }

  const enemyData = ENEMY_DATA[enemy.type];
  const pathKey = enemy.pathKey || selectedMap;
  const path = MAP_PATHS[pathKey];

  if (!path || path.length < 2) return false;

  // Calculate effective speed with slow effect
  const slowMultiplier = 1 - (enemy.slowEffect || 0);
  const effectiveSpeed = enemyData.speed * slowMultiplier;

  // Calculate movement amount
  const moveAmount = (effectiveSpeed * deltaTime) / 1000;

  // Move along path segments
  while (enemy.progress < path.length - 1) {
    const currentSegment = Math.floor(enemy.progress);
    const segmentProgress = enemy.progress - currentSegment;

    const p1 = path[currentSegment];
    const p2 = path[currentSegment + 1];
    const segmentLength = distance(p1, p2);

    const remainingInSegment = (1 - segmentProgress) * segmentLength;

    if (moveAmount <= remainingInSegment) {
      enemy.progress += moveAmount / segmentLength;
      break;
    } else {
      enemy.progress = currentSegment + 1;
    }
  }

  // Check if reached end of path
  return enemy.progress >= path.length - 1;
}

/**
 * Update enemy spawn animation progress
 */
export function updateEnemySpawn(enemy: Enemy, deltaTime: number): void {
  if (enemy.spawnProgress < 1) {
    enemy.spawnProgress = Math.min(1, enemy.spawnProgress + deltaTime / 500);
  }
}

/**
 * Update enemy status effects
 */
export function updateEnemyStatus(enemy: Enemy, deltaTime: number): void {
  const now = Date.now();

  // Update slow decay
  if (enemy.slowEffect > 0) {
    enemy.slowEffect = Math.max(0, enemy.slowEffect - deltaTime / 2000);
    if (enemy.slowEffect <= 0) {
      enemy.slowed = false;
      enemy.slowIntensity = 0;
    }
  }

  // Update stun/freeze
  if (enemy.stunUntil && now >= enemy.stunUntil) {
    enemy.frozen = false;
    enemy.stunUntil = 0;
  }

  // Update burn damage
  if (enemy.burning && enemy.burnUntil) {
    if (now >= enemy.burnUntil) {
      enemy.burning = false;
      enemy.burnUntil = undefined;
      enemy.burnDamage = undefined;
    }
  }

  // Update damage flash
  if (enemy.damageFlash > 0) {
    enemy.damageFlash = Math.max(0, enemy.damageFlash - deltaTime / 200);
  }
}

// ============================================================================
// HERO MOVEMENT
// ============================================================================

/**
 * Move a hero towards its target position
 */
export function moveHero(
  hero: Hero,
  deltaTime: number
): void {
  if (hero.dead || !hero.moving || !hero.targetPos) {
    hero.moving = false;
    return;
  }

  const heroData = HERO_DATA[hero.type];
  const speed = heroData.speed;
  const moveAmount = (speed * deltaTime) / 1000;

  const dist = distance(hero.pos, hero.targetPos);

  if (dist <= moveAmount) {
    // Arrived at destination
    hero.pos = { ...hero.targetPos };
    hero.moving = false;
    hero.targetPos = undefined;
  } else {
    // Move towards target
    const dx = hero.targetPos.x - hero.pos.x;
    const dy = hero.targetPos.y - hero.pos.y;
    const ratio = moveAmount / dist;

    hero.pos.x += dx * ratio;
    hero.pos.y += dy * ratio;

    // Update rotation to face movement direction
    hero.rotation = Math.atan2(dy, dx);
  }
}

/**
 * Update hero returning to home position
 */
export function updateHeroReturn(
  hero: Hero,
  maxIdleDistance: number = 200
): void {
  if (hero.dead || hero.moving) return;

  if (hero.homePos && !hero.returning) {
    const dist = distance(hero.pos, hero.homePos);
    if (dist > maxIdleDistance) {
      hero.returning = true;
      hero.targetPos = { ...hero.homePos };
      hero.moving = true;
    }
  }

  if (hero.returning && hero.homePos) {
    const dist = distance(hero.pos, hero.homePos);
    if (dist < 10) {
      hero.returning = false;
    }
  }
}

/**
 * Update hero attack animation
 */
export function updateHeroAttackAnim(hero: Hero, deltaTime: number): void {
  if (hero.attackAnim > 0) {
    hero.attackAnim = Math.max(0, hero.attackAnim - deltaTime);
  }
}

// ============================================================================
// TROOP MOVEMENT
// ============================================================================

/**
 * Move a troop towards its target position
 */
export function moveTroop(
  troop: Troop,
  deltaTime: number
): void {
  if (troop.dead || !troop.moving || !troop.targetPos) {
    troop.moving = false;
    return;
  }

  const troopData = TROOP_DATA[troop.type || "footsoldier"];
  const speed = troopData.isMounted ? 100 : 60; // Base troop speed
  const moveAmount = (speed * deltaTime) / 1000;

  const dist = distance(troop.pos, troop.targetPos);

  if (dist <= moveAmount) {
    // Arrived at destination
    troop.pos = { ...troop.targetPos };
    troop.moving = false;
    troop.targetPos = undefined;
  } else {
    // Move towards target
    const dx = troop.targetPos.x - troop.pos.x;
    const dy = troop.targetPos.y - troop.pos.y;
    const ratio = moveAmount / dist;

    troop.pos.x += dx * ratio;
    troop.pos.y += dy * ratio;

    // Update rotation to face movement direction
    if (troop.rotation !== undefined) {
      troop.rotation = Math.atan2(dy, dx);
    }
  }
}

/**
 * Move troop to engage an enemy
 */
export function moveTroopToEnemy(
  troop: Troop,
  enemyPos: Position,
  engageRange: number = 30
): void {
  const dist = distance(troop.pos, enemyPos);

  if (dist > engageRange) {
    // Move towards enemy
    troop.targetPos = {
      x: enemyPos.x + (troop.pos.x - enemyPos.x) * (engageRange / dist),
      y: enemyPos.y + (troop.pos.y - enemyPos.y) * (engageRange / dist),
    };
    troop.moving = true;
  } else {
    troop.moving = false;
  }
}

/**
 * Update troop returning to spawn point
 */
export function updateTroopReturn(
  troop: Troop,
  maxIdleDistance: number = 100
): void {
  if (troop.dead || troop.moving || troop.engaging) return;

  const returnPoint = troop.rallyPoint || troop.spawnPoint;
  if (!returnPoint) return;

  const dist = distance(troop.pos, returnPoint);
  if (dist > maxIdleDistance) {
    troop.targetPos = { ...returnPoint };
    troop.moving = true;
  }
}

/**
 * Update troop attack animation
 */
export function updateTroopAttackAnim(troop: Troop, deltaTime: number): void {
  if (troop.attackAnim && troop.attackAnim > 0) {
    troop.attackAnim = Math.max(0, troop.attackAnim - deltaTime);
  }
}

// ============================================================================
// PROJECTILE MOVEMENT
// ============================================================================

import type { Projectile } from "../../types";

/**
 * Update projectile position
 * Returns true if projectile has reached its target
 */
export function moveProjectile(
  projectile: Projectile,
  deltaTime: number,
  speed: number = 400
): boolean {
  const dist = distance(projectile.from, projectile.to);
  const moveAmount = (speed * deltaTime) / 1000;
  const progressIncrement = moveAmount / dist;

  projectile.progress = Math.min(1, projectile.progress + progressIncrement);

  // Update rotation based on movement
  projectile.rotation = Math.atan2(
    projectile.to.y - projectile.from.y,
    projectile.to.x - projectile.from.x
  );

  return projectile.progress >= 1;
}

/**
 * Get current projectile position
 */
export function getProjectilePosition(projectile: Projectile): Position {
  const t = projectile.progress;

  let x = projectile.from.x + (projectile.to.x - projectile.from.x) * t;
  let y = projectile.from.y + (projectile.to.y - projectile.from.y) * t;

  // Apply arc if present
  if (projectile.arcHeight) {
    y -= Math.sin(t * Math.PI) * projectile.arcHeight;
  }

  // Apply elevation fade
  if (projectile.elevation) {
    y -= projectile.elevation * (1 - t);
  }

  return { x, y };
}
