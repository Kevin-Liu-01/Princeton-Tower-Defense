import { LEVEL_DATA } from "../../../constants";
import { MAP_WIDTH, WORLD_LEVELS } from "./worldMapData";
import {
  getLevelNodeY,
  getWorldLevelById,
  getWorldMapY,
  isWorldLevelUnlocked,
  seededRandom,
} from "./worldMapUtils";
import { drawTerrainBackdrop } from "./rendering/terrainBackdrop";
import { drawRoads } from "./rendering/roads";
import type { DrawWorldMapParams } from "./rendering/types";
import type { WorldMapDrawContext } from "./rendering/drawContext";
import { drawDecorationGroundLayer } from "./rendering/decorationGroundLayer";
import { drawStructureLandmarkLayer } from "./rendering/structureLandmarkLayer";
import { drawLevelNodes } from "./rendering/levelNodes";
import { drawPathConnections } from "./rendering/pathConnections";

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
}: DrawWorldMapParams): void => {
  const allLevels = levelsOverride ?? WORLD_LEVELS;
  const getY = (pct: number) => getWorldMapY(pct, mapHeight);
  const getLevelY = (pct: number) => getLevelNodeY(pct, mapHeight);
  const isLevelUnlocked = (levelId: string) =>
    isWorldLevelUnlocked(levelId, unlockedMaps);
  const getLevelById = (id: string) => getWorldLevelById(id);
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) return;
  let ctx: CanvasRenderingContext2D = rawCtx;

  const rawDpr = window.devicePixelRatio || 1;
  const dpr = Math.min(rawDpr, isMobile ? 1 : 2);
  const width = MAP_WIDTH;
  const height = mapHeight;
  const mapScale = Math.max(1.0, Math.min(1.5, containerWidth / MAP_WIDTH));
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
    lastCanvasSizeRef.current = { w: displayW, h: displayH };
  }

  // Use ref-based time to avoid React re-renders on every frame
  const time = animTimeRef.current;

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
      staticBgCache.current = { canvas: bgCanvas, w: displayW, h: displayH };
    }
  }

  if (!bgCacheValid) {
    drawTerrainBackdrop({
      ctx,
      width,
      height,
      isMobile,
      time,
    });

    drawRoads({
      ctx,
      width,
      height,
      isMobile,
      time,
      getY,
      getLevelY,
      seededRandom,
    });
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
    width,
    height,
    isMobile,
    time,
    getY,
    getLevelY,
    seededRandom,
  };

  // --- Decoration layer caching ---
  const DECOR_FPS = isMobile ? 30 : 50;
  const decorTimeBucket = Math.floor(time * DECOR_FPS);
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
  const PATH_FPS = isMobile ? 5 : 50;
  const pathTimeBucket = Math.floor(time * PATH_FPS);
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
        w: displayW,
        h: displayH,
        timeBucket: pathTimeBucket,
        unlockedKey: pathUnlockedKey,
      };
    }
  }

  if (!pathCacheValid) {
    drawPathConnections({
      ctx,
      allLevels,
      getLevelY,
      getLevelById,
      isLevelUnlocked,
      height,
      time,
      isMobile,
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
    ctx,
    allLevels,
    hoveredLevel,
    selectedLevel,
    levelStars,
    isLevelUnlocked,
    getLevelY,
    time,
    isMobile,
    displayW,
    displayH,
    dpr,
    mapScale,
    nodeCache,
    unlockedMaps,
  });

  // --- MARCHING ENEMIES near selected level ---
  if (selectedLevel) {
    const level = getLevelById(selectedLevel);
    if (level) {
      const lx = level.x;
      const ly = getLevelY(level.y);
      const marchCount = isMobile ? 3 : 5;

      for (let i = 0; i < marchCount; i++) {
        const offset = i * 18;
        const marchPhase = time * 3 + i * 1.2;
        const ex = lx + 50 + offset + Math.sin(marchPhase) * 3;
        const ey = ly + 6 + Math.sin(time * 2 + i * 0.7) * 2;
        const bobble = Math.sin(time * 6 + i * 2) * 2;
        const bodyColors = [
          "#4a1515",
          "#3a1010",
          "#5a2020",
          "#451818",
          "#3d1212",
        ];

        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(ex, ey + 10, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bodyColors[i % 5];
        ctx.beginPath();
        ctx.ellipse(ex, ey + bobble, 6, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#2a0808";
        ctx.beginPath();
        ctx.ellipse(ex, ey + bobble, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = bodyColors[i % 5];
        ctx.beginPath();
        ctx.arc(ex, ey - 11 + bobble, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ff3333";
        ctx.globalAlpha = 0.7 + Math.sin(time * 4 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(ex - 2.2, ey - 12 + bobble, 1.8, 0, Math.PI * 2);
        ctx.arc(ex + 2.2, ey - 12 + bobble, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#ff6666";
        ctx.beginPath();
        ctx.arc(ex - 2.2, ey - 12.3 + bobble, 0.7, 0, Math.PI * 2);
        ctx.arc(ex + 2.2, ey - 12.3 + bobble, 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  // Tooltip with preview image:
  // - show hovered level when hovering a different node
  // - otherwise show selected level
  const tooltipLevelId =
    hoveredLevel && hoveredLevel !== selectedLevel
      ? hoveredLevel
      : selectedLevel && getWorldLevelById(selectedLevel)
        ? selectedLevel
        : null;
  if (tooltipLevelId) {
    const level = getLevelById(tooltipLevelId);
    if (level && isLevelUnlocked(level.id)) {
      const x = level.x;
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
            [4, 4, 0, 0],
          );
          ctx.clip();
          if (isFallback) ctx.globalAlpha = 0.5;
          ctx.drawImage(
            img,
            cardX + 2,
            cardY + 2,
            cardWidth - 4,
            cardHeight - 24,
          );
          if (isFallback) ctx.globalAlpha = 1;
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

  // === ATMOSPHERIC CLOUD LAYER ===
  ctx.save();
  for (let c = 0; c < (isMobile ? 3 : 12); c++) {
    const cloudBaseX =
      seededRandom(c * 37) * width + Math.sin(time * 0.15 + c * 2) * 40;
    const cloudBaseY = 30 + seededRandom(c * 37 + 1) * (height * 0.25);
    const cloudW = 60 + seededRandom(c * 37 + 2) * 80;
    const cloudH = 12 + seededRandom(c * 37 + 3) * 15;

    // Determine cloud color based on region position
    let cloudTint = "rgba(80,70,60,";
    if (cloudBaseX > 1440) cloudTint = "rgba(60,30,20,";
    else if (cloudBaseX > 1080) cloudTint = "rgba(140,160,180,";
    else if (cloudBaseX > 720) cloudTint = "rgba(160,140,100,";
    else if (cloudBaseX > 380) cloudTint = "rgba(80,100,80,";

    ctx.globalAlpha = 0.06 + seededRandom(c * 37 + 4) * 0.06;
    ctx.fillStyle = cloudTint + "1)";

    // Cloud is several overlapping ellipses
    for (let blob = 0; blob < (isMobile ? 2 : 4); blob++) {
      const blobX = cloudBaseX + (blob - 1.5) * cloudW * 0.25;
      const blobY = cloudBaseY + Math.sin(blob * 1.5) * cloudH * 0.3;
      const blobW = cloudW * (0.3 + seededRandom(c + blob * 7) * 0.25);
      const blobH = cloudH * (0.6 + seededRandom(c + blob * 11) * 0.4);
      ctx.beginPath();
      ctx.ellipse(blobX, blobY, blobW, blobH, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // === FLYING CREATURES ===
  // Birds in grassland/swamp, bats in volcanic
  ctx.save();
  for (let b = 0; b < (isMobile ? 2 : 8); b++) {
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

    // Color based on region
    let birdColor = "#2a2a20";
    if (wrappedX > 1440)
      birdColor = "#1a0808"; // bats
    else if (wrappedX > 1080) birdColor = "#4a5a6a";
    else if (wrappedX > 720) birdColor = "#5a4a30";

    ctx.strokeStyle = birdColor;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(wrappedX - wingSpan, birdY + wingFlap * wingSpan);
    ctx.quadraticCurveTo(
      wrappedX - wingSpan * 0.3,
      birdY - Math.abs(wingFlap) * 2,
      wrappedX,
      birdY,
    );
    ctx.quadraticCurveTo(
      wrappedX + wingSpan * 0.3,
      birdY - Math.abs(wingFlap) * 2,
      wrappedX + wingSpan,
      birdY + wingFlap * wingSpan,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // === ANIMATED DUST MOTES / PARTICLES ===
  ctx.save();
  for (let d = 0; d < (isMobile ? 5 : 30); d++) {
    const dustX =
      seededRandom(d * 67) * width + Math.sin(time * 0.4 + d * 1.3) * 20;
    const dustY =
      seededRandom(d * 67 + 1) * height + Math.cos(time * 0.3 + d * 0.9) * 15;
    const dustSize = 0.8 + seededRandom(d * 67 + 2) * 1.5;
    const dustAlpha = 0.15 + Math.sin(time * 2 + d * 0.7) * 0.1;

    // Color by region
    let dustColor = "200,180,140";
    if (dustX > 1440) dustColor = "255,120,50";
    else if (dustX > 1080) dustColor = "200,220,240";
    else if (dustX > 720) dustColor = "220,200,150";
    else if (dustX > 380) dustColor = "120,200,120";

    ctx.fillStyle = `rgba(${dustColor},${dustAlpha})`;
    ctx.beginPath();
    ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // === ENHANCED FOG EDGES (cached — purely static overlay) ===
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

      const leftFog = fCtx.createLinearGradient(0, 0, 70, 0);
      leftFog.addColorStop(0, "rgba(15, 20, 8, 0.98)");
      leftFog.addColorStop(0.4, "rgba(20, 25, 10, 0.6)");
      leftFog.addColorStop(0.7, "rgba(25, 30, 12, 0.25)");
      leftFog.addColorStop(1, "rgba(25, 30, 12, 0)");
      fCtx.fillStyle = leftFog;
      fCtx.fillRect(0, 0, 70, height);

      const rightFog = fCtx.createLinearGradient(width - 70, 0, width, 0);
      rightFog.addColorStop(0, "rgba(30, 10, 5, 0)");
      rightFog.addColorStop(0.3, "rgba(35, 12, 5, 0.25)");
      rightFog.addColorStop(0.6, "rgba(40, 15, 8, 0.6)");
      rightFog.addColorStop(1, "rgba(30, 8, 3, 0.98)");
      fCtx.fillStyle = rightFog;
      fCtx.fillRect(width - 70, 0, 70, height);

      const topFog = fCtx.createLinearGradient(0, 0, 0, 45);
      topFog.addColorStop(0, "rgba(10, 5, 2, 0.85)");
      topFog.addColorStop(0.5, "rgba(15, 8, 4, 0.35)");
      topFog.addColorStop(1, "rgba(20, 10, 5, 0)");
      fCtx.fillStyle = topFog;
      fCtx.fillRect(0, 0, width, 45);

      const bottomFog = fCtx.createLinearGradient(0, height - 25, 0, height);
      bottomFog.addColorStop(0, "rgba(15, 8, 3, 0)");
      bottomFog.addColorStop(0.5, "rgba(12, 6, 2, 0.35)");
      bottomFog.addColorStop(1, "rgba(10, 5, 2, 0.85)");
      fCtx.fillStyle = bottomFog;
      fCtx.fillRect(0, height - 25, width, 45);

      const cornerSize = 120;
      const tlGrad = fCtx.createRadialGradient(0, 0, 0, 0, 0, cornerSize);
      tlGrad.addColorStop(0, "rgba(5,3,1,0.5)");
      tlGrad.addColorStop(1, "rgba(5,3,1,0)");
      fCtx.fillStyle = tlGrad;
      fCtx.fillRect(0, 0, cornerSize, cornerSize);

      const trGrad = fCtx.createRadialGradient(
        width,
        0,
        0,
        width,
        0,
        cornerSize,
      );
      trGrad.addColorStop(0, "rgba(5,3,1,0.5)");
      trGrad.addColorStop(1, "rgba(5,3,1,0)");
      fCtx.fillStyle = trGrad;
      fCtx.fillRect(width - cornerSize, 0, cornerSize, cornerSize);

      const blGrad = fCtx.createRadialGradient(
        0,
        height,
        0,
        0,
        height,
        cornerSize,
      );
      blGrad.addColorStop(0, "rgba(5,3,1,0.5)");
      blGrad.addColorStop(1, "rgba(5,3,1,0)");
      fCtx.fillStyle = blGrad;
      fCtx.fillRect(0, height - cornerSize, cornerSize, cornerSize);

      const brGrad = fCtx.createRadialGradient(
        width,
        height,
        0,
        width,
        height,
        cornerSize,
      );
      brGrad.addColorStop(0, "rgba(5,3,1,0.5)");
      brGrad.addColorStop(1, "rgba(5,3,1,0)");
      fCtx.fillStyle = brGrad;
      fCtx.fillRect(
        width - cornerSize,
        height - cornerSize,
        cornerSize,
        cornerSize,
      );

      fogOverlayCache.current = { canvas: fc, w: displayW, h: displayH };
    }
  }

  if (fogOverlayCache?.current.canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(fogOverlayCache.current.canvas, 0, 0);
    ctx.restore();
  }
};
