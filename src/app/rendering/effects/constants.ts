/**
 * Minimum alpha floor for active status effects so they never fully vanish
 * while the debuff is still applied. The fade-out formula transitions from
 * full strength → this floor over the last FADE_WINDOW seconds.
 */
export const MIN_STATUS_EFFECT_ALPHA = 0.35;

/** Seconds before expiry during which the effect begins fading toward the floor. */
export const STATUS_FADE_WINDOW_SECS = 2;

/**
 * Compute alpha for a timed status effect that fades gracefully toward a
 * visible floor instead of reaching zero.
 *
 * - At full remaining time: returns 1
 * - During the last `fadeWindow` seconds: lerps from 1 → `floor`
 * - Never drops below `floor` while the status is active
 */
export function statusEffectAlpha(
  remainingMs: number,
  floor = MIN_STATUS_EFFECT_ALPHA,
  fadeWindowSecs = STATUS_FADE_WINDOW_SECS
): number {
  const remaining = remainingMs / 1000;
  const t = Math.min(1, remaining / fadeWindowSecs);
  return floor + (1 - floor) * t;
}
