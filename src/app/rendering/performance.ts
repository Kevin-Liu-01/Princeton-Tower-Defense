// Princeton Tower Defense - Performance Optimization Module
// Handles browser-specific optimizations, especially for Firefox

// ============================================================================
// BROWSER DETECTION
// ============================================================================

let isFirefoxBrowser: boolean | null = null;

export function isFirefox(): boolean {
  if (isFirefoxBrowser === null) {
    isFirefoxBrowser = typeof navigator !== 'undefined' && 
      /Firefox/i.test(navigator.userAgent);
  }
  return isFirefoxBrowser;
}

// ============================================================================
// PERFORMANCE SETTINGS
// ============================================================================

export interface PerformanceSettings {
  // Disable expensive shadow effects (huge Firefox improvement)
  disableShadows: boolean;
  // Reduce particle counts
  reducedParticles: boolean;
  // Simplify gradients (fewer color stops)
  simplifiedGradients: boolean;
  // Skip environmental effects entirely
  skipEnvironmentEffects: boolean;
  // Reduce fog quality
  reducedFogQuality: boolean;
}

// Default settings based on browser
const firefoxDefaults: PerformanceSettings = {
  disableShadows: true,
  reducedParticles: true,
  simplifiedGradients: true,
  skipEnvironmentEffects: false,
  reducedFogQuality: true,
};

const defaultSettings: PerformanceSettings = {
  disableShadows: false,
  reducedParticles: false,
  simplifiedGradients: false,
  skipEnvironmentEffects: false,
  reducedFogQuality: false,
};

let currentSettings: PerformanceSettings | null = null;

export function getPerformanceSettings(): PerformanceSettings {
  if (currentSettings === null) {
    currentSettings = isFirefox() ? { ...firefoxDefaults } : { ...defaultSettings };
  }
  return currentSettings;
}

export function setPerformanceSettings(settings: Partial<PerformanceSettings>): void {
  currentSettings = { ...getPerformanceSettings(), ...settings };
}

// ============================================================================
// SHADOW HELPER - Conditionally applies shadows
// ============================================================================

/**
 * Safely set shadowBlur - skipped on Firefox for massive performance gains
 * Firefox's canvas shadowBlur implementation is 10-30x slower than Chrome's
 */
export function setShadowBlur(ctx: CanvasRenderingContext2D, blur: number, color?: string): void {
  if (getPerformanceSettings().disableShadows) {
    ctx.shadowBlur = 0;
    return;
  }
  ctx.shadowBlur = blur;
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

// ============================================================================
// GRADIENT CACHING
// ============================================================================

interface CachedGradient {
  gradient: CanvasGradient;
  key: string;
  timestamp: number;
}

const gradientCache = new Map<string, CachedGradient>();
const GRADIENT_CACHE_MAX_SIZE = 100;
const GRADIENT_CACHE_TTL = 5000; // 5 seconds

/**
 * Create or retrieve a cached radial gradient
 * Use for gradients that don't change frequently
 */
export function getCachedRadialGradient(
  ctx: CanvasRenderingContext2D,
  key: string,
  x0: number, y0: number, r0: number,
  x1: number, y1: number, r1: number,
  colorStops: Array<[number, string]>
): CanvasGradient {
  const settings = getPerformanceSettings();
  
  // For simplified gradients, reduce color stops
  const stops = settings.simplifiedGradients && colorStops.length > 3
    ? [colorStops[0], colorStops[colorStops.length - 1]]
    : colorStops;
  
  const cached = gradientCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < GRADIENT_CACHE_TTL) {
    return cached.gradient;
  }
  
  const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }
  
  // Cache management
  if (gradientCache.size >= GRADIENT_CACHE_MAX_SIZE) {
    // Remove oldest entries
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
  x0: number, y0: number,
  x1: number, y1: number,
  colorStops: Array<[number, string]>
): CanvasGradient {
  const settings = getPerformanceSettings();
  
  const stops = settings.simplifiedGradients && colorStops.length > 3
    ? [colorStops[0], colorStops[colorStops.length - 1]]
    : colorStops;
  
  const cached = gradientCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < GRADIENT_CACHE_TTL) {
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
  const settings = getPerformanceSettings();
  const adjustedChance = settings.reducedParticles ? baseChance * 0.5 : baseChance;
  return Math.random() < adjustedChance;
}

/**
 * Get adjusted particle count for Firefox
 */
export function getAdjustedParticleCount(baseCount: number): number {
  const settings = getPerformanceSettings();
  return settings.reducedParticles ? Math.ceil(baseCount * 0.5) : baseCount;
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
// DEBUG INFO
// ============================================================================

export function getPerformanceDebugInfo(): string {
  const settings = getPerformanceSettings();
  return `Firefox: ${isFirefox()}, Shadows: ${!settings.disableShadows}, Particles: ${settings.reducedParticles ? 'reduced' : 'full'}, Gradients cached: ${gradientCache.size}`;
}
