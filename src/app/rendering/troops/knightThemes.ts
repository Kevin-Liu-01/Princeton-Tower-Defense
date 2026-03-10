import type { TroopOwnerType } from "../../types";
import type { MapTheme } from "../../constants/maps";

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
  plume: string; // Helmet plume
  eyeGlow: string; // Glowing eye color
  eyeShadow: string; // Eye shadow/glow
  // Effects
  shockwave: string; // Battle cry shockwave
}

// Orange theme - Default/Station knights (Princeton orange)
export const KNIGHT_THEME_ORANGE: KnightTheme = {
  name: "princeton",
  auraColorInner: "rgba(255, 100, 20, ",
  auraColorMid: "rgba(255, 60, 0, ",
  auraColorOuter: "rgba(200, 40, 0, 0)",
  flameWisps: "rgba(255, 150, 50, ",
  energyRings: "rgba(255, 80, 20, ",
  capeLight: "#cc3300",
  capeMid: "#ff5500",
  capeDark: "#aa2200",
  capeInner: "#8b2200",
  sigilGlow: "rgba(200, 80, 0, ",
  beltBuckle: "#c0c0d0",
  crossguardMain: "#8b0000",
  crossguardAccent: "#aa2020",
  gemColor: "rgba(255, 200, 50, ",
  bladeRunes: "rgba(200, 80, 0, ",
  swingTrail: "rgba(255, 150, 50, ",
  swingTrailAlt: "rgba(255, 200, 100, ",
  shieldEmblem: "#cc4400",
  plume: "#dd4400",
  eyeGlow: "rgba(255, 150, 50, ",
  eyeShadow: "#ff6600",
  shockwave: "rgba(255, 100, 50, ",
};

// Blue theme - Frontier Barracks knights
export const KNIGHT_THEME_BLUE: KnightTheme = {
  name: "frontier",
  auraColorInner: "rgba(80, 160, 255, ",
  auraColorMid: "rgba(40, 120, 220, ",
  auraColorOuter: "rgba(20, 80, 180, 0)",
  flameWisps: "rgba(100, 180, 255, ",
  energyRings: "rgba(60, 140, 255, ",
  capeLight: "#1a4a8a",
  capeMid: "#2266bb",
  capeDark: "#0a3366",
  capeInner: "#082244",
  sigilGlow: "rgba(80, 160, 255, ",
  beltBuckle: "#8aa8cc",
  crossguardMain: "#1a4080",
  crossguardAccent: "#2855a0",
  gemColor: "rgba(150, 220, 255, ",
  bladeRunes: "rgba(80, 180, 255, ",
  swingTrail: "rgba(100, 180, 255, ",
  swingTrailAlt: "rgba(150, 210, 255, ",
  shieldEmblem: "#2266aa",
  plume: "#3388dd",
  eyeGlow: "rgba(120, 200, 255, ",
  eyeShadow: "#4499ff",
  shockwave: "rgba(80, 160, 255, ",
};

// Red theme - General Mercer (Captain hero) summoned knights
export const KNIGHT_THEME_RED: KnightTheme = {
  name: "mercer",
  auraColorInner: "rgba(255, 60, 60, ",
  auraColorMid: "rgba(200, 30, 30, ",
  auraColorOuter: "rgba(150, 20, 20, 0)",
  flameWisps: "rgba(255, 100, 100, ",
  energyRings: "rgba(255, 50, 50, ",
  capeLight: "#8b1a1a",
  capeMid: "#cc2222",
  capeDark: "#661111",
  capeInner: "#440a0a",
  sigilGlow: "rgba(255, 80, 80, ",
  beltBuckle: "#cc9999",
  crossguardMain: "#660000",
  crossguardAccent: "#882020",
  gemColor: "rgba(255, 180, 180, ",
  bladeRunes: "rgba(255, 60, 60, ",
  swingTrail: "rgba(255, 100, 100, ",
  swingTrailAlt: "rgba(255, 150, 150, ",
  shieldEmblem: "#aa2222",
  plume: "#dd3333",
  eyeGlow: "rgba(255, 120, 120, ",
  eyeShadow: "#ff4444",
  shockwave: "rgba(255, 80, 80, ",
};

// Purple theme - Volcanic barracks knights
export const KNIGHT_THEME_PURPLE: KnightTheme = {
  name: "volcanic",
  auraColorInner: "rgba(180, 80, 255, ",
  auraColorMid: "rgba(130, 40, 220, ",
  auraColorOuter: "rgba(80, 20, 160, 0)",
  flameWisps: "rgba(200, 120, 255, ",
  energyRings: "rgba(160, 60, 255, ",
  capeLight: "#5A1A8A",
  capeMid: "#7B2FBB",
  capeDark: "#3A0A66",
  capeInner: "#280644",
  sigilGlow: "rgba(180, 100, 255, ",
  beltBuckle: "#B899CC",
  crossguardMain: "#3A0060",
  crossguardAccent: "#5520A0",
  gemColor: "rgba(220, 180, 255, ",
  bladeRunes: "rgba(180, 80, 255, ",
  swingTrail: "rgba(200, 120, 255, ",
  swingTrailAlt: "rgba(220, 170, 255, ",
  shieldEmblem: "#7A30AA",
  plume: "#9B44DD",
  eyeGlow: "rgba(200, 140, 255, ",
  eyeShadow: "#B366FF",
  shockwave: "rgba(180, 100, 255, ",
};

// Get knight theme based on owner type and map theme.
// Barracks knights adapt to the biome: orange on desert, purple on volcanic.
export function getKnightTheme(
  ownerType?: TroopOwnerType,
  mapTheme?: MapTheme,
): KnightTheme {
  if (ownerType === "barracks") {
    switch (mapTheme) {
      case "desert":
        return KNIGHT_THEME_ORANGE;
      case "volcanic":
        return KNIGHT_THEME_PURPLE;
      default:
        return KNIGHT_THEME_BLUE;
    }
  }
  switch (ownerType) {
    case "hero_summon":
      return KNIGHT_THEME_RED;
    case "station":
    case "default":
    default:
      return KNIGHT_THEME_ORANGE;
  }
}
