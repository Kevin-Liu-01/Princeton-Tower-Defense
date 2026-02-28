// Princeton Tower Defense - Enhanced Environmental Effects
// Creates living, breathing map atmospheres for each region

import { colorWithAlpha } from "../helpers";
import { 
  setShadowBlur, 
  clearShadow, 
  shouldRenderEnvironment
} from "../performance";

// ============================================================================
// ENVIRONMENTAL PARTICLE SYSTEMS
// ============================================================================

export interface EnvironmentParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  type: string;
}

// Persistent particle pools for each effect type
const particlePools: Map<string, EnvironmentParticle[]> = new Map();

function getParticlePool(poolId: string, maxSize: number): EnvironmentParticle[] {
  if (!particlePools.has(poolId)) {
    particlePools.set(poolId, []);
  }
  const pool = particlePools.get(poolId)!;
  // Prune dead particles
  while (pool.length > maxSize) {
    pool.shift();
  }
  return pool;
}

// ============================================================================
// BLACK VIGNETTE - Dark edge effect for all environments
// ============================================================================

function renderBlackVignette(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  intensity: number = 0.6
): void {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
  
  // Inner radius - clear center area
  const innerRadius = Math.min(canvasWidth, canvasHeight) * 0.25;
  // Outer radius - where black reaches full intensity
  const outerRadius = diagonal * 0.58;
  
  const blackVignette = ctx.createRadialGradient(
    centerX, centerY, innerRadius,
    centerX, centerY, outerRadius
  );
  
  blackVignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  blackVignette.addColorStop(0.3, `rgba(0, 0, 0, ${intensity * 0.15})`);
  blackVignette.addColorStop(0.55, `rgba(0, 0, 0, ${intensity * 0.35})`);
  blackVignette.addColorStop(0.75, `rgba(0, 0, 0, ${intensity * 0.6})`);
  blackVignette.addColorStop(0.9, `rgba(0, 0, 0, ${intensity * 0.85})`);
  blackVignette.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
  
  ctx.fillStyle = blackVignette;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// ============================================================================
// EDGE FOG HELPER - Used by all environments (circular vignette style)
// ============================================================================

function renderEdgeFog(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  r: number,
  g: number,
  b: number,
  baseAlpha: number = 0.5
): void {
  const pulse = 1 + Math.sin(time * 0.5) * 0.06;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Calculate the diagonal for full coverage
  const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
  
  // Inner radius where fog starts (very small = heavy fog coverage)
  const innerRadius = Math.min(canvasWidth, canvasHeight) * 0.12 * pulse;
  // Outer radius where fog is at full strength
  const outerRadius = diagonal * 0.55;
  
  // Create strong circular vignette gradient
  const vignetteGrad = ctx.createRadialGradient(
    centerX, centerY, innerRadius,
    centerX, centerY, outerRadius
  );
  
  vignetteGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
  vignetteGrad.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.2})`);
  vignetteGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.5})`);
  vignetteGrad.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.8})`);
  vignetteGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${baseAlpha})`);
  
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// Helper to spawn particles from random edges
function spawnFromRandomEdge(
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; vx: number; vy: number; edge: "top" | "bottom" | "left" | "right" } {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: // Top
      return {
        x: Math.random() * canvasWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 30,
        vy: 20 + Math.random() * 30,
        edge: "top",
      };
    case 1: // Bottom
      return {
        x: Math.random() * canvasWidth,
        y: canvasHeight + 10,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 30,
        edge: "bottom",
      };
    case 2: // Left
      return {
        x: -10,
        y: Math.random() * canvasHeight,
        vx: 20 + Math.random() * 30,
        vy: (Math.random() - 0.5) * 30,
        edge: "left",
      };
    case 3: // Right
    default:
      return {
        x: canvasWidth + 10,
        y: Math.random() * canvasHeight,
        vx: -20 - Math.random() * 30,
        vy: (Math.random() - 0.5) * 30,
        edge: "right",
      };
  }
}

// ============================================================================
// GRASSLAND EFFECTS - Gentle wind, floating pollen, butterflies
// ============================================================================

export function renderGrasslandEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const pool = getParticlePool("grassland", 150);
  
  // Spawn pollen/seeds from all edges - more transparent
  if (Math.random() > 0.88) {
    // Spread spawns across the entire screen width/height
    const spawnY = Math.random() * canvasHeight;
    const spawnX = Math.random() > 0.5 ? -10 : canvasWidth + 10;
    const windDirection = spawnX < 0 ? 1 : -1;
    
    pool.push({
      x: spawnX,
      y: spawnY,
      vx: windDirection * (35 + Math.random() * 45),
      vy: (Math.random() - 0.5) * 25,
      size: 2 + Math.random() * 3,
      alpha: 0.08 + Math.random() * 0.12,
      life: 1,
      maxLife: 1,
      color: Math.random() > 0.5 ? "#ffffff" : "#ffffcc",
      type: "pollen",
    });
  }

  // Occasional butterfly - more transparent
  if (Math.random() > 0.995) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 1.2,
      vy: spawn.vy * 0.5,
      size: 8 + Math.random() * 4,
      alpha: 0.5,
      life: 1,
      maxLife: 1,
      color: ["#ff88cc", "#88ccff", "#ffcc44", "#ff8844"][Math.floor(Math.random() * 4)],
      type: "butterfly",
    });
  }

  // Update and render
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;
    
    if (p.type === "pollen") {
      // Wind swaying effect spread across screen
      p.x += Math.sin(time * 2.5 + i * 0.3 + p.y * 0.01) * 0.8;
      p.y += Math.sin(time * 1.5 + i * 0.5) * 0.4;
    } else if (p.type === "butterfly") {
      // Flutter pattern
      p.y += Math.sin(time * 8 + i * 3) * 2;
      p.x += Math.sin(time * 3 + i) * 0.3;
    }

    // Remove off-screen
    if (p.y < -30 || p.y > canvasHeight + 30 || p.x > canvasWidth + 30 || p.x < -30) {
      pool.splice(i, 1);
      continue;
    }

    // Render
    ctx.save();
    if (p.type === "butterfly") {
      const wingFlap = Math.sin(time * 15 + i * 5);
      ctx.translate(p.x, p.y);
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.7);
      // Wings
      ctx.beginPath();
      ctx.ellipse(-p.size * 0.5, 0, p.size * 0.4, p.size * (0.3 + wingFlap * 0.2), -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.size * 0.5, 0, p.size * 0.4, p.size * (0.3 + wingFlap * 0.2), 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = "rgba(51, 51, 51, 0.5)";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.1, p.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.3);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Colored edge fog vignette
  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 50, 70, 40, 0.65);
  
  // Black vignette for clear edge darkening
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.55);
}

// ============================================================================
// DESERT EFFECTS - Heat shimmer, sand particles, distant mirages
// ============================================================================

export function renderDesertEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const pool = getParticlePool("desert", 200);

  // Sand particles blown by wind - spread evenly across entire screen
  if (Math.random() > 0.82) {
    // Spawn from left edge at any height for full screen coverage
    const spawnY = Math.random() * canvasHeight;
    
    pool.push({
      x: -10,
      y: spawnY,
      vx: 50 + Math.random() * 70,
      vy: (Math.random() - 0.5) * 35,
      size: 1 + Math.random() * 2.5,
      alpha: 0.45 + Math.random() * 0.3,
      life: 1,
      maxLife: 1,
      color: Math.random() > 0.3 ? "#d4a574" : "#c4956a",
      type: "sand",
    });
  }
  
  // Additional sand from top and bottom for vertical spread
  if (Math.random() > 0.92) {
    const fromTop = Math.random() > 0.5;
    pool.push({
      x: Math.random() * canvasWidth,
      y: fromTop ? -10 : canvasHeight + 10,
      vx: 30 + Math.random() * 40,
      vy: fromTop ? (20 + Math.random() * 30) : (-20 - Math.random() * 30),
      size: 1 + Math.random() * 2,
      alpha: 0.35 + Math.random() * 0.25,
      life: 1,
      maxLife: 1,
      color: "#d4a574",
      type: "sand",
    });
  }

  // Dust devils (rare but more visible)
  if (Math.random() > 0.996) {
    const devilX = Math.random() * canvasWidth;
    const devilY = canvasHeight * 0.5 + Math.random() * canvasHeight * 0.5;
    for (let j = 0; j < 25; j++) {
      pool.push({
        x: devilX + (Math.random() - 0.5) * 40,
        y: devilY - j * 4,
        vx: (Math.random() - 0.5) * 50,
        vy: -40 - Math.random() * 60,
        size: 2 + Math.random() * 5,
        alpha: 0.5,
        life: 1,
        maxLife: 1,
        color: "#c4a080",
        type: "dustdevil",
      });
    }
  }

  // Update and render particles
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;
    p.alpha *= 0.996;

    if (p.type === "dustdevil") {
      p.x += Math.sin(time * 10 + i * 0.5) * 4;
      p.vy -= 0.6;
    } else {
      // Wind turbulence for sand
      p.y += Math.sin(time * 3 + i * 0.3 + p.x * 0.01) * 0.5;
    }

    if (p.x > canvasWidth + 20 || p.x < -20 || p.y < -20 || p.y > canvasHeight + 20 || p.alpha < 0.05) {
      pool.splice(i, 1);
      continue;
    }

    ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Heat shimmer effect - more pronounced
  const shimmerGrad = ctx.createLinearGradient(0, canvasHeight * 0.3, 0, canvasHeight);
  shimmerGrad.addColorStop(0, "rgba(255, 200, 150, 0)");
  shimmerGrad.addColorStop(0.4, `rgba(255, 220, 180, ${0.04 + Math.sin(time * 2) * 0.015})`);
  shimmerGrad.addColorStop(1, "rgba(255, 200, 150, 0)");
  ctx.fillStyle = shimmerGrad;
  ctx.fillRect(0, canvasHeight * 0.3, canvasWidth, canvasHeight * 0.7);

  // Heat wave lines - spread across full screen
  ctx.strokeStyle = "rgba(255, 220, 180, 0.06)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const waveY = canvasHeight * (0.15 + i * 0.1);
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x += 15) {
      const y = waveY + Math.sin(x * 0.015 + time * 3 + i * 1.5) * 10;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Mirage shimmer at horizon - more visible
  const mirageAlpha = 0.08 + Math.sin(time * 1.5) * 0.03;
  ctx.fillStyle = `rgba(135, 206, 250, ${mirageAlpha})`;
  ctx.beginPath();
  for (let x = 0; x < canvasWidth; x += 25) {
    const y = canvasHeight * 0.7 + Math.sin(x * 0.025 + time * 2) * 6;
    ctx.ellipse(x, y, 50, 6, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Colored edge fog vignette with sandy color
  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 120, 90, 50, 0.65);
  
  // Black vignette for clear edge darkening
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.55);
}

// ============================================================================
// WINTER EFFECTS - Falling snow, ice sparkles, cold mist
// ============================================================================

export function renderWinterEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const pool = getParticlePool("winter", 200);

  // Snowflakes with wind spread - more transparent
  if (Math.random() > 0.72) {
    pool.push({
      x: Math.random() * (canvasWidth + 150) - 75,
      y: -10,
      vx: -20 + Math.random() * 15,
      vy: 35 + Math.random() * 45,
      size: 2 + Math.random() * 4,
      alpha: 0.3 + Math.random() * 0.25,
      life: 1,
      maxLife: 1,
      color: "#ffffff",
      type: Math.random() > 0.88 ? "crystal" : "snow",
    });
  }

  // Ice sparkles from all edges - more transparent
  if (Math.random() > 0.94) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 0.7,
      vy: spawn.vy * 0.7,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.45,
      life: 1,
      maxLife: 1,
      color: "#aaddff",
      type: "sparkle",
    });
  }

  // Update and render
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "snow" || p.type === "crystal") {
      // Wind swaying spread across screen
      p.x += Math.sin(time * 2 + i * 0.3 + p.y * 0.008) * 1.0;
    } else if (p.type === "sparkle") {
      p.alpha *= 0.97;
    }

    if (p.y > canvasHeight + 10 || p.y < -20 || p.x < -30 || p.x > canvasWidth + 30 || p.alpha < 0.05) {
      pool.splice(i, 1);
      continue;
    }

    ctx.save();
    if (p.type === "crystal") {
      // Draw as 6-pointed crystal - more transparent
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha * 0.6);
      ctx.lineWidth = 1.5;
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 0.5 + i);
      for (let j = 0; j < 6; j++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -p.size);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
    } else if (p.type === "sparkle") {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.55);
      setShadowBlur(ctx, 4, p.color);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      clearShadow(ctx);
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Cold mist at bottom - more pronounced
  const mistGrad = ctx.createLinearGradient(0, canvasHeight * 0.6, 0, canvasHeight);
  mistGrad.addColorStop(0, "rgba(200, 220, 255, 0)");
  mistGrad.addColorStop(0.5, `rgba(200, 220, 255, ${0.1 + Math.sin(time * 0.8) * 0.03})`);
  mistGrad.addColorStop(1, "rgba(180, 200, 240, 0.15)");
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, canvasHeight * 0.5, canvasWidth, canvasHeight * 0.5);

  // Breath-like fog patches - more visible
  for (let i = 0; i < 6; i++) {
    const fogX = (canvasWidth * 0.18 * i + time * 12 + Math.sin(time + i) * 60) % (canvasWidth + 250) - 125;
    const fogY = canvasHeight * (0.7 + Math.sin(time * 0.5 + i) * 0.08);
    const fogSize = 90 + Math.sin(time * 2 + i) * 25;

    const fogGrad = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, fogSize);
    fogGrad.addColorStop(0, "rgba(220, 235, 255, 0.14)");
    fogGrad.addColorStop(0.5, "rgba(200, 220, 250, 0.07)");
    fogGrad.addColorStop(1, "rgba(180, 200, 240, 0)");
    ctx.fillStyle = fogGrad;
    ctx.beginPath();
    ctx.ellipse(fogX, fogY, fogSize, fogSize * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Aurora borealis effect - more pronounced
  const auroraAlpha = 0.035 + Math.sin(time * 0.3) * 0.012;
  const auroraGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight * 0.35);
  auroraGrad.addColorStop(0, `rgba(100, 255, 200, ${auroraAlpha})`);
  auroraGrad.addColorStop(0.3, `rgba(100, 200, 255, ${auroraAlpha * 0.75})`);
  auroraGrad.addColorStop(0.6, `rgba(150, 100, 255, ${auroraAlpha * 0.55})`);
  auroraGrad.addColorStop(1, "rgba(100, 150, 255, 0)");
  ctx.fillStyle = auroraGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.45);

  // Colored edge fog vignette with icy color
  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 120, 140, 180, 0.65);
  
  // Black vignette for clear edge darkening
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.55);
}

// ============================================================================
// VOLCANIC EFFECTS - Embers, ash, heat distortion, lava glow
// ============================================================================

export function renderVolcanicEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const pool = getParticlePool("volcanic", 180);

  // Rising embers - straight up, no wind
  if (Math.random() > 0.85) {
    pool.push({
      x: Math.random() * canvasWidth,
      y: canvasHeight + 10,
      vx: (Math.random() - 0.5) * 8, // Very slight drift only
      vy: -50 - Math.random() * 60,
      size: 2 + Math.random() * 4,
      alpha: 0.6 + Math.random() * 0.25,
      life: 1,
      maxLife: 1,
      color: Math.random() > 0.3 ? "#ff6600" : "#ffcc00",
      type: "ember",
    });
  }

  // Falling ash - straight down, no wind
  if (Math.random() > 0.88) {
    pool.push({
      x: Math.random() * canvasWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 5, // Very slight drift only
      vy: 18 + Math.random() * 25,
      size: 1 + Math.random() * 2,
      alpha: 0.35 + Math.random() * 0.2,
      life: 1,
      maxLife: 1,
      color: "#555",
      type: "ash",
    });
  }

  // Update and render
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "ember") {
      // Gentle flicker, no wind sway
      p.alpha *= 0.994;
      p.size *= 0.997;
    }
    // Ash falls straight down with no sway

    if (p.y < -20 || p.y > canvasHeight + 20 || p.x < -20 || p.x > canvasWidth + 20 || p.alpha < 0.05) {
      pool.splice(i, 1);
      continue;
    }

    ctx.save();
    if (p.type === "ember") {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      setShadowBlur(ctx, 8, p.color);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      clearShadow(ctx);
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Lava glow from below - more pronounced
  const lavaGlow = ctx.createLinearGradient(0, canvasHeight * 0.5, 0, canvasHeight);
  const glowIntensity = 0.15 + Math.sin(time * 3) * 0.05;
  lavaGlow.addColorStop(0, "rgba(255, 100, 0, 0)");
  lavaGlow.addColorStop(0.4, `rgba(255, 80, 0, ${glowIntensity * 0.4})`);
  lavaGlow.addColorStop(1, `rgba(255, 50, 0, ${glowIntensity})`);
  ctx.fillStyle = lavaGlow;
  ctx.fillRect(0, canvasHeight * 0.4, canvasWidth, canvasHeight * 0.6);

  // Heat distortion waves - more visible and spread across screen
  ctx.strokeStyle = "rgba(255, 150, 50, 0.055)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const waveY = canvasHeight * (0.2 + i * 0.1);
    ctx.beginPath();
    for (let x = 0; x < canvasWidth; x += 12) {
      const y = waveY + Math.sin(x * 0.012 + time * 4 + i * 2) * 14;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Smoke plumes - more visible
  for (let i = 0; i < 4; i++) {
    const smokeX = canvasWidth * (0.15 + i * 0.25);
    const smokeY = canvasHeight * 0.35 - Math.sin(time * 0.5 + i) * 35;
    const smokeGrad = ctx.createRadialGradient(smokeX, smokeY, 0, smokeX, smokeY, 120);
    smokeGrad.addColorStop(0, "rgba(80, 80, 80, 0.14)");
    smokeGrad.addColorStop(0.5, "rgba(60, 60, 60, 0.07)");
    smokeGrad.addColorStop(1, "rgba(40, 40, 40, 0)");
    ctx.fillStyle = smokeGrad;
    ctx.beginPath();
    ctx.ellipse(smokeX, smokeY, 120 + Math.sin(time + i) * 25, 70, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red-tinted atmosphere - more pronounced
  ctx.fillStyle = "rgba(255, 50, 0, 0.03)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Colored edge fog vignette with fiery color
  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 70, 20, 5, 0.7);
  
  // Black vignette for clear edge darkening
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.6);
}

// ============================================================================
// SWAMP EFFECTS - Fog layers, fireflies, bubbles, mist
// ============================================================================

export function renderSwampEnvironment(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  const pool = getParticlePool("swamp", 150);

  // Fireflies from all edges - more pronounced
  if (Math.random() > 0.93) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 0.5,
      vy: spawn.vy * 0.35,
      size: 2.5 + Math.random() * 2.5,
      alpha: 0,
      life: 1,
      maxLife: 1,
      color: "#aaffaa",
      type: "firefly",
    });
  }

  // Bubbles from all edges (favor bottom) - more visible
  if (Math.random() > 0.91) {
    const fromBottom = Math.random() > 0.4;
    if (fromBottom) {
      pool.push({
        x: Math.random() * canvasWidth,
        y: canvasHeight + 10,
        vx: (Math.random() - 0.5) * 12,
        vy: -18 - Math.random() * 25,
        size: 2.5 + Math.random() * 5,
        alpha: 0.45,
        life: 1,
        maxLife: 1,
        color: "#4a7055",
        type: "bubble",
      });
    } else {
      const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
      pool.push({
        x: spawn.x,
        y: spawn.y,
        vx: spawn.vx * 0.35,
        vy: spawn.vy * 0.55,
        size: 2 + Math.random() * 4,
        alpha: 0.35,
        life: 1,
        maxLife: 1,
        color: "#4a7055",
        type: "bubble",
      });
    }
  }

  // Spores from all edges - more visible
  if (Math.random() > 0.92) {
    const spawn = spawnFromRandomEdge(canvasWidth, canvasHeight);
    pool.push({
      x: spawn.x,
      y: spawn.y,
      vx: spawn.vx * 0.45,
      vy: spawn.vy * 0.45,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.5,
      life: 1,
      maxLife: 1,
      color: "#88cc88",
      type: "spore",
    });
  }

  // Update and render
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;

    if (p.type === "firefly") {
      // Pulsing glow - more transparent
      p.alpha = 0.2 + Math.sin(time * 5 + i * 3) * 0.3;
      // Erratic movement
      p.vx += (Math.random() - 0.5) * 6;
      p.vy += (Math.random() - 0.5) * 6;
      p.vx *= 0.94;
      p.vy *= 0.94;
    } else if (p.type === "bubble") {
      p.x += Math.sin(time * 3 + i) * 0.6;
      p.alpha *= 0.992;
    } else if (p.type === "spore") {
      p.x += Math.sin(time * 2 + i * 0.7) * 1.2;
      p.alpha *= 0.994;
    }

    if (p.y < -20 || p.y > canvasHeight + 20 || p.alpha < 0.05 || p.x < -20 || p.x > canvasWidth + 20) {
      pool.splice(i, 1);
      continue;
    }

    ctx.save();
    if (p.type === "firefly") {
      if (p.alpha > 0.15) {
        ctx.fillStyle = colorWithAlpha(p.color, p.alpha * 0.7);
        setShadowBlur(ctx, 10, p.color);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        clearShadow(ctx);
      }
    } else if (p.type === "bubble") {
      ctx.strokeStyle = colorWithAlpha(p.color, p.alpha);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      // Highlight
      ctx.fillStyle = colorWithAlpha("#ffffff", p.alpha * 0.45);
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = colorWithAlpha(p.color, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Layered fog - more pronounced
  for (let layer = 0; layer < 5; layer++) {
    const fogY = canvasHeight * (0.4 + layer * 0.12);
    const fogAlpha = 0.09 - layer * 0.015;
    const drift = Math.sin(time * 0.3 + layer) * 35;

    const fogGrad = ctx.createLinearGradient(0, fogY - 90, 0, fogY + 90);
    fogGrad.addColorStop(0, "rgba(60, 80, 60, 0)");
    fogGrad.addColorStop(0.5, `rgba(70, 100, 70, ${fogAlpha})`);
    fogGrad.addColorStop(1, "rgba(60, 80, 60, 0)");
    ctx.fillStyle = fogGrad;
    
    ctx.beginPath();
    ctx.moveTo(-50, fogY + 90);
    for (let x = 0; x <= canvasWidth + 50; x += 40) {
      const y = fogY + Math.sin(x * 0.012 + time * 0.5 + layer * 2 + drift * 0.01) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvasWidth + 50, fogY + 90);
    ctx.closePath();
    ctx.fill();
  }

  // Eerie green tint - more pronounced
  ctx.fillStyle = "rgba(50, 100, 50, 0.045)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Mysterious mist patches - more visible
  for (let i = 0; i < 7; i++) {
    const mistX = (canvasWidth * 0.14 * i + time * 6 + Math.sin(time * 0.3 + i) * 50) % (canvasWidth + 250) - 125;
    const mistY = canvasHeight * (0.5 + Math.sin(time * 0.4 + i * 0.7) * 0.12);
    const mistSize = 75 + Math.sin(time + i * 2) * 25;

    const mistGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, mistSize);
    mistGrad.addColorStop(0, "rgba(100, 150, 100, 0.18)");
    mistGrad.addColorStop(0.6, "rgba(80, 120, 80, 0.09)");
    mistGrad.addColorStop(1, "rgba(60, 100, 60, 0)");
    ctx.fillStyle = mistGrad;
    ctx.beginPath();
    ctx.ellipse(mistX, mistY, mistSize, mistSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Colored edge fog vignette with swampy color
  renderEdgeFog(ctx, canvasWidth, canvasHeight, time, 30, 50, 30, 0.7);
  
  // Black vignette for clear edge darkening
  renderBlackVignette(ctx, canvasWidth, canvasHeight, 0.6);
}

// ============================================================================
// MAIN ENVIRONMENT RENDERER
// ============================================================================

export function renderEnvironment(
  ctx: CanvasRenderingContext2D,
  theme: string,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  // Skip environment rendering if disabled for performance
  if (!shouldRenderEnvironment()) {
    return;
  }
  
  ctx.save();
  
  switch (theme) {
    case "grassland":
      renderGrasslandEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "desert":
      renderDesertEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "winter":
      renderWinterEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "volcanic":
      renderVolcanicEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    case "swamp":
      renderSwampEnvironment(ctx, canvasWidth, canvasHeight, time);
      break;
    default:
      // Default to grassland-style effects for unknown themes
      renderGrasslandEnvironment(ctx, canvasWidth, canvasHeight, time);
  }
  
  ctx.restore();
}

// ============================================================================
// AMBIENT SOUND VISUALIZATION (Visual representation of atmosphere)
// ============================================================================

export function renderAmbientVisuals(
  ctx: CanvasRenderingContext2D,
  theme: string,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): void {
  ctx.save();
  
  // Strong vignette effect for all themes - circular and prominent
  const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
  const vignetteGrad = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    Math.min(canvasWidth, canvasHeight) * 0.1,
    canvasWidth / 2,
    canvasHeight / 2,
    diagonal * 0.55
  );
  vignetteGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignetteGrad.addColorStop(0.4, "rgba(0, 0, 0, 0.06)");
  vignetteGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.15)");
  vignetteGrad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
  ctx.fillStyle = vignetteGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Theme-specific color wash - more pronounced
  let washColor = "rgba(0, 0, 0, 0)";
  switch (theme) {
    case "grassland":
      washColor = `rgba(100, 150, 80, ${0.025 + Math.sin(time * 0.5) * 0.01})`;
      break;
    case "desert":
      washColor = `rgba(200, 150, 100, ${0.035 + Math.sin(time * 0.3) * 0.012})`;
      break;
    case "winter":
      washColor = `rgba(150, 180, 220, ${0.04 + Math.sin(time * 0.4) * 0.015})`;
      break;
    case "volcanic":
      washColor = `rgba(200, 80, 50, ${0.045 + Math.sin(time * 0.6) * 0.018})`;
      break;
    case "swamp":
      washColor = `rgba(80, 120, 80, ${0.05 + Math.sin(time * 0.35) * 0.018})`;
      break;
  }
  ctx.fillStyle = washColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.restore();
}
