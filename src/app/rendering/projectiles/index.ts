import type { Projectile, Position } from "../../types";
import { worldToScreen } from "../../utils";

// ============================================================================
// PROJECTILE RENDERING - Optimized and visually polished
// ============================================================================

// Helper: Parse color string to RGB components
function parseColor(color: string): { r: number; g: number; b: number } {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  // Handle rgb/rgba
  const match = color.match(/\d+/g);
  if (match) {
    return { r: +match[0], g: +match[1], b: +match[2] };
  }
  return { r: 255, g: 255, b: 255 };
}

// Helper: Lighten a color
function lightenColor(color: { r: number; g: number; b: number }, amount: number): string {
  return `rgb(${Math.min(255, color.r + amount)}, ${Math.min(255, color.g + amount)}, ${Math.min(255, color.b + amount)})`;
}

// Helper: Darken a color
function darkenColor(color: { r: number; g: number; b: number }, amount: number): string {
  return `rgb(${Math.max(0, color.r - amount)}, ${Math.max(0, color.g - amount)}, ${Math.max(0, color.b - amount)})`;
}

// Helper: Get color with alpha
function colorWithAlpha(color: { r: number; g: number; b: number }, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

// ============================================================================
// TRAIL DRAWING - Optimized, fewer particles
// ============================================================================
function drawTrail(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset: Position | undefined,
  cameraZoom: number,
  trailColor: { r: number; g: number; b: number },
  trailLength: number = 4,
  trailSize: number = 4
) {
  const t = proj.progress;
  
  // Draw trail as single path for performance
  for (let i = 1; i <= trailLength; i++) {
    const trailT = Math.max(0, t - i * 0.05);
    const trailX = proj.from.x + (proj.to.x - proj.from.x) * trailT;
    const trailY = proj.from.y + (proj.to.y - proj.from.y) * trailT;
    let trailArc = 0;
    if (proj.arcHeight) {
      trailArc = Math.sin(trailT * Math.PI) * proj.arcHeight;
    }
    const trailElevation = proj.elevation ? proj.elevation * (1 - trailT) : 0;
    const trailPos = worldToScreen(
      { x: trailX, y: trailY - trailArc - trailElevation },
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
    );
    const alpha = 0.35 * (1 - i / (trailLength + 1));
    const size = Math.max(1, (trailSize - i * 0.6) * cameraZoom);
    ctx.fillStyle = colorWithAlpha(trailColor, alpha);
    ctx.beginPath();
    ctx.arc(trailPos.x, trailPos.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// ARROW PROJECTILE - Clean, sharp design
// ============================================================================
function renderArrow(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  variant: "basic" | "crossbow" | "golden" = "basic"
) {
  const s = 0.65 * zoom;
  
  const colors = {
    basic: { shaft: "#6b4423", head: "#b8b8b8", fletch: "#c44" },
    crossbow: { shaft: "#3a3a3a", head: "#707070", fletch: "#222" },
    golden: { shaft: "#8b6914", head: "#daa520", fletch: "#ff9500" },
  };
  const c = colors[variant];
  
  // Shaft
  ctx.fillStyle = c.shaft;
  ctx.fillRect(-9 * s, -1 * s, 16 * s, 2 * s);
  
  // Fletching
  ctx.fillStyle = c.fletch;
  ctx.beginPath();
  ctx.moveTo(-7 * s, 0);
  ctx.lineTo(-11 * s, -3.5 * s);
  ctx.lineTo(-8 * s, 0);
  ctx.lineTo(-11 * s, 3.5 * s);
  ctx.closePath();
  ctx.fill();
  
  // Arrowhead
  ctx.fillStyle = c.head;
  ctx.beginPath();
  ctx.moveTo(11 * s, 0);
  ctx.lineTo(6 * s, -2.5 * s);
  ctx.lineTo(7 * s, 0);
  ctx.lineTo(6 * s, 2.5 * s);
  ctx.closePath();
  ctx.fill();
  
  // Shine
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.moveTo(10 * s, -0.5 * s);
  ctx.lineTo(8 * s, -1.2 * s);
  ctx.lineTo(8.5 * s, 0);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// MAGIC BOLT - Customizable color energy sphere
// ============================================================================
function renderMagicBolt(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  time: number,
  baseColor: { r: number; g: number; b: number }
) {
  const pulse = 0.9 + Math.sin(time * 8) * 0.1;
  const coreSize = 5 * zoom * pulse;
  const auraSize = 10 * zoom;
  
  // Outer aura glow (no shadowBlur - draw circles instead)
  const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
  auraGrad.addColorStop(0, colorWithAlpha(baseColor, 0.5));
  auraGrad.addColorStop(0.5, colorWithAlpha(baseColor, 0.2));
  auraGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Orbiting particles (only 3 for performance)
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + time * 5;
    const dist = 6 * zoom;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist * 0.6;
    ctx.fillStyle = colorWithAlpha(baseColor, 0.6);
    ctx.beginPath();
    ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Core orb with gradient
  const coreGrad = ctx.createRadialGradient(0, -1 * zoom, 0, 0, 0, coreSize);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.35, lightenColor(baseColor, 60));
  coreGrad.addColorStop(0.7, `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`);
  coreGrad.addColorStop(1, darkenColor(baseColor, 40));
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(-1 * zoom, -1.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// FIREBALL - Optimized fire effect
// ============================================================================
function renderFireball(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  time: number,
  baseColor: { r: number; g: number; b: number }
) {
  const fireSize = 9 * zoom;
  
  // Outer fire glow
  const outerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, fireSize * 1.4);
  outerGrad.addColorStop(0, colorWithAlpha(baseColor, 0.6));
  outerGrad.addColorStop(0.5, colorWithAlpha(baseColor, 0.25));
  outerGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, fireSize * 1.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Flame tongues (only 4 for performance)
  for (let i = 0; i < 4; i++) {
    const flameAngle = (i / 4) * Math.PI * 2 + time * 6;
    const flameLen = (fireSize * 0.7 + Math.sin(time * 10 + i * 2) * 2 * zoom);
    const fx = Math.cos(flameAngle) * fireSize * 0.3;
    const fy = Math.sin(flameAngle) * fireSize * 0.3;
    
    const flameGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, flameLen);
    flameGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
    flameGrad.addColorStop(0.4, colorWithAlpha(baseColor, 0.5));
    flameGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, flameLen, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Bright core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, fireSize * 0.5);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.4, "#ffffaa");
  coreGrad.addColorStop(1, lightenColor(baseColor, 50));
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, fireSize * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// ROCK/BOULDER - Tumbling stone
// ============================================================================
function renderRock(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  progress: number
) {
  const rotation = progress * Math.PI * 3;
  const size = 7 * zoom;
  
  ctx.save();
  ctx.rotate(rotation);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(1.5 * zoom, 1.5 * zoom, size, size * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Main rock
  const rockGrad = ctx.createRadialGradient(-2 * zoom, -2 * zoom, 0, 0, 0, size);
  rockGrad.addColorStop(0, "#a09080");
  rockGrad.addColorStop(0.5, "#706860");
  rockGrad.addColorStop(1, "#504840");
  ctx.fillStyle = rockGrad;
  
  // Irregular rock shape
  ctx.beginPath();
  ctx.moveTo(size * 0.9, 0);
  ctx.lineTo(size * 0.5, -size * 0.85);
  ctx.lineTo(-size * 0.4, -size * 0.9);
  ctx.lineTo(-size * 0.95, -size * 0.2);
  ctx.lineTo(-size * 0.7, size * 0.6);
  ctx.lineTo(size * 0.2, size * 0.9);
  ctx.lineTo(size * 0.75, size * 0.45);
  ctx.closePath();
  ctx.fill();
  
  // Cracks
  ctx.strokeStyle = "rgba(40, 30, 20, 0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-1 * zoom, -4 * zoom);
  ctx.lineTo(0.5 * zoom, 2 * zoom);
  ctx.stroke();
  
  // Highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  ctx.ellipse(-2 * zoom, -3 * zoom, 2 * zoom, 1.5 * zoom, -0.4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

// ============================================================================
// SONIC WAVE - Clean expanding rings
// ============================================================================
function renderSonicWave(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  progress: number,
  baseColor: { r: number; g: number; b: number }
) {
  // Three expanding rings
  for (let ring = 0; ring < 3; ring++) {
    const ringProgress = (progress + ring * 0.12) % 1;
    const ringSize = (4 + ringProgress * 14) * zoom;
    const ringAlpha = 0.5 * (1 - ringProgress);
    
    ctx.strokeStyle = colorWithAlpha(baseColor, ringAlpha);
    ctx.lineWidth = (2.5 - ring * 0.6) * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringSize, ringSize * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Core pulse
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 5 * zoom);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.4, lightenColor(baseColor, 40));
  coreGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// LIGHTNING ORB - Electric sphere
// ============================================================================
function renderLightningOrb(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  time: number,
  baseColor: { r: number; g: number; b: number }
) {
  const coreSize = 5 * zoom;
  
  // Outer electric glow
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize * 2);
  glowGrad.addColorStop(0, colorWithAlpha(baseColor, 0.6));
  glowGrad.addColorStop(0.6, colorWithAlpha(baseColor, 0.2));
  glowGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreSize * 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Electric arcs (simplified - no Math.random for consistent visuals)
  ctx.strokeStyle = lightenColor(baseColor, 80);
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 4; i++) {
    const arcAngle = (i / 4) * Math.PI * 2 + time * 8;
    const arcLen = 7 * zoom;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    // Zigzag path (deterministic based on i and time)
    let x = 0, y = 0;
    for (let j = 0; j < 2; j++) {
      const jitter = Math.sin(time * 20 + i * 3 + j * 7) * 2 * zoom;
      x += Math.cos(arcAngle) * (arcLen / 2) + jitter;
      y += Math.sin(arcAngle) * (arcLen / 2) + jitter * 0.5;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  // Core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.3, lightenColor(baseColor, 100));
  coreGrad.addColorStop(0.7, `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`);
  coreGrad.addColorStop(1, darkenColor(baseColor, 30));
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// SPEAR/JAVELIN - Thrown weapon
// ============================================================================
function renderSpear(
  ctx: CanvasRenderingContext2D,
  zoom: number
) {
  const s = 0.55 * zoom;
  
  // Subtle glow trail
  ctx.fillStyle = "rgba(255, 200, 50, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Shaft
  ctx.fillStyle = "#5a4020";
  ctx.fillRect(-9 * s, -1.3 * s, 18 * s, 2.6 * s);
  
  // Gold band
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-1.5 * s, -1.8 * s, 3 * s, 3.6 * s);
  
  // Fletching
  ctx.fillStyle = "#d05000";
  ctx.beginPath();
  ctx.moveTo(-7 * s, 0);
  ctx.lineTo(-12 * s, -3.5 * s);
  ctx.lineTo(-8 * s, 0);
  ctx.lineTo(-12 * s, 3.5 * s);
  ctx.closePath();
  ctx.fill();
  
  // Spearhead
  ctx.fillStyle = "#d0d0d0";
  ctx.beginPath();
  ctx.moveTo(14 * s, 0);
  ctx.lineTo(7 * s, -3.5 * s);
  ctx.lineTo(8 * s, 0);
  ctx.lineTo(7 * s, 3.5 * s);
  ctx.closePath();
  ctx.fill();
  
  // Shine
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.beginPath();
  ctx.moveTo(12 * s, -0.8 * s);
  ctx.lineTo(9 * s, -1.8 * s);
  ctx.lineTo(10 * s, 0);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// BULLET - Fast tracer
// ============================================================================
function renderBullet(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  baseColor: { r: number; g: number; b: number }
) {
  // Tracer trail
  const trailGrad = ctx.createLinearGradient(-12 * zoom, 0, 4 * zoom, 0);
  trailGrad.addColorStop(0, colorWithAlpha(baseColor, 0));
  trailGrad.addColorStop(0.5, colorWithAlpha(baseColor, 0.4));
  trailGrad.addColorStop(1, colorWithAlpha(baseColor, 0.8));
  ctx.fillStyle = trailGrad;
  ctx.fillRect(-12 * zoom, -1.5 * zoom, 16 * zoom, 3 * zoom);
  
  // Bullet core
  const bulletGrad = ctx.createLinearGradient(-3 * zoom, 0, 5 * zoom, 0);
  bulletGrad.addColorStop(0, lightenColor(baseColor, 30));
  bulletGrad.addColorStop(0.6, "#ffffff");
  bulletGrad.addColorStop(1, lightenColor(baseColor, 60));
  ctx.fillStyle = bulletGrad;
  ctx.beginPath();
  ctx.ellipse(1.5 * zoom, 0, 4 * zoom, 2.2 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// CANNONBALL - Heavy shell
// ============================================================================
function renderCannonball(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  progress: number
) {
  const spin = progress * Math.PI * 2.5;
  const size = 6 * zoom;
  
  // Fire trail
  const trailOffset = -6 * zoom + Math.sin(spin) * zoom;
  const trailGrad = ctx.createRadialGradient(trailOffset, 0, 0, trailOffset, 0, 8 * zoom);
  trailGrad.addColorStop(0, "rgba(255, 200, 50, 0.7)");
  trailGrad.addColorStop(0.5, "rgba(255, 100, 0, 0.4)");
  trailGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
  ctx.fillStyle = trailGrad;
  ctx.beginPath();
  ctx.arc(trailOffset, 0, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Main ball
  const ballGrad = ctx.createRadialGradient(-1.5 * zoom, -1.5 * zoom, 0, 0, 0, size);
  ballGrad.addColorStop(0, "#555");
  ballGrad.addColorStop(0.5, "#333");
  ballGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Metallic shine
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.beginPath();
  ctx.ellipse(-1.5 * zoom, -1.5 * zoom, 2.5 * zoom, 1.8 * zoom, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// FLAME - Flamethrower stream
// ============================================================================
function renderFlame(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  time: number
) {
  // Flame particles (reduced count for performance)
  for (let i = 0; i < 3; i++) {
    const offset = Math.sin(time * 8 + i * 2) * 3 * zoom;
    const flameSize = (4 + Math.sin(time * 6 + i * 3) * 2) * zoom;
    
    const flameGrad = ctx.createRadialGradient(offset, offset * 0.4, 0, offset, offset * 0.4, flameSize);
    flameGrad.addColorStop(0, "rgba(255, 255, 100, 0.85)");
    flameGrad.addColorStop(0.4, "rgba(255, 150, 0, 0.6)");
    flameGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(offset, offset * 0.4, flameSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// HERO PROJECTILE - Energy attack with hero-based colors
// ============================================================================
function renderHeroProjectile(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  baseColor: { r: number; g: number; b: number }
) {
  const size = 5 * zoom;
  
  // Energy trail
  ctx.fillStyle = colorWithAlpha(baseColor, 0.25);
  ctx.beginPath();
  ctx.ellipse(-3 * zoom, 0, 8 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Main orb
  const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  orbGrad.addColorStop(0, "#ffffff");
  orbGrad.addColorStop(0.35, lightenColor(baseColor, 40));
  orbGrad.addColorStop(0.8, `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`);
  orbGrad.addColorStop(1, darkenColor(baseColor, 30));
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(-1 * zoom, -1.2 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// BANSHEE SCREAM - Ghostly wail
// ============================================================================
function renderBansheeScream(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  progress: number,
  baseColor: { r: number; g: number; b: number }
) {
  // Expanding ghostly rings
  for (let ring = 0; ring < 3; ring++) {
    const ringProgress = (progress + ring * 0.1) % 1;
    const ringSize = (3 + ringProgress * 16) * zoom;
    const ringAlpha = 0.45 * (1 - ringProgress);
    
    ctx.strokeStyle = colorWithAlpha(baseColor, ringAlpha);
    ctx.lineWidth = (2.5 - ring * 0.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, ringSize, ringSize * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Ghostly core
  const ghostGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 6 * zoom);
  ghostGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
  ghostGrad.addColorStop(0.5, colorWithAlpha(baseColor, 0.5));
  ghostGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = ghostGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// DRAGON BREATH - Massive elemental blast
// ============================================================================
function renderDragonBreath(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  time: number,
  baseColor: { r: number; g: number; b: number }
) {
  const size = 12 * zoom;
  
  // Outer energy field
  const outerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.3);
  outerGrad.addColorStop(0, colorWithAlpha(baseColor, 0.5));
  outerGrad.addColorStop(0.6, colorWithAlpha(baseColor, 0.2));
  outerGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Swirling energy (only 5 particles for performance)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + time * 4;
    const dist = (2 + Math.sin(time * 8 + i) * 1.5) * zoom;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist * 0.6;
    const particleSize = (4 + Math.sin(time * 6 + i * 2)) * zoom;
    
    const particleGrad = ctx.createRadialGradient(px, py, 0, px, py, particleSize);
    particleGrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    particleGrad.addColorStop(0.4, colorWithAlpha(baseColor, 0.6));
    particleGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
    ctx.fillStyle = particleGrad;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Bright core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.6);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.3, lightenColor(baseColor, 80));
  coreGrad.addColorStop(0.7, `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`);
  coreGrad.addColorStop(1, darkenColor(baseColor, 20));
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// PREDEFINED COLORS
// ============================================================================
const COLORS = {
  // Basic projectiles
  arrow: { r: 139, g: 90, b: 43 },
  bolt: { r: 80, g: 80, b: 80 },
  golden: { r: 201, g: 162, b: 39 },
  
  // Fire
  fire: { r: 255, g: 100, b: 0 },
  infernal: { r: 200, g: 50, b: 255 },
  dragon: { r: 50, g: 255, b: 150 },
  
  // Magic
  arcane: { r: 136, g: 100, b: 255 },
  dark: { r: 170, g: 50, b: 180 },
  frost: { r: 100, g: 200, b: 255 },
  poison: { r: 150, g: 220, b: 50 },
  holy: { r: 255, g: 230, b: 100 },
  shadow: { r: 100, g: 50, b: 150 },
  nature: { r: 100, g: 200, b: 80 },
  blood: { r: 200, g: 50, b: 50 },
  
  // Lightning/electric
  lightning: { r: 100, g: 220, b: 255 },
  
  // Sonic
  sonic: { r: 80, g: 200, b: 120 },
  
  // Bullets
  tracer: { r: 255, g: 200, b: 50 },
  
  // Hero colors
  mathey: { r: 201, g: 162, b: 39 },
  scott: { r: 201, g: 162, b: 39 },  // Golden for F. Scott
  tenor: { r: 168, g: 85, b: 247 },  // Purple for Tenor
  rocky: { r: 120, g: 113, b: 108 },
  
  // Banshee
  banshee: { r: 200, g: 150, b: 255 },
};

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================
export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const zoom = cameraZoom || 1;
  const t = proj.progress;
  const time = Date.now() / 1000;

  // Calculate position
  const currentX = proj.from.x + (proj.to.x - proj.from.x) * t;
  const currentY = proj.from.y + (proj.to.y - proj.from.y) * t;
  let arcOffset = 0;
  if (proj.arcHeight) {
    arcOffset = Math.sin(t * Math.PI) * proj.arcHeight;
  }
  const elevationFade = proj.elevation ? proj.elevation * (1 - t) : 0;
  const currentPos = { x: currentX, y: currentY - arcOffset - elevationFade };
  const screenPos = worldToScreen(
    currentPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );

  // Get base color - use projectile color if provided, otherwise use type default
  let baseColor: { r: number; g: number; b: number };
  if (proj.color) {
    baseColor = parseColor(proj.color);
  } else {
    // Default colors based on type
    switch (proj.type) {
      case "arrow": baseColor = COLORS.arrow; break;
      case "bolt": baseColor = COLORS.bolt; break;
      case "fireball": baseColor = COLORS.fire; break;
      case "infernalFire": baseColor = COLORS.infernal; break;
      case "dragonBreath": baseColor = COLORS.dragon; break;
      case "magicBolt": baseColor = COLORS.arcane; break;
      case "darkBolt": baseColor = COLORS.dark; break;
      case "frostBolt": baseColor = COLORS.frost; break;
      case "poisonBolt": baseColor = COLORS.poison; break;
      case "lightning": case "lab": case "energyBlast": baseColor = COLORS.lightning; break;
      case "sonicWave": case "arch": baseColor = COLORS.sonic; break;
      case "bullet": baseColor = COLORS.tracer; break;
      case "bansheeScream": baseColor = COLORS.banshee; break;
      case "hero": baseColor = COLORS.mathey; break;
      default: baseColor = COLORS.arcane; break;
    }
  }

  // Get trail color
  const trailColor = proj.trailColor ? parseColor(proj.trailColor) : baseColor;

  // Draw trail (skip for certain types)
  if (!["rock", "sonicWave", "bansheeScream", "arch"].includes(proj.type)) {
    const trailLength = proj.type === "flame" ? 2 : 4;
    const trailSize = proj.type === "dragonBreath" ? 6 : 4;
    drawTrail(ctx, proj, canvasWidth, canvasHeight, dpr, cameraOffset, zoom, trailColor, trailLength, trailSize);
  }

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);
  
  // Calculate rotation
  const effectiveRotation = proj.rotation !== undefined ? proj.rotation : 
    Math.atan2(proj.to.y - proj.from.y, proj.to.x - proj.from.x);
  ctx.rotate(effectiveRotation);

  // Apply scale if provided
  const scale = proj.scale || 1;
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Render based on type
  switch (proj.type) {
    case "arrow":
      renderArrow(ctx, zoom, "basic");
      break;
      
    case "bolt":
      renderArrow(ctx, zoom, "crossbow");
      break;
      
    case "spear":
      renderSpear(ctx, zoom);
      break;
      
    case "rock":
      renderRock(ctx, zoom, t);
      break;
      
    case "fireball":
    case "infernalFire":
      renderFireball(ctx, zoom, time, baseColor);
      break;
      
    case "dragonBreath":
      renderDragonBreath(ctx, zoom, time, baseColor);
      break;
      
    case "magicBolt":
    case "darkBolt":
    case "frostBolt":
    case "poisonBolt":
      renderMagicBolt(ctx, zoom, time, baseColor);
      break;
      
    case "energyBlast":
    case "lab":
    case "lightning":
      renderLightningOrb(ctx, zoom, time, baseColor);
      break;
      
    case "sonicWave":
    case "arch":
      renderSonicWave(ctx, zoom, t, baseColor);
      break;
      
    case "bullet":
      renderBullet(ctx, zoom, baseColor);
      break;
      
    case "cannon":
      renderCannonball(ctx, zoom, t);
      break;
      
    case "flame":
      renderFlame(ctx, zoom, time);
      break;
      
    case "hero":
      renderHeroProjectile(ctx, zoom, baseColor);
      break;
      
    case "bansheeScream":
      renderBansheeScream(ctx, zoom, t, baseColor);
      break;
      
    default:
      // Default to magic bolt style with the base color
      renderMagicBolt(ctx, zoom, time, baseColor);
      break;
  }

  ctx.restore();
}
