import type { Position } from "../types";

export function normalizeSignedAngle(angle: number): number {
  let normalized = angle;
  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }
  while (normalized < -Math.PI) {
    normalized += Math.PI * 2;
  }
  return normalized;
}

export function resolveWeaponRotation(
  targetPos: Position | undefined,
  originX: number,
  originY: number,
  fallbackRotation: number,
  forwardOffset: number,
  maxTurn: number = Math.PI,
  absoluteRange?: readonly [number, number]
): number {
  if (!targetPos) {
    if (absoluteRange) {
      return Math.max(
        absoluteRange[0],
        Math.min(absoluteRange[1], fallbackRotation)
      );
    }
    return fallbackRotation;
  }

  const targetAngle = Math.atan2(targetPos.y - originY, targetPos.x - originX);
  const desiredRotation = targetAngle + forwardOffset;
  const delta = normalizeSignedAngle(desiredRotation - fallbackRotation);
  const clampedDelta = Math.max(-maxTurn, Math.min(maxTurn, delta));
  let result = fallbackRotation + clampedDelta;

  if (absoluteRange) {
    result = Math.max(absoluteRange[0], Math.min(absoluteRange[1], result));
  }

  return result;
}

/**
 * Absolute rotation bounds by weapon category.
 * Angles are in radians relative to canvas rotation (0 = up, PI/2 = right).
 * These prevent weapons from rotating past natural holding positions.
 */
export const WEAPON_LIMITS = {
  bow: [-Math.PI * 0.75, Math.PI * 0.25] as const,
  lance: [-Math.PI * 0.6, Math.PI * 0.5] as const,
  leftTool: [-Math.PI * 0.85, Math.PI * 0.55] as const,
  rifle: [-Math.PI * 0.92, Math.PI * 0.92] as const,
  rightArm: [-Math.PI * 0.55, Math.PI * 0.82] as const,
  rightMelee: [-Math.PI * 0.55, Math.PI * 0.88] as const,
  rightPole: [-Math.PI * 0.6, Math.PI * 0.85] as const,
} as const;
