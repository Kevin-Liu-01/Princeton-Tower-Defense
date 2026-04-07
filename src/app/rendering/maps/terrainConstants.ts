import type { MapTheme } from "../../types";

export interface TerrainPalette {
  basePatches: string[];
  soilSpots: string[];
  mossCover: string[];
  highlight: string;
  shadow: string;
  grain: string[];
  biomeFeature: string[];
  contour: string;
}

export const TERRAIN_PALETTES: Record<MapTheme, TerrainPalette> = {
  desert: {
    basePatches: [
      "#8a7454",
      "#9a845e",
      "#7a6444",
      "#a89468",
      "#6a543a",
      "#b09870",
      "#786040",
    ],
    biomeFeature: ["#b09060", "#c4a878", "#907448", "#685030", "#584028"],
    contour: "#5a4830",
    grain: ["#9a8460", "#786040", "#a89068", "#8a7050"],
    highlight: "#c8b488",
    mossCover: ["#5a6a3a", "#4a5a2e", "#3a4a22", "#6a7a44", "#506030"],
    shadow: "#3a2a18",
    soilSpots: ["#6a5438", "#7a6448", "#5a442e", "#8a7452", "#70583c"],
  },
  grassland: {
    basePatches: [
      "#2a4420",
      "#34522a",
      "#243d1a",
      "#3a5c2e",
      "#1e3516",
      "#2d4d23",
      "#1a3012",
    ],
    biomeFeature: [
      "#4a8030",
      "#68a848",
      "#3a6820",
      "#8ab060",
      "#e8d040",
      "#b080d0",
      "#e8e8e8",
    ],
    contour: "#1a3010",
    grain: ["#2e5020", "#1c3a14", "#3a6030", "#28441c"],
    highlight: "#5a9a3a",
    mossCover: ["#3e6828", "#4a7a30", "#2e5a1e", "#56883a", "#448032"],
    shadow: "#0e1a08",
    soilSpots: ["#3a2e1a", "#4a3c24", "#2e2210", "#564832", "#42341c"],
  },
  swamp: {
    basePatches: [
      "#162a14",
      "#1e3418",
      "#10220e",
      "#243c1e",
      "#0c1a0a",
      "#1a3016",
      "#0e2410",
    ],
    biomeFeature: ["#1a4028", "#0e3020", "#2a5a38", "#183a24", "#3a5a3a"],
    contour: "#0a1808",
    grain: ["#0e2010", "#1a3018", "#0a180c", "#162a14"],
    highlight: "#3a8a3a",
    mossCover: ["#1a4a1a", "#225a22", "#143e14", "#2a6428", "#1e5020"],
    shadow: "#040a04",
    soilSpots: ["#1a2a18", "#22341e", "#0e1a0c", "#2a3e22", "#1e3018"],
  },
  volcanic: {
    basePatches: [
      "#2a1414",
      "#341a1a",
      "#1e0e0e",
      "#3e2020",
      "#180a0a",
      "#301818",
      "#220c0c",
    ],
    biomeFeature: [
      "#ff4400",
      "#ff6622",
      "#cc3300",
      "#ff8844",
      "#884422",
      "#442222",
    ],
    contour: "#180808",
    grain: ["#2a1414", "#1e0c0c", "#341818", "#241010"],
    highlight: "#6a3a2a",
    mossCover: ["#3a2a1a", "#2a1a0a", "#4a3a2a", "#1a1008", "#342414"],
    shadow: "#0a0404",
    soilSpots: ["#3a2020", "#442828", "#2e1616", "#4a3030", "#381c1c"],
  },
  winter: {
    basePatches: [
      "#4a5a6a",
      "#546474",
      "#3e4e5e",
      "#5e6e7e",
      "#344454",
      "#4e5e70",
      "#3a4a5c",
    ],
    biomeFeature: ["#c8d8e8", "#e0e8f0", "#a0b0c0", "#d0dce8", "#7090a0"],
    contour: "#2a3a4a",
    grain: ["#546474", "#3e5060", "#4a5c6c", "#405262"],
    highlight: "#8a9aaa",
    mossCover: ["#3a5a4a", "#2a4a3a", "#1a3a2a", "#4a6a5a", "#345a48"],
    shadow: "#1a2a3a",
    soilSpots: ["#5a6878", "#4a5868", "#3a4858", "#6a7888", "#506070"],
  },
};
