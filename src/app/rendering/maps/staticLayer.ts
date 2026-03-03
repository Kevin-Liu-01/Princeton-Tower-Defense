import {
  GRID_HEIGHT,
  GRID_WIDTH,
  LEVEL_DATA,
  MAP_PATHS,
  TILE_SIZE,
} from "../../constants";
import type { GridPosition, Position } from "../../types";
import {
  gridToWorld,
  gridToWorldPath,
  hexToRgba,
  worldToScreen,
} from "../../utils";

export interface RegionTheme {
  ground: string[];
  path: string[];
  accent: string;
}

export interface StaticMapFogEndpoint {
  endPos: Position;
  towardsPos: Position;
}

export interface RenderStaticMapLayerParams {
  ctx: CanvasRenderingContext2D;
  selectedMap: string;
  theme: RegionTheme;
  canvasWidthPx: number;
  canvasHeightPx: number;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
  cameraOffset: Position;
  cameraZoom: number;
}

interface RoadGeometry {
  smoothPath: Position[];
  screenCenter: Position[];
  screenLeft: Position[];
  screenRight: Position[];
}

const PATH_TENSION = 0.25;
const PATH_SUBDIVISIONS = 8;
const ROAD_BASE_WIDTH = 48;
const ROAD_WOBBLE = 10;
const ROAD_TRACK_OFFSET = 18;
const FOG_DIRECTION_OFFSET = 30;

function createSeededRandom(seed: number): () => number {
  let seedState = seed;
  return () => {
    seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
    return seedState / 0x7fffffff;
  };
}

function catmullRom(
  p0: Position,
  p1: Position,
  p2: Position,
  p3: Position,
  t: number,
  tension: number = PATH_TENSION,
): Position {
  const t2 = t * t;
  const t3 = t2 * t;
  const s = tension * 2;
  const linearX = p1.x + (p2.x - p1.x) * t;
  const linearY = p1.y + (p2.y - p1.y) * t;
  const catmullX =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
  const catmullY =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
  return {
    x: linearX * (1 - s) + catmullX * s,
    y: linearY * (1 - s) + catmullY * s,
  };
}

function generateSmoothPath(
  controlPoints: Position[],
  tension: number = PATH_TENSION,
  subdivisions: number = PATH_SUBDIVISIONS,
): Position[] {
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
    for (let j = 0; j < subdivisions; j++) {
      smoothPath.push(
        catmullRom(
          extended[i - 1],
          extended[i],
          extended[i + 1],
          extended[i + 2],
          j / subdivisions,
          tension,
        ),
      );
    }
  }
  smoothPath.push(controlPoints[controlPoints.length - 1]);
  return smoothPath;
}

function getSmoothedPerpendicular(
  pathPoints: Position[],
  index: number,
  lookAhead: number = 4,
): { perpX: number; perpY: number } {
  let avgPerpX = 0;
  let avgPerpY = 0;
  let count = 0;

  for (let offset = -lookAhead; offset <= lookAhead; offset++) {
    const i = Math.max(0, Math.min(pathPoints.length - 2, index + offset));
    const next = Math.min(i + 1, pathPoints.length - 1);

    const dx = pathPoints[next].x - pathPoints[i].x;
    const dy = pathPoints[next].y - pathPoints[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0.001) {
      const weight = 1 / (1 + Math.abs(offset) * 0.5);
      avgPerpX += (-dy / len) * weight;
      avgPerpY += (dx / len) * weight;
      count += weight;
    }
  }

  if (count > 0) {
    avgPerpX /= count;
    avgPerpY /= count;
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

function addPathWobble(
  pathPoints: Position[],
  mapSeed: number,
  wobbleAmount: number = ROAD_WOBBLE,
  pathWidth: number = ROAD_BASE_WIDTH,
): { left: Position[]; right: Position[] } {
  const seededRandom = createSeededRandom(mapSeed + 100);
  const left: Position[] = [];
  const right: Position[] = [];

  for (let i = 0; i < pathPoints.length; i++) {
    const p = pathPoints[i];
    const { perpX, perpY } = getSmoothedPerpendicular(pathPoints, i, 4);

    let cornerFactor = 1;
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
        const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
        cornerFactor = 0.3 + 0.7 * Math.max(0, dot);
      }
    }

    const leftW = (seededRandom() - 0.5) * wobbleAmount * cornerFactor;
    const rightW = (seededRandom() - 0.5) * wobbleAmount * cornerFactor;

    left.push({
      x: p.x + perpX * (pathWidth + leftW) * 1.05,
      y: p.y + perpY * (pathWidth + leftW) * 0.95,
    });
    right.push({
      x: p.x - perpX * (pathWidth + rightW),
      y: p.y - perpY * (pathWidth + rightW) * 0.95,
    });
  }

  return { left, right };
}

function buildRoadGeometry(
  path: GridPosition[],
  mapSeed: number,
  toScreen: (pos: Position) => Position,
): RoadGeometry | null {
  if (path.length < 2) {
    return null;
  }
  const pathWorldPoints = path.map((p) => gridToWorldPath(p));
  const smoothPath = generateSmoothPath(pathWorldPoints);
  const { left, right } = addPathWobble(smoothPath, mapSeed);
  return {
    smoothPath,
    screenCenter: smoothPath.map(toScreen),
    screenLeft: left.map(toScreen),
    screenRight: right.map(toScreen),
  };
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  geometry: RoadGeometry,
  theme: RegionTheme,
  cameraZoom: number,
  mapSeed: number,
  topLayerBlend: number,
  includePatches: boolean,
  toScreen: (pos: Position) => Position,
): void {
  const { smoothPath, screenCenter, screenLeft, screenRight } = geometry;

  if (screenCenter.length === 0) {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.moveTo(screenLeft[0].x + 4, screenLeft[0].y + 4);
  for (let i = 1; i < screenLeft.length; i++) {
    ctx.lineTo(screenLeft[i].x + 4, screenLeft[i].y + 4);
  }
  for (let i = screenRight.length - 1; i >= 0; i--) {
    ctx.lineTo(screenRight[i].x + 4, screenRight[i].y + 4);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.path[2];
  ctx.beginPath();
  ctx.moveTo(screenLeft[0].x, screenLeft[0].y);
  for (let i = 1; i < screenLeft.length; i++) {
    ctx.lineTo(screenLeft[i].x, screenLeft[i].y);
  }
  for (let i = screenRight.length - 1; i >= 0; i--) {
    ctx.lineTo(screenRight[i].x, screenRight[i].y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.path[0];
  ctx.beginPath();
  for (let i = 0; i < screenCenter.length; i++) {
    const lx = screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * 0.88;
    const ly = screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * 0.88;
    if (i === 0) {
      ctx.moveTo(lx, ly);
    } else {
      ctx.lineTo(lx, ly);
    }
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx = screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.88;
    const ry = screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.88;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.path[1];
  ctx.beginPath();
  for (let i = 0; i < screenCenter.length; i++) {
    const lx =
      screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * topLayerBlend;
    const ly =
      screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * topLayerBlend - 2;
    if (i === 0) {
      ctx.moveTo(lx, ly);
    } else {
      ctx.lineTo(lx, ly);
    }
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx =
      screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * topLayerBlend;
    const ry =
      screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * topLayerBlend - 2;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();

  if (includePatches) {
    const patchRandom = createSeededRandom(mapSeed + 200);
    ctx.fillStyle = hexToRgba(theme.ground[2], 0.12);
    for (let i = 0; i < smoothPath.length; i += 3) {
      if (i >= screenCenter.length) break;
      const sp = screenCenter[i];
      const patchSize = (3 + patchRandom() * 6) * cameraZoom;
      ctx.beginPath();
      ctx.ellipse(
        sp.x + (patchRandom() - 0.5) * 35 * cameraZoom,
        sp.y + (patchRandom() - 0.5) * 18 * cameraZoom,
        patchSize,
        patchSize * 0.5,
        patchRandom() * Math.PI,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.strokeStyle = hexToRgba(theme.path[2], 0.18);
  ctx.lineWidth = 3 * cameraZoom;
  for (let track = -1; track <= 1; track += 2) {
    ctx.beginPath();
    for (let i = 0; i < smoothPath.length; i++) {
      const p = smoothPath[i];
      const { perpX, perpY } = getSmoothedPerpendicular(smoothPath, i, 3);
      const wobble = Math.sin(i * 0.5 + mapSeed) * 2;
      const screenP = {
        x: p.x + perpX * ((ROAD_TRACK_OFFSET * track) / cameraZoom + wobble),
        y:
          p.y +
          perpY * ((ROAD_TRACK_OFFSET * track) / cameraZoom + wobble) * 0.75,
      };
      const trackScreenPoint = toScreen(screenP);
      if (i === 0) {
        ctx.moveTo(trackScreenPoint.x, trackScreenPoint.y);
      } else {
        ctx.lineTo(trackScreenPoint.x, trackScreenPoint.y);
      }
    }
    ctx.stroke();
  }

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
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function getFogEndpoints(geometry: RoadGeometry): StaticMapFogEndpoint[] {
  const { screenCenter } = geometry;
  if (screenCenter.length < 2) {
    return [];
  }
  const directionOffset = Math.min(
    FOG_DIRECTION_OFFSET,
    Math.floor(screenCenter.length / 4),
  );
  const firstScreenPos = screenCenter[0];
  const secondScreenPos =
    screenCenter[Math.min(directionOffset, screenCenter.length - 1)];
  const lastScreenPos = screenCenter[screenCenter.length - 1];
  const secondLastScreenPos =
    screenCenter[Math.max(0, screenCenter.length - 1 - directionOffset)];
  return [
    { endPos: firstScreenPos, towardsPos: secondScreenPos },
    { endPos: lastScreenPos, towardsPos: secondLastScreenPos },
  ];
}

export function renderStaticMapLayer({
  ctx,
  selectedMap,
  theme,
  canvasWidthPx,
  canvasHeightPx,
  cssWidth,
  cssHeight,
  dpr,
  cameraOffset,
  cameraZoom,
}: RenderStaticMapLayerParams): { fogEndpoints: StaticMapFogEndpoint[] } {
  const mapSeed = selectedMap
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const gradient = ctx.createRadialGradient(
    cssWidth / 2,
    cssHeight / 2,
    0,
    cssWidth / 2,
    cssHeight / 2,
    cssWidth,
  );
  gradient.addColorStop(0, theme.ground[0]);
  gradient.addColorStop(0.5, theme.ground[1]);
  gradient.addColorStop(1, theme.ground[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const gridRandom = createSeededRandom(mapSeed);
  const tileWidth = TILE_SIZE * cameraZoom;
  const tileHeight = TILE_SIZE * 0.5 * cameraZoom;

  ctx.strokeStyle = hexToRgba(theme.accent, 0.1);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const worldPos = gridToWorld({ x, y });
      const screenPos = worldToScreen(
        worldPos,
        canvasWidthPx,
        canvasHeightPx,
        dpr,
        cameraOffset,
        cameraZoom,
      );
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(screenPos.x + tileWidth / 2, screenPos.y + tileHeight / 2);
      ctx.lineTo(screenPos.x, screenPos.y + tileHeight);
      ctx.lineTo(screenPos.x - tileWidth / 2, screenPos.y + tileHeight / 2);
      ctx.closePath();
    }
  }
  ctx.stroke();

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (gridRandom() > 0.7) {
        const worldPos = gridToWorld({ x, y });
        const screenPos = worldToScreen(
          worldPos,
          canvasWidthPx,
          canvasHeightPx,
          dpr,
          cameraOffset,
          cameraZoom,
        );
        ctx.fillStyle = hexToRgba(theme.accent, 0.02 + gridRandom() * 0.03);
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(screenPos.x + tileWidth / 2, screenPos.y + tileHeight / 2);
        ctx.lineTo(screenPos.x, screenPos.y + tileHeight);
        ctx.lineTo(screenPos.x - tileWidth / 2, screenPos.y + tileHeight / 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  const toScreen = (p: Position) =>
    worldToScreen(
      p,
      canvasWidthPx,
      canvasHeightPx,
      dpr,
      cameraOffset,
      cameraZoom,
    );

  const fogEndpoints: StaticMapFogEndpoint[] = [];
  const primaryPath = MAP_PATHS[selectedMap] ?? MAP_PATHS.poe ?? [];
  const primaryRoad = buildRoadGeometry(primaryPath, mapSeed, toScreen);
  if (primaryRoad) {
    drawRoad(ctx, primaryRoad, theme, cameraZoom, mapSeed, 0.72, true, toScreen);
    fogEndpoints.push(...getFogEndpoints(primaryRoad));
  }

  const secondaryPathKey = LEVEL_DATA[selectedMap]?.secondaryPath;
  if (
    LEVEL_DATA[selectedMap]?.dualPath &&
    secondaryPathKey &&
    MAP_PATHS[secondaryPathKey]
  ) {
    const secondaryRoad = buildRoadGeometry(
      MAP_PATHS[secondaryPathKey],
      mapSeed,
      toScreen,
    );
    if (secondaryRoad) {
      drawRoad(ctx, secondaryRoad, theme, cameraZoom, mapSeed, 0.92, false, toScreen);
      fogEndpoints.push(...getFogEndpoints(secondaryRoad));
    }
  }

  return { fogEndpoints };
}
