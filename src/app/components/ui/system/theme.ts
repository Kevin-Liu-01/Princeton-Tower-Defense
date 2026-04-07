export const AMBER = {
  100: "254,243,199",
  200: "253,230,138",
  300: "252,211,77",
  400: "251,191,36",
  50: "255,251,235",
  500: "245,158,11",
  600: "217,119,6",
  700: "180,83,9",
  800: "146,64,14",
  900: "120,53,15",
  950: "69,26,3",
} as const;

export const PANEL = {
  bgDark: "rgba(32,22,12,0.99)",
  bgDeep: "rgba(28,18,10,0.96)",
  bgDeepSolid: "rgba(28,18,10,0.99)",
  bgLight: "rgba(52,36,20,0.98)",
  bgWarmLight: "rgba(62,42,22,0.82)",
  bgWarmMid: "rgba(48,32,18,0.75)",
} as const;

export const GOLD = {
  accentBorder12: `rgba(${AMBER[400]},0.18)`,
  accentBorder15: `rgba(${AMBER[400]},0.22)`,
  accentBorder35: `rgba(${AMBER[400]},0.45)`,
  accentBorder40: `rgba(${AMBER[400]},0.5)`,
  accentBorder50: `rgba(${AMBER[400]},0.65)`,
  accentGlow08: `rgba(${AMBER[400]},0.12)`,
  accentGlow10: `rgba(${AMBER[400]},0.15)`,
  border25: "rgba(180,140,60,0.4)",
  border30: "rgba(180,140,60,0.5)",
  border35: "rgba(180,140,60,0.55)",
  border40: "rgba(180,140,60,0.6)",
  bright45: `rgba(${AMBER[300]},0.55)`,
  bright50: `rgba(${AMBER[300]},0.6)`,
  bright60: `rgba(${AMBER[300]},0.7)`,
  glow04: "rgba(180,140,60,0.08)",
  glow07: "rgba(180,140,60,0.12)",
  innerBorder08: "rgba(180,140,60,0.15)",
  innerBorder10: "rgba(180,140,60,0.18)",
  innerBorder12: "rgba(180,140,60,0.22)",
} as const;

export const DIVIDER = {
  gold25: "rgba(180,140,60,0.4)",
  gold35: "rgba(180,140,60,0.5)",
  gold40: "rgba(180,140,60,0.6)",
  gold50: "rgba(180,140,60,0.65)",
  goldCenter: `rgba(${AMBER[300]},0.7)`,
} as const;

export const RED_CARD = {
  accent35: "rgba(200,60,60,0.5)",
  bgDark: "rgba(35,18,18,0.65)",
  bgLight: "rgba(50,25,25,0.8)",
  border: "rgba(180,60,60,0.5)",
  border25: "rgba(180,60,60,0.4)",
  glow05: "rgba(180,60,60,0.08)",
  glow06: "rgba(180,60,60,0.1)",
  innerBorder10: "rgba(180,60,60,0.18)",
  innerBorder12: "rgba(180,60,60,0.2)",
} as const;

export const BLUE_CARD = {
  bgDark: "rgba(20,25,40,0.65)",
  bgLight: "rgba(30,35,50,0.8)",
  border: "rgba(80,100,160,0.5)",
  glow: "rgba(80,100,160,0.1)",
  innerBorder: "rgba(80,100,160,0.18)",
} as const;

export const GREEN_CARD = {
  bgDark: "rgba(15,30,18,0.65)",
  bgLight: "rgba(20,40,25,0.8)",
  border: "rgba(60,140,80,0.5)",
  glow: "rgba(60,140,80,0.1)",
  innerBorder: "rgba(60,140,80,0.18)",
} as const;

export const AMBER_CARD = {
  bgBase: "rgba(72,50,18,0.8)",
  bgDark: "rgba(52,35,12,0.65)",
  bgDarkAlt: "rgba(42,28,12,0.7)",
  border: "rgba(180,140,50,0.5)",
  glow: "rgba(180,140,50,0.08)",
  innerBorder: "rgba(180,140,50,0.18)",
} as const;

export const PURPLE_CARD = {
  bgDark: "rgba(35,20,45,0.65)",
  bgLight: "rgba(50,30,60,0.8)",
  border: "rgba(140,80,180,0.5)",
  glow: "rgba(140,80,180,0.1)",
  innerBorder: "rgba(140,80,180,0.18)",
} as const;

export const NEUTRAL = {
  bgDark: "rgba(20,20,20,0.7)",
  bgDarkAlt: "rgba(25,25,25,0.75)",
  bgLight: "rgba(30,30,30,0.85)",
  bgLightAlt: "rgba(35,35,35,0.9)",
  border: "rgba(80,80,80,0.35)",
  border25: "rgba(80,80,80,0.4)",
  borderMid: "rgba(100,100,100,0.4)",
  glow: "rgba(80,80,80,0.08)",
  innerBorder: "rgba(80,80,80,0.15)",
  innerBorderMid: "rgba(100,100,100,0.15)",
} as const;

export const DEFEAT = {
  accent40: "rgba(220,50,50,0.45)",
  accent50: "rgba(220,50,50,0.55)",
  border15: "rgba(139,0,0,0.2)",
  border20: "rgba(139,0,0,0.25)",
  border25: "rgba(139,0,0,0.3)",
  border30: "rgba(139,0,0,0.35)",
  border35: "rgba(139,0,0,0.4)",
  border40: "rgba(139,0,0,0.45)",
  btnDark: "rgba(55,18,18,0.94)",
  btnLight: "rgba(90,30,30,0.9)",
  glow06: "rgba(139,0,0,0.08)",
  glow07: "rgba(139,0,0,0.1)",
  innerBorder10: "rgba(139,0,0,0.14)",
  innerBorder12: "rgba(139,0,0,0.16)",
  progressBg: "rgba(40,15,15,0.7)",
} as const;

export const VICTORY = {
  blueBorder: "rgba(100,120,180,0.35)",
  blueCardBg: "rgba(38,34,50,0.65)",
  blueCardBgDark: "rgba(28,26,40,0.5)",
  btnDark: "rgba(120,78,15,0.95)",
  btnLight: "rgba(180,130,30,0.92)",
  redBorder: "rgba(180,80,80,0.35)",
  redCardBg: "rgba(50,30,30,0.65)",
  redCardBgDark: "rgba(40,22,22,0.5)",
} as const;

export const SELECTED = {
  bgDark: "rgba(110,75,15,0.55)",
  bgLight: "rgba(160,115,20,0.7)",
  warmBgDark: "rgba(80,52,14,0.35)",
  warmBgLight: "rgba(100,68,18,0.5)",
} as const;

export const OVERLAY = {
  black40: "rgba(0,0,0,0.4)",
  black50: "rgba(0,0,0,0.5)",
  black60: "rgba(0,0,0,0.6)",
  white02: "rgba(255,255,255,0.02)",
  white03: "rgba(255,255,255,0.03)",
  white04: "rgba(255,255,255,0.04)",
  white06: "rgba(255,255,255,0.06)",
  white08: "rgba(255,255,255,0.08)",
  white10: "rgba(255,255,255,0.1)",
  white15: "rgba(255,255,255,0.15)",
} as const;

export const SPEED = {
  bg: "rgba(28,22,14,0.7)",
} as const;

export const MANA = {
  blueBorder20: "rgba(30,58,138,0.2)",
  blueBorder30: "rgba(30,58,138,0.3)",
  border25: "rgba(80,120,60,0.25)",
  border30: "rgba(80,120,60,0.3)",
  fill: "rgba(28,22,14,0.6)",
} as const;

export const SPELL_THEME = {
  fire: { panelBg: "rgba(55,28,12,0.97)" },
  gold: { panelBg: "rgba(48,34,12,0.97)" },
  ice: { panelBg: "rgba(12,28,42,0.98)" },
  lightning: { panelBg: "rgba(48,38,14,0.97)" },
  nature: { panelBg: "rgba(16,32,22,0.98)" },
} as const;

export const ORNAMENT = {
  color: "#b48c3c",
  glow: "#d4a84a",
} as const;

export const panelGradient = `linear-gradient(180deg, ${PANEL.bgLight} 0%, ${PANEL.bgDark} 100%)`;
export const panelGradientReversed = `linear-gradient(180deg, ${PANEL.bgDark} 0%, ${PANEL.bgLight} 100%)`;
export const dividerGradient = `linear-gradient(90deg, transparent 0%, ${DIVIDER.gold25} 15%, ${DIVIDER.gold40} 35%, ${DIVIDER.goldCenter} 50%, ${DIVIDER.gold40} 65%, ${DIVIDER.gold25} 85%, transparent 100%)`;
