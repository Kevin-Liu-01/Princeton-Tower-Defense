import { ENEMY_DATA } from "../constants";
import type { Enemy, EnemyType } from "../types";

export type EnemyDamageType = "default" | "fire" | "poison";

export function getEnemyArmor(enemyType: EnemyType): number {
  return ENEMY_DATA[enemyType].armor || 0;
}

export function getEnemyDamageTaken(
  enemy: Pick<Enemy, "type">,
  rawDamage: number,
  damageType: EnemyDamageType = "default",
): number {
  const safeDamage = Math.max(0, rawDamage);
  if (safeDamage <= 0) return 0;
  if (damageType === "fire" || damageType === "poison") return safeDamage;

  const armorMultiplier = Math.max(0, 1 - getEnemyArmor(enemy.type));
  return safeDamage * armorMultiplier;
}
