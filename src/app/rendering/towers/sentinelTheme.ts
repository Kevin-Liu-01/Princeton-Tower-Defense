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
  crystalB: 180,
  crystalBaseB: 135,
  crystalBaseG: 140,
  crystalBaseR: 120,
  crystalG: 220,
  crystalR: 80,
  hotHex: "#50DCB4",
  hotRgb: "80, 220, 180",
  reticleColor: { b: 180, g: 220, r: 80 },
  reticleGlow: { b: 160, g: 200, r: 40 },
  stoneName: "Emerald",
};

// ── Desert — amber gold ────────────────────────────────────────────────────
const SENTINEL_DESERT: SentinelPalette = {
  crystalB: 60,
  crystalBaseB: 100,
  crystalBaseG: 135,
  crystalBaseR: 150,
  crystalG: 185,
  crystalR: 255,
  hotHex: "#FFB93C",
  hotRgb: "255, 185, 60",
  reticleColor: { b: 60, g: 185, r: 255 },
  reticleGlow: { b: 30, g: 150, r: 220 },
  stoneName: "Amber",
};

// ── Winter — icy blue ──────────────────────────────────────────────────────
const SENTINEL_WINTER: SentinelPalette = {
  crystalB: 255,
  crystalBaseB: 145,
  crystalBaseG: 130,
  crystalBaseR: 120,
  crystalG: 200,
  crystalR: 130,
  hotHex: "#82C8FF",
  hotRgb: "130, 200, 255",
  reticleColor: { b: 255, g: 200, r: 130 },
  reticleGlow: { b: 240, g: 160, r: 80 },
  stoneName: "Sapphire",
};

// ── Volcanic — crimson red (original) ──────────────────────────────────────
const SENTINEL_VOLCANIC: SentinelPalette = {
  crystalB: 96,
  crystalBaseB: 115,
  crystalBaseG: 115,
  crystalBaseR: 140,
  crystalG: 110,
  crystalR: 255,
  hotHex: "#FF6E60",
  hotRgb: "255, 110, 96",
  reticleColor: { b: 70, g: 80, r: 255 },
  reticleGlow: { b: 30, g: 30, r: 220 },
  stoneName: "Ruby",
};

// ── Swamp — sickly green ──────────────────────────────────────────────────
const SENTINEL_SWAMP: SentinelPalette = {
  crystalB: 80,
  crystalBaseB: 110,
  crystalBaseG: 140,
  crystalBaseR: 120,
  crystalG: 230,
  crystalR: 160,
  hotHex: "#A0E650",
  hotRgb: "160, 230, 80",
  reticleColor: { b: 80, g: 230, r: 160 },
  reticleGlow: { b: 40, g: 200, r: 120 },
  stoneName: "Jade",
};

export function getSentinelPalette(theme?: MapTheme): SentinelPalette {
  switch (theme) {
    case "grassland": {
      return SENTINEL_GRASSLAND;
    }
    case "desert": {
      return SENTINEL_DESERT;
    }
    case "winter": {
      return SENTINEL_WINTER;
    }
    case "volcanic": {
      return SENTINEL_VOLCANIC;
    }
    case "swamp": {
      return SENTINEL_SWAMP;
    }
    default: {
      return SENTINEL_VOLCANIC;
    }
  }
}

export function getSentinelName(theme?: MapTheme): string {
  return `Imperial ${getSentinelPalette(theme).stoneName} Sentinel`;
}

export function getSentinelBoltColor(theme?: MapTheme): LightningColorScheme {
  switch (theme) {
    case "grassland": {
      return "teal";
    }
    case "desert": {
      return "yellow";
    }
    case "winter": {
      return "blue";
    }
    case "volcanic": {
      return "red";
    }
    case "swamp": {
      return "green";
    }
    default: {
      return "red";
    }
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
  band: "rgba(70, 74, 82, 0.5)",
  dark: "#2a2c30",
  darkest: "#1a1c20",
  highlight: "#8a8e98",
  light: "#585c64",
  lightest: "#70747c",
  mid: "#3e4248",
  rivet: "rgba(90, 95, 105, 0.6)",
} as const;
