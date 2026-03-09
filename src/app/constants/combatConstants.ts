// Cross-cutting combat constants shared across towers, heroes, troops, and enemies.
// Domain-specific stats live in their own files (towerStats.ts, heroes.ts, etc.).

// --- Healing ---
export const HERO_HEAL_DELAY_MS = 5000;
export const HERO_HEAL_RATE = 0.03;
export const TROOP_HEAL_DELAY_MS = 3000;
export const TROOP_HEAL_RATE = 0.02;
export const ENEMY_REGEN_RATE = 0.015;

// --- Combat Radii ---
export const HERO_COMBAT_RADIUS = 100;
export const HERO_AUTO_ABILITY_HP_THRESHOLD = 0.25;
export const STATION_TROOP_RANGE = 280;
export const BARRACKS_TROOP_RANGE = 220;
export const SPELL_TROOP_RANGE = 200;
export const HERO_SUMMON_RANGE = 180;

// --- Damage Flash Durations (ms) ---
export const DAMAGE_FLASH_MS = 200;
export const DAMAGE_FLASH_SHORT_MS = 100;
export const DAMAGE_FLASH_LONG_MS = 240;

// --- Fallback Defaults (used when data is missing) ---
export const DEFAULT_TROOP_HP = 100;
export const DEFAULT_TROOP_DAMAGE = 20;
export const DEFAULT_TROOP_ATTACK_SPEED = 1000;
export const DEFAULT_TROOP_MOVE_SPEED = 1.5;
export const DEFAULT_TROOP_MELEE_RANGE = 70;
export const DEFAULT_TROOP_RANGED_RANGE = 140;
export const DEFAULT_ENEMY_TROOP_DAMAGE = 22;
export const DEFAULT_ENEMY_HERO_DAMAGE = 28;
export const DEFAULT_ENEMY_RANGE = 120;
export const DEFAULT_ENEMY_PROJECTILE_DAMAGE = 15;
export const DEFAULT_ENEMY_BURN_DAMAGE = 10;
export const DEFAULT_ENEMY_TROOP_ATTACK_SPEED = 2000;
export const DEFAULT_ENEMY_FLYING_ATTACK_RANGE = 80;
export const DEFAULT_PROJECTILE_DAMAGE = 20;
export const DEFAULT_TOWER_ATTACK_SPEED = 1000;

// --- Enemy Classification Thresholds ---
export const ARMORED_THRESHOLD = 0.2;
export const FAST_SPEED_THRESHOLD = 0.4;

// --- Buff Constants ---
export const SCOTT_RANGE_BUFF = 1.25;
export const SCOTT_DAMAGE_BUFF = 1.5;
export const BEACON_RANGE_BUFF = 1.2;
export const BEACON_BUFF_RANGE = 250;
export const INVESTMENT_BANK_RANGE_BUFF = 1.15;
export const INVESTMENT_BANK_BUFF_RANGE = 200;
export const RECRUITMENT_CENTER_DAMAGE_BUFF = 1.15;
export const RECRUITMENT_CENTER_BUFF_RANGE = 200;
export const CHRONO_RELAY_SPEED_BUFF = 1.25;
export const CHRONO_RELAY_BUFF_RANGE = 220;
export const RANGE_BUFF_CAP = 2.5;
export const DAMAGE_BUFF_CAP = 3.0;
export const ATTACK_SPEED_BUFF_CAP = 2.4;

// --- Level Range Multipliers (all towers) ---
export const LEVEL_2_RANGE_MULT = 1.15;
export const LEVEL_3_RANGE_MULT = 1.25;
export const LEVEL_4_RANGE_MULT = 1.5;

// --- Special Tower Stats ---
export const SENTINEL_NEXUS_STATS = {
  damage: 240,
  radius: 140,
  strikeIntervalMs: 10000,
  stunDuration: 450,
  damageFlash: 240,
} as const;

export const SUNFORGE_ORRERY_STATS = {
  barrageIntervalMs: 9000,
  clusterScanRadius: 190,
  strikeRadius: 115,
  directDamage: 185,
  burnDps: 28,
  burnDurationMs: 2600,
  stunDuration: 320,
  damageFlash: 280,
  volleyOffsets: [
    { multiplier: 1.0, radiusScale: 1.0 },
    { multiplier: 0.76, radiusScale: 0.92 },
    { multiplier: 0.72, radiusScale: 0.9 },
  ],
} as const;
