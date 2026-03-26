import type { Tower, TowerType, TowerUpgrade, GridPosition, Position } from "../types";
import { TOWER_DATA } from "./towers";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_SIZE,
  TOWER_PLACEMENT_BUFFER,
} from "./gameplay";
import { LEVEL_DATA } from "./maps";
import { getLevelPaths, getLevelUniquePathSegments } from "./pathing";
import {
  gridToWorld,
  gridToWorldPath,
  distanceToLineSegment,
  isValidBuildPosition,
} from "../utils";
import { getBlockedPositionsForMap, getLevelAllowedTowers } from "../game/setup/levelState";

// =============================================================================
// Seeded PRNG for deterministic placement per map
// =============================================================================

function createSeededRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let s = h >>> 0;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

// =============================================================================
// Position scoring — evaluates how "strategic" a grid cell is
// =============================================================================

interface ScoredPosition {
  pos: GridPosition;
  minPathDist: number;
  pathSegmentsInRange: number;
  nearBend: boolean;
  nearIntersection: boolean;
}

const TOWER_EFFECTIVE_RANGE = 220;
const MIN_TOWER_SPACING = 2.2;
const TARGET_TOWER_COUNT_BASE = 16;
const TARGET_TOWER_COUNT_PER_PATH = 4;

function scoreCandidatePositions(
  mapKey: string,
  blockedPositions: Set<string>,
  allowedTowers: TowerType[] | null,
): ScoredPosition[] {
  const segments = getLevelUniquePathSegments(mapKey);
  const paths = getLevelPaths(mapKey);

  const bendNodes = new Set<string>();
  for (const { points } of paths) {
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      if (!prev || !curr || !next) continue;
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;
      const cross = Math.abs(dx1 * dy2 - dy1 * dx2);
      if (cross > 0.1) {
        bendNodes.add(`${Math.round(curr.x)},${Math.round(curr.y)}`);
      }
    }
  }

  const intersectionNodes = new Set<string>();
  if (paths.length > 1) {
    const nodeCount = new Map<string, number>();
    for (const { points } of paths) {
      for (const p of points) {
        const key = `${Math.round(p.x)},${Math.round(p.y)}`;
        nodeCount.set(key, (nodeCount.get(key) ?? 0) + 1);
      }
    }
    for (const [key, count] of nodeCount) {
      if (count > 1) intersectionNodes.add(key);
    }
  }

  const scored: ScoredPosition[] = [];
  const margin = 2;

  for (let gx = -margin; gx < GRID_WIDTH + margin; gx++) {
    for (let gy = -margin; gy < GRID_HEIGHT + margin; gy++) {
      const gridPos: GridPosition = { x: gx, y: gy };

      if (blockedPositions.has(`${gx},${gy}`)) continue;

      const testType: TowerType = allowedTowers?.[0] ?? "cannon";
      if (!isValidBuildPosition(gridPos, mapKey, [], GRID_WIDTH, GRID_HEIGHT, TOWER_PLACEMENT_BUFFER, blockedPositions, testType)) {
        continue;
      }

      const worldPos = gridToWorld(gridPos);
      let minDist = Infinity;
      let segmentsInRange = 0;

      for (const seg of segments) {
        const p1 = gridToWorldPath(seg.start);
        const p2 = gridToWorldPath(seg.end);
        const dist = distanceToLineSegment(worldPos, p1, p2);
        if (dist < minDist) minDist = dist;
        if (dist < TOWER_EFFECTIVE_RANGE) segmentsInRange++;
      }

      if (minDist < TOWER_PLACEMENT_BUFFER || minDist > TOWER_EFFECTIVE_RANGE * 1.8) {
        continue;
      }

      const nearBend = Array.from(bendNodes).some((key) => {
        const [bx, by] = key.split(",").map(Number);
        const bWorld: Position = { x: bx! * TILE_SIZE, y: by! * TILE_SIZE };
        const dx = worldPos.x - bWorld.x;
        const dy = worldPos.y - bWorld.y;
        return Math.sqrt(dx * dx + dy * dy) < TILE_SIZE * 5;
      });

      const nearIntersection = Array.from(intersectionNodes).some((key) => {
        const [ix, iy] = key.split(",").map(Number);
        const iWorld: Position = { x: ix! * TILE_SIZE, y: iy! * TILE_SIZE };
        const dx = worldPos.x - iWorld.x;
        const dy = worldPos.y - iWorld.y;
        return Math.sqrt(dx * dx + dy * dy) < TILE_SIZE * 5;
      });

      scored.push({
        pos: gridPos,
        minPathDist: minDist,
        pathSegmentsInRange: segmentsInRange,
        nearBend,
        nearIntersection,
      });
    }
  }

  return scored;
}

// =============================================================================
// Tower role assignment — decides what tower type to place at each position
// =============================================================================

type TowerRole =
  | "blocker"      // station — near chokepoints
  | "backline_aoe" // mortar — far from path
  | "damage"       // cannon — medium range
  | "cc"           // library — near bends
  | "energy"       // lab — spread out
  | "multitarget"  // arch — spread out
  | "economy";     // club — near clusters for boosting

const ROLE_TO_TYPE: Record<TowerRole, TowerType> = {
  blocker: "station",
  backline_aoe: "mortar",
  damage: "cannon",
  cc: "library",
  energy: "lab",
  multitarget: "arch",
  economy: "club",
};

interface PlacementSlot {
  pos: GridPosition;
  role: TowerRole;
  level: 1 | 2 | 3 | 4;
  upgrade?: TowerUpgrade;
}

function countRole(roles: TowerRole[], role: TowerRole): number {
  let n = 0;
  for (const r of roles) if (r === role) n++;
  return n;
}

function assignRole(
  scored: ScoredPosition,
  rng: () => number,
  existingRoles: TowerRole[],
  targetCount: number,
): TowerRole {
  const mortarCount = countRole(existingRoles, "backline_aoe");
  const labCount = countRole(existingRoles, "energy");
  const total = existingRoles.length;
  const mortarTarget = Math.max(3, Math.round(targetCount * 0.18));
  const labTarget = Math.max(3, Math.round(targetCount * 0.18));

  // Mortars: far positions are always mortars, but also force some at medium range
  if (scored.minPathDist > TOWER_EFFECTIVE_RANGE * 1.0) {
    return "backline_aoe";
  }
  if (mortarCount < mortarTarget && scored.minPathDist > TILE_SIZE * 1.8 && rng() < 0.55) {
    return "backline_aoe";
  }

  // Labs: proactively assign when under-represented
  if (labCount < labTarget && scored.minPathDist > TILE_SIZE * 1.2 && rng() < 0.5) {
    return "energy";
  }

  // Stations at chokepoints
  if ((scored.nearBend || scored.nearIntersection) && scored.minPathDist < TILE_SIZE * 2.5) {
    const blockerCount = countRole(existingRoles, "blocker");
    if (blockerCount < 3 && rng() < 0.6) return "blocker";
  }

  // Libraries at bends with good coverage
  if (scored.nearBend && scored.pathSegmentsInRange >= 2) {
    const ccCount = countRole(existingRoles, "cc");
    if (ccCount < 3 && rng() < 0.5) return "cc";
  }

  // High-coverage spots: mix of types
  if (scored.pathSegmentsInRange >= 3) {
    const r = rng();
    if (r < 0.3) return "multitarget";
    if (r < 0.55) return "energy";
    return "damage";
  }

  // Generic fallback — balanced distribution
  const roll = rng();
  if (roll < 0.22) return "damage";
  if (roll < 0.44) return "energy";
  if (roll < 0.62) return "backline_aoe";
  if (roll < 0.80) return "multitarget";
  return "damage";
}

function assignLevel(
  role: TowerRole,
  rng: () => number,
  placedCount: number,
  totalTarget: number,
): { level: 1 | 2 | 3 | 4; upgrade?: TowerUpgrade } {
  const progress = placedCount / Math.max(totalTarget, 1);
  const roll = rng();

  if (role === "economy") {
    if (roll < 0.3) return { level: 4, upgrade: "A" };
    if (roll < 0.6) return { level: 4, upgrade: "B" };
    return { level: 3 };
  }

  if (role === "backline_aoe") {
    if (roll < 0.35) return { level: 4, upgrade: "A" };
    if (roll < 0.55) return { level: 4, upgrade: "B" };
    if (roll < 0.8) return { level: 3 };
    return { level: 2 };
  }

  if (role === "blocker") {
    if (roll < 0.3) return { level: 4, upgrade: rng() < 0.5 ? "A" : "B" };
    if (roll < 0.65) return { level: 3 };
    return { level: 2 };
  }

  if (progress > 0.7) {
    if (roll < 0.15) return { level: 4, upgrade: rng() < 0.5 ? "A" : "B" };
    if (roll < 0.45) return { level: 3 };
    if (roll < 0.8) return { level: 2 };
    return { level: 1 };
  }

  if (roll < 0.1) return { level: 4, upgrade: rng() < 0.5 ? "A" : "B" };
  if (roll < 0.35) return { level: 3 };
  if (roll < 0.7) return { level: 2 };
  return { level: 1 };
}

// =============================================================================
// Main placement builder
// =============================================================================

function isTooCloseToExisting(
  pos: GridPosition,
  existing: GridPosition[],
  minSpacing: number,
): boolean {
  for (const other of existing) {
    const dx = pos.x - other.x;
    const dy = pos.y - other.y;
    if (Math.sqrt(dx * dx + dy * dy) < minSpacing) return true;
  }
  return false;
}

function filterByAllowedTowers(
  slots: PlacementSlot[],
  allowed: TowerType[] | null,
): PlacementSlot[] {
  if (!allowed) return slots;
  const allowedSet = new Set(allowed);
  return slots.filter((s) => allowedSet.has(ROLE_TO_TYPE[s.role]));
}

function buildPhotoModePlacementsForMap(mapKey: string): Tower[] {
  const rng = createSeededRng(`photo-${mapKey}-v3`);
  const blockedPositions = getBlockedPositionsForMap(mapKey);
  const allowedTowers = getLevelAllowedTowers(mapKey);
  const paths = getLevelPaths(mapKey);

  if (paths.length === 0) return [];

  const candidates = scoreCandidatePositions(mapKey, blockedPositions, allowedTowers);
  if (candidates.length === 0) return [];

  const targetCount = TARGET_TOWER_COUNT_BASE + (paths.length - 1) * TARGET_TOWER_COUNT_PER_PATH;

  candidates.sort((a, b) => {
    const scoreA = a.pathSegmentsInRange * 3
      + (a.nearBend ? 5 : 0)
      + (a.nearIntersection ? 4 : 0)
      - Math.abs(a.minPathDist - TILE_SIZE * 1.5) * 0.02;
    const scoreB = b.pathSegmentsInRange * 3
      + (b.nearBend ? 5 : 0)
      + (b.nearIntersection ? 4 : 0)
      - Math.abs(b.minPathDist - TILE_SIZE * 1.5) * 0.02;
    return scoreB - scoreA;
  });

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const shuffleWindow = Math.min(8, i);
    if (Math.abs(i - j) <= shuffleWindow) {
      [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
    }
  }

  const placedPositions: GridPosition[] = [];
  const placedRoles: TowerRole[] = [];
  const slots: PlacementSlot[] = [];
  let economyCount = 0;

  for (const candidate of candidates) {
    if (slots.length >= targetCount) break;

    if (isTooCloseToExisting(candidate.pos, placedPositions, MIN_TOWER_SPACING)) {
      continue;
    }

    const placedTowers: Tower[] = placedPositions.map((p, i) => ({
      id: `temp-${i}`,
      type: ROLE_TO_TYPE[placedRoles[i]!],
      pos: p,
      level: 1 as const,
      lastAttack: 0,
      rotation: 0,
    }));

    const testType = allowedTowers?.[0] ?? "cannon";
    if (!isValidBuildPosition(
      candidate.pos, mapKey, placedTowers, GRID_WIDTH, GRID_HEIGHT,
      TOWER_PLACEMENT_BUFFER, blockedPositions, testType,
    )) {
      continue;
    }

    let role = assignRole(candidate, rng, placedRoles, targetCount);

    if (economyCount < 2 && slots.length > 4 && slots.length % 6 === 0) {
      role = "economy";
      economyCount++;
    }

    if (allowedTowers && !allowedTowers.includes(ROLE_TO_TYPE[role])) {
      const fallback = allowedTowers[Math.floor(rng() * allowedTowers.length)];
      if (!fallback) continue;
      const reverseMap: Partial<Record<TowerType, TowerRole>> = {
        station: "blocker",
        mortar: "backline_aoe",
        cannon: "damage",
        library: "cc",
        lab: "energy",
        arch: "multitarget",
        club: "economy",
      };
      role = reverseMap[fallback] ?? "damage";
    }

    const levelInfo = assignLevel(role, rng, slots.length, targetCount);

    slots.push({
      pos: candidate.pos,
      role,
      level: levelInfo.level,
      upgrade: levelInfo.upgrade,
    });
    placedPositions.push(candidate.pos);
    placedRoles.push(role);
  }

  return convertSlotsToTowers(slots, rng, mapKey);
}

function convertSlotsToTowers(
  slots: PlacementSlot[],
  rng: () => number,
  _mapKey: string,
): Tower[] {
  return slots.map((slot, idx) => {
    const type = ROLE_TO_TYPE[slot.role];
    const isStation = type === "station";

    const rotation = type === "cannon"
      ? rng() * Math.PI * 2
      : type === "mortar"
        ? -Math.PI / 2 + (rng() - 0.5) * 0.4
        : 0;

    const tower: Tower = {
      id: `photo-${type}-${idx}`,
      type,
      pos: slot.pos,
      level: slot.level,
      upgrade: slot.upgrade,
      lastAttack: 0,
      rotation,
      spawnRange: isStation ? TOWER_DATA.station.spawnRange : undefined,
      occupiedSpawnSlots: isStation ? [false, false, false] : undefined,
      pendingRespawns: isStation ? [] : undefined,
      mortarAutoAim: type === "mortar" ? true : undefined,
    };

    return tower;
  });
}

// =============================================================================
// Public API — build photo mode towers for any level
// =============================================================================

const photoModeCache = new Map<string, Tower[]>();

export function buildPhotoModeTowers(mapKey: string): Tower[] {
  const cached = photoModeCache.get(mapKey);
  if (cached) return cached.map((t) => ({ ...t }));

  const levelData = LEVEL_DATA[mapKey];
  if (!levelData) return [];

  const towers = buildPhotoModePlacementsForMap(mapKey);
  photoModeCache.set(mapKey, towers);
  return towers.map((t) => ({ ...t }));
}

export function clearPhotoModeCache(): void {
  photoModeCache.clear();
}
