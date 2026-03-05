import type { Enemy, Troop, Hero, Position } from "../types";
import { ENEMY_DATA } from "../constants";
import { getEnemyPosition, distance } from "../utils";

export type InspectHitType = "enemy" | "troop" | "hero";

export interface InspectHitResult {
  type: InspectHitType;
  enemy: Enemy | null;
  troop: Troop | null;
  isHero: boolean;
}

const HERO_HIT_RADIUS = 30;
const TROOP_HIT_RADIUS = 22;

export function findClosestInspectUnit(
  worldPos: Position,
  enemies: Enemy[],
  troops: Troop[],
  hero: Hero | null,
  selectedMap: string,
  interactionRadius: number,
): InspectHitResult | null {
  let closestDist = Infinity;
  let result: InspectHitResult | null = null;

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const enemyPos = getEnemyPosition(enemy, enemy.pathKey || selectedMap);
    const eData = ENEMY_DATA[enemy.type];
    const flyingOffset = eData.flying ? 35 : 0;
    const dx = worldPos.x - enemyPos.x;
    const dy = worldPos.y - (enemyPos.y - flyingOffset);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hitRadius = (eData.size || 20) * 1.5;

    if (dist < hitRadius + interactionRadius && dist < closestDist) {
      closestDist = dist;
      result = { type: "enemy", enemy, troop: null, isHero: false };
    }
  }

  if (hero && !hero.dead) {
    const dx = worldPos.x - hero.pos.x;
    const dy = worldPos.y - hero.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < HERO_HIT_RADIUS + interactionRadius && dist < closestDist) {
      closestDist = dist;
      result = { type: "hero", enemy: null, troop: null, isHero: true };
    }
  }

  for (let i = 0; i < troops.length; i++) {
    const troop = troops[i];
    if (troop.dead) continue;
    const dx = worldPos.x - troop.pos.x;
    const dy = worldPos.y - troop.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < TROOP_HIT_RADIUS + interactionRadius && dist < closestDist) {
      closestDist = dist;
      result = { type: "troop", enemy: null, troop, isHero: false };
    }
  }

  return result;
}
