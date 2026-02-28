"use client";
// =============================================================================
// GameUI barrel re-export file
// All components have been separated into individual files for maintainability.
// This file re-exports everything to maintain backward compatibility.
// =============================================================================

// Sprite re-exports (used by SetupScreen and other consumers)
export { TowerSprite, HeroSprite, SpellSprite, EnemySprite, HeroAbilityIcon, getHeroAbilityIcon } from "../../sprites";

// Hooks
export { useIsTouchDevice, useResponsiveSizes } from "./hooks";
export type { ResponsiveSizes } from "./hooks";

// Components
export { TopHUD } from "./TopHUD";
export { CameraControls } from "./CameraControls";
export { HeroSpellBar } from "./HeroSpellBar";
export { BuildMenu } from "./BuildMenu";
export { TowerUpgradePanel } from "./TowerUpgradePanel";
export {
  Tooltip,
  TowerHoverTooltip,
  BuildTowerTooltip,
  PlacingTroopIndicator,
  SpecialBuildingTooltip,
  LandmarkTooltip,
  HazardTooltip,
} from "./Tooltips";
export { EnemyInspector, EnemyDetailTooltip } from "./EnemyInspector";
export { HeroHoverTooltip } from "./HeroHoverTooltip";
