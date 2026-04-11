import type { MutableRefObject } from "react";

import {
  drawRegionIcon,
  drawChallengeSigil,
} from "../../../../sprites/regionIconDrawing";
import type { RegionType } from "../../../../sprites/regionIconDrawing";
import type { LevelStars } from "../../../../types";
import type { LevelNode } from "../worldMapData";
import type { NodeCache } from "./types";

type RegionKey = RegionType;

export interface NodePalette {
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
}

export type ChallengePalette = NodePalette & {
  sigilGlow: string;
  sigilFill: string;
  sigilStroke: string;
  badgeFill: string;
  badgeStroke: string;
  badgeText: string;
};

const campaignPalettes: Record<RegionKey, NodePalette> = {
  desert: {
    border: "#DDBA73",
    edge: "rgba(240,218,160,0.32)",
    glowHover: "rgba(194,156,83,",
    glowSelected: "rgba(214,180,106,",
    innerDark: "#50381B",
    innerLight: "#876431",
    notch: "#C9A666",
    ringDark: "#4D351A",
    ringLight: "#BE9B5C",
    ringMid: "#82622F",
  },
  grassland: {
    border: "#A0B868",
    edge: "rgba(180,220,120,0.3)",
    glowHover: "rgba(110,188,88,",
    glowSelected: "rgba(140,210,110,",
    innerDark: "#3A5020",
    innerLight: "#5A7838",
    notch: "#90A850",
    ringDark: "#3A5020",
    ringLight: "#8AA858",
    ringMid: "#5A7838",
  },
  swamp: {
    border: "#92CDBF",
    edge: "rgba(176,236,222,0.33)",
    glowHover: "rgba(86,161,146,",
    glowSelected: "rgba(108,184,169,",
    innerDark: "#24443D",
    innerLight: "#446F66",
    notch: "#79B7AA",
    ringDark: "#21443D",
    ringLight: "#6FAFA1",
    ringMid: "#3D7467",
  },
  volcanic: {
    border: "#CF7658",
    edge: "rgba(233,154,126,0.3)",
    glowHover: "rgba(186,84,53,",
    glowSelected: "rgba(214,114,76,",
    innerDark: "#36140C",
    innerLight: "#6C2C20",
    notch: "#B85F42",
    ringDark: "#401409",
    ringLight: "#AA5238",
    ringMid: "#742C1C",
  },
  winter: {
    border: "#A2C9E8",
    edge: "rgba(186,218,244,0.33)",
    glowHover: "rgba(103,154,194,",
    glowSelected: "rgba(127,176,214,",
    innerDark: "#274158",
    innerLight: "#486C8C",
    notch: "#88B1D3",
    ringDark: "#233E57",
    ringLight: "#78A4C8",
    ringMid: "#43688A",
  },
};

const challengePalettes: Record<RegionKey, ChallengePalette> = {
  desert: {
    badgeFill: "rgba(132,93,32,0.9)",
    badgeStroke: "#FFD27A",
    badgeText: "#FFF1CA",
    border: "#FFD07A",
    edge: "rgba(255,228,165,0.35)",
    glowHover: "rgba(219,172,68,",
    glowSelected: "rgba(234,193,96,",
    innerDark: "#4A3418",
    innerLight: "#8B642D",
    notch: "#E2B35A",
    ringDark: "#4A3316",
    ringLight: "#D9AA52",
    ringMid: "#87622A",
    sigilFill: "#A9782D",
    sigilGlow: "rgba(229,185,86,",
    sigilStroke: "#FFE8AE",
  },
  grassland: {
    badgeFill: "rgba(33,95,48,0.9)",
    badgeStroke: "#A6F0AF",
    badgeText: "#E7FFD6",
    border: "#90E3A0",
    edge: "rgba(180,255,190,0.35)",
    glowHover: "rgba(86,190,103,",
    glowSelected: "rgba(110,215,120,",
    innerDark: "#183620",
    innerLight: "#2E6A39",
    notch: "#6CC77A",
    ringDark: "#193622",
    ringLight: "#63B86F",
    ringMid: "#2E6B3A",
    sigilFill: "#2E7F42",
    sigilGlow: "rgba(108,212,118,",
    sigilStroke: "#D2F7B0",
  },
  swamp: {
    badgeFill: "rgba(22,89,80,0.9)",
    badgeStroke: "#8FE5D8",
    badgeText: "#DBFFF8",
    border: "#7FD9CC",
    edge: "rgba(165,248,236,0.33)",
    glowHover: "rgba(72,170,152,",
    glowSelected: "rgba(90,196,178,",
    innerDark: "#163A35",
    innerLight: "#2A655D",
    notch: "#5AC7B8",
    ringDark: "#143833",
    ringLight: "#59AFA6",
    ringMid: "#27635C",
    sigilFill: "#2D7268",
    sigilGlow: "rgba(88,198,178,",
    sigilStroke: "#C8FFF1",
  },
  volcanic: {
    badgeFill: "rgba(120,20,10,0.9)",
    badgeStroke: "#FFB27B",
    badgeText: "#FFF3CC",
    border: "#E0744B",
    edge: "rgba(255,164,124,0.3)",
    glowHover: "rgba(255,90,40,",
    glowSelected: "rgba(255,120,60,",
    innerDark: "#32110C",
    innerLight: "#6A251A",
    notch: "#C8552B",
    ringDark: "#3D0C07",
    ringLight: "#B74A2E",
    ringMid: "#7E2716",
    sigilFill: "#9D2D19",
    sigilGlow: "rgba(255,108,48,",
    sigilStroke: "#FFD8A6",
  },
  winter: {
    badgeFill: "rgba(44,85,121,0.9)",
    badgeStroke: "#AAD9FF",
    badgeText: "#E8F6FF",
    border: "#A8D8FF",
    edge: "rgba(201,231,255,0.35)",
    glowHover: "rgba(89,160,214,",
    glowSelected: "rgba(112,184,235,",
    innerDark: "#1C3850",
    innerLight: "#3A6389",
    notch: "#7EBBE6",
    ringDark: "#1A334D",
    ringLight: "#71A8CF",
    ringMid: "#355E86",
    sigilFill: "#3A79A9",
    sigilGlow: "rgba(112,184,235,",
    sigilStroke: "#D5EEFF",
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
        h: displayH,
        hoveredLevel,
        selectedLevel,
        starsKey: nodeStarsKey,
        timeBucket: nodeTimeBucket,
        unlockedKey: nodeUnlockedKey,
        w: displayW,
      };
    }
  }

  if (!nodeCacheValid) {
    allLevels.forEach((level) => {
      const { x } = level;
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
          glowRadius
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
          0
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
          bTop + 1 + wave2 * 0.4
        );
        ctx.lineTo(flagPoleX + bW - 2, bTop + bH * 0.5 + wave3 * 0.3);
        ctx.lineTo(flagPoleX + bW, bTop + bH + wave2 * 0.4);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + bH - 1 + wave * 0.5,
          flagPoleX + 1.5,
          bTop + bH
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
          bTop + bH * 0.35 + wave2 * 0.3
        );
        ctx.lineTo(flagPoleX + bW, bTop + bH * 0.65 + wave2 * 0.3);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + bH * 0.65 + wave * 0.35,
          flagPoleX + 1.5,
          bTop + bH * 0.65
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
          bTop + 2 + wave2 * 0.3
        );
        ctx.lineTo(flagPoleX + bW - 3, bTop + 5 + wave2 * 0.3);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.3,
          bTop + 4 + wave * 0.3,
          flagPoleX + 1.5,
          bTop + 4
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
          bTop + 1 + wave2 * 0.4
        );
        ctx.lineTo(flagPoleX + bW - 2, bTop + bH * 0.5 + wave3 * 0.3);
        ctx.lineTo(flagPoleX + bW, bTop + bH + wave2 * 0.4);
        ctx.quadraticCurveTo(
          flagPoleX + bW * 0.4,
          bTop + bH - 1 + wave * 0.5,
          flagPoleX + 1.5,
          bTop + bH
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
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
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
          desert: {
            border: "#82622F",
            bot: "#322818",
            mid: "#2A2010",
            top: "#3A2A18",
          },
          grassland: {
            border: "#5A7838",
            bot: "#243018",
            mid: "#1E2A14",
            top: "#2A3A1A",
          },
          swamp: {
            border: "#3D7467",
            bot: "#182820",
            mid: "#142220",
            top: "#1A2A28",
          },
          volcanic: {
            border: "#742C1C",
            bot: "#2A1810",
            mid: "#24120E",
            top: "#301A14",
          },
          winter: {
            border: "#43688A",
            bot: "#182230",
            mid: "#141C28",
            top: "#1A2430",
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
          bannerTop + 3 + 1
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
          bannerTop + bannerH
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
          bannerTop + 3
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
          bannerTop + 3
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
            ? { fill: "#50E080", glow: "rgba(80,224,128,", stroke: "#30A858" }
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
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();

          if (earned) {
            const starGrad = ctx.createRadialGradient(
              sx - 1,
              starY - 1,
              0,
              sx,
              starY,
              outerR
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
        size + 2
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
        size - 5
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
        const iconScale = size / (isChallenge ? 26 : 24);
        ctx.scale(iconScale, iconScale);
        ctx.globalAlpha = 1;

        if (level.kind === "sandbox") {
          // Sandbox icon: ornate sandcastle with turrets, gate, and flag
          // Sand base mound — organic shape with gradient
          const baseGrad = ctx.createRadialGradient(0, 8, 1, 0, 9, 12);
          baseGrad.addColorStop(0, "#DCBA60");
          baseGrad.addColorStop(0.6, "#C89840");
          baseGrad.addColorStop(1, "#A07028");
          ctx.fillStyle = baseGrad;
          ctx.beginPath();
          ctx.ellipse(0, 8, 12, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
          // Base shadow
          ctx.fillStyle = "rgba(80,50,15,0.35)";
          ctx.beginPath();
          ctx.ellipse(0, 9.5, 10, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Left side turret
          const ltGrad = ctx.createLinearGradient(-10, -3, -5, 5);
          ltGrad.addColorStop(0, "#E8C85A");
          ltGrad.addColorStop(0.5, "#D4AA40");
          ltGrad.addColorStop(1, "#B88828");
          ctx.fillStyle = ltGrad;
          ctx.beginPath();
          ctx.moveTo(-10, 5);
          ctx.lineTo(-10, -2);
          ctx.lineTo(-5, -2);
          ctx.lineTo(-5, 5);
          ctx.closePath();
          ctx.fill();
          // Left turret shadow side
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.fillRect(-10, -2, 2.5, 7);
          // Left turret crenellations
          ctx.fillStyle = "#D4AA40";
          ctx.fillRect(-10.5, -4.5, 2, 2.5);
          ctx.fillRect(-7.5, -4.5, 2, 2.5);
          ctx.fillStyle = "#C89838";
          ctx.fillRect(-10.5, -4.5, 2, 1);
          ctx.fillRect(-7.5, -4.5, 2, 1);
          // Left turret window
          const lwGrad = ctx.createRadialGradient(-7.5, 1, 0, -7.5, 1, 1.5);
          lwGrad.addColorStop(0, "#FFE870");
          lwGrad.addColorStop(0.5, "#C88020");
          lwGrad.addColorStop(1, "#6B4010");
          ctx.fillStyle = lwGrad;
          ctx.beginPath();
          ctx.arc(-7.5, 0.5, 1.2, Math.PI, 0);
          ctx.lineTo(-6.3, 2.5);
          ctx.lineTo(-8.7, 2.5);
          ctx.closePath();
          ctx.fill();

          // Right side turret
          const rtGrad = ctx.createLinearGradient(5, -3, 10, 5);
          rtGrad.addColorStop(0, "#ECD060");
          rtGrad.addColorStop(0.5, "#D8B048");
          rtGrad.addColorStop(1, "#BC8C2C");
          ctx.fillStyle = rtGrad;
          ctx.beginPath();
          ctx.moveTo(5, 5);
          ctx.lineTo(5, -2);
          ctx.lineTo(10, -2);
          ctx.lineTo(10, 5);
          ctx.closePath();
          ctx.fill();
          // Right turret highlight
          ctx.fillStyle = "rgba(255,240,180,0.2)";
          ctx.fillRect(7.5, -2, 2.5, 7);
          // Right turret crenellations
          ctx.fillStyle = "#D8B048";
          ctx.fillRect(5.5, -4.5, 2, 2.5);
          ctx.fillRect(8.5, -4.5, 2, 2.5);
          ctx.fillStyle = "#CCA040";
          ctx.fillRect(5.5, -4.5, 2, 1);
          ctx.fillRect(8.5, -4.5, 2, 1);
          // Right turret window
          const rwGrad = ctx.createRadialGradient(7.5, 1, 0, 7.5, 1, 1.5);
          rwGrad.addColorStop(0, "#FFE870");
          rwGrad.addColorStop(0.5, "#C88020");
          rwGrad.addColorStop(1, "#6B4010");
          ctx.fillStyle = rwGrad;
          ctx.beginPath();
          ctx.arc(7.5, 0.5, 1.2, Math.PI, 0);
          ctx.lineTo(8.7, 2.5);
          ctx.lineTo(6.3, 2.5);
          ctx.closePath();
          ctx.fill();

          // Central keep — main tower body
          const keepGrad = ctx.createLinearGradient(-5, -6, 5, 6);
          keepGrad.addColorStop(0, "#F0D468");
          keepGrad.addColorStop(0.3, "#E4C050");
          keepGrad.addColorStop(0.7, "#D0A438");
          keepGrad.addColorStop(1, "#B88828");
          ctx.fillStyle = keepGrad;
          ctx.beginPath();
          ctx.moveTo(-5, 6);
          ctx.lineTo(-5, -5);
          ctx.lineTo(5, -5);
          ctx.lineTo(5, 6);
          ctx.closePath();
          ctx.fill();
          // Keep shadow side (left)
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(-5, -5, 3, 11);
          // Keep highlight side (right)
          ctx.fillStyle = "rgba(255,240,190,0.15)";
          ctx.fillRect(2, -5, 3, 11);

          // Brick/stone texture lines on keep
          ctx.strokeStyle = "rgba(120,80,30,0.2)";
          ctx.lineWidth = 0.4;
          for (let row = 0; row < 5; row++) {
            const ry = -4 + row * 2.2;
            ctx.beginPath();
            ctx.moveTo(-4.5, ry);
            ctx.lineTo(4.5, ry);
            ctx.stroke();
            const off = row % 2 === 0 ? 0 : 2.2;
            for (let col = 0; col < 4; col++) {
              const cx = -4.5 + off + col * 3;
              if (cx > -5 && cx < 5) {
                ctx.beginPath();
                ctx.moveTo(cx, ry);
                ctx.lineTo(cx, ry + 2.2);
                ctx.stroke();
              }
            }
          }

          // Central crenellations (battlements) — 5 merlons with depth
          const merlonPositions = [-4.2, -2.1, 0, 2.1, 4.2];
          for (const mx of merlonPositions) {
            // Merlon shadow
            ctx.fillStyle = "#B08830";
            ctx.fillRect(mx - 1.3, -8, 2.6, 3);
            // Merlon body
            const mGrad = ctx.createLinearGradient(mx - 1.3, -8, mx + 1.3, -5);
            mGrad.addColorStop(0, "#E8C858");
            mGrad.addColorStop(1, "#D0A840");
            ctx.fillStyle = mGrad;
            ctx.fillRect(mx - 1.2, -8, 2.4, 3);
            // Merlon top highlight
            ctx.fillStyle = "rgba(255,240,180,0.4)";
            ctx.fillRect(mx - 1.2, -8, 2.4, 0.6);
          }

          // Gate — arched doorway with portcullis
          ctx.fillStyle = "#5A3018";
          ctx.beginPath();
          ctx.arc(0, 3, 2.8, Math.PI, 0);
          ctx.lineTo(2.8, 6);
          ctx.lineTo(-2.8, 6);
          ctx.closePath();
          ctx.fill();
          // Gate interior glow
          const gateGlow = ctx.createRadialGradient(0, 3, 0, 0, 4, 3);
          gateGlow.addColorStop(0, "rgba(255,200,80,0.35)");
          gateGlow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gateGlow;
          ctx.beginPath();
          ctx.arc(0, 3, 2.5, Math.PI, 0);
          ctx.lineTo(2.5, 6);
          ctx.lineTo(-2.5, 6);
          ctx.closePath();
          ctx.fill();
          // Portcullis bars
          ctx.strokeStyle = "rgba(90,50,20,0.6)";
          ctx.lineWidth = 0.4;
          for (let px = -2; px <= 2; px += 1) {
            ctx.beginPath();
            ctx.moveTo(px, 0.8);
            ctx.lineTo(px, 6);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.moveTo(-2.5, 2.5);
          ctx.lineTo(2.5, 2.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-2.5, 4.5);
          ctx.lineTo(2.5, 4.5);
          ctx.stroke();
          // Gate arch outline
          ctx.strokeStyle = "#8A6030";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(0, 3, 2.8, Math.PI, 0);
          ctx.stroke();
          // Keystone at top of arch
          ctx.fillStyle = "#DCC060";
          ctx.beginPath();
          ctx.moveTo(-1, 0.2);
          ctx.lineTo(0, -0.4);
          ctx.lineTo(1, 0.2);
          ctx.lineTo(0.6, 1);
          ctx.lineTo(-0.6, 1);
          ctx.closePath();
          ctx.fill();

          // Wall connecting turrets to keep
          ctx.fillStyle = "rgba(200,160,60,0.3)";
          ctx.fillRect(-10, 2, 5, 3);
          ctx.fillRect(5, 2, 5, 3);

          // Sand grain particles scattered around base
          const grains = [
            [-8, 10, 0.6],
            [-5, 11, 0.5],
            [6, 10.5, 0.55],
            [9, 9, 0.45],
            [-11, 8, 0.4],
            [3, 11, 0.5],
            [-3, 11.5, 0.4],
            [11, 7, 0.35],
            [-9, 11, 0.35],
            [7, 11, 0.4],
            [-1, 12, 0.35],
            [5, 12, 0.3],
          ] as const;
          for (const [gx, gy, gr] of grains) {
            ctx.fillStyle = "rgba(200,160,60,0.5)";
            ctx.beginPath();
            ctx.arc(gx, gy, gr, 0, Math.PI * 2);
            ctx.fill();
          }

          // Overall shadow at keep base
          const baseShadow = ctx.createLinearGradient(0, 4, 0, 7);
          baseShadow.addColorStop(0, "rgba(0,0,0,0)");
          baseShadow.addColorStop(1, "rgba(0,0,0,0.15)");
          ctx.fillStyle = baseShadow;
          ctx.fillRect(-5, 4, 10, 3);

          // Outer edge outlines for keep and turrets
          ctx.strokeStyle = "rgba(140,90,30,0.35)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(-5, -5, 10, 11);
          ctx.strokeRect(-10, -2, 5, 7);
          ctx.strokeRect(5, -2, 5, 7);

          // Flag on central tower
          const wave = Math.sin(time * 3.5) * 1.5;
          const wave2 = Math.sin(time * 3.5 + 1) * 1;
          // Flag pole
          const fpGrad = ctx.createLinearGradient(-0.8, 0, 1.2, 0);
          fpGrad.addColorStop(0, "#6A4018");
          fpGrad.addColorStop(0.4, "#A87840");
          fpGrad.addColorStop(0.6, "#C08850");
          fpGrad.addColorStop(1, "#6A4018");
          ctx.fillStyle = fpGrad;
          ctx.fillRect(-0.5, -14, 1.5, 6.5);
          // Flag pole finial — golden orb
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(0.25, -14.5, 1.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFF0A0";
          ctx.beginPath();
          ctx.arc(-0.1, -15, 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#B89010";
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.arc(0.25, -14.5, 1.4, 0, Math.PI * 2);
          ctx.stroke();
          // Flag banner — swallowtail
          ctx.fillStyle = "#E04820";
          ctx.beginPath();
          ctx.moveTo(1, -14);
          ctx.quadraticCurveTo(4, -13.5 + wave * 0.4, 8, -13.5 + wave2 * 0.6);
          ctx.lineTo(7, -11.5 + wave2 * 0.5);
          ctx.lineTo(8, -9.5 + wave2 * 0.6);
          ctx.quadraticCurveTo(4, -10 + wave * 0.4, 1, -10);
          ctx.closePath();
          ctx.fill();
          // Flag highlight stripe
          ctx.fillStyle = "rgba(255,180,80,0.35)";
          ctx.beginPath();
          ctx.moveTo(1, -13.8);
          ctx.quadraticCurveTo(4, -13.3 + wave * 0.3, 7, -13.2 + wave2 * 0.4);
          ctx.lineTo(7, -12.5 + wave2 * 0.4);
          ctx.quadraticCurveTo(4, -12.6 + wave * 0.3, 1, -12.8);
          ctx.closePath();
          ctx.fill();
          // Flag dark stripe
          ctx.fillStyle = "rgba(120,20,0,0.3)";
          ctx.beginPath();
          ctx.moveTo(1, -11);
          ctx.quadraticCurveTo(4, -10.8 + wave * 0.3, 7.5, -10.5 + wave2 * 0.4);
          ctx.lineTo(7.8, -9.8 + wave2 * 0.5);
          ctx.quadraticCurveTo(4, -10.2 + wave * 0.3, 1, -10.2);
          ctx.closePath();
          ctx.fill();
          // Flag outline
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(1, -14);
          ctx.quadraticCurveTo(4, -13.5 + wave * 0.4, 8, -13.5 + wave2 * 0.6);
          ctx.lineTo(7, -11.5 + wave2 * 0.5);
          ctx.lineTo(8, -9.5 + wave2 * 0.6);
          ctx.quadraticCurveTo(4, -10 + wave * 0.4, 1, -10);
          ctx.closePath();
          ctx.stroke();
          // Star emblem on flag
          ctx.fillStyle = "#FFE060";
          ctx.globalAlpha = 0.9;
          const sx = 4.5;
          const sy = -12 + wave * 0.3;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? 1.5 : 0.6;
            const spx = sx + Math.cos(a) * r;
            const spy = sy + Math.sin(a) * r;
            if (i === 0) {
              ctx.moveTo(spx, spy);
            } else {
              ctx.lineTo(spx, spy);
            }
          }
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;

          // Sunlit rim highlight on turret tops
          ctx.strokeStyle = "rgba(255,240,180,0.3)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-10, -2);
          ctx.lineTo(-5, -2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(5, -2);
          ctx.lineTo(10, -2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-5, -5);
          ctx.lineTo(5, -5);
          ctx.stroke();
        } else if (isChallenge) {
          // Animated glow behind sigil
          const challengeGlow = 0.35 + Math.sin(time * 4 + x * 0.03) * 0.08;
          ctx.fillStyle = `${challengePalette.sigilGlow}${challengeGlow})`;
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();

          drawChallengeSigil(ctx, level.region as RegionType);
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
            0
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
            pennantTop + 5 + pWave * 0.8
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
            pennantTop + 4.5 + pWave * 0.6
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
            pennantTop + 5 + pWave * 0.8
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
