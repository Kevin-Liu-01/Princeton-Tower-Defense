export function clampRgb(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function darkenRgbChannel(value: number, factor: number): number {
  return clampRgb(value * factor);
}
