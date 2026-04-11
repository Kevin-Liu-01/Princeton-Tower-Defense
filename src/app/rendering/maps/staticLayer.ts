import {
  GRID_HEIGHT,
  GRID_WIDTH,
  LEVEL_DATA,
  MAP_PATHS,
  ROAD_EXCLUSION_BUFFER,
  TILE_SIZE,
  ISO_TILE_HEIGHT_FACTOR,
  getLevelPathKeys,
} from "../../constants";
import type { DecorationType, GridPosition, Position } from "../../types";
import type { MapTheme } from "../../types";
import {
  gridToWorld,
  gridToWorldPath,
  hexToRgb,
  hexToRgba,
  worldToScreen,
} from "../../utils";
import { clampRgb } from "../../utils/colorUtils";
import { createSeededRandom } from "../../utils/seededRandom";
import { renderDecorationItem } from "../decorations/renderDecorationItem";
import { getPerformanceSettings } from "../performance";
import {
  CHALLENGE_MOUNTAIN_DEPTH,
  CHALLENGE_MOUNTAIN_SKIRT_LAYERS,
  getChallengeMountainGridBounds,
  getChallengePathSegments,
  isChallengeMountainTopCell,
  isMountainTerrainKind,
} from "./challengeTerrain";
import { renderThemedBackdropSilhouettes } from "./mountainBackdropDetails";
import {
  drawPathDecorations,
  drawBatchedPathEdgeBlend,
  drawIsoPathStone,
  drawDetailedIsoStone,
  buildStonePalettes,
  fillIsoBlob,
} from "./pathDecorations";
import { domainWarpedNoise } from "./terrainNoise";
import { renderTerrainTexture } from "./terrainTexture";

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
  preRoadCallback?: (ctx: CanvasRenderingContext2D) => void;
  skipBackdrop?: boolean;
}

export interface RoadGeometry {
  smoothPath: Position[];
  screenCenter: Position[];
  screenLeft: Position[];
  screenRight: Position[];
}

interface ChallengeBackdropPalette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  haze: string;
  farRidge: string;
  midRidge: string;
  nearRidge: string;
  mountainTop: string;
  mountainLeft: string;
  mountainRight: string;
  mountainFacetA: string;
  mountainFacetB: string;
  mountainShadow: string;
  landHighlight: string;
  skyAccent: string;
  skyDecor: string;
  mountainSnow?: string;
}

const PATH_TENSION = 0.25;
const PATH_SUBDIVISIONS = 8;
const SMOOTH_PATH_SPACING = 24;
// Slightly thicker visual roads while keeping gameplay hitboxes unchanged.
const ROAD_BASE_WIDTH = Math.round(ROAD_EXCLUSION_BUFFER * 1.3);
const ROAD_WOBBLE = 10;
const ROAD_TRACK_OFFSET = 18;
const ROAD_TRACK_WOBBLE = 2;
const FOG_DIRECTION_OFFSET = 30;
const CHALLENGE_TERRACE_BLOCK_SCALE = 0.72;
const CHALLENGE_TOP_TIER_MIN_BLOCKS = 3;
const CHALLENGE_TERRACE_STEP_MIN_BLOCKS = 2.25;
const CHALLENGE_TERRACE_STEP_MAX_BLOCKS = 4.75;
const CHALLENGE_TERRACE_OUTER_BOOST_BLOCKS = 1.15;

const CHALLENGE_BACKDROP_PALETTES: Record<
  "grassland" | "swamp" | "desert" | "winter" | "volcanic",
  ChallengeBackdropPalette
> = {
  desert: {
    farRidge: "#A8784E",
    haze: "rgba(228, 160, 64, 0.28)",
    landHighlight: "#D4A840",
    midRidge: "#704828",
    mountainFacetA: "#9A7850",
    mountainFacetB: "#7A5E3A",
    mountainLeft: "#8B7355",
    mountainRight: "#A88860",
    mountainShadow: "#1A1008",
    mountainTop: "#C4A060",
    nearRidge: "#3C2610",
    skyAccent: "rgba(255,220,160,0.35)",
    skyBottom: "#E4A040",
    skyDecor: "rgba(200,140,60,0.50)",
    skyMid: "#A84830",
    skyTop: "#2A1040",
  },
  grassland: {
    farRidge: "#7F9E72",
    haze: "rgba(180, 195, 160, 0.22)",
    landHighlight: "#6CB040",
    midRidge: "#4E7840",
    mountainFacetA: "#2E4A1A",
    mountainFacetB: "#1E3410",
    mountainLeft: "#2A4818",
    mountainRight: "#3A5A22",
    mountainShadow: "#0C1808",
    mountainTop: "#4A7A3E",
    nearRidge: "#1C3E1A",
    skyAccent: "rgba(255,248,230,0.5)",
    skyBottom: "#8AACB8",
    skyDecor: "rgba(90,140,100,0.40)",
    skyMid: "#5A8CAA",
    skyTop: "#2A4E72",
  },
  swamp: {
    farRidge: "#3A5A44",
    haze: "rgba(58, 96, 80, 0.35)",
    landHighlight: "#3A6A3A",
    midRidge: "#264230",
    mountainFacetA: "#1E2E16",
    mountainFacetB: "#12200E",
    mountainLeft: "#1A2A1A",
    mountainRight: "#2A3A22",
    mountainShadow: "#061008",
    mountainTop: "#2A4A2A",
    nearRidge: "#0C2016",
    skyAccent: "rgba(120,180,140,0.16)",
    skyBottom: "#3A6050",
    skyDecor: "rgba(60,120,74,0.40)",
    skyMid: "#1A3530",
    skyTop: "#0E1820",
  },
  volcanic: {
    farRidge: "#481E14",
    haze: "rgba(122, 40, 24, 0.22)",
    landHighlight: "#6A2818",
    midRidge: "#2E0E0C",
    mountainFacetA: "#301818",
    mountainFacetB: "#200E0E",
    mountainLeft: "#2A1A1A",
    mountainRight: "#3A2424",
    mountainShadow: "#080404",
    mountainTop: "#4A2020",
    nearRidge: "#180808",
    skyAccent: "rgba(255,100,30,0.15)",
    skyBottom: "#7A2818",
    skyDecor: "rgba(255,60,0,0.35)",
    skyMid: "#3A0E10",
    skyTop: "#0A0404",
  },
  winter: {
    farRidge: "#5A7A92",
    haze: "rgba(104, 144, 176, 0.35)",
    landHighlight: "#70A0C0",
    midRidge: "#3A5A72",
    mountainFacetA: "#304858",
    mountainFacetB: "#243A4A",
    mountainLeft: "#3A4E60",
    mountainRight: "#4A5E70",
    mountainShadow: "#0A1620",
    mountainSnow: "#D8E8F4",
    mountainTop: "#6090A8",
    nearRidge: "#1C3A50",
    skyAccent: "rgba(216,236,252,0.35)",
    skyBottom: "#6890B0",
    skyDecor: "rgba(100,156,186,0.50)",
    skyMid: "#2E4860",
    skyTop: "#0C1828",
  },
};

function catmullRom(
  p0: Position,
  p1: Position,
  p2: Position,
  p3: Position,
  t: number,
  tension: number = PATH_TENSION
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
  subdivisions: number = PATH_SUBDIVISIONS
): Position[] {
  if (controlPoints.length < 2) {
    return controlPoints;
  }
  const smoothPath: Position[] = [];
  const extended = [
    {
      x: controlPoints[0].x * 2 - controlPoints[1].x,
      y: controlPoints[0].y * 2 - controlPoints[1].y,
    },
    ...controlPoints,
    {
      x: controlPoints.at(-1).x * 2 - controlPoints.at(-2).x,
      y: controlPoints.at(-1).y * 2 - controlPoints.at(-2).y,
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
          tension
        )
      );
    }
  }
  smoothPath.push(controlPoints.at(-1));
  return smoothPath;
}

function getSmoothedPerpendicular(
  pathPoints: Position[],
  index: number,
  lookAhead: number = 4
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
  pathWidth: number = ROAD_BASE_WIDTH
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

/**
 * Resamples a polyline at uniform arc-length intervals so point density stays
 * consistent regardless of how many input points exist.
 */
function resampleByArcLength(points: Position[], spacing: number): Position[] {
  if (points.length < 2) {
    return points;
  }

  const arcLengths = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    arcLengths.push(arcLengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }

  const totalLength = arcLengths.at(-1);
  if (totalLength < spacing) {
    return points;
  }

  const numSamples = Math.max(2, Math.round(totalLength / spacing));
  const result: Position[] = [];
  let srcIdx = 0;

  for (let i = 0; i <= numSamples; i++) {
    const targetDist = (i / numSamples) * totalLength;

    while (
      srcIdx < arcLengths.length - 2 &&
      arcLengths[srcIdx + 1] < targetDist
    ) {
      srcIdx++;
    }

    const segLen = arcLengths[srcIdx + 1] - arcLengths[srcIdx];
    const t = segLen > 0 ? (targetDist - arcLengths[srcIdx]) / segLen : 0;

    result.push({
      x: points[srcIdx].x + (points[srcIdx + 1].x - points[srcIdx].x) * t,
      y: points[srcIdx].y + (points[srcIdx + 1].y - points[srcIdx].y) * t,
    });
  }

  return result;
}

function buildRoadGeometry(
  path: GridPosition[],
  mapSeed: number,
  toScreen: (pos: Position) => Position
): RoadGeometry | null {
  if (path.length < 2) {
    return null;
  }
  const pathWorldPoints = path.map((p) => gridToWorldPath(p));
  const rawSmooth = generateSmoothPath(pathWorldPoints);
  const smoothPath = resampleByArcLength(rawSmooth, SMOOTH_PATH_SPACING);
  const { left, right } = addPathWobble(smoothPath, mapSeed);
  return {
    screenCenter: smoothPath.map(toScreen),
    screenLeft: left.map(toScreen),
    screenRight: right.map(toScreen),
    smoothPath,
  };
}

const ROAD_HALF_WIDTH_SQ = ROAD_BASE_WIDTH * 0.55 * (ROAD_BASE_WIDTH * 0.55);

function isInsideOtherRoad(
  worldPt: Position,
  skipIdx: number,
  allSmooth: Position[][]
): boolean {
  for (let r = 0; r < allSmooth.length; r++) {
    if (r === skipIdx) {
      continue;
    }
    const other = allSmooth[r];
    for (let j = 0; j < other.length; j += 2) {
      const dx = worldPt.x - other[j].x;
      const dy = worldPt.y - other[j].y;
      if (dx * dx + dy * dy < ROAD_HALF_WIDTH_SQ) {
        return true;
      }
    }
  }
  return false;
}

function traceRoadOutline(
  ctx: CanvasRenderingContext2D,
  screenLeft: Position[],
  screenRight: Position[],
  ox = 0,
  oy = 0
): void {
  ctx.moveTo(screenLeft[0].x + ox, screenLeft[0].y + oy);
  for (let i = 1; i < screenLeft.length; i++) {
    ctx.lineTo(screenLeft[i].x + ox, screenLeft[i].y + oy);
  }
  for (let i = screenRight.length - 1; i >= 0; i--) {
    ctx.lineTo(screenRight[i].x + ox, screenRight[i].y + oy);
  }
  ctx.closePath();
}

function traceInsetOutline(
  ctx: CanvasRenderingContext2D,
  screenCenter: Position[],
  screenLeft: Position[],
  screenRight: Position[],
  blend: number,
  liftY = 0
): void {
  for (let i = 0; i < screenCenter.length; i++) {
    const lx =
      screenCenter[i].x + (screenLeft[i].x - screenCenter[i].x) * blend;
    const ly =
      screenCenter[i].y + (screenLeft[i].y - screenCenter[i].y) * blend - liftY;
    if (i === 0) {
      ctx.moveTo(lx, ly);
    } else {
      ctx.lineTo(lx, ly);
    }
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx =
      screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * blend;
    const ry =
      screenCenter[i].y +
      (screenRight[i].y - screenCenter[i].y) * blend -
      liftY;
    ctx.lineTo(rx, ry);
  }
  ctx.closePath();
}

function drawRoadsBatched(
  ctx: CanvasRenderingContext2D,
  roads: RoadGeometry[],
  theme: RegionTheme,
  cameraZoom: number,
  mapSeed: number,
  topLayerBlend: number,
  includePatches: boolean,
  toScreen: (pos: Position) => Position
): void {
  const active = roads.filter((r) => r.screenCenter.length > 0);
  if (active.length === 0) {
    return;
  }

  // Soft outer fringe: terrain-colored rings drawn *under* the opaque road
  // body. The opaque layers above cover the interior, leaving only the soft
  // edge ring visible. At road intersections Road B's body covers Road A's
  // fringe, preventing semi-transparent stacking artifacts.
  ctx.fillStyle = hexToRgba(theme.ground[1], 0.1);
  ctx.beginPath();
  for (const { screenCenter, screenLeft, screenRight } of active) {
    traceInsetOutline(ctx, screenCenter, screenLeft, screenRight, 1.16);
  }
  ctx.fill();

  ctx.fillStyle = hexToRgba(theme.ground[2], 0.07);
  ctx.beginPath();
  for (const { screenCenter, screenLeft, screenRight } of active) {
    traceInsetOutline(ctx, screenCenter, screenLeft, screenRight, 1.07);
  }
  ctx.fill();

  // Road body — dark edge stroke drawn FIRST, then opaque fills on top.
  // At intersections, road B's fill covers road A's edge stroke where it
  // passes through road B's body, preventing the grid artefact.
  ctx.strokeStyle = theme.path[2];
  ctx.lineWidth = 4 * cameraZoom;
  ctx.beginPath();
  for (const { screenLeft, screenRight } of active) {
    traceRoadOutline(ctx, screenLeft, screenRight);
  }
  ctx.stroke();

  ctx.fillStyle = theme.path[0];
  ctx.beginPath();
  for (const { screenLeft, screenRight } of active) {
    traceRoadOutline(ctx, screenLeft, screenRight);
  }
  ctx.fill();

  const topLayerLift = 2 * cameraZoom;
  ctx.fillStyle = theme.path[1];
  ctx.beginPath();
  for (const { screenCenter, screenLeft, screenRight } of active) {
    traceInsetOutline(
      ctx,
      screenCenter,
      screenLeft,
      screenRight,
      topLayerBlend,
      topLayerLift
    );
  }
  ctx.fill();

  // Subtle center crown highlight for a convex road profile
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  ctx.beginPath();
  for (const { screenCenter, screenLeft, screenRight } of active) {
    traceInsetOutline(
      ctx,
      screenCenter,
      screenLeft,
      screenRight,
      0.38,
      topLayerLift * 0.5
    );
  }
  ctx.fill();

  const allSmooth = active.map((r) => r.smoothPath);

  for (let roadIdx = 0; roadIdx < active.length; roadIdx++) {
    const { smoothPath, screenCenter, screenLeft, screenRight } =
      active[roadIdx];

    if (includePatches) {
      const patchRandom = createSeededRandom(mapSeed + 200);
      for (let i = 0; i < smoothPath.length; i += 3) {
        if (i >= screenCenter.length) {
          break;
        }
        const sp = screenCenter[i];
        const patchSize = (3 + patchRandom() * 6) * cameraZoom;
        const ox = sp.x + (patchRandom() - 0.5) * 35 * cameraZoom;
        const oy = sp.y + (patchRandom() - 0.5) * 18 * cameraZoom;
        const wobble = patchRandom() * patchSize * 0.1;

        fillIsoBlob(
          ctx,
          ox + 1.5 * cameraZoom,
          oy + 0.9 * cameraZoom,
          patchSize,
          patchSize * 0.5,
          hexToRgba(theme.ground[2], 0.06 + patchRandom() * 0.04),
          wobble
        );

        fillIsoBlob(
          ctx,
          ox,
          oy,
          patchSize,
          patchSize * 0.5,
          hexToRgba(theme.ground[2], 0.1 + patchRandom() * 0.05),
          wobble
        );

        fillIsoBlob(
          ctx,
          ox - patchSize * 0.25,
          oy - patchSize * 0.12,
          patchSize * 0.42,
          patchSize * 0.16,
          hexToRgba(theme.path[0], 0.03 + patchRandom() * 0.02),
          wobble * 0.4
        );
      }
    }

    ctx.strokeStyle = hexToRgba(theme.path[2], 0.1);
    ctx.lineWidth = 3 * cameraZoom;
    const skipOverlap = allSmooth.length > 1;
    for (let track = -1; track <= 1; track += 2) {
      ctx.beginPath();
      let penDown = false;
      for (let i = 0; i < smoothPath.length; i++) {
        const p = smoothPath[i];
        const { perpX, perpY } = getSmoothedPerpendicular(smoothPath, i, 3);
        const wobblePx = Math.sin(i * 0.5 + mapSeed) * ROAD_TRACK_WOBBLE;
        const trackOffset = ROAD_TRACK_OFFSET * track + wobblePx;
        const worldPt = {
          x: p.x + perpX * trackOffset,
          y: p.y + perpY * trackOffset * 0.75,
        };

        if (skipOverlap && isInsideOtherRoad(worldPt, roadIdx, allSmooth)) {
          penDown = false;
          continue;
        }

        const sp = toScreen(worldPt);
        if (!penDown) {
          ctx.moveTo(sp.x, sp.y);
          penDown = true;
        } else {
          ctx.lineTo(sp.x, sp.y);
        }
      }
      ctx.stroke();
    }

    const pebbleRandom = createSeededRandom(mapSeed + 300);
    const stonePalettes = buildStonePalettes(theme.path, 0.75);
    for (let i = 0; i < smoothPath.length; i += 2) {
      if (i >= screenLeft.length || pebbleRandom() > 0.5) {
        continue;
      }
      const side = pebbleRandom() > 0.5 ? screenLeft : screenRight;
      const p = side[i];
      const hw = (2 + pebbleRandom() * 3.5) * cameraZoom;
      const h = (1.2 + pebbleRandom() * 2.2) * cameraZoom;
      const hd = hw * 0.5;
      const pal =
        stonePalettes[Math.floor(pebbleRandom() * stonePalettes.length)];
      const shOff = 1 * cameraZoom;

      ctx.fillStyle = `rgba(0,0,0,${0.12 + pebbleRandom() * 0.06})`;
      ctx.beginPath();
      ctx.moveTo(p.x + shOff, p.y + shOff * 0.5 - hd);
      ctx.lineTo(p.x + shOff + hw, p.y + shOff * 0.5);
      ctx.lineTo(p.x + shOff, p.y + shOff * 0.5 + hd);
      ctx.lineTo(p.x + shOff - hw, p.y + shOff * 0.5);
      ctx.closePath();
      ctx.fill();

      // Larger pebbles get the detailed renderer with rim + seam
      if (hw > 3.5 * cameraZoom) {
        drawDetailedIsoStone(
          ctx,
          p.x,
          p.y,
          hw,
          h,
          pal.top,
          pal.left,
          pal.right
        );
      } else {
        drawIsoPathStone(ctx, p.x, p.y, hw, h, pal.top, pal.left, pal.right);
      }

      // Satellite micro-pebbles near larger stones
      if (hw > 3 * cameraZoom && pebbleRandom() > 0.4) {
        const satCount = 1 + Math.floor(pebbleRandom() * 2);
        for (let s = 0; s < satCount; s++) {
          const angle = pebbleRandom() * Math.PI * 2;
          const dist = hw * (1.1 + pebbleRandom() * 0.6);
          const sx = p.x + Math.cos(angle) * dist;
          const sy = p.y + Math.sin(angle) * dist * 0.5;
          const sHw = (0.6 + pebbleRandom() * 1) * cameraZoom;
          const sH = (0.2 + pebbleRandom() * 0.5) * cameraZoom;
          drawIsoPathStone(ctx, sx, sy, sHw, sH, pal.top, pal.left, pal.right);
        }
      }
    }
  }
}

function getFogEndpoints(geometry: RoadGeometry): StaticMapFogEndpoint[] {
  const { screenCenter } = geometry;
  if (screenCenter.length < 2) {
    return [];
  }
  const directionOffset = Math.min(
    FOG_DIRECTION_OFFSET,
    Math.floor(screenCenter.length / 4)
  );
  const firstScreenPos = screenCenter[0];
  const secondScreenPos =
    screenCenter[Math.min(directionOffset, screenCenter.length - 1)];
  const lastScreenPos = screenCenter.at(-1);
  const secondLastScreenPos =
    screenCenter[Math.max(0, screenCenter.length - 1 - directionOffset)];
  return [
    { endPos: firstScreenPos, towardsPos: secondScreenPos },
    { endPos: lastScreenPos, towardsPos: secondLastScreenPos },
  ];
}

const TERRACE_DECO_TYPES: Record<ChallengeThemeKey, string[]> = {
  desert: ["palm", "cactus", "rock", "dune", "sand_pile"],
  grassland: ["tree", "bush", "rock", "grass", "hedge", "flowers"],
  swamp: ["swamp_tree", "mushroom", "rock", "grass", "bush"],
  volcanic: ["charred_tree", "rock", "ember_rock", "grass"],
  winter: ["pine", "pine_tree", "rock", "snow_pile", "grass"],
};

function drawCellTerraceDecorations(
  ctx: CanvasRenderingContext2D,
  cell: { gx: number; gy: number; layerIndex: number },
  topX: number,
  topY: number,
  tileWidth: number,
  tileHeight: number,
  mapSeed: number,
  maxLayerIndex: number,
  themeKey: ChallengeThemeKey,
  selectedMap: string
): void {
  if (cell.layerIndex <= 0) {
    return;
  }

  const types = TERRACE_DECO_TYPES[themeKey];
  const rng = createSeededRandom(mapSeed + cell.gx * 73 + cell.gy * 137 + 9001);
  const layerNorm = cell.layerIndex / Math.max(1, maxLayerIndex);
  const decorChance = 0.45 * (1 - layerNorm * 0.6);
  if (rng() > decorChance) {
    return;
  }

  const count = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < count; i++) {
    let u = rng() * 2 - 1;
    let v = rng() * 2 - 1;
    const sum = Math.abs(u) + Math.abs(v);
    if (sum > 0.78) {
      const f = 0.78 / sum;
      u *= f;
      v *= f;
    }

    const cx = topX + u * tileWidth * 0.45;
    const cy = topY + tileHeight * 0.5 + v * tileHeight * 0.45;

    const sizeScale = (0.35 + rng() * 0.45) * (1 - layerNorm * 0.4);
    const scale = tileWidth * 0.05 * sizeScale;
    const typeIdx = Math.floor(rng() * types.length);
    const type = types[typeIdx] as DecorationType;
    const variant = Math.floor(rng() * 4);
    const rotation = rng() * Math.PI * 2;

    renderDecorationItem({
      ctx,
      decorTime: 0,
      decorX: cell.gx + rng(),
      decorY: cell.gy + rng(),
      mapTheme: themeKey,
      rotation,
      scale,
      screenPos: { x: cx, y: cy },
      selectedMap,
      skipShadow: true,
      type,
      variant,
    });
  }
}

function drawIsoTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number,
  fillStyle: string
): void {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + tileWidth / 2, y + tileHeight / 2);
  ctx.lineTo(x, y + tileHeight);
  ctx.lineTo(x - tileWidth / 2, y + tileHeight / 2);
  ctx.closePath();
  ctx.fill();
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) =>
    clampRgb(value).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function parseColorToRgb(color: string): { r: number; g: number; b: number } {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    return hexToRgb(trimmed);
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)/i
  );
  if (rgbMatch) {
    return {
      b: Number.parseFloat(rgbMatch[3] ?? "0"),
      g: Number.parseFloat(rgbMatch[2] ?? "0"),
      r: Number.parseFloat(rgbMatch[1] ?? "0"),
    };
  }

  return hexToRgb(trimmed);
}

function blendHexColors(colorA: string, colorB: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const a = parseColorToRgb(colorA);
  const b = parseColorToRgb(colorB);
  const r = Math.round(a.r + (b.r - a.r) * clamped);
  const g = Math.round(a.g + (b.g - a.g) * clamped);
  const bChannel = Math.round(a.b + (b.b - a.b) * clamped);
  return rgbToHex(r, g, bChannel);
}

function shadeHexColor(color: string, amount: number): string {
  const rgb = parseColorToRgb(color);
  return rgbToHex(
    clampRgb(rgb.r + amount),
    clampRgb(rgb.g + amount),
    clampRgb(rgb.b + amount)
  );
}

function tileNoise(gx: number, gy: number, seed: number): number {
  const value =
    Math.sin(gx * 12.9898 + gy * 78.233 + seed * 0.137) * 43_758.5453;
  return value - Math.floor(value);
}

function toCellKey(gx: number, gy: number): string {
  return `${gx}:${gy}`;
}

function parseCellKey(key: string): { gx: number; gy: number } {
  const [xPart, yPart] = key.split(":");
  return {
    gx: Number.parseInt(xPart ?? "0", 10),
    gy: Number.parseInt(yPart ?? "0", 10),
  };
}

type ChallengeThemeKey = keyof typeof CHALLENGE_BACKDROP_PALETTES;

function drawSoftCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 2, w * 0.44, h * 0.38, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w * 0.24 + 2, y + 3, w * 0.3, h * 0.3, -0.08, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.22 + 2, y + 3, w * 0.28, h * 0.27, 0.1, 0, Math.PI * 2);
  ctx.ellipse(
    x - w * 0.1 + 2,
    y - h * 0.06 + 2,
    w * 0.22,
    h * 0.24,
    -0.04,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + w * 0.1 + 2,
    y - h * 0.04 + 2,
    w * 0.2,
    h * 0.22,
    0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.44, h * 0.38, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w * 0.24, y + 1, w * 0.3, h * 0.3, -0.08, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.22, y + 1, w * 0.28, h * 0.27, 0.1, 0, Math.PI * 2);
  ctx.ellipse(
    x - w * 0.1,
    y - h * 0.06,
    w * 0.22,
    h * 0.24,
    -0.04,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + w * 0.1,
    y - h * 0.04,
    w * 0.2,
    h * 0.22,
    0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function renderChallengeSkyDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapSeed: number,
  themeKey: ChallengeThemeKey,
  palette: ChallengeBackdropPalette
): void {
  const skyRandom = createSeededRandom(mapSeed + 1403);

  if (themeKey === "grassland") {
    // sun position
    const sunX = width * (0.74 + skyRandom() * 0.16);
    const sunY = height * 0.14;

    // wide atmospheric halo
    ctx.save();
    const haloR = width * 0.35;
    const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, haloR);
    halo.addColorStop(0, "rgba(255,248,220,0.18)");
    halo.addColorStop(0.15, "rgba(255,244,200,0.1)");
    halo.addColorStop(0.35, "rgba(255,238,185,0.05)");
    halo.addColorStop(0.6, "rgba(255,230,170,0.02)");
    halo.addColorStop(1, "rgba(255,225,150,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, haloR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // warm horizon glow
    ctx.save();
    const horizonGlow = ctx.createLinearGradient(
      0,
      height * 0.06,
      0,
      height * 0.35
    );
    horizonGlow.addColorStop(0, "rgba(255,248,215,0)");
    horizonGlow.addColorStop(0.25, "rgba(255,244,200,0.06)");
    horizonGlow.addColorStop(0.5, "rgba(255,240,190,0.08)");
    horizonGlow.addColorStop(0.75, "rgba(255,235,175,0.04)");
    horizonGlow.addColorStop(1, "rgba(255,230,160,0)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, height * 0.06, width, height * 0.29);
    ctx.restore();

    // sun disc — bright core
    ctx.save();
    const sunCoreR = width * 0.028;
    const sunDisc = ctx.createRadialGradient(
      sunX,
      sunY,
      0,
      sunX,
      sunY,
      sunCoreR
    );
    sunDisc.addColorStop(0, "rgba(255,255,245,0.95)");
    sunDisc.addColorStop(0.3, "rgba(255,252,230,0.9)");
    sunDisc.addColorStop(0.6, "rgba(255,245,200,0.7)");
    sunDisc.addColorStop(0.85, "rgba(255,238,170,0.3)");
    sunDisc.addColorStop(1, "rgba(255,230,150,0)");
    ctx.fillStyle = sunDisc;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunCoreR, 0, Math.PI * 2);
    ctx.fill();

    // sun corona ring
    const coronaR = width * 0.065;
    const corona = ctx.createRadialGradient(
      sunX,
      sunY,
      sunCoreR * 0.5,
      sunX,
      sunY,
      coronaR
    );
    corona.addColorStop(0, "rgba(255,250,220,0.35)");
    corona.addColorStop(0.3, "rgba(255,245,200,0.15)");
    corona.addColorStop(0.6, "rgba(255,240,180,0.06)");
    corona.addColorStop(1, "rgba(255,235,160,0)");
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(sunX, sunY, coronaR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // cirrus wisps
    ctx.save();
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const sx = width * (-0.05 + skyRandom() * 1.1);
      const sy = height * (0.02 + skyRandom() * 0.06);
      const len = width * (0.1 + skyRandom() * 0.15);
      ctx.strokeStyle = `rgba(255,250,240,${(0.06 + skyRandom() * 0.06).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + len * 0.3,
        sy + (skyRandom() - 0.5) * 4,
        sx + len * 0.65,
        sy + (skyRandom() - 0.5) * 5,
        sx + len,
        sy + (skyRandom() - 0.5) * 3
      );
      ctx.stroke();
    }
    ctx.restore();

    // cumulus clouds — single-path per cloud for solid shapes
    for (let i = 0; i < 12; i++) {
      const cx = width * (-0.05 + (i / 11) * 1.1) + (skyRandom() - 0.5) * 60;
      const cy = height * (0.03 + skyRandom() * 0.12);
      const cw = width * (0.07 + skyRandom() * 0.1);
      const ch = height * (0.028 + skyRandom() * 0.028);
      const puffs = 7 + Math.floor(skyRandom() * 6);
      const cloudAlpha = 0.75 + skyRandom() * 0.25;

      // precompute puff positions so shadow and body share the same shape
      const puffData: {
        ox: number;
        oy: number;
        rx: number;
        ry: number;
        rot: number;
      }[] = [];
      for (let p = 0; p < puffs; p++) {
        puffData.push({
          ox: (skyRandom() - 0.5) * cw * 0.85,
          oy: (skyRandom() - 0.5) * ch * 0.55,
          rx: cw * (0.18 + skyRandom() * 0.28),
          ry: ch * (0.35 + skyRandom() * 0.45),
          rot: (skyRandom() - 0.5) * 0.3,
        });
      }

      // shadow — single batched path
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = palette.skyDecor;
      ctx.beginPath();
      for (const pf of puffData) {
        ctx.ellipse(
          cx + pf.ox + 2,
          cy + pf.oy + 2,
          pf.rx,
          pf.ry,
          pf.rot,
          0,
          Math.PI * 2
        );
      }
      ctx.fill();
      ctx.restore();

      // body — single batched path so overlapping puffs merge into one solid shape
      ctx.save();
      ctx.globalAlpha = cloudAlpha;
      ctx.fillStyle = palette.skyAccent;
      ctx.beginPath();
      for (const pf of puffData) {
        ctx.ellipse(
          cx + pf.ox,
          cy + pf.oy,
          pf.rx,
          pf.ry,
          pf.rot,
          0,
          Math.PI * 2
        );
      }
      ctx.fill();
      ctx.restore();

      // highlight on upper portion
      ctx.save();
      ctx.globalAlpha = cloudAlpha * 0.25;
      ctx.fillStyle = "rgba(255,255,250,0.7)";
      ctx.beginPath();
      for (const pf of puffData) {
        if (pf.oy < ch * 0.1) {
          ctx.ellipse(
            cx + pf.ox,
            cy + pf.oy - ch * 0.08,
            pf.rx * 0.7,
            pf.ry * 0.5,
            pf.rot,
            0,
            Math.PI * 2
          );
        }
      }
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  if (themeKey === "swamp") {
    for (let i = 0; i < 8; i++) {
      const fogY = height * (0.14 + i * 0.06);
      const fogThickness = 20 + i * 7;
      const fog = ctx.createLinearGradient(
        0,
        fogY - fogThickness,
        0,
        fogY + fogThickness
      );
      const fogAlpha = 0.1 + i * 0.015;
      fog.addColorStop(0, "rgba(216,240,220,0)");
      fog.addColorStop(0.25, `rgba(185,220,195,${fogAlpha * 0.5})`);
      fog.addColorStop(0.45, `rgba(165,210,178,${fogAlpha})`);
      fog.addColorStop(0.55, `rgba(150,200,165,${fogAlpha * 1.1})`);
      fog.addColorStop(0.75, `rgba(165,210,178,${fogAlpha * 0.5})`);
      fog.addColorStop(1, "rgba(216,240,220,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(-30, fogY - fogThickness, width + 60, fogThickness * 2);
    }

    ctx.save();
    for (let i = 0; i < 15; i++) {
      const cx = skyRandom() * width;
      const cy = height * (0.12 + skyRandom() * 0.35);
      const pw = 25 + skyRandom() * 50;
      const ph = 8 + skyRandom() * 18;
      const pAlpha = 0.04 + skyRandom() * 0.04;
      const pGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pw);
      pGrad.addColorStop(0, `rgba(130,190,140,${pAlpha})`);
      pGrad.addColorStop(0.6, `rgba(120,180,130,${pAlpha * 0.3})`);
      pGrad.addColorStop(1, "rgba(120,180,130,0)");
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pw, ph, skyRandom() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = palette.skyDecor;
    for (let i = 0; i < 30; i++) {
      const x = skyRandom() * width;
      const y = skyRandom() * height * 0.45;
      const s = 0.4 + skyRandom() * 1.3;
      ctx.globalAlpha = 0.3 + skyRandom() * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (themeKey === "desert") {
    const sunX = width * 0.82;
    const sunY = height * 0.14;

    const outerGlow = ctx.createRadialGradient(
      sunX,
      sunY,
      width * 0.03,
      sunX,
      sunY,
      width * 0.28
    );
    outerGlow.addColorStop(0, "rgba(255,242,200,0.12)");
    outerGlow.addColorStop(0.3, "rgba(255,230,170,0.06)");
    outerGlow.addColorStop(0.6, "rgba(255,220,150,0.02)");
    outerGlow.addColorStop(1, "rgba(255,220,150,0)");
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, width * 0.28, 0, Math.PI * 2);
    ctx.fill();

    const sunGrad = ctx.createRadialGradient(
      sunX,
      sunY,
      2,
      sunX,
      sunY,
      width * 0.1
    );
    sunGrad.addColorStop(0, "rgba(255,252,230,0.95)");
    sunGrad.addColorStop(0.15, "rgba(255,248,215,0.9)");
    sunGrad.addColorStop(0.35, "rgba(255,235,180,0.6)");
    sunGrad.addColorStop(0.6, "rgba(255,220,150,0.2)");
    sunGrad.addColorStop(1, "rgba(255,212,138,0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, width * 0.1, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      const hx = width * (0.08 + i * 0.25) + (skyRandom() - 0.5) * 40;
      const hy = height * (0.05 + skyRandom() * 0.1);
      drawSoftCloud(
        ctx,
        hx,
        hy,
        width * (0.06 + skyRandom() * 0.05),
        height * 0.035,
        `rgba(255,235,190,${(0.08 + skyRandom() * 0.06).toFixed(3)})`
      );
    }

    // thin wispy heat-distorted streaks across the sky
    ctx.save();
    for (let i = 0; i < 20; i++) {
      const sy = height * (0.1 + skyRandom() * 0.38);
      const sx = width * (-0.05 + skyRandom() * 1.1);
      const len = width * (0.04 + skyRandom() * 0.1);
      const streakAlpha = 0.06 + skyRandom() * 0.08;
      ctx.strokeStyle = `rgba(215,180,125,${streakAlpha.toFixed(3)})`;
      ctx.lineWidth = 0.6 + skyRandom() * 0.6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + len * 0.33,
        sy + (skyRandom() - 0.5) * 3,
        sx + len * 0.66,
        sy + (skyRandom() - 0.5) * 3,
        sx + len,
        sy + (skyRandom() - 0.5) * 4
      );
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (themeKey === "winter") {
    // multi-band aurora with vertical fade
    const auroraBands = [
      {
        y: 0.13,
        cp1: 0.06,
        cp2: 0.2,
        color: [100, 240, 180],
        w: 0.035,
        alpha: 0.1,
      },
      {
        y: 0.18,
        cp1: 0.08,
        cp2: 0.27,
        color: [128, 215, 255],
        w: 0.05,
        alpha: 0.14,
      },
      {
        y: 0.22,
        cp1: 0.14,
        cp2: 0.25,
        color: [180, 140, 255],
        w: 0.028,
        alpha: 0.07,
      },
      {
        y: 0.1,
        cp1: 0.04,
        cp2: 0.16,
        color: [100, 255, 200],
        w: 0.02,
        alpha: 0.06,
      },
    ];

    for (const band of auroraBands) {
      const [r, g, b] = band.color;
      const grad = ctx.createLinearGradient(0, 0, width, height * 0.4);
      grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.15, `rgba(${r},${g},${b},${band.alpha})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${band.alpha * 1.2})`);
      grad.addColorStop(0.85, `rgba(${r},${g},${b},${band.alpha})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = height * band.w;
      ctx.beginPath();
      ctx.moveTo(width * 0.05, height * band.y);
      ctx.bezierCurveTo(
        width * 0.3,
        height * band.cp1,
        width * 0.6,
        height * band.cp2,
        width * 0.92,
        height * (band.y - 0.02)
      );
      ctx.stroke();
    }

    // vertical aurora shimmer columns
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const colX = width * (0.1 + skyRandom() * 0.8);
      const colW = 3 + skyRandom() * 8;
      const colAlpha = 0.03 + skyRandom() * 0.04;
      const colGrad = ctx.createLinearGradient(0, 0, 0, height * 0.25);
      colGrad.addColorStop(0, `rgba(100,240,200,${colAlpha})`);
      colGrad.addColorStop(0.5, `rgba(120,230,220,${colAlpha * 0.5})`);
      colGrad.addColorStop(1, "rgba(100,220,200,0)");
      ctx.fillStyle = colGrad;
      ctx.fillRect(colX - colW / 2, 0, colW, height * 0.25);
    }
    ctx.restore();

    for (let i = 0; i < 3; i++) {
      const cx = width * (0.1 + i * 0.35) + (skyRandom() - 0.5) * 60;
      const cy = height * (0.06 + skyRandom() * 0.08);
      drawSoftCloud(
        ctx,
        cx,
        cy,
        width * (0.07 + skyRandom() * 0.04),
        height * 0.04,
        `rgba(200,225,255,${(0.06 + skyRandom() * 0.06).toFixed(3)})`
      );
    }

    ctx.fillStyle = "rgba(226,243,255,0.62)";
    for (let i = 0; i < 100; i++) {
      const x = skyRandom() * width;
      const y = skyRandom() * height * 0.55;
      const size = 0.3 + skyRandom() * 1.4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    for (let i = 0; i < 30; i++) {
      const x = skyRandom() * width;
      const y = skyRandom() * height * 0.45;
      const size = 0.2 + skyRandom() * 0.5;
      ctx.save();
      ctx.globalAlpha = 0.4 + skyRandom() * 0.45;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  // volcanic — organic smoke, red glow, and ember motes
  const smokeRandom = createSeededRandom(mapSeed + 1437);

  // red-sky ambient under-glow from below
  ctx.save();
  const underGlow = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.6);
  underGlow.addColorStop(0, "rgba(255,40,5,0)");
  underGlow.addColorStop(0.3, "rgba(255,50,10,0.03)");
  underGlow.addColorStop(0.6, "rgba(255,60,15,0.04)");
  underGlow.addColorStop(1, "rgba(255,40,0,0)");
  ctx.fillStyle = underGlow;
  ctx.fillRect(0, height * 0.2, width, height * 0.4);
  ctx.restore();

  // organic smoke plumes — irregular lobed puffs instead of ellipses
  for (let p = 0; p < 5; p++) {
    const baseX = width * (0.12 + p * 0.18 + (smokeRandom() - 0.5) * 0.05);
    const baseY = height * (0.2 + smokeRandom() * 0.1);
    const plumeSize = 0.7 + smokeRandom() * 0.5;
    for (let i = 0; i < 12; i++) {
      const drift = i * 7 * plumeSize;
      const spread = (8 + i * 3) * plumeSize;
      const alpha = 0.09 - i * 0.006;
      if (alpha <= 0) {
        break;
      }

      const r = 55 + i * 4;
      const g = 40 + i * 3;
      const b = 35 + i * 3;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.beginPath();

      // organic puff shape with lobes
      const puffCx = baseX + Math.sin(i * 0.8 + p) * 12;
      const puffCy = baseY - drift;
      const lobes = 4 + Math.floor(smokeRandom() * 3);
      for (let l = 0; l <= lobes * 2; l++) {
        const angle = (l / (lobes * 2)) * Math.PI * 2;
        const wobble = 0.75 + smokeRandom() * 0.45;
        const px = puffCx + Math.cos(angle) * spread * wobble;
        const py = puffCy + Math.sin(angle) * spread * 0.55 * wobble;
        if (l === 0) {
          ctx.moveTo(px, py);
        } else {
          const midAngle = ((l - 0.5) / (lobes * 2)) * Math.PI * 2;
          ctx.quadraticCurveTo(
            puffCx + Math.cos(midAngle) * spread * (0.6 + smokeRandom() * 0.2),
            puffCy +
              Math.sin(midAngle) * spread * 0.55 * (0.6 + smokeRandom() * 0.2),
            px,
            py
          );
        }
      }
      ctx.closePath();
      ctx.fill();
    }

    // base glow from lava below
    if (smokeRandom() > 0.4) {
      ctx.save();
      ctx.globalAlpha = 0.05;
      const glowGrad = ctx.createRadialGradient(
        baseX,
        baseY + 10,
        0,
        baseX,
        baseY + 10,
        20
      );
      glowGrad.addColorStop(0, "rgba(255,100,40,1)");
      glowGrad.addColorStop(0.5, "rgba(255,70,20,0.5)");
      glowGrad.addColorStop(1, "rgba(255,40,10,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(baseX, baseY + 10, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ember motes with glow halos drifting upward
  ctx.save();
  for (let i = 0; i < 25; i++) {
    const ex = smokeRandom() * width;
    const ey = height * (0.15 + smokeRandom() * 0.4);
    const emberR = 0.3 + smokeRandom() * 1;
    ctx.globalAlpha = 0.04 + smokeRandom() * 0.06;
    const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, emberR * 3);
    glow.addColorStop(0, "rgba(255,140,50,0.5)");
    glow.addColorStop(0.4, "rgba(255,80,20,0.15)");
    glow.addColorStop(1, "rgba(255,40,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex, ey, emberR * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ash particles — tiny organic specks
  ctx.fillStyle = palette.skyDecor;
  for (let i = 0; i < 50; i++) {
    const x = smokeRandom() * width;
    const y = smokeRandom() * height * 0.58;
    const size = 0.3 + smokeRandom() * 1.2;
    ctx.globalAlpha = 0.3 + smokeRandom() * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function renderChallengeMountainBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapSeed: number,
  themeKey: ChallengeThemeKey
): void {
  const palette = CHALLENGE_BACKDROP_PALETTES[themeKey];

  // sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, palette.skyTop);
  skyGrad.addColorStop(0.5, palette.skyMid);
  skyGrad.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // haze overlay — use transparent version of skyBottom to avoid premultiplied
  // alpha artifacts (transparent white bleeds into visible color fringe)
  const hazeTransparent = hexToRgba(palette.skyBottom, 0);
  const hazeGrad = ctx.createLinearGradient(0, height * 0.15, 0, height * 0.72);
  hazeGrad.addColorStop(0, hazeTransparent);
  hazeGrad.addColorStop(0.5, palette.haze);
  hazeGrad.addColorStop(1, hazeTransparent);
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, width, height);

  // sky decorations (theme-specific: clouds, aurora, sun, smoke)
  renderChallengeSkyDecorations(ctx, width, height, mapSeed, themeKey, palette);

  // theme-specific silhouettes (the main visual content)
  renderThemedBackdropSilhouettes(
    ctx,
    width,
    height,
    mapSeed,
    themeKey,
    palette
  );

  // atmospheric depth overlay — grassland uses lighter treatment to preserve
  // the warm golden-hour palette; other themes keep stronger darkening
  const shadowTransparent = hexToRgba(palette.mountainShadow, 0);
  const isGrassland = themeKey === "grassland";
  const atmosphere = ctx.createLinearGradient(0, height * 0.44, 0, height);
  atmosphere.addColorStop(0, shadowTransparent);
  atmosphere.addColorStop(
    0.5,
    hexToRgba(palette.mountainShadow, isGrassland ? 0.03 : 0.05)
  );
  atmosphere.addColorStop(
    0.7,
    hexToRgba(palette.mountainShadow, isGrassland ? 0.05 : 0.08)
  );
  atmosphere.addColorStop(
    1,
    hexToRgba(palette.mountainShadow, isGrassland ? 0.12 : 0.22)
  );
  ctx.fillStyle = atmosphere;
  ctx.fillRect(0, 0, width, height);
}

function renderChallengeWorldMountain(
  ctx: CanvasRenderingContext2D,
  selectedMap: string,
  mapSeed: number,
  tileWidth: number,
  tileHeight: number,
  toScreen: (p: Position) => Position,
  themeKey: ChallengeThemeKey
): number[] | null {
  const segments = getChallengePathSegments(selectedMap);
  const palette = CHALLENGE_BACKDROP_PALETTES[themeKey];
  const bounds = getChallengeMountainGridBounds(segments);
  const topCells = new Set<string>();

  for (let gy = bounds.minY; gy <= bounds.maxY; gy++) {
    for (let gx = bounds.minX; gx <= bounds.maxX; gx++) {
      if (!isChallengeMountainTopCell(gx, gy, segments)) {
        continue;
      }
      topCells.add(toCellKey(gx, gy));
    }
  }

  if (topCells.size === 0) {
    return null;
  }

  const layerIndexByCell = new Map<string, number>();
  topCells.forEach((key) => {
    layerIndexByCell.set(key, 0);
  });
  let frontier = new Set<string>(topCells);
  const expansionOffsets = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
  ];

  const supportTowerLayers = 0;
  const totalSkirtLayers = CHALLENGE_MOUNTAIN_SKIRT_LAYERS + supportTowerLayers;

  for (let layer = 0; layer < totalSkirtLayers; layer++) {
    const ring = new Set<string>();
    frontier.forEach((key) => {
      const { gx, gy } = parseCellKey(key);
      for (const offset of expansionOffsets) {
        const nx = gx + offset.x;
        const ny = gy + offset.y;
        if (
          nx < bounds.minX ||
          nx > bounds.maxX ||
          ny < bounds.minY ||
          ny > bounds.maxY
        ) {
          continue;
        }
        const nextKey = toCellKey(nx, ny);
        if (layerIndexByCell.has(nextKey)) {
          continue;
        }
        layerIndexByCell.set(nextKey, layer + 1);
        ring.add(nextKey);
      }
    });
    if (ring.size === 0) {
      break;
    }
    frontier = ring;
  }

  const towerBandSize = 2;
  const toTowerLayerIndex = (rawLayerIndex: number): number =>
    rawLayerIndex <= 0 ? 0 : Math.ceil(rawLayerIndex / towerBandSize);
  const towerLayerIndexByCell = new Map<string, number>();
  layerIndexByCell.forEach((rawLayerIndex, key) => {
    towerLayerIndexByCell.set(key, toTowerLayerIndex(rawLayerIndex));
  });

  const maxLayerIndex = Math.max(0, ...towerLayerIndexByCell.values());
  const zoom = tileWidth / TILE_SIZE;
  const blockHeight =
    CHALLENGE_MOUNTAIN_DEPTH.terraceStep * CHALLENGE_TERRACE_BLOCK_SCALE * zoom;
  const layerDepthByIndex = new Array<number>(maxLayerIndex + 1).fill(0);
  const depthProfileRandom = createSeededRandom(mapSeed + 1883);
  let cumulativeLayerDepth = 0;
  for (let layer = 1; layer <= maxLayerIndex; layer++) {
    const layerProgress = layer / Math.max(1, maxLayerIndex);
    const minBlocks =
      layer === 1
        ? CHALLENGE_TOP_TIER_MIN_BLOCKS
        : CHALLENGE_TERRACE_STEP_MIN_BLOCKS;
    const boostedMaxBlocks =
      CHALLENGE_TERRACE_STEP_MAX_BLOCKS +
      layerProgress * CHALLENGE_TERRACE_OUTER_BOOST_BLOCKS;
    const randomBlocks =
      minBlocks +
      depthProfileRandom() * Math.max(0, boostedMaxBlocks - minBlocks);
    const quantizedBlocks = Math.max(
      minBlocks,
      Math.round(randomBlocks * 2) / 2
    );
    cumulativeLayerDepth += quantizedBlocks * blockHeight;
    layerDepthByIndex[layer] = cumulativeLayerDepth;
  }
  const fallbackStepDepth =
    maxLayerIndex > 0
      ? layerDepthByIndex[maxLayerIndex] - layerDepthByIndex[maxLayerIndex - 1]
      : blockHeight * CHALLENGE_TOP_TIER_MIN_BLOCKS;
  const depthForLayer = (layerIndex: number): number => {
    if (layerIndex <= 0) {
      return 0;
    }
    if (layerIndex <= maxLayerIndex) {
      return layerDepthByIndex[layerIndex] ?? 0;
    }
    const lastDepth = layerDepthByIndex[maxLayerIndex] ?? 0;
    return lastDepth + (layerIndex - maxLayerIndex) * fallbackStepDepth;
  };
  const voidDepth = Math.max(
    CHALLENGE_MOUNTAIN_DEPTH.baseShadow * zoom,
    depthForLayer(maxLayerIndex + 2)
  );
  const seamOverlap = Math.max(1.5, tileHeight * 0.14);
  const getLayerIndex = (gx: number, gy: number): number | null => {
    const layer = towerLayerIndexByCell.get(toCellKey(gx, gy));
    return typeof layer === "number" ? layer : null;
  };
  const getNeighborInfo = (
    gx: number,
    gy: number
  ): { exists: boolean; depth: number } => {
    const layer = getLayerIndex(gx, gy);
    if (layer === null) {
      return { depth: voidDepth, exists: false };
    }
    return { depth: depthForLayer(layer), exists: true };
  };

  const renderCells = [...layerIndexByCell.entries()]
    .map(([key, rawLayerIndex]) => {
      const { gx, gy } = parseCellKey(key);
      const worldPos = gridToWorld({ x: gx, y: gy });
      const screenPos = toScreen(worldPos);
      const towerLayerIndex = towerLayerIndexByCell.get(key) ?? 0;
      return {
        depth: depthForLayer(towerLayerIndex),
        gx,
        gy,
        key,
        layerIndex: towerLayerIndex,
        rawLayerIndex,
        screenPos,
      };
    })
    .toSorted((a, b) => {
      const ay = a.screenPos.y + a.depth;
      const by = b.screenPos.y + b.depth;
      if (Math.abs(ay - by) > 0.001) {
        return ay - by;
      }
      return a.screenPos.x - b.screenPos.x;
    });

  interface PrecomputedCell {
    cell: (typeof renderCells)[0];
    topNoise: number;
    cliffNoise: number;
    layerNorm: number;
    northDrop: number;
    westDrop: number;
    northwestDrop: number;
    northeastDrop: number;
    southwestDrop: number;
    rightDrop: number;
    southDrop: number;
    southeastDrop: number;
    topX: number;
    topY: number;
    rightX: number;
    rightY: number;
    leftX: number;
    leftY: number;
    bottomX: number;
    bottomY: number;
  }

  const precomputed: PrecomputedCell[] = renderCells.map((cell) => {
    const topNoise = tileNoise(
      cell.gx,
      cell.gy,
      mapSeed + 257 + cell.rawLayerIndex * 11
    );
    const cliffNoise = tileNoise(
      cell.gx,
      cell.gy,
      mapSeed + 743 + cell.rawLayerIndex * 17
    );
    const layerNorm = cell.layerIndex / Math.max(1, maxLayerIndex);
    const isTopPlateauCell = cell.layerIndex === 0;

    const northNeighbor = getNeighborInfo(cell.gx, cell.gy - 1);
    const westNeighbor = getNeighborInfo(cell.gx - 1, cell.gy);
    const northwestNeighbor = getNeighborInfo(cell.gx - 1, cell.gy - 1);
    const rightNeighbor = getNeighborInfo(cell.gx + 1, cell.gy);
    const southNeighbor = getNeighborInfo(cell.gx, cell.gy + 1);
    const northeastNeighbor = getNeighborInfo(cell.gx + 1, cell.gy - 1);
    const southwestNeighbor = getNeighborInfo(cell.gx - 1, cell.gy + 1);
    const southeastNeighbor = getNeighborInfo(cell.gx + 1, cell.gy + 1);

    const rawNW = northwestNeighbor.exists
      ? Math.max(0, northwestNeighbor.depth - cell.depth)
      : 0;
    const rawN = northNeighbor.exists
      ? Math.max(0, northNeighbor.depth - cell.depth)
      : 0;
    const rawW = westNeighbor.exists
      ? Math.max(0, westNeighbor.depth - cell.depth)
      : 0;
    const rawNE = northeastNeighbor.exists
      ? Math.max(0, northeastNeighbor.depth - cell.depth)
      : 0;
    const rawSW = southwestNeighbor.exists
      ? Math.max(0, southwestNeighbor.depth - cell.depth)
      : 0;

    const northwestDrop = isTopPlateauCell ? 0 : rawNW;
    const northDrop = isTopPlateauCell ? 0 : rawN;
    const westDrop = isTopPlateauCell ? 0 : rawW;
    const northeastDrop = isTopPlateauCell ? 0 : rawNE;
    const southwestDrop = isTopPlateauCell ? 0 : rawSW;
    const rightDrop = Math.max(0, rightNeighbor.depth - cell.depth);
    const southDrop = Math.max(0, southNeighbor.depth - cell.depth);
    const southeastDrop = Math.max(0, southeastNeighbor.depth - cell.depth);

    const tileTopY = cell.screenPos.y + cell.depth;
    return {
      bottomX: cell.screenPos.x,
      bottomY: tileTopY + tileHeight,
      cell,
      cliffNoise,
      layerNorm,
      leftX: cell.screenPos.x - tileWidth * 0.5,
      leftY: tileTopY + tileHeight * 0.5,
      northDrop,
      northeastDrop,
      northwestDrop,
      rightDrop,
      rightX: cell.screenPos.x + tileWidth * 0.5,
      rightY: tileTopY + tileHeight * 0.5,
      southDrop,
      southeastDrop,
      southwestDrop,
      topNoise,
      topX: cell.screenPos.x,
      topY: tileTopY,
      westDrop,
    };
  });

  const cellsByLayer = new Map<number, PrecomputedCell[]>();
  for (const d of precomputed) {
    const arr = cellsByLayer.get(d.cell.layerIndex);
    if (arr) {
      arr.push(d);
    } else {
      cellsByLayer.set(d.cell.layerIndex, [d]);
    }
  }
  const sortedLayerIndices = [...cellsByLayer.keys()].toSorted((a, b) => b - a);

  const drawBackFaces = (d: PrecomputedCell) => {
    if (d.northDrop > 0.5) {
      const northColor = shadeHexColor(
        blendHexColors(
          palette.mountainRight,
          palette.mountainFacetB,
          0.08 + d.layerNorm * 0.26 + d.cliffNoise * 0.1
        ),
        -14
      );
      ctx.fillStyle = northColor;
      ctx.beginPath();
      ctx.moveTo(d.topX, d.topY + seamOverlap);
      ctx.lineTo(d.rightX, d.rightY + seamOverlap);
      ctx.lineTo(d.rightX, d.rightY + d.northDrop + seamOverlap);
      ctx.lineTo(d.topX, d.topY + d.northDrop + seamOverlap);
      ctx.closePath();
      ctx.fill();
    }

    if (d.westDrop > 0.5) {
      const westColor = shadeHexColor(
        blendHexColors(
          palette.mountainLeft,
          palette.mountainFacetA,
          0.08 + d.layerNorm * 0.22 + d.cliffNoise * 0.1
        ),
        -12
      );
      ctx.fillStyle = westColor;
      ctx.beginPath();
      ctx.moveTo(d.topX, d.topY + seamOverlap);
      ctx.lineTo(d.leftX, d.leftY + seamOverlap);
      ctx.lineTo(d.leftX, d.leftY + d.westDrop + seamOverlap);
      ctx.lineTo(d.topX, d.topY + d.westDrop + seamOverlap);
      ctx.closePath();
      ctx.fill();
    }

    const topCornerDrop = Math.max(
      Math.min(d.northDrop, d.westDrop),
      d.northwestDrop > 0.5 ? d.northwestDrop * 0.74 : 0
    );
    if (topCornerDrop > 0.5) {
      ctx.fillStyle = hexToRgba(palette.mountainShadow, 0.16);
      ctx.beginPath();
      ctx.moveTo(d.topX, d.topY + seamOverlap * 0.3);
      ctx.lineTo(d.topX + tileWidth * 0.06, d.topY + topCornerDrop * 0.74);
      ctx.lineTo(d.topX - tileWidth * 0.06, d.topY + topCornerDrop * 0.74);
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawTopTile = (d: PrecomputedCell) => {
    const topBase = blendHexColors(
      palette.mountainTop,
      palette.landHighlight,
      0.32 + (1 - d.layerNorm) * 0.12 + d.topNoise * 0.15
    );
    const topColor = shadeHexColor(
      blendHexColors(topBase, palette.mountainFacetA, d.layerNorm * 0.26),
      Math.round((d.topNoise - 0.48) * 12)
    );
    drawIsoTile(
      ctx,
      d.cell.screenPos.x,
      d.cell.screenPos.y + d.cell.depth,
      tileWidth,
      tileHeight,
      topColor
    );

    if (d.topNoise > 0.34) {
      ctx.strokeStyle = hexToRgba(
        palette.mountainShadow,
        0.14 + d.topNoise * 0.08
      );
      ctx.lineWidth = Math.max(0.52, tileHeight * 0.045);
      ctx.beginPath();
      ctx.moveTo(
        d.cell.screenPos.x - tileWidth * 0.16,
        d.cell.screenPos.y +
          d.cell.depth +
          tileHeight * (0.43 + d.topNoise * 0.06)
      );
      ctx.lineTo(
        d.cell.screenPos.x + tileWidth * (0.18 + d.topNoise * 0.05),
        d.cell.screenPos.y +
          d.cell.depth +
          tileHeight * (0.5 + d.topNoise * 0.07)
      );
      ctx.stroke();
    }
  };

  const drawFrontFaces = (d: PrecomputedCell) => {
    if (d.rightDrop > 0.5) {
      const rightColorTop = shadeHexColor(
        blendHexColors(
          palette.mountainRight,
          palette.mountainFacetB,
          0.22 + d.layerNorm * 0.45 + d.cliffNoise * 0.15
        ),
        -4
      );
      const rightColorBot = shadeHexColor(
        rightColorTop,
        -18 - Math.round(d.layerNorm * 8)
      );
      const rightGrad = ctx.createLinearGradient(
        0,
        (d.rightY + d.bottomY) * 0.5,
        0,
        (d.rightY + d.bottomY) * 0.5 + d.rightDrop
      );
      rightGrad.addColorStop(0, rightColorTop);
      rightGrad.addColorStop(1, rightColorBot);
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(d.rightX, d.rightY);
      ctx.lineTo(d.bottomX, d.bottomY);
      ctx.lineTo(d.bottomX, d.bottomY + d.rightDrop + seamOverlap);
      ctx.lineTo(d.rightX, d.rightY + d.rightDrop + seamOverlap);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = hexToRgba(
        palette.mountainShadow,
        0.22 + d.layerNorm * 0.18
      );
      ctx.lineWidth = Math.max(0.6, tileHeight * 0.05);
      const rightLineCount = Math.max(
        1,
        Math.floor(d.rightDrop / (blockHeight * 0.9))
      );
      for (let i = 1; i <= rightLineCount; i++) {
        const t = i / (rightLineCount + 1);
        const lineY = d.rightY + d.rightDrop * t;
        ctx.beginPath();
        ctx.moveTo(d.rightX - tileWidth * 0.02, lineY);
        ctx.lineTo(d.bottomX - tileWidth * 0.02, lineY + tileHeight * 0.5);
        ctx.stroke();
      }
    }

    if (d.southDrop > 0.5) {
      const leftColorTop = shadeHexColor(
        blendHexColors(
          palette.mountainLeft,
          palette.mountainFacetA,
          0.2 + d.layerNorm * 0.4 + d.cliffNoise * 0.12
        ),
        0
      );
      const leftColorBot = shadeHexColor(
        leftColorTop,
        -16 - Math.round(d.layerNorm * 6)
      );
      const leftGrad = ctx.createLinearGradient(
        0,
        (d.leftY + d.bottomY) * 0.5,
        0,
        (d.leftY + d.bottomY) * 0.5 + d.southDrop
      );
      leftGrad.addColorStop(0, leftColorTop);
      leftGrad.addColorStop(1, leftColorBot);
      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(d.leftX, d.leftY);
      ctx.lineTo(d.bottomX, d.bottomY);
      ctx.lineTo(d.bottomX, d.bottomY + d.southDrop + seamOverlap);
      ctx.lineTo(d.leftX, d.leftY + d.southDrop + seamOverlap);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = hexToRgba(
        palette.mountainShadow,
        0.18 + d.layerNorm * 0.16
      );
      ctx.lineWidth = Math.max(0.55, tileHeight * 0.045);
      const southLineCount = Math.max(
        1,
        Math.floor(d.southDrop / (blockHeight * 0.88))
      );
      for (let i = 1; i <= southLineCount; i++) {
        const t = i / (southLineCount + 1);
        const lineY = d.leftY + d.southDrop * t;
        ctx.beginPath();
        ctx.moveTo(d.leftX + tileWidth * 0.02, lineY);
        ctx.lineTo(d.bottomX + tileWidth * 0.02, lineY + tileHeight * 0.5);
        ctx.stroke();
      }
    }

    const rightCornerDrop = Math.max(
      Math.min(d.northDrop, d.rightDrop),
      d.northeastDrop > 0.5 ? d.northeastDrop * 0.74 : 0
    );
    if (rightCornerDrop > 0.5) {
      ctx.fillStyle = hexToRgba(palette.mountainShadow, 0.24);
      ctx.beginPath();
      ctx.moveTo(d.rightX + seamOverlap * 0.25, d.rightY);
      ctx.lineTo(
        d.rightX + tileWidth * 0.08,
        d.rightY + rightCornerDrop * 0.78
      );
      ctx.lineTo(
        d.rightX - tileWidth * 0.08,
        d.rightY + rightCornerDrop * 0.78
      );
      ctx.closePath();
      ctx.fill();
    }

    const leftCornerDrop = Math.max(
      Math.min(d.westDrop, d.southDrop),
      d.southwestDrop > 0.5 ? d.southwestDrop * 0.74 : 0
    );
    if (leftCornerDrop > 0.5) {
      ctx.fillStyle = hexToRgba(palette.mountainShadow, 0.24);
      ctx.beginPath();
      ctx.moveTo(d.leftX - seamOverlap * 0.25, d.leftY);
      ctx.lineTo(d.leftX + tileWidth * 0.08, d.leftY + leftCornerDrop * 0.78);
      ctx.lineTo(d.leftX - tileWidth * 0.08, d.leftY + leftCornerDrop * 0.78);
      ctx.closePath();
      ctx.fill();
    }

    const bottomCornerDrop = Math.max(
      Math.min(d.rightDrop, d.southDrop),
      d.southeastDrop > 0.5 ? d.southeastDrop * 0.78 : 0
    );
    if (bottomCornerDrop > 0.5) {
      ctx.fillStyle = hexToRgba(palette.mountainShadow, 0.28);
      ctx.beginPath();
      ctx.moveTo(d.bottomX, d.bottomY - seamOverlap);
      ctx.lineTo(
        d.bottomX + tileWidth * 0.09,
        d.bottomY + bottomCornerDrop * 0.8
      );
      ctx.lineTo(
        d.bottomX - tileWidth * 0.09,
        d.bottomY + bottomCornerDrop * 0.8
      );
      ctx.closePath();
      ctx.fill();
    }
  };

  let deferredEdgeDecos: PrecomputedCell[] = [];

  for (const layerIdx of sortedLayerIndices) {
    const layerCells = cellsByLayer.get(layerIdx)!;
    layerCells.sort((a, b) => {
      const ay = a.topY;
      const by = b.topY;
      if (Math.abs(ay - by) > 0.001) {
        return ay - by;
      }
      return a.topX - b.topX;
    });

    for (const d of layerCells) {
      drawBackFaces(d);
      drawTopTile(d);
      if (layerIdx > 0 && d.southDrop <= 0.5 && d.rightDrop <= 0.5) {
        drawCellTerraceDecorations(
          ctx,
          d.cell,
          d.topX,
          d.topY,
          tileWidth,
          tileHeight,
          mapSeed,
          maxLayerIndex,
          themeKey,
          selectedMap
        );
      }
      drawFrontFaces(d);
    }

    // Deferred camera-facing decorations from the previous outer layer.
    // They now render after this inner layer's cliff faces, so they're visible.
    for (const d of deferredEdgeDecos) {
      drawCellTerraceDecorations(
        ctx,
        d.cell,
        d.topX,
        d.topY,
        tileWidth,
        tileHeight,
        mapSeed,
        maxLayerIndex,
        themeKey,
        selectedMap
      );
    }

    deferredEdgeDecos = [];
    if (layerIdx > 0) {
      for (const d of layerCells) {
        if (d.southDrop > 0.5 || d.rightDrop > 0.5) {
          deferredEdgeDecos.push(d);
        }
      }
    }
  }

  // Draw any remaining deferred decos from the innermost terrace layer.
  for (const d of deferredEdgeDecos) {
    drawCellTerraceDecorations(
      ctx,
      d.cell,
      d.topX,
      d.topY,
      tileWidth,
      tileHeight,
      mapSeed,
      maxLayerIndex,
      themeKey,
      selectedMap
    );
  }

  const distanceByCell = new Array<number>(GRID_WIDTH * GRID_HEIGHT);
  for (let gy = 0; gy < GRID_HEIGHT; gy++) {
    for (let gx = 0; gx < GRID_WIDTH; gx++) {
      const idx = gy * GRID_WIDTH + gx;
      distanceByCell[idx] = topCells.has(toCellKey(gx, gy))
        ? 0
        : Number.POSITIVE_INFINITY;
    }
  }

  return distanceByCell;
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
  preRoadCallback,
  skipBackdrop,
}: RenderStaticMapLayerParams): { fogEndpoints: StaticMapFogEndpoint[] } {
  const mapSeed = [...selectedMap].reduce(
    (acc, c) => acc + c.codePointAt(0),
    0
  );
  const levelData = LEVEL_DATA[selectedMap];
  const mapThemeKey = levelData?.theme as
    | "grassland"
    | "swamp"
    | "desert"
    | "winter"
    | "volcanic"
    | undefined;
  const isChallengeMountainLevel =
    isMountainTerrainKind(levelData?.levelKind) &&
    !!mapThemeKey &&
    mapThemeKey in CHALLENGE_BACKDROP_PALETTES;
  const toScreen = (p: Position) =>
    worldToScreen(
      p,
      canvasWidthPx,
      canvasHeightPx,
      dpr,
      cameraOffset,
      cameraZoom
    );

  const tileWidth = TILE_SIZE * cameraZoom;
  const tileHeight = TILE_SIZE * ISO_TILE_HEIGHT_FACTOR * cameraZoom;
  let challengeDistanceByCell: number[] | null = null;

  if (isChallengeMountainLevel && mapThemeKey) {
    if (!skipBackdrop) {
      renderChallengeMountainBackdrop(
        ctx,
        cssWidth,
        cssHeight,
        mapSeed,
        mapThemeKey
      );
    }

    challengeDistanceByCell = renderChallengeWorldMountain(
      ctx,
      selectedMap,
      mapSeed,
      tileWidth,
      tileHeight,
      toScreen,
      mapThemeKey
    );
  } else {
    if (!skipBackdrop) {
      const gradient = ctx.createRadialGradient(
        cssWidth / 2,
        cssHeight / 2,
        0,
        cssWidth / 2,
        cssHeight / 2,
        cssWidth
      );
      gradient.addColorStop(0, theme.ground[0]);
      gradient.addColorStop(0.5, theme.ground[1]);
      gradient.addColorStop(1, theme.ground[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      const lightGrad = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
      lightGrad.addColorStop(0, "rgba(255,245,220,0.06)");
      lightGrad.addColorStop(0.4, "rgba(255,255,255,0)");
      lightGrad.addColorStop(0.7, "rgba(0,0,0,0)");
      lightGrad.addColorStop(1, "rgba(0,0,20,0.08)");
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      renderTerrainTexture({
        cssHeight,
        cssWidth,
        ctx,
        mapSeed,
        themeName: (mapThemeKey || "grassland") as MapTheme,
      });
    }
  }

  const gridRandom = createSeededRandom(mapSeed);

  const isChallengeTopLayer = !!challengeDistanceByCell;
  ctx.strokeStyle = hexToRgba(theme.accent, isChallengeTopLayer ? 0.05 : 0.07);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (challengeDistanceByCell) {
        const idx = y * GRID_WIDTH + x;
        if (!Number.isFinite(challengeDistanceByCell[idx])) {
          continue;
        }
      }
      const worldPos = gridToWorld({ x, y });
      const screenPos = toScreen(worldPos);
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(screenPos.x + tileWidth / 2, screenPos.y + tileHeight / 2);
      ctx.lineTo(screenPos.x, screenPos.y + tileHeight);
      ctx.lineTo(screenPos.x - tileWidth / 2, screenPos.y + tileHeight / 2);
      ctx.closePath();
    }
  }
  ctx.stroke();

  const tileColors = [theme.accent, theme.ground[0], theme.ground[1]];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (challengeDistanceByCell) {
        const idx = y * GRID_WIDTH + x;
        if (!Number.isFinite(challengeDistanceByCell[idx])) {
          continue;
        }
      }

      const n = domainWarpedNoise(x * 0.15, y * 0.15, mapSeed + 42, 3, 1.5);
      const worldPos = gridToWorld({ x, y });
      const screenPos = toScreen(worldPos);

      const baseAlpha = isChallengeTopLayer ? 0.01 : 0.02;
      const varAlpha = isChallengeTopLayer ? 0.015 : 0.035;
      const alpha = baseAlpha + n * varAlpha;

      let tileColor: string;
      if (n > 0.62) {
        tileColor = theme.accent;
      } else if (n < 0.32) {
        tileColor = theme.ground[2] ?? theme.ground[1];
      } else {
        tileColor =
          tileColors[Math.floor(n * tileColors.length) % tileColors.length];
      }

      ctx.fillStyle = hexToRgba(tileColor, alpha);
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(screenPos.x + tileWidth / 2, screenPos.y + tileHeight / 2);
      ctx.lineTo(screenPos.x, screenPos.y + tileHeight);
      ctx.lineTo(screenPos.x - tileWidth / 2, screenPos.y + tileHeight / 2);
      ctx.closePath();
      ctx.fill();

      if (gridRandom() > 0.93) {
        ctx.fillStyle = hexToRgba(theme.accent, 0.03 + gridRandom() * 0.03);
        ctx.fill();
      }
    }
  }

  if (preRoadCallback) {
    preRoadCallback(ctx);
  }

  const fogEndpoints: StaticMapFogEndpoint[] = [];
  const roads: RoadGeometry[] = [];
  const pathKeys = getLevelPathKeys(selectedMap);
  for (let i = 0; i < pathKeys.length; i++) {
    const pathKey = pathKeys[i];
    const pathPoints = MAP_PATHS[pathKey];
    if (!pathPoints || pathPoints.length < 2) {
      continue;
    }

    const road = buildRoadGeometry(pathPoints, mapSeed, toScreen);
    if (!road) {
      continue;
    }

    roads.push(road);
    fogEndpoints.push(...getFogEndpoints(road));
  }

  drawRoadsBatched(
    ctx,
    roads,
    theme,
    cameraZoom,
    mapSeed,
    0.72,
    true,
    toScreen
  );

  const themeName = LEVEL_DATA[selectedMap]?.theme || "grassland";
  if (getPerformanceSettings().showPathDecorations) {
    drawBatchedPathEdgeBlend(ctx, roads, theme);
    for (const road of roads) {
      drawPathDecorations({
        cameraZoom,
        ctx,
        mapSeed,
        screenCenter: road.screenCenter,
        screenLeft: road.screenLeft,
        screenRight: road.screenRight,
        smoothPath: road.smoothPath,
        theme,
        themeName,
        toScreen,
      });
    }
  }

  return { fogEndpoints };
}
