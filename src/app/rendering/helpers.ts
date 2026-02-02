// Princeton Tower Defense - Rendering Helper Functions
// Common utility functions used across rendering modules

import { setShadowBlur, clearShadow } from "./performance";

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgb(${Math.min(255, rgb.r + amount)}, ${Math.min(255, rgb.g + amount)}, ${Math.min(255, rgb.b + amount)})`;
}

export function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgb(${Math.max(0, rgb.r - amount)}, ${Math.max(0, rgb.g - amount)}, ${Math.max(0, rgb.b - amount)})`;
}

export function colorWithAlpha(color: string, alpha: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return `rgba(128, 128, 128, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// ============================================================================
// GEOMETRIC PRIMITIVES
// ============================================================================

export function drawIsometricPrism(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  topColor: string,
  leftColor: string,
  rightColor: string
): void {
  const isoWidth = width * 0.866;
  const isoDepth = depth * 0.5;

  // Top face
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(x, y - height);
  ctx.lineTo(x + isoWidth, y - height + isoDepth);
  ctx.lineTo(x, y - height + isoDepth * 2);
  ctx.lineTo(x - isoWidth, y - height + isoDepth);
  ctx.closePath();
  ctx.fill();

  // Left face
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(x - isoWidth, y - height + isoDepth);
  ctx.lineTo(x, y - height + isoDepth * 2);
  ctx.lineTo(x, y + isoDepth * 2);
  ctx.lineTo(x - isoWidth, y + isoDepth);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(x + isoWidth, y - height + isoDepth);
  ctx.lineTo(x, y - height + isoDepth * 2);
  ctx.lineTo(x, y + isoDepth * 2);
  ctx.lineTo(x + isoWidth, y + isoDepth);
  ctx.closePath();
  ctx.fill();
}

export function drawGear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  teeth: number,
  rotation: number,
  color: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = color;
  ctx.beginPath();

  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2;

    const innerRadius = radius * 0.7;
    const outerRadius = radius;

    ctx.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
    ctx.lineTo(Math.cos(angle + 0.15) * outerRadius, Math.sin(angle + 0.15) * outerRadius);
    ctx.lineTo(Math.cos(nextAngle - 0.15) * outerRadius, Math.sin(nextAngle - 0.15) * outerRadius);
    ctx.lineTo(Math.cos(nextAngle) * innerRadius, Math.sin(nextAngle) * innerRadius);
  }

  ctx.closePath();
  ctx.fill();

  // Center hole
  ctx.fillStyle = darkenColor(color, 40);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  points: number,
  rotation: number = 0
): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2 + rotation;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
}

// ============================================================================
// MECHANICAL ELEMENTS
// ============================================================================

export function drawSteamVent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  active: boolean,
  time: number
): void {
  // Vent base
  ctx.fillStyle = "#555555";
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Vent grate
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = size * 0.05;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * size * 0.15, y - size * 0.2);
    ctx.lineTo(x + i * size * 0.15, y + size * 0.2);
    ctx.stroke();
  }

  // Steam particles when active
  if (active) {
    ctx.fillStyle = `rgba(200, 200, 200, ${0.3 + Math.sin(time * 5) * 0.2})`;
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time * 3 + i) * size * 0.3;
      const riseOffset = ((time * 50 + i * 20) % 30) * size * 0.02;
      ctx.beginPath();
      ctx.arc(x + offset, y - size * 0.3 - riseOffset, size * (0.15 + i * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawConveyorBelt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  time: number,
  direction: number = 1
): void {
  // Belt base
  ctx.fillStyle = "#444444";
  ctx.fillRect(x - width / 2, y - height / 2, width, height);

  // Belt stripes (animated)
  const stripeOffset = (time * 50 * direction) % 20;
  ctx.fillStyle = "#333333";
  for (let i = -2; i < width / 10 + 2; i++) {
    const stripeX = x - width / 2 + i * 20 + stripeOffset;
    if (stripeX >= x - width / 2 && stripeX <= x + width / 2) {
      ctx.fillRect(stripeX, y - height / 2, 5, height);
    }
  }

  // Edge rollers
  ctx.fillStyle = "#666666";
  ctx.beginPath();
  ctx.arc(x - width / 2, y, height / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width / 2, y, height / 2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEnergyTube(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  color: string,
  time: number
): void {
  // Tube outline
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = radius * 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Energy flow
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const flowOffset = (time * 100) % 20;

  ctx.strokeStyle = color;
  ctx.lineWidth = radius;
  ctx.setLineDash([10, 10]);
  ctx.lineDashOffset = -flowOffset;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawAmmoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): void {
  // Box body
  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);

  // Lid
  ctx.fillStyle = darkenColor(color, 20);
  ctx.fillRect(x - width / 2, y - height / 2, width, height * 0.2);

  // Handle
  ctx.fillStyle = "#333333";
  ctx.fillRect(x - width * 0.15, y - height / 2 - height * 0.1, width * 0.3, height * 0.1);

  // Ammo symbol
  ctx.fillStyle = "#ffcc00";
  ctx.font = `${height * 0.3}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⚡", x, y + height * 0.1);
}

export function drawWarningLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  color: string = "#ff0000"
): void {
  const pulse = 0.5 + Math.sin(time * 5) * 0.5;

  // Light housing
  ctx.fillStyle = "#333333";
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Light
  ctx.fillStyle = colorWithAlpha(color, 0.3 + pulse * 0.7);
  setShadowBlur(ctx, radius * 2 * pulse, color);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

// ============================================================================
// UI ELEMENTS
// ============================================================================

export function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  percentage: number,
  zoom: number = 1,
  isEnemy: boolean = false
): void {
  const scaledWidth = width * zoom;
  const scaledHeight = height * zoom;

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x - scaledWidth / 2, y, scaledWidth, scaledHeight);

  // Health fill - enemies get red, friendly units get green
  let healthColor: string;
  if (isEnemy) {
    // Enemies: red health bar that gets darker as health decreases
    healthColor = percentage > 0.5 ? "#ef4444" : percentage > 0.25 ? "#dc2626" : "#b91c1c";
  } else {
    // Friendly (heroes/troops): green health bar that changes to yellow/red when low
    healthColor = percentage > 0.6 ? "#22c55e" : percentage > 0.3 ? "#eab308" : "#ef4444";
  }
  ctx.fillStyle = healthColor;
  ctx.fillRect(x - scaledWidth / 2, y, scaledWidth * percentage, scaledHeight);

  // Border
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - scaledWidth / 2, y, scaledWidth, scaledHeight);
}

export function drawSelectionIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  zoom: number,
  isHero: boolean = false,
  time: number = 0
): void {
  const scaledRadius = radius * zoom;
  const pulse = isHero ? 0.8 + Math.sin(time * 4) * 0.2 : 1;
  const color = isHero ? "#ffd700" : "#ffffff";

  ctx.strokeStyle = colorWithAlpha(color, 0.6 * pulse);
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([5, 5]);
  ctx.lineDashOffset = -time * 20;
  ctx.beginPath();
  ctx.ellipse(x, y, scaledRadius, scaledRadius * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawRangeIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  range: number,
  zoom: number,
  color: string = "#ffffff",
  alpha: number = 0.2
): void {
  const scaledRange = range * zoom;

  ctx.fillStyle = colorWithAlpha(color, alpha);
  ctx.beginPath();
  ctx.ellipse(x, y, scaledRange, scaledRange * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colorWithAlpha(color, alpha * 2);
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
}

// ============================================================================
// EFFECT HELPERS
// ============================================================================

export function drawLightningBolt(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  intensity: number = 1,
  zoom: number = 1,
  alpha: number = 1
): void {
  const segments = 6;
  const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];

  const dx = x2 - x1;
  const dy = y2 - y1;

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const jitter = (1 - t) * 15 * zoom * intensity;
    points.push({
      x: x1 + dx * t + (Math.random() - 0.5) * jitter,
      y: y1 + dy * t + (Math.random() - 0.5) * jitter * 0.5,
    });
  }
  points.push({ x: x2, y: y2 });

  // Glow
  ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.3 * intensity})`;
  ctx.lineWidth = 8 * zoom * intensity;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // Core
  ctx.strokeStyle = `rgba(200, 255, 255, ${alpha * intensity})`;
  ctx.lineWidth = 2 * zoom * intensity;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

export function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxRadius: number,
  progress: number,
  zoom: number = 1
): void {
  const radius = maxRadius * zoom * (0.3 + progress * 0.7);
  const alpha = 1 - progress;

  // Outer ring
  ctx.strokeStyle = `rgba(255, 100, 0, ${alpha * 0.5})`;
  ctx.lineWidth = 4 * zoom * (1 - progress);
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner glow
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.6})`);
  grad.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.4})`);
  grad.addColorStop(0.7, `rgba(255, 50, 0, ${alpha * 0.2})`);
  grad.addColorStop(1, "rgba(100, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// TERRAIN HELPERS
// ============================================================================

export function drawWaterRipple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  color: string = "#4a90d9"
): void {
  const rippleCount = 3;
  for (let i = 0; i < rippleCount; i++) {
    const rippleProgress = ((time + i * 0.3) % 1);
    const rippleRadius = radius * rippleProgress;
    const rippleAlpha = (1 - rippleProgress) * 0.3;

    ctx.strokeStyle = colorWithAlpha(color, rippleAlpha);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, rippleRadius, rippleRadius * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawLavaGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number
): void {
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;

  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, `rgba(255, 200, 0, ${pulse * 0.3})`);
  grad.addColorStop(0.5, `rgba(255, 100, 0, ${pulse * 0.2})`);
  grad.addColorStop(1, "rgba(200, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawIceShimmer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  time: number
): void {
  const shimmerX = x + (Math.sin(time * 2) * width * 0.3);
  const shimmerAlpha = 0.2 + Math.sin(time * 3) * 0.1;

  const grad = ctx.createLinearGradient(shimmerX - 20, y, shimmerX + 20, y);
  grad.addColorStop(0, "rgba(255, 255, 255, 0)");
  grad.addColorStop(0.5, `rgba(255, 255, 255, ${shimmerAlpha})`);
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
}

// ============================================================================
// TEXT HELPERS
// ============================================================================

export function drawOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fillColor: string,
  outlineColor: string = "#000000",
  outlineWidth: number = 2
): void {
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = outlineWidth;
  ctx.strokeText(text, x, y);

  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
}

export function drawFloatingText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  progress: number,
  color: string,
  fontSize: number = 16
): void {
  const alpha = 1 - progress;
  const offsetY = -progress * 30;

  ctx.globalAlpha = alpha;
  drawOutlinedText(ctx, text, x, y + offsetY, fontSize, color);
  ctx.globalAlpha = 1;
}
