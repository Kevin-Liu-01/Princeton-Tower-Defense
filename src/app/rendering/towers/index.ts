// Tower Rendering Functions - Extracted from rendering/index.ts
import type { Tower, Enemy, DraggingTower, Position } from "../../types";
import { TILE_SIZE, TOWER_DATA, TOWER_COLORS } from "../../constants";
import { TOWER_STATS } from "../../constants/towerStats";
import { gridToWorld, worldToScreen, isValidBuildPosition, lightenColor, darkenColor } from "../../utils";
import { setShadowBlur, clearShadow } from "../performance";

function drawIsometricPrism(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  colors: {
    top: string;
    left: string;
    right: string;
    leftBack?: string;
    rightBack?: string;
  },
  zoom: number = 1
) {
  const w = width * zoom * 0.5;
  const d = depth * zoom * 0.25;
  const h = height * zoom;

  // Calculate vertices for isometric box
  const topCenter = { x, y: y - h };
  const topFront = { x, y: y - h + d };
  const topBack = { x, y: y - h - d };
  const topLeft = { x: x - w, y: y - h };
  const topRight = { x: x + w, y: y - h };
  const bottomFront = { x, y: y + d };
  const bottomBack = { x, y: y - d };
  const bottomLeft = { x: x - w, y };
  const bottomRight = { x: x + w, y };

  // Draw back faces first
  ctx.fillStyle = colors.leftBack || darkenColor(colors.left, -20);
  ctx.beginPath();
  ctx.moveTo(topBack.x, topBack.y);
  ctx.lineTo(topLeft.x, topLeft.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.lineTo(bottomBack.x, bottomBack.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = colors.rightBack || darkenColor(colors.right, -20);
  ctx.beginPath();
  ctx.moveTo(topBack.x, topBack.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(bottomBack.x, bottomBack.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Front-left wall
  ctx.fillStyle = colors.left;
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y);
  ctx.lineTo(topFront.x, topFront.y);
  ctx.lineTo(bottomFront.x, bottomFront.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Front-right wall
  ctx.fillStyle = colors.right;
  ctx.beginPath();
  ctx.moveTo(topRight.x, topRight.y);
  ctx.lineTo(topFront.x, topFront.y);
  ctx.lineTo(bottomFront.x, bottomFront.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top face
  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(topBack.x, topBack.y);
  ctx.lineTo(topLeft.x, topLeft.y);
  ctx.lineTo(topFront.x, topFront.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ============================================================================
// ENHANCED MECHANICAL HELPER FUNCTIONS - Moving parts, gears, steam, etc.
// ============================================================================

// Draw an animated rotating gear
function drawGear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  teeth: number,
  rotation: number,
  colors: { outer: string; inner: string; teeth: string; highlight: string },
  zoom: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Draw teeth
  ctx.fillStyle = colors.teeth;
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const toothWidth = (Math.PI / teeth) * 0.6;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle - toothWidth) * innerRadius * zoom,
      Math.sin(angle - toothWidth) * innerRadius * zoom * 0.5
    );
    ctx.lineTo(
      Math.cos(angle - toothWidth * 0.5) * outerRadius * zoom,
      Math.sin(angle - toothWidth * 0.5) * outerRadius * zoom * 0.5
    );
    ctx.lineTo(
      Math.cos(angle + toothWidth * 0.5) * outerRadius * zoom,
      Math.sin(angle + toothWidth * 0.5) * outerRadius * zoom * 0.5
    );
    ctx.lineTo(
      Math.cos(angle + toothWidth) * innerRadius * zoom,
      Math.sin(angle + toothWidth) * innerRadius * zoom * 0.5
    );
    ctx.closePath();
    ctx.fill();
  }

  // Gear body
  ctx.fillStyle = colors.outer;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    innerRadius * zoom,
    innerRadius * zoom * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Inner ring
  ctx.fillStyle = colors.inner;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    innerRadius * 0.6 * zoom,
    innerRadius * 0.6 * zoom * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Center hub
  ctx.fillStyle = colors.highlight;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    innerRadius * 0.25 * zoom,
    innerRadius * 0.25 * zoom * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Spokes
  ctx.strokeStyle = colors.teeth;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * innerRadius * 0.3 * zoom,
      Math.sin(angle) * innerRadius * 0.3 * zoom * 0.5
    );
    ctx.lineTo(
      Math.cos(angle) * innerRadius * 0.85 * zoom,
      Math.sin(angle) * innerRadius * 0.85 * zoom * 0.5
    );
    ctx.stroke();
  }

  ctx.restore();
}

// Draw animated steam/smoke effect
function drawSteamVent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  intensity: number,
  zoom: number,
  color: string = "rgba(200, 200, 200, "
) {
  const numPuffs = 4;
  for (let i = 0; i < numPuffs; i++) {
    const phase = (time * 2 + i * 0.3) % 1;
    const puffY = y - phase * 25 * zoom * intensity;
    const puffSize = (3 + phase * 4) * zoom * intensity;
    const alpha = (1 - phase) * 0.4;
    const drift = Math.sin(time * 3 + i) * 4 * zoom;

    ctx.fillStyle = `${color}${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x + drift, puffY, puffSize, puffSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw animated conveyor belt with items
function drawConveyorBelt(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  width: number,
  time: number,
  zoom: number,
  itemColor: string
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);

  // Belt track
  ctx.fillStyle = "#2a2a32";
  ctx.fillRect(0, -width * zoom * 0.5, length, width * zoom);

  // Belt segments (animated)
  ctx.fillStyle = "#3a3a42";
  const segmentWidth = 8 * zoom;
  const numSegments = Math.floor(length / segmentWidth) + 2;
  const offset = (time * 40 * zoom) % segmentWidth;

  for (let i = 0; i < numSegments; i++) {
    const segX = i * segmentWidth - offset;
    if (segX >= -segmentWidth && segX <= length) {
      ctx.fillRect(
        segX,
        -width * zoom * 0.4,
        segmentWidth * 0.6,
        width * zoom * 0.8
      );
    }
  }

  // Moving items (ammo boxes)
  const numItems = 2;
  for (let i = 0; i < numItems; i++) {
    const itemPhase = (time * 0.5 + i * 0.5) % 1;
    const itemX = itemPhase * length;

    ctx.fillStyle = itemColor;
    ctx.fillRect(
      itemX - 4 * zoom,
      -width * zoom * 0.35,
      8 * zoom,
      width * zoom * 0.7
    );

    // Item detail
    ctx.fillStyle = darkenColor(itemColor, 20);
    ctx.fillRect(
      itemX - 3 * zoom,
      -width * zoom * 0.25,
      2 * zoom,
      width * zoom * 0.5
    );
  }

  ctx.restore();
}

// Draw glowing energy tube/pipe
function drawEnergyTube(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  radius: number,
  time: number,
  zoom: number,
  color: string
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Tube body
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = radius * 2 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Inner glow
  const glowPulse = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.strokeStyle = color
    .replace(")", `, ${glowPulse})`)
    .replace("rgb", "rgba");
  ctx.lineWidth = radius * zoom;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Energy flow particles
  const numParticles = 3;
  for (let i = 0; i < numParticles; i++) {
    const phase = (time * 2 + i / numParticles) % 1;
    const px = startX + dx * phase;
    const py = startY + dy * phase;
    const alpha = Math.sin(phase * Math.PI) * 0.8;

    ctx.fillStyle = color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
    ctx.beginPath();
    ctx.arc(px, py, radius * 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw animated ammunition/supply box
function drawAmmoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  colors: { main: string; accent: string; label: string },
  zoom: number,
  bouncePhase: number = 0
) {
  const bounce = Math.sin(bouncePhase) * 2 * zoom;
  const boxY = y - bounce;

  // Box body (isometric)
  const hw = width * zoom * 0.5;
  const hd = depth * zoom * 0.25;
  const hh = height * zoom;

  // Left face
  ctx.fillStyle = darkenColor(colors.main, 15);
  ctx.beginPath();
  ctx.moveTo(x - hw, boxY);
  ctx.lineTo(x, boxY + hd);
  ctx.lineTo(x, boxY + hd - hh);
  ctx.lineTo(x - hw, boxY - hh);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = darkenColor(colors.main, 30);
  ctx.beginPath();
  ctx.moveTo(x + hw, boxY);
  ctx.lineTo(x, boxY + hd);
  ctx.lineTo(x, boxY + hd - hh);
  ctx.lineTo(x + hw, boxY - hh);
  ctx.closePath();
  ctx.fill();

  // Top face
  ctx.fillStyle = colors.main;
  ctx.beginPath();
  ctx.moveTo(x, boxY - hh - hd);
  ctx.lineTo(x - hw, boxY - hh);
  ctx.lineTo(x, boxY - hh + hd);
  ctx.lineTo(x + hw, boxY - hh);
  ctx.closePath();
  ctx.fill();

  // Warning stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - hw * 0.4, boxY - hh * 0.7, hw * 0.8, hh * 0.15);
}

// Draw pulsing warning light
function drawWarningLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  zoom: number,
  color: string,
  flashSpeed: number = 3
) {
  const flash = 0.5 + Math.sin(time * flashSpeed) * 0.5;

  // Glow
  setShadowBlur(ctx, 10 * zoom * flash, color);

  // Light body
  ctx.fillStyle = darkenColor(color, 30);
  ctx.beginPath();
  ctx.arc(x, y, radius * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Bright center
  ctx.fillStyle = color;
  ctx.globalAlpha = flash;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.7 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  clearShadow(ctx);
}

// Draw 3D isometric ammo box that rotates with cannon turret
function draw3DAmmoBox(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  size: 'small' | 'medium' | 'large' = 'medium'
) {
  // Size multipliers
  const sizeMultiplier = size === 'small' ? 0.7 : size === 'large' ? 1.2 : 1.0;
  
  const boxWidth = 16 * zoom * sizeMultiplier;
  const boxHeight = 22 * zoom * sizeMultiplier;
  const boxDepthSize = 10 * zoom * sizeMultiplier;
  
  // Calculate visibility and shading based on rotation
  const boxCos = Math.cos(rotation);
  const boxSin = Math.sin(rotation);
  const boxLightness = 0.4 + boxCos * 0.3;
  
  // === AMMO BOX BACK FACE (if visible) ===
  if (boxSin < 0.3) {
    const backColor = Math.floor(35 + boxLightness * 20);
    ctx.fillStyle = `rgb(${backColor}, ${backColor}, ${backColor + 8})`;
    ctx.beginPath();
    ctx.moveTo(centerX - boxWidth * 0.5, centerY - boxHeight * 0.5);
    ctx.lineTo(centerX - boxWidth * 0.5 - boxDepthSize * 0.5, centerY - boxHeight * 0.5 - boxDepthSize * 0.3);
    ctx.lineTo(centerX - boxWidth * 0.5 - boxDepthSize * 0.5, centerY + boxHeight * 0.5 - boxDepthSize * 0.3);
    ctx.lineTo(centerX - boxWidth * 0.5, centerY + boxHeight * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  
  // === AMMO BOX MAIN BODY (front face) ===
  const frontGrad = ctx.createLinearGradient(
    centerX - boxWidth * 0.5, centerY - boxHeight * 0.5,
    centerX + boxWidth * 0.5, centerY + boxHeight * 0.5
  );
  frontGrad.addColorStop(0, `rgb(${Math.floor(55 + boxLightness * 30)}, ${Math.floor(55 + boxLightness * 25)}, ${Math.floor(45 + boxLightness * 20)})`);
  frontGrad.addColorStop(0.5, `rgb(${Math.floor(45 + boxLightness * 25)}, ${Math.floor(45 + boxLightness * 20)}, ${Math.floor(35 + boxLightness * 15)})`);
  frontGrad.addColorStop(1, `rgb(${Math.floor(35 + boxLightness * 15)}, ${Math.floor(35 + boxLightness * 12)}, ${Math.floor(28 + boxLightness * 10)})`);
  ctx.fillStyle = frontGrad;
  ctx.beginPath();
  ctx.rect(centerX - boxWidth * 0.5, centerY - boxHeight * 0.5, boxWidth, boxHeight);
  ctx.fill();
  
  ctx.strokeStyle = `rgb(${Math.floor(70 + boxLightness * 30)}, ${Math.floor(70 + boxLightness * 25)}, ${Math.floor(60 + boxLightness * 20)})`;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  
  // === AMMO BOX TOP FACE ===
  const topColor = Math.floor(50 + boxLightness * 35);
  ctx.fillStyle = `rgb(${topColor + 10}, ${topColor + 8}, ${topColor})`;
  ctx.beginPath();
  ctx.moveTo(centerX - boxWidth * 0.5, centerY - boxHeight * 0.5);
  ctx.lineTo(centerX - boxWidth * 0.5 - boxDepthSize * 0.5, centerY - boxHeight * 0.5 - boxDepthSize * 0.3);
  ctx.lineTo(centerX + boxWidth * 0.5 - boxDepthSize * 0.5, centerY - boxHeight * 0.5 - boxDepthSize * 0.3);
  ctx.lineTo(centerX + boxWidth * 0.5, centerY - boxHeight * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgb(${topColor + 25}, ${topColor + 20}, ${topColor + 15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  
  // === AMMO BOX RIGHT SIDE FACE (if visible) ===
  if (boxSin > -0.3) {
    const sideColor = Math.floor(40 + boxLightness * 25);
    ctx.fillStyle = `rgb(${sideColor}, ${sideColor - 2}, ${sideColor - 5})`;
    ctx.beginPath();
    ctx.moveTo(centerX + boxWidth * 0.5, centerY - boxHeight * 0.5);
    ctx.lineTo(centerX + boxWidth * 0.5 - boxDepthSize * 0.5, centerY - boxHeight * 0.5 - boxDepthSize * 0.3);
    ctx.lineTo(centerX + boxWidth * 0.5 - boxDepthSize * 0.5, centerY + boxHeight * 0.5 - boxDepthSize * 0.3);
    ctx.lineTo(centerX + boxWidth * 0.5, centerY + boxHeight * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  
  // Metal corner reinforcements
  ctx.fillStyle = "#5a5a62";
  const corners = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]];
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(centerX + cx * boxWidth * 0.9, centerY + cy * boxHeight * 0.9, 2 * zoom * sizeMultiplier, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Handle on top
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 2.5 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.moveTo(centerX - 4 * zoom * sizeMultiplier, centerY - boxHeight * 0.5 - 1 * zoom);
  ctx.quadraticCurveTo(centerX, centerY - boxHeight * 0.5 - 6 * zoom * sizeMultiplier, centerX + 4 * zoom * sizeMultiplier, centerY - boxHeight * 0.5 - 1 * zoom);
  ctx.stroke();
  
  // "AMMO" label area
  ctx.fillStyle = "#1a1a1f";
  ctx.beginPath();
  ctx.rect(centerX - boxWidth * 0.35, centerY - 2 * zoom, boxWidth * 0.7, 6 * zoom * sizeMultiplier);
  ctx.fill();
  
  // Warning stripes
  ctx.fillStyle = `rgba(180, 140, 40, ${0.6 + boxLightness * 0.3})`;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.rect(centerX - boxWidth * 0.28 + i * 5 * zoom * sizeMultiplier, centerY - 0.5 * zoom, 2.5 * zoom * sizeMultiplier, 3 * zoom * sizeMultiplier);
    ctx.fill();
  }
  
  // Latch detail
  ctx.fillStyle = "#8a8a92";
  ctx.beginPath();
  ctx.rect(centerX - 2.5 * zoom * sizeMultiplier, centerY - boxHeight * 0.5 + 2 * zoom, 5 * zoom * sizeMultiplier, 3 * zoom * sizeMultiplier);
  ctx.fill();
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.arc(centerX, centerY - boxHeight * 0.5 + 3.5 * zoom, 1.2 * zoom * sizeMultiplier, 0, Math.PI * 2);
  ctx.fill();
  
  // Bullet count indicator
  const indicatorGlow = 0.5 + attackPulse * 0.5 + Math.sin(time * 5) * 0.1;
  ctx.fillStyle = `rgba(50, 180, 50, ${indicatorGlow})`;
  ctx.beginPath();
  ctx.arc(centerX + boxWidth * 0.3, centerY + boxHeight * 0.3, 2.5 * zoom * sizeMultiplier, 0, Math.PI * 2);
  ctx.fill();
}

// Draw 3D isometric armor plate with ID number
function draw3DArmorPlate(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotation: number,
  zoom: number,
  towerId: number | string,
  size: 'small' | 'medium' | 'large' = 'medium'
) {
  // Size multipliers
  const sizeMultiplier = size === 'small' ? 0.7 : size === 'large' ? 1.2 : 1.0;
  
  const plateWidth = 14 * zoom * sizeMultiplier;
  const plateHeight = 18 * zoom * sizeMultiplier;
  const plateDepthSize = 7 * zoom * sizeMultiplier;
  
  // Calculate visibility and shading based on rotation
  const plateCos = Math.cos(rotation);
  const plateSin = Math.sin(rotation);
  const plateLightness = 0.4 + plateCos * 0.3;
  
  // === ARMOR PLATE BACK FACE ===
  if (plateSin < 0.3) {
    const backColor = Math.floor(40 + plateLightness * 20);
    ctx.fillStyle = `rgb(${backColor}, ${backColor}, ${backColor + 5})`;
    ctx.beginPath();
    ctx.moveTo(centerX - plateWidth * 0.5, centerY - plateHeight * 0.5);
    ctx.lineTo(centerX - plateWidth * 0.5 - plateDepthSize * 0.4, centerY - plateHeight * 0.5 - plateDepthSize * 0.25);
    ctx.lineTo(centerX - plateWidth * 0.5 - plateDepthSize * 0.4, centerY + plateHeight * 0.5 - plateDepthSize * 0.25);
    ctx.lineTo(centerX - plateWidth * 0.5, centerY + plateHeight * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  
  // === ARMOR PLATE MAIN FACE ===
  const plateGrad = ctx.createLinearGradient(
    centerX - plateWidth * 0.5, centerY - plateHeight * 0.5,
    centerX + plateWidth * 0.5, centerY + plateHeight * 0.5
  );
  plateGrad.addColorStop(0, `rgb(${Math.floor(70 + plateLightness * 35)}, ${Math.floor(70 + plateLightness * 30)}, ${Math.floor(65 + plateLightness * 25)})`);
  plateGrad.addColorStop(0.5, `rgb(${Math.floor(55 + plateLightness * 30)}, ${Math.floor(55 + plateLightness * 25)}, ${Math.floor(50 + plateLightness * 20)})`);
  plateGrad.addColorStop(1, `rgb(${Math.floor(45 + plateLightness * 20)}, ${Math.floor(45 + plateLightness * 15)}, ${Math.floor(40 + plateLightness * 12)})`);
  ctx.fillStyle = plateGrad;
  
  // Rounded rectangle shape for plate
  const radius = 3 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.moveTo(centerX - plateWidth * 0.5 + radius, centerY - plateHeight * 0.5);
  ctx.lineTo(centerX + plateWidth * 0.5 - radius, centerY - plateHeight * 0.5);
  ctx.quadraticCurveTo(centerX + plateWidth * 0.5, centerY - plateHeight * 0.5, centerX + plateWidth * 0.5, centerY - plateHeight * 0.5 + radius);
  ctx.lineTo(centerX + plateWidth * 0.5, centerY + plateHeight * 0.5 - radius);
  ctx.quadraticCurveTo(centerX + plateWidth * 0.5, centerY + plateHeight * 0.5, centerX + plateWidth * 0.5 - radius, centerY + plateHeight * 0.5);
  ctx.lineTo(centerX - plateWidth * 0.5 + radius, centerY + plateHeight * 0.5);
  ctx.quadraticCurveTo(centerX - plateWidth * 0.5, centerY + plateHeight * 0.5, centerX - plateWidth * 0.5, centerY + plateHeight * 0.5 - radius);
  ctx.lineTo(centerX - plateWidth * 0.5, centerY - plateHeight * 0.5 + radius);
  ctx.quadraticCurveTo(centerX - plateWidth * 0.5, centerY - plateHeight * 0.5, centerX - plateWidth * 0.5 + radius, centerY - plateHeight * 0.5);
  ctx.closePath();
  ctx.fill();
  
  // Plate edge
  ctx.strokeStyle = `rgb(${Math.floor(85 + plateLightness * 35)}, ${Math.floor(85 + plateLightness * 30)}, ${Math.floor(80 + plateLightness * 25)})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  
  // === ARMOR PLATE TOP FACE ===
  const topPlateColor = Math.floor(60 + plateLightness * 30);
  ctx.fillStyle = `rgb(${topPlateColor + 15}, ${topPlateColor + 12}, ${topPlateColor + 8})`;
  ctx.beginPath();
  ctx.moveTo(centerX - plateWidth * 0.5 + radius, centerY - plateHeight * 0.5);
  ctx.lineTo(centerX - plateWidth * 0.5 + radius - plateDepthSize * 0.4, centerY - plateHeight * 0.5 - plateDepthSize * 0.25);
  ctx.lineTo(centerX + plateWidth * 0.5 - radius - plateDepthSize * 0.4, centerY - plateHeight * 0.5 - plateDepthSize * 0.25);
  ctx.lineTo(centerX + plateWidth * 0.5 - radius, centerY - plateHeight * 0.5);
  ctx.closePath();
  ctx.fill();
  
  // === PLATE RIGHT SIDE FACE ===
  if (plateSin > -0.3) {
    const sideColor = Math.floor(50 + plateLightness * 25);
    ctx.fillStyle = `rgb(${sideColor}, ${sideColor - 3}, ${sideColor - 6})`;
    ctx.beginPath();
    ctx.moveTo(centerX + plateWidth * 0.5, centerY - plateHeight * 0.5 + radius);
    ctx.lineTo(centerX + plateWidth * 0.5 - plateDepthSize * 0.4, centerY - plateHeight * 0.5 + radius - plateDepthSize * 0.25);
    ctx.lineTo(centerX + plateWidth * 0.5 - plateDepthSize * 0.4, centerY + plateHeight * 0.5 - radius - plateDepthSize * 0.25);
    ctx.lineTo(centerX + plateWidth * 0.5, centerY + plateHeight * 0.5 - radius);
    ctx.closePath();
    ctx.fill();
  }
  
  // Rivets on corners
  ctx.fillStyle = "#7a7a82";
  const rivetOffsets = [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]];
  for (const [rx, ry] of rivetOffsets) {
    ctx.beginPath();
    ctx.arc(centerX + rx * plateWidth * 0.85, centerY + ry * plateHeight * 0.85, 1.5 * zoom * sizeMultiplier, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Inner darker area for number
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 5 * zoom * sizeMultiplier, 0, Math.PI * 2);
  ctx.fill();
  
  // Number on plate (stenciled style) - generate unique number from towerId
  // Use a simple hash to get variety from any ID format
  let hashValue: number;
  if (typeof towerId === 'number' && !isNaN(towerId) && towerId !== 0) {
    hashValue = towerId;
  } else {
    // Hash the string representation for unique numbers
    hashValue = Math.abs(String(towerId).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0));
  }
  const plateNumber = ((hashValue * 7 + 13) % 90) + 10;
  ctx.font = `bold ${7 * zoom * sizeMultiplier}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `rgba(220, 200, 150, ${0.7 + plateLightness * 0.3})`;
  ctx.fillText(String(plateNumber), centerX, centerY + 0.5 * zoom);
  
  // Battle damage scratches
  ctx.strokeStyle = `rgba(30, 30, 35, ${0.4 + plateLightness * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(centerX - 3 * zoom, centerY - 5 * zoom);
  ctx.lineTo(centerX - 1 * zoom, centerY - 2 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 2 * zoom, centerY + 3 * zoom);
  ctx.lineTo(centerX + 4 * zoom, centerY + 6 * zoom);
  ctx.stroke();
}

// Draw 3D isometric fuel barrel that rotates with flamethrower turret
function draw3DFuelTank(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  size: 'small' | 'medium' | 'large' = 'medium'
) {
  // Size multipliers
  const sizeMultiplier = size === 'small' ? 0.75 : size === 'large' ? 1.2 : 1.0;
  
  // Barrel dimensions (cylindrical shape)
  const barrelRadius = 8 * zoom * sizeMultiplier;
  const barrelHeight = 22 * zoom * sizeMultiplier;
  const ellipseRatio = 0.4; // Isometric squish for top/bottom ellipses
  
  // Calculate shading based on rotation
  const tankCos = Math.cos(rotation);
  const lightness = 0.5 + tankCos * 0.25;
  
  // === BARREL BODY (cylinder) ===
  // Main red barrel gradient - cylindrical shading
  const barrelGrad = ctx.createLinearGradient(
    centerX - barrelRadius, centerY,
    centerX + barrelRadius, centerY
  );
  barrelGrad.addColorStop(0, `rgb(${Math.floor(120 * lightness)}, ${Math.floor(25 * lightness)}, ${Math.floor(20 * lightness)})`);
  barrelGrad.addColorStop(0.2, `rgb(${Math.floor(180 * lightness)}, ${Math.floor(35 * lightness)}, ${Math.floor(25 * lightness)})`);
  barrelGrad.addColorStop(0.5, `rgb(${Math.floor(200 * lightness)}, ${Math.floor(45 * lightness)}, ${Math.floor(30 * lightness)})`);
  barrelGrad.addColorStop(0.7, `rgb(${Math.floor(170 * lightness)}, ${Math.floor(35 * lightness)}, ${Math.floor(25 * lightness)})`);
  barrelGrad.addColorStop(1, `rgb(${Math.floor(100 * lightness)}, ${Math.floor(20 * lightness)}, ${Math.floor(15 * lightness)})`);
  
  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(centerX - barrelRadius, centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio);
  ctx.lineTo(centerX - barrelRadius, centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio);
  ctx.quadraticCurveTo(centerX - barrelRadius, centerY + barrelHeight * 0.5, centerX, centerY + barrelHeight * 0.5 + barrelRadius * ellipseRatio);
  ctx.quadraticCurveTo(centerX + barrelRadius, centerY + barrelHeight * 0.5, centerX + barrelRadius, centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio);
  ctx.lineTo(centerX + barrelRadius, centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio);
  ctx.closePath();
  ctx.fill();
  
  // === HAZARD STRIPES (yellow/black diagonal) ===
  // Draw hazard band in the middle
  const bandY = centerY;
  const bandHeight = 8 * zoom * sizeMultiplier;
  
  // Black background for hazard band
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.rect(centerX - barrelRadius, bandY - bandHeight * 0.5, barrelRadius * 2, bandHeight);
  ctx.fill();
  
  // Yellow diagonal stripes
  ctx.save();
  ctx.beginPath();
  ctx.rect(centerX - barrelRadius, bandY - bandHeight * 0.5, barrelRadius * 2, bandHeight);
  ctx.clip();
  
  ctx.fillStyle = "#ffcc00";
  const stripeWidth = 4 * zoom * sizeMultiplier;
  const stripeSpacing = 6 * zoom * sizeMultiplier;
  for (let i = -6; i < 8; i++) {
    const x = centerX - barrelRadius + i * stripeSpacing;
    ctx.beginPath();
    ctx.moveTo(x, bandY - bandHeight * 0.5);
    ctx.lineTo(x + stripeWidth, bandY - bandHeight * 0.5);
    ctx.lineTo(x + stripeWidth + bandHeight, bandY + bandHeight * 0.5);
    ctx.lineTo(x + bandHeight, bandY + bandHeight * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  
  // === METAL BANDS (top and bottom rings) ===
  const ringColor = `rgb(${Math.floor(90 * lightness)}, ${Math.floor(90 * lightness)}, ${Math.floor(95 * lightness)})`;
  const ringHighlight = `rgb(${Math.floor(140 * lightness)}, ${Math.floor(140 * lightness)}, ${Math.floor(145 * lightness)})`;
  
  // Top ring
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 3 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.moveTo(centerX - barrelRadius, centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 2 * zoom);
  ctx.lineTo(centerX + barrelRadius, centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 2 * zoom);
  ctx.stroke();
  
  // Top ring highlight
  ctx.strokeStyle = ringHighlight;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(centerX - barrelRadius * 0.8, centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 1 * zoom);
  ctx.lineTo(centerX + barrelRadius * 0.3, centerY - barrelHeight * 0.5 + barrelRadius * ellipseRatio + 1 * zoom);
  ctx.stroke();
  
  // Bottom ring
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 3 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.moveTo(centerX - barrelRadius, centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio - 2 * zoom);
  ctx.lineTo(centerX + barrelRadius, centerY + barrelHeight * 0.5 - barrelRadius * ellipseRatio - 2 * zoom);
  ctx.stroke();
  
  // === BARREL TOP (ellipse lid) ===
  // Top ellipse shadow
  ctx.fillStyle = `rgb(${Math.floor(80 * lightness)}, ${Math.floor(20 * lightness)}, ${Math.floor(15 * lightness)})`;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - barrelHeight * 0.5, barrelRadius, barrelRadius * ellipseRatio, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Top ellipse main
  const topGrad = ctx.createRadialGradient(
    centerX - barrelRadius * 0.3, centerY - barrelHeight * 0.5 - barrelRadius * ellipseRatio * 0.3, 0,
    centerX, centerY - barrelHeight * 0.5, barrelRadius
  );
  topGrad.addColorStop(0, `rgb(${Math.floor(220 * lightness)}, ${Math.floor(55 * lightness)}, ${Math.floor(40 * lightness)})`);
  topGrad.addColorStop(0.5, `rgb(${Math.floor(180 * lightness)}, ${Math.floor(40 * lightness)}, ${Math.floor(30 * lightness)})`);
  topGrad.addColorStop(1, `rgb(${Math.floor(140 * lightness)}, ${Math.floor(30 * lightness)}, ${Math.floor(22 * lightness)})`);
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - barrelHeight * 0.5, barrelRadius * 0.95, barrelRadius * ellipseRatio * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Top rim
  ctx.strokeStyle = `rgb(${Math.floor(100 * lightness)}, ${Math.floor(100 * lightness)}, ${Math.floor(105 * lightness)})`;
  ctx.lineWidth = 2 * zoom * sizeMultiplier;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - barrelHeight * 0.5, barrelRadius, barrelRadius * ellipseRatio, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // === BARREL CAP/BUNG ===
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - barrelHeight * 0.5, 3 * zoom * sizeMultiplier, 1.5 * zoom * sizeMultiplier, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.arc(centerX, centerY - barrelHeight * 0.5, 1.5 * zoom * sizeMultiplier, 0, Math.PI * 2);
  ctx.fill();
  
  // === FLAMMABLE SYMBOL ===
  // Small flame icon on front
  const flameX = centerX;
  const flameY = centerY - barrelHeight * 0.25;
  const flameGlow = 0.6 + attackPulse * 0.3 + Math.sin(time * 4) * 0.1;
  
  ctx.fillStyle = `rgba(255, 200, 50, ${flameGlow})`;
  ctx.beginPath();
  ctx.moveTo(flameX, flameY - 4 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(flameX + 3 * zoom * sizeMultiplier, flameY - 2 * zoom * sizeMultiplier, flameX + 2 * zoom * sizeMultiplier, flameY + 2 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(flameX + 1 * zoom * sizeMultiplier, flameY + 1 * zoom * sizeMultiplier, flameX, flameY + 3 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(flameX - 1 * zoom * sizeMultiplier, flameY + 1 * zoom * sizeMultiplier, flameX - 2 * zoom * sizeMultiplier, flameY + 2 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(flameX - 3 * zoom * sizeMultiplier, flameY - 2 * zoom * sizeMultiplier, flameX, flameY - 4 * zoom * sizeMultiplier);
  ctx.fill();
  
  // Inner flame
  ctx.fillStyle = `rgba(255, 100, 30, ${flameGlow})`;
  ctx.beginPath();
  ctx.moveTo(flameX, flameY - 2 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(flameX + 1.5 * zoom * sizeMultiplier, flameY, flameX + 1 * zoom * sizeMultiplier, flameY + 1.5 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(flameX, flameY + 1 * zoom * sizeMultiplier, flameX - 1 * zoom * sizeMultiplier, flameY + 1.5 * zoom * sizeMultiplier);
  ctx.quadraticCurveTo(flameX - 1.5 * zoom * sizeMultiplier, flameY, flameX, flameY - 2 * zoom * sizeMultiplier);
  ctx.fill();
}

// Draw fuel feeding tube connecting tank to flamethrower turret
function drawFuelFeedingTube(
  ctx: CanvasRenderingContext2D,
  tankCenterX: number,
  tankCenterY: number,
  turretX: number,
  turretY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  tankSide: number
) {
  // Tube shake animation when firing - more intense vibration
  const shakeIntensity = isAttacking ? attackPulse : 0;
  const tubeShakeX = shakeIntensity * Math.sin(time * 80) * 2 * zoom;
  const tubeShakeY = shakeIntensity * Math.cos(time * 60) * 1.5 * zoom;
  
  // Tube exit point from fuel tank - with connector offset
  const tubeExitX = tankCenterX + (tankSide > 0 ? -6 : 6) * zoom;
  const tubeExitY = tankCenterY - 4 * zoom;
  
  // Tube entry point to turret feed mechanism
  const tubeEntryX = turretX - 4 * zoom + tubeShakeX;
  const tubeEntryY = turretY - 4 * zoom + tubeShakeY;
  
  // Multiple control points for a more natural curve
  const tubeMid1X = tubeExitX + (tankSide > 0 ? -8 : 8) * zoom;
  const tubeMid1Y = tubeExitY - 6 * zoom;
  const tubeMid2X = (tubeExitX + tubeEntryX) * 0.5 + Math.cos(rotation) * 12 * zoom;
  const tubeMid2Y = (tubeExitY + tubeEntryY) * 0.5 - 10 * zoom + Math.sin(rotation) * 6 * zoom;
  
  // Helper function to get point on bezier curve
  const getBezierPoint = (t: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return {
      x: mt3 * tubeExitX + 3 * mt2 * t * tubeMid1X + 3 * mt * t2 * tubeMid2X + t3 * tubeEntryX,
      y: mt3 * tubeExitY + 3 * mt2 * t * tubeMid1Y + 3 * mt * t2 * tubeMid2Y + t3 * tubeEntryY
    };
  };
  
  // Helper to get tangent at point
  const getBezierTangent = (t: number) => {
    const mt = 1 - t;
    const dx = 3 * mt * mt * (tubeMid1X - tubeExitX) + 6 * mt * t * (tubeMid2X - tubeMid1X) + 3 * t * t * (tubeEntryX - tubeMid2X);
    const dy = 3 * mt * mt * (tubeMid1Y - tubeExitY) + 6 * mt * t * (tubeMid2Y - tubeMid1Y) + 3 * t * t * (tubeEntryY - tubeMid2Y);
    return Math.atan2(dy, dx);
  };
  
  // === OUTER REINFORCED HOSE CASING ===
  // Shadow/depth layer
  ctx.strokeStyle = "#1a1a22";
  ctx.lineWidth = 9 * zoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY + 1 * zoom);
  ctx.bezierCurveTo(tubeMid1X, tubeMid1Y + 1 * zoom, tubeMid2X, tubeMid2Y + 1 * zoom, tubeEntryX, tubeEntryY + 1 * zoom);
  ctx.stroke();
  
  // Main hose body - dark rubber with metallic sheen
  const hoseGrad = ctx.createLinearGradient(tubeExitX, tubeExitY - 4 * zoom, tubeEntryX, tubeEntryY + 4 * zoom);
  hoseGrad.addColorStop(0, "#3a3a42");
  hoseGrad.addColorStop(0.3, "#4a4a52");
  hoseGrad.addColorStop(0.5, "#5a5a62");
  hoseGrad.addColorStop(0.7, "#4a4a52");
  hoseGrad.addColorStop(1, "#3a3a42");
  ctx.strokeStyle = hoseGrad;
  ctx.lineWidth = 7 * zoom;
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY);
  ctx.bezierCurveTo(tubeMid1X, tubeMid1Y, tubeMid2X, tubeMid2Y, tubeEntryX, tubeEntryY);
  ctx.stroke();
  
  // Inner darker core (fuel channel)
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = 4.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY);
  ctx.bezierCurveTo(tubeMid1X, tubeMid1Y, tubeMid2X, tubeMid2Y, tubeEntryX, tubeEntryY);
  ctx.stroke();
  
  // Highlight strip on top of hose
  ctx.strokeStyle = "rgba(120, 120, 130, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY - 2.5 * zoom);
  ctx.bezierCurveTo(tubeMid1X, tubeMid1Y - 2.5 * zoom, tubeMid2X, tubeMid2Y - 2.5 * zoom, tubeEntryX, tubeEntryY - 2.5 * zoom);
  ctx.stroke();
  
  // === BRAIDED REINFORCEMENT PATTERN ===
  const braidSegments = 12;
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < braidSegments; i++) {
    const t1 = i / braidSegments;
    const t2 = (i + 0.5) / braidSegments;
    const p1 = getBezierPoint(t1);
    const p2 = getBezierPoint(t2);
    const angle1 = getBezierTangent(t1);
    const angle2 = getBezierTangent(t2);
    
    // Cross pattern
    const offset = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(p1.x + Math.cos(angle1 + Math.PI/2) * offset, p1.y + Math.sin(angle1 + Math.PI/2) * offset * 0.5);
    ctx.lineTo(p2.x + Math.cos(angle2 - Math.PI/2) * offset, p2.y + Math.sin(angle2 - Math.PI/2) * offset * 0.5);
    ctx.stroke();
  }
  
  // === FUEL FLOW ANIMATION ===
  // Animated fuel particles flowing through the tube
  const fuelParticleCount = 8;
  const baseGlow = 0.3 + Math.sin(time * 4) * 0.1;
  const flowGlow = isAttacking ? 0.8 + attackPulse * 0.2 : baseGlow;
  
  for (let i = 0; i < fuelParticleCount; i++) {
    // Particles flow faster when attacking
    const flowSpeed = isAttacking ? time * 3 + attackPulse * 2 : time * 0.8;
    const particleT = ((i / fuelParticleCount) + flowSpeed) % 1;
    const particle = getBezierPoint(particleT);
    
    // Fuel particle glow
    const particleSize = (1.5 + Math.sin(time * 10 + i) * 0.5) * zoom;
    const particleAlpha = flowGlow * (0.6 + Math.sin(time * 8 + i * 0.7) * 0.2);
    
    // Outer glow
    const glowGrad = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particleSize * 2);
    glowGrad.addColorStop(0, `rgba(255, 150, 50, ${particleAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 100, 30, ${particleAlpha * 0.5})`);
    glowGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particleSize * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright core
    ctx.fillStyle = `rgba(255, 200, 100, ${particleAlpha * 1.2})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particleSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // === HEAVY-DUTY METAL CLAMPS ===
  const clampCount = 5;
  for (let i = 0; i < clampCount; i++) {
    const t = (i + 0.5) / clampCount;
    const clampPos = getBezierPoint(t);
    const clampAngle = getBezierTangent(t);
    
    // Clamp perpendicular offset
    const perpX = Math.cos(clampAngle + Math.PI/2);
    const perpY = Math.sin(clampAngle + Math.PI/2);
    
    // Clamp band shadow
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.ellipse(clampPos.x, clampPos.y + 1 * zoom, 4.5 * zoom, 2.5 * zoom, clampAngle, 0, Math.PI * 2);
    ctx.fill();
    
    // Clamp band - metallic
    const clampGrad = ctx.createLinearGradient(
      clampPos.x - perpX * 4 * zoom, clampPos.y - perpY * 4 * zoom,
      clampPos.x + perpX * 4 * zoom, clampPos.y + perpY * 4 * zoom
    );
    clampGrad.addColorStop(0, "#5a5a62");
    clampGrad.addColorStop(0.3, "#8a8a92");
    clampGrad.addColorStop(0.5, "#9a9aa2");
    clampGrad.addColorStop(0.7, "#8a8a92");
    clampGrad.addColorStop(1, "#5a5a62");
    ctx.fillStyle = clampGrad;
    ctx.beginPath();
    ctx.ellipse(clampPos.x, clampPos.y, 4 * zoom, 2 * zoom, clampAngle, 0, Math.PI * 2);
    ctx.fill();
    
    // Clamp bolt
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(clampPos.x + perpX * 2.5 * zoom, clampPos.y + perpY * 2.5 * zoom * 0.5, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(clampPos.x + perpX * 2.5 * zoom - 0.3 * zoom, clampPos.y + perpY * 2.5 * zoom * 0.5 - 0.3 * zoom, 0.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // === TANK-SIDE CONNECTOR (heavy duty fitting) ===
  // Connector base shadow
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(tubeExitX, tubeExitY + 1.5 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Connector housing
  const connectorGrad1 = ctx.createRadialGradient(
    tubeExitX - 2 * zoom, tubeExitY - 2 * zoom, 0,
    tubeExitX, tubeExitY, 6 * zoom
  );
  connectorGrad1.addColorStop(0, "#7a7a82");
  connectorGrad1.addColorStop(0.5, "#5a5a62");
  connectorGrad1.addColorStop(1, "#3a3a42");
  ctx.fillStyle = connectorGrad1;
  ctx.beginPath();
  ctx.arc(tubeExitX, tubeExitY, 5.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Connector ring
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(tubeExitX, tubeExitY, 4 * zoom, 0, Math.PI * 2);
  ctx.stroke();
  
  // Hex bolt pattern
  for (let i = 0; i < 6; i++) {
    const boltAngle = (i / 6) * Math.PI * 2 + rotation * 0.5;
    const boltX = tubeExitX + Math.cos(boltAngle) * 3.5 * zoom;
    const boltY = tubeExitY + Math.sin(boltAngle) * 3.5 * zoom * 0.6;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(boltX, boltY, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Quick-release lever
  const leverAngle = Math.PI * 0.3;
  ctx.strokeStyle = "#cc3030";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tubeExitX, tubeExitY);
  ctx.lineTo(tubeExitX + Math.cos(leverAngle) * 8 * zoom, tubeExitY + Math.sin(leverAngle) * 4 * zoom);
  ctx.stroke();
  ctx.fillStyle = "#aa2020";
  ctx.beginPath();
  ctx.arc(tubeExitX + Math.cos(leverAngle) * 8 * zoom, tubeExitY + Math.sin(leverAngle) * 4 * zoom, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // === TURRET-SIDE CONNECTOR (feed mechanism) ===
  // Connector shadow
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY + 1 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Feed mechanism housing
  const connectorGrad2 = ctx.createRadialGradient(
    tubeEntryX - 1.5 * zoom, tubeEntryY - 1.5 * zoom, 0,
    tubeEntryX, tubeEntryY, 5 * zoom
  );
  connectorGrad2.addColorStop(0, "#6a6a72");
  connectorGrad2.addColorStop(0.5, "#4a4a52");
  connectorGrad2.addColorStop(1, "#3a3a42");
  ctx.fillStyle = connectorGrad2;
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY, 4.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner fuel inlet (glows when active)
  const inletGlow = isAttacking ? 0.8 + attackPulse * 0.2 : 0.3 + Math.sin(time * 3) * 0.1;
  ctx.fillStyle = `rgba(40, 30, 25, 1)`;
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Fuel glow in inlet
  const inletGlowGrad = ctx.createRadialGradient(tubeEntryX, tubeEntryY, 0, tubeEntryX, tubeEntryY, 2.5 * zoom);
  inletGlowGrad.addColorStop(0, `rgba(255, 150, 50, ${inletGlow})`);
  inletGlowGrad.addColorStop(0.5, `rgba(255, 100, 30, ${inletGlow * 0.6})`);
  inletGlowGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
  ctx.fillStyle = inletGlowGrad;
  ctx.beginPath();
  ctx.arc(tubeEntryX, tubeEntryY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Pressure valve (red safety valve)
  const valveX = tubeEntryX + 3 * zoom;
  const valveY = tubeEntryY - 3 * zoom;
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(valveX, valveY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  const valveGrad = ctx.createRadialGradient(valveX - 0.5 * zoom, valveY - 0.5 * zoom, 0, valveX, valveY, 2 * zoom);
  valveGrad.addColorStop(0, "#ee4040");
  valveGrad.addColorStop(0.5, "#cc2020");
  valveGrad.addColorStop(1, "#881010");
  ctx.fillStyle = valveGrad;
  ctx.beginPath();
  ctx.arc(valveX, valveY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Valve highlight
  ctx.fillStyle = "rgba(255, 150, 150, 0.4)";
  ctx.beginPath();
  ctx.arc(valveX - 0.5 * zoom, valveY - 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Warning indicator light (blinks faster when attacking)
  const blinkSpeed = isAttacking ? 12 : 3;
  const indicatorGlow = 0.5 + Math.sin(time * blinkSpeed) * 0.5;
  ctx.fillStyle = `rgba(255, 200, 0, ${indicatorGlow * (isAttacking ? 1 : 0.5)})`;
  setShadowBlur(ctx, isAttacking ? 6 * zoom : 2 * zoom, "#ffcc00");
  ctx.beginPath();
  ctx.arc(tubeEntryX - 3 * zoom, tubeEntryY - 2 * zoom, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

// Draw ammo belt connecting box to turret
function drawCannonAmmoBelt(
  ctx: CanvasRenderingContext2D,
  boxCenterX: number,
  boxCenterY: number,
  turretX: number,
  turretY: number,
  rotation: number,
  zoom: number,
  time: number,
  isAttacking: boolean,
  attackPulse: number,
  boxSide: number
) {
  // Belt shake animation when firing
  const beltShakeX = isAttacking ? Math.sin(time * 80) * 2 * zoom * attackPulse : 0;
  const beltShakeY = isAttacking ? Math.cos(time * 60) * 1.5 * zoom * attackPulse : 0;
  
  // Belt exit point from ammo box
  const beltExitX = boxCenterX + (boxSide > 0 ? -6 : 6) * zoom;
  const beltExitY = boxCenterY - 6 * zoom;
  
  // Belt entry point to turret feed mechanism
  const beltEntryX = turretX - 4 * zoom + beltShakeX;
  const beltEntryY = turretY - 6 * zoom + beltShakeY;
  
  // Belt curve control points
  const beltMidX = (beltExitX + beltEntryX) * 0.5 + Math.cos(rotation) * 12 * zoom;
  const beltMidY = (beltExitY + beltEntryY) * 0.5 - 10 * zoom + Math.sin(rotation) * 6 * zoom;
  
  // Belt shadow/channel
  ctx.strokeStyle = "#1a1a22";
  ctx.lineWidth = 6 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY);
  ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
  ctx.stroke();
  
  // Belt guide channel
  ctx.strokeStyle = "#3a3a42";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(beltExitX, beltExitY);
  ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
  ctx.stroke();
  
  // Animated bullets along belt
  const beltBulletCount = 12;
  for (let i = 0; i < beltBulletCount; i++) {
    const beltProgress = isAttacking ? (i / beltBulletCount + time * 6) % 1 : i / beltBulletCount;
    const t = beltProgress;
    const oneMinusT = 1 - t;
    
    const bulletX = oneMinusT * oneMinusT * beltExitX + 2 * oneMinusT * t * beltMidX + t * t * beltEntryX;
    const bulletY = oneMinusT * oneMinusT * beltExitY + 2 * oneMinusT * t * beltMidY + t * t * beltEntryY;
    
    const tangentX = 2 * oneMinusT * (beltMidX - beltExitX) + 2 * t * (beltEntryX - beltMidX);
    const tangentY = 2 * oneMinusT * (beltMidY - beltExitY) + 2 * t * (beltEntryY - beltMidY);
    const bulletAngle = Math.atan2(tangentY, tangentX);
    
    const shakeIntensity = isAttacking ? attackPulse * 0.4 : 0;
    const bulletShakeX = Math.sin(time * 70 + i * 1.3) * 1.5 * zoom * shakeIntensity;
    const bulletShakeY = Math.cos(time * 55 + i * 1.7) * 1 * zoom * shakeIntensity;
    
    const finalBulletX = bulletX + bulletShakeX;
    const finalBulletY = bulletY + bulletShakeY;
    
    // Metal link
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.ellipse(finalBulletX, finalBulletY, 1.5 * zoom, 1 * zoom, bulletAngle, 0, Math.PI * 2);
    ctx.fill();
    
    // Brass casing
    const brassGrad = ctx.createLinearGradient(finalBulletX - 1.5 * zoom, finalBulletY - 2 * zoom, finalBulletX + 1.5 * zoom, finalBulletY + 2 * zoom);
    brassGrad.addColorStop(0, "#e6c54a");
    brassGrad.addColorStop(0.3, "#daa520");
    brassGrad.addColorStop(0.7, "#b8860b");
    brassGrad.addColorStop(1, "#8b6914");
    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.ellipse(finalBulletX, finalBulletY, 2 * zoom, 3 * zoom, bulletAngle + Math.PI * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Bullet tip
    const tipOffsetX = Math.cos(bulletAngle + Math.PI * 0.5) * 2 * zoom;
    const tipOffsetY = Math.sin(bulletAngle + Math.PI * 0.5) * 2 * zoom;
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.ellipse(finalBulletX + tipOffsetX, finalBulletY + tipOffsetY, 1.4 * zoom, 1.6 * zoom, bulletAngle + Math.PI * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Feed mechanism
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.arc(beltEntryX, beltEntryY, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
}

function drawTowerBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseWidth: number,
  baseHeight: number,
  colors: { base: string; dark: string; light: string; accent: string },
  zoom: number
) {
  drawIsometricPrism(
    ctx,
    x,
    y + 8 * zoom,
    baseWidth + 8,
    baseWidth + 8,
    6,
    {
      top: darkenColor(colors.base, 30),
      left: darkenColor(colors.base, 50),
      right: darkenColor(colors.base, 40),
      leftBack: darkenColor(colors.base, 20),
      rightBack: darkenColor(colors.base, 25),
    },
    zoom
  );

  drawIsometricPrism(
    ctx,
    x,
    y,
    baseWidth,
    baseWidth,
    baseHeight,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
      leftBack: lightenColor(colors.base, 15),
      rightBack: lightenColor(colors.dark, 10),
    },
    zoom
  );
}

// ============================================================================
// TOWER PASSIVE EFFECTS HELPER
// ============================================================================
function drawTowerPassiveEffects(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string }
) {
  // Add ambient particles floating around all towers
  const particleCount = 3 + tower.level;
  for (let i = 0; i < particleCount; i++) {
    const angle = time * (0.5 + i * 0.1) + i * ((Math.PI * 2) / particleCount);
    const radius = (25 + Math.sin(time * 2 + i) * 5) * zoom;
    const px = screenPos.x + Math.cos(angle) * radius;
    const py = screenPos.y - 30 * zoom + Math.sin(angle * 0.5) * radius * 0.3;
    const particleAlpha = 0.3 + Math.sin(time * 3 + i) * 0.2;
    const particleSize = (2 + Math.sin(time * 4 + i) * 1) * zoom;

    ctx.fillStyle = `rgba(255, 255, 255, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle energy ring at base (except for station)
  if (tower.type !== "station") {
    const ringPulse = 1 + Math.sin(time * 2) * 0.1;
    ctx.strokeStyle = `rgba(${hexToRgb(colors.accent)}, ${
      0.15 + Math.sin(time * 3) * 0.1
    })`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 5 * zoom,
      30 * zoom * ringPulse,
      15 * zoom * ringPulse,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

// Helper to convert hex to rgb values
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
      result[3],
      16
    )}`;
  }
  return "255, 255, 255";
}

// ============================================================================
// TOWER RENDERING
// ============================================================================
export function renderTower(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  hoveredTower: string | null,
  selectedTower: string | null,
  enemies: Enemy[],
  selectedMap: string,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const time = Date.now() / 1000;
  const isHovered = hoveredTower === tower.id;
  const isSelected = selectedTower === tower.id;
  const colors = TOWER_COLORS[tower.type];

  // Draw passive effects first (behind tower)
  drawTowerPassiveEffects(ctx, screenPos, tower, zoom, time, colors);

  // Selection/hover glow with enhanced effect
  if (isSelected || isHovered) {
    ctx.save();
    ctx.shadowColor = isSelected ? "#c9a227" : "#ffffff";
    ctx.shadowBlur = 30 * zoom;

    // Outer glow ring
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 8 * zoom,
      42 * zoom,
      21 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = isSelected
      ? "rgba(255, 215, 0, 0.15)"
      : "rgba(255,255,255,0.1)";
    ctx.fill();

    // Inner glow ring
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 8 * zoom,
      38 * zoom,
      19 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = isSelected
      ? "rgba(255, 215, 0, 0.25)"
      : "rgba(255,255,255,0.2)";
    ctx.fill();

    // Animated selection ring
    if (isSelected) {
      const ringPulse = 1 + Math.sin(time * 4) * 0.05;
      ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 8 * zoom,
        44 * zoom * ringPulse,
        22 * zoom * ringPulse,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // Enhanced shadow with soft edges
  const shadowGrad = ctx.createRadialGradient(
    screenPos.x,
    screenPos.y + 8 * zoom,
    0,
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom
  );
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.2)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  switch (tower.type) {
    case "cannon":
      renderCannonTower(
        ctx,
        screenPos,
        tower,
        zoom,
        time,
        colors,
        enemies,
        selectedMap,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom
      );
      break;
    case "library":
      renderLibraryTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "lab":
      renderLabTower(
        ctx,
        screenPos,
        tower,
        zoom,
        time,
        colors,
        enemies,
        selectedMap,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom
      );
      break;
    case "arch":
      renderArchTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "club":
      renderClubTower(ctx, screenPos, tower, zoom, time, colors);
      break;
    case "station":
      renderStationTower(ctx, screenPos, tower, zoom, time, colors);
      break;
  }

  // Level indicator
  if (tower.level > 1) {
    const starY = screenPos.y + 20 * zoom - tower.level * 8 * zoom;
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    drawStar(ctx, screenPos.x, starY, 8 * zoom, 4 * zoom, "#c9a227");
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#8b6914";
    ctx.font = `bold ${8 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tower.level.toString(), screenPos.x, starY + 1 * zoom);
  }

  // Upgrade path badge
  if (tower.level === 4 && tower.upgrade) {
    const badgeY = screenPos.y + 35 * zoom - tower.level * 8 * zoom;
    ctx.fillStyle = tower.upgrade === "A" ? "#ff6b6b" : "#4ecdc4";
    ctx.beginPath();
    ctx.arc(screenPos.x, badgeY, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${8 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tower.upgrade, screenPos.x, badgeY);
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

// CANNON TOWER - High-tech mechanical artillery platform
function renderCannonTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  ctx.save();
  const level = tower.level;
  const baseWidth = 36 + level * 5;
  const baseHeight = 24 + level * 10;

  // Enhanced mechanical base with tech panels
  drawMechanicalTowerBase(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseHeight,
    {
      base: "#4a4a52",
      dark: "#2a2a32",
      light: "#6a6a72",
      accent: "#ff6600",
    },
    zoom,
    time,
    level
  );

  const topY = screenPos.y - baseHeight * zoom;

  // ========== ENHANCED TURRET MOUNTING PLATFORM ==========
  
  // Outer mounting ring (heavy base)
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 4 * zoom,
    baseWidth * 0.58 * zoom,
    baseWidth * 0.29 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Tech platform on top
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    baseWidth * 0.5 * zoom,
    baseWidth * 0.25 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Inner platform detail
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 1 * zoom,
    baseWidth * 0.4 * zoom,
    baseWidth * 0.2 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing tech ring
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.strokeStyle = `rgba(255, 102, 0, ${pulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    baseWidth * 0.45 * zoom,
    baseWidth * 0.22 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Mounting bolts around platform
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 8; i++) {
    const boltAngle = (i / 8) * Math.PI * 2 + time * 0.5;
    const boltX = screenPos.x + Math.cos(boltAngle) * baseWidth * 0.48 * zoom;
    const boltY = topY + 2 * zoom + Math.sin(boltAngle) * baseWidth * 0.24 * zoom;
    ctx.beginPath();
    ctx.arc(boltX, boltY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Power conduits to turret (level 2+)
  if (level >= 2) {
    ctx.strokeStyle = `rgba(255, 102, 0, ${0.4 + Math.sin(time * 4) * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      const conduitAngle = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const startX = screenPos.x + Math.cos(conduitAngle) * baseWidth * 0.5 * zoom;
      const startY = topY + 2 * zoom + Math.sin(conduitAngle) * baseWidth * 0.25 * zoom;
      const endX = screenPos.x + Math.cos(conduitAngle) * baseWidth * 0.25 * zoom;
      const endY = topY - 5 * zoom + Math.sin(conduitAngle) * baseWidth * 0.12 * zoom;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  // Central rotation mechanism (level 3)
  if (level >= 3) {
    // Rotation bearing
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY - 1 * zoom,
      baseWidth * 0.25 * zoom,
      baseWidth * 0.12 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Bearing glow
    ctx.strokeStyle = `rgba(255, 150, 50, ${pulse * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY - 1 * zoom,
      baseWidth * 0.22 * zoom,
      baseWidth * 0.11 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Render appropriate cannon variant
  if (tower.level === 4 && tower.upgrade === "A") {
    renderGatlingGun(ctx, screenPos, topY, tower, zoom, time);
  } else if (tower.level === 4 && tower.upgrade === "B") {
    renderFlamethrower(ctx, screenPos, topY, tower, zoom, time);
  } else if (tower.level === 3) {
    renderHeavyCannon(ctx, screenPos, topY, tower, zoom, time);
  } else {
    renderStandardCannon(ctx, screenPos, topY, tower, zoom, time);
  }

  ctx.restore();
}

// Mechanical base with tech details - FULLY ENCLOSED isometric design
function drawMechanicalTowerBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: { base: string; dark: string; light: string; accent: string },
  zoom: number,
  time: number,
  level: number
) {
  // Foundation platform (bottom layer)
  drawIsometricPrism(
    ctx,
    x,
    y + 10 * zoom,
    width + 12,
    width + 12,
    6,
    {
      top: "#3a3a42",
      left: "#2a2a32",
      right: "#252530",
      leftBack: "#32323a",
      rightBack: "#2d2d35",
    },
    zoom
  );

  // Main tower body (middle layer) - this is the core structure
  drawIsometricPrism(
    ctx,
    x,
    y + 4 * zoom,
    width,
    width,
    height - 8,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
      leftBack: lightenColor(colors.base, 10),
      rightBack: lightenColor(colors.dark, 5),
    },
    zoom
  );

  // Tech layer on top
  drawIsometricPrism(
    ctx,
    x,
    y - (height - 12) * zoom,
    width - 4,
    width - 4,
    8,
    {
      top: lightenColor(colors.base, 15),
      left: colors.base,
      right: colors.dark,
      leftBack: colors.light,
      rightBack: lightenColor(colors.dark, 8),
    },
    zoom
  );

  // Add tech details on top of the fully enclosed base
  const topY = y - height * zoom;
  const w = width * zoom * 0.5;
  const d = width * zoom * 0.25;

  // ========== STEAM VENTS ==========
  // Left side steam vent
  drawSteamVent(
    ctx,
    x - w * 0.75,
    y - height * zoom * 0.1,
    time,
    0.8 + level * 0.2,
    zoom
  );

  // Right side steam vent (higher levels)
  if (level >= 2) {
    drawSteamVent(
      ctx,
      x + w * 0.7,
      y - height * zoom * 0.15,
      time + 0.5,
      0.6 + level * 0.15,
      zoom
    );
  }

  // ========== ENERGY TUBES ==========
  drawEnergyTube(
    ctx,
    x - w * 0.4,
    y,
    x - w * 0.2,
    y - height * zoom * 0.6,
    2,
    time,
    zoom,
    "rgb(255, 102, 0)"
  );

  if (level >= 3) {
    drawEnergyTube(
      ctx,
      x + w * 0.45,
      y - 4 * zoom,
      x + w * 0.45,
      y - height * zoom * 0.55,
      2.5,
      time + 0.3,
      zoom,
      "rgb(255, 80, 0)"
    );
  }

  // Tech panel lines on front faces (flipped orientation)
  ctx.strokeStyle = lightenColor(colors.light, 20);
  ctx.lineWidth = 1 * zoom;

  // Left face panel lines (diagonal going other direction)
  for (let i = 1; i <= Math.min(level, 3); i++) {
    const lineY = y + 4 * zoom - ((height - 8) * zoom * i) / (level + 1);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.15, lineY + d * 0.3);
    ctx.lineTo(x - w * 0.85, lineY - d * 0.4);
    ctx.stroke();
  }

  // Right face panel lines (diagonal going other direction)
  for (let i = 1; i <= Math.min(level, 3); i++) {
    const lineY = y + 4 * zoom - ((height - 8) * zoom * i) / (level + 1);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.85, lineY - d * 0.3);
    ctx.lineTo(x + w * 0.15, lineY + d * 0.4);
    ctx.stroke();
  }

  // ========== GLOWING VENTS WITH PULSING LIGHT ==========
  const ventGlow = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(255, 102, 0, ${ventGlow})`;
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom;

  // Left face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 12 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x + w * 0.55,
      ventY + d * 1.4,
      3 * zoom,
      2 * zoom,
      -0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Right face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 12 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x - w * 0.55,
      ventY + d * 1.4,
      3 * zoom,
      2 * zoom,
      0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // ========== ROTATING GEARS ==========
  const gearRotation = 1.25;

  // Large gear on left side (visible on front face)
  drawGear(
    ctx,
    x - w * 0.7,
    y - height * zoom * 0.5,
    12 + level * 2,
    8 + level,
    8 + level * 2,
    gearRotation,
    {
      outer: "#4a4a52",
      inner: "#3a3a42",
      teeth: "#5a5a62",
      highlight: colors.accent,
    },
    zoom
  );

  // Smaller gear meshing with large gear (counter-rotation)
  drawGear(
    ctx,
    x - w * 0.2,
    y - height * zoom * 0.65,
    8 + level,
    5 + level * 0.5,
    6 + level,
    gearRotation,
    {
      outer: "#5a5a62",
      inner: "#4a4a52",
      teeth: "#6a6a72",
      highlight: colors.accent,
    },
    zoom
  );

  // Gear on right side
  if (level >= 2) {
    drawGear(
      ctx,
      x + w * 0.55,
      y - height * zoom * 0.55,
      10 + level,
      7,
      8 + level,
      -gearRotation,
      {
        outer: "#4a4a52",
        inner: "#3a3a42",
        teeth: "#5a5a62",
        highlight: colors.accent,
      },
      zoom
    );
  }

  // ========== CONVEYOR BELT WITH AMMO ==========
  if (level >= 2) {
    drawConveyorBelt(
      ctx,
      x - w * 0.5,
      y + 6 * zoom,
      x - w * 0.5,
      y - height * zoom * 1.1,
      6,
      time,
      zoom,
      "#8b4513" // Brass ammo color
    );
  }

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    x - w * 0.85,
    y - height * zoom + 12 * zoom,
    3,
    time,
    zoom,
    "#ff4400",
    4
  );
  if (level >= 2) {
    drawWarningLight(
      ctx,
      x + w * 0.85,
      y - height * zoom + 12 * zoom,
      3,
      time + 0.5,
      zoom,
      "#ffaa00",
      3
    );
  }

  // ========== AMMO BOXES ==========
  if (level >= 2) {
    drawAmmoBox(
      ctx,
      x - w * 0.5,
      y + 5 * zoom,
      12,
      6,
      12,
      { main: "#5a4a3a", accent: "#ff6600", label: "#c9a227" },
      zoom,
      time * 2
    );
  }
  if (level >= 3) {
    drawAmmoBox(
      ctx,
      x - w * 0.5,
      y + 2 * zoom,
      14,
      5,
      10,
      { main: "#4a3a2a", accent: "#ffaa00", label: "#c9a227" },
      zoom,
      time * 2 + 1
    );
  }

  // ========== SCAFFOLDING & SUPPORT STRUCTURE (Level 2+) ==========
  if (level >= 2) {
    // Vertical support struts
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3 * zoom;
    
    // Left strut
    ctx.beginPath();
    ctx.moveTo(x - w * 1.15, y + 8 * zoom);
    ctx.lineTo(x - w * 0.95, topY + 15 * zoom);
    ctx.stroke();
    
    // Right strut
    ctx.beginPath();
    ctx.moveTo(x + w * 1.15, y + 8 * zoom);
    ctx.lineTo(x + w * 0.95, topY + 15 * zoom);
    ctx.stroke();

    // Cross bracing
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 1.1, y - height * zoom * 0.2);
    ctx.lineTo(x + w * 0.98, topY + 20 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 1.1, y - height * zoom * 0.2);
    ctx.lineTo(x - w * 0.98, topY + 20 * zoom);
    ctx.stroke();

    // Horizontal support bar
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 1.1, y - height * zoom * 0.4);
    ctx.lineTo(x + w * 1.1, y - height * zoom * 0.4);
    ctx.stroke();

    // Support bar connectors
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    ctx.arc(x - w * 1.1, y - height * zoom * 0.4, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w * 1.1, y - height * zoom * 0.4, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== AMMO CHAIN/BELT FEED SYSTEM (Level 2+) ==========
  if (level >= 2) {
    // Ammo chain from side storage to turret
    const chainLinks = 8 + level * 2;
    const chainStartX = x - w * 1.0;
    const chainStartY = y - height * zoom * 0.1;
    const chainEndX = x - w * 0.3;
    const chainEndY = topY + 5 * zoom;

    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(chainStartX, chainStartY);
    
    // Curved chain path with sag
    const midX = (chainStartX + chainEndX) / 2;
    const midY = (chainStartY + chainEndY) / 2 + 10 * zoom;
    ctx.quadraticCurveTo(midX, midY, chainEndX, chainEndY);
    ctx.stroke();

    // Individual chain links
    ctx.fillStyle = "#cd853f";
    for (let i = 0; i < chainLinks; i++) {
      const t = i / chainLinks;
      const t2 = t * t;
      const linkX = chainStartX + (chainEndX - chainStartX) * t;
      const linkY = chainStartY + (chainEndY - chainStartY) * t + Math.sin(t * Math.PI) * 10 * zoom;
      
      // Animate chain movement
      const chainAnim = (time * 2 + i * 0.3) % 1;
      const linkPulse = 0.6 + Math.sin(chainAnim * Math.PI * 2) * 0.2;
      
      ctx.fillStyle = `rgba(205, 133, 63, ${linkPulse})`;
      ctx.beginPath();
      ctx.ellipse(linkX, linkY, 2.5 * zoom, 1.5 * zoom, t * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ammo storage drum
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.ellipse(chainStartX, chainStartY, 8 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Drum highlight
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(chainStartX, chainStartY, 6 * zoom, 10 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Drum bands
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 1 * zoom;
    for (let band = 0; band < 3; band++) {
      const bandY = chainStartY - 8 * zoom + band * 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(chainStartX - 6 * zoom, bandY);
      ctx.lineTo(chainStartX + 6 * zoom, bandY);
      ctx.stroke();
    }
  }

  // ========== ARMOR PLATING (Level 2+) ==========
  if (level >= 2) {
    // Side armor plates
    ctx.fillStyle = "#5a5a62";
    
    // Left armor plate
    ctx.beginPath();
    ctx.moveTo(x - w * 1.05, y + 2 * zoom);
    ctx.lineTo(x - w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x - w * 1.0, y - height * zoom * 0.35);
    ctx.lineTo(x - w * 0.9, y - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    
    // Right armor plate
    ctx.beginPath();
    ctx.moveTo(x + w * 1.05, y + 2 * zoom);
    ctx.lineTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1.0, y - height * zoom * 0.35);
    ctx.lineTo(x + w * 0.9, y - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Armor plate rivets
    ctx.fillStyle = "#7a7a82";
    const rivetPositions = [
      { x: x - w * 1.05, y: y - height * zoom * 0.1 },
      { x: x - w * 1.1, y: y - height * zoom * 0.25 },
      { x: x + w * 1.05, y: y - height * zoom * 0.1 },
      { x: x + w * 1.1, y: y - height * zoom * 0.25 },
    ];
    for (const rivet of rivetPositions) {
      ctx.beginPath();
      ctx.arc(rivet.x, rivet.y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Armor edge highlight
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x - w * 1.0, y - height * zoom * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1.0, y - height * zoom * 0.35);
    ctx.stroke();
  }

  // ========== LEVEL 3 HEAVY ARMOR & EQUIPMENT ==========
  if (level >= 3) {
    // Additional heavy armor plating on front
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, y + 4 * zoom);
    ctx.lineTo(x - w * 0.8, y - height * zoom * 0.5);
    ctx.lineTo(x - w * 0.5, y - height * zoom * 0.55);
    ctx.lineTo(x - w * 0.3, y + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + w * 0.6, y + 4 * zoom);
    ctx.lineTo(x + w * 0.8, y - height * zoom * 0.5);
    ctx.lineTo(x + w * 0.5, y - height * zoom * 0.55);
    ctx.lineTo(x + w * 0.3, y + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Secondary ammo chain (right side)
    const chain2Links = 6;
    const chain2StartX = x + w * 1.0;
    const chain2StartY = y - height * zoom * 0.15;
    const chain2EndX = x + w * 0.3;
    const chain2EndY = topY + 8 * zoom;

    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(chain2StartX, chain2StartY);
    ctx.quadraticCurveTo(
      (chain2StartX + chain2EndX) / 2,
      (chain2StartY + chain2EndY) / 2 + 8 * zoom,
      chain2EndX,
      chain2EndY
    );
    ctx.stroke();

    // Chain links
    ctx.fillStyle = "#cd853f";
    for (let i = 0; i < chain2Links; i++) {
      const t = i / chain2Links;
      const linkX = chain2StartX + (chain2EndX - chain2StartX) * t;
      const linkY = chain2StartY + (chain2EndY - chain2StartY) * t + Math.sin(t * Math.PI) * 8 * zoom;
      const chainAnim = (time * 2.5 + i * 0.4) % 1;
      ctx.fillStyle = `rgba(205, 133, 63, ${0.6 + Math.sin(chainAnim * Math.PI * 2) * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(linkX, linkY, 2 * zoom, 1.2 * zoom, t * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Secondary ammo drum (smaller)
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(chain2StartX, chain2StartY, 6 * zoom, 9 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hydraulic pistons
    ctx.fillStyle = "#6a6a72";
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 2 * zoom;
    
    // Left piston
    const pistonExtend = Math.sin(time * 3) * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.85, y + 5 * zoom);
    ctx.lineTo(x - w * 0.75, topY + 18 * zoom + pistonExtend);
    ctx.stroke();
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.arc(x - w * 0.75, topY + 18 * zoom + pistonExtend, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    
    // Right piston
    ctx.strokeStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.85, y + 5 * zoom);
    ctx.lineTo(x + w * 0.75, topY + 18 * zoom - pistonExtend);
    ctx.stroke();
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.arc(x + w * 0.75, topY + 18 * zoom - pistonExtend, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Power cables
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1.5 * zoom;
    for (let cable = 0; cable < 3; cable++) {
      const cableY = y - height * zoom * (0.2 + cable * 0.15);
      const sag = Math.sin(time * 2 + cable) * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - w * 1.1, cableY);
      ctx.quadraticCurveTo(x - w * 0.9, cableY + sag, x - w * 0.7, cableY - 1 * zoom);
      ctx.stroke();
    }

    // Targeting sensor array
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(x + w * 0.5, topY + 25 * zoom, 8 * zoom, 12 * zoom);
    
    // Sensor lens
    const sensorGlow = 0.5 + Math.sin(time * 5) * 0.3;
    ctx.fillStyle = `rgba(255, 0, 0, ${sensorGlow})`;
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(x + w * 0.5 + 4 * zoom, topY + 31 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Exhaust vents
    for (let vent = 0; vent < 2; vent++) {
      const ventX = x + w * (vent === 0 ? -0.95 : 0.95);
      const ventY = topY + 30 * zoom;
      
      // Vent housing
      ctx.fillStyle = "#3a3a42";
      ctx.fillRect(ventX - 4 * zoom, ventY - 6 * zoom, 8 * zoom, 12 * zoom);
      
      // Vent glow
      const ventGlow = 0.4 + Math.sin(time * 4 + vent) * 0.3;
      ctx.fillStyle = `rgba(255, 100, 0, ${ventGlow})`;
      ctx.fillRect(ventX - 3 * zoom, ventY - 4 * zoom, 6 * zoom, 8 * zoom);
    }

    // Heavy bolts/anchors
    ctx.fillStyle = "#5a5a62";
    const heavyBoltPositions = [
      { x: x - w * 0.95, y: y + 6 * zoom },
      { x: x + w * 0.95, y: y + 6 * zoom },
      { x: x - w * 0.95, y: topY + 35 * zoom },
      { x: x + w * 0.95, y: topY + 35 * zoom },
    ];
    for (const bolt of heavyBoltPositions) {
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Bolt highlight
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(bolt.x - 1 * zoom, bolt.y - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }
  }

  // Corner reinforcement bolts
  ctx.fillStyle = "#5a5a62";
  const boltSize = 2.5 * zoom;
  // Front corners
  ctx.beginPath();
  ctx.arc(x - w * 0.9, y + d * 0.3 - 4 * zoom, boltSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.9, y + d * 0.3 - 4 * zoom, boltSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x - w * 0.9,
    y - height * zoom + d + 8 * zoom,
    boltSize,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x + w * 0.9,
    y - height * zoom + d + 8 * zoom,
    boltSize,
    0,
    Math.PI * 2
  );
  ctx.fill();
}
// Helper function to calculate pitch based on tower elevation and typical range
function calculateBarrelPitch(
  towerElevation: number,
  barrelLength: number
): number {
  // Towers are elevated, enemies are on ground - barrel should pitch down
  // Use a reasonable pitch based on geometry (typically 15-25 degrees)
  const typicalRange = barrelLength * 2.5;
  return Math.atan2(towerElevation, typicalRange);
}

function renderStandardCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
) {
  const rotation = tower.rotation || 0;
  const level = tower.level;

  // Recoil animation
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;
  let reloadPhase = 0;

  if (timeSinceFire < 400) {
    const firePhase = timeSinceFire / 400;
    if (firePhase < 0.1) {
      recoilOffset = (firePhase / 0.1) * 8 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 20) * 2 * zoom;
    } else if (firePhase < 0.4) {
      const returnPhase = (firePhase - 0.1) / 0.3;
      recoilOffset =
        8 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 2);
      turretShake =
        Math.sin(returnPhase * Math.PI * 6) * (1 - returnPhase) * 1.5 * zoom;
    } else {
      reloadPhase = (firePhase - 0.4) / 0.6;
    }
  }

  // Calculate isometric foreshortening based on rotation
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Larger barrel dimensions
  const baseBarrelLength = (30 + level * 12) * zoom;
  const barrelLength =
    baseBarrelLength * (0.4 + foreshorten * 0.6) - recoilOffset;
  const barrelWidth = (12 + level * 3) * zoom;

  // Determine if barrel is pointing "away" for draw order
  const facingAway = sinR < -0.3;

  // Apply turret shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Enhanced turret base platform with ring details
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Rotating platform ring with visible teeth/notches
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Rotating gear teeth around base (shows rotation)
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 12; i++) {
    const toothAngle = rotation + (i / 12) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 17 * zoom;
    const toothY = turretY - 4 * zoom + Math.sin(toothAngle) * 8.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Turret base
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 5 * zoom,
    17 * zoom,
    8.5 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // If facing away, draw barrel BEFORE turret housing
  if (facingAway) {
    drawCannonBarrel(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time
    );
  }

  // Enhanced turret housing - layered dome design
  const housingGrad = ctx.createRadialGradient(
    turretX - 4 * zoom,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    18 * zoom
  );
  housingGrad.addColorStop(0, "#7a7a82");
  housingGrad.addColorStop(0.4, "#5a5a62");
  housingGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 12 * zoom,
    16 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ROTATING ARMOR SHIELD PLATES - 4 main shields that rotate with turret aim
  const shieldCount = 4;
  for (let i = 0; i < shieldCount; i++) {
    const baseAngle = (i / shieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;
    
    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    
    // Shields on the front are pushed forward
    const forwardShift = Math.cos(baseAngle) * 3 * zoom;
    
    // Shield visibility (back shields are darker)
    const visibility = 0.5 + shieldDepth * 0.35;
    
    // Only draw visible shields
    if (shieldDepth > -0.7) {
      const shieldWidth = 8 * zoom;
      const shieldPerpX = -Math.sin(shieldAngle);
      const shieldPerpY = Math.cos(shieldAngle) * 0.5;
      
      // Shield center position
      const shieldCenterX = turretX + Math.cos(shieldAngle) * (11 + forwardShift * 0.3) * zoom;
      const shieldCenterY = turretY - 12 * zoom + Math.sin(shieldAngle) * (5.5 + forwardShift * 0.15) * zoom;
      
      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        shieldCenterX - shieldPerpX * shieldWidth * 0.5,
        shieldCenterY - shieldPerpY * shieldWidth * 0.5,
        shieldCenterX + shieldPerpX * shieldWidth * 0.5,
        shieldCenterY + shieldPerpY * shieldWidth * 0.5
      );
      
      if (shieldSide < 0) {
        // Top/light side
        shieldGrad.addColorStop(0, `rgba(120, 120, 130, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(60, 60, 70, ${visibility})`);
      } else {
        // Bottom/dark side
        shieldGrad.addColorStop(0, `rgba(70, 70, 80, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(80, 80, 90, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(60, 60, 70, ${visibility})`);
      }
      
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      
      // Draw angular shield shape
      const innerR = 6 * zoom;
      const outerR = 14 * zoom;
      const angleSpan = Math.PI / 2.5;
      
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY - 12 * zoom + Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY - 12 * zoom + Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 - 2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY - 12 * zoom + Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.5 - 3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY - 12 * zoom + Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 - 2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY - 12 * zoom + Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5
      );
      ctx.closePath();
      ctx.fill();
      
      // Shield edge highlight
      ctx.strokeStyle = `rgba(150, 150, 160, ${visibility * 0.7})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();
      
      // Armor bolt/rivet detail
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 3 * zoom);
      const rivetY = turretY - 12 * zoom + Math.sin(shieldAngle) * (outerR - 3 * zoom) * 0.5 - 2 * zoom;
      ctx.fillStyle = `rgba(60, 60, 70, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring (between shields and core)
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(turretX, turretY - 12 * zoom, 10 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Central pivot mechanism
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pivot ring detail
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Barrel mounting collar that rotates with aim
  const collarX = turretX + cosR * 4 * zoom;
  const collarY = turretY - 12 * zoom + sinR * 2 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 5 * zoom, 3 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Glowing core with pulsing animation - smaller, more subtle
  const coreGlow = 0.5 + Math.sin(time * 5) * 0.25 + reloadPhase * 0.25;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 12 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    4 * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 180, 80, ${coreGlow})`);
  coreGrad.addColorStop(0.4, `rgba(255, 120, 30, ${coreGlow * 0.7})`);
  coreGrad.addColorStop(0.8, `rgba(255, 80, 0, ${coreGlow * 0.4})`);
  coreGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 220, 180, ${coreGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(turretX - 0.5 * zoom, turretY - 12.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === 3D ISOMETRIC AMMO BOX (LEFT) AND ARMOR PLATE (RIGHT) ===
  const isAttacking = timeSinceFire < 100;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 100 : 0;
  
  // Ammo box position - rotates with turret on the LEFT side
  const boxAngle = rotation + Math.PI * 0.65;
  const boxDistance = 22 * zoom;
  const boxCenterX = turretX + Math.cos(boxAngle) * boxDistance;
  const boxCenterY = turretY - 6 * zoom + Math.sin(boxAngle) * boxDistance * 0.5;
  
  // Armor plate position - rotates with turret on the RIGHT side
  const plateAngle = rotation - Math.PI * 0.65;
  const plateDistance = 20 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY = turretY - 8 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;
  
  // Determine layering - when facing player (sinR > 0), accessories behind everything
  // When facing away (sinR < 0), accessories in front
  const facingPlayer = sinR > 0.2;
  const boxBehindAll = facingPlayer || Math.sin(boxAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;
  
  // Calculate visibility - more lenient to show "just a little" when behind
  const boxSide = Math.sin(boxAngle);
  const boxVisible = true; // Always show, 3D rendering handles face visibility
  const plateVisible = true; // Always show
  
  // Tower ID for plate number
  const towerId = tower.id;
  
  // Draw items BEHIND barrel first (when facing player or when position is behind)
  if (boxBehindAll && boxVisible) {
    draw3DAmmoBox(ctx, boxCenterX, boxCenterY, boxAngle, zoom, time, isAttacking, attackPulse, 'small');
    drawCannonAmmoBelt(ctx, boxCenterX, boxCenterY, turretX, turretY - 10 * zoom, rotation, zoom, time, isAttacking, attackPulse, boxSide);
  }
  if (plateBehindAll && plateVisible) {
    draw3DArmorPlate(ctx, plateCenterX, plateCenterY, plateAngle, zoom, towerId, 'small');
  }

  // If not facing away, draw barrel AFTER turret housing
  if (!facingAway) {
    drawCannonBarrel(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time
    );
  }
  
  // Draw items IN FRONT of barrel after (only when NOT facing player AND position is in front)
  if (!boxBehindAll && boxVisible) {
    draw3DAmmoBox(ctx, boxCenterX, boxCenterY, boxAngle, zoom, time, isAttacking, attackPulse, 'small');
    drawCannonAmmoBelt(ctx, boxCenterX, boxCenterY, turretX, turretY - 10 * zoom, rotation, zoom, time, isAttacking, attackPulse, boxSide);
  }
  if (!plateBehindAll && plateVisible) {
    draw3DArmorPlate(ctx, plateCenterX, plateCenterY, plateAngle, zoom, towerId, 'small');
  }

  // Calculate pitch for muzzle flash positioning
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchDrop = barrelLength * Math.sin(pitch) * 0.5;

  // Muzzle flash effect
  if (timeSinceFire < 100) {
    const flashPhase = timeSinceFire / 100;
    const flashSize = (15 - flashPhase * 10) * zoom;
    const turretRadius = 8 * zoom;
    const totalLength =
      turretRadius + barrelLength * Math.cos(pitch) + 5 * zoom;
    const flashX = turretX + cosR * totalLength;
    const flashY = turretY - 12 * zoom + sinR * totalLength * 0.5 + pitchDrop;

    ctx.fillStyle = `rgba(255, 200, 100, ${1 - flashPhase})`;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Helper function to draw cannon barrel with isometric perspective, recoil, and pitch
function drawCannonBarrel(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  barrelLength: number,
  barrelWidth: number,
  foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // Calculate pitch - barrel aims down at ground-level enemies
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);

  // Calculate recoil
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  if (timeSinceFire < 150) {
    const recoilPhase = timeSinceFire / 150;
    if (recoilPhase < 0.2) {
      recoilOffset = (recoilPhase / 0.2) * 8 * zoom;
    } else {
      recoilOffset = 8 * zoom * (1 - (recoilPhase - 0.2) / 0.8);
    }
  }

  // Barrel emerges from inside the turret housing
  const turretRadius = 8 * zoom;
  const barrelStartX = pivotX + cosR * turretRadius;
  const barrelStartY = pivotY + sinR * turretRadius * 0.5;

  // Apply recoil
  const recoiledPivotX = barrelStartX - cosR * recoilOffset;
  const recoiledPivotY = barrelStartY - sinR * recoilOffset * 0.5;

  // Apply pitch to barrel length
  const effectiveBarrelLength = barrelLength * pitchCos;
  const pitchDrop = barrelLength * pitchSin * 0.5;

  // Calculate barrel end point with pitch
  const endX = recoiledPivotX + cosR * effectiveBarrelLength;
  const endY = recoiledPivotY + sinR * effectiveBarrelLength * 0.5 + pitchDrop;

  // Calculate perpendicular offset for barrel thickness
  const perpX = -sinR * barrelWidth * 0.5;
  const perpY = cosR * barrelWidth * 0.25;

  const lightSide = sinR < 0;

  // Main barrel body with cylindrical shading
  const barrelGrad = ctx.createLinearGradient(
    recoiledPivotX + perpX,
    recoiledPivotY + perpY,
    recoiledPivotX - perpX,
    recoiledPivotY - perpY
  );
  if (lightSide) {
    barrelGrad.addColorStop(0, "#8a8a92");
    barrelGrad.addColorStop(0.2, "#7a7a82");
    barrelGrad.addColorStop(0.5, "#5a5a62");
    barrelGrad.addColorStop(0.8, "#4a4a52");
    barrelGrad.addColorStop(1, "#3a3a42");
  } else {
    barrelGrad.addColorStop(0, "#4a4a52");
    barrelGrad.addColorStop(0.2, "#5a5a62");
    barrelGrad.addColorStop(0.5, "#6a6a72");
    barrelGrad.addColorStop(0.8, "#5a5a62");
    barrelGrad.addColorStop(1, "#4a4a52");
  }
  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  const taperMult = 0.7;
  // Make barrel thicker by increasing width multiplier
  const thicknessMult = 1.3;
  ctx.moveTo(recoiledPivotX + perpX * thicknessMult, recoiledPivotY + perpY * thicknessMult);
  ctx.lineTo(endX + perpX * taperMult * thicknessMult, endY + perpY * taperMult * thicknessMult);
  ctx.lineTo(endX - perpX * taperMult * thicknessMult, endY - perpY * taperMult * thicknessMult);
  ctx.lineTo(recoiledPivotX - perpX * thicknessMult, recoiledPivotY - perpY * thicknessMult);
  ctx.closePath();
  ctx.fill();

  // Cylindrical highlight along barrel top
  ctx.strokeStyle = `rgba(180, 180, 190, 0.5)`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX * thicknessMult * 0.6, recoiledPivotY + perpY * thicknessMult * 0.6);
  ctx.lineTo(endX + perpX * taperMult * thicknessMult * 0.5, endY + perpY * taperMult * thicknessMult * 0.5);
  ctx.stroke();

  // Barrel base ellipse for cylindrical effect
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(
    recoiledPivotX,
    recoiledPivotY,
    barrelWidth * 0.35 * thicknessMult,
    barrelWidth * 0.18 * thicknessMult,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Barrel reinforcement bands - adjusted for pitch and thickness
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const t = 0.2 + i * 0.25;
    const bx = recoiledPivotX + cosR * effectiveBarrelLength * t;
    const by =
      recoiledPivotY + sinR * effectiveBarrelLength * t * 0.5 + pitchDrop * t;
    const widthMult = (1 - t * 0.3) * thicknessMult;
    ctx.beginPath();
    ctx.moveTo(bx + perpX * widthMult, by + perpY * widthMult);
    ctx.lineTo(bx - perpX * widthMult, by - perpY * widthMult);
    ctx.stroke();
  }

  // Energy conduits along barrel
  const conduitGlow = 0.5 + Math.sin(time * 6) * 0.3;
  ctx.strokeStyle = `rgba(255, 102, 0, ${conduitGlow})`;
  ctx.lineWidth = 1.5 * zoom;

  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX * 0.3 * thicknessMult, recoiledPivotY + perpY * 0.3 * thicknessMult);
  ctx.lineTo(endX + perpX * 0.2 * taperMult * thicknessMult, endY + perpY * 0.2 * taperMult * thicknessMult);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(recoiledPivotX - perpX * 0.3 * thicknessMult, recoiledPivotY - perpY * 0.3 * thicknessMult);
  ctx.lineTo(endX - perpX * 0.2 * taperMult * thicknessMult, endY - perpY * 0.2 * taperMult * thicknessMult);
  ctx.stroke();

  // Muzzle assembly - adjusted for pitch and thickness
  ctx.fillStyle = "#3a3a42";
  const muzzleStart = 0.85;
  const msx = recoiledPivotX + cosR * effectiveBarrelLength * muzzleStart;
  const msy =
    recoiledPivotY +
    sinR * effectiveBarrelLength * muzzleStart * 0.5 +
    pitchDrop * muzzleStart;
  ctx.beginPath();
  ctx.moveTo(msx + perpX * taperMult * 0.9 * thicknessMult, msy + perpY * taperMult * 0.9 * thicknessMult);
  ctx.lineTo(endX + perpX * taperMult * 1.1 * thicknessMult, endY + perpY * taperMult * 1.1 * thicknessMult);
  ctx.lineTo(endX - perpX * taperMult * 1.1 * thicknessMult, endY - perpY * taperMult * 1.1 * thicknessMult);
  ctx.lineTo(msx - perpX * taperMult * 0.9 * thicknessMult, msy - perpY * taperMult * 0.9 * thicknessMult);
  ctx.closePath();
  ctx.fill();

  // Muzzle end cap - draw elliptical rim at barrel end to show 3D tube shape
  const muzzleEndX = endX + cosR * 1 * zoom;
  const muzzleEndY = endY + sinR * 0.5 * zoom;
  const muzzleOuterRadiusX = barrelWidth * 0.38 * taperMult * thicknessMult;
  const muzzleOuterRadiusY = barrelWidth * 0.22 * taperMult * thicknessMult;
  
  // Muzzle rim (outer edge of barrel end)
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    muzzleEndX,
    muzzleEndY,
    muzzleOuterRadiusX,
    muzzleOuterRadiusY,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // Muzzle bore - only draw if barrel is pointing toward camera (cosR > 0 means pointing right/toward viewer)
  const muzzleVisible = cosR > 0.1;
  if (muzzleVisible) {
    // Bore size - scales slightly with viewing angle but maintains minimum visibility
    const viewFactor = 0.6 + cosR * 0.4; // 0.6 to 1.0 range
    const boreRadiusX = muzzleOuterRadiusX * 0.7 * viewFactor;
    const boreRadiusY = muzzleOuterRadiusY * 0.75;
    
    // Dark bore hole
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.ellipse(
      muzzleEndX,
      muzzleEndY,
      boreRadiusX,
      boreRadiusY,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Inner bore ring for depth effect
    if (cosR > 0.3) {
      ctx.strokeStyle = "#181818";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        muzzleEndX,
        muzzleEndY,
        boreRadiusX * 0.6,
        boreRadiusY * 0.6,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  } else {
    // When facing away, just show a darker center for the end cap
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(
      muzzleEndX,
      muzzleEndY,
      muzzleOuterRadiusX * 0.5,
      muzzleOuterRadiusY * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Muzzle flash effect
  if (timeSinceFire < 150) {
    const flash = 1 - timeSinceFire / 150;
    const flashX = endX + cosR * 10 * zoom;
    const flashY = endY + sinR * 5 * zoom + pitchDrop * 0.2;
    const flashGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      25 * zoom * flash
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
    flashGrad.addColorStop(0.2, `rgba(255, 200, 100, ${flash * 0.9})`);
    flashGrad.addColorStop(0.5, `rgba(255, 120, 0, ${flash * 0.6})`);
    flashGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 25 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Level 3 Heavy Cannon - reinforced barrel with stabilizers and isometric rendering
function renderHeavyCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
) {
  const rotation = tower.rotation || 0;

  // Recoil animation - heavier recoil for heavy cannon
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;
  let reloadPhase = 0;

  if (timeSinceFire < 600) {
    const firePhase = timeSinceFire / 600;
    if (firePhase < 0.15) {
      recoilOffset = (firePhase / 0.15) * 12 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 15) * 3 * zoom;
    } else if (firePhase < 0.5) {
      const returnPhase = (firePhase - 0.15) / 0.35;
      recoilOffset =
        12 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 1.5);
      turretShake =
        Math.sin(returnPhase * Math.PI * 4) * (1 - returnPhase) * 2 * zoom;
    } else {
      reloadPhase = (firePhase - 0.5) / 0.5;
    }
  }

  // Calculate isometric foreshortening
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Larger barrel for heavy cannon
  const baseBarrelLength = 65 * zoom;
  const barrelLength =
    baseBarrelLength * (0.4 + foreshorten * 0.6) - recoilOffset;
  const barrelWidth = 18 * zoom;

  // Apply turret shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Heavy turret base with armored rim
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 1 * zoom,
    26 * zoom,
    13 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Outer ring detail with rotating gear teeth
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 3 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Rotating gear teeth around base
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 23 * zoom;
    const toothY = turretY - 3 * zoom + Math.sin(toothAngle) * 11.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    23 * zoom,
    11.5 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 6 * zoom,
    21 * zoom,
    10.5 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw barrel behind housing if facing away
  if (facingAway) {
    drawHeavyCannonBarrel(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time
    );
  }

  // Armored turret housing - base ellipse
  const housingGrad = ctx.createRadialGradient(
    turretX - 5 * zoom,
    turretY - 20 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    24 * zoom
  );
  housingGrad.addColorStop(0, "#7a7a82");
  housingGrad.addColorStop(0.3, "#6a6a72");
  housingGrad.addColorStop(0.6, "#5a5a62");
  housingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 16 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ROTATING HEAVY ARMOR SHIELD PLATES - 6 main shields that rotate with turret aim
  const heavyShieldCount = 6;
  for (let i = 0; i < heavyShieldCount; i++) {
    const baseAngle = (i / heavyShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;
    
    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;
    
    // Only draw visible shields
    if (shieldDepth > -0.65) {
      const innerR = 8 * zoom;
      const outerR = 18 * zoom;
      const angleSpan = Math.PI / 3.5;
      
      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        turretY - 16 * zoom + Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.5,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        turretY - 16 * zoom + Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.5
      );
      
      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(130, 130, 140, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(100, 100, 110, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(70, 70, 80, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(80, 80, 90, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(70, 70, 80, ${visibility})`);
      }
      
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      
      // Draw angular shield shape - heavier version
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY - 16 * zoom + Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY - 16 * zoom + Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 - 3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 3 * zoom),
        turretY - 16 * zoom + Math.sin(shieldAngle) * (outerR + 3 * zoom) * 0.5 - 4 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY - 16 * zoom + Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 - 3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY - 16 * zoom + Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5
      );
      ctx.closePath();
      ctx.fill();
      
      // Shield edge highlight
      ctx.strokeStyle = `rgba(160, 160, 170, ${visibility * 0.7})`;
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();
      
      // Armor rivets on each shield
      const rivet1X = turretX + Math.cos(shieldAngle - angleSpan * 0.15) * (outerR - 4 * zoom);
      const rivet1Y = turretY - 16 * zoom + Math.sin(shieldAngle - angleSpan * 0.15) * (outerR - 4 * zoom) * 0.5 - 2.5 * zoom;
      const rivet2X = turretX + Math.cos(shieldAngle + angleSpan * 0.15) * (outerR - 4 * zoom);
      const rivet2Y = turretY - 16 * zoom + Math.sin(shieldAngle + angleSpan * 0.15) * (outerR - 4 * zoom) * 0.5 - 2.5 * zoom;
      
      ctx.fillStyle = `rgba(50, 50, 60, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivet1X, rivet1Y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rivet2X, rivet2Y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring (between shields and core)
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(turretX, turretY - 16 * zoom, 12 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Heavy pivot mechanism
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 10 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pivot ring detail
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Barrel mounting collar that rotates with aim - larger for heavy cannon
  const collarX = turretX + cosR * 5 * zoom;
  const collarY = turretY - 16 * zoom + sinR * 2.5 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 7 * zoom, 4 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Power core - smaller and more subtle
  const coreGlow = 0.6 + Math.sin(time * 4) * 0.25 + reloadPhase * 0.3;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    6 * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 220, 120, ${coreGlow})`);
  coreGrad.addColorStop(0.3, `rgba(255, 180, 80, ${coreGlow * 0.8})`);
  coreGrad.addColorStop(0.6, `rgba(255, 130, 30, ${coreGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 240, 200, ${coreGlow * 0.7})`;
  ctx.beginPath();
  ctx.arc(turretX - 1 * zoom, turretY - 17 * zoom, 1.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === 3D ISOMETRIC AMMO BOX (LEFT) AND ARMOR PLATE (RIGHT) ===
  const isAttacking = timeSinceFire < 150;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 150 : 0;
  
  // Ammo box position - rotates with turret on the LEFT side
  const boxAngle = rotation + Math.PI * 0.5;
  const boxDistance = 28 * zoom;
  const boxCenterX = turretX + Math.cos(boxAngle) * boxDistance;
  const boxCenterY = turretY - 8 * zoom + Math.sin(boxAngle) * boxDistance * 0.5;
  
  // Armor plate position - rotates with turret on the RIGHT side
  const plateAngle = rotation - Math.PI * 0.5;
  const plateDistance = 26 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY = turretY - 10 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;
  
  // Determine layering - when facing player (sinR > 0), accessories behind everything
  // When facing away (sinR < 0), accessories in front
  const facingPlayer = sinR > 0.2;
  const boxBehindAll = facingPlayer || Math.sin(boxAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;
  
  // Calculate visibility - always show, 3D rendering handles face visibility
  const boxSide = Math.sin(boxAngle);
  const boxVisible = true;
  const plateVisible = true;
  
  // Tower ID for plate number
  const towerId = tower.id;
  
  // Draw items BEHIND barrel first (when facing player or when position is behind)
  if (boxBehindAll && boxVisible) {
    draw3DAmmoBox(ctx, boxCenterX, boxCenterY, boxAngle, zoom, time, isAttacking, attackPulse, 'medium');
    drawCannonAmmoBelt(ctx, boxCenterX, boxCenterY, turretX, turretY - 12 * zoom, rotation, zoom, time, isAttacking, attackPulse, boxSide);
  }
  if (plateBehindAll && plateVisible) {
    draw3DArmorPlate(ctx, plateCenterX, plateCenterY, plateAngle, zoom, towerId, 'medium');
  }

  // Draw barrel in front if not facing away
  if (!facingAway) {
    drawHeavyCannonBarrel(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time
    );
  }
  
  // Draw items IN FRONT of barrel after (only when NOT facing player AND position is in front)
  if (!boxBehindAll && boxVisible) {
    draw3DAmmoBox(ctx, boxCenterX, boxCenterY, boxAngle, zoom, time, isAttacking, attackPulse, 'medium');
    drawCannonAmmoBelt(ctx, boxCenterX, boxCenterY, turretX, turretY - 12 * zoom, rotation, zoom, time, isAttacking, attackPulse, boxSide);
  }
  if (!plateBehindAll && plateVisible) {
    draw3DArmorPlate(ctx, plateCenterX, plateCenterY, plateAngle, zoom, towerId, 'medium');
  }

  // Calculate pitch for muzzle flash positioning
  const towerElevation = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchDrop = barrelLength * Math.sin(pitch) * 0.5;

  // Muzzle flash effect for heavy cannon
  if (timeSinceFire < 150) {
    const flashPhase = timeSinceFire / 150;
    const flashSize = (25 - flashPhase * 18) * zoom;
    const turretRadius = 10 * zoom;
    const totalLength =
      turretRadius + barrelLength * Math.cos(pitch) + 8 * zoom;
    const flashX = turretX + cosR * totalLength;
    const flashY = turretY - 16 * zoom + sinR * totalLength * 0.5 + pitchDrop;

    ctx.fillStyle = `rgba(255, 220, 100, ${1 - flashPhase})`;
    ctx.shadowColor = "#ff8800";
    ctx.shadowBlur = 30 * zoom;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Heavy cannon barrel with stabilizers, recoil, and pitch
function drawHeavyCannonBarrel(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  barrelLength: number,
  barrelWidth: number,
  foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // Calculate pitch - heavier cannon, more elevated turret
  const towerElevation = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);

  // Calculate recoil
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  if (timeSinceFire < 200) {
    const recoilPhase = timeSinceFire / 200;
    if (recoilPhase < 0.15) {
      recoilOffset = (recoilPhase / 0.15) * 10 * zoom;
    } else {
      recoilOffset = 10 * zoom * (1 - (recoilPhase - 0.15) / 0.85);
    }
  }

  const turretRadius = 10 * zoom;
  const barrelStartX = pivotX + cosR * turretRadius;
  const barrelStartY = pivotY + sinR * turretRadius * 0.5;

  const recoiledPivotX = barrelStartX - cosR * recoilOffset;
  const recoiledPivotY = barrelStartY - sinR * recoilOffset * 0.5;

  // Apply pitch
  const effectiveBarrelLength = barrelLength * pitchCos;
  const pitchDrop = barrelLength * pitchSin * 0.5;

  const endX = recoiledPivotX + cosR * effectiveBarrelLength;
  const endY = recoiledPivotY + sinR * effectiveBarrelLength * 0.5 + pitchDrop;

  const perpX = -sinR * barrelWidth * 0.5;
  const perpY = cosR * barrelWidth * 0.25;

  const lightSide = sinR < 0;
  const taperMult = 0.6;

  // Barrel housing at base
  ctx.fillStyle = "#4a4a52";
  const housingSize = barrelWidth * 0.8;
  ctx.beginPath();
  ctx.ellipse(
    recoiledPivotX,
    recoiledPivotY,
    housingSize,
    housingSize * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Main heavy barrel with cylindrical shading
  const barrelGrad = ctx.createLinearGradient(
    recoiledPivotX + perpX,
    recoiledPivotY + perpY,
    recoiledPivotX - perpX,
    recoiledPivotY - perpY
  );
  // Make barrel thicker
  const thicknessMult = 1.25;
  if (lightSide) {
    barrelGrad.addColorStop(0, "#8a8a92");
    barrelGrad.addColorStop(0.2, "#7a7a82");
    barrelGrad.addColorStop(0.5, "#5a5a62");
    barrelGrad.addColorStop(0.8, "#4a4a52");
    barrelGrad.addColorStop(1, "#3a3a42");
  } else {
    barrelGrad.addColorStop(0, "#4a4a52");
    barrelGrad.addColorStop(0.2, "#5a5a62");
    barrelGrad.addColorStop(0.5, "#6a6a72");
    barrelGrad.addColorStop(0.8, "#5a5a62");
    barrelGrad.addColorStop(1, "#4a4a52");
  }

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX * thicknessMult, recoiledPivotY + perpY * thicknessMult);
  ctx.lineTo(endX + perpX * taperMult * thicknessMult, endY + perpY * taperMult * thicknessMult);
  ctx.lineTo(endX - perpX * taperMult * thicknessMult, endY - perpY * taperMult * thicknessMult);
  ctx.lineTo(recoiledPivotX - perpX * thicknessMult, recoiledPivotY - perpY * thicknessMult);
  ctx.closePath();
  ctx.fill();

  // Cylindrical highlight along barrel top
  ctx.strokeStyle = `rgba(180, 180, 190, 0.45)`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX * thicknessMult * 0.55, recoiledPivotY + perpY * thicknessMult * 0.55);
  ctx.lineTo(endX + perpX * taperMult * thicknessMult * 0.45, endY + perpY * taperMult * thicknessMult * 0.45);
  ctx.stroke();

  // Barrel base ellipse for cylindrical effect  
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(
    recoiledPivotX,
    recoiledPivotY,
    barrelWidth * 0.35 * thicknessMult,
    barrelWidth * 0.18 * thicknessMult,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Stabilizer fins (scaled for isometric, pitch, and thickness)
  if (foreshorten > 0.3) {
    ctx.fillStyle = "#4a4a52";
    const finStart = 0.4;
    const finEnd = 0.75;
    const finPeak = 0.6;

    const fs1x = recoiledPivotX + cosR * effectiveBarrelLength * finStart;
    const fs1y =
      recoiledPivotY +
      sinR * effectiveBarrelLength * finStart * 0.5 +
      pitchDrop * finStart;
    const fp1x = recoiledPivotX + cosR * effectiveBarrelLength * finPeak;
    const fp1y =
      recoiledPivotY +
      sinR * effectiveBarrelLength * finPeak * 0.5 +
      pitchDrop * finPeak -
      barrelWidth * 0.4 * thicknessMult;
    const fe1x = recoiledPivotX + cosR * effectiveBarrelLength * finEnd;
    const fe1y =
      recoiledPivotY +
      sinR * effectiveBarrelLength * finEnd * 0.5 +
      pitchDrop * finEnd;

    ctx.beginPath();
    ctx.moveTo(fs1x + perpX * 0.5 * thicknessMult, fs1y + perpY * 0.5 * thicknessMult);
    ctx.lineTo(fp1x + perpX * 0.8 * thicknessMult, fp1y);
    ctx.lineTo(fe1x + perpX * 0.5 * thicknessMult, fe1y + perpY * 0.5 * thicknessMult);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(fs1x - perpX * 0.5 * thicknessMult, fs1y - perpY * 0.5 * thicknessMult);
    ctx.lineTo(
      fp1x - perpX * 0.8 * thicknessMult,
      recoiledPivotY +
        sinR * effectiveBarrelLength * finPeak * 0.5 +
        pitchDrop * finPeak +
        barrelWidth * 0.4 * thicknessMult
    );
    ctx.lineTo(fe1x - perpX * 0.5 * thicknessMult, fe1y - perpY * 0.5 * thicknessMult);
    ctx.closePath();
    ctx.fill();
  }

  // Heavy reinforcement bands - adjusted for thickness
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 3.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const t = 0.15 + i * 0.2;
    const bx = recoiledPivotX + cosR * effectiveBarrelLength * t;
    const by =
      recoiledPivotY + sinR * effectiveBarrelLength * t * 0.5 + pitchDrop * t;
    const widthMult = (1 - t * 0.35) * thicknessMult;
    ctx.beginPath();
    ctx.moveTo(bx + perpX * widthMult, by + perpY * widthMult);
    ctx.lineTo(bx - perpX * widthMult, by - perpY * widthMult);
    ctx.stroke();
  }

  // Energy conduits - adjusted for thickness
  const conduitGlow = 0.6 + Math.sin(time * 6) * 0.3;
  ctx.strokeStyle = `rgba(255, 120, 0, ${conduitGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX * 0.25 * thicknessMult, recoiledPivotY + perpY * 0.25 * thicknessMult);
  ctx.lineTo(endX + perpX * 0.15 * taperMult * thicknessMult, endY + perpY * 0.15 * taperMult * thicknessMult);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX - perpX * 0.25 * thicknessMult, recoiledPivotY - perpY * 0.25 * thicknessMult);
  ctx.lineTo(endX - perpX * 0.15 * taperMult * thicknessMult, endY - perpY * 0.15 * taperMult * thicknessMult);
  ctx.stroke();

  // Heavy muzzle brake - adjusted for thickness
  ctx.fillStyle = "#3a3a42";
  const muzzleStart = 0.82;
  const msx = recoiledPivotX + cosR * effectiveBarrelLength * muzzleStart;
  const msy =
    recoiledPivotY +
    sinR * effectiveBarrelLength * muzzleStart * 0.5 +
    pitchDrop * muzzleStart;
  ctx.beginPath();
  ctx.moveTo(msx + perpX * taperMult * thicknessMult, msy + perpY * taperMult * thicknessMult);
  ctx.lineTo(endX + perpX * taperMult * 1.2 * thicknessMult, endY + perpY * taperMult * 1.2 * thicknessMult);
  ctx.lineTo(endX - perpX * taperMult * 1.2 * thicknessMult, endY - perpY * taperMult * 1.2 * thicknessMult);
  ctx.lineTo(msx - perpX * taperMult * thicknessMult, msy - perpY * taperMult * thicknessMult);
  ctx.closePath();
  ctx.fill();

  // Muzzle vents - adjusted for thickness
  ctx.fillStyle = "#2a2a32";
  for (let i = 0; i < 2; i++) {
    const vt = 0.88 + i * 0.06;
    const vx = recoiledPivotX + cosR * effectiveBarrelLength * vt;
    const vy =
      recoiledPivotY + sinR * effectiveBarrelLength * vt * 0.5 + pitchDrop * vt;
    ctx.beginPath();
    ctx.moveTo(vx + perpX * taperMult * 1.1 * thicknessMult, vy + perpY * taperMult * 1.1 * thicknessMult);
    ctx.lineTo(vx - perpX * taperMult * 1.1 * thicknessMult, vy - perpY * taperMult * 1.1 * thicknessMult);
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
  }

  // Muzzle end cap - draw elliptical rim at barrel end to show 3D tube shape
  const muzzleEndX = endX + cosR * 1.5 * zoom;
  const muzzleEndY = endY + sinR * 0.75 * zoom;
  const muzzleOuterRadiusX = barrelWidth * 0.42 * taperMult * thicknessMult;
  const muzzleOuterRadiusY = barrelWidth * 0.24 * taperMult * thicknessMult;
  
  // Muzzle rim (outer edge of barrel end)
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    muzzleEndX,
    muzzleEndY,
    muzzleOuterRadiusX,
    muzzleOuterRadiusY,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // Muzzle bore - only draw if barrel is pointing toward camera (cosR > 0)
  const muzzleVisible = cosR > 0.1;
  if (muzzleVisible) {
    // Bore size - scales slightly with viewing angle but maintains minimum visibility
    const viewFactor = 0.6 + cosR * 0.4;
    const boreRadiusX = muzzleOuterRadiusX * 0.65 * viewFactor;
    const boreRadiusY = muzzleOuterRadiusY * 0.7;
    
    // Dark bore hole
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.ellipse(
      muzzleEndX,
      muzzleEndY,
      boreRadiusX,
      boreRadiusY,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Inner bore ring for depth effect
    if (cosR > 0.3) {
      ctx.strokeStyle = "#181818";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        muzzleEndX,
        muzzleEndY,
        boreRadiusX * 0.55,
        boreRadiusY * 0.55,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  } else {
    // When facing away, just show a darker center for the end cap
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(
      muzzleEndX,
      muzzleEndY,
      muzzleOuterRadiusX * 0.5,
      muzzleOuterRadiusY * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Enhanced muzzle flash
  if (timeSinceFire < 200) {
    const flash = 1 - timeSinceFire / 200;
    const flashX = endX + cosR * 12 * zoom;
    const flashY = endY + sinR * 6 * zoom + pitchDrop * 0.15;
    const flashGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      40 * zoom * flash
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 200, ${flash})`);
    flashGrad.addColorStop(0.15, `rgba(255, 220, 100, ${flash * 0.95})`);
    flashGrad.addColorStop(0.4, `rgba(200, 120, 0, ${flash * 0.7})`);
    flashGrad.addColorStop(0.7, `rgba(255, 80, 0, ${flash * 0.4})`);
    flashGrad.addColorStop(1, `rgba(255, 30, 0, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 40 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 10 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderGatlingGun(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
) {
  const rotation = tower.rotation || 0;
  const spinAngle = time * 30;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 100;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 100 : 0;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Recoil animation
  let recoilOffset = 0;
  let turretShake = 0;

  if (timeSinceFire < 150) {
    const firePhase = timeSinceFire / 150;
    if (firePhase < 0.2) {
      recoilOffset = (firePhase / 0.2) * 6 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 20) * 2 * zoom;
    } else {
      const returnPhase = (firePhase - 0.2) / 0.8;
      recoilOffset = 6 * zoom * (1 - returnPhase);
      turretShake =
        Math.sin(returnPhase * Math.PI * 8) * (1 - returnPhase) * 1.5 * zoom;
    }
  }

  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // === MASSIVE ARMORED BASE ===
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY + 2 * zoom,
    26 * zoom,
    13 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 21 * zoom;
    const toothY = turretY - 2 * zoom + Math.sin(toothAngle) * 10.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing ammunition indicators
  for (let i = 0; i < 6; i++) {
    const angle = rotation + (i / 6) * Math.PI * 2;
    const indicatorX = turretX + Math.cos(angle) * 18 * zoom;
    const indicatorY = turretY - 3 * zoom + Math.sin(angle) * 9 * zoom;
    const glow = 0.4 + Math.sin(time * 8 + i * 0.5) * 0.3 + attackPulse * 0.3;

    ctx.fillStyle = `rgba(255, 180, 50, ${glow})`;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  if (facingAway) {
    drawGatlingBarrels(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time,
      recoilOffset
    );
  }

  // === HEAVY GUN SHIELD ===
  const shieldGrad = ctx.createLinearGradient(
    turretX - 20 * zoom,
    turretY - 6 * zoom,
    turretX + 20 * zoom,
    turretY - 28 * zoom
  );
  shieldGrad.addColorStop(0, "#3a3a42");
  shieldGrad.addColorStop(0.2, "#5a5a62");
  shieldGrad.addColorStop(0.5, "#6a6a72");
  shieldGrad.addColorStop(0.8, "#5a5a62");
  shieldGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(turretX - 18 * zoom, turretY - 4 * zoom);
  ctx.lineTo(turretX - 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 18 * zoom, turretY - 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Shield battle damage marks
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    const markX = turretX + (i - 1) * 8 * zoom;
    const markY = turretY - 12 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(markX - 3 * zoom, markY - 2 * zoom);
    ctx.lineTo(markX + 2 * zoom, markY + 3 * zoom);
    ctx.stroke();
  }

  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 14 * zoom, turretY - 26 * zoom);
  ctx.stroke();

  // Skull emblem on shield
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 15 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 50, ${0.5 + attackPulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(turretX - 2 * zoom, turretY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.arc(turretX + 2 * zoom, turretY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Shield tech panels
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 10 * zoom, turretY - 8 * zoom);
  ctx.lineTo(turretX - 8 * zoom, turretY - 22 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(turretX + 10 * zoom, turretY - 8 * zoom);
  ctx.lineTo(turretX + 8 * zoom, turretY - 22 * zoom);
  ctx.stroke();

  // Heavy rivets
  ctx.fillStyle = "#8a8a92";
  for (let row = 0; row < 2; row++) {
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.arc(
        turretX + i * 11 * zoom,
        turretY - 10 * zoom - row * 8 * zoom,
        2.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // === CENTRAL TURRET MECHANISM ===
  const turretGrad = ctx.createRadialGradient(
    turretX - 3 * zoom,
    turretY - 18 * zoom,
    0,
    turretX,
    turretY - 14 * zoom,
    16 * zoom
  );
  turretGrad.addColorStop(0, "#7a7a82");
  turretGrad.addColorStop(0.5, "#5a5a62");
  turretGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = turretGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 14 * zoom,
    14 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ROTATING HEAVY ARMOR SHIELD PLATES - 6 shields that rotate with turret aim
  const gatlingShieldCount = 6;
  for (let i = 0; i < gatlingShieldCount; i++) {
    const baseAngle = (i / gatlingShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;
    
    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;
    
    // Only draw visible shields
    if (shieldDepth > -0.6) {
      const innerR = 7 * zoom;
      const outerR = 13 * zoom;
      const angleSpan = Math.PI / 3.2;
      
      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        turretY - 14 * zoom + Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.8,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        turretY - 14 * zoom + Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.8
      );
      
      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(120, 120, 130, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(65, 65, 75, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(75, 75, 85, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(85, 85, 95, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(65, 65, 75, ${visibility})`);
      }
      
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      
      // Draw angular shield shape
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY - 14 * zoom + Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.8
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY - 14 * zoom + Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.8 - 2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY - 14 * zoom + Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.8 - 3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY - 14 * zoom + Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.8 - 2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY - 14 * zoom + Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.8
      );
      ctx.closePath();
      ctx.fill();
      
      // Shield edge highlight
      ctx.strokeStyle = `rgba(140, 140, 150, ${visibility * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();
      
      // Armor rivet detail
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 2 * zoom);
      const rivetY = turretY - 14 * zoom + Math.sin(shieldAngle) * (outerR - 2 * zoom) * 0.8 - 2 * zoom;
      ctx.fillStyle = `rgba(50, 50, 60, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(turretX, turretY - 14 * zoom, 9 * zoom, 7.5 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // === AMMO BOX (LEFT) AND ARMOR PLATE (RIGHT) - with proper layering ===
  // Belt shake animation when firing
  const beltShakeX = isAttacking ? Math.sin(time * 80) * 2.5 * zoom * attackPulse : 0;
  const beltShakeY = isAttacking ? Math.cos(time * 60) * 1.8 * zoom * attackPulse : 0;
  
  // Ammo box position - rotates with turret on the LEFT side
  const boxAngle = rotation + Math.PI * 0.45; // 90 degrees to the LEFT of aim
  const boxDistance = 28 * zoom;
  const boxCenterX = turretX + Math.cos(boxAngle) * boxDistance + beltShakeX * 0.3;
  const boxCenterY = turretY - 8 * zoom + Math.sin(boxAngle) * boxDistance * 0.5 + beltShakeY * 0.2;
  
  // Armor plate position - rotates with turret on the RIGHT side
  const plateAngle = rotation - Math.PI * 0.65; // 90 degrees to the RIGHT of aim
  const plateDistance = 24 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY = turretY - 10 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;
  
  // Determine layering - when facing player (sinR > 0), accessories behind everything
  // When facing away (sinR < 0), accessories in front
  const facingPlayer = sinR > 0.2;
  const boxBehindAll = facingPlayer || Math.sin(boxAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;
  
  // Calculate visibility - always show, 3D rendering handles face visibility
  const boxDepth = Math.cos(boxAngle);
  const boxSide = Math.sin(boxAngle);
  const boxVisible = true;
  
  // Calculate plate visibility
  const plateDepth = Math.cos(plateAngle);
  const plateSide = Math.sin(plateAngle);
  const plateVisible = true;
  
  
  // Helper function to draw the ammo box
  const drawAmmoBox = () => {
    if (!boxVisible) return;
    
    const boxWidth = 18 * zoom;
    const boxHeight = 26 * zoom;
    const boxDepthSize = 12 * zoom;
    const boxLightness = 0.4 + boxDepth * 0.3;
    
    // === AMMO BOX BACK FACE (if visible) ===
    if (boxSide < 0.3) {
      const backColor = Math.floor(35 + boxLightness * 20);
      ctx.fillStyle = `rgb(${backColor}, ${backColor}, ${backColor + 8})`;
      ctx.beginPath();
      ctx.moveTo(boxCenterX - boxWidth * 0.5, boxCenterY - boxHeight * 0.5);
      ctx.lineTo(boxCenterX - boxWidth * 0.5 - boxDepthSize * 0.5, boxCenterY - boxHeight * 0.5 - boxDepthSize * 0.3);
      ctx.lineTo(boxCenterX - boxWidth * 0.5 - boxDepthSize * 0.5, boxCenterY + boxHeight * 0.5 - boxDepthSize * 0.3);
      ctx.lineTo(boxCenterX - boxWidth * 0.5, boxCenterY + boxHeight * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    
    // === AMMO BOX MAIN BODY (front face) ===
    const frontGrad = ctx.createLinearGradient(
      boxCenterX - boxWidth * 0.5, boxCenterY - boxHeight * 0.5,
      boxCenterX + boxWidth * 0.5, boxCenterY + boxHeight * 0.5
    );
    frontGrad.addColorStop(0, `rgb(${Math.floor(55 + boxLightness * 30)}, ${Math.floor(55 + boxLightness * 25)}, ${Math.floor(45 + boxLightness * 20)})`);
    frontGrad.addColorStop(0.5, `rgb(${Math.floor(45 + boxLightness * 25)}, ${Math.floor(45 + boxLightness * 20)}, ${Math.floor(35 + boxLightness * 15)})`);
    frontGrad.addColorStop(1, `rgb(${Math.floor(35 + boxLightness * 15)}, ${Math.floor(35 + boxLightness * 12)}, ${Math.floor(28 + boxLightness * 10)})`);
    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.rect(boxCenterX - boxWidth * 0.5, boxCenterY - boxHeight * 0.5, boxWidth, boxHeight);
    ctx.fill();
    
    ctx.strokeStyle = `rgb(${Math.floor(70 + boxLightness * 30)}, ${Math.floor(70 + boxLightness * 25)}, ${Math.floor(60 + boxLightness * 20)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    
    // === AMMO BOX TOP FACE ===
    const topColor = Math.floor(50 + boxLightness * 35);
    ctx.fillStyle = `rgb(${topColor + 10}, ${topColor + 8}, ${topColor})`;
    ctx.beginPath();
    ctx.moveTo(boxCenterX - boxWidth * 0.5, boxCenterY - boxHeight * 0.5);
    ctx.lineTo(boxCenterX - boxWidth * 0.5 - boxDepthSize * 0.5, boxCenterY - boxHeight * 0.5 - boxDepthSize * 0.3);
    ctx.lineTo(boxCenterX + boxWidth * 0.5 - boxDepthSize * 0.5, boxCenterY - boxHeight * 0.5 - boxDepthSize * 0.3);
    ctx.lineTo(boxCenterX + boxWidth * 0.5, boxCenterY - boxHeight * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgb(${topColor + 25}, ${topColor + 20}, ${topColor + 15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    
    // === AMMO BOX RIGHT SIDE FACE (if visible) ===
    if (boxSide > -0.3) {
      const sideColor = Math.floor(40 + boxLightness * 25);
      ctx.fillStyle = `rgb(${sideColor}, ${sideColor - 2}, ${sideColor - 5})`;
      ctx.beginPath();
      ctx.moveTo(boxCenterX + boxWidth * 0.5, boxCenterY - boxHeight * 0.5);
      ctx.lineTo(boxCenterX + boxWidth * 0.5 - boxDepthSize * 0.5, boxCenterY - boxHeight * 0.5 - boxDepthSize * 0.3);
      ctx.lineTo(boxCenterX + boxWidth * 0.5 - boxDepthSize * 0.5, boxCenterY + boxHeight * 0.5 - boxDepthSize * 0.3);
      ctx.lineTo(boxCenterX + boxWidth * 0.5, boxCenterY + boxHeight * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    
    // Metal corner reinforcements
    ctx.fillStyle = "#5a5a62";
    const corners = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(boxCenterX + cx * boxWidth * 0.9, boxCenterY + cy * boxHeight * 0.9, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Handle on top
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(boxCenterX - 5 * zoom, boxCenterY - boxHeight * 0.5 - 2 * zoom);
    ctx.quadraticCurveTo(boxCenterX, boxCenterY - boxHeight * 0.5 - 8 * zoom, boxCenterX + 5 * zoom, boxCenterY - boxHeight * 0.5 - 2 * zoom);
    ctx.stroke();
    
    // "AMMO" label area
    ctx.fillStyle = "#1a1a1f";
    ctx.beginPath();
    ctx.rect(boxCenterX - boxWidth * 0.35, boxCenterY - 3 * zoom, boxWidth * 0.7, 8 * zoom);
    ctx.fill();
    
    // Warning stripes
    ctx.fillStyle = `rgba(180, 140, 40, ${0.6 + boxLightness * 0.3})`;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.rect(boxCenterX - boxWidth * 0.3 + i * 6 * zoom, boxCenterY - 1 * zoom, 3 * zoom, 4 * zoom);
      ctx.fill();
    }
    
    // Latch detail
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.rect(boxCenterX - 3 * zoom, boxCenterY - boxHeight * 0.5 + 2 * zoom, 6 * zoom, 4 * zoom);
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(boxCenterX, boxCenterY - boxHeight * 0.5 + 4 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    
    // Bullet count indicator
    const indicatorGlow = 0.5 + attackPulse * 0.5 + Math.sin(time * 5) * 0.1;
    ctx.fillStyle = `rgba(50, 180, 50, ${indicatorGlow})`;
    ctx.beginPath();
    ctx.arc(boxCenterX + boxWidth * 0.3, boxCenterY + boxHeight * 0.3, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Helper function to draw the armor plate with number
  const drawArmorPlate = () => {
    if (!plateVisible) return;
    
    const plateWidth = 16 * zoom;
    const plateHeight = 20 * zoom;
    const plateDepthSize = 8 * zoom;
    const plateLightness = 0.4 + plateDepth * 0.3;
    
    // === ARMOR PLATE BACK FACE ===
    if (plateSide < 0.3) {
      const backColor = Math.floor(40 + plateLightness * 20);
      ctx.fillStyle = `rgb(${backColor}, ${backColor}, ${backColor + 5})`;
      ctx.beginPath();
      ctx.moveTo(plateCenterX - plateWidth * 0.5, plateCenterY - plateHeight * 0.5);
      ctx.lineTo(plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4, plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25);
      ctx.lineTo(plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4, plateCenterY + plateHeight * 0.5 - plateDepthSize * 0.25);
      ctx.lineTo(plateCenterX - plateWidth * 0.5, plateCenterY + plateHeight * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    
    // === ARMOR PLATE MAIN FACE ===
    const plateGrad = ctx.createLinearGradient(
      plateCenterX - plateWidth * 0.5, plateCenterY - plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5, plateCenterY + plateHeight * 0.5
    );
    plateGrad.addColorStop(0, `rgb(${Math.floor(70 + plateLightness * 35)}, ${Math.floor(70 + plateLightness * 30)}, ${Math.floor(65 + plateLightness * 25)})`);
    plateGrad.addColorStop(0.5, `rgb(${Math.floor(55 + plateLightness * 30)}, ${Math.floor(55 + plateLightness * 25)}, ${Math.floor(50 + plateLightness * 20)})`);
    plateGrad.addColorStop(1, `rgb(${Math.floor(45 + plateLightness * 20)}, ${Math.floor(45 + plateLightness * 15)}, ${Math.floor(40 + plateLightness * 12)})`);
    ctx.fillStyle = plateGrad;
    
    // Rounded rectangle shape for plate
    const radius = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(plateCenterX - plateWidth * 0.5 + radius, plateCenterY - plateHeight * 0.5);
    ctx.lineTo(plateCenterX + plateWidth * 0.5 - radius, plateCenterY - plateHeight * 0.5);
    ctx.quadraticCurveTo(plateCenterX + plateWidth * 0.5, plateCenterY - plateHeight * 0.5, plateCenterX + plateWidth * 0.5, plateCenterY - plateHeight * 0.5 + radius);
    ctx.lineTo(plateCenterX + plateWidth * 0.5, plateCenterY + plateHeight * 0.5 - radius);
    ctx.quadraticCurveTo(plateCenterX + plateWidth * 0.5, plateCenterY + plateHeight * 0.5, plateCenterX + plateWidth * 0.5 - radius, plateCenterY + plateHeight * 0.5);
    ctx.lineTo(plateCenterX - plateWidth * 0.5 + radius, plateCenterY + plateHeight * 0.5);
    ctx.quadraticCurveTo(plateCenterX - plateWidth * 0.5, plateCenterY + plateHeight * 0.5, plateCenterX - plateWidth * 0.5, plateCenterY + plateHeight * 0.5 - radius);
    ctx.lineTo(plateCenterX - plateWidth * 0.5, plateCenterY - plateHeight * 0.5 + radius);
    ctx.quadraticCurveTo(plateCenterX - plateWidth * 0.5, plateCenterY - plateHeight * 0.5, plateCenterX - plateWidth * 0.5 + radius, plateCenterY - plateHeight * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Plate edge
    ctx.strokeStyle = `rgb(${Math.floor(85 + plateLightness * 35)}, ${Math.floor(85 + plateLightness * 30)}, ${Math.floor(80 + plateLightness * 25)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    
    // === ARMOR PLATE TOP FACE ===
    const topPlateColor = Math.floor(60 + plateLightness * 30);
    ctx.fillStyle = `rgb(${topPlateColor + 15}, ${topPlateColor + 12}, ${topPlateColor + 8})`;
    ctx.beginPath();
    ctx.moveTo(plateCenterX - plateWidth * 0.5 + radius, plateCenterY - plateHeight * 0.5);
    ctx.lineTo(plateCenterX - plateWidth * 0.5 + radius - plateDepthSize * 0.4, plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25);
    ctx.lineTo(plateCenterX + plateWidth * 0.5 - radius - plateDepthSize * 0.4, plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25);
    ctx.lineTo(plateCenterX + plateWidth * 0.5 - radius, plateCenterY - plateHeight * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // === PLATE RIGHT SIDE FACE ===
    if (plateSide > -0.3) {
      const sideColor = Math.floor(50 + plateLightness * 25);
      ctx.fillStyle = `rgb(${sideColor}, ${sideColor - 3}, ${sideColor - 6})`;
      ctx.beginPath();
      ctx.moveTo(plateCenterX + plateWidth * 0.5, plateCenterY - plateHeight * 0.5 + radius);
      ctx.lineTo(plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4, plateCenterY - plateHeight * 0.5 + radius - plateDepthSize * 0.25);
      ctx.lineTo(plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4, plateCenterY + plateHeight * 0.5 - radius - plateDepthSize * 0.25);
      ctx.lineTo(plateCenterX + plateWidth * 0.5, plateCenterY + plateHeight * 0.5 - radius);
      ctx.closePath();
      ctx.fill();
    }
    
    // Rivets on corners
    ctx.fillStyle = "#7a7a82";
    const rivetOffsets = [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]];
    for (const [rx, ry] of rivetOffsets) {
      ctx.beginPath();
      ctx.arc(plateCenterX + rx * plateWidth * 0.85, plateCenterY + ry * plateHeight * 0.85, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Inner darker area for number
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.arc(plateCenterX, plateCenterY, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();
    
    // Number on plate (stenciled style)
    ctx.font = `bold ${9 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(220, 200, 150, ${0.7 + plateLightness * 0.3})`;
    ctx.fillText("⌖", plateCenterX, plateCenterY + 0.5 * zoom);
    
    // Battle damage scratches
    ctx.strokeStyle = `rgba(30, 30, 35, ${0.4 + plateLightness * 0.2})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(plateCenterX - 4 * zoom, plateCenterY - 6 * zoom);
    ctx.lineTo(plateCenterX - 1 * zoom, plateCenterY - 3 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(plateCenterX + 3 * zoom, plateCenterY + 4 * zoom);
    ctx.lineTo(plateCenterX + 5 * zoom, plateCenterY + 7 * zoom);
    ctx.stroke();
  };
  
  // Helper function to draw the ammo belt
  const drawAmmoBelt = () => {
    // Belt exit point from ammo box
    const beltExitX = boxCenterX + (boxSide > 0 ? -8 : 8) * zoom;
    const beltExitY = boxCenterY - 8 * zoom;
    
    // Belt entry point to turret feed mechanism
    const beltEntryX = turretX - 5 * zoom + beltShakeX;
    const beltEntryY = turretY - 8 * zoom + beltShakeY;
    
    // Belt curve control points
    const beltMidX = (beltExitX + beltEntryX) * 0.5 + Math.cos(rotation) * 15 * zoom;
    const beltMidY = (beltExitY + beltEntryY) * 0.5 - 12 * zoom + Math.sin(rotation) * 8 * zoom;
    
    // Belt shadow/channel
    ctx.strokeStyle = "#1a1a22";
    ctx.lineWidth = 8 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(beltExitX, beltExitY);
    ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
    ctx.stroke();
    
    // Belt guide channel
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(beltExitX, beltExitY);
    ctx.quadraticCurveTo(beltMidX, beltMidY, beltEntryX, beltEntryY);
    ctx.stroke();
    
    // Animated bullets along belt
    const beltBulletCount = 16;
    for (let i = 0; i < beltBulletCount; i++) {
      const beltProgress = isAttacking ? (i / beltBulletCount + time * 8) % 1 : i / beltBulletCount;
      const t = beltProgress;
      const oneMinusT = 1 - t;
      
      const bulletX = oneMinusT * oneMinusT * beltExitX + 2 * oneMinusT * t * beltMidX + t * t * beltEntryX;
      const bulletY = oneMinusT * oneMinusT * beltExitY + 2 * oneMinusT * t * beltMidY + t * t * beltEntryY;
      
      const tangentX = 2 * oneMinusT * (beltMidX - beltExitX) + 2 * t * (beltEntryX - beltMidX);
      const tangentY = 2 * oneMinusT * (beltMidY - beltExitY) + 2 * t * (beltEntryY - beltMidY);
      const bulletAngle = Math.atan2(tangentY, tangentX);
      
      const shakeIntensity = isAttacking ? attackPulse * 0.5 : 0;
      const bulletShakeX = Math.sin(time * 70 + i * 1.3) * 2 * zoom * shakeIntensity;
      const bulletShakeY = Math.cos(time * 55 + i * 1.7) * 1.5 * zoom * shakeIntensity;
      
      const finalBulletX = bulletX + bulletShakeX;
      const finalBulletY = bulletY + bulletShakeY;
      
      // Metal link
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.ellipse(finalBulletX, finalBulletY, 2 * zoom, 1.2 * zoom, bulletAngle, 0, Math.PI * 2);
      ctx.fill();
      
      // Brass casing
      const brassGrad = ctx.createLinearGradient(finalBulletX - 2 * zoom, finalBulletY - 3 * zoom, finalBulletX + 2 * zoom, finalBulletY + 3 * zoom);
      brassGrad.addColorStop(0, "#e6c54a");
      brassGrad.addColorStop(0.3, "#daa520");
      brassGrad.addColorStop(0.7, "#b8860b");
      brassGrad.addColorStop(1, "#8b6914");
      ctx.fillStyle = brassGrad;
      ctx.beginPath();
      ctx.ellipse(finalBulletX, finalBulletY, 2.5 * zoom, 4 * zoom, bulletAngle + Math.PI * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Bullet tip
      const tipOffsetX = Math.cos(bulletAngle + Math.PI * 0.5) * 2.5 * zoom;
      const tipOffsetY = Math.sin(bulletAngle + Math.PI * 0.5) * 2.5 * zoom;
      ctx.fillStyle = "#8b4513";
      ctx.beginPath();
      ctx.ellipse(finalBulletX + tipOffsetX, finalBulletY + tipOffsetY, 1.8 * zoom, 2 * zoom, bulletAngle + Math.PI * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = "rgba(255, 230, 150, 0.4)";
      ctx.beginPath();
      ctx.ellipse(finalBulletX - 0.5 * zoom, finalBulletY - 0.5 * zoom, 0.8 * zoom, 1.5 * zoom, bulletAngle + Math.PI * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Feed mechanism
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(beltEntryX, beltEntryY, 5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    
    // Spinning gear
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(beltEntryX, beltEntryY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 6; i++) {
      const gearAngle = spinAngle * 2 + (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(beltEntryX, beltEntryY);
      ctx.lineTo(beltEntryX + Math.cos(gearAngle) * 4 * zoom, beltEntryY + Math.sin(gearAngle) * 4 * zoom);
      ctx.stroke();
    }
    
    // Belt guide cover
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(beltEntryX - 4 * zoom, beltEntryY - 6 * zoom);
    ctx.lineTo(beltEntryX + 2 * zoom, beltEntryY - 6 * zoom);
    ctx.lineTo(beltEntryX + 4 * zoom, beltEntryY - 2 * zoom);
    ctx.lineTo(beltEntryX - 2 * zoom, beltEntryY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
  };
  
  // Draw items that should be BEHIND the barrel first (when facing player or when position is behind)
  if (boxBehindAll) {
    drawAmmoBox();
    drawAmmoBelt();
  }
  if (plateBehindAll) {
    drawArmorPlate();
  }

  // Barrel mounting collar that rotates with aim
  const collarX = turretX + cosR * 5 * zoom;
  const collarY = turretY - 14 * zoom + sinR * 4 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 6 * zoom, 4 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // === POWER CORE - smaller and more subtle ===
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 14 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGlow = 0.6 + Math.sin(time * 10) * 0.25 + attackPulse * 0.25;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 14 * zoom,
    0,
    turretX,
    turretY - 14 * zoom,
    4 * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 240, 150, ${coreGlow})`);
  coreGrad.addColorStop(0.3, `rgba(255, 200, 80, ${coreGlow * 0.7})`);
  coreGrad.addColorStop(0.7, `rgba(255, 150, 30, ${coreGlow * 0.4})`);
  coreGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);

  ctx.shadowColor = "#ff8800";
  ctx.shadowBlur = (6 + attackPulse * 6) * zoom;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 14 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Spinning core indicator
  ctx.strokeStyle = `rgba(255, 200, 100, ${coreGlow * 0.8})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 4; i++) {
    const indicatorAngle = spinAngle * 0.2 + (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      turretX,
      turretY - 14 * zoom,
      3 * zoom,
      indicatorAngle,
      indicatorAngle + 0.3
    );
    ctx.stroke();
  }

  if (!facingAway) {
    drawGatlingBarrels(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time,
      recoilOffset
    );
  }

  // Draw items that should be IN FRONT of the barrel after barrel is drawn (only when NOT facing player AND position is in front)
  if (!boxBehindAll) {
    drawAmmoBox();
    drawAmmoBelt();
  }
  if (!plateBehindAll) {
    drawArmorPlate();
  }

  // === HEAT VENTS ===
  if (isAttacking) {
    for (let i = 0; i < 3; i++) {
      const ventX = turretX + (i - 1) * 8 * zoom;
      const ventY = turretY - 24 * zoom - Math.random() * 5 * zoom;
      const ventAlpha = attackPulse * (0.3 + Math.random() * 0.2);

      ctx.fillStyle = `rgba(255, 150, 50, ${ventAlpha})`;
      ctx.beginPath();
      ctx.ellipse(ventX, ventY, 3 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Helper for gatling barrel cluster with pitch - 6 barrels properly aimed
function drawGatlingBarrels(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  foreshorten: number,
  spinAngle: number,
  zoom: number,
  tower: Tower,
  time: number,
  recoilOffset: number = 0
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 100;

  // Calculate pitch - barrel aims down at ground-level enemies 
  const towerElevation = 30 * zoom;
  const baseLength = 48 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, baseLength);
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);

  // Apply pitch to barrel length calculation
  const effectiveBarrelLength = (baseLength * (0.5 + foreshorten * 0.5) - recoilOffset) * pitchCos;
  const pitchDrop = baseLength * (0.5 + foreshorten * 0.5) * pitchSin * 0.5;

  const endX = pivotX + cosR * effectiveBarrelLength;
  const endY = pivotY + sinR * effectiveBarrelLength * 0.5 + pitchDrop;

  // === ANGULAR BARREL HOUSING (hexagonal for 6 barrels) ===
  const housingOffset = (12 * zoom - recoilOffset * 0.3) * pitchCos;
  const housingPitchDrop = (12 * zoom - recoilOffset * 0.3) * pitchSin * 0.3;
  const housingCenterX = pivotX + cosR * housingOffset;
  const housingCenterY = pivotY + sinR * housingOffset * 0.5 + housingPitchDrop;

  const housingGrad = ctx.createLinearGradient(
    housingCenterX - 12 * zoom,
    housingCenterY - 10 * zoom,
    housingCenterX + 8 * zoom,
    housingCenterY + 10 * zoom
  );
  housingGrad.addColorStop(0, "#5a5a62");
  housingGrad.addColorStop(0.3, "#7a7a82");
  housingGrad.addColorStop(0.5, "#8a8a92");
  housingGrad.addColorStop(0.7, "#6a6a72");
  housingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = housingGrad;

  // Hexagonal housing
  ctx.beginPath();
  const hexRadius = 12 * zoom;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const hx = housingCenterX + Math.cos(angle) * hexRadius;
    const hy = housingCenterY + Math.sin(angle) * hexRadius * 0.7;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#9a9aa2";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Armored face plates on hexagon
  ctx.fillStyle = "#4a4a52";
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const nextAngle = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(housingCenterX, housingCenterY);
    ctx.lineTo(
      housingCenterX + Math.cos(angle) * hexRadius * 0.9,
      housingCenterY + Math.sin(angle) * hexRadius * 0.7 * 0.9
    );
    ctx.lineTo(
      housingCenterX + Math.cos(nextAngle) * hexRadius * 0.9,
      housingCenterY + Math.sin(nextAngle) * hexRadius * 0.7 * 0.9
    );
    ctx.closePath();
    if (i % 2 === 0) ctx.fill();
  }

  // Central hub
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(housingCenterX, housingCenterY, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Spinning indicator on hub
  ctx.strokeStyle = `rgba(255, 180, 50, ${0.6 + Math.sin(spinAngle * 0.5) * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(housingCenterX, housingCenterY, 4 * zoom, spinAngle, spinAngle + Math.PI);
  ctx.stroke();

  // === 6 SPINNING BARRELS with proper pitch and aiming ===
  const barrelCount = 6;
  const barrelRadius = 7 * zoom; // Radius from center for barrel positions
  
  for (let i = 0; i < barrelCount; i++) {
    const barrelAngle = spinAngle + (i / barrelCount) * Math.PI * 2;
    const barrelDepth = Math.cos(barrelAngle);
    const barrelOffset = Math.sin(barrelAngle) * barrelRadius;

    if (barrelDepth > -0.6) {
      const shade = 0.3 + barrelDepth * 0.4;
      const barrelColor = Math.floor(50 + shade * 60);

      // Perpendicular offset for barrel position in the rotating cluster
      const perpX = -sinR * barrelOffset;
      const perpY = cosR * barrelOffset * 0.5;

      // Barrel start position with pitch applied
      const bStartX = pivotX + cosR * ((12 * zoom - recoilOffset * 0.3) * pitchCos) + perpX;
      const bStartY = pivotY + sinR * ((6 * zoom - recoilOffset * 0.15) * pitchCos) + perpY + housingPitchDrop;
      
      // Barrel end position
      const bEndX = endX + perpX * 0.7;
      const bEndY = endY + perpY * 0.7;

      // Barrel thickness
      const bw = 4.5 * zoom;
      const perpBX = -sinR * bw;
      const perpBY = cosR * bw * 0.5;

      // Cylindrical gradient across the barrel width
      const barrelGrad = ctx.createLinearGradient(
        bStartX + perpBX,
        bStartY + perpBY,
        bStartX - perpBX,
        bStartY - perpBY
      );
      const highlight = barrelDepth > 0 ? 25 : 10;
      barrelGrad.addColorStop(0, `rgb(${barrelColor + highlight + 15}, ${barrelColor + highlight + 15}, ${barrelColor + highlight + 20})`);
      barrelGrad.addColorStop(0.3, `rgb(${barrelColor + highlight}, ${barrelColor + highlight}, ${barrelColor + highlight + 8})`);
      barrelGrad.addColorStop(0.7, `rgb(${barrelColor}, ${barrelColor}, ${barrelColor + 8})`);
      barrelGrad.addColorStop(1, `rgb(${barrelColor - 15}, ${barrelColor - 15}, ${barrelColor - 10})`);
      ctx.fillStyle = barrelGrad;

      // Draw barrel body
      ctx.beginPath();
      ctx.moveTo(bStartX + perpBX, bStartY + perpBY);
      ctx.lineTo(bEndX + perpBX * 0.65, bEndY + perpBY * 0.65);
      ctx.lineTo(bEndX - perpBX * 0.65, bEndY - perpBY * 0.65);
      ctx.lineTo(bStartX - perpBX, bStartY - perpBY);
      ctx.closePath();
      ctx.fill();

      // Highlight line along top of barrel for cylindrical effect
      if (barrelDepth > 0.1) {
        ctx.strokeStyle = `rgba(160, 160, 170, ${shade * 0.5})`;
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(bStartX + perpBX * 0.5, bStartY + perpBY * 0.5);
        ctx.lineTo(bEndX + perpBX * 0.35, bEndY + perpBY * 0.35);
        ctx.stroke();
      }

      // Barrel reinforcement band
      if (barrelDepth > 0) {
        const bandT = 0.5;
        const bandX = bStartX + (bEndX - bStartX) * bandT;
        const bandY = bStartY + (bEndY - bStartY) * bandT;
        ctx.strokeStyle = `rgb(${barrelColor + 20}, ${barrelColor + 20}, ${barrelColor + 25})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(bandX + perpBX * 0.7, bandY + perpBY * 0.7);
        ctx.lineTo(bandX - perpBX * 0.7, bandY - perpBY * 0.7);
        ctx.stroke();
      }

      // Draw barrel end cap and bore holes
      // Show bore holes when NOT facing away from camera (up/back direction)
      const facingAway = sinR < -0.3;
      const barrelMuzzleVisible = !facingAway; // Visible when gun points toward camera
      
      if (barrelDepth > 0.1) {
        // Barrel end cap (rim) - always show
        const endCapRadius = 3 * zoom * (0.7 + foreshorten * 0.3);
        ctx.fillStyle = facingAway 
          ? `rgb(${barrelColor - 5}, ${barrelColor - 5}, ${barrelColor})` 
          : `rgb(${barrelColor + 10}, ${barrelColor + 10}, ${barrelColor + 15})`;
        ctx.beginPath();
        ctx.arc(bEndX, bEndY, endCapRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bore hole (only when facing camera and NOT facing away)
        if (barrelMuzzleVisible) {
          const viewFactor = 0.6 + cosR * 0.4;
          const boreRadius = endCapRadius * 0.7 * viewFactor;
          ctx.fillStyle = "#0a0a0a";
          ctx.beginPath();
          ctx.arc(bEndX, bEndY, boreRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Per-barrel muzzle flash glow when attacking (only when facing camera)
      if (barrelDepth > 0.15 && barrelMuzzleVisible && isAttacking) {
        const flashIntensity = 1 - timeSinceFire / 100;
        ctx.fillStyle = `rgba(255, 200, 80, ${flashIntensity * 0.6})`;
        ctx.beginPath();
        ctx.arc(bEndX, bEndY, 2.5 * zoom * foreshorten, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // === FRONT MUZZLE PLATE (hexagonal to match 6 barrels) ===
  const plateX = endX - cosR * 4 * zoom * pitchCos;
  const plateY = endY - sinR * 2 * zoom;
  
  // Determine if facing away - when facing away (up/back), don't show bore holes
  const facingAway = sinR < -0.3;
  const muzzleFacingCamera = !facingAway; // Muzzle holes visible when gun points toward camera

  const plateGrad = ctx.createRadialGradient(
    plateX - 2 * zoom,
    plateY - 1 * zoom,
    0,
    plateX,
    plateY,
    14 * zoom
  );
  
  // Darker gradient when facing away (showing back of muzzle)
  if (facingAway) {
    plateGrad.addColorStop(0, "#5a5a62");
    plateGrad.addColorStop(0.5, "#4a4a52");
    plateGrad.addColorStop(1, "#3a3a42");
  } else {
    plateGrad.addColorStop(0, "#8a8a92");
    plateGrad.addColorStop(0.5, "#6a6a72");
    plateGrad.addColorStop(1, "#4a4a52");
  }
  ctx.fillStyle = plateGrad;

  // Hexagonal front plate
  ctx.beginPath();
  const plateRadius = 10 * zoom * (0.6 + foreshorten * 0.4);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + rotation;
    const px = plateX + Math.cos(angle) * plateRadius;
    const py = plateY + Math.sin(angle) * plateRadius * 0.55;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = facingAway ? "#6a6a72" : "#9a9aa2";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // 6 barrel holes on front plate - ONLY when muzzle is facing camera
  if (muzzleFacingCamera) {
    const holeRadius = 4.5 * zoom * (0.5 + foreshorten * 0.5);
    for (let i = 0; i < 8; i++) {
      const holeAngle = spinAngle + (i / 6) * Math.PI * 2;
      const holeDepth = Math.cos(holeAngle);
      // Draw holes that are visible (not fully behind)
      if (holeDepth > -0.3) {
        const holeX = plateX + Math.cos(holeAngle + rotation) * holeRadius;
        const holeY = plateY + Math.sin(holeAngle + rotation) * holeRadius * 0.5;
        
        // Hole rim
        ctx.fillStyle = holeDepth > 0 ? "#3a3a42" : "#2a2a32";
        ctx.beginPath();
        ctx.arc(holeX, holeY, 2.8 * zoom * foreshorten, 0, Math.PI * 2);
        ctx.fill();
        
        // Dark bore
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.arc(holeX, holeY, 2 * zoom * foreshorten * (0.6 + cosR * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Spinning indicator on front hub - only when facing camera
    ctx.strokeStyle = `rgba(255, 150, 50, ${0.4 + Math.sin(spinAngle) * 0.2})`;
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      const indicatorAngle = spinAngle + (i / 3) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(plateX, plateY, 2.5 * zoom, indicatorAngle, indicatorAngle + 0.5);
      ctx.stroke();
    }
  } else if (facingAway) {
    // When facing away, show rear plate details instead of holes
    // Rear mounting bolts in a hexagonal pattern
    ctx.fillStyle = "#5a5a62";
    for (let i = 0; i < 6; i++) {
      const boltAngle = (i / 6) * Math.PI * 2 + rotation;
      const boltR = 6 * zoom * (0.5 + foreshorten * 0.5);
      const boltX = plateX + Math.cos(boltAngle) * boltR;
      const boltY = plateY + Math.sin(boltAngle) * boltR * 0.5;
      ctx.beginPath();
      ctx.arc(boltX, boltY, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Rear plate structural lines
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      const lineAngle = (i / 3) * Math.PI + rotation;
      ctx.beginPath();
      ctx.moveTo(plateX, plateY);
      ctx.lineTo(
        plateX + Math.cos(lineAngle) * plateRadius * 0.8,
        plateY + Math.sin(lineAngle) * plateRadius * 0.8 * 0.55
      );
      ctx.stroke();
    }
  }

  // Center hub on front plate
  ctx.fillStyle = facingAway ? "" : "#2a2a32";
  ctx.beginPath();
  ctx.arc(plateX, plateY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === MUZZLE FLASH - proper Nassau-style with glow (only when facing camera) ===
  if (isAttacking && muzzleFacingCamera) {
    const flash = 1 - timeSinceFire / 100;
    const flashX = endX + cosR * 10 * zoom;
    const flashY = endY + sinR * 5 * zoom + pitchDrop * 0.2;

    // Outer glow
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 25 * zoom * flash;

    // Main flash gradient
    const flashGrad = ctx.createRadialGradient(
      flashX, flashY, 0,
      flashX, flashY, 22 * zoom * flash
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
    flashGrad.addColorStop(0.15, `rgba(255, 240, 150, ${flash * 0.95})`);
    flashGrad.addColorStop(0.4, `rgba(255, 180, 80, ${flash * 0.7})`);
    flashGrad.addColorStop(0.7, `rgba(255, 120, 30, ${flash * 0.4})`);
    flashGrad.addColorStop(1, `rgba(200, 60, 0, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 22 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.9})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 6 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    // Multiple muzzle streaks for gatling effect
    for (let i = 0; i < 8; i++) {
      const streakAngle = rotation + (i / 8) * Math.PI * 2 * 0.4 - Math.PI * 0.2 + (Math.random() - 0.5) * 0.3;
      const streakLen = (12 + Math.random() * 18) * zoom * flash;
      ctx.strokeStyle = `rgba(255, 220, 100, ${flash * 0.8})`;
      ctx.lineWidth = (2 + Math.random()) * zoom * flash;
      ctx.beginPath();
      ctx.moveTo(flashX, flashY);
      ctx.lineTo(
        flashX + Math.cos(streakAngle) * streakLen,
        flashY + Math.sin(streakAngle) * streakLen * 0.5 + pitchDrop * 0.05
      );
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }

  // === SMOKE WISPS ===
  if (timeSinceFire > 50 && timeSinceFire < 350) {
    const smokePhase = (timeSinceFire - 50) / 300;
    for (let i = 0; i < 4; i++) {
      const smokeX = endX + cosR * (6 + smokePhase * 12) * zoom + (Math.random() - 0.5) * 10 * zoom;
      const smokeY = endY - smokePhase * 18 * zoom - i * 5 * zoom;
      const smokeAlpha = (1 - smokePhase) * 0.35;

      ctx.fillStyle = `rgba(100, 100, 110, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, (3 + smokePhase * 5) * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderFlamethrower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
) {
  const rotation = tower.rotation || 0;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;

  if (timeSinceFire < 300) {
    const firePhase = timeSinceFire / 300;
    if (firePhase < 0.1) {
      recoilOffset = (firePhase / 0.1) * 5 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 12) * 1.5 * zoom;
    } else {
      const returnPhase = (firePhase - 0.1) / 0.9;
      recoilOffset = 5 * zoom * (1 - returnPhase);
      turretShake =
        Math.sin(returnPhase * Math.PI * 3) * (1 - returnPhase) * zoom;
    }
  }

  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Armored base platform
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 21 * zoom;
    const toothY = turretY - 2 * zoom + Math.sin(toothAngle) * 10.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  if (facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      turretX,
      turretY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time,
      recoilOffset
    );
  }

  // Main fuel tank
  const tankGrad = ctx.createLinearGradient(
    turretX - 12 * zoom,
    turretY - 24 * zoom,
    turretX + 4 * zoom,
    turretY
  );
  tankGrad.addColorStop(0, "#cc3030");
  tankGrad.addColorStop(0.2, "#aa2020");
  tankGrad.addColorStop(0.5, "#881515");
  tankGrad.addColorStop(0.8, "#661010");
  tankGrad.addColorStop(1, "#440808");
  ctx.fillStyle = tankGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX - 6 * zoom,
    turretY - 12 * zoom,
    9 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Tank highlights
  ctx.strokeStyle = "#dd4040";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX - 8 * zoom,
    turretY - 12 * zoom,
    2 * zoom,
    10 * zoom,
    0,
    -0.3,
    0.3
  );
  ctx.stroke();

  // Warning stripes
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const stripeY = turretY - 18 * zoom + i * 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      turretX - 6 * zoom,
      stripeY,
      6 * zoom,
      9 * zoom,
      0,
      -0.35 * Math.PI,
      0.35 * Math.PI
    );
    ctx.stroke();
  }

  // Black hazard stripes
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 2; i++) {
    const stripeY = turretY - 15 * zoom + i * 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      turretX - 6 * zoom,
      stripeY,
      6 * zoom,
      9 * zoom,
      0,
      -0.35 * Math.PI,
      0.35 * Math.PI
    );
    ctx.stroke();
  }

  // Tank cap
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    turretX - 6 * zoom,
    turretY - 26 * zoom,
    6 * zoom,
    3 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.arc(turretX - 6 * zoom, turretY - 26 * zoom, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pressure gauge
  ctx.fillStyle = "#ddd";
  ctx.beginPath();
  ctx.arc(turretX + 2 * zoom, turretY - 6 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(turretX + 2 * zoom, turretY - 6 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(
    turretX + 2 * zoom,
    turretY - 6 * zoom,
    3 * zoom,
    Math.PI * 0.8,
    Math.PI * 1.2
  );
  ctx.stroke();
  ctx.strokeStyle = "#f00";
  ctx.beginPath();
  ctx.arc(
    turretX + 2 * zoom,
    turretY - 6 * zoom,
    3 * zoom,
    Math.PI * 1.5,
    Math.PI * 1.8
  );
  ctx.stroke();

  const needleJump =
    timeSinceFire < 300 ? Math.sin(timeSinceFire * 0.05) * 0.2 : 0;
  const needleAngle = Math.PI * (0.9 + Math.sin(time * 2) * 0.15 + needleJump);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX + 2 * zoom, turretY - 6 * zoom);
  ctx.lineTo(
    turretX + 2 * zoom + Math.cos(needleAngle) * 3 * zoom,
    turretY - 6 * zoom + Math.sin(needleAngle) * 3 * zoom
  );
  ctx.stroke();

  // Secondary fuel tank
  ctx.fillStyle = "#884020";
  ctx.beginPath();
  ctx.ellipse(
    turretX + 8 * zoom,
    turretY - 10 * zoom,
    5 * zoom,
    8 * zoom,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Fuel lines
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 2 * zoom, turretY - 8 * zoom);
  ctx.quadraticCurveTo(
    turretX + 4 * zoom,
    turretY - 14 * zoom,
    turretX + 6 * zoom,
    turretY - 10 * zoom
  );
  ctx.stroke();

  // Igniter housing base
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 10 * zoom,
    10 * zoom,
    7 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ROTATING FLAME DEFLECTOR SHIELDS - 5 heat shields that rotate with turret aim
  const flameShieldCount = 5;
  for (let i = 0; i < flameShieldCount; i++) {
    const baseAngle = (i / flameShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;
    
    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;
    
    // Only draw visible shields
    if (shieldDepth > -0.55) {
      const innerR = 5 * zoom;
      const outerR = 9 * zoom;
      const angleSpan = Math.PI / 2.8;
      
      // Shield gradient - heat-resistant orange/brown tint
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        turretY - 10 * zoom + Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.7,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        turretY - 10 * zoom + Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.7
      );
      
      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(140, 100, 80, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(110, 80, 65, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(80, 60, 50, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(90, 70, 55, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(100, 75, 60, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(80, 60, 50, ${visibility})`);
      }
      
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      
      // Draw angular heat shield shape
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY - 10 * zoom + Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.7
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY - 10 * zoom + Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.7 - 2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 1.5 * zoom),
        turretY - 10 * zoom + Math.sin(shieldAngle) * (outerR + 1.5 * zoom) * 0.7 - 2.5 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY - 10 * zoom + Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.7 - 2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY - 10 * zoom + Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.7
      );
      ctx.closePath();
      ctx.fill();
      
      // Heat-scorched edge
      ctx.strokeStyle = `rgba(180, 120, 80, ${visibility * 0.5})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();
      
      // Heat vent hole on each shield
      const ventX = turretX + Math.cos(shieldAngle) * (outerR - 1.5 * zoom);
      const ventY = turretY - 10 * zoom + Math.sin(shieldAngle) * (outerR - 1.5 * zoom) * 0.7 - 1.5 * zoom;
      ctx.fillStyle = `rgba(40, 30, 25, ${visibility})`;
      ctx.beginPath();
      ctx.arc(ventX, ventY, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner igniter ring
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(turretX, turretY - 10 * zoom, 6 * zoom, 4.5 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Nozzle mounting collar that rotates with aim
  const nozzleCollarX = turretX + cosR * 4 * zoom;
  const nozzleCollarY = turretY - 10 * zoom + sinR * 2.5 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(nozzleCollarX, nozzleCollarY, 5 * zoom, 3.5 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Pilot flame indicator - small glowing center
  const flameGlow = timeSinceFire < 300 ? 0.8 : 0.5 + Math.sin(time * 6) * 0.2;
  const flameGrad = ctx.createRadialGradient(
    turretX,
    turretY - 10 * zoom,
    0,
    turretX,
    turretY - 10 * zoom,
    3.5 * zoom
  );
  flameGrad.addColorStop(0, `rgba(255, 200, 100, ${flameGlow})`);
  flameGrad.addColorStop(0.4, `rgba(255, 140, 50, ${flameGlow * 0.7})`);
  flameGrad.addColorStop(0.8, `rgba(255, 80, 20, ${flameGlow * 0.4})`);
  flameGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 10 * zoom, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === 3D ISOMETRIC FUEL TANK (LEFT) AND ARMOR PLATE (RIGHT) ===
  const isAttacking = timeSinceFire < 300;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 300 : 0;
  
  // Fuel tank position - rotates with turret on the LEFT side
  const tankAngle = rotation + Math.PI * 0.5;
  const tankDistance = 24 * zoom;
  const tankCenterX = turretX + Math.cos(tankAngle) * tankDistance;
  const tankCenterY = turretY - 6 * zoom + Math.sin(tankAngle) * tankDistance * 0.5;
  
  // Armor plate position - rotates with turret on the RIGHT side
  const plateAngle = rotation - Math.PI * 0.5;
  const plateDistance = 22 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY = turretY - 8 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;
  
  // Determine layering - when facing player (sinR > 0), accessories behind everything
  // When facing away (sinR < 0), accessories in front
  const facingPlayer = sinR > 0.2;
  const tankBehindAll = facingPlayer || Math.sin(tankAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;
  
  // Calculate visibility - always show, 3D rendering handles face visibility
  const tankSide = Math.sin(tankAngle);
  const tankVisible = true;
  const plateVisible = true;
  
  // Tower ID for plate number
  const towerId = tower.id;
  
  // Draw items BEHIND nozzle first (when facing player or when position is behind)
  if (tankBehindAll && tankVisible) {
    draw3DFuelTank(ctx, tankCenterX, tankCenterY, tankAngle, zoom, time, isAttacking, attackPulse, 'small');
    drawFuelFeedingTube(ctx, tankCenterX, tankCenterY, turretX, turretY - 8 * zoom, rotation, zoom, time, isAttacking, attackPulse, tankSide);
  }
  if (plateBehindAll && plateVisible) {
    draw3DArmorPlate(ctx, plateCenterX, plateCenterY, plateAngle, zoom, towerId, 'small');
  }

  if (!facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      turretX,
      turretY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time,
      recoilOffset
    );
  }
  
  // Draw items IN FRONT of nozzle after (only when NOT facing player AND position is in front)
  if (!tankBehindAll && tankVisible) {
    draw3DFuelTank(ctx, tankCenterX, tankCenterY, tankAngle, zoom, time, isAttacking, attackPulse, 'small');
    drawFuelFeedingTube(ctx, tankCenterX, tankCenterY, turretX, turretY - 8 * zoom, rotation, zoom, time, isAttacking, attackPulse, tankSide);
  }
  if (!plateBehindAll && plateVisible) {
    draw3DArmorPlate(ctx, plateCenterX, plateCenterY, plateAngle, zoom, towerId, 'small');
  }
}

// Helper for flamethrower nozzle with pitch
function drawFlamethrowerNozzle(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number,
  recoilOffset: number = 0
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // Calculate pitch
  const towerElevation = 25 * zoom;
  const baseLength = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, baseLength);
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);

  const recoiledPivotX = pivotX - cosR * recoilOffset;
  const recoiledPivotY = pivotY - sinR * recoilOffset * 0.5;

  const nozzleLength = baseLength * (0.5 + foreshorten * 0.5) * pitchCos;
  const pitchDrop = baseLength * (0.5 + foreshorten * 0.5) * pitchSin * 0.5;

  const endX = recoiledPivotX + cosR * nozzleLength;
  const endY = recoiledPivotY + sinR * nozzleLength * 0.5 + pitchDrop;

  const perpX = -sinR * 5 * zoom;
  const perpY = cosR * 2.5 * zoom;

  // Fuel line
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX - 4 * zoom, recoiledPivotY);
  ctx.quadraticCurveTo(
    recoiledPivotX + cosR * 6 * zoom,
    recoiledPivotY + sinR * 3 * zoom - 4 * zoom,
    recoiledPivotX + cosR * 10 * zoom * pitchCos,
    recoiledPivotY + sinR * 5 * zoom + pitchDrop * 0.3
  );
  ctx.stroke();

  // Nozzle body
  const nozzleGrad = ctx.createLinearGradient(
    recoiledPivotX + perpX,
    recoiledPivotY + perpY,
    recoiledPivotX - perpX,
    recoiledPivotY - perpY
  );
  nozzleGrad.addColorStop(0, "#5a5a62");
  nozzleGrad.addColorStop(0.3, "#6a6a72");
  nozzleGrad.addColorStop(0.7, "#5a5a62");
  nozzleGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = nozzleGrad;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX, recoiledPivotY + perpY);
  ctx.lineTo(endX + perpX * 0.7, endY + perpY * 0.7);
  ctx.lineTo(endX - perpX * 0.7, endY - perpY * 0.7);
  ctx.lineTo(recoiledPivotX - perpX, recoiledPivotY - perpY);
  ctx.closePath();
  ctx.fill();

  // Nozzle rings - adjusted for pitch
  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    const t = 0.3 + i * 0.2;
    const rx = recoiledPivotX + cosR * nozzleLength * t;
    const ry = recoiledPivotY + sinR * nozzleLength * t * 0.5 + pitchDrop * t;
    const ringMult = 1 - t * 0.3;
    ctx.beginPath();
    ctx.moveTo(rx + perpX * ringMult, ry + perpY * ringMult);
    ctx.lineTo(rx - perpX * ringMult, ry - perpY * ringMult);
    ctx.stroke();
  }

  // Flared nozzle tip
  ctx.fillStyle = "#3a3a42";
  const tipStart = 0.8;
  const tsx = recoiledPivotX + cosR * nozzleLength * tipStart;
  const tsy =
    recoiledPivotY +
    sinR * nozzleLength * tipStart * 0.5 +
    pitchDrop * tipStart;
  ctx.beginPath();
  ctx.moveTo(tsx + perpX * 0.7, tsy + perpY * 0.7);
  ctx.lineTo(endX + perpX * 1.4, endY + perpY * 1.4);
  ctx.lineTo(endX - perpX * 1.4, endY - perpY * 1.4);
  ctx.lineTo(tsx - perpX * 0.7, tsy - perpY * 0.7);
  ctx.closePath();
  ctx.fill();

  // Pilot light
  const pilotGlow = 0.7 + Math.sin(time * 10) * 0.3;
  ctx.fillStyle = `rgba(0, 180, 255, ${pilotGlow})`;
  ctx.shadowColor = "#00aaff";
  ctx.shadowBlur = 4 * zoom;
  const pilotX = endX - cosR * 6 * zoom * pitchCos + perpX * 0.5;
  const pilotY = endY - sinR * 3 * zoom + perpY * 0.5;
  ctx.beginPath();
  ctx.arc(pilotX, pilotY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Flame effect - follows pitched direction
  const timeSinceFire = Date.now() - tower.lastAttack;
  if (timeSinceFire < 500) {
    const flameIntensity = 1 - timeSinceFire / 500;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 25 * zoom * flameIntensity;

    for (let i = 0; i < 10; i++) {
      const flameT = 1 + i * 0.12;
      const flameX = recoiledPivotX + cosR * nozzleLength * flameT;
      const flameY =
        recoiledPivotY +
        sinR * nozzleLength * flameT * 0.5 +
        pitchDrop * flameT;
      const wobble = Math.sin(time * 35 + i * 0.8) * (2 + i * 0.4) * zoom;
      const flameSize = (16 - i * 1.2) * zoom * flameIntensity;

      const flameGrad = ctx.createRadialGradient(
        flameX,
        flameY + wobble,
        0,
        flameX,
        flameY + wobble,
        flameSize
      );
      flameGrad.addColorStop(0, `rgba(255, 255, 180, ${flameIntensity})`);
      flameGrad.addColorStop(
        0.15,
        `rgba(255, 220, 80, ${flameIntensity * 0.95})`
      );
      flameGrad.addColorStop(
        0.4,
        `rgba(255, 120, 0, ${flameIntensity * 0.75})`
      );
      flameGrad.addColorStop(0.7, `rgba(220, 60, 0, ${flameIntensity * 0.45})`);
      flameGrad.addColorStop(1, "rgba(120, 30, 0, 0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(flameX, flameY + wobble, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

// LIBRARY TOWER - Kingdom Fantasy Gothic Design with Mystical Elements
function renderLibraryTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string }
) {
  ctx.save();
  const baseWidth = 34 + tower.level * 5;
  const baseHeight = 30 + tower.level * 10;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * 0.25;
  const h = baseHeight * zoom;

  let mainColor = "rgba(180, 100, 255,";
  const glowColor = "180, 100, 255";

  if (tower.level > 3 && tower.upgrade === "A") {
    mainColor = "rgba(255, 150, 100,";
  } else if (tower.level > 3 && tower.upgrade === "B") {
    mainColor = "rgba(100, 150, 255,";
  }

  // Attack animation - piston mechanism
  const timeSinceFire = Date.now() - tower.lastAttack;
  let attackPulse = 0;
  let pistonOffset = 0;
  let groundShockwave = 0;
  let groundCrackPhase = 0;
  let impactFlash = 0;

  if (timeSinceFire < 500) {
    const attackPhase = timeSinceFire / 500;
    attackPulse = (1 - attackPhase) * 0.4;

    if (attackPhase < 0.2) {
      pistonOffset = (-attackPhase / 0.2) * 12 * zoom;
    } else if (attackPhase < 0.35) {
      const slamPhase = (attackPhase - 0.2) / 0.15;
      pistonOffset = -12 * zoom * (1 - slamPhase * slamPhase);
      if (slamPhase > 0.8) {
        impactFlash = (slamPhase - 0.8) / 0.2;
      }
    } else if (attackPhase < 0.5) {
      const compressPhase = (attackPhase - 0.35) / 0.15;
      pistonOffset = 4 * zoom * Math.sin(compressPhase * Math.PI);
      impactFlash = 1 - compressPhase;
    } else {
      pistonOffset = 0;
    }

    if (attackPhase > 0.3) {
      groundShockwave = (attackPhase - 0.3) / 0.7;
      groundCrackPhase = Math.min(1, (attackPhase - 0.3) / 0.5);
    }
  }

  const shakeY = 0;

  // ========== MYSTICAL GROUND FOUNDATION ==========
  // Outer mystical platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 14 * zoom,
    baseWidth + 18,
    baseWidth + 18,
    4,
    {
      top: "#4a3a2a",
      left: "#3a2a1a",
      right: "#2a1a0a",
      leftBack: "#5a4a3a",
      rightBack: "#4a3a2a",
    },
    zoom
  );
  
  // Mystical rune circle on ground
  const groundRuneGlow = 0.25 + Math.sin(time * 2) * 0.12 + attackPulse * 0.3;
  ctx.strokeStyle = `rgba(${glowColor}, ${groundRuneGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 12 * zoom, (baseWidth + 14) * zoom * 0.4, (baseWidth + 14) * zoom * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Ground rune symbols
  const groundRunes = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"];
  ctx.fillStyle = `rgba(${glowColor}, ${groundRuneGlow + 0.1})`;
  ctx.font = `${7 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    const runeAngle = (i / 6) * Math.PI * 2 + time * 0.15;
    const runeX = screenPos.x + Math.cos(runeAngle) * (baseWidth + 10) * zoom * 0.35;
    const runeY = screenPos.y + 12 * zoom + Math.sin(runeAngle) * (baseWidth + 10) * zoom * 0.17;
    ctx.fillText(groundRunes[i], runeX, runeY);
  }

  // Main foundation platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    8,
    {
      top: "#5a4a3a",
      left: "#4a3a2a",
      right: "#3a2a1a",
      leftBack: "#6a5a4a",
      rightBack: "#5a4a3a",
    },
    zoom
  );
  
  // Foundation corner pillars
  for (const corner of [0, 1, 2, 3]) {
    const cx = screenPos.x + (corner < 2 ? -1 : 1) * (baseWidth + 8) * zoom * 0.4;
    const cy = screenPos.y + 6 * zoom + (corner % 2 === 0 ? -1 : 1) * (baseWidth + 8) * zoom * 0.15;
    
    // Pillar base
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2 * zoom, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pillar shaft
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(cx - 2.5 * zoom, cy - 10 * zoom, 5 * zoom, 12 * zoom);
    
    // Pillar cap
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14 * zoom);
    ctx.lineTo(cx - 4 * zoom, cy - 10 * zoom);
    ctx.lineTo(cx + 4 * zoom, cy - 10 * zoom);
    ctx.closePath();
    ctx.fill();
    
    // Pillar rune glow
    const pillarGlow = 0.4 + Math.sin(time * 3 + corner) * 0.2 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${pillarGlow})`;
    ctx.beginPath();
    ctx.arc(cx, cy - 6 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lower tower body
  const lowerBodyHeight = baseHeight * 0.5;
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    lowerBodyHeight,
    {
      top: "#6a5a4a",
      left: "#5a4a3a",
      right: "#4a3a2a",
      leftBack: "#7a6a5a",
      rightBack: "#6a5a4a",
    },
    zoom
  );

  // Stone block pattern on lower body
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 5; row++) {
    const blockY = screenPos.y - row * lowerBodyHeight * zoom * 0.18;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x - w * 0.85, blockY - d * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x + w * 0.85, blockY - d * 0.55);
    ctx.stroke();
  }
  
  // Mystical wall runes on lower body
  const wallRuneGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.4;
  ctx.fillStyle = `rgba(${glowColor}, ${wallRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 5 * zoom;
  ctx.font = `${8 * zoom}px serif`;
  const wallRunes = ["ᛟ", "ᛞ", "ᛒ"];
  for (let i = 0; i < 3; i++) {
    const runeX = screenPos.x + (i - 1) * 10 * zoom;
    const runeY = screenPos.y - lowerBodyHeight * zoom * 0.3;
    ctx.fillText(wallRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Flying buttresses (Gothic supports)
  for (const side of [-1, 1]) {
    // Main buttress
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 0.85, screenPos.y + d * 0.35);
    ctx.lineTo(screenPos.x + side * w * 1.15, screenPos.y + d * 0.45);
    ctx.lineTo(screenPos.x + side * w * 1.15, screenPos.y - lowerBodyHeight * zoom + d * 0.25);
    ctx.lineTo(screenPos.x + side * w * 0.85, screenPos.y - lowerBodyHeight * zoom + d * 0.15);
    ctx.closePath();
    ctx.fill();
    
    // Buttress cap
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 1.0, screenPos.y - lowerBodyHeight * zoom - 4 * zoom);
    ctx.lineTo(screenPos.x + side * w * 0.8, screenPos.y - lowerBodyHeight * zoom + d * 0.1);
    ctx.lineTo(screenPos.x + side * w * 1.2, screenPos.y - lowerBodyHeight * zoom + d * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // Flying arch support
    ctx.strokeStyle = "#4a3a2a";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 1.1, screenPos.y - lowerBodyHeight * zoom * 0.5);
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.3,
      screenPos.y - lowerBodyHeight * zoom * 0.8,
      screenPos.x + side * w * 0.9,
      screenPos.y - lowerBodyHeight * zoom - 2 * zoom
    );
    ctx.stroke();
    
    // Buttress rune
    const buttressGlow = 0.5 + Math.sin(time * 3 + side * 2) * 0.25;
    ctx.fillStyle = `rgba(${glowColor}, ${buttressGlow})`;
    ctx.beginPath();
    ctx.arc(screenPos.x + side * w * 1.0, screenPos.y - lowerBodyHeight * zoom * 0.6, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Piston plate/anvil
  const plateY = screenPos.y - lowerBodyHeight * zoom;

  // Outer plate ring
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, plateY + 2 * zoom, (baseWidth + 8) * zoom * 0.5, (baseWidth + 8) * zoom * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8a7a6a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, plateY, (baseWidth + 6) * zoom * 0.5, (baseWidth + 6) * zoom * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#9a8a7a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, plateY - 3 * zoom, (baseWidth + 4) * zoom * 0.5, (baseWidth + 4) * zoom * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rune inscriptions on plate
  const runeGlow = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5;
  ctx.strokeStyle = `${mainColor} ${runeGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, plateY - 2 * zoom, baseWidth * zoom * 0.35, baseWidth * zoom * 0.18, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Plate rune symbols
  ctx.fillStyle = `rgba(${glowColor}, ${runeGlow})`;
  ctx.font = `${6 * zoom}px serif`;
  const plateRunes = ["ᛗ", "ᛚ", "ᛝ", "ᛟ"];
  for (let i = 0; i < 4; i++) {
    const prAngle = (i / 4) * Math.PI * 2 + time * 0.5;
    const prX = screenPos.x + Math.cos(prAngle) * baseWidth * zoom * 0.25;
    const prY = plateY - 2 * zoom + Math.sin(prAngle) * baseWidth * zoom * 0.12;
    ctx.fillText(plateRunes[i], prX, prY);
  }

  // Impact flash
  if (impactFlash > 0) {
    ctx.fillStyle = `${mainColor} ${impactFlash * 0.8})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 20 * zoom * impactFlash;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, plateY - 2 * zoom, baseWidth * zoom * 0.4, baseWidth * zoom * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Piston guides with ornate details
  for (const dx of [-1, 1]) {
    // Main rail
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(screenPos.x + dx * baseWidth * zoom * 0.4 - 4 * zoom, plateY - baseHeight * zoom * 0.6, 8 * zoom, baseHeight * zoom * 0.6);

    // Rail highlight
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(screenPos.x + dx * baseWidth * zoom * 0.4 - 4 * zoom, plateY - baseHeight * zoom * 0.6, 2 * zoom, baseHeight * zoom * 0.6);

    // Ornate rivets
    ctx.fillStyle = "#c9a227";
    for (let r = 0; r < 5; r++) {
      const rivetY = plateY - baseHeight * zoom * 0.12 - r * baseHeight * zoom * 0.11;
      ctx.beginPath();
      ctx.arc(screenPos.x + dx * baseWidth * zoom * 0.4, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // UPPER PISTON SECTION
  const pistonTopY = plateY - 4 * zoom + pistonOffset;

  // Upper tower body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    pistonTopY,
    baseWidth - 4,
    baseWidth - 4,
    baseHeight * 0.4,
    {
      top: "#7a6a5a",
      left: "#6a5a4a",
      right: "#5a4a3a",
      leftBack: "#8a7a6a",
      rightBack: "#7a6a5a",
    },
    zoom
  );

  // Piston connector ring
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, pistonTopY + 2 * zoom, (baseWidth - 2) * zoom * 0.5, (baseWidth - 2) * zoom * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone blocks on upper section
  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    const blockY = pistonTopY + 12 - row * baseHeight * 0.12 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x - w * 0.85, blockY - d * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.1, blockY + d * 0.15);
    ctx.lineTo(screenPos.x + w * 0.85, blockY - d * 0.55);
    ctx.stroke();
  }

  const topY = pistonTopY - baseHeight * 0.4 * zoom;
  const sX = screenPos.x;

  // Accent panel lines
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.strokeStyle = `${mainColor} ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= tower.level; i++) {
    const lineY = pistonTopY + 16 - (baseHeight * 0.6 * zoom * i) / (tower.level + 1);
    ctx.beginPath();
    ctx.moveTo(sX - w * 0.15, lineY + d * 0.3);
    ctx.lineTo(sX - w * 0.7, lineY - d * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sX + w * 0.7, lineY - d * 0.2);
    ctx.lineTo(sX + w * 0.15, lineY + d * 0.3);
    ctx.stroke();
  }

  // Energy vents
  for (let i = 0; i < Math.min(tower.level, 3); i++) {
    const ventY = screenPos.y - lowerBodyHeight * zoom * 0.35 - i * 8 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3 + attackPulse;

    ctx.fillStyle = `${mainColor} ${ventGlow})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(sX - w * 0.55, ventY + d * 0.15, 3.5 * zoom, 1.8 * zoom, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sX + w * 0.55, ventY + d * 0.15, 3.5 * zoom, 1.8 * zoom, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== ENHANCED GOTHIC SPIRE ==========
  const spireHeight = (28 + tower.level * 6) * zoom;

  // Spire base platform
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(sX, topY + 2 * zoom, baseWidth * zoom * 0.38, baseWidth * zoom * 0.19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spire back face
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX - baseWidth * zoom * 0.32, topY);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.closePath();
  ctx.fill();

  // Spire front face
  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY);
  ctx.closePath();
  ctx.fill();

  // Spire right face
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY + 3 * zoom);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12 + 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Spire ridge line
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.stroke();

  // Ornamental spire bands with runes
  const spireRunes = ["ᚷ", "ᚹ", "ᚺ", "ᛁ"];
  for (let band = 0; band < 4; band++) {
    const bandY = topY - spireHeight * (0.2 + band * 0.2);
    const bandWidth = baseWidth * zoom * 0.32 * (0.9 - band * 0.15);
    
    // Band line
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - bandWidth, bandY + bandWidth * 0.35);
    ctx.lineTo(sX, bandY - bandWidth * 0.15);
    ctx.lineTo(sX + bandWidth, bandY + bandWidth * 0.35);
    ctx.stroke();
    
    // Band rune
    const bandRuneGlow = 0.5 + Math.sin(time * 3 + band) * 0.25 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${bandRuneGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(spireRunes[band], sX, bandY);
    ctx.shadowBlur = 0;
  }
  
  // Spire finial (decorative top piece)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight - 6 * zoom);
  ctx.lineTo(sX - 3 * zoom, topY - spireHeight + 2 * zoom);
  ctx.lineTo(sX + 3 * zoom, topY - spireHeight + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  
  // Finial orb
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 8 * zoom, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Floating arcane rings
  const ringGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.strokeStyle = `${mainColor} ${ringGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let ring = 0; ring < 3; ring++) {
    const ringY = topY - 10 - spireHeight * (0.4 + ring * 0.2);
    const ringSize = (9 - ring * 2) * zoom;
    ctx.beginPath();
    ctx.ellipse(sX, ringY, ringSize, ringSize * 0.4, time * 2 + ring * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Energy orb at tip
  const orbGlow = 0.6 + Math.sin(time * 4) * 0.3 + attackPulse;
  const orbSize = (12 + tower.level * 2 + attackPulse * 5) * zoom;

  // Outer energy field
  const outerGrad = ctx.createRadialGradient(sX, topY - spireHeight - 10 * zoom, 0, sX, topY - spireHeight - 10 * zoom, orbSize * 1.5);
  outerGrad.addColorStop(0, `${mainColor} ${orbGlow * 0.3})`);
  outerGrad.addColorStop(0.5, `rgba(140, 60, 200, ${orbGlow * 0.15})`);
  outerGrad.addColorStop(1, `rgba(100, 40, 160, 0)`);
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, orbSize * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main orb
  const orbGrad = ctx.createRadialGradient(sX - 2 * zoom, topY - spireHeight - 12 * zoom, 0, sX, topY - spireHeight - 10 * zoom, orbSize);

  if (tower.level <= 3) {
    orbGrad.addColorStop(0, `rgba(255, 220, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(200, 150, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(150, 80, 220, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(100, 50, 180, 0)`);
  } else if (tower.level === 4 && tower.upgrade === "A") {
    orbGrad.addColorStop(0, `rgba(255, 220, 180, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(255, 180, 100, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(220, 100, 40, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(180, 60, 30, 0)`);
  } else {
    orbGrad.addColorStop(0, `rgba(180, 240, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(100, 200, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(40, 150, 220, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(30, 100, 180, 0)`);
  }

  ctx.fillStyle = orbGrad;
  ctx.shadowColor = "#b466ff";
  ctx.shadowBlur = 15 * zoom * orbGlow;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, orbSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Inner core
  ctx.fillStyle = `rgba(255, 230, 255, ${orbGlow})`;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, 3.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Energy tendrils during attack
  if (attackPulse > 0.1) {
    for (let t = 0; t < 5; t++) {
      const tendrilAngle = time * 5 + (t / 5) * Math.PI * 2;
      const tendrilLen = (18 + attackPulse * 22) * zoom;
      ctx.strokeStyle = `${mainColor} ${attackPulse * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(sX, topY - spireHeight - 10 * zoom);
      ctx.quadraticCurveTo(
        sX + Math.cos(tendrilAngle) * tendrilLen * 0.5,
        topY - spireHeight - 10 * zoom + Math.sin(tendrilAngle) * tendrilLen * 0.3,
        sX + Math.cos(tendrilAngle + 0.3) * tendrilLen,
        topY - spireHeight - 10 * zoom + Math.sin(tendrilAngle + 0.3) * tendrilLen * 0.5
      );
      ctx.stroke();
    }
  }

  // Gothic windows
  const windowY = screenPos.y - lowerBodyHeight * zoom * 0.5;
  const glowIntensity = 0.5 + Math.sin(time * 2) * 0.3 + attackPulse;

  for (const dx of [-1, 1]) {
    const wx = sX + dx * 11 * zoom;

    // Window frame
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(wx - 5 * zoom, windowY + 10 * zoom);
    ctx.lineTo(wx - 5 * zoom, windowY - 3 * zoom);
    ctx.quadraticCurveTo(wx, windowY - 10 * zoom, wx + 5 * zoom, windowY - 3 * zoom);
    ctx.lineTo(wx + 5 * zoom, windowY + 10 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#2a1a0a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Glowing interior
    ctx.fillStyle = `${mainColor} ${glowIntensity})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx - 3.5 * zoom, windowY + 8 * zoom);
    ctx.lineTo(wx - 3.5 * zoom, windowY - 2 * zoom);
    ctx.quadraticCurveTo(wx, windowY - 7 * zoom, wx + 3.5 * zoom, windowY - 2 * zoom);
    ctx.lineTo(wx + 3.5 * zoom, windowY + 8 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Window mullion
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx, windowY - 5 * zoom);
    ctx.lineTo(wx, windowY + 8 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx - 3 * zoom, windowY + 2 * zoom);
    ctx.lineTo(wx + 3 * zoom, windowY + 2 * zoom);
    ctx.stroke();
  }

  // Central arcane core display
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(sX, topY + 6 * zoom, 9 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(sX, topY + 6 * zoom, 0, sX, topY + 6 * zoom, 7 * zoom);
  coreGrad.addColorStop(0, `${mainColor} ${glowIntensity})`);
  coreGrad.addColorStop(0.5, `rgba(140, 80, 200, ${glowIntensity * 0.7})`);
  coreGrad.addColorStop(1, `rgba(100, 50, 150, ${glowIntensity * 0.4})`);
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = "#b466ff";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(sX, topY + 6 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Core rune pattern
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time * 2;
    ctx.beginPath();
    ctx.moveTo(sX, topY + 6 * zoom);
    ctx.lineTo(sX + Math.cos(angle) * 6 * zoom, topY + 6 * zoom + Math.sin(angle) * 6 * zoom);
    ctx.stroke();
  }

  // ========== LEVEL 2 UNIQUE FEATURES ==========
  if (tower.level >= 2) {
    // Floating ancient tomes
    for (let i = 0; i < tower.level; i++) {
      const bookAngle = time * 1.0 + i * ((Math.PI * 2) / tower.level);
      const bookRadius = 30 * zoom;
      const bookX = sX + Math.cos(bookAngle) * bookRadius;
      const bookY = topY - 20 * zoom + Math.sin(bookAngle * 2) * 8 * zoom;
      const bookFloat = Math.sin(time * 3 + i) * 3 * zoom;

      // Book shadow
      ctx.fillStyle = `${mainColor} 0.25)`;
      ctx.beginPath();
      ctx.ellipse(bookX, bookY + bookFloat + 3 * zoom, 9 * zoom, 3.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Book cover
      ctx.fillStyle = i % 3 === 0 ? "#6a4a3a" : i % 3 === 1 ? "#4a5a6a" : "#5a4a6a";
      ctx.fillRect(bookX - 8 * zoom, bookY + bookFloat - 6 * zoom, 16 * zoom, 12 * zoom);
      
      // Book spine
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(bookX - 8 * zoom, bookY + bookFloat - 6 * zoom, 2 * zoom, 12 * zoom);

      // Book pages glow
      ctx.fillStyle = `rgba(${glowColor}, ${0.6 + Math.sin(time * 5 + i) * 0.2})`;
      ctx.fillRect(bookX - 5 * zoom, bookY + bookFloat - 5 * zoom, 12 * zoom, 10 * zoom);
      
      // Book rune
      ctx.fillStyle = "#3a2a1a";
      ctx.font = `${6 * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(["ᚠ", "ᚢ", "ᚦ"][i % 3], bookX + 1 * zoom, bookY + bookFloat + 2 * zoom);
    }
    
    // Mystical scroll unfurling
    const scrollY = screenPos.y - lowerBodyHeight * zoom * 0.8;
    const scrollGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = "#e8dcc8";
    ctx.fillRect(sX - 6 * zoom, scrollY - 4 * zoom, 12 * zoom, 8 * zoom);
    ctx.fillStyle = `rgba(${glowColor}, ${scrollGlow})`;
    ctx.font = `${5 * zoom}px serif`;
    ctx.fillText("ᛗᛚᛝ", sX, scrollY + 2 * zoom);
  }

  // ========== LEVEL 3 UNIQUE FEATURES ==========
  if (tower.level >= 3) {
    // Runic barrier circle
    const barrierGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.3;
    ctx.strokeStyle = `rgba(${glowColor}, ${barrierGlow})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(sX, topY - 15 * zoom, 22 * zoom, 11 * zoom, time * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    
    // Barrier rune nodes
    for (let i = 0; i < 6; i++) {
      const nodeAngle = (i / 6) * Math.PI * 2 + time * 1.2;
      const nodeX = sX + Math.cos(nodeAngle) * 24 * zoom;
      const nodeY = topY - 15 * zoom + Math.sin(nodeAngle) * 12 * zoom;
      
      ctx.fillStyle = `rgba(${glowColor}, ${barrierGlow + 0.2})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Floating crystal shards
    for (let i = 0; i < 4; i++) {
      const crystalAngle = time * 0.8 + (i / 4) * Math.PI * 2;
      const crystalRadius = 35 + Math.sin(time * 2 + i) * 5;
      const crystalX = sX + Math.cos(crystalAngle) * crystalRadius * zoom;
      const crystalY = topY - 30 * zoom + Math.sin(crystalAngle) * crystalRadius * 0.3 * zoom;
      const crystalFloat = Math.sin(time * 3 + i * 1.5) * 4 * zoom;
      
      // Crystal glow
      ctx.fillStyle = `rgba(${glowColor}, ${0.3 + Math.sin(time * 4 + i) * 0.15})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(crystalX, crystalY + crystalFloat - 8 * zoom);
      ctx.lineTo(crystalX - 4 * zoom, crystalY + crystalFloat);
      ctx.lineTo(crystalX, crystalY + crystalFloat + 5 * zoom);
      ctx.lineTo(crystalX + 4 * zoom, crystalY + crystalFloat);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Ancient artifact pedestal glow
    const artifactGlow = 0.5 + Math.sin(time * 3) * 0.25;
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(sX, screenPos.y - lowerBodyHeight * zoom - 8 * zoom, 12 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Energy amplifier rings (Level 3)
  if (tower.level === 3 && !tower.upgrade) {
    const ampRingGlow = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
    ctx.strokeStyle = `${mainColor} ${ampRingGlow})`;
    ctx.lineWidth = 2.5 * zoom;

    ctx.beginPath();
    ctx.ellipse(sX, topY - 18 * zoom, 20 * zoom, 10 * zoom, time * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 5; i++) {
      const runeAngle = (i / 5) * Math.PI * 2 + time * 1.5;
      const rx = sX + Math.cos(runeAngle) * 24 * zoom;
      const ry = topY - 18 * zoom + Math.sin(runeAngle) * 12 * zoom;

      ctx.fillStyle = `rgba(220, 180, 255, ${ampRingGlow})`;
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Level 4 upgrade visuals
  if (tower.level === 4) {
    if (tower.upgrade === "A") {
      const wavePhase = (time * 2) % 1;
      const waveRadius = 30 + wavePhase * 60;

      ctx.strokeStyle = `rgba(255, 100, 50, ${0.7 * (1 - wavePhase)})`;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        sX,
        screenPos.y + shakeY + 5 * zoom,
        waveRadius * zoom * 0.7,
        waveRadius * zoom * 0.35,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 150, 50, 0.5)`;
      ctx.lineWidth = 2 * zoom;
      for (let i = 0; i < 6; i++) {
        const crackAngle = (i / 6) * Math.PI * 2 + time * 0.2;
        ctx.beginPath();
        ctx.moveTo(sX, screenPos.y + shakeY + 5 * zoom);
        ctx.lineTo(
          sX + Math.cos(crackAngle) * 35 * zoom,
          screenPos.y + shakeY + 5 * zoom + Math.sin(crackAngle) * 17 * zoom
        );
        ctx.stroke();
      }
    } else if (tower.upgrade === "B") {
      for (let i = 0; i < 6; i++) {
        const crystalAngle = (i * Math.PI) / 3 + time * 0.5;
        const cx = sX + Math.cos(crystalAngle) * 25 * zoom;
        const cy = topY - 10 * zoom + Math.sin(crystalAngle) * 12 * zoom;
        const crystalSize = (8 + Math.sin(time * 2 + i) * 3) * zoom;

        ctx.fillStyle = "rgba(100, 200, 255, 0.3)";
        ctx.shadowColor = "#66ddff";
        ctx.shadowBlur = 8 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          crystalSize * 0.8,
          crystalSize * 0.4,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "rgba(150, 230, 255, 0.9)";
        ctx.beginPath();
        ctx.moveTo(cx, cy - crystalSize);
        ctx.lineTo(cx + crystalSize * 0.5, cy);
        ctx.lineTo(cx, cy + crystalSize * 0.7);
        ctx.lineTo(cx - crystalSize * 0.5, cy);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = `rgba(100, 200, 255, ${
        0.4 + Math.sin(time * 3) * 0.2
      })`;
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(
        sX,
        screenPos.y + shakeY,
        40 * zoom,
        20 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Purple energy field around tower
  const auraSize = 30 + Math.sin(time * 3) * 5;
  ctx.strokeStyle = `${mainColor} ${
    0.35 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5
  })`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    sX,
    screenPos.y + shakeY - baseHeight * zoom * 0.3,
    auraSize * zoom,
    auraSize * zoom * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Ground-crushing shockwave effect during attack
  if (groundShockwave > 0 && groundShockwave < 1) {
    const shockRadius = 40 + groundShockwave * 80;
    const shockAlpha = (1 - groundShockwave) * 0.8;

    // Multiple expanding rings
    for (let ring = 0; ring < 3; ring++) {
      const ringDelay = ring * 0.15;
      const ringPhase = Math.max(0, groundShockwave - ringDelay);
      if (ringPhase > 0 && ringPhase < 1) {
        const ringRadius = 30 + ringPhase * 70;
        const ringAlpha = (1 - ringPhase) * 0.6;

        ctx.strokeStyle = `${mainColor} ${ringAlpha})`;
        ctx.lineWidth = (4 - ring) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          sX,
          screenPos.y + 5 * zoom,
          ringRadius * zoom,
          ringRadius * zoom * 0.5,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }

    // Ground crack lines radiating outward
    if (groundCrackPhase > 0) {
      ctx.strokeStyle = `${mainColor} ${(1 - groundCrackPhase) * 0.7})`;
      ctx.lineWidth = 2 * zoom;
      for (let i = 0; i < 8; i++) {
        const crackAngle = (i / 8) * Math.PI * 2 + Math.PI / 16;
        const crackLength = 25 + groundCrackPhase * 50;
        const wobble1 = Math.sin(i * 3 + time * 5) * 5;
        const wobble2 = Math.cos(i * 2 + time * 3) * 8;

        ctx.beginPath();
        ctx.moveTo(sX, screenPos.y + 5 * zoom);
        // Jagged crack line
        ctx.lineTo(
          sX + Math.cos(crackAngle) * crackLength * 0.4 * zoom + wobble1 * zoom,
          screenPos.y +
            5 * zoom +
            Math.sin(crackAngle) * crackLength * 0.2 * zoom
        );
        ctx.lineTo(
          sX + Math.cos(crackAngle) * crackLength * zoom + wobble2 * zoom,
          screenPos.y +
            5 * zoom +
            Math.sin(crackAngle) * crackLength * 0.5 * zoom
        );
        ctx.stroke();
      }
    }

    // Debris particles flying up
    for (let i = 0; i < 6; i++) {
      const debrisAngle = (i / 6) * Math.PI * 2 + time * 0.5;
      const debrisPhase = (groundShockwave + i * 0.1) % 1;
      const debrisRadius = 20 + debrisPhase * 40;
      const debrisHeight = Math.sin(debrisPhase * Math.PI) * 30;
      const debrisAlpha = (1 - debrisPhase) * 0.8;

      const dx = sX + Math.cos(debrisAngle) * debrisRadius * zoom;
      const dy =
        screenPos.y +
        5 * zoom +
        Math.sin(debrisAngle) * debrisRadius * 0.5 * zoom -
        debrisHeight * zoom;

      ctx.fillStyle = `rgba(100, 80, 60, ${debrisAlpha})`;
      ctx.beginPath();
      ctx.arc(dx, dy, (2 + Math.random()) * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// LAB TOWER - Tesla coil with fixed projectile origins
function renderLabTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  ctx.save();
  const baseWidth = 30 + tower.level * 4;
  const baseHeight = 25 + tower.level * 8;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * 0.25;
  const h = baseHeight * zoom;

  // Foundation platform with tech details
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 10 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    6,
    {
      top: "#1a3a4f",
      left: "#153040",
      right: "#102535",
      leftBack: "#1d4055",
      rightBack: "#183548",
    },
    zoom
  );

  // Foundation edge glow
  const foundGlow = 0.3 + Math.sin(time * 2) * 0.15;
  ctx.strokeStyle = `rgba(0, 255, 255, ${foundGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - (baseWidth + 10) * zoom * 0.5,
    screenPos.y + 4 * zoom
  );
  ctx.lineTo(
    screenPos.x,
    screenPos.y + (baseWidth + 10) * zoom * 0.25 + 4 * zoom
  );
  ctx.lineTo(
    screenPos.x + (baseWidth + 10) * zoom * 0.5,
    screenPos.y + 4 * zoom
  );
  ctx.stroke();

  // Main sci-fi tower body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 2 * zoom,
    baseWidth,
    baseWidth,
    baseHeight - 6,
    {
      top: "#4d7a9b",
      left: "#3a6585",
      right: "#2d5a7b",
      leftBack: "#4a7595",
      rightBack: "#3d6888",
    },
    zoom
  );

  // Structural panel lines for better 3D effect
  ctx.strokeStyle = "#2a5a75";
  ctx.lineWidth = 1 * zoom;
  // Left face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x - w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y + 2 * zoom);
    ctx.lineTo(
      panelX - d * 0.5,
      screenPos.y - (baseHeight - 6) * zoom + d * 0.5
    );
    ctx.stroke();
  }
  // Right face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x + w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y + 2 * zoom);
    ctx.lineTo(
      panelX + d * 0.5,
      screenPos.y - (baseHeight - 6) * zoom + d * 0.5
    );
    ctx.stroke();
  }

  // Corner reinforcement struts
  ctx.fillStyle = "#3a6a8a";
  for (let side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 0.95, screenPos.y + d * 0.4);
    ctx.lineTo(screenPos.x + side * w * 1.05, screenPos.y + d * 0.5);
    ctx.lineTo(
      screenPos.x + side * w * 1.05,
      screenPos.y - (baseHeight - 10) * zoom + d * 0.4
    );
    ctx.lineTo(
      screenPos.x + side * w * 0.95,
      screenPos.y - (baseHeight - 10) * zoom + d * 0.3
    );
    ctx.closePath();
    ctx.fill();
  }

  // ========== ROTATING ENERGY RINGS ==========
  const ringRotation = time * 2;
  for (let ring = 0; ring < 2 + tower.level; ring++) {
    const ringY = screenPos.y - h * (0.3 + ring * 0.15);
    const ringRadius = 12 + tower.level * 2 - ring * 2;
    const ringAlpha = 0.3 + Math.sin(time * 4 + ring) * 0.15;

    ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringRadius * zoom,
      ringRadius * 0.4 * zoom,
      ringRotation + ring * 0.5,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Ring energy nodes
    for (let node = 0; node < 4; node++) {
      const nodeAngle = ringRotation + ring * 0.5 + (node / 4) * Math.PI * 2;
      const nodeX = screenPos.x + Math.cos(nodeAngle) * ringRadius * zoom;
      const nodeY = ringY + Math.sin(nodeAngle) * ringRadius * 0.4 * zoom;
      ctx.fillStyle = `rgba(0, 255, 255, ${ringAlpha + 0.2})`;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== ENERGY TUBES (multiple) ==========
  // Left side energy tubes
  drawEnergyTube(
    ctx,
    screenPos.x - w * 0.8,
    screenPos.y + 8 * zoom,
    screenPos.x - w * 0.5,
    screenPos.y - h * 0.6,
    2.5,
    time,
    zoom,
    "rgb(0, 200, 255)"
  );

  // Right side energy tubes
  drawEnergyTube(
    ctx,
    screenPos.x + w * 0.8,
    screenPos.y + 8 * zoom,
    screenPos.x + w * 0.5,
    screenPos.y - h * 0.6,
    2.5,
    time + 0.5,
    zoom,
    "rgb(0, 200, 255)"
  );

  // Cross-connecting tube
  if (tower.level >= 2) {
    drawEnergyTube(
      ctx,
      screenPos.x - w * 0.6,
      screenPos.y - h * 0.3,
      screenPos.x + w * 0.6,
      screenPos.y - h * 0.4,
      2,
      time + 0.3,
      zoom,
      "rgb(100, 255, 255)"
    );
  }

  // ========== SCAFFOLDING & SUPPORT STRUCTURE (Level 2+) ==========
  if (tower.level >= 2) {
    // Vertical support struts
    ctx.strokeStyle = "#5a7a9a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.1, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x - w * 0.85, screenPos.y - h * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.1, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x + w * 0.85, screenPos.y - h * 0.7);
    ctx.stroke();

    // Cross bracing
    ctx.strokeStyle = "#4a6a8a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.05, screenPos.y - h * 0.1);
    ctx.lineTo(screenPos.x + w * 0.9, screenPos.y - h * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.05, screenPos.y - h * 0.1);
    ctx.lineTo(screenPos.x - w * 0.9, screenPos.y - h * 0.55);
    ctx.stroke();

    // Horizontal support ring
    ctx.strokeStyle = "#6a8aaa";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - h * 0.35, w * 1.05, d * 1.05, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Additional power cables
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 1.5 * zoom;
    for (let cable = 0; cable < 2; cable++) {
      const cableY = screenPos.y - h * (0.2 + cable * 0.25);
      const sag = Math.sin(time * 2 + cable) * 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - w * 1.0, cableY);
      ctx.quadraticCurveTo(screenPos.x - w * 0.7, cableY + sag, screenPos.x - w * 0.5, cableY - 2 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + w * 1.0, cableY);
      ctx.quadraticCurveTo(screenPos.x + w * 0.7, cableY + sag, screenPos.x + w * 0.5, cableY - 2 * zoom);
      ctx.stroke();
    }

    // Capacitor banks on scaffolding
    const capColors = ["#3a5a7a", "#4a7a9a"];
    for (let side of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        const capX = screenPos.x + side * w * 1.0;
        const capY = screenPos.y - h * (0.15 + i * 0.2);
        ctx.fillStyle = capColors[i % 2];
        ctx.fillRect(capX - 4 * zoom, capY - 5 * zoom, 8 * zoom, 10 * zoom);
        
        // Capacitor glow ring
        const capGlow = 0.4 + Math.sin(time * 3 + i + side) * 0.3;
        ctx.strokeStyle = `rgba(0, 200, 255, ${capGlow})`;
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(capX, capY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // ========== SECONDARY COIL TOWERS (Level 3+) ==========
  if (tower.level >= 3) {
    const sideCoilHeight = 30 * zoom;
    const sideCoilOffsets = [-w * 1.2, w * 1.2];

    for (const offsetX of sideCoilOffsets) {
      const coilX = screenPos.x + offsetX;
      const coilBaseY = screenPos.y - h * 0.1;

      // Mini coil housing
      ctx.fillStyle = "#2a4a6a";
      ctx.beginPath();
      ctx.moveTo(coilX - 6 * zoom, coilBaseY);
      ctx.lineTo(coilX - 4 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 4 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 6 * zoom, coilBaseY);
      ctx.closePath();
      ctx.fill();

      // Mini copper coils
      const miniCoilTurns = 5;
      for (let mc = 0; mc < miniCoilTurns; mc++) {
        const mcY = coilBaseY - (mc / miniCoilTurns) * sideCoilHeight * 0.8 - 4 * zoom;
        const mcRadius = (5 - mc * 0.5) * zoom;
        const mcGlow = 0.4 + Math.sin(time * 4 + mc + offsetX * 0.1) * 0.3;
        
        ctx.strokeStyle = `rgba(205, 127, 50, ${0.7 + mcGlow * 0.3})`;
        ctx.lineWidth = 2.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(coilX, mcY, mcRadius, mcRadius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Mini coil orb
      const miniOrbPulse = 0.6 + Math.sin(time * 5 + offsetX) * 0.3;
      const miniOrbY = coilBaseY - sideCoilHeight - 5 * zoom;
      
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12 * zoom;
      const miniOrbGrad = ctx.createRadialGradient(coilX, miniOrbY, 0, coilX, miniOrbY, 5 * zoom);
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.4, "#88ffff");
      miniOrbGrad.addColorStop(1, "#0088ff");
      ctx.fillStyle = miniOrbGrad;
      ctx.beginPath();
      ctx.arc(coilX, miniOrbY, 5 * zoom * miniOrbPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Energy arc from side coil to main tower
      const arcAlpha = 0.4 + Math.sin(time * 6 + offsetX) * 0.3;
      ctx.strokeStyle = `rgba(0, 255, 255, ${arcAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.moveTo(coilX, miniOrbY);
      const midX = screenPos.x + offsetX * 0.3;
      const midY = screenPos.y - h * 0.75;
      ctx.quadraticCurveTo(midX, midY, screenPos.x, screenPos.y - h * 0.85);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Mini arcs from side orbs
      for (let arc = 0; arc < 3; arc++) {
        const arcAngle = time * 4 + arc * (Math.PI * 2 / 3) + offsetX;
        const arcLen = (8 + Math.sin(time * 7 + arc) * 4) * zoom;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(coilX, miniOrbY);
        const arcEndX = coilX + Math.cos(arcAngle) * arcLen;
        const arcEndY = miniOrbY + Math.sin(arcAngle) * arcLen * 0.5;
        ctx.lineTo(
          (coilX + arcEndX) / 2 + (Math.random() - 0.5) * 4 * zoom,
          (miniOrbY + arcEndY) / 2 + (Math.random() - 0.5) * 2 * zoom
        );
        ctx.lineTo(arcEndX, arcEndY);
        ctx.stroke();
      }
    }

    // Plasma conduits on the ground
    ctx.strokeStyle = `rgba(0, 255, 200, ${0.4 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4 * zoom, 4 * zoom]);
    ctx.lineDashOffset = -time * 25;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.5, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x - w * 1.1, screenPos.y + 5 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.5, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x + w * 1.1, screenPos.y + 5 * zoom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Additional wiring network
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1 * zoom;
    for (let wire = 0; wire < 4; wire++) {
      const wireY = screenPos.y - h * (0.1 + wire * 0.15);
      const wireSag = Math.sin(time * 2 + wire) * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - w * 1.2, wireY);
      ctx.quadraticCurveTo(screenPos.x - w * 0.9, wireY + wireSag, screenPos.x - w * 0.7, wireY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + w * 1.2, wireY);
      ctx.quadraticCurveTo(screenPos.x + w * 0.9, wireY + wireSag, screenPos.x + w * 0.7, wireY);
      ctx.stroke();
    }

    // Rotating plasma field around main tower
    for (let ring = 0; ring < 2; ring++) {
      const ringAngle = time * 2 + ring * Math.PI;
      const ringRadius = w * (0.7 + ring * 0.15);
      const ringAlpha = 0.25 + Math.sin(time * 4 + ring) * 0.15;

      ctx.strokeStyle = `rgba(0, 255, 200, ${ringAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - h * 0.5,
        ringRadius,
        ringRadius * 0.35,
        ringAngle,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Energy particles around main structure
    for (let p = 0; p < 8; p++) {
      const particleAngle = time * 3 + p * (Math.PI * 2 / 8);
      const particleDist = w * 0.6 + Math.sin(time * 5 + p) * 5 * zoom;
      const particleY = screenPos.y - h * 0.5;
      const px = screenPos.x + Math.cos(particleAngle) * particleDist;
      const py = particleY + Math.sin(particleAngle) * particleDist * 0.35;

      ctx.fillStyle = `rgba(200, 255, 255, ${0.4 + Math.sin(time * 8 + p) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== ROTATING CAPACITOR DISCS ==========
  const discRotation = time * 3;
  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - h * 0.7);

  // Multiple rotating discs
  for (let disc = 0; disc < tower.level; disc++) {
    const discAngle = discRotation + (disc * Math.PI) / tower.level;
    const discRadius = 6 + disc * 2;
    const discY = disc * 8 * zoom;

    ctx.fillStyle = `rgba(40, 80, 120, ${0.6 - disc * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      discY,
      discRadius * zoom,
      discRadius * 0.4 * zoom,
      discAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Disc edge glow
    ctx.strokeStyle = `rgba(0, 255, 255, ${
      0.5 + Math.sin(time * 5 + disc) * 0.3
    })`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
  }
  ctx.restore();

  // Add sci-fi panel details on left face (flipped orientation)
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2;
  ctx.strokeStyle = `rgba(0, 255, 255, ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  // Left face horizontal tech lines (flipped)
  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY =
      screenPos.y +
      2 * zoom -
      ((baseHeight - 6) * zoom * i) / (tower.level + 2);
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.85, lineY - d * 0.2);
    ctx.stroke();
  }

  // Right face tech lines (flipped)
  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY =
      screenPos.y +
      2 * zoom -
      ((baseHeight - 6) * zoom * i) / (tower.level + 2);
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.85, lineY - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3);
    ctx.stroke();
  }

  // ========== ANIMATED COOLANT FLOW ==========
  // Coolant tanks on sides
  ctx.fillStyle = "#1a4a6a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x - w * 0.75,
    screenPos.y - h * 0.15,
    5 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x + w * 0.75,
    screenPos.y - h * 0.15,
    5 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Animated coolant bubbles
  for (let i = 0; i < 3; i++) {
    const bubblePhase = (time * 2 + i * 0.4) % 1;
    const bubbleY = screenPos.y - h * 0.05 - bubblePhase * h * 0.2;
    const bubbleAlpha = Math.sin(bubblePhase * Math.PI) * 0.6;

    ctx.fillStyle = `rgba(100, 200, 255, ${bubbleAlpha})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x - w * 0.75 + (i - 1) * 2 * zoom,
      bubbleY,
      2 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      screenPos.x + w * 0.75 + (i - 1) * 2 * zoom,
      bubbleY + 3 * zoom,
      2 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Glowing vents on sides with enhanced glow
  for (let i = 0; i < tower.level; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 12 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3;

    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8 * zoom;

    // Left vent
    ctx.fillStyle = `rgba(0, 255, 255, ${ventGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - w * 0.6,
      ventY + d * 0.2,
      4 * zoom,
      2 * zoom,
      0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Right vent
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + w * 0.6,
      ventY + d * 0.2,
      4 * zoom,
      2 * zoom,
      -0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  // ========== CIRCUIT BOARD PATTERNS WITH ANIMATED CURRENT ==========
  ctx.strokeStyle = "#5a8aab";
  ctx.lineWidth = 1.5 * zoom;

  // Left circuit (flipped to go other direction)
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 0.4, screenPos.y - h * 0.2);
  ctx.lineTo(screenPos.x - w * 0.4, screenPos.y - h * 0.4);
  ctx.lineTo(screenPos.x - w * 0.7, screenPos.y - h * 0.5);
  ctx.stroke();

  // Right circuit (flipped)
  ctx.beginPath();
  ctx.moveTo(screenPos.x + w * 0.4, screenPos.y - h * 0.2);
  ctx.lineTo(screenPos.x + w * 0.4, screenPos.y - h * 0.4);
  ctx.lineTo(screenPos.x + w * 0.7, screenPos.y - h * 0.5);
  ctx.stroke();

  // Animated current flowing through circuits
  const currentPhase = (time * 3) % 1;
  ctx.fillStyle = `rgba(0, 255, 255, ${0.8})`;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 6 * zoom;

  // Left circuit current
  const leftCurrentX = screenPos.x - w * (0.4 + currentPhase * 0.3);
  const leftCurrentY = screenPos.y - h * (0.2 + currentPhase * 0.3);
  ctx.beginPath();
  ctx.arc(leftCurrentX, leftCurrentY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Right circuit current
  const rightCurrentX = screenPos.x + w * (0.4 + currentPhase * 0.3);
  const rightCurrentY = screenPos.y - h * (0.2 + currentPhase * 0.3);
  ctx.beginPath();
  ctx.arc(rightCurrentX, rightCurrentY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Node points with enhanced glow
  const nodeGlow = 0.6 + Math.sin(time * 5) * 0.3;
  ctx.fillStyle = `rgba(0, 255, 255, ${nodeGlow})`;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(
    screenPos.x - w * 0.7,
    screenPos.y - h * 0.5,
    3 * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    screenPos.x + w * 0.7,
    screenPos.y - h * 0.5,
    3 * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // ========== HOLOGRAPHIC DATA DISPLAY ==========
  ctx.fillStyle = "#0a2030";
  const screenW = 10 * zoom;
  const screenH = 8 * zoom;
  ctx.fillRect(
    screenPos.x - screenW / 2,
    screenPos.y - h * 0.38,
    screenW,
    screenH
  );

  // Screen frame glow
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 3) * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(
    screenPos.x - screenW / 2,
    screenPos.y - h * 0.38,
    screenW,
    screenH
  );

  // Screen content (scrolling data with waveform)
  ctx.fillStyle = `rgba(0, 255, 255, 0.8)`;
  for (let i = 0; i < 4; i++) {
    const lineOffset = (time * 30 + i * 2) % 8;
    ctx.fillRect(
      screenPos.x - screenW / 2 + 1 * zoom,
      screenPos.y - h * 0.38 + lineOffset * zoom,
      (3 + Math.sin(time * 15 + i * 2) * 2) * zoom,
      1 * zoom
    );
  }

  // Waveform on screen
  ctx.strokeStyle = `rgba(0, 255, 255, 0.9)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const waveX = screenPos.x - screenW / 2 + 1 * zoom + i * zoom;
    const waveY =
      screenPos.y - h * 0.34 + Math.sin(time * 10 + i * 0.8) * 2 * zoom;
    if (i === 0) ctx.moveTo(waveX, waveY);
    else ctx.lineTo(waveX, waveY);
  }
  ctx.stroke();

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    screenPos.x - w * 0.85,
    screenPos.y - h * 0.1,
    2.5,
    time,
    zoom,
    "#00ffff",
    5
  );
  drawWarningLight(
    ctx,
    screenPos.x + w * 0.85,
    screenPos.y - h * 0.1,
    2.5,
    time + 0.3,
    zoom,
    "#00ffff",
    5
  );

  const topY = screenPos.y - baseHeight * zoom;

  if (tower.level === 4 && tower.upgrade === "A") {
    renderFocusedBeam(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      enemies,
      selectedMap,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
    );
  } else if (tower.level === 4 && tower.upgrade === "B") {
    renderChainLightning(ctx, screenPos, topY, tower, zoom, time);
  } else {
    renderTeslaCoil(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      enemies,
      selectedMap,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
    );
  }

  ctx.restore();
}

function renderTeslaCoil(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const coilHeight = (35 + tower.level * 8) * zoom;

  // Coil base platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 5 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#2a4a5f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    16 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Central coil column - Enhanced 3D cylindrical structure
  const columnGrad = ctx.createLinearGradient(
    screenPos.x - 10 * zoom,
    0,
    screenPos.x + 10 * zoom,
    0
  );
  columnGrad.addColorStop(0, "#1a3a4f");
  columnGrad.addColorStop(0.25, "#3a6a8f");
  columnGrad.addColorStop(0.5, "#4a7a9f");
  columnGrad.addColorStop(0.75, "#3a6a8f");
  columnGrad.addColorStop(1, "#1a3a4f");
  ctx.fillStyle = columnGrad;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 8 * zoom, topY);
  ctx.lineTo(screenPos.x - 5 * zoom, topY - coilHeight + 12 * zoom);
  ctx.lineTo(screenPos.x + 5 * zoom, topY - coilHeight + 12 * zoom);
  ctx.lineTo(screenPos.x + 8 * zoom, topY);
  ctx.closePath();
  ctx.fill();

  // Add vertical structural ribs for better 3D effect
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1.5 * zoom;
  for (let rib = -1; rib <= 1; rib++) {
    const ribX = screenPos.x + rib * 4 * zoom;
    const topRibX = screenPos.x + rib * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(ribX, topY);
    ctx.lineTo(topRibX, topY - coilHeight + 12 * zoom);
    ctx.stroke();
  }

  // Tesla coil rings (copper) - Enhanced with better 3D shading and glow
  const ringCount = 6 + tower.level * 2;
  const isAttacking = Date.now() - tower.lastAttack < 300;
  const attackIntensity = isAttacking ? Math.max(0, 1 - (Date.now() - tower.lastAttack) / 300) : 0;
  
  for (let i = 0; i < ringCount; i++) {
    const ringProgress = (i + 1) / (ringCount + 1);
    // Added more spacing between rings (increased multiplier from 1.0 to 1.15)
    const ringY = topY - ringProgress * (coilHeight - 18 * zoom) * 1.15;
    const ringSize = 14 - ringProgress * 8;
    const energyPulse = Math.sin(time * 6 - i * 0.5) * 0.4;

    // Blue glow effect when firing
    if (isAttacking) {
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = (12 + attackIntensity * 8) * zoom;
      ctx.fillStyle = `rgba(0, 150, 255, ${0.3 + attackIntensity * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        ringY,
        (ringSize + 2) * zoom,
        (ringSize + 2) * zoom * 0.4,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ring shadow (back edge) - darker copper
    ctx.fillStyle = `rgb(${80 + energyPulse * 15}, ${50 + energyPulse * 10}, ${25})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY + 2.5 * zoom,
      ringSize * zoom,
      ringSize * zoom * 0.4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Main ring body - copper with 3D effect (add blue tint when attacking)
    const ringGrad = ctx.createLinearGradient(
      screenPos.x - ringSize * zoom,
      ringY,
      screenPos.x + ringSize * zoom,
      ringY
    );
    const blueShift = isAttacking ? attackIntensity * 60 : 0;
    ringGrad.addColorStop(0, `rgb(${120 + energyPulse * 25 - blueShift * 0.3}, ${75 + energyPulse * 15 + blueShift * 0.5}, ${35 + blueShift})`);
    ringGrad.addColorStop(0.3, `rgb(${180 + energyPulse * 40 - blueShift * 0.3}, ${120 + energyPulse * 25 + blueShift * 0.5}, ${55 + blueShift})`);
    ringGrad.addColorStop(0.5, `rgb(${220 + energyPulse * 35 - blueShift * 0.3}, ${160 + energyPulse * 30 + blueShift * 0.5}, ${80 + blueShift})`);
    ringGrad.addColorStop(0.7, `rgb(${180 + energyPulse * 40 - blueShift * 0.3}, ${120 + energyPulse * 25 + blueShift * 0.5}, ${55 + blueShift})`);
    ringGrad.addColorStop(1, `rgb(${120 + energyPulse * 25 - blueShift * 0.3}, ${75 + energyPulse * 15 + blueShift * 0.5}, ${35 + blueShift})`);
    
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringSize * zoom,
      ringSize * zoom * 0.4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Ring highlight - now fully enclosed ellipse (not just a half circle)
    ctx.strokeStyle = `rgba(255, ${200 + energyPulse * 55}, ${120 + energyPulse * 30 + blueShift}, ${0.6 + energyPulse * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY - 1 * zoom,
      ringSize * zoom * 0.85,
      ringSize * zoom * 0.35,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Energy glow between rings (every other ring)
    if (i > 0 && i % 2 === 0) {
      const glowAlpha = 0.2 + energyPulse * 0.2 + (isAttacking ? 0.4 : 0);
      ctx.fillStyle = `rgba(0, 200, 255, ${glowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        ringY + (coilHeight / ringCount) * 0.6,
        ringSize * zoom * 0.6,
        ringSize * zoom * 0.25,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Animated energy flow on ring (when attacking) - enhanced blue glow
    if (isAttacking) {
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12 * zoom;
      const flowAngle = time * 10 + i * 0.7;
      const flowX = screenPos.x + Math.cos(flowAngle) * ringSize * zoom;
      const flowY = ringY + Math.sin(flowAngle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(100, 220, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(flowX, flowY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      
      // Secondary flow particle
      const flow2Angle = flowAngle + Math.PI;
      const flow2X = screenPos.x + Math.cos(flow2Angle) * ringSize * zoom;
      const flow2Y = ringY + Math.sin(flow2Angle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(50, 180, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(flow2X, flow2Y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      
      // Third flow particle for more dramatic effect
      const flow3Angle = flowAngle + Math.PI * 0.5;
      const flow3X = screenPos.x + Math.cos(flow3Angle) * ringSize * zoom;
      const flow3Y = ringY + Math.sin(flow3Angle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(150, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(flow3X, flow3Y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Energy orb at top - THIS IS WHERE LIGHTNING ORIGINATES
  const orbY = topY - coilHeight + 5 * zoom;
  const orbPulse = 1 + Math.sin(time * 6) * 0.2 + attackIntensity * 0.3;
  const orbSize = (10 + tower.level * 2) * zoom;

  // Store the orb position for projectile origin calculations
  tower._orbScreenY = orbY;

  // Outer energy field - brighter when attacking
  const fieldAlphaBase = isAttacking ? 0.25 : 0.15;
  const energyFieldGrad = ctx.createRadialGradient(
    screenPos.x,
    orbY,
    0,
    screenPos.x,
    orbY,
    orbSize * (2.5 + attackIntensity * 0.5) * orbPulse
  );
  energyFieldGrad.addColorStop(0, `rgba(0, 255, 255, ${fieldAlphaBase + attackIntensity * 0.2})`);
  energyFieldGrad.addColorStop(0.4, `rgba(0, 200, 255, ${0.08 + attackIntensity * 0.15})`);
  energyFieldGrad.addColorStop(0.7, `rgba(0, 150, 255, ${0.03 + attackIntensity * 0.08})`);
  energyFieldGrad.addColorStop(1, "rgba(0, 100, 255, 0)");
  ctx.fillStyle = energyFieldGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbSize * (2.5 + attackIntensity * 0.5) * orbPulse, 0, Math.PI * 2);
  ctx.fill();

  // Main orb - increased glow when attacking
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
  ctx.shadowBlur = (30 + attackIntensity * 25) * zoom * orbPulse;
  const orbGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    orbY - 3 * zoom,
    0,
    screenPos.x,
    orbY,
    orbSize * orbPulse
  );
  // Brighter gradient when attacking
  if (isAttacking) {
    orbGrad.addColorStop(0, "#ffffff");
    orbGrad.addColorStop(0.15, "#ffffff");
    orbGrad.addColorStop(0.35, "#ccffff");
    orbGrad.addColorStop(0.6, "#00ffff");
    orbGrad.addColorStop(0.85, "#0088ff");
    orbGrad.addColorStop(1, "#0066cc");
  } else {
    orbGrad.addColorStop(0, "#ffffff");
    orbGrad.addColorStop(0.2, "#ccffff");
    orbGrad.addColorStop(0.5, "#00ffff");
    orbGrad.addColorStop(0.8, "#0088ff");
    orbGrad.addColorStop(1, "#0044aa");
  }
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbSize * orbPulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Bright solid glowing core when attacking
  if (isAttacking) {
    // Solid bright core
    const coreGrad = ctx.createRadialGradient(
      screenPos.x, orbY, 0,
      screenPos.x, orbY, orbSize * 0.5 * orbPulse
    );
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackIntensity})`);
    coreGrad.addColorStop(0.5, `rgba(220, 255, 255, ${attackIntensity * 0.9})`);
    coreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackIntensity * 0.5})`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, orbY, orbSize * 0.5 * orbPulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner intense white point
    ctx.fillStyle = `rgba(255, 255, 255, ${attackIntensity})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, orbY, orbSize * 0.2 * orbPulse, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Electric arcs from orb - Enhanced with jagged multi-segment lightning
  const arcCount = 5 + tower.level;
  for (let i = 0; i < arcCount; i++) {
    const arcAngle = time * 2.5 + i * ((Math.PI * 2) / arcCount);
    const arcLength = (18 + Math.random() * 12) * zoom;
    const arcEndX = screenPos.x + Math.cos(arcAngle) * arcLength;
    const arcEndY = orbY + Math.sin(arcAngle) * arcLength * 0.4;

    ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + Math.random() * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 6 * zoom;

    // Multi-segment jagged lightning path
    ctx.beginPath();
    ctx.moveTo(screenPos.x, orbY);
    const segments = 4 + Math.floor(Math.random() * 3);
    let px = screenPos.x,
      py = orbY;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const targetX = screenPos.x + (arcEndX - screenPos.x) * t;
      const targetY = orbY + (arcEndY - orbY) * t;
      const jitter = (1 - t) * 8 * zoom;
      const sx = targetX + (Math.random() - 0.5) * jitter;
      const sy = targetY + (Math.random() - 0.5) * jitter * 0.5;
      ctx.lineTo(sx, sy);
      px = sx;
      py = sy;
    }
    ctx.stroke();

    // Branch lightning for longer arcs
    if (arcLength > 22 * zoom && Math.random() > 0.5) {
      const branchStart = 0.4 + Math.random() * 0.3;
      const branchX = screenPos.x + (arcEndX - screenPos.x) * branchStart;
      const branchY = orbY + (arcEndY - orbY) * branchStart;
      const branchAngle = arcAngle + (Math.random() - 0.5) * 1.2;
      const branchLen = arcLength * 0.4;

      ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.2})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(branchX, branchY);
      ctx.lineTo(
        branchX + Math.cos(branchAngle) * branchLen,
        branchY + Math.sin(branchAngle) * branchLen * 0.4
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // Ground-level electricity crackling to nearby rings
  if (Date.now() - tower.lastAttack < 300) {
    for (let g = 0; g < 3; g++) {
      const groundArc = time * 12 + g * 2;
      const gx = screenPos.x + Math.sin(groundArc) * 10 * zoom;
      const gy = topY + 3 * zoom;

      ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.random() * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, topY);
      ctx.lineTo(gx + (Math.random() - 0.5) * 4 * zoom, gy - 5 * zoom);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}

function renderFocusedBeam(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const coilHeight = 65 * zoom;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 400;
  const attackPulse = isAttacking
    ? Math.sin((timeSinceFire / 400) * Math.PI)
    : 0;

  // === MASSIVE ARCANE BASE ===
  // Dark iron foundation
  ctx.fillStyle = "#0a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 8 * zoom,
    28 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing rune circle on base
  ctx.strokeStyle = `rgba(0, 255, 255, ${
    0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4
  })`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 6 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Arcane runes around base
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + time * 0.5;
    const runeX = screenPos.x + Math.cos(angle) * 22 * zoom;
    const runeY = topY + 6 * zoom + Math.sin(angle) * 11 * zoom;
    const runeGlow = 0.4 + Math.sin(time * 3 + i) * 0.2 + attackPulse * 0.5;

    ctx.fillStyle = `rgba(0, 255, 255, ${runeGlow})`;
    ctx.font = `${8 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"][i], runeX, runeY);
  }

  // Elevated tech platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 3 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Platform machinery details
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const detailAngle = (i / 5) * Math.PI * 2 + time;
    const detailX = screenPos.x + Math.cos(detailAngle) * 18 * zoom;
    const detailY = topY + 3 * zoom + Math.sin(detailAngle) * 9 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, topY + 3 * zoom);
    ctx.lineTo(detailX, detailY);
    ctx.stroke();
  }

  // === SUPPORT PYLONS ===
  for (let i = -1; i <= 1; i += 2) {
    const pylonX = screenPos.x + i * 12 * zoom;

    // Pylon body
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.moveTo(pylonX - 4 * zoom, topY);
    ctx.lineTo(pylonX - 2 * zoom, topY - coilHeight + 20 * zoom);
    ctx.lineTo(pylonX + 2 * zoom, topY - coilHeight + 20 * zoom);
    ctx.lineTo(pylonX + 4 * zoom, topY);
    ctx.closePath();
    ctx.fill();

    // Energy conduit on pylon
    const conduitGlow = 0.5 + Math.sin(time * 4 + i) * 0.3 + attackPulse * 0.5;
    ctx.strokeStyle = `rgba(0, 255, 255, ${conduitGlow})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(pylonX, topY - 5 * zoom);
    ctx.lineTo(pylonX, topY - coilHeight + 25 * zoom);
    ctx.stroke();

    // Pylon energy node
    ctx.fillStyle = `rgba(0, 255, 255, ${conduitGlow})`;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(pylonX, topY - coilHeight + 22 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  //support pylon amplifiers
  for (let i = 0; i < 4; i++) {
    const ampAngle = (i / 4) * Math.PI * 2 + time;
    const ampX = screenPos.x + Math.cos(ampAngle) * 16 * zoom;
    const ampY = topY - 4 * zoom + Math.sin(ampAngle) * 8 * zoom;
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.ellipse(ampX, ampY, 4 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // tesla coils on platform corners
  for (let i = 0; i < 4; i++) {
    const coilAngle = (i / 4) * Math.PI * 2 + time;
    const coilX = screenPos.x + Math.cos(coilAngle) * 16 * zoom;
    const coilY = topY - 4 * zoom + Math.sin(coilAngle) * 8 * zoom;
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.ellipse(coilX, coilY, 4 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // add actual copper coils
    const coilTurns = 5;
    for (let j = 0; j < coilTurns; j++) {
      const turnY = coilY - 6 * zoom + (j / coilTurns) * (12 * zoom);
      const turnGlow = 0.3 + Math.sin(time * 4 + j) * 0.2 + attackPulse * 0.4;
      ctx.strokeStyle = `rgba(184, 115, 51, ${turnGlow})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(coilX, turnY, 3 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // lightning from the amplifieer coils hits the dish. make it very random and energetic
    const lightningGlow = 0.5 + Math.random() * 0.5 + attackPulse * 0.5;
    ctx.strokeStyle = `rgba(0, 255, 255, ${lightningGlow})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(coilX, coilY - 6 * zoom);
    const segments = 5 + Math.floor(Math.random() * 3);
    let px = coilX,
      py = coilY - 6 * zoom;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const targetX = screenPos.x + (coilX - screenPos.x) * (1 - t) * 0.3;
      const targetY =
        topY -
        coilHeight +
        12 * zoom +
        (coilY - (topY - coilHeight + 12 * zoom)) * (1 - t) * 0.3;
      const jitter = (1 - t) * 8 * zoom;
      const sx = targetX + (Math.random() - 0.5) * jitter;
      const sy = targetY + (Math.random() - 0.5) * jitter * 0.5;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ring below pylon amplifiers
  const ringGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.strokeStyle = `rgba(0, 255, 255, ${ringGlow})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const ringAngle = (i / 4) * Math.PI * 2 + time;
    const ringX = screenPos.x + Math.cos(ringAngle) * 16 * zoom;
    const ringY = topY + 12 * zoom + Math.sin(ringAngle) * 8 * zoom - 10 * zoom;
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === MASSIVE FOCUSING DISH ===
  // Outer dish ring
  const dishY = topY - coilHeight + 12 * zoom;
  const dishSize = 28 + attackPulse * 4;

  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    dishY,
    dishSize * zoom,
    dishSize * 0.72 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Dish metallic gradient
  const dishGrad = ctx.createRadialGradient(
    screenPos.x - 8 * zoom,
    dishY - 4 * zoom,
    0,
    screenPos.x,
    dishY,
    dishSize * zoom
  );
  dishGrad.addColorStop(0, "#5d9abe");
  dishGrad.addColorStop(0.4, "#3d7a9e");
  dishGrad.addColorStop(0.8, "#2d5a7b");
  dishGrad.addColorStop(1, "#1a3a4f");
  ctx.fillStyle = dishGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    dishY,
    (dishSize - 3) * zoom,
    (dishSize * 0.72 - 2) * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Inner dish concentric rings
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = dishSize - 8 - ring * 5;
    const ringGlow = 0.2 + Math.sin(time * 3 + ring) * 0.1 + attackPulse * 0.3;
    ctx.strokeStyle = `rgba(0, 255, 255, ${ringGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      dishY,
      ringSize * zoom,
      ringSize * 0.72 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // === CENTRAL FOCUS CRYSTAL ===
  const crystalY = dishY - 5 * zoom;
  const crystalPulse = 1 + Math.sin(time * 5) * 0.1 + attackPulse * 0.3;

  // Crystal housing
  ctx.fillStyle = "#2d5a7b";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    crystalY + 8 * zoom,
    8 * zoom,
    4 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Floating crystal shards
  for (let i = 0; i < 4; i++) {
    const shardAngle = (i / 4) * Math.PI * 2 + time * 2;
    const shardDist = 15 + Math.sin(time * 3 + i * 1.5) * 3;
    const shardX = screenPos.x + Math.cos(shardAngle) * shardDist * zoom;
    const shardY = crystalY + Math.sin(shardAngle) * shardDist * 0.4 * zoom;

    ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + attackPulse * 0.4})`;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(shardX, shardY - 5 * zoom);
    ctx.lineTo(shardX - 2 * zoom, shardY);
    ctx.lineTo(shardX, shardY + 3 * zoom);
    ctx.lineTo(shardX + 2 * zoom, shardY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Main crystal core - unique focused beam style
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
  ctx.shadowBlur = (20 + attackPulse * 25) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 10 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner crystal glow
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 5 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Bright solid core flash when attacking
  if (attackPulse > 0.1) {
    // Expanding bright core
    const flashSize = 8 * crystalPulse * zoom * (1 + attackPulse * 0.5);
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, crystalY, flashSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner intense white point
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, crystalY, flashSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Store emitter position
  tower._orbScreenY = crystalY;

  // === CRACKLING ENERGY ARCS ===
  for (let i = 0; i < 12; i++) {
    const angle = time * 3 + i * (Math.PI / 6);
    const dist = 20 + Math.sin(time * 6 + i) * 5;
    const ex = screenPos.x + Math.cos(angle) * dist * zoom;
    const ey = dishY + Math.sin(angle) * dist * 0.5 * zoom;

    ctx.strokeStyle = `rgba(0, 255, 255, ${
      0.4 + Math.random() * 0.3 + attackPulse * 0.3
    })`;
    ctx.lineWidth = (1 + attackPulse) * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, crystalY);
    // Jagged lightning path
    const midX =
      screenPos.x + (ex - screenPos.x) * 0.5 + (Math.random() - 0.5) * 8 * zoom;
    const midY =
      crystalY + (ey - crystalY) * 0.5 + (Math.random() - 0.5) * 4 * zoom;
    ctx.lineTo(midX, midY);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // === BEAM CHARGING EFFECT ===
  if (isAttacking) {
    const beamPhase = timeSinceFire / 400;

    // Expanding energy rings
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (beamPhase + ring * 0.15) % 1;
      const ringRadius = 5 + ringPhase * 25;
      const ringAlpha = (1 - ringPhase) * 0.6;

      ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
      ctx.lineWidth = 2 * zoom * (1 - ringPhase);
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        crystalY,
        ringRadius * zoom,
        ringRadius * 0.5 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Core flash
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - beamPhase) * 0.8})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      crystalY,
      15 * (1 - beamPhase * 0.5) * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function renderChainLightning(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
) {
  const coilHeight = 65 * zoom;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 400;
  const attackPulse = isAttacking
    ? Math.sin((timeSinceFire / 400) * Math.PI)
    : 0;

  // Base platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 5 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === MASSIVE ARCANE BASE ===
  // Dark iron foundation
  ctx.fillStyle = "#0a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 8 * zoom,
    28 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing tech modules that pulse the base
  ctx.strokeStyle = `rgba(0, 255, 255, ${
    0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4
  })`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 6 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Elevated tech platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 3 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // machinery on foundation platform (not a spinning thing)
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const detailAngle = (i / 5) * Math.PI * 2 + time;
    const detailX = screenPos.x + Math.cos(detailAngle) * 18 * zoom;
    const detailY = topY + 3 * zoom + Math.sin(detailAngle) * 9 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, topY + 3 * zoom);
    ctx.lineTo(detailX, detailY);
    ctx.stroke();
  }

  // Central pillar
  ctx.fillStyle = "#2d5a7b";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 6 * zoom, topY);
  ctx.lineTo(screenPos.x - 4 * zoom, topY - coilHeight + 20 * zoom);
  ctx.lineTo(screenPos.x + 4 * zoom, topY - coilHeight + 20 * zoom);
  ctx.lineTo(screenPos.x + 6 * zoom, topY);
  ctx.closePath();
  ctx.fill();

  // Multiple smaller coils around the main one
  const coilPositions = [
    { x: -16, y: 0, size: 0.7 },
    { x: 16, y: 0, size: 0.7 },
    { x: 0, y: -10, size: 0.8 },
    { x: 0, y: 10, size: 0.6 },
  ];

  for (const pos of coilPositions) {
    const cx = screenPos.x + pos.x * zoom;
    const cy = topY + pos.y * zoom;
    const coilSize = pos.size;

    // Mini coil base
    ctx.fillStyle = "#1a3a4f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      8 * zoom * coilSize,
      4 * zoom * coilSize,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // big amplifier/vents on top of the main circle
    ctx.fillStyle = "#3a6a8f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy - 2 * zoom * coilSize,
      10 * zoom * coilSize,
      5 * zoom * coilSize,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // tech circles under pylons
    ctx.fillStyle = "#2a4a5f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy - 1 * zoom * coilSize,
      6 * zoom * coilSize,
      3 * zoom * coilSize,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Mini coil pillar
    ctx.fillStyle = "#2d5a7b";
    ctx.fillRect(
      cx - 3 * zoom * coilSize,
      cy - 20 * zoom * coilSize,
      6 * zoom * coilSize,
      20 * zoom * coilSize
    );

    // add copper coils to pylons
    const coilTurns = 4;
    for (let j = 0; j < coilTurns; j++) {
      const turnY =
        cy - 10 * zoom * coilSize + (j / coilTurns) * (12 * zoom * coilSize);
      const turnGlow = 0.3 + Math.sin(time * 4 + j) * 0.2 + attackPulse * 0.4;
      ctx.strokeStyle = `rgba(184, 115, 51, ${turnGlow})`;
      ctx.lineWidth = 2 * zoom * coilSize;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        turnY,
        5 * zoom * coilSize,
        2 * zoom * coilSize,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Mini orb using attackPulse - detailed electricity bulb
    const miniOrbY = cy - 25 * zoom * coilSize;
    const pulse = 0.8 + Math.sin(time * 6 + pos.x) * 0.2 + attackPulse * 0.3;
    const miniOrbSize = 6 * zoom * pulse * coilSize;
    
    // Outer energy field for mini orb - brighter when attacking
    const miniFieldAlpha = isAttacking ? 0.25 : 0.15;
    const miniFieldGrad = ctx.createRadialGradient(
      cx, miniOrbY, 0,
      cx, miniOrbY, miniOrbSize * (2 + attackPulse * 0.5)
    );
    miniFieldGrad.addColorStop(0, `rgba(0, 255, 255, ${miniFieldAlpha + attackPulse * 0.2})`);
    miniFieldGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.08 + attackPulse * 0.12})`);
    miniFieldGrad.addColorStop(1, "rgba(0, 150, 255, 0)");
    ctx.fillStyle = miniFieldGrad;
    ctx.beginPath();
    ctx.arc(cx, miniOrbY, miniOrbSize * (2 + attackPulse * 0.5), 0, Math.PI * 2);
    ctx.fill();
    
    // Main mini orb with gradient - brighter glow when attacking
    ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
    ctx.shadowBlur = (15 + attackPulse * 15) * zoom * pulse;
    const miniOrbGrad = ctx.createRadialGradient(
      cx - 1.5 * zoom * coilSize, miniOrbY - 1.5 * zoom * coilSize, 0,
      cx, miniOrbY, miniOrbSize
    );
    if (isAttacking) {
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.15, "#ffffff");
      miniOrbGrad.addColorStop(0.35, "#ccffff");
      miniOrbGrad.addColorStop(0.6, "#00ffff");
      miniOrbGrad.addColorStop(0.85, "#0088ff");
      miniOrbGrad.addColorStop(1, "#0066cc");
    } else {
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.25, "#ccffff");
      miniOrbGrad.addColorStop(0.5, "#00ffff");
      miniOrbGrad.addColorStop(0.8, "#0088ff");
      miniOrbGrad.addColorStop(1, "#0044aa");
    }
    ctx.fillStyle = miniOrbGrad;
    ctx.beginPath();
    ctx.arc(cx, miniOrbY, miniOrbSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Solid glowing core when attacking for mini orbs
    if (attackPulse > 0.1) {
      // Solid bright core
      const miniCoreGrad = ctx.createRadialGradient(
        cx, miniOrbY, 0,
        cx, miniOrbY, miniOrbSize * 0.5
      );
      miniCoreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackPulse})`);
      miniCoreGrad.addColorStop(0.5, `rgba(220, 255, 255, ${attackPulse * 0.9})`);
      miniCoreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackPulse * 0.5})`);
      ctx.fillStyle = miniCoreGrad;
      ctx.beginPath();
      ctx.arc(cx, miniOrbY, miniOrbSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner intense white point
      ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
      ctx.beginPath();
      ctx.arc(cx, miniOrbY, miniOrbSize * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    // Mini electric arcs from mini orbs
    const miniArcCount = 3;
    for (let a = 0; a < miniArcCount; a++) {
      const arcAngle = time * 3 + a * ((Math.PI * 2) / miniArcCount) + pos.x;
      const arcLength = (8 + Math.random() * 5) * zoom * coilSize;
      const arcEndX = cx + Math.cos(arcAngle) * arcLength;
      const arcEndY = miniOrbY + Math.sin(arcAngle) * arcLength * 0.4;
      
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + Math.random() * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(cx, miniOrbY);
      // Jagged lightning
      const midX = cx + (arcEndX - cx) * 0.5 + (Math.random() - 0.5) * 4 * zoom;
      const midY = miniOrbY + (arcEndY - miniOrbY) * 0.5 + (Math.random() - 0.5) * 2 * zoom;
      ctx.lineTo(midX, midY);
      ctx.lineTo(arcEndX, arcEndY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Central main orb - detailed electricity bulb
  const mainOrbY = topY - coilHeight + 4 * zoom - attackPulse * 5 * zoom;
  const mainOrbPulse = 0.9 + Math.sin(time * 5) * 0.2 + attackPulse * 0.3;
  const mainOrbSize = 12 * zoom * mainOrbPulse;
  
  // Store orb position
  tower._orbScreenY = mainOrbY;
  
  // Outer energy field - brighter when attacking
  const mainFieldAlpha = isAttacking ? 0.3 : 0.2;
  const energyFieldGrad = ctx.createRadialGradient(
    screenPos.x, mainOrbY, 0,
    screenPos.x, mainOrbY, mainOrbSize * (2.5 + attackPulse * 0.5)
  );
  energyFieldGrad.addColorStop(0, `rgba(0, 255, 255, ${mainFieldAlpha + attackPulse * 0.25})`);
  energyFieldGrad.addColorStop(0.4, `rgba(0, 200, 255, ${0.1 + attackPulse * 0.15})`);
  energyFieldGrad.addColorStop(0.7, `rgba(0, 150, 255, ${0.05 + attackPulse * 0.1})`);
  energyFieldGrad.addColorStop(1, "rgba(0, 100, 255, 0)");
  ctx.fillStyle = energyFieldGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, mainOrbY, mainOrbSize * (2.5 + attackPulse * 0.5), 0, Math.PI * 2);
  ctx.fill();
  
  // Main orb with detailed gradient - brighter glow when attacking
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
  ctx.shadowBlur = (30 + attackPulse * 30) * zoom * mainOrbPulse;
  const mainOrbGrad = ctx.createRadialGradient(
    screenPos.x - 4 * zoom, mainOrbY - 4 * zoom, 0,
    screenPos.x, mainOrbY, mainOrbSize
  );
  if (isAttacking) {
    mainOrbGrad.addColorStop(0, "#ffffff");
    mainOrbGrad.addColorStop(0.15, "#ffffff");
    mainOrbGrad.addColorStop(0.35, "#ccffff");
    mainOrbGrad.addColorStop(0.6, "#00ffff");
    mainOrbGrad.addColorStop(0.85, "#0088ff");
    mainOrbGrad.addColorStop(1, "#0066cc");
  } else {
    mainOrbGrad.addColorStop(0, "#ffffff");
    mainOrbGrad.addColorStop(0.2, "#ccffff");
    mainOrbGrad.addColorStop(0.5, "#00ffff");
    mainOrbGrad.addColorStop(0.8, "#0088ff");
    mainOrbGrad.addColorStop(1, "#0044aa");
  }
  ctx.fillStyle = mainOrbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, mainOrbY, mainOrbSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Solid glowing core when attacking
  if (attackPulse > 0.1) {
    // Solid bright core
    const coreGrad = ctx.createRadialGradient(
      screenPos.x, mainOrbY, 0,
      screenPos.x, mainOrbY, mainOrbSize * 0.5
    );
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackPulse})`);
    coreGrad.addColorStop(0.5, `rgba(220, 255, 255, ${attackPulse * 0.9})`);
    coreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackPulse * 0.5})`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, mainOrbY, mainOrbSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner intense white point
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, mainOrbY, mainOrbSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  
  // Electric arcs from main orb - jagged multi-segment lightning
  const mainArcCount = 6 + Math.floor(attackPulse * 4);
  for (let i = 0; i < mainArcCount; i++) {
    const arcAngle = time * 2.5 + i * ((Math.PI * 2) / mainArcCount);
    const arcLength = (20 + Math.random() * 15) * zoom;
    const arcEndX = screenPos.x + Math.cos(arcAngle) * arcLength;
    const arcEndY = mainOrbY + Math.sin(arcAngle) * arcLength * 0.4;
    
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + Math.random() * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 6 * zoom;
    
    // Multi-segment jagged lightning path
    ctx.beginPath();
    ctx.moveTo(screenPos.x, mainOrbY);
    const segments = 3 + Math.floor(Math.random() * 3);
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const targetX = screenPos.x + (arcEndX - screenPos.x) * t;
      const targetY = mainOrbY + (arcEndY - mainOrbY) * t;
      const jitter = (1 - t) * 8 * zoom;
      const sx = targetX + (Math.random() - 0.5) * jitter;
      const sy = targetY + (Math.random() - 0.5) * jitter * 0.5;
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    
    // Branch lightning for some arcs
    if (Math.random() > 0.6) {
      const branchStart = 0.4 + Math.random() * 0.3;
      const branchX = screenPos.x + (arcEndX - screenPos.x) * branchStart;
      const branchY = mainOrbY + (arcEndY - mainOrbY) * branchStart;
      const branchAngle = arcAngle + (Math.random() - 0.5) * 1.2;
      const branchLen = arcLength * 0.4;
      
      ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.2})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(branchX, branchY);
      ctx.lineTo(
        branchX + Math.cos(branchAngle) * branchLen,
        branchY + Math.sin(branchAngle) * branchLen * 0.4
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // Connecting arcs between coils
  // using attackPulse
  ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
  for (let i = 0; i < coilPositions.length; i++) {
    const pos = coilPositions[i];
    const cx = screenPos.x + pos.x * zoom;
    const cy = topY + pos.y * zoom - 25 * zoom * pos.size;

    // Draw arcs to center
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const midX =
      screenPos.x +
      (cx - screenPos.x) * 0.5 +
      (Math.random() - 0.5) * 10 * zoom;
    const midY =
      mainOrbY + (cy - mainOrbY) * 0.5 + (Math.random() - 0.5) * 5 * zoom;
    ctx.lineTo(midX, midY);
    ctx.lineTo(screenPos.x, mainOrbY);
    ctx.stroke();
  }
}

// ARCH TOWER - Mystical Fantasy Portal with Ancient Runes
function renderArchTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string }
) {
  ctx.save();
  // Shift the entire building up slightly
  screenPos = { x: screenPos.x, y: screenPos.y - 8 * zoom };
  const baseWidth = 38 + tower.level * 5;
  const baseDepth = 30 + tower.level * 4;
  const w = baseWidth * zoom * 0.5;
  const d = baseDepth * zoom * 0.25;

  const isShockwave = tower.level === 4 && tower.upgrade === "A";
  const isSymphony = tower.level === 4 && tower.upgrade === "B";

  let mainColor = "rgba(50, 200, 100,";
  if (isShockwave) {
    mainColor = "rgba(255, 100, 100,";
  } else if (isSymphony) {
    mainColor = "rgba(100, 200, 255,";
  }

  // Dynamic attack animation
  const timeSinceFire = Date.now() - tower.lastAttack;
  let attackPulse = 0;
  let archVibrate = 0;
  let pillarSpread = 0;
  let pillarBounce = 0;
  let foundationShift = 0;
  let archLift = 0;
  let portalExpand = 0;

  if (timeSinceFire < 600) {
    const attackPhase = timeSinceFire / 600;
    attackPulse = (1 - attackPhase) * 0.6;
    archVibrate = Math.sin(attackPhase * Math.PI * 12) * (1 - attackPhase) * 4 * zoom;
    if (attackPhase < 0.3) {
      pillarSpread = (attackPhase / 0.3) * 6 * zoom;
      pillarBounce = Math.sin(attackPhase * Math.PI * 10) * 3 * zoom;
    } else {
      pillarSpread = 6 * zoom * (1 - (attackPhase - 0.3) / 0.7);
      pillarBounce = Math.sin(attackPhase * Math.PI * 6) * (1 - attackPhase) * 2 * zoom;
    }
    foundationShift = Math.sin(attackPhase * Math.PI * 8) * (1 - attackPhase) * 2 * zoom;
    if (attackPhase < 0.2) {
      archLift = (attackPhase / 0.2) * 5 * zoom;
    } else {
      archLift = 5 * zoom * (1 - (attackPhase - 0.2) / 0.8);
    }
    portalExpand = Math.sin(attackPhase * Math.PI) * 8 * zoom;
  }

  const pulseSize = 1 + Math.sin(time * 3) * 0.02;
  const glowColor = isShockwave ? "255, 100, 100" : isSymphony ? "100, 200, 255" : "50, 200, 100";

  // === MYSTICAL FOUNDATION BASE ===
  const subBuildingWidth = baseWidth + 20;
  const subBuildingHeight = 18;
  const subBounce = isShockwave || isSymphony ? Math.sin(time * 6) * 2 * zoom : Math.sin(time * 3) * 1 * zoom;

  // Ancient stone foundation with mystical glow
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.3,
    screenPos.y + 20 * zoom,
    subBuildingWidth + 8,
    baseDepth + 36,
    6,
    {
      top: "#5a4a3a",
      left: "#4a3a2a",
      right: "#3a2a1a",
      leftBack: "#6a5a4a",
      rightBack: "#5a4a3a",
    },
    zoom
  );
  
  // Foundation rune circle on ground
  const runeCircleGlow = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4;
  ctx.strokeStyle = `rgba(${glowColor}, ${runeCircleGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 18 * zoom, (subBuildingWidth + 4) * zoom * 0.4, (baseDepth + 32) * zoom * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner rune circle
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y + 18 * zoom, (subBuildingWidth - 4) * zoom * 0.35, (baseDepth + 24) * zoom * 0.18, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Ground rune symbols
  const groundRunes = ["ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᛁ", "ᛃ"];
  ctx.fillStyle = `rgba(${glowColor}, ${runeCircleGlow + 0.1})`;
  ctx.font = `${8 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 8; i++) {
    const runeAngle = (i / 8) * Math.PI * 2 + time * 0.2;
    const runeX = screenPos.x + Math.cos(runeAngle) * (subBuildingWidth - 2) * zoom * 0.35;
    const runeY = screenPos.y + 18 * zoom + Math.sin(runeAngle) * (baseDepth + 20) * zoom * 0.16;
    ctx.fillText(groundRunes[i], runeX, runeY);
  }

  // Lower foundation block
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.3,
    screenPos.y + 16 * zoom,
    subBuildingWidth,
    baseDepth + 28,
    12,
    {
      top: "#786858",
      left: "#685848",
      right: "#584838",
      leftBack: "#887868",
      rightBack: "#786858",
    },
    zoom
  );
  
  // Corner buttress supports (mystical stone pillars)
  for (const corner of [0, 1, 2, 3]) {
    const cx = screenPos.x + (corner < 2 ? -1 : 1) * (subBuildingWidth * 0.42) * zoom;
    const cy = screenPos.y + 14 * zoom + (corner % 2 === 0 ? -1 : 1) * (baseDepth + 20) * zoom * 0.18;
    
    // Buttress pillar
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14 * zoom);
    ctx.lineTo(cx - 4 * zoom, cy - 8 * zoom);
    ctx.lineTo(cx - 4 * zoom, cy + 4 * zoom);
    ctx.lineTo(cx + 4 * zoom, cy + 4 * zoom);
    ctx.lineTo(cx + 4 * zoom, cy - 8 * zoom);
    ctx.closePath();
    ctx.fill();
    
    // Buttress cap
    ctx.fillStyle = "#8a7a6a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 18 * zoom);
    ctx.lineTo(cx - 5 * zoom, cy - 12 * zoom);
    ctx.lineTo(cx + 5 * zoom, cy - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    
    // Buttress rune glow
    const buttressGlow = 0.4 + Math.sin(time * 3 + corner) * 0.25 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${buttressGlow})`;
    ctx.beginPath();
    ctx.arc(cx, cy - 4 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sub-building main structure
  const subShift = timeSinceFire < 600 ? Math.sin((timeSinceFire / 600) * Math.PI * 6) * 2 * zoom * (1 - timeSinceFire / 600) : 0;
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.4 + subShift,
    screenPos.y + 2 * zoom + subBounce,
    subBuildingWidth - 6,
    baseDepth + 22,
    subBuildingHeight,
    {
      top: "#a89878",
      left: "#988868",
      right: "#887858",
      leftBack: "#b8a888",
      rightBack: "#a89878",
    },
    zoom
  );
  
  // Mystical wall runes on sub-building
  const wallRunes = ["ᛟ", "ᛞ", "ᛒ", "ᛖ"];
  const wallRuneGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${wallRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${10 * zoom}px serif`;
  for (let i = 0; i < 4; i++) {
    const runeX = screenPos.x + (i - 1.5) * 12 * zoom + subShift * 0.5;
    const runeY = screenPos.y + 6 * zoom + subBounce;
    ctx.fillText(wallRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Gothic windows on sub-building
  const windowGlowBase = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5;
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 2; row++) {
      const winX = screenPos.x + side * 18 * zoom + subShift * 0.5;
      const winY = screenPos.y + 2 + subBounce - row * 8 * zoom;

      // Gothic pointed arch window frame
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(winX - 4 * zoom, winY + 5 * zoom);
      ctx.lineTo(winX - 4 * zoom, winY);
      ctx.quadraticCurveTo(winX, winY - 5 * zoom, winX + 4 * zoom, winY);
      ctx.lineTo(winX + 4 * zoom, winY + 5 * zoom);
      ctx.stroke();
      
      // Window glow
      ctx.fillStyle = `${mainColor} ${windowGlowBase})`;
      ctx.beginPath();
      ctx.moveTo(winX - 3 * zoom, winY + 4 * zoom);
      ctx.lineTo(winX - 3 * zoom, winY);
      ctx.quadraticCurveTo(winX, winY - 4 * zoom, winX + 3 * zoom, winY);
      ctx.lineTo(winX + 3 * zoom, winY + 4 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Mystical resonance crystals on sides
  const chamberPulse = 0.5 + attackPulse;
  for (let side = -1; side <= 1; side += 2) {
    const chamberX = screenPos.x + side * (subBuildingWidth * 0.42) * zoom + subShift * side * 0.3;
    const chamberY = screenPos.y + 6 * zoom + subBounce;
    
    // Crystal housing
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.moveTo(chamberX, chamberY - 10 * zoom);
    ctx.lineTo(chamberX - 5 * zoom, chamberY - 4 * zoom);
    ctx.lineTo(chamberX - 4 * zoom, chamberY + 4 * zoom);
    ctx.lineTo(chamberX + 4 * zoom, chamberY + 4 * zoom);
    ctx.lineTo(chamberX + 5 * zoom, chamberY - 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Glowing crystal
    ctx.fillStyle = `${mainColor} ${chamberPulse})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(chamberX, chamberY - 8 * zoom);
    ctx.lineTo(chamberX - 3 * zoom, chamberY);
    ctx.lineTo(chamberX, chamberY + 2 * zoom);
    ctx.lineTo(chamberX + 3 * zoom, chamberY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crystal energy rings during attack
    if (timeSinceFire < 400) {
      const ringPhase = timeSinceFire / 400;
      ctx.strokeStyle = `${mainColor} ${(1 - ringPhase) * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(chamberX, chamberY, (6 + ringPhase * 10) * zoom, (4 + ringPhase * 6) * zoom, 0.3 * side, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Energy conduit pipes with mystical flow
  const pipeGlow = 0.3 + attackPulse * 0.6;
  ctx.strokeStyle = `${mainColor} ${pipeGlow})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const pipeStartX = screenPos.x + side * 30 * zoom;
    const pipeEndX = screenPos.x + side * (baseWidth * 0.35) * zoom;
    ctx.beginPath();
    ctx.moveTo(pipeStartX + subShift * 0.3, screenPos.y + 7 * zoom + subBounce);
    ctx.quadraticCurveTo(
      screenPos.x + side * 32 * zoom,
      screenPos.y - 8 * zoom,
      pipeEndX - pillarSpread * side * 0.3,
      screenPos.y - 14 * zoom
    );
    ctx.stroke();

    // Flowing energy particles along pipe
    for (let p = 0; p < 3; p++) {
      const pipePhase = (time * 2 + p * 0.33 + side * 0.5) % 1;
      const px = pipeStartX + (pipeEndX - pipeStartX) * pipePhase;
      const py = screenPos.y + 7 * zoom - pipePhase * 20 * zoom;
      ctx.fillStyle = `${mainColor} ${0.6 + Math.sin(time * 8 + p) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Upper foundation platform with arcane symbols
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.5,
    screenPos.y - 18 * zoom,
    baseWidth + 12 + pillarSpread * 2,
    baseDepth + 18 + pillarSpread * 2,
    6,
    {
      top: "#a89880",
      left: "#988870",
      right: "#887860",
      leftBack: "#b8a890",
      rightBack: "#a89880",
    },
    zoom
  );
  
  // Arcane circle on platform
  const platformGlow = 0.35 + Math.sin(time * 2.5) * 0.15 + attackPulse * 0.4;
  ctx.strokeStyle = `rgba(${glowColor}, ${platformGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y - 21 * zoom, (baseWidth + 8) * zoom * 0.35, (baseDepth + 14) * zoom * 0.18, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Platform corner rune stones
  for (let corner of [-1, 1]) {
    const stoneX = screenPos.x + corner * (baseWidth + 8) * zoom * 0.4;
    const stoneY = screenPos.y - 20 * zoom;
    
    // Rune stone
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.ellipse(stoneX, stoneY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Rune glow on stone
    ctx.fillStyle = `rgba(${glowColor}, ${platformGlow + 0.15})`;
    ctx.font = `${6 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(corner < 0 ? "ᚠ" : "ᚢ", stoneX, stoneY + 2 * zoom);
  }

  // Green tech panel lines on foundation
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.strokeStyle = `${mainColor} ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= 2; i++) {
    const lineY = screenPos.y - 16 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.9, lineY - d * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.9, lineY - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3);
    ctx.stroke();
  }

  // === MYSTICAL PILLARS WITH RUNES ===
  const pillarWidth = 14 + tower.level * 2;
  const pillarHeight = 35 + tower.level * 8;
  const pillarX = screenPos.x - baseWidth * zoom * 0.35 - archVibrate * 0.3 - pillarSpread;
  const pillarXR = screenPos.x + baseWidth * zoom * 0.35 + archVibrate * 0.3 + pillarSpread;
  const pw = pillarWidth * zoom * 0.5;
  const pd = pillarWidth * zoom * 0.25;

  // Left pillar
  drawIsometricPrism(
    ctx,
    pillarX + pillarBounce * 0.5,
    screenPos.y - 24 * zoom - pillarBounce,
    pillarWidth * pulseSize,
    pillarWidth * pulseSize,
    pillarHeight,
    {
      top: "#c8b8a0",
      left: "#b8a890",
      right: "#a89880",
      leftBack: "#d8c8b0",
      rightBack: "#c8b8a0",
    },
    zoom
  );

  // Left pillar ornate base
  ctx.fillStyle = "#9a8a7a";
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5 - pw * 1.4, screenPos.y - 24 * zoom);
  ctx.lineTo(pillarX + pillarBounce * 0.5 - pw * 1.2, screenPos.y - 28 * zoom);
  ctx.lineTo(pillarX + pillarBounce * 0.5 + pw * 1.2, screenPos.y - 28 * zoom);
  ctx.lineTo(pillarX + pillarBounce * 0.5 + pw * 1.4, screenPos.y - 24 * zoom);
  ctx.closePath();
  ctx.fill();

  // Gothic stone block lines on left pillar
  ctx.strokeStyle = "#8a7a6a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 6; row++) {
    const blockY = screenPos.y - 30 - pillarBounce - row * pillarHeight * zoom * 0.15;
    ctx.beginPath();
    ctx.moveTo(pillarX + pillarBounce * 0.5 - pw * 0.9, blockY - pd * 0.3);
    ctx.lineTo(pillarX + pillarBounce * 0.5 + pw * 0.9, blockY + pd * 0.3);
    ctx.stroke();
  }
  
  // Left pillar glowing runes
  const pillarRunes = ["ᚦ", "ᚨ", "ᚾ", "ᛊ"];
  const pillarRuneGlow = 0.5 + Math.sin(time * 3) * 0.25 + attackPulse * 0.6;
  ctx.fillStyle = `rgba(${glowColor}, ${pillarRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${8 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < tower.level + 1; i++) {
    const runeY = screenPos.y - 35 * zoom - pillarBounce - i * pillarHeight * zoom * 0.22;
    ctx.fillText(pillarRunes[i % 4], pillarX + pillarBounce * 0.5, runeY);
  }
  ctx.shadowBlur = 0;

  // Pillar capital on left pillar (smaller, properly scaled)
  const capitalY = screenPos.y - 24 * zoom - pillarHeight * zoom - pillarBounce;
  const capW = 8 * zoom; // Capital half-width
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5 - capW * 1.1, capitalY + 4 * zoom);
  ctx.lineTo(pillarX + pillarBounce * 0.5 - capW * 0.8, capitalY - 2 * zoom);
  ctx.lineTo(pillarX + pillarBounce * 0.5 + capW * 0.8, capitalY - 2 * zoom);
  ctx.lineTo(pillarX + pillarBounce * 0.5 + capW * 1.1, capitalY + 4 * zoom);
  ctx.closePath();
  ctx.fill();
  
  // Capital decorative scrollwork
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5 - capW * 0.9, capitalY + 1 * zoom);
  ctx.quadraticCurveTo(pillarX + pillarBounce * 0.5 - capW * 0.45, capitalY - 1 * zoom, pillarX + pillarBounce * 0.5, capitalY + 1 * zoom);
  ctx.quadraticCurveTo(pillarX + pillarBounce * 0.5 + capW * 0.45, capitalY - 1 * zoom, pillarX + pillarBounce * 0.5 + capW * 0.9, capitalY + 1 * zoom);
  ctx.stroke();

  // Right pillar
  drawIsometricPrism(
    ctx,
    pillarXR - pillarBounce * 0.5,
    screenPos.y - 24 * zoom - pillarBounce,
    pillarWidth * pulseSize,
    pillarWidth * pulseSize,
    pillarHeight,
    {
      top: "#c8b8a0",
      left: "#b8a890",
      right: "#a89880",
      leftBack: "#d8c8b0",
      rightBack: "#c8b8a0",
    },
    zoom
  );

  // Right pillar ornate base
  ctx.fillStyle = "#9a8a7a";
  ctx.beginPath();
  ctx.moveTo(pillarXR - pillarBounce * 0.5 - pw * 1.4, screenPos.y - 24 * zoom);
  ctx.lineTo(pillarXR - pillarBounce * 0.5 - pw * 1.2, screenPos.y - 28 * zoom);
  ctx.lineTo(pillarXR - pillarBounce * 0.5 + pw * 1.2, screenPos.y - 28 * zoom);
  ctx.lineTo(pillarXR - pillarBounce * 0.5 + pw * 1.4, screenPos.y - 24 * zoom);
  ctx.closePath();
  ctx.fill();

  // Gothic stone block lines on right pillar
  for (let row = 0; row < 6; row++) {
    const blockY = screenPos.y - 30 - pillarBounce - row * pillarHeight * zoom * 0.15;
    ctx.beginPath();
    ctx.moveTo(pillarXR - pillarBounce * 0.5 - pw * 0.9, blockY - pd * 0.3);
    ctx.lineTo(pillarXR - pillarBounce * 0.5 + pw * 0.9, blockY + pd * 0.3);
    ctx.stroke();
  }
  
  // Right pillar glowing runes
  ctx.fillStyle = `rgba(${glowColor}, ${pillarRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  for (let i = 0; i < tower.level + 1; i++) {
    const runeY = screenPos.y - 35 * zoom - pillarBounce - i * pillarHeight * zoom * 0.22;
    ctx.fillText(pillarRunes[(i + 2) % 4], pillarXR - pillarBounce * 0.5, runeY);
  }
  ctx.shadowBlur = 0;

  // Pillar capital on right pillar (matches left pillar)
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(pillarXR - pillarBounce * 0.5 - capW * 1.1, capitalY + 4 * zoom);
  ctx.lineTo(pillarXR - pillarBounce * 0.5 - capW * 0.9, capitalY - 2 * zoom);
  ctx.lineTo(pillarXR - pillarBounce * 0.5 + capW * 0.9, capitalY - 2 * zoom);
  ctx.lineTo(pillarXR - pillarBounce * 0.5 + capW * 1.1, capitalY + 4 * zoom);
  ctx.closePath();
  ctx.fill();
  
  // Capital decorative scrollwork
  ctx.strokeStyle = "#a89878";
  ctx.beginPath();
  ctx.moveTo(pillarXR - pillarBounce * 0.5 - capW * 0.9, capitalY + 1 * zoom);
  ctx.quadraticCurveTo(pillarXR - pillarBounce * 0.5 - capW * 0.45, capitalY - 1 * zoom, pillarXR - pillarBounce * 0.5, capitalY + 1 * zoom);
  ctx.quadraticCurveTo(pillarXR - pillarBounce * 0.5 + capW * 0.45, capitalY - 1 * zoom, pillarXR - pillarBounce * 0.5 + capW * 0.9, capitalY + 1 * zoom);
  ctx.stroke();

  // Glowing energy strips on pillars
  for (const p of [pillarX + pillarBounce * 0.5, pillarXR - pillarBounce * 0.5]) {
    for (let i = 0; i < tower.level + 2; i++) {
      const stripY = screenPos.y - 22 * zoom - pillarHeight * zoom * (0.15 + i * 0.2) - pillarBounce;
      const stripGlow = 0.4 + Math.sin(time * 4 + i * 0.5) * 0.3 + attackPulse * 1.5;

      ctx.fillStyle = `${mainColor} ${stripGlow})`;
      ctx.beginPath();
      ctx.ellipse(p - pw * 0.5, stripY + pd * 0.2, 3 * zoom, 1.5 * zoom, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p + pw * 0.5, stripY + pd * 0.2, 3 * zoom, 1.5 * zoom, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LEVEL 2 UNIQUE FEATURES ===
  if (tower.level >= 2) {
    // Floating mystical orbs beside pillars
    for (const side of [-1, 1]) {
      const orbX = screenPos.x + side * (baseWidth * 0.55) * zoom;
      const orbY = screenPos.y - 45 * zoom + Math.sin(time * 2 + side) * 4 * zoom;
      
      // Orb outer glow
      const orbGlow = 0.4 + Math.sin(time * 3 + side * 2) * 0.2 + attackPulse * 0.3;
      ctx.fillStyle = `rgba(${glowColor}, ${orbGlow * 0.3})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      
      // Orb core
      ctx.fillStyle = `rgba(${glowColor}, ${orbGlow})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Orb energy ring
      ctx.strokeStyle = `rgba(${glowColor}, ${orbGlow * 0.6})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(orbX, orbY, 6 * zoom, 3 * zoom, time * 2 + side, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Ancient tome/altar between pillars
    const altarY = screenPos.y - 18 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(screenPos.x - 6 * zoom, altarY - 4 * zoom, 12 * zoom, 8 * zoom);
    
    // Tome on altar
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(screenPos.x - 4 * zoom, altarY - 7 * zoom, 8 * zoom, 5 * zoom);
    
    // Tome glow
    const tomeGlow = 0.5 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(${glowColor}, ${tomeGlow})`;
    ctx.fillRect(screenPos.x - 3 * zoom, altarY - 6 * zoom, 6 * zoom, 3 * zoom);
    
    // Flying arcane pages
    for (let page = 0; page < 3; page++) {
      const pagePhase = (time * 0.8 + page * 0.5) % 2;
      const pageX = screenPos.x + Math.sin(pagePhase * Math.PI * 2) * 15 * zoom;
      const pageY = altarY - 10 * zoom - pagePhase * 20 * zoom;
      const pageAlpha = Math.max(0, 1 - pagePhase / 2) * 0.6;
      
      if (pageAlpha > 0.1) {
        ctx.fillStyle = `rgba(255, 250, 240, ${pageAlpha})`;
        ctx.save();
        ctx.translate(pageX, pageY);
        ctx.rotate(Math.sin(time * 4 + page) * 0.3);
        ctx.fillRect(-3 * zoom, -4 * zoom, 6 * zoom, 8 * zoom);
        ctx.restore();
      }
    }
  }
  
  // === LEVEL 3 UNIQUE FEATURES ===
  if (tower.level >= 3) {
    // Ethereal spirit wisps circling the tower
    for (let wisp = 0; wisp < 4; wisp++) {
      const wispAngle = time * 1.5 + (wisp / 4) * Math.PI * 2;
      const wispRadius = 40 + Math.sin(time * 2 + wisp) * 8;
      const wispX = screenPos.x + Math.cos(wispAngle) * wispRadius * zoom;
      const wispY = screenPos.y - 50 * zoom + Math.sin(wispAngle) * wispRadius * 0.3 * zoom;
      
      // Wisp trail
      ctx.strokeStyle = `rgba(${glowColor}, 0.2)`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      for (let t = 0; t < 8; t++) {
        const trailAngle = wispAngle - t * 0.15;
        const trailX = screenPos.x + Math.cos(trailAngle) * wispRadius * zoom;
        const trailY = screenPos.y - 50 * zoom + Math.sin(trailAngle) * wispRadius * 0.3 * zoom;
        if (t === 0) ctx.moveTo(trailX, trailY);
        else ctx.lineTo(trailX, trailY);
      }
      ctx.stroke();
      
      // Wisp core
      const wispGlow = 0.6 + Math.sin(time * 5 + wisp * 2) * 0.3;
      ctx.fillStyle = `rgba(${glowColor}, ${wispGlow})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(wispX, wispY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Dimensional rift cracks around base
    ctx.strokeStyle = `rgba(${glowColor}, ${0.4 + attackPulse * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    for (let crack = 0; crack < 6; crack++) {
      const crackAngle = (crack / 6) * Math.PI * 2 + time * 0.1;
      const crackLen = (12 + Math.sin(time * 2 + crack) * 4) * zoom;
      const crackX = screenPos.x + Math.cos(crackAngle) * 35 * zoom;
      const crackY = screenPos.y + 10 * zoom + Math.sin(crackAngle) * 15 * zoom;
      
      ctx.beginPath();
      ctx.moveTo(crackX, crackY);
      ctx.lineTo(crackX + Math.cos(crackAngle) * crackLen, crackY + Math.sin(crackAngle) * crackLen * 0.4);
      ctx.stroke();
    }
    
    // Ancient artifact hovering above altar
    const artifactY = screenPos.y - 35 * zoom + Math.sin(time * 2.5) * 3 * zoom;
    
    // Artifact glow aura
    const artifactGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 15 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, artifactY, 10 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Artifact shape (mystical gem)
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow + 0.2})`;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, artifactY - 8 * zoom);
    ctx.lineTo(screenPos.x - 5 * zoom, artifactY);
    ctx.lineTo(screenPos.x, artifactY + 5 * zoom);
    ctx.lineTo(screenPos.x + 5 * zoom, artifactY);
    ctx.closePath();
    ctx.fill();
    
    // Artifact inner glow
    ctx.fillStyle = `rgba(255, 255, 255, ${artifactGlow * 0.8})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, artifactY - 1 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    
    // Rotating rune orbit around artifact
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow})`;
    ctx.font = `${6 * zoom}px serif`;
    ctx.textAlign = "center";
    for (let r = 0; r < 4; r++) {
      const orbitAngle = time * 2 + (r / 4) * Math.PI * 2;
      const orbitX = screenPos.x + Math.cos(orbitAngle) * 8 * zoom;
      const orbitY = artifactY + Math.sin(orbitAngle) * 4 * zoom;
      ctx.fillText(["ᛗ", "ᛚ", "ᛝ", "ᛟ"][r], orbitX, orbitY);
    }
  }

  // === ARCH STRUCTURE ===
  const archTopY = screenPos.y - 24 * zoom - pillarHeight * zoom - 6 * zoom + archVibrate * 0.5 - archLift - pillarBounce;
  const archCenterY = archTopY + 8 * zoom;

  // Outer arch structure
  ctx.strokeStyle = "#a89880";
  ctx.lineWidth = (14 + attackPulse * 4) * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5, archTopY + 8 * zoom);
  ctx.quadraticCurveTo(screenPos.x + archVibrate, archTopY - 28 * zoom - archLift, pillarXR - pillarBounce * 0.5, archTopY + 8 * zoom);
  ctx.stroke();

  // Inner arch
  ctx.strokeStyle = "#c8b8a0";
  ctx.lineWidth = (10 + attackPulse * 2) * zoom;
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5, archTopY + 6 * zoom);
  ctx.quadraticCurveTo(screenPos.x + archVibrate, archTopY - 18 * zoom - archLift, pillarXR - pillarBounce * 0.5, archTopY + 6 * zoom);
  ctx.stroke();
  
  // Arch rune carvings
  const archRuneGlow = 0.5 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${archRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `${7 * zoom}px serif`;
  const archRunes = ["ᚡ", "ᚢ", "ᚣ", "ᚤ", "ᚥ"];
  for (let i = 0; i < 5; i++) {
    const runeT = (i + 0.5) / 5;
    const runeAngle = Math.PI * (1 - runeT);
    const runeX = screenPos.x + archVibrate + Math.cos(runeAngle) * 28 * zoom;
    const runeY = archTopY - 8 * zoom - archLift + Math.sin(runeAngle) * 14 * zoom;
    ctx.fillText(archRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Energy conduit along arch
  const conduitGlow = 0.5 + Math.sin(time * 5) * 0.3 + attackPulse * 1.5;
  ctx.strokeStyle = `rgba(${glowColor}, ${conduitGlow})`;
  ctx.lineWidth = (2 + attackPulse * 3) * zoom;
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5, archTopY + 4 * zoom);
  ctx.quadraticCurveTo(screenPos.x + archVibrate, archTopY - 16 * zoom - archLift, pillarXR - pillarBounce * 0.5, archTopY + 4 * zoom);
  ctx.stroke();

  // Keystone with mystical core
  const keystoneY = archTopY - archLift;
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(screenPos.x + archVibrate - 10 * zoom, keystoneY - 10 * zoom);
  ctx.lineTo(screenPos.x + archVibrate, keystoneY - 26 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 10 * zoom, keystoneY - 10 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 7 * zoom, keystoneY - 2 * zoom);
  ctx.lineTo(screenPos.x + archVibrate - 7 * zoom, keystoneY - 2 * zoom);
  ctx.closePath();
  ctx.fill();
  
  // Keystone decorative lines
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x + archVibrate - 6 * zoom, keystoneY - 8 * zoom);
  ctx.lineTo(screenPos.x + archVibrate, keystoneY - 20 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 6 * zoom, keystoneY - 8 * zoom);
  ctx.stroke();

  // Keystone energy core
  const coreGrad = ctx.createRadialGradient(
    screenPos.x + archVibrate, keystoneY - 14 * zoom, 0,
    screenPos.x + archVibrate, keystoneY - 14 * zoom, (7 + attackPulse * 4) * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${conduitGlow})`);
  coreGrad.addColorStop(0.3, `rgba(${glowColor}, ${conduitGlow})`);
  coreGrad.addColorStop(0.6, `rgba(${glowColor}, ${conduitGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x + archVibrate, keystoneY - 14 * zoom, (7 + attackPulse * 4) * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // Keystone rune
  ctx.fillStyle = `rgba(${glowColor}, ${conduitGlow + 0.2})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 8 * zoom;
  ctx.font = `bold ${10 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᛉ", screenPos.x + archVibrate, keystoneY - 12 * zoom);
  ctx.shadowBlur = 0;

  // === PORTAL EFFECT ===
  const glowIntensity = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
  const portalSizeX = 22 * zoom + portalExpand;
  const portalSizeY = 30 * zoom + portalExpand * 1.2;

  const portalGrad = ctx.createRadialGradient(screenPos.x, archCenterY, 0, screenPos.x, archCenterY, portalSizeY);
  portalGrad.addColorStop(0, `rgba(${glowColor}, ${glowIntensity * 0.5})`);
  portalGrad.addColorStop(0.5, `rgba(${glowColor}, ${glowIntensity * 0.25})`);
  portalGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, archCenterY, portalSizeX, portalSizeY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling vortex
  const vortexSpeed = time * 3;
  for (let spiral = 0; spiral < 4; spiral++) {
    const spiralOffset = (spiral / 4) * Math.PI * 2;
    ctx.strokeStyle = `rgba(${glowColor}, ${0.3 + Math.sin(time * 4 + spiral) * 0.15 + attackPulse * 0.3})`;
    ctx.lineWidth = (2.5 - spiral * 0.4) * zoom;
    ctx.beginPath();

    for (let i = 0; i <= 25; i++) {
      const t = i / 25;
      const angle = vortexSpeed + spiralOffset + t * Math.PI * 4;
      const radius = t * portalSizeX * 0.85;
      const x = screenPos.x + Math.cos(angle) * radius;
      const y = archCenterY + Math.sin(angle) * radius * (portalSizeY / portalSizeX);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Inner swirl particles
  for (let p = 0; p < 10; p++) {
    const particleAngle = vortexSpeed * 1.5 + (p / 10) * Math.PI * 2;
    const particleRadius = portalSizeX * (0.25 + Math.sin(time * 5 + p) * 0.2);
    const px = screenPos.x + Math.cos(particleAngle) * particleRadius;
    const py = archCenterY + Math.sin(particleAngle) * particleRadius * (portalSizeY / portalSizeX);

    ctx.fillStyle = `rgba(${glowColor}, ${0.5 + Math.sin(time * 6 + p) * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, (2.5 + Math.sin(time * 8 + p) * 1) * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Central energy core in portal
  const coreSize = (6 + Math.sin(time * 4) * 2 + attackPulse * 4) * zoom;
  const coreGrad2 = ctx.createRadialGradient(screenPos.x, archCenterY, 0, screenPos.x, archCenterY, coreSize * 2);
  coreGrad2.addColorStop(0, `rgba(255, 255, 255, ${0.8 + attackPulse * 0.2})`);
  coreGrad2.addColorStop(0.3, `rgba(${glowColor}, ${0.6 + attackPulse * 0.3})`);
  coreGrad2.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = coreGrad2;
  ctx.beginPath();
  ctx.arc(screenPos.x, archCenterY, coreSize * 2, 0, Math.PI * 2);
  ctx.fill();

  // Mystical scanlines in portal
  ctx.strokeStyle = `rgba(${glowColor}, ${glowIntensity * 0.25})`;
  ctx.lineWidth = 1 * zoom;
  for (let sl = 0; sl < 10; sl++) {
    const sly = archCenterY - 24 * zoom + sl * 5 * zoom;
    const slw = 20 - Math.abs(sl - 5) * 3;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - slw * zoom, sly);
    ctx.lineTo(screenPos.x + slw * zoom, sly);
    ctx.stroke();
  }

  // Sound/energy waves
  const waveCount = tower.level + 3;
  for (let i = 0; i < waveCount; i++) {
    const wavePhase = (time * 2 + i * 0.25) % 1;
    const waveRadius = 10 + wavePhase * 55;
    const waveAlpha = 0.6 * (1 - wavePhase) * (glowIntensity + attackPulse * 0.5);

    ctx.strokeStyle = `rgba(${glowColor}, ${waveAlpha})`;
    ctx.lineWidth = (3.5 - wavePhase * 2.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, archCenterY - 5 * zoom, waveRadius * zoom * 0.8, waveRadius * zoom * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Attack burst effect
  if (timeSinceFire < 300) {
    const burstPhase = timeSinceFire / 300;
    const burstAlpha = (1 - burstPhase) * 0.8;
    const burstSize = 18 + burstPhase * 25;

    ctx.fillStyle = `rgba(${glowColor}, ${burstAlpha})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, archCenterY, burstSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Expanding ring
    ctx.strokeStyle = `rgba(${glowColor}, ${burstAlpha * 0.5})`;
    ctx.lineWidth = 4 * zoom * (1 - burstPhase);
    ctx.beginPath();
    ctx.ellipse(screenPos.x, archCenterY - 5 * zoom, (25 + burstPhase * 45) * zoom, (12 + burstPhase * 22) * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Floating music notes / arcane symbols
  const particleCount = 7 + tower.level;
  for (let i = 0; i < particleCount; i++) {
    const notePhase = (time * 1.2 + i * 0.35) % 3;
    const noteAngle = (i / particleCount) * Math.PI * 2 + time * 0.5;
    const noteRadius = 24 + Math.sin(notePhase * Math.PI) * 14;
    const noteX = screenPos.x + Math.cos(noteAngle) * noteRadius * zoom * 0.9;
    const noteY = archCenterY - 8 * zoom + Math.sin(noteAngle) * noteRadius * zoom * 0.45 - notePhase * 12 * zoom;
    const noteAlpha = Math.max(0, 1 - notePhase / 3) * 0.7;

    if (noteAlpha > 0.1) {
      ctx.fillStyle = `rgba(${glowColor}, ${noteAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.font = `${(10 + Math.sin(time * 4 + i) * 2) * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const symbols = ["♪", "♫", "♬", "♩", "𝄞", "✦", "✧"];
      ctx.fillText(symbols[i % 7], noteX, noteY);
      ctx.shadowBlur = 0;

      // Note trail
      ctx.strokeStyle = `rgba(${glowColor}, ${noteAlpha * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(noteX, noteY);
      ctx.lineTo(noteX + Math.cos(noteAngle + Math.PI) * 10 * zoom, noteY + Math.sin(noteAngle + Math.PI) * 5 * zoom);
      ctx.stroke();
    }
  }

  // === SHOCKWAVE EMITTER (Level 4 Upgrade A) - EPIC DARK FANTASY ===
  if (isShockwave) {
    // Massive seismic generators on pillars
    for (let side = -1; side <= 1; side += 2) {
      const genX = screenPos.x + side * (baseWidth * 0.5) * zoom;
      const genY = screenPos.y - 25 * zoom;

      // Seismic core housing
      ctx.fillStyle = "#3a1515";
      ctx.beginPath();
      ctx.ellipse(genX, genY, 12 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing seismic core
      const seismicPulse = 0.5 + Math.sin(time * 8) * 0.3 + attackPulse * 0.5;
      ctx.fillStyle = `rgba(255, 80, 80, ${seismicPulse})`;
      ctx.shadowColor = "#ff3333";
      ctx.shadowBlur = (12 + attackPulse * 15) * zoom;
      ctx.beginPath();
      ctx.arc(genX, genY, (6 + attackPulse * 3) * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Seismic runes
      ctx.fillStyle = `rgba(255, 100, 100, ${seismicPulse})`;
      ctx.font = `${10 * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("ᛟ", genX, genY + 2 * zoom);
    }

    // Ground cracks emanating from base
    ctx.strokeStyle = `rgba(255, 80, 50, ${0.4 + attackPulse * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 6; i++) {
      const crackAngle = (i / 6) * Math.PI * 2 + time * 0.2;
      const crackLen = (20 + Math.sin(time * 3 + i) * 8) * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y + 12 * zoom);
      const midX =
        screenPos.x +
        Math.cos(crackAngle) * crackLen * 0.5 +
        (Math.random() - 0.5) * 5 * zoom;
      const midY =
        screenPos.y + 12 * zoom + Math.sin(crackAngle) * crackLen * 0.25;
      ctx.lineTo(midX, midY);
      ctx.lineTo(
        screenPos.x + Math.cos(crackAngle) * crackLen,
        screenPos.y + 12 * zoom + Math.sin(crackAngle) * crackLen * 0.5
      );
      ctx.stroke();
    }

    // Floating debris during attack
    if (attackPulse > 0.1) {
      for (let i = 0; i < 8; i++) {
        const debrisAngle = (i / 8) * Math.PI * 2 + time * 2;
        const debrisHeight = attackPulse * 25 * zoom * Math.sin(time * 5 + i);
        const debrisX = screenPos.x + Math.cos(debrisAngle) * 30 * zoom;
        const debrisY = screenPos.y + 5 * zoom - debrisHeight;

        ctx.fillStyle = `rgba(139, 90, 60, ${attackPulse * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(debrisX, debrisY);
        ctx.lineTo(debrisX - 3 * zoom, debrisY + 4 * zoom);
        ctx.lineTo(debrisX + 3 * zoom, debrisY + 4 * zoom);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Massive shockwave rings during attack
    if (timeSinceFire < 500) {
      const shockPhase = timeSinceFire / 500;
      for (let ring = 0; ring < 3; ring++) {
        const ringDelay = ring * 0.1;
        const ringPhase = Math.max(0, shockPhase - ringDelay);
        if (ringPhase > 0 && ringPhase < 1) {
          const ringRadius = 30 + ringPhase * 60;
          const ringAlpha = (1 - ringPhase) * 0.7;

          ctx.strokeStyle = `rgba(255, 100, 80, ${ringAlpha})`;
          ctx.lineWidth = (4 - ring) * zoom * (1 - ringPhase);
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 8 * zoom,
            ringRadius * zoom,
            ringRadius * 0.4 * zoom,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }
    }

    // Red energy vortex in portal
    for (let v = 0; v < 12; v++) {
      const vortexAngle = time * 3 + (v / 12) * Math.PI * 2;
      const vortexRadius = 15 + Math.sin(time * 4 + v) * 5;
      const vortexX = screenPos.x + Math.cos(vortexAngle) * vortexRadius * zoom;
      const vortexY =
        archCenterY + Math.sin(vortexAngle) * vortexRadius * 0.4 * zoom;

      ctx.fillStyle = `rgba(255, 80, 80, ${
        0.3 + Math.sin(time * 6 + v) * 0.15
      })`;
      ctx.beginPath();
      ctx.arc(vortexX, vortexY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SYMPHONY HALL (Level 4 Upgrade B) - EPIC DARK FANTASY ===
  if (isSymphony) {
    // Crystalline sound amplifiers on pillars
    for (let side = -1; side <= 1; side += 2) {
      const ampX = screenPos.x + side * (baseWidth * 0.45) * zoom;
      const ampY = screenPos.y - 30 * zoom;

      // Crystal housing
      ctx.fillStyle = "#1a2a4a";
      ctx.beginPath();
      ctx.moveTo(ampX, ampY - 15 * zoom);
      ctx.lineTo(ampX - 8 * zoom, ampY);
      ctx.lineTo(ampX - 5 * zoom, ampY + 10 * zoom);
      ctx.lineTo(ampX + 5 * zoom, ampY + 10 * zoom);
      ctx.lineTo(ampX + 8 * zoom, ampY);
      ctx.closePath();
      ctx.fill();

      // Glowing sound crystal
      const crystalGlow =
        0.5 + Math.sin(time * 5 + side) * 0.3 + attackPulse * 0.5;
      ctx.fillStyle = `rgba(100, 200, 255, ${crystalGlow})`;
      ctx.shadowColor = "#66ccff";
      ctx.shadowBlur = (10 + attackPulse * 12) * zoom;
      ctx.beginPath();
      ctx.moveTo(ampX, ampY - 12 * zoom);
      ctx.lineTo(ampX - 5 * zoom, ampY);
      ctx.lineTo(ampX, ampY + 6 * zoom);
      ctx.lineTo(ampX + 5 * zoom, ampY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Floating orchestral instruments (ethereal)
    const instruments = ["🎻", "🎺", "🎷", "🎹"];
    for (let i = 0; i < 4; i++) {
      const instPhase = (time * 0.8 + i * 0.7) % 4;
      const instAngle = (i / 4) * Math.PI * 2 + time * 0.4;
      const instRadius = 35 + Math.sin(instPhase * Math.PI * 0.5) * 10;
      const instX = screenPos.x + Math.cos(instAngle) * instRadius * zoom;
      const instY =
        archCenterY -
        15 * zoom +
        Math.sin(instAngle) * instRadius * 0.3 * zoom -
        instPhase * 5 * zoom;
      const instAlpha = Math.max(0, 1 - instPhase / 4) * 0.6;

      if (instAlpha > 0.1) {
        ctx.globalAlpha = instAlpha;
        ctx.font = `${14 * zoom}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(instruments[i], instX, instY);
        ctx.globalAlpha = 1;
      }
    }

    // Harmonic wave patterns
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 + attackPulse * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const waveX = screenPos.x - 30 * zoom + t * 60 * zoom;
        const waveY =
          archCenterY -
          5 * zoom +
          Math.sin(t * Math.PI * 4 + time * 5 + wave) * 8 * zoom;
        if (i === 0) ctx.moveTo(waveX, waveY);
        else ctx.lineTo(waveX, waveY);
      }
      ctx.stroke();
    }

    // Resonance aura
    const auraGlow = 0.2 + Math.sin(time * 3) * 0.1 + attackPulse * 0.3;
    const auraGrad = ctx.createRadialGradient(
      screenPos.x,
      archCenterY,
      0,
      screenPos.x,
      archCenterY,
      50 * zoom
    );
    auraGrad.addColorStop(0, `rgba(100, 200, 255, ${auraGlow * 0.5})`);
    auraGrad.addColorStop(0.5, `rgba(100, 200, 255, ${auraGlow * 0.2})`);
    auraGrad.addColorStop(1, `rgba(100, 200, 255, 0)`);
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      archCenterY,
      50 * zoom,
      35 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Sound beam during attack
    if (timeSinceFire < 400) {
      const beamPhase = timeSinceFire / 400;
      const beamAlpha = (1 - beamPhase) * 0.6;

      // Central beam
      ctx.fillStyle = `rgba(150, 220, 255, ${beamAlpha})`;
      ctx.shadowColor = "#99ddff";
      ctx.shadowBlur = 20 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        archCenterY,
        (5 + beamPhase * 15) * zoom,
        (10 + beamPhase * 30) * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Concentric sound rings
      for (let ring = 0; ring < 5; ring++) {
        const ringPhase = (beamPhase + ring * 0.08) % 1;
        const ringRadius = 10 + ringPhase * 40;
        const ringAlpha = (1 - ringPhase) * beamAlpha * 0.5;

        ctx.strokeStyle = `rgba(100, 200, 255, ${ringAlpha})`;
        ctx.lineWidth = 2 * zoom * (1 - ringPhase);
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          archCenterY,
          ringRadius * zoom,
          ringRadius * 0.5 * zoom,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }

    // Blue energy swirls
    for (let s = 0; s < 8; s++) {
      const swirlAngle = time * 2 + (s / 8) * Math.PI * 2;
      const swirlRadius = 18 + Math.sin(time * 3 + s * 0.8) * 6;
      const swirlX = screenPos.x + Math.cos(swirlAngle) * swirlRadius * zoom;
      const swirlY =
        archCenterY + Math.sin(swirlAngle) * swirlRadius * 0.4 * zoom;

      ctx.fillStyle = `rgba(100, 200, 255, ${
        0.4 + Math.sin(time * 5 + s) * 0.2
      })`;
      ctx.beginPath();
      ctx.arc(swirlX, swirlY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// CLUB TOWER - Epic Resource Generator with mechanical gold production
function renderClubTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string }
) {
  ctx.save();
  const baseWidth = 34 + tower.level * 5;
  const baseHeight = 25 + tower.level * 8;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * 0.25;
  const h = baseHeight * zoom;
  
  // Check if pawpoints were recently generated (flash effect)
  const recentGeneration = tower.lastAttack && (Date.now() - tower.lastAttack) < 500;
  const flashIntensity = recentGeneration ? Math.max(0, 1 - (Date.now() - tower.lastAttack!) / 500) : 0;

  // ========== ENHANCED FOUNDATION WITH TECH SCAFFOLDING ==========
  // Bottom tech platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 12 * zoom,
    baseWidth + 16,
    baseWidth + 16,
    4,
    {
      top: "#1a2a1a",
      left: "#0a1a0a",
      right: "#051505",
      leftBack: "#2a3a2a",
      rightBack: "#1a2a1a",
    },
    zoom
  );
  
  // Foundation support struts
  ctx.strokeStyle = "#3a4a3a";
  ctx.lineWidth = 2 * zoom;
  for (let side of [-1, 1]) {
    // Diagonal support beams
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * (baseWidth + 16) * zoom * 0.45, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x + side * (baseWidth + 6) * zoom * 0.35, screenPos.y + 2 * zoom);
    ctx.stroke();
    // Vertical struts
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * (baseWidth + 12) * zoom * 0.4, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x + side * (baseWidth + 12) * zoom * 0.4, screenPos.y + 2 * zoom);
    ctx.stroke();
  }
  
  // Foundation data conduits
  ctx.strokeStyle = "#2a5a3a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - (baseWidth + 14) * zoom * 0.4, screenPos.y + 10 * zoom);
  ctx.lineTo(screenPos.x + (baseWidth + 14) * zoom * 0.4, screenPos.y + 10 * zoom);
  ctx.stroke();
  
  // Foundation circuit lights
  for (let i = 0; i < 5; i++) {
    const lightX = screenPos.x - (baseWidth + 10) * zoom * 0.3 + i * (baseWidth + 10) * zoom * 0.15;
    const lightGlow = 0.4 + Math.sin(time * 6 + i * 0.8) * 0.3 + flashIntensity * 0.5;
    ctx.fillStyle = `rgba(0, 255, 100, ${lightGlow})`;
    ctx.beginPath();
    ctx.arc(lightX, screenPos.y + 10 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main foundation with gold accents
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    6,
    {
      top: "#2a4a3a",
      left: "#1a3a2a",
      right: "#0a2a1a",
      leftBack: "#3a5a4a",
      rightBack: "#2a4a3a",
    },
    zoom
  );

  // Foundation gold trim edge with flash effect
  const foundGlow = 0.4 + Math.sin(time * 2) * 0.2 + flashIntensity * 0.4;
  ctx.strokeStyle = `rgba(201, 162, 39, ${foundGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - (baseWidth + 10) * zoom * 0.5, screenPos.y + 2 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y + (baseWidth + 10) * zoom * 0.25 + 2 * zoom);
  ctx.lineTo(screenPos.x + (baseWidth + 10) * zoom * 0.5, screenPos.y + 2 * zoom);
  ctx.stroke();
  
  // Corner tech nodes on foundation
  ctx.fillStyle = "#4a5a4a";
  for (let side of [-1, 1]) {
    const nodeX = screenPos.x + side * (baseWidth + 10) * zoom * 0.45;
    ctx.beginPath();
    ctx.arc(nodeX, screenPos.y + 4 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Node glow
    const nodeGlow = 0.5 + Math.sin(time * 4 + side) * 0.3 + flashIntensity * 0.4;
    ctx.fillStyle = `rgba(0, 255, 100, ${nodeGlow})`;
    ctx.beginPath();
    ctx.arc(nodeX, screenPos.y + 4 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a5a4a";
  }

  // Main tower body - dark green tech with gold trim
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    baseHeight,
    {
      top: "#3a6a4a",
      left: "#2a5a3a",
      right: "#1a4a2a",
      leftBack: "#4a7a5a",
      rightBack: "#3a6a4a",
    },
    zoom
  );

  // ========== EXTERNAL SCAFFOLDING AND TECH INFRASTRUCTURE ==========
  // Left side scaffolding
  ctx.strokeStyle = "#5a6a5a";
  ctx.lineWidth = 1.5 * zoom;
  // Vertical scaffold poles
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 1.1, screenPos.y + 4 * zoom);
  ctx.lineTo(screenPos.x - w * 1.1, screenPos.y - h * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 0.95, screenPos.y + 2 * zoom);
  ctx.lineTo(screenPos.x - w * 0.95, screenPos.y - h * 0.75);
  ctx.stroke();
  // Horizontal scaffold bars
  for (let i = 0; i < 4; i++) {
    const barY = screenPos.y - h * 0.1 - i * h * 0.18;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.12, barY);
    ctx.lineTo(screenPos.x - w * 0.93, barY);
    ctx.stroke();
  }
  // Diagonal braces
  ctx.strokeStyle = "#4a5a4a";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    const braceY = screenPos.y - h * 0.05 - i * h * 0.22;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.1, braceY);
    ctx.lineTo(screenPos.x - w * 0.95, braceY - h * 0.15);
    ctx.stroke();
  }
  
  // Right side scaffolding (level 2+)
  if (tower.level >= 2) {
    ctx.strokeStyle = "#5a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.05, screenPos.y + 2 * zoom);
    ctx.lineTo(screenPos.x + w * 1.05, screenPos.y - h * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.9, screenPos.y);
    ctx.lineTo(screenPos.x + w * 0.9, screenPos.y - h * 0.65);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const barY = screenPos.y - h * 0.15 - i * h * 0.2;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + w * 0.88, barY);
      ctx.lineTo(screenPos.x + w * 1.07, barY);
      ctx.stroke();
    }
  }

  // Structural panel lines for better 3D effect
  ctx.strokeStyle = "#1a4a2a";
  ctx.lineWidth = 1 * zoom;
  // Left face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x - w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y);
    ctx.lineTo(panelX - d * 0.5, screenPos.y - baseHeight * zoom + d * 0.5);
    ctx.stroke();
  }
  // Right face vertical panels
  for (let panel = 0; panel < 3; panel++) {
    const panelX = screenPos.x + w * (0.2 + panel * 0.3);
    ctx.beginPath();
    ctx.moveTo(panelX, screenPos.y);
    ctx.lineTo(panelX + d * 0.5, screenPos.y - baseHeight * zoom + d * 0.5);
    ctx.stroke();
  }

  // Gold corner accents
  ctx.fillStyle = "#c9a227";
  for (let side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 0.95, screenPos.y);
    ctx.lineTo(screenPos.x + side * w * 1.0, screenPos.y - 2 * zoom);
    ctx.lineTo(screenPos.x + side * w * 1.0, screenPos.y - baseHeight * zoom * 0.9);
    ctx.lineTo(screenPos.x + side * w * 0.95, screenPos.y - baseHeight * zoom * 0.9 + 2 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Horizontal gold bands (multiple levels)
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  for (let band = 0; band < tower.level; band++) {
    const bandY = screenPos.y - baseHeight * zoom * (0.25 + band * 0.25);
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.9, bandY + d * 0.35);
    ctx.lineTo(screenPos.x, bandY + d * 0.5);
    ctx.lineTo(screenPos.x + w * 0.9, bandY + d * 0.35);
    ctx.stroke();
  }

  const topY = screenPos.y - baseHeight * zoom;

  // ========== ROTATING GOLD GEARS ==========
  const gearRotation = time * 1.2;

  // Large main gear (gold production mechanism)
  drawGear(
    ctx,
    screenPos.x - w * 0.5,
    screenPos.y - h * 0.5,
    14 + tower.level * 2,
    9 + tower.level,
    10 + tower.level * 2,
    gearRotation,
    {
      outer: "#8b7355",
      inner: "#6b5335",
      teeth: "#a08060",
      highlight: "#c9a227",
    },
    zoom
  );

  // Smaller meshing gear
  drawGear(
    ctx,
    screenPos.x - w * 0.2,
    screenPos.y - h * 0.65,
    10 + tower.level,
    6,
    8 + tower.level,
    -gearRotation * 1.4,
    {
      outer: "#7a6245",
      inner: "#5a4225",
      teeth: "#9a8260",
      highlight: "#c9a227",
    },
    zoom
  );

  // Right side gear (all levels now)
  drawGear(
    ctx,
    screenPos.x + w * 0.45,
    screenPos.y - h * 0.45,
    12 + tower.level,
    8,
    9 + tower.level,
    gearRotation * 0.9,
    {
      outer: "#7a6245",
      inner: "#5a4225",
      teeth: "#9a8260",
      highlight: "#c9a227",
    },
    zoom
  );
  
  // Level 2+ additional gear train
  if (tower.level >= 2) {
    drawGear(
      ctx,
      screenPos.x + w * 0.65,
      screenPos.y - h * 0.25,
      8,
      5,
      6,
      -gearRotation * 1.6,
      {
        outer: "#6a5235",
        inner: "#4a3215",
        teeth: "#8a7250",
        highlight: "#b8960b",
      },
      zoom
    );
  }

  // ========== DIGITAL SCREENS THAT FLASH WHEN GENERATING ==========
  // Main digital display panel (left side)
  ctx.fillStyle = "#0a1510";
  ctx.fillRect(screenPos.x - w * 0.85, screenPos.y - h * 0.45, 14 * zoom, 18 * zoom);
  ctx.strokeStyle = "#2a4a3a";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(screenPos.x - w * 0.85, screenPos.y - h * 0.45, 14 * zoom, 18 * zoom);
  
  // Screen content with flash effect
  const screenFlash = flashIntensity > 0 ? flashIntensity : 0;
  const screenBaseGlow = 0.5 + Math.sin(time * 3) * 0.2;
  
  // Pawpoint counter display
  ctx.fillStyle = `rgba(0, 255, 100, ${screenBaseGlow + screenFlash * 0.5})`;
  if (flashIntensity > 0) {
    ctx.shadowColor = "#00ff66";
    ctx.shadowBlur = 10 * zoom * flashIntensity;
  }
  ctx.font = `bold ${6 * zoom}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("PAW", screenPos.x - w * 0.85 + 7 * zoom, screenPos.y - h * 0.42);
  ctx.fillText("PTS", screenPos.x - w * 0.85 + 7 * zoom, screenPos.y - h * 0.38);
  ctx.shadowBlur = 0;
  
  // Animated data bars
  for (let i = 0; i < 4; i++) {
    const barY = screenPos.y - h * 0.35 + i * 3.5 * zoom;
    const barWidth = (5 + Math.sin(time * 6 + i * 1.5) * 3 + flashIntensity * 4) * zoom;
    const barGlow = screenBaseGlow + (flashIntensity > 0 && i === Math.floor(time * 10) % 4 ? 0.4 : 0);
    ctx.fillStyle = `rgba(255, 215, 0, ${barGlow})`;
    ctx.fillRect(screenPos.x - w * 0.83, barY, barWidth, 2 * zoom);
  }
  
  // Right side screen (level 2+)
  if (tower.level >= 2) {
    ctx.fillStyle = "#0a1510";
    ctx.fillRect(screenPos.x + w * 0.55, screenPos.y - h * 0.5, 12 * zoom, 16 * zoom);
    ctx.strokeStyle = "#2a4a3a";
    ctx.strokeRect(screenPos.x + w * 0.55, screenPos.y - h * 0.5, 12 * zoom, 16 * zoom);
    
    // Live graph display
    ctx.strokeStyle = `rgba(0, 255, 100, ${screenBaseGlow + screenFlash * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.57, screenPos.y - h * 0.4);
    for (let i = 0; i < 8; i++) {
      const graphX = screenPos.x + w * 0.57 + i * 1.2 * zoom;
      const graphY = screenPos.y - h * 0.42 - Math.sin(time * 4 + i * 0.8) * 3 * zoom;
      ctx.lineTo(graphX, graphY);
    }
    ctx.stroke();
    
    // Flash indicator when generating
    if (flashIntensity > 0) {
      ctx.fillStyle = `rgba(255, 215, 0, ${flashIntensity})`;
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x + w * 0.61, screenPos.y - h * 0.47, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  // Level 3 holographic projection screen
  if (tower.level >= 3) {
    // Holographic projector base
    ctx.fillStyle = "#3a4a3a";
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - h * 0.75, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Holographic display field
    const holoGlow = 0.3 + Math.sin(time * 2) * 0.15 + flashIntensity * 0.3;
    ctx.fillStyle = `rgba(0, 255, 150, ${holoGlow * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 10 * zoom, screenPos.y - h * 0.75);
    ctx.lineTo(screenPos.x - 15 * zoom, screenPos.y - h * 0.95);
    ctx.lineTo(screenPos.x + 15 * zoom, screenPos.y - h * 0.95);
    ctx.lineTo(screenPos.x + 10 * zoom, screenPos.y - h * 0.75);
    ctx.closePath();
    ctx.fill();
    
    // Holographic data streams
    ctx.strokeStyle = `rgba(0, 255, 150, ${holoGlow})`;
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 5; i++) {
      const streamX = screenPos.x - 8 * zoom + i * 4 * zoom;
      const streamPhase = (time * 3 + i * 0.5) % 1;
      ctx.beginPath();
      ctx.moveTo(streamX, screenPos.y - h * 0.76);
      ctx.lineTo(streamX + (i - 2) * 1.5 * zoom, screenPos.y - h * 0.76 - streamPhase * 15 * zoom);
      ctx.stroke();
    }
  }

  // ========== GOLD COIN CONVEYOR ==========
  if (tower.level >= 2) {
    // Conveyor frame
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.75, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x + w * 0.15, screenPos.y - h * 0.28);
    ctx.stroke();
    
    // Conveyor track
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.7, screenPos.y + 4 * zoom);
    ctx.lineTo(screenPos.x + w * 0.1, screenPos.y - h * 0.3);
    ctx.stroke();
    
    // Conveyor rollers
    ctx.fillStyle = "#5a5a62";
    for (let r = 0; r < 4; r++) {
      const rollerPhase = r / 4;
      const rollerX = screenPos.x - w * 0.7 + w * 0.8 * rollerPhase;
      const rollerY = screenPos.y + 4 * zoom - (h * 0.3 + 4) * rollerPhase;
      ctx.beginPath();
      ctx.ellipse(rollerX, rollerY, 3 * zoom, 1.5 * zoom, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Animated gold coins on conveyor
    for (let c = 0; c < 4; c++) {
      const coinPhase = (time * 0.6 + c * 0.25) % 1;
      const coinX = screenPos.x - w * 0.7 + w * 0.8 * coinPhase;
      const coinY = screenPos.y + 4 * zoom - (h * 0.3 + 4) * coinPhase;

      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = (4 + flashIntensity * 4) * zoom;
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ========== GOLD STORAGE VAULT ==========
  // Vault frame
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y - h * 0.25, 10 * zoom, 12 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Vault door
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, screenPos.y - h * 0.25, 8 * zoom, 10 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Vault spokes (rotating faster when generating)
  const spokeSpeed = flashIntensity > 0 ? 2 : 0.5;
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 2 * zoom;
  for (let spoke = 0; spoke < 6; spoke++) {
    const spokeAngle = (spoke / 6) * Math.PI * 2 + time * spokeSpeed;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - h * 0.25);
    ctx.lineTo(
      screenPos.x + Math.cos(spokeAngle) * 6 * zoom,
      screenPos.y - h * 0.25 + Math.sin(spokeAngle) * 8 * zoom
    );
    ctx.stroke();
  }

  // Vault center with enhanced flash effect
  const vaultGlow = 0.6 + Math.sin(time * 3) * 0.3 + flashIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 215, 0, ${vaultGlow})`;
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = (8 + flashIntensity * 12) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - h * 0.25, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tech circuit lines with flash
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + flashIntensity * 0.3;
  ctx.strokeStyle = `rgba(0, 255, 100, ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY = screenPos.y - (h * i) / (tower.level + 2);
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.85, lineY - d * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.85, lineY - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3);
    ctx.stroke();
  }

  // ========== MONEY TUBES (flowing gold particles) ==========
  drawEnergyTube(
    ctx,
    screenPos.x - w * 0.6,
    screenPos.y + 6 * zoom,
    screenPos.x - w * 0.4,
    screenPos.y - h * 0.7,
    2.5 + flashIntensity,
    time,
    zoom,
    "rgb(255, 215, 0)"
  );

  drawEnergyTube(
    ctx,
    screenPos.x + w * 0.5,
    screenPos.y + 2 * zoom,
    screenPos.x + w * 0.35,
    screenPos.y - h * 0.65,
    2.5 + flashIntensity,
    time + 0.4,
    zoom,
    "rgb(255, 200, 50)"
  );
  
  // Level 2+ additional tubes
  if (tower.level >= 2) {
    drawEnergyTube(
      ctx,
      screenPos.x - w * 0.3,
      screenPos.y + 4 * zoom,
      screenPos.x - w * 0.1,
      screenPos.y - h * 0.6,
      2,
      time + 0.2,
      zoom,
      "rgb(200, 255, 100)"
    );
  }

  // Glowing resource vents with flash effect
  for (let i = 0; i < tower.level + 1; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 10 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3 + flashIntensity * 0.4;

    ctx.shadowColor = "#00ff66";
    ctx.shadowBlur = (6 + flashIntensity * 6) * zoom;
    ctx.fillStyle = `rgba(0, 255, 100, ${ventGlow})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x - w * 0.6, ventY + d * 0.2, 4 * zoom, 2 * zoom, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(screenPos.x + w * 0.6, ventY + d * 0.2, 4 * zoom, 2 * zoom, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== ENHANCED ROOF WITH GOLD DOME ==========
  // Antenna array on roof (level 2+)
  if (tower.level >= 2) {
    ctx.strokeStyle = "#5a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    for (let ant = -1; ant <= 1; ant++) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x + ant * 12 * zoom, topY - 12 * zoom);
      ctx.lineTo(screenPos.x + ant * 15 * zoom, topY - 25 * zoom);
      ctx.stroke();
      // Antenna tips
      const antGlow = 0.5 + Math.sin(time * 5 + ant * 2) * 0.3 + flashIntensity * 0.4;
      ctx.fillStyle = `rgba(255, 100, 100, ${antGlow})`;
      ctx.beginPath();
      ctx.arc(screenPos.x + ant * 15 * zoom, topY - 26 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Base roof structure
  ctx.fillStyle = "#1a3a2a";
  ctx.beginPath();
  ctx.moveTo(screenPos.x, topY - 18 * zoom);
  ctx.lineTo(screenPos.x - baseWidth * zoom * 0.45, topY + 2 * zoom);
  ctx.lineTo(screenPos.x, topY + baseWidth * zoom * 0.22);
  ctx.lineTo(screenPos.x + baseWidth * zoom * 0.45, topY + 2 * zoom);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#2a4a3a";
  ctx.beginPath();
  ctx.moveTo(screenPos.x, topY - 18 * zoom);
  ctx.lineTo(screenPos.x + baseWidth * zoom * 0.45, topY + 2 * zoom);
  ctx.lineTo(screenPos.x + baseWidth * zoom * 0.45, topY + 6 * zoom);
  ctx.lineTo(screenPos.x, topY + baseWidth * zoom * 0.22 + 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Roof tech patterns
  ctx.strokeStyle = "#0a2a1a";
  ctx.lineWidth = 1 * zoom;
  for (let tile = 0; tile < 6; tile++) {
    const tileY = topY - 14 * zoom + (tile / 6) * 16 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseWidth * 0.4 - tile * 2.5) * zoom, tileY);
    ctx.lineTo(screenPos.x, tileY + (tile * 2 * zoom) / 3);
    ctx.lineTo(screenPos.x + (baseWidth * 0.4 - tile * 2.5) * zoom, tileY);
    ctx.stroke();
  }

  // Gold dome with enhanced flash effect
  const domeGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    topY - 22 * zoom,
    0,
    screenPos.x,
    topY - 15 * zoom,
    14 * zoom
  );
  domeGrad.addColorStop(0, flashIntensity > 0 ? "#ffffee" : "#fffadc");
  domeGrad.addColorStop(0.2, flashIntensity > 0 ? "#fff066" : "#ffe44d");
  domeGrad.addColorStop(0.5, "#c9a227");
  domeGrad.addColorStop(0.8, "#b8860b");
  domeGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = domeGrad;
  if (flashIntensity > 0) {
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 15 * zoom * flashIntensity;
  }
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY - 15 * zoom, 12 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dome highlight arc
  ctx.strokeStyle = "#ffe88a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY - 15 * zoom, 10 * zoom, 5 * zoom, 0, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Dome finial (gold spike on top)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(screenPos.x, topY - 32 * zoom);
  ctx.lineTo(screenPos.x - 3 * zoom, topY - 20 * zoom);
  ctx.lineTo(screenPos.x + 3 * zoom, topY - 20 * zoom);
  ctx.closePath();
  ctx.fill();

  // Finial glow with flash
  const finialGlow = 0.6 + Math.sin(time * 4) * 0.3 + flashIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 215, 0, ${finialGlow})`;
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = (8 + flashIntensity * 10) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, topY - 32 * zoom, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ========== WARNING LIGHTS ==========
  drawWarningLight(ctx, screenPos.x - w * 0.8, screenPos.y - h * 0.1, 2.5, time, zoom, "#00ff66", 4);
  drawWarningLight(ctx, screenPos.x + w * 0.8, screenPos.y - h * 0.15, 2.5, time + 0.5, zoom, "#c9a227", 3);
  
  // Level 2+ extra warning lights on scaffolding
  if (tower.level >= 2) {
    drawWarningLight(ctx, screenPos.x - w * 1.05, screenPos.y - h * 0.5, 2, time + 0.25, zoom, "#ff6600", 5);
    drawWarningLight(ctx, screenPos.x + w * 1.0, screenPos.y - h * 0.4, 2, time + 0.75, zoom, "#00ffff", 4);
  }

  // ========== HOLOGRAPHIC CREDIT DISPLAY ==========
  const coinY = topY - 35 * zoom + Math.sin(time * 3) * 4 * zoom;

  // Multiple rotating rings with flash
  for (let ring = 0; ring < 2 + tower.level; ring++) {
    const ringAlpha = 0.3 - ring * 0.06 + flashIntensity * 0.2;
    const ringSize = 16 + ring * 3;
    ctx.strokeStyle = `rgba(255, 215, 0, ${ringAlpha + Math.sin(time * 4 + ring) * 0.1})`;
    ctx.lineWidth = (2 + flashIntensity) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      coinY,
      ringSize * zoom,
      ringSize * 0.5 * zoom,
      time * 0.5 + ring * 0.3,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Holographic credit symbol
  const coinRotation = time * 4;
  ctx.save();
  ctx.translate(screenPos.x, coinY);
  ctx.scale(Math.cos(coinRotation), 1);

  // Outer glow
  const creditGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14 * zoom);
  creditGrad.addColorStop(0, `rgba(255, 255, 200, ${0.9 + flashIntensity * 0.1})`);
  creditGrad.addColorStop(0.3, `rgba(255, 215, 0, ${0.7 + flashIntensity * 0.2})`);
  creditGrad.addColorStop(0.6, `rgba(218, 165, 32, 0.4)`);
  creditGrad.addColorStop(1, `rgba(184, 134, 11, 0)`);
  ctx.fillStyle = creditGrad;
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = (20 + flashIntensity * 15) * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, 14 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Credit symbol
  ctx.fillStyle = "#4a3a1a";
  ctx.font = `bold ${16 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 0, 0);
  ctx.restore();

  // ========== GOLD PARTICLE FOUNTAIN ==========
  const particleCount = tower.level + 3 + (flashIntensity > 0 ? 4 : 0);
  for (let i = 0; i < particleCount; i++) {
    const pPhase = (time * 2.5 + i * 0.2) % 1;
    const pY = coinY + 8 * zoom - pPhase * h * 0.5;
    const pX = screenPos.x + Math.sin(time * 4 + i * 2.2) * 10 * zoom;
    const pAlpha = Math.sin(pPhase * Math.PI) * (0.7 + flashIntensity * 0.3);
    const pSize = 2 + Math.sin(time * 6 + i) * 1 + flashIntensity;

    ctx.fillStyle = `rgba(255, 215, 0, ${pAlpha})`;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = (4 + flashIntensity * 4) * zoom;
    ctx.beginPath();
    ctx.arc(pX, pY, pSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== LEVEL 2 UNIQUE FEATURES ==========
  if (tower.level >= 2) {
    // Data banks on sides
    for (let side of [-1, 1]) {
      const bankX = screenPos.x + side * w * 0.75;
      const bankY = screenPos.y - h * 0.15;
      
      // Data bank housing
      ctx.fillStyle = "#2a3a2a";
      ctx.fillRect(bankX - 4 * zoom, bankY - 12 * zoom, 8 * zoom, 14 * zoom);
      ctx.strokeStyle = "#4a5a4a";
      ctx.lineWidth = 1 * zoom;
      ctx.strokeRect(bankX - 4 * zoom, bankY - 12 * zoom, 8 * zoom, 14 * zoom);
      
      // Blinking data lights
      for (let light = 0; light < 4; light++) {
        const lightY = bankY - 10 * zoom + light * 3 * zoom;
        const lightOn = Math.sin(time * 8 + light * 1.5 + side * 3) > 0;
        ctx.fillStyle = lightOn ? `rgba(0, 255, 100, 0.8)` : `rgba(0, 50, 20, 0.5)`;
        ctx.beginPath();
        ctx.arc(bankX, lightY, 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Quantum processing unit (level 2)
    ctx.fillStyle = "#1a2a2a";
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - h * 0.85, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    const quantumGlow = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = `rgba(100, 200, 255, ${quantumGlow})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - h * 0.85, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== LEVEL 3+ UPGRADE VISUALS ==========
  if (tower.level >= 3) {
    // Floating energy field around dome
    const fieldRotation = time * 0.8;
    ctx.strokeStyle = `rgba(0, 255, 200, ${0.3 + Math.sin(time * 2) * 0.15})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        topY - 20 * zoom,
        (18 + ring * 5) * zoom,
        (9 + ring * 2.5) * zoom,
        fieldRotation + ring * 0.5,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    if (tower.upgrade === "A") {
      // Investment Fund - holographic stock chart
      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * zoom, topY - 42 * zoom);
      ctx.lineTo(screenPos.x - 10 * zoom, topY - 58 * zoom);
      ctx.lineTo(screenPos.x + 2 * zoom, topY - 50 * zoom);
      ctx.lineTo(screenPos.x + 22 * zoom, topY - 70 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrow head
      ctx.fillStyle = "#00ff66";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 22 * zoom, topY - 70 * zoom);
      ctx.lineTo(screenPos.x + 15 * zoom, topY - 66 * zoom);
      ctx.lineTo(screenPos.x + 17 * zoom, topY - 60 * zoom);
      ctx.closePath();
      ctx.fill();

      // Glowing data points
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 8 * zoom;
      ctx.fillStyle = `rgba(0, 255, 100, 0.9)`;
      const points = [
        { x: -10, y: -58 },
        { x: 2, y: -50 },
        { x: 14, y: -62 }
      ];
      for (const pt of points) {
        ctx.beginPath();
        ctx.arc(screenPos.x + pt.x * zoom, topY + pt.y * zoom, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      
    } else if (tower.upgrade === "B") {
      // Recruitment Center - personnel holograms
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(screenPos.x - 24 * zoom, topY - 52 * zoom, 18 * zoom, 18 * zoom);
      ctx.strokeStyle = "#2a4a3a";
      ctx.strokeRect(screenPos.x - 24 * zoom, topY - 52 * zoom, 18 * zoom, 18 * zoom);

      // Multiple personnel icons
      for (let p = 0; p < 2; p++) {
        const personX = screenPos.x - 19 * zoom + p * 10 * zoom;
        const personGlow = 0.6 + Math.sin(time * 3 + p * 1.5) * 0.2;
        ctx.fillStyle = `rgba(0, 255, 100, ${personGlow})`;
        ctx.beginPath();
        ctx.arc(personX, topY - 44 * zoom, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(personX - 3 * zoom, topY - 40 * zoom, 6 * zoom, 5 * zoom);
      }

      // Status bars
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(screenPos.x + 6 * zoom, topY - 54 * zoom, 18 * zoom, 20 * zoom);
      ctx.strokeStyle = "#2a4a3a";
      ctx.strokeRect(screenPos.x + 6 * zoom, topY - 54 * zoom, 18 * zoom, 20 * zoom);
      
      const bars = [
        { label: "STAFF", value: 0.5 + Math.sin(time * 2) * 0.3 },
        { label: "MORALE", value: 0.7 + Math.sin(time * 2.5) * 0.2 },
        { label: "OUTPUT", value: 0.6 + Math.sin(time * 3) * 0.25 }
      ];
      for (let i = 0; i < bars.length; i++) {
        const barY = topY - 52 * zoom + i * 6 * zoom;
        ctx.fillStyle = "#00ff66";
        ctx.fillRect(screenPos.x + 8 * zoom, barY, 14 * zoom * bars[i].value, 4 * zoom);
      }
    }
  }

  ctx.restore();
}

// STATION TOWER - Sci-Fi Princeton Dinky Transport Hub
function renderStationTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string }
) {
  ctx.save();
  // Shift the entire building up slightly
  screenPos = { x: screenPos.x, y: screenPos.y - 10 * zoom };

  // Base dimensions - scaled by level
  const baseW = 56 + tower.level * 6;
  const baseD = 44 + tower.level * 5;

  // Isometric conversion factors
  const isoW = baseW * zoom * 0.5;
  const isoD = baseD * zoom * 0.25;

  // ========== FOUNDATION (proper isometric diamond aligned with grid) ==========
  // Helper function for isometric diamond
  const drawIsoDiamond = (
    cx: number,
    cy: number,
    w: number,
    d: number,
    h: number,
    topColor: string,
    leftColor: string,
    rightColor: string
  ) => {
    const hw = w * zoom * 0.5;
    const hd = d * zoom * 0.25;
    const hh = h * zoom;

    // Top face (diamond)
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh - hd); // Top
    ctx.lineTo(cx + hw, cy - hh); // Right
    ctx.lineTo(cx, cy - hh + hd); // Bottom
    ctx.lineTo(cx - hw, cy - hh); // Left
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left face
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy - hh); // Top-left
    ctx.lineTo(cx, cy - hh + hd); // Top-right
    ctx.lineTo(cx, cy + hd); // Bottom-right
    ctx.lineTo(cx - hw, cy); // Bottom-left
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right face
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx + hw, cy - hh); // Top-right
    ctx.lineTo(cx + hw, cy); // Bottom-right
    ctx.lineTo(cx, cy + hd); // Bottom
    ctx.lineTo(cx, cy - hh + hd); // Top
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // ========== LEVEL-SPECIFIC THEMED BASE ==========
  if (tower.level === 1) {
    // BARRACKS BASE - Wooden military camp platform with detailed texturing
    
    // Bottom dirt/stone foundation layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 14 * zoom,
      baseW + 18,
      baseD + 28,
      8,
      "#4a3a2a",
      "#3a2a1a",
      "#2a1a0a"
    );
    
    // Foundation edge highlight
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 18) * zoom * 0.5, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 28) * zoom * 0.25 + 6 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 18) * zoom * 0.5, screenPos.y + 6 * zoom);
    ctx.stroke();
    
    // Wooden plank platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 6 * zoom,
      baseW + 10,
      baseD + 18,
      6,
      "#6b5030",
      "#5a4020",
      "#4a3010"
    );
    
    // Wooden planks texture on left face (horizontal boards)
    ctx.strokeStyle = "#4a3010";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = 0; i < 4; i++) {
      const boardY = screenPos.y + 4 * zoom + i * 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - (baseW + 10) * zoom * 0.5 + 2 * zoom, boardY + (baseD + 18) * zoom * 0.125 - i * 0.5 * zoom);
      ctx.lineTo(screenPos.x - 2 * zoom, boardY + (baseD + 38) * zoom * 0.25 - i * 0.3 * zoom);
      ctx.stroke();
    }
    
    // Wooden planks texture on right face
    for (let i = 0; i < 4; i++) {
      const boardY = screenPos.y + 4 * zoom + i * 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 2 * zoom, boardY + (baseD + 38) * zoom * 0.25 - i * 0.3 * zoom);
      ctx.lineTo(screenPos.x + (baseW + 10) * zoom * 0.5 - 2 * zoom, boardY + (baseD + 18) * zoom * 0.125 - i * 0.5 * zoom);
      ctx.stroke();
    }
    
    // Metal corner brackets on wooden platform
    ctx.fillStyle = "#7a6a5a";
    const bracketPositions = [
      { x: screenPos.x - (baseW + 10) * zoom * 0.48, y: screenPos.y + 2 * zoom },
      { x: screenPos.x + (baseW + 10) * zoom * 0.48, y: screenPos.y + 2 * zoom },
      { x: screenPos.x, y: screenPos.y + (baseD + 18) * zoom * 0.23 + 2 * zoom }
    ];
    for (const bracket of bracketPositions) {
      ctx.beginPath();
      ctx.moveTo(bracket.x, bracket.y);
      ctx.lineTo(bracket.x - 3 * zoom, bracket.y + 4 * zoom);
      ctx.lineTo(bracket.x + 3 * zoom, bracket.y + 4 * zoom);
      ctx.closePath();
      ctx.fill();
    }
    
    // Nails/bolts on brackets
    ctx.fillStyle = "#4a3a2a";
    for (const bracket of bracketPositions) {
      ctx.beginPath();
      ctx.arc(bracket.x, bracket.y + 2 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Top wooden deck
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 2,
      baseD + 8,
      4,
      "#8b7355",
      "#7a6244",
      "#695133"
    );
    
    // Deck plank lines (proper isometric direction)
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x - (baseW + 2) * zoom * 0.4 + i * 4 * zoom, screenPos.y - 4 * zoom - i * 2 * zoom);
      ctx.lineTo(screenPos.x + i * 4 * zoom, screenPos.y + (baseD + 8) * zoom * 0.2 - 4 * zoom - i * 2 * zoom);
      ctx.stroke();
    }
    
    // Deck edge trim
    ctx.strokeStyle = "#6b5030";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 2) * zoom * 0.5, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 8) * zoom * 0.25 - 4 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 2) * zoom * 0.5, screenPos.y - 4 * zoom);
    ctx.stroke();
    
    // Corner posts
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(screenPos.x - (baseW + 2) * zoom * 0.48 - 2 * zoom, screenPos.y - 8 * zoom, 4 * zoom, 8 * zoom);
    ctx.fillRect(screenPos.x + (baseW + 2) * zoom * 0.48 - 2 * zoom, screenPos.y - 8 * zoom, 4 * zoom, 8 * zoom);
    
    // Corner post caps
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.arc(screenPos.x - (baseW + 2) * zoom * 0.48, screenPos.y - 8 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screenPos.x + (baseW + 2) * zoom * 0.48, screenPos.y - 8 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Small weapon rack (left side)
    const rackX = screenPos.x - isoW * 0.6 - 12 * zoom;
    const rackY = screenPos.y + 22 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(rackX - 2 * zoom, rackY - 12 * zoom, 4 * zoom, 12 * zoom);
    ctx.fillRect(rackX - 4 * zoom, rackY - 12 * zoom, 8 * zoom, 2 * zoom);
    // Spears on rack
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rackX - 2 * zoom, rackY - 10 * zoom);
    ctx.lineTo(rackX - 2 * zoom, rackY - 20 * zoom);
    ctx.moveTo(rackX + 2 * zoom, rackY - 10 * zoom);
    ctx.lineTo(rackX + 2 * zoom, rackY - 20 * zoom);
    ctx.stroke();
    ctx.fillStyle = "#aaaaaa";
    ctx.beginPath();
    ctx.moveTo(rackX - 2 * zoom, rackY - 22 * zoom);
    ctx.lineTo(rackX - 3.5 * zoom, rackY - 19 * zoom);
    ctx.lineTo(rackX - 0.5 * zoom, rackY - 19 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rackX + 2 * zoom, rackY - 22 * zoom);
    ctx.lineTo(rackX + 0.5 * zoom, rackY - 19 * zoom);
    ctx.lineTo(rackX + 3.5 * zoom, rackY - 19 * zoom);
    ctx.closePath();
    ctx.fill();

    // Supply crate (right side)
    const crateX = screenPos.x + isoW * 0.5;
    const crateY = screenPos.y + 2 * zoom;
    drawIsometricPrism(
      ctx,
      crateX,
      crateY,
      8,
      7,
      6,
      { top: "#7a6040", left: "#5a4020", right: "#4a3010" },
      zoom
    );
    ctx.strokeStyle = "#3a2010";
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(crateX - 3 * zoom, crateY - 8 * zoom, 6 * zoom, 4 * zoom);

    // Barrel
    ctx.fillStyle = "#6b5030";
    ctx.beginPath();
    ctx.ellipse(
      crateX + 8 * zoom,
      crateY - 2 * zoom,
      3 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(crateX + 5 * zoom, crateY - 8 * zoom, 6 * zoom, 6 * zoom);

    // === LEVEL 1 ENHANCEMENTS: Training Equipment & Lived-in Details ===
    
    // Training dummy (right side)
    const dummyX = screenPos.x + isoW * 0.7;
    const dummyY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(dummyX - 1.5 * zoom, dummyY - 18 * zoom, 3 * zoom, 18 * zoom);
    // Dummy body (straw)
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(dummyX, dummyY - 12 * zoom, 5 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dummy head
    ctx.beginPath();
    ctx.arc(dummyX, dummyY - 22 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Target painted on dummy
    ctx.strokeStyle = "#cc3333";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(dummyX, dummyY - 12 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(dummyX, dummyY - 12 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.stroke();

    // Hanging shields on wall
    const shieldWallX = screenPos.x - isoW * 0.3;
    const shieldWallY = screenPos.y - 8 * zoom;
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.moveTo(shieldWallX - 4 * zoom, shieldWallY - 6 * zoom);
    ctx.lineTo(shieldWallX - 6 * zoom, shieldWallY);
    ctx.lineTo(shieldWallX - 4 * zoom, shieldWallY + 4 * zoom);
    ctx.lineTo(shieldWallX - 2 * zoom, shieldWallY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a2a0a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Sandbags for defense training
    ctx.fillStyle = "#9b8b7b";
    for (let sb = 0; sb < 3; sb++) {
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + isoW * 0.2 + sb * 4 * zoom,
        screenPos.y + 10 * zoom - sb * 2 * zoom,
        4 * zoom,
        2 * zoom,
        0.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Campfire with animated flames
    const fireX = screenPos.x - isoW * 0.8;
    const fireY = screenPos.y + 8 * zoom;
    // Fire pit stones
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.ellipse(fireX, fireY, 5 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Logs
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(fireX - 3 * zoom, fireY - 1 * zoom, 6 * zoom, 2 * zoom);
    // Animated fire
    const fireFlicker = 0.6 + Math.sin(time * 8) * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${fireFlicker})`;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(fireX - 2 * zoom, fireY - 2 * zoom);
    ctx.quadraticCurveTo(fireX, fireY - 8 * zoom - Math.sin(time * 10) * 2, fireX + 2 * zoom, fireY - 2 * zoom);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 100, ${fireFlicker * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(fireX - 1 * zoom, fireY - 2 * zoom);
    ctx.quadraticCurveTo(fireX, fireY - 5 * zoom - Math.sin(time * 12) * 1.5, fireX + 1 * zoom, fireY - 2 * zoom);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (tower.level === 2) {
    // GARRISON BASE - Stone military platform with detailed masonry
    
    // Foundation stone - heavy base
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 17 * zoom,
      baseW + 20,
      baseD + 34,
      10,
      "#4a4a52",
      "#3a3a42",
      "#2a2a32"
    );
    
    // Metal reinforcement bands on foundation
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 20) * zoom * 0.5, screenPos.y + 12 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 34) * zoom * 0.25 + 12 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y + (baseD + 34) * zoom * 0.25 + 12 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 20) * zoom * 0.5, screenPos.y + 12 * zoom);
    ctx.stroke();
    
    // Foundation corner reinforcements
    ctx.fillStyle = "#6a6a72";
    const foundCorners = [
      { x: screenPos.x - (baseW + 20) * zoom * 0.48, y: screenPos.y + 9 * zoom },
      { x: screenPos.x + (baseW + 20) * zoom * 0.48, y: screenPos.y + 9 * zoom },
      { x: screenPos.x, y: screenPos.y + (baseD + 34) * zoom * 0.24 + 9 * zoom }
    ];
    for (const corner of foundCorners) {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Inner bolt
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a6a72";
    }
    
    // Cobblestone layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 7 * zoom,
      baseW + 12,
      baseD + 24,
      7,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42"
    );
    
    // Layer edge highlight
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 12) * zoom * 0.5, screenPos.y + zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 24) * zoom * 0.25 + zoom);
    ctx.lineTo(screenPos.x + (baseW + 12) * zoom * 0.5, screenPos.y + zoom);
    ctx.stroke();
    
    // Top stone platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 4,
      baseD + 14,
      5,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52"
    );
    
    // Top platform flagstone pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = -2; i <= 2; i++) {
      // Diagonal lines one direction
      ctx.beginPath();
      ctx.moveTo(screenPos.x - (baseW + 4) * zoom * 0.4 + i * 6 * zoom, screenPos.y - 5 * zoom - i * 3 * zoom);
      ctx.lineTo(screenPos.x + i * 6 * zoom, screenPos.y + (baseD + 14) * zoom * 0.15 - 5 * zoom - i * 3 * zoom);
      ctx.stroke();
      // Diagonal lines other direction
      ctx.beginPath();
      ctx.moveTo(screenPos.x + (baseW + 4) * zoom * 0.4 + i * 6 * zoom, screenPos.y - 5 * zoom + i * 3 * zoom);
      ctx.lineTo(screenPos.x + i * 6 * zoom, screenPos.y + (baseD + 14) * zoom * 0.15 - 5 * zoom + i * 3 * zoom);
      ctx.stroke();
    }
    
    // Platform edge trim with beveled look
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 4) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 14) * zoom * 0.25 - 5 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 4) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.stroke();
    
    // Decorative corner pillars
    ctx.fillStyle = "#5a5a62";
    drawIsometricPrism(ctx, screenPos.x - (baseW + 4) * zoom * 0.45, screenPos.y - 2 * zoom, 4, 4, 8, 
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" }, zoom);
    drawIsometricPrism(ctx, screenPos.x + (baseW + 4) * zoom * 0.45, screenPos.y - 2 * zoom, 4, 4, 8, 
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" }, zoom);
    
    // Pillar caps
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.ellipse(screenPos.x - (baseW + 4) * zoom * 0.45, screenPos.y - 10 * zoom, 3 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(screenPos.x + (baseW + 4) * zoom * 0.45, screenPos.y - 10 * zoom, 3 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armor stand (left)
    const armorX = screenPos.x - isoW * 0.6;
    const armorY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(armorX - 1.5 * zoom, armorY - 14 * zoom, 3 * zoom, 14 * zoom);
    // Armor body
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.moveTo(armorX, armorY - 18 * zoom);
    ctx.lineTo(armorX - 5 * zoom, armorY - 12 * zoom);
    ctx.lineTo(armorX - 4 * zoom, armorY - 6 * zoom);
    ctx.lineTo(armorX + 4 * zoom, armorY - 6 * zoom);
    ctx.lineTo(armorX + 5 * zoom, armorY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Helmet
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(armorX, armorY - 20 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Orange plume
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.ellipse(
      armorX,
      armorY - 24 * zoom,
      1.5 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Shield rack (right)
    const shieldX = screenPos.x + isoW * 0.5;
    const shieldY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(shieldX - 2 * zoom, shieldY - 10 * zoom, 4 * zoom, 10 * zoom);
    // Shields
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(shieldX - 6 * zoom, shieldY - 16 * zoom);
    ctx.lineTo(shieldX - 10 * zoom, shieldY - 10 * zoom);
    ctx.lineTo(shieldX - 6 * zoom, shieldY - 4 * zoom);
    ctx.lineTo(shieldX - 2 * zoom, shieldY - 10 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Supply crates
    drawIsometricPrism(
      ctx,
      shieldX + 8 * zoom,
      shieldY,
      7,
      6,
      5,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom
    );

    // === LEVEL 2 ENHANCEMENTS: Military Outpost Details ===
    
    // Defensive sandbag wall
    ctx.fillStyle = "#8a7a6a";
    for (let row = 0; row < 2; row++) {
      for (let sb = 0; sb < 4; sb++) {
        const sbX = screenPos.x + isoW * 0.4 + sb * 5 * zoom - row * 2 * zoom;
        const sbY = screenPos.y + 12 * zoom - row * 3 * zoom;
        ctx.beginPath();
        ctx.ellipse(sbX, sbY, 4 * zoom, 2 * zoom, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mounted crossbow on wall
    const crossbowX = screenPos.x - isoW * 0.7;
    const crossbowY = screenPos.y - 2 * zoom;
    // Mount
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(crossbowX - 2 * zoom, crossbowY - 8 * zoom, 4 * zoom, 8 * zoom);
    // Crossbow body
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(crossbowX - 1 * zoom, crossbowY - 14 * zoom, 2 * zoom, 6 * zoom);
    // Crossbow arms
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossbowX - 6 * zoom, crossbowY - 12 * zoom);
    ctx.lineTo(crossbowX, crossbowY - 14 * zoom);
    ctx.lineTo(crossbowX + 6 * zoom, crossbowY - 12 * zoom);
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossbowX - 5 * zoom, crossbowY - 12 * zoom);
    ctx.lineTo(crossbowX + 5 * zoom, crossbowY - 12 * zoom);
    ctx.stroke();

    // Weapon barrels
    const barrelX = screenPos.x + isoW * 0.8;
    const barrelY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(barrelX, barrelY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.ellipse(barrelX, barrelY - 8 * zoom, 3.5 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Barrel bands
    ctx.strokeStyle = "#7a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(barrelX, barrelY - 2 * zoom, 3.8 * zoom, 2.2 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(barrelX, barrelY - 6 * zoom, 3.6 * zoom, 2.1 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Swords sticking out of barrel
    ctx.strokeStyle = "#9a9a9a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(barrelX - 1 * zoom, barrelY - 8 * zoom);
    ctx.lineTo(barrelX - 2 * zoom, barrelY - 18 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(barrelX + 1 * zoom, barrelY - 8 * zoom);
    ctx.lineTo(barrelX + 2 * zoom, barrelY - 16 * zoom);
    ctx.stroke();
    // Sword hilts
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(barrelX - 4 * zoom, barrelY - 19 * zoom, 4 * zoom, 1.5 * zoom);
    ctx.fillRect(barrelX, barrelY - 17 * zoom, 4 * zoom, 1.5 * zoom);

    // Torch bracket on wall
    const torchX = screenPos.x + isoW * 0.3;
    const torchY = screenPos.y - 12 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(torchX - 1 * zoom, torchY, 2 * zoom, 8 * zoom);
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(torchX - 1.5 * zoom, torchY - 8 * zoom, 3 * zoom, 8 * zoom);
    // Torch flame
    const torchFlame = 0.6 + Math.sin(time * 10) * 0.3;
    ctx.fillStyle = `rgba(255, 180, 60, ${torchFlame})`;
    ctx.shadowColor = "#ff8800";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(torchX - 2 * zoom, torchY - 8 * zoom);
    ctx.quadraticCurveTo(torchX, torchY - 14 * zoom - Math.sin(time * 12) * 2, torchX + 2 * zoom, torchY - 8 * zoom);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Armor rack near entrance
    const armorRackX = screenPos.x - isoW * 0.3;
    const armorRackY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(armorRackX - 8 * zoom, armorRackY - 2 * zoom, 16 * zoom, 2 * zoom);
    // Hanging chainmail
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(armorRackX - 4 * zoom, armorRackY - 2 * zoom);
    ctx.lineTo(armorRackX - 6 * zoom, armorRackY - 12 * zoom);
    ctx.lineTo(armorRackX - 2 * zoom, armorRackY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Helmet on rack
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(armorRackX + 4 * zoom, armorRackY - 6 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.ellipse(armorRackX + 4 * zoom, armorRackY - 10 * zoom, 1 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (tower.level === 3) {
    // FORTRESS BASE - Heavy stone fortress platform with imposing masonry
    
    // Deep foundation - massive stone base
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 24,
      baseD + 38,
      12,
      "#3a3a42",
      "#2a2a32",
      "#1a1a22"
    );
    
    // Heavy iron bands around foundation
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 24) * zoom * 0.5, screenPos.y + 10 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 38) * zoom * 0.25 + 10 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 24) * zoom * 0.5, screenPos.y + 10 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 24) * zoom * 0.5, screenPos.y + 18 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 38) * zoom * 0.25 + 18 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 24) * zoom * 0.5, screenPos.y + 18 * zoom);
    ctx.stroke();
    
    // Foundation anchor bolts
    ctx.fillStyle = "#5a5a62";
    const anchorPositions = [
      { x: screenPos.x - (baseW + 24) * zoom * 0.45, y: screenPos.y + 12 * zoom },
      { x: screenPos.x - (baseW + 24) * zoom * 0.25, y: screenPos.y + 15 * zoom },
      { x: screenPos.x + (baseW + 24) * zoom * 0.25, y: screenPos.y + 15 * zoom },
      { x: screenPos.x + (baseW + 24) * zoom * 0.45, y: screenPos.y + 12 * zoom },
      { x: screenPos.x, y: screenPos.y + (baseD + 38) * zoom * 0.22 + 12 * zoom }
    ];
    for (const anchor of anchorPositions) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }
    
    // Stone wall layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 14,
      baseD + 25,
      8,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42"
    );
    
    // Wall edge molding
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 14) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 25) * zoom * 0.25 + 1 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 14) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();
    
    // Top fortress platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 6,
      baseD + 16,
      6,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52"
    );
    
    // Fortress platform paving pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.8 * zoom;
    // Cross-hatch pattern
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.35 + i * 5 * zoom, screenPos.y - 6 * zoom - i * 2.5 * zoom);
      ctx.lineTo(screenPos.x + i * 5 * zoom, screenPos.y + (baseD + 16) * zoom * 0.18 - 6 * zoom - i * 2.5 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + (baseW + 6) * zoom * 0.35 + i * 5 * zoom, screenPos.y - 6 * zoom + i * 2.5 * zoom);
      ctx.lineTo(screenPos.x + i * 5 * zoom, screenPos.y + (baseD + 16) * zoom * 0.18 - 6 * zoom + i * 2.5 * zoom);
      ctx.stroke();
    }
    
    // Platform decorative border
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.5, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 16) * zoom * 0.25 - 6 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.5, screenPos.y - 6 * zoom);
    ctx.stroke();
    
    // Inset glow trim on platform edge
    const platformGlow = 0.3 + Math.sin(time * 2) * 0.15;
    ctx.strokeStyle = `rgba(255, 108, 0, ${platformGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.48, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 16) * zoom * 0.23 - 5 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.48, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Mini battlements on corners - now with more detail
    for (const side of [-1, 1]) {
      drawIsometricPrism(
        ctx,
        screenPos.x + side * isoW * 0.7,
        screenPos.y + side * 2 * zoom,
        6,
        5,
        8,
        { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
        zoom
      );
      // Battlement arrow slit
      ctx.fillStyle = "#2a2a32";
      ctx.fillRect(
        screenPos.x + side * isoW * 0.7 - 1 * zoom,
        screenPos.y + side * 2 * zoom - 6 * zoom,
        2 * zoom,
        4 * zoom
      );
    }
    
    // Fortress corner towers (small)
    drawIsometricPrism(ctx, screenPos.x - (baseW + 6) * zoom * 0.48, screenPos.y - 2 * zoom, 6, 5, 12, 
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" }, zoom);
    drawIsometricPrism(ctx, screenPos.x + (baseW + 6) * zoom * 0.48, screenPos.y - 2 * zoom, 6, 5, 12, 
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" }, zoom);
    
    // Tower caps
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.48, screenPos.y - 18 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 6) * zoom * 0.48 - 4 * zoom, screenPos.y - 14 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 6) * zoom * 0.48, screenPos.y - 12 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 6) * zoom * 0.48 + 4 * zoom, screenPos.y - 14 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + (baseW + 6) * zoom * 0.48, screenPos.y - 18 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.48 - 4 * zoom, screenPos.y - 14 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.48, screenPos.y - 12 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.48 + 4 * zoom, screenPos.y - 14 * zoom);
    ctx.closePath();
    ctx.fill();

    // Catapult/Ballista (left side)
    const siegeX = screenPos.x - isoW * 0.55;
    const siegeY = screenPos.y + 6 * zoom;
    // Base frame
    ctx.fillStyle = "#4a3a2a";
    drawIsometricPrism(
      ctx,
      siegeX,
      siegeY,
      10,
      8,
      4,
      { top: "#5a4a3a", left: "#4a3a2a", right: "#3a2a1a" },
      zoom
    );
    // Arm
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(siegeX, siegeY - 4 * zoom);
    ctx.lineTo(siegeX - 4 * zoom, siegeY - 14 * zoom);
    ctx.stroke();
    // Counterweight
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(siegeX + 3 * zoom, siegeY - 6 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Weapon rack with heavy weapons
    const hwX = screenPos.x + isoW * 0.5;
    const hwY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(hwX - 2 * zoom, hwY - 16 * zoom, 4 * zoom, 16 * zoom);
    // Halberds
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(hwX - 4 * zoom, hwY - 14 * zoom);
    ctx.lineTo(hwX - 4 * zoom, hwY - 26 * zoom);
    ctx.moveTo(hwX + 4 * zoom, hwY - 14 * zoom);
    ctx.lineTo(hwX + 4 * zoom, hwY - 26 * zoom);
    ctx.stroke();
    // Axe heads
    ctx.fillStyle = "#8a8a92";
    for (const ox of [-4, 4]) {
      ctx.beginPath();
      ctx.moveTo(hwX + ox * zoom, hwY - 26 * zoom);
      ctx.lineTo(hwX + ox * zoom - 3 * zoom, hwY - 22 * zoom);
      ctx.lineTo(hwX + ox * zoom + 3 * zoom, hwY - 22 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // === LEVEL 3 ENHANCEMENTS: Heavy Fortress Details ===
    
    // Heavy armor plating on foundation
    ctx.fillStyle = "#5a5a62";
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 1.5 * zoom;
    for (let plate = 0; plate < 3; plate++) {
      const plateX = screenPos.x - isoW * 0.5 + plate * isoW * 0.5;
      const plateY = screenPos.y + 16 * zoom - plate * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(plateX - 6 * zoom, plateY);
      ctx.lineTo(plateX - 4 * zoom, plateY - 6 * zoom);
      ctx.lineTo(plateX + 4 * zoom, plateY - 4 * zoom);
      ctx.lineTo(plateX + 6 * zoom, plateY + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Rivets on plate
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(plateX - 2 * zoom, plateY - 2 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.arc(plateX + 2 * zoom, plateY - 1 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }

    // Defensive spikes around foundation
    ctx.fillStyle = "#4a4a52";
    for (let spike = 0; spike < 5; spike++) {
      const spikeX = screenPos.x - isoW * 0.8 + spike * 8 * zoom;
      const spikeY = screenPos.y + 18 * zoom - spike * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(spikeX, spikeY - 10 * zoom);
      ctx.lineTo(spikeX - 2 * zoom, spikeY);
      ctx.lineTo(spikeX + 2 * zoom, spikeY);
      ctx.closePath();
      ctx.fill();
    }

    // Mounted ballista on platform
    const ballistaX = screenPos.x - isoW * 0.65;
    const ballistaY = screenPos.y + 2 * zoom;
    // Ballista base
    ctx.fillStyle = "#4a3a2a";
    drawIsometricPrism(ctx, ballistaX, ballistaY, 8, 6, 4, 
      { top: "#5a4a3a", left: "#4a3a2a", right: "#3a2a1a" }, zoom);
    // Ballista frame
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(ballistaX - 3 * zoom, ballistaY - 4 * zoom);
    ctx.lineTo(ballistaX, ballistaY - 16 * zoom);
    ctx.lineTo(ballistaX + 3 * zoom, ballistaY - 4 * zoom);
    ctx.closePath();
    ctx.fill();
    // Ballista arms (bow)
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ballistaX - 8 * zoom, ballistaY - 10 * zoom);
    ctx.quadraticCurveTo(ballistaX, ballistaY - 14 * zoom, ballistaX + 8 * zoom, ballistaY - 10 * zoom);
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(ballistaX - 7 * zoom, ballistaY - 10 * zoom);
    ctx.lineTo(ballistaX, ballistaY - 8 * zoom);
    ctx.lineTo(ballistaX + 7 * zoom, ballistaY - 10 * zoom);
    ctx.stroke();
    // Loaded bolt
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(ballistaX - 1 * zoom, ballistaY - 12 * zoom, 2 * zoom, 8 * zoom);
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(ballistaX, ballistaY - 16 * zoom);
    ctx.lineTo(ballistaX - 2 * zoom, ballistaY - 12 * zoom);
    ctx.lineTo(ballistaX + 2 * zoom, ballistaY - 12 * zoom);
    ctx.closePath();
    ctx.fill();

    // Oil cauldrons for defense
    const cauldronX = screenPos.x + isoW * 0.7;
    const cauldronY = screenPos.y + 4 * zoom;
    // Cauldron
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(cauldronX, cauldronY, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.moveTo(cauldronX - 5 * zoom, cauldronY);
    ctx.quadraticCurveTo(cauldronX - 6 * zoom, cauldronY + 8 * zoom, cauldronX, cauldronY + 10 * zoom);
    ctx.quadraticCurveTo(cauldronX + 6 * zoom, cauldronY + 8 * zoom, cauldronX + 5 * zoom, cauldronY);
    ctx.closePath();
    ctx.fill();
    // Bubbling oil
    const oilBubble = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = `rgba(60, 40, 20, ${oilBubble})`;
    ctx.beginPath();
    ctx.ellipse(cauldronX, cauldronY - 2 * zoom, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Steam from cauldron
    ctx.fillStyle = `rgba(180, 160, 140, ${oilBubble * 0.6})`;
    ctx.beginPath();
    ctx.arc(cauldronX + Math.sin(time * 3) * 2, cauldronY - 8 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Fire under cauldron
    const cauldronFire = 0.6 + Math.sin(time * 10) * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${cauldronFire})`;
    ctx.beginPath();
    ctx.moveTo(cauldronX - 3 * zoom, cauldronY + 10 * zoom);
    ctx.quadraticCurveTo(cauldronX, cauldronY + 4 * zoom + Math.sin(time * 12) * 2, cauldronX + 3 * zoom, cauldronY + 10 * zoom);
    ctx.fill();

    // Heavy chains hanging from walls
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    const chainX = screenPos.x + isoW * 0.2;
    const chainY = screenPos.y - 20 * zoom;
    for (let link = 0; link < 6; link++) {
      const linkY = chainY + link * 4 * zoom;
      const sway = Math.sin(time * 2 + link * 0.5) * 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(chainX + sway, linkY, 2 * zoom, 3 * zoom, link % 2 === 0 ? 0.3 : -0.3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // War drums
    const drumX = screenPos.x + isoW * 0.4;
    const drumY = screenPos.y + 8 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(drumX, drumY, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.ellipse(drumX, drumY - 6 * zoom, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Drum skin
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(drumX, drumY - 6.5 * zoom, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Drumsticks
    ctx.fillStyle = "#7a6a5a";
    ctx.fillRect(drumX + 4 * zoom, drumY - 10 * zoom, 1.5 * zoom, 8 * zoom);
    ctx.fillRect(drumX + 6 * zoom, drumY - 9 * zoom, 1.5 * zoom, 7 * zoom);

    // Stacked cannonballs
    ctx.fillStyle = "#3a3a42";
    for (let row = 0; row < 3; row++) {
      for (let ball = 0; ball < 3 - row; ball++) {
        const ballX = screenPos.x - isoW * 0.3 + ball * 4 * zoom + row * 2 * zoom;
        const ballY = screenPos.y + 12 * zoom - row * 3 * zoom;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Fortification banners on walls
    const bannerX2 = screenPos.x + isoW * 0.6;
    const bannerY2 = screenPos.y - 26 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(bannerX2 - 1 * zoom, bannerY2, 2 * zoom, 14 * zoom);
    const bannerWave3 = Math.sin(time * 3) * 2;
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 1 * zoom, bannerY2);
    ctx.quadraticCurveTo(bannerX2 + 8 * zoom + bannerWave3, bannerY2 + 4 * zoom, bannerX2 + 10 * zoom + bannerWave3 * 0.5, bannerY2 + 8 * zoom);
    ctx.lineTo(bannerX2 + 1 * zoom, bannerY2 + 10 * zoom);
    ctx.closePath();
    ctx.fill();
    // Banner emblem (crossed swords)
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 3 * zoom + bannerWave3 * 0.3, bannerY2 + 2 * zoom);
    ctx.lineTo(bannerX2 + 7 * zoom + bannerWave3 * 0.5, bannerY2 + 7 * zoom);
    ctx.moveTo(bannerX2 + 7 * zoom + bannerWave3 * 0.5, bannerY2 + 2 * zoom);
    ctx.lineTo(bannerX2 + 3 * zoom + bannerWave3 * 0.3, bannerY2 + 7 * zoom);
    ctx.stroke();

  } else if (tower.level === 4 && tower.upgrade === "A") {
    // ROYAL STABLE BASE - Elegant Marble Greek platform with detailed texturing
    
    // Foundation marble - bottom tier
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 16 * zoom,
      baseW + 26,
      baseD + 42,
      10,
      "#d0ccc4",
      "#c0bcb4",
      "#b0aca4"
    );
    
    // Foundation gold trim band
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 26) * zoom * 0.5, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 42) * zoom * 0.25 + 8 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 26) * zoom * 0.5, screenPos.y + 8 * zoom);
    ctx.stroke();
    
    // Decorative rosettes on foundation corners
    ctx.fillStyle = "#c9a227";
    const rosettePositions = [
      { x: screenPos.x - (baseW + 26) * zoom * 0.45, y: screenPos.y + 10 * zoom },
      { x: screenPos.x + (baseW + 26) * zoom * 0.45, y: screenPos.y + 10 * zoom },
      { x: screenPos.x, y: screenPos.y + (baseD + 42) * zoom * 0.22 + 10 * zoom }
    ];
    for (const rosette of rosettePositions) {
      // Rosette petals
      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          rosette.x + Math.cos(angle) * 2 * zoom,
          rosette.y + Math.sin(angle) * 1 * zoom,
          1.5 * zoom, 0.8 * zoom, angle, 0, Math.PI * 2
        );
        ctx.fill();
      }
      // Rosette center
      ctx.fillStyle = "#b8860b";
      ctx.beginPath();
      ctx.arc(rosette.x, rosette.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a227";
    }
    
    // Middle marble tier
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 7 * zoom,
      baseW + 16,
      baseD + 28,
      8,
      "#e0dcd4",
      "#d0ccc4",
      "#c0bcb4"
    );
    
    // Fluted column effect on middle tier left face
    ctx.strokeStyle = "#b0aca4";
    ctx.lineWidth = 1 * zoom;
    for (let col = 0; col < 6; col++) {
      const fluteX = screenPos.x - (baseW + 16) * zoom * 0.35 - col * 4 * zoom;
      const fluteTopY = screenPos.y + 1 * zoom + col * 0.8 * zoom;
      const fluteBottomY = screenPos.y + 7 * zoom + col * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(fluteX, fluteTopY);
      ctx.lineTo(fluteX - 1.5 * zoom, fluteBottomY);
      ctx.stroke();
    }
    
    // Fluted column effect on middle tier right face
    for (let col = 0; col < 6; col++) {
      const fluteX = screenPos.x + (baseW + 16) * zoom * 0.35 + col * 4 * zoom;
      const fluteTopY = screenPos.y + 1 * zoom + col * 0.8 * zoom;
      const fluteBottomY = screenPos.y + 7 * zoom + col * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(fluteX, fluteTopY);
      ctx.lineTo(fluteX + 1.5 * zoom, fluteBottomY);
      ctx.stroke();
    }
    
    // Middle tier gold accent band
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 28) * zoom * 0.25 + 1 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();
    
    // Top marble platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 18,
      6,
      "#f0ece4",
      "#e0dcd4",
      "#d0ccc4"
    );
    
    // Top platform tile pattern (diagonal marble tiles)
    ctx.strokeStyle = "#c0bab4";
    ctx.lineWidth = 0.5 * zoom;
    for (let i = -3; i <= 3; i++) {
      // One diagonal direction
      ctx.beginPath();
      ctx.moveTo(screenPos.x - (baseW + 8) * zoom * 0.35 + i * 5 * zoom, screenPos.y - 6 * zoom - i * 2.5 * zoom);
      ctx.lineTo(screenPos.x + i * 5 * zoom, screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom - i * 2.5 * zoom);
      ctx.stroke();
      // Other diagonal direction
      ctx.beginPath();
      ctx.moveTo(screenPos.x + (baseW + 8) * zoom * 0.35 + i * 5 * zoom, screenPos.y - 6 * zoom + i * 2.5 * zoom);
      ctx.lineTo(screenPos.x + i * 5 * zoom, screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom + i * 2.5 * zoom);
      ctx.stroke();
    }
    
    // Gold edge trim with glow
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 2 * zoom);
    ctx.lineTo(screenPos.x + isoW + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Greek meander/key pattern on platform edge
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 1 * zoom;
    for (let i = -4; i <= 4; i++) {
      const px = screenPos.x + i * 6 * zoom;
      const py = screenPos.y + Math.abs(i) * 0.4 * zoom - 3 * zoom;
      // Greek key pattern
      ctx.beginPath();
      ctx.moveTo(px - 2 * zoom, py - 1.5 * zoom);
      ctx.lineTo(px + 2 * zoom, py - 1.5 * zoom);
      ctx.lineTo(px + 2 * zoom, py + 1.5 * zoom);
      ctx.lineTo(px - 1 * zoom, py + 1.5 * zoom);
      ctx.lineTo(px - 1 * zoom, py);
      ctx.lineTo(px + 1 * zoom, py);
      ctx.stroke();
    }
    
    // Decorative corner pedestals
    ctx.fillStyle = "#e0dcd4";
    drawIsometricPrism(ctx, screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 2 * zoom, 5, 5, 10, 
      { top: "#f0ece4", left: "#e0dcd4", right: "#d0ccc4" }, zoom);
    drawIsometricPrism(ctx, screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 2 * zoom, 5, 5, 10, 
      { top: "#f0ece4", left: "#e0dcd4", right: "#d0ccc4" }, zoom);
    
    // Pedestal gold caps
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 12 * zoom, 3.5 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 12 * zoom, 3.5 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Small golden urns on pedestals
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 16 * zoom, 2 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 16 * zoom, 2 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Urn rims
    ctx.fillStyle = "#b8860b";
    ctx.beginPath();
    ctx.ellipse(screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 19 * zoom, 1.5 * zoom, 0.8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 19 * zoom, 1.5 * zoom, 0.8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hay storage area (left)
    const hayX = screenPos.x - isoW * 0.6;
    const hayY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(hayX, hayY - 2 * zoom, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b49830";
    ctx.beginPath();
    ctx.ellipse(
      hayX + 4 * zoom,
      hayY - 6 * zoom,
      5 * zoom,
      2.5 * zoom,
      0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Water trough
    const troughX = screenPos.x + isoW * 0.45;
    const troughY = screenPos.y + 4 * zoom;
    drawIsometricPrism(
      ctx,
      troughX,
      troughY,
      10,
      6,
      4,
      { top: "#8a8a92", left: "#7a7a82", right: "#6a6a72" },
      zoom
    );
    // Water surface
    ctx.fillStyle = `rgba(100, 150, 200, ${0.6 + Math.sin(time * 2) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      troughX,
      troughY - 4 * zoom,
      4 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Golden urn
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(
      troughX + 10 * zoom,
      troughY - 6 * zoom,
      3 * zoom,
      5 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#b8860b";
    ctx.beginPath();
    ctx.ellipse(
      troughX + 10 * zoom,
      troughY - 10 * zoom,
      2 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    // ROYAL CASTLE BASE - Grand royal military fortress with detailed masonry
    
    // Deep royal foundation - massive stone base
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 26,
      baseD + 42,
      12,
      "#3a3a42",
      "#2a2a32",
      "#1a1a22"
    );
    
    // Heavy iron reinforcement bands
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 26) * zoom * 0.5, screenPos.y + 10 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 42) * zoom * 0.25 + 10 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 26) * zoom * 0.5, screenPos.y + 10 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 26) * zoom * 0.5, screenPos.y + 18 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 42) * zoom * 0.25 + 18 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 26) * zoom * 0.5, screenPos.y + 18 * zoom);
    ctx.stroke();
    
    // Foundation anchor points with gold caps
    ctx.fillStyle = "#5a5a62";
    const anchorPoints = [
      { x: screenPos.x - (baseW + 26) * zoom * 0.42, y: screenPos.y + 12 * zoom },
      { x: screenPos.x - (baseW + 26) * zoom * 0.2, y: screenPos.y + 16 * zoom },
      { x: screenPos.x + (baseW + 26) * zoom * 0.2, y: screenPos.y + 16 * zoom },
      { x: screenPos.x + (baseW + 26) * zoom * 0.42, y: screenPos.y + 12 * zoom },
      { x: screenPos.x, y: screenPos.y + (baseD + 42) * zoom * 0.22 + 12 * zoom }
    ];
    for (const anchor of anchorPoints) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Gold cap
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }
    
    // Royal stone tier
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 16,
      baseD + 30,
      9,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42"
    );
    
    // Gold decorative molding on middle tier
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 30) * zoom * 0.25 + 1 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();
    
    // Top royal platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 18,
      6,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52"
    );
    
    // Royal heraldic floor pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.8 * zoom;
    // Cross pattern
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x - (baseW + 8) * zoom * 0.35 + i * 5 * zoom, screenPos.y - 6 * zoom - i * 2.5 * zoom);
      ctx.lineTo(screenPos.x + i * 5 * zoom, screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom - i * 2.5 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + (baseW + 8) * zoom * 0.35 + i * 5 * zoom, screenPos.y - 6 * zoom + i * 2.5 * zoom);
      ctx.lineTo(screenPos.x + i * 5 * zoom, screenPos.y + (baseD + 18) * zoom * 0.15 - 6 * zoom + i * 2.5 * zoom);
      ctx.stroke();
    }
    
    // Gold edge trim with royal glow
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3 * zoom;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 2 * zoom);
    ctx.lineTo(screenPos.x + isoW + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Orange accent glow trim (inner)
    const accentGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.strokeStyle = `rgba(255, 108, 0, ${accentGlow})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 3 * zoom);
    ctx.lineTo(screenPos.x + isoW + 2 * zoom, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Royal carpet pattern (larger, more detailed)
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 10 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x + 10 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 10 * zoom);
    ctx.closePath();
    ctx.fill();
    // Carpet gold border
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Inner carpet pattern
    ctx.fillStyle = "#6b0000";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 6 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 2 * zoom);
    ctx.lineTo(screenPos.x + 6 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 7 * zoom);
    ctx.closePath();
    ctx.fill();
    // Royal crest on carpet (crown symbol)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 3 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x - 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 7 * zoom);
    ctx.lineTo(screenPos.x + 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x + 3 * zoom, screenPos.y - 4 * zoom);
    ctx.closePath();
    ctx.fill();
    
    // Decorative corner fortress pillars
    ctx.fillStyle = "#5a5a62";
    drawIsometricPrism(ctx, screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 2 * zoom, 6, 5, 12, 
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" }, zoom);
    drawIsometricPrism(ctx, screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 2 * zoom, 6, 5, 12, 
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" }, zoom);
    
    // Pillar gold bands
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 8 * zoom, 3.5 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 8 * zoom, 3.5 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Pillar caps with finials
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 18 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 8) * zoom * 0.45 - 4 * zoom, screenPos.y - 14 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 12 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 8) * zoom * 0.45 + 4 * zoom, screenPos.y - 14 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 18 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 8) * zoom * 0.45 - 4 * zoom, screenPos.y - 14 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 12 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 8) * zoom * 0.45 + 4 * zoom, screenPos.y - 14 * zoom);
    ctx.closePath();
    ctx.fill();
    
    // Gold finial spikes
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 8) * zoom * 0.45, screenPos.y - 22 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 8) * zoom * 0.45 - 1.5 * zoom, screenPos.y - 18 * zoom);
    ctx.lineTo(screenPos.x - (baseW + 8) * zoom * 0.45 + 1.5 * zoom, screenPos.y - 18 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + (baseW + 8) * zoom * 0.45, screenPos.y - 22 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 8) * zoom * 0.45 - 1.5 * zoom, screenPos.y - 18 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 8) * zoom * 0.45 + 1.5 * zoom, screenPos.y - 18 * zoom);
    ctx.closePath();
    ctx.fill();

    // Royal guard post (left)
    const guardX = screenPos.x - isoW * 0.6;
    const guardY = screenPos.y + 6 * zoom;
    drawIsometricPrism(
      ctx,
      guardX,
      guardY,
      8,
      6,
      16,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom
    );
    // Guard silhouette
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(guardX, guardY - 20 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(guardX - 2 * zoom, guardY - 17 * zoom, 4 * zoom, 8 * zoom);
    // Spear
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(guardX + 4 * zoom, guardY - 12 * zoom);
    ctx.lineTo(guardX + 4 * zoom, guardY - 28 * zoom);
    ctx.stroke();

    // Royal banner stand (right)
    const bannerX = screenPos.x + isoW * 0.5;
    const bannerY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      bannerX - 1.5 * zoom,
      bannerY - 24 * zoom,
      3 * zoom,
      24 * zoom
    );
    // Banner
    const bannerWave = Math.sin(time * 3) * 2;
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(bannerX + 1.5 * zoom, bannerY - 24 * zoom);
    ctx.quadraticCurveTo(
      bannerX + 10 * zoom + bannerWave,
      bannerY - 20 * zoom,
      bannerX + 14 * zoom + bannerWave * 0.5,
      bannerY - 18 * zoom
    );
    ctx.lineTo(bannerX + 1.5 * zoom, bannerY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Crown on banner
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(bannerX + 5 * zoom + bannerWave * 0.3, bannerY - 20 * zoom);
    ctx.lineTo(bannerX + 6 * zoom + bannerWave * 0.3, bannerY - 22 * zoom);
    ctx.lineTo(bannerX + 8 * zoom + bannerWave * 0.4, bannerY - 20 * zoom);
    ctx.lineTo(bannerX + 10 * zoom + bannerWave * 0.5, bannerY - 22 * zoom);
    ctx.lineTo(bannerX + 11 * zoom + bannerWave * 0.5, bannerY - 20 * zoom);
    ctx.closePath();
    ctx.fill();

    // Treasure chest
    drawIsometricPrism(
      ctx,
      bannerX + 8 * zoom,
      bannerY,
      8,
      6,
      5,
      { top: "#8b4513", left: "#6b3503", right: "#5b2503" },
      zoom
    );
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(bannerX + 5 * zoom, bannerY - 6 * zoom, 6 * zoom, 2 * zoom);
  }

  // Glowing edge on top platform
  const edgeGlow = 0.5 + Math.sin(time * 2) * 0.2;
  ctx.strokeStyle = `rgba(255, 108, 0, ${edgeGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.shadowColor = "#e06000";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - isoW, screenPos.y - 4 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y + isoD - 4 * zoom);
  ctx.lineTo(screenPos.x + isoW, screenPos.y - 4 * zoom);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ========== TRAIN TRACKS WITH SLEEPERS AND SEPARATED RAILS ==========
  const trackLen = baseW * 0.9 * zoom;
  const trackW = 24 * zoom;

  // Helper to draw along isometric track axis
  const trackIso = (baseX: number, baseY: number, offset: number) => ({
    x: baseX + offset * zoom,
    y: baseY - offset * zoom * 0.5,
  });

  // Common track bed (gravel ballast)
  const bedColor =
    tower.level >= 4
      ? "#3a3a42"
      : tower.level >= 3
      ? "#4a4a52"
      : tower.level >= 2
      ? "#3a3a42"
      : "#5a4a3a";
  ctx.fillStyle = bedColor;
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - trackLen * 0.5,
    screenPos.y + trackLen * 0.25 - 3 * zoom
  );
  ctx.lineTo(screenPos.x, screenPos.y - trackW * 0.12 - 3 * zoom);
  ctx.lineTo(
    screenPos.x + trackLen * 0.5,
    screenPos.y - trackLen * 0.25 - 3 * zoom
  );
  ctx.lineTo(screenPos.x, screenPos.y + trackW * 0.12 - 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Sleepers (wooden ties across the tracks)
  const numSleepers = 9;
  const sleeperColor =
    tower.level >= 4
      ? "#4a4a52"
      : tower.level >= 3
      ? "#5a5a62"
      : tower.level >= 2
      ? "#5a5a5a"
      : "#6b5030";
  const sleeperDark =
    tower.level >= 4
      ? "#3a3a42"
      : tower.level >= 3
      ? "#4a4a52"
      : tower.level >= 2
      ? "#4a4a4a"
      : "#5a4020";

  for (let i = 0; i < numSleepers; i++) {
    const t = i / (numSleepers - 1) - 0.5;
    const sleeperCenter = trackIso(
      screenPos.x,
      screenPos.y - 5 * zoom,
      ((t * trackLen) / zoom) * 0.85
    );

    // Sleeper is perpendicular to track - draw as small isometric rectangle
    const sw = 12; // sleeper width (perpendicular to track)
    const sd = 3; // sleeper depth (along track)
    const sh = 2; // sleeper height

    // Top face
    ctx.fillStyle = sleeperColor;
    ctx.beginPath();
    ctx.moveTo(
      sleeperCenter.x - sw * zoom * 0.25,
      sleeperCenter.y - sw * zoom * 0.125
    );
    ctx.lineTo(
      sleeperCenter.x + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 - sw * zoom * 0.125
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125
    );
    ctx.closePath();
    ctx.fill();

    // Front face
    ctx.fillStyle = sleeperDark;
    ctx.beginPath();
    ctx.moveTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125 + sh * zoom
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125 + sh * zoom
    );
    ctx.closePath();
    ctx.fill();
  }

  // Rails - two separate rails with proper 3D shape
  const railOffsets = [-4, 4]; // Distance from center line
  const railColor =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#c9a227"
        : "#7a7a82"
      : "#6a6a6a";
  const railHighlight =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#ffe44d"
        : "#9a9aa2"
      : "#8a8a8a";
  const railDark =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#b8860b"
        : "#5a5a62"
      : "#4a4a4a";

  for (const railOff of railOffsets) {
    // Rail runs along the track
    const railStart = trackIso(
      screenPos.x,
      screenPos.y - 6 * zoom,
      (-trackLen / zoom) * 0.42
    );
    const railEnd = trackIso(
      screenPos.x,
      screenPos.y - 6 * zoom,
      (trackLen / zoom) * 0.42
    );

    // Offset perpendicular to track
    const perpX = railOff * zoom * 0.25;
    const perpY = railOff * zoom * 0.125;

    // Rail top surface (bright)
    ctx.strokeStyle = railHighlight;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY);
    ctx.stroke();

    // Rail side (dark)
    ctx.strokeStyle = railDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY + 1.5 * zoom);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY + 1.5 * zoom);
    ctx.stroke();

    // Rail base flange
    ctx.strokeStyle = railColor;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY + 2.5 * zoom);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY + 2.5 * zoom);
    ctx.stroke();
  }

  // Rail spikes/fasteners on sleepers
  for (let i = 0; i < numSleepers; i++) {
    const t = i / (numSleepers - 1) - 0.5;
    const sleeperCenter = trackIso(
      screenPos.x,
      screenPos.y - 5 * zoom,
      ((t * trackLen) / zoom) * 0.85
    );

    for (const railOff of railOffsets) {
      const perpX = railOff * zoom * 0.25;
      const perpY = railOff * zoom * 0.125;

      // Spike
      ctx.fillStyle =
        tower.level >= 4 && tower.upgrade === "A" ? "#c9a227" : "#e06000";
      ctx.beginPath();
      ctx.arc(
        sleeperCenter.x + perpX,
        sleeperCenter.y + perpY,
        1.2 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Level-specific track decorations
  if (tower.level >= 3) {
    // Glowing runes between rails for fortress/royal
    const runeGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${runeGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    for (let i = 1; i < numSleepers - 1; i += 2) {
      const t = i / (numSleepers - 1) - 0.5;
      const runePos = trackIso(
        screenPos.x,
        screenPos.y - 5 * zoom,
        ((t * trackLen) / zoom) * 0.85
      );
      ctx.beginPath();
      ctx.arc(runePos.x, runePos.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  if (tower.level === 4 && tower.upgrade === "B") {
    // Maglev glow effect for royal armored
    const maglevGlow = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.strokeStyle = `rgba(255, 108, 0, ${maglevGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 10 * zoom;
    ctx.lineWidth = 2 * zoom;
    const glowStart = trackIso(
      screenPos.x,
      screenPos.y - 4 * zoom,
      (-trackLen / zoom) * 0.4
    );
    const glowEnd = trackIso(
      screenPos.x,
      screenPos.y - 4 * zoom,
      (trackLen / zoom) * 0.4
    );
    ctx.beginPath();
    ctx.moveTo(glowStart.x, glowStart.y);
    ctx.lineTo(glowEnd.x, glowEnd.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ========== STATION BUILDING (proper isometric alignment) ==========
  const stationX = screenPos.x - 16 * zoom;
  const stationY = screenPos.y - 8 * zoom;

  // Helper: Draw proper isometric sloped roof
  const drawSlopedRoof = (
    cx: number,
    cy: number,
    w: number,
    d: number,
    h: number,
    leftColor: string,
    rightColor: string,
    frontColor: string
  ) => {
    const hw = w * zoom * 0.5;
    const hd = d * zoom * 0.25;
    const rh = h * zoom;

    // Left slope
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh);
    ctx.lineTo(cx - hw, cy);
    ctx.lineTo(cx - hw, cy + hd);
    ctx.lineTo(cx, cy - rh + hd * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right slope
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx + hw, cy + hd);
    ctx.lineTo(cx, cy - rh + hd * 0.5);
    ctx.closePath();
    ctx.fill();

    // Front gable
    ctx.fillStyle = frontColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh + hd * 0.5);
    ctx.lineTo(cx - hw, cy + hd);
    ctx.lineTo(cx + hw, cy + hd);
    ctx.closePath();
    ctx.fill();
  };

  // Helper: Draw working clock face
  const drawClockFace = (
    cx: number,
    cy: number,
    radius: number,
    showNumerals: boolean = false
  ) => {
    // Clock backing
    ctx.fillStyle = "#fffff8";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Hour markers
    ctx.fillStyle = "#1a1a1a";
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const markerR = radius * 0.85;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * markerR,
        cy + Math.sin(angle) * markerR,
        radius * 0.06,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Animated hands
    const hourAngle = ((time * 0.03) % (Math.PI * 2)) - Math.PI / 2;
    const minAngle = ((time * 0.2) % (Math.PI * 2)) - Math.PI / 2;

    // Hour hand
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(hourAngle) * radius * 0.5,
      cy + Math.sin(hourAngle) * radius * 0.5
    );
    ctx.stroke();

    // Minute hand
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(minAngle) * radius * 0.75,
      cy + Math.sin(minAngle) * radius * 0.75
    );
    ctx.stroke();

    // Center cap
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
  };

  if (tower.level === 1) {
    // ========== LEVEL 1: BARRACKS - Steampunk Wooden Training Facility ==========
    const bX = stationX;
    const bY = stationY;

    // === ENHANCED FOUNDATION with exposed machinery ===
    // Stone foundation base
    drawIsometricPrism(
      ctx,
      bX,
      bY + 6 * zoom,
      36,
      30,
      6,
      { top: "#5a5a5a", left: "#4a4a4a", right: "#3a3a3a" },
      zoom
    );

    // Foundation details - stone blocks
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = 0; i < 4; i++) {
      const fy = bY + 4 * zoom - i * 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX - 16 * zoom, fy + 4 * zoom);
      ctx.lineTo(bX - 4 * zoom, fy + 7 * zoom);
      ctx.stroke();
    }

    // Exposed pipes on foundation (left side)
    ctx.strokeStyle = "#6b5030";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 4 * zoom);
    ctx.lineTo(bX - 18 * zoom, bY - 5 * zoom);
    ctx.quadraticCurveTo(
      bX - 18 * zoom,
      bY - 10 * zoom,
      bX - 14 * zoom,
      bY - 10 * zoom
    );
    ctx.stroke();
    // Pipe joints
    ctx.fillStyle = "#8a7355";
    ctx.beginPath();
    ctx.arc(bX - 18 * zoom, bY + 4 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 18 * zoom, bY - 5 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Foundation vent grate
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(bX + 8 * zoom, bY + 2 * zoom, 6 * zoom, 4 * zoom);
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bX + 9 * zoom + i * 2 * zoom, bY + 2 * zoom);
      ctx.lineTo(bX + 9 * zoom + i * 2 * zoom, bY + 6 * zoom);
      ctx.stroke();
    }
    // Vent steam
    const ventSteam = 0.3 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${ventSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX + 11 * zoom,
      bY - 1 * zoom + Math.sin(time * 2) * 2,
      3 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Main wooden building
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      32,
      26,
      28,
      { top: "#9b8365", left: "#7b6345", right: "#5b4325" },
      zoom
    );

    // Horizontal log/plank details on left face
    ctx.strokeStyle = "#4a3215";
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < 5; i++) {
      const ly = bY - 4 * zoom - i * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX - 14 * zoom, ly + 3.5 * zoom);
      ctx.lineTo(bX - 2 * zoom, ly + 6.5 * zoom);
      ctx.stroke();
    }

    // Vertical timber frame details on right face
    ctx.strokeStyle = "#4a3215";
    for (let i = 0; i < 3; i++) {
      const lx = bX + 4 * zoom + i * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, bY - 2 * zoom);
      ctx.lineTo(lx, bY - 26 * zoom);
      ctx.stroke();
    }

    // === HIGH-TECH ELEMENT: Power conduit on wall ===
    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX + 16 * zoom, bY - 5 * zoom);
    ctx.lineTo(bX + 16 * zoom, bY - 20 * zoom);
    ctx.stroke();
    // Conduit glow nodes
    const nodeGlow = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = `rgba(255, 108, 0, ${nodeGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(bX + 16 * zoom, bY - 8 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX + 16 * zoom, bY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Proper sloped thatched roof
    const roofY = bY - 28 * zoom;
    drawSlopedRoof(bX, roofY, 36, 30, 16, "#6a5a3a", "#5a4a2a", "#7a6a4a");

    // Roof texture lines (thatch effect)
    ctx.strokeStyle = "#4a3a1a";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(
        bX - 16 * zoom + i * 4 * zoom,
        roofY - 4 * zoom - i * 3 * zoom
      );
      ctx.lineTo(bX - 16 * zoom + i * 4 * zoom, roofY + 4 * zoom - i * zoom);
      ctx.stroke();
    }

    // Large double door (left face)
    ctx.fillStyle = "#4a3215";
    ctx.beginPath();
    ctx.moveTo(bX - 12 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 12 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 3 * zoom, bY - 16 * zoom);
    ctx.lineTo(bX - 3 * zoom, bY);
    ctx.closePath();
    ctx.fill();
    // Door frame
    ctx.strokeStyle = "#3a2205";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Door split line
    ctx.beginPath();
    ctx.moveTo(bX - 7.5 * zoom, bY - 1 * zoom);
    ctx.lineTo(bX - 7.5 * zoom, bY - 17 * zoom);
    ctx.stroke();
    // Door handles (brass)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(bX - 9 * zoom, bY - 9 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 6 * zoom, bY - 8.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Window with warm glow (right face)
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(bX + 5 * zoom, bY - 20 * zoom, 8 * zoom, 10 * zoom);
    const winGlow1 = 0.5 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(255, 200, 100, ${winGlow1})`;
    ctx.fillRect(bX + 6 * zoom, bY - 19 * zoom, 6 * zoom, 8 * zoom);
    // Window cross frame
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX + 9 * zoom, bY - 19 * zoom);
    ctx.lineTo(bX + 9 * zoom, bY - 11 * zoom);
    ctx.moveTo(bX + 6 * zoom, bY - 15 * zoom);
    ctx.lineTo(bX + 12 * zoom, bY - 15 * zoom);
    ctx.stroke();

    // Stone chimney with smoke stack
    drawIsometricPrism(
      ctx,
      bX + 6 * zoom,
      roofY - 8 * zoom,
      5,
      4,
      14,
      { top: "#6a6a6a", left: "#5a5a5a", right: "#4a4a4a" },
      zoom
    );
    // Chimney cap
    drawIsometricPrism(
      ctx,
      bX + 6 * zoom,
      roofY - 22 * zoom,
      7,
      5,
      2,
      { top: "#5a5a5a", left: "#4a4a4a", right: "#3a3a3a" },
      zoom
    );
    // Smoke
    const smokeAlpha1 = 0.25 + Math.sin(time * 2) * 0.1;
    ctx.fillStyle = `rgba(180, 180, 180, ${smokeAlpha1})`;
    const smokeOff1 = Math.sin(time * 1.5) * 3;
    ctx.beginPath();
    ctx.arc(
      bX + 6 * zoom + smokeOff1,
      roofY - 28 * zoom,
      3 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      bX + 11 * zoom + smokeOff1 * 0.7,
      roofY - 34 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // === HIGH-TECH: Small gear on side ===
    const gearX1 = bX - 16 * zoom;
    const gearY1 = bY - 6 * zoom;
    ctx.fillStyle = "#8b7355";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.5;
      const r = i % 2 === 0 ? 3 * zoom : 2.2 * zoom;
      const x = gearX1 + Math.cos(angle) * r;
      const y = gearY1 + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(gearX1, gearY1, 1.2 * zoom, 0.6 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden sign with metal bracket
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(bX - 18 * zoom, roofY + 6 * zoom, 24 * zoom, 10 * zoom);
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(bX - 18 * zoom, roofY + 6 * zoom, 24 * zoom, 10 * zoom);
    // Metal corners
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(bX - 18 * zoom, roofY + 6 * zoom, 3 * zoom, 3 * zoom);
    ctx.fillRect(bX + 3 * zoom, roofY + 6 * zoom, 3 * zoom, 3 * zoom);
    ctx.fillStyle = "#e06000";
    ctx.font = `bold ${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("BARRACKS", bX - 6 * zoom, roofY + 13 * zoom);

    // === Lantern on post ===
    const lanternX = bX + 18 * zoom;
    const lanternY = bY - 15 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(lanternX - 1 * zoom, lanternY, 2 * zoom, 15 * zoom);
    drawIsometricPrism(
      ctx,
      lanternX,
      lanternY,
      4,
      4,
      6,
      { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" },
      zoom
    );
    const lanternGlow = 0.6 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 200, 100, ${lanternGlow})`;
    ctx.shadowColor = "#ffcc66";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY - 3 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (tower.level === 2) {
    // ========== LEVEL 2: GARRISON - Industrial Stone Military Outpost ==========
    const bX = stationX;
    const bY = stationY;

    // === ENHANCED FOUNDATION with machinery ===
    // Heavy stone foundation
    drawIsometricPrism(
      ctx,
      bX,
      bY + 8 * zoom,
      40,
      34,
      8,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom
    );

    // Foundation rivets
    ctx.fillStyle = "#6a6a72";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 14 * zoom + i * 6 * zoom,
        bY + 6 * zoom - i * 0.5 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Exposed steam pipes on foundation
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY + 6 * zoom);
    ctx.lineTo(bX - 20 * zoom, bY - 8 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY - 8 * zoom);
    ctx.quadraticCurveTo(
      bX - 20 * zoom,
      bY - 14 * zoom,
      bX - 14 * zoom,
      bY - 14 * zoom
    );
    ctx.stroke();
    // Pipe valve wheel
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 20 * zoom, bY - 2 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.arc(bX - 20 * zoom, bY - 2 * zoom, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Foundation exhaust port
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 5 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Exhaust glow
    const exhaustGlow = 0.4 + Math.sin(time * 5) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${exhaustGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 5 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clock tower (attached to main building)
    const towerX = bX + 14 * zoom;
    const towerY = bY - 6 * zoom;
    drawIsometricPrism(
      ctx,
      towerX,
      towerY,
      14,
      12,
      44,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom
    );

    // Tower stone texture
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 0; i < 8; i++) {
      const ty = towerY - 4 * zoom - i * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(towerX - 6 * zoom, ty + 1.5 * zoom);
      ctx.lineTo(towerX, ty + 3 * zoom);
      ctx.stroke();
    }

    // Tower roof (pyramid with spire)
    const tRoofY = towerY - 44 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX - 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY + 4 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY + 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Gold finial
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(towerX, tRoofY - 18 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clock face on tower
    drawClockFace(towerX + 1 * zoom, towerY - 35 * zoom, 6 * zoom);

    // Main stone building
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      34,
      28,
      32,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom
    );

    // Stone brick texture - left face
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 0.8 * zoom;
    for (let row = 0; row < 6; row++) {
      const ly = bY - 3 * zoom - row * 5 * zoom;
      const offset = (row % 2) * 5 * zoom;
      for (let col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.moveTo(bX - 15 * zoom + offset + col * 6 * zoom, ly + 3 * zoom);
        ctx.lineTo(bX - 10 * zoom + offset + col * 6 * zoom, ly + 5 * zoom);
        ctx.stroke();
      }
    }

    // === HIGH-TECH: Power conduits on walls ===
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX + 17 * zoom, bY - 4 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY - 28 * zoom);
    ctx.stroke();
    // Power nodes with glow
    const powerGlow = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = `rgba(255, 108, 0, ${powerGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        bX + 17 * zoom,
        bY - 8 * zoom - i * 8 * zoom,
        2 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Crenellated battlements on top
    const crenY = bY - 32 * zoom;
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        drawIsometricPrism(
          ctx,
          bX - 12 * zoom + i * 6 * zoom,
          crenY,
          5,
          4,
          5,
          { top: "#8a8a92", left: "#6a6a72", right: "#5a5a62" },
          zoom
        );
      }
    }

    // Arched stone doorway
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.moveTo(bX - 12 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 12 * zoom, bY - 14 * zoom);
    ctx.arc(bX - 8 * zoom, bY - 14 * zoom, 4 * zoom, Math.PI, 0);
    ctx.lineTo(bX - 4 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Arch stones
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 8 * zoom, bY - 14 * zoom, 4 * zoom, Math.PI, 0);
    ctx.stroke();
    // Door reinforcement
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 11 * zoom, bY - 8 * zoom);
    ctx.lineTo(bX - 5 * zoom, bY - 7 * zoom);
    ctx.stroke();

    // Arrow slit windows with inner glow
    ctx.fillStyle = "#1a1a22";
    ctx.fillRect(bX + 5 * zoom, bY - 22 * zoom, 2 * zoom, 10 * zoom);
    ctx.fillRect(bX + 10 * zoom, bY - 24 * zoom, 2 * zoom, 10 * zoom);
    const slitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(255, 150, 50, ${slitGlow})`;
    ctx.fillRect(bX + 5.3 * zoom, bY - 21 * zoom, 1.4 * zoom, 8 * zoom);
    ctx.fillRect(bX + 10.3 * zoom, bY - 23 * zoom, 1.4 * zoom, 8 * zoom);

    // === HIGH-TECH: Rotating radar/beacon on tower ===
    const beaconAngle = time * 2;
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 12 * zoom);
    ctx.lineTo(
      towerX + Math.cos(beaconAngle) * 5 * zoom,
      tRoofY - 12 * zoom + Math.sin(beaconAngle) * 2.5 * zoom
    );
    ctx.stroke();

    // Garrison banner
    ctx.fillStyle = "#e06000";
    const bannerWave2 = Math.sin(time * 3) * 2;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, crenY - 2 * zoom);
    ctx.lineTo(bX - 18 * zoom, crenY - 16 * zoom);
    ctx.quadraticCurveTo(
      bX - 10 * zoom + bannerWave2,
      crenY - 14 * zoom,
      bX - 4 * zoom + bannerWave2 * 0.5,
      crenY - 12 * zoom
    );
    ctx.lineTo(bX - 4 * zoom, crenY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Banner pole
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, crenY + 2 * zoom);
    ctx.lineTo(bX - 18 * zoom, crenY - 18 * zoom);
    ctx.stroke();

    // === Mechanical gears on side ===
    const gearX = bX - 17 * zoom;
    const gearY = bY - 20 * zoom;
    // Large gear
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.3;
      const r = i % 2 === 0 ? 4 * zoom : 3 * zoom;
      const x = gearX + Math.cos(angle) * r;
      const y = gearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Small interlocking gear
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - time * 0.4;
      const r = i % 2 === 0 ? 2.5 * zoom : 1.8 * zoom;
      const x = gearX + 5 * zoom + Math.cos(angle) * r;
      const y = gearY + 2.5 * zoom + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Gear centers
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(gearX, gearY, 1.5 * zoom, 0.75 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      gearX + 5 * zoom,
      gearY + 2.5 * zoom,
      1 * zoom,
      0.5 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Sign plate with industrial frame
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(bX - 16 * zoom, bY + 6 * zoom, 26 * zoom, 9 * zoom);
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(bX - 16 * zoom, bY + 6 * zoom, 26 * zoom, 9 * zoom);
    // Corner bolts
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(bX - 14 * zoom, bY + 8 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.arc(bX + 8 * zoom, bY + 8 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e06000";
    ctx.font = `bold ${4.5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("GARRISON", bX - 3 * zoom, bY + 12.5 * zoom);
  } else if (tower.level === 3) {
    // ========== LEVEL 3: FORTRESS - Industrial Castle ==========
    const bX = stationX;
    const bY = stationY;

    // === FOUNDATION - Industrial fortress base (extends lower) ===
    drawIsometricPrism(
      ctx,
      bX,
      bY + 2 * zoom,
      42,
      40,
      4,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom
    );

    // Foundation armor plating
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 18 * zoom, bY + 12 * zoom - i * 3 * zoom);
      ctx.lineTo(bX - 6 * zoom, bY + 16 * zoom - i * 3 * zoom);
      ctx.stroke();
    }

    // Heavy machinery in foundation - gear system
    const fGearX = bX + 14 * zoom;
    const fGearY = bY + 9 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.2;
      const r = i % 2 === 0 ? 4 * zoom : 3 * zoom;
      const x = fGearX + Math.cos(angle) * r;
      const y = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 1.5 * zoom, 0.75 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steam exhaust vents
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 12 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    const fSteam = 0.35 + Math.sin(time * 4) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${fSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX - 14 * zoom + Math.sin(time * 2) * 2,
      bY + 5 * zoom,
      3.5 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Power conduit running along foundation
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX + 18 * zoom, bY + 6 * zoom);
    ctx.stroke();
    // Conduit energy nodes
    const cGlow = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${cGlow})`;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 12 * zoom + i * 10 * zoom,
        bY + 9 * zoom - i * 0.8 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Right clock tower (taller) with machinery
    const rtX = bX + 18 * zoom;
    const rtY = bY - 6 * zoom;
    drawIsometricPrism(
      ctx,
      rtX,
      rtY,
      12,
      10,
      48,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom
    );

    // Main keep (central building)
    drawIsometricPrism(
      ctx,
      bX,
      bY - 1 * zoom,
      32,
      30,
      32,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom
    );

    // Stone block texture
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 0.6 * zoom;
    for (let row = 0; row < 6; row++) {
      const ly = bY - 4 * zoom - row * 5 * zoom;
      const offset = (row % 2) * 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX - 14 * zoom + offset, ly + 4 * zoom);
      ctx.lineTo(bX - 6 * zoom + offset, ly + 6 * zoom);
      ctx.stroke();
    }

    // Heavy battlements on main keep
    const keepTop = bY - 32.5 * zoom;
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        drawIsometricPrism(
          ctx,
          bX - 8 * zoom + i * 4.5 * zoom,
          keepTop,
          5,
          4,
          5,
          { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
          zoom
        );
      }
    }

    // Left corner tower
    const ltX = bX - 16 * zoom;
    const ltY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      ltX,
      ltY,
      10,
      8,
      42,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom
    );
    // Tower armor bands
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(ltX - 4 * zoom, ltY - 10 * zoom - i * 12 * zoom);
      ctx.lineTo(ltX + 4 * zoom, ltY - 8 * zoom - i * 12 * zoom);
      ctx.stroke();
    }
    // Tower top conical roof
    const ltRoofY = ltY - 42 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX - 6 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Flag on left tower
    ctx.fillStyle = "#e06000";
    const flagWave = Math.sin(time * 4) * 2;
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX, ltRoofY - 24 * zoom);
    ctx.quadraticCurveTo(
      ltX + 7 * zoom + flagWave,
      ltRoofY - 22 * zoom,
      ltX + 10 * zoom + flagWave,
      ltRoofY - 20 * zoom
    );
    ctx.lineTo(ltX, ltRoofY - 18 * zoom);
    ctx.closePath();
    ctx.fill();

    // Tower gears
    const tGearX = rtX - 3 * zoom;
    const tGearY = rtY - 18 * zoom;
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.5;
      const r = i % 2 === 0 ? 3.5 * zoom : 2.5 * zoom;
      const x = tGearX + Math.cos(angle) * r;
      const y = tGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Tower spire
    const rtRoofY = rtY - 48 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX - 7 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Bronze finial
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    ctx.arc(rtX, rtRoofY - 18 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(rtX - 1 * zoom, rtRoofY - 24 * zoom, 2 * zoom, 8 * zoom);

    // Clock on right tower
    drawClockFace(rtX + 1 * zoom, rtY - 36 * zoom, 6 * zoom, true);

    // Grand portcullis entrance
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.moveTo(bX - 7 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 7 * zoom, bY - 16 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 16 * zoom, 5 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 3 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Portcullis bars
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 7 * zoom + i * 3 * zoom, bY - 2 * zoom);
      ctx.lineTo(bX - 7 * zoom + i * 3 * zoom, bY - 16 * zoom + i * 0.6 * zoom);
      ctx.stroke();
    }
    // Horizontal bar
    ctx.beginPath();
    ctx.moveTo(bX - 8 * zoom, bY - 8 * zoom);
    ctx.lineTo(bX + 2 * zoom, bY - 6 * zoom);
    ctx.stroke();

    // Rose window above entrance (glowing)
    const roseGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${roseGlow})`;
    ctx.beginPath();
    ctx.arc(bX - 3 * zoom, bY - 26 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Rose window frame
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Fortress banner
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(bX - 14 * zoom, bY + 12 * zoom, 28 * zoom, 10 * zoom);
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(bX - 14 * zoom, bY + 12 * zoom, 28 * zoom, 10 * zoom);
    ctx.fillStyle = "#e06000";
    ctx.font = `bold ${4.5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("FORTRESS", bX, bY + 19 * zoom);
  } else if (tower.level === 4 && tower.upgrade === "A") {
    // ========== LEVEL 4A: CENTAUR STABLES - Grand Archer's Training Grounds ==========
    const bX = stationX;
    const bY = stationY;

    // === ENHANCED FOUNDATION - Stone with brass pipes (extends lower) ===
    drawIsometricPrism(
      ctx,
      bX,
      bY + 16 * zoom,
      44,
      38,
      12,
      { top: "#8a7a6a", left: "#7a6a5a", right: "#6a5a4a" },
      zoom
    );

    // Foundation brass trim with rivets
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY + 12 * zoom);
    ctx.lineTo(bX + 4 * zoom, bY + 16 * zoom);
    ctx.stroke();
    // Decorative rivets
    ctx.fillStyle = "#c9a227";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 16 * zoom + i * 6 * zoom,
        bY + 13 * zoom - i * 0.5 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Steam pipes running along foundation
    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 22 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX - 22 * zoom, bY - 12 * zoom);
    ctx.quadraticCurveTo(
      bX - 22 * zoom,
      bY - 18 * zoom,
      bX - 16 * zoom,
      bY - 18 * zoom
    );
    ctx.stroke();
    // Pipe joints
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.arc(bX - 22 * zoom, bY + 10 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 22 * zoom, bY - 12 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Large animated gear cluster
    const fGearX = bX + 18 * zoom;
    const fGearY = bY + 8 * zoom;
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.25;
      const r = i % 2 === 0 ? 5 * zoom : 3.8 * zoom;
      const gx = fGearX + Math.cos(angle) * r;
      const gy = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Interlocking gears
    const fGear2X = fGearX - 7 * zoom;
    const fGear2Y = fGearY + 3 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - time * 0.35;
      const r = i % 2 === 0 ? 3.5 * zoom : 2.5 * zoom;
      const gx = fGear2X + Math.cos(angle) * r;
      const gy = fGear2Y + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();

    // Steam vents with animated puffs
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 12 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    const steamPuff = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${steamPuff})`;
    ctx.beginPath();
    ctx.arc(
      bX - 14 * zoom + Math.sin(time * 2) * 2,
      bY + 4 * zoom,
      4 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = `rgba(180, 180, 180, ${steamPuff * 0.6})`;
    ctx.beginPath();
    ctx.arc(
      bX - 13 * zoom + Math.sin(time * 2.5) * 2,
      bY - 2 * zoom,
      3 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // === ARCHERY TARGET (Left side - on platform) ===
    const targetX = bX - 18 * zoom;
    const targetY = bY + 2 * zoom;
    // Target stand
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(targetX - 1 * zoom, targetY - 6 * zoom, 2 * zoom, 12 * zoom);
    ctx.fillRect(targetX - 4 * zoom, targetY + 4 * zoom, 8 * zoom, 2 * zoom);
    // Target rings
    ctx.fillStyle = "#f0f0e0";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      6 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#c03030";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      4.5 * zoom,
      2.2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#f0f0e0";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#c03030";
    ctx.beginPath();
    ctx.ellipse(
      targetX,
      targetY - 10 * zoom,
      1.5 * zoom,
      0.75 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Arrow in target
    ctx.strokeStyle = "#5a3a1a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(targetX + 1.5 * zoom, targetY - 10.5 * zoom);
    ctx.lineTo(targetX + 5 * zoom, targetY - 9 * zoom);
    ctx.stroke();

    // === LEFT HORSE STABLE ===
    const lwX = bX - 16 * zoom;
    const lwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      lwX,
      lwY,
      14,
      12,
      22,
      { top: "#9b7b5b", left: "#8b6b4b", right: "#7b5b3b" },
      zoom
    );
    // Stable roof
    drawSlopedRoof(
      lwX,
      lwY - 22 * zoom,
      18,
      15,
      10,
      "#6a5030",
      "#5a4020",
      "#7a6040"
    );
    // Stable door
    ctx.fillStyle = "#4a3015";
    ctx.fillRect(lwX - 5 * zoom, lwY - 14 * zoom, 8 * zoom, 14 * zoom);
    ctx.strokeStyle = "#3a2005";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(lwX - 4.5 * zoom, lwY - 13.5 * zoom, 7 * zoom, 6 * zoom);
    // Horse head
    ctx.fillStyle = "#c9a868";
    ctx.beginPath();
    ctx.ellipse(
      lwX - 1 * zoom,
      lwY - 10 * zoom,
      3 * zoom,
      2.5 * zoom,
      -0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(lwX + 0.5 * zoom, lwY - 10.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Brass horseshoe
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      lwX - 1 * zoom,
      lwY - 18 * zoom,
      3 * zoom,
      0.3 * Math.PI,
      0.7 * Math.PI,
      true
    );
    ctx.stroke();
    // Orange pennant on stable
    const lwFlagWave = Math.sin(time * 4) * 2;
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(lwX + 2 * zoom, lwY - 30 * zoom);
    ctx.lineTo(lwX + 2 * zoom, lwY - 38 * zoom);
    ctx.quadraticCurveTo(
      lwX + 8 * zoom + lwFlagWave,
      lwY - 36 * zoom,
      lwX + 10 * zoom + lwFlagWave,
      lwY - 34 * zoom
    );
    ctx.lineTo(lwX + 2 * zoom, lwY - 34 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b89227";
    ctx.fillRect(lwX + 1 * zoom, lwY - 40 * zoom, 2 * zoom, 12 * zoom);

    // === RIGHT HORSE STABLE ===
    const rwX = bX + 18 * zoom;
    const rwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      rwX,
      rwY,
      14,
      12,
      22,
      { top: "#9b7b5b", left: "#8b6b4b", right: "#7b5b3b" },
      zoom
    );
    drawSlopedRoof(
      rwX,
      rwY - 22 * zoom,
      18,
      15,
      10,
      "#6a5030",
      "#5a4020",
      "#7a6040"
    );
    ctx.fillStyle = "#4a3015";
    ctx.fillRect(rwX - 2 * zoom, rwY - 14 * zoom, 8 * zoom, 14 * zoom);
    // Horse head
    ctx.fillStyle = "#8b6b4b";
    ctx.beginPath();
    ctx.ellipse(
      rwX + 2 * zoom,
      rwY - 10 * zoom,
      3 * zoom,
      2.5 * zoom,
      0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(rwX + 3.5 * zoom, rwY - 10.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Orange pennant
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(rwX - 2 * zoom, rwY - 30 * zoom);
    ctx.lineTo(rwX - 2 * zoom, rwY - 38 * zoom);
    ctx.quadraticCurveTo(
      rwX + 4 * zoom + lwFlagWave,
      rwY - 36 * zoom,
      rwX + 6 * zoom + lwFlagWave,
      rwY - 34 * zoom
    );
    ctx.lineTo(rwX - 2 * zoom, rwY - 34 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b89227";
    ctx.fillRect(rwX - 3 * zoom, rwY - 40 * zoom, 2 * zoom, 12 * zoom);

    // === MAIN BUILDING - Gilded Archery Hall ===
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      30,
      24,
      34,
      { top: "#a08060", left: "#907050", right: "#806040" },
      zoom
    );

    // Vertical wood planks
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 12 * zoom + i * 4 * zoom, bY - 2 * zoom);
      ctx.lineTo(bX - 12 * zoom + i * 4 * zoom, bY - 32 * zoom);
      ctx.stroke();
    }

    // Brass bands
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2.5 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 13 * zoom, bY - 8 * zoom - i * 10 * zoom);
      ctx.lineTo(bX + 2 * zoom, bY - 5 * zoom - i * 10 * zoom);
      ctx.stroke();
    }

    // Decorative bow emblem on wall
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      bX - 5 * zoom,
      bY - 22 * zoom,
      5 * zoom,
      -Math.PI * 0.6,
      Math.PI * 0.6
    );
    ctx.stroke();

    // Main barn roof
    const roofY = bY - 34 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.beginPath();
    ctx.moveTo(bX, roofY - 18 * zoom);
    ctx.lineTo(bX - 18 * zoom, roofY);
    ctx.lineTo(bX, roofY + 10 * zoom);
    ctx.lineTo(bX + 18 * zoom, roofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a3010";
    ctx.beginPath();
    ctx.moveTo(bX, roofY - 18 * zoom);
    ctx.lineTo(bX + 18 * zoom, roofY);
    ctx.lineTo(bX, roofY + 10 * zoom);
    ctx.closePath();
    ctx.fill();

    // Brass weathervane centaur on roof
    ctx.fillStyle = "#c9a227";
    const vaneX = bX;
    const vaneY = roofY - 20 * zoom;
    ctx.fillRect(vaneX - 1 * zoom, vaneY, 2 * zoom, 6 * zoom);
    ctx.beginPath();
    ctx.ellipse(vaneX, vaneY - 4 * zoom, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(vaneX + 2 * zoom, vaneY - 6 * zoom);
    ctx.lineTo(vaneX + 1 * zoom, vaneY - 11 * zoom);
    ctx.lineTo(vaneX + 3 * zoom, vaneY - 10 * zoom);
    ctx.closePath();
    ctx.fill();

    // Main entrance
    ctx.fillStyle = "#3a2010";
    ctx.beginPath();
    ctx.moveTo(bX - 6 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 6 * zoom, bY - 18 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 18 * zoom, 4 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 2 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Interior glow
    const interiorGlow = 0.4 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(255, 180, 100, ${interiorGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 2 * zoom,
      bY - 10 * zoom,
      3 * zoom,
      6 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Brass arch trim
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 2 * zoom, bY - 18 * zoom, 4.5 * zoom, Math.PI, 0);
    ctx.stroke();

    // Pressure gauge on wall
    const gaugeX = bX + 12 * zoom;
    const gaugeY = bY - 18 * zoom;
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0f0e8";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    const needleAngle = Math.PI + Math.sin(time * 2) * 0.4 + Math.PI * 0.6;
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(
      gaugeX + Math.cos(needleAngle) * 2.5 * zoom,
      gaugeY + Math.sin(needleAngle) * 2.5 * zoom
    );
    ctx.stroke();

    // Hay bale
    ctx.fillStyle = "#d4a017";
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 8 * zoom,
      5 * zoom,
      3.5 * zoom,
      0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "#a08010";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Sign with brass frame
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(bX - 14 * zoom, bY + 12 * zoom, 28 * zoom, 10 * zoom);
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(bX - 14 * zoom, bY + 12 * zoom, 28 * zoom, 10 * zoom);
    ctx.fillStyle = "#c9a227";
    ctx.font = `bold ${4.5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("STABLES", bX, bY + 19 * zoom);
  } else {
    // ========== LEVEL 4B: ROYAL CAVALRY FORTRESS - Orange Royal Military Stronghold ==========
    const bX = stationX;
    const bY = stationY;

    // === FOUNDATION - Royal armored base with orange trim (extends lower) ===
    drawIsometricPrism(
      ctx,
      bX,
      bY + 16 * zoom,
      46,
      40,
      12,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom
    );

    // Orange trim bands on foundation
    ctx.strokeStyle = "#e06000";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 21 * zoom, bY + 12 * zoom);
    ctx.lineTo(bX + 4 * zoom, bY + 16 * zoom);
    ctx.stroke();
    // Bronze rivets (less intense than gold)
    ctx.fillStyle = "#c9a227";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 17 * zoom + i * 5 * zoom,
        bY + 13 * zoom - i * 0.5 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // === SPEAR RACK (Left side - on platform) ===
    const spearRackX = bX - 20 * zoom;
    const spearRackY = bY + 6 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(
      spearRackX - 2 * zoom,
      spearRackY - 16 * zoom,
      4 * zoom,
      20 * zoom
    );
    ctx.fillRect(
      spearRackX - 5 * zoom,
      spearRackY - 16 * zoom,
      10 * zoom,
      3 * zoom
    );
    // Spears on rack
    for (let i = 0; i < 3; i++) {
      const sx = spearRackX - 3 * zoom + i * 3 * zoom;
      ctx.strokeStyle = "#6a5030";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(sx, spearRackY - 14 * zoom);
      ctx.lineTo(sx, spearRackY - 30 * zoom);
      ctx.stroke();
      // Spear tips
      ctx.fillStyle = "#c0c0c0";
      ctx.beginPath();
      ctx.moveTo(sx, spearRackY - 33 * zoom);
      ctx.lineTo(sx - 2 * zoom, spearRackY - 28 * zoom);
      ctx.lineTo(sx + 2 * zoom, spearRackY - 28 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // === LEFT HORSE STABLE ===
    const lwX = bX - 16 * zoom;
    const lwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      lwX,
      lwY,
      14,
      12,
      24,
      { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" },
      zoom
    );
    drawSlopedRoof(
      lwX,
      lwY - 24 * zoom,
      18,
      15,
      12,
      "#4a4a52",
      "#3a3a42",
      "#5a5a62"
    );
    // Stable door
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(lwX - 5 * zoom, lwY - 16 * zoom, 8 * zoom, 16 * zoom);
    ctx.strokeStyle = "#e06000";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(lwX - 4.5 * zoom, lwY - 15.5 * zoom, 7 * zoom, 7 * zoom);
    // War horse head
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.ellipse(
      lwX - 1 * zoom,
      lwY - 11 * zoom,
      3.5 * zoom,
      2.8 * zoom,
      -0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Orange eye (subtle)
    ctx.fillStyle = "#e07000";
    ctx.beginPath();
    ctx.arc(lwX + 0.5 * zoom, lwY - 11.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Bronze horseshoe
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      lwX - 1 * zoom,
      lwY - 20 * zoom,
      3 * zoom,
      0.3 * Math.PI,
      0.7 * Math.PI,
      true
    );
    ctx.stroke();
    // Orange pennant
    const lwFlagWave = Math.sin(time * 4) * 2;
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(lwX + 2 * zoom, lwY - 34 * zoom);
    ctx.lineTo(lwX + 2 * zoom, lwY - 44 * zoom);
    ctx.quadraticCurveTo(
      lwX + 8 * zoom + lwFlagWave,
      lwY - 42 * zoom,
      lwX + 10 * zoom + lwFlagWave,
      lwY - 40 * zoom
    );
    ctx.lineTo(lwX + 2 * zoom, lwY - 38 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b89227";
    ctx.fillRect(lwX + 1 * zoom, lwY - 46 * zoom, 2 * zoom, 14 * zoom);

    // === RIGHT HORSE STABLE ===
    const rwX = bX + 20 * zoom;
    const rwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      rwX,
      rwY,
      14,
      12,
      24,
      { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" },
      zoom
    );
    drawSlopedRoof(
      rwX,
      rwY - 24 * zoom,
      18,
      15,
      12,
      "#4a4a52",
      "#3a3a42",
      "#5a5a62"
    );
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(rwX - 2 * zoom, rwY - 16 * zoom, 8 * zoom, 16 * zoom);
    // White horse
    ctx.fillStyle = "#b0b0b0";
    ctx.beginPath();
    ctx.ellipse(
      rwX + 2 * zoom,
      rwY - 11 * zoom,
      3.5 * zoom,
      2.8 * zoom,
      0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#e07000";
    ctx.beginPath();
    ctx.arc(rwX + 4 * zoom, rwY - 11.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Orange pennant
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(rwX - 2 * zoom, rwY - 34 * zoom);
    ctx.lineTo(rwX - 2 * zoom, rwY - 44 * zoom);
    ctx.quadraticCurveTo(
      rwX + 4 * zoom + lwFlagWave,
      rwY - 42 * zoom,
      rwX + 6 * zoom + lwFlagWave,
      rwY - 40 * zoom
    );
    ctx.lineTo(rwX - 2 * zoom, rwY - 38 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b89227";
    ctx.fillRect(rwX - 3 * zoom, rwY - 46 * zoom, 2 * zoom, 14 * zoom);

    // Heavy machinery - gear cluster (bronze, not gold)
    const fGearX = bX + 14 * zoom;
    const fGearY = bY + 9 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.15;
      const r = i % 2 === 0 ? 5 * zoom : 4 * zoom;
      const gx = fGearX + Math.cos(angle) * r;
      const gy = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steam pipes on foundation
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 24 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX - 24 * zoom, bY - 8 * zoom);
    ctx.quadraticCurveTo(
      bX - 24 * zoom,
      bY - 16 * zoom,
      bX - 16 * zoom,
      bY - 16 * zoom
    );
    ctx.stroke();
    // Bronze pipe joints
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.arc(bX - 24 * zoom, bY + 10 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 24 * zoom, bY - 8 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Steam exhaust with orange glow
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.ellipse(
      bX - 16 * zoom,
      bY + 12 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    const fireGlow = 0.5 + Math.sin(time * 6) * 0.25;
    ctx.fillStyle = `rgba(224, 96, 0, ${fireGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 16 * zoom,
      bY + 12 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Steam
    const fSteam = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${fSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX - 16 * zoom + Math.sin(time * 2) * 2,
      bY + 4 * zoom,
      5 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // === MAIN FORTRESS ===
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      34,
      28,
      38,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom
    );

    // Orange trim bands on walls
    ctx.strokeStyle = "#e06000";
    ctx.lineWidth = 2.5 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 15 * zoom, bY - 10 * zoom - i * 10 * zoom);
      ctx.lineTo(bX + 2 * zoom, bY - 7 * zoom - i * 10 * zoom);
      ctx.stroke();
    }

    // Decorative crossed spears emblem on wall
    ctx.strokeStyle = "#a88217";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 10 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 30 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX + 2 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 30 * zoom);
    ctx.stroke();
    // Shield behind spears
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(bX - 4 * zoom, bY - 28 * zoom);
    ctx.lineTo(bX - 8 * zoom, bY - 22 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 16 * zoom);
    ctx.lineTo(bX, bY - 22 * zoom);
    ctx.closePath();
    ctx.fill();

    // Battlements with bronze caps
    const keepTop = bY - 38 * zoom;
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        drawIsometricPrism(
          ctx,
          bX - 14 * zoom + i * 6 * zoom,
          keepTop,
          5,
          4,
          6,
          { top: "#b89227", left: "#6a6a72", right: "#5a5a62" },
          zoom
        );
      }
    }

    // Left watchtower
    const ltX = bX - 18 * zoom;
    const ltY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      ltX,
      ltY,
      12,
      10,
      48,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom
    );
    // Tower orange bands
    ctx.strokeStyle = "#e06000";
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(ltX - 5 * zoom, ltY - 12 * zoom - i * 12 * zoom);
      ctx.lineTo(ltX + 5 * zoom, ltY - 10 * zoom - i * 12 * zoom);
      ctx.stroke();
    }
    // Conical roof
    const ltRoofY = ltY - 48 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX - 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Bronze spike finial
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 22 * zoom);
    ctx.lineTo(ltX - 2 * zoom, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 2 * zoom, ltRoofY - 14 * zoom);
    ctx.closePath();
    ctx.fill();
    // Orange royal banner
    const flagWave = Math.sin(time * 4) * 2;
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 24 * zoom);
    ctx.lineTo(ltX, ltRoofY - 38 * zoom);
    ctx.quadraticCurveTo(
      ltX + 10 * zoom + flagWave,
      ltRoofY - 36 * zoom,
      ltX + 12 * zoom + flagWave,
      ltRoofY - 33 * zoom
    );
    ctx.lineTo(ltX, ltRoofY - 30 * zoom);
    ctx.closePath();
    ctx.fill();

    // Right armory tower (taller)
    const rtX = bX + 18 * zoom;
    const rtY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      rtX,
      rtY,
      14,
      12,
      54,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom
    );
    // Tower machinery - bronze gears
    const tGearX = rtX - 4 * zoom;
    const tGearY = rtY - 22 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.4;
      const r = i % 2 === 0 ? 5 * zoom : 3.8 * zoom;
      const gx = tGearX + Math.cos(angle) * r;
      const gy = tGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(tGearX, tGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tower spire
    const rtRoofY = rtY - 54 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX - 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 4 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 4 * zoom);
    ctx.closePath();
    ctx.fill();
    // Bronze finial
    ctx.fillStyle = "#b89227";
    ctx.fillRect(rtX - 1.5 * zoom, rtRoofY - 26 * zoom, 3 * zoom, 10 * zoom);
    ctx.fillRect(rtX - 4 * zoom, rtRoofY - 23 * zoom, 8 * zoom, 3 * zoom);

    // Glowing forge window (orange)
    const forgeGlow = 0.5 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(224, 120, 0, ${forgeGlow})`;
    ctx.beginPath();
    ctx.arc(rtX - 3 * zoom, rtY - 38 * zoom, 5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Main entrance
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(bX - 7 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 7 * zoom, bY - 20 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 20 * zoom, 5 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 3 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Bronze arch
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 2 * zoom, bY - 20 * zoom, 5.5 * zoom, Math.PI, 0);
    ctx.stroke();
    // Interior orange glow
    const intGlow = 0.4 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(224, 120, 0, ${intGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 2 * zoom,
      bY - 10 * zoom,
      4 * zoom,
      8 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Sign - bronze plate
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(bX - 14 * zoom, bY + 12 * zoom, 28 * zoom, 10 * zoom);
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(bX - 14 * zoom, bY + 12 * zoom, 28 * zoom, 10 * zoom);
    ctx.fillStyle = "#e06000";
    ctx.font = `bold ${4 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("CAVALRY", bX, bY + 19 * zoom);
  }

  // ========== STATION DETAILS (Gears, Steam, Signs) ==========

  // Animated gear decoration (on platform edge)
  const gearX = screenPos.x + 20 * zoom;
  const gearY = screenPos.y + 2 * zoom;
  const gearSize = 4 + tower.level * 0.5;
  const gearColor =
    tower.level >= 4 ? "#c9a227" : tower.level >= 3 ? "#8a8a92" : "#6a5a4a";
  const gearTeeth = 8 + tower.level;

  // Main gear
  ctx.fillStyle = gearColor;
  ctx.beginPath();
  for (let i = 0; i < gearTeeth; i++) {
    const angle = (i / gearTeeth) * Math.PI * 2 + time * 0.5;
    const outerR = gearSize * zoom;
    const innerR = gearSize * 0.7 * zoom;
    const toothAngle = (0.5 / gearTeeth) * Math.PI * 2;

    if (i === 0) {
      ctx.moveTo(
        gearX + Math.cos(angle) * outerR,
        gearY + Math.sin(angle) * outerR * 0.5
      );
    }
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle * 0.3) * outerR,
      gearY + Math.sin(angle + toothAngle * 0.3) * outerR * 0.5
    );
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle * 0.7) * innerR,
      gearY + Math.sin(angle + toothAngle * 0.7) * innerR * 0.5
    );
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle) * innerR,
      gearY + Math.sin(angle + toothAngle) * innerR * 0.5
    );
  }
  ctx.closePath();
  ctx.fill();
  // Gear center
  ctx.fillStyle = tower.level >= 4 ? "#b8860b" : "#4a4a4a";
  ctx.beginPath();
  ctx.ellipse(
    gearX,
    gearY,
    gearSize * 0.3 * zoom,
    gearSize * 0.15 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Small secondary gear
  const gear2X = gearX - 6 * zoom;
  const gear2Y = gearY + 3 * zoom;
  const gear2Size = gearSize * 0.6;
  ctx.fillStyle = gearColor;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - time * 0.8;
    const outerR = gear2Size * zoom;
    const innerR = gear2Size * 0.65 * zoom;
    const toothAngle = (0.5 / 6) * Math.PI * 2;

    if (i === 0) {
      ctx.moveTo(
        gear2X + Math.cos(angle) * outerR,
        gear2Y + Math.sin(angle) * outerR * 0.5
      );
    }
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle * 0.3) * outerR,
      gear2Y + Math.sin(angle + toothAngle * 0.3) * outerR * 0.5
    );
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle * 0.7) * innerR,
      gear2Y + Math.sin(angle + toothAngle * 0.7) * innerR * 0.5
    );
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle) * innerR,
      gear2Y + Math.sin(angle + toothAngle) * innerR * 0.5
    );
  }
  ctx.closePath();
  ctx.fill();

  // Steam vents (puffing steam)
  const ventX = screenPos.x - 28 * zoom;
  const ventY = screenPos.y - 5 * zoom;

  // Vent pipe
  ctx.fillStyle = tower.level >= 3 ? "#5a5a62" : "#6b5030";
  ctx.beginPath();
  ctx.ellipse(ventX, ventY + 2 * zoom, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(ventX - 1.5 * zoom, ventY, 3 * zoom, 3 * zoom);

  // Steam puffs
  const steamPhase = (time * 2) % 3;
  const steamAlpha =
    steamPhase < 1 ? steamPhase : steamPhase < 2 ? 1 : 3 - steamPhase;
  if (steamAlpha > 0.1) {
    ctx.fillStyle = `rgba(200, 200, 200, ${steamAlpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(
      ventX + Math.sin(time * 2) * 2,
      ventY - 4 * zoom - steamPhase * 3 * zoom,
      (2 + steamPhase) * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = `rgba(180, 180, 180, ${steamAlpha * 0.25})`;
    ctx.beginPath();
    ctx.arc(
      ventX + Math.sin(time * 2 + 1) * 3,
      ventY - 8 * zoom - steamPhase * 4 * zoom,
      (1.5 + steamPhase * 0.8) * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Pressure gauge (on station wall)
  const gaugeX = screenPos.x - 22 * zoom;
  const gaugeY = screenPos.y - 20 * zoom;

  // Gauge body
  ctx.fillStyle = tower.level >= 4 ? "#b8860b" : "#8b7355";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0f0e8";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Gauge markings
  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 0.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI + Math.PI;
    ctx.beginPath();
    ctx.moveTo(
      gaugeX + Math.cos(angle) * 2.2 * zoom,
      gaugeY + Math.sin(angle) * 2.2 * zoom
    );
    ctx.lineTo(
      gaugeX + Math.cos(angle) * 2.8 * zoom,
      gaugeY + Math.sin(angle) * 2.8 * zoom
    );
    ctx.stroke();
  }

  // Gauge needle (animated)
  const needleAngle =
    Math.PI + Math.PI * 0.2 + Math.sin(time * 2) * 0.3 + Math.PI * 0.5;
  ctx.strokeStyle = "#cc0000";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(
    gaugeX + Math.cos(needleAngle) * 2.5 * zoom,
    gaugeY + Math.sin(needleAngle) * 2.5 * zoom
  );
  ctx.stroke();

  // Gauge center cap
  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 0.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // "ON TIME" sign board
  const signX = screenPos.x + 27 * zoom;
  const signY = screenPos.y - 12 * zoom;

  // Sign post
  ctx.fillStyle = tower.level >= 4 ? "#c9a227" : "#5a4a3a";
  ctx.fillRect(signX - 1 * zoom, signY, 2 * zoom, 18 * zoom);

  // Sign board
  ctx.fillStyle = tower.level >= 4 ? "#2a2a32" : "#3a3a3a";
  ctx.fillRect(signX - 8 * zoom, signY - 8 * zoom, 16 * zoom, 8 * zoom);
  ctx.strokeStyle = tower.level >= 4 ? "#c9a227" : "#e06000";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(signX - 8 * zoom, signY - 8 * zoom, 16 * zoom, 8 * zoom);

  // "ON TIME" text with glow
  const onTimeGlow = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(0, 255, 100, ${onTimeGlow})`;
  ctx.shadowColor = "#00ff64";
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `bold ${3.5 * zoom}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("ON TIME", signX, signY - 3 * zoom);
  ctx.shadowBlur = 0;

  // Small indicator lights on sign
  for (let i = 0; i < 3; i++) {
    const lightX = signX - 5 * zoom + i * 5 * zoom;
    const lightY = signY - 1 * zoom;
    const lightOn = Math.sin(time * 4 + i * 0.5) > 0;
    ctx.fillStyle = lightOn ? "#00ff64" : "#1a3a1a";
    ctx.beginPath();
    ctx.arc(lightX, lightY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level-specific station extras
  if (tower.level >= 2) {
    // Extra pipes
    ctx.strokeStyle = tower.level >= 4 ? "#b8860b" : "#6a6a72";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 25 * zoom, screenPos.y);
    ctx.quadraticCurveTo(
      screenPos.x - 30 * zoom,
      screenPos.y - 10 * zoom,
      screenPos.x - 28 * zoom,
      screenPos.y - 5 * zoom
    );
    ctx.stroke();
  }

  if (tower.level >= 3) {
    // Extra gear cluster
    const clusterX = screenPos.x - 30 * zoom;
    const clusterY = screenPos.y + 8 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    ctx.arc(clusterX, clusterY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(
      clusterX + 3 * zoom,
      clusterY + 1.5 * zoom,
      1.8 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  if (tower.level === 4) {
    // Royal crest on station
    const crestX = screenPos.x - 5 * zoom;
    const crestY = screenPos.y - 35 * zoom;
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(crestX, crestY - 5 * zoom);
    ctx.lineTo(crestX - 4 * zoom, crestY);
    ctx.lineTo(crestX - 3 * zoom, crestY + 2 * zoom);
    ctx.lineTo(crestX, crestY + 5 * zoom);
    ctx.lineTo(crestX + 3 * zoom, crestY + 2 * zoom);
    ctx.lineTo(crestX + 4 * zoom, crestY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Crown on crest
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(crestX - 2 * zoom, crestY - 1 * zoom);
    ctx.lineTo(crestX - 1 * zoom, crestY - 3 * zoom);
    ctx.lineTo(crestX, crestY - 1.5 * zoom);
    ctx.lineTo(crestX + 1 * zoom, crestY - 3 * zoom);
    ctx.lineTo(crestX + 2 * zoom, crestY - 1 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // ========== DETAILED ISOMETRIC TRAINS ==========
  // CORRECT LAYERING: Draw cab FIRST (bottom-right), then boiler, then tender LAST (top-left)
  // This makes tender appear "in front" visually
  const trainAnimProgress = tower.trainAnimProgress || 0;
  const trainVisible = trainAnimProgress > 0 && trainAnimProgress < 1;

  if (trainVisible) {
    let trainT = 0;
    let trainAlpha = 1;

    if (trainAnimProgress < 0.25) {
      trainT = 0.45 - (trainAnimProgress / 0.25) * 0.45;
      trainAlpha = Math.min(1, trainAnimProgress / 0.15);
    } else if (trainAnimProgress < 0.75) {
      trainT = 0;
      trainAlpha = 1;
    } else {
      trainT = -((trainAnimProgress - 0.75) / 0.25) * 0.45;
      trainAlpha = Math.max(0, 1 - (trainAnimProgress - 0.75) / 0.2);
    }

    const trackLen = baseW * 0.9 * zoom;
    const trainX = screenPos.x + trackLen * trainT;
    const trainY = screenPos.y - trackLen * trainT * 0.5 - 6 * zoom;

    ctx.save();
    ctx.globalAlpha = trainAlpha;

    // Isometric offset - positive = toward bottom-right (front), negative = toward top-left (back)
    const isoOffset = (baseX: number, baseY: number, offset: number) => ({
      x: baseX + offset * zoom,
      y: baseY - offset * zoom * 0.5,
    });

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(
      trainX,
      trainY + 10 * zoom,
      18 * zoom,
      8 * zoom,
      -0.46,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Improved wheel helper - more realistic train wheel
    const drawWheel = (
      wx: number,
      wy: number,
      r: number,
      mainColor: string,
      rimColor: string
    ) => {
      // Wheel outer rim
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = rimColor;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(wx, wy, r * zoom, r * zoom * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner wheel face
      ctx.fillStyle = rimColor;
      ctx.beginPath();
      ctx.ellipse(wx, wy, r * zoom * 0.7, r * zoom * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spokes
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 1 * zoom;
      const spokeCount = 5;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2 + time * 3;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(
          wx + Math.cos(angle) * r * zoom * 0.6,
          wy + Math.sin(angle) * r * zoom * 0.3
        );
        ctx.stroke();
      }

      // Center hub
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.ellipse(wx, wy, r * zoom * 0.2, r * zoom * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    if (tower.level === 1) {
      // ========== LEVEL 1: Wooden Steam Train ==========
      const cabPos = isoOffset(trainX, trainY, 6); // Front (draw first)
      const boilerPos = isoOffset(trainX, trainY, 0); // Middle
      const tenderPos = isoOffset(trainX, trainY, -6); // Back (draw last, appears in front)

      // Wheels - positioned under each car
      const wheelY = trainY + 4 * zoom;
      // Front wheels (under cab)
      drawWheel(
        isoOffset(trainX, wheelY, 8).x,
        isoOffset(trainX, wheelY, 8).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a"
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a"
      );
      // Rear wheels (under tender)
      drawWheel(
        isoOffset(trainX, wheelY, -3).x,
        isoOffset(trainX, wheelY, -3).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a"
      );
      drawWheel(
        isoOffset(trainX, wheelY, -8).x,
        isoOffset(trainX, wheelY, -8).y,
        3.5,
        "#5a4a3a",
        "#3a2a1a"
      );

      // === CAB (front, draw first) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        10,
        9,
        14,
        { top: "#6b5030", left: "#5a4020", right: "#4a3010" },
        zoom
      );
      // Cab roof
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y - 14 * zoom,
        12,
        11,
        2,
        { top: "#5a4020", left: "#4a3010", right: "#3a2000" },
        zoom
      );
      // Cab window
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(
        cabPos.x + 2 * zoom,
        cabPos.y - 11 * zoom,
        4 * zoom,
        5 * zoom
      );
      const cabGlow = 0.5 + Math.sin(time * 2) * 0.2;
      ctx.fillStyle = `rgba(255, 200, 100, ${cabGlow})`;
      ctx.fillRect(
        cabPos.x + 2.5 * zoom,
        cabPos.y - 10.5 * zoom,
        3 * zoom,
        4 * zoom
      );
      // Side window
      const sideWin = isoOffset(cabPos.x, cabPos.y - 9 * zoom, -3);
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.arc(sideWin.x, sideWin.y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 200, 100, ${cabGlow * 0.7})`;
      ctx.beginPath();
      ctx.arc(sideWin.x, sideWin.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // === BOILER (middle) ===
      drawIsometricPrism(
        ctx,
        boilerPos.x,
        boilerPos.y,
        10,
        9,
        10,
        { top: "#6b5535", left: "#5a4525", right: "#4a3515" },
        zoom
      );
      // Boiler cylinder top
      ctx.fillStyle = "#5a4525";
      ctx.beginPath();
      ctx.ellipse(
        boilerPos.x,
        boilerPos.y - 8 * zoom,
        4 * zoom,
        2.5 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Boiler bands
      ctx.strokeStyle = "#8b7355";
      ctx.lineWidth = 1.5 * zoom;
      for (let i = 0; i < 2; i++) {
        const bandY = boilerPos.y - 4 * zoom - i * 4 * zoom;
        ctx.beginPath();
        ctx.moveTo(boilerPos.x - 4 * zoom, bandY + 2 * zoom);
        ctx.lineTo(boilerPos.x + 4 * zoom, bandY - 2 * zoom);
        ctx.stroke();
      }
      // Dome
      ctx.fillStyle = "#7a6545";
      ctx.beginPath();
      ctx.arc(boilerPos.x, boilerPos.y - 12 * zoom, 3 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#6a5535";
      ctx.beginPath();
      ctx.ellipse(
        boilerPos.x,
        boilerPos.y - 12 * zoom,
        3 * zoom,
        1.5 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Smokestack
      const stackPos = isoOffset(boilerPos.x, boilerPos.y - 10 * zoom, 3);
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 2.5 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 3 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 10 * zoom,
        3.5 * zoom,
        1.8 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Steam
      const steam = 0.4 + Math.sin(time * 4) * 0.2;
      ctx.fillStyle = `rgba(220, 220, 220, ${steam})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 16 * zoom,
        5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Headlight
      const lightPos = isoOffset(boilerPos.x, boilerPos.y - 5 * zoom, 5);
      ctx.fillStyle = "#8b7355";
      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 250, 200, ${0.6 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Bell
      const bellPos = isoOffset(boilerPos.x, boilerPos.y - 14 * zoom, 0);
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(bellPos.x, bellPos.y, 2 * zoom, 0, Math.PI);
      ctx.fill();

      // === TENDER (back, draw last - appears in front) ===
      drawIsometricPrism(
        ctx,
        tenderPos.x,
        tenderPos.y,
        10,
        9,
        8,
        { top: "#7a6040", left: "#5a4020", right: "#4a3010" },
        zoom
      );
      // Coal pile
      ctx.fillStyle = "#1a1008";
      ctx.beginPath();
      ctx.ellipse(
        tenderPos.x,
        tenderPos.y - 8 * zoom,
        4 * zoom,
        2.5 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Coal lumps
      ctx.fillStyle = "#2a2010";
      for (let i = 0; i < 6; i++) {
        const cx = tenderPos.x + Math.sin(i * 1.5) * 3 * zoom;
        const cy = tenderPos.y - 8.5 * zoom + Math.cos(i * 2) * 1 * zoom;
        ctx.beginPath();
        ctx.arc(cx, cy, 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Tender sides
      ctx.strokeStyle = "#4a3010";
      ctx.lineWidth = 1.5 * zoom;
      ctx.strokeRect(
        tenderPos.x - 4 * zoom,
        tenderPos.y - 8 * zoom,
        8 * zoom,
        1 * zoom
      );

      // === ORANGE STRIPE (runs along whole train) ===
      ctx.strokeStyle = "#e06000";
      ctx.lineWidth = 2.5 * zoom;
      const stripeY = trainY - 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        isoOffset(trainX, stripeY, -10).x,
        isoOffset(trainX, stripeY, -10).y
      );
      ctx.lineTo(
        isoOffset(trainX, stripeY, 10).x,
        isoOffset(trainX, stripeY, 10).y
      );
      ctx.stroke();

      // Cowcatcher at very front
      const cowPos = isoOffset(cabPos.x, cabPos.y, 6);
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(cowPos.x, cowPos.y + 4 * zoom);
      ctx.lineTo(cowPos.x - 4 * zoom, cowPos.y);
      ctx.lineTo(cowPos.x + 4 * zoom, cowPos.y - 2 * zoom);
      ctx.closePath();
      ctx.fill();
    } else if (tower.level === 2) {
      // ========== LEVEL 2: Armored Military Train ==========
      const cabPos = isoOffset(trainX, trainY, 7);
      const locoPos = isoOffset(trainX, trainY, 0);
      const cargoPos = isoOffset(trainX, trainY, -7);

      // Wheels
      const wheelY = trainY + 4 * zoom;
      drawWheel(
        isoOffset(trainX, wheelY, 10).x,
        isoOffset(trainX, wheelY, 10).y,
        4,
        "#5a5a62",
        "#3a3a42"
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        4,
        "#5a5a62",
        "#3a3a42"
      );
      drawWheel(
        isoOffset(trainX, wheelY, -3).x,
        isoOffset(trainX, wheelY, -3).y,
        4,
        "#5a5a62",
        "#3a3a42"
      );
      drawWheel(
        isoOffset(trainX, wheelY, -10).x,
        isoOffset(trainX, wheelY, -10).y,
        4,
        "#5a5a62",
        "#3a3a42"
      );

      // === CAB (front, first) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        11,
        10,
        14,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom
      );
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y - 14 * zoom,
        13,
        12,
        2,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom
      );
      // Vision slit
      ctx.fillStyle = "#2a2a32";
      ctx.fillRect(
        cabPos.x + 2 * zoom,
        cabPos.y - 11 * zoom,
        5 * zoom,
        2 * zoom
      );
      // Periscope
      drawIsometricPrism(
        ctx,
        isoOffset(cabPos.x, cabPos.y - 16 * zoom, 2).x,
        isoOffset(cabPos.x, cabPos.y - 16 * zoom, 2).y,
        3,
        3,
        6,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom
      );
      // Front armor
      const frontArmor = isoOffset(cabPos.x, cabPos.y, 7);
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(frontArmor.x - 5 * zoom, frontArmor.y - 6 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 11 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 2 * zoom);
      ctx.lineTo(frontArmor.x - 5 * zoom, frontArmor.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        12,
        10,
        12,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom
      );
      // Armored boiler
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.ellipse(
        locoPos.x,
        locoPos.y - 10 * zoom,
        4.5 * zoom,
        2.8 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Smokestack with cap
      const stackPos = isoOffset(locoPos.x, locoPos.y - 12 * zoom, 0);
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 2.5 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 2 * zoom, stackPos.y - 8 * zoom);
      ctx.lineTo(stackPos.x + 2 * zoom, stackPos.y - 8 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y - 8 * zoom,
        6,
        5,
        2,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom
      );
      // Steam
      const steam = 0.35 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(180, 180, 180, ${steam})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 14 * zoom,
        5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Headlight
      const lightPos = isoOffset(locoPos.x, locoPos.y - 7 * zoom, 6);
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 250, 200, ${0.5 + Math.sin(time * 3) * 0.2})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(lightPos.x, lightPos.y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // === CARGO (back, last) ===
      drawIsometricPrism(
        ctx,
        cargoPos.x,
        cargoPos.y,
        12,
        10,
        10,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom
      );
      // Rivets
      ctx.fillStyle = "#8a8a92";
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.beginPath();
          ctx.arc(
            cargoPos.x - 4 * zoom + col * 3 * zoom,
            cargoPos.y - 3 * zoom - row * 4 * zoom + col * 0.5 * zoom,
            1 * zoom,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
      // Arrow slits
      ctx.fillStyle = "#2a2a32";
      ctx.fillRect(
        cargoPos.x - 1 * zoom,
        cargoPos.y - 7 * zoom,
        2 * zoom,
        5 * zoom
      );
      // Shield emblem
      ctx.fillStyle = "#e06000";
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 4 * zoom;
      const shield = isoOffset(cargoPos.x, cargoPos.y - 5 * zoom, -4);
      ctx.beginPath();
      ctx.moveTo(shield.x, shield.y - 4 * zoom);
      ctx.lineTo(shield.x - 3 * zoom, shield.y);
      ctx.lineTo(shield.x, shield.y + 4 * zoom);
      ctx.lineTo(shield.x + 3 * zoom, shield.y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Orange stripe
      ctx.strokeStyle = "#e06000";
      ctx.lineWidth = 3 * zoom;
      const stripeY = trainY - 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        isoOffset(trainX, stripeY, -12).x,
        isoOffset(trainX, stripeY, -12).y
      );
      ctx.lineTo(
        isoOffset(trainX, stripeY, 12).x,
        isoOffset(trainX, stripeY, 12).y
      );
      ctx.stroke();
    } else if (tower.level === 3) {
      // ========== LEVEL 3: Fortress War Train ==========
      const cabPos = isoOffset(trainX, trainY, 8);
      const locoPos = isoOffset(trainX, trainY, 0);
      const fortressPos = isoOffset(trainX, trainY, -8);

      // Wheels
      const wheelY = trainY + 4 * zoom;
      drawWheel(
        isoOffset(trainX, wheelY, 12).x,
        isoOffset(trainX, wheelY, 12).y,
        4.5,
        "#5a5a62",
        "#3a3a42"
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        4.5,
        "#5a5a62",
        "#3a3a42"
      );
      drawWheel(
        isoOffset(trainX, wheelY, -4).x,
        isoOffset(trainX, wheelY, -4).y,
        4.5,
        "#5a5a62",
        "#3a3a42"
      );
      drawWheel(
        isoOffset(trainX, wheelY, -12).x,
        isoOffset(trainX, wheelY, -12).y,
        4.5,
        "#5a5a62",
        "#3a3a42"
      );

      // === CAB (front, first) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        12,
        11,
        16,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom
      );
      // Cab battlements
      for (let i = 0; i < 2; i++) {
        const bPos = isoOffset(cabPos.x, cabPos.y - 16 * zoom, -3 + i * 6);
        drawIsometricPrism(
          ctx,
          bPos.x,
          bPos.y,
          3,
          3,
          3,
          { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
          zoom
        );
      }
      // Arrow slit
      ctx.fillStyle = "#2a2a32";
      ctx.fillRect(
        cabPos.x + 3 * zoom,
        cabPos.y - 12 * zoom,
        4 * zoom,
        2 * zoom
      );

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        14,
        12,
        14,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom
      );
      // Tower
      const towerPos = isoOffset(locoPos.x, locoPos.y - 14 * zoom, -2);
      drawIsometricPrism(
        ctx,
        towerPos.x,
        towerPos.y,
        7,
        7,
        12,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom
      );
      // Tower battlements
      for (let i = 0; i < 2; i++) {
        const tbPos = isoOffset(towerPos.x, towerPos.y - 12 * zoom, -2 + i * 4);
        drawIsometricPrism(
          ctx,
          tbPos.x,
          tbPos.y,
          3,
          3,
          3,
          { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
          zoom
        );
      }
      // Smokestack
      const stackPos = isoOffset(locoPos.x, locoPos.y - 14 * zoom, 4);
      // use an isometric prism
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y,
        5,
        5,
        10,
        { top: "#3a3a42", left: "#2a2a32", right: "#1a1a1a" },
        zoom
      );
      // Stack cap
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y - 10 * zoom,
        7,
        7,
        2,
        { top: "#4a4a52", left: "#3a3a42", right: "#2a2a32" },
        zoom
      );
      // Steam
      const steam = 0.35 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(180, 180, 180, ${steam})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 16 * zoom,
        6 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // === FORTRESS CAR (back, last) ===
      drawIsometricPrism(
        ctx,
        fortressPos.x,
        fortressPos.y,
        14,
        12,
        12,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom
      );
      // Battlements
      for (let i = 0; i < 3; i++) {
        const bPos = isoOffset(
          fortressPos.x,
          fortressPos.y - 12 * zoom,
          -4 + i * 4
        );
        drawIsometricPrism(
          ctx,
          bPos.x,
          bPos.y,
          3,
          3,
          4,
          { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
          zoom
        );
      }
      // Portcullis
      ctx.fillStyle = "#2a2a32";
      ctx.fillRect(
        fortressPos.x - 2 * zoom,
        fortressPos.y - 9 * zoom,
        4 * zoom,
        6 * zoom
      );
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(fortressPos.x, fortressPos.y - 9 * zoom);
      ctx.lineTo(fortressPos.x, fortressPos.y - 3 * zoom);
      ctx.stroke();
      // Rose window
      const roseGlow = 0.6 + Math.sin(time * 2) * 0.25;
      ctx.fillStyle = `rgba(255, 108, 0, ${roseGlow})`;
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 10 * zoom;
      const rosePos = isoOffset(fortressPos.x, fortressPos.y - 7 * zoom, -5);
      ctx.beginPath();
      ctx.arc(rosePos.x, rosePos.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Orange stripe
      ctx.strokeStyle = "#e06000";
      ctx.lineWidth = 3.5 * zoom;
      const stripeY = trainY - 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        isoOffset(trainX, stripeY, -14).x,
        isoOffset(trainX, stripeY, -14).y
      );
      ctx.lineTo(
        isoOffset(trainX, stripeY, 14).x,
        isoOffset(trainX, stripeY, 14).y
      );
      ctx.stroke();
    } else if (tower.level === 4 && tower.upgrade === "A") {
      // ========== LEVEL 4A: Royal Marble Train ==========
      const cabPos = isoOffset(trainX, trainY, 7);
      const locoPos = isoOffset(trainX, trainY, 0);
      const passengerPos = isoOffset(trainX, trainY, -7);

      // Gold wheels
      const wheelY = trainY + 4 * zoom;
      const wPositions = [10, 4, -3, -10];
      for (const wp of wPositions) {
        const wPos = isoOffset(trainX, wheelY, wp);
        ctx.fillStyle = "#c9a227";
        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Gold spokes
        ctx.strokeStyle = "#daa520";
        ctx.lineWidth = 1 * zoom;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + time * 2;
          ctx.beginPath();
          ctx.moveTo(wPos.x, wPos.y);
          ctx.lineTo(
            wPos.x + Math.cos(angle) * 3.2 * zoom,
            wPos.y + Math.sin(angle) * 1.6 * zoom
          );
          ctx.stroke();
        }
        ctx.fillStyle = "#b8860b";
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 1.2 * zoom, 0.6 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // === CAB (front, first) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        10,
        10,
        12,
        { top: "#f0ece4", left: "#e0dcd4", right: "#d0ccc4" },
        zoom
      );
      // Domed roof
      ctx.fillStyle = "#e8e4dc";
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 12 * zoom, 5 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();
      // Finial
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 17 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Arched window
      const cabGlow = 0.5 + Math.sin(time * 2) * 0.15;
      ctx.fillStyle = "#c0a080";
      ctx.beginPath();
      ctx.arc(cabPos.x + 2 * zoom, cabPos.y - 8 * zoom, 3 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 250, 230, ${cabGlow})`;
      ctx.beginPath();
      ctx.arc(cabPos.x + 2 * zoom, cabPos.y - 8 * zoom, 2.5 * zoom, Math.PI, 0);
      ctx.fill();

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        12,
        10,
        12,
        { top: "#f8f4ec", left: "#e8e4dc", right: "#d8d4cc" },
        zoom
      );
      // Gold bands
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      for (let i = 0; i < 2; i++) {
        const bandY = locoPos.y - 5 * zoom - i * 5 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x - 5 * zoom, bandY + 2.5 * zoom);
        ctx.lineTo(locoPos.x + 5 * zoom, bandY - 2.5 * zoom);
        ctx.stroke();
      }
      // Marble dome
      ctx.fillStyle = "#e8e4dc";
      ctx.beginPath();
      ctx.arc(locoPos.x, locoPos.y - 14 * zoom, 3.5 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();
      // Gold smokestack
      const stackPos = isoOffset(locoPos.x, locoPos.y - 12 * zoom, 3);
      ctx.fillStyle = "#daa520";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 2.5 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 3 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 10 * zoom,
        3.5 * zoom,
        1.8 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      // Golden steam
      const steam = 0.3 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(255, 245, 220, ${steam})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 16 * zoom,
        5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // === PASSENGER CAR (back, last) ===
      drawIsometricPrism(
        ctx,
        passengerPos.x,
        passengerPos.y,
        12,
        10,
        10,
        { top: "#f0ece4", left: "#e0dcd4", right: "#d0ccc4" },
        zoom
      );
      // Gold columns
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 3 * zoom;
      const col1 = isoOffset(passengerPos.x, passengerPos.y, -3);
      const col2 = isoOffset(passengerPos.x, passengerPos.y, 3);
      ctx.fillRect(col1.x - 1 * zoom, col1.y - 10 * zoom, 2 * zoom, 10 * zoom);
      ctx.fillRect(col2.x - 1 * zoom, col2.y - 10 * zoom, 2 * zoom, 10 * zoom);
      ctx.shadowBlur = 0;
      // Arched window
      const winGlow = 0.5 + Math.sin(time * 2) * 0.15;
      ctx.fillStyle = "#c0a080";
      ctx.beginPath();
      ctx.arc(passengerPos.x, passengerPos.y - 6 * zoom, 3 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = `rgba(200, 230, 255, ${winGlow})`;
      ctx.beginPath();
      ctx.arc(
        passengerPos.x,
        passengerPos.y - 6 * zoom,
        2.5 * zoom,
        Math.PI,
        0
      );
      ctx.fill();
      // Horse emblem
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      const horsePos = isoOffset(passengerPos.x, passengerPos.y - 5 * zoom, -4);
      ctx.beginPath();
      ctx.moveTo(horsePos.x - 2 * zoom, horsePos.y + 2 * zoom);
      ctx.quadraticCurveTo(
        horsePos.x,
        horsePos.y - 3 * zoom,
        horsePos.x + 2 * zoom,
        horsePos.y
      );
      ctx.quadraticCurveTo(
        horsePos.x + 2.5 * zoom,
        horsePos.y + 2 * zoom,
        horsePos.x + 1.5 * zoom,
        horsePos.y + 3 * zoom
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // ========== LEVEL 4B: Royal Armored Train ==========
      const cabPos = isoOffset(trainX, trainY, 8);
      const locoPos = isoOffset(trainX, trainY, 0);
      const armoredPos = isoOffset(trainX, trainY, -8);

      // Wheels with gold trim
      const wheelY = trainY + 4 * zoom;
      const wPositions = [12, 4, -4, -12];
      for (const wp of wPositions) {
        const wPos = isoOffset(trainX, wheelY, wp);
        ctx.fillStyle = "#5a5a62";
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 4.5 * zoom, 2.25 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Spokes
        ctx.strokeStyle = "#4a4a52";
        ctx.lineWidth = 1 * zoom;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + time * 2;
          ctx.beginPath();
          ctx.moveTo(wPos.x, wPos.y);
          ctx.lineTo(
            wPos.x + Math.cos(angle) * 3.6 * zoom,
            wPos.y + Math.sin(angle) * 1.8 * zoom
          );
          ctx.stroke();
        }
        ctx.fillStyle = "#c9a227";
        ctx.beginPath();
        ctx.ellipse(wPos.x, wPos.y, 1.4 * zoom, 0.7 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // === CAB (front, first) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        12,
        12,
        16,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom
      );
      // Crown on cab
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 5 * zoom, cabPos.y - 16 * zoom);
      ctx.lineTo(cabPos.x - 3 * zoom, cabPos.y - 21 * zoom);
      ctx.lineTo(cabPos.x - 1 * zoom, cabPos.y - 17 * zoom);
      ctx.lineTo(cabPos.x + 1 * zoom, cabPos.y - 21 * zoom);
      ctx.lineTo(cabPos.x + 3 * zoom, cabPos.y - 17 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 21 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 16 * zoom);
      ctx.closePath();
      ctx.fill();
      // Crown jewel
      ctx.fillStyle = "#e06000";
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 18 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Vision slit with gold frame
      ctx.fillStyle = "#2a2a32";
      ctx.fillRect(
        cabPos.x + 3 * zoom,
        cabPos.y - 12 * zoom,
        5 * zoom,
        2 * zoom
      );
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.5 * zoom;
      ctx.strokeRect(
        cabPos.x + 2.5 * zoom,
        cabPos.y - 12.5 * zoom,
        6 * zoom,
        3 * zoom
      );

      // === LOCOMOTIVE (middle) ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        14,
        12,
        14,
        { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
        zoom
      );
      // Gold bands
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2.5 * zoom;
      for (let i = 0; i < 2; i++) {
        const bandY = locoPos.y - 5 * zoom - i * 6 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x - 6 * zoom, bandY + 3 * zoom);
        ctx.lineTo(locoPos.x + 6 * zoom, bandY - 3 * zoom);
        ctx.stroke();
      }
      // Armored dome with gold
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(locoPos.x, locoPos.y - 15 * zoom, 4 * zoom, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();
      // Royal smokestack with crown
      const stackPos = isoOffset(locoPos.x, locoPos.y - 14 * zoom, 4);
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 3 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      // Crown on stack
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 3.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x - 2 * zoom, stackPos.y - 14 * zoom);
      ctx.lineTo(stackPos.x, stackPos.y - 11 * zoom);
      ctx.lineTo(stackPos.x + 2 * zoom, stackPos.y - 14 * zoom);
      ctx.lineTo(stackPos.x + 3.5 * zoom, stackPos.y - 10 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // Steam
      const steam = 0.35 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = `rgba(180, 180, 180, ${steam})`;
      ctx.beginPath();
      ctx.arc(
        stackPos.x + Math.sin(time * 3) * 3,
        stackPos.y - 20 * zoom,
        6 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // === ARMORED CAR (back, last) ===
      drawIsometricPrism(
        ctx,
        armoredPos.x,
        armoredPos.y,
        14,
        12,
        12,
        { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
        zoom
      );
      // Gold trim
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(armoredPos.x - 6 * zoom, armoredPos.y - 12 * zoom);
      ctx.lineTo(armoredPos.x + 6 * zoom, armoredPos.y - 12 * zoom + 3 * zoom);
      ctx.stroke();
      // Stained glass window
      const sgGlow = 0.6 + Math.sin(time * 2) * 0.25;
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(
        armoredPos.x,
        armoredPos.y - 6 * zoom,
        4.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = `rgba(255, 150, 50, ${sgGlow})`;
      ctx.shadowColor = "#e06000";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(armoredPos.x, armoredPos.y - 6 * zoom, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Crown emblem
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 6 * zoom;
      const crownPos = isoOffset(armoredPos.x, armoredPos.y - 10 * zoom, 0);
      ctx.beginPath();
      ctx.moveTo(crownPos.x - 5 * zoom, crownPos.y);
      ctx.lineTo(crownPos.x - 3 * zoom, crownPos.y - 4 * zoom);
      ctx.lineTo(crownPos.x - 1 * zoom, crownPos.y - 2 * zoom);
      ctx.lineTo(crownPos.x + 1 * zoom, crownPos.y - 4 * zoom);
      ctx.lineTo(crownPos.x + 3 * zoom, crownPos.y - 2 * zoom);
      ctx.lineTo(crownPos.x + 5 * zoom, crownPos.y - 4 * zoom);
      ctx.lineTo(crownPos.x + 5 * zoom, crownPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Orange stripe
      ctx.strokeStyle = "#e06000";
      ctx.lineWidth = 3.5 * zoom;
      const stripeY = trainY - 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        isoOffset(trainX, stripeY, -14).x,
        isoOffset(trainX, stripeY, -14).y
      );
      ctx.lineTo(
        isoOffset(trainX, stripeY, 14).x,
        isoOffset(trainX, stripeY, 14).y
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  // ========== SPAWN POSITIONS ==========
  const spawnPositions = [
    { x: screenPos.x - 24 * zoom, y: screenPos.y + 22 * zoom },
    { x: screenPos.x, y: screenPos.y + 28 * zoom },
    { x: screenPos.x + 24 * zoom, y: screenPos.y + 22 * zoom },
  ];

  if (tower.showSpawnMarkers || tower.selected) {
    for (let i = 0; i < spawnPositions.length; i++) {
      const pos = spawnPositions[i];
      const occupied = (tower.occupiedSpawnSlots || [])[i];
      const pulse = 0.6 + Math.sin(time * 3 + i) * 0.3;

      ctx.strokeStyle = occupied
        ? `rgba(255, 100, 100, ${pulse * 0.6})`
        : `rgba(255, 108, 0, ${pulse})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 14 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = occupied
        ? "rgba(180, 80, 80, 0.9)"
        : "rgba(200, 100, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${6 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText((i + 1).toString(), pos.x, pos.y + 2 * zoom);
    }
  }

  // ========== SPAWN EFFECT ==========
  if (tower.spawnEffect && tower.spawnEffect > 0) {
    const effectProgress = 1 - tower.spawnEffect / 500;
    ctx.strokeStyle = `rgba(255, 108, 0, ${1 - effectProgress})`;
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 8 * zoom,
      35 * zoom * (1 + effectProgress * 0.6),
      18 * zoom * (1 + effectProgress * 0.6),
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 2;
      const dist = 30 * zoom * (1 + effectProgress * 0.4);
      ctx.fillStyle = `rgba(255, 108, 0, ${(1 - effectProgress) * 0.8})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + Math.cos(angle) * dist,
        screenPos.y + 8 * zoom + Math.sin(angle) * dist * 0.5,
        3 * zoom * (1 - effectProgress),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // ========== PLATFORM LAMPS ==========
  const lampPositions = [
    { x: screenPos.x - 38 * zoom, y: screenPos.y - 30 * zoom },
    { x: screenPos.x + 38 * zoom, y: screenPos.y - 30 * zoom },
  ];

  for (let i = 0; i < lampPositions.length; i++) {
    const lamp = lampPositions[i];

    // Lamp post
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(lamp.x - 2 * zoom, lamp.y, 4 * zoom, 34 * zoom);

    // Lamp head
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(lamp.x - 6 * zoom, lamp.y + 3 * zoom);
    ctx.lineTo(lamp.x - 5 * zoom, lamp.y - 5 * zoom);
    ctx.lineTo(lamp.x + 5 * zoom, lamp.y - 5 * zoom);
    ctx.lineTo(lamp.x + 6 * zoom, lamp.y + 3 * zoom);
    ctx.closePath();
    ctx.fill();

    // Lamp glow (Princeton orange)
    const lampGlow = 0.6 + Math.sin(time * 2.5 + i * Math.PI) * 0.25;
    ctx.fillStyle = `rgba(255, 150, 50, ${lampGlow})`;
    ctx.shadowColor = "#ff9632";
    ctx.shadowBlur = 12 * zoom;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ============================================================================
// RANGE INDICATORS - Only for Library and Arch towers
// ============================================================================
export function renderStationRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower & { isHovered?: boolean },
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  // Only show spawn range when station is hovered or selected
  if (!tower.isHovered && !tower.selected) return;

  const range = tower.spawnRange || 180;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;

  // Use orange color for spawn range
  ctx.strokeStyle = tower.isHovered
    ? "rgba(255, 180, 100, 0.4)"
    : "rgba(255, 180, 100, 0.6)";
  ctx.fillStyle = tower.isHovered
    ? "rgba(255, 180, 100, 0.08)"
    : "rgba(255, 180, 100, 0.15)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    range * zoom * 0.7,
    range * zoom * 0.35,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
}

export function renderTowerRange(
  ctx: CanvasRenderingContext2D,
  tower: Tower & { isHovered?: boolean },
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const tData = TOWER_DATA[tower.type];
  if (tData.range <= 0) return;
  const worldPos = gridToWorld(tower.pos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;

  let range = tData.range;
  if (tower.level === 2) range *= 1.15;
  if (tower.level === 3) {
    if (tower.type === "library" && tower.upgrade === "B") range *= 1.5;
    else range *= 1.25;
  }
  // Level 4 uses the range from TOWER_STATS upgrade paths
  if (tower.level >= 4 && tower.upgrade) {
    const towerStats = TOWER_STATS[tower.type];
    const upgradeRange = towerStats?.upgrades?.[tower.upgrade]?.stats?.range;
    if (upgradeRange !== undefined) {
      range = upgradeRange;
    } else {
      // Fallback: 1.5x base range if no specific range defined
      range = tData.range * 1.5;
    }
  }
  // Apply external range buff (from beacons etc)
  range *= (tower.rangeBoost || 1);

  // Check for range buff
  const hasRangeBuff = (tower.rangeBoost || 1) > 1;

  // Calculate range debuff from active 'blind' debuffs
  let rangeMod = 1.0;
  let hasRangeDebuff = false;
  const now = Date.now();
  if (tower.debuffs && tower.debuffs.length > 0) {
    for (const debuff of tower.debuffs) {
      if (now >= debuff.until) continue;
      if (debuff.type === 'blind') {
        rangeMod *= (1 - debuff.intensity);
        hasRangeDebuff = true;
      }
    }
  }
  // Apply range debuff
  range *= rangeMod;

  // Use different colors based on buff/debuff/hover state
  if (hasRangeDebuff) {
    // Purple/violet color when range is debuffed (blinded)
    if (tower.isHovered) {
      ctx.strokeStyle = "rgba(160, 100, 200, 0.4)";
      ctx.fillStyle = "rgba(160, 100, 200, 0.08)";
    } else {
      ctx.strokeStyle = "rgba(160, 100, 200, 0.6)";
      ctx.fillStyle = "rgba(160, 100, 200, 0.15)";
    }
  } else if (hasRangeBuff) {
    // Cyan/teal color when range is buffed (from beacons etc)
    if (tower.isHovered) {
      ctx.strokeStyle = "rgba(0, 230, 200, 0.4)";
      ctx.fillStyle = "rgba(0, 230, 200, 0.08)";
    } else {
      ctx.strokeStyle = "rgba(0, 230, 200, 0.6)";
      ctx.fillStyle = "rgba(0, 230, 200, 0.15)";
    }
  } else if (tower.isHovered) {
    ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
    ctx.fillStyle = "rgba(100, 200, 255, 0.05)";
  } else {
    ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
    ctx.fillStyle = "rgba(100, 200, 255, 0.1)";
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y,
    range * zoom * 0.7,
    range * zoom * 0.35,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();
}
// ============================================================================
// TOWER PREVIEW
// ============================================================================
export function renderTowerPreview(
  ctx: CanvasRenderingContext2D,
  dragging: DraggingTower,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  towers: Tower[],
  selectedMap: string,
  gridWidth: number = 16,
  gridHeight: number = 10,
  cameraOffset?: Position,
  cameraZoom?: number,
  blockedPositions?: Set<string>
) {
  const zoom = cameraZoom || 1;
  const width = canvasWidth / dpr;
  const height = canvasHeight / dpr;
  const offset = cameraOffset || { x: 0, y: 0 };

  const isoX = (dragging.pos.x - width / 2) / zoom - offset.x;
  const isoY = (dragging.pos.y - height / 3) / zoom - offset.y;
  const worldX = isoX + isoY * 2;
  const worldY = isoY * 2 - isoX;
  const gridPos = {
    x: Math.floor(worldX / TILE_SIZE),
    y: Math.floor(worldY / TILE_SIZE),
  };

  const worldPos = gridToWorld(gridPos);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );

  // Check validity including blocked positions (landmarks and special towers)
  const isValid = isValidBuildPosition(
    gridPos,
    selectedMap,
    towers,
    gridWidth,
    gridHeight,
    40,
    blockedPositions
  );

  // Base indicator
  ctx.fillStyle = isValid
    ? "rgba(100, 255, 100, 0.4)"
    : "rgba(255, 80, 80, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.strokeStyle = isValid
    ? "rgba(50, 200, 50, 0.8)"
    : "rgba(200, 50, 50, 0.8)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    32 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha = 0.75;

  const baseWidth = 34;
  const baseHeight = 28;
  const towerColors = TOWER_COLORS[dragging.type];

  const foundColors = {
    top: isValid ? darkenColor(towerColors.base, 30) : "#993333",
    left: isValid ? darkenColor(towerColors.base, 50) : "#882222",
    right: isValid ? darkenColor(towerColors.base, 40) : "#772222",
  };

  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 8,
    baseWidth + 8,
    6,
    foundColors,
    zoom
  );

  const bodyColors = {
    top: isValid ? lightenColor(towerColors.light, 10) : "#ff6666",
    left: isValid ? towerColors.base : "#dd4444",
    right: isValid ? towerColors.dark : "#bb3333",
  };

  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    baseHeight,
    bodyColors,
    zoom
  );

  ctx.restore();

  // Range preview - show level 1 base range when placing
  const tData = TOWER_DATA[dragging.type];
  if (tData.range > 0) {
    ctx.strokeStyle = isValid
      ? "rgba(100, 200, 255, 0.6)"
      : "rgba(255, 100, 100, 0.6)";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      tData.range * zoom * 0.7,
      tData.range * zoom * 0.35,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (dragging.type === "station" && tData.spawnRange) {
    ctx.strokeStyle = isValid
      ? "rgba(255, 200, 100, 0.5)"
      : "rgba(255, 100, 100, 0.5)";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y,
      tData.spawnRange * zoom * 0.7,
      tData.spawnRange * zoom * 0.35,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
