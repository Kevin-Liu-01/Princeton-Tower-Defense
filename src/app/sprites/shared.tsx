"use client";

import React, { useRef, useCallback } from "react";

import { ENEMY_DATA, ENEMY_CATEGORY_ACCENTS } from "../constants";
import { drawHazardSprite } from "../rendering/hazards";
import { drawSpecialBuildingSprite } from "../rendering/towers/specialBuildings";
import type {
  EnemyType as EType,
  SpecialTowerType,
  HazardType,
  EnemyCategory,
  TowerType,
  SpellType,
} from "../types";
import {
  setupSpriteCanvas,
  useSpriteTicker,
  SPRITE_PAD,
  spriteContainerStyle,
  spriteCanvasStyle,
} from "./hooks";

// =============================================================================
// SPRITE FRAME THEME
// =============================================================================

export interface SpriteFrameTheme {
  background: string;
  border: string;
  glow: string;
}

import { hexToRgba } from "../utils/colorUtils";

export function buildThemeFromAccent(accentHex: string): SpriteFrameTheme {
  return {
    background: `radial-gradient(circle at 50% 50%, ${hexToRgba(accentHex, 0.28)}, ${hexToRgba(accentHex, 0.18)} 42%, rgba(14,14,22,0.96) 100%)`,
    border: hexToRgba(accentHex, 0.72),
    glow: hexToRgba(accentHex, 0.42),
  };
}

// =============================================================================
// TOWER SPRITE FRAME THEMES
// =============================================================================

export const TOWER_SPRITE_FRAME_THEME: Record<TowerType, SpriteFrameTheme> = {
  arch: buildThemeFromAccent("#60a5fa"),
  cannon: buildThemeFromAccent("#f87171"),
  club: buildThemeFromAccent("#f59e0b"),
  lab: buildThemeFromAccent("#facc15"),
  library: buildThemeFromAccent("#67e8f9"),
  mortar: buildThemeFromAccent("#fb923c"),
  station: buildThemeFromAccent("#a78bfa"),
};

// =============================================================================
// ENEMY CATEGORY SPRITE FRAME THEMES
// =============================================================================

export const ENEMY_CATEGORY_SPRITE_FRAME_THEME: Record<
  EnemyCategory,
  SpriteFrameTheme
> = Object.fromEntries(
  (Object.keys(ENEMY_CATEGORY_ACCENTS) as EnemyCategory[]).map((key) => [
    key,
    buildThemeFromAccent(ENEMY_CATEGORY_ACCENTS[key]),
  ])
) as Record<EnemyCategory, SpriteFrameTheme>;

// =============================================================================
// SPELL SPRITE FRAME THEMES
// =============================================================================

export const SPELL_SPRITE_FRAME_THEME: Record<SpellType, SpriteFrameTheme> = {
  fireball: buildThemeFromAccent("#fb923c"),
  freeze: buildThemeFromAccent("#67e8f9"),
  hex_ward: buildThemeFromAccent("#c084fc"),
  lightning: buildThemeFromAccent("#facc15"),
  payday: buildThemeFromAccent("#34d399"),
  reinforcements: buildThemeFromAccent("#a78bfa"),
};

// =============================================================================
// THEME LOOKUP HELPERS
// =============================================================================

export function getEnemySpriteFrameTheme(type: EType): SpriteFrameTheme {
  const category = ENEMY_DATA[type].category || "campus";
  return ENEMY_CATEGORY_SPRITE_FRAME_THEME[category];
}

// =============================================================================
// SPECIAL TOWER SPRITE THEMES
// =============================================================================

export const SPECIAL_TOWER_SPRITE_THEME: Record<
  SpecialTowerType,
  SpriteFrameTheme
> = {
  barracks: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(254,202,202,0.25), rgba(158,42,42,0.2) 42%, rgba(74,22,22,0.96) 100%)",
    border: "rgba(248,113,113,0.72)",
    glow: "rgba(248,113,113,0.4)",
  },
  beacon: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(165,243,252,0.28), rgba(18,92,112,0.18) 42%, rgba(12,48,60,0.96) 100%)",
    border: "rgba(34,211,238,0.7)",
    glow: "rgba(34,211,238,0.4)",
  },
  chrono_relay: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(199,210,254,0.28), rgba(91,94,197,0.2) 42%, rgba(38,34,96,0.96) 100%)",
    border: "rgba(129,140,248,0.72)",
    glow: "rgba(129,140,248,0.42)",
  },
  sentinel_nexus: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(254,205,211,0.28), rgba(160,46,78,0.2) 42%, rgba(78,24,46,0.96) 100%)",
    border: "rgba(251,113,133,0.72)",
    glow: "rgba(251,113,133,0.4)",
  },
  shrine: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(187,247,208,0.28), rgba(20,105,70,0.18) 42%, rgba(12,64,44,0.96) 100%)",
    border: "rgba(34,197,94,0.7)",
    glow: "rgba(34,197,94,0.38)",
  },
  sunforge_orrery: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(254,215,170,0.27), rgba(174,87,30,0.2) 42%, rgba(94,38,20,0.96) 100%)",
    border: "rgba(251,146,60,0.74)",
    glow: "rgba(251,146,60,0.43)",
  },
  vault: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(254,240,138,0.3), rgba(120,80,18,0.18) 42%, rgba(60,41,12,0.95) 100%)",
    border: "rgba(250,204,21,0.7)",
    glow: "rgba(250,204,21,0.42)",
  },
};

// =============================================================================
// HAZARD SPRITE THEMES
// =============================================================================

type HazardSpriteType =
  | "poison_fog"
  | "deep_water"
  | "maelstrom"
  | "storm_field"
  | "quicksand"
  | "ice_sheet"
  | "ice_spikes"
  | "lava_geyser";

export const HAZARD_SPRITE_THEME: Partial<
  Record<HazardType, SpriteFrameTheme>
> = {
  deep_water: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(191,219,254,0.28), rgba(35,96,176,0.18) 42%, rgba(17,52,98,0.96) 100%)",
    border: "rgba(96,165,250,0.7)",
    glow: "rgba(96,165,250,0.42)",
  },
  ice_sheet: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(224,242,254,0.28), rgba(99,159,214,0.18) 42%, rgba(32,68,98,0.96) 100%)",
    border: "rgba(125,211,252,0.72)",
    glow: "rgba(125,211,252,0.4)",
  },
  ice_spikes: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(219,234,254,0.28), rgba(90,130,218,0.18) 42%, rgba(32,58,112,0.96) 100%)",
    border: "rgba(96,165,250,0.72)",
    glow: "rgba(96,165,250,0.43)",
  },
  lava_geyser: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(254,215,170,0.28), rgba(218,99,41,0.18) 42%, rgba(110,37,22,0.96) 100%)",
    border: "rgba(251,146,60,0.74)",
    glow: "rgba(251,146,60,0.45)",
  },
  maelstrom: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(186,230,253,0.27), rgba(34,124,159,0.18) 42%, rgba(12,56,77,0.96) 100%)",
    border: "rgba(56,189,248,0.72)",
    glow: "rgba(56,189,248,0.42)",
  },
  poison_fog: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(187,247,208,0.28), rgba(28,120,71,0.18) 42%, rgba(14,66,42,0.96) 100%)",
    border: "rgba(74,222,128,0.7)",
    glow: "rgba(74,222,128,0.4)",
  },
  quicksand: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(254,249,195,0.27), rgba(188,146,47,0.18) 42%, rgba(108,78,28,0.96) 100%)",
    border: "rgba(250,204,21,0.72)",
    glow: "rgba(250,204,21,0.42)",
  },
  storm_field: {
    background:
      "radial-gradient(circle at 50% 50%, rgba(219,234,254,0.26), rgba(76,107,202,0.18) 42%, rgba(31,43,100,0.96) 100%)",
    border: "rgba(125,211,252,0.72)",
    glow: "rgba(125,211,252,0.42)",
  },
};

// =============================================================================
// FRAMED SPRITE COMPONENT
// =============================================================================

export const FramedSprite: React.FC<{
  size: number;
  theme: SpriteFrameTheme;
  className?: string;
  children: React.ReactNode;
}> = ({ size, theme, className, children }) => (
  <div
    className={`relative rounded-xl shrink-0 ${className || ""}`}
    style={{
      background: theme.background,
      border: `1.5px solid ${theme.border}`,
      boxShadow: `0 0 20px ${theme.glow}, inset 0 0 18px rgba(6,6,10,0.72)`,
      height: size,
      width: size,
    }}
  >
    <div
      className="absolute inset-[2px] rounded-[10px] pointer-events-none"
      style={{ border: "1px solid rgba(255,255,255,0.14)" }}
    />
    <div
      className="absolute inset-[2px] rounded-[10px] pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 38%, rgba(0,0,0,0.25) 90%)",
      }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      {children}
    </div>
  </div>
);

// =============================================================================
// SPECIAL TOWER SPRITE COMPONENT (canvas-based, uses in-game renderer)
// =============================================================================

export const SpecialTowerSprite: React.FC<{
  type: SpecialTowerType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 48, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = Math.ceil(size * SPRITE_PAD);

  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = setupSpriteCanvas(canvas, canvasSize, canvasSize);
      if (!ctx) {
        return;
      }

      const offset = (canvasSize - size) / 2;
      ctx.translate(offset, offset);

      const t = animated ? time * 0.08 : 0;
      drawSpecialBuildingSprite(
        ctx,
        size / 2,
        size * 0.62,
        size * 0.45,
        type,
        t
      );
    },
    [type, size, canvasSize, animated]
  );

  useSpriteTicker(animated, 50, render);

  return (
    <div style={spriteContainerStyle(size, size)}>
      <canvas
        ref={canvasRef}
        style={spriteCanvasStyle(canvasSize, canvasSize)}
        aria-label={`${type} special tower sprite`}
      />
    </div>
  );
};

// =============================================================================
// HAZARD SPRITE COMPONENT (canvas-based, uses in-game renderer)
// =============================================================================

export const HazardSprite: React.FC<{
  type: HazardType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 48, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = Math.ceil(size * SPRITE_PAD);

  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = setupSpriteCanvas(canvas, canvasSize, canvasSize);
      if (!ctx) {
        return;
      }

      const offset = (canvasSize - size) / 2;
      ctx.translate(offset, offset);

      const t = animated ? time * 0.08 : 0;
      drawHazardSprite(ctx, size / 2, size * 0.68, size * 0.8, type, t);
    },
    [type, size, canvasSize, animated]
  );

  useSpriteTicker(animated, 50, render);

  return (
    <div style={spriteContainerStyle(size, size)}>
      <canvas
        ref={canvasRef}
        style={spriteCanvasStyle(canvasSize, canvasSize)}
        aria-label={`${type} hazard sprite`}
      />
    </div>
  );
};
