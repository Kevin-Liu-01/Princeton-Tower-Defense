import type { Position } from "../types";

const EPSILON = 0.0001;
const GAME_TICK_NORMALIZER = 16;

export interface PositionedUnit {
  id: string;
  pos: Position;
}

export interface StepTowardTargetInput {
  current: Position;
  target: Position;
  speed: number;
  deltaTime: number;
  stopDistance?: number;
}

export interface StepTowardTargetResult {
  pos: Position;
  reached: boolean;
  rotation: number;
  facingRight: boolean;
  distance: number;
}

export function getFacingRightFromDelta(
  dx: number,
  dy: number,
  fallbackFacingRight: boolean = true,
): boolean {
  // In 2:1 isometric projection, screenX ∝ (worldX - worldY).
  // "Facing right on screen" means the screen-space X component is positive.
  const screenDx = dx - dy;
  if (!Number.isFinite(screenDx) || Math.abs(screenDx) <= EPSILON)
    return fallbackFacingRight;
  return screenDx >= 0;
}

export function stepTowardTarget({
  current,
  target,
  speed,
  deltaTime,
  stopDistance = 0,
}: StepTowardTargetInput): StepTowardTargetResult {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distance = Math.hypot(dx, dy);
  const safeDistance = Math.max(distance, EPSILON);
  const rotation = Math.atan2(dy, dx);
  const facingRight = getFacingRightFromDelta(dx, dy);
  const minStopDistance = Math.max(0, stopDistance);

  if (distance <= minStopDistance + EPSILON) {
    return {
      pos: { ...current },
      reached: true,
      rotation,
      facingRight,
      distance,
    };
  }

  const maxStepDistance = Math.max(0, (speed * deltaTime) / GAME_TICK_NORMALIZER);
  const availableDistance = Math.max(0, distance - minStopDistance);
  const traveled = Math.min(maxStepDistance, availableDistance);

  if (traveled <= EPSILON) {
    return {
      pos: { ...current },
      reached: true,
      rotation,
      facingRight,
      distance,
    };
  }

  const nextPos = {
    x: current.x + (dx / safeDistance) * traveled,
    y: current.y + (dy / safeDistance) * traveled,
  };
  const remainingDistance = Math.max(0, distance - traveled);

  return {
    pos: nextPos,
    reached: remainingDistance <= minStopDistance + EPSILON,
    rotation,
    facingRight,
    distance,
  };
}

export function clampPositionToRadius(
  pos: Position,
  anchorPos: Position | undefined,
  radius: number | undefined
): Position {
  if (!anchorPos || radius == null || !Number.isFinite(radius) || radius <= 0) {
    return pos;
  }

  const dx = pos.x - anchorPos.x;
  const dy = pos.y - anchorPos.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= radius || dist <= EPSILON) return pos;

  return {
    x: anchorPos.x + (dx / dist) * radius,
    y: anchorPos.y + (dy / dist) * radius,
  };
}

const deterministicFallbackVector = (idA: string, idB: string): Position => {
  const signature = `${idA}:${idB}`;
  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    hash = (hash << 5) - hash + signature.charCodeAt(i);
    hash |= 0;
  }
  const angle = ((Math.abs(hash) % 6283) / 1000) % (Math.PI * 2);
  return { x: Math.cos(angle), y: Math.sin(angle) };
};

export function computeSeparationForces(
  units: PositionedUnit[],
  minDistance: number,
  maxForce: number = 1.25
): Map<string, Position> {
  const forces = new Map<string, Position>();
  if (units.length <= 1 || minDistance <= EPSILON) return forces;

  const minDistSq = minDistance * minDistance;
  const addForce = (id: string, fx: number, fy: number) => {
    const current = forces.get(id) || { x: 0, y: 0 };
    forces.set(id, { x: current.x + fx, y: current.y + fy });
  };

  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      const a = units[i];
      const b = units[j];
      const dx = a.pos.x - b.pos.x;
      const dy = a.pos.y - b.pos.y;
      const distSq = dx * dx + dy * dy;
      if (distSq >= minDistSq) continue;

      if (distSq <= EPSILON) {
        const fallback = deterministicFallbackVector(a.id, b.id);
        addForce(a.id, fallback.x, fallback.y);
        addForce(b.id, -fallback.x, -fallback.y);
        continue;
      }

      const dist = Math.sqrt(distSq);
      const overlapRatio = (minDistance - dist) / minDistance;
      const pushStrength = overlapRatio * overlapRatio * 1.35;
      const nx = dx / dist;
      const ny = dy / dist;
      addForce(a.id, nx * pushStrength, ny * pushStrength);
      addForce(b.id, -nx * pushStrength, -ny * pushStrength);
    }
  }

  forces.forEach((force, id) => {
    const magnitude = Math.hypot(force.x, force.y);
    if (magnitude <= maxForce || magnitude <= EPSILON) return;
    forces.set(id, {
      x: (force.x / magnitude) * maxForce,
      y: (force.y / magnitude) * maxForce,
    });
  });

  return forces;
}

export function constrainToNearPath(
  pos: Position,
  nearestPathPoint: Position,
  distToPath: number,
  maxDistance: number,
): Position {
  if (distToPath <= maxDistance) return pos;
  const ratio = maxDistance / distToPath;
  return {
    x: nearestPathPoint.x + (pos.x - nearestPathPoint.x) * ratio,
    y: nearestPathPoint.y + (pos.y - nearestPathPoint.y) * ratio,
  };
}

export interface StepAlongWaypointsInput {
  current: Position;
  waypoints: Position[];
  speed: number;
  deltaTime: number;
  stopDistance?: number;
}

export interface StepAlongWaypointsResult {
  pos: Position;
  reached: boolean;
  rotation: number;
  facingRight: boolean;
  /** how many waypoints were consumed (for callers that store remaining) */
  waypointsConsumed: number;
}

/**
 * Walk toward a destination through a series of intermediate waypoints
 * (path nodes at bends/corners). Each tick the unit advances along the
 * polyline formed by [current, ...waypoints], consuming waypoints as it
 * reaches them.
 */
export function stepAlongWaypoints({
  current,
  waypoints,
  speed,
  deltaTime,
  stopDistance = 0,
}: StepAlongWaypointsInput): StepAlongWaypointsResult {
  if (waypoints.length === 0) {
    return {
      pos: { ...current },
      reached: true,
      rotation: 0,
      facingRight: true,
      waypointsConsumed: 0,
    };
  }

  const maxStepDistance = Math.max(0, (speed * deltaTime) / GAME_TICK_NORMALIZER);
  let remaining = maxStepDistance;
  let pos = current;
  let consumed = 0;
  let rotation = 0;
  let facingRight = true;

  for (let i = 0; i < waypoints.length && remaining > EPSILON; i++) {
    const target = waypoints[i];
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.hypot(dx, dy);

    rotation = Math.atan2(dy, dx);
    facingRight = getFacingRightFromDelta(dx, dy);

    const isLast = i === waypoints.length - 1;
    const effectiveStop = isLast ? Math.max(0, stopDistance) : 0;

    if (dist <= effectiveStop + EPSILON) {
      consumed = i + 1;
      if (isLast) {
        return { pos: { ...pos }, reached: true, rotation, facingRight, waypointsConsumed: consumed };
      }
      continue;
    }

    const availableDistance = Math.max(0, dist - effectiveStop);
    const traveled = Math.min(remaining, availableDistance);

    if (traveled <= EPSILON) {
      if (isLast) {
        return { pos: { ...pos }, reached: true, rotation, facingRight, waypointsConsumed: consumed };
      }
      continue;
    }

    const safeD = Math.max(dist, EPSILON);
    pos = {
      x: pos.x + (dx / safeD) * traveled,
      y: pos.y + (dy / safeD) * traveled,
    };
    remaining -= traveled;

    const leftover = dist - traveled;
    if (leftover <= effectiveStop + EPSILON) {
      consumed = i + 1;
      if (isLast) {
        return { pos, reached: true, rotation, facingRight, waypointsConsumed: consumed };
      }
    }
  }

  const finalTarget = waypoints[waypoints.length - 1];
  const finalDist = Math.hypot(finalTarget.x - pos.x, finalTarget.y - pos.y);
  const reached = finalDist <= Math.max(0, stopDistance) + EPSILON;

  return { pos, reached, rotation, facingRight, waypointsConsumed: consumed };
}

function computeRepulsionFromNeighbors(
  origin: Position,
  neighbors: PositionedUnit[],
  minDistance: number,
  maxForce: number = 0.9
): Position {
  if (neighbors.length === 0 || minDistance <= EPSILON) return { x: 0, y: 0 };

  let fx = 0;
  let fy = 0;
  const minDistSq = minDistance * minDistance;

  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i];
    const dx = origin.x - neighbor.pos.x;
    const dy = origin.y - neighbor.pos.y;
    const distSq = dx * dx + dy * dy;
    if (distSq >= minDistSq) continue;

    if (distSq <= EPSILON) {
      const angle = (i * 2.399963229728653) % (Math.PI * 2);
      fx += Math.cos(angle);
      fy += Math.sin(angle);
      continue;
    }

    const dist = Math.sqrt(distSq);
    const overlapRatio = (minDistance - dist) / minDistance;
    const pushStrength = overlapRatio * overlapRatio;
    fx += (dx / dist) * pushStrength;
    fy += (dy / dist) * pushStrength;
  }

  const magnitude = Math.hypot(fx, fy);
  if (magnitude <= EPSILON) return { x: 0, y: 0 };
  if (magnitude <= maxForce) return { x: fx, y: fy };
  return { x: (fx / magnitude) * maxForce, y: (fy / magnitude) * maxForce };
}
