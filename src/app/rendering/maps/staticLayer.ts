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
import type { GridPosition, Position } from "../../types";
import {
  gridToWorld,
  gridToWorldPath,
  hexToRgb,
  hexToRgba,
  worldToScreen,
} from "../../utils";
import { createSeededRandom } from "../../utils/seededRandom";
import { clampRgb } from "../../utils/colorUtils";
import {
  CHALLENGE_MOUNTAIN_DEPTH,
  CHALLENGE_MOUNTAIN_SKIRT_LAYERS,
  getChallengeMountainGridBounds,
  getChallengePathSegments,
  isChallengeMountainTopCell,
} from "./challengeTerrain";
import { drawPathDecorations } from "./pathDecorations";
import { getPerformanceSettings } from "../performance";

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
  grassland: {
    skyTop: "#5a94b8",
    skyMid: "#88bdd0",
    skyBottom: "#c8e8cc",
    haze: "rgba(140, 200, 140, 0.28)",
    farRidge: "#4a7548",
    midRidge: "#3d6338",
    nearRidge: "#30522c",
    mountainTop: "#4a7c59",
    mountainLeft: "#3a3020",
    mountainRight: "#50421e",
    mountainFacetA: "#44381a",
    mountainFacetB: "#2e2410",
    mountainShadow: "#1a0f05",
    landHighlight: "#5a8a50",
    skyAccent: "rgba(200,240,200,0.22)",
    skyDecor: "rgba(74,124,89,0.6)",
  },
  swamp: {
    skyTop: "#2a3e30",
    skyMid: "#3d5840",
    skyBottom: "#6a8a6a",
    haze: "rgba(100, 150, 100, 0.35)",
    farRidge: "#2a3e2a",
    midRidge: "#1e3020",
    nearRidge: "#142418",
    mountainTop: "#2a4a2a",
    mountainLeft: "#1a2a1a",
    mountainRight: "#2a3a22",
    mountainFacetA: "#1e2e16",
    mountainFacetB: "#12200e",
    mountainShadow: "#0a150a",
    landHighlight: "#3a6a3a",
    skyAccent: "rgba(160,210,160,0.15)",
    skyDecor: "rgba(74,138,74,0.5)",
  },
  desert: {
    skyTop: "#a87a48",
    skyMid: "#d4a460",
    skyBottom: "#f5dca0",
    haze: "rgba(255, 230, 180, 0.25)",
    farRidge: "#a88050",
    midRidge: "#8b6838",
    nearRidge: "#7a5530",
    mountainTop: "#c4a060",
    mountainLeft: "#8b7355",
    mountainRight: "#a88860",
    mountainFacetA: "#9a7850",
    mountainFacetB: "#7a5e3a",
    mountainShadow: "#4a3820",
    landHighlight: "#daa520",
    skyAccent: "rgba(255,240,200,0.28)",
    skyDecor: "rgba(218,165,32,0.55)",
  },
  winter: {
    skyTop: "#4a6080",
    skyMid: "#78a0c0",
    skyBottom: "#c8ddf0",
    haze: "rgba(200, 220, 255, 0.35)",
    farRidge: "#5a7088",
    midRidge: "#4a6078",
    nearRidge: "#3a5068",
    mountainTop: "#6ba3be",
    mountainLeft: "#4a5a6a",
    mountainRight: "#5a6a7a",
    mountainFacetA: "#3a4a5a",
    mountainFacetB: "#2e3e50",
    mountainShadow: "#1e2a38",
    landHighlight: "#7ab0cc",
    skyAccent: "rgba(220,240,255,0.30)",
    skyDecor: "rgba(107,163,190,0.6)",
    mountainSnow: "#dceef8",
  },
  volcanic: {
    skyTop: "#2a1010",
    skyMid: "#4a1818",
    skyBottom: "#7a2e20",
    haze: "rgba(255, 68, 0, 0.14)",
    farRidge: "#3a1818",
    midRidge: "#2e1212",
    nearRidge: "#200c0c",
    mountainTop: "#4a2020",
    mountainLeft: "#2a1a1a",
    mountainRight: "#3a2424",
    mountainFacetA: "#301818",
    mountainFacetB: "#200e0e",
    mountainShadow: "#100606",
    landHighlight: "#6a2818",
    skyAccent: "rgba(255,100,30,0.12)",
    skyDecor: "rgba(255,68,0,0.45)",
  },
};

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

/**
 * Resamples a polyline at uniform arc-length intervals so point density stays
 * consistent regardless of how many input points exist.
 */
function resampleByArcLength(
  points: Position[],
  spacing: number,
): Position[] {
  if (points.length < 2) return points;

  const arcLengths = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    arcLengths.push(arcLengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }

  const totalLength = arcLengths[arcLengths.length - 1];
  if (totalLength < spacing) return points;

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
  toScreen: (pos: Position) => Position,
): RoadGeometry | null {
  if (path.length < 2) {
    return null;
  }
  const pathWorldPoints = path.map((p) => gridToWorldPath(p));
  const rawSmooth = generateSmoothPath(pathWorldPoints);
  const smoothPath = resampleByArcLength(rawSmooth, SMOOTH_PATH_SPACING);
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
    const rx =
      screenCenter[i].x + (screenRight[i].x - screenCenter[i].x) * 0.88;
    const ry =
      screenCenter[i].y + (screenRight[i].y - screenCenter[i].y) * 0.88;
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
      screenCenter[i].y +
      (screenLeft[i].y - screenCenter[i].y) * topLayerBlend -
      2;
    if (i === 0) {
      ctx.moveTo(lx, ly);
    } else {
      ctx.lineTo(lx, ly);
    }
  }
  for (let i = screenCenter.length - 1; i >= 0; i--) {
    const rx =
      screenCenter[i].x +
      (screenRight[i].x - screenCenter[i].x) * topLayerBlend;
    const ry =
      screenCenter[i].y +
      (screenRight[i].y - screenCenter[i].y) * topLayerBlend -
      2;
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

function drawFlatRidge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number,
  amplitude: number,
  segments: number,
  color: string,
  seed: number,
  jaggedness: number = 1,
): void {
  const rand = createSeededRandom(seed);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-60, height + 60);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -40 + t * (width + 80);
    const wave = Math.sin(t * Math.PI * (2.6 + rand() * 1.7)) * amplitude;
    const jitter = (rand() - 0.5) * amplitude * jaggedness;
    const y = baseY + wave + jitter;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width + 60, height + 60);
  ctx.closePath();
  ctx.fill();
}

function drawIsoTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number,
  fillStyle: string,
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
    /^rgba?\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)/i,
  );
  if (rgbMatch) {
    return {
      r: Number.parseFloat(rgbMatch[1] ?? "0"),
      g: Number.parseFloat(rgbMatch[2] ?? "0"),
      b: Number.parseFloat(rgbMatch[3] ?? "0"),
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
    clampRgb(rgb.b + amount),
  );
}

function tileNoise(gx: number, gy: number, seed: number): number {
  const value =
    Math.sin(gx * 12.9898 + gy * 78.233 + seed * 0.137) * 43758.5453;
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
  width: number,
  height: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, width * 0.42, height * 0.36, 0, 0, Math.PI * 2);
  ctx.ellipse(
    x - width * 0.24,
    y + 1,
    width * 0.26,
    height * 0.26,
    -0.08,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + width * 0.22,
    y + 1,
    width * 0.24,
    height * 0.23,
    0.12,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function renderChallengeSkyDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapSeed: number,
  themeKey: ChallengeThemeKey,
  palette: ChallengeBackdropPalette,
): void {
  const skyRandom = createSeededRandom(mapSeed + 1403);

  if (themeKey === "grassland") {
    for (let i = 0; i < 6; i++) {
      const x = width * (0.1 + i * 0.16) + (skyRandom() - 0.5) * 30;
      const y = height * (0.11 + skyRandom() * 0.18);
      drawSoftCloud(
        ctx,
        x,
        y,
        width * (0.08 + skyRandom() * 0.05),
        height * 0.06,
        palette.skyAccent,
      );
    }
    ctx.strokeStyle = "rgba(70, 90, 70, 0.45)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 10; i++) {
      const bx = width * (0.08 + skyRandom() * 0.84);
      const by = height * (0.17 + skyRandom() * 0.2);
      ctx.beginPath();
      ctx.moveTo(bx - 3, by);
      ctx.quadraticCurveTo(bx, by - 3, bx + 3, by);
      ctx.stroke();
    }
    return;
  }

  if (themeKey === "swamp") {
    for (let i = 0; i < 5; i++) {
      const fogY = height * (0.22 + i * 0.08);
      const fog = ctx.createLinearGradient(0, fogY - 28, 0, fogY + 28);
      fog.addColorStop(0, "rgba(216,240,220,0)");
      fog.addColorStop(0.55, "rgba(176,214,185,0.2)");
      fog.addColorStop(1, "rgba(216,240,220,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(-30, fogY - 28, width + 60, 56);
    }
    ctx.fillStyle = palette.skyDecor;
    for (let i = 0; i < 35; i++) {
      const x = skyRandom() * width;
      const y = skyRandom() * height * 0.42;
      const s = 0.5 + skyRandom() * 1.6;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (themeKey === "desert") {
    const sunX = width * 0.82;
    const sunY = height * 0.14;
    const sunGrad = ctx.createRadialGradient(
      sunX,
      sunY,
      4,
      sunX,
      sunY,
      width * 0.1,
    );
    sunGrad.addColorStop(0, "rgba(255,245,200,0.92)");
    sunGrad.addColorStop(0.45, "rgba(255,212,138,0.45)");
    sunGrad.addColorStop(1, "rgba(255,212,138,0)");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, width * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(215,165,95,0.22)";
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 22; i++) {
      const y = height * (0.15 + skyRandom() * 0.34);
      const x = width * (-0.1 + skyRandom() * 1.2);
      const len = width * (0.02 + skyRandom() * 0.08);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y + len * 0.08);
      ctx.stroke();
    }
    return;
  }

  if (themeKey === "winter") {
    const aurora = ctx.createLinearGradient(
      0,
      height * 0.03,
      width,
      height * 0.42,
    );
    aurora.addColorStop(0, "rgba(128, 215, 255, 0)");
    aurora.addColorStop(0.2, "rgba(128, 215, 255, 0.14)");
    aurora.addColorStop(0.55, "rgba(170, 244, 232, 0.18)");
    aurora.addColorStop(1, "rgba(128, 215, 255, 0)");
    ctx.strokeStyle = aurora;
    ctx.lineWidth = height * 0.04;
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.19);
    ctx.bezierCurveTo(
      width * 0.26,
      height * 0.09,
      width * 0.54,
      height * 0.28,
      width * 0.92,
      height * 0.15,
    );
    ctx.stroke();

    ctx.fillStyle = "rgba(226,243,255,0.62)";
    for (let i = 0; i < 65; i++) {
      const x = skyRandom() * width;
      const y = skyRandom() * height * 0.55;
      const size = 0.45 + skyRandom() * 1.25;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  // volcanic
  const smokeRandom = createSeededRandom(mapSeed + 1437);
  for (let p = 0; p < 4; p++) {
    const baseX = width * (0.28 + p * 0.14);
    const baseY = height * (0.18 + smokeRandom() * 0.08);
    for (let i = 0; i < 9; i++) {
      const drift = i * 9;
      ctx.fillStyle = `rgba(70, 65, 65, ${0.16 - i * 0.012})`;
      ctx.beginPath();
      ctx.ellipse(
        baseX + Math.sin(i * 0.7 + p) * 10,
        baseY - drift,
        10 + i * 2.4,
        6 + i * 1.8,
        0.1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.fillStyle = palette.skyDecor;
  for (let i = 0; i < 70; i++) {
    const x = smokeRandom() * width;
    const y = smokeRandom() * height * 0.58;
    const size = 0.5 + smokeRandom() * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIsometricMountainMass(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapSeed: number,
  themeKey: ChallengeThemeKey,
  palette: ChallengeBackdropPalette,
): void {
  const rand = createSeededRandom(mapSeed + 1601);
  const ridgeSegments =
    themeKey === "volcanic" ? 12 : themeKey === "desert" ? 10 : 9;
  const ridgeBaseY =
    themeKey === "winter"
      ? height * 0.29
      : themeKey === "volcanic"
        ? height * 0.31
        : themeKey === "desert"
          ? height * 0.34
          : height * 0.33;
  const ridgeAmplitude =
    themeKey === "winter"
      ? height * 0.12
      : themeKey === "volcanic"
        ? height * 0.135
        : themeKey === "desert"
          ? height * 0.095
          : height * 0.105;

  const ridgePoints: Position[] = [];
  for (let i = 0; i <= ridgeSegments; i++) {
    const t = i / ridgeSegments;
    const x = -width * 0.1 + t * width * 1.2;
    const wave = Math.sin((t * 2.7 + rand() * 0.3) * Math.PI) * ridgeAmplitude;
    const shoulder = Math.abs(t - 0.5) * height * 0.07;
    const jitter = (rand() - 0.5) * height * 0.03;
    ridgePoints.push({
      x,
      y: ridgeBaseY + shoulder - wave + jitter,
    });
  }

  const basePoints = ridgePoints.map((p, i) => {
    const t = i / ridgeSegments;
    return {
      x: p.x + (rand() - 0.5) * width * 0.05,
      y: height * (0.93 + Math.abs(t - 0.5) * 0.11 + rand() * 0.03),
    };
  });

  const mountainShadow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.9,
    width * 0.08,
    width * 0.5,
    height * 0.9,
    width * 0.6,
  );
  mountainShadow.addColorStop(0, hexToRgba(palette.mountainShadow, 0.45));
  mountainShadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mountainShadow;
  ctx.beginPath();
  ctx.ellipse(
    width * 0.5,
    height * 0.9,
    width * 0.54,
    height * 0.16,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  for (let i = 0; i < ridgePoints.length - 1; i++) {
    const topLeft = ridgePoints[i];
    const topRight = ridgePoints[i + 1];
    const bottomLeft = basePoints[i];
    const bottomRight = basePoints[i + 1];
    ctx.fillStyle =
      i % 2 === 0 ? palette.mountainFacetA : palette.mountainFacetB;
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.fill();
  }

  const crestDepth = themeKey === "desert" ? height * 0.07 : height * 0.08;
  ctx.fillStyle = palette.mountainTop;
  ctx.beginPath();
  ctx.moveTo(ridgePoints[0].x, ridgePoints[0].y);
  for (let i = 1; i < ridgePoints.length; i++) {
    ctx.lineTo(ridgePoints[i].x, ridgePoints[i].y);
  }
  for (let i = ridgePoints.length - 1; i >= 0; i--) {
    const p = ridgePoints[i];
    const t = i / ridgeSegments - 0.5;
    ctx.lineTo(p.x - t * width * 0.06, p.y + crestDepth);
  }
  ctx.closePath();
  ctx.fill();

  const leftShade = ctx.createLinearGradient(
    0,
    height * 0.24,
    width * 0.5,
    height,
  );
  leftShade.addColorStop(0, hexToRgba(palette.mountainLeft, 0.38));
  leftShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = leftShade;
  ctx.beginPath();
  ctx.moveTo(-40, height);
  ctx.lineTo(ridgePoints[0].x, ridgePoints[0].y + 8);
  for (let i = 1; i <= Math.floor(ridgeSegments / 2); i++) {
    ctx.lineTo(ridgePoints[i].x, ridgePoints[i].y + 2);
  }
  ctx.lineTo(width * 0.48, height * 1.02);
  ctx.closePath();
  ctx.fill();

  const rightShade = ctx.createLinearGradient(
    width,
    height * 0.23,
    width * 0.5,
    height,
  );
  rightShade.addColorStop(0, hexToRgba(palette.mountainRight, 0.42));
  rightShade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rightShade;
  ctx.beginPath();
  ctx.moveTo(width + 40, height);
  ctx.lineTo(
    ridgePoints[ridgePoints.length - 1].x,
    ridgePoints[ridgePoints.length - 1].y + 10,
  );
  for (let i = ridgePoints.length - 2; i >= Math.ceil(ridgeSegments / 2); i--) {
    ctx.lineTo(ridgePoints[i].x, ridgePoints[i].y + 2);
  }
  ctx.lineTo(width * 0.52, height * 1.02);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = hexToRgba(palette.mountainShadow, 0.35);
  ctx.lineWidth = 1;
  for (let i = 1; i < ridgePoints.length - 1; i += 2) {
    const top = ridgePoints[i];
    const bottom = basePoints[Math.min(i + 1, basePoints.length - 1)];
    ctx.beginPath();
    ctx.moveTo(top.x, top.y + 2);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.stroke();
  }

  if (themeKey === "winter" && palette.mountainSnow) {
    const topPeaks = ridgePoints
      .map((point, index) => ({ point, index }))
      .sort((a, b) => a.point.y - b.point.y)
      .slice(0, 4);
    ctx.fillStyle = palette.mountainSnow;
    topPeaks.forEach(({ point, index }) => {
      const next = ridgePoints[Math.min(index + 1, ridgePoints.length - 1)];
      const prev = ridgePoints[Math.max(0, index - 1)];
      ctx.beginPath();
      ctx.moveTo(point.x, point.y + 3);
      ctx.lineTo(
        prev.x + (point.x - prev.x) * 0.42,
        point.y + crestDepth * 0.55,
      );
      ctx.lineTo(
        next.x - (next.x - point.x) * 0.42,
        point.y + crestDepth * 0.6,
      );
      ctx.closePath();
      ctx.fill();
    });
  } else if (themeKey === "desert") {
    ctx.strokeStyle = hexToRgba(palette.landHighlight, 0.24);
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const y = height * (0.57 + i * 0.033);
      ctx.beginPath();
      ctx.ellipse(
        width * (0.22 + i * 0.065),
        y,
        width * (0.12 + i * 0.03),
        height * 0.05,
        -0.2,
        Math.PI * 0.95,
        Math.PI * 1.86,
      );
      ctx.stroke();
    }
  } else if (themeKey === "swamp") {
    for (let i = 0; i < 4; i++) {
      const fogY = height * (0.62 + i * 0.07);
      const fog = ctx.createLinearGradient(0, fogY - 24, 0, fogY + 24);
      fog.addColorStop(0, "rgba(215,245,224,0)");
      fog.addColorStop(0.5, "rgba(170,206,183,0.16)");
      fog.addColorStop(1, "rgba(215,245,224,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(-30, fogY - 24, width + 60, 48);
    }
  } else if (themeKey === "volcanic") {
    ctx.strokeStyle = "rgba(255,118,66,0.3)";
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 6; i++) {
      const x = width * (0.44 + i * 0.022);
      const y = height * (0.48 + i * 0.04);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (i % 2 === 0 ? 9 : -9), y + 36 + i * 9);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = hexToRgba(palette.landHighlight, 0.22);
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const y = height * (0.6 + i * 0.04);
      ctx.beginPath();
      ctx.ellipse(
        width * (0.23 + i * 0.08),
        y,
        width * (0.1 + i * 0.026),
        height * 0.045,
        -0.15,
        Math.PI * 0.95,
        Math.PI * 1.86,
      );
      ctx.stroke();
    }
  }
}

function renderChallengeMountainBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapSeed: number,
  themeKey: ChallengeThemeKey,
): void {
  const palette = CHALLENGE_BACKDROP_PALETTES[themeKey];
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, palette.skyTop);
  skyGrad.addColorStop(0.5, palette.skyMid);
  skyGrad.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  const hazeGrad = ctx.createLinearGradient(0, height * 0.15, 0, height * 0.72);
  hazeGrad.addColorStop(0, "rgba(255,255,255,0)");
  hazeGrad.addColorStop(0.5, palette.haze);
  hazeGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, width, height);

  renderChallengeSkyDecorations(ctx, width, height, mapSeed, themeKey, palette);

  drawFlatRidge(
    ctx,
    width,
    height,
    height * 0.29,
    height * 0.04,
    11,
    palette.farRidge,
    mapSeed + 901,
  );
  drawFlatRidge(
    ctx,
    width,
    height,
    height * 0.37,
    height * 0.055,
    13,
    palette.midRidge,
    mapSeed + 947,
    1.2,
  );
  drawFlatRidge(
    ctx,
    width,
    height,
    height * 0.47,
    height * 0.07,
    15,
    palette.nearRidge,
    mapSeed + 983,
    1.35,
  );

  drawIsometricMountainMass(ctx, width, height, mapSeed, themeKey, palette);

  const atmosphere = ctx.createLinearGradient(0, height * 0.44, 0, height);
  atmosphere.addColorStop(0, "rgba(0,0,0,0)");
  atmosphere.addColorStop(0.7, hexToRgba(palette.mountainShadow, 0.08));
  atmosphere.addColorStop(1, hexToRgba(palette.mountainShadow, 0.24));
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
  themeKey: ChallengeThemeKey,
): number[] | null {
  const segments = getChallengePathSegments(selectedMap);
  const palette = CHALLENGE_BACKDROP_PALETTES[themeKey];
  const bounds = getChallengeMountainGridBounds(segments);
  const topCells = new Set<string>();

  for (let gy = bounds.minY; gy <= bounds.maxY; gy++) {
    for (let gx = bounds.minX; gx <= bounds.maxX; gx++) {
      if (!isChallengeMountainTopCell(gx, gy, segments)) continue;
      topCells.add(toCellKey(gx, gy));
    }
  }

  if (topCells.size === 0) return null;

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
        if (layerIndexByCell.has(nextKey)) continue;
        layerIndexByCell.set(nextKey, layer + 1);
        ring.add(nextKey);
      }
    });
    if (ring.size === 0) break;
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
  const blockHeight =
    CHALLENGE_MOUNTAIN_DEPTH.terraceStep * CHALLENGE_TERRACE_BLOCK_SCALE;
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
      Math.round(randomBlocks * 2) / 2,
    );
    cumulativeLayerDepth += quantizedBlocks * blockHeight;
    layerDepthByIndex[layer] = cumulativeLayerDepth;
  }
  const fallbackStepDepth =
    maxLayerIndex > 0
      ? layerDepthByIndex[maxLayerIndex] - layerDepthByIndex[maxLayerIndex - 1]
      : blockHeight * CHALLENGE_TOP_TIER_MIN_BLOCKS;
  const depthForLayer = (layerIndex: number): number => {
    if (layerIndex <= 0) return 0;
    if (layerIndex <= maxLayerIndex) {
      return layerDepthByIndex[layerIndex] ?? 0;
    }
    const lastDepth = layerDepthByIndex[maxLayerIndex] ?? 0;
    return lastDepth + (layerIndex - maxLayerIndex) * fallbackStepDepth;
  };
  const voidDepth = Math.max(
    CHALLENGE_MOUNTAIN_DEPTH.baseShadow,
    depthForLayer(maxLayerIndex + 2),
  );
  const seamOverlap = Math.max(1.5, tileHeight * 0.14);
  const getLayerIndex = (gx: number, gy: number): number | null => {
    const layer = towerLayerIndexByCell.get(toCellKey(gx, gy));
    return typeof layer === "number" ? layer : null;
  };
  const getNeighborInfo = (
    gx: number,
    gy: number,
  ): { exists: boolean; depth: number } => {
    const layer = getLayerIndex(gx, gy);
    if (layer === null) {
      return { exists: false, depth: voidDepth };
    }
    return { exists: true, depth: depthForLayer(layer) };
  };

  const renderCells = Array.from(layerIndexByCell.entries())
    .map(([key, rawLayerIndex]) => {
      const { gx, gy } = parseCellKey(key);
      const worldPos = gridToWorld({ x: gx, y: gy });
      const screenPos = toScreen(worldPos);
      const towerLayerIndex = towerLayerIndexByCell.get(key) ?? 0;
      return {
        key,
        gx,
        gy,
        layerIndex: towerLayerIndex,
        rawLayerIndex,
        depth: depthForLayer(towerLayerIndex),
        screenPos,
      };
    })
    .sort((a, b) => {
      const ay = a.screenPos.y + a.depth;
      const by = b.screenPos.y + b.depth;
      if (Math.abs(ay - by) > 0.001) return ay - by;
      return a.screenPos.x - b.screenPos.x;
    });

  type PrecomputedCell = {
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
  };

  const precomputed: PrecomputedCell[] = renderCells.map((cell) => {
    const topNoise = tileNoise(
      cell.gx,
      cell.gy,
      mapSeed + 257 + cell.rawLayerIndex * 11,
    );
    const cliffNoise = tileNoise(
      cell.gx,
      cell.gy,
      mapSeed + 743 + cell.rawLayerIndex * 17,
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
      cell,
      topNoise,
      cliffNoise,
      layerNorm,
      northDrop,
      westDrop,
      northwestDrop,
      northeastDrop,
      southwestDrop,
      rightDrop,
      southDrop,
      southeastDrop,
      topX: cell.screenPos.x,
      topY: tileTopY,
      rightX: cell.screenPos.x + tileWidth * 0.5,
      rightY: tileTopY + tileHeight * 0.5,
      leftX: cell.screenPos.x - tileWidth * 0.5,
      leftY: tileTopY + tileHeight * 0.5,
      bottomX: cell.screenPos.x,
      bottomY: tileTopY + tileHeight,
    };
  });

  const cellsByLayer = new Map<number, PrecomputedCell[]>();
  for (const d of precomputed) {
    const arr = cellsByLayer.get(d.cell.layerIndex);
    if (arr) arr.push(d);
    else cellsByLayer.set(d.cell.layerIndex, [d]);
  }
  const sortedLayerIndices = Array.from(cellsByLayer.keys()).sort(
    (a, b) => b - a,
  );

  const drawBackFaces = (d: PrecomputedCell) => {
    if (d.northDrop > 0.5) {
      const northColor = shadeHexColor(
        blendHexColors(
          palette.mountainRight,
          palette.mountainFacetB,
          0.08 + d.layerNorm * 0.26 + d.cliffNoise * 0.1,
        ),
        -14,
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
          0.08 + d.layerNorm * 0.22 + d.cliffNoise * 0.1,
        ),
        -12,
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
      d.northwestDrop > 0.5 ? d.northwestDrop * 0.74 : 0,
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
      0.32 + (1 - d.layerNorm) * 0.12 + d.topNoise * 0.15,
    );
    const topColor = shadeHexColor(
      blendHexColors(topBase, palette.mountainFacetA, d.layerNorm * 0.26),
      Math.round((d.topNoise - 0.48) * 12),
    );
    drawIsoTile(
      ctx,
      d.cell.screenPos.x,
      d.cell.screenPos.y + d.cell.depth,
      tileWidth,
      tileHeight,
      topColor,
    );

    if (d.topNoise > 0.34) {
      ctx.strokeStyle = hexToRgba(
        palette.mountainShadow,
        0.14 + d.topNoise * 0.08,
      );
      ctx.lineWidth = Math.max(0.52, tileHeight * 0.045);
      ctx.beginPath();
      ctx.moveTo(
        d.cell.screenPos.x - tileWidth * 0.16,
        d.cell.screenPos.y +
          d.cell.depth +
          tileHeight * (0.43 + d.topNoise * 0.06),
      );
      ctx.lineTo(
        d.cell.screenPos.x + tileWidth * (0.18 + d.topNoise * 0.05),
        d.cell.screenPos.y +
          d.cell.depth +
          tileHeight * (0.5 + d.topNoise * 0.07),
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
          0.22 + d.layerNorm * 0.45 + d.cliffNoise * 0.15,
        ),
        -4,
      );
      const rightColorBot = shadeHexColor(
        rightColorTop,
        -18 - Math.round(d.layerNorm * 8),
      );
      const rightGrad = ctx.createLinearGradient(
        0,
        (d.rightY + d.bottomY) * 0.5,
        0,
        (d.rightY + d.bottomY) * 0.5 + d.rightDrop,
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
        0.22 + d.layerNorm * 0.18,
      );
      ctx.lineWidth = Math.max(0.6, tileHeight * 0.05);
      const rightLineCount = Math.max(
        1,
        Math.floor(d.rightDrop / (blockHeight * 0.9)),
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
          0.2 + d.layerNorm * 0.4 + d.cliffNoise * 0.12,
        ),
        0,
      );
      const leftColorBot = shadeHexColor(
        leftColorTop,
        -16 - Math.round(d.layerNorm * 6),
      );
      const leftGrad = ctx.createLinearGradient(
        0,
        (d.leftY + d.bottomY) * 0.5,
        0,
        (d.leftY + d.bottomY) * 0.5 + d.southDrop,
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
        0.18 + d.layerNorm * 0.16,
      );
      ctx.lineWidth = Math.max(0.55, tileHeight * 0.045);
      const southLineCount = Math.max(
        1,
        Math.floor(d.southDrop / (blockHeight * 0.88)),
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
      d.northeastDrop > 0.5 ? d.northeastDrop * 0.74 : 0,
    );
    if (rightCornerDrop > 0.5) {
      ctx.fillStyle = hexToRgba(palette.mountainShadow, 0.24);
      ctx.beginPath();
      ctx.moveTo(d.rightX + seamOverlap * 0.25, d.rightY);
      ctx.lineTo(
        d.rightX + tileWidth * 0.08,
        d.rightY + rightCornerDrop * 0.78,
      );
      ctx.lineTo(
        d.rightX - tileWidth * 0.08,
        d.rightY + rightCornerDrop * 0.78,
      );
      ctx.closePath();
      ctx.fill();
    }

    const leftCornerDrop = Math.max(
      Math.min(d.westDrop, d.southDrop),
      d.southwestDrop > 0.5 ? d.southwestDrop * 0.74 : 0,
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
      d.southeastDrop > 0.5 ? d.southeastDrop * 0.78 : 0,
    );
    if (bottomCornerDrop > 0.5) {
      ctx.fillStyle = hexToRgba(palette.mountainShadow, 0.28);
      ctx.beginPath();
      ctx.moveTo(d.bottomX, d.bottomY - seamOverlap);
      ctx.lineTo(
        d.bottomX + tileWidth * 0.09,
        d.bottomY + bottomCornerDrop * 0.8,
      );
      ctx.lineTo(
        d.bottomX - tileWidth * 0.09,
        d.bottomY + bottomCornerDrop * 0.8,
      );
      ctx.closePath();
      ctx.fill();
    }
  };

  for (const layerIdx of sortedLayerIndices) {
    const layerCells = cellsByLayer.get(layerIdx)!;
    layerCells.sort((a, b) => {
      const ay = a.topY;
      const by = b.topY;
      if (Math.abs(ay - by) > 0.001) return ay - by;
      return a.topX - b.topX;
    });
    for (const d of layerCells) {
      drawBackFaces(d);
      drawTopTile(d);
      drawFrontFaces(d);
    }
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
}: RenderStaticMapLayerParams): { fogEndpoints: StaticMapFogEndpoint[] } {
  const mapSeed = selectedMap
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const levelData = LEVEL_DATA[selectedMap];
  const mapThemeKey = levelData?.theme as
    | "grassland"
    | "swamp"
    | "desert"
    | "winter"
    | "volcanic"
    | undefined;
  const isChallengeMountainLevel =
    levelData?.levelKind === "challenge" &&
    !!mapThemeKey &&
    mapThemeKey in CHALLENGE_BACKDROP_PALETTES;
  const toScreen = (p: Position) =>
    worldToScreen(
      p,
      canvasWidthPx,
      canvasHeightPx,
      dpr,
      cameraOffset,
      cameraZoom,
    );

  const tileWidth = TILE_SIZE * cameraZoom;
  const tileHeight = TILE_SIZE * ISO_TILE_HEIGHT_FACTOR * cameraZoom;
  let challengeDistanceByCell: number[] | null = null;

  if (isChallengeMountainLevel && mapThemeKey) {
    renderChallengeMountainBackdrop(
      ctx,
      cssWidth,
      cssHeight,
      mapSeed,
      mapThemeKey,
    );

    challengeDistanceByCell = renderChallengeWorldMountain(
      ctx,
      selectedMap,
      mapSeed,
      tileWidth,
      tileHeight,
      toScreen,
      mapThemeKey,
    );
  } else {
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
  }

  const gridRandom = createSeededRandom(mapSeed);

  const isChallengeTopLayer = !!challengeDistanceByCell;
  ctx.strokeStyle = hexToRgba(theme.accent, isChallengeTopLayer ? 0.07 : 0.1);
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

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (challengeDistanceByCell) {
        const idx = y * GRID_WIDTH + x;
        if (!Number.isFinite(challengeDistanceByCell[idx])) {
          continue;
        }
      }
      if (gridRandom() > 0.7) {
        const worldPos = gridToWorld({ x, y });
        const screenPos = toScreen(worldPos);
        const tintBaseAlpha = isChallengeTopLayer ? 0.01 : 0.02;
        const tintVarAlpha = isChallengeTopLayer ? 0.02 : 0.03;
        ctx.fillStyle = hexToRgba(
          theme.accent,
          tintBaseAlpha + gridRandom() * tintVarAlpha,
        );
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

  if (preRoadCallback) {
    preRoadCallback(ctx);
  }

  const fogEndpoints: StaticMapFogEndpoint[] = [];
  const roads: RoadGeometry[] = [];
  const pathKeys = getLevelPathKeys(selectedMap);
  for (let i = 0; i < pathKeys.length; i++) {
    const pathKey = pathKeys[i];
    const pathPoints = MAP_PATHS[pathKey];
    if (!pathPoints || pathPoints.length < 2) continue;

    const road = buildRoadGeometry(pathPoints, mapSeed, toScreen);
    if (!road) continue;

    roads.push(road);
    drawRoad(ctx, road, theme, cameraZoom, mapSeed, 0.72, true, toScreen);
    fogEndpoints.push(...getFogEndpoints(road));
  }

  const themeName = LEVEL_DATA[selectedMap]?.theme || "grassland";
  if (getPerformanceSettings().showPathDecorations) {
    for (const road of roads) {
      drawPathDecorations({
        ctx,
        screenCenter: road.screenCenter,
        screenLeft: road.screenLeft,
        screenRight: road.screenRight,
        smoothPath: road.smoothPath,
        theme,
        themeName,
        cameraZoom,
        mapSeed,
        toScreen,
      });
    }
  }

  return { fogEndpoints };
}
