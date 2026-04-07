export interface RockPalette {
  base: string;
  mid: string;
  light: string;
  dark: string;
  accent: string; // moss, frost, lava glow, slime, sand dust etc.
  accentAlt: string;
}

export interface RegionRockConfig {
  palettes: [RockPalette, RockPalette, RockPalette];
  accentType: "moss" | "frost" | "lava" | "slime" | "sand";
}

const GRASSLAND_ROCKS: RegionRockConfig = {
  accentType: "moss",
  palettes: [
    {
      accent: "#4a7a3a",
      accentAlt: "#5c8c4c",
      base: "#6b7b6a",
      dark: "#4a5a49",
      light: "#a8b8a6",
      mid: "#8a9a89",
    },
    {
      accent: "#3d6b30",
      accentAlt: "#507d42",
      base: "#7a7068",
      dark: "#5a504a",
      light: "#b5aca5",
      mid: "#9a9088",
    },
    {
      accent: "#5a8050",
      accentAlt: "#6e9462",
      base: "#858075",
      dark: "#5e5950",
      light: "#bbb6ab",
      mid: "#a09b90",
    },
  ],
};

const DESERT_ROCKS: RegionRockConfig = {
  accentType: "sand",
  palettes: [
    {
      accent: "#e8d5a8",
      accentAlt: "#c9a96a",
      base: "#c4a570",
      dark: "#a08050",
      light: "#e4cb95",
      mid: "#d4b880",
    },
    {
      accent: "#d4b890",
      accentAlt: "#b08860",
      base: "#b8855a",
      dark: "#946840",
      light: "#dcad85",
      mid: "#cc9a70",
    },
    {
      accent: "#c8a87a",
      accentAlt: "#a88060",
      base: "#a07058",
      dark: "#805040",
      light: "#cc9a85",
      mid: "#b88570",
    },
  ],
};

const WINTER_ROCKS: RegionRockConfig = {
  accentType: "frost",
  palettes: [
    {
      accent: "#c0ddf0",
      accentAlt: "#a0c4e0",
      base: "#8090a0",
      dark: "#5a6a7a",
      light: "#b8c8d8",
      mid: "#98a8b8",
    },
    {
      accent: "#d0e8ff",
      accentAlt: "#b0d0f0",
      base: "#7585a0",
      dark: "#506078",
      light: "#b0c0d5",
      mid: "#90a0b8",
    },
    {
      accent: "#b8d8f0",
      accentAlt: "#98c0e0",
      base: "#909aa8",
      dark: "#687080",
      light: "#c5cdd8",
      mid: "#a8b2c0",
    },
  ],
};

const VOLCANIC_ROCKS: RegionRockConfig = {
  accentType: "lava",
  palettes: [
    {
      accent: "#ff6030",
      accentAlt: "#ff4010",
      base: "#2a2a2e",
      dark: "#18181c",
      light: "#505058",
      mid: "#3a3a40",
    },
    {
      accent: "#ff5020",
      accentAlt: "#e84010",
      base: "#352830",
      dark: "#201820",
      light: "#5a4a52",
      mid: "#483840",
    },
    {
      accent: "#ff7040",
      accentAlt: "#ff5525",
      base: "#303035",
      dark: "#1c1c20",
      light: "#585860",
      mid: "#424248",
    },
  ],
};

const SWAMP_ROCKS: RegionRockConfig = {
  accentType: "slime",
  palettes: [
    {
      accent: "#5a8040",
      accentAlt: "#3a6028",
      base: "#505548",
      dark: "#383d32",
      light: "#808578",
      mid: "#686d60",
    },
    {
      accent: "#4a7538",
      accentAlt: "#326020",
      base: "#4a4840",
      dark: "#34322c",
      light: "#78766e",
      mid: "#605e56",
    },
    {
      accent: "#6a9050",
      accentAlt: "#508038",
      base: "#585550",
      dark: "#403d38",
      light: "#888580",
      mid: "#706d68",
    },
  ],
};

const REGION_ROCK_CONFIGS: Record<string, RegionRockConfig> = {
  desert: DESERT_ROCKS,
  grassland: GRASSLAND_ROCKS,
  swamp: SWAMP_ROCKS,
  volcanic: VOLCANIC_ROCKS,
  winter: WINTER_ROCKS,
};

export function getRockConfig(theme: string): RegionRockConfig {
  return REGION_ROCK_CONFIGS[theme] ?? GRASSLAND_ROCKS;
}
