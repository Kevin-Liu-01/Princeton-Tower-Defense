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
    foliage: ["#1A5A20", "#2E8832", "#40A848", "#58C860"],
    leafAccent: "#70E870",
    trunk: "#6B4A35",
    trunkDark: "#3A2515",
    trunkHighlight: "#907060",
  },
  {
    foliage: ["#144A18", "#1E6B28", "#2A8838", "#1E6A1A"],
    leafAccent: "#38A840",
    trunk: "#524030",
    trunkDark: "#2D1E12",
    trunkHighlight: "#7A6048",
  },
  {
    foliage: ["#285A14", "#3A7822", "#4C9834", "#60B248"],
    leafAccent: "#78CC50",
    trunk: "#7A5A44",
    trunkDark: "#4A3228",
    trunkHighlight: "#9A7A62",
  },
  {
    foliage: ["#3A5030", "#4A6240", "#5A7450", "#6A8862"],
    leafAccent: "#7A9C72",
    trunk: "#604838",
    trunkDark: "#3A2820",
    trunkHighlight: "#806858",
  },
  {
    foliage: ["#546820", "#728832", "#90A842", "#A8C052"],
    leafAccent: "#C0D860",
    trunk: "#5D4037",
    trunkDark: "#3E2723",
    trunkHighlight: "#8D6E63",
  },
  {
    foliage: ["#1E5248", "#2A6858", "#387E6A", "#48967C"],
    leafAccent: "#58AC8C",
    trunk: "#4A5040",
    trunkDark: "#303830",
    trunkHighlight: "#6B7460",
  },
  {
    foliage: ["#105828", "#1C6E38", "#2C8848", "#3CA05A"],
    leafAccent: "#4CB86A",
    trunk: "#4E3B2A",
    trunkDark: "#362818",
    trunkHighlight: "#6A5540",
  },
  {
    foliage: ["#48581C", "#5A702C", "#6E883C", "#82A04E"],
    leafAccent: "#96B85E",
    trunk: "#5A4530",
    trunkDark: "#3D2E1C",
    trunkHighlight: "#7A6548",
  },
];

export const BUSH_PALETTES: BushPalette[] = [
  {
    accent: "#aed581",
    base: "#4caf50",
    dark: "#388e3c",
    light: "#81c784",
    mid: "#66bb6a",
    stemColor: "#5d4037",
  },
  {
    accent: "#81c784",
    base: "#388e3c",
    dark: "#2e7d32",
    light: "#66bb6a",
    mid: "#4caf50",
    stemColor: "#4a3728",
  },
  {
    accent: "#8bc34a",
    base: "#558b2f",
    dark: "#33691e",
    light: "#7cb342",
    mid: "#689f38",
    stemColor: "#5d4037",
  },
  {
    accent: "#7cb342",
    base: "#33691e",
    dark: "#1b5e20",
    light: "#689f38",
    mid: "#558b2f",
    stemColor: "#3e2723",
  },
  {
    accent: "#b5c47a",
    base: "#6b7c3f",
    dark: "#556a2f",
    light: "#9aab6a",
    mid: "#7d8e4f",
    stemColor: "#5d4037",
  },
  {
    accent: "#8aaa9a",
    base: "#5a7a6a",
    dark: "#4a6a5a",
    light: "#7a9a8a",
    mid: "#6a8a7a",
    stemColor: "#5d4c45",
  },
  {
    accent: "#c8e6c9",
    base: "#43a047",
    dark: "#2e7d32",
    light: "#a5d6a7",
    mid: "#66bb6a",
    stemColor: "#5d4037",
  },
  {
    accent: "#66bb6a",
    base: "#2e7d32",
    dark: "#1b5e20",
    light: "#4caf50",
    mid: "#388e3c",
    stemColor: "#3e2723",
  },
];

export const HEDGE_PALETTES: HedgePalette[] = [
  {
    highlight: "#5abf5a",
    leftLeaf: ["#1d5a1d", "#226822", "#1a521a", "#1f601f"],
    litFace: "#2e7a2e",
    litFaceEdge: "#267026",
    rightLeaf: ["#3a8a3a", "#348234", "#2e7a2e", "#368636"],
    shadowFace: "#1a4a1a",
    stem: "#3d2b1a",
    stemDark: "#4a3520",
    topBright: "#5abf5a",
    topDark: "#369036",
    topLeaf: ["#43a043", "#3a963a", "#4aaa4a"],
    topMid: "#43a043",
  },
  {
    highlight: "#5ad08a",
    leftLeaf: ["#1d6a3d", "#227842", "#1a623a", "#1f703f"],
    litFace: "#2e8a5e",
    litFaceEdge: "#268050",
    rightLeaf: ["#3a9a5a", "#349254", "#2e8a4e", "#369656"],
    shadowFace: "#1a5a3a",
    stem: "#3d2b1a",
    stemDark: "#4a3520",
    topBright: "#5ad08a",
    topDark: "#36a060",
    topLeaf: ["#43b070", "#3aa66a", "#4aba7a"],
    topMid: "#43b070",
  },
  {
    highlight: "#8abf5a",
    leftLeaf: ["#3d5a1d", "#426822", "#3a521a", "#3f601f"],
    litFace: "#5a7a2e",
    litFaceEdge: "#507026",
    rightLeaf: ["#6a8a3a", "#648234", "#5e7a2e", "#668636"],
    shadowFace: "#3a4a1a",
    stem: "#4a3520",
    stemDark: "#3d2b1a",
    topBright: "#8abf5a",
    topDark: "#609036",
    topLeaf: ["#70a043", "#6a963a", "#7aaa4a"],
    topMid: "#70a043",
  },
  {
    highlight: "#4aaf4a",
    leftLeaf: ["#124a12", "#165816", "#104210", "#145014"],
    litFace: "#1e6a1e",
    litFaceEdge: "#186018",
    rightLeaf: ["#2a7a2a", "#267226", "#206a20", "#287628"],
    shadowFace: "#0f3a0f",
    stem: "#2d1f14",
    stemDark: "#3d2b1a",
    topBright: "#4aaf4a",
    topDark: "#2a802a",
    topLeaf: ["#359035", "#2e862e", "#3a9a3a"],
    topMid: "#359035",
  },
];

export const TREE_ACCENT_PALETTES = {
  acorns: ["#8d6e63", "#6d4c41", "#a1887f"],
  blossoms: ["#f8bbd0", "#f48fb1", "#ffffff"],
  fruit: ["#ef5350", "#ff7043", "#e53935"],
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
  {
    dark: "#0a2a1a",
    greens: ["#1a4a3a", "#2a5a4a", "#3a6a5a", "#4a7a6a"],
    snowBlue: "#e3f2fd",
    snowWhite: "#f8f9fa",
    trunk: "#4a3728",
    trunkDark: "#2a1708",
  },
  {
    dark: "#0a1a2a",
    greens: ["#1a3a4a", "#2a4a5a", "#3a5a6a", "#4a6a7a"],
    snowBlue: "#dce8f4",
    snowWhite: "#f0f4f8",
    trunk: "#3a3028",
    trunkDark: "#1a1008",
  },
  {
    dark: "#051a10",
    greens: ["#0a3a2a", "#1a4a3a", "#2a5a4a", "#3a6a5a"],
    snowBlue: "#e0eaef",
    snowWhite: "#f5f5f5",
    trunk: "#3a2818",
    trunkDark: "#200e05",
  },
  {
    dark: "#1a2a2a",
    greens: ["#2a4a4a", "#3a5a5a", "#4a6a6a", "#5a7a7a"],
    snowBlue: "#e8f0f8",
    snowWhite: "#ffffff",
    trunk: "#5a4838",
    trunkDark: "#3a2818",
  },
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
  {
    black: "#0a0a0a",
    dark: "#1a1a1a",
    emberOrange: "#ff6600",
    emberRed: "#ff3300",
    emberYellow: "#ffaa00",
    light: "#3a3a3a",
    mid: "#2a2a2a",
  },
  {
    black: "#0a0505",
    dark: "#1a0f0f",
    emberOrange: "#ff4400",
    emberRed: "#ff2200",
    emberYellow: "#ff8800",
    light: "#3a2020",
    mid: "#2a1515",
  },
  {
    black: "#0a0a0c",
    dark: "#1a1a1e",
    emberOrange: "#ff7722",
    emberRed: "#ff4411",
    emberYellow: "#ffbb33",
    light: "#3a3a42",
    mid: "#2a2a30",
  },
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
  {
    fireflyColor: "180,255,180",
    foliage: ["#1a3a1a", "#2a4a2a", "#1a2a1a", "#2a3a2a"],
    mossDark: "#3a5a2a",
    mossLight: "#5a7a4a",
    trunkDark: "#1a1208",
    trunkLight: "#3a3228",
    trunkMid: "#2a2218",
  },
  {
    fireflyColor: "150,230,150",
    foliage: ["#0a2a0a", "#1a3a1a", "#0a1a0a", "#1a2a1a"],
    mossDark: "#2a4a1a",
    mossLight: "#4a6a3a",
    trunkDark: "#12100a",
    trunkLight: "#322e22",
    trunkMid: "#221e14",
  },
  {
    fireflyColor: "200,255,200",
    foliage: ["#2a4a2a", "#3a5a3a", "#2a3a2a", "#3a4a3a"],
    mossDark: "#4a6a3a",
    mossLight: "#6a8a5a",
    trunkDark: "#1a1410",
    trunkLight: "#3a3430",
    trunkMid: "#2a2420",
  },
  {
    fireflyColor: "160,240,160",
    foliage: ["#1a2a10", "#2a3a20", "#1a2010", "#2a3020"],
    mossDark: "#2a4020",
    mossLight: "#4a6040",
    trunkDark: "#0e0c06",
    trunkLight: "#2e2c20",
    trunkMid: "#1e1c12",
  },
];
