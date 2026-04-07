import { ENEMY_DATA } from "../constants";
import type { Position, Enemy, EnemyType } from "../types";

const FLYING_AIM_WORLD_OFFSET = 70;

export function createEnemyPosCache(
  getEnemyPosWithPath: (enemy: Enemy, selectedMap: string) => Position,
  selectedMap: string
) {
  const posCache = new WeakMap<Enemy, Position>();
  const aimPosCache = new WeakMap<Enemy, Position>();

  const getPos = (enemy: Enemy): Position => {
    const cached = posCache.get(enemy);
    if (cached) {
      return cached;
    }
    const pos = getEnemyPosWithPath(enemy, selectedMap);
    posCache.set(enemy, pos);
    return pos;
  };

  const getAimPos = (enemy: Enemy): Position => {
    const cached = aimPosCache.get(enemy);
    if (cached) {
      return cached;
    }
    const basePos = getPos(enemy);
    const enemyData = ENEMY_DATA[enemy.type as EnemyType];
    if (!enemyData?.flying) {
      aimPosCache.set(enemy, basePos);
      return basePos;
    }
    const aimPos = {
      x: basePos.x - FLYING_AIM_WORLD_OFFSET,
      y: basePos.y - FLYING_AIM_WORLD_OFFSET,
    };
    aimPosCache.set(enemy, aimPos);
    return aimPos;
  };

  return { getAimPos, getPos };
}
