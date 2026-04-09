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
    browRidge: true,
    cheekPlates: false,
    crestHeight: 0.06,
    domeOffsetY: -0.39,
    domeRadiusX: 0.18,
    domeRadiusY: 0.185,
    hasCrest: true,
    hornlets: false,
    name: "greathelm",
    noseGuard: false,
    rearSweep: 0,
    visorType: "slit",
  },
  {
    browRidge: false,
    cheekPlates: true,
    crestHeight: 0,
    domeOffsetY: -0.4,
    domeRadiusX: 0.175,
    domeRadiusY: 0.19,
    hasCrest: false,
    hornlets: false,
    name: "barbute",
    noseGuard: false,
    rearSweep: 0.02,
    visorType: "tshaped",
  },
  {
    browRidge: true,
    cheekPlates: false,
    crestHeight: 0.04,
    domeOffsetY: -0.38,
    domeRadiusX: 0.185,
    domeRadiusY: 0.175,
    hasCrest: true,
    hornlets: false,
    name: "sallet",
    noseGuard: false,
    rearSweep: 0.08,
    visorType: "pointed",
  },
  {
    browRidge: false,
    cheekPlates: true,
    crestHeight: 0,
    domeOffsetY: -0.41,
    domeRadiusX: 0.17,
    domeRadiusY: 0.2,
    hasCrest: false,
    hornlets: false,
    name: "bascinet",
    noseGuard: true,
    rearSweep: 0.01,
    visorType: "pointed",
  },
  {
    browRidge: true,
    cheekPlates: true,
    crestHeight: 0.05,
    domeOffsetY: -0.39,
    domeRadiusX: 0.175,
    domeRadiusY: 0.18,
    hasCrest: true,
    hornlets: true,
    name: "armet",
    noseGuard: false,
    rearSweep: 0.03,
    visorType: "rounded",
  },
];

export const ARMOR_STYLES: readonly ReinforcementArmorStyle[] = [
  {
    beltDetail: "medallion",
    chestMotif: "diamond",
    greaveStyle: "smooth",
    name: "royal",
    pauldronShape: "round",
  },
  {
    beltDetail: "buckle",
    chestMotif: "cross",
    greaveStyle: "plated",
    name: "crusader",
    pauldronShape: "ridged",
  },
  {
    beltDetail: "chain",
    chestMotif: "scales",
    greaveStyle: "ridged",
    name: "dragonscale",
    pauldronShape: "spiked",
  },
  {
    beltDetail: "sash",
    chestMotif: "fluted",
    greaveStyle: "ridged",
    name: "gothic",
    pauldronShape: "layered",
  },
  {
    beltDetail: "medallion",
    chestMotif: "runic",
    greaveStyle: "plated",
    name: "wardmaster",
    pauldronShape: "winged",
  },
];

export interface ReinforcementVariation {
  helmet: ReinforcementHelmetStyle;
  armor: ReinforcementArmorStyle;
}

// Deterministic hash from a string ID.
// Stable across zoom levels, camera pans, and frame redraws.
function hashString(str: string): number {
  let h = 0x81_1C_9D_C5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.codePointAt(i);
    h = Math.imul(h, 0x01_00_01_93);
  }
  return h >>> 0;
}

export function getReinforcementVariation(
  troopId?: string
): ReinforcementVariation {
  const h = hashString(troopId ?? "default");
  const helmetIdx = h % HELMET_STYLES.length;
  const armorIdx = ((h >>> 8) + 3) % ARMOR_STYLES.length;
  return {
    armor: ARMOR_STYLES[armorIdx],
    helmet: HELMET_STYLES[helmetIdx],
  };
}

interface CodexReinforcementVariant {
  troopId: string;
  label: string;
}

function buildCodexVariants(): CodexReinforcementVariant[] {
  const results: CodexReinforcementVariant[] = [];
  const seenHelmets = new Set<string>();

  const tryAdd = (id: string) => {
    const variation = getReinforcementVariation(id);
    if (!seenHelmets.has(variation.helmet.name)) {
      seenHelmets.add(variation.helmet.name);
      const { name } = variation.helmet;
      results.push({
        label: name.charAt(0).toUpperCase() + name.slice(1),
        troopId: id,
      });
    }
  };

  tryAdd("default");
  for (let i = 0; seenHelmets.size < HELMET_STYLES.length && i < 1000; i++) {
    tryAdd(`codex_v${i}`);
  }
  return results;
}

export const CODEX_REINFORCEMENT_VARIANTS: readonly CodexReinforcementVariant[] =
  buildCodexVariants();

export const REINFORCEMENT_TIER_COUNT = 7;

export const REINFORCEMENT_TIER_LABELS: readonly string[] = [
  "Tier 1",
  "Tier 2",
  "Tier 3",
  "Tier 4",
  "Tier 5",
  "Tier 6 — Lancer",
  "Tier 7 — Lancer",
];
