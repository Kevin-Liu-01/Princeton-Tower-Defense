import type { MutableRefObject } from "react";
import type { LevelStars } from "../../../../types";
import type { LevelNode } from "../worldMapData";
import type { NodeCache } from "./types";

import { drawRegionIcon, type RegionType } from "../../../../sprites/regionIconDrawing";

type RegionKey = RegionType;

export type NodePalette = {
  glowSelected: string;
  glowHover: string;
  ringLight: string;
  ringMid: string;
  ringDark: string;
  border: string;
  edge: string;
  notch: string;
  innerLight: string;
  innerDark: string;
};

export type ChallengePalette = NodePalette & {
  sigilGlow: string;
  sigilFill: string;
  sigilStroke: string;
  badgeFill: string;
  badgeStroke: string;
  badgeText: string;
};

const campaignPalettes: Record<RegionKey, NodePalette> = {
  grassland: {
    glowSelected: "rgba(140,210,110,",
    glowHover: "rgba(110,188,88,",
    ringLight: "#8AA858",
    ringMid: "#5A7838",
    ringDark: "#3A5020",
    border: "#A0B868",
    edge: "rgba(180,220,120,0.3)",
    notch: "#90A850",
    innerLight: "#5A7838",
    innerDark: "#3A5020",
  },
  swamp: {
    glowSelected: "rgba(108,184,169,",
    glowHover: "rgba(86,161,146,",
    ringLight: "#6FAFA1",
    ringMid: "#3D7467",
    ringDark: "#21443D",
    border: "#92CDBF",
    edge: "rgba(176,236,222,0.33)",
    notch: "#79B7AA",
    innerLight: "#446F66",
    innerDark: "#24443D",
  },
  desert: {
    glowSelected: "rgba(214,180,106,",
    glowHover: "rgba(194,156,83,",
    ringLight: "#BE9B5C",
    ringMid: "#82622F",
    ringDark: "#4D351A",
    border: "#DDBA73",
    edge: "rgba(240,218,160,0.32)",
    notch: "#C9A666",
    innerLight: "#876431",
    innerDark: "#50381B",
  },
  winter: {
    glowSelected: "rgba(127,176,214,",
    glowHover: "rgba(103,154,194,",
    ringLight: "#78A4C8",
    ringMid: "#43688A",
    ringDark: "#233E57",
    border: "#A2C9E8",
    edge: "rgba(186,218,244,0.33)",
    notch: "#88B1D3",
    innerLight: "#486C8C",
    innerDark: "#274158",
  },
  volcanic: {
    glowSelected: "rgba(214,114,76,",
    glowHover: "rgba(186,84,53,",
    ringLight: "#AA5238",
    ringMid: "#742C1C",
    ringDark: "#401409",
    border: "#CF7658",
    edge: "rgba(233,154,126,0.3)",
    notch: "#B85F42",
    innerLight: "#6C2C20",
    innerDark: "#36140C",
  },
};

const challengePalettes: Record<RegionKey, ChallengePalette> = {
  grassland: {
    glowSelected: "rgba(110,215,120,",
    glowHover: "rgba(86,190,103,",
    ringLight: "#63B86F",
    ringMid: "#2E6B3A",
    ringDark: "#193622",
    border: "#90E3A0",
    edge: "rgba(180,255,190,0.35)",
    notch: "#6CC77A",
    innerLight: "#2E6A39",
    innerDark: "#183620",
    sigilGlow: "rgba(108,212,118,",
    sigilFill: "#2E7F42",
    sigilStroke: "#D2F7B0",
    badgeFill: "rgba(33,95,48,0.9)",
    badgeStroke: "#A6F0AF",
    badgeText: "#E7FFD6",
  },
  swamp: {
    glowSelected: "rgba(90,196,178,",
    glowHover: "rgba(72,170,152,",
    ringLight: "#59AFA6",
    ringMid: "#27635C",
    ringDark: "#143833",
    border: "#7FD9CC",
    edge: "rgba(165,248,236,0.33)",
    notch: "#5AC7B8",
    innerLight: "#2A655D",
    innerDark: "#163A35",
    sigilGlow: "rgba(88,198,178,",
    sigilFill: "#2D7268",
    sigilStroke: "#C8FFF1",
    badgeFill: "rgba(22,89,80,0.9)",
    badgeStroke: "#8FE5D8",
    badgeText: "#DBFFF8",
  },
  desert: {
    glowSelected: "rgba(234,193,96,",
    glowHover: "rgba(219,172,68,",
    ringLight: "#D9AA52",
    ringMid: "#87622A",
    ringDark: "#4A3316",
    border: "#FFD07A",
    edge: "rgba(255,228,165,0.35)",
    notch: "#E2B35A",
    innerLight: "#8B642D",
    innerDark: "#4A3418",
    sigilGlow: "rgba(229,185,86,",
    sigilFill: "#A9782D",
    sigilStroke: "#FFE8AE",
    badgeFill: "rgba(132,93,32,0.9)",
    badgeStroke: "#FFD27A",
    badgeText: "#FFF1CA",
  },
  winter: {
    glowSelected: "rgba(112,184,235,",
    glowHover: "rgba(89,160,214,",
    ringLight: "#71A8CF",
    ringMid: "#355E86",
    ringDark: "#1A334D",
    border: "#A8D8FF",
    edge: "rgba(201,231,255,0.35)",
    notch: "#7EBBE6",
    innerLight: "#3A6389",
    innerDark: "#1C3850",
    sigilGlow: "rgba(112,184,235,",
    sigilFill: "#3A79A9",
    sigilStroke: "#D5EEFF",
    badgeFill: "rgba(44,85,121,0.9)",
    badgeStroke: "#AAD9FF",
    badgeText: "#E8F6FF",
  },
  volcanic: {
    glowSelected: "rgba(255,120,60,",
    glowHover: "rgba(255,90,40,",
    ringLight: "#B74A2E",
    ringMid: "#7E2716",
    ringDark: "#3D0C07",
    border: "#E0744B",
    edge: "rgba(255,164,124,0.3)",
    notch: "#C8552B",
    innerLight: "#6A251A",
    innerDark: "#32110C",
    sigilGlow: "rgba(255,108,48,",
    sigilFill: "#9D2D19",
    sigilStroke: "#FFD8A6",
    badgeFill: "rgba(120,20,10,0.9)",
    badgeStroke: "#FFB27B",
    badgeText: "#FFF3CC",
  },
};

export interface DrawLevelNodesParams {
  ctx: CanvasRenderingContext2D;
  allLevels: LevelNode[];
  hoveredLevel: string | null;
  selectedLevel: string | null;
  levelStars: LevelStars;
  isLevelUnlocked: (levelId: string) => boolean;
  getLevelY: (pct: number) => number;
  time: number;
  isMobile: boolean;
  displayW: number;
  displayH: number;
  dpr: number;
  mapScale: number;
  nodeCache?: MutableRefObject<NodeCache>;
  unlockedMaps: string[];
}

export function drawLevelNodes({
  ctx: callerCtx,
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
}: DrawLevelNodesParams): void {
  let ctx = callerCtx;

  const NODE_FPS = isMobile ? 5 : 15;
  const nodeTimeBucket = Math.floor(time * NODE_FPS);
  const nodeStarsKey = JSON.stringify(levelStars);
  const nodeUnlockedKey = unlockedMaps.join(",");
  const nodeCacheValid =
    nodeCache != null &&
    nodeCache.current.canvas !== null &&
    nodeCache.current.w === displayW &&
    nodeCache.current.h === displayH &&
    nodeCache.current.timeBucket === nodeTimeBucket &&
    nodeCache.current.hoveredLevel === hoveredLevel &&
    nodeCache.current.selectedLevel === selectedLevel &&
    nodeCache.current.starsKey === nodeStarsKey &&
    nodeCache.current.unlockedKey === nodeUnlockedKey;

  let _nodeSavedCtx: CanvasRenderingContext2D | undefined;

  if (nodeCache && !nodeCacheValid) {
    const nc = nodeCache.current.canvas ?? document.createElement("canvas");
    nc.width = displayW * dpr;
    nc.height = displayH * dpr;
    const nCtx = nc.getContext("2d");
    if (nCtx) {
      nCtx.clearRect(0, 0, nc.width, nc.height);
      _nodeSavedCtx = ctx;
      ctx = nCtx;
      ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
      nodeCache.current = {
        canvas: nc,
        w: displayW,
        h: displayH,
        timeBucket: nodeTimeBucket,
        hoveredLevel,
        selectedLevel,
        starsKey: nodeStarsKey,
        unlockedKey: nodeUnlockedKey,
      };
    }
  }

  if (!nodeCacheValid) {
    allLevels.forEach((level) => {
      const x = level.x;
      const y = getLevelY(level.y);
      const isChallenge = level.kind === "challenge";
      const isUnlocked = isLevelUnlocked(level.id);
      const isHovered = hoveredLevel === level.id;
      const isSelected = selectedLevel === level.id;
      const stars = levelStars[level.id] || 0;
      const size =
        isHovered || isSelected
          ? isChallenge
            ? 30
            : 28
          : isChallenge
            ? 26
            : 24;
      const challengePalette = challengePalettes[level.region];
      const nodePalette = isChallenge
        ? challengePalette
        : campaignPalettes[level.region];

      // Glow (use radial gradient instead of expensive shadowBlur)
      if (isSelected || (isHovered && isUnlocked)) {
        const glowRadius = isSelected ? 44 : 32;
        const glowColor = isSelected
          ? "rgba(255,200,50,"
          : nodePalette.glowHover;
        const glow = ctx.createRadialGradient(
          x,
          y,
          size * 0.5,
          x,
          y,
          glowRadius,
        );
        glow.addColorStop(0, glowColor + "0.45)");
        glow.addColorStop(0.4, glowColor + "0.25)");
        glow.addColorStop(0.7, glowColor + "0.1)");
        glow.addColorStop(1, glowColor + "0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Victory flag (heraldic banner with swallowtail)
      if (stars > 0) {
        const flagPoleX = x;
        const flagPoleTop = y - size - 30;
        const flagPoleBot = y - size + 4;
        const poleHeight = flagPoleBot - flagPoleTop;

        // Pole shadow
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(flagPoleX, flagPoleTop + 2, 4, poleHeight);

        // Pole (metallic gradient)
        const poleGrad = ctx.createLinearGradient(
          flagPoleX - 1.5,
          0,
          flagPoleX + 2,
          0,
        );
        poleGrad.addColorStop(0, "#5A3818");
        poleGrad.addColorStop(0.3, "#C89050");
        poleGrad.addColorStop(0.5, "#DCA868");
        poleGrad.addColorStop(0.7, "#A87040");
        poleGrad.addColorStop(1, "#4A2810");
        ctx.fillStyle = poleGrad;
        ctx.fillRect(flagPoleX - 0.5, flagPoleTop, 2.5, poleHeight);

        // Finial (ornate spearhead)
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 0.5, flagPoleTop - 7);
        ctx.lineTo(flagPoleX + 3.5, flagPoleTop - 1);
        ctx.lineTo(flagPoleX + 0.5, flagPoleTop + 1);
        ctx.lineTo(flagPoleX - 2.5, flagPoleTop - 1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFF8D0";
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 0.5, flagPoleTop - 6);
        ctx.lineTo(flagPoleX + 1.5, flagPoleTop - 1);
        ctx.lineTo(flagPoleX + 0.5, flagPoleTop);
        ctx.lineTo(flagPoleX - 0.5, flagPoleTop - 1);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#B8960A";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 0.5, flagPoleTop - 7);
        ctx.lineTo(flagPoleX + 3.5, flagPoleTop - 1);
        ctx.lineTo(flagPoleX + 0.5, flagPoleTop + 1);
        ctx.lineTo(flagPoleX - 2.5, flagPoleTop - 1);
        ctx.closePath();
        ctx.stroke();

        // Flag colors per region
        const flagPrimary =
          level.region === "grassland"
            ? "#2A8A2A"
            : level.region === "swamp"
              ? "#508A80"
              : level.region === "desert"
                ? "#C89818"
                : level.region === "winter"
                  ? "#4078A8"
                  : "#A82828";
        const flagSecondary =
          level.region === "grassland"
            ? "#50D050"
            : level.region === "swamp"
              ? "#80D8C0"
              : level.region === "desert"
                ? "#FFD040"
                : level.region === "winter"
                  ? "#80C0F0"
                  : "#FF5050";
        const flagTrim =
          level.region === "grassland"
            ? "#1A6A1A"
            : level.region === "swamp"
              ? "#3A6A5A"
              : level.region === "desert"
                ? "#9A7010"
                : level.region === "winter"
                  ? "#305878"
                  : "#7A1818";

        // Waving animation
        const wave = Math.sin(time * 3 + x * 0.04) * 2.5;
        const wave2 = Math.sin(time * 3 + x * 0.04 + 1.2) * 2;
        const wave3 = Math.sin(time * 3 + x * 0.04 + 2.4) * 1.5;

        // Banner dimensions
        const bTop = flagPoleTop - 2;
        const bW = 22;
        const bH = 18;
        // Banner body (swallowtail shape)
        ctx.fillStyle = flagPrimary;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 1.5, bTop);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + 1.5 + wave * 0.5,
          flagPoleX + bW,
          bTop + 1 + wave2 * 0.4,
        );
        ctx.lineTo(flagPoleX + bW - 2, bTop + bH * 0.5 + wave3 * 0.3);
        ctx.lineTo(flagPoleX + bW, bTop + bH + wave2 * 0.4);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + bH - 1 + wave * 0.5,
          flagPoleX + 1.5,
          bTop + bH,
        );
        ctx.closePath();
        ctx.fill();

        // Horizontal stripe
        ctx.fillStyle = flagTrim;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 1.5, bTop + bH * 0.35);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + bH * 0.35 + wave * 0.35,
          flagPoleX + bW,
          bTop + bH * 0.35 + wave2 * 0.3,
        );
        ctx.lineTo(flagPoleX + bW, bTop + bH * 0.65 + wave2 * 0.3);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + bH * 0.65 + wave * 0.35,
          flagPoleX + 1.5,
          bTop + bH * 0.65,
        );
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Top highlight
        ctx.fillStyle = flagSecondary;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 1.5, bTop + 1);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + 2.5 + wave * 0.4,
          flagPoleX + bW - 2,
          bTop + 2 + wave2 * 0.3,
        );
        ctx.lineTo(flagPoleX + bW - 3, bTop + 5 + wave2 * 0.3);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.3,
          bTop + 4 + wave * 0.3,
          flagPoleX + 1.5,
          bTop + 4,
        );
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Banner outline
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(flagPoleX + 1.5, bTop);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + 1.5 + wave * 0.5,
          flagPoleX + bW,
          bTop + 1 + wave2 * 0.4,
        );
        ctx.lineTo(flagPoleX + bW - 2, bTop + bH * 0.5 + wave3 * 0.3);
        ctx.lineTo(flagPoleX + bW, bTop + bH + wave2 * 0.4);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + bH - 1 + wave * 0.5,
          flagPoleX + 1.5,
          bTop + bH,
        );
        ctx.closePath();
        ctx.stroke();

        // Star emblem on banner
        const embX = flagPoleX + bW * 0.45;
        const embY = bTop + bH * 0.5 + wave * 0.3;
        ctx.fillStyle = "#FFE870";
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? 3 : 1.2;
          const px = embX + Math.cos(a) * r;
          const py = embY + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Crossbar
        ctx.fillStyle = "#A87040";
        ctx.fillRect(flagPoleX - 1, bTop - 0.5, 3, 1.5);
        ctx.fillRect(flagPoleX - 1, bTop + bH - 1, 3, 1.5);
      }

      // === BANNER RIBBON (difficulty + stars) — rendered below node circle ===
      if (isUnlocked) {
        const bannerTop = y + size - 8;
        const bannerW = 36;
        const bannerH = 36;
        const notchDepth = 6;
        const bx = x - bannerW / 2;

        // Region-tinted banner colors
        const bannerColors = {
          grassland: {
            top: "#2A3A1A",
            mid: "#1E2A14",
            bot: "#243018",
            border: "#5A7838",
          },
          swamp: {
            top: "#1A2A28",
            mid: "#142220",
            bot: "#182820",
            border: "#3D7467",
          },
          desert: {
            top: "#3A2A18",
            mid: "#2A2010",
            bot: "#322818",
            border: "#82622F",
          },
          winter: {
            top: "#1A2430",
            mid: "#141C28",
            bot: "#182230",
            border: "#43688A",
          },
          volcanic: {
            top: "#301A14",
            mid: "#24120E",
            bot: "#2A1810",
            border: "#742C1C",
          },
        };
        const bc = bannerColors[level.region];

        // Banner shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.moveTo(bx + 3 + 1, bannerTop + 1);
        ctx.lineTo(bx + bannerW - 3 + 1, bannerTop + 1);
        ctx.quadraticCurveTo(
          bx + bannerW + 1,
          bannerTop + 1,
          bx + bannerW + 1,
          bannerTop + 3 + 1,
        );
        ctx.lineTo(bx + bannerW + 1, bannerTop + bannerH + 1);
        ctx.lineTo(x + 1, bannerTop + bannerH - notchDepth + 1);
        ctx.lineTo(bx + 1, bannerTop + bannerH + 1);
        ctx.lineTo(bx + 1, bannerTop + 3 + 1);
        ctx.quadraticCurveTo(bx + 1, bannerTop + 1, bx + 3 + 1, bannerTop + 1);
        ctx.closePath();
        ctx.fill();

        // Banner body — region-tinted gradient
        const bannerGrad = ctx.createLinearGradient(
          x,
          bannerTop,
          x,
          bannerTop + bannerH,
        );
        bannerGrad.addColorStop(0, bc.top);
        bannerGrad.addColorStop(0.35, bc.mid);
        bannerGrad.addColorStop(0.7, bc.mid);
        bannerGrad.addColorStop(1, bc.bot);
        ctx.fillStyle = bannerGrad;
        ctx.beginPath();
        ctx.moveTo(bx + 3, bannerTop);
        ctx.lineTo(bx + bannerW - 3, bannerTop);
        ctx.quadraticCurveTo(
          bx + bannerW,
          bannerTop,
          bx + bannerW,
          bannerTop + 3,
        );
        ctx.lineTo(bx + bannerW, bannerTop + bannerH);
        ctx.lineTo(x, bannerTop + bannerH - notchDepth);
        ctx.lineTo(bx, bannerTop + bannerH);
        ctx.lineTo(bx, bannerTop + 3);
        ctx.quadraticCurveTo(bx, bannerTop, bx + 3, bannerTop);
        ctx.closePath();
        ctx.fill();

        // Subtle inner glow from region color
        ctx.fillStyle = nodePalette.edge;
        ctx.globalAlpha = 0.1;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Banner border — region-tinted
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = stars > 0 ? "#C8AA3C" : bc.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + 3, bannerTop);
        ctx.lineTo(bx + bannerW - 3, bannerTop);
        ctx.quadraticCurveTo(
          bx + bannerW,
          bannerTop,
          bx + bannerW,
          bannerTop + 3,
        );
        ctx.lineTo(bx + bannerW, bannerTop + bannerH);
        ctx.lineTo(x, bannerTop + bannerH - notchDepth);
        ctx.lineTo(bx, bannerTop + bannerH);
        ctx.lineTo(bx, bannerTop + 3);
        ctx.quadraticCurveTo(bx, bannerTop, bx + 3, bannerTop);
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;

        // --- Difficulty diamonds (positioned in visible area below node) ---
        const diffColors =
          level.difficulty === 1
            ? { fill: "#50E080", stroke: "#30A858", glow: "rgba(80,224,128," }
            : level.difficulty === 2
              ? { fill: "#FFD040", stroke: "#D0A020", glow: "rgba(255,208,64," }
              : { fill: "#FF5050", stroke: "#C83030", glow: "rgba(255,80,80," };
        const diffY = bannerTop + 15;
        const diamondSpacing = 8;

        for (let d = 0; d < 3; d++) {
          const dx = x - diamondSpacing + d * diamondSpacing;
          const active = d < level.difficulty;

          if (active) {
            ctx.fillStyle = diffColors.glow + "0.3)";
            ctx.beginPath();
            ctx.arc(dx, diffY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = diffColors.fill;
            ctx.beginPath();
            ctx.moveTo(dx, diffY - 3.5);
            ctx.lineTo(dx + 2.5, diffY);
            ctx.lineTo(dx, diffY + 3.5);
            ctx.lineTo(dx - 2.5, diffY);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(dx, diffY - 2.5);
            ctx.lineTo(dx + 1.5, diffY - 0.5);
            ctx.lineTo(dx, diffY + 0.5);
            ctx.lineTo(dx - 1.5, diffY - 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = diffColors.stroke;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(dx, diffY - 3.5);
            ctx.lineTo(dx + 2.5, diffY);
            ctx.lineTo(dx, diffY + 3.5);
            ctx.lineTo(dx - 2.5, diffY);
            ctx.closePath();
            ctx.stroke();
          } else {
            ctx.fillStyle = "#1A1815";
            ctx.beginPath();
            ctx.moveTo(dx, diffY - 2.5);
            ctx.lineTo(dx + 1.8, diffY);
            ctx.lineTo(dx, diffY + 2.5);
            ctx.lineTo(dx - 1.8, diffY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(80,70,60,0.5)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // --- Separator line ---
        ctx.strokeStyle = "rgba(160,140,90,0.15)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(bx + 4, bannerTop + 20);
        ctx.lineTo(bx + bannerW - 4, bannerTop + 20);
        ctx.stroke();

        // --- Stars ---
        const starY = bannerTop + 27;
        const starSpacing = 9;
        for (let s = 0; s < 3; s++) {
          const sx = x - starSpacing + s * starSpacing;
          const earned = stars > s;
          const outerR = 4.8;
          const innerR = 1.9;

          if (earned) {
            ctx.fillStyle = "#ffd700";
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(sx, starY, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const px = sx + Math.cos(angle) * r;
            const py = starY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();

          if (earned) {
            const starGrad = ctx.createRadialGradient(
              sx - 1,
              starY - 1,
              0,
              sx,
              starY,
              outerR,
            );
            starGrad.addColorStop(0, "#FFF0A0");
            starGrad.addColorStop(0.5, "#FFD700");
            starGrad.addColorStop(1, "#C8A010");
            ctx.fillStyle = starGrad;
            ctx.fill();
            ctx.strokeStyle = "#B89A10";
            ctx.lineWidth = 0.7;
            ctx.stroke();
          } else {
            ctx.fillStyle = "#1A1815";
            ctx.fill();
            ctx.strokeStyle = "rgba(80,70,50,0.4)";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Node shadow (deeper, offset)
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(x + 2, y + 3, size + 2, 0, Math.PI * 2);
      ctx.fill();

      // Outer decorative ring (metallic beveled)
      const outerRing = ctx.createRadialGradient(
        x - 3,
        y - 3,
        size - 6,
        x,
        y,
        size + 2,
      );
      if (isUnlocked) {
        outerRing.addColorStop(0, nodePalette.ringLight);
        outerRing.addColorStop(0.5, nodePalette.ringMid);
        outerRing.addColorStop(1, nodePalette.ringDark);
      } else {
        outerRing.addColorStop(0, "#4A4A4A");
        outerRing.addColorStop(0.5, "#3A3A3A");
        outerRing.addColorStop(1, "#2A2A2A");
      }
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = outerRing;
      ctx.fill();

      // Gold outer glow rings when selected
      if (isSelected) {
        const goldPulse = 0.75 + 0.25 * Math.sin(time * 2.5);
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.12 * goldPulse})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(x, y, size + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 210, 0, ${0.25 * goldPulse})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, size + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 200, 0, ${0.5 * goldPulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size + 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Metallic border strokes (double ring for bevel effect)
      ctx.strokeStyle = isSelected
        ? "#FFD700"
        : isHovered
          ? nodePalette.border
          : isUnlocked
            ? nodePalette.border
            : "#505050";
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
      // Inner bright edge (bevel highlight)
      ctx.strokeStyle = isUnlocked
        ? nodePalette.edge
        : "rgba(100,100,100,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, size - 2, 0, Math.PI * 2);
      ctx.stroke();
      // Outer dark edge (bevel shadow)
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, size + 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Ornamental notches (8 evenly spaced around ring)
      if (isUnlocked) {
        ctx.fillStyle = nodePalette.notch;
        for (let n = 0; n < 8; n++) {
          const na = (n * Math.PI) / 4;
          const nx = x + Math.cos(na) * (size - 0.5);
          const ny = y + Math.sin(na) * (size - 0.5);
          ctx.beginPath();
          ctx.arc(nx, ny, isSelected ? 2.5 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Inner circle (recessed)
      const innerGrad = ctx.createRadialGradient(
        x - 2,
        y - 2,
        0,
        x,
        y,
        size - 5,
      );
      if (isUnlocked) {
        innerGrad.addColorStop(0, nodePalette.innerLight);
        innerGrad.addColorStop(1, nodePalette.innerDark);
      } else {
        innerGrad.addColorStop(0, "#333028");
        innerGrad.addColorStop(1, "#201D18");
      }
      ctx.beginPath();
      ctx.arc(x, y, size - 6, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();
      // Inner recess shadow ring
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, size - 6, 0, Math.PI * 2);
      ctx.stroke();

      // Region icon
      if (isUnlocked) {
        // Dark vignette behind icon for consistent contrast
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.arc(x, y, size - 7, 0, Math.PI * 2);
        ctx.fill();

        // All icons drawn centered at origin via translate
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = 1;

        if (level.kind === "sandbox") {
          // Sandbox icon: sandcastle turret with flag
          const s = 1.0;
          // Base mound
          ctx.fillStyle = "#D4A84B";
          ctx.beginPath();
          ctx.ellipse(0, 7 * s, 11 * s, 4 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          // Castle body
          const bodyGrad = ctx.createLinearGradient(
            -7 * s,
            -6 * s,
            7 * s,
            6 * s,
          );
          bodyGrad.addColorStop(0, "#E8C45A");
          bodyGrad.addColorStop(1, "#C49030");
          ctx.fillStyle = bodyGrad;
          ctx.fillRect(-7 * s, -4 * s, 14 * s, 10 * s);
          // Crenellations
          ctx.fillStyle = "#D4A84B";
          for (let i = -3; i <= 3; i++) {
            ctx.fillRect(i * 3.2 * s - 1.2 * s, -7 * s, 2.4 * s, 3 * s);
          }
          // Door arch
          ctx.fillStyle = "#6B4020";
          ctx.beginPath();
          ctx.arc(0, 4 * s, 2.5 * s, Math.PI, 0);
          ctx.lineTo(2.5 * s, 6 * s);
          ctx.lineTo(-2.5 * s, 6 * s);
          ctx.closePath();
          ctx.fill();
          // Flag
          const wave = Math.sin(time * 3.5) * 1.5;
          ctx.fillStyle = "#8B5020";
          ctx.fillRect(-0.5 * s, -12 * s, 1 * s, 6 * s);
          ctx.fillStyle = "#FF6830";
          ctx.beginPath();
          ctx.moveTo(0.5 * s, -12 * s);
          ctx.quadraticCurveTo(
            4 * s,
            -11 * s + wave,
            7 * s,
            -11.5 * s + wave * 0.7,
          );
          ctx.lineTo(6.5 * s, -9 * s + wave * 0.7);
          ctx.quadraticCurveTo(3.5 * s, -9.5 * s + wave, 0.5 * s, -8 * s);
          ctx.closePath();
          ctx.fill();
          // Star on flag
          ctx.fillStyle = "#FFE870";
          ctx.beginPath();
          ctx.arc(3.5 * s, -10 * s + wave * 0.5, 1.2 * s, 0, Math.PI * 2);
          ctx.fill();
        } else if (isChallenge) {
          // Challenge marker icon: regional sigil with crossed blades
          const challengeGlow = 0.35 + Math.sin(time * 4 + x * 0.03) * 0.08;
          ctx.fillStyle = `${challengePalette.sigilGlow}${challengeGlow})`;
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = challengePalette.sigilFill;
          ctx.beginPath();
          ctx.moveTo(0, -11);
          ctx.lineTo(9, 0);
          ctx.lineTo(0, 11);
          ctx.lineTo(-9, 0);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = challengePalette.sigilStroke;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(-6.5, 6);
          ctx.lineTo(6.5, -6);
          ctx.moveTo(-6.5, -6);
          ctx.lineTo(6.5, 6);
          ctx.stroke();

          ctx.fillStyle = challengePalette.badgeText;
          ctx.beginPath();
          ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (
          level.region === "grassland" ||
          level.region === "swamp" ||
          level.region === "desert" ||
          level.region === "winter" ||
          level.region === "volcanic"
        ) {
          drawRegionIcon(ctx, level.region);

          // Animated spark overlays for volcanic
          if (level.region === "volcanic") {
            const bob = Math.sin(time * 4) * 1.5;
            ctx.fillStyle = "#FFDD00";
            ctx.beginPath();
            ctx.arc(-3, -10 + bob, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#FF8800";
            ctx.beginPath();
            ctx.arc(3.5, -9 - bob * 0.6, 0.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#FFCC00";
            ctx.beginPath();
            ctx.arc(0.5, -12 + bob * 0.4, 0.7, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Fallback - bright gem
          ctx.fillStyle = "#FFB840";
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, 8);
          ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#FFD870";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "#FFE880";
          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.lineTo(3, 0);
          ctx.lineTo(0, 5);
          ctx.lineTo(-3, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
        ctx.globalAlpha = 1;

        // Challenge diamond badge
        if (isChallenge) {
          const tagY = y - size - 8;
          ctx.fillStyle = challengePalette.badgeFill;
          ctx.beginPath();
          ctx.moveTo(x - 10, tagY + 2);
          ctx.lineTo(x, tagY - 6);
          ctx.lineTo(x + 10, tagY + 2);
          ctx.lineTo(x, tagY + 10);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = challengePalette.badgeStroke;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = challengePalette.badgeText;
          ctx.font = "bold 8px serif";
          ctx.textAlign = "center";
          ctx.fillText("!", x, tagY + 4);
        }

        // Pennant flag for unlocked levels without victory flag
        if (stars === 0) {
          const pennantX = x + size * 0.6;
          const pennantTop = y - size - 16;
          const pennantBot = y - size + 2;
          const pennantLen = 14;
          const pWave = Math.sin(time * 2.5 + x * 0.07) * 1.5;

          // Pole shadow
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.fillRect(pennantX, pennantTop + 1, 2.5, pennantBot - pennantTop);
          // Pole
          const ppGrad = ctx.createLinearGradient(
            pennantX - 0.5,
            0,
            pennantX + 2,
            0,
          );
          ppGrad.addColorStop(0, "#5A4520");
          ppGrad.addColorStop(0.5, "#8A7040");
          ppGrad.addColorStop(1, "#5A4520");
          ctx.fillStyle = ppGrad;
          ctx.fillRect(pennantX, pennantTop, 2, pennantBot - pennantTop);
          // Pole cap
          ctx.fillStyle = "#B8960A";
          ctx.beginPath();
          ctx.arc(pennantX + 1, pennantTop - 1, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(pennantX + 0.5, pennantTop - 1.5, 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Triangular pennant
          const pennantColor = nodePalette.ringMid ?? "#6a6a6a";
          ctx.fillStyle = pennantColor;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(pennantX + 2, pennantTop + 1);
          ctx.quadraticCurveTo(
            pennantX + pennantLen * 0.6,
            pennantTop + 3 + pWave,
            pennantX + pennantLen,
            pennantTop + 5 + pWave * 0.8,
          );
          ctx.lineTo(pennantX + 2, pennantTop + 10);
          ctx.closePath();
          ctx.fill();
          // Pennant highlight
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.12;
          ctx.beginPath();
          ctx.moveTo(pennantX + 2, pennantTop + 2);
          ctx.quadraticCurveTo(
            pennantX + pennantLen * 0.4,
            pennantTop + 3.5 + pWave * 0.7,
            pennantX + pennantLen * 0.7,
            pennantTop + 4.5 + pWave * 0.6,
          );
          ctx.lineTo(pennantX + 2, pennantTop + 5);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
          // Pennant outline
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(pennantX + 2, pennantTop + 1);
          ctx.quadraticCurveTo(
            pennantX + pennantLen * 0.6,
            pennantTop + 3 + pWave,
            pennantX + pennantLen,
            pennantTop + 5 + pWave * 0.8,
          );
          ctx.lineTo(pennantX + 2, pennantTop + 10);
          ctx.closePath();
          ctx.stroke();
        }
      } else {
        // Lock icon (detailed padlock)
        ctx.save();
        ctx.translate(x, y);
        // Lock body shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.roundRect(-6, 0.5, 12, 10, 2);
        ctx.fill();
        // Lock body
        const lockGrad = ctx.createLinearGradient(-6, 0, 6, 0);
        lockGrad.addColorStop(0, "#5A5858");
        lockGrad.addColorStop(0.4, "#787878");
        lockGrad.addColorStop(0.6, "#686868");
        lockGrad.addColorStop(1, "#4A4848");
        ctx.fillStyle = lockGrad;
        ctx.beginPath();
        ctx.roundRect(-6, -1, 12, 10, 2);
        ctx.fill();
        // Lock body border
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(-6, -1, 12, 10, 2);
        ctx.stroke();
        // Lock body highlight
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.roundRect(-5, -0.5, 10, 3, [2, 2, 0, 0]);
        ctx.fill();
        // Shackle
        ctx.strokeStyle = "#808080";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, -2, 5, Math.PI, 0);
        ctx.stroke();
        // Shackle highlight
        ctx.strokeStyle = "#A0A0A0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -2, 4, Math.PI + 0.3, -0.3);
        ctx.stroke();
        // Keyhole
        ctx.fillStyle = "#2A2828";
        ctx.beginPath();
        ctx.arc(0, 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1, 3.5, 2, 3);
        // Keyhole highlight
        ctx.fillStyle = "#404040";
        ctx.beginPath();
        ctx.arc(0, 2.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  } // end !nodeCacheValid

  if (_nodeSavedCtx) {
    ctx = _nodeSavedCtx;
  }
  if (nodeCache?.current.canvas) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(nodeCache.current.canvas, 0, 0);
    ctx.restore();
    ctx.setTransform(mapScale * dpr, 0, 0, mapScale * dpr, 0, 0);
  }
}
