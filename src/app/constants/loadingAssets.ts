import { LEVEL_DATA, HERO_OPTIONS, SPELL_OPTIONS, getSpellActionImagePath } from "./index";

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
