import type { MapTheme } from "../../constants/maps";
import type { TroopOwnerType } from "../../types";

// ============================================================================
// KNIGHT COLOR THEMES - Distinct visual styles based on owner type
// ============================================================================

export interface KnightTheme {
  // Name for identification
  name: string;
  // Aura and flame colors
  auraColorInner: string; // Inner aura glow
  auraColorMid: string; // Mid aura
  auraColorOuter: string; // Outer aura edge
  flameWisps: string; // Floating flame wisps
  energyRings: string; // Attack energy rings
  // Cape colors
  capeLight: string; // Cape highlight
  capeMid: string; // Cape main color
  capeDark: string; // Cape shadow
  capeInner: string; // Cape inner shadow
  // Armor accent colors
  sigilGlow: string; // Chest sigil glow
  beltBuckle: string; // Belt buckle accent
  // Weapon colors
  crossguardMain: string; // Sword crossguard
  crossguardAccent: string; // Crossguard highlights
  gemColor: string; // Crossguard gems
  bladeRunes: string; // Glowing blade runes
  swingTrail: string; // Sword swing trail
  swingTrailAlt: string; // Secondary swing trail
  // Shield and helm
  shieldEmblem: string; // Shield emblem color
  plume: string; // Helmet plume main color
  plumeDark: string; // Plume deep shadow
  plumeLight: string; // Plume highlight
  plumeHighlight: string; // Plume bright shimmer
  eyeGlow: string; // Glowing eye color
  eyeShadow: string; // Eye shadow/glow
  // Effects
  shockwave: string; // Battle cry shockwave
}

// Orange theme - Default/Station knights (Princeton orange)
export const KNIGHT_THEME_ORANGE: KnightTheme = {
  auraColorInner: "rgba(255, 100, 20, ",
  auraColorMid: "rgba(255, 60, 0, ",
  auraColorOuter: "rgba(200, 40, 0, 0)",
  beltBuckle: "#c0c0d0",
  bladeRunes: "rgba(200, 80, 0, ",
  capeDark: "#aa2200",
  capeInner: "#8b2200",
  capeLight: "#cc3300",
  capeMid: "#ff5500",
  crossguardAccent: "#aa2020",
  crossguardMain: "#8b0000",
  energyRings: "rgba(255, 80, 20, ",
  eyeGlow: "rgba(255, 150, 50, ",
  eyeShadow: "#ff6600",
  flameWisps: "rgba(255, 150, 50, ",
  gemColor: "rgba(255, 200, 50, ",
  name: "princeton",
  plume: "#dd4400",
  plumeDark: "#6a1e00",
  plumeHighlight: "#ffaa66",
  plumeLight: "#ff7733",
  shieldEmblem: "#cc4400",
  shockwave: "rgba(255, 100, 50, ",
  sigilGlow: "rgba(200, 80, 0, ",
  swingTrail: "rgba(255, 150, 50, ",
  swingTrailAlt: "rgba(255, 200, 100, ",
};

// Blue theme - Frontier Barracks knights
export const KNIGHT_THEME_BLUE: KnightTheme = {
  auraColorInner: "rgba(80, 160, 255, ",
  auraColorMid: "rgba(40, 120, 220, ",
  auraColorOuter: "rgba(20, 80, 180, 0)",
  beltBuckle: "#8aa8cc",
  bladeRunes: "rgba(80, 180, 255, ",
  capeDark: "#0a3366",
  capeInner: "#082244",
  capeLight: "#1a4a8a",
  capeMid: "#2266bb",
  crossguardAccent: "#2855a0",
  crossguardMain: "#1a4080",
  energyRings: "rgba(60, 140, 255, ",
  eyeGlow: "rgba(120, 200, 255, ",
  eyeShadow: "#4499ff",
  flameWisps: "rgba(100, 180, 255, ",
  gemColor: "rgba(150, 220, 255, ",
  name: "frontier",
  plume: "#3388dd",
  plumeDark: "#183c66",
  plumeHighlight: "#99ccff",
  plumeLight: "#66aaee",
  shieldEmblem: "#2266aa",
  shockwave: "rgba(80, 160, 255, ",
  sigilGlow: "rgba(80, 160, 255, ",
  swingTrail: "rgba(100, 180, 255, ",
  swingTrailAlt: "rgba(150, 210, 255, ",
};

// Red theme - General Mercer (Captain hero) summoned knights
export const KNIGHT_THEME_RED: KnightTheme = {
  auraColorInner: "rgba(255, 60, 60, ",
  auraColorMid: "rgba(200, 30, 30, ",
  auraColorOuter: "rgba(150, 20, 20, 0)",
  beltBuckle: "#cc9999",
  bladeRunes: "rgba(255, 60, 60, ",
  capeDark: "#661111",
  capeInner: "#440a0a",
  capeLight: "#8b1a1a",
  capeMid: "#cc2222",
  crossguardAccent: "#882020",
  crossguardMain: "#660000",
  energyRings: "rgba(255, 50, 50, ",
  eyeGlow: "rgba(255, 120, 120, ",
  eyeShadow: "#ff4444",
  flameWisps: "rgba(255, 100, 100, ",
  gemColor: "rgba(255, 180, 180, ",
  name: "mercer",
  plume: "#dd3333",
  plumeDark: "#661515",
  plumeHighlight: "#ff9999",
  plumeLight: "#ee6666",
  shieldEmblem: "#aa2222",
  shockwave: "rgba(255, 80, 80, ",
  sigilGlow: "rgba(255, 80, 80, ",
  swingTrail: "rgba(255, 100, 100, ",
  swingTrailAlt: "rgba(255, 150, 150, ",
};

// Purple theme - Volcanic barracks knights
export const KNIGHT_THEME_PURPLE: KnightTheme = {
  auraColorInner: "rgba(180, 80, 255, ",
  auraColorMid: "rgba(130, 40, 220, ",
  auraColorOuter: "rgba(80, 20, 160, 0)",
  beltBuckle: "#B899CC",
  bladeRunes: "rgba(180, 80, 255, ",
  capeDark: "#3A0A66",
  capeInner: "#280644",
  capeLight: "#5A1A8A",
  capeMid: "#7B2FBB",
  crossguardAccent: "#5520A0",
  crossguardMain: "#3A0060",
  energyRings: "rgba(160, 60, 255, ",
  eyeGlow: "rgba(200, 140, 255, ",
  eyeShadow: "#B366FF",
  flameWisps: "rgba(200, 120, 255, ",
  gemColor: "rgba(220, 180, 255, ",
  name: "volcanic",
  plume: "#9B44DD",
  plumeDark: "#3e1a5c",
  plumeHighlight: "#d4aaff",
  plumeLight: "#bb77ee",
  shieldEmblem: "#7A30AA",
  shockwave: "rgba(180, 100, 255, ",
  sigilGlow: "rgba(180, 100, 255, ",
  swingTrail: "rgba(200, 120, 255, ",
  swingTrailAlt: "rgba(220, 170, 255, ",
};

// ============================================================================
// KNIGHT GEAR VARIANTS — 3 distinct armor/helmet/weapon combos per knight
// Variant 0: Heavy Plate — bulky layered plate, great helm, broadsword
// Variant 1: Crusader — segmented mail+plate, crusader helm with cross visor, longsword
// Variant 2: Royal Guard — ornate gilded plate, winged helm, bastard sword
// ============================================================================

export interface KnightGearVariant {
  // Armor palette overrides
  armorPeak: string;
  armorHigh: string;
  armorMid: string;
  armorDark: string;
  // Helmet style
  helmetStyle: "greathelm" | "crusader" | "winged";
  // Weapon style
  weaponStyle: "broadsword" | "longsword" | "bastardsword";
  // Extra accent
  trimColor: string;
  trimHighlight: string;
}

export const KNIGHT_GEAR_VARIANTS: KnightGearVariant[] = [
  {
    // Variant 0: Heavy Plate — dark steel, great helm, wide broadsword
    armorDark: "#41485b",
    armorHigh: "#878ea7",
    armorMid: "#646b81",
    armorPeak: "#acb2c6",
    helmetStyle: "greathelm",
    trimColor: "#5a5a6e",
    trimHighlight: "#c8c8d8",
    weaponStyle: "broadsword",
  },
  {
    // Variant 1: Crusader — cool silver steel, cross visor, longsword
    armorDark: "#484e60",
    armorHigh: "#949aac",
    armorMid: "#6e7488",
    armorPeak: "#b8bcc8",
    helmetStyle: "crusader",
    trimColor: "#606878",
    trimHighlight: "#d0d4dc",
    weaponStyle: "longsword",
  },
  {
    // Variant 2: Royal Guard — polished bright steel, winged helm, bastard sword
    armorDark: "#505870",
    armorHigh: "#a0a6b8",
    armorMid: "#78809a",
    armorPeak: "#c0c4d0",
    helmetStyle: "winged",
    trimColor: "#6a7088",
    trimHighlight: "#d8dce8",
    weaponStyle: "bastardsword",
  },
];

// Captain Mercer's hero-summoned knights — gold-tinted versions of each variant
export const MERCER_GEAR_VARIANTS: KnightGearVariant[] = [
  {
    armorDark: "#7a6820",
    armorHigh: "#d4b860",
    armorMid: "#a89030",
    armorPeak: "#f0e0a0",
    helmetStyle: "greathelm",
    trimColor: "#c4a030",
    trimHighlight: "#f8ecc0",
    weaponStyle: "broadsword",
  },
  {
    armorDark: "#786428",
    armorHigh: "#d0b868",
    armorMid: "#a89040",
    armorPeak: "#ecdca0",
    helmetStyle: "crusader",
    trimColor: "#b89838",
    trimHighlight: "#f4e4b0",
    weaponStyle: "longsword",
  },
  {
    armorDark: "#8a7020",
    armorHigh: "#dcc460",
    armorMid: "#b49830",
    armorPeak: "#f4e8b0",
    helmetStyle: "winged",
    trimColor: "#cca828",
    trimHighlight: "#faf0c8",
    weaponStyle: "bastardsword",
  },
];

export const KNIGHT_VARIANT_LABELS: readonly string[] = [
  "Heavy Plate",
  "Crusader",
  "Royal Guard",
];

export interface KnightColorVariation {
  label: string;
  ownerType?: TroopOwnerType;
  mapTheme?: MapTheme;
}

export const KNIGHT_COLOR_VARIATIONS: readonly KnightColorVariation[] = [
  { label: "Station", ownerType: "station" },
  { label: "Barracks", ownerType: "barracks" },
  { label: "Volcanic", mapTheme: "volcanic", ownerType: "barracks" },
  { label: "Mercer", ownerType: "hero_summon" },
];

export function getKnightGearVariant(
  variant?: number,
  ownerType?: TroopOwnerType
): KnightGearVariant {
  const pool =
    ownerType === "hero_summon" ? MERCER_GEAR_VARIANTS : KNIGHT_GEAR_VARIANTS;
  const idx = (variant ?? 0) % pool.length;
  return pool[idx];
}

// Get knight theme based on owner type and map theme.
// Barracks knights adapt to the biome: orange on desert, purple on volcanic.
export function getKnightTheme(
  ownerType?: TroopOwnerType,
  mapTheme?: MapTheme
): KnightTheme {
  if (ownerType === "barracks") {
    switch (mapTheme) {
      case "desert": {
        return KNIGHT_THEME_ORANGE;
      }
      case "volcanic": {
        return KNIGHT_THEME_PURPLE;
      }
      default: {
        return KNIGHT_THEME_BLUE;
      }
    }
  }
  switch (ownerType) {
    case "hero_summon": {
      return KNIGHT_THEME_RED;
    }
    case "station":
    case "default":
    default: {
      return KNIGHT_THEME_ORANGE;
    }
  }
}
