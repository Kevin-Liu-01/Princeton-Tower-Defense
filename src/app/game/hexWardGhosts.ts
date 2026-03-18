import { ENEMY_DATA, HERO_DATA, TROOP_DATA } from "../constants";
import type {
  Enemy,
  Hero,
  Troop,
  TroopType,
} from "../types";

export type HexWardGhostStrength = "weak" | "medium" | "strong" | "apex";

export interface HexWardGhostProfile {
  troopType: TroopType;
  hp: number;
  damage: number;
  attackSpeed: number;
  lifetimeMs: number;
  decayPerSecond: number;
  isRanged?: boolean;
  range?: number;
  canTargetFlying?: boolean;
}

const WEAK_ENEMY_SCORE = 520;
const STRONG_ENEMY_SCORE = 2400;
const APEX_ENEMY_SCORE = 4200;
const WEAK_TROOP_SCORE = 700;
const STRONG_TROOP_SCORE = 1850;
const APEX_TROOP_SCORE = 2900;

function getEnemyStrengthScore(enemy: Enemy): number {
  const enemyData = ENEMY_DATA[enemy.type];
  const traitCount = enemyData.traits?.length ?? 0;
  const bossBonus = enemyData.isBoss || enemyData.traits?.includes("boss") ? 1600 : 0;
  const rangedBonus = enemyData.isRanged ? 140 : 0;
  const flyingBonus = enemyData.flying ? 110 : 0;
  return (
    enemyData.hp +
    enemyData.bounty * 45 +
    enemyData.armor * 900 +
    traitCount * 85 +
    bossBonus +
    rangedBonus +
    flyingBonus
  );
}

function getTroopStrengthScore(troop: Troop): number {
  const troopType = troop.type ?? "footsoldier";
  const troopData = TROOP_DATA[troopType];
  const damage = troop.overrideDamage ?? troopData.damage;
  const attackSpeed = troop.overrideAttackSpeed ?? troopData.attackSpeed;
  const isRanged = troop.overrideIsRanged ?? troopData.isRanged ?? false;
  const rangedBonus = isRanged ? 160 : 0;
  const mountedBonus = troopData.isMounted ? 180 : 0;
  const stationaryPenalty = troopData.isStationary ? -220 : 0;
  const speedScore = Math.max(0, 1250 - attackSpeed) * 0.25;
  return (
    troop.maxHp +
    damage * 14 +
    speedScore +
    rangedBonus +
    mountedBonus +
    stationaryPenalty
  );
}

function classifyStrength(
  score: number,
  weakThreshold: number,
  strongThreshold: number,
  apexThreshold: number,
): HexWardGhostStrength {
  if (score >= apexThreshold) return "apex";
  if (score >= strongThreshold) return "strong";
  if (score >= weakThreshold) return "medium";
  return "weak";
}

export function getHexWardGhostStrengthFromEnemy(
  enemy: Enemy,
): HexWardGhostStrength {
  return classifyStrength(
    getEnemyStrengthScore(enemy),
    WEAK_ENEMY_SCORE,
    STRONG_ENEMY_SCORE,
    APEX_ENEMY_SCORE,
  );
}

export function getHexWardGhostStrengthFromTroop(
  troop: Troop,
): HexWardGhostStrength {
  return classifyStrength(
    getTroopStrengthScore(troop),
    WEAK_TROOP_SCORE,
    STRONG_TROOP_SCORE,
    APEX_TROOP_SCORE,
  );
}

export function getHexWardGhostStrengthFromHero(
  hero: Hero,
): HexWardGhostStrength {
  const heroData = HERO_DATA[hero.type];
  const heroScore =
    hero.maxHp + heroData.damage * 18 + (heroData.isRanged ? 220 : 0) + 1200;
  return classifyStrength(heroScore, 900, 2200, 3200);
}

export function getHexWardGhostProfile(
  strength: HexWardGhostStrength,
): HexWardGhostProfile {
  switch (strength) {
    case "weak":
      return {
        troopType: "rowing",
        hp: 420,
        damage: 8,
        attackSpeed: 1220,
        lifetimeMs: 14000,
        decayPerSecond: 24,
      };
    case "medium":
      return {
        troopType: "thesis",
        hp: 640,
        damage: 13,
        attackSpeed: 1020,
        lifetimeMs: 17000,
        decayPerSecond: 30,
      };
    case "strong":
      return {
        troopType: "hexling",
        hp: 860,
        damage: 18,
        attackSpeed: 940,
        lifetimeMs: 19000,
        decayPerSecond: 38,
        isRanged: true,
        range: 225,
        canTargetFlying: true,
      };
    case "apex":
      return {
        troopType: "hexseer",
        hp: 1180,
        damage: 25,
        attackSpeed: 820,
        lifetimeMs: 22000,
        decayPerSecond: 46,
        isRanged: true,
        range: 260,
        canTargetFlying: true,
      };
  }
}

export function isHexWardGhostHarvestActive(
  endTime: number | null | undefined,
  now: number,
): boolean {
  return !!endTime && endTime > now;
}
