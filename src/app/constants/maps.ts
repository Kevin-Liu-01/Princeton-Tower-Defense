import type { MapDecoration, MapHazard, TowerType } from "../types";

// =============================================================================
// MAP PATHS - All regions including secondary paths for dual-path levels
// =============================================================================
export const MAP_PATHS: Record<string, { x: number; y: number }[]> = {
  // =====================
  // GRASSLAND REGION (Princeton Grounds)
  // All paths expanded and centered for 30x30 grid
  // =====================
  poe: [
    { x: -5, y: 15 },
    { x: 4, y: 15 },
    { x: 10, y: 15 },
    { x: 10, y: 8 },
    { x: 16, y: 8 },
    { x: 16, y: 18 },
    { x: 22, y: 18 },
    { x: 22, y: 12 },
    { x: 28, y: 12 },
    { x: 37, y: 12 },
  ],
  carnegie: [
    { x: 15, y: -7 },
    { x: 15, y: 6 },
    { x: 9, y: 6 },
    { x: 9, y: 14 },
    { x: 15, y: 14 },
    { x: 15, y: 20 },
    { x: 21, y: 20 },
    { x: 21, y: 10 },
    { x: 26, y: 10 },
    { x: 26, y: 20 },
    { x: 26, y: 28 },
    { x: 26, y: 35 },
  ],
  nassau: [
    { x: -5, y: 15 },
    { x: 5, y: 15 },
    { x: 5, y: 23 },
    { x: 12, y: 23 },
    { x: 12, y: 12 },
    { x: 5, y: 12 },
    { x: 5, y: 4 },
    { x: 10, y: 4 },
    { x: 10, y: 8 },
    { x: 17, y: 8 },
    { x: 17, y: 6 },
    { x: 21, y: 6 },
    { x: 21, y: 13 },
    { x: 26, y: 13 },
    { x: 26, y: 5 },
    { x: 35, y: 5 },
  ],
  // =====================
  // SWAMP REGION (Murky Marshes)
  // =====================
  bog: [
    { x: -5, y: 8 },
    { x: 6, y: 8 },
    { x: 6, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 19 },
    { x: 24, y: 19 },
    { x: 24, y: 6 },
    { x: 35, y: 6 },
  ],
  witch_hut: [
    { x: 12, y: -7 },
    { x: 12, y: 1 },
    { x: 19, y: 1 },
    { x: 19, y: 4.5 },
    { x: 9, y: 4.5 },
    { x: 9, y: 10 },
    { x: 9, y: 16 },
    { x: 15, y: 16 },
    { x: 21, y: 16 },
    { x: 21, y: 10 },
    { x: 27, y: 10 },
    { x: 27, y: 14 },
    { x: 27, y: 16 },
    { x: 27, y: 21 },
    { x: 18, y: 21 },
    { x: 18, y: 37 },
  ],
  sunken_temple: [
    { x: -5, y: 8 },
    { x: 4, y: 8 },
    { x: 4, y: 14 },
    { x: 7, y: 14 },
    { x: 7, y: 8 },
    { x: 11, y: 8 },
    { x: 11, y: 11 },
    { x: 11, y: 16 },
    { x: 14, y: 16 },
    { x: 14, y: 12.5 },
    { x: 18, y: 12.5 },
    { x: 18, y: 16 },
    { x: 24, y: 16 },
    { x: 24, y: 24 },
    { x: 30, y: 24 },
    { x: 30, y: 21 },
    { x: 32, y: 21 },
    { x: 41, y: 21 },
  ],
  // Secondary path for sunken temple
  sunken_temple_b: [
    { x: -5, y: 25 },
    { x: 5, y: 25 },
    { x: 5, y: 20 },
    { x: 10, y: 20 },
    { x: 10, y: 26 },
    { x: 14, y: 26 },
    { x: 14, y: 22 },
    { x: 18, y: 22 },
    { x: 18, y: 16 },
    { x: 24, y: 16 },
    { x: 24, y: 4 },
    { x: 28, y: 4 },
    { x: 28, y: 8 },
    { x: 32, y: 8 },
    { x: 32, y: 8 },
    { x: 36, y: 8 },
    { x: 41, y: 8 },
  ],
  // =====================
  // DESERT REGION (Sahara Sands)
  // =====================
  oasis: [
    { x: -8, y: 10 },
    { x: 2, y: 10 },
    { x: 2, y: 18 },
    { x: 6, y: 18 },
    { x: 6, y: 11 },
    { x: 10, y: 11 },
    { x: 10, y: 20 },
    { x: 20, y: 20 },
    { x: 20, y: 11 },
    { x: 15, y: 11 },
    { x: 15, y: 4 },
    { x: 24, y: 4 },
    { x: 24, y: 9 },
    { x: 30, y: 9 },
    { x: 30, y: 17 },
    { x: 32, y: 18 },
    { x: 39, y: 18 },
  ],
  pyramid: [
    { x: 15, y: -7 },
    { x: 15, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 8 },
    { x: 12, y: 8 },
    { x: 12, y: 12 },
    { x: 7, y: 12 },
    { x: 7, y: 15 },
    { x: 11, y: 15 },
    { x: 11, y: 19 },
    { x: 9, y: 19 },
    { x: 9, y: 24 },
    { x: 15, y: 24 },
    { x: 15, y: 30 },
    { x: 15, y: 37 },
  ],
  // Secondary path for pyramid
  pyramid_b: [
    { x: 37, y: 16 },
    { x: 27, y: 16 },
    { x: 27, y: 8 },
    { x: 23, y: 8 },
    { x: 23, y: 12 },
    { x: 19, y: 12 },
    { x: 19, y: 17 },
    { x: 24.5, y: 17 },
    { x: 24.5, y: 20 },
    { x: 22, y: 20 },
    { x: 22, y: 24 },
    { x: 15, y: 24 },
    { x: 15, y: 30 },
    { x: 15, y: 37 },
  ],
  sphinx: [
    { x: -9, y: 16 },
    { x: 2, y: 16 },
    { x: 2, y: 8 },
    { x: 8, y: 8 },
    { x: 8, y: 26 },
    { x: 14, y: 26 },
    { x: 14, y: 15 },
    { x: 16, y: 15 },
    { x: 16, y: 11 },
    { x: 12, y: 11 },
    { x: 12, y: 8 },
    { x: 20, y: 8 },
    { x: 20, y: 16.5 },
    { x: 26, y: 16.5 },
    { x: 26, y: 5.5 },
    { x: 30, y: 5 },
    { x: 37, y: 5 },
  ],
  // =====================
  // WINTER REGION (Frozen Frontier)
  // =====================
  glacier: [
    { x: -5, y: 12 },
    { x: 6, y: 12 },
    { x: 6, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 20 },
    { x: 18, y: 24 },
    { x: 24, y: 24 },
    { x: 24, y: 20 },
    { x: 30, y: 20 },
    { x: 30, y: 12 },
    { x: 39, y: 12 },
  ],
  fortress: [
    { x: 15, y: -10 },
    { x: 15, y: -2 },
    { x: 12, y: -2 },
    { x: 12, y: 4 },
    { x: 9, y: 4 },
    { x: 9, y: 10 },
    { x: 15, y: 10 },
    { x: 20, y: 10 },
    { x: 20, y: 7 },
    { x: 24, y: 7 },
    { x: 24, y: 14 },
    { x: 12, y: 14 },
    { x: 12, y: 19 },
    { x: 18, y: 19 },
    { x: 18, y: 22 },
    { x: 18, y: 24 },
    { x: 14, y: 24 },
    { x: 14, y: 30 },
    { x: 14, y: 37 },
  ],
  peak: [
    { x: -5, y: 20 },
    { x: 2, y: 20 },
    { x: 2, y: 12 },
    { x: 8, y: 12 },
    { x: 14, y: 12 },
    { x: 14, y: 20 },
    { x: 20, y: 20 },
    { x: 26, y: 20 },
    { x: 38, y: 20 },
  ],
  // Secondary path for peak
  peak_b: [
    { x: 12, y: -5 },
    { x: 12, y: 6 },
    { x: 22, y: 6 },
    { x: 22, y: 12 },
    { x: 28, y: 12 },
    { x: 28, y: 19 },
    { x: 38, y: 20 },
  ],
  // =====================
  // VOLCANIC REGION (Inferno Depths)
  // =====================
  lava: [
    { x: -7, y: 14 },
    { x: 6, y: 14 },
    { x: 6, y: 6 },
    { x: 21, y: 6 },
    { x: 21, y: 10 },
    { x: 12, y: 10 },
    { x: 12, y: 14 },
    { x: 18, y: 14 },
    { x: 18, y: 19 },
    { x: 10, y: 19 },
    { x: 10, y: 25 },
    { x: 24, y: 25 },
    { x: 24, y: 14 },
    { x: 39, y: 14 },
  ],
  crater: [
    { x: 15, y: -9 },
    { x: 15, y: 4 },
    { x: 9, y: 4 },
    { x: 3, y: 4 },
    { x: 3, y: 10 },
    { x: 9, y: 10 },
    { x: 15, y: 10 },
    { x: 21, y: 10 },
    { x: 27, y: 10 },
    { x: 27, y: 18 },
    { x: 21, y: 18 },
    { x: 8, y: 18 },
    { x: 8, y: 24 },
    { x: 21, y: 24 },
    { x: 21, y: 39 },
  ],
  throne: [
    { x: -7, y: 7 },
    { x: 2, y: 7 },
    { x: 2, y: 11 },
    { x: 6, y: 11 },
    { x: 6, y: 7 },
    { x: 10, y: 7 },
    { x: 10, y: 10 },
    { x: 14, y: 10 },
    { x: 14, y: 6 },
    { x: 20, y: 6 },
    { x: 20, y: 10 },
    { x: 26, y: 10 },
    { x: 26, y: 14 },
    { x: 39, y: 14 }, // MERGE POINT
  ],
  // Secondary path for throne
  throne_b: [
    { x: -7, y: 24 },
    { x: 0, y: 24 },
    { x: 0, y: 20 },
    { x: 6, y: 20 },
    { x: 6, y: 16 },
    { x: 12, y: 16 },
    { x: 12, y: 20 },
    { x: 18, y: 20 },
    { x: 18, y: 24 },
    { x: 24, y: 24 },
    { x: 24, y: 18 },
    { x: 30, y: 18 },
    { x: 30, y: 14 }, // Merge point with primary path
    { x: 39, y: 14 },
  ],
  // =====================
  // DEV TEST LEVELS
  // =====================
  dev_enemy_showcase: [
    { x: -5, y: 15 },
    { x: 35, y: 15 },
  ],
  // =====================
  // REGION CHALLENGES
  // =====================
  ivy_crossroads: [
    { x: -6, y: 8 },
    { x: 4, y: 8 },
    { x: 4, y: 3 },
    { x: 12, y: 3 },
    { x: 12, y: 11 },
    { x: 20, y: 11 },
    { x: 20, y: 6 },
    { x: 28, y: 6 },
    { x: 28, y: 14 },
    { x: 39, y: 14 },
  ],
  ivy_crossroads_b: [
    { x: -6, y: 24 },
    { x: 6, y: 24 },
    { x: 6, y: 18 },
    { x: 14, y: 18 },
    { x: 14, y: 26 },
    { x: 22, y: 26 },
    { x: 22, y: 16 },
    { x: 30, y: 16 },
    { x: 30, y: 14 },
    { x: 39, y: 14 },
  ],
  blight_basin: [
    { x: -6, y: 9 },
    { x: 5, y: 9 },
    { x: 5, y: 5 },
    { x: 11, y: 5 },
    { x: 11, y: 13 },
    { x: 17, y: 13 },
    { x: 17, y: 9 },
    { x: 23, y: 9 },
    { x: 23, y: 17 },
    { x: 30, y: 17 },
    { x: 39, y: 17 },
  ],
  blight_basin_b: [
    { x: -6, y: 22 },
    { x: 7, y: 22 },
    { x: 7, y: 18 },
    { x: 13, y: 18 },
    { x: 13, y: 25 },
    { x: 21, y: 25 },
    { x: 21, y: 15 },
    { x: 27, y: 15 },
    { x: 27, y: 17 },
    { x: 39, y: 17 },
  ],
  sunscorch_labyrinth: [
    { x: -6, y: 7 },
    { x: 4, y: 7 },
    { x: 4, y: 12 },
    { x: 10, y: 12 },
    { x: 10, y: 6 },
    { x: 16, y: 6 },
    { x: 16, y: 15 },
    { x: 22, y: 15 },
    { x: 22, y: 9 },
    { x: 28, y: 9 },
    { x: 28, y: 17 },
    { x: 39, y: 17 },
  ],
  sunscorch_labyrinth_b: [
    { x: -6, y: 24 },
    { x: 6, y: 24 },
    { x: 6, y: 19 },
    { x: 12, y: 19 },
    { x: 12, y: 26 },
    { x: 18, y: 26 },
    { x: 18, y: 14 },
    { x: 24, y: 14 },
    { x: 24, y: 20 },
    { x: 30, y: 20 },
    { x: 30, y: 17 },
    { x: 39, y: 17 },
  ],
  whiteout_pass: [
    { x: -6, y: 10 },
    { x: 6, y: 10 },
    { x: 6, y: 5 },
    { x: 12, y: 5 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 6 },
    { x: 24, y: 6 },
    { x: 24, y: 14 },
    { x: 31, y: 14 },
    { x: 39, y: 14 },
  ],
  whiteout_pass_b: [
    { x: -6, y: 23 },
    { x: 5, y: 23 },
    { x: 5, y: 17 },
    { x: 11, y: 17 },
    { x: 11, y: 25 },
    { x: 19, y: 25 },
    { x: 19, y: 14 },
    { x: 25, y: 14 },
    { x: 25, y: 20 },
    { x: 31, y: 20 },
    { x: 31, y: 14 },
    { x: 39, y: 14 },
  ],
  ashen_spiral: [
    { x: -6, y: 6 },
    { x: 4, y: 6 },
    { x: 4, y: 12 },
    { x: 10, y: 12 },
    { x: 10, y: 8 },
    { x: 16, y: 8 },
    { x: 16, y: 14 },
    { x: 22, y: 14 },
    { x: 22, y: 10 },
    { x: 28, y: 10 },
    { x: 28, y: 18 },
    { x: 39, y: 18 },
  ],
  ashen_spiral_b: [
    { x: -6, y: 26 },
    { x: 6, y: 26 },
    { x: 6, y: 20 },
    { x: 12, y: 20 },
    { x: 12, y: 26 },
    { x: 18, y: 26 },
    { x: 18, y: 18 },
    { x: 24, y: 18 },
    { x: 24, y: 24 },
    { x: 30, y: 24 },
    { x: 30, y: 18 },
    { x: 39, y: 18 },
  ],
  cannon_crest: [
    { x: -6, y: 11 },
    { x: 5, y: 11 },
    { x: 5, y: 6 },
    { x: 11, y: 6 },
    { x: 11, y: 14 },
    { x: 17, y: 14 },
    { x: 17, y: 9 },
    { x: 24, y: 9 },
    { x: 24, y: 15 },
    { x: 31, y: 15 },
    { x: 39, y: 15 },
  ],
  cannon_crest_b: [
    { x: -6, y: 23 },
    { x: 7, y: 23 },
    { x: 7, y: 18 },
    { x: 13, y: 18 },
    { x: 13, y: 25 },
    { x: 20, y: 25 },
    { x: 20, y: 16 },
    { x: 27, y: 16 },
    { x: 27, y: 15 },
    { x: 39, y: 15 },
  ],
  triad_keep: [
    { x: -6, y: 9 },
    { x: 4, y: 9 },
    { x: 4, y: 4 },
    { x: 12, y: 4 },
    { x: 12, y: 12 },
    { x: 18, y: 12 },
    { x: 18, y: 7 },
    { x: 24, y: 7 },
    { x: 24, y: 16 },
    { x: 30, y: 16 },
    { x: 39, y: 16 },
  ],
  triad_keep_b: [
    { x: -6, y: 22 },
    { x: 6, y: 22 },
    { x: 6, y: 17 },
    { x: 14, y: 17 },
    { x: 14, y: 25 },
    { x: 21, y: 25 },
    { x: 21, y: 14 },
    { x: 28, y: 14 },
    { x: 28, y: 16 },
    { x: 39, y: 16 },
  ],
  frontier_outpost: [
    { x: -6, y: 10 },
    { x: 5, y: 10 },
    { x: 5, y: 5 },
    { x: 11, y: 5 },
    { x: 11, y: 13 },
    { x: 18, y: 13 },
    { x: 18, y: 8 },
    { x: 24, y: 8 },
    { x: 24, y: 14 },
    { x: 31, y: 14 },
    { x: 39, y: 14 },
  ],
  frontier_outpost_b: [
    { x: -6, y: 24 },
    { x: 6, y: 24 },
    { x: 6, y: 19 },
    { x: 12, y: 19 },
    { x: 12, y: 26 },
    { x: 19, y: 26 },
    { x: 19, y: 14 },
    { x: 25, y: 14 },
    { x: 25, y: 20 },
    { x: 31, y: 20 },
    { x: 31, y: 14 },
    { x: 39, y: 14 },
  ],
};

// =============================================================================
// LEVEL DATA - All regions with theme info and wave count
// =============================================================================
export type MapTheme = "grassland" | "desert" | "winter" | "volcanic" | "swamp";

export const LEVEL_DATA: Record<
  string,
  {
    name: string;
    position: { x: number; y: number };
    description: string;
    camera: {
      offset: { x: number; y: number };
      zoom: number;
    };
    region: string;
    theme: MapTheme;
    difficulty: 1 | 2 | 3;
    levelKind?: "campaign" | "challenge" | "custom";
    startingPawPoints: number; // Starting resources for this level
    allowedTowers?: TowerType[];
    previewImage?: string;
    heroSpawn?: { x: number; y: number };
    dualPath?: boolean; // Has two enemy spawn paths
    secondaryPath?: string; // Key for second path in MAP_PATHS
    pathKeys?: string[]; // Optional explicit list of additional path keys
    specialTower?: {
      // Special interactive structure
      pos: { x: number; y: number };
      type:
        | "vault"
        | "beacon"
        | "shrine"
        | "barracks"
        | "chrono_relay"
        | "sentinel_nexus"
        | "sunforge_orrery";
      hp?: number; // For destructible objectives
    };
    specialTowers?: Array<{
      pos: { x: number; y: number };
      type:
        | "vault"
        | "beacon"
        | "shrine"
        | "barracks"
        | "chrono_relay"
        | "sentinel_nexus"
        | "sunforge_orrery";
      hp?: number;
    }>;
    decorations?: MapDecoration[]; // Map-specific decorations
    hazards?: MapHazard[]; // Environmental hazards
  }
> = {
  // =====================
  // GRASSLAND REGION - Princeton Grounds
  // =====================
  poe: {
    name: "Poe Field",
    position: { x: 120, y: 200 },
    description: "Training grounds for new defenders.",
    camera: { offset: { x: -100, y: -390 }, zoom: 1.05 },
    region: "grassland",
    theme: "grassland",
    difficulty: 1,
    startingPawPoints: 350, // Easy tutorial level - generous starting funds
    heroSpawn: { x: 16, y: 18 },
    previewImage: "/images/previews/poe.png",
    decorations: [
      // Trees around the expanded path area (path: y:8-18, x:-2 to 32)
      { type: "tree", pos: { x: 2, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 8, y: 2 }, variant: 1 },
      { type: "tree", pos: { x: 20, y: 4 }, variant: 2 },
      { type: "tree", pos: { x: 28, y: 6 }, variant: 0 },
      { type: "tree", pos: { x: 2, y: 22 }, variant: 1 },
      { type: "tree", pos: { x: 12, y: 24 }, variant: 2 },
      { type: "tree", pos: { x: 24, y: 22 }, variant: 0 },
      { type: "tree", pos: { x: 30, y: 20 }, variant: 1 },
      // Bushes and rocks
      { type: "bush", pos: { x: 0, y: 12 }, variant: 0 },
      { type: "bush", pos: { x: 6, y: 20 }, variant: 1 },
      { type: "bush", pos: { x: 26, y: 16 }, variant: 0 },
      { type: "rock", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "rock", pos: { x: 18, y: 22 }, variant: 1 },
      { type: "flowers", pos: { x: 14, y: 4 }, variant: 0 },
      { type: "flowers", pos: { x: 8, y: 22 }, variant: 1 },
      // Signpost near path start
      { type: "signpost", pos: { x: 0, y: 18 }, variant: 0 },
      // Tiger statue pair flanking the path center
      { type: "statue", pos: { x: 19, y: 8 }, variant: 4 },
      { type: "statue", pos: { x: 13, y: 14 }, variant: 7 },
      // Lampposts along the path
      { type: "lamppost", pos: { x: 6, y: 12 }, variant: 0 },
      { type: "lamppost", pos: { x: 12, y: 10 }, variant: 0 },
      { type: "lamppost", pos: { x: 14, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 14 }, variant: 0 },
      { type: "lamppost", pos: { x: 20, y: 20 }, variant: 0 },
      { type: "lamppost", pos: { x: 24, y: 10 }, variant: 0 },
      // Additional outer decorations
      { type: "bench", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "fence", pos: { x: 12, y: 6 }, variant: 0 },
      { type: "cart", pos: { x: 2, y: 20 }, variant: 0 },
      { type: "tent", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "campfire", pos: { x: 10, y: 16 }, variant: 0 },
      { type: "hedge", pos: { x: 22, y: 6 }, variant: 0 },
      { type: "reeds", pos: { x: 28, y: 14 }, variant: 0 },
    ],
  },
  carnegie: {
    name: "Carnegie Lake",
    position: { x: 300, y: 120 },
    description:
      "Strategic lakeside defense. The gleaming waters hide ancient secrets.",
    camera: { offset: { x: -120, y: -380 }, zoom: 0.95 },
    region: "grassland",
    theme: "grassland",
    difficulty: 2,
    startingPawPoints: 400, // Medium difficulty - more waves
    heroSpawn: { x: 15, y: 20 },
    decorations: [
      // Lake feature near path center (path: x:9-26, y:-2 to 32)
      { type: "deep_water", pos: { x: 9, y: 17 }, variant: 0, size: 2 },
      // { type: "deep_water", pos: { x: 11, y: 24 }, variant: 0, size: 4 },

      { type: "carnegie_lake", pos: { x: 10, y: 23 }, variant: 0, size: 2.5 },
      // { type: "deep_water", pos: { x: 9, y: 23 }, variant: 0, size: 3 },

      // Trees around the map
      { type: "tree", pos: { x: 4, y: 4 }, variant: 2 },
      { type: "tree", pos: { x: 20, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 8 }, variant: 1 },
      { type: "tree", pos: { x: 4, y: 22 }, variant: 2 },
      { type: "tree", pos: { x: 12, y: 26 }, variant: 0 },
      { type: "tree", pos: { x: 20, y: 26 }, variant: 1 },
      { type: "tree", pos: { x: 28, y: 24 }, variant: 2 },
      { type: "reeds", pos: { x: 6, y: 10 }, variant: 0 },
      { type: "reeds", pos: { x: 2, y: 18 }, variant: 1 },
      // Landmarks and features
      { type: "bench", pos: { x: 18, y: 16 }, variant: 0 },
      { type: "statue", pos: { x: 18, y: 16 }, variant: 5 },
      { type: "statue", pos: { x: 24, y: 8 }, variant: 6 },
      { type: "hedge", pos: { x: 18, y: 22 }, variant: 0 },
      { type: "bench", pos: { x: 10, y: 4 }, variant: 0 },
      // Lampposts along path
      { type: "lamppost", pos: { x: 12, y: 8 }, variant: 0 },
      { type: "lamppost", pos: { x: 7, y: 12 }, variant: 0 },
      { type: "lamppost", pos: { x: 12, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "lamppost", pos: { x: 23, y: 12 }, variant: 0 },
      { type: "lamppost", pos: { x: 24, y: 18 }, variant: 0 },
      { type: "lamppost", pos: { x: 24, y: 24 }, variant: 0 },
      // Additional decorations
      { type: "fishing_spot", pos: { x: 6, y: 16 }, variant: 0 },
      { type: "flowers", pos: { x: 8, y: 4 }, variant: 0 },
      { type: "flowers", pos: { x: 22, y: 8 }, variant: 1 },
      { type: "rock", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "rock", pos: { x: 28, y: 16 }, variant: 1 },
      { type: "dock", pos: { x: 14, y: 22 }, variant: 0 },
      { type: "campfire", pos: { x: 26, y: 20 }, variant: 0 },
    ],
    previewImage: "/images/previews/carnegie.png",
  },
  nassau: {
    name: "Nassau Hall",
    position: { x: 480, y: 200 },
    description:
      "The final stand at the heart of campus. Defend the iconic building at all costs!",
    camera: { offset: { x: -140, y: -270 }, zoom: 0.9 },
    region: "grassland",
    theme: "grassland",
    difficulty: 3,
    startingPawPoints: 500, // Hard level with beacon - need more towers
    heroSpawn: { x: 21, y: 13 },
    specialTower: {
      pos: { x: 16, y: 8.5 },
      type: "beacon",
    },
    decorations: [
      // Nassau Hall near path center (path: x:-2 to 32, y:8 to 20)
      { type: "nassau_hall", pos: { x: 15, y: -3 }, variant: 0, size: 3 },
      { type: "statue", pos: { x: 7, y: 7.5 }, variant: 7 },
      { type: "statue", pos: { x: 21, y: 2 }, variant: 4 },
      { type: "statue", pos: { x: 17, y: 17 }, variant: 5 },
      { type: "statue", pos: { x: 23, y: 17 }, variant: 6 },
      { type: "fountain", pos: { x: 22.75, y: 7 }, variant: 0 },
      // Trees around the expanded area
      { type: "tree", pos: { x: 4, y: 4 }, variant: 1 },
      { type: "tree", pos: { x: 24, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 10 }, variant: 2 },
      { type: "tree", pos: { x: 4, y: 24 }, variant: 0 },
      { type: "tree", pos: { x: 16, y: 26 }, variant: 1 },
      { type: "tree", pos: { x: 28, y: 24 }, variant: 2 },
      // Benches and hedges
      { type: "bench", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "bench", pos: { x: 18, y: 6 }, variant: 1 },
      { type: "hedge", pos: { x: 8, y: 24 }, variant: 0 },
      { type: "hedge", pos: { x: 24, y: 22 }, variant: 1 },
      // Lampposts along path
      { type: "lamppost", pos: { x: 2, y: 14 }, variant: 0 },
      { type: "lamppost", pos: { x: 7, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 9, y: 22 }, variant: 0 },
      { type: "lamppost", pos: { x: 14, y: 10 }, variant: 0 },
      { type: "lamppost", pos: { x: 17, y: 6 }, variant: 0 },
      { type: "lamppost", pos: { x: 22, y: 16 }, variant: 0 },
      { type: "lamppost", pos: { x: 28, y: 16 }, variant: 0 },
      // Additional decorations
      { type: "flowers", pos: { x: 6, y: 4 }, variant: 0 },
      { type: "flowers", pos: { x: 20, y: 4 }, variant: 1 },
      { type: "flowers", pos: { x: 12, y: 24 }, variant: 2 },
      { type: "gate", pos: { x: 0, y: 10 }, variant: 0 },
      { type: "flag", pos: { x: 30, y: 14 }, variant: 0 },
    ],
    previewImage: "/images/previews/nassau.png",
  },
  // =====================
  // SWAMP REGION - Murky Marshes (NEW)
  // =====================
  bog: {
    name: "Murky Bog",
    position: { x: 120, y: 200 },
    description:
      "Treacherous wetlands filled with mist and mystery. Watch your step!",
    camera: { offset: { x: -150, y: -330 }, zoom: 0.9 },
    region: "swamp",
    theme: "swamp",
    difficulty: 1,
    startingPawPoints: 400, // Swamp intro - hexers require strategy
    heroSpawn: { x: 18, y: 12 },
    hazards: [{ type: "poison_fog", pos: { x: 17.5, y: 15.5 }, radius: 1.5 }],
    decorations: [
      // Swamp trees around expanded path (path: x:-2 to 32, y:12 to 20)
      { type: "swamp_tree", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 14, y: 4 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 22, y: 6 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 28, y: 8 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 4, y: 26 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 16, y: 26 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 28, y: 26 }, variant: 0 },
      // Water features
      { type: "deep_water", pos: { x: 2, y: 16 }, variant: 0, size: 2 },
      { type: "deep_water", pos: { x: 14, y: 6 }, variant: 1, size: 2.5 },
      { type: "fog_patch", pos: { x: 8, y: 16 }, variant: 0 },
      { type: "fog_patch", pos: { x: 20, y: 14 }, variant: 1 },
      { type: "ruined_temple", pos: { x: 14, y: 16 }, variant: 5, size: 1 },
      { type: "tentacle", pos: { x: 2, y: 16 }, variant: 0 },
      { type: "tentacle", pos: { x: 14, y: 6 }, variant: 1, size: 1.25 },
      { type: "skeleton", pos: { x: 10, y: 24 }, variant: 0 },
      { type: "bones", pos: { x: 18, y: 8 }, variant: 0 },
      { type: "poison_pool", pos: { x: 26, y: 20 }, variant: 0 },
      { type: "glowing_runes", pos: { x: 18, y: 24 }, variant: 0 },
      { type: "hanging_cage", pos: { x: 8, y: 10 }, variant: 0 },
      { type: "idol_statue", pos: { x: 22, y: 8 }, variant: 0 },
    ],
    previewImage: "/images/previews/murky_bog.png",
  },
  witch_hut: {
    name: "Witch's Domain",
    position: { x: 300, y: 120 },
    description:
      "A cursed clearing where dark magic festers. The witch's hut pulses with evil energy.",
    camera: { offset: { x: -180, y: -330 }, zoom: 0.85 },
    region: "swamp",
    theme: "swamp",
    difficulty: 2,
    startingPawPoints: 475, // Shrine helps with healing - medium funds
    heroSpawn: { x: 15, y: 16 },
    specialTower: {
      pos: { x: 10, y: 14 },
      type: "shrine",
    },
    decorations: [
      // Witch cottage near path start (path: x:9 to 27, y:-2 to 32)
      { type: "witch_cottage", pos: { x: 14, y: 10 }, variant: 0, size: 1.5 },
      { type: "deep_water", pos: { x: 14, y: 9.9 }, variant: 0, size: 3.5 },
      { type: "cauldron", pos: { x: 16, y: 11 }, variant: 0 },
      // Swamp trees around the map
      { type: "swamp_tree", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 4, y: 14 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 4, y: 22 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 30, y: 6 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 30, y: 18 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 30, y: 26 }, variant: 2 },
      // Cauldrons along path
      { type: "cauldron", pos: { x: 6, y: 8 }, variant: 1 },
      { type: "cauldron", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "cauldron", pos: { x: 24, y: 12 }, variant: 2 },
      { type: "cauldron", pos: { x: 20, y: 4 }, variant: 1 },

      // Tombstones
      { type: "tombstone", pos: { x: 6, y: 18 }, variant: 1 },
      { type: "tombstone", pos: { x: 12, y: 20 }, variant: 0 },
      { type: "tombstone", pos: { x: 24, y: 20 }, variant: 2 },
      { type: "fog_patch", pos: { x: 14, y: 12 }, variant: 0 },
      { type: "fog_patch", pos: { x: 22, y: 22 }, variant: 1 },
      { type: "skull", pos: { x: 6, y: 4 }, variant: 0 },
      { type: "bones", pos: { x: 28, y: 14 }, variant: 1 },
      { type: "candles", pos: { x: 16, y: 6 }, variant: 0 },
      { type: "ritual_circle", pos: { x: 24, y: 26 }, variant: 0 },
      { type: "hanging_cage", pos: { x: 2, y: 10 }, variant: 0 },
      { type: "hanging_cage", pos: { x: 28, y: 22 }, variant: 1 },
      { type: "poison_pool", pos: { x: 12, y: 26 }, variant: 0 },
      { type: "glowing_runes", pos: { x: 8, y: 14 }, variant: 0 },
      { type: "idol_statue", pos: { x: 26, y: 4 }, variant: 0 },
      { type: "skeleton_pile", pos: { x: 14, y: 24 }, variant: 0 },
    ],
    hazards: [{ type: "poison_fog", pos: { x: 18, y: 15.5 }, radius: 2 }],
    previewImage: "/images/previews/witch_hut.png",
  },
  sunken_temple: {
    name: "Sunken Temple",
    position: { x: 480, y: 200 },
    description:
      "Ancient ruins half-submerged in fetid waters. Something stirs in the depths below.",
    camera: { offset: { x: -20, y: -420 }, zoom: 0.85 },
    region: "swamp",
    theme: "swamp",
    difficulty: 3,
    startingPawPoints: 600, // Dual path + vault defense - need strong setup
    heroSpawn: { x: 18, y: 16 },
    dualPath: true,
    secondaryPath: "sunken_temple_b",
    specialTower: {
      pos: { x: 20, y: 15.5 },
      type: "vault",
      hp: 800,
    },
    decorations: [
      // Grand ruined temple near path center (variant 6 = grand temple)
      { type: "ruined_temple", pos: { x: 16, y: 4 }, variant: 6, size: 3 },
      { type: "sunken_pillar", pos: { x: 4, y: 6 }, variant: 0 },
      { type: "sunken_pillar", pos: { x: 8, y: 12 }, variant: 1 },
      { type: "sunken_pillar", pos: { x: 26, y: 12 }, variant: 2 },
      { type: "sunken_pillar", pos: { x: 28, y: 20 }, variant: 0 },
      // Water and creatures
      // Main abyss pool: three emergent tentacles
      { type: "deep_water", pos: { x: 18, y: 6 }, variant: 1, size: 4 },
      { type: "tentacle", pos: { x: 16.9, y: 7.1 }, variant: 0, size: 1.3 },
      { type: "tentacle", pos: { x: 18.2, y: 7.35 }, variant: 0, size: 1.0 },
      { type: "tentacle", pos: { x: 19.3, y: 6.15 }, variant: 0, size: 1.55 },

      { type: "deep_water", pos: { x: 27, y: 11 }, variant: 1, size: 2.5 },
      { type: "deep_water", pos: { x: 2, y: 18 }, variant: 0, size: 2 },
      { type: "idol_statue", pos: { x: 16, y: 20 }, variant: 0 },
      { type: "tentacle", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "tentacle", pos: { x: 27, y: 11 }, variant: 1 },
      // Swamp trees and decorations
      { type: "swamp_tree", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 24, y: 4 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 4, y: 28 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 28, y: 26 }, variant: 0 },
      { type: "skeleton_pile", pos: { x: 10, y: 20 }, variant: 0 },
      { type: "skeleton_pile", pos: { x: 22, y: 8 }, variant: 1 },
      { type: "bones", pos: { x: 14, y: 12 }, variant: 0 },
      { type: "fog_patch", pos: { x: 16, y: 14 }, variant: 0 },
      { type: "glowing_runes", pos: { x: 12, y: 26 }, variant: 0 },
      { type: "glowing_runes", pos: { x: 24, y: 22 }, variant: 1 },
      { type: "hanging_cage", pos: { x: 20, y: 4 }, variant: 0 },
      { type: "poison_pool", pos: { x: 8, y: 24 }, variant: 0 },
    ],
    hazards: [{ type: "poison_fog", pos: { x: 10, y: 23 }, radius: 2.5 }],
    previewImage: "/images/previews/sunken_temple.png",
  },
  // =====================
  // DESERT REGION - Sahara Sands
  // =====================
  oasis: {
    name: "Desert Oasis",
    position: { x: 120, y: 200 },
    description:
      "A precious water source under siege. Palm trees sway in the hot desert wind.",
    camera: { offset: { x: -120, y: -330 }, zoom: 0.9 },
    region: "desert",
    theme: "desert",
    difficulty: 1,
    startingPawPoints: 425, // Beacon boost helps - ranged enemies require planning
    heroSpawn: { x: 15, y: 11 },
    specialTower: {
      pos: { x: 22, y: 9.5 },
      type: "beacon",
    },
    decorations: [
      // Desert features near path (path: x:-2 to 32, y:10 to 18)
      { type: "pyramid", pos: { x: 12, y: -2 }, variant: 0, size: 2 },
      { type: "sphinx", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "oasis_pool", pos: { x: 16, y: 16 }, variant: 0, size: 2 },
      { type: "sphinx", pos: { x: 13, y: 14 }, variant: 0 },
      { type: "sphinx", pos: { x: 13, y: 12 }, variant: 1 },

      // Palm trees around
      { type: "palm", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "palm", pos: { x: 8, y: 6 }, variant: 1 },
      { type: "palm", pos: { x: 16, y: 4 }, variant: 2 },
      { type: "palm", pos: { x: 26, y: 6 }, variant: 0 },
      { type: "palm", pos: { x: 4, y: 22 }, variant: 1 },
      { type: "palm", pos: { x: 14, y: 22 }, variant: 2 },
      { type: "palm", pos: { x: 26, y: 22 }, variant: 0 },
      // Cacti and dunes
      { type: "cactus", pos: { x: 10, y: 6 }, variant: 0 },
      { type: "cactus", pos: { x: 2, y: 14 }, variant: 1 },
      { type: "cactus", pos: { x: 28, y: 14 }, variant: 2 },
      { type: "dune", pos: { x: 22, y: 20 }, variant: 0 },
      { type: "dune", pos: { x: 8, y: 22 }, variant: 1 },
      // Desert objects
      { type: "skull", pos: { x: 16, y: 6 }, variant: 0 },
      { type: "pottery", pos: { x: 10, y: 20 }, variant: 0 },
      { type: "obelisk", pos: { x: 8, y: 6 }, variant: 0 },
      { type: "statue", pos: { x: 9, y: 6.5 }, variant: 7 },
      { type: "statue", pos: { x: 22, y: 18 }, variant: 0 },
      { type: "obelisk", pos: { x: 10, y: 7 }, variant: 1 },
      { type: "bones", pos: { x: 24, y: 4 }, variant: 0 },
      { type: "tent", pos: { x: 2, y: 20 }, variant: 0 },
      { type: "campfire", pos: { x: 28, y: 20 }, variant: 0 },
      { type: "cobra_statue", pos: { x: 20, y: 4 }, variant: 0 },
      { type: "sand_pile", pos: { x: 18, y: 24 }, variant: 0 },
      { type: "treasure_chest", pos: { x: 24, y: 18 }, variant: 0 },
    ],
    previewImage: "/images/previews/oasis.png",
  },
  pyramid: {
    name: "Pyramid Pass",
    position: { x: 300, y: 120 },
    description:
      "Navigate the ancient canyon beneath the great pyramid. Beware of ambushes!",
    camera: { offset: { x: -140, y: -340 }, zoom: 0.85 },
    region: "desert",
    theme: "desert",
    difficulty: 2,
    startingPawPoints: 525, // Dual path requires coverage on both sides
    heroSpawn: { x: 15, y: 24 },
    dualPath: true,
    secondaryPath: "pyramid_b",
    specialTower: {
      pos: { x: 20, y: 15 },
      type: "barracks",
    },
    decorations: [
      // Pyramids near path center (path: x:10-26, y:-2 to 32)
      { type: "pyramid", pos: { x: 7.3125, y: -1 }, variant: 0, size: 1 },
      { type: "pyramid", pos: { x: 18.3125, y: 9 }, variant: 0, size: 1 },
      {
        type: "pyramid",
        pos: { x: 2.140625, y: 11.25 },
        variant: 0,
        size: 1.25,
      },
      { type: "pyramid", pos: { x: 2.3125, y: 15 }, variant: 0, size: 1 },

      { type: "pyramid", pos: { x: 20.625, y: 1 }, variant: 1, size: 2 },
      { type: "pyramid", pos: { x: 29.28125, y: 2.5 }, variant: 1, size: 2.5 },

      { type: "sphinx", pos: { x: 14, y: 6 }, variant: 0 },
      { type: "sphinx", pos: { x: 9, y: 10 }, variant: 0 },
      { type: "sphinx", pos: { x: 13.5, y: 17 }, variant: 1 },

      // Obelisks and torches along path
      { type: "obelisk", pos: { x: 6, y: 16 }, variant: 0 },
      { type: "obelisk", pos: { x: 16, y: 16 }, variant: 1 },
      { type: "obelisk", pos: { x: 14, y: 22 }, variant: 2 },
      { type: "torch", pos: { x: 12, y: 10 }, variant: 0 },
      { type: "torch", pos: { x: 20, y: 14 }, variant: 1 },
      // Palm trees and cacti
      { type: "palm", pos: { x: 4, y: 10 }, variant: 0 },
      { type: "palm", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "palm", pos: { x: 4, y: 24 }, variant: 2 },
      { type: "palm", pos: { x: 28, y: 24 }, variant: 0 },
      { type: "cactus", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "cactus", pos: { x: 30, y: 16 }, variant: 1 },
      // Dunes and decorations
      { type: "dune", pos: { x: 8, y: 26 }, variant: 0 },
      { type: "dune", pos: { x: 24, y: 26 }, variant: 1 },
      { type: "sarcophagus", pos: { x: 6, y: 20 }, variant: 0 },
      { type: "sarcophagus", pos: { x: 26, y: 8 }, variant: 1 },
      { type: "skull", pos: { x: 10, y: 16 }, variant: 0 },
      { type: "bones", pos: { x: 22, y: 6 }, variant: 0 },
      { type: "pottery", pos: { x: 18, y: 24 }, variant: 1 },
      { type: "hieroglyph_wall", pos: { x: 4, y: 16 }, variant: 0 },
      { type: "hieroglyph_wall", pos: { x: 28, y: 18 }, variant: 1 },
      { type: "cobra_statue", pos: { x: 16, y: 8 }, variant: 0 },
      { type: "treasure_chest", pos: { x: 20, y: 22 }, variant: 0 },
      { type: "sand_pile", pos: { x: 14, y: 26 }, variant: 0 },
    ],
    previewImage: "/images/previews/pyramid.png",
  },
  sphinx: {
    name: "Sphinx Gate",
    position: { x: 480, y: 200 },
    description:
      "The ancient guardian's domain. The Sphinx watches all who dare to pass.",
    camera: { offset: { x: -90, y: -290 }, zoom: 0.85 },
    region: "desert",
    theme: "desert",
    difficulty: 3,
    startingPawPoints: 575, // Challenging boss waves with quicksand hazard
    heroSpawn: { x: 16, y: 15 },
    specialTower: {
      pos: { x: 23, y: 14.5 },
      type: "shrine",
    },
    decorations: [
      // Pyramids and decorations
      { type: "pyramid", pos: { x: 10.4, y: 20.5 }, variant: 0, size: 1.5 },
      { type: "pyramid", pos: { x: 16.625, y: -2 }, variant: 1, size: 2 },
      { type: "pyramid", pos: { x: 3.3125, y: -2 }, variant: 0 },
      { type: "pyramid", pos: { x: 2.96875, y: 2 }, variant: 2, size: 1.5 },

      // Giant sphinx and guardians (path: x:-2 to 32, y:10 to 22)
      { type: "giant_sphinx", pos: { x: 13, y: 2 }, variant: 0, size: 1.5 },
      { type: "sphinx", pos: { x: 10, y: 23.5 }, variant: 1 },
      { type: "sphinx", pos: { x: 10, y: 5.5 }, variant: 0 },
      { type: "sphinx", pos: { x: 15, y: 5.5 }, variant: 0 },
      { type: "sphinx", pos: { x: 11, y: 14 }, variant: 1 },
      { type: "sphinx", pos: { x: 11, y: 13 }, variant: 1 },
      { type: "sphinx", pos: { x: 22, y: 6 }, variant: 0 },
      // Obelisks along path
      { type: "obelisk", pos: { x: 4, y: 14 }, variant: 0 },
      { type: "obelisk", pos: { x: 10, y: 18 }, variant: 1 },
      { type: "obelisk", pos: { x: 22, y: 14 }, variant: 2 },
      { type: "obelisk", pos: { x: 28, y: 18 }, variant: 0 },

      { type: "sarcophagus", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "sarcophagus", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "sand_pile", pos: { x: 16, y: 20 }, variant: 0 },
      { type: "sand_pile", pos: { x: 8, y: 12 }, variant: 1 },
      // Palm trees and dunes
      { type: "palm", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "palm", pos: { x: 28, y: 22 }, variant: 1 },
      { type: "dune", pos: { x: 12, y: 24 }, variant: 0 },
      { type: "dune", pos: { x: 24, y: 24 }, variant: 1 },
      { type: "cactus", pos: { x: 30, y: 14 }, variant: 0 },
      // Bones and torches
      { type: "skull", pos: { x: 6, y: 20 }, variant: 0 },
      { type: "skull", pos: { x: 24, y: 10 }, variant: 1 },
      { type: "bones", pos: { x: 18, y: 6 }, variant: 0 },
      { type: "torch", pos: { x: 12, y: 8 }, variant: 0 },
      { type: "torch", pos: { x: 20, y: 10 }, variant: 1 },
      { type: "hieroglyph_wall", pos: { x: 4, y: 10 }, variant: 0 },
      { type: "hieroglyph_wall", pos: { x: 28, y: 16 }, variant: 1 },
      { type: "cobra_statue", pos: { x: 18, y: 22 }, variant: 0 },
      { type: "cobra_statue", pos: { x: 10, y: 25 }, variant: 1 },
      { type: "treasure_chest", pos: { x: 6, y: 18 }, variant: 0 },
      { type: "pottery", pos: { x: 26, y: 20 }, variant: 0 },
    ],
    hazards: [{ type: "quicksand", pos: { x: 13, y: 17 }, radius: 2 }],
    previewImage: "/images/previews/sphinx.png",
  },
  // =====================
  // WINTER REGION - Frozen Frontier
  // =====================
  glacier: {
    name: "Glacier Path",
    position: { x: 120, y: 200 },
    description:
      "Ice-covered mountain pass. Freezing winds howl through the peaks.",
    camera: { offset: { x: -90, y: -420 }, zoom: 0.9 },
    region: "winter",
    theme: "winter",
    difficulty: 1,
    startingPawPoints: 475, // Winter intro - varied enemy types
    heroSpawn: { x: 18, y: 20 },
    specialTowers: [
      {
        pos: { x: 9, y: 17 },
        type: "beacon",
      },
      {
        pos: { x: 20, y: 20 },
        type: "chrono_relay",
      },
    ],
    decorations: [
      // Pine trees scattered around the glacier path
      { type: "pine_tree", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "pine_tree", pos: { x: 14, y: 4 }, variant: 1 },
      { type: "pine_tree", pos: { x: 24, y: 4 }, variant: 2 },
      { type: "pine_tree", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "pine_tree", pos: { x: 16, y: 24 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 22 }, variant: 2 },
      // Ice crystal formations
      { type: "ice_crystal", pos: { x: 8, y: 6 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 28, y: 4 }, variant: 1, size: 1 },
      { type: "ice_crystal", pos: { x: 12, y: 2 }, variant: 2, size: 1 },
      // Glacier formations as major landmark
      { type: "glacier", pos: { x: 20, y: 6 }, variant: 0, size: 2 },
      { type: "glacier", pos: { x: 4, y: 18 }, variant: 1, size: 1 },
      // Ice fortress guarding the path
      { type: "ice_fortress", pos: { x: 26, y: 4 }, variant: 0, size: 1.5 },
      // Frozen waterfall - dramatic centerpiece
      { type: "frozen_waterfall", pos: { x: 30, y: 8 }, variant: 0, size: 2 },
      // Aurora crystal - magical glow
      { type: "aurora_crystal", pos: { x: 2, y: 4 }, variant: 0, size: 1 },
      { type: "aurora_crystal", pos: { x: 24, y: 16 }, variant: 1, size: 1 },
      // Ice spire focal point
      { type: "ice_spire", pos: { x: 10, y: 4 }, variant: 0, size: 2 },
      // Frozen ponds
      { type: "frozen_pond", pos: { x: 15, y: 14 }, variant: 0, size: 1.5 },
      { type: "frozen_pond", pos: { x: 26, y: 12 }, variant: 1, size: 2 },
      // Snow lanterns along path edges
      { type: "snow_lantern", pos: { x: 6, y: 8 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 22, y: 8 }, variant: 1, size: 1 },
      { type: "snow_lantern", pos: { x: 14, y: 20 }, variant: 0, size: 1 },
      // Icicle formations
      { type: "icicles", pos: { x: 18, y: 4 }, variant: 0 },
      { type: "icicles", pos: { x: 12, y: 22 }, variant: 1 },
      { type: "icicles", pos: { x: 30, y: 16 }, variant: 0 },
      // Snow decorations
      { type: "snow_pile", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "snow_pile", pos: { x: 22, y: 20 }, variant: 1 },
      { type: "snowman", pos: { x: 10, y: 20 }, variant: 0 },
      { type: "snowman", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "snowman", pos: { x: 18, y: 22 }, variant: 2 },
      // Frozen soldier and battlefield remnants
      { type: "frozen_soldier", pos: { x: 2, y: 16 }, variant: 0 },
      { type: "frozen_soldier", pos: { x: 22, y: 18 }, variant: 1 },
      { type: "broken_wall", pos: { x: 8, y: 24 }, variant: 0 },
      { type: "bones", pos: { x: 26, y: 18 }, variant: 1 },
      // Frozen hero statues guarding the glacier path
      { type: "statue", pos: { x: 6, y: 10 }, variant: 0 },
      { type: "statue", pos: { x: 20, y: 8 }, variant: 4 },
    ],
    hazards: [{ type: "ice_spikes", pos: { x: 17.5, y: 18 }, radius: 1.5 }],
    previewImage: "/images/previews/glacier.png",
  },
  fortress: {
    name: "Frost Fortress",
    position: { x: 300, y: 120 },
    description:
      "An abandoned stronghold of ice and stone. What dark forces drove out its defenders?",
    camera: { offset: { x: -150, y: -335 }, zoom: 0.85 },
    region: "winter",
    theme: "winter",
    difficulty: 2,
    startingPawPoints: 550, // Barracks helps - ice sheet hazard speeds enemies
    heroSpawn: { x: 18, y: 19 },
    specialTower: {
      pos: { x: 13, y: 16 },
      type: "barracks",
    },
    decorations: [
      // Grand frozen gate - fortress entrance
      { type: "frozen_gate", pos: { x: 14, y: 4 }, variant: 0, size: 2 },
      // Glacier formations flanking the entrance
      { type: "glacier", pos: { x: 6, y: 4 }, variant: 0, size: 2 },
      { type: "glacier", pos: { x: 24, y: 4 }, variant: 1, size: 2 },
      // Ice fortresses guarding the fortress
      { type: "ice_fortress", pos: { x: 2, y: 12 }, variant: 1, size: 1.5 },
      { type: "ice_fortress", pos: { x: 28, y: 8 }, variant: 2, size: 1.5 },
      // Ruined temple in the courtyard (variant 5 = frost ruins)
      { type: "ruined_temple", pos: { x: 14, y: 6 }, variant: 5, size: 2 },
      // Guardian statues flanking the ruins
      { type: "statue", pos: { x: 10, y: 8 }, variant: 0, size: 1 },
      { type: "statue", pos: { x: 18, y: 8 }, variant: 1, size: 1 },
      // Ice spires - commanding positions
      { type: "ice_spire", pos: { x: 4, y: 8 }, variant: 0, size: 3 },
      { type: "ice_spire", pos: { x: 26, y: 8 }, variant: 1, size: 2 },
      // Aurora crystals illuminating the fortress ruins
      { type: "aurora_crystal", pos: { x: 8, y: 24 }, variant: 0, size: 2 },
      { type: "aurora_crystal", pos: { x: 24, y: 26 }, variant: 1, size: 1 },
      { type: "aurora_crystal", pos: { x: 2, y: 6 }, variant: 2, size: 1 },
      // Ice crystals scattered in the ruins
      { type: "ice_crystal", pos: { x: 12, y: 2 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 28, y: 6 }, variant: 1, size: 1 },
      { type: "ice_crystal", pos: { x: 6, y: 14 }, variant: 2, size: 1 },
      { type: "ice_crystal", pos: { x: 30, y: 12 }, variant: 0, size: 1 },
      // Frozen waterfall on fortress wall
      { type: "frozen_waterfall", pos: { x: 2, y: 22 }, variant: 0, size: 1 },
      // Snow lanterns along fortress corridors
      { type: "snow_lantern", pos: { x: 9, y: 15 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 20, y: 6 }, variant: 1, size: 1 },
      { type: "snow_lantern", pos: { x: 16, y: 26 }, variant: 0, size: 1 },
      // Broken walls along path - fortress damage
      { type: "broken_wall", pos: { x: 6, y: 10 }, variant: 0, size: 1 },
      { type: "broken_wall", pos: { x: 20, y: 14 }, variant: 1, size: 1 },
      { type: "broken_wall", pos: { x: 24, y: 22 }, variant: 2, size: 1 },
      // Frozen soldiers and battle remnants
      { type: "frozen_soldier", pos: { x: 8, y: 16 }, variant: 0, size: 1 },
      { type: "frozen_soldier", pos: { x: 22, y: 10 }, variant: 1, size: 1 },
      { type: "frozen_soldier", pos: { x: 26, y: 18 }, variant: 2, size: 1 },
      { type: "battle_crater", pos: { x: 14, y: 18 }, variant: 0 },
      { type: "battle_crater", pos: { x: 24, y: 16 }, variant: 1 },
      // Frozen pond in fortress courtyard
      { type: "frozen_pond", pos: { x: 14, y: 2 }, variant: 0, size: 1 },
      // Icicle formations on fortress ruins
      { type: "icicles", pos: { x: 18, y: 8 }, variant: 0, size: 1 },
      { type: "icicles", pos: { x: 10, y: 20 }, variant: 1, size: 1 },
      // Pine trees around fortress perimeter
      { type: "pine_tree", pos: { x: 4, y: 18 }, variant: 0 },
      { type: "pine_tree", pos: { x: 4, y: 26 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 14 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: 24 }, variant: 0 },
      // Snow features
      { type: "snow_pile", pos: { x: 6, y: 24 }, variant: 0 },
      { type: "snowman", pos: { x: 30, y: 20 }, variant: 0 },
      { type: "snowman", pos: { x: 12, y: 24 }, variant: 2 },
      // Guardian statues flanking the fortress gate
      { type: "statue", pos: { x: 12, y: 8 }, variant: 7 },
      { type: "statue", pos: { x: 20, y: 8 }, variant: 0 },
      { type: "statue", pos: { x: 16, y: 22 }, variant: 5 },
    ],
    hazards: [{ type: "ice_sheet", pos: { x: 15, y: 8 }, radius: 2 }],
    previewImage: "/images/previews/fortress.png",
  },
  peak: {
    name: "Summit Peak",
    position: { x: 480, y: 200 },
    description:
      "The highest point of defense. A frozen throne awaits at the mountain's apex.",
    camera: { offset: { x: -200, y: -400 }, zoom: 0.85 },
    region: "winter",
    theme: "winter",
    difficulty: 3,
    startingPawPoints: 650, // Dual path + bosses - need maximum coverage
    heroSpawn: { x: 20, y: 20 },
    dualPath: true,
    secondaryPath: "peak_b",
    specialTowers: [
      {
        pos: { x: 15, y: 18 },
        type: "shrine",
      },
      {
        pos: { x: 15.5, y: 9.5 },
        type: "chrono_relay",
      },
      {
        pos: { x: 25, y: 9 },
        type: "beacon",
      },
    ],
    decorations: [
      // Grand ice throne centerpiece - the summit crown
      { type: "ice_throne", pos: { x: 10, y: 7 }, variant: 0, size: 2.5 },
      // Ice spires flanking the throne
      { type: "ice_spire", pos: { x: 6, y: 10 }, variant: 0, size: 2 },
      { type: "ice_spire", pos: { x: 18, y: 8 }, variant: 2, size: 1.5 },
      // Frozen waterfall - dramatic cliff cascade
      { type: "frozen_waterfall", pos: { x: 4, y: 6 }, variant: 0, size: 2 },
      { type: "frozen_waterfall", pos: { x: 27, y: 6 }, variant: 1, size: 2 },
      // Aurora crystals at the peak - magical energy source
      { type: "aurora_crystal", pos: { x: 16, y: 10 }, variant: 0, size: 2 },
      { type: "aurora_crystal", pos: { x: 8, y: 24 }, variant: 1, size: 2 },
      { type: "aurora_crystal", pos: { x: 32, y: 10 }, variant: 2, size: 1 },
      // Frozen gate at mountain pass
      { type: "frozen_gate", pos: { x: 28, y: 3 }, variant: 0, size: 2 },
      // Glacier formations guarding the peak
      { type: "glacier", pos: { x: 4, y: 22 }, variant: 0, size: 1.5 },
      { type: "glacier", pos: { x: 26, y: 22 }, variant: 2, size: 1.5 },
      // Ice fortresses at the summit approaches
      { type: "ice_fortress", pos: { x: 2, y: 8 }, variant: 0, size: 1.5 },
      { type: "ice_fortress", pos: { x: 30, y: 8 }, variant: 2, size: 1.5 },
      // Frozen ponds - mountain lakes
      { type: "frozen_pond", pos: { x: 10, y: 14 }, variant: 0, size: 2 },
      { type: "frozen_pond", pos: { x: 22, y: 14 }, variant: 1, size: 2 },
      // Ice crystal formations
      { type: "ice_crystal", pos: { x: 6, y: 14 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 12, y: 9 }, variant: 1, size: 1.5 },
      { type: "ice_crystal", pos: { x: 26, y: 16 }, variant: 2, size: 1 },
      { type: "ice_crystal", pos: { x: 4, y: 2 }, variant: 0, size: 1 },
      { type: "ice_crystal", pos: { x: 24, y: 2 }, variant: 1, size: 1 },
      { type: "ice_crystal", pos: { x: 30, y: 14 }, variant: 2, size: 1 },
      // Snow lanterns marking the summit path
      { type: "snow_lantern", pos: { x: 10, y: 2 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 2, y: 16 }, variant: 1, size: 1 },
      { type: "snow_lantern", pos: { x: 16, y: 24 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 30, y: 24 }, variant: 1, size: 1 },
      // Icicle formations on mountain rocks
      { type: "icicles", pos: { x: 10, y: 6 }, variant: 0, size: 1 },
      { type: "icicles", pos: { x: 20, y: 4 }, variant: 1, size: 1 },
      { type: "icicles", pos: { x: 32, y: 6 }, variant: 0, size: 1 },
      // Broken walls - ancient defenses
      { type: "broken_wall", pos: { x: 6, y: 8 }, variant: 0, size: 1 },
      { type: "broken_wall", pos: { x: 8, y: 8 }, variant: 1, size: 1 },
      // Pine trees at summit edges
      { type: "pine_tree", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "pine_tree", pos: { x: 2, y: 20 }, variant: 1 },
      { type: "pine_tree", pos: { x: 28, y: 10 }, variant: 2 },
      { type: "pine_tree", pos: { x: 28, y: 18 }, variant: 0 },
      // Snow drifts and features
      { type: "snow_pile", pos: { x: 12, y: 20 }, variant: 0 },
      { type: "snow_pile", pos: { x: 20, y: 20 }, variant: 1 },
      { type: "snowman", pos: { x: 2, y: 4 }, variant: 0 },
      { type: "snowman", pos: { x: 24, y: 20 }, variant: 1 },
      // Battle remnants
      { type: "frozen_soldier", pos: { x: 4, y: 16 }, variant: 0, size: 1 },
      { type: "frozen_soldier", pos: { x: 26, y: 12 }, variant: 1, size: 1 },
      { type: "frozen_soldier", pos: { x: 14, y: 22 }, variant: 2, size: 1 },
      { type: "bones", pos: { x: 22, y: 8 }, variant: 1 },
      // Summit heroic statues
      { type: "statue", pos: { x: 14, y: 4 }, variant: 4 },
      { type: "statue", pos: { x: 8, y: 12 }, variant: 3 },
    ],
    hazards: [
      { type: "ice_sheet", pos: { x: 20, y: 7 }, radius: 2 },
      { type: "ice_spikes", pos: { x: 28, y: 19 }, radius: 1.5 },
    ],
    previewImage: "/images/previews/peak.png",
  },
  // =====================
  // VOLCANIC REGION - Inferno Depths
  // =====================
  lava: {
    name: "Lava Fields",
    position: { x: 120, y: 200 },
    description: "Rivers of molten rock carve through the blackened landscape.",
    camera: { offset: { x: -20, y: -370 }, zoom: 0.85 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 2,
    startingPawPoints: 550, // Volcanic intro - lava geyser hazard
    heroSpawn: { x: 18, y: 14 },
    decorations: [
      // Lava pools and castles (path: x:-2 to 32, y:10 to 20)
      { type: "lava_pool", pos: { x: 2, y: 16 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: 26, y: 14 }, variant: 1, size: 2 },
      { type: "dark_barracks", pos: { x: 3, y: 4 }, variant: 0 },
      { type: "dark_barracks", pos: { x: 22, y: 4 }, variant: 1 },
      { type: "dark_barracks", pos: { x: 14, y: 22 }, variant: 2 },
      // Charred trees around
      { type: "charred_tree", pos: { x: 8, y: 6 }, variant: 0 },
      { type: "charred_tree", pos: { x: 16, y: 4 }, variant: 1 },
      { type: "charred_tree", pos: { x: 28, y: 8 }, variant: 2 },
      { type: "charred_tree", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "charred_tree", pos: { x: 26, y: 22 }, variant: 1 },
      // Dark thrones and spires
      { type: "obsidian_pillar", pos: { x: 9, y: 14 }, variant: 0 },
      { type: "dark_spire", pos: { x: 20, y: 16 }, variant: 1 },
      { type: "dark_spire", pos: { x: 8, y: 8 }, variant: 0 },
      // Fire pits and embers
      { type: "fire_pit", pos: { x: 6, y: 12 }, variant: 0 },
      { type: "fire_pit", pos: { x: 24, y: 10 }, variant: 1 },
      { type: "ember", pos: { x: 12, y: 6 }, variant: 0 },
      { type: "ember", pos: { x: 18, y: 20 }, variant: 1 },
      // Bones and skulls
      { type: "bones", pos: { x: 2, y: 10 }, variant: 0 },
      { type: "skull", pos: { x: 28, y: 18 }, variant: 1 },
      { type: "lava_fall", pos: { x: 14, y: 4 }, variant: 0 },
      { type: "ember_rock", pos: { x: 22, y: 8 }, variant: 0 },
      { type: "ember_rock", pos: { x: 10, y: 20 }, variant: 1 },
      { type: "fire_crystal", pos: { x: 16, y: 18 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 30, y: 11 }, variant: 0 },
      { type: "volcano_rim", pos: { x: 20, y: 24 }, variant: 0 },
      { type: "volcano_rim", pos: { x: 2, y: 10 }, variant: 0, size: 1 },

      // Demon statues flanking the lava fields
      { type: "demon_statue", pos: { x: 8, y: 8 }, variant: 1 },
      { type: "demon_statue", pos: { x: 26, y: 20 }, variant: 3 },
    ],
    hazards: [{ type: "lava_geyser", pos: { x: 14, y: 14 }, radius: 2.5 }],
    previewImage: "/images/previews/lava_fields.png",
  },
  crater: {
    name: "Caldera Basin",
    position: { x: 300, y: 200 },
    description:
      "Inside the volcano's heart. The ground trembles with each eruption.",
    camera: { offset: { x: -90, y: -320 }, zoom: 0.8 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    startingPawPoints: 675, // Vault defense - many tough enemies
    heroSpawn: { x: 21, y: 18 },
    specialTowers: [
      {
        pos: { x: 18, y: 9.5 },
        type: "vault",
        hp: 1000,
      },
      {
        pos: { x: 9, y: 20.5 },
        type: "sentinel_nexus",
      },
    ],
    decorations: [
      // Dark throne and castles (path: x:10-26, y:-2 to 32)
      { type: "obsidian_castle", pos: { x: 26, y: 2 }, variant: 0, size: 2 },
      { type: "dark_spire", pos: { x: 4, y: 8 }, variant: 0 },
      { type: "dark_barracks", pos: { x: 24, y: 6 }, variant: 1 },
      { type: "dark_barracks", pos: { x: 4, y: 20 }, variant: 2 },
      { type: "dark_spire", pos: { x: 26, y: 22 }, variant: 0 },
      // Lava pools
      { type: "lava_pool", pos: { x: 6, y: 14 }, variant: 0, size: 2 },
      { type: "lava_pool", pos: { x: 22, y: 12 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 14, y: 22 }, variant: 2, size: 2 },
      // Dark thrones and spires along path
      { type: "dark_spire", pos: { x: 8, y: 10 }, variant: 0 },
      { type: "dark_spire", pos: { x: 20, y: 16 }, variant: 1 },
      { type: "dark_spire", pos: { x: 16, y: 6 }, variant: 2 },
      // Charred trees
      { type: "charred_tree", pos: { x: 4, y: 4 }, variant: 0 },
      { type: "charred_tree", pos: { x: 26, y: 4 }, variant: 1 },
      { type: "charred_tree", pos: { x: 4, y: 26 }, variant: 2 },
      { type: "charred_tree", pos: { x: 26, y: 26 }, variant: 0 },
      // Decorations
      { type: "fire_pit", pos: { x: 10, y: 12 }, variant: 0 },
      { type: "fire_pit", pos: { x: 22, y: 20 }, variant: 1 },
      { type: "demon_statue", pos: { x: 5, y: 17 }, variant: 1 },
      { type: "demon_statue", pos: { x: 24, y: 14 }, variant: 3 },
      { type: "ember", pos: { x: 16, y: 10 }, variant: 0 },
      { type: "ember", pos: { x: 12, y: 20 }, variant: 1 },
      { type: "bones", pos: { x: 2, y: 12 }, variant: 0 },
      { type: "skull", pos: { x: 28, y: 16 }, variant: 1 },
      { type: "lava_fall", pos: { x: 10, y: 0 }, variant: 0 },
      { type: "skull_throne", pos: { x: 14, y: 26 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 2, y: 18 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 28, y: 10 }, variant: 1 },
      { type: "fire_crystal", pos: { x: 18, y: 18 }, variant: 0 },
      { type: "ember_rock", pos: { x: 8, y: 22 }, variant: 0 },
      { type: "volcano_rim", pos: { x: 18, y: 2 }, variant: 0 },
    ],
    hazards: [{ type: "lava_geyser", pos: { x: 18, y: 17 }, radius: 2 }],
    previewImage: "/images/previews/caldera.png",
  },
  throne: {
    name: "Obsidian Throne",
    position: { x: 480, y: 200 },
    description:
      "The ultimate challenge. An ancient dark lord's seat of power, guarded by his legions.",
    camera: { offset: { x: -140, y: -350 }, zoom: 0.85 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    startingPawPoints: 750, // Final level - 20 brutal waves require full arsenal
    heroSpawn: { x: 14, y: 10 },
    dualPath: true,
    secondaryPath: "throne_b",
    specialTower: {
      pos: { x: 16, y: 22 },
      type: "barracks",
    },
    hazards: [{ type: "lava_geyser", pos: { x: 18, y: 14 }, radius: 2 }],
    decorations: [
      // Obsidian castle and dark throne center (paths: x:-2 to 32, y:8 to 20)
      { type: "obsidian_castle", pos: { x: 15, y: -1 }, variant: 0, size: 4 },
      { type: "dark_throne", pos: { x: 15, y: 1 }, variant: 0 },
      // Castles and barracks around the map
      { type: "dark_barracks", pos: { x: 4, y: 1 }, variant: 1 },
      { type: "dark_barracks", pos: { x: 26, y: 6 }, variant: 2 },
      { type: "dark_barracks", pos: { x: 4, y: 22 }, variant: 0 },
      { type: "dark_barracks", pos: { x: 26, y: 22 }, variant: 1 },
      // Demon statues (diverse hero & troop figures)
      { type: "demon_statue", pos: { x: 7, y: 10 }, variant: 1 },
      { type: "demon_statue", pos: { x: 24, y: 8 }, variant: 4 },
      { type: "demon_statue", pos: { x: 8, y: 18 }, variant: 7 },
      { type: "demon_statue", pos: { x: 20, y: 16 }, variant: 3 },
      // Line of status in front of castle
      { type: "demon_statue", pos: { x: 9, y: 3 }, variant: 1 },
      { type: "demon_statue", pos: { x: 11, y: 3 }, variant: 2 },
      { type: "demon_statue", pos: { x: 13, y: 3 }, variant: 3 },
      { type: "demon_statue", pos: { x: 15, y: 3 }, variant: 4 },
      { type: "demon_statue", pos: { x: 17, y: 3 }, variant: 5 },
      { type: "demon_statue", pos: { x: 19, y: 3 }, variant: 6 },
      { type: "demon_statue", pos: { x: 21, y: 3 }, variant: 7 },

      // Lava pools
      { type: "lava_pool", pos: { x: 2, y: 14 }, variant: 0, size: 1 },
      { type: "lava_pool", pos: { x: 27, y: 11.5 }, variant: 1, size: 2 },
      { type: "lava_pool", pos: { x: 22, y: 14 }, variant: 2, size: 1.5 },
      { type: "lava_pool", pos: { x: 12, y: 22 }, variant: 2, size: 2 },
      // Fire pits and embers
      { type: "fire_pit", pos: { x: 8, y: 4 }, variant: 0 },
      { type: "fire_pit", pos: { x: 22, y: 4 }, variant: 1 },
      { type: "fire_pit", pos: { x: 16, y: 20 }, variant: 0 },
      // Dark thrones and spires along paths
      { type: "dark_spire", pos: { x: 8, y: 13 }, variant: 1 },
      { type: "dark_spire", pos: { x: 22, y: 16 }, variant: 2 },
      { type: "dark_spire", pos: { x: 10, y: 4 }, variant: 0 },
      { type: "dark_spire", pos: { x: 20, y: 24 }, variant: 1 },
      // Charred trees
      { type: "charred_tree", pos: { x: 2, y: 8 }, variant: 0 },
      { type: "charred_tree", pos: { x: 28, y: 8 }, variant: 1 },
      { type: "charred_tree", pos: { x: 2, y: 20 }, variant: 2 },
      { type: "charred_tree", pos: { x: 28, y: 20 }, variant: 0 },
      // Embers and bones
      { type: "ember", pos: { x: 10, y: 10 }, variant: 0 },
      { type: "ember", pos: { x: 20, y: 12 }, variant: 1 },
      { type: "bones", pos: { x: 6, y: 20 }, variant: 0 },
      { type: "skull", pos: { x: 24, y: 6 }, variant: 1 },
      { type: "lava_fall", pos: { x: 2, y: 4 }, variant: 0 },
      { type: "lava_fall", pos: { x: 28, y: 4 }, variant: 1 },
      { type: "skull_throne", pos: { x: 14, y: 26 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 6, y: 13 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 24, y: 14 }, variant: 1 },
      { type: "fire_crystal", pos: { x: 16, y: 14 }, variant: 0 },
      { type: "fire_crystal", pos: { x: 12, y: 24 }, variant: 1 },
      { type: "ember_rock", pos: { x: 14, y: 8 }, variant: 0 },
      { type: "volcano_rim", pos: { x: 8, y: 26 }, variant: 0 },
    ],
    previewImage: "/images/previews/throne.png",
  },
  ivy_crossroads: {
    name: "Ivy Crossroads",
    position: { x: 360, y: 260 },
    description:
      "Dual lanes cross through ivy chokepoints.\nStack buffs and split your defense.",
    camera: { offset: { x: -140, y: -320 }, zoom: 0.85 },
    region: "grassland",
    theme: "grassland",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 640,
    heroSpawn: { x: 20, y: 11 },
    dualPath: true,
    secondaryPath: "ivy_crossroads_b",
    specialTowers: [
      { pos: { x: 7.25, y: 19.25 }, type: "chrono_relay" },
      { pos: { x: 15, y: 8 }, type: "chrono_relay" },
      { pos: { x: 24, y: 18 }, type: "chrono_relay" },
      { pos: { x: 17, y: 16 }, type: "sentinel_nexus" },
    ],
    hazards: [
      { type: "storm_field", pos: { x: 7.25, y: 19.25 } },
      { type: "maelstrom", pos: { x: 15, y: 8 }, radius: 1.8 },
      { type: "maelstrom", pos: { x: 24, y: 18 }, radius: 2.1 },
    ],
    decorations: [
      { type: "war_monument", pos: { x: 15, y: 4 }, variant: 0, size: 1.7 },
      { type: "statue", pos: { x: 9, y: 10 }, variant: 6 },
      { type: "statue", pos: { x: 16, y: 20 }, variant: 4 },
      { type: "statue", pos: { x: 20, y: 3 }, variant: 7 },
      { type: "fountain", pos: { x: 17, y: 16 }, variant: 0 },
      { type: "tree", pos: { x: 4, y: 4 }, variant: 1 },
      { type: "tree", pos: { x: 28, y: 4 }, variant: 2 },
      { type: "tree", pos: { x: 4, y: 25 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 25 }, variant: 2 },
      { type: "hedge", pos: { x: 8, y: 20 }, variant: 0 },
      { type: "tombstone", pos: { x: 21, y: 6 }, variant: 1 },
      { type: "campfire", pos: { x: 30, y: 14 }, variant: 0 },
      { type: "gate", pos: { x: 1, y: 15 }, variant: 0 },
    ],
    previewImage: "/images/previews/nassau.png",
  },
  blight_basin: {
    name: "Blight Basin",
    position: { x: 720, y: 260 },
    description:
      "Layered poison zones punish slow setups.\nAnswer synchronized side-lane swarms.",
    camera: { offset: { x: -150, y: -330 }, zoom: 0.84 },
    region: "swamp",
    theme: "swamp",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 700,
    heroSpawn: { x: 17, y: 13 },
    dualPath: true,
    secondaryPath: "blight_basin_b",
    specialTowers: [
      { pos: { x: 9, y: 15 }, type: "shrine" },
      { pos: { x: 24, y: 13 }, type: "vault", hp: 700 },
      { pos: { x: 17, y: 20 }, type: "barracks" },
    ],
    hazards: [
      { type: "poison_fog", pos: { x: 13, y: 14 }, radius: 2.2 },
      { type: "maelstrom", pos: { x: 24, y: 18 }, radius: 2.1 },
      { type: "deep_water", pos: { x: 17, y: 10 }, radius: 1.8 },
    ],
    decorations: [
      { type: "bone_altar", pos: { x: 17, y: 6 }, variant: 0, size: 2.2 },
      { type: "ruined_temple", pos: { x: 14, y: 24 }, variant: 6, size: 2 },
      { type: "sunken_pillar", pos: { x: 8, y: 12 }, variant: 0 },
      { type: "sunken_pillar", pos: { x: 24, y: 22 }, variant: 1 },
      { type: "tombstone", pos: { x: 6, y: 7 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 3, y: 4 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 29, y: 4 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 4, y: 27 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 28, y: 27 }, variant: 0 },
      { type: "fog_patch", pos: { x: 21, y: 8 }, variant: 0 },
      { type: "tentacle", pos: { x: 17, y: 10 }, variant: 2, size: 1.2 },
      { type: "glowing_runes", pos: { x: 25, y: 14 }, variant: 0 },
      { type: "idol_statue", pos: { x: 12, y: 18 }, variant: 0 },
    ],
    previewImage: "/images/previews/sunken_temple.png",
  },
  sunscorch_labyrinth: {
    name: "Sunscorch Labyrinth",
    position: { x: 1040, y: 260 },
    description:
      "Mirrored mazes split your formation.\nSurvive overlapping hazard rings.",
    camera: { offset: { x: -130, y: -320 }, zoom: 0.83 },
    region: "desert",
    theme: "desert",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 730,
    heroSpawn: { x: 16, y: 15 },
    dualPath: true,
    secondaryPath: "sunscorch_labyrinth_b",
    specialTowers: [
      { pos: { x: 8, y: 14 }, type: "beacon", hp: 420 },
      { pos: { x: 21, y: 22 }, type: "sunforge_orrery" },
      { pos: { x: 15, y: 21 }, type: "chrono_relay" },
      { pos: { x: 12.5, y: 8 }, type: "sunforge_orrery" },
    ],
    hazards: [
      { type: "quicksand", pos: { x: 14, y: 15 }, radius: 2 },
      { type: "quicksand", pos: { x: 23, y: 12 }, radius: 2.2 },
      { type: "quicksand", pos: { x: 18.5, y: 13 }, radius: 2.4 },
    ],
    decorations: [
      { type: "sun_obelisk", pos: { x: 16, y: 3 }, variant: 0, size: 1.5 },
      { type: "pyramid", pos: { x: 4, y: 4 }, variant: 0, size: 1.4 },
      { type: "pyramid", pos: { x: 27, y: 6 }, variant: 1, size: 1.6 },
      { type: "obelisk", pos: { x: 11, y: 10 }, variant: 0 },
      { type: "obelisk", pos: { x: 24, y: 20 }, variant: 1 },
      { type: "sarcophagus", pos: { x: 14, y: 22 }, variant: 0 },
      { type: "dune", pos: { x: 6, y: 24 }, variant: 1 },
      { type: "dune", pos: { x: 26, y: 24 }, variant: 0 },
      { type: "cactus", pos: { x: 2, y: 13 }, variant: 2 },
      { type: "cactus", pos: { x: 30, y: 13 }, variant: 0 },
      { type: "treasure_chest", pos: { x: 19, y: 7 }, variant: 0 },
      { type: "torch", pos: { x: 20, y: 17 }, variant: 1 },
      // Ancient guardian statues flanking the labyrinth
      { type: "statue", pos: { x: 8, y: 18 }, variant: 7 },
      { type: "statue", pos: { x: 26, y: 14 }, variant: 0 },
    ],
    previewImage: "/images/previews/sphinx.png",
  },
  whiteout_pass: {
    name: "Whiteout Pass",
    position: { x: 1420, y: 260 },
    description:
      "Blinding ice lanes chain heavy slows.\nOutlast burst freeze traps.",
    camera: { offset: { x: -145, y: -345 }, zoom: 0.83 },
    region: "winter",
    theme: "winter",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 770,
    heroSpawn: { x: 19, y: 14 },
    dualPath: true,
    secondaryPath: "whiteout_pass_b",
    specialTowers: [
      { pos: { x: 16, y: 20 }, type: "shrine" },
      { pos: { x: 26, y: 11 }, type: "beacon" },
      { pos: { x: 8, y: 11 }, type: "beacon" },
    ],
    hazards: [
      { type: "ice_sheet", pos: { x: 14, y: 10 }, radius: 2.1 },
      { type: "ice_spikes", pos: { x: 22, y: 18 }, radius: 2.1 },
      { type: "ice_sheet", pos: { x: 27, y: 9 }, radius: 1.6 },
    ],
    decorations: [
      { type: "frost_citadel", pos: { x: 16, y: 5 }, variant: 0, size: 2 },
      { type: "ice_fortress", pos: { x: 4, y: 8 }, variant: 1, size: 1.2 },
      { type: "ice_bridge", pos: { x: 5, y: 14 }, variant: 0, size: 1.4 },
      { type: "ice_bridge", pos: { x: 27, y: 14 }, variant: 1, size: 1.4 },
      { type: "frozen_waterfall", pos: { x: 2, y: 9 }, variant: 0, size: 1.2 },
      { type: "frozen_waterfall", pos: { x: 30, y: 9 }, variant: 1, size: 1.2 },
      { type: "aurora_crystal", pos: { x: 10, y: 23 }, variant: 0, size: 1.2 },
      { type: "aurora_crystal", pos: { x: 24, y: 23 }, variant: 1, size: 1.2 },
      { type: "ice_crystal", pos: { x: 20, y: 14 }, variant: 2, size: 1.1 },
      { type: "ice_spire", pos: { x: 28, y: 18 }, variant: 1, size: 1.3 },
      { type: "glacier", pos: { x: 6, y: 20 }, variant: 2, size: 1.2 },
      { type: "snowman", pos: { x: 12, y: 20 }, variant: 0 },
      { type: "snowman", pos: { x: 20, y: 20 }, variant: 2 },
      { type: "frozen_soldier", pos: { x: 14, y: 14 }, variant: 1 },
      { type: "pine_tree", pos: { x: 3, y: 4 }, variant: 0 },
      { type: "pine_tree", pos: { x: 28, y: 4 }, variant: 1 },
      { type: "snow_lantern", pos: { x: 13, y: 17 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 22, y: 12 }, variant: 1, size: 1 },
      // Frozen warrior statues guarding the pass
      { type: "statue", pos: { x: 8, y: 10 }, variant: 3 },
      { type: "statue", pos: { x: 24, y: 10 }, variant: 7 },
    ],
    previewImage: "/images/previews/peak.png",
  },
  ashen_spiral: {
    name: "Ashen Spiral",
    position: { x: 1740, y: 260 },
    description:
      "Converging inferno lanes crush weak lines.\nEndure stacked geysers while the Sunforge Orrery incinerates clustered elites.",
    camera: { offset: { x: -150, y: -330 }, zoom: 0.82 },
    region: "volcanic",
    theme: "volcanic",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 840,
    heroSpawn: { x: 16, y: 14 },
    dualPath: true,
    secondaryPath: "ashen_spiral_b",
    specialTowers: [
      { pos: { x: 14, y: 10 }, type: "beacon" },
      { pos: { x: 24, y: 22 }, type: "barracks" },
      { pos: { x: 18, y: 16 }, type: "vault", hp: 900 },
      { pos: { x: 8, y: 20 }, type: "sentinel_nexus" },
      { pos: { x: 22, y: 6 }, type: "sunforge_orrery" },
    ],
    hazards: [
      { type: "lava_geyser", pos: { x: 12, y: 16 }, radius: 2.2 },
      { type: "lava_geyser", pos: { x: 23, y: 20 }, radius: 2.2 },
      { type: "lava_geyser", pos: { x: 28, y: 12 }, radius: 1.8 },
      { type: "storm_field", pos: { x: 19, y: 11 }, radius: 1.7 },
      { type: "volcano", pos: { x: 16, y: 22 }, radius: 2.5 },
    ],
    decorations: [
      { type: "infernal_gate", pos: { x: 16, y: 2 }, variant: 0, size: 2.5 },
      { type: "dark_throne", pos: { x: 18, y: 4 }, variant: 0 },
      { type: "lava_pool", pos: { x: 8, y: 14 }, variant: 0, size: 1.8 },
      { type: "lava_pool", pos: { x: 22, y: 22 }, variant: 1, size: 1.8 },
      { type: "dark_spire", pos: { x: 6, y: 8 }, variant: 0 },
      { type: "dark_spire", pos: { x: 26, y: 8 }, variant: 1 },
      { type: "demon_statue", pos: { x: 10, y: 20 }, variant: 5 },
      { type: "demon_statue", pos: { x: 24, y: 14 }, variant: 6 },
      { type: "fire_pit", pos: { x: 14, y: 24 }, variant: 0 },
      { type: "fire_pit", pos: { x: 30, y: 15 }, variant: 1 },
      { type: "obsidian_pillar", pos: { x: 3, y: 18 }, variant: 0 },
      { type: "obsidian_pillar", pos: { x: 29, y: 24 }, variant: 1 },
      { type: "charred_tree", pos: { x: 2, y: 4 }, variant: 0 },
      { type: "charred_tree", pos: { x: 30, y: 4 }, variant: 1 },
    ],
    previewImage: "/images/previews/throne.png",
  },
  cannon_crest: {
    name: "Cannon Crest",
    position: { x: 470, y: 250 },
    description:
      "Only Nassau Cannons can be built.\nLock both lanes and fire with precision.",
    camera: { offset: { x: -145, y: -328 }, zoom: 0.84 },
    region: "grassland",
    theme: "grassland",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 980,
    heroSpawn: { x: 20, y: 16 },
    allowedTowers: ["cannon"],
    dualPath: true,
    secondaryPath: "cannon_crest_b",
    specialTowers: [
      { pos: { x: 16, y: 21 }, type: "beacon" },
      { pos: { x: 14, y: 11 }, type: "chrono_relay" },
      { pos: { x: 16, y: 18 }, type: "chrono_relay" },
      { pos: { x: 14, y: 8 }, type: "beacon" },
      { pos: { x: 14, y: 3.5 }, type: "sentinel_nexus" },
      { pos: { x: 20.5, y: 5 }, type: "sentinel_nexus" },
      { pos: { x: 14, y: 5 }, type: "sentinel_nexus" },
      { pos: { x: 20.5, y: 3.5 }, type: "sentinel_nexus" },
    ],
    hazards: [
      { type: "quicksand", pos: { x: 14, y: 13 }, radius: 1.9 },
      { type: "poison_fog", pos: { x: 25, y: 14 }, radius: 1.6 },
    ],
    decorations: [
      { type: "war_monument", pos: { x: 16, y: 2 }, variant: 1, size: 2 },
      { type: "building", pos: { x: 5, y: 8 }, variant: 0 },
      { type: "building", pos: { x: 27, y: 9 }, variant: 1 },
      { type: "tree", pos: { x: 3, y: 4 }, variant: 0 },
      { type: "tree", pos: { x: 28, y: 4 }, variant: 2 },
      { type: "tree", pos: { x: 4, y: 26 }, variant: 1 },
      { type: "tree", pos: { x: 29, y: 26 }, variant: 2 },
      { type: "tombstone", pos: { x: 10, y: 22 }, variant: 0 },
      { type: "tombstone", pos: { x: 22, y: 6 }, variant: 3 },
      { type: "campfire", pos: { x: 30, y: 16 }, variant: 0 },
      // Hero & troop statues flanking battlefield
      { type: "statue", pos: { x: 8, y: 14 }, variant: 4 },
      { type: "statue", pos: { x: 24, y: 14 }, variant: 7 },
    ],
    previewImage: "/images/previews/nassau.png",
  },
  triad_keep: {
    name: "Triad Keep",
    position: { x: 760, y: 270 },
    description:
      "Build only Dinky, Library, and Club.\nStall, support, and out-economy the waves.",
    camera: { offset: { x: -148, y: -334 }, zoom: 0.84 },
    region: "swamp",
    theme: "swamp",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 920,
    heroSpawn: { x: 18, y: 12 },
    allowedTowers: ["station", "library", "club"],
    dualPath: true,
    secondaryPath: "triad_keep_b",
    specialTowers: [
      { pos: { x: 11, y: 13 }, type: "vault", hp: 430 },
      { pos: { x: 24, y: 16 }, type: "vault", hp: 430 },
      { pos: { x: 17, y: 20 }, type: "shrine" },
    ],
    hazards: [
      { type: "poison_fog", pos: { x: 13, y: 14 }, radius: 2.2 },
      { type: "deep_water", pos: { x: 20, y: 12 }, radius: 1.8 },
      { type: "poison_fog", pos: { x: 26, y: 18 }, radius: 1.7 },
    ],
    decorations: [
      { type: "bone_altar", pos: { x: 16, y: 4 }, variant: 1, size: 2 },
      { type: "ruined_temple", pos: { x: 16, y: 26 }, variant: 6, size: 2 },
      { type: "sunken_pillar", pos: { x: 7, y: 10 }, variant: 1 },
      { type: "sunken_pillar", pos: { x: 25, y: 23 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 3, y: 5 }, variant: 0 },
      { type: "swamp_tree", pos: { x: 29, y: 6 }, variant: 2 },
      { type: "swamp_tree", pos: { x: 5, y: 27 }, variant: 1 },
      { type: "swamp_tree", pos: { x: 28, y: 27 }, variant: 0 },
      { type: "tombstone", pos: { x: 23, y: 8 }, variant: 1 },
      { type: "glowing_runes", pos: { x: 26, y: 14 }, variant: 0 },
      // Paired idol statues guarding the keep entrance
      { type: "idol_statue", pos: { x: 10, y: 14 }, variant: 0 },
      { type: "idol_statue", pos: { x: 22, y: 18 }, variant: 0 },
    ],
    previewImage: "/images/previews/sunken_temple.png",
  },
  frontier_outpost: {
    name: "Frontier Outpost",
    position: { x: 1460, y: 250 },
    description:
      "Only Dinky Station can be built.\nFrontier Barracks must hold the line.",
    camera: { offset: { x: -152, y: -346 }, zoom: 0.83 },
    region: "winter",
    theme: "winter",
    difficulty: 3,
    levelKind: "challenge",
    startingPawPoints: 880,
    heroSpawn: { x: 18, y: 13 },
    allowedTowers: ["station"],
    dualPath: true,
    secondaryPath: "frontier_outpost_b",
    specialTowers: [
      { pos: { x: 9, y: 14 }, type: "barracks" },
      { pos: { x: 24, y: 13 }, type: "barracks" },
      { pos: { x: 17, y: 19 }, type: "beacon" },
      { pos: { x: 17, y: 8 }, type: "sentinel_nexus" },
    ],
    hazards: [
      { type: "ice_sheet", pos: { x: 13, y: 9 }, radius: 2.1 },
      { type: "ice_spikes", pos: { x: 23, y: 18 }, radius: 1.9 },
      { type: "ice_sheet", pos: { x: 28, y: 10 }, radius: 1.5 },
    ],
    decorations: [
      { type: "frost_citadel", pos: { x: 16, y: 4 }, variant: 1, size: 1.8 },
      { type: "ice_fortress", pos: { x: 4, y: 6 }, variant: 2, size: 1.3 },
      { type: "ice_fortress", pos: { x: 28, y: 6 }, variant: 0, size: 1.3 },
      { type: "ice_bridge", pos: { x: 6, y: 14 }, variant: 0, size: 1.3 },
      { type: "ice_bridge", pos: { x: 27, y: 14 }, variant: 1, size: 1.3 },
      { type: "frozen_waterfall", pos: { x: 2, y: 10 }, variant: 0, size: 1.2 },
      {
        type: "frozen_waterfall",
        pos: { x: 30, y: 10 },
        variant: 1,
        size: 1.2,
      },
      { type: "aurora_crystal", pos: { x: 10, y: 23 }, variant: 0, size: 1.2 },
      { type: "aurora_crystal", pos: { x: 24, y: 23 }, variant: 1, size: 1.2 },
      { type: "ice_spire", pos: { x: 8, y: 20 }, variant: 0, size: 1.2 },
      { type: "glacier", pos: { x: 24, y: 18 }, variant: 1, size: 1.2 },
      { type: "snowman", pos: { x: 6, y: 22 }, variant: 1 },
      { type: "frozen_soldier", pos: { x: 20, y: 18 }, variant: 2 },
      { type: "frozen_soldier", pos: { x: 12, y: 20 }, variant: 0 },
      { type: "pine_tree", pos: { x: 3, y: 4 }, variant: 0 },
      { type: "pine_tree", pos: { x: 28, y: 4 }, variant: 1 },
      { type: "snow_lantern", pos: { x: 13, y: 17 }, variant: 0, size: 1 },
      { type: "snow_lantern", pos: { x: 22, y: 12 }, variant: 1, size: 1 },
      // Outpost defender statues
      { type: "statue", pos: { x: 10, y: 8 }, variant: 0 },
      { type: "statue", pos: { x: 22, y: 8 }, variant: 5 },
    ],
    previewImage: "/images/previews/peak.png",
  },
  // =====================
  // DEV TEST LEVELS
  // =====================
  dev_enemy_showcase: {
    name: "Enemy Showcase",
    position: { x: 60, y: 60 },
    description: "Dev-only test level. Every enemy type, one at a time.",
    camera: { offset: { x: -100, y: -390 }, zoom: 1.05 },
    region: "grassland",
    theme: "grassland",
    difficulty: 1,
    levelKind: "custom",
    startingPawPoints: 99999,
    heroSpawn: { x: 15, y: 15 },
  },
};

// =============================================================================
// REGION THEME COLORS - For map rendering
// =============================================================================
export const REGION_THEMES: Record<
  MapTheme,
  {
    ground: string[];
    path: string[];
    accent: string;
    fog: string;
  }
> = {
  grassland: {
    ground: ["#3a2f1f", "#2a1f0f", "#1a0f05"],
    path: ["#8b7355", "#a0826d", "#5b4334"],
    accent: "#4a7c59",
    fog: "rgba(200, 220, 200, 0.3)",
  },
  desert: {
    ground: ["#8b7355", "#a08060", "#6b5340"],
    path: ["#c4a35a", "#d4b36a", "#a4833a"],
    accent: "#daa520",
    fog: "rgba(255, 230, 180, 0.25)",
  },
  winter: {
    ground: ["#4a5a6a", "#3a4a5a", "#2a3a4a"],
    path: ["#8899aa", "#99aabb", "#6677aa"],
    accent: "#6ba3be",
    fog: "rgba(200, 220, 255, 0.35)",
  },
  volcanic: {
    ground: ["#2a1a1a", "#3a2020", "#1a0a0a"],
    path: ["#5a3a3a", "#6a4a4a", "#4a2a2a"],
    accent: "#ff4400",
    fog: "rgba(255, 100, 50, 0.15)",
  },
  swamp: {
    ground: ["#1a2a1a", "#0f1f0f", "#0a150a"],
    path: ["#3a4a3a", "#4a5a4a", "#2a3a2a"],
    accent: "#4a8a4a",
    fog: "rgba(100, 150, 100, 0.4)",
  },
};
