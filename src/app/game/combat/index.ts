// Princeton Tower Defense - Combat System
// Handles damage calculations, tower attacks, and combat logic

import type { Tower, Enemy, Hero, Troop, Projectile, Effect, Position } from "../../types";
import { TOWER_DATA, ENEMY_DATA, TROOP_DATA, HERO_DATA } from "../../constants";
import { calculateTowerStats } from "../../constants/towerStats";
import { gridToWorld, distance, getEnemyPosition } from "../../utils";

// ============================================================================
// DAMAGE CALCULATION
// ============================================================================

/**
 * Calculate effective damage for a tower considering all buffs
 */
export function calculateTowerDamage(tower: Tower): number {
  const stats = calculateTowerStats(
    tower.type,
    tower.level,
    tower.upgrade,
    tower.rangeBoost || 1,
    tower.damageBoost || 1
  );
  return stats.damage;
}

/**
 * Calculate effective range for a tower considering all buffs
 */
export function calculateTowerRange(tower: Tower): number {
  const stats = calculateTowerStats(
    tower.type,
    tower.level,
    tower.upgrade,
    tower.rangeBoost || 1,
    tower.damageBoost || 1
  );
  return stats.range;
}

/**
 * Calculate effective attack speed for a tower
 */
export function calculateTowerAttackSpeed(tower: Tower): number {
  const stats = calculateTowerStats(
    tower.type,
    tower.level,
    tower.upgrade,
    tower.rangeBoost || 1,
    tower.damageBoost || 1
  );
  return stats.attackSpeed;
}

/**
 * Apply damage to an enemy considering armor
 */
export function applyDamageToEnemy(
  enemy: Enemy,
  damage: number,
  armorPiercing: boolean = false
): number {
  const enemyData = ENEMY_DATA[enemy.type];
  const armor = armorPiercing ? 0 : (enemyData?.armor || 0);
  const effectiveDamage = Math.max(1, damage * (1 - armor * 0.01));
  
  enemy.hp -= effectiveDamage;
  enemy.damageFlash = 1;
  
  return effectiveDamage;
}

/**
 * Apply status effects to an enemy
 */
export function applyStatusEffect(
  enemy: Enemy,
  effect: "slow" | "stun" | "burn" | "freeze",
  params: {
    duration?: number;
    intensity?: number;
    damage?: number;
  }
): void {
  const now = Date.now();

  switch (effect) {
    case "slow":
      enemy.slowed = true;
      enemy.slowIntensity = Math.max(enemy.slowIntensity || 0, params.intensity || 0.3);
      enemy.slowEffect = params.intensity || 0.3;
      break;

    case "stun":
      enemy.stunUntil = now + (params.duration || 1000);
      enemy.frozen = true;
      break;

    case "burn":
      enemy.burning = true;
      enemy.burnDamage = params.damage || 10;
      enemy.burnUntil = now + (params.duration || 3000);
      break;

    case "freeze":
      enemy.frozen = true;
      enemy.stunUntil = now + (params.duration || 2000);
      break;
  }
}

// ============================================================================
// TARGET ACQUISITION
// ============================================================================

/**
 * Find the best target for a tower
 */
export function findTowerTarget(
  tower: Tower,
  enemies: Enemy[],
  selectedMap: string
): Enemy | null {
  const towerWorldPos = gridToWorld(tower.pos);
  const range = calculateTowerRange(tower);
  const towerData = TOWER_DATA[tower.type];

  // Filter enemies in range and valid
  const validTargets = enemies.filter((enemy) => {
    if (enemy.dead || enemy.hp <= 0) return false;
    
    const enemyPos = getEnemyPosition(enemy, enemy.pathKey || selectedMap);
    const dist = distance(towerWorldPos, enemyPos);
    
    if (dist > range) return false;

    // Check flying restriction for non-arch towers
    const enemyData = ENEMY_DATA[enemy.type];
    if (enemyData?.flying && tower.type !== "arch") return false;

    return true;
  });

  if (validTargets.length === 0) return null;

  // Prioritization logic
  // 1. Prefer current target if still valid
  if (tower.targetId) {
    const currentTarget = validTargets.find((e) => e.id === tower.targetId);
    if (currentTarget) return currentTarget;
  }

  // 2. Target enemy closest to exit (highest progress)
  validTargets.sort((a, b) => b.progress - a.progress);
  
  return validTargets[0];
}

/**
 * Find enemies within range of a position
 */
export function findEnemiesInRange(
  pos: Position,
  range: number,
  enemies: Enemy[],
  selectedMap: string,
  excludeFlying: boolean = false
): Enemy[] {
  return enemies.filter((enemy) => {
    if (enemy.dead || enemy.hp <= 0) return false;
    
    const enemyPos = getEnemyPosition(enemy, enemy.pathKey || selectedMap);
    const dist = distance(pos, enemyPos);
    
    if (dist > range) return false;

    if (excludeFlying) {
      const enemyData = ENEMY_DATA[enemy.type];
      if (enemyData?.flying) return false;
    }

    return true;
  });
}

// ============================================================================
// TOWER ATTACK EXECUTION
// ============================================================================

export interface AttackResult {
  projectiles: Projectile[];
  effects: Effect[];
  damage: number;
  targetIds: string[];
}

/**
 * Execute a tower attack
 */
export function executeTowerAttack(
  tower: Tower,
  target: Enemy,
  enemies: Enemy[],
  selectedMap: string,
  now: number = Date.now()
): AttackResult {
  const projectiles: Projectile[] = [];
  const effects: Effect[] = [];
  const targetIds: string[] = [];

  const towerWorldPos = gridToWorld(tower.pos);
  const targetPos = getEnemyPosition(target, target.pathKey || selectedMap);
  const damage = calculateTowerDamage(tower);
  const stats = calculateTowerStats(tower.type, tower.level, tower.upgrade);

  // Create projectile
  const projectile: Projectile = {
    id: `proj-${tower.id}-${now}`,
    from: { ...towerWorldPos },
    to: { ...targetPos },
    progress: 0,
    type: tower.type,
    rotation: Math.atan2(targetPos.y - towerWorldPos.y, targetPos.x - towerWorldPos.x),
    damage,
    targetId: target.id,
  };

  // Tower-specific modifications
  switch (tower.type) {
    case "cannon":
      projectile.arcHeight = 30;
      if (tower.level >= 4 && tower.upgrade === "B") {
        // Flamethrower
        projectile.isFlamethrower = true;
      }
      break;

    case "lab":
      // Chain lightning
      if (stats.chainTargets && stats.chainTargets > 1) {
        const nearbyEnemies = findEnemiesInRange(targetPos, 100, enemies, selectedMap);
        for (let i = 0; i < Math.min(stats.chainTargets - 1, nearbyEnemies.length); i++) {
          if (nearbyEnemies[i].id !== target.id) {
            targetIds.push(nearbyEnemies[i].id);
          }
        }
      }
      break;

    case "arch":
      // Multi-target
      if (stats.chainTargets && stats.chainTargets > 1) {
        const nearbyEnemies = findEnemiesInRange(towerWorldPos, calculateTowerRange(tower), enemies, selectedMap);
        const sortedByProgress = nearbyEnemies.sort((a, b) => b.progress - a.progress);
        for (let i = 1; i < Math.min(stats.chainTargets, sortedByProgress.length); i++) {
          targetIds.push(sortedByProgress[i].id);
          projectiles.push({
            ...projectile,
            id: `proj-${tower.id}-${now}-${i}`,
            to: getEnemyPosition(sortedByProgress[i], sortedByProgress[i].pathKey || selectedMap),
            targetId: sortedByProgress[i].id,
          });
        }
      }
      break;
  }

  projectiles.unshift(projectile);
  targetIds.unshift(target.id);

  // Update tower state
  tower.lastAttack = now;
  tower.targetId = target.id;

  return {
    projectiles,
    effects,
    damage,
    targetIds,
  };
}

// ============================================================================
// HERO COMBAT
// ============================================================================

/**
 * Find target for a hero
 */
export function findHeroTarget(
  hero: Hero,
  enemies: Enemy[],
  selectedMap: string
): Enemy | null {
  const heroData = HERO_DATA[hero.type];
  const range = heroData.range;

  const validTargets = enemies.filter((enemy) => {
    if (enemy.dead || enemy.hp <= 0) return false;
    
    const enemyPos = getEnemyPosition(enemy, enemy.pathKey || selectedMap);
    const dist = distance(hero.pos, enemyPos);
    
    return dist <= range;
  });

  if (validTargets.length === 0) return null;

  // Prefer current target if still valid
  if (hero.aggroTarget) {
    const currentTarget = validTargets.find((e) => e.id === hero.aggroTarget);
    if (currentTarget) return currentTarget;
  }

  // Target closest enemy
  validTargets.sort((a, b) => {
    const aDist = distance(hero.pos, getEnemyPosition(a, a.pathKey || selectedMap));
    const bDist = distance(hero.pos, getEnemyPosition(b, b.pathKey || selectedMap));
    return aDist - bDist;
  });

  return validTargets[0];
}

/**
 * Execute hero attack
 */
export function executeHeroAttack(
  hero: Hero,
  target: Enemy,
  now: number = Date.now()
): number {
  const heroData = HERO_DATA[hero.type];
  const damage = heroData.damage;

  applyDamageToEnemy(target, damage);
  
  hero.lastAttack = now;
  hero.aggroTarget = target.id;
  hero.attackAnim = 300;

  return damage;
}

// ============================================================================
// TROOP COMBAT
// ============================================================================

/**
 * Find target for a troop
 */
export function findTroopTarget(
  troop: Troop,
  enemies: Enemy[],
  selectedMap: string
): Enemy | null {
  const troopData = TROOP_DATA[troop.type || "footsoldier"];
  const range = troopData.isRanged ? (troopData.range || 100) : 40;

  const validTargets = enemies.filter((enemy) => {
    if (enemy.dead || enemy.hp <= 0) return false;
    
    const enemyPos = getEnemyPosition(enemy, enemy.pathKey || selectedMap);
    const dist = distance(troop.pos, enemyPos);
    
    return dist <= range;
  });

  if (validTargets.length === 0) return null;

  // Prefer current target
  if (troop.targetEnemy) {
    const currentTarget = validTargets.find((e) => e.id === troop.targetEnemy);
    if (currentTarget) return currentTarget;
  }

  // Target closest enemy
  validTargets.sort((a, b) => {
    const aDist = distance(troop.pos, getEnemyPosition(a, a.pathKey || selectedMap));
    const bDist = distance(troop.pos, getEnemyPosition(b, b.pathKey || selectedMap));
    return aDist - bDist;
  });

  return validTargets[0];
}

/**
 * Execute troop attack
 */
export function executeTroopAttack(
  troop: Troop,
  target: Enemy,
  now: number = Date.now()
): number {
  const troopData = TROOP_DATA[troop.type || "footsoldier"];
  const damage = troopData.damage;

  applyDamageToEnemy(target, damage);
  
  troop.lastAttack = now;
  troop.targetEnemy = target.id;
  troop.attackAnim = 300;
  troop.engaging = true;
  target.inCombat = true;

  return damage;
}
