"use client";

import React from "react";
import type { EnemyType as EType, SpecialTowerType, HazardType, EnemyCategory, TowerType, SpellType } from "../types";
import { ENEMY_DATA } from "../constants";

// =============================================================================
// SPRITE FRAME THEME
// =============================================================================

export type SpriteFrameTheme = {
  background: string;
  border: string;
  glow: string;
};

import { hexToRgba } from "../utils/colorUtils";

export function buildThemeFromAccent(accentHex: string): SpriteFrameTheme {
  return {
    background: `radial-gradient(circle at 28% 24%, ${hexToRgba(accentHex, 0.28)}, ${hexToRgba(accentHex, 0.18)} 42%, rgba(14,14,22,0.96) 100%)`,
    border: hexToRgba(accentHex, 0.72),
    glow: hexToRgba(accentHex, 0.42),
  };
}

// =============================================================================
// TOWER SPRITE FRAME THEMES
// =============================================================================

export const TOWER_SPRITE_FRAME_THEME: Record<TowerType, SpriteFrameTheme> = {
  station: buildThemeFromAccent("#a78bfa"),
  cannon: buildThemeFromAccent("#f87171"),
  library: buildThemeFromAccent("#67e8f9"),
  lab: buildThemeFromAccent("#facc15"),
  arch: buildThemeFromAccent("#60a5fa"),
  club: buildThemeFromAccent("#f59e0b"),
  mortar: buildThemeFromAccent("#fb923c"),
};

// =============================================================================
// ENEMY CATEGORY SPRITE FRAME THEMES
// =============================================================================

export const ENEMY_CATEGORY_SPRITE_FRAME_THEME: Record<EnemyCategory, SpriteFrameTheme> = {
  academic: buildThemeFromAccent("#c084fc"),
  campus: buildThemeFromAccent("#f59e0b"),
  ranged: buildThemeFromAccent("#4ade80"),
  flying: buildThemeFromAccent("#22d3ee"),
  boss: buildThemeFromAccent("#f87171"),
  nature: buildThemeFromAccent("#34d399"),
  swarm: buildThemeFromAccent("#facc15"),
};

// =============================================================================
// SPELL SPRITE FRAME THEMES
// =============================================================================

export const SPELL_SPRITE_FRAME_THEME: Record<SpellType, SpriteFrameTheme> = {
  fireball: buildThemeFromAccent("#fb923c"),
  lightning: buildThemeFromAccent("#facc15"),
  freeze: buildThemeFromAccent("#67e8f9"),
  hex_ward: buildThemeFromAccent("#c084fc"),
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

export const SPECIAL_TOWER_SPRITE_THEME: Record<SpecialTowerType, SpriteFrameTheme> = {
  vault: {
    background: "radial-gradient(circle at 28% 24%, rgba(254,240,138,0.3), rgba(120,80,18,0.18) 42%, rgba(60,41,12,0.95) 100%)",
    border: "rgba(250,204,21,0.7)",
    glow: "rgba(250,204,21,0.42)",
  },
  beacon: {
    background: "radial-gradient(circle at 28% 24%, rgba(165,243,252,0.28), rgba(18,92,112,0.18) 42%, rgba(12,48,60,0.96) 100%)",
    border: "rgba(34,211,238,0.7)",
    glow: "rgba(34,211,238,0.4)",
  },
  shrine: {
    background: "radial-gradient(circle at 28% 24%, rgba(187,247,208,0.28), rgba(20,105,70,0.18) 42%, rgba(12,64,44,0.96) 100%)",
    border: "rgba(34,197,94,0.7)",
    glow: "rgba(34,197,94,0.38)",
  },
  barracks: {
    background: "radial-gradient(circle at 28% 24%, rgba(254,202,202,0.25), rgba(158,42,42,0.2) 42%, rgba(74,22,22,0.96) 100%)",
    border: "rgba(248,113,113,0.72)",
    glow: "rgba(248,113,113,0.4)",
  },
  chrono_relay: {
    background: "radial-gradient(circle at 28% 24%, rgba(199,210,254,0.28), rgba(91,94,197,0.2) 42%, rgba(38,34,96,0.96) 100%)",
    border: "rgba(129,140,248,0.72)",
    glow: "rgba(129,140,248,0.42)",
  },
  sentinel_nexus: {
    background: "radial-gradient(circle at 28% 24%, rgba(254,205,211,0.28), rgba(160,46,78,0.2) 42%, rgba(78,24,46,0.96) 100%)",
    border: "rgba(251,113,133,0.72)",
    glow: "rgba(251,113,133,0.4)",
  },
  sunforge_orrery: {
    background: "radial-gradient(circle at 28% 24%, rgba(254,215,170,0.27), rgba(174,87,30,0.2) 42%, rgba(94,38,20,0.96) 100%)",
    border: "rgba(251,146,60,0.74)",
    glow: "rgba(251,146,60,0.43)",
  },
};

// =============================================================================
// HAZARD SPRITE THEMES
// =============================================================================

type HazardSpriteType = "poison_fog" | "deep_water" | "maelstrom" | "storm_field" | "quicksand" | "ice_sheet" | "ice_spikes" | "lava_geyser";

export const HAZARD_SPRITE_THEME: Partial<Record<HazardType, SpriteFrameTheme>> = {
  poison_fog: {
    background: "radial-gradient(circle at 28% 24%, rgba(187,247,208,0.28), rgba(28,120,71,0.18) 42%, rgba(14,66,42,0.96) 100%)",
    border: "rgba(74,222,128,0.7)",
    glow: "rgba(74,222,128,0.4)",
  },
  deep_water: {
    background: "radial-gradient(circle at 28% 24%, rgba(191,219,254,0.28), rgba(35,96,176,0.18) 42%, rgba(17,52,98,0.96) 100%)",
    border: "rgba(96,165,250,0.7)",
    glow: "rgba(96,165,250,0.42)",
  },
  maelstrom: {
    background: "radial-gradient(circle at 28% 24%, rgba(186,230,253,0.27), rgba(34,124,159,0.18) 42%, rgba(12,56,77,0.96) 100%)",
    border: "rgba(56,189,248,0.72)",
    glow: "rgba(56,189,248,0.42)",
  },
  storm_field: {
    background: "radial-gradient(circle at 28% 24%, rgba(219,234,254,0.26), rgba(76,107,202,0.18) 42%, rgba(31,43,100,0.96) 100%)",
    border: "rgba(125,211,252,0.72)",
    glow: "rgba(125,211,252,0.42)",
  },
  quicksand: {
    background: "radial-gradient(circle at 28% 24%, rgba(254,249,195,0.27), rgba(188,146,47,0.18) 42%, rgba(108,78,28,0.96) 100%)",
    border: "rgba(250,204,21,0.72)",
    glow: "rgba(250,204,21,0.42)",
  },
  ice_sheet: {
    background: "radial-gradient(circle at 28% 24%, rgba(224,242,254,0.28), rgba(99,159,214,0.18) 42%, rgba(32,68,98,0.96) 100%)",
    border: "rgba(125,211,252,0.72)",
    glow: "rgba(125,211,252,0.4)",
  },
  ice_spikes: {
    background: "radial-gradient(circle at 28% 24%, rgba(219,234,254,0.28), rgba(90,130,218,0.18) 42%, rgba(32,58,112,0.96) 100%)",
    border: "rgba(96,165,250,0.72)",
    glow: "rgba(96,165,250,0.43)",
  },
  lava_geyser: {
    background: "radial-gradient(circle at 28% 24%, rgba(254,215,170,0.28), rgba(218,99,41,0.18) 42%, rgba(110,37,22,0.96) 100%)",
    border: "rgba(251,146,60,0.74)",
    glow: "rgba(251,146,60,0.45)",
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
    className={`relative overflow-hidden rounded-xl shrink-0 ${className || ""}`}
    style={{
      width: size,
      height: size,
      background: theme.background,
      border: `1.5px solid ${theme.border}`,
      boxShadow: `0 0 20px ${theme.glow}, inset 0 0 18px rgba(6,6,10,0.72)`,
    }}
  >
    <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.14)" }} />
    <div
      className="absolute inset-[2px] rounded-[10px] pointer-events-none"
      style={{
        background: "radial-gradient(circle at 26% 22%, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 38%, rgba(0,0,0,0.25) 90%)",
      }}
    />
    <div className="absolute inset-0 flex items-center justify-center">{children}</div>
  </div>
);

// =============================================================================
// SVG SPRITE SHELL (for special towers and hazards)
// =============================================================================

export const SpriteShell: React.FC<{
  size: number;
  background: string;
  border: string;
  glow: string;
  children: React.ReactNode;
}> = ({ size, background, border, glow, children }) => (
  <div
    className="relative overflow-hidden rounded-xl shrink-0"
    style={{
      width: size,
      height: size,
      background,
      border: `1.5px solid ${border}`,
      boxShadow: `0 0 20px ${glow}, inset 0 0 18px rgba(6,6,10,0.72)`,
    }}
  >
    <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.14)" }} />
    <div
      className="absolute inset-[2px] rounded-[10px] pointer-events-none"
      style={{
        background: "radial-gradient(circle at 26% 22%, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 38%, rgba(0,0,0,0.25) 90%)",
      }}
    />
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <ellipse cx="32" cy="50" rx="17" ry="5.8" fill="rgba(0,0,0,0.36)" />
      <circle cx="22" cy="18" r="18" fill="rgba(255,255,255,0.09)" />
      <g transform="translate(0 -1)">{children}</g>
    </svg>
  </div>
);

// =============================================================================
// SPECIAL TOWER GLYPH
// =============================================================================

export function renderSpecialTowerGlyph(type: SpecialTowerType): React.ReactNode {
  switch (type) {
    case "vault":
      return (
        <>
          <rect x="16" y="42" width="32" height="5" rx="2.5" fill="#3f2a0e" />
          <rect x="16" y="23" width="32" height="21" rx="5" fill="#5e4217" stroke="#f59e0b" strokeWidth="1.8" />
          <rect x="15" y="19" width="34" height="8" rx="3" fill="#9a6b23" stroke="#fcd34d" strokeWidth="1.4" />
          <rect x="18" y="27" width="28" height="14" rx="3.5" fill="#6b4a18" />
          <circle cx="32" cy="34" r="5.5" fill="#2f1f09" stroke="#fcd34d" strokeWidth="1.4" />
          <rect x="31" y="34" width="2" height="7.5" rx="1" fill="#fcd34d" />
          <circle cx="44.5" cy="18.5" r="2.2" fill="#fef3c7" />
          <path d="M44.5 14.8 L45.4 17.4 L48 18.5 L45.4 19.6 L44.5 22.2 L43.6 19.6 L41 18.5 L43.6 17.4 Z" fill="#fde68a" />
        </>
      );
    case "beacon":
      return (
        <g transform="translate(0 10)">
          <ellipse cx="32" cy="44" rx="15" ry="4.4" fill="rgba(6,182,212,0.22)" />
          <rect x="26.5" y="18" width="11" height="26" rx="3" fill="#155e75" stroke="#67e8f9" strokeWidth="1.6" />
          <polygon points="32,10 38.2,20 25.8,20" fill="#a5f3fc" stroke="#e0f2fe" strokeWidth="1.2" />
          <circle cx="32" cy="13.4" r="4.2" fill="#67e8f9" />
          <circle cx="32" cy="13.4" r="10" fill="none" stroke="rgba(103,232,249,0.75)" strokeWidth="1.5" strokeDasharray="2.4 2.6" />
          <circle cx="32" cy="13.4" r="15" fill="none" stroke="rgba(103,232,249,0.35)" strokeWidth="1.2" />
          <path d="M22 30 L42 30" stroke="#a5f3fc" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    case "shrine":
      return (
        <>
          <rect x="15" y="42" width="34" height="5" rx="2.5" fill="#0f3f2c" />
          <rect x="18" y="25" width="7" height="18" rx="2" fill="#166534" stroke="#86efac" strokeWidth="1.1" />
          <rect x="39" y="25" width="7" height="18" rx="2" fill="#166534" stroke="#86efac" strokeWidth="1.1" />
          <path d="M20 24 Q32 15 44 24" fill="none" stroke="#86efac" strokeWidth="1.5" />
          <polygon points="32,15 38,24 32,33 26,24" fill="#86efac" stroke="#dcfce7" strokeWidth="1.3" />
          <circle cx="32" cy="23.8" r="12" fill="none" stroke="rgba(134,239,172,0.38)" strokeWidth="1.3" />
          <circle cx="32" cy="23.8" r="2.1" fill="#dcfce7" />
        </>
      );
    case "barracks":
      return (
        <>
          <rect x="14" y="42" width="36" height="5" rx="2.5" fill="#3f1616" />
          <rect x="14" y="24" width="36" height="19" rx="4" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.6" />
          <path d="M14 24 L18 20 L22 24 L26 20 L30 24 L34 20 L38 24 L42 20 L46 24 L50 20 L50 24 Z" fill="#991b1b" />
          <rect x="27" y="31" width="10" height="12" rx="2.5" fill="#450a0a" stroke="#fecaca" strokeWidth="1" />
          <path d="M20 41 L24 31 M44 41 L40 31" stroke="#fecaca" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M32 31 L32 21" stroke="#fca5a5" strokeWidth="1.3" />
          <polygon points="32,20 38,23 32,26" fill="#f87171" />
        </>
      );
    case "chrono_relay":
      return (
        <>
          <circle cx="32" cy="31" r="17" fill="none" stroke="#818cf8" strokeWidth="1.8" />
          <circle cx="32" cy="31" r="12" fill="none" stroke="#c7d2fe" strokeWidth="1.3" />
          <polygon points="32,14 42,31 32,48 22,31" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="1.4" />
          <circle cx="32" cy="31" r="5.5" fill="#1e1b4b" stroke="#a5b4fc" strokeWidth="1.2" />
          <path d="M32 31 L32 23 M32 31 L38 34.5" stroke="#e0e7ff" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M32 14 L32 11 M49 31 L52 31 M15 31 L12 31 M32 48 L32 51" stroke="#a5b4fc" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="45" cy="19" r="1.8" fill="#e0e7ff" />
        </>
      );
    case "sentinel_nexus":
      return (
        <>
          <circle cx="32" cy="31" r="17" fill="none" stroke="#fb7185" strokeWidth="1.8" />
          <circle cx="32" cy="31" r="10" fill="none" stroke="#fecdd3" strokeWidth="1.2" />
          <path d="M32 10 L32 17 M32 45 L32 52 M11 31 L18 31 M46 31 L53 31" stroke="#fda4af" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="32" cy="31" r="4.2" fill="#9f1239" stroke="#ffe4e6" strokeWidth="1.1" />
          <path d="M36.5 20 L30.8 30.8 L35.4 30.8 L28.8 42" stroke="#ffe4e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21 Q32 14 43 21" fill="none" stroke="rgba(251,113,133,0.5)" strokeWidth="1.2" />
        </>
      );
    case "sunforge_orrery":
      return (
        <>
          <circle cx="32" cy="31" r="7.2" fill="#fb923c" stroke="#ffedd5" strokeWidth="1.3" />
          <circle cx="32" cy="31" r="15" fill="none" stroke="#fdba74" strokeWidth="1.3" />
          <ellipse cx="32" cy="31" rx="20" ry="8.2" fill="none" stroke="#fb923c" strokeWidth="1.35" />
          <ellipse cx="32" cy="31" rx="8.2" ry="20" fill="none" stroke="#fb923c" strokeWidth="1.35" />
          <path d="M22 21 L26 25 M42 21 L38 25 M22 41 L26 37 M42 41 L38 37" stroke="#fed7aa" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="46.5" cy="31" r="2.3" fill="#ffedd5" />
          <circle cx="24.5" cy="17.8" r="2" fill="#ffedd5" />
        </>
      );
    default:
      return null;
  }
}

// =============================================================================
// HAZARD GLYPH
// =============================================================================

export function renderHazardGlyph(type: HazardType): React.ReactNode {
  switch (type) {
    case "poison_fog":
      return (
        <>
          <circle cx="21" cy="36" r="10.5" fill="rgba(74,222,128,0.42)" />
          <circle cx="33" cy="33" r="12" fill="rgba(74,222,128,0.52)" />
          <circle cx="43" cy="39" r="9" fill="rgba(34,197,94,0.44)" />
          <circle cx="30.5" cy="40" r="8" fill="rgba(22,163,74,0.36)" />
          <circle cx="32" cy="34" r="4.9" fill="#052e16" />
          <circle cx="30.3" cy="33" r="1.15" fill="#bbf7d0" />
          <circle cx="33.7" cy="33" r="1.15" fill="#bbf7d0" />
          <path d="M30.8 36.1 Q32 37.2 33.2 36.1" fill="none" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case "deep_water":
      return (
        <>
          <ellipse cx="32" cy="33" rx="16.5" ry="9" fill="rgba(56,189,248,0.22)" />
          <path d="M14 32 Q20 27 26 32 T38 32 T50 32" fill="none" stroke="#bae6fd" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11 38 Q18 33 25 38 T39 38 T53 38" fill="none" stroke="#7dd3fc" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M9 44 Q17 39 25 44 T41 44 T57 44" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M32 15 C29 21 27 24 27 27 C27 30 29.2 32.4 32 32.4 C34.8 32.4 37 30 37 27 C37 24 35 21 32 15 Z" fill="#dbeafe" />
        </>
      );
    case "quicksand":
      return (
        <>
          <ellipse cx="32" cy="38" rx="17.5" ry="11" fill="rgba(202,138,4,0.46)" />
          <ellipse cx="32" cy="38" rx="12" ry="7" fill="rgba(253,224,71,0.3)" />
          <path d="M22 36 C26 32 34 32 38 36 C40 38.2 37 40.5 34.5 40.3 C32.6 40.2 31 38.3 32 36.8 C33 35.4 35.4 35.8 36.2 37" fill="none" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="23.5" cy="43" r="2.1" fill="#facc15" />
          <circle cx="39.5" cy="44" r="2.4" fill="#facc15" />
          <circle cx="32" cy="46" r="1.6" fill="#fde68a" />
        </>
      );
    case "ice_sheet":
      return (
        <>
          <polygon points="15,43 25,19 46,20 52,35 37,50 20,48" fill="rgba(147,197,253,0.5)" stroke="#e0f2fe" strokeWidth="1.5" />
          <path d="M25 26 L40 34 M31 22 L29 45 M20 36 L44 30 M24 41 L37 26" stroke="#e0f2fe" strokeWidth="1.25" strokeLinecap="round" />
          <circle cx="44.5" cy="22.5" r="1.7" fill="#f0f9ff" />
        </>
      );
    case "ice_spikes":
      return (
        <>
          <path d="M14 48 H50" stroke="#dbeafe" strokeWidth="1.6" />
          <polygon points="15,48 22,25 28,48" fill="#93c5fd" stroke="#dbeafe" strokeWidth="1" />
          <polygon points="24,48 32,16 40,48" fill="#bfdbfe" stroke="#e0f2fe" strokeWidth="1.1" />
          <polygon points="35,48 43,27 50,48" fill="#93c5fd" stroke="#dbeafe" strokeWidth="1" />
          <path d="M18 44 Q32 38 46 44" fill="none" stroke="rgba(186,230,253,0.6)" strokeWidth="1.2" />
        </>
      );
    case "lava_geyser":
      return (
        <>
          <ellipse cx="32" cy="45.5" rx="16.5" ry="6.2" fill="rgba(239,68,68,0.34)" />
          <ellipse cx="32" cy="44" rx="11.2" ry="4" fill="rgba(153,27,27,0.5)" />
          <path d="M23.5 44 C22 35 26 29 29.5 19 C31.5 24 33.2 26.6 34.8 19.5 C39 30 42.8 35.5 40.6 44 Z" fill="#fb923c" stroke="#f97316" strokeWidth="1.5" />
          <path d="M29.6 44 C29.6 37 31.3 32.2 32 27.8 C32.7 32.2 34.4 37 34.4 44 Z" fill="#fde68a" opacity={0.86} />
          <circle cx="22.3" cy="21.8" r="2.2" fill="#fdba74" />
          <circle cx="40.8" cy="17.8" r="2.5" fill="#fdba74" />
          <circle cx="46.2" cy="25.2" r="1.9" fill="#fca5a5" />
        </>
      );
    case "maelstrom":
      return (
        <>
          <path d="M32 12 C45 12 52 23 49 32 C46 41 36 46 27 42 C20 39 18 32 22 27 C26 22 34 22 36 27 C37.4 30.2 35.6 34 32 34" fill="none" stroke="#bae6fd" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M18 18 C14 30 18 46 32 50" fill="none" stroke="#38bdf8" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M46 19 C50 26 49 39 40 46" fill="none" stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="32" cy="34" r="2.7" fill="#e0f2fe" />
        </>
      );
    case "storm_field":
      return (
        <>
          <ellipse cx="32" cy="42" rx="16" ry="5" fill="rgba(125,211,252,0.24)" />
          <circle cx="24" cy="26" r="7.5" fill="#dbeafe" />
          <circle cx="32" cy="23" r="9" fill="#e0f2fe" />
          <circle cx="40" cy="27" r="7" fill="#dbeafe" />
          <path d="M30 28 L25 38 L31.5 38 L27.8 47 L39.2 34.2 L32.4 34.2 L36.2 28 Z" fill="#fde68a" stroke="#facc15" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M15 36 Q22 32 29 36 M35 36 Q42 32 49 36" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

// =============================================================================
// SPECIAL TOWER SPRITE COMPONENT
// =============================================================================

export const SpecialTowerSprite: React.FC<{ type: SpecialTowerType; size?: number }> = ({ type, size = 48 }) => {
  const theme = SPECIAL_TOWER_SPRITE_THEME[type];
  return (
    <SpriteShell size={size} background={theme.background} border={theme.border} glow={theme.glow}>
      {renderSpecialTowerGlyph(type)}
    </SpriteShell>
  );
};

// =============================================================================
// HAZARD SPRITE COMPONENT
// =============================================================================

export const HazardSprite: React.FC<{ type: HazardType; size?: number }> = ({ type, size = 48 }) => {
  const theme = HAZARD_SPRITE_THEME[type] ?? buildThemeFromAccent("#94a3b8");
  return (
    <SpriteShell size={size} background={theme.background} border={theme.border} glow={theme.glow}>
      {renderHazardGlyph(type)}
    </SpriteShell>
  );
};
