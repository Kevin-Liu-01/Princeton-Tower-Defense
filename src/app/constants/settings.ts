// =============================================================================
// GAME SETTINGS - Types, Defaults, and Presets
// =============================================================================

// -----------------------------------------------------------------------------
// Enums / Union Types
// -----------------------------------------------------------------------------

export type QualityPreset = "ultra" | "high" | "medium" | "low" | "potato";
export type ShadowQuality = "off" | "low" | "medium" | "high";
export type ParticleDensity = "off" | "reduced" | "full" | "extra";
export type FogQuality = "off" | "reduced" | "full";
export type GradientQuality = "simplified" | "full";
export type EnvironmentEffects = "off" | "reduced" | "full";
export type DecorationDensity = "minimal" | "sparse" | "normal" | "dense" | "lush";
export type BattleDebrisDensity = "none" | "low" | "medium" | "high";
export type DecorationScale = "small" | "normal" | "large" | "mixed";
export type AnimationIntensity = "off" | "reduced" | "normal" | "enhanced";
export type CameraEdgePan = "off" | "slow" | "normal" | "fast";
export type DamageNumberStyle = "off" | "simple" | "animated";
export type ColorblindMode = "off" | "protanopia" | "deuteranopia" | "tritanopia";
export type UIScale = "compact" | "normal" | "large";

// -----------------------------------------------------------------------------
// Settings Shape
// -----------------------------------------------------------------------------

export interface GraphicsSettings {
  shadowQuality: ShadowQuality;
  particleDensity: ParticleDensity;
  fogQuality: FogQuality;
  gradientQuality: GradientQuality;
  environmentEffects: EnvironmentEffects;
  antiAliasing: boolean;
  showGodRays: boolean;
  showAurora: boolean;
  showScreenGlow: boolean;
}

export interface LandscapingSettings {
  decorationDensity: DecorationDensity;
  treeClusterDensity: DecorationDensity;
  villageDensity: DecorationDensity;
  battleDebrisDensity: BattleDebrisDensity;
  decorationScale: DecorationScale;
  showPathDecorations: boolean;
  showLandmarks: boolean;
  showWaterEffects: boolean;
}

export interface AnimationSettings {
  animationIntensity: AnimationIntensity;
  screenShakeIntensity: number;
  deathAnimations: boolean;
  projectileTrails: boolean;
  towerAnimations: boolean;
  idleAnimations: boolean;
}

export interface CameraSettings {
  defaultZoom: number;
  zoomSensitivity: number;
  edgePanSpeed: CameraEdgePan;
  smoothCamera: boolean;
  zoomToCursor: boolean;
}

export interface UISettings {
  showFpsCounter: boolean;
  showPerformanceOverlay: boolean;
  damageNumbers: DamageNumberStyle;
  uiScale: UIScale;
  showHealthBars: boolean;
  showRangeIndicators: boolean;
  showTowerRadii: boolean;
  showWavePreview: boolean;
  tooltipDelay: number;
  autoSendWaves: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  ambientVolume: number;
  muteWhenUnfocused: boolean;
}

export interface AccessibilitySettings {
  colorblindMode: ColorblindMode;
  reducedMotion: boolean;
  highContrastUI: boolean;
  largeText: boolean;
  screenReaderHints: boolean;
}

export interface GameSettings {
  graphics: GraphicsSettings;
  landscaping: LandscapingSettings;
  animation: AnimationSettings;
  camera: CameraSettings;
  ui: UISettings;
  audio: AudioSettings;
  accessibility: AccessibilitySettings;
}

// -----------------------------------------------------------------------------
// Default Settings
// -----------------------------------------------------------------------------

export const DEFAULT_GRAPHICS: GraphicsSettings = {
  shadowQuality: "high",
  particleDensity: "full",
  fogQuality: "full",
  gradientQuality: "full",
  environmentEffects: "full",
  antiAliasing: true,
  showGodRays: true,
  showAurora: true,
  showScreenGlow: true,
};

export const DEFAULT_LANDSCAPING: LandscapingSettings = {
  decorationDensity: "normal",
  treeClusterDensity: "normal",
  villageDensity: "normal",
  battleDebrisDensity: "medium",
  decorationScale: "normal",
  showPathDecorations: true,
  showLandmarks: true,
  showWaterEffects: true,
};

export const DEFAULT_ANIMATION: AnimationSettings = {
  animationIntensity: "normal",
  screenShakeIntensity: 1.0,
  deathAnimations: true,
  projectileTrails: true,
  towerAnimations: true,
  idleAnimations: true,
};

export const DEFAULT_CAMERA: CameraSettings = {
  defaultZoom: 1.0,
  zoomSensitivity: 1.0,
  edgePanSpeed: "normal",
  smoothCamera: true,
  zoomToCursor: true,
};

export const DEFAULT_UI: UISettings = {
  showFpsCounter: false,
  showPerformanceOverlay: false,
  damageNumbers: "animated",
  uiScale: "normal",
  showHealthBars: true,
  showRangeIndicators: true,
  showTowerRadii: true,
  showWavePreview: true,
  tooltipDelay: 400,
  autoSendWaves: false,
};

export const DEFAULT_AUDIO: AudioSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  ambientVolume: 0.4,
  muteWhenUnfocused: true,
};

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  colorblindMode: "off",
  reducedMotion: false,
  highContrastUI: false,
  largeText: false,
  screenReaderHints: false,
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  graphics: { ...DEFAULT_GRAPHICS },
  landscaping: { ...DEFAULT_LANDSCAPING },
  animation: { ...DEFAULT_ANIMATION },
  camera: { ...DEFAULT_CAMERA },
  ui: { ...DEFAULT_UI },
  audio: { ...DEFAULT_AUDIO },
  accessibility: { ...DEFAULT_ACCESSIBILITY },
};

// -----------------------------------------------------------------------------
// Quality Presets — Apply a preset and override graphics + landscaping + animation
// -----------------------------------------------------------------------------

export const QUALITY_PRESETS: Record<QualityPreset, Partial<GameSettings>> = {
  ultra: {
    graphics: {
      shadowQuality: "high",
      particleDensity: "extra",
      fogQuality: "full",
      gradientQuality: "full",
      environmentEffects: "full",
      antiAliasing: true,
      showGodRays: true,
      showAurora: true,
      showScreenGlow: true,
    },
    landscaping: {
      decorationDensity: "lush",
      treeClusterDensity: "lush",
      villageDensity: "lush",
      battleDebrisDensity: "high",
      decorationScale: "large",
      showPathDecorations: true,
      showLandmarks: true,
      showWaterEffects: true,
    },
    animation: {
      animationIntensity: "enhanced",
      screenShakeIntensity: 1.2,
      deathAnimations: true,
      projectileTrails: true,
      towerAnimations: true,
      idleAnimations: true,
    },
  },
  high: {
    graphics: { ...DEFAULT_GRAPHICS },
    landscaping: { ...DEFAULT_LANDSCAPING },
    animation: { ...DEFAULT_ANIMATION },
  },
  medium: {
    graphics: {
      shadowQuality: "medium",
      particleDensity: "full",
      fogQuality: "reduced",
      gradientQuality: "full",
      environmentEffects: "reduced",
      antiAliasing: true,
      showGodRays: true,
      showAurora: false,
      showScreenGlow: true,
    },
    landscaping: {
      decorationDensity: "normal",
      treeClusterDensity: "sparse",
      villageDensity: "sparse",
      battleDebrisDensity: "low",
      decorationScale: "normal",
      showPathDecorations: true,
      showLandmarks: true,
      showWaterEffects: true,
    },
    animation: {
      animationIntensity: "normal",
      screenShakeIntensity: 0.8,
      deathAnimations: true,
      projectileTrails: true,
      towerAnimations: true,
      idleAnimations: false,
    },
  },
  low: {
    graphics: {
      shadowQuality: "low",
      particleDensity: "reduced",
      fogQuality: "off",
      gradientQuality: "simplified",
      environmentEffects: "off",
      antiAliasing: false,
      showGodRays: false,
      showAurora: false,
      showScreenGlow: false,
    },
    landscaping: {
      decorationDensity: "sparse",
      treeClusterDensity: "sparse",
      villageDensity: "minimal",
      battleDebrisDensity: "none",
      decorationScale: "small",
      showPathDecorations: true,
      showLandmarks: true,
      showWaterEffects: false,
    },
    animation: {
      animationIntensity: "reduced",
      screenShakeIntensity: 0.5,
      deathAnimations: true,
      projectileTrails: false,
      towerAnimations: true,
      idleAnimations: false,
    },
  },
  potato: {
    graphics: {
      shadowQuality: "off",
      particleDensity: "off",
      fogQuality: "off",
      gradientQuality: "simplified",
      environmentEffects: "off",
      antiAliasing: false,
      showGodRays: false,
      showAurora: false,
      showScreenGlow: false,
    },
    landscaping: {
      decorationDensity: "minimal",
      treeClusterDensity: "minimal",
      villageDensity: "minimal",
      battleDebrisDensity: "none",
      decorationScale: "small",
      showPathDecorations: false,
      showLandmarks: true,
      showWaterEffects: false,
    },
    animation: {
      animationIntensity: "off",
      screenShakeIntensity: 0,
      deathAnimations: false,
      projectileTrails: false,
      towerAnimations: false,
      idleAnimations: false,
    },
  },
};

// -----------------------------------------------------------------------------
// Multiplier Lookup Tables — Map enum values to numeric multipliers
// Used by rendering code to scale loop counts, radii, etc.
// -----------------------------------------------------------------------------

export const DECORATION_DENSITY_MULTIPLIER: Record<DecorationDensity, number> = {
  minimal: 0.2,
  sparse: 0.5,
  normal: 1.0,
  dense: 1.5,
  lush: 2.0,
};

export const TREE_CLUSTER_COUNT: Record<DecorationDensity, number> = {
  minimal: 8,
  sparse: 20,
  normal: 40,
  dense: 60,
  lush: 80,
};

export const GROVE_COUNT: Record<DecorationDensity, number> = {
  minimal: 2,
  sparse: 6,
  normal: 12,
  dense: 18,
  lush: 24,
};

export const VILLAGE_COUNT: Record<DecorationDensity, number> = {
  minimal: 2,
  sparse: 6,
  normal: 12,
  dense: 16,
  lush: 20,
};

export const BATTLE_DEBRIS_COUNT: Record<BattleDebrisDensity, number> = {
  none: 0,
  low: 100,
  medium: 280,
  high: 450,
};

export const PARTICLE_DENSITY_MULTIPLIER: Record<ParticleDensity, number> = {
  off: 0,
  reduced: 0.5,
  full: 1.0,
  extra: 1.5,
};

export const SHADOW_QUALITY_MULTIPLIER: Record<ShadowQuality, number> = {
  off: 0,
  low: 0.35,
  medium: 0.6,
  high: 1.0,
};

export const FOG_QUALITY_MULTIPLIER: Record<FogQuality, number> = {
  off: 0,
  reduced: 0.5,
  full: 1.0,
};

export const DECORATION_SCALE_RANGE: Record<DecorationScale, { base: number; variance: number }> = {
  small: { base: 0.5, variance: 0.3 },
  normal: { base: 0.7, variance: 0.5 },
  large: { base: 0.9, variance: 0.6 },
  mixed: { base: 0.6, variance: 0.8 },
};

export const EDGE_PAN_SPEED: Record<CameraEdgePan, number> = {
  off: 0,
  slow: 0.5,
  normal: 1.0,
  fast: 2.0,
};

export const TOOLTIP_DELAY_OPTIONS = [0, 200, 400, 600, 1000] as const;

// -----------------------------------------------------------------------------
// Settings Categories Metadata — for the settings UI
// -----------------------------------------------------------------------------

export type SettingsCategory =
  | "graphics"
  | "landscaping"
  | "animation"
  | "camera"
  | "ui"
  | "audio"
  | "accessibility";

export interface SettingsCategoryMeta {
  id: SettingsCategory;
  label: string;
  icon: string;
  description: string;
}

export const SETTINGS_CATEGORIES: SettingsCategoryMeta[] = [
  { id: "graphics", label: "Graphics", icon: "monitor", description: "Shadows, particles, fog, and visual effects" },
  { id: "landscaping", label: "Landscaping", icon: "trees", description: "Decoration density, trees, villages, and terrain" },
  { id: "animation", label: "Animation", icon: "sparkles", description: "Animation quality, screen shake, and visual flair" },
  { id: "camera", label: "Camera", icon: "move", description: "Zoom, panning, and camera behavior" },
  { id: "ui", label: "Interface", icon: "layout", description: "HUD elements, damage numbers, and overlays" },
  { id: "audio", label: "Audio", icon: "volume", description: "Volume controls for music, SFX, and ambience" },
  { id: "accessibility", label: "Accessibility", icon: "eye", description: "Colorblind support, motion, and readability" },
];

// -----------------------------------------------------------------------------
// Persistent Storage Key
// -----------------------------------------------------------------------------

export const SETTINGS_STORAGE_KEY = "princeton-td-settings";
