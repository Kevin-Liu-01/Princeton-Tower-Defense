import type { Position } from "../../types";

export function normalizeSignedAngle(angle: number) {
  let normalized = angle;
  while (normalized > Math.PI) normalized -= Math.PI * 2;
  while (normalized < -Math.PI) normalized += Math.PI * 2;
  return normalized;
}

export function resolveWeaponRotation(
  targetPos: Position | undefined,
  originX: number,
  originY: number,
  fallbackRotation: number,
  forwardOffset: number,
  maxTurn: number = Math.PI,
) {
  if (!targetPos) return fallbackRotation;
  const desiredRotation =
    Math.atan2(targetPos.y - originY, targetPos.x - originX) + forwardOffset;
  const delta = normalizeSignedAngle(desiredRotation - fallbackRotation);
  const clampedDelta = Math.max(-maxTurn, Math.min(maxTurn, delta));
  return fallbackRotation + clampedDelta;
}
