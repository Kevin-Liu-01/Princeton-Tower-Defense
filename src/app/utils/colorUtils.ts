export function clampRgb(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function darkenRgbChannel(value: number, factor: number): number {
  return clampRgb(value * factor);
}

export function hexToRgba(hex: string, alpha: number): string {
  const stripped = hex.trim().replace("#", "");
  const fullHex =
    stripped.length === 3
      ? [...stripped].map((c) => `${c}${c}`).join("")
      : stripped;
  const value = Number.parseInt(fullHex, 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}
