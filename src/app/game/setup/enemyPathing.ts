import type { Enemy, Position } from "../../types";
import { getEnemyPosition } from "../../utils";

export const getEnemyPosWithPath = (
  enemy: Enemy,
  defaultMap: string,
): Position => {
  const pathKey = enemy.pathKey || defaultMap;
  const basePos = getEnemyPosition(enemy, pathKey);

  if (enemy.tauntOffset) {
    return {
      x: basePos.x + enemy.tauntOffset.x,
      y: basePos.y + enemy.tauntOffset.y,
    };
  }

  return basePos;
};
