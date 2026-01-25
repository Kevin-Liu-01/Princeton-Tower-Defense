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

// Check if position is valid for building
export function isValidBuildPosition(
  gridPos: GridPosition,
  mapKey: string,
  towers: Tower[],
  gridWidth: number,
  gridHeight: number,
  buffer: number = ROAD_EXCLUSION_BUFFER
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

// Convert hex to rgba
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
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
