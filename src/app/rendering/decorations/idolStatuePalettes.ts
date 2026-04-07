import type { MapTheme } from "../../types";

export interface IdolStonePalette {
  light: string;
  mid: string;
  dark: string;
  deep: string;
}

export interface IdolGlowConfig {
  hex: string;
  r: number;
  g: number;
  b: number;
}

export type IdolAccentType = "moss" | "frost" | "sand" | "lava" | "ivy";

export interface IdolStatuePalette {
  stone: IdolStonePalette;
  glow: IdolGlowConfig;
  accent: string;
  accentAlt: string;
  carvingColor: string;
  carvingHighlight: string;
  fangColor: string;
  vineColor: string;
  leafColor: string;
  accentType: IdolAccentType;
}

const SWAMP_IDOL: IdolStatuePalette = {
  accent: "#3a5a2a",
  accentAlt: "#2a5a1a",
  accentType: "moss",
  carvingColor: "#7a6a50",
  carvingHighlight: "#8a7a60",
  fangColor: "#c8c0a8",
  glow: { b: 74, g: 255, hex: "#4aff4a", r: 74 },
  leafColor: "#3a6a22",
  stone: { dark: "#3a3a28", deep: "#2a2a1a", light: "#6a6a58", mid: "#5a5a48" },
  vineColor: "#2a5a1a",
};

const GRASSLAND_IDOL: IdolStatuePalette = {
  accent: "#5a7a3a",
  accentAlt: "#4a6a2e",
  accentType: "ivy",
  carvingColor: "#8a7a60",
  carvingHighlight: "#a09070",
  fangColor: "#d0c8b0",
  glow: { b: 74, g: 224, hex: "#ffe04a", r: 255 },
  leafColor: "#4a8030",
  stone: { dark: "#5a5a48", deep: "#4a4a38", light: "#8a8a78", mid: "#7a7a68" },
  vineColor: "#3a6a2a",
};

const DESERT_IDOL: IdolStatuePalette = {
  accent: "#d4b890",
  accentAlt: "#c0a070",
  accentType: "sand",
  carvingColor: "#6a5030",
  carvingHighlight: "#8a7050",
  fangColor: "#e8dcc0",
  glow: { b: 48, g: 170, hex: "#ffaa30", r: 255 },
  leafColor: "#b09060",
  stone: { dark: "#8a7048", deep: "#6a5030", light: "#c4a878", mid: "#b09468" },
  vineColor: "#a08050",
};

const WINTER_IDOL: IdolStatuePalette = {
  accent: "#a0c8e0",
  accentAlt: "#80b0d0",
  accentType: "frost",
  carvingColor: "#506878",
  carvingHighlight: "#6a8098",
  fangColor: "#c0d8e8",
  glow: { b: 255, g: 204, hex: "#60ccff", r: 96 },
  leafColor: "#a0d0f0",
  stone: { dark: "#506878", deep: "#3a4e60", light: "#8898a8", mid: "#7888a0" },
  vineColor: "#80b8d8",
};

const VOLCANIC_IDOL: IdolStatuePalette = {
  accent: "#ff6030",
  accentAlt: "#cc4020",
  accentType: "lava",
  carvingColor: "#5a3028",
  carvingHighlight: "#6a4038",
  fangColor: "#a09088",
  glow: { b: 32, g: 80, hex: "#ff5020", r: 255 },
  leafColor: "#ff6030",
  stone: { dark: "#2a2028", deep: "#1a1018", light: "#4a4048", mid: "#3a3038" },
  vineColor: "#ff4010",
};

const IDOL_PALETTES: Record<MapTheme, IdolStatuePalette> = {
  desert: DESERT_IDOL,
  grassland: GRASSLAND_IDOL,
  swamp: SWAMP_IDOL,
  volcanic: VOLCANIC_IDOL,
  winter: WINTER_IDOL,
};

export function getIdolStatuePalette(theme: string): IdolStatuePalette {
  return IDOL_PALETTES[theme as MapTheme] ?? SWAMP_IDOL;
}
