// Princeton Tower Defense - Hero Management System
// Handles hero abilities, respawning, and special effects

import type { Hero, HeroType, Enemy, Tower, Troop, Position, Effect } from "../../types";
import { HERO_DATA } from "../../constants";
import { distance, getEnemyPosition } from "../../utils";

// ============================================================================
// HERO CREATION
// ============================================================================

/**
 * Create a new hero
 */
export function createHero(
  type: HeroType,
  pos: Position,
  heroId: string
): Hero {
  const heroData = HERO_DATA[type];
  
  return {
    id: heroId,
    type,
    pos: { ...pos },
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
    homePos: { ...pos },
  };
}

// ============================================================================
// HERO ABILITIES
// ============================================================================

export interface AbilityResult {
  effects: Effect[];
  damage?: number;
  healing?: number;
  towersBuffed?: string[];
  enemiesAffected?: string[];
  troopsSummoned?: Troop[];
}

/**
 * Execute hero ability
 */
export function executeHeroAbility(
  hero: Hero,
  enemies: Enemy[],
  towers: Tower[],
  selectedMap: string
): AbilityResult {
  const result: AbilityResult = { effects: [] };
  const heroData = HERO_DATA[hero.type];
  
  if (!hero.abilityReady || hero.dead) {
    return result;
  }

  switch (hero.type) {
    case "tiger":
      // Tiger Roar - Damage and stun nearby enemies
      result.effects.push(createRoarEffect(hero.pos));
      result.enemiesAffected = applyTigerRoar(hero, enemies, selectedMap);
      hero.abilityCooldown = 15000;
      break;

    case "tenor":
      // Inspiring Song - Buff nearby towers' attack speed
      result.effects.push(createInspirationEffect(hero.pos));
      result.towersBuffed = applyTenorInspiration(hero, towers);
      hero.abilityCooldown = 20000;
      break;

    case "mathey":
      // Shield Wall - Create a temporary barrier
      result.effects.push(createShieldEffect(hero.pos));
      hero.shieldActive = true;
      hero.shieldEnd = Date.now() + 5000;
      hero.abilityCooldown = 25000;
      break;

    case "rocky":
      // Ground Slam - AoE damage and slow
      result.effects.push(createEarthquakeEffect(hero.pos));
      result.enemiesAffected = applyRockySlam(hero, enemies, selectedMap);
      hero.abilityCooldown = 12000;
      break;

    case "scott":
      // Scholar's Wisdom - Buff nearby tower damage
      result.effects.push(createWisdomEffect(hero.pos));
      result.towersBuffed = applyScottWisdom(hero, towers);
      hero.abilityCooldown = 30000;
      break;

    case "captain":
      // Rally Cry - Heal and buff nearby troops
      result.effects.push(createRallyEffect(hero.pos));
      // Troop healing handled separately
      hero.abilityCooldown = 18000;
      break;

    case "engineer":
      // Deploy Turret - Summon temporary turret
      result.effects.push(createTurretDeployEffect(hero.pos));
      // Turret creation handled separately
      hero.abilityCooldown = 35000;
      break;
  }

  hero.abilityReady = false;
  
  return result;
}

// ============================================================================
// ABILITY IMPLEMENTATIONS
// ============================================================================

function applyTigerRoar(hero: Hero, enemies: Enemy[], selectedMap: string): string[] {
  const affected: string[] = [];
  const range = 150;
  const damage = 50;
  const stunDuration = 1500;

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    
    const enemyPos = getEnemyPosition(enemy, enemy.pathKey || selectedMap);
    const dist = distance(hero.pos, enemyPos);

    if (dist <= range) {
      enemy.hp -= damage;
      enemy.damageFlash = 1;
      enemy.stunUntil = Date.now() + stunDuration;
      enemy.frozen = true;
      affected.push(enemy.id);
    }
  }

  return affected;
}

function applyTenorInspiration(hero: Hero, towers: Tower[]): string[] {
  const affected: string[] = [];
  const range = 200;
  const buffDuration = 8000;

  for (const tower of towers) {
    const towerWorldPos = { x: tower.pos.x * 64, y: tower.pos.y * 64 }; // Approximate
    const dist = distance(hero.pos, towerWorldPos);

    if (dist <= range) {
      // Attack speed buff handled by game state
      affected.push(tower.id);
    }
  }

  return affected;
}

function applyRockySlam(hero: Hero, enemies: Enemy[], selectedMap: string): string[] {
  const affected: string[] = [];
  const range = 120;
  const damage = 80;
  const slowAmount = 0.5;
  const slowDuration = 3000;

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    
    const enemyPos = getEnemyPosition(enemy, enemy.pathKey || selectedMap);
    const dist = distance(hero.pos, enemyPos);

    if (dist <= range) {
      enemy.hp -= damage;
      enemy.damageFlash = 1;
      enemy.slowed = true;
      enemy.slowEffect = slowAmount;
      enemy.slowIntensity = slowAmount;
      affected.push(enemy.id);
    }
  }

  return affected;
}

function applyScottWisdom(hero: Hero, towers: Tower[]): string[] {
  const affected: string[] = [];
  const range = 200;
  const buffDuration = 10000;
  const damageMultiplier = 1.5;

  for (const tower of towers) {
    const towerWorldPos = { x: tower.pos.x * 64, y: tower.pos.y * 64 }; // Approximate
    const dist = distance(hero.pos, towerWorldPos);

    if (dist <= range) {
      tower.damageBoost = damageMultiplier;
      tower.boostEnd = Date.now() + buffDuration;
      tower.isBuffed = true;
      affected.push(tower.id);
    }
  }

  return affected;
}

// ============================================================================
// EFFECT CREATION
// ============================================================================

function createRoarEffect(pos: Position): Effect {
  return {
    id: `roar-${Date.now()}`,
    pos: { ...pos },
    type: "roar_wave",
    progress: 0,
    size: 150,
  };
}

function createInspirationEffect(pos: Position): Effect {
  return {
    id: `inspiration-${Date.now()}`,
    pos: { ...pos },
    type: "inspiration",
    progress: 0,
    size: 200,
  };
}

function createShieldEffect(pos: Position): Effect {
  return {
    id: `shield-${Date.now()}`,
    pos: { ...pos },
    type: "fortress_shield",
    progress: 0,
    size: 80,
    duration: 5000,
  };
}

function createEarthquakeEffect(pos: Position): Effect {
  return {
    id: `earthquake-${Date.now()}`,
    pos: { ...pos },
    type: "earthquake",
    progress: 0,
    size: 120,
  };
}

function createWisdomEffect(pos: Position): Effect {
  return {
    id: `wisdom-${Date.now()}`,
    pos: { ...pos },
    type: "inspiration",
    progress: 0,
    size: 200,
  };
}

function createRallyEffect(pos: Position): Effect {
  return {
    id: `rally-${Date.now()}`,
    pos: { ...pos },
    type: "inspiration",
    progress: 0,
    size: 150,
  };
}

function createTurretDeployEffect(pos: Position): Effect {
  return {
    id: `turret-deploy-${Date.now()}`,
    pos: { ...pos },
    type: "turret_deploy",
    progress: 0,
    size: 60,
  };
}

// ============================================================================
// HERO STATE MANAGEMENT
// ============================================================================

/**
 * Update hero ability cooldown
 */
export function updateHeroAbilityCooldown(hero: Hero, deltaTime: number): void {
  if (hero.dead) return;
  
  if (!hero.abilityReady && hero.abilityCooldown > 0) {
    hero.abilityCooldown -= deltaTime;
    
    if (hero.abilityCooldown <= 0) {
      hero.abilityReady = true;
      hero.abilityCooldown = 0;
    }
  }
}

/**
 * Update hero shield state
 */
export function updateHeroShield(hero: Hero): void {
  if (hero.shieldActive && hero.shieldEnd) {
    if (Date.now() >= hero.shieldEnd) {
      hero.shieldActive = false;
      hero.shieldEnd = undefined;
    }
  }
}

/**
 * Handle hero death
 */
export function handleHeroDeath(hero: Hero, respawnTime: number = 15000): void {
  hero.dead = true;
  hero.hp = 0;
  hero.respawnTimer = respawnTime;
  hero.moving = false;
  hero.selected = false;
}

/**
 * Update hero respawn timer
 */
export function updateHeroRespawn(hero: Hero, deltaTime: number): boolean {
  if (!hero.dead || hero.respawnTimer <= 0) return false;
  
  hero.respawnTimer -= deltaTime;
  
  if (hero.respawnTimer <= 0) {
    // Respawn hero
    hero.dead = false;
    hero.hp = hero.maxHp;
    hero.respawnTimer = 0;
    
    // Return to home position
    if (hero.homePos) {
      hero.pos = { ...hero.homePos };
    }
    
    return true;
  }
  
  return false;
}

/**
 * Check if hero can attack
 */
export function canHeroAttack(hero: Hero, now: number): boolean {
  if (hero.dead) return false;
  
  const heroData = HERO_DATA[hero.type];
  const attackSpeed = heroData.attackSpeed;
  
  return now - hero.lastAttack >= attackSpeed;
}

/**
 * Get hero attack range
 */
export function getHeroAttackRange(hero: Hero): number {
  const heroData = HERO_DATA[hero.type];
  return heroData.range;
}

/**
 * Check if hero is ranged
 */
export function isHeroRanged(hero: Hero): boolean {
  const heroData = HERO_DATA[hero.type];
  return heroData.isRanged || false;
}

// ============================================================================
// HERO SELECTION
// ============================================================================

/**
 * Get available heroes for a level
 */
export function getAvailableHeroes(): HeroType[] {
  return ["tiger", "tenor", "mathey", "rocky", "scott", "captain", "engineer"];
}

/**
 * Get hero data for display
 */
export function getHeroInfo(type: HeroType): {
  name: string;
  description: string;
  ability: string;
  abilityDesc: string;
  stats: {
    hp: number;
    damage: number;
    range: number;
    attackSpeed: number;
    speed: number;
  };
} {
  const data = HERO_DATA[type];
  
  return {
    name: data.name,
    description: data.description,
    ability: data.ability,
    abilityDesc: data.abilityDesc,
    stats: {
      hp: data.hp,
      damage: data.damage,
      range: data.range,
      attackSpeed: data.attackSpeed,
      speed: data.speed,
    },
  };
}
