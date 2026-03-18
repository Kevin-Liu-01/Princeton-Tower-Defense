import { ENEMY_DATA } from "../constants";
import type { Enemy, EnemyType } from "../types";

export type EnemyDamageType = "default" | "fire" | "poison";

function getEnemyArmor(enemyType: EnemyType): number {
  return ENEMY_DATA[enemyType].armor || 0;
}

export function getEnemyDamageTaken(
  enemy: Pick<Enemy, "type" | "hexWard" | "hexWardUntil" | "hexWardDamageAmp">,
  rawDamage: number,
  damageType: EnemyDamageType = "default",
): number {
  const safeDamage = Math.max(0, rawDamage);
  if (safeDamage <= 0) return 0;
  const baseDamage =
    damageType === "fire" || damageType === "poison"
      ? safeDamage
      : safeDamage * Math.max(0, 1 - getEnemyArmor(enemy.type));

  const hexMultiplier =
    enemy.hexWard &&
    enemy.hexWardUntil &&
    enemy.hexWardUntil > Date.now() &&
    enemy.hexWardDamageAmp
      ? 1 + enemy.hexWardDamageAmp
      : 1;

  return baseDamage * hexMultiplier;
}
