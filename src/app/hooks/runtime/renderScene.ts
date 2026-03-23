import type {
  Position,
  Tower,
  Enemy,
  EnemyType,
  Hero,
  Troop,
  Projectile,
  Effect,
  Particle,
  SpellType,
  DraggingTower,
  Renderable,
  DecorationType,
  DecorationHeightTag,
  SpecialTower,
} from "../../types";
import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  TOWER_DATA,
  HERO_DATA,
  MAP_PATHS,
  TOWER_PLACEMENT_BUFFER,
  LEVEL_DATA,
  REGION_THEMES,
  ISO_Y_FACTOR,
  ISO_Y_RATIO,
  getLevelPathKeys,
  SENTINEL_NEXUS_STATS,
  SUNFORGE_ORRERY_STATS,
  SPECIAL_TOWER_WARMUP_MS,
} from "../../constants";
import { calculateTowerStats } from "../../constants/towerStats";
import {
  DECORATION_DENSITY_MULTIPLIER,
  TREE_CLUSTER_COUNT,
  GROVE_COUNT,
  VILLAGE_COUNT,
  BATTLE_DEBRIS_COUNT,
  DECORATION_SCALE_RANGE,
} from "../../constants/settings";
import {
  gridToWorld,
  worldToScreen,
  screenToWorld,
  screenToGrid,
  distance,
  isValidBuildPosition,
  hexToRgb,
  type TroopMoveInfo,
  LANDMARK_DECORATION_TYPES,
  BACKGROUND_BLOCKING_DECORATION_TYPES,
  getMapDecorationWorldPos,
  getDecorationVolumeSpec,
  getLandmarkSpawnExclusion,
  resolveMapDecorationRuntimePlacement,
} from "../../utils";
import { buildPathSegments, minDistanceToPath, type PathSegment } from "../../utils/pathUtils";
import { createSeededRandom } from "../../utils/seededRandom";
import { DecorationSpatialGrid, getExclusionRadius } from "../../utils/decorationSpacing";
import {
  getDecorationRenderLayer,
  getDecorationIsoY,
  getRuntimeDecorationHeightTag,
  getLayerPriority,
  getSourcePriority,
  type RuntimeDecoration,
} from "../../rendering/decorations/decorationHelpers";
import {
  getOcclusionState,
  type CachedVisibleDecoration,
  type OcclusionAnchor,
} from "../../rendering/decorations/occlusion";
import { drawTriangle, drawRoundedRect } from "../../rendering/utils/drawUtils";
import { insertionSortBy } from "../../rendering/utils/insertionSort";
import {
  prerenderDecorationSprite,
  drawDecorationSprite,
  type DecorationSprite,
} from "../../rendering/decorations/spriteCache";
import {
  renderTower,
  renderTowerGroundTransition,
  getTowerFoundationSize,
  renderEnemy,
  renderHero,
  renderTroop,
  renderProjectile,
  renderEffect,
  renderParticle,
  renderTowerPreview,
  renderStationRange,
  renderTowerRange,
  renderEnvironment,
  renderAmbientVisuals,
  renderHazard,
  renderSpecialBuilding,
  renderTroopMoveRange,
  renderPathTargetIndicator,
  renderEnemyInspectIndicator,
  renderTowerDebuffEffects,
  renderUnitStatusEffects,
  renderUnitInspectIndicator,
  renderMissileTargetReticle,
  setProjectileRenderTime,
  getActiveParticles,
  drawRoadEndFog,
  computeFogCounts,
} from "../../rendering";
import { renderEnemyDeath } from "../../rendering/effects/deathAnimations";
import { getSentinelPalette } from "../../rendering/towers/sentinelTheme";
import { drawWaveStartBubble } from "../../rendering/ui/waveStartBubble";
import type { WaveStartBubbleScreenData } from "../../rendering/ui/waveStartBubble";
import { renderDecorationItem } from "../../rendering/decorations";
import { getDecorationCategories } from "../../rendering/decorations/decorationCategories";
import { renderDecorationTransitions, renderSpecialTowerTransitions } from "../../rendering/decorations/landmarkTransition";
import {
  renderStaticMapLayer,
  renderChallengeMountainBackdrop,
  type StaticMapFogEndpoint,
} from "../../rendering/maps/staticLayer";
import {
  updateScenePressure,
  interceptShadows,
  getPerformanceSettings,
} from "../../rendering/performance";
import { getGameSettings, getSettingsVersion } from "../useSettings";
import {
  getChallengePathSegments,
  isMountainTerrainKind,
  isWorldPosInChallengeDecorationFootprint,
} from "../../rendering/maps/challengeTerrain";
import {
  renderSpellReticle,
  renderTargetingReticle,
  RETICLE_COLORS,
  type SpellReticleVariant,
} from "../../rendering/ui/reticles";
import { renderDamageNumbers } from "../../rendering/ui/damageNumbers";
import {
  getEnemyPosWithPath,
  getLevelSpecialTowers,
  vaultPosKey,
} from "../../game/setup";
import {
  isInSpecialTowerZone,
  isInLandmarkCore,
  isInLandmarkFull,
  type LandmarkZone,
} from "../../game/spatial";
import {
  BG_OVERSCAN_X,
  BG_OVERSCAN_Y,
  DECOR_OVERSCAN,
  QUALITY_DECORATION_MARGIN_PX,
  WATER_DECORATION_TYPES,
  type RenderQuality,
} from "./runtimeConfig";
import type { WaveStartConfirmState } from "./waveStartBubbles";

// ---------------------------------------------------------------------------
// Cache interfaces (shared between hook ref declarations and renderScene)
// ---------------------------------------------------------------------------

export interface StaticMapLayerCache {
  key: string;
  canvas: HTMLCanvasElement;
  fogEndpoints: StaticMapFogEndpoint[];
  anchorOffset: Position;
  cacheZoom: number;
}

export interface StaticDecorationLayerCache {
  key: string;
  canvas: HTMLCanvasElement | null;
  backgroundDecorations: CachedVisibleDecoration[];
  animatedDecorations: CachedVisibleDecoration[];
  depthSensitiveDecorations: CachedVisibleDecoration[];
  anchorOffset: Position;
  cacheZoom: number;
}

export interface FogLayerCache {
  key: string;
  canvas: HTMLCanvasElement;
  renderedAtMs: number;
  anchorOffset: Position;
}

export interface BackdropCache {
  key: string;
  canvas: HTMLCanvasElement;
}

export interface AmbientLayerCache {
  key: string;
  canvas: HTMLCanvasElement | null;
  renderedAtMs: number;
}

// ---------------------------------------------------------------------------
// Helper types
// ---------------------------------------------------------------------------

export interface EntityCounts {
  towers: number;
  enemies: number;
  troops: number;
  projectiles: number;
  effects: number;
  particles: number;
}

export type DraggingUnitState =
  | { kind: "hero"; heroId: string }
  | { kind: "troop"; troopId: string; ownerId: string };

export interface WavePreviewEnemyEntry {
  type: EnemyType;
  name: string;
  color: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Ref-like shape (avoids direct React dependency for the interface)
// ---------------------------------------------------------------------------

interface Ref<T> {
  current: T;
}

// ---------------------------------------------------------------------------
// RenderSceneParams
// ---------------------------------------------------------------------------

export interface RenderSceneParams {
  // Canvas refs
  canvasRef: Ref<HTMLCanvasElement | null>;
  bgCanvasRef: Ref<HTMLCanvasElement | null>;
  backdropCanvasRef: Ref<HTMLCanvasElement | null>;

  // Camera
  cameraOffset: Position;
  cameraZoom: number;
  stableZoomRef: Ref<number>;
  isZoomDebouncingRef: Ref<boolean>;

  // Render quality & frame
  renderQualityRef: Ref<RenderQuality>;
  renderFrameIndexRef: Ref<number>;

  // Entities
  towers: Tower[];
  enemies: Enemy[];
  hero: Hero | null;
  troops: Troop[];
  projectiles: Projectile[];
  effects: Effect[];

  // Game state
  selectedMap: string;
  currentWave: number;
  activeWaveSpawnPaths: string[];

  // Hover / selection
  draggingTower: DraggingTower | null;
  hoveredTower: string | null;
  selectedTower: string | null;
  moveTargetPos: Position | null;
  moveTargetValid: boolean;
  selectedUnitMoveInfo: TroopMoveInfo | null;
  draggingUnit: DraggingUnitState | null;
  hoveredSpecialTower: SpecialTower | null;
  sentinelTargets: Record<string, Position>;
  activeSentinelTargetKey: string | null;
  specialTowerHp: Record<string, number>;
  vaultFlash: Record<string, number>;
  repositioningTower: string | null;
  repositionPreviewPos: Position | null;
  blockedPositions: Set<string>;

  // Inspector
  inspectorActive: boolean;
  selectedInspectEnemy: Enemy | null;
  hoveredInspectEnemy: string | null;
  hoveredInspectTroop: string | null;
  hoveredInspectHero: boolean;
  selectedInspectTroop: Troop | null;
  selectedInspectHero: boolean;

  // Wave bubbles
  hoveredWaveBubblePathKey: string | null;
  waveStartConfirm: WaveStartConfirmState | null;
  incomingWavePreviewByPath: Map<string, WavePreviewEnemyEntry[]>;

  // Cache refs (mutated during render)
  cachedStaticMapLayerRef: Ref<StaticMapLayerCache | null>;
  cachedStaticDecorationLayerRef: Ref<StaticDecorationLayerCache | null>;
  cachedFogLayerRef: Ref<FogLayerCache | null>;
  cachedBackdropRef: Ref<BackdropCache | null>;
  cachedAmbientLayerRef: Ref<AmbientLayerCache | null>;
  cachedDecorationsRef: Ref<{ mapKey: string; decorations: RuntimeDecoration[] } | null>;

  // Other refs
  pendingDeathEffectsRef: Ref<Effect[]>;
  particlesRef: Ref<Particle[]>;
  entityCountsRef: Ref<EntityCounts>;
  enemySortOffsetCacheRef: Ref<Map<string, number>>;
  pausedAtRef: Ref<number | null>;
  gameSpeedRef: Ref<number>;
  enemiesFirstAppearedRef: Ref<number>;
  lastSentinelStrikeRef: Ref<Map<string, number>>;
  lastSunforgeBarrageRef: Ref<Map<string, number>>;
  sunforgeAimRef: Ref<Map<string, Position>>;
  missileAutoAimRef: Ref<Map<string, Position>>;
  mousePosRef: Ref<Position>;
  targetingSpellRef: Ref<SpellType | null>;
  placingTroopRef: Ref<boolean>;
  missileMortarTargetingIdRef: Ref<string | null>;

  // Functions / callbacks
  getRenderDpr: () => number;
  getWaveStartBubblesScreenData: (
    canvasWidth: number,
    canvasHeight: number,
    dpr: number,
  ) => WaveStartBubbleScreenData[];
  getSpecialTowerKey: (tower: Pick<SpecialTower, "type" | "pos">) => string;
}

// ---------------------------------------------------------------------------
// renderScene — the body of the render useCallback extracted verbatim
// ---------------------------------------------------------------------------

export function renderScene(params: RenderSceneParams): void {
  const {
    canvasRef,
    bgCanvasRef,
    backdropCanvasRef,
    cameraOffset,
    cameraZoom,
    stableZoomRef,
    isZoomDebouncingRef,
    renderQualityRef,
    renderFrameIndexRef,
    towers,
    enemies,
    hero,
    troops,
    projectiles,
    effects,
    selectedMap,
    currentWave,
    activeWaveSpawnPaths,
    draggingTower,
    hoveredTower,
    selectedTower,
    moveTargetPos,
    moveTargetValid,
    selectedUnitMoveInfo,
    draggingUnit,
    hoveredSpecialTower,
    sentinelTargets,
    activeSentinelTargetKey,
    specialTowerHp,
    vaultFlash,
    repositioningTower,
    repositionPreviewPos,
    blockedPositions,
    inspectorActive,
    selectedInspectEnemy,
    hoveredInspectEnemy,
    hoveredInspectTroop,
    hoveredInspectHero,
    selectedInspectTroop,
    selectedInspectHero,
    hoveredWaveBubblePathKey,
    waveStartConfirm,
    incomingWavePreviewByPath,
    cachedStaticMapLayerRef,
    cachedStaticDecorationLayerRef,
    cachedFogLayerRef,
    cachedBackdropRef,
    cachedAmbientLayerRef,
    cachedDecorationsRef,
    pendingDeathEffectsRef,
    particlesRef,
    entityCountsRef,
    enemySortOffsetCacheRef,
    pausedAtRef,
    gameSpeedRef,
    enemiesFirstAppearedRef,
    lastSentinelStrikeRef,
    lastSunforgeBarrageRef,
    sunforgeAimRef,
    missileAutoAimRef,
    mousePosRef,
    targetingSpellRef,
    placingTroopRef,
    missileMortarTargetingIdRef,
    getRenderDpr,
    getWaveStartBubblesScreenData,
    getSpecialTowerKey,
  } = params;

  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  interceptShadows(ctx);
  const perfSettings = getPerformanceSettings();
  ctx.imageSmoothingEnabled = perfSettings.antiAliasing;
  const dpr = getRenderDpr();
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const frameNowMs = performance.now();
  const nowSeconds = frameNowMs / 1000;
  const renderQuality = renderQualityRef.current;
  renderFrameIndexRef.current += 1;
  // CRITICAL: Reset transform to identity matrix at start of each frame
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  setProjectileRenderTime(Date.now());

  if (!isZoomDebouncingRef.current) {
    stableZoomRef.current = cameraZoom;
  }
  const cacheZoomForKey = stableZoomRef.current;
  const zoomCompensation = cameraZoom / cacheZoomForKey;
  const hasZoomMismatch = Math.abs(zoomCompensation - 1) > 0.001;

  const mapTheme = LEVEL_DATA[selectedMap]?.theme || "grassland";
  const theme = REGION_THEMES[mapTheme];

  const levelData = LEVEL_DATA[selectedMap];
  const isChallengeTerrainLevel = isMountainTerrainKind(levelData?.levelKind);
  const challengePathSegments = isChallengeTerrainLevel
    ? getChallengePathSegments(selectedMap)
    : [];
  const mapSeed = selectedMap
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  let seededRandom = createSeededRandom(mapSeed);

  const toScreen = (p: Position) =>
    worldToScreen(
      p,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
  const toScreenForCache = hasZoomMismatch
    ? (p: Position) => worldToScreen(p, canvas.width, canvas.height, dpr, cameraOffset, cacheZoomForKey)
    : toScreen;

  // Cache key does NOT include camera offset — offset handled by overscan.
  // Uses cacheZoomForKey (debounced) to avoid invalidation during continuous zoom.
  const staticBaseKey = [
    selectedMap,
    canvas.width,
    canvas.height,
    dpr,
    cacheZoomForKey.toFixed(3),
  ].join("|");

  // =========================================================================
  // BACKGROUND CANVAS — static map + fog with overscan so panning is free
  // =========================================================================
  const bgCanvas = bgCanvasRef.current;
  const backdropCanvas = backdropCanvasRef.current;
  let fogEndpoints: StaticMapFogEndpoint[] = [];
  const overscanCssW = width + BG_OVERSCAN_X;
  const overscanCssH = height + BG_OVERSCAN_Y;

  // Backdrop canvas — rendered once per map/resize, never zoom-scaled.
  const backdropKey = [selectedMap, overscanCssW, overscanCssH, dpr].join("|");
  if (backdropCanvas && (!cachedBackdropRef.current || cachedBackdropRef.current.key !== backdropKey)) {
    const bdCtx = backdropCanvas.getContext("2d");
    if (bdCtx) {
      bdCtx.setTransform(1, 0, 0, 1, 0, 0);
      bdCtx.clearRect(0, 0, backdropCanvas.width, backdropCanvas.height);
      bdCtx.scale(dpr, dpr);
      if (isChallengeTerrainLevel) {
        const mapThemeKeyForBackdrop = (levelData?.theme ?? "grassland") as
          | "grassland" | "swamp" | "desert" | "winter" | "volcanic";
        renderChallengeMountainBackdrop(
          bdCtx,
          overscanCssW,
          overscanCssH,
          mapSeed,
          mapThemeKeyForBackdrop,
        );
      } else {
        const gradient = bdCtx.createRadialGradient(
          overscanCssW / 2, overscanCssH / 2, 0,
          overscanCssW / 2, overscanCssH / 2, overscanCssW,
        );
        gradient.addColorStop(0, theme.ground[0]);
        gradient.addColorStop(0.5, theme.ground[1]);
        gradient.addColorStop(1, theme.ground[2]);
        bdCtx.fillStyle = gradient;
        bdCtx.fillRect(0, 0, overscanCssW, overscanCssH);
      }
      cachedBackdropRef.current = { key: backdropKey, canvas: backdropCanvas };
    }
  }
  const hasBackdropCanvas = !!cachedBackdropRef.current;

  const cachedStaticMapLayer = cachedStaticMapLayerRef.current;
  const staticAnchor = cachedStaticMapLayer?.anchorOffset;
  const staticPanPxX = staticAnchor
    ? (staticAnchor.x - cameraOffset.x) * cameraZoom
    : 0;
  const staticPanPxY = staticAnchor
    ? (staticAnchor.y - cameraOffset.y) * cameraZoom
    : 0;
  const staticExceedsOverscan =
    Math.abs(staticPanPxX) > BG_OVERSCAN_X / 3 ||
    Math.abs(staticPanPxY) > BG_OVERSCAN_Y / 4;
  const staticLayerChanged =
    !cachedStaticMapLayer ||
    cachedStaticMapLayer.key !== staticBaseKey ||
    staticExceedsOverscan;

  if (staticLayerChanged) {
    if (typeof document !== "undefined") {
      const offscreenStaticCanvas = document.createElement("canvas");
      offscreenStaticCanvas.width = overscanCssW * dpr;
      offscreenStaticCanvas.height = overscanCssH * dpr;
      const staticCtx = offscreenStaticCanvas.getContext("2d");
      if (staticCtx) {
        staticCtx.setTransform(1, 0, 0, 1, 0, 0);
        staticCtx.scale(dpr, dpr);
        const preRoadCb = (drawCtx: CanvasRenderingContext2D) => {
          renderDecorationTransitions(
            drawCtx,
            selectedMap,
            offscreenStaticCanvas.width,
            offscreenStaticCanvas.height,
            dpr,
            cameraOffset,
            cacheZoomForKey,
          );
        };
        const staticLayerResult = renderStaticMapLayer({
          ctx: staticCtx,
          selectedMap,
          theme,
          canvasWidthPx: offscreenStaticCanvas.width,
          canvasHeightPx: offscreenStaticCanvas.height,
          cssWidth: overscanCssW,
          cssHeight: overscanCssH,
          dpr,
          cameraOffset,
          cameraZoom: cacheZoomForKey,
          preRoadCallback: preRoadCb,
          skipBackdrop: hasBackdropCanvas,
        });
        fogEndpoints = staticLayerResult.fogEndpoints;
        cachedStaticMapLayerRef.current = {
          key: staticBaseKey,
          canvas: offscreenStaticCanvas,
          fogEndpoints,
          anchorOffset: { ...cameraOffset },
          cacheZoom: cacheZoomForKey,
        };
      }
    } else {
      const preRoadCb = (drawCtx: CanvasRenderingContext2D) => {
        renderDecorationTransitions(
          drawCtx,
          selectedMap,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cacheZoomForKey,
        );
      };
      const staticLayerResult = renderStaticMapLayer({
        ctx,
        selectedMap,
        theme,
        canvasWidthPx: canvas.width,
        canvasHeightPx: canvas.height,
        cssWidth: width,
        cssHeight: height,
        dpr,
        cameraOffset,
        cameraZoom: cacheZoomForKey,
        preRoadCallback: preRoadCb,
        skipBackdrop: hasBackdropCanvas,
      });
      fogEndpoints = staticLayerResult.fogEndpoints;
    }
    cachedFogLayerRef.current = null;
  } else {
    fogEndpoints = cachedStaticMapLayer.fogEndpoints;
  }

  // Fog — cached separately with a slower refresh rate (uses overscan dims)
  const FOG_CACHE_REFRESH_MS = 200;
  const fogCacheKey = [staticBaseKey, isChallengeTerrainLevel ? "c" : "n"].join("|");
  const cachedFog = cachedFogLayerRef.current;
  const fogNeedsRedraw =
    !cachedFog ||
    cachedFog.key !== fogCacheKey ||
    frameNowMs - cachedFog.renderedAtMs > FOG_CACHE_REFRESH_MS;

  if (fogNeedsRedraw && fogEndpoints.length > 0 && typeof document !== "undefined") {
    const fogOffscreen = cachedFog?.canvas ?? document.createElement("canvas");
    fogOffscreen.width = overscanCssW * dpr;
    fogOffscreen.height = overscanCssH * dpr;
    const fogCtx = fogOffscreen.getContext("2d");
    if (fogCtx) {
      fogCtx.setTransform(1, 0, 0, 1, 0, 0);
      fogCtx.clearRect(0, 0, fogOffscreen.width, fogOffscreen.height);
      fogCtx.scale(dpr, dpr);
      const fogGroundRgb = hexToRgb(theme.ground[2]);
      const fogAccentRgb = hexToRgb(theme.accent);
      const fogPathRgb = hexToRgb(theme.path[2]);
      const { fogBlobCount, fogWispCount } = computeFogCounts(isChallengeTerrainLevel);
      const roadEndFogSize = isChallengeTerrainLevel ? 215 : 300;
      for (const endpoint of fogEndpoints) {
        drawRoadEndFog({
          ctx: fogCtx,
          endPos: endpoint.endPos,
          towardsPos: endpoint.towardsPos,
          size: roadEndFogSize,
          nowSeconds,
          cameraZoom: cacheZoomForKey,
          groundRgb: fogGroundRgb,
          accentRgb: fogAccentRgb,
          pathRgb: fogPathRgb,
          isChallengeTerrainLevel,
          fogBlobCount,
          fogWispCount,
        });
      }
      cachedFogLayerRef.current = {
        key: fogCacheKey,
        canvas: fogOffscreen,
        renderedAtMs: frameNowMs,
        anchorOffset: cachedStaticMapLayerRef.current?.anchorOffset ?? { ...cameraOffset },
      };
    }
  }

  // Composite static layers onto background canvas (only when content changed)
  if (bgCanvas && (staticLayerChanged || fogNeedsRedraw)) {
    const bgCtx = bgCanvas.getContext("2d");
    if (bgCtx) {
      interceptShadows(bgCtx);
      bgCtx.setTransform(1, 0, 0, 1, 0, 0);
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.scale(dpr, dpr);
      if (cachedStaticMapLayerRef.current) {
        bgCtx.drawImage(cachedStaticMapLayerRef.current.canvas, 0, 0, overscanCssW, overscanCssH);
      }
      if (cachedFogLayerRef.current) {
        bgCtx.drawImage(cachedFogLayerRef.current.canvas, 0, 0, overscanCssW, overscanCssH);
      }
    }
  }
  // Position bgCanvas via CSS transform — GPU-accelerated, runs every frame.
  // During active zoom, also apply CSS scale to compensate for zoom mismatch.
  if (bgCanvas) {
    const bgAnchor = cachedStaticMapLayerRef.current?.anchorOffset ?? cameraOffset;
    const bgDeltaX = (bgAnchor.x - cameraOffset.x) * cameraZoom;
    const bgDeltaY = (bgAnchor.y - cameraOffset.y) * cameraZoom;
    if (hasZoomMismatch) {
      const tx = -bgDeltaX + width / 2 - overscanCssW * zoomCompensation / 2;
      const ty = -bgDeltaY + height / 3 - overscanCssH * zoomCompensation / 3;
      bgCanvas.style.transformOrigin = "0 0";
      bgCanvas.style.transform = `translate(${tx}px,${ty}px) scale(${zoomCompensation})`;
    } else {
      const translateX = BG_OVERSCAN_X / 2 + bgDeltaX;
      const translateY = BG_OVERSCAN_Y / 3 + bgDeltaY;
      bgCanvas.style.transformOrigin = "";
      bgCanvas.style.transform = `translate(${-translateX}px,${-translateY}px)`;
    }
  }
  // Backdrop canvas — pan only, never zoom-scaled.
  if (backdropCanvas) {
    const translateX = BG_OVERSCAN_X / 2;
    const translateY = BG_OVERSCAN_Y / 3;
    backdropCanvas.style.transformOrigin = "";
    backdropCanvas.style.transform = `translate(${-translateX}px,${-translateY}px)`;
  }
  // Fallback: if no bg canvas, extract visible portion from oversized cache
  if (!bgCanvas) {
    // Draw backdrop without zoom compensation (it's zoom-independent)
    if (hasBackdropCanvas && cachedBackdropRef.current) {
      const bdSrcX = (BG_OVERSCAN_X / 2) * dpr;
      const bdSrcY = (BG_OVERSCAN_Y / 3) * dpr;
      ctx.drawImage(
        cachedBackdropRef.current.canvas,
        bdSrcX, bdSrcY, canvas.width, canvas.height,
        0, 0, width, height,
      );
    }
    const fbAnchor = cachedStaticMapLayerRef.current?.anchorOffset ?? cameraOffset;
    const fbDeltaX = (fbAnchor.x - cameraOffset.x) * cameraZoom;
    const fbDeltaY = (fbAnchor.y - cameraOffset.y) * cameraZoom;
    if (hasZoomMismatch) {
      ctx.save();
      ctx.translate(width / 2, height / 3);
      ctx.scale(zoomCompensation, zoomCompensation);
      ctx.translate(-width / 2, -height / 3);
      const fbOffX = (cameraOffset.x - fbAnchor.x) * cacheZoomForKey;
      const fbOffY = (cameraOffset.y - fbAnchor.y) * cacheZoomForKey;
      ctx.translate(fbOffX, fbOffY);
      const fbSrcX = (BG_OVERSCAN_X / 2) * dpr;
      const fbSrcY = (BG_OVERSCAN_Y / 3) * dpr;
      if (cachedStaticMapLayerRef.current) {
        ctx.drawImage(
          cachedStaticMapLayerRef.current.canvas,
          fbSrcX, fbSrcY, canvas.width, canvas.height,
          0, 0, width, height,
        );
      }
      if (cachedFogLayerRef.current) {
        ctx.drawImage(
          cachedFogLayerRef.current.canvas,
          fbSrcX, fbSrcY, canvas.width, canvas.height,
          0, 0, width, height,
        );
      }
      ctx.restore();
    } else {
      const fbSrcX = (BG_OVERSCAN_X / 2 + fbDeltaX) * dpr;
      const fbSrcY = (BG_OVERSCAN_Y / 3 + fbDeltaY) * dpr;
      if (cachedStaticMapLayerRef.current) {
        ctx.drawImage(
          cachedStaticMapLayerRef.current.canvas,
          fbSrcX, fbSrcY, canvas.width, canvas.height,
          0, 0, width, height,
        );
      }
      if (cachedFogLayerRef.current) {
        ctx.drawImage(
          cachedFogLayerRef.current.canvas,
          fbSrcX, fbSrcY, canvas.width, canvas.height,
          0, 0, width, height,
        );
      }
    }
  }

  ctx.save();

  // Pre-pass: special tower ground transitions (above roads, below decorations/towers)
  renderSpecialTowerTransitions(
    ctx,
    selectedMap,
    canvas.width,
    canvas.height,
    dpr,
    cameraOffset,
    cameraZoom,
  );

  // Generate theme-specific decorations (CACHED for performance)
  // PERFORMANCE FIX: Cache decorations to avoid regenerating 500+ objects every frame
  let decorations: RuntimeDecoration[];

  const settingsVer = getSettingsVersion();
  const decorCacheKey = `${selectedMap}:${settingsVer}`;
  if (cachedDecorationsRef.current && cachedDecorationsRef.current.mapKey === decorCacheKey) {
    decorations = cachedDecorationsRef.current.decorations;
  } else {
    // Generate decorations and cache them
    decorations = [];
    const spacingGrid = new DecorationSpatialGrid();
    seededRandom = createSeededRandom(mapSeed + 400);
    const currentTheme = mapTheme;

    const categories = getDecorationCategories(currentTheme);
    const levelPathKeys =
      activeWaveSpawnPaths.length > 0
        ? activeWaveSpawnPaths
        : getLevelPathKeys(selectedMap);

    const allPathSegments: PathSegment[] = [];
    for (const pathKey of levelPathKeys) {
      const pathPoints = MAP_PATHS[pathKey];
      if (pathPoints && pathPoints.length >= 2) {
        allPathSegments.push(...buildPathSegments(pathPoints));
      }
    }

    const distToPath = (worldPos: Position): number =>
      minDistanceToPath(worldPos, allPathSegments);

    const isOnPath = (worldPos: Position): boolean =>
      distToPath(worldPos) < TOWER_PLACEMENT_BUFFER + 15;

    // Create deterministic zones for different decoration types
    const zoneSize = 4;
    const minX = -12, maxX = GRID_WIDTH + 12;
    const minY = -12, maxY = GRID_HEIGHT + 12;
    const zonesX = Math.ceil((maxX - minX) / zoneSize);
    const zonesY = Math.ceil((maxY - minY) / zoneSize);

    const distFromPath = (gx: number, gy: number): number =>
      distToPath(gridToWorld({ x: gx, y: gy }));

    const isBeyondGrid = (gx: number, gy: number): boolean =>
      gx < 0 || gx > GRID_WIDTH || gy < 0 || gy > GRID_HEIGHT;
    const BEYOND_GRID_REDUCE = 0.3;
    const specialTowerZones = getLevelSpecialTowers(selectedMap).map((tower) => ({
      cx: tower.pos.x,
      cy: tower.pos.y,
    }));

    // Build landmark exclusion zones from map-defined decorations.
    const landmarkZones: LandmarkZone[] = [];
    if (levelData?.decorations) {
      for (const deco of levelData.decorations) {
        const decoType = deco.category || deco.type;
        if (!decoType || !LANDMARK_DECORATION_TYPES.has(decoType)) continue;
        const resolvedPlacement = resolveMapDecorationRuntimePlacement(deco);
        const decoWorldPos = getMapDecorationWorldPos(deco);
        const decoGridX = decoWorldPos.x / TILE_SIZE - 0.5;
        const decoGridY = decoWorldPos.y / TILE_SIZE - 0.5;
        const exclusion = getLandmarkSpawnExclusion(
          decoType,
          resolvedPlacement?.scale ?? (deco.size || 1),
          deco.heightTag
        );
        if (!exclusion) continue;
        landmarkZones.push({
          cx: decoGridX,
          cy: decoGridY,
          coreR: exclusion.coreR,
          fullR: exclusion.fullR,
        });
      }
    }

    // Zone assignments with smaller zones for tighter clustering
    const zoneAssignments: (keyof typeof categories)[][] = [];
    for (let zx = 0; zx < zonesX; zx++) {
      zoneAssignments[zx] = [];
      for (let zy = 0; zy < zonesY; zy++) {
        const zoneHash = (mapSeed * 31 + zx * 17 + zy * 13) % 100;
        let cat: keyof typeof categories;
        if (zoneHash < 45) cat = "trees";
        else if (zoneHash < 70) cat = "terrain";
        else if (zoneHash < 88) cat = "structures";
        else cat = "scattered";
        zoneAssignments[zx][zy] = cat;
      }
    }

    const landscapeSettings = getGameSettings().landscaping;
    const decoMultiplier = DECORATION_DENSITY_MULTIPLIER[landscapeSettings.decorationDensity];
    const scaleRange = DECORATION_SCALE_RANGE[landscapeSettings.decorationScale];

    const mainDecoCount = Math.round(300 * decoMultiplier);
    for (let i = 0; i < mainDecoCount; i++) {
      const zoneX = Math.floor(seededRandom() * zonesX);
      const zoneY = Math.floor(seededRandom() * zonesY);
      const category = zoneAssignments[zoneX][zoneY];
      const categoryDecors = categories[category];
      if (!categoryDecors || categoryDecors.length === 0) continue;

      const zoneCenterX = minX + (zoneX + 0.5) * zoneSize;
      const zoneCenterY = minY + (zoneY + 0.5) * zoneSize;
      const offsetX = (seededRandom() - 0.5 + seededRandom() - 0.5) * zoneSize * 0.65;
      const offsetY = (seededRandom() - 0.5 + seededRandom() - 0.5) * zoneSize * 0.65;
      const gridX = zoneCenterX + offsetX;
      const gridY = zoneCenterY + offsetY;

      if (isBeyondGrid(gridX, gridY) && seededRandom() > BEYOND_GRID_REDUCE) continue;

      const worldPos = gridToWorld({ x: gridX, y: gridY });
      if (isOnPath(worldPos)) continue;

      const isLargeCategory = category === "trees" || category === "structures";
      if (isLargeCategory && isInLandmarkCore(gridX, gridY, landmarkZones)) continue;
      if (!isLargeCategory && isInLandmarkFull(gridX, gridY, landmarkZones)) continue;
      if (isLargeCategory && isInSpecialTowerZone(gridX, gridY, 1.9, specialTowerZones)) continue;
      if (!isLargeCategory && isInSpecialTowerZone(gridX, gridY, 1.15, specialTowerZones)) continue;

      const typeIndex = Math.floor(seededRandom() * seededRandom() * categoryDecors.length);
      const type = categoryDecors[typeIndex] as DecorationType;

      if (!landscapeSettings.showWaterEffects && WATER_DECORATION_TYPES.has(type)) continue;

      let baseScale = scaleRange.base;
      let scaleVar = scaleRange.variance;
      if (category === "trees") {
        baseScale = Math.max(baseScale, 0.75);
        scaleVar = Math.max(scaleVar, 0.5);
      } else if (category === "structures") {
        baseScale = Math.max(baseScale, 0.8);
        scaleVar = Math.min(scaleVar, 0.45);
      } else if (category === "scattered") {
        baseScale = Math.min(baseScale, 0.55);
        scaleVar = Math.min(scaleVar, 0.45);
      }

      const scale = baseScale + seededRandom() * scaleVar;
      const rotation = seededRandom() * Math.PI * 2;
      const variant = Math.floor(seededRandom() * 4);

      const exR = getExclusionRadius(type, scale);
      if (!spacingGrid.tryPlace(gridX, gridY, exR)) continue;

      decorations.push({
        type,
        x: worldPos.x,
        y: worldPos.y,
        scale,
        rotation,
        variant,
      });
    }

    const treeClusterCount = TREE_CLUSTER_COUNT[landscapeSettings.treeClusterDensity];
    for (let cluster = 0; cluster < treeClusterCount; cluster++) {
      const clusterX = minX + seededRandom() * (maxX - minX);
      const clusterY = minY + seededRandom() * (maxY - minY);

      if (isBeyondGrid(clusterX, clusterY) && seededRandom() > BEYOND_GRID_REDUCE) continue;

      const treesInCluster = 8 + Math.floor(seededRandom() * 10);
      const treeTypes = categories.trees;
      for (let t = 0; t < treesInCluster; t++) {
        const treeX = clusterX + (seededRandom() - 0.5) * 2.9;
        const treeY = clusterY + (seededRandom() - 0.5) * 2.9;
        const worldPos = gridToWorld({ x: treeX, y: treeY });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(treeX, treeY, landmarkZones)) continue;
        if (isInSpecialTowerZone(treeX, treeY, 1.9, specialTowerZones)) continue;

        const treeType = treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType;
        const treeScale = 0.6 + seededRandom() * 0.7;
        const treeRot = seededRandom() * Math.PI * 2;
        const treeVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(treeType, treeScale);
        if (!spacingGrid.tryPlace(treeX, treeY, exR)) continue;

        decorations.push({
          type: treeType,
          x: worldPos.x,
          y: worldPos.y,
          scale: treeScale,
          rotation: treeRot,
          variant: treeVar,
        });
      }
    }

    const groveCount = GROVE_COUNT[landscapeSettings.treeClusterDensity];
    for (let grove = 0; grove < groveCount; grove++) {
      const groveX = minX + 3 + seededRandom() * (maxX - minX - 6);
      const groveY = minY + 3 + seededRandom() * (maxY - minY - 6);
      const groveDist = distFromPath(groveX, groveY);
      if (groveDist < TOWER_PLACEMENT_BUFFER + 40) continue;

      const groveSize = 6 + Math.floor(seededRandom() * 8);
      const treeTypes = categories.trees;
      for (let t = 0; t < groveSize; t++) {
        const tx = groveX + (seededRandom() - 0.5) * 2.62;
        const ty = groveY + (seededRandom() - 0.5) * 2.62;
        const worldPos = gridToWorld({ x: tx, y: ty });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(tx, ty, landmarkZones)) continue;
        if (isInSpecialTowerZone(tx, ty, 1.9, specialTowerZones)) continue;

        const groveType = treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType;
        const groveScale = 0.65 + seededRandom() * 0.65;
        const groveRot = seededRandom() * Math.PI * 2;
        const groveVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(groveType, groveScale);
        if (!spacingGrid.tryPlace(tx, ty, exR)) continue;

        decorations.push({
          type: groveType,
          x: worldPos.x,
          y: worldPos.y,
          scale: groveScale,
          rotation: groveRot,
          variant: groveVar,
        });
      }
    }

    const villageCount = VILLAGE_COUNT[landscapeSettings.villageDensity];
    for (let village = 0; village < villageCount; village++) {
      const villageX = minX + 5 + seededRandom() * (maxX - minX - 10);
      const villageY = minY + 5 + seededRandom() * (maxY - minY - 10);
      const villageCenterWorld = gridToWorld({ x: villageX, y: villageY });
      if (isOnPath(villageCenterWorld)) continue;
      if (distFromPath(villageX, villageY) < TOWER_PLACEMENT_BUFFER + 25) continue;
      if (isInSpecialTowerZone(villageX, villageY, 2.3, specialTowerZones)) continue;

      const structureTypes = categories.structures;
      const scatteredTypes = categories.scattered;
      const structCount = 6 + Math.floor(seededRandom() * 7);

      // Core structures
      for (let si = 0; si < structCount; si++) {
        const structX = villageX + (seededRandom() - 0.5) * 3.0;
        const structY = villageY + (seededRandom() - 0.5) * 3.0;
        const worldPos = gridToWorld({ x: structX, y: structY });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(structX, structY, landmarkZones)) continue;
        if (isInSpecialTowerZone(structX, structY, 1.9, specialTowerZones)) continue;

        const sType = structureTypes[Math.floor(seededRandom() * structureTypes.length)] as DecorationType;
        const sScale = 0.7 + seededRandom() * 0.5;
        const sRot = seededRandom() * Math.PI * 0.3 - Math.PI * 0.15;
        const sVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(sType, sScale);
        if (!spacingGrid.tryPlace(structX, structY, exR)) continue;

        decorations.push({
          type: sType,
          x: worldPos.x,
          y: worldPos.y,
          scale: sScale,
          rotation: sRot,
          variant: sVar,
        });
      }

      // Surrounding scatter (lampposts, barrels, signs around village)
      const surroundCount = 4 + Math.floor(seededRandom() * 5);
      for (let si = 0; si < surroundCount; si++) {
        const angle = seededRandom() * Math.PI * 2;
        const dist2 = 1.8 + seededRandom() * 1.5;
        const sx = villageX + Math.cos(angle) * dist2;
        const sy = villageY + Math.sin(angle) * dist2;
        const worldPos = gridToWorld({ x: sx, y: sy });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkFull(sx, sy, landmarkZones)) continue;
        if (isInSpecialTowerZone(sx, sy, 1.15, specialTowerZones)) continue;

        const scType = (scatteredTypes.length > 0
          ? scatteredTypes[Math.floor(seededRandom() * scatteredTypes.length)]
          : structureTypes[Math.floor(seededRandom() * structureTypes.length)]) as DecorationType;
        const scScale = 0.5 + seededRandom() * 0.4;
        const scRot = seededRandom() * Math.PI * 2;
        const scVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(scType, scScale);
        if (!spacingGrid.tryPlace(sx, sy, exR)) continue;

        decorations.push({
          type: scType,
          x: worldPos.x,
          y: worldPos.y,
          scale: scScale,
          rotation: scRot,
          variant: scVar,
        });
      }

      // Trees around village perimeter
      const perimeterTrees = 3 + Math.floor(seededRandom() * 4);
      const treeTypes = categories.trees;
      for (let ti = 0; ti < perimeterTrees; ti++) {
        const angle = seededRandom() * Math.PI * 2;
        const dist2 = 2.5 + seededRandom() * 2;
        const tx = villageX + Math.cos(angle) * dist2;
        const ty = villageY + Math.sin(angle) * dist2;
        const worldPos = gridToWorld({ x: tx, y: ty });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(tx, ty, landmarkZones)) continue;
        if (isInSpecialTowerZone(tx, ty, 1.9, specialTowerZones)) continue;

        const ptType = treeTypes[Math.floor(seededRandom() * treeTypes.length)] as DecorationType;
        const ptScale = 0.6 + seededRandom() * 0.5;
        const ptRot = seededRandom() * Math.PI * 2;
        const ptVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(ptType, ptScale);
        if (!spacingGrid.tryPlace(tx, ty, exR)) continue;

        decorations.push({
          type: ptType,
          x: worldPos.x,
          y: worldPos.y,
          scale: ptScale,
          rotation: ptRot,
          variant: ptVar,
        });
      }
    }

    const uniformFillCount = Math.round(350 * decoMultiplier);
    for (let i = 0; i < uniformFillCount; i++) {
      const gx = minX + seededRandom() * (maxX - minX);
      const gy = minY + seededRandom() * (maxY - minY);
      const pathDist = distFromPath(gx, gy);

      const pathFactor = Math.min(1, pathDist / 120);
      if (seededRandom() > pathFactor) continue;

      if (isBeyondGrid(gx, gy) && seededRandom() > BEYOND_GRID_REDUCE) continue;

      const worldPos = gridToWorld({ x: gx, y: gy });
      if (isOnPath(worldPos)) continue;
      if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
      if (isInSpecialTowerZone(gx, gy, 1.15, specialTowerZones)) continue;

      const allDecorTypes = [...categories.trees, ...categories.terrain];
      const fillType = allDecorTypes[Math.floor(seededRandom() * allDecorTypes.length)] as DecorationType;
      const fillScale = 0.5 + seededRandom() * 0.6;
      const fillRot = seededRandom() * Math.PI * 2;
      const fillVar = Math.floor(seededRandom() * 4);

      const exR = getExclusionRadius(fillType, fillScale);
      if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

      decorations.push({
        type: fillType,
        x: worldPos.x,
        y: worldPos.y,
        scale: fillScale,
        rotation: fillRot,
        variant: fillVar,
      });
    }

    // Battle damage (theme-appropriate)
    seededRandom = createSeededRandom(mapSeed + 600);
    const battleDecors: DecorationType[] =
      currentTheme === "volcanic"
        ? ["crater", "ember", "bones", "sword"]
        : currentTheme === "winter"
          ? ["crater", "debris", "sword", "arrow"]
          : currentTheme === "desert"
            ? ["crater", "skeleton", "sword", "arrow", "bones"]
            : currentTheme === "swamp"
              ? ["crater", "skeleton", "bones", "debris"]
              : ["crater", "debris", "cart", "sword", "arrow", "skeleton", "fire"];
    const battleDebrisCount = BATTLE_DEBRIS_COUNT[landscapeSettings.battleDebrisDensity];
    for (let i = 0; i < battleDebrisCount; i++) {
      const gridX = seededRandom() * (GRID_WIDTH + 23) - 11.5;
      const gridY = seededRandom() * (GRID_HEIGHT + 23) - 11.5;

      if (isBeyondGrid(gridX, gridY) && seededRandom() > BEYOND_GRID_REDUCE) continue;
      if (isInLandmarkFull(gridX, gridY, landmarkZones)) continue;
      if (isInSpecialTowerZone(gridX, gridY, 1.15, specialTowerZones)) continue;

      const worldPos = gridToWorld({ x: gridX, y: gridY });
      const bdType =
        battleDecors[Math.floor(seededRandom() * battleDecors.length)];
      const bdScale = 0.4 + seededRandom() * 0.55;
      const bdRot = seededRandom() * Math.PI * 2;
      const bdVar = Math.floor(seededRandom() * 4);

      const exR = getExclusionRadius(bdType, bdScale);
      if (!spacingGrid.tryPlace(gridX, gridY, exR)) continue;

      decorations.push({
        type: bdType,
        x: worldPos.x,
        y: worldPos.y,
        scale: bdScale,
        rotation: bdRot,
        variant: bdVar,
      });
    }

    // Grid edge border decorations — line the perimeter with trees and terrain
    seededRandom = createSeededRandom(mapSeed + 800);
    const edgeTreeTypes = categories.trees;
    const edgeTerrainTypes = categories.terrain;

    const edgeSegments = [
      { startX: -3, startY: -2, dx: 1, dy: 0, length: GRID_WIDTH + 6 },
      { startX: -3, startY: GRID_HEIGHT + 2, dx: 1, dy: 0, length: GRID_WIDTH + 6 },
      { startX: -2, startY: -3, dx: 0, dy: 1, length: GRID_HEIGHT + 6 },
      { startX: GRID_WIDTH + 2, startY: -3, dx: 0, dy: 1, length: GRID_HEIGHT + 6 },
    ];

    for (const seg of edgeSegments) {
      let travelled = 0;
      while (travelled < seg.length) {
        const step = 1.2 + seededRandom() * 1.3;
        travelled += step;
        if (travelled > seg.length) break;

        const baseX = seg.startX + seg.dx * travelled;
        const baseY = seg.startY + seg.dy * travelled;
        const perpX = seg.dy;
        const perpY = seg.dx;
        const offsetPerp = (seededRandom() - 0.5) * 3;
        const offsetAlong = (seededRandom() - 0.5) * 0.5;
        const gx = baseX + perpX * offsetPerp + seg.dx * offsetAlong;
        const gy = baseY + perpY * offsetPerp + seg.dy * offsetAlong;

        const worldPos = gridToWorld({ x: gx, y: gy });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
        if (isInSpecialTowerZone(gx, gy, 1.9, specialTowerZones)) continue;

        const isTree = seededRandom() > 0.3;
        const edgeType = (isTree
          ? edgeTreeTypes[Math.floor(seededRandom() * edgeTreeTypes.length)]
          : edgeTerrainTypes[Math.floor(seededRandom() * edgeTerrainTypes.length)]) as DecorationType;
        const edgeScale = isTree ? 0.7 + seededRandom() * 0.6 : 0.5 + seededRandom() * 0.5;
        const edgeRot = seededRandom() * Math.PI * 2;
        const edgeVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(edgeType, edgeScale);
        if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

        decorations.push({
          type: edgeType,
          x: worldPos.x,
          y: worldPos.y,
          scale: edgeScale,
          rotation: edgeRot,
          variant: edgeVar,
        });
      }
    }

    // Dense decorations around path spawns and exits
    seededRandom = createSeededRandom(mapSeed + 700);
    const pathEndpoints: { x: number; y: number }[] = [];
    for (const pathKey of levelPathKeys) {
      const pathPoints = MAP_PATHS[pathKey];
      if (!pathPoints || pathPoints.length < 2) continue;
      pathEndpoints.push(pathPoints[0], pathPoints[pathPoints.length - 1]);
    }

    const endpointTreeTypes = categories.trees;
    const endpointTerrainTypes = categories.terrain;

    for (const endpoint of pathEndpoints) {
      // Inner dense wall of large trees/terrain right at the endpoint (0.3-2 tiles)
      const innerCount = 10 + Math.floor(seededRandom() * 5);
      for (let i = 0; i < innerCount; i++) {
        const angle = seededRandom() * Math.PI * 2;
        const dist2 = 0.3 + seededRandom() * 1.7;
        const gx = endpoint.x + Math.cos(angle) * dist2;
        const gy = endpoint.y + Math.sin(angle) * dist2;
        const worldPos = gridToWorld({ x: gx, y: gy });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
        if (isInSpecialTowerZone(gx, gy, 1.9, specialTowerZones)) continue;

        const epInType = (seededRandom() > 0.3
          ? endpointTreeTypes[Math.floor(seededRandom() * endpointTreeTypes.length)]
          : endpointTerrainTypes[Math.floor(seededRandom() * endpointTerrainTypes.length)]) as DecorationType;
        const epInScale = 0.8 + seededRandom() * 0.7;
        const epInRot = seededRandom() * Math.PI * 2;
        const epInVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(epInType, epInScale);
        if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

        decorations.push({
          type: epInType,
          x: worldPos.x,
          y: worldPos.y,
          scale: epInScale,
          rotation: epInRot,
          variant: epInVar,
        });
      }

      // Mid-ring trees (1.5-4.5 tiles)
      const treeCount = 18 + Math.floor(seededRandom() * 8);
      for (let t = 0; t < treeCount; t++) {
        const angle = seededRandom() * Math.PI * 2;
        const dist2 = 1.5 + seededRandom() * 3;
        const gx = endpoint.x + Math.cos(angle) * dist2;
        const gy = endpoint.y + Math.sin(angle) * dist2;
        const worldPos = gridToWorld({ x: gx, y: gy });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkCore(gx, gy, landmarkZones)) continue;
        if (isInSpecialTowerZone(gx, gy, 1.9, specialTowerZones)) continue;

        const epMidType = (seededRandom() > 0.25
          ? endpointTreeTypes[Math.floor(seededRandom() * endpointTreeTypes.length)]
          : endpointTerrainTypes[Math.floor(seededRandom() * endpointTerrainTypes.length)]) as DecorationType;
        const epMidScale = 0.65 + seededRandom() * 0.65;
        const epMidRot = seededRandom() * Math.PI * 2;
        const epMidVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(epMidType, epMidScale);
        if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

        decorations.push({
          type: epMidType,
          x: worldPos.x,
          y: worldPos.y,
          scale: epMidScale,
          rotation: epMidRot,
          variant: epMidVar,
        });
      }

      // Outer scattered ring (2.5-6.5 tiles)
      const scatterCount = 12 + Math.floor(seededRandom() * 7);
      for (let s = 0; s < scatterCount; s++) {
        const angle = seededRandom() * Math.PI * 2;
        const dist2 = 2.5 + seededRandom() * 4;
        const gx = endpoint.x + Math.cos(angle) * dist2;
        const gy = endpoint.y + Math.sin(angle) * dist2;
        const worldPos = gridToWorld({ x: gx, y: gy });
        if (isOnPath(worldPos)) continue;
        if (isInLandmarkFull(gx, gy, landmarkZones)) continue;
        if (isInSpecialTowerZone(gx, gy, 1.15, specialTowerZones)) continue;

        const epOutTypes = [...categories.scattered, ...endpointTerrainTypes];
        const epOutType = epOutTypes[Math.floor(seededRandom() * epOutTypes.length)] as DecorationType;
        const epOutScale = 0.4 + seededRandom() * 0.5;
        const epOutRot = seededRandom() * Math.PI * 2;
        const epOutVar = Math.floor(seededRandom() * 4);

        const exR = getExclusionRadius(epOutType, epOutScale);
        if (!spacingGrid.tryPlace(gx, gy, exR)) continue;

        decorations.push({
          type: epOutType,
          x: worldPos.x,
          y: worldPos.y,
          scale: epOutScale,
          rotation: epOutRot,
          variant: epOutVar,
        });
      }
    }

    // Add major landmarks from LEVEL_DATA if defined
    const levelDecorations = LEVEL_DATA[selectedMap]?.decorations;
    if (levelDecorations && landscapeSettings.showLandmarks) {
      const specialTowerWorldPositions = getLevelSpecialTowers(selectedMap).map((tower) =>
        gridToWorld(tower.pos)
      );
      let manualDecorationCount = 0;
      for (const dec of levelDecorations) {
        const resolvedPlacement = resolveMapDecorationRuntimePlacement(dec);
        if (!resolvedPlacement) continue;

        const worldPos = getMapDecorationWorldPos(dec);
        if (specialTowerWorldPositions.length > 0) {
          const clearRadius =
            Math.max(TILE_SIZE * 0.8, resolvedPlacement.scale * 18);
          const overlapsSpecialTower = specialTowerWorldPositions.some(
            (specPos) => distance(worldPos, specPos) < clearRadius
          );
          if (overlapsSpecialTower) {
            continue;
          }
        }
        const decorationVariant =
          typeof dec.variant === "number"
            ? dec.variant
            : typeof dec.variant === "string"
              ? Number.parseInt(dec.variant, 10) || 0
              : 0;
        const manualDecoration: RuntimeDecoration = {
          type: resolvedPlacement.runtimeType,
          x: worldPos.x,
          y: worldPos.y,
          scale: resolvedPlacement.scale,
          rotation: 0,
          variant: decorationVariant,
          source: "manual",
          manualOrder: manualDecorationCount,
        };
        manualDecorationCount += 1;

        if (dec.heightTag) {
          manualDecoration.heightTag = dec.heightTag;
        }
        if (getDecorationRenderLayer(manualDecoration) === "background") {
          manualDecoration.renderLayer = "background";
        }
        decorations.push(manualDecoration);
      }
    }

    for (const decoration of decorations) {
      decoration.heightTag = getRuntimeDecorationHeightTag(decoration);
    }

    // Stable decoration order: background layer -> depth -> manual tie-breakers.
    decorations.sort((a, b) => {
      const layerDiff = getLayerPriority(a) - getLayerPriority(b);
      if (layerDiff !== 0) return layerDiff;

      const depthDiff = getDecorationIsoY(a) - getDecorationIsoY(b);
      if (Math.abs(depthDiff) > 0.001) return depthDiff;

      const sourceDiff = getSourcePriority(a) - getSourcePriority(b);
      if (sourceDiff !== 0) return sourceDiff;

      return (a.manualOrder ?? 0) - (b.manualOrder ?? 0);
    });

    // Cache the generated decorations
    cachedDecorationsRef.current = { mapKey: decorCacheKey, decorations };

    // Add blocked positions from procedural background decorations (water, lava, etc.)
    for (const dec of decorations) {
      if (dec.source === "manual") continue;
      if (!BACKGROUND_BLOCKING_DECORATION_TYPES.has(dec.type)) continue;
      const gx = Math.floor(dec.x / TILE_SIZE - 0.5);
      const gy = Math.floor(dec.y / TILE_SIZE - 0.5);
      const range = Math.ceil(dec.scale);
      for (let dx = -range; dx <= range; dx++) {
        for (let dy = -range; dy <= range; dy++) {
          blockedPositions.add(`${gx + dx},${gy + dy}`);
        }
      }
    }
  } // End of decoration generation (else block)

  const decorTime = nowSeconds;

  // Collect renderables
  const renderables: Renderable[] = [];
  const decorationMarginPx = QUALITY_DECORATION_MARGIN_PX[renderQuality];
  const decorCullMarginPx = decorationMarginPx + DECOR_OVERSCAN / 2;
  const worldCorners = [
    screenToWorld(
      { x: -decorCullMarginPx, y: -decorCullMarginPx },
      canvas.width, canvas.height, dpr, cameraOffset, cameraZoom
    ),
    screenToWorld(
      { x: width + decorCullMarginPx, y: -decorCullMarginPx },
      canvas.width, canvas.height, dpr, cameraOffset, cameraZoom
    ),
    screenToWorld(
      { x: -decorCullMarginPx, y: height + decorCullMarginPx },
      canvas.width, canvas.height, dpr, cameraOffset, cameraZoom
    ),
    screenToWorld(
      { x: width + decorCullMarginPx, y: height + decorCullMarginPx },
      canvas.width, canvas.height, dpr, cameraOffset, cameraZoom
    ),
  ];
  const minVisibleWorldX = Math.min(...worldCorners.map((p) => p.x));
  const maxVisibleWorldX = Math.max(...worldCorners.map((p) => p.x));
  const minVisibleWorldY = Math.min(...worldCorners.map((p) => p.y));
  const maxVisibleWorldY = Math.max(...worldCorners.map((p) => p.y));
  const enemyCullMargin = 220;
  const projectileCullMargin = 180;
  const effectCullMargin = 240;
  const enemyById = new Map(enemies.map((enemy) => [enemy.id, enemy]));
  const enemyWorldPosById = new Map<string, Position>();
  const getEnemyWorldPos = (enemy: Enemy): Position => {
    const cached = enemyWorldPosById.get(enemy.id);
    if (cached) return cached;
    const pos = getEnemyPosWithPath(enemy, selectedMap);
    enemyWorldPosById.set(enemy.id, pos);
    return pos;
  };

  // Decoration cache key excludes offset — position correction handles panning.
  const DECOR_PAN_TOLERANCE_PX = 200;
  const decorBaseKey = [
    selectedMap,
    canvas.width,
    canvas.height,
    dpr,
    renderQuality,
    cacheZoomForKey.toFixed(3),
  ].join("|");
  const drawBackgroundDecorations = (
    entries: CachedVisibleDecoration[],
    offsetCorrectionX = 0,
    offsetCorrectionY = 0,
    scaleZoom = cameraZoom,
  ) => {
    const hasCorrection = offsetCorrectionX !== 0 || offsetCorrectionY !== 0;
    if (hasCorrection) ctx.save();
    if (hasCorrection) ctx.translate(offsetCorrectionX, offsetCorrectionY);
    for (const entry of entries) {
      if (entry.sprite) {
        drawDecorationSprite(ctx, entry.sprite, entry.screenPos);
        continue;
      }
      const dec = entry.decoration;
      const decVolume = getDecorationVolumeSpec(dec.type, dec.heightTag);
      const hasBackgroundShadowPass = decVolume.backgroundShadowOnly;
      ctx.save();
      renderDecorationItem({
        ctx,
        screenPos: entry.screenPos,
        scale: scaleZoom * dec.scale,
        type: dec.type,
        rotation: dec.rotation,
        variant: dec.variant,
        decorTime,
        decorX: dec.x,
        decorY: dec.y,
        selectedMap,
        mapTheme,
        shadowOnly: !!entry.shadowOnly,
        skipShadow: hasBackgroundShadowPass && !entry.shadowOnly,
        zoom: scaleZoom,
      });
      ctx.restore();
    }
    if (hasCorrection) ctx.restore();
  };
  const drawLevelHazards = () => {
    const levelHazards = LEVEL_DATA[selectedMap]?.hazards;
    if (!levelHazards || levelHazards.length === 0) return;

    for (const hazard of levelHazards) {
      renderHazard(
        ctx,
        hazard,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
    }
  };

  // Hazards must render beneath all decoration passes.
  drawLevelHazards();

  // Merge pending death effects from the ref queue so they render immediately,
  // bypassing React state batch timing.
  const pendingDeath = pendingDeathEffectsRef.current;
  const effectIds = new Set(effects.map(e => e.id));
  const mergedEffects: Effect[] = [...effects];
  const now = performance.now();
  const survivingPending: Effect[] = [];
  for (const de of pendingDeath) {
    if (effectIds.has(de.id)) continue;
    const spawnedAt = (de as Effect & { _spawnedAt?: number })._spawnedAt || now;
    const elapsed = now - spawnedAt;
    de.progress = Math.min(0.99, elapsed / (de.duration || 500));
    if (de.progress < 0.99) {
      mergedEffects.push(de);
      survivingPending.push(de);
    }
  }
  pendingDeathEffectsRef.current = survivingPending;

  // Ground-level spell effects (scorch marks, impact craters) render above roads/hazards
  // but below decorations, towers, and entities.
  const groundEffectTypes = new Set(["fire_scorch", "lightning_scorch", "meteor_impact"]);
  const skyEffectTypes = new Set(["meteor_falling", "lightning_bolt"]);
  const deathEffectType = "enemy_death";
  const groundEffects: Effect[] = [];
  const skyEffects: Effect[] = [];
  const deathEffects: Effect[] = [];
  for (const eff of mergedEffects) {
    if (groundEffectTypes.has(eff.type)) groundEffects.push(eff);
    else if (skyEffectTypes.has(eff.type)) skyEffects.push(eff);
    else if (eff.type === deathEffectType) deathEffects.push(eff);
  }
  for (const eff of groundEffects) {
    renderEffect(
      ctx, eff, canvas.width, canvas.height, dpr,
      enemies, towers, selectedMap, cameraOffset, cameraZoom, mergedEffects.length
    );
  }

  // Death animation effects render above roads/hazards but below decorations and entities.
  for (const eff of deathEffects) {
    const deathScreenPos = worldToScreen(eff.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
    const deathZoom = cameraZoom || 1;
    ctx.save();
    renderEnemyDeath(ctx, deathScreenPos, deathZoom, eff.progress, eff);
    ctx.restore();
  }

  let animatedVisibleDecorations: CachedVisibleDecoration[] = [];
  let depthSensitiveVisibleDecorations: CachedVisibleDecoration[] = [];
  let decorPosCorrectX = 0;
  let decorPosCorrectY = 0;
  const cachedStaticDecorationLayer = cachedStaticDecorationLayerRef.current;
  const decorAnchor = cachedStaticDecorationLayer?.anchorOffset;
  const decorPanPxX = decorAnchor ? (decorAnchor.x - cameraOffset.x) * cameraZoom : Infinity;
  const decorPanPxY = decorAnchor ? (decorAnchor.y - cameraOffset.y) * cameraZoom : Infinity;
  const decorExceedsLimit =
    Math.abs(decorPanPxX) > DECOR_PAN_TOLERANCE_PX ||
    Math.abs(decorPanPxY) > DECOR_PAN_TOLERANCE_PX;
  const decorCacheHit =
    cachedStaticDecorationLayer &&
    cachedStaticDecorationLayer.key === decorBaseKey &&
    !decorExceedsLimit;
  const decorCacheZoomVal = cachedStaticDecorationLayer?.cacheZoom ?? cacheZoomForKey;
  const decorZoomRatio = cameraZoom / decorCacheZoomVal;
  const decorHasZoomMismatch = decorCacheHit && Math.abs(decorZoomRatio - 1) > 0.001;
  if (decorCacheHit) {
    if (decorHasZoomMismatch) {
      const offsetAtCacheZoom_X = (cameraOffset.x - decorAnchor!.x) * decorCacheZoomVal;
      const offsetAtCacheZoom_Y = (cameraOffset.y - decorAnchor!.y) * decorCacheZoomVal;
      ctx.save();
      ctx.translate(width / 2, height / 3);
      ctx.scale(decorZoomRatio, decorZoomRatio);
      ctx.translate(-width / 2, -height / 3);
      ctx.translate(offsetAtCacheZoom_X, offsetAtCacheZoom_Y);
      drawBackgroundDecorations(
        cachedStaticDecorationLayer.backgroundDecorations,
        0, 0,
        decorCacheZoomVal,
      );
      if (cachedStaticDecorationLayer.canvas) {
        const dSrcX = (DECOR_OVERSCAN / 2) * dpr;
        const dSrcY = (DECOR_OVERSCAN / 2) * dpr;
        ctx.drawImage(
          cachedStaticDecorationLayer.canvas,
          dSrcX, dSrcY, canvas.width, canvas.height,
          0, 0, width, height,
        );
      }
      ctx.restore();
    } else {
      decorPosCorrectX = (cameraOffset.x - decorAnchor!.x) * cameraZoom;
      decorPosCorrectY = (cameraOffset.y - decorAnchor!.y) * cameraZoom;
      drawBackgroundDecorations(
        cachedStaticDecorationLayer.backgroundDecorations,
        decorPosCorrectX,
        decorPosCorrectY,
      );
      if (cachedStaticDecorationLayer.canvas) {
        const dSrcX = (DECOR_OVERSCAN / 2 - decorPosCorrectX) * dpr;
        const dSrcY = (DECOR_OVERSCAN / 2 - decorPosCorrectY) * dpr;
        ctx.drawImage(
          cachedStaticDecorationLayer.canvas,
          dSrcX, dSrcY, canvas.width, canvas.height,
          0, 0, width, height,
        );
      }
    }
    animatedVisibleDecorations = cachedStaticDecorationLayer.animatedDecorations;
    depthSensitiveVisibleDecorations =
      cachedStaticDecorationLayer.depthSensitiveDecorations;
  } else {
    const visibleDecorations: CachedVisibleDecoration[] = [];
    for (const dec of decorations) {
      if (
        isChallengeTerrainLevel &&
        !isWorldPosInChallengeDecorationFootprint(
          { x: dec.x, y: dec.y },
          challengePathSegments
        )
      ) {
        continue;
      }
      if (
        dec.x < minVisibleWorldX ||
        dec.x > maxVisibleWorldX ||
        dec.y < minVisibleWorldY ||
        dec.y > maxVisibleWorldY
      ) {
        continue;
      }
      const decScreenPos = toScreenForCache({ x: dec.x, y: dec.y });
      if (
        decScreenPos.x < -decorCullMarginPx ||
        decScreenPos.x > width + decorCullMarginPx ||
        decScreenPos.y < -decorCullMarginPx ||
        decScreenPos.y > height + decorCullMarginPx
      ) {
        continue;
      }
      visibleDecorations.push({
        decoration: dec,
        screenPos: decScreenPos,
        isoY: getDecorationIsoY(dec),
      });
    }

    const backgroundDecorations: CachedVisibleDecoration[] = [];
    const staticDecorations: CachedVisibleDecoration[] = [];
    const depthSensitiveDecorations: CachedVisibleDecoration[] = [];
    const occlusionAnchors: OcclusionAnchor[] = visibleDecorations.reduce<
      OcclusionAnchor[]
    >((anchors, entry) => {
      const volume = getDecorationVolumeSpec(
        entry.decoration.type,
        entry.decoration.heightTag
      );
      if (volume.heightTag !== "landmark") {
        return anchors;
      }
      const screenScale = cacheZoomForKey * entry.decoration.scale;
      anchors.push({
        source: entry,
        heightTag: volume.heightTag,
        centerX: entry.screenPos.x,
        centerY: entry.screenPos.y + volume.anchorOffsetY * screenScale,
        radiusX: (volume.width * 0.35) * screenScale,
        radiusY: (volume.length * 0.35) * screenScale,
        isoY: entry.isoY,
        frontDepthPadding: volume.frontDepthPadding * entry.decoration.scale,
      });
      return anchors;
    }, []);

    const DEPTH_LAYER_ROAD_DIST = TILE_SIZE * 7;
    const ANIMATED_DEPTH_TYPES: ReadonlySet<string> = new Set([
      "torch", "fire", "fire_pit", "campfire", "fountain",
      "glowing_runes", "tentacle",
    ]);
    const ANIMATED_BG_TYPES: ReadonlySet<string> = new Set([
      "deep_water", "lava_pool", "lava_fall", "poison_pool",
      "lake", "algae_pool", "fishing_spot", "carnegie_lake",
    ]);
    const ALWAYS_DEPTH_SORTED_TYPES: ReadonlySet<string> = new Set([
      "broken_wall", "broken_bridge", "ruins", "hut",
      "statue", "obelisk", "hanging_cage", "fence",
    ]);
    const decorPathKeys =
      activeWaveSpawnPaths.length > 0
        ? activeWaveSpawnPaths
        : getLevelPathKeys(selectedMap);
    const decorPathSegments: PathSegment[] = [];
    for (const pathKey of decorPathKeys) {
      const pathPoints = MAP_PATHS[pathKey];
      if (pathPoints && pathPoints.length >= 2) {
        decorPathSegments.push(...buildPathSegments(pathPoints));
      }
    }

    for (const entry of visibleDecorations) {
      const renderLayer = getDecorationRenderLayer(entry.decoration);
      const volume = getDecorationVolumeSpec(
        entry.decoration.type,
        entry.decoration.heightTag
      );
      const occlusionState = getOcclusionState(entry, occlusionAnchors);
      const resolvedEntry =
        occlusionState.clampIsoY === undefined
          ? entry
          : {
            ...entry,
            isoY: Math.min(entry.isoY, occlusionState.clampIsoY),
          };
      if (volume.backgroundShadowOnly) {
        backgroundDecorations.push({ ...resolvedEntry, shadowOnly: true });
      }
      const isNearRoad =
        minDistanceToPath(
          { x: entry.decoration.x, y: entry.decoration.y },
          decorPathSegments,
        ) <= DEPTH_LAYER_ROAD_DIST;
      const isDepthAnimated = ANIMATED_DEPTH_TYPES.has(entry.decoration.type);
      const isBgAnimated = ANIMATED_BG_TYPES.has(entry.decoration.type);
      const alwaysDepth = ALWAYS_DEPTH_SORTED_TYPES.has(entry.decoration.type);
      if (
        volume.heightTag === "landmark" ||
        alwaysDepth ||
        (isNearRoad &&
          (isDepthAnimated ||
            (volume.heightTag !== "ground" && volume.heightTag !== "short")))
      ) {
        depthSensitiveDecorations.push(resolvedEntry);
      } else if (renderLayer === "background" || isBgAnimated) {
        backgroundDecorations.push(resolvedEntry);
      } else {
        staticDecorations.push(resolvedEntry);
      }
    }

    const liveAnimatedDecorations: CachedVisibleDecoration[] = [];

    staticDecorations.sort((a, b) => a.isoY - b.isoY);

    // Animated depth-sensitive decorations render per-frame (live decorTime);
    // static ones get sprite-cached for fast drawImage blitting.
    const spriteCachedDepthDecorations: CachedVisibleDecoration[] = [];
    for (const entry of depthSensitiveDecorations) {
      if (ANIMATED_DEPTH_TYPES.has(entry.decoration.type)) {
        liveAnimatedDecorations.push(entry);
      } else {
        const dec = entry.decoration;
        const vol = getDecorationVolumeSpec(dec.type, dec.heightTag);
        entry.sprite = prerenderDecorationSprite(
          dec.type,
          cacheZoomForKey * dec.scale,
          dec.rotation,
          dec.variant,
          dec.x,
          dec.y,
          selectedMap,
          mapTheme,
          dpr,
          dec.heightTag,
          false,
          vol.backgroundShadowOnly,
          cacheZoomForKey,
        ) ?? undefined;
        spriteCachedDepthDecorations.push(entry);
      }
    }
    for (const entry of backgroundDecorations) {
      if (ANIMATED_BG_TYPES.has(entry.decoration.type)) continue;
      const dec = entry.decoration;
      entry.sprite = prerenderDecorationSprite(
        dec.type,
        cacheZoomForKey * dec.scale,
        dec.rotation,
        dec.variant,
        dec.x,
        dec.y,
        selectedMap,
        mapTheme,
        dpr,
        dec.heightTag,
        !!entry.shadowOnly,
        false,
        cacheZoomForKey,
      ) ?? undefined;
    }

    let staticDecorationCanvas: HTMLCanvasElement | null = null;
    if (typeof document !== "undefined") {
      const layerCanvas = document.createElement("canvas");
      layerCanvas.width = (width + DECOR_OVERSCAN) * dpr;
      layerCanvas.height = (height + DECOR_OVERSCAN) * dpr;
      const layerCtx = layerCanvas.getContext("2d");
      if (layerCtx) {
        layerCtx.setTransform(1, 0, 0, 1, 0, 0);
        layerCtx.scale(dpr, dpr);
        layerCtx.translate(DECOR_OVERSCAN / 2, DECOR_OVERSCAN / 2);
        for (const entry of staticDecorations) {
          const dec = entry.decoration;
          layerCtx.save();
          renderDecorationItem({
            ctx: layerCtx,
            screenPos: entry.screenPos,
            scale: cacheZoomForKey * dec.scale,
            type: dec.type,
            rotation: dec.rotation,
            variant: dec.variant,
            decorTime: 0,
            decorX: dec.x,
            decorY: dec.y,
            selectedMap,
            mapTheme,
            skipShadow: getDecorationVolumeSpec(dec.type, dec.heightTag)
              .backgroundShadowOnly,
            zoom: cacheZoomForKey,
          });
          layerCtx.restore();
        }
        staticDecorationCanvas = layerCanvas;
      }
    }

    drawBackgroundDecorations(backgroundDecorations, 0, 0, cacheZoomForKey);
    if (staticDecorationCanvas) {
      const dSrcX = (DECOR_OVERSCAN / 2) * dpr;
      const dSrcY = (DECOR_OVERSCAN / 2) * dpr;
      ctx.drawImage(
        staticDecorationCanvas,
        dSrcX, dSrcY, canvas.width, canvas.height,
        0, 0, width, height,
      );
    } else {
      liveAnimatedDecorations.push(...staticDecorations);
    }

    cachedStaticDecorationLayerRef.current = {
      key: decorBaseKey,
      canvas: staticDecorationCanvas,
      backgroundDecorations,
      animatedDecorations: liveAnimatedDecorations,
      depthSensitiveDecorations: spriteCachedDepthDecorations,
      anchorOffset: { ...cameraOffset },
      cacheZoom: cacheZoomForKey,
    };
    animatedVisibleDecorations = liveAnimatedDecorations;
    depthSensitiveVisibleDecorations = spriteCachedDepthDecorations;
  }

  const decorOffsetDx = decorHasZoomMismatch && decorAnchor
    ? (cameraOffset.x - decorAnchor.x) * cameraZoom
    : 0;
  const decorOffsetDy = decorHasZoomMismatch && decorAnchor
    ? (cameraOffset.y - decorAnchor.y) * cameraZoom
    : 0;
  const zoomCorrCenterX = width / 2 * (1 - decorZoomRatio);
  const zoomCorrCenterY = height / 3 * (1 - decorZoomRatio);
  for (const entry of animatedVisibleDecorations) {
    let screenPos: Position;
    if (decorHasZoomMismatch) {
      screenPos = {
        x: entry.screenPos.x * decorZoomRatio + zoomCorrCenterX + decorOffsetDx,
        y: entry.screenPos.y * decorZoomRatio + zoomCorrCenterY + decorOffsetDy,
      };
    } else if (decorPosCorrectX !== 0 || decorPosCorrectY !== 0) {
      screenPos = { x: entry.screenPos.x + decorPosCorrectX, y: entry.screenPos.y + decorPosCorrectY };
    } else {
      screenPos = entry.screenPos;
    }
    renderables.push({
      type: "decoration",
      data: {
        ...entry.decoration,
        decorTime,
        selectedMap,
        screenPos,
      },
      isoY: entry.isoY,
    });
  }
  for (const entry of depthSensitiveVisibleDecorations) {
    let correctedPos: Position;
    if (decorHasZoomMismatch) {
      correctedPos = {
        x: entry.screenPos.x * decorZoomRatio + zoomCorrCenterX + decorOffsetDx,
        y: entry.screenPos.y * decorZoomRatio + zoomCorrCenterY + decorOffsetDy,
      };
    } else if (decorPosCorrectX !== 0 || decorPosCorrectY !== 0) {
      correctedPos = { x: entry.screenPos.x + decorPosCorrectX, y: entry.screenPos.y + decorPosCorrectY };
    } else {
      correctedPos = entry.screenPos;
    }
    renderables.push({
      type: "decoration",
      data: {
        ...entry.decoration,
        decorTime,
        selectedMap,
        screenPos: correctedPos,
        _sprite: entry.sprite,
      },
      isoY: entry.isoY,
    });
  }
  towers.forEach((tower) => {
    const worldPos = gridToWorld(tower.pos);
    renderables.push({
      type: "tower",
      data: tower,
      isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
    });
  });
  // Collect range reticle data (rendered in consolidated reticle pass, not depth-sorted with entities)
  const pendingRangeReticles: Array<{ kind: "station" | "tower"; tower: Tower & { isHovered?: boolean } }> = [];
  const uiSettings = getGameSettings().ui;
  if (uiSettings.showTowerRadii) {
    towers.forEach((tower) => {
      if (tower.type === "station" && tower.spawnRange) {
        const isHovered = hoveredTower === tower.id;
        pendingRangeReticles.push({ kind: "station", tower: { ...tower, isHovered } });
      }
    });
  }
  if (uiSettings.showRangeIndicators) {
    if (selectedTower) {
      const tower = towers.find((t) => t.id === selectedTower);
      if (tower && TOWER_DATA[tower.type].range > 0) {
        pendingRangeReticles.push({ kind: "tower", tower });
      }
    }
    if (hoveredTower && hoveredTower !== selectedTower) {
      const tower = towers.find((t) => t.id === hoveredTower);
      if (tower && TOWER_DATA[tower.type].range > 0) {
        pendingRangeReticles.push({ kind: "tower", tower: { ...tower, isHovered: true } });
      }
    }
  }
  enemies.forEach((enemy) => {
    const worldPos = getEnemyWorldPos(enemy);
    if (
      worldPos.x < minVisibleWorldX - enemyCullMargin ||
      worldPos.x > maxVisibleWorldX + enemyCullMargin ||
      worldPos.y < minVisibleWorldY - enemyCullMargin ||
      worldPos.y > maxVisibleWorldY + enemyCullMargin
    ) {
      return;
    }
    let stableOffset = enemySortOffsetCacheRef.current.get(enemy.id);
    if (stableOffset === undefined) {
      let idHash = 0;
      for (let i = 0; i < enemy.id.length; i++) {
        idHash += enemy.id.charCodeAt(i);
      }
      stableOffset = (idHash % 1000) * 0.0001;
      if (enemySortOffsetCacheRef.current.size > 4000) {
        enemySortOffsetCacheRef.current.clear();
      }
      enemySortOffsetCacheRef.current.set(enemy.id, stableOffset);
    }
    renderables.push({
      type: "enemy",
      data: enemy,
      isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR + stableOffset,
    });
  });
  if (hero && !hero.dead) {
    renderables.push({
      type: "hero",
      data: hero,
      isoY: (hero.pos.x + hero.pos.y) * ISO_Y_FACTOR,
    });
  }
  troops.forEach((troop) => {
    renderables.push({
      type: "troop",
      data: troop,
      isoY: (troop.pos.x + troop.pos.y) * ISO_Y_FACTOR,
    });
  });
  projectiles.forEach((proj) => {
    if (proj.spawnDelay && proj.spawnDelay > 0) return;
    const x = proj.from.x + (proj.to.x - proj.from.x) * proj.progress;
    const y = proj.from.y + (proj.to.y - proj.from.y) * proj.progress;
    if (
      x < minVisibleWorldX - projectileCullMargin ||
      x > maxVisibleWorldX + projectileCullMargin ||
      y < minVisibleWorldY - projectileCullMargin ||
      y > maxVisibleWorldY + projectileCullMargin
    ) {
      return;
    }
    renderables.push({
      type: "projectile",
      data: proj,
      isoY: (x + y) * ISO_Y_FACTOR + 0.005,
    });
  });
  const overlayEffectTypes = new Set(["lightning", "beam", "chain", "zap"]);
  const directionalTowerEffects = new Set(["flame_burst", "cannon_shot", "bullet_stream", "music_notes"]);
  mergedEffects.forEach((eff) => {
    if (groundEffectTypes.has(eff.type) || skyEffectTypes.has(eff.type) || eff.type === deathEffectType) return;
    const fromX = eff.pos.x;
    const fromY = eff.pos.y;
    const toX = eff.targetPos?.x ?? fromX;
    const toY = eff.targetPos?.y ?? fromY;
    const segMinX = Math.min(fromX, toX);
    const segMaxX = Math.max(fromX, toX);
    const segMinY = Math.min(fromY, toY);
    const segMaxY = Math.max(fromY, toY);
    if (
      segMaxX < minVisibleWorldX - effectCullMargin ||
      segMinX > maxVisibleWorldX + effectCullMargin ||
      segMaxY < minVisibleWorldY - effectCullMargin ||
      segMinY > maxVisibleWorldY + effectCullMargin
    ) {
      return;
    }
    let depthX = fromX;
    let depthY = fromY;
    let depthBias: number;
    if (overlayEffectTypes.has(eff.type)) {
      depthBias = 0.01;
    } else if (directionalTowerEffects.has(eff.type) && eff.targetPos) {
      // Midpoint between source and target so the effect renders in front of
      // the tower when aimed toward the viewer and behind when aimed away
      depthX = (fromX + toX) * 0.5;
      depthY = (fromY + toY) * 0.5;
      depthBias = 0.01;
    } else {
      depthBias = -0.01;
    }
    renderables.push({
      type: "effect",
      data: eff,
      isoY: (depthX + depthY) * ISO_Y_FACTOR + depthBias,
    });
  });
  // Read active particles from pool (ref-based, no React state)
  const activeParticles = getActiveParticles();
  particlesRef.current = activeParticles;
  for (let i = 0; i < activeParticles.length; i++) {
    const p = activeParticles[i];
    renderables.push({
      type: "particle",
      data: p,
      isoY: (p.pos.x + p.pos.y) * ISO_Y_FACTOR,
    });
  }
  // Add special building to renderables for proper depth sorting
  const levelSpecialTowersForRenderable = getLevelSpecialTowers(selectedMap);
  levelSpecialTowersForRenderable.forEach((spec, index) => {
    const worldPos = gridToWorld(spec.pos);
    let boostedTowerCount = 0;
    if (spec.type === "beacon" || spec.type === "chrono_relay") {
      const boostRange = spec.type === "beacon" ? 250 : 220;
      boostedTowerCount = towers.filter((tower) => {
        if (tower.type === "club") return false;
        const towerWorldPos = gridToWorld(tower.pos);
        return distance(towerWorldPos, worldPos) < boostRange;
      }).length;
    } else if (spec.type === "sunforge_orrery") {
      const heatRange = 260;
      boostedTowerCount = enemies.filter((enemy) => {
        if (enemy.dead || enemy.hp <= 0) return false;
        return distance(getEnemyWorldPos(enemy), worldPos) < heatRange;
      }).length;
    }

    let chargeProgress = 0;
    const warmupElapsed = enemiesFirstAppearedRef.current > 0
      ? Date.now() - enemiesFirstAppearedRef.current
      : 0;
    const inWarmup = enemiesFirstAppearedRef.current > 0 && warmupElapsed < SPECIAL_TOWER_WARMUP_MS;
    const warmupProgress = enemiesFirstAppearedRef.current === 0
      ? 0
      : Math.min(1, warmupElapsed / SPECIAL_TOWER_WARMUP_MS);
    if (inWarmup) {
      chargeProgress = warmupProgress;
    } else if (spec.type === "sentinel_nexus") {
      const key = getSpecialTowerKey(spec);
      const lastStrike = lastSentinelStrikeRef.current.get(key) ?? 0;
      chargeProgress = lastStrike === 0 ? 1 : Math.min(1, (Date.now() - lastStrike) / SENTINEL_NEXUS_STATS.strikeIntervalMs);
    } else if (spec.type === "sunforge_orrery") {
      const key = getSpecialTowerKey(spec);
      const lastBarrage = lastSunforgeBarrageRef.current.get(key) ?? 0;
      chargeProgress = lastBarrage === 0 ? 1 : Math.min(1, (Date.now() - lastBarrage) / SUNFORGE_ORRERY_STATS.barrageIntervalMs);
    }

    renderables.push({
      type: "special-building",
      data: { ...spec, boostedTowerCount, chargeProgress, warmupProgress, __towerIndex: index },
      isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
    });
  });
  if (draggingTower) {
    const gridPos = screenToGrid(
      draggingTower.pos,
      canvas.width,
      canvas.height,
      dpr,
      cameraOffset,
      cameraZoom
    );
    const worldPos = gridToWorld(gridPos);
    renderables.push({
      type: "tower-preview",
      data: draggingTower,
      isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
    });
  }
  // Tower repositioning preview
  if (repositioningTower && repositionPreviewPos) {
    const tower = towers.find((t) => t.id === repositioningTower);
    if (tower) {
      const gridPos = screenToGrid(
        repositionPreviewPos,
        canvas.width,
        canvas.height,
        dpr,
        cameraOffset,
        cameraZoom
      );
      const worldPos = gridToWorld(gridPos);
      const otherTowers = towers.filter((t) => t.id !== repositioningTower);
      const isValid = isValidBuildPosition(
        gridPos,
        selectedMap,
        otherTowers,
        GRID_WIDTH,
        GRID_HEIGHT,
        TOWER_PLACEMENT_BUFFER,
        blockedPositions,
        tower.type
      );
      renderables.push({
        type: "tower-preview",
        data: {
          type: tower.type,
          pos: repositionPreviewPos,
          isRepositioning: true,
          isValid,
          level: tower.level,
          upgrade: tower.upgrade,
        },
        isoY: (worldPos.x + worldPos.y) * ISO_Y_FACTOR,
      });
    }
  }
  insertionSortBy(renderables, (r) => r.isoY);
  updateScenePressure(renderables.length);

  // =========================================================================
  // SPECIAL BUILDING RANGE RINGS (On Hover)
  // =========================================================================
  if (hoveredSpecialTower) {
    const time = nowSeconds;
    const spec = hoveredSpecialTower;
    const sPos = toScreen(gridToWorld(spec.pos));
    const range =
      spec.type === "beacon"
        ? 150
        : spec.type === "shrine"
          ? 200
          : spec.type === "chrono_relay"
            ? 220
            : spec.type === "sentinel_nexus"
              ? 140
              : spec.type === "sunforge_orrery"
                ? 260
                : 0;
    const ringStroke =
      spec.type === "beacon"
        ? "rgba(0, 229, 255, 0.5)"
        : spec.type === "shrine"
          ? "rgba(118, 255, 3, 0.5)"
          : spec.type === "chrono_relay"
            ? "rgba(129, 140, 248, 0.55)"
            : spec.type === "sentinel_nexus"
              ? "rgba(251, 113, 133, 0.62)"
              : "rgba(251, 146, 60, 0.65)";
    const ringFill =
      spec.type === "beacon"
        ? "rgba(0, 229, 255, 0.05)"
        : spec.type === "shrine"
          ? "rgba(118, 255, 3, 0.05)"
          : spec.type === "chrono_relay"
            ? "rgba(129, 140, 248, 0.06)"
            : spec.type === "sentinel_nexus"
              ? "rgba(251, 113, 133, 0.09)"
              : "rgba(251, 146, 60, 0.1)";

    if (range > 0) {
      ctx.save();
      ctx.translate(sPos.x, sPos.y);
      ctx.scale(1, ISO_Y_RATIO);

      if (spec.type === "sunforge_orrery") {
        const outerR = range * cameraZoom;
        const midR = outerR * 0.84;
        const innerR = outerR * 0.64;

        ctx.rotate(time * 0.36);
        ctx.strokeStyle = "rgba(251, 146, 60, 0.72)";
        ctx.lineWidth = 3.2;
        ctx.setLineDash([12 * cameraZoom, 9 * cameraZoom]);
        ctx.beginPath();
        ctx.arc(0, 0, outerR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(-time * 0.58);
        ctx.strokeStyle = "rgba(255, 216, 170, 0.56)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8 * cameraZoom, 6 * cameraZoom]);
        ctx.beginPath();
        ctx.arc(0, 0, midR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(255, 237, 213, 0.42)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, innerR, 0, Math.PI * 2);
        ctx.stroke();

        const markerCount = 12;
        for (let i = 0; i < markerCount; i++) {
          const a = (i / markerCount) * Math.PI * 2 + time * 0.35;
          const iX = Math.cos(a) * (midR + outerR) * 0.5;
          const iY = Math.sin(a) * (midR + outerR) * 0.5;
          const oX = Math.cos(a) * (outerR - 4 * cameraZoom);
          const oY = Math.sin(a) * (outerR - 4 * cameraZoom);
          ctx.strokeStyle = `rgba(255, 228, 188, ${0.38 + Math.sin(time * 2 + i) * 0.12})`;
          ctx.lineWidth = (i % 3 === 0 ? 2.1 : 1.2) * cameraZoom;
          ctx.beginPath();
          ctx.moveTo(iX, iY);
          ctx.lineTo(oX, oY);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(251, 146, 60, 0.08)";
        ctx.beginPath();
        ctx.arc(0, 0, outerR, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.rotate(time * 0.5);
        ctx.strokeStyle = ringStroke;
        ctx.lineWidth = 3;
        ctx.setLineDash([10 * cameraZoom, 10 * cameraZoom]);
        ctx.beginPath();
        ctx.arc(0, 0, range * cameraZoom, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = ringFill;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Sentinel nexus targeting overlays
  const sentinelStrikeRadiusWorld = 140;
  const sentinelSpeed = gameSpeedRef.current;
  const sentinelVisualInterval = sentinelSpeed > 0 ? SENTINEL_NEXUS_STATS.strikeIntervalMs / sentinelSpeed : SENTINEL_NEXUS_STATS.strikeIntervalMs;
  const sentinelReticleNow = Date.now();
  const sentinelCursorPos = mousePosRef.current;
  const sentinelPal = getSentinelPalette(mapTheme);
  levelSpecialTowersForRenderable.forEach((spec) => {
    if (spec.type !== "sentinel_nexus") return;
    const key = getSpecialTowerKey(spec);
    const targetPos = sentinelTargets[key];
    if (!targetPos) return;
    const sourceScreenPos = toScreen(gridToWorld(spec.pos));
    const isActiveTargeting = activeSentinelTargetKey === key;
    const hasCursor = sentinelCursorPos.x > 0 && sentinelCursorPos.y > 0;
    const targetScreenPos = isActiveTargeting && hasCursor
      ? { x: sentinelCursorPos.x, y: sentinelCursorPos.y }
      : toScreen(targetPos);

    const lastStrike = lastSentinelStrikeRef.current.get(key) ?? 0;
    const sentinelCooldown = lastStrike === 0
      ? 1
      : Math.min(1, (sentinelReticleNow - lastStrike) / sentinelVisualInterval);

    renderTargetingReticle(ctx, {
      x: targetScreenPos.x,
      y: targetScreenPos.y,
      zoom: cameraZoom,
      time: nowSeconds,
      color: sentinelPal.reticleColor,
      glowColor: sentinelPal.reticleGlow,
      radius: 58,
      aoeRadius: sentinelStrikeRadiusWorld,
      laserLine: {
        fromX: sourceScreenPos.x,
        fromY: sourceScreenPos.y - 30 * cameraZoom,
      },
      active: isActiveTargeting,
      cooldownProgress: sentinelCooldown,
      cooldownColor: sentinelPal.reticleColor,
    });
  });

  // Sunforge orrery aim reticle
  const sunforgeStrikeRadiusWorld = SUNFORGE_ORRERY_STATS.strikeRadius;
  const sunforgeReticleNow = Date.now();
  levelSpecialTowersForRenderable.forEach((spec) => {
    if (spec.type !== "sunforge_orrery") return;
    const key = getSpecialTowerKey(spec);
    const aimPos = sunforgeAimRef.current.get(key);
    if (!aimPos) return;
    const sourceScreenPos = toScreen(gridToWorld(spec.pos));
    const targetScreenPos = toScreen(aimPos);

    const lastBarrage = lastSunforgeBarrageRef.current.get(key) ?? 0;
    const sunforgeCooldown = lastBarrage === 0
      ? 1
      : Math.min(1, (sunforgeReticleNow - lastBarrage) / SUNFORGE_ORRERY_STATS.barrageIntervalMs);

    renderTargetingReticle(ctx, {
      x: targetScreenPos.x,
      y: targetScreenPos.y,
      zoom: cameraZoom,
      time: nowSeconds,
      color: RETICLE_COLORS.orange,
      glowColor: { r: 255, g: 120, b: 30 },
      radius: 50,
      aoeRadius: sunforgeStrikeRadiusWorld,
      laserLine: {
        fromX: sourceScreenPos.x,
        fromY: sourceScreenPos.y - 40 * cameraZoom,
      },
      active: false,
      cooldownProgress: sunforgeCooldown,
    });
  });

  // =========================================================================
  // CONSOLIDATED RETICLE LAYER
  // =========================================================================

  // 1. Tower / station range indicators
  for (const rr of pendingRangeReticles) {
    if (rr.kind === "station") {
      renderStationRange(ctx, rr.tower, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
    } else {
      renderTowerRange(ctx, rr.tower, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
    }
  }

  // 2. Troop movement range circle
  if (selectedUnitMoveInfo && !selectedUnitMoveInfo.canMoveAnywhere) {
    renderTroopMoveRange(
      ctx,
      {
        anchorPos: selectedUnitMoveInfo.anchorPos,
        moveRadius: selectedUnitMoveInfo.moveRadius,
        ownerType: selectedUnitMoveInfo.ownerType,
        isSelected: true,
      },
      canvas.width, canvas.height, dpr, cameraOffset, cameraZoom,
    );
  }

  // 3. Path target indicator (troop/hero move destination)
  const selectedTroopForIndicator = troops.find((t) => t.selected);
  const heroIsSelectedForIndicator = hero && !hero.dead && hero.selected;
  const isUnitDraggingForIndicator = !!draggingUnit;

  if (
    moveTargetPos &&
    (selectedTroopForIndicator || heroIsSelectedForIndicator || isUnitDraggingForIndicator)
  ) {
    const draggedTroopForIndicator =
      draggingUnit?.kind === "troop"
        ? troops.find((t) => t.id === draggingUnit.troopId)
        : null;
    const unitPos = selectedTroopForIndicator
      ? selectedTroopForIndicator.pos
      : heroIsSelectedForIndicator && hero
        ? hero.pos
        : draggingUnit?.kind === "hero" && hero
          ? hero.pos
          : draggedTroopForIndicator
            ? draggedTroopForIndicator.pos
            : moveTargetPos;
    const themeColor =
      (heroIsSelectedForIndicator || draggingUnit?.kind === "hero") && hero
        ? HERO_DATA[hero.type].color
        : undefined;
    renderPathTargetIndicator(
      ctx,
      {
        targetPos: moveTargetPos,
        isValid: moveTargetValid,
        isHero: !!heroIsSelectedForIndicator || draggingUnit?.kind === "hero",
        unitPos: unitPos,
        themeColor: themeColor,
      },
      canvas.width, canvas.height, dpr, cameraOffset, cameraZoom,
    );
  }

  // 4. Missile battery target reticle
  const rMouse = mousePosRef.current;
  const activeRetargetMortarId = missileMortarTargetingIdRef.current;
  const missileReticleNow = Date.now();
  for (const tower of towers) {
    if (tower.type === "mortar" && tower.level === 4 && tower.upgrade === "A" && tower.mortarAutoAim === false && tower.mortarTarget) {
      const isBeingRetargeted = activeRetargetMortarId === tower.id;
      const targetScreenPos = isBeingRetargeted && rMouse.x > 0 && rMouse.y > 0
        ? { x: rMouse.x, y: rMouse.y }
        : worldToScreen(tower.mortarTarget, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
      const tStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
      const missileSpeed = gameSpeedRef.current;
      const cd = missileSpeed > 0
        ? tStats.attackSpeed / (tower.attackSpeedBoost || 1) / missileSpeed
        : tStats.attackSpeed / (tower.attackSpeedBoost || 1);
      const elapsed = missileReticleNow - tower.lastAttack;
      const cooldownProgress = Math.min(1, elapsed / cd);
      renderMissileTargetReticle(ctx, targetScreenPos, cameraZoom, nowSeconds, cooldownProgress);
    }
  }

  // 4b. Missile battery auto-aim reticle
  for (const tower of towers) {
    if (tower.type !== "mortar" || tower.level !== 4 || tower.upgrade !== "A") continue;
    if (tower.mortarAutoAim === false) continue;
    const aimPos = missileAutoAimRef.current.get(tower.id);
    if (!aimPos) continue;
    const towerWorldPos = gridToWorld(tower.pos);
    const sourceScreenPos = worldToScreen(towerWorldPos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
    const targetScreenPos = worldToScreen(aimPos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
    const tStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
    const missileSpeed = gameSpeedRef.current;
    const cd = missileSpeed > 0
      ? tStats.attackSpeed / (tower.attackSpeedBoost || 1) / missileSpeed
      : tStats.attackSpeed / (tower.attackSpeedBoost || 1);
    const elapsed = missileReticleNow - tower.lastAttack;
    const cooldownProgress = Math.min(1, elapsed / cd);
    renderTargetingReticle(ctx, {
      x: targetScreenPos.x,
      y: targetScreenPos.y,
      zoom: cameraZoom,
      time: nowSeconds,
      color: RETICLE_COLORS.gold,
      glowColor: { r: 255, g: 180, b: 40 },
      radius: 50,
      laserLine: {
        fromX: sourceScreenPos.x,
        fromY: sourceScreenPos.y - 20 * cameraZoom,
      },
      active: false,
      cooldownProgress,
      cooldownColor: RETICLE_COLORS.gold,
    });
  }

  // 5. Cursor-following reticles (spell, troop placement, sentinel retarget)
  const rTargeting = targetingSpellRef.current;
  const rPlacing = placingTroopRef.current;

  if ((rTargeting || rPlacing) && rMouse.x > 0 && rMouse.y > 0) {
    const variant: SpellReticleVariant = rTargeting === "fireball"
      ? "fireball"
      : rTargeting === "lightning"
        ? "lightning"
        : "placement";
    renderSpellReticle(ctx, {
      x: rMouse.x, y: rMouse.y,
      zoom: cameraZoom ?? 1,
      time: Date.now() * 0.003,
      variant,
    });
  }

  // Pre-pass: draw ALL tower ground transitions before any tower bodies
  for (const r of renderables) {
    if (r.type === "tower") {
      renderTowerGroundTransition(
        ctx,
        r.data as Tower,
        canvas.width,
        canvas.height,
        dpr,
        selectedMap,
        cameraOffset,
        cameraZoom,
      );
    }
  }

  // =========================================================================
  // EPIC ISOMETRIC BUFF AURA (rendered above ground transitions, below towers)
  // =========================================================================
  towers.forEach((t) => {
    const hasDamageBuff = t.damageBoost && t.damageBoost > 1;
    const hasRangeBuff = t.rangeBoost && t.rangeBoost > 1;
    const hasAttackSpeedBuff =
      t.attackSpeedBoost && t.attackSpeedBoost > 1;

    if (!hasDamageBuff && !hasRangeBuff && !hasAttackSpeedBuff && !t.isBuffed)
      return;

    const activeBuffCount =
      Number(hasDamageBuff) + Number(hasRangeBuff) + Number(hasAttackSpeedBuff);
    const buffTheme =
      activeBuffCount >= 2
        ? { base: "255, 220, 140", accent: "255, 200, 90", glow: "#ffe08c", fill: "rgba(255, 220, 140, 0.08)", icon: "✦" }
        : hasAttackSpeedBuff
          ? { base: "165, 180, 255", accent: "129, 140, 248", glow: "#a5b4fc", fill: "rgba(165, 180, 255, 0.08)", icon: "⌁" }
          : hasDamageBuff
            ? { base: "255, 100, 100", accent: "255, 150, 50", glow: "#ff6464", fill: "rgba(255, 100, 100, 0.06)", icon: "◆" }
            : { base: "100, 200, 255", accent: "50, 150, 255", glow: "#64c8ff", fill: "rgba(100, 200, 255, 0.06)", icon: "◎" };

    const time = nowSeconds;
    const sPos = toScreen(gridToWorld(t.pos));
    const s = cameraZoom;

    const fnd = getTowerFoundationSize(t);
    const auraR = Math.max(fnd.w, fnd.d) * 0.5 * s;
    const outerR = auraR * 1.15;
    const sealR = auraR * 0.7;
    const orbitR = auraR * 0.45;

    const pulse = Math.sin(time * 4) * 0.08;
    const opacity = 0.6 + Math.sin(time * 2) * 0.25;
    const buffPulse = 0.5 + Math.sin(time * 4) * 0.5;

    ctx.save();
    ctx.translate(sPos.x, sPos.y + 10 * s);

    ctx.shadowColor = buffTheme.glow;
    ctx.shadowBlur = 25 * s * buffPulse;

    ctx.scale(1, ISO_Y_RATIO);

    // 1. Soft Core Glow
    const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR * 1.1);
    innerGlow.addColorStop(0, `rgba(${buffTheme.base}, ${0.5 * opacity})`);
    innerGlow.addColorStop(0.5, `rgba(${buffTheme.base}, ${0.25 * opacity})`);
    innerGlow.addColorStop(1, `rgba(${buffTheme.base}, 0)`);
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, outerR * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Outer Orbiting Ring
    ctx.save();
    ctx.rotate(-time * 0.6);
    ctx.strokeStyle = `rgba(${buffTheme.base}, ${0.7 * opacity})`;
    ctx.lineWidth = 3 * s;
    ctx.setLineDash([12 * s, 6 * s]);
    ctx.beginPath();
    ctx.arc(0, 0, outerR * (1 + pulse), 0, Math.PI * 2);
    ctx.stroke();

    const dotCount = activeBuffCount >= 2 ? 6 : 4;
    for (let i = 0; i < dotCount; i++) {
      ctx.rotate((Math.PI * 2) / dotCount);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 5 + i) * 0.2})`;
      ctx.shadowColor = buffTheme.glow;
      ctx.shadowBlur = 8 * s;
      ctx.beginPath();
      ctx.arc(outerR * (1 + pulse), 0, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Runic Seal (Overlapping Triangles)
    ctx.save();
    ctx.rotate(time * 0.8);

    ctx.lineWidth = 2 * s;
    drawTriangle(ctx, sealR, `rgba(${buffTheme.accent}, ${0.85 * opacity})`);
    ctx.rotate(Math.PI);
    drawTriangle(ctx, sealR, `rgba(${buffTheme.accent}, ${0.85 * opacity})`);

    ctx.fillStyle = buffTheme.fill;
    ctx.fill();
    ctx.restore();

    // 4. Inner Orbitals
    ctx.save();
    ctx.rotate(time * 1.5);
    const orbitalCount = activeBuffCount >= 2 ? 5 : 3;
    for (let i = 0; i < orbitalCount; i++) {
      ctx.rotate((Math.PI * 2) / orbitalCount);
      const orbitDist = orbitR + Math.sin(time * 3 + i) * 6 * s;
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowBlur = 12 * s;
      ctx.shadowColor = buffTheme.glow;
      ctx.beginPath();
      ctx.arc(orbitDist, 0, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Rising particles
    ctx.shadowBlur = 0;
    for (let i = 0; i < 4; i++) {
      const riseProgress = ((time * 0.8 + i * 0.25) % 1);
      const riseY = -riseProgress * outerR * 1.3;
      const riseAlpha = (1 - riseProgress) * 0.6 * buffPulse;
      const riseX = Math.sin(time * 3 + i * 2) * orbitR;

      ctx.fillStyle = `rgba(${buffTheme.base}, ${riseAlpha})`;
      ctx.shadowColor = buffTheme.glow;
      ctx.shadowBlur = 6 * s;
      ctx.beginPath();
      ctx.arc(riseX, riseY, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Buff Icon
    ctx.shadowBlur = 0;
    const iconY = outerR * 1.1;

    ctx.fillStyle = `rgba(0, 0, 0, 0.6)`;
    ctx.shadowColor = buffTheme.glow;
    ctx.shadowBlur = 12 * s * buffPulse;
    ctx.beginPath();
    ctx.arc(0, iconY, 10 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(${buffTheme.base}, ${0.8 + buffPulse * 0.2})`;
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.shadowColor = buffTheme.glow;
    ctx.shadowBlur = 8 * s * buffPulse;
    ctx.fillStyle = `rgba(${buffTheme.base}, 1)`;
    ctx.font = `bold ${11 * s}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(buffTheme.icon, sPos.x, sPos.y + 10 * s + iconY * ISO_Y_RATIO);
    ctx.restore();
  });

  // ========== INSPECTOR GROUND CIRCLES — below entities ==========
  if (inspectorActive) {
    enemies.forEach((enemy) => {
      renderEnemyInspectIndicator(
        ctx, enemy, canvas.width, canvas.height, dpr, selectedMap,
        selectedInspectEnemy?.id === enemy.id,
        hoveredInspectEnemy === enemy.id,
        cameraOffset, cameraZoom, "ground",
      );
    });
    troops.forEach((troop) => {
      if (troop.dead) return;
      const troopScreen = worldToScreen(troop.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
      renderUnitInspectIndicator(
        ctx, troopScreen, cameraZoom ?? 1, 18,
        selectedInspectTroop?.id === troop.id,
        hoveredInspectTroop === troop.id,
        "troop", "ground",
      );
    });
    if (hero && !hero.dead) {
      const heroScreen = worldToScreen(hero.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
      renderUnitInspectIndicator(
        ctx, heroScreen, cameraZoom ?? 1, 22,
        selectedInspectHero, hoveredInspectHero,
        "hero", "ground",
      );
    }
  }

  // Render all entities with camera offset and zoom (including special buildings)
  renderables.forEach((r) => {
    switch (r.type) {
      case "special-building": {
        const spec = r.data as { type: string; pos: Position; hp?: number; boostedTowerCount?: number; chargeProgress?: number; warmupProgress?: number };
        const sPos = toScreen(gridToWorld(spec.pos));
        const vKey = vaultPosKey(spec.pos);
        const perVaultHp = spec.type === "vault"
          ? (specialTowerHp[vKey] ?? null)
          : null;
        const perVaultFlash = spec.type === "vault"
          ? (vaultFlash[vKey] ?? 0)
          : 0;
        renderSpecialBuilding(
          ctx,
          sPos.x,
          sPos.y,
          cameraZoom,
          spec.type,
          spec.hp,
          perVaultHp,
          perVaultFlash,
          spec.boostedTowerCount || 0,
          spec.chargeProgress ?? 0,
          spec.warmupProgress ?? 1,
          mapTheme
        );
        break;
      }


      case "station-range":
      case "tower-range":
        break;
      case "decoration": {
        const decData = r.data as {
          type: DecorationType;
          x: number;
          y: number;
          scale: number;
          rotation: number;
          variant: number;
          decorTime: number;
          selectedMap: string;
          screenPos?: Position;
          heightTag?: DecorationHeightTag;
          _sprite?: DecorationSprite;
        };
        const decScreenPos = decData.screenPos ?? toScreen({ x: decData.x, y: decData.y });
        if (decData._sprite) {
          if (hasZoomMismatch) {
            ctx.save();
            ctx.translate(decScreenPos.x, decScreenPos.y);
            ctx.scale(zoomCompensation, zoomCompensation);
            ctx.translate(-decScreenPos.x, -decScreenPos.y);
          }
          drawDecorationSprite(ctx, decData._sprite, decScreenPos);
          if (hasZoomMismatch) {
            ctx.restore();
          }
        } else {
          const decScale = cameraZoom * decData.scale;
          ctx.save();
          renderDecorationItem({
            ctx,
            screenPos: decScreenPos,
            scale: decScale,
            type: decData.type,
            rotation: decData.rotation,
            variant: decData.variant,
            decorTime: decData.decorTime,
            decorX: decData.x,
            decorY: decData.y,
            selectedMap: decData.selectedMap,
            mapTheme,
            skipShadow: getDecorationVolumeSpec(
              decData.type,
              decData.heightTag
            ).backgroundShadowOnly,
            zoom: cameraZoom,
          });
          ctx.restore();
        }
        break;
      }
      case "tower":
        renderTower(
          ctx,
          r.data as Tower,
          canvas.width,
          canvas.height,
          dpr,
          hoveredTower,
          selectedTower,
          enemies,
          selectedMap,
          cameraOffset,
          cameraZoom
        );
        {
          const tower = r.data as Tower;
          const activeDebuffs = tower.debuffs?.filter(d => d.until > frameNowMs);
          if (activeDebuffs && activeDebuffs.length > 0) {
            const towerPos = gridToWorld(tower.pos);
            const towerScreenPos = worldToScreen(
              towerPos,
              canvas.width,
              canvas.height,
              dpr,
              cameraOffset,
              cameraZoom
            );
            renderTowerDebuffEffects(ctx, { ...tower, debuffs: activeDebuffs }, towerScreenPos, cameraZoom, pausedAtRef.current ?? undefined);
          }
        }
        break;
      case "enemy":
        renderEnemy(
          ctx,
          r.data as Enemy,
          canvas.width,
          canvas.height,
          dpr,
          selectedMap,
          cameraOffset,
          cameraZoom,
          enemies.length
        );
        break;
      case "hero":
        {
          const heroRenderable = r.data as Hero;
          let heroTargetPos: Position | undefined = undefined;
          if (heroRenderable.aggroTarget) {
            const aggroEnemy = enemyById.get(heroRenderable.aggroTarget);
            if (aggroEnemy) {
              heroTargetPos = getEnemyWorldPos(aggroEnemy);
            }
          }
          if (!heroTargetPos && heroRenderable.targetPos) {
            heroTargetPos = heroRenderable.targetPos;
          }
          renderHero(
            ctx,
            heroRenderable,
            canvas.width,
            canvas.height,
            dpr,
            cameraOffset,
            cameraZoom,
            heroTargetPos
          );
          {
            const heroData = heroRenderable;
            if (heroData.burning || heroData.slowed || heroData.poisoned || heroData.stunned) {
              const heroScreenPos = worldToScreen(
                heroData.pos,
                canvas.width,
                canvas.height,
                dpr,
                cameraOffset,
                cameraZoom
              );
              renderUnitStatusEffects(ctx, heroData, heroScreenPos, cameraZoom, pausedAtRef.current ?? undefined);
            }
          }
          break;
        }
      case "troop": {
        const troopRenderable = r.data as Troop;
        let targetPos: Position | undefined = undefined;
        if (troopRenderable.targetEnemy) {
          const targetEnemy = enemyById.get(troopRenderable.targetEnemy);
          if (targetEnemy) {
            targetPos = getEnemyWorldPos(targetEnemy);
          }
        }
        const stationHighlighted =
          !troopRenderable.selected &&
          !!selectedTower &&
          troopRenderable.ownerId === selectedTower &&
          towers.some((t) => t.id === selectedTower && t.type === "station");
        renderTroop(
          ctx,
          stationHighlighted
            ? { ...troopRenderable, selected: true }
            : troopRenderable,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cameraZoom,
          targetPos,
          mapTheme
        );
        {
          const troopData = troopRenderable;
          if (troopData.burning || troopData.slowed || troopData.poisoned || troopData.stunned) {
            const troopScreenPos = worldToScreen(
              troopData.pos,
              canvas.width,
              canvas.height,
              dpr,
              cameraOffset,
              cameraZoom
            );
            renderUnitStatusEffects(ctx, troopData, troopScreenPos, cameraZoom, pausedAtRef.current ?? undefined);
          }
        }
        break;
      }
      case "projectile":
        renderProjectile(
          ctx,
          r.data as Projectile,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cameraZoom,
          projectiles.length
        );
        break;
      case "effect":
        renderEffect(
          ctx,
          r.data as Effect,
          canvas.width,
          canvas.height,
          dpr,
          enemies,
          towers,
          selectedMap,
          cameraOffset,
          cameraZoom,
          mergedEffects.length
        );
        break;
      case "particle":
        renderParticle(
          ctx,
          r.data as Particle,
          canvas.width,
          canvas.height,
          dpr,
          cameraOffset,
          cameraZoom,
          particlesRef.current.length
        );
        break;
      case "tower-preview": {
        const previewData = r.data as DraggingTower & {
          isRepositioning?: boolean;
        };
        const previewTowers = previewData.isRepositioning
          ? towers.filter((t) => t.id !== repositioningTower)
          : towers;
        renderTowerPreview(
          ctx,
          previewData,
          canvas.width,
          canvas.height,
          dpr,
          previewTowers,
          selectedMap,
          GRID_WIDTH,
          GRID_HEIGHT,
          cameraOffset,
          cameraZoom,
          blockedPositions
        );
        break;
      }
    }
  });

  // Sky-level spell effects (falling meteors, lightning bolts) render above all map objects.
  for (const eff of skyEffects) {
    renderEffect(
      ctx, eff, canvas.width, canvas.height, dpr,
      enemies, towers, selectedMap, cameraOffset, cameraZoom, mergedEffects.length
    );
  }

  // ========== INSPECTOR OVERLAY — markers & labels above entities ==========
  if (inspectorActive) {
    enemies.forEach((enemy) => {
      renderEnemyInspectIndicator(
        ctx, enemy, canvas.width, canvas.height, dpr, selectedMap,
        selectedInspectEnemy?.id === enemy.id,
        hoveredInspectEnemy === enemy.id,
        cameraOffset, cameraZoom, "overlay",
      );
    });
    troops.forEach((troop) => {
      if (troop.dead) return;
      const troopScreen = worldToScreen(troop.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
      renderUnitInspectIndicator(
        ctx, troopScreen, cameraZoom ?? 1, 18,
        selectedInspectTroop?.id === troop.id,
        hoveredInspectTroop === troop.id,
        "troop", "overlay",
      );
    });
    if (hero && !hero.dead) {
      const heroScreen = worldToScreen(hero.pos, canvas.width, canvas.height, dpr, cameraOffset, cameraZoom);
      renderUnitInspectIndicator(
        ctx, heroScreen, cameraZoom ?? 1, 22,
        selectedInspectHero, hoveredInspectHero,
        "hero", "overlay",
      );
    }
  }

  // Damage numbers (canvas overlay, gated by user settings)
  const dmgNumberStyle = getGameSettings().ui.damageNumbers;
  if (dmgNumberStyle !== "off") {
    renderDamageNumbers(
      ctx, canvas.width, canvas.height, dpr,
      dmgNumberStyle, cameraOffset, cameraZoom,
    );
  }

  // Restore state
  ctx.restore();

  const waveStartBubbles = getWaveStartBubblesScreenData(
    canvas.width,
    canvas.height,
    dpr
  );
  const primedWaveBubble = waveStartConfirm
    ? waveStartBubbles.find(
      (bubble) =>
        bubble.pathKey === waveStartConfirm.pathKey &&
        waveStartConfirm.mapId === selectedMap &&
        waveStartConfirm.waveIndex === currentWave
    )
    : null;

  const primedPathKey = primedWaveBubble?.pathKey ?? null;

  const ambientPressure =
    entityCountsRef.current.enemies +
    entityCountsRef.current.projectiles * 0.8 +
    entityCountsRef.current.effects * 0.6;
  const ambientIntervalMs =
    ambientPressure > 240
      ? renderQuality === "high"
        ? 64
        : 88
      : renderQuality === "low"
        ? 52
        : 40;
  const ambientLayerKey = [
    selectedMap,
    canvas.width,
    canvas.height,
    dpr,
    renderQuality,
  ].join("|");
  const cachedAmbientLayer = cachedAmbientLayerRef.current;
  const canReuseAmbientLayer =
    cachedAmbientLayer &&
    cachedAmbientLayer.key === ambientLayerKey &&
    cachedAmbientLayer.canvas &&
    frameNowMs - cachedAmbientLayer.renderedAtMs < ambientIntervalMs;
  const renderAmbientOverlay = (targetCtx: CanvasRenderingContext2D) => {
    renderEnvironment(targetCtx, mapTheme, width, height, nowSeconds);
    renderAmbientVisuals(targetCtx, mapTheme, width, height, nowSeconds);
  };

  if (canReuseAmbientLayer && cachedAmbientLayer?.canvas) {
    ctx.drawImage(cachedAmbientLayer.canvas, 0, 0, width, height);
  } else {
    let ambientCanvas: HTMLCanvasElement | null = null;
    if (typeof document !== "undefined") {
      let layerCanvas = cachedAmbientLayer?.canvas ?? null;
      if (
        !layerCanvas ||
        layerCanvas.width !== canvas.width ||
        layerCanvas.height !== canvas.height
      ) {
        layerCanvas = document.createElement("canvas");
        layerCanvas.width = canvas.width;
        layerCanvas.height = canvas.height;
      }
      const layerCtx = layerCanvas.getContext("2d");
      if (layerCtx) {
        layerCtx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
        layerCtx.setTransform(1, 0, 0, 1, 0, 0);
        layerCtx.scale(dpr, dpr);
        renderAmbientOverlay(layerCtx);
        ambientCanvas = layerCanvas;
      }
    }

    cachedAmbientLayerRef.current = {
      key: ambientLayerKey,
      canvas: ambientCanvas,
      renderedAtMs: frameNowMs,
    };

    if (ambientCanvas) {
      ctx.drawImage(ambientCanvas, 0, 0, width, height);
    } else {
      renderAmbientOverlay(ctx);
    }
  }

  // Draw wave start bubbles after ambient/vignette pass so they're readable over fog.
  for (const bubble of waveStartBubbles) {
    drawWaveStartBubble({
      ctx,
      bubble,
      primedPathKey,
      hoveredPathKey: hoveredWaveBubblePathKey,
      frameNowMs,
    });
  }

  if (primedWaveBubble && getGameSettings().ui.showWavePreview) {
    const { screenPos, radius, pathKey, pathLabel } = primedWaveBubble;
    const pathEntries = incomingWavePreviewByPath.get(pathKey) ?? [];
    const listRows = pathEntries.slice(0, 4);
    const hiddenRows = Math.max(0, pathEntries.length - listRows.length);
    const hasNoPathEnemies = pathEntries.length === 0;
    const panelWidth = 230;
    const panelHeight =
      68 +
      (hasNoPathEnemies ? 20 : listRows.length * 22) +
      (hiddenRows > 0 ? 16 : 0);
    const panelMargin = 12;
    const preferredX = screenPos.x + radius * 2.2;
    const fallbackX = screenPos.x - panelWidth - radius * 2.2;
    const maxX = width - panelWidth - panelMargin;
    const minXPanel = panelMargin;
    let panelX = preferredX > maxX ? fallbackX : preferredX;
    panelX = Math.max(minXPanel, Math.min(maxX, panelX));
    const maxY = height - panelHeight - panelMargin;
    const panelY = Math.max(
      panelMargin,
      Math.min(maxY, screenPos.y - radius * 2.25)
    );

    const panelPulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(frameNowMs * 0.008));
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 16;
    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 12);
    const panelGradient = ctx.createLinearGradient(
      panelX,
      panelY,
      panelX,
      panelY + panelHeight
    );
    panelGradient.addColorStop(0, "rgba(36, 18, 18, 0.95)");
    panelGradient.addColorStop(1, "rgba(14, 10, 12, 0.95)");
    ctx.fillStyle = panelGradient;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(255, 106, 84, ${(0.45 + panelPulse * 0.3).toFixed(3)})`;
    ctx.lineWidth = 1.6;
    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 12);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 224, 198, 0.96)";
    ctx.font = '700 12px "bc-novatica-cyr", "inter", sans-serif';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${pathLabel} - Wave ${currentWave + 1}`, panelX + 12, panelY + 16);

    ctx.fillStyle = "rgba(255, 170, 150, 0.92)";
    ctx.font = '600 10px "bc-novatica-cyr", "inter", sans-serif';
    ctx.fillText(
      "Click same bubble again to launch",
      panelX + 12,
      panelY + 34
    );

    let rowY = panelY + 54;
    if (hasNoPathEnemies) {
      ctx.fillStyle = "rgba(225, 175, 160, 0.85)";
      ctx.font = '600 11px "bc-novatica-cyr", "inter", sans-serif';
      ctx.fillText("No enemies this lane this wave", panelX + 12, rowY);
      rowY += 20;
    } else {
      for (const row of listRows) {
        ctx.fillStyle = row.color;
        ctx.beginPath();
        ctx.arc(panelX + 16, rowY, 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(248, 234, 220, 0.95)";
        ctx.font = '600 11px "bc-novatica-cyr", "inter", sans-serif';
        ctx.fillText(`${row.name} x${row.count}`, panelX + 27, rowY);
        rowY += 22;
      }
    }

    if (hiddenRows > 0) {
      ctx.fillStyle = "rgba(225, 175, 160, 0.82)";
      ctx.font = '500 10px "bc-novatica-cyr", "inter", sans-serif';
      ctx.fillText(`+${hiddenRows} more enemy types`, panelX + 12, rowY + 2);
    }
    ctx.restore();
  }
}
