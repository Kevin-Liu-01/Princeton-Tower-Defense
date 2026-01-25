// Princeton Tower Defense - Path Rendering Module
// Renders the map path/road with smooth curves and decorative details

import type { Position } from "../../types";
import { TILE_SIZE, MAP_PATHS, LEVEL_DATA, REGION_THEMES } from "../../constants";
import { worldToScreen, gridToWorld, distanceToLineSegment } from "../../utils";
import { colorWithAlpha } from "../helpers";

// ============================================================================
// PATH MATH HELPERS
// ============================================================================

// Catmull-Rom spline interpolation for smooth curves
export function catmullRom(
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

// Generate smooth curve from control points using Catmull-Rom splines
export function generateSmoothPath(controlPoints: Position[]): Position[] {
  if (controlPoints.length < 2) return controlPoints;
  const smoothPath: Position[] = [];
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

// Seeded random number generator for consistent decoration
export function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// Calculate smoothed perpendicular direction at a point by averaging neighbors
function getSmoothedPerpendicular(
  pathPoints: Position[],
  index: number,
  lookAhead: number = 3
): { perpX: number; perpY: number } {
  let avgPerpX = 0;
  let avgPerpY = 0;
  let count = 0;

  // Sample perpendiculars from neighboring segments and average them
  for (let offset = -lookAhead; offset <= lookAhead; offset++) {
    const i = Math.max(0, Math.min(pathPoints.length - 2, index + offset));
    const next = Math.min(i + 1, pathPoints.length - 1);
    
    const dx = pathPoints[next].x - pathPoints[i].x;
    const dy = pathPoints[next].y - pathPoints[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len > 0.001) {
      // Weight closer samples more heavily
      const weight = 1 / (1 + Math.abs(offset) * 0.5);
      avgPerpX += (-dy / len) * weight;
      avgPerpY += (dx / len) * weight;
      count += weight;
    }
  }

  if (count > 0) {
    avgPerpX /= count;
    avgPerpY /= count;
    // Normalize the averaged perpendicular
    const len = Math.sqrt(avgPerpX * avgPerpX + avgPerpY * avgPerpY);
    if (len > 0.001) {
      avgPerpX /= len;
      avgPerpY /= len;
    }
  } else {
    avgPerpX = 0;
    avgPerpY = 1;
  }

  return { perpX: avgPerpX, perpY: avgPerpY };
}

// Add organic wobble to path edges with consistent thickness at turns
export function addPathWobble(
  pathPoints: Position[],
  wobbleAmount: number,
  seededRandom: () => number,
  pathWidth: number = 38
): { left: Position[]; right: Position[]; center: Position[] } {
  const left: Position[] = [];
  const right: Position[] = [];
  const center: Position[] = [];
  
  for (let i = 0; i < pathPoints.length; i++) {
    const p = pathPoints[i];
    
    // Use smoothed perpendicular for consistent thickness at corners
    const { perpX, perpY } = getSmoothedPerpendicular(pathPoints, i, 4);
    
    // Reduce wobble at corners (where direction changes significantly)
    let cornerFactor = 1.0;
    if (i > 0 && i < pathPoints.length - 1) {
      const prev = pathPoints[i - 1];
      const next = pathPoints[i + 1];
      const dx1 = p.x - prev.x;
      const dy1 = p.y - prev.y;
      const dx2 = next.x - p.x;
      const dy2 = next.y - p.y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (len1 > 0.001 && len2 > 0.001) {
        // Dot product to detect corners
        const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
        // Reduce wobble when turning (dot < 1 means turning)
        cornerFactor = 0.3 + 0.7 * Math.max(0, dot);
      }
    }
    
    const leftW = (seededRandom() - 0.5) * wobbleAmount * cornerFactor;
    const rightW = (seededRandom() - 0.5) * wobbleAmount * cornerFactor;
    
    left.push({
      x: p.x + perpX * (pathWidth + leftW),
      y: p.y + perpY * (pathWidth + leftW) * 0.5,
    });
    right.push({
      x: p.x - perpX * (pathWidth + rightW),
      y: p.y - perpY * (pathWidth + rightW) * 0.5,
    });
    center.push(p);
  }
  return { left, right, center };
}

// Helper to convert grid position to world position for path
export function gridToWorldPath(gridPos: Position): Position {
  return {
    x: (gridPos.x + gridPos.y) * (TILE_SIZE / 2),
    y: (gridPos.y - gridPos.x) * (TILE_SIZE / 4),
  };
}

// Helper function to parse hex color to rgba
export function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================================
// MAIN PATH RENDERING
// ============================================================================

export interface PathRenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  dpr: number;
  cameraOffset: Position;
  cameraZoom: number;
  selectedMap: string;
}

export function renderPath(context: PathRenderContext): void {
  const { ctx, canvas, dpr, cameraOffset, cameraZoom, selectedMap } = context;
  
  const path = MAP_PATHS[selectedMap];
  if (!path || path.length < 2) return;
  
  const levelData = LEVEL_DATA[selectedMap];
  const mapTheme = levelData?.theme || "grassland";
  const theme = REGION_THEMES[mapTheme];
  
  // Get map seed for consistent random
  const mapSeed = selectedMap
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seededRandom = createSeededRandom(mapSeed + 100);
  
  // Convert path to world coordinates
  const pathWorldPoints = path.map((p) => gridToWorldPath(p));
  
  // Generate smooth path
  const smoothPath = generateSmoothPath(pathWorldPoints);
  
  // Add organic wobble
  const { left: pathLeft, right: pathRight, center: pathCenter } = 
    addPathWobble(smoothPath, 10, seededRandom);
  
  // Helper to convert to screen coordinates
  const toScreen = (p: Position) =>
    worldToScreen(
      p,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
  
  const screenCenter = smoothPath.map(toScreen);
  const screenLeft = pathLeft.map(toScreen);
  const screenRight = pathRight.map(toScreen);
  
  // Shadow layer
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.moveTo(screenLeft[0].x + 4, screenLeft[0].y + 4);
  for (let i = 1; i < screenLeft.length; i++)
    ctx.lineTo(screenLeft[i].x + 4, screenLeft[i].y + 4);
  for (let i = screenRight.length - 1; i >= 0; i--)
    ctx.lineTo(screenRight[i].x + 4, screenRight[i].y + 4);
  ctx.closePath();
  ctx.fill();
  
  // Main road edge - themed
  ctx.fillStyle = theme.path[2];
  ctx.beginPath();
  ctx.moveTo(screenLeft[0].x, screenLeft[0].y);
  for (let i = 1; i < screenLeft.length; i++)
    ctx.lineTo(screenLeft[i].x, screenLeft[i].y);
  for (let i = screenRight.length - 1; i >= 0; i--)
    ctx.lineTo(screenRight[i].x, screenRight[i].y);
  ctx.closePath();
  ctx.fill();
  
  // Inner road - themed
  ctx.fillStyle = theme.path[0];
  ctx.beginPath();
  for (let i = 0; i < screenCenter.length; i++) {
    const lx =
      screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * 0.88;
    const ly =
      screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * 0.88;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx =
      screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.88;
    const ry =
      screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.88;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Top road layer - themed
  ctx.fillStyle = theme.path[1];
  ctx.beginPath();
  for (let i = 0; i < screenCenter.length; i++) {
    const lx =
      screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * 0.72;
    const ly =
      screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * 0.72 - 2;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx =
      screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.72;
    const ry =
      screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.72 - 2;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Road texture patches - themed
  const textureRandom = createSeededRandom(mapSeed + 200);
  ctx.fillStyle = hexToRgba(theme.ground[2], 0.12);
  for (let i = 0; i < smoothPath.length; i += 3) {
    if (i >= screenCenter.length) break;
    const sp = screenCenter[i];
    const patchSize = (3 + textureRandom() * 6) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      sp.x + (textureRandom() - 0.5) * 35 * cameraZoom,
      sp.y + (textureRandom() - 0.5) * 18 * cameraZoom,
      patchSize,
      patchSize * 0.5,
      textureRandom() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Wheel tracks - themed
  ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
  ctx.lineWidth = 3 * cameraZoom;
  const trackOffset = 18 * cameraZoom;
  for (let track = -1; track <= 1; track += 2) {
    ctx.beginPath();
    for (let i = 0; i < smoothPath.length; i++) {
      const p = smoothPath[i];
      let perpX = 0;
      let perpY = 1;
      if (i < smoothPath.length - 1) {
        const next = smoothPath[i + 1];
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
  
  // Pebbles on edges - themed
  const pebbleRandom = createSeededRandom(mapSeed + 300);
  ctx.fillStyle = theme.path[0];
  for (let i = 0; i < smoothPath.length; i += 2) {
    if (i >= screenLeft.length || pebbleRandom() > 0.5) continue;
    const side = pebbleRandom() > 0.5 ? screenLeft : screenRight;
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

// ============================================================================
// SECONDARY PATH RENDERING (For dual-path levels)
// ============================================================================

export function renderSecondaryPath(context: PathRenderContext): void {
  const { ctx, canvas, dpr, cameraOffset, cameraZoom, selectedMap } = context;
  
  const levelData = LEVEL_DATA[selectedMap];
  if (!levelData?.dualPath || !levelData?.secondaryPath) return;
  
  const secondaryPathKey = levelData.secondaryPath;
  const secondaryPath = MAP_PATHS[secondaryPathKey];
  if (!secondaryPath || secondaryPath.length < 2) return;
  
  const mapTheme = levelData?.theme || "grassland";
  const theme = REGION_THEMES[mapTheme];
  
  // Get map seed for consistent random
  const mapSeed = selectedMap
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seededRandom = createSeededRandom(mapSeed + 150);
  
  // Convert path to world coordinates
  const secondaryPathWorldPoints = secondaryPath.map((p) => gridToWorldPath(p));
  
  // Generate smooth path
  const smoothSecondaryPath = generateSmoothPath(secondaryPathWorldPoints);
  
  // Add organic wobble
  const { left: secPathLeft, right: secPathRight, center: secPathCenter } = 
    addPathWobble(smoothSecondaryPath, 10, seededRandom);
  
  // Helper to convert to screen coordinates
  const toScreen = (p: Position) =>
    worldToScreen(
      p,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
  
  const secScreenCenter = secPathCenter.map(toScreen);
  const secScreenLeft = secPathLeft.map(toScreen);
  const secScreenRight = secPathRight.map(toScreen);
  
  // Shadow layer
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.moveTo(secScreenLeft[0].x + 4, secScreenLeft[0].y + 4);
  for (let i = 1; i < secScreenLeft.length; i++)
    ctx.lineTo(secScreenLeft[i].x + 4, secScreenLeft[i].y + 4);
  for (let i = secScreenRight.length - 1; i >= 0; i--)
    ctx.lineTo(secScreenRight[i].x + 4, secScreenRight[i].y + 4);
  ctx.closePath();
  ctx.fill();
  
  // Main road edge
  ctx.fillStyle = theme.path[2];
  ctx.beginPath();
  ctx.moveTo(secScreenLeft[0].x, secScreenLeft[0].y);
  for (let i = 1; i < secScreenLeft.length; i++)
    ctx.lineTo(secScreenLeft[i].x, secScreenLeft[i].y);
  for (let i = secScreenRight.length - 1; i >= 0; i--)
    ctx.lineTo(secScreenRight[i].x, secScreenRight[i].y);
  ctx.closePath();
  ctx.fill();
  
  // Inner road
  ctx.fillStyle = theme.path[0];
  ctx.beginPath();
  for (let i = 0; i < secScreenCenter.length; i++) {
    const lx =
      secScreenCenter[i].x +
      (secScreenLeft[i].x - secScreenCenter[i].x) * 0.88;
    const ly =
      secScreenCenter[i].y +
      (secScreenLeft[i].y - secScreenCenter[i].y) * 0.88;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = secScreenCenter.length - 1; i >= 0; i--) {
    const rx =
      secScreenCenter[i].x +
      (secScreenRight[i].x - secScreenCenter[i].x) * 0.88;
    const ry =
      secScreenCenter[i].y +
      (secScreenRight[i].y - secScreenCenter[i].y) * 0.88;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Top road layer
  ctx.fillStyle = theme.path[1];
  ctx.beginPath();
  for (let i = 0; i < secScreenCenter.length; i++) {
    const lx =
      secScreenCenter[i].x +
      (secScreenLeft[i].x - secScreenCenter[i].x) * 0.92;
    const ly =
      secScreenCenter[i].y +
      (secScreenLeft[i].y - secScreenCenter[i].y) * 0.92 -
      2;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = secScreenCenter.length - 1; i >= 0; i--) {
    const rx =
      secScreenCenter[i].x +
      (secScreenRight[i].x - secScreenCenter[i].x) * 0.92;
    const ry =
      secScreenCenter[i].y +
      (secScreenRight[i].y - secScreenCenter[i].y) * 0.92 -
      2;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Wheel tracks
  ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
  ctx.lineWidth = 3 * cameraZoom;
  const trackOffset = 18 * cameraZoom;
  for (let track = -1; track <= 1; track += 2) {
    ctx.beginPath();
    for (let i = 0; i < smoothSecondaryPath.length; i++) {
      const p = smoothSecondaryPath[i];
      let perpX = 0;
      let perpY = 1;
      if (i < smoothSecondaryPath.length - 1) {
        const next = smoothSecondaryPath[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        perpX = -dy / len;
        perpY = dx / len;
      }
      const wobble = Math.sin(i * 0.5 + mapSeed) * 2;
      const screenP = toScreen({
        x: p.x + perpX * ((trackOffset * track) / cameraZoom + wobble),
        y:
          p.y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.5,
      });
      if (i === 0) ctx.moveTo(screenP.x, screenP.y);
      else ctx.lineTo(screenP.x, screenP.y);
    }
    ctx.stroke();
  }
  
  // Pebbles on edges
  const pebbleRandom = createSeededRandom(mapSeed + 350);
  ctx.fillStyle = theme.path[0];
  for (let i = 0; i < smoothSecondaryPath.length; i += 2) {
    if (i >= secScreenLeft.length || pebbleRandom() > 0.5) continue;
    const side = pebbleRandom() > 0.5 ? secScreenLeft : secScreenRight;
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

// Export helper functions for use in other modules
export { createSeededRandom as seededRandom };
