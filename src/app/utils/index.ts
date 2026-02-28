import type {
  Position,
  GridPosition,
  Tower,
  TowerType,
  EnemyType,
  HeroType,
  Troop,
} from "../types";
import {
  TILE_SIZE,
  MAP_PATHS,
  TOWER_COLORS,
  TROOP_SPREAD_RADIUS,
  ROAD_EXCLUSION_BUFFER,
} from "../constants";

// Grid to world coordinates (isometric) - centers on tile
export function gridToWorld(pos: GridPosition): Position {
  return {
    x: (pos.x + 0.5) * TILE_SIZE,
    y: (pos.y + 0.5) * TILE_SIZE,
  };
}

// Grid to world coordinates for path waypoints (at corners/intersections)
export function gridToWorldPath(pos: GridPosition): Position {
  return {
    x: pos.x * TILE_SIZE,
    y: pos.y * TILE_SIZE,
  };
}

// World to screen coordinates (with isometric projection)
export function worldToScreen(
  pos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): Position {
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const zoom = cameraZoom || 1;
  const offset = cameraOffset || { x: 0, y: 0 };

  // Isometric projection
  const isoX = (pos.x - pos.y) * 0.5;
  const isoY = (pos.x + pos.y) * 0.25;

  // Apply camera offset and zoom, then center
  return {
    x: (isoX + offset.x) * zoom + width / 2,
    y: (isoY + offset.y) * zoom + height / 3,
  };
}

// Screen to world coordinates (inverse of worldToScreen) - FIXED for camera
export function screenToWorld(
  screenPos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): Position {
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const zoom = cameraZoom || 1;
  const offset = cameraOffset || { x: 0, y: 0 };

  // Reverse the screen transformation
  // First remove center offset, then divide by zoom, then subtract camera offset
  const isoX = (screenPos.x - width / 2) / zoom - offset.x;
  const isoY = (screenPos.y - height / 3) / zoom - offset.y;

  // Reverse isometric projection
  // isoX = (x - y) * 0.5  =>  x - y = isoX * 2
  // isoY = (x + y) * 0.25 =>  x + y = isoY * 4
  const worldX = isoX + isoY * 2;
  const worldY = isoY * 2 - isoX;

  return { x: worldX, y: worldY };
}

// Screen to grid coordinates - FIXED for camera and tile centers
export function screenToGrid(
  screenPos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): GridPosition {
  const worldPos = screenToWorld(
    screenPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  // Round to nearest tile (tiles are centered at +0.5)
  return {
    x: Math.floor(worldPos.x / TILE_SIZE),
    y: Math.floor(worldPos.y / TILE_SIZE),
  };
}

// Distance between two points
export function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Distance from point to line segment
export function distanceToLineSegment(
  point: Position,
  lineStart: Position,
  lineEnd: Position
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Closest point on line segment
export function closestPointOnLine(
  point: Position,
  lineStart: Position,
  lineEnd: Position
): Position {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;
  param = Math.max(0, Math.min(1, param));

  return {
    x: lineStart.x + param * C,
    y: lineStart.y + param * D,
  };
}

// Get enemy position along path (uses path waypoints, not tile centers)
// Includes lane offset for spreading enemies across the road width
export function getEnemyPosition(
  enemy: { pathIndex: number; progress: number; laneOffset?: number },
  mapKey: string
): Position {
  const path = MAP_PATHS[mapKey];
  if (!path || path.length < 2) return { x: 0, y: 0 };

  const currentIndex = Math.min(enemy.pathIndex, path.length - 1);
  const nextIndex = Math.min(currentIndex + 1, path.length - 1);

  const current = gridToWorldPath(path[currentIndex]);
  const next = gridToWorldPath(path[nextIndex]);

  // Base position along path
  const baseX = current.x + (next.x - current.x) * enemy.progress;
  const baseY = current.y + (next.y - current.y) * enemy.progress;

  // Calculate perpendicular offset for lane spreading
  const laneOffset = enemy.laneOffset || 0;
  const roadWidth = 25; // How far enemies can spread from center

  // Get direction of current path segment
  const dx = next.x - current.x;
  const dy = next.y - current.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len > 0) {
    // Perpendicular vector (rotated 90 degrees)
    const perpX = -dy / len;
    const perpY = dx / len;

    return {
      x: baseX + perpX * laneOffset * roadWidth,
      y: baseY + perpY * laneOffset * roadWidth,
    };
  }

  return { x: baseX, y: baseY };
}

// Landmark decoration types that should block tower placement
export const LANDMARK_DECORATION_TYPES = new Set([
  "pyramid",
  "sphinx",
  "giant_sphinx",
  "nassau_hall",
  "ice_fortress",
  "obsidian_castle",
  "witch_cottage",
  "ruined_temple",
  "sunken_pillar",
  "carnegie_lake",
  "frozen_waterfall",
  "frozen_gate",
  "aurora_crystal",
  "cobra_statue",
  "hieroglyph_wall",
  "sarcophagus",
  "lava_fall",
  "obsidian_pillar",
  "skull_throne",
  "volcano_rim",
  "idol_statue",
  "gate",
]);

// Vertical offset for landmark hitboxes (in scale units). Tall structures like pyramids
// draw upward from their base—the hitbox center is shifted up so hovering the visible
// body triggers the tooltip instead of requiring a hover near the ground.
export const LANDMARK_HITBOX_Y_OFFSET: Record<string, number> = {
  pyramid: 55,
  sphinx: 45,
  giant_sphinx: 60,
  nassau_hall: 50,
  ice_fortress: 55,
  obsidian_castle: 55,
  witch_cottage: 30,
  statue: 22,
  demon_statue: 22,
  obelisk: 35,
};

// Check if position is valid for building
export function isValidBuildPosition(
  gridPos: GridPosition,
  mapKey: string,
  towers: Tower[],
  gridWidth: number,
  gridHeight: number,
  buffer: number = ROAD_EXCLUSION_BUFFER,
  blockedPositions?: Set<string>
): boolean {
  // Check bounds
  if (
    gridPos.x < 0 ||
    gridPos.x >= gridWidth ||
    gridPos.y < 0 ||
    gridPos.y >= gridHeight
  ) {
    return false;
  }

  // Check existing towers
  for (const tower of towers) {
    if (tower.pos.x === gridPos.x && tower.pos.y === gridPos.y) {
      return false;
    }
  }

  // Check blocked positions (landmarks and special towers)
  if (blockedPositions?.has(`${gridPos.x},${gridPos.y}`)) {
    return false;
  }

  // Check path collision with buffer zone
  const path = MAP_PATHS[mapKey];
  // check secondary paths as well
  const secondaryPaths = MAP_PATHS[`${mapKey}_b`];

  const worldPos = gridToWorld(gridPos);

  if (secondaryPaths) {
    for (let i = 0; i < secondaryPaths.length - 1; i++) {
      const p1 = gridToWorldPath(secondaryPaths[i]);
      const p2 = gridToWorldPath(secondaryPaths[i + 1]);
      if (distanceToLineSegment(worldPos, p1, p2) < buffer) {
        return false;
      }
    }
  }

  for (let i = 0; i < path.length - 1; i++) {
    // Use gridToWorldPath for path waypoints (corners/intersections)
    const p1 = gridToWorldPath(path[i]);
    const p2 = gridToWorldPath(path[i + 1]);
    if (distanceToLineSegment(worldPos, p1, p2) < buffer) {
      return false;
    }
  }

  return true;
}

// Generate unique ID
let idCounter = 0;
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${idCounter++}`;
}

// Color utilities
export function getTowerColor(type: TowerType): string {
  return TOWER_COLORS[type].base;
}

export function getTowerColorDark(type: TowerType): string {
  return TOWER_COLORS[type].dark;
}

export function getTowerAccentColor(type: TowerType): string {
  return TOWER_COLORS[type].accent;
}

export function getEnemyColor(type: EnemyType): string {
  const colors: Record<EnemyType, string> = {
    frosh: "#4ade80",
    sophomore: "#60a5fa",
    junior: "#c084fc",
    senior: "#f472b6",
    gradstudent: "#fb923c",
    professor: "#ef4444",
    dean: "#a855f7",
    trustee: "#eab308",
    mascot: "#22d3d3",
  };
  return colors[type];
}

export function getHeroColor(type: HeroType): string {
  const colors: Record<HeroType, string> = {
    tiger: "#f97316",
    tenor: "#8b5cf6",
    mathey: "#6366f1",
    rocky: "#78716c",
    scott: "#14b8a6",
  };
  return colors[type];
}

export function lightenColor(color: string, amount: number): string {
  // Handle rgb format
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = Math.min(255, parseInt(matches[0]) + amount);
      const g = Math.min(255, parseInt(matches[1]) + amount);
      const b = Math.min(255, parseInt(matches[2]) + amount);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  // Handle hex format
  const hex = color.replace("#", "");
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export function darkenColor(color: string, amount: number): string {
  // Handle rgb format
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = Math.max(0, parseInt(matches[0]) - amount);
      const g = Math.max(0, parseInt(matches[1]) - amount);
      const b = Math.max(0, parseInt(matches[2]) - amount);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  // Handle hex format
  const hex = color.replace("#", "");
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}

// Find non-overlapping position for troops
export function findNonOverlappingPosition(
  basePos: Position,
  existingTroops: { pos: Position }[],
  minDistance: number = TROOP_SPREAD_RADIUS,
  maxAttempts: number = 30
): Position {
  // If no existing troops, return base position
  if (existingTroops.length === 0) return basePos;

  // Check if base position is valid
  let baseValid = true;
  for (const troop of existingTroops) {
    if (distance(basePos, troop.pos) < minDistance) {
      baseValid = false;
      break;
    }
  }
  if (baseValid) return basePos;

  // Try positions in a spiral pattern
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const angle = (attempt / maxAttempts) * Math.PI * 6; // Spiral out more
    const radius = minDistance * (1 + attempt * 0.25);
    const testPos = {
      x: basePos.x + Math.cos(angle) * radius,
      y: basePos.y + Math.sin(angle) * radius,
    };

    // Check if this position is far enough from all existing troops
    let valid = true;
    for (const troop of existingTroops) {
      if (distance(testPos, troop.pos) < minDistance) {
        valid = false;
        break;
      }
    }
    if (valid) return testPos;
  }

  // Fallback: return position offset by index using golden angle
  const index = existingTroops.length;
  const angle = (index * 137.508 * Math.PI) / 180; // Golden angle in radians
  return {
    x: basePos.x + Math.cos(angle) * minDistance * (1.5 + index * 0.3),
    y: basePos.y + Math.sin(angle) * minDistance * (1.5 + index * 0.3),
  };
}

// Lerp utility
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Get the length of a path segment in world units
export function getPathSegmentLength(
  pathIndex: number,
  mapKey: string
): number {
  const path = MAP_PATHS[mapKey];
  if (!path || pathIndex < 0 || pathIndex >= path.length - 1) return TILE_SIZE;
  
  const p1 = gridToWorldPath(path[pathIndex]);
  const p2 = gridToWorldPath(path[pathIndex + 1]);
  return distance(p1, p2);
}

// Clamp utility
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Ease functions
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Normalize angle to 0-2PI
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

// Convert hex to rgb
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return { r: 0, g: 0, b: 0 };
  }

  return { r, g, b };
}

// Convert hex to rgba
export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Calculate projectile start position from elevated tower
export function getProjectileOrigin(
  towerPos: Position,
  targetPos: Position,
  towerHeight: number,
  rotation: number
): Position {
  // Calculate the offset based on tower height and direction to target
  const barrelLength = 18;
  const elevationOffset = towerHeight * 0.8;

  return {
    x: towerPos.x + Math.cos(rotation) * barrelLength,
    y: towerPos.y + Math.sin(rotation) * barrelLength - elevationOffset,
  };
}

// Calculate arc height for projectiles based on distance
export function calculateProjectileArc(
  from: Position,
  to: Position,
  baseHeight: number = 30
): number {
  const dist = distance(from, to);
  return Math.min(baseHeight + dist * 0.15, 80);
}

// Check if point is on screen
export function isOnScreen(
  worldPos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  margin: number = 100
): boolean {
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;

  return (
    screenPos.x >= -margin &&
    screenPos.x <= width + margin &&
    screenPos.y >= -margin &&
    screenPos.y <= height + margin
  );
}

// ============================================================================
// TROOP MOVEMENT UTILITIES
// ============================================================================

/**
 * Find the closest point on the entire path to a given world position
 */
export function findClosestPathPoint(
  worldPos: Position,
  mapKey: string
): { point: Position; distance: number; segmentIndex: number } | null {
  const path = MAP_PATHS[mapKey];
  const secondaryPath = MAP_PATHS[`${mapKey}_b`];
  
  let fullPath = path ? [...path] : [];
  if (secondaryPath) {
    fullPath = fullPath.concat(secondaryPath);
  }
  
  if (fullPath.length < 2) return null;

  let closestPoint = worldPos;
  let minDist = Infinity;
  let closestSegmentIndex = 0;

  for (let i = 0; i < fullPath.length - 1; i++) {
    const p1 = gridToWorldPath(fullPath[i]);
    const p2 = gridToWorldPath(fullPath[i + 1]);
    const point = closestPointOnLine(worldPos, p1, p2);
    const dist = distance(worldPos, point);
    if (dist < minDist) {
      minDist = dist;
      closestPoint = point;
      closestSegmentIndex = i;
    }
  }

  return { point: closestPoint, distance: minDist, segmentIndex: closestSegmentIndex };
}

/**
 * Find the closest point on path that's within a certain radius of an anchor point
 * Used for troops that can only move within a specific range
 */
export function findClosestPathPointWithinRadius(
  worldPos: Position,
  anchorPos: Position,
  radius: number,
  mapKey: string
): { point: Position; isValid: boolean; clampedToRadius: boolean } | null {
  const pathResult = findClosestPathPoint(worldPos, mapKey);
  if (!pathResult) return null;

  const distFromAnchor = distance(pathResult.point, anchorPos);
  
  // If the closest path point is within radius, it's valid
  if (distFromAnchor <= radius) {
    return { point: pathResult.point, isValid: true, clampedToRadius: false };
  }

  // Otherwise, we need to find the closest point on path that IS within the radius
  // Walk along the path and find the intersection with the radius circle
  const path = MAP_PATHS[mapKey];
  const secondaryPath = MAP_PATHS[`${mapKey}_b`];
  
  let fullPath = path ? [...path] : [];
  if (secondaryPath) {
    fullPath = fullPath.concat(secondaryPath);
  }

  let bestPoint: Position | null = null;
  let bestDist = Infinity;

  for (let i = 0; i < fullPath.length - 1; i++) {
    const p1 = gridToWorldPath(fullPath[i]);
    const p2 = gridToWorldPath(fullPath[i + 1]);
    
    // Find intersections of this segment with the radius circle
    const intersections = lineCircleIntersection(p1, p2, anchorPos, radius);
    
    for (const intersection of intersections) {
      // Check if this intersection is closer to our target position
      const distToTarget = distance(intersection, worldPos);
      if (distToTarget < bestDist) {
        bestDist = distToTarget;
        bestPoint = intersection;
      }
    }
    
    // Also check if the segment endpoints are within radius
    if (distance(p1, anchorPos) <= radius) {
      const distToTarget = distance(p1, worldPos);
      if (distToTarget < bestDist) {
        bestDist = distToTarget;
        bestPoint = p1;
      }
    }
    if (distance(p2, anchorPos) <= radius) {
      const distToTarget = distance(p2, worldPos);
      if (distToTarget < bestDist) {
        bestDist = distToTarget;
        bestPoint = p2;
      }
    }
  }

  if (bestPoint) {
    return { point: bestPoint, isValid: true, clampedToRadius: true };
  }

  // No valid point found within radius
  return { point: pathResult.point, isValid: false, clampedToRadius: false };
}

/**
 * Find intersection points between a line segment and a circle
 */
export function lineCircleIntersection(
  p1: Position,
  p2: Position,
  center: Position,
  radius: number
): Position[] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - center.x;
  const fy = p1.y - center.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  const discriminant = b * b - 4 * a * c;
  
  if (discriminant < 0) return [];
  
  const intersections: Position[] = [];
  const sqrtDisc = Math.sqrt(discriminant);
  
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  if (t1 >= 0 && t1 <= 1) {
    intersections.push({
      x: p1.x + t1 * dx,
      y: p1.y + t1 * dy,
    });
  }

  if (t2 >= 0 && t2 <= 1 && Math.abs(t1 - t2) > 0.0001) {
    intersections.push({
      x: p1.x + t2 * dx,
      y: p1.y + t2 * dy,
    });
  }

  return intersections;
}

/**
 * Calculate the movement info for a selected unit
 */
export interface TroopMoveInfo {
  anchorPos: Position;
  moveRadius: number;
  canMoveAnywhere: boolean; // For heroes
  ownerType: 'station' | 'barracks' | 'spell' | 'hero' | 'hero_summon';
  ownerId: string;
}

// Default ranges for different troop types
const STATION_TROOP_RANGE = 280; // Dinky Station base range (increased)
const BARRACKS_TROOP_RANGE = 220; // Frontier Barracks range (increased)
const SPELL_TROOP_RANGE = 200; // Reinforcement spell range
const HERO_SUMMON_RANGE = 180; // Captain's rally range

export function getTroopMoveInfo(
  troop: Troop,
  towers: { id: string; type: string; pos: { x: number; y: number } }[],
  specialTower?: { type: string; pos: { x: number; y: number } }
): TroopMoveInfo {
  // Check if owned by a dinky station
  const station = towers.find((t) => t.id === troop.ownerId && t.type === 'station');
  if (station) {
    return {
      anchorPos: gridToWorld(station.pos),
      moveRadius: STATION_TROOP_RANGE,
      canMoveAnywhere: false,
      ownerType: 'station',
      ownerId: station.id,
    };
  }

  // Check if owned by frontier barracks (special building)
  if (troop.ownerId === 'special_barracks' && specialTower?.type === 'barracks') {
    return {
      anchorPos: gridToWorld(specialTower.pos),
      moveRadius: BARRACKS_TROOP_RANGE,
      canMoveAnywhere: false,
      ownerType: 'barracks',
      ownerId: 'special_barracks',
    };
  }

  // Check if owned by hero (captain's rally ability)
  if (troop.ownerId.startsWith('hero-')) {
    return {
      anchorPos: troop.spawnPoint || troop.pos,
      moveRadius: troop.moveRadius || HERO_SUMMON_RANGE,
      canMoveAnywhere: false,
      ownerType: 'hero_summon',
      ownerId: troop.ownerId,
    };
  }

  // Spell-spawned troops (reinforcements)
  if (troop.ownerId === 'spell') {
    return {
      anchorPos: troop.spawnPoint || troop.pos,
      moveRadius: troop.moveRadius || SPELL_TROOP_RANGE,
      canMoveAnywhere: false,
      ownerType: 'spell',
      ownerId: 'spell',
    };
  }

  // Default fallback
  return {
    anchorPos: troop.spawnPoint || troop.pos,
    moveRadius: troop.moveRadius || SPELL_TROOP_RANGE,
    canMoveAnywhere: false,
    ownerType: 'spell',
    ownerId: troop.ownerId,
  };
}
