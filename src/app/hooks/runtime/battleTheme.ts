import { LEVEL_DATA, REGION_THEMES } from "../../constants";
import type { TowerType } from "../../types";
import { hexToRgb } from "../../utils";
import { darkenRgbChannel } from "../../utils/colorUtils";

export interface BattleThemeInfo {
  fadeOverlayBackground: string;
  levelAllowedTowers: TowerType[] | null;
  selectedThemeKey: string;
}

export function computeBattleTheme(selectedMap: string): BattleThemeInfo {
  const selectedLevelData = LEVEL_DATA[selectedMap];
  const selectedThemeKey =
    selectedLevelData?.theme && selectedLevelData.theme in REGION_THEMES
      ? (selectedLevelData.theme as keyof typeof REGION_THEMES)
      : "grassland";
  const palette = REGION_THEMES[selectedThemeKey];
  const accent = hexToRgb(palette.accent);
  const gStart = hexToRgb(palette.ground[0] || "#1a1f25");
  const gEnd = hexToRgb(palette.ground[2] || "#080b10");

  const fadeOverlayBackground =
    `radial-gradient(circle at 24% 16%, ` +
    `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.26), ` +
    `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.08) 42%, rgba(0,0,0,0) 76%), ` +
    `linear-gradient(135deg, ` +
    `rgba(${darkenRgbChannel(gStart.r, 0.55)}, ${darkenRgbChannel(gStart.g, 0.55)}, ${darkenRgbChannel(gStart.b, 0.55)}, 0.98) 0%, ` +
    `rgba(${darkenRgbChannel(gEnd.r, 0.7)}, ${darkenRgbChannel(gEnd.g, 0.7)}, ${darkenRgbChannel(gEnd.b, 0.7)}, 0.98) 100%)`;

  const levelAllowedTowers = selectedLevelData?.allowedTowers ?? null;
  return { fadeOverlayBackground, levelAllowedTowers, selectedThemeKey };
}
