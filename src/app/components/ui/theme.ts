// =============================================================================
// ORNATE UI THEME COLORS
// =============================================================================
// Centralized color tokens for the ornate fantasy UI design system.
// All rgba values used across panels, cards, borders, glows, and dividers
// are defined here to ensure consistency and easy theming.

// -----------------------------------------------------------------------------
// Amber Palette (Tailwind CSS amber scale as RGB triplets)
// Usage: `rgba(${AMBER[900]}, 0.5)` for flexible alpha composition
// -----------------------------------------------------------------------------
export const AMBER = {
  50: "255,251,235",   // #fffbeb
  100: "254,243,199",  // #fef3c7
  200: "253,230,138",  // #fde68a
  300: "252,211,77",   // #fcd34d
  400: "251,191,36",   // #fbbf24
  500: "245,158,11",   // #f59e0b
  600: "217,119,6",    // #d97706
  700: "180,83,9",     // #b45309
  800: "146,64,14",    // #92400e
  900: "120,53,15",    // #78350f
  950: "69,26,3",      // #451a03
} as const;

// -----------------------------------------------------------------------------
// Panel System (warm brown backgrounds for OrnateFrame panels)
// Desaturated warm browns — warmer than grey but not orange
// -----------------------------------------------------------------------------
export const PANEL = {
  bgLight: "rgba(52,36,20,0.98)",      // warm brown panel top
  bgDark: "rgba(32,22,12,0.99)",       // deep warm brown panel bottom
  bgDeep: "rgba(28,18,10,0.96)",       // deep warm brown
  bgDeepSolid: "rgba(28,18,10,0.99)",  // near-opaque deep brown
  bgWarmMid: "rgba(48,32,18,0.75)",    // card/button bg gradient end
  bgWarmLight: "rgba(62,42,22,0.82)",  // card/button bg gradient start
} as const;

// -----------------------------------------------------------------------------
// Gold / Amber Accents (borders, glows, dividers)
// Gold-yellow (180,140,60) for border pop against amber backgrounds
// -----------------------------------------------------------------------------
export const GOLD = {
  // Outer borders — strengthened for visibility
  border25: "rgba(180,140,60,0.4)",
  border30: "rgba(180,140,60,0.5)",
  border35: "rgba(180,140,60,0.55)",
  border40: "rgba(180,140,60,0.6)",
  // Inner / ghost borders — boosted
  innerBorder08: "rgba(180,140,60,0.15)",
  innerBorder10: "rgba(180,140,60,0.18)",
  innerBorder12: "rgba(180,140,60,0.22)",
  // Box-shadow glow — boosted
  glow04: "rgba(180,140,60,0.08)",
  glow07: "rgba(180,140,60,0.12)",
  // Bright accent (selected states) — amber-400 based
  accentBorder50: `rgba(${AMBER[400]},0.65)`,
  accentBorder40: `rgba(${AMBER[400]},0.5)`,
  accentBorder35: `rgba(${AMBER[400]},0.45)`,
  accentBorder15: `rgba(${AMBER[400]},0.22)`,
  accentBorder12: `rgba(${AMBER[400]},0.18)`,
  accentGlow08: `rgba(${AMBER[400]},0.12)`,
  accentGlow10: `rgba(${AMBER[400]},0.15)`,
  // Bright gold highlights — amber-300 based
  bright50: `rgba(${AMBER[300]},0.6)`,
  bright60: `rgba(${AMBER[300]},0.7)`,
  bright45: `rgba(${AMBER[300]},0.55)`,
} as const;

// -----------------------------------------------------------------------------
// Divider / Ornate Line Gradients
// These are used in linear-gradient(...) for thin horizontal dividers.
// Typical pattern: transparent → border25 → border40 → bright50 → border40 → border25 → transparent
// -----------------------------------------------------------------------------
export const DIVIDER = {
  gold25: "rgba(180,140,60,0.4)",
  gold35: "rgba(180,140,60,0.5)",
  gold40: "rgba(180,140,60,0.6)",
  gold50: "rgba(180,140,60,0.65)",
  goldCenter: `rgba(${AMBER[300]},0.7)`,
} as const;

// -----------------------------------------------------------------------------
// Stat Card Themes — Red (hearts, damage, defeat)
// -----------------------------------------------------------------------------
export const RED_CARD = {
  bgLight: "rgba(50,25,25,0.8)",
  bgDark: "rgba(35,18,18,0.65)",
  border: "rgba(180,60,60,0.5)",
  border25: "rgba(180,60,60,0.4)",
  innerBorder12: "rgba(180,60,60,0.2)",
  innerBorder10: "rgba(180,60,60,0.18)",
  glow06: "rgba(180,60,60,0.1)",
  glow05: "rgba(180,60,60,0.08)",
  accent35: "rgba(200,60,60,0.5)",
} as const;

// -----------------------------------------------------------------------------
// Stat Card Themes — Blue (battles, mana)
// -----------------------------------------------------------------------------
export const BLUE_CARD = {
  bgLight: "rgba(30,35,50,0.8)",
  bgDark: "rgba(20,25,40,0.65)",
  border: "rgba(80,100,160,0.5)",
  innerBorder: "rgba(80,100,160,0.18)",
  glow: "rgba(80,100,160,0.1)",
} as const;

// -----------------------------------------------------------------------------
// Stat Card Themes — Green (victories, nature)
// -----------------------------------------------------------------------------
export const GREEN_CARD = {
  bgLight: "rgba(20,40,25,0.8)",
  bgDark: "rgba(15,30,18,0.65)",
  border: "rgba(60,140,80,0.5)",
  innerBorder: "rgba(60,140,80,0.18)",
  glow: "rgba(60,140,80,0.1)",
} as const;

// -----------------------------------------------------------------------------
// Stat Card Themes — Amber / Stars — warm amber-700/800
// -----------------------------------------------------------------------------
export const AMBER_CARD = {
  bgBase: "rgba(72,50,18,0.8)",     // warm brown-gold stat card top
  bgDark: "rgba(52,35,12,0.65)",    // warm brown-gold stat card bottom
  bgDarkAlt: "rgba(42,28,12,0.7)",
  border: "rgba(180,140,50,0.5)",
  innerBorder: "rgba(180,140,50,0.18)",
  glow: "rgba(180,140,50,0.08)",
} as const;

// -----------------------------------------------------------------------------
// Stat Card Themes — Purple (codex, special)
// -----------------------------------------------------------------------------
export const PURPLE_CARD = {
  bgLight: "rgba(50,30,60,0.8)",
  bgDark: "rgba(35,20,45,0.65)",
  border: "rgba(140,80,180,0.5)",
  innerBorder: "rgba(140,80,180,0.18)",
  glow: "rgba(140,80,180,0.1)",
} as const;

// -----------------------------------------------------------------------------
// Neutral / Disabled (gray tones for inactive states)
// -----------------------------------------------------------------------------
export const NEUTRAL = {
  bgLight: "rgba(30,30,30,0.85)",
  bgDark: "rgba(20,20,20,0.7)",
  bgLightAlt: "rgba(35,35,35,0.9)",
  bgDarkAlt: "rgba(25,25,25,0.75)",
  border: "rgba(80,80,80,0.35)",
  border25: "rgba(80,80,80,0.4)",
  innerBorder: "rgba(80,80,80,0.15)",
  glow: "rgba(80,80,80,0.08)",
  borderMid: "rgba(100,100,100,0.4)",
  innerBorderMid: "rgba(100,100,100,0.15)",
} as const;

// -----------------------------------------------------------------------------
// Defeat Screen — Crimson / Dark Red
// -----------------------------------------------------------------------------
export const DEFEAT = {
  border30: "rgba(139,0,0,0.3)",
  border25: "rgba(139,0,0,0.25)",
  border20: "rgba(139,0,0,0.2)",
  border15: "rgba(139,0,0,0.15)",
  innerBorder12: "rgba(139,0,0,0.12)",
  innerBorder10: "rgba(139,0,0,0.1)",
  glow07: "rgba(139,0,0,0.07)",
  glow06: "rgba(139,0,0,0.06)",
  accent40: "rgba(200,50,50,0.4)",
  accent50: "rgba(200,50,50,0.5)",
  progressBg: "rgba(40,15,15,0.6)",
  btnLight: "rgba(80,30,30,0.85)",
  btnDark: "rgba(45,15,15,0.9)",
  border35: "rgba(139,0,0,0.35)",
  border40: "rgba(139,0,0,0.4)",
} as const;

// -----------------------------------------------------------------------------
// Victory Screen — Warm Gold
// -----------------------------------------------------------------------------
export const VICTORY = {
  blueCardBg: "rgba(38,34,50,0.6)",
  blueCardBgDark: "rgba(28,26,40,0.4)",
  blueBorder: "rgba(100,120,180,0.25)",
  redCardBg: "rgba(50,30,30,0.6)",
  redCardBgDark: "rgba(40,22,22,0.4)",
  redBorder: "rgba(180,80,80,0.25)",
  btnLight: "rgba(170,125,30,0.88)",
  btnDark: "rgba(110,72,15,0.92)",
} as const;

// -----------------------------------------------------------------------------
// Selected / Active States — amber-500/600 for bright interactive warmth
// -----------------------------------------------------------------------------
export const SELECTED = {
  bgLight: "rgba(160,115,20,0.7)",     // golden highlight (not orange)
  bgDark: "rgba(110,75,15,0.55)",      // darker golden
  warmBgLight: "rgba(100,68,18,0.5)",
  warmBgDark: "rgba(80,52,14,0.35)",
} as const;

// -----------------------------------------------------------------------------
// Overlay / Shadow
// -----------------------------------------------------------------------------
export const OVERLAY = {
  black60: "rgba(0,0,0,0.6)",
  black50: "rgba(0,0,0,0.5)",
  black40: "rgba(0,0,0,0.4)",
  white15: "rgba(255,255,255,0.15)",
  white10: "rgba(255,255,255,0.1)",
  white08: "rgba(255,255,255,0.08)",
  white06: "rgba(255,255,255,0.06)",
  white04: "rgba(255,255,255,0.04)",
  white03: "rgba(255,255,255,0.03)",
  white02: "rgba(255,255,255,0.02)",
} as const;

// -----------------------------------------------------------------------------
// Speed Control
// -----------------------------------------------------------------------------
export const SPEED = {
  bg: "rgba(28,22,14,0.7)",
} as const;

// -----------------------------------------------------------------------------
// Mana Bar
// -----------------------------------------------------------------------------
export const MANA = {
  border30: "rgba(80,120,60,0.3)",
  border25: "rgba(80,120,60,0.25)",
  fill: "rgba(28,22,14,0.6)",
  blueBorder20: "rgba(30,58,138,0.2)",
  blueBorder30: "rgba(30,58,138,0.3)",
} as const;

// -----------------------------------------------------------------------------
// HeroSpellBar Spell Themes (per-element flavor colors)
// These override the base panel/gold tokens for individual spell elements.
// -----------------------------------------------------------------------------
export const SPELL_THEME = {
  fire: { panelBg: "rgba(55,28,12,0.97)" },       // warm brown-red
  lightning: { panelBg: "rgba(48,38,14,0.97)" },   // warm brown-gold
  ice: { panelBg: "rgba(12,28,42,0.98)" },         // cool dark blue
  gold: { panelBg: "rgba(48,34,12,0.97)" },        // warm brown-gold
  nature: { panelBg: "rgba(16,32,22,0.98)" },      // dark green
} as const;

// -----------------------------------------------------------------------------
// Convenience: common gradient strings
// -----------------------------------------------------------------------------

/** Standard ornate panel background gradient (top to bottom) */
export const panelGradient = `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)`;

/** Reversed panel gradient */
export const panelGradientReversed = `linear-gradient(180deg, ${PANEL.bgDark} 0%, ${PANEL.bgLight} 100%)`;

/** Standard ornate divider line gradient */
export const dividerGradient = `linear-gradient(90deg, transparent 0%, ${DIVIDER.gold25} 15%, ${DIVIDER.gold40} 35%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 65%, ${DIVIDER.gold25} 85%, transparent 100%)`;
