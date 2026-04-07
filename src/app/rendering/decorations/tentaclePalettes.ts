export interface TentaclePalette {
  dark: string;
  mid: string;
  light: string;
  highlight: string;
  suckerOuter: string;
  suckerInner: string;
  suckerDeep: string;
  suckerDarkest: string;
  slime: string;
  waterTint: string;
}

export const TENTACLE_PALETTES: TentaclePalette[] = [
  {
    dark: "#4A148C",
    highlight: "#BA68C8",
    light: "#9C27B0",
    mid: "#7B1FA2",
    slime: "rgba(186, 104, 200, 0.55)",
    suckerDarkest: "#38006b",
    suckerDeep: "#7B1FA2",
    suckerInner: "#CE93D8",
    suckerOuter: "#E1BEE7",
    waterTint: "80, 100, 140",
  },
  {
    dark: "#1B5E20",
    highlight: "#66BB6A",
    light: "#43A047",
    mid: "#2E7D32",
    slime: "rgba(102, 187, 106, 0.55)",
    suckerDarkest: "#0a3d0a",
    suckerDeep: "#2E7D32",
    suckerInner: "#A5D6A7",
    suckerOuter: "#C8E6C9",
    waterTint: "60, 100, 70",
  },
  {
    dark: "#7f0000",
    highlight: "#ef5350",
    light: "#d32f2f",
    mid: "#b71c1c",
    slime: "rgba(239, 83, 80, 0.5)",
    suckerDarkest: "#560000",
    suckerDeep: "#b71c1c",
    suckerInner: "#EF9A9A",
    suckerOuter: "#FFCDD2",
    waterTint: "120, 70, 70",
  },
  {
    dark: "#004D40",
    highlight: "#26A69A",
    light: "#00897B",
    mid: "#00695C",
    slime: "rgba(38, 166, 154, 0.5)",
    suckerDarkest: "#002820",
    suckerDeep: "#00695C",
    suckerInner: "#80CBC4",
    suckerOuter: "#B2DFDB",
    waterTint: "50, 110, 110",
  },
  {
    dark: "#4a4a10",
    highlight: "#a8a830",
    light: "#8b8b22",
    mid: "#6b6b18",
    slime: "rgba(168, 168, 48, 0.5)",
    suckerDarkest: "#2a2a08",
    suckerDeep: "#6b6b18",
    suckerInner: "#d0d078",
    suckerOuter: "#e8e8a0",
    waterTint: "90, 100, 60",
  },
  {
    dark: "#1A237E",
    highlight: "#5C6BC0",
    light: "#3949AB",
    mid: "#283593",
    slime: "rgba(92, 107, 192, 0.5)",
    suckerDarkest: "#0d1042",
    suckerDeep: "#283593",
    suckerInner: "#9FA8DA",
    suckerOuter: "#C5CAE9",
    waterTint: "70, 80, 140",
  },
];
