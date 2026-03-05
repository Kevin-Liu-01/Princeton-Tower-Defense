import type { Position, Enemy } from "../types";
import { distance } from "../utils";
import { ALLY_ALERT_RANGE } from "./pageHelpers";

export interface AlertableAlly {
  pos: Position;
  engaging: boolean;
}

/**
 * When a unit can't find an enemy in its direct sight range, check if any nearby
 * ally is already in combat. If so, find the closest enemy near that fighting ally
 * for this unit to engage, so idle units join nearby fights.
 *
 * @param allySightRange - how far from the engaging ally to scan for enemies
 *                         (typically the unit's own sight range)
 */
export function findAllyAlertTarget(
  unitPos: Position,
  allies: AlertableAlly[],
  enemies: Enemy[],
  getEnemyPos: (e: Enemy) => Position,
  allySightRange: number,
  enemyFilter?: (e: Enemy) => boolean,
): { enemy: Enemy; dist: number } | null {
  let engagingAllyPos: Position | null = null;
  let nearestAllyDist = ALLY_ALERT_RANGE;

  for (const ally of allies) {
    if (!ally.engaging) continue;
    const d = distance(unitPos, ally.pos);
    if (d < nearestAllyDist) {
      engagingAllyPos = ally.pos;
      nearestAllyDist = d;
    }
  }

  if (!engagingAllyPos) return null;

  let closestEnemy: Enemy | null = null;
  let closestDist = Infinity;

  for (const enemy of enemies) {
    if (enemyFilter && !enemyFilter(enemy)) continue;
    const enemyPos = getEnemyPos(enemy);
    if (distance(engagingAllyPos, enemyPos) > allySightRange) continue;
    const dist = distance(unitPos, enemyPos);
    if (dist < closestDist) {
      closestDist = dist;
      closestEnemy = enemy;
    }
  }

  if (!closestEnemy) return null;
  return { enemy: closestEnemy, dist: closestDist };
}
