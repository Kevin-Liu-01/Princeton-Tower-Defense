// multiPathSystem.ts
// Unified Multi-Path System for Princeton Tower Defense
// All paths are treated equally - no "main" or "secondary" distinction
// Supports hero movement, troop placement, and proper visual merging

import type { Position } from "./types";

// ============================================
// TYPES
// ============================================

export interface PathConfig {
  key: string; // Path identifier (e.g., "poe", "poe_alt")
  points: Position[]; // Grid points defining the path
  isEntrance: boolean; // Does this path have an enemy entrance?
  isExit: boolean; // Does this path lead to the exit?
}

export interface MergePoint {
  position: Position; // World position of merge
  pathKeys: string[]; // Which paths connect here
  radius: number; // Merge zone radius
}

export interface PathSegment {
  key: string;
  worldPoints: Position[];
  smoothPoints: Position[];
  leftEdge: Position[];
  rightEdge: Position[];
  screenLeft: Position[];
  screenRight: Position[];
  screenCenter: Position[];
  isEntrance: boolean;
  isExit: boolean;
}

// ============================================
// PATH COLLECTION
// ============================================

/**
 * Get all paths for a level - returns them as equals with no hierarchy
 */
export function getAllPaths(
  selectedMap: string,
  MAP_PATHS: Record<string, Position[]>,
  LEVEL_DATA: Record<string, any>
): PathConfig[] {
  const paths: PathConfig[] = [];
  const levelData = LEVEL_DATA[selectedMap];

  // Primary path
  if (MAP_PATHS[selectedMap]) {
    paths.push({
      key: selectedMap,
      points: MAP_PATHS[selectedMap],
      isEntrance: true,
      isExit: true,
    });
  }

  // Additional paths from level data
  if (levelData?.dualPath && levelData?.secondaryPath) {
    const secKey = levelData.secondaryPath;
    if (MAP_PATHS[secKey]) {
      paths.push({
        key: secKey,
        points: MAP_PATHS[secKey],
        isEntrance: true,
        isExit: false, // Typically merges with main path
      });
    }
  }

  // Support for multiple additional paths
  if (levelData?.additionalPaths) {
    for (const pathDef of levelData.additionalPaths) {
      if (MAP_PATHS[pathDef.key]) {
        paths.push({
          key: pathDef.key,
          points: MAP_PATHS[pathDef.key],
          isEntrance: pathDef.isEntrance ?? true,
          isExit: pathDef.isExit ?? false,
        });
      }
    }
  }

  return paths;
}

// ============================================
// SMOOTH PATH GENERATION
// ============================================

/**
 * Catmull-Rom spline interpolation for smooth curves
 */
function catmullRom(
  p0: Position,
  p1: Position,
  p2: Position,
  p3: Position,
  t: number
): Position {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

/**
 * Generate smooth path from control points using Catmull-Rom splines
 */
export function generateSmoothPath(controlPoints: Position[]): Position[] {
  if (controlPoints.length < 2) return controlPoints;

  const smoothPath: Position[] = [];

  // Extend endpoints for smooth start/end
  const extended = [
    {
      x: controlPoints[0].x * 2 - controlPoints[1].x,
      y: controlPoints[0].y * 2 - controlPoints[1].y,
    },
    ...controlPoints,
    {
      x:
        controlPoints[controlPoints.length - 1].x * 2 -
        controlPoints[controlPoints.length - 2].x,
      y:
        controlPoints[controlPoints.length - 1].y * 2 -
        controlPoints[controlPoints.length - 2].y,
    },
  ];

  // Generate smooth curve with 10 points per segment
  for (let i = 1; i < extended.length - 2; i++) {
    for (let j = 0; j < 10; j++) {
      smoothPath.push(
        catmullRom(
          extended[i - 1],
          extended[i],
          extended[i + 1],
          extended[i + 2],
          j / 10
        )
      );
    }
  }

  smoothPath.push(controlPoints[controlPoints.length - 1]);
  return smoothPath;
}

// ============================================
// PATH EDGE GENERATION WITH WOBBLE
// ============================================

/**
 * Create a seeded random number generator for consistent decoration
 */
function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Add organic wobble to path edges
 * Uses the SAME seed calculation for ALL paths for visual consistency
 */
export function addPathWobble(
  pathPoints: Position[],
  wobbleAmount: number,
  mapSeed: number, // Use map seed, not path-specific seed
  roadWidth: number = 38
): { left: Position[]; right: Position[]; center: Position[] } {
  // IMPORTANT: Use the same seed base for all paths
  // Only offset by a fixed value to prevent identical edges
  const seededRandom = createSeededRandom(mapSeed + 100);

  const left: Position[] = [];
  const right: Position[] = [];
  const center: Position[] = [];

  for (let i = 0; i < pathPoints.length; i++) {
    const p = pathPoints[i];

    // Calculate perpendicular direction
    let perpX = 0;
    let perpY = 1;

    if (i < pathPoints.length - 1) {
      const next = pathPoints[i + 1];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      perpX = -dy / len;
      perpY = dx / len;
    }

    // Add consistent wobble
    const leftW = (seededRandom() - 0.5) * wobbleAmount;
    const rightW = (seededRandom() - 0.5) * wobbleAmount;

    left.push({
      x: p.x + perpX * (roadWidth + leftW),
      y: p.y + perpY * (roadWidth + leftW) * 0.5, // Isometric compression
    });
    right.push({
      x: p.x - perpX * (roadWidth + rightW),
      y: p.y - perpY * (roadWidth + rightW) * 0.5,
    });
    center.push(p);
  }

  return { left, right, center };
}

// ============================================
// MERGE POINT DETECTION
// ============================================

/**
 * Find where paths merge or intersect
 */
export function findMergePoints(
  pathSegments: PathSegment[],
  threshold: number = 60
): MergePoint[] {
  const mergePoints: MergePoint[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < pathSegments.length; i++) {
    for (let j = i + 1; j < pathSegments.length; j++) {
      const pathA = pathSegments[i];
      const pathB = pathSegments[j];

      // Check endpoints for proximity
      const checkPoints = [
        { a: pathA.worldPoints[0], aEnd: "start" },
        { a: pathA.worldPoints[pathA.worldPoints.length - 1], aEnd: "end" },
      ];

      for (const checkA of checkPoints) {
        for (let bIdx = 0; bIdx < pathB.worldPoints.length; bIdx++) {
          const bPoint = pathB.worldPoints[bIdx];
          const dist = Math.sqrt(
            Math.pow(checkA.a.x - bPoint.x, 2) +
              Math.pow(checkA.a.y - bPoint.y, 2)
          );

          if (dist < threshold) {
            const key = `${Math.round(checkA.a.x)},${Math.round(checkA.a.y)}`;
            if (!processed.has(key)) {
              processed.add(key);
              mergePoints.push({
                position: {
                  x: (checkA.a.x + bPoint.x) / 2,
                  y: (checkA.a.y + bPoint.y) / 2,
                },
                pathKeys: [pathA.key, pathB.key],
                radius: 55,
              });
            }
          }
        }
      }
    }
  }

  return mergePoints;
}

/**
 * Check if a point is near any merge zone
 */
export function isNearMerge(
  pos: Position,
  mergePoints: MergePoint[],
  extraRadius: number = 20
): boolean {
  return mergePoints.some((mp) => {
    const dist = Math.sqrt(
      Math.pow(pos.x - mp.position.x, 2) + Math.pow(pos.y - mp.position.y, 2)
    );
    return dist < mp.radius + extraRadius;
  });
}

// ============================================
// UNIFIED PATH RENDERING
// ============================================

/**
 * Prepare all path segments for rendering
 * Returns unified data structure for all paths
 */
export function preparePathSegments(
  selectedMap: string,
  MAP_PATHS: Record<string, Position[]>,
  LEVEL_DATA: Record<string, any>,
  gridToWorldPath: (p: Position) => Position,
  worldToScreen: (
    p: Position,
    w: number,
    h: number,
    dpr: number,
    offset: Position,
    zoom: number
  ) => Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset: Position,
  cameraZoom: number
): { segments: PathSegment[]; mergePoints: MergePoint[] } {
  const allPaths = getAllPaths(selectedMap, MAP_PATHS, LEVEL_DATA);

  // Use a consistent seed based on map name (not path name)
  const mapSeed = selectedMap
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const toScreen = (p: Position) =>
    worldToScreen(p, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);

  const segments: PathSegment[] = [];

  for (const pathConfig of allPaths) {
    // Convert to world coordinates
    const worldPoints = pathConfig.points.map(gridToWorldPath);

    // Generate smooth path
    const smoothPoints = generateSmoothPath(worldPoints);

    // Add wobble edges - using MAP seed for consistency
    const edges = addPathWobble(smoothPoints, 10, mapSeed);

    // Convert to screen coordinates
    const screenLeft = edges.left.map(toScreen);
    const screenRight = edges.right.map(toScreen);
    const screenCenter = edges.center.map(toScreen);

    segments.push({
      key: pathConfig.key,
      worldPoints,
      smoothPoints,
      leftEdge: edges.left,
      rightEdge: edges.right,
      screenLeft,
      screenRight,
      screenCenter,
      isEntrance: pathConfig.isEntrance,
      isExit: pathConfig.isExit,
    });
  }

  // Find merge points
  const mergePoints = findMergePoints(segments);

  return { segments, mergePoints };
}

/**
 * Render all paths uniformly with proper layering
 * This replaces the separate main/secondary path rendering
 */
export function renderUnifiedPaths(
  ctx: CanvasRenderingContext2D,
  segments: PathSegment[],
  mergePoints: MergePoint[],
  theme: { path: string[]; ground: string[]; accent: string },
  cameraZoom: number,
  mapSeed: number,
  toScreen: (p: Position) => Position
) {
  const seededRandom = createSeededRandom(mapSeed + 200);

  // Helper for hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0,0,0,${alpha})`;
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(
      result[2],
      16
    )}, ${parseInt(result[3], 16)}, ${alpha})`;
  };

  // ====== LAYER 1: ALL SHADOWS ======
  // Draw all path shadows first so they layer correctly
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";

  for (const seg of segments) {
    ctx.beginPath();
    ctx.moveTo(seg.screenLeft[0].x + 4, seg.screenLeft[0].y + 4);
    for (let i = 1; i < seg.screenLeft.length; i++) {
      ctx.lineTo(seg.screenLeft[i].x + 4, seg.screenLeft[i].y + 4);
    }
    for (let i = seg.screenRight.length - 1; i >= 0; i--) {
      ctx.lineTo(seg.screenRight[i].x + 4, seg.screenRight[i].y + 4);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Merge point shadows
  for (const mp of mergePoints) {
    const screenPos = toScreen(mp.position);
    const radius = mp.radius * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + 4,
      screenPos.y + 4,
      radius,
      radius * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // ====== LAYER 2: ALL OUTER EDGES ======
  ctx.fillStyle = theme.path[2];

  for (const seg of segments) {
    ctx.beginPath();
    ctx.moveTo(seg.screenLeft[0].x, seg.screenLeft[0].y);
    for (let i = 1; i < seg.screenLeft.length; i++) {
      ctx.lineTo(seg.screenLeft[i].x, seg.screenLeft[i].y);
    }
    for (let i = seg.screenRight.length - 1; i >= 0; i--) {
      ctx.lineTo(seg.screenRight[i].x, seg.screenRight[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Merge point outer edges
  for (const mp of mergePoints) {
    const screenPos = toScreen(mp.position);
    const radius = mp.radius * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      radius,
      radius * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // ====== LAYER 3: ALL INNER ROADS ======
  ctx.fillStyle = theme.path[0];

  for (const seg of segments) {
    ctx.beginPath();
    for (let i = 0; i < seg.screenCenter.length; i++) {
      const lx =
        seg.screenCenter[i].x +
        (seg.screenLeft[i].x - seg.screenCenter[i].x) * 0.88;
      const ly =
        seg.screenCenter[i].y +
        (seg.screenLeft[i].y - seg.screenCenter[i].y) * 0.88;
      if (i === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    for (let i = seg.screenCenter.length - 1; i >= 0; i--) {
      const rx =
        seg.screenCenter[i].x +
        (seg.screenRight[i].x - seg.screenCenter[i].x) * 0.88;
      const ry =
        seg.screenCenter[i].y +
        (seg.screenRight[i].y - seg.screenCenter[i].y) * 0.88;
      ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Merge point inner
  for (const mp of mergePoints) {
    const screenPos = toScreen(mp.position);
    const radius = mp.radius * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      radius * 0.88,
      radius * 0.44,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // ====== LAYER 4: ALL TOP ROADS ======
  ctx.fillStyle = theme.path[1];

  for (const seg of segments) {
    ctx.beginPath();
    for (let i = 0; i < seg.screenCenter.length; i++) {
      const lx =
        seg.screenCenter[i].x +
        (seg.screenLeft[i].x - seg.screenCenter[i].x) * 0.72;
      const ly =
        seg.screenCenter[i].y +
        (seg.screenLeft[i].y - seg.screenCenter[i].y) * 0.72 -
        2;
      if (i === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    for (let i = seg.screenCenter.length - 1; i >= 0; i--) {
      const rx =
        seg.screenCenter[i].x +
        (seg.screenRight[i].x - seg.screenCenter[i].x) * 0.72;
      const ry =
        seg.screenCenter[i].y +
        (seg.screenRight[i].y - seg.screenCenter[i].y) * 0.72 -
        2;
      ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Merge point top layer
  for (const mp of mergePoints) {
    const screenPos = toScreen(mp.position);
    const radius = mp.radius * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - 2,
      radius * 0.72,
      radius * 0.36,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // ====== LAYER 5: TEXTURE AND DETAILS ======
  // Shared texture across ALL paths for unified look

  // Road texture patches
  ctx.fillStyle = hexToRgba(theme.ground[2], 0.12);
  for (const seg of segments) {
    for (let i = 0; i < seg.smoothPoints.length; i += 3) {
      if (i >= seg.screenCenter.length) break;
      const sp = seg.screenCenter[i];
      const patchSize = (3 + seededRandom() * 6) * cameraZoom;
      ctx.beginPath();
      ctx.ellipse(
        sp.x + (seededRandom() - 0.5) * 35 * cameraZoom,
        sp.y + (seededRandom() - 0.5) * 18 * cameraZoom,
        patchSize,
        patchSize * 0.5,
        seededRandom() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Wheel tracks on ALL paths
  ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
  ctx.lineWidth = 3 * cameraZoom;
  const trackOffset = 18 * cameraZoom;

  for (const seg of segments) {
    for (let track = -1; track <= 1; track += 2) {
      ctx.beginPath();
      for (let i = 0; i < seg.smoothPoints.length; i++) {
        const p = seg.smoothPoints[i];
        let perpX = 0;
        let perpY = 1;
        if (i < seg.smoothPoints.length - 1) {
          const next = seg.smoothPoints[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          perpX = -dy / len;
          perpY = dx / len;
        }
        const wobble = Math.sin(i * 0.5 + mapSeed) * 2;
        const screenP = toScreen({
          x: p.x + perpX * ((trackOffset * track) / cameraZoom + wobble),
          y: p.y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.5,
        });
        if (i === 0) ctx.moveTo(screenP.x, screenP.y);
        else ctx.lineTo(screenP.x, screenP.y);
      }
      ctx.stroke();
    }
  }

  // Pebbles on ALL path edges
  const pebbleRandom = createSeededRandom(mapSeed + 300);
  ctx.fillStyle = theme.path[0];

  for (const seg of segments) {
    for (let i = 0; i < seg.smoothPoints.length; i += 2) {
      if (i >= seg.screenLeft.length || pebbleRandom() > 0.5) continue;
      const side = pebbleRandom() > 0.5 ? seg.screenLeft : seg.screenRight;
      const p = side[i];
      ctx.beginPath();
      ctx.ellipse(
        p.x,
        p.y,
        (2 + pebbleRandom() * 3) * cameraZoom,
        (1.5 + pebbleRandom() * 2) * cameraZoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  return { segments, mergePoints };
}

// ============================================
// PATH NAVIGATION HELPERS
// ============================================

/**
 * Find the closest point on any path from a world position
 * Used for hero movement and troop placement
 */
export function findClosestPointOnAnyPath(
  worldPos: Position,
  segments: PathSegment[],
  hitboxSize: number = 50
): {
  onPath: boolean;
  closestPoint: Position;
  pathKey: string;
  distance: number;
} {
  let closestPoint = worldPos;
  let minDist = Infinity;
  let pathKey = "";

  for (const seg of segments) {
    for (let i = 0; i < seg.worldPoints.length - 1; i++) {
      const p1 = seg.worldPoints[i];
      const p2 = seg.worldPoints[i + 1];

      // Find closest point on line segment
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lengthSq = dx * dx + dy * dy;

      let t = 0;
      if (lengthSq > 0) {
        t = Math.max(
          0,
          Math.min(
            1,
            ((worldPos.x - p1.x) * dx + (worldPos.y - p1.y) * dy) / lengthSq
          )
        );
      }

      const closestOnSegment = {
        x: p1.x + t * dx,
        y: p1.y + t * dy,
      };

      const dist = Math.sqrt(
        Math.pow(worldPos.x - closestOnSegment.x, 2) +
          Math.pow(worldPos.y - closestOnSegment.y, 2)
      );

      if (dist < minDist) {
        minDist = dist;
        closestPoint = closestOnSegment;
        pathKey = seg.key;
      }
    }
  }

  return {
    onPath: minDist < hitboxSize,
    closestPoint,
    pathKey,
    distance: minDist,
  };
}

/**
 * Check if a position is valid for troop placement on any path
 */
export function isValidTroopPosition(
  worldPos: Position,
  segments: PathSegment[],
  mergePoints: MergePoint[],
  maxDistFromPath: number = 80
): boolean {
  // Check if near any path
  const closest = findClosestPointOnAnyPath(
    worldPos,
    segments,
    maxDistFromPath
  );
  if (!closest.onPath) return false;

  // Check if inside a merge zone (valid placement)
  if (isNearMerge(worldPos, mergePoints, 0)) return true;

  return true;
}

/**
 * Get all world points for all paths (for collision detection, etc.)
 */
export function getAllWorldPoints(segments: PathSegment[]): Position[][] {
  return segments.map((seg) => seg.worldPoints);
}

// ============================================
// FOG RENDERING FOR PATH ENDPOINTS
// ============================================

/**
 * Render fog at path endpoints (entrances/exits)
 * Skips endpoints that are merge points
 */
export function renderPathEndFogs(
  ctx: CanvasRenderingContext2D,
  segments: PathSegment[],
  mergePoints: MergePoint[],
  toScreen: (p: Position) => Position,
  theme: { ground: string[] },
  cameraZoom: number
) {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const fogBaseRgb = hexToRgb(theme.ground[2]);

  const drawRoadEndFog = (
    endPos: Position,
    towardsPos: Position,
    size: number
  ) => {
    const time = Date.now() / 4000;
    const dx = endPos.x - towardsPos.x;
    const dy = endPos.y - towardsPos.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const dirX = len > 0 ? dx / len : 1;
    const dirY = len > 0 ? dy / len : 0;

    for (let layer = 0; layer < 8; layer++) {
      const layerDist = (layer - 2) * size * 0.2;
      const layerX = towardsPos.x + dirX * layerDist;
      const layerY = towardsPos.y + dirY * layerDist * 0.5;
      const layerSize = size * (0.8 + layer * 0.1);
      const layerAlpha = Math.min(0.9, layer * 0.12);

      const animX = Math.sin(time + layer * 0.5) * 4 * cameraZoom;
      const animY = Math.cos(time * 0.7 + layer * 0.3) * 2 * cameraZoom;

      const fogGradient = ctx.createRadialGradient(
        layerX + animX,
        layerY + animY,
        0,
        layerX + animX,
        layerY + animY,
        layerSize * cameraZoom
      );
      fogGradient.addColorStop(
        0,
        `rgba(${fogBaseRgb.r}, ${fogBaseRgb.g}, ${fogBaseRgb.b}, ${layerAlpha})`
      );
      fogGradient.addColorStop(
        0.3,
        `rgba(${fogBaseRgb.r + 4}, ${fogBaseRgb.g + 4}, ${fogBaseRgb.b + 4}, ${
          layerAlpha * 0.75
        })`
      );
      fogGradient.addColorStop(
        0.6,
        `rgba(${fogBaseRgb.r + 8}, ${fogBaseRgb.g + 8}, ${fogBaseRgb.b + 8}, ${
          layerAlpha * 0.4
        })`
      );
      fogGradient.addColorStop(
        1,
        `rgba(${fogBaseRgb.r + 12}, ${fogBaseRgb.g + 12}, ${
          fogBaseRgb.b + 12
        }, 0)`
      );

      ctx.fillStyle = fogGradient;
      ctx.beginPath();
      ctx.ellipse(
        layerX + animX,
        layerY + animY,
        layerSize * cameraZoom,
        layerSize * 0.5 * cameraZoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Wispy cloud puffs
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time * 0.15;
      const dist = size * 0.5 + Math.sin(time + i) * size * 0.1;
      const puffX = endPos.x + Math.cos(angle) * dist * cameraZoom * 0.6;
      const puffY = endPos.y + Math.sin(angle) * dist * 0.3 * cameraZoom;
      const puffSize =
        (size * 0.35 + Math.sin(time * 1.5 + i * 1.2) * size * 0.1) *
        cameraZoom;

      const puffGradient = ctx.createRadialGradient(
        puffX,
        puffY,
        0,
        puffX,
        puffY,
        puffSize
      );
      puffGradient.addColorStop(
        0,
        `rgba(${fogBaseRgb.r + 20}, ${fogBaseRgb.g + 18}, ${
          fogBaseRgb.b + 14
        }, 0.5)`
      );
      puffGradient.addColorStop(
        0.5,
        `rgba(${fogBaseRgb.r + 15}, ${fogBaseRgb.g + 14}, ${
          fogBaseRgb.b + 10
        }, 0.25)`
      );
      puffGradient.addColorStop(
        1,
        `rgba(${fogBaseRgb.r + 10}, ${fogBaseRgb.g + 10}, ${
          fogBaseRgb.b + 8
        }, 0)`
      );

      ctx.fillStyle = puffGradient;
      ctx.beginPath();
      ctx.ellipse(puffX, puffY, puffSize, puffSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Draw fog at path entrances/exits (but not at merge points)
  for (const seg of segments) {
    const firstWorld = seg.worldPoints[0];
    const secondWorld = seg.worldPoints[1];
    const lastWorld = seg.worldPoints[seg.worldPoints.length - 1];
    const secondLastWorld = seg.worldPoints[seg.worldPoints.length - 2];

    // Entrance fog (if this is an entrance and not a merge point)
    if (seg.isEntrance && !isNearMerge(firstWorld, mergePoints)) {
      const firstScreen = toScreen(firstWorld);
      const secondScreen = toScreen(secondWorld);
      drawRoadEndFog(firstScreen, secondScreen, 120);
    }

    // Exit fog (if this is an exit and not a merge point)
    if (seg.isExit && !isNearMerge(lastWorld, mergePoints)) {
      const lastScreen = toScreen(lastWorld);
      const secondLastScreen = toScreen(secondLastWorld);
      drawRoadEndFog(lastScreen, secondLastScreen, 120);
    }
  }
}
