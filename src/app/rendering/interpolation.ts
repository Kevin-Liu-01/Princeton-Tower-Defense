import type { Position } from "../types";

// ============================================================================
// FIXED TIMESTEP CONSTANTS
// ============================================================================

export const FIXED_TIMESTEP_MS = 16.67;
export const MAX_PHYSICS_STEPS = 4;

// ============================================================================
// RENDER POSITION SMOOTHING
// ============================================================================

interface SmoothedPos {
  x: number;
  y: number;
  lastUpdate: number;
}

const smoothedPositions = new Map<string, SmoothedPos>();

const SMOOTHING_SPEED = 18;
const SNAP_DISTANCE_SQ = 10_000;
const STALE_MS = 2000;

let lastCleanup = 0;
const CLEANUP_INTERVAL = 5000;

/**
 * Return a smoothed screen position for the given entity.
 * On first call (or after a large teleport) the position snaps immediately.
 * Subsequent calls exponentially interpolate toward the target at a
 * frame-rate-independent rate.
 */
export function getSmoothedScreenPos(
  id: string,
  targetX: number,
  targetY: number,
  frameDtSec: number
): Position {
  const now = performance.now();
  const existing = smoothedPositions.get(id);

  if (!existing) {
    smoothedPositions.set(id, { lastUpdate: now, x: targetX, y: targetY });
    return { x: targetX, y: targetY };
  }

  const dx = targetX - existing.x;
  const dy = targetY - existing.y;
  const distSq = dx * dx + dy * dy;

  if (distSq > SNAP_DISTANCE_SQ) {
    existing.x = targetX;
    existing.y = targetY;
    existing.lastUpdate = now;
    return { x: targetX, y: targetY };
  }

  const t = 1 - Math.exp(-SMOOTHING_SPEED * frameDtSec);
  existing.x += dx * t;
  existing.y += dy * t;
  existing.lastUpdate = now;

  return { x: existing.x, y: existing.y };
}

export function removeSmoothedPos(id: string): void {
  smoothedPositions.delete(id);
}

export function cleanupStalePositions(): void {
  const now = performance.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  lastCleanup = now;

  const cutoff = now - STALE_MS;
  for (const [id, entry] of smoothedPositions) {
    if (entry.lastUpdate < cutoff) {
      smoothedPositions.delete(id);
    }
  }
}

// ============================================================================
// FRAME DELTA (set once per frame from game loop, read by renderers)
// ============================================================================

let currentFrameDtSec = 1 / 60;

export function setFrameDt(dtMs: number): void {
  currentFrameDtSec = Math.max(0.001, dtMs / 1000);
}

export function getFrameDtSec(): number {
  return currentFrameDtSec;
}
