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
  stone: { light: "#6a6a58", mid: "#5a5a48", dark: "#3a3a28", deep: "#2a2a1a" },
  glow: { hex: "#4aff4a", r: 74, g: 255, b: 74 },
  accent: "#3a5a2a",
  accentAlt: "#2a5a1a",
  carvingColor: "#7a6a50",
  carvingHighlight: "#8a7a60",
  fangColor: "#c8c0a8",
  vineColor: "#2a5a1a",
  leafColor: "#3a6a22",
  accentType: "moss",
};

const GRASSLAND_IDOL: IdolStatuePalette = {
  stone: { light: "#8a8a78", mid: "#7a7a68", dark: "#5a5a48", deep: "#4a4a38" },
  glow: { hex: "#ffe04a", r: 255, g: 224, b: 74 },
  accent: "#5a7a3a",
  accentAlt: "#4a6a2e",
  carvingColor: "#8a7a60",
  carvingHighlight: "#a09070",
  fangColor: "#d0c8b0",
  vineColor: "#3a6a2a",
  leafColor: "#4a8030",
  accentType: "ivy",
};

const DESERT_IDOL: IdolStatuePalette = {
  stone: { light: "#c4a878", mid: "#b09468", dark: "#8a7048", deep: "#6a5030" },
  glow: { hex: "#ffaa30", r: 255, g: 170, b: 48 },
  accent: "#d4b890",
  accentAlt: "#c0a070",
  carvingColor: "#6a5030",
  carvingHighlight: "#8a7050",
  fangColor: "#e8dcc0",
  vineColor: "#a08050",
  leafColor: "#b09060",
  accentType: "sand",
};

const WINTER_IDOL: IdolStatuePalette = {
  stone: { light: "#8898a8", mid: "#7888a0", dark: "#506878", deep: "#3a4e60" },
  glow: { hex: "#60ccff", r: 96, g: 204, b: 255 },
  accent: "#a0c8e0",
  accentAlt: "#80b0d0",
  carvingColor: "#506878",
  carvingHighlight: "#6a8098",
  fangColor: "#c0d8e8",
  vineColor: "#80b8d8",
  leafColor: "#a0d0f0",
  accentType: "frost",
};

const VOLCANIC_IDOL: IdolStatuePalette = {
  stone: { light: "#4a4048", mid: "#3a3038", dark: "#2a2028", deep: "#1a1018" },
  glow: { hex: "#ff5020", r: 255, g: 80, b: 32 },
  accent: "#ff6030",
  accentAlt: "#cc4020",
  carvingColor: "#5a3028",
  carvingHighlight: "#6a4038",
  fangColor: "#a09088",
  vineColor: "#ff4010",
  leafColor: "#ff6030",
  accentType: "lava",
};

const IDOL_PALETTES: Record<MapTheme, IdolStatuePalette> = {
  swamp: SWAMP_IDOL,
  grassland: GRASSLAND_IDOL,
  desert: DESERT_IDOL,
  winter: WINTER_IDOL,
  volcanic: VOLCANIC_IDOL,
};

export function getIdolStatuePalette(theme: string): IdolStatuePalette {
  return IDOL_PALETTES[theme as MapTheme] ?? SWAMP_IDOL;
}
