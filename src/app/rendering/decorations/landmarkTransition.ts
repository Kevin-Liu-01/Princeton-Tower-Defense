import type { Position, DecorationType, SpecialTowerType } from "../../types";
import type { MapTheme } from "../../constants/maps";
import { LEVEL_DATA, REGION_THEMES } from "../../constants/maps";
import { ISO_PRISM_W_FACTOR, ISO_PRISM_D_FACTOR } from "../../constants";
import {
  getDecorationVolumeSpec,
  getMapDecorationWorldPos,
  resolveMapDecorationRuntimePlacement,
  gridToWorld,
} from "../../utils";
import { worldToScreen } from "../../utils";
import { drawOrganicBlobAt } from "../helpers";
import { getLevelSpecialTowers } from "../../game/setup";
import { isMountainTerrainKind } from "../maps/challengeTerrain";

// Decoration types that receive an organic ground-transition blob.
// Only manually-placed decorations (from LEVEL_DATA) are considered, so
// procedurally-generated instances (trees, rocks, etc.) are never affected.
export const GROUND_TRANSITION_TYPES = new Set<string>([
  // Landmarks
  "pyramid",
  "sphinx",
  "giant_sphinx",
  "nassau_hall",
  "glacier",
  "ice_fortress",
  "obsidian_castle",
  "witch_cottage",
  "ruined_temple",
  "sunken_pillar",
  "frozen_waterfall",
  "frozen_gate",
  "cobra_statue",
  "hieroglyph_wall",
  "sarcophagus",
  "lava_fall",
  "obsidian_pillar",
  "skull_throne",
  "volcano_rim",
  "idol_statue",
  "gate",
  "dark_throne",
  "dark_barracks",
  "dark_spire",
  "ice_bridge",
  "demon_statue",
  "cannon_crest",
  "ivy_crossroads",
  "blight_basin",
  "triad_keep",
  "sunscorch_labyrinth",
  "frontier_outpost",
  "ashen_spiral",
  "war_monument",
  "bone_altar",
  "sun_obelisk",
  "frost_citadel",
  "infernal_gate",
  // Structures / monuments (manually placed only)
  "building",
  "hut",
  "statue",
  "obelisk",
  "fountain",
  "ruins",
  "dock",
  "ice_spire",
  "ice_throne",
]);

// Softer palette for settled/organic ground beneath structures.
const GROUND_TRANSITION_PALETTES: Record<
  MapTheme,
  {
    outerBlend: string;
    midEarth: string;
    innerBase: string;
    detailLight: string;
    detailDark: string;
    edgeAccent: string;
    glowColor: string;
    glowAlpha: number;
  }
> = {
  grassland: {
    outerBlend: "#3a3020",
    midEarth: "#2e2415",
    innerBase: "#24190e",
    detailLight: "#5a4a2a",
    detailDark: "#2a1e10",
    edgeAccent: "#4a6a3a",
    glowColor: "rgba(70, 120, 50, 0.10)",
    glowAlpha: 0.08,
  },
  desert: {
    outerBlend: "#8a7548",
    midEarth: "#6e5a38",
    innerBase: "#504028",
    detailLight: "#b89858",
    detailDark: "#5a4428",
    edgeAccent: "#a89050",
    glowColor: "rgba(190, 160, 70, 0.08)",
    glowAlpha: 0.06,
  },
  winter: {
    outerBlend: "#506070",
    midEarth: "#384858",
    innerBase: "#283842",
    detailLight: "#7888a0",
    detailDark: "#384858",
    edgeAccent: "#b8c8d8",
    glowColor: "rgba(140, 180, 210, 0.10)",
    glowAlpha: 0.1,
  },
  volcanic: {
    outerBlend: "#321818",
    midEarth: "#241010",
    innerBase: "#180808",
    detailLight: "#4a2828",
    detailDark: "#1a0808",
    edgeAccent: "#cc3300",
    glowColor: "rgba(220, 60, 0, 0.08)",
    glowAlpha: 0.06,
  },
  swamp: {
    outerBlend: "#243218",
    midEarth: "#182410",
    innerBase: "#0e1808",
    detailLight: "#3a4a28",
    detailDark: "#142010",
    edgeAccent: "#2e5a2e",
    glowColor: "rgba(50, 110, 50, 0.10)",
    glowAlpha: 0.08,
  },
};

const CHALLENGE_GROUND_TRANSITION_PALETTES: Record<
  MapTheme,
  {
    outerBlend: string;
    midEarth: string;
    innerBase: string;
    detailLight: string;
    detailDark: string;
    edgeAccent: string;
    glowColor: string;
    glowAlpha: number;
    groundEdge: string;
    groundFar: string;
  }
> = {
  grassland: {
    outerBlend: "#3e5a30",
    midEarth: "#34482a",
    innerBase: "#2a3a20",
    detailLight: "#5a8a50",
    detailDark: "#2e3818",
    edgeAccent: "#4a7548",
    glowColor: "rgba(70, 120, 50, 0.08)",
    glowAlpha: 0.06,
    groundEdge: "#3a5a30",
    groundFar: "#30522c",
  },
  desert: {
    outerBlend: "#9a8050",
    midEarth: "#806840",
    innerBase: "#6a5530",
    detailLight: "#c4a060",
    detailDark: "#7a5e3a",
    edgeAccent: "#a88860",
    glowColor: "rgba(190, 160, 70, 0.06)",
    glowAlpha: 0.05,
    groundEdge: "#8b7355",
    groundFar: "#7a5530",
  },
  winter: {
    outerBlend: "#4a6070",
    midEarth: "#3e5262",
    innerBase: "#324454",
    detailLight: "#6ba3be",
    detailDark: "#2e3e50",
    edgeAccent: "#7ab0cc",
    glowColor: "rgba(140, 180, 210, 0.08)",
    glowAlpha: 0.07,
    groundEdge: "#4a5a6a",
    groundFar: "#3a5068",
  },
  volcanic: {
    outerBlend: "#3a2020",
    midEarth: "#301818",
    innerBase: "#241010",
    detailLight: "#5a2828",
    detailDark: "#200e0e",
    edgeAccent: "#6a2818",
    glowColor: "rgba(220, 60, 0, 0.06)",
    glowAlpha: 0.05,
    groundEdge: "#3a2424",
    groundFar: "#2a1a1a",
  },
  swamp: {
    outerBlend: "#1e3a1e",
    midEarth: "#182e16",
    innerBase: "#12240e",
    detailLight: "#3a6a3a",
    detailDark: "#12200e",
    edgeAccent: "#2a4a2a",
    glowColor: "rgba(50, 110, 50, 0.08)",
    glowAlpha: 0.06,
    groundEdge: "#1e3020",
    groundFar: "#142418",
  },
};

interface TransitionRadii {
  outerW: number;
  outerH: number;
  midW: number;
  midH: number;
  innerW: number;
  innerH: number;
}

const MAX_TRANSITION_BASE = 100;

function getDecorationTransitionRadii(
  decorType: string,
  decorScale: number,
  zoom: number,
): TransitionRadii {
  const volume = getDecorationVolumeSpec(decorType);
  const baseW = Math.min(volume.width * 0.42 * decorScale, MAX_TRANSITION_BASE) * zoom;
  const baseH = Math.min(volume.length * 0.42 * decorScale, MAX_TRANSITION_BASE) * zoom;
  return {
    outerW: baseW * ISO_PRISM_W_FACTOR * 2.4,
    outerH: baseH * ISO_PRISM_D_FACTOR * 2.4,
    midW: baseW * ISO_PRISM_W_FACTOR * 1.75,
    midH: baseH * ISO_PRISM_D_FACTOR * 1.75,
    innerW: baseW * ISO_PRISM_W_FACTOR * 1.2,
    innerH: baseH * ISO_PRISM_D_FACTOR * 1.2,
  };
}

const SPECIAL_TOWER_FOUNDATION: Record<
  SpecialTowerType,
  { w: number; h: number }
> = {
  vault: { w: 52, h: 48 },
  beacon: { w: 48, h: 44 },
  shrine: { w: 44, h: 40 },
  barracks: { w: 56, h: 50 },
  chrono_relay: { w: 46, h: 42 },
  sentinel_nexus: { w: 50, h: 46 },
  sunforge_orrery: { w: 48, h: 44 },
};

function getSpecialTowerTransitionRadii(
  specType: SpecialTowerType,
  zoom: number,
): TransitionRadii {
  const fnd = SPECIAL_TOWER_FOUNDATION[specType] ?? { w: 48, h: 44 };
  const baseW = fnd.w * zoom;
  const baseH = fnd.h * zoom;
  return {
    outerW: baseW * ISO_PRISM_W_FACTOR * 1.8,
    outerH: baseH * ISO_PRISM_D_FACTOR * 1.8,
    midW: baseW * ISO_PRISM_W_FACTOR * 1.3,
    midH: baseH * ISO_PRISM_D_FACTOR * 1.3,
    innerW: baseW * ISO_PRISM_W_FACTOR * 0.9,
    innerH: baseH * ISO_PRISM_D_FACTOR * 0.9,
  };
}

function drawTransitionBlob(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  zoom: number,
  time: number,
  mapTheme: MapTheme,
  radii: TransitionRadii,
  seedX: number,
  seedY: number,
  selectedMap: string,
  decorScale: number = 1,
  isChallenge = false,
): void {
  const palette = isChallenge
    ? CHALLENGE_GROUND_TRANSITION_PALETTES[mapTheme]
    : GROUND_TRANSITION_PALETTES[mapTheme];
  const regionTheme = REGION_THEMES[mapTheme];

  const outerEdgeColor = isChallenge
    ? (palette as typeof CHALLENGE_GROUND_TRANSITION_PALETTES[MapTheme]).groundEdge
    : regionTheme.ground[1];
  const clumpEdgeColor = isChallenge
    ? (palette as typeof CHALLENGE_GROUND_TRANSITION_PALETTES[MapTheme]).groundFar
    : regionTheme.ground[2];

  const { outerW, outerH, midW, midH, innerW, innerH } = radii;

  const cx = screenPos.x;
  const cy = screenPos.y + 8 * zoom / decorScale;

  const blobSeed = selectedMap.charCodeAt(0) + seedX * 59 + seedY * 113;
  const detailScale = Math.max(
    0.5,
    Math.min(1.8, (outerW + outerH) / (80 * zoom)),
  );

  ctx.save();

  // === Outer settled terrain ring — natural blending into ground ===
  const outerGrad = ctx.createRadialGradient(
    cx,
    cy,
    midW * 0.5,
    cx,
    cy,
    outerW,
  );
  outerGrad.addColorStop(0, "rgba(0,0,0,0)");
  outerGrad.addColorStop(0.4, palette.outerBlend);
  outerGrad.addColorStop(1, outerEdgeColor);
  ctx.fillStyle = outerGrad;
  drawOrganicBlobAt(ctx, cx, cy, outerW, outerH, blobSeed, 0.18, 28);
  ctx.fill();

  // Edge roughness — organic clumps at transition boundary
  const numClumps = Math.floor(10 * detailScale);
  for (let i = 0; i < numClumps; i++) {
    const angle = (i / numClumps) * Math.PI * 2 + (blobSeed % 9) * 0.25;
    const dist = outerW * (0.9 + ((blobSeed * (i + 1) * 11) % 19) / 95);
    const clX = cx + Math.cos(angle) * dist;
    const clY = cy + Math.sin(angle) * dist * (outerH / outerW);
    const clR = (1.2 + ((blobSeed * (i + 3)) % 13) / 9) * zoom;
    ctx.fillStyle = i % 3 === 0 ? palette.outerBlend : clumpEdgeColor;
    ctx.beginPath();
    ctx.ellipse(clX, clY, clR * 1.4, clR * 0.65, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // === Middle ring — worn / compacted earth ===
  const midGrad = ctx.createRadialGradient(cx, cy, innerW * 0.4, cx, cy, midW);
  midGrad.addColorStop(0, palette.midEarth);
  midGrad.addColorStop(1, palette.outerBlend);
  ctx.fillStyle = midGrad;
  drawOrganicBlobAt(ctx, cx, cy, midW, midH, blobSeed + 21.7, 0.14, 26);
  ctx.fill();

  // Subtle wear marks — weathered concentric arcs
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.5 * zoom;
  for (let ring = 0; ring < 2; ring++) {
    const ringR = midW * (0.55 + ring * 0.18);
    const ringH = midH * (0.55 + ring * 0.18);
    const startAngle = ((blobSeed + ring * 7) % 6) * 0.5;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      ringR,
      ringH,
      0,
      startAngle,
      startAngle + Math.PI * 0.5,
    );
    ctx.stroke();
  }

  // === Inner foundation — settled base ===
  const innerGrad = ctx.createRadialGradient(
    cx - innerW * 0.08,
    cy - innerH * 0.08,
    0,
    cx,
    cy,
    innerW * 0.85,
  );
  innerGrad.addColorStop(0, palette.innerBase);
  innerGrad.addColorStop(0.7, palette.midEarth);
  innerGrad.addColorStop(1, palette.outerBlend);
  ctx.fillStyle = innerGrad;
  drawOrganicBlobAt(ctx, cx, cy, innerW, innerH, blobSeed + 37.3, 0.1, 24);
  ctx.fill();

  // === Scattered detail — pebbles / weathered debris ===
  const numPebbles = Math.floor(10 * detailScale);
  for (let i = 0; i < numPebbles; i++) {
    const angle = (i / numPebbles) * Math.PI * 2 + (blobSeed % 7) * 0.35;
    const dist = midW * (0.55 + ((blobSeed * (i + 2) * 17) % 23) / 70);
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist * (midH / midW);
    const pSize = (0.6 + ((blobSeed * (i + 5)) % 11) / 12) * zoom;
    ctx.fillStyle = i % 2 === 0 ? palette.detailLight : palette.detailDark;
    ctx.beginPath();
    ctx.ellipse(px, py, pSize, pSize * 0.55, angle * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // === Region-specific details ===
  drawRegionDetails(
    ctx,
    cx,
    cy,
    outerW,
    outerH,
    midW,
    midH,
    innerW,
    innerH,
    zoom,
    time,
    blobSeed,
    detailScale,
    mapTheme,
    palette,
  );

  // === Subtle accent glow ring ===
  ctx.strokeStyle = palette.glowColor;
  ctx.lineWidth = 1.2 * zoom;
  drawOrganicBlobAt(
    ctx,
    cx,
    cy,
    midW * 1.01,
    midH * 1.01,
    blobSeed + 21.7,
    0.14,
    26,
  );
  ctx.stroke();

  ctx.restore();
}

function drawRegionDetails(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerW: number,
  outerH: number,
  midW: number,
  midH: number,
  _innerW: number,
  _innerH: number,
  zoom: number,
  time: number,
  blobSeed: number,
  detailScale: number,
  mapTheme: MapTheme,
  palette: (typeof GROUND_TRANSITION_PALETTES)[MapTheme],
): void {
  if (mapTheme === "grassland") {
    // Grass tufts growing around the settled perimeter
    const numTufts = Math.floor(6 * detailScale);
    for (let i = 0; i < numTufts; i++) {
      const angle = (i / numTufts) * Math.PI * 2 + 0.4;
      const dist = outerW * (0.82 + ((blobSeed * (i + 1)) % 11) / 55);
      const gx = cx + Math.cos(angle) * dist;
      const gy = cy + Math.sin(angle) * dist * (outerH / outerW);
      ctx.strokeStyle = palette.edgeAccent;
      ctx.lineWidth = 0.7 * zoom;
      for (let b = 0; b < 3; b++) {
        const bAngle = angle + (b - 1) * 0.25;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(
          gx + Math.cos(bAngle) * 2 * zoom,
          gy - (1.8 + b * 0.6) * zoom,
        );
        ctx.stroke();
      }
    }
  } else if (mapTheme === "desert") {
    // Sand drift mounds at edges
    const numDrifts = Math.floor(5 * detailScale);
    for (let i = 0; i < numDrifts; i++) {
      const angle = (i / numDrifts) * Math.PI * 2 + 0.6;
      const dist = outerW * (0.85 + ((blobSeed * (i + 4)) % 9) / 45);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * (outerH / outerW);
      const driftGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3.5 * zoom);
      driftGrad.addColorStop(0, "#c4a45a");
      driftGrad.addColorStop(1, "rgba(164,131,58,0)");
      ctx.fillStyle = driftGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 4 * zoom, 1.8 * zoom, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapTheme === "winter") {
    // Snow patches drifted against edges
    const numSnow = Math.floor(5 * detailScale);
    for (let i = 0; i < numSnow; i++) {
      const angle = (i / numSnow) * Math.PI * 2 + 0.3;
      const dist = outerW * (0.88 + ((blobSeed * (i + 2)) % 7) / 35);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * (outerH / outerW);
      const snowGrad = ctx.createRadialGradient(
        sx,
        sy - 0.4 * zoom,
        0,
        sx,
        sy,
        4 * zoom,
      );
      snowGrad.addColorStop(0, "rgba(215, 230, 245, 0.6)");
      snowGrad.addColorStop(0.5, "rgba(195, 210, 230, 0.3)");
      snowGrad.addColorStop(1, "rgba(175, 195, 215, 0)");
      ctx.fillStyle = snowGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 4.5 * zoom, 2 * zoom, angle * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapTheme === "volcanic") {
    // Faint lava cracks in the settled earth
    const lavaGlow = 0.2 + Math.sin(time * 1.5) * 0.08;
    ctx.strokeStyle = `rgba(255, 68, 0, ${lavaGlow})`;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 2 * zoom;
    ctx.lineWidth = 0.6 * zoom;
    const numCracks = Math.floor(4 * detailScale);
    for (let i = 0; i < numCracks; i++) {
      const angle = (i / numCracks) * Math.PI * 2 + (blobSeed % 4) * 0.5;
      const startD = midW * 0.5;
      const endD = outerW * 0.75;
      const sx = cx + Math.cos(angle) * startD;
      const sy = cy + Math.sin(angle) * startD * (midH / midW);
      const ex = cx + Math.cos(angle + 0.12) * endD;
      const ey = cy + Math.sin(angle + 0.12) * endD * (outerH / outerW);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        (sx + ex) / 2 + Math.cos(angle + 0.7) * 1.5 * zoom,
        (sy + ey) / 2 + Math.sin(angle + 0.7) * 1 * zoom,
        ex,
        ey,
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // Ash specks
    ctx.fillStyle = "rgba(70, 50, 50, 0.25)";
    const numAsh = Math.floor(6 * detailScale);
    for (let i = 0; i < numAsh; i++) {
      const angle = (i / numAsh) * Math.PI * 2;
      const dist = outerW * (0.6 + ((blobSeed * (i + 6)) % 13) / 40);
      const ax = cx + Math.cos(angle) * dist;
      const ay = cy + Math.sin(angle) * dist * (outerH / outerW);
      ctx.beginPath();
      ctx.arc(ax, ay, 0.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapTheme === "swamp") {
    // Mossy puddles around the settled area
    const numPuddles = Math.floor(3 * detailScale);
    for (let i = 0; i < numPuddles; i++) {
      const angle = (i / numPuddles) * Math.PI * 2 + 0.7;
      const dist = midW * (0.55 + ((blobSeed * (i + 1)) % 9) / 25);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist * (midH / midW);
      const pudGrad = ctx.createRadialGradient(px, py, 0, px, py, 2.5 * zoom);
      pudGrad.addColorStop(0, "rgba(35, 55, 30, 0.4)");
      pudGrad.addColorStop(0.6, "rgba(25, 45, 20, 0.2)");
      pudGrad.addColorStop(1, "rgba(15, 35, 10, 0)");
      ctx.fillStyle = pudGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, 3 * zoom, 1.5 * zoom, angle * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Moss tendrils
    ctx.strokeStyle = palette.edgeAccent;
    ctx.lineWidth = 0.6 * zoom;
    const numMoss = Math.floor(4 * detailScale);
    for (let i = 0; i < numMoss; i++) {
      const angle = (i / numMoss) * Math.PI * 2 + 0.5;
      const startD = outerW * 0.8;
      const endD = midW * 0.55;
      const mx = cx + Math.cos(angle) * startD;
      const my = cy + Math.sin(angle) * startD * (outerH / outerW);
      const ex = cx + Math.cos(angle + 0.08) * endD;
      const ey = cy + Math.sin(angle + 0.08) * endD * (midH / midW);
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(
        (mx + ex) / 2 + Math.cos(angle + 0.9) * 1.2 * zoom,
        (my + ey) / 2,
        ex,
        ey,
      );
      ctx.stroke();
    }
  }
}

export function renderDecorationTransitions(
  ctx: CanvasRenderingContext2D,
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
): void {
  const levelData = LEVEL_DATA[selectedMap];
  if (!levelData?.decorations) return;

  const mapTheme: MapTheme = (levelData?.theme as MapTheme) || "grassland";
  const isChallenge = isMountainTerrainKind(levelData.levelKind);
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;

  for (const deco of levelData.decorations) {
    const decoType = (deco.category || deco.type) as
      | DecorationType
      | undefined;
    if (!decoType || !GROUND_TRANSITION_TYPES.has(decoType)) continue;

    const resolvedPlacement = resolveMapDecorationRuntimePlacement(deco);
    if (!resolvedPlacement) continue;

    const worldPos = getMapDecorationWorldPos(deco);
    const screenPos = worldToScreen(
      worldPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );

    const radii = getDecorationTransitionRadii(
      decoType,
      resolvedPlacement.scale,
      zoom,
    );
    drawTransitionBlob(
      ctx,
      screenPos,
      zoom,
      time,
      mapTheme,
      radii,
      deco.pos.x,
      deco.pos.y,
      selectedMap,
      resolvedPlacement.scale,
      isChallenge,
    );
  }
}

export function renderSpecialTowerTransitions(
  ctx: CanvasRenderingContext2D,
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
): void {
  const levelData = LEVEL_DATA[selectedMap];
  const mapTheme: MapTheme = (levelData?.theme as MapTheme) || "grassland";
  const isChallenge = isMountainTerrainKind(levelData?.levelKind);
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;

  const specialTowers = getLevelSpecialTowers(selectedMap);
  for (const spec of specialTowers) {
    const worldPos = gridToWorld(spec.pos);
    const screenPos = worldToScreen(
      worldPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );

    const radii = getSpecialTowerTransitionRadii(spec.type, zoom);
    drawTransitionBlob(
      ctx,
      screenPos,
      zoom,
      time,
      mapTheme,
      radii,
      spec.pos.x,
      spec.pos.y,
      selectedMap,
      1,
      isChallenge,
    );
  }
}
