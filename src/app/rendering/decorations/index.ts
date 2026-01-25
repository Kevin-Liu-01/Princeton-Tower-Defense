// Princeton Tower Defense - Decorations Rendering Module
// Renders map decorations like trees, rocks, buildings, etc.

import type { Position, MapDecoration, DecorationCategory } from "../../types";
import { worldToScreen } from "../../utils";
import { lightenColor, darkenColor } from "../helpers";

// Import landmark renderers
import {
  drawPyramid,
  drawSphinx,
  drawNassauHall,
  drawIceFortress,
  drawObsidianCastle,
  drawWitchCottage,
} from "./landmarks";

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

  // Rock body
  ctx.fillStyle = rockColor;
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.lineTo(x - 8 * scale, y - 15 * scale);
  ctx.lineTo(x + 5 * scale, y - 18 * scale);
  ctx.lineTo(x + 14 * scale, y - 8 * scale);
  ctx.lineTo(x + 10 * scale, y);
  ctx.closePath();
  ctx.fill();

  // Darker side
  ctx.fillStyle = darkenColor(rockColor, 30);
  ctx.beginPath();
  ctx.moveTo(x + 5 * scale, y - 18 * scale);
  ctx.lineTo(x + 14 * scale, y - 8 * scale);
  ctx.lineTo(x + 10 * scale, y);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = lightenColor(rockColor, 30);
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y - 15 * scale);
  ctx.lineTo(x - 2 * scale, y - 12 * scale);
  ctx.lineTo(x - 4 * scale, y - 5 * scale);
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
