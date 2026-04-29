import { LEVEL_DATA } from "../../../constants";
import { drawDecorationGroundLayer } from "./rendering/decorationGroundLayer";
import type { WorldMapDrawContext } from "./rendering/drawContext";
import { drawLevelBattlePreview } from "./rendering/levelBattlePreview";
import { drawLevelNodes } from "./rendering/levelNodes";
import { drawPathConnections } from "./rendering/pathConnections";
import { drawRoads } from "./rendering/roads";
import { drawStructureLandmarkLayer } from "./rendering/structureLandmarkLayer";
import { drawTerrainBackdrop } from "./rendering/terrainBackdrop";
import type { DrawWorldMapParams } from "./rendering/types";
import { drawWorldMapHero } from "./rendering/worldMapHero";
import { MAP_WIDTH, WORLD_LEVELS } from "./worldMapData";
import {
  getLevelNodeY,
  getWorldLevelById,
  getWorldMapY,
  isWorldLevelUnlocked,
  seededRandom,
} from "./worldMapUtils";

export const drawWorldMapCanvas = ({
  canvasRef,
  mapHeight,
  containerWidth,
  hoveredLevel,
  selectedLevel,
  levelStars,
  unlockedMaps,
  imageCache,
  lastCanvasSizeRef,
  animTimeRef,
  levels: levelsOverride,
  isMobile = false,
  staticBgCache,
  decorationCache,
  fogOverlayCache,
  pathCache,
  nodeCache,
  atmosphereCache,
  heroType,
  heroMapPos,
  heroMoving,
  heroFacingRight,
  paintKeyRef,
}: DrawWorldMapParams): void => {
  const allLevels = levelsOverride ?? WORLD_LEVELS;
  const getY = (pct: number) => getWorldMapY(pct, mapHeight);
  const getLevelY = (pct: number) => getLevelNodeY(pct, mapHeight);
  const isLevelUnlocked = (levelId: string) =>
    isWorldLevelUnlocked(levelId, unlockedMaps);
  const getLevelById = (id: string) => getWorldLevelById(id);
  const canvas = canvasRef.current;
  if (!canvas) {
    return;
  }
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) {
    return;
  }
  let ctx: CanvasRenderingContext2D = rawCtx;

  const rawDpr = window.devicePixelRatio || 1;
  const dpr = Math.min(rawDpr, 2);
  const width = MAP_WIDTH;
  const height = mapHeight;
  const mapScale = Math.max(1, Math.min(1.5, containerWidth / MAP_WIDTH));
  const displayW = Math.round(MAP_WIDTH * mapScale);
  const displayH = Math.round(mapHeight * mapScale);

  // Only resize canvas when dimensions actually change (expensive operation)
  const needsResize =
    lastCanvasSizeRef.current.w !== displayW ||
    lastCanvasSizeRef.current.h !== displayH;
  if (needsResize) {
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    lastCanvasSizeRef.current = { h: displayH, w: displayW };
  }

  // Use ref-based time to avoid React re-renders on every frame
  const time = animTimeRef.current;

  const DECOR_FPS = 50;
  const PATH_FPS = 50;
  const NODE_FPS = 15;
  const ATMOS_FPS = 50;
  const HERO_IDLE_FPS = 30;
  const BATTLE_PREVIEW_FPS = 30;

  const decorTimeBucket = Math.floor(time * DECOR_FPS);
  const pathTimeBucket = Math.floor(time * PATH_FPS);
  const nodeTimeBucket = Math.floor(time * NODE_FPS);
  const atmosTimeBucket = ATMOS_FPS > 0 ? Math.floor(time * ATMOS_FPS) : -1;

  // --- FRAME SKIP ------------------------------------------------------------
  // Most world-map animation is deliberately bucketed. If no bucket or state
  // input changed, the composed canvas would be identical, so skip the expensive
  // full-canvas blits.
  if (paintKeyRef) {
    const heroMovingNow = heroMoving?.current ?? false;
    const heroX = heroMapPos ? Math.round(heroMapPos.current.x) : 0;
    const heroY = heroMapPos ? Math.round(heroMapPos.current.y) : 0;
    const heroFacing = heroFacingRight?.current ? 1 : 0;
    // When the hero is moving, position updates naturally per-frame; when idle
    // we still want the sin-bob to animate, so include an idle time bucket.
    const heroIdleBucket =
      heroType && !heroMovingNow ? Math.floor(time * HERO_IDLE_FPS) : -1;
    const battlePreviewBucket =
      selectedLevel && !heroMovingNow
        ? Math.floor(time * BATTLE_PREVIEW_FPS)
        : -1;

    const composedPaintKey =
      `${displayW}x${displayH}|` +
      `d${decorTimeBucket}|p${pathTimeBucket}|n${nodeTimeBucket}|a${atmosTimeBucket}|` +
      `h:${hoveredLevel ?? ""}|s:${selectedLevel ?? ""}|` +
      `sk:${JSON.stringify(levelStars)}|uk:${unlockedMaps.join(",")}|` +
      `ht:${heroType ?? ""}|hm:${heroMovingNow ? 1 : 0}|` +
      `hp:${heroX},${heroY}|hf:${heroFacing}|hi:${heroIdleBucket}|` +
      `bp:${battlePreviewBucket}`;

    if (paintKeyRef.current === composedPaintKey) {
      return;
    }
    paintKeyRef.current = composedPaintKey;
  }

  // Clear canvas (cheaper than resizing) — scale map coordinates to display
  ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);

  // --- Static background caching ---
  // Everything through the castle labels is static (depends only on dimensions).
  // Cache to an offscreen canvas so we skip ~8500 lines of drawing per frame.
  let _savedCtx: CanvasRenderingContext2D | undefined;
  const bgCacheValid =
    staticBgCache != null &&
    staticBgCache.current.canvas !== null &&
    staticBgCache.current.w === displayW &&
    staticBgCache.current.h === displayH;

  if (staticBgCache && !bgCacheValid) {
    const bgCanvas =
      staticBgCache.current.canvas ?? document.createElement("canvas");
    bgCanvas.width = displayW * dpr;
    bgCanvas.height = displayH * dpr;
    const bgCtx = bgCanvas.getContext("2d");
    if (bgCtx) {
      _savedCtx = ctx;
      ctx = bgCtx;
      ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
      staticBgCache.current = { canvas: bgCanvas, h: displayH, w: displayW };
    }
  }

  if (!bgCacheValid) {
    drawTerrainBackdrop({
      ctx,
      height,
      time,
      width,
    });

    drawRoads({
      ctx,
      getLevelY,
      getY,
      height,
      isMobile,
      seededRandom,
      time,
      width,
    });

    // On mobile, bake fog directly into the static bg cache to save a drawImage blit per frame
    if (isMobile) {
      drawFogEdges(ctx, width, height);
    }
  } // end !bgCacheValid (static background section)

  if (_savedCtx) {
    ctx = _savedCtx;
  }
  if (staticBgCache?.current.canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(staticBgCache.current.canvas, 0, 0);
    ctx.restore();
    ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
  }

  // Draw context shared by all decoration modules
  const dc: WorldMapDrawContext = {
    ctx,
    getLevelY,
    getY,
    height,
    isMobile,
    seededRandom,
    time,
    width,
  };

  // --- Decoration layer caching ---
  // Mobile: 10 FPS keeps animations smooth while only rebuilding 1-in-3 frames
  // (DECOR_FPS / decorTimeBucket computed at the top of the function.)
  const decorCacheValid =
    decorationCache != null &&
    decorationCache.current.groundCanvas !== null &&
    decorationCache.current.w === displayW &&
    decorationCache.current.h === displayH &&
    decorationCache.current.timeBucket === decorTimeBucket;

  let _decorSavedCtx: CanvasRenderingContext2D | undefined;

  if (decorationCache && !decorCacheValid) {
    const gc =
      decorationCache.current.groundCanvas ?? document.createElement("canvas");
    gc.width = displayW * dpr;
    gc.height = displayH * dpr;
    const gcCtx = gc.getContext("2d");
    if (gcCtx) {
      gcCtx.clearRect(0, 0, gc.width, gc.height);
      _decorSavedCtx = ctx;
      ctx = gcCtx;
      ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
      decorationCache.current.groundCanvas = gc;
      decorationCache.current.w = displayW;
      decorationCache.current.h = displayH;
    }
  }

  if (!decorCacheValid) {
    dc.ctx = ctx;
    drawDecorationGroundLayer(dc);
  } // end !decorCacheValid (ground layer)

  if (_decorSavedCtx) {
    ctx = _decorSavedCtx;
    _decorSavedCtx = undefined;
  }
  if (decorationCache?.current.groundCanvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(decorationCache.current.groundCanvas, 0, 0);
    ctx.restore();
    ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
  }

  // --- PATH CONNECTIONS (desktop keeps full 50fps animation, mobile stays throttled) ---
  // (PATH_FPS / pathTimeBucket computed at the top of the function.)
  const pathUnlockedKey = unlockedMaps.join(",");
  const pathCacheValid =
    pathCache != null &&
    pathCache.current.canvas !== null &&
    pathCache.current.w === displayW &&
    pathCache.current.h === displayH &&
    pathCache.current.timeBucket === pathTimeBucket &&
    pathCache.current.unlockedKey === pathUnlockedKey;

  let _pathSavedCtx: CanvasRenderingContext2D | undefined;

  if (pathCache && !pathCacheValid) {
    const pc = pathCache.current.canvas ?? document.createElement("canvas");
    pc.width = displayW * dpr;
    pc.height = displayH * dpr;
    const pCtx = pc.getContext("2d");
    if (pCtx) {
      pCtx.clearRect(0, 0, pc.width, pc.height);
      _pathSavedCtx = ctx;
      ctx = pCtx;
      ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
      pathCache.current = {
        canvas: pc,
        h: displayH,
        timeBucket: pathTimeBucket,
        unlockedKey: pathUnlockedKey,
        w: displayW,
      };
    }
  }

  if (!pathCacheValid) {
    drawPathConnections({
      allLevels,
      ctx,
      getLevelById,
      getLevelY,
      height,
      isLevelUnlocked,
      time,
    });
  } // end !pathCacheValid

  if (_pathSavedCtx) {
    ctx = _pathSavedCtx;
  }
  if (pathCache?.current.canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(pathCache.current.canvas, 0, 0);
    ctx.restore();
    ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
  }

  // --- Structure + landmark layer caching ---
  let _structSavedCtx: CanvasRenderingContext2D | undefined;

  if (decorationCache && !decorCacheValid) {
    const sc =
      decorationCache.current.structureCanvas ??
      document.createElement("canvas");
    sc.width = displayW * dpr;
    sc.height = displayH * dpr;
    const scCtx = sc.getContext("2d");
    if (scCtx) {
      scCtx.clearRect(0, 0, sc.width, sc.height);
      _structSavedCtx = ctx;
      ctx = scCtx;
      ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
      decorationCache.current.structureCanvas = sc;
    }
  }

  if (!decorCacheValid) {
    dc.ctx = ctx;
    drawStructureLandmarkLayer(dc);
  } // end !decorCacheValid (structure + landmark layer)

  if (decorationCache && !decorCacheValid) {
    decorationCache.current.timeBucket = decorTimeBucket;
  }

  if (_structSavedCtx) {
    ctx = _structSavedCtx;
    _structSavedCtx = undefined;
  }
  if (decorationCache?.current.structureCanvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(decorationCache.current.structureCanvas, 0, 0);
    ctx.restore();
    ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
  }

  // --- LEVEL NODES (cached at reduced fps + state invalidation) ---
  drawLevelNodes({
    allLevels,
    ctx,
    displayH,
    displayW,
    dpr,
    getLevelY,
    hoveredLevel,
    isLevelUnlocked,
    levelStars,
    mapScale,
    nodeCache,
    selectedLevel,
    time,
    unlockedMaps,
  });

  const isHeroMoving = heroMoving?.current ?? false;
  if (selectedLevel && !isHeroMoving && heroMapPos) {
    const level = getLevelById(selectedLevel);
    if (level) {
      drawLevelBattlePreview(
        ctx,
        heroMapPos.current.x,
        heroMapPos.current.y,
        level.id,
        time
      );
    }
  }

  // --- HERO SPRITE on the world map (always visible) ---
  if (heroType && heroMapPos) {
    const attackPhase =
      !isHeroMoving && selectedLevel ? (Math.sin(time * 2) + 1) * 0.3 : 0;
    drawWorldMapHero(
      ctx,
      heroMapPos.current.x,
      heroMapPos.current.y,
      heroType,
      time,
      isHeroMoving,
      heroFacingRight?.current ?? true,
      attackPhase
    );
  }

  // Tooltip with preview image (desktop only — mobile uses MobileLevelSheet):
  // - show hovered level when hovering a different node
  // - otherwise show selected level
  const tooltipLevelId = isMobile
    ? null
    : hoveredLevel && hoveredLevel !== selectedLevel
      ? hoveredLevel
      : selectedLevel && getWorldLevelById(selectedLevel)
        ? selectedLevel
        : null;
  if (tooltipLevelId) {
    const level = getLevelById(tooltipLevelId);
    if (level && isLevelUnlocked(level.id)) {
      const { x } = level;
      const y = getLevelY(level.y);
      const size = 28;

      const cardWidth = 150;
      const cardHeight = 110;
      const cardX = x - cardWidth / 2;

      // Determine if tooltip should appear above or below based on level Y position
      const showBelow = level.y < 50;
      const cardY = showBelow ? y + size + 12 : y - size - cardHeight - 12;

      // Draw Background
      ctx.save();
      ctx.fillStyle = "rgba(12, 10, 8, 0.95)";
      ctx.strokeStyle = "#a0824d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Draw Image (use fallback from same region if no direct preview)
      const lvlData = LEVEL_DATA[level.id];
      const directPreview = lvlData?.previewImage;
      const fallbackPreview = !directPreview
        ? (allLevels
            .filter((l) => l.region === level.region)
            .map((l) => LEVEL_DATA[l.id]?.previewImage)
            .find(Boolean) ?? LEVEL_DATA.poe?.previewImage)
        : undefined;
      const previewSrc = directPreview ?? fallbackPreview;
      const isFallback = !directPreview && !!fallbackPreview;
      const cacheKey = isFallback ? `__fallback_${level.region}` : level.id;

      if (previewSrc) {
        if (!imageCache.current[cacheKey]) {
          const img = new Image();
          img.src = previewSrc;
          imageCache.current[cacheKey] = img;
        }
        const img = imageCache.current[cacheKey];

        if (img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(
            cardX + 2,
            cardY + 2,
            cardWidth - 4,
            cardHeight - 24,
            [4, 4, 0, 0]
          );
          ctx.clip();
          if (isFallback) {
            ctx.globalAlpha = 0.5;
          }
          ctx.drawImage(
            img,
            cardX + 2,
            cardY + 2,
            cardWidth - 4,
            cardHeight - 24
          );
          if (isFallback) {
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        } else {
          ctx.fillStyle = "#222";
          ctx.fillRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 24);
        }
      }

      // Draw first tag badge in top-right corner
      const tagText =
        level.kind === "challenge"
          ? "Challenge"
          : level.kind === "sandbox"
            ? "Sandbox"
            : (level.tags[0] ?? "");
      if (tagText) {
        ctx.save();
        ctx.font = "bold 8px 'bc-novatica-cyr', sans-serif";
        const tagMetrics = ctx.measureText(tagText);
        const tagPadH = 5;
        const tagW = tagMetrics.width + tagPadH * 2;
        const tagH = 14;
        const tagX = cardX + cardWidth - 4 - tagW;
        const tagY = cardY + 4;

        const isSandbox = level.kind === "sandbox";
        const isChallenge = level.kind === "challenge";
        ctx.fillStyle = isSandbox
          ? "rgba(180,120,30,0.92)"
          : isChallenge
            ? "rgba(160,60,40,0.92)"
            : "rgba(20,18,14,0.85)";
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 3);
        ctx.fill();
        ctx.strokeStyle = isChallenge
          ? "rgba(255,140,80,0.6)"
          : "rgba(180,150,80,0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = isChallenge ? "#FFD4B0" : "#E8D8A0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tagText, tagX + tagW / 2, tagY + tagH / 2);
        ctx.restore();
      }

      // Draw Text
      ctx.fillStyle = "#ffd700";
      ctx.textAlign = "center";
      ctx.font = "bold 11px 'bc-novatica-cyr', serif";
      ctx.fillText(level.name, x, cardY + cardHeight - 8);

      ctx.restore();
    }
  }

  // === ATMOSPHERE (clouds, birds, dust) — cached on mobile at 10 FPS ===
  // (ATMOS_FPS / atmosTimeBucket computed at the top of the function.)
  const atmosCacheValid =
    ATMOS_FPS > 0 &&
    atmosphereCache != null &&
    atmosphereCache.current.canvas !== null &&
    atmosphereCache.current.w === displayW &&
    atmosphereCache.current.h === displayH &&
    atmosphereCache.current.timeBucket === atmosTimeBucket;

  let atmosCtx: CanvasRenderingContext2D = ctx;
  let _atmosSavedCtx: CanvasRenderingContext2D | undefined;

  if (ATMOS_FPS > 0 && atmosphereCache && !atmosCacheValid) {
    const ac =
      atmosphereCache.current.canvas ?? document.createElement("canvas");
    ac.width = displayW * dpr;
    ac.height = displayH * dpr;
    const acCtx = ac.getContext("2d");
    if (acCtx) {
      acCtx.clearRect(0, 0, ac.width, ac.height);
      acCtx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
      _atmosSavedCtx = ctx;
      atmosCtx = acCtx;
      atmosphereCache.current = {
        canvas: ac,
        h: displayH,
        timeBucket: atmosTimeBucket,
        w: displayW,
      };
    }
  }

  if (!atmosCacheValid) {
    // === ATMOSPHERIC CLOUD LAYER ===
    atmosCtx.save();
    for (let c = 0; c < 12; c++) {
      const cloudBaseX =
        seededRandom(c * 37) * width + Math.sin(time * 0.15 + c * 2) * 40;
      const cloudBaseY = 30 + seededRandom(c * 37 + 1) * (height * 0.25);
      const cloudW = 60 + seededRandom(c * 37 + 2) * 80;
      const cloudH = 12 + seededRandom(c * 37 + 3) * 15;

      let cloudTint = "rgba(80,70,60,";
      if (cloudBaseX > 1440) {
        cloudTint = "rgba(60,30,20,";
      } else if (cloudBaseX > 1080) {
        cloudTint = "rgba(140,160,180,";
      } else if (cloudBaseX > 720) {
        cloudTint = "rgba(160,140,100,";
      } else if (cloudBaseX > 380) {
        cloudTint = "rgba(80,100,80,";
      }

      atmosCtx.globalAlpha = 0.06 + seededRandom(c * 37 + 4) * 0.06;
      atmosCtx.fillStyle = cloudTint + "1)";

      for (let blob = 0; blob < 4; blob++) {
        const blobX = cloudBaseX + (blob - 1.5) * cloudW * 0.25;
        const blobY = cloudBaseY + Math.sin(blob * 1.5) * cloudH * 0.3;
        const blobW = cloudW * (0.3 + seededRandom(c + blob * 7) * 0.25);
        const blobH = cloudH * (0.6 + seededRandom(c + blob * 11) * 0.4);
        atmosCtx.beginPath();
        atmosCtx.ellipse(blobX, blobY, blobW, blobH, 0, 0, Math.PI * 2);
        atmosCtx.fill();
      }
    }
    atmosCtx.globalAlpha = 1;
    atmosCtx.restore();

    // === FLYING CREATURES ===
    atmosCtx.save();
    for (let b = 0; b < 8; b++) {
      const birdBaseX = seededRandom(b * 53) * width;
      const birdBaseY = 15 + seededRandom(b * 53 + 1) * 35;
      const birdX =
        birdBaseX +
        Math.sin(time * 0.8 + b * 2.3) * 60 +
        time * (4 + seededRandom(b) * 3);
      const birdY = getY(birdBaseY) + Math.sin(time * 1.5 + b * 1.7) * 8;
      const wrappedX =
        (((birdX % (width + 100)) + width + 100) % (width + 100)) - 50;

      const wingFlap = Math.sin(time * 8 + b * 3) * 0.6;
      const wingSpan = 4 + seededRandom(b * 53 + 2) * 3;

      let birdColor = "#2a2a20";
      if (wrappedX > 1440) {
        birdColor = "#1a0808";
      } else if (wrappedX > 1080) {
        birdColor = "#4a5a6a";
      } else if (wrappedX > 720) {
        birdColor = "#5a4a30";
      }

      atmosCtx.strokeStyle = birdColor;
      atmosCtx.lineWidth = 1.2;
      atmosCtx.globalAlpha = 0.6;
      atmosCtx.beginPath();
      atmosCtx.moveTo(wrappedX - wingSpan, birdY + wingFlap * wingSpan);
      atmosCtx.quadraticCurveTo(
        wrappedX - wingSpan * 0.3,
        birdY - Math.abs(wingFlap) * 2,
        wrappedX,
        birdY
      );
      atmosCtx.quadraticCurveTo(
        wrappedX + wingSpan * 0.3,
        birdY - Math.abs(wingFlap) * 2,
        wrappedX + wingSpan,
        birdY + wingFlap * wingSpan
      );
      atmosCtx.stroke();
    }
    atmosCtx.globalAlpha = 1;
    atmosCtx.restore();

    // === ANIMATED DUST MOTES / PARTICLES ===
    atmosCtx.save();
    for (let d = 0; d < 30; d++) {
      const dustX =
        seededRandom(d * 67) * width + Math.sin(time * 0.4 + d * 1.3) * 20;
      const dustY =
        seededRandom(d * 67 + 1) * height + Math.cos(time * 0.3 + d * 0.9) * 15;
      const dustSize = 0.8 + seededRandom(d * 67 + 2) * 1.5;
      const dustAlpha = 0.15 + Math.sin(time * 2 + d * 0.7) * 0.1;

      let dustColor = "200,180,140";
      if (dustX > 1440) {
        dustColor = "255,120,50";
      } else if (dustX > 1080) {
        dustColor = "200,220,240";
      } else if (dustX > 720) {
        dustColor = "220,200,150";
      } else if (dustX > 380) {
        dustColor = "120,200,120";
      }

      atmosCtx.fillStyle = `rgba(${dustColor},${dustAlpha})`;
      atmosCtx.beginPath();
      atmosCtx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      atmosCtx.fill();
    }
    atmosCtx.restore();
  } // end !atmosCacheValid

  if (_atmosSavedCtx) {
    ctx = _atmosSavedCtx;
  }
  if (ATMOS_FPS > 0 && atmosphereCache?.current.canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(atmosphereCache.current.canvas, 0, 0);
    ctx.restore();
    ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
  }

  // === ENHANCED FOG EDGES ===
  // On mobile, fog is baked into the static bg cache (see above) to save a drawImage blit.
  // On desktop, use a separate fog overlay cache.
  if (!isMobile) {
    const fogCacheValid =
      fogOverlayCache != null &&
      fogOverlayCache.current.canvas !== null &&
      fogOverlayCache.current.w === displayW &&
      fogOverlayCache.current.h === displayH;

    if (fogOverlayCache && !fogCacheValid) {
      const fc =
        fogOverlayCache.current.canvas ?? document.createElement("canvas");
      fc.width = displayW * dpr;
      fc.height = displayH * dpr;
      const fCtx = fc.getContext("2d");
      if (fCtx) {
        fCtx.clearRect(0, 0, fc.width, fc.height);
        fCtx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
        drawFogEdges(fCtx, width, height);
        fogOverlayCache.current = { canvas: fc, h: displayH, w: displayW };
      }
    }

    if (fogOverlayCache?.current.canvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(fogOverlayCache.current.canvas, 0, 0);
      ctx.restore();
    }
  }
};

function drawFogEdges(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const leftFog = ctx.createLinearGradient(0, 0, 70, 0);
  leftFog.addColorStop(0, "rgba(15, 20, 8, 0.98)");
  leftFog.addColorStop(0.4, "rgba(20, 25, 10, 0.6)");
  leftFog.addColorStop(0.7, "rgba(25, 30, 12, 0.25)");
  leftFog.addColorStop(1, "rgba(25, 30, 12, 0)");
  ctx.fillStyle = leftFog;
  ctx.fillRect(0, 0, 70, height);

  const rightFog = ctx.createLinearGradient(width - 70, 0, width, 0);
  rightFog.addColorStop(0, "rgba(30, 10, 5, 0)");
  rightFog.addColorStop(0.3, "rgba(35, 12, 5, 0.25)");
  rightFog.addColorStop(0.6, "rgba(40, 15, 8, 0.6)");
  rightFog.addColorStop(1, "rgba(30, 8, 3, 0.98)");
  ctx.fillStyle = rightFog;
  ctx.fillRect(width - 70, 0, 70, height);

  const topFog = ctx.createLinearGradient(0, 0, 0, 45);
  topFog.addColorStop(0, "rgba(10, 5, 2, 0.85)");
  topFog.addColorStop(0.5, "rgba(15, 8, 4, 0.35)");
  topFog.addColorStop(1, "rgba(20, 10, 5, 0)");
  ctx.fillStyle = topFog;
  ctx.fillRect(0, 0, width, 45);

  const bottomFog = ctx.createLinearGradient(0, height - 25, 0, height);
  bottomFog.addColorStop(0, "rgba(15, 8, 3, 0)");
  bottomFog.addColorStop(0.5, "rgba(12, 6, 2, 0.35)");
  bottomFog.addColorStop(1, "rgba(10, 5, 2, 0.85)");
  ctx.fillStyle = bottomFog;
  ctx.fillRect(0, height - 25, width, 45);

  const cornerSize = 120;
  const tlGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cornerSize);
  tlGrad.addColorStop(0, "rgba(5,3,1,0.5)");
  tlGrad.addColorStop(1, "rgba(5,3,1,0)");
  ctx.fillStyle = tlGrad;
  ctx.fillRect(0, 0, cornerSize, cornerSize);

  const trGrad = ctx.createRadialGradient(width, 0, 0, width, 0, cornerSize);
  trGrad.addColorStop(0, "rgba(5,3,1,0.5)");
  trGrad.addColorStop(1, "rgba(5,3,1,0)");
  ctx.fillStyle = trGrad;
  ctx.fillRect(width - cornerSize, 0, cornerSize, cornerSize);

  const blGrad = ctx.createRadialGradient(0, height, 0, 0, height, cornerSize);
  blGrad.addColorStop(0, "rgba(5,3,1,0.5)");
  blGrad.addColorStop(1, "rgba(5,3,1,0)");
  ctx.fillStyle = blGrad;
  ctx.fillRect(0, height - cornerSize, cornerSize, cornerSize);

  const brGrad = ctx.createRadialGradient(
    width,
    height,
    0,
    width,
    height,
    cornerSize
  );
  brGrad.addColorStop(0, "rgba(5,3,1,0.5)");
  brGrad.addColorStop(1, "rgba(5,3,1,0)");
  ctx.fillStyle = brGrad;
  ctx.fillRect(width - cornerSize, height - cornerSize, cornerSize, cornerSize);
}
