import type { Position, Enemy } from "../types";
import { distance } from "../utils";
import { ALLY_ALERT_RANGE } from "./pageHelpers";

export interface AlertableAlly {
  pos: Position;
  engaging: boolean;
}

/**
 * When a unit can't find an enemy in its direct sight range, check if any nearby
 * ally is already in combat. If so, extend the unit's own sight range and scan
 * for the closest enemy it can engage.
 *
 * @param extendedSightRange - boosted sight range to use when alerted (typically
 *                             the unit's sightRange + ALLY_ALERT_RANGE)
 */
export function findAllyAlertTarget(
  unitPos: Position,
  allies: AlertableAlly[],
  enemies: Enemy[],
  getEnemyPos: (e: Enemy) => Position,
  extendedSightRange: number,
  enemyFilter?: (e: Enemy) => boolean,
): { enemy: Enemy; dist: number } | null {
  let hasEngagingAlly = false;

  for (const ally of allies) {
    if (!ally.engaging) continue;
    if (distance(unitPos, ally.pos) <= ALLY_ALERT_RANGE) {
      hasEngagingAlly = true;
      break;
    }
  }

  if (!hasEngagingAlly) return null;

  let closestEnemy: Enemy | null = null;
  let closestDist = Infinity;

  for (const enemy of enemies) {
    if (enemyFilter && !enemyFilter(enemy)) continue;
    const enemyPos = getEnemyPos(enemy);
    const dist = distance(unitPos, enemyPos);
    if (dist > extendedSightRange) continue;
    if (dist < closestDist) {
      closestDist = dist;
      closestEnemy = enemy;
    }
  }

  if (!closestEnemy) return null;
  return { enemy: closestEnemy, dist: closestDist };
}
