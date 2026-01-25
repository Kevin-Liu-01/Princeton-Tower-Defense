// Princeton Tower Defense - Path Rendering Module
// Renders the map path/road with smooth curves and decorative details

import type { Position } from "../../types";
import { TILE_SIZE, MAP_PATHS, LEVEL_DATA, REGION_THEMES } from "../../constants";
import { worldToScreen } from "../../utils";

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
  pathWidth: number = 42
): { left: Position[]; right: Position[]; center: Position[] } {
  const left: Position[] = [];
  const right: Position[] = [];
  const center: Position[] = [];
  
  // First pass: calculate corner factors for all points
  const cornerFactors: number[] = [];
  for (let i = 0; i < pathPoints.length; i++) {
    let cornerFactor = 1.0;
    if (i > 0 && i < pathPoints.length - 1) {
      const prev = pathPoints[i - 1];
      const p = pathPoints[i];
      const next = pathPoints[i + 1];
      const dx1 = p.x - prev.x;
      const dy1 = p.y - prev.y;
      const dx2 = next.x - p.x;
      const dy2 = next.y - p.y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (len1 > 0.001 && len2 > 0.001) {
        const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
        // Smoother corner detection with gradual falloff
        cornerFactor = 0.2 + 0.8 * Math.pow(Math.max(0, (dot + 1) / 2), 0.5);
      }
    }
    cornerFactors.push(cornerFactor);
  }
  
  // Smooth corner factors across neighbors
  const smoothedFactors = cornerFactors.map((f, i) => {
    let sum = f * 2;
    let count = 2;
    for (let j = 1; j <= 3; j++) {
      if (i - j >= 0) { sum += cornerFactors[i - j]; count++; }
      if (i + j < cornerFactors.length) { sum += cornerFactors[i + j]; count++; }
    }
    return sum / count;
  });
  
  for (let i = 0; i < pathPoints.length; i++) {
    const p = pathPoints[i];
    
    // Use smoothed perpendicular for consistent thickness at corners
    const { perpX, perpY } = getSmoothedPerpendicular(pathPoints, i, 5);
    
    // Use smoothed corner factor
    const cornerFactor = smoothedFactors[i];
    
    // Subtle wobble that doesn't affect width much
    const wobbleMag = wobbleAmount * cornerFactor * 0.5;
    const leftW = (seededRandom() - 0.5) * wobbleMag;
    const rightW = (seededRandom() - 0.5) * wobbleMag;
    
    // Keep consistent width - the perpendicular offset defines the edge
    // Use 0.75 for Y to make paths in the X direction wider (matching Y direction paths better)
    left.push({
      x: p.x + perpX * (pathWidth + leftW),
      y: p.y + perpY * (pathWidth + leftW) * 0.75,
    });
    right.push({
      x: p.x - perpX * (pathWidth + rightW),
      y: p.y - perpY * (pathWidth + rightW) * 0.75,
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
  
  // Generate smooth path with more sample points for better corners
  const smoothPath = generateSmoothPath(pathWorldPoints);
  
  // Add organic wobble with consistent width
  const { left: pathLeft, right: pathRight } = 
    addPathWobble(smoothPath, 6, seededRandom, 44);
  
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
  
  // Shadow layer - softer, larger offset
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.moveTo(screenLeft[0].x + 6, screenLeft[0].y + 6);
  for (let i = 1; i < screenLeft.length; i++)
    ctx.lineTo(screenLeft[i].x + 6, screenLeft[i].y + 6);
  for (let i = screenRight.length - 1; i >= 0; i--)
    ctx.lineTo(screenRight[i].x + 6, screenRight[i].y + 6);
  ctx.closePath();
  ctx.fill();
  
  // Main road edge - themed (outer border)
  ctx.fillStyle = theme.path[2];
  ctx.beginPath();
  ctx.moveTo(screenLeft[0].x, screenLeft[0].y);
  for (let i = 1; i < screenLeft.length; i++)
    ctx.lineTo(screenLeft[i].x, screenLeft[i].y);
  for (let i = screenRight.length - 1; i >= 0; i--)
    ctx.lineTo(screenRight[i].x, screenRight[i].y);
  ctx.closePath();
  ctx.fill();
  
  // Inner road layer 1 - base
  ctx.fillStyle = theme.path[0];
  ctx.beginPath();
  for (let i = 0; i < screenCenter.length; i++) {
    const lx = screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * 0.9;
    const ly = screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * 0.9;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx = screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.9;
    const ry = screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.9;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Top road layer - main walking surface
  ctx.fillStyle = theme.path[1];
  ctx.beginPath();
  for (let i = 0; i < screenCenter.length; i++) {
    const lx = screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * 0.75;
    const ly = screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * 0.75 - 1;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx = screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.75;
    const ry = screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.75 - 1;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Road texture - dirt patches and wear marks
  const textureRandom = createSeededRandom(mapSeed + 200);
  ctx.fillStyle = hexToRgba(theme.ground[2], 0.08);
  for (let i = 0; i < smoothPath.length; i += 2) {
    if (i >= screenCenter.length) break;
    const sp = screenCenter[i];
    const patchSize = (4 + textureRandom() * 8) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      sp.x + (textureRandom() - 0.5) * 40 * cameraZoom,
      sp.y + (textureRandom() - 0.5) * 20 * cameraZoom,
      patchSize,
      patchSize * 0.5,
      textureRandom() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Center line detail - worn path
  ctx.strokeStyle = hexToRgba(theme.path[0], 0.15);
  ctx.lineWidth = 8 * cameraZoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < screenCenter.length; i++) {
    if (i === 0) ctx.moveTo(screenCenter[i].x, screenCenter[i].y - 1);
    else ctx.lineTo(screenCenter[i].x, screenCenter[i].y - 1);
  }
  ctx.stroke();
  
  // Wheel tracks - subtle parallel lines
  ctx.strokeStyle = hexToRgba(theme.path[2], 0.12);
  ctx.lineWidth = 2.5 * cameraZoom;
  ctx.lineCap = "round";
  const trackOffset = 16 * cameraZoom;
  for (let track = -1; track <= 1; track += 2) {
    ctx.beginPath();
    for (let i = 0; i < smoothPath.length; i++) {
      const { perpX, perpY } = getSmoothedPerpendicular(smoothPath, i, 3);
      const wobble = Math.sin(i * 0.3 + mapSeed) * 1.5;
      const screenP = toScreen({
        x: smoothPath[i].x + perpX * ((trackOffset * track) / cameraZoom + wobble),
        y: smoothPath[i].y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.5,
      });
      if (i === 0) ctx.moveTo(screenP.x, screenP.y);
      else ctx.lineTo(screenP.x, screenP.y);
    }
    ctx.stroke();
  }
  
  // Edge stones/pebbles - decorative border
  const pebbleRandom = createSeededRandom(mapSeed + 300);
  for (let i = 0; i < smoothPath.length; i += 3) {
    if (i >= screenLeft.length) continue;
    if (pebbleRandom() > 0.6) continue;
    
    // Left edge stones
    ctx.fillStyle = hexToRgba(theme.path[2], 0.4);
    const lp = screenLeft[i];
    const lpSize = (2 + pebbleRandom() * 4) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(lp.x, lp.y, lpSize, lpSize * 0.6, pebbleRandom() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    
    // Right edge stones
    if (pebbleRandom() > 0.4) {
      const rp = screenRight[i];
      const rpSize = (2 + pebbleRandom() * 4) * cameraZoom;
      ctx.fillStyle = hexToRgba(theme.path[0], 0.5);
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, rpSize, rpSize * 0.6, pebbleRandom() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Scattered gravel on path surface
  const gravelRandom = createSeededRandom(mapSeed + 400);
  ctx.fillStyle = hexToRgba(theme.path[2], 0.2);
  for (let i = 0; i < smoothPath.length; i += 4) {
    if (i >= screenCenter.length) break;
    for (let j = 0; j < 3; j++) {
      if (gravelRandom() > 0.5) continue;
      const sp = screenCenter[i];
      const offsetX = (gravelRandom() - 0.5) * 30 * cameraZoom;
      const offsetY = (gravelRandom() - 0.5) * 15 * cameraZoom;
      const size = (1 + gravelRandom() * 2) * cameraZoom;
      ctx.beginPath();
      ctx.arc(sp.x + offsetX, sp.y + offsetY, size, 0, Math.PI * 2);
      ctx.fill();
    }
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
  
  // Add organic wobble with consistent width
  const { left: secPathLeft, right: secPathRight } = 
    addPathWobble(smoothSecondaryPath, 6, seededRandom, 44);
  
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
  
  const secScreenCenter = smoothSecondaryPath.map(toScreen);
  const secScreenLeft = secPathLeft.map(toScreen);
  const secScreenRight = secPathRight.map(toScreen);
  
  // Shadow layer
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.moveTo(secScreenLeft[0].x + 6, secScreenLeft[0].y + 6);
  for (let i = 1; i < secScreenLeft.length; i++)
    ctx.lineTo(secScreenLeft[i].x + 6, secScreenLeft[i].y + 6);
  for (let i = secScreenRight.length - 1; i >= 0; i--)
    ctx.lineTo(secScreenRight[i].x + 6, secScreenRight[i].y + 6);
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
  
  // Inner road layer 1
  ctx.fillStyle = theme.path[0];
  ctx.beginPath();
  for (let i = 0; i < secScreenCenter.length; i++) {
    const lx = secScreenCenter[i].x + (secScreenLeft[i].x - secScreenCenter[i].x) * 0.9;
    const ly = secScreenCenter[i].y + (secScreenLeft[i].y - secScreenCenter[i].y) * 0.9;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = secScreenCenter.length - 1; i >= 0; i--) {
    const rx = secScreenCenter[i].x + (secScreenRight[i].x - secScreenCenter[i].x) * 0.9;
    const ry = secScreenCenter[i].y + (secScreenRight[i].y - secScreenCenter[i].y) * 0.9;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Top road layer
  ctx.fillStyle = theme.path[1];
  ctx.beginPath();
  for (let i = 0; i < secScreenCenter.length; i++) {
    const lx = secScreenCenter[i].x + (secScreenLeft[i].x - secScreenCenter[i].x) * 0.75;
    const ly = secScreenCenter[i].y + (secScreenLeft[i].y - secScreenCenter[i].y) * 0.75 - 1;
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  }
  for (let i = secScreenCenter.length - 1; i >= 0; i--) {
    const rx = secScreenCenter[i].x + (secScreenRight[i].x - secScreenCenter[i].x) * 0.75;
    const ry = secScreenCenter[i].y + (secScreenRight[i].y - secScreenCenter[i].y) * 0.75 - 1;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  
  // Road texture
  const textureRandom = createSeededRandom(mapSeed + 250);
  ctx.fillStyle = hexToRgba(theme.ground[2], 0.08);
  for (let i = 0; i < smoothSecondaryPath.length; i += 2) {
    if (i >= secScreenCenter.length) break;
    const sp = secScreenCenter[i];
    const patchSize = (4 + textureRandom() * 8) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(
      sp.x + (textureRandom() - 0.5) * 40 * cameraZoom,
      sp.y + (textureRandom() - 0.5) * 20 * cameraZoom,
      patchSize,
      patchSize * 0.5,
      textureRandom() * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Center line detail
  ctx.strokeStyle = hexToRgba(theme.path[0], 0.15);
  ctx.lineWidth = 8 * cameraZoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < secScreenCenter.length; i++) {
    if (i === 0) ctx.moveTo(secScreenCenter[i].x, secScreenCenter[i].y - 1);
    else ctx.lineTo(secScreenCenter[i].x, secScreenCenter[i].y - 1);
  }
  ctx.stroke();
  
  // Wheel tracks
  ctx.strokeStyle = hexToRgba(theme.path[2], 0.12);
  ctx.lineWidth = 2.5 * cameraZoom;
  ctx.lineCap = "round";
  const trackOffset = 16 * cameraZoom;
  for (let track = -1; track <= 1; track += 2) {
    ctx.beginPath();
    for (let i = 0; i < smoothSecondaryPath.length; i++) {
      const { perpX, perpY } = getSmoothedPerpendicular(smoothSecondaryPath, i, 3);
      const wobble = Math.sin(i * 0.3 + mapSeed + 50) * 1.5;
      const screenP = toScreen({
        x: smoothSecondaryPath[i].x + perpX * ((trackOffset * track) / cameraZoom + wobble),
        y: smoothSecondaryPath[i].y + perpY * ((trackOffset * track) / cameraZoom + wobble) * 0.5,
      });
      if (i === 0) ctx.moveTo(screenP.x, screenP.y);
      else ctx.lineTo(screenP.x, screenP.y);
    }
    ctx.stroke();
  }
  
  // Edge stones
  const pebbleRandom = createSeededRandom(mapSeed + 350);
  for (let i = 0; i < smoothSecondaryPath.length; i += 3) {
    if (i >= secScreenLeft.length) continue;
    if (pebbleRandom() > 0.6) continue;
    
    ctx.fillStyle = hexToRgba(theme.path[2], 0.4);
    const lp = secScreenLeft[i];
    const lpSize = (2 + pebbleRandom() * 4) * cameraZoom;
    ctx.beginPath();
    ctx.ellipse(lp.x, lp.y, lpSize, lpSize * 0.6, pebbleRandom() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    
    if (pebbleRandom() > 0.4) {
      const rp = secScreenRight[i];
      const rpSize = (2 + pebbleRandom() * 4) * cameraZoom;
      ctx.fillStyle = hexToRgba(theme.path[0], 0.5);
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, rpSize, rpSize * 0.6, pebbleRandom() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Export helper functions for use in other modules
export { createSeededRandom as seededRandom };
