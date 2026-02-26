// Princeton Tower Defense - Scene Rendering Module
// High-level scene rendering that combines maps, decorations, and environment

import type { Position, MapDecoration, DecorationCategory } from "../../types";
import { LEVEL_DATA, GRID_WIDTH, GRID_HEIGHT, MAP_PATHS } from "../../constants";
import { worldToScreen, gridToWorld } from "../../utils";
import { renderMapBackground, MAP_THEMES, renderEnvironment, renderAmbientVisuals } from "../maps";
import { renderDecoration } from "../decorations";
import { renderHazard } from "../hazards";

// Re-export path rendering functions
export {
  renderPath,
  renderSecondaryPath,
  gridToWorldPath,
  generateSmoothPath,
  addPathWobble,
  createSeededRandom,
  catmullRom,
  hexToRgba,
  type PathRenderContext,
} from "./path";

// Re-export fog effects
export { renderRoadEndFog } from "../effects/fog";

// ============================================================================
// THEME MAPPING
// ============================================================================

const LEVEL_THEMES: Record<string, string> = {
  // Grassland
  nassau: "grassland",
  poe: "grassland",
  carnegie: "grassland",
  // Desert
  oasis: "desert",
  pyramid: "desert",
  sphinx: "desert",
  caldera: "desert",
  // Winter
  glacier: "winter",
  peak: "winter",
  fortress: "winter",
  // Volcanic
  lava_fields: "volcanic",
  throne: "volcanic",
  // Swamp
  murky_bog: "swamp",
  sunken_temple: "swamp",
  witch_hut: "swamp",
};

export function getMapTheme(mapId: string): string {
  return LEVEL_THEMES[mapId] || LEVEL_DATA[mapId]?.theme || "grassland";
}

// ============================================================================
// SEEDED RANDOM FOR CONSISTENT DECORATIONS
// ============================================================================

function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function getMapSeed(mapId: string): number {
  return mapId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

// ============================================================================
// DECORATION GENERATION
// ============================================================================

interface GeneratedDecoration {
  type: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  variant: number;
}

// Decoration categories for deterministic clustering
const THEME_DECORATION_CATEGORIES: Record<string, {
  trees: string[];
  structures: string[];
  terrain: string[];
  scattered: string[];
}> = {
  grassland: {
    trees: ["tree", "bush"],
    structures: ["fence", "bench", "hut", "tent", "barrel"],
    terrain: ["rock", "flowers", "grass"],
    scattered: ["lamppost", "signpost"],
  },
  desert: {
    trees: ["palm", "cactus"],
    structures: ["ruins", "torch", "obelisk"],
    terrain: ["rock", "dune", "sand_pile"],
    scattered: ["skeleton", "bones", "skull", "pottery"],
  },
  winter: {
    trees: ["pine_tree"],
    structures: ["ruins", "fence", "broken_wall"],
    terrain: ["rock", "snow_pile", "ice_crystal", "icicles"],
    scattered: ["aurora_crystal", "frozen_soldier", "snowman"],
  },
  volcanic: {
    trees: ["charred_tree"],
    structures: ["obsidian_spike", "fire_pit", "torch"],
    terrain: ["rock", "lava_pool", "ember_rock"],
    scattered: ["skeleton", "bones", "ember", "skull"],
  },
  swamp: {
    trees: ["swamp_tree", "mushroom", "mushroom_cluster"],
    structures: ["ruins", "gravestone", "tombstone", "broken_bridge"],
    terrain: ["rock", "lily_pad", "lily_pads", "fog_patch"],
    scattered: ["bones", "frog", "tentacle"],
  },
};

const THEME_BATTLE_DECORATIONS: Record<string, string[]> = {
  grassland: ["crater", "debris", "cart", "sword", "arrow", "skeleton", "fire"],
  desert: ["crater", "skeleton", "sword", "arrow", "bones"],
  winter: ["crater", "debris", "sword", "arrow", "frozen_soldier"],
  volcanic: ["crater", "ember", "bones", "sword"],
  swamp: ["crater", "skeleton", "bones", "debris"],
};

export function generateDecorations(
  mapId: string,
  pathPoints: Position[]
): GeneratedDecoration[] {
  const decorations: GeneratedDecoration[] = [];
  const theme = getMapTheme(mapId);
  const seed = getMapSeed(mapId);
  const random = createSeededRandom(seed);

  const categories = THEME_DECORATION_CATEGORIES[theme] || THEME_DECORATION_CATEGORIES.grassland;
  const battleDecors = THEME_BATTLE_DECORATIONS[theme] || THEME_BATTLE_DECORATIONS.grassland;

  // Helper to check if position is too close to path
  const isOnPath = (pos: Position, buffer: number = 20): boolean => {
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const p1 = pathPoints[i];
      const p2 = pathPoints[i + 1];
      const dist = distanceToLineSegment(pos, p1, p2);
      if (dist < buffer) return true;
    }
    return false;
  };

  // Zone-based decoration placement for clustering
  const zoneSize = 6;
  const minX = -9, maxX = GRID_WIDTH + 9;
  const minY = -9, maxY = GRID_HEIGHT + 9;
  const zonesX = Math.ceil((maxX - minX) / zoneSize);
  const zonesY = Math.ceil((maxY - minY) / zoneSize);

  const isBeyondGrid = (gx: number, gy: number): boolean =>
    gx < 0 || gx > GRID_WIDTH || gy < 0 || gy > GRID_HEIGHT;
  const BEYOND_GRID_REDUCE = 0.4;

  // Generate deterministic zone assignments
  type CategoryKey = keyof typeof categories;
  const zoneAssignments: CategoryKey[][] = [];
  for (let zx = 0; zx < zonesX; zx++) {
    zoneAssignments[zx] = [];
    for (let zy = 0; zy < zonesY; zy++) {
      const zoneHash = (seed * 31 + zx * 17 + zy * 13) % 100;
      let cat: CategoryKey;
      if (zoneHash < 40) cat = "trees";
      else if (zoneHash < 70) cat = "terrain";
      else if (zoneHash < 90) cat = "structures";
      else cat = "scattered";
      zoneAssignments[zx][zy] = cat;
    }
  }

  // Environment decorations - clustered by zone
  for (let i = 0; i < 400; i++) {
    const zoneX = Math.floor(random() * zonesX);
    const zoneY = Math.floor(random() * zonesY);
    const category = zoneAssignments[zoneX][zoneY];
    const categoryDecors = categories[category];

    if (!categoryDecors || categoryDecors.length === 0) continue;

    const zoneCenterX = minX + (zoneX + 0.5) * zoneSize;
    const zoneCenterY = minY + (zoneY + 0.5) * zoneSize;
    const offsetX = (random() - 0.5 + random() - 0.5) * zoneSize * 0.8;
    const offsetY = (random() - 0.5 + random() - 0.5) * zoneSize * 0.8;
    const gridX = zoneCenterX + offsetX;
    const gridY = zoneCenterY + offsetY;

    if (isBeyondGrid(gridX, gridY) && random() > BEYOND_GRID_REDUCE) continue;

    const worldPos = gridToWorld({ x: gridX, y: gridY });
    if (isOnPath(worldPos, 20)) continue;

    const typeIndex = Math.floor(random() * random() * categoryDecors.length);
    const type = categoryDecors[typeIndex];

    // Scale varies by category with natural multi-factor variation
    let baseScale = 0.7, scaleVar = 0.4;
    if (category === "trees") { baseScale = 0.75; scaleVar = 0.55; }
    else if (category === "structures") { baseScale = 0.85; scaleVar = 0.35; }
    else if (category === "scattered") { baseScale = 0.45; scaleVar = 0.45; }
    else { baseScale = 0.6; scaleVar = 0.5; } // terrain

    // Multi-factor scale variation for more natural look
    const scaleFactor1 = random();
    const scaleFactor2 = random();
    const combinedScale = (scaleFactor1 + scaleFactor2) / 2;
    const finalScale = baseScale + combinedScale * scaleVar * (0.8 + random() * 0.4);

    decorations.push({
      type,
      x: worldPos.x,
      y: worldPos.y,
      scale: finalScale,
      rotation: random() * Math.PI * 2,
      variant: Math.floor(random() * 4),
    });
  }

  // Tree clusters — uniformly distributed, reduced beyond grid
  for (let cluster = 0; cluster < 12; cluster++) {
    const clusterX = minX + random() * (maxX - minX);
    const clusterY = minY + random() * (maxY - minY);

    if (isBeyondGrid(clusterX, clusterY) && random() > BEYOND_GRID_REDUCE) continue;

    const treesInCluster = 4 + Math.floor(random() * 5);
    const treeTypes = categories.trees;
    for (let t = 0; t < treesInCluster; t++) {
      const treeX = clusterX + (random() - 0.5) * 3;
      const treeY = clusterY + (random() - 0.5) * 3;
      const worldPos = gridToWorld({ x: treeX, y: treeY });
      if (isOnPath(worldPos, 20)) continue;

      const treeScaleBase = 0.65 + random() * 0.25;
      const treeScaleVar = (random() + random()) / 2 * 0.5;

      decorations.push({
        type: treeTypes[Math.floor(random() * treeTypes.length)],
        x: worldPos.x,
        y: worldPos.y,
        scale: treeScaleBase + treeScaleVar,
        rotation: random() * Math.PI * 2,
        variant: Math.floor(random() * 4),
      });
    }
  }

  // Add structure clusters (small villages)
  for (let village = 0; village < 4; village++) {
    const villageX = minX + 4 + random() * (maxX - minX - 8);
    const villageY = minY + 4 + random() * (maxY - minY - 8);
    const villageCenterWorld = gridToWorld({ x: villageX, y: villageY });
    if (isOnPath(villageCenterWorld, 20)) continue;

    const structureTypes = categories.structures;
    const structuresInVillage = 3 + Math.floor(random() * 4);
    for (let s = 0; s < structuresInVillage; s++) {
      const structX = villageX + (random() - 0.5) * 4;
      const structY = villageY + (random() - 0.5) * 4;
      const worldPos = gridToWorld({ x: structX, y: structY });
      if (isOnPath(worldPos, 20)) continue;

      // Structure scale variation
      const structScaleBase = 0.75 + random() * 0.2;
      const structScaleVar = (random() + random()) / 2 * 0.35;

      decorations.push({
        type: structureTypes[Math.floor(random() * structureTypes.length)],
        x: worldPos.x,
        y: worldPos.y,
        scale: structScaleBase + structScaleVar,
        rotation: random() * Math.PI * 0.25 - Math.PI * 0.125,
        variant: Math.floor(random() * 4),
      });
    }
  }

  // Battle damage decorations
  const battleRandom = createSeededRandom(seed + 600);
  for (let i = 0; i < 240; i++) {
    const gridX = battleRandom() * (GRID_WIDTH + 19) - 9.5;
    const gridY = battleRandom() * (GRID_HEIGHT + 19) - 9.5;

    if (isBeyondGrid(gridX, gridY) && battleRandom() > BEYOND_GRID_REDUCE) continue;

    const worldPos = gridToWorld({ x: gridX, y: gridY });

    const battleScaleBase = 0.4 + battleRandom() * 0.25;
    const battleScaleVar = (battleRandom() + battleRandom() + battleRandom()) / 3 * 0.5;

    decorations.push({
      type: battleDecors[Math.floor(battleRandom() * battleDecors.length)],
      x: worldPos.x,
      y: worldPos.y,
      scale: battleScaleBase + battleScaleVar,
      rotation: battleRandom() * Math.PI * 2,
      variant: Math.floor(battleRandom() * 4),
    });
  }

  // Add level-specific decorations
  const levelData = LEVEL_DATA[mapId];
  if (levelData?.decorations) {
    for (const dec of levelData.decorations) {
      const worldPos = gridToWorld(dec.pos);
      decorations.push({
        type: dec.type as string,
        x: worldPos.x,
        y: worldPos.y,
        scale: (dec.size || 1) * 1.2,
        rotation: 0,
        variant: (typeof dec.variant === "number" ? dec.variant : 0),
      });
    }
  }

  // Sort by Y for depth ordering
  decorations.sort((a, b) => a.y - b.y);

  return decorations;
}

// ============================================================================
// COMPLETE SCENE RENDERING
// ============================================================================

export interface SceneRenderOptions {
  mapId: string;
  canvasWidth: number;
  canvasHeight: number;
  dpr: number;
  cameraOffset?: Position;
  cameraZoom?: number;
  time?: number;
  renderDecorations?: boolean;
  renderHazards?: boolean;
  renderEnvironment?: boolean;
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  options: SceneRenderOptions
): void {
  const {
    mapId,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom = 1,
    time = Date.now() / 1000,
    renderDecorations: shouldRenderDecorations = true,
    renderHazards: shouldRenderHazards = true,
    renderEnvironment: shouldRenderEnvironment = true,
  } = options;

  const theme = getMapTheme(mapId);

  // 1. Render map background
  renderMapBackground(ctx, mapId, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);

  // 2. Render path (uses maps module renderPath for backward compatibility)

  // 3. Render hazards (below decorations)
  if (shouldRenderHazards) {
    const levelData = LEVEL_DATA[mapId];
    if (levelData?.hazards) {
      for (const hazard of levelData.hazards) {
        renderHazard(ctx, hazard, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
      }
    }
  }

  // 4. Render decorations
  if (shouldRenderDecorations) {
    const path = MAP_PATHS[mapId] || [];
    const decorations = generateDecorations(mapId, path);

    for (const dec of decorations) {
      const mapDecoration: MapDecoration = {
        pos: { x: dec.x, y: dec.y },
        category: dec.type as DecorationCategory,
        variant: dec.variant,
        scale: dec.scale,
      };
      renderDecoration(ctx, mapDecoration, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
    }
  }

  // 5. Render environmental effects (on top)
  if (shouldRenderEnvironment) {
    renderEnvironment(ctx, theme, canvasWidth / dpr, canvasHeight / dpr, time);
    renderAmbientVisuals(ctx, theme, canvasWidth / dpr, canvasHeight / dpr, time);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function distanceToLineSegment(point: Position, lineStart: Position, lineEnd: Position): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const ddx = point.x - lineStart.x;
    const ddy = point.y - lineStart.y;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }

  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = lineStart.x + t * dx;
  const closestY = lineStart.y + t * dy;
  const ddx = point.x - closestX;
  const ddy = point.y - closestY;

  return Math.sqrt(ddx * ddx + ddy * ddy);
}

// ============================================================================
// FOG OF WAR / PATH ENDPOINT RENDERING
// ============================================================================

export function renderPathEndpointFog(
  ctx: CanvasRenderingContext2D,
  startPos: Position,
  endPos: Position,
  theme: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const zoom = cameraZoom || 1;
  const themeColors = MAP_THEMES[theme] || MAP_THEMES.nassau;

  const startScreen = worldToScreen(startPos, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);
  const endScreen = worldToScreen(endPos, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom);

  // Calculate direction
  const dx = endScreen.x - startScreen.x;
  const dy = endScreen.y - startScreen.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const dirX = dx / len;
  const dirY = dy / len;

  // Draw fog layers
  const fogRadius = 100 * zoom;
  for (let layer = 0; layer < 5; layer++) {
    const layerOffset = layer * 15 * zoom;
    const layerAlpha = 0.3 - layer * 0.05;

    const fogGrad = ctx.createRadialGradient(
      startScreen.x - dirX * layerOffset,
      startScreen.y - dirY * layerOffset,
      0,
      startScreen.x - dirX * layerOffset,
      startScreen.y - dirY * layerOffset,
      fogRadius
    );

    const baseColor = themeColors.ground;
    fogGrad.addColorStop(0, colorWithAlpha(baseColor, layerAlpha));
    fogGrad.addColorStop(0.5, colorWithAlpha(baseColor, layerAlpha * 0.5));
    fogGrad.addColorStop(1, colorWithAlpha(baseColor, 0));

    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.arc(
      startScreen.x - dirX * layerOffset,
      startScreen.y - dirY * layerOffset,
      fogRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function colorWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
