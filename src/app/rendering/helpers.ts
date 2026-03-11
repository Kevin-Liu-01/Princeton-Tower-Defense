// Princeton Tower Defense - Rendering Helper Functions
// Common utility functions used across rendering modules

import { ISO_COS, ISO_SIN, ISO_Y_RATIO } from "../constants";
import { setShadowBlur, clearShadow } from "./performance";

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Draws an organic blob path (instead of a perfect ellipse) centered at (cx, cy).
 * Uses multi-frequency sine wave noise for natural-looking terrain edges.
 * Only builds the path — caller must fill/stroke after.
 */
export function drawOrganicBlobAt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  seed: number,
  bumpiness: number = 0.15,
  points: number = 24,
): void {
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const noise1 = Math.sin(angle * 3 + seed) * bumpiness;
    const noise2 = Math.sin(angle * 5 + seed * 2.3) * bumpiness * 0.5;
    const noise3 = Math.sin(angle * 7 + seed * 4.1) * bumpiness * 0.25;
    const variation = 1 + noise1 + noise2 + noise3;

    const x = cx + Math.cos(angle) * radiusX * variation;
    const y = cy + Math.sin(angle) * radiusY * variation;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

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
// HEX PRISM UTILITIES (shared by cannon, gatling, flamethrower barrels, etc.)
// ============================================================================

export type IsoOffFn = (dx: number, dy: number) => { x: number; y: number };
export type Pt = { x: number; y: number };

export function generateIsoHexVertices(
  isoOff: IsoOffFn,
  radius: number,
  sides: number = 6,
): Pt[] {
  const verts: Pt[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    verts.push(isoOff(Math.cos(a) * radius, Math.sin(a) * radius));
  }
  return verts;
}

export function computeHexSideNormals(
  cosR: number,
  sides: number = 6,
): number[] {
  const normals: number[] = [];
  for (let i = 0; i < sides; i++) {
    const midA = ((i + 0.5) / sides) * Math.PI * 2;
    normals.push(Math.cos(midA) * cosR + 0.5 * Math.sin(midA));
  }
  return normals;
}

export function sortSidesByDepth(normals: number[]): number[] {
  return Array.from({ length: normals.length }, (_, i) => i).sort(
    (a, b) => normals[a] - normals[b],
  );
}

export function drawHexCap(
  ctx: CanvasRenderingContext2D,
  center: Pt,
  verts: Pt[],
  fillColor: string,
  strokeColor?: string,
  lineWidth?: number,
): void {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(center.x + verts[0].x, center.y + verts[0].y);
  for (let i = 1; i < verts.length; i++)
    ctx.lineTo(center.x + verts[i].x, center.y + verts[i].y);
  ctx.closePath();
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth ?? 1;
    ctx.stroke();
  }
}

export function drawHexBarrelBody(
  ctx: CanvasRenderingContext2D,
  baseVerts: Pt[],
  taperVerts: Pt[],
  backPt: Pt,
  frontPt: Pt,
  sideNormals: number[],
  facingFwd: boolean,
  colorFn: (normal: number, index: number) => string,
  strokeColor: string = "rgba(0,0,0,0.3)",
  lineWidth: number = 0.6,
): void {
  const sides = baseVerts.length;
  const sorted = sortSidesByDepth(sideNormals);

  for (const i of sorted) {
    const ni = (i + 1) % sides;
    const v0 = baseVerts[i];
    const v1 = baseVerts[ni];
    const tv0 = taperVerts[i];
    const tv1 = taperVerts[ni];

    ctx.fillStyle = colorFn(sideNormals[i], i);
    ctx.beginPath();
    if (facingFwd) {
      ctx.moveTo(backPt.x + v0.x, backPt.y + v0.y);
      ctx.lineTo(backPt.x + v1.x, backPt.y + v1.y);
      ctx.lineTo(frontPt.x + tv1.x, frontPt.y + tv1.y);
      ctx.lineTo(frontPt.x + tv0.x, frontPt.y + tv0.y);
    } else {
      ctx.moveTo(backPt.x + tv0.x, backPt.y + tv0.y);
      ctx.lineTo(backPt.x + tv1.x, backPt.y + tv1.y);
      ctx.lineTo(frontPt.x + v1.x, frontPt.y + v1.y);
      ctx.lineTo(frontPt.x + v0.x, frontPt.y + v0.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function drawHexBand(
  ctx: CanvasRenderingContext2D,
  hexVerts: Pt[],
  sideNormals: number[],
  bandPt: Pt,
  capPt: Pt,
  scale: number,
  colorFn: (normal: number) => string,
  strokeColor: string = "rgba(0,0,0,0.3)",
  lineWidth: number = 0.6,
  normalThreshold: number = -0.15,
): void {
  const sides = hexVerts.length;
  const bVerts = hexVerts.map((v) => ({ x: v.x * scale, y: v.y * scale }));
  const sorted = sortSidesByDepth(sideNormals);

  for (const i of sorted) {
    const ni = (i + 1) % sides;
    if (sideNormals[i] < normalThreshold) continue;

    ctx.fillStyle = colorFn(sideNormals[i]);
    ctx.beginPath();
    ctx.moveTo(bandPt.x + bVerts[i].x, bandPt.y + bVerts[i].y);
    ctx.lineTo(bandPt.x + bVerts[ni].x, bandPt.y + bVerts[ni].y);
    ctx.lineTo(capPt.x + bVerts[ni].x, capPt.y + bVerts[ni].y);
    ctx.lineTo(capPt.x + bVerts[i].x, capPt.y + bVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const ni = (i + 1) % sides;
    if (
      sideNormals[i] < normalThreshold &&
      sideNormals[ni === 0 ? sides - 1 : ni - 1] < normalThreshold
    )
      continue;
    ctx.moveTo(capPt.x + bVerts[i].x, capPt.y + bVerts[i].y);
    ctx.lineTo(capPt.x + bVerts[ni].x, capPt.y + bVerts[ni].y);
  }
  ctx.stroke();
}

export function scaleVerts(verts: Pt[], scale: number): Pt[] {
  return verts.map((v) => ({ x: v.x * scale, y: v.y * scale }));
}

// ============================================================================
// GROUND SHADOW
// ============================================================================

export function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  alpha: number = 0.2,
  rotation: number = 0,
): void {
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// DOME / HEMISPHERE
// ============================================================================

export function drawIsoDome(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  height: number,
  bodyColor: string,
  highlightColor: string,
  topColor: string,
): void {
  const ry = rx * ISO_Y_RATIO;

  const grad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  grad.addColorStop(0, darkenColor(bodyColor, 30));
  grad.addColorStop(0.35, bodyColor);
  grad.addColorStop(0.7, highlightColor);
  grad.addColorStop(1, highlightColor);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, cy - height);
  ctx.ellipse(cx, cy - height, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - height, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ============================================================================
// CONICAL / POINTED ROOF
// ============================================================================

export function drawIsoConicalRoof(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  peakY: number,
  baseWidth: number,
  leftColor: string,
  rightColor: string,
  topColor: string,
): void {
  const iW = baseWidth * ISO_COS;
  const iD = baseWidth * ISO_SIN;

  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(cx, peakY);
  ctx.lineTo(cx - iW, baseY + iD);
  ctx.lineTo(cx, baseY + iD * 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(cx, peakY);
  ctx.lineTo(cx, baseY + iD * 2);
  ctx.lineTo(cx + iW, baseY + iD);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(cx, peakY);
  ctx.lineTo(cx, baseY);
  ctx.lineTo(cx - iW, baseY + iD);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(cx, peakY);
  ctx.lineTo(cx + iW, baseY + iD);
  ctx.lineTo(cx, baseY);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// BRICK / STONE WALL FACE
// ============================================================================

export function drawBrickFace(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  h: number,
  baseColor: string,
  mortarColor: string,
  scale: number,
  rows: number,
  cols: number,
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const bH = h / rows;

  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2, y2 - h);
  ctx.lineTo(x1, y1 - h);
  ctx.closePath();
  ctx.fill();

  for (let r = 0; r < rows; r++) {
    const bondOff = r % 2 === 0 ? 0 : 0.5;
    for (let c = 0; c < cols; c++) {
      const t1 = Math.max(0, (c + bondOff) / cols);
      const t2 = Math.min(1, (c + 1 + bondOff) / cols);
      if (t1 >= 1 || t2 <= 0) continue;
      const bx1 = x1 + t1 * dx;
      const by1 = y1 + t1 * dy - r * bH;
      const bx2 = x1 + t2 * dx;
      const by2 = y1 + t2 * dy - r * bH;
      const shade = ((r * 7 + c * 13) % 5) * 0.015;
      if (shade > 0.02) {
        ctx.fillStyle = `rgba(255,255,240,${shade})`;
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.lineTo(bx2, by2 - bH + 0.3 * scale);
        ctx.lineTo(bx1, by1 - bH + 0.3 * scale);
        ctx.closePath();
        ctx.fill();
      }
      if (shade < 0.01) {
        ctx.fillStyle = `rgba(0,0,0,0.04)`;
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.lineTo(bx2, by2 - bH + 0.3 * scale);
        ctx.lineTo(bx1, by1 - bH + 0.3 * scale);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  ctx.strokeStyle = mortarColor;
  ctx.lineWidth = 0.6 * scale;
  for (let r = 1; r < rows; r++) {
    ctx.beginPath();
    ctx.moveTo(x1, y1 - r * bH);
    ctx.lineTo(x2, y2 - r * bH);
    ctx.stroke();
  }
  for (let r = 0; r < rows; r++) {
    const off = r % 2 === 0 ? 0 : 0.5;
    for (let c = 1; c < cols; c++) {
      const t = (c + off) / cols;
      if (t > 0.02 && t < 0.98) {
        const jx = x1 + t * dx;
        const jy = y1 + t * dy;
        ctx.beginPath();
        ctx.moveTo(jx, jy - r * bH);
        ctx.lineTo(jx, jy - (r + 1) * bH);
        ctx.stroke();
      }
    }
  }
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
  const isoWidth = width * ISO_COS;
  const isoDepth = depth * ISO_SIN;

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

export function drawIsometricPyramid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseWidth: number,
  height: number,
  topColor: string,
  leftColor: string,
  rightColor: string,
): void {
  const iW = baseWidth * ISO_COS;
  const iD = baseWidth * ISO_SIN;
  const back = { x: x, y: y };
  const left = { x: x - iW, y: y + iD };
  const front = { x: x, y: y + iD * 2 };
  const right = { x: x + iW, y: y + iD };
  const tip = { x: x, y: y + iD - height };

  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(left.x, left.y);
  ctx.lineTo(front.x, front.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(front.x, front.y);
  ctx.lineTo(right.x, right.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(back.x, back.y);
  ctx.lineTo(left.x, left.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(right.x, right.y);
  ctx.lineTo(back.x, back.y);
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
  ctx.ellipse(x, y, scaledRadius, scaledRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * @deprecated Use `renderRangeReticle` from `rendering/ui/reticles` instead.
 */
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
  ctx.ellipse(x, y, scaledRange, scaledRange * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = colorWithAlpha(color, alpha * 2);
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
}

// ============================================================================
// EFFECT HELPERS
// ============================================================================

export type LightningColorScheme = "blue" | "yellow";

const LIGHTNING_COLORS: Record<LightningColorScheme, {
  outerGlow: string; outerStroke: string;
  midGlow: string; midStroke: string;
  coreStroke: string;
  branchStroke: string; impactFill: string;
}> = {
  blue: {
    outerGlow: "#0088ff", outerStroke: "30, 100, 255",
    midGlow: "#00ffff", midStroke: "0, 220, 255",
    coreStroke: "220, 255, 255",
    branchStroke: "0, 200, 255", impactFill: "150, 255, 255",
  },
  yellow: {
    outerGlow: "#ff8800", outerStroke: "255, 170, 30",
    midGlow: "#ffee00", midStroke: "255, 230, 50",
    coreStroke: "255, 255, 220",
    branchStroke: "255, 200, 0", impactFill: "255, 255, 150",
  },
};

export function drawLightningBolt(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  intensity: number = 1,
  zoom: number = 1,
  alpha: number = 1,
  colorScheme: LightningColorScheme = "blue",
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / dist;
  const perpY = dx / dist;

  const boltSeed = Math.floor(Date.now() / 50);
  const noise = (seed: number) => {
    const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };

  const segments = Math.max(5, Math.floor(dist / 25));
  const jitter = 18 * zoom * intensity;
  const pts: { x: number; y: number }[] = [{ x: x1, y: y1 }];

  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const taper = 1 - Math.abs(t - 0.5) * 1.6;
    const n = (noise(boltSeed + i * 17) - 0.5) * 2;
    const offset = n * jitter * Math.max(0, taper);
    pts.push({
      x: x1 + dx * t + perpX * offset,
      y: y1 + dy * t + perpY * offset,
    });
  }
  pts.push({ x: x2, y: y2 });

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const c = LIGHTNING_COLORS[colorScheme];

  // Layer 1: outer glow
  ctx.shadowColor = c.outerGlow;
  ctx.shadowBlur = 16 * zoom * intensity;
  ctx.strokeStyle = `rgba(${c.outerStroke}, ${alpha * 0.25 * intensity})`;
  ctx.lineWidth = 9 * zoom * intensity;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();

  // Layer 2: mid glow
  ctx.shadowColor = c.midGlow;
  ctx.shadowBlur = 10 * zoom * intensity;
  ctx.strokeStyle = `rgba(${c.midStroke}, ${alpha * 0.55 * intensity})`;
  ctx.lineWidth = 3.5 * zoom * intensity;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();

  // Layer 3: bright core
  ctx.shadowBlur = 4 * zoom;
  ctx.strokeStyle = `rgba(${c.coreStroke}, ${alpha * 0.85 * intensity})`;
  ctx.lineWidth = 1.2 * zoom * intensity;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();

  // One branch fork
  const branchIdx = 1 + Math.floor(noise(boltSeed + 41) * (segments - 2));
  if (branchIdx < pts.length) {
    const bp = pts[branchIdx];
    const brAngle =
      Math.atan2(dy, dx) + (noise(boltSeed + 73) - 0.5) * Math.PI * 0.7;
    const brLen = (12 + noise(boltSeed + 53) * 18) * zoom * intensity;
    ctx.strokeStyle = `rgba(${c.branchStroke}, ${alpha * 0.35 * intensity})`;
    ctx.lineWidth = 2.5 * zoom * intensity;
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y);
    const midN = (noise(boltSeed + 91) - 0.5) * 5 * zoom;
    ctx.lineTo(
      bp.x + Math.cos(brAngle) * brLen * 0.5 + Math.cos(brAngle + 1.5) * midN,
      bp.y + Math.sin(brAngle) * brLen * 0.5 + Math.sin(brAngle + 1.5) * midN,
    );
    ctx.lineTo(
      bp.x + Math.cos(brAngle) * brLen,
      bp.y + Math.sin(brAngle) * brLen,
    );
    ctx.stroke();

    ctx.strokeStyle = `rgba(200, 255, 255, ${alpha * 0.5 * intensity})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y);
    ctx.lineTo(
      bp.x + Math.cos(brAngle) * brLen * 0.5 + Math.cos(brAngle + 1.5) * midN,
      bp.y + Math.sin(brAngle) * brLen * 0.5 + Math.sin(brAngle + 1.5) * midN,
    );
    ctx.lineTo(
      bp.x + Math.cos(brAngle) * brLen,
      bp.y + Math.sin(brAngle) * brLen,
    );
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
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
  ctx.ellipse(x, y, radius, radius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner glow
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.6})`);
  grad.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.4})`);
  grad.addColorStop(0.7, `rgba(255, 50, 0, ${alpha * 0.2})`);
  grad.addColorStop(1, "rgba(100, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
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
    ctx.ellipse(x, y, rippleRadius, rippleRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
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
  ctx.ellipse(x, y, radius, radius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
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

export const GAME_FONT_FAMILY = '"bc-novatica-cyr", "inter", sans-serif';

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
  ctx.font = `bold ${fontSize}px ${GAME_FONT_FAMILY}`;
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
