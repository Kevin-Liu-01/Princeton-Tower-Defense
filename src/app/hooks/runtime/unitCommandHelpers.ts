import type { Dispatch, SetStateAction } from "react";
import type { Position, Hero, Troop, Tower, Particle } from "../../types";
import type { TroopMoveInfo } from "../../utils";
import { HERO_PATH_HITBOX_SIZE } from "../../constants";
import {
  findClosestPathPoint,
  findClosestPathPointWithinRadius,
} from "../../utils";
import {
  isBarracksOwnerId,
  getFacingRightFromDelta,
} from "../../game/movement";
import { getFormationOffsets } from "../../game/setup";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function resolveHeroCommandTargetImpl(
  clickWorldPos: Position,
  moveTargetPos: Position | null,
  moveTargetValid: boolean,
  selectedMap: string,
): Position | null {
  if (moveTargetPos && moveTargetValid) return moveTargetPos;
  const pathResult = findClosestPathPoint(clickWorldPos, selectedMap);
  if (pathResult && pathResult.distance < HERO_PATH_HITBOX_SIZE * 2.5) {
    return pathResult.point;
  }
  return null;
}

export function resolveTroopCommandTargetImpl(
  clickWorldPos: Position,
  moveInfo: TroopMoveInfo,
  moveTargetPos: Position | null,
  moveTargetValid: boolean,
  selectedMap: string,
): Position | null {
  if (moveTargetPos && moveTargetValid) return moveTargetPos;
  const pathResult = findClosestPathPointWithinRadius(
    clickWorldPos,
    moveInfo.anchorPos,
    moveInfo.moveRadius,
    selectedMap
  );
  if (!pathResult || !pathResult.isValid) return null;
  const pathPoint = findClosestPathPoint(clickWorldPos, selectedMap);
  const isNearPath = !!pathPoint && pathPoint.distance < HERO_PATH_HITBOX_SIZE * 2.5;
  return isNearPath ? pathResult.point : null;
}

export function issueHeroMoveCommandImpl(
  heroId: string,
  targetPos: Position,
  setHero: Setter<Hero | null>,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void,
): void {
  setHero((prev) =>
    prev && prev.id === heroId
      ? {
        ...prev,
        moving: true,
        targetPos,
        selected: false,
        facingRight: getFacingRightFromDelta(
          targetPos.x - prev.pos.x,
          targetPos.y - prev.pos.y,
          prev.facingRight ?? true,
        ),
      }
      : prev
  );
  addParticles(targetPos, "glow", 5);
}

export function issueTroopFormationMoveCommandImpl(
  ownerId: string,
  targetPos: Position,
  towers: Tower[],
  setTroops: Setter<Troop[]>,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void,
): void {
  const station = towers.find((tower) => tower.id === ownerId && tower.type === "station");
  const isBarracksTroop = isBarracksOwnerId(ownerId);
  const isSpellTroop = ownerId.startsWith("spell");
  setTroops((prev) => {
    const formationTroops = prev.filter((troop) => troop.ownerId === ownerId);
    if (formationTroops.length === 0) {
      return prev.map((troop) => ({ ...troop, selected: false }));
    }

    const formationOffsets = getFormationOffsets(formationTroops.length);
    const troopIdToFormationIndex = new Map<string, number>();
    formationTroops.forEach((troop, idx) => {
      troopIdToFormationIndex.set(troop.id, idx);
    });

    return prev.map((troop) => {
      if (troop.ownerId !== ownerId) {
        return { ...troop, selected: false };
      }

      const formationIndex = troopIdToFormationIndex.get(troop.id) ?? 0;
      const offset = formationOffsets[formationIndex] || { x: 0, y: 0 };
      const newTarget = {
        x: targetPos.x + offset.x,
        y: targetPos.y + offset.y,
      };
      const shouldRelocateAnchor = !!station || isBarracksTroop || isSpellTroop;
      return {
        ...troop,
        moving: true,
        targetPos: newTarget,
        userTargetPos: newTarget,
        selected: false,
        spawnPoint: shouldRelocateAnchor ? newTarget : troop.spawnPoint,
        facingRight: getFacingRightFromDelta(
          newTarget.x - troop.pos.x,
          newTarget.y - troop.pos.y,
          troop.facingRight ?? true,
        ),
      };
    });
  });
  addParticles(targetPos, "light", 5);
}
