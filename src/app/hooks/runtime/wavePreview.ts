import type { EnemyType } from "../../types";
import { ENEMY_DATA, getLevelPathKeys } from "../../constants";
import { getLevelWaves } from "../../game/setup";
import type { WavePreviewEnemyEntry } from "./renderScene";

export function computeWavePreviewByPath(
  selectedMap: string,
  currentWave: number,
  activeWaveSpawnPaths: string[],
): Map<string, WavePreviewEnemyEntry[]> {
  const currentLevelWaves = getLevelWaves(selectedMap);
  const nextWave = currentLevelWaves[currentWave];
  const groupedCounts = new Map<string, Map<EnemyType, number>>();
  for (const pathKey of activeWaveSpawnPaths) {
    groupedCounts.set(pathKey, new Map<EnemyType, number>());
  }
  if (!nextWave) {
    return new Map<string, WavePreviewEnemyEntry[]>();
  }

  const addEnemyCount = (pathKey: string, enemyType: EnemyType, count: number) => {
    if (count <= 0) return;
    const pathMap = groupedCounts.get(pathKey);
    if (!pathMap) return;
    pathMap.set(enemyType, (pathMap.get(enemyType) ?? 0) + count);
  };

  for (const group of nextWave) {
    const pathCount = Math.max(1, activeWaveSpawnPaths.length);
    const baseCount = Math.floor(group.count / pathCount);
    const remainder = group.count % pathCount;
    for (let i = 0; i < pathCount; i++) {
      const pathKey = activeWaveSpawnPaths[i];
      if (!pathKey) continue;
      const count = baseCount + (i < remainder ? 1 : 0);
      addEnemyCount(pathKey, group.type, count);
    }
  }

  const previewByPath = new Map<string, WavePreviewEnemyEntry[]>();
  for (const pathKey of activeWaveSpawnPaths) {
    const countByType = groupedCounts.get(pathKey) ?? new Map<EnemyType, number>();
    const entries = Array.from(countByType.entries())
      .map(([type, count]) => {
        const enemyData = ENEMY_DATA[type];
        return {
          type,
          count,
          name: enemyData?.name ?? type,
          color: enemyData?.color ?? "#f87171",
        };
      })
      .sort((a, b) => {
        const aBoss = ENEMY_DATA[a.type]?.isBoss ? 1 : 0;
        const bBoss = ENEMY_DATA[b.type]?.isBoss ? 1 : 0;
        return bBoss - aBoss || b.count - a.count || a.name.localeCompare(b.name);
      });
    previewByPath.set(pathKey, entries);
  }

  return previewByPath;
}
