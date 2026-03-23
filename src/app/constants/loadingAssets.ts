import { LEVEL_DATA, HERO_OPTIONS, SPELL_OPTIONS, getSpellActionImagePath } from "./index";
import type { MapTheme } from "./maps";

const BIOME_IMAGES = [
  "/images/new/gameplay_grounds.png",
  "/images/new/gameplay_desert.png",
  "/images/new/gameplay_swamp.png",
  "/images/new/gameplay_winter.png",
  "/images/new/gameplay_volcano.png",
];

const TOP_BAR_IMAGES = [
  "/images/new/gameplay_volcano.png",
  "/images/new/gameplay_winter.png",
];

const UI_IMAGES = [
  "/images/new/gameplay_missile1.png",
];

function getAllPreviewImages(): string[] {
  const seen = new Set<string>();
  for (const data of Object.values(LEVEL_DATA)) {
    if (data.previewImage && !seen.has(data.previewImage)) {
      seen.add(data.previewImage);
    }
  }
  return Array.from(seen);
}

function getHeroActionImages(): string[] {
  return HERO_OPTIONS.map((h) => `/images/heroes/${h}-action.png`);
}

function getSpellActionImages(): string[] {
  return SPELL_OPTIONS.map(getSpellActionImagePath);
}

export function getWorldMapAssets(): string[] {
  return [
    ...TOP_BAR_IMAGES,
    ...UI_IMAGES,
    ...getAllPreviewImages(),
    ...BIOME_IMAGES,
  ];
}

export function getBattleAssets(selectedMap?: string): string[] {
  const assets = [
    ...getHeroActionImages(),
    ...getSpellActionImages(),
  ];
  if (selectedMap) {
    const levelData = LEVEL_DATA[selectedMap];
    if (levelData?.previewImage) {
      assets.push(levelData.previewImage);
    }
  }
  return assets;
}

export const LOADING_TIPS = [
  "Archers excel against fast enemies — place them on curves!",
  "Mortars deal splash damage — perfect for clusters of foes.",
  "Upgrade your towers early for a strong mid-game advantage.",
  "Libraries slow enemies with arcane bolts — great chokepoint defense.",
  "Spells recharge over time — save them for emergencies!",
  "Heroes gain XP in battle — position them wisely.",
  "Use barracks to block enemies while towers deal damage.",
  "Each star you earn unlocks spell upgrade points.",
  "Challenge levels test your skills with unique restrictions.",
  "Mix tower types for balanced coverage against all enemy kinds.",
  "The Princeton Tiger has a devastating area roar ability.",
  "Cannon towers deal heavy single-target damage to armored foes.",
  "Placing towers near the path entrance gives them more time to fire.",
  "Some enemies are resistant to magic — use physical towers against them.",
  "Rally points let you direct barracks troops to a specific location.",
  "Selling a tower refunds a portion of its cost — adapt your strategy!",
  "Boss enemies have unique abilities — study their patterns carefully.",
  "Terrain bonuses vary by biome — use the landscape to your advantage.",
];

export const LOADING_LORE = [
  "\u201CThe shadows gather at the gates. Ancient towers stand resolute, their arcane fires burning eternal against the darkness.\u201D",
  "\u201CIn the age before towers, the old kingdoms fell. We shall not repeat their folly.\u201D",
  "\u201CEvery stone laid in defense carries the weight of a thousand prayers.\u201D",
  "\u201CThe Tiger prowls the borderlands, a guardian of light against the encroaching dark.\u201D",
  "\u201CFrom Nassau Hall's spires, the signal fires burn — a call to arms across the realm.\u201D",
  "\u201CWhere scholars once debated philosophy, war machines now stand vigilant.\u201D",
  "\u201CThe old roads remember peace. The towers remember why it ended.\u201D",
  "\u201CBeneath the volcano's fury, defenders forge an unbreakable line.\u201D",
];

// ─── Loading Screen Theme Colors ──────────────────────────────────────────────
export interface LoadingTheme {
  /** Dark base background `rgb(r,g,b)` */
  bg: string;
  /** RGB triplet for rgba() usage */
  bgRgb: string;
  /** Background image path */
  bgImage: string;
  /** OrnateFrame border color (hex) */
  frameColor: string;
  /** OrnateFrame glow color (hex) */
  frameGlow: string;
  /** Primary accent (hex) — used for text, glow, bar fill */
  accent: string;
  /** Accent as rgb triplet for rgba() */
  accentRgb: string;
  /** Darker accent (hex) — borders, secondary elements */
  accentDark: string;
  /** Dark accent as rgb triplet */
  accentDarkRgb: string;
  /** Warm wash gradient over background image */
  washRgb: string;
  /** 4 hex colors for floating ember particles */
  emberColors: [string, string, string, string];
  /** Progress bar fill gradient (loading state) */
  barGradient: string;
  /** Progress bar fill gradient (complete state) */
  barGradientComplete: string;
  /** Subtitle for the loading screen */
  subtitle: string;
}

const GRASSLAND_THEME: LoadingTheme = {
  bg: "rgb(10,18,8)",
  bgRgb: "10,18,8",
  bgImage: "/images/new/gameplay_grounds.png",
  frameColor: "#5a8a3c",
  frameGlow: "#7ab856",
  accent: "#7ab856",
  accentRgb: "122,184,86",
  accentDark: "#3d6b24",
  accentDarkRgb: "61,107,36",
  washRgb: "30,60,15",
  emberColors: ["#7ab856", "#a3d97a", "#5a8a3c", "#3d6b24"],
  barGradient: "linear-gradient(90deg, rgba(61,107,36,0.95), rgba(100,160,50,1), rgba(122,184,86,1), rgba(100,160,50,1), rgba(61,107,36,0.95))",
  barGradientComplete: "linear-gradient(90deg, rgba(100,160,50,1), rgba(140,200,70,1), rgba(170,220,100,1), rgba(140,200,70,1), rgba(100,160,50,1))",
  subtitle: "Marshalling forces among the fields…",
};

const SWAMP_THEME: LoadingTheme = {
  bg: "rgb(8,14,12)",
  bgRgb: "8,14,12",
  bgImage: "/images/new/gameplay_swamp.png",
  frameColor: "#4a7a6a",
  frameGlow: "#5ea88e",
  accent: "#5ea88e",
  accentRgb: "94,168,142",
  accentDark: "#2d5a48",
  accentDarkRgb: "45,90,72",
  washRgb: "15,40,30",
  emberColors: ["#5ea88e", "#80c4a6", "#3d8a6e", "#2d5a48"],
  barGradient: "linear-gradient(90deg, rgba(45,90,72,0.95), rgba(70,140,110,1), rgba(94,168,142,1), rgba(70,140,110,1), rgba(45,90,72,0.95))",
  barGradientComplete: "linear-gradient(90deg, rgba(70,140,110,1), rgba(110,180,150,1), rgba(140,210,180,1), rgba(110,180,150,1), rgba(70,140,110,1))",
  subtitle: "Wading through the murky depths…",
};

const DESERT_THEME: LoadingTheme = {
  bg: "rgb(18,11,6)",
  bgRgb: "18,11,6",
  bgImage: "/images/new/gameplay_desert.png",
  frameColor: "#b48c3c",
  frameGlow: "#d4a84a",
  accent: "#d4a84a",
  accentRgb: "212,168,74",
  accentDark: "#8a6420",
  accentDarkRgb: "138,100,32",
  washRgb: "80,45,12",
  emberColors: ["#f59e0b", "#fbbf24", "#d97706", "#b45309"],
  barGradient: "linear-gradient(90deg, rgba(120,78,12,0.95), rgba(185,135,25,1), rgba(200,155,35,1), rgba(185,135,25,1), rgba(120,78,12,0.95))",
  barGradientComplete: "linear-gradient(90deg, rgba(190,140,25,1), rgba(245,185,35,1), rgba(255,210,60,1), rgba(245,185,35,1), rgba(190,140,25,1))",
  subtitle: "Crossing the scorching sands…",
};

const WINTER_THEME: LoadingTheme = {
  bg: "rgb(6,10,18)",
  bgRgb: "6,10,18",
  bgImage: "/images/new/gameplay_winter.png",
  frameColor: "#5a8ab4",
  frameGlow: "#7abaee",
  accent: "#7abaee",
  accentRgb: "122,186,238",
  accentDark: "#3a6a94",
  accentDarkRgb: "58,106,148",
  washRgb: "12,25,50",
  emberColors: ["#7abaee", "#a0d4ff", "#5a9acc", "#3a6a94"],
  barGradient: "linear-gradient(90deg, rgba(58,106,148,0.95), rgba(90,150,200,1), rgba(122,186,238,1), rgba(90,150,200,1), rgba(58,106,148,0.95))",
  barGradientComplete: "linear-gradient(90deg, rgba(90,150,200,1), rgba(140,200,240,1), rgba(180,225,255,1), rgba(140,200,240,1), rgba(90,150,200,1))",
  subtitle: "Braving the frozen wastes…",
};

const VOLCANIC_THEME: LoadingTheme = {
  bg: "rgb(18,6,4)",
  bgRgb: "18,6,4",
  bgImage: "/images/new/gameplay_volcano.png",
  frameColor: "#b44a2a",
  frameGlow: "#e06030",
  accent: "#e06030",
  accentRgb: "224,96,48",
  accentDark: "#8a2a10",
  accentDarkRgb: "138,42,16",
  washRgb: "60,15,5",
  emberColors: ["#e06030", "#ff8a50", "#c44020", "#8a2a10"],
  barGradient: "linear-gradient(90deg, rgba(138,42,16,0.95), rgba(190,70,30,1), rgba(224,96,48,1), rgba(190,70,30,1), rgba(138,42,16,0.95))",
  barGradientComplete: "linear-gradient(90deg, rgba(190,70,30,1), rgba(240,100,40,1), rgba(255,140,60,1), rgba(240,100,40,1), rgba(190,70,30,1))",
  subtitle: "Descending into the inferno…",
};

const THEME_MAP: Record<MapTheme, LoadingTheme> = {
  grassland: GRASSLAND_THEME,
  swamp: SWAMP_THEME,
  desert: DESERT_THEME,
  winter: WINTER_THEME,
  volcanic: VOLCANIC_THEME,
};

/** Default gold theme for world-map context (no region) */
export const DEFAULT_LOADING_THEME: LoadingTheme = {
  ...DESERT_THEME,
  bgImage: "/images/new/gameplay_grounds.png",
  subtitle: "Marshalling the realm\u2019s defenses\u2026",
};

/**
 * Resolve the loading theme from level data.
 * Challenge levels get a darker, more intense crimson-shifted variant.
 */
export function resolveLoadingTheme(
  mapTheme?: MapTheme,
  levelKind?: string,
): LoadingTheme {
  const base = mapTheme ? THEME_MAP[mapTheme] : DEFAULT_LOADING_THEME;

  if (levelKind === "challenge") {
    return {
      ...base,
      bg: "rgb(16,4,6)",
      bgRgb: "16,4,6",
      frameColor: "#8a2a3a",
      frameGlow: "#c44058",
      accent: "#c44058",
      accentRgb: "196,64,88",
      accentDark: "#6a1a28",
      accentDarkRgb: "106,26,40",
      washRgb: "50,10,15",
      emberColors: ["#c44058", "#e06078", "#a03048", "#6a1a28"],
      barGradient: "linear-gradient(90deg, rgba(106,26,40,0.95), rgba(160,48,72,1), rgba(196,64,88,1), rgba(160,48,72,1), rgba(106,26,40,0.95))",
      barGradientComplete: "linear-gradient(90deg, rgba(160,48,72,1), rgba(210,80,100,1), rgba(240,110,130,1), rgba(210,80,100,1), rgba(160,48,72,1))",
      subtitle: "Entering the crucible of champions…",
    };
  }

  return base;
}
