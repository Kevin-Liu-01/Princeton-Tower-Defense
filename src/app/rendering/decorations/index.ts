// Princeton Tower Defense - Decorations Rendering Module
// Renders map decorations like trees, rocks, buildings, etc.

import type { Position, MapDecoration } from "../../types";
import { worldToScreen } from "../../utils";
import { lightenColor, darkenColor, drawIsometricPrism } from "../helpers";

// Import landmark renderers
import {
  drawPyramid,
  drawSphinx,
  drawNassauHall,
  drawIceFortress,
  drawObsidianCastle,
  drawWitchCottage,
} from "./landmarks";

// Export the decoration item renderer for use in page.tsx
export { renderDecorationItem, type DecorationRenderParams } from "./renderDecorationItem";

// ============================================================================
// MAIN DECORATION RENDER FUNCTION
// ============================================================================

export function renderDecoration(
  ctx: CanvasRenderingContext2D,
  decoration: MapDecoration,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  const screenPos = worldToScreen(
    decoration.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const scale = (decoration.scale || 1) * zoom;

  ctx.save();

  // Get type from category or type field
  const decorType = decoration.category || decoration.type || "tree";
  const variantStr = typeof decoration.variant === "string" ? decoration.variant : undefined;
  const variantNum = typeof decoration.variant === "number" ? decoration.variant : 0;

  switch (decorType) {
    case "tree":
      drawTree(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "rock":
      drawRock(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "bush":
      drawBush(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "flower":
    case "flowers":
      drawFlower(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "building":
      drawBuilding(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "statue":
      drawStatue(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "lamp":
    case "lamppost":
      drawLamp(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "fence":
      drawFence(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "water":
    case "fountain":
      drawWaterFeature(ctx, screenPos.x, screenPos.y, scale, variantStr, time);
      break;
    case "ruins":
      drawRuins(ctx, screenPos.x, screenPos.y, scale, variantStr);
      break;
    case "crater":
      drawCrater(ctx, screenPos.x, screenPos.y, scale, variantNum, time);
      break;
    case "debris":
      drawDebris(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "skeleton":
      drawSkeleton(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "bones":
      drawBones(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "sword":
      drawSword(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    case "arrow":
      drawArrow(ctx, screenPos.x, screenPos.y, scale, variantNum);
      break;
    // Major landmarks
    case "pyramid":
      drawPyramid(ctx, screenPos.x, screenPos.y, scale, variantNum, time);
      break;
    case "sphinx":
      drawSphinx(ctx, screenPos.x, screenPos.y, scale, false, time);
      break;
    case "giant_sphinx":
      drawSphinx(ctx, screenPos.x, screenPos.y, scale, true, time);
      break;
    case "nassau_hall":
      drawNassauHall(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "ice_fortress":
      drawIceFortress(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "obsidian_castle":
      drawObsidianCastle(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    case "witch_cottage":
      drawWitchCottage(ctx, screenPos.x, screenPos.y, scale, time);
      break;
    default:
      // Generic decoration
      drawGenericDecoration(ctx, screenPos.x, screenPos.y, scale);
  }

  ctx.restore();
}

// ============================================================================
// TREE RENDERING
// ============================================================================

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  const sway = Math.sin(time * 1.5 + x * 0.01) * 2 * scale;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 5 * scale, 20 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.moveTo(x - 5 * scale, y);
  ctx.lineTo(x - 3 * scale + sway * 0.2, y - 30 * scale);
  ctx.lineTo(x + 3 * scale + sway * 0.2, y - 30 * scale);
  ctx.lineTo(x + 5 * scale, y);
  ctx.closePath();
  ctx.fill();

  // Foliage based on variant
  const foliageColor = variant === "pine" ? "#1a5f1a" :
                       variant === "autumn" ? "#d4763b" :
                       variant === "dead" ? "#8b7355" :
                       variant === "palm" ? "#2e8b2e" : "#228b22";

  if (variant === "pine") {
    // Pine tree layers
    for (let i = 0; i < 3; i++) {
      const layerY = y - 30 * scale - i * 15 * scale;
      const layerSize = (20 - i * 4) * scale;
      ctx.fillStyle = i === 0 ? darkenColor(foliageColor, 10) : foliageColor;
      ctx.beginPath();
      ctx.moveTo(x + sway, layerY - 20 * scale);
      ctx.lineTo(x - layerSize + sway, layerY);
      ctx.lineTo(x + layerSize + sway, layerY);
      ctx.closePath();
      ctx.fill();
    }
  } else if (variant === "palm") {
    // Palm fronds
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time * 0.5;
      const frondSway = Math.sin(time * 2 + i) * 3 * scale;
      ctx.strokeStyle = foliageColor;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(x + sway, y - 35 * scale);
      ctx.quadraticCurveTo(
        x + Math.cos(angle) * 20 * scale + sway + frondSway,
        y - 45 * scale,
        x + Math.cos(angle) * 35 * scale + sway + frondSway,
        y - 30 * scale + Math.sin(angle) * 10 * scale
      );
      ctx.stroke();
    }
  } else {
    // Standard round tree
    ctx.fillStyle = foliageColor;
    ctx.beginPath();
    ctx.arc(x + sway, y - 45 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = lightenColor(foliageColor, 20);
    ctx.beginPath();
    ctx.arc(x + sway - 8 * scale, y - 50 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// ROCK RENDERING
// ============================================================================

function drawRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string
): void {
  const rockColor = variant === "dark" ? "#4a4a4a" :
                    variant === "red" ? "#8b4513" :
                    variant === "crystal" ? "#87ceeb" : "#808080";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 3 * scale, 15 * scale, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top face (lightest)
  ctx.fillStyle = rockColor;
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y - 15 * scale);
  ctx.lineTo(x + 5 * scale, y - 18 * scale);
  ctx.lineTo(x + 14 * scale, y - 8 * scale);
  ctx.lineTo(x, y - 5 * scale);
  ctx.closePath();
  ctx.fill();

  // Front face (medium dark - faces viewer)
  ctx.fillStyle = darkenColor(rockColor, 15);
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.lineTo(x - 8 * scale, y - 15 * scale);
  ctx.lineTo(x, y - 5 * scale);
  ctx.lineTo(x, y + 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Right side face (darkest)
  ctx.fillStyle = darkenColor(rockColor, 30);
  ctx.beginPath();
  ctx.moveTo(x, y - 5 * scale);
  ctx.lineTo(x + 14 * scale, y - 8 * scale);
  ctx.lineTo(x + 10 * scale, y);
  ctx.lineTo(x, y + 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Highlight on top face
  ctx.fillStyle = lightenColor(rockColor, 30);
  ctx.beginPath();
  ctx.moveTo(x - 6 * scale, y - 14 * scale);
  ctx.lineTo(x + 2 * scale, y - 15 * scale);
  ctx.lineTo(x - 2 * scale, y - 8 * scale);
  ctx.closePath();
  ctx.fill();

  if (variant === "crystal") {
    // Crystal glow
    ctx.shadowColor = "#87ceeb";
    ctx.shadowBlur = 10 * scale;
    ctx.fillStyle = `rgba(135, 206, 235, 0.5)`;
    ctx.beginPath();
    ctx.moveTo(x, y - 20 * scale);
    ctx.lineTo(x + 5 * scale, y - 10 * scale);
    ctx.lineTo(x - 5 * scale, y - 10 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ============================================================================
// BUSH RENDERING
// ============================================================================

function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  const bushColor = variant === "berry" ? "#2d5a2d" :
                    variant === "flower" ? "#3d7a3d" : "#3a7a3a";
  const sway = Math.sin(time * 2 + x * 0.02) * scale;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + 2 * scale, 12 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bush layers
  for (let i = 0; i < 3; i++) {
    const offsetX = (i - 1) * 6 * scale + sway * (i === 1 ? 1 : 0.5);
    const offsetY = i === 1 ? -3 * scale : 0;
    ctx.fillStyle = i === 1 ? lightenColor(bushColor, 10) : bushColor;
    ctx.beginPath();
    ctx.arc(x + offsetX, y - 5 * scale + offsetY, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Berries or flowers
  if (variant === "berry") {
    ctx.fillStyle = "#dc143c";
    for (let i = 0; i < 5; i++) {
      const bx = x + (Math.random() - 0.5) * 15 * scale;
      const by = y - 5 * scale + (Math.random() - 0.5) * 8 * scale;
      ctx.beginPath();
      ctx.arc(bx, by, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (variant === "flower") {
    const flowerColors = ["#ff69b4", "#ffff00", "#ffffff"];
    for (let i = 0; i < 4; i++) {
      const fx = x + (Math.random() - 0.5) * 15 * scale;
      const fy = y - 8 * scale + (Math.random() - 0.5) * 6 * scale;
      ctx.fillStyle = flowerColors[i % 3];
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================================================
// FLOWER RENDERING
// ============================================================================

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  const sway = Math.sin(time * 3 + x * 0.05) * 2 * scale;
  const petalColor = variant === "red" ? "#ff4444" :
                     variant === "yellow" ? "#ffdd44" :
                     variant === "purple" ? "#9944ff" : "#ff88cc";

  // Stem
  ctx.strokeStyle = "#228b22";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + sway * 0.5, y - 10 * scale, x + sway, y - 20 * scale);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = "#32cd32";
  ctx.beginPath();
  ctx.ellipse(x + 3 * scale + sway * 0.3, y - 8 * scale, 4 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Petals
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const petalX = x + sway + Math.cos(angle) * 5 * scale;
    const petalY = y - 20 * scale + Math.sin(angle) * 5 * scale;
    ctx.beginPath();
    ctx.ellipse(petalX, petalY, 4 * scale, 2.5 * scale, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(x + sway, y - 20 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// BUILDING RENDERING
// ============================================================================

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string
): void {
  const wallColor = variant === "stone" ? "#a0a0a0" :
                    variant === "brick" ? "#b35c44" : "#d4b896";
  const roofColor = variant === "stone" ? "#606060" : "#8b4513";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 5 * scale, 25 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Building base (isometric)
  drawIsometricPrism(
    ctx, x, y,
    30 * scale, 30 * scale, 25 * scale,
    wallColor,
    darkenColor(wallColor, 30),
    darkenColor(wallColor, 15)
  );

  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x, y - 45 * scale);
  ctx.lineTo(x - 20 * scale, y - 25 * scale);
  ctx.lineTo(x, y - 20 * scale);
  ctx.lineTo(x + 20 * scale, y - 25 * scale);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(x - 4 * scale, y - 12 * scale, 8 * scale, 12 * scale);

  // Window
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(x + 6 * scale, y - 18 * scale, 6 * scale, 6 * scale);
  ctx.fillRect(x - 12 * scale, y - 18 * scale, 6 * scale, 6 * scale);
}

// ============================================================================
// STATUE RENDERING
// ============================================================================

function drawStatue(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string
): void {
  const stoneColor = variant === "bronze" ? "#cd7f32" :
                     variant === "gold" ? "#ffd700" : "#a0a0a0";

  // Pedestal
  ctx.fillStyle = "#808080";
  ctx.fillRect(x - 10 * scale, y - 5 * scale, 20 * scale, 5 * scale);
  ctx.fillStyle = "#606060";
  ctx.fillRect(x - 12 * scale, y, 24 * scale, 5 * scale);

  // Statue body
  ctx.fillStyle = stoneColor;
  ctx.beginPath();
  ctx.ellipse(x, y - 15 * scale, 8 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 30 * scale, 6 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = lightenColor(stoneColor, 40);
  ctx.beginPath();
  ctx.arc(x - 2 * scale, y - 32 * scale, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// LAMP RENDERING
// ============================================================================

function drawLamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
): void {
  const glowIntensity = 0.5 + Math.sin(time * 3) * 0.2;

  // Post
  ctx.fillStyle = "#333333";
  ctx.fillRect(x - 2 * scale, y - 30 * scale, 4 * scale, 30 * scale);

  // Lamp housing
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y - 30 * scale);
  ctx.lineTo(x - 6 * scale, y - 40 * scale);
  ctx.lineTo(x + 6 * scale, y - 40 * scale);
  ctx.lineTo(x + 8 * scale, y - 30 * scale);
  ctx.closePath();
  ctx.fill();

  // Light glow
  ctx.shadowColor = "#ffdd88";
  ctx.shadowBlur = 20 * scale * glowIntensity;
  ctx.fillStyle = `rgba(255, 220, 100, ${glowIntensity})`;
  ctx.beginPath();
  ctx.arc(x, y - 35 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Light cone
  ctx.fillStyle = `rgba(255, 220, 100, ${glowIntensity * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(x - 5 * scale, y - 30 * scale);
  ctx.lineTo(x - 15 * scale, y + 5 * scale);
  ctx.lineTo(x + 15 * scale, y + 5 * scale);
  ctx.lineTo(x + 5 * scale, y - 30 * scale);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// FENCE RENDERING
// ============================================================================

function drawFence(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string
): void {
  const fenceColor = variant === "iron" ? "#4a4a4a" : "#8b7355";
  const postCount = 3;

  for (let i = 0; i < postCount; i++) {
    const postX = x + (i - 1) * 12 * scale;

    // Post
    ctx.fillStyle = fenceColor;
    ctx.fillRect(postX - 2 * scale, y - 20 * scale, 4 * scale, 20 * scale);

    // Post cap
    if (variant === "iron") {
      ctx.beginPath();
      ctx.arc(postX, y - 22 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(postX, y - 25 * scale);
      ctx.lineTo(postX - 3 * scale, y - 20 * scale);
      ctx.lineTo(postX + 3 * scale, y - 20 * scale);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Horizontal bars
  ctx.fillStyle = fenceColor;
  ctx.fillRect(x - 18 * scale, y - 15 * scale, 36 * scale, 2 * scale);
  ctx.fillRect(x - 18 * scale, y - 8 * scale, 36 * scale, 2 * scale);
}

// ============================================================================
// WATER FEATURE RENDERING
// ============================================================================

function drawWaterFeature(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant?: string,
  time: number = 0
): void {
  if (variant === "fountain") {
    // Fountain base
    ctx.fillStyle = "#a0a0a0";
    ctx.beginPath();
    ctx.ellipse(x, y, 20 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water
    ctx.fillStyle = "rgba(100, 150, 220, 0.6)";
    ctx.beginPath();
    ctx.ellipse(x, y - 2 * scale, 16 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Central spout
    ctx.fillStyle = "#808080";
    ctx.fillRect(x - 3 * scale, y - 15 * scale, 6 * scale, 15 * scale);

    // Water spray
    ctx.fillStyle = `rgba(150, 200, 255, ${0.5 + Math.sin(time * 5) * 0.2})`;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time;
      const dropY = y - 20 * scale - Math.abs(Math.sin(time * 3 + i)) * 15 * scale;
      const dropX = x + Math.cos(angle) * 5 * scale;
      ctx.beginPath();
      ctx.ellipse(dropX, dropY, 2 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Pond
    ctx.fillStyle = "rgba(70, 130, 180, 0.7)";
    ctx.beginPath();
    ctx.ellipse(x, y, 25 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ripples
    ctx.strokeStyle = `rgba(150, 200, 255, ${0.3 + Math.sin(time * 2) * 0.2})`;
    ctx.lineWidth = 1.5 * scale;
    const rippleProgress = (time % 2) / 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 10 * scale * rippleProgress, 5 * scale * rippleProgress, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ============================================================================
// RUINS RENDERING
// ============================================================================

function drawRuins(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant?: string
): void {
  const stoneColor = "#a0a090";

  // Broken columns
  for (let i = 0; i < 3; i++) {
    const colX = x + (i - 1) * 15 * scale;
    const colHeight = (15 + Math.random() * 15) * scale;

    ctx.fillStyle = stoneColor;
    ctx.fillRect(colX - 4 * scale, y - colHeight, 8 * scale, colHeight);

    // Column top
    ctx.fillStyle = darkenColor(stoneColor, 20);
    ctx.beginPath();
    ctx.moveTo(colX - 5 * scale, y - colHeight);
    ctx.lineTo(colX, y - colHeight - 3 * scale);
    ctx.lineTo(colX + 5 * scale, y - colHeight);
    ctx.closePath();
    ctx.fill();
  }

  // Rubble
  ctx.fillStyle = darkenColor(stoneColor, 30);
  for (let i = 0; i < 5; i++) {
    const rubbleX = x + (Math.random() - 0.5) * 30 * scale;
    const rubbleY = y + (Math.random() - 0.5) * 10 * scale;
    ctx.beginPath();
    ctx.arc(rubbleX, rubbleY, (2 + Math.random() * 3) * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// CRATER RENDERING - Isometric holes with depth and variations
// ============================================================================

function drawCrater(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0,
  time: number = 0
): void {
  // Variant determines crater style:
  // 0: Standard crater - round impact hole
  // 1: Elongated crater - stretched impact
  // 2: Deep pit - darker, more dramatic
  // 3: Shallow depression - subtle ground damage
  
  const craterStyles = [
    { widthMult: 1.0, depthMult: 1.0, rimHeight: 0.3, name: "standard" },
    { widthMult: 1.4, depthMult: 0.7, rimHeight: 0.2, name: "elongated" },
    { widthMult: 0.85, depthMult: 1.3, rimHeight: 0.4, name: "deep" },
    { widthMult: 1.2, depthMult: 0.5, rimHeight: 0.15, name: "shallow" },
  ];
  
  const style = craterStyles[variant % craterStyles.length];
  
  // Base dimensions - isometric ratio (2:1 for proper perspective)
  const baseWidth = 18 * scale * style.widthMult;
  const baseDepth = baseWidth * 0.5; // Isometric foreshortening
  const craterDepth = 8 * scale * style.depthMult;
  const rimThickness = 4 * scale * style.rimHeight;
  
  // Slight rotation based on position for variety
  const rotationOffset = Math.sin(x * 0.01 + y * 0.02) * 0.15;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotationOffset);
  
  // === OUTER RIM / DISPLACED EARTH ===
  // Dirt pushed up around crater edges
  const rimGradient = ctx.createRadialGradient(0, 0, baseWidth * 0.6, 0, 0, baseWidth * 1.2);
  rimGradient.addColorStop(0, "rgba(90, 75, 55, 0)");
  rimGradient.addColorStop(0.5, "rgba(100, 85, 65, 0.4)");
  rimGradient.addColorStop(0.8, "rgba(80, 65, 45, 0.2)");
  rimGradient.addColorStop(1, "rgba(70, 55, 35, 0)");
  
  ctx.fillStyle = rimGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth * 1.3, baseDepth * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // === CRATER RIM HIGHLIGHT ===
  // Lit edge on the upper rim
  ctx.strokeStyle = `rgba(140, 125, 100, ${0.3 + style.rimHeight * 0.5})`;
  ctx.lineWidth = rimThickness;
  ctx.beginPath();
  ctx.ellipse(0, -rimThickness * 0.3, baseWidth, baseDepth, 0, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  
  // === MAIN CRATER HOLE ===
  // Dark interior with layered depth
  
  // Outer edge (lighter brown/earth)
  ctx.fillStyle = "#4a3d2e";
  ctx.beginPath();
  ctx.ellipse(0, 0, baseWidth, baseDepth, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mid layer (darker)
  const midWidth = baseWidth * 0.75;
  const midDepth = baseDepth * 0.75;
  ctx.fillStyle = "#3a2d1e";
  ctx.beginPath();
  ctx.ellipse(0, craterDepth * 0.15, midWidth, midDepth, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner shadow / deep hole
  const innerWidth = baseWidth * 0.5;
  const innerDepth = baseDepth * 0.5;
  const innerGradient = ctx.createRadialGradient(
    0, craterDepth * 0.25,
    0,
    0, craterDepth * 0.25,
    innerWidth
  );
  innerGradient.addColorStop(0, "#1a1510");
  innerGradient.addColorStop(0.6, "#2a2015");
  innerGradient.addColorStop(1, "#3a2d1e");
  
  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.ellipse(0, craterDepth * 0.25, innerWidth, innerDepth, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // === 3D DEPTH ILLUSION - Inner wall visible on far side ===
  // The "back wall" of the crater should be slightly visible
  ctx.fillStyle = "#4d3f30";
  ctx.beginPath();
  ctx.ellipse(0, -craterDepth * 0.1, baseWidth * 0.85, baseDepth * 0.4, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // === SHADOW INSIDE (bottom of crater) ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(innerWidth * 0.15, craterDepth * 0.3, innerWidth * 0.7, innerDepth * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // === SCATTERED DEBRIS / RUBBLE around edges ===
  const debrisCount = 4 + Math.floor(variant * 1.5);
  const seed = x * 73 + y * 137; // Deterministic randomness
  
  for (let i = 0; i < debrisCount; i++) {
    const angle = (i / debrisCount) * Math.PI * 2 + seed * 0.01;
    const dist = baseWidth * (0.9 + Math.sin(seed + i * 47) * 0.3);
    const debrisX = Math.cos(angle) * dist;
    const debrisY = Math.sin(angle) * dist * 0.5; // Isometric
    const debrisSize = (2 + Math.abs(Math.sin(seed + i * 31)) * 3) * scale;
    
    // Small rocks/dirt chunks
    ctx.fillStyle = `rgb(${85 + Math.floor(Math.sin(seed + i) * 20)}, ${70 + Math.floor(Math.cos(seed + i) * 15)}, ${50 + Math.floor(Math.sin(seed + i * 2) * 15)})`;
    ctx.beginPath();
    ctx.ellipse(debrisX, debrisY, debrisSize, debrisSize * 0.6, angle * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // === SUBTLE SMOKE/DUST for fresh craters (variant 2) ===
  if (variant === 2) {
    const smokeAlpha = 0.15 + Math.sin(time * 0.5) * 0.05;
    ctx.fillStyle = `rgba(60, 50, 40, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.sin(time) * 2 * scale,
      -craterDepth * 0.5 + Math.cos(time * 0.7) * scale,
      baseWidth * 0.6,
      baseDepth * 0.4,
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }
  
  ctx.restore();
}

// ============================================================================
// DEBRIS RENDERING - Scattered battlefield wreckage
// ============================================================================

function drawDebris(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const seed = x * 73 + y * 137;
  
  // Debris types: 0=wood splinters, 1=stone chunks, 2=metal scraps, 3=mixed
  const colors = [
    ["#6b5344", "#8b7355", "#5d4037"], // Wood
    ["#808080", "#a0a090", "#606060"], // Stone
    ["#5a5a5a", "#7a7a7a", "#4a4a4a"], // Metal
    ["#7a6a5a", "#8a8070", "#5a4a3a"], // Mixed
  ];
  const palette = colors[variant % colors.length];
  
  ctx.save();
  ctx.translate(x, y);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 3 * scale, 12 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Scattered pieces
  const pieceCount = 5 + (variant % 3);
  for (let i = 0; i < pieceCount; i++) {
    const angle = (seed + i * 67) % (Math.PI * 2);
    const dist = (3 + ((seed + i * 31) % 10)) * scale;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist * 0.5;
    const size = (3 + ((seed + i * 23) % 5)) * scale;
    const rotation = (seed + i * 41) % (Math.PI * 2);
    
    ctx.fillStyle = palette[i % palette.length];
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rotation);
    
    if (variant === 0) {
      // Wood splinters - elongated
      ctx.fillRect(-size, -size * 0.2, size * 2, size * 0.4);
    } else if (variant === 1) {
      // Stone chunks - angular
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, size * 0.3);
      ctx.lineTo(-size * 0.5, -size * 0.5);
      ctx.lineTo(size * 0.6, -size * 0.4);
      ctx.lineTo(size * 0.7, size * 0.4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Irregular shapes
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  ctx.restore();
}

// ============================================================================
// SKELETON RENDERING - Fallen warriors
// ============================================================================

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const boneColor = "#e8e0d0";
  const boneShade = "#c8c0b0";
  const seed = x * 73 + y * 137;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Pose variants: 0=lying flat, 1=reaching, 2=curled, 3=scattered
  const rotation = (variant === 3) ? 0 : ((seed % 4) - 2) * 0.3;
  ctx.rotate(rotation);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.ellipse(0, 2 * scale, 15 * scale, 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  if (variant === 3) {
    // Scattered bones
    for (let i = 0; i < 6; i++) {
      const bx = ((seed + i * 47) % 20 - 10) * scale;
      const by = ((seed + i * 31) % 10 - 5) * scale * 0.5;
      const boneRot = (seed + i * 23) % (Math.PI);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(boneRot);
      ctx.fillStyle = i % 2 === 0 ? boneColor : boneShade;
      ctx.fillRect(-4 * scale, -1 * scale, 8 * scale, 2 * scale);
      // Bone ends
      ctx.beginPath();
      ctx.arc(-4 * scale, 0, 1.5 * scale, 0, Math.PI * 2);
      ctx.arc(4 * scale, 0, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Ribcage
    ctx.fillStyle = boneShade;
    ctx.beginPath();
    ctx.ellipse(0, -2 * scale, 6 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ribs
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 1.5 * scale;
    for (let i = 0; i < 4; i++) {
      const ribY = -4 * scale + i * 2 * scale;
      ctx.beginPath();
      ctx.ellipse(0, ribY, 5 * scale, 1.5 * scale, 0, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
    
    // Skull
    ctx.fillStyle = boneColor;
    const skullY = -8 * scale;
    ctx.beginPath();
    ctx.ellipse(0, skullY, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye sockets
    ctx.fillStyle = "#2a2520";
    ctx.beginPath();
    ctx.ellipse(-1.5 * scale, skullY - 0.5 * scale, 1 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(1.5 * scale, skullY - 0.5 * scale, 1 * scale, 0.8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Limbs
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 2 * scale;
    
    // Arms
    if (variant === 1) {
      // Reaching pose
      ctx.beginPath();
      ctx.moveTo(-5 * scale, -2 * scale);
      ctx.lineTo(-12 * scale, -8 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5 * scale, -2 * scale);
      ctx.lineTo(10 * scale, 2 * scale);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-5 * scale, -2 * scale);
      ctx.lineTo(-10 * scale, 3 * scale);
      ctx.moveTo(5 * scale, -2 * scale);
      ctx.lineTo(10 * scale, 3 * scale);
      ctx.stroke();
    }
    
    // Legs
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 2 * scale);
    ctx.lineTo(-5 * scale, 10 * scale);
    ctx.moveTo(2 * scale, 2 * scale);
    ctx.lineTo(5 * scale, 10 * scale);
    ctx.stroke();
  }
  
  ctx.restore();
}

// ============================================================================
// BONES RENDERING - Scattered bone fragments
// ============================================================================

function drawBones(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const boneColor = "#e8e0d0";
  const boneShade = "#d0c8b8";
  const seed = x * 73 + y * 137;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 2 * scale, 10 * scale, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const boneCount = 3 + (variant % 3);
  for (let i = 0; i < boneCount; i++) {
    const bx = ((seed + i * 47) % 16 - 8) * scale;
    const by = ((seed + i * 31) % 8 - 4) * scale * 0.5;
    const boneLen = (4 + (seed + i * 13) % 4) * scale;
    const boneRot = ((seed + i * 23) % 180) * Math.PI / 180;
    
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(boneRot);
    
    // Bone shaft
    ctx.fillStyle = i % 2 === 0 ? boneColor : boneShade;
    ctx.fillRect(-boneLen, -0.8 * scale, boneLen * 2, 1.6 * scale);
    
    // Bone ends (knobby)
    ctx.beginPath();
    ctx.arc(-boneLen, 0, 1.8 * scale, 0, Math.PI * 2);
    ctx.arc(boneLen, 0, 1.8 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  ctx.restore();
}

// ============================================================================
// SWORD RENDERING - Fallen weapons
// ============================================================================

function drawSword(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const seed = x * 73 + y * 137;
  const rotation = ((seed % 360) - 180) * Math.PI / 180;
  
  // Variant: 0=steel, 1=bronze, 2=rusted, 3=broken
  const bladeColors = ["#c0c0c0", "#cd7f32", "#8b6914", "#a0a0a0"];
  const bladeColor = bladeColors[variant % bladeColors.length];
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 2 * scale, 12 * scale, 4 * scale, rotation, 0, Math.PI * 2);
  ctx.fill();
  
  const bladeLen = variant === 3 ? 8 * scale : 14 * scale;
  
  // Blade
  ctx.fillStyle = bladeColor;
  ctx.beginPath();
  ctx.moveTo(-bladeLen, 0);
  ctx.lineTo(-bladeLen + 3 * scale, -1.5 * scale);
  ctx.lineTo(bladeLen - 2 * scale, -0.5 * scale);
  ctx.lineTo(bladeLen, 0);
  ctx.lineTo(bladeLen - 2 * scale, 0.5 * scale);
  ctx.lineTo(-bladeLen + 3 * scale, 1.5 * scale);
  ctx.closePath();
  ctx.fill();
  
  // Blade highlight
  ctx.fillStyle = lightenColor(bladeColor, 30);
  ctx.beginPath();
  ctx.moveTo(-bladeLen + 3 * scale, -1 * scale);
  ctx.lineTo(bladeLen - 3 * scale, -0.3 * scale);
  ctx.lineTo(bladeLen - 3 * scale, 0);
  ctx.lineTo(-bladeLen + 3 * scale, 0);
  ctx.closePath();
  ctx.fill();
  
  // Guard
  ctx.fillStyle = "#8b7355";
  ctx.fillRect(-bladeLen - 1 * scale, -3 * scale, 2 * scale, 6 * scale);
  
  // Handle
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(-bladeLen - 6 * scale, -1.5 * scale, 5 * scale, 3 * scale);
  
  // Handle wrap
  ctx.strokeStyle = "#3d2017";
  ctx.lineWidth = 0.5 * scale;
  for (let i = 0; i < 4; i++) {
    const hx = -bladeLen - 5.5 * scale + i * 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(hx, -1.5 * scale);
    ctx.lineTo(hx, 1.5 * scale);
    ctx.stroke();
  }
  
  // Pommel
  ctx.fillStyle = "#cd853f";
  ctx.beginPath();
  ctx.arc(-bladeLen - 7 * scale, 0, 2 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Rust spots for variant 2
  if (variant === 2) {
    ctx.fillStyle = "rgba(139, 69, 19, 0.5)";
    for (let i = 0; i < 5; i++) {
      const rx = -bladeLen + 5 * scale + ((seed + i * 37) % 15) * scale * 0.8;
      const ry = ((seed + i * 23) % 3 - 1.5) * scale * 0.5;
      ctx.beginPath();
      ctx.arc(rx, ry, (1 + (seed + i) % 2) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// ============================================================================
// ARROW RENDERING - Fallen projectiles
// ============================================================================

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number = 0
): void {
  const seed = x * 73 + y * 137;
  const rotation = ((seed % 360) - 180) * Math.PI / 180;
  const stuck = variant % 2 === 0; // Stuck in ground or lying flat
  
  ctx.save();
  ctx.translate(x, y);
  
  if (stuck) {
    // Arrow stuck in ground at angle
    ctx.rotate(-0.3 + rotation * 0.3);
    
    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.ellipse(3 * scale, 4 * scale, 6 * scale, 2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Shaft (angled up)
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(-2 * scale, -12 * scale, 1.5 * scale, 14 * scale);
    
    // Fletching
    ctx.fillStyle = variant === 1 ? "#dc143c" : variant === 3 ? "#228b22" : "#f5f5dc";
    ctx.beginPath();
    ctx.moveTo(-2 * scale, -12 * scale);
    ctx.lineTo(-5 * scale, -10 * scale);
    ctx.lineTo(-2 * scale, -8 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.5 * scale, -12 * scale);
    ctx.lineTo(2.5 * scale, -10 * scale);
    ctx.lineTo(-0.5 * scale, -8 * scale);
    ctx.fill();
  } else {
    // Arrow lying flat
    ctx.rotate(rotation);
    
    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.beginPath();
    ctx.ellipse(0, 2 * scale, 10 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Shaft
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(-8 * scale, -0.5 * scale, 16 * scale, 1 * scale);
    
    // Arrowhead
    ctx.fillStyle = "#808080";
    ctx.beginPath();
    ctx.moveTo(10 * scale, 0);
    ctx.lineTo(8 * scale, -1.5 * scale);
    ctx.lineTo(8 * scale, 1.5 * scale);
    ctx.closePath();
    ctx.fill();
    
    // Fletching
    ctx.fillStyle = variant === 1 ? "#dc143c" : variant === 3 ? "#228b22" : "#f5f5dc";
    ctx.beginPath();
    ctx.moveTo(-8 * scale, 0);
    ctx.lineTo(-6 * scale, -2.5 * scale);
    ctx.lineTo(-4 * scale, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8 * scale, 0);
    ctx.lineTo(-6 * scale, 2.5 * scale);
    ctx.lineTo(-4 * scale, 0);
    ctx.fill();
  }
  
  ctx.restore();
}

// ============================================================================
// GENERIC DECORATION
// ============================================================================

function drawGenericDecoration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
): void {
  ctx.fillStyle = "#888888";
  ctx.beginPath();
  ctx.arc(x, y - 5 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();
}
