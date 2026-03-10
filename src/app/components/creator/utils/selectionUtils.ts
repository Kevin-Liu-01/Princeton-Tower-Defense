import type { CreatorDraftState, GridPoint, SelectionTarget } from "../types";
import { distanceSq, normalizeMapPoint, normalizePathPoint, samePoint } from "./gridUtils";

export const getPointFromSelection = (
  selection: SelectionTarget,
  draft: CreatorDraftState
): GridPoint | null => {
  switch (selection.kind) {
    case "primary_path":
      return draft.primaryPath[selection.index] ?? null;
    case "secondary_path":
      return draft.secondaryPath[selection.index] ?? null;
    case "hero_spawn":
      return draft.heroSpawn;
    case "special_tower":
      return draft.specialTowerPos;
    case "decoration":
      return draft.decorations[selection.index]?.pos ?? null;
    case "hazard":
      return (draft.hazards[selection.index]?.pos as GridPoint | undefined) ?? null;
    default:
      return null;
  }
};

export const findSelectionNearPoint = (
  point: GridPoint,
  draft: CreatorDraftState,
  snapRadiusTiles = 1.8
): SelectionTarget | null => {
  let bestTarget: SelectionTarget | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  const tryCandidate = (candidate: SelectionTarget, p: GridPoint | null) => {
    if (!p) return;
    const dist = distanceSq(point, p);
    if (dist < bestDist) {
      bestDist = dist;
      bestTarget = candidate;
    }
  };

  draft.primaryPath.forEach((p, index) =>
    tryCandidate({ kind: "primary_path", index }, p)
  );
  draft.secondaryPath.forEach((p, index) =>
    tryCandidate({ kind: "secondary_path", index }, p)
  );
  tryCandidate({ kind: "hero_spawn" }, draft.heroSpawn);
  tryCandidate({ kind: "special_tower" }, draft.specialTowerPos);
  draft.decorations.forEach((deco, index) =>
    tryCandidate({ kind: "decoration", index }, deco.pos)
  );
  draft.hazards.forEach((hazard, index) =>
    tryCandidate({ kind: "hazard", index }, (hazard.pos as GridPoint | undefined) ?? null)
  );

  if (!bestTarget || bestDist > snapRadiusTiles * snapRadiusTiles) return null;
  return bestTarget;
};

export const applySelectionPointUpdate = (
  draft: CreatorDraftState,
  target: SelectionTarget,
  point: GridPoint
): CreatorDraftState => {
  if (target.kind === "primary_path") {
    const nextPoint = normalizePathPoint(point);
    const current = draft.primaryPath[target.index];
    if (!current || (current.x === nextPoint.x && current.y === nextPoint.y)) {
      return draft;
    }
    const next = [...draft.primaryPath];
    next[target.index] = nextPoint;
    return { ...draft, primaryPath: next };
  }
  if (target.kind === "secondary_path") {
    const nextPoint = normalizePathPoint(point);
    const current = draft.secondaryPath[target.index];
    if (!current || (current.x === nextPoint.x && current.y === nextPoint.y)) {
      return draft;
    }
    const next = [...draft.secondaryPath];
    next[target.index] = nextPoint;
    return { ...draft, secondaryPath: next };
  }
  if (target.kind === "hero_spawn") {
    const nextPoint = normalizeMapPoint(point);
    if (draft.heroSpawn && samePoint(draft.heroSpawn, nextPoint)) return draft;
    return { ...draft, heroSpawn: nextPoint };
  }
  if (target.kind === "special_tower") {
    const nextPoint = normalizeMapPoint(point);
    if (draft.specialTowerPos && samePoint(draft.specialTowerPos, nextPoint)) {
      return draft;
    }
    return { ...draft, specialTowerPos: nextPoint };
  }
  if (target.kind === "decoration") {
    const nextPoint = normalizeMapPoint(point);
    const next = [...draft.decorations];
    const current = next[target.index];
    if (!current) return draft;
    if (current.pos.x === nextPoint.x && current.pos.y === nextPoint.y) {
      return draft;
    }
    next[target.index] = { ...current, pos: nextPoint };
    return { ...draft, decorations: next };
  }
  const nextPoint = normalizeMapPoint(point);
  const next = [...draft.hazards];
  const current = next[target.index];
  if (!current) return draft;
  const currentPos = (current.pos as GridPoint | undefined) ?? null;
  if (currentPos && currentPos.x === nextPoint.x && currentPos.y === nextPoint.y) {
    return draft;
  }
  next[target.index] = { ...current, pos: nextPoint };
  return { ...draft, hazards: next };
};

export const removeSelection = (
  draft: CreatorDraftState,
  target: SelectionTarget
): CreatorDraftState => {
  if (target.kind === "primary_path") {
    return {
      ...draft,
      primaryPath: draft.primaryPath.filter((_, index) => index !== target.index),
    };
  }
  if (target.kind === "secondary_path") {
    return {
      ...draft,
      secondaryPath: draft.secondaryPath.filter((_, index) => index !== target.index),
    };
  }
  if (target.kind === "hero_spawn") {
    return { ...draft, heroSpawn: null };
  }
  if (target.kind === "special_tower") {
    return { ...draft, specialTowerPos: null };
  }
  if (target.kind === "decoration") {
    return {
      ...draft,
      decorations: draft.decorations.filter((_, index) => index !== target.index),
    };
  }
  return {
    ...draft,
    hazards: draft.hazards.filter((_, index) => index !== target.index),
  };
};

export const targetMatches = (
  target: SelectionTarget | null,
  kind: SelectionTarget["kind"],
  index?: number
): boolean => {
  if (!target || target.kind !== kind) return false;
  if (index === undefined) return true;
  return "index" in target && target.index === index;
};
