// Princeton Tower Defense - Performance Optimization Module
// Handles browser-specific optimizations, especially for Firefox

// ============================================================================
// BROWSER DETECTION
// ============================================================================

let isFirefoxBrowser: boolean | null = null;

export function isFirefox(): boolean {
  if (isFirefoxBrowser === null) {
    isFirefoxBrowser =
      typeof navigator !== "undefined" && /Firefox/i.test(navigator.userAgent);
  }
  return isFirefoxBrowser;
}

// ============================================================================
// PERFORMANCE SETTINGS
// ============================================================================

export interface PerformanceSettings {
  disableShadows: boolean;
  shadowQualityMultiplier: number;
  reducedParticles: boolean;
  simplifiedGradients: boolean;
  skipEnvironmentEffects: boolean;
  reducedFogQuality: boolean;
  showGodRays: boolean;
  showAurora: boolean;
  showScreenGlow: boolean;
  antiAliasing: boolean;
  showHealthBars: boolean;
  showPathDecorations: boolean;
  showLandmarks: boolean;
  showWaterEffects: boolean;
  deathAnimations: boolean;
  projectileTrails: boolean;
  towerAnimations: boolean;
  idleAnimations: boolean;
}

// Default settings based on browser
const firefoxDefaults: PerformanceSettings = {
  disableShadows: true,
  shadowQualityMultiplier: 0,
  reducedParticles: true,
  simplifiedGradients: true,
  skipEnvironmentEffects: false,
  reducedFogQuality: true,
  showGodRays: true,
  showAurora: true,
  showScreenGlow: true,
  antiAliasing: true,
  showHealthBars: true,
  showPathDecorations: true,
  showLandmarks: true,
  showWaterEffects: true,
  deathAnimations: true,
  projectileTrails: true,
  towerAnimations: true,
  idleAnimations: true,
};

const defaultSettings: PerformanceSettings = {
  disableShadows: false,
  shadowQualityMultiplier: 1,
  reducedParticles: false,
  simplifiedGradients: false,
  skipEnvironmentEffects: false,
  reducedFogQuality: false,
  showGodRays: true,
  showAurora: true,
  showScreenGlow: true,
  antiAliasing: true,
  showHealthBars: true,
  showPathDecorations: true,
  showLandmarks: true,
  showWaterEffects: true,
  deathAnimations: true,
  projectileTrails: true,
  towerAnimations: true,
  idleAnimations: true,
};

let currentSettings: PerformanceSettings | null = null;

export function getPerformanceSettings(): PerformanceSettings {
  if (currentSettings === null) {
    currentSettings = isFirefox()
      ? { ...firefoxDefaults }
      : { ...defaultSettings };
  }
  return currentSettings;
}

export function setPerformanceSettings(
  settings: Partial<PerformanceSettings>,
): void {
  currentSettings = { ...getPerformanceSettings(), ...settings };
}

// ============================================================================
// SHADOW HELPER - Conditionally applies shadows
// ============================================================================

/**
 * Safely set shadowBlur with quality-aware scaling.
 * - Completely skipped when shadows are disabled (Firefox).
 * - Blur radius is multiplied by shadowQualityMultiplier so lower quality
 *   levels get cheaper (smaller radius) shadows without losing the visual.
 */
let cachedShadowsDisabled = false;
let cachedShadowQualityMul = 1;

/**
 * Refresh cached shadow flags once per frame so the property-descriptor
 * fast path avoids per-write function calls.
 */
export function refreshShadowCache(): void {
  const settings = getPerformanceSettings();
  cachedShadowsDisabled =
    settings.disableShadows || currentScenePressure.forceShadowsOff;
  cachedShadowQualityMul = settings.shadowQualityMultiplier;
}

export function setShadowBlur(
  ctx: CanvasRenderingContext2D,
  blur: number,
  color?: string,
): void {
  if (cachedShadowsDisabled) {
    ctx.shadowBlur = 0;
    return;
  }
  ctx.shadowBlur = blur * cachedShadowQualityMul;
  if (color) {
    ctx.shadowColor = color;
  }
}

/**
 * Clear shadow settings
 */
export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowBlur = 0;
}

/**
 * Return the effective shadow blur after quality scaling, or 0 when shadows
 * are disabled.  Used by the particle glow-sprite system so it can size the
 * pre-rendered glow without reaching into private state.
 */
export function getEffectiveShadowBlur(baseBlur: number): number {
  if (cachedShadowsDisabled) return 0;
  return baseBlur * cachedShadowQualityMul;
}

// ============================================================================
// SHADOW INTERCEPTION — quality-aware override for ALL shadowBlur writes
// ============================================================================

const SHADOW_PATCHED = Symbol("shadowPatched");

/**
 * Intercept all `ctx.shadowBlur = N` writes so that quality scaling and
 * scene-pressure shadow disabling apply universally — even in code that
 * doesn't call `setShadowBlur`. Call once per context (idempotent).
 */
export function interceptShadows(ctx: CanvasRenderingContext2D): void {
  const record = ctx as unknown as Record<symbol, boolean>;
  if (record[SHADOW_PATCHED]) return;
  record[SHADOW_PATCHED] = true;

  let rawBlur = 0;
  Object.defineProperty(ctx, "shadowBlur", {
    get() {
      return rawBlur;
    },
    set(value: number) {
      if (value === 0 || cachedShadowsDisabled) {
        rawBlur = 0;
        return;
      }
      rawBlur = value * cachedShadowQualityMul;
    },
    configurable: true,
    enumerable: true,
  });
}

// ============================================================================
// GRADIENT CACHING
// ============================================================================

interface CachedGradient {
  gradient: CanvasGradient;
  key: string;
  timestamp: number;
}

const gradientCache = new Map<string, CachedGradient>();
const GRADIENT_CACHE_MAX_SIZE = 512;
const GRADIENT_CACHE_TTL = 5000; // 5 seconds

/**
 * Create or retrieve a cached radial gradient
 * Use for gradients that don't change frequently
 */
export function getCachedRadialGradient(
  ctx: CanvasRenderingContext2D,
  key: string,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  colorStops: Array<[number, string]>,
): CanvasGradient {
  const settings = getPerformanceSettings();

  const simplify =
    (settings.simplifiedGradients ||
      currentScenePressure.forceSimplifiedGradients) &&
    colorStops.length > 3;
  const stops = simplify
    ? [colorStops[0], colorStops[colorStops.length - 1]]
    : colorStops;

  const cached = gradientCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < GRADIENT_CACHE_TTL) {
    return cached.gradient;
  }

  const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }

  if (gradientCache.size >= GRADIENT_CACHE_MAX_SIZE) {
    const oldestKey = gradientCache.keys().next().value;
    if (oldestKey) gradientCache.delete(oldestKey);
  }

  gradientCache.set(key, { gradient, key, timestamp: now });
  return gradient;
}

/**
 * Create or retrieve a cached linear gradient
 */
export function getCachedLinearGradient(
  ctx: CanvasRenderingContext2D,
  key: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colorStops: Array<[number, string]>,
): CanvasGradient {
  const settings = getPerformanceSettings();

  const simplify =
    (settings.simplifiedGradients ||
      currentScenePressure.forceSimplifiedGradients) &&
    colorStops.length > 3;
  const stops = simplify
    ? [colorStops[0], colorStops[colorStops.length - 1]]
    : colorStops;

  const cached = gradientCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < GRADIENT_CACHE_TTL) {
    return cached.gradient;
  }

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }

  if (gradientCache.size >= GRADIENT_CACHE_MAX_SIZE) {
    const oldestKey = gradientCache.keys().next().value;
    if (oldestKey) gradientCache.delete(oldestKey);
  }

  gradientCache.set(key, { gradient, key, timestamp: now });
  return gradient;
}

/**
 * Clear gradient cache (call on canvas resize or major state change)
 */
export function clearGradientCache(): void {
  gradientCache.clear();
}

// ============================================================================
// PARTICLE THROTTLING
// ============================================================================

/**
 * Should spawn a particle? Returns false more often on Firefox
 */
export function shouldSpawnParticle(baseChance: number): boolean {
  if (currentScenePressure.skipNonEssentialParticles) return false;
  const settings = getPerformanceSettings();
  const pressureReduction = currentScenePressure.skipDecorativeEffects
    ? 0.6
    : 1;
  const adjustedChance =
    (settings.reducedParticles ? baseChance * 0.5 : baseChance) *
    pressureReduction;
  return Math.random() < adjustedChance;
}

/**
 * Get adjusted particle count for Firefox
 */
export function getAdjustedParticleCount(baseCount: number): number {
  if (currentScenePressure.skipNonEssentialParticles)
    return Math.ceil(baseCount * 0.2);
  const settings = getPerformanceSettings();
  const pressureReduction = currentScenePressure.skipDecorativeEffects
    ? 0.6
    : 1;
  return Math.ceil(
    (settings.reducedParticles ? baseCount * 0.5 : baseCount) *
      pressureReduction,
  );
}

// ============================================================================
// ENVIRONMENT EFFECT HELPERS
// ============================================================================

/**
 * Should render environment effects?
 */
export function shouldRenderEnvironment(): boolean {
  return !getPerformanceSettings().skipEnvironmentEffects;
}

/**
 * Should render fog effects?
 */
export function shouldRenderFog(): boolean {
  const settings = getPerformanceSettings();
  return !settings.skipEnvironmentEffects;
}

/**
 * Get fog quality multiplier (fewer layers on Firefox)
 */
export function getFogQualityMultiplier(): number {
  return getPerformanceSettings().reducedFogQuality ? 0.5 : 1;
}

// ============================================================================
// SCENE PRESSURE / ENTITY-COUNT LOD
// ============================================================================

export interface ScenePressure {
  /** Total renderable count this frame */
  total: number;
  /** Skip decorative-only effects (glows, ambient particles, passive animations) */
  skipDecorativeEffects: boolean;
  /** Use simplified gradients (2-stop max) regardless of settings */
  forceSimplifiedGradients: boolean;
  /** Disable all shadows regardless of quality level */
  forceShadowsOff: boolean;
  /** Skip non-essential particles entirely */
  skipNonEssentialParticles: boolean;
  /** Simplify enemy rendering to basic shapes */
  simplifyEnemies: boolean;
}

let currentScenePressure: ScenePressure = {
  total: 0,
  skipDecorativeEffects: false,
  forceSimplifiedGradients: false,
  forceShadowsOff: false,
  skipNonEssentialParticles: false,
  simplifyEnemies: false,
};

const PRESSURE_SKIP_DECORATIVE = 120;
const PRESSURE_SKIP_PARTICLES = 180;
const PRESSURE_SIMPLIFY_GRADIENTS = 200;
const PRESSURE_SHADOWS_OFF = 250;
const PRESSURE_SIMPLIFY_ENEMIES = 300;

export function updateScenePressure(renderableCount: number): ScenePressure {
  currentScenePressure = {
    total: renderableCount,
    skipDecorativeEffects: renderableCount > PRESSURE_SKIP_DECORATIVE,
    forceSimplifiedGradients: renderableCount > PRESSURE_SIMPLIFY_GRADIENTS,
    forceShadowsOff: renderableCount > PRESSURE_SHADOWS_OFF,
    skipNonEssentialParticles: renderableCount > PRESSURE_SKIP_PARTICLES,
    simplifyEnemies: renderableCount > PRESSURE_SIMPLIFY_ENEMIES,
  };
  return currentScenePressure;
}

export function getScenePressure(): ScenePressure {
  return currentScenePressure;
}

// ============================================================================
// DEBUG INFO
// ============================================================================

export function getPerformanceDebugInfo(): string {
  const settings = getPerformanceSettings();
  const pressure = currentScenePressure;
  return `Firefox: ${isFirefox()}, Shadows: ${!settings.disableShadows}, Particles: ${settings.reducedParticles ? "reduced" : "full"}, Gradients cached: ${gradientCache.size}, ScenePressure: ${pressure.total}`;
}
