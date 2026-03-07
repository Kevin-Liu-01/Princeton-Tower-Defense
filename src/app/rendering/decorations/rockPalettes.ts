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
      base: "#6b7b6a",
      mid: "#8a9a89",
      light: "#a8b8a6",
      dark: "#4a5a49",
      accent: "#4a7a3a",
      accentAlt: "#5c8c4c",
    },
    {
      base: "#7a7068",
      mid: "#9a9088",
      light: "#b5aca5",
      dark: "#5a504a",
      accent: "#3d6b30",
      accentAlt: "#507d42",
    },
    {
      base: "#858075",
      mid: "#a09b90",
      light: "#bbb6ab",
      dark: "#5e5950",
      accent: "#5a8050",
      accentAlt: "#6e9462",
    },
  ],
};

const DESERT_ROCKS: RegionRockConfig = {
  accentType: "sand",
  palettes: [
    {
      base: "#c4a570",
      mid: "#d4b880",
      light: "#e4cb95",
      dark: "#a08050",
      accent: "#e8d5a8",
      accentAlt: "#c9a96a",
    },
    {
      base: "#b8855a",
      mid: "#cc9a70",
      light: "#dcad85",
      dark: "#946840",
      accent: "#d4b890",
      accentAlt: "#b08860",
    },
    {
      base: "#a07058",
      mid: "#b88570",
      light: "#cc9a85",
      dark: "#805040",
      accent: "#c8a87a",
      accentAlt: "#a88060",
    },
  ],
};

const WINTER_ROCKS: RegionRockConfig = {
  accentType: "frost",
  palettes: [
    {
      base: "#8090a0",
      mid: "#98a8b8",
      light: "#b8c8d8",
      dark: "#5a6a7a",
      accent: "#c0ddf0",
      accentAlt: "#a0c4e0",
    },
    {
      base: "#7585a0",
      mid: "#90a0b8",
      light: "#b0c0d5",
      dark: "#506078",
      accent: "#d0e8ff",
      accentAlt: "#b0d0f0",
    },
    {
      base: "#909aa8",
      mid: "#a8b2c0",
      light: "#c5cdd8",
      dark: "#687080",
      accent: "#b8d8f0",
      accentAlt: "#98c0e0",
    },
  ],
};

const VOLCANIC_ROCKS: RegionRockConfig = {
  accentType: "lava",
  palettes: [
    {
      base: "#2a2a2e",
      mid: "#3a3a40",
      light: "#505058",
      dark: "#18181c",
      accent: "#ff6030",
      accentAlt: "#ff4010",
    },
    {
      base: "#352830",
      mid: "#483840",
      light: "#5a4a52",
      dark: "#201820",
      accent: "#ff5020",
      accentAlt: "#e84010",
    },
    {
      base: "#303035",
      mid: "#424248",
      light: "#585860",
      dark: "#1c1c20",
      accent: "#ff7040",
      accentAlt: "#ff5525",
    },
  ],
};

const SWAMP_ROCKS: RegionRockConfig = {
  accentType: "slime",
  palettes: [
    {
      base: "#505548",
      mid: "#686d60",
      light: "#808578",
      dark: "#383d32",
      accent: "#5a8040",
      accentAlt: "#3a6028",
    },
    {
      base: "#4a4840",
      mid: "#605e56",
      light: "#78766e",
      dark: "#34322c",
      accent: "#4a7538",
      accentAlt: "#326020",
    },
    {
      base: "#585550",
      mid: "#706d68",
      light: "#888580",
      dark: "#403d38",
      accent: "#6a9050",
      accentAlt: "#508038",
    },
  ],
};

const REGION_ROCK_CONFIGS: Record<string, RegionRockConfig> = {
  grassland: GRASSLAND_ROCKS,
  desert: DESERT_ROCKS,
  winter: WINTER_ROCKS,
  volcanic: VOLCANIC_ROCKS,
  swamp: SWAMP_ROCKS,
};

export function getRockConfig(theme: string): RegionRockConfig {
  return REGION_ROCK_CONFIGS[theme] ?? GRASSLAND_ROCKS;
}
