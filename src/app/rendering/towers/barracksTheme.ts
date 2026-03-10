import type { MapTheme } from "../../constants/maps";

export interface BarracksBuildingPalette {
  // Foundation gradient stops (left face, right face, top)
  foundationL: readonly [string, string, string];
  foundationR: readonly [string, string, string];
  foundationTop: string;
  // Stepped plinth (dark, mid, top)
  plinth: readonly [string, string, string];
  // Main wall gradient stops (left=shadowed, right=lit, 4 stops each)
  wallL: readonly [string, string, string, string];
  wallR: readonly [string, string, string, string];
  // Cornice gradient stops (left, right — 2 each)
  corniceL: readonly [string, string];
  corniceR: readonly [string, string];
  // Corner quoin alternating shades (left, right)
  quoinL: readonly [string, string];
  quoinR: readonly [string, string];
  // General stone accents (rivets, grate borders, archway surround)
  stoneDark: string;
  stoneMid: string;
  // Glow / accent for spawn circles, door, and arrow slits
  glowRgb: string;
  glowRgbBright: string;
  glowHex: string;
  doorGlowDark: string;
  doorGlowMid: string;
}

const BARRACKS_PALETTE_BLUE: BarracksBuildingPalette = {
  foundationL: ["#2B3940", "#37474F", "#3D5058"],
  foundationR: ["#4A6270", "#546E7A", "#4E6672"],
  foundationTop: "#4E5D63",
  plinth: ["#283338", "#37474F", "#3D4F59"],
  wallL: ["#344550", "#3D4F59", "#455A64", "#4A6270"],
  wallR: ["#6B8794", "#607D8B", "#546E7A", "#4C6470"],
  corniceL: ["#2B3940", "#37474F"],
  corniceR: ["#4A6270", "#3D5058"],
  quoinL: ["#37474F", "#3D5058"],
  quoinR: ["#546E7A", "#4E6672"],
  stoneDark: "#2B3940",
  stoneMid: "#37474F",
  glowRgb: "79, 195, 247",
  glowRgbBright: "100, 220, 255",
  glowHex: "#4FC3F7",
  doorGlowDark: "#0D47A1",
  doorGlowMid: "#1565C0",
};

const BARRACKS_PALETTE_ORANGE: BarracksBuildingPalette = {
  foundationL: ["#3A2E1E", "#4A3A28", "#564432"],
  foundationR: ["#6A5838", "#7A6848", "#6B5C3E"],
  foundationTop: "#5D5035",
  plinth: ["#2E2418", "#3A3020", "#44382A"],
  wallL: ["#3E3020", "#4A3A28", "#564432", "#6A5838"],
  wallR: ["#8B7858", "#7A6848", "#6A5838", "#5A4C35"],
  corniceL: ["#3A2E1E", "#4A3A28"],
  corniceR: ["#6A5838", "#564432"],
  quoinL: ["#4A3A28", "#564432"],
  quoinR: ["#6A5838", "#5E5235"],
  stoneDark: "#3A2E1E",
  stoneMid: "#4A3A28",
  glowRgb: "255, 160, 50",
  glowRgbBright: "255, 190, 80",
  glowHex: "#FFA032",
  doorGlowDark: "#8B4000",
  doorGlowMid: "#CC6600",
};

const BARRACKS_PALETTE_PURPLE: BarracksBuildingPalette = {
  foundationL: ["#1E152A", "#281E3A", "#35284A"],
  foundationR: ["#48355A", "#55406A", "#4A3858"],
  foundationTop: "#3A2E4A",
  plinth: ["#181020", "#201528", "#2A1E35"],
  wallL: ["#221830", "#2A1E3A", "#35284A", "#48355A"],
  wallR: ["#6A5080", "#5A406A", "#48355A", "#3A2B48"],
  corniceL: ["#1E152A", "#281E3A"],
  corniceR: ["#48355A", "#35284A"],
  quoinL: ["#281E3A", "#35284A"],
  quoinR: ["#48355A", "#402E4E"],
  stoneDark: "#1E152A",
  stoneMid: "#281E3A",
  glowRgb: "180, 100, 255",
  glowRgbBright: "200, 140, 255",
  glowHex: "#B464FF",
  doorGlowDark: "#4A0080",
  doorGlowMid: "#7B2FBB",
};

export function getBarracksBuildingPalette(
  mapTheme?: MapTheme,
): BarracksBuildingPalette {
  switch (mapTheme) {
    case "desert":
      return BARRACKS_PALETTE_ORANGE;
    case "volcanic":
      return BARRACKS_PALETTE_PURPLE;
    default:
      return BARRACKS_PALETTE_BLUE;
  }
}
