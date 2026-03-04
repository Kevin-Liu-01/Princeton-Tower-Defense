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
  fallbackFacingRight: boolean = true
): boolean {
  if (!Number.isFinite(dx) || Math.abs(dx) <= EPSILON) return fallbackFacingRight;
  return dx >= 0;
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
  const facingRight = getFacingRightFromDelta(dx);
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

export function computeRepulsionFromNeighbors(
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
