// Princeton Tower Defense - Modular Rendering Exports
// This file exports all modular rendering functions
// Can be used to gradually migrate from the monolithic rendering/index.ts

// Helper utilities
export * from "../helpers";

// Tower rendering
export {
  renderTower,
  renderTowerRange,
  renderTowerPreview,
} from "../towers";

// Enemy rendering
export { renderEnemy } from "../enemies";

// Hero rendering
export { renderHero } from "../heroes";

// Troop rendering
export { renderTroop } from "../troops";

// Effects, projectiles, particles
export {
  renderEffect,
  renderProjectile,
  renderParticle,
} from "../effects";

// Map rendering
export {
  renderMapBackground,
  renderPath,
  renderSpawnPoint,
  renderExitPoint,
  MAP_THEMES,
  // Enhanced environmental effects
  renderEnvironment,
  renderAmbientVisuals,
  renderGrasslandEnvironment,
  renderDesertEnvironment,
  renderWinterEnvironment,
  renderVolcanicEnvironment,
  renderSwampEnvironment,
} from "../maps";

// Decoration rendering
export { renderDecoration } from "../decorations";

// Hazard rendering
export { renderHazard } from "../hazards";

// UI elements
export {
  renderFloatingText,
  renderWaveIndicator,
  renderResourceDisplay,
  renderTowerSelectionUI,
  renderHeroSelectionUI,
  renderPauseOverlay,
  renderSpeedIndicator,
  renderTooltip,
  type FloatingText,
} from "../ui";
