import type { MapTheme } from "../../constants/maps";
import type { LightningColorScheme } from "../helpers";
import type { ReticleColor } from "../ui/reticles";

export interface SentinelPalette {
  stoneName: string;
  // Crystal / energy accent (the "hot" color — region-specific)
  hotRgb: string;
  hotHex: string;
  // Interpolation targets for charge glow (crystal lerps from gray toward these)
  crystalR: number;
  crystalG: number;
  crystalB: number;
  // Faint ambient crystal base tint (at charge 0)
  crystalBaseR: number;
  crystalBaseG: number;
  crystalBaseB: number;
  // Reticle colors
  reticleColor: ReticleColor;
  reticleGlow: ReticleColor;
}

// ── Grassland — verdant cyan-teal ──────────────────────────────────────────
const SENTINEL_GRASSLAND: SentinelPalette = {
  stoneName: "Emerald",
  hotRgb: "80, 220, 180",
  hotHex: "#50DCB4",
  crystalR: 80,
  crystalG: 220,
  crystalB: 180,
  crystalBaseR: 120,
  crystalBaseG: 140,
  crystalBaseB: 135,
  reticleColor: { r: 80, g: 220, b: 180 },
  reticleGlow: { r: 40, g: 200, b: 160 },
};

// ── Desert — amber gold ────────────────────────────────────────────────────
const SENTINEL_DESERT: SentinelPalette = {
  stoneName: "Amber",
  hotRgb: "255, 185, 60",
  hotHex: "#FFB93C",
  crystalR: 255,
  crystalG: 185,
  crystalB: 60,
  crystalBaseR: 150,
  crystalBaseG: 135,
  crystalBaseB: 100,
  reticleColor: { r: 255, g: 185, b: 60 },
  reticleGlow: { r: 220, g: 150, b: 30 },
};

// ── Winter — icy blue ──────────────────────────────────────────────────────
const SENTINEL_WINTER: SentinelPalette = {
  stoneName: "Sapphire",
  hotRgb: "130, 200, 255",
  hotHex: "#82C8FF",
  crystalR: 130,
  crystalG: 200,
  crystalB: 255,
  crystalBaseR: 120,
  crystalBaseG: 130,
  crystalBaseB: 145,
  reticleColor: { r: 130, g: 200, b: 255 },
  reticleGlow: { r: 80, g: 160, b: 240 },
};

// ── Volcanic — crimson red (original) ──────────────────────────────────────
const SENTINEL_VOLCANIC: SentinelPalette = {
  stoneName: "Ruby",
  hotRgb: "255, 110, 96",
  hotHex: "#FF6E60",
  crystalR: 255,
  crystalG: 110,
  crystalB: 96,
  crystalBaseR: 140,
  crystalBaseG: 115,
  crystalBaseB: 115,
  reticleColor: { r: 255, g: 80, b: 70 },
  reticleGlow: { r: 220, g: 30, b: 30 },
};

// ── Swamp — sickly green ──────────────────────────────────────────────────
const SENTINEL_SWAMP: SentinelPalette = {
  stoneName: "Jade",
  hotRgb: "160, 230, 80",
  hotHex: "#A0E650",
  crystalR: 160,
  crystalG: 230,
  crystalB: 80,
  crystalBaseR: 120,
  crystalBaseG: 140,
  crystalBaseB: 110,
  reticleColor: { r: 160, g: 230, b: 80 },
  reticleGlow: { r: 120, g: 200, b: 40 },
};

export function getSentinelPalette(theme?: MapTheme): SentinelPalette {
  switch (theme) {
    case "grassland":
      return SENTINEL_GRASSLAND;
    case "desert":
      return SENTINEL_DESERT;
    case "winter":
      return SENTINEL_WINTER;
    case "volcanic":
      return SENTINEL_VOLCANIC;
    case "swamp":
      return SENTINEL_SWAMP;
    default:
      return SENTINEL_VOLCANIC;
  }
}

export function getSentinelName(theme?: MapTheme): string {
  return `Imperial ${getSentinelPalette(theme).stoneName} Sentinel`;
}

export function getSentinelBoltColor(theme?: MapTheme): LightningColorScheme {
  switch (theme) {
    case "grassland":
      return "teal";
    case "desert":
      return "yellow";
    case "winter":
      return "blue";
    case "volcanic":
      return "red";
    case "swamp":
      return "green";
    default:
      return "red";
  }
}

// Screen-space Y offset (per unit zoom) from tower center to crystal
// Derived from: initial translate (18*s2) + crystalRestY (-74*s2), s2=1.12
export const SENTINEL_CRYSTAL_Y_OFFSET = -63;

// Screen-space Y offset (per unit zoom) from tower center to sunforge gem
// Derived from: initial translate (17*s2) + sunCoreRestY (-75*s2), s2=1.16
export const SUNFORGE_GEM_Y_OFFSET = -67;

// Consistent metal colors used regardless of region
export const SENTINEL_METAL = {
  darkest: "#1a1c20",
  dark: "#2a2c30",
  mid: "#3e4248",
  light: "#585c64",
  lightest: "#70747c",
  highlight: "#8a8e98",
  rivet: "rgba(90, 95, 105, 0.6)",
  band: "rgba(70, 74, 82, 0.5)",
} as const;
