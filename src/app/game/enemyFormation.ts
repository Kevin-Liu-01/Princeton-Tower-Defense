import type { EnemyType } from "../types";
import { getEnemyLaneOffsets, ENEMY_LANE_OFFSET_LIMIT } from "../utils";

export type EnemyFormationPattern = "echelon" | "line" | "file" | "wedge" | "vee";

export const ENEMY_LANE_OFFSETS = getEnemyLaneOffsets(5);
export const ENEMY_CENTER_LANE_INDEX = Math.floor(
  (ENEMY_LANE_OFFSETS.length - 1) / 2
);
export const ENEMY_SPAWN_LANE_JITTER = 0.08;
export const ENEMY_REPULSION_PROGRESS_RADIUS = 0.5;
export const ENEMY_REPULSION_LATERAL_STRENGTH = 0.18;
export const ENEMY_FORMATION_PULL_STRENGTH = 0.035;
export const ENEMY_LANE_SHIFT_MS = 180;

export const HEAVY_WEDGE_TYPES = new Set<EnemyType>([
  "trustee",
  "dean",
  "golem",
  "necromancer",
  "shadow_knight",
  "juggernaut",
  "dragon",
  "sandworm",
]);

export const FAST_VEE_TYPES = new Set<EnemyType>([
  "harpy",
  "mascot",
  "wyvern",
  "specter",
  "berserker",
  "assassin",
  "frostling",
  "banshee",
]);

export const SWARM_FILE_TYPES = new Set<EnemyType>([
  "cultist",
  "frosh",
  "plaguebearer",
  "thornwalker",
  "infernal",
]);

export function clampLaneOffset(laneOffset: number): number {
  return Math.max(
    -ENEMY_LANE_OFFSET_LIMIT,
    Math.min(ENEMY_LANE_OFFSET_LIMIT, laneOffset)
  );
}

export function clampLaneIndex(laneIndex: number): number {
  return Math.max(0, Math.min(ENEMY_LANE_OFFSETS.length - 1, laneIndex));
}

export function getNearestLaneIndex(laneOffset: number): number {
  let bestIndex = ENEMY_CENTER_LANE_INDEX;
  let bestDistance = Number.POSITIVE_INFINITY;
  ENEMY_LANE_OFFSETS.forEach((laneCenter, idx) => {
    const dist = Math.abs(laneOffset - laneCenter);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestIndex = idx;
    }
  });
  return bestIndex;
}

export function pickFormationPattern(
  enemyType: EnemyType,
  groupCount: number
): EnemyFormationPattern {
  if (HEAVY_WEDGE_TYPES.has(enemyType)) return "wedge";
  if (FAST_VEE_TYPES.has(enemyType)) return "vee";
  if (SWARM_FILE_TYPES.has(enemyType)) return "file";
  if (groupCount >= 10) return "line";
  if (groupCount >= 6) return "echelon";
  return "wedge";
}

export function getFormationLaneIndex(
  pattern: EnemyFormationPattern,
  spawnIndex: number,
  groupCount: number,
  mirror: boolean
): number {
  const laneCount = ENEMY_LANE_OFFSETS.length;
  const center = ENEMY_CENTER_LANE_INDEX;
  const maxSpread = Math.max(1, Math.floor((laneCount - 1) / 2));
  const mirrorLane = (lane: number) => laneCount - 1 - lane;

  if (laneCount <= 1) return 0;

  let lane = center;
  switch (pattern) {
    case "file":
      lane = center;
      break;
    case "line": {
      const t = groupCount <= 1 ? 0.5 : spawnIndex / (groupCount - 1);
      lane = Math.round(t * (laneCount - 1));
      break;
    }
    case "echelon": {
      const step =
        groupCount <= 1
          ? 0
          : Math.round(
              (spawnIndex / Math.max(1, groupCount - 1)) * (laneCount - 1)
            );
      lane = step;
      break;
    }
    case "vee": {
      const arm = Math.floor(spawnIndex / 2) + 1;
      const dir = spawnIndex % 2 === 0 ? -1 : 1;
      lane = center + dir * Math.min(maxSpread, arm);
      break;
    }
    case "wedge":
    default: {
      if (spawnIndex === 0) {
        lane = center;
      } else {
        const arm = Math.floor((spawnIndex + 1) / 2);
        const dir = spawnIndex % 2 === 1 ? -1 : 1;
        lane = center + dir * Math.min(maxSpread, arm);
      }
      break;
    }
  }

  const clamped = clampLaneIndex(lane);
  return mirror ? mirrorLane(clamped) : clamped;
}
