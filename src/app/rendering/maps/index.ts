// Princeton Tower Defense - Maps Rendering Module
// Renders map backgrounds, paths, and environment effects

import type { Position } from "../../types";
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, MAP_PATHS } from "../../constants";
import { worldToScreen, gridToWorld } from "../../utils";
import { colorWithAlpha } from "../helpers";

// Re-export environment effects
export {
  renderEnvironment,
  renderAmbientVisuals,
  renderGrasslandEnvironment,
  renderDesertEnvironment,
  renderWinterEnvironment,
  renderVolcanicEnvironment,
  renderSwampEnvironment,
} from "./environment";

// ============================================================================
// MAP THEME COLORS
// ============================================================================

export const MAP_THEMES: Record<string, {
  ground: string;
  groundDark: string;
  groundLight: string;
  path: string;
  pathDark: string;
  accent: string;
  water?: string;
  fog?: string;
}> = {
  nassau: {
    ground: "#4a7c59",
    groundDark: "#3a6a49",
    groundLight: "#5a8c69",
    path: "#8b7355",
    pathDark: "#6b5335",
    accent: "#f97316",
  },
  poe: {
    ground: "#3d4d3d",
    groundDark: "#2d3d2d",
    groundLight: "#4d5d4d",
    path: "#5a4a3a",
    pathDark: "#4a3a2a",
    accent: "#8b5cf6",
  },
  carnegie: {
    ground: "#4a5568",
    groundDark: "#3a4558",
    groundLight: "#5a6578",
    path: "#6b7280",
    pathDark: "#5b6270",
    accent: "#f59e0b",
  },
  caldera: {
    ground: "#5c4033",
    groundDark: "#4c3023",
    groundLight: "#6c5043",
    path: "#8b4513",
    pathDark: "#6b2503",
    accent: "#ef4444",
  },
  glacier: {
    ground: "#94a3b8",
    groundDark: "#84939a",
    groundLight: "#a4b3c8",
    path: "#e2e8f0",
    pathDark: "#c2c8d0",
    accent: "#3b82f6",
    water: "#60a5fa",
  },
  oasis: {
    ground: "#d4b896",
    groundDark: "#c4a886",
    groundLight: "#e4c8a6",
    path: "#fbbf24",
    pathDark: "#db9f04",
    accent: "#10b981",
    water: "#22d3ee",
  },
  pyramid: {
    ground: "#c4a77d",
    groundDark: "#b4976d",
    groundLight: "#d4b78d",
    path: "#92754a",
    pathDark: "#82653a",
    accent: "#fbbf24",
  },
  murky_bog: {
    ground: "#3d4d3d",
    groundDark: "#2d3d2d",
    groundLight: "#4d5d4d",
    path: "#5a6a4a",
    pathDark: "#4a5a3a",
    accent: "#84cc16",
    water: "#4a5d23",
    fog: "rgba(50, 70, 50, 0.3)",
  },
  fortress: {
    ground: "#64748b",
    groundDark: "#54647b",
    groundLight: "#74849b",
    path: "#475569",
    pathDark: "#374559",
    accent: "#dc2626",
  },
  lava_fields: {
    ground: "#3d2817",
    groundDark: "#2d1807",
    groundLight: "#4d3827",
    path: "#5c3d2e",
    pathDark: "#4c2d1e",
    accent: "#f97316",
  },
  sunken_temple: {
    ground: "#1e3a3a",
    groundDark: "#0e2a2a",
    groundLight: "#2e4a4a",
    path: "#2a4a5a",
    pathDark: "#1a3a4a",
    accent: "#06b6d4",
    water: "#0e7490",
  },
  peak: {
    ground: "#6b7280",
    groundDark: "#5b6270",
    groundLight: "#7b8290",
    path: "#9ca3af",
    pathDark: "#8c939f",
    accent: "#f3f4f6",
  },
  sphinx: {
    ground: "#d4a574",
    groundDark: "#c49564",
    groundLight: "#e4b584",
    path: "#b8860b",
    pathDark: "#a8760b",
    accent: "#fbbf24",
  },
  throne: {
    ground: "#1f2937",
    groundDark: "#0f1927",
    groundLight: "#2f3947",
    path: "#374151",
    pathDark: "#273141",
    accent: "#c9a227",
  },
  witch_hut: {
    ground: "#2d2d3d",
    groundDark: "#1d1d2d",
    groundLight: "#3d3d4d",
    path: "#4a3a4a",
    pathDark: "#3a2a3a",
    accent: "#a855f7",
    fog: "rgba(100, 50, 150, 0.2)",
  },
};

// ============================================================================
// MAIN MAP RENDER FUNCTION
// ============================================================================

export function renderMapBackground(
  ctx: CanvasRenderingContext2D,
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const theme = MAP_THEMES[selectedMap] || MAP_THEMES.nassau;
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;

  ctx.save();

  // Fill entire canvas with ground color
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Grid tiles
  for (let gx = 0; gx < GRID_WIDTH; gx++) {
    for (let gy = 0; gy < GRID_HEIGHT; gy++) {
      const worldPos = gridToWorld({ x: gx, y: gy });
      const screenPos = worldToScreen(
        worldPos,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom
      );

      drawGroundTile(ctx, screenPos.x, screenPos.y, theme, zoom, gx, gy);
    }
  }

  // Map-specific environmental effects
  renderEnvironmentalEffects(ctx, selectedMap, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom, time);

  ctx.restore();
}

// ============================================================================
// GROUND TILE RENDERING
// ============================================================================

function drawGroundTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: typeof MAP_THEMES[string],
  zoom: number,
  gx: number,
  gy: number
): void {
  const tileWidth = TILE_SIZE * 0.866 * zoom;
  const tileHeight = TILE_SIZE * 0.5 * zoom;

  // Checkerboard pattern
  const isDark = (gx + gy) % 2 === 0;
  const baseColor = isDark ? theme.groundDark : theme.ground;

  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(x, y - tileHeight);
  ctx.lineTo(x + tileWidth, y);
  ctx.lineTo(x, y + tileHeight);
  ctx.lineTo(x - tileWidth, y);
  ctx.closePath();
  ctx.fill();

  // Subtle grid lines
  ctx.strokeStyle = colorWithAlpha(theme.groundLight, 0.15);
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();
}

// ============================================================================
// PATH RENDERING
// ============================================================================

export function renderPath(
  ctx: CanvasRenderingContext2D,
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const paths = MAP_PATHS[selectedMap];
  if (!paths) return;

  const theme = MAP_THEMES[selectedMap] || MAP_THEMES.nassau;
  const zoom = cameraZoom || 1;
  const pathWidth = 30 * zoom;

  ctx.save();

  // Handle both single path and multiple paths
  const pathArrays = Array.isArray(paths[0]) && Array.isArray(paths[0][0])
    ? (paths as unknown as Position[][])
    : ([paths] as unknown as Position[][]);

  for (const path of pathArrays) {
    if (path.length < 2) continue;

    // Path shadow
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = pathWidth + 4 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    const startScreen = worldToScreen(path[0], canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
    ctx.moveTo(startScreen.x + 3 * zoom, startScreen.y + 3 * zoom);

    for (let i = 1; i < path.length; i++) {
      const screenPos = worldToScreen(path[i], canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
      ctx.lineTo(screenPos.x + 3 * zoom, screenPos.y + 3 * zoom);
    }
    ctx.stroke();

    // Main path
    ctx.strokeStyle = theme.path;
    ctx.lineWidth = pathWidth;

    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);

    for (let i = 1; i < path.length; i++) {
      const screenPos = worldToScreen(path[i], canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
      ctx.lineTo(screenPos.x, screenPos.y);
    }
    ctx.stroke();

    // Path edge highlights
    ctx.strokeStyle = theme.pathDark;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Path texture/details
    renderPathDetails(ctx, path, theme, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
  }

  ctx.restore();
}

function renderPathDetails(
  ctx: CanvasRenderingContext2D,
  path: Position[],
  theme: typeof MAP_THEMES[string],
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const zoom = cameraZoom || 1;

  // Add some texture dots along the path
  ctx.fillStyle = colorWithAlpha(theme.pathDark, 0.3);

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const steps = Math.floor(dist / 20);

    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      const px = p1.x + (p2.x - p1.x) * t;
      const py = p1.y + (p2.y - p1.y) * t;

      // Add some randomness
      const offsetX = (Math.sin(i * 3 + j * 7) * 8);
      const offsetY = (Math.cos(i * 5 + j * 11) * 8);

      const screenPos = worldToScreen(
        { x: px + offsetX, y: py + offsetY },
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom
      );

      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================================================
// ENVIRONMENTAL EFFECTS
// ============================================================================

function renderEnvironmentalEffects(
  ctx: CanvasRenderingContext2D,
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  time: number = 0
): void {
  const theme = MAP_THEMES[selectedMap] || MAP_THEMES.nassau;

  switch (selectedMap) {
    case "glacier":
      
      renderSnowEffect(ctx, canvasWidth, canvasHeight, time);
      break;
    case "murky_bog":
    case "witch_hut":
      if (theme.fog) {
        renderFogEffect(ctx, canvasWidth, canvasHeight, theme.fog, time);
      }
      break;
    case "lava_fields":
    case "caldera":
      renderHeatDistortion(ctx, canvasWidth, canvasHeight, time);
      break;
    case "sunken_temple":
      renderUnderwaterEffect(ctx, canvasWidth, canvasHeight, time);
      break;
  }
}

function renderSnowEffect(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";

  for (let i = 0; i < 50; i++) {
    const x = (Math.sin(time * 0.5 + i * 0.7) * 0.5 + 0.5 + i * 0.02) % 1 * canvasWidth;
    const y = ((time * 50 + i * 30) % canvasHeight);
    const size = 2 + Math.sin(i) * 1;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderFogEffect(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  fogColor: string,
  time: number
): void {
  // Animated fog patches
  for (let i = 0; i < 5; i++) {
    const x = (Math.sin(time * 0.3 + i * 1.5) * 0.3 + 0.5) * canvasWidth;
    const y = (Math.cos(time * 0.2 + i * 2) * 0.3 + 0.5) * canvasHeight;
    const radius = 150 + Math.sin(time + i) * 50;

    const fogGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    fogGrad.addColorStop(0, fogColor);
    fogGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderHeatDistortion(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  // Rising heat waves
  ctx.strokeStyle = "rgba(255, 100, 0, 0.1)";
  ctx.lineWidth = 30;

  for (let i = 0; i < 8; i++) {
    const x = (i / 8) * canvasWidth;
    const waveOffset = Math.sin(time * 2 + i) * 20;

    ctx.beginPath();
    ctx.moveTo(x + waveOffset, canvasHeight);

    for (let y = canvasHeight; y > 0; y -= 30) {
      const xOffset = Math.sin(time * 3 + y * 0.02 + i) * 15;
      ctx.lineTo(x + xOffset, y);
    }

    ctx.stroke();
  }
}

function renderUnderwaterEffect(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  // Light rays
  ctx.fillStyle = "rgba(100, 200, 255, 0.05)";

  for (let i = 0; i < 5; i++) {
    const x = (i / 5) * canvasWidth + Math.sin(time * 0.5 + i) * 50;
    const width = 50 + Math.sin(time + i * 2) * 20;

    ctx.beginPath();
    ctx.moveTo(x - width, 0);
    ctx.lineTo(x + width, 0);
    ctx.lineTo(x + width * 2, canvasHeight);
    ctx.lineTo(x - width * 2, canvasHeight);
    ctx.closePath();
    ctx.fill();
  }

  // Bubbles
  ctx.fillStyle = "rgba(150, 220, 255, 0.4)";
  for (let i = 0; i < 15; i++) {
    const x = (Math.sin(i * 3.7) * 0.5 + 0.5) * canvasWidth;
    const y = canvasHeight - ((time * 30 + i * 50) % canvasHeight);
    const size = 3 + Math.sin(i * 2.3) * 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// SPAWN/EXIT INDICATORS
// ============================================================================

export function renderSpawnPoint(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(pos, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const pulse = 0.5 + Math.sin(time * 3) * 0.3;

  // Glowing circle
  ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, 30 * zoom, 15 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Arrow indicator
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(screenPos.x, screenPos.y - 20 * zoom);
  ctx.lineTo(screenPos.x - 8 * zoom, screenPos.y - 30 * zoom);
  ctx.lineTo(screenPos.x + 8 * zoom, screenPos.y - 30 * zoom);
  ctx.closePath();
  ctx.fill();
}

export function renderExitPoint(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(pos, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const pulse = 0.5 + Math.sin(time * 3) * 0.3;

  // Glowing circle
  ctx.fillStyle = `rgba(34, 197, 94, ${pulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y, 30 * zoom, 15 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(34, 197, 94, ${pulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Flag indicator
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(screenPos.x - 2 * zoom, screenPos.y - 35 * zoom, 4 * zoom, 30 * zoom);
  ctx.beginPath();
  ctx.moveTo(screenPos.x + 2 * zoom, screenPos.y - 35 * zoom);
  ctx.lineTo(screenPos.x + 15 * zoom, screenPos.y - 28 * zoom);
  ctx.lineTo(screenPos.x + 2 * zoom, screenPos.y - 20 * zoom);
  ctx.closePath();
  ctx.fill();
}
