import type { Decoration, Enemy, Hero, Position, Troop } from "../../types";
import { distance, screenToWorld, worldToScreen } from "../../utils";
import { ENEMY_DATA } from "../../constants";
import type { RuntimeDecoration } from "../../rendering/decorations/decorationHelpers";

interface InspectorHoverParams {
  screenPos: Position;
  width: number;
  height: number;
  dpr: number;
  cameraOffset: Position;
  cameraZoom: number;
  enemies: Enemy[];
  getEnemyPosWithPath: (enemy: Enemy, selectedMap: string) => Position;
  selectedMap: string;
  hero: Hero | null;
  troops: Troop[];
  decorations: RuntimeDecoration[] | undefined;
}

interface InspectorHoverResult {
  hoveredEnemy: Enemy | null;
  hoveredTroop: Troop | null;
  hoveredHero: boolean;
  hoveredDecoration: Decoration | null;
}

export function getInspectorHoverResult({
  screenPos,
  width,
  height,
  dpr,
  cameraOffset,
  cameraZoom,
  enemies,
  getEnemyPosWithPath,
  selectedMap,
  hero,
  troops,
  decorations,
}: InspectorHoverParams): InspectorHoverResult {
  const mouseWorldPos = screenToWorld(
    screenPos,
    width,
    height,
    dpr,
    cameraOffset,
    cameraZoom,
  );

  const FRIENDLY_BIAS = 12;
  const hoverRadius = 40 / cameraZoom;
  let hoveredEnemy: Enemy | null = null;
  let hoveredTroop: Troop | null = null;
  let hoveredHero = false;
  let closestDistance = Infinity;

  for (const enemy of enemies) {
    const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
    const enemyData = ENEMY_DATA[enemy.type];
    const flyingOffset = enemyData.flying ? 35 : 0;
    const adjustedEnemyPos = {
      x: enemyPos.x,
      y: enemyPos.y - flyingOffset,
    };
    const enemyDistance = distance(mouseWorldPos, adjustedEnemyPos);
    const hitRadius = (enemyData?.size || 20) * 1.5;

    if (enemyDistance < hitRadius + hoverRadius && enemyDistance < closestDistance) {
      closestDistance = enemyDistance;
      hoveredEnemy = enemy;
      hoveredTroop = null;
      hoveredHero = false;
    }
  }

  if (hero && !hero.dead) {
    const heroDistance = distance(mouseWorldPos, hero.pos);
    if (heroDistance < 30 + hoverRadius && heroDistance - FRIENDLY_BIAS < closestDistance) {
      closestDistance = heroDistance;
      hoveredEnemy = null;
      hoveredTroop = null;
      hoveredHero = true;
    }
  }

  for (const troop of troops) {
    if (troop.dead) continue;
    const troopDistance = distance(mouseWorldPos, troop.pos);
    if (troopDistance < 22 + hoverRadius && troopDistance - FRIENDLY_BIAS < closestDistance) {
      closestDistance = troopDistance;
      hoveredEnemy = null;
      hoveredHero = false;
      hoveredTroop = troop;
    }
  }

  let hoveredDecoration: Decoration | null = null;
  if (!hoveredEnemy && !hoveredTroop && !hoveredHero && decorations) {
    let bestDecorationDistance = Infinity;
    for (const decoration of decorations) {
      const decorationScreenPos = worldToScreen(
        { x: decoration.x, y: decoration.y },
        width,
        height,
        dpr,
        cameraOffset,
        cameraZoom,
      );
      const hitRadius = cameraZoom * decoration.scale * 25;
      const decorationDistance = distance(screenPos, decorationScreenPos);
      if (decorationDistance < hitRadius && decorationDistance < bestDecorationDistance) {
        bestDecorationDistance = decorationDistance;
        hoveredDecoration = decoration;
      }
    }
  }

  return {
    hoveredEnemy,
    hoveredTroop,
    hoveredHero,
    hoveredDecoration,
  };
}
