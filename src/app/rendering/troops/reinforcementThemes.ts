// Deterministic variation system for reinforcement troops.
// Each troop gets a unique visual based on a hash of its position,
// producing varied helmet shapes, armor patterns, and accent details.

export interface ReinforcementHelmetStyle {
  name: string;
  // Structural shape parameters (all relative to size)
  domeRadiusX: number;
  domeRadiusY: number;
  domeOffsetY: number;
  hasCrest: boolean;
  crestHeight: number;
  visorType: "slit" | "tshaped" | "pointed" | "rounded";
  rearSweep: number; // 0 = none, positive = swept back
  cheekPlates: boolean;
  noseGuard: boolean;
  browRidge: boolean;
  hornlets: boolean;
}

export interface ReinforcementArmorStyle {
  name: string;
  chestMotif: "diamond" | "cross" | "scales" | "fluted" | "runic";
  pauldronShape: "round" | "ridged" | "spiked" | "layered" | "winged";
  beltDetail: "buckle" | "sash" | "chain" | "medallion";
  greaveStyle: "smooth" | "ridged" | "plated";
}

export const HELMET_STYLES: readonly ReinforcementHelmetStyle[] = [
  {
    name: "greathelm",
    domeRadiusX: 0.18,
    domeRadiusY: 0.185,
    domeOffsetY: -0.39,
    hasCrest: true,
    crestHeight: 0.06,
    visorType: "slit",
    rearSweep: 0,
    cheekPlates: false,
    noseGuard: false,
    browRidge: true,
    hornlets: false,
  },
  {
    name: "barbute",
    domeRadiusX: 0.175,
    domeRadiusY: 0.19,
    domeOffsetY: -0.40,
    hasCrest: false,
    crestHeight: 0,
    visorType: "tshaped",
    rearSweep: 0.02,
    cheekPlates: true,
    noseGuard: false,
    browRidge: false,
    hornlets: false,
  },
  {
    name: "sallet",
    domeRadiusX: 0.185,
    domeRadiusY: 0.175,
    domeOffsetY: -0.38,
    hasCrest: true,
    crestHeight: 0.04,
    visorType: "pointed",
    rearSweep: 0.08,
    cheekPlates: false,
    noseGuard: false,
    browRidge: true,
    hornlets: false,
  },
  {
    name: "bascinet",
    domeRadiusX: 0.17,
    domeRadiusY: 0.20,
    domeOffsetY: -0.41,
    hasCrest: false,
    crestHeight: 0,
    visorType: "pointed",
    rearSweep: 0.01,
    cheekPlates: true,
    noseGuard: true,
    browRidge: false,
    hornlets: false,
  },
  {
    name: "armet",
    domeRadiusX: 0.175,
    domeRadiusY: 0.18,
    domeOffsetY: -0.39,
    hasCrest: true,
    crestHeight: 0.05,
    visorType: "rounded",
    rearSweep: 0.03,
    cheekPlates: true,
    noseGuard: false,
    browRidge: true,
    hornlets: true,
  },
];

export const ARMOR_STYLES: readonly ReinforcementArmorStyle[] = [
  {
    name: "royal",
    chestMotif: "diamond",
    pauldronShape: "round",
    beltDetail: "medallion",
    greaveStyle: "smooth",
  },
  {
    name: "crusader",
    chestMotif: "cross",
    pauldronShape: "ridged",
    beltDetail: "buckle",
    greaveStyle: "plated",
  },
  {
    name: "dragonscale",
    chestMotif: "scales",
    pauldronShape: "spiked",
    beltDetail: "chain",
    greaveStyle: "ridged",
  },
  {
    name: "gothic",
    chestMotif: "fluted",
    pauldronShape: "layered",
    beltDetail: "sash",
    greaveStyle: "ridged",
  },
  {
    name: "wardmaster",
    chestMotif: "runic",
    pauldronShape: "winged",
    beltDetail: "medallion",
    greaveStyle: "plated",
  },
];

export interface ReinforcementVariation {
  helmet: ReinforcementHelmetStyle;
  armor: ReinforcementArmorStyle;
}

// Deterministic hash from a string ID.
// Stable across zoom levels, camera pans, and frame redraws.
function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function getReinforcementVariation(
  troopId?: string,
): ReinforcementVariation {
  const h = hashString(troopId ?? "default");
  const helmetIdx = h % HELMET_STYLES.length;
  const armorIdx = ((h >>> 8) + 3) % ARMOR_STYLES.length;
  return {
    helmet: HELMET_STYLES[helmetIdx],
    armor: ARMOR_STYLES[armorIdx],
  };
}
