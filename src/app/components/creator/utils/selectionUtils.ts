import type { CreatorDraftState, GridPoint, SelectionTarget } from "../types";
import {
  distanceSq,
  normalizeMapPoint,
  normalizePathPoint,
  samePoint,
} from "./gridUtils";

export const getPointFromSelection = (
  selection: SelectionTarget,
  draft: CreatorDraftState
): GridPoint | null => {
  switch (selection.kind) {
    case "primary_path": {
      return draft.primaryPath[selection.index] ?? null;
    }
    case "secondary_path": {
      return draft.secondaryPath[selection.index] ?? null;
    }
    case "hero_spawn": {
      return draft.heroSpawn;
    }
    case "special_tower": {
      return draft.specialTowers[selection.index]?.pos ?? null;
    }
    case "tower": {
      return draft.placedTowers[selection.index]?.pos ?? null;
    }
    case "decoration": {
      return draft.decorations[selection.index]?.pos ?? null;
    }
    case "hazard": {
      return (
        (draft.hazards[selection.index]?.pos as GridPoint | undefined) ?? null
      );
    }
    default: {
      return null;
    }
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
    if (!p) {
      return;
    }
    const dist = distanceSq(point, p);
    if (dist < bestDist) {
      bestDist = dist;
      bestTarget = candidate;
    }
  };

  draft.primaryPath.forEach((p, index) =>
    tryCandidate({ index, kind: "primary_path" }, p)
  );
  draft.secondaryPath.forEach((p, index) =>
    tryCandidate({ index, kind: "secondary_path" }, p)
  );
  tryCandidate({ kind: "hero_spawn" }, draft.heroSpawn);
  draft.specialTowers.forEach((st, index) =>
    tryCandidate({ index, kind: "special_tower" }, st.pos)
  );
  draft.placedTowers.forEach((t, index) =>
    tryCandidate({ index, kind: "tower" }, t.pos)
  );
  draft.decorations.forEach((deco, index) =>
    tryCandidate({ index, kind: "decoration" }, deco.pos)
  );
  draft.hazards.forEach((hazard, index) =>
    tryCandidate(
      { index, kind: "hazard" },
      (hazard.pos as GridPoint | undefined) ?? null
    )
  );

  if (!bestTarget || bestDist > snapRadiusTiles * snapRadiusTiles) {
    return null;
  }
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
    if (draft.heroSpawn && samePoint(draft.heroSpawn, nextPoint)) {
      return draft;
    }
    return { ...draft, heroSpawn: nextPoint };
  }
  if (target.kind === "special_tower") {
    const nextPoint = normalizeMapPoint(point);
    const current = draft.specialTowers[target.index];
    if (!current) {
      return draft;
    }
    if (samePoint(current.pos, nextPoint)) {
      return draft;
    }
    const next = [...draft.specialTowers];
    next[target.index] = { ...current, pos: nextPoint };
    return { ...draft, specialTowers: next };
  }
  if (target.kind === "tower") {
    const nextPoint = normalizeMapPoint(point);
    const current = draft.placedTowers[target.index];
    if (!current) {
      return draft;
    }
    if (samePoint(current.pos, nextPoint)) {
      return draft;
    }
    const next = [...draft.placedTowers];
    next[target.index] = { ...current, pos: nextPoint };
    return { ...draft, placedTowers: next };
  }
  if (target.kind === "decoration") {
    const nextPoint = normalizeMapPoint(point);
    const next = [...draft.decorations];
    const current = next[target.index];
    if (!current) {
      return draft;
    }
    if (current.pos.x === nextPoint.x && current.pos.y === nextPoint.y) {
      return draft;
    }
    next[target.index] = { ...current, pos: nextPoint };
    return { ...draft, decorations: next };
  }
  const nextPoint = normalizeMapPoint(point);
  const next = [...draft.hazards];
  const current = next[target.index];
  if (!current) {
    return draft;
  }
  const currentPos = (current.pos as GridPoint | undefined) ?? null;
  if (
    currentPos &&
    currentPos.x === nextPoint.x &&
    currentPos.y === nextPoint.y
  ) {
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
      primaryPath: draft.primaryPath.filter(
        (_, index) => index !== target.index
      ),
    };
  }
  if (target.kind === "secondary_path") {
    return {
      ...draft,
      secondaryPath: draft.secondaryPath.filter(
        (_, index) => index !== target.index
      ),
    };
  }
  if (target.kind === "hero_spawn") {
    return { ...draft, heroSpawn: null };
  }
  if (target.kind === "special_tower") {
    return {
      ...draft,
      specialTowers: draft.specialTowers.filter(
        (_, index) => index !== target.index
      ),
    };
  }
  if (target.kind === "tower") {
    return {
      ...draft,
      placedTowers: draft.placedTowers.filter(
        (_, index) => index !== target.index
      ),
    };
  }
  if (target.kind === "decoration") {
    return {
      ...draft,
      decorations: draft.decorations.filter(
        (_, index) => index !== target.index
      ),
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
  if (!target || target.kind !== kind) {
    return false;
  }
  if (index === undefined) {
    return true;
  }
  return "index" in target && target.index === index;
};
