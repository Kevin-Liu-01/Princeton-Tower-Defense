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

// Add organic wobble to path edges
export function addPathWobble(
  pathPoints: Position[],
  wobbleAmount: number,
  seededRandom: () => number
): { left: Position[]; right: Position[]; center: Position[] } {
  const left: Position[] = [];
  const right: Position[] = [];
  const center: Position[] = [];
  
  for (let i = 0; i < pathPoints.length; i++) {
    const p = pathPoints[i];
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
    const leftW = (seededRandom() - 0.5) * wobbleAmount;
    const rightW = (seededRandom() - 0.5) * wobbleAmount;
    left.push({
      x: p.x + perpX * (38 + leftW),
      y: p.y + perpY * (38 + leftW) * 0.5,
    });
    right.push({
      x: p.x - perpX * (38 + rightW),
      y: p.y - perpY * (38 + rightW) * 0.5,
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
