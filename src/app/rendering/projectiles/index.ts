import type { Projectile, Position } from "../../types";
import { worldToScreen } from "../../utils";
import { getPerformanceSettings } from "../performance";

// ============================================================================
// PROJECTILE RENDERING - Optimized and visually polished
// ============================================================================

// Helper: Parse color string to RGB components
const parsedColorCache = new Map<string, { r: number; g: number; b: number }>();
function parseColor(color: string): { r: number; g: number; b: number } {
  const cached = parsedColorCache.get(color);
  if (cached) return cached;

  let parsed: { r: number; g: number; b: number };
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      parsed = {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    } else {
      parsed = {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  } else {
    // Handle rgb/rgba
    const match = color.match(/\d+/g);
    parsed = match
      ? { r: +match[0], g: +match[1], b: +match[2] }
      : { r: 255, g: 255, b: 255 };
  }

  if (parsedColorCache.size > 256) parsedColorCache.clear();
  parsedColorCache.set(color, parsed);
  return parsed;
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
  if (!getPerformanceSettings().projectileTrails) return;
  const t = proj.progress;

  const hasVerticalArc = Boolean(proj.arcHeight || proj.elevation);
  if (!hasVerticalArc) {
    const fromScreen = worldToScreen(
      proj.from,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
    const toScreen = worldToScreen(
      proj.to,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
    for (let i = 1; i <= trailLength; i++) {
      const trailT = Math.max(0, t - i * 0.05);
      const alpha = 0.35 * (1 - i / (trailLength + 1));
      const size = Math.max(1, (trailSize - i * 0.6) * cameraZoom);
      const x = fromScreen.x + (toScreen.x - fromScreen.x) * trailT;
      const y = fromScreen.y + (toScreen.y - fromScreen.y) * trailT;
      ctx.fillStyle = colorWithAlpha(trailColor, alpha);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  for (let i = 1; i <= trailLength; i++) {
    const trailT = Math.max(0, t - i * 0.05);
    const trailX = proj.from.x + (proj.to.x - proj.from.x) * trailT;
    const trailY = proj.from.y + (proj.to.y - proj.from.y) * trailT;
    const trailGroundPos = worldToScreen(
      { x: trailX, y: trailY },
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
    // Arc and elevation are HEIGHT above ground — apply as screen-Y offset
    const trailArc = proj.arcHeight ? Math.sin(trailT * Math.PI) * proj.arcHeight * cameraZoom : 0;
    const trailElevation = proj.elevation ? proj.elevation * (1 - trailT) * cameraZoom : 0;
    const alpha = 0.35 * (1 - i / (trailLength + 1));
    const size = Math.max(1, (trailSize - i * 0.6) * cameraZoom);
    ctx.fillStyle = colorWithAlpha(trailColor, alpha);
    ctx.beginPath();
    ctx.arc(trailGroundPos.x, trailGroundPos.y - trailArc - trailElevation, size, 0, Math.PI * 2);
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
// LIGHTNING ORB - Electric sphere with 3D layered lightning
// ============================================================================
function renderLightningOrb(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  time: number,
  baseColor: { r: number; g: number; b: number },
  lowDetail: boolean,
  minimalDetail: boolean
) {
  const coreSize = 5 * zoom;
  const arcCount = minimalDetail ? 2 : lowDetail ? 4 : 7;
  const segCount = minimalDetail ? 2 : lowDetail ? 3 : 4;

  if (minimalDetail) {
    const auraSize = coreSize * 2.1;
    ctx.fillStyle = colorWithAlpha(baseColor, 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = colorWithAlpha(baseColor, 0.55);
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < arcCount; i++) {
      const angle = (i / arcCount) * Math.PI * 2 + time * 8;
      const len = (5 + Math.sin(time * 10 + i * 2.5) * 1.5) * zoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
      ctx.stroke();
    }

    ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
    ctx.beginPath();
    ctx.arc(0, 0, coreSize * 0.9, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Ambient corona
  const coronaGrad = ctx.createRadialGradient(0, 0, coreSize * 0.4, 0, 0, coreSize * 3.2);
  coronaGrad.addColorStop(0, colorWithAlpha(baseColor, 0.32));
  coronaGrad.addColorStop(0.45, colorWithAlpha(baseColor, lowDetail ? 0.1 : 0.14));
  coronaGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreSize * 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Lightning arcs
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < arcCount; i++) {
    const baseAngle = (i / arcCount) * Math.PI * 2 + time * 8;
    const arcLen = (7 + Math.sin(time * 14 + i * 4.3) * 2.4) * zoom;

    const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
    for (let s = 1; s <= segCount; s++) {
      const t = s / segCount;
      const jAmp = (1 - t * 0.45) * (lowDetail ? 1.8 : 2.8) * zoom;
      const jx = Math.sin(time * 20 + i * 3.8 + s * 6.1) * jAmp;
      const jy = Math.cos(time * 17 + i * 2.9 + s * 7.4) * jAmp * 0.6;
      pts.push({
        x: Math.cos(baseAngle) * arcLen * t + jx,
        y: Math.sin(baseAngle) * arcLen * t + jy,
      });
    }

    if (!lowDetail) {
      ctx.shadowColor = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.strokeStyle = colorWithAlpha(baseColor, 0.24);
      ctx.lineWidth = 3 * zoom;
      drawBoltPath(ctx, pts);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = lightenColor(baseColor, 55);
    ctx.lineWidth = lowDetail ? 1.2 * zoom : 1.7 * zoom;
    drawBoltPath(ctx, pts);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 0.7 * zoom;
    drawBoltPath(ctx, pts);
    ctx.stroke();

    const tip = pts[pts.length - 1];
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Plasma core
  if (!lowDetail) {
    ctx.shadowColor = lightenColor(baseColor, 80);
    ctx.shadowBlur = 10 * zoom;
  }
  const coreGrad = ctx.createRadialGradient(-coreSize * 0.2, -coreSize * 0.2, 0, 0, 0, coreSize);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.3, lightenColor(baseColor, 85));
  coreGrad.addColorStop(0.75, `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`);
  coreGrad.addColorStop(1, darkenColor(baseColor, 35));
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.ellipse(
    -coreSize * 0.24,
    -coreSize * 0.28,
    coreSize * 0.3,
    coreSize * 0.18,
    -0.4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawBoltPath(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
}

// ============================================================================
// SPEAR/JAVELIN - Thrown weapon
// ============================================================================
function renderSpear(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  baseColor: { r: number; g: number; b: number }
) {
  const s = 0.55 * zoom;
  const metal = lightenColor(baseColor, 35);
  const metalShade = darkenColor(baseColor, 35);
  const shaftWood = darkenColor(baseColor, 70);
  const accent = lightenColor(baseColor, 10);
  
  // Subtle glow trail
  ctx.fillStyle = colorWithAlpha(baseColor, 0.18);
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * s, 3 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Shaft
  ctx.fillStyle = shaftWood;
  ctx.fillRect(-9 * s, -1.3 * s, 18 * s, 2.6 * s);
  
  // Gold band
  ctx.fillStyle = accent;
  ctx.fillRect(-1.5 * s, -1.8 * s, 3 * s, 3.6 * s);
  
  // Fletching
  ctx.fillStyle = darkenColor(baseColor, 20);
  ctx.beginPath();
  ctx.moveTo(-7 * s, 0);
  ctx.lineTo(-12 * s, -3.5 * s);
  ctx.lineTo(-8 * s, 0);
  ctx.lineTo(-12 * s, 3.5 * s);
  ctx.closePath();
  ctx.fill();
  
  // Spearhead
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.moveTo(14 * s, 0);
  ctx.lineTo(7 * s, -3.5 * s);
  ctx.lineTo(8 * s, 0);
  ctx.lineTo(7 * s, 3.5 * s);
  ctx.closePath();
  ctx.fill();
  
  // Spearhead edge shadow
  ctx.strokeStyle = metalShade;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(8.5 * s, -2.2 * s);
  ctx.lineTo(13.4 * s, 0);
  ctx.lineTo(8.5 * s, 2.2 * s);
  ctx.stroke();

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
// MORTAR SHELL - Heavy explosive with stabilizer fins and layered exhaust
// ============================================================================
function renderMortarShell(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  progress: number,
  time: number,
) {
  const size = 7 * zoom;
  const wobble = Math.sin(progress * Math.PI * 6) * 0.12;

  ctx.save();
  ctx.rotate(wobble);

  // Outer smoke puffs
  for (let i = 0; i < 5; i++) {
    const tOff = -(8 + i * 4) * zoom;
    const tSize = (3 + i * 2) * zoom;
    const tAlpha = 0.18 - i * 0.03;
    const drift = Math.sin(time * 5 + i * 2.3) * zoom * 0.8;
    ctx.fillStyle = `rgba(140, 130, 120, ${tAlpha})`;
    ctx.beginPath();
    ctx.arc(tOff, drift, tSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner flame trail
  for (let i = 0; i < 4; i++) {
    const tOff = -(5 + i * 3.5) * zoom;
    const tSize = (4 - i * 0.8) * zoom;
    const tAlpha = 0.6 - i * 0.12;
    const flicker = Math.sin(time * 12 + i * 3.1) * zoom * 0.6;
    const grad = ctx.createRadialGradient(tOff, flicker, 0, tOff, flicker, tSize);
    grad.addColorStop(0, `rgba(255, 220, 80, ${tAlpha})`);
    grad.addColorStop(0.4, `rgba(255, 130, 20, ${tAlpha * 0.7})`);
    grad.addColorStop(1, "rgba(200, 60, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(tOff, flicker, tSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Exhaust flash at base
  const flashIntensity = 0.4 + Math.sin(time * 18) * 0.2;
  const flashGrad = ctx.createRadialGradient(-size * 1.1, 0, 0, -size * 1.1, 0, 4 * zoom);
  flashGrad.addColorStop(0, `rgba(255, 255, 200, ${flashIntensity})`);
  flashGrad.addColorStop(0.5, `rgba(255, 160, 40, ${flashIntensity * 0.5})`);
  flashGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
  ctx.fillStyle = flashGrad;
  ctx.beginPath();
  ctx.arc(-size * 1.1, 0, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Stabilizer fins
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, -size * 0.35);
  ctx.lineTo(-size * 1.05, -size * 0.35 - 2.5 * zoom);
  ctx.lineTo(-size * 1.15, -size * 0.35 - 1.5 * zoom);
  ctx.lineTo(-size * 1.15, -size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, size * 0.35);
  ctx.lineTo(-size * 1.05, size * 0.35 + 2.5 * zoom);
  ctx.lineTo(-size * 1.15, size * 0.35 + 1.5 * zoom);
  ctx.lineTo(-size * 1.15, size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, -size * 0.35);
  ctx.lineTo(-size * 1.05, -size * 0.35 - 2.5 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, size * 0.35);
  ctx.lineTo(-size * 1.05, size * 0.35 + 2.5 * zoom);
  ctx.stroke();

  // Shell body — rounded cylinder with nose cone
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.6);
  bodyGrad.addColorStop(0, "#6a5a4a");
  bodyGrad.addColorStop(0.25, "#8a7a6a");
  bodyGrad.addColorStop(0.5, "#5a4a3a");
  bodyGrad.addColorStop(0.75, "#4a3a2a");
  bodyGrad.addColorStop(1, "#3a2a1a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.5);
  ctx.quadraticCurveTo(size * 1.1, -size * 0.3, size * 1.3, 0);
  ctx.quadraticCurveTo(size * 1.1, size * 0.3, size * 0.5, size * 0.5);
  ctx.lineTo(-size * 0.9, size * 0.45);
  ctx.lineTo(-size * 0.9, -size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Copper driving bands
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.15, -size * 0.53, 2.5 * zoom, size * 1.06);
  ctx.fillStyle = "rgba(255, 220, 100, 0.3)";
  ctx.fillRect(-size * 0.15, -size * 0.53, 1.2 * zoom, size * 1.06);
  ctx.fillStyle = "#b0901d";
  ctx.fillRect(-size * 0.55, -size * 0.48, 2 * zoom, size * 0.96);

  // Nose fuze
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.arc(size * 1.2, 0, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.arc(size * 1.2, 0, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Top metallic highlight
  ctx.fillStyle = "rgba(255, 240, 200, 0.2)";
  ctx.beginPath();
  ctx.ellipse(size * 0.2, -size * 0.32, size * 0.7, zoom * 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Panel line
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.3, -size * 0.5);
  ctx.lineTo(size * 0.3, size * 0.5);
  ctx.stroke();

  ctx.restore();
}

// ============================================================================
// MISSILE - Sleek guided rocket with multi-layer exhaust and arc-following
// ============================================================================
function renderMissile(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  progress: number,
  time: number,
) {
  const size = 5 * zoom;

  // Outer smoke plume (expanding, drifting puffs)
  for (let i = 0; i < 6; i++) {
    const tOff = -(6 + i * 3.5) * zoom;
    const tSize = (2 + i * 1.8) * zoom;
    const tAlpha = 0.22 - i * 0.03;
    const drift = Math.sin(time * 4 + i * 1.7) * zoom * (0.3 + i * 0.15);
    ctx.fillStyle = `rgba(200, 195, 190, ${tAlpha})`;
    ctx.beginPath();
    ctx.arc(tOff, drift, tSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Exhaust flame cone (triangular, flickering)
  const flameLen = (8 + Math.sin(time * 20) * 2) * zoom;
  const flameGrad = ctx.createLinearGradient(-size * 1.2 - flameLen, 0, -size * 1.2, 0);
  flameGrad.addColorStop(0, "rgba(255, 50, 0, 0)");
  flameGrad.addColorStop(0.3, "rgba(255, 120, 20, 0.5)");
  flameGrad.addColorStop(0.6, "rgba(255, 200, 50, 0.8)");
  flameGrad.addColorStop(1, "rgba(255, 255, 200, 0.9)");
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 1.2, -size * 0.35);
  ctx.lineTo(-size * 1.2 - flameLen, 0);
  ctx.lineTo(-size * 1.2, size * 0.35);
  ctx.closePath();
  ctx.fill();

  // White-hot exhaust core
  const coreFlame = (4 + Math.sin(time * 25) * 1) * zoom;
  const coreGrad = ctx.createRadialGradient(-size * 1.2, 0, 0, -size * 1.2, 0, coreFlame);
  coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  coreGrad.addColorStop(0.4, "rgba(255, 255, 150, 0.6)");
  coreGrad.addColorStop(1, "rgba(255, 200, 50, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(-size * 1.2, 0, coreFlame, 0, Math.PI * 2);
  ctx.fill();

  // Tail fins (4 fins, top/bottom visible)
  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, -size * 0.5);
  ctx.lineTo(-size * 1.3, -size * 1.2);
  ctx.lineTo(-size * 1.5, -size * 1.1);
  ctx.lineTo(-size * 1.3, -size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, size * 0.5);
  ctx.lineTo(-size * 1.3, size * 1.2);
  ctx.lineTo(-size * 1.5, size * 1.1);
  ctx.lineTo(-size * 1.3, size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, -size * 0.5);
  ctx.lineTo(-size * 1.3, -size * 1.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.8, size * 0.5);
  ctx.lineTo(-size * 1.3, size * 1.2);
  ctx.stroke();

  // Missile body — sleek metallic cylinder
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.55);
  bodyGrad.addColorStop(0, "#999");
  bodyGrad.addColorStop(0.2, "#ccc");
  bodyGrad.addColorStop(0.5, "#aaa");
  bodyGrad.addColorStop(0.8, "#777");
  bodyGrad.addColorStop(1, "#555");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.6, 0);
  ctx.quadraticCurveTo(size * 1.4, -size * 0.35, size * 0.6, -size * 0.5);
  ctx.lineTo(-size * 1.2, -size * 0.45);
  ctx.lineTo(-size * 1.2, size * 0.45);
  ctx.lineTo(size * 0.6, size * 0.5);
  ctx.quadraticCurveTo(size * 1.4, size * 0.35, size * 1.6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Canard fins (small forward steering fins)
  ctx.fillStyle = "#777";
  ctx.beginPath();
  ctx.moveTo(size * 0.4, -size * 0.5);
  ctx.lineTo(size * 0.2, -size * 0.85);
  ctx.lineTo(size * 0.0, -size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.4, size * 0.5);
  ctx.lineTo(size * 0.2, size * 0.85);
  ctx.lineTo(size * 0.0, size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Red warhead section
  const warheadGrad = ctx.createLinearGradient(size * 0.6, 0, size * 1.6, 0);
  warheadGrad.addColorStop(0, "#cc1100");
  warheadGrad.addColorStop(0.5, "#ee2200");
  warheadGrad.addColorStop(1, "#991100");
  ctx.fillStyle = warheadGrad;
  ctx.beginPath();
  ctx.moveTo(size * 1.6, 0);
  ctx.quadraticCurveTo(size * 1.3, -size * 0.28, size * 0.8, -size * 0.42);
  ctx.lineTo(size * 0.8, size * 0.42);
  ctx.quadraticCurveTo(size * 1.3, size * 0.28, size * 1.6, 0);
  ctx.closePath();
  ctx.fill();

  // Warhead hazard stripe
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.85, -size * 0.42);
  ctx.lineTo(size * 0.85, size * 0.42);
  ctx.stroke();

  // Panel lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 0.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(0, size * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, -size * 0.47);
  ctx.lineTo(-size * 0.5, size * 0.47);
  ctx.stroke();

  // Seeker window
  ctx.fillStyle = "#223";
  ctx.beginPath();
  ctx.arc(size * 1.45, 0, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(100, 200, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(size * 1.45, 0, 0.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Top-edge highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.3, size * 0.8, zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  void progress;
}

// ============================================================================
// EMBER - Molten fiery glob with flame tongues, sparks, and smoke
// ============================================================================
function renderEmber(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  progress: number,
  time: number,
) {
  const size = 6 * zoom;
  const tumble = progress * Math.PI * 3;

  // Trailing sparks & cinders (drawn before tumble rotation)
  for (let i = 0; i < 6; i++) {
    const sparkPhase = (time * 3 + i * 1.7) % 2;
    const sparkOff = -(4 + i * 3 + sparkPhase * 3) * zoom;
    const sparkDrift = Math.sin(time * 7 + i * 2.5) * (2 + i * 0.5) * zoom;
    const sparkSize = Math.max(0.5, (1.8 - sparkPhase * 0.6)) * zoom;
    const sparkAlpha = Math.max(0, 0.7 - sparkPhase * 0.25);
    const sparkG = Math.floor(150 + Math.sin(i * 3.1) * 60);
    const sparkB = Math.floor(30 + Math.sin(i * 1.7) * 20);
    ctx.fillStyle = `rgba(255, ${sparkG}, ${sparkB}, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(sparkOff, sparkDrift, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoke wisps
  for (let i = 0; i < 3; i++) {
    const smokeOff = -(6 + i * 5) * zoom;
    const smokeDrift = Math.sin(time * 3 + i * 2.1) * (1 + i) * zoom - i * zoom;
    const smokeSize = (2.5 + i * 1.5) * zoom;
    const smokeAlpha = 0.12 - i * 0.03;
    ctx.fillStyle = `rgba(80, 60, 40, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(smokeOff, smokeDrift, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.rotate(tumble);

  // Outer heat glow
  const glowPulse = 0.35 + Math.sin(time * 6) * 0.1;
  const glowGrad = ctx.createRadialGradient(0, 0, size * 0.3, 0, 0, size * 2.8);
  glowGrad.addColorStop(0, `rgba(255, 160, 40, ${glowPulse})`);
  glowGrad.addColorStop(0.4, `rgba(255, 80, 10, ${glowPulse * 0.5})`);
  glowGrad.addColorStop(0.7, `rgba(200, 40, 0, ${glowPulse * 0.2})`);
  glowGrad.addColorStop(1, "rgba(150, 20, 0, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Flame tongues radiating from core
  for (let i = 0; i < 5; i++) {
    const flameAngle = (i / 5) * Math.PI * 2 + time * 4 + progress * 2;
    const flameLen = size * 0.8 + Math.sin(time * 10 + i * 2.3) * size * 0.4;
    const flameWidth = size * 0.35 + Math.sin(time * 8 + i * 1.7) * size * 0.1;
    const fx = Math.cos(flameAngle) * size * 0.5;
    const fy = Math.sin(flameAngle) * size * 0.5;
    const tipX = Math.cos(flameAngle) * (size * 0.5 + flameLen);
    const tipY = Math.sin(flameAngle) * (size * 0.5 + flameLen);

    const flameGrad = ctx.createLinearGradient(fx, fy, tipX, tipY);
    flameGrad.addColorStop(0, "rgba(255, 220, 80, 0.8)");
    flameGrad.addColorStop(0.3, "rgba(255, 140, 20, 0.6)");
    flameGrad.addColorStop(0.7, "rgba(220, 60, 0, 0.3)");
    flameGrad.addColorStop(1, "rgba(150, 30, 0, 0)");
    ctx.fillStyle = flameGrad;

    const perpX = -Math.sin(flameAngle) * flameWidth;
    const perpY = Math.cos(flameAngle) * flameWidth;
    ctx.beginPath();
    ctx.moveTo(fx + perpX, fy + perpY);
    ctx.quadraticCurveTo(
      (fx + tipX) * 0.5 + perpX * 0.6 + Math.sin(time * 12 + i) * zoom,
      (fy + tipY) * 0.5 + perpY * 0.6 + Math.cos(time * 11 + i) * zoom,
      tipX, tipY
    );
    ctx.quadraticCurveTo(
      (fx + tipX) * 0.5 - perpX * 0.6 - Math.sin(time * 12 + i) * zoom,
      (fy + tipY) * 0.5 - perpY * 0.6 - Math.cos(time * 11 + i) * zoom,
      fx - perpX, fy - perpY
    );
    ctx.closePath();
    ctx.fill();
  }

  // Molten core body (irregular lava rock)
  const coreGrad = ctx.createRadialGradient(-zoom * 0.5, -zoom * 0.5, 0, 0, 0, size);
  coreGrad.addColorStop(0, "#ffffcc");
  coreGrad.addColorStop(0.2, "#ffdd44");
  coreGrad.addColorStop(0.45, "#ff8800");
  coreGrad.addColorStop(0.7, "#cc3300");
  coreGrad.addColorStop(1, "#661100");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.85, 0);
  ctx.quadraticCurveTo(size * 0.7, -size * 0.75, size * 0.1, -size * 0.9);
  ctx.quadraticCurveTo(-size * 0.7, -size * 0.65, -size * 0.85, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.8, size * 0.6, -size * 0.15, size * 0.85);
  ctx.quadraticCurveTo(size * 0.5, size * 0.75, size * 0.85, size * 0.15);
  ctx.quadraticCurveTo(size * 0.9, size * 0.05, size * 0.85, 0);
  ctx.fill();

  // Molten veins on surface
  ctx.strokeStyle = "rgba(255, 255, 100, 0.5)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.6);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.1, -size * 0.2, size * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.4, -size * 0.3);
  ctx.quadraticCurveTo(size * 0.1, size * 0.2, size * 0.5, size * 0.5);
  ctx.stroke();

  // Hot-spot highlights
  const hotPulse = 0.5 + Math.sin(time * 10) * 0.2;
  ctx.fillStyle = `rgba(255, 255, 220, ${hotPulse})`;
  ctx.beginPath();
  ctx.arc(-zoom * 1.5, -zoom * 1.5, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 180, ${hotPulse * 0.6})`;
  ctx.beginPath();
  ctx.arc(zoom, zoom * 0.5, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Dark cooling spots
  ctx.fillStyle = "rgba(50, 20, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(size * 0.3, -size * 0.15, size * 0.15, size * 0.1, 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
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
// ENERGY BALL - Wyvern pulsing energy orb
// ============================================================================
function renderEnergyBall(
  ctx: CanvasRenderingContext2D,
  zoom: number,
  time: number,
  baseColor: { r: number; g: number; b: number }
) {
  const size = 10 * zoom;
  const pulse = 1 + Math.sin(time * 10) * 0.15;

  // Outer glow halo
  const outerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.6 * pulse);
  outerGrad.addColorStop(0, colorWithAlpha(baseColor, 0.35));
  outerGrad.addColorStop(0.5, colorWithAlpha(baseColor, 0.12));
  outerGrad.addColorStop(1, colorWithAlpha(baseColor, 0));
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.6 * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting energy wisps
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + time * 6;
    const orbitRadius = size * 0.7 * pulse;
    const wx = Math.cos(angle) * orbitRadius;
    const wy = Math.sin(angle) * orbitRadius * 0.5;
    const wispSize = (2.5 + Math.sin(time * 12 + i * 1.7)) * zoom;
    ctx.fillStyle = colorWithAlpha(baseColor, 0.5 + Math.sin(time * 8 + i) * 0.2);
    ctx.beginPath();
    ctx.arc(wx, wy, wispSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright inner core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.55 * pulse);
  coreGrad.addColorStop(0, "#ffffff");
  coreGrad.addColorStop(0.3, lightenColor(baseColor, 100));
  coreGrad.addColorStop(0.65, `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`);
  coreGrad.addColorStop(1, darkenColor(baseColor, 30));
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55 * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Hot white center spark
  const sparkGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15);
  sparkGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  sparkGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sparkGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
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

  // Wyvern energy
  wyvern: { r: 5, g: 200, b: 120 },
};

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================
let _cachedTime = 0;

export function setProjectileRenderTime(nowMs: number): void {
  _cachedTime = nowMs / 1000;
}

export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
  projectileDensityHint: number = 0
) {
  if (proj.spawnDelay && proj.spawnDelay > 0) return;

  const zoom = cameraZoom || 1;
  const t = proj.progress;
  const time = _cachedTime || Date.now() / 1000;
  const lowDetail = projectileDensityHint > 140;
  const minimalDetail = projectileDensityHint > 220;

  // Calculate position on ground plane, then apply height as screen-Y offset
  const currentX = proj.from.x + (proj.to.x - proj.from.x) * t;
  const currentY = proj.from.y + (proj.to.y - proj.from.y) * t;
  const groundScreenPos = worldToScreen(
    { x: currentX, y: currentY },
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  // Arc and elevation are HEIGHT above the ground — offset in screen-Y only
  const arcOffset = proj.arcHeight ? Math.sin(t * Math.PI) * proj.arcHeight * zoom : 0;
  const elevationFade = proj.elevation ? proj.elevation * (1 - t) * zoom : 0;
  const screenPos = { x: groundScreenPos.x, y: groundScreenPos.y - arcOffset - elevationFade };

  // Get base color - use projectile color if provided, otherwise use type default
  let baseColor: { r: number; g: number; b: number };
  if (proj.color) {
    baseColor = parseColor(proj.color);
  } else {
    // Default colors based on type
    switch (proj.type) {
      case "arrow": baseColor = COLORS.arrow; break;
      case "bolt": baseColor = COLORS.bolt; break;
      case "spear": baseColor = COLORS.arrow; break;
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
      case "wyvernBolt": baseColor = COLORS.wyvern; break;
      case "hero": baseColor = COLORS.mathey; break;
      default: baseColor = COLORS.arcane; break;
    }
  }

  // Get trail color
  const trailColor = proj.trailColor ? parseColor(proj.trailColor) : baseColor;

  // Draw trail (skip for certain types)
  if (!["rock", "sonicWave", "bansheeScream", "arch"].includes(proj.type)) {
    const baseTrailLength = proj.type === "flame" ? 2 : 4;
    const trailLength = minimalDetail
      ? 0
      : lowDetail
        ? Math.max(1, baseTrailLength - 2)
        : baseTrailLength;
    const trailSize = proj.type === "dragonBreath" ? 6 : 4;
    if (trailLength > 0) {
      drawTrail(
        ctx,
        proj,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        zoom,
        trailColor,
        trailLength,
        trailSize
      );
    }
  }

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);
  
  // Calculate rotation — for arcing mortar-family projectiles, follow the arc tangent
  let effectiveRotation: number;
  const arcAwareTypes = ["mortarShell", "missile", "ember"];
  if (proj.arcHeight && arcAwareTypes.includes(proj.type)) {
    const dt = 0.01;
    const t1 = Math.min(1, t + dt);
    const x1 = proj.from.x + (proj.to.x - proj.from.x) * t1;
    const y1 = proj.from.y + (proj.to.y - proj.from.y) * t1;
    const screen1 = worldToScreen(
      { x: x1, y: y1 }, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom
    );
    const arc1 = Math.sin(t1 * Math.PI) * proj.arcHeight * zoom;
    const elev1 = proj.elevation ? proj.elevation * (1 - t1) * zoom : 0;
    const dx = screen1.x - groundScreenPos.x;
    const dy = (screen1.y - arc1 - elev1) - (groundScreenPos.y - arcOffset - elevationFade);
    effectiveRotation = Math.atan2(dy, dx);
  } else {
    effectiveRotation = proj.rotation !== undefined ? proj.rotation :
      Math.atan2(proj.to.y - proj.from.y, proj.to.x - proj.from.x);
  }
  ctx.rotate(effectiveRotation);

  // Apply scale if provided
  const scale = proj.scale || 1;
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Under heavy density, prefer a cheap projectile sprite for expensive VFX types.
  if (
    minimalDetail &&
    !["arrow", "bolt", "spear", "bullet", "rock", "cannon"].includes(proj.type)
  ) {
    renderBullet(ctx, zoom, baseColor);
    ctx.restore();
    return;
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
      renderSpear(ctx, zoom, baseColor);
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
      renderLightningOrb(ctx, zoom, time, baseColor, lowDetail, minimalDetail);
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

    case "mortarShell":
      renderMortarShell(ctx, zoom, t, time);
      break;

    case "missile":
      renderMissile(ctx, zoom, t, time);
      break;

    case "ember":
      renderEmber(ctx, zoom, t, time);
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

    case "wyvernBolt":
      renderEnergyBall(ctx, zoom, time, baseColor);
      break;
      
    default:
      // Default to magic bolt style with the base color
      renderMagicBolt(ctx, zoom, time, baseColor);
      break;
  }

  ctx.restore();
}
