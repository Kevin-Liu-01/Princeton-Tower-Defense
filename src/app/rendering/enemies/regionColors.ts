import type { MapTheme } from "../../types";

interface RegionColorShift {
  tintR: number;
  tintG: number;
  tintB: number;
  saturationMul: number;
  brightnessDelta: number;
  strength: number;
}

const REGION_SHIFTS: Record<MapTheme, RegionColorShift> = {
  grassland: { tintR: 0, tintG: 0, tintB: 0, saturationMul: 1.0, brightnessDelta: 0, strength: 0 },
  swamp: { tintR: 45, tintG: 75, tintB: 30, saturationMul: 0.65, brightnessDelta: -25, strength: 0.62 },
  desert: { tintR: 200, tintG: 170, tintB: 100, saturationMul: 0.75, brightnessDelta: 15, strength: 0.58 },
  winter: { tintR: 160, tintG: 195, tintB: 230, saturationMul: 0.55, brightnessDelta: 20, strength: 0.62 },
  volcanic: { tintR: 140, tintG: 40, tintB: 20, saturationMul: 0.8, brightnessDelta: -15, strength: 0.58 },
};

const REGION_CANVAS_FILTERS: Record<MapTheme, string> = {
  grassland: "none",
  swamp: "sepia(0.22) hue-rotate(55deg) saturate(0.75) brightness(0.88)",
  desert: "sepia(0.28) hue-rotate(-5deg) saturate(0.85) brightness(1.06)",
  winter: "sepia(0.18) hue-rotate(175deg) saturate(0.55) brightness(1.12)",
  volcanic: "sepia(0.22) hue-rotate(-28deg) saturate(1.1) brightness(0.88)",
};

export function getRegionCanvasFilter(region: MapTheme): string {
  return REGION_CANVAS_FILTERS[region] ?? "none";
}

function parseColor(color: string): [number, number, number] {
  if (color.startsWith("rgb")) {
    const m = color.match(/\d+/g);
    if (m && m.length >= 3) return [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])];
  }
  const hex = color.replace("#", "");
  if (hex.length >= 6) {
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  }
  return [128, 128, 128];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`;
}

function desaturate(r: number, g: number, b: number, factor: number): [number, number, number] {
  const gray = r * 0.299 + g * 0.587 + b * 0.114;
  return [
    gray + (r - gray) * factor,
    gray + (g - gray) * factor,
    gray + (b - gray) * factor,
  ];
}

const transformCache = new Map<string, string>();

export function transformColorForRegion(color: string, region: MapTheme): string {
  if (region === "grassland") return color;

  const key = `${color}|${region}`;
  const cached = transformCache.get(key);
  if (cached) return cached;

  const shift = REGION_SHIFTS[region];
  let [r, g, b] = parseColor(color);

  [r, g, b] = desaturate(r, g, b, shift.saturationMul);

  r = r + (shift.tintR - r) * shift.strength;
  g = g + (shift.tintG - g) * shift.strength;
  b = b + (shift.tintB - b) * shift.strength;

  r += shift.brightnessDelta;
  g += shift.brightnessDelta;
  b += shift.brightnessDelta;

  const result = toHex(r, g, b);
  transformCache.set(key, result);
  return result;
}

const paletteCache = new Map<string, { color: string; dark: string; light: string }>();

export function getRegionalPalette(
  baseColor: string,
  region: MapTheme,
  darken: (c: string, n: number) => string,
  lighten: (c: string, n: number) => string,
): { color: string; dark: string; light: string } {
  if (region === "grassland") {
    return {
      color: baseColor,
      dark: darken(baseColor, 30),
      light: lighten(baseColor, 20),
    };
  }

  const key = `${baseColor}|${region}`;
  const cached = paletteCache.get(key);
  if (cached) return cached;

  const transformed = transformColorForRegion(baseColor, region);
  const palette = {
    color: transformed,
    dark: darken(transformed, 30),
    light: lighten(transformed, 20),
  };
  paletteCache.set(key, palette);
  return palette;
}
