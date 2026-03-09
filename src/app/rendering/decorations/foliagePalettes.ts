export interface TreePalette {
  trunk: string;
  trunkDark: string;
  trunkHighlight: string;
  foliage: [string, string, string, string];
  leafAccent: string;
}

export interface BushPalette {
  base: string;
  mid: string;
  light: string;
  dark: string;
  accent: string;
  stemColor: string;
}

export interface HedgePalette {
  shadowFace: string;
  litFace: string;
  litFaceEdge: string;
  topBright: string;
  topMid: string;
  topDark: string;
  leftLeaf: [string, string, string, string];
  rightLeaf: [string, string, string, string];
  topLeaf: [string, string, string];
  highlight: string;
  stem: string;
  stemDark: string;
}

export const TREE_PALETTES: TreePalette[] = [
  {
    trunk: "#5d4037",
    trunkDark: "#3e2723",
    trunkHighlight: "#795548",
    foliage: ["#2e7d32", "#388e3c", "#43a047", "#4caf50"],
    leafAccent: "#66bb6a",
  },
  {
    trunk: "#4a3728",
    trunkDark: "#2d1f14",
    trunkHighlight: "#6d5040",
    foliage: ["#1b5e20", "#2e7d32", "#388e3c", "#33691e"],
    leafAccent: "#4caf50",
  },
  {
    trunk: "#6d4c41",
    trunkDark: "#4e342e",
    trunkHighlight: "#8d6e63",
    foliage: ["#33691e", "#558b2f", "#689f38", "#7cb342"],
    leafAccent: "#8bc34a",
  },
  {
    trunk: "#5d4037",
    trunkDark: "#3e2723",
    trunkHighlight: "#795548",
    foliage: ["#4a6741", "#5a7751", "#6a8761", "#7a9771"],
    leafAccent: "#8aab81",
  },
  {
    trunk: "#5d4037",
    trunkDark: "#3e2723",
    trunkHighlight: "#8d6e63",
    foliage: ["#6b7b34", "#8a9944", "#a8b84c", "#b8c45c"],
    leafAccent: "#c8d46c",
  },
  {
    trunk: "#4a5040",
    trunkDark: "#333b30",
    trunkHighlight: "#6b7460",
    foliage: ["#2e6b5e", "#3a7d6e", "#4a8d7e", "#5a9d8e"],
    leafAccent: "#6aad9e",
  },
  {
    trunk: "#4e3b2a",
    trunkDark: "#362818",
    trunkHighlight: "#6a5540",
    foliage: ["#1a6b3a", "#2a7d4a", "#3a8d5a", "#4a9d6a"],
    leafAccent: "#5aad7a",
  },
  {
    trunk: "#5a4530",
    trunkDark: "#3d2e1c",
    trunkHighlight: "#7a6548",
    foliage: ["#5a6b2e", "#6a7b3e", "#7a8b4e", "#8a9b5e"],
    leafAccent: "#9aab6e",
  },
];

export const BUSH_PALETTES: BushPalette[] = [
  { base: "#4caf50", mid: "#66bb6a", light: "#81c784", dark: "#388e3c", accent: "#aed581", stemColor: "#5d4037" },
  { base: "#388e3c", mid: "#4caf50", light: "#66bb6a", dark: "#2e7d32", accent: "#81c784", stemColor: "#4a3728" },
  { base: "#558b2f", mid: "#689f38", light: "#7cb342", dark: "#33691e", accent: "#8bc34a", stemColor: "#5d4037" },
  { base: "#33691e", mid: "#558b2f", light: "#689f38", dark: "#1b5e20", accent: "#7cb342", stemColor: "#3e2723" },
  { base: "#6b7c3f", mid: "#7d8e4f", light: "#9aab6a", dark: "#556a2f", accent: "#b5c47a", stemColor: "#5d4037" },
  { base: "#5a7a6a", mid: "#6a8a7a", light: "#7a9a8a", dark: "#4a6a5a", accent: "#8aaa9a", stemColor: "#5d4c45" },
  { base: "#43a047", mid: "#66bb6a", light: "#a5d6a7", dark: "#2e7d32", accent: "#c8e6c9", stemColor: "#5d4037" },
  { base: "#2e7d32", mid: "#388e3c", light: "#4caf50", dark: "#1b5e20", accent: "#66bb6a", stemColor: "#3e2723" },
];

export const HEDGE_PALETTES: HedgePalette[] = [
  {
    shadowFace: "#1a4a1a",
    litFace: "#2e7a2e",
    litFaceEdge: "#267026",
    topBright: "#5abf5a",
    topMid: "#43a043",
    topDark: "#369036",
    leftLeaf: ["#1d5a1d", "#226822", "#1a521a", "#1f601f"],
    rightLeaf: ["#3a8a3a", "#348234", "#2e7a2e", "#368636"],
    topLeaf: ["#43a043", "#3a963a", "#4aaa4a"],
    highlight: "#5abf5a",
    stem: "#3d2b1a",
    stemDark: "#4a3520",
  },
  {
    shadowFace: "#1a5a3a",
    litFace: "#2e8a5e",
    litFaceEdge: "#268050",
    topBright: "#5ad08a",
    topMid: "#43b070",
    topDark: "#36a060",
    leftLeaf: ["#1d6a3d", "#227842", "#1a623a", "#1f703f"],
    rightLeaf: ["#3a9a5a", "#349254", "#2e8a4e", "#369656"],
    topLeaf: ["#43b070", "#3aa66a", "#4aba7a"],
    highlight: "#5ad08a",
    stem: "#3d2b1a",
    stemDark: "#4a3520",
  },
  {
    shadowFace: "#3a4a1a",
    litFace: "#5a7a2e",
    litFaceEdge: "#507026",
    topBright: "#8abf5a",
    topMid: "#70a043",
    topDark: "#609036",
    leftLeaf: ["#3d5a1d", "#426822", "#3a521a", "#3f601f"],
    rightLeaf: ["#6a8a3a", "#648234", "#5e7a2e", "#668636"],
    topLeaf: ["#70a043", "#6a963a", "#7aaa4a"],
    highlight: "#8abf5a",
    stem: "#4a3520",
    stemDark: "#3d2b1a",
  },
  {
    shadowFace: "#0f3a0f",
    litFace: "#1e6a1e",
    litFaceEdge: "#186018",
    topBright: "#4aaf4a",
    topMid: "#359035",
    topDark: "#2a802a",
    leftLeaf: ["#124a12", "#165816", "#104210", "#145014"],
    rightLeaf: ["#2a7a2a", "#267226", "#206a20", "#287628"],
    topLeaf: ["#359035", "#2e862e", "#3a9a3a"],
    highlight: "#4aaf4a",
    stem: "#2d1f14",
    stemDark: "#3d2b1a",
  },
];

export const TREE_ACCENT_PALETTES = {
  fruit: ["#ef5350", "#ff7043", "#e53935"],
  blossoms: ["#f8bbd0", "#f48fb1", "#ffffff"],
  acorns: ["#8d6e63", "#6d4c41", "#a1887f"],
};

export const BUSH_ACCENT_PALETTES = {
  berries: ["#ef5350", "#ff7043", "#ffca28"],
  wildflowers: ["#ce93d8", "#ba68c8", "#ffffff", "#f48fb1"],
  yellowFlowers: ["#ffd54f", "#ffca28", "#fff176"],
};

export const HEDGE_FLOWER_PALETTES = [
  ["#ff4081", "#ffffff", "#ffeb3b", "#ff80ab", "#e8f5e9"],
  ["#ce93d8", "#e1bee7", "#ffffff", "#f3e5f5", "#e8f5e9"],
  ["#ffb74d", "#ffe082", "#ffffff", "#fff3e0", "#e8f5e9"],
  ["#ef9a9a", "#ffffff", "#ffcdd2", "#fce4ec", "#e8f5e9"],
];

export interface PinePalette {
  greens: [string, string, string, string];
  dark: string;
  trunk: string;
  trunkDark: string;
  snowWhite: string;
  snowBlue: string;
}

export const PINE_PALETTES: PinePalette[] = [
  { greens: ["#1a4a3a", "#2a5a4a", "#3a6a5a", "#4a7a6a"], dark: "#0a2a1a", trunk: "#4a3728", trunkDark: "#2a1708", snowWhite: "#f8f9fa", snowBlue: "#e3f2fd" },
  { greens: ["#1a3a4a", "#2a4a5a", "#3a5a6a", "#4a6a7a"], dark: "#0a1a2a", trunk: "#3a3028", trunkDark: "#1a1008", snowWhite: "#f0f4f8", snowBlue: "#dce8f4" },
  { greens: ["#0a3a2a", "#1a4a3a", "#2a5a4a", "#3a6a5a"], dark: "#051a10", trunk: "#3a2818", trunkDark: "#200e05", snowWhite: "#f5f5f5", snowBlue: "#e0eaef" },
  { greens: ["#2a4a4a", "#3a5a5a", "#4a6a6a", "#5a7a7a"], dark: "#1a2a2a", trunk: "#5a4838", trunkDark: "#3a2818", snowWhite: "#ffffff", snowBlue: "#e8f0f8" },
];

export interface CharredTreePalette {
  black: string;
  dark: string;
  mid: string;
  light: string;
  emberOrange: string;
  emberYellow: string;
  emberRed: string;
}

export const CHARRED_TREE_PALETTES: CharredTreePalette[] = [
  { black: "#0a0a0a", dark: "#1a1a1a", mid: "#2a2a2a", light: "#3a3a3a", emberOrange: "#ff6600", emberYellow: "#ffaa00", emberRed: "#ff3300" },
  { black: "#0a0505", dark: "#1a0f0f", mid: "#2a1515", light: "#3a2020", emberOrange: "#ff4400", emberYellow: "#ff8800", emberRed: "#ff2200" },
  { black: "#0a0a0c", dark: "#1a1a1e", mid: "#2a2a30", light: "#3a3a42", emberOrange: "#ff7722", emberYellow: "#ffbb33", emberRed: "#ff4411" },
];

export interface SwampTreePalette {
  trunkDark: string;
  trunkMid: string;
  trunkLight: string;
  mossLight: string;
  mossDark: string;
  foliage: [string, string, string, string];
  fireflyColor: string;
}

export const SWAMP_TREE_PALETTES: SwampTreePalette[] = [
  { trunkDark: "#1a1208", trunkMid: "#2a2218", trunkLight: "#3a3228", mossLight: "#5a7a4a", mossDark: "#3a5a2a", foliage: ["#1a3a1a", "#2a4a2a", "#1a2a1a", "#2a3a2a"], fireflyColor: "180,255,180" },
  { trunkDark: "#12100a", trunkMid: "#221e14", trunkLight: "#322e22", mossLight: "#4a6a3a", mossDark: "#2a4a1a", foliage: ["#0a2a0a", "#1a3a1a", "#0a1a0a", "#1a2a1a"], fireflyColor: "150,230,150" },
  { trunkDark: "#1a1410", trunkMid: "#2a2420", trunkLight: "#3a3430", mossLight: "#6a8a5a", mossDark: "#4a6a3a", foliage: ["#2a4a2a", "#3a5a3a", "#2a3a2a", "#3a4a3a"], fireflyColor: "200,255,200" },
  { trunkDark: "#0e0c06", trunkMid: "#1e1c12", trunkLight: "#2e2c20", mossLight: "#4a6040", mossDark: "#2a4020", foliage: ["#1a2a10", "#2a3a20", "#1a2010", "#2a3020"], fireflyColor: "160,240,160" },
];
